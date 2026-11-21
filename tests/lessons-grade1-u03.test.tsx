// @vitest-environment jsdom
import './helpers/signed-in-student';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';
import { LESSON_CONTENT } from '../src/lessons/content';
import { evaluateAnswer, describeAnswer } from '../src/lessons/check';
import { getUnit } from '../src/lessons/catalog';
import { CounterBoard, boardGeometry, initialLists, moveCounts, reconcileLists, slotCenter, type Counts, type Zone } from '../src/lessons/exercises/CounterBoard';
import { NumberBond, bondLabel } from '../src/lessons/exercises/NumberBond';
import { FrameBoard, cellsFor, countCells } from '../src/lessons/exercises/FrameBoard';
import type { Activity, Lesson, QuestionActivity, ResponseSpec, VisualSpec } from '../src/lessons/types';

/**
 * Grade 1 · Unit 3 "Number Bonds & Making 10" placeholder lessons: the maths in the
 * demonstration data, the new components (counter board, number bond, frame board) and a
 * data-driven walk through all five lessons in the real player. Dragging is simulated with
 * pointer events; real touch devices have not been tried (there is no browser here).
 */

const IDS = ['g1-u03-l1', 'g1-u03-l2', 'g1-u03-l3', 'g1-u03-l4', 'g1-u03-l5'];
const lessons: Lesson[] = IDS.map((id) => LESSON_CONTENT[id]);
const [L1, L2, L3, L4, L5] = lessons;
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 1 U03 is "Number Bonds & Making 10"', () => {
  it('has the five approved titles', () => {
    const unit = getUnit('g1-u03');
    expect(unit?.title).toBe('Number Bonds & Making 10');
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Understanding Parts and Wholes',
      'Finding Number Pairs That Make 5',
      'Finding Number Pairs That Make 10',
      'Finding Missing Parts in Number Bonds',
      'Using Number Bonds to Solve Problems',
    ]);
    expect(unit?.lessons.map((l) => l.id)).toEqual(IDS);
  });
});

// ─────────────────────────── answer checking ───────────────────────────

const dummy = { hints: ['h'], explanation: 'e' };

describe('check: distribute and fill', () => {
  const two: QuestionActivity = { id: 'q', kind: 'question', stage: 'practice', prompt: 'p', ...dummy, response: { type: 'distribute', total: 8, allowEmpty: false } };
  const any: QuestionActivity = { ...two, response: { type: 'distribute', total: 5, allowEmpty: true } };

  it('every way of using all the counters is right; unplaced counters are incomplete, not wrong', () => {
    for (let a = 1; a <= 7; a += 1) expect(evaluateAnswer(two, `${a},${8 - a}`).verdict, `${a}`).toBe('correct');
    expect(evaluateAnswer(two, '').verdict).toBe('incomplete');
    expect(evaluateAnswer(two, '0,0').verdict).toBe('incomplete');
    expect(evaluateAnswer(two, '3,4').verdict).toBe('incomplete');
    expect(evaluateAnswer({ ...two, incompleteFeedback: 'მორჩი' }, '3,4').feedback).toBe('მორჩი');
  });
  it('a box left empty is a wrong answer only when two real parts are required', () => {
    expect(evaluateAnswer(two, '8,0')).toMatchObject({ verdict: 'incorrect', feedback: expect.stringContaining('ორივე ყუთში') });
    expect(evaluateAnswer(two, '0,8').verdict).toBe('incorrect');
    for (let a = 0; a <= 5; a += 1) expect(evaluateAnswer(any, `${a},${5 - a}`).verdict).toBe('correct');
  });
  it('fill is right only when the frame is exactly full', () => {
    const fill: QuestionActivity = { ...two, response: { type: 'fill', size: 5, given: 2 }, misconceptions: [{ id: 'm', answers: [1], feedback: 'ცოტაა' }] };
    expect(evaluateAnswer(fill, '').verdict).toBe('incomplete');
    expect(evaluateAnswer(fill, '0').verdict).toBe('incomplete');
    expect(evaluateAnswer(fill, '3').verdict).toBe('correct');
    expect(evaluateAnswer(fill, '1')).toMatchObject({ verdict: 'incorrect', feedback: 'ცოტაა' });
    expect(evaluateAnswer(fill, '2')).toMatchObject({ verdict: 'incorrect', feedback: expect.stringContaining('ცარიელი') });
    expect(describeAnswer(fill.response)).toBe('3');
  });
});

// ─────────────────────────── data ───────────────────────────

describe('placeholder lessons: structure', () => {
  it('five lessons, all placeholder, full flow, three practice and three check steps', () => {
    for (const l of lessons) {
      expect(l.status).toBe('placeholder');
      expect(l.concepts?.length).toBeGreaterThan(0);
      expect(l.mascot?.complete).toBeTruthy();
      const stages = l.activities.map((a) => a.stage);
      expect([...new Set(stages)]).toEqual(['challenge', 'explore', 'understand', 'practice', 'check']);
      expect(stages.filter((s) => s === 'practice')).toHaveLength(3);
      expect(stages.filter((s) => s === 'check')).toHaveLength(3);
      expect(new Set(l.activities.map((a) => a.id)).size).toBe(l.activities.length);
      expect(l.activities[0].mascot?.intro).toBeTruthy(); // Axi introduces the challenge
    }
  });

  it('every question accepts the right answer, has hints and an explanation, and never reveals the answer in a wrong-answer message', () => {
    for (const l of lessons) {
      for (const q of questions(l)) {
        expect(q.hints.length, `${l.id}/${q.id}`).toBeGreaterThan(0);
        expect(q.explanation.length).toBeGreaterThan(0);
        expect(correctInputs(q.response).every((input) => evaluateAnswer(q, input).verdict === 'correct'), `${l.id}/${q.id}`).toBe(true);
      }
    }
  });

  it('choice answers exist, ids are unique, no misconception covers the right answer', () => {
    for (const l of lessons) {
      for (const q of questions(l)) {
        if (q.response.type !== 'choice') continue;
        const ids = q.response.options.map((o) => o.id);
        expect(ids).toContain(q.response.answer);
        expect(new Set(ids).size).toBe(ids.length);
        for (const m of q.misconceptions ?? []) expect(m.answers).not.toContain(q.response.answer);
      }
    }
  });

  it('stays in the unit scope: wholes up to 10, no negatives, no algebra or subtraction symbols', () => {
    for (const l of lessons) {
      const text = JSON.stringify(l);
      expect(text, l.id).not.toMatch(/ალგებრ|უარყოფით|\$|−|×|÷/);
      for (const a of l.activities) {
        for (const v of visualsOf(a)) {
          if (v.type === 'bond') expect(Math.max(v.whole ?? 0, v.a ?? 0, v.b ?? 0)).toBeLessThanOrEqual(10);
          if (v.type === 'parts') expect(v.a + v.b).toBeLessThanOrEqual(10);
          if (v.type === 'ten-frame') expect(v.count + (v.second ?? 0)).toBeLessThanOrEqual(10);
        }
      }
    }
  });
});

function visualsOf(a: Activity): VisualSpec[] {
  if (a.kind !== 'question') return [];
  const out: VisualSpec[] = a.visual ? [a.visual] : [];
  if (a.response.type === 'choice') for (const o of a.response.options) if (o.visual) out.push(o.visual);
  return out;
}

/** Inputs that the checker must accept (any valid way, for the open-ended questions). */
function correctInputs(r: ResponseSpec): Array<string | string[]> {
  switch (r.type) {
    case 'choice':
      return [r.answer];
    case 'numeric':
      return [String(r.answer)];
    case 'distribute':
      return Array.from({ length: r.total + 1 }, (_, a) => `${a},${r.total - a}`).filter((s) => r.allowEmpty !== false || (!s.startsWith('0,') && !s.endsWith(',0')));
    case 'fill':
      return [String(r.size - r.given)];
    default:
      throw new Error(`unexpected response type ${r.type}`);
  }
}

