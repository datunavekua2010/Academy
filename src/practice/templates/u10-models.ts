import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

const grade = 1 as const;
const topicId = 'raodenobis-modeli';
const unitId = 'raodenobis-modeli';

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

/** The two blocks a base-ten model is built from. */
const TEN = '🟦';
const ONE = '🟨';

/**
 * A number drawn as tens and ones.
 *
 * „3 ათეული და 2 ერთეული“ is the reading this unit teaches, so the picture is
 * built from that reading and not from the number: `tensOf` and `onesOf` are
 * the only ways in, and both are derived from the same drawn value that the
 * answer comes from. A model can therefore never disagree with its text.
 *
 * Ten separate `🟦` glyphs would read as ten cubes, not one ten — so a ten is
 * drawn as a *bar* with its own label, and only the loose ones are counted out.
 */
const tensOf = (value: number): number => Math.floor(value / 10);
const onesOf = (value: number): number => value % 10;

/**
 * One ten: a labelled bar, so it is never counted as ten separate blocks.
 *
 * The block colour is a parameter because a story about *red* balls must not
 * draw them in the same blue as every other ten — the colour is part of what
 * the sentence says, and rule 4 applies to colour as much as to count.
 */
const tenBar = (emoji = TEN): string => `${emoji}${'░'.repeat(8)}▌`;

/**
 * The full model for a number, as a two-line picture.
 *
 * Line 1 is the tens as bars, line 2 the loose ones. A number with no ones
 * still shows its zero explicitly, because „60 is six tens and *no* ones“ is a
 * fact this unit tests, and a blank second line would be ambiguous between
 * „none“ and „did not render“.
 */
const modelOf = (value: number): string => {
  const tens = tensOf(value);
  const ones = onesOf(value);
  const tensLine = tens > 0 ? Array.from({ length: tens }, tenBar).join(' ') : '—';
  const onesLine = ones > 0 ? draw(ONE, ones) : '—';
  return `${tensLine}\n${onesLine}`;
};

/**
 * A compact model, for use *inside an answer option*.
 *
 * Options are single-line buttons, so the picture has to be short: the tens are
 * one glyph each (a bar reads as ten at a glance and stays one character wide),
 * and the ones are single cubes. This is what makes „which model matches 26?“
 * answerable by looking rather than by reading four numbers.
 */
const compact = (value: number): string => {
  const tens = tensOf(value);
  const ones = onesOf(value);
  const parts: string[] = [];
  if (tens > 0) parts.push(TEN.repeat(tens));
  if (ones > 0) parts.push(ONE.repeat(ones));
  return parts.length > 0 ? parts.join(' ') : '—';
};

/** „3 ათეული და 2 ერთეული“ — the words for a model, derived from the value. */
const wordsOf = (value: number): string => {
  const tens = tensOf(value);
  const ones = onesOf(value);
  if (tens === 0) return `${ones} ერთეული`;
  if (ones === 0) return `${tens} ათეული`;
  return `${tens} ათეული და ${ones} ერთეული`;
};

/**
 * Wrong numbers that a child actually produces on this unit's questions.
 *
 * The mistakes are place-value mistakes, not random offsets: the digits
 * swapped (26 → 62), a ten dropped or added, an off-by-one. A distractor drawn
 * at random teaches nothing, and a distractor equal to the answer is a second
 * right answer — so every candidate is filtered against the answer before use.
 */
const nearModel = (value: number, extras: number[] = []): number[] => {
  const tens = tensOf(value);
  const ones = onesOf(value);
  const candidates = [
    ones * 10 + tens, // digits swapped — the canonical place-value slip
    value + 10,
    value - 10,
    value + 1,
    value - 1,
    ...extras,
  ];
  const seen = new Set<number>([value]);
  const out: number[] = [];
  for (const candidate of candidates) {
    if (candidate < 1 || candidate > 99 || seen.has(candidate)) continue;
    seen.add(candidate);
    out.push(candidate);
  }
  return out;
};

/**
 * Four model strings for a value, exactly one of which is that value.
 *
 * Used wherever the answer is a picture rather than a number. Each wrong model
 * is a real misreading — digits swapped, a ten too few, a one too many — and
 * the set is de-duplicated on the rendered picture, because two different
 * numbers could otherwise print the same drawing.
 */
const modelOptions = (value: number, count = 4): string[] => {
  const wanted = [value, ...nearModel(value)];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const candidate of wanted) {
    const picture = compact(candidate);
    if (seen.has(picture)) continue;
    seen.add(picture);
    out.push(picture);
    if (out.length === count) break;
  }
  return out;
};

/**
 * A grouping of loose cubes, for Q23's „show the same number as ones only“.
 *
 * Sixty-three separate glyphs would be unreadable and, per the specification's
 * own note, not required: the ones are drawn in groups of ten with the
 * remainder after them, which is what a teacher draws on the board.
 */
const grouped = (count: number, emoji = ONE): string => {
  const groups: string[] = [];
  let left = count;
  while (left > 0) {
    const take = Math.min(10, left);
    groups.push(draw(emoji, take));
    left -= take;
  }
  return groups.join(' | ');
};

/* ================================================================== *\
 * U10.1 — ათეულები და ერთეულები
 * ================================================================== */

/**
 * Reading a model.
 *
 * Every template here draws the value first and renders both the words and the
 * picture from it, so rule 4 („the model must agree with the text and the
 * answer“) holds by construction rather than by checking.
 */
