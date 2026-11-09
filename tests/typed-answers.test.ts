import { describe, expect, it } from 'vitest';
import { startSession, submitAnswer } from '../src/practice/session';
import { generateBatch } from '../src/practice/generator';
import type { Question } from '../src/practice/types';

/**
 * Typed answers are graded by VALUE, not by spelling.
 *
 * A six-year-old who types " 04" for 4 has answered correctly; marking that
 * wrong teaches keyboarding, not arithmetic. Equally, "999" must never pass,
 * and a question that wants a number must not accept text.
 */
const numericQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: 'q-1',
  grade: 1,
  topicId: 'mdebareoba',
  subtopicId: 'datvla-suratebidan',
  prompt: 'რამდენია?',
  answerMode: 'number',
  options: [],
  answer: '4',
  explanation: '4.',
  difficulty: 1,
  ...overrides,
});

const answer = (question: Question, value: string) => {
  const state = startSession(
    { grade: question.grade, topicId: question.topicId, subtopicId: question.subtopicId },
    [question],
  );
  return submitAnswer(state, value)!.result.correct;
};

describe('typed number answers', () => {
  it('accepts the same value written differently', () => {
    const question = numericQuestion();
    expect(answer(question, '4')).toBe(true);
    expect(answer(question, ' 4 ')).toBe(true);
    expect(answer(question, '04')).toBe(true);
    expect(answer(question, '4.0')).toBe(true);
  });

  it('rejects a different number', () => {
    expect(answer(numericQuestion(), '5')).toBe(false);
    expect(answer(numericQuestion(), '40')).toBe(false);
    expect(answer(numericQuestion(), '')).toBe(false);
  });

  it('rejects text and non-numbers', () => {
    expect(answer(numericQuestion(), 'ოთხი')).toBe(false);
    expect(answer(numericQuestion(), 'four')).toBe(false);
    expect(answer(numericQuestion(), '4a')).toBe(false);
  });

  it('still compares multiple-choice answers exactly', () => {
    const choice = numericQuestion({ answerMode: 'choice', options: ['4', '5'], answer: '4' });
    expect(answer(choice, '4')).toBe(true);
    expect(answer(choice, '04')).toBe(false);
    expect(answer(choice, ' 4')).toBe(false);
  });

  it('every generated typed question has a numeric answer and no options', () => {
    const batch = generateBatch(
      { grade: 1, topicId: 'mdebareoba', subtopicId: 'datvla-suratebidan' },
      8,
    );
    let typed = 0;
    for (const question of batch) {
      if (question.answerMode !== 'number') continue;
      typed += 1;
      expect(question.options).toEqual([]);
      expect(Number.isFinite(Number(question.answer))).toBe(true);
      // The answer itself must be accepted, and a shifted one rejected.
      expect(answer(question, question.answer)).toBe(true);
      expect(answer(question, String(Number(question.answer) + 1))).toBe(false);
    }
    expect(typed, 'the counting subtopic must ask at least one typed question').toBeGreaterThan(0);
  });
});
