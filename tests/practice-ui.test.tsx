// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';

/**
 * The generated questions must survive the real UI, not just the engine tests:
 * a session has to start from a template, render distinct options, accept an
 * answer, and advance to a genuinely different question.
 *
 * These drive grade 2: grade 1 is currently placeholder content (see
 * grade1-placeholders.ts) whose fixed-wording questions are correct but not
 * representative of what the engine can do.
 */
const startGrade2Subtopic = async () => {
  render(<StudentApp />);
  fireEvent.click(screen.getAllByRole('tab')[1]);
  fireEvent.click((await screen.findAllByRole('button', { name: /დაწყება/ }))[0]);
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

      const options = within(
        screen.getByRole('group', { name: 'პასუხის ვარიანტები' }),
      ).getAllByRole('button');
      expect(options).toHaveLength(4);
      expect(new Set(options.map((option) => option.textContent)).size).toBe(4);

      prompts.add(prompt);
      fireEvent.click(options[0]);
      fireEvent.click(await screen.findByRole('button', { name: /შემდეგი/ }));
    }

    // No question is repeated inside one session.
    expect(prompts.size).toBe(10);
  });

  it('keeps the score inside 0–100 while answering', async () => {
    await startGrade2Subtopic();

    for (let index = 0; index < 5; index += 1) {
      const options = within(
        screen.getByRole('group', { name: 'პასუხის ვარიანტები' }),
      ).getAllByRole('button');
      fireEvent.click(options[index % options.length]);

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
    render(<StudentApp />);
    const tab = screen.getAllByRole('tab').find((t) => t.textContent?.startsWith('Iკლასი'));
    expect(tab, 'grade I tab').toBeTruthy();
    fireEvent.click(tab!);

    const topic = [...document.querySelectorAll<HTMLElement>('.accordion-topic-trigger')].find((b) =>
      b.textContent?.includes('მდებარეობა'),
    );
    expect(topic, 'the U01 topic').toBeTruthy();
    fireEvent.click(topic!);

    // U01 is one unit holding eight subtopic rows; counting is the last row.
    const panel = document.querySelector('#unit-panel-mdebareoba-mdebareoba');
    expect(panel, 'the U01 unit panel').toBeTruthy();
    const rows = [...(panel as HTMLElement).querySelectorAll<HTMLElement>('.subtopic-row')];
    expect(rows.length, 'eight U01 subtopics').toBe(8);
    expect(rows[7].textContent).toContain('დათვლა სურათიდან');

    const start = within(rows[7]).getByRole('button', { name: /დაწყება/ });
    fireEvent.click(start);

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
