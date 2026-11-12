import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

/**
 * U08 — ათეულები და ორნიშნა რიცხვები (tens and two-digit numbers).
 *
 * The eighth grade-1 unit, and the first one that works above twenty. Its
 * learning goal is place value: a ten is a countable thing, adding tens is the
 * same act as adding ones, and a two-digit number is a tens part plus a ones
 * part. Almost every question therefore prints a number *and* shows what it is
 * made of.
 *
 * Six rules hold the library together:
 *
 *  1. **Every answer is computed from the printed numbers.** No template stores
 *     "the intended answer"; it prints two or three numbers and derives the
 *     result, so print and key cannot drift apart.
 *  2. **A ten is drawn as a ten.** Ten objects in a row are labelled „1 ათეული“,
 *     so the child counts tens rather than counting to fifty by ones. The row of
 *     single objects is the ones part, and the two together are the number.
 *  3. **The subtopic's own arithmetic rule is a constraint, not a hope.** U08.3
 *     refuses a draw whose ones sum to ten or more (no regrouping), and U08.4
 *     refuses one whose ones sum to less (regrouping always happens). A template
 *     that draws freely and gets the right proportion by luck would print
 *     questions belonging to the neighbouring subtopic about half the time.
 *  4. **Nothing goes negative and nothing passes one hundred.** U08.5 and U08.6
 *     draw the subtrahend from what is left of the minuend, and U08.7 keeps the
 *     running total inside 100.
 *  5. **Comparison evaluates both sides first**, so „7 + 6 __ 20 − 7“ is decided
 *     by 13 against 13 and not by the shape of the expression.
 *  6. **A puzzle has exactly one answer.** U08.9 draws the blank's value first
 *     and then places it, so there is no second number that would also close the
 *     equation.
 *
 * The level rises by the reasoning required: level 1 is one operation on
 * numbers already made of tens, level 2 adds a missing part or a second step,
 * level 3 chains two operations, works backwards, or wraps the arithmetic in a
 * sentence. The numbers grow too, but never as the only difference.
 */

const grade = 1 as const;
const topicId = 'ateulebi-orcifra';
const unitId = 'ateulebi-orcifra';

/** The curriculum address every template in this unit shares. */
const at = (spec: { id: string; subtopicId: string; difficulty: 1 | 2 | 3 }) => ({
  id: spec.id,
  grade,
  topicId,
  unitId,
  subtopicId: spec.subtopicId,
  difficulty: spec.difficulty,
});

/* ================================================================== *\
 * Shared vocabulary
 * ================================================================== */

/** A row of one emoji, one space between objects. */
const draw = (emoji: string, count: number): string =>
  Array.from({ length: count }, () => emoji).join(' ');

/**
 * A number drawn as its tens and its ones.
 *
 * „2 ათეული და 3 ერთეული“ is the reading the unit teaches, and it is drawn
 * rather than described: each ten is a row of ten blocks labelled as one ten,
 * and the loose blocks are the ones. Above ten tens the drawing stops being
 * useful, so the tens are printed as text from there on.
 */
const drawPlaceValue = (label: string, value: number): string => {
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  const parts: string[] = [];
  if (tens > 0) {
    parts.push(
      tens === 1
        ? `1 ათეული (${draw('🟦', 10)})`
        : `${tens} ათეული (${Array.from({ length: tens }, () => draw('🟦', 10)).join(' | ')})`,
    );
  }
  if (ones > 0) parts.push(`${ones} ერთეული (${draw('🟨', ones)})`);
  if (parts.length === 0) return `${label}: 0`;
  return `${label}: ${parts.join(' და ')}`;
};

interface Thing {
  emoji: string;
  /** The singular, printed after every numeral. */
  name: string;
}

const THINGS: Thing[] = [
  { emoji: '🧱', name: 'კუბიკი' },
  { emoji: '🍎', name: 'ვაშლი' },
  { emoji: '📘', name: 'რვეული' },
  { emoji: '✏️', name: 'ფანქარი' },
  { emoji: '⚽', name: 'ბურთი' },
  { emoji: '⭐', name: 'ვარსკვლავი' },
  { emoji: '🍪', name: 'ნამცხვარი' },
  { emoji: '🎈', name: 'ბუშტი' },
  { emoji: '📚', name: 'წიგნი' },
  { emoji: '🍐', name: 'მსხალი' },
];

const THING_NAMES = THINGS.map((thing) => thing.name);
/**
 * Children's names in the two cases this unit prints.
 *
 * „ლუკას აქვს“ takes the dative, exactly as in U06 and U07. The endings are
 * irregular (მარიამი → მარიამს, ანა → ანას by dropping its final vowel), so the
 * forms are stored and nothing is glued on at generation time.
 */
interface Child {
  name: string;
  dat: string;
}

const CHILDREN: Child[] = [
  { name: 'ნინო', dat: 'ნინოს' },
  { name: 'ლუკა', dat: 'ლუკას' },
  { name: 'ანა', dat: 'ანას' },
  { name: 'გიორგი', dat: 'გიორგის' },
  { name: 'მარიამი', dat: 'მარიამს' },
  { name: 'დავითი', dat: 'დავითს' },
  { name: 'სოფო', dat: 'სოფოს' },
  { name: 'ბექა', dat: 'ბექას' },
];

const WHOM = CHILDREN.map((child) => child.dat);

/* ================================================================== *\
 * Distractor helpers
 * ================================================================== */

/**
 * Wrong answers for a computed number.
 *
 * Every wrong option is a mistake this unit exists to catch: the tens digit and
 * the ones digit swapped, one ten too many or too few, and the sign slipped.
 * None of them is a random number, because „57, 58, 59, 60“ beside a question
 * about 37 + 20 teaches nothing except that the answer is one of four.
 */
const placeValueDistractors = (answer: number): number[] => {
  const candidates = [
    answer + 10,
    answer - 10,
    answer + 1,
    answer - 1,
    // The digits swapped — writing the tens answer in the ones column.
    Number(`${(answer % 10).toString()}${Math.floor(answer / 10).toString()}`),
    100 - answer,
  ];
  const decoys: number[] = [];
  for (const candidate of candidates) {
    if (!Number.isInteger(candidate)) continue;
    if (candidate === answer) continue;
    if (candidate <= 0 || candidate > 110) continue;
    if (decoys.includes(candidate)) continue;
    decoys.push(candidate);
  }
  return decoys;
};

/* ================================================================== *\
 * U08.1 — ათეულების შეკრება
 * ================================================================== */

/**
 * Adding tens is adding ones with a zero on the end.
 *
 * Both operands are multiples of ten by construction. The tens *count* is what
 * is drawn (`at`, `bt`) and the printed number is derived from it (`a = at × 10`),
 * so the prompt says `20 + 30` and the answer is 50 — never a prompt reading
 * „1 + 3“ whose answer is 40, which is what happens if the count is printed by
 * mistake.
 */
