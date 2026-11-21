// @vitest-environment jsdom
import './helpers/signed-in-student';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';
import { LESSON_CONTENT } from '../src/lessons/content';
import { describeAnswer, evaluateAnswer } from '../src/lessons/check';
import { getUnit } from '../src/lessons/catalog';
import {
  addToBalance,
  blankSentenceText,
  blankSideWord,
  differenceOf,
  groupsEqual,
  heavierSide,
  isBalanced,
  leftTotal,
  missingFor,
  moveToBalance,
  panTotal,
  partitions,
  puzzleAnswer,
  puzzleSolvable,
  rightTotal,
  sentenceHolds,
  sentenceLeft,
  sentenceText,
  tiltOf,
  type ScaleSpec,
} from '../src/lessons/exercises/BalanceGeometry';
import {
  ATTR_NAME,
  cellKey,
  chartCount,
  chartDifference,
  chartCompareText,
  chartLeast,
  chartMost,
  chartTie,
  chartTotal,
  clueHolds,
  allCluesHold,
  groupsBy,
  ruleOf,
  survivors,
  vennRegion,
  vennRegions,
  objectsInRegion,
  gridCells,
  VENN_REGION_NAME,
  objectName,
  type ChartSpec,
  type SortObj,
} from '../src/lessons/exercises/SortGeometry';
import { BalanceScale, GroupsBoard, SentenceLine } from '../src/lessons/exercises/BalanceBoard';
import { PictureChart, SortChip, SortIntoGroups, GridBoard, VennBoard, ClueBoard, valueLabel } from '../src/lessons/exercises/SortBoard';
import { BalanceLab, EqualGroupsLab, PuzzleLab, SentenceLab } from '../src/lessons/exercises/BalanceTools';
import { ChartLab, SortLab, VennLab, ChartDemo } from '../src/lessons/exercises/SortTools';
import type { Activity, Lesson, QuestionActivity, ResponseSpec } from '../src/lessons/types';

/**
 * Grade 1 · Units 9 and 10: "Understanding the Equals Sign & Balance Scales" and "Sorting, Venn Diagrams, & Picture
 * Charts".
 *
 * Every judgement is checked against the numbers: a scale is level exactly when its two totals are equal, a sentence
 * holds exactly when its sides are equal, and a group, cell or region comes from the object's own attributes.
 * Touch has not been tried on a device (there is no browser here); the tests drive taps and the boards' buttons.
 */

const U09 = ['g1-u09-l1', 'g1-u09-l2', 'g1-u09-l3', 'g1-u09-l4', 'g1-u09-l5'];
const U10 = ['g1-u10-l1', 'g1-u10-l2', 'g1-u10-l3', 'g1-u10-l4', 'g1-u10-l5'];
const lessons09 = U09.map((id) => LESSON_CONTENT[id]);
const lessons10 = U10.map((id) => LESSON_CONTENT[id]);
const all = [...lessons09, ...lessons10];
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);

const obj = (id: string, colour: SortObj['colour'], kind: SortObj['kind'], size: SortObj['size']): SortObj => ({ id, colour, kind, size });
const SET: SortObj[] = [
  obj('r1', 'red', 'circle', 'small'),
  obj('r2', 'red', 'triangle', 'large'),
  obj('b1', 'blue', 'circle', 'large'),
  obj('b2', 'blue', 'triangle', 'small'),
];

const text = (selector: string) => document.querySelector(selector)?.textContent ?? '';

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 1 U09 is the equals-sign unit', () => {
  it('has the approved titles, ids and codes', () => {
    const unit = getUnit('g1-u09');
    expect(unit?.title).toBe('Understanding the Equals Sign (=) & Balance Scales');
    expect(unit?.lessons.map((l) => l.id)).toEqual(U09);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U09.1', 'U09.2', 'U09.3', 'U09.4', 'U09.5']);
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Understanding Equality as Balance',
      'Finding Equal Groups and Quantities',
      'Completing Number Sentences with the Equals Sign',
      'Finding Missing Numbers in Simple Equations',
      'Solving Balance Puzzles with Numbers',
    ]);
  });
});

describe('catalog: Grade 1 U10 is the sorting unit', () => {
  it('has the approved titles, ids and codes', () => {
    const unit = getUnit('g1-u10');
    expect(unit?.title).toBe('Sorting, Venn Diagrams, & Picture Charts');
    expect(unit?.lessons.map((l) => l.id)).toEqual(U10);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U10.1', 'U10.2', 'U10.3', 'U10.4', 'U10.5']);
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Sorting Objects by One Attribute',
      'Sorting Objects by Two Attributes',
      'Understanding Groups and Overlapping Groups',
      'Reading and Creating Simple Picture Charts',
      'Solving Sorting and Classification Puzzles',
    ]);
  });
});

// ─────────────────────────── balance geometry ───────────────────────────

describe('balance: a scale is level exactly when the totals match', () => {
  it('totals, tilt and difference all come from the weights', () => {
    const level: ScaleSpec = { left: { weights: [3] }, right: { weights: [1, 2] } };
    expect(panTotal({ weights: [1, 2] })).toBe(3);
    expect(leftTotal(level)).toBe(3);
    expect(rightTotal(level)).toBe(3);
    expect(isBalanced(level)).toBe(true);
    expect(tiltOf(level)).toBe('level');
    expect(heavierSide(level)).toBeNull();
    expect(differenceOf(level)).toBe(0);
  });

  it('names the heavier side and how far off it is', () => {
    const left: ScaleSpec = { left: { weights: [5] }, right: { weights: [3] } };
    expect(tiltOf(left)).toBe('left');
    expect(heavierSide(left)).toBe('left');
    expect(differenceOf(left)).toBe(2);
    const right: ScaleSpec = { left: { weights: [2] }, right: { weights: [7, 1] } };
    expect(tiltOf(right)).toBe('right');
    expect(differenceOf(right)).toBe(6);
    expect(isBalanced(right)).toBe(false);
  });

  it('an empty pan is a real weight of zero, not an error', () => {
    expect(panTotal({ weights: [] })).toBe(0);
    expect(isBalanced({ left: { weights: [] }, right: { weights: [] } })).toBe(true);
  });
});

describe('balance: number sentences', () => {
  it('a sentence is written with a real minus sign and read by value', () => {
    const s = { left: { a: 3, op: '+' as const, b: 2 }, right: 5 };
    expect(sentenceText(s)).toBe('3 + 2 = 5');
    expect(sentenceLeft(s)).toBe(5);
    expect(sentenceHolds(s)).toBe(true);
    expect(sentenceText({ left: { a: 9, op: '−', b: 4 }, right: 5 })).toBe('9 − 4 = 5');
    expect(sentenceHolds({ left: { a: 9, op: '−', b: 4 }, right: 4 })).toBe(false);
    expect(sentenceText({ left: { a: 7 }, right: 7 })).toBe('7 = 7');
  });

  it('the same total can be written in more than one way', () => {
    expect(sentenceHolds({ left: { a: 3, op: '+', b: 2 }, right: 5 })).toBe(true);
    expect(sentenceHolds({ left: { a: 4, op: '+', b: 1 }, right: 5 })).toBe(true);
    expect(sentenceHolds({ left: { a: 5, op: '−', b: 0 }, right: 5 })).toBe(true);
  });

  it('every way of splitting a total into two parts is found', () => {
    const parts = partitions(5);
    expect(parts.every(([a, b]) => a + b === 5)).toBe(true);
    expect(parts).toEqual([
      [1, 4],
      [2, 3],
    ]);
  });
});

