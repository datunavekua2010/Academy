// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';
import { LESSON_CONTENT } from '../src/lessons/content';
import { describeAnswer, evaluateAnswer } from '../src/lessons/check';
import { getUnit } from '../src/lessons/catalog';
import {
  betweenColumns,
  betweenRows,
  blockLengthOf,
  blockText,
  boundsOf,
  candidateHalf,
  cellCount,
  cellKey,
  completePicture,
  flipHorizontal,
  flipLooksSame,
  flipVertical,
  followsPattern,
  halfOf,
  hasBothLines,
  isLineOfSymmetry,
  isReflectionOf,
  isSlideOf,
  isSymmetric,
  isSymmetricAbout,
  itemAt,
  keySet,
  lineName,
  linesOfSymmetry,
  middleHorizontal,
  middleVertical,
  missingForSymmetry,
  nextItem,
  onLine,
  positionsOf,
  positionWord,
  reflectCell,
  reflectCells,
  rowOf,
  sameCells,
  symmetryCount,
  throughColumn,
  throughRow,
  tidy,
  unmatchedAcross,
} from '../src/lessons/exercises/SymmetryGeometry';
import { GridBoard, PictureBoard, SymmetryFillAnswer, SymmetryLineAnswer, candidateLines } from '../src/lessons/exercises/SymmetryBoard';
import { FlipPickAnswer } from '../src/lessons/exercises/SymmetryAnswers';
import { FlipLab, MirrorLab, ShapePatternLab, SymmetryLab } from '../src/lessons/exercises/SymmetryTools';
import type { Cell } from '../src/lessons/exercises/SymmetryGeometry';
import type { Lesson, QuestionActivity, ResponseSpec } from '../src/lessons/types';

/**
 * Grade 2 · Unit 10: "Symmetry, Flips, & Spatial Patterns".
 *
 * Symmetry here is measured, never eyeballed: every "yes, it is symmetric" in this suite is a reflection comparison over
 * the cells. Hand-drawn pictures are checked with the same engine the lessons use, so a picture that only looks like a
 * heart cannot pass as one.
 */

const U10 = ['g2-u10-l1', 'g2-u10-l2', 'g2-u10-l3', 'g2-u10-l4', 'g2-u10-l5'];
const lessons = U10.map((id) => LESSON_CONTENT[id]);
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);
const text = (sel: string) => document.querySelector(sel)?.textContent ?? '';
const cells = (spec: string): Cell[] => spec.split(' ').map((pair) => {
  const [x, y] = pair.replace(/[()]/g, '').split(',').map(Number);
  return { x, y };
});

// a 2×2 block, a 5×4 heart with one vertical line, a 3×3 cross with two, and a stair with one
const BLOCK: Cell[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }];
const CROSS: Cell[] = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }];
const HEART: Cell[] = [
  { x: 1, y: 0 }, { x: 3, y: 0 },
  { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
  { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
  { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 },
];
const LPIECE: Cell[] = [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }];
const STAIR: Cell[] = [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 2, y: 2 }];

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 2 U10 is the symmetry unit', () => {
  it('has the approved titles, ids and codes', () => {
    const unit = getUnit('g2-u10');
    expect(unit?.title).toBe('Symmetry, Flips, & Spatial Patterns');
    expect(unit?.grade).toBe(2);
    expect(unit?.lessons.map((l) => l.id)).toEqual(U10);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U10.1', 'U10.2', 'U10.3', 'U10.4', 'U10.5']);
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Recognizing Symmetrical Shapes',
      'Finding Lines of Symmetry',
      'Completing Symmetrical Pictures and Shapes',
      'Understanding Flips and Reflections',
      'Solving Spatial and Shape-Pattern Puzzles',
    ]);
  });

  it('has content for every one of the five lessons', () => {
    for (const id of U10) {
      expect(LESSON_CONTENT[id], id).toBeTruthy();
      expect(LESSON_CONTENT[id].id).toBe(id);
      expect(LESSON_CONTENT[id].status).toBe('placeholder');
    }
  });
});

// ─────────────────────────── cells ───────────────────────────

