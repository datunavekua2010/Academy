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
import {
  DEG_PER_HOUR,
  DEG_PER_MINUTE,
  addMinutes,
  allPairsMatch,
  angleAt,
  digitalPad,
  digitalText,
  fivesTo,
  hourAngle,
  hourFromAngle,
  hourHandBetween,
  isFiveMinute,
  isHalfPast,
  isOClock,
  minuteAngle,
  minuteFromAngle,
  minuteHandNumber,
  minutesBetween,
  normalHour,
  normalMinute,
  pairsTime,
  parseDigital,
  pointAt,
  sameTime,
  snapMinute,
  spokenTime,
  ticksPerFace,
  timeOf,
  parseDigital as parse,
} from '../src/lessons/exercises/ClockGeometry';
import { ClockFace, MatchBoard, SetClockBoard, FiveMinuteRing, DigitalDisplay } from '../src/lessons/exercises/ClockBoard';
import {
  FLAT_KINDS,
  FLAT_NAME,
  everydayOf,
  hasEqualSides,
  outlineOf,
  shapeGroup,
  sideLengths,
  sidesOf,
  verticesOf,
} from '../src/lessons/exercises/Shape2DGeometry';
import { Shape2D, ShapeSortBoard, TapShapeBoard, RoomBoard, groupsFor, groupIdOf } from '../src/lessons/exercises/Shape2DBoard';
import { ExploreToolViewClock, ExploreToolViewShapes2D, ClockDemo, Shape2DDemo } from '../src/lessons/exercises/TimeShapeTools';
import type { Activity, Lesson, QuestionActivity, ResponseSpec } from '../src/lessons/types';

/**
 * Grade 1 · Units 7 and 8: "Reading Analog & Digital Clocks" and "2D Shapes, Sides, & Vertices".
 *
 * Everything is checked against the numbers: hand angles come from the time, and sides and corners come from the
 * outline. Touch and dragging have not been tried on a device (there is no browser here); the tests use taps,
 * key presses and the boards' own buttons.
 */

const U07 = ['g1-u07-l1', 'g1-u07-l2', 'g1-u07-l3', 'g1-u07-l4', 'g1-u07-l5'];
const U08 = ['g1-u08-l1', 'g1-u08-l2', 'g1-u08-l3', 'g1-u08-l4', 'g1-u08-l5'];
const lessons07: Lesson[] = U07.map((id) => LESSON_CONTENT[id]);
const lessons08: Lesson[] = U08.map((id) => LESSON_CONTENT[id]);
const all = [...lessons07, ...lessons08];
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);

/** Every time an activity mentions, wherever it hides. */
function timesOf(a: Activity): Array<{ h: number; m: number }> {
  const out: Array<{ h: number; m: number }> = [];
  const push = (t?: { h: number; m: number }) => {
    if (t) out.push(t);
  };
  if (a.kind === 'question') {
    const r = a.response;
    if (r.type === 'set-clock') push(r.ask);
    if (r.type === 'read-clock') {
      push(r.time);
      r.options.forEach(push);
    }
    if (r.type === 'match-time') [...r.faces].forEach(push);
    if (a.visual?.type === 'clock') push(a.visual.time);
  }
  if (a.kind === 'explore') {
    const t = a.tool;
    if (t.tool === 'clock-lab') t.times.forEach(push);
    if (t.tool === 'time-set-lab') t.times.forEach(push);
    if (t.tool === 'time-match-lab') t.pairs.forEach((p) => push(p.time));
    if (t.tool === 'five-minute-lab') push(t.start);
  }
  if (a.kind === 'explain')
    for (const b of a.blocks) {
      if (b.type === 'clock-demo') {
        push(b.time);
        b.times?.forEach(push);
      }
      if (b.type === 'clock') push(b.time);
    }
  return out;
}

/** Every shape an activity mentions. */
function shapesOf(a: Activity): Array<{ kind: string; size?: number; rotate?: number }> {
  if (a.kind === 'question') {
    const r = a.response;
    if (r.type === 'shape-sort') return r.shapes;
    if (r.type === 'tap-parts') return [r.shape];
    if (r.type === 'find-shapes') return r.items.map((i) => i.spec);
    if (a.visual?.type === 'flat') return a.visual.shapes;
    return [];
  }
  if (a.kind === 'explore') {
    const t = a.tool;
    if (t.tool === 'flat-lab') return t.shapes;
    if (t.tool === 'room-lab') return t.items.map((i) => i.spec);
  }
  if (a.kind === 'explain')
    return a.blocks.flatMap((b) => {
      if (b.type === 'flat') return b.shapes;
      if (b.type === 'shape2d-demo') return [b.spec, ...(b.contrast ? [b.contrast] : [])];
      return [];
    });
  return [];
}

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 1 U07 is the clocks unit', () => {
  it('has the five approved titles and ids', () => {
    const unit = getUnit('g1-u07');
    expect(unit?.title).toBe('Reading Analog & Digital Clocks (Hours, Half-Hours, Minutes)');
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Understanding Clock Faces and Clock Hands',
      "Reading O'Clock Times",
      'Reading Half-Past Times',
      'Matching Analog and Digital Times',
      'Understanding Minutes and Reading Times to Five-Minute Intervals',
    ]);
    expect(unit?.lessons.map((l) => l.id)).toEqual(U07);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U07.1', 'U07.2', 'U07.3', 'U07.4', 'U07.5']);
  });
});

describe('catalog: Grade 1 U08 is the 2D shapes unit', () => {
  it('has the five approved titles and ids', () => {
    const unit = getUnit('g1-u08');
    expect(unit?.title).toBe('2D Shapes, Sides, & Vertices');
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Recognizing Circles, Triangles, Squares, and Rectangles',
      'Counting Sides of 2D Shapes',
      'Understanding Vertices and Counting Corners',
      'Comparing and Sorting 2D Shapes',
      'Recognizing Shapes in Everyday Objects',
    ]);
    expect(unit?.lessons.map((l) => l.id)).toEqual(U08);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U08.1', 'U08.2', 'U08.3', 'U08.4', 'U08.5']);
  });
});

describe('content: both units are complete', () => {
  it('every lesson has an objective, a completion rule and at least five questions', () => {
    for (const l of all) {
      expect(l, 'missing lesson').toBeTruthy();
      expect(l.objective.length).toBeGreaterThan(10);
      expect(l.completion.minCheckCorrect).toBeGreaterThan(0);
      expect(questions(l).length).toBeGreaterThanOrEqual(5);
    }
  });
});

// ─────────────────────────── clock geometry ───────────────────────────

