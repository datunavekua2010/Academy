// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';
import { LESSON_CONTENT } from '../src/lessons/content';
import { describeAnswer, evaluateAnswer } from '../src/lessons/check';
import { getUnit } from '../src/lessons/catalog';
import { divisionOf } from '../src/lessons/exercises/ShapeGeometry';
import {
  HALF_CUTS,
  HALF_CUTS_DIAGONAL,
  HALF_CUTS_TURNED,
  QUARTER_CUTS,
  QUARTER_CUTS_STRIPES,
  THIRD_CUTS,
  UNEQUAL_THIRDS,
  allPicks,
  denominatorOf,
  denominatorWords,
  equalPartsSpec,
  fractionName,
  fractionOf,
  fractionSentence,
  fractionText,
  fractionValue,
  hasEqualPieces,
  isCutInto,
  isUnitFraction,
  numeratorWords,
  partWords,
  piecesOf,
  picksExactly,
  showsFraction,
} from '../src/lessons/exercises/FractionGeometry';
import { FractionBadge, FractionNameAnswer, FractionPickAnswer, FractionPicture, PartsJudgeAnswer } from '../src/lessons/exercises/FractionBoard';
import { EqualPartsLab, FractionDemo, HalvesLab, NumeratorLab, QuartersLab, ShapePartsPicture, ThirdsLab, fractionCaption } from '../src/lessons/exercises/FractionTools';
import type { Lesson, QuestionActivity, ResponseSpec, ShapeKind, ShapeSpec } from '../src/lessons/types';

/**
 * Grade 2 · Unit 7: "Halves, Quarters, Thirds, & Unit Fractions".
 *
 * A fraction is a statement about equal parts. Every judgement below comes from the areas `divisionOf` measures, so a
 * three-piece cut with three different sizes is never called thirds — least of all on a circle, which no straight-line
 * cut can divide into equal thirds.
 */

const U07 = ['g2-u07-l1', 'g2-u07-l2', 'g2-u07-l3', 'g2-u07-l4', 'g2-u07-l5'];
const lessons = U07.map((id) => LESSON_CONTENT[id]);
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);
const text = (sel: string) => document.querySelector(sel)?.textContent ?? '';
const shapes: ShapeKind[] = ['circle', 'square', 'rect'];
const specOf = (shape: ShapeKind, parts: number): ShapeSpec => {
  const spec = equalPartsSpec(shape, parts);
  if (!spec) throw new Error(`${shape} has no ${parts}`);
  return spec;
};

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 2 U07 is the fractions unit', () => {
  it('has the approved titles, ids and codes', () => {
    const unit = getUnit('g2-u07');
    expect(unit?.title).toBe('Halves, Quarters, Thirds, & Unit Fractions');
    expect(unit?.grade).toBe(2);
    expect(unit?.lessons.map((l) => l.id)).toEqual(U07);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U07.1', 'U07.2', 'U07.3', 'U07.4', 'U07.5']);
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Understanding Fractions as Equal Parts of a Whole',
      'Recognizing and Representing Halves',
      'Recognizing and Representing Quarters',
      'Recognizing and Representing Thirds',
      'Understanding Unit Fractions and Their Numerators and Denominators',
    ]);
  });

  it('has content for every one of the five lessons', () => {
    for (const id of U07) {
      expect(LESSON_CONTENT[id], id).toBeTruthy();
      expect(LESSON_CONTENT[id].id).toBe(id);
      expect(LESSON_CONTENT[id].status).toBe('placeholder');
    }
  });
});

// ─────────────────────────── the engine ───────────────────────────

