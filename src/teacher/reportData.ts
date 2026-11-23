import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReportRow } from './progressReport';

/** Recheck the real user, teacher role and current link, with RLS enforcing each read. */
async function checkAccess(client: SupabaseClient, teacherId: string, studentId: string): Promise<void> {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user || data.user.id !== teacherId) throw new Error('Access unavailable');
  const [role, link] = await Promise.all([
    client.from('user_roles').select('role').eq('user_id', teacherId).eq('role', 'teacher').maybeSingle(),
    client.from('teacher_students').select('student_id').eq('teacher_id', teacherId).eq('student_id', studentId).maybeSingle(),
  ]);
  if (role.error || link.error || !role.data || !link.data || link.data.student_id !== studentId) throw new Error('Access unavailable');
}

export async function loadReportRows(client: SupabaseClient, teacherId: string, studentId: string): Promise<ReportRow[]> {
  await checkAccess(client, teacherId, studentId);
  const rows: ReportRow[] = [];
  // Individual answer times are in JSON, not indexed columns. Session created_at
  // is not a safe filter: a session may be saved after its answer period.
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.from('exercise_attempts').select('student_id,attempt_id,grade,topic_id,subunit_id,result')
      .eq('student_id', studentId).order('attempt_id').range(offset, offset + 499);
    if (error || !Array.isArray(data)) throw new Error('Report unavailable');
    if (data.some((row) => row.student_id !== studentId)) throw new Error('Unexpected student');
    rows.push(...data as ReportRow[]);
    if (data.length < 500) break;
  }
  await checkAccess(client, teacherId, studentId);
  return rows;
}

/** Strict local preview source: never used for an authenticated student. */
export function loadLocalReportRows(studentId: string): ReportRow[] {
  if (studentId !== 'test-student') throw new Error('Unknown test student');
  const raw = localStorage.getItem('axiom-academy.test.practice.v1');
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== 'object' || (data as { version?: unknown }).version !== 1 || !Array.isArray((data as { attempts?: unknown }).attempts)) throw new Error('Invalid local data');
  return (data as { attempts: unknown[] }).attempts.map((value) => {
    if (!value || typeof value !== 'object') throw new Error('Invalid local data');
    const attempt = value as { id?: unknown; ref?: { grade?: unknown; topicId?: unknown; subtopicId?: unknown } };
    if (typeof attempt.id !== 'string' || !attempt.ref || typeof attempt.ref.grade !== 'number' || typeof attempt.ref.topicId !== 'string' || typeof attempt.ref.subtopicId !== 'string') throw new Error('Invalid local data');
    return { student_id: studentId, attempt_id: attempt.id, grade: attempt.ref.grade, topic_id: attempt.ref.topicId, subunit_id: attempt.ref.subtopicId, result: value };
  });
}