describe('clock geometry: every hand position comes from the time', () => {
  it('one full turn is 360°, so 6° a minute and 30° an hour', () => {
    expect(DEG_PER_MINUTE).toBe(6);
    expect(DEG_PER_HOUR).toBe(30);
    expect(minuteAngle(0)).toBe(0);
    expect(minuteAngle(15)).toBe(90);
    expect(minuteAngle(30)).toBe(180);
    expect(minuteAngle(45)).toBe(270);
  });

  it('the hour hand creeps with the minutes instead of jumping', () => {
    expect(hourAngle({ h: 3, m: 0 })).toBe(90);
    expect(hourAngle({ h: 3, m: 30 })).toBe(105);
    expect(hourAngle({ h: 3, m: 15 })).toBeCloseTo(97.5, 6);
    expect(hourHandBetween({ h: 3, m: 30 })).toBe(3.5);
    expect(hourHandBetween({ h: 3, m: 0 })).toBe(3);
  });

  it('hours and minutes fold onto the face', () => {
    expect(normalHour(13)).toBe(1);
    expect(normalHour(0)).toBe(12);
    expect(normalMinute(75)).toBe(15);
    expect(normalMinute(-5)).toBe(55);
    expect(timeOf(15, 70)).toEqual({ h: 3, m: 10 });
  });

  it('o\'clock means minute zero, half past means thirty', () => {
    expect(isOClock({ h: 5, m: 0 })).toBe(true);
    expect(isOClock({ h: 5, m: 30 })).toBe(false);
    expect(isHalfPast({ h: 5, m: 30 })).toBe(true);
    expect(isHalfPast({ h: 5, m: 0 })).toBe(false);
    expect(isFiveMinute({ h: 5, m: 25 })).toBe(true);
    expect(isFiveMinute({ h: 5, m: 27 })).toBe(false);
  });

  it('the minute hand points at the right number, and the fives add up', () => {
    expect(minuteHandNumber({ h: 1, m: 0 })).toBe(12);
    expect(minuteHandNumber({ h: 1, m: 30 })).toBe(6);
    expect(minuteHandNumber({ h: 1, m: 20 })).toBe(4);
    expect(fivesTo(20)).toEqual([5, 10, 15, 20]);
    expect(fivesTo(0)).toEqual([]);
    expect(fivesTo(25)).toHaveLength(5);
  });

  it('a full face has sixty minute ticks and twelve hour ticks', () => {
    const ticks = ticksPerFace();
    expect(ticks).toHaveLength(60);
    expect(ticks.filter((t) => t.hour)).toHaveLength(12);
  });
});

describe('clock geometry: adding and comparing times', () => {
  it('minutes carry into the next hour, and the hour wraps at twelve', () => {
    expect(addMinutes({ h: 12, m: 45 }, 20)).toEqual({ h: 1, m: 5 });
    expect(addMinutes({ h: 1, m: 5 }, -10)).toEqual({ h: 12, m: 55 });
    expect(addMinutes({ h: 9, m: 30 }, 30)).toEqual({ h: 10, m: 0 });
  });

  it('the distance to the next time is measured forward', () => {
    expect(minutesBetween({ h: 3, m: 50 }, { h: 4, m: 10 })).toBe(20);
    expect(minutesBetween({ h: 4, m: 0 }, { h: 4, m: 0 })).toBe(0);
  });

  it('the five-minute step snaps to a mark', () => {
    expect(snapMinute(27, 5)).toBe(25);
    expect(snapMinute(28, 5)).toBe(30);
    expect(snapMinute(60, 5)).toBe(0);
  });

  it('a dragged angle gives back the hour or the minute it points at', () => {
    expect(minuteFromAngle(180, 5)).toBe(30);
    expect(minuteFromAngle(90, 5)).toBe(15);
    expect(hourFromAngle(90, 0)).toBe(3);
    expect(hourFromAngle(105, 30)).toBe(3);
    expect(angleAt(pointAt(120, 50).x, pointAt(120, 50).y)).toBeCloseTo(120, 6);
  });
});

describe('clock geometry: writing a time', () => {
  it('digits, padded digits and words all name the same moment', () => {
    expect(digitalText({ h: 3, m: 0 })).toBe('3:00');
    expect(digitalText({ h: 3, m: 5 })).toBe('3:05');
    expect(digitalPad({ h: 3, m: 30 })).toBe('03:30');
    expect(spokenTime({ h: 3, m: 0 })).toBe('3 საათი');
    expect(spokenTime({ h: 3, m: 30 })).toBe('3 საათი და ნახევარი');
    expect(spokenTime({ h: 3, m: 20 })).toBe('3 საათი და 20 წუთი');
  });

  it('a display is read back only when it is a real clock time', () => {
    expect(parseDigital('3:30')).toEqual({ h: 3, m: 30 });
    expect(parseDigital('03:05')).toEqual({ h: 3, m: 5 });
    expect(parseDigital('13:30')).toBeNull();
    expect(parseDigital('3:75')).toBeNull();
    expect(parseDigital('hello')).toBeNull();
    expect(parse('12:00')).toEqual({ h: 12, m: 0 });
  });

  it('pairs are matched by their times, never by their positions', () => {
    const pairs = [
      { analog: { h: 3, m: 0 }, digital: '3:00' },
      { analog: { h: 4, m: 30 }, digital: '4:30' },
    ];
    expect(pairsTime(pairs, 0, 0)).toBe(true);
    expect(pairsTime(pairs, 0, 1)).toBe(false);
    expect(allPairsMatch(pairs, [0, 1])).toBe(true);
    expect(allPairsMatch(pairs, [1, 1])).toBe(false);
  });
});

// ─────────────────────────── shape geometry ───────────────────────────

