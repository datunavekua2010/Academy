import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

/**
 * U02 — რიცხვები 20-ის ფარგლებში (numbers within twenty).
 *
 * The academy's second grade-1 unit, replacing the placeholders that used to
 * sit on these seven subtopics.
 *
 * Three rules run through every template here:
 *
 *  1. **Nothing printed is a constant.** A question that always shows four
 *     stars and asks how many is one question asked forever. Every number a
 *     student reads is drawn, so one template yields many questions.
 *  2. **The answer is computed from what is displayed.** The star row is built
 *     from the same count the answer is read from, so no seed can print seven
 *     stars and key an answer of six.
 *  3. **Nothing is asserted about a picture that was not drawn.** A row of
 *     books is drawn once and both the stem and the answer index into it.
 *
 * Georgian number names are built from their parts rather than listed as
 * twenty strings, so widening a range cannot leave half the words missing.
 */

/* ================================================================== *
 * Number names
 * ================================================================== */

/** 1–10 are irregular; no suffix rule produces them. */
const UNITS = [
  '',
  'ერთი',
  'ორი',
  'სამი',
  'ოთხი',
  'ხუთი',
  'ექვსი',
  'შვიდი',
  'რვა',
  'ცხრა',
  'ათი',
] as const;

/**
 * 11–19 are single words whose stems do not follow from the digits —
 * თერთმეტი is not "one-ten". They are also the stems the tens are built on,
 * so they are listed once.
 */
const TEENS = [
  '',
  'თერთმეტი',
  'თორმეტი',
  'ცამეტი',
  'თოთხმეტი',
  'თხუთმეტი',
  'თექვსმეტი',
  'ჩვიდმეტი',
  'თვრამეტი',
  'ცხრამეტი',
] as const;

const MAX_NUMBER = 20;

const nameOfNumber = (n: number): string => {
  if (!Number.isInteger(n) || n < 1 || n > MAX_NUMBER) {
    throw new Error(`U02 names 1–${MAX_NUMBER}; asked for ${n}`);
  }
  if (n <= 10) return UNITS[n];
  if (n < 20) return TEENS[n - 10];
  return 'ოცი';
};

/** Georgian ordinals, 1st–10th. */
const ORDINALS = [
  'პირველი',
  'მეორე',
  'მესამე',
  'მეოთხე',
  'მეხუთე',
  'მეექვსე',
  'მეშვიდე',
  'მერვე',
  'მეცხრე',
  'მეათე',
] as const;

const ordinalOf = (n: number): string => {
  if (n < 1 || n > ORDINALS.length) throw new Error(`no ordinal for ${n}`);
  return ORDINALS[n - 1];
};

/** `[1, 2, 3]` → `"1, 2, 3"`, the way a sequence is printed in a stem. */
const asRun = (numbers: number[]): string => numbers.join(', ');

const runOf = (start: number, length: number): number[] =>
  Array.from({ length }, (_, index) => start + index);

/**
 * The same run with some of its numbers replaced by blanks.
 *
 * The printed row and the answer are generated from one start, so a template
 * can never remove 15 from a row that does not contain it.
 */
const runWithGaps = (start: number, length: number, gaps: number[]): string =>
  runOf(start, length)
    .map((number, index) => (gaps.includes(index + 1) ? '__' : String(number)))
    .join(', ');

/**
 * Numbers either side of `n`, nearest first. A wrong option for "how many
 * objects are there?" has to be a countable neighbour: 12 is a plausible
 * miscount of eleven objects, 3 is not.
 */
const neighbouring = (n: number, min: number, max: number, spread = 2): number[] => {
  const out: number[] = [];
  for (let delta = 1; delta <= spread * 2; delta += 1) {
    if (n - delta >= min) out.push(n - delta);
    if (n + delta <= max) out.push(n + delta);
  }
  return out;
};

/** Distinct integers drawn as one list, so a question about them is coherent. */
const distinctNumbers = (count: number, min: number, max: number) => ({
  kind: 'list' as const,
  pick: {
    values: Array.from({ length: max - min + 1 }, (_, index) => min + index),
    length: count,
    unique: true,
  },
});

const ONE_TO_TWENTY = Array.from({ length: MAX_NUMBER }, (_, index) => index + 1);

const numbersOf = (vars: Vars, key: string): number[] =>
  (vars[key] as Array<number | string>).map(Number);

/* ================================================================== *
 * Address
 * ================================================================== */

const grade = 1 as const;
const topicId = 'ricxvebi20';
const unitId = 'ricxvebi20';

interface Addressed {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
}

/** Every template in this file is addressed the same way. */
const at = ({ id, subtopicId, difficulty }: Addressed) => ({
  id,
  grade,
  topicId,
  unitId,
  subtopicId,
  difficulty,
});

/* ================================================================== *
 * U02.1 — რიცხვები 1-დან 10-მდე
 * ================================================================== */

interface Toy {
  emoji: string;
  /** Singular, which is also what Georgian prints after a numeral. */
  name: string;
}

const TOYS: Toy[] = [
  { emoji: '⭐', name: 'ვარსკვლავი' },
  { emoji: '🍎', name: 'ვაშლი' },
  { emoji: '🎈', name: 'ბუშტი' },
  { emoji: '🐟', name: 'თევზი' },
  { emoji: '🌼', name: 'ყვავილი' },
  { emoji: '⚽', name: 'ბურთი' },
  { emoji: '🍌', name: 'ბანანი' },
  { emoji: '🔔', name: 'ზარი' },
];