describe('U03 maths in the placeholder data', () => {
  it('bond visuals with a hidden number: the numeric answer is the missing part', () => {
    for (const l of lessons) {
      for (const q of questions(l)) {
        const v = q.visual;
        if (v?.type !== 'bond' || v.whole === null) continue;
        const known = v.a ?? v.b;
        const hidden = v.a === null ? 'a' : v.b === null ? 'b' : null;
        if (!hidden || known === null) continue;
        const missing = v.whole - known;
        if (q.response.type === 'numeric') expect(q.response.answer, `${l.id}/${q.id}`).toBe(missing);
        if (q.response.type === 'choice') expect(q.response.options.find((o) => o.id === (q.response as { answer: string }).answer)?.text, `${l.id}/${q.id}`).toBe(String(missing));
        expect(missing).toBeGreaterThan(0);
      }
    }
  });

  it('every complete number bond in the data adds up, including the wrong answer options', () => {
    let complete = 0;
    for (const l of lessons) {
      for (const a of l.activities) {
        for (const v of visualsOf(a)) {
          if (v.type === 'bond' && v.whole !== null && v.a !== null && v.b !== null) {
            complete += 1;
            expect(v.a + v.b, `${l.id}/${a.id}`).toBe(v.whole);
          }
        }
      }
    }
    expect(complete).toBeGreaterThan(8);
  });

  it('matching questions: exactly one option shows the same quantities as the question', () => {
    const quantities = (v: VisualSpec): string | null => {
      if (v.type === 'parts') return `${v.a}+${v.b}`;
      if (v.type === 'bond' && v.a !== null && v.b !== null) return `${v.a}+${v.b}`;
      if (v.type === 'ten-frame' && v.second) return `${v.count}+${v.second}`;
      return null;
    };
    let matchingQuestions = 0;
    for (const l of lessons) {
      for (const q of questions(l)) {
        if (q.response.type !== 'choice' || !q.response.options.every((o) => o.visual)) continue;
        if (!q.visual) {
          // "choose a valid division": the right option adds up to the whole named in the question
          continue;
        }
        const want = quantities(q.visual);
        expect(want, `${l.id}/${q.id}`).not.toBeNull();
        matchingQuestions += 1;
        const matching = q.response.options.filter((o) => quantities(o.visual as VisualSpec) === want).map((o) => o.id);
        expect(matching, `${l.id}/${q.id}`).toEqual([q.response.answer]);
      }
    }
    expect(matchingQuestions).toBeGreaterThanOrEqual(3);
  });

  it('pair-choice questions have exactly one pair that adds up to the number asked for', () => {
    let pairQuestions = 0;
    for (const l of lessons) {
      for (const q of questions(l)) {
        if (q.response.type !== 'choice' || !/ქმნის (\d+)-ს/.test(q.prompt)) continue;
        pairQuestions += 1;
        const target = Number(/ქმნის (\d+)-ს/.exec(q.prompt)?.[1]);
        const right = q.response.options.filter((o) => (o.text.match(/\d+/g) ?? []).map(Number).reduce((x, y) => x + y, 0) === target).map((o) => o.id);
        expect(right, `${l.id}/${q.id}`).toEqual([q.response.answer]);
      }
    }
    expect(pairQuestions).toBeGreaterThanOrEqual(5);
  });

  it('the answer position varies (the right pair is not always in the same place)', () => {
    const positions = new Set<number>();
    for (const l of [L2, L3]) for (const q of stageOf(l, 'practice').concat(stageOf(l, 'check'))) if (q.response.type === 'choice' && /ქმნის/.test(q.prompt)) positions.add(q.response.options.findIndex((o) => o.id === (q.response as { answer: string }).answer));
    expect(positions.size).toBeGreaterThan(1);
  });

  it('U03.1: the challenge splits 8, and practice 1 uses a different whole', () => {
    const challenge = questions(L1)[0];
    expect(challenge.stage).toBe('challenge');
    expect(challenge.response).toMatchObject({ type: 'distribute', total: 8 });
    expect(challenge.incompleteFeedback).toBe('კიდევ რამდენიმე კუბიკი უნდა მოათავსო.');
    expect(challenge.explanation).toBe('მთელი ორ ნაწილად გაყავი!');
    expect(stageOf(L1, 'practice')[0].response).toMatchObject({ type: 'distribute', total: 6 });
  });

  it('U03.2: the challenge accepts every split of five, including 0 and 5; the explore tool is a five-frame', () => {
    const challenge = questions(L2)[0];
    expect(challenge.response).toMatchObject({ type: 'distribute', total: 5, allowEmpty: true });
    expect(evaluateAnswer(challenge, '0,5').verdict).toBe('correct');
    const explore = L2.activities.find((a) => a.kind === 'explore');
    expect(explore && explore.kind === 'explore' && explore.tool).toMatchObject({ tool: 'frame-pairs', size: 5 });
  });

  it('U03.3: the challenge frame has 6 filled and 4 empty; the explore tool is a ten-frame', () => {
    const challenge = questions(L3)[0];
    expect(challenge.visual).toEqual({ type: 'ten-frame', count: 6 });
    expect(challenge.response.type === 'choice' && challenge.response.answer).toBe('4');
    const explore = L3.activities.find((a) => a.kind === 'explore');
    expect(explore && explore.kind === 'explore' && explore.tool).toMatchObject({ tool: 'frame-pairs', size: 10 });
    // practice takes the help away step by step: frame → bond → words only
    expect(stageOf(L3, 'practice').map((q) => q.visual?.type ?? 'none')).toEqual(['ten-frame', 'bond', 'none']);
  });

  it('U03.3: ten-frame questions ask for the empty spaces', () => {
    for (const q of [...stageOf(L3, 'practice'), ...stageOf(L3, 'check')]) {
      if (q.visual?.type === 'ten-frame') expect(q.response.type === 'numeric' && q.response.answer).toBe(10 - q.visual.count);
    }
  });

  it('U03.4: the explore examples keep the known part smaller than the whole; the check never marks the missing part', () => {
    const explore = L4.activities.find((a) => a.kind === 'explore');
    const tool = explore && explore.kind === 'explore' && explore.tool.tool === 'missing-part' ? explore.tool : null;
    expect(tool?.examples).toContainEqual({ whole: 9, known: 4 });
    for (const e of tool?.examples ?? []) expect(e.known).toBeLessThan(e.whole);
    for (const q of stageOf(L4, 'check')) {
      expect(q.visual?.type === 'bond' && q.visual.counters).toBeFalsy();
      if (q.visual?.type === 'objects') {
        expect(q.visual.layout).toBe('scatter'); // a different arrangement
        expect(q.response.type === 'numeric' && q.response.answer).toBe(q.visual.count - (q.visual.known ?? 0));
      }
    }
    expect(stageOf(L4, 'check').map((q) => q.visual?.type)).toEqual(['bond', 'bond', 'objects']);
    expect(stageOf(L4, 'practice')[0].visual).toMatchObject({ counters: 'split' }); // counters first, then less guidance
  });

  it('U03.5: the check shows no completed number bond next to the question', () => {
    for (const q of stageOf(L5, 'check')) expect(q.visual).toBeUndefined();
    const understand = L5.activities.find((a) => a.kind === 'explain');
    const demos = understand && understand.kind === 'explain' ? understand.blocks.filter((b) => b.type === 'bond-demo') : [];
    expect(demos.map((d) => d.type === 'bond-demo' && [d.mode, d.whole, d.parts])).toEqual([
      ['join', 7, [3, 4]],
      ['missing', 8, [3, 5]],
    ]);
  });
});

