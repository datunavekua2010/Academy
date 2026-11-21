// @vitest-environment jsdom
import './helpers/signed-in-student';
import { useState } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';
import { LESSON_CONTENT } from '../src/lessons/content';
import { describeAnswer, evaluateAnswer } from '../src/lessons/check';
import { getUnit } from '../src/lessons/catalog';
import { JumpBoard, JumpExplore, landing, pathOf } from '../src/lessons/exercises/JumpTools';
import { MakeTenBoard, MakeTenExplore, tenSplit } from '../src/lessons/exercises/MakeTenTools';
import { DoublesLab, PairedGroups, classify, joinedSlot, pairedSlot } from '../src/lessons/exercises/DoublesTools';
import { StoryWorkspace, judgeStory, resultOf } from '../src/lessons/exercises/StoryTools';
import { TakeAwayBoard, takeAwayGeometry, takeAwaySlot } from '../src/lessons/exercises/TakeAwayBoard';
import type { Activity, Lesson, QuestionActivity, ResponseSpec, VisualSpec } from '../src/lessons/types';

/**
 * Grade 1 · Unit 4 "Mental Addition & Subtraction Strategies" placeholder lessons: the maths in the
 * demonstration data, the answer checking of the new response types, the new components and a
 * data-driven walk through all five lessons in the real player. Dragging and touch have not been
 * tried on a device (there is no browser here); taps are simulated with click events.
 */

const IDS = ['g1-u04-l1', 'g1-u04-l2', 'g1-u04-l3', 'g1-u04-l4', 'g1-u04-l5'];
const lessons: Lesson[] = IDS.map((id) => LESSON_CONTENT[id]);
const [L1, L2, L3, L4, L5] = lessons;
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);
const byId = <T extends Activity>(l: Lesson, id: string): T => l.activities.find((a) => a.id === id) as T;

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 1 U04 is "Mental Addition & Subtraction Strategies"', () => {
  it('has the five approved titles and the ids g1-u04-l1 … l5', () => {
    const unit = getUnit('g1-u04');
    expect(unit?.title).toBe('Mental Addition & Subtraction Strategies');
    expect(unit?.lessons.map((l) => l.title)).toEqual(['Adding by Counting On', 'Subtracting by Counting Back', 'Making 10 to Add', 'Using Doubles and Near Doubles', 'Solving Addition and Subtraction Word Problems']);
    expect(unit?.lessons.map((l) => l.id)).toEqual(IDS);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U04.1', 'U04.2', 'U04.3', 'U04.4', 'U04.5']);
  });
});

// ─────────────────────────── pure helpers ───────────────────────────

describe('number-line helpers', () => {
  it('forward jumps add, backward jumps subtract, one step per jump', () => {
    expect(landing(6, 3, true)).toBe(9);
    expect(landing(8, 3, false)).toBe(5);
    expect(pathOf(6, 3, true)).toEqual([6, 7, 8, 9]);
    expect(pathOf(8, 3, false)).toEqual([8, 7, 6, 5]);
    expect(pathOf(4, 0, true)).toEqual([4]);
  });
});

describe('making ten: the split of the second group', () => {
  it('moves exactly the empty spaces, and the rest stays outside', () => {
    expect(tenSplit(8, 5, 8)).toEqual({ moved: 0, rest: 5, full: false });
    expect(tenSplit(8, 5, 9)).toEqual({ moved: 1, rest: 4, full: false });
    expect(tenSplit(8, 5, 10)).toEqual({ moved: 2, rest: 3, full: true });
    // pulling a counter back out never gives a negative move
    expect(tenSplit(8, 5, 6)).toEqual({ moved: 0, rest: 5, full: false });
    // 8 + 5 = 8 + 2 + 3 = 10 + 3 = 13 for every example in the data
    for (const l of [L3]) {
      for (const a of l.activities) {
        const examples = a.kind === 'explore' && a.tool.tool === 'make-ten' ? a.tool.examples : [];
        for (const { a: x, b } of examples) {
          const s = tenSplit(x, b, 10);
          expect(s.moved).toBe(10 - x);
          expect(x + s.moved + s.rest).toBe(x + b);
          expect(10 + s.rest).toBe(x + b);
        }
      }
    }
  });
});

describe('doubles geometry', () => {
  it('classifies groups as equal, differing by one, or far apart', () => {
    expect(classify(4, 4)).toBe('equal');
    expect(classify(4, 5)).toBe('near');
    expect(classify(5, 4)).toBe('near');
    expect(classify(3, 6)).toBe('far');
  });
  it('keeps every counter inside the board, paired or joined', () => {
    for (let widest = 1; widest <= 8; widest += 1) {
      for (let i = 0; i < widest; i += 1) {
        for (const side of ['a', 'b'] as const) {
          const p = pairedSlot(side, i, widest);
          expect(p.x - p.size / 2).toBeGreaterThanOrEqual(14);
          expect(p.x + p.size / 2).toBeLessThanOrEqual(100);
          expect(p.y).toBe(side === 'a' ? 13 : 35);
        }
      }
    }
    for (let n = 0; n < 15; n += 1) {
      const p = joinedSlot(n);
      expect(p.x).toBeGreaterThan(10);
      expect(p.x).toBeLessThan(90);
      expect(p.y).toBeLessThan(45);
    }
  });
  it('slots of one group never overlap', () => {
    for (let widest = 1; widest <= 8; widest += 1) {
      const xs = Array.from({ length: widest }, (_, i) => pairedSlot('a', i, widest));
      for (let i = 1; i < xs.length; i += 1) expect(xs[i].x - xs[i - 1].x).toBeGreaterThan(xs[i].size);
    }
  });
});

describe('take-away geometry', () => {
  it('has a slot for every object in the group and in the tray, inside the board', () => {
    for (const total of [3, 5, 7, 10, 12]) {
      const g = takeAwayGeometry(total);
      for (let i = 0; i < total; i += 1) {
        for (const tray of [false, true]) {
          const c = takeAwaySlot(g, i, tray);
          expect(c.x).toBeGreaterThan(7);
          expect(c.x).toBeLessThan(93);
          expect(c.y).toBeGreaterThan(0);
          expect(c.y).toBeLessThan(g.height);
        }
      }
      expect(takeAwaySlot(g, 0, true).y).toBeGreaterThan(takeAwaySlot(g, total - 1, false).y);
    }
  });
});

describe('story judgement', () => {
  const join = { mode: 'join' as const, glyph: 'fish' as const, text: 't', first: 5, change: 4 };
  const away = { mode: 'separate' as const, glyph: 'ball' as const, text: 't', first: 8, change: 3 };
  it('results and signs follow the story', () => {
    expect(resultOf('join', 5, 4)).toBe(9);
    expect(resultOf('separate', 8, 3)).toBe(5);
  });
  it('compares the picture first, then the sign, and never names the number before the picture is right', () => {
    expect(judgeStory(join, 5, null).tone).toBe('info');
    expect(judgeStory(join, 3, '+').tone).toBe('no');
    expect(judgeStory(away, 11, '−').tone).toBe('no');
    expect(judgeStory(join, 8, '+').text).toContain('4-ით');
    expect(judgeStory(join, 8, '+').text).not.toContain('9');
    expect(judgeStory(join, 9, null).tone).toBe('info');
    expect(judgeStory(join, 9, '−').tone).toBe('no');
    expect(judgeStory(away, 5, '+').tone).toBe('no');
    expect(judgeStory(join, 9, '+')).toMatchObject({ tone: 'ok' });
    expect(judgeStory(join, 9, '+').text).toContain('5 + 4 = 9');
    expect(judgeStory(away, 5, '−').text).toContain('8 − 3 = 5');
  });
});

// ─────────────────────────── answer checking ───────────────────────────

const dummy = { hints: ['h'], explanation: 'e' };
const q = (response: ResponseSpec, extra: Partial<QuestionActivity> = {}): QuestionActivity => ({ id: 'q', kind: 'question', stage: 'practice', prompt: 'p', ...dummy, response, ...extra });

describe('check: jumps', () => {
  const plus = q({ type: 'jumps', direction: 'forward', min: 0, max: 12, from: 6, count: 2, pickStart: true }, {
    misconceptions: [
      { id: 'swapped', answers: ['swapped'], feedback: 'S' },
      { id: 'start', answers: ['start'], feedback: 'T' },
      { id: 'few', answers: ['few'], feedback: 'F' },
      { id: 'many', answers: ['many'], feedback: 'M' },
    ],
  });
  it('is right when the jumps start at the chosen number and there are exactly the right number', () => {
    expect(evaluateAnswer(plus, '6,2').verdict).toBe('correct');
  });
  it('is incomplete (no attempt lost) until a start is chosen and a jump is made', () => {
    expect(evaluateAnswer(plus, '').verdict).toBe('incomplete');
    expect(evaluateAnswer(plus, '6,0').verdict).toBe('incomplete');
    expect(evaluateAnswer(plus, ',0').verdict).toBe('incomplete');
    expect(evaluateAnswer(plus, '6,0').feedback).toContain('ნახტომ');
    expect(evaluateAnswer(plus, '').feedback).toContain('შეეხე');
  });
  it('tells apart: other start, swapped numbers, too few, too many', () => {
    expect(evaluateAnswer(plus, '2,6')).toMatchObject({ verdict: 'incorrect', misconceptionId: 'swapped' });
    expect(evaluateAnswer(plus, '3,2')).toMatchObject({ verdict: 'incorrect', misconceptionId: 'start' });
    expect(evaluateAnswer(plus, '6,1')).toMatchObject({ verdict: 'incorrect', misconceptionId: 'few' });
    expect(evaluateAnswer(plus, '6,4')).toMatchObject({ verdict: 'incorrect', misconceptionId: 'many' });
  });
  it('accepts the swapped start only when the data allows it', () => {
    const lenient = q({ type: 'jumps', direction: 'forward', min: 0, max: 12, from: 6, count: 2, pickStart: true, swapOk: true });
    expect(evaluateAnswer(lenient, '2,6').verdict).toBe('correct');
    expect(evaluateAnswer(lenient, '6,2').verdict).toBe('correct');
  });
  it('a fixed start needs no choice; backward jumps never accept the swap', () => {
    const fixed = q({ type: 'jumps', direction: 'forward', min: 0, max: 12, from: 4, count: 3 });
    expect(evaluateAnswer(fixed, ',3').verdict).toBe('correct');
    const back = q({ type: 'jumps', direction: 'back', min: 0, max: 12, from: 9, count: 3, pickStart: true, swapOk: true }, { misconceptions: [{ id: 'start', answers: ['start'], feedback: 'T' }] });
    expect(evaluateAnswer(back, '9,3').verdict).toBe('correct');
    expect(evaluateAnswer(back, '3,9')).toMatchObject({ verdict: 'incorrect', misconceptionId: 'start' });
  });
  it('doubles 3 + 3 are the same either way round', () => {
    const same = q({ type: 'jumps', direction: 'forward', min: 0, max: 12, from: 3, count: 3, pickStart: true });
    expect(evaluateAnswer(same, '3,3').verdict).toBe('correct');
  });
  it('the revealed answer names the start and the number of jumps', () => {
    expect(describeAnswer(plus.response)).toContain('6');
    expect(describeAnswer(plus.response)).toContain('2');
  });
});