const u101: QuestionTemplate[] = [
  /** Level 1 — 3 tens and 2 ones, read as a number (Q1). */
  defineTemplate({
    ...at({ id: 'g1-u10-1-model-number', subtopicId: 'ateuli-erteuli-modeli', difficulty: 1 }),
    prompt: 'მოდელზე {t} ათეული და {o} ერთეულია. რომელი რიცხვია გამოსახული?',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      o: { kind: 'int', min: 0, max: 9 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.o)] },
    },
    constraints: [{ note: 'the two digits differ, so a swapped-digit distractor is real', test: (v: Vars) => Number(v.t) !== Number(v.o) }],
    answer: (v: Vars) => Number(v.value),
    format: { kind: 'integer', min: 10, max: 99, entry: true },
    distractors: ({ vars, answer }) => nearModel(Number(answer), [Number(vars.t) + Number(vars.o)]).map(String),
    explanation: ({ vars, answer }) => `${vars.t} ათეული = ${Number(vars.t) * 10}, ${vars.o} ერთეული — სულ ${answer}.`,
    visual: (v: Vars) => modelOf(Number(v.value)),
  }),

  /** Level 1 — how many tens and ones are in 47? (Q2) */
  defineTemplate({
    ...at({ id: 'g1-u10-1-tens-and-ones-of', subtopicId: 'ateuli-erteuli-modeli', difficulty: 1 }),
    prompt: 'რამდენი ათეული და რამდენი ერთეულია რიცხვში {n}? ჩაწერე ჯერ ათეულები, შემდეგ ერთეულები, მძიმით.',
    variables: {
      n: { kind: 'int', min: 10, max: 99 },
      t: { kind: 'choice', values: (v: Vars) => [tensOf(Number(v.n))] },
      o: { kind: 'choice', values: (v: Vars) => [onesOf(Number(v.n))] },
    },
    constraints: [
      { note: 'both digits are non-zero, so the answer is not „x, 0“', test: (v: Vars) => Number(v.t) !== 0 && Number(v.o) !== 0 },
      { note: 'the digits differ, so the swapped answer is a real mistake', test: (v: Vars) => Number(v.t) !== Number(v.o) },
    ],
    // Two numbers, one answer. The engine marks a single string, so the pair is
    // written in the order the question asks for — the same recast U07 and U09
    // use for „name the terms“. Documented in U10-MAPPING.md.
    answer: (v: Vars) => `${v.t}, ${v.o}`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [`${vars.o}, ${vars.t}`, `${vars.t}, ${Number(vars.n) - Number(vars.t) * 10 - Number(vars.o)}`].filter((option, index, all) => all.indexOf(option) === index),
    explanation: ({ vars }) => `${vars.n} = ${vars.t} ათეული + ${vars.o} ერთეული.`,
    visual: (v: Vars) => modelOf(Number(v.n)),
  }),

  /** Level 1 — which model shows 26? (Q3) */
  defineTemplate({
    ...at({ id: 'g1-u10-1-choose-model', subtopicId: 'ateuli-erteuli-modeli', difficulty: 1 }),
    prompt: 'აირჩიე მოდელი, რომელიც შეესაბამება რიცხვს {n}.',
    variables: {
      n: { kind: 'int', min: 10, max: 99 },
    },
    constraints: [
      { note: 'both digits are non-zero, so every model differs visibly', test: (v: Vars) => tensOf(Number(v.n)) > 0 && onesOf(Number(v.n)) > 0 },
      { note: 'the digits differ, so the swapped model is distinguishable', test: (v: Vars) => tensOf(Number(v.n)) !== onesOf(Number(v.n)) },
    ],
    answer: (v: Vars) => compact(Number(v.n)),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => modelOptions(Number(vars.n)).filter((option) => option !== String(answer)),
    explanation: ({ vars }) => `${vars.n} = ${wordsOf(Number(vars.n))}: ${compact(Number(vars.n))}.`,
    hint: '🟦 არის ათეული, 🟨 — ერთეული.',
  }),

  /** Level 1 — a model with no ones at all (Q4). */
  defineTemplate({
    ...at({ id: 'g1-u10-1-round-tens', subtopicId: 'ateuli-erteuli-modeli', difficulty: 1 }),
    prompt: 'მოდელზე {t} ათეულია და არცერთი ერთეული. რომელი რიცხვია?',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10] },
    },
    answer: (v: Vars) => Number(v.value),
    format: { kind: 'integer', min: 10, max: 90, entry: true },
    // The mistake this question invites is reading the tens count as the
    // number: „5 tens“ → 5, not 50.
    distractors: ({ vars, answer }) => nearModel(Number(answer), [Number(vars.t), Number(vars.t) * 10 + 1]).map(String),
    explanation: ({ vars, answer }) => `${vars.t} ათეული = ${answer}; ერთეულები არ არის.`,
    visual: (v: Vars) => modelOf(Number(v.value)),
  }),

  /** Level 2 — the model is read as a *count of ones*, not as a number (Q5). */
  defineTemplate({
    ...at({ id: 'g1-u10-1-total-ones', subtopicId: 'ateuli-erteuli-modeli', difficulty: 2 }),
    prompt: 'მოდელზე {t} ათეული და {o} ერთეულია. რამდენი ერთეულია სულ?',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      o: { kind: 'int', min: 0, max: 9 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.o)] },
    },
    constraints: [{ note: 'a ten and one one swap meaning only when the digits differ', test: (v: Vars) => Number(v.t) !== Number(v.o) }],
    answer: (v: Vars) => Number(v.value),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 3,
    distractors: ({ vars, answer }) => nearModel(Number(answer), [Number(vars.t) + Number(vars.o), Number(vars.t) * 10]).map(String),
    explanation: ({ vars, answer }) => `${vars.t} ათეული = ${Number(vars.t) * 10} ერთეული, კიდევ ${vars.o} — სულ ${answer} ერთეული.`,
    visual: (v: Vars) => modelOf(Number(v.value)),
  }),

  /** Level 2 — the ones are missing from a model whose total is given (Q6). */
  defineTemplate({
    ...at({ id: 'g1-u10-1-missing-ones', subtopicId: 'ateuli-erteuli-modeli', difficulty: 2 }),
    prompt: 'მოცემულია {t} ათეული და უცნობი რაოდენობის ერთეული. სულ {total} ერთეულია. რამდენი ერთეული აკლია მოდელს?',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      total: { kind: 'int', min: 11, max: 99 },
      o: { kind: 'choice', values: (v: Vars) => [onesOf(Number(v.total))] },
    },
    constraints: [
      { note: 'the tens of the total are exactly the printed tens', test: (v: Vars) => tensOf(Number(v.total)) === Number(v.t) },
      { note: 'the missing ones are non-zero, so the blank is a real question', test: (v: Vars) => onesOf(Number(v.total)) > 0 },
    ],
    answer: (v: Vars) => Number(v.o),
    format: { kind: 'integer', min: 1, max: 9, entry: true },
    distractors: ({ vars, answer }) => [Number(answer) + 1, Number(answer) - 1, Number(vars.t)].filter((n) => n !== Number(answer) && n >= 1 && n <= 99).map(String),
    explanation: ({ vars, answer }) => `${vars.total} = ${vars.t} ათეული + ${answer} ერთეული.`,
    visual: (v: Vars) => `${Array.from({ length: Number(v.t) }, tenBar).join(' ')}\n?`,
  }),

  /** Level 3 — count every block in the model (Q8). */
  defineTemplate({
    ...at({ id: 'g1-u10-1-count-blocks', subtopicId: 'ateuli-erteuli-modeli', difficulty: 3 }),
    prompt: 'მოდელზე ათეულების ბოძები და ცალკეული კუბებია. რამდენი კუბია სულ?',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      o: { kind: 'int', min: 1, max: 9 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.o)] },
    },
    constraints: [{ note: 'the digits differ, so swapped digits are a real distractor', test: (v: Vars) => Number(v.t) !== Number(v.o) }],
    answer: (v: Vars) => Number(v.value),
    format: { kind: 'integer', min: 10, max: 99, entry: true },
    distractors: ({ vars, answer }) => nearModel(Number(answer), [Number(vars.t) + Number(vars.o)]).map(String),
    explanation: ({ vars, answer }) => `${vars.t} ათეული (${Number(vars.t) * 10} კუბი) + ${vars.o} კუბი = ${answer} კუბი.`,
    visual: (v: Vars) => modelOf(Number(v.value)),
  }),
];

/* ================================================================== *\
 * U10.2 — რიცხვი მოდელის მიხედვით
 * ================================================================== */

/**
 * From a model to a number, including the two transformations the unit asks
 * for: take one cube away, and find how many are needed to reach the next ten.
 */
