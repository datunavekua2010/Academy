// @vitest-environment jsdom
import { useState } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';
import { LESSON_CONTENT } from '../src/lessons/content';
import { describeAnswer, evaluateAnswer } from '../src/lessons/check';
import { getUnit } from '../src/lessons/catalog';
import { RULE_GROUPS, ReassembleBoard, SelectBoard, SortBoard, CutBoard } from '../src/lessons/exercises/ShapeAnswers';
import { ComparableBoard } from '../src/lessons/exercises/ShapeBoard';
import {
  comparePieces,
  divisionFromLines,
  divisionOf,
  evenness,
  fitsPlace,
  groupOf,
  hasEqualParts,
  ruleHolds,
  snapPoints,
  SIZE,
} from '../src/lessons/exercises/ShapeGeometry';
import type { Activity, Lesson, QuestionActivity, ResponseSpec, ShapeKind, ShapeSpec } from '../src/lessons/types';

/**
 * Grade 1 · Unit 5 "Equal Parts vs. Unequal Parts": the geometry, the maths in the demonstration
 * data, the answer checking of the new response types, the new components and a data-driven walk
 * through all five lessons in the real player. Touch and dragging have not been tried on a device
 * (there is no browser here); taps are simulated with click events.
 */

const IDS = ['g1-u05-l1', 'g1-u05-l2', 'g1-u05-l3', 'g1-u05-l4', 'g1-u05-l5'];
const lessons: Lesson[] = IDS.map((id) => LESSON_CONTENT[id]);
const [L1, L2, L3, L4, L5] = lessons;
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);

/** Every shape an activity can put on screen, wherever it hides. */
function specsOf(a: Activity): ShapeSpec[] {
  if (a.kind === 'question') {
    const r = a.response;
    if (r.type === 'judge') return [r.shape];
    if (r.type === 'classify') return r.items;
    if (r.type === 'select-parts' || r.type === 'reassemble') return r.decoys ? [r.shape, ...r.decoys.map((d) => d.spec)] : [r.shape];
    if (r.type === 'choice') return r.options.flatMap((o) => (o.visual?.type === 'shape' ? [o.visual] : []));
    return [];
  }
  if (a.kind === 'explore') {
    const t = a.tool;
    if (t.tool === 'parts-lab' || t.tool === 'compare-lab') return t.examples.map((e) => e.spec).concat(t.tool === 'compare-lab' ? t.sort : []);
    if (t.tool === 'fraction-lab') return [...t.examples, ...t.unequal].map((e) => e.spec);
  }
  if (a.kind === 'explain') {
    return a.blocks.flatMap((b) => (b.type === 'shape-demo' ? [b.shape, b.contrast] : []));
  }
  return [];
}

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 1 U05 is "Equal Parts vs. Unequal Parts"', () => {
  it('has the five approved titles and the ids g1-u05-l1 … l5, in order', () => {
    const unit = getUnit('g1-u05');
    expect(unit?.title).toBe('Equal Parts vs. Unequal Parts');
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Understanding Wholes and Parts',
      'Identifying Equal and Unequal Parts',
      'Dividing Shapes into Equal Parts',
      'Recognizing Halves in Shapes and Objects',
      'Recognizing Quarters in Shapes and Objects',
    ]);
    expect(unit?.lessons.map((l) => l.id)).toEqual(IDS);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U05.1', 'U05.2', 'U05.3', 'U05.4', 'U05.5']);
  });
});

// ─────────────────────────── geometry ───────────────────────────

const halvesOf = (shape: ShapeKind, cuts: ShapeSpec['cuts']) => divisionOf({ shape, cuts });
const isEqual = (shape: ShapeKind, cuts: ShapeSpec['cuts']) => hasEqualParts(halvesOf(shape, cuts));