describe('fraction: the denominator is measured, not asserted', () => {
  it('reads the number of equal pieces off the real areas', () => {
    for (const shape of shapes) {
      expect(denominatorOf(specOf(shape, 2)), shape).toBe(2);
      expect(denominatorOf(specOf(shape, 4)), shape).toBe(4);
      expect(isCutInto(specOf(shape, 2), 2), shape).toBe(true);
      expect(isCutInto(specOf(shape, 4), 2), shape).toBe(false);
      expect(piecesOf(specOf(shape, 4)), shape).toEqual([1, 2, 3, 4]);
    }
  });

  it('thirds are only offered where the cut really is equal', () => {
    for (const shape of ['square', 'rect'] as ShapeKind[]) {
      const spec = specOf(shape, 3);
      expect(denominatorOf(spec), shape).toBe(3);
      // three columns of equal width, built rather than hoped for
      const areas = divisionOf(spec).pieces.map((p) => p.area);
      expect(Math.max(...areas) - Math.min(...areas), shape).toBeLessThan(1e-6);
    }
    // a circle cannot be cut into equal thirds by straight lines, so it is never offered
    expect(equalPartsSpec('circle', 3)).toBeNull();
    expect(hasEqualPieces({ shape: 'circle', cuts: THIRD_CUTS.circle })).toBe(false);
  });

  it('refuses a cut that has three parts but not three equal parts', () => {
    for (const shape of shapes) {
      const unequal: ShapeSpec = { shape, cuts: UNEQUAL_THIRDS[shape] };
      expect(hasEqualPieces(unequal), shape).toBe(false);
      expect(denominatorOf(unequal), shape).toBeNull();
      expect(fractionOf(unequal, [1]), shape).toBeNull();
    }
  });

  it('halves and quarters are equal however they are cut', () => {
    for (const shape of shapes) {
      for (const cuts of [HALF_CUTS[shape], HALF_CUTS_TURNED[shape], HALF_CUTS_DIAGONAL[shape]]) {
        const spec: ShapeSpec = { shape, cuts };
        expect(denominatorOf(spec), `${shape}/${JSON.stringify(cuts)}`).toBe(2);
      }
      for (const cuts of [QUARTER_CUTS[shape], QUARTER_CUTS_STRIPES[shape]]) {
        const spec: ShapeSpec = { shape, cuts };
        expect(denominatorOf(spec), `${shape}/${JSON.stringify(cuts)}`).toBe(4);
      }
    }
  });

  it('any equal-parts spec is only ever returned when the pieces really are equal', () => {
    for (const shape of shapes)
      for (const parts of [2, 3, 4]) {
        const spec = equalPartsSpec(shape, parts);
        if (spec) expect(hasEqualPieces(spec), `${shape}/${parts}`).toBe(true);
      }
    expect(equalPartsSpec('square', 5)).toBeNull();
  });
});

describe('fraction: the numerator is how many parts are taken', () => {
  it('counts only real pieces', () => {
    const spec = specOf('square', 4);
    expect(fractionOf(spec, [])).toEqual({ numerator: 0, denominator: 4 });
    expect(fractionOf(spec, [1])).toEqual({ numerator: 1, denominator: 4 });
    expect(fractionOf(spec, [1, 2, 3])).toEqual({ numerator: 3, denominator: 4 });
    expect(fractionOf(spec, [1, 2, 3, 4])).toEqual({ numerator: 4, denominator: 4 });
    // a piece number outside the whole is not a part of it
    expect(fractionOf(spec, [9])).toEqual({ numerator: 0, denominator: 4 });
  });

  it('compares a picture with a written fraction', () => {
    const spec = specOf('circle', 4);
    expect(showsFraction(spec, [1, 2, 3], { numerator: 3, denominator: 4 })).toBe(true);
    expect(showsFraction(spec, [1, 2], { numerator: 3, denominator: 4 })).toBe(false);
    expect(showsFraction(spec, [1, 2], { numerator: 2, denominator: 3 })).toBe(false);
    expect(showsFraction({ shape: 'square', cuts: UNEQUAL_THIRDS.square }, [1, 2], { numerator: 2, denominator: 3 })).toBe(false);
  });

  it('reads a fraction as a share of the whole', () => {
    expect(fractionValue({ numerator: 1, denominator: 2 })).toBe(0.5);
    expect(fractionValue({ numerator: 3, denominator: 4 })).toBe(0.75);
    expect(fractionValue({ numerator: 2, denominator: 3 })).toBeCloseTo(2 / 3, 10);
    expect(fractionValue({ numerator: 1, denominator: 0 })).toBe(0);
    expect(fractionText({ numerator: 3, denominator: 4 })).toBe('3/4');
    expect(partWords({ numerator: 2, denominator: 3 })).toBe('2 / 3');
  });

  it('a unit fraction is one equal part, and only that', () => {
    for (let d = 2; d <= 6; d += 1) expect(isUnitFraction({ numerator: 1, denominator: d }), String(d)).toBe(true);
    expect(isUnitFraction({ numerator: 2, denominator: 4 })).toBe(false);
    expect(isUnitFraction({ numerator: 1, denominator: 1 })).toBe(false);
    expect(isUnitFraction({ numerator: 0, denominator: 4 })).toBe(false);
  });
});

describe('fraction: names and sentences', () => {
  it('names halves, thirds and quarters', () => {
    expect(fractionName({ numerator: 1, denominator: 2 })).toBe('ნახევარი');
    expect(fractionName({ numerator: 1, denominator: 3 })).toBe('მესამედი');
    expect(fractionName({ numerator: 1, denominator: 4 })).toBe('მეოთხედი');
    expect(fractionName({ numerator: 3, denominator: 4 })).toBe('3 მეოთხედი');
    expect(fractionName({ numerator: 2, denominator: 3 })).toBe('2 მესამედი');
    expect(fractionName({ numerator: 5, denominator: 6 })).toBe('5/6');
  });

  it('says what the denominator and the numerator mean', () => {
    expect(denominatorWords(4)).toBe('მთელი დაყოფილია 4 ტოლ ნაწილად.');
    expect(numeratorWords(3)).toBe('აღებულია 3 ნაწილი.');
    const sentence = fractionSentence({ numerator: 3, denominator: 4 });
    expect(sentence).toContain('4 ტოლ ნაწილად');
    expect(sentence).toContain('აღებულია 3');
    expect(sentence).toContain('3/4');
  });
});

