// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { generateBatch } from '../src/practice/generator';
import { startSession } from '../src/practice/session';
import { saveDraft } from '../src/practice/store';

/**
 * When a subtopic runs out of questions before 100 points, the student must be
 * told that the material ended — not that the session failed to load.
 *
 * "დათვლა წინ და უკან" produced exactly that: nineteen questions, all correct,
 * an empty queue at 76, and the error "სესია ვერ ჩაიტვირთა. სცადე თავიდან",
 * which blames the load for something the student had done perfectly.
 */

const ref = { grade: 1 as const, topicId: 'datvla', subtopicId: 'win-ukan' };

beforeEach(() => {
  window.localStorage.clear();
  window.location.hash = '#/student/practice';
  window.scrollTo = vi.fn();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
});

describe('a session whose material runs out', () => {
  it('reports the score and ends, instead of claiming the session failed to load', async () => {
    // Build the exact state the bug left behind: every question answered, an
    // empty queue, and a score short of 100.
    const questions = generateBatch(ref as never, 6, { level: 1 });
    const base = startSession(ref as never, questions);
    const shown = Object.values(base.questions);

    const exhausted = {
      ...base,
      queue: [],
      score: 76,
      correct: 19,
      incorrect: 0,
      exhausted: true,
      answers: shown.map((question) => ({
        questionId: question.id,
        prompt: question.prompt,
        visual: question.visual,
        choice: String(question.answer),
        correct: true,
        previousScore: 0,
        scoreAfter: 4,
        delta: 4,
        at: new Date().toISOString(),
      })),
    };

    // The app restores a draft on load, so writing the broken state to the
    // draft store is exactly what the student was looking at.
    saveDraft(exhausted, window.localStorage);
    render(<StudentApp />);

    // The ending is stated, and the score is shown.
    expect(await screen.findByText(/ამ თემის კითხვები ამოიწურა/)).toBeTruthy();
    expect(screen.getAllByText(/76/).length).toBeGreaterThan(0);

    // And the load error is NOT shown.
    expect(screen.queryByText(/სესია ვერ ჩაიტვირთა/)).toBeNull();
  });
});
