// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';
import { LESSON_CONTENT } from '../src/lessons/content';
import { evaluateAnswer } from '../src/lessons/check';
import { numberName } from '../src/lessons/numberNames';
import { NumberLine, valueAtX } from '../src/lessons/exercises/NumberLine';
import type { AnswerInput, Lesson, QuestionActivity, ResponseSpec } from '../src/lessons/types';

/**
 * Grade 1 · Unit 1 placeholder lessons: content correctness (the maths in the
 * demonstration data), the number-line component, and walk-throughs of the
 * interactions. Pointer dragging is simulated; a real touch device has not
 * been tried (no browser in the test environment).
 */

const IDS = ['g1-u01-l1', 'g1-u01-l2', 'g1-u01-l3', 'g1-u01-l4', 'g1-u01-l5'];
const lessons: Lesson[] = IDS.map((id) => LESSON_CONTENT[id]);
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');

/** The correct input for a response, in the form the player stores it. */
function correctInput(r: ResponseSpec): AnswerInput {
  switch (r.type) {
    case 'choice':
      return r.answer;
    case 'blanks':
      return r.answers.map(String);
    case 'expression':
      return r.answer;
    default:
      return String(r.answer);
  }
}

describe('Georgian number names', () => {
  it('spells known numbers (vigesimal system)', () => {
    const known: Record<number, string> = { 1: 'ერთი', 10: 'ათი', 11: 'თერთმეტი', 16: 'თექვსმეტი', 20: 'ოცი', 24: 'ოცდაოთხი', 30: 'ოცდაათი', 37: 'ოცდაჩვიდმეტი', 40: 'ორმოცი', 47: 'ორმოცდაშვიდი', 52: 'ორმოცდათორმეტი', 60: 'სამოცი', 71: 'სამოცდათერთმეტი', 80: 'ოთხმოცი', 89: 'ოთხმოცდაცხრა', 99: 'ოთხმოცდაცხრამეტი', 100: 'ასი' };
    for (const [n, name] of Object.entries(known)) expect(numberName(Number(n))).toBe(name);
  });
  it('gives every number 1–100 its own name and rejects the rest', () => {
    const names = new Set(Array.from({ length: 100 }, (_, i) => numberName(i + 1)));
    expect(names.size).toBe(100);
    expect(() => numberName(0)).toThrow();
    expect(() => numberName(101)).toThrow();
    expect(() => numberName(2.5)).toThrow();
  });
});