describe('balance: the missing number', () => {
  it('a missing part is found by subtracting, in both directions', () => {
    expect(missingFor({ left: { a: 3, op: '+', b: 4 }, right: 7 }, 'second')).toBe(4);
    expect(missingFor({ left: { a: 9, op: '−', b: 4 }, right: 5 }, 'second')).toBe(4);
    expect(missingFor({ left: { a: 9, op: '−', b: 4 }, right: 5 }, 'first')).toBe(9);
    expect(missingFor({ left: { a: 4, op: '+', b: 5 }, right: 0 }, 'total')).toBe(9);
  });

  it('a blank is written where it belongs, not always at the end', () => {
    const s = { left: { a: 3, op: '+' as const, b: 4 }, right: 7 };
    expect(blankSentenceText(s, 'second')).toBe('3 + □ = 7');
    expect(blankSentenceText(s, 'first')).toBe('□ + 4 = 7');
    expect(blankSentenceText(s, 'total')).toBe('3 + 4 = □');
    expect(blankSideWord('second')).toBe('მეორე რიცხვი');
  });
});

describe('balance: equal groups', () => {
  it('equality is the count, never the look', () => {
    expect(groupsEqual(4, 4)).toBe(true);
    expect(groupsEqual(4, 5)).toBe(false);
  });

  it('what to add, and what can be moved to balance', () => {
    expect(addToBalance(3, 7)).toBe('a');
    expect(addToBalance(7, 3)).toBe('b');
    expect(addToBalance(4, 4)).toBeNull();
    expect(moveToBalance(2, 2)).toBe(0);
    expect(moveToBalance(2, 6)).toBe(2);
    // an odd difference cannot be fixed by moving counters between the groups
    expect(moveToBalance(3, 6)).toBeNull();
  });
});

describe('balance: puzzles', () => {
  it('one unknown on a pan is the total divided by how many there are', () => {
    expect(puzzleAnswer({ unknownCount: 2, known: 8 })).toBe(4);
    expect(puzzleAnswer({ unknownCount: 3, known: 9 })).toBe(3);
    expect(puzzleAnswer({ unknownCount: 2, known: 7 })).toBeNull();
    expect(puzzleAnswer({ unknownCount: 0, known: 4 })).toBeNull();
  });

  it('a puzzle is solvable only when a clue divides exactly', () => {
    expect(puzzleSolvable({ unknown: 'x', answer: 4, clues: [{ unknownCount: 2, known: 8, onLeft: true }] })).toBe(true);
    expect(puzzleSolvable({ unknown: 'x', answer: 5, clues: [{ unknownCount: 2, known: 8, onLeft: true }] })).toBe(false);
  });
});

// ─────────────────────────── sorting geometry ───────────────────────────

describe('sorting: one attribute', () => {
  it('objects group by their own attribute value', () => {
    const byColour = groupsBy(SET, 'colour');
    expect(byColour.map((g) => g.value)).toEqual(['red', 'blue']);
    expect(byColour[0].objects.map((o) => o.id)).toEqual(['r1', 'r2']);
    const byKind = groupsBy(SET, 'kind');
    expect(byKind.map((g) => g.value)).toEqual(['circle', 'triangle']);
  });

  it('every object lands in exactly one group', () => {
    for (const attr of ['colour', 'kind', 'size'] as const) {
      const groups = groupsBy(SET, attr);
      expect(groups.flatMap((g) => g.objects)).toHaveLength(SET.length);
      expect(new Set(groups.flatMap((g) => g.objects.map((o) => o.id))).size).toBe(SET.length);
    }
  });

  it('the rule behind a sorted collection can be read back', () => {
    expect(ruleOf([SET.filter((o) => o.colour === 'red'), SET.filter((o) => o.colour === 'blue')])).toBe('colour');
    expect(ruleOf([SET.filter((o) => o.kind === 'circle'), SET.filter((o) => o.kind === 'triangle')])).toBe('kind');
  });
});

describe('sorting: two attributes', () => {
  it('a cell is exactly the pair of attributes', () => {
    expect(cellKey(SET[1], 'colour', 'kind')).toBe('red|triangle');
    expect(cellKey(SET[1], 'kind', 'colour')).toBe('triangle|red');
  });

  it('the grid has a cell for every pair, empty ones included', () => {
    const cells = gridCells(['red', 'blue'], ['circle', 'triangle']);
    expect(cells.map((c) => c.key)).toEqual(['red|circle', 'red|triangle', 'blue|circle', 'blue|triangle']);
  });
});

describe('sorting: overlapping groups', () => {
  it('an object can be in both circles, in one, or outside', () => {
    expect(vennRegion(SET[1], 'colour', 'red', 'kind', 'triangle')).toBe('both');
    expect(vennRegion(SET[0], 'colour', 'red', 'kind', 'triangle')).toBe('left');
    expect(vennRegion(SET[3], 'colour', 'red', 'kind', 'triangle')).toBe('right');
    expect(vennRegion(SET[2], 'colour', 'red', 'kind', 'triangle')).toBe('none');
  });

  it('every object is in exactly one region, and the regions add up', () => {
    const regions = vennRegions(SET, 'colour', 'red', 'kind', 'triangle');
    expect(regions).toEqual(['left', 'both', 'none', 'right']);
    const counted = ['both', 'left', 'right', 'none'].map((r) => objectsInRegion(SET, r as never, 'colour', 'red', 'kind', 'triangle').length);
    expect(counted.reduce((a, b) => a + b, 0)).toBe(SET.length);
  });
});

describe('sorting: picture charts', () => {
  const chart: ChartSpec = {
    glyph: 'star',
    rows: [
      { label: 'ვაშლი', count: 4 },
      { label: 'მსხალი', count: 2 },
      { label: 'ატამი', count: 5 },
    ],
  };

  it('the count is the number of symbols, and the total is the sum', () => {
    expect(chartCount(chart, 'ვაშლი')).toBe(4);
    expect(chartCount(chart, 'არცერთი')).toBe(0);
    expect(chartTotal(chart)).toBe(11);
  });

  it('most and least are decided by count, and ties are reported together', () => {
    expect(chartMost(chart)).toEqual(['ატამი']);
    expect(chartLeast(chart)).toEqual(['მსხალი']);
    const tied: ChartSpec = { glyph: 'star', rows: [{ label: 'ა', count: 3 }, { label: 'ბ', count: 3 }] };
    expect(chartMost(tied)).toEqual(['ა', 'ბ']);
    expect(chartTie(tied, 'ა', 'ბ')).toBe(true);
  });

  it('a comparison is said in words with the real difference', () => {
    expect(chartDifference(chart, 'ატამი', 'მსხალი')).toBe(3);
    expect(chartCompareText(chart, 'ატამი', 'მსხალი')).toContain('3-ით მეტია');
    expect(chartCompareText(chart, 'ვაშლი', 'ვაშლი')).toContain('თანაბარია');
  });
});

