/**
 * G2 U08 — days, weeks, months and elapsed time.
 *
 * A date is three whole numbers (year, month, day) and everything else here is *computed* from them: which weekday a
 * date falls on, how many days two dates are apart, which cells a month occupies on a grid. Nothing is stored twice,
 * so a calendar can never show 5 March on a Tuesday in one place and a Wednesday in another.
 *
 * **Nothing reads the system clock.** A lesson that asked "what is today?" would give a different answer tomorrow, and
 * a test that asked it would be testing the machine rather than the arithmetic. Every date in this unit is written
 * into the content, and every weekday is derived from `dayNumber`.
 */

// ─────────────────────────── the week ───────────────────────────

/** Monday first, as Georgian calendars print it. The order is the unit: index 0 is the first day of the week. */
export const WEEKDAYS = ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი', 'კვირა'] as const;

/** Three-letter forms for a calendar's column headings. */
export const WEEKDAY_SHORT = ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'] as const;

export const DAYS_IN_WEEK = 7;
export const WEEKEND: readonly number[] = [5, 6];

/** Puts any weekday number back into 0…6, so "two days after Saturday" is never 8. */
export const weekdayIndex = (n: number): number => ((Math.round(n) % DAYS_IN_WEEK) + DAYS_IN_WEEK) % DAYS_IN_WEEK;

/** The day `steps` days after `start` (negative counts back); the week wraps round. */
export const dayAfter = (start: number, steps: number): number => weekdayIndex(weekdayIndex(start) + steps);

/** `weekdayIndex(-1)` is 6, so "the day before Monday" is კვირა rather than an error. */
export const dayBefore = (start: number, steps = 1): number => dayAfter(start, -steps);

export const isWeekendDay = (day: number): boolean => WEEKEND.includes(weekdayIndex(day));

/** Whether a weekday is a school day (Monday to Friday). */
export const isWeekday = (day: number): boolean => !isWeekendDay(day);

/** `ორშაბათი` … `კვირა`. */
export const weekdayName = (day: number): string => WEEKDAYS[weekdayIndex(day)];

/** The two weekend days, in week order. */
export const weekendNames = (): string[] => WEEKEND.map((d) => WEEKDAYS[d]);

/** Days in a week, written the way the unit says it: „7 დღე“. */
export const weekLengthText = 'კვირაში 7 დღეა';

/** „1 დღე“ / „3 დღე“ — a count of days with its noun. */
export function daysText(n: number): string {
  if (n === 1) return '1 დღე';
  return `${n} დღე`;
}

/** „1 კვირა“ / „2 კვირა“ — the week itself, not the days inside it. */
export function weeksText(n: number): string {
  if (n === 1) return '1 კვირა';
  return `${n} კვირა`;
}

// ─────────────────────────── months ───────────────────────────

export const MONTHS = [
  'იანვარი',
  'თებერვალი',
  'მარტი',
  'აპრილი',
  'მაისი',
  'ივნისი',
  'ივლისი',
  'აგვისტო',
  'სექტემბერი',
  'ოქტომბერი',
  'ნოემბერი',
  'დეკემბერი',
] as const;

export const MONTHS_IN_YEAR = 12;

/** How long each month usually is. February is the one that changes, and only in a leap year. */
const USUAL_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** A year is a leap year when it can be divided by 4 — 2024 was one, 2025 is not. */
export const isLeapYear = (year: number): boolean => year % 4 === 0;

/** The month as the unit writes it: 1 = იანვარი. */
export const monthName = (month: number): string => MONTHS[((Math.round(month) - 1) % 12 + 12) % 12];

/** How many days the month has — February has 29 in a leap year and 28 otherwise. */
export function monthLength(month: number, year = 2025): number {
  const index = ((Math.round(month) - 1) % 12 + 12) % 12;
  if (index === 1 && isLeapYear(year)) return 29;
  return USUAL_LENGTHS[index];
}

/** Every month's length in one year, in order. */
export const monthLengths = (year = 2025): number[] => MONTHS.map((_, i) => monthLength(i + 1, year));

