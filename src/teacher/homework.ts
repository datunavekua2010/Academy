import type { SupabaseClient } from '@supabase/supabase-js';
import type { SubtopicRef } from '../practice/types';

/** Keep disabled until migrations, real-account integration and security review are complete. */
export const CONNECTED_HOMEWORK_REVIEW = false;
export type HomeworkRequest = { requestId: string; studentId: string; title: string; instructions: string; dueAt: string; subtopics: SubtopicRef[] };

/** Retain this exact input and requestId for every retry of an uncertain response. */
export async function createHomework(client: SupabaseClient, input: HomeworkRequest): Promise<string[]> {
  const { data, error } = await client.rpc('teacher_homework_create', { p_request: input.requestId, p_student: input.studentId, p_title: input.title, p_instructions: input.instructions, p_due: input.dueAt, p_subtopics: input.subtopics });
  if (error || !Array.isArray(data) || data.length !== input.subtopics.length || !data.every((id: unknown) => typeof id === 'string')) throw new Error('Homework result unknown');
  return data as string[];
}
export async function cancelHomework(client: SupabaseClient, id: string, revision: number): Promise<void> {
  const { data, error } = await client.rpc('teacher_homework_cancel', { p_id: id, p_revision: revision });
  if (error || data !== true) throw new Error('Cancellation result unknown');
}

/** Resolve or fence a request after an uncertain create. This is not a read-only lookup. */
export async function resolveHomeworkRequest(client: SupabaseClient, requestId: string): Promise<'published' | 'abandoned'> {
  const { data, error } = await client.rpc('teacher_homework_resolve', { p_request: requestId });
  if (error || (data !== 'published' && data !== 'abandoned')) throw new Error('Request result unknown');
  return data;
}

// Store only the random request ID, never the student, title, or instructions.
// sessionStorage survives same-tab reload/navigation but is not a cross-device queue.
const markerKey = (teacherId: string) => `axiom.homework.pending.v1:${teacherId}`;
const validRequestId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
export function readHomeworkMarker(storage: Storage, teacherId: string): string | null {
  const value = storage.getItem(markerKey(teacherId));
  if (value !== null && !validRequestId(value)) throw new Error('Invalid request marker');
  return value;
}
export function rememberHomeworkMarker(storage: Storage, teacherId: string, requestId: string): void {
  if (!validRequestId(requestId) || readHomeworkMarker(storage, teacherId) !== null) throw new Error('Pending request');
  storage.setItem(markerKey(teacherId), requestId);
  if (readHomeworkMarker(storage, teacherId) !== requestId) throw new Error('Request marker not saved');
}
export function clearHomeworkMarker(storage: Storage, teacherId: string, requestId: string): void {
  const current = readHomeworkMarker(storage, teacherId);
  if (current !== null && current !== requestId) throw new Error('A different request is pending');
  if (current === requestId) storage.removeItem(markerKey(teacherId));
  if (readHomeworkMarker(storage, teacherId) !== null) throw new Error('Request marker not cleared');
}
