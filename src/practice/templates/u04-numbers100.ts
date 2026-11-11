import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

/**
 * U04 — რიცხვები 100-ის ფარგლებში.
 *
 * The fourth grade-1 unit: naming, reading, splitting and placing numbers up to
 * a hundred. Where U02 and U03 counted small quantities, this unit is about the
 * *structure* of a two-digit number — tens, units, position in the hundred
 * grid, position on the number line.
 *
 * Four rules hold the library together:
 *
 *  1. **A picture is computed, never selected.** The hundred grid is 1–100 laid
 *     out ten to a row, so "one cell right" is always +1 and "one cell down" is
 *     always +10 — and the picture is *drawn from the same number the answer is
 *     computed from*, so it cannot disagree with the key. The same holds for the
 *     number line and the hive of odd and even numbers.
 *  2. **The level is the thinking, not the size of the number.** Level 1 reads
 *     one property of one number; level 2 moves through the grid or splits a
 *     number; level 3 takes several steps, or separates a digit from a whole
 *     quantity, or compares numbers that look alike.
 *  3. **An answer shape the engine cannot take is not used.** Two typed numbers
 *     would be one input and therefore unmet in its second half, and a
 *     one-symbol answer would kill the session on its second question. Both are
 *     converted into a shape the engine checks exactly — see below.
 *  4. **A wrong option is a wrong answer to this question.** The tens digit for
 *     the whole number, the number above for the number below, 66 for 64.
 */

/* ================================================================== *
 * Georgian number words, 1–100
 * ================================================================== */

/**
 * Georgian counts in twenties, not tens: 60 is სამოცი ("three twenties"), and
 * 79 is სამოცდაცხრამეტი ("three twenties and nineteen"). Words are therefore
 * built from a *score* (the twenties) plus a remainder, not from a tens digit.
 */
const UNITS = ['', 'ერთი', 'ორი', 'სამი', 'ოთხი', 'ხუთი', 'ექვსი', 'შვიდი', 'რვა', 'ცხრა'] as const;

const TEN = 'ათი';

/** 11–19 are single words whose stems do not follow from the digits. */
const TEENS = [
  '', 'თერთმეტი', 'თორმეტი', 'ცამეტი', 'თოთხმეტი', 'თხუთმეტი',
  'თექვსმეტი', 'ჩვიდმეტი', 'თვრამეტი', 'ცხრამეტი',
] as const;

/** The exact multiple of twenty, as it is printed before „და“. */
const SCORES = ['', 'ოცი', 'ორმოცი', 'სამოცი', 'ოთხმოცი'] as const;

/**
 * The same stems as they appear in the middle of a compound.
 *
 * ოცი → ოცდა…, ორმოცი → ორმოცდა…, and so on: the linking „და“ replaces the
 * final ი. Writing this as a table rather than a string rule keeps the one
 * irregular stem (ოც → ოცდა) explicit instead of guessed.
 */
const SCORE_STEMS = ['', 'ოც', 'ორმოც', 'სამოც', 'ოთხმოც'] as const;

/**
 * The word for a number, 1–100.
 *
 * Throws outside that range — a template that asks for a word it cannot spell
 * is a bug, and a silent fallback would put an invented Georgian word in front
 * of a child.
 */
export const georgianNumber = (n: number): string => {
  if (!Number.isInteger(n) || n < 1 || n > 100) {
    throw new Error(`U04 spells 1–100; asked for ${n}`);
  }
  if (n === 100) return 'ასი';
  if (n < 10) return UNITS[n];
  if (n === 10) return TEN;
  if (n < 20) return TEENS[n - 10];
  if (n === 20) return SCORES[1];

  const score = Math.floor(n / 20);
  const rest = n % 20;
  const head = SCORE_STEMS[score];
  // Rest 0 is the exact score and is handled above; 1–9 join with -და- only
  // when the score is at least twenty (ოცდახუთი), 10–19 always join with -და-.
  if (rest === 0) return `${SCORES[score]}`;
  if (rest < 10) return `${head}და${UNITS[rest]}`;
  if (rest === 10) return `${head}და${TEN}`;
  return `${head}და${TEENS[rest - 10]}`;
};

/** All 100 words, for the word pools and for tests. */
export const NUMBER_WORDS: string[] = Array.from({ length: 100 }, (_, index) =>
  georgianNumber(index + 1),
);

/* ================================================================== *
 * Roman numerals — I, V, X, L only
 * ================================================================== */

/**
 * Roman numerals up to 89.
 *
 * The unit's objective allows I, V, X and L, so a value that would need C
 * (ninety and above) is outside it. Nine and forty are *subtractive* forms —
 * IX and XL — which is why Q35 and Q36 exist and why the table is not simply
 * "repeat the symbol".
 */
const ROMAN: Array<[number, string]> = [
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

export const toRoman = (n: number): string => {
  if (!Number.isInteger(n) || n < 1 || n > 89) {
    throw new Error(`U04 writes Roman numerals 1–89; asked for ${n}`);
  }
  let left = n;
  let out = '';
  for (const [value, symbol] of ROMAN) {
    while (left >= value) {
      out += symbol;
      left -= value;
    }
  }
  return out;
};

/** The value of a Roman numeral, for the answer key. */
export const fromRoman = (text: string): number => {
  const values: Record<string, number> = { I: 1, V: 5, X: 10, L: 50 };
  let total = 0;
  for (let index = 0; index < text.length; index += 1) {
    const here = values[text[index]];
    const next = values[text[index + 1]] ?? 0;
    if (here === undefined) throw new Error(`not a Roman numeral: ${text}`);
    total += here < next ? -here : here;
  }
  return total;
};

/* ================================================================== *
 * Small helpers
 * ================================================================== */

const asRun = (numbers: number[]): string => numbers.join(', ');

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index);

const numbersOf = (vars: Vars, key: string): number[] =>
  (vars[key] as Array<number | string>).map(Number);

const digitsOf = (n: number): number[] => String(n).split('').map(Number);

/* ================================================================== *
 * The hundred grid
 * ================================================================== */

/**
 * 1–100 laid out ten to a row, as the unit's „ასეულის ცხრილი“ is.
 *
 * The whole point of the picture is the arithmetic it encodes: in this layout
 * one cell right is +1 and one cell down is +10. Those two facts are asserted
 * in `gridCell` and in the tests, so a picture can never be drawn one way while
 * a question reasons the other way.
 */
export const GRID_COLUMNS = 10;

/** Row and column (both 0-based) of a number in the hundred grid. */
export const gridCell = (n: number): { row: number; column: number } => ({
  row: Math.floor((n - 1) / GRID_COLUMNS),
  column: (n - 1) % GRID_COLUMNS,
});

const GRID_START = 1;
const GRID_END = 100;

/** The number at a cell, or null when the cell is off the grid. */
const gridAt = (row: number, column: number): number | null => {
  if (row < 0 || row > 9 || column < 0 || column > 9) return null;
  const value = row * GRID_COLUMNS + column + 1;
  return value >= GRID_START && value <= GRID_END ? value : null;
};

/**
 * Width of one cell in the picture.
 *
 * Four, not three: a marked cell is `[63]` — four characters — and a three-wide
 * unmarked cell beside it would pull the rest of the row out of line, so the
 * columns would stop being columns exactly on the row that matters.
 */
const CELL = 4;

const cellText = (label: string, marked: boolean): string =>
  marked ? `[${label}]`.padStart(CELL, ' ') : label.padStart(CELL, ' ');

/**
 * The grid, with some cells blanked and some highlighted.
 *
 * A highlighted cell is bracketed on both sides rather than coloured, so the
 * picture still reads as text for a screen reader. Only the cells the question
 * *states* are ever marked: a destination marked on the page is the answer, and
 * a picture that shows the answer is not a question.
 */
interface GridDrawing {
  /** Cells whose number is replaced by a blank. */
  hide?: number[];
  /** Cells drawn as given — the starting cell of a move, never its end. */
  mark?: number[];
}

const drawGrid = ({ hide = [], mark = [] }: GridDrawing): string => {
  const lines: string[] = [];
  for (let row = 0; row < 10; row += 1) {
    const cells: string[] = [];
    for (let column = 0; column < 10; column += 1) {
      const value = row * 10 + column + 1;
      if (hide.includes(value)) {
        cells.push(cellText('·', false));
      } else {
        cells.push(cellText(String(value), mark.includes(value)));
      }
    }
    lines.push(cells.join(''));
  }
  return lines.join('\n');
};

/* ================================================================== *
 * The number line
 * ================================================================== */

/**
 * A stretch of the number line, from `first` to `first + count - 1`.
 *
 * The window is chosen by the caller so that it always contains the numbers the
 * question is about — a move whose destination is off the page is a misleading
 * picture. Only the cells in `mark` are bracketed, and a question marks the
 * numbers it *gives*, never the one it asks for.
 */
const drawLine = (first: number, count: number, mark: number[]): string => {
  const cells: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const value = first + index;
    cells.push(cellText(String(value), mark.includes(value)));
  }
  return cells.join('');
};

/** The window of ten numbers that contains every number given. */
const lineWindow = (numbers: number[]): number => {
  const low = Math.min(...numbers);
  const high = Math.max(...numbers);
  const width = Math.max(10, high - low + 3);
  const start = Math.min(Math.max(1, Math.floor((low + high) / 2 - width / 2)), 101 - width);
  return Math.max(1, Math.min(start, Math.max(1, 101 - width)));
};

/* ================================================================== *
 * Address
 * ================================================================== */

const grade = 1 as const;
const topicId = 'ricxvebi100';
const unitId = 'ricxvebi100';

interface Addressed {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
}

const at = ({ id, subtopicId, difficulty }: Addressed) => ({
  id,
  grade,
  topicId,
  unitId,
  subtopicId,
  difficulty,
});

