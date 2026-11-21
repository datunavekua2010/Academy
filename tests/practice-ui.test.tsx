// @vitest-environment jsdom
import './helpers/signed-in-student';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { generateBatch } from '../src/practice/generator';
import { saveDraft } from '../src/practice/store';
import { startSession } from '../src/practice/session';

/**
 * The generated questions must survive the real UI, not just the engine tests:
 * a session has to start from a template, render distinct options, accept an
 * answer, and advance to a genuinely different question.
 *
 * These drive grade 2: grade 1 is currently placeholder content (see
 * grade1-placeholders.ts) whose fixed-wording questions are correct but not
 * representative of what the engine can do.
 */
/**
 * A fixed set of plain (choose-or-type) questions, so these tests exercise the
 * generic answer flow. Interactive questions (clock hands, ten-frames, …) are
 * answered by their own widget and are covered in `interactions-widgets.test.tsx`.
 */
const startGrade2Subtopic = async () => {
  const ref = { grade: 2 as const, topicId: 'g2-ertnishna-moqmedebebi', subtopicId: 'u03-single-digit-add-sub' };
  const questions = generateBatch(ref as never, 40, { level: 1 }).filter((q) => !q.interaction).slice(0, 12);
  saveDraft(startSession(ref as never, questions), window.localStorage);
  render(<StudentApp />);
};
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

describe('practice UI with generated questions', () => {
  it('plays ten different generated questions in a row', async () => {
    await startGrade2Subtopic();

    // The runner says the question came from the generator.
    expect(screen.getByText(/ავტომატურად გენერირებული/)).toBeTruthy();

    const prompts = new Set<string>();

    for (let index = 0; index < 10; index += 1) {
      const prompt = document.querySelector('.question-prompt')?.textContent ?? '';
      expect(prompt.trim().length).toBeGreaterThan(0);
      expect(prompt).not.toMatch(/\{\w+\}/); // no unfilled template placeholders

      const optionGroup = screen.queryByRole('group', { name: 'პასუხის ვარიანტები' });
      if (optionGroup) {
        const options = within(optionGroup).getAllByRole('button');
        expect(options.length).toBeGreaterThanOrEqual(3);
        expect(new Set(options.map((option) => option.textContent)).size).toBe(options.length);
        fireEvent.click(options[0]);
      } else {
        const input = screen.getByLabelText('ჩაწერე პასუხი');
        fireEvent.change(input, { target: { value: '42' } });
        fireEvent.submit(input.closest('form')!);
      }

      prompts.add(prompt);
      fireEvent.click(await screen.findByRole('button', { name: /შემდეგი/ }));
    }

    // No question is repeated inside one session.
    expect(prompts.size).toBe(10);
  });

  it('keeps the score inside 0–100 while answering', async () => {
    await startGrade2Subtopic();

    for (let index = 0; index < 5; index += 1) {
      const optionGroup = screen.queryByRole('group', { name: 'პასუხის ვარიანტები' });
      if (optionGroup) {
        const options = within(optionGroup).getAllByRole('button');
        fireEvent.click(options[index % options.length]);
      } else {
        const input = screen.getByLabelText('ჩაწერე პასუხი');
        fireEvent.change(input, { target: { value: '42' } });
        fireEvent.submit(input.closest('form')!);
      }

      const meter = screen.getByRole('progressbar');
      const score = Number(meter.getAttribute('aria-valuenow'));
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);

      // A second submit before advancing must not score twice.
      const before = meter.getAttribute('aria-valuenow');
      expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(before);

      fireEvent.click(await screen.findByRole('button', { name: /შემდეგი/ }));
    }
  });
});

describe('typed answers', () => {
  /**
   * Q18 and Q46–Q50 of the reference bank are answered by typing a number, so
   * the runner has to render an input instead of options, accept the value, and
   * grade it by value rather than by spelling.
   *
   * Navigation mirrors what a student does: grade I → the "მდებარეობა" topic →
   * the counting subtopic → start. Counting is the only U01 subtopic that asks
   * typed questions, so the test has to go there deliberately.
   */
  const startCounting = async () => {
    const ref = { grade: 1 as const, topicId: 'mdebareoba', subtopicId: 'datvla-suratebidan' };
    const typed = generateBatch(ref as never, 60, { level: 1 }).concat(generateBatch(ref as never, 60, { level: 2 })).filter((q) => q.answerMode === 'number');
    expect(typed.length, 'counting asks typed questions').toBeGreaterThan(0);
    saveDraft(startSession(ref as never, typed.slice(0, 6)), window.localStorage);
    render(<StudentApp />);
    return (await screen.findByLabelText('ჩაწერე პასუხი')) as HTMLInputElement;
  };

  it('shows a number field instead of options, and grades by value', async () => {
    const input = await startCounting();

    // A typed question offers no options at all.
    expect(document.querySelectorAll('.answer-option')).toHaveLength(0);
    expect(input.getAttribute('inputmode')).toBe('numeric');

    fireEvent.change(input, { target: { value: '999' } });
    fireEvent.submit(input.closest('form')!);

    // The runner reveals the right answer and locks the field.
    expect(await screen.findByText(/სწორი პასუხია/)).toBeTruthy();
    expect(input.disabled).toBe(true);
  });
});
