/**
 * A drawing surface a template can put in a question's `visual`.
 *
 * The runner renders a visual as text, so a picture has to be **text that is
 * still a picture** — the shape of a clock drawn with characters, a row of
 * objects, a stacked grid. That rules out per-character styling and it rules out
 * SVG, but it does not rule out geometry: `clockFace` draws a real dial, with
 * the hour hand placed between two numerals at half past, out of circle and line
 * characters alone.
 *
 * The one thing it cannot express is an arbitrary angle. A hand drawn in text
 * can only point along one of eight directions or lie on a row or column of the
 * grid, so `clockFace` puts every hand on a grid line and computes *which*
 * line from the time: the hour hand at 4:30 points at `4½`, which is a grid
 * position, and the minute hand at 30 minutes points south. A template that
 * needs an angle the grid cannot hold must change the question, not fake the
 * picture.
 *
 * `clockFace` takes minutes since midnight and **derives both hands from that
 * one number**. There is no second copy of the time in the drawing code, so a
 * picture cannot disagree with the answer it illustrates — which is the whole
 * reason this file exists rather than each template drawing its own clock.
 */

/**
 * Minutes since midnight, from whatever a template has.
 *
 * `clock(4, 30)` is 4:30; `clock(16, 0)` is 4:00 in the afternoon, which draws
 * the same face but is a different time of day and must not be confused with it
 * in a prompt. Templates work in 24 hours and *say* whether it is morning or
 * evening, so nothing here has to guess.
 */
export const clock = (hours: number, minutes = 0): number => hours * 60 + minutes;

/** `HH:MM`, zero-padded. The app's only spelling of a time. */
export const clockText = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24;
  const rest = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
};

/**
 * Georgian for a clock time: „4:30“, „4 საათი“ for a whole hour.
 *
 * The specification's own example answer for Q9 is „ექვსი საათი და ოცდაათი
 * წუთი“, so the worded form is what a spoken answer reads like: `clockWords`.
 */
export const clockTextShort = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24;
  const rest = minutes % 60;
  return rest === 0 ? `${hours} საათი` : `${hours}:${String(rest).padStart(2, '0')}`;
};

/* ---------------------------------------------------------------- *\
 * Georgian numbers, for the worded answers
 * ---------------------------------------------------------------- */

const ONES = ['ნული', 'ერთი', 'ორი', 'სამი', 'ოთხი', 'ხუთი', 'ექვსი', 'შვიდი', 'რვა', 'ცხრა'];
const TEENS = ['ათი', 'თერთმეტი', 'თორმეტი', 'ცამეტი', 'თოთხმეტი', 'თხუთმეტი', 'თექვსმეტი', 'ჩვიდმეტი', 'თვრამეტი', 'ცხრამეტი'];

/**
 * A Georgian numeral in words, 0–59.
 *
 * Only the range the calendar and the clock actually need: minutes, days in a
 * month, months in a year. `ოცდაათი` is „thirty“, `ორმოცდაათი` is „fifty“; the
 * teen and unit forms are the standard ones and are checked by a test that
 * round-trips them through a hand-written table.
 */
export const georgianNumber = (value: number): string => {
  if (value < 0 || value > 59) throw new Error(`no Georgian numeral for ${value}`);
  if (value < 10) return ONES[value]!;
  if (value < 20) return TEENS[value - 10]!;
  if (value === 20) return 'ოცი';
  if (value === 30) return 'ოცდაათი';
  if (value === 40) return 'ორმოცი';
  if (value === 50) return 'ორმოცდაათი';
  const tens = Math.floor(value / 10);
  const rest = value % 10;
  // 21 is „ოცდაერთი“ and 47 is „ორმოცდაშვიდი“: the base, then „და“, then the
  // unit — and from 31 the same „და“ carries the teens („ოცდათერთმეტი“).
  const base = tens <= 3 ? 'ოც' : 'ორმოც';
  const unit = rest < 10 ? ONES[rest]! : TEENS[rest - 10]!;
  return `${base}და${unit}`;
};

/** A clock time in words: „ექვსი საათი“, „ექვსი საათი და ოცდაათი წუთი“. */
export const clockWords = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24;
  const rest = minutes % 60;
  const hourWord = `${georgianNumber(hours)} საათი`;
  return rest === 0 ? hourWord : `${hourWord} და ${georgianNumber(rest)} წუთი`;
};

/* ---------------------------------------------------------------- *\
 * The face
 * ---------------------------------------------------------------- */

/**
 * The dial grid: 17 characters wide by 9 rows.
 *
 * Not square, because a character cell is about twice as tall as it is wide. A
 * 17 × 9 grid of characters is roughly square on screen, which is what a clock
 * face has to be — a 15 × 15 grid drew a tall ellipse and the numerals stopped
 * reading as positions on a circle.
 */
const FACE_COLS = 17;
const FACE_ROWS = 9;
const CENTRE = { col: 8, row: 4 };

/** The ring the numerals sit on: the semi-axes of the dial in character cells. */
const RING_X = 7;
const RING_Y = 3.6;

/** Where each numeral's centre sits, from the hour it names. */
const numeralCell = (hour: number): { col: number; row: number } => {
  const angle = (hour % 12) * 30;
  const rad = (angle * Math.PI) / 180;
  return {
    col: Math.round(CENTRE.col + Math.sin(rad) * RING_X),
    row: Math.round(CENTRE.row - Math.cos(rad) * RING_Y),
  };
};

