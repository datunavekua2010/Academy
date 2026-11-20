import { useSyncExternalStore } from 'react';

/**
 * Lesson progress, saved in the browser (same approach as the practice store:
 * one versioned localStorage key, guarded so a blocked/full store never breaks
 * the page).
 */

export const LEARN_STORAGE_KEY = 'axiom-academy.learn.v1';
let storageKey = LEARN_STORAGE_KEY;

export interface LessonProgress {
  status: 'started' | 'completed';
  /** Independent-check results of the best completed run. */
  checkCorrect?: number;
  checkTotal?: number;
  completedAt?: string;
}
export type ProgressMap = Record<string, LessonProgress>;

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function read(): ProgressMap {
  try {
    const raw = storage()?.getItem(storageKey);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: ProgressMap = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      const v = value as Partial<LessonProgress> | null;
      if (v && (v.status === 'started' || v.status === 'completed')) out[id] = v as LessonProgress;
    }
    return out;
  } catch {
    return {};
  }
}

let cache: ProgressMap | null = null;
const listeners = new Set<() => void>();

/** Keep lesson progress separate from the demo and other accounts on this browser. */
export function setLessonProgressOwner(studentId: string | null): void {
  const next = studentId ? `${LEARN_STORAGE_KEY}:${studentId}` : LEARN_STORAGE_KEY;
  if (next === storageKey) return;
  storageKey = next;
  cache = null;
  listeners.forEach((listener) => listener());
}

function snapshot(): ProgressMap {
  if (cache === null) cache = read();
  return cache;
}

function write(next: ProgressMap): void {
  cache = next;
  try {
    storage()?.setItem(storageKey, JSON.stringify(next));
  } catch {
    /* ignore: progress stays in memory for this visit */
  }
  listeners.forEach((l) => l());
}

export function markStarted(lessonId: string): void {
  const current = snapshot()[lessonId];
  if (current) return; // never downgrade a completed lesson
  write({ ...snapshot(), [lessonId]: { status: 'started' } });
}

export function markCompleted(lessonId: string, checkCorrect: number, checkTotal: number): void {
  const previous = snapshot()[lessonId];
  const better = previous?.status === 'completed' && (previous.checkCorrect ?? 0) > checkCorrect;
  write({
    ...snapshot(),
    [lessonId]: better ? previous : { status: 'completed', checkCorrect, checkTotal, completedAt: new Date().toISOString() },
  });
}

/** Test helper: forget the in-memory copy so the next read hits storage. */
export function resetProgressCache(): void {
  cache = null;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLessonProgress(): ProgressMap {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
