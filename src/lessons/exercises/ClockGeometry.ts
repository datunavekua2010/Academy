/**
 * U07 clock geometry — pure, exact, and testable without a layout engine.
 *
 * One drawing rule for the whole unit: **angles are numbers**. A time of day is stored as an hour (1–12) and a
 * minute (0–59), and every hand position is computed from that time. Nothing here reads a hand off a picture.
 *
 * The hour hand is the interesting one: at half past three it is exactly halfway between 3 and 4, because it has
 * travelled half of the next hour. That is a physical fact, and it is what the half-past lesson is about.
 */

/** Minutes in one full turn of the minute hand. */
export const MIN_PER_HOUR = 60;
/** Numbers on a clock face. */
export const HOURS_ON_FACE = 12;
/** Degrees the minute hand turns in one minute (360 / 60). */
export const DEG_PER_MINUTE = 6;
/** Degrees the hour hand turns in one hour (360 / 12). */
export const DEG_PER_HOUR = 30;
/** Degrees the hour hand turns in one minute (30 / 60): the hand creeps as the minutes pass. */
export const DEG_PER_HOUR_MINUTE = 0.5;

/** A time shown on a clock face: an hour (1–12) and a minute (0–59). */
export interface ClockTime {
  h: number;
  m: number;
}

export const pad2 = (n: number): string => String(n).padStart(2, '0');

/** An hour folded onto the face: 13 → 1, 0 → 12. */
export const normalHour = (h: number): number => ((Math.round(h) - 1) % HOURS_ON_FACE + HOURS_ON_FACE) % HOURS_ON_FACE + 1;

/** A minute folded onto the face: 75 → 15. */
export const normalMinute = (m: number): number => ((Math.round(m) % MIN_PER_HOUR) + MIN_PER_HOUR) % MIN_PER_HOUR;

export const timeOf = (h: number, m = 0): ClockTime => ({ h: normalHour(h), m: normalMinute(m) });

export const sameTime = (a: ClockTime, b: ClockTime): boolean => a.h === b.h && a.m === b.m;

/** Where the minute hand points, in degrees clockwise from 12. */
export const minuteAngle = (m: number): number => normalMinute(m) * DEG_PER_MINUTE;

/**
 * Where the hour hand points, in degrees clockwise from 12. It is not simply `hour * 30`: the hand also moves
 * with the minutes, so at 3:30 it sits halfway between 3 and 4 (105°, not 90°).
 */
export const hourAngle = (time: ClockTime): number => (normalHour(time.h) % HOURS_ON_FACE) * DEG_PER_HOUR + normalMinute(time.m) * DEG_PER_HOUR_MINUTE;

export const handsOf = (time: ClockTime): { hour: number; minute: number } => ({ hour: hourAngle(time) % 360, minute: minuteAngle(time.m) });

export const isOClock = (time: ClockTime): boolean => normalMinute(time.m) === 0;
export const isHalfPast = (time: ClockTime): boolean => normalMinute(time.m) === 30;
/** Times the five-minute lessons use: the minute hand sits exactly on a number. */
export const isFiveMinute = (time: ClockTime): boolean => normalMinute(time.m) % 5 === 0;

/** Where the hour hand sits between two numbers: 3.5 at half past three, 3 at three o'clock. */
export const hourHandBetween = (time: ClockTime): number => normalHour(time.h) + normalMinute(time.m) / MIN_PER_HOUR;

/** The number the minute hand points at (12 when it points at the top). */
export const minuteHandNumber = (time: ClockTime): number => {
  const steps = normalMinute(time.m) / 5;
  return steps === 0 ? 12 : steps;
};

/** The numbers a minute hand passes on its way to `m`, counting by fives: 30 → [5, 10, 15, 20, 25, 30]. */
export const fivesTo = (m: number): number[] => {
  const top = Math.floor(normalMinute(m) / 5) * 5;
  return Array.from({ length: top / 5 }, (_, i) => (i + 1) * 5);
};

// ─────────────────────────── writing a time ───────────────────────────

/** The digital form: `3:00`, `3:30`, `3:05`. */
export const digitalText = (time: ClockTime): string => `${normalHour(time.h)}:${pad2(normalMinute(time.m))}`;

/** The digital form with the leading zero kept: `03:30` (what a digital clock often shows). */
export const digitalPad = (time: ClockTime): string => `${pad2(normalHour(time.h))}:${pad2(normalMinute(time.m))}`;

/**
 * The time in Georgian words: `3 საათი` (o'clock), `3 საათი და ნახევარი` (half past), `3 საათი და 20 წუთი`.
 * A measurement of time is never a bare number.
 */
export function spokenTime(time: ClockTime): string {
  const h = normalHour(time.h);
  const m = normalMinute(time.m);
  if (m === 0) return `${h} საათი`;
  if (m === 30) return `${h} საათი და ნახევარი`;
  if (m === 15) return `${h} საათი და თხუთმეტი წუთი`;
  return `${h} საათი და ${m} წუთი`;
}