describe('geometry: equal areas are exact, not eyeballed', () => {
  it('a line through the centre always gives two equal parts, whatever its direction', () => {
    expect(evenness(halvesOf('circle', [[0.5, 0, 0.5, 1]]))).toBeCloseTo(1, 6);
    expect(evenness(halvesOf('circle', [[0, 0, 1, 1]]))).toBeCloseTo(1, 6);
    expect(evenness(halvesOf('circle', [[0, 0.5, 1, 0.5]]))).toBeCloseTo(1, 6);
    expect(evenness(halvesOf('rect', [[0, 0.5, 1, 0.5]]))).toBeCloseTo(1, 6);
    expect(evenness(halvesOf('rect', [[0, 0, 1, 1]]))).toBeCloseTo(1, 6);
    expect(evenness(halvesOf('rect', [[0.5, 0, 0.5, 1]]))).toBeCloseTo(1, 6);
    expect(evenness(halvesOf('square', [[0, 0, 1, 1]]))).toBeCloseTo(1, 6);
  });

  it('a line away from the centre really is unequal, by a visible margin', () => {
    for (const spec of [
      { shape: 'circle', cuts: [[0.3, 0, 0.3, 1]] },
      { shape: 'circle', cuts: [[0, 0.65, 1, 0.65]] },
      { shape: 'rect', cuts: [[0, 0, 1, 0.6]] },
      { shape: 'square', cuts: [[0, 0.35, 1, 0.35]] },
    ] as ShapeSpec[]) {
      const d = halvesOf(spec.shape, spec.cuts);
      expect(d.pieces).toHaveLength(2);
      expect(hasEqualParts(d)).toBe(false);
      expect(evenness(d)).toBeLessThan(0.7);
    }
  });

  it('four equal parts: cross, diagonals and strips all give exactly a quarter each', () => {
    expect(evenness(halvesOf('circle', [[0.5, 0, 0.5, 1], [0, 0.5, 1, 0.5]]))).toBeCloseTo(1, 6);
    expect(evenness(halvesOf('circle', [[0, 0, 1, 1], [0, 1, 1, 0]]))).toBeCloseTo(1, 6);
    expect(evenness(halvesOf('square', [[0.5, 0, 0.5, 1], [0, 0.5, 1, 0.5]]))).toBeCloseTo(1, 6);
    expect(evenness(halvesOf('square', [[0, 0, 1, 1], [0, 1, 1, 0]]))).toBeCloseTo(1, 6);
    expect(evenness(halvesOf('rect', [[0.5, 0, 0.5, 1], [0, 0.5, 1, 0.5]]))).toBeCloseTo(1, 6);
    expect(evenness(halvesOf('rect', [[0.25, 0, 0.25, 1], [0.5, 0, 0.5, 1], [0.75, 0, 0.75, 1]]))).toBeCloseTo(1, 6);
    expect(halvesOf('rect', [[0.25, 0, 0.25, 1], [0.5, 0, 0.5, 1], [0.75, 0, 0.75, 1]]).pieces).toHaveLength(4);
  });

  it('four pieces are not quarters when one of them is bigger', () => {
    for (const spec of [
      { shape: 'circle', cuts: [[0.3, 0, 0.3, 1], [0, 0.5, 1, 0.5]] },
      { shape: 'square', cuts: [[0.4, 0, 0.4, 1], [0, 0.5, 1, 0.5]] },
      { shape: 'square', cuts: [[0.5, 0, 0.5, 1], [0, 0.3, 1, 0.3]] },
    ] as ShapeSpec[]) {
      const d = halvesOf(spec.shape, spec.cuts);
      expect(d.pieces).toHaveLength(4);
      expect(hasEqualParts(d)).toBe(false);
      expect(ruleHolds('quarters', d)).toBe(false);
    }
  });

  it('halves and quarters are about the number of parts as well as their size', () => {
    const halfCircle = halvesOf('circle', [[0.5, 0, 0.5, 1]]);
    const quarterCircle = halvesOf('circle', [[0.5, 0, 0.5, 1], [0, 0.5, 1, 0.5]]);
    expect(ruleHolds('halves', halfCircle)).toBe(true);
    expect(ruleHolds('quarters', halfCircle)).toBe(false);
    expect(ruleHolds('halves', quarterCircle)).toBe(false);
    expect(ruleHolds('quarters', quarterCircle)).toBe(true);
    expect(ruleHolds('equal', quarterCircle)).toBe(true);
    // a whole shape is not divided at all
    expect(hasEqualParts(halvesOf('circle', []))).toBe(false);
  });

  it('groups pictures by what is true about them, never by what they look like', () => {
    expect(groupOf('equal', { shape: 'rect', cuts: [[0, 0, 1, 1]] })).toBe('e');
    expect(groupOf('equal', { shape: 'rect', cuts: [[0.7, 0, 0.7, 1]] })).toBe('u');
    expect(groupOf('halves', { shape: 'circle', cuts: [[0.3, 0, 0.3, 1]] })).toBe('n');
    expect(groupOf('quarters', { shape: 'circle', cuts: [[0.5, 0, 0.5, 1]] })).toBe('n');
    expect(groupOf('wholeparts', { shape: 'circle', cuts: [], view: 'whole' })).toBe('w');
    expect(groupOf('wholeparts', { shape: 'circle', cuts: [[0.5, 0, 0.5, 1]], view: 'apart' })).toBe('p');
    expect(groupOf('wholeparts', { shape: 'circle', cuts: [[0.5, 0, 0.5, 1]], view: 'cut' })).toBe('p');
    expect(groupOf('wholeparts', { shape: 'circle', cuts: [[0.5, 0, 0.5, 1]], view: 'mixed' })).toBe('x');
  });

  it('a piece laid on its twin matches exactly; a bigger piece does not', () => {
    const halves = halvesOf('circle', [[0.5, 0, 0.5, 1]]).pieces;
    expect(comparePieces(halves[0], halves[1]).result).toBe('same');
    const unequal = halvesOf('circle', [[0.3, 0, 0.3, 1]]).pieces;
    // piece 1 is the small one, so laying it on piece 2 leaves piece 2 bigger
    const [small, big] = unequal[0].area < unequal[1].area ? [unequal[0], unequal[1]] : [unequal[1], unequal[0]];
    expect(comparePieces(small, big).result).toBe('second-bigger');
    expect(comparePieces(big, small).result).toBe('first-bigger');
    // a piece only fits its own place in the outline
    const square = halvesOf('square', [[0, 0, 1, 1]]).pieces;
    expect(fitsPlace(square[0], square[0])).toBe(true);
    expect(fitsPlace(square[0], square[1])).toBe(false);
    const lopsided = halvesOf('square', [[0, 0.35, 1, 0.35]]).pieces;
    expect(fitsPlace(lopsided[0], square[0])).toBe(false);
  });

  it('the dots on the edge are real answer targets: two dots make a line', () => {
    // twelve dots around a circle, four on each side of a rectangle
    expect(snapPoints('circle')).toHaveLength(12);
    expect(snapPoints('square')).toHaveLength(16);
    expect(snapPoints('rect')).toHaveLength(16);
    const w = SIZE.circle[0];
    const dots = snapPoints('circle');
    // dots 0 and 6 are opposite each other: a line through the centre
    expect(evenness(divisionFromLines('circle', [[0, 6]]))).toBeCloseTo(1, 6);
    expect(divisionFromLines('circle', [[0, 6]]).pieces).toHaveLength(2);
    // dots 0 and 3 are not: one part is bigger
    expect(hasEqualParts(divisionFromLines('circle', [[0, 3]]))).toBe(false);
    // a dot that is not on the edge cannot be used (the line misses the shape)
    expect(dots.every(([x]) => x >= -0.001 && x <= w + 0.001)).toBe(true);
  });
});

// ─────────────────────────── the maths in the data ───────────────────────────