describe('shape geometry: sides and corners are counted from the outline', () => {
  it('a triangle has 3, a square and a rectangle have 4, a circle has 0', () => {
    expect(sidesOf({ kind: 'triangle' })).toBe(3);
    expect(sidesOf({ kind: 'square' })).toBe(4);
    expect(sidesOf({ kind: 'rectangle' })).toBe(4);
    expect(sidesOf({ kind: 'circle' })).toBe(0);
    expect(outlineOf({ kind: 'circle' })).toBeNull();
  });

  it('a shape has as many corners as sides', () => {
    for (const kind of FLAT_KINDS) expect(verticesOf({ kind })).toBe(sidesOf({ kind }));
  });

  it('a square has four equal sides, a rectangle does not', () => {
    expect(hasEqualSides({ kind: 'square' })).toBe(true);
    expect(hasEqualSides({ kind: 'triangle' })).toBe(true);
    expect(hasEqualSides({ kind: 'rectangle' })).toBe(false);
    const lengths = sideLengths({ kind: 'rectangle', size: 60 });
    expect(Math.max(...lengths)).toBeGreaterThan(Math.min(...lengths));
    expect(sideLengths({ kind: 'circle' })).toEqual([]);
  });

  it('size and rotation never change the kind or the counts', () => {
    expect(sidesOf({ kind: 'square', size: 40, rotate: 37 })).toBe(4);
    expect(shapeGroup({ kind: 'square', size: 30, rotate: 45 })).toBe('square');
    expect(shapeGroup({ kind: 'rectangle', size: 90, rotate: 20 })).toBe('rectangle');
    expect(shapeGroup({ kind: 'triangle', size: 50, rotate: 12 })).toBe('triangle');
    expect(shapeGroup({ kind: 'circle', radius: 12 })).toBe('circle');
  });

  it('everyday objects resemble the shape their outline gives', () => {
    expect(everydayOf('circle').length).toBeGreaterThan(0);
    expect(everydayOf('rectangle').length).toBeGreaterThan(0);
    expect(FLAT_NAME.square).toBe('კვადრატი');
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

describe('checking: which hand shows what', () => {
  const question = q({ type: 'hand-pick', hourHand: 'short', minuteHand: 'long' });
  it('accepts only short-for-hours and long-for-minutes', () => {
    expect(evaluateAnswer(question, 'short,long')).toEqual({ verdict: 'correct' });
    expect(evaluateAnswer(question, 'long,short').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, 'short,').verdict).toBe('incomplete');
  });
});

describe('checking: setting a clock', () => {
  const question = q({ type: 'set-clock', ask: { h: 5, m: 0 }, step: 5 });

  it('accepts exactly the asked time, at half past too', () => {
    expect(evaluateAnswer(question, '5,0')).toEqual({ verdict: 'correct' });
    expect(evaluateAnswer(question, '5,30').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
    const half = q({ type: 'set-clock', ask: { h: 5, m: 30 }, step: 5 });
    expect(evaluateAnswer(half, '5,30')).toEqual({ verdict: 'correct' });
  });

  it('explains a right hour with a wrong minute hand, and the other way round', () => {
    const withHints = q(
      { type: 'set-clock', ask: { h: 6, m: 30 }, step: 5 },
      {
        misconceptions: [
          { id: 'minute', answers: ['minute'], feedback: 'საათი სწორია, წუთის ისარი 6-ზე უნდა იყოს.' },
          { id: 'hour', answers: ['hour'], feedback: 'წუთები სწორია, საათის ისარი სხვა ციფრზე უნდა იყოს.' },
        ],
      },
    );
    expect(evaluateAnswer(withHints, '6,0').misconceptionId).toBe('minute');
    expect(evaluateAnswer(withHints, '9,30').misconceptionId).toBe('hour');
  });
});

describe('checking: reading a clock', () => {
  const question = q({ type: 'read-clock', time: { h: 3, m: 30 }, options: [{ h: 3, m: 30 }, { h: 3, m: 0 }, { h: 6, m: 30 }] });
  it('accepts only the time the face shows', () => {
    expect(evaluateAnswer(question, '3,30')).toEqual({ verdict: 'correct' });
    expect(evaluateAnswer(question, '3,0').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, '6,30').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
  });

  it('a misconception is matched by the chosen time, in words too', () => {
    const withHint = q(
      { type: 'read-clock', time: { h: 3, m: 30 }, options: [{ h: 3, m: 30 }, { h: 3, m: 0 }] },
      { misconceptions: [{ id: 'oclock', answers: ['3,0'], feedback: 'წუთის ისარი 6-ზეა, ანუ ნახევარი.' }] },
    );
    expect(evaluateAnswer(withHint, '3,0').misconceptionId).toBe('oclock');
  });
});

describe('checking: matching analog and digital', () => {
  const question = q({
    type: 'match-time',
    faces: [
      { h: 7, m: 0 },
      { h: 2, m: 30 },
    ],
    displays: ['2:30', '7:00'],
  });

  it('needs a display for every face', () => {
    expect(evaluateAnswer(question, '1,').verdict).toBe('incomplete');
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
  });

  it('accepts the matching displays and rejects a mismatch', () => {
    expect(evaluateAnswer(question, '1,0')).toEqual({ verdict: 'correct' });
    expect(evaluateAnswer(question, '0,1').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, '0,0').verdict).toBe('incorrect');
    // an index outside the display list is not an answer
    expect(evaluateAnswer(question, '5,0').verdict).toBe('incomplete');
  });
});

describe('checking: sorting shapes', () => {
  const question = q({
    type: 'shape-sort',
    groupBy: 'sides',
    shapes: [{ kind: 'circle' }, { kind: 'triangle' }, { kind: 'square', rotate: 20 }, { kind: 'rectangle' }],
  });

  it('groups by the sides the outline really has', () => {
    expect(evaluateAnswer(question, '0,3,4,4')).toEqual({ verdict: 'correct' });
    expect(evaluateAnswer(question, '0,4,4,4').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, '0,3,4').verdict).toBe('incomplete');
  });

  it('groups by kind, where a turned square is still a square', () => {
    const byKind = q({ type: 'shape-sort', groupBy: 'kind', shapes: [{ kind: 'square', rotate: 30 }, { kind: 'rectangle' }, { kind: 'circle' }] });
    expect(evaluateAnswer(byKind, 'square,rectangle,circle')).toEqual({ verdict: 'correct' });
  });
});

describe('checking: tapping sides and corners', () => {
  it('wants every side tapped exactly once', () => {
    const sides = q({ type: 'tap-parts', shape: { kind: 'triangle' }, tap: 'sides' });
    expect(evaluateAnswer(sides, '1,2,3')).toEqual({ verdict: 'correct' });
    expect(evaluateAnswer(sides, '1,2').verdict).toBe('incomplete');
    expect(evaluateAnswer(sides, '1,1,2').verdict).toBe('incorrect');
  });

  it('wants every corner tapped, on a turned shape too', () => {
    const corners = q({ type: 'tap-parts', shape: { kind: 'square', rotate: 25 }, tap: 'corners' });
    expect(evaluateAnswer(corners, '1,2,3,4')).toEqual({ verdict: 'correct' });
    expect(evaluateAnswer(corners, '1,2,3').verdict).toBe('incomplete');
  });

  it('a circle has nothing to count, and says so in the lesson\'s own words', () => {
    const circle = q({ type: 'tap-parts', shape: { kind: 'circle', radius: 40 }, tap: 'sides' }, { fallbackFeedback: 'წრეს სწორი გვერდი არ აქვს — დასათვლელი არაფერია.' });
    const result = evaluateAnswer(circle, '');
    expect(result.verdict).toBe('incorrect');
    expect(result.feedback).toContain('სწორი გვერდი არ აქვს');
    // a tap on a circle is wrong, whichever part was tapped
    expect(evaluateAnswer(circle, '1').verdict).toBe('incorrect');
  });
});

describe('checking: finding shapes in objects', () => {
  const question = q({
    type: 'find-shapes',
    kind: 'circle',
    items: [
      { id: 'clock', label: 'საათი', spec: { kind: 'circle', radius: 40 } },
      { id: 'book', label: 'წიგნი', spec: { kind: 'rectangle', size: 60 } },
      { id: 'coin', label: 'მონეტა', spec: { kind: 'circle', radius: 30 } },
    ],
  });

  it('accepts exactly the objects whose outline is that shape', () => {
    expect(evaluateAnswer(question, 'clock,coin')).toEqual({ verdict: 'correct' });
    expect(evaluateAnswer(question, 'coin,clock')).toEqual({ verdict: 'correct' });
    expect(evaluateAnswer(question, 'clock').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, 'clock,coin,book').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
  });
});

describe('checking: answers are described with units and words', () => {
  it('a time is never a bare pair of numbers', () => {
    expect(describeAnswer({ type: 'set-clock', ask: { h: 4, m: 30 }, step: 5 })).toBe('4 საათი და ნახევარი (4:30)');
    expect(describeAnswer({ type: 'read-clock', time: { h: 7, m: 0 }, options: [{ h: 7, m: 0 }] })).toContain('7 საათი');
    expect(describeAnswer({ type: 'tap-parts', shape: { kind: 'square' }, tap: 'sides' })).toContain('4');
    expect(describeAnswer({ type: 'hand-pick', hourHand: 'short', minuteHand: 'long' })).toContain('მოკლე');
  });
});

// ─────────────────────────── content arithmetic ───────────────────────────

describe('content: every time in the ten lessons is a time the unit teaches', () => {
  it('reads, targets and options all use o\'clock, half past or a five-minute mark', () => {
    for (const l of all)
      for (const a of l.activities)
        for (const t of timesOf(a)) {
          expect(Number.isInteger(t.h), `${l.id}/${a.id}`).toBe(true);
          expect(t.h).toBeGreaterThanOrEqual(1);
          expect(t.h).toBeLessThanOrEqual(12);
          expect(t.m).toBeGreaterThanOrEqual(0);
          expect(t.m).toBeLessThan(60);
          expect(isFiveMinute(t), `${l.id}/${a.id} ${t.h}:${t.m}`).toBe(true);
        }
  });

  it('every reading question offers its own answer among the options', () => {
    for (const l of all)
      for (const x of questions(l)) {
        if (x.response.type !== 'read-clock') continue;
        expect(x.response.options.some((o) => sameTime(o, x.response.time))).toBe(true);
        const keys = new Set(x.response.options.map((o) => `${o.h}:${o.m}`));
        expect(keys.size).toBe(x.response.options.length);
      }
  });

  it('the matching questions contain the same times on both sides', () => {
    for (const l of all)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'match-time') continue;
        const displays = r.displays.map((d) => parseDigital(d));
        expect(displays.every((d) => d !== null)).toBe(true);
        const asKeys = displays.map((d) => (d ? `${d.h}:${d.m}` : ''));
        const faces = r.faces.map((t) => `${t.h}:${t.m}`).sort();
        expect([...asKeys].sort()).toEqual(faces);
      }
  });

  it('half-past questions really are half past, and o\'clock questions really are o\'clock', () => {
    const l3 = lessons07[2];
    for (const x of questions(l3)) {
      const r = x.response;
      if (r.type === 'read-clock') expect(isHalfPast(r.time), x.id).toBe(true);
      if (r.type === 'set-clock') expect(isHalfPast(r.ask), x.id).toBe(true);
    }
    const l2 = lessons07[1];
    for (const x of questions(l2)) {
      const r = x.response;
      if (r.type === 'read-clock') expect(isOClock(r.time), x.id).toBe(true);
      if (r.type === 'set-clock') expect(isOClock(r.ask), x.id).toBe(true);
    }
  });

  it('the five-minute lesson uses only five-minute times, never o\'clock-only positions', () => {
    const l5 = lessons07[4];
    const read = questions(l5).filter((x) => x.response.type === 'read-clock' || x.response.type === 'set-clock');
    expect(read.length).toBeGreaterThanOrEqual(2);
    for (const x of read) {
      const t = x.response.type === 'read-clock' ? x.response.time : x.response.type === 'set-clock' ? x.response.ask : null;
      expect(t && isFiveMinute(t), x.id).toBe(true);
    }
  });
});