describe('fraction: picking parts', () => {
  it('accepts any real pick of the right size', () => {
    const spec = specOf('square', 4);
    expect(picksExactly(spec, [1, 2], 2)).toBe(true);
    expect(picksExactly(spec, [2, 4], 2)).toBe(true);
    expect(picksExactly(spec, [1, 2, 3], 2)).toBe(false);
    expect(picksExactly(spec, [1, 5], 2)).toBe(false);
    expect(allPicks(4, 2)).toEqual([
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 3],
      [2, 4],
      [3, 4],
    ]);
    expect(allPicks(3, 1)).toEqual([[1], [2], [3]]);
  });
});

// ─────────────────────────── checking ───────────────────────────

const q = (response: ResponseSpec, extra: Partial<QuestionActivity> = {}): QuestionActivity => ({
  id: 'x',
  kind: 'question',
  stage: 'practice',
  prompt: 'x',
  response,
  hints: [],
  explanation: 'y',
  ...extra,
});

describe('checking: are the parts equal?', () => {
  const equal = q({ type: 'parts-judge', shape: specOf('circle', 2) });
  const unequal = q({ type: 'parts-judge', shape: { shape: 'square', cuts: UNEQUAL_THIRDS.square } });

  it('is decided by the areas, not by how many pieces there are', () => {
    expect(evaluateAnswer(equal, '1').verdict).toBe('correct');
    expect(evaluateAnswer(equal, '0').verdict).toBe('incorrect');
    expect(evaluateAnswer(unequal, '0').verdict).toBe('correct');
    expect(evaluateAnswer(unequal, '1').verdict).toBe('incorrect');
    expect(evaluateAnswer(equal, '').verdict).toBe('incomplete');
  });

  it('a three-piece cut with unequal pieces is told why it is not thirds', () => {
    const wrong = evaluateAnswer(q({ type: 'parts-judge', shape: { shape: 'square', cuts: UNEQUAL_THIRDS.square } }, { fallbackFeedback: 'ჯერ არ არის ზუსტი.' }), '1');
    expect(wrong.verdict).toBe('incorrect');
    expect(wrong.feedback).toBeTruthy();
    expect(wrong.feedback).toContain('ჯერ არ არის ზუსტი');
  });
});

describe('checking: picking parts of a whole', () => {
  const pick = q({ type: 'fraction-pick', shape: specOf('square', 4), need: 2 });

  it('wants exactly that many real pieces, whichever ones', () => {
    for (const picked of allPicks(4, 2)) expect(evaluateAnswer(pick, picked.join(',')).verdict, String(picked)).toBe('correct');
    expect(evaluateAnswer(pick, '1').verdict).toBe('incorrect');
    expect(evaluateAnswer(pick, '1,2,3').verdict).toBe('incorrect');
    expect(evaluateAnswer(pick, '').verdict).toBe('incomplete');
  });

  it('picking too few says how many are wanted', () => {
    const wrong = evaluateAnswer(pick, '1');
    expect(wrong.verdict).toBe('incorrect');
    expect(wrong.feedback).toContain('2');
  });
});

describe('checking: reading a fraction off a picture', () => {
  const read = q({ type: 'fraction-name', shape: specOf('circle', 4), take: [1, 2, 3] });

  it('wants the numerator first and the denominator second', () => {
    expect(evaluateAnswer(read, '3,4').verdict).toBe('correct');
    expect(evaluateAnswer(read, '1,4').verdict).toBe('incorrect');
    expect(evaluateAnswer(read, '3,').verdict).toBe('incomplete');
    expect(evaluateAnswer(read, '').verdict).toBe('incomplete');
  });

  it('a pair written the other way round is named as a swap', () => {
    const swapped = evaluateAnswer(read, '4,3');
    expect(swapped.verdict).toBe('incorrect');
    expect(swapped.feedback).toContain('მრიცხველი');
    expect(swapped.feedback).toContain('მნიშვნელი');
  });

  it('a shape whose parts are not equal has no fraction to read', () => {
    const bad = evaluateAnswer(q({ type: 'fraction-name', shape: { shape: 'square', cuts: UNEQUAL_THIRDS.square }, take: [1] }), '1,3');
    expect(bad.verdict).toBe('incorrect');
    expect(bad.feedback).toBeTruthy();
  });
});

describe('checking: the answers can be described', () => {
  it('says the equality and the fraction', () => {
    expect(describeAnswer({ type: 'parts-judge', shape: specOf('circle', 2) })).toBe('ტოლი ნაწილები');
    expect(describeAnswer({ type: 'parts-judge', shape: { shape: 'square', cuts: UNEQUAL_THIRDS.square } })).toBe('არატოლი ნაწილები');
    expect(describeAnswer({ type: 'fraction-pick', shape: specOf('square', 4), need: 2 })).toContain('2');
    expect(describeAnswer({ type: 'fraction-name', shape: specOf('circle', 4), take: [1, 2, 3] })).toBe('3/4');
  });
});