describe('check: takeaway', () => {
  const t = q({ type: 'takeaway', total: 7, remove: 3, glyph: 'apple' }, { misconceptions: [{ id: 'few', answers: ['few'], feedback: 'F' }, { id: 'many', answers: ['many'], feedback: 'M' }] });
  it('is right when exactly the amount to take away has left the group, whichever objects they are', () => {
    expect(evaluateAnswer(t, '0,1,2').verdict).toBe('correct');
    expect(evaluateAnswer(t, '6,2,4').verdict).toBe('correct');
  });
  it('nothing taken is incomplete; too few and too many are different mistakes', () => {
    expect(evaluateAnswer(t, '').verdict).toBe('incomplete');
    expect(evaluateAnswer(t, '1,2')).toMatchObject({ verdict: 'incorrect', misconceptionId: 'few' });
    expect(evaluateAnswer(t, '0,1,2,3')).toMatchObject({ verdict: 'incorrect', misconceptionId: 'many' });
    expect(describeAnswer(t.response)).toContain('3');
  });
});

describe('check: make-ten', () => {
  const m = q({ type: 'make-ten', a: 8, b: 5 }, { fallbackFeedback: 'FB' });
  it('is right when the frame is exactly full', () => {
    expect(evaluateAnswer(m, '10').verdict).toBe('correct');
  });
  it('an untouched frame is incomplete; a part-filled frame is wrong but does not say how many', () => {
    expect(evaluateAnswer(m, '').verdict).toBe('incomplete');
    expect(evaluateAnswer(m, '8').verdict).toBe('incomplete');
    expect(evaluateAnswer(m, '6').verdict).toBe('incomplete');
    const r = evaluateAnswer(m, '9');
    expect(r.verdict).toBe('incorrect');
    expect(r.feedback).toBe('FB');
    expect(describeAnswer(m.response)).toContain('2');
  });
});

describe('check: story', () => {
  const s = q({ type: 'story', operation: 'subtract', answer: 7 }, { misconceptions: [{ id: 'operation', answers: ['operation'], feedback: 'OP' }, { id: 'added', answers: [15], feedback: 'ADD' }] });
  it('needs the operation and the number', () => {
    expect(evaluateAnswer(s, '').verdict).toBe('incomplete');
    expect(evaluateAnswer(s, ',7').verdict).toBe('incomplete');
    expect(evaluateAnswer(s, '-,').verdict).toBe('incomplete');
    expect(evaluateAnswer(s, '-').verdict).toBe('incomplete');
    expect(evaluateAnswer(s, '-,x').verdict).toBe('incomplete');
  });
  it('the right operation and the right number is correct', () => {
    expect(evaluateAnswer(s, '-,7').verdict).toBe('correct');
  });
  it('a wrong operation sends the student back to the story, even if the number happens to match', () => {
    expect(evaluateAnswer(s, '+,7')).toMatchObject({ verdict: 'incorrect', misconceptionId: 'operation', feedback: 'OP' });
    expect(evaluateAnswer(s, '+,19')).toMatchObject({ verdict: 'incorrect', misconceptionId: 'operation' });
  });
  it('the right operation with a wrong number is judged by the number', () => {
    expect(evaluateAnswer(s, '-,15')).toMatchObject({ verdict: 'incorrect', misconceptionId: 'added' });
    expect(evaluateAnswer(s, '-,3').verdict).toBe('incorrect');
    expect(describeAnswer(s.response)).toContain('7');
  });
});

// ─────────────────────────── data: the maths ───────────────────────────

const visualsOf = (a: Activity): VisualSpec[] => {
  if (a.kind !== 'question') return [];
  const out: VisualSpec[] = a.visual ? [a.visual] : [];
  if (a.response.type === 'choice') for (const o of a.response.options) if (o.visual) out.push(o.visual);
  return out;
};

describe('U04 data: structure', () => {
  it('has five placeholder lessons with the shared flow and distinct explore tools', () => {
    expect(lessons).toHaveLength(5);
    for (const l of lessons) {
      expect(l.status).toBe('placeholder');
      expect(l.completion.minCheckCorrect).toBe(2);
      expect(l.concepts?.length).toBeGreaterThanOrEqual(3);
      const stages = l.activities.map((a) => a.stage);
      expect([...new Set(stages)]).toEqual(['challenge', 'explore', 'understand', 'practice', 'check']);
      expect(stageOf(l, 'practice')).toHaveLength(3);
      expect(stageOf(l, 'check')).toHaveLength(3);
      expect(new Set(l.activities.map((a) => a.id)).size).toBe(l.activities.length);
    }
    const tools = lessons.map((l) => (l.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>).tool.tool);
    expect(tools).toEqual(['jump-line', 'jump-line', 'make-ten', 'doubles-lab', 'story-workspace']);
    const forward = (byId<Extract<Activity, { kind: 'explore' }>>(L1, 'explore').tool as { direction: string }).direction;
    const back = (byId<Extract<Activity, { kind: 'explore' }>>(L2, 'explore').tool as { direction: string }).direction;
    expect([forward, back]).toEqual(['forward', 'back']);
  });

  it('every lesson uses a different set of answer types in practice (not one template with other numbers)', () => {
    const kinds = lessons.map((l) => stageOf(l, 'practice').map((x) => x.response.type).join('|'));
    expect(new Set(kinds).size).toBe(5);
  });

  it('guided questions have hints; independent-check questions have none', () => {
    for (const l of lessons) {
      for (const x of [...stageOf(l, 'challenge'), ...stageOf(l, 'practice')]) expect(x.hints.length, `${l.id}/${x.id}`).toBeGreaterThan(0);
      for (const x of stageOf(l, 'check')) expect(x.hints, `${l.id}/${x.id}`).toEqual([]);
    }
  });

  it('challenge questions never reveal their answer when attempts run out; every question has an explanation and a fallback', () => {
    for (const l of lessons) {
      for (const x of stageOf(l, 'challenge')) expect(x.revealOnExhaust, `${l.id}/${x.id}`).toBe(false);
      for (const x of questions(l)) {
        expect(x.explanation.length).toBeGreaterThan(5);
        expect(x.fallbackFeedback, `${l.id}/${x.id}`).toBeTruthy();
      }
    }
  });

  it('check questions do not repeat the challenge or the demonstration problem', () => {
    const text = (a: Activity) => JSON.stringify(a.kind === 'question' ? [a.prompt, a.visual, a.response] : []);
    for (const l of lessons) {
      const challenge = new Set(stageOf(l, 'challenge').map(text));
      for (const x of stageOf(l, 'check')) expect(challenge.has(text(x))).toBe(false);
    }
    // the demonstration problems are 6 + 3, 8 − 3, 8 + 5 and 4 + 5: no check asks them as its only problem
    expect(stageOf(L1, 'check').map((x) => x.prompt).join(' ')).not.toMatch(/6 \+ 3/);
    expect(stageOf(L2, 'check').map((x) => x.prompt).join(' ')).not.toMatch(/8 − 3/);
    expect(stageOf(L3, 'check').map((x) => x.prompt).join(' ')).not.toMatch(/8 \+ 5/);
    expect(stageOf(L4, 'check').map((x) => x.prompt).join(' ')).not.toMatch(/4 \+ 5/);
  });

  it('accepts the stored answer of every question and routes every stored misconception to its own feedback', () => {
    const correct = (r: ResponseSpec): string | string[] => {
      switch (r.type) {
        case 'choice':
          return r.answer;
        case 'numeric':
          return String(r.answer);
        case 'blanks':
          return r.answers.map(String);
        case 'jumps':
          return `${r.from},${r.count}`;
        case 'takeaway':
          return Array.from({ length: r.remove }, (_, i) => i).join(',');
        case 'make-ten':
          return '10';
        case 'story':
          return `${r.operation === 'add' ? '+' : '-'},${r.answer}`;
        default:
          throw new Error(r.type);
      }
    };
    for (const l of lessons) {
      for (const x of questions(l)) {
        expect(evaluateAnswer(x, correct(x.response)).verdict, `${l.id}/${x.id}`).toBe('correct');
        for (const m of x.misconceptions ?? []) {
          for (const wrong of m.answers) {
            let input: string | string[];
            const r = x.response;
            if (r.type === 'blanks') input = String(wrong).split(',');
            else if (r.type === 'story') input = typeof wrong === 'number' ? `${r.operation === 'add' ? '+' : '-'},${wrong}` : `${r.operation === 'add' ? '-' : '+'},${r.answer}`;
            else if (r.type === 'jumps') input = wrong === 'swapped' ? `${r.count},${r.from}` : wrong === 'start' ? `${r.from === 0 ? 1 : r.from - 1},${r.count}` : wrong === 'few' ? `${r.from},${r.count - 1}` : `${r.from},${r.count + 1}`;
            else if (r.type === 'takeaway') input = wrong === 'few' ? Array.from({ length: r.remove - 1 }, (_, i) => i).join(',') : Array.from({ length: r.remove + 1 }, (_, i) => i).join(',');
            else input = String(wrong);
            const result = evaluateAnswer(x, input);
            expect(result.verdict, `${l.id}/${x.id}:${wrong}`).toBe('incorrect');
            expect(result.misconceptionId, `${l.id}/${x.id}:${wrong}`).toBe(m.id);
          }
        }
      }
    }
  });
});

