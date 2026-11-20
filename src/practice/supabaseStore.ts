import type { SupabaseClient } from '@supabase/supabase-js';
import { getGrade } from './curriculum';
import { topicSubtopics, type GradeId } from './types';
import { subtopicKey, type Assignment, type Attempt } from './store';

export interface PendingAttempt { attempt: Attempt; assignmentId: string | null }
type CurriculumRow = { grade: number; topic_id: string; subunit_id: string };
type AssignmentRow = CurriculumRow & { id: string; assigned_at: string; due_at: string };
type AttemptRow = CurriculumRow & { attempt_id: string; result: unknown };

/** Load only the current student's data; never merge browser demo data into a real account. */
export async function loadStudentPractice(client: SupabaseClient, studentId: string): Promise<{ assignments: Assignment[]; attempts: Attempt[] }> {
  // PostgREST commonly caps responses at 1,000 rows. Page through all records
  // so older attempts do not silently disappear from progress calculations.
  const pageSize = 500;
  const readPages = async <T,>(table: 'homework_assignments' | 'exercise_attempts', columns: string, order: string, tieBreaker: string): Promise<T[]> => {
    const rows: T[] = [];
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await client.from(table).select(columns).eq('student_id', studentId)
        .order(order).order(tieBreaker).range(offset, offset + pageSize - 1);
      if (error || !data) throw new Error('Practice data unavailable');
      rows.push(...data as unknown as T[]);
      if (data.length < pageSize) return rows;
    }
  };
  const [assignmentRows, attemptRows] = await Promise.all([
    readPages<AssignmentRow>('homework_assignments', 'id,grade,topic_id,subunit_id,assigned_at,due_at', 'assigned_at', 'id'),
    readPages<AttemptRow>('exercise_attempts', 'attempt_id,grade,topic_id,subunit_id,result', 'created_at', 'attempt_id'),
  ]);
  const refFor = (row: CurriculumRow) => {
    if (!Number.isInteger(row.grade) || row.grade < 1 || row.grade > 7) throw new Error('Invalid curriculum grade');
    const ref = { grade: row.grade as GradeId, topicId: row.topic_id, subtopicId: row.subunit_id };
    const topic = getGrade(ref.grade).topics.find((item) => item.id === ref.topicId);
    if (!topic || !topicSubtopics(topic).some((item) => item.id === ref.subtopicId)) throw new Error('Incompatible curriculum');
    return ref;
  };
  const assignments = assignmentRows.map((row) => {
    const ref = refFor(row);
    return { id: row.id as string, key: subtopicKey(ref), ref, assignedAt: row.assigned_at as string, dueAt: row.due_at as string, assignedBy: 'აკადემია' };
  });
  const attempts = attemptRows.map((row) => {
    const ref = refFor(row);
    const result = row.result as Attempt;
    if (!result || result.id !== row.attempt_id || !Array.isArray(result.answers) || !Number.isFinite(result.score) || result.score < 0 || result.score > 100 || !Number.isFinite(result.correct) || !Number.isFinite(result.incorrect) || typeof result.finishedAt !== 'string') throw new Error('Invalid attempt');
    return { ...result, ref, key: subtopicKey(ref) };
  });
  return { assignments, attempts };
}

/** Insert-only; a duplicate primary key is accepted only after confirming it belongs to this student. */
export async function saveStudentAttempt(client: SupabaseClient, studentId: string, pending: PendingAttempt): Promise<void> {
  const { attempt, assignmentId } = pending;
  const row = { student_id: studentId, attempt_id: attempt.id, grade: attempt.ref.grade, topic_id: attempt.ref.topicId,
    subunit_id: attempt.ref.subtopicId, assignment_id: assignmentId, result: attempt };
  const { error } = await client.from('exercise_attempts').insert(row);
  if (!error) return;
  if (error.code === '23505') {
    const existing = await client.from('exercise_attempts').select('attempt_id').eq('student_id', studentId).eq('attempt_id', attempt.id).maybeSingle();
    if (!existing.error && existing.data) return;
  }
  throw new Error('Attempt could not be saved');
}