// ─────────────────────────── content invariants ───────────────────────────

describe('content: the ten activities of every lesson', () => {
  it('runs challenge, explore, understand, four practice and three checks', () => {
    for (const l of lessons) {
      expect(l.activities.map((a) => a.id), l.id).toEqual([
        'challenge',
        'explore',
        'understand',
        'practice-1',
        'practice-2',
        'practice-3',
        'practice-4',
        'check-1',
        'check-2',
        'check-3',
      ]);
      expect(l.activities.map((a) => a.kind), l.id).toEqual(['question', 'explore', 'explain', 'question', 'question', 'question', 'question', 'question', 'question', 'question']);
    }
  });

  it('hints only where they belong, and the challenge never gives the answer away', () => {
    for (const l of lessons) {
      for (const x of stageOf(l, 'check')) expect(x.hints, `${l.id}/${x.id}`).toEqual([]);
      for (const x of stageOf(l, 'practice')) expect(x.hints.length, `${l.id}/${x.id}`).toBeGreaterThan(0);
      const challenge = l.activities[0];
      if (challenge.kind === 'question') expect(challenge.revealOnExhaust).toBe(false);
    }
  });

  it('every question explains itself and has feedback in its own words', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        expect(x.explanation.length, `${l.id}/${x.id}`).toBeGreaterThan(5);
        expect(x.fallbackFeedback?.length, `${l.id}/${x.id}`).toBeGreaterThan(5);
      }
  });

  it('each lesson has one explore tool and a demonstration of more than two blocks', () => {
    for (const l of lessons) {
      const explore = l.activities.find((a) => a.kind === 'explore') as Extract<Lesson['activities'][number], { kind: 'explore' }>;
      expect(explore.tool, l.id).toBeTruthy();
      const explain = l.activities.find((a) => a.kind === 'explain') as Extract<Lesson['activities'][number], { kind: 'explain' }>;
      expect(explain.blocks.length, l.id).toBeGreaterThan(2);
    }
  });
});

/** The answer a question expects, computed from the geometry the question ships. */
function correctAnswer(r: ResponseSpec): string {
  switch (r.type) {
    case 'choice':
      return r.answer;
    case 'numeric':
      return String(r.answer);
    case 'parts-judge':
      return hasEqualPieces(r.shape) ? '1' : '0';
    case 'fraction-pick':
      return piecesOf(r.shape).slice(0, r.need).join(',');
    case 'fraction-name': {
      const f = fractionOf(r.shape, r.take);
      if (!f) throw new Error('not a fraction');
      return `${f.numerator},${f.denominator}`;
    }
    default:
      throw new Error(`no answer for ${r.type}`);
  }
}

describe('content: every question is answerable from its own geometry', () => {
  it('the engine agrees with the content, question by question', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const verdict = evaluateAnswer(x, correctAnswer(x.response)).verdict;
        expect(verdict, `${l.id}/${x.id} (${x.response.type})`).toBe('correct');
      }
  });

  it('no question ever asks about a circle cut into thirds', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type === 'parts-judge' || r.type === 'fraction-pick' || r.type === 'fraction-name') {
          if (r.shape.shape !== 'circle' || divisionOf(r.shape).pieces.length !== 3) continue;
          expect(hasEqualPieces(r.shape), `${l.id}/${x.id}`).toBe(false);
        }
      }
  });

  it('every equal-parts judgement really is a judgement about the areas', () => {
    const judges = lessons.flatMap((l) => questions(l).filter((x) => x.response.type === 'parts-judge').map((x) => ({ l, r: x.response as Extract<ResponseSpec, { type: 'parts-judge' }> })));
    expect(judges.length).toBeGreaterThan(6);
    let equal = 0;
    let unequal = 0;
    for (const { l, r } of judges) {
      const pieces = divisionOf(r.shape).pieces.length;
      expect(pieces, l.id).toBeGreaterThanOrEqual(2);
      if (hasEqualPieces(r.shape)) equal += 1;
      else unequal += 1;
    }
    // the lesson has to look at both, or it is only teaching one half of the idea
    expect(equal).toBeGreaterThan(2);
    expect(unequal).toBeGreaterThan(2);
  });

  it('picking asks for no more parts than the whole has', () => {
    const picks = lessons.flatMap((l) => questions(l).filter((x) => x.response.type === 'fraction-pick').map((x) => ({ l, r: x.response as Extract<ResponseSpec, { type: 'fraction-pick' }> })));
    expect(picks.length).toBeGreaterThan(3);
    for (const { l, r } of picks) {
      const parts = piecesOf(r.shape).length;
      expect(hasEqualPieces(r.shape), l.id).toBe(true);
      expect(r.need, l.id).toBeGreaterThanOrEqual(1);
      expect(r.need, l.id).toBeLessThanOrEqual(parts);
    }
  });

  it('reading a fraction always shows equal parts, and takes at least one of them', () => {
    const reads = lessons.flatMap((l) => questions(l).filter((x) => x.response.type === 'fraction-name').map((x) => ({ l, r: x.response as Extract<ResponseSpec, { type: 'fraction-name' }> })));
    expect(reads.length).toBeGreaterThan(2);
    for (const { l, r } of reads) {
      const f = fractionOf(r.shape, r.take);
      expect(f, l.id).not.toBeNull();
      expect(f!.numerator, l.id).toBeGreaterThan(0);
      expect(f!.denominator, l.id).toBeGreaterThan(1);
    }
  });

  it('the four lessons of halves, quarters and thirds use their own labs', () => {
    const tool = (id: string) => (LESSON_CONTENT[id].activities.find((a) => a.kind === 'explore') as Extract<Lesson['activities'][number], { kind: 'explore' }>).tool;
    expect(tool('g2-u07-l1').tool).toBe('equal-parts-lab');
    expect(tool('g2-u07-l2').tool).toBe('halves-lab');
    expect(tool('g2-u07-l3').tool).toBe('quarters-lab');
    expect(tool('g2-u07-l4').tool).toBe('thirds-lab');
    expect(tool('g2-u07-l5').tool).toBe('fraction-lab2');
  });
});

