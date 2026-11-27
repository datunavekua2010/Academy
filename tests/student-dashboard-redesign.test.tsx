// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { Dashboard } from '../src/student/Dashboard';

const data = vi.hoisted(() => ({ practice: {} as Record<string, unknown> }));
vi.mock('../src/practice/PracticeProvider', () => ({ usePractice: () => data.practice }));
vi.mock('../src/student/session', () => ({ useStudentSession: () => ({ mode: 'connected', student: { firstName: 'ნინო', name: 'ნინო ბერიძე', initials: 'ნბ', grade: 'I კლასი' } }) }));

const ref = { grade: 1, topicId: 'mdebareoba', subtopicId: 'marcxena-marjvena' };
const attempt = { id: 'a', key: 'topic', ref, score: 40, correct: 10, incorrect: 0, startedAt: '2026-01-01T10:00:00Z', finishedAt: '2026-01-01T10:05:00Z', seconds: 300, completed: false, answers: [] };
const assignment = { id: 'hw', key: 'topic', ref, assignedAt: '2026-01-01T00:00:00Z', dueAt: '2026-12-01T00:00:00Z', assignedBy: 'teacher' };
const progress = { completed: false, attempts: 0, bestScore: 0, lastScore: null, correct: 0, incorrect: 0, lastAttemptAt: null };

beforeEach(() => {
  data.practice = { assignments: [], attempts: [], session: null, grade: 1, progressForAssignment: () => progress, overall: { assigned: 0, completed: 0, percent: 0 } };
});
afterEach(cleanup);

describe('student dashboard', () => {
  it('shows honest empty states rather than invented progress or awards', () => {
    render(<Dashboard />);
    expect(screen.getByRole('heading', { name: /გამარჯობა, ნინო/ })).toBeTruthy();
    expect(screen.getByText('მინიჭებული დავალებები ჯერ არ არის.')).toBeTruthy();
    expect(screen.getByText('შენი დასრულებული სესიები აქ გამოჩნდება.')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByText(/მიღწევების დადასტურება ჯერ მიუწვდომელია/)).toBeTruthy();
    expect(screen.getByRole('link', { name: /გაკვეთილების ნახვა/ }).getAttribute('href')).toBe('#/student/lessons');
  });

  it('uses actual assignment status, attempts, and review data', () => {
    data.practice = { ...data.practice, assignments: [assignment], attempts: [attempt], overall: { assigned: 1, completed: 0, percent: 0 } };
    render(<Dashboard />);
    expect(screen.getByRole('heading', { name: 'დავალება გელოდება' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /დავალებაზე გადასვლა/ }).getAttribute('href')).toBe('#/student/homework/grade/1');
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0');
    expect(screen.getByText(/ბოლო სესიების მიხედვით/)).toBeTruthy();
    expect(within(screen.getByRole('region', { name: 'ბოლო აქტივობა' })).getByText('40/100')).toBeTruthy();
  });

  it('prioritizes a resumable practice session and ignores completed assignments', () => {
    data.practice = { ...data.practice, assignments: [assignment], session: { ref, completed: false, exhausted: false }, progressForAssignment: () => ({ ...progress, completed: true }) };
    render(<Dashboard />);
    expect(screen.getByRole('heading', { name: 'გააგრძელე ვარჯიში' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /გაგრძელება/ }).getAttribute('href')).toBe('#/student/practice');
  });
});