/** The months that are 30 days long, and the ones that are 31 — the point that months are *not* all equal. */
export const monthsOfLength = (length: number, year = 2025): string[] =>
  MONTHS.filter((_, i) => monthLength(i + 1, year) === length);

/** „იანვარში 31 დღეა“ — a month's length as a sentence. */
export const monthLengthText = (month: number, year = 2025): string => `${monthName(month)}ში ${monthLength(month, year)} დღეა`;

// ─────────────────────────── dates ───────────────────────────

/** A calendar date. Months are 1–12, days 1–31 — the numbers printed on the wall, not array indices. */
export interface CalDate {
  year: number;
  month: number;
  day: number;
}

export const dateOf = (year: number, month: number, day: number): CalDate => ({ year, month, day });

export const sameDate = (a: CalDate, b: CalDate): boolean => a.year === b.year && a.month === b.month && a.day === b.day;

/**
 * A date as one whole number of days, counted from a fixed point long ago. Used only by subtraction, so the choice of
 * starting point does not matter — only that it is the same for every date.
 */
export function dayNumber(date: CalDate): number {
  const y = date.year - 1;
  let days = 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400);
  for (let m = 1; m < date.month; m += 1) days += monthLength(m, date.year);
  return days + date.day;
}

/**
 * Which weekday a date falls on: 0 is Monday. Derived from `dayNumber`, so every date in the unit agrees with every
 * other one — 1 January 2025 is a Wednesday because the arithmetic says so, not because a lesson claims it.
 */
export const weekdayOf = (date: CalDate): number => weekdayIndex(dayNumber(date) + 6);

/** The weekday of a date, in words. */
export const weekdayOfName = (date: CalDate): string => weekdayName(weekdayOf(date));

