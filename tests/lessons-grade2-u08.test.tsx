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
  DAYS_IN_WEEK,
  MONTHS,
  WEEKDAYS,
  addDays,
  dateWithWeekday,
  dayAfter,
  dayBefore,
  datesOnWeekday,
  daysBetween,
  daysText,
  isLeapYear,
  isWeekday,
  isWeekendDay,
  monthGrid,
  monthLength,
  monthLengths,
  weekdayCount,
  weekdayIndex,
  weekdayName,
  weekdayOf,
  weekOf,
  weeksTextOf,
} from '../src/lessons/exercises/CalendarGeometry';
import { CalendarBoard, DateCard, DateSpanPicture, WeekStrip } from '../src/lessons/exercises/CalendarBoard';
import { CalendarLab, ElapsedLab } from '../src/lessons/exercises/CalendarTools';
import { DaysBetweenAnswer, WeekdayAnswer } from '../src/lessons/exercises/CalendarAnswers';
import { addMinutes, minutesBetween } from '../src/lessons/exercises/ClockGeometry';
import type { Lesson, QuestionActivity, ResponseSpec } from '../src/lessons/types';

/**
 * Grade 2 · Unit 8: "Calendars, Days, Weeks, & Elapsed Time".
 *
 * Every weekday in this suite is derived from the date, so the calendar cannot claim 1 March 2025 is a Monday. Nothing
 * reads the system clock: the unit's dates are fixed, and the arithmetic is the only source of truth.
 */

const U08 = ['g2-u08-l1', 'g2-u08-l2', 'g2-u08-l3', 'g2-u08-l4', 'g2-u08-l5'];
const lessons = U08.map((id) => LESSON_CONTENT[id]);
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);
const text = (sel: string) => document.querySelector(sel)?.textContent ?? '';

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 2 U08 is the calendar unit', () => {
  it('has the approved titles, ids and codes', () => {
    const unit = getUnit('g2-u08');
    expect(unit?.title).toBe('Calendars, Days, Weeks, & Elapsed Time');
    expect(unit?.grade).toBe(2);
    expect(unit?.lessons.map((l) => l.id)).toEqual(U08);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U08.1', 'U08.2', 'U08.3', 'U08.4', 'U08.5']);
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Naming and Ordering the Days of the Week',
      'Understanding Months and Reading a Calendar',
      'Counting Days and Weeks on a Calendar',
      'Reading and Comparing Clock Times',
      'Calculating Simple Elapsed Time',
    ]);
  });

  it('has content for every one of the five lessons', () => {
    for (const id of U08) {
      expect(LESSON_CONTENT[id], id).toBeTruthy();
      expect(LESSON_CONTENT[id].id).toBe(id);
      expect(LESSON_CONTENT[id].status).toBe('placeholder');
    }
  });
});

// ─────────────────────────── the week ───────────────────────────

describe('calendar: the week is a cycle of seven', () => {
  it('names the days from Monday', () => {
    expect(WEEKDAYS).toHaveLength(DAYS_IN_WEEK);
    expect(weekdayName(0)).toBe('ორშაბათი');
    expect(weekdayName(6)).toBe('კვირა');
    expect(weekdayName(7)).toBe('ორშაბათი');
    expect(weekdayName(-1)).toBe('კვირა');
  });

  it('wraps both ways, so no arithmetic ever leaves 0…6', () => {
    for (let d = 0; d < 7; d += 1) {
      expect(weekdayIndex(d)).toBe(d);
      expect(dayAfter(d, 7)).toBe(d);
      expect(dayAfter(d, -7)).toBe(d);
      expect(dayBefore(d, 1)).toBe(dayAfter(d, -1));
      expect(weekdayIndex(dayAfter(d, 3))).toBeGreaterThanOrEqual(0);
      expect(weekdayIndex(dayAfter(d, 3))).toBeLessThan(7);
    }
    expect(dayAfter(5, 2)).toBe(0);
    expect(dayBefore(0, 1)).toBe(6);
  });

  it('separates the school week from the weekend', () => {
    expect([0, 1, 2, 3, 4].every(isWeekday)).toBe(true);
    expect([5, 6].every(isWeekendDay)).toBe(true);
    expect(isWeekday(5)).toBe(false);
    expect(isWeekendDay(0)).toBe(false);
  });

  it('counts days in words', () => {
    expect(daysText(1)).toBe('1 დღე');
    expect(daysText(3)).toBe('3 დღე');
    expect(weeksTextOf(7)).toBe('7 დღე = 1 კვირა');
    expect(weeksTextOf(10)).toBe('10 დღე = 1 კვირა და 3 დღე');
  });
});