describe('cells: a picture is a set of cells, not a drawing', () => {
  it('tidies a cell list without changing the picture', () => {
    const messy = [{ x: 1, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
    expect(tidy(messy)).toEqual([{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]);
    expect(cellCount(messy)).toBe(3);
    expect(sameCells([{ x: 0, y: 0 }, { x: 1, y: 0 }], [{ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }])).toBe(true);
    expect(sameCells([{ x: 0, y: 0 }], [{ x: 1, y: 0 }])).toBe(false);
    expect(sameCells([{ x: 0, y: 0 }], [])).toBe(false);
    expect(cellKey({ x: 2, y: 3 })).toBe('2,3');
    expect(keySet([{ x: 2, y: 3 }]).has('2,3')).toBe(true);
  });

  it('knows where a picture sits on its grid', () => {
    expect(boundsOf(HEART)).toEqual({ minX: 0, maxX: 4, minY: 0, maxY: 3 });
    expect(boundsOf([])).toBeNull();
  });
});

// ─────────────────────────── reflection ───────────────────────────

describe('reflection: a mirror line is a number, not a guess', () => {
  it('puts the middle line where the grid actually splits', () => {
    // a 5-wide grid has a middle column; a 4-wide grid has no middle column, only a gap between two
    expect(middleVertical(5)).toEqual({ axis: 'vertical', at: 4 });
    expect(middleVertical(4)).toEqual({ axis: 'vertical', at: 3 });
    expect(middleHorizontal(4)).toEqual({ axis: 'horizontal', at: 3 });
    expect(betweenColumns(1)).toEqual({ axis: 'vertical', at: 3 });
    expect(throughColumn(2)).toEqual({ axis: 'vertical', at: 4 });
    expect(throughRow(1)).toEqual({ axis: 'horizontal', at: 2 });
  });

  it('reflects a cell and puts it back on the second reflection', () => {
    for (const line of [{ axis: 'vertical' as const, at: 4 }, { axis: 'horizontal' as const, at: 3 }, { axis: 'vertical' as const, at: 3 }])
      for (const cell of [{ x: 0, y: 0 }, { x: 1, y: 2 }, { x: 3, y: 1 }])
        expect(reflectCell(reflectCell(cell, line), line)).toEqual(cell);
    expect(reflectCell({ x: 0, y: 1 }, { axis: 'vertical', at: 4 })).toEqual({ x: 4, y: 1 });
    expect(reflectCell({ x: 1, y: 2 }, { axis: 'vertical', at: 3 })).toEqual({ x: 2, y: 2 });
    expect(reflectCell({ x: 1, y: 0 }, { axis: 'horizontal', at: 3 })).toEqual({ x: 1, y: 3 });
    // a cell on the line cannot move
    expect(reflectCell({ x: 2, y: 0 }, { axis: 'vertical', at: 4 })).toEqual({ x: 2, y: 0 });
    expect(onLine({ x: 2, y: 0 }, { axis: 'vertical', at: 4 })).toBe(true);
    expect(onLine({ x: 1, y: 0 }, { axis: 'vertical', at: 4 })).toBe(false);
  });

  it('names the line the way the lesson says it', () => {
    expect(lineName({ axis: 'vertical', at: 4 })).toBe('ვერტიკალური');
    expect(lineName({ axis: 'horizontal', at: 3 })).toBe('ჰორიზონტალური');
  });
});

// ─────────────────────────── symmetry ───────────────────────────

describe('symmetry: each hand-drawn picture is checked, not trusted', () => {
  it('a solid block and a cross have both lines; a heart has only the vertical one', () => {
    // a 2×2 solid block: still both lines, but through the gap between its two columns and two rows (at 1)
    expect(linesOfSymmetry(BLOCK)).toEqual([{ axis: 'vertical', at: 1 }, { axis: 'horizontal', at: 1 }]);
    expect(linesOfSymmetry(CROSS)).toEqual([{ axis: 'vertical', at: 2 }, { axis: 'horizontal', at: 2 }]);
    expect(linesOfSymmetry(HEART)).toEqual([{ axis: 'vertical', at: 4 }]);
    expect(isSymmetricAbout(HEART, { axis: 'vertical', at: 4 })).toBe(true);
    expect(isSymmetricAbout(HEART, { axis: 'horizontal', at: 2 })).toBe(false);
  });

  it('a stair has one line and an L has none', () => {
    expect(linesOfSymmetry(STAIR)).toEqual([{ axis: 'vertical', at: 2 }]);
    expect(linesOfSymmetry(LPIECE)).toEqual([]);
    expect(isSymmetric(LPIECE)).toBe(false);
    expect(hasBothLines(CROSS)).toBe(true);
    expect(hasBothLines(HEART)).toBe(false);
    expect(symmetryCount(HEART)).toBe(1);
  });

  it('does not accept a line that only divides the picture in two equal halves', () => {
    // the heart is 5 wide but its top row is 1 and 3 — a mirror at 2 would not match
    expect(isSymmetricAbout(HEART, { axis: 'vertical', at: 2 })).toBe(false);
    expect(isLineOfSymmetry(HEART, { axis: 'vertical', at: 2 })).toBe(false);
    // and a line outside the picture is never a line of symmetry
    expect(isSymmetricAbout(HEART, { axis: 'vertical', at: 12 })).toBe(false);
  });

  it('says exactly which cells are missing, and completing them makes it symmetric', () => {
    const half = halfOf(HEART, { axis: 'vertical', at: 4 });
    expect(half.every((c) => c.x < 2)).toBe(true);
    expect(sameCells(half, HEART.filter((c) => c.x < 2))).toBe(true);
    const missing = missingForSymmetry(half, { axis: 'vertical', at: 4 });
    expect(missing.length).toBeGreaterThan(0);
    expect(missing.every((c) => c.x > 2)).toBe(true);
    // completing the half gives a symmetric picture that holds every off-line cell of the heart
    const completed = completePicture(half, { axis: 'vertical', at: 4 });
    expect(isSymmetricAbout(completed, { axis: 'vertical', at: 4 })).toBe(true);
    for (const cell of HEART) if (cell.x !== 2) expect(keySet(completed).has(cellKey(cell)), cellKey(cell)).toBe(true);
    expect(missingForSymmetry(HEART, { axis: 'vertical', at: 4 })).toEqual([]);
    expect(unmatchedAcross(HEART, { axis: 'horizontal', at: 2 }).length).toBeGreaterThan(0);
  });

  it('every line it reports really does reflect the picture onto itself', () => {
    for (const picture of [BLOCK, CROSS, HEART, STAIR, LPIECE])
      for (const line of linesOfSymmetry(picture)) {
        expect(sameCells(reflectCells(picture, line), picture)).toBe(true);
        expect(reflectCells(picture, line).length).toBe(picture.length);
      }
    // and a picture with no line reports none
    expect(linesOfSymmetry(LPIECE)).toEqual([]);
    expect(isSymmetric(LPIECE)).toBe(false);
  });
});

// ─────────────────────────── flips ───────────────────────────

describe('flips: a reflection changes orientation, a slide does not', () => {
  it('flipping twice returns the shape', () => {
    expect(flipVertical(flipVertical(LPIECE, 3), 3)).toEqual(tidy(LPIECE));
    expect(flipHorizontal(flipHorizontal(LPIECE, 3), 3)).toEqual(tidy(LPIECE));
    expect(flipVertical(LPIECE, 3)).toEqual(tidy([{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 }]));
  });

  it('tells a reflection from a slide', () => {
    const flipped = flipVertical(LPIECE, 3);
    expect(isReflectionOf(LPIECE, flipped, middleVertical(3))).toBe(true);
    expect(isSlideOf(LPIECE, flipVertical(LPIECE, 3))).toBe(false);
    expect(isSlideOf(LPIECE, LPIECE.map((c) => ({ x: c.x + 2, y: c.y })))).toBe(true);
    // a shape flipped about a line it is not actually reflected across is not a reflection
    expect(isReflectionOf(LPIECE, flipped, middleHorizontal(3))).toBe(false);
  });

  it('a shape that looks the same in the mirror is its own mirror image', () => {
    expect(flipLooksSame(BLOCK, middleVertical(2))).toBe(true);
    expect(flipLooksSame(LPIECE, middleVertical(3))).toBe(false);
  });
});

// ─────────────────────────── patterns ───────────────────────────

describe('patterns: the next item is computed, not guessed', () => {
  it('repeats its block forever', () => {
    expect(itemAt(['circle', 'square', 'triangle'], 0)).toBe('circle');
    expect(itemAt(['circle', 'square', 'triangle'], 3)).toBe('circle');
    expect(itemAt(['circle', 'square', 'triangle'], 7)).toBe('square');
    expect(itemAt(['circle', 'square', 'triangle'], -1)).toBe('triangle');
    expect(rowOf(['a', 'b'], 5)).toEqual(['a', 'b', 'a', 'b', 'a']);
    expect(nextItem(['a', 'b', 'c'], 6)).toBe('a');
    expect(() => itemAt([], 0)).toThrow(RangeError);
  });

  it('reads the block back out of the row it produced', () => {
    for (const block of [['a'], ['a', 'b'], ['a', 'b', 'c'], ['a', 'a', 'b']])
      for (const length of [3, 5, 7]) {
        const row = rowOf(block, length);
        expect(followsPattern(block, row)).toBe(true);
        expect(blockLengthOf(row)).toBeLessThanOrEqual(block.length);
        expect(row.every((item) => block.includes(item))).toBe(true);
      }
    expect(blockLengthOf(['a', 'b', 'a', 'b'])).toBe(2);
    expect(blockLengthOf(['a', 'a', 'a'])).toBe(1);
    expect(blockText(['circle', 'square'])).toBe('circle, square');
    expect(positionWord(2)).toBe('3-ე ადგილი');
    expect(positionsOf(['a', 'b', 'a'], 6, 'a')).toEqual([0, 2, 3, 5]);
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

describe('checking: symmetry answers are judged by reflection', () => {
  it('completing a picture accepts only the cells that make it symmetric', () => {
    const half = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
    const fill = q({ type: 'symmetry-fill', picture: { width: 4, height: 2, cells: half }, line: { axis: 'vertical', at: 3 } });
    expect(evaluateAnswer(fill, '2,0;3,0').verdict).toBe('correct');
    expect(evaluateAnswer(fill, '2,0').verdict).toBe('incorrect');
    expect(evaluateAnswer(fill, '').verdict).toBe('incomplete');
    // symmetry about the wrong axis is still wrong, even when the count matches
    expect(evaluateAnswer(fill, '0,1;1,1').verdict).toBe('incorrect');
  });

  it('counts the lines a picture really has, and rejects a line it does not', () => {
    const count = q({ type: 'symmetry-line', picture: { width: 3, height: 3, cells: CROSS }, candidates: [{ axis: 'vertical', at: 2 }, { axis: 'horizontal', at: 2 }], ask: 'count' });
    expect(evaluateAnswer(count, '2').verdict).toBe('correct');
    expect(evaluateAnswer(count, '1').verdict).toBe('incorrect');

    const pick = q({ type: 'symmetry-line', picture: { width: 5, height: 4, cells: HEART }, candidates: [{ axis: 'vertical', at: 4 }, { axis: 'horizontal', at: 2 }], ask: 'pick' });
    expect(evaluateAnswer(pick, 'vertical:4').verdict).toBe('correct');
    expect(evaluateAnswer(pick, 'vertical:4,horizontal:2').verdict).toBe('incorrect');
    expect(evaluateAnswer(pick, '').verdict).toBe('incomplete');
    expect(describeAnswer({ type: 'symmetry-line', picture: { width: 5, height: 4, cells: HEART }, candidates: [{ axis: 'vertical', at: 4 }, { axis: 'horizontal', at: 2 }], ask: 'pick' })).toBe('ვერტიკალური');
  });

  it('a flip answer must be the real reflection, not the shape slid over', () => {
    const flipped = flipVertical(LPIECE, 3);
    const pick = q({
      type: 'flip-pick',
      source: LPIECE,
      line: middleVertical(3),
      width: 3,
      height: 3,
      options: [{ id: 'a', cells: LPIECE }, { id: 'b', cells: flipped }],
    });
    expect(evaluateAnswer(pick, 'b').verdict).toBe('correct');
    const slid = evaluateAnswer(pick, 'a');
    expect(slid.verdict).toBe('incorrect');
    expect(slid.feedback).toContain('გადატანა');
    expect(evaluateAnswer(pick, '').verdict).toBe('incomplete');
    expect(describeAnswer({
      type: 'flip-pick', source: LPIECE, line: middleVertical(3), width: 3, height: 3,
      options: [{ id: 'a', cells: LPIECE }, { id: 'b', cells: flipped }],
    })).toBe('b');
  });

  it('a reflection answer is the reflected cell list', () => {
    const reflect = q({ type: 'reflect', picture: { width: 3, height: 2, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }] }, line: { axis: 'vertical', at: 2 } });
    expect(evaluateAnswer(reflect, '2,0;1,0').verdict).toBe('correct');
    expect(evaluateAnswer(reflect, '0,0;1,0').verdict).toBe('incorrect');
    expect(evaluateAnswer(reflect, '').verdict).toBe('incomplete');
  });
});

// ─────────────────────────── content invariants ───────────────────────────

describe('content: the ten activities of every lesson', () => {
  it('runs challenge, explore, understand, four practice and three checks', () => {
    for (const l of lessons) {
      expect(l.activities.map((a) => a.id), l.id).toEqual(['challenge', 'explore', 'understand', 'practice-1', 'practice-2', 'practice-3', 'practice-4', 'check-1', 'check-2', 'check-3']);
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

  it('each lesson uses the tool the unit says it uses', () => {
    const tool = (id: string) => (LESSON_CONTENT[id].activities.find((a) => a.kind === 'explore') as Extract<Lesson['activities'][number], { kind: 'explore' }>).tool.tool;
    expect(tool('g2-u10-l1')).toBe('mirror-lab');
    expect(tool('g2-u10-l2')).toBe('mirror-lab');
    expect(tool('g2-u10-l3')).toBe('symmetry-lab');
    expect(tool('g2-u10-l4')).toBe('flip-lab');
    expect(tool('g2-u10-l5')).toBe('pattern-shapes-lab');
  });
});

/** The answer a question expects, computed from the picture it ships. */
function correctAnswer(r: ResponseSpec): string {
  switch (r.type) {
    case 'choice':
      return r.answer;
    case 'numeric':
      return String(r.answer);
    case 'symmetry-fill':
      return missingForSymmetry(r.picture.cells, r.line).map(cellKey).join(';');
    case 'symmetry-line':
      return r.ask === 'count'
        ? String(r.candidates.filter((line) => isSymmetricAbout(r.picture.cells, line)).length)
        : r.candidates.filter((line) => isSymmetricAbout(r.picture.cells, line)).map((l) => `${l.axis}:${l.at}`).join(',');
    case 'flip-pick': {
      const actual = r.options.find((o) => isReflectionOf(r.source, o.cells, r.line));
      expect(actual, 'a real reflection among the options').toBeTruthy();
      return actual!.id;
    }
    case 'reflect':
      return reflectCells(r.picture.cells, r.line).map(cellKey).join(';');
    default:
      throw new Error(`no answer for ${r.type}`);
  }
}

describe('content: every question is answerable from its own picture', () => {
  it('the engine agrees with the content, question by question', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        expect(evaluateAnswer(x, correctAnswer(x.response)).verdict, `${l.id}/${x.id} (${x.response.type})`).toBe('correct');
      }
  });

  it('no picture claims a line it does not really have', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'symmetry-fill' && r.type !== 'reflect') continue;
        // completing the picture really does make it symmetric about the line it names
        const complete = completePicture(r.picture.cells, r.line);
        expect(isSymmetricAbout(complete, r.line), `${l.id}/${x.id}`).toBe(true);
        // every cell stays inside the grid the question draws
        for (const c of complete) {
          expect(c.x, `${l.id}/${x.id}`).toBeGreaterThanOrEqual(0);
          expect(c.x, `${l.id}/${x.id}`).toBeLessThan(r.picture.width);
          expect(c.y, `${l.id}/${x.id}`).toBeGreaterThanOrEqual(0);
          expect(c.y, `${l.id}/${x.id}`).toBeLessThan(r.picture.height);
        }
      }
  });

  it('the mirror lines asked about are inside the picture', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type === 'symmetry-line')
          for (const line of r.candidates) {
            expect(line.at, `${l.id}/${x.id}`).toBeGreaterThanOrEqual(0);
            expect(line.at, `${l.id}/${x.id}`).toBeLessThanOrEqual(line.axis === 'vertical' ? r.picture.width : r.picture.height);
          }
        if (r.type === 'flip-pick') for (const o of r.options)
          for (const c of o.cells) {
            expect(c.x, `${l.id}/${x.id}/${o.id}`).toBeLessThan(r.width);
            expect(c.y, `${l.id}/${x.id}/${o.id}`).toBeLessThan(r.height);
          }
      }
  });

  it('a flip question offers exactly one real reflection', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'flip-pick') continue;
        const real = r.options.filter((o) => isReflectionOf(r.source, o.cells, r.line));
        expect(real, `${l.id}/${x.id}`).toHaveLength(1);
        // the decoys are not the answer, and none is another reflection of the source
        for (const o of r.options) if (o.id !== real[0].id) expect(isReflectionOf(r.source, o.cells, r.line)).toBe(false);
      }
  });

  it('symmetry-count questions count what the picture really has', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'numeric' || x.visual?.type !== 'grid-picture') continue;
        // a "how many lines?" question must agree with the picture; a "how many cells are missing?" question must
        // agree with the cells it leaves out — the two are told apart by the unit the question asks in
        if (r.unit === 'ხაზი') expect(r.answer, `${l.id}/${x.id}`).toBe(linesOfSymmetry(x.visual.picture.cells).length);
        else if (r.unit === 'უჯრა' && x.visual.line)
          expect(r.answer, `${l.id}/${x.id}`).toBe(missingForSymmetry(x.visual.picture.cells, x.visual.line).length);
      }
  });
});