describe('U05 data: every picture is mathematically unambiguous', () => {
  it('no example is "almost equal": evenness is either 1 or clearly below 0.7', () => {
    for (const l of lessons) {
      for (const a of l.activities) {
        for (const spec of specsOf(a)) {
          const d = divisionOf(spec);
          if (d.pieces.length < 2) continue;
          const e = evenness(d);
          const ok = e > 1 - 1e-6 || e < 0.7;
          expect(ok, `${l.id}/${a.id} ${spec.shape} ${JSON.stringify(spec.cuts)} evenness ${e}`).toBe(true);
        }
      }
    }
  });

  it('every "yes" in a judge question really is true, and every "no" really is false', () => {
    for (const l of lessons) {
      for (const q of questions(l)) {
        if (q.response.type !== 'judge') continue;
        const d = divisionOf(q.response.shape);
        const yes = ruleHolds(q.response.rule, d);
        if (q.response.rule === 'halves') expect(d.pieces.length === 2 && hasEqualParts(d)).toBe(yes);
        if (q.response.rule === 'quarters') expect(d.pieces.length === 4 && hasEqualParts(d)).toBe(yes);
        // the explanation agrees with the drawing
        if (!yes && q.response.rule !== 'equal') expect(q.explanation).toMatch(/არ არის|არატოლი/);
      }
    }
  });

  it('every sorted picture lands in the group its own geometry implies', () => {
    for (const l of lessons) {
      for (const q of questions(l)) {
        if (q.response.type !== 'classify') continue;
        for (const item of q.response.items) {
          const g = groupOf(q.response.rule, item);
          expect(['e', 'u', 'y', 'n', 'w', 'p', 'x'], `${l.id}/${q.id}`).toContain(g);
          if (q.response.rule === 'wholeparts') expect(item.view, `${l.id}/${q.id}`).toBeTruthy();
        }
      }
    }
  });

  it('selecting one part only ever accepts a part of that shape', () => {
    for (const l of lessons) {
      for (const q of questions(l)) {
        if (q.response.type !== 'select-parts') continue;
        const count = divisionOf(q.response.shape).pieces.length;
        expect(q.response.need).toBe(1);
        for (const n of q.response.from ?? []) expect(n).toBeGreaterThanOrEqual(1), expect(n).toBeLessThanOrEqual(count);
      }
    }
  });

  it('reassembly boards have exactly as many pieces as places, plus labelled decoys', () => {
    for (const l of lessons) {
      for (const q of questions(l)) {
        if (q.response.type !== 'reassemble') continue;
        const places = divisionOf(q.response.shape).pieces;
        expect(places.length).toBeGreaterThan(1);
        for (const d of q.response.decoys ?? []) {
          // a decoy comes from a different shape, so it can never fit
          expect(fitsPlace(divisionOf(d.spec).pieces[d.piece - 1], places[0])).toBe(false);
        }
      }
    }
  });

  it('the five lessons are a journey: each one builds on the one before', () => {
    expect(L1.prerequisites).not.toContain('(U05');
    lessons.slice(1).forEach((l, i) => {
      expect(l.prerequisites.join(' ')).toContain(`U05.${i + 1}`);
    });
    expect(new Set(lessons.map((l) => l.objective)).size).toBe(5);
  });

  it('every lesson has its own objective, exploration, explanation, practice and check', () => {
    for (const l of lessons) {
      expect(l.objective.length, l.id).toBeGreaterThan(20);
      expect(l.activities.filter((a) => a.stage === 'challenge')).toHaveLength(1);
      expect(l.activities.filter((a) => a.kind === 'explore')).toHaveLength(1);
      expect(l.activities.filter((a) => a.kind === 'explain')).toHaveLength(1);
      expect(stageOf(l, 'practice').length).toBeGreaterThanOrEqual(4);
      expect(stageOf(l, 'check').length).toBeGreaterThanOrEqual(3);
      expect(l.completion.minCheckCorrect).toBe(2);
      expect(l.mascot?.complete).toBeTruthy();
    }
  });

  it('the unit uses different kinds of interaction, not one template five times', () => {
    const kinds = new Set(lessons.flatMap((l) => questions(l).map((q) => q.response.type)));
    expect([...kinds].sort()).toEqual(['choice', 'classify', 'cut', 'judge', 'reassemble', 'select-parts']);
    const tools = new Set(lessons.flatMap((l) => l.activities.flatMap((a) => (a.kind === 'explore' ? [a.tool.tool] : []))));
    expect([...tools].sort()).toEqual(['compare-lab', 'cut-lab', 'fraction-lab', 'parts-lab']);
  });

  it('grade-1 reading: prompts stay short and no fraction symbols are required', () => {
    for (const l of lessons) {
      for (const q of questions(l)) {
        expect(q.prompt.length, `${l.id}/${q.id}`).toBeLessThan(180);
        expect(q.explanation.length).toBeGreaterThan(10);
        expect(q.explanation.length).toBeLessThan(260);
      }
    }
    // symbols may appear as optional labels, never as an answer the student must give
    for (const l of lessons)
      for (const q of questions(l)) if (q.response.type === 'numeric' || q.response.type === 'blanks') throw new Error('no written fractions in U05');
  });
});

// ─────────────────────────── answer checking ───────────────────────────

const dummy = { hints: ['h'], explanation: 'e' };
const q = (response: ResponseSpec, extra: Partial<QuestionActivity> = {}): QuestionActivity => ({ id: 'q', kind: 'question', stage: 'practice', prompt: 'p', ...dummy, response, ...extra });

describe('check: judge (equal parts, halves, quarters)', () => {
  const equal = q({ type: 'judge', rule: 'equal', shape: { shape: 'circle', cuts: [[0.5, 0, 0.5, 1]] }, compare: true }, {
    misconceptions: [
      { id: 'colour', answers: ['u'], feedback: 'C' },
    ],
  });
  const halvesBad = q({ type: 'judge', rule: 'halves', shape: { shape: 'circle', cuts: [[0.3, 0, 0.3, 1]] } }, {
    misconceptions: [{ id: 'two', answers: ['y'], feedback: 'T' }],
  });
  const quartersGood = q({ type: 'judge', rule: 'quarters', shape: { shape: 'circle', cuts: [[0.5, 0, 0.5, 1], [0, 0.5, 1, 0.5]] } });
  const quartersTwo = q({ type: 'judge', rule: 'quarters', shape: { shape: 'circle', cuts: [[0.5, 0, 0.5, 1]] } });

  it('equal parts: "equal" is right, "unequal" is wrong with its misconception', () => {
    expect(evaluateAnswer(equal, 'e').verdict).toBe('correct');
    expect(evaluateAnswer(equal, 'u')).toMatchObject({ verdict: 'incorrect', misconceptionId: 'colour' });
  });

  it('two pieces are not halves unless they are equal', () => {
    expect(evaluateAnswer(halvesBad, 'n').verdict).toBe('correct');
    expect(evaluateAnswer(halvesBad, 'y')).toMatchObject({ verdict: 'incorrect', misconceptionId: 'two' });
  });

  it('quarters need four parts, so two equal parts are not quarters', () => {
    expect(evaluateAnswer(quartersGood, 'y').verdict).toBe('correct');
    expect(evaluateAnswer(quartersTwo, 'n').verdict).toBe('correct');
    expect(evaluateAnswer(quartersTwo, 'y').verdict).toBe('incorrect');
  });

  it('nothing chosen loses no attempt: it only asks for an answer', () => {
    expect(evaluateAnswer(equal, '').verdict).toBe('incomplete');
    expect(evaluateAnswer(equal, '').feedback).toContain('შეადარე');
  });
});

describe('check: classify (sorting pictures)', () => {
  const sort = q({ type: 'classify', rule: 'equal', items: [
    { shape: 'circle', cuts: [[0.5, 0, 0.5, 1]] },
    { shape: 'circle', cuts: [[0.3, 0, 0.3, 1]] },
  ] }, { misconceptions: [{ id: 'near', answers: ['0'], feedback: 'N' }] });

  it('all pictures in the right group is correct', () => {
    expect(evaluateAnswer(sort, 'e,u').verdict).toBe('correct');
  });

  it('a picture in the wrong group names the first one that is wrong', () => {
    expect(evaluateAnswer(sort, 'u,e')).toMatchObject({ verdict: 'incorrect', misconceptionId: 'near' });
    expect(evaluateAnswer(sort, 'u,e').feedback).toBe('N');
  });

  it('a half-finished sort is incomplete, not wrong', () => {
    expect(evaluateAnswer(sort, 'e,').verdict).toBe('incomplete');
    expect(evaluateAnswer(sort, '').verdict).toBe('incomplete');
  });
});