// ─────────────────────────── months and dates ───────────────────────────

describe('calendar: the months are not the same length', () => {
  it('has twelve months with their real lengths', () => {
    expect(MONTHS).toHaveLength(12);
    expect(monthLengths(2025)).toEqual([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);
    expect(monthLength(1)).toBe(31);
    expect(monthLength(4)).toBe(30);
    expect(monthLength(2)).toBe(28);
    expect(monthLength(2, 2024)).toBe(29);
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2025)).toBe(false);
    const total = monthLengths(2025).reduce((a, b) => a + b, 0);
    expect(total).toBe(365);
    expect(monthLengths(2024).reduce((a, b) => a + b, 0)).toBe(366);
  });

  it('derives every weekday from the date itself', () => {
    expect(dateWithWeekday({ year: 2025, month: 3, day: 1 })).toBe('1 მარტი, 2025 — შაბათი');
    expect(dateWithWeekday({ year: 2025, month: 1, day: 1 })).toBe('1 იანვარი, 2025 — ოთხშაბათი');
    expect(dateWithWeekday({ year: 2025, month: 3, day: 5 })).toBe('5 მარტი, 2025 — ოთხშაბათი');
    // a week later is the same weekday, always
    for (let day = 1; day <= 28; day += 1) {
      const d = { year: 2025, month: 3, day };
      expect(weekdayOf(addDays(d, 7))).toBe(weekdayOf(d));
    }
  });

  it('rolls over months and years when adding days', () => {
    expect(addDays({ year: 2025, month: 12, day: 28 }, 5)).toEqual({ year: 2026, month: 1, day: 2 });
    expect(addDays({ year: 2025, month: 3, day: 1 }, -1)).toEqual({ year: 2025, month: 2, day: 28 });
    expect(addDays({ year: 2024, month: 3, day: 1 }, -1)).toEqual({ year: 2024, month: 2, day: 29 });
    expect(addDays({ year: 2025, month: 3, day: 5 }, 0)).toEqual({ year: 2025, month: 3, day: 5 });
  });

  it('counts the days between two dates the way a calendar does', () => {
    expect(daysBetween({ year: 2025, month: 3, day: 5 }, { year: 2025, month: 3, day: 12 })).toBe(7);
    expect(daysBetween({ year: 2025, month: 3, day: 28 }, { year: 2025, month: 4, day: 2 })).toBe(5);
    expect(daysBetween({ year: 2025, month: 1, day: 1 }, { year: 2025, month: 12, day: 31 })).toBe(364);
    expect(daysBetween({ year: 2025, month: 3, day: 12 }, { year: 2025, month: 3, day: 5 })).toBe(-7);
  });

  it('lays a month out under its own weekdays', () => {
    const grid = monthGrid(2025, 3);
    expect(grid.every((week) => week.length === 7)).toBe(true);
    const first = 1;
    const column = grid[0].findIndex((cell) => cell?.day === first);
    expect(column).toBe(weekdayOf({ year: 2025, month: 3, day: 1 }));
    const days = grid.flat().filter((cell): cell is { year: number; month: number; day: number } => cell !== null);
    expect(days).toHaveLength(31);
    for (const d of days) expect(weekdayOf(d)).toBe(weekdayName.length > 0 ? weekdayIndex(weekdayOf(d)) : 0);
  });

  it('offers exactly four or five of each weekday in a month', () => {
    for (let month = 1; month <= 12; month += 1) {
      for (let day = 0; day < 7; day += 1) {
        const n = weekdayCount(2025, month, day);
        expect(n, `${month}/${day}`).toBeGreaterThanOrEqual(4);
        expect(n, `${month}/${day}`).toBeLessThanOrEqual(5);
        expect(datesOnWeekday(2025, month, day)).toHaveLength(n);
      }
    }
  });

  it('gives a date its own week, Monday first', () => {
    const week = weekOf({ year: 2025, month: 3, day: 5 });
    expect(week).toHaveLength(7);
    expect(week[0]).toEqual({ year: 2025, month: 3, day: 3 });
    expect(week[6]).toEqual({ year: 2025, month: 3, day: 9 });
  });
});

