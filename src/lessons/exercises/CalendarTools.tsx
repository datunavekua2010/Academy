import { useState } from 'react';
import type { ExplainBlock, ExploreTool } from '../types';
import { DemoButtons, useStepper } from './Visuals';
import { CalendarBoard, DateSpanPicture, WeekStrip } from './CalendarBoard';
import { addDays, dateText, dateWithWeekday, daysBetween, monthGrid, monthLength, monthName, weekdayName, weekdayOf, weeksTextOf } from './CalendarGeometry';
import { ClockFace } from './ClockBoard';
import { addMinutes, minutesBetween, spokenTime, timeOf } from './ClockGeometry';

/**
 * Exploration labs and demonstrations for G2 U08.
 *
 * Every weekday and every landing is computed from the date the lab starts on, so walking a month one day at a time is
 * the same arithmetic the questions are marked with. Nothing here reads today's date.
 */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;

// ─────────────────────────── the calendar walker ───────────────────────────

/** Walk a month one day at a time and read each date with its weekday. */
export function CalendarLab({ tool }: { tool: ToolOf<'calendar-lab'> }) {
  const [year, setYear] = useState(tool.year);
  const [month, setMonth] = useState(tool.month);
  const [day, setDay] = useState(tool.day);
  const [mode, setMode] = useState<'week' | 'month'>('week');
  const length = monthLength(month, year);

  const move = (delta: number) => {
    const next = day + delta;
    if (next < 1) {
      const pm = month === 1 ? 12 : month - 1;
      const py = month === 1 ? year - 1 : year;
      setYear(py);
      setMonth(pm);
      setDay(monthLength(pm, py));
    } else if (next > length) {
      const nm = month === 12 ? 1 : month + 1;
      const ny = month === 12 ? year + 1 : year;
      setYear(ny);
      setMonth(nm);
      setDay(1);
    } else {
      setDay(next);
    }
  };

  const date = { year, month, day };
  return (
    <div className="lab lab-calendar">
      <div className="xt-modes" role="group" aria-label="ხედი">
        <button type="button" className={`xt-mode ${mode === 'week' ? 'is-on' : ''}`} aria-pressed={mode === 'week'} onClick={() => setMode('week')}>
          კვირა
        </button>
        <button type="button" className={`xt-mode ${mode === 'month' ? 'is-on' : ''}`} aria-pressed={mode === 'month'} onClick={() => setMode('month')}>
          თვე
        </button>
      </div>
      {mode === 'week' ? <WeekStrip date={date} mark={weekdayOf(date)} /> : <CalendarBoard year={year} month={month} highlight={[day]} />}
      <div className="xt-row">
        <button type="button" className="btn btn-ghost" onClick={() => move(-1)} aria-label="ერთი დღით უკან">
          ← უკან
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => move(1)} aria-label="ერთი დღით წინ">
          წინ →
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => move(7)} aria-label="ერთი კვირით წინ">
          +7 დღე
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setYear(tool.year);
            setMonth(tool.month);
            setDay(tool.day);
          }}
        >
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {dateWithWeekday(date)}. {monthName(month)}ში {length} დღეა.
      </p>
      <p className="lab-facts">
        <span>თვე: {monthName(month)}</span>
        <span>დღე: {day}</span>
        <span>კვირის დღე: {weekdayName(weekdayOf(date))}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── the elapsed-time lab ───────────────────────────

