import type { SupabaseClient } from '@supabase/supabase-js';
import type { TeacherStudent } from './data';

export interface Classroom { id: string; name: string; grade: number | null; description: string; archived_at: string | null; created_at: string; revision: number; student_count: number }
export interface ClassroomDetails { name: string; grade: number | null; description: string }
export interface ClassStudent { id: string; name: string }
export interface ClassroomStore {
  list(): Promise<Classroom[]>;
  students(id: string): Promise<ClassStudent[]>;
  save(details: ClassroomDetails, current: Classroom | null): Promise<void>;
  archive(room: Classroom): Promise<void>;
  add(room: Classroom, student: ClassStudent): Promise<void>;
  remove(room: Classroom, student: ClassStudent): Promise<void>;
}

/** Backend functions check the authenticated role, ownership and current assignment. */
export function connectedClassrooms(client: SupabaseClient): ClassroomStore {
  const call = async (name: string, params: Record<string, unknown> = {}) => {
    const { data, error } = await client.rpc(name, params);
    if (error) throw new Error('Classrooms unavailable');
    return data;
  };
  const page = async (name: string, params: Record<string, unknown>, columns: [string, boolean][]) => {
    const all: unknown[] = [];
    for (let offset = 0; ; offset += 500) {
      let request = client.rpc(name, params);
      for (const [column, ascending] of columns) request = request.order(column, { ascending });
      const { data, error } = await request.range(offset, offset + 499);
      if (error || !Array.isArray(data)) throw new Error('Classrooms unavailable');
      all.push(...data);
      if (data.length < 500) return all;
    }
  };
  const requireTrue = async (name: string, args: Record<string, unknown>) => { if (await call(name, args) !== true) throw new Error('Operation failed'); };
  return {
    list: async () => (await page('teacher_classrooms_list', {}, [['created_at', false], ['id', true]])).map((value) => {
      const c = value as Classroom;
      if (!c || typeof c.id !== 'string' || typeof c.name !== 'string' || !(c.grade === null || (Number.isInteger(c.grade) && c.grade >= 1 && c.grade <= 7)) || typeof c.description !== 'string' || !(c.archived_at === null || typeof c.archived_at === 'string') || typeof c.created_at !== 'string' || !Number.isSafeInteger(c.revision) || c.revision < 1 || !Number.isSafeInteger(c.student_count) || c.student_count < 0) throw new Error('Invalid classroom');
      return c;
    }),
    students: async (id) => (await page('teacher_classroom_students', { p_id: id }, [['display_name', true], ['student_id', true]])).map((value) => {
      const s = value as { student_id: unknown; display_name: unknown };
      if (!s || typeof s.student_id !== 'string' || typeof s.display_name !== 'string') throw new Error('Invalid student');
      return { id: s.student_id, name: s.display_name };
    }),
    save: async (details, current) => { const id = await call('teacher_classroom_save', { p_id: current?.id ?? null, p_name: details.name, p_grade: details.grade, p_description: details.description, p_revision: current?.revision ?? null }); if (typeof id !== 'string' || (current && id !== current.id)) throw new Error('Operation failed'); },
    archive: async (room) => requireTrue('teacher_classroom_archive', { p_id: room.id, p_revision: room.revision }),
    add: async (room, student) => requireTrue('teacher_classroom_add_student', { p_id: room.id, p_student_id: student.id }),
    remove: async (room, student) => requireTrue('teacher_classroom_remove_student', { p_id: room.id, p_student_id: student.id }),
  };
}

/** Deliberately non-persistent and non-authoritative: no code or enrollment simulation. */
export function previewClassrooms(assigned: TeacherStudent[]): ClassroomStore {
  let rooms: Classroom[] = [];
  const memberships = new Map<string, Set<string>>();
  const get = (room: Classroom) => { const current = rooms.find((c) => c.id === room.id && c.revision === room.revision && !c.archived_at); if (!current) throw new Error('Classroom changed'); return current; };
  const student = (id: string) => { const s = assigned.find((item) => item.id === id); if (!s) throw new Error('Not assigned'); return s; };
  return {
    list: async () => rooms.map((c) => ({ ...c, student_count: [...(memberships.get(c.id) ?? [])].filter((id) => assigned.some((s) => s.id === id)).length })),
    students: async (id) => { if (!rooms.some((r) => r.id === id)) throw new Error('Classroom unavailable'); return [...(memberships.get(id) ?? [])].map(student).map(({ id, name }) => ({ id, name })); },
    save: async (details, current) => { if (!details.name.trim() || details.name.length > 100 || details.description.length > 500 || (details.grade !== null && (!Number.isInteger(details.grade) || details.grade < 1 || details.grade > 7))) throw new Error('Invalid classroom'); if (current) { get(current); rooms = rooms.map((r) => r.id === current.id ? { ...r, ...details, revision: r.revision + 1 } : r); } else { rooms = [{ ...details, id: crypto.randomUUID(), created_at: new Date().toISOString(), archived_at: null, student_count: 0, revision: 1 }, ...rooms]; } },
    archive: async (room) => { get(room); rooms = rooms.map((r) => r.id === room.id ? { ...r, archived_at: new Date().toISOString(), revision: r.revision + 1 } : r); },
    add: async (room, selected) => { get(room); student(selected.id); const members = memberships.get(room.id) ?? new Set<string>(); members.add(selected.id); memberships.set(room.id, members); },
    remove: async (room, selected) => { get(room); student(selected.id); if (!memberships.get(room.id)?.delete(selected.id)) throw new Error('Membership unavailable'); },
  };
}