// ─────────────────────────── boards ───────────────────────────

describe('board: a fraction picture', () => {
  it('draws the pieces and states the fraction underneath', () => {
    render(<FractionPicture spec={specOf('circle', 4)} take={[1]} />);
    expect(document.querySelectorAll('.sh-piece')).toHaveLength(4);
    expect(screen.getByLabelText(fractionSentence({ numerator: 1, denominator: 4 }))).toBeTruthy();
    expect(text('.frc-num')).toBe('1');
    expect(text('.frc-den')).toBe('4');
    expect(text('.frc-name')).toBe('მეოთხედი');
    expect(text('.frc-words')).toContain('4 ტოლ ნაწილად');
  });

  it('says outright when the parts are not equal', () => {
    render(<FractionPicture spec={{ shape: 'square', cuts: UNEQUAL_THIRDS.square }} />);
    expect(text('.frc-unequal')).toContain('ტოლი არ არის');
    expect(text('.frc-words')).toBe('');
    expect(screen.getByLabelText('დაყოფილი კვადრატი: ნაწილები ტოლი არ არის')).toBeTruthy();
  });

  it('can show a picture without stating the fraction, for reading questions', () => {
    render(<ShapePartsPicture spec={specOf('rect', 3)} take={[1, 2]} caption="ორი მესამედი" />);
    expect(screen.getByLabelText(fractionSentence({ numerator: 2, denominator: 3 }))).toBeTruthy();
    expect(text('.frc-cap')).toBe('ორი მესამედი');
    // the caption helper says the same thing as the picture's own arithmetic
    expect(fractionCaption(specOf('rect', 3), [1, 2])).toBe('2/3 — 2 მესამედი');
  });

  it('a badge reads as a stacked fraction', () => {
    render(<FractionBadge numerator={3} denominator={4} />);
    expect(screen.getByLabelText('3/4')).toBeTruthy();
  });
});

