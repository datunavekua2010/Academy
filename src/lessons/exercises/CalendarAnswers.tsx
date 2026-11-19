import type { CalDate } from './CalendarGeometry';
import { addDays, dateText, daysBetween, weekdayName, weekdayOf, weeksTextOf } from './CalendarGeometry';

/**
 * Answer controls for G2 U08.1–U08.3: stepping a date, naming a weekday, and counting the days between two dates.
 *
 * The boards never say whether an answer is right — `check.ts` does that from the dates themselves.
 */

/** Three typed numbers, written the way a date is written: year, month, day. */
export function DateStepAnswer({
  value,
  onChange,
  disabled,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  label: string;
}) {
  const [y = '', m = '', d = ''] = value.split(',');
  const put = (next: number, text: string) => {
    const parts = [y, m, d];
    parts[next] = text;
    onChange(parts.join(','));
  };
  return (
    <div className="dsp-answer">
      <div className="dsp-inputs" role="group" aria-label={label}>
        <label className="dsp-slot">
          <span>წელი</span>
          <input inputMode="numeric" value={y} disabled={disabled} onChange={(e) => put(0, e.target.value)} aria-label="წელი" />
        </label>
        <label className="dsp-slot">
          <span>თვე</span>
          <input inputMode="numeric" value={m} disabled={disabled} onChange={(e) => put(1, e.target.value)} aria-label="თვე" />
        </label>
        <label className="dsp-slot">
          <span>დღე</span>
          <input inputMode="numeric" value={d} disabled={disabled} onChange={(e) => put(2, e.target.value)} aria-label="დღე" />
        </label>
      </div>
    </div>
  );
}

/** Monday to Sunday as buttons; the student taps the weekday the date falls on. */
export function WeekdayAnswer({
  value,
  onChange,
  disabled,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <div className="dsp" role="group" aria-label={label}>
      <div className="dsp-days">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <button
            key={i}
            type="button"
            className={`btn ${value === String(i) ? 'btn-primary' : 'btn-ghost'} dsp-day`}
            aria-pressed={value === String(i)}
            disabled={disabled}
            onClick={() => onChange(String(i))}
          >
            {weekdayName(i)}
          </button>
        ))}
      </div>
    </div>
  );
}

/** One number: how many days apart two dates are, with the two dates drawn above it. */
export function DaysBetweenAnswer({
  from,
  to,
  value,
  onChange,
  disabled,
  label,
}: {
  from: CalDate;
  to: CalDate;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  label: string;
}) {
  const days = daysBetween(from, to);
  return (
    <div className="dsp">
      <ol className="dsp-track" aria-label="ორი თარიღი">
        <li className="dsp-stop" aria-label={`${dateText(from)}, ${weekdayName(weekdayOf(from))}`}>
          <b>{dateText(from)}</b>
          <small>{weekdayName(weekdayOf(from))}</small>
        </li>
        <li className="dsp-arrowmid" aria-hidden="true">
          →
        </li>
        <li className="dsp-stop" aria-label={`${dateText(to)}, ${weekdayName(weekdayOf(to))}`}>
          <b>{dateText(to)}</b>
          <small>{weekdayName(weekdayOf(to))}</small>
        </li>
      </ol>
      <div className="dsp-inputs">
        <label className="dsp-slot">
          <span>დღეები</span>
          <input inputMode="numeric" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} aria-label={label} />
        </label>
        <span className="dsp-unit">დღე</span>
      </div>
      <p className="dsp-hint" aria-live="polite">
        {value === '' ? 'დათვალე დღეები ორ თარიღს შორის.' : `${weeksTextOf(days)} — შემოწმებისას გამოჩნდება.`}
      </p>
    </div>
  );
}

/** The date a step lands on, said in words — used under the stepper in the calendar lab. */
export const stepSentence = (from: CalDate, count: number): string => {
  const landing = addDays(from, count);
  return `${dateText(from)} ${count >= 0 ? `+ ${count}` : `− ${Math.abs(count)}`} = ${dateText(landing)} (${weekdayName(weekdayOf(landing))})`;
};
