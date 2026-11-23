import { expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { connectedLessonNotes, type LessonNote } from '../src/teacher/lessonNotes';
const base: LessonNote = { id: 'n', student_id: 'student', author_id: 'teacher', note_text: 'Test', visibility: 'parent', published_at: null, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', revision: 1 };
it('sends expected revisions and only returns scoped notes', async () => {
  const rpc = vi.fn((name: string) => name === 'tutor_lesson_notes_list' ? { order() { return this; }, range: async () => ({ data: [base], error: null }) } : Promise.resolve({ data: name === 'tutor_lesson_note_delete' ? true : [base], error: null }));
  const store = connectedLessonNotes({ rpc } as unknown as SupabaseClient, 'student', 'teacher');
  expect(await store.list()).toEqual([base]);
  await store.save({ text: 'Test', visibility: 'parent' }, base);
  expect(rpc).toHaveBeenCalledWith('tutor_lesson_note_save', { p_student_id: 'student', p_note_id: 'n', p_note_text: 'Test', p_visibility: 'parent', p_expected_revision: 1 });
  await store.setPublication(base, true);
  expect(rpc).toHaveBeenCalledWith('tutor_lesson_note_set_publication', { p_student_id: 'student', p_note_id: 'n', p_publish: true, p_expected_revision: 1 });
  await store.delete(base);
  expect(rpc).toHaveBeenCalledWith('tutor_lesson_note_delete', { p_student_id: 'student', p_note_id: 'n', p_expected_revision: 1 });
});
it('fetches all pages and fails closed on other authors, students, or errors', async () => {
  const page = Array.from({ length: 500 }, (_, i) => ({ ...base, id: `n${i}` }));
  const rpc = vi.fn(() => ({ order() { return this; }, range: async (start: number) => ({ data: start === 0 ? page : [{ ...base, id: 'last' }], error: null }) }));
  expect((await connectedLessonNotes({ rpc } as unknown as SupabaseClient, 'student', 'teacher').list())).toHaveLength(501);
  expect(rpc).toHaveBeenCalledTimes(2);
  for (const result of [{ data: [{ ...base, author_id: 'other' }], error: null }, { data: [{ ...base, student_id: 'other' }], error: null }, { data: null, error: {} }]) {
    const client = { rpc: () => ({ order() { return this; }, range: async () => result }) } as unknown as SupabaseClient;
    await expect(connectedLessonNotes(client, 'student', 'teacher').list()).rejects.toThrow();
  }
});