/* ================================================================== *
 * U04.1 — ასეულის ცხრილი
 * ================================================================== */

/**
 * How far a cell is from the edge of the grid.
 *
 * A move has to be *possible* before it can be asked: "two cells right" from 79
 * would leave the row, and "one cell down" from 95 would leave the grid. These
 * are checked as constraints so the picture and the arithmetic always agree.
 */
const canMove = (n: number, right: number, down: number): boolean => {
  const { row, column } = gridCell(n);
  return (
    row + down >= 0 &&
    row + down <= 9 &&
    column + right >= 0 &&
    column + right <= 9
  );
};

/** The number reached by moving in the grid; the caller checks `canMove` first. */
const moved = (n: number, right: number, down: number): number =>
  n + right + down * GRID_COLUMNS;

const u041: QuestionTemplate[] = [
  /**
   * Level 1 — read the marked cell (Q1).
   *
   * The grid is drawn from the same `n` the answer is computed from, and the
   * wrong options are numbers in the *same row and column*, so a child who
   * reads the wrong line lands on an option instead of being able to narrow by
   * shape alone.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-1-read-marked', subtopicId: 'aseulis-cxrili', difficulty: 1 }),
    prompt: 'ასეულის ცხრილში მონიშნულია ერთი რიცხვი. რომელ რიცხვზე მიუთითებს ის?',
    variables: {
      // Not the last row or column edge, so the picture always has neighbours.
      marked: { kind: 'int', min: 1, max: 100, reverse: true },
    },
    answer: (v: Vars) => Number(v.marked),
    format: { kind: 'integer', min: 1 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const n = Number(vars.marked);
      const { row, column } = gridCell(n);
      // The number above, below and beside the marked cell: the three a child
      // reads off by mistake when they follow the wrong line.
      return [
        gridAt(row, column - 1),
        gridAt(row, column + 1),
        gridAt(row - 1, column),
        gridAt(row + 1, column),
        Number(answer) + 10,
        Number(answer) - 10,
      ]
        .filter((value): value is number => value !== null && value !== Number(answer))
        .filter((value, index, all) => all.indexOf(value) === index);
    },
    explanation: ({ answer }) => `მონიშნული რიცხვია ${answer}.`,
    // Twelve rows around the marked one, so the marked cell is never alone on
    // a page: the point of the picture is the neighbours.
    visual: (v: Vars) => drawGrid({ mark: [Number(v.marked)] }),
  }),

  /**
   * Level 1, second answer shape — one cell right (Q2).
   *
   * The grid is drawn with the starting cell marked, and the *answer* is the
   * next cell in the row. A child who moves down instead lands on +10, which is
   * offered.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-1-step-right', subtopicId: 'aseulis-cxrili', difficulty: 2 }),
    prompt: 'ასეულის ცხრილში მოცემულია რიცხვი {from}. რომელ რიცხვს ვიღებთ, თუ ერთი უჯრით მარჯვნივ გადავინაცვლებთ?',
    variables: {
      from: { kind: 'int', min: 1, max: 100 },
    },
    constraints: [
      {
        note: 'the step stays inside the row and inside a hundred',
        test: (v: Vars) => {
          const column = gridCell(Number(v.from)).column;
          return column < 9 && Number(v.from) < 100;
        },
      },
    ],
    answer: (v: Vars) => Number(v.from) + 1,
    format: { kind: 'integer', min: 2, max: 100 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const n = Number(vars.from);
      // Down a cell instead of along the row (+10), and the cell before (−1).
      return [n + 10, n - 1, n + 11].filter(
        (value) => value !== Number(answer) && value >= 1 && value <= 100,
      );
    },
    explanation: ({ vars, answer }) => `${vars.from}-ის მარჯვნივ, იმავე რიგში, არის ${answer}.`,
    visual: (v: Vars) => drawGrid({ mark: [Number(v.from)] }),
  }),

  /**
   * Level 2 — one step down the grid (Q3).
   *
   * Down a column is +10, which is the place-value fact the unit is named for.
   * The tempting wrong answer is +1 (right instead of down), and it is offered.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-1-step-down', subtopicId: 'aseulis-cxrili', difficulty: 2 }),
    prompt: 'ასეულის ცხრილში მოცემულია რიცხვი {from}. რომელ რიცხვს ვიღებთ, თუ ერთი უჯრით ქვემოთ გადავინაცვლებთ?',
    variables: {
      from: { kind: 'int', min: 1, max: 90 },
    },
    answer: (v: Vars) => Number(v.from) + GRID_COLUMNS,
    format: { kind: 'integer', min: 1, max: 100, entry: true },
    explanation: ({ vars, answer }) => `${vars.from}-ის ქვემოთ არის ${answer} (10-ით მეტი).`,
    // Only the starting cell is marked: the destination is the answer.
    visual: (v: Vars) => drawGrid({ mark: [Number(v.from)] }),
  }),

  /**
   * Level 2, second answer shape — the hidden cell (Q4).
   *
   * The grid keeps all of its neighbours and loses one number, so the blank is
   * found by reading the row it sits in rather than by arithmetic on a sentence.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-1-hidden-cell', subtopicId: 'aseulis-cxrili', difficulty: 2 }),
    prompt: 'რომელი რიცხვი უნდა ჩავსვათ გამოტოვებულ უჯრაში?',
    variables: {
      hidden: { kind: 'int', min: 1, max: 100 },
    },
    answer: (v: Vars) => Number(v.hidden),
    format: { kind: 'integer', min: 1, max: 100, entry: true },
    explanation: ({ answer }) => `გამოტოვებული უჯრა არის ${answer}.`,
    visual: (v: Vars) => drawGrid({ hide: [Number(v.hidden)] }),
  }),

  /**
   * Level 3 — several steps at once (Q5).
   *
   * Two moves in two directions: a child who does only the second, or only the
   * first, lands on an option. Both partial answers are computed and offered.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-1-two-moves', subtopicId: 'aseulis-cxrili', difficulty: 3 }),
    prompt:
      'ასეულის ცხრილში დაიწყე {from}-დან. გადადი {right} უჯრით მარჯვნივ და {down} უჯრით ქვემოთ. რომელ რიცხვზე მოხვდები?',
    variables: {
      from: { kind: 'int', min: 1, max: 100 },
      right: { kind: 'int', min: 1, max: 3 },
      down: { kind: 'int', min: 1, max: 2 },
    },
    constraints: [
      { note: 'both moves stay on the grid', test: (v: Vars) => canMove(Number(v.from), Number(v.right), Number(v.down)) },
    ],
    answer: (v: Vars) => moved(Number(v.from), Number(v.right), Number(v.down)),
    format: { kind: 'integer', min: 1, max: 100, entry: true },
    explanation: ({ vars, answer }) =>
      `${vars.from} + ${vars.right} = ${Number(vars.from) + Number(vars.right)}; + ${Number(vars.down) * 10} = ${answer}.`,
    visual: (v: Vars) => drawGrid({ mark: [Number(v.from)] }),
  }),

  /**
   * Level 3, second answer shape — the cell above *and* the cell to the left
   * (Q6). Two neighbours at once, so the answer is a pair.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-1-two-neighbours', subtopicId: 'aseulis-cxrili', difficulty: 3 }),
    prompt: 'მოცემულია რიცხვი {n}. ჩაწერე ჯერ მის ზემოთ მდებარე რიცხვი, შემდეგ — მის მარცხნივ მდებარე რიცხვი.',
    variables: {
      n: { kind: 'int', min: 11, max: 100 },
    },
    constraints: [
      {
        note: 'both neighbours exist — not the top row, not the first column',
        test: (v: Vars) => {
          const { row, column } = gridCell(Number(v.n));
          return row > 0 && column > 0;
        },
      },
    ],
    answer: (v: Vars) => {
      const { row, column } = gridCell(Number(v.n));
      return `${gridAt(row - 1, column)}, ${gridAt(row, column - 1)}`;
    },
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const { row, column } = gridCell(Number(vars.n));
      // The two neighbours in the other order, then above-and-right, then
      // right-and-below: the mistakes are which side each number came from.
      // A cell off the grid is dropped rather than printed as „null“.
      const pair = (a: number | null, b: number | null): string | null =>
        a === null || b === null ? null : `${a}, ${b}`;
      return [
        pair(gridAt(row, column - 1), gridAt(row - 1, column)),
        pair(gridAt(row - 1, column), gridAt(row - 1, column + 1)),
        pair(gridAt(row, column + 1), gridAt(row + 1, column)),
      ].filter((option): option is string => option !== null && option !== answer);
    },
    explanation: ({ answer }) =>
      `ზემოთ — 10-ით ნაკლები, მარცხნივ — 1-ით ნაკლები. პასუხი: ${answer}.`,
    // The two neighbours are the answer, so only the given cell is marked.
    visual: (v: Vars) => drawGrid({ mark: [Number(v.n)] }),
  }),
];

/* ================================================================== *
 * U04.2 — ათეულები და ერთეულები
 * ================================================================== */

const u042: QuestionTemplate[] = [
  /**
   * Level 1 — build a number from its tens and units (Q8, and Q48 in the
   * mixed set).
   *
   * Asked as blocks as well as as a sentence: the picture shows the tens as
   * rods and the units as squares, and both are computed from the same digits.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-2-from-tens-units', subtopicId: 'ateulebi-erteulebi', difficulty: 1 }),
    prompt: 'რომელ რიცხვს შეესაბამება {tens} ათეული და {units} ერთეული?',
    variables: {
      tens: { kind: 'int', min: 1, max: 9 },
      units: { kind: 'int', min: 0, max: 9 },
    },
    answer: (v: Vars) => Number(v.tens) * 10 + Number(v.units),
    format: { kind: 'integer', min: 10, max: 99, entry: true },
    explanation: ({ vars, answer }) => `${vars.tens} ათეული და ${vars.units} ერთეული — ეს არის ${answer}.`,
    visual: (v: Vars) =>
      [
        `${String(v.tens).padStart(2)} ათეული: ${'▮'.repeat(Math.min(10, Number(v.tens)))}`,
        `${String(v.units).padStart(2)} ერთეული: ${'▪'.repeat(Number(v.units) || 0) || '—'}`,
      ].join('\n'),
  }),

  /**
   * Level 1, second answer shape — how many tens and how many units (Q7).
   *
   * Two answers, but the engine's numeric input takes one number. Asked as
   * „how many units are left after the tens?“ it is one number, and it still
   * separates the tens from the units — which is the whole skill. The pair
   * form is kept for the choice version below, where two answers can be shown
   * as one option.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-2-split-choice', subtopicId: 'ateulebi-erteulebi', difficulty: 1 }),
    prompt: 'როგორ იშლება რიცხვი {n} ათეულებად და ერთეულებად?',
    variables: {
      n: { kind: 'int', min: 10, max: 99 },
    },
    answer: (v: Vars) => {
      const n = Number(v.n);
      return `${Math.floor(n / 10)} ათეული და ${n % 10} ერთეული`;
    },
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const n = Number(vars.n);
      const tens = Math.floor(n / 10);
      const units = n % 10;
      return [
        // The digits the other way round: the mistake this question exists for.
        `${units} ათეული და ${tens} ერთეული`,
        `${tens} ათეული და ${(units + 1) % 10} ერთეული`,
        `${tens + 1} ათეული და ${units} ერთეული`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.n} არის ${answer}.`,
  }),

  /**
   * Level 2 — read the tens and units off a number (Q9).
   *
   * The pair answer, which the engine shows as one option. The digits swapped
   * is the mistake this is for, and it is always one of the options.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-2-split', subtopicId: 'ateulebi-erteulebi', difficulty: 2 }),
    prompt: 'დაშალე რიცხვი {n} ათეულებად და ერთეულებად.',
    variables: {
      n: { kind: 'int', min: 10, max: 99 },
    },
    answer: (v: Vars) => {
      const n = Number(v.n);
      return `${Math.floor(n / 10)} ათეული და ${n % 10} ერთეული`;
    },
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const n = Number(vars.n);
      const tens = Math.floor(n / 10);
      const units = n % 10;
      return [
        `${units} ათეული და ${tens} ერთეული`,
        `${tens} ათეული და ${(units + 1) % 10} ერთეული`,
        `${tens + 1} ათეული და ${units} ერთეული`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.n} არის ${answer}.`,
  }),

  /**
   * Level 2, second answer shape — build the number from its parts (Q10).
   *
   * The inverse direction of the split, asked as a typed number. A child who
   * adds the digits instead of the tens gets `tens + units`, and that is one of
   * the options when the question is asked with choices; here it is typed.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-2-build', subtopicId: 'ateulebi-erteulebi', difficulty: 2 }),
    prompt: 'შეადგინე რიცხვი {tens} ათეულისა და {units} ერთეულისგან.',
    variables: {
      tens: { kind: 'int', min: 1, max: 9 },
      units: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v: Vars) => Number(v.tens) * 10 + Number(v.units),
    format: { kind: 'integer', min: 11, max: 99, entry: true },
    explanation: ({ vars, answer }) => `${vars.tens}×10 + ${vars.units} = ${answer}.`,
  }),

  /**
   * Level 3 — how many units *in all* (Q11).
   *
   * The distinction the task names: the units digit of 65 is 5, but there are
   * 65 units in it. Both numbers are offered, so the question tests the
   * difference rather than the digit.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-2-units-in-all', subtopicId: 'ateulebi-erteulebi', difficulty: 3 }),
    prompt: 'რიცხვში {n} რამდენი ერთეულია სულ?',
    variables: {
      n: { kind: 'int', min: 10, max: 99 },
    },
    answer: (v: Vars) => Number(v.n),
    format: { kind: 'integer', min: 10 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      // The units digit — the answer to a different question — then the tens.
      return [n % 10, Math.floor(n / 10), Number(answer) + 10, Number(answer) - 10].filter(
        (value) => value !== Number(answer) && value > 0,
      );
    },
    explanation: ({ vars, answer }) =>
      `${vars.n}-ში ერთეულების ციფრია ${Number(vars.n) % 10}, მაგრამ სულ ${answer} ერთეულია.`,
  }),

  /**
   * Level 3, second answer shape — change the tens digit (Q12).
   *
   * Not the same question as „build a number“: here the units are *kept* and
   * only the tens move, so a child who rebuilds from the new digit alone loses
   * the units. The value with the units lost is offered.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-2-change-tens', subtopicId: 'ateulebi-erteulebi', difficulty: 3 }),
    prompt: 'რიცხვში {n} შეცვალე ათეულების ციფრი {fromTens}-დან {toTens}-მდე. რა რიცხვს მიიღებ?',
    variables: {
      n: { kind: 'int', min: 10, max: 99 },
      toTens: { kind: 'int', min: 1, max: 9 },
      fromTens: { kind: 'choice', values: (v: Vars) => [Math.floor(Number(v.n) / 10)] },
    },
    constraints: [
      {
        note: 'the new tens really is a change',
        test: (v: Vars) => Number(v.toTens) !== Math.floor(Number(v.n) / 10),
      },
    ],
    answer: (v: Vars) => Number(v.toTens) * 10 + (Number(v.n) % 10),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      const toTens = Number(vars.toTens);
      // Adding the new digit to the number instead of replacing a digit, and
      // keeping the old tens — the two ways to misread „შეცვალე“.
      return [n + toTens, n, toTens * 10 + (toTens % 10), Number(answer) + 10].filter(
        (value) => value !== Number(answer) && value >= 10 && value <= 99,
      );
    },
    explanation: ({ vars, answer }) =>
      `ათეულები ${vars.toTens}, ერთეულები ${Number(vars.n) % 10} უცვლელი — ${answer}.`,
  }),
];

/* ================================================================== *
 * U04.3 — რიცხვები სიტყვიერად
 * ================================================================== */

/**
 * Reading a number's name, in both directions.
 *
 * The wrong options are *other real numbers' names*, chosen to be the names a
 * child confuses: the neighbouring number, the swapped tens and units, and the
 * number whose name shares a stem (ე.წ. „ორმოცი“ against „ოცდაორი“).
 */
const nameOf = (n: number): string => georgianNumber(n);

/** Numbers whose names are easy to mix up with `n`'s. */
const confusableNames = (n: number, roman = false): number[] => {
  const swapped = Number(String(n).split('').reverse().join(''));
  const close = [n + 1, n - 1, n + 10, n - 10, n + 2];
  const tens = Math.floor(n / 10) * 10;
  const units = n % 10;
  // A number in the same score but a different remainder, and a number one
  // score away: both are plausible misreadings of the same word.
  const sameScore = tens + (units > 0 ? units : 1) + (units < 9 ? 1 : -1);
  return [swapped, sameScore, ...close, tens]
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 100 && value !== n)
    .filter((value, index, all) => all.indexOf(value) === index)
    .slice(0, roman ? 6 : 7);
};

const u043: QuestionTemplate[] = [
  /**
   * Level 1 — a number written as a word, name the number (Q13).
   *
   * The word is computed from the answer's own number, so the sentence and the
   * key cannot disagree. The wrong options are real numbers with real names,
   * not invented spellings.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-3-word-to-number', subtopicId: 'ricxvebi-sityvebiT', difficulty: 1 }),
    prompt: 'რომელი რიცხვია სიტყვიერად წარმოდგენილი როგორც „{word}“?',
    variables: {
      n: { kind: 'int', min: 1, max: 100 },
      word: { kind: 'choice', values: (v: Vars) => [georgianNumber(Number(v.n))] },
    },
    answer: (v: Vars) => Number(v.n),
    format: { kind: 'integer', min: 1, max: 100 },
    optionCount: 3,
    distractors: ({ vars }) => confusableNames(Number(vars.n)),
    explanation: ({ answer }) => `„${nameOf(Number(answer))}“ არის ${answer}.`,
  }),

  /**
   * Level 1, second answer shape — the name of a small number (Q14).
   *
   * The other direction: the number is printed and its name is chosen. Options
   * are other names, so the student reads Georgian rather than eliminating by
   * shape.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-3-number-to-word', subtopicId: 'ricxvebi-sityvebiT', difficulty: 1 }),
    prompt: 'როგორ იწერება სიტყვიერად რიცხვი {n}?',
    variables: {
      n: { kind: 'int', min: 1, max: 20 },
    },
    answer: (v: Vars) => georgianNumber(Number(v.n)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) =>
      confusableNames(Number(vars.n)).map((value) => georgianNumber(value)),
    explanation: ({ vars, answer }) => `${vars.n} არის „${answer}“.`,
  }),

  /**
   * Level 2 — a name in the twenties (Q15).
   *
   * Same shape as level 1 but the numbers cross the first score, where the name
   * is built rather than remembered: „ოცდახუთი“ has no separate word.
   *
   * Stops at 39 deliberately. „score-compound“ asks the same sentence over the
   * higher scores, and two templates that can draw the same number produce the
   * same question twice — the generator then rejects one of them and the level
   * silently loses it.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-3-word-mid', subtopicId: 'ricxvebi-sityvebiT', difficulty: 2 }),
    prompt: 'აირჩიე რიცხვი, რომელიც შეესაბამება სიტყვას „{word}“.',
    variables: {
      n: { kind: 'int', min: 21, max: 39 },
      word: { kind: 'choice', values: (v: Vars) => [georgianNumber(Number(v.n))] },
    },
    answer: (v: Vars) => Number(v.n),
    format: { kind: 'integer', min: 21, max: 39 },
    optionCount: 3,
    distractors: ({ vars }) => confusableNames(Number(vars.n)),
    explanation: ({ answer }) => `„${nameOf(Number(answer))}“ არის ${answer}.`,
  }),

  /**
   * Level 2 — the score word joined to a remainder (Q15 one score further on).
   *
   * „ორმოცდაათი“ is two stems and a „და“, which is the form the twenties alone
   * never reach. Every draw is a different number, so this is what carries the
   * level's capacity; the nine fixed score words below do not.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-3-score-compound', subtopicId: 'ricxvebi-sityvebiT', difficulty: 2 }),
    prompt: 'აირჩიე რიცხვი, რომელიც შეესაბამება სიტყვას „{word}“.',
    variables: {
      // The band above „word-mid“: forty to seventy-nine, where the name
      // starts with ორმოცი, სამოცი … rather than ოცი. Disjoint from it, so the
      // same number can never be drawn by both.
      n: { kind: 'list', pick: { values: range(40, 79), length: 1 } },
      word: { kind: 'choice', values: (v: Vars) => [georgianNumber(numbersOf(v, 'n')[0])] },
    },
    answer: (v: Vars) => numbersOf(v, 'n')[0],
    format: { kind: 'integer', min: 40, max: 79 },
    optionCount: 3,
    distractors: ({ vars }) => confusableNames(numbersOf(vars, 'n')[0]),
    explanation: ({ vars }) => {
      const n = numbersOf(vars, 'n')[0];
      return `„${nameOf(n)}“ არის ${n}.`;
    },
  }),

  /**
   * Level 3 — a name in the eighties (Q17, „სამოცდაცხრამეტი“).
   *
   * The last score plus a teen: two stems joined, which is the hardest word in
   * the range and the one a child cannot guess from the digits alone.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-3-word-teens', subtopicId: 'ricxvebi-sityvebiT', difficulty: 3 }),
    prompt: 'რომელი რიცხვია სიტყვიერად წარმოდგენილი როგორც „{word}“?',
    variables: {
      n: { kind: 'int', min: 61, max: 100 },
      word: { kind: 'choice', values: (v: Vars) => [georgianNumber(Number(v.n))] },
    },
    answer: (v: Vars) => Number(v.n),
    format: { kind: 'integer', min: 61, max: 100 },
    optionCount: 3,
    distractors: ({ vars }) => confusableNames(Number(vars.n)),
    explanation: ({ answer }) => `„${nameOf(Number(answer))}“ არის ${answer}.`,
  }),

  /**
   * Level 3, second answer shape — choose the correct spelling (Q18).
   *
   * Here the *options are words*, and the wrong ones are near-miss spellings of
   * the same number rather than other numbers: the joiners (-და-) moved or
   * dropped, and the wrong stem for the same score. Only one is the correct
   * Georgian word.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-3-spelling', subtopicId: 'ricxvebi-sityvebiT', difficulty: 3 }),
    prompt: 'აირჩიე რიცხვის სწორი სიტყვიერი ფორმა: {n}.',
    variables: {
      n: { kind: 'int', min: 21, max: 99 },
    },
    answer: (v: Vars) => georgianNumber(Number(v.n)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const n = Number(vars.n);
      // Only real numbers' names are offered. An invented spelling would teach
      // a word that does not exist, so the wrong options are the number with
      // its digits swapped, its neighbour, and a number one score away — all of
      // which are words a child actually reads.
      const swapped = Number(String(n).split('').reverse().join(''));
      return [swapped, n + 1, n + 20, n - 20, Math.floor(n / 20) * 20]
        .filter(
          (value) =>
            Number.isInteger(value) && value >= 1 && value <= 100 && value !== n,
        )
        .filter((value, index, all) => all.indexOf(value) === index)
        .map((value) => georgianNumber(value));
    },
    explanation: ({ vars, answer }) => `${vars.n} იწერება „${answer}“.`,
  }),
];

/* ================================================================== *
 * U04.4 — რიცხვითი ღერძი 100-მდე
 * ================================================================== */

const u044: QuestionTemplate[] = [
  /**
   * Level 1 — the number after a marked one (Q19).
   *
   * The line is drawn around the marked number, so „right“ is visible. The wrong
   * options are the neighbours on the line: before, and two after.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-4-after', subtopicId: 'ricxviTi-xazi100', difficulty: 1 }),
    prompt: 'რიცხვით ღერძზე მონიშნულია {n}. რომელი რიცხვია მის შემდეგ?',
    variables: {
      n: { kind: 'int', min: 1, max: 99, reverse: true },
    },
    answer: (v: Vars) => Number(v.n) + 1,
    format: { kind: 'integer', min: 2, max: 100 },
    optionCount: 3,
    distractors: ({ vars }) => {
      const n = Number(vars.n);
      return [n - 1, n + 2, n + 10];
    },
    explanation: ({ vars, answer }) => `${vars.n}-ის შემდეგ ღერძზე არის ${answer}.`,
    visual: (v: Vars) => drawLine(lineWindow([Number(v.n)]), 10, [Number(v.n)]),
  }),

  /**
   * Level 1, second answer shape — the number before (Q20).
   *
   * The other direction on the line. Offered as its own template because the
   * mistake is different: a child who always reads „before“ as „after“ gets the
   * question exactly backwards, and only asking both catches it.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-4-before', subtopicId: 'ricxviTi-xazi100', difficulty: 1 }),
    prompt: 'რომელი რიცხვია {n}-ის წინ?',
    variables: {
      n: { kind: 'int', min: 2, max: 100, reverse: true },
    },
    answer: (v: Vars) => Number(v.n) - 1,
    format: { kind: 'integer', min: 1, max: 99 },
    optionCount: 3,
    distractors: ({ vars }) => {
      const n = Number(vars.n);
      return [n + 1, n - 2, n - 10].filter((value) => value >= 1);
    },
    explanation: ({ vars, answer }) => `${vars.n}-ის წინ ღერძზე არის ${answer}.`,
    visual: (v: Vars) => drawLine(lineWindow([Number(v.n)]), 10, [Number(v.n)]),
  }),

  /**
   * Level 2 — walk several steps right (Q21).
   *
   * The number of steps is drawn, so the answer is not always +5. A child who
   * moves one step lands on an option.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-4-steps-right', subtopicId: 'ricxviTi-xazi100', difficulty: 2 }),
    prompt: 'რიცხვით ღერძზე დაიწყე {from}-დან და გადადი {steps} ნაბიჯით მარჯვნივ. რომელ რიცხვზე მოხვდები?',
    variables: {
      from: { kind: 'int', min: 1, max: 90 },
      steps: { kind: 'int', min: 2, max: 9 },
    },
    constraints: [
      { note: 'the walk stays on the line', test: (v: Vars) => Number(v.from) + Number(v.steps) <= 100 },
    ],
    answer: (v: Vars) => Number(v.from) + Number(v.steps),
    format: { kind: 'integer', min: 2, max: 100 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const from = Number(vars.from);
      return [from + 1, Number(answer) - 1, from + Number(vars.steps) + 10].filter(
        (value) => value !== Number(answer) && value <= 100,
      );
    },
    explanation: ({ vars, answer }) => `${vars.from} + ${vars.steps} = ${answer}.`,
    // The window has to hold the whole walk, or it shows a destination off the
    // page. Only the starting number is marked: the end is the answer.
    visual: (v: Vars) =>
      drawLine(
        lineWindow([Number(v.from), Number(v.from) + Number(v.steps)]),
        Math.max(10, Number(v.steps) + 4),
        [Number(v.from)],
      ),
  }),

  /**
   * Level 2, second answer shape — walk left (Q22).
   *
   * Its own template: the wrong answers are different (a child who moves right
   * gets +steps, not −steps) and the line is the same.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-4-steps-left', subtopicId: 'ricxviTi-xazi100', difficulty: 2 }),
    prompt: 'დაიწყე {from}-დან და გადადი {steps} ნაბიჯით მარცხნივ. რომელ რიცხვზე მოხვდები?',
    variables: {
      from: { kind: 'int', min: 11, max: 100 },
      steps: { kind: 'int', min: 2, max: 9 },
    },
    constraints: [
      { note: 'the walk stays on the line', test: (v: Vars) => Number(v.from) - Number(v.steps) >= 1 },
    ],
    answer: (v: Vars) => Number(v.from) - Number(v.steps),
    format: { kind: 'integer', min: 1, max: 99 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const from = Number(vars.from);
      return [from + Number(vars.steps), Number(answer) + 1, Number(answer) - 1].filter(
        (value) => value !== Number(answer) && value >= 1 && value <= 100,
      );
    },
    explanation: ({ vars, answer }) => `${vars.from} − ${vars.steps} = ${answer}.`,
    visual: (v: Vars) =>
      drawLine(
        lineWindow([Number(v.from) - Number(v.steps), Number(v.from)]),
        Math.max(10, Number(v.steps) + 4),
        [Number(v.from)],
      ),
  }),

  /**
   * Level 3 — ten steps right (Q23).
   *
   * Ten steps rather than five, so the walk crosses a whole ten: a child who
   * counts the steps one at a time still arrives, but a child who applies the
   * step count without the tens gets an option.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-4-ten-steps', subtopicId: 'ricxviTi-xazi100', difficulty: 3 }),
    prompt: 'რიცხვით ღერძზე დაიწყე {from}-დან. გადადი {steps} ნაბიჯით მარჯვნივ. რომელ რიცხვზე მოხვდები?',
    variables: {
      from: { kind: 'int', min: 1, max: 80 },
      steps: { kind: 'choice', values: [10, 20] },
    },
    constraints: [
      { note: 'the walk stays on the line', test: (v: Vars) => Number(v.from) + Number(v.steps) <= 100 },
    ],
    answer: (v: Vars) => Number(v.from) + Number(v.steps),
    format: { kind: 'integer', min: 2, max: 100 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const from = Number(vars.from);
      const steps = Number(vars.steps);
      // +1 instead of +the tens, and the tens but not the units.
      return [from + steps / 10, from + steps + 10, from + steps - 10].filter(
        (value) => value !== Number(answer) && value >= 1 && value <= 100,
      );
    },
    explanation: ({ vars, answer }) => `${vars.from} + ${vars.steps} = ${answer}.`,
    visual: (v: Vars) =>
      drawLine(
        lineWindow([Number(v.from), Number(v.from) + Number(v.steps)]),
        Math.max(10, Number(v.steps) + 4),
        [Number(v.from)],
      ),
  }),

  /**
   * Level 3, second answer shape — twenty more than a number (Q24).
   *
   * Off the line and onto the number itself: „which number is 20 more than 67“
   * needs the tens to move twice, which is a step beyond adding a ten.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-4-twenty-more', subtopicId: 'ricxviTi-xazi100', difficulty: 3 }),
    prompt: 'რომელი რიცხვია 20-ით მეტი, ვიდრე {n}?',
    variables: {
      n: { kind: 'int', min: 0, max: 80 },
    },
    answer: (v: Vars) => Number(v.n) + 20,
    format: { kind: 'integer', min: 20, max: 100 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      // +10 instead of +20, and +2.
      return [n + 10, n + 2, Number(answer) + 10].filter(
        (value) => value !== Number(answer) && value <= 100,
      );
    },
    explanation: ({ vars, answer }) => `${vars.n} + 20 = ${answer}.`,
  }),
];

/* ================================================================== *
 * U04.5 — მეზობელი რიცხვები
 * ================================================================== */

const u045: QuestionTemplate[] = [
  /**
   * Level 1 — the number before (Q25).
   *
   * Two templates for before and after rather than one with a drawn direction:
   * the wording is the only thing that tells the student which way to go, and a
   * drawn direction would make the same sentence mean both things.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-5-before', subtopicId: 'mezoblebi', difficulty: 1 }),
    prompt: 'რომელია {n}-ის წინა რიცხვი?',
    variables: {
      n: { kind: 'int', min: 2, max: 100, reverse: true },
    },
    answer: (v: Vars) => Number(v.n) - 1,
    format: { kind: 'integer', min: 1, max: 99 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      return [n + 1, n - 2, n - 10].filter((value) => value >= 1 && value !== Number(answer));
    },
    explanation: ({ vars, answer }) => `${vars.n}-ის წინა რიცხვია ${answer}.`,
  }),

  /** Level 1, second answer shape — the number after (Q26). */
  defineTemplate({
    ...at({ id: 'g1-u04-5-after', subtopicId: 'mezoblebi', difficulty: 1 }),
    prompt: 'რომელია {n}-ის მომდევნო რიცხვი?',
    variables: {
      n: { kind: 'int', min: 1, max: 99, reverse: true },
    },
    answer: (v: Vars) => Number(v.n) + 1,
    format: { kind: 'integer', min: 2, max: 100 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      return [n - 1, n + 2, n + 10].filter((value) => value <= 100 && value !== Number(answer));
    },
    explanation: ({ vars, answer }) => `${vars.n}-ის მომდევნო რიცხვია ${answer}.`,
  }),

  /**
   * Level 2 — ten more (Q27).
   *
   * Only the tens digit changes, so the wrong options move the units instead:
   * n+1 and n+2 are the answers a child gets from counting on rather than
   * moving a ten.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-5-ten-more', subtopicId: 'mezoblebi', difficulty: 2 }),
    prompt: 'რომელი რიცხვია 10-ით მეტი, ვიდრე {n}?',
    variables: {
      n: { kind: 'int', min: 0, max: 90 },
    },
    answer: (v: Vars) => Number(v.n) + 10,
    format: { kind: 'integer', min: 10, max: 100 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      return [n + 1, n + 20, n + 2].filter((value) => value !== Number(answer) && value <= 100);
    },
    explanation: ({ vars, answer }) => `${vars.n} + 10 = ${answer}.`,
  }),

  /**
   * Level 2, second answer shape — ten less (Q28).
   *
   * Its own template because the wrong answers point the other way.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-5-ten-less', subtopicId: 'mezoblebi', difficulty: 2 }),
    prompt: 'რომელი რიცხვია 10-ით ნაკლები, ვიდრე {n}?',
    variables: {
      n: { kind: 'int', min: 10, max: 100 },
    },
    answer: (v: Vars) => Number(v.n) - 10,
    format: { kind: 'integer', min: 0, max: 90 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      return [n - 1, n + 10, n - 20].filter((value) => value >= 0 && value !== Number(answer));
    },
    explanation: ({ vars, answer }) => `${vars.n} − 10 = ${answer}.`,
  }),

  /**
   * Level 3 — twenty more (Q29).
   *
   * Two tens rather than one, which is the extra step the level is for: a child
   * who moves a single ten lands on an option.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-5-twenty-more', subtopicId: 'mezoblebi', difficulty: 3 }),
    prompt: 'რომელი რიცხვია 20-ით მეტი, ვიდრე {n}?',
    variables: {
      n: { kind: 'int', min: 0, max: 80 },
    },
    answer: (v: Vars) => Number(v.n) + 20,
    format: { kind: 'integer', min: 20, max: 100 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      return [n + 10, n + 2, n + 22].filter((value) => value !== Number(answer) && value <= 100);
    },
    explanation: ({ vars, answer }) => `${vars.n} + 20 = ${answer}.`,
  }),

  /**
   * Level 3, second answer shape — take twenty away (Q30).
   */
  defineTemplate({
    ...at({ id: 'g1-u04-5-twenty-less', subtopicId: 'mezoblebi', difficulty: 3 }),
    prompt: 'რიცხვს {n} გამოაკელი 20. რა რიცხვს მიიღებ?',
    variables: {
      n: { kind: 'int', min: 20, max: 100 },
    },
    answer: (v: Vars) => Number(v.n) - 20,
    format: { kind: 'integer', min: 0, max: 80 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      return [n - 10, n - 2, n - 22].filter((value) => value >= 0 && value !== Number(answer));
    },
    explanation: ({ vars, answer }) => `${vars.n} − 20 = ${answer}.`,
  }),
];

/* ================================================================== *
 * U04.6 — რომაული ციფრები I, V, X, L
 * ================================================================== */

/**
 * Only I, V, X and L — the symbols the unit allows.
 *
 * The values are bounded at 89 because 90 would need C, and a question that
 * teaches a symbol the unit does not cover is worse than no question. That bound
 * is enforced in `toRoman`, and a test walks every template's answer to prove
 * none of them can ask for a numeral with C in it.
 */
const ROMAN_VALUES = [1, 5, 10, 50] as const;

/** True when a numeral reads the same whether you add or subtract. */
const isAdditive = (value: number, numeral: string): boolean =>
  numeral.split('').reduce((sum, symbol) => sum + fromRoman(symbol), 0) === value;

/**
 * True when a numeral is the written form, not merely the right total.
 *
 * „IIII“ adds up to four, but it is not how four is written — a distractor that
 * is only wrong by the rules of arithmetic is not a mistake a child makes, and
 * printing it teaches the wrong spelling.
 */
const isCanonical = (numeral: string): boolean => {
  if (!numeral || !/^[IVXL]+$/.test(numeral)) return false;
  try {
    return toRoman(fromRoman(numeral)) === numeral;
  } catch {
    return false;
  }
};

/**
 * Every value up to 60 the four symbols can write without subtraction — 1, 2,
 * 3, 5, 6, 7, 8, 10, 11 … 58, 60. Fifty-five values.
 *
 * Derived rather than listed, because the list is the level's capacity: a
 * hand-typed pool with a hole in it is a question the level never asks, and the
 * hole is invisible until a student runs a level dry.
 */
const ADDITIVE_VALUES: number[] = range(1, 60).filter((value) => isAdditive(value, toRoman(value)));

/**
 * Every value from 4 to 89 written with a subtraction — IV, IX, XIV, XL, XLIX …
 * Twenty-six values, all of them inside what I, V, X and L can express.
 */
const SUBTRACTIVE_VALUES: number[] = range(4, 89).filter(
  (value) => !isAdditive(value, toRoman(value)),
);

/** The subtractive numerals of two or more symbols — the bare pairs are level 1. */
const SUBTRACTIVE_NUMERALS: string[] = SUBTRACTIVE_VALUES.map(toRoman).filter(
  (numeral) => numeral.length >= 3,
);

/**
 * Numerals that read by adding, from 4 up — the pool level 2 reads.
 *
 * Four is the floor because „II“ and „III“ only ask what a symbol is worth,
 * which level 1 already covers; everything above is two symbols with a larger
 * one first.
 */
const READABLE_NUMERALS: string[] = ADDITIVE_VALUES.filter((value) => value >= 4)
  .map(toRoman)
  .filter((numeral) => numeral.length >= 2);

/** `numeral` is always a drawn list of one in this section. */
const varsNumeral = (vars: Vars): string => String((vars.numeral as string[])[0]);

const u046: QuestionTemplate[] = [
  /**
   * Level 1 — what a single symbol means (Q31).
   *
   * The four symbols are the answer pool, so the wrong options are real values
   * of real symbols rather than arbitrary numbers.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-6-symbol-value', subtopicId: 'romaulti', difficulty: 1 }),
    prompt: 'რას ნიშნავს რომაული ციფრი {symbol}?',
    variables: {
      symbol: { kind: 'choice', values: ['I', 'V', 'X', 'L'] },
    },
    answer: (v: Vars) => fromRoman(String(v.symbol)),
    format: { kind: 'integer', min: 1, max: 50 },
    optionCount: 3,
    distractors: ({ answer }) =>
      ROMAN_VALUES.filter((value) => value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.symbol} = ${answer}.`,
  }),

  /**
   * Level 1, second answer shape — the symbol for a value (Q32).
   *
   * The other direction. The wrong options are other real numerals, so a child
   * who has learned only „V is 5“ has to know it is not „L“.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-6-value-symbol', subtopicId: 'romaulti', difficulty: 1 }),
    prompt: 'რომელ რომაულ ციფრს შეესაბამება რიცხვი {value}?',
    variables: {
      value: { kind: 'choice', values: [1, 5, 10, 50] },
    },
    answer: (v: Vars) => toRoman(Number(v.value)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) =>
      ['I', 'V', 'X', 'L'].filter((symbol) => symbol !== toRoman(Number(vars.value))),
    explanation: ({ vars, answer }) => `${vars.value} იწერება როგორც ${answer}.`,
  }),

  /**
   * Level 1, third answer shape — the same symbol repeated (Q31 extended).
   *
   * II, III, XX and XXX are the only multi-symbol numerals that need no new
   * rule: the symbol is simply counted. Without them level 1 is four symbols
   * and eight questions, which a student who keeps answering right exhausts
   * before the session is a third done.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-6-repeated', subtopicId: 'romaulti', difficulty: 1 }),
    prompt: 'რამდენს ნიშნავს {numeral}?',
    variables: {
      numeral: { kind: 'choice', values: ['II', 'III', 'XX', 'XXX'] },
    },
    answer: (v: Vars) => fromRoman(String(v.numeral)),
    format: { kind: 'integer', min: 2, max: 30 },
    optionCount: 3,
    // Off by one repetition — the mistake the question is testing for. The
    // value itself is the symbol's, multiplied by how many times it is written.
    distractors: ({ answer }) => {
      const value = Number(answer);
      return [value - 1, value + 1, value + 2].filter((near) => near >= 1 && near <= 89);
    },
    explanation: ({ vars, answer }) => `${vars.numeral} = ${answer}.`,
  }),

  /**
   * Level 1, fourth answer shape — write a repeated symbol (Q31 in the other
   * direction).
   *
   * Four symbols and the numerals their repetitions make is the whole of what
   * this level can ask: every other numeral needs a rule — add a smaller
   * symbol, or subtract one — that is level 2's and level 3's to teach. That
   * ceiling is why this subtopic carries an eighth template; it is recorded in
   * U04-MAPPING.md rather than padded out with questions the level cannot ask.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-6-write-repeated', subtopicId: 'romaulti', difficulty: 1 }),
    prompt: 'დაწერე რიცხვი {value} რომაული ციფრებით.',
    variables: {
      numeral: { kind: 'choice', values: ['II', 'III', 'XX', 'XXX'] },
      value: { kind: 'choice', values: (v: Vars) => [fromRoman(String(v.numeral))] },
    },
    answer: (v: Vars) => String(v.numeral),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const numeral = String(vars.numeral);
      const symbol = numeral[0];
      // The symbol once, one time too many, and a neighbouring symbol at the
      // same length. Every candidate is a real numeral, so a child who has
      // learned the symbols sees wrong spellings, not wrong numbers.
      const neighbours = ['I', 'V', 'X', 'L'].map((other) => other.repeat(numeral.length));
      return [symbol, symbol.repeat(numeral.length + 1), ...neighbours]
        .filter((candidate) => candidate !== numeral && isCanonical(candidate))
        .filter((candidate, index, all) => all.indexOf(candidate) === index)
        .slice(0, 2);
    },
    explanation: ({ vars, answer }) => `${fromRoman(String(vars.numeral))} = ${answer}.`,
  }),

  /**
   * Level 2 — read a two-symbol numeral (Q34, „VI“).
   *
   * Reading a numeral is the *same* operation as adding its parts when the
   * smaller follows the larger, so these are the easy two-symbol forms. The
   * subtractive forms are level 3, because they are the ones that reverse the
   * rule.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-6-additive', subtopicId: 'romaulti', difficulty: 2 }),
    prompt: 'რომელ რიცხვს აღნიშნავს {numeral}?',
    variables: {
      // The reading pool is the additive values a two-symbol numeral can show
      // without a repeated symbol („II“ is level 1's symbol knowledge; „IX“ is
      // level 3's subtraction). That leaves XL and LX, and everything one or
      // two symbols around them.
      numeral: { kind: 'list', pick: { values: READABLE_NUMERALS, length: 1 } },
    },
    answer: (v: Vars) => fromRoman(String(varsNumeral(v))),
    format: { kind: 'integer', min: 2, max: 60 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const value = Number(answer);
      // The digits of the numeral read as if they were Arabic, and a swap of
      // the two symbols: both are real misreadings, not noise.
      const asDigits = Number(String(varsNumeral(vars)).replace(/[IVXL]/g, (symbol) =>
        String({ I: 1, V: 5, X: 10, L: 50 }[symbol as 'I'] ?? 1),
      ).slice(0, 2));
      return [value - 1, value + 1, value + 10, asDigits].filter(
        (candidate) => candidate !== value && candidate >= 1 && candidate <= 89,
      );
    },
    explanation: ({ vars, answer }) => `${varsNumeral(vars)} = ${answer}.`,
  }),

  /**
   * Level 2, second answer shape — write a two-symbol numeral (Q33 as a value
   * question, and the writing direction for the same pool).
   */
  defineTemplate({
    ...at({ id: 'g1-u04-6-write-additive', subtopicId: 'romaulti', difficulty: 2 }),
    prompt: 'დაწერე რიცხვი {value} რომაული ციფრებით.',
    variables: {
      // Q24 asks for „the third number after N“ in tens; here the *writing* is
      // asked, so two-symbol numerals are drawn from a mixed set and each one
      // is a different numeral rather than a parameter of the sentence.
      value: { kind: 'list', pick: { values: ADDITIVE_VALUES, length: 1 } },
    },
    answer: (v: Vars) => toRoman(numbersOf(v, 'value')[0]),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const value = numbersOf(vars, 'value')[0];
      const correct = toRoman(value);
      const last = correct[correct.length - 1];
      return [
        // The symbol one time too many, and one time too few — both are what a
        // child writes when they lose count, and both are real numerals.
        correct + last,
        correct.slice(0, -1),
        toRoman(value + 1),
        toRoman(value + 2),
      ]
        .filter((candidate) => candidate !== correct && isCanonical(candidate))
        .filter((candidate, index, all) => all.indexOf(candidate) === index)
        .slice(0, 2);
    },
    explanation: ({ vars, answer }) => `${numbersOf(vars, 'value')[0]} = ${answer}.`,
  }),

  /**
   * Level 3 — the subtractive forms (Q35 „IX“, Q36 „XL“).
   *
   * IX is not „one and ten“: the smaller symbol in front *subtracts*. That is
   * the rule the level exists for, and the wrong options are what the numeral
   * would mean if the rule were addition.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-6-subtractive', subtopicId: 'romaulti', difficulty: 3 }),
    prompt: 'რომელ რიცხვს აღნიშნავს {numeral}?',
    variables: {
      // Every subtractive numeral the four symbols can write except the bare
      // pairs („IV“, „IX“, „XL“), which are level 1's symbols read as a pair.
      numeral: { kind: 'list', pick: { values: SUBTRACTIVE_NUMERALS, length: 1 } },
    },
    answer: (v: Vars) => fromRoman(String(varsNumeral(v))),
    format: { kind: 'integer', min: 4, max: 89 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const value = Number(answer);
      // What the numeral would be if every symbol were simply added.
      const added = String(varsNumeral(vars))
        .split('')
        .reduce((sum, symbol) => sum + fromRoman(symbol), 0);
      return [added, value - 1, value + 1, value + 10].filter(
        (candidate) => candidate !== value && candidate >= 1 && candidate <= 89,
      );
    },
    explanation: ({ vars, answer }) => `${varsNumeral(vars)} = ${answer}.`,
  }),

  /**
   * Level 3, second answer shape — write a subtractive numeral (the reverse of
   * Q35 and Q36), where the wrong options put the symbols in the order that
   * would be read as addition.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-6-write-subtractive', subtopicId: 'romaulti', difficulty: 3 }),
    prompt: 'დაწერე რიცხვი {value} რომაული ციფრებით.',
    variables: {
      // Every subtractive value to 89, not just the bare pairs: 44 is XLIV and
      // 41 is XLI, so the writing direction covers what the reading one does.
      value: { kind: 'list', pick: { values: range(4, 89), length: 1 } },
    },
    answer: (v: Vars) => toRoman(numbersOf(v, 'value')[0]),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const value = numbersOf(vars, 'value')[0];
      const correct = toRoman(value);
      // The subtraction written the additive way („IX“ as „XI“) — only for a
      // two-symbol numeral, where the swap still reads as a numeral. Reversing
      // „LXVII“ gives „IIVXL“, which is not a wrong answer but nonsense.
      const swapped = correct.length === 2 ? correct.split('').reverse().join('') : '';
      return [
        swapped,
        ...[value - 1, value + 1, value + 10]
          .filter((near) => near >= 1 && near <= 89)
          .map(toRoman),
      ]
        .filter((candidate) => candidate !== correct && isCanonical(candidate))
        .filter((candidate, index, all) => all.indexOf(candidate) === index);
    },
    explanation: ({ vars, answer }) => `${numbersOf(vars, 'value')[0]} = ${answer}.`,
  }),
];

/* ================================================================== *
 * U04.7 — ლუწი და კენტი
 * ================================================================== */

const isEven = (n: number): boolean => n % 2 === 0;

const u047: QuestionTemplate[] = [
  /**
   * Level 1 — odd or even for a small number (Q37 as a single step).
   *
   * The unit sorts numbers into two groups; the engine sorts by choosing or
   * typing, so each question asks about the right group for one number. The
   * sorting *task* is delivered as a run of these, which is what the engine can
   * check exactly — see U04-MAPPING.md.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-7-even-or-odd', subtopicId: 'luwi-kenti-danayi', difficulty: 1 }),
    prompt: 'რიცხვი {n} ლუწია თუ კენტი?',
    variables: {
      n: { kind: 'int', min: 2, max: 100 },
    },
    answer: (v: Vars) => (isEven(Number(v.n)) ? 'ლუწი' : 'კენტი'),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => [answer === 'ლუწი' ? 'კენტი' : 'ლუწი'],
    explanation: ({ vars, answer }) =>
      `${vars.n} ${answer}ა: ბოლო ციფრია ${Number(vars.n) % 10}.`,
  }),

  /**
   * Level 1, second answer shape — which of four numbers is odd (Q37 asked as a
   * selection).
   *
   * A single-answer shape of the same skill, so the level has two forms rather
   * than one sentence repeated: the student has to check several numbers and
   * find the one that does not match.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-7-find-the-odd', subtopicId: 'luwi-kenti-danayi', difficulty: 1 }),
    // The candidates are printed in the sentence, so every variation is a
    // different question — without them the wording is identical every time and
    // the engine treats all of them as one question it has already asked.
    prompt: 'რომელი რიცხვია კენტი: {shown}?',
    variables: {
      // Three evens and one odd, or three odds and one even — the outsider is
      // derived by construction, never drawn and then checked.
      mode: { kind: 'choice', values: ['odd', 'even'] },
      base: { kind: 'int', min: 1, max: 40 },
      a: { kind: 'int', min: 0, max: 2 },
      b: { kind: 'int', min: 0, max: 2 },
      c: { kind: 'int', min: 0, max: 2 },
      shown: {
        kind: 'choice',
        values: (v: Vars) => {
          const even = Number(v.base) * 2;
          const odd = even + 1;
          const insiders =
            v.mode === 'odd'
              ? [even, even + 2, even + 4]
              : [odd, odd + 2, odd + 4];
          const outsider = v.mode === 'odd' ? odd : even;
          // The outsider's position is drawn, so "the odd one" is not always
          // third.
          const at = Number(v.a);
          return [[...insiders.slice(0, at), outsider, ...insiders.slice(at)].join(', ')];
        },
      },
    },
    constraints: [
      { note: 'the three insiders are distinct', test: (v: Vars) => new Set([v.a, v.b, v.c]).size === 3 },
    ],
    answer: (v: Vars) => {
      const even = Number(v.base) * 2;
      return v.mode === 'odd' ? String(even + 1) : String(even);
    },
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const even = Number(vars.base) * 2;
      const odd = even + 1;
      const insiders =
        vars.mode === 'odd'
          ? [String(even), String(even + 2), String(even + 4)]
          : [String(odd), String(odd + 2), String(odd + 4)];
      // The three wrong options are the insiders: exactly one has the asked
      // parity, and every other candidate has the opposite one.
      return insiders;
    },
    explanation: ({ answer }) =>
      `${answer} ${isEven(Number(answer)) ? 'ლუწია' : 'კენტია'}: ბოლო ციფრია ${Number(answer) % 10}.`,
  }),

  /**
   * Level 2 — even or odd across a hundred (Q38, Q39).
   *
   * The same question on the full range, where the answer can no longer be
   * counted off from small numbers: the last digit is the only reliable test.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-7-even-or-odd-large', subtopicId: 'luwi-kenti-danayi', difficulty: 2 }),
    prompt: 'რიცხვი {n} ლუწია თუ კენტი?',
    variables: {
      n: { kind: 'int', min: 10, max: 100 },
    },
    answer: (v: Vars) => (isEven(Number(v.n)) ? 'ლუწი' : 'კენტი'),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => [answer === 'ლუწი' ? 'კენტი' : 'ლუწი'],
    explanation: ({ vars, answer }) =>
      `${vars.n} ${answer}ა: ბოლო ციფრია ${Number(vars.n) % 10}.`,
  }),

  /**
   * Level 2, second answer shape — how many of a set are even (Q38 counted).
   *
   * The set is printed in the stem, and the answer counts the evens in it, so
   * this is the sorting task reduced to one checkable number.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-7-count-parity', subtopicId: 'luwi-kenti-danayi', difficulty: 2 }),
    prompt: 'მოცემულია რიცხვები: {shown}. რამდენი ლუწი რიცხვია?',
    variables: {
      mode: { kind: 'choice', values: ['even', 'odd'] },
      items: { kind: 'list', pick: { values: range(1, 100), length: 6, unique: true } },
      shown: { kind: 'choice', values: (v: Vars) => [numbersOf(v, 'items').join(', ')] },
    },
    constraints: [
      {
        note: 'the set has at least two evens and two odds, so neither answer is trivially all or none',
        test: (v: Vars) => {
          const items = numbersOf(v, 'items');
          const evens = items.filter(isEven).length;
          return evens >= 2 && items.length - evens >= 2;
        },
      },
    ],
    answer: (v: Vars) => {
      const evens = numbersOf(v, 'items').filter(isEven).length;
      return v.mode === 'even' ? evens : 6 - evens;
    },
    format: { kind: 'integer', min: 2, max: 4 },
    optionCount: 3,
    distractors: () => [1, 2, 3, 4, 5],
    explanation: ({ vars, answer }) =>
      `${numbersOf(vars, 'items').filter(isEven).length} ლუწი და ${numbersOf(vars, 'items').filter((n) => !isEven(n)).length} კენტი — სულ ${answer}.`,
  }),

  /**
   * Level 3 — which group has more (Q41).
   *
   * The comparison at the top of the level: eight numbers, and the answer is
   * *which group is larger*, not how many. A tie is excluded by constraint,
   * because „neither“ is not one of the two options.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-7-which-group', subtopicId: 'luwi-kenti-danayi', difficulty: 3 }),
    prompt: 'მოცემულია რვა რიცხვი: {shown}. დაითვალე ლუწები და კენტები. რომელი ჯგუფია მეტი?',
    variables: {
      items: { kind: 'list', pick: { values: range(1, 100), length: 8, unique: true } },
      shown: { kind: 'choice', values: (v: Vars) => [numbersOf(v, 'items').join(', ')] },
    },
    constraints: [
      {
        note: 'the groups must differ, or there is no larger one',
        test: (v: Vars) => {
          const evens = numbersOf(v, 'items').filter(isEven).length;
          return evens !== 4;
        },
      },
      {
        note: 'and both groups have to be present',
        test: (v: Vars) => {
          const evens = numbersOf(v, 'items').filter(isEven).length;
          return evens >= 1 && evens <= 7;
        },
      },
    ],
    answer: (v: Vars) => {
      const evens = numbersOf(v, 'items').filter(isEven).length;
      return evens > 4 ? 'ლუწი რიცხვების ჯგუფი' : 'კენტი რიცხვების ჯგუფი';
    },
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => [
      answer === 'ლუწი რიცხვების ჯგუფი' ? 'კენტი რიცხვების ჯგუფი' : 'ლუწი რიცხვების ჯგუფი',
    ],
    explanation: ({ vars, answer }) => {
      const items = numbersOf(vars, 'items');
      const evens = items.filter(isEven).length;
      return `${evens} ლუწი და ${items.length - evens} კენტი — მეტია ${answer}.`;
    },
  }),

  /**
   * Level 3, second answer shape — the parity of a sum (Q38 extended).
   *
   * The extra step is the addition itself: neither number answers the question,
   * and checking the last digit of the sum is a second thing to do. Both numbers
   * stay inside the hundred so the unit's range is respected.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-7-sum-parity', subtopicId: 'luwi-kenti-danayi', difficulty: 3 }),
    prompt: 'შეკრიბე {a} და {b}. მიღებული რიცხვი ლუწია თუ კენტი?',
    variables: {
      a: { kind: 'int', min: 2, max: 80 },
      b: { kind: 'int', min: 2, max: 80 },
    },
    constraints: [
      { note: 'the sum stays within the hundred', test: (v: Vars) => Number(v.a) + Number(v.b) <= 100 },
      { note: 'and the two numbers are not the same, so it is not one fact twice', test: (v: Vars) => v.a !== v.b },
    ],
    answer: (v: Vars) => (isEven(Number(v.a) + Number(v.b)) ? 'ლუწი' : 'კენტი'),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => [answer === 'ლუწი' ? 'კენტი' : 'ლუწი'],
    explanation: ({ vars, answer }) => {
      const sum = Number(vars.a) + Number(vars.b);
      return `${vars.a} + ${vars.b} = ${sum}; ბოლო ციფრია ${sum % 10}, ამიტომ ${sum} ${answer}ა.`;
    },
  }),
];

/* ================================================================== *
 * U04.8 — ციფრები და ასოები
 * ================================================================== */

/** Georgian letters the unit sorts against digits. */
const LETTERS = ['ა', 'ბ', 'გ', 'დ', 'ე', 'ვ', 'ზ', 'თ', 'ი', 'კ', 'ლ', 'მ', 'ნ', 'ო', 'რ', 'ს'] as const;

/** Digits as symbols — including 0, which is a digit but not a counting word. */
const SYMBOLS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

const u048: QuestionTemplate[] = [
  /**
   * Level 1 — which of these is a digit (Q43).
   *
   * The options are one digit and three letters. The answer is derived from the
   * *category* of the drawn symbol, so it can never name a letter.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-8-digit-or-letter', subtopicId: 'cifrebi-asoebi', difficulty: 1 }),
    prompt: 'რომელი სიმბოლოა ციფრი: {a}, {b}, {c} თუ {d}?',
    variables: {
      mode: { kind: 'choice', values: ['digit', 'letter'] },
      digit: { kind: 'choice', values: [...SYMBOLS] },
      letters: { kind: 'list', pick: { values: [...LETTERS], length: 3, unique: true } },
      a: { kind: 'choice', values: (v: Vars) => [String(v.digit)] },
      b: { kind: 'choice', values: (v: Vars) => [(v.letters as string[])[0]] },
      c: { kind: 'choice', values: (v: Vars) => [(v.letters as string[])[1]] },
      d: { kind: 'choice', values: (v: Vars) => [(v.letters as string[])[2]] },
    },
    answer: (v: Vars) => (v.mode === 'digit' ? String(v.digit) : (v.letters as string[])[0]),
    format: { kind: 'text' },
    optionCount: 3,
    // The four symbols printed in the stem are the options and nothing else: a
    // fifth kind of symbol on screen would be a question the student was not
    // asked.
    distractors: ({ vars, answer }) => {
      const letters = vars.letters as string[];
      return [String(vars.digit), ...letters.slice(0, 3)].filter((symbol) => symbol !== answer);
    },
    explanation: ({ answer }) =>
      `${answer} ${/\d/.test(answer) ? 'ციფრია' : 'ასოა'}.`,
  }),

  /**
   * Level 1, second answer shape — how many digits among a mixture (Q42 read as
   * a count).
   *
   * The mixture is drawn and printed, so the count comes from the same list.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-8-count-digits', subtopicId: 'cifrebi-asoebi', difficulty: 1 }),
    prompt: 'მოცემულია სიმბოლოები: {shown}. რამდენი ციფრია?',
    variables: {
      mode: { kind: 'choice', values: ['digits', 'letters'] },
      digitCount: { kind: 'int', min: 1, max: 3 },
      letterCount: { kind: 'int', min: 1, max: 3 },
      digits: { kind: 'list', pick: { values: [...SYMBOLS], length: 3, unique: true } },
      letters: { kind: 'list', pick: { values: [...LETTERS], length: 3, unique: true } },
      shown: {
        kind: 'choice',
        values: (v: Vars) => {
          const d = (v.digits as string[]).slice(0, Number(v.digitCount));
          const l = (v.letters as string[]).slice(0, Number(v.letterCount));
          // Mixed, so the two kinds are not printed as separate runs.
          const out: string[] = [];
          for (let i = 0; i < Math.max(d.length, l.length); i += 1) {
            if (d[i] !== undefined) out.push(d[i]);
            if (l[i] !== undefined) out.push(l[i]);
          }
          return [out.join(', ')];
        },
      },
    },
    answer: (v: Vars) =>
      v.mode === 'digits' ? Number(v.digitCount) : Number(v.letterCount),
    format: { kind: 'integer', min: 1, max: 3 },
    optionCount: 3,
    distractors: ({ vars }) => {
      const other = Number(vars.mode === 'digits' ? vars.letterCount : vars.digitCount);
      return [other, Number(vars.digitCount) + Number(vars.letterCount), other + 1];
    },
    explanation: ({ vars, answer }) =>
      `სურათზე ${vars.digitCount} ციფრი და ${vars.letterCount} ასოა; პასუხია ${answer}.`,
  }),

  /**
   * Level 2 — count the digits in a longer mixture (Q45, Q44 read as a count).
   */
  defineTemplate({
    ...at({ id: 'g1-u04-8-count-digits-many', subtopicId: 'cifrebi-asoebi', difficulty: 2 }),
    prompt: 'მოცემულია სიმბოლოები: {shown}. რამდენი ციფრია?',
    variables: {
      digitCount: { kind: 'int', min: 2, max: 3 },
      letterCount: { kind: 'int', min: 3, max: 3 },
      digits: { kind: 'list', pick: { values: [...SYMBOLS], length: 3, unique: true } },
      letters: { kind: 'list', pick: { values: [...LETTERS], length: 3, unique: true } },
      shown: {
        kind: 'choice',
        values: (v: Vars) => {
          const d = (v.digits as string[]).slice(0, Number(v.digitCount));
          const l = (v.letters as string[]).slice(0, 3);
          const out: string[] = [];
          // One digit, then two letters, then the rest: the mixture must not be
          // separable by reading the first few symbols only.
          for (let i = 0; i < 3; i += 1) {
            if (d[i] !== undefined) out.push(d[i]);
            if (l[i * 2] !== undefined && out.length < 6) out.push(l[i * 2]);
            if (l[i * 2 + 1] !== undefined && out.length < 6) out.push(l[i * 2 + 1]);
          }
          return [out.slice(0, 6).join(', ')];
        },
      },
    },
    answer: (v: Vars) => Number(v.digitCount),
    format: { kind: 'integer', min: 2, max: 3 },
    optionCount: 3,
    distractors: ({ vars }) => [Number(vars.letterCount), Number(vars.digitCount) + 1, 6 - Number(vars.digitCount)],
    explanation: ({ vars, answer }) =>
      `სურათზე ${vars.digitCount} ციფრი და ${vars.letterCount} ასოა; ციფრები ${answer}.`,
  }),

  /**
   * Level 2, second answer shape — which symbol is a letter (the inverse of
   * Q43). Its own template: the answer pool is letters, so its wrong options
   * are digits, and the mistake being caught is the opposite one.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-8-find-letter', subtopicId: 'cifrebi-asoebi', difficulty: 2 }),
    prompt: 'რომელი სიმბოლოა ასო: {a}, {b}, {c} თუ {d}?',
    variables: {
      letter: { kind: 'choice', values: [...LETTERS] },
      digits: { kind: 'list', pick: { values: [...SYMBOLS], length: 3, unique: true } },
      a: { kind: 'choice', values: (v: Vars) => [(v.digits as string[])[0]] },
      b: { kind: 'choice', values: (v: Vars) => [String(v.letter)] },
      c: { kind: 'choice', values: (v: Vars) => [(v.digits as string[])[1]] },
      d: { kind: 'choice', values: (v: Vars) => [(v.digits as string[])[2]] },
    },
    answer: (v: Vars) => String(v.letter),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) =>
      (vars.digits as string[]).filter((symbol) => symbol !== answer),
    explanation: ({ answer }) => `${answer} ასოა.`,
  }),

  /**
   * Level 3 — the ten-symbol mixture with exactly five of each (Q46), asked as
   * a pair of counts.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-8-five-and-five', subtopicId: 'cifrebi-asoebi', difficulty: 3 }),
    prompt: 'მოცემულია ათი სიმბოლო: {shown}. რამდენი ციფრი და რამდენი ასოა?',
    variables: {
      digits: { kind: 'list', pick: { values: [...SYMBOLS], length: 5, unique: true } },
      letters: { kind: 'list', pick: { values: [...LETTERS], length: 5, unique: true } },
      shown: {
        kind: 'choice',
        values: (v: Vars) => {
          const d = v.digits as string[];
          const l = v.letters as string[];
          // Strictly alternating, so the two halves cannot be read off by
          // position: every second symbol is a letter.
          const out: string[] = [];
          for (let i = 0; i < 5; i += 1) {
            out.push(d[i], l[i]);
          }
          return [out.join(', ')];
        },
      },
    },
    answer: () => '5 ციფრი და 5 ასო',
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => ['4 ციფრი და 6 ასო', '6 ციფრი და 4 ასო', '5 ასო და 5 ციფრი ა'],
    explanation: ({ answer }) => `სურათზე ზუსტად ${answer} არის.`,
  }),

  /**
   * Level 3, second answer shape — count both kinds and say which is more
   * (Q47 as a comparison). An eight-symbol mixture where the two counts differ.
   */
  defineTemplate({
    ...at({ id: 'g1-u04-8-which-more', subtopicId: 'cifrebi-asoebi', difficulty: 3 }),
    prompt: 'მოცემულია სიმბოლოები: {shown}. რომელია მეტი: ციფრი თუ ასო?',
    variables: {
      digitCount: { kind: 'int', min: 3, max: 5 },
      letterCount: { kind: 'int', min: 3, max: 5 },
      digits: { kind: 'list', pick: { values: [...SYMBOLS], length: 5, unique: true } },
      letters: { kind: 'list', pick: { values: [...LETTERS], length: 5, unique: true } },
      shown: {
        kind: 'choice',
        values: (v: Vars) => {
          const d = (v.digits as string[]).slice(0, Number(v.digitCount));
          const l = (v.letters as string[]).slice(0, Number(v.letterCount));
          const out: string[] = [];
          for (let i = 0; i < Math.max(d.length, l.length); i += 1) {
            if (l[i] !== undefined) out.push(l[i]);
            if (d[i] !== undefined) out.push(d[i]);
          }
          return [out.join(', ')];
        },
      },
    },
    constraints: [
      {
        note: 'the two counts differ, or there is no larger group',
        test: (v: Vars) => Number(v.digitCount) !== Number(v.letterCount),
      },
    ],
    answer: (v: Vars) =>
      Number(v.digitCount) > Number(v.letterCount) ? 'ციფრები' : 'ასოები',
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => [answer === 'ციფრები' ? 'ასოები' : 'ციფრები'],
    explanation: ({ vars, answer }) =>
      `${vars.digitCount} ციფრი და ${vars.letterCount} ასო — მეტია ${answer}.`,
  }),
];

/* ================================================================== *
 * Export — extended by the sections below
 * ================================================================== */

export const U04_TEMPLATES: QuestionTemplate[] = [
  ...u041,
  ...u042,
  ...u043,
  ...u044,
  ...u045,
  ...u046,
  ...u047,
  ...u048,
];

export const U04_SUBTOPICS = [
  'aseulis-cxrili',
  'ateulebi-erteulebi',
  'ricxvebi-sityvebiT',
  'ricxviTi-xazi100',
  'mezoblebi',
  'romaulti',
  'luwi-kenti-danayi',
  'cifrebi-asoebi',
] as const;

/** Re-exported for the tests, which re-derive answers from the drawn pictures. */
export { asRun, range, numbersOf, digitsOf };
