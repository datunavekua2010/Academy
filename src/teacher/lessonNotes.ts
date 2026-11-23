import type { SupabaseClient } from '@supabase/supabase-js';

export type NoteVisibility = 'tutor' | 'parent';
export type LessonNote = { id: string; student_id: string; author_id: string; note_text: string; visibility: NoteVisibility; published_at: string | null; created_at: string; updated_at: string; revision: number };
export type NoteInput = { text: string; visibility: NoteVisibility };
export interface LessonNotesStore {
  list(): Promise<LessonNote[]>;
  save(input: NoteInput, existing: LessonNote | null): Promise<LessonNote>;
  setPublication(note: LessonNote, publish: boolean): Promise<LessonNote>;
  delete(note: LessonNote): Promise<void>;
}

function checkedNotes(data: unknown, studentId: string, teacherId: string): LessonNote[] {
  if (!Array.isArray(data)) throw new Error('Invalid notes response');
  return data.map((value: unknown) => {
    if (!value || typeof value !== 'object') throw new Error('Invalid note');
    const n = value as LessonNote;
    if (typeof n.id !== 'string' || n.student_id !== studentId || n.author_id !== teacherId || typeof n.note_text !== 'string' || !n.note_text.trim() || (n.visibility !== 'tutor' && n.visibility !== 'parent') || (n.published_at !== null && typeof n.published_at !== 'string') || (n.visibility === 'tutor' && n.published_at !== null) || typeof n.created_at !== 'string' || typeof n.updated_at !== 'string' || !Number.isSafeInteger(n.revision) || n.revision < 1) throw new Error('Invalid note');
    return n;
  });
}

/** RPCs enforce role, assignment, authorship and revisions in the database. */
export function connectedLessonNotes(client: SupabaseClient, studentId: string, teacherId: string): LessonNotesStore {
  const call = async (name: string, args: Record<string, unknown>) => {
    const { data, error } = await client.rpc(name, args);
    if (error) throw new Error('Notes unavailable');
    return data;
  };
  const one = (data: unknown) => { const rows = checkedNotes(data, studentId, teacherId); if (rows.length !== 1) throw new Error('Note unavailable'); return rows[0]; };
  return {
    list: async () => {
      const notes: LessonNote[] = [], seen = new Set<string>();
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await client.rpc('tutor_lesson_notes_list', { p_student_id: studentId }).order('created_at', { ascending: false }).order('id', { ascending: true }).range(offset, offset + 499);
        if (error) throw new Error('Notes unavailable');
        const page = checkedNotes(data, studentId, teacherId);
        for (const note of page) if (!seen.has(note.id)) { seen.add(note.id); notes.push(note); }
        if (page.length < 500) return notes;
      }
    },
    save: async (input, old) => one(await call('tutor_lesson_note_save', { p_student_id: studentId, p_note_id: old?.id ?? null, p_note_text: input.text, p_visibility: input.visibility, p_expected_revision: old?.revision ?? null })),
    setPublication: async (note, publish) => one(await call('tutor_lesson_note_set_publication', { p_student_id: studentId, p_note_id: note.id, p_publish: publish, p_expected_revision: note.revision })),
    delete: async (note) => { if (await call('tutor_lesson_note_delete', { p_student_id: studentId, p_note_id: note.id, p_expected_revision: note.revision }) !== true) throw new Error('Note unavailable'); },
  };
}

/** Unsaved public demo only. No localStorage, identities, parent access, or persistence. */
export function previewLessonNotes(): LessonNotesStore {
  let rows: LessonNote[] = [];
  const current = (note: LessonNote) => { const row = rows.find((item) => item.id === note.id && item.revision === note.revision); if (!row) throw new Error('Note unavailable or changed'); return row; };
  return {
    list: async () => [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id)),
    save: async (input, old) => {
      if (!input.text.trim() || input.text.length > 2000 || !['tutor', 'parent'].includes(input.visibility)) throw new Error('Invalid note');
      const now = new Date().toISOString();
      const previous = old ? current(old) : null;
      const row: LessonNote = { id: previous?.id ?? crypto.randomUUID(), student_id: 'test-student', author_id: 'test-teacher', note_text: input.text, visibility: input.visibility, published_at: null, created_at: previous?.created_at ?? now, updated_at: now, revision: previous ? previous.revision + 1 : 1 };
      rows = [row, ...rows.filter((item) => item.id !== row.id)];
      return row;
    },
    setPublication: async (note, publish) => {
      const old = current(note);
      if (publish && old.visibility !== 'parent') throw new Error('Invalid publication');
      const changed = publish !== Boolean(old.published_at);
      const row = changed ? { ...old, published_at: publish ? new Date().toISOString() : null, updated_at: new Date().toISOString(), revision: old.revision + 1 } : old;
      rows = rows.map((item) => item.id === row.id ? row : item);
      return row;
    },
    delete: async (note) => { current(note); rows = rows.filter((item) => item.id !== note.id); },
  };
}