/** Move two clock times apart and back, watching the time between them. */
export function ElapsedLab({ tool }: { tool: ToolOf<'elapsed-lab'> }) {
  const [from, setFrom] = useState(tool.from);
  const [to, setTo] = useState(tool.to);
  const minutes = minutesBetween(from, to);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const nudge = (which: 'from' | 'to', delta: number) => {
    if (which === 'from') setFrom(addMinutes(from, delta));
    else setTo(addMinutes(to, delta));
  };
  return (
    <div className="lab lab-elapsed">
      <div className="elb-clocks">
        <div className="elb-clock">
          <span className="elb-name">დასაწყისი</span>
          <ClockFace time={from} size={132} label={`დასაწყისი: ${spokenTime(from)}`} />
          <span className="elb-time">{spokenTime(from)}</span>
          <div className="xt-row">
            <button type="button" className="btn btn-ghost" onClick={() => nudge('from', -30)} aria-label="დასაწყისი 30 წუთით უკან">
              −30 წთ
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => nudge('from', 30)} aria-label="დასაწყისი 30 წუთით წინ">
              +30 წთ
            </button>
          </div>
        </div>
        <div className="elb-clock">
          <span className="elb-name">დასასრული</span>
          <ClockFace time={to} size={132} label={`დასასრული: ${spokenTime(to)}`} />
          <span className="elb-time">{spokenTime(to)}</span>
          <div className="xt-row">
            <button type="button" className="btn btn-ghost" onClick={() => nudge('to', -30)} aria-label="დასასრული 30 წუთით უკან">
              −30 წთ
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => nudge('to', 30)} aria-label="დასასრული 30 წუთით წინ">
              +30 წმ
            </button>
          </div>
        </div>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {`${spokenTime(from)}-დან ${spokenTime(to)}-მდე გავიდა ${hours} საათი და ${rest} წუთი — სულ ${minutes} წუთი.`}
      </p>
      <p className="lab-facts">
        <span>საათები: {hours}</span>
        <span>წუთები: {rest}</span>
        <span>სულ წუთები: {minutes}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── demonstrations ───────────────────────────

/** A month walked one day at a time, or a week read round, or a count across a span. */
export function CalendarDemo({ block }: { block: Extract<ExplainBlock, { type: 'calendar-demo' }> }) {
  const { frame, done, replay, step } = useStepper(block.steps.length);
  const date = addDays({ year: block.year, month: block.month, day: block.day }, block.mode === 'count' ? frame * 7 : frame);
  const caption = block.steps[Math.min(frame, block.steps.length - 1)];
  return (
    <figure className="demo demo-calendar">
      <span className="demo-badge">{block.mode === 'week' ? 'კვირა' : block.mode === 'month' ? 'თვე' : 'თვლა'}</span>
      {block.mode === 'count' ? (
        <DateSpanPicture from={{ year: block.year, month: block.month, day: block.day }} to={date} showDays={frame === block.steps.length - 1} />
      ) : (
        <WeekStrip date={date} mark={weekdayOf(date)} />
      )}
      <p className="demo-rule">{`${dateWithWeekday(date)}`}</p>
      <p className="demo-cap">{caption}</p>
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** Two clocks with the time between them counted. */
export function ElapsedDemo({ block }: { block: Extract<ExplainBlock, { type: 'elapsed-demo' }> }) {
  const { frame, done, replay, step } = useStepper(block.steps.length);
  const total = minutesBetween(block.from, block.to);
  const shown = Math.min(frame, block.steps.length - 1);
  const at = addMinutes(block.from, Math.round((total * shown) / Math.max(1, block.steps.length - 1)));
  return (
    <figure className="demo demo-elapsed">
      <div className="elb-clocks">
        <ClockFace time={block.from} size={120} label={`დასაწყისი: ${spokenTime(block.from)}`} />
        <span className="elb-arrow" aria-hidden="true">
          →
        </span>
        <ClockFace time={at} size={120} label={`ახლა: ${spokenTime(at)}`} />
        <span className="elb-arrow" aria-hidden="true">
          →
        </span>
        <ClockFace time={block.to} size={120} label={`დასასრული: ${spokenTime(block.to)}`} />
      </div>
      <p className="demo-rule">{`გავიდა ${Math.floor(total / 60)} საათი და ${total % 60} წუთი`}</p>
      <p className="demo-cap">{block.steps[shown]}</p>
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** The date-step sentence used by the calendar labs' answer control. */
export const calendarFact = (from: { year: number; month: number; day: number }, count: number): string => {
  const landing = addDays(from, count);
  return `${dateText(from)} + ${count} დღე = ${dateText(landing)}`;
};

/** Days between two stated dates, as the lab says it. */
export const spanFact = (a: { year: number; month: number; day: number }, b: { year: number; month: number; day: number }): string =>
  weeksTextOf(daysBetween(a, b));

/** The number of weeks a month spans on the grid — a month is four or five rows, never six. */
export const gridRows = (year: number, month: number): number => monthGrid(year, month).length;

/** Used by the lessons' explanations: a clock time and the same time half an hour later. */
export const halfHourLater = (time: { h: number; m: number }) => addMinutes(timeOf(time.h, time.m), 30);
