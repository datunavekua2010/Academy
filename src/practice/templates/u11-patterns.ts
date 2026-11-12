/**
 * U11 — კანონზომიერებები და მიმდევრობები (grade 1).
 *
 * Forty-nine templates covering the fifty reference questions. Two rules run
 * through the whole file:
 *
 *  - **The picture and the answer come from the same values.** A pattern is
 *    always printed by `runOf(cycle, n)` and its answer is always
 *    `elementAt(cycle, p)`; a growing sequence is always printed by
 *    `sequence(first, step, n)` and answered by `term(first, step, p)`. There is
 *    no second copy of the pattern that could drift.
 *  - **Nothing is stored that can be computed.** Variables hold the cycle, the
 *    first term, the step and the position — the answer is derived every time.
 */

import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

const grade = 1 as const;
const topicId = 'kanonzomiereba';
const unitId = 'kanonzomiereba';

/** The curriculum address every template in this unit shares. */
const address = (spec: { id: string; subtopicId: string; difficulty: 1 | 2 | 3 }) => ({
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

/**
 * The shapes and colours a cycle may be built from.
 *
 * A cycle draws *distinct* elements from here — two of the same symbol in one
 * cycle would make „what comes next“ ambiguous, and the whole point of the unit
 * is that the next element is determined.
 */
const PALETTE = ['🔴', '🔵', '🟢', '🟡', '🟠', '🟣', '⭐', '❤️', '🔺', '⚪', '🌙', '🍎'];

/** A row of symbols separated by spaces — how a pattern is printed. */
const row = (items: Array<string | number>): string => items.join(' ');

/**
 * The element at 1-based position `position` of a cycle.
 *
 * Rule 5 of the specification: store the cycle and the position, and *compute*
 * the element — never store the answer. A cycle of length `L` repeats every `L`,
 * so position `p` holds element `((p − 1) mod L) + 1`.
 */
const elementAt = (cycle: string[], position: number): string => cycle[(position - 1) % cycle.length]!;

/**
 * The first `length` elements a cycle produces.
 *
 * This is the only way a repeating pattern is ever drawn, so the picture and the
 * answer cannot disagree: both come from the same cycle and the same indices.
 */
const runOf = (cycle: string[], length: number): string[] =>
  Array.from({ length }, (_, index) => elementAt(cycle, index + 1));

/** A run with one position blanked out, for „fill the gap“ questions. */
const blankAt = (items: string[], position: number): string =>
  row(items.map((item, index) => (index === position - 1 ? '__' : item)));

/** A run with several positions blanked out. */
const blankMany = (items: string[], positions: number[]): string =>
  row(items.map((item, index) => (positions.includes(index + 1) ? '__' : item)));

/**
 * The distinct symbols a cycle is built from, in first-appearance order.
 *
 * „🟢 🟢 🟡“ is built from two symbols, not three: the answer to „which colour
 * completes it“ is one of two, and offering the same colour twice would be a
 * duplicate option.
 */
const distinct = (cycle: string[]): string[] => [...new Set(cycle)];

/** The separator used to keep a whole cycle inside one choice value. */
const CYCLE_SEP = '|';

/** Reads a stored cycle back into its elements. */
const cycleOf = (vars: Vars): string[] => String(vars.cycle).split(CYCLE_SEP);

/** Packs elements into the single string a choice variable can hold. */
const pack = (items: string[]): string => items.join(CYCLE_SEP);

/**
 * Wrong answers for „which element comes next“.
 *
 * The plausible wrong answers are the other symbols *of this pattern* — a child
 * who has not counted the cycle yet picks one of those. Only when the cycle has
 * too few distinct symbols to fill the options do we reach into the palette, and
 * then the extra symbols are real ones that simply are not in the pattern.
 */
const otherSymbols = (cycle: string[], fallbackFrom: string[] = PALETTE): string[] => {
  const own = distinct(cycle);
  const spare = fallbackFrom.filter((symbol) => !own.includes(symbol));
  return [...own.slice(1), ...spare];
};

/** Options for a symbol answer: three, with exactly one of them right. */
const symbolOptions = (cycle: string[], answer: string): string[] => {
  const pool = [...distinct(cycle), ...otherSymbols(cycle)];
  const out: string[] = [answer];
  for (const symbol of pool) {
    if (out.length === 3) break;
    if (!out.includes(symbol)) out.push(symbol);
  }
  return out;
};

/** The three options for a symbol question, minus the correct one. */
const symbolDistractors = (cycle: string[], answer: string): string[] =>
  symbolOptions(cycle, answer).filter((symbol) => symbol !== answer);

/* ================================================================== *\
 * Growing sequences
 * ================================================================== */

/**
 * An arithmetic sequence: `first`, `first + d`, `first + 2d`, …
 *
 * Rule 6: the n-th term is `a₁ + (n − 1)d`. Every growing-pattern answer in this
 * unit is computed from the first term, the step and the position — never
 * carried along as a running total, so a question about the sixth figure cannot
 * drift from the sequence it prints.
 */
const sequence = (first: number, step: number, length: number): number[] =>
  Array.from({ length }, (_, index) => first + index * step);

/** The n-th term (1-based) of an arithmetic sequence. */
const term = (first: number, step: number, position: number): number => first + (position - 1) * step;

/**
 * Wrong answers for a computed term in a sequence.
 *
 * The mistakes are the ones a child actually makes here: using `n` instead of
 * `n − 1` steps (the classic off-by-one), one step out either way, and repeating
 * the last printed term. A distractor at random would not test the rule at all.
 */
const sequenceSlips = (first: number, step: number, position: number): number[] => {
  const right = term(first, step, position);
  const candidates = [
    first + position * step, // one step too many: the off-by-one
    right - step, // one step too few
    right + step,
    term(first, step, position - 1), // the term already printed
  ];
  const seen = new Set<number>([right]);
  const out: number[] = [];
  for (const candidate of candidates) {
    if (candidate < 0 || candidate > 100 || seen.has(candidate)) continue;
    seen.add(candidate);
    out.push(candidate);
  }
  return out;
};

/* ================================================================== *\
 * Reading a rule out loud
 * ================================================================== */

const ruleText = (step: number): string => `ყოველ ჯერზე ${step} ემატება`;
const dropText = (step: number): string => `ყოველ ჯერზე ${step} აკლდება`;

/**
 * Three rules a sequence does not follow.
 *
 * The near miss is deliberately the *other direction* — the mistake a child
 * makes when they read „4, 7, 10“ as subtracting — then a wrong step in the
 * right direction, then a much larger step.
 */
const wrongRules = (step: number): string[] => [dropText(step), ruleText(step + 1), ruleText(step * 2)];

/* ================================================================== *\
 * U11.1 — განმეორებადი კანონზომიერებები (Q1–Q10)
 * ================================================================== */

const u111: QuestionTemplate[] = [
  /** Level 1 — read the cycle, continue it (Q1, Q3). */
  defineTemplate({
    ...address({ id: 'g1-u11-1-alternate', subtopicId: 'gameorebadi', difficulty: 1 }),
    prompt: 'გააგრძელე ნიმუში: {seq}',
    variables: {
      a: { kind: 'choice', values: PALETTE },
      b: { kind: 'choice', values: PALETTE },
      cycle: { kind: 'choice', values: (v: Vars) => [pack([String(v.a), String(v.b)])] },
      seq: { kind: 'choice', values: (v: Vars) => [`${row(runOf(cycleOf(v), 5))} __`] },
    },
    constraints: [{ note: 'the two symbols differ', test: (v: Vars) => String(v.a) !== String(v.b) }],
    answer: (v: Vars) => elementAt(cycleOf(v), 6),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => symbolDistractors(cycleOf(vars), String(answer)),
    explanation: ({ vars, answer }) => `${vars.seq}: ${vars.a} და ${vars.b} მონაცვლეობს, ამიტომ შემდეგია ${answer}.`,
  }),

  /** Level 1 — two of one symbol, then another (Q2, Q6). */
  defineTemplate({
    ...address({ id: 'g1-u11-1-double-then-one', subtopicId: 'gameorebadi', difficulty: 1 }),
    prompt: 'გააგრძელე ნიმუში: {seq}',
    variables: {
      a: { kind: 'choice', values: PALETTE },
      b: { kind: 'choice', values: PALETTE },
      cycle: { kind: 'choice', values: (v: Vars) => [pack([String(v.a), String(v.a), String(v.b)])] },
      seq: { kind: 'choice', values: (v: Vars) => [`${row(runOf(cycleOf(v), 7))} __`] },
    },
    constraints: [{ note: 'the two symbols differ', test: (v: Vars) => String(v.a) !== String(v.b) }],
    answer: (v: Vars) => elementAt(cycleOf(v), 8),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => symbolDistractors(cycleOf(vars), String(answer)),
    explanation: ({ vars, answer }) => `ციკლია „${vars.a} ${vars.a} ${vars.b}“, ამიტომ მერვე ადგილზე ${answer}.`,
  }),

  /** Level 1 — a gap in the middle of a repetition (Q4). */
  defineTemplate({
    ...address({ id: 'g1-u11-1-fill-middle', subtopicId: 'gameorebadi', difficulty: 1 }),
    prompt: 'რა სიმბოლო აკლია? {seq}',
    variables: {
      a: { kind: 'choice', values: PALETTE },
      b: { kind: 'choice', values: PALETTE },
      c: { kind: 'choice', values: PALETTE },
      cycle: { kind: 'choice', values: (v: Vars) => [pack([String(v.a), String(v.b), String(v.c)])] },
      seq: { kind: 'choice', values: (v: Vars) => [blankAt(runOf(cycleOf(v), 9), 5)] },
    },
    constraints: [
      { note: 'all three symbols differ', test: (v: Vars) => new Set([String(v.a), String(v.b), String(v.c)]).size === 3 },
    ],
    answer: (v: Vars) => elementAt(cycleOf(v), 5),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => symbolDistractors(cycleOf(vars), String(answer)),
    explanation: ({ answer }) => `სამი სიმბოლო მეორდება: მეხუთე ადგილზე ${answer}.`,
  }),

  /** Level 2 — which row continues the pattern, and which three are spoiled (Q5). */
  defineTemplate({
    ...address({ id: 'g1-u11-1-which-repeats', subtopicId: 'gameorebadi', difficulty: 2 }),
    prompt: 'ნიმუში: {seq} რომელი რიგი აგრძელებს ნიმუშს სწორად?',
    variables: {
      a: { kind: 'choice', values: PALETTE },
      b: { kind: 'choice', values: PALETTE },
      cycle: { kind: 'choice', values: (v: Vars) => [pack([String(v.a), String(v.b)])] },
      spoiler: { kind: 'choice', values: PALETTE },
      seq: { kind: 'choice', values: (v: Vars) => [row(runOf(cycleOf(v), 5))] },
      damage: { kind: 'int', min: 2, max: 5 },
    },
    constraints: [
      { note: 'the two cycle symbols differ', test: (v: Vars) => String(v.a) !== String(v.b) },
      { note: 'the spoiler is a third symbol', test: (v: Vars) => ![String(v.a), String(v.b)].includes(String(v.spoiler)) },
    ],
    answer: (v: Vars) => row(runOf(cycleOf(v), 6)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      // Two rows spoiled at different places — each one a mistake a child makes
      // when they lose the cycle halfway — so exactly one option continues it.
      const items = runOf(cycleOf(vars), 6);
      const make = (position: number): string => {
        const copy = [...items];
        copy[position - 1] = String(vars.spoiler);
        return row(copy);
      };
      const first = Number(vars.damage);
      const second = ((first + 2) % 6) + 1;
      return [make(first), make(second === first ? ((first + 1) % 6) + 1 : second)].filter((option) => option !== String(answer));
    },
    explanation: ({ vars, answer }) => `${vars.seq}: ორი სიმბოლო მონაცვლეობს, ამიტომ გაგრძელებაა ${answer}.`,
  }),

  /** Level 2 — two blanks in one short cycle (Q7, recast from a drag-and-drop). */
  defineTemplate({
    ...address({ id: 'g1-u11-1-two-blanks', subtopicId: 'gameorebadi', difficulty: 2 }),
    prompt: 'ორი სიმბოლო აკლია: {seq} აირჩიე ისინი თანმიმდევრობით.',
    variables: {
      a: { kind: 'choice', values: PALETTE },
      b: { kind: 'choice', values: PALETTE },
      cycle: { kind: 'choice', values: (v: Vars) => [pack([String(v.a), String(v.b)])] },
      seq: { kind: 'choice', values: (v: Vars) => [blankMany(runOf(cycleOf(v), 6), [3, 4])] },
    },
    constraints: [{ note: 'the two symbols differ', test: (v: Vars) => String(v.a) !== String(v.b) }],
    answer: (v: Vars) => `${elementAt(cycleOf(v), 3)}, ${elementAt(cycleOf(v), 4)}`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const cycle = cycleOf(vars);
      const [a, b] = [cycle[0]!, cycle[1]!];
      return [`${b}, ${a}`, `${a}, ${a}`, `${b}, ${b}`].filter((option) => option !== String(answer));
    },
    explanation: ({ answer }) => `მეორე ციკლის ის ადგილები იკავებს ${answer}.`,
  }),

  /** Level 2 — a three-symbol cycle (Q10). */
  defineTemplate({
    ...address({ id: 'g1-u11-1-three-cycle', subtopicId: 'gameorebadi', difficulty: 2 }),
    prompt: 'გააგრძელე ნიმუში: {seq}',
    variables: {
      a: { kind: 'choice', values: PALETTE },
      b: { kind: 'choice', values: PALETTE },
      c: { kind: 'choice', values: PALETTE },
      cycle: { kind: 'choice', values: (v: Vars) => [pack([String(v.a), String(v.b), String(v.c)])] },
      seq: { kind: 'choice', values: (v: Vars) => [`${row(runOf(cycleOf(v), 7))} __`] },
    },
    constraints: [
      { note: 'all three symbols differ', test: (v: Vars) => new Set([String(v.a), String(v.b), String(v.c)]).size === 3 },
    ],
    answer: (v: Vars) => elementAt(cycleOf(v), 8),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => symbolDistractors(cycleOf(vars), String(answer)),
    explanation: ({ answer }) => `სამი სიმბოლოს ციკლი: მერვე ადგილზე ${answer}.`,
  }),

  /** Level 2 — the third element of a two-symbol cycle (Q8). */
  defineTemplate({
    ...address({ id: 'g1-u11-1-position-three', subtopicId: 'gameorebadi', difficulty: 2 }),
    prompt: 'ნიმუში: {seq} რომელი სიმბოლოა მესამე ადგილზე?',
    variables: {
      a: { kind: 'choice', values: PALETTE },
      b: { kind: 'choice', values: PALETTE },
      cycle: { kind: 'choice', values: (v: Vars) => [pack([String(v.a), String(v.b)])] },
      seq: { kind: 'choice', values: (v: Vars) => [row(runOf(cycleOf(v), 6))] },
    },
    constraints: [{ note: 'the two symbols differ', test: (v: Vars) => String(v.a) !== String(v.b) }],
    answer: (v: Vars) => elementAt(cycleOf(v), 3),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => symbolDistractors(cycleOf(vars), String(answer)),
    explanation: ({ answer }) => `მეორე ციკლის პირველი ელემენტია ${answer}.`,
  }),

  /** Level 2 — the fourth element of a three-symbol cycle (Q9). */
  defineTemplate({
    ...address({ id: 'g1-u11-1-position-four', subtopicId: 'gameorebadi', difficulty: 2 }),
    prompt: 'ნიმუში: {seq} რომელი სიმბოლოა მეოთხე ადგილზე?',
    variables: {
      a: { kind: 'choice', values: PALETTE },
      b: { kind: 'choice', values: PALETTE },
      c: { kind: 'choice', values: PALETTE },
      cycle: { kind: 'choice', values: (v: Vars) => [pack([String(v.a), String(v.b), String(v.c)])] },
      seq: { kind: 'choice', values: (v: Vars) => [row(runOf(cycleOf(v), 8))] },
    },
    constraints: [
      { note: 'all three symbols differ', test: (v: Vars) => new Set([String(v.a), String(v.b), String(v.c)]).size === 3 },
    ],
    answer: (v: Vars) => elementAt(cycleOf(v), 4),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => symbolDistractors(cycleOf(vars), String(answer)),
    explanation: ({ answer }) => `ციკლი მეორდება: მეოთხე ადგილზე ${answer}.`,
  }),

  /** Level 3 — a position far down a four-symbol cycle (Q48-style). */
  defineTemplate({
    ...address({ id: 'g1-u11-1-position-deep', subtopicId: 'gameorebadi', difficulty: 3 }),
    prompt: 'ნიმუში: {seq} რომელი სიმბოლო იქნება {position}-ე ადგილზე?',
    variables: {
      a: { kind: 'choice', values: PALETTE },
      b: { kind: 'choice', values: PALETTE },
      c: { kind: 'choice', values: PALETTE },
      d: { kind: 'choice', values: PALETTE },
      position: { kind: 'int', min: 9, max: 30 },
      cycle: { kind: 'choice', values: (v: Vars) => [pack([String(v.a), String(v.b), String(v.c), String(v.d)])] },
      seq: { kind: 'choice', values: (v: Vars) => [row(runOf(cycleOf(v), 12))] },
    },
    constraints: [
      {
        note: 'all four symbols are different',
        test: (v: Vars) => new Set([String(v.a), String(v.b), String(v.c), String(v.d)]).size === 4,
      },
      {
        note: 'the position is not a wrapped first element, so counting is required',
        test: (v: Vars) => (Number(v.position) - 1) % 4 !== 0,
      },
    ],
    answer: (v: Vars) => elementAt(cycleOf(v), Number(v.position)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => symbolDistractors(cycleOf(vars), String(answer)),
    explanation: ({ vars, answer }) => `ოთხი სიმბოლოს ციკლი: ${vars.position}-ე ადგილზე ${answer}.`,
  }),
];

/* ================================================================== *\
 * U11.2 — მზარდი კანონზომიერებები (Q11–Q20)
 * ================================================================== */

const u112: QuestionTemplate[] = [
  /** Level 1 — a step of one (Q11, Q42). */
  defineTemplate({
    ...address({ id: 'g1-u11-2-step-one', subtopicId: 'mzardi', difficulty: 1 }),
    prompt: 'გააგრძელე მიმდევრობა: {seq}',
    variables: {
      first: { kind: 'int', min: 1, max: 15 },
      length: { kind: 'int', min: 4, max: 5 },
      seq: { kind: 'choice', values: (v: Vars) => [`${sequence(Number(v.first), 1, Number(v.length)).join(', ')}, __`] },
    },
    constraints: [
      { note: 'the run stays inside one hundred', test: (v: Vars) => term(Number(v.first), 1, Number(v.length) + 1) <= 99 },
    ],
    answer: (v: Vars) => term(Number(v.first), 1, Number(v.length) + 1),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars }) => sequenceSlips(Number(vars.first), 1, Number(vars.length) + 1).map(String),
    explanation: ({ answer }) => `ყოველ ჯერზე 1 ემატება, ამიტომ შემდეგია ${answer}.`,
  }),

  /** Level 1 — a step of two (Q12). */
  defineTemplate({
    ...address({ id: 'g1-u11-2-step-two', subtopicId: 'mzardi', difficulty: 1 }),
    prompt: 'გააგრძელე მიმდევრობა: {seq}',
    variables: {
      first: { kind: 'int', min: 1, max: 12 },
      length: { kind: 'int', min: 4, max: 5 },
      seq: { kind: 'choice', values: (v: Vars) => [`${sequence(Number(v.first), 2, Number(v.length)).join(', ')}, __`] },
    },
    constraints: [
      { note: 'the run stays inside one hundred', test: (v: Vars) => term(Number(v.first), 2, Number(v.length) + 1) <= 99 },
    ],
    answer: (v: Vars) => term(Number(v.first), 2, Number(v.length) + 1),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars }) => sequenceSlips(Number(vars.first), 2, Number(vars.length) + 1).map(String),
    explanation: ({ vars, answer }) => `ნაბიჯია 2: ${term(Number(vars.first), 2, Number(vars.length))} + 2 = ${answer}.`,
  }),

  /** Level 1 — pictures growing by one (Q13). */
  defineTemplate({
    ...address({ id: 'g1-u11-2-picture-grow', subtopicId: 'mzardi', difficulty: 1 }),
    prompt: 'ნახატების რაოდენობა ყოველ ჯერზე ერთით იზრდება: {seq} რამდენი {item} იქნება შემდეგ ნახატზე?',
    variables: {
      item: { kind: 'choice', values: ['🍎', '⭐', '🔵', '🍪'] },
      first: { kind: 'int', min: 1, max: 3 },
      length: { kind: 'int', min: 3, max: 4 },
      seq: {
        kind: 'choice',
        values: (v: Vars) => [
          sequence(Number(v.first), 1, Number(v.length))
            .map((n) => String(v.item).repeat(Math.min(n, 8)))
            .join(' , '),
        ],
      },
    },
    constraints: [{ note: 'the last picture is still readable', test: (v: Vars) => term(Number(v.first), 1, Number(v.length)) <= 6 }],
    answer: (v: Vars) => term(Number(v.first), 1, Number(v.length) + 1),
    format: { kind: 'integer', min: 1, max: 9, entry: true },
    distractors: ({ vars }) => sequenceSlips(Number(vars.first), 1, Number(vars.length) + 1).map(String),
    explanation: ({ vars, answer }) => `ყოველ ნახატზე ერთით მეტი, ამიტომ შემდეგზე ${answer} ${vars.item}.`,
  }),

  /** Level 1 — a step of five (Q14). */
  defineTemplate({
    ...address({ id: 'g1-u11-2-step-five', subtopicId: 'mzardi', difficulty: 1 }),
    prompt: 'გააგრძელე მიმდევრობა: {seq}',
    variables: {
      first: { kind: 'choice', values: [5, 10, 15] },
      length: { kind: 'int', min: 3, max: 4 },
      seq: { kind: 'choice', values: (v: Vars) => [`${sequence(Number(v.first), 5, Number(v.length)).join(', ')}, __`] },
    },
    constraints: [
      { note: 'the next term stays inside one hundred', test: (v: Vars) => term(Number(v.first), 5, Number(v.length) + 1) <= 100 },
    ],
    answer: (v: Vars) => term(Number(v.first), 5, Number(v.length) + 1),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars }) => sequenceSlips(Number(vars.first), 5, Number(vars.length) + 1).map(String),
    explanation: ({ answer }) => `ნაბიჯია 5, ამიტომ შემდეგია ${answer}.`,
  }),

  /** Level 2 — a step of three (Q15, Q38). */
  defineTemplate({
    ...address({ id: 'g1-u11-2-step-three', subtopicId: 'mzardi', difficulty: 2 }),
    prompt: 'გააგრძელე მიმდევრობა: {seq}',
    variables: {
      first: { kind: 'int', min: 1, max: 15 },
      length: { kind: 'int', min: 4, max: 5 },
      seq: { kind: 'choice', values: (v: Vars) => [`${sequence(Number(v.first), 3, Number(v.length)).join(', ')}, __`] },
    },
    constraints: [
      { note: 'the next term stays inside one hundred', test: (v: Vars) => term(Number(v.first), 3, Number(v.length) + 1) <= 100 },
    ],
    answer: (v: Vars) => term(Number(v.first), 3, Number(v.length) + 1),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars }) => sequenceSlips(Number(vars.first), 3, Number(vars.length) + 1).map(String),
    explanation: ({ answer }) => `ნაბიჯია 3, ამიტომ შემდეგია ${answer}.`,
  }),

  /** Level 2 — circles growing by two, fourth figure (Q16). */
  defineTemplate({
    ...address({ id: 'g1-u11-2-circles-fourth', subtopicId: 'mzardi', difficulty: 2 }),
    prompt: 'პირველი ფიგურა შეიცავს {first} წრეს, ყოველი შემდეგი — წინაზე 2-ით მეტს. რამდენი წრე ექნება მეოთხე ფიგურას?',
    variables: {
      first: { kind: 'int', min: 1, max: 5 },
      values: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), 2, 4).join(', ')] },
    },
    constraints: [{ note: 'the fourth figure stays inside one hundred', test: (v: Vars) => term(Number(v.first), 2, 4) <= 99 }],
    answer: (v: Vars) => term(Number(v.first), 2, 4),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars }) => sequenceSlips(Number(vars.first), 2, 4).map(String),
    explanation: ({ vars, answer }) => `ფიგურები: ${vars.values}, ამიტომ მეოთხეა ${answer}.`,
    visual: (v: Vars) => sequence(Number(v.first), 2, 3).map((n) => '⚪'.repeat(n)).join('  '),
  }),

  /** Level 2 — the next two terms (Q17, Q34, Q46). */
  defineTemplate({
    ...address({ id: 'g1-u11-2-next-two', subtopicId: 'mzardi', difficulty: 2 }),
    prompt: 'გააგრძელე მიმდევრობა: {seq} აირჩიე ორი შემდეგი რიცხვი, თანმიმდევრობით.',
    variables: {
      first: { kind: 'int', min: 1, max: 20 },
      step: { kind: 'choice', values: [2, 4, 5, 10] },
      length: { kind: 'int', min: 3, max: 4 },
      seq: {
        kind: 'choice',
        values: (v: Vars) => [`${sequence(Number(v.first), Number(v.step), Number(v.length)).join(', ')}, __, __`],
      },
    },
    constraints: [
      { note: 'the run stays inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.step), Number(v.length) + 2) <= 100 },
    ],
    answer: (v: Vars) =>
      `${term(Number(v.first), Number(v.step), Number(v.length) + 1)}, ${term(Number(v.first), Number(v.step), Number(v.length) + 2)}`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const first = Number(vars.first);
      const step = Number(vars.step);
      const at = Number(vars.length);
      // Two mistakes, both real: running a step past the answer, and starting
      // from the last printed number instead of continuing after it.
      // Applying the step twice to the first new term, and a step that is one
      // too small — both read like real work, neither is copyable from the run.
      return [
        `${term(first, step, at + 1) + step}, ${term(first, step, at + 2) + step}`,
        `${term(first, step, at + 1) + 1}, ${term(first, step, at + 2) + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `ნაბიჯია ${vars.step}, ამიტომ შემდეგი ორია ${answer}.`,
  }),

  /** Level 2 — a tower that grows by a fixed number of cubes (Q18). */
  defineTemplate({
    ...address({ id: 'g1-u11-2-tower', subtopicId: 'mzardi', difficulty: 2 }),
    prompt: 'კოშკის ყოველ ახალ საფეხურზე {step} კუბი ემატება. პირველ საფეხურზე {first} კუბია. რამდენი კუბი იქნება მეოთხე საფეხურზე?',
    variables: {
      first: { kind: 'int', min: 1, max: 5 },
      step: { kind: 'int', min: 1, max: 4 },
      values: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), Number(v.step), 4).join(', ')] },
    },
    constraints: [{ note: 'the fourth step stays inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.step), 4) <= 99 }],
    answer: (v: Vars) => term(Number(v.first), Number(v.step), 4),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars }) => sequenceSlips(Number(vars.first), Number(vars.step), 4).map(String),
    explanation: ({ vars, answer }) => `საფეხურები: ${vars.values}, ამიტომ მეოთხეა ${answer}.`,
  }),

  /** Level 3 — a step of four, two blanks (Q19). */
  defineTemplate({
    ...address({ id: 'g1-u11-2-step-four-two', subtopicId: 'mzardi', difficulty: 3 }),
    prompt: 'გააგრძელე მიმდევრობა: {seq} აირჩიე ორი შემდეგი რიცხვი, თანმიმდევრობით.',
    variables: {
      first: { kind: 'choice', values: [2, 4, 6, 8, 10] },
      length: { kind: 'int', min: 3, max: 4 },
      seq: { kind: 'choice', values: (v: Vars) => [`${sequence(Number(v.first), 4, Number(v.length)).join(', ')}, __, __`] },
    },
    constraints: [
      { note: 'the run stays inside one hundred', test: (v: Vars) => term(Number(v.first), 4, Number(v.length) + 2) <= 100 },
    ],
    answer: (v: Vars) => `${term(Number(v.first), 4, Number(v.length) + 1)}, ${term(Number(v.first), 4, Number(v.length) + 2)}`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const first = Number(vars.first);
      const at = Number(vars.length);
      return [
        `${term(first, 4, at + 1) + 4}, ${term(first, 4, at + 2) + 4}`,
        `${term(first, 4, at + 1) + 1}, ${term(first, 4, at + 2) + 1}`,
      ];
    },
    explanation: ({ answer }) => `ნაბიჯია 4, ამიტომ ${answer}.`,
  }),

  /** Level 3 — a growth of a given step, fifth figure (Q20). */
  defineTemplate({
    ...address({ id: 'g1-u11-2-fifth-figure', subtopicId: 'mzardi', difficulty: 3 }),
    prompt: 'პირველ ფიგურაში {first} კვადრატია, ყოველ მომდევნოში კი {step}-ით მეტი. რამდენი კვადრატი იქნება მეხუთე ფიგურაში?',
    variables: {
      first: { kind: 'int', min: 1, max: 10 },
      step: { kind: 'int', min: 1, max: 5 },
      values: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), Number(v.step), 5).join(', ')] },
    },
    constraints: [{ note: 'the fifth figure stays inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.step), 5) <= 99 }],
    answer: (v: Vars) => term(Number(v.first), Number(v.step), 5),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars }) => sequenceSlips(Number(vars.first), Number(vars.step), 5).map(String),
    explanation: ({ vars, answer }) => `ფიგურები: ${vars.values}, ამიტომ მეხუთეა ${answer}.`,
  }),

  /** Level 3 — the sixth term, from the rule and not the list (Q40, Q47). */
  defineTemplate({
    ...address({ id: 'g1-u11-2-sixth-term', subtopicId: 'mzardi', difficulty: 3 }),
    prompt: 'მიმდევრობა იწყება {first}-ით და ყოველ ჯერზე {step} ემატება. რა იქნება მეექვსე რიცხვი?',
    variables: {
      first: { kind: 'int', min: 1, max: 20 },
      step: { kind: 'int', min: 1, max: 10 },
      values: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), Number(v.step), 6).join(', ')] },
    },
    constraints: [{ note: 'the sixth term stays inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.step), 6) <= 100 }],
    answer: (v: Vars) => term(Number(v.first), Number(v.step), 6),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars }) => sequenceSlips(Number(vars.first), Number(vars.step), 6).map(String),
    explanation: ({ vars, answer }) => `${vars.first} + 5 × ${vars.step} = ${answer}; მიმდევრობა: ${vars.values}.`,
  }),

  /** Level 3 — the seventh figure, computed from first term and step (Q50). */
  defineTemplate({
    ...address({ id: 'g1-u11-2-seventh-figure', subtopicId: 'mzardi', difficulty: 3 }),
    prompt: 'პირველ ფიგურაში {first} წრეა, ყოველ მომდევნოში კი {step}-ით მეტი. რამდენი წრე იქნება მეშვიდე ფიგურაში?',
    variables: {
      first: { kind: 'int', min: 1, max: 10 },
      step: { kind: 'int', min: 1, max: 5 },
      values: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), Number(v.step), 7).join(', ')] },
    },
    constraints: [{ note: 'the seventh figure stays inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.step), 7) <= 99 }],
    answer: (v: Vars) => term(Number(v.first), Number(v.step), 7),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars }) => sequenceSlips(Number(vars.first), Number(vars.step), 7).map(String),
    explanation: ({ vars, answer }) => `${vars.first} + 6 × ${vars.step} = ${answer}.`,
  }),
];

/* ================================================================== *\
 * U11.3 — წესის აღწერა (Q21–Q30)
 * ================================================================== */

const u113: QuestionTemplate[] = [
  /** Level 1 — a rising sequence, name its rule (Q21). */
  defineTemplate({
    ...address({ id: 'g1-u11-3-rule-rising', subtopicId: 'wesis-agwera', difficulty: 1 }),
    prompt: 'მიმდევრობაა: {seq}. რა წესით იზრდება რიცხვები?',
    variables: {
      first: { kind: 'int', min: 1, max: 20 },
      step: { kind: 'choice', values: [1, 2, 3, 5] },
      seq: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), Number(v.step), 4).join(', ')] },
    },
    constraints: [{ note: 'the printed run stays inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.step), 4) <= 100 }],
    answer: (v: Vars) => ruleText(Number(v.step)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => wrongRules(Number(vars.step)),
    explanation: ({ vars, answer }) => `${vars.seq}: „${answer}“.`,
  }),

  /** Level 1 — a sequence of tens, name its rule (Q22). */
  defineTemplate({
    ...address({ id: 'g1-u11-3-rule-tens', subtopicId: 'wesis-agwera', difficulty: 1 }),
    prompt: 'მიმდევრობაა: {seq}. აირჩიე სწორი წესი.',
    variables: {
      first: { kind: 'choice', values: [3, 5, 10, 20] },
      seq: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), 10, 4).join(', ')] },
    },
    constraints: [{ note: 'the printed run stays inside one hundred', test: (v: Vars) => term(Number(v.first), 10, 4) <= 100 }],
    answer: () => ruleText(10),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => [dropText(10), ruleText(20)],
    explanation: ({ vars }) => `${vars.seq}: ყოველ ჯერზე 10 ემატება.`,
  }),

  /** Level 1 — describe a two-symbol alternation (Q23). */
  defineTemplate({
    ...address({ id: 'g1-u11-3-rule-alternating', subtopicId: 'wesis-agwera', difficulty: 1 }),
    prompt: 'ნიმუშია: {seq}. აღწერე წესი.',
    variables: {
      a: { kind: 'choice', values: PALETTE },
      b: { kind: 'choice', values: PALETTE },
      other: { kind: 'choice', values: PALETTE },
      cycle: { kind: 'choice', values: (v: Vars) => [pack([String(v.a), String(v.b)])] },
      seq: { kind: 'choice', values: (v: Vars) => [row(runOf(cycleOf(v), 6))] },
    },
    constraints: [
      { note: 'the two symbols differ', test: (v: Vars) => String(v.a) !== String(v.b) },
      {
        note: 'the decoy symbol differs from both, so the wrong option is clearly wrong',
        test: (v: Vars) => ![String(v.a), String(v.b)].includes(String(v.other)),
      },
    ],
    answer: (v: Vars) => `${v.a} და ${v.b} მონაცვლეობს`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [`${vars.a} და ${vars.b} შერეულად მეორდება`, `${vars.a} და ${vars.other} მონაცვლეობს`],
    explanation: ({ vars, answer }) => `${vars.seq}: „${answer}“.`,
  }),

  /** Level 2 — a falling sequence, name its rule (Q24, Q28). */
  defineTemplate({
    ...address({ id: 'g1-u11-3-rule-falling', subtopicId: 'wesis-agwera', difficulty: 2 }),
    prompt: 'მიმდევრობაა: {seq}. რა წესით იცვლება რიცხვები?',
    variables: {
      last: { kind: 'int', min: 12, max: 40 },
      step: { kind: 'choice', values: [1, 2, 3, 5, 10] },
      seq: {
        kind: 'choice',
        values: (v: Vars) => [sequence(Number(v.last), Number(v.step), 4).reverse().join(', ')],
      },
    },
    constraints: [{ note: 'every term stays non-negative', test: (v: Vars) => Number(v.last) - 3 * Number(v.step) >= 0 }],
    answer: (v: Vars) => dropText(Number(v.step)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [ruleText(Number(vars.step)), dropText(Number(vars.step) + 1)],
    explanation: ({ vars, answer }) => `${vars.seq}: „${answer}“.`,
  }),

  /** Level 2 — the step, as a number (Q25, Q43). */
  defineTemplate({
    ...address({ id: 'g1-u11-3-name-the-step', subtopicId: 'wesis-agwera', difficulty: 2 }),
    prompt: 'მიმდევრობაა: {seq}. შეავსე წესი: „ყოველ ჯერზე ___ ემატება“.',
    variables: {
      first: { kind: 'int', min: 1, max: 20 },
      step: { kind: 'int', min: 2, max: 9 },
      seq: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), Number(v.step), 4).join(', ')] },
    },
    constraints: [{ note: 'the printed run stays inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.step), 4) <= 100 }],
    answer: (v: Vars) => Number(v.step),
    format: { kind: 'integer', min: 1, max: 10, entry: true },
    distractors: ({ answer }) => {
      const step = Number(answer);
      return [step + 1, step - 1, step + 2].filter((n, index, all) => n >= 1 && n !== step && all.indexOf(n) === index).map(String);
    },
    explanation: ({ vars, answer }) => `${vars.seq}: მეორე და პირველი წევრის სხვაობა ${answer}-ია.`,
  }),

  /** Level 2 — pick the rule that fits a growing pattern (Q26). */
  defineTemplate({
    ...address({ id: 'g1-u11-3-pick-rule', subtopicId: 'wesis-agwera', difficulty: 2 }),
    prompt: 'ფიგურების რაოდენობაა: {seq}. რომელი წესია სწორი?',
    variables: {
      first: { kind: 'int', min: 1, max: 20 },
      step: { kind: 'int', min: 2, max: 5 },
      seq: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), Number(v.step), 4).join(', ')] },
    },
    constraints: [{ note: 'the printed run stays inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.step), 4) <= 100 }],
    answer: (v: Vars) => ruleText(Number(v.step)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [ruleText(Number(vars.step) + 1), dropText(Number(vars.step))],
    explanation: ({ vars, answer }) => `თითოეული წევრი წინაზე ${vars.step}-ით მეტია: „${answer}“.`,
  }),

  /** Level 2 — a run of odd numbers, describe it (Q27). */
  defineTemplate({
    ...address({ id: 'g1-u11-3-rule-odd', subtopicId: 'wesis-agwera', difficulty: 2 }),
    prompt: 'მიმდევრობაა: {seq}. აღწერე წესი.',
    variables: {
      first: { kind: 'choice', values: [1, 3, 5, 7] },
      seq: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), 2, 5).join(', ')] },
    },
    answer: () => ruleText(2),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => [ruleText(1), dropText(2)],
    explanation: ({ vars }) => `${vars.seq}: „ყოველ ჯერზე 2 ემატება“.`,
  }),

  /**
   * Level 3 — which number continues the rule (Q29)?
   *
   * The specification asks for a multi-select. The runner marks exactly one
   * answer, so the same knowledge is asked as „which of these numbers comes
   * next“: one option continues the rule, the others are the slips a child makes
   * who has not read it.
   */
  defineTemplate({
    ...address({ id: 'g1-u11-3-next-under-rule', subtopicId: 'wesis-agwera', difficulty: 3 }),
    prompt: 'მიმდევრობაა: {seq}. რომელი რიცხვია მისი შემდეგი წევრი?',
    variables: {
      first: { kind: 'int', min: 1, max: 20 },
      step: { kind: 'int', min: 2, max: 9 },
      seq: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), Number(v.step), 5).join(', ')] },
    },
    constraints: [{ note: 'the answer stays inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.step), 6) <= 100 }],
    answer: (v: Vars) => term(Number(v.first), Number(v.step), 6),
    format: { kind: 'integer', min: 0, max: 100 },
    optionCount: 4,
    // Four options need four distinct numbers, and the step slips alone dry up
    // near the top of the range (the term after the answer would pass one
    // hundred). The neighbouring integers top the set up.
    distractors: ({ vars, answer }) => {
      const first = Number(vars.first);
      const step = Number(vars.step);
      const right = Number(answer);
      const pool = [right + step, right - step, first + 6 * step, right + 1, right - 1];
      return [...new Set(pool.filter((n) => n >= 0 && n <= 100 && n !== right))].map(String);
    },
    explanation: ({ vars, answer }) => `ნაბიჯია ${vars.step}, ამიტომ შემდეგია ${answer}.`,
  }),

  /**
   * Level 3 — is a named rule the right one (Q30)?
   *
   * A true/false item whose verdict is computed: the claim is compared with the
   * step the sequence actually has. The claim matches the step half the time and
   * is one or two away the other half, so both answers really occur.
   */
  defineTemplate({
    ...address({ id: 'g1-u11-3-claim-check', subtopicId: 'wesis-agwera', difficulty: 3 }),
    prompt: 'მიმდევრობაა: {seq}. მოსწავლე ამბობს: „ყოველ ჯერზე {claim} ემატება“. სწორია?',
    variables: {
      first: { kind: 'int', min: 1, max: 20 },
      step: { kind: 'int', min: 2, max: 9 },
      truth: { kind: 'choice', values: ['true', 'false'] },
      slip: { kind: 'choice', values: [1, 2] },
      claim: {
        kind: 'choice',
        values: (v: Vars) => [Number(v.truth === 'true' ? v.step : Number(v.step) + Number(v.slip))],
      },
      seq: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), Number(v.step), 4).join(', ')] },
    },
    constraints: [
      { note: 'the printed run stays inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.step), 4) <= 100 },
      {
        note: 'a claim marked false really is false',
        test: (v: Vars) => (v.truth === 'true' ? Number(v.claim) === Number(v.step) : Number(v.claim) !== Number(v.step)),
      },
    ],
    answer: (v: Vars) => (Number(v.claim) === Number(v.step) ? 'მართალია' : 'არ არის მართალი'),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => [answer === 'მართალია' ? 'არ არის მართალი' : 'მართალია'],
    explanation: ({ vars, answer }) => `${vars.seq}: ნამდვილი ნაბიჯია ${vars.step}, ამიტომ განცხადება ${answer}.`,
  }),
];

/* ================================================================== *\
 * U11.4 — რიცხვითი მიმდევრობა (Q31–Q40)
 * ================================================================== */

/** Reads a stored pair of blank positions, e.g. „2-4“, back into numbers. */
const holesOf = (vars: Vars): number[] => String(vars.gap).split('-').map(Number);

/**
 * Two arithmetic runs interleaved into one line: odd places rise by `a`, even
 * places by `b`, so the next numbers come from different rules.
 */
const weave = (first: number, a: number, b: number, pairs: number): string[] => {
  const front = sequence(first, a, pairs);
  const back = sequence(first + b, b, pairs);
  const merged: number[] = [];
  for (let index = 0; index < pairs; index += 1) merged.push(front[index]!, back[index]!);
  return merged.map(String);
};

const u114: QuestionTemplate[] = [
  /** Level 1 — count by twos (Q31). */
  defineTemplate({
    ...address({ id: 'g1-u11-4-count-by-twos', subtopicId: 'ricxviTi-mimdevroba', difficulty: 1 }),
    prompt: 'ჩაწერე გამოტოვებული რიცხვი: {seq}',
    variables: {
      first: { kind: 'choice', values: [2, 4, 6, 8, 10] },
      missed: { kind: 'choice', values: [3, 4] },
      full: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), 2, 5).join(', ')] },
      seq: {
        kind: 'choice',
        values: (v: Vars) => {
          const values = sequence(Number(v.first), 2, 5).map(String);
          values[Number(v.missed) - 1] = '__';
          return [values.join(', ')];
        },
      },
    },
    constraints: [{ note: 'the run stays inside one hundred', test: (v: Vars) => term(Number(v.first), 2, 5) <= 100 }],
    answer: (v: Vars) => term(Number(v.first), 2, Number(v.missed)),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars }) => sequenceSlips(Number(vars.first), 2, Number(vars.missed)).map(String),
    explanation: ({ vars, answer }) => `ორზე თვლა: ${vars.full}, ამიტომ გამოტოვებულია ${answer}.`,
  }),

  /** Level 1 — count by fives (Q32). */
  defineTemplate({
    ...address({ id: 'g1-u11-4-count-by-fives', subtopicId: 'ricxviTi-mimdevroba', difficulty: 1 }),
    prompt: 'ჩაწერე გამოტოვებული რიცხვი: {seq}',
    variables: {
      first: { kind: 'choice', values: [5, 10, 15, 20] },
      missed: { kind: 'choice', values: [2, 3, 4] },
      full: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), 5, 6).join(', ')] },
      seq: {
        kind: 'choice',
        values: (v: Vars) => {
          const values = sequence(Number(v.first), 5, 6).map(String);
          values[Number(v.missed) - 1] = '__';
          return [values.join(', ')];
        },
      },
    },
    constraints: [{ note: 'the run stays inside one hundred', test: (v: Vars) => term(Number(v.first), 5, 6) <= 100 }],
    answer: (v: Vars) => term(Number(v.first), 5, Number(v.missed)),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars }) => sequenceSlips(Number(vars.first), 5, Number(vars.missed)).map(String),
    explanation: ({ vars, answer }) => `ხუთებით თვლა: ${vars.full}, ამიტომ გამოტოვებულია ${answer}.`,
  }),

  /** Level 1 — count down (Q33, Q41). */
  defineTemplate({
    ...address({ id: 'g1-u11-4-count-down', subtopicId: 'ricxviTi-mimdevroba', difficulty: 1 }),
    prompt: 'მიმდევრობა კლებადობით მიდის: {seq} ჩაწერე შემდეგი რიცხვი.',
    variables: {
      from: { kind: 'int', min: 6, max: 20 },
      step: { kind: 'choice', values: [1, 2] },
      seq: {
        kind: 'choice',
        values: (v: Vars) => [`${sequence(Number(v.from), Number(v.step), 4).reverse().join(', ')}, __`],
      },
    },
    constraints: [{ note: 'the next term stays non-negative', test: (v: Vars) => Number(v.from) - Number(v.step) >= 0 }],
    // The printed run is `from + 3d … from`, so the term after it is `from − d`.
    answer: (v: Vars) => Number(v.from) - Number(v.step),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars, answer }) => {
      const step = Number(vars.step);
      return [Number(answer) + step, Number(answer) - step, Number(answer) + 1]
        .filter((n, index, all) => n >= 0 && n !== Number(answer) && all.indexOf(n) === index)
        .map(String);
    },
    explanation: ({ vars, answer }) => `ყოველ ჯერზე ${vars.step} აკლდება, ამიტომ შემდეგია ${answer}.`,
  }),

  /** Level 1 — a single blank in the middle (Q35). */
  defineTemplate({
    ...address({ id: 'g1-u11-4-middle-hole', subtopicId: 'ricxviTi-mimdevroba', difficulty: 1 }),
    prompt: 'ჩაწერე გამოტოვებული რიცხვი: {seq}',
    variables: {
      first: { kind: 'int', min: 1, max: 30 },
      step: { kind: 'int', min: 2, max: 9 },
      missed: { kind: 'choice', values: [2, 3] },
      full: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), Number(v.step), 4).join(', ')] },
      seq: {
        kind: 'choice',
        values: (v: Vars) => {
          const values = sequence(Number(v.first), Number(v.step), 4).map(String);
          values[Number(v.missed) - 1] = '__';
          return [values.join(', ')];
        },
      },
    },
    constraints: [{ note: 'the run stays inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.step), 4) <= 100 }],
    answer: (v: Vars) => term(Number(v.first), Number(v.step), Number(v.missed)),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars }) => sequenceSlips(Number(vars.first), Number(vars.step), Number(vars.missed)).map(String),
    explanation: ({ vars, answer }) => `${vars.full}: ნაბიჯია ${vars.step}, ამიტომ გამოტოვებულია ${answer}.`,
  }),

  /** Level 2 — count by tens from an odd start (Q37). */
  defineTemplate({
    ...address({ id: 'g1-u11-4-count-by-tens', subtopicId: 'ricxviTi-mimdevroba', difficulty: 2 }),
    prompt: 'ჩაწერე გამოტოვებული რიცხვი: {seq}',
    variables: {
      first: { kind: 'choice', values: [3, 4, 6, 7] },
      missed: { kind: 'choice', values: [2, 3, 4] },
      full: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), 10, 5).join(', ')] },
      seq: {
        kind: 'choice',
        values: (v: Vars) => {
          const values = sequence(Number(v.first), 10, 5).map(String);
          values[Number(v.missed) - 1] = '__';
          return [values.join(', ')];
        },
      },
    },
    constraints: [{ note: 'the run stays inside one hundred', test: (v: Vars) => term(Number(v.first), 10, 5) <= 100 }],
    answer: (v: Vars) => term(Number(v.first), 10, Number(v.missed)),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ answer }) => {
      const right = Number(answer);
      return [right + 1, right - 10, right + 10]
        .filter((n, index, all) => n >= 0 && n <= 100 && n !== right && all.indexOf(n) === index)
        .map(String);
    },
    explanation: ({ vars, answer }) => `ათეულებით თვლა: ${vars.full}, ამიტომ ${answer}.`,
  }),

  /** Level 2 — two blanks, both answers in order (Q34, Q36, Q39). */
  defineTemplate({
    ...address({ id: 'g1-u11-4-two-holes', subtopicId: 'ricxviTi-mimdevroba', difficulty: 2 }),
    prompt: 'ორი რიცხვი აკლია: {seq} აირჩიე ისინი თანმიმდევრობით.',
    variables: {
      first: { kind: 'int', min: 1, max: 30 },
      step: { kind: 'choice', values: [2, 3, 4, 5] },
      gap: { kind: 'choice', values: ['2-3', '2-4', '3-4'] },
      seq: {
        kind: 'choice',
        values: (v: Vars) => {
          const values = sequence(Number(v.first), Number(v.step), 5).map(String);
          for (const position of holesOf(v)) values[position - 1] = '__';
          return [values.join(', ')];
        },
      },
    },
    constraints: [{ note: 'the run stays inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.step), 5) <= 100 }],
    answer: (v: Vars) =>
      holesOf(v)
        .map((position) => term(Number(v.first), Number(v.step), position))
        .join(', '),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const first = Number(vars.first);
      const step = Number(vars.step);
      const holes = holesOf(vars);
      // Each hole nudged down and up by one — a miscount, not a miscopy: a
      // distractor that is itself printed in the run can be picked by copying.
      return [
        holes.map((position) => term(first, step, position) - 1).join(', '),
        holes.map((position) => term(first, step, position) + 1).join(', '),
      ];
    },
    explanation: ({ vars, answer }) => `ნაბიჯია ${vars.step}, ამიტომ გამოტოვებულია ${answer}.`,
  }),

  /** Level 2 — a hundred-chart leap of ten (Q44). */
  defineTemplate({
    ...address({ id: 'g1-u11-4-hundred-chart', subtopicId: 'ricxviTi-mimdevroba', difficulty: 2 }),
    prompt: 'ცხრილში {start}-დან ყოველ ჯერზე 10-ით წინ მივდივართ. რა რიცხვი იქნება მეოთხე ნაბიჯზე?',
    variables: {
      start: { kind: 'int', min: 1, max: 50 },
      values: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.start), 10, 4).join(', ')] },
    },
    constraints: [{ note: 'the fourth step stays inside one hundred', test: (v: Vars) => term(Number(v.start), 10, 4) <= 100 }],
    answer: (v: Vars) => term(Number(v.start), 10, 4),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ answer }) => {
      const right = Number(answer);
      return [right + 1, right - 10, right + 10]
        .filter((n, index, all) => n >= 0 && n <= 100 && n !== right && all.indexOf(n) === index)
        .map(String);
    },
    explanation: ({ vars, answer }) => `${vars.values}, ამიტომ მეოთხეა ${answer}.`,
  }),

  /** Level 2 — what stood before a printed run (Q45). */
  defineTemplate({
    ...address({ id: 'g1-u11-4-before-the-run', subtopicId: 'ricxviTi-mimdevroba', difficulty: 2 }),
    prompt: 'მიმდევრობაა: __, {tail}. რა რიცხვი დგას დასაწყისში, თუ ნაბიჯი {step}-ია?',
    variables: {
      second: { kind: 'int', min: 10, max: 60 },
      step: { kind: 'choice', values: [2, 3, 4, 5] },
      tail: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.second), Number(v.step), 3).join(', ')] },
    },
    constraints: [{ note: 'the missing first term stays non-negative', test: (v: Vars) => Number(v.second) - Number(v.step) >= 0 }],
    answer: (v: Vars) => Number(v.second) - Number(v.step),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars, answer }) => {
      const right = Number(answer);
      const step = Number(vars.step);
      return [right + 1, right + step, right - step]
        .filter((n, index, all) => n >= 0 && n !== right && all.indexOf(n) === index)
        .map(String);
    },
    explanation: ({ vars, answer }) => `უკანასკნელი ნაბიჯით უკან: ${vars.second} − ${vars.step} = ${answer}.`,
  }),

  /** Level 3 — two interleaved runs (Q49). */
  defineTemplate({
    ...address({ id: 'g1-u11-4-two-trains', subtopicId: 'ricxviTi-mimdevroba', difficulty: 3 }),
    prompt: 'ორი მიმდევრობაა გადაჯვარედინებული: {seq} აირჩიე ორი შემდეგი რიცხვი, თანმიმდევრობით.',
    variables: {
      first: { kind: 'int', min: 1, max: 10 },
      stepA: { kind: 'choice', values: [2, 3] },
      stepB: { kind: 'choice', values: [5, 10] },
      seq: {
        kind: 'choice',
        values: (v: Vars) => [`${weave(Number(v.first), Number(v.stepA), Number(v.stepB), 3).join(', ')}, __, __`],
      },
    },
    constraints: [{ note: 'both runs stay inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.stepB), 4) <= 100 }],
    answer: (v: Vars) => weave(Number(v.first), Number(v.stepA), Number(v.stepB), 4).slice(6).join(', '),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const first = Number(vars.first);
      const a = Number(vars.stepA);
      const b = Number(vars.stepB);
      // Using the same step for both places, and applying each step twice to
      // what was already printed — the two halves of the mistake.
      const doubled = weave(first, a, b, 4).slice(6).map((value, index) => Number(value) + (index === 0 ? a : b));
      return [weave(first, a, a, 4).slice(6).join(', '), doubled.join(', ')];
    },
    explanation: ({ vars, answer }) => `ადგილები მონაცვლეობით იზრდება ${vars.stepA}-ით და ${vars.stepB}-ით: ${answer}.`,
  }),
];

/* ================================================================== *\
 * U11.5 — გამეორება (Q41–Q50)
 * ================================================================== */

/**
 * The review set mixes the four subtopics. Every item still lives under its own
 * subtopic id so the topic's progress stays honest; what makes it a review is
 * that each asks the second form of what its subtopic taught.
 */
const u11Review: QuestionTemplate[] = [
  /** Q41 — count down while colours alternate. */
  defineTemplate({
    ...address({ id: 'g1-u11-r-down-and-back', subtopicId: 'ricxviTi-mimdevroba', difficulty: 1 }),
    prompt: 'ნიმუშში ფერები მონაცვლეობს, რიცხვები კი კლებადობით მიდის: {seq} ჩაწერე შემდეგი რიცხვი.',
    variables: {
      from: { kind: 'int', min: 12, max: 30 },
      step: { kind: 'choice', values: [2, 3] },
      seq: { kind: 'choice', values: (v: Vars) => [`${sequence(Number(v.from), Number(v.step), 4).reverse().join(', ')}, __`] },
    },
    constraints: [{ note: 'the next term stays non-negative', test: (v: Vars) => Number(v.from) - Number(v.step) >= 0 }],
    answer: (v: Vars) => Number(v.from) - Number(v.step),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars, answer }) => {
      const step = Number(vars.step);
      return [Number(answer) + step, Number(answer) - step, Number(answer) + 1]
        .filter((n, index, all) => n >= 0 && n !== Number(answer) && all.indexOf(n) === index)
        .map(String);
    },
    explanation: ({ vars, answer }) => `ნაბიჯია ${vars.step}, ამიტომ ${answer}.`,
  }),

  /** Q42 — a picture rule, asked for a place far along it. */
  defineTemplate({
    ...address({ id: 'g1-u11-r-picture-then-number', subtopicId: 'gameorebadi', difficulty: 2 }),
    prompt: 'ნიმუში: {seq} რომელი ფიგურა იქნება {position}-ე ადგილზე?',
    variables: {
      a: { kind: 'choice', values: PALETTE },
      b: { kind: 'choice', values: PALETTE },
      position: { kind: 'int', min: 7, max: 20 },
      cycle: { kind: 'choice', values: (v: Vars) => [pack([String(v.a), String(v.b)])] },
      seq: { kind: 'choice', values: (v: Vars) => [row(runOf(cycleOf(v), 6))] },
    },
    constraints: [{ note: 'the two symbols differ', test: (v: Vars) => String(v.a) !== String(v.b) }],
    answer: (v: Vars) => elementAt(cycleOf(v), Number(v.position)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => symbolDistractors(cycleOf(vars), String(answer)),
    explanation: ({ vars, answer }) => `ორი სიმბოლო მონაცვლეობს: ${vars.position}-ე ადგილზე ${answer}.`,
  }),

  /** Q43 — how much does each number grow, as a number. */
  defineTemplate({
    ...address({ id: 'g1-u11-r-step-as-number', subtopicId: 'wesis-agwera', difficulty: 2 }),
    prompt: 'მიმდევრობაა: {seq}. რამდენით იზრდება ყოველი შემდეგი რიცხვი?',
    variables: {
      first: { kind: 'int', min: 1, max: 25 },
      step: { kind: 'int', min: 1, max: 9 },
      seq: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), Number(v.step), 4).join(', ')] },
    },
    constraints: [{ note: 'the run stays inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.step), 4) <= 100 }],
    answer: (v: Vars) => Number(v.step),
    format: { kind: 'integer', min: 1, max: 9, entry: true },
    distractors: ({ answer }) => {
      const step = Number(answer);
      return [step + 1, step - 1, step + 2].filter((n, index, all) => n >= 1 && n !== step && all.indexOf(n) === index).map(String);
    },
    explanation: ({ vars, answer }) => `${vars.seq}: ნაბიჯია ${answer}.`,
  }),

  /** Q44 — a chart leap, asked backwards. */
  defineTemplate({
    ...address({ id: 'g1-u11-r-chart-backwards', subtopicId: 'ricxviTi-mimdevroba', difficulty: 2 }),
    prompt: 'ცხრილში {start}-დან 10-ებით სამი ნაბიჯით უკან ჩამოვედით. რომელ რიცხვზე აღმოვჩნდით?',
    variables: {
      start: { kind: 'int', min: 35, max: 90 },
      values: {
        kind: 'choice',
        values: (v: Vars) =>
          [Array.from({ length: 4 }, (_, index) => Number(v.start) - index * 10).join(', ')],
      },
    },
    constraints: [{ note: 'the end stays non-negative', test: (v: Vars) => Number(v.start) - 30 >= 0 }],
    answer: (v: Vars) => Number(v.start) - 30,
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ answer }) => {
      const right = Number(answer);
      return [right + 10, right - 10, right + 1].filter((n, index, all) => n >= 0 && n !== right && all.indexOf(n) === index).map(String);
    },
    explanation: ({ vars, answer }) => `${vars.values}, ამიტომ პასუხია ${answer}.`,
  }),

  /** Q45 — what came before a run. */
  defineTemplate({
    ...address({ id: 'g1-u11-r-what-came-first', subtopicId: 'ricxviTi-mimdevroba', difficulty: 2 }),
    prompt: 'მიმდევრობა იწყება __-ით: {tail}. ნაბიჯია {step}. რა რიცხვით იწყება?',
    variables: {
      second: { kind: 'int', min: 12, max: 60 },
      step: { kind: 'choice', values: [2, 3, 4, 5] },
      tail: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.second), Number(v.step), 3).join(', ')] },
    },
    constraints: [{ note: 'the first term stays non-negative', test: (v: Vars) => Number(v.second) - Number(v.step) >= 0 }],
    answer: (v: Vars) => Number(v.second) - Number(v.step),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars, answer }) => {
      const right = Number(answer);
      const step = Number(vars.step);
      return [right + 1, right + step, right - step]
        .filter((n, index, all) => n >= 0 && n !== right && all.indexOf(n) === index)
        .map(String);
    },
    explanation: ({ vars, answer }) => `${vars.second} − ${vars.step} = ${answer}.`,
  }),

  /** Q46 — two numbers, one ordered answer. */
  defineTemplate({
    ...address({ id: 'g1-u11-r-two-after', subtopicId: 'mzardi', difficulty: 2 }),
    prompt: 'მიმდევრობაა: {seq} აირჩიე ორი შემდეგი რიცხვი, თანმიმდევრობით.',
    variables: {
      first: { kind: 'int', min: 1, max: 20 },
      step: { kind: 'choice', values: [3, 4, 6] },
      seq: { kind: 'choice', values: (v: Vars) => [`${sequence(Number(v.first), Number(v.step), 3).join(', ')}, __, __`] },
    },
    constraints: [{ note: 'both answers stay inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.step), 5) <= 100 }],
    answer: (v: Vars) => `${term(Number(v.first), Number(v.step), 4)}, ${term(Number(v.first), Number(v.step), 5)}`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const first = Number(vars.first);
      const step = Number(vars.step);
      return [
        `${term(first, step, 4) + 1}, ${term(first, step, 5) + 1}`,
        `${term(first, step, 5)}, ${term(first, step, 6)}`,
      ];
    },
    explanation: ({ vars, answer }) => `ნაბიჯია ${vars.step}, ამიტომ ${answer}.`,
  }),

  /** Q47 — a long way out: the eighth term. */
  defineTemplate({
    ...address({ id: 'g1-u11-r-far-term', subtopicId: 'mzardi', difficulty: 3 }),
    prompt: 'მიმდევრობა იწყება {first}-ით და ყოველ ჯერზე {step} ემატება. რა იქნება მერვე რიცხვი?',
    variables: {
      first: { kind: 'int', min: 1, max: 15 },
      step: { kind: 'int', min: 1, max: 8 },
      values: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), Number(v.step), 8).join(', ')] },
    },
    constraints: [{ note: 'the eighth term stays inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.step), 8) <= 100 }],
    answer: (v: Vars) => term(Number(v.first), Number(v.step), 8),
    format: { kind: 'integer', min: 0, max: 100, entry: true },
    distractors: ({ vars }) => sequenceSlips(Number(vars.first), Number(vars.step), 8).map(String),
    explanation: ({ vars, answer }) => `${vars.first} + 7 × ${vars.step} = ${answer}.`,
  }),

  /** Q48 — a place far down a three-symbol cycle. */
  defineTemplate({
    ...address({ id: 'g1-u11-r-far-position', subtopicId: 'gameorebadi', difficulty: 3 }),
    prompt: 'ნიმუში: {seq} რომელი სიმბოლოა {position}-ე ადგილზე?',
    variables: {
      a: { kind: 'choice', values: PALETTE },
      b: { kind: 'choice', values: PALETTE },
      c: { kind: 'choice', values: PALETTE },
      position: { kind: 'int', min: 13, max: 30 },
      cycle: { kind: 'choice', values: (v: Vars) => [pack([String(v.a), String(v.b), String(v.c)])] },
      seq: { kind: 'choice', values: (v: Vars) => [row(runOf(cycleOf(v), 9))] },
    },
    constraints: [
      { note: 'all three symbols differ', test: (v: Vars) => new Set([String(v.a), String(v.b), String(v.c)]).size === 3 },
      {
        note: 'the position is not a wrapped first element, so counting is required',
        test: (v: Vars) => (Number(v.position) - 1) % 3 !== 0,
      },
    ],
    answer: (v: Vars) => elementAt(cycleOf(v), Number(v.position)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => symbolDistractors(cycleOf(vars), String(answer)),
    explanation: ({ vars, answer }) => `სამი სიმბოლო მეორდება: ${vars.position}-ე ადგილზე ${answer}.`,
  }),

  /** Q49 — two runs interleaved. */
  defineTemplate({
    ...address({ id: 'g1-u11-r-weave', subtopicId: 'ricxviTi-mimdevroba', difficulty: 3 }),
    prompt: 'ორი მიმდევრობაა გადაჯვარედინებული: {seq} აირჩიე ორი შემდეგი რიცხვი, თანმიმდევრობით.',
    variables: {
      first: { kind: 'int', min: 1, max: 10 },
      stepA: { kind: 'choice', values: [2, 3] },
      stepB: { kind: 'choice', values: [5, 10] },
      seq: { kind: 'choice', values: (v: Vars) => [`${weave(Number(v.first), Number(v.stepA), Number(v.stepB), 3).join(', ')}, __, __`] },
    },
    constraints: [{ note: 'both runs stay inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.stepB), 4) <= 100 }],
    answer: (v: Vars) => weave(Number(v.first), Number(v.stepA), Number(v.stepB), 4).slice(6).join(', '),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const first = Number(vars.first);
      const a = Number(vars.stepA);
      const b = Number(vars.stepB);
      // Using the same step for both places, and applying each step twice to
      // what was already printed — the two halves of the mistake.
      const doubled = weave(first, a, b, 4).slice(6).map((value, index) => Number(value) + (index === 0 ? a : b));
      return [weave(first, a, a, 4).slice(6).join(', '), doubled.join(', ')];
    },
    explanation: ({ vars, answer }) => `ადგილები მონაცვლეობით იზრდება ${vars.stepA}-ით და ${vars.stepB}-ით: ${answer}.`,
  }),

  /** Q50 — the rule named for a mixed pattern. */
  defineTemplate({
    ...address({ id: 'g1-u11-r-rule-mixed', subtopicId: 'wesis-agwera', difficulty: 3 }),
    prompt: 'ნიმუშის რიცხვებია: {seq}. რომელი წესია სწორი?',
    variables: {
      first: { kind: 'int', min: 2, max: 12 },
      step: { kind: 'choice', values: [2, 4, 5] },
      seq: { kind: 'choice', values: (v: Vars) => [sequence(Number(v.first), Number(v.step), 5).join(', ')] },
    },
    constraints: [{ note: 'the run stays inside one hundred', test: (v: Vars) => term(Number(v.first), Number(v.step), 5) <= 100 }],
    answer: (v: Vars) => ruleText(Number(v.step)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [ruleText(Number(vars.step) + 2), dropText(Number(vars.step))],
    explanation: ({ vars, answer }) => `${vars.seq}: „${answer}“.`,
  }),
];

/**
 * Every U11 template, in curriculum order: repeating, growing, describing the
 * rule, numeric sequences, then the mixed review.
 */
export const U11_TEMPLATES: QuestionTemplate[] = [...u111, ...u112, ...u113, ...u114, ...u11Review];

/** Subtopic ids this library is responsible for. */
export const U11_SUBTOPICS = ['gameorebadi', 'mzardi', 'wesis-agwera', 'ricxviTi-mimdevroba'];
