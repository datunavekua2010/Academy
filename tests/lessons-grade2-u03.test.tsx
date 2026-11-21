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
  COLS,
  answerMakesSense,
  carriedTen,
  checkDifference,
  columnDifference,
  columnSum,
  differenceOnes,
  differenceParts,
  differenceTens,
  digits2,
  fromDigits,
  needsBorrow,
  needsCarry,
  opSign,
  operationOf,
  storyAnswer,
  sumOnes,
  sumTens,
} from '../src/lessons/exercises/AddSubGeometry';
import { Blocks, ColumnAnswer, DifferenceColumns, DifferenceStepsBoard, StoryBoard, SumColumns, SumStepsBoard } from '../src/lessons/exercises/AddSubBoard';
import { AddLab, ColumnsLab, DifferenceDemo, StoryLab, SubtractLab, SumDemo, SumStoryDemo } from '../src/lessons/exercises/AddSubTools';
import type { Activity, Lesson, QuestionActivity, ResponseSpec } from '../src/lessons/types';

/**
 * Grade 2 · Unit 3: "Two-Digit Addition & Subtraction (With & Without Regrouping)".
 *
 * The point of this unit is that a regroup is real: a ten is carried exactly when the ones add to ten or more, and a ten is
 * broken exactly when the ones of the number taken away are bigger. Every test below checks that the picture and the
 * written answer agree with the arithmetic — nothing is judged by how a column looks.
 */

const U03 = ['g2-u03-l1', 'g2-u03-l2', 'g2-u03-l3', 'g2-u03-l4', 'g2-u03-l5'];
const lessons = U03.map((id) => LESSON_CONTENT[id]);
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);
const text = (sel: string) => document.querySelector(sel)?.textContent ?? '';

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 2 U03 is the two-digit operation unit', () => {
  it('has the approved titles, ids and codes', () => {
    const unit = getUnit('g2-u03');
    expect(unit?.title).toBe('Two-Digit Addition & Subtraction (With & Without Regrouping)');
    expect(unit?.grade).toBe(2);
    expect(unit?.lessons.map((l) => l.id)).toEqual(U03);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U03.1', 'U03.2', 'U03.3', 'U03.4', 'U03.5']);
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Adding Two-Digit Numbers Without Regrouping',
      'Subtracting Two-Digit Numbers Without Regrouping',
      'Adding Two-Digit Numbers with Regrouping',
      'Subtracting Two-Digit Numbers with Regrouping',
      'Solving Addition and Subtraction Word Problems',
    ]);
  });

  it('has content for every one of the five lessons', () => {
    for (const id of U03) {
      expect(LESSON_CONTENT[id], id).toBeTruthy();
      expect(LESSON_CONTENT[id].id).toBe(id);
      expect(LESSON_CONTENT[id].status).toBe('placeholder');
    }
  });
});

// ─────────────────────────── the engine ───────────────────────────

describe('columns: digits and what they are worth', () => {
  it('splits a two-digit number into its columns', () => {
    expect(digits2(47)).toEqual({ tens: 4, ones: 7 });
    expect(digits2(7)).toEqual({ tens: 0, ones: 7 });
    expect(fromDigits({ tens: 4, ones: 7 })).toBe(47);
    expect(COLS).toEqual(['tens', 'ones']);
    expect(() => digits2(100)).toThrow(RangeError);
  });
});

describe('addition: a ten is carried exactly when it is needed', () => {
  it('adds without a carry when the ones stay under ten', () => {
    expect(needsCarry(23, 45)).toBe(false);
    expect(carriedTen(23, 45)).toBe(0);
    expect(columnSum(23, 45)).toBe(68);
    expect(sumOnes(23, 45)).toBe(8);
    expect(sumTens(23, 45)).toBe(6);
  });

  it('carries a ten when the ones reach ten or more', () => {
    expect(needsCarry(38, 24)).toBe(true);
    expect(carriedTen(38, 24)).toBe(1);
    expect(sumOnes(38, 24)).toBe(2);
    expect(sumTens(38, 24)).toBe(6);
    expect(columnSum(38, 24)).toBe(62);
    // exactly ten is already a carry
    expect(needsCarry(35, 25)).toBe(true);
    expect(columnSum(35, 25)).toBe(60);
    // nine is not
    expect(needsCarry(34, 25)).toBe(false);
  });

  it('the columns always produce the ordinary sum', () => {
    for (let a = 10; a <= 89; a += 7) {
      for (let b = 10; b <= 89; b += 11) {
        expect(columnSum(a, b), `${a} + ${b}`).toBe(a + b);
      }
    }
  });
});