describe('content: shapes are what their outlines say', () => {
  it('no lesson draws a square as a rectangle or a circle with corners', () => {
    for (const l of all)
      for (const a of l.activities)
        for (const s of shapesOf(a)) {
          const spec = s as never;
          if (s.kind === 'circle') expect(sidesOf(spec)).toBe(0);
          if (s.kind === 'square') expect(hasEqualSides(spec)).toBe(true);
          if (s.kind === 'rectangle') expect(hasEqualSides(spec)).toBe(false);
          expect(sidesOf(spec)).toBeGreaterThanOrEqual(0);
        }
  });

  it('sorting questions only use groups their shapes can fill', () => {
    for (const l of all)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'shape-sort') continue;
        const allowed = new Set(groupsFor(r.groupBy).map((g) => g.id));
        for (const s of r.shapes) expect(allowed.has(groupIdOf(s, r.groupBy)), x.id).toBe(true);
      }
  });

  it('the everyday-object questions never ask for a shape nothing has', () => {
    for (const l of all)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'find-shapes') continue;
        expect(r.items.filter((item) => shapeGroup(item.spec) === r.kind).length).toBeGreaterThan(0);
        expect(r.items.some((item) => shapeGroup(item.spec) !== r.kind)).toBe(true);
      }
  });
});

// ─────────────────────────── the boards ───────────────────────────

const text = (selector: string) => document.querySelector(selector)?.textContent ?? '';

describe('clock board: the face is drawn from the time', () => {
  it('an o\'clock face has its minute hand straight up and its hour hand on the number', () => {
    render(<ClockFace time={{ h: 3, m: 0 }} label="სამი საათი" />);
    const hands = [...document.querySelectorAll('.ck-hand-line')];
    expect(hands).toHaveLength(2);
    // the hands are drawn from the centre (70, 70); the minute hand's tip is straight above it
    const minute = hands[1].getAttribute('x2');
    expect(Number(minute)).toBeCloseTo(70, 1);
    expect(screen.getByRole('group', { name: 'სამი საათი' })).toBeTruthy();
    expect(document.querySelectorAll('.ck-num')).toHaveLength(12);
    expect(text('.ck-num')).toBe('1');
  });

  it('at half past the hour hand stands between two numbers, not on one', () => {
    render(<ClockFace time={{ h: 3, m: 30 }} label="სამი და ნახევარი" />);
    const hour = document.querySelector('.ck-hand.is-hour .ck-hand-line') as SVGLineElement;
    const tip = { x: Number(hour.getAttribute('x2')), y: Number(hour.getAttribute('y2')) };
    // 3:30 puts the hour hand halfway between 3 and 4: 90° + 15° of creep
    expect(angleAt(tip.x, tip.y, 70, 70)).toBeCloseTo(hourAngle({ h: 3, m: 30 }), 0);
    expect(angleAt(tip.x, tip.y, 70, 70)).toBeGreaterThan(100);
  });

  it('a clock with no hands shows the face only', () => {
    render(<ClockFace time={{ h: 6, m: 0 }} showHands={false} label="ციფერბლატი" />);
    expect(document.querySelectorAll('.ck-hand-line')).toHaveLength(0);
    expect(document.querySelectorAll('.ck-num')).toHaveLength(12);
  });

  it('the readout names the time in words and digits', () => {
    render(<DigitalDisplay time={{ h: 4, m: 30 }} />);
    expect(text('.dg')).toBe('04:30');
    expect(screen.getByRole('img', { name: /4:30/ })).toBeTruthy();
  });
});

