// @vitest-environment jsdom
import './helpers/signed-in-student';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';
import { LESSON_CONTENT } from '../src/lessons/content';
import { describeAnswer, evaluateAnswer } from '../src/lessons/check';
import { getUnit } from '../src/lessons/catalog';
import {
  allEqual,
  arrayByCols,
  arrayByRows,
  arrayTotal,
  arraysFor,
  commutative,
  fourWays,
  groupsText,
  multiplyText,
  productOf,
  repeatedHolds,
  repeatedText,
  rowCells,
  runningTotals,
  storyMakesSense,
  storySentence,
  storyTotal,
  sumOfGroupSizes,
  termCount,
  termsOf,
  totalOf,
  turnArray,
  turnKeepsTotal,
  unevenGroups,
} from '../src/lessons/exercises/GroupsGeometry';
import { ArrayBoard, ArrayBuildAnswer, ArrayReadAnswer, ArrayTurn, EqualGroups, GroupStoryAnswer, MakeEqualAnswer, RepeatedLine, UnevenGroups } from '../src/lessons/exercises/GroupsBoard';
import { ArrayDemo, ArrayLab, EqualGroupsLab, FourWaysDemo, GroupsDemo, GroupStoryLab, MultiplyLab, RepeatLab } from '../src/lessons/exercises/GroupsTools';
import type { Activity, Lesson, QuestionActivity, ResponseSpec } from '../src/lessons/types';

/**
 * Grade 2 · Unit 4: "Equal Groups, Repeated Addition, & Arrays".
 *
 * Everything in this unit is one number written four ways — a picture, a repeated addition, a multiplication and a total —
 * all computed from `groups` and `each`. Turning an array swaps those two counts and leaves the product alone. No test
 * below judges anything by how a group or a rectangle looks.
 */

const U04 = ['g2-u04-l1', 'g2-u04-l2', 'g2-u04-l3', 'g2-u04-l4', 'g2-u04-l5'];
const lessons = U04.map((id) => LESSON_CONTENT[id]);
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);
const text = (sel: string) => document.querySelector(sel)?.textContent ?? '';
const toolOf = (l: Lesson) => (l.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>).tool;

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 2 U04 is the equal-groups unit', () => {
  it('has the approved titles, ids and codes', () => {
    const unit = getUnit('g2-u04');
    expect(unit?.title).toBe('Equal Groups, Repeated Addition, & Arrays');
    expect(unit?.grade).toBe(2);
    expect(unit?.lessons.map((l) => l.id)).toEqual(U04);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U04.1', 'U04.2', 'U04.3', 'U04.4', 'U04.5']);
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Understanding Equal Groups',
      'Representing Equal Groups with Repeated Addition',
      'Introducing Multiplication as Equal Groups',
      'Representing Multiplication with Arrays',
      'Solving Problems Using Groups and Arrays',
    ]);
  });

  it('has content for every one of the five lessons', () => {
    for (const id of U04) {
      expect(LESSON_CONTENT[id], id).toBeTruthy();
      expect(LESSON_CONTENT[id].id).toBe(id);
      expect(LESSON_CONTENT[id].status).toBe('placeholder');
    }
  });
});

// ─────────────────────────── the engine ───────────────────────────

describe('groups: equality is a fact about the counts', () => {
  it('counts what is in the groups', () => {
    expect(totalOf(3, 4)).toBe(12);
    expect(sumOfGroupSizes([3, 4, 5])).toBe(12);
    expect(groupsText(3, 4)).toBe('3 ჯგუფი, თითოეულში 4 საგანი');
    expect(multiplyText(3, 4)).toBe('3 × 4 = 12');
  });

  it('decides equality from the numbers, not from how many groups there are', () => {
    expect(allEqual([4, 4, 4])).toBe(true);
    expect(allEqual([4, 4, 5])).toBe(false);
    expect(allEqual([7])).toBe(true);
    expect(allEqual([])).toBe(false);
    expect(unevenGroups([4, 4, 5])).toEqual([2]);
    expect(unevenGroups([4, 4, 4])).toEqual([]);
  });
});

describe('repeated addition: one term per group', () => {
  it('grows by one term at a time, always the same term', () => {
    expect(termsOf(4, 3)).toEqual([3, 3, 3, 3]);
    expect(repeatedText(4, 3)).toBe('3 + 3 + 3 + 3 = 12');
    expect(runningTotals(4, 3)).toEqual([3, 6, 9, 12]);
    expect(termCount(12, 3)).toBe(4);
  });

  it('the expression holds exactly when the product holds', () => {
    expect(repeatedHolds(4, 3, 12)).toBe(true);
    expect(repeatedHolds(4, 3, 13)).toBe(false);
  });
});