describe('U04 data: every picture matches its numbers', () => {
  it('number-line jumps stay on the line and go the right way', () => {
    let checked = 0;
    for (const l of lessons) {
      for (const a of l.activities) {
        for (const v of visualsOf(a)) {
          if (v.type !== 'jump-line') continue;
          checked += 1;
          const end = landing(v.from, v.count, v.direction === 'forward');
          expect(v.from, `${l.id}/${a.id}`).toBeGreaterThanOrEqual(v.min);
          expect(v.from).toBeLessThanOrEqual(v.max);
          expect(end, `${l.id}/${a.id}`).toBeGreaterThanOrEqual(v.min);
          expect(end, `${l.id}/${a.id}`).toBeLessThanOrEqual(v.max);
          if (a.kind === 'question' && a.response.type === 'numeric') expect(a.response.answer, `${l.id}/${a.id}`).toBe(end);
        }
        if (a.kind === 'question' && a.response.type === 'jumps') {
          const r = a.response;
          const end = landing(r.from, r.count, r.direction === 'forward');
          expect(r.from).toBeGreaterThanOrEqual(r.min);
          expect(end, `${l.id}/${a.id}`).toBeGreaterThanOrEqual(r.min);
          expect(end, `${l.id}/${a.id}`).toBeLessThanOrEqual(r.max);
          // the prompt names the same numbers
          const sign = r.direction === 'forward' ? '\\+' : '−';
          expect(a.prompt, `${l.id}/${a.id}`).toMatch(new RegExp(`(${Math.max(r.from, r.count)} ${sign} ${Math.min(r.from, r.count)}|${Math.min(r.from, r.count)} ${sign} ${Math.max(r.from, r.count)}|${r.from} ${sign} ${r.count})`));
        }
        if (a.kind === 'explain') {
          for (const b of a.blocks) {
            if (b.type !== 'jump-demo') continue;
            const end = landing(b.from, b.count, b.mode === 'on');
            expect(end, `${l.id}/${a.id}`).toBeGreaterThanOrEqual(b.min);
            expect(end, `${l.id}/${a.id}`).toBeLessThanOrEqual(b.max);
            expect(b.steps).toHaveLength(4);
          }
        }
        if (a.kind === 'explore' && a.tool.tool === 'jump-line') {
          const t = a.tool;
          for (const e of t.examples) {
            const start = Math.max(e.a, e.b);
            const end = t.direction === 'forward' ? e.a + e.b : e.a - e.b;
            expect(end).toBeGreaterThanOrEqual(t.min);
            expect(t.direction === 'forward' ? start + Math.min(e.a, e.b) : e.a).toBeLessThanOrEqual(t.max);
            if (t.direction === 'back') expect(e.b).toBeLessThanOrEqual(e.a);
          }
        }
      }
    }
    expect(checked).toBeGreaterThanOrEqual(3);
  });

  it('story pictures and story answers agree: the sign follows the story, the answer follows the numbers', () => {
    let pairs = 0;
    for (const l of lessons) {
      for (const a of l.activities) {
        if (a.kind === 'question' && a.visual?.type === 'story' && a.response.type === 'story') {
          pairs += 1;
          expect(a.response.operation, `${l.id}/${a.id}`).toBe(a.visual.mode === 'join' ? 'add' : 'subtract');
          expect(a.response.answer, `${l.id}/${a.id}`).toBe(resultOf(a.visual.mode, a.visual.first, a.visual.change));
          expect(a.prompt).toContain(String(a.visual.first));
          expect(a.prompt).toContain(String(a.visual.change));
        }
        if (a.kind === 'question' && a.visual?.type === 'story' && a.response.type === 'numeric') {
          expect(a.response.answer, `${l.id}/${a.id}`).toBe(resultOf(a.visual.mode, a.visual.first, a.visual.change));
        }
        if (a.kind === 'explain') {
          for (const b of a.blocks) {
            if (b.type !== 'story-demo') continue;
            expect(b.steps).toHaveLength(7);
            const result = resultOf(b.mode, b.first, b.change);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(b.text).toContain(String(b.first));
            expect(b.text).toContain(String(b.change));
            // the demonstration states the equation it shows
            expect(b.steps.join(' ')).toContain(`${b.first} ${b.mode === 'join' ? '+' : '−'} ${b.change}`);
            expect(b.caption).toContain(`= ${result}`);
          }
        }
        if (a.kind === 'explore' && a.tool.tool === 'story-workspace') {
          const modes = new Set(a.tool.stories.map((s) => s.mode));
          expect([...modes].sort()).toEqual(['join', 'separate']);
          for (const s of a.tool.stories) {
            expect(s.text).toContain(String(s.first));
            expect(s.text).toContain(String(s.change));
            expect(resultOf(s.mode, s.first, s.change)).toBeGreaterThan(0);
          }
        }
      }
    }
    expect(pairs).toBeGreaterThanOrEqual(2);
  });

  it('every story problem has the information it needs: both numbers appear in the text', () => {
    for (const x of questions(L5)) {
      if (x.response.type !== 'story') continue;
      const numbers = x.prompt.match(/\d+/g) ?? [];
      expect(numbers.length, x.id).toBeGreaterThanOrEqual(2);
      const [p, r] = [Number(numbers[0]), Number(numbers[1])];
      const answer = x.response.answer;
      expect([p + r, Math.abs(p - r)], x.id).toContain(answer);
      expect(answer).toBeGreaterThan(0);
    }
  });

  it('making ten: the frame holds a, b waits outside, and the second group is always larger than the empty spaces', () => {
    let seen = 0;
    for (const a of L3.activities) {
      if (a.kind === 'question' && a.response.type === 'make-ten') {
        seen += 1;
        expect(a.response.a).toBeLessThan(10);
        expect(a.response.a + a.response.b).toBeGreaterThan(10);
        expect(a.response.b).toBeGreaterThanOrEqual(10 - a.response.a);
      }
      if (a.kind === 'question' && a.visual?.type === 'ten-frame' && a.response.type === 'blanks') {
        const { count, second = 0 } = a.visual;
        const need = 10 - count;
        const answers = a.response.answers;
        expect(answers.slice(0, 2), a.id).toEqual([need, second - need]);
        if (answers.length === 3) expect(answers[2]).toBe(count + second);
        expect(a.prompt).toContain(String(count));
      }
      if (a.kind === 'question' && a.response.type === 'blanks' && !a.visual) {
        const m = a.prompt.match(/(\d+) \+ (\d+)/);
        if (m) {
          const [x, y] = [Number(m[1]), Number(m[2])];
          expect(a.response.answers, a.id).toEqual([10 - x, y - (10 - x), x + y]);
        }
      }
      if (a.kind === 'explain') {
        for (const b of a.blocks) {
          if (b.type !== 'ten-demo') continue;
          seen += 1;
          expect(b.a + b.b).toBeGreaterThan(10);
          expect(b.b).toBeGreaterThan(10 - b.a);
        }
      }
      if (a.kind === 'explore' && a.tool.tool === 'make-ten') {
        seen += a.tool.examples.length;
        for (const e of a.tool.examples) {
          expect(e.a + e.b).toBeGreaterThan(10);
          expect(e.b).toBeGreaterThan(10 - e.a);
        }
      }
    }
    expect(seen).toBeGreaterThanOrEqual(7);
  });

  it('the near-double demonstration and the check show the relation they state', () => {
    for (const a of L4.activities) {
      if (a.kind === 'explain') {
        for (const b of a.blocks) {
          if (b.type !== 'doubles-demo') continue;
          expect(Math.abs(b.a - b.b)).toBeLessThanOrEqual(1);
          expect(b.steps).toHaveLength(b.a === b.b ? 3 : 4);
          const m = Math.min(b.a, b.b);
          expect(b.steps.join(' ')).toContain(`${m} + ${m} = ${2 * m}`);
          expect(b.steps.join(' ')).toContain(`${b.a} + ${b.b} = ${b.a + b.b}`.replace(`${b.a} + ${b.b} = ${b.a + b.b}`, `${b.a + b.b}`));
        }
      }
      if (a.kind === 'question' && a.visual?.type === 'compare' && a.response.type === 'numeric') {
        expect(Math.abs(a.visual.a - a.visual.b)).toBe(1);
        expect(a.response.answer).toBe(a.visual.a + a.visual.b);
      }
      if (a.kind === 'question' && a.visual?.type === 'parts' && a.response.type === 'numeric') {
        expect(a.response.answer).toBe(a.visual.a + a.visual.b);
      }
      if (a.kind === 'question' && a.id === 'check-3' && a.response.type === 'blanks' && a.visual?.type === 'compare') {
        const m = Math.min(a.visual.a, a.visual.b);
        expect(a.response.answers).toEqual([2 * m, a.visual.a + a.visual.b]);
      }
    }
    // the choice question about 7 + 8 has exactly one option that is a correct way to use 7 + 7
    const c = byId<QuestionActivity>(L4, 'check-2');
    expect(c.response.type === 'choice' && c.response.answer).toBe('one');
  });

  it('the doubles practice picture has exactly one pair of equal groups', () => {
    const p = byId<QuestionActivity>(L4, 'practice-1');
    if (p.response.type !== 'choice') throw new Error('choice expected');
    const equal = p.response.options.filter((o) => o.visual?.type === 'parts' && o.visual.a === o.visual.b).map((o) => o.id);
    expect(equal).toEqual([p.response.answer]);
  });
});

// ─────────────────────────── components ───────────────────────────

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const clickAll = (name: string | RegExp, times: number) => {
  for (let i = 0; i < times; i += 1) click(name);
};
const counterEls = (zone?: number) => [...document.querySelectorAll<HTMLButtonElement>(zone === undefined ? '.cb-counter' : `.cb-counter[data-zone="${zone}"]`)];
const zoneEl = (zone: number) => document.querySelector<HTMLButtonElement>(`.cb-zone.is-zone-${zone}`) as HTMLButtonElement;
function moveCounters(from: number, to: number, n: number) {
  fireEvent.click(counterEls(from)[0]);
  for (let i = 0; i < n; i += 1) fireEvent.click(zoneEl(to));
}
const text = (selector: string) => document.querySelector(selector)?.textContent ?? '';

function JumpHarness({ response, verdict }: { response: Extract<ResponseSpec, { type: 'jumps' }>; verdict?: 'incorrect' }) {
  const [value, setValue] = useState('');
  return (
    <>
      <JumpBoard response={response} value={value} onChange={setValue} disabled={verdict === 'incorrect'} verdict={verdict} label="ამოცანა" />
      <output data-testid="value">{value}</output>
    </>
  );
}
const stored = () => screen.getByTestId('value').textContent;