describe('clock board: setting the hands', () => {
  it('the buttons move the minute hand by its step and read the new time', () => {
    function Harness() {
      const [time, setTime] = useState({ h: 3, m: 0 });
      return <SetClockBoard time={time} onChange={setTime} step={5} label="საათი" />;
    }
    render(<Harness />);
    expect(text('.ck-readout-digital')).toBe('3:00');
    fireEvent.click(screen.getByRole('button', { name: '5 წუთი წინ' }));
    expect(text('.ck-readout-digital')).toBe('3:05');
    fireEvent.click(screen.getByRole('button', { name: '5 წუთი უკან' }));
    expect(text('.ck-readout-digital')).toBe('3:00');
    fireEvent.click(screen.getByRole('button', { name: /საათი \+1/ }));
    expect(text('.ck-readout-digital')).toBe('4:00');
    fireEvent.click(screen.getByRole('button', { name: /12:00/ }));
    expect(text('.ck-readout-digital')).toBe('12:00');
  });

  it('a keyboard user can turn the minute hand and the hour hand', () => {
    function Harness() {
      const [time, setTime] = useState({ h: 3, m: 0 });
      return <SetClockBoard time={time} onChange={setTime} step={5} label="საათი" />;
    }
    render(<Harness />);
    const minute = document.querySelector('.ck-hand.is-minute') as SVGGElement;
    fireEvent.keyDown(minute, { key: 'ArrowRight' });
    expect(text('.ck-readout-digital')).toBe('3:05');
    const hour = document.querySelector('.ck-hand.is-hour') as SVGGElement;
    fireEvent.keyDown(hour, { key: 'ArrowRight' });
    expect(text('.ck-readout-digital')).toBe('4:05');
  });
});

describe('clock board: matching', () => {
  it('tapping a clock and then a display pairs them, and says how many are paired', () => {
    function Harness() {
      const [mapping, setMapping] = useState(['', '']);
      return <MatchBoard faces={[{ h: 3, m: 0 }, { h: 8, m: 30 }]} displays={['8:30', '3:00']} mapping={mapping} onChange={setMapping} label="შესაბამისობა" />;
    }
    render(<Harness />);
    expect(text('.mt-count')).toContain('0 / 2');
    fireEvent.click(screen.getAllByRole('button', { name: /^ანალოგური საათი 1/ })[0]);
    fireEvent.click(screen.getByRole('button', { name: /^ციფრული დრო 2: 3:00/ }));
    expect(text('.mt-count')).toContain('1 / 2');
    expect(screen.getByRole('button', { name: /^ანალოგური საათი 1/ }).getAttribute('aria-label')).toContain('2-ს');
  });
});

describe('clock board: counting by fives', () => {
  it('lights the five-minute marks the minute hand has passed', () => {
    render(<FiveMinuteRing upTo={{ h: 2, m: 20 }} />);
    expect(document.querySelectorAll('.fm-chip.is-passed')).toHaveLength(4);
    expect(text('.fm-note')).toContain('20');
    cleanup();
    render(<FiveMinuteRing upTo={{ h: 2, m: 0 }} />);
    expect(document.querySelectorAll('.fm-chip.is-passed')).toHaveLength(0);
  });
});

// ─────────────────────────── shape boards ───────────────────────────

describe('shape board: drawing and counting', () => {
  it('draws a triangle with three sides and marks them when asked', () => {
    render(<Shape2D spec={{ kind: 'triangle' }} markSides />);
    expect(document.querySelectorAll('.f2-side')).toHaveLength(3);
    expect(document.querySelector('.f2-body')?.tagName.toLowerCase()).toBe('polygon');
    expect(screen.getByRole('img', { name: /სამკუთხედი: 3 გვერდი, 3 კუთხე/ })).toBeTruthy();
  });

  it('draws a circle as a curve, never as a polygon', () => {
    render(<Shape2D spec={{ kind: 'circle', radius: 40 }} markCorners />);
    expect(document.querySelector('.f2-body')?.tagName.toLowerCase()).toBe('circle');
    expect(document.querySelectorAll('.f2-corner')).toHaveLength(0);
    expect(text('.f2-none')).toContain('არ აქვს');
  });

  it('a turned square still draws four sides the way they are', () => {
    render(<Shape2D spec={{ kind: 'square', size: 80, rotate: 30 }} markSides />);
    expect(document.querySelectorAll('.f2-side')).toHaveLength(4);
  });

  it('tapping a side counts it, and tapping it again un-counts it', () => {
    function Harness() {
      const [counted, setCounted] = useState<number[]>([]);
      return <TapShapeBoard spec={{ kind: 'triangle' }} tap="sides" counted={counted} onChange={setCounted} label="სამკუთხედი" />;
    }
    render(<Harness />);
    const sides = screen.getAllByRole('button', { name: /^გვერდი/ });
    expect(sides).toHaveLength(3);
    fireEvent.click(sides[0]);
    expect(text('.tp-count')).toContain('1');
    fireEvent.click(sides[0]);
    expect(text('.tp-count')).toContain('0');
    for (const s of screen.getAllByRole('button', { name: /^გვერდი/ })) fireEvent.click(s);
    expect(text('.tp-count')).toContain('3');
  });

  it('a circle offers nothing to count and explains why', () => {
    render(<TapShapeBoard spec={{ kind: 'circle', radius: 40 }} tap="corners" counted={[]} onChange={vi.fn()} label="წრე" />);
    expect(screen.queryAllByRole('button', { name: /^კუთხე/ })).toHaveLength(0);
    expect(text('.tp-note')).toContain('კუთხე');
  });
});

describe('shape board: sorting and the room', () => {
  it('sorting writes a group per shape', () => {
    function Harness() {
      const [groups, setGroups] = useState(['', '']);
      return <ShapeSortBoard shapes={[{ kind: 'circle' }, { kind: 'triangle' }]} groupBy="sides" groups={groups} onChange={setGroups} label="დალაგება" />;
    }
    render(<Harness />);
    // the tray holds the shapes still to be placed; the circle is first
    fireEvent.click(screen.getByRole('button', { name: /^ფიგურა 1/ }));
    const bins = [...document.querySelectorAll('.sort-bin')] as HTMLElement[];
    expect(bins).toHaveLength(3);
    fireEvent.click(within(bins[0]).getByRole('button'));
    // the circle has moved out of the tray and into the "no straight sides" group
    expect(document.querySelectorAll('.sort-tray .sort-card')).toHaveLength(1);
    expect(document.querySelectorAll('.sort-bin')[0].querySelectorAll('.sort-card')).toHaveLength(1);
    expect(document.querySelectorAll('.sort-bin')[1].querySelectorAll('.sort-card')).toHaveLength(0);
  });

  it('the room marks a picked object with a tick and a word', () => {
    function Harness() {
      const [picked, setPicked] = useState<string[]>([]);
      return <RoomBoard target="circle" items={[{ id: 'clock', label: 'საათი', spec: { kind: 'circle', radius: 40 } }]} picked={picked} onChange={setPicked} label="ოთახი" />;
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: /^საათი/ }));
    expect(text('.room-name')).toContain('✓');
    expect(screen.getByRole('button', { name: /^საათი/ }).getAttribute('aria-pressed')).toBe('true');
  });
});

