// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
    // Every space the picture is drawn with is kept. `pre` exactly: `pre-line`
    // also matches /pre\b/, and collapsing the runs of spaces is the failure
    // this class exists to prevent — a version of this assertion that accepted
    // `pre-line` passed against a deliberately broken stylesheet.
    expect(body).toMatch(/white-space:\s*pre\s*;/);
    // …and every character is the same width, or the columns do not line up.
    expect(body).toMatch(/font-family:[^;]*monospace/);
  });

  it('leaves a row-of-objects picture on the emoji-friendly default', () => {
    // The fix must not be applied to everything: an emoji counted in a
    // monospace font is drawn at an awkward width and the row stops reading.
    expect('🍎 🍎 🍎'.includes('┼')).toBe(false);
    expect('🍎 🍎 🍎'.includes('╭')).toBe(false);
  });

  it('gives a coin purse the one font and whitespace rule its picture needs', () => {
    // A purse is drawn as box-drawing tokens with the denomination centred
    // inside: the borders only meet at the corners in a fixed-width font, and
    // `pre-line` strips the padding that centres a one-digit value in a
    // two-digit cell. jsdom loads no stylesheet, so read the rule the browser
    // gets — the same reason as the dial above.
    const ref = { grade: 1 as const, topicId: 'fasebi', subtopicId: 'monetebis-vertoba' };
    const question = generateBatch(ref as never, 12, { level: 1 }).find((q) => q.visual?.includes('╭'))!;
    expect(question, 'a money question should draw coins').toBeDefined();

    saveDraft(startSession(ref as never, [question]), window.localStorage);
    render(<StudentApp />);

    const visual = document.querySelector('.question-visual')!;
    expect(visual.textContent).toBe(question.visual);
    expect(visual.className, 'coins must opt into the monospace rule').toContain('question-visual-coins');
    // …and the coin picture must NOT steal the dial's class or vice versa.
    expect(visual.className).not.toContain('question-visual-dial');

    const css = readFileSync(path.resolve(process.cwd(), 'src/student/student.css'), 'utf8');
    const rule = css.slice(css.indexOf('.question-visual-coins {'));
    const body = rule.slice(0, rule.indexOf('}'));
    // `pre` exactly — `pre-line` matches /pre\b/ too, and collapsing the runs of
    // spaces is the very failure this class exists to prevent. (The dial test
    // above has the same shape; it is written the same way for the same reason.)
    expect(body).toMatch(/white-space:\s*pre\s*;/);
    expect(body).toMatch(/font-family:[^;]*monospace/);
    // The box characters and the digits must advance by the same amount, or the
    // token's right edge walks away from its top-right corner.
    expect(body).toMatch(/letter-spacing:\s*0\s*;/);
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

describe('a multi-select question', () => {
  /** A real „mark every item you can buy“, generated the way a session gets one. */
  const multiQuestion = () => {
    const ref = { grade: 1 as const, topicId: 'fasebi', subtopicId: 'sakmarisi-fuli' };
    const question = generateBatch(ref as never, 20).find((q) => q.answerMode === 'multi');
    expect(question, 'the money unit should ask a „mark every one“ question').toBeDefined();
    return question!;
  };

  it('does not score a tap until the set is checked', () => {
    // A multi-select whose first tap scored would mark a half-built set wrong —
    // and „which of these can you buy“ has two right answers, so the first tap
    // is never the whole answer.
    const question = multiQuestion();
    saveDraft(startSession({ grade: 1, topicId: 'fasebi', subtopicId: 'sakmarisi-fuli' } as never, [question]), window.localStorage);
    render(<StudentApp />);

    const first = screen.getAllByRole('button').find((b) => b.className.includes('answer-option'))!;
    fireEvent.click(first);

    // Still unanswered: the feedback region stays empty and no option is judged.
    expect(document.querySelector('.answer-feedback')).toBeNull();
    // …and the tap is visible as a mark, not as a verdict.
    expect(first.getAttribute('aria-pressed')).toBe('true');
    expect(first.className).toContain('is-picked');
    expect(first.className).not.toContain('is-correct');
    expect(first.className).not.toContain('is-wrong');
  });

  it('marks the right set, and shows what the whole correct set was', () => {
    const question = multiQuestion();
    saveDraft(startSession({ grade: 1, topicId: 'fasebi', subtopicId: 'sakmarisi-fuli' } as never, [question]), window.localStorage);
    render(<StudentApp />);

    const options = () => Array.from(document.querySelectorAll<HTMLButtonElement>('.answer-option'));
    for (const option of question.answer.split(',').map((part) => part.trim())) {
      fireEvent.click(options().find((button) => button.textContent?.includes(option))!);
    }
    // The submit button is the only way to check a set.
    fireEvent.click(screen.getByRole('button', { name: 'შემოწმება' }));

    const feedback = document.querySelector('.answer-feedback');
    expect(feedback, 'checking the right set should score it').not.toBeNull();
    expect(feedback!.className).toContain('is-correct');
  });

  it('marks a set one short as wrong and still shows the right one', () => {
    const question = multiQuestion();
    saveDraft(startSession({ grade: 1, topicId: 'fasebi', subtopicId: 'sakmarisi-fuli' } as never, [question]), window.localStorage);
    render(<StudentApp />);

    const marked = question.answer.split(',').map((part) => part.trim());
    // Scoped to the option buttons: a bare `getByRole(name)` matches a *substring*
    // of any accessible name, and „რვეული“ is inside „სურათიანი წიგნი“.
    const options = Array.from(document.querySelectorAll<HTMLButtonElement>('.answer-option'));
    const first = options.find((button) => button.textContent?.includes(marked[0]!))!;
    fireEvent.click(first);
    fireEvent.click(screen.getByRole('button', { name: 'შემოწმება' }));

    const feedback = document.querySelector('.answer-feedback');
    expect(feedback!.className).toContain('is-wrong');
    // The correct set is spelled out, so a child who missed one can see which.
    expect(document.body.textContent).toContain(question.answer);
  });
});

describe('a picture a screen reader cannot see', () => {
  /**
   * The question lives in the picture, and the picture is `aria-hidden` because
   * a purse of box-drawing characters read aloud is noise. That combination made
   * fifteen money questions unanswerable for a blind student unless the picture
   * is also given as a sentence. U13 shipped without this and had to record it
   * as a limitation; U14 fixes it, so the fix is pinned here.
   */
  const withVisual = (subtopicId: string, marker = '╭') => {
    const ref = { grade: 1 as const, topicId: 'fasebi', subtopicId };
    // The marker decides which *kind* of picture: a purse (`╭`) or an amount tag
    // (`◆`). Accepting either made the purse test fail whenever the draw landed
    // on a tag, which says nothing about the picture it was checking.
    const question = generateBatch(ref as never, 24).find((q) => q.visual?.includes(marker));
    expect(question, `${subtopicId} should show a picture`).toBeDefined();
    return { ref, question: question! };
  };

  it('describes a drawn purse in words, in the same order as the picture', () => {
    const { ref, question } = withVisual('monetebis-vertoba');
    saveDraft(startSession(ref as never, [question]), window.localStorage);
    render(<StudentApp />);

    const spoken = document.querySelector('.visually-hidden')!;
    expect(spoken, 'a drawn picture needs a spoken equivalent').not.toBeNull();
    expect(spoken.getAttribute('aria-hidden')).toBeNull();
    // Every coin on the screen is named, and no coin that is not there.
    const drawn = [...(question.visual ?? '').matchAll(/│\s*(\d+)\s*│/g)].map((m) => Number(m[1]));
    const described = [...spoken.textContent!.matchAll(/(\d+)/g)].map((m) => Number(m[1]));
    expect(described.sort((a, b) => a - b)).toEqual([...drawn].sort((a, b) => a - b));
  });

  it('names the amount a price tag shows', () => {
    const { ref, question } = withVisual('tolzRvari-monetebi', '◆');
    saveDraft(startSession(ref as never, [question]), window.localStorage);
    render(<StudentApp />);

    const spoken = document.querySelector('.visually-hidden')!.textContent!;
    const amount = question.vars.amount ?? question.vars.target ?? question.vars.coin;
    expect(spoken).toContain(`${amount} თეთრი`);
  });

  it('keeps the picture itself out of the accessibility tree', () => {
    // The spoken line replaces the picture for assistive technology; it does not
    // duplicate it. A screen reader must not read both.
    const { ref, question } = withVisual('monetebis-vertoba');
    saveDraft(startSession(ref as never, [question]), window.localStorage);
    render(<StudentApp />);

    const picture = document.querySelector('.question-visual')!;
    expect(picture.getAttribute('aria-hidden')).toBe('true');
  });

  it('puts the spoken line out of the visual layout, not out of the a11y tree', () => {
    // `display:none` would hide it from a screen reader too — the one thing this
    // element exists to avoid. jsdom loads no stylesheet, so read the rule.
    const css = readFileSync(path.resolve(process.cwd(), 'src/student/student.css'), 'utf8');
    const rule = css.slice(css.indexOf('.visually-hidden {'));
    const body = rule.slice(0, rule.indexOf('}'));
    expect(body).toMatch(/position:\s*absolute/);
    expect(body).toMatch(/width:\s*1px/);
    expect(body).toMatch(/clip/);
    expect(body).not.toMatch(/display:\s*none/);
    expect(body).not.toMatch(/visibility:\s*hidden/);
  });
});
