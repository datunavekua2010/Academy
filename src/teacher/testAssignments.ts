import { getGrade } from '../practice/curriculum';
import { hasTemplates } from '../practice/generator';
import { subtopicKey, type Assignment } from '../practice/store';
import { type SubtopicRef } from '../practice/types';

/** Local test data only; never read by an authenticated account or Supabase. */
export const TEST_ASSIGNMENTS_KEY = 'axiom-academy.test.teacher-assignments.v1';
export type TestAssignment = Assignment & { title: string; instructions: string; cancelled: boolean; tracking: 'assignment' };

export function readTestAssignments(): TestAssignment[] {
  const raw = localStorage.getItem(TEST_ASSIGNMENTS_KEY);
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error('Invalid test assignment storage');
  return data.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw new Error('Invalid test assignment');
    const value = item as TestAssignment;
    if (typeof value.id !== 'string' || typeof value.title !== 'string' || typeof value.instructions !== 'string' || typeof value.cancelled !== 'boolean' || value.tracking !== 'assignment' || !value.ref || !Number.isInteger(value.ref.grade) || value.ref.grade < 1 || value.ref.grade > 7 || typeof value.ref.topicId !== 'string' || typeof value.ref.subtopicId !== 'string' || typeof value.assignedAt !== 'string' || typeof value.dueAt !== 'string' || !Number.isFinite(Date.parse(value.dueAt))) throw new Error('Invalid test assignment');
    return { ...value, key: subtopicKey(value.ref), assignedBy: 'მასწავლებელი' };
  });
}

function write(rows: TestAssignment[]) { localStorage.setItem(TEST_ASSIGNMENTS_KEY, JSON.stringify(rows)); }
type AssignmentDetails = { title: string; instructions: string; dueAt: string };

/** Validate every selection before committing the entire batch in one storage write. */
export function createTestAssignments(input: AssignmentDetails & { subtopics: SubtopicRef[] }): void {
  const title = input.title.trim(), instructions = input.instructions.trim();
  const due = new Date(input.dueAt);
  if (!title || title.length > 120 || instructions.length > 1000 || !Number.isFinite(due.getTime()) || due.getTime() <= Date.now() || !Array.isArray(input.subtopics) || input.subtopics.length === 0) throw new Error('Invalid assignment');
  const keys = new Set<string>();
  for (const ref of input.subtopics) {
    if (!ref || !Number.isInteger(ref.grade) || ref.grade < 1 || ref.grade > 7 || typeof ref.topicId !== 'string' || typeof ref.subtopicId !== 'string') throw new Error('Invalid curriculum');
    const topic = getGrade(ref.grade).topics.find((t) => t.id === ref.topicId);
    const key = subtopicKey(ref);
    if (keys.has(key) || !topic?.units.some((unit) => unit.subtopics.some((sub) => sub.id === ref.subtopicId)) || !hasTemplates(ref)) throw new Error('Invalid curriculum');
    keys.add(key);
  }
  const rows = readTestAssignments();
  const assignedAt = new Date().toISOString();
  for (const ref of input.subtopics) {
    rows.push({ id: `test-teacher-${crypto.randomUUID()}`, key: subtopicKey(ref), ref: { ...ref }, title, instructions, tracking: 'assignment', cancelled: false, assignedAt, dueAt: due.toISOString(), assignedBy: 'მასწავლებელი' });
  }
  write(rows);
}

/** Compatibility for callers creating a single test assignment. */
export function createTestAssignment(input: AssignmentDetails & SubtopicRef): void {
  createTestAssignments({ title: input.title, instructions: input.instructions, dueAt: input.dueAt, subtopics: [{ grade: input.grade, topicId: input.topicId, subtopicId: input.subtopicId }] });
}
export function cancelTestAssignment(id: string): void {
  const rows = readTestAssignments();
  if (!rows.some((a) => a.id === id && !a.cancelled)) throw new Error('Assignment unavailable');
  write(rows.map((a) => a.id === id ? { ...a, cancelled: true } : a));
}