// ─────────────────────────── elapsed time ───────────────────────────

describe('calendar: elapsed time is a subtraction', () => {
  it('reads minutes between two clock times', () => {
    expect(minutesBetween({ h: 3, m: 0 }, { h: 4, m: 30 })).toBe(90);
    expect(minutesBetween({ h: 2, m: 0 }, { h: 5, m: 0 })).toBe(180);
    expect(minutesBetween({ h: 9, m: 30 }, { h: 11, m: 0 })).toBe(90);
    expect(minutesBetween({ h: 6, m: 0 }, { h: 6, m: 30 })).toBe(30);
    expect(addMinutes({ h: 3, m: 0 }, 90)).toEqual({ h: 4, m: 30 });
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

describe('checking: dates and weekdays', () => {
  it('wants a real date, typed as year, month, day', () => {
    const step = q({ type: 'date-step', from: { year: 2025, month: 3, day: 5 }, count: 7 });
    expect(evaluateAnswer(step, '2025,3,12').verdict).toBe('correct');
    expect(evaluateAnswer(step, '2025,3,13').verdict).toBe('incorrect');
    expect(evaluateAnswer(step, '').verdict).toBe('incomplete');
    expect(evaluateAnswer(step, '2025,2,30').verdict).toBe('incorrect');
    expect(evaluateAnswer(step, '2025,2,30').feedback).toContain('არ არსებობს');
  });

  it('decides the weekday from the date, not from a label', () => {
    const wd = q({ type: 'weekday-of', date: { year: 2025, month: 3, day: 5 } });
    expect(evaluateAnswer(wd, '2').verdict).toBe('correct');
    expect(evaluateAnswer(wd, '3').verdict).toBe('incorrect');
    expect(evaluateAnswer(wd, '').verdict).toBe('incomplete');
  });

  it('counts the days between two dates', () => {
    const span = q({ type: 'days-between', from: { year: 2025, month: 3, day: 5 }, to: { year: 2025, month: 3, day: 12 } });
    expect(evaluateAnswer(span, '7').verdict).toBe('correct');
    expect(evaluateAnswer(span, '8').verdict).toBe('incorrect');
    expect(evaluateAnswer(span, '').verdict).toBe('incomplete');
  });

  it('wants elapsed time as whole hours and minutes', () => {
    const el = q({ type: 'elapsed', from: { h: 3, m: 0 }, to: { h: 4, m: 30 } });
    expect(evaluateAnswer(el, '1,30').verdict).toBe('correct');
    expect(evaluateAnswer(el, '0,90').verdict).toBe('correct');
    expect(evaluateAnswer(el, '1,0').verdict).toBe('incorrect');
    expect(evaluateAnswer(el, ',').verdict).toBe('incomplete');
  });

  it('explains a wrong count with the real span', () => {
    const wrong = evaluateAnswer(
      q({ type: 'days-between', from: { year: 2025, month: 3, day: 5 }, to: { year: 2025, month: 3, day: 12 } }, { fallbackFeedback: 'ჯერ არ არის ზუსტი.' }),
      '8',
    );
    expect(wrong.feedback).toContain('ჯერ არ არის ზუსტი');
    expect(wrong.feedback).toContain('1 კვირა');
  });

  it('describes its own answers', () => {
    expect(describeAnswer({ type: 'weekday-of', date: { year: 2025, month: 3, day: 5 } })).toBe('ოთხშაბათი');
    expect(describeAnswer({ type: 'days-between', from: { year: 2025, month: 3, day: 5 }, to: { year: 2025, month: 3, day: 12 } })).toContain('1 კვირა');
    expect(describeAnswer({ type: 'date-step', from: { year: 2025, month: 3, day: 5 }, count: 7 })).toContain('12 მარტი');
    expect(describeAnswer({ type: 'elapsed', from: { h: 3, m: 0 }, to: { h: 4, m: 30 } })).toBe('1 სთ 30 წთ');
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
    expect(tool('g2-u08-l1')).toBe('calendar-lab');
    expect(tool('g2-u08-l2')).toBe('calendar-lab');
    expect(tool('g2-u08-l3')).toBe('calendar-lab');
    expect(tool('g2-u08-l4')).toBe('time-set-lab');
    expect(tool('g2-u08-l5')).toBe('elapsed-lab');
  });
});

/** The answer a question expects, computed from the dates and times it ships. */
function correctAnswer(r: ResponseSpec): string {
  switch (r.type) {
    case 'choice':
      return r.answer;
    case 'numeric':
      return String(r.answer);
    case 'weekday-of':
      return String(weekdayOf(r.date));
    case 'days-between':
      return String(daysBetween(r.from, r.to));
    case 'date-step': {
      const d = addDays(r.from, r.count);
      return `${d.year},${d.month},${d.day}`;
    }
    case 'elapsed':
      return `${Math.floor(minutesBetween(r.from, r.to) / 60)},${minutesBetween(r.from, r.to) % 60}`;
    case 'read-clock':
      return `${r.time.h},${r.time.m}`;
    case 'match-time': {
      const mapping = r.faces.map((face) => r.displays.findIndex((d) => d === `${face.h}:${String(face.m).padStart(2, '0')}`));
      return mapping.join(',');
    }
    default:
      throw new Error(`no answer for ${r.type}`);
  }
}

describe('content: every question is answerable from its own dates', () => {
  it('the engine agrees with the content, question by question', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const verdict = evaluateAnswer(x, correctAnswer(x.response)).verdict;
        expect(verdict, `${l.id}/${x.id} (${x.response.type})`).toBe('correct');
      }
  });

  it('never asks about a date that does not exist', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type === 'weekday-of') expect(r.date.day).toBeLessThanOrEqual(monthLength(r.date.month, r.date.year));
        if (r.type === 'days-between') {
          expect(r.from.day).toBeLessThanOrEqual(monthLength(r.from.month, r.from.year));
          expect(r.to.day).toBeLessThanOrEqual(monthLength(r.to.month, r.to.year));
        }
      }
  });

  it('counts days only forward, and the count agrees with the weekdays', () => {
    const spans = lessons.flatMap((l) => questions(l).filter((x) => x.response.type === 'days-between').map((x) => x.response as Extract<ResponseSpec, { type: 'days-between' }>));
    expect(spans.length).toBeGreaterThan(2);
    for (const r of spans) {
      const days = daysBetween(r.from, r.to);
      expect(days).toBeGreaterThan(0);
      if (days % 7 === 0) expect(weekdayOf(r.to)).toBe(weekdayOf(r.from));
      else expect(weekdayOf(r.to)).not.toBe(weekdayOf(r.from));
    }
  });

  it('asks elapsed time only in whole hours and half hours', () => {
    const elapsed = lessons.flatMap((l) => questions(l).filter((x) => x.response.type === 'elapsed').map((x) => x.response as Extract<ResponseSpec, { type: 'elapsed' }>));
    expect(elapsed.length).toBeGreaterThan(3);
    for (const r of elapsed) {
      const minutes = minutesBetween(r.from, r.to);
      expect(minutes % 30, JSON.stringify(r)).toBe(0);
      expect(minutes).toBeGreaterThan(0);
    }
  });

  it('reads clock questions off the face the question ships', () => {
    const reads = lessons.flatMap((l) => questions(l).filter((x) => x.response.type === 'read-clock').map((x) => x.response as Extract<ResponseSpec, { type: 'read-clock' }>));
    for (const r of reads) {
      expect(r.options.some((o) => o.h === r.time.h && o.m === r.time.m), 'the right option is among the options').toBe(true);
      expect(r.options.filter((o) => o.h === r.time.h && o.m === r.time.m)).toHaveLength(1);
    }
  });
});