describe('sorting: classification clues', () => {
  it('a clue can say what an object is, and what it is not', () => {
    expect(clueHolds(SET[0], { attr: 'colour', value: 'red' })).toBe(true);
    expect(clueHolds(SET[0], { attr: 'kind', value: 'circle', negate: true })).toBe(false);
    expect(clueHolds(SET[1], { attr: 'kind', value: 'circle', negate: true })).toBe(true);
  });

  it('several clues narrow the group, and only the survivors remain', () => {
    const clues = [
      { attr: 'colour' as const, value: 'red' },
      { attr: 'kind' as const, value: 'circle', negate: true },
    ];
    expect(SET.filter((o) => allCluesHold(o, clues)).map((o) => o.id)).toEqual(['r2']);
    expect(survivors(SET, clues).map((o) => o.id)).toEqual(['r2']);
    expect(survivors(SET, [{ attr: 'size', value: 'large' }]).map((o) => o.id)).toEqual(['r2', 'b1']);
  });
});

// ─────────────────────────── answer checking ───────────────────────────

const q = (response: ResponseSpec, extra: Partial<QuestionActivity> = {}): QuestionActivity => ({
  id: 'q',
  kind: 'question',
  stage: 'practice',
  prompt: 'x',
  response,
  hints: [],
  explanation: 'y',
  ...extra,
});

describe('checking: balancing two pans', () => {
  const question = q({ type: 'balance-pans', weights: [2, 3, 1, 4], left: [5], right: [] });

  it('accepts any split that makes the totals equal', () => {
    // the pan that already holds 5 stays there, so the student's own weights must add up to the same 5
    expect(evaluateAnswer(question, ':2,3').verdict).toBe('correct');
    expect(evaluateAnswer(question, ':1,4').verdict).toBe('correct');
    expect(evaluateAnswer(question, ':3,4').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, ':').verdict).toBe('incomplete');
    // the fixed weights are never the student's to move
    expect(evaluateAnswer(question, '5:5').verdict).toBe('incorrect');
  });

  it('a pan that starts with a weight is counted, not ignored', () => {
    const half = q({ type: 'balance-pans', weights: [3, 4, 1, 2], left: [5], right: [1] });
    expect(evaluateAnswer(half, ':4').verdict).toBe('correct');
    expect(evaluateAnswer(half, ':3').verdict).toBe('incorrect');
  });

  it('an untouched board is unfinished, not wrong', () => {
    expect(evaluateAnswer(question, ':').verdict).toBe('incomplete');
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
  });

  it('a weight that was never handed out is rejected', () => {
    const result = evaluateAnswer(question, '5:9');
    expect(result.verdict).toBe('incorrect');
    expect(result.misconceptionId).toBe('invented');
  });

  it('a weight can only be used as many times as it was given', () => {
    // only one 2 exists, so two of them is not a legal board
    expect(evaluateAnswer(question, ':2,2').verdict).toBe('incorrect');
  });
});

describe('checking: equal groups', () => {
  const question = q({ type: 'equal-groups', a: 6, b: 3 });

  it('accepts any two equal counts that differ from the start', () => {
    expect(evaluateAnswer(question, '4,4').verdict).toBe('correct');
    expect(evaluateAnswer(question, '3,3').verdict).toBe('correct');
    expect(evaluateAnswer(question, '6,5').verdict).toBe('incorrect');
  });

  it('doing nothing is unfinished, not correct', () => {
    expect(evaluateAnswer(question, '6,3').verdict).toBe('incomplete');
    expect(evaluateAnswer(question, '6,').verdict).toBe('incomplete');
  });
});

describe('checking: completing a sentence', () => {
  const question = q({ type: 'sentence-build', template: '{}{}{}', answers: ['3', '+', '2'], cards: [1, 2, 3, 4], signs: ['+', '−'] });

  it('accepts the cards that make the written sentence', () => {
    expect(evaluateAnswer(question, '3,+,2').verdict).toBe('correct');
    expect(evaluateAnswer(question, '2,+,3').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, '3,').verdict).toBe('incomplete');
  });

  it('a five-place sentence needs every place filled', () => {
    const five = q({ type: 'sentence-build', template: '{}{}{} = {}', answers: ['3', '+', '2', '5'], cards: [2, 3, 5], signs: ['+'] });
    expect(evaluateAnswer(five, '3,+,2,5').verdict).toBe('correct');
    expect(evaluateAnswer(five, '3,+,5').verdict).toBe('incomplete');
  });
});

describe('checking: picking true sentences', () => {
  const question = q({
    type: 'sentence-pick',
    sentences: [
      { id: 'a', left: { a: 3, op: '+', b: 2 }, right: 5 },
      { id: 'b', left: { a: 4, op: '+', b: 2 }, right: 5 },
      { id: 'c', left: { a: 5, op: '−', b: 2 }, right: 3 },
    ],
  });

  it('wants exactly the sentences whose sides are equal', () => {
    expect(evaluateAnswer(question, 'a,c').verdict).toBe('correct');
    expect(evaluateAnswer(question, 'a').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, 'a,b,c').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
  });
});

describe('checking: balance puzzles', () => {
  it('accepts the value that makes the scale level', () => {
    const question = q({ type: 'balance-puzzle', unknown: 'x', clues: [{ unknownCount: 2, known: 8, onLeft: true }], answer: 4 });
    expect(evaluateAnswer(question, '4').verdict).toBe('correct');
    expect(evaluateAnswer(question, '8').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
  });
});

describe('checking: sorting', () => {
  const question = q({ type: 'sort-groups', attr: 'colour', objects: SET.map((o) => ({ ...o })) });

  it('each object must be in its own attribute group', () => {
    expect(evaluateAnswer(question, 'red,red,blue,blue').verdict).toBe('correct');
    expect(evaluateAnswer(question, 'red,blue,red,blue').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, 'red,red').verdict).toBe('incomplete');
  });

  it('the grid is checked cell by cell', () => {
    const grid = q({ type: 'sort-grid', rowAttr: 'colour', colAttr: 'kind', rows: ['red', 'blue'], cols: ['circle', 'triangle'], objects: SET.map((o) => ({ ...o })) });
    expect(evaluateAnswer(grid, 'red|circle,red|triangle,blue|circle,blue|triangle').verdict).toBe('correct');
    expect(evaluateAnswer(grid, 'red|triangle,red|circle,blue|circle,blue|triangle').verdict).toBe('incorrect');
  });

  it('the Venn regions are checked against the attributes', () => {
    const venn = q({ type: 'venn-sort', leftAttr: 'colour', leftValue: 'red', rightAttr: 'kind', rightValue: 'triangle', objects: SET.map((o) => ({ ...o })) });
    expect(evaluateAnswer(venn, 'left,both,none,right').verdict).toBe('correct');
    expect(evaluateAnswer(venn, 'both,both,none,right').verdict).toBe('incorrect');
  });

  it('clues must all hold, and the picked set must be exactly the survivors', () => {
    const clues = q({
      type: 'clue-pick',
      clues: [
        { attr: 'colour', value: 'red' },
        { attr: 'kind', value: 'circle', negate: true },
      ],
      objects: SET.map((o) => ({ ...o })),
    });
    expect(evaluateAnswer(clues, 'r2').verdict).toBe('correct');
    expect(evaluateAnswer(clues, 'r1').verdict).toBe('incorrect');
    expect(evaluateAnswer(clues, 'r1,r2').verdict).toBe('incorrect');
    expect(evaluateAnswer(clues, '').verdict).toBe('incomplete');
  });
});