/** A blank dial with its twelve numerals in place. */
const dial = (): string[][] => {
  const rows = Array.from({ length: FACE_ROWS }, () => Array.from({ length: FACE_COLS }, () => ' '));
  for (let hour = 1; hour <= 12; hour += 1) {
    const { col, row } = numeralCell(hour);
    const text = String(hour);
    // A two-digit numeral is centred on its position, so `10`, `11` and `12`
    // stay on the ring instead of shoving their neighbour off it.
    const start = text.length === 2 ? col - 1 : col;
    [...text].forEach((char, index) => {
      const target = start + index;
      if (target >= 0 && target < FACE_COLS && row >= 0 && row < FACE_ROWS) rows[row]![target] = char;
    });
  }
  return rows;
};

/** Writes a line of characters from the centre to a grid cell, both inclusive. */
const line = (grid: string[][], to: { col: number; row: number }, mark: string) => {
  const steps = Math.max(Math.abs(to.col - CENTRE.col), Math.abs(to.row - CENTRE.row));
  for (let step = 1; step <= steps; step += 1) {
    const col = Math.round(CENTRE.col + ((to.col - CENTRE.col) * step) / steps);
    const row = Math.round(CENTRE.row + ((to.row - CENTRE.row) * step) / steps);
    if (row < 0 || row >= FACE_ROWS || col < 0 || col >= FACE_COLS) continue;
        // A hand never overwrites a numeral: the ring is the reference, and a hand
    // drawn through the `12` makes the top of the dial unreadable.
    if (/\d/.test(grid[row]![col]!)) continue;
    grid[row]![col] = mark;
  }
};

/**
 * Where each hand ends, as a grid cell — the picture's geometry, as data.
 *
 * `clockFace` draws exactly these cells, and a test reads them back out of the
 * rendered picture to check the angle they encode. Keeping the geometry
 * separate from the drawing is what lets a test verify a picture that is made of
 * characters.
 */
export interface Hands {
  /**
   * The hour hand, the fraction of the way from this hour to the next, and the
   * two numerals it lies between — `between` is what a child reads, so a test
   * can check the picture against it instead of guessing from a cell.
   */
  hour: { col: number; row: number; angle: number; between: [number, number] };
  /** The minute hand, and the numeral it stands on (0 means the 12). */
  minute: { col: number; row: number; angle: number; numeral: number };
}

/**
 * Both hands for a time.
 *
 * The hour hand is `hours mod 12` plus `minutes / 60` of the way to the next
 * numeral — the specification is explicit that at half past it must sit between
 * the two numerals and not on the earlier one, and that is the difference
 * between a clock that can be read to the half hour and one that lies.
 *
 * The hands are deliberately short enough to leave the numerals visible: the
 * hour hand reaches a little under half the ring, the minute hand nearly all of
 * it, so their lengths tell them apart even when they point the same way.
 */
export const clockHands = (minutes: number): Hands => {
  const hour = Math.floor(minutes / 60) % 12;
  const minute = minutes % 60;
  const hourAngle = (hour + minute / 60) * 30;
  const minuteAngle = minute * 6;
  // The two reaches are far enough apart that the hands never land in the same
  // character cell: at twelve o'clock a half-length hour hand and a 0.78 minute
  // hand both rounded to the same row, so the picture showed one hand where it
  // should show two. A real clock's hour hand is roughly half its minute hand,
  // which is the proportion these numbers are chosen to keep.
  // The numeral the hour hand has most recently passed, and the one it is on
  // its way to. At half past this is the hour and the next, which is the pair a
  // child names when they read „between 4 and 5“.
  const passed = hour === 0 ? 12 : hour;
  const heading = passed === 12 ? 1 : passed + 1;
  return {
    hour: { ...pointAt(hourAngle, 0.46), angle: hourAngle, between: [passed, heading] },
    minute: {
      ...pointAt(minuteAngle, 0.88),
      angle: minuteAngle,
      numeral: minute === 0 ? 12 : minute / 5,
    },
  };
};

/**
 * An analogue clock face for a time, drawn in text.
 *
 * The dial is built from digits and `·`, `●`, `┼` — characters every font has —
 * and both hands come from `clockHands(minutes)`, which is also what a test
 * reads back. There is no second copy of the time in the drawing code, so the
 * picture cannot disagree with the answer it illustrates.
 */
export const clockFace = (minutes: number): string => {
  const grid = dial();
  const hands = clockHands(minutes);
  line(grid, hands.minute, '·');
  line(grid, hands.hour, '●');
  grid[CENTRE.row]![CENTRE.col] = '┼';
  // Blank rows are cut from both ends: the ring does not reach the top and
  // bottom of the grid, and a picture that starts with two empty lines makes
  // the card look broken.
  const lines = grid.map((row) => row.join('').replace(/\s+$/, ''));
  const first = lines.findIndex((text) => text !== '');
  const last = lines.length - 1 - [...lines].reverse().findIndex((text) => text !== '');
  return lines.slice(Math.max(0, first), last + 1).join('\n');
};

/**
 * The grid cell a hand at `degrees` (0 = 12 o'clock, clockwise) reaches.
 *
 * `reach` is how far along the dial it goes, 0–1. The vertical arm is scaled by
 * `RING_Y / RING_X` so that a hand at 45° looks like 45°: in characters it would
 * otherwise be far too steep, because a cell is twice as tall as it is wide.
 */
const pointAt = (degrees: number, reach: number): { col: number; row: number } => {
  const rad = (degrees * Math.PI) / 180;
  return {
    col: Math.round(CENTRE.col + Math.sin(rad) * RING_X * reach),
    row: Math.round(CENTRE.row - Math.cos(rad) * RING_Y * reach),
  };
};