// ─────────────────────────── boards ───────────────────────────

describe('board: a month', () => {
  it('prints every day under its own weekday', () => {
    render(<CalendarBoard year={2025} month={3} highlight={[5]} />);
    expect(screen.getByLabelText('მარტი 2025: კალენდარი')).toBeTruthy();
    const cells = Array.from(document.querySelectorAll('.cal-grid td'));
    const five = cells.find((c) => c.textContent === '5');
    expect(five?.getAttribute('aria-label')).toBe('5 — ოთხშაბათი');
    expect(five?.className).toContain('is-hi');
    expect(text('.cal-note')).toContain('31 დღე');
  });

  it('marks a whole weekday column', () => {
    render(<CalendarBoard year={2025} month={3} markWeekday={5} />);
    expect(Array.from(document.querySelectorAll('.cal-grid th')).map((th) => th.textContent)).toEqual(['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი']);
    expect(document.querySelectorAll('.cal-grid th.is-marked')).toHaveLength(1);
  });

  it('draws the week from a date', () => {
    render(<WeekStrip date={{ year: 2025, month: 3, day: 5 }} />);
    expect(document.querySelectorAll('.cal-day')).toHaveLength(7);
    expect(Array.from(document.querySelectorAll('.cal-day-name')).map((n) => n.textContent)).toEqual([...WEEKDAYS]);
    expect(text('.cal-day.is-today .cal-day-num')).toBe('5');
    expect(document.querySelectorAll('.cal-day.is-on')).toHaveLength(0);
    // the marked day is the one that stands out, and only it
    cleanup();
    // `mark` is a weekday column, so marking Monday picks out 3 March
    render(<WeekStrip date={{ year: 2025, month: 3, day: 5 }} mark={0} />);
    expect(document.querySelectorAll('.cal-day.is-on')).toHaveLength(1);
    expect(text('.cal-day.is-on .cal-day-num')).toBe('3');
    expect(text('.cal-day.is-on .cal-day-name')).toBe('ორშაბათი');
  });

  it('shows a single date with its real weekday', () => {
    render(<DateCard date={{ year: 2025, month: 3, day: 5 }} />);
    expect(screen.getByLabelText('5 მარტი, 2025')).toBeTruthy();
    expect(text('.dsp-weekday')).toBe('ოთხშაბათი');
  });

  it('shows the days between two dates only when asked', () => {
    render(<DateSpanPicture from={{ year: 2025, month: 3, day: 5 }} to={{ year: 2025, month: 3, day: 12 }} />);
    expect(text('.dsp-note')).toBe('რამდენი დღეა?');
    cleanup();
    render(<DateSpanPicture from={{ year: 2025, month: 3, day: 5 }} to={{ year: 2025, month: 3, day: 12 }} showDays />);
    expect(text('.dsp-note')).toContain('1 კვირა');
  });
});