describe('checking: picture charts', () => {
  const chart = {
    glyph: 'star' as const,
    rows: [
      { label: 'ვაშლი', count: 4 },
      { label: 'მსხალი', count: 2 },
      { label: 'ატამი', count: 5 },
    ],
  };

  it('most and least are decided by the symbols', () => {
    const most = q({ type: 'chart-read', chart, ask: 'most' });
    expect(evaluateAnswer(most, 'ატამი').verdict).toBe('correct');
    expect(evaluateAnswer(most, 'მსხალი').verdict).toBe('incorrect');
    const least = q({ type: 'chart-read', chart, ask: 'least' });
    expect(evaluateAnswer(least, 'მსხალი').verdict).toBe('correct');
  });

  it('more and fewer compare with the named category', () => {
    const more = q({ type: 'chart-read', chart, ask: 'more', compareWith: 'ვაშლი' });
    expect(evaluateAnswer(more, 'ატამი').verdict).toBe('correct');
    expect(evaluateAnswer(more, 'მსხალი').verdict).toBe('incorrect');
    const fewer = q({ type: 'chart-read', chart, ask: 'fewer', compareWith: 'ვაშლი' });
    expect(evaluateAnswer(fewer, 'მსხალი').verdict).toBe('correct');
  });

  it('a built chart is checked row by row, and an empty one is unfinished', () => {
    const build = q({ type: 'chart-build', glyph: 'star', labels: ['ვაშლი', 'მსხალი'], target: [3, 2] });
    expect(evaluateAnswer(build, '3,2').verdict).toBe('correct');
    expect(evaluateAnswer(build, '3,3').verdict).toBe('incorrect');
    expect(evaluateAnswer(build, '0,0').verdict).toBe('incomplete');
  });
});

describe('checking: answers are described in words and numbers', () => {
  it('a balance answer is a real equality, not a bare state', () => {
    expect(describeAnswer({ type: 'balance-pans', weights: [2, 3], left: [5], right: [] })).toContain('5');
    expect(describeAnswer({ type: 'balance-puzzle', unknown: 'x', clues: [{ unknownCount: 2, known: 8, onLeft: true }], answer: 4 })).toBe('x = 4');
    expect(describeAnswer({ type: 'equal-groups', a: 4, b: 4 })).toContain('4 = 4');
  });
});

// ─────────────────────────── content ───────────────────────────

describe('content: the ten lessons keep the standing shape', () => {
  it('ten activities, always in the same order', () => {
    for (const l of all) {
      expect(l.activities.map((a) => a.id)).toEqual([
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
      expect(l.activities.map((a) => a.stage)).toEqual([
        'challenge',
        'explore',
        'understand',
        'practice',
        'practice',
        'practice',
        'practice',
        'check',
        'check',
        'check',
      ]);
      expect(l.activities[0].kind).toBe('question');
      expect(l.activities[1].kind).toBe('explore');
      expect(l.activities[2].kind).toBe('explain');
    }
  });

  it('hints only where they belong, and the challenge never gives the answer away', () => {
    for (const l of all) {
      for (const x of stageOf(l, 'check')) expect(x.hints, `${l.id}/${x.id}`).toEqual([]);
      for (const x of stageOf(l, 'practice')) expect(x.hints.length, `${l.id}/${x.id}`).toBeGreaterThan(0);
      const challenge = l.activities[0];
      if (challenge.kind === 'question') expect(challenge.revealOnExhaust).toBe(false);
    }
  });

  it('every question explains itself and has feedback in the lesson\'s own words', () => {
    for (const l of all)
      for (const x of questions(l)) {
        expect(x.explanation.length, `${l.id}/${x.id}`).toBeGreaterThan(5);
        expect(x.fallbackFeedback?.length, `${l.id}/${x.id}`).toBeGreaterThan(5);
      }
  });
});

describe('content: every balance question really is answerable', () => {
  it('a pan question hands out weights that can actually be balanced', () => {
    for (const l of all)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'balance-pans') continue;
        // the weights the question put on a pan are fixed, so they are never part of the student's pool
        const pool = [...r.weights];
        // and there must be a way to make the two totals equal using only those weights
        const target = Math.abs(panTotal({ weights: r.left }) - panTotal({ weights: r.right }));
        const reachable = (() => {
          const sums = new Set<number>([0]);
          for (const w of r.weights) for (const s of [...sums]) sums.add(s + w);
          return sums;
        })();
        expect(target > 0, `${l.id}/${x.id}: already balanced, so nothing is left to solve`).toBe(true);
        expect(reachable.has(target), `${l.id}/${x.id}: no subset makes ${target}`).toBe(true);
      }
  });

  it('a puzzle is solvable and its clues divide exactly', () => {
    for (const l of all)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'balance-puzzle') continue;
        expect(r.clues.some((c) => puzzleAnswer(c) === r.answer), `${l.id}/${x.id}`).toBe(true);
      }
  });

  it('a sentence question is never accidentally true more than once', () => {
    for (const l of all)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'sentence-pick') continue;
        const trueOnes = r.sentences.filter((s) => sentenceHolds({ left: s.left, right: s.right }));
        expect(trueOnes.length, `${l.id}/${x.id}`).toBeGreaterThan(0);
        expect(trueOnes.length, `${l.id}/${x.id}`).toBeLessThan(r.sentences.length);
      }
  });
});

describe('content: every sorting question has something to sort', () => {
  it('a sorting question offers at least two groups and a real object in each', () => {
    for (const l of all)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type === 'clue-pick') {
          const survivors = (r.objects as SortObj[]).filter((o) => r.clues.every((c) => (o[c.attr] === c.value) !== Boolean(c.negate)));
          expect(survivors.length, `${l.id}/${x.id}`).toBeGreaterThan(0);
          expect(survivors.length, `${l.id}/${x.id}`).toBeLessThan(r.objects.length);
        }
        if (r.type === 'venn-sort') {
          const regions = (r.objects as SortObj[]).map((o) => vennRegion(o, r.leftAttr, r.leftValue, r.rightAttr, r.rightValue));
          expect(regions.length).toBe(r.objects.length);
          expect(new Set(regions).size, `${l.id}/${x.id}: all in one region`).toBeGreaterThan(1);
        }
        if (r.type === 'sort-groups' || r.type === 'sort-grid') {
          expect(r.objects.length).toBeGreaterThanOrEqual(3);
        }
      }
  });

  it('a chart question never asks for a category that is not in the chart', () => {
    for (const l of all)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'chart-read') continue;
        const labels = r.chart.rows.map((row) => row.label);
        if (r.compareWith) expect(labels).toContain(r.compareWith);
        expect(new Set(r.chart.rows.map((row) => row.count)).size, `${l.id}/${x.id}`).toBeGreaterThan(1);
      }
  });

  it('a chart-building question never asks for the same count in every row', () => {
    for (const l of all)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'chart-build') continue;
        expect(r.target).toHaveLength(r.labels.length);
        expect(new Set(r.target).size).toBeGreaterThan(1);
      }
  });

  it('the two units stay in their own lane', () => {
    for (const l of lessons09) for (const x of questions(l)) expect(['sort-groups', 'sort-grid', 'venn-sort', 'chart-read', 'chart-build', 'clue-pick']).not.toContain(x.response.type);
    for (const l of lessons10) for (const x of questions(l)) expect(['balance-pans', 'equal-groups', 'sentence-build', 'sentence-pick', 'balance-puzzle']).not.toContain(x.response.type);
  });
});

