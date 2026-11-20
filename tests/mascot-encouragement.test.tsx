// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { generateBatch } from '../src/practice/generator';
import { startSession } from '../src/practice/session';
import { saveDraft } from '../src/practice/store';

const correctMessage = 'ყოჩაღ! ძალიან კარგად გამოგივიდა!';
const wrongMessage = 'არაუშავს, შეცდომებიც სწავლის ნაწილია. განაგრძე, შენ შეძლებ!';

beforeEach(() => {
  window.localStorage.clear();
  window.scrollTo = vi.fn();
});
afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
});

function startTypedQuestion(score = 0) {
  window.location.hash = '#/student/practice';
  const ref = { grade: 1 as const, topicId: 'mdebareoba', subtopicId: 'datvla-suratebidan' };
  const question = generateBatch(ref, 60, { level: 1, seed: 2026 }).find((q) => q.answerMode === 'number');
  if (!question) throw new Error('Expected a typed counting question');
  saveDraft({ ...startSession(ref, [question]), score }, window.localStorage);
  render(<StudentApp />);
  return question;
}

function answerTyped(value: string) {
  const input = screen.getByLabelText('ჩაწერე პასუხი');
  fireEvent.change(input, { target: { value } });
  fireEvent.submit(input.closest('form')!);
}

describe('Axi encouragement in the shared exercise runner', () => {
  it('encourages a correct answer and clears the message on the next question', async () => {
    const question = startTypedQuestion();
    expect(screen.queryByText(correctMessage)).toBeNull();
    answerTyped(question.answer);
    const message = await screen.findByText(correctMessage);
    expect(message.closest('[aria-live="polite"]')).toBeTruthy();
    expect(message.parentElement?.querySelector('img')?.getAttribute('alt')).toBe('');
    expect(screen.queryByText(wrongMessage)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /შემდეგი კითხვა/ }));
    expect(screen.queryByText(correctMessage)).toBeNull();
  });

  it('encourages an incorrect answer without offering a hint', async () => {
    const question = startTypedQuestion();
    answerTyped(String(Number(question.answer) + 100));
    const message = await screen.findByText(wrongMessage);
    expect(message.closest('[aria-live="polite"]')).toBeTruthy();
    expect(screen.queryByText(correctMessage)).toBeNull();
    expect(message.textContent).not.toContain(question.answer);
  });

  it('shows encouragement for the final correct answer on the completion screen', async () => {
    const question = startTypedQuestion(99);
    answerTyped(question.answer);
    const completed = await screen.findByText('100 ქულა! სესია დასრულებულია.');
    expect(within(completed.closest('[role="status"]') as HTMLElement).getByText(correctMessage)).toBeTruthy();
  });

  it('shows encouragement in an assigned homework session', async () => {
    window.location.hash = '#/student/homework/grade/1';
    render(<StudentApp />);
    const tasks = await screen.findAllByRole('button', { name: /დაწყება/ });
    fireEvent.click(tasks[0]);
    expect(document.querySelector('.session-mode.is-homework')).toBeTruthy();
    const group = await screen.findByRole('group', { name: 'პასუხის ვარიანტები' });
    fireEvent.click(within(group).getAllByRole('button')[0]);
    const region = document.querySelector('.answer-feedback');
    expect(region).toBeTruthy();
    expect(region?.textContent).toMatch(/ყოჩაღ! ძალიან კარგად გამოგივიდა!|არაუშავს, შეცდომებიც სწავლის ნაწილია/);
  });
});