describe('check: select-parts', () => {
  const select = q({ type: 'select-parts', shape: { shape: 'square', cuts: [[0.5, 0, 0.5, 1], [0, 0.5, 1, 0.5]] }, need: 1, from: [1, 2, 3, 4] }, {
    misconceptions: [
      { id: 'count', answers: ['count'], feedback: 'C' },
      { id: 'which', answers: ['which'], feedback: 'W' },
    ],
  });

  it('one part of the shape is right, whichever part it is', () => {
    for (const n of [1, 2, 3, 4]) expect(evaluateAnswer(select, String(n)).verdict).toBe('correct');
  });

  it('more parts than asked is a count mistake; a part from elsewhere is a choice mistake', () => {
    expect(evaluateAnswer(select, '1,2')).toMatchObject({ verdict: 'incorrect', misconceptionId: 'count' });
    expect(evaluateAnswer(select, '7')).toMatchObject({ verdict: 'incorrect', misconceptionId: 'which' });
  });

  it('touching nothing is incomplete', () => {
    expect(evaluateAnswer(select, '').verdict).toBe('incomplete');
  });
});

describe('check: reassemble', () => {
  const board = q({ type: 'reassemble', shape: { shape: 'square', cuts: [[0, 0, 1, 1]] } });

  it('is incomplete until every piece is back in its place', () => {
    expect(evaluateAnswer(board, '').verdict).toBe('incomplete');
    expect(evaluateAnswer(board, '-,-').verdict).toBe('incomplete');
    expect(evaluateAnswer(board, '0,-').verdict).toBe('incomplete');
    expect(evaluateAnswer(board, '0,-').feedback).toContain('ადგილზე');
  });

  it('a full board is the whole shape again', () => {
    expect(evaluateAnswer(board, '0,1').verdict).toBe('correct');
  });
});

describe('check: cut (dividing a shape yourself)', () => {
  const circle = q({ type: 'cut', shape: 'circle', parts: 2, maxCuts: 1, compare: true }, {
    misconceptions: [
      { id: 'count', answers: ['count'], feedback: 'C' },
      { id: 'unequal', answers: ['unequal'], feedback: 'U' },
    ],
  });
  /** A pair of dots that really divides the shape into `parts` equal pieces. */
  const equalPair = (shape: ShapeKind, parts: number): [number, number] => {
    const dots = snapPoints(shape);
    for (let i = 0; i < dots.length; i += 1)
      for (let j = i + 1; j < dots.length; j += 1) {
        const d = divisionFromLines(shape, [[i, j]]);
        if (d.pieces.length === parts && hasEqualParts(d)) return [i, j];
      }
    throw new Error(`no equal division of ${shape}`);
  };

  it('a line through the centre is accepted; where it is drawn does not matter', () => {
    const dots = snapPoints('circle');
    const accepted = ['0-6', '1-7', '2-8', '3-9', '4-10', '5-11'].filter((v) => evaluateAnswer(circle, v).verdict === 'correct');
    expect(accepted.length).toBeGreaterThanOrEqual(4);
    expect(dots).toHaveLength(12);
  });

  it('a line off centre is refused as unequal, not by where it looks', () => {
    expect(evaluateAnswer(circle, '0-3')).toMatchObject({ verdict: 'incorrect', misconceptionId: 'unequal' });
  });

  it('no line at all is incomplete', () => {
    expect(evaluateAnswer(circle, '').verdict).toBe('incomplete');
    expect(evaluateAnswer(circle, '').feedback).toContain('წერტილ');
  });

  it('the same rules hold for a square and a rectangle', () => {
    for (const shape of ['square', 'rect'] as ShapeKind[]) {
      const [a, b] = equalPair(shape, 2);
      const r = q({ type: 'cut', shape, parts: 2, maxCuts: 1 }, { misconceptions: [{ id: 'unequal', answers: ['unequal'], feedback: 'U' }] });
      expect(evaluateAnswer(r, `${a}-${b}`).verdict, shape).toBe('correct');
    }
  });

  it('the answer can be revealed for every new response type', () => {
    expect(describeAnswer({ type: 'judge', rule: 'halves', shape: { shape: 'circle', cuts: [[0.5, 0, 0.5, 1]] } })).toBeTruthy();
    expect(describeAnswer({ type: 'classify', rule: 'equal', items: [] })).toContain('ჯგუფ');
    expect(describeAnswer({ type: 'select-parts', shape: { shape: 'circle', cuts: [] }, need: 1 })).toContain('1');
    expect(describeAnswer({ type: 'reassemble', shape: { shape: 'circle', cuts: [] } })).toContain('ადგილზე');
    expect(describeAnswer({ type: 'cut', shape: 'circle', parts: 2, maxCuts: 1 })).toContain('2');
  });
});

// ─────────────────────────── the components ───────────────────────────

const text = (selector: string) => document.querySelector(selector)?.textContent ?? '';
/** The value a harness stores: its `output`, never the board's own counters. */
const stored = () => document.querySelector('output[data-testid="value"]')?.textContent ?? '';
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
/** The note a board shows at its own foot (a compare panel above it may add another). */
const noteOf = (root: string) => {
  const all = [...document.querySelectorAll(`${root} .xt-note`)];
  return all[all.length - 1]?.textContent ?? '';
};
const groupButton = (rule: 'equal' | 'halves' | 'quarters' | 'wholeparts', id: string) => {
  const g = RULE_GROUPS[rule].find((x) => x.id === id) as { label: string; icon: string };
  // the group button's accessible name is just its words ("＝" is decorative)
  return screen.getByRole('button', { name: (n) => n.trim() === g.label });
};

function SortHarness({ rule, items, tell }: { rule: 'equal' | 'halves' | 'quarters' | 'wholeparts'; items: ShapeSpec[]; tell?: boolean }) {
  const [groups, setGroups] = useState(() => items.map(() => ''));
  return (
    <>
      <SortBoard items={items} rule={rule} groups={groups} onChange={setGroups} label="დალაგება" right={tell ? (i) => groups[i] === groupOf(rule, items[i]) : undefined} />
      <output data-testid="value">{groups.join(',')}</output>
    </>
  );
}