describe('JumpBoard', () => {
  const plus: Extract<ResponseSpec, { type: 'jumps' }> = { type: 'jumps', direction: 'forward', min: 0, max: 12, from: 6, count: 2, pickStart: true };

  it('the student first taps the starting number; the jumps then begin from it', () => {
    render(<JumpHarness response={plus} />);
    expect(text('.jb-count')).toContain('ჯერ არ აგირჩევია');
    expect((screen.getByRole('button', { name: 'ნახტომი წინ ▶' }) as HTMLButtonElement).disabled).toBe(true);
    click('რიცხვი 6');
    expect(stored()).toBe('6,0');
    expect(text('.jb-count')).toContain('დასაწყისი: 6');
    // the start can still be changed while no jump has been made
    click('რიცხვი 5');
    expect(stored()).toBe('5,0');
    click('რიცხვი 6');
    click('ნახტომი წინ ▶');
    click('ნახტომი წინ ▶');
    expect(stored()).toBe('6,2');
    expect(text('.jb-count')).toContain('ნახტომები: 2');
    expect(text('.jb-count')).toContain('ახლა: 8');
    // the marker is on the landing number and the start is flagged
    expect(screen.getByRole('img', { name: 'მარკერი: რიცხვი 8' })).toBeTruthy();
    expect(document.querySelector('.nl-flag.is-start')?.textContent).toBe('დასაწყისი');
  });

  it('each jump moves the marker exactly one step in the right direction', () => {
    render(<JumpHarness response={{ ...plus, direction: 'back', from: 9, count: 3 }} />);
    click('რიცხვი 9');
    const seen: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      click('◀ ნახტომი უკან');
      seen.push(document.querySelector('.nl-marker')?.getAttribute('aria-label') ?? '');
    }
    expect(seen).toEqual(['მარკერი: რიცხვი 8', 'მარკერი: რიცხვი 7', 'მარკერი: რიცხვი 6']);
  });

  it('undo takes back one jump, reset clears the start too, and the marker stops at the ends of the line', () => {
    render(<JumpHarness response={{ ...plus, max: 8 }} />);
    click('რიცხვი 7');
    clickAll('ნახტომი წინ ▶', 5);
    expect(stored()).toBe('7,1'); // the line ends at 8: no more jumps
    expect((screen.getByRole('button', { name: 'ნახტომი წინ ▶' }) as HTMLButtonElement).disabled).toBe(true);
    click('ბოლო ნახტომის გაუქმება');
    expect(stored()).toBe('7,0');
    expect((screen.getByRole('button', { name: 'ბოლო ნახტომის გაუქმება' }) as HTMLButtonElement).disabled).toBe(true);
    click('ნახტომი წინ ▶');
    click(/თავიდან/);
    expect(stored()).toBe('');
    expect(text('.jb-count')).toContain('ჯერ არ აგირჩევია');
  });

  it('a fixed start needs no choice, and the landing can be hidden', () => {
    render(<JumpHarness response={{ type: 'jumps', direction: 'forward', min: 0, max: 12, from: 4, count: 3, showLanding: false, labelled: [0, 5, 10] }} />);
    click('ნახტომი წინ ▶');
    expect(stored()).toBe('4,1');
    expect(text('.jb-count')).toContain('ნახტომები: 1');
    expect(text('.jb-count')).not.toContain('ახლა');
    expect(document.querySelector('.nb, .nl-readout')).toBeNull();
  });

  it('after a wrong answer the marker returns to the start and the jumps are counted again, one by one', () => {
    vi.useFakeTimers();
    try {
      const { unmount } = render(<JumpBoard response={plus} value="6,3" onChange={() => undefined} disabled verdict="incorrect" label="ამოცანა" />);
      expect(text('.jb-review')).toContain('ვიწყებთ');
      expect(document.querySelector('.nl-band')).toBeTruthy(); // attention goes back to the start
      expect(screen.getByRole('img', { name: 'მარკერი: რიცხვი 6' })).toBeTruthy();
      act(() => {
        vi.advanceTimersByTime(650);
      });
      expect(text('.jb-review')).toContain('1');
      expect(screen.getByRole('img', { name: 'მარკერი: რიცხვი 7' })).toBeTruthy();
      act(() => {
        vi.advanceTimersByTime(650);
      });
      act(() => {
        vi.advanceTimersByTime(650);
      });
      expect(text('.jb-review')).toContain('1, 2, 3');
      expect(screen.getByRole('img', { name: 'მარკერი: რიცხვი 9' })).toBeTruthy();
      unmount();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('TakeAwayBoard', () => {
  function Harness({ total, showRemaining }: { total: number; showRemaining?: boolean }) {
    const [removed, setRemoved] = useState<number[]>([]);
    return <TakeAwayBoard total={total} glyph="apple" removed={removed} showRemaining={showRemaining} onToggle={(i) => setRemoved((r) => (r.includes(i) ? r.filter((x) => x !== i) : [...r, i]))} label="ვაშლები" />;
  }
  const objs = () => [...document.querySelectorAll<HTMLButtonElement>('.tab-obj')];
  it('an object moves to the tray when tapped and back when tapped again; none is lost or duplicated', () => {
    render(<Harness total={7} showRemaining />);
    expect(objs()).toHaveLength(7);
    fireEvent.click(objs()[2]);
    fireEvent.click(objs()[5]);
    expect(objs()).toHaveLength(7);
    expect(objs().filter((o) => o.getAttribute('aria-pressed') === 'true')).toHaveLength(2);
    expect(text('.objs-count')).toContain('გამოტანილია: 2');
    expect(text('.objs-count')).toContain('დარჩა: 5');
    // the object keeps its own place in the group; the tray slots follow the order taken
    const tray = objs()[2].style.top;
    expect(objs()[5].style.top).toBe(tray);
    fireEvent.click(objs()[2]);
    expect(text('.objs-count')).toContain('გამოტანილია: 1');
    expect(objs()[2].getAttribute('aria-pressed')).toBe('false');
  });
  it('can hide the number that is left (it may be the answer) and is read out in words', () => {
    render(<Harness total={7} />);
    expect(text('.objs-count')).not.toContain('დარჩა');
    expect(screen.getByRole('group').getAttribute('aria-label')).toContain('7 ვაშლი');
  });
  it('is only a picture without a handler', () => {
    render(<TakeAwayBoard total={5} glyph="ball" removed={[4, 3]} label="ბურთები" />);
    expect(document.querySelectorAll('button.tab-obj')).toHaveLength(0);
    expect(document.querySelectorAll('.tab-obj.is-out')).toHaveLength(2);
  });
});

describe('MakeTenBoard', () => {
  function Harness({ a, b }: { a: number; b: number }) {
    const [value, setValue] = useState('');
    return (
      <>
        <MakeTenBoard response={{ type: 'make-ten', a, b }} value={value} onChange={setValue} disabled={false} label="ამოცანა" />
        <output data-testid="value">{value}</output>
      </>
    );
  }
  const zoneCounts = () => [0, 1, 2].map((z) => counterEls(z).length);
  it('starts with a counters in the frame and b outside; the total never changes', () => {
    render(<Harness a={8} b={5} />);
    expect(zoneCounts()).toEqual([8, 5, 0]);
    expect(document.querySelectorAll('.cb-cell')).toHaveLength(10);
    expect(document.querySelector('.cb-zone.is-zone-2')).toBeNull(); // one box outside the frame
    moveCounters(1, 0, 1);
    expect(zoneCounts()).toEqual([9, 4, 0]);
    expect(stored()).toBe('9');
    expect(text('.objs-count')).toContain('ჩარჩოში: 9');
    expect(text('.objs-count')).toContain('გარეთ: 4');
  });
  it('takes exactly the counters needed and then refuses more: the frame holds ten', () => {
    render(<Harness a={8} b={5} />);
    moveCounters(1, 0, 4);
    expect(zoneCounts()).toEqual([10, 3, 0]);
    expect(zoneEl(0).disabled).toBe(true);
    expect(stored()).toBe('10');
  });
  it('a counter can be taken back out of the frame', () => {
    render(<Harness a={7} b={6} />);
    moveCounters(1, 0, 3);
    expect(zoneCounts()).toEqual([10, 3, 0]);
    moveCounters(0, 1, 1); // a counter of the full frame is picked up although another one was still held
    expect(zoneCounts()).toEqual([9, 4, 0]);
    expect(zoneCounts().reduce((x, y) => x + y, 0)).toBe(13);
  });
});

describe('JumpExplore', () => {
  const forward = { tool: 'jump-line' as const, direction: 'forward' as const, min: 0, max: 15, glyph: 'apple' as const, examples: [{ a: 6, b: 3 }, { a: 2, b: 7 }] };
  const eq = () => ({ pos: text('.jx-eq strong'), chain: text('.jx-chain'), note: text('.xt-note') });

  it('shows the start, lets the student choose the jumps, and moves one step at a time with the landing after each', () => {
    vi.useFakeTimers();
    try {
      render(<JumpExplore spec={forward} />);
      expect(eq().pos).toBe('6');
      expect(eq().note).toContain('დასაწყისი: 6');
      click('3 ნახტომი');
      click('გადახტომა ▶');
      const steps: string[] = [];
      for (let i = 0; i < 3; i += 1) {
        act(() => {
          vi.advanceTimersByTime(650);
        });
        steps.push(eq().chain);
      }
      expect(steps).toEqual(['6 → 7', '6 → 7 → 8', '6 → 7 → 8 → 9']);
      expect(eq().pos).toBe('9');
      expect(eq().note).toContain('6 + 3 = 9');
      // the objects: six, then three new ones numbered 1, 2, 3
      expect(document.querySelectorAll('.obj')).toHaveLength(9);
      expect([...document.querySelectorAll('.obj-badge')].map((b) => b.textContent)).toEqual(['1', '2', '3']);
      // the button is free again; reset goes back to the start
      click(/თავიდან/);
      expect(eq().pos).toBe('6');
      expect(eq().chain).toBe('6');
      expect(document.querySelectorAll('.obj')).toHaveLength(6);
    } finally {
      vi.useRealTimers();
    }
  });

  it('"one jump" moves a single step; the number of jumps does not have to match until the student chooses it', () => {
    render(<JumpExplore spec={forward} />);
    click('ერთი ნახტომი');
    click('ერთი ნახტომი');
    expect(eq().pos).toBe('8');
    expect(eq().note).toContain('ახლა 8-ზე ვართ');
    click('ერთი ნახტომი');
    expect(eq().note).toContain('6 + 3 = 9');
  });

  it('starting from the smaller number gives the same total with more jumps, and says so', () => {
    render(<JumpExplore spec={forward} />);
    click(/2 \+ 7/);
    click('დავიწყო 2-დან');
    expect(eq().pos).toBe('2');
    clickAll('ერთი ნახტომი', 7);
    expect(eq().pos).toBe('9');
    expect(eq().note).toContain('ჯამი იგივეა');
    expect(eq().note).toContain('მეტი ნახტომი');
    click('დავიწყო 7-დან');
    expect(eq().pos).toBe('7');
    clickAll('ერთი ნახტომი', 2);
    expect(eq().pos).toBe('9');
    expect(eq().note).toContain('დიდი რიცხვიდან დავიწყეთ');
  });

  it('backward: the marker moves left and the objects leave the group one by one', () => {
    render(<JumpExplore spec={{ ...forward, direction: 'back', examples: [{ a: 8, b: 3 }] }} />);
    expect(text('.tab-count')).toContain('8');
    clickAll('ერთი ნახტომი', 3);
    expect(eq().pos).toBe('5');
    expect(eq().chain).toBe('8 → 7 → 6 → 5');
    expect(eq().note).toContain('8 − 3 = 5');
    expect(document.querySelectorAll('.tab-obj.is-out')).toHaveLength(3);
    expect(document.querySelectorAll('.tab-obj')).toHaveLength(8);
    expect(text('.objs-count')).toContain('დარჩა: 5');
    click(/თავიდან/);
    expect(document.querySelectorAll('.tab-obj.is-out')).toHaveLength(0);
  });

  it('cannot jump past the end of the line', () => {
    render(<JumpExplore spec={{ ...forward, max: 8, examples: [{ a: 6, b: 3 }] }} />);
    expect(screen.queryByRole('button', { name: '3 ნახტომი' })).toBeNull();
    clickAll('ერთი ნახტომი', 4);
    expect(eq().pos).toBe('8');
  });
});

describe('MakeTenExplore', () => {
  const spec = { tool: 'make-ten' as const, examples: [{ a: 8, b: 5 }, { a: 9, b: 4 }] };
  const cards = () => [...document.querySelectorAll('.sc-card')].map((c) => c.querySelector('strong')?.textContent);
  it('builds the decomposition one card at a time: 8 + 5 → 8 + 2 + 3 → 10 + 3 → 13', () => {
    render(<MakeTenExplore spec={spec} />);
    expect(cards()).toEqual(['8 + 5', '?', '?', '?']);
    moveCounters(1, 0, 1);
    expect(cards()).toEqual(['8 + 5', '8 + 1 + 4', '?', '?']);
    moveCounters(1, 0, 1);
    expect(cards()).toEqual(['8 + 5', '8 + 2 + 3', '10 + 3', '13']);
    expect(text('.xt-note')).toContain('ჩარჩო სავსეა');
    expect(text('.xt-note')).toContain('2 კუბიკი');
    expect(text('.xt-note')).toContain('3 დარჩა');
    expect(text('.xt-note')).toContain('ჯამი არ შეცვლილა');
  });
  it('reset and the second example start again with the right numbers', () => {
    render(<MakeTenExplore spec={spec} />);
    moveCounters(1, 0, 2);
    click(/თავიდან/);
    expect(cards()).toEqual(['8 + 5', '?', '?', '?']);
    expect(counterEls(0)).toHaveLength(8);
    click(/9 \+ 4/);
    expect(counterEls(0)).toHaveLength(9);
    expect(counterEls(1)).toHaveLength(4);
    moveCounters(1, 0, 1);
    expect(cards()).toEqual(['9 + 4', '9 + 1 + 3', '10 + 3', '13']);
  });
});

describe('DoublesLab', () => {
  const spec = { tool: 'doubles-lab' as const, max: 6, doubles: [4, 3], near: [3, 4] };
  const items = (side: 'a' | 'b') => document.querySelectorAll(`.dbl-item.is-${side}`).length;
  it('doubles: the second group starts empty, grows one at a time, and the fact appears when the groups are equal', () => {
    render(<DoublesLab spec={spec} />);
    expect([items('a'), items('b')]).toEqual([4, 0]);
    expect((screen.getByRole('button', { name: 'გაერთიანება' }) as HTMLButtonElement).disabled).toBe(true);
    clickAll('ბ ჯგუფში ერთის დამატება', 2);
    expect(text('.xt-note')).toContain('პატარაა');
    clickAll('ბ ჯგუფში ერთის დამატება', 2);
    expect([items('a'), items('b')]).toEqual([4, 4]);
    expect(text('.xt-note')).toContain('4 + 4 = 8');
    expect(document.querySelectorAll('.dbl-link')).toHaveLength(4);
    click('გაერთიანება');
    expect(text('.xt-note')).toContain('4 + 4 = 8');
    expect(document.querySelector('.dbl')?.getAttribute('aria-label')).toContain('გაერთიანებულია');
    expect(items('a') + items('b')).toBe(8);
    click('ისევ გაყოფა');
    expect(document.querySelector('.dbl')?.getAttribute('aria-label')).not.toContain('გაერთიანებულია');
  });
  it('doubles: one counter too many is noticed, and choosing another number starts again', () => {
    render(<DoublesLab spec={spec} />);
    clickAll('ბ ჯგუფში ერთის დამატება', 5);
    expect(text('.xt-note')).toContain('უფრო დიდია');
    click('პირველ ჯგუფში 3');
    expect([items('a'), items('b')]).toEqual([3, 0]);
  });
  it('near doubles: shows the equal groups, then the extra counter, then the total, and the live sum', () => {
    render(<DoublesLab spec={spec} />);
    click(/ბ · თითქმის ორმაგები/);
    expect([items('a'), items('b')]).toEqual([3, 4]);
    expect(text('.xt-total')).toBe('3 + 4 = 7');
    expect(text('.xt-note')).toContain('თითქმის ორმაგია');
    const cards = () => [...document.querySelectorAll('.sc-card strong')].map((c) => c.textContent);
    expect(cards()).toEqual(['3 + 4', '?', '?', '?']);
    click('1 · ტოლი ჯგუფები');
    expect(cards()).toEqual(['3 + 4', '3 + 3 = 6', '?', '?']);
    expect(document.querySelectorAll('.dbl-item.is-paired')).toHaveLength(6);
    click('2 · დამატებითი კუბიკი');
    expect(document.querySelectorAll('.dbl-item.is-extra')).toHaveLength(1);
    expect(document.querySelector('.dbl-item.is-extra')?.classList.contains('is-b')).toBe(true);
    expect(cards()).toEqual(['3 + 4', '3 + 3 = 6', '6 + 1', '?']);
    click('3 · გაერთიანება');
    expect(cards()).toEqual(['3 + 4', '3 + 3 = 6', '6 + 1', '7']);
  });
  it('near doubles: the extra counter can be in the first group; far-apart groups are not forced into a doubles story', () => {
    render(<DoublesLab spec={spec} />);
    click(/ბ · თითქმის ორმაგები/);
    click('ბ ჯგუფიდან ერთის ამოღება'); // 3 and 3
    expect(text('.xt-note')).toContain('ორმაგია');
    expect(screen.queryByRole('button', { name: '1 · ტოლი ჯგუფები' })).toBeNull();
    click('ბ ჯგუფიდან ერთის ამოღება'); // 3 and 2: the extra counter is now in group ა
    click('1 · ტოლი ჯგუფები');
    click('2 · დამატებითი კუბიკი');
    expect(document.querySelector('.dbl-item.is-extra')?.classList.contains('is-a')).toBe(true);
    expect([...document.querySelectorAll('.sc-card strong')].map((c) => c.textContent).slice(0, 3)).toEqual(['3 + 2', '2 + 2 = 4', '4 + 1']);
    click('ბ ჯგუფიდან ერთის ამოღება'); // 3 and 1
    expect(text('.xt-note')).toContain('ერთზე მეტით');
    expect(text('.xt-note')).toContain('სხვა ხერხიც');
    expect(screen.queryByRole('button', { name: '2 · დამატებითი კუბიკი' })).toBeNull();
  });
  it('the picture names both groups and has one counter per object', () => {
    const { container } = render(<PairedGroups a={4} b={5} view="extra" label="ორი ჯგუფი" />);
    expect(container.querySelector('.dbl')?.getAttribute('aria-label')).toBe('ორი ჯგუფი: ჯგუფი ა 4, ჯგუფი ბ 5');
    expect(container.querySelectorAll('.dbl-item')).toHaveLength(9);
    expect(container.querySelectorAll('.cb-disc.is-a')).toHaveLength(4);
    expect(container.querySelectorAll('.cb-disc.is-b')).toHaveLength(5);
    expect(container.querySelectorAll('.dbl-plus')).toHaveLength(1);
  });
});

describe('StoryWorkspace', () => {
  const spec = {
    tool: 'story-workspace' as const,
    stories: [
      { mode: 'join' as const, glyph: 'fish' as const, text: 'თევზი 5 + 4', first: 5, change: 4 },
      { mode: 'separate' as const, glyph: 'ball' as const, text: 'ბურთი 8 − 3', first: 8, change: 3 },
    ],
  };
  const items = () => document.querySelectorAll('.sw-item').length;
  const note = () => text('.xt-note');
  it('the picture starts with the first group; objects are added or removed one at a time', () => {
    render(<StoryWorkspace spec={spec} />);
    expect(items()).toBe(5);
    clickAll('ერთი საგნის დამატება სურათზე', 4);
    expect(items()).toBe(9);
    expect(document.querySelectorAll('.sw-item.is-new')).toHaveLength(4);
    click('ერთი საგნის ამოღება სურათიდან');
    expect(items()).toBe(8);
  });
  it('the story is compared with the picture first, then with the sign; the sign can be changed before checking', () => {
    render(<StoryWorkspace spec={spec} />);
    click('შევადაროთ ისტორიას');
    expect(note()).toContain('ჯერ შეცვალე სურათი');
    clickAll('ერთი საგნის ამოღება სურათიდან', 1);
    click('შევადაროთ ისტორიას');
    expect(note()).toContain('პირიქით');
    clickAll('ერთი საგნის დამატება სურათზე', 6); // 5 - 1 + 6 = 10: five added, not four
    click('შევადაროთ ისტორიას');
    expect(note()).toContain('5-ით შეიცვალა');
    click('ერთი საგნის ამოღება სურათიდან'); // 9: four added
    click('შევადაროთ ისტორიას');
    expect(note()).toContain('აირჩიე');
    click('− გამოკლება');
    click('შევადაროთ ისტორიას');
    expect(note()).toContain('✗');
    expect(note()).toContain('ჯგუფი იზრდება');
    click('+ შეკრება');
    expect(note()).not.toContain('✗'); // changing the sign clears the old verdict
    click('შევადაროთ ისტორიას');
    expect(note()).toContain('✓');
    expect(note()).toContain('5 + 4 = 9');
  });
  it('a take-away story: the picture loses objects, the sign is −, and reset starts again', () => {
    render(<StoryWorkspace spec={spec} />);
    click('ისტორია 2');
    expect(items()).toBe(8);
    clickAll('ერთი საგნის ამოღება სურათიდან', 3);
    click('− გამოკლება');
    click('შევადაროთ ისტორიას');
    expect(note()).toContain('8 − 3 = 5');
    click(/თავიდან/);
    expect(items()).toBe(8);
    expect(note()).toContain('წაიკითხე ისტორია');
    click('ისტორია 1');
    expect(items()).toBe(5);
  });
  it('the number of objects cannot go below zero', () => {
    render(<StoryWorkspace spec={{ ...spec, stories: [{ mode: 'separate', glyph: 'ball', text: 't 2 1', first: 2, change: 1 }] }} />);
    clickAll('ერთი საგნის ამოღება სურათიდან', 2);
    expect((screen.getByRole('button', { name: 'ერთი საგნის ამოღება სურათიდან' }) as HTMLButtonElement).disabled).toBe(true);
    expect(items()).toBe(0);
    expect(document.querySelector('.sw-empty')).toBeTruthy();
  });
});

// ─────────────────────────── player ───────────────────────────

function go(hash: string) {
  window.location.hash = hash;
  return render(<StudentApp />);
}
const next = () => click('გაგრძელება');
const submit = () => click('პასუხის შემოწმება');
const retry = () => click('ხელახლა ცდა');
const feedback = () => document.querySelector('.lp-feedback')?.textContent ?? '';
const saved = () => JSON.parse(window.localStorage.getItem(LEARN_STORAGE_KEY) ?? '{}');
const inputs = () => screen.getAllByRole('textbox') as HTMLInputElement[];
const stepButtons = () => screen.queryAllByRole('button', { name: 'შემდეგი ნაბიჯი' }) as HTMLButtonElement[];

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
      fireEvent.click(screen.getAllByRole('radio')[r.options.findIndex((o) => o.id === r.answer)]);
      break;
    case 'numeric':
      fireEvent.change(screen.getByRole('textbox'), { target: { value: String(r.answer) } });
      break;
    case 'blanks':
      r.answers.forEach((n, i) => fireEvent.change(inputs()[i], { target: { value: String(n) } }));
      break;
    case 'jumps':
      if (r.pickStart) click(`რიცხვი ${r.from}`);
      clickAll(/ნახტომი (წინ|უკან)|ნახტომი უკან/, r.count);
      break;
    case 'takeaway':
      for (let i = 0; i < r.remove; i += 1) fireEvent.click(document.querySelectorAll<HTMLButtonElement>('button.tab-obj')[i]);
      break;
    case 'make-ten':
      moveCounters(1, 0, 10 - r.a);
      break;
    case 'story':
      fireEvent.click(screen.getByRole('radio', { name: r.operation === 'add' ? /შეკრება/ : /გამოკლება/ }));
      fireEvent.change(screen.getByRole('textbox'), { target: { value: String(r.answer) } });
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
    click(i === last ? 'გაკვეთილის დასრულება' : 'გაგრძელება');
  });
}

describe('U04 unit page', () => {
  it('lists the five lessons under U04, all playable', () => {
    go('#/student/lessons/g1-u04');
    const list = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(list).toHaveLength(5);
    IDS.forEach((id, i) => expect(within(list[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
    expect(screen.getAllByText('Adding by Counting On').length + screen.getAllByText('Making 10 to Add').length).toBeGreaterThanOrEqual(2);
  });
});

describe.each(IDS.map((id, i) => [id, i + 1] as const))('%s plays from the challenge to the completion screen', (id, n) => {
  it('every step works with its own correct answers and the progress is saved', () => {
    const lesson = LESSON_CONTENT[id];
    go(`#/student/lessons/${id}`);
    expect(screen.getByText(`ნაბიჯი 1 / ${lesson.activities.length}`)).toBeTruthy();
    expect(document.querySelector('.lp-code')?.textContent).toContain(`U04.${n}`);
    expect(screen.getByRole('link', { name: 'უკან, გაკვეთილების სიაში' }).getAttribute('href')).toBe('#/student/lessons/g1-u04');
    playThrough(lesson);
    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    expect(screen.getByText('3 / 3')).toBeTruthy();
    expect(screen.getByText(lesson.mascot?.complete as string)).toBeTruthy();
    for (const c of lesson.concepts ?? []) expect(screen.getByText(c, { selector: '.lp-concepts li' })).toBeTruthy();
    expect(saved()[id]).toMatchObject({ status: 'completed', checkCorrect: 3, checkTotal: 3 });
    expect(screen.getByRole('link', { name: 'U04-ზე დაბრუნება' }).getAttribute('href')).toBe('#/student/lessons/g1-u04');
    if (n < 5) expect(screen.getByRole('link', { name: new RegExp(`გაგრძელება: U04\\.${n + 1}`) }).getAttribute('href')).toBe(`#/student/lessons/${IDS[n]}`);
    else expect(screen.queryByRole('link', { name: /გაგრძელება:/ })).toBeNull();
  });
});

describe('no answer is ever shown before the student gives it', () => {
  it('the check never shows hints, and the Axi bubble gives no hint there', () => {
    for (const l of lessons) {
      for (const x of stageOf(l, 'check')) {
        expect(x.hints.length).toBe(0);
      }
    }
    go('#/student/lessons/g1-u04-l1');
    // walk to the first check question
    const firstCheck = L1.activities.findIndex((a) => a.stage === 'check');
    L1.activities.slice(0, firstCheck).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    expect(screen.queryByRole('button', { name: /მინიშნება/ })).toBeNull();
    // the jump line of check-1 hides where the jumps end
    expect(document.querySelector('.nl-flag.is-pin')?.textContent).toBe('?');
    expect(document.querySelector('.nl-flag.is-start')).toBeTruthy();
  });
});

describe('U04.1 counting on: interactions in the player', () => {
  const toPractice = (index: number) => {
    go('#/student/lessons/g1-u04-l1');
    const first = L1.activities.findIndex((a) => a.id === `practice-${index}`);
    L1.activities.slice(0, first).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
  };

  it('practice 1: too few and too many jumps are different mistakes; answers and hints survive a retry', () => {
    toPractice(1);
    submit();
    expect(feedback()).toContain('ნახტომ'); // incomplete: nothing lost
    clickAll('ნახტომი წინ ▶', 2);
    submit();
    expect(feedback()).toContain('ცოტაა');
    click(/მინიშნება/);
    expect(screen.getByText(/დასაწყისი უკვე მონიშნულია/)).toBeTruthy();
    retry();
    expect(text('.jb-count')).toContain('ნახტომები: 2'); // the jumps are still there
    click('ნახტომი წინ ▶');
    click('ნახტომი წინ ▶');
    submit();
    expect(feedback()).toContain('ზედმეტია');
    retry();
    click('ბოლო ნახტომის გაუქმება');
    submit();
    expect(feedback()).toContain('სწორია');
  });

  it('practice 2: starting from the smaller number gets its own note; the right start passes', () => {
    toPractice(2);
    submit();
    expect(feedback()).toContain('შეეხე'); // incomplete: no start yet
    click('რიცხვი 2');
    clickAll('ნახტომი წინ ▶', 6);
    submit();
    expect(feedback()).toContain('გზა გრძელია');
    retry();
    click(/თავიდან/);
    click('რიცხვი 6');
    clickAll('ნახტომი წინ ▶', 2);
    submit();
    expect(feedback()).toContain('სწორია');
  });

  it('practice 3: the landing number is hidden on the line, and the off-by-one slip has its own note', () => {
    toPractice(3);
    expect(document.querySelector('.nl-flag.is-pin')?.textContent).toBe('?');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '9' } });
    submit();
    expect(feedback()).toContain('ერთი ნახტომი გამოგრჩა');
    expect(feedback()).not.toContain('10');
  });

  it('check: two attempts, then the question closes with the explanation', () => {
    go('#/student/lessons/g1-u04-l1');
    const firstCheck = L1.activities.findIndex((a) => a.stage === 'check');
    L1.activities.slice(0, firstCheck).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '11' } });
    submit();
    expect(feedback()).toContain('ერთი ნახტომი გამოგრჩა');
    retry();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '10' } });
    submit();
    expect(feedback()).toContain('ვნახოთ ერთად');
    expect(feedback()).toContain('10, 11, 12');
  });
});