// ─────────────────────────── the tools and the demos ───────────────────────────

describe('tools: the clock explorer', () => {
  const lab = (l: Lesson) => l.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>;

  it('the five-minute lab adds five minutes at a time and says the count', () => {
    render(<ExploreToolViewClock tool={lab(lessons07[4]).tool} />);
    expect(text('.lab-status')).toContain('0 წუთი');
    fireEvent.click(screen.getByRole('button', { name: /5 წუთი წინ/ }));
    fireEvent.click(screen.getByRole('button', { name: /5 წუთი წინ/ }));
    expect(text('.lab-status')).toContain('10 წუთი');
    expect(document.querySelectorAll('.fm-chip.is-passed')).toHaveLength(2);
  });

  it('the setting lab tells the student when the clock is right', () => {
    render(<ExploreToolViewClock tool={lab(lessons07[1]).tool} />);
    expect(text('.lab-status')).toContain('ასე არ არის');
    fireEvent.click(screen.getByRole('button', { name: '3:00' }));
    // the target is now 3:00 and the clock has just been set to it
    expect(text('.lab-status')).toMatch(/სწორია|ასე არ არის/);
  });

  it('the matching lab shuffles the displays so position is never the answer', () => {
    render(<ExploreToolViewClock tool={lab(lessons07[3]).tool} />);
    const digital = screen.getAllByRole('button', { name: /^ციფრული დრო/ }).map((b) => b.textContent ?? '');
    const faces = lab(lessons07[3]).tool;
    if (faces.tool !== 'time-match-lab') throw new Error('unexpected tool');
    expect(digital.join(' ')).not.toBe(faces.pairs.map((p) => digitalText(p.time)).join(''));
  });
});

describe('tools: the shape explorer', () => {
  const lab = (l: Lesson) => l.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>;

  it('the flat lab reports the properties of the shape that is picked', () => {
    render(<ExploreToolViewShapes2D tool={lab(lessons08[1]).tool} />);
    expect(text('.lab-status')).toContain('სამკუთხედი');
    fireEvent.click(screen.getAllByRole('button', { name: /^ფიგურა/ })[3]);
    expect(text('.lab-status')).toContain('წრე');
    const bodies = [...document.querySelectorAll('.lab-flat > .f2 .f2-body')];
    expect(bodies).toHaveLength(1);
    expect(bodies[0].tagName.toLowerCase()).toBe('circle');
  });

  it('the room lab counts the objects that really are the asked shape', () => {
    render(<ExploreToolViewShapes2D tool={lab(lessons08[4]).tool} />);
    expect(text('.room-count')).toContain('0 /');
    expect(screen.getAllByRole('button', { name: /^საათი/ }).length).toBeGreaterThan(1);
    fireEvent.click(screen.getByRole('button', { name: 'საათი' }));
    expect(text('.room-count')).toContain('1 /');
    // one clock alone is not the whole answer: the room asks for every round thing
    expect(text('.lab-status')).toBe('ჯერ არ არის ყველა სწორი.');
  });
});

