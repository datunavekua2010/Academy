// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';
import { LESSON_CONTENT } from '../src/lessons/content';
import { NUMBER_NAMES_0_20 } from '../src/lessons/content/numberNames020';
import { correctOrder, evaluateAnswer } from '../src/lessons/check';
import { numberName } from '../src/lessons/numberNames';
import { getLessonEntry, getUnit } from '../src/lessons/catalog';
import { fieldLayout } from '../src/lessons/exercises/Objects';
import { compareSign } from '../src/lessons/exercises/Compare';
import { OrderBoard, moveItem, slotAtX } from '../src/lessons/exercises/OrderBoard';
import { SplitBoard } from '../src/lessons/exercises/SplitBoard';
import type { Activity, AnswerInput, Lesson, QuestionActivity, ResponseSpec } from '../src/lessons/types';

/**
 * Grade 1 · Unit 2 "Numbers to 20" placeholder lessons: the maths in the demonstration
 * data, the new components (objects, order board, split board) and walk-throughs of the
 * interactions. Dragging is simulated with pointer events; real touch devices have not
 * been tried (there is no browser in the test environment).
 */

const IDS = ['g1-u02-l1', 'g1-u02-l2', 'g1-u02-l3', 'g1-u02-l4', 'g1-u02-l5'];
const lessons: Lesson[] = IDS.map((id) => LESSON_CONTENT[id]);
const [L1, L2, L3, L4, L5] = lessons;
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);
const optionText = (q: QuestionActivity, id: string) => (q.response.type === 'choice' ? q.response.options.find((o) => o.id === id)?.text : undefined);

function correctInput(r: ResponseSpec): AnswerInput {
  switch (r.type) {
    case 'choice':
      return r.answer;
    case 'blanks':
      return r.answers.map(String);
    case 'expression':
      return r.answer;
    case 'collect':
      return Array.from({ length: r.answer }, (_, i) => i).join(',');
    case 'order':
      return correctOrder(r).join(',');
    default:
      return String(r.answer);
  }
}

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 1 U02 is "Numbers to 20"', () => {
  it('has the five approved titles and the counts are unchanged', () => {
    const unit = getUnit('g1-u02');
    expect(unit?.title).toBe('Numbers to 20');
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Counting Objects to 20',
      'Reading, Writing, and Representing Numbers to 20',
      'Comparing Numbers to 20',
      'Ordering Numbers to 20',
      'Building and Breaking Apart Numbers to 20',
    ]);
    expect(unit?.lessons).toHaveLength(5);
    IDS.forEach((id, i) => expect(getLessonEntry(id)?.code).toBe(`U02.${i + 1}`));
  });
});

// ─────────────────────────── data ───────────────────────────

describe('number names are lesson data and match the helper', () => {
  it('covers 0–20 and agrees with numberName()', () => {
    expect(Object.keys(NUMBER_NAMES_0_20)).toHaveLength(21);
    expect(NUMBER_NAMES_0_20[0]).toBe('ნული');
    for (let n = 1; n <= 20; n += 1) expect(NUMBER_NAMES_0_20[n], String(n)).toBe(numberName(n));
  });
});