// ─────────────────────────── boards ───────────────────────────

describe('board: the grid is drawn from its cells', () => {
  it('draws every cell of the grid, filled or not, and the mirror line', () => {
    render(<GridBoard picture={{ width: 3, height: 2, cells: [{ x: 0, y: 0 }] }} line={{ axis: 'vertical', at: 2 }} label="ფიგურა" />);
    expect(document.querySelectorAll('.grd-cell')).toHaveLength(6);
    expect(document.querySelectorAll('.grd-cell.is-filled')).toHaveLength(1);
    expect(document.querySelectorAll('.grd-line.is-vertical')).toHaveLength(1);
    expect(screen.getByRole('img', { name: 'ფიგურა' })).toBeTruthy();
  });

  it('can show where a mirror would put the picture', () => {
    render(<PictureBoard picture={{ width: 4, height: 2, cells: [{ x: 0, y: 0 }] }} line={{ axis: 'vertical', at: 3 }} ghost caption="მონახაზი" />);
    expect(document.querySelectorAll('.grd-cell.is-ghost')).toHaveLength(1);
    expect(text('.grd-fig .grd-cap')).toBe('ვერტიკალური სარკის ხაზი');
  });

  it('the fill board offers a button per cell and cannot take a given cell away', () => {
    const onChange = vi.fn();
    render(<SymmetryFillAnswer picture={{ width: 4, height: 1, cells: [{ x: 0, y: 0 }] }} line={{ axis: 'vertical', at: 3 }} value="" onChange={onChange} disabled={false} label="შეავსე" />);
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getAllByRole('button')[0].getAttribute('aria-pressed')).toBe('true');
    // a given cell does nothing at all
    fireEvent.click(screen.getByRole('button', { name: /უჯრა 1,1/ }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /უჯრა 4,1/ }));
    expect(onChange).toHaveBeenLastCalledWith('3,0');
    expect(text('.symf-note')).toContain('შეავსე უჯრები');
  });

  it('the fill board says when the picture has become symmetric', () => {
    render(<SymmetryFillAnswer picture={{ width: 4, height: 1, cells: [{ x: 0, y: 0 }] }} line={{ axis: 'vertical', at: 3 }} value="3,0" onChange={() => {}} disabled={false} label="შეავსე" />);
    expect(text('.symf-note')).toBe('ფიგურა სარკულია!');
  });

  it('the line board tries a candidate line over the picture', () => {
    const onChange = vi.fn();
    render(<SymmetryLineAnswer picture={{ width: 3, height: 3, cells: CROSS }} candidates={[{ axis: 'vertical', at: 2 }, { axis: 'horizontal', at: 2 }]} value="" onChange={onChange} disabled={false} label="აირჩიე ხაზი" />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    fireEvent.click(buttons[0]);
    expect(onChange).toHaveBeenLastCalledWith('vertical:2');
    expect(text('.syml-note')).toContain('აირჩიე ხაზი');
  });

  it('offers only the lines a picture this size could have, without duplicates', () => {
    for (const [w, h] of [[3, 3], [4, 4], [5, 4], [2, 2], [4, 3]]) {
      const lines = candidateLines(w, h);
      const keys = lines.map((l) => `${l.axis}:${l.at}`);
      expect(new Set(keys).size, `${w}×${h}`).toBe(keys.length);
      for (const l of lines) {
        expect(l.at, `${w}×${h} ${l.axis}`).toBeGreaterThanOrEqual(0);
        expect(l.at, `${w}×${h} ${l.axis}`).toBeLessThanOrEqual(l.axis === 'vertical' ? w : h);
      }
      // the middle line of this grid is always among the candidates
      expect(keys).toContain(`vertical:${middleVertical(w).at}`);
      expect(keys).toContain(`horizontal:${middleHorizontal(h).at}`);
    }
  });

  it('the flip picker shows each option and warns when the same shape was only slid', () => {
    const flipped = flipVertical(LPIECE, 3);
    const onChange = vi.fn();
    render(
      <FlipPickAnswer
        source={LPIECE}
        line={middleVertical(3)}
        options={[{ id: 'a', cells: LPIECE }, { id: 'b', cells: flipped }]}
        value=""
        onChange={onChange}
        disabled={false}
        label="აირჩიე ანარეკლი"
        render={(c) => <GridBoard picture={{ width: 3, height: 3, cells: c }} label="ვარიანტი" />}
      />,
    );
    expect(screen.getAllByRole('button')).toHaveLength(2);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onChange).toHaveBeenLastCalledWith('a');
    cleanup();
    render(
      <FlipPickAnswer
        source={LPIECE}
        line={middleVertical(3)}
        options={[{ id: 'a', cells: LPIECE }, { id: 'b', cells: flipped }]}
        value="a"
        onChange={onChange}
        disabled={false}
        label="აირჩიე ანარეკლი"
        render={() => <span />}
      />,
    );
    expect(text('.symp-note')).toContain('მხოლოდ გადატანილია');
  });
});