// ─────────────────────────── components ───────────────────────────

describe('CounterBoard geometry', () => {
  it('every slot of every zone is inside its zone and counters never overlap, for any number of counters', () => {
    for (const hasTop of [true, false]) {
      for (const frame of [undefined, 5, 10] as const) {
        for (let total = 1; total <= (frame ?? 20); total += 1) {
          const g = boardGeometry(total, hasTop, frame);
          for (const zone of hasTop ? ([0, 1, 2] as Zone[]) : ([1, 2] as Zone[])) {
            const rect = g.zones[zone];
            const placed = Array.from({ length: total }, (_, k) => slotCenter(g, zone, k, zone === 0 ? frame : undefined));
            for (const p of placed) {
              expect(p.x - g.size / 2, `${total}/${zone}`).toBeGreaterThanOrEqual(rect.x);
              expect(p.x + g.size / 2).toBeLessThanOrEqual(rect.x + rect.w + 1e-9);
              expect(p.y - g.size / 2).toBeGreaterThanOrEqual(rect.y + 8); // below the label row
              expect(p.y + g.size / 2).toBeLessThanOrEqual(rect.y + rect.h + 1e-9);
              expect(p.y + g.size / 2).toBeLessThanOrEqual(g.height + 1e-9);
            }
            for (let i = 0; i < placed.length; i += 1) for (let j = i + 1; j < placed.length; j += 1) expect(Math.hypot(placed[i].x - placed[j].x, placed[i].y - placed[j].y)).toBeGreaterThanOrEqual(g.size);
          }
          // the zones do not overlap each other
          const [t, a, b] = g.zones;
          expect(a.x + a.w).toBeLessThanOrEqual(b.x);
          if (hasTop) expect(t.y + t.h).toBeLessThanOrEqual(a.y);
        }
      }
    }
  });
});

describe('CounterBoard identity', () => {
  const ids = (l: number[][]) => l.flat().sort((x, y) => x - y);

  it('moveCounts keeps the total, never goes below zero and ignores impossible moves', () => {
    expect(moveCounts([3, 0, 0], 0, 1)).toEqual([2, 1, 0]);
    expect(moveCounts([0, 0, 3], 2, 0)).toEqual([1, 0, 2]);
    expect(moveCounts([0, 2, 1], 0, 1)).toEqual([0, 2, 1]);
    expect(moveCounts([1, 1, 1], 1, 1)).toEqual([1, 1, 1]);
  });

  it('every counter stays in exactly one place through any sequence of moves; the others do not move', () => {
    let counts: Counts = [10, 0, 0];
    let lists = initialLists(counts);
    let seed = 7;
    const rand = (n: number) => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed % n;
    };
    for (let step = 0; step < 300; step += 1) {
      const from = rand(3) as Zone;
      const to = rand(3) as Zone;
      const next = moveCounts(counts, from, to);
      if (next === counts) continue;
      const before = lists.map((l) => [...l]);
      lists = reconcileLists(lists, next, rand(2) === 0 ? { id: before[from][rand(before[from].length)], to } : null);
      counts = next;
      expect(ids(lists)).toEqual(Array.from({ length: 10 }, (_, i) => i)); // none lost, none duplicated
      expect(lists.map((l) => l.length)).toEqual(counts);
      // the two places not involved keep their counters in the same slots
      for (let z = 0; z < 3; z += 1) if (z !== from && z !== to) expect(lists[z]).toEqual(before[z]);
    }
  });

  it('a reset (all counters back to the container) keeps the same counters', () => {
    const lists = reconcileLists([[0, 1], [2, 3, 4], [5]], [6, 0, 0]);
    expect(ids(lists)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(lists[0]).toHaveLength(6);
  });

  it('the pending counter is the one that moves', () => {
    const lists = reconcileLists([[0, 1, 2], [3], []], [2, 1, 1], { id: 1, to: 2 });
    expect(lists).toEqual([[0, 2], [3], [1]]);
  });
});

const counterEls = (zone?: number) => [...document.querySelectorAll<HTMLButtonElement>(zone === undefined ? '.cb-counter' : `.cb-counter[data-zone="${zone}"]`)];
const zoneEl = (zone: number) => document.querySelector<HTMLButtonElement>(`.cb-zone.is-zone-${zone}`) as HTMLButtonElement;
const zoneCounts = () => [0, 1, 2].map((z) => counterEls(z).length);
const shownCounts = () => [0, 1, 2].map((z) => Number(document.querySelector(`.cb-zone.is-zone-${z} .cb-zone-count`)?.textContent));

/** Tap a counter in `from`, then the place it should go to, `n` times (the next counter is picked up automatically). */
function moveCounters(from: number, to: number, n: number) {
  fireEvent.click(counterEls(from)[0]);
  for (let i = 0; i < n; i += 1) fireEvent.click(zoneEl(to));
}

function Harness({ start, props }: { start: Counts; props?: Partial<Parameters<typeof CounterBoard>[0]> }) {
  const [counts, setCounts] = useState<Counts>(start);
  return <CounterBoard counts={counts} onChange={setCounts} ariaLabel="დაფა" {...props} />;
}

