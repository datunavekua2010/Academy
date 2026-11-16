import type { QuestionTemplate } from './types';
import { bank, fourOptions, group, relation, rowNumbers } from './g5-helpers';

/**
 * Grade V — Unit 16: ალგებრა და ხარისხები (algebra and powers).
 *
 * Converted from the academy's `U16` bank (6 subtopics × 6 questions). Two
 * things make this unit different from its neighbours.
 *
 * **The bank is small and many of its questions are one-off.** „გამოთვალე 12²"
 * is a single question; six of them cannot fill a session. So each subtopic is
 * covered by *several* templates built on the same idea at different angles —
 * order of operations has five, equations have six, powers have four — and every
 * value they use is drawn from a pool of at least twelve rows. The bank's own
 * questions are the seeds, not the whole set.
 *
 * **Powers are written with real superscripts.** The bank's LaTeX (`4^2`,
 * `2^3`) is not typeable by a ten-year-old and, printed literally, `4^2` reads
 * as a caret rather than an index. `²` and `³` are already the convention for
 * units in this codebase („სმ²“, „მ²“), so the same characters carry the
 * arithmetic: „გამოთვალე 4²“. Higher powers use the full superscript run
 * (`⁴⁵⁶⁷⁸⁹`), which `superscript()` below produces from the same digits the
 * answer is computed from, so the wording and the key cannot disagree.
 */

export const G5_U16_SUBTOPICS = [
  'u16-01',
  'u16-02',
  'u16-03',
  'u16-04',
  'u16-05',
  'u16-06',
] as const;

export type G5U16SubtopicId = (typeof G5_U16_SUBTOPICS)[number];

const TOPIC = 'g5-algebra-powers';

/** One cell of a `spec` row, as a number. */
const at = (row: unknown, index: number): number => rowNumbers(row)[index]!;

/** One cell of a `spec` row, as the string it was written as. */
const cell = (row: unknown, index: number): string => String(row).split('|')[index]!.trim();

const SUPERSCRIPT: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

/**
 * `12` → `¹²`. A power is written with raised digits, the same way a unit is
 * written with a raised 2 („სმ²“), because a caret is neither a numeral a child
 * reads nor something they can type back.
 */
const superscript = (n: number): string =>
  String(n)
    .split('')
    .map((digit) => SUPERSCRIPT[digit] ?? digit)
    .join('');

/** `base^power` as a student reads it: `4²`, `10⁴`. */
const power = (base: number, exponent: number): string => `${base}${superscript(exponent)}`;

/**
 * Exactly four distinct options, the answer first, padded with near misses.
 *
 * Powers and areas collide easily („4²“ is also „2⁴“), and an option list that
 * falls short of three wrong answers makes the generator reject the draw.
 * Filling from `right ± d` keeps every draw usable and never invents an option
 * that is actually correct.
 */
const numericOptions = (
  right: number | string,
  extras: Array<number | string>,
  fmt: (n: number) => string = String,
): string[] => {
  const out: string[] = [String(right)];
  const add = (candidate: number | string) => {
    const text = String(candidate);
    if (out.length < 4 && !out.includes(text) && !text.startsWith('-')) out.push(text);
  };
  for (const extra of extras) add(fmt(Number(extra)));
  const base = Number(String(right).replace(',', '.'));
  for (let d = 1; d <= 60 && out.length < 4; d += 1) {
    add(fmt(base + d));
    if (base - d > 0) add(fmt(base - d));
  }
  return out;
};

/** The perfect squares a Grade V student should recognise, 1…30. */
const SQUARES: number[] = Array.from({ length: 30 }, (_, i) => (i + 1) ** 2);

// ────────────────────────── U16.1 — order of operations ──────────────────────────

/**
 * The operations of one order-of-operations question.
 *
 * Each entry is the *printed* expression together with its value, computed
 * independently of the string so the two can be checked against each other in
 * the tests. The templates read the printed form; the answer re-derives the
 * value from the same numbers, so no question can quote a total it does not
 * have.
 */
const ORDER_ROWS: Array<{ text: string; value: number }> = [
  { text: '8 + 4 × 3', value: 20 },
  { text: '15 − 7 × 4', value: -13 },
  { text: '36 ÷ 6 + 7 × 2', value: 20 },
  { text: '50 − (12 + 8) ÷ 4', value: 45 },
  { text: '6 × (9 − 4) + 18 ÷ 3', value: 36 },
  { text: '72 ÷ (6 + 3) + 5 × 4', value: 48 },
  { text: '7 + 6 × 5', value: 37 },
  { text: '40 − 8 × 4', value: 8 },
  { text: '9 × (7 − 3) + 6', value: 42 },
  { text: '(14 + 6) ÷ 5 + 11', value: 15 },
  { text: '5 + 3 × (10 − 4)', value: 23 },
  { text: '64 ÷ 8 + 9 × 3', value: 35 },
  { text: '30 − (9 − 4) × 5', value: 5 },
  { text: '(21 + 15) ÷ 4 + 12', value: 21 },
  { text: '6 × 7 − 20 ÷ 5', value: 38 },
  { text: '48 ÷ (2 + 4) × 3', value: 24 },
  { text: '100 − 6 × 9', value: 46 },
  { text: '8 × (5 + 3) ÷ 4', value: 16 },
];

// ────────────────────────── U16.2 — expressions ──────────────────────────

