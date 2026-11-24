import type { SupabaseClient } from '@supabase/supabase-js';

/** Enable only after the scoped RPCs and data-minimization policies are installed. */
export const PARENT_REVIEW_ENABLED = import.meta.env.VITE_PARENT_ENABLED === 'true';
export type ParentChild = { studentId: string; name: string; grade: number | null };
export type ParentAttempt = { id: string; createdAt: string; grade: number; topicId: string; subtopicId: string; score: number | null };
export type ParentNote = { text: string; createdAt: string; author: string };
const idValid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const text = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

async function verifyParent(client: SupabaseClient, parentId: string): Promise<void> {
  if (!idValid(parentId)) throw new Error('Unavailable');
  const { data, error } = await client.auth.getUser();
  if (error || data.user?.id !== parentId) throw new Error('Unavailable');
  const role = await client.from('user_roles').select('role').eq('user_id', parentId).eq('role', 'parent').maybeSingle();
  if (role.error || role.data?.role !== 'parent') throw new Error('Unavailable');
}
export async function loadParentChildren(client: SupabaseClient, parentId: string): Promise<ParentChild[]> {
  await verifyParent(client,parentId);
  const { data, error } = await client.rpc('parent_review_children');
  if (error || !Array.isArray(data)) throw new Error('Unavailable');
  const result = data.map((row: Record<string, unknown>) => {
    if (!text(row.student_id) || !idValid(row.student_id) || !text(row.display_name) || (row.grade !== null && (!Number.isInteger(row.grade) || Number(row.grade)<1 || Number(row.grade)>7))) throw new Error('Unavailable');
    return {studentId: row.student_id, name: row.display_name, grade: row.grade as number | null};
  });
  if(new Set(result.map(child=>child.studentId)).size!==result.length) throw new Error('Unavailable');
  await verifyParent(client,parentId);
  return result;
}
export async function loadParentChild(client: SupabaseClient, parentId: string, studentId: string): Promise<{ attempts: ParentAttempt[]; notes: ParentNote[] }> {
  if (!idValid(studentId) || !(await loadParentChildren(client,parentId)).some(child=>child.studentId===studentId)) throw new Error('Unavailable');
  const [attempts,notes] = await Promise.all([
    client.rpc('parent_review_recent_attempts',{p_student:studentId}),
    client.rpc('parent_published_lesson_notes',{p_student_id:studentId}),
  ]);
  if(attempts.error || notes.error || !Array.isArray(attempts.data) || attempts.data.length>30 || !Array.isArray(notes.data) || notes.data.length>100)throw new Error('Unavailable');
  const mappedAttempts = attempts.data.map((row: Record<string,unknown>)=>{
    const rawScore=row.score;const score=rawScore===null ? null : typeof rawScore==='number' ? rawScore : typeof rawScore==='string' && /^(?:[0-9]+)(?:\.[0-9]+)?$/.test(rawScore) ? Number(rawScore) : NaN;
    if(!text(row.attempt_id)||!text(row.created_at)||!Number.isInteger(row.grade)||Number(row.grade)<1||Number(row.grade)>7||!text(row.topic_id)||!text(row.subunit_id)||(score!==null&&(!Number.isFinite(score)||score<0||score>100))) throw new Error('Unavailable');
    return {id:row.attempt_id,createdAt:row.created_at,grade:Number(row.grade),topicId:row.topic_id,subtopicId:row.subunit_id,score};
  });
  const mappedNotes = notes.data.map((row: Record<string,unknown>)=>{
    if(!text(row.note_text)||!text(row.created_at)||!text(row.author_name)) throw new Error('Unavailable');
    return {text:row.note_text,createdAt:row.created_at,author:row.author_name};
  });
  if(!(await loadParentChildren(client,parentId)).some(child=>child.studentId===studentId)) throw new Error('Unavailable');
  return {attempts:mappedAttempts,notes:mappedNotes};
}