/** The date `count` days later (negative counts back), rolling over months and years. */
export function addDays(date: CalDate, count: number): CalDate {
  let { year, month, day } = date;
  let left = Math.round(count);
  while (left > 0) {
    day += 1;
    if (day > monthLength(month, year)) {
      day = 1;
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
    left -= 1;
  }
  while (left < 0) {
    day -= 1;
    if (day < 1) {
      month -= 1;
      if (month < 1) {
        month = 12;
        year -= 1;
      }
      day = monthLength(month, year);
    }
    left += 1;
  }
  return { year, month, day };
}

/** Days from `a` to `b`, counted the way the calendar counts them: 5 March to 12 March is 7 days. */
export const daysBetween = (a: CalDate, b: CalDate): number => dayNumber(b) - dayNumber(a);

/** Whole weeks between two dates, and the days left over. 10 days is one week and 3 days. */
export function weeksAndDays(a: CalDate, b: CalDate): { weeks: number; days: number } {
  const total = daysBetween(a, b);
  return { weeks: Math.floor(Math.abs(total) / DAYS_IN_WEEK) * Math.sign(total), days: Math.abs(total) % DAYS_IN_WEEK };
}

/** „7 დღე = 1 კვირა“ — a count of days written as weeks too. */
export function weeksTextOf(days: number): string {
  if (days < DAYS_IN_WEEK) return daysText(days);
  const weeks = Math.floor(days / DAYS_IN_WEEK);
  const rest = days % DAYS_IN_WEEK;
  return rest === 0 ? `${daysText(days)} = ${weeksText(weeks)}` : `${daysText(days)} = ${weeksText(weeks)} და ${daysText(rest)}`;
}

/** `5 მარტი` — the date without the year. */
export const dateText = (date: CalDate): string => `${date.day} ${monthName(date.month)}`;

/** `5 მარტი, 2025` — the date with the year. */
export const dateFullText = (date: CalDate): string => `${dateText(date)}, ${date.year}`;

/** `5 მარტი, 2025 — ოთხშაბათი` — the date and the weekday it really falls on. */
export const dateWithWeekday = (date: CalDate): string => `${dateFullText(date)} — ${weekdayOfName(date)}`;

/** Which day a date is, measured from a stated today: yesterday (−1), today (0), tomorrow (+1), or neither. */
export function dayRelation(date: CalDate, today: CalDate): -1 | 0 | 1 | null {
  const gap = daysBetween(today, date);
  return gap === -1 ? -1 : gap === 0 ? 0 : gap === 1 ? 1 : null;
}

/** „გუშინ“ / „დღეს“ / „ხვალ“ — the name of a date relative to a stated today. */
export function relationWord(date: CalDate, today: CalDate): string {
  const rel = dayRelation(date, today);
  return rel === -1 ? 'გუშინ' : rel === 0 ? 'დღეს' : rel === 1 ? 'ხვალ' : dateText(date);
}

/** The same day number in another month, or `null` when that month is too short (31 April does not exist). */
export function sameDayNextMonth(date: CalDate): CalDate | null {
  const month = date.month === 12 ? 1 : date.month + 1;
  const year = date.month === 12 ? date.year + 1 : date.year;
  return date.day <= monthLength(month, year) ? { year, month, day: date.day } : null;
}

// ─────────────────────────── the calendar grid ───────────────────────────

/** One cell of a month grid; `null` is a padding cell before the 1st or after the last day. */
export type GridCell = CalDate | null;

/**
 * A month laid out as weeks of seven, Monday first. The 1st sits under its own weekday (computed, never typed in),
 * and the weeks before and after it are padded with `null` so every row has exactly seven cells.
 */
export function monthGrid(year: number, month: number): GridCell[][] {
  const first = { year, month, day: 1 };
  const lead = weekdayOf(first);
  const length = monthLength(month, year);
  const cells: GridCell[] = [];
  for (let i = 0; i < lead; i += 1) cells.push(null);
  for (let d = 1; d <= length; d += 1) cells.push({ year, month, day: d });
  while (cells.length % DAYS_IN_WEEK !== 0) cells.push(null);
  const weeks: GridCell[][] = [];
  for (let i = 0; i < cells.length; i += DAYS_IN_WEEK) weeks.push(cells.slice(i, i + DAYS_IN_WEEK));
  return weeks;
}

/** Every date of a month, in order. */
export const datesOfMonth = (year: number, month: number): CalDate[] =>
  Array.from({ length: monthLength(month, year) }, (_, i) => ({ year, month, day: i + 1 }));

/** The dates of a month that fall on a given weekday. March 2025 has five Saturdays. */
export const datesOnWeekday = (year: number, month: number, day: number): number[] =>
  datesOfMonth(year, month)
    .filter((d) => weekdayOf(d) === weekdayIndex(day))
    .map((d) => d.day);

/** How many times a weekday occurs in a month — four or five, never six. */
export const weekdayCount = (year: number, month: number, day: number): number => datesOnWeekday(year, month, day).length;

/** The week that contains a date, Monday first. Missing days outside the month are `null`. */
export function weekOf(date: CalDate): GridCell[] {
  const monday = addDays(date, -weekdayOf(date));
  return Array.from({ length: DAYS_IN_WEEK }, (_, i) => addDays(monday, i));
}

/** The first and last date of a month, for spans. */
export const monthEnds = (year: number, month: number): { first: CalDate; last: CalDate } => ({
  first: { year, month, day: 1 },
  last: { year, month, day: monthLength(month, year) },
});

// ─────────────────────────── elapsed time on the clock ───────────────────────────

/**
 * Elapsed time is a subtraction of two clock times, and it is only ever stated in whole hours and half hours in this
 * unit: 3:00 → 4:30 is 1 hour 30 minutes. `minutesBetween` lives in `ClockGeometry`; this is the sentence around it.
 */
export function elapsedText(minutes: number): string {
  const total = Math.abs(Math.round(minutes));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins} წუთი`;
  if (mins === 0) return hours === 1 ? '1 საათი' : `${hours} საათი`;
  return `${hours === 1 ? '1 საათი' : `${hours} საათი`} და ${mins} წუთი`;
}

/** The elapsed time written as clock arithmetic too: „1 საათი და 30 წუთი = 90 წუთი“. */
export function elapsedFullText(minutes: number): string {
  const total = Math.abs(Math.round(minutes));
  if (total < 60) return elapsedText(total);
  return `${elapsedText(total)} (${total} წუთი)`;
}