/** `3a + 5`, `7b − 6`, `2x + 3y`, `4a + 2b` — the bank's own forms. */
const EXPRESSION_ROWS: Array<{
  text: string;
  /** Letters as the expression writes them, in the order the prompt names them. */
  letters: [string, string?];
  a: number;
  b: number;
  value: number;
}> = [
  { text: '3a + 5', letters: ['a'], a: 4, b: 0, value: 17 },
  { text: '7b − 6', letters: ['b'], a: 0, b: 5, value: 29 },
  { text: '2x + 3y', letters: ['x', 'y'], a: 4, b: 2, value: 14 },
  { text: '4a + 2b', letters: ['a', 'b'], a: 3, b: 6, value: 24 },
  { text: '3a + 5', letters: ['a'], a: 6, b: 0, value: 23 },
  { text: '7b − 6', letters: ['b'], a: 0, b: 7, value: 43 },
  { text: '2x + 3y', letters: ['x', 'y'], a: 5, b: 3, value: 19 },
  { text: '4a + 2b', letters: ['a', 'b'], a: 5, b: 4, value: 28 },
  { text: '3a + 5', letters: ['a'], a: 9, b: 0, value: 32 },
  { text: '7b − 6', letters: ['b'], a: 0, b: 9, value: 57 },
  { text: '2x + 3y', letters: ['x', 'y'], a: 6, b: 4, value: 24 },
  { text: '4a + 2b', letters: ['a', 'b'], a: 7, b: 2, value: 32 },
  { text: '5a − 7', letters: ['a'], a: 4, b: 0, value: 13 },
  { text: '6b + 12', letters: ['b'], a: 0, b: 3, value: 30 },
  { text: '5a − 7', letters: ['a'], a: 8, b: 0, value: 33 },
  { text: '6b + 12', letters: ['b'], a: 0, b: 8, value: 60 },
];

// ────────────────────────── U16.3 — equations ──────────────────────────

/**
 * The bank's six equations, generalised.
 *
 * Every form is parametric rather than tabulated, so the pool cannot run dry:
 * `x + n = sum` for any `x`, `k·a = product` for any `a`, `k·x + m = total` for
 * any `x`. The answer is solved for, never asserted.
 */
const SOLVE_ROWS: Array<{ form: string; n: number; k: number; m: number; x: number }> = [
  { form: 'add', n: 17, k: 0, m: 0, x: 25 },
  { form: 'sub', n: 28, k: 0, m: 0, x: 63 },
  { form: 'mul', n: 0, k: 6, m: 0, x: 9 },
  { form: 'div', n: 0, k: 7, m: 0, x: 56 },
  { form: 'lin', n: 0, k: 3, m: 5, x: 7 },
  { form: 'lin', n: 0, k: 4, m: 9, x: 10 },
  { form: 'add', n: 23, k: 0, m: 0, x: 41 },
  { form: 'sub', n: 15, k: 0, m: 0, x: 52 },
  { form: 'mul', n: 0, k: 8, m: 0, x: 7 },
  { form: 'div', n: 0, k: 9, m: 0, x: 63 },
  { form: 'lin', n: 0, k: 5, m: 7, x: 6 },
  { form: 'lin', n: 0, k: 6, m: 4, x: 8 },
  { form: 'add', n: 36, k: 0, m: 0, x: 58 },
  { form: 'sub', n: 19, k: 0, m: 0, x: 74 },
  { form: 'mul', n: 0, k: 12, m: 0, x: 5 },
  { form: 'div', n: 0, k: 4, m: 0, x: 36 },
];

/** The printed equation and its solution, from one row. */
const equationFor = (row: { form: string; n: number; k: number; m: number; x: number }) => {
  const { form, n, k, m, x } = row;
  switch (form) {
    case 'add':
      return { text: `x + ${n} = ${x + n}`, solution: x };
    case 'sub':
      return { text: `y − ${n} = ${x - n}`, solution: x };
    case 'mul':
      return { text: `${k}a = ${k * x}`, solution: x };
    case 'div':
      return { text: `b ÷ ${k} = ${x / k}`, solution: x };
    default:
      return { text: `${k}x + ${m} = ${k * x + m}`, solution: x };
  }
};

// ────────────────────────── U16.4–U16.6 — powers ──────────────────────────

/** Bases whose square the grade works with. */
const SQUARE_ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 20, 25];

/** Bases whose cube the grade works with, extended past the bank's own five. */
const CUBE_ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 25];

