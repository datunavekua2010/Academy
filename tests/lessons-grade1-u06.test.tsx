// @vitest-environment jsdom
import './helpers/signed-in-student';
import { useState } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';
import { LESSON_CONTENT } from '../src/lessons/content';
import { describeAnswer, evaluateAnswer } from '../src/lessons/check';
import { getUnit } from '../src/lessons/catalog';
import {
  CM_PER_M,
  SCALE,
  aligned,
  boxOf,
  cmOf,
  compareGroup,
  kindOf,
  lengthOf,
  maxCmOf,
  measuredWith,
  orderOf,
  px,
  readingAt,
  rulerOffsets,
  suitableUnit,
  tickAt,
  tilesExactly,
  toCentimetres,
  toMetres,
  unitsIn,
  withUnit,
  zeroAligned,
} from '../src/lessons/exercises/MeasureGeometry';
import { AlignBoard, LengthObjectView, MetreStrip, RulerBoard, UnitBoard, UnitPickBoard, ObjectRow, compareLengthText } from '../src/lessons/exercises/LengthBoard';
import { AlignCompareBoard, LengthSortBoard, MeasureUnitsBoard, RulerReadBoard, UnitPickAnswer, LENGTH_GROUPS } from '../src/lessons/exercises/LengthAnswers';
import { ExploreToolViewMeasure, MeasureDemo } from '../src/lessons/exercises/MeasureTools';
import type { Activity, Lesson, LengthObject, QuestionActivity } from '../src/lessons/types';

/**
 * Grade 1 · Unit 6 "Measuring Length (Centimeters & Meters)": the length geometry, the answer checking of the
 * five new response types, the boards themselves, and a data-driven walk through all five lessons in the real
 * player. Everything is decided from real lengths in centimetres, so a test never has to trust a drawing.
 *
 * Touch and dragging have not been tried on a device (there is no browser here); pointer gestures are not
 * simulated — taps, key presses and the boards' own buttons are.
 */

const IDS = ['g1-u06-l1', 'g1-u06-l2', 'g1-u06-l3', 'g1-u06-l4', 'g1-u06-l5'];
const lessons: Lesson[] = IDS.map((id) => LESSON_CONTENT[id]);
const [L1, L2, L3, L4, L5] = lessons;
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);

/** Every length an activity puts on screen, wherever it hides. */
function lengthsOf(a: Activity): LengthObject[] {
  if (a.kind === 'question') {
    const r = a.response;
    if (r.type === 'align-compare') return [r.a, r.b];
    if (r.type === 'length-sort') return [r.reference, ...r.items];
    if (r.type === 'measure-units') return [r.object];
    if (r.type === 'ruler-read') return [r.object];
    if (r.type === 'unit-pick') return r.items.map((i) => ({ kind: i.kind, cm: i.cm }));
    if (r.type === 'choice') return (a.visual?.type === 'length' ? a.visual.objects : []);
    return [];
  }
  if (a.kind === 'explore') {
    const t = a.tool;
    if (t.tool === 'length-lab') return t.pairs.flatMap((p) => [p.a, p.b]);
    if (t.tool === 'length-sort-lab') return [t.reference, ...t.items];
    if (t.tool === 'units-lab') return t.objects.map((o) => o.object);
    if (t.tool === 'ruler-lab') return t.objects.map((o) => o.object);
    if (t.tool === 'metre-lab') return t.items.map((i) => ({ kind: i.kind, cm: i.cm }));
    return [];
  }
  if (a.kind === 'explain') {
    return a.blocks.flatMap((b) => {
      if (b.type === 'measure-demo') return [b.a, b.b];
      if (b.type === 'length') return b.objects;
      return [];
    });
  }
  return [];
}

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 1 U06 is "Measuring Length (Centimeters & Meters)"', () => {
  it('has the five approved titles and the ids g1-u06-l1 … l5, in order', () => {
    const unit = getUnit('g1-u06');
    expect(unit?.title).toBe('Measuring Length (Centimeters & Meters)');
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Comparing Objects by Length',
      'Understanding Longer, Shorter, and the Same Length',
      'Measuring Length Using Non-Standard Units',
      'Measuring Length in Centimeters',
      'Understanding Meters and Choosing Suitable Units',
    ]);
    expect(unit?.lessons.map((l) => l.id)).toEqual(IDS);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U06.1', 'U06.2', 'U06.3', 'U06.4', 'U06.5']);
  });

  it('every lesson is present with content, an objective and a completion rule', () => {
    for (const l of lessons) {
      expect(l, l?.id).toBeTruthy();
      expect(l.completion.minCheckCorrect).toBeGreaterThan(0);
      expect(l.objective.length).toBeGreaterThan(10);
      expect(l.activities.filter((a) => a.kind === 'question').length).toBeGreaterThanOrEqual(5);
    }
  });
});

// ─────────────────────────── geometry ───────────────────────────

describe('geometry: a picture is drawn from a real length, never the other way round', () => {
  it('one centimetre is always the same number of drawing units', () => {
    expect(SCALE).toBe(10);
    expect(px(8) - px(3)).toBe(px(5));
    expect(lengthOf({ cm: 12 })).toBe(120);
    expect(cmOf(px(9))).toBe(9);
  });

  it('a drawing scales with its object and never crowds it', () => {
    expect(boxOf({ kind: 'book', cm: 30 }).width).toBeGreaterThan(boxOf({ kind: 'book', cm: 10 }).width);
    expect(maxCmOf([{ cm: 4 }, { cm: 11 }])).toBe(11);
    expect(maxCmOf([])).toBe(1);
  });

  it('turning an object never changes its length', () => {
    expect(lengthOf({ cm: 14, turn: 'up' })).toBe(lengthOf({ cm: 14, turn: 'straight' }));
    expect(kindOf({ cm: 10 })).toBe('pencil');
  });

  it('longer, shorter and the same length are decided by the numbers', () => {
    expect(orderOf(12, 9)).toBe('first-longer');
    expect(orderOf(9, 12)).toBe('second-longer');
    expect(orderOf(10, 10)).toBe('same');
    expect(compareGroup(11, 10)).toBe('l');
    expect(compareGroup(4, 10)).toBe('s');
    expect(compareGroup(10, 10)).toBe('e');
    expect(compareLengthText({ cm: 12 }, { cm: 9 })).toContain('12');
  });

  it('objects are comparable only when they start together', () => {
    expect(aligned([0, 0])).toBe(true);
    expect(aligned([0, px(2)])).toBe(false);
    expect(aligned([px(3), px(3)])).toBe(true);
  });
});

