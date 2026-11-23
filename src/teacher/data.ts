import type { SupabaseClient } from '@supabase/supabase-js';
import { CONNECTED_HOMEWORK_REVIEW } from './homework';

export interface TeacherStudent { id: string; name: string; grade: number | null }
export interface TeacherAssignment { id: string; studentId: string; grade: number; topicId: string; subunitId: string; assignedAt: string; dueAt: string; title?: string; instructions?: string; status?: 'published' | 'cancelled'; revision?: number }
export interface TeacherAttempt { id: string; studentId: string; grade: number; topicId: string; subunitId: string; assignmentId: string | null; recordedAt: string; correct: number; incorrect: number }
export interface TeacherData { students: TeacherStudent[]; assignments: TeacherAssignment[]; attempts: TeacherAttempt[]; invalidAttempts: number }

type LinkRow = { student_id: string };
type ProfileRow = { id: string; display_name: string };
type GradeRow = { student_id: string; grade: number };
type AssignmentRow = { id: string; student_id: string; grade: number; topic_id: string; subunit_id: string; assigned_at: string; due_at: string; title?: string; instructions?: string; status?: 'published' | 'cancelled'; revision?: number };
type AttemptRow = { attempt_id: string; student_id: string; grade: number; topic_id: string; subunit_id: string; assignment_id: string | null; created_at: string; result: unknown };

/** Fetch all pages; never turn a partial or failed response into a false zero. */
async function pages<T>(build: (start: number, end: number) => PromiseLike<{ data: unknown; error: unknown }>): Promise<T[]> {
  const size = 500;
  const rows: T[] = [];
  for (let start = 0; ; start += size) {
    const { data, error } = await build(start, start + size - 1);
    if (error || !Array.isArray(data)) throw new Error('Teacher data unavailable');
    rows.push(...data as T[]);
    if (data.length < size) return rows;
  }
}

/** The role and links are checked by RLS as well as scoped explicitly here. */
export async function loadTeacherData(client: SupabaseClient, teacherId: string): Promise<TeacherData> {
  const links = await pages<LinkRow>((a, b) => client.from('teacher_students').select('student_id').eq('teacher_id', teacherId).order('student_id').range(a, b));
  const ids = [...new Set(links.map((row) => row.student_id))];
  if (!ids.length) return { students: [], assignments: [], attempts: [], invalidAttempts: 0 };
  const profiles: ProfileRow[] = [], grades: GradeRow[] = [], assignments: AssignmentRow[] = [], rawAttempts: AttemptRow[] = [];
  // Bound IN lists to avoid excessively long URLs, while retaining pagination.
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const [p, g, h, a] = await Promise.all([
      pages<ProfileRow>((start, end) => client.from('profiles').select('id,display_name').in('id', batch).order('id').range(start, end)),
      pages<GradeRow>((start, end) => client.from('student_grades').select('student_id,grade').in('student_id', batch).order('student_id').range(start, end)),
      pages<AssignmentRow>((start, end) => client.from('homework_assignments').select(CONNECTED_HOMEWORK_REVIEW ? 'id,student_id,grade,topic_id,subunit_id,assigned_at,due_at,title,instructions,status,revision' : 'id,student_id,grade,topic_id,subunit_id,assigned_at,due_at').eq('assigned_by', teacherId).in('student_id', batch).order('id').range(start, end)),
      pages<AttemptRow>((start, end) => client.from('exercise_attempts').select('attempt_id,student_id,grade,topic_id,subunit_id,assignment_id,created_at,result').in('student_id', batch).order('student_id').order('attempt_id').range(start, end)),
    ]);
    profiles.push(...p); grades.push(...g); assignments.push(...h); rawAttempts.push(...a);
  }
  const profilesById = new Map(profiles.map((row) => [row.id, row]));
  // A changed relationship or inaccessible profile must not be misrepresented as an empty roster.
  if (ids.some((id) => !profilesById.has(id))) throw new Error('Roster changed or unavailable');
  const gradesById = new Map(grades.map((row) => [row.student_id, row.grade]));
  const students = ids.map((id) => ({ id, name: profilesById.get(id)!.display_name, grade: gradesById.get(id) ?? null }));
  const allowed = new Set(ids);
  const attempts: TeacherAttempt[] = [];
  let invalidAttempts = 0;
  for (const row of rawAttempts) {
    if (!allowed.has(row.student_id)) throw new Error('Unexpected student');
    const result = row.result as { answers?: unknown } | null;
    if (!result || !Array.isArray(result.answers) || !result.answers.every((answer: unknown) => !!answer && typeof answer === 'object' && typeof (answer as { correct?: unknown }).correct === 'boolean')) { invalidAttempts++; continue; }
    const correct = result.answers.filter((answer: { correct: boolean }) => answer.correct).length;
    attempts.push({ id: row.attempt_id, studentId: row.student_id, grade: row.grade, topicId: row.topic_id, subunitId: row.subunit_id, assignmentId: row.assignment_id, recordedAt: row.created_at, correct, incorrect: result.answers.length - correct });
  }
  return { students, assignments: assignments.map((row) => ({ id: row.id, studentId: row.student_id, grade: row.grade, topicId: row.topic_id, subunitId: row.subunit_id, assignedAt: row.assigned_at, dueAt: row.due_at, title: row.title, instructions: row.instructions, status: row.status, revision: row.revision })), attempts, invalidAttempts };
}