const toyByEmoji = (emoji: string): Toy => TOYS.find((toy) => toy.emoji === emoji)!;
const toyByName = (name: string): Toy => TOYS.find((toy) => toy.name === name)!;
const TOY_EMOJIS = TOYS.map((toy) => toy.emoji);
const TOY_NAMES = TOYS.map((toy) => toy.name);

const u021: QuestionTemplate[] = [
  /**
   * Level 1 — recognise the number behind a quantity.
   *
   * Two presentations share one template because they ask the same thing from
   * the same side: the quantity is given, the digit has to be named. It is
   * given either as a drawn row or as a word.
   */
  defineTemplate({
    ...at({ id: 'g1-u02-1-quantity-to-number', subtopicId: 'ricxvebi1-10', difficulty: 1 }),
    prompt: 'რომელი რიცხვი შეესაბამება {ask}?',
    variables: {
      mode: { kind: 'choice', values: ['picture', 'word'] },
      count: { kind: 'int', min: 1, max: 10 },
      toy: { kind: 'choice', values: TOY_EMOJIS },
      // The sentence is derived from the drawn mode and count, so the word
      // printed is always the word for the answer — never a neighbouring one.
      ask: {
        kind: 'choice',
        values: (v: Vars) =>
          v.mode === 'picture'
            ? ['სურათზე გამოსახული ობიექტების რაოდენობას']
            : [`სიტყვას „${nameOfNumber(Number(v.count))}“`],
      },
    },
    answer: (v: Vars) => Number(v.count),
    format: { kind: 'integer', min: 1 },
    optionCount: 3,
    distractors: ({ answer }) => neighbouring(Number(answer), 1, 10),
    explanation: ({ vars, answer }) =>
      vars.mode === 'picture'
        ? `სურათზე ${answer} ობიექტია.`
        : `„${nameOfNumber(Number(answer))}“ არის ${answer}.`,
    // A word question has nothing to draw; an empty picture is simply omitted.
    visual: (v: Vars) => (v.mode === 'picture' ? toyByEmoji(String(v.toy)).emoji.repeat(Number(v.count)) : ''),
  }),

  /**
   * Level 2 — produce the missing number in a run.
   *
   * The row is printed from its start and the gap is drawn, so the two can
   * never disagree. `shown` is a declared variable holding the rendered row:
   * it is the only way the wording can vary from draw to draw.
   */
  defineTemplate({
    ...at({ id: 'g1-u02-1-missing-in-run', subtopicId: 'ricxvebi1-10', difficulty: 2 }),
    prompt: 'შეიყვანე რიცხვი, რომელიც აკლია: {shown}.',
    variables: {
      // A run of four, five or six numbers, starting anywhere it still fits
      // under ten — three lengths rather than one, so the missing number is not
      // always in the middle of a five-long run.
      length: { kind: 'int', min: 4, max: 6 },
      start: { kind: 'int', min: 1, max: (v: Vars) => 11 - Number(v.length) },
      gap: { kind: 'int', min: 1, max: (v: Vars) => Number(v.length) },
      shown: {
        kind: 'choice',
        values: (v: Vars) => [
          runWithGaps(Number(v.start), Number(v.length), [Number(v.gap)]),
        ],
      },
    },
    answer: (v: Vars) => Number(v.start) + Number(v.gap) - 1,
    format: { kind: 'integer', min: 1, entry: true },
    explanation: ({ vars, answer }) =>
      `რიგი ყოველ ნაბიჯზე ერთით იზრდება: ${asRun(runOf(Number(vars.start), Number(vars.length)))}. აკლდა ${answer}.`,
  }),

  /**
   * Level 3 — choose the row that holds exactly N objects.
   *
   * Every option is a real row of the same object, so the student has to count
   * all three; the wrong rows are one and two away from the target, which is
   * where counting slips.
   */
  defineTemplate({
    ...at({ id: 'g1-u02-1-pick-the-row', subtopicId: 'ricxvebi1-10', difficulty: 3 }),
    prompt: 'რომელ მწკრივშია ზუსტად {count} {toy}?',
    variables: {
      toy: { kind: 'choice', values: TOY_NAMES },
      count: { kind: 'int', min: 3, max: 8 },
    },
    answer: (v: Vars) => toyByName(String(v.toy)).emoji.repeat(Number(v.count)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const emoji = toyByName(String(vars.toy)).emoji;
      const n = Number(vars.count);
      return [n - 1, n + 1, n - 2].filter((c) => c >= 1).map((c) => emoji.repeat(c));
    },
    explanation: ({ vars, answer }) => `მხოლოდ ერთ მწკრივშია ${vars.count} ${vars.toy}: ${answer}.`,
  }),
];

/* ================================================================== *
 * U02.2 — რიცხვები 11-დან 20-მდე და ათეულები
 * ================================================================== */

/**
 * Four numbers to arrange, in one direction.
 *
 * The stem, the scramble and the key all come from the same direction, so a
 * descending question is scrambled downwards and its key is the sequence that
 * sorts downwards — the three cannot disagree.
 */