// ─────────────────────────── tools ───────────────────────────

describe('tools: the mirror lab', () => {
  it('says whether the line it is showing really is a mirror line', () => {
    render(<MirrorLab tool={{ tool: 'mirror-lab', pictures: [{ width: 5, height: 4, cells: HEART }] }} />);
    expect(text('.lab-status')).toContain('ნამდვილი სარკის ხაზია');
    expect(text('.lab-facts')).toContain('სარკის ხაზები: 1');
    fireEvent.click(screen.getByRole('button', { name: 'ჰორიზონტალური' }));
    expect(text('.lab-status')).toContain('სარკის ხაზი არ არის');
    expect(text('.lab-status')).toMatch(/\d+ უჯრას წყვილი არ აქვს/);
  });

  it('sliding the line off the picture stops it being a mirror line', () => {
    render(<MirrorLab tool={{ tool: 'mirror-lab', pictures: [{ width: 3, height: 3, cells: CROSS }] }} />);
    expect(text('.lab-status')).toContain('ნამდვილი');
    for (let i = 0; i < 2; i += 1) fireEvent.click(screen.getByRole('button', { name: 'სარკის ხაზი მარცხნივ' }));
    expect(text('.lab-status')).toContain('არ არის');
    fireEvent.click(screen.getByRole('button', { name: '↻ შუაზე' }));
    expect(text('.lab-status')).toContain('ნამდვილი');
  });
});