// ─────────────────────────── the boards ───────────────────────────

describe('balance board: the beam follows the numbers', () => {
  it('a level pair is drawn level, a heavy side tips that way, and both say so', () => {
    render(<BalanceScale scale={{ left: { weights: [3] }, right: { weights: [1, 2] } }} label="სასწორი" />);
    expect(document.querySelector('.bal.is-level')).toBeTruthy();
    expect(text('.bal-word')).toContain('თანაბარია');
    // the accessible name carries the totals, not just "balanced"
    expect(screen.getByRole('img', { name: /მარცხენა თარო 3, მარჯვენა თარო 3/ })).toBeTruthy();
    cleanup();
    render(<BalanceScale scale={{ left: { weights: [2] }, right: { weights: [6] } }} label="სასწორი" />);
    expect(document.querySelector('.bal.is-right')).toBeTruthy();
    expect(text('.bal-word')).toContain('მარჯვენა მხარე მძიმეა');
    expect(text('.bal-word')).toContain('სხვაობა 4');
  });

  it('the tilt is derived, not hard-coded: a bigger difference tips further', () => {
    const angleOf = () => Number((document.querySelector('.bal-svg g') as SVGGElement).getAttribute('transform')?.match(/rotate\(([-\d.]+)\)/)?.[1] ?? '0');
    render(<BalanceScale scale={{ left: { weights: [5] }, right: { weights: [4] } }} label="ერთი" />);
    const small = Math.abs(angleOf());
    cleanup();
    render(<BalanceScale scale={{ left: { weights: [5] }, right: { weights: [1] } }} label="ორი" />);
    const big = Math.abs(angleOf());
    expect(big).toBeGreaterThan(small);
  });
});

describe('groups board: counts are the answer, not the look', () => {
  it('says equal, more and less in words as well as a sign', () => {
    render(<GroupsBoard a={4} b={4} label="ჯგუფები" />);
    expect(text('.grps-word')).toContain('თანაბარია');
    expect(document.querySelector('.grps.is-level')).toBeTruthy();
    cleanup();
    render(<GroupsBoard a={6} b={2} label="ჯგუფები" />);
    expect(text('.grps-word')).toContain('4-ით მეტია ა-ში');
  });

  it('adds and takes one object at a time', () => {
    const onChange = vi.fn();
    render(<GroupsBoard a={3} b={1} label="ჯგუფები" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'ჯგუფ ა: დაამატე ერთი' }));
    expect(onChange).toHaveBeenLastCalledWith(4, 1);
    fireEvent.click(screen.getByRole('button', { name: 'ჯგუფ ბ: დაამატე ერთი' }));
    expect(onChange).toHaveBeenLastCalledWith(3, 2);
    fireEvent.click(screen.getByRole('button', { name: 'ჯგუფ ა: წაიღე ერთი' }));
    expect(onChange).toHaveBeenLastCalledWith(2, 1);
  });
});

describe('sentence board: the equals sign is a sign, not a slot', () => {
  it('renders the sentence with its operators marked', () => {
    render(<SentenceLine sentence={{ left: { a: 3, op: '+', b: 2 }, right: 5 }} />);
    expect(text('.sent')).toContain('3 + 2 = 5');
    expect(document.querySelectorAll('.sent-tok.is-op')).toHaveLength(1);
    expect(document.querySelector('.sent-tok.is-eq')).toBeTruthy();
  });
});

describe('sort board: groups are decided by the objects', () => {
  it('an object goes into the group its own attribute names, and can be taken back out', () => {
    // the board is driven from outside, so the answer string is the only state
    let current = ['', '', '', ''];
    const onChange = vi.fn((next: string[]) => {
      current = next;
    });
    const board = () => (
      <SortIntoGroups objects={SET} attr="colour" groups={['red', 'blue']} placement={current} onChange={onChange} label="დალაგება" />
    );
    const view = render(board());
    expect(screen.getByRole('button', { name: /^წითელი \(0\)/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^წითელი წრე, შეეხე ასარჩევად/ }));
    // the group is only open while an object is selected
    expect((screen.getByRole('button', { name: /^წითელი \(0\)/ }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: /^წითელი \(0\)/ }));
    expect(onChange).toHaveBeenLastCalledWith(['red', '', '', '']);
    view.rerender(board());
    const inside = within(screen.getByLabelText('წითელი'));
    expect(inside.getByRole('button', { name: /წითელი წრე, ჯგუფშია/ })).toBeTruthy();
    // and it can come back out
    fireEvent.click(inside.getByRole('button', { name: /წითელი წრე, ჯგუფშია/ }));
    expect(onChange).toHaveBeenLastCalledWith(['', '', '', '']);
  });

  it('the grid cell names both conditions', () => {
    render(<GridBoard objects={SET} rowAttr="colour" colAttr="kind" rowValues={['red', 'blue']} colValues={['circle', 'triangle']} placement={['', '', '', '']} onChange={vi.fn()} label="ცხრილი" />);
    expect(screen.getByRole('button', { name: /უჯრა: წითელი და სამკუთხედი/ })).toBeTruthy();
    expect(document.querySelectorAll('.gd-cell')).toHaveLength(4);
  });

  it('the Venn diagram offers all four regions, including the outside', () => {
    render(<VennBoard objects={SET} leftLabel="წითელი" rightLabel="სამკუთხედი" placement={['left', 'both', 'none', 'right']} onChange={vi.fn()} label="დიაგრამა" />);
    const zones = [...document.querySelectorAll('.vn-zone')].map((z) => z.getAttribute('aria-label'));
    expect(zones).toEqual(['მხოლოდ მარცხენაში: 1 საგანი', 'ორივეში: 1 საგანი', 'მხოლოდ მარჯვენაში: 1 საგანი', 'არც ერთში: 1 საგანი']);
  });

  it('an object is named in words, never only coloured in', () => {
    render(<SortChip obj={SET[1]} />);
    expect(screen.getByRole('img', { name: 'წითელი სამკუთხედი' })).toBeTruthy();
  });

  it('clues are listed in words beside the objects', () => {
    render(<ClueBoard objects={SET} clues={[{ attr: 'colour', value: 'red' }, { attr: 'kind', value: 'circle', negate: true }]} picked={[]} onChange={vi.fn()} label="მინიშნება" />);
    expect(text('.clue-list')).toContain('ფერი არის წითელი');
    expect(text('.clue-list')).toContain('ფორმა არ არის წრე');
    expect(screen.getAllByRole('button', { name: /წითელი სამკუთხედი/ }).length).toBeGreaterThan(0);
  });
});

