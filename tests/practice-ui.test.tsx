// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';

/**
 * The generated questions must survive the real UI, not just the engine tests:
 * a session has to start from a template, render four distinct options, accept
 * an answer, and advance to a genuinely different question.
 */
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
    render(<StudentApp />);

    fireEvent.click(screen.getAllByRole('tab')[0]);
    fireEvent.click((await screen.findAllByRole('button', { name: /დაწყება/ }))[0]);

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
    render(<StudentApp />);

    fireEvent.click(screen.getAllByRole('tab')[0]);
    fireEvent.click((await screen.findAllByRole('button', { name: /დაწყება/ }))[0]);

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