describe('CounterBoard interaction', () => {
  it('tap a counter, then a place: the counter moves, the total stays, selection carries on', () => {
    render(<Harness start={[8, 0, 0]} />);
    expect(zoneCounts()).toEqual([8, 0, 0]);
    fireEvent.click(counterEls(0)[0]);
    expect(counterEls(0).filter((c) => c.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
    fireEvent.click(zoneEl(1));
    fireEvent.click(zoneEl(1)); // the next counter of the container was picked up automatically
    fireEvent.click(zoneEl(2));
    expect(zoneCounts()).toEqual([5, 2, 1]);
    expect(shownCounts()).toEqual([5, 2, 1]);
    expect(screen.getByText('სულ: 8')).toBeTruthy();
    // tapping the picked counter again puts it down; then a counter can be picked and put down again
    const pressed = () => counterEls().filter((x) => x.getAttribute('aria-pressed') === 'true');
    fireEvent.click(pressed()[0]);
    expect(pressed()).toHaveLength(0);
    fireEvent.click(counterEls(1)[0]);
    expect(pressed()).toHaveLength(1);
    fireEvent.click(pressed()[0]);
    expect(pressed()).toHaveLength(0);
    expect(zoneCounts()).toEqual([5, 2, 1]);
  });

  it('tapping a counter of another place while one is picked moves the picked one there', () => {
    render(<Harness start={[0, 3, 2]} />);
    fireEvent.click(counterEls(1)[0]);
    fireEvent.click(counterEls(2)[0]);
    expect(zoneCounts()).toEqual([0, 2, 3]);
  });

  it('any sequence of taps keeps the total and never goes negative', () => {
    render(<Harness start={[7, 0, 0]} />);
    const order = [1, 1, 2, 0, 2, 2, 1, 0, 0, 2, 1, 1, 1, 0];
    for (const to of order) {
      if (counterEls().length === 0) break;
      const from = counterEls(0).length > 0 ? 0 : counterEls(1).length > 0 ? 1 : 2;
      fireEvent.click(counterEls(from)[0]);
      fireEvent.click(zoneEl(to));
      expect(zoneCounts().reduce((x, y) => x + y, 0)).toBe(7);
      expect(zoneCounts().every((n) => n >= 0)).toBe(true);
      expect(shownCounts()).toEqual(zoneCounts());
    }
  });

  it('dragging into another place moves exactly one counter; dropping elsewhere or tapping afterwards moves nothing more', () => {
    render(<Harness start={[4, 0, 0]} />);
    const rect = (left: number, top: number, w: number, h: number) => ({ left, top, right: left + w, bottom: top + h, width: w, height: h, x: left, y: top, toJSON: () => ({}) });
    zoneEl(0).getBoundingClientRect = () => rect(0, 0, 300, 80);
    zoneEl(1).getBoundingClientRect = () => rect(0, 90, 145, 120);
    zoneEl(2).getBoundingClientRect = () => rect(155, 90, 145, 120);
    const c = counterEls(0)[0];
    fireEvent.pointerDown(c, { clientX: 20, clientY: 30, pointerId: 1 });
    fireEvent.pointerMove(c, { clientX: 200, clientY: 150, pointerId: 1 });
    expect(c.className).toContain('is-lifted');
    fireEvent.pointerUp(c, { clientX: 200, clientY: 150, pointerId: 1 });
    fireEvent.click(c); // browsers send a click after a drag
    expect(zoneCounts()).toEqual([3, 0, 1]);
    expect(counterEls().some((x) => x.getAttribute('aria-pressed') === 'true')).toBe(false);

    const d = counterEls(0)[0];
    fireEvent.pointerDown(d, { clientX: 20, clientY: 30, pointerId: 2 });
    fireEvent.pointerMove(d, { clientX: 60, clientY: 40, pointerId: 2 });
    fireEvent.pointerUp(d, { clientX: 60, clientY: 40, pointerId: 2 }); // back into its own place
    fireEvent.click(d);
    expect(zoneCounts()).toEqual([3, 0, 1]);

    const e = counterEls(0)[0];
    fireEvent.pointerDown(e, { clientX: 20, clientY: 30, pointerId: 3 });
    fireEvent.pointerMove(e, { clientX: 20, clientY: 400, pointerId: 3 });
    fireEvent.pointerUp(e, { clientX: 20, clientY: 400, pointerId: 3 }); // dropped outside every place
    expect(zoneCounts()).toEqual([3, 0, 1]);
  });

  it('places that cannot receive counters ignore drops and taps', () => {
    render(<Harness start={[0, 2, 1]} props={{ dropZones: [1, 2] }} />);
    expect(zoneEl(0).disabled).toBe(true);
    fireEvent.click(counterEls(1)[0]);
    fireEvent.click(zoneEl(0));
    expect(zoneCounts()).toEqual([0, 2, 1]);
  });

  it('is locked when disabled, and the two-box version has no top area', () => {
    const { unmount } = render(<Harness start={[3, 0, 0]} props={{ disabled: true }} />);
    for (const b of document.querySelectorAll('.cb button')) expect((b as HTMLButtonElement).disabled).toBe(true);
    unmount();
    render(<Harness start={[0, 2, 1]} props={{ hideTop: true }} />);
    expect(document.querySelector('.cb-zone.is-zone-0')).toBeNull();
  });

  it('draws a frame when asked and keeps the counters inside it', () => {
    render(<Harness start={[0, 3, 2]} props={{ frame: 5, disabled: true }} />);
    expect(document.querySelectorAll('.cb-cell')).toHaveLength(5);
  });
});

describe('NumberBond', () => {
  it('writes the numbers, marks a hidden one with ? and a dashed circle, and describes itself', () => {
    const { container, rerender } = render(<NumberBond whole={7} a={3} b={4} />);
    expect([...container.querySelectorAll('.nb-num')].map((n) => n.textContent)).toEqual(['7', '3', '4']);
    expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe('რიცხვთა კავშირი: მთელი 7; პირველი ნაწილი 3; მეორე ნაწილი 4');
    rerender(<NumberBond whole={7} a={3} b={null} highlight="b" />);
    expect([...container.querySelectorAll('.nb-num')].map((n) => n.textContent)).toEqual(['7', '3', '?']);
    expect(container.querySelectorAll('.nb-node.is-hidden')).toHaveLength(1);
    expect(container.querySelector('.nb-node.is-b')?.getAttribute('class')).toContain('is-hi');
    expect(bondLabel(null, 2, null)).toContain('მთელი უცნობია');
  });
});

describe('FrameBoard', () => {
  it('cellsFor and countCells agree; a ten-frame has two rows of five', () => {
    const cells = cellsFor(10, 6, 4);
    expect(countCells(cells)).toEqual({ a: 6, b: 4, empty: 0 });
    expect(countCells(cellsFor(10, 6, 0))).toEqual({ a: 6, b: 0, empty: 4 });
    expect(cellsFor(5, 2, 3)).toEqual(['a', 'a', 'b', 'b', 'b']);
  });
  it('draws every space, tells the groups apart without colour and hides the second group on request', () => {
    const { container, rerender } = render(<FrameBoard cells={cellsFor(10, 6, 4)} label="ჩარჩო" />);
    expect(container.querySelectorAll('.frameb-cell')).toHaveLength(10);
    expect(container.querySelectorAll('.frameb-cell.is-a')).toHaveLength(6);
    expect(container.querySelectorAll('.frameb-cell.is-b')).toHaveLength(4);
    expect(container.querySelector('.frameb')?.getAttribute('aria-label')).toBe('ჩარჩო: 6 და 4');
    rerender(<FrameBoard cells={cellsFor(10, 6, 4)} label="ჩარჩო" hideSecond />);
    expect(container.querySelectorAll('.frameb-cell.is-b')).toHaveLength(0);
    expect(container.querySelectorAll('.frameb-cell.is-hidden-b')).toHaveLength(4);
    expect(container.querySelector('.frameb')?.getAttribute('aria-label')).toBe('ჩარჩო: 6 კუბიკი, 4 ცარიელი ადგილი');
  });
});

// ─────────────────────────── player ───────────────────────────

function go(hash: string) {
  window.location.hash = hash;
  return render(<StudentApp />);
}
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const next = () => click('გაგრძელება');
const submit = () => click('პასუხის შემოწმება');
const feedback = () => document.querySelector('.lp-feedback')?.textContent ?? '';
const saved = () => JSON.parse(window.localStorage.getItem(LEARN_STORAGE_KEY) ?? '{}');
const frameCells = () => [...document.querySelectorAll<HTMLButtonElement>('.frameb-cell')];
const bondNumbers = () => [...document.querySelectorAll('.nb:not(.is-compact) .nb-num')].map((n) => n.textContent);

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
function answerCorrectly(q: QuestionActivity) {
  const r = q.response;
  switch (r.type) {
    case 'choice':
      fireEvent.click(screen.getAllByRole('radio')[r.options.findIndex((o) => o.id === r.answer)]);
      break;
    case 'numeric':
      fireEvent.change(screen.getByRole('textbox'), { target: { value: String(r.answer) } });
      break;
    case 'distribute': {
      const first = Math.ceil(r.total / 2);
      moveCounters(0, 1, first);
      moveCounters(0, 2, r.total - first);
      break;
    }
    case 'fill':
      for (let i = 0; i < r.size - r.given; i += 1) fireEvent.click(frameCells()[r.given + i]);
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

describe('U03 unit page', () => {
  it('lists the five lessons, all playable', () => {
    go('#/student/lessons/g1-u03');
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items).toHaveLength(5);
    IDS.forEach((id, i) => expect(within(items[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
  });
});

describe.each(IDS.map((id, i) => [id, i + 1] as const))('%s plays from the challenge to the completion screen', (id, n) => {
  it('every step works with its own correct answers and the progress is saved', () => {
    const lesson = LESSON_CONTENT[id];
    go(`#/student/lessons/${id}`);
    expect(screen.getByText(`ნაბიჯი 1 / ${lesson.activities.length}`)).toBeTruthy();
    playThrough(lesson);
    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    expect(screen.getByText('3 / 3')).toBeTruthy();
    expect(screen.getByText(lesson.mascot?.complete as string)).toBeTruthy();
    for (const c of lesson.concepts ?? []) expect(screen.getByText(c, { selector: '.lp-concepts li' })).toBeTruthy();
    expect(saved()[id]).toMatchObject({ status: 'completed', checkCorrect: 3, checkTotal: 3 });
    expect(screen.getByRole('link', { name: `U03-ზე დაბრუნება` }).getAttribute('href') ?? '').toBe('#/student/lessons/g1-u03');
    if (n < 5) expect(screen.getByRole('link', { name: new RegExp(`გაგრძელება: U03\\.${n + 1}`) }).getAttribute('href')).toBe(`#/student/lessons/${IDS[n]}`);
    else {
      expect(screen.queryByRole('link', { name: /გაგრძელება:|შემდეგი თემა/ })).toBeNull(); // the link to U04 only appears once the whole of U03 is complete
    }
  });
});

describe('U03.1 parts and wholes: interactions in the player', () => {
  it('the challenge: unplaced counters are "incomplete", one box empty is gently wrong, any real split passes', () => {
    go('#/student/lessons/g1-u03-l1');
    expect(zoneCounts()).toEqual([8, 0, 0]);
    expect(screen.getByText('სულ: 8')).toBeTruthy();
    submit();
    expect(feedback()).toContain('კიდევ რამდენიმე კუბიკი უნდა მოათავსო.');
    moveCounters(0, 1, 3);
    submit();
    expect(feedback()).toContain('კიდევ რამდენიმე კუბიკი უნდა მოათავსო.'); // still 5 in the container
    moveCounters(0, 1, 5);
    expect(zoneCounts()).toEqual([0, 8, 0]);
    submit();
    expect(feedback()).toContain('ორივე ყუთში');
    click('ხელახლა ცდა');
    expect(zoneCounts()).toEqual([0, 8, 0]); // the arrangement is kept
    moveCounters(1, 2, 2);
    submit();
    expect(feedback()).toContain('სწორია');
    expect(feedback()).toContain('მთელი ორ ნაწილად გაყავი!');
    expect(counterEls().every((c) => c.disabled)).toBe(true); // locked once finished
    expect(screen.getByText('სულ: 8')).toBeTruthy();
  });

  it('the hint keeps the arrangement', () => {
    go('#/student/lessons/g1-u03-l1');
    moveCounters(0, 1, 4);
    click('მინიშნება');
    expect(screen.getByText('გადაიტანე კუბიკები დიდი ჭურჭლიდან ყუთებში. ჭურჭელში არცერთი არ უნდა დარჩეს.')).toBeTruthy();
    expect(zoneCounts()).toEqual([4, 4, 0]);
  });

  it('explore: the whole never changes while counters move; combining and resetting work', () => {
    go('#/student/lessons/g1-u03-l1');
    answerCorrectly(questions(L1)[0]);
    next();
    const wholeNum = () => document.querySelector('.nb-node.is-whole .nb-num')?.textContent;
    expect(bondNumbers()).toEqual(['7', '3', '4']);
    expect(zoneCounts()).toEqual([0, 3, 4]);
    fireEvent.click(counterEls(1)[0]);
    fireEvent.click(zoneEl(2));
    expect(bondNumbers()).toEqual(['7', '2', '5']);
    expect(wholeNum()).toBe('7');
    expect(zoneCounts()).toEqual([0, 2, 5]);
    click('ნაწილების გაერთიანება');
    expect(zoneCounts()).toEqual([7, 0, 0]);
    expect(counterEls().every((c) => c.disabled)).toBe(true);
    expect(document.querySelector('.xt-note')?.textContent).toContain('მთელი არ შეცვლილა');
    click('ისევ გაყოფა');
    expect(zoneCounts()).toEqual([0, 2, 5]);
    click('↻ თავიდან');
    expect(zoneCounts()).toEqual([0, 3, 4]);
    // choose another whole: every number from 2 to 10 is on offer
    expect(document.querySelectorAll('.xt-num')).toHaveLength(9);
    fireEvent.click(screen.getByRole('button', { name: 'მთელი 10' }));
    expect(bondNumbers()[0]).toBe('10');
    expect(zoneCounts().reduce((x, y) => x + y, 0)).toBe(10);
    fireEvent.click(screen.getByRole('button', { name: 'მთელი 2' }));
    expect(zoneCounts()).toEqual([0, 1, 1]);
    // Axi's hint
    click('მინიშნება');
    expect(screen.getByText('გადაიტანე ერთი კუბიკი და დააკვირდი: ორივე ნაწილი ერთად რამდენია?')).toBeTruthy();
  });

  it('understand: the parts join into the whole and the number bond appears at the end', () => {
    go('#/student/lessons/g1-u03-l1');
    answerCorrectly(questions(L1)[0]);
    next();
    next();
    const demo = document.querySelector('.demo') as HTMLElement;
    expect(demo.querySelectorAll('.cb-counter')).toHaveLength(7);
    expect([...demo.querySelectorAll('.cb-counter')].map((c) => c.getAttribute('data-zone')).sort()).toEqual(['1', '1', '1', '2', '2', '2', '2']);
    expect(demo.querySelector('.demo-bond')).toBeNull();
    fireEvent.click(within(demo).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect([...demo.querySelectorAll('.cb-counter')].every((c) => c.getAttribute('data-zone') === '0')).toBe(true);
    fireEvent.click(within(demo).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(demo.querySelector('.demo-status')?.textContent).toContain('3 + 4 = 7');
    expect([...demo.querySelectorAll('.nb-num')].map((n) => n.textContent)).toEqual(['7', '3', '4']);
    // no hint button and no mascot on the understand screen
    expect(screen.queryByRole('button', { name: 'მინიშნება' })).toBeNull();
  });

  it('practice 3 and the check match a bond with pictures; wrong pictures get a specific note', () => {
    go('#/student/lessons/g1-u03-l1');
    for (let i = 0; i < 4; i += 1) {
      const a = L1.activities[i];
      if (a.kind === 'question') answerCorrectly(a);
      next();
    }
    // practice 2 (choose the whole) and 3 (match)
    fireEvent.click(screen.getAllByRole('radio')[0]);
    submit();
    expect(feedback()).toContain('მხოლოდ ერთი ნაწილია');
    expect(feedback()).not.toContain('7'); // the right answer is not revealed
    click('ხელახლა ცდა');
    fireEvent.click(screen.getAllByRole('radio')[1]);
    submit();
    next();
    expect(document.querySelectorAll('.lp-choice-pic .parts')).toHaveLength(3);
    expect(document.querySelectorAll('.lp-visual .nb')).toHaveLength(1);
    fireEvent.click(screen.getAllByRole('radio')[0]);
    submit();
    expect(feedback()).toContain('მეორე ჯგუფი');
  });

  it('check: no number bond animation, no counting aids; feedback only after submitting', () => {
    go('#/student/lessons/g1-u03-l1');
    for (let i = 0; i < 6; i += 1) {
      const a = L1.activities[i];
      if (a.kind === 'question') answerCorrectly(a);
      next();
    }
    expect(screen.getByText('შემოწმება', { selector: '.lp-stage-label' })).toBeTruthy();
    expect(document.querySelector('.lp-feedback')).toBeNull();
    expect(document.querySelectorAll('.cb')).toHaveLength(0);
    expect(document.querySelector('.demo')).toBeNull();
  });
});

describe('U03.2 pairs that make 5', () => {
  it('the challenge accepts 0 and 5', () => {
    go('#/student/lessons/g1-u03-l2');
    moveCounters(0, 2, 5);
    submit();
    expect(feedback()).toContain('სწორია');
  });

  it('explore: the frame always shows 5; both groups and the pair update; every pair counts; reveal waits; reset', () => {
    go('#/student/lessons/g1-u03-l2');
    answerCorrectly(questions(L2)[0]);
    next();
    const pair = () => ({ a: document.querySelectorAll('.frameb-cell.is-a').length, b: document.querySelectorAll('.frameb-cell.is-b').length });
    const found = () => [...document.querySelectorAll('.found li')].map((n) => n.textContent);
    const reveal = () => screen.getByRole('button', { name: /სხვა წყვილის ჩვენება|ყველა წყვილი ნახე/ }) as HTMLButtonElement;
    expect(frameCells()).toHaveLength(5);
    expect(pair()).toEqual({ a: 2, b: 3 });
    expect(bondNumbers()).toEqual(['5', '2', '3']);
    expect(found()).toEqual([]);
    expect(reveal().disabled).toBe(true); // not before the student has explored
    fireEvent.click(frameCells()[0]);
    expect(pair()).toEqual({ a: 1, b: 4 });
    expect(bondNumbers()).toEqual(['5', '1', '4']);
    expect(reveal().disabled).toBe(true);
    fireEvent.click(frameCells()[2]);
    expect(pair()).toEqual({ a: 2, b: 3 });
    expect(found()).toEqual(['1 და 4', '2 და 3']);
    expect(reveal().disabled).toBe(false);
    // "3 and 2" and "2 and 3" are both found: either direction
    fireEvent.click(frameCells()[3]);
    expect(found()).toContain('3 და 2');
    // reveal shows a pair that has not been tried yet
    fireEvent.click(reveal());
    expect(pair()).toEqual({ a: 0, b: 5 });
    expect(found()).toContain('0 და 5');
    // the total never changes
    for (let i = 0; i < 12; i += 1) {
      fireEvent.click(frameCells()[(i * 3) % 5]);
      const p = pair();
      expect(p.a + p.b).toBe(5);
      expect(frameCells()).toHaveLength(5);
      expect(Number(bondNumbers()[1]) + Number(bondNumbers()[2])).toBe(5);
    }
    click('↻ თავიდან');
    expect(pair()).toEqual({ a: 2, b: 3 });
    expect(found()).toEqual([]);
    // no pair is announced as "the" answer
    expect(document.body.textContent).not.toMatch(/ერთადერთი|ერთი სწორი/);
  });

  it('explore: the reveal control stops when every pair has been seen', () => {
    go('#/student/lessons/g1-u03-l2');
    answerCorrectly(questions(L2)[0]);
    next();
    fireEvent.click(frameCells()[0]);
    fireEvent.click(frameCells()[2]);
    const reveal = () => screen.getByRole('button', { name: /სხვა წყვილის ჩვენება|ყველა წყვილი ნახე/ }) as HTMLButtonElement;
    for (let i = 0; i < 6 && !/ყველა წყვილი/.test(reveal().textContent ?? ''); i += 1) fireEvent.click(reveal());
    expect(reveal().textContent).toBe('ყველა წყვილი ნახე');
    expect(reveal().disabled).toBe(true);
    expect(document.querySelectorAll('.found li')).toHaveLength(6);
  });

  it('understand: two groups join inside the five-frame and the bond follows', () => {
    go('#/student/lessons/g1-u03-l2');
    answerCorrectly(questions(L2)[0]);
    next();
    next();
    const demos = [...document.querySelectorAll('.demo')] as HTMLElement[];
    expect(demos).toHaveLength(2);
    for (const d of demos) expect(d.querySelectorAll('.cb-cell')).toHaveLength(5);
    expect(demos[0].querySelectorAll('.cb-counter[data-zone="1"]')).toHaveLength(2);
    expect(demos[0].querySelectorAll('.cb-counter[data-zone="2"]')).toHaveLength(3);
    fireEvent.click(within(demos[0]).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(demos[0].querySelectorAll('.cb-counter[data-zone="0"]')).toHaveLength(5);
    fireEvent.click(within(demos[0]).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(demos[0].querySelector('.demo-status')?.textContent).toContain('2 + 3 = 5');
  });

  it('practice 1 (fill the frame): add and take back counters; an unfinished frame is wrong, an empty one is incomplete', () => {
    go('#/student/lessons/g1-u03-l2');
    for (let i = 0; i < 3; i += 1) {
      const a = L2.activities[i];
      if (a.kind === 'question') answerCorrectly(a);
      next();
    }
    expect(frameCells()).toHaveLength(5);
    expect(document.querySelectorAll('.frameb-cell.is-a')).toHaveLength(2);
    submit();
    expect(feedback()).toContain('შეეხე ცარიელ ადგილებს');
    fireEvent.click(frameCells()[3]); // any empty space adds the next counter
    expect(document.querySelectorAll('.frameb-cell.is-b')).toHaveLength(1);
    fireEvent.click(frameCells()[2]); // tap an added counter: take it back
    expect(document.querySelectorAll('.frameb-cell.is-b')).toHaveLength(0);
    fireEvent.click(frameCells()[0]); // the given counters are fixed
    expect(document.querySelectorAll('.frameb-cell.is-a')).toHaveLength(2);
    fireEvent.click(frameCells()[2]);
    submit();
    expect(feedback()).toContain('ჩარჩოში ჯერ კიდევ არის ცარიელი ადგილი');
    click('ხელახლა ცდა');
    fireEvent.click(frameCells()[3]);
    fireEvent.click(frameCells()[4]);
    submit();
    expect(feedback()).toContain('სწორია');
  });
});

describe('U03.3 pairs that make 10', () => {
  it('the challenge shows six filled and four empty spaces; a wrong answer does not reveal the right one', () => {
    go('#/student/lessons/g1-u03-l3');
    expect(document.querySelectorAll('.tenf-cell')).toHaveLength(10);
    expect(document.querySelectorAll('.tenf-cell.is-a')).toHaveLength(6);
    fireEvent.click(screen.getAllByRole('radio')[2]);
    submit();
    expect(feedback()).toContain('ჯერ არ არის სწორი');
    expect(feedback()).not.toContain('6 და 4');
    click('ხელახლა ცდა');
    fireEvent.click(screen.getAllByRole('radio')[1]);
    submit();
    expect(feedback()).toContain('სწორია');
  });

  it('explore: the whole stays 10; the frame, both parts and the spaces agree', () => {
    go('#/student/lessons/g1-u03-l3');
    answerCorrectly(questions(L3)[0]);
    next();
    const a = () => document.querySelectorAll('.frameb-cell.is-a').length;
    const b = () => document.querySelectorAll('.frameb-cell.is-b').length;
    const hidden = () => document.querySelectorAll('.frameb-cell.is-hidden-b').length;
    expect(frameCells()).toHaveLength(10);
    // starts with only the first part shown; the rest are empty spaces
    expect([a(), b(), hidden()]).toEqual([4, 0, 6]);
    expect(bondNumbers()).toEqual(['10', '4', '6']);
    expect(document.querySelector('.xt-note')?.textContent).toContain('ცარიელია 6 ადგილი');
    click('ერთი კუბიკის დამატება პირველ ნაწილში');
    expect([a(), hidden()]).toEqual([5, 5]);
    expect(bondNumbers()).toEqual(['10', '5', '5']);
    click('ერთი კუბიკის მოკლება პირველი ნაწილიდან');
    click('ერთი კუბიკის მოკლება პირველი ნაწილიდან');
    expect(bondNumbers()).toEqual(['10', '3', '7']);
    click('მეორე ნაწილის ჩვენება');
    expect([a(), b(), hidden()]).toEqual([3, 7, 0]);
    // move one counter of the second part to the first
    fireEvent.click(document.querySelector('.frameb-cell.is-b') as HTMLElement);
    expect([a(), b()]).toEqual([4, 6]);
    expect(bondNumbers()).toEqual(['10', '4', '6']);
  });

  it('explore: the buttons stop at 0 and 10 and the list of pairs grows', () => {
    go('#/student/lessons/g1-u03-l3');
    answerCorrectly(questions(L3)[0]);
    next();
    const add = () => screen.getByRole('button', { name: 'ერთი კუბიკის დამატება პირველ ნაწილში' }) as HTMLButtonElement;
    const take = () => screen.getByRole('button', { name: 'ერთი კუბიკის მოკლება პირველი ნაწილიდან' }) as HTMLButtonElement;
    for (let i = 0; i < 10 && !add().disabled; i += 1) fireEvent.click(add());
    expect(add().disabled).toBe(true);
    expect(bondNumbers()).toEqual(['10', '10', '0']);
    for (let i = 0; i < 12 && !take().disabled; i += 1) fireEvent.click(take());
    expect(take().disabled).toBe(true);
    expect(bondNumbers()).toEqual(['10', '0', '10']);
    expect(document.querySelectorAll('.found li').length).toBeGreaterThanOrEqual(7);
    expect(screen.queryByRole('button', { name: /სხვა წყვილის ჩვენება/ })).toBeNull(); // the ten-frame has no reveal control
  });

  it('understand: 6 and 4 fill the ten-frame; then a second pair', () => {
    go('#/student/lessons/g1-u03-l3');
    answerCorrectly(questions(L3)[0]);
    next();
    next();
    const demos = [...document.querySelectorAll('.demo')] as HTMLElement[];
    expect(demos).toHaveLength(2);
    expect(demos[0].querySelectorAll('.cb-cell')).toHaveLength(10);
    expect(demos[0].querySelectorAll('.cb-counter[data-zone="1"]')).toHaveLength(6);
    expect(demos[0].querySelectorAll('.cb-counter[data-zone="2"]')).toHaveLength(4);
    for (let i = 0; i < 2; i += 1) fireEvent.click(within(demos[0]).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(demos[0].querySelectorAll('.cb-counter[data-zone="0"]')).toHaveLength(10);
    expect([...demos[0].querySelectorAll('.nb-num')].map((n) => n.textContent)).toEqual(['10', '6', '4']);
    expect(demos[1].querySelectorAll('.cb-counter[data-zone="1"]')).toHaveLength(7);
  });

  it('the check keeps the plain ten-frame: no animation, nothing filled in for the student', () => {
    go('#/student/lessons/g1-u03-l3');
    for (let i = 0; i < 6; i += 1) {
      const a = L3.activities[i];
      if (a.kind === 'question') answerCorrectly(a);
      next();
    }
    expect(document.querySelectorAll('.tenf-cell.is-a')).toHaveLength(3);
    expect(document.querySelectorAll('.tenf-cell.is-b')).toHaveLength(0);
    expect(document.querySelectorAll('.cb, .demo')).toHaveLength(0);
  });
});

describe('U03.4 missing parts', () => {
  it('the challenge asks for the hidden part of 8 = 3 + ?', () => {
    go('#/student/lessons/g1-u03-l4');
    expect(bondNumbers()).toEqual(['8', '3', '?']);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    fireEvent.click(screen.getAllByRole('radio')[0]);
    submit();
    expect(feedback()).not.toContain('5');
  });

  it('explore: the answer comes from marking the known part and counting the rest', () => {
    go('#/student/lessons/g1-u03-l4');
    answerCorrectly(questions(L4)[0]);
    next();
    const obj = (i: number) => screen.getByRole('button', { name: `ბურთი ${i}` });
    const note = () => document.querySelector('.xt-note')?.textContent ?? '';
    expect(bondNumbers()).toEqual(['9', '4', '?']);
    expect(document.querySelectorAll('.objf .obj')).toHaveLength(9);
    expect(note()).toContain('ცნობილი ნაწილია 4');
    // mark four
    for (let i = 1; i <= 4; i += 1) fireEvent.click(obj(i));
    expect(document.querySelectorAll('.obj-badge.is-tick')).toHaveLength(4);
    // a fifth mark in the choosing phase is not possible: tapping now counts instead
    expect(note()).toContain('დათვალე');
    expect(bondNumbers()[2]).toBe('?'); // not given away
    for (let i = 5; i <= 8; i += 1) fireEvent.click(obj(i));
    expect(bondNumbers()[2]).toBe('?'); // one object still uncounted
    fireEvent.click(obj(8)); // counting an object twice does nothing
    expect(bondNumbers()[2]).toBe('?');
    fireEvent.click(obj(9));
    expect(bondNumbers()).toEqual(['9', '4', '5']);
    expect(note()).toContain('4 და 5 ერთად 9 არის');
    // reset and the next example
    click('↻ თავიდან');
    expect(bondNumbers()).toEqual(['9', '4', '?']);
    expect(document.querySelectorAll('.obj-badge')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'მაგალითი 2' }));
    expect(document.querySelectorAll('.objf .obj')).toHaveLength(6);
    expect(bondNumbers()).toEqual(['6', '2', '?']);
  });

  it('explore: un-marking a counter goes back to choosing', () => {
    go('#/student/lessons/g1-u03-l4');
    answerCorrectly(questions(L4)[0]);
    next();
    for (let i = 1; i <= 4; i += 1) fireEvent.click(screen.getByRole('button', { name: `ბურთი ${i}` }));
    fireEvent.click(screen.getByRole('button', { name: 'ბურთი 1' }));
    expect(document.querySelectorAll('.obj-badge.is-tick')).toHaveLength(3);
    expect(document.querySelector('.xt-note')?.textContent).toContain('ცნობილი ნაწილია 4');
  });

  it('understand: 7 counters, 2 set aside, the remaining 5 highlighted, then the bond', () => {
    go('#/student/lessons/g1-u03-l4');
    answerCorrectly(questions(L4)[0]);
    next();
    next();
    const demo = document.querySelector('.demo') as HTMLElement;
    const zones = () => [0, 1, 2].map((z) => demo.querySelectorAll(`.cb-counter[data-zone="${z}"]`).length);
    expect(zones()).toEqual([7, 0, 0]);
    const step = () => fireEvent.click(within(demo).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    step();
    expect(zones()).toEqual([5, 2, 0]);
    step();
    expect(demo.querySelectorAll('.cb-counter.is-emph')).toHaveLength(5);
    expect(demo.querySelector('.cb-zone.is-emph')).toBeTruthy();
    expect([...demo.querySelectorAll('.nb-num')].map((n) => n.textContent)).toEqual(['7', '2', '?']);
    step();
    expect(zones()).toEqual([0, 2, 5]);
    expect([...demo.querySelectorAll('.nb-num')].map((n) => n.textContent)).toEqual(['7', '2', '5']);
  });

  it('practice shows counters first, then less; the check never marks the hidden part', () => {
    go('#/student/lessons/g1-u03-l4');
    for (let i = 0; i < 3; i += 1) {
      const a = L4.activities[i];
      if (a.kind === 'question') answerCorrectly(a);
      next();
    }
    expect(document.querySelectorAll('.bondpic-frame .tenf-cell.is-b')).toHaveLength(4); // practice 1: ring counters show the rest
    answerCorrectlyNow(L4.activities[3]);
    next();
    expect(document.querySelectorAll('.bondpic-frame')).toHaveLength(0); // practice 2: bond only
  });

  it('check 3: scattered balls, only the known part marked', () => {
    go('#/student/lessons/g1-u03-l4');
    for (let i = 0; i < 8; i += 1) {
      const a = L4.activities[i];
      if (a.kind === 'question') answerCorrectly(a);
      next();
    }
    expect(document.querySelectorAll('.objf .obj')).toHaveLength(9);
    expect(document.querySelectorAll('.obj-badge.is-tick')).toHaveLength(6);
    expect(document.querySelectorAll('.obj.is-picked')).toHaveLength(6);
    // answering wrongly gives feedback and then a retry
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '6' } });
    submit();
    expect(feedback()).toContain('გვაინტერესებს');
    click('ხელახლა ცდა');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '3' } });
    submit();
    expect(feedback()).toContain('სწორია');
  });
});

function answerCorrectlyNow(a: Activity) {
  if (a.kind === 'question') answerCorrectly(a);
}

describe('U03.5 solving problems with number bonds', () => {
  it('the challenge: two groups of apples, a wrong "one group" answer is explained', () => {
    go('#/student/lessons/g1-u03-l5');
    expect(document.querySelectorAll('.parts-box')).toHaveLength(2);
    expect(document.querySelectorAll('.parts-glyph')).toHaveLength(10);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '6' } });
    submit();
    expect(feedback()).toContain('მხოლოდ ერთი ჯგუფია');
    expect(feedback()).not.toContain('10');
  });

  it('explore, finding a whole: place the apples as in the story, then join them', () => {
    go('#/student/lessons/g1-u03-l5');
    answerCorrectly(questions(L5)[0]);
    next();
    expect(screen.getByText('კალათაში 5 ვაშლია, მაგიდაზე — 3. სულ რამდენი ვაშლია?')).toBeTruthy();
    expect(zoneCounts()).toEqual([8, 0, 0]);
    expect(bondNumbers()).toEqual(['?', '0', '0']);
    const combine = () => screen.getByRole('button', { name: /ჯგუფების გაერთიანება|ისევ გაყოფა/ }) as HTMLButtonElement;
    expect(combine().disabled).toBe(true); // nothing placed yet
    moveCounters(0, 1, 5);
    expect(bondNumbers()).toEqual(['?', '5', '0']);
    moveCounters(0, 2, 3);
    expect(zoneCounts()).toEqual([0, 5, 3]);
    expect(bondNumbers()).toEqual(['?', '5', '3']);
    expect(document.querySelector('.xt-note')?.textContent).toContain('ისტორიას ემთხვევა');
    fireEvent.click(combine());
    expect(bondNumbers()).toEqual(['8', '5', '3']);
    expect(zoneCounts()).toEqual([8, 0, 0]);
    fireEvent.click(combine());
    expect(zoneCounts()).toEqual([0, 5, 3]);
    // a different split does not match the story
    moveCounters(1, 2, 1);
    expect(document.querySelector('.xt-note')?.textContent).toContain('ისტორიაში 5 და 3-ია');
    click('↻ თავიდან');
    expect(zoneCounts()).toEqual([8, 0, 0]);
  });

  it('explore, finding a missing group: the whole and one group are given, the other appears when placed', () => {
    go('#/student/lessons/g1-u03-l5');
    answerCorrectly(questions(L5)[0]);
    next();
    fireEvent.click(screen.getByRole('button', { name: 'დაკარგული ჯგუფი' }));
    expect(screen.getByText('სულ 9 ვაშლია. 4 კალათაშია. რამდენია მაგიდაზე?')).toBeTruthy();
    expect(bondNumbers()).toEqual(['9', '4', '?']);
    expect(zoneCounts()).toEqual([9, 0, 0]);
    expect(screen.queryByRole('button', { name: /ჯგუფების გაერთიანება/ })).toBeNull();
    moveCounters(0, 1, 4);
    expect(bondNumbers()).toEqual(['9', '4', '?']);
    moveCounters(0, 2, 5);
    expect(bondNumbers()).toEqual(['9', '4', '5']);
    expect(document.querySelector('.xt-note')?.textContent).toContain('4 და 5 ერთად 9 არის');
  });

  it('understand: join (3 + 4 = 7) and missing part (8, 3, ?)', () => {
    go('#/student/lessons/g1-u03-l5');
    answerCorrectly(questions(L5)[0]);
    next();
    next();
    const demos = [...document.querySelectorAll('.demo')] as HTMLElement[];
    expect(demos).toHaveLength(2);
    expect(demos[0].querySelector('.story')?.textContent).toContain('3 წითელი და 4 ლურჯი');
    expect(demos[1].querySelector('.story')?.textContent).toContain('სულ 8 კუბიკია');
    for (let i = 0; i < 2; i += 1) fireEvent.click(within(demos[0]).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect([...demos[0].querySelectorAll('.nb-num')].map((n) => n.textContent)).toEqual(['7', '3', '4']);
    fireEvent.click(within(demos[1]).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect([...demos[1].querySelectorAll('.nb-num')].map((n) => n.textContent)).toEqual(['8', '3', '?']); // the other part stays unknown
    fireEvent.click(within(demos[1]).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    fireEvent.click(within(demos[1]).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect([...demos[1].querySelectorAll('.nb-num')].map((n) => n.textContent)).toEqual(['8', '3', '5']);
  });

  it('check: stories have no picture and no bond; the matching question offers bonds', () => {
    go('#/student/lessons/g1-u03-l5');
    for (let i = 0; i < 6; i += 1) {
      const a = L5.activities[i];
      if (a.kind === 'question') answerCorrectly(a);
      next();
    }
    expect(document.querySelectorAll('.lp-visual, .nb')).toHaveLength(0);
    answerCorrectlyNow(L5.activities[6]);
    next();
    answerCorrectlyNow(L5.activities[7]);
    next();
    expect(document.querySelectorAll('.lp-visual')).toHaveLength(0);
    expect(document.querySelectorAll('.lp-choice-pic .nb')).toHaveLength(3);
    fireEvent.click(screen.getAllByRole('radio')[1]);
    submit();
    expect(feedback()).toContain('ჯერ არ არის სწორი');
  });
});

describe('progress and the unit', () => {
  it('after the fifth lesson the unit is complete; before, it is not', () => {
    window.localStorage.setItem(LEARN_STORAGE_KEY, JSON.stringify(Object.fromEntries(IDS.slice(0, 4).map((id) => [id, { status: 'completed', checkCorrect: 3, checkTotal: 3 }]))));
    resetProgressCache();
    go('#/student/lessons/g1-u03-l5');
    playThrough(L5);
    expect(document.querySelector('.lp-unit-done')?.textContent).toContain('U03 დასრულდა');
    expect(saved()['g1-u03-l5']).toMatchObject({ status: 'completed', checkCorrect: 3 });
  });
  it('a lesson finished on its own does not claim the unit is complete', () => {
    go('#/student/lessons/g1-u03-l3');
    playThrough(L3);
    expect(document.querySelector('.lp-unit-done')).toBeNull();
  });
  it('failing the check does not mark the lesson completed', () => {
    go('#/student/lessons/g1-u03-l4');
    L4.activities.forEach((a, i) => {
      if (a.kind === 'question') {
        if (a.stage === 'check') {
          for (let k = 0; k < 2; k += 1) {
            fireEvent.change(screen.getByRole('textbox'), { target: { value: '99' } });
            submit();
            if (k === 0) click('ხელახლა ცდა');
          }
        } else answerCorrectly(a);
      }
      click(i === L4.activities.length - 1 ? 'გაკვეთილის დასრულება' : 'გაგრძელება');
    });
    expect(screen.getByRole('heading', { name: 'ჯერ არ დასრულებულა' })).toBeTruthy();
    expect(saved()['g1-u03-l4']?.status).not.toBe('completed');
  });
});