const orderNumbers = (direction: 'asc' | 'desc'): QuestionTemplate =>
  defineTemplate({
    ...at({
      id: direction === 'asc' ? 'g1-u02-2-order-asc' : 'g1-u02-2-order-desc',
      subtopicId: 'ricxvebi11-20',
      difficulty: 3,
    }),
    prompt:
      direction === 'asc'
        ? 'დაალაგე რიცხვები ზრდადობით: ჯერ უმცირესი, ბოლოს — უდიდესი.'
        : 'დაალაგე რიცხვები კლებადობით: ჯერ უდიდესი, ბოლოს — უმცირესი.',
    variables: {
      items: distinctNumbers(4, 1, 20),
    },
    shuffle: { source: 'items', direction },
    answer: (_v: Vars, ctx) => {
      // The key is the displayed positions in sorted order, 1-based.
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((a, b) => (direction === 'asc' ? a - b : b - a));
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    format: { kind: 'text' },
    explanation: ({ vars }) => {
      const values = numbersOf(vars, 'items').sort(
        (a, b) => (direction === 'asc' ? a - b : b - a),
      );
      return `${direction === 'asc' ? 'უმცირესიდან' : 'უდიდესიდან'}: ${asRun(values)}.`;
    },
  });

const u022: QuestionTemplate[] = [
  /**
   * Level 1 — the number is named, and the digit has to be found from the name.
   *
   * Four readings, because one reading caps the question at the twenty numbers
   * it can name — under the thirty-five a perfect run needs:
   *   • the word itself („თერთმეტი“),
   *   • full tens and units (ერთი სრული ათეული და 1 ერთეული),
   *   • ten and then some (ათი და კიდევ 1),
   *   • units and a ten, which is the place-value reading.
   * The last is asked only of 11–19: for 20 it would be "zero ones", which is
   * a question about the tens place this unit does not ask.
   */
  defineTemplate({
    ...at({ id: 'g1-u02-2-name-the-number', subtopicId: 'ricxvebi11-20', difficulty: 1 }),
    prompt: 'რომელი რიცხვია {ask}?',
    variables: {
      mode: { kind: 'choice', values: ['word', 'tens', 'ten-plus', 'place'] },
      n: { kind: 'int', min: 11, max: 20 },
      tens: { kind: 'choice', values: (v: Vars) => [Number(v.n) === 20 ? 'ორი' : 'ერთი'] },
      units: { kind: 'choice', values: (v: Vars) => [String(Number(v.n) % 10)] },
      ask: {
        kind: 'choice',
        values: (v: Vars) => {
          const n = Number(v.n);
          if (v.mode === 'word') return [`სიტყვიერად მოცემული: „${nameOfNumber(n)}“`];
          // 20 is exactly two tens and has no single units to add.
          if (n === 20) return ['ორი სრული ათეული'];
          if (v.mode === 'ten-plus') return [`ათი და კიდევ ${v.units}`];
          if (v.mode === 'place') return [`${v.units} ერთეული და ერთი ათეული`];
          return [`${v.tens} სრული ათეული და ${v.units} ერთეული`];
        },
      },
    },
    constraints: [
      {
        note: 'the place-value wording is only askable of 11–19',
        test: (v: Vars) => v.mode !== 'place' || Number(v.n) < 20,
      },
    ],
    answer: (v: Vars) => Number(v.n),
    format: { kind: 'integer', min: 11 },
    optionCount: 3,
    distractors: ({ answer }) => neighbouring(Number(answer), 11, 20),
    explanation: ({ answer }) => {
      const n = Number(answer);
      return n === 20
        ? 'ორი ათეული არის 20.'
        : `${nameOfNumber(n)} არის ერთი ათეული და ${n % 10} ერთეული.`;
    },
  }),

  /** Level 2 — produce the missing number in a run inside 11–20. */
  defineTemplate({
    ...at({ id: 'g1-u02-2-missing-in-run', subtopicId: 'ricxvebi11-20', difficulty: 2 }),
    prompt: 'შეიყვანე გამოტოვებული რიცხვი: {shown}.',
    variables: {
      // Four to six numbers, starting anywhere the run still ends at 20. The
      // length is drawn rather than fixed, so the blank is not always the
      // middle of a five-long run.
      length: { kind: 'int', min: 4, max: 6 },
      start: { kind: 'int', min: 11, max: (v: Vars) => 21 - Number(v.length) },
      gap: { kind: 'int', min: 1, max: (v: Vars) => Number(v.length) },
      shown: {
        kind: 'choice',
        values: (v: Vars) => [
          runWithGaps(Number(v.start), Number(v.length), [Number(v.gap)]),
        ],
      },
    },
    answer: (v: Vars) => Number(v.start) + Number(v.gap) - 1,
    format: { kind: 'integer', min: 11, entry: true },
    explanation: ({ vars, answer }) =>
      `რიგი ერთით იზრდება: ${asRun(runOf(Number(vars.start), Number(vars.length)))}. აკლდა ${answer}.`,
  }),

  /**
   * Level 3 — put four numbers in order.
   *
   * Ascending and descending are the same comparison read from either end, and
   * the document asks for both (Q6/Q12 ascending, Q29 descending). They are two
   * templates rather than one with a drawn direction because `shuffle` is
   * static: the engine reads `direction` when it builds the scramble, so a
   * direction that depended on a draw could ship an already-sorted scramble and
   * print the answer in order.
   */
  orderNumbers('asc'),
  orderNumbers('desc'),
];

/* ================================================================== *
 * U02.3 — რიგობითი რიცხვები
 * ================================================================== */

/** Children in the row. A row is drawn without repeats, so each has one place. */
const CHILDREN = ['ანა', 'ლუკა', 'ნინო', 'ბექა', 'გიგა', 'მარიამი', 'ნიკა', 'თამარი', 'დავითი', 'სალომე'];

/** Books on a shelf, named by their colour; the colour word does not decline before `წიგნი`. */
const BOOKS = [
  { emoji: '🟥', colour: 'წითელი' },
  { emoji: '🟦', colour: 'ლურჯი' },
  { emoji: '🟩', colour: 'მწვანე' },
  { emoji: '🟨', colour: 'ყვითელი' },
  { emoji: '🟪', colour: 'იისფერი' },
  { emoji: '🟧', colour: 'ნარინჯისფერი' },
  { emoji: '⬛', colour: 'შავი' },
  { emoji: '⬜', colour: 'თეთრი' },
];

const bookByEmoji = (emoji: string) => BOOKS.find((book) => book.emoji === emoji)!;
const BOOK_EMOJIS = BOOKS.map((book) => book.emoji);

const u023: QuestionTemplate[] = [
  /**
   * Level 1 — read a name off a numbered queue. The row is printed in the stem
   * and `slot` is drawn, so "who is third?" always has a third child to name.
   */
  defineTemplate({
    ...at({ id: 'g1-u02-3-who-is-nth', subtopicId: 'rigobiti', difficulty: 1 }),
    prompt: 'ბავშვები რიგში დგანან: {row}. ვინ დგას {where}?',
    variables: {
      line: { kind: 'list', pick: { values: CHILDREN, length: { min: 4, max: 6 }, unique: true } },
      slot: { kind: 'int', min: 1, max: (v: Vars) => (v.line as unknown[]).length },
      where: { kind: 'choice', values: (v: Vars) => [ordinalOf(Number(v.slot))] },
      // A list variable renders with bare commas ("ნიკა,ბექა"); a sentence needs
      // ", " between the names.
      row: { kind: 'choice', values: (v: Vars) => [(v.line as string[]).join(', ')] },
    },
    answer: (v: Vars) => String((v.line as string[])[Number(v.slot) - 1]),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ answer, vars }) =>
      (vars.line as string[]).filter((name) => name !== answer),
    explanation: ({ vars, answer }) =>
      `რიგი იწყება პირველით: ${(vars.line as string[]).map((name, index) => `${index + 1}) ${name}`).join(', ')}. ${ordinalOf(Number(vars.slot))} დგას ${answer}.`,
  }),

  /**
   * Level 2 — the other direction: given the book, name its place. `slot` is
   * drawn first and `colour` is read out of the row at that slot, so the answer
   * is the slot the question was built from.
   */
  defineTemplate({
    ...at({ id: 'g1-u02-3-which-position', subtopicId: 'rigobiti', difficulty: 2 }),
    prompt: 'თაროზე მარცხნიდან მარჯვნივ დევს: {row}. რომელ ადგილზეა მარცხნიდან {colour} წიგნი?',
    variables: {
      shelf: { kind: 'list', pick: { values: BOOK_EMOJIS, length: { min: 4, max: 6 }, unique: true } },
      slot: { kind: 'int', min: 1, max: (v: Vars) => (v.shelf as unknown[]).length },
      row: {
        kind: 'choice',
        values: (v: Vars) => [(v.shelf as string[]).map((emoji) => bookByEmoji(emoji).colour).join(', ')],
      },
      colour: {
        kind: 'choice',
        values: (v: Vars) => [bookByEmoji((v.shelf as string[])[Number(v.slot) - 1]).colour],
      },
    },
    answer: (v: Vars) => ordinalOf(Number(v.slot)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) =>
      ORDINALS.slice(0, (vars.shelf as unknown[]).length).filter(
        (ordinal) => ordinal !== ordinalOf(Number(vars.slot)),
      ),
    explanation: ({ vars }) =>
      `მარცხნიდან თვლით: ${(vars.shelf as string[])
        .map((emoji, index) => `${index + 1}) ${bookByEmoji(emoji).colour}`)
        .join(', ')}.`,
    visual: (v: Vars) => (v.shelf as string[]).join(' '),
  }),

  /**
   * Level 3 — the row is not printed, so the position has to be reasoned out
   * from the queue length and the child's place in it.
   */
  defineTemplate({
    ...at({ id: 'g1-u02-3-how-many-in-front', subtopicId: 'rigobiti', difficulty: 3 }),
    prompt: 'რიგში {total} ბავშვია. {child} რიგში {where} დგას. რამდენი ბავშვი დგას მის წინ?',
    variables: {
      total: { kind: 'int', min: 3, max: 10 },
      slot: { kind: 'int', min: 2, max: (v: Vars) => Number(v.total) },
      child: { kind: 'choice', values: CHILDREN },
      where: { kind: 'choice', values: (v: Vars) => [ordinalOf(Number(v.slot))] },
    },
    answer: (v: Vars) => Number(v.slot) - 1,
    format: { kind: 'integer', min: 1, entry: true },
    explanation: ({ vars, answer }) =>
      `${vars.child} ${vars.where} დგას, ამიტომ მის წინ ${answer} ბავშვია.`,
  }),
];