export const G5_U16_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U16.1 — მოქმედებათა თანმიმდევრობა ═════════
  bank({
    id: 'g5-u16-q01',
    subtopicId: 'u16-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {expr}.',
    hint: 'ჯერ გამრავლება და გაყოფა, შემდეგ შეკრება და გამოკლება — მარცხნიდან მარჯვნივ.',
    variables: {
      spec: { kind: 'choice', values: ORDER_ROWS.map((row) => row.text) },
      expr: { kind: 'choice', values: (v) => [String(v.spec)] },
    },
    // Re-derived from the printed expression rather than looked up, so a typo in
    // the table cannot ship a wrong key.
    answer: (v) => evaluate(String(v.expr)),
    format: { kind: 'integer' },
    options: (v) => {
      const right = evaluate(String(v.expr));
      return numericOptions(right, [right + 10, right - 6, right + 20]);
    },
    explain: ({ vars, answer }) =>
      `მოქმედებათა რიგის დაცვით ${vars.expr} = ${answer}.`,
  }),
  bank({
    id: 'g5-u16-q02',
    subtopicId: 'u16-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რომელი მოქმედება სრულდება პირველი გამოსახულებაში {expr}?',
    hint: 'ფრჩხილები ყველაზე ადრე, შემდეგ გამრავლება-გაყოფა, ბოლოს შეკრება-გამოკლება.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '8 + 4 × 3|გამრავლება',
          '36 ÷ 6 + 7 × 2|გაყოფა',
          '50 − (12 + 8) ÷ 4|ფრჩხილებში მოცემული შეკრება',
          '6 × (9 − 4) + 18 ÷ 3|ფრჩხილებში მოცემული გამოკლება',
          '4 + 9 × 2|გამრავლება',
          '20 ÷ 4 + 3|გაყოფა',
          '15 − (3 + 2) × 2|ფრჩხილებში მოცემული შეკრება',
          '7 × 8 − 5|გამრავლება',
          '18 ÷ 3 − 2|გაყოფა',
          '12 + 6 × 4|გამრავლება',
          '45 − (7 − 2) ÷ 5|ფრჩხილებში მოცემული გამოკლება',
          '9 ÷ 3 + 4 × 5|გაყოფა',
          '(9 + 6) × 2 − 5|ფრჩხილებში მოცემული შეკრება',
          '64 ÷ (3 + 5) + 7|ფრჩხილებში მოცემული შეკრება',
          '30 − 4 × 6|გამრავლება',
          '48 ÷ 6 + 11|გაყოფა',
          '72 ÷ (4 + 4) × 2|ფრჩხილებში მოცემული შეკრება',
          '5 × 6 − 24 ÷ 4|გამრავლება',
          '(36 − 12) ÷ 6 + 8|ფრჩხილებში მოცემული გამოკლება',
          '14 + 8 × 3 − 20|გამრავლება',
        ],
      },
      expr: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      first: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
    },
    answer: (v) => String(v.first),
    format: { kind: 'text' },
    // Exactly the four operations. The bracket case is phrased as the operation
    // inside the brackets („ფრჩხილებში მოცემული შეკრება“), so it needs no
    // fifth option of its own.
    options: () => ['გამრავლება', 'გაყოფა', 'შეკრება', 'გამოკლება'],
    explain: ({ vars, answer }) =>
      `${vars.expr} — ჯერ ${answer} სრულდება, ამიტომ სწორედ იქიდან იწყება გამოთვლა.`,
  }),
  bank({
    id: 'g5-u16-q03',
    subtopicId: 'u16-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოსახულებაში {expr} ჩასვი ფრჩხილები ისე, რომ შედეგი {target} გახდეს. სად უნდა ჩაისვას ფრჩხილები?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '8 + 4 × 3|(8 + 4) × 3|36',
          '15 − 7 × 4|(15 − 7) × 4|32',
          '6 + 9 × 2|(6 + 9) × 2|30',
          '20 − 8 × 2|(20 − 8) × 2|24',
          '5 + 7 × 3|(5 + 7) × 3|36',
          '16 − 4 × 3|(16 − 4) × 3|36',
          '9 + 3 × 5|(9 + 3) × 5|60',
          '24 − 6 × 3|(24 − 6) × 3|54',
          '4 + 6 × 4|(4 + 6) × 4|40',
          '30 − 12 × 2|(30 − 12) × 2|36',
          '2 + 8 × 6|(2 + 8) × 6|60',
          '18 − 3 × 5|(18 − 3) × 5|75',
        ],
      },
      expr: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      bracketed: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      target: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
    },
    answer: (v) => String(v.bracketed),
    format: { kind: 'text' },
    optionCount: 3,
    options: (v) => {
      // The expression is always `number op number op number`, and a bracket can
      // only ever wrap a *complete* operation. `fourOptions` pads a short list by
      // bumping a digit, which here would invent `(25 − 6) × 3` — a different
      // expression from the one in the prompt. So the full set is built by hand.
      const [first, op1, second, op2, third] = String(v.expr).split(' ');
      const right = String(v.bracketed);
      const plain = `${first} ${op1} ${second} ${op2} ${third}`;
      // Wrapping the *whole* expression is not a distractor worth having: it
      // changes nothing, so a student could rule it out without thinking about
      // the order of operations at all. Three real candidates remain — the
      // bracketing the question wants, the other pair, and none at all.
      return [
        right,
        plain,
        `${first} ${op1} (${second} ${op2} ${third})`,
      ];
    },
    explain: ({ vars, answer }) =>
      `სწორია ${answer}: ფრჩხილები ცვლის მოქმედებათა რიგს და შედეგი ${vars.target}-ია.`,
  }),

  // ═════════ U16.2 — რიცხვითი და ასოიანი გამოსახულებები ═════════
  bank({
    id: 'g5-u16-q04',
    subtopicId: 'u16-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'იპოვე გამოსახულების {expr} მნიშვნელობა, თუ {values}.',
    variables: {
      spec: {
        kind: 'choice',
        values: EXPRESSION_ROWS.map(
          (row) => `${row.text}|${row.a ? `${row.letters[0]} = ${row.a}` : ''}${row.a && row.b ? ' და ' : ''}${row.b ? `${row.letters[1] ?? row.letters[0]} = ${row.b}` : ''}`,
        ),
      },
      expr: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      values: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
    },
    answer: (v) => exprValue(String(v.expr), namedValues(String(v.values))),
    format: { kind: 'integer' },
    options: (v) => {
      const right = exprValue(String(v.expr), namedValues(String(v.values)));
      return numericOptions(right, [right + 3, right - 4, right + 10]);
    },
    explain: ({ vars, answer }) =>
      `${vars.values} — ამიტომ ${vars.expr} = ${answer}.`,
  }),
  bank({
    id: 'g5-u16-q05',
    subtopicId: 'u16-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩაწერე გამოსახულების სახით: რიცხვი {letter} გაამრავლე {k}-ზე და მიღებულ შედეგს დაუმატე {m}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'n|5|8', 'x|4|3', 'a|6|7', 'y|3|9', 'b|7|5', 'm|2|11',
          'c|8|4', 'k|9|6', 't|5|12', 'p|4|15', 'd|6|2', 'z|3|14',
        ],
      },
      letter: { kind: 'choice', values: (v) => [cell(v.spec, 0)] },
      k: { kind: 'choice', values: (v) => [cell(v.spec, 1)] },
      m: { kind: 'choice', values: (v) => [cell(v.spec, 2)] },
    },
    answer: (v) => `${v.k}${v.letter} + ${v.m}`,
    format: { kind: 'text' },
    options: (v) => {
      const right = `${v.k}${v.letter} + ${v.m}`;
      return fourOptions(right, [
        `${v.k}${v.letter} − ${v.m}`,
        `${v.k} + ${v.letter} + ${v.m}`,
        `${v.letter}${v.k} + ${v.m}`,
      ]);
    },
    explain: ({ vars, answer }) =>
      `„გაამრავლე ${vars.k}-ზე“ იწერება ${vars.k}${vars.letter}, „დაუმატე ${vars.m}“ კი + ${vars.m}: ${answer}.`,
  }),
  bank({
    id: 'g5-u16-q06',
    subtopicId: 'u16-02',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოსახულების მნიშვნელობაა {value}. რა გახდება მისი მნიშვნელობა, თუ {letter}-ს გაზრდი 2-ით?',
    hint: 'როცა {letter} იზრდება 1-ით, გამოსახულება იზრდება იმ რიცხვით, რომელიც {letter}-ს ამრავლებს.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '3a + 5|4|17', '7b − 6|5|29', '2x + 3|7|17', '5y + 4|3|19',
          '4a + 2|6|26', '6b − 5|4|19', '3x + 8|5|23', '8y + 1|4|33',
          '5a + 10|2|20', '2b + 9|8|25', '7x − 3|6|39', '4y + 6|9|42',
        ],
      },
      k: { kind: 'choice', values: (v) => [String(/^(\d+)/.exec(cell(v.spec, 0))![1])] },
      letter: { kind: 'choice', values: (v) => [String(/[a-z]/.exec(cell(v.spec, 0))![0])] },
      value: { kind: 'choice', values: (v) => [cell(v.spec, 2)] },
    },
    answer: (v) => Number(v.value) + 2 * Number(v.k),
    format: { kind: 'integer' },
    options: (v) => {
      const right = Number(v.value) + 2 * Number(v.k);
      return numericOptions(right, [Number(v.value) + 2, right - 2, Number(v.value)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.letter}-ის 2-ით გაზრდისას ${vars.k}${vars.letter} იზრდება ${vars.k} × 2 = ${2 * Number(vars.k)}-ით, ამიტომ შედეგია ${vars.value} + ${2 * Number(vars.k)} = ${answer}.`,
  }),

  // ═════════ U16.3 — განტოლებების ამოხსნა ═════════
  bank({
    id: 'g5-u16-q07',
    subtopicId: 'u16-03',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ამოხსენი განტოლება: {eq}.',
    variables: {
      spec: { kind: 'choice', values: SOLVE_ROWS.map((row) => equationFor(row).text) },
      eq: { kind: 'choice', values: (v) => [String(v.spec)] },
    },
    answer: (v) => solveEquation(String(v.eq)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = solveEquation(String(v.eq));
      return numericOptions(right, [right + 2, right - 3, right + 10 >= 0 ? right + 10 : right + 5]);
    },
    explain: ({ vars, answer }) => {
      const [left, right] = String(vars.eq).split('=').map((part) => part.trim());
      const letter = /[a-z]/.exec(left!)?.[0] ?? 'x';
      const check = showSubstitution(left!, Number(answer));
      // `showSubstitution` ends in its own total, so it is compared against the
      // printed right side rather than appended to it (`… = 49 = 49` reads as
      // two equations, not one).
      return `${vars.eq} — საპირისპირო მოქმედებით ${letter} = ${answer}. შემოწმება: ${check}${check.endsWith(`= ${right}`) ? '' : ` = ${right}`}.`;
    },
  }),
  bank({
    id: 'g5-u16-q08',
    subtopicId: 'u16-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რომელი რიცხვია განტოლების {eq} ამონახსნი?',
    variables: {
      spec: { kind: 'choice', values: SOLVE_ROWS.map((row) => equationFor(row).text) },
      eq: { kind: 'choice', values: (v) => [String(v.spec)] },
    },
    answer: (v) => solveEquation(String(v.eq)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = solveEquation(String(v.eq));
      return numericOptions(right, [right * 2, right + 4, Math.abs(right - 6)]);
    },
    explain: ({ vars, answer }) => {
      const left = String(vars.eq).split('=')[0]!.trim();
      const substituted = showSubstitution(left, Number(answer));
      return `შევამოწმოთ: ${substituted} — მარჯვენა მხარეც იგივეა, ამიტომ ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u16-q09',
    subtopicId: 'u16-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'განტოლების {eq} ამონახსნია {x}. რამდენია {target}?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'x + 17 = 42|25|2x', 'y − 28 = 35|63|y + 5', '6a = 54|9|2a', 'b ÷ 7 = 8|56|b + 7',
          'x + 23 = 41|18|3x', 'y − 15 = 52|67|y − 7', 'x + 36 = 58|22|2x', 'y − 19 = 74|93|y − 7',
          '12a = 60|5|2a', 'b ÷ 4 = 9|36|b + 7', '5x + 7 = 37|6|3x', '6y + 4 = 52|8|2a',
          'x + 41 = 79|38|2x', 'y − 32 = 45|77|y + 5', '8a = 72|9|2a', 'b ÷ 9 = 7|63|b + 7',
        ],
      },
      eq: { kind: 'choice', values: (v) => [cell(v.spec, 0)] },
      x: { kind: 'choice', values: (v) => [cell(v.spec, 1)] },
      target: { kind: 'choice', values: (v) => [cell(v.spec, 2)] },
    },
    answer: (v) => {
      const x = Number(v.x);
      if (String(v.target) === '2x') return 2 * x;
      if (String(v.target) === 'y + 5') return x + 5;
      if (String(v.target) === '2a') return 2 * x;
      if (String(v.target) === 'b + 7') return x + 7;
      if (String(v.target) === '3x') return 3 * x;
      return x - 7;
    },
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const x = Number(v.x);
      const target = String(v.target);
      const right =
        target === '2x' || target === '2a' ? 2 * x
        : target === 'y + 5' ? x + 5
        : target === 'b + 7' ? x + 7
        : target === '3x' ? 3 * x
        : x - 7;
      return numericOptions(right, [x, right + 3, right - 5]);
    },
    explain: ({ vars, answer }) =>
      `განტოლებიდან ${vars.x} იპოვება, შემდეგ ${vars.target} = ${answer}.`,
  }),
  bank({
    id: 'g5-u16-q10',
    subtopicId: 'u16-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'სამი რიცხვი ისეა არჩეული, რომ პირველია {a}, მეორე პირველზე {d}-ით მეტია, ხოლო სამივეს ჯამი {sum}-ია. რამდენია მესამე რიცხვი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['5|3|24', '7|4|30', '9|2|28', '6|5|26', '8|3|32', '10|4|38', '4|6|22', '12|5|44', '3|7|20', '11|2|35', '15|4|48', '2|9|22'],
      },
      a: { kind: 'choice', values: (v) => [cell(v.spec, 0)] },
      d: { kind: 'choice', values: (v) => [cell(v.spec, 1)] },
      sum: { kind: 'choice', values: (v) => [cell(v.spec, 2)] },
    },
    answer: (v) => Number(v.sum) - Number(v.a) - (Number(v.a) + Number(v.d)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.sum) - Number(v.a) - (Number(v.a) + Number(v.d));
      return numericOptions(right, [Number(v.sum) - Number(v.a), Number(v.a) + Number(v.d), right + Number(v.d)]);
    },
    explain: ({ vars, answer }) =>
      `მეორე რიცხვი ${vars.a} + ${vars.d} = ${Number(vars.a) + Number(vars.d)}; მესამე = ${vars.sum} − ${vars.a} − ${Number(vars.a) + Number(vars.d)} = ${answer}.`,
  }),

  // ═════════ U16.4 — კვადრატი და სრული კვადრატები ═════════
  bank({
    id: 'g5-u16-q11',
    subtopicId: 'u16-04',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {base}².',
    hint: 'რიცხვის კვადრატი — ეს რიცხვი გამრავლებული თავის თავზე.',
    variables: {
      spec: { kind: 'choice', values: SQUARE_ROWS.map(String) },
      base: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.base) ** 2,
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const base = Number(v.base);
      return numericOptions(base ** 2, [base * 2, base ** 2 + base, base ** 2 - base]);
    },
    explain: ({ vars, answer }) =>
      `${vars.base}² = ${vars.base} × ${vars.base} = ${group(Number(answer))}.`,
  }),
  bank({
    id: 'g5-u16-q12',
    subtopicId: 'u16-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რომელი რიცხვის კვადრატია {square}?',
    variables: {
      spec: { kind: 'choice', values: SQUARES.slice(1, 19).map(String) },
      square: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Math.sqrt(Number(v.square)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const root = Math.sqrt(Number(v.square));
      return numericOptions(root, [root + 1, root - 1 > 0 ? root - 1 : root + 2, root * 2]);
    },
    explain: ({ vars, answer }) =>
      `${answer} × ${answer} = ${vars.square}, ამიტომ ${vars.square} არის ${answer}-ის კვადრატი.`,
  }),
  bank({
    id: 'g5-u16-q13',
    subtopicId: 'u16-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'არის თუ არა {n} სრული კვადრატი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['49', '64', '50', '72', '36', '81', '40', '100', '90', '121', '110', '144', '150', '169', '200', '16'],
      },
      n: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => (Number.isInteger(Math.sqrt(Number(v.n))) ? 'კი' : 'არა'),
    format: { kind: 'text' },
    options: () => ['კი', 'არა'],
    optionCount: 2,
    explain: ({ vars, answer }) => {
      const n = Number(vars.n);
      const root = Math.sqrt(n);
      return answer === 'კი'
        ? `კი — ${root} × ${root} = ${n}, ამიტომ ${n} სრული კვადრატია.`
        : `არა — ${Math.floor(root)}² = ${Math.floor(root) ** 2}, ხოლო ${Math.ceil(root)}² = ${Math.ceil(root) ** 2}; ${n} მათ შორისაა და სრული კვადრატი არ არის.`;
    },
  }),
  bank({
    id: 'g5-u16-q14',
    subtopicId: 'u16-04',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'იპოვე უმცირესი სრული კვადრატი, რომელიც {n}-ზე მეტია.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['8', '15', '20', '26', '30', '37', '45', '50', '63', '70', '85', '99', '120', '150'],
      },
      n: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Math.ceil(Math.sqrt(Number(v.n))) ** 2,
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Math.ceil(Math.sqrt(Number(v.n))) ** 2;
      return numericOptions(right, [Math.floor(Math.sqrt(Number(v.n))) ** 2, right + 7, right - 4 > 0 ? right - 4 : right + 9]);
    },
    explain: ({ vars, answer }) => {
      const root = Math.ceil(Math.sqrt(Number(vars.n)));
      return `${root}² = ${answer} და ეს უმცირესი კვადრატია, რომელიც ${vars.n}-ზე მეტია (${root - 1}² = ${(root - 1) ** 2} კი ნაკლებია).`;
    },
  }),

  // ═════════ U16.5 — კუბი და სრული კუბები ═════════
  bank({
    id: 'g5-u16-q15',
    subtopicId: 'u16-05',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {base}³.',
    hint: 'რიცხვის კუბი — ეს რიცხვი სამჯერ გამრავლებული თავის თავზე.',
    variables: {
      spec: { kind: 'choice', values: CUBE_ROWS.map(String) },
      base: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.base) ** 3,
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const base = Number(v.base);
      return numericOptions(base ** 3, [base ** 2, base ** 3 + base, base * 3]);
    },
    explain: ({ vars, answer }) =>
      `${vars.base}³ = ${vars.base} × ${vars.base} × ${vars.base} = ${group(Number(answer))}.`,
  }),
  bank({
    id: 'g5-u16-q16',
    subtopicId: 'u16-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რომელი რიცხვის კუბია {cube}?',
    variables: {
      spec: { kind: 'choice', values: CUBE_ROWS.slice(0, 15).map((n) => String(n ** 3)) },
      cube: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Math.round(Math.cbrt(Number(v.cube))),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const root = Math.round(Math.cbrt(Number(v.cube)));
      return numericOptions(root, [root + 1, root - 1 > 0 ? root - 1 : root + 2, Math.round(Math.sqrt(Number(v.cube)))]);
    },
    explain: ({ vars, answer }) =>
      `${answer} × ${answer} × ${answer} = ${vars.cube}, ამიტომ ${vars.cube} არის ${answer}-ის კუბი.`,
  }),
  bank({
    id: 'g5-u16-q17',
    subtopicId: 'u16-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'არის თუ არა {n} სრული კუბი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['64', '27', '125', '100', '40', '216', '50', '343', '81', '512', '90', '729', '120', '1000', '200', '8'],
      },
      n: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => {
      const root = Math.round(Math.cbrt(Number(v.n)));
      return root ** 3 === Number(v.n) ? 'კი' : 'არა';
    },
    format: { kind: 'text' },
    options: () => ['კი', 'არა'],
    optionCount: 2,
    explain: ({ vars, answer }) => {
      const n = Number(vars.n);
      const root = Math.round(Math.cbrt(n));
      return answer === 'კი'
        ? `კი — ${root} × ${root} × ${root} = ${n}, ამიტომ ${n} სრული კუბია.`
        : `არა — ${root}³ = ${root ** 3}, რაც არ არის ${n}; სრული კუბი ვერ მიიღება.`;
    },
  }),
  bank({
    id: 'g5-u16-q18',
    subtopicId: 'u16-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'იპოვე უმცირესი სრული კუბი, რომელიც {n}-ზე მეტია.',
    variables: {
      spec: { kind: 'choice', values: ['10', '30', '50', '70', '100', '130', '200', '250', '300', '400', '500', '600'] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Math.ceil(Math.cbrt(Number(v.n))) ** 3,
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Math.ceil(Math.cbrt(Number(v.n))) ** 3;
      return numericOptions(right, [Math.floor(Math.cbrt(Number(v.n))) ** 3, right + 30, right - 27 > 0 ? right - 27 : right + 60]);
    },
    explain: ({ vars, answer }) => {
      const root = Math.ceil(Math.cbrt(Number(vars.n)));
      return `${root}³ = ${answer} და ეს უმცირესი კუბია, რომელიც ${vars.n}-ზე მეტია (${root - 1}³ = ${(root - 1) ** 3} კი ნაკლებია).`;
    },
  }),

  // ═════════ U16.6 — ხარისხები ნატურალური მაჩვენებლით ═════════
  bank({
    id: 'g5-u16-q19',
    subtopicId: 'u16-06',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ჩაწერე ნამრავლი ხარისხის სახით: {product}.',
    hint: 'ერთნაირი თანამამრავლების ნამრავლი იწერება ხარისხის სახით: ფუძე და მაჩვენებელი.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '3 × 3 × 3 × 3|3|4', '5 × 5 × 5|5|3', '2 × 2 × 2 × 2 × 2|2|5',
          '7 × 7|7|2', '10 × 10 × 10|10|3', '4 × 4 × 4|4|3',
          '6 × 6 × 6 × 6|6|4', '9 × 9 × 9|9|3', '8 × 8|8|2',
          '2 × 2 × 2|2|3', '10 × 10|10|2', '7 × 7 × 7|7|3',
        ],
      },
      product: { kind: 'choice', values: (v) => [cell(v.spec, 0)] },
      base: { kind: 'choice', values: (v) => [cell(v.spec, 1)] },
      exponent: { kind: 'choice', values: (v) => [cell(v.spec, 2)] },
    },
    answer: (v) => power(Number(v.base), Number(v.exponent)),
    format: { kind: 'text' },
    options: (v) => {
      const base = Number(v.base);
      const exponent = Number(v.exponent);
      const right = power(base, exponent);
      return fourOptions(right, [
        power(base, exponent + 1),
        power(base + 1, exponent),
        power(exponent, base),
      ]);
    },
    explain: ({ vars, answer }) =>
      `${vars.product} — თანამამრავლი ${vars.base} ${vars.exponent}-ჯერ მეორდება, ამიტომ იწერება ${answer}-ის სახით.`,
  }),
  bank({
    id: 'g5-u16-q20',
    subtopicId: 'u16-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {expr}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '2|5', '10|4', '3|4', '2|6', '5|3', '4|3',
          '10|3', '3|5', '2|7', '6|2', '10|2', '11|2',
          '7|2', '12|2', '2|8', '10|5',
        ],
      },
      base: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      exponent: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      expr: { kind: 'choice', values: (v) => [power(at(v.spec, 0), at(v.spec, 1))] },
    },
    answer: (v) => Number(v.base) ** Number(v.exponent),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const base = Number(v.base);
      const exponent = Number(v.exponent);
      const right = base ** exponent;
      return numericOptions(right, [base * exponent, base ** (exponent - 1), right + base]);
    },
    explain: ({ vars, answer }) =>
      `${vars.expr} — ეს არის ${vars.base}-ის ${vars.exponent}-ჯერ გამრავლება თავის თავზე, რაც ${group(Number(answer))}-ს იძლევა.`,
  }),
  bank({
    id: 'g5-u16-q21',
    subtopicId: 'u16-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენჯერ უნდა გავამრავლოთ {base} თავის თავზე, რომ მივიღოთ {expr}?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['7|3', '5|4', '3|5', '2|6', '10|3', '4|4', '6|2', '9|3', '8|2', '2|9', '11|2', '12|2'],
      },
      base: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      exponent: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      expr: { kind: 'choice', values: (v) => [power(at(v.spec, 0), at(v.spec, 1))] },
    },
    answer: (v) => Number(v.exponent),
    format: { kind: 'integer', min: 2 },
    options: (v) => numericOptions(Number(v.exponent), [Number(v.exponent) + 1, Number(v.exponent) - 1, Number(v.exponent) * 2]),
    explain: ({ vars, answer }) =>
      `მაჩვენებელი გვიჩვენებს, რამდენჯერ მეორდება ფუძე: ${vars.expr} — ${answer} თანამამრავლი.`,
  }),
  bank({
    id: 'g5-u16-q22',
    subtopicId: 'u16-06',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'შეადარე რიცხვები და ჩასვი შესაბამისი ნიშანი: {leftShown} ☐ {rightShown}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '3^3|25', '2^5|30', '4^2|15', '2^4|4^2', '3^2|2^3', '5^2|2^6',
          '10^2|99', '2^6|64', '4^3|60', '3^4|80', '6^2|35', '2^7|128',
          '5^3|100', '8^2|65', '3^5|250', '10^3|1000',
        ],
      },
      left: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      right: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      leftShown: { kind: 'choice', values: (v) => [formatPowerToken(String(v.spec).split('|')[0]!)] },
      // The right-hand side may itself be a power (`2^6`); it is shown the
      // same way, so neither side of the comparison leaks a caret.
      rightShown: { kind: 'choice', values: (v) => [formatPowerToken(String(v.spec).split('|')[1]!)] },
    },
    answer: (v) => relation(powerValue(String(v.left)), Number(v.right)),
    format: { kind: 'text' },
    options: () => ['<', '>', '='],
    optionCount: 3,
    explain: ({ vars, answer }) => {
      const leftValue = powerValue(String(vars.left));
      const rightValue = Number(vars.right);
      const sign =
        answer === '=' ? 'ტოლია' : answer === '>' ? 'მეტია' : 'ნაკლებია';
      return `${vars.leftShown} = ${group(leftValue)}, ხოლო მეორე მხარე ${vars.rightShown} = ${group(rightValue)}. ${group(leftValue)} ${sign} ${group(rightValue)}-ზე, ამიტომ ნიშანია „${answer}“.`;
    },
  }),
];