describe('SortBoard', () => {
  const items: ShapeSpec[] = [
    { shape: 'circle', cuts: [[0.5, 0, 0.5, 1]] },
    { shape: 'circle', cuts: [[0.3, 0, 0.3, 1]] },
  ];
  const value = () => screen.getByTestId('value').textContent;

  it('the student taps a picture and then a group; the next picture is picked automatically', () => {
    render(<SortHarness rule="equal" items={items} />);
    expect(value()).toBe(',');
    click('ნახატი 1');
    expect(text('.sort-hint')).toContain('ნახატი 1');
    fireEvent.click(groupButton('equal', 'e'));
    expect(value()).toBe('e,');
    fireEvent.click(groupButton('equal', 'u'));
    expect(value()).toBe('e,u');
    expect(text('.sort-hint')).toContain('ყველა ნახატი დალაგებულია');
  });

  it('a picture can be moved to the other group and the whole board can be reset', () => {
    render(<SortHarness rule="equal" items={items} />);
    click('ნახატი 1');
    fireEvent.click(groupButton('equal', 'e'));
    click('ნახატი 1');
    fireEvent.click(groupButton('equal', 'u'));
    expect(value()).toBe('u,');
    click(/^↻ თავიდან$/);
    expect(value()).toBe(',');
  });

  it('the three groups of the whole-and-parts sort are all offered', () => {
    render(<SortHarness rule="wholeparts" items={[{ shape: 'circle', cuts: [], view: 'whole' }, { shape: 'rect', cuts: [[0.5, 0, 0.5, 1]], view: 'mixed' }, { shape: 'rect', cuts: [[0.5, 0, 0.5, 1]], view: 'apart' }]} />);
    for (const id of ['w', 'p', 'x']) expect(groupButton('wholeparts', id)).toBeTruthy();
    click('ნახატი 1');
    fireEvent.click(groupButton('wholeparts', 'w'));
    fireEvent.click(groupButton('wholeparts', 'x'));
    fireEvent.click(groupButton('wholeparts', 'p'));
    expect(value()).toBe('w,x,p');
  });
});

function SelectHarness({ spec, need, noun }: { spec: ShapeSpec; need: number; noun?: string }) {
  const [picked, setPicked] = useState<number[]>([]);
  return (
    <>
      <SelectBoard spec={spec} need={need} picked={picked} onChange={setPicked} disabled={false} label="არჩევა" noun={noun} />
      <output data-testid="value">{picked.join(',')}</output>
    </>
  );
}