describe('U04.2 counting back: interactions in the player', () => {
  it('the challenge shows eight objects with three struck through, and no answer', () => {
    go('#/student/lessons/g1-u04-l2');
    expect(document.querySelector('.storyscene.is-separate')).toBeTruthy();
    expect(document.querySelectorAll('.storyscene .obj')).toHaveLength(8);
    expect(document.querySelectorAll('.storyscene .obj.is-extra')).toHaveLength(3);
    expect(document.body.textContent).not.toContain('დარჩა 5');
  });

  it('practice 1: taking away the wrong number of objects is told apart; answers survive the hint', () => {
    go('#/student/lessons/g1-u04-l2');
    const first = L2.activities.findIndex((a) => a.id === 'practice-1');
    L2.activities.slice(0, first).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    submit();
    expect(feedback()).toContain('შეეხე'); // incomplete
    const objs = () => document.querySelectorAll<HTMLButtonElement>('button.tab-obj');
    fireEvent.click(objs()[0]);
    fireEvent.click(objs()[1]);
    click(/მინიშნება/);
    expect(document.querySelectorAll('.tab-obj.is-out')).toHaveLength(2);
    submit();
    expect(feedback()).toContain('ცოტა');
    retry();
    expect(document.querySelectorAll('.tab-obj.is-out')).toHaveLength(2);
    fireEvent.click(objs()[2]);
    fireEvent.click(objs()[3]);
    submit();
    expect(feedback()).toContain('ზედმეტი');
    retry();
    fireEvent.click(objs()[3]);
    submit();
    expect(feedback()).toContain('სწორია');
    expect(text('.tab-count')).not.toBe('');
  });

  it('practice 2: backward jumps from the wrong start are explained, not just marked wrong', () => {
    go('#/student/lessons/g1-u04-l2');
    const first = L2.activities.findIndex((a) => a.id === 'practice-2');
    L2.activities.slice(0, first).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    click('რიცხვი 3');
    clickAll('◀ ნახტომი უკან', 3);
    submit();
    expect(feedback()).toContain('დასაწყისი პირველი რიცხვია');
  });

  it('check 3: the wrong direction and the wrong start have different explanations', () => {
    go('#/student/lessons/g1-u04-l2');
    const firstCheck = L2.activities.findIndex((a) => a.id === 'check-3');
    L2.activities.slice(0, firstCheck).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    fireEvent.click(screen.getAllByRole('radio')[0]);
    submit();
    expect(feedback()).toContain('მარჯვნივ რიცხვი იზრდება');
    retry();
    // the second wrong answer closes the question (two attempts in a check) and shows the explanation instead
    fireEvent.click(screen.getAllByRole('radio')[1]);
    submit();
    expect(feedback()).toContain('ვნახოთ ერთად');
    // the feedback of the other wrong option is its own
    const swap = byId<QuestionActivity>(L2, 'check-3').misconceptions?.find((m) => m.answers.includes('swap'));
    expect(swap?.feedback).toContain('დასაწყისი პირველი რიცხვია: 9');
    expect(evaluateAnswer(byId<QuestionActivity>(L2, 'check-3'), 'swap').feedback).toBe(swap?.feedback);
  });
});