describe('arrays: rows and columns are the same two numbers', () => {
  it('an array is rows × columns', () => {
    expect(arrayTotal({ rows: 3, cols: 4 })).toBe(12);
    expect(rowCells({ rows: 2, cols: 3 })).toEqual([
      [0, 1, 2],
      [3, 4, 5],
    ]);
    expect(arrayByRows({ rows: 3, cols: 4 })).toBe('4 + 4 + 4 = 12');
    expect(arrayByCols({ rows: 3, cols: 4 })).toBe('3 + 3 + 3 + 3 = 12');
  });

  it('turning it swaps the counts and never the total', () => {
    expect(turnArray({ rows: 3, cols: 4 })).toEqual({ rows: 4, cols: 3 });
    expect(turnKeepsTotal({ rows: 3, cols: 4 })).toBe(true);
    for (let r = 1; r <= 6; r += 1) for (let c = 1; c <= 6; c += 1) expect(turnKeepsTotal({ rows: r, cols: c }), `${r}x${c}`).toBe(true);
  });

  it('a total can be arranged more than one way', () => {
    expect(arraysFor(12)).toEqual([
      { rows: 1, cols: 12 },
      { rows: 2, cols: 6 },
      { rows: 3, cols: 4 },
      { rows: 4, cols: 3 },
      { rows: 6, cols: 2 },
      { rows: 12, cols: 1 },
    ]);
    expect(arraysFor(0)).toEqual([]);
  });
});

describe('the four ways of writing one number', () => {
  it('agree because they are computed from the same two counts', () => {
    const ways = fourWays(3, 4);
    expect(ways.picture).toBe('3 ჯგუფი, თითოეულში 4 საგანი');
    expect(ways.repeated).toBe('4 + 4 + 4 = 12');
    expect(ways.multiply).toBe('3 × 4 = 12');
    expect(ways.total).toBe(12);
    expect(productOf(3, 4)).toBe(12);
    for (let g = 1; g <= 6; g += 1) for (let e = 1; e <= 6; e += 1) expect(commutative(g, e), `${g},${e}`).toBe(true);
  });
});