/**
 * Evaluates one of `ORDER_ROWS`' printed expressions.
 *
 * The printed form is `+ − × ÷` with optional brackets, which is not JavaScript,
 * so it cannot be handed to `eval`. Parsing it properly means the answer is
 * derived from exactly the string the student reads — a typo in the table shows
 * up as a wrong answer instead of a stale constant.
 */
function evaluate(expression: string): number {
  const tokens = expression.match(/\d+|[+\-×÷()]/g) ?? [];
  let index = 0;

  const peek = (): string | undefined => tokens[index];
  const take = (): string => tokens[index++]!;

  // expression := term (('+'|'−') term)*
  const parseExpression = (): number => {
    let value = parseTerm();
    while (peek() === '+' || peek() === '−' || peek() === '-') {
      const operator = take();
      const right = parseTerm();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  };

  // term := factor (('×'|'÷') factor)*
  const parseTerm = (): number => {
    let value = parseFactor();
    while (peek() === '×' || peek() === '÷') {
      const operator = take();
      const right = parseFactor();
      value = operator === '×' ? value * right : value / right;
    }
    return value;
  };

  // factor := number | '(' expression ')'
  const parseFactor = (): number => {
    if (peek() === '(') {
      take();
      const value = parseExpression();
      take(); // ')'
      return value;
    }
    return Number(take());
  };

  return parseExpression();
}

/**
 * The value of an expression written the way `EXPRESSION_ROWS` writes it:
 * `<k><letter>` terms joined by `+` or `−`.
 *
 * The letter values are passed in the order the prompt names them, which is what
 * lets the answer be recomputed from the rendered wording.
 */
function exprValue(expression: string, values: number[]): number {
  const terms = expression.split(/\s*([+−-])\s*/);
  let total = 0;
  let sign = 1;
  let used = 0;
  for (const term of terms) {
    if (term === '+') {
      sign = 1;
      continue;
    }
    if (term === '−' || term === '-') {
      sign = -1;
      continue;
    }
    if (term.trim() === '') continue;
    // A term is a coefficient followed by a letter (`3a`, `2x`) or a bare
    // constant (`5`). The letter has to be tested first: stripping the digits
    // and asking whether anything is left reads `3a` as a constant and `5` as a
    // variable, which is exactly backwards.
    const variable = /^(\d+)\s*([a-z])$/.exec(term.trim());
    if (variable) {
      total += sign * Number(variable[1]) * (values[used] ?? 0);
      used += 1;
    } else {
      total += sign * Number(term.trim());
    }
  }
  return total;
}

/**
 * Works out the left-hand side with the letter replaced by `value`.
 *
 * Textual substitution is wrong here, and quietly so: replacing the `x` in
 * `4x + 9` gives `410 + 9`, whose digits then re-split as forty-one and nine.
 * The term has to be parsed *before* the value goes in — `4x` is four times the
 * value, not the number forty-something.
 */
function substitute(left: string, value: number): number {
  const compact = left.replace(/\s+/g, '');
  const termValue = (term: string): number => {
    const match = /^(\d*)([a-z])$/.exec(term);
    if (!match) return Number(term);
    return (match[1] === '' ? 1 : Number(match[1])) * value;
  };
  const binary = /^(\d*[a-z])([+−×÷])(\d+)$/.exec(compact);
  if (binary) {
    const a = termValue(binary[1]!);
    const b = Number(binary[3]);
    switch (binary[2]) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      default: return a / b;
    }
  }
  return termValue(compact);
}