describe('board: answer controls', () => {
  it('judging equal parts shows no fraction while the student decides', () => {
    render(<PartsJudgeAnswer response={{ shape: specOf('circle', 2) }} value="" onChange={vi.fn()} disabled={false} label="ნაწილები" />);
    expect(text('.fj-note')).toContain('2');
    expect(text('.frc-num')).toBe('');
    expect(screen.getByRole('button', { name: '✓ ტოლი ნაწილები' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '✗ არატოლი ნაწილები' })).toBeTruthy();
  });

  it('judging reports the fact once a choice is made', () => {
    const onChange = vi.fn();
    render(<PartsJudgeAnswer response={{ shape: specOf('circle', 2) }} value="" onChange={onChange} disabled={false} label="ნაწილები" />);
    fireEvent.click(screen.getByRole('button', { name: '✓ ტოლი ნაწილები' }));
    expect(onChange).toHaveBeenLastCalledWith('1');
    cleanup();
    render(<PartsJudgeAnswer response={{ shape: { shape: 'square', cuts: UNEQUAL_THIRDS.square } }} value="0" onChange={vi.fn()} disabled={false} label="ნაწილები" />);
    expect(text('.fj-note')).toContain('სხვადასხვა ზომისაა');
  });

  it('picking parts counts them and names the fraction built so far', () => {
    const onChange = vi.fn();
    render(<FractionPickAnswer response={{ shape: specOf('square', 4), need: 2 }} value="" onChange={onChange} disabled={false} label="ნაწილები" />);
    expect(text('.fp-ask')).toContain('მონიშნე');
    expect(text('.fp-ask')).toContain('2');
    fireEvent.click(screen.getByLabelText('ნაწილი 1'));
    expect(onChange).toHaveBeenLastCalledWith('1');
    cleanup();
    render(<FractionPickAnswer response={{ shape: specOf('square', 4), need: 2 }} value="1,3" onChange={vi.fn()} disabled={false} label="ნაწილები" />);
    expect(text('.fp-note')).toContain('2/4');
    fireEvent.click(screen.getByLabelText('ნაწილი 1'));
  });

  it('taking a part back reports the shorter list', () => {
    const onChange = vi.fn();
    render(<FractionPickAnswer response={{ shape: specOf('square', 4), need: 2 }} value="1,3" onChange={onChange} disabled={false} label="ნაწილები" />);
    fireEvent.click(screen.getByLabelText('ნაწილი 1'));
    expect(onChange).toHaveBeenLastCalledWith('3');
  });

  it('reading a fraction asks for the numerator and the denominator separately', () => {
    const onChange = vi.fn();
    render(<FractionNameAnswer response={{ shape: specOf('circle', 4), take: [1, 2, 3] }} value="" onChange={onChange} disabled={false} label="ფრაქცია" />);
    expect(text('.fn-slot')).toContain('მრიცხველი');
    expect(document.body.textContent).toContain('მნიშვნელი');
    fireEvent.change(screen.getByLabelText('მრიცხველი'), { target: { value: '3' } });
    expect(onChange).toHaveBeenLastCalledWith('3,');
    fireEvent.change(screen.getByLabelText('მნიშვნელი'), { target: { value: '4' } });
    expect(onChange).toHaveBeenLastCalledWith(',4');
  });

  it('the reading board states the fraction the picture really shows', () => {
    render(<FractionNameAnswer response={{ shape: specOf('circle', 4), take: [1, 2, 3] }} value="3,4" onChange={vi.fn()} disabled={false} label="ფრაქცია" />);
    expect(text('.fn-note')).toContain('4 ტოლ ნაწილად');
    expect(text('.fn-note')).toContain('3');
  });
});

// ─────────────────────────── tools ───────────────────────────

describe('tools: the equal-parts lab', () => {
  it('picks parts out of a whole and keeps the denominator fixed', () => {
    render(<EqualPartsLab tool={{ tool: 'equal-parts-lab', parts: 4, shapes: ['circle', 'square'] }} />);
    expect(text('.lab-facts')).toContain('მნიშვნელი: 4');
    expect(text('.lab-facts')).toContain('მრიცხველი: 0');
    fireEvent.click(screen.getByRole('button', { name: 'აიღე ერთი ნაწილი' }));
    expect(text('.lab-facts')).toContain('მრიცხველი: 1');
    expect(text('.lab-status')).toContain('1/4');
    fireEvent.click(screen.getByRole('button', { name: 'აიღე ყველა' }));
    expect(text('.lab-facts')).toContain('მრიცხველი: 4');
  });

  it('switching the shape keeps the same number of equal parts', () => {
    render(<EqualPartsLab tool={{ tool: 'equal-parts-lab', parts: 2, shapes: ['circle', 'square'] }} />);
    expect(Array.from(document.querySelectorAll('.xt-mode')).map((b) => b.textContent)).toEqual(['წრე', 'კვადრატი']);
    fireEvent.click(screen.getByRole('button', { name: 'კვადრატი' }));
    expect(text('.lab-facts')).toContain('მნიშვნელი: 2');
    fireEvent.click(screen.getByRole('button', { name: '↻ გასუფთავება' }));
    expect(text('.lab-facts')).toContain('მრიცხველი: 0');
  });
});

describe('tools: the halves lab', () => {
  it('offers more than one way to cut a half, and all of them are halves', () => {
    render(<HalvesLab tool={{ tool: 'halves-lab', shapes: ['square'] }} />);
    expect(Array.from(document.querySelectorAll('.xt-mode')).map((b) => b.textContent)).toEqual(['ჰორიზონტალურად', 'ვერტიკალურად', 'დიაგონალურად']);
    expect(text('.lab-status')).toContain('ორი ტოლი ნაწილი');
    for (const mode of ['ვერტიკალურად', 'დიაგონალურად']) {
      fireEvent.click(screen.getByRole('button', { name: mode }));
      expect(text('.lab-status'), mode).toContain('ორი ტოლი ნაწილი');
      expect(text('.lab-facts'), mode).toContain('ნაწილები: 2');
    }
  });

  it('taking a part says which fraction it is', () => {
    render(<HalvesLab tool={{ tool: 'halves-lab', shapes: ['square'] }} />);
    fireEvent.click(screen.getByLabelText('ნაწილი 1'));
    expect(text('.lab-status')).toContain('1/2');
    expect(text('.lab-facts')).toContain('აღებული: 1');
  });
});