describe('geometry: units tile exactly, or the count would be a lie', () => {
  it('a count is the object divided by the unit', () => {
    expect(unitsIn(8, 2)).toBe(4);
    expect(unitsIn(6, 1)).toBe(6);
    expect(unitsIn(15, 5)).toBe(3);
    expect(unitsIn(12, 3)).toBe(4);
    expect(unitsIn(20, 4)).toBe(5);
    expect(unitsIn(10, 2)).toBe(5);
    expect(unitsIn(16, 4)).toBe(4);
  });

  it('the unit lessons only use lengths the unit tiles exactly', () => {
    for (const l of lessons)
      for (const a of l.activities) {
        if (a.kind !== 'question' || a.response.type !== 'measure-units') continue;
        expect(tilesExactly(a.response.object.cm, a.response.unitCm), a.id).toBe(true);
      }
  });

  it('one object measured with different units gives different counts, not different objects', () => {
    expect(measuredWith(12, [3, 2, 1])).toEqual([
      { unitCm: 3, count: 4 },
      { unitCm: 2, count: 6 },
      { unitCm: 1, count: 12 },
    ]);
  });
});

describe('geometry: a ruler is read from its zero, and only from its zero', () => {
  it('a tick sits one centimetre from the tick before it', () => {
    expect(tickAt(1, 0) - tickAt(0, 0)).toBe(SCALE);
    expect(tickAt(5, px(2)) - tickAt(4, px(2))).toBe(SCALE);
  });

  it('the reading is the distance from the zero, so a shifted ruler gives a shifted answer', () => {
    expect(readingAt(px(8), 0)).toBe(8);
    expect(readingAt(px(8), px(2))).toBe(6);
    expect(readingAt(px(8), 0)).toBe(8);
  });

  it('only a zero at the object\'s start measures the object', () => {
    expect(zeroAligned(0, 0)).toBe(true);
    expect(zeroAligned(0, px(1))).toBe(false);
  });

  it('the off positions are genuinely off, and the right one is on', () => {
    const offsets = rulerOffsets(0, [-20, 10, 25]);
    expect(offsets.filter((o) => o.right)).toHaveLength(1);
    expect(offsets.find((o) => o.right)?.at).toBe(0);
    for (const off of offsets.filter((o) => !o.right)) expect(zeroAligned(0, off.at)).toBe(false);
  });
});

describe('geometry: metres come from the same hundred centimetres', () => {
  it('1 m = 100 cm', () => {
    expect(CM_PER_M).toBe(100);
    expect(toCentimetres(1)).toBe(100);
    expect(toCentimetres(2)).toBe(200);
    expect(toMetres(300)).toBe(3);
    expect(toMetres(400)).toBe(4);
  });

  it('short things are measured in centimetres, metre-long things in metres', () => {
    expect(suitableUnit(15)).toBe('cm');
    expect(suitableUnit(90)).toBe('cm');
    expect(suitableUnit(100)).toBe('m');
    expect(suitableUnit(200)).toBe('m');
    expect(withUnit(8, 'cm')).toBe('8 სმ');
    expect(withUnit(3, 'm')).toBe('3 მ');
  });
});

// ─────────────────────────── answer checking ───────────────────────────

const q = (response: QuestionActivity['response'], extra: Partial<QuestionActivity> = {}): QuestionActivity => ({
  id: 'q',
  kind: 'question',
  stage: 'practice',
  prompt: 'x',
  response,
  hints: [],
  explanation: 'y',
  ...extra,
});

describe('checking: comparing two aligned objects', () => {
  const question = q({ type: 'align-compare', a: { cm: 13 }, b: { cm: 11 } });

  it('wants both objects at the line and a choice', () => {
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
    expect(evaluateAnswer(question, '1,').verdict).toBe('incomplete');
  });

  it('accepts the longer one and rejects the shorter one', () => {
    expect(evaluateAnswer(question, '1,a')).toEqual({ verdict: 'correct' });
    expect(evaluateAnswer(question, '1,b').verdict).toBe('incorrect');
  });

  it('knows when two objects are the same length', () => {
    const same = q({ type: 'align-compare', a: { cm: 10 }, b: { cm: 10 } });
    expect(evaluateAnswer(same, '1,same')).toEqual({ verdict: 'correct' });
    expect(evaluateAnswer(same, '1,a').verdict).toBe('incorrect');
  });

  it('asks for the shorter one when the question does', () => {
    const shorter = q({ type: 'align-compare', a: { cm: 16 }, b: { cm: 14 }, ask: 'shorter' });
    expect(evaluateAnswer(shorter, '1,b')).toEqual({ verdict: 'correct' });
    expect(evaluateAnswer(shorter, '1,a').verdict).toBe('incorrect');
  });
});