/* ================================================================== *
 * U02.4 — წინა და მომდევნო რიცხვები
 * ================================================================== */

const u024: QuestionTemplate[] = [
  /** Level 1 — recognise which number comes immediately before or after. */
  defineTemplate({
    ...at({ id: 'g1-u02-4-neighbour-choice', subtopicId: 'win-nak', difficulty: 1 }),
    prompt: 'რომელი რიცხვია {n}-ის {direction}?',
    variables: {
      n: { kind: 'int', min: 2, max: 19, reverse: true },
      mode: { kind: 'choice', values: ['after', 'before'] },
      direction: { kind: 'choice', values: (v: Vars) => [v.mode === 'after' ? 'შემდეგ' : 'წინ'] },
    },
    answer: (v: Vars) => (v.mode === 'after' ? Number(v.n) + 1 : Number(v.n) - 1),
    format: { kind: 'integer', min: 1 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const isAfter = vars.mode === 'after';
      // The other direction's neighbour is the mistake this question exists to
      // catch, so it is always offered.
      const other = isAfter ? Number(vars.n) - 1 : Number(vars.n) + 1;
      return [other, Number(answer) + (isAfter ? 2 : -2), Number(answer) - (isAfter ? 1 : -1)].filter(
        (value) => value >= 1 && value <= MAX_NUMBER && value !== Number(answer),
      );
    },
    explanation: ({ vars, answer }) =>
      `${vars.n}-ის ${vars.direction} მოდის ${answer}.`,
  }),

  /** Level 2 — the same relationship, produced rather than recognised. */
  defineTemplate({
    ...at({ id: 'g1-u02-4-neighbour-entry', subtopicId: 'win-nak', difficulty: 2 }),
    prompt: 'შეიყვანე რიცხვი, რომელიც {n}-ის {direction} მოდის.',
    variables: {
      n: { kind: 'int', min: 2, max: 19, reverse: true },
      mode: { kind: 'choice', values: ['after', 'before'] },
      direction: { kind: 'choice', values: (v: Vars) => [v.mode === 'after' ? 'შემდეგ' : 'წინ'] },
    },
    answer: (v: Vars) => (v.mode === 'after' ? Number(v.n) + 1 : Number(v.n) - 1),
    format: { kind: 'integer', min: 1, entry: true },
    explanation: ({ vars, answer }) => `${vars.n}-ის ${vars.direction} მოდის ${answer}.`,
  }),

  /**
   * Level 3 — two blanks at once. The run is printed from its start and both
   * gaps are drawn, so the pair of missing numbers is read off the same five
   * numbers the student sees.
   */
  defineTemplate({
    ...at({ id: 'g1-u02-4-two-gaps', subtopicId: 'win-nak', difficulty: 3 }),
    prompt: 'რომელი ორი რიცხვი აკლია? {shown}.',
    variables: {
      start: { kind: 'int', min: 1, max: 16 },
      firstGap: { kind: 'int', min: 1, max: 4 },
      secondGap: {
        kind: 'int',
        min: 2,
        max: 5,
        // Always after the first, so the two blanks are distinct positions.
      },
      shown: {
        kind: 'choice',
        values: (v: Vars) => [
          runWithGaps(Number(v.start), 5, [Number(v.firstGap), Number(v.secondGap)]),
        ],
      },
      missing: {
        kind: 'choice',
        values: (v: Vars) => {
          const start = Number(v.start);
          const first = start + Number(v.firstGap) - 1;
          const second = start + Number(v.secondGap) - 1;
          return [`${first} და ${second}`];
        },
      },
    },
    constraints: [
      {
        note: 'the second blank must come after the first',
        test: (v: Vars) => Number(v.secondGap) > Number(v.firstGap),
      },
    ],
    answer: (v: Vars) => String(v.missing),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const start = Number(vars.start);
      const a = start + Number(vars.firstGap) - 1;
      const b = start + Number(vars.secondGap) - 1;
      return [`${a} და ${b + 1}`, `${a - 1} და ${b}`, `${a + 1} და ${b - 1}`].filter(
        (option) => option !== answer,
      );
    },
    explanation: ({ vars, answer }) =>
      `რიგი ერთით იზრდება: ${asRun(runOf(Number(vars.start), 5))}. აკლდა ${answer}.`,
  }),
];