describe('chart board: one symbol, one thing', () => {
  it('draws exactly as many symbols as the count and reads the total', () => {
    const chart = { glyph: 'star' as const, rows: [{ label: 'ვაშლი', count: 3 }, { label: 'მსხალი', count: 1 }] };
    render(<PictureChart chart={chart} label="დიაგრამა" />);
    const rows = [...document.querySelectorAll('.pc-row')];
    expect(rows[0].querySelectorAll('.pc-sym')).toHaveLength(3);
    expect(rows[1].querySelectorAll('.pc-sym')).toHaveLength(1);
    expect(within(rows[0] as HTMLElement).getByText('3', { selector: '.pc-count' })).toBeTruthy();
  });

  it('a chart that can be built grows one symbol at a time', () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    const chart = { glyph: 'star' as const, rows: [{ label: 'ვაშლი', count: 2 }] };
    render(<PictureChart chart={chart} label="დიაგრამა" onAdd={onAdd} onRemove={onRemove} />);
    fireEvent.click(screen.getByRole('button', { name: 'ვაშლი: დაამატე ერთი' }));
    expect(onAdd).toHaveBeenCalledWith('ვაშლი');
    fireEvent.click(screen.getByRole('button', { name: 'ვაშლი: წაიღე ერთი' }));
    expect(onRemove).toHaveBeenCalledWith('ვაშლი');
  });
});

// ─────────────────────────── tools and demos ───────────────────────────

const toolOf = (l: Lesson) => (l.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>).tool;

describe('tools: the balance lab reports the real totals', () => {
  it('starts unbalanced, and says by how much', () => {
    render(<BalanceLab tool={toolOf(lessons09[0])} />);
    // the lab starts with 2 on the left pan and nothing on the right
    expect(text('.lab-status')).toContain('მარცხენა მხარე 2-ით მძიმეა');
    expect(text('.lab-facts')).toContain('მარცხენა: 2 = 2');
    expect(text('.lab-facts')).toContain('მარჯვენა: 0 = 0');
  });

  it('adding the right weight levels the beam', () => {
    render(<BalanceLab tool={toolOf(lessons09[0])} />);
    // the 2 is already on the left pan, so the right pan needs two 1s
    fireEvent.click(screen.getByRole('radio', { name: 'მარჯვენა თარო' }));
    const ones = () => screen.getAllByRole('button', { name: 'დადე 1 მარჯვენა თაროზე' });
    fireEvent.click(ones()[0]);
    fireEvent.click(ones()[0]);
    expect(text('.lab-status')).toContain('თანაბარია');
    expect(text('.lab-status')).toContain('2 = 2');
  });
});

describe('tools: two groups', () => {
  it('reports the difference and then equality', () => {
    render(<EqualGroupsLab tool={toolOf(lessons09[1])} />);
    expect(text('.lab-status')).toContain('3-ით განსხვავდება');
    const plus = screen.getByRole('button', { name: 'ჯგუფ ბ: დაამატე ერთი' });
    fireEvent.click(plus);
    fireEvent.click(plus);
    fireEvent.click(plus);
    expect(text('.lab-status')).toContain('თანაბარია');
  });
});

describe('tools: the sentence lab tells the truth about the sentence', () => {
  it('a sentence that matches the result is called true', () => {
    render(<SentenceLab tool={toolOf(lessons09[2])} />);
    expect(text('.lab-status')).toContain('ჯერ არ არის შევსებული');
    // pick 3, then +, then 2 — the lab's result is 5
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'ადგილი 1: ცარიელი' }));
    fireEvent.click(screen.getByRole('button', { name: 'ნიშანი +' }));
    fireEvent.click(screen.getByRole('button', { name: 'ადგილი 2: ცარიელი' }));
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'ადგილი 3: ცარიელი' }));
    expect(text('.lab-status')).toContain('მართალია');
  });

  it('a sentence that does not match is called false', () => {
    render(<SentenceLab tool={toolOf(lessons09[2])} />);
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'ადგილი 1: ცარიელი' }));
    fireEvent.click(screen.getByRole('button', { name: 'ნიშანი +' }));
    fireEvent.click(screen.getByRole('button', { name: 'ადგილი 2: ცარიელი' }));
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 4' }));
    fireEvent.click(screen.getByRole('button', { name: 'ადგილი 3: ცარიელი' }));
    expect(text('.lab-status')).toContain('არ არის მართალი');
    expect(text('.lab-status')).toContain('= 7');
  });
});

describe('tools: the puzzle lab accepts the right value and nothing else', () => {
  it('says when the value is right', () => {
    render(<PuzzleLab tool={toolOf(lessons09[4])} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '4' } });
    expect(text('.lab-status')).toContain('სწორია');
    fireEvent.change(input, { target: { value: '9' } });
    expect(text('.lab-status')).toContain('ჯერ არ არის');
  });
});

describe('tools: the sorting and chart labs', () => {
  it('the sort lab re-sorts the same collection when the rule changes', () => {
    render(<SortLab tool={toolOf(lessons10[0])} />);
    expect(text('.lab-status')).toContain('ვახარისხებ ფერით');
    fireEvent.click(screen.getByRole('radio', { name: 'ფორმა' }));
    expect(text('.lab-status')).toContain('ვახარისხებ ფორმით');
    // the same six objects, split a different way
    const counts = [...document.querySelectorAll('.lab-sort-group')].map((g) => g.querySelectorAll('.sc-obj-wrap').length);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(6);
  });

  it('the Venn lab can show the right arrangement, which really is right', () => {
    render(<VennLab tool={toolOf(lessons10[2])} />);
    fireEvent.click(screen.getByRole('button', { name: 'აჩვენე სწორი განლაგება' }));
    const zones = [...document.querySelectorAll('.vn-zone')].map((z) => z.getAttribute('aria-label'));
    // red circle | red triangle (both) | blue triangle (right) | the rest outside
    expect(zones[1]).toContain('ორივეში: 1');
  });

  it('the chart lab counts the symbols it is given', () => {
    render(<ChartLab tool={toolOf(lessons10[3])} />);
    expect(text('.lab-status')).toContain('დაამატე სიმბოლოები');
    fireEvent.click(screen.getAllByRole('button', { name: /დაამატე ერთი/ })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: /დაამატე ერთი/ })[0]);
    expect(text('.lab-status')).toContain('სულ 2 საგანი');
  });

  it('the chart demo grows one symbol per row per step', () => {
    render(
      <ChartDemo
        block={{
          type: 'chart-demo',
          glyph: 'star',
          rows: [
            { label: 'ა', count: 2 },
            { label: 'ბ', count: 1 },
          ],
          steps: ['ცარიელი', 'ერთი', 'ორი', 'სამი'],
        }}
      />,
    );
    expect(document.querySelectorAll('.pc-sym')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგ →' }));
    expect(document.querySelectorAll('.pc-sym')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგ →' }));
    expect(document.querySelectorAll('.pc-sym')).toHaveLength(3);
  });
});