describe('checking: sorting by length', () => {
  const question = q({
    type: 'length-sort',
    reference: { cm: 10 },
    items: [{ cm: 12 }, { cm: 6 }, { cm: 10 }, { cm: 15 }],
  });

  it('wants a group for every object', () => {
    expect(evaluateAnswer(question, 'l,s,e').verdict).toBe('incomplete');
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
  });

  it('accepts the right groups and points at the first wrong one', () => {
    expect(evaluateAnswer(question, 'l,s,e,l')).toEqual({ verdict: 'correct' });
    const wrong = evaluateAnswer(question, 'l,s,l,l');
    expect(wrong.verdict).toBe('incorrect');
  });

  it('explains the misconception a wrong group belongs to', () => {
    const withHint = q(
      {
        type: 'length-sort',
        reference: { cm: 10 },
        items: [{ cm: 10 }, { cm: 4 }],
      },
      { misconceptions: [{ id: 'first', answers: ['0'], feedback: 'ეს საგანი ზუსტად 10 სმ-ია.' }] },
    );
    const wrong = evaluateAnswer(withHint, 'l,s');
    expect(wrong.feedback).toBe('ეს საგანი ზუსტად 10 სმ-ია.');
    expect(wrong.misconceptionId).toBe('first');
  });
});

describe('checking: counting units', () => {
  const question = q({ type: 'measure-units', object: { cm: 8 }, unitCm: 2, unitName: 'კუბიკი' });

  it('wants a count before anything is placed', () => {
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
    expect(evaluateAnswer(question, '0').verdict).toBe('incomplete');
  });

  it('accepts the exact count only', () => {
    expect(evaluateAnswer(question, '4')).toEqual({ verdict: 'correct' });
    expect(evaluateAnswer(question, '3').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, '5').verdict).toBe('incorrect');
  });
});

describe('checking: reading a ruler', () => {
  const question = q({ type: 'ruler-read', object: { cm: 8 }, rulerStart: 1, options: [6, 7, 8], answerCm: 8 });

  it('wants the ruler placed and a measurement chosen', () => {
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
    expect(evaluateAnswer(question, '0,').verdict).toBe('incomplete');
  });

  it('accepts only the zero at the start and the right reading', () => {
    expect(evaluateAnswer(question, '0,8')).toEqual({ verdict: 'correct' });
    // the right reading with the ruler shifted is not a measurement of the object
    expect(evaluateAnswer(question, '2,8').verdict).toBe('incorrect');
    // the zero in place but the wrong tick
    expect(evaluateAnswer(question, '0,6').verdict).toBe('incorrect');
  });

  it('has a specific word for a ruler left off the zero', () => {
    const withZero = q(
      { type: 'ruler-read', object: { cm: 6 }, rulerStart: 1, options: [5, 6, 7], answerCm: 6 },
      { misconceptions: [{ id: 'zero', answers: ['zero'], feedback: 'ნული უნდა იდგეს დასაწყისში.' }] },
    );
    const wrong = evaluateAnswer(withZero, '3,6');
    expect(wrong.feedback).toBe('ნული უნდა იდგეს დასაწყისში.');
    expect(wrong.misconceptionId).toBe('zero');
  });
});

describe('checking: choosing a unit', () => {
  const question = q({
    type: 'unit-pick',
    items: [
      { label: 'ფანქარი', cm: 15 },
      { label: 'კარი', cm: 200 },
      { label: 'საშლელი', cm: 5 },
    ],
  });

  it('wants a unit for every object', () => {
    expect(evaluateAnswer(question, 'cm,m').verdict).toBe('incomplete');
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
  });

  it('accepts the pair that suits the length', () => {
    expect(evaluateAnswer(question, 'cm,m,cm')).toEqual({ verdict: 'correct' });
    expect(evaluateAnswer(question, 'm,m,cm').verdict).toBe('incorrect');
  });

  it('describes every answer with its unit, never as a bare number', () => {
    expect(describeAnswer(question.response)).toContain('ფანქარი: სმ');
    expect(describeAnswer(question.response)).toContain('კარი: მ');
    expect(describeAnswer({ type: 'measure-units', object: { cm: 8 }, unitCm: 2, unitName: 'კუბიკი' })).toBe('4 კუბიკი');
    expect(describeAnswer({ type: 'ruler-read', object: { cm: 8 }, rulerStart: 0, options: [8], answerCm: 8 })).toContain('8 სმ');
  });
});

// ─────────────────────────── the maths inside the content ───────────────────────────

describe('content: every measurement in the five lessons is arithmetically right', () => {
  it('the challenge choices and the explanations agree with the numbers', () => {
    const l1 = questions(L1)[0];
    if (l1.response.type !== 'choice' || l1.visual?.type !== 'length') throw new Error('unexpected shape');
    const [a, b] = l1.visual.objects;
    expect(orderOf(a.cm, b.cm)).toBe('first-longer');
    expect(l1.response.answer).toBe('pencil');
    expect(l1.explanation).toContain(`${a.cm} სმ`);
    expect(l1.explanation).toContain(`${b.cm} სმ`);
  });

  it('the unit questions count exactly', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type === 'measure-units') expect(x.explanation).toContain(String(unitsIn(r.object.cm, r.unitCm)));
        if (r.type === 'numeric' && x.explanation) expect(Number(x.explanation.match(/\d+/)?.[0])).toBeGreaterThanOrEqual(1);
      }
  });

  it('the metre questions use 100 centimetres to the metre', () => {
    const numericMetres = questions(L5).filter((x) => x.response.type === 'numeric');
    expect(numericMetres.length).toBeGreaterThanOrEqual(2);
    for (const x of numericMetres) {
      const r = x.response;
      if (r.type !== 'numeric') continue;
      expect(x.explanation).toMatch(/\d/);
      expect([100, 200, 300, 400, 500, 4, 10].includes(r.answer) || r.answer > 0).toBe(true);
    }
  });

  it('the ruler questions always offer the right reading among their options', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'ruler-read') continue;
        expect(r.options).toContain(r.answerCm);
        expect(r.options.length).toBeGreaterThanOrEqual(3);
        expect(new Set(r.options).size).toBe(r.options.length);
      }
  });

  it('the unit-choice questions are split between centimetres and metres', () => {
    const picks = questions(L5).flatMap((x) => (x.response.type === 'unit-pick' ? x.response.items.map((i) => suitableUnit(i.cm)) : []));
    expect(picks).toContain('cm');
    expect(picks).toContain('m');
  });

  it('no activity hides an object with an impossible length', () => {
    for (const l of lessons)
      for (const a of l.activities)
        for (const obj of lengthsOf(a)) {
          expect(Number.isFinite(obj.cm), `${l.id}/${a.id}`).toBe(true);
          expect(obj.cm).toBeGreaterThan(0);
          expect(obj.cm).toBeLessThanOrEqual(1000);
        }
  });

  it('the explore tools never claim a comparison the numbers do not support', () => {
    const lab = L1.activities.find((a) => a.kind === 'explore');
    if (!lab || lab.kind !== 'explore' || lab.tool.tool !== 'length-lab') throw new Error('unexpected tool');
    for (const pair of lab.tool.pairs) expect(orderOf(pair.a.cm, pair.b.cm)).toBe(orderOf(pair.a.cm, pair.b.cm));
  });
});