describe('tools: the quarters lab', () => {
  it('cuts four equal parts two ways, and neither is "the" way', () => {
    render(<QuartersLab tool={{ tool: 'quarters-lab', shapes: ['square'] }} />);
    expect(Array.from(document.querySelectorAll('.xt-mode')).map((b) => b.textContent)).toEqual(['ჯვარედინად', 'ზოლებად']);
    for (const mode of ['ჯვარედინად', 'ზოლებად']) {
      fireEvent.click(screen.getByRole('button', { name: mode }));
      expect(text('.lab-status'), mode).toContain('ოთხი ტოლი ნაწილი');
      expect(text('.lab-facts'), mode).toContain('ნაწილები: 4');
    }
  });

  it('picks quarters and reports the fraction', () => {
    render(<QuartersLab tool={{ tool: 'quarters-lab', shapes: ['circle'] }} />);
    fireEvent.click(screen.getByLabelText('ნაწილი 2'));
    expect(text('.lab-status')).toContain('1/4');
  });
});

describe('tools: the thirds lab', () => {
  it('puts equal thirds beside three unequal pieces and says which is which', () => {
    render(<ThirdsLab tool={{ tool: 'thirds-lab', shapes: ['square'] }} />);
    expect(text('.lab-status')).toContain('ეს მესამედებია');
    expect(text('.lab-status')).toContain('ეს მესამედები არ არის');
    expect(text('.lab-facts')).toContain('მარცხენა: 3 ტოლი');
    expect(screen.getByLabelText('სამი ტოლი ნაწილი')).toBeTruthy();
    expect(screen.getByLabelText('სამი არატოლი ნაწილი')).toBeTruthy();
  });

  it('only the equal one can be picked into a fraction', () => {
    render(<ThirdsLab tool={{ tool: 'thirds-lab', shapes: ['rect'] }} />);
    fireEvent.click(screen.getByLabelText('ნაწილი 1'));
    expect(text('.lab-status')).toContain('1/3');
  });
});

describe('tools: the numerator lab', () => {
  it('watching the numerator change keeps the denominator fixed', () => {
    render(<NumeratorLab tool={{ tool: 'fraction-lab2', shapes: [{ shape: 'circle', parts: 4 }, { shape: 'rect', parts: 3 }] }} />);
    expect(text('.lab-facts')).toContain('მნიშვნელი: 4');
    fireEvent.click(screen.getByLabelText('ნაწილი 1'));
    expect(text('.lab-facts')).toContain('მრიცხველი: 1');
    expect(text('.lab-status')).toContain('1/4');
    fireEvent.click(screen.getByLabelText('ნაწილი 3'));
    expect(text('.lab-status')).toContain('2/4');
  });

  it('switching to three parts changes the denominator and starts again', () => {
    render(<NumeratorLab tool={{ tool: 'fraction-lab2', shapes: [{ shape: 'circle', parts: 4 }, { shape: 'rect', parts: 3 }] }} />);
    fireEvent.click(screen.getByLabelText('ნაწილი 1'));
    fireEvent.click(screen.getByRole('button', { name: '3 ნაწილი' }));
    expect(text('.lab-facts')).toContain('მნიშვნელი: 3');
    expect(text('.lab-facts')).toContain('მრიცხველი: 0');
  });
});

describe('tools: the fraction demo', () => {
  it('walks the whole, the cut and the parts taken', () => {
    render(<FractionDemo block={{ type: 'fraction-demo', shape: 'circle', parts: 4, take: 2, steps: ['ა', 'ბ', 'გ'] }} />);
    expect(text('.demo-badge')).toBe('ტოლი ნაწილები');
    expect(text('.demo-rule')).toContain('4 ტოლ ნაწილად');
    expect(text('.demo-rule')).toContain('2/4');
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(text('.demo-rule')).toContain('აღებულია 2');
  });
});

// ─────────────────────────── the player ───────────────────────────

const go = (hash: string) => {
  window.location.hash = hash;
  render(<StudentApp />);
};
const next = () => fireEvent.click(screen.getByRole('button', { name: 'გაგრძელება' }));
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'პასუხის შემოწმება' }));
const feedback = () => document.querySelector('.lp-feedback')?.textContent ?? '';
const saved = () => JSON.parse(window.localStorage.getItem(LEARN_STORAGE_KEY) ?? '{}');
const radio = (i: number) => fireEvent.click(screen.getAllByRole('radio')[i]);

beforeEach(() => {
  window.localStorage.clear();
  resetProgressCache();
  window.location.hash = '';
  window.scrollTo = vi.fn();
});
afterEach(() => {
  cleanup();
  window.localStorage.clear();
  resetProgressCache();
  window.location.hash = '';
  document.body.style.overflow = '';
});