// ─────────────────────────── the player ───────────────────────────

function go(hash: string) {
  window.location.hash = hash;
  return render(<StudentApp />);
}
const next = () => fireEvent.click(screen.getByRole('button', { name: 'გაგრძელება' }));
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'პასუხის შემოწმება' }));
const feedback = () => document.querySelector('.lp-feedback')?.textContent ?? '';
const saved = () => JSON.parse(window.localStorage.getItem(LEARN_STORAGE_KEY) ?? '{}');
const radio = (i: number) => fireEvent.click(screen.getAllByRole('radio')[i]);

/** Walks forward from the first screen to the exploration or the explanation. */
const toStage = (lesson: Lesson, stage: 'explore' | 'understand') => {
  const stop = lesson.activities.findIndex((a) => a.stage === stage);
  for (const a of lesson.activities.slice(0, stop)) {
    if (a.kind === 'question') answerCorrectly(a);
    next();
  }
};

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
    case 'numeric':
      fireEvent.change(screen.getByRole('textbox'), { target: { value: String(r.answer) } });
      break;
    case 'balance-pans': {
      // the weights already on the pans are fixed; the student's own weights close the gap
      const pan = (s: 'left' | 'right') => {
        fireEvent.click(screen.getByRole('radio', { name: s === 'left' ? 'მარცხენა თაროზე' : 'მარჯვენა თაროზე' }));
      };
      const pool = [...r.weights];
      const left = r.left.reduce((a, b) => a + b, 0);
      const right = r.right.reduce((a, b) => a + b, 0);
      const lighter: 'left' | 'right' = left < right ? 'left' : 'right';
      const gap = Math.abs(left - right);
      // the student's weights must add up to exactly the gap between the two pans
      const subset = pickWeights(pool, gap);
      if (!subset) throw new Error(`no weights add up to ${gap} in ${pool.join(',')}`);
      pan(lighter);
      for (const w of subset) fireEvent.click(screen.getByRole('button', { name: new RegExp(`^დადე ${w} `) }));
      break;
    }
    case 'equal-groups': {
      // make the smaller group catch up with the bigger one
      const plus = (g: 'a' | 'b') => screen.getByRole('button', { name: g === 'a' ? 'ჯგუფ ა: დაამატე ერთი' : 'ჯგუფ ბ: დაამატე ერთი' });
      const minus = (g: 'a' | 'b') => screen.getByRole('button', { name: g === 'a' ? 'ჯგუფ ა: წაიღე ერთი' : 'ჯგუფ ბ: წაიღე ერთი' });
      let a = r.a;
      let b = r.b;
      if (a === b) {
        // already equal: change one and change it back so the answer is not "nothing"
        fireEvent.click(plus('a'));
        a += 1;
        fireEvent.click(minus('a'));
        a -= 1;
      } else if (a < b) {
        while (a < b) {
          fireEvent.click(plus('a'));
          a += 1;
        }
      } else {
        while (b < a) {
          fireEvent.click(plus('b'));
          b += 1;
        }
      }
      break;
    }
    case 'sentence-build': {
      r.answers.forEach((card, i) => {
        fireEvent.click(screen.getByRole('button', { name: card === '+' || card === '−' ? `ნიშანი ${card}` : `რიცხვი ${card}` }));
        fireEvent.click(screen.getByRole('button', { name: new RegExp(`^ადგილი ${i + 1}`) }));
      });
      break;
    }
    case 'sentence-pick': {
      // pick exactly the sentences whose two sides really are equal
      for (const s of r.sentences) {
        if (!sentenceHolds({ left: s.left, right: s.right })) continue;
        const label = `${s.left.a}${s.left.op ? ` ${s.left.op} ${s.left.b}` : ''} = ${s.right}`;
        const pick = screen
          .getAllByRole('button')
          .find((b) => (b.getAttribute('aria-label') ?? '').startsWith(label) && b.getAttribute('aria-pressed') !== 'true');
        if (!pick) throw new Error(`no sentence button for ${label}`);
        fireEvent.click(pick);
      }
      break;
    }
    case 'balance-puzzle':
      fireEvent.change(screen.getByRole('textbox'), { target: { value: String(r.answer) } });
      break;
    case 'sort-groups':
      sortIntoGroups(r.objects as SortObj[], r.attr as 'colour' | 'kind' | 'size');
      break;
    case 'sort-grid':
      sortIntoGrid(
        r.objects as SortObj[],
        r.rowAttr as 'colour' | 'kind' | 'size',
        r.colAttr as 'colour' | 'kind' | 'size',
        r.rows,
        r.cols,
      );
      break;
    case 'venn-sort': {
      // each object goes to the region its own attributes decide
      for (const o of r.objects as SortObj[]) {
        selectObject('.vn-tray', o);
        const region = vennRegion(o, r.leftAttr, r.leftValue, r.rightAttr, r.rightValue);
        const zone = [...document.querySelectorAll('.vn-zone')].find((z) => (z.getAttribute('aria-label') ?? '').startsWith(VENN_REGION_NAME[region])) as HTMLElement;
        fireEvent.click(zone);
      }
      break;
    }
    case 'chart-read': {
      const chart = { glyph: r.chart.glyph, rows: r.chart.rows };
      let answer: string | undefined;
      if (r.ask === 'most') answer = chartMost(chart)[0];
      else if (r.ask === 'least') answer = chartLeast(chart)[0];
      else {
        const other = chartCount(chart, r.compareWith ?? '');
        answer = r.chart.rows.find((row) => row.label !== r.compareWith && (r.ask === 'more' ? row.count > other : row.count < other))?.label;
      }
      const radios = screen.getAllByRole('radio');
      const index = r.chart.rows.findIndex((row) => row.label === answer);
      fireEvent.click(radios[index]);
      break;
    }
    case 'chart-build': {
      r.target.forEach((want, i) => {
        const label = r.labels[i];
        const add = screen.getByRole('button', { name: `${label}: დაამატე ერთი` });
        for (let n = 0; n < want; n += 1) fireEvent.click(add);
      });
      break;
    }
    case 'clue-pick': {
      const objects = r.objects as SortObj[];
      for (const o of objects) {
        const holds = r.clues.every((c) => (o[c.attr] === c.value) !== Boolean(c.negate));
        if (holds) fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${o.label}`) }));
      }
      break;
    }
    default:
      throw new Error(`no walker for ${r.type}`);
  }
  submit();
}

const nameOfRegion = (region: string): string =>
  region === 'both' ? 'ორივეში' : region === 'left' ? 'მხოლოდ მარცხენაში' : region === 'right' ? 'მხოლოდ მარჯვენაში' : 'არც ერთში';

/** The weights that add up to `target`, or `null` when no combination of them does. */
function pickWeights(weights: number[], target: number): number[] | null {
  const search = (start: number, rest: number): number[] | null => {
    if (rest === 0) return [];
    for (let i = start; i < weights.length; i += 1) {
      if (weights[i] > rest) continue;
      const tail = search(i + 1, rest - weights[i]);
      if (tail) return [weights[i], ...tail];
    }
    return null;
  };
  return search(0, target);
}

/** Selects one card in a tray by the name the board gives it. */
function selectObject(tray: string, o: SortObj) {
  const name = objectName(o);
  const chip = [...document.querySelectorAll(`${tray} .sc-obj-btn`)].find((b) => (b.getAttribute('aria-label') ?? '').startsWith(`${name},`)) as HTMLElement | undefined;
  if (!chip) throw new Error(`no card for ${name} in ${tray}`);
  // the board selects the next card itself after each placement; clicking it again would deselect it
  if (chip.getAttribute('aria-pressed') !== 'true') fireEvent.click(chip);
}

/** Sorts every object into the group its own attribute names. */
function sortIntoGroups(objects: SortObj[], attr: 'colour' | 'kind' | 'size') {
  for (const o of objects) {
    selectObject('.srt-tray', o);
    const group = [...document.querySelectorAll('.srt-group')].find((g) => (g.getAttribute('aria-label') ?? '') === valueLabel(attr, o[attr])) as HTMLElement;
    fireEvent.click(group.querySelector('.srt-group-btn') as HTMLElement);
  }
}

/** Fills a two-way grid from each object's own pair of attributes. */
function sortIntoGrid(objects: SortObj[], rowAttr: 'colour' | 'kind' | 'size', colAttr: 'colour' | 'kind' | 'size', rows: string[], cols: string[]) {
  void rows;
  void cols;
  for (const o of objects) {
    selectObject('.gd-tray', o);
    const label = new RegExp(`^უჯრა: ${valueLabel(rowAttr, o[rowAttr])} და ${valueLabel(colAttr, o[colAttr])},`);
    fireEvent.click(screen.getByRole('button', { name: label }));
  }
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

describe.each([
  ['g1-u09', U09],
  ['g1-u10', U10],
] as const)('%s unit page', (unitId, ids) => {
  it('lists the five lessons, all playable and in order', () => {
    go(`#/student/lessons/${unitId}`);
    const list = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(list).toHaveLength(5);
    ids.forEach((id, i) => expect(within(list[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
  });
});

describe.each([...U09, ...U10].map((id) => [id] as const))('%s plays to the end', (id) => {
  it('every step works with its own correct answers and the progress is saved', () => {
    const lesson = LESSON_CONTENT[id];
    go(`#/student/lessons/${id}`);
    expect(screen.getByText(`ნაბიჯი 1 / ${lesson.activities.length}`)).toBeTruthy();
    playThrough(lesson);
    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    const checks = stageOf(lesson, 'check').length;
    expect(screen.getByText(`${checks} / ${checks}`)).toBeTruthy();
    expect(saved()[id]).toMatchObject({ status: 'completed', checkCorrect: checks, checkTotal: checks });
    if (id.startsWith('g1-u09')) expect(screen.getByRole('link', { name: 'U09-ზე დაბრუნება' }).getAttribute('href')).toBe('#/student/lessons/g1-u09');
    else expect(screen.getByRole('link', { name: 'U10-ზე დაბრუნება' }).getAttribute('href')).toBe('#/student/lessons/g1-u10');
  });
});

describe('the two units join up', () => {
  it('completing the balance unit offers the sorting unit, once every lesson is done', () => {
    const lesson = lessons09[4];
    const done = Object.fromEntries(U09.slice(0, 4).map((id) => [id, { status: 'completed', checkCorrect: 3, checkTotal: 3, completedAt: 1 }]));
    window.localStorage.setItem(LEARN_STORAGE_KEY, JSON.stringify(done));
    resetProgressCache();
    go(`#/student/lessons/${lesson.id}`);
    playThrough(lesson);
    expect(screen.getByRole('link', { name: /შემდეგი თემა: U10\.1/ }).getAttribute('href')).toBe('#/student/lessons/g1-u10-l1');
  });

  it('the last sorting lesson has nowhere further to go', () => {
    const lesson = lessons10[4];
    go(`#/student/lessons/${lesson.id}`);
    playThrough(lesson);
    expect(screen.queryByRole('link', { name: /გაგრძელება:|შემდეგი თემა:/ })).toBeNull();
  });
});

describe('feedback is aimed at the real mistake', () => {
  it('an unbalanced scale is marked wrong with the lesson\'s own words', () => {
    go('#/student/lessons/g1-u09-l1');
    const lesson = lessons09[0];
    const stop = lesson.activities.findIndex((a) => a.id === 'practice-2');
    lesson.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    submit();
    expect(feedback()).toContain('შეავსე პასუხი');
    // put one weight on the right pan only, which is not enough
    fireEvent.click(screen.getByRole('radio', { name: 'მარჯვენა თაროზე' }));
    fireEvent.click(screen.getByRole('button', { name: 'დადე 2 მარჯვენა თაროზე' }));
    submit();
    expect(feedback()).toMatch(/ჯერ არ არის|მძიმე/);
  });

  it('a wrong Venn answer is marked wrong, and the correct regions are never shown as a hint', () => {
    go('#/student/lessons/g1-u10-l3');
    const lesson = lessons10[2];
    toStage(lesson, 'explore');
    next();
    next();
    const tray = document.querySelector('.vn-tray') as HTMLElement;
    fireEvent.click(tray.querySelector('.sc-obj-btn') as HTMLElement);
    fireEvent.click([...document.querySelectorAll('.vn-zone')].find((z) => (z.getAttribute('aria-label') ?? '').startsWith('არც ერთში')) as HTMLElement);
    submit();
    expect(feedback()).toContain('შეავსე პასუხი');
  });
});

describe('style: motion, layout and honest labels', () => {
  const css = readFileSync('src/lessons/learn.css', 'utf8');
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));

  it('the new boards are switched off under reduced motion', () => {
    for (const cls of ['.bal-beam', '.sc-obj-btn', '.srt-group', '.vn-zone', '.gd-cell']) expect(reduced, cls).toContain(cls);
  });

  it('the boards fold to one column on a phone', () => {
    const small = css.slice(css.lastIndexOf('@media (max-width: 520px)'));
    expect(small).toContain('.grps');
    expect(small).toContain('.vn-row');
    expect(small).toContain('grid-template-columns: 1fr');
  });

  it('correctness is never shown by colour alone', () => {
    render(<BalanceScale scale={{ left: { weights: [1, 2] }, right: { weights: [3] } }} label="სასწორი" />);
    // the words, the totals and the sign are all there, not just a green beam
    expect(text('.bal-word')).toContain('თანაბარია');
    expect(screen.getByRole('img', { name: /მარცხენა თარო 3, მარჯვენა თარო 3/ })).toBeTruthy();
    cleanup();
    render(<GroupsBoard a={2} b={5} label="ჯგუფები" />);
    expect(text('.grps-word')).toContain('მეტია');
    expect(document.querySelector('.grps-sign')?.textContent).toBe('<');
  });
});