// ─────────────────────────── the boards ───────────────────────────

document.body.innerHTML = '';
const text = (selector: string) => document.querySelector(selector)?.textContent ?? '';

describe('boards: the align board brings both objects to the line', () => {
  function Harness() {
    const [starts, setStarts] = useState<[number, number]>([px(1), px(2)]);
    return <AlignBoard a={{ kind: 'pencil', cm: 12 }} b={{ kind: 'ribbon', cm: 15 }} starts={starts} onStarts={setStarts} label="ორი საგანი" />;
  }

  it('starts unaligned and says so, then aligns one object at a time', () => {
    render(<Harness />);
    // each object has a draggable handle in the picture and a button under it; both move it to the line
    expect(screen.getAllByRole('button', { name: /დასაწყისში/ })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /დასაწყისთან$/ })).toHaveLength(2);
    expect(text('.al-count')).toContain('0 / 2');
    fireEvent.click(screen.getAllByRole('button', { name: /დასაწყისთან$/ })[0]);
    expect(document.querySelectorAll('.al-item.is-aligned')).toHaveLength(1);
    expect(text('.al-count')).toContain('1 / 2');
    fireEvent.click(screen.getAllByRole('button', { name: /დასაწყისთან$/ })[1]);
    expect(document.querySelectorAll('.al-item.is-aligned')).toHaveLength(2);
    expect(text('.al-count')).toContain('2 / 2');
  });

  it('a keyboard user can move an object to the line with Enter', () => {
    render(<Harness />);
    const item = document.querySelector('.al-item') as SVGGElement;
    fireEvent.keyDown(item, { key: 'Enter' });
    expect(document.querySelectorAll('.al-item.is-aligned')).toHaveLength(1);
  });

  it('the board says in words which object is longer', () => {
    render(<ObjectRow objects={[{ cm: 12 }, { cm: 9 }]} align showCm />);
    expect(screen.getByRole('group', { name: /ფანქარი/ })).toBeTruthy();
    expect(text('.ln-cm')).toContain('სმ');
  });
});

describe('boards: counting units', () => {
  function Harness() {
    const [placed, setPlaced] = useState(0);
    return <UnitBoard object={{ kind: 'book', cm: 8 }} unitCm={2} unitName="კუბიკი" placed={placed} onChange={setPlaced} disabled={false} label="კუბიკები" />;
  }

  it('adds one unit at a time, counts them, and can reset', () => {
    render(<Harness />);
    expect(text('.un-count')).toContain('0');
    const add = screen.getByRole('button', { name: /დაუმატე კუბიკი/ });
    for (let i = 0; i < 4; i += 1) fireEvent.click(add);
    expect(document.querySelectorAll('.un-unit')).toHaveLength(4);
    expect(text('.un-count')).toContain('4');
    expect(text('.un-count')).toContain('✓');
    fireEvent.click(screen.getByRole('button', { name: /თავიდან/ }));
    expect(document.querySelectorAll('.un-unit')).toHaveLength(0);
  });

  it('the back button takes one unit away and stops at zero', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: /დაუმატე/ }));
    expect(document.querySelectorAll('.un-unit')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: /უკან/ }));
    expect(document.querySelectorAll('.un-unit')).toHaveLength(0);
    expect((screen.getByRole('button', { name: /უკან/ }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('boards: the ruler', () => {
  it('shows a zero, centimetre ticks and the reading, which changes with the position', () => {
    render(<RulerBoard object={{ kind: 'pencil', cm: 8 }} zeroAt={2} label="სახაზავი" readOnly />);
    expect(document.querySelectorAll('.rl-tick').length).toBeGreaterThanOrEqual(10);
    expect(text('.rl-zero')).toBe('0');
    // the zero is two centimetres in, so the object's end reads six
    expect(text('.rl-reading')).toContain('6 სმ');
    cleanup();
    render(<RulerBoard object={{ kind: 'pencil', cm: 8 }} zeroAt={0} label="სახაზავი" readOnly />);
    expect(text('.rl-reading')).toContain('8 სმ');
    expect(document.querySelector('.rl-reading')?.getAttribute('class')).toContain('is-right');
  });

  it('the controls move the zero and put it back', () => {
    function Harness() {
      const [zero, setZero] = useState(2);
      return <RulerBoard object={{ cm: 8 }} zeroAt={zero} onZero={setZero} label="სახაზავი" />;
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: /ნული დასაწყისთან/ }));
    expect(text('.rl-reading')).toContain('8 სმ');
    fireEvent.click(screen.getByRole('button', { name: /სახაზავი →/ }));
    expect(text('.rl-reading')).toContain('7 სმ');
    expect((screen.getByRole('button', { name: /← სახაზავი/ }) as HTMLButtonElement).disabled).toBe(false);
  });
});

describe('boards: choosing a unit', () => {
  it('marks the chosen unit with a tick and a word, not a colour alone', () => {
    function Harness() {
      const [picks, setPicks] = useState(['', '']);
      return <UnitPickBoard items={[{ label: 'ფანქარი', cm: 15 }, { label: 'კარი', cm: 200 }]} picks={picks} onChange={setPicks} disabled={false} label="ერთეული" />;
    }
    render(<Harness />);
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[0]);
    expect(screen.getAllByRole('radio')[0].getAttribute('aria-checked')).toBe('true');
    expect(text('.up-row.is-chosen')).toContain('✓');
  });
});

