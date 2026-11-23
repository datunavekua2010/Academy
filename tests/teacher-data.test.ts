import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { loadTeacherData } from '../src/teacher/data';

function clientFor(data: Record<string, unknown[]>, fail = '') {
  const queries: { table: string; filters: [string, unknown][] }[] = [];
  const client = { from(table: string) {
    const trace: { table: string; filters: [string, unknown][] } = { table, filters: [] }; queries.push(trace);
    const q = { select: () => q, eq: (c: string, v: unknown) => { trace.filters.push([c, v]); return q; }, in: (c: string, v: unknown) => { trace.filters.push([c, v]); return q; }, order: () => q,
      range: async (start: number, end: number) => ({ data: data[table]?.slice(start, end + 1) ?? [], error: table === fail ? { message: 'failed' } : null }) };
    return q;
  } } as unknown as SupabaseClient;
  return { client, queries };
}
const initial = {
  teacher_students: [{ student_id: 'child' }], profiles: [{ id: 'child', display_name: 'Child' }], student_grades: [{ student_id: 'child', grade: 3 }],
  homework_assignments: [{ id: 'hw', student_id: 'child', grade: 1, topic_id: 't', subunit_id: 's', assigned_at: '2026-01-01', due_at: '2026-01-03' }],
  exercise_attempts: [
    { attempt_id: 'a', student_id: 'child', grade: 1, topic_id: 't', subunit_id: 's', assignment_id: 'hw', created_at: '2026-01-02', result: { score: 100, correct: 500, answers: [{ correct: true }, { correct: false }] } },
    { attempt_id: 'b', student_id: 'child', grade: 1, topic_id: 't', subunit_id: 's', assignment_id: null, created_at: '2026-01-03', result: { answers: 'bad' } },
  ],
};
describe('teacher data adapter', () => {
  it('fetches only linked IDs and the teacher’s assignments, counts answer evidence rather than score, and reports malformed results', async () => {
    const { client, queries } = clientFor(initial); const data = await loadTeacherData(client, 'teacher');
    expect(data.students).toEqual([{ id: 'child', name: 'Child', grade: 3 }]);
    expect(data.attempts[0]).toMatchObject({ correct: 1, incorrect: 1, assignmentId: 'hw' });
    expect(data.invalidAttempts).toBe(1);
    expect(queries.find((q) => q.table === 'teacher_students')?.filters).toContainEqual(['teacher_id', 'teacher']);
    expect(queries.find((q) => q.table === 'homework_assignments')?.filters).toContainEqual(['assigned_by', 'teacher']);
    for (const table of ['student_grades', 'homework_assignments', 'exercise_attempts']) expect(queries.find((q) => q.table === table)?.filters).toContainEqual(['student_id', ['child']]);
  });
  it('fails instead of displaying zero when data cannot be fetched', async () => {
    await expect(loadTeacherData(clientFor(initial, 'exercise_attempts').client, 'teacher')).rejects.toThrow();
    await expect(loadTeacherData(clientFor({ ...initial, profiles: [] }).client, 'teacher')).rejects.toThrow();
  });
  it('does not query students or attempts when the roster is empty', async () => {
    const { client, queries } = clientFor({ teacher_students: [] });
    expect(await loadTeacherData(client, 'teacher')).toEqual({ students: [], assignments: [], attempts: [], invalidAttempts: 0 });
    expect(queries.map((q) => q.table)).toEqual(['teacher_students']);
  });
});