describe('board: answer controls', () => {
  it('asks for the days and says nothing until there is a number', () => {
    const onChange = vi.fn();
    render(<DaysBetweenAnswer from={{ year: 2025, month: 3, day: 5 }} to={{ year: 2025, month: 3, day: 12 }} value="" onChange={onChange} disabled={false} label="დღეები" />);
    expect(text('.dsp-hint')).toBe('დათვალე დღეები ორ თარიღს შორის.');
    fireEvent.change(screen.getByLabelText('დღეები'), { target: { value: '7' } });
    expect(onChange).toHaveBeenLastCalledWith('7');
    cleanup();
    render(<DaysBetweenAnswer from={{ year: 2025, month: 3, day: 5 }} to={{ year: 2025, month: 3, day: 12 }} value="7" onChange={onChange} disabled={false} label="დღეები" />);
    expect(text('.dsp-hint')).toContain('1 კვირა');
  });

  it('offers the seven weekdays as buttons', () => {
    const onChange = vi.fn();
    render(<WeekdayAnswer value="" onChange={onChange} disabled={false} label="კვირის დღე" />);
    expect(screen.getAllByRole('button')).toHaveLength(7);
    fireEvent.click(screen.getByRole('button', { name: 'ოთხშაბათი' }));
    expect(onChange).toHaveBeenLastCalledWith('2');
  });
});