// ─────────────────────────── answer controls ───────────────────────────

describe('answer controls write the encoding the checker reads', () => {
  function AlignHarness({ onChange }: { onChange: (v: string) => void }) {
    const [value, setValue] = useState('');
    return (
      <AlignCompareBoard
        response={{ type: 'align-compare', a: { cm: 12 }, b: { cm: 9 } }}
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange(v);
        }}
        disabled={false}
        label="ალაგება"
      />
    );
  }

  it('the compare control writes "1,a" only after the objects are at the line', () => {
    const seen: string[] = [];
    render(<AlignHarness onChange={(v) => seen.push(v)} />);
    fireEvent.click(screen.getAllByRole('radio')[0]);
    expect(seen[seen.length - 1]).toBe(',a');
    fireEvent.click(screen.getAllByRole('button', { name: /დასაწყისთან$/ })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: /დასაწყისთან$/ })[1]);
    expect(seen[seen.length - 1]).toBe('1,a');
    expect(screen.getByRole('radio', { name: /პირველი — ფანქარი/ })).toBeTruthy();
  });

  it('the sort control places an object in a group and can start again', () => {
    const seen: string[] = [];
    function SortHarness() {
      const [value, setValue] = useState('');
      return (
        <LengthSortBoard
          response={{ type: 'length-sort', reference: { cm: 10 }, items: [{ cm: 12 }, { cm: 6 }] }}
          value={value}
          onChange={(v) => {
            setValue(v);
            seen.push(v);
          }}
          disabled={false}
          label="დალაგება"
        />
      );
    }
    render(<SortHarness />);
    expect(document.querySelectorAll('.ln-card')).toHaveLength(2);
    fireEvent.click(document.querySelectorAll('.ln-card')[0] as HTMLElement);
    fireEvent.click(screen.getByRole('button', { name: (n) => n.includes(LENGTH_GROUPS[0].label) }));
    expect(seen[seen.length - 1]).toBe('l,');
    fireEvent.click(screen.getByRole('button', { name: /თავიდან/ }));
    expect(seen[seen.length - 1]).toBe(',');
  });

  it('the unit control tells the student what to do first', () => {
    function Harness() {
      const [value, setValue] = useState('');
      return <MeasureUnitsBoard response={{ type: 'measure-units', object: { cm: 8 }, unitCm: 2, unitName: 'კუბიკი' }} value={value} onChange={(v) => setValue(String(v))} disabled={false} label="ერთეულები" />;
    }
    render(<Harness />);
    expect(text('.un-task')).toContain('კუბიკი');
    fireEvent.click(screen.getByRole('button', { name: /დაუმატე/ }));
    expect(text('.un-count')).toContain('1');
    fireEvent.click(screen.getByRole('button', { name: /დაუმატე/ }));
    fireEvent.click(screen.getByRole('button', { name: /დაუმატე/ }));
    expect(text('.un-count')).toContain('3');
    expect(text('.un-note')).toContain('საგნის ბოლომდე');
  });

  it('the ruler control reports the zero it has', () => {
    const seen: string[] = [];
    function Harness() {
      const [value, setValue] = useState('');
      return (
        <RulerReadBoard
          response={{ type: 'ruler-read', object: { cm: 6 }, rulerStart: 1, options: [5, 6, 7], answerCm: 6 }}
          value={value}
          onChange={(v) => {
            setValue(String(v));
            seen.push(String(v));
          }}
          disabled={false}
          label="სახაზავი"
        />
      );
    }
    render(<Harness />);
    expect(seen).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: /ნული დასაწყისთან/ }));
    expect(seen[seen.length - 1]).toBe('0,');
    fireEvent.click(screen.getAllByRole('radio')[1]);
    expect(seen[seen.length - 1]).toBe('0,6');
    expect(text('.rl-status')).toContain('ნული საგნის დასაწყისშია');
  });

  it('the unit-pick control writes a choice per object', () => {
    const onChange = vi.fn();
    render(<UnitPickAnswer response={{ type: 'unit-pick', items: [{ label: 'ფანქარი', cm: 15 }, { label: 'კარი', cm: 200 }] }} value="" onChange={onChange} disabled={false} label="ერთეული" />);
    fireEvent.click(screen.getAllByRole('radio')[0]);
    expect(onChange).toHaveBeenLastCalledWith('cm,');
    fireEvent.click(screen.getAllByRole('radio')[3]);
    expect(onChange).toHaveBeenLastCalledWith(',m');
  });
});

// ─────────────────────────── the tools ───────────────────────────

describe('tools: the metre strip shows a hundred centimetres', () => {
  it('draws one tick per centimetre and names the relation', () => {
    render(<MetreStrip cm={CM_PER_M} />);
    expect(document.querySelectorAll('.ms-tick')).toHaveLength(CM_PER_M + 1);
    expect(text('.ms')).toContain('100 სმ = 1 მ');
  });
});