describe('subtraction: a ten is broken exactly when it is needed', () => {
  it('subtracts without a borrow when the ones are big enough', () => {
    expect(needsBorrow(68, 45)).toBe(false);
    expect(columnDifference(68, 45)).toBe(23);
    expect(differenceOnes(68, 45)).toBe(3);
    expect(differenceTens(68, 45)).toBe(2);
  });

  it('breaks a ten when the ones of the second number are bigger', () => {
    expect(needsBorrow(52, 27)).toBe(true);
    expect(differenceOnes(52, 27)).toBe(5);
    expect(differenceTens(52, 27)).toBe(2);
    expect(columnDifference(52, 27)).toBe(25);
    // equal ones need nothing
    expect(needsBorrow(47, 27)).toBe(false);
    expect(columnDifference(47, 27)).toBe(20);
  });

  it('the columns always produce the ordinary difference', () => {
    for (let a = 20; a <= 99; a += 9) {
      for (let b = 10; b < a; b += 13) {
        expect(columnDifference(a, b), `${a} − ${b}`).toBe(a - b);
      }
    }
  });

  it('refuses a negative difference rather than inventing one', () => {
    expect(() => columnDifference(23, 45)).toThrow(RangeError);
  });

  it('a subtraction is checked by adding the answer back', () => {
    expect(checkDifference(68, 45, 23)).toBe(true);
    expect(checkDifference(68, 45, 24)).toBe(false);
    expect(differenceParts(52, 27)).toEqual({ onesBefore: 2, onesAfter: 5, borrow: true, tensBefore: 5, tensAfter: 3, total: 25 });
  });
});