describe('placeholder lesson data', () => {
  it('registers exactly the five lessons, all marked placeholder, with the full flow', () => {
    for (const l of lessons) {
      expect(l.status).toBe('placeholder');
      expect(l.concepts?.length).toBeGreaterThan(0);
      const stages = l.activities.map((a) => a.stage);
      expect([...new Set(stages)]).toEqual(['challenge', 'explore', 'understand', 'practice', 'check']);
      expect(stages.filter((s) => s === 'check')).toHaveLength(3);
      expect(stages.filter((s) => s === 'practice').length).toBeGreaterThanOrEqual(3);
      expect(l.completion.minCheckCorrect).toBeLessThanOrEqual(3);
      expect(new Set(l.activities.map((a) => a.id)).size).toBe(l.activities.length);
    }
    expect(lessons[4].activities.filter((a) => a.stage === 'practice')).toHaveLength(4); // 3 + one mixed question
  });

  it('every question accepts its own correct answer and has hints and an explanation', () => {
    for (const l of lessons) {
      for (const q of questions(l)) {
        expect(evaluateAnswer(q, correctInput(q.response)).verdict, `${l.id}/${q.id}`).toBe('correct');
        expect(q.hints.length, `${l.id}/${q.id} hints`).toBeGreaterThan(0);
        expect(q.explanation.length).toBeGreaterThan(0);
        // a misconception must never describe the right answer
        for (const m of q.misconceptions ?? []) {
          const same = (a: string | number) => (q.response.type === 'choice' ? a === q.response.answer : q.response.type === 'numeric' || q.response.type === 'line' ? a === q.response.answer : false);
          expect(m.answers.some(same), `${l.id}/${q.id}/${m.id}`).toBe(false);
        }
      }
    }
  });

  it('choice answers exist among the options', () => {
    for (const l of lessons) {
      for (const q of questions(l)) {
        if (q.response.type !== 'choice') continue;
        const ids = q.response.options.map((o) => o.id);
        expect(ids).toContain(q.response.answer);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });

  it('sequence visuals are equal-step sequences and the hidden number is the numeric answer', () => {
    for (const l of lessons) {
      for (const q of questions(l)) {
        if (q.visual?.type !== 'sequence') continue;
        const { items, arrows } = q.visual;
        const hole = items.indexOf(null);
        expect(hole, `${l.id}/${q.id} has one hole`).toBeGreaterThan(-1);
        expect(items.filter((x) => x === null)).toHaveLength(1);
        const known = items.map((x, i) => [x, i] as const).filter((p): p is readonly [number, number] => p[0] !== null);
        const step = (known[1][0] - known[0][0]) / (known[1][1] - known[0][1]);
        expect(Number.isInteger(step) && step !== 0).toBe(true);
        for (const [v, i] of known) expect(v).toBe(known[0][0] + step * (i - known[0][1]));
        expect(q.response.type).toBe('numeric');
        if (q.response.type === 'numeric') expect(q.response.answer, `${l.id}/${q.id}`).toBe(known[0][0] + step * (hole - known[0][1]));
        if (arrows) expect(Math.abs(step)).toBe(Number(arrows.replace(/[^0-9]/g, '')));
        for (const [v] of known) expect(v >= 0 && v <= 100).toBe(true);
      }
    }
  });

  it('quantity visuals match the numeric answer and stay within 1–100', () => {
    for (const l of lessons) {
      for (const q of questions(l)) {
        if (q.visual?.type !== 'quantity' || q.response.type !== 'numeric') continue;
        expect(q.visual.tens * 10 + q.visual.ones).toBe(q.response.answer);
        expect(q.visual.ones).toBeLessThan(10);
        expect(q.visual.tens).toBeLessThanOrEqual(10);
      }
    }
  });

  it('number-line questions are inside their range; marker visuals agree with the answer', () => {
    for (const l of lessons) {
      for (const q of questions(l)) {
        const r = q.response;
        if (r.type === 'line') {
          expect(r.answer >= r.min && r.answer <= r.max).toBe(true);
          if (r.start !== undefined) expect(r.start >= r.min && r.start <= r.max).toBe(true);
          expect(r.start).not.toBe(r.answer);
        }
        if (q.visual?.type === 'line') {
          expect(q.visual.marker).toBeDefined();
          expect(q.response.type === 'numeric' && q.response.answer).toBe(q.visual.marker);
        }
      }
    }
  });

  it('L2 (numerals) does not reuse the explore numbers in the check', () => {
    const explore = lessons[1].activities.find((a) => a.kind === 'explore');
    const used = explore && explore.kind === 'explore' && explore.tool.tool === 'representations' ? explore.tool.numbers : [];
    expect(used.length).toBeGreaterThan(0);
    const check = questions(lessons[1]).filter((q) => q.stage === 'check');
    for (const q of check) {
      if (q.response.type === 'numeric') expect(used).not.toContain(q.response.answer);
    }
  });

  it('L4 check keeps the number line but turns the guiding arrows off', () => {
    const lineChecks = questions(lessons[3]).filter((q) => q.stage === 'check' && q.response.type === 'line');
    expect(lineChecks.length).toBeGreaterThanOrEqual(2);
    for (const q of lineChecks) expect(q.response.type === 'line' && q.response.arrows).toBe(false);
  });

  it('L5 teaches 2, 5 and 10 as equal steps, never as multiplication', () => {
    const text = JSON.stringify(lessons[4]);
    for (const step of ['+2', '+5', '+10']) expect(text).toContain(step);
    expect(text).not.toMatch(/გამრავლ|×|·/);
    for (const l of lessons) expect(JSON.stringify(l)).not.toMatch(/ათეულ|ერთეულ|ნეგატიურ|უარყოფით/);
  });
});

describe('NumberLine component', () => {
  const rect = { left: 0, width: 222 }; // usable width 178 after 22px padding on each side

  it('maps a pointer position to the nearest whole number and clamps', () => {
    expect(valueAtX(22, rect, 0, 10)).toBe(0);
    expect(valueAtX(200, rect, 0, 10)).toBe(10);
    expect(valueAtX(22 + 89, rect, 0, 10)).toBe(5);
    expect(valueAtX(-500, rect, 0, 10)).toBe(0);
    expect(valueAtX(9999, rect, 0, 10)).toBe(10);
    expect(valueAtX(22 + 89 + 4, rect, 0, 10)).toBe(5); // snaps
    expect(valueAtX(100, rect, 10, 20)).toBeGreaterThanOrEqual(10);
  });

  it('taps a tick, steps with the arrows, stops at both ends', () => {
    const onChange = vi.fn();
    const { rerender } = render(<NumberLine min={0} max={10} value={5} onChange={onChange} arrows ariaLabel="ღერძი" />);
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 8' }));
    expect(onChange).toHaveBeenLastCalledWith(8);
    fireEvent.click(screen.getByRole('button', { name: 'ერთი ნაბიჯი მარჯვნივ' }));
    expect(onChange).toHaveBeenLastCalledWith(6);
    fireEvent.click(screen.getByRole('button', { name: 'ერთი ნაბიჯი მარცხნივ' }));
    expect(onChange).toHaveBeenLastCalledWith(4);

    rerender(<NumberLine min={0} max={10} value={10} onChange={onChange} arrows ariaLabel="ღერძი" />);
    expect((screen.getByRole('button', { name: 'ერთი ნაბიჯი მარჯვნივ' }) as HTMLButtonElement).disabled).toBe(true);
    rerender(<NumberLine min={0} max={10} value={0} onChange={onChange} arrows ariaLabel="ღერძი" />);
    expect((screen.getByRole('button', { name: 'ერთი ნაბიჯი მარცხნივ' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('is operable from the keyboard and never leaves its range', () => {
    const onChange = vi.fn();
    render(<NumberLine min={0} max={10} value={9} onChange={onChange} ariaLabel="ღერძი" />);
    const slider = screen.getByRole('slider');
    expect(slider.getAttribute('aria-valuenow')).toBe('9');
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(10);
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(8);
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith(0);
    fireEvent.keyDown(slider, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it('shows no controls and ignores input when read-only or disabled', () => {
    const onChange = vi.fn();
    const { rerender } = render(<NumberLine min={0} max={10} value={3} ariaLabel="ღერძი" />);
    expect(screen.queryByRole('slider')).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    rerender(<NumberLine min={0} max={10} value={3} onChange={onChange} disabled arrows ariaLabel="ღერძი" />);
    for (const b of screen.queryAllByRole('button')) expect((b as HTMLButtonElement).disabled).toBe(true);
    fireEvent.keyDown(screen.getByRole('img', { name: /მარკერი/ }), { key: 'ArrowRight' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('labels only the requested ticks, plus start, destination and visited numbers', () => {
    const { container } = render(<NumberLine min={0} max={20} value={12} start={10} destination={14} labelled={[0, 10, 20]} hops={[10, 11, 12]} ariaLabel="ღერძი" />);
    const labels = [...container.querySelectorAll('.nl-tick-label')].map((n) => n.textContent);
    expect(labels).toEqual(['0', '10', '11', '12', '14', '20']);
    expect(container.querySelector('.nl-flag.is-start')?.textContent).toBe('დასაწყისი');
    expect(container.querySelector('.nl-flag.is-goal')?.textContent).toBe('მიზანი');
    expect(container.querySelectorAll('.nl-arc')).toHaveLength(2);
  });

  it('drags the marker with pointer events and snaps to whole numbers', () => {
    const onChange = vi.fn();
    const { container } = render(<NumberLine min={0} max={10} value={2} onChange={onChange} ariaLabel="ღერძი" />);
    const strip = container.querySelector('.nl-strip') as HTMLElement;
    strip.getBoundingClientRect = () => ({ left: 0, top: 0, right: 222, bottom: 128, width: 222, height: 128, x: 0, y: 0, toJSON: () => ({}) });
    const marker = screen.getByRole('slider');
    fireEvent.pointerDown(marker, { clientX: 40, pointerId: 1 });
    fireEvent.pointerMove(marker, { clientX: 22 + 89, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith(5);
    fireEvent.pointerMove(marker, { clientX: 5000, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith(10);
    fireEvent.pointerUp(marker, { pointerId: 1 });
    onChange.mockClear();
    fireEvent.pointerMove(marker, { clientX: 60, pointerId: 1 });
    expect(onChange).not.toHaveBeenCalled(); // no drag after release
  });
});

// ─────────────────────────── player walk-throughs ───────────────────────────

function go(hash: string) {
  window.location.hash = hash;
  return render(<StudentApp />);
}
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const typeNum = (label: string | RegExp, value: string) => fireEvent.change(screen.getByRole('textbox', { name: label }), { target: { value } });
const answerNumber = (value: string) => {
  typeNum(/./, value);
  click('პასუხის შემოწმება');
};
const feedback = () => document.querySelector('.lp-feedback')?.textContent ?? '';
const saved = () => JSON.parse(window.localStorage.getItem(LEARN_STORAGE_KEY) ?? '{}');

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

describe('Grade 1 unit page', () => {
  it('lists all five lessons as playable', () => {
    go('#/student/lessons/g1-u01');
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items).toHaveLength(5);
    IDS.forEach((id, i) => expect(within(items[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
  });
});

describe('L1 counting forwards and backwards', () => {
  it('plays through, using the tile walk, and unlocks the next lesson', () => {
    go('#/student/lessons/g1-u01-l1');
    expect(screen.getByText('ნაბიჯი 1 / 9')).toBeTruthy();

    // challenge: counting backwards by mistake gets targeted feedback; retry
    answerNumber('5');
    expect(feedback()).toContain('5 არის 6-მდე');
    click('ხელახლა ცდა');
    answerNumber('7');
    expect(screen.getByText('სწორია')).toBeTruthy();
    click('გაგრძელება');

    // explore: forward, then backward; stops at the ends
    expect(screen.getByText('გამოკვლევა')).toBeTruthy();
    expect(document.querySelectorAll('.tiles .tile')).toHaveLength(10);
    expect(document.querySelector('.tile.is-active')?.textContent).toBe('6');
    click('შემდეგი რიცხვი ▶');
    expect(document.querySelector('.tile.is-active')?.textContent).toBe('7');
    expect(document.querySelector('.xt-note')?.textContent).toContain('6 → 7');
    fireEvent.click(screen.getByRole('button', { name: 'უკან თვლა' }));
    click('◀ წინა რიცხვი');
    click('◀ წინა რიცხვი');
    expect(document.querySelector('.tile.is-active')?.textContent).toBe('5');
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 1' }));
    expect((screen.getByRole('button', { name: '◀ წინა რიცხვი' }) as HTMLButtonElement).disabled).toBe(true);
    click('გაგრძელება');

    // understand: the two chains and replay controls
    expect(screen.getByText('გააზრება')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /ხელახლა/ })).toHaveLength(2);
    expect(document.querySelectorAll('.chain')).toHaveLength(2);
    click('გაგრძელება');

    // practice 1–3 (hint, wrong, right)
    click('მინიშნება');
    expect(screen.getByText('ყოველ ნაბიჯზე ერთი ემატება.')).toBeTruthy();
    answerNumber('6');
    click('გაგრძელება');
    answerNumber('8');
    expect(feedback()).toContain('8 უკვე დავთვალეთ');
    click('ხელახლა ცდა');
    answerNumber('6');
    click('გაგრძელება');
    fireEvent.click(screen.getByRole('radio', { name: '5, 6, 7, 8' }));
    click('პასუხის შემოწმება');
    expect(feedback()).toContain('წინ მიდის');
    click('ხელახლა ცდა');
    fireEvent.click(screen.getByRole('radio', { name: '8, 7, 6, 5' }));
    click('პასუხის შემოწმება');
    click('გაგრძელება');

    // check: 17, 17, 100
    answerNumber('17');
    click('გაგრძელება');
    answerNumber('17');
    click('გაგრძელება');
    answerNumber('100');
    click('გაკვეთილის დასრულება');

    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    expect(screen.getByText('3 / 3')).toBeTruthy();
    expect(screen.getByText('წინ თვლა', { selector: '.lp-concepts li' })).toBeTruthy();
    expect(saved()['g1-u01-l1']).toMatchObject({ status: 'completed', checkCorrect: 3, checkTotal: 3 });
    const next = screen.getByRole('link', { name: /გაგრძელება: U01\.2/ });
    expect(next.getAttribute('href')).toBe('#/student/lessons/g1-u01-l2');
    expect(screen.getByRole('link', { name: 'U01-ზე დაბრუნება' }).getAttribute('href')).toBe('#/student/lessons/g1-u01');
    expect(document.querySelector('.lp-unit-done')).toBeNull(); // unit not complete yet
  });
});

describe('L2 numerals, names and quantities', () => {
  it('links the three representations in the explore step', () => {
    go('#/student/lessons/g1-u01-l2');
    fireEvent.click(screen.getByRole('radio', { name: '24' }));
    click('პასუხის შემოწმება');
    click('გაგრძელება');
    expect(screen.getByText('ოცდაოთხი')).toBeTruthy();
    expect(document.querySelectorAll('.panel')).toHaveLength(3);
    expect(document.querySelectorAll('.qty .qty-ten')).toHaveLength(2);
    expect(document.querySelectorAll('.qty .qty-ones i')).toHaveLength(4);
    fireEvent.click(screen.getByRole('button', { name: /ციფრებით/ }));
    expect(document.querySelector('.xt-note')?.textContent).toContain('24 = ოცდაოთხი = 2 ათიანი და 4 ცალი');
    fireEvent.click(screen.getByRole('button', { name: '37' }));
    expect(screen.getByText('ოცდაჩვიდმეტი')).toBeTruthy();
    expect(document.querySelectorAll('.qty .qty-ten')).toHaveLength(3);
    expect(document.querySelector('.xt-note')?.textContent).toContain('შეეხე');
  });
});

describe('L3 sequences', () => {
  it('extends a sequence one number at a time and keeps the hidden slot apart from the known numbers', () => {
    go('#/student/lessons/g1-u01-l3');
    answerNumber('9');
    click('გაგრძელება');
    const tiles = () => [...document.querySelectorAll('.seq .seq-tile')].map((n) => n.textContent);
    expect(tiles()).toEqual(['4', '5', '6', '?']);
    fireEvent.click(screen.getByRole('button', { name: 'ცარიელი ადგილი: შეეხე და ნახე რიცხვი' }));
    expect(tiles()).toEqual(['4', '5', '6', '7', '?']);
    for (let i = 0; i < 4; i += 1) click('შემდეგი რიცხვი');
    expect(tiles()).toEqual(['4', '5', '6', '7', '8', '9', '10', '11']); // full: no hole left
    expect((screen.getByRole('button', { name: 'შემდეგი რიცხვი' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'ორ-ორი' }));
    expect(tiles()).toEqual(['2', '4', '6', '?']);
    click('შემდეგი რიცხვი');
    expect(tiles()).toEqual(['2', '4', '6', '8', '?']);
    fireEvent.click(screen.getByRole('button', { name: '↻ თავიდან' }));
    expect(tiles()).toEqual(['2', '4', '6', '?']);
  });
});

describe('L4 number line', () => {
  it('validates marker placement, keeps the marker when a hint opens, and offers retries', () => {
    go('#/student/lessons/g1-u01-l4');
    // nothing moved yet: gentle prompt, no attempt used
    click('პასუხის შემოწმება');
    expect(feedback()).toContain('გადაიტანე მარკერი');
    // tap a wrong tick: targeted feedback
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 6' }));
    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('6');
    click('მინიშნება');
    expect(screen.getByText('დაიწყე 5-დან და დათვალე ორი ნაბიჯი მარჯვნივ.')).toBeTruthy();
    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('6'); // answer preserved
    click('პასუხის შემოწმება');
    expect(feedback()).toContain('6 ერთი ნაბიჯით ახლოსაა');
    click('ხელახლა ცდა');
    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('6');
    // step with the arrow, then submit
    click('ერთი ნაბიჯი მარჯვნივ');
    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('7');
    click('პასუხის შემოწმება');
    expect(screen.getByText('სწორია')).toBeTruthy();
    // the finished answer can no longer be moved
    expect(screen.queryByRole('slider')).toBeNull();
    expect(screen.queryByRole('button', { name: 'რიცხვი 3' })).toBeNull();
  });

  it('explore: arrows, tick taps and the hop demonstration (5 → 8 in three steps)', () => {
    go('#/student/lessons/g1-u01-l4');
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 7' }));
    click('პასუხის შემოწმება');
    click('გაგრძელება');
    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('5');
    click('ერთი ნაბიჯი მარჯვნივ');
    expect(document.querySelector('.nl-readout')?.textContent).toBe('მარკერზე: 6');
    expect(document.querySelector('.xt-note')?.textContent).toContain('მარჯვნივ');
    click('ერთი ნაბიჯი მარცხნივ');
    click('ერთი ნაბიჯი მარცხნივ');
    expect(document.querySelector('.xt-note')?.textContent).toContain('შემცირდა');
    click('გაგრძელება');
    // understand: step the demonstration by hand
    expect(document.querySelectorAll('.demo .nl-flag')).toHaveLength(2);
    click('შემდეგი ნაბიჯი');
    click('შემდეგი ნაბიჯი');
    click('შემდეგი ნაბიჯი');
    expect(document.querySelector('.demo-status')?.textContent).toContain('მივედით 8-ზე 3 ნაბიჯით მარჯვნივ');
    expect((screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('in the check the arrows are gone, but the line can still be tapped', () => {
    go('#/student/lessons/g1-u01-l4');
    // fast-forward to the first check question
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 7' }));
    click('პასუხის შემოწმება');
    for (let i = 0; i < 3; i += 1) click('გაგრძელება');
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 12' })); // practice 1
    click('პასუხის შემოწმება');
    click('გაგრძელება');
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 7' })); // practice 2
    click('პასუხის შემოწმება');
    click('გაგრძელება');
    answerNumber('14'); // practice 3 (visual, typed)
    click('გაგრძელება');
    expect(screen.getByText('შემოწმება', { selector: '.lp-stage-label' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'ერთი ნაბიჯი მარჯვნივ' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 17' }));
    click('პასუხის შემოწმება');
    expect(screen.getByText('სწორია')).toBeTruthy();
  });
});

describe('L5 counting in steps', () => {
  it('explore shows the numbers reached for each step size', () => {
    go('#/student/lessons/g1-u01-l5');
    answerNumber('20');
    click('გაგრძელება');
    const list = () => document.querySelector('.compare')?.textContent ?? '';
    click('გადახტი +2');
    click('გადახტი +2');
    click('გადახტი +2');
    expect(list()).toContain('2-ით: 2, 4, 6');
    fireEvent.click(screen.getByRole('button', { name: '5-ით' }));
    click('გადახტი +5');
    expect(list()).toContain('5-ით: 5');
    expect(list()).toContain('2-ით: 2, 4, 6');
    fireEvent.click(screen.getByRole('button', { name: '10-ით' }));
    for (let i = 0; i < 3; i += 1) click('გადახტი +10');
    expect(list()).toContain('10-ით: 10, 20, 30');
    expect((screen.getByRole('button', { name: 'გადახტი +10' }) as HTMLButtonElement).disabled).toBe(true); // end of the line
    expect(document.querySelectorAll('.nl-arc').length).toBe(3);
  });

  it('completing the last lesson shows the unit-complete state only when the other four are done', () => {
    window.localStorage.setItem(
      LEARN_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(IDS.slice(0, 4).map((id) => [id, { status: 'completed', checkCorrect: 3, checkTotal: 3 }]))),
    );
    resetProgressCache();
    go('#/student/lessons/g1-u01-l5');
    answerNumber('20');
    for (let i = 0; i < 3; i += 1) click('გაგრძელება');
    // practice 1, 2 (line), 3 (blanks), 4 (choice)
    answerNumber('16');
    click('გაგრძელება');
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 15' }));
    click('პასუხის შემოწმება');
    click('გაგრძელება');
    fireEvent.change(screen.getByRole('textbox', { name: 'ცარიელი ადგილი 1' }), { target: { value: '30' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'ცარიელი ადგილი 2' }), { target: { value: '50' } });
    click('პასუხის შემოწმება');
    expect(screen.getByText('სწორია')).toBeTruthy();
    click('გაგრძელება');
    fireEvent.click(screen.getByRole('radio', { name: '5-ით' }));
    click('პასუხის შემოწმება');
    click('გაგრძელება');
    // check
    answerNumber('26');
    click('გაგრძელება');
    fireEvent.change(screen.getByRole('textbox', { name: 'ცარიელი ადგილი 1' }), { target: { value: '10' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'ცარიელი ადგილი 2' }), { target: { value: '20' } });
    click('პასუხის შემოწმება');
    click('გაგრძელება');
    fireEvent.click(screen.getByRole('radio', { name: '35' }));
    click('პასუხის შემოწმება');
    click('გაკვეთილის დასრულება');

    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    expect(document.querySelector('.lp-unit-done')?.textContent).toContain('U01 დასრულდა');
    expect(saved()['g1-u01-l5']).toMatchObject({ status: 'completed', checkCorrect: 3 });
    // last lesson: no "continue" link, only the way back
    expect(screen.queryByRole('link', { name: /გაგრძელება:/ })).toBeNull();
    expect(screen.getByRole('link', { name: 'გაკვეთილების სიაში დაბრუნება' })).toBeTruthy();
  });

});

describe('mascot on the new activities', () => {
  it('speaks contextually on explore, stays out of the understand step and never states an answer', () => {
    go('#/student/lessons/g1-u01-l1');
    answerNumber('7');
    click('გაგრძელება');
    expect(document.querySelector('.lp-bubble')?.textContent).toContain('გამოიკვლევ');
    fireEvent.click(document.querySelector('.lp-bubble-close') as HTMLElement);
    expect(document.querySelector('.lp-bubble')).toBeNull();
    click('გაგრძელება');
    expect(document.querySelector('.lp-coach')).toBeNull();
  });
});