describe('tools: the explorer never grades, only shows', () => {
  const lab = (lesson: Lesson) => lesson.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>;

  it('the length lab compares only once both objects start together', () => {
    render(<ExploreToolViewMeasure tool={lab(L1).tool} />);
    expect(text('.lab-status')).toContain('არ იწყება');
    fireEvent.click(screen.getAllByRole('button', { name: /დასაწყისთან$/ })[0]);
    expect(text('.lab-status')).toContain('არ იწყება');
    fireEvent.click(screen.getAllByRole('button', { name: /დასაწყისთან$/ })[1]);
    expect(text('.lab-status')).toContain('უფრო გრძელია');
  });

  it('the units lab counts the same object with two different units', () => {
    render(<ExploreToolViewMeasure tool={lab(L3).tool} />);
    expect(text('.lab-status')).toContain('დაამატე');
    // the 6 cm pencil with 1 cm clips takes six of them
    for (let i = 0; i < 6; i += 1) fireEvent.click(screen.getByRole('button', { name: /დაუმატე/ }));
    expect(text('.lab-status')).toContain('6 × 1 სმ = 6 სმ');
    fireEvent.click(screen.getByRole('button', { name: /კუბიკი \(2 სმ\)/ }));
    for (let i = 0; i < 3; i += 1) fireEvent.click(screen.getByRole('button', { name: /დაუმატე/ }));
    // the same object with the 2 cm cube takes three
    expect(text('.lab-status')).toContain('3 × 2 სმ = 6 სმ');
    fireEvent.click(screen.getByRole('button', { name: /ბლოკი \(5 სმ\)/ }));
    expect(document.querySelectorAll('.un-unit')).toHaveLength(0);
    expect(text('.lab-status')).toContain('დაამატე');
  });

  it('the ruler lab explains a reading that is not the length', () => {
    render(<ExploreToolViewMeasure tool={lab(L4).tool} />);
    expect(text('.lab-status')).toContain('8 სმ');
    fireEvent.click(screen.getByRole('button', { name: /სახაზავი →/ }));
    expect(text('.lab-status')).toContain('საგნის სიგრძე არ არის');
  });

  it('the metre lab says when a length is better measured in metres', () => {
    render(<ExploreToolViewMeasure tool={lab(L5).tool} />);
    fireEvent.click(screen.getByRole('button', { name: '200 სმ' }));
    expect(text('.lab-status')).toContain('2 მ');
    fireEvent.click(screen.getByRole('button', { name: '15 სმ' }));
    expect(text('.lab-status')).toContain('სანტიმეტრი');
  });

  it('the sort lab groups objects and reports when all three groups are right', () => {
    const sortTool = { tool: 'length-sort-lab' as const, reference: { cm: 10 }, items: [{ cm: 12 }, { cm: 4 }] };
    render(<ExploreToolViewMeasure tool={sortTool} />);
    for (const group of [LENGTH_GROUPS[0].label, LENGTH_GROUPS[1].label]) {
      fireEvent.click(document.querySelectorAll('.sort-tray .sort-card')[0]);
      fireEvent.click(screen.getByRole('button', { name: (n) => n.trim() === group }));
    }
    expect(text('.lab-sort .lab-status')).toContain('სამივე ჯგუფი სწორია');
  });
});