describe('groups stories: the total comes from the counts', () => {
  const story = { groups: 4, each: 6, unit: 'ფანქარი', what: 'ფანქრებზე' };

  it('is solved by multiplying', () => {
    expect(storyTotal(story)).toBe(24);
    expect(storySentence(story)).toBe('4 × 6 = 24');
  });

  it('an answer has to be the product to make sense', () => {
    expect(storyMakesSense(story, 24)).toBe(true);
    expect(storyMakesSense(story, 10)).toBe(false);
    expect(storyMakesSense(story, 2)).toBe(false);
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

describe('checking: making the groups equal', () => {
  const make = q({ type: 'make-equal', groups: 3, each: 4 });

  it('wants every group to hold the same number', () => {
    expect(evaluateAnswer(make, '4,4,4').verdict).toBe('correct');
    expect(evaluateAnswer(make, '5,5,5').verdict).toBe('correct');
    expect(evaluateAnswer(make, '4,4,5').verdict).toBe('incorrect');
    expect(evaluateAnswer(make, '0,0,0').verdict).toBe('incomplete');
    expect(evaluateAnswer(make, '4,4').verdict).toBe('incomplete');
    expect(evaluateAnswer(make, '').verdict).toBe('incomplete');
  });

  it('says which groups are the odd ones out', () => {
    const wrong = evaluateAnswer(make, '4,5,6');
    expect(wrong.verdict).toBe('incorrect');
    expect(wrong.feedback).toContain('5');
    expect(wrong.feedback).toContain('6');
  });
});

describe('checking: reading an array', () => {
  const read = q({ type: 'array-read', rows: 4, cols: 3 });

  it('wants the rows first and the columns second', () => {
    expect(evaluateAnswer(read, '4,3').verdict).toBe('correct');
    expect(evaluateAnswer(read, '4,').verdict).toBe('incomplete');
    expect(evaluateAnswer(read, '').verdict).toBe('incomplete');
  });

  it('a swapped reading is named as swapped, because the total is still right', () => {
    const swapped = evaluateAnswer(read, '3,4');
    expect(swapped.verdict).toBe('incorrect');
    expect(swapped.feedback).toContain('რიგები');
    expect(swapped.feedback).toContain('სვეტები');
  });

  it('a total that is off is named with the real total', () => {
    const off = evaluateAnswer(read, '2,3');
    expect(off.verdict).toBe('incorrect');
    expect(off.feedback).toContain('6');
    expect(off.feedback).toContain('12');
  });
});

describe('checking: building an array', () => {
  const build = q({ type: 'array-build', total: 12 });

  it('accepts any true factor pair', () => {
    for (const spec of arraysFor(12)) expect(evaluateAnswer(build, `${spec.rows},${spec.cols}`).verdict, `${spec.rows},${spec.cols}`).toBe('correct');
    expect(evaluateAnswer(build, '5,5').verdict).toBe('incorrect');
    expect(evaluateAnswer(build, '2,').verdict).toBe('incomplete');
  });

  it('a pair that misses the total is named with its product', () => {
    const wrong = evaluateAnswer(build, '3,5');
    expect(wrong.feedback).toContain('15');
    expect(wrong.feedback).toContain('12');
  });
});

describe('checking: a groups story', () => {
  const story = q({ type: 'group-story', groups: 4, each: 6, text: 'x', unit: 'ფანქარი', what: 'ფანქრებზე' });

  it('wants a true multiplication first, then the right total', () => {
    expect(evaluateAnswer(story, '4,6,24').verdict).toBe('correct');
    expect(evaluateAnswer(story, '6,4,24').verdict).toBe('correct');
    expect(evaluateAnswer(story, '4,6,10').verdict).toBe('incorrect');
    expect(evaluateAnswer(story, '4,6,1').verdict).toBe('incorrect');
    expect(evaluateAnswer(story, '4,6,').verdict).toBe('incomplete');
    expect(evaluateAnswer(story, '').verdict).toBe('incomplete');
  });

  it('a product that is not a true sentence is named before the total is judged', () => {
    const wrong = evaluateAnswer(story, '4,5,24');
    expect(wrong.verdict).toBe('incorrect');
    expect(wrong.feedback).toContain('20');
  });

  it('the story is described as its multiplication', () => {
    expect(describeAnswer({ type: 'group-story', groups: 4, each: 6, text: '', unit: 'ფანქარი', what: '' })).toContain('24');
  });
});

describe('checking: the answers can be described', () => {
  it('says the equal groups, the array and its factor pairs', () => {
    expect(describeAnswer({ type: 'make-equal', groups: 3, each: 4 })).toContain('12');
    expect(describeAnswer({ type: 'array-read', rows: 4, cols: 3 })).toContain('12');
    expect(describeAnswer({ type: 'array-build', total: 12 })).toContain('3 × 4');
    expect(describeAnswer({ type: 'array-build', total: 12 })).toContain('4 × 3');
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

  it('each lesson has one explore tool and a demonstration of more than two pictures', () => {
    for (const l of lessons) {
      const explore = l.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>;
      expect(explore.tool, l.id).toBeTruthy();
      const explain = l.activities.find((a) => a.kind === 'explain') as Extract<Activity, { kind: 'explain' }>;
      expect(explain.blocks.length, l.id).toBeGreaterThan(2);
    }
  });

  it('every lesson asks for at least one answer that is about groups or arrays', () => {
    for (const l of lessons) {
      const types = questions(l).map((x) => x.response.type);
      const visuals = questions(l).map((x) => x.visual?.type);
      const answered = types.some((t) => t === 'make-equal' || t === 'array-read' || t === 'array-build' || t === 'group-story');
      const pictured = visuals.some((v) => v === 'groups-equal' || v === 'groups-uneven' || v === 'array' || v === 'repeated');
      expect(answered || pictured, `${l.id}: ${types.join(', ')} / ${visuals.join(', ')}`).toBe(true);
    }
  });
});

describe('content: the numbers really are equal groups and arrays', () => {
  it('every make-equal asks for a positive number of groups and objects', () => {
    const items = lessons.flatMap((l) => questions(l).filter((x) => x.response.type === 'make-equal').map((x) => ({ l, x })));
    expect(items.length).toBeGreaterThan(2);
    for (const { l, x } of items) {
      const r = x.response as Extract<ResponseSpec, { type: 'make-equal' }>;
      expect(r.groups, `${l.id}/${x.id}`).toBeGreaterThanOrEqual(2);
      expect(r.each, `${l.id}/${x.id}`).toBeGreaterThanOrEqual(1);
    }
  });

  it('every array question has a total that its factor pairs reach', () => {
    const items = lessons.flatMap((l) => questions(l).filter((x) => x.response.type === 'array-read' || x.response.type === 'array-build').map((x) => ({ l, x })));
    expect(items.length).toBeGreaterThan(3);
    for (const { l, x } of items) {
      const r = x.response;
      if (r.type === 'array-read') {
        expect(r.rows, `${l.id}/${x.id}`).toBeGreaterThanOrEqual(2);
        expect(r.cols, `${l.id}/${x.id}`).toBeGreaterThanOrEqual(2);
        expect(arraysFor(arrayTotal({ rows: r.rows, cols: r.cols })).length, `${l.id}/${x.id}`).toBeGreaterThan(1);
      }
      if (r.type === 'array-build') {
        expect(arraysFor(r.total).length, `${l.id}/${x.id}`).toBeGreaterThan(2);
      }
    }
  });

  it('every groups story is answerable and its answer makes sense in its own story', () => {
    const items = lessons.flatMap((l) => questions(l).filter((x) => x.response.type === 'group-story').map((x) => ({ l, x })));
    expect(items.length).toBeGreaterThan(2);
    for (const { l, x } of items) {
      const r = x.response as Extract<ResponseSpec, { type: 'group-story' }>;
      const story = { groups: r.groups, each: r.each, unit: r.unit, what: r.what };
      expect(storyTotal(story), `${l.id}/${x.id}`).toBeGreaterThan(0);
      expect(storyMakesSense(story, storyTotal(story)), `${l.id}/${x.id}`).toBe(true);
      expect(r.text.length, `${l.id}/${x.id}`).toBeGreaterThan(10);
      expect(r.unit.length, `${l.id}/${x.id}`).toBeGreaterThan(1);
      // the story is written with the numbers it actually uses
      expect(r.text, `${l.id}/${x.id}`).toContain(String(r.groups));
      expect(r.text, `${l.id}/${x.id}`).toContain(String(r.each));
    }
  });

  it('the multiplication lesson writes both orders of the same product', () => {
    const l = LESSON_CONTENT['g2-u04-l3'];
    const products = questions(l)
      .map((x) => x.response)
      .filter((r): r is Extract<ResponseSpec, { type: 'group-story' }> => r.type === 'group-story');
    for (const r of products) expect(commutative(r.groups, r.each)).toBe(true);
    // practice-4 asks for the swapped order of a known product
    const swapped = questions(l).find((x) => x.id === 'practice-4');
    expect(swapped?.prompt).toContain('8 × 3');
  });

  it('the array lesson starts from a rectangle it then turns', () => {
    const tool = toolOf(LESSON_CONTENT['g2-u04-l4']);
    expect(tool.tool).toBe('array-lab');
    if (tool.tool === 'array-lab') {
      expect(tool.start.rows).toBeGreaterThan(1);
      expect(tool.start.cols).toBeGreaterThan(1);
      expect(turnArray(tool.start)).not.toEqual(tool.start);
    }
  });
});

// ─────────────────────────── boards ───────────────────────────

describe('board: equal groups', () => {
  it('draws one box per group, each with its own count', () => {
    render(<EqualGroups groups={3} each={4} />);
    expect(document.querySelectorAll('.gbox')).toHaveLength(3);
    expect(document.querySelectorAll('.gbox-dots i')).toHaveLength(12);
    expect(text('.grp-note')).toContain('3 × 4 = 12');
    expect(text('.grp-note')).toContain('4 + 4 + 4 = 12');
  });

  it('says out loud what the counts are', () => {
    render(<EqualGroups groups={2} each={5} />);
    expect(screen.getByLabelText('2 ჯგუფი, თითოეულში 5 საგანი')).toBeTruthy();
    expect(screen.getByLabelText('ჯგუფი 1: 5 საგანი')).toBeTruthy();
  });

  it('marks groups that are not equal, and never calls them equal', () => {
    render(<UnevenGroups sizes={[3, 3, 6]} />);
    expect(document.querySelectorAll('.gbox.is-odd')).toHaveLength(3);
    expect(text('.grp-note')).toContain('ერთნაირი არ არის');
    cleanup();
    render(<UnevenGroups sizes={[4, 4, 4]} />);
    expect(document.querySelectorAll('.gbox.is-same')).toHaveLength(3);
    expect(text('.grp-note')).toContain('ერთნაირია');
  });
});

describe('board: arrays', () => {
  it('draws rows × columns of objects and counts them in words', () => {
    render(<ArrayBoard spec={{ rows: 3, cols: 4 }} />);
    expect(document.querySelectorAll('.arr-dot')).toHaveLength(12);
    expect(text('.arr-note')).toContain('3 რიგი × 4 = 12');
    expect(screen.getByLabelText('მართკუთხედი: 3 რიგი, თითოეულში 4 საგანი, სულ 12')).toBeTruthy();
  });

  it('turning it changes the shape and not the count', () => {
    render(<ArrayTurn spec={{ rows: 3, cols: 4 }} />);
    const boards = document.querySelectorAll('.arr-grid');
    expect(boards).toHaveLength(2);
    expect(boards[0].querySelectorAll('.arr-dot')).toHaveLength(12);
    expect(boards[1].querySelectorAll('.arr-dot')).toHaveLength(12);
    expect(text('.arr-same')).toContain('12');
  });

  it('never states the count while the student is reading the rectangle', () => {
    render(<ArrayReadAnswer response={{ rows: 4, cols: 3 }} value="" onChange={vi.fn()} disabled={false} label="მართკუთხედი" />);
    expect(text('.arr-note')).not.toContain('×');
    expect(text('.gar-total')).toBe('?');
    // the objects are still all there to be counted
    expect(document.querySelectorAll('.arr-dot')).toHaveLength(12);
  });
});

describe('board: making the groups equal', () => {
  it('starts from groups that differ and says so', () => {
    render(<MakeEqualAnswer response={{ groups: 3, each: 4 }} value="" onChange={vi.fn()} disabled={false} label="ჯგუფები" />);
    expect(document.querySelectorAll('.gbox')).toHaveLength(3);
    expect(text('.grp-note')).toContain('ჯერ არ არის ტოლი');
    expect(screen.getByLabelText('1-ე ჯგუფს დაამატე ერთი')).toBeTruthy();
  });

  it('reports the counts of every group, and knows when they are equal', () => {
    const onChange = vi.fn();
    render(<MakeEqualAnswer response={{ groups: 3, each: 4 }} value="4,4,5" onChange={onChange} disabled={false} label="ჯგუფები" />);
    expect(text('.grp-note')).toContain('ჯერ არ არის ტოლი');
    fireEvent.click(screen.getByLabelText('3-ე ჯგუფიდან წაიღე ერთი'));
    expect(onChange).toHaveBeenLastCalledWith('4,4,4');
    cleanup();
    render(<MakeEqualAnswer response={{ groups: 3, each: 4 }} value="4,4,4" onChange={vi.fn()} disabled={false} label="ჯგუფები" />);
    expect(text('.grp-note')).toContain('ტოლია');
    expect(text('.grp-note')).toContain('12');
  });
});

describe('board: reading an array', () => {
  it('asks for the rows and what is in each row', () => {
    const onChange = vi.fn();
    render(<ArrayReadAnswer response={{ rows: 4, cols: 3 }} value="" onChange={onChange} disabled={false} label="მართკუთხედი" />);
    fireEvent.change(screen.getByLabelText('რიგების რაოდენობა'), { target: { value: '4' } });
    expect(onChange).toHaveBeenLastCalledWith('4,');
    fireEvent.change(screen.getByLabelText('თითო რიგში საგნების რაოდენობა'), { target: { value: '3' } });
    expect(onChange).toHaveBeenLastCalledWith(',3');
  });

  it('shows the product of the two numbers the student wrote', () => {
    render(<ArrayReadAnswer response={{ rows: 4, cols: 3 }} value="4,3" onChange={vi.fn()} disabled={false} label="მართკუთხედი" />);
    expect(text('.gar-total')).toBe('12');
    expect(text('.arr-note')).toContain('ემთხვევა');
  });

  it('building an array accepts any shape that holds the total', () => {
    render(<ArrayBuildAnswer response={{ total: 12 }} value="3,4" onChange={vi.fn()} disabled={false} label="მართკუთხედი" />);
    expect(text('.arr-note')).toContain('12');
    expect(text('.arr-note')).toContain('✓');
    cleanup();
    render(<ArrayBuildAnswer response={{ total: 12 }} value="5,5" onChange={vi.fn()} disabled={false} label="მართკუთხედი" />);
    expect(text('.arr-note')).toContain('ზედმეტია');
  });
});

describe('board: a groups story', () => {
  it('asks for the groups, what is in each, and the total', () => {
    const onChange = vi.fn();
    render(<GroupStoryAnswer response={{ groups: 4, each: 6, text: 'ოთხი ყუთი, თითოეულში 6 ფანქარი.', unit: 'ფანქარი', what: 'ფანქრებზე' }} value="" onChange={onChange} disabled={false} label="ამოცანა" />);
    expect(text('.stb-story')).toContain('6 ფანქარი');
    expect(document.querySelectorAll('.gbox')).toHaveLength(4);
    fireEvent.change(screen.getByLabelText('ჯგუფების რაოდენობა'), { target: { value: '4' } });
    expect(onChange).toHaveBeenLastCalledWith('4,,');
  });

  it('reports all three numbers together, in order', () => {
    render(<GroupStoryAnswer response={{ groups: 4, each: 6, text: 'x', unit: 'ფანქარი', what: 'ფანქრებზე' }} value="4,6,24" onChange={vi.fn()} disabled={false} label="ამოცანა" />);
    expect((screen.getByLabelText('სულ რაოდენობა') as HTMLInputElement).value).toBe('24');
    expect(text('.arr-note')).toContain('4 × 6 = 24');
  });
});

describe('board: the repeated addition', () => {
  it('writes one term per group, with the total and the multiplication', () => {
    render(<RepeatedLine groups={4} each={3} />);
    expect(document.querySelectorAll('.rep-term')).toHaveLength(4);
    expect(text('.rep-line')).toContain('3 + 3 + 3 + 3');
    expect(text('.rep-line')).toContain('= 12');
    expect(text('.rep-line')).toContain('4 × 3 = 12');
  });
});

// ─────────────────────────── tools ───────────────────────────

describe('tools: the equal-groups lab', () => {
  it('starts uneven and can be made equal', () => {
    render(<EqualGroupsLab tool={{ tool: 'groups-equal-lab', each: 4, sizes: [4, 3, 5] }} />);
    expect(text('.lab-status')).toContain('არ არის ტოლი');
    expect(text('.eq-badge')).toContain('არათანაბარი');
    fireEvent.click(screen.getByRole('button', { name: 'გაათანაბრე' }));
    expect(text('.eq-badge')).toContain('ტოლი');
    expect(text('.lab-status')).toContain('12');
  });

  it('adding one to a group can settle it, and a new group joins the count', () => {
    render(<EqualGroupsLab tool={{ tool: 'groups-equal-lab', each: 4, sizes: [4, 4, 3] }} />);
    fireEvent.click(screen.getByLabelText('3-ე ჯგუფს დაამატე ერთი'));
    expect(text('.eq-badge')).toContain('ტოლი');
    fireEvent.click(screen.getByRole('button', { name: '+ კიდევ ერთი ჯგუფი' }));
    expect(document.querySelectorAll('.gbox')).toHaveLength(4);
    expect(text('.lab-facts')).toContain('ჯგუფები: 4');
  });
});

describe('tools: the repeated-addition lab', () => {
  it('the expression grows by one term as each group is added', () => {
    render(<RepeatLab tool={{ tool: 'repeat-lab', each: 4, maxGroups: 5 }} />);
    expect(document.querySelectorAll('.rep-term')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: '+ ერთი ჯგუფი (4)' }));
    expect(document.querySelectorAll('.rep-term')).toHaveLength(2);
    expect(text('.rep-line')).toContain('4 + 4');
    expect(text('.rep-line')).toContain('= 8');
    fireEvent.click(screen.getByRole('button', { name: '+ ერთი ჯგუფი (4)' }));
    expect(text('.lab-facts')).toContain('სულ: 12');
  });

  it('stops at the maximum and can go back to one group', () => {
    render(<RepeatLab tool={{ tool: 'repeat-lab', each: 3, maxGroups: 2 }} />);
    fireEvent.click(screen.getByRole('button', { name: '+ ერთი ჯგუფი (3)' }));
    expect((screen.getByRole('button', { name: '+ ერთი ჯგუფი (3)' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: '↻ თავიდან' }));
    expect(document.querySelectorAll('.rep-term')).toHaveLength(1);
  });
});

describe('tools: the multiplication lab', () => {
  it('the picture, the repeated addition and the multiplication move together', () => {
    render(<MultiplyLab tool={{ tool: 'multiply-lab', start: { groups: 3, each: 4 }, maxGroups: 6, maxEach: 6 }} />);
    expect(text('.lab-status')).toContain('3 × 4 = 12');
    expect(text('.lab-status')).toContain('4 × 3 = 12');
    fireEvent.change(screen.getByLabelText('ჯგუფების რაოდენობა'), { target: { value: '5' } });
    expect(text('.lab-status')).toContain('5 × 4 = 20');
    expect(document.querySelectorAll('.gbox')).toHaveLength(5);
    expect(text('.lab-facts')).toContain('4 + 4 + 4 + 4 + 4 = 20');
  });

  it('changing what is in each group changes the total too', () => {
    render(<MultiplyLab tool={{ tool: 'multiply-lab', start: { groups: 2, each: 3 }, maxGroups: 6, maxEach: 6 }} />);
    fireEvent.change(screen.getByLabelText('თითოეულ ჯგუფში საგნების რაოდენობა'), { target: { value: '6' } });
    expect(text('.lab-status')).toContain('2 × 6 = 12');
    expect(text('.lab-facts')).toContain('6 + 6 = 12');
  });
});

describe('tools: the array lab', () => {
  it('reads the rectangle and turns it without changing the total', () => {
    render(<ArrayLab tool={{ tool: 'array-lab', start: { rows: 3, cols: 4 }, max: 6 }} />);
    expect(text('.lab-status')).toContain('3 რიგი × 4 = 12');
    const turn = screen.getByRole('button', { name: /მართკუთხედის მოტრიალება/ });
    expect(turn.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(turn);
    expect(screen.getByRole('button', { name: /მართკუთხედის მოტრიალება/ }).getAttribute('aria-pressed')).toBe('true');
    expect(text('.lab-status')).toContain('4 რიგი და 3 სვეტი');
    expect(text('.lab-status')).toContain('სულ ისევ 12');
    expect(document.querySelectorAll('.arr-dot')).toHaveLength(12);
  });

  it('changing the rows changes the total, and changing a slider un-turns the rectangle', () => {
    render(<ArrayLab tool={{ tool: 'array-lab', start: { rows: 2, cols: 5 }, max: 6 }} />);
    fireEvent.change(screen.getByLabelText('რიგების რაოდენობა'), { target: { value: '3' } });
    expect(text('.lab-status')).toContain('3 რიგი × 5 = 15');
    const turn = () => screen.getByRole('button', { name: /მართკუთხედის მოტრიალება/ });
    fireEvent.click(turn());
    expect(turn().getAttribute('aria-pressed')).toBe('true');
    fireEvent.change(screen.getByLabelText('სვეტების რაოდენობა'), { target: { value: '4' } });
    expect(turn().getAttribute('aria-pressed')).toBe('false');
    expect(text('.lab-status')).toContain('3 რიგი × 4 = 12');
  });
});

describe('tools: the groups-story lab', () => {
  const tool = {
    tool: 'group-story-lab' as const,
    stories: [{ text: 'თაროზე 3 კალათაა, თითოეულში 8 ვაშლი.', groups: 3, each: 8, unit: 'ვაშლი' }],
  };

  it('only shows a model once the student picks one', () => {
    render(<GroupStoryLab tool={tool} />);
    expect(document.querySelectorAll('.gbox')).toHaveLength(0);
    fireEvent.click(screen.getByRole('radio', { name: /ტოლი ჯგუფები/ }));
    expect(document.querySelectorAll('.gbox')).toHaveLength(3);
    fireEvent.click(screen.getByRole('radio', { name: /მართკუთხედი/ }));
    expect(document.querySelectorAll('.arr-dot')).toHaveLength(24);
  });

  it('checks the total against the two counts', () => {
    render(<GroupStoryLab tool={tool} />);
    fireEvent.change(screen.getByLabelText('სულ რაოდენობა'), { target: { value: '24' } });
    expect(text('.lab-status')).toContain('✓');
    expect(text('.lab-status')).toContain('8 + 8 + 8 = 24');
  });

  it('a wrong total is told how the two counts multiply', () => {
    render(<GroupStoryLab tool={tool} />);
    fireEvent.change(screen.getByLabelText('სულ რაოდენობა'), { target: { value: '11' } });
    expect(text('.lab-status')).toContain('3 × 8 = 24');
    expect(text('.lab-status')).not.toContain('✓');
  });
});

describe('tools: the demonstrations', () => {
  it('the groups story grows one group at a time', () => {
    render(<GroupsDemo block={{ type: 'groups-demo', groups: 3, each: 4, steps: ['ა', 'ბ', 'გ', 'დ'] }} />);
    expect(document.querySelectorAll('.gbox')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(document.querySelectorAll('.gbox')).toHaveLength(2);
    expect(text('.demo-rule')).toContain('4 + 4');
    expect(document.querySelectorAll('.demo-bars li.is-on')).toHaveLength(1);
  });

  it('the array demo turns the rectangle and keeps the total', () => {
    render(<ArrayDemo block={{ type: 'array-demo', rows: 3, cols: 4, steps: ['ა', 'ბ', 'გ', 'დ'] }} />);
    expect(document.querySelectorAll('.arr-dot')).toHaveLength(12);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(text('.demo-badge')).toContain('მოტრიალებული');
    expect(text('.demo-rule')).toContain('სულ 12');
  });

  it('the four-ways demo walks the picture, the addition, the multiplication and the total', () => {
    render(<FourWaysDemo block={{ type: 'four-ways', groups: 3, each: 4 }} />);
    const bars = document.querySelectorAll('.demo-bars li');
    expect(bars).toHaveLength(4);
    expect(text('.demo-bars')).toContain('3 × 4 = 12');
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(document.querySelectorAll('.demo-bars li.is-done')).toHaveLength(1);
    expect(text('.demo-rule')).toContain('4 × 3 = 12');
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
    case 'make-equal': {
      // the board starts from the first group only; bring every group to `each`
      for (let i = 1; i < r.groups; i += 1) {
        for (let k = 0; k < r.each; k += 1) fireEvent.click(screen.getByLabelText(`${i + 1}-ე ჯგუფს დაამატე ერთი`));
      }
      break;
    }
    case 'array-read':
      fireEvent.change(screen.getByLabelText('რიგების რაოდენობა'), { target: { value: String(r.rows) } });
      fireEvent.change(screen.getByLabelText('თითო რიგში საგნების რაოდენობა'), { target: { value: String(r.cols) } });
      break;
    case 'array-build':
      fireEvent.change(screen.getByLabelText('რიგების რაოდენობა'), { target: { value: String(arraysFor(r.total)[0].rows) } });
      fireEvent.change(screen.getByLabelText('სვეტების რაოდენობა'), { target: { value: String(arraysFor(r.total)[0].cols) } });
      break;
    case 'group-story':
      fireEvent.change(screen.getByLabelText('ჯგუფების რაოდენობა'), { target: { value: String(r.groups) } });
      fireEvent.change(screen.getByLabelText('თითოეულ ჯგუფში საგნების რაოდენობა'), { target: { value: String(r.each) } });
      fireEvent.change(screen.getByLabelText('სულ რაოდენობა'), { target: { value: String(r.groups * r.each) } });
      break;
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

describe('g2-u04 unit page', () => {
  it('lists the five lessons, all playable and in order', () => {
    go('#/student/lessons/g2-u04');
    const list = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(list).toHaveLength(5);
    U04.forEach((id, i) => expect(within(list[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
  });
});

describe.each(U04.map((id) => [id] as const))('%s plays to the end', (id) => {
  it('every step works with its own correct answers and the progress is saved', () => {
    const lesson = LESSON_CONTENT[id];
    go(`#/student/lessons/${id}`);
    expect(screen.getByText(`ნაბიჯი 1 / ${lesson.activities.length}`)).toBeTruthy();
    playThrough(lesson);
    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    const checks = stageOf(lesson, 'check').length;
    expect(screen.getByText(`${checks} / ${checks}`)).toBeTruthy();
    expect(saved()[id]).toMatchObject({ status: 'completed', checkCorrect: checks, checkTotal: checks });
    if (id !== 'g2-u04-l5') {
      expect(screen.getByRole('link', { name: 'გაგრძელება: U04.' + (Number(id.slice(-1)) + 1) }).getAttribute('href')).toBe(`#/student/lessons/g2-u04-l${Number(id.slice(-1)) + 1}`);
    } else {
      expect(screen.getByRole('link', { name: 'U04-ზე დაბრუნება' })).toBeTruthy();
    }
  });
});

describe('feedback is aimed at the real mistake', () => {
  it('groups left uneven are told which ones differ', () => {
    go('#/student/lessons/g2-u04-l1');
    const lesson = LESSON_CONTENT['g2-u04-l1'];
    const stop = lesson.activities.findIndex((a) => a.id === 'practice-1');
    lesson.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    // practice-1 starts as 4,0,0; one object added to the second group leaves 4,1,0 — still not equal
    fireEvent.click(screen.getByLabelText('2-ე ჯგუფს დაამატე ერთი'));
    submit();
    expect(feedback()).toContain('ჯგუფ');
    // and it says which group is the odd one out, instead of only that something is wrong
    expect(feedback()).toContain('2-ე ჯგუფში 1');
    expect(feedback()).not.toContain('სწორია');
  });

  it('a swapped reading of an array says rows and columns, not just wrong', () => {
    go('#/student/lessons/g2-u04-l4');
    const lesson = LESSON_CONTENT['g2-u04-l4'];
    const stop = lesson.activities.findIndex((a) => a.id === 'practice-1');
    lesson.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    fireEvent.change(screen.getByLabelText('რიგების რაოდენობა'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('თითო რიგში საგნების რაოდენობა'), { target: { value: '4' } });
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('რიგები');
  });

  it('a total that misses the target says how many are left over', () => {
    go('#/student/lessons/g2-u04-l4');
    const lesson = LESSON_CONTENT['g2-u04-l4'];
    const stop = lesson.activities.findIndex((a) => a.id === 'practice-3');
    lesson.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    fireEvent.change(screen.getByLabelText('რიგების რაოდენობა'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('სვეტების რაოდენობა'), { target: { value: '5' } });
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('12');
  });

  it('a story whose product is not a true sentence is caught first', () => {
    go('#/student/lessons/g2-u04-l5');
    const lesson = LESSON_CONTENT['g2-u04-l5'];
    const stop = lesson.activities.findIndex((a) => a.id === 'practice-1');
    lesson.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    // 3 × 8 = 24; writing 3 × 5 makes the sentence false before the total can be right
    fireEvent.change(screen.getByLabelText('ჯგუფების რაოდენობა'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('თითოეულ ჯგუფში საგნების რაოდენობა'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('სულ რაოდენობა'), { target: { value: '24' } });
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('15');
  });
});

describe('style: motion, layout and honest labels', () => {
  const css = readFileSync('src/lessons/learn.css', 'utf8');
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));

  it('the new boards are switched off under reduced motion', () => {
    for (const cls of ['.gbox', '.arr-dot', '.rep-term', '.eq-badge']) expect(reduced, cls).toContain(cls);
  });

  it('the groups and the inputs get narrower on a phone', () => {
    const small = css.slice(css.indexOf('@media (max-width: 560px)'));
    expect(small).toContain('.gbox-dots');
    expect(small).toContain('.gar-inputs');
  });

  it('every group is labelled by its number, never only by position', () => {
    render(<EqualGroups groups={3} each={4} />);
    const labels = Array.from(document.querySelectorAll('.gbox')).map((b) => b.getAttribute('aria-label'));
    expect(labels).toEqual(['ჯგუფი 1: 4 საგანი', 'ჯგუფი 2: 4 საგანი', 'ჯგუფი 3: 4 საგანი']);
  });

  it('the equality badge states the fact, in words and not only in colour', () => {
    render(<UnevenGroups sizes={[2, 2, 2]} />);
    expect(text('.grp-note')).toContain('ერთნაირია');
    expect(document.querySelectorAll('.gbox.is-same')).toHaveLength(3);
  });
});
