import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CURRICULUM } from '../src/practice/curriculum';
import { loadStudentPractice, saveStudentAttempt } from '../src/practice/supabaseStore';
import type { Attempt } from '../src/practice/store';

const topic = CURRICULUM[0].topics[0];
const sub = topic.units[0].subtopics[0];
const ref = { grade: CURRICULUM[0].grade, topicId: topic.id, subtopicId: sub.id };
const result: Attempt = { id: 'attempt-one', key: '', ref, score: 4, correct: 1, incorrect: 0, startedAt: '2026-01-01T00:00:00Z', finishedAt: '2026-01-01T00:01:00Z', seconds: 60, completed: false, answers: [] };
function fakeClient(options: { failLoad?: boolean; insertError?: { code: string }; exists?: boolean } = {}) {
  const seen: unknown[] = [];
  const client = {
    from(table: string) {
      return {
        select() {
          const q = { eq(column: string, value: string) { seen.push([table, column, value]); return q; },
            order() { return q; },
            range() { return Promise.resolve({ data: table === 'homework_assignments' ? [{ id: 'hw', grade: ref.grade, topic_id: ref.topicId, subunit_id: ref.subtopicId, assigned_at: result.startedAt, due_at: result.finishedAt }] : [{ attempt_id: result.id, grade: ref.grade, topic_id: ref.topicId, subunit_id: ref.subtopicId, result }], error: options.failLoad ? { message: 'failed' } : null }); },
            maybeSingle() { return Promise.resolve({ data: options.exists ? { attempt_id: result.id } : null, error: null }); } };
          return q;
        },
        insert(row: unknown) { seen.push(row); return Promise.resolve({ error: options.insertError ?? null }); },
      };
    },
  } as unknown as SupabaseClient;
  return { client, seen };
}

describe('Supabase practice adapter', () => {
  it('loads assignments and attempts for the current student and derives the existing ref', async () => {
    const { client, seen } = fakeClient();
    const data = await loadStudentPractice(client, 'student-id');
    expect(data.assignments[0].ref).toEqual(ref);
    expect(data.attempts[0].key).toBe(`${ref.grade}/${ref.topicId}/${ref.subtopicId}`);
    expect(seen.filter((entry) => Array.isArray(entry) && entry[1] === 'student_id' && entry[2] === 'student-id')).toHaveLength(2);
  });
  it('surfaces load and save errors and handles confirmed duplicate inserts', async () => {
    await expect(loadStudentPractice(fakeClient({ failLoad: true }).client, 'student-id')).rejects.toThrow();
    await expect(saveStudentAttempt(fakeClient({ insertError: { code: '42501' } }).client, 'student-id', { attempt: result, assignmentId: null })).rejects.toThrow();
    await expect(saveStudentAttempt(fakeClient({ insertError: { code: '23505' }, exists: true }).client, 'student-id', { attempt: result, assignmentId: null })).resolves.toBeUndefined();
    await expect(saveStudentAttempt(fakeClient({ insertError: { code: '23505' } }).client, 'student-id', { attempt: result, assignmentId: null })).rejects.toThrow();
  });
});