describe('word problems: the operation comes from what happens, not from the words', () => {
  it('a quantity that grows is added, one that shrinks is subtracted', () => {
    expect(operationOf('join')).toBe('add');
    expect(operationOf('separate')).toBe('subtract');
    expect(storyAnswer('join', 42, 25)).toBe(67);
    expect(storyAnswer('separate', 52, 19)).toBe(33);
    expect(opSign('add')).toBe('+');
    expect(opSign('subtract')).toBe('−');
  });

  it('an answer has to make sense in the story', () => {
    expect(answerMakesSense('separate', 52, 19, 33)).toBe(true);
    expect(answerMakesSense('separate', 52, 19, -3)).toBe(false);
    expect(answerMakesSense('separate', 52, 19, 71)).toBe(false);
    expect(answerMakesSense('join', 42, 25, 67)).toBe(true);
    expect(answerMakesSense('join', 42, 25, 120)).toBe(false);
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

describe('checking: the sum written in columns', () => {
  const plain = q({ type: 'column-sum', a: 34, b: 25, op: 'add' });

  it('wants the right digit in each column', () => {
    expect(evaluateAnswer(plain, '5,9').verdict).toBe('correct');
    expect(evaluateAnswer(plain, '9,5').verdict).toBe('incorrect');
    expect(evaluateAnswer(plain, '5,').verdict).toBe('incomplete');
    expect(evaluateAnswer(plain, '').verdict).toBe('incomplete');
  });

  it('a transposed answer is named as a transposition, not a plain mistake', () => {
    const flipped = evaluateAnswer(plain, '9,5');
    expect(flipped.misconceptionId).toBe('transposed');
    expect(flipped.feedback).toContain('აირია');
  });

  it('a carry has to happen when the ones reach ten', () => {
    const carry = q({ type: 'column-sum', a: 58, b: 27, op: 'add' });
    expect(evaluateAnswer(carry, '8,5').verdict).toBe('correct');
    // ones right, tens forgot the carried ten (5 + 2 = 7 instead of 8)
    const forgot = evaluateAnswer(carry, '7,5');
    expect(forgot.verdict).toBe('incorrect');
    expect(forgot.misconceptionId).toBe('forgot-carry');
  });

  it('subtracting in columns accounts for a broken ten', () => {
    const borrow = q({ type: 'column-sum', a: 71, b: 46, op: 'subtract' });
    expect(evaluateAnswer(borrow, '2,5').verdict).toBe('correct');
    // tens not reduced after the break
    const forgot = evaluateAnswer(borrow, '3,5');
    expect(forgot.verdict).toBe('incorrect');
  });
});

describe('checking: the sum built step by step', () => {
  const plain = q({ type: 'sum-steps', a: 42, b: 36 });

  it('wants the ones first and then the tens', () => {
    expect(evaluateAnswer(plain, '8,7').verdict).toBe('correct');
    expect(evaluateAnswer(plain, '7,8').verdict).toBe('incorrect');
    expect(evaluateAnswer(plain, ',7').verdict).toBe('incomplete');
  });

  it('writing the whole ones total instead of carrying is named', () => {
    const carry = q({ type: 'sum-steps', a: 47, b: 16 });
    expect(evaluateAnswer(carry, '3,6').verdict).toBe('correct');
    const noCarry = evaluateAnswer(carry, '13,6');
    expect(noCarry.verdict).toBe('incorrect');
    expect(noCarry.misconceptionId).toBe('no-carry');
  });

  it('forgetting the carried ten in the tens column is named', () => {
    const carry = q({ type: 'sum-steps', a: 47, b: 16 });
    const forgot = evaluateAnswer(carry, '3,5');
    expect(forgot.verdict).toBe('incorrect');
    expect(forgot.misconceptionId).toBe('forgot-carry');
  });
});

describe('checking: the difference after breaking a ten', () => {
  const borrow = q({ type: 'difference-steps', a: 63, b: 38 });

  it('wants the difference, and only after the ten is broken', () => {
    expect(evaluateAnswer(borrow, '25').verdict).toBe('correct');
    expect(evaluateAnswer(borrow, '').verdict).toBe('incomplete');
  });

  it('subtracting the smaller from the bigger in the ones is named', () => {
    const wrong = evaluateAnswer(borrow, '35');
    expect(wrong.verdict).toBe('incorrect');
    expect(wrong.feedback.length).toBeGreaterThan(5);
  });
});

describe('checking: stories', () => {
  const join = q({ type: 'story-problem', kind: 'join', a: 34, b: 28, story: 'x', unit: 'ვაშლი' });
  const separate = q({ type: 'story-problem', kind: 'separate', a: 52, b: 19, story: 'y', unit: 'მგზავრი' });

  it('judges the operation from the quantities and the answer from the numbers', () => {
    expect(evaluateAnswer(join, 'add,62').verdict).toBe('correct');
    expect(evaluateAnswer(join, 'subtract,62').verdict).toBe('incorrect');
    expect(evaluateAnswer(join, 'add,60').verdict).toBe('incorrect');
    expect(evaluateAnswer(separate, 'subtract,33').verdict).toBe('correct');
  });

  it('a wrong operation gets its own feedback, not the generic line', () => {
    const wrong = evaluateAnswer(separate, 'add,33');
    expect(wrong.misconceptionId).toBe('operation');
    expect(wrong.feedback).toContain('მოქმედება');
  });

  it('choosing the operation before writing the answer is unfinished', () => {
    expect(evaluateAnswer(join, 'add,').verdict).toBe('incomplete');
    expect(evaluateAnswer(join, '').verdict).toBe('incomplete');
  });

  it('a right operation with the numbers combined the wrong way is named', () => {
    const flipped = evaluateAnswer(join, 'add,6');
    expect(flipped.verdict).toBe('incorrect');
  });
});

describe('checking: the answer can be described', () => {
  it('says the sum, the steps, the difference and the story', () => {
    expect(describeAnswer({ type: 'column-sum', a: 34, b: 25, op: 'add' })).toBe('34 + 25 = 59');
    expect(describeAnswer({ type: 'column-sum', a: 71, b: 46, op: 'subtract' })).toBe('71 − 46 = 25');
    expect(describeAnswer({ type: 'sum-steps', a: 47, b: 16 })).toContain('63');
    expect(describeAnswer({ type: 'difference-steps', a: 63, b: 38 })).toBe('63 − 38 = 25');
    expect(describeAnswer({ type: 'story-problem', kind: 'separate', a: 52, b: 19, story: '', unit: 'მგზავრი' })).toContain('33');
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
});

describe('content: the regrouping really is in the numbers', () => {
  it('U03.1 and U03.2 use only sums and differences that need no regroup', () => {
    for (const id of ['g2-u03-l1', 'g2-u03-l2']) {
      const l = LESSON_CONTENT[id];
      const pairs = questions(l)
        .map((x) => x.response)
        .filter((r) => r.type === 'column-sum' || r.type === 'sum-steps');
      expect(pairs.length, id).toBeGreaterThan(0);
      for (const r of pairs) {
        if (r.type === 'column-sum') {
          if (r.op === 'add') expect(needsCarry(r.a, r.b), `${id}: ${r.a}+${r.b}`).toBe(false);
          else expect(needsBorrow(r.a, r.b), `${id}: ${r.a}−${r.b}`).toBe(false);
        } else {
          expect(needsCarry(r.a, r.b), `${id}: ${r.a}+${r.b}`).toBe(false);
        }
      }
      // the labs on these lessons start from sums that do not need a regroup either
      const explore = l.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>;
      if (explore.tool.tool === 'add-lab' || explore.tool.tool === 'subtract-lab') {
        for (const ex of explore.tool.examples) {
          const needed = id.endsWith('l1') ? needsCarry(ex.a, ex.b) : needsBorrow(ex.a, ex.b);
          expect(needed, `${id}: ${ex.a} ${ex.b}`).toBe(false);
        }
      }
    }
  });

  it('U03.3 and U03.4 really do need the regroup, and ask for it', () => {
    const add = LESSON_CONTENT['g2-u03-l3'];
    const sub = LESSON_CONTENT['g2-u03-l4'];
    const addPairs = questions(add).filter((x) => x.response.type === 'sum-steps' || (x.response.type === 'column-sum' && x.response.op === 'add'));
    for (const x of addPairs) {
      const r = x.response;
      if (r.type === 'sum-steps' || r.type === 'column-sum') expect(needsCarry(r.a, r.b), `U03.3/${x.id}`).toBe(true);
    }
    const subPairs = questions(sub).filter((x) => x.response.type === 'difference-steps' || (x.response.type === 'column-sum' && x.response.op === 'subtract'));
    expect(subPairs.length).toBeGreaterThan(0);
    for (const x of subPairs) {
      const r = x.response;
      if (r.type === 'difference-steps' || r.type === 'column-sum') expect(needsBorrow(r.a, r.b), `U03.4/${x.id}`).toBe(true);
    }
  });

  it('every story is answerable, and its answer makes sense in its own story', () => {
    const stories = lessons.flatMap((l) => questions(l).filter((x) => x.response.type === 'story-problem').map((x) => ({ l, x })));
    expect(stories.length).toBeGreaterThan(2);
    for (const { l, x } of stories) {
      const r = x.response as Extract<ResponseSpec, { type: 'story-problem' }>;
      const answer = storyAnswer(r.kind, r.a, r.b);
      expect(Number.isFinite(answer), `${l.id}/${x.id}`).toBe(true);
      expect(answer, `${l.id}/${x.id}`).toBeGreaterThanOrEqual(0);
      expect(answerMakesSense(r.kind, r.a, r.b, answer), `${l.id}/${x.id}`).toBe(true);
      expect(r.story.length, `${l.id}/${x.id}`).toBeGreaterThan(10);
      expect(r.unit.length, `${l.id}/${x.id}`).toBeGreaterThan(1);
      // the story is written with the numbers it actually uses
      expect(r.story, `${l.id}/${x.id}`).toContain(String(r.a));
      expect(r.story, `${l.id}/${x.id}`).toContain(String(r.b));
    }
  });

  it('every column question keeps its two numbers inside the two-digit range', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'column-sum' && r.type !== 'sum-steps' && r.type !== 'difference-steps') continue;
        expect(r.a, `${l.id}/${x.id}`).toBeGreaterThanOrEqual(10);
        expect(r.a, `${l.id}/${x.id}`).toBeLessThanOrEqual(99);
        expect(r.b, `${l.id}/${x.id}`).toBeGreaterThanOrEqual(10);
        expect(r.b, `${l.id}/${x.id}`).toBeLessThanOrEqual(99);
        if (r.type !== 'sum-steps') expect(r.type === 'column-sum' && r.op === 'subtract' ? r.a > r.b : true).toBe(true);
      }
  });
});

// ─────────────────────────── boards ───────────────────────────

describe('board: the columns', () => {
  it('writes each number digit by digit, aligned by place', () => {
    render(<SumColumns a={345 % 100} b={45} showAnswer />);
    // 45 + 45 = 90
    expect(text('.ac-row.is-total')).toContain('9');
    expect(text('.ac-row.is-total')).toContain('0');
    expect(screen.getByLabelText(/სვეტები: 45 \+ 45/)).toBeTruthy();
  });

  it('shows the carry only when there really is one', () => {
    render(<SumColumns a={38} b={24} showAnswer />);
    expect(text('.ac-carry')).toContain('1');
    expect(text('.ac-note')).toContain('1 ათეული');
    cleanup();
    render(<SumColumns a={23} b={45} showAnswer />);
    expect(document.querySelector('.ac-carry')).toBeNull();
  });

  it('never shows the answer while the student is working', () => {
    render(<SumColumns a={34} b={25} />);
    expect(text('.ac-blank')).toContain('?');
    expect(document.querySelector('.ac-row.is-total')).toBeNull();
  });

  it('the difference board names the broken ten when there is one', () => {
    render(<DifferenceColumns a={52} b={27} showAnswer />);
    expect(text('.ac-borrow-hint')).toContain('2 + 10');
    expect(text('.ac-note')).toContain('იშლება');
    cleanup();
    render(<DifferenceColumns a={68} b={45} showAnswer />);
    expect(document.querySelector('.ac-borrow-hint')).toBeNull();
  });

  it('blocks are drawn from the number, with the count written down', () => {
    render(<Blocks value={47} tone="a" noun="თავიდან" />);
    expect(document.querySelectorAll('.abk-rod')).toHaveLength(4);
    expect(document.querySelectorAll('.abk-cube')).toHaveLength(7);
    expect(text('.abk-count')).toContain('47');
  });
});

describe('board: writing the answer in columns', () => {
  const board = (value = '', onChange = vi.fn()) =>
    render(<ColumnAnswer response={{ a: 34, b: 25, op: 'add' }} value={value} onChange={onChange} disabled={false} label="ჯამი" />);

  it('each digit goes into its own column', () => {
    const onChange = vi.fn();
    board('', onChange);
    fireEvent.change(screen.getByLabelText('პასუხის ათეულები'), { target: { value: '5' } });
    expect(onChange).toHaveBeenLastCalledWith('5,');
  });

  it('only one digit fits in a column', () => {
    const onChange = vi.fn();
    board('', onChange);
    fireEvent.change(screen.getByLabelText('პასუხის ერთეულები'), { target: { value: '59' } });
    expect(onChange).toHaveBeenLastCalledWith(',5');
  });
});

describe('board: the sum built step by step', () => {
  it('asks for the ones first, then the tens, and names the carry', () => {
    const onChange = vi.fn();
    render(<SumStepsBoard response={{ a: 47, b: 16 }} value="" onChange={onChange} disabled={false} label="ნაბიჯები" />);
    expect(screen.getByLabelText('ერთეულები ჯამი')).toBeTruthy();
    expect(text('.ssb')).toContain('1 ათეული');
    fireEvent.change(screen.getByLabelText('ერთეულები ჯამი'), { target: { value: '3' } });
    expect(onChange).toHaveBeenLastCalledWith('3,');
  });

  it('marks a step once its digit is right', () => {
    render(<SumStepsBoard response={{ a: 47, b: 16 }} value="3,6" onChange={vi.fn()} disabled={false} label="ნაბიჯები" />);
    expect(document.querySelectorAll('.ssb-step.is-done')).toHaveLength(2);
  });
});

describe('board: the ten has to be broken before the answer', () => {
  it('keeps the answer locked until the ten is broken', () => {
    render(<DifferenceStepsBoard response={{ a: 63, b: 38 }} value="" onChange={vi.fn()} disabled={false} label="სხვაობა" />);
    const input = screen.getByLabelText('სხვაობა რიცხვით') as HTMLInputElement;
    expect(input.disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /გავხსენი 10 ერთეულად/ }));
    expect((screen.getByLabelText('სხვაობა რიცხვით') as HTMLInputElement).disabled).toBe(false);
    expect(document.querySelector('.btn.is-pressed, .btn[aria-pressed="true"]')).toBeTruthy();
  });

  it('does not ask for a break when the ones are big enough', () => {
    render(<DifferenceStepsBoard response={{ a: 68, b: 45 }} value="" onChange={vi.fn()} disabled={false} label="სხვაობა" />);
    expect(screen.queryByRole('button', { name: /გავხსენი/ })).toBeNull();
    expect((screen.getByLabelText('სხვაობა რიცხვით') as HTMLInputElement).disabled).toBe(false);
  });
});

describe('board: a story', () => {
  it('asks for the operation before the answer', () => {
    render(<StoryBoard response={{ kind: 'join', a: 34, b: 28, story: 'ბაღში 34 ვაშლი იყო. დაკრიფეს კიდევ 28.', unit: 'ვაშლი' }} value="" onChange={vi.fn()} disabled={false} label="ამოცანა" />);
    expect((screen.getByLabelText('პასუხი რიცხვით') as HTMLInputElement).disabled).toBe(true);
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(text('.stb-model')).toContain('34');
    expect(text('.stb-model')).toContain('28');
  });

  it('reports the chosen operation and the typed answer together', () => {
    // the board is controlled, as it is in the player: keep the value in state so the answer can be typed after the operation
    function Host() {
      const [v, setV] = useState('');
      return <StoryBoard response={{ kind: 'join', a: 34, b: 28, story: 'x', unit: 'ვაშლი' }} value={v} onChange={setV} disabled={false} label="ამოცანა" />;
    }
    render(<Host />);
    fireEvent.click(screen.getByRole('radio', { name: /შეკრება/ }));
    fireEvent.change(screen.getByLabelText('პასუხი რიცხვით'), { target: { value: '62' } });
    expect((screen.getByLabelText('პასუხი რიცხვით') as HTMLInputElement).value).toBe('62');
    // and the stored value carries both the operation and the answer, in that order
    expect(text('.stb-answer')).toContain('add,62');
  });
});

// ─────────────────────────── tools ───────────────────────────

const toolOf = (l: Lesson) => (l.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>).tool;

describe('tools: the adding mat', () => {
  it('puts the second number down as it is and reports the value', () => {
    render(<AddLab tool={{ tool: 'add-lab', examples: [{ a: 23, b: 45 }] }} />);
    expect(text('.lab-status')).toContain('23');
    fireEvent.click(screen.getByRole('button', { name: /დაამატე 45 ბლოკებით/ }));
    expect(text('.lab-status')).toContain('68');
    expect(text('.lab-facts')).toContain('68');
  });

  it('leaves 12 ones ungrouped so the student must exchange them', () => {
    render(<AddLab tool={{ tool: 'add-lab', examples: [{ a: 38, b: 24 }] }} />);
    fireEvent.click(screen.getByRole('button', { name: /დაამატე 24 ბლოკებით/ }));
    expect(text('.lab-status')).toContain('დაუჯგუფებელია');
    // ten ones can now be exchanged for one ten, and the value does not change
    fireEvent.click(screen.getByRole('button', { name: /10 ერთეულები გახადე 1 ათეული/ }));
    expect(text('.lab-status')).toContain('სტანდარტული');
    expect(text('.lab-facts')).toContain('62');
  });
});

describe('tools: the subtracting mat', () => {
  it('refuses to take when the ones are too small, and asks for a break', () => {
    render(<SubtractLab tool={{ tool: 'subtract-lab', examples: [{ a: 52, b: 27 }] }} />);
    expect(text('.lab-status')).toContain('დაშალე');
    expect((screen.getByRole('button', { name: /წაიღე 27/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('takes the number away once the ten is broken', () => {
    render(<SubtractLab tool={{ tool: 'subtract-lab', examples: [{ a: 52, b: 27 }] }} />);
    fireEvent.click(screen.getByRole('button', { name: /1 ათეული დაშალე 10 ერთეულად/ }));
    fireEvent.click(screen.getByRole('button', { name: /წაიღე 27/ }));
    expect(text('.lab-status')).toContain('25');
  });

  it('needs no break when the ones are big enough', () => {
    render(<SubtractLab tool={{ tool: 'subtract-lab', examples: [{ a: 68, b: 45 }] }} />);
    expect(text('.lab-status')).toContain('შეგიძლია წაიღო');
    fireEvent.click(screen.getByRole('button', { name: /წაიღე 45/ }));
    expect(text('.lab-status')).toContain('23');
  });
});

describe('tools: the columns lab and the story lab', () => {
  it('names the carry when one is needed and says there is none when not', () => {
    render(<ColumnsLab tool={{ tool: 'columns-lab', examples: [{ a: 58, b: 27, op: 'add' }, { a: 23, b: 45, op: 'add' }] }} />);
    expect(text('.lab-status')).toContain('გადადის');
    fireEvent.click(screen.getByRole('button', { name: /23 \+ 45/ }));
    expect(text('.lab-status')).toContain('გადატანა არ არის');
  });

  it('a story lab checks the operation and then the answer', () => {
    render(<StoryLab tool={{ tool: 'story-lab', stories: [{ kind: 'separate', text: 'ავტობუსში 52 მგზავრი იყო. გადმოვიდა 19.', a: 52, b: 19, unit: 'მგზავრი' }] }} />);
    fireEvent.click(screen.getByRole('radio', { name: /გამოკლება/ }));
    expect(text('.lab-status')).toContain('მოქმედება სწორია');
    fireEvent.change(screen.getByLabelText('პასუხი რიცხვით'), { target: { value: '33' } });
    expect(text('.lab-status')).toContain('✓');
    expect(text('.lab-status')).toContain('33');
  });
});

describe('tools: the demonstrations', () => {
  it('the carry story names the carried ten', () => {
    render(<SumDemo block={{ type: 'sum-demo', mode: 'carry', a: 38, b: 24, steps: ['ა', 'ბ', 'გ', 'დ'] }} />);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(text('.demo-rule')).toContain('38 + 24 = 62');
    expect(text('.demo-rule')).toContain('გადადის');
  });

  it('the borrow story names the broken ten', () => {
    render(<DifferenceDemo block={{ type: 'difference-demo', mode: 'borrow', a: 52, b: 27, steps: ['ა', 'ბ', 'გ', 'დ', 'ე'] }} />);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(text('.demo-rule')).toContain('52 − 27 = 25');
    expect(text('.demo-rule')).toContain('იშლება');
  });

  it('the story demo shows the number sentence on the way', () => {
    render(<SumStoryDemo block={{ type: 'story-demo2', kind: 'join', a: 42, b: 25, text: 'ბუშტები', unit: 'ბუშტი', steps: ['ა', 'ბ', 'გ', 'დ'] }} />);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(text('.demo-rule')).toContain('42 + 25 = 67');
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
    case 'column-sum': {
      const total = r.op === 'add' ? columnSum(r.a, r.b) : columnDifference(r.a, r.b);
      fireEvent.change(screen.getByLabelText('პასუხის ათეულები'), { target: { value: String(Math.floor(total / 10)) } });
      fireEvent.change(screen.getByLabelText('პასუხის ერთეულები'), { target: { value: String(total % 10) } });
      break;
    }
    case 'sum-steps': {
      const total = columnSum(r.a, r.b);
      fireEvent.change(screen.getByLabelText('ერთეულები ჯამი'), { target: { value: String(total % 10) } });
      fireEvent.change(screen.getByLabelText('ათეულები ჯამი'), { target: { value: String(Math.floor(total / 10)) } });
      break;
    }
    case 'difference-steps': {
      if (needsBorrow(r.a, r.b)) fireEvent.click(screen.getByRole('button', { name: /გავხსენი 10 ერთეულად/ }));
      fireEvent.change(screen.getByLabelText('სხვაობა რიცხვით'), { target: { value: String(columnDifference(r.a, r.b)) } });
      break;
    }
    case 'story-problem': {
      const wanted = r.kind === 'separate' ? 'გამოკლება' : 'შეკრება';
      fireEvent.click(screen.getByRole('radio', { name: new RegExp(wanted) }));
      fireEvent.change(screen.getByLabelText('პასუხი რიცხვით'), { target: { value: String(storyAnswer(r.kind, r.a, r.b)) } });
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

describe('g2-u03 unit page', () => {
  it('lists the five lessons, all playable and in order', () => {
    go('#/student/lessons/g2-u03');
    const list = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(list).toHaveLength(5);
    U03.forEach((id, i) => expect(within(list[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
  });
});

describe.each(U03.map((id) => [id] as const))('%s plays to the end', (id) => {
  it('every step works with its own correct answers and the progress is saved', () => {
    const lesson = LESSON_CONTENT[id];
    go(`#/student/lessons/${id}`);
    expect(screen.getByText(`ნაბიჯი 1 / ${lesson.activities.length}`)).toBeTruthy();
    playThrough(lesson);
    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    const checks = stageOf(lesson, 'check').length;
    expect(screen.getByText(`${checks} / ${checks}`)).toBeTruthy();
    expect(saved()[id]).toMatchObject({ status: 'completed', checkCorrect: checks, checkTotal: checks });
    if (id !== 'g2-u03-l5') {
      expect(screen.getByRole('link', { name: 'გაგრძელება: U03.' + (Number(id.slice(-1)) + 1) }).getAttribute('href')).toBe(
        `#/student/lessons/g2-u03-l${Number(id.slice(-1)) + 1}`,
      );
    } else {
      expect(screen.getByRole('link', { name: 'U03-ზე დაბრუნება' })).toBeTruthy();
    }
  });
});

describe('feedback is aimed at the real mistake', () => {
  it('a forgotten carry is named, not just marked wrong', () => {
    go('#/student/lessons/g2-u03-l3');
    const lesson = LESSON_CONTENT['g2-u03-l3'];
    const stop = lesson.activities.findIndex((a) => a.id === 'practice-1');
    lesson.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    // 47 + 16 = 63; writing ones 3 and tens 5 forgets the carried ten
    fireEvent.change(screen.getByLabelText('ერთეულები ჯამი'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('ათეულები ჯამი'), { target: { value: '5' } });
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('ათეული');
  });

  it('a story with the wrong operation says the quantity grows or shrinks', () => {
    go('#/student/lessons/g2-u03-l5');
    const lesson = LESSON_CONTENT['g2-u03-l5'];
    const stop = lesson.activities.findIndex((a) => a.id === 'practice-1');
    lesson.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    // 34 + 28: choosing subtraction is the classic slip
    fireEvent.click(screen.getByRole('radio', { name: /გამოკლება/ }));
    fireEvent.change(screen.getByLabelText('პასუხი რიცხვით'), { target: { value: '62' } });
    submit();
    expect(feedback()).toContain('მოქმედება');
  });

  it('a difference typed before the ten is broken is unfinished, not wrong', () => {
    go('#/student/lessons/g2-u03-l4');
    const lesson = LESSON_CONTENT['g2-u03-l4'];
    const stop = lesson.activities.findIndex((a) => a.id === 'practice-1');
    lesson.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    submit();
    expect(feedback()).toContain('გახსენი');
  });
});

describe('style: motion, layout and honest labels', () => {
  const css = readFileSync('src/lessons/learn.css', 'utf8');
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));

  it('the new boards are switched off under reduced motion', () => {
    for (const cls of ['.ac-cell', '.ssb-step', '.abk-rod', '.abk-cube']) expect(reduced, cls).toContain(cls);
  });

  it('the columns get narrower on a phone, and the answer stacks', () => {
    const small = css.slice(css.indexOf('@media (max-width: 560px)'));
    expect(small).toContain('.ac-row');
    expect(small).toContain('.aca-answer');
  });

  it('every column is labelled by its place, never only by position', () => {
    render(<SumColumns a={38} b={24} showAnswer />);
    const rows = Array.from(document.querySelectorAll('.ac-row'))
      .map((r) => r.getAttribute('aria-label'))
      .filter((label): label is string => label !== null);
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(rows[0]).toContain('ათეულები');
    expect(rows[0]).toContain('ერთეულები');
    cleanup();
    render(<ColumnAnswer response={{ a: 34, b: 25, op: 'add' }} value="" onChange={vi.fn()} disabled={false} label="ჯამი" />);
    expect(screen.getByLabelText('პასუხის ათეულები')).toBeTruthy();
    expect(screen.getByLabelText('პასუხის ერთეულები')).toBeTruthy();
  });

  it('a carry is said in words, not only drawn', () => {
    render(<SumColumns a={38} b={24} showAnswer />);
    expect(text('.ac-note')).toContain('1 ათეული');
    expect(text('.ac-note')).toContain('გადადის');
  });
});
