import { expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { connectedClassrooms, type Classroom } from '../src/teacher/classroomData';
const room: Classroom = { id:'class', name:'კლასი', grade:1, description:'', archived_at:null, created_at:'2026-01-01T00:00:00Z', revision:1, student_count:1 };
it('uses paginated scoped RPCs and server-checked operations without supplying a teacher identity', async () => {
  const rpc = vi.fn((name: string) => {
    if (name === 'teacher_classrooms_list' || name === 'teacher_classroom_students') return { order() { return this; }, range: async () => ({ data: name === 'teacher_classrooms_list' ? [room] : [{ student_id:'child', display_name:'მოსწავლე' }], error:null }) };
    return Promise.resolve({ data:name === 'teacher_classroom_save' ? 'class' : true, error:null });
  });
  const store = connectedClassrooms({ rpc } as unknown as SupabaseClient);
  expect(await store.list()).toEqual([room]); expect(await store.students('class')).toEqual([{ id:'child', name:'მოსწავლე' }]);
  await store.save({ name:'ახალი', grade:null, description:'' }, room);
  expect(rpc).toHaveBeenCalledWith('teacher_classroom_save', { p_id:'class', p_name:'ახალი', p_grade:null, p_description:'', p_revision:1 });
  await store.add(room, { id:'child', name:'მოსწავლე' });
  await store.remove(room, { id:'child', name:'მოსწავლე' });
  await store.archive(room);
  expect(rpc).toHaveBeenCalledWith('teacher_classroom_add_student', { p_id:'class', p_student_id:'child' });
  expect(rpc).toHaveBeenCalledWith('teacher_classroom_remove_student', { p_id:'class', p_student_id:'child' });
  expect(rpc).toHaveBeenCalledWith('teacher_classroom_archive', { p_id:'class', p_revision:1 });
});
it('fails closed on malformed or rejected RPC responses', async () => {
  const invalid = { rpc: () => ({ order() { return this; }, range: async () => ({ data:[{ ...room, grade:8 }], error:null }) }) } as unknown as SupabaseClient;
  await expect(connectedClassrooms(invalid).list()).rejects.toThrow();
  const failed = { rpc: () => ({ order() { return this; }, range: async () => ({ data:null, error:{ message:'denied' } }) }) } as unknown as SupabaseClient;
  await expect(connectedClassrooms(failed).students('class')).rejects.toThrow();
});