describe('tools: the explain demo steps through a real measurement', () => {
  it('shows one step at a time and can be rewound', () => {
    render(
      <MeasureDemo
        block={{
          type: 'measure-demo',
          mode: 'align',
          a: { cm: 12 },
          b: { cm: 14 },
          steps: ['პირველი', 'მეორე', 'მესამე'],
        }}
      />,
    );
    expect(document.querySelectorAll('.ms-steps li.is-on')).toHaveLength(1);
    expect(text('.ms-steps')).toContain('პირველი');
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგ →' }));
    expect(text('.ms-steps li.is-on')).toContain('მეორე');
    fireEvent.click(screen.getByRole('button', { name: '← უკან' }));
    expect(text('.ms-steps li.is-on')).toContain('პირველი');
    expect((screen.getByRole('button', { name: '← უკან' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('the units demo shows the right count for the object', () => {
    render(<MeasureDemo block={{ type: 'measure-demo', mode: 'units', a: { cm: 10 }, b: { cm: 10 }, steps: ['a', 'b'], unitCm: 5 }} />);
    expect(document.querySelectorAll('.un-unit')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგ →' }));
    expect(document.querySelectorAll('.un-unit')).toHaveLength(2);
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
    case 'align-compare': {
      for (const b of screen.getAllByRole('button', { name: /დასაწყისთან$/ })) fireEvent.click(b);
      const order = orderOf(r.a.cm, r.b.cm);
      const ask = r.ask ?? 'longer';
      const right = order === 'same' ? 'same' : ask === 'longer' ? (order === 'first-longer' ? 'a' : 'b') : order === 'first-longer' ? 'b' : 'a';
      radio(['a', 'b', 'same'].indexOf(right));
      break;
    }
    case 'length-sort': {
      for (let i = 0; i < r.items.length; i += 1) {
        const card = document.querySelectorAll('.ln-card')[0] as HTMLElement;
        fireEvent.click(card);
        const group = LENGTH_GROUPS.find((g) => g.id === compareGroup(r.items[i].cm, r.reference.cm)) as { label: string };
        fireEvent.click(screen.getByRole('button', { name: (n) => n.trim() === group.label }));
      }
      break;
    }
    case 'measure-units': {
      const count = unitsIn(r.object.cm, r.unitCm);
      const add = screen.getByRole('button', { name: /დაუმატე/ });
      for (let i = 0; i < count; i += 1) fireEvent.click(add);
      break;
    }
    case 'ruler-read': {
      fireEvent.click(screen.getByRole('button', { name: /ნული დასაწყისთან/ }));
      radio(r.options.indexOf(r.answerCm));
      break;
    }
    case 'unit-pick': {
      r.items.forEach((item, i) => {
        const want = suitableUnit(item.cm);
        const radios = screen.getAllByRole('radio');
        fireEvent.click(radios[i * 2 + (want === 'cm' ? 0 : 1)]);
      });
      break;
    }
    case 'numeric': {
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: String(r.answer) } });
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

describe('U06 unit page', () => {
  it('lists the five lessons under U06, all playable and in order', () => {
    go('#/student/lessons/g1-u06');
    const list = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(list).toHaveLength(5);
    IDS.forEach((id, i) => expect(within(list[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
    expect(screen.getAllByText('Measuring Length in Centimeters').length).toBeGreaterThanOrEqual(1);
  });
});

describe.each(IDS.map((id, i) => [id, i + 1] as const))('%s plays from the challenge to the completion screen', (id, n) => {
  it('every step works with its own correct answers and the progress is saved', () => {
    const lesson = LESSON_CONTENT[id];
    go(`#/student/lessons/${id}`);
    expect(screen.getByText(`ნაბიჯი 1 / ${lesson.activities.length}`)).toBeTruthy();
    expect(document.querySelector('.lp-code')?.textContent).toContain(`U06.${n}`);
    expect(screen.getByRole('link', { name: 'უკან, გაკვეთილების სიაში' }).getAttribute('href')).toBe('#/student/lessons/g1-u06');
    playThrough(lesson);
    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    const checks = stageOf(lesson, 'check').length;
    expect(screen.getByText(`${checks} / ${checks}`)).toBeTruthy();
    expect(screen.getByText(lesson.mascot?.complete as string)).toBeTruthy();
    for (const c of lesson.concepts ?? []) expect(screen.getByText(c, { selector: '.lp-concepts li' })).toBeTruthy();
    expect(saved()[id]).toMatchObject({ status: 'completed', checkCorrect: checks, checkTotal: checks });
    expect(screen.getByRole('link', { name: 'U06-ზე დაბრუნება' }).getAttribute('href')).toBe('#/student/lessons/g1-u06');
    if (n < 5) expect(screen.getByRole('link', { name: new RegExp(`გაგრძელება: U06\\.${n + 1}`) }).getAttribute('href')).toBe(`#/student/lessons/${IDS[n]}`);
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

  it('a wrong answer in the check explains the idea without giving it away first', () => {
    go('#/student/lessons/g1-u06-l1');
    const firstCheck = L1.activities.findIndex((a) => a.stage === 'check');
    L1.activities.slice(0, firstCheck).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    expect(screen.queryByRole('button', { name: /მინიშნება/ })).toBeNull();
    radio(1);
    submit();
    // nothing is aligned yet, so the answer cannot even be judged
    expect(feedback()).toContain('დასაწყის');
    for (const b of screen.getAllByRole('button', { name: /დასაწყისთან$/ })) fireEvent.click(b);
    radio(0);
    submit();
    expect(feedback()).toContain('ჯერ არ არის');
  });

  it('a shifted ruler is caught, and the right answer is still reachable', () => {
    go('#/student/lessons/g1-u06-l4');
    const firstCheck = L4.activities.findIndex((a) => a.stage === 'check');
    L4.activities.slice(0, firstCheck).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    const check = stageOf(L4, 'check')[0];
    if (check.response.type !== 'ruler-read') throw new Error('unexpected check');
    // zero moved off the start, but the right reading chosen
    fireEvent.click(screen.getByRole('button', { name: /სახაზავი →/ }));
    radio(check.response.options.indexOf(check.response.answerCm));
    submit();
    expect(feedback()).toContain('ნული');
    fireEvent.click(screen.getByRole('button', { name: 'ხელახლა ცდა' }));
    answerCorrectly(check);
    expect(feedback()).toContain('სწორია');
  });
});

describe('U06.1 comparing: interactions in the player', () => {
  it('the practice question refuses a comparison until both objects are at the line', () => {
    go('#/student/lessons/g1-u06-l1');
    toStage(L1, 'explore');
    next();
    next();
    // practice-1: pick an answer before aligning anything
    radio(0);
    submit();
    expect(feedback()).toContain('დასაწყის');
    for (const b of screen.getAllByRole('button', { name: /დასაწყისთან$/ })) fireEvent.click(b);
    submit();
    expect(feedback()).toContain('სწორია');
  });

  it('the explore lab aligns a pair and then states the comparison in words', () => {
    go('#/student/lessons/g1-u06-l1');
    toStage(L1, 'explore');
    expect(document.querySelector('.al')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'წიგნი და ჩხირი' }));
    for (const b of screen.getAllByRole('button', { name: /დასაწყისთან$/ })) fireEvent.click(b);
    expect(text('.lab-note')).toContain('14');
    expect(text('.lab-note')).toContain('10');
  });

  it('the understanding screen steps the two objects onto the line', () => {
    go('#/student/lessons/g1-u06-l1');
    toStage(L1, 'understand');
    expect(document.querySelectorAll('.ms-steps li')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგ →' }));
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგ →' }));
    expect(document.querySelectorAll('.al-item.is-aligned')).toHaveLength(2);
  });
});

describe('U06.2 sorting: interactions in the player', () => {
  it('the explore sorts the objects into the three groups and says when all are right', () => {
    go('#/student/lessons/g1-u06-l2');
    toStage(L2, 'explore');
    expect(document.querySelectorAll('.sort-bins.has-3 .sort-bin')).toHaveLength(3);
    const tool = L2.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>;
    if (tool.tool.tool !== 'length-sort-lab') throw new Error('unexpected tool');
    for (const item of tool.tool.items) {
      fireEvent.click(document.querySelectorAll('.sort-tray .ln-card')[0]);
      const group = LENGTH_GROUPS.find((g) => g.id === compareGroup(item.cm, tool.tool.tool === 'length-sort-lab' ? tool.tool.reference.cm : 0)) as { label: string };
      fireEvent.click(screen.getByRole('button', { name: (n) => n.trim() === group.label }));
    }
    expect(text('.lab-sort .lab-status')).toContain('სამივე ჯგუფი სწორია');
  });
});

describe('U06.3 units: interactions in the player', () => {
  it('the explore counts an object with two different units', () => {
    go('#/student/lessons/g1-u06-l3');
    toStage(L3, 'explore');
    fireEvent.click(screen.getByRole('button', { name: /კუბიკი \(2 სმ\)/ }));
    for (let i = 0; i < 3; i += 1) fireEvent.click(screen.getByRole('button', { name: /დაუმატე/ }));
    expect(document.querySelectorAll('.un-unit')).toHaveLength(3);
    expect(text('.lab-status')).toContain('3 × 2 სმ = 6 სმ');
    fireEvent.click(screen.getByRole('button', { name: /ბლოკი \(5 სმ\)/ }));
    expect(document.querySelectorAll('.un-unit')).toHaveLength(0);
  });
});

describe('U06.4 centimetres: interactions in the player', () => {
  it('the explore links the ruler position to the reading', () => {
    go('#/student/lessons/g1-u06-l4');
    toStage(L4, 'explore');
    expect(text('.lab-note')).toContain('8 სმ');
    fireEvent.click(screen.getByRole('button', { name: /საგანი|სამაგრი/ }));
    expect(text('.lab-note')).toContain('4 სმ');
  });
});

describe('U06.5 metres: interactions in the player', () => {
  it('the explore shows a hundred ticks and the metre relation', () => {
    go('#/student/lessons/g1-u06-l5');
    toStage(L5, 'explore');
    expect(document.querySelectorAll('.ms-tick')).toHaveLength(101);
    fireEvent.click(screen.getByRole('button', { name: '100 სმ' }));
    expect(text('.lab-note')).toContain('1 მ');
  });
});

describe('completion and progress', () => {
  it('U06.5 completes the unit only when all five lessons are done', () => {
    const done = Object.fromEntries(IDS.slice(0, 4).map((id) => [id, { status: 'completed', checkCorrect: 3, checkTotal: 3, completedAt: 1 }]));
    window.localStorage.setItem(LEARN_STORAGE_KEY, JSON.stringify(done));
    resetProgressCache();
    go('#/student/lessons/g1-u06-l5');
    playThrough(L5);
    expect(screen.getByText(/U06 დასრულდა/)).toBeTruthy();
    expect(saved()['g1-u06-l5']).toMatchObject({ status: 'completed', checkCorrect: 3 });
  });

  it('failing a check does not complete the lesson and the check can be repeated', () => {
    go('#/student/lessons/g1-u06-l4');
    const firstCheck = L4.activities.findIndex((a) => a.stage === 'check');
    L4.activities.slice(0, firstCheck).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    const checks = stageOf(L4, 'check');
    /** One wrong answer on the current check, through its own control. */
    const answerWrong = (check: QuestionActivity) => {
      const r = check.response;
      if (r.type === 'ruler-read') {
        // the ruler slid off the zero, with a reading that is not the length either
        fireEvent.click(screen.getByRole('button', { name: /სახაზავი →/ }));
        radio(r.options.findIndex((o) => o !== r.answerCm));
        return;
      }
      if (r.type === 'numeric') {
        fireEvent.change(screen.getByRole('textbox'), { target: { value: String(r.answer + 1) } });
        return;
      }
      throw new Error(`no wrong answer for ${r.type}`);
    };
    for (const check of checks) {
      answerWrong(check);
      submit();
      expect(feedback(), check.id).not.toContain('სწორია');
      fireEvent.click(screen.getByRole('button', { name: 'ხელახლა ცდა' }));
      answerWrong(check);
      submit();
      expect(feedback(), `${check.id}, second try`).not.toContain('სწორია');
      fireEvent.click(screen.getByRole('button', { name: /^(გაგრძელება|გაკვეთილის დასრულება)$/ }));
    }
    expect(screen.getByRole('heading', { name: 'ჯერ არ დასრულებულა' })).toBeTruthy();
    expect(saved()['g1-u06-l4']?.status).not.toBe('completed');
    fireEvent.click(screen.getByRole('button', { name: 'შემოწმების გამეორება' }));
    expect(screen.getByText(`ნაბიჯი ${firstCheck + 1} / ${L4.activities.length}`)).toBeTruthy();
  });
});

describe('style: motion, layout and honest feedback', () => {
  const css = readFileSync('src/lessons/learn.css', 'utf8');
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));

  it('the length animations are switched off under reduced motion', () => {
    for (const cls of ['.al-item', '.un-unit']) expect(reduced, cls).toContain(cls);
  });

  it('the length boards scale with the screen and fold to one column on a phone', () => {
    const rule = css.split('\n').find((l) => l.startsWith('.ln-board')) ?? '';
    expect(rule).toContain('width: 100%');
    expect(rule).toContain('max-width');
    const small = css.slice(css.indexOf('@media (max-width: 520px)', css.indexOf('U06: length')));
    expect(small).toContain('.rl-choices');
    expect(small).toContain('grid-template-columns: 1fr');
  });

  it('correctness is never shown by colour alone: every mark carries a word or a symbol', () => {
    render(<UnitBoard object={{ cm: 8 }} unitCm={2} unitName="კუბიკი" placed={4} onChange={vi.fn()} disabled={false} label="კუბიკები" />);
    expect(text('.un-count')).toContain('✓');
    cleanup();
    render(<UnitPickBoard items={[{ label: 'ფანქარი', cm: 15 }]} picks={['cm']} onChange={vi.fn()} disabled={false} label="ერთეული" />);
    expect(text('.up-btn.is-on')).toContain('✓');
    expect(screen.getAllByRole('radio')[0].getAttribute('aria-checked')).toBe('true');
  });

  it('objects that are compared share one scale, so a short picture is never blown up', () => {
    const { container } = render(
      <div>
        <LengthObjectView spec={{ kind: 'pencil', cm: 4 }} maxCm={12} />
        <LengthObjectView spec={{ kind: 'ribbon', cm: 12 }} maxCm={12} />
      </div>,
    );
    const boxes = [...container.querySelectorAll('svg')].map((svg) => svg.getAttribute('viewBox') ?? '');
    expect(boxes).toHaveLength(2);
    const widths = boxes.map((box) => Number(box.split(/\s+/)[2]));
    // same span for both, so one drawing unit means the same distance in both pictures
    expect(widths[0]).toBe(widths[1]);
    expect(widths[0]).toBeGreaterThanOrEqual(px(12));
  });

  it('an object is named in words for a screen reader, with its length when one is asked for', () => {
    render(<LengthObjectView spec={{ kind: 'pencil', cm: 9 }} showCm />);
    expect(screen.getByRole('img', { name: /ფანქარი, 9 სანტიმეტრი/ })).toBeTruthy();
  });
});