/* ================================================================== *
 * U02.5 — უდიდესი და უმცირესი რიცხვები
 * ================================================================== */

const u025: QuestionTemplate[] = [
  /** Level 1 — pick the largest or smallest out of three. */
  defineTemplate({
    ...at({ id: 'g1-u02-5-pick-extreme', subtopicId: 'udidesi-umciresti', difficulty: 1 }),
    // The three numbers are printed, not only offered as options. A bare
    // "which is the largest?" with the group visible only in the option row is
    // one question asked with different numbers behind it, and the engine —
    // correctly — treats two such screens as the same question, because the
    // wording and the picture never change. Printing the group is also what
    // the student is actually being asked to read.
    prompt: 'რომელია {which} რიცხვი: {shown}?',
    variables: {
      numbers: distinctNumbers(3, 1, 20),
      mode: { kind: 'choice', values: ['largest', 'smallest'] },
      which: { kind: 'choice', values: (v: Vars) => [v.mode === 'largest' ? 'უდიდესი' : 'უმცირესი'] },
      shown: {
        kind: 'choice',
        values: (v: Vars) => [numbersOf(v, 'numbers').sort((a, b) => a - b).join(', ')],
      },
    },
    answer: (v: Vars) => {
      const values = numbersOf(v, 'numbers');
      return v.mode === 'largest' ? Math.max(...values) : Math.min(...values);
    },
    format: { kind: 'integer', min: 1 },
    optionCount: 3,
    // The three drawn numbers are the only three options: the question is a
    // comparison between them, so an outside number would be answerable by
    // elimination instead of by comparing.
    distractors: ({ vars, answer }) =>
      numbersOf(vars, 'numbers').filter((value) => value !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `${numbersOf(vars, 'numbers').join(', ')} — აქედან ${vars.which} არის ${answer}.`,
  }),

  /** Level 2 — the same judgement with a fourth number and no options to lean on. */
  defineTemplate({
    ...at({ id: 'g1-u02-5-type-extreme', subtopicId: 'udidesi-umciresti', difficulty: 2 }),
    prompt: 'შეადარე რიცხვები: {shown}. შეიყვანე {which}.',
    variables: {
      numbers: distinctNumbers(4, 1, 20),
      mode: { kind: 'choice', values: ['largest', 'smallest'] },
      which: { kind: 'choice', values: (v: Vars) => [v.mode === 'largest' ? 'უდიდესი' : 'უმცირესი'] },
      shown: {
        kind: 'choice',
        values: (v: Vars) => [numbersOf(v, 'numbers').join(', ')],
      },
    },
    answer: (v: Vars) => {
      const values = numbersOf(v, 'numbers');
      return v.mode === 'largest' ? Math.max(...values) : Math.min(...values);
    },
    format: { kind: 'integer', min: 1, entry: true },
    explanation: ({ vars, answer }) =>
      `${numbersOf(vars, 'numbers').join(', ')} — აქედან ${vars.which} არის ${answer}.`,
  }),

  /**
   * Level 3 — two judgements and a subtraction: find the largest, find the
   * smallest, then say how far apart they are.
   */
  defineTemplate({
    ...at({ id: 'g1-u02-5-range', subtopicId: 'udidesi-umciresti', difficulty: 3 }),
    prompt:
      'მოცემულია რიცხვები {shown}. შეიყვანე სხვაობა უდიდესსა და უმცირესს შორის.',
    variables: {
      numbers: distinctNumbers(5, 1, 20),
      shown: {
        kind: 'choice',
        values: (v: Vars) => [numbersOf(v, 'numbers').join(', ')],
      },
    },
    constraints: [
      {
        note: 'the two extremes must differ, or there is nothing to subtract',
        test: (v: Vars) => Math.max(...numbersOf(v, 'numbers')) > Math.min(...numbersOf(v, 'numbers')),
      },
    ],
    answer: (v: Vars) =>
      Math.max(...numbersOf(v, 'numbers')) - Math.min(...numbersOf(v, 'numbers')),
    format: { kind: 'integer', min: 1, entry: true },
    explanation: ({ vars, answer }) => {
      const values = numbersOf(vars, 'numbers');
      const big = Math.max(...values);
      const small = Math.min(...values);
      return `უდიდესია ${big}, უმცირესი — ${small}. ${big} − ${small} = ${answer}.`;
    },
  }),
];

/* ================================================================== *
 * U02.6 — რიცხვითი ღერძი 20-მდე
 * ================================================================== */

/**
 * Numbers on a line, with one of them marked in brackets. The window does not
 * have to start at 1 — a student who counts from the left edge instead of
 * reading the labels gets it wrong, which is the point of the exercise.
 */
const lineWindow = (from: number, to: number, mark?: number): string =>
  runOf(from, to - from + 1)
    .map((value) => (value === mark ? `[${value}]` : String(value)))
    .join(' ');

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const u026: QuestionTemplate[] = [
  /** Level 1 — read a marked number off a line that does not start at 1. */
  defineTemplate({
    ...at({ id: 'g1-u02-6-read-the-line', subtopicId: 'ricxviTi-xazi20', difficulty: 1 }),
    prompt: 'რიცხვით ღერძზე შემოხაზულია ერთი რიცხვი. რომელი რიცხვია?',
    variables: {
      start: { kind: 'int', min: 1, max: 11 },
      mark: { kind: 'int', min: 1, max: 10 },
    },
    answer: (v: Vars) => Number(v.start) + Number(v.mark) - 1,
    format: { kind: 'integer', min: 1 },
    optionCount: 3,
    distractors: ({ answer, vars }) => {
      // A student who counted from the left edge instead of reading the labels
      // lands on the position number, which is the mistake worth offering.
      const byPosition = Number(vars.mark);
      return [byPosition, Number(answer) + 1, Number(answer) - 1].filter(
        (value) => value >= 1 && value <= MAX_NUMBER && value !== Number(answer),
      );
    },
    explanation: ({ answer }) =>
      `ღერძზე რიცხვები თავისი სახელებითაა მოცემული, ამიტომ შემოხაზული არის ${answer}.`,
    visual: (v: Vars) =>
      lineWindow(Number(v.start), Number(v.start) + 9, Number(v.start) + Number(v.mark) - 1),
  }),

  /** Level 2 — one move along the line. */
  defineTemplate({
    ...at({ id: 'g1-u02-6-one-move', subtopicId: 'ricxviTi-xazi20', difficulty: 2 }),
    prompt:
      'დაიწყე {from}-დან და რიცხვით ღერძზე გადადი {steps} ნაბიჯით {direction}. რომელ რიცხვზე აღმოჩნდები?',
    variables: {
      from: { kind: 'int', min: 2, max: 19 },
      steps: { kind: 'int', min: 1, max: 5 },
      mode: { kind: 'choice', values: ['right', 'left'] },
      direction: { kind: 'choice', values: (v: Vars) => [v.mode === 'right' ? 'მარჯვნივ' : 'მარცხნივ'] },
    },
    constraints: [
      {
        note: 'the move must land on the line, between 1 and 20',
        test: (v: Vars) =>
          v.mode === 'right'
            ? Number(v.from) + Number(v.steps) <= MAX_NUMBER
            : Number(v.from) - Number(v.steps) >= 1,
      },
    ],
    answer: (v: Vars) =>
      v.mode === 'right' ? Number(v.from) + Number(v.steps) : Number(v.from) - Number(v.steps),
    format: { kind: 'integer', min: 1, entry: true },
    explanation: ({ vars, answer }) =>
      `${vars.from}-დან ${vars.steps} ნაბიჯი ${vars.direction} — ეს არის ${answer}.`,
    visual: (v: Vars) => {
      const from = Number(v.from);
      const to = v.mode === 'right' ? from + Number(v.steps) : from - Number(v.steps);
      return lineWindow(clamp(Math.min(from, to) - 2, 1, MAX_NUMBER - 9), clamp(Math.min(from, to) - 2, 1, MAX_NUMBER - 9) + 9);
    },
  }),

  /**
   * Level 3 — two moves, or the number of steps between two points. Both need
   * the student to plan a journey rather than take one step.
   */
  defineTemplate({
    ...at({ id: 'g1-u02-6-plan-a-journey', subtopicId: 'ricxviTi-xazi20', difficulty: 3 }),
    prompt: 'დაიწყე {from}-დან. გადადი {right} ნაბიჯით მარჯვნივ, შემდეგ — {left} ნაბიჯით მარცხნივ. რომელ რიცხვზე აღმოჩნდები?',
    variables: {
      from: { kind: 'int', min: 3, max: 14 },
      right: { kind: 'int', min: 2, max: 5 },
      left: { kind: 'int', min: 1, max: 4 },
    },
    constraints: [
      { note: 'the whole journey stays on the line', test: (v: Vars) => Number(v.from) + Number(v.right) <= MAX_NUMBER },
      { note: 'and does not pass below 1 on the way back', test: (v: Vars) => Number(v.right) !== Number(v.left) },
    ],
    answer: (v: Vars) => Number(v.from) + Number(v.right) - Number(v.left),
    format: { kind: 'integer', min: 1, entry: true },
    explanation: ({ vars, answer }) =>
      `${vars.from} + ${vars.right} = ${Number(vars.from) + Number(vars.right)}; ${Number(vars.from) + Number(vars.right)} − ${vars.left} = ${answer}.`,
    visual: (v: Vars) => {
      const from = Number(v.from);
      const end = from + Number(v.right) - Number(v.left);
      const low = clamp(Math.min(from, end) - 2, 1, MAX_NUMBER - 9);
      return lineWindow(low, low + 9);
    },
  }),
];

/* ================================================================== *
 * U02.7 — ლუწი და კენტი რიცხვები
 * ================================================================== */

const isEven = (n: number): boolean => n % 2 === 0;

const u027: QuestionTemplate[] = [
  /**
   * Level 1 — single-number classification. Two of the three options are the
   * opposite parity, so exactly one answer is right however the draw falls.
   */
  defineTemplate({
    ...at({ id: 'g1-u02-7-pick-one', subtopicId: 'luwi-kenti', difficulty: 1 }),
    // Printed, for the same reason as the largest/smallest question: the three
    // candidates are the question, so they belong in the sentence rather than
    // only in the option row.
    prompt: 'რომელია {which} რიცხვი: {shown}?',
    variables: {
      mode: { kind: 'choice', values: ['even', 'odd'] },
      which: { kind: 'choice', values: (v: Vars) => [v.mode === 'even' ? 'ლუწი' : 'კენტი'] },
      // The correct number is drawn from the asked parity and both wrong ones
      // from the opposite parity, so exactly one option can be right whatever
      // the draw — a constraint does not have to reject bad draws.
      n: {
        kind: 'choice',
        values: (v: Vars) =>
          ONE_TO_TWENTY.filter((value) => isEven(value) === (v.mode === 'even')),
      },
      wrongs: {
        kind: 'list',
        pick: {
          values: ONE_TO_TWENTY,
          length: 2,
          unique: true,
          filter: (item, v) => isEven(Number(item)) !== (v.mode === 'even'),
        },
      },
      shown: {
        kind: 'choice',
        values: (v: Vars) => [
          [Number(v.n), ...numbersOf(v, 'wrongs')].sort((a, b) => a - b).join(', '),
        ],
      },
    },
    answer: (v: Vars) => Number(v.n),
    format: { kind: 'integer', min: 1 },
    optionCount: 3,
    distractors: ({ vars, answer }) =>
      numbersOf(vars, 'wrongs').filter((value) => value !== Number(answer)),
    explanation: ({ answer }) =>
      `${answer} ${isEven(Number(answer)) ? 'ლუწია' : 'კენტია'} — ${isEven(Number(answer)) ? 'იყოფა ორზე უნაშთოდ' : 'ორზე გაყოფისას ერთი რჩება'}.`,
  }),

  /**
   * Level 2 — a whole group has to be of one parity, which is a set judgement
   * rather than three separate looks.
   */
  defineTemplate({
    ...at({ id: 'g1-u02-7-pick-the-group', subtopicId: 'luwi-kenti', difficulty: 2 }),
    // The group is printed and the student judges a whole set: "are all three
    // of these odd?" is a different reading from three separate looks, and it
    // is answerable for a group the stem actually shows.
    prompt: 'ჯგუფში არის {shown}. რომელი წინადადებაა სწორი?',
    variables: {
      group: distinctNumbers(3, 1, 20),
      shown: {
        kind: 'choice',
        values: (v: Vars) => [numbersOf(v, 'group').sort((a, b) => a - b).join(', ')],
      },
      // How many of the three are odd is derived, so the sentence options are
      // right or wrong because of the drawn group.
      odds: {
        kind: 'choice',
        values: (v: Vars) => [String(numbersOf(v, 'group').filter((n) => !isEven(n)).length)],
      },
    },
    constraints: [
      {
        note: 'the group must be mixed or uniform, never ambiguous',
        test: (v: Vars) => {
          const odds = Number(v.odds);
          return odds >= 0 && odds <= 3;
        },
      },
    ],
    answer: (v: Vars) => {
      // Spelled in words, never with a digit: "2 კენტია" reads as "2 is odd"
      // beside a group of numbers, not as "two of them are odd".
      const odds = Number(v.odds);
      if (odds === 3) return 'სამივე კენტია';
      if (odds === 0) return 'სამივე ლუწია';
      if (odds === 1) return 'ერთი კენტია, ორი ლუწი';
      return 'ორი კენტია, ერთი ლუწი';
    },
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ answer }) => {
      const all = ['სამივე კენტია', 'სამივე ლუწია', 'ერთი კენტია, ორი ლუწი', 'ორი კენტია, ერთი ლუწი'];
      return all.filter((option) => option !== answer);
    },
    explanation: ({ vars, answer }) =>
      `ჯგუფში ${vars.shown}: ${answer}.`,
  }),

  /**
   * Level 3 — find the number that breaks the parity of everything around it.
   *
   * Two steps from the unit: spot the pattern across the list, then locate the
   * one member that does not follow it. All five numbers are printed and the
   * odd one out is derived from them, so the answer is checkable by hand.
   */
  defineTemplate({
    ...at({ id: 'g1-u02-7-odd-one-out', subtopicId: 'luwi-kenti', difficulty: 3 }),
    prompt: 'ოთხი რიცხვი {parity} არის, ერთი — არა. რომელია განსხვავებული: {shown}?',
    variables: {
      mode: { kind: 'choice', values: ['even', 'odd'] },
      parity: { kind: 'choice', values: (v: Vars) => [v.mode === 'even' ? 'ლუწი' : 'კენტი'] },
      // The majority parity is drawn as four numbers from that pool.
      majority: {
        kind: 'list',
        pick: {
          values: ONE_TO_TWENTY,
          length: 4,
          unique: true,
          filter: (item, v) => isEven(Number(item)) === (v.mode === 'even'),
        },
      },
      // The odd one out comes from the opposite pool, so the sentence is true
      // of exactly one member by construction.
      outsider: { kind: 'int', min: 1, max: 20 },
      shown: {
        kind: 'choice',
        values: (v: Vars) => [
          [...numbersOf(v, 'majority'), Number(v.outsider)].sort((a, b) => a - b).join(', '),
        ],
      },
    },
    constraints: [
      {
        note: 'the outsider must be the only member of its parity',
        test: (v: Vars) =>
          isEven(Number(v.outsider)) !== (v.mode === 'even') &&
          numbersOf(v, 'majority').every((n) => isEven(n) === (v.mode === 'even')),
      },
    ],
    answer: (v: Vars) => Number(v.outsider),
    format: { kind: 'integer', min: 1 },
    optionCount: 3,
    distractors: ({ vars }) => numbersOf(vars, 'majority'),
    explanation: ({ vars, answer }) =>
      `${vars.shown} — ${answer} ${isEven(Number(answer)) ? 'ლუწია' : 'კენტია'}, დანარჩენი კი ${vars.parity === 'ლუწი' ? 'ლუწი' : 'კენტი'}.`,
  }),
];

/* ================================================================== *
 * Export
 * ================================================================== */

/**
 * The U02 library. `catalog.ts` registers it after the placeholders and drops
 * any placeholder whose subtopic is covered here, so these replace the
 * placeholder set for these seven subtopics without that file changing.
 */
export const U02_TEMPLATES: QuestionTemplate[] = [
  ...u021,
  ...u022,
  ...u023,
  ...u024,
  ...u025,
  ...u026,
  ...u027,
];

/** Subtopic ids this library is responsible for. */
export const U02_SUBTOPICS = [
  'ricxvebi1-10',
  'ricxvebi11-20',
  'rigobiti',
  'win-nak',
  'udidesi-umciresti',
  'ricxviTi-xazi20',
  'luwi-kenti',
] as const;