describe('U04.3 making ten: interactions in the player', () => {
  const toQuestion = (id: string) => {
    go('#/student/lessons/g1-u04-l3');
    const first = L3.activities.findIndex((a) => a.id === id);
    L3.activities.slice(0, first).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
  };

  it('the challenge: nothing moved is incomplete, a part-filled frame is wrong without a number, and the right move passes', () => {
    go('#/student/lessons/g1-u04-l3');
    expect([0, 1, 2].map((z) => counterEls(z).length)).toEqual([8, 5, 0]);
    submit();
    expect(feedback()).toContain('გადაიტანე');
    moveCounters(1, 0, 1);
    submit();
    expect(feedback()).toContain('ჩარჩო ჯერ სავსე არ არის');
    expect(feedback()).not.toContain('2');
    retry();
    expect([0, 1, 2].map((z) => counterEls(z).length)).toEqual([9, 4, 0]); // the move is kept
    moveCounters(1, 0, 1);
    submit();
    expect(feedback()).toContain('სწორია');
    expect(feedback()).toContain('8 + 5 = 10 + 3 = 13');
  });

  it('practice 2: the ten-frame shows 8 solid and the rest as rings; swapped numbers are told apart', () => {
    toQuestion('practice-2');
    expect(document.querySelectorAll('.tenf-cell.is-a')).toHaveLength(8);
    expect(document.querySelectorAll('.tenf-cell.is-b')).toHaveLength(6);
    const [a, b] = inputs();
    fireEvent.change(a, { target: { value: '4' } });
    fireEvent.change(b, { target: { value: '2' } });
    submit();
    expect(feedback()).toContain('რიგი შეგეშალა');
    retry();
    expect(inputs()[0].value).toBe('4'); // answers survive
    fireEvent.change(inputs()[0], { target: { value: '2' } });
    fireEvent.change(inputs()[1], { target: { value: '4' } });
    submit();
    expect(feedback()).toContain('სწორია');
  });

  it('practice 3: three blanks, three progressive hints, and no frame to lean on', () => {
    toQuestion('practice-3');
    expect(document.querySelector('.tenf, .cb, .frameb')).toBeNull();
    expect(inputs()).toHaveLength(3);
    click(/მინიშნება/);
    click(/მინიშნება/);
    click(/მინიშნება/);
    expect(screen.queryByRole('button', { name: /მინიშნება/ })).toBeNull();
  });

  it('check 1: the ten-frame picture is only a picture (nothing is filled in for the student)', () => {
    toQuestion('check-1');
    expect(document.querySelectorAll('.tenf-cell.is-a')).toHaveLength(9);
    expect(document.querySelectorAll('button.tenf-cell')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /მინიშნება/ })).toBeNull();
    for (const [i, v] of ['1', '4', '14'].entries()) fireEvent.change(inputs()[i], { target: { value: v } });
    submit();
    expect(feedback()).toContain('სწორია');
  });
});