/** The substituted sum as a reader sees it: `4 × 10 + 9 = 49`. */
function showSubstitution(left: string, value: number): string {
  const compact = left.replace(/\s+/g, '');
  const pretty = compact
    .replace(/(\d*)([a-z])/g, (_whole, coefficient: string, letter: string) =>
      `${coefficient === '' ? '' : `${coefficient} × `}${value}${letter === '' ? '' : ''}`,
    )
    .replace(/\s*([+−×÷])\s*/g, ' $1 ');
  return `${pretty} = ${substitute(left, value)}`;
}

/** Solves one of the bank's equations, from its printed form. */
function solveEquation(equation: string): number {
  const [left, right] = equation.split('=').map((part) => part.trim());
  const target = Number(right);

  if (/^[a-z]\s*\+\s*\d+$/.test(left!)) return target - Number(left!.replace(/[^0-9]/g, ''));
  if (/^[a-z]\s*−\s*\d+$/.test(left!)) return target + Number(left!.replace(/[^0-9]/g, ''));
  if (/^\d+\s*[a-z]$/.test(left!)) return target / Number(left!.replace(/[^0-9]/g, ''));
  if (/^[a-z]\s*÷\s*\d+$/.test(left!)) return target * Number(left!.replace(/[^0-9]/g, ''));
  // kx + m = total
  const linear = left!.match(/^(\d+)\s*[a-z]\s*\+\s*(\d+)$/);
  if (linear) return (target - Number(linear[2])) / Number(linear[1]);
  throw new Error(`unrecognised equation: ${equation}`);
}

/**
 * The numbers in a printed list of values — `x = 6 და y = 4` → `[6, 4]`.
 *
 * Read from the rendered wording rather than from the row, so the answer is
 * computed from exactly the numbers the student sees.
 */
function namedValues(text: string): number[] {
  return [...text.matchAll(/=\s*(-?\d+(?:[.,]\d+)?)/g)].map((match) =>
    Number(match[1]!.replace(',', '.')),
  );
}

/** `3^3` → 27. */
function powerValue(token: string): number {
  const [base, exponent] = token.split('^').map(Number);
  return base! ** exponent!;
}

/** `3^3` → `3³`; a plain number (`64`) is returned unchanged. */
function formatPowerToken(token: string): string {
  const parts = token.split('^');
  if (parts.length !== 2) return token;
  return power(Number(parts[0]), Number(parts[1]));
}