const u102: QuestionTemplate[] = [
  /** Level 1 — write the number a model shows (Q9). */
  defineTemplate({
    ...at({ id: 'g1-u10-2-model-to-number', subtopicId: 'modelidan-ricxvi', difficulty: 1 }),
    prompt: 'მოდელზე {t} ათეული და {o} ერთეულია. ჩაწერე რიცხვი.',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      o: { kind: 'int', min: 0, max: 9 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.o)] },
    },
    answer: (v: Vars) => Number(v.value),
    format: { kind: 'integer', min: 10, max: 99, entry: true },
    distractors: ({ vars, answer }) => nearModel(Number(answer), [Number(vars.t) + Number(vars.o)]).map(String),
    explanation: ({ vars, answer }) => `${vars.t} ათეული და ${vars.o} ერთეული = ${answer}.`,
    visual: (v: Vars) => modelOf(Number(v.value)),
  }),

  /** Level 1 — the model in words, pick the number (Q10). */
  defineTemplate({
    ...at({ id: 'g1-u10-2-words-to-number', subtopicId: 'modelidan-ricxvi', difficulty: 1 }),
    prompt: 'რომელი რიცხვია გამოსახული {t} ათეულითა და {o} ერთეულით?',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      o: { kind: 'int', min: 0, max: 9 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.o)] },
    },
    constraints: [{ note: 'the digits differ, so the swapped number is a real distractor', test: (v: Vars) => Number(v.t) !== Number(v.o) }],
    answer: (v: Vars) => Number(v.value),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 3,
    distractors: ({ vars, answer }) => nearModel(Number(answer), [Number(vars.t) + Number(vars.o)]).map(String),
    explanation: ({ vars, answer }) => `${vars.t} × 10 + ${vars.o} = ${answer}.`,
    visual: (v: Vars) => modelOf(Number(v.value)),
  }),

  /** Level 1 — tens only, no ones at all (Q11). */
  defineTemplate({
    ...at({ id: 'g1-u10-2-tens-only', subtopicId: 'modelidan-ricxvi', difficulty: 1 }),
    prompt: 'მოდელზე {t} ათეულია და ერთეულები არ არის. რამდენია ეს რიცხვი?',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10] },
    },
    answer: (v: Vars) => Number(v.value),
    format: { kind: 'integer', min: 10, max: 90, entry: true },
    distractors: ({ vars, answer }) => nearModel(Number(answer), [Number(vars.t)]).map(String),
    explanation: ({ vars, answer }) => `${vars.t} ათეული = ${answer}.`,
    visual: (v: Vars) => modelOf(Number(v.value)),
  }),

  /** Level 2 — take one cube away from the model (Q12). */
  defineTemplate({
    ...at({ id: 'g1-u10-2-one-less', subtopicId: 'modelidan-ricxvi', difficulty: 2 }),
    prompt: 'მოდელზე {t} ათეული და {o} ერთეულია. რომელი რიცხვი იქნება, თუ ერთეულების ერთ კუბს მოვაშორებთ?',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      o: { kind: 'int', min: 1, max: 9 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.o)] },
      after: { kind: 'choice', values: (v: Vars) => [Number(v.value) - 1] },
    },
    constraints: [{ note: 'the ones digit stays positive, so no ten is broken', test: (v: Vars) => Number(v.o) >= 2 }],
    answer: (v: Vars) => Number(v.after),
    format: { kind: 'integer', min: 10, max: 98, entry: true },
    distractors: ({ vars, answer }) => nearModel(Number(answer), [Number(vars.value) + 1, Number(vars.value)]).map(String),
    explanation: ({ vars, answer }) => `${wordsOf(Number(vars.value))}: ერთი კუბი ნაკლებია ${answer}.`,
    visual: (v: Vars) => modelOf(Number(v.value)),
  }),

  /** Level 2 — how many to add to reach the next full ten (Q13). */
  defineTemplate({
    ...at({ id: 'g1-u10-2-up-to-next-ten', subtopicId: 'modelidan-ricxvi', difficulty: 2 }),
    prompt: 'მოდელზე {t} ათეული და {o} ერთეულია. რამდენი ერთეული უნდა დავამატოთ, რომ მივიღოთ შემდეგი სრული ათეული?',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      o: { kind: 'int', min: 1, max: 8 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.o)] },
      answer: { kind: 'choice', values: (v: Vars) => [10 - Number(v.o)] },
    },
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 1, max: 9, entry: true },
    distractors: ({ vars, answer }) => [Number(vars.o), Number(answer) + 1, Number(answer) - 1].filter((n) => n !== Number(answer) && n >= 1 && n <= 9).map(String),
    explanation: ({ vars, answer }) => `${vars.o} + ${answer} = 10, ამიტომ კიდევ ${answer} ერთეულია საჭირო.`,
    visual: (v: Vars) => modelOf(Number(v.value)),
  }),

  /** Level 3 — ten more, which is a further ten bar, not a further cube (Q14). */
  defineTemplate({
    ...at({ id: 'g1-u10-2-ten-more', subtopicId: 'modelidan-ricxvi', difficulty: 3 }),
    prompt: 'მოდელზე {n} გამოსახულია. აირჩიე რიცხვი, რომელიც 10-ით მეტია გამოსახულ რიცხვზე.',
    variables: {
      n: { kind: 'int', min: 10, max: 89 },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.n) + 10] },
    },
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 20, max: 99 },
    optionCount: 3,
    distractors: ({ vars, answer }) => nearModel(Number(answer), [Number(vars.n) + 1, Number(vars.n)]).map(String),
    explanation: ({ vars, answer }) => `${vars.n} + 10 = ${answer}: ათეულების რაოდენობა ერთით იზრდება, ერთეულები არ იცვლება.`,
    visual: (v: Vars) => modelOf(Number(v.n)),
  }),

  /** Level 3 — add ten ones to a model (Q15). */
  defineTemplate({
    ...at({ id: 'g1-u10-2-add-ten-ones', subtopicId: 'modelidan-ricxvi', difficulty: 3 }),
    prompt: 'მოდელზე ორნიშნა რიცხვია — {n}. მას 10 ერთეული დავუმატეთ. რა რიცხვი მივიღეთ?',
    variables: {
      n: { kind: 'int', min: 10, max: 89 },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.n) + 10] },
    },
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 20, max: 99, entry: true },
    distractors: ({ vars, answer }) => nearModel(Number(answer), [Number(vars.n) + 1, Number(vars.n)]).map(String),
    explanation: ({ vars, answer }) => `10 ერთეული = 1 ათეული, ამიტომ ${vars.n} + 10 = ${answer}.`,
    visual: (v: Vars) => modelOf(Number(v.n)),
  }),

  /** Level 3 — two models side by side, which number is larger (Q16). */
  defineTemplate({
    ...at({ id: 'g1-u10-2-which-model-larger', subtopicId: 'modelidan-ricxvi', difficulty: 3 }),
    prompt: 'ორი მოდელია მოცემული. პირველი: {t1} ათეული და {o1} ერთეული. მეორე: {t2} ათეული და {o2} ერთეული. რომელი რიცხვია მეტი?',
    variables: {
      t1: { kind: 'int', min: 1, max: 8 },
      o1: { kind: 'int', min: 0, max: 9 },
      t2: { kind: 'int', min: 1, max: 9 },
      o2: { kind: 'int', min: 0, max: 9 },
      first: { kind: 'choice', values: (v: Vars) => [Number(v.t1) * 10 + Number(v.o1)] },
      second: { kind: 'choice', values: (v: Vars) => [Number(v.t2) * 10 + Number(v.o2)] },
    },
    constraints: [
      { note: 'the two numbers differ', test: (v: Vars) => Number(v.first) !== Number(v.second) },
      {
        // The tens must decide it: if the tens are equal the question is about
        // the ones, which is a different skill (and U10.2 has it separately).
        // Here the comparison is the one six-year-olds must get right first.
        note: 'the tens decide the comparison, so counting ones is not enough',
        test: (v: Vars) => Number(v.t1) !== Number(v.t2),
      },
      { note: 'the answer is not printed as one of the two numbers in order', test: (v: Vars) => Number(v.first) > 0 && Number(v.second) > 0 },
    ],
    answer: (v: Vars) => Math.max(Number(v.first), Number(v.second)),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 3,
    distractors: ({ vars, answer }) => [Math.min(Number(vars.first), Number(vars.second)), Number(answer) + 1].filter((n) => n !== Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.first} და ${vars.second}: ათეულები რომ შევადაროთ, მეტია ${answer}.`,
    visual: (v: Vars) => `პირველი:\n${modelOf(Number(v.first))}\n\nმეორე:\n${modelOf(Number(v.second))}`,
  }),
];

/* ================================================================== *\
 * U10.3 — მოდელის შექმნა რიცხვის მიხედვით
 * ================================================================== */

/**
 * From a number to a model: the reverse direction, and the one where the
 * *picture* is the answer.
 */
const u103: QuestionTemplate[] = [
  /** Level 1 — pick the model that shows 34 (Q17). */
  defineTemplate({
    ...at({ id: 'g1-u10-3-number-to-model', subtopicId: 'ricxvidan-modeli', difficulty: 1 }),
    prompt: 'რიცხვია {n}. აირჩიე შესაბამისი მოდელი.',
    variables: {
      n: { kind: 'int', min: 10, max: 99 },
    },
    constraints: [
      { note: 'both digits are non-zero, so every model differs visibly', test: (v: Vars) => tensOf(Number(v.n)) > 0 && onesOf(Number(v.n)) > 0 },
      { note: 'the digits differ, so the swapped model is distinguishable', test: (v: Vars) => tensOf(Number(v.n)) !== onesOf(Number(v.n)) },
    ],
    answer: (v: Vars) => compact(Number(v.n)),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => modelOptions(Number(vars.n)).filter((option) => option !== String(answer)),
    explanation: ({ vars }) => `${vars.n} = ${wordsOf(Number(vars.n))}.`,
    hint: '🟦 არის ათეული, 🟨 — ერთეული.',
  }),

  /** Level 1 — a round ten, how many tens and how many ones to draw (Q18). */
  defineTemplate({
    ...at({ id: 'g1-u10-3-round-draw', subtopicId: 'ricxvidan-modeli', difficulty: 1 }),
    prompt: 'რიცხვია {n}. რამდენი ათეული და რამდენი ერთეული უნდა დავხატოთ? ჩაწერე მძიმით.',
    variables: {
      n: { kind: 'int', min: 10, max: 90 },
      t: { kind: 'choice', values: (v: Vars) => [tensOf(Number(v.n))] },
    },
    constraints: [{ note: 'the number is a whole ten, so its ones are zero', test: (v: Vars) => onesOf(Number(v.n)) === 0 }],
    answer: (v: Vars) => `${v.t}, 0`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [`${vars.t}, 1`, `0, ${vars.t}`],
    explanation: ({ vars }) => `${vars.n} არის ${vars.t} ათეული და 0 ერთეული.`,
    visual: (v: Vars) => modelOf(Number(v.n)),
  }),

  /** Level 1 — build the model for 28 (Q19). */
  defineTemplate({
    ...at({ id: 'g1-u10-3-build-model', subtopicId: 'ricxvidan-modeli', difficulty: 1 }),
    prompt: 'შექმენი მოდელი რიცხვისთვის {n}: რამდენი ათეული და რამდენი ერთეულია საჭირო?',
    variables: {
      n: { kind: 'int', min: 10, max: 99 },
      t: { kind: 'choice', values: (v: Vars) => [tensOf(Number(v.n))] },
      o: { kind: 'choice', values: (v: Vars) => [onesOf(Number(v.n))] },
    },
    constraints: [
      { note: 'both digits are non-zero', test: (v: Vars) => tensOf(Number(v.n)) > 0 && onesOf(Number(v.n)) > 0 },
      { note: 'the digits differ, so swapping them is a real mistake', test: (v: Vars) => tensOf(Number(v.n)) !== onesOf(Number(v.n)) },
    ],
    answer: (v: Vars) => `${v.t}, ${v.o}`,
    format: { kind: 'text' },
    optionCount: 3,
    // Neither wrong option drops a part quietly: one swaps the digits, the
    // other keeps the right ones count but puts it in the tens place.
    distractors: ({ vars }) => [`${vars.o}, ${vars.t}`, `${vars.o}, 0`],
    explanation: ({ vars }) => `${vars.n} = ${vars.t} ათეული + ${vars.o} ერთეული.`,
  }),

  /** Level 2 — which model matches 51 (Q20). */
  defineTemplate({
    ...at({ id: 'g1-u10-3-choose-matching', subtopicId: 'ricxvidan-modeli', difficulty: 2 }),
    prompt: 'რომელი მოდელი შეესაბამება რიცხვს {n}?',
    variables: {
      n: { kind: 'int', min: 10, max: 99 },
    },
    constraints: [
      { note: 'both digits are non-zero, so the picture has both parts', test: (v: Vars) => tensOf(Number(v.n)) > 0 && onesOf(Number(v.n)) > 0 },
      { note: 'the digits differ, so the swapped model is distinguishable', test: (v: Vars) => tensOf(Number(v.n)) !== onesOf(Number(v.n)) },
    ],
    answer: (v: Vars) => compact(Number(v.n)),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => modelOptions(Number(vars.n)).filter((option) => option !== String(answer)),
    explanation: ({ vars }) => `${vars.n} = ${wordsOf(Number(vars.n))}.`,
    hint: '🟦 არის ათეული, 🟨 — ერთეული.',
  }),

  /** Level 2 — the model is one ten short; complete it (Q21). */
  defineTemplate({
    ...at({ id: 'g1-u10-3-complete-model', subtopicId: 'ricxvidan-modeli', difficulty: 2 }),
    prompt: 'რიცხვის მოდელს ერთი ათეული აკლია. საწყისი რიცხვია {n}. რამდენი ათეული და რამდენი ერთეული უნდა იყოს მოდელში, რომ ზუსტად {n} მივიღოთ?',
    variables: {
      n: { kind: 'int', min: 20, max: 99 },
      t: { kind: 'choice', values: (v: Vars) => [tensOf(Number(v.n))] },
      o: { kind: 'choice', values: (v: Vars) => [onesOf(Number(v.n))] },
    },
    constraints: [
      { note: 'there is more than one ten, so a ten really can be missing', test: (v: Vars) => tensOf(Number(v.n)) >= 2 },
      { note: 'the ones are non-zero, so the answer names both parts', test: (v: Vars) => onesOf(Number(v.n)) > 0 },
      { note: 'the digits differ, so swapping them is a real mistake', test: (v: Vars) => tensOf(Number(v.n)) !== onesOf(Number(v.n)) },
    ],
    answer: (v: Vars) => `${v.t}, ${v.o}`,
    format: { kind: 'text' },
    optionCount: 3,
    // The short model is exactly the mistake: one ten too few.
    distractors: ({ vars }) => [`${Number(vars.t) - 1}, ${vars.o}`, `${vars.t}, ${Number(vars.o) + 1}`],
    explanation: ({ vars }) => `${vars.n} = ${vars.t} ათეული + ${vars.o} ერთეული.`,
    visual: (v: Vars) => `${Array.from({ length: Number(v.t) - 1 }, tenBar).join(' ')}\n${Number(v.o) > 0 ? draw(ONE, Number(v.o)) : '—'}`,
  }),

  /** Level 2 — build a number from its tens and ones (Q22). */
  defineTemplate({
    ...at({ id: 'g1-u10-3-make-number', subtopicId: 'ricxvidan-modeli', difficulty: 2 }),
    prompt: 'შექმენი რიცხვი, რომელსაც აქვს {t} ათეული და {o} ერთეული.',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      o: { kind: 'int', min: 0, max: 9 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.o)] },
    },
    constraints: [{ note: 'the digits differ, so swapped digits are a real mistake', test: (v: Vars) => Number(v.t) !== Number(v.o) }],
    answer: (v: Vars) => Number(v.value),
    format: { kind: 'integer', min: 10, max: 99, entry: true },
    distractors: ({ vars, answer }) => nearModel(Number(answer), [Number(vars.t) + Number(vars.o)]).map(String),
    explanation: ({ vars, answer }) => `${vars.t} ათეული და ${vars.o} ერთეული = ${answer}.`,
  }),

  /** Level 3 — the same number drawn two ways (Q23). */
  defineTemplate({
    ...at({ id: 'g1-u10-3-two-ways', subtopicId: 'ricxvidan-modeli', difficulty: 3 }),
    prompt: 'რიცხვი {n} გამოსახე ორი განსხვავებული მოდელით. პირველში ათეულები და ერთეულები გამოიყენე, მეორეში — მხოლოდ ერთეულები. რამდენი ერთეულია მეორე მოდელში?',
    variables: {
      n: { kind: 'int', min: 10, max: 99 },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.n)] },
    },
    constraints: [{ note: 'the number has tens, so the two models really differ', test: (v: Vars) => tensOf(Number(v.n)) >= 1 }],
    // The second model holds exactly as many ones as the number, so the answer
    // is the number itself — the *point* is that it takes that many cubes, which
    // the picture shows grouped rather than as a hundred separate glyphs.
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 10, max: 99, entry: true },
    distractors: ({ vars, answer }) => [tensOf(Number(vars.n)), onesOf(Number(vars.n)), Number(answer) + 10].filter((n) => n !== Number(answer) && n > 0).map(String),
    explanation: ({ vars, answer }) => `${vars.n} არის ${wordsOf(Number(vars.n))}; მხოლოდ ერთეულებით იგივე ${answer} კუბია, დაჯგუფებული ათულად.`,
    visual: (v: Vars) => `პირველი მოდელი:\n${modelOf(Number(v.n))}\n\nმეორე მოდელი (მხოლოდ ერთეულები):\n${grouped(Number(v.n))}`,
  }),

  /** Level 3 — a model that is one ten short of the number (Q24). */
  defineTemplate({
    ...at({ id: 'g1-u10-3-ten-short', subtopicId: 'ricxvidan-modeli', difficulty: 3 }),
    prompt: 'მოცემულია რიცხვი {n}. აირჩიე მოდელი, რომელსაც ერთი ათეული აკლია.',
    variables: {
      n: { kind: 'int', min: 20, max: 99 },
      short: { kind: 'choice', values: (v: Vars) => [Number(v.n) - 10] },
    },
    constraints: [{ note: 'the number has at least two tens, so one can be missing', test: (v: Vars) => tensOf(Number(v.n)) >= 2 }],
    answer: (v: Vars) => compact(Number(v.short)),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) =>
      [compact(Number(vars.n)), compact(Number(vars.n) - 1), compact(Number(vars.n) + 10), compact(Number(vars.n) - 11)].filter(
        (option, index, all) => option !== String(answer) && all.indexOf(option) === index,
      ),
    explanation: ({ vars }) => `${vars.n} − 10 = ${vars.short}, ანუ ${wordsOf(Number(vars.short))}.`,
    hint: '🟦 არის ათეული, 🟨 — ერთეული.',
  }),
];

/* ================================================================== *\
 * U10.4 — ათეულების გადაყვანა ერთეულებად და პირიქით
 * ================================================================== */

/**
 * The conversion: a ten is ten ones, and ten ones are a ten.
 *
 * Q31 and Q48 ask the same hard thing — a count written as „6 tens **and 13
 * ones**“, where the ones exceed ten and must be regrouped. That is the step
 * this subtopic exists for, so both are kept and treated as the same family,
 * with the tens and the extra ones both drawn.
 */
const u104: QuestionTemplate[] = [
  /** Level 1 — three tens is how many ones (Q25). */
  defineTemplate({
    ...at({ id: 'g1-u10-4-tens-to-ones', subtopicId: 'ateulidan-erteulebamde', difficulty: 1 }),
    prompt: 'მოდელზე {t} ათეულია. ეს რამდენ ერთეულს უდრის?',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10] },
    },
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 10, max: 90, entry: true },
    // The canonical mistake is printing the tens count itself.
    distractors: ({ vars, answer }) => [Number(vars.t), Number(answer) + 10, Number(answer) - 10].filter((n) => n !== Number(answer) && n > 0).map(String),
    explanation: ({ vars, answer }) => `${vars.t} × 10 = ${answer} ერთეული.`,
    visual: (v: Vars) => Array.from({ length: Number(v.t) }, tenBar).join(' '),
  }),

  /** Level 1 — fifty ones is how many tens (Q26). */
  defineTemplate({
    ...at({ id: 'g1-u10-4-ones-to-tens', subtopicId: 'ateulidan-erteulebamde', difficulty: 1 }),
    prompt: 'მოდელზე {n} ერთეულია, დაჯგუფებული ათულად. რამდენ სრულ ათეულს უდრის?',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      // A remainder of loose ones widens the level beyond nine questions, and
      // is the real distinction the question asks about: 72 ones is seven whole
      // tens *and two left over*, so the answer stays seven.
      extra: { kind: 'choice', values: [0, 0, 1, 2, 3, 4, 5] },
      n: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.extra)] },
    },
    constraints: [{ note: 'the remainder stays below a ten, so it makes no whole ten', test: (v: Vars) => Number(v.extra) <= 9 }],
    answer: (v: Vars) => Number(v.t),
    format: { kind: 'integer', min: 1, max: 9, entry: true },
    distractors: ({ vars, answer }) => [Number(vars.n), Number(answer) + 1, Number(answer) - 1].filter((n) => n !== Number(answer) && n >= 1).map(String),
    explanation: ({ vars, answer }) => `${vars.n} ÷ 10 = ${answer} ათეული.`,
    // `grouped(n)` already ends with the remainder as its own group, so the
    // loose ones must not be drawn a second time.
    visual: (v: Vars) => grouped(Number(v.n)),
  }),

  /**
   * Level 1 — match a tens count to its ones (Q27).
   *
   * The specification's shape is „2 tens ↔ 20 ones, 5 ↔ 50, 8 ↔ 80“. Pairing
   * four rows cannot be marked by the runner, which takes one answer, so the
   * matching is asked one row at a time: a tens count and four ones counts, of
   * which exactly one is its value. The knowledge tested is identical — a ten
   * is ten ones — and the options are the neighbouring tens, so a student who
   * counts in tens rather than remembering the pair still has to be right.
   */
  defineTemplate({
    ...at({ id: 'g1-u10-4-match-tens-to-ones', subtopicId: 'ateulidan-erteulebamde', difficulty: 1 }),
    prompt: '{t} ათეული რომელ ერთეულთა რაოდენობას შეესაბამება?',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10] },
      gap: { kind: 'choice', values: [10, 20] },
    },
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 10, max: 90 },
    optionCount: 3,
    // The neighbouring tens, never a random number: „5 tens is 50, or 40, or
    // 60“ is a question about tens; „50, or 37, or 12“ is not.
    distractors: ({ vars, answer }) => [Number(answer) + Number(vars.gap), Number(answer) - Number(vars.gap)].filter((n) => n !== Number(answer) && n >= 10 && n <= 90).map(String),
    explanation: ({ vars, answer }) => `${vars.t} × 10 = ${answer} ერთეული.`,
    visual: (v: Vars) => Array.from({ length: Number(v.t) }, tenBar).join(' '),
  }),

  /** Level 2 — how many ones are in 6 tens and 4 ones (Q28). */
  defineTemplate({
    ...at({ id: 'g1-u10-4-tens-and-ones-total', subtopicId: 'ateulidan-erteulebamde', difficulty: 2 }),
    prompt: 'რამდენი ერთეულია {t} ათეულსა და {o} ერთეულში?',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      o: { kind: 'int', min: 1, max: 9 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.o)] },
    },
    constraints: [{ note: 'the digits differ, so swapped digits are a real distractor', test: (v: Vars) => Number(v.t) !== Number(v.o) }],
    answer: (v: Vars) => Number(v.value),
    format: { kind: 'integer', min: 11, max: 99, entry: true },
    distractors: ({ vars, answer }) => nearModel(Number(answer), [Number(vars.t) + Number(vars.o)]).map(String),
    explanation: ({ vars, answer }) => `${vars.t} × 10 + ${vars.o} = ${answer} ერთეული.`,
    visual: (v: Vars) => modelOf(Number(v.value)),
  }),

  /** Level 2 — 37 ones is how many tens and how many ones (Q29). */
  defineTemplate({
    ...at({ id: 'g1-u10-4-ones-to-tens-and-ones', subtopicId: 'ateulidan-erteulebamde', difficulty: 2 }),
    prompt: '{n} ერთეული რამდენი ათეული და რამდენი ერთეულია? ჩაწერე მძიმით.',
    variables: {
      n: { kind: 'int', min: 10, max: 99 },
      t: { kind: 'choice', values: (v: Vars) => [tensOf(Number(v.n))] },
      o: { kind: 'choice', values: (v: Vars) => [onesOf(Number(v.n))] },
    },
    constraints: [
      { note: 'both parts are non-zero, so the answer names both', test: (v: Vars) => Number(v.t) > 0 && Number(v.o) > 0 },
      { note: 'the digits differ, so swapping them is a real mistake', test: (v: Vars) => Number(v.t) !== Number(v.o) },
    ],
    answer: (v: Vars) => `${v.t}, ${v.o}`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [`${vars.o}, ${vars.t}`, `${Number(vars.t) + 1}, ${Number(vars.o) - 1}`].filter((option, index, all) => all.indexOf(option) === index && option !== `${vars.t}, ${vars.o}`),
    explanation: ({ vars }) => `${vars.n} = ${vars.t} ათეული + ${vars.o} ერთეული.`,
    visual: (v: Vars) => grouped(Number(v.n)),
  }),

  /** Level 2 — how many ones to add to four tens to make 47 (Q30). */
  defineTemplate({
    ...at({ id: 'g1-u10-4-add-to-tens', subtopicId: 'ateulidan-erteulebamde', difficulty: 2 }),
    prompt: '{t} ათეულს რამდენი ერთეული უნდა დავუმატოთ, რომ {n} ერთეული მივიღოთ?',
    variables: {
      t: { kind: 'int', min: 1, max: 8 },
      n: { kind: 'int', min: 11, max: 99 },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.n) - Number(v.t) * 10] },
    },
    constraints: [
      { note: 'the target exceeds the tens, so the answer is positive', test: (v: Vars) => Number(v.n) > Number(v.t) * 10 },
      { note: 'the target keeps the same tens, so the question is about ones', test: (v: Vars) => tensOf(Number(v.n)) === Number(v.t) },
      { note: 'the answer is not zero', test: (v: Vars) => onesOf(Number(v.n)) > 0 },
    ],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 1, max: 9, entry: true },
    distractors: ({ vars, answer }) => [Number(vars.n) - Number(vars.t), Number(answer) + 1].filter((n) => n !== Number(answer) && n > 0).map(String),
    explanation: ({ vars, answer }) => `${vars.n} − ${Number(vars.t) * 10} = ${answer} ერთეული.`,
    visual: (v: Vars) => Array.from({ length: Number(v.t) }, tenBar).join(' '),
  }),

  /** Level 3 — 6 tens and 13 ones, where the ones must be regrouped (Q31). */
  defineTemplate({
    ...at({ id: 'g1-u10-4-regroup', subtopicId: 'ateulidan-erteulebamde', difficulty: 3 }),
    prompt: '{t} ათეული და {extra} ერთეული რამდენი ერთეულია სულ?',
    variables: {
      t: { kind: 'int', min: 1, max: 8 },
      extra: { kind: 'int', min: 10, max: 19 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.extra)] },
    },
    constraints: [{ note: 'the total stays inside one hundred', test: (v: Vars) => Number(v.value) <= 99 }],
    answer: (v: Vars) => Number(v.value),
    format: { kind: 'integer', min: 11, max: 99, entry: true },
    // The mistake is treating the extra ones as a single digit and losing ten.
    distractors: ({ vars, answer }) => [Number(vars.t) * 10 + onesOf(Number(vars.extra)), Number(vars.t) + Number(vars.extra), Number(answer) + 10].filter((n) => n !== Number(answer) && n > 0 && n <= 99).map(String),
    explanation: ({ vars, answer }) => `${vars.extra} ერთეული = 10 ერთეული და ${onesOf(Number(vars.extra))}, ამიტომ სულ ${vars.t} ათეული და ${vars.extra} ერთეული = ${answer}.`,
    visual: (v: Vars) => `${Array.from({ length: Number(v.t) }, tenBar).join(' ')} | ${grouped(Number(v.extra))}`,
  }),

  /** Level 3 — 84 ones as tens and ones (Q32). */
  defineTemplate({
    ...at({ id: 'g1-u10-4-split-ones', subtopicId: 'ateulidan-erteulebamde', difficulty: 3 }),
    prompt: '{n} ერთეული წარმოადგინე ათეულებისა და ერთეულების სახით. ჩაწერე მძიმით.',
    variables: {
      n: { kind: 'int', min: 10, max: 99 },
      t: { kind: 'choice', values: (v: Vars) => [tensOf(Number(v.n))] },
      o: { kind: 'choice', values: (v: Vars) => [onesOf(Number(v.n))] },
    },
    constraints: [
      { note: 'both parts are non-zero, so the answer names both', test: (v: Vars) => Number(v.t) > 0 && Number(v.o) > 0 },
      { note: 'the digits differ, so swapping them is a real mistake', test: (v: Vars) => Number(v.t) !== Number(v.o) },
    ],
    answer: (v: Vars) => `${v.t}, ${v.o}`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [`${vars.o}, ${vars.t}`, `${vars.t}, 0`],
    explanation: ({ vars }) => `${vars.n} = ${vars.t} ათეული + ${vars.o} ერთეული.`,
    visual: (v: Vars) => grouped(Number(v.n)),
  }),
];

/* ================================================================== *\
 * U10.5 — საჭირო რაოდენობის პოვნა
 * ================================================================== */

/**
 * Quantity problems: how many are there, how many are missing, how many more.
 *
 * Every one is a *quantity* question — the model is a count of objects, not a
 * number to read — so each is answered by a number the student works out from
 * the situation. Steps never go below zero.
 */
const u105: QuestionTemplate[] = [
  /** Level 1 — three tens of pencils (Q33). */
  defineTemplate({
    ...at({ id: 'g1-u10-5-tens-of-things', subtopicId: 'sawyisi-raodenoba', difficulty: 1 }),
    prompt: 'ყუთში {t} ათეული {item}ა. რამდენი {item}ა ყუთში?',
    variables: {
      item: { kind: 'choice', values: ['ფანქარი', 'რვეული', 'კუბიკი', 'ბურთი', 'ვაშლი'] },
      t: { kind: 'int', min: 1, max: 9 },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10] },
    },
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 10, max: 90, entry: true },
    distractors: ({ vars, answer }) => [Number(vars.t), Number(answer) + 10, Number(answer) - 10].filter((n) => n !== Number(answer) && n > 0).map(String),
    explanation: ({ vars, answer }) => `${vars.t} ათეული = ${answer} ${vars.item}.`,
    visual: (v: Vars) => Array.from({ length: Number(v.t) }, tenBar).join(' '),
  }),

  /** Level 1 — 24 ones, how many are missing to reach 30 (Q34). */
  defineTemplate({
    ...at({ id: 'g1-u10-5-missing-to-next-ten', subtopicId: 'sawyisi-raodenoba', difficulty: 1 }),
    prompt: 'მოდელზე {n} ერთეულია. რამდენი ერთეული აკლია, რომ {target} გახდეს?',
    variables: {
      n: { kind: 'int', min: 11, max: 89 },
      target: { kind: 'choice', values: (v: Vars) => [Math.ceil((Number(v.n) + 1) / 10) * 10] },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.target) - Number(v.n)] },
    },
    constraints: [
      { note: 'the target is the next whole ten and stays under one hundred', test: (v: Vars) => Number(v.target) <= 90 && Number(v.target) % 10 === 0 && Number(v.target) > Number(v.n) },
      { note: 'the number is not already a whole ten', test: (v: Vars) => onesOf(Number(v.n)) > 0 },
      { note: 'the gap is at most nine', test: (v: Vars) => Number(v.answer) >= 1 && Number(v.answer) <= 9 },
    ],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 1, max: 9, entry: true },
    distractors: ({ vars, answer }) => [onesOf(Number(vars.n)), Number(answer) + 1, Number(answer) - 1].filter((n) => n !== Number(answer) && n >= 1 && n <= 9).map(String),
    explanation: ({ vars, answer }) => `${vars.n} + ${answer} = ${vars.target}.`,
    visual: (v: Vars) => modelOf(Number(v.n)),
  }),

  /** Level 1 — two tens of red and five blue (Q35). */
  defineTemplate({
    ...at({ id: 'g1-u10-5-two-colours', subtopicId: 'sawyisi-raodenoba', difficulty: 1 }),
    prompt: 'კალათაში {t} ათეული წითელი {item} და {o} ლურჯი {item}ა. რამდენი {item}ა სულ?',
    variables: {
      item: { kind: 'choice', values: ['ბურთი', 'ვაშლი', 'კუბიკი'] },
      t: { kind: 'int', min: 1, max: 9 },
      o: { kind: 'int', min: 1, max: 9 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.o)] },
    },
    constraints: [{ note: 'the digits differ, so swapped digits are a real distractor', test: (v: Vars) => Number(v.t) !== Number(v.o) }],
    answer: (v: Vars) => Number(v.value),
    format: { kind: 'integer', min: 11, max: 99, entry: true },
    distractors: ({ vars, answer }) => nearModel(Number(answer), [Number(vars.t) + Number(vars.o)]).map(String),
    explanation: ({ vars, answer }) => `${vars.t} ათეული + ${vars.o} = ${answer} ${vars.item}.`,
    // Red tens and blue ones, so the two groups in the sentence are the two
    // groups in the picture.
    visual: (v: Vars) =>
      `${Array.from({ length: Number(v.t) }, () => tenBar('🔴')).join(' ')} | ${draw('🔵', Number(v.o))}`,
  }),

  /** Level 2 — 35 cubes, how many to remove to leave 20 (Q36). */
  defineTemplate({
    ...at({ id: 'g1-u10-5-remove-to-target', subtopicId: 'sawyisi-raodenoba', difficulty: 2 }),
    prompt: 'მოდელზე {n} კუბია. რამდენი კუბი უნდა მოვაშოროთ, რომ {target} დარჩეს?',
    variables: {
      n: { kind: 'int', min: 21, max: 99 },
      target: { kind: 'choice', values: (v: Vars) => [Math.floor((Number(v.n) - 1) / 10) * 10] },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.n) - Number(v.target)] },
    },
    constraints: [
      { note: 'the target is a whole ten below the number', test: (v: Vars) => Number(v.target) >= 20 && Number(v.target) % 10 === 0 && Number(v.target) < Number(v.n) },
      { note: 'the number is not already a whole ten, so something is removed', test: (v: Vars) => onesOf(Number(v.n)) > 0 },
      { note: 'what is removed is a sane amount', test: (v: Vars) => Number(v.answer) >= 1 && Number(v.answer) <= 19 },
    ],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 1, max: 19, entry: true },
    distractors: ({ vars, answer }) => [onesOf(Number(vars.n)), Number(answer) + 10, Number(answer) - 10].filter((n) => n !== Number(answer) && n > 0 && n <= 19).map(String),
    explanation: ({ vars, answer }) => `${vars.n} − ${answer} = ${vars.target}.`,
    visual: (v: Vars) => modelOf(Number(v.n)),
  }),

  /** Level 2 — two models, how many more in the second (Q37). */
  defineTemplate({
    ...at({ id: 'g1-u10-5-how-many-more', subtopicId: 'sawyisi-raodenoba', difficulty: 2 }),
    prompt: 'პირველ მოდელზე {a} კუბია, მეორეზე — {b}. რამდენი კუბით მეტია მეორეზე?',
    variables: {
      a: { kind: 'int', min: 10, max: 98 },
      b: { kind: 'int', min: 10, max: 99 },
      answer: { kind: 'choice', values: (v: Vars) => [Math.abs(Number(v.b) - Number(v.a))] },
    },
    constraints: [
      { note: 'the two quantities differ', test: (v: Vars) => Number(v.a) !== Number(v.b) },
      { note: 'the difference is a friendly number to work out', test: (v: Vars) => Math.abs(Number(v.b) - Number(v.a)) <= 30 },
    ],
    // „How many more does the second have“ is asked with the larger not always
    // second, so the answer is the difference, never a negative number.
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 1, max: 30, entry: true },
    distractors: ({ answer }) => [Number(answer) + 1, Number(answer) - 1, Number(answer) + 10].filter((n) => n !== Number(answer) && n > 0).map(String),
    explanation: ({ vars, answer }) => `${Math.max(Number(vars.a), Number(vars.b))} − ${Math.min(Number(vars.a), Number(vars.b))} = ${answer}.`,
    visual: (v: Vars) => `პირველი:\n${modelOf(Number(v.a))}\n\nმეორე:\n${modelOf(Number(v.b))}`,
  }),

  /** Level 2 — four tens, how many ones to reach 46 (Q38). */
  defineTemplate({
    ...at({ id: 'g1-u10-5-add-ones-to-tens', subtopicId: 'sawyisi-raodenoba', difficulty: 2 }),
    prompt: 'მოდელზე {t} ათეულია. რამდენი ერთეული უნდა დაემატოს, რომ სულ {n} გახდეს?',
    variables: {
      t: { kind: 'int', min: 1, max: 8 },
      n: { kind: 'int', min: 11, max: 99 },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.n) - Number(v.t) * 10] },
    },
    constraints: [
      { note: 'the target keeps the printed tens, so only ones are added', test: (v: Vars) => tensOf(Number(v.n)) === Number(v.t) },
      { note: 'the answer is a positive count of ones', test: (v: Vars) => onesOf(Number(v.n)) > 0 },
    ],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 1, max: 9, entry: true },
    distractors: ({ vars, answer }) => [Number(vars.n) - Number(vars.t), Number(answer) + 1].filter((n) => n !== Number(answer) && n > 0).map(String),
    explanation: ({ vars, answer }) => `${vars.n} − ${Number(vars.t) * 10} = ${answer} ერთეული.`,
    visual: (v: Vars) => Array.from({ length: Number(v.t) }, tenBar).join(' '),
  }),

  /** Level 2 — 52 books, ten taken away (Q39). */
  defineTemplate({
    ...at({ id: 'g1-u10-5-take-a-ten', subtopicId: 'sawyisi-raodenoba', difficulty: 2 }),
    prompt: 'თაროზე {n} წიგნია. {k} წიგნი აიღეს. რამდენი წიგნი დარჩა?',
    variables: {
      n: { kind: 'int', min: 21, max: 99 },
      k: { kind: 'choice', values: (v: Vars) => [10 * (1 + (Number(v.n) % 3))] },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.n) - Number(v.k)] },
    },
    constraints: [
      { note: 'the books taken are whole tens and fewer than the total', test: (v: Vars) => Number(v.k) % 10 === 0 && Number(v.k) < Number(v.n) },
      { note: 'the remainder is positive', test: (v: Vars) => Number(v.answer) > 0 },
    ],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 1, max: 89, entry: true },
    distractors: ({ vars, answer }) => [Number(vars.n) + Number(vars.k), Number(answer) + 10, Number(answer) - 10].filter((n) => n !== Number(answer) && n > 0 && n <= 99).map(String),
    explanation: ({ vars, answer }) => `${vars.n} − ${vars.k} = ${answer}: მხოლოდ ათეულები იკლებს.`,
    visual: (v: Vars) => modelOf(Number(v.n)),
  }),

  /** Level 3 — five tens and eight ones, then two more tens (Q40). */
  defineTemplate({
    ...at({ id: 'g1-u10-5-add-tens', subtopicId: 'sawyisi-raodenoba', difficulty: 3 }),
    prompt: 'მოდელზე {t} ათეული და {o} ერთეულია. შემდეგ {extra} ათეული დაემატა. რამდენი ერთეულია ახლა?',
    variables: {
      t: { kind: 'int', min: 1, max: 7 },
      o: { kind: 'int', min: 0, max: 9 },
      extra: { kind: 'int', min: 1, max: 2 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.o)] },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.value) + Number(v.extra) * 10] },
    },
    constraints: [
      { note: 'the total stays inside one hundred', test: (v: Vars) => Number(v.answer) <= 99 },
      { note: 'the digits differ, so a swapped answer is a real mistake', test: (v: Vars) => Number(v.t) !== Number(v.o) },
    ],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 21, max: 99, entry: true },
    // Adding tens must not touch the ones digit — the central misconception.
    distractors: ({ vars, answer }) => [Number(vars.value) + Number(vars.extra), Number(answer) + 1, Number(answer) - 10].filter((n) => n !== Number(answer) && n > 0 && n <= 99).map(String),
    explanation: ({ vars, answer }) => `${vars.t} + ${vars.extra} = ${Number(vars.t) + Number(vars.extra)} ათეული, ერთეულები იგივე: ${answer}.`,
    visual: (v: Vars) => `${modelOf(Number(v.value))}\n+ ${Array.from({ length: Number(v.extra) }, tenBar).join(' ')}`,
  }),

  /** Level 3 — two models hold 73 together, what is on the second (Q41). */
  defineTemplate({
    ...at({ id: 'g1-u10-5-missing-on-second', subtopicId: 'sawyisi-raodenoba', difficulty: 3 }),
    prompt: 'ორ მოდელზე ერთად {total} კუბია. პირველ მოდელზე {first} კუბია. რამდენი კუბია მეორე მოდელზე?',
    variables: {
      total: { kind: 'int', min: 21, max: 99 },
      first: { kind: 'int', min: 10, max: 89 },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.total) - Number(v.first)] },
    },
    constraints: [
      { note: 'the first model is smaller than the total, so the second is positive', test: (v: Vars) => Number(v.first) < Number(v.total) },
      { note: 'the two models differ, so the subtraction is real', test: (v: Vars) => Number(v.answer) > 0 },
    ],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 1, max: 89, entry: true },
    distractors: ({ vars, answer }) => [Number(vars.first) + Number(vars.total), Number(answer) + 10, Number(answer) - 10].filter((n) => n !== Number(answer) && n > 0 && n <= 99).map(String),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.first} = ${answer}.`,
    visual: (v: Vars) => `სულ: ${v.total}\nპირველი: ${modelOf(Number(v.first))}\nმეორე: ?`,
  }),

  /** Level 3 — 67, take two tens, add four ones (Q42). */
  defineTemplate({
    ...at({ id: 'g1-u10-5-two-steps', subtopicId: 'sawyisi-raodenoba', difficulty: 3 }),
    prompt: 'მოდელზე {n} ერთეულია. ჯერ {tens} ათეული მოაშორეს, შემდეგ {ones} ერთეული დაამატეს. რამდენი ერთეული დარჩა?',
    variables: {
      n: { kind: 'int', min: 30, max: 99 },
      tens: { kind: 'int', min: 1, max: 2 },
      ones: { kind: 'int', min: 0, max: 9 },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.n) - Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [
      { note: 'the tens removed are fewer than the tens printed, so the first step stays positive', test: (v: Vars) => Number(v.n) - Number(v.tens) * 10 > 0 },
      { note: 'the result stays inside one hundred and really changes', test: (v: Vars) => Number(v.answer) >= 0 && Number(v.answer) <= 99 && Number(v.answer) !== Number(v.n) },
      { note: 'adding ones does not undo removing tens', test: (v: Vars) => Number(v.answer) < Number(v.n) },
    ],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 0, max: 99, entry: true },
    distractors: ({ vars, answer }) => [
      Number(vars.n) + Number(vars.tens) * 10 + Number(vars.ones),
      Number(vars.n) - Number(vars.tens) * 10 - Number(vars.ones),
      Number(answer) + 10,
    ].filter((n) => n !== Number(answer) && n >= 0 && n <= 99).map(String),
    explanation: ({ vars, answer }) => `${vars.n} − ${Number(vars.tens) * 10} = ${Number(vars.n) - Number(vars.tens) * 10}, შემდეგ + ${vars.ones} = ${answer}.`,
    visual: (v: Vars) => modelOf(Number(v.n)),
  }),
];