describe('U04.4 doubles: interactions in the player', () => {
  it('two challenges in a row: the doubles fact first, then the related problem', () => {
    go('#/student/lessons/g1-u04-l4');
    fireEvent.click(screen.getAllByRole('radio')[1]);
    submit();
    next();
    expect(document.querySelector('.lp-stage-label')?.textContent).toBe('გამოწვევა');
    expect(screen.getByText(/4 კუბიკი და 5/)).toBeTruthy();
    fireEvent.click(screen.getAllByRole('radio')[1]);
    submit();
    expect(feedback()).toContain('ჯერ არ არის სწორი');
  });

  it('the near-double check has a wrong "+2" and a wrong "−1", each explained by the relation of 7 and 8', () => {
    go('#/student/lessons/g1-u04-l4');
    const first = L4.activities.findIndex((a) => a.id === 'check-2');
    L4.activities.slice(0, first).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    fireEvent.click(screen.getAllByRole('radio')[0]);
    submit();
    expect(feedback()).toContain('ორი კი არა');
    retry();
    fireEvent.click(screen.getAllByRole('radio')[2]);
    submit();
    expect(feedback()).toContain('ვნახოთ ერთად'); // second miss in a check: the question closes with the explanation
    expect(evaluateAnswer(byId<QuestionActivity>(L4, 'check-2'), 'minus').feedback).toContain('უფრო დიდია');
  });

  it('check 3: forgetting the extra counter is its own mistake, and the paired picture is shown', () => {
    go('#/student/lessons/g1-u04-l4');
    const first = L4.activities.findIndex((a) => a.id === 'check-3');
    L4.activities.slice(0, first).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    expect(document.querySelector('.cmp, .pair')).toBeTruthy();
    fireEvent.change(inputs()[0], { target: { value: '16' } });
    fireEvent.change(inputs()[1], { target: { value: '16' } });
    submit();
    expect(feedback()).toContain('ზედმეტი კუბიკი ჯერ არ დაგიმატებია');
  });
});

describe('U04.5 word problems: interactions in the player', () => {
  const toQuestion = (id: string) => {
    go('#/student/lessons/g1-u04-l5');
    const first = L5.activities.findIndex((a) => a.id === id);
    L5.activities.slice(0, first).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
  };

  it('the operation and the number are both needed; the answer is kept when a hint is opened', () => {
    toQuestion('practice-2');
    submit();
    expect(feedback()).toContain('აირჩიე');
    fireEvent.click(screen.getByRole('radio', { name: /გამოკლება/ }));
    submit();
    expect(feedback()).toContain('ჩაწერე პასუხი');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '7' } });
    click(/მინიშნება/);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('7');
    expect(screen.getByRole('radio', { name: /გამოკლება/ }).getAttribute('aria-checked')).toBe('true');
  });

  it('the wrong operation revisits the story instead of just marking the answer wrong', () => {
    toQuestion('practice-2');
    fireEvent.click(screen.getByRole('radio', { name: /შეკრება/ }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '15' } });
    submit();
    expect(feedback()).toContain('ბურთები წაიღეს');
    expect(feedback()).toContain('მცირდება');
    expect(feedback()).not.toContain('7');
    retry();
    fireEvent.click(screen.getByRole('radio', { name: /გამოკლება/ }));
    submit();
    expect(feedback()).toContain('11-ზე ნაკლები'); // the operation is now right, so the number (15, kept) is judged
    expect(feedback()).not.toContain('ბურთები წაიღეს');
  });

  it('the right operation with the wrong number is judged by the number', () => {
    toQuestion('practice-2');
    fireEvent.click(screen.getByRole('radio', { name: /გამოკლება/ }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '15' } });
    submit();
    expect(feedback()).toContain('11-ზე ნაკლები');
  });

  it('the scratch model is optional, never graded, and does not change the answer', () => {
    toQuestion('practice-3');
    const details = document.querySelector('details.sa-model') as HTMLDetailsElement;
    expect(details.open).toBe(false);
    details.open = true;
    for (let i = 0; i < 8; i += 1) click('ერთი კუბიკის დამატება მოდელზე');
    expect(document.querySelectorAll('.sa-counters .sw-item')).toHaveLength(8);
    click('ერთი კუბიკის ამოღება მოდელიდან');
    expect(document.querySelectorAll('.sa-counters .sw-item')).toHaveLength(7);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('');
    click('რიცხვითი ღერძი');
    expect(screen.getByRole('slider', { name: 'მარკერი' })).toBeTruthy();
    submit();
    expect(feedback()).toContain('აირჩიე'); // the model did not answer for the student
  });

  it('check: stories without pictures or hints; the phrases differ (more, left, together)', () => {
    const prompts = stageOf(L5, 'check').map((x) => x.prompt);
    expect(prompts.some((p) => /ერთად/.test(p))).toBe(true);
    expect(prompts.some((p) => /დარჩა/.test(p))).toBe(true);
    expect(prompts.some((p) => /ახლა/.test(p))).toBe(true);
    for (const x of stageOf(L5, 'check')) expect(x.visual).toBeUndefined();
    const ops = stageOf(L5, 'check').map((x) => (x.response.type === 'story' ? x.response.operation : ''));
    expect(ops).toContain('add');
    expect(ops).toContain('subtract');
  });

  it('the explore workspace works inside the player and the demonstration reveals the seven steps one by one', () => {
    go('#/student/lessons/g1-u04-l5');
    fireEvent.click(screen.getAllByRole('radio')[0]);
    submit();
    next();
    expect(document.querySelectorAll('.sw-item')).toHaveLength(5);
    click('ერთი საგნის დამატება სურათზე');
    expect(document.querySelectorAll('.sw-item')).toHaveLength(6);
    next();
    // understand: two demonstrations, each with seven steps
    const steps = () => [...document.querySelectorAll('.sd')].map((d) => d.querySelectorAll('.jd-steps li').length);
    expect(steps()).toEqual([7, 7]);
    const first = document.querySelectorAll('.sd')[0] as HTMLElement;
    expect(first.querySelector('.sd-eq')).toBeNull();
    expect(first.querySelector('.sd-chip.is-op')).toBeNull();
    const stepFor = (i: number) => within(document.querySelectorAll('.sd')[i] as HTMLElement).getByRole('button', { name: 'შემდეგი ნაბიჯი' }) as HTMLButtonElement;
    for (let i = 0; i < 4; i += 1) fireEvent.click(stepFor(0));
    expect(first.querySelector('.sd-chip.is-op b')?.textContent).toBe('+');
    expect(first.querySelector('.sd-eq')).toBeNull(); // the equation comes after the operation is chosen
    fireEvent.click(stepFor(0));
    expect(first.querySelector('.sd-eq')?.textContent).toContain('7 + 3 = 10');
    expect(first.querySelector('.sd-ok')).toBeNull();
    fireEvent.click(stepFor(0));
    expect(first.querySelector('.sd-ok')?.textContent).toContain('ისტორიას ემთხვევა');
    expect(stepFor(0).disabled).toBe(true);
    expect(first.querySelectorAll('.jd-steps li.is-done')).toHaveLength(6);
  });
});