describe('tools: the symmetry lab completes a picture', () => {
  it('says what is missing and fills it in on request', () => {
    render(<SymmetryLab tool={{ tool: 'symmetry-lab', pictures: [{ width: 4, height: 1, cells: [{ x: 0, y: 0 }] }], line: { axis: 'vertical', at: 3 } }} />);
    expect(text('.lab-status')).toContain('1 უჯრა აკლია');
    fireEvent.click(screen.getByRole('button', { name: 'შეავსე ავტომატურად' }));
    expect(text('.symf-note')).toBe('ფიგურა სარკულია!');
    expect(text('.lab-status')).toContain('ახლა შევსებულია 2');
  });
});

describe('tools: the flip lab', () => {
  it('shows the flip and says what it did to the shape', () => {
    render(<FlipLab tool={{ tool: 'flip-lab', cells: LPIECE, width: 4, height: 3 }} />);
    expect(text('.lab-status')).toContain('ორიენტაცია შეიცვალა');
    fireEvent.click(screen.getByRole('button', { name: 'გადატანა' }));
    expect(text('.lab-status')).toContain('მხოლოდ ადგილი შეიცვალა');
    expect(text('.lab-facts')).toContain('უჯრები: 4');
  });
});

describe('tools: the pattern lab', () => {
  it('extends the row one shape at a time and names the block', () => {
    render(<ShapePatternLab tool={{ tool: 'pattern-shapes-lab', block: ['circle', 'square'], length: 3 }} />);
    expect(document.querySelectorAll('.shp-cell')).toHaveLength(4);
    expect(document.querySelectorAll('.shp-cell.is-next')).toHaveLength(1);
    expect(text('.lab-status')).toContain('ბლოკი');
    expect(text('.lab-status')).toContain('შემდეგია');
    fireEvent.click(screen.getByRole('button', { name: '+ ერთი' }));
    expect(text('.lab-facts')).toContain('სიგრძე: 4');
    expect(document.querySelectorAll('.shp-cell .is-next')).toHaveLength(0);
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

/** Taps the cells that complete a picture, reading the missing ones from the picture itself. */
function fillSymmetry(r: Extract<ResponseSpec, { type: 'symmetry-fill' }>) {
  for (const cell of missingForSymmetry(r.picture.cells, r.line)) fireEvent.click(screen.getByRole('button', { name: new RegExp(`^უჯრა ${cell.x + 1},${cell.y + 1}`) }));
}

/** The flip board tags each option with its id, so an option is found by the tag it shows. */
function flipOption(id: string) {
  const option = screen.getAllByRole('button').find((button) => button.querySelector('.symp-tag')?.textContent === id.toUpperCase());
  expect(option, `the ${id.toUpperCase()} option`).toBeTruthy();
  return option!;
}

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
    case 'symmetry-fill':
      fillSymmetry(r);
      break;
    case 'symmetry-line': {
      const right = r.candidates.filter((line) => isSymmetricAbout(r.picture.cells, line));
      if (r.ask === 'count') fireEvent.change(screen.getByRole('textbox'), { target: { value: String(right.length) } });
      else for (const line of right) fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${lineName(line)} ·`) }));
      break;
    }
    case 'flip-pick': {
      const actual = r.options.find((o) => isReflectionOf(r.source, o.cells, r.line))!;
      fireEvent.click(flipOption(actual.id));
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

describe('g2-u10 unit page', () => {
  it('lists the five lessons, all playable and in order', () => {
    go('#/student/lessons/g2-u10');
    const list = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(list).toHaveLength(5);
    U10.forEach((id, i) => expect(within(list[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
  });
});

describe.each(U10.map((id) => [id] as const))('%s plays to the end', (id) => {
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
    if (n < 5) expect(screen.getByRole('link', { name: `გაგრძელება: U10.${n + 1}` }).getAttribute('href')).toBe(`#/student/lessons/g2-u10-l${n + 1}`);
    else expect(screen.getByRole('link', { name: 'U10-ზე დაბრუნება' })).toBeTruthy();
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

  it('a half-finished picture is told which cell is still unmatched', () => {
    upTo('g2-u10-l3', 'check-1');
    const r = (LESSON_CONTENT['g2-u10-l3'].activities.find((a) => a.id === 'check-1') as QuestionActivity).response as Extract<ResponseSpec, { type: 'symmetry-fill' }>;
    const missing = missingForSymmetry(r.picture.cells, r.line);
    const first = missing[0];
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^უჯრა ${first.x + 1},${first.y + 1}`) }));
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('წყვილი');
  });

  it('picking the slid shape is answered with the difference between sliding and reflecting', () => {
    upTo('g2-u10-l4', 'check-1');
    const r = (LESSON_CONTENT['g2-u10-l4'].activities.find((a) => a.id === 'check-1') as QuestionActivity).response as Extract<ResponseSpec, { type: 'flip-pick' }>;
    // the decoy that is the source itself, only moved
    const slid = r.options.find((o) => sameCells(o.cells, r.source))!;
    expect(slid, 'a slid decoy among the options').toBeTruthy();
    fireEvent.click(flipOption(slid.id));
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toMatch(/გადატანა|ორიენტაცია|არეკვლა/);
  });
});

describe('style: symmetry has its own look, and a phone width', () => {
  const css = readFileSync('src/lessons/learn.css', 'utf8');
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));

  it('filled cells, ghost cells and mirror lines are drawn differently', () => {
    expect(css).toContain('.grd-cell.is-filled');
    expect(css).toContain('.grd-cell.is-ghost');
    expect(css).toContain('.grd-line');
  });

  it('the symmetry boards have their own layout and a phone width', () => {
    expect(css).toContain('.grd-grid');
    expect(css).toContain('.symf-note');
    expect(css).toContain('.symp-list');
    expect(css).toContain('.shp-cell');
    const small = css.slice(css.lastIndexOf('@media (max-width: 560px)'));
    expect(small).toContain('.grd-grid');
    expect(small).toContain('.shp-cell');
  });

  it('the grid is switched off under reduced motion', () => {
    expect(reduced).toContain('.grd-cell');
    expect(reduced).toContain('.grd-line');
  });
});
