import type { CalDate } from './CalendarGeometry';
import {
  DAYS_IN_WEEK,
  MONTHS,
  WEEKDAYS,
  WEEKDAY_SHORT,
  addDays,
  dateFullText,
  dateText,
  dayRelation,
  daysBetween,
  daysText,
  monthGrid,
  monthLength,
  monthLengthText,
  weekdayCount,
  weekdayName,
  weekdayOf,
  weeksTextOf,
  weekOf,
} from './CalendarGeometry';

/**
 * Pictures for G2 U08: a month as a grid, a date with its weekday, and the days between two dates.
 *
 * Every weekday printed here is computed from the date it is printed under, so the calendar on screen and the answer
 * the lesson expects can never disagree. Nothing reads the system clock.
 */

const cellDate = (cell: CalDate | null): string => (cell ? String(cell.day) : '');

const cellLabel = (cell: CalDate | null, year: number, month: number): string => {
  if (!cell) return '';
  const inMonth = cell.month === month && cell.year === year;
  return `${cell.day}${inMonth ? '' : ` ${MONTHS[cell.month - 1]}`} — ${weekdayName(weekdayOf(cell))}`;
};

/** A month laid out as weeks, Monday first. Days can be marked, and a whole weekday column highlighted. */
export function CalendarBoard({
  year,
  month,
  highlight = [],
  markWeekday,
  markToday,
  caption,
  label,
}: {
  year: number;
  month: number;
  highlight?: number[];
  markWeekday?: number;
  markToday?: number;
  caption?: string;
  label?: string;
}) {
  const weeks = monthGrid(year, month);
  const name = MONTHS[month - 1];
  return (
    <figure className="cal" aria-label={label ?? `${name} ${year}: კალენდარი`}>
      <figcaption className="cal-title">
        <b>{name}</b> <span>{year}</span>
      </figcaption>
      <table className="cal-grid">
        <thead>
          <tr>
            {WEEKDAY_SHORT.map((short, i) => (
              <th key={short} scope="col" className={markWeekday === i ? 'is-marked' : ''} aria-label={WEEKDAYS[i]}>
                {short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, w) => (
            <tr key={w}>
              {week.map((cell, d) => {
                const marks = [
                  cell && highlight.includes(cell.day) ? 'is-hi' : '',
                  cell && markToday === cell.day ? 'is-today' : '',
                  cell && cell.month !== month ? 'is-out' : '',
                  markWeekday === d ? 'is-column' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <td key={d} className={marks} aria-label={cellLabel(cell, year, month) || undefined}>
                    {cellDate(cell)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="cal-note">{monthLengthText(month, year)} · კვირაში {DAYS_IN_WEEK} დღე</p>
      {caption && <figcaption className="cal-cap">{caption}</figcaption>}
    </figure>
  );
}

/** The seven days of one week, each with its weekday name — the unit's "week" picture. */
export function WeekStrip({ date, mark }: { date: CalDate; mark?: number }) {
  const week = weekOf(date);
  return (
    <ol className="cal-week" aria-label="კვირის შვიდი დღე">
      {week.map((cell, i) => (
        <li key={i} className={`cal-day ${mark === i ? 'is-on' : ''} ${weekdayOf(date) === i ? 'is-today' : ''}`} aria-label={`${weekdayName(i)}${cell ? `: ${dateText(cell)}` : ''}`}>
          <span className="cal-day-name">{WEEKDAYS[i]}</span>
          <span className="cal-day-num">{cell ? cell.day : '·'}</span>
        </li>
      ))}
    </ol>
  );
}

/** Two dates and, when it is right to show it, how far apart they are. */
export function DateSpanPicture({ from, to, showDays, caption }: { from: CalDate; to: CalDate; showDays?: boolean; caption?: string }) {
  const days = daysBetween(from, to);
  return (
    <figure className="dsp" aria-label={`${dateFullText(from)} — ${dateFullText(to)}`}>
      <div className="dsp-row">
        <span className="dsp-date">
          <b>{dateText(from)}</b>
          <small>{weekdayName(weekdayOf(from))}</small>
        </span>
        <span className="dsp-arrow" aria-hidden="true">
          →
        </span>
        <span className="dsp-date">
          <b>{dateText(to)}</b>
          <small>{weekdayName(weekdayOf(to))}</small>
        </span>
      </div>
      <p className="dsp-note">{showDays ? `${weeksTextOf(days)} — სულ ${daysText(days)}` : 'რამდენი დღეა?'}</p>
      {caption && <figcaption className="dsp-cap">{caption}</figcaption>}
    </figure>
  );
}

/** A single date, big, with the weekday it really falls on underneath. */
export function DateCard({ date, caption }: { date: CalDate; caption?: string }) {
  return (
    <figure className="dsp dsp-card" aria-label={dateFullText(date)}>
      <p className="dsp-big">{date.day}</p>
      <p className="dsp-month">
        {MONTHS[date.month - 1]} {date.year}
      </p>
      <p className="dsp-weekday">{weekdayName(weekdayOf(date))}</p>
      {caption && <figcaption className="dsp-cap">{caption}</figcaption>}
    </figure>
  );
}

/** Yesterday / today / tomorrow around a stated today. The three dates are computed, never typed. */
export function AroundToday({ today }: { today: CalDate }) {
  const dates: Array<{ date: CalDate; word: string }> = [
    { date: addDays(today, -1), word: 'გუშინ' },
    { date: today, word: 'დღეს' },
    { date: addDays(today, 1), word: 'ხვალ' },
  ];
  return (
    <figure className="dsp" aria-label="გუშინ, დღეს და ხვალ">
      <ol className="atm-row">
        {dates.map(({ date, word }) => (
          <li key={word} className={`atm-cell ${dayRelation(date, today) === 0 ? 'is-today' : ''}`} aria-label={`${word}: ${dateFullText(date)} (${weekdayName(weekdayOf(date))})`}>
            <span className="atm-word">{word}</span>
            <span className="atm-date">{dateText(date)}</span>
            <span className="atm-day">{weekdayName(weekdayOf(date))}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/** How many times a weekday occurs in a month, and on which days. */
export function WeekdayTally({ year, month, day }: { year: number; month: number; day: number }) {
  const count = weekdayCount(year, month, day);
  return (
    <p className="cal-tally" aria-live="polite">
      {weekdayName(day)} {MONTHS[month - 1]}-ში {count}-ჯერ მოდის.
    </p>
  );
}

/** A month's length, said plainly, with February's exception named. */
export const lengthSentence = (month: number, year = 2025): string => `${MONTHS[month - 1]} — ${monthLength(month, year)} დღე`;