describe('demonstrations (understand screens)', () => {
  const understand = (l: Lesson) => l.activities.findIndex((a) => a.stage === 'understand');
  const toUnderstand = (id: string) => {
    const lesson = LESSON_CONTENT[id];
    go(`#/student/lessons/${id}`);
    lesson.activities.slice(0, understand(lesson)).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    return lesson;
  };
  const finish = (index: number, selector: string) => {
    const root = document.querySelectorAll(selector)[index] as HTMLElement;
    const btn = () => within(root).getByRole('button', { name: 'შემდეგი ნაბიჯი' }) as HTMLButtonElement;
    let guard = 0;
    while (!btn().disabled && guard < 20) {
      fireEvent.click(btn());
      guard += 1;
    }
    return root;
  };

  it('U04.1: the start is highlighted first, then each jump appears in turn (6 → 7 → 8 → 9)', () => {
    toUnderstand('g1-u04-l1');
    const root = document.querySelectorAll('.jd')[0] as HTMLElement;
    const btn = () => within(root).getByRole('button', { name: 'შემდეგი ნაბიჯი' });
    const marker = () => root.querySelector('.nl-marker')?.getAttribute('aria-label');
    const activeStep = () => root.querySelector('.jd-steps li.is-active')?.textContent;
    // replay to be sure we are at the start, whatever the timer did
    fireEvent.click(within(root).getByRole('button', { name: /ხელახლა/ }));
    expect(marker()).toBe('მარკერი: რიცხვი 6');
    expect(activeStep()).toContain('პირველი რიცხვიდან');
    expect(root.querySelector('.nl-band')).toBeTruthy();
    fireEvent.click(btn());
    expect(activeStep()).toContain('გავიხსენოთ');
    expect(root.querySelector('.jd-chip')?.textContent).toContain('გახსოვდეს: 6');
    const seen: Array<string | null | undefined> = [];
    for (let i = 0; i < 3; i += 1) {
      fireEvent.click(btn());
      seen.push(marker());
      expect(activeStep()).toContain('ნახტომი');
    }
    expect(seen).toEqual(['მარკერი: რიცხვი 7', 'მარკერი: რიცხვი 8', 'მარკერი: რიცხვი 9']);
    expect(root.querySelectorAll('.obj')).toHaveLength(9);
    fireEvent.click(btn());
    expect(activeStep()).toContain('წავიკითხოთ');
    expect(root.querySelector('.demo-status')?.textContent).toContain('9');
    expect((btn() as HTMLButtonElement).disabled).toBe(true);
  });

  it('U04.2: objects leave one for every jump back, and the number of jumps equals the amount taken away', () => {
    toUnderstand('g1-u04-l2');
    const root = document.querySelectorAll('.jd')[0] as HTMLElement;
    fireEvent.click(within(root).getByRole('button', { name: /ხელახლა/ }));
    expect(root.querySelectorAll('.tab-obj.is-out')).toHaveLength(0);
    const btn = () => within(root).getByRole('button', { name: 'შემდეგი ნაბიჯი' });
    const out = [];
    for (let i = 0; i < 3; i += 1) {
      fireEvent.click(btn());
      out.push(root.querySelectorAll('.tab-obj.is-out').length);
    }
    expect(out).toEqual([1, 2, 3]);
    expect(root.querySelector('.nl-marker')?.getAttribute('aria-label')).toBe('მარკერი: რიცხვი 5');
    fireEvent.click(btn());
    expect(root.querySelector('.jd-steps li.is-active')?.textContent).toContain('შევჩერდეთ');
    expect(root.querySelectorAll('.tab-obj.is-out')).toHaveLength(3);
  });

  it('U04.3: counters move into the frame, exactly the empty spaces, and 10 + the rest is the total', () => {
    toUnderstand('g1-u04-l3');
    const root = document.querySelectorAll('.jd')[0] as HTMLElement;
    fireEvent.click(within(root).getByRole('button', { name: /ხელახლა/ }));
    const zone = (z: number) => root.querySelectorAll(`.cb-counter[data-zone="${z}"]`).length;
    const cards = () => [...root.querySelectorAll('.sc-card strong')].map((c) => c.textContent);
    expect([zone(0), zone(1)]).toEqual([8, 5]);
    const btn = () => within(root).getByRole('button', { name: 'შემდეგი ნაბიჯი' });
    fireEvent.click(btn()); // the empty spaces
    expect(root.querySelector('.demo-status')?.textContent).toContain('2 ცარიელი');
    fireEvent.click(btn()); // split
    expect(cards()).toEqual(['8 + 5', '8 + 2 + 3', '?', '?']);
    expect([zone(0), zone(1)]).toEqual([8, 5]); // nothing has moved yet
    fireEvent.click(btn()); // move
    expect([zone(0), zone(1)]).toEqual([10, 3]);
    fireEvent.click(btn());
    expect(cards()).toEqual(['8 + 5', '8 + 2 + 3', '10 + 3', '?']);
    fireEvent.click(btn());
    expect(cards()).toEqual(['8 + 5', '8 + 2 + 3', '10 + 3', '13']);
    expect(root.querySelector('.demo-status')?.textContent).toContain('ჯამი იგივეა');
    expect(zone(0) + zone(1)).toBe(13);
  });

  it('U04.4: equal groups pair off, the extra counter is marked, and 4 + 4 = 8 comes before 8 + 1 = 9', () => {
    toUnderstand('g1-u04-l4');
    const roots = [...document.querySelectorAll('.jd')] as HTMLElement[];
    expect(roots).toHaveLength(2);
    const near = finish(1, '.jd');
    expect(near.querySelector('.dbl')?.getAttribute('aria-label')).toContain('გაერთიანებულია');
    expect([...near.querySelectorAll('.sc-card strong')].map((c) => c.textContent)).toEqual(['4 + 5', '4 + 4 = 8', '8 + 1', '9']);
    fireEvent.click(within(near).getByRole('button', { name: /ხელახლა/ }));
    expect(near.querySelectorAll('.dbl-item.is-paired, .dbl-item.is-extra')).toHaveLength(0);
    fireEvent.click(within(near).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(near.querySelectorAll('.dbl-item.is-paired')).toHaveLength(8);
    fireEvent.click(within(near).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(near.querySelectorAll('.dbl-item.is-extra')).toHaveLength(1);
    expect(document.body.textContent).toContain('ყველა მიმატება ორმაგით არ იხსნება');
    const double = finish(0, '.jd');
    expect([...double.querySelectorAll('.sc-card strong')].map((c) => c.textContent)).toEqual(['3 + 3', '3 + 3 = 6', '6']);
  });

  it('U04.5: the demonstration keeps the picture, the sign and the equation in step', () => {
    toUnderstand('g1-u04-l5');
    const second = finish(1, '.sd');
    expect(second.querySelector('.sd-eq')?.textContent).toContain('9 − 4 = 5');
    expect(second.querySelector('.sd-chip.is-op b')?.textContent).toBe('−');
    expect(second.querySelectorAll('.storyscene .obj.is-extra')).toHaveLength(4);
    expect(second.querySelectorAll('.storyscene .obj')).toHaveLength(9);
  });
});

describe('completion and progress', () => {
  it('U04.5 completes the unit only when all five lessons are done, using the existing rules', () => {
    // four lessons already completed through the same storage the player writes
    const done = Object.fromEntries(IDS.slice(0, 4).map((id) => [id, { status: 'completed', checkCorrect: 3, checkTotal: 3, completedAt: 1 }]));
    window.localStorage.setItem(LEARN_STORAGE_KEY, JSON.stringify(done));
    resetProgressCache();
    go('#/student/lessons/g1-u04-l5');
    playThrough(L5);
    expect(screen.getByText(/U04 დასრულდა/)).toBeTruthy();
    expect(saved()['g1-u04-l5']).toMatchObject({ status: 'completed', checkCorrect: 3 });
  });

  it('failing the check does not complete the lesson; the check can be repeated', () => {
    go('#/student/lessons/g1-u04-l3');
    const firstCheck = L3.activities.findIndex((a) => a.stage === 'check');
    L3.activities.slice(0, firstCheck).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    for (let i = 0; i < 3; i += 1) {
      const fill = () => {
        if (document.querySelectorAll('input[type="text"], input:not([type])').length > 0) inputs().forEach((el) => fireEvent.change(el, { target: { value: '0' } }));
        else fireEvent.click(screen.getAllByRole('radio')[0]);
      };
      fill();
      submit();
      retry();
      fill();
      submit();
      click(/გაგრძელება|დასრულება/);
    }
    expect(screen.getByRole('heading', { name: 'ჯერ არ დასრულებულა' })).toBeTruthy();
    expect(saved()['g1-u04-l3']?.status).not.toBe('completed');
    click('შემოწმების გამეორება');
    expect(screen.getByText(/ნაბიჯი 7 \/ 9/)).toBeTruthy();
  });
});

describe('style: motion and layout safeguards', () => {
  const css = readFileSync('src/lessons/learn.css', 'utf8');
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));
  it('every animated U04 class is switched off under reduced motion', () => {
    for (const cls of ['.nl-marker', '.tab-obj', '.dbl-item', '.sc-card', '.jb-review', '.sw-item', '.sd-eq']) expect(reduced, cls).toContain(cls);
  });
  it('the boards scale with the screen (percentage positions, no fixed pixel widths larger than a phone)', () => {
    for (const cls of ['.tab', '.dbl']) {
      const rule = css.split('\n').find((l) => l.startsWith(`${cls} {`)) ?? '';
      expect(rule, cls).toContain('width: 100%');
      expect(rule, cls).toContain('max-width');
    }
  });
});