/** `3 საათი და ნახევარი (3:30)` — words and digits together. */
export const timeText = (time: ClockTime): string => `${spokenTime(time)} (${digitalText(time)})`;

/** Reads a digital display back into a time, or `null` if it is not a clock time. */
export function parseDigital(text: string): ClockTime | null {
  const match = /^\s*(\d{1,2})\s*:\s*(\d{2})\s*$/.exec(text);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (!Number.isInteger(h) || h < 1 || h > 12) return null;
  if (!Number.isInteger(m) || m < 0 || m > 59) return null;
  return { h, m };
}

// ─────────────────────────── moving the hands ───────────────────────────

/** Minutes advanced (negative to go back), keeping the hour honest: 12:45 + 20 min = 1:05. */
export function addMinutes(time: ClockTime, delta: number): ClockTime {
  const total = normalHour(time.h) * MIN_PER_HOUR + normalMinute(time.m) + Math.round(delta);
  const wrapped = ((total % (HOURS_ON_FACE * MIN_PER_HOUR)) + HOURS_ON_FACE * MIN_PER_HOUR) % (HOURS_ON_FACE * MIN_PER_HOUR);
  const h = Math.floor(wrapped / MIN_PER_HOUR);
  const m = wrapped % MIN_PER_HOUR;
  return { h: h === 0 ? 12 : h, m };
}

/** Minutes from one time to another, going forward: 3:50 → 4:10 is 20. */
export function minutesBetween(from: ClockTime, to: ClockTime): number {
  const a = normalHour(from.h) * MIN_PER_HOUR + normalMinute(from.m);
  const b = normalHour(to.h) * MIN_PER_HOUR + normalMinute(to.m);
  return ((b - a) % (HOURS_ON_FACE * MIN_PER_HOUR) + HOURS_ON_FACE * MIN_PER_HOUR) % (HOURS_ON_FACE * MIN_PER_HOUR);
}

/** A minute snapped to the nearest step (5 minutes for the five-minute lessons). */
export const snapMinute = (m: number, step = 5): number => normalMinute(Math.round(normalMinute(m) / step) * step);

/** The hour whose hand is closest to a dragged angle, given the minutes already set. */
export function hourFromAngle(angle: number, minutes: number): number {
  const h = Math.round((((angle % 360) + 360) % 360 - normalMinute(minutes) * DEG_PER_HOUR_MINUTE) / DEG_PER_HOUR);
  return normalHour(h === 0 ? 12 : h);
}

/** The minute a dragged angle points at, snapped to `step`. */
export const minuteFromAngle = (angle: number, step = 5): number => snapMinute((((angle % 360) + 360) % 360) / DEG_PER_MINUTE, step);

// ─────────────────────────── matching pairs ───────────────────────────

/** The digital display that belongs to an analog clock, and vice versa: the times must be equal. */
export const pairsTime = (pairs: Array<{ analog: ClockTime; digital: string }>, analogIndex: number, digitalIndex: number): boolean => {
  const pair = pairs[analogIndex];
  const other = pairs[digitalIndex];
  if (!pair || !other) return false;
  return sameTime(pair.analog, other.analog);
};

/** Whether every analog clock has been matched to a display showing the same time (one display each). */
export function allPairsMatch(pairs: Array<{ analog: ClockTime; digital: string }>, mapping: number[]): boolean {
  if (mapping.length !== pairs.length) return false;
  if (new Set(mapping).size !== mapping.length) return false;
  return pairs.every((_, i) => pairsTime(pairs, i, mapping[i]));
}

// ─────────────────────────── the clock face ───────────────────────────

/** The numbers 1–12 round the face, with their angle: 12 at the top, then clockwise. */
export const faceNumbers = (radius: number, cx: number, cy: number): Array<{ n: number; x: number; y: number }> =>
  Array.from({ length: HOURS_ON_FACE }, (_, i) => {
    const n = i + 1;
    const deg = n * DEG_PER_HOUR;
    const rad = ((deg - 90) * Math.PI) / 180;
    return { n, x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  });

/** A point on the face at `angle` degrees clockwise from 12, `radius` out from the centre. */
export const pointAt = (angle: number, radius: number, cx = 0, cy = 0): { x: number; y: number } => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
};

/** The angle of a point seen from the centre, in degrees clockwise from 12. */
export const angleAt = (x: number, y: number, cx = 0, cy = 0): number => {
  const deg = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90;
  return ((deg % 360) + 360) % 360;
};

/** Hand lengths, so the short hand is always visibly shorter. */
export const HOUR_HAND_LENGTH = 34;
export const MINUTE_HAND_LENGTH = 50;

/** The tick marks round the face: 60 minute ticks, 12 hour ticks. */
export const ticksPerFace = (): Array<{ angle: number; hour: boolean }> =>
  Array.from({ length: MIN_PER_HOUR }, (_, i) => ({ angle: i * DEG_PER_MINUTE, hour: i % 5 === 0 }));

/** Times used as targets in the lessons: only ones the unit teaches (o'clock, half past, five-minute steps). */
export const isTeachingTime = (time: ClockTime): boolean => isFiveMinute(time);