describe('SelectBoard', () => {
  const quarter: ShapeSpec = { shape: 'square', cuts: [[0.5, 0, 0.5, 1], [0, 0.5, 1, 0.5]] };
  const value = () => screen.getByTestId('value').textContent;

  it('tapping a part selects it and tapping it again lets it go', () => {
    render(<SelectHarness spec={quarter} need={1} noun="მეოთხედი" />);
    expect(document.querySelectorAll('.sh-piece')).toHaveLength(4);
    fireEvent.click(screen.getByRole('button', { name: 'ნაწილი 3' }));
    expect(value()).toBe('3');
    expect(text('.objs-count')).toContain('მეოთხედი');
    fireEvent.click(screen.getByRole('button', { name: 'ნაწილი 3' }));
    expect(value()).toBe('');
  });

  it('the selection can be cleared with one button', () => {
    render(<SelectHarness spec={quarter} need={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'ნაწილი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'ნაწილი 2' }));
    expect(value()).toBe('1,2');
    click(/გასუფთავება/);
    expect(value()).toBe('');
  });

  it('every part of the shape is reachable by keyboard too', () => {
    render(<SelectHarness spec={quarter} need={1} />);
    const piece = screen.getByRole('button', { name: 'ნაწილი 4' });
    fireEvent.keyDown(piece, { key: 'Enter' });
    expect(value()).toBe('4');
  });
});

function ReassembleHarness({ shape, decoys }: { shape: ShapeSpec; decoys?: Array<{ spec: ShapeSpec; piece: number }> }) {
  const [value, setValue] = useState('');
  return (
    <>
      <ReassembleBoard shape={shape} decoys={decoys} value={value} onChange={setValue} disabled={false} label="შეკრება" />
      <output data-testid="value">{value}</output>
    </>
  );
}

describe('ReassembleBoard', () => {
  const triangle: ShapeSpec = { shape: 'square', cuts: [[0, 0, 1, 1]] };
  const value = stored;

  it('each piece goes back into its own place; the board says when the shape is whole', () => {
    render(<ReassembleHarness shape={triangle} />);
    expect(document.querySelectorAll('.rs-piece')).toHaveLength(2);
    expect(document.querySelectorAll('.rs-slot')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'ნაწილი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'ადგილი 1' }));
    expect(value()).toBe('0,-');
    expect(text('.rs .xt-note')).toContain('ჯდება');
    fireEvent.click(screen.getByRole('button', { name: 'ნაწილი 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'ადგილი 2' }));
    expect(value()).toBe('0,1');
    expect(text('.rs .xt-note')).toContain('მთელია');
  });

  it('a piece refused into the wrong place is not written down', () => {
    render(<ReassembleHarness shape={triangle} />);
    fireEvent.click(screen.getByRole('button', { name: 'ნაწილი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'ადგილი 2' }));
    expect(value()).toBe('');
    expect(text('.rs .xt-note')).toContain('არ ჯდება');
  });

  it('a piece of another shape is refused and named as such', () => {
    render(<ReassembleHarness shape={{ shape: 'rect', cuts: [[0.5, 0, 0.5, 1], [0, 0.5, 1, 0.5]], skin: 'chocolate' }} decoys={[{ spec: { shape: 'circle', cuts: [[0.5, 0, 0.5, 1]] }, piece: 1 }]} />);
    expect(document.querySelectorAll('.rs-piece')).toHaveLength(5);
    fireEvent.click(document.querySelectorAll<SVGGElement>('.rs-piece')[4]);
    fireEvent.click(screen.getByRole('button', { name: 'ადგილი 1' }));
    expect(text('.rs .xt-note')).toContain('სხვა ფიგურას');
    expect(value()).toBe('');
  });

  it('the reset button sends every piece back down to the tray', () => {
    render(<ReassembleHarness shape={triangle} />);
    fireEvent.click(screen.getByRole('button', { name: 'ნაწილი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'ადგილი 1' }));
    click(/^↻ თავიდან$/);
    expect(value()).toBe('-,-');
  });
});

function CutHarness({ shape, parts, maxCuts, tell }: { shape: ShapeKind; parts: 2 | 4; maxCuts: number; tell?: 'verdict' }) {
  const [value, setValue] = useState('');
  return (
    <>
      <CutBoard shape={shape} parts={parts} maxCuts={maxCuts} compare tell={tell} value={value} onChange={setValue} disabled={false} label="გაყოფა" />
      <output data-testid="value">{value}</output>
    </>
  );
}

describe('CutBoard', () => {
  const value = stored;

  it('two taps on the edge dots draw one line through the shape', () => {
    render(<CutHarness shape="circle" parts={2} maxCuts={1} />);
    expect(document.querySelectorAll('.cd')).toHaveLength(12);
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 1' }));
    expect(noteOf('.cut')).toContain('წერტილი 1');
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 7' }));
    expect(value()).toBe('0-6');
    expect(text('.objs-count')).toContain('ნაწილები: 2');
  });

  it('the line can be undone and the board reset, so a wrong try costs nothing', () => {
    render(<CutHarness shape="circle" parts={2} maxCuts={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 4' }));
    expect(value()).toBe('0-3');
    click(/ბოლო ხაზის გაუქმება/);
    expect(value()).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 7' }));
    click(/^↻ თავიდან$/);
    expect(value()).toBe('');
  });

  it('more lines than allowed are refused with a message', () => {
    render(<CutHarness shape="circle" parts={2} maxCuts={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 7' }));
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 4' }));
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 10' }));
    expect(value()).toBe('0-6');
    expect(noteOf('.cut')).toContain('მაქსიმუმ');
  });

  it('in the exploration the board says whether the parts came out equal', () => {
    render(<CutHarness shape="circle" parts={2} maxCuts={2} tell="verdict" />);
    expect(document.querySelector('.cut-target')?.textContent).toContain('2');
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 7' }));
    expect(noteOf('.cut')).toContain('ტოლია');
    click(/^↻ თავიდან$/);
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 4' }));
    expect(noteOf('.cut')).toContain('ტოლი არ არის');
  });

  it('the parts can be laid on one another to check them', () => {
    render(<CutHarness shape="circle" parts={2} maxCuts={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 7' }));
    fireEvent.click(screen.getByRole('button', { name: 'ნაწილი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'ნაწილი 2' }));
    click(/დავდოთ/);
    expect(screen.getByRole('img', { name: /დადებულია/ })).toBeTruthy();
  });
});

describe('ComparableBoard', () => {
  it('shows both pieces side by side, then one laid exactly on the other', () => {
    render(<ComparableBoard spec={{ shape: 'circle', cuts: [[0.5, 0, 0.5, 1]] }} label="წრე" compare explain={false} />);
    expect(text('.cb2')).toContain('შეეხე ორ ნაწილს');
    fireEvent.click(screen.getByRole('button', { name: 'ნაწილი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'ნაწილი 2' }));
    expect(screen.getByRole('img', { name: /გვერდიგვერდ/ })).toBeTruthy();
    click(/დავდოთ/);
    expect(screen.getByRole('img', { name: /დადებულია/ })).toBeTruthy();
    click(/^↻ თავიდან$/);
    expect(text('.cb2')).toContain('შეეხე ორ ნაწილს');
  });
});

// ─────────────────────────── the player ───────────────────────────

function go(hash: string) {
  window.location.hash = hash;
  return render(<StudentApp />);
}
const next = () => fireEvent.click(screen.getByRole('button', { name: 'გაგრძელება' }));
/** Walks forward from the first screen to the exploration or the explanation. */
const toStage = (lesson: Lesson, stage: 'explore' | 'understand') => {
  const stop = lesson.activities.findIndex((a) => a.stage === stage);
  for (const a of lesson.activities.slice(0, stop)) {
    if (a.kind === 'question') answerCorrectly(a);
    next();
  }
};
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'პასუხის შემოწმება' }));
const feedback = () => document.querySelector('.lp-feedback')?.textContent ?? '';
const saved = () => JSON.parse(window.localStorage.getItem(LEARN_STORAGE_KEY) ?? '{}');
const radio = (i: number) => fireEvent.click(screen.getAllByRole('radio')[i]);

/** A pair of edge dots that divides the shape into `parts` equal pieces. */
function equalCut(shape: ShapeKind, parts: number): [number, number] {
  const dots = snapPoints(shape);
  for (let i = 0; i < dots.length; i += 1)
    for (let j = i + 1; j < dots.length; j += 1) {
      const d = divisionFromLines(shape, [[i, j]]);
      if (d.pieces.length === parts && hasEqualParts(d)) return [i, j];
    }
  throw new Error(`no equal division of ${shape}`);
}

beforeEach(() => {
  window.localStorage.clear();
  resetProgressCache();
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
    case 'judge': {
      const yes = ruleHolds(r.rule, divisionOf(r.shape));
      radio(yes ? 0 : 1);
      break;
    }
    case 'classify': {
      const items = r.items;
      for (let i = 0; i < items.length; i += 1) {
        // the board preselects the next picture, so tap it only when it is not already chosen
        const card = screen.getByRole('button', { name: new RegExp(`^ნახატი ${i + 1}(,|$)`) });
        if (card.getAttribute('aria-label')?.includes('არჩეულია') === false) fireEvent.click(card);
        const g = groupOf(r.rule, items[i]);
        const group = RULE_GROUPS[r.rule].find((x) => x.id === g) as { label: string };
        fireEvent.click(screen.getByRole('button', { name: (name) => name.trim() === group.label }));
      }
      break;
    }
    case 'select-parts': {
      const from = r.from ?? [1];
      for (const n of from.slice(0, r.need)) fireEvent.click(screen.getByRole('button', { name: `ნაწილი ${n}` }));
      break;
    }
    case 'reassemble': {
      const real = divisionOf(r.shape).pieces.length;
      for (let i = 1; i <= real; i += 1) {
        fireEvent.click(screen.getByRole('button', { name: `ნაწილი ${i}` }));
        fireEvent.click(screen.getByRole('button', { name: `ადგილი ${i}` }));
      }
      break;
    }
    case 'cut': {
      const [a, b] = equalCut(r.shape, r.parts);
      fireEvent.click(screen.getByRole('button', { name: `წერტილი ${Math.min(a, b) + 1}` }));
      fireEvent.click(screen.getByRole('button', { name: `წერტილი ${Math.max(a, b) + 1}` }));
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

describe('U05 unit page', () => {
  it('lists the five lessons under U05, all playable and in order', () => {
    go('#/student/lessons/g1-u05');
    const list = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(list).toHaveLength(5);
    IDS.forEach((id, i) => expect(within(list[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
    expect(screen.getAllByText('Recognizing Halves in Shapes and Objects').length).toBeGreaterThanOrEqual(1);
  });
});

describe.each(IDS.map((id, i) => [id, i + 1] as const))('%s plays from the challenge to the completion screen', (id, n) => {
  it('every step works with its own correct answers and the progress is saved', () => {
    const lesson = LESSON_CONTENT[id];
    go(`#/student/lessons/${id}`);
    expect(screen.getByText(`ნაბიჯი 1 / ${lesson.activities.length}`)).toBeTruthy();
    expect(document.querySelector('.lp-code')?.textContent).toContain(`U05.${n}`);
    expect(screen.getByRole('link', { name: 'უკან, გაკვეთილების სიაში' }).getAttribute('href')).toBe('#/student/lessons/g1-u05');
    playThrough(lesson);
    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    const checks = stageOf(lesson, 'check').length;
    expect(screen.getByText(`${checks} / ${checks}`)).toBeTruthy();
    expect(screen.getByText(lesson.mascot?.complete as string)).toBeTruthy();
    for (const c of lesson.concepts ?? []) expect(screen.getByText(c, { selector: '.lp-concepts li' })).toBeTruthy();
    expect(saved()[id]).toMatchObject({ status: 'completed', checkCorrect: checks, checkTotal: checks });
    expect(screen.getByRole('link', { name: 'U05-ზე დაბრუნება' }).getAttribute('href')).toBe('#/student/lessons/g1-u05');
    if (n < 5) expect(screen.getByRole('link', { name: new RegExp(`გაგრძელება: U05\\.${n + 1}`) }).getAttribute('href')).toBe(`#/student/lessons/${IDS[n]}`);
    else expect(screen.queryByRole('link', { name: /გაგრძელება:/ })).toBeNull();
  });
});

describe('the check never helps more than it should', () => {
  it('the check questions carry no hints, the practice ones do', () => {
    for (const l of lessons) {
      for (const x of stageOf(l, 'check')) expect(x.hints).toEqual([]);
      for (const x of stageOf(l, 'practice')) expect(x.hints.length).toBeGreaterThan(0);
    }
  });

  it('a wrong answer in the check explains the right idea without giving it before the try', () => {
    go('#/student/lessons/g1-u05-l2');
    const firstCheck = L2.activities.findIndex((a) => a.stage === 'check');
    L2.activities.slice(0, firstCheck).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    expect(screen.queryByRole('button', { name: /მინიშნება/ })).toBeNull();
    // check-1 is an equal circle: choose the unequal answer
    radio(1);
    submit();
    expect(feedback()).toContain('ჯერ არ არის');
  });
});

describe('U05.1 wholes and parts: interactions in the player', () => {
  it('the explore screen separates a whole into pieces and gathers it back', () => {
    go('#/student/lessons/g1-u05-l1');
    toStage(L1, 'explore');
    expect(document.querySelector('.xt')).toBeTruthy();
    click('შოკოლადის ფილა');
    expect(document.querySelectorAll('.sh-piece')).toHaveLength(4);
    expect(text('.xt-note')).toContain('ერთი მთელი');
    click('დაიყო ნაწილებად');
    expect(text('.xt-note')).toContain('გარეთაა');
    click('შეიკრიბე მთლიანად');
    expect(text('.xt-note')).toContain('ერთი მთელი');
  });

  it('a piece tapped on the board moves out and back', () => {
    go('#/student/lessons/g1-u05-l1');
    toStage(L1, 'explore');
    click('ქაღალდი');
    fireEvent.click(screen.getByRole('button', { name: 'ნაწილი 1' }));
    expect(text('.xt-note')).toContain('1 გარეთაა');
    fireEvent.click(screen.getByRole('button', { name: 'ნაწილი 1' }));
    expect(text('.xt-note')).toContain('ერთი მთელი');
  });

  it('the understanding screen moves the whole apart and together again', () => {
    go('#/student/lessons/g1-u05-l1');
    toStage(L1, 'understand');
    const root = document.querySelector('.demo') as HTMLElement;
    const step = () => fireEvent.click(within(root).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(text('.demo-status')).toContain('ერთი მთელი');
    step();
    expect(text('.demo-status')).toContain('ორ ნაწილად');
    expect(document.querySelectorAll('.sh-piece').length).toBeGreaterThanOrEqual(2);
    step();
    expect(text('.demo-status')).toContain('შევაერთეთ');
    step();
    expect(text('.demo-status')).toContain('ტოლ ნაწილებს არ იძლევა');
    expect((within(root).getByRole('button', { name: 'შემდეგი ნაბიჯი' }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('U05.2 equal and unequal: interactions in the player', () => {
  it('the explore compares two parts and sorts pictures with immediate feedback', () => {
    go('#/student/lessons/g1-u05-l2');
    toStage(L2, 'explore');
    expect(document.querySelectorAll('.sort-card').length).toBeGreaterThanOrEqual(6);
    fireEvent.click(screen.getByRole('button', { name: 'ნახატი 1' }));
    fireEvent.click(screen.getByRole('button', { name: (n) => n.includes('ტოლი ნაწილები') && !n.includes('არატოლი') }));
    expect(document.querySelector('.sort-card .sort-mark')?.textContent).toContain('სწორია');
    // a picture in the wrong group is marked as wrong, in words
    const second = screen.getByRole('button', { name: /^ნახატი 2(,|$)/ });
    if (!second.getAttribute('aria-label')?.includes('არჩეულია')) fireEvent.click(second);
    fireEvent.click(screen.getByRole('button', { name: (n) => n.includes('ტოლი ნაწილები') && !n.includes('არატოლი') }));
    const marks = [...document.querySelectorAll('.sort-mark')].map((m) => m.textContent);
    expect(marks.some((m) => m?.includes('სხვა ჯგუფი'))).toBe(true);
  });

  it('practice-1 lays one part on the other to show they match', () => {
    go('#/student/lessons/g1-u05-l2');
    toStage(L2, 'explore');
    next();
    next();
    fireEvent.click(screen.getByRole('button', { name: 'ნაწილი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'ნაწილი 2' }));
    click(/დავდოთ/);
    expect(text('.lp-body')).toContain('ზუსტად ემთხვევა');
  });
});

describe('U05.3 dividing: interactions in the player', () => {
  it('the explore lets the student draw lines on all three shapes', () => {
    go('#/student/lessons/g1-u05-l3');
    toStage(L3, 'explore');
    for (const name of ['კვადრატი', 'მართკუთხედი']) click(name);
    expect(document.querySelectorAll('.cd').length).toBe(16);
    click('წრე');
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 7' }));
    expect(noteOf('.cut')).toContain('ტოლია');
  });

  it('an unequal division in practice is named and can be corrected on the same board', () => {
    go('#/student/lessons/g1-u05-l3');
    toStage(L3, 'understand');
    next();
    // practice-1 asks for two equal parts of a circle: draw a line off centre
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 4' }));
    submit();
    expect(feedback()).toContain('ცენტრში არ გადის');
    fireEvent.click(screen.getByRole('button', { name: 'ხელახლა ცდა' }));
    click(/^↻ თავიდან$/);
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'წერტილი 7' }));
    submit();
    expect(feedback()).toContain('სწორია');
  });
});

describe('U05.4 halves: interactions in the player', () => {
  it('one half is highlighted, then the other, then both together', () => {
    go('#/student/lessons/g1-u05-l4');
    toStage(L4, 'explore');
    next();
    const root = document.querySelector('.demo') as HTMLElement;
    const step = () => fireEvent.click(within(root).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(text('.demo-status')).toContain('მთელი სენდვიჩი');
    step();
    expect(text('.demo-status')).toContain('ორ ტოლ ნაწილად');
    step();
    expect(text('.demo-status')).toContain('ერთი ნახევარი');
    step();
    expect(text('.demo-status')).toContain('მეორე ნახევარი');
    step();
    expect(text('.demo-status')).toContain('ისევ მთელ');
    step();
    expect(text('.demo-status')).toContain('ნახევრები არ არის');
  });
});

describe('U05.5 quarters: interactions in the player', () => {
  it('the explore marks one quarter, then the next, then all four', () => {
    go('#/student/lessons/g1-u05-l5');
    toStage(L5, 'explore');
    const root = document.querySelector('.xt') as HTMLElement;
    const step = () => fireEvent.click(within(root).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(text('.demo-status')).toContain('მთელი');
    step();
    expect(text('.demo-status')).toContain('4 ტოლ ნაწილად');
    step();
    expect(text('.demo-status')).toContain('მეოთხედი');
    expect(document.querySelectorAll('.sh-piece.is-hi').length).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < 6; i += 1) step();
    expect(document.querySelectorAll('.sh-piece.is-hi').length).toBe(4);
  });
});

describe('completion and progress', () => {
  it('U05.5 completes the unit only when all five lessons are done', () => {
    const done = Object.fromEntries(IDS.slice(0, 4).map((id) => [id, { status: 'completed', checkCorrect: 3, checkTotal: 3, completedAt: 1 }]));
    window.localStorage.setItem(LEARN_STORAGE_KEY, JSON.stringify(done));
    resetProgressCache();
    go('#/student/lessons/g1-u05-l5');
    playThrough(L5);
    expect(screen.getByText(/U05 დასრულდა/)).toBeTruthy();
    expect(saved()['g1-u05-l5']).toMatchObject({ status: 'completed', checkCorrect: 4 });
  });

  it('failing the check does not complete the lesson; the check can be repeated', () => {
    go('#/student/lessons/g1-u05-l3');
    const firstCheck = L3.activities.findIndex((a) => a.stage === 'check');
    L3.activities.slice(0, firstCheck).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    /** A pair of dots that divides a shape into parts that are not what the question asks for. */
    const wrongPair = (shape: ShapeKind): [number, number] => {
      const dots = snapPoints(shape);
      for (let i = 0; i < dots.length; i += 1)
        for (let j = i + 1; j < dots.length; j += 1) {
          const d = divisionFromLines(shape, [[i, j]]);
          if (d.pieces.length === 2 && !hasEqualParts(d)) return [i, j];
        }
      throw new Error(`no unequal division of ${shape}`);
    };
    const tapPair = ([a, b]: [number, number]) => {
      fireEvent.click(screen.getAllByRole('button', { name: /^წერტილი/ })[a]);
      fireEvent.click(screen.getAllByRole('button', { name: /^წერტილი/ })[b]);
    };
    // a check question allows two tries: get both wrong, then move on
    /** One wrong answer with the lesson's own control for that check. */
    const answerWrong = (check: QuestionActivity) => {
      const r = check.response;
      if (r.type === 'cut') {
        tapPair(wrongPair(r.shape));
        return;
      }
      if (r.type === 'judge') {
        // the opposite of what is true
        radio(ruleHolds(r.rule, divisionOf(r.shape)) ? 1 : 0);
        return;
      }
      throw new Error(`no wrong answer for ${r.type}`);
    };
    const checks = stageOf(L3, 'check');
    for (const check of checks) {
      answerWrong(check);
      submit();
      expect(feedback(), check.id).not.toContain('სწორია');
      click('ხელახლა ცდა');
      const reset = screen.queryByRole('button', { name: /^↻ თავიდან$/ });
      if (reset) fireEvent.click(reset);
      answerWrong(check);
      submit();
      expect(feedback(), `${check.id}, second try`).not.toContain('სწორია');
      click(/^(გაგრძელება|გაკვეთილის დასრულება)$/);
    }
    expect(screen.getByRole('heading', { name: 'ჯერ არ დასრულებულა' })).toBeTruthy();
    expect(saved()['g1-u05-l3']?.status).not.toBe('completed');
    click('შემოწმების გამეორება');
    // the check starts again at its first question
    expect(screen.getByText(`ნაბიჯი ${firstCheck + 1} / ${L3.activities.length}`)).toBeTruthy();
  });
});

describe('style: motion and layout safeguards', () => {
  const css = readFileSync('src/lessons/learn.css', 'utf8');
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));

  it('every animated shape class is switched off under reduced motion', () => {
    for (const cls of ['.sh-piece', '.rs-piece', '.sh-cutline']) expect(reduced, cls).toContain(cls);
  });

  it('the shape boards scale with the screen and never set a phone-breaking width', () => {
    const rule = css.split('\n').find((l) => l.startsWith('.sh {') && l.includes('display: block')) ?? '';
    expect(rule).toContain('width: 100%');
    expect(css).toContain('@media (max-width: 520px)');
    // the sort boards fold to one column on a phone
    const small = css.slice(css.indexOf('@media (max-width: 520px)', css.indexOf('/* ─────────────────────────── U05')));
    expect(small).toContain('.sort-bins.has-3');
    expect(small).toContain('grid-template-columns: 1fr');
  });

  it('correctness is never shown by colour alone: every mark carries a word or a symbol', () => {
    render(<SortHarness tell rule="equal" items={[{ shape: 'circle', cuts: [[0.5, 0, 0.5, 1]] }]} />);
    const card = screen.getByRole('button', { name: /^ნახატი 1(,|$)/ });
    if (!card.getAttribute('aria-label')?.includes('არჩეულია')) fireEvent.click(card);
    fireEvent.click(screen.getByRole('button', { name: (n) => n.includes('ტოლი ნაწილები') && !n.includes('არატოლი') }));
    expect(document.querySelector('.sort-mark')?.textContent).toMatch(/[✓✗]/);
  });
});