describe('demos: the clock and shape stories step through', () => {
  it('the clock story shows the face first and then the hands it names', () => {
    render(
      <ClockDemo
        block={{
          type: 'clock-demo',
          mode: 'hands',
          time: { h: 3, m: 0 },
          steps: ['ციფრები', 'საათის ისარი', 'წუთის ისარი', 'ორივე'],
        }}
      />,
    );
    expect(document.querySelectorAll('.ck-hand-line')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგ →' }));
    expect(document.querySelector('.ck-hand.is-hour')).toBeTruthy();
    expect(text('.ms-steps li.is-on')).toContain('საათის ისარი');
    fireEvent.click(screen.getByRole('button', { name: '← უკან' }));
    expect(text('.ms-steps li.is-on')).toContain('ციფრები');
  });

  it('the shape story lights one side at a time and keeps the count honest', () => {
    render(<Shape2DDemo block={{ type: 'shape2d-demo', mode: 'sides', spec: { kind: 'square' }, steps: ['ერთი', 'ორი', 'სამი'] }} />);
    expect(document.querySelectorAll('.f2-side.is-lit')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგ →' }));
    expect(document.querySelectorAll('.f2-side.is-lit')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგ →' }));
    expect(text('.ms-steps li.is-on')).toContain('სამი');
    // the last step of a four-sided shape shows all four sides, so the count matches the words
    expect(document.querySelectorAll('.f2-side.is-lit')).toHaveLength(4);
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
    case 'hand-pick':
      // hour row first, then minute row
      radio(r.hourHand === 'short' ? 0 : 1);
      fireEvent.click(screen.getAllByRole('radio')[2 + (r.minuteHand === 'short' ? 0 : 1)]);
      break;
    case 'set-clock': {
      // the board starts at 12:00; the minute hand moves in the response's own step, the hour hand one number
      const step = r.step === 1 ? 1 : 5;
      const forward = screen.getByRole('button', { name: step === 1 ? '1 წუთი წინ' : `${step} წუთი წინ` });
      for (let m = 0; m < r.ask.m; m += step) fireEvent.click(forward);
      const hourForward = screen.getByRole('button', { name: /საათი \+1/ });
      for (let i = 0; i < (r.ask.h - 12 + 12) % 12; i += 1) fireEvent.click(hourForward);
      break;
    }
    case 'read-clock': {
      const index = r.options.findIndex((o) => o.h === r.time.h && o.m === r.time.m);
      radio(index);
      break;
    }
    case 'match-time': {
      // tap each face, then the display that reads the same time (found by its text, never by its position)
      r.faces.forEach((time, i) => {
        const display = r.displays.findIndex((d) => {
          const p = parseDigital(d);
          return p !== null && p.h === time.h && p.m === time.m;
        });
        fireEvent.click(screen.getByRole('button', { name: new RegExp(`^ანალოგური საათი ${i + 1}`) }));
        fireEvent.click(screen.getByRole('button', { name: new RegExp(`^ციფრული დრო ${display + 1}: ${r.displays[display].replace('.', '\\.')}`) }));
      });
      break;
    }
    case 'shape-sort': {
      const bins = () => [...document.querySelectorAll('.sort-bin')] as HTMLElement[];
      const groupId = (spec: { kind: string; rotate?: number; size?: number }) => groupIdOf(spec as never, r.groupBy);
      r.shapes.forEach((spec) => {
        // the tray holds the shapes still to be placed, in their own order, so the first card there is the next one
        const tray = document.querySelector('.sort-tray') as HTMLElement;
        const card = tray.querySelectorAll('.sort-card')[0] as HTMLElement;
        // the board pre-selects the next shape after each placement; clicking it again would deselect it
        if (card.getAttribute('aria-pressed') !== 'true') fireEvent.click(card);
        const group = groupsFor(r.groupBy).find((g) => g.id === groupId(spec)) as { id: string; label: string };
        const index = groupsFor(r.groupBy).findIndex((g) => g.id === group.id);
        // the bin holds the shapes already placed as well, so the button to press is its own header button
        fireEvent.click(bins()[index].querySelector('.sort-bin-btn') as HTMLElement);
      });
      break;
    }
    case 'tap-parts': {
      // tap every side (or corner), exactly once each — the count has to come from the outline
      const label = r.tap === 'sides' ? /^გვერდი \d/ : /^კუთხე \d/;
      const total = r.tap === 'sides' ? sidesOf(r.shape) : verticesOf(r.shape);
      const parts = screen.queryAllByRole('button', { name: label });
      expect(parts).toHaveLength(total);
      for (const button of parts) fireEvent.click(button);
      expect(text('.tp-count')).toContain(`დათვლილია: ${total}`);
      break;
    }
    case 'find-shapes': {
      for (const item of r.items) {
        // the room is drawn from the same data, so the object's outline decides whether it is picked
        if (shapeGroup(item.spec) === r.kind) fireEvent.click(screen.getByRole('button', { name: item.label }));
      }
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

describe.each([
  ['g1-u07', U07],
  ['g1-u08', U08],
] as const)('%s unit page', (unitId, ids) => {
  it('lists the five lessons, all playable and in order', () => {
    go(`#/student/lessons/${unitId}`);
    const list = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(list).toHaveLength(5);
    ids.forEach((id, i) => expect(within(list[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
  });
});

describe.each([...U07, ...U08].map((id) => [id] as const))('%s plays to the end', (id) => {
  it('every step works with its own correct answers and the progress is saved', () => {
    const lesson = LESSON_CONTENT[id];
    go(`#/student/lessons/${id}`);
    expect(screen.getByText(`ნაბიჯი 1 / ${lesson.activities.length}`)).toBeTruthy();
    playThrough(lesson);
    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    const checks = stageOf(lesson, 'check').length;
    expect(screen.getByText(`${checks} / ${checks}`)).toBeTruthy();
    expect(saved()[id]).toMatchObject({ status: 'completed', checkCorrect: checks, checkTotal: checks });
    if (id.startsWith('g1-u07')) expect(screen.getByRole('link', { name: 'U07-ზე დაბრუნება' }).getAttribute('href')).toBe('#/student/lessons/g1-u07');
    else expect(screen.getByRole('link', { name: 'U08-ზე დაბრუნება' }).getAttribute('href')).toBe('#/student/lessons/g1-u08');
  });
});

describe('the check never helps more than it should', () => {
  it('check questions carry no hints, practice ones do', () => {
    for (const l of all) {
      for (const x of stageOf(l, 'check')) expect(x.hints, `${l.id}/${x.id}`).toEqual([]);
      for (const x of stageOf(l, 'practice')) expect(x.hints.length, `${l.id}/${x.id}`).toBeGreaterThan(0);
    }
  });

  it('a wrong answer in the clock check is marked wrong with the lesson\'s own words', () => {
    go('#/student/lessons/g1-u07-l2');
    const firstCheck = lessons07[1].activities.findIndex((a) => a.stage === 'check');
    lessons07[1].activities.slice(0, firstCheck).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    const check = stageOf(lessons07[1], 'check')[0];
    if (check.response.type !== 'read-clock') throw new Error('unexpected check');
    radio(check.response.options.findIndex((o) => !(o.h === check.response.time.h && o.m === check.response.m)));
    submit();
    expect(feedback()).toContain('ჯერ არ არის');
  });
});

describe('content: the ten lessons keep the standing shape', () => {
  it('ten activities in the same order every time: challenge, explore, understand, four practices, three checks', () => {
    for (const l of all) {
      expect(l.activities).toHaveLength(10);
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

  it('every question explains itself and has fallback feedback in the lesson\'s own words', () => {
    for (const l of all)
      for (const x of questions(l)) {
        expect(x.explanation.length, `${l.id}/${x.id}`).toBeGreaterThan(5);
        expect(x.fallbackFeedback?.length, `${l.id}/${x.id}`).toBeGreaterThan(5);
      }
  });

  it('the challenge never gives the answer away', () => {
    for (const l of all) {
      const challenge = l.activities[0];
      if (challenge.kind === 'question') expect(challenge.revealOnExhaust).toBe(false);
    }
  });

  it('every lesson starts from something the student can already do', () => {
    for (const l of all) {
      expect(l.concepts?.length, l.id).toBeGreaterThan(2);
      expect(l.minutes).toBeGreaterThan(0);
    }
  });

  it('the two units teach different things: no shape lesson asks about a clock and no clock lesson about sides', () => {
    for (const l of lessons07) for (const a of l.activities) expect(shapesOf(a)).toEqual([]);
    for (const l of lessons08) for (const a of l.activities) expect(timesOf(a)).toEqual([]);
  });
});

describe('U07.4 analog to digital: the player pairs by the time, not by the row', () => {
  it('matching the fourth lesson practice pairs each face with the display that reads the same', () => {
    go('#/student/lessons/g1-u07-l4');
    const l = lessons07[3];
    const stop = l.activities.findIndex((a) => a.id === 'practice-1');
    l.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    const practice = l.activities[stop] as QuestionActivity;
    answerCorrectly(practice);
    expect(feedback()).toContain('სწორია');
    // the board counts the pairs it has and marks each one with its own number
    expect(text('.mt-count')).toContain('/ 3');
    expect(document.querySelectorAll('.mt-badge')).toHaveLength(6);
  });
});

describe('U07.2 o\'clock: a whole hour means the minute hand on 12', () => {
  it('setting 9:00 in the player lands the minute hand straight up', () => {
    go('#/student/lessons/g1-u07-l2');
    const l = lessons07[1];
    const stop = l.activities.findIndex((a) => a.id === 'check-2');
    l.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    const check = l.activities[stop] as QuestionActivity;
    answerCorrectly(check);
    expect(feedback()).toContain('სწორია');
    const hands = [...document.querySelectorAll('.ck-hand-line')];
    const minute = hands[hands.length - 1] as SVGLineElement;
    expect(angleAt(Number(minute.getAttribute('x2')), Number(minute.getAttribute('y2')), 70, 70)).toBeCloseTo(0, 0);
  });
});

describe('U07.5 five minutes: the ring fills as the minute hand moves', () => {
  it('the five-minute answer board shows a mark for every five minutes already counted', () => {
    go('#/student/lessons/g1-u07-l5');
    toStage(lessons07[4], 'explore');
    const forward = screen.getByRole('button', { name: /5 წუთი წინ/ });
    for (let i = 0; i < 3; i += 1) fireEvent.click(forward);
    expect(document.querySelectorAll('.fm-chip.is-passed')).toHaveLength(3);
    expect(text('.lab-status')).toContain('15');
  });
});

describe('the two units join up', () => {
  it('completing the clocks unit offers the shapes unit, and only once every lesson is done', () => {
    const lesson = lessons07[4];
    // with U07.1–U07.4 still open there is nothing to hand over to yet
    go(`#/student/lessons/${lesson.id}`);
    playThrough(lesson);
    expect(screen.queryByRole('link', { name: /შემდეგი თემა:/ })).toBeNull();
    cleanup();

    const done = Object.fromEntries(U07.slice(0, 4).map((id) => [id, { status: 'completed', checkCorrect: 3, checkTotal: 3, completedAt: 1 }]));
    window.localStorage.setItem(LEARN_STORAGE_KEY, JSON.stringify(done));
    resetProgressCache();
    go(`#/student/lessons/${lesson.id}`);
    playThrough(lesson);
    expect(screen.getByRole('link', { name: /შემდეგი თემა: U08\.1/ }).getAttribute('href')).toBe('#/student/lessons/g1-u08-l1');
  });

  it('the shapes unit page links back to the unit, and the last shapes lesson has nowhere further to go', () => {
    const lesson = lessons08[4];
    go(`#/student/lessons/${lesson.id}`);
    playThrough(lesson);
    expect(screen.getByRole('link', { name: 'U08-ზე დაბრუნება' }).getAttribute('href')).toBe('#/student/lessons/g1-u08');
    expect(screen.queryByRole('link', { name: /გაგრძელება:/ })).toBeNull();
  });
});

describe('U07.1 hands: the explore lets the student turn them', () => {
  it('the clock lab moves the hands and reports the angles', () => {
    go('#/student/lessons/g1-u07-l1');
    toStage(lessons07[0], 'explore');
    expect(document.querySelector('.ck')).toBeTruthy();
    const minute = document.querySelector('.ck-hand.is-minute') as SVGGElement;
    fireEvent.keyDown(minute, { key: 'ArrowRight' });
    expect(text('.lab-facts')).toContain('წუთის ისარი');
    expect(text('.lab-status')).toContain('სცადე');
  });
});

describe('U07.3 half past: the hour hand really is between the numbers', () => {
  it('the explore sets a half-past time with the hour hand off the number', () => {
    go('#/student/lessons/g1-u07-l3');
    toStage(lessons07[2], 'explore');
    // asking for a target resets the clock to 12:00, so the student has to set it: 4 by the hour hand, 30 by the
    // minutes — and at 4:30 the hour hand must not land on 4
    fireEvent.click(screen.getByRole('button', { name: '4:30' }));
    const hourForward = screen.getByRole('button', { name: /საათი \+1/ });
    for (let i = 0; i < 4; i += 1) fireEvent.click(hourForward);
    const minuteForward = screen.getByRole('button', { name: '5 წუთი წინ' });
    for (let i = 0; i < 6; i += 1) fireEvent.click(minuteForward);
    expect(text('.lab-status')).toContain('სწორია');
    const hour = document.querySelector('.ck-hand.is-hour .ck-hand-line') as SVGLineElement;
    const tip = { x: Number(hour.getAttribute('x2')), y: Number(hour.getAttribute('y2')) };
    // 4:30 leaves the hour hand halfway between 4 and 5, not on 4
    expect(angleAt(tip.x, tip.y, 70, 70)).toBeCloseTo(hourAngle({ h: 4, m: 30 }), 0);
    expect(angleAt(tip.x, tip.y, 70, 70)).toBeGreaterThan(130);
  });
});

describe('U08.2 sides: tapping in the player counts the real sides', () => {
  it('practice-1 needs every side of the triangle', () => {
    go('#/student/lessons/g1-u08-l2');
    toStage(lessons08[1], 'explore');
    next();
    next();
    const sides = screen.getAllByRole('button', { name: /^გვერდი \d/ });
    expect(sides).toHaveLength(3);
    fireEvent.click(sides[0]);
    fireEvent.click(sides[1]);
    submit();
    // two of three sides is an unfinished answer, not a wrong one: it says what is missing
    expect(feedback()).toContain('გვერდს');
    expect(feedback()).toContain('შეავსე პასუხი');
    fireEvent.click(screen.getAllByRole('button', { name: /^გვერდი \d/ })[2]);
    submit();
    expect(feedback()).toContain('სწორია');
  });
});

describe('U08.5 everyday shapes: the room finds the right objects', () => {
  it('the explore marks only the round objects as picked by the student', () => {
    go('#/student/lessons/g1-u08-l5');
    toStage(lessons08[4], 'explore');
    expect(document.querySelector('.room')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'საათი' }));
    expect(text('.room-count')).toContain('1');
    expect(text('.lab-status')).toContain('ჯერ არ არის');
  });
});

describe('style: motion, layout and honest feedback', () => {
  const css = readFileSync('src/lessons/learn.css', 'utf8');
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));

  it('the new boards are switched off under reduced motion', () => {
    for (const cls of ['.ck-hand', '.f2-pick', '.room-item']) expect(reduced, cls).toContain(cls);
  });

  it('the boards scale with the screen and fold to one column on a phone', () => {
    expect(css).toMatch(/\.ck \{[^}]*max-width: 100%/);
    expect(css).toMatch(/\.f2 \{[^}]*display: block/);
    const from = css.indexOf('U07: time');
    const small = css.slice(css.indexOf('@media (max-width: 520px)', from));
    expect(small).toContain('.mt-cols');
    expect(small).toContain('grid-template-columns: 1fr');
    expect(small).toContain('.f2-sort');
  });

  it('correctness is never shown by colour alone: every mark carries a word or a symbol', () => {
    render(<FiveMinuteRing upTo={{ h: 3, m: 15 }} />);
    expect(text('.fm-note')).toContain('15');
    cleanup();
    render(<TapShapeBoard spec={{ kind: 'square' }} tap="sides" counted={[1]} onChange={vi.fn()} label="კვადრატი" />);
    expect(text('.tp-count')).toContain('1');
    expect(text('.f2-side.is-lit')).toBe('1');
  });

  it('the hands are named in words for a screen reader', () => {
    render(<ClockFace time={{ h: 9, m: 0 }} onTime={vi.fn()} label="საათი" />);
    expect(screen.getByRole('button', { name: 'საათის ისარი (მოკლე)' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'წუთის ისარი (გრძელი)' })).toBeTruthy();
  });
});