const u081: QuestionTemplate[] = [
  /** Level 1 — 20 + 30, both tens under fifty (Q1, Q2). */
  defineTemplate({
    ...at({ id: 'g1-u08-1-tens-small', subtopicId: 'ateulebi-ateulebi', difficulty: 1 }),
    prompt: 'შეავსე: {a} + {b} = __.',
    variables: {
      at: { kind: 'int', min: 1, max: 9 },
      bt: { kind: 'int', min: 1, max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.at) * 10] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.bt) * 10] },
    },
    constraints: [
      { note: 'the sum stays inside one hundred', test: (v: Vars) => Number(v.a) + Number(v.b) <= 100 },
      { note: 'the two tens differ, so the sentence reads as two numbers', test: (v: Vars) => Number(v.at) !== Number(v.bt) },
    ],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.at} ათეული + ${vars.bt} ათეული = ${Number(vars.at) + Number(vars.bt)} ათეული = ${answer}.`,
    visual: (v: Vars) => drawPlaceValue(`${v.a} + ${v.b}`, Number(v.a) + Number(v.b)),
  }),

  /** Level 2 — 30 + 50, tens that pass fifty (Q3). */
  defineTemplate({
    ...at({ id: 'g1-u08-1-tens-mid', subtopicId: 'ateulebi-ateulebi', difficulty: 2 }),
    prompt: 'შეავსე: {a} + {b} = __.',
    variables: {
      at: { kind: 'int', min: 2, max: 6 },
      bt: { kind: 'int', min: 2, max: 6 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.at) * 10] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.bt) * 10] },
    },
    constraints: [
      { note: 'the sum stays inside one hundred', test: (v: Vars) => Number(v.a) + Number(v.b) <= 100 },
      { note: 'the two tens differ', test: (v: Vars) => Number(v.at) !== Number(v.bt) },
    ],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.at} ათეული + ${vars.bt} ათეული = ${Number(vars.at) + Number(vars.bt)} ათეული = ${answer}.`,
  }),

  /** Level 2 — 20 + __ = 70, the addend missing (Q4). */
  defineTemplate({
    ...at({ id: 'g1-u08-1-missing-addend', subtopicId: 'ateulebi-ateulebi', difficulty: 2 }),
    prompt: 'შეავსე: {a} + __ = {total}.',
    variables: {
      bt: { kind: 'int', min: 1, max: 8 },
      tt: { kind: 'int', min: 3, max: 10 },
      // Both printed numbers are derived from the tens counts, so the equation
      // closes exactly and nothing has to be rejected.
      a: { kind: 'choice', values: (v: Vars) => [(Number(v.tt) - Number(v.bt)) * 10] },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.tt) * 10] },
    },
    constraints: [
      { note: 'the printed addend is a positive whole number of tens', test: (v: Vars) => Number(v.a) >= 10 },
    ],
    answer: (v: Vars) => Number(v.bt) * 10,
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.tt} ათეული − ${Number(vars.tt) - Number(vars.bt)} ათეული = ${vars.bt} ათეული = ${answer}.`,
  }),

  /** Level 3 — 10 + 30 + 40, three tens at once (Q5). */
  defineTemplate({
    ...at({ id: 'g1-u08-1-three-tens', subtopicId: 'ateulebi-ateulebi', difficulty: 3 }),
    prompt: 'შეავსე: {a} + {b} + {c} = __.',
    variables: {
      at: { kind: 'int', min: 1, max: 4 },
      bt: { kind: 'int', min: 1, max: 4 },
      ct: { kind: 'int', min: 1, max: 4 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.at) * 10] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.bt) * 10] },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.ct) * 10] },
    },
    constraints: [
      { note: 'three different tens, so the sentence reads as three numbers', test: (v: Vars) => new Set([Number(v.at), Number(v.bt), Number(v.ct)]).size === 3 },
      { note: 'the sum stays inside one hundred', test: (v: Vars) => Number(v.a) + Number(v.b) + Number(v.c) <= 100 },
    ],
    answer: (v: Vars) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.at} + ${vars.bt} + ${vars.ct} = ${Number(vars.at) + Number(vars.bt) + Number(vars.ct)} ათეული = ${answer}.`,
  }),

  /** Level 3 — the same sum inside a sentence (Q6). */
  defineTemplate({
    ...at({ id: 'g1-u08-1-boxes', subtopicId: 'ateulebi-ateulebi', difficulty: 3 }),
    prompt:
      'ყუთში არის {a} წითელი და {b} ლურჯი {item}. კიდევ {c} მწვანე {item} დაამატეს. რამდენი {item}ა სულ?',
    variables: {
      item: { kind: 'choice', values: THING_NAMES },
      at: { kind: 'int', min: 1, max: 4 },
      bt: { kind: 'int', min: 1, max: 4 },
      ct: { kind: 'int', min: 1, max: 3 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.at) * 10] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.bt) * 10] },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.ct) * 10] },
    },
    constraints: [
      { note: 'the total stays inside one hundred', test: (v: Vars) => Number(v.a) + Number(v.b) + Number(v.c) <= 100 },
      { note: 'three different tens', test: (v: Vars) => new Set([Number(v.at), Number(v.bt), Number(v.ct)]).size === 3 },
    ],
    answer: (v: Vars) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),
];

/* ================================================================== *\
 * U08.2 — ათეულების გამოკლება
 * ================================================================== */