// ─────────────────────────── tools ───────────────────────────

describe('tools: the calendar walker', () => {
  it('walks one day at a time and reads the weekday back', () => {
    render(<CalendarLab tool={{ tool: 'calendar-lab', year: 2025, month: 3, day: 5 }} />);
    expect(text('.lab-status')).toContain('5 მარტი, 2025 — ოთხშაბათი');
    fireEvent.click(screen.getByRole('button', { name: 'ერთი დღით წინ' }));
    expect(text('.lab-status')).toContain('6 მარტი, 2025 — ხუთშაბათი');
    fireEvent.click(screen.getByRole('button', { name: 'ერთი კვირით წინ' }));
    expect(text('.lab-status')).toContain('13 მარტი, 2025 — ხუთშაბათი');
  });

  it('rolls over the end of a month', () => {
    render(<CalendarLab tool={{ tool: 'calendar-lab', year: 2025, month: 3, day: 31 }} />);
    fireEvent.click(screen.getByRole('button', { name: 'ერთი დღით წინ' }));
    expect(text('.lab-status')).toContain('1 აპრილი, 2025 — სამშაბათი');
    fireEvent.click(screen.getByRole('button', { name: '↻ თავიდან' }));
    expect(text('.lab-status')).toContain('31 მარტი, 2025 — ორშაბათი');
  });

  it('switches between the week and the month', () => {
    render(<CalendarLab tool={{ tool: 'calendar-lab', year: 2025, month: 3, day: 5 }} />);
    expect(document.querySelectorAll('.cal-day')).toHaveLength(7);
    fireEvent.click(screen.getByRole('button', { name: 'თვე' }));
    expect(document.querySelectorAll('.cal-grid td.is-hi')).toHaveLength(1);
  });
});

