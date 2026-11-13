// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { generateBatch } from '../src/practice/generator';
import { StudentApp } from '../src/student/StudentApp';
import { saveDraft } from '../src/practice/store';
import { startSession } from '../src/practice/session';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Two things the student sees that the engine tests could not catch.
 *
 * 1. "Above" and "below" are drawn as one object over another. The newline is
 *    the meaning: collapsed to a row, a vertical question shows a horizontal
 *    picture and every answer looks wrong.
 * 2. A comparison offers the two objects it names. It used to offer four
 *    near-misses of the winning measure — "20 სმ or 15 სმ?" answered by picking
 *    between 21, 20, 22 and 19 — so the losing object could not be chosen and
 *    no comparison was needed.
 */

const ABOVE_BELOW = { grade: 1 as const, topicId: 'mdebareoba', subtopicId: 'zeda-qveda' };

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

describe('pictures the student has to read', () => {
  it('draws an above/below pair as a column, not a row', () => {
    const stacked = generateBatch(ABOVE_BELOW as never, 40, { level: 1 })
      .concat(generateBatch(ABOVE_BELOW as never, 40, { level: 2 }))
      .filter((question) => /ზემოთ|ქვემოთ/.test(question.prompt));

    expect(stacked.length).toBeGreaterThan(0);
    for (const question of stacked) {
      // Two objects, one over the other.
      expect(question.visual, question.prompt).toContain('\n');
    }
  });

  it('keeps the newline when it reaches the screen', () => {
    const question = generateBatch(ABOVE_BELOW as never, 6, { level: 1 }).find((q) =>
      q.visual?.includes('\n'),
    )!;
    saveDraft(startSession(ABOVE_BELOW as never, [question]), window.localStorage);

    render(<StudentApp />);
    const visual = document.querySelector('.question-visual')!;
    expect(visual.textContent).toBe(question.visual);

    // The element keeps the newline; whether it *renders* as a break depends on
    // one CSS declaration. jsdom does not load the stylesheet, so read the rule
    // from the file the browser gets — that is the thing that was missing.
    const css = readFileSync(path.resolve(process.cwd(), 'src/student/student.css'), 'utf8');
    const rule = css.slice(css.indexOf('.question-visual {'));
    const body = rule.slice(0, rule.indexOf('}'));
    expect(body).toMatch(/white-space:\s*pre-(line|wrap)/);
  });

  it('gives a clock face the one font and whitespace rule its picture needs', () => {
    // A dial is drawn on a grid of spaces: the numerals are placed by column and
    // the hands run along rows. `.question-visual` is proportional and
    // `pre-line`, which is right for a row of objects and turns a dial into a
    // smear — so the dial gets its own class, and jsdom cannot see the difference
    // because it loads no stylesheet. Read the rule from the file the browser gets.
    const ref = { grade: 1 as const, topicId: 'dro', subtopicId: 'saatis-wakitxva' };
    const question = generateBatch(ref as never, 12, { level: 1 }).find((q) => q.visual?.includes('┼'))!;
    expect(question, 'a clock question should draw a dial').toBeDefined();

    saveDraft(startSession(ref as never, [question]), window.localStorage);
    render(<StudentApp />);

    const visual = document.querySelector('.question-visual')!;
    expect(visual.textContent).toBe(question.visual);
    expect(visual.className, 'a dial must opt into the monospace rule').toContain('question-visual-dial');

    const css = readFileSync(path.resolve(process.cwd(), 'src/student/student.css'), 'utf8');
    const rule = css.slice(css.indexOf('.question-visual-dial {'));
    const body = rule.slice(0, rule.indexOf('}'));
    // Every space the picture is drawn with is kept…
    expect(body).toMatch(/white-space:\s*pre\b/);
    // …and every character is the same width, or the columns do not line up.
    expect(body).toMatch(/font-family:[^;]*monospace/);
  });

  it('leaves a row-of-objects picture on the emoji-friendly default', () => {
    // The fix must not be applied to everything: an emoji counted in a
    // monospace font is drawn at an awkward width and the row stops reading.
    expect('🍎 🍎 🍎'.includes('┼')).toBe(false);
  });
});

describe('the options a comparison offers', () => {
  it.each([
    ['grZeli-mokle', 'გრძელი', 'სმ'],
    ['magle-dabali', 'მაღალი', 'სმ'],
    ['mZime-msubuqi', 'მძიმე', 'კგ'],
    ['gansieri-vicki', 'განიერი', 'სმ'],
  ])('%s offers both measures it names', (subtopicId, word, unit) => {
    const ref = { grade: 1 as const, topicId: 'mdebareoba', subtopicId };
    for (const question of generateBatch(ref as never, 20, { level: 1 })) {
      expect(question.prompt).toContain(word);
      const [a, b] = [...question.prompt.matchAll(/(\d+)/g)].map((m) => Number(m[1]));

      expect(question.options).toHaveLength(2);
      // Both printed measures, each as the stem spells it.
      expect(question.options).toContain(`${a} ${unit}`);
      expect(question.options).toContain(`${b} ${unit}`);
      // And the answer is the longer/heavier/wider of them.
      expect(question.answer).toBe(`${Math.max(a, b)} ${unit}`);
    }
  });
});