describe('placeholder lessons: structure', () => {
  it('five lessons, all placeholder, full flow, three check questions each', () => {
    for (const l of lessons) {
      expect(l.status).toBe('placeholder');
      expect(l.concepts?.length).toBeGreaterThan(0);
      const stages = l.activities.map((a) => a.stage);
      expect([...new Set(stages)]).toEqual(['challenge', 'explore', 'understand', 'practice', 'check']);
      expect(stages.filter((s) => s === 'check')).toHaveLength(3);
      expect(stages.filter((s) => s === 'practice')).toHaveLength(3);
      expect(new Set(l.activities.map((a) => a.id)).size).toBe(l.activities.length);
      expect(l.completion.minCheckCorrect).toBeLessThanOrEqual(3);
    }
  });

  it('every question accepts its own correct answer, rejects a clearly wrong one, and has hints', () => {
    for (const l of lessons) {
      for (const q of questions(l)) {
        expect(evaluateAnswer(q, correctInput(q.response)).verdict, `${l.id}/${q.id}`).toBe('correct');
        expect(evaluateAnswer(q, '').verdict, `${l.id}/${q.id} empty`).toBe('incomplete');
        expect(q.hints.length).toBeGreaterThan(0);
        expect(q.explanation.length).toBeGreaterThan(0);
      }
    }
  });

  it('choice answers exist among the options; a misconception is never the right answer', () => {
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

  it('student-facing text stays in scope: no negatives, no formal place-value terms, no equations', () => {
    for (const l of lessons) {
      const text = JSON.stringify(l);
      expect(text).not.toMatch(/ნეგატიურ|უარყოფით|ათეულ|ერთეულ/);
    }
  });
});

describe('U02.1 counting objects', () => {
  const collections = (a: Activity) => {
    const out: string[] = [];
    if (a.kind === 'question' && a.visual?.type === 'objects') out.push(`${a.visual.count}-${a.visual.glyph}-${a.visual.layout}-${a.visual.seed ?? 0}`);
    if (a.kind === 'question' && a.response.type === 'collect') out.push(`${a.response.total}-${a.response.glyph}-${a.response.layout}-${a.response.seed ?? 0}`);
    return out;
  };

  it('numeric and choice answers equal the number of drawn objects (1–20)', () => {
    for (const q of questions(L1)) {
      if (q.visual?.type !== 'objects') continue;
      expect(q.visual.count).toBeGreaterThanOrEqual(1);
      expect(q.visual.count).toBeLessThanOrEqual(20);
      if (q.response.type === 'numeric') expect(q.response.answer).toBe(q.visual.count);
      if (q.response.type === 'choice') expect(optionText(q, q.response.answer)).toBe(String(q.visual.count));
    }
  });

  it('collect questions ask for fewer objects than are shown', () => {
    const collect = questions(L1).filter((q) => q.response.type === 'collect');
    expect(collect.length).toBeGreaterThan(0);
    for (const q of collect) if (q.response.type === 'collect') expect(q.response.answer).toBeLessThan(q.response.total);
  });

  it('covers small, 10–20 and irregular collections in practice, with no counting aids in the check', () => {
    const practice = stageOf(L1, 'practice');
    const counts = practice.map((q) => (q.visual?.type === 'objects' ? q.visual.count : q.response.type === 'collect' ? q.response.total : 0));
    expect(counts[0]).toBeLessThan(10);
    expect(counts[1]).toBeGreaterThanOrEqual(10);
    expect(practice[2].visual?.type === 'objects' && practice[2].visual.layout).toBe('scatter');
    for (const q of stageOf(L1, 'check')) expect(q.visual?.type === 'objects' && q.visual.markable).toBeFalsy();
    const checkVisuals = stageOf(L1, 'check').map((q) => q.visual);
    expect(checkVisuals.some((v) => v?.type === 'objects' && v.count > 10)).toBe(true);
    expect(checkVisuals.some((v) => v?.type === 'objects' && v.count <= 10)).toBe(true);
  });

  it('the check does not reuse a collection (or count) from the explore or practice screens', () => {
    const explore = L1.activities.find((a) => a.kind === 'explore');
    const exploreCounts = explore && explore.kind === 'explore' && explore.tool.tool === 'count-objects' ? explore.tool.counts : [];
    const earlier = new Set(L1.activities.filter((a) => a.stage !== 'check').flatMap(collections));
    for (const a of L1.activities.filter((x) => x.stage === 'check')) {
      for (const c of collections(a)) {
        expect(earlier.has(c)).toBe(false);
        expect(exploreCounts).not.toContain(Number(c.split('-')[0]));
      }
    }
  });
});

describe('object layouts', () => {
  it('place every object, inside the field, deterministically and without overlap', () => {
    for (const layout of ['rows', 'scatter'] as const) {
      for (let count = 1; count <= 20; count += 1) {
        for (const seed of [1, 2, 5, 11, 30]) {
          const a = fieldLayout(count, layout, seed);
          expect(a.points).toHaveLength(count);
          expect(fieldLayout(count, layout, seed)).toEqual(a);
          for (const p of a.points) {
            expect(p.x).toBeGreaterThan(0);
            expect(p.x).toBeLessThan(1);
            expect(p.y).toBeGreaterThan(0);
            expect(p.y).toBeLessThan(1);
          }
          // distance in "cell" units: objects are 0.7 of a cell wide, so they stay clear of each other
          for (let i = 0; i < count; i += 1) {
            for (let j = i + 1; j < count; j += 1) {
              const dx = (a.points[i].x - a.points[j].x) * a.cols;
              const dy = (a.points[i].y - a.points[j].y) * a.rows;
              expect(Math.hypot(dx, dy), `${layout} ${count} ${seed}`).toBeGreaterThan(0.74);
            }
          }
        }
      }
    }
  });
  it('scatter really is irregular and the seed changes it', () => {
    const a = fieldLayout(13, 'scatter', 1).points;
    const b = fieldLayout(13, 'scatter', 2).points;
    expect(a).not.toEqual(b);
    const rows = new Set(a.map((p) => p.y.toFixed(2)));
    expect(rows.size).toBeGreaterThan(4);
  });
});

describe('U02.2 numerals and quantities', () => {
  it('quantity pictures never exceed 20 and agree with the numeric / choice answer', () => {
    for (const q of questions(L2)) {
      if (q.visual?.type === 'quantity') {
        const total = q.visual.tens * 10 + q.visual.ones;
        expect(total).toBeLessThanOrEqual(20);
        if (q.response.type === 'choice') expect(optionText(q, q.response.answer)).toBe(String(total));
      }
      if (q.response.type === 'choice') {
        const want = /(\d+)/.exec(q.prompt)?.[1];
        const right = q.response.options.find((o) => o.id === (q.response as { answer: string }).answer);
        if (right?.visual && want) {
          const v = right.visual;
          const total = v.type === 'quantity' ? v.tens * 10 + v.ones : v.type === 'ten-frame' ? v.count : -1;
          expect(total, q.id).toBe(Number(want));
          // and no other option shows the same amount
          for (const o of q.response.options.filter((x) => x !== right)) {
            const w = o.visual;
            const t = w?.type === 'quantity' ? w.tens * 10 + w.ones : w?.type === 'ten-frame' ? w.count : -2;
            expect(t).not.toBe(total);
          }
        }
      }
    }
  });

  it('name questions use the name table: the quoted name belongs to the right numeral', () => {
    const named = questions(L2).filter((q) => /„/.test(q.prompt));
    expect(named).toHaveLength(2); // one in practice, one in the check
    for (const q of named) {
      const name = /„(.+)“/.exec(q.prompt)?.[1];
      const n = Number(optionText(q, (q.response as { answer: string }).answer));
      expect(NUMBER_NAMES_0_20[n]).toBe(name);
    }
  });

  it('the check does not reuse the explore starting number and has three different formats', () => {
    const explore = L2.activities.find((a) => a.kind === 'explore');
    expect(explore && explore.kind === 'explore' && explore.tool.tool === 'number-builder' && explore.tool.start).toBe(14);
    const check = stageOf(L2, 'check');
    expect(check).toHaveLength(3);
    for (const q of check) expect(JSON.stringify(q)).not.toContain('14');
    expect(check[1].visual?.type).toBe('quantity');
    expect(check[0].visual).toBeUndefined();
  });
});

describe('U02.3 comparing', () => {
  it('group questions have the right answer for more / fewer; numeral questions pick the right number', () => {
    for (const q of questions(L3)) {
      if (q.response.type !== 'choice') continue;
      const v = q.visual;
      if (v?.type === 'compare' && /ჯგუფში/.test(q.prompt)) {
        const more = /მეტი/.test(q.prompt);
        const want = v.a === v.b ? 'c' : (v.a > v.b) === more ? 'a' : 'b';
        expect(q.response.answer, q.id).toBe(want);
        expect(Math.max(v.a, v.b)).toBeLessThanOrEqual(20);
      }
      const m = /უფრო (პატარა|დიდი): (\d+) თუ (\d+)/.exec(q.prompt);
      if (m) {
        const [x, y] = [Number(m[2]), Number(m[3])];
        expect(optionText(q, q.response.answer)).toBe(String(m[1] === 'პატარა' ? Math.min(x, y) : Math.max(x, y)));
        if (v?.type === 'compare') expect([v.a, v.b]).toEqual([x, y]);
      }
      const s = /(\d+) \? (\d+)/.exec(q.prompt);
      if (s) {
        expect(q.response.answer, q.id).toBe({ '<': 'lt', '>': 'gt', '=': 'eq' }[compareSign(Number(s[1]), Number(s[2]))]);
      }
    }
  });

  it('covers greater, less, and equal / symbol in the check; no pairing view there', () => {
    const check = stageOf(L3, 'check');
    expect(check[0].prompt).toMatch(/დიდი/);
    expect(check[1].prompt).toMatch(/ნაკლები/);
    expect(check[2].response.type === 'choice' && check[2].response.answer).toBe('eq');
    for (const q of check) expect(q.visual?.type === 'compare' && q.visual.view).not.toBe('pairs');
  });

  it('the understand examples are the three required ones, and symbols come last', () => {
    const blocks = L3.activities.find((a) => a.kind === 'explain');
    const compares = blocks && blocks.kind === 'explain' ? blocks.blocks.filter((b) => b.type === 'compare') : [];
    expect(compares.map((b) => b.type === 'compare' && [b.a, b.b, b.view])).toEqual([
      [9, 14, 'objects'],
      [16, 11, 'line'],
      [12, 12, 'pairs'],
      [8, 13, 'numbers'],
    ]);
    expect(compares.map((b) => b.type === 'compare' && Boolean(b.symbol))).toEqual([false, false, false, true]);
  });
});

describe('U02.4 ordering', () => {
  const orders = (l: Lesson) => questions(l).filter((q) => q.response.type === 'order');
  it('every starting order is shuffled, distinct, inside 0–20 and has at least two numbers to move', () => {
    for (const q of orders(L4)) {
      const r = q.response as Extract<ResponseSpec, { type: 'order' }>;
      expect(new Set(r.items).size).toBe(r.items.length);
      expect(r.items.every((n) => n >= 0 && n <= 20)).toBe(true);
      expect(r.items.join(',')).not.toBe(correctOrder(r).join(','));
      expect(r.items.length).toBeGreaterThanOrEqual(3);
    }
  });
  it('the challenge uses 7, 3, 9; practice goes 3 → 4 numbers, ascending then descending; the check has no number-line help', () => {
    const challenge = L4.activities[0];
    expect(challenge.kind === 'question' && challenge.response.type === 'order' && challenge.response.items).toEqual([7, 3, 9]);
    const practice = orders(L4).filter((q) => q.stage === 'practice').map((q) => q.response as Extract<ResponseSpec, { type: 'order' }>);
    expect(practice.map((r) => r.items.length)).toEqual([3, 4, 4]);
    expect(practice.map((r) => r.direction)).toEqual(['asc', 'asc', 'desc']);
    expect(practice.every((r) => r.lineAfterHint)).toBe(true);
    const check = orders(L4).filter((q) => q.stage === 'check').map((q) => q.response as Extract<ResponseSpec, { type: 'order' }>);
    expect(check.map((r) => r.direction)).toEqual(['asc', 'desc', 'asc']);
    expect(check[2].items.length).toBeGreaterThanOrEqual(5);
    expect(check.every((r) => !r.lineAfterHint)).toBe(true);
  });
  it('order answers: right order, wrong orders (with a helpful note), incomplete', () => {
    const q = orders(L4)[0];
    expect(evaluateAnswer(q, '3,7,9').verdict).toBe('correct');
    expect(evaluateAnswer(q, '7,3,9')).toMatchObject({ verdict: 'incorrect', feedback: expect.stringContaining('ყველაზე პატარა') });
    expect(evaluateAnswer(q, '3,9,7')).toMatchObject({ verdict: 'incorrect', feedback: expect.stringContaining('დასაწყისი სწორია') });
    expect(evaluateAnswer(q, '3,7').verdict).toBe('incomplete');
    const desc = orders(L4).find((x) => x.response.type === 'order' && x.response.direction === 'desc');
    expect(desc && evaluateAnswer(desc, '2,6,11,19')).toMatchObject({ verdict: 'incorrect', feedback: expect.stringContaining('ყველაზე დიდი') });
  });
});

describe('U02.5 building and breaking apart', () => {
  it('part-whole and split answers add up; pair choices have exactly one right pair', () => {
    for (const q of questions(L5)) {
      if (q.visual?.type === 'part-whole') {
        expect(q.response.type === 'numeric' && q.response.answer).toBe(q.visual.whole - q.visual.part);
        expect(q.visual.whole).toBeLessThanOrEqual(20);
      }
      if (q.response.type === 'split') {
        expect(q.response.answer).toBeGreaterThan(0);
        expect(q.response.answer).toBeLessThan(q.response.total);
        expect(q.response.total).toBeLessThanOrEqual(20);
      }
      if (q.response.type === 'choice') {
        const total = Number(/(\d+)-ს/.exec(q.prompt)?.[1]);
        const sums = q.response.options.map((o) => ({ id: o.id, sum: o.text.match(/\d+/g)!.map(Number).reduce((x, y) => x + y, 0) }));
        expect(sums.filter((s) => s.sum === total).map((s) => s.id)).toEqual([q.response.answer]);
      }
    }
  });
  it('the challenge is an ungraded exploration with no single answer; explore starts small and goes larger', () => {
    const challenge = L5.activities[0];
    expect(challenge.kind).toBe('explore');
    expect(challenge.kind === 'explore' && challenge.tool).toMatchObject({ tool: 'split', targets: [10] });
    const explore = L5.activities[1];
    expect(explore.kind === 'explore' && explore.tool.tool === 'split' && explore.tool.targets).toEqual([8, 16]);
  });
  it('the check uses new totals, not the explore or understand ones', () => {
    const seen = new Set([10, 8, 16, 7]);
    for (const q of stageOf(L5, 'check')) {
      const total = q.visual?.type === 'part-whole' ? q.visual.whole : q.response.type === 'split' ? q.response.total : Number(/(\d+)-ს/.exec(q.prompt)?.[1]);
      expect(seen.has(total)).toBe(false);
    }
  });
  it('guidance shrinks: counters are marked in practice 1, only the whole in the check', () => {
    expect(stageOf(L5, 'practice')[0].visual).toMatchObject({ counters: 'split' });
    expect(stageOf(L5, 'check')[0].visual).toMatchObject({ counters: 'plain' });
  });
  it('split answers: incomplete while nothing moved, right and wrong amounts judged', () => {
    const q = stageOf(L5, 'practice')[1];
    expect(evaluateAnswer(q, '11').verdict).toBe('incomplete'); // everything still in the first box
    expect(evaluateAnswer(q, '4').verdict).toBe('correct');
    expect(evaluateAnswer(q, '7')).toMatchObject({ verdict: 'incorrect', feedback: expect.stringContaining('პირველში 4') });
  });
});

// ─────────────────────────── components ───────────────────────────

describe('OrderBoard', () => {
  it('moveItem and slotAtX', () => {
    expect(moveItem([7, 3, 9], 0, 1)).toEqual([3, 7, 9]);
    expect(moveItem([7, 3, 9], 2, 0)).toEqual([9, 7, 3]);
    expect(moveItem([7, 3, 9], 1, 99)).toEqual([7, 9, 3]);
    expect(slotAtX(10, { left: 0, width: 300 }, 3)).toBe(0);
    expect(slotAtX(150, { left: 0, width: 300 }, 3)).toBe(1);
    expect(slotAtX(299, { left: 0, width: 300 }, 3)).toBe(2);
    expect(slotAtX(-50, { left: 0, width: 300 }, 3)).toBe(0);
    expect(slotAtX(900, { left: 0, width: 300 }, 3)).toBe(2);
  });

  const tile = (n: number) => screen.getByRole('button', { name: new RegExp(`^რიცხვი ${n},`) });

  it('tap to select, tap a place; arrows and keyboard move the selected tile; tiles stay put in the DOM', () => {
    const onChange = vi.fn();
    render(<OrderBoard base={[7, 3, 9]} order={[7, 3, 9]} onChange={onChange} ariaLabel="ფილები" />);
    const domOrder = () => [...document.querySelectorAll('.ord-tile')].map((n) => n.textContent?.replace('▲', ''));
    const before = domOrder();
    fireEvent.click(tile(7));
    expect(tile(7).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(tile(3));
    expect(onChange).toHaveBeenLastCalledWith([3, 7, 9]);
    expect(domOrder()).toEqual(before);

    onChange.mockClear();
    fireEvent.click(tile(9));
    fireEvent.click(screen.getByRole('button', { name: 'არჩეული ფილა მარცხნივ' }));
    expect(onChange).toHaveBeenLastCalledWith([7, 9, 3]);
    expect((screen.getByRole('button', { name: 'არჩეული ფილა მარჯვნივ' }) as HTMLButtonElement).disabled).toBe(true); // 9 is already last

    fireEvent.keyDown(tile(9), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith([7, 9, 3]);
    fireEvent.click(tile(9)); // tap the held tile again: put it down
    expect(tile(9).getAttribute('aria-pressed')).toBe('false');
  });

  it('drags a tile along the row and the others make room', () => {
    const onChange = vi.fn();
    const { container } = render(<OrderBoard base={[7, 3, 9]} order={[7, 3, 9]} onChange={onChange} ariaLabel="ფილები" />);
    const row = container.querySelector('.ord-row') as HTMLElement;
    row.getBoundingClientRect = () => ({ left: 0, top: 0, right: 300, bottom: 70, width: 300, height: 70, x: 0, y: 0, toJSON: () => ({}) });
    fireEvent.pointerDown(tile(9), { clientX: 250, pointerId: 1 });
    fireEvent.pointerMove(tile(9), { clientX: 20, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith([9, 7, 3]);
    fireEvent.pointerUp(tile(9), { pointerId: 1 });
    onChange.mockClear();
    fireEvent.pointerMove(tile(9), { clientX: 150, pointerId: 1 });
    expect(onChange).not.toHaveBeenCalled(); // not dragging any more
  });

  it('does nothing when disabled, and shows the number line only when asked', () => {
    const onChange = vi.fn();
    const { rerender, container } = render(<OrderBoard base={[7, 3, 9]} order={[7, 3, 9]} onChange={onChange} disabled ariaLabel="ფილები" />);
    expect((tile(7) as HTMLButtonElement).disabled).toBe(true);
    expect(container.querySelector('.nl')).toBeNull();
    rerender(<OrderBoard base={[7, 3, 9]} order={[7, 3, 9]} onChange={onChange} line={{ min: 0, max: 20 }} ariaLabel="ფილები" />);
    expect(container.querySelector('.nl')).toBeTruthy();
  });
});

describe('SplitBoard', () => {
  function Harness({ total, start = total, onLeft }: { total: number; start?: number; onLeft?: (n: number) => void }) {
    const [left, setLeft] = useState(start);
    onLeft?.(left);
    return <SplitBoard total={total} left={left} onChange={setLeft} ariaLabel="ყუთები" />;
  }
  const counts = () => [Number(document.querySelector('.spl-box:not(.is-second) .spl-count')?.textContent), Number(document.querySelector('.spl-box.is-second .spl-count')?.textContent)];
  const counterButtons = (box: 0 | 1) => [...document.querySelectorAll(`.spl-box${box === 1 ? '.is-second' : ':not(.is-second)'} .spl-counter`)] as HTMLButtonElement[];

  it('keeps left + right equal to the total through any sequence of moves', () => {
    render(<Harness total={10} />);
    expect(counts()).toEqual([10, 0]);
    const moves = [...'aaabaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbb'];
    let model = 10;
    for (const m of moves) {
      const button = screen.getByRole('button', { name: m === 'a' ? 'ერთი კუბიკი პირველიდან მეორე ყუთში' : 'ერთი კუბიკი მეორედან პირველ ყუთში' }) as HTMLButtonElement;
      fireEvent.click(button);
      if (m === 'a' && model > 0) model -= 1;
      if (m === 'b' && model < 10) model += 1;
      const [l, r] = counts();
      expect([l, r]).toEqual([model, 10 - model]);
      expect(document.querySelectorAll('.spl-counter')).toHaveLength(10);
    }
    expect(counts()).toEqual([10, 0]);
    expect((screen.getByRole('button', { name: 'ერთი კუბიკი მეორედან პირველ ყუთში' }) as HTMLButtonElement).disabled).toBe(true);
    for (let i = 0; i < 10; i += 1) fireEvent.click(screen.getByRole('button', { name: 'ერთი კუბიკი პირველიდან მეორე ყუთში' }));
    expect(counts()).toEqual([0, 10]);
    expect((screen.getByRole('button', { name: 'ერთი კუბიკი პირველიდან მეორე ყუთში' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('a tap moves the counter to the other box, and back', () => {
    render(<Harness total={6} />);
    fireEvent.click(counterButtons(0)[0]);
    expect(counts()).toEqual([5, 1]);
    fireEvent.click(counterButtons(1)[0]);
    expect(counts()).toEqual([6, 0]);
  });

  it('dragging a counter into the other box moves exactly one; dropping elsewhere moves none; the click after a drag does not move it again', () => {
    render(<Harness total={6} start={6} />);
    const boxes = [...document.querySelectorAll('.spl-box')] as HTMLElement[];
    boxes[0].getBoundingClientRect = () => ({ left: 0, top: 0, right: 100, bottom: 150, width: 100, height: 150, x: 0, y: 0, toJSON: () => ({}) });
    boxes[1].getBoundingClientRect = () => ({ left: 110, top: 0, right: 210, bottom: 150, width: 100, height: 150, x: 110, y: 0, toJSON: () => ({}) });
    const c = counterButtons(0)[0];
    fireEvent.pointerDown(c, { clientX: 20, clientY: 20, pointerId: 1 });
    fireEvent.pointerMove(c, { clientX: 150, clientY: 40, pointerId: 1 });
    fireEvent.pointerUp(c, { clientX: 150, clientY: 40, pointerId: 1 });
    fireEvent.click(c); // the browser sends a click after a drag
    expect(counts()).toEqual([5, 1]);

    const d = counterButtons(0)[0];
    fireEvent.pointerDown(d, { clientX: 20, clientY: 20, pointerId: 2 });
    fireEvent.pointerMove(d, { clientX: 60, clientY: 60, pointerId: 2 });
    fireEvent.pointerUp(d, { clientX: 60, clientY: 60, pointerId: 2 }); // dropped inside its own box
    fireEvent.click(d);
    expect(counts()).toEqual([5, 1]);
  });

  it('is locked when disabled', () => {
    const { container } = render(<SplitBoard total={4} left={4} onChange={() => undefined} disabled ariaLabel="ყუთები" />);
    for (const b of container.querySelectorAll('button')) expect((b as HTMLButtonElement).disabled).toBe(true);
  });
});

// ─────────────────────────── player walk-throughs ───────────────────────────

function go(hash: string) {
  window.location.hash = hash;
  return render(<StudentApp />);
}
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const next = () => click('გაგრძელება');
const typeNum = (value: string) => fireEvent.change(screen.getByRole('textbox'), { target: { value } });
const answerNumber = (value: string) => {
  typeNum(value);
  click('პასუხის შემოწმება');
};
const radio = (name: string | RegExp) => fireEvent.click(screen.getByRole('radio', { name }));
const feedback = () => document.querySelector('.lp-feedback')?.textContent ?? '';
const saved = () => JSON.parse(window.localStorage.getItem(LEARN_STORAGE_KEY) ?? '{}');
const submit = () => click('პასუხის შემოწმება');
const orderTile = (n: number) => screen.getByRole('button', { name: new RegExp(`^რიცხვი ${n},`) });

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

describe('U02 unit page', () => {
  it('lists the five lessons with the new titles, all playable', () => {
    go('#/student/lessons/g1-u02');
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items).toHaveLength(5);
    expect(within(items[0]).getByText('Counting Objects to 20')).toBeTruthy();
    IDS.forEach((id, i) => expect(within(items[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
  });
});

describe('U02.1 counting objects: walk-through', () => {
  it('plays all the way to completion and offers U02.2', () => {
    go('#/student/lessons/g1-u02-l1');
    expect(screen.getByText('ნაბიჯი 1 / 9')).toBeTruthy();
    expect(document.querySelectorAll('.objf .obj')).toHaveLength(13);
    expect(document.querySelectorAll('.objf button')).toHaveLength(0); // challenge objects are pictures, not buttons

    // challenge: a wrong answer does not reveal the right one; retry
    radio('12');
    submit();
    expect(feedback()).toContain('ყურადღებით დავთვალოთ');
    expect(feedback()).not.toContain('13');
    click('ხელახლა ცდა');
    radio('13');
    submit();
    expect(screen.getByText('ბრავო! კარგად დათვალე ვარსკვლავები.')).toBeTruthy();
    next();

    // explore: tapping counts once each, a second tap does nothing, reset, second arrangement, other size
    const counter = () => document.querySelector('.objs-count strong')?.textContent;
    expect(document.querySelectorAll('.objf .obj')).toHaveLength(9);
    expect(counter()).toBe('0');
    fireEvent.click(screen.getByRole('button', { name: 'ვაშლი 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'ვაშლი 2' }));
    expect(counter()).toBe('2');
    expect(document.querySelectorAll('.obj-badge')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'ვაშლი 1' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'ვაშლი 1' }));
    expect(counter()).toBe('2');
    expect(document.querySelector('.xt-note')?.textContent).toContain('უკვე დათვლილია');
    click('↻ თავიდან');
    expect(counter()).toBe('0');
    for (let i = 1; i <= 9; i += 1) fireEvent.click(screen.getByRole('button', { name: `ვაშლი ${i}` }));
    expect(counter()).toBe('9');
    expect(document.querySelector('.xt-note')?.textContent).toContain('ბოლო რიცხვი 9');
    click('⇄ სხვანაირად დალაგება');
    expect(document.querySelectorAll('.objf .obj')).toHaveLength(9); // same quantity, new arrangement
    expect(counter()).toBe('0');
    fireEvent.click(screen.getByRole('button', { name: 'დიდი ჯგუფი' }));
    expect(document.querySelectorAll('.objf .obj')).toHaveLength(17);
    // Axi's optional hint
    click('მინიშნება');
    expect(screen.getByText('სცადე ყოველი საგანი ერთხელ დათვალო, ერთი მხრიდან მეორისკენ.')).toBeTruthy();
    next();

    // understand: the counting demonstration and the rearranged copy
    expect(screen.getByText('გააზრება')).toBeTruthy();
    expect(document.querySelectorAll('.demo .objf')).toHaveLength(2);
    for (let i = 0; i < 6; i += 1) click('შემდეგი ნაბიჯი');
    expect(document.querySelector('.demo-status')?.textContent).toContain('სულ 6 საგანია');
    next();

    // practice 1: tap exactly 5 of the 8 balls
    for (let i = 1; i <= 6; i += 1) fireEvent.click(screen.getByRole('button', { name: `ბურთი ${i}` }));
    submit();
    expect(feedback()).toContain('ერთი ბურთი მეტი');
    click('ხელახლა ცდა');
    expect(screen.getByRole('button', { name: 'ბურთი 6' }).getAttribute('aria-pressed')).toBe('true'); // selection kept
    fireEvent.click(screen.getByRole('button', { name: 'ბურთი 6' })); // deselect
    expect(document.querySelector('.objs-count strong')?.textContent).toBe('5');
    submit();
    expect(screen.getByText('სწორია')).toBeTruthy();
    next();

    // practice 2: markable objects + number entry, hint, wrong, right
    fireEvent.click(screen.getByRole('button', { name: 'თევზი 1' }));
    expect(document.querySelector('.objs-bar strong')?.textContent).toBe('1');
    answerNumber('13');
    expect(feedback()).toContain('ერთი თევზი გამოგრჩა');
    click('ხელახლა ცდა');
    click('მინიშნება');
    expect(screen.getByText('ყოველ თევზს ერთხელ შეეხე.')).toBeTruthy();
    answerNumber('14');
    next();
    answerNumber('17'); // practice 3
    next();

    // check: 7, 16, 19 (no tappable objects, no counting aids)
    expect(screen.getByText('შემოწმება', { selector: '.lp-stage-label' })).toBeTruthy();
    expect(document.querySelectorAll('.objf button')).toHaveLength(0);
    radio('7');
    submit();
    next();
    answerNumber('16');
    next();
    answerNumber('19');
    click('გაკვეთილის დასრულება');

    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    expect(screen.getByText('3 / 3')).toBeTruthy();
    expect(screen.getByText('ბოლო რიცხვი გვიჩვენებს რაოდენობას', { selector: '.lp-concepts li' })).toBeTruthy();
    expect(saved()['g1-u02-l1']).toMatchObject({ status: 'completed', checkCorrect: 3, checkTotal: 3 });
    expect(screen.getByRole('link', { name: /გაგრძელება: U02\.2/ }).getAttribute('href')).toBe('#/student/lessons/g1-u02-l2');
    expect(screen.getByRole('link', { name: 'U02-ზე დაბრუნება' }).getAttribute('href')).toBe('#/student/lessons/g1-u02');
  });
});

describe('U02.2 numerals: the builder keeps all three views in step', () => {
  it('+ and − update numeral, name and quantity, within 0–20', () => {
    go('#/student/lessons/g1-u02-l2');
    radio(/ჯგუფი ბ/);
    submit();
    next();
    const state = () => ({
      numeral: document.querySelector('.panel-numeral')?.textContent,
      name: document.querySelector('.panel-name')?.textContent,
      dots: document.querySelectorAll('.panel .qty i').length,
      tens: document.querySelectorAll('.panel .qty-ten').length,
    });
    expect(state()).toEqual({ numeral: '14', name: 'თოთხმეტი', dots: 14, tens: 1 });
    click('ერთი საგნის დამატება');
    expect(state()).toEqual({ numeral: '15', name: 'თხუთმეტი', dots: 15, tens: 1 });
    for (let i = 0; i < 4; i += 1) click('ერთი საგნის ამოღება');
    expect(state()).toEqual({ numeral: '11', name: 'თერთმეტი', dots: 11, tens: 1 });
    click('ერთი საგნის ამოღება');
    expect(state()).toEqual({ numeral: '10', name: 'ათი', dots: 10, tens: 1 });
    click('ერთი საგნის ამოღება');
    expect(state()).toEqual({ numeral: '9', name: 'ცხრა', dots: 9, tens: 0 });
    for (let i = 0; i < 9; i += 1) click('ერთი საგნის ამოღება');
    expect(state()).toEqual({ numeral: '0', name: 'ნული', dots: 0, tens: 0 });
    expect((screen.getByRole('button', { name: 'ერთი საგნის ამოღება' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('ცარიელია')).toBeTruthy();
    for (let i = 0; i < 20; i += 1) click('ერთი საგნის დამატება');
    expect(state()).toEqual({ numeral: '20', name: 'ოცი', dots: 20, tens: 2 });
    expect((screen.getByRole('button', { name: 'ერთი საგნის დამატება' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /ციფრებით/ }));
    expect(document.querySelector('.xt-note')?.textContent).toContain('20 = ოცი');
  });

  it('picture answers can be chosen and wrong ones get specific feedback; the understand step shows 6, 13 and 17', () => {
    go('#/student/lessons/g1-u02-l2');
    radio(/ჯგუფი გ/);
    submit();
    expect(feedback()).toContain('მხოლოდ 6 ცალია');
    click('ხელახლა ცდა');
    radio(/ჯგუფი ბ/);
    submit();
    next();
    next();
    expect(document.querySelectorAll('.rep')).toHaveLength(3);
    expect(screen.getByText('1 ათიანი და 7 ცალი')).toBeTruthy();
    expect(screen.getByText('ჩვიდმეტი')).toBeTruthy();
  });
});

describe('U02.3 comparing: the explore tool is driven by the real values', () => {
  it('adjusts both groups, pairs them up (extras marked), switches to the number line', () => {
    go('#/student/lessons/g1-u02-l3');
    radio('ჯგუფი ა');
    submit();
    next();
    const groupNumbers = () => [...document.querySelectorAll('.cmp-ctl output strong')].map((n) => Number(n.textContent));
    const objectCounts = () => [...document.querySelectorAll('.cmp-group .objf')].map((f) => f.querySelectorAll('.obj').length);
    expect(groupNumbers()).toEqual([7, 4]);
    expect(objectCounts()).toEqual([7, 4]);
    expect(document.querySelector('.xt-note')?.textContent).toContain('7 უფრო დიდია, ვიდრე 4');
    click('ჯგუფი ბ: ერთის დამატება');
    click('ჯგუფი ბ: ერთის დამატება');
    click('ჯგუფი ბ: ერთის დამატება');
    expect(groupNumbers()).toEqual([7, 7]);
    expect(objectCounts()).toEqual([7, 7]);
    expect(document.querySelector('.xt-note')?.textContent).toContain('7 და 7 ტოლია');

    fireEvent.click(screen.getByRole('button', { name: 'წყვილები' }));
    expect(document.querySelectorAll('.pair.is-paired')).toHaveLength(7);
    expect(document.querySelectorAll('.pair.is-extra')).toHaveLength(0);
    expect(document.querySelector('.xt-note')?.textContent).toContain('ყველა საგანს წყვილი ჰყავს');

    for (let i = 0; i < 4; i += 1) click('ჯგუფი ა: ერთის დამატება');
    expect(groupNumbers()).toEqual([11, 7]);
    // pairing never creates or removes objects
    expect(document.querySelectorAll('.pair.is-paired')).toHaveLength(7);
    expect(document.querySelectorAll('.pair.is-extra')).toHaveLength(4);
    expect(document.querySelectorAll('.pair-cell:not(.is-empty)')).toHaveLength(18);
    expect(document.querySelector('.xt-note')?.textContent).toContain('ა ჯგუფში 4 საგანი ზედმეტია');

    fireEvent.click(screen.getByRole('button', { name: 'რიცხვითი ღერძი' }));
    expect([...document.querySelectorAll('.nl-flag.is-pin')].map((n) => n.textContent)).toEqual(['ა 11', 'ბ 7']);
    expect(document.querySelector('.xt-note')?.textContent).toContain('მარჯვენა მხარეს');

    // limits
    for (let i = 0; i < 12; i += 1) click('ჯგუფი ა: ერთის დამატება');
    expect(groupNumbers()[0]).toBe(20);
    expect((screen.getByRole('button', { name: 'ჯგუფი ა: ერთის დამატება' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('the understand step shows symbols only after the three picture examples', () => {
    go('#/student/lessons/g1-u02-l3');
    radio('ჯგუფი ა');
    submit();
    next();
    next();
    const figures = [...document.querySelectorAll('.demo')];
    expect(figures).toHaveLength(4);
    expect(figures.map((f) => f.querySelector('.cmp-sentence')?.textContent ?? null)).toEqual([null, null, null, '8 < 13']);
  });

  it('symbol practice: wrong symbols get a specific reason, the right one is accepted', () => {
    go('#/student/lessons/g1-u02-l3');
    radio('ჯგუფი ა');
    submit();
    next();
    next();
    next();
    radio('ჯგუფი ბ');
    submit();
    next();
    radio('9');
    submit();
    next();
    radio('<');
    submit();
    expect(feedback()).toContain('პირველი რიცხვი პატარაა');
    click('ხელახლა ცდა');
    radio('>');
    submit();
    expect(feedback()).toContain('სწორია');
    expect(screen.getByRole('button', { name: 'გაგრძელება' })).toBeTruthy();
  });
});

describe('U02.4 ordering: the board in the player', () => {
  it('challenge: a wrong order explains itself and keeps the arrangement; hints keep it too; the right order passes', () => {
    go('#/student/lessons/g1-u02-l4');
    expect(orderTile(7).getAttribute('aria-label')).toContain('ადგილი 1');
    // submitting before moving anything
    submit();
    expect(feedback()).toContain('გადაანაცვლე');
    // move 9 to the front: 9, 7, 3 (wrong)
    fireEvent.click(orderTile(9));
    fireEvent.click(orderTile(7));
    expect(orderTile(9).getAttribute('aria-label')).toContain('ადგილი 1');
    click('მინიშნება');
    expect(screen.getByText('ჯერ იპოვე ყველაზე პატარა რიცხვი.')).toBeTruthy();
    expect(orderTile(9).getAttribute('aria-label')).toContain('ადგილი 1'); // kept
    submit();
    expect(feedback()).toContain('ყველაზე პატარა');
    click('ხელახლა ცდა');
    expect(orderTile(9).getAttribute('aria-label')).toContain('ადგილი 1'); // still kept; can be changed
    // fix [9,7,3] → [3,9,7] → [3,7,9]
    fireEvent.click(orderTile(3));
    fireEvent.click(orderTile(9));
    fireEvent.click(orderTile(9));
    fireEvent.click(orderTile(7));
    const label = (n: number) => Number(/ადგილი (\d)/.exec(orderTile(n).getAttribute('aria-label') ?? '')?.[1]);
    expect([label(3), label(7), label(9)]).toEqual([1, 2, 3]);
    submit();
    expect(screen.getByText('სწორია')).toBeTruthy();
    expect(screen.getByText('ბრავო! 3, 7, 9 — პატარიდან დიდისკენ.')).toBeTruthy();
    // locked after finishing
    expect((orderTile(3) as HTMLButtonElement).disabled).toBe(true);
  });

  it('practice: the number line appears only after a hint is opened; the check never shows it', () => {
    go('#/student/lessons/g1-u02-l4');
    const label = (n: number) => Number(/ადგილი (\d)/.exec(orderTile(n).getAttribute('aria-label') ?? '')?.[1]);
    // solve the challenge: 7,3,9 → 3,7,9
    fireEvent.click(orderTile(7));
    fireEvent.click(orderTile(3));
    submit();
    next(); // explore
    next(); // understand
    next();
    expect(document.querySelector('.ord .nl')).toBeNull();
    click('მინიშნება');
    expect(document.querySelector('.ord .nl')).toBeTruthy();
    expect(label(12)).toBe(1);
  });

  it('explore: tiles go onto the line at their own number, wrong ticks are explained, rows reorder both ways, reset works', () => {
    go('#/student/lessons/g1-u02-l4');
    fireEvent.click(orderTile(7));
    fireEvent.click(orderTile(3));
    submit();
    next();
    const result = () => [...document.querySelectorAll('.ord-result .ord-tile')].map((n) => n.textContent);
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 10' })); // no tile chosen yet
    expect(document.querySelector('.xt-note')?.textContent).toContain('ჯერ აირჩიე ფილა');
    fireEvent.click(screen.getByRole('button', { name: '15' }));
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 4' })); // wrong tick for 15
    expect(document.querySelector('.xt-note')?.textContent).toContain('შენი ფილა 15');
    expect(result()).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 15' }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 3' }));
    fireEvent.click(screen.getByRole('button', { name: '11' }));
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 11' }));
    expect(result()).toEqual(['3', '11', '15']);
    expect([...document.querySelectorAll('.nl-flag.is-pin')].map((n) => n.textContent)).toEqual(['15', '3', '11']);
    fireEvent.click(screen.getByRole('button', { name: 'დიდიდან პატარისკენ' }));
    expect(result()).toEqual(['15', '11', '3']);
    fireEvent.click(screen.getByRole('button', { name: 'პატარიდან დიდისკენ' }));
    expect(result()).toEqual(['3', '11', '15']);
    click('↻ თავიდან');
    expect(result()).toEqual([]);
    expect(screen.getAllByRole('button', { name: /^(6|15|3|11)$/ })).toHaveLength(4);
  });
});

describe('U02.4 understand: the number-line demonstrations', () => {
  it('walks 2 → 6 → 11 → 17 to the right and 18 → 12 → 8 → 4 to the left', () => {
    go('#/student/lessons/g1-u02-l4');
    fireEvent.click(orderTile(7));
    fireEvent.click(orderTile(3));
    submit();
    next();
    next();
    const demos = () => [...document.querySelectorAll('.demo')] as HTMLElement[];
    expect(demos()).toHaveLength(2);
    expect(demos()[0].querySelector('.demo-status')?.textContent).toContain('ახლა: 2');
    for (let i = 0; i < 3; i += 1) fireEvent.click(within(demos()[0]).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(demos()[0].querySelector('.demo-status')?.textContent).toContain('მარჯვნივ');
    expect(demos()[0].querySelector('.nl-marker')?.getAttribute('aria-valuenow') ?? demos()[0].querySelector('.nl-marker')?.getAttribute('aria-label')).toContain('17');
    for (let i = 0; i < 3; i += 1) fireEvent.click(within(demos()[1]).getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(demos()[1].querySelector('.demo-status')?.textContent).toContain('მარცხნივ');
    expect(demos()[1].querySelector('.nl-marker')?.getAttribute('aria-label')).toContain('4');
  });
});

describe('U02.5 building: the split tools in the player', () => {
  it('challenge: any split is fine, combinations found are listed once, the total never changes', () => {
    go('#/student/lessons/g1-u02-l5');
    expect(screen.getByText('გამოწვევა')).toBeTruthy();
    const pair = () => [...document.querySelectorAll('.spl-count')].map((n) => Number(n.textContent));
    expect(pair()).toEqual([10, 0]);
    for (let i = 0; i < 4; i += 1) click('ერთი კუბიკი პირველიდან მეორე ყუთში');
    expect(pair()).toEqual([6, 4]);
    expect(screen.getByText('სულ: 10')).toBeTruthy();
    expect(document.querySelector('.xt-note')?.textContent).toContain('6 და 4 ერთად 10 არის');
    // every split passed through is listed once: [9,1] [8,2] [7,3] [6,4]
    const found = () => [...document.querySelectorAll('.found li')].map((n) => n.textContent);
    expect(found()).toEqual(['1 და 9', '2 და 8', '3 და 7', '4 და 6']);
    click('ერთი კუბიკი მეორედან პირველ ყუთში'); // [7,3] again: not listed twice
    expect(found()).toHaveLength(4);
    click('ერთი კუბიკი პირველიდან მეორე ყუთში');
    click('ერთი კუბიკი პირველიდან მეორე ყუთში'); // [5,5]
    expect(found()).toEqual(['1 და 9', '2 და 8', '3 და 7', '4 და 6', '5 და 5']);
    expect(document.querySelector('.found b')?.textContent).toBe('ნაპოვნი გზები: 5');
    expect(pair().reduce((x, y) => x + y, 0)).toBe(10);
    click('↻ თავიდან');
    expect(pair()).toEqual([10, 0]);
    next(); // always can continue: nothing graded
  });

  it('explore: targets 8 and 16 each start fresh, with the ten-frame matching the boxes', () => {
    go('#/student/lessons/g1-u02-l5');
    next();
    expect(document.querySelector('.spl-target strong')?.textContent).toBe('8');
    expect(document.querySelectorAll('.tenf-cell.is-a')).toHaveLength(8); // frame on by default here
    click('ერთი კუბიკი პირველიდან მეორე ყუთში');
    click('ერთი კუბიკი პირველიდან მეორე ყუთში');
    click('ერთი კუბიკი პირველიდან მეორე ყუთში');
    expect(document.querySelectorAll('.tenf-cell.is-a')).toHaveLength(5);
    expect(document.querySelectorAll('.tenf-cell.is-b')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: '16' }));
    expect(document.querySelector('.spl-target strong')?.textContent).toBe('16');
    expect([...document.querySelectorAll('.spl-count')].map((n) => Number(n.textContent))).toEqual([16, 0]);
    expect(document.querySelectorAll('.tenf-frame')).toHaveLength(2);
    expect(document.querySelectorAll('.found li')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    expect(document.querySelectorAll('.found li')).toHaveLength(3); // the list is per target ([7,1] [6,2] [5,3] were found for 8)
    expect([...document.querySelectorAll('.spl-count')].map((n) => Number(n.textContent))).toEqual([8, 0]); // and the board restarts
  });

  it('understand: the parts come together again (10 = 6 and 4)', () => {
    go('#/student/lessons/g1-u02-l5');
    next();
    next();
    const status = () => document.querySelector('.demo-status')?.textContent ?? '';
    expect(document.querySelectorAll('.demo')).toHaveLength(2);
const demo = () => document.querySelectorAll('.demo')[0] as HTMLElement;
    fireEvent.click(within(demo()).getByRole('button', { name: 'შემდეგი ნაბიჯი' })); // split into parts
    expect(demo().querySelector('.demo-status')?.textContent).toContain('ორ ნაწილად გავყავით: 6 და 4');
    expect([...demo().querySelectorAll('.spl-count')].map((n) => n.textContent)).toEqual(['6', '4']);
    expect(demo().querySelectorAll('.spl-counter')).toHaveLength(10);
    fireEvent.click(within(demo()).getByRole('button', { name: 'შემდეგი ნაბიჯი' })); // together again
    expect(demo().querySelector('.demo-status')?.textContent).toContain('6 და 4 ერთად ისევ 10 არის');
    expect(demo().querySelectorAll('.spl-counter')).toHaveLength(10);
    expect(status()).toContain('10');
  });

  it('practice: the missing part is not shown as a number; split questions need a move; completion shows the unit as done only when all five are', () => {
    window.localStorage.setItem(
      LEARN_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(IDS.slice(0, 4).map((id) => [id, { status: 'completed', checkCorrect: 3, checkTotal: 3 }]))),
    );
    resetProgressCache();
    go('#/student/lessons/g1-u02-l5');
    next();
    next();
    next();
    // practice 1: missing part
    expect(document.querySelector('.pw-part.is-unknown strong')?.textContent).toBe('?');
    expect(document.body.textContent).not.toContain('მეორე ნაწილი: 4');
    answerNumber('9');
    expect(feedback()).toContain('9 მთელია');
    click('ხელახლა ცდა');
    answerNumber('4');
    next();
    // practice 2: build 11 as 4 + rest
    submit();
    expect(feedback()).toContain('გადაიტანე კუბიკები');
    for (let i = 0; i < 7; i += 1) click('ერთი კუბიკი პირველიდან მეორე ყუთში'); // left = 4
    submit();
    expect(screen.getByText('სწორია')).toBeTruthy();
    next();
    // practice 3: pair that makes 12
    radio('8 და 5');
    submit();
    expect(feedback()).toContain('13');
    click('ხელახლა ცდა');
    radio('7 და 5');
    submit();
    next();
    // check: 6, split 13 → 5, pair for 15
    answerNumber('6');
    next();
    for (let i = 0; i < 8; i += 1) click('ერთი კუბიკი პირველიდან მეორე ყუთში');
    submit();
    next();
    radio('9 და 6');
    submit();
    click('გაკვეთილის დასრულება');
    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    expect(document.querySelector('.lp-unit-done')?.textContent).toContain('U02 დასრულდა');
    expect(saved()['g1-u02-l5']).toMatchObject({ status: 'completed', checkCorrect: 3, checkTotal: 3 });
    expect(screen.queryByRole('link', { name: /გაგრძელება:|შემდეგი თემა/ })).toBeNull(); // U03 has no content yet
    expect(screen.getByRole('link', { name: 'გაკვეთილების სიაში დაბრუნება' })).toBeTruthy();
  });
});