/** Answers the question on screen with its own correct answer, through the real controls. */
function answerCorrectly(x: QuestionActivity) {
  const r = x.response;
  switch (r.type) {
    case 'choice':
      radio(r.options.findIndex((o) => o.id === r.answer));
      break;
    case 'numeric':
      fireEvent.change(screen.getByRole('textbox'), { target: { value: String(r.answer) } });
      break;
    case 'parts-judge':
      fireEvent.click(screen.getByRole('button', { name: hasEqualPieces(r.shape) ? '✓ ტოლი ნაწილები' : '✗ არატოლი ნაწილები' }));
      break;
    case 'fraction-pick':
      for (const n of piecesOf(r.shape).slice(0, r.need)) fireEvent.click(screen.getByLabelText(`ნაწილი ${n}`));
      break;
    case 'fraction-name': {
      const f = fractionOf(r.shape, r.take);
      if (!f) throw new Error('not a fraction');
      fireEvent.change(screen.getByLabelText('მრიცხველი'), { target: { value: String(f.numerator) } });
      fireEvent.change(screen.getByLabelText('მნიშვნელი'), { target: { value: String(f.denominator) } });
      break;
    }
    default:
      throw new Error(`no walker for ${r.type}`);
  }
  submit();
}

function playThrough(lesson: Lesson) {
  const last = lesson.activities.length - 1;
  lesson.activities.forEach((a, i) => {
    if (a.kind === 'question') {
      answerCorrectly(a);
      expect(feedback(), `${lesson.id}/${a.id}`).toContain('სწორია');
    }
    fireEvent.click(screen.getByRole('button', { name: i === last ? 'გაკვეთილის დასრულება' : 'გაგრძელება' }));
  });
}

describe('g2-u07 unit page', () => {
  it('lists the five lessons, all playable and in order', () => {
    go('#/student/lessons/g2-u07');
    const list = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(list).toHaveLength(5);
    U07.forEach((id, i) => expect(within(list[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
  });
});

describe.each(U07.map((id) => [id] as const))('%s plays to the end', (id) => {
  it('every step works with its own correct answers and the progress is saved', () => {
    const lesson = LESSON_CONTENT[id];
    go(`#/student/lessons/${id}`);
    expect(screen.getByText(`ნაბიჯი 1 / ${lesson.activities.length}`)).toBeTruthy();
    playThrough(lesson);
    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    const checks = stageOf(lesson, 'check').length;
    expect(screen.getByText(`${checks} / ${checks}`)).toBeTruthy();
    expect(saved()[id]).toMatchObject({ status: 'completed', checkCorrect: checks, checkTotal: checks });
    const n = Number(id.slice(-1));
    if (n < 5) {
      expect(screen.getByRole('link', { name: `გაგრძელება: U07.${n + 1}` }).getAttribute('href')).toBe(`#/student/lessons/g2-u07-l${n + 1}`);
    } else {
      expect(screen.getByRole('link', { name: 'U07-ზე დაბრუნება' })).toBeTruthy();
    }
  });
});

describe('feedback is aimed at the real mistake', () => {
  const upTo = (lessonId: string, stopAt: string) => {
    go(`#/student/lessons/${lessonId}`);
    const lesson = LESSON_CONTENT[lessonId];
    const stop = lesson.activities.findIndex((a) => a.id === stopAt);
    lesson.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
  };

  it('calling three unequal pieces equal is answered with the pieces, not just "wrong"', () => {
    upTo('g2-u07-l4', 'check-1');
    fireEvent.click(screen.getByRole('button', { name: '✓ ტოლი ნაწილები' }));
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('ნაწილ');
  });

  it('a swapped numerator and denominator is named as a swap', () => {
    upTo('g2-u07-l5', 'check-1');
    fireEvent.change(screen.getByLabelText('მრიცხველი'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('მნიშვნელი'), { target: { value: '1' } });
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('მრიცხველი');
  });

  it('picking too few parts says how many are wanted', () => {
    upTo('g2-u07-l3', 'check-3');
    fireEvent.click(screen.getByLabelText('ნაწილი 1'));
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('2');
  });
});

describe('style: motion, layout and honest labels', () => {
  const css = readFileSync('src/lessons/learn.css', 'utf8');
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));

  it('the shape pieces are switched off under reduced motion', () => {
    expect(reduced).toContain('.sh-piece');
    expect(reduced).toContain('.sh-cutline');
  });

  it('the fraction boards have their own layout and a phone width', () => {
    expect(css).toContain('.frc');
    expect(css).toContain('.fj-pick');
    expect(css).toContain('.fn-inputs');
    const small = css.slice(css.lastIndexOf('@media (max-width: 560px)'));
    expect(small.length).toBeGreaterThan(0);
  });

  it('every piece is labelled by its number, never only by position', () => {
    render(<FractionPickAnswer response={{ shape: specOf('square', 4), need: 1 }} value="" onChange={vi.fn()} disabled={false} label="ნაწილები" />);
    expect(Array.from(document.querySelectorAll('.sh-piece')).map((p) => p.getAttribute('aria-label'))).toEqual(['ნაწილი 1', 'ნაწილი 2', 'ნაწილი 3', 'ნაწილი 4']);
  });
});