/* ================================================================== *\
 * შერეული გამეორება — mixed review, folded into the families above
 * ================================================================== */

/**
 * Q43–Q50 are the unit's review set. They are not given a subtopic of their
 * own: the curriculum has five, and every review item is a further instance of
 * one of them. Each is filed where the *skill* lives, and the mapping document
 * records which Q went where.
 *
 * Four of the eight are already covered by shape (Q43 ≈ U10.1's model reading,
 * Q44 and Q48 ≈ U10.4's conversions, Q45 ≈ U10.1's picture choice), so what is
 * added here is the items that ask a genuinely different question.
 */
const u10Review: QuestionTemplate[] = [
  /** Level 1 — nine tens and two ones (Q43), filed with the model readers. */
  defineTemplate({
    ...at({ id: 'g1-u10-1-review-read', subtopicId: 'ateuli-erteuli-modeli', difficulty: 1 }),
    prompt: 'მოდელზე {t} ათეული და {o} ერთეულია. რომელი რიცხვია?',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      o: { kind: 'int', min: 0, max: 9 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.o)] },
    },
    constraints: [{ note: 'the digits differ, so swapped digits are a real distractor', test: (v: Vars) => Number(v.t) !== Number(v.o) }],
    answer: (v: Vars) => Number(v.value),
    format: { kind: 'integer', min: 10, max: 99, entry: true },
    distractors: ({ vars, answer }) => nearModel(Number(answer), [Number(vars.t) + Number(vars.o)]).map(String),
    explanation: ({ vars, answer }) => `${vars.t} ათეული და ${vars.o} ერთეული = ${answer}.`,
    visual: (v: Vars) => modelOf(Number(v.value)),
  }),

  /** Level 1 — how many tens and ones are in 80 (Q44), filed with the conversion. */
  defineTemplate({
    ...at({ id: 'g1-u10-4-review-round', subtopicId: 'ateulidan-erteulebamde', difficulty: 1 }),
    prompt: 'რიცხვი {n} რამდენ ათეულსა და რამდენ ერთეულს შეიცავს? ჩაწერე მძიმით.',
    variables: {
      n: { kind: 'int', min: 10, max: 90 },
      t: { kind: 'choice', values: (v: Vars) => [tensOf(Number(v.n))] },
      // Drawn as the ones count too, so the same question is asked about a
      // different presentation: sixty is „six tens, no ones“ however you show it.
      as: { kind: 'choice', values: ['model', 'bars', 'words'] },
    },
    constraints: [{ note: 'the number is a whole ten', test: (v: Vars) => onesOf(Number(v.n)) === 0 }],
    answer: (v: Vars) => `${v.t}, 0`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [`${vars.t}, 1`, `0, ${vars.t}`],
    explanation: ({ vars }) => `${vars.n} = ${vars.t} ათეული + 0 ერთეული.`,
    visual: (v: Vars) =>
      v.as === 'bars'
        ? Array.from({ length: Number(v.t) }, tenBar).join(' ')
        : v.as === 'words'
          ? `${v.t} ათეული`
          : modelOf(Number(v.n)),
  }),

  /** Level 2 — match each model to its number (Q45), as four picture options. */
  defineTemplate({
    ...at({ id: 'g1-u10-1-review-match', subtopicId: 'ateuli-erteuli-modeli', difficulty: 2 }),
    prompt: 'აირჩიე რიცხვი, რომელსაც ეს მოდელი ასახავს.',
    variables: {
      n: { kind: 'int', min: 10, max: 99 },
    },
    constraints: [
      { note: 'both digits are non-zero, so the picture shows both parts', test: (v: Vars) => tensOf(Number(v.n)) > 0 && onesOf(Number(v.n)) > 0 },
      { note: 'the digits differ, so swapped digits are distinguishable', test: (v: Vars) => tensOf(Number(v.n)) !== onesOf(Number(v.n)) },
    ],
    answer: (v: Vars) => Number(v.n),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 4,
    distractors: ({ answer }) => nearModel(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${wordsOf(Number(vars.n))} = ${answer}.`,
    visual: (v: Vars) => modelOf(Number(v.n)),
  }),

  /** Level 2 — four tens and nine ones, how many to add to reach 60 (Q46). */
  defineTemplate({
    ...at({ id: 'g1-u10-5-add-to-target', subtopicId: 'sawyisi-raodenoba', difficulty: 2 }),
    prompt: 'მოდელზე {t} ათეული და {o} ერთეულია. რამდენი ერთეული უნდა დავუმატოთ, რომ {target} მივიღოთ?',
    variables: {
      t: { kind: 'int', min: 1, max: 8 },
      o: { kind: 'int', min: 0, max: 9 },
      target: { kind: 'choice', values: (v: Vars) => [Math.ceil((Number(v.t) * 10 + Number(v.o) + 1) / 10) * 10] },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.target) - (Number(v.t) * 10 + Number(v.o))] },
    },
    constraints: [
      { note: 'the target is the next whole ten and stays under one hundred', test: (v: Vars) => Number(v.target) <= 90 && Number(v.target) % 10 === 0 },
      { note: 'the model is not already the target, so the answer is positive', test: (v: Vars) => Number(v.answer) >= 1 },
      { note: 'the gap is a single-digit amount', test: (v: Vars) => Number(v.answer) <= 9 },
    ],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 1, max: 9, entry: true },
    distractors: ({ vars, answer }) => [Number(vars.o), Number(answer) + 1, Number(answer) - 1, Number(vars.target) - Number(vars.t)].filter((n) => n !== Number(answer) && n >= 1 && n <= 99).map(String),
    explanation: ({ vars, answer }) => `${Number(vars.t) * 10 + Number(vars.o)} + ${answer} = ${vars.target}.`,
    visual: (v: Vars) => modelOf(Number(v.t) * 10 + Number(v.o)),
  }),

  /** Level 2 — which model shows ten fewer than 72 (Q47). */
  defineTemplate({
    ...at({ id: 'g1-u10-3-review-ten-less', subtopicId: 'ricxvidan-modeli', difficulty: 2 }),
    prompt: 'რომელი მოდელი აჩვენებს {n}-ზე 10-ით ნაკლებ რაოდენობას?',
    variables: {
      n: { kind: 'int', min: 20, max: 99 },
      short: { kind: 'choice', values: (v: Vars) => [Number(v.n) - 10] },
    },
    constraints: [{ note: 'the number has two or more tens, so ten can be taken', test: (v: Vars) => tensOf(Number(v.n)) >= 2 }],
    answer: (v: Vars) => compact(Number(v.short)),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) =>
      [compact(Number(vars.n)), compact(Number(vars.n) - 1), compact(Number(vars.n) + 10), compact(Number(vars.n) + 1)].filter(
        (option, index, all) => option !== String(answer) && all.indexOf(option) === index,
      ),
    explanation: ({ vars }) => `${vars.n} − 10 = ${vars.short}, ანუ ${wordsOf(Number(vars.short))}.`,
    hint: '🟦 არის ათეული, 🟨 — ერთეული.',
  }),

  /** Level 3 — 5 tens and 12 ones, which must be regrouped (Q48). */
  defineTemplate({
    ...at({ id: 'g1-u10-4-review-extra-ones', subtopicId: 'ateulidan-erteulebamde', difficulty: 3 }),
    prompt: '{t} ათეული და {extra} ერთეული რამდენ ერთეულს უდრის?',
    variables: {
      t: { kind: 'int', min: 1, max: 8 },
      extra: { kind: 'int', min: 10, max: 19 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.extra)] },
    },
    constraints: [{ note: 'the total stays inside one hundred', test: (v: Vars) => Number(v.value) <= 99 }],
    answer: (v: Vars) => Number(v.value),
    format: { kind: 'integer', min: 11, max: 99, entry: true },
    distractors: ({ vars, answer }) => [Number(vars.t) * 10 + onesOf(Number(vars.extra)), Number(vars.t) + Number(vars.extra), Number(answer) - 10].filter((n) => n !== Number(answer) && n > 0 && n <= 99).map(String),
    explanation: ({ vars, answer }) => `${vars.extra} ერთეული = 10 + ${onesOf(Number(vars.extra))}, ამიტომ სულ ${answer} ერთეულია.`,
    visual: (v: Vars) => `${Array.from({ length: Number(v.t) }, tenBar).join(' ')} | ${grouped(Number(v.extra))}`,
  }),

  /** Level 3 — describe 58 by its digits, not by a model (Q49). */
  defineTemplate({
    ...at({ id: 'g1-u10-3-review-description', subtopicId: 'ricxvidan-modeli', difficulty: 3 }),
    prompt: 'რიცხვია {n}. აირჩიე სწორი აღწერა.',
    variables: {
      n: { kind: 'int', min: 10, max: 99 },
      t: { kind: 'choice', values: (v: Vars) => [tensOf(Number(v.n))] },
      o: { kind: 'choice', values: (v: Vars) => [onesOf(Number(v.n))] },
    },
    constraints: [
      { note: 'both digits are non-zero, so the description names both', test: (v: Vars) => Number(v.t) > 0 && Number(v.o) > 0 },
      { note: 'the digits differ, so a swapped description is wrong', test: (v: Vars) => Number(v.t) !== Number(v.o) },
    ],
    answer: (v: Vars) => `${v.t} ათეული და ${v.o} ერთეული`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [`${vars.o} ათეული და ${vars.t} ერთეული`, `${vars.t} ათეული და 0 ერთეული`],
    explanation: ({ vars }) => `${vars.n} = ${vars.t} ათეული + ${vars.o} ერთეული.`,
  }),

  /** Level 3 — six tens and four ones, remove two tens, add three ones (Q50). */
  defineTemplate({
    ...at({ id: 'g1-u10-5-review-two-steps', subtopicId: 'sawyisi-raodenoba', difficulty: 3 }),
    prompt: 'მოდელზე {t} ათეული და {o} ერთეულია. მოაშორე {a} ათეული და დაამატე {b} ერთეული. რამდენი ერთეული იქნება ბოლოს?',
    variables: {
      t: { kind: 'int', min: 2, max: 9 },
      o: { kind: 'int', min: 0, max: 9 },
      a: { kind: 'int', min: 1, max: 2 },
      b: { kind: 'int', min: 1, max: 9 },
      value: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.o)] },
      answer: { kind: 'choice', values: (v: Vars) => [(Number(v.t) - Number(v.a)) * 10 + Number(v.o) + Number(v.b)] },
    },
    constraints: [
      { note: 'the tens removed do not exceed the tens printed', test: (v: Vars) => Number(v.t) - Number(v.a) >= 0 },
      { note: 'the result stays inside one hundred', test: (v: Vars) => Number(v.answer) <= 99 },
      { note: 'something is left after the removal', test: (v: Vars) => (Number(v.t) - Number(v.a)) * 10 + Number(v.o) > 0 },
    ],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 1, max: 99, entry: true },
    distractors: ({ vars, answer }) => [
      (Number(vars.t) - Number(vars.a)) * 10 + Number(vars.o),
      (Number(vars.t) - Number(vars.a)) * 10 + Number(vars.o) - Number(vars.b),
      Number(answer) + 10,
    ].filter((n) => n !== Number(answer) && n > 0 && n <= 99).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.t} − ${vars.a} = ${Number(vars.t) - Number(vars.a)} ათეული, ${vars.o} + ${vars.b} = ${Number(vars.o) + Number(vars.b)} ერთეული: ${answer}.`,
    visual: (v: Vars) => `${modelOf(Number(v.value))}\n− ${Array.from({ length: Number(v.a) }, tenBar).join(' ')}  + ${draw(ONE, Number(v.b))}`,
  }),
];

/* ================================================================== *\
 * Export
 * ================================================================== */

export const U10_TEMPLATES: QuestionTemplate[] = [
  ...u101,
  ...u102,
  ...u103,
  ...u104,
  ...u105,
  ...u10Review,
];

/** Subtopic ids this library is responsible for. */
export const U10_SUBTOPICS = [
  'ateuli-erteuli-modeli',
  'modelidan-ricxvi',
  'ricxvidan-modeli',
  'ateulidan-erteulebamde',
  'sawyisi-raodenoba',
];