describe('tools: the elapsed-time lab', () => {
  it('names the time between two clocks', () => {
    render(<ElapsedLab tool={{ tool: 'elapsed-lab', from: { h: 3, m: 0 }, to: { h: 4, m: 30 } }} />);
    expect(text('.lab-status')).toContain('1 საათი და 30 წუთი');
    expect(text('.lab-status')).toContain('90 წუთი');
    expect(text('.lab-facts')).toContain('სულ წუთები: 90');
  });

  it('moving the end clock changes the elapsed time', () => {
    render(<ElapsedLab tool={{ tool: 'elapsed-lab', from: { h: 3, m: 0 }, to: { h: 4, m: 30 } }} />);
    fireEvent.click(screen.getByRole('button', { name: 'დასასრული 30 წუთით უკან' }));
    expect(text('.lab-facts')).toContain('საათები: 1');
    expect(text('.lab-facts')).toContain('წუთები: 0');
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
    case 'weekday-of':
      fireEvent.click(screen.getByRole('button', { name: weekdayName(weekdayOf(r.date)) }));
      break;
    case 'days-between':
      fireEvent.change(screen.getByLabelText('დღეები'), { target: { value: String(daysBetween(r.from, r.to)) } });
      break;
    case 'elapsed': {
      const minutes = minutesBetween(r.from, r.to);
      fireEvent.change(screen.getByLabelText('საათი'), { target: { value: String(Math.floor(minutes / 60)) } });
      fireEvent.change(screen.getByLabelText('წუთი'), { target: { value: String(minutes % 60) } });
      break;
    }
    case 'read-clock': {
      const idx = r.options.findIndex((o) => o.h === r.time.h && o.m === r.time.m);
      radio(idx);
      break;
    }
    case 'match-time': {
      // tap the analogue clock, then tap the digital time that reads the same
      r.faces.forEach((face, i) => {
        const wanted = `${face.h}:${String(face.m).padStart(2, '0')}`;
        const display = r.displays.indexOf(wanted);
        expect(display, `display for ${wanted}`).toBeGreaterThanOrEqual(0);
        fireEvent.click(screen.getByRole('button', { name: new RegExp(`^ანალოგური საათი ${i + 1}`) }));
        fireEvent.click(screen.getByRole('button', { name: new RegExp(`^ციფრული დრო ${display + 1}:`) }));
      });
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

describe('g2-u08 unit page', () => {
  it('lists the five lessons, all playable and in order', () => {
    go('#/student/lessons/g2-u08');
    const list = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(list).toHaveLength(5);
    U08.forEach((id, i) => expect(within(list[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
  });
});

describe.each(U08.map((id) => [id] as const))('%s plays to the end', (id) => {
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
    if (n < 5) expect(screen.getByRole('link', { name: `გაგრძელება: U08.${n + 1}` }).getAttribute('href')).toBe(`#/student/lessons/g2-u08-l${n + 1}`);
    else expect(screen.getByRole('link', { name: 'U08-ზე დაბრუნება' })).toBeTruthy();
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

  it('a wrong weekday is answered with the real one', () => {
    upTo('g2-u08-l1', 'check-1');
    fireEvent.click(screen.getByRole('button', { name: 'ორშაბათი' }));
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('ოთხშაბათი');
  });

  it('a wrong day count is answered with the weeks it really is', () => {
    upTo('g2-u08-l3', 'check-1');
    fireEvent.change(screen.getByLabelText('დღეები'), { target: { value: '8' } });
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('1 კვირა');
  });

  it('elapsed time off by an hour is told what the real time is', () => {
    upTo('g2-u08-l5', 'check-1');
    fireEvent.change(screen.getByLabelText('საათი'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('წუთი'), { target: { value: '0' } });
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('30');
  });
});

describe('style: motion, layout and honest labels', () => {
  const css = readFileSync('src/lessons/learn.css', 'utf8');
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));

  it('the calendar cells are switched off under reduced motion', () => {
    expect(reduced).toContain('.cal-grid td');
    expect(reduced).toContain('.cal-day');
  });

  it('the calendar boards have their own layout and a phone width', () => {
    expect(css).toContain('.cal-grid');
    expect(css).toContain('.dsp-inputs');
    expect(css).toContain('.lab-calendar');
    const small = css.slice(css.lastIndexOf('@media (max-width: 560px)'));
    expect(small).toContain('.cal-grid td');
  });

  it('every day cell is named by its date and weekday, never only by position', () => {
    render(<CalendarBoard year={2025} month={3} />);
    const cells = Array.from(document.querySelectorAll('.cal-grid td')).filter((c) => c.textContent === '1');
    expect(cells[0].getAttribute('aria-label')).toBe('1 — შაბათი');
  });
});