const u082: QuestionTemplate[] = [
  /** Level 1 — 70 − 20, no borrowing and no negative result (Q7, Q8). */
  defineTemplate({
    ...at({ id: 'g1-u08-2-tens-small', subtopicId: 'ateulebis-gamokleba', difficulty: 1 }),
    prompt: 'შეავსე: {a} − {b} = __.',
    variables: {
      at: { kind: 'int', min: 3, max: 10 },
      bt: { kind: 'int', min: 1, max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.at) * 10] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.bt) * 10] },
    },
    constraints: [{ note: 'the result is a positive whole number of tens', test: (v: Vars) => Number(v.at) - Number(v.bt) >= 1 }],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.at} ათეული − ${vars.bt} ათეული = ${Number(vars.at) - Number(vars.bt)} ათეული = ${answer}.`,
    visual: (v: Vars) => drawPlaceValue(`${v.a} − ${v.b}`, Number(v.a) - Number(v.b)),
  }),

  /** Level 2 — 80 − 30 (Q9). */
  defineTemplate({
    ...at({ id: 'g1-u08-2-tens-mid', subtopicId: 'ateulebis-gamokleba', difficulty: 2 }),
    prompt: 'შეავსე: {a} − {b} = __.',
    variables: {
      at: { kind: 'int', min: 5, max: 10 },
      bt: { kind: 'int', min: 2, max: 7 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.at) * 10] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.bt) * 10] },
    },
    constraints: [{ note: 'at least one ten is left', test: (v: Vars) => Number(v.at) - Number(v.bt) >= 2 }],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.at} ათეული − ${vars.bt} ათეული = ${Number(vars.at) - Number(vars.bt)} ათეული = ${answer}.`,
  }),

  /** Level 2 — 100 − __ = 60, the subtrahend missing (Q10). */
  defineTemplate({
    ...at({ id: 'g1-u08-2-missing-subtrahend', subtopicId: 'ateulebis-gamokleba', difficulty: 2 }),
    prompt: 'შეავსე: {total} − __ = {diff}.',
    variables: {
      bt: { kind: 'int', min: 1, max: 8 },
      tt: { kind: 'int', min: 4, max: 10 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.tt) * 10] },
      diff: { kind: 'choice', values: (v: Vars) => [(Number(v.tt) - Number(v.bt)) * 10] },
    },
    constraints: [{ note: 'the difference is a positive whole number of tens', test: (v: Vars) => Number(v.diff) >= 10 }],
    answer: (v: Vars) => Number(v.bt) * 10,
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.tt} ათეული − ${Number(vars.tt) - Number(vars.bt)} ათეული = ${vars.bt} ათეული = ${answer}.`,
  }),

  /** Level 3 — 90 − 20 − 30, two subtractions in a row (Q11). */
  defineTemplate({
    ...at({ id: 'g1-u08-2-two-subtractions', subtopicId: 'ateulebis-gamokleba', difficulty: 3 }),
    prompt: 'შეავსე: {a} − {b} − {c} = __.',
    variables: {
      at: { kind: 'int', min: 6, max: 10 },
      bt: { kind: 'int', min: 1, max: 3 },
      ct: { kind: 'int', min: 1, max: 3 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.at) * 10] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.bt) * 10] },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.ct) * 10] },
    },
    constraints: [
      { note: 'two different subtrahends, so the sentence reads as three numbers', test: (v: Vars) => Number(v.bt) !== Number(v.ct) },
      { note: 'the result never goes negative', test: (v: Vars) => Number(v.at) - Number(v.bt) - Number(v.ct) >= 1 },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}, შემდეგ − ${vars.c} = ${answer}.`,
  }),

  /** Level 3 — 80 books, 30 then 20 taken, inside a sentence (Q12). */
  defineTemplate({
    ...at({ id: 'g1-u08-2-library', subtopicId: 'ateulebis-gamokleba', difficulty: 3 }),
    prompt:
      'ბიბლიოთეკაში იყო {a} {item}. მოსწავლეებმა {b} {item} წაიღეს, შემდეგ კი კიდევ {c}. რამდენი {item} დარჩა?',
    variables: {
      item: { kind: 'choice', values: ['წიგნი', 'რვეული', 'ფანქარი', 'სტიკერი'] },
      at: { kind: 'int', min: 6, max: 10 },
      bt: { kind: 'int', min: 1, max: 3 },
      ct: { kind: 'int', min: 1, max: 3 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.at) * 10] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.bt) * 10] },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.ct) * 10] },
    },
    constraints: [
      { note: 'two different amounts, so the sentence reads as three numbers', test: (v: Vars) => Number(v.bt) !== Number(v.ct) },
      { note: 'books are left over', test: (v: Vars) => Number(v.at) - Number(v.bt) - Number(v.ct) >= 1 },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} − ${vars.c} = ${answer}.`,
  }),
];

/* ================================================================== *\
 * U08.3 — ორნიშნა და ერთნიშნა რიცხვების შეკრება გადაჯგუფების გარეშე
 * ================================================================== */

/**
 * The rule of this subtopic is arithmetic, not decorative: **the ones digits
 * must sum to less than ten**, so the tens never have to be regrouped.
 *
 * The constraint is written on the ones digit rather than on the result, which
 * is what makes it exact. `24 + 5` has ones 4 + 5 = 9 and needs no regrouping;
 * `27 + 5` has ones 7 + 5 = 12 and does — and would belong to U08.4.
 */
const noCarry = (v: Vars): boolean => (Number(v.a) % 10) + Number(v.b) < 10;

const u083: QuestionTemplate[] = [
  /** Level 1 — 23 + 4 (Q13, Q14). */
  defineTemplate({
    ...at({ id: 'g1-u08-3-add-small', subtopicId: 'orcifra-ertcifra', difficulty: 1 }),
    prompt: 'შეავსე: {a} + {b} = __.',
    variables: {
      tens: { kind: 'int', min: 2, max: 4 },
      ones: { kind: 'int', min: 1, max: 4 },
      b: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, 9 - Number(v.ones)) },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [{ note: 'the ones digits do not carry', test: noCarry }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer}: ერთეულები ${Number(vars.a) % 10} + ${vars.b} = ${(Number(vars.a) % 10) + Number(vars.b)}, ათეული არ იცვლება.`,
    visual: (v: Vars) => drawPlaceValue(String(v.a), Number(v.a)),
  }),

  /** Level 2 — 52 + 7 (Q15). */
  defineTemplate({
    ...at({ id: 'g1-u08-3-add-mid', subtopicId: 'orcifra-ertcifra', difficulty: 2 }),
    prompt: 'შეავსე: {a} + {b} = __.',
    variables: {
      tens: { kind: 'int', min: 4, max: 7 },
      ones: { kind: 'int', min: 1, max: 5 },
      b: { kind: 'int', min: 2, max: (v: Vars) => Math.max(2, 9 - Number(v.ones)) },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [{ note: 'the ones digits do not carry', test: noCarry }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer}: ${Number(vars.a) % 10} + ${vars.b} = ${(Number(vars.a) % 10) + Number(vars.b)} ერთეული.`,
  }),

  /** Level 2 — 34 + __ = 39, the ones part missing (Q16). */
  defineTemplate({
    ...at({ id: 'g1-u08-3-missing-ones', subtopicId: 'orcifra-ertcifra', difficulty: 2 }),
    prompt: 'შეავსე: {a} + __ = {total}.',
    variables: {
      tens: { kind: 'int', min: 2, max: 7 },
      ones: { kind: 'int', min: 1, max: 4 },
      b: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, 9 - Number(v.ones)) },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
      // The printed total is derived, so the equation closes exactly.
      total: { kind: 'choice', values: (v: Vars) => [Number(v.a) + Number(v.b)] },
    },
    constraints: [{ note: 'the ones digits do not carry', test: noCarry }],
    answer: (v: Vars) => Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.total} − ${vars.a} = ${answer}: ერთეულებს აკლდება ერთეულები.`,
  }),

  /** Level 3 — 61 + 8, tens in the sixties (Q17). */
  defineTemplate({
    ...at({ id: 'g1-u08-3-add-large', subtopicId: 'orcifra-ertcifra', difficulty: 3 }),
    prompt: 'შეავსე: {a} + {b} = __.',
    variables: {
      tens: { kind: 'int', min: 5, max: 8 },
      ones: { kind: 'int', min: 1, max: 5 },
      b: { kind: 'int', min: 3, max: (v: Vars) => Math.max(3, 9 - Number(v.ones)) },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [{ note: 'the ones digits do not carry', test: noCarry }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer}: ${Number(vars.a) % 10} + ${vars.b} = ${(Number(vars.a) % 10) + Number(vars.b)} ერთეული.`,
  }),

  /** Level 3 — 42 cubes plus 5 more, inside a sentence (Q18). */
  defineTemplate({
    ...at({ id: 'g1-u08-3-box', subtopicId: 'orcifra-ertcifra', difficulty: 3 }),
    prompt: 'ყუთში არის {a} {item}. მას კიდევ {b} {item} დაამატეს. რამდენი {item}ა ახლა ყუთში?',
    variables: {
      item: { kind: 'choice', values: ['კუბიკი', 'ვაშლი', 'ფანქარი', 'ბურთი', 'ვარსკვლავი'] },
      tens: { kind: 'int', min: 3, max: 7 },
      ones: { kind: 'int', min: 1, max: 4 },
      b: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, 9 - Number(v.ones)) },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [{ note: 'the ones digits do not carry', test: noCarry }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),
];

/* ================================================================== *\
 * U08.4 — ორნიშნა და ერთნიშნა რიცხვების შეკრება გადაჯგუფებით
 * ================================================================== */

/**
 * The mirror rule: **the ones digits must sum to ten or more**, so a ten is
 * always regrouped. And, per the spec, the result never passes one hundred.
 *
 * `carries` is the exact test. It is also the reason this unit draws the place
 * value under the sum: after `27 + 5` the tens count has gone up by one, and
 * that extra ten is a visible block rather than a rule to memorise.
 */
const carries = (v: Vars): boolean =>
  (Number(v.a) % 10) + Number(v.b) >= 10 && Number(v.a) + Number(v.b) <= 100;

const u084: QuestionTemplate[] = [
  /** Level 1 — 27 + 5 (Q19, Q20). */
  defineTemplate({
    ...at({ id: 'g1-u08-4-carry-small', subtopicId: 'gadajgufebiT', difficulty: 1 }),
    prompt: 'შეავსე: {a} + {b} = __.',
    variables: {
      tens: { kind: 'int', min: 1, max: 3 },
      ones: { kind: 'int', min: 5, max: 9 },
      b: { kind: 'int', min: (v: Vars) => Math.max(1, 10 - Number(v.ones)), max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [{ note: 'the ones digits carry, and the total stays inside one hundred', test: carries }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${Number(vars.a) % 10} + ${vars.b} = ${(Number(vars.a) % 10) + Number(vars.b)} — ეს არის 1 ათეული და ${(Number(vars.a) % 10) + Number(vars.b) - 10} ერთეული, ამიტომ ${vars.a} + ${vars.b} = ${answer}.`,
    visual: (v: Vars) => drawPlaceValue(String(v.a), Number(v.a)),
  }),

  /** Level 2 — 48 + 7 (Q21). */
  defineTemplate({
    ...at({ id: 'g1-u08-4-carry-mid', subtopicId: 'gadajgufebiT', difficulty: 2 }),
    prompt: 'შეავსე: {a} + {b} = __.',
    variables: {
      tens: { kind: 'int', min: 3, max: 5 },
      ones: { kind: 'int', min: 6, max: 9 },
      b: { kind: 'int', min: (v: Vars) => Math.max(1, 10 - Number(v.ones)), max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [{ note: 'the ones digits carry, and the total stays inside one hundred', test: carries }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${Number(vars.a) % 10} + ${vars.b} = ${(Number(vars.a) % 10) + Number(vars.b)}: ერთი ათეული გადადის, ამიტომ ${answer}.`,
  }),

  /** Level 2 — 59 + 6, crossing into the next ten (Q22). */
  defineTemplate({
    ...at({ id: 'g1-u08-4-carry-near-ten', subtopicId: 'gadajgufebiT', difficulty: 2 }),
    prompt: 'შეავსე: {a} + {b} = __.',
    variables: {
      tens: { kind: 'int', min: 4, max: 6 },
      ones: { kind: 'int', min: 7, max: 9 },
      b: { kind: 'int', min: (v: Vars) => Math.max(1, 10 - Number(v.ones)), max: 8 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [{ note: 'the ones digits carry, and the total stays inside one hundred', test: carries }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${Number(vars.a) % 10} + ${vars.b} = ${(Number(vars.a) % 10) + Number(vars.b)}: ერთი ათეული გადადის, ამიტომ ${answer}.`,
  }),

  /** Level 3 — 67 + 8 (Q23). */
  defineTemplate({
    ...at({ id: 'g1-u08-4-carry-large', subtopicId: 'gadajgufebiT', difficulty: 3 }),
    prompt: 'შეავსე: {a} + {b} = __.',
    variables: {
      tens: { kind: 'int', min: 6, max: 8 },
      ones: { kind: 'int', min: 5, max: 9 },
      b: { kind: 'int', min: (v: Vars) => Math.max(1, 10 - Number(v.ones)), max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [{ note: 'the ones digits carry, and the total stays inside one hundred', test: carries }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${Number(vars.a) % 10} + ${vars.b} = ${(Number(vars.a) % 10) + Number(vars.b)}: ერთი ათეული გადადის, ამიტომ ${answer}.`,
  }),

  /** Level 3 — 38 stickers plus 7 more, inside a sentence (Q24). */
  defineTemplate({
    ...at({ id: 'g1-u08-4-stickers', subtopicId: 'gadajgufebiT', difficulty: 3 }),
    prompt: '{who} აქვს {a} სტიკერი. მეგობარმა კიდევ {b} აჩუქა. რამდენი სტიკერი აქვს ახლა?',
    variables: {
      who: { kind: 'choice', values: WHOM },
      tens: { kind: 'int', min: 2, max: 7 },
      ones: { kind: 'int', min: 6, max: 9 },
      b: { kind: 'int', min: (v: Vars) => Math.max(1, 10 - Number(v.ones)), max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [{ note: 'the ones digits carry, and the total stays inside one hundred', test: carries }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer}: ${Number(vars.a) % 10} + ${vars.b} = ${(Number(vars.a) % 10) + Number(vars.b)}, ამიტომ ერთი ათეული დაემატა.`,
  }),
];

/* ================================================================== *\
 * U08.5 — ორნიშნა რიცხვის გამოკლება ერთნიშნა რიცხვით
 * ================================================================== */

/**
 * Two-digit minus one-digit, and the result is **never negative** (rule 6).
 *
 * Two shapes live here and they are genuinely different work:
 *
 *  - level 1 and part of level 2 take away *within the same ten*, so only the
 *    ones column moves;
 *  - from level 2 onwards the subtrahend can be larger than the ones digit, so a
 *    ten must be broken — `72 − 5` is not `70 − 3`, it is `72 − 2 − 3`. That
 *    borrowing is the point of the subtopic, so it is drawn in the explanation
 *    rather than left implicit.
 *
 * The spec's Q29 asks for the column layout, so that template supplies a
 * `visual` written as the sum is set down in a school exercise book.
 */
const u085: QuestionTemplate[] = [
  /** Level 1 — 46 − 3, taking away inside the same ten (Q25, Q26). */
  defineTemplate({
    ...at({ id: 'g1-u08-5-within-ten', subtopicId: 'esveTis-chamowerTa', difficulty: 1 }),
    prompt: 'შეავსე: {a} − {b} = __.',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      ones: { kind: 'int', min: 4, max: 9 },
      b: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, Number(v.ones) - 1) },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [
      { note: 'only the ones column moves, and the result stays positive', test: (v: Vars) => Number(v.a) - Number(v.b) > 0 && Number(v.b) <= Number(v.a) % 10 },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}: მხოლოდ ერთეულები იცვლება.`,
    visual: (v: Vars) => drawPlaceValue(String(v.a), Number(v.a)),
  }),

  /** Level 2 — 72 − 5, a ten has to be broken open (Q27). */
  defineTemplate({
    ...at({ id: 'g1-u08-5-break-ten', subtopicId: 'esveTis-chamowerTa', difficulty: 2 }),
    prompt: 'შეავსე: {a} − {b} = __.',
    variables: {
      tens: { kind: 'int', min: 4, max: 8 },
      ones: { kind: 'int', min: 1, max: 4 },
      b: { kind: 'int', min: (v: Vars) => Math.max(2, Number(v.ones) + 1), max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [
      { note: 'the subtrahend is larger than the ones digit, so a ten is broken', test: (v: Vars) => Number(v.b) > Number(v.a) % 10 },
      { note: 'the result is still two-digit and non-negative', test: (v: Vars) => Number(v.a) - Number(v.b) >= 10 },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${Number(vars.a) % 10} = ${Number(vars.a) - (Number(vars.a) % 10)}, შემდეგ − ${Number(vars.b) - (Number(vars.a) % 10)} = ${answer}: ერთი ათეული გაიხსნა.`,
  }),

  /** Level 2 — 61 − 8 (Q28). */
  defineTemplate({
    ...at({ id: 'g1-u08-5-break-ten-mid', subtopicId: 'esveTis-chamowerTa', difficulty: 2 }),
    prompt: 'შეავსე: {a} − {b} = __.',
    variables: {
      tens: { kind: 'int', min: 5, max: 9 },
      ones: { kind: 'int', min: 0, max: 3 },
      b: { kind: 'int', min: (v: Vars) => Math.max(5, Number(v.ones) + 2), max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [
      { note: 'the subtrahend is larger than the ones digit', test: (v: Vars) => Number(v.b) > Number(v.a) % 10 },
      { note: 'the result is non-negative', test: (v: Vars) => Number(v.a) - Number(v.b) >= 10 },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}: ერთი ათეული გაიხსნა და ${Number(vars.b)} ერთეული მოაკლდა.`,
  }),

  /** Level 3 — 83 − 7, set down in columns (Q29). */
  defineTemplate({
    ...at({ id: 'g1-u08-5-columns', subtopicId: 'esveTis-chamowerTa', difficulty: 3 }),
    prompt: 'შეავსე სვეტებად წარმოდგენილი მაგალითი: {a} − {b} = __.',
    variables: {
      tens: { kind: 'int', min: 5, max: 9 },
      ones: { kind: 'int', min: 0, max: 5 },
      b: { kind: 'int', min: (v: Vars) => Math.max(6, Number(v.ones) + 1), max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [
      { note: 'the subtrahend is larger than the ones digit', test: (v: Vars) => Number(v.b) > Number(v.a) % 10 },
      { note: 'the result is non-negative', test: (v: Vars) => Number(v.a) - Number(v.b) >= 10 },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `ათეულებისა და ერთეულების სვეტები: ${vars.a} − ${vars.b} = ${answer}.`,
    // The sum as it is set down in an exercise book: the ones column cannot
    // take 7 from 3, so a ten is carried over before subtracting.
    visual: (v: Vars) =>
      `  ${v.a}\n−   ${v.b}\n———\n` + `სვეტები: ${Math.floor(Number(v.a) / 10)} ათეული ${Number(v.a) % 10} ერთეული`,
  }),

  /** Level 3 — 54 cubes, 8 taken, inside a sentence (Q30). */
  defineTemplate({
    ...at({ id: 'g1-u08-5-box', subtopicId: 'esveTis-chamowerTa', difficulty: 3 }),
    prompt: 'ყუთში იყო {a} {item}. {b} {item} აიღეს. რამდენი {item} დარჩა?',
    variables: {
      item: { kind: 'choice', values: ['კუბიკი', 'ვაშლი', 'ფანქარი', 'ბურთი', 'ვარსკვლავი', 'ნამცხვარი'] },
      tens: { kind: 'int', min: 3, max: 9 },
      ones: { kind: 'int', min: 0, max: 6 },
      b: { kind: 'int', min: 1, max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [
      { note: 'the subtrahend is larger than the ones digit, so a ten is broken', test: (v: Vars) => Number(v.b) > Number(v.a) % 10 },
      { note: 'the result is non-negative', test: (v: Vars) => Number(v.a) - Number(v.b) >= 0 },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),
];

/* ================================================================== *\
 * U08.6 — გამოკლება 0-დან 9-მდე რიცხვებით
 * ================================================================== */

/**
 * Every subtrahend is between zero and nine inclusive, and the minuend is a
 * two-digit number. The two extremes are the interesting ones: zero changes
 * nothing, and taking away the ones digit lands exactly on the ten.
 */
const u086: QuestionTemplate[] = [
  /** Level 1 — 35 − 0 and 49 − 9 (Q31, Q32). */
  defineTemplate({
    ...at({ id: 'g1-u08-6-zero', subtopicId: 'nulidan-9-mde', difficulty: 1 }),
    prompt: 'შეავსე: {a} − 0 = __.',
    variables: {
      a: { kind: 'int', min: 12, max: 95 },
    },
    answer: (v: Vars) => Number(v.a),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `ნულის გამოკლება რიცხვს არ ცვლის: ${vars.a} − 0 = ${answer}.`,
  }),

  /** Level 1 — take away the ones digit and land on the ten (Q32). */
  defineTemplate({
    ...at({ id: 'g1-u08-6-to-ten', subtopicId: 'nulidan-9-mde', difficulty: 1 }),
    prompt: 'შეავსე: {a} − {b} = __.',
    variables: {
      tens: { kind: 'int', min: 2, max: 9 },
      ones: { kind: 'int', min: 1, max: 9 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.ones)] },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    answer: (v: Vars) => Number(v.tens) * 10,
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}: რჩება მხოლოდ ათეულები.`,
  }),

  /** Level 2 — 62 − 4 (Q33). */
  defineTemplate({
    ...at({ id: 'g1-u08-6-mid', subtopicId: 'nulidan-9-mde', difficulty: 2 }),
    prompt: 'შეავსე: {a} − {b} = __.',
    variables: {
      tens: { kind: 'int', min: 3, max: 8 },
      ones: { kind: 'int', min: 0, max: 4 },
      b: { kind: 'int', min: (v: Vars) => Math.max(1, Number(v.ones) + 1), max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [{ note: 'the subtrahend is a one-digit number and the result stays positive', test: (v: Vars) => Number(v.b) <= 9 && Number(v.a) - Number(v.b) > 0 }],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  /** Level 2 — 71 − 6 (Q34). */
  defineTemplate({
    ...at({ id: 'g1-u08-6-mid-large', subtopicId: 'nulidan-9-mde', difficulty: 2 }),
    prompt: 'შეავსე: {a} − {b} = __.',
    variables: {
      tens: { kind: 'int', min: 5, max: 9 },
      ones: { kind: 'int', min: 0, max: 3 },
      b: { kind: 'int', min: (v: Vars) => Math.max(2, Number(v.ones) + 1), max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [{ note: 'the result stays positive', test: (v: Vars) => Number(v.a) - Number(v.b) > 0 }],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  /** Level 3 — 90 − 7 (Q35). */
  defineTemplate({
    ...at({ id: 'g1-u08-6-from-ten', subtopicId: 'nulidan-9-mde', difficulty: 3 }),
    prompt: 'შეავსე: {a} − {b} = __.',
    variables: {
      tens: { kind: 'int', min: 4, max: 9 },
      b: { kind: 'int', min: 3, max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10] },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer}: ${vars.a} = ${Number(vars.a) - 10} + 10, ამიტომ 10 − ${vars.b} = ${10 - Number(vars.b)}.`,
  }),

  /** Level 3 — __ − 8 = 47, the minuend missing (Q36). */
  defineTemplate({
    ...at({ id: 'g1-u08-6-missing-minuend', subtopicId: 'nulidan-9-mde', difficulty: 3 }),
    prompt: 'შეავსე: __ − {b} = {c}.',
    variables: {
      b: { kind: 'int', min: 2, max: 9 },
      c: { kind: 'int', min: 20, max: 89 },
      // The minuend is the sum of the two printed numbers, so the equation
      // closes exactly and the answer is never negative.
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.c)] },
    },
    constraints: [{ note: 'the minuend stays two-digit and inside one hundred', test: (v: Vars) => Number(v.a) <= 100 }],
    answer: (v: Vars) => Number(v.a),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.b} + ${vars.c} = ${answer}, ამიტომ საკლები ${answer}-ია.`,
  }),
];

/* ================================================================== *\
 * U08.7 — ათეულების შეკრება და გამოკლება 100-ის ფარგლებში
 * ================================================================== */

/**
 * The tens that were added as wholes in U08.1 are now added *to a two-digit
 * number*: `25 + 10` changes the tens digit and leaves the ones alone. Adding
 * or subtracting a multiple of ten is the one case where column arithmetic is
 * transparent, which is why it is taught here before long addition.
 *
 * Rule 7 of the spec is a constraint on every template: the running total never
 * leaves 0…100. As in U08.1, the printed tens are derived numbers (`t = tt × 10`)
 * and never the count itself, or the prompt would read „17 + 4“ with an answer
 * of 57.
 */
const u087: QuestionTemplate[] = [
  /** Level 1 — 25 + 10 (Q37). */
  defineTemplate({
    ...at({ id: 'g1-u08-7-plus-ten', subtopicId: 'aszeulSi', difficulty: 1 }),
    prompt: 'შეავსე: {a} + {t} = __.',
    variables: {
      tensOfA: { kind: 'int', min: 1, max: 5 },
      ones: { kind: 'int', min: 1, max: 9 },
      tt: { kind: 'int', min: 1, max: 4 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tensOfA) * 10 + Number(v.ones)] },
      t: { kind: 'choice', values: (v: Vars) => [Number(v.tt) * 10] },
    },
    constraints: [{ note: 'the total stays inside one hundred', test: (v: Vars) => Number(v.a) + Number(v.t) <= 100 }],
    answer: (v: Vars) => Number(v.a) + Number(v.t),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.t} = ${answer}: იცვლება მხოლოდ ათეულები.`,
    visual: (v: Vars) => drawPlaceValue(String(v.a), Number(v.a)),
  }),

  /** Level 1 — 68 − 20 (Q38). */
  defineTemplate({
    ...at({ id: 'g1-u08-7-minus-ten', subtopicId: 'aszeulSi', difficulty: 1 }),
    prompt: 'შეავსე: {a} − {t} = __.',
    variables: {
      tensOfA: { kind: 'int', min: 4, max: 9 },
      ones: { kind: 'int', min: 1, max: 9 },
      tt: { kind: 'int', min: 1, max: 3 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tensOfA) * 10 + Number(v.ones)] },
      t: { kind: 'choice', values: (v: Vars) => [Number(v.tt) * 10] },
    },
    constraints: [{ note: 'the result stays positive', test: (v: Vars) => Number(v.a) - Number(v.t) > 0 }],
    answer: (v: Vars) => Number(v.a) - Number(v.t),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.t} = ${answer}: იცვლება მხოლოდ ათეულები.`,
  }),

  /** Level 2 — 37 + 20 (Q39). */
  defineTemplate({
    ...at({ id: 'g1-u08-7-plus-twenty', subtopicId: 'aszeulSi', difficulty: 2 }),
    prompt: 'შეავსე: {a} + {t} = __.',
    variables: {
      tensOfA: { kind: 'int', min: 2, max: 7 },
      ones: { kind: 'int', min: 1, max: 9 },
      tt: { kind: 'int', min: 2, max: 4 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tensOfA) * 10 + Number(v.ones)] },
      t: { kind: 'choice', values: (v: Vars) => [Number(v.tt) * 10] },
    },
    constraints: [{ note: 'the total stays inside one hundred', test: (v: Vars) => Number(v.a) + Number(v.t) <= 100 }],
    answer: (v: Vars) => Number(v.a) + Number(v.t),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.t} = ${answer}.`,
  }),

  /** Level 2 — 84 − 30 (Q40). */
  defineTemplate({
    ...at({ id: 'g1-u08-7-minus-thirty', subtopicId: 'aszeulSi', difficulty: 2 }),
    prompt: 'შეავსე: {a} − {t} = __.',
    variables: {
      tensOfA: { kind: 'int', min: 5, max: 10 },
      ones: { kind: 'int', min: 1, max: 9 },
      tt: { kind: 'int', min: 2, max: 5 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tensOfA) * 10 + Number(v.ones)] },
      t: { kind: 'choice', values: (v: Vars) => [Number(v.tt) * 10] },
    },
    constraints: [{ note: 'the result stays positive', test: (v: Vars) => Number(v.a) - Number(v.t) > 0 }],
    answer: (v: Vars) => Number(v.a) - Number(v.t),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.t} = ${answer}.`,
  }),

  /** Level 3 — 26 + 30 − 10, two steps (Q41). */
  defineTemplate({
    ...at({ id: 'g1-u08-7-two-steps', subtopicId: 'aszeulSi', difficulty: 3 }),
    prompt: 'შეავსე: {a} + {add} − {sub} = __.',
    variables: {
      tensOfA: { kind: 'int', min: 1, max: 6 },
      ones: { kind: 'int', min: 1, max: 9 },
      addT: { kind: 'int', min: 2, max: 4 },
      subT: { kind: 'int', min: 1, max: 3 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tensOfA) * 10 + Number(v.ones)] },
      add: { kind: 'choice', values: (v: Vars) => [Number(v.addT) * 10] },
      sub: { kind: 'choice', values: (v: Vars) => [Number(v.subT) * 10] },
    },
    constraints: [
      { note: 'the two tens differ, so the sentence reads as three numbers', test: (v: Vars) => Number(v.addT) !== Number(v.subT) },
      { note: 'both steps stay inside nought to one hundred', test: (v: Vars) => Number(v.a) + Number(v.add) <= 100 && Number(v.a) + Number(v.add) - Number(v.sub) > 0 },
    ],
    answer: (v: Vars) => Number(v.a) + Number(v.add) - Number(v.sub),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.add} = ${Number(vars.a) + Number(vars.add)}, შემდეგ − ${vars.sub} = ${answer}.`,
  }),

  /** Level 3 — 95 exercise books, 20 then 10 sold (Q42). */
  defineTemplate({
    ...at({ id: 'g1-u08-7-shop', subtopicId: 'aszeulSi', difficulty: 3 }),
    prompt:
      'მაღაზიაში იყო {a} {item}. გაიყიდა {t}, შემდეგ კი კიდევ {u}. რამდენი {item} დარჩა?',
    variables: {
      item: { kind: 'choice', values: ['რვეული', 'წიგნი', 'ფანქარი', 'სტიკერი'] },
      tensOfA: { kind: 'int', min: 6, max: 9 },
      ones: { kind: 'int', min: 1, max: 9 },
      tT: { kind: 'int', min: 1, max: 3 },
      uT: { kind: 'int', min: 1, max: 3 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tensOfA) * 10 + Number(v.ones)] },
      t: { kind: 'choice', values: (v: Vars) => [Number(v.tT) * 10] },
      u: { kind: 'choice', values: (v: Vars) => [Number(v.uT) * 10] },
    },
    constraints: [
      { note: 'the two amounts differ, so the sentence reads as three numbers', test: (v: Vars) => Number(v.tT) !== Number(v.uT) },
      { note: 'something is left over', test: (v: Vars) => Number(v.a) - Number(v.t) - Number(v.u) >= 10 },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.t) - Number(v.u),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.t} − ${vars.u} = ${answer}.`,
  }),
];

/* ================================================================== *\
 * U08.8 — ჯამებისა და სხვაობების შედარება 10-თან
 * ================================================================== */

/**
 * Compare an expression with ten — or with another expression.
 *
 * Rule 8 of the spec is the whole point of the subtopic: **evaluate both sides,
 * then compare.** No template compares a printed number with a shape. The
 * engine's `shuffle` mode sorts three options, but a comparison has a natural
 * order, so it is offered as a three-way choice instead of a scramble — every
 * draw's three options are the same three words, and the key is the one that is
 * true.
 */
const u088: QuestionTemplate[] = [
  /** Level 1 — compare a small sum with ten (Q43). */
  defineTemplate({
    ...at({ id: 'g1-u08-8-sum-to-ten', subtopicId: 'Sedareba-10Tan', difficulty: 1 }),
    prompt: 'შეადარე {a} + {b} და 10. აირჩიე სწორი პასუხი.',
    variables: {
      a: { kind: 'int', min: 1, max: 8 },
      b: { kind: 'int', min: 1, max: 9 },
    },
    constraints: [{ note: 'the sum does not equal ten, so the choice is not a third case', test: (v: Vars) => Number(v.a) + Number(v.b) !== 10 }],
    answer: (v: Vars) => {
      const sum = Number(v.a) + Number(v.b);
      return sum < 10 ? `${v.a} + ${v.b} < 10` : `${v.a} + ${v.b} > 10`;
    },
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [`${a} + ${b} < 10`, `${a} + ${b} = 10`, `${a} + ${b} > 10`];
    },
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),

  /** Level 2 — a sum that really does pass ten (Q44). */
  defineTemplate({
    ...at({ id: 'g1-u08-8-sum-past-ten', subtopicId: 'Sedareba-10Tan', difficulty: 2 }),
    prompt: 'შეადარე {a} + {b} და 10.',
    variables: {
      a: { kind: 'int', min: 6, max: 9 },
      b: { kind: 'int', min: 4, max: 9 },
    },
    constraints: [{ note: 'the sum passes ten', test: (v: Vars) => Number(v.a) + Number(v.b) > 10 }],
    answer: (v: Vars) => `${v.a} + ${v.b} > 10`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [`${a} + ${b} < 10`, `${a} + ${b} = 10`, `${a} + ${b} > 10`];
    },
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, რაც 10-ზე მეტია.`,
  }),

  /** Level 2 — a difference that lands exactly on ten (Q45). */
  defineTemplate({
    ...at({ id: 'g1-u08-8-difference-equals', subtopicId: 'Sedareba-10Tan', difficulty: 2 }),
    prompt: 'შეადარე {a} − {b} და 10.',
    variables: {
      b: { kind: 'int', min: 2, max: 20 },
      a: { kind: 'choice', values: (v: Vars) => [10 + Number(v.b)] },
    },
    answer: (v: Vars) => `${v.a} − ${v.b} = 10`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [`${a} − ${b} < 10`, `${a} − ${b} = 10`, `${a} − ${b} > 10`];
    },
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = 10.`,
  }),

  /** Level 3 — a difference above ten (Q46). */
  defineTemplate({
    ...at({ id: 'g1-u08-8-difference-past', subtopicId: 'Sedareba-10Tan', difficulty: 3 }),
    prompt: 'შეადარე {a} − {b} და 10.',
    variables: {
      b: { kind: 'int', min: 2, max: 8 },
      a: { kind: 'int', min: 14, max: 29 },
    },
    constraints: [{ note: 'the difference passes ten', test: (v: Vars) => Number(v.a) - Number(v.b) > 10 }],
    answer: (v: Vars) => `${v.a} − ${v.b} > 10`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [`${a} − ${b} < 10`, `${a} − ${b} = 10`, `${a} − ${b} > 10`];
    },
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}, რაც 10-ზე მეტია.`,
  }),

  /**
   * Level 3 — 7 + 6 __ 20 − 7, two expressions compared (Q47).
   *
   * The *sign* is drawn first and the right-hand expression is then built to
   * have that sign. Left to chance the three outcomes are wildly uneven — `>`
   * came up 69% of the time and `=` less than 8% — and a child who always
   * answers „greater“ would be right two times in three. Drawing the sign makes
   * every answer equally likely, which is what makes the item measure
   * arithmetic rather than the base rate.
   */
  defineTemplate({
    ...at({ id: 'g1-u08-8-two-sides', subtopicId: 'Sedareba-10Tan', difficulty: 3 }),
    prompt: 'შეავსე შესაბამისი ნიშანი: {a} + {b} __ {c} − {d}.',
    variables: {
      a: { kind: 'int', min: 4, max: 9 },
      b: { kind: 'int', min: 3, max: 9 },
      sign: { kind: 'choice', values: ['<', '=', '>'] },
      // `d` must be declared before the right-hand side that uses it: variables
      // are drawn in declaration order, so a later one is simply absent.
      d: { kind: 'int', min: 1, max: 8 },
      // A random gap the right-hand side must be away from the left. It is what
      // makes the drawn sign decide `c`: with the gap fixed at 0 every sentence
      // would be „=“, which is what the first attempt printed on all 600 seeds.
      gap: { kind: 'int', min: 1, max: 9 },
      // The right-hand side is derived from the left, the drawn sign and the
      // gap, so the sentence is true by construction and exactly one sign
      // completes it.
      c: {
        kind: 'choice',
        values: (v: Vars) => {
          const left = Number(v.a) + Number(v.b);
          const right = v.sign === '<' ? left + Number(v.gap) : v.sign === '>' ? left - Number(v.gap) : left;
          return [right + Number(v.d)];
        },
      },
    },
    constraints: [
      { note: 'the right side is not negative', test: (v: Vars) => Number(v.c) - Number(v.d) >= 0 },
      { note: 'the right side keeps the sign that was drawn', test: (v: Vars) => {
          const left = Number(v.a) + Number(v.b);
          const right = Number(v.c) - Number(v.d);
          return v.sign === '<' ? left < right : v.sign === '>' ? left > right : left === right;
        } },
      { note: 'the right-hand numbers differ, so the sentence reads as four numbers', test: (v: Vars) => Number(v.c) !== Number(v.d) },
    ],
    answer: (v: Vars) => String(v.sign),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => ['<', '>', '='],
    explanation: ({ vars, answer }) => {
      const left = Number(vars.a) + Number(vars.b);
      const right = Number(vars.c) - Number(vars.d);
      return `${vars.a} + ${vars.b} = ${left}, ხოლო ${vars.c} − ${vars.d} = ${right}, ამიტომ სწორი ნიშანია „${answer}“.`;
    },
  }),
];

/* ================================================================== *\
 * U08.9 — რიცხვითი თავსატეხები (გადათრევა და ჩამოგდება)
 * ================================================================== */

/**
 * A number puzzle with exactly one answer (rule 9).
 *
 * The blank's value is drawn first and the equation is then built around it, so
 * there is never a second number that would also close the sentence. The
 * options are the answer plus numbers that are wrong *for a reason*: the
 * neighbouring value, the other printed number, and one ten off.
 */
const u089: QuestionTemplate[] = [
  /** Level 1 — 20 + __ = 50, one blank, four whole tens offered (Q48). */
  defineTemplate({
    ...at({ id: 'g1-u08-9-drag-tens', subtopicId: 'ricxviTi-gamocanebi', difficulty: 1 }),
    prompt: 'გადაათრიე სწორი რიცხვი გამოტოვებულ ადგილზე: {a} + __ = {total}.',
    variables: {
      at: { kind: 'int', min: 1, max: 6 },
      bt: { kind: 'int', min: 1, max: 6 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.at) * 10] },
      // The total is the sum of the two tens, so the blank has exactly one value.
      total: { kind: 'choice', values: (v: Vars) => [(Number(v.at) + Number(v.bt)) * 10] },
    },
    constraints: [
      { note: 'the two addends differ, so the answer is not printed in the sentence', test: (v: Vars) => Number(v.at) !== Number(v.bt) },
      { note: 'the total stays inside one hundred', test: (v: Vars) => Number(v.total) <= 100 },
    ],
    answer: (v: Vars) => Number(v.bt) * 10,
    format: { kind: 'integer', min: 0 },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const value = Number(answer);
      return [value + 10, value - 10, Number(vars.a), Number(vars.a) + 20]
        .filter((candidate) => candidate !== value && candidate > 0 && candidate <= 100)
        .map(String);
    },
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.a} = ${answer}.`,
  }),

  /**
   * Level 1 — the same puzzle inside a sentence, so level 1 is not one shape.
   *
   * The blank is the number of ones added: „23 კუბიკამდე 5 აკლია“ would be a
   * different sentence again, so this one stays literal — count what is there,
   * count what is wanted, find the difference.
   */
  defineTemplate({
    ...at({ id: 'g1-u08-9-box', subtopicId: 'ricxviTi-gamocanebi', difficulty: 1 }),
    prompt: 'ყუთში არის {a} {item}. კიდევ რამდენი {item} უნდა დავამატოთ, რომ {total} გახდეს?',
    variables: {
      item: { kind: 'choice', values: ['კუბიკი', 'ვაშლი', 'ფანქარი', 'ბურთი'] },
      tensOfA: { kind: 'int', min: 1, max: 4 },
      ones: { kind: 'int', min: 1, max: 8 },
      answer: { kind: 'int', min: 1, max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tensOfA) * 10 + Number(v.ones)] },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.a) + Number(v.answer)] },
    },
    constraints: [{ note: 'the total stays two-digit', test: (v: Vars) => Number(v.total) <= 99 }],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.a} = ${answer}.`,
  }),

  /** Level 2 — __ + 7 = 42, the minuend of the sum missing (Q49). */
  defineTemplate({
    ...at({ id: 'g1-u08-9-drag-minuend', subtopicId: 'ricxviTi-gamocanebi', difficulty: 2 }),
    prompt: 'განათავსე რიცხვები სწორ ადგილებზე: __ + {b} = {total}.',
    variables: {
      b: { kind: 'int', min: 3, max: 9 },
      total: { kind: 'int', min: 20, max: 90 },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.total) - Number(v.b)] },
    },
    constraints: [{ note: 'the missing number is a non-negative whole number', test: (v: Vars) => Number(v.answer) >= 10 }],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.b} = ${answer}.`,
  }),

  /** Level 3 — 35 + __ − 10 = 50, a blank inside a two-step sentence (Q50). */
  defineTemplate({
    ...at({ id: 'g1-u08-9-drag-two-steps', subtopicId: 'ricxviTi-gamocanebi', difficulty: 3 }),
    prompt: 'გადაათრიე სწორი რიცხვები, რათა ტოლობა სწორი გახდეს: {a} + __ − {c} = {total}.',
    variables: {
      a: { kind: 'int', min: 20, max: 60 },
      c: { kind: 'int', min: 5, max: 15 },
      total: { kind: 'int', min: 30, max: 90 },
      // The blank is whatever makes the sentence true, and it is computed from
      // the printed numbers rather than drawn.
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.total) + Number(v.c) - Number(v.a)] },
    },
    constraints: [
      { note: 'the missing number is positive and one- or two-digit', test: (v: Vars) => Number(v.answer) > 0 && Number(v.answer) <= 60 },
      { note: 'the intermediate step is not the answer', test: (v: Vars) => Number(v.answer) !== Number(v.c) },
    ],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => placeValueDistractors(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${answer} = ${Number(vars.a) + Number(answer)}, შემდეგ − ${vars.c} = ${vars.total}.`,
  }),
];

/* ================================================================== *\
 * Export
 * ================================================================== */

export const U08_TEMPLATES: QuestionTemplate[] = [
  ...u081,
  ...u082,
  ...u083,
  ...u084,
  ...u085,
  ...u086,
  ...u087,
  ...u088,
  ...u089,
];

/** Subtopic ids this library is responsible for. */
export const U08_SUBTOPICS = [
  'ateulebi-ateulebi',
  'ateulebis-gamokleba',
  'orcifra-ertcifra',
  'gadajgufebiT',
  'esveTis-chamowerTa',
  'nulidan-9-mde',
  'aszeulSi',
  'Sedareba-10Tan',
  'ricxviTi-gamocanebi',
];
