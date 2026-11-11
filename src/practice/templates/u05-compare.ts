import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

/**
 * U05 — შედარება და დალაგება (comparing and ordering).
 *
 * The fifth grade-1 unit. Where U03 counts and U04 reads numbers, this unit is
 * about *relations between numbers*: which is more, how many more, which ten a
 * number is nearest, and what order a set belongs in.
 *
 * Four rules hold the library together:
 *
 *  1. **The sign is the answer, and it is computed.** „4 __ 7“ is `4 < 7`, never
 *     a stored string, so a comparison can never disagree with the numbers
 *     printed beside it.
 *  2. **A picture is drawn from the same numbers the answer is read from.** Two
 *     groups of five stars are drawn from a 5, and „the groups are equal“ is
 *     what the draw says, not a separate fact. A group big enough that counting
 *     it one by one stops being reasonable is drawn as a bar instead.
 *  3. **The level is the work, not the size of the numbers.** Level 1 compares
 *     two numbers or reads two groups; level 2 completes a sign, names the
 *     larger of two, or subtracts to find „how many more“; level 3 works with
 *     several numbers at once — the largest of four, three comparisons, five
 *     numbers in order, or a quantity that has to be made equal.
 *  4. **Rounding has one rule, stated once.** Below five goes down, five and
 *     above goes up — the ordinary rule the unit's own note prescribes.
 *
 * Two answer shapes exist here that the earlier units barely used. **Ordering**
 * is a real answer mode: the student taps the items into sequence and the key is
 * a sequence through the items as they are displayed. The **sign** is a one-
 * character answer, which is why it is always a multiple choice with three
 * options — `>`, `<` and `=` are exactly the three answers that exist.
 */



const grade = 1 as const;
const topicId = 'Sedareba';
const unitId = 'Sedareba';

/**
 * The curriculum address every template in this unit shares.
 *
 * Grade 1, the „შედარება და დალაგება“ topic; only the subtopic and the level are
 * per-template.
 */
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

interface Critter {
  emoji: string;
  /**
   * The singular — and the only form these questions ever print.
   *
   * Georgian uses the singular after a numeral: „7 ვაშლი“, never „7 ვაშლები“.
   * Every sentence in this unit puts a number in front of the noun („არის 5
   * ვაშლი“), so a plural would be ungrammatical in all of them; there is
   * therefore no plural to store.
   */
  name: string;
}

/** Things a group can be made of. Counted, so always printed in the singular. */
const CRITTERS: Critter[] = [
  { emoji: '⭐', name: 'ვარსკვლავი' },
  { emoji: '🍎', name: 'ვაშლი' },
  { emoji: '🎈', name: 'ბუშტი' },
  { emoji: '🐟', name: 'თევზი' },
  { emoji: '🌼', name: 'ყვავილი' },
  { emoji: '⚽', name: 'ბურთი' },
  { emoji: '🍌', name: 'ბანანი' },
  { emoji: '🔔', name: 'ზარი' },
  { emoji: '🍐', name: 'მსხალი' },
  { emoji: '🧁', name: 'კექსი' },
  { emoji: '🟠', name: 'ფორთოხალი' },
  { emoji: '🍪', name: 'ნამცხვარი' },
];

const CRITTER_NAMES = CRITTERS.map((critter) => critter.name);
const critterByName = (name: string): Critter =>
  CRITTERS.find((critter) => critter.name === name) ?? CRITTERS[0];

/** The shapes two groups are built from (Q43) — singular, as after a numeral. */
const SHAPES = [
  { emoji: '●', name: 'წრე' },
  { emoji: '■', name: 'კვადრატი' },
  { emoji: '▲', name: 'სამკუთხედი' },
  { emoji: '◆', name: 'რომბი' },
] as const;

const SHAPE_NAMES = SHAPES.map((shape) => shape.name);
const shapeByName = (name: string): (typeof SHAPES)[number] =>
  SHAPES.find((shape) => shape.name === name) ?? SHAPES[0];

/* ================================================================== *\
 * Small helpers
 * ================================================================== */

const asRun = (numbers: number[]): string => numbers.join(', ');

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index);

/** A drawn `list` variable, read back as numbers. */
const numbersOf = (vars: Vars, key: string): number[] =>
  (vars[key] as Array<number | string>).map(Number);

/**
 * „ანას“ for Ana, „ნინოს“ for Nino.
 *
 * Georgian marks the possessor with an ending that depends on the final vowel,
 * so it is chosen rather than appended blindly: `ნინო` takes `-ს` and `ანა`
 * takes `-ს` after dropping the `ა`. Only the names below are ever used, and
 * each is stored with the form the sentences need — nothing is glued together
 * at generation time.
 */
interface Named {
  name: string;
  /** „ანას“ — the form that means "Ana's". */
  whose: string;
}

const CHILDREN: Named[] = [
  { name: 'ანა', whose: 'ანას' },
  { name: 'ლუკა', whose: 'ლუკას' },
  { name: 'ნინო', whose: 'ნინოს' },
  { name: 'გიორგი', whose: 'გიორგის' },
  { name: 'მარიამი', whose: 'მარიამის' },
  { name: 'დავითი', whose: 'დავითის' },
  { name: 'სოფო', whose: 'სოფოს' },
  { name: 'ბექა', whose: 'ბექას' },
];

const NAMES = CHILDREN.map((child) => child.name);
const whoseOf = (name: string): string =>
  CHILDREN.find((child) => child.name === name)?.whose ?? name;

/** A row of one emoji, one space between objects. */
const draw = (emoji: string, count: number): string =>
  Array.from({ length: count }, () => emoji).join(' ');

/**
 * One group drawn as a row, with its own label above it.
 *
 * At a glance the eye compares two rows far faster than it counts them — which
 * is the point of a comparison question — but past about twenty objects a row
 * of emoji stops being countable and the *count* is printed instead. Either
 * way the picture is built from the number the answer is read from.
 */
const drawGroup = (label: string, emoji: string, count: number): string => {
  // A group of zero is *said* to be empty. Printing nothing after the label
  // reads as a missing picture rather than as „there are none“.
  if (count === 0) return `${label}: ცარიელია`;
  return count <= 20 ? `${label}: ${draw(emoji, count)}` : `${label}: ${count}`;
};

/** Two groups, one above the other, with their labels. */
const drawTwoGroups = (
  first: { label: string; emoji: string; count: number },
  second: { label: string; emoji: string; count: number },
): string => `${drawGroup(first.label, first.emoji, first.count)}\n${drawGroup(second.label, second.emoji, second.count)}`;

/** The sign that goes between two numbers. */
const signOf = (a: number, b: number): string => (a > b ? '>' : a < b ? '<' : '=');

/**
 * The ten a number is nearest to, by the unit's stated rule: a units digit of
 * 0–4 rounds down, 5–9 rounds up.
 *
 * One rule in one place. The half-way case (5) is the one that has to be
 * decided once and never re-decided per question, and 95 → 100 rather than 90
 * is the same rule rather than an exception.
 */
export const nearestTen = (n: number): number => {
  const units = n % 10;
  const tens = n - units;
  return units >= 5 ? tens + 10 : tens;
};

/** The tens either side of a number, below and above. */
const tensAround = (n: number): [number, number] => {
  const below = Math.floor(n / 10) * 10;
  return [below, below + 10];
};

/**
 * A number that is not already a ten, so "nearest ten" is a real question.
 *
 * 30 rounds to 30, which asks nothing; the templates that round exclude exact
 * tens rather than offer a question with no choice in it.
 */
const NOT_A_TEN = (value: number): boolean => value % 10 !== 0;

/* ================================================================== *\
 * U05.1 — მეტი, ნაკლები, ტოლი
 * ================================================================== */

const u051: QuestionTemplate[] = [
  /**
   * Level 1 — the sign between two numbers (Q1).
   *
   * The numbers are printed in the prompt and the answer is computed from them,
   * so the question cannot disagree with itself. All three signs are offered,
   * because all three are the answer to some draw.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-1-sign', subtopicId: 'meti-naklebi-toli', difficulty: 1 }),
    prompt: 'შეადარე ორი რაოდენობა. რომელი ნიშანი უნდა ჩავსვათ: {a} __ {b}?',
    variables: {
      item: { kind: 'choice', values: CRITTER_NAMES },
      a: { kind: 'int', min: 0, max: 10 },
      b: { kind: 'int', min: 0, max: 10 },
    },
    answer: (v: Vars) => signOf(Number(v.a), Number(v.b)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const [a, b] = [Number(vars.a), Number(vars.b)];
      return ['>', '<', '='].filter((sign) => sign !== signOf(a, b));
    },
    explanation: ({ vars, answer }) =>
      `${vars.a} ${answer} ${vars.b}${answer === '=' ? ' — რაოდენობები ტოლია' : ''}.`,
    // The quantities are drawn, and the counts are the same ones the answer is
    // computed from — an empty group is drawn as an empty label rather than a
    // gap, so „0“ is visible rather than inferred.
    visual: (v: Vars) => {
      const item = critterByName(String(v.item));
      return drawTwoGroups(
        { label: 'პირველი რაოდენობა', emoji: item.emoji, count: Number(v.a) },
        { label: 'მეორე რაოდენობა', emoji: item.emoji, count: Number(v.b) },
      );
    },
  }),

  /**
   * Level 1, second answer shape — two groups, which is larger (Q2).
   *
   * The groups are *drawn*, and the answer is read from the same counts that
   * drew them. „Equal“ is one of the three options because two equal groups is
   * a possible draw and a child has to be able to say so.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-1-two-groups', subtopicId: 'meti-naklebi-toli', difficulty: 1 }),
    prompt: 'შეადარე ორი ჯგუფი. რომელია სწორი?',
    variables: {
      item: { kind: 'choice', values: CRITTER_NAMES },
      mode: { kind: 'choice', values: ['more', 'less', 'equal'] },
      base: { kind: 'int', min: 1, max: 9 },
      gap: { kind: 'choice', values: [0, 1, 2, 3] },
      firstHasMore: { kind: 'choice', values: ['yes', 'no'] },
      first: {
        kind: 'choice',
        values: (v: Vars) => {
          const gap = v.mode === 'equal' ? 0 : Number(v.gap) || 1;
          const base = Number(v.base);
          return [v.firstHasMore === 'yes' ? base + gap : base];
        },
      },
      second: {
        kind: 'choice',
        values: (v: Vars) => {
          const gap = v.mode === 'equal' ? 0 : Number(v.gap) || 1;
          const base = Number(v.base);
          return [v.firstHasMore === 'yes' ? base : base + gap];
        },
      },
    },
    constraints: [
      {
        note: 'an equal draw really is equal, and an unequal one really differs',
        test: (v: Vars) =>
          v.mode === 'equal'
            ? v.first === v.second
            : v.first !== v.second,
      },
      { note: 'two groups of one object each is not a comparison', test: (v: Vars) => Number(v.first) + Number(v.second) >= 4 },
    ],
    answer: (v: Vars) => {
      const first = Number(v.first);
      const second = Number(v.second);
      if (first === second) return 'ჯგუფები ტოლია';
      return first > second ? 'პირველი ჯგუფი მეტია' : 'მეორე ჯგუფი მეტია';
    },
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ answer }) =>
      ['პირველი ჯგუფი მეტია', 'მეორე ჯგუფი მეტია', 'ჯგუფები ტოლია'].filter(
        (option) => option !== answer,
      ),
    explanation: ({ vars, answer }) => {
      const first = Number(vars.first);
      const second = Number(vars.second);
      const item = critterByName(String(vars.item));
      return `პირველში ${first} ${item.name}, მეორეში — ${second}. ${answer}.`;
    },
    visual: (v: Vars) => {
      const item = critterByName(String(v.item));
      return drawTwoGroups(
        { label: 'პირველი ჯგუფი', emoji: item.emoji, count: Number(v.first) },
        { label: 'მეორე ჯგუფი', emoji: item.emoji, count: Number(v.second) },
      );
    },
  }),

  /**
   * Level 2 — fill in the missing sign (Q3).
   *
   * The same question as level 1 with the sentence around it removed: the
   * student supplies the relation, not a choice among described outcomes.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-1-fill-sign', subtopicId: 'meti-naklebi-toli', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული ნიშანი: {a} __ {b}.',
    variables: {
      a: { kind: 'int', min: 0, max: 20 },
      b: { kind: 'int', min: 0, max: 20 },
    },
    answer: (v: Vars) => signOf(Number(v.a), Number(v.b)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const [a, b] = [Number(vars.a), Number(vars.b)];
      return ['>', '<', '='].filter((sign) => sign !== signOf(a, b));
    },
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  /**
   * Level 2, second answer shape — which group has more, named not drawn (Q4).
   *
   * The same comparison as level 1 with the objects named rather than drawn, so
   * the answer has to be read from the numbers and the picture is decoration
   * that still has to agree with them.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-1-which-group', subtopicId: 'meti-naklebi-toli', difficulty: 2 }),
    prompt: 'პირველ ჯგუფში არის {a} {item}, მეორეში — {b} {item}. რომელ ჯგუფშია მეტი?',
    variables: {
      item: { kind: 'choice', values: CRITTER_NAMES },
      a: { kind: 'int', min: 1, max: 20 },
      b: { kind: 'int', min: 1, max: 20 },
    },
    constraints: [
      { note: 'a comparison needs two different counts', test: (v: Vars) => v.a !== v.b },
    ],
    answer: (v: Vars) => (Number(v.a) > Number(v.b) ? 'პირველში' : 'მეორეში'),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => [answer === 'პირველში' ? 'მეორეში' : 'პირველში'],
    explanation: ({ vars, answer }) =>
      `${vars.a} და ${vars.b} — მეტია ${Number(vars.a) > Number(vars.b) ? vars.a : vars.b}, ამიტომ ${answer}.`,
  }),

  /**
   * Level 3 — three comparisons at once (Q5).
   *
   * One sign per question, three questions in a row: the engine marks one
   * answer, so the three-part task is delivered as the run it is. Each draw is
   * a different pair, so the three signs are genuinely read rather than
   * guessed from the first.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-1-three-signs', subtopicId: 'meti-naklebi-toli', difficulty: 3 }),
    prompt: 'შეავსე სამი შედარება: {p1} __ {q1}, {p2} __ {q2}, {p3} __ {q3}. რომელი რიგია სწორი?',
    variables: {
      p1: { kind: 'int', min: 0, max: 10 },
      q1: { kind: 'int', min: 0, max: 10 },
      p2: { kind: 'int', min: 0, max: 10 },
      q2: { kind: 'int', min: 0, max: 10 },
      p3: { kind: 'int', min: 0, max: 10 },
      q3: { kind: 'int', min: 0, max: 10 },
    },
    constraints: [
      {
        note: 'the three comparisons are not all the same sign, or one answer would carry it',
        test: (v: Vars) => {
          const signs = [signOf(Number(v.p1), Number(v.q1)), signOf(Number(v.p2), Number(v.q2)), signOf(Number(v.p3), Number(v.q3))];
          return new Set(signs).size > 1;
        },
      },
    ],
    answer: (v: Vars) =>
      [signOf(Number(v.p1), Number(v.q1)), signOf(Number(v.p2), Number(v.q2)), signOf(Number(v.p3), Number(v.q3))].join(','),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const correct = String(answer).split(',');
      const pairs = [
        [Number(vars.p1), Number(vars.q1)],
        [Number(vars.p2), Number(vars.q2)],
        [Number(vars.p3), Number(vars.q3)],
      ];
      // One sign turned over at a time — the mistake of reading one comparison
      // backwards, which is exactly what the three-part task catches.
      return correct.map((_, index) => {
        const flipped = [...correct];
        flipped[index] = signOf(pairs[index][1], pairs[index][0]);
        return flipped.join(',');
      });
    },
    explanation: ({ vars, answer }) => {
      const signs = String(answer).split(',');
      return `${vars.p1} ${signs[0]} ${vars.q1}, ${vars.p2} ${signs[1]} ${vars.q2}, ${vars.p3} ${signs[2]} ${vars.q3}.`;
    },
  }),

  /**
   * Level 3, second answer shape — how many more (Q6).
   *
   * A comparison turned into a subtraction: the student has to see which group
   * is larger *and* how far apart they are. The larger group's size is the
   * obvious wrong answer, and it is offered.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-1-how-many-more', subtopicId: 'meti-naklebi-toli', difficulty: 3 }),
    prompt: 'პირველ კალათაში არის {a} {item}, მეორეში — {b}. რამდენით მეტია პირველ კალათაში?',
    variables: {
      item: { kind: 'choice', values: CRITTER_NAMES },
      b: { kind: 'int', min: 1, max: 12 },
      gap: { kind: 'int', min: 1, max: 6 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.gap)] },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 1, max: 20 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      // The two group sizes themselves, and the difference one step off.
      return [a, b, Number(answer) + 1, Number(answer) - 1].filter(
        (candidate) => candidate !== Number(answer) && candidate > 0,
      );
    },
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
    visual: (v: Vars) => {
      const item = critterByName(String(v.item));
      return drawTwoGroups(
        { label: 'პირველი კალათა', emoji: item.emoji, count: Number(v.a) },
        { label: 'მეორე კალათა', emoji: item.emoji, count: Number(v.b) },
      );
    },
  }),
];

/* ================================================================== *\
 * U05.2 — რიცხვების შედარება 10-ის ფარგლებში
 * ================================================================== */

const u052: QuestionTemplate[] = [
  /**
   * Level 1 — the larger of two numbers (Q7).
   *
   * Both values are the answer to some draw, so exactly two options are right
   * for their own question and the student picks one: the option list *is* the
   * pair printed in the sentence.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-2-larger', subtopicId: 'Sedareba10', difficulty: 1 }),
    prompt: 'რომელი რიცხვია მეტი: {a} თუ {b}?',
    variables: {
      a: { kind: 'int', min: 0, max: 10 },
      b: { kind: 'int', min: 0, max: 10 },
    },
    constraints: [
      { note: 'two different numbers, or there is no larger one', test: (v: Vars) => v.a !== v.b },
    ],
    answer: (v: Vars) => Math.max(Number(v.a), Number(v.b)),
    format: { kind: 'integer', min: 0, max: 10 },
    optionCount: 2,
    distractors: ({ vars }) => [Math.min(Number(vars.a), Number(vars.b))],
    explanation: ({ vars, answer }) =>
      `${answer} მეტია: ${Number(vars.a) > Number(vars.b) ? vars.a : vars.b} > ${Number(vars.a) > Number(vars.b) ? vars.b : vars.a}.`,
  }),

  /**
   * Level 1, second answer shape — the smaller (Q8).
   *
   * The same pair asked the other way round. A child who always answers "the
   * second one" is right half the time on one form and wrong every time on the
   * other, so both directions are asked.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-2-smaller', subtopicId: 'Sedareba10', difficulty: 1 }),
    prompt: 'რომელი რიცხვია ნაკლები: {a} თუ {b}?',
    variables: {
      a: { kind: 'int', min: 0, max: 10 },
      b: { kind: 'int', min: 0, max: 10 },
    },
    constraints: [
      { note: 'two different numbers, or there is no smaller one', test: (v: Vars) => v.a !== v.b },
    ],
    answer: (v: Vars) => Math.min(Number(v.a), Number(v.b)),
    format: { kind: 'integer', min: 0, max: 10 },
    optionCount: 2,
    distractors: ({ vars }) => [Math.max(Number(vars.a), Number(vars.b))],
    explanation: ({ vars, answer }) =>
      `${answer} ნაკლებია: ${Math.min(Number(vars.a), Number(vars.b))} < ${Math.max(Number(vars.a), Number(vars.b))}.`,
  }),

  /**
   * Level 2 — the missing sign under ten (Q9).
   *
   * Two-digit numbers are level 3's business; here the whole point is that the
   * range is small enough to check by counting on one hand.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-2-sign', subtopicId: 'Sedareba10', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული ნიშანი: {a} __ {b}.',
    variables: {
      a: { kind: 'int', min: 0, max: 10 },
      b: { kind: 'int', min: 0, max: 10 },
    },
    answer: (v: Vars) => signOf(Number(v.a), Number(v.b)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const [a, b] = [Number(vars.a), Number(vars.b)];
      return ['>', '<', '='].filter((sign) => sign !== signOf(a, b));
    },
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  /**
   * Level 2, second answer shape — a number between two others (Q10).
   *
   * Every value strictly between is a correct answer, so the question is
   * generated by *construction*: the bounds are drawn and the answer is one of
   * the values they leave, never a value that happens to fit.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-2-between', subtopicId: 'Sedareba10', difficulty: 2 }),
    prompt: '{low} __ {high}-ის ნაცვლად ჩაწერე რიცხვი, რომელიც {low}-ზე მეტია და {high}-ზე ნაკლები.',
    variables: {
      low: { kind: 'int', min: 0, max: 7 },
      span: { kind: 'int', min: 2, max: 3 },
      high: { kind: 'choice', values: (v: Vars) => [Number(v.low) + Number(v.span)] },
      between: {
        kind: 'choice',
        values: (v: Vars) => {
          const low = Number(v.low);
          const high = Number(v.high);
          return Array.from({ length: high - low - 1 }, (_, index) => low + index + 1);
        },
      },
    },
    constraints: [
      { note: 'the bounds leave at least one number strictly between them', test: (v: Vars) => Number(v.high) - Number(v.low) >= 2 },
      { note: 'and the answer really is between them', test: (v: Vars) => Number(v.between) > Number(v.low) && Number(v.between) < Number(v.high) },
    ],
    answer: (v: Vars) => Number(v.between),
    format: { kind: 'integer', min: 1, max: 9 },
    optionCount: 3,
    distractors: ({ vars }) => {
      const low = Number(vars.low);
      const high = Number(vars.high);
      // The bounds themselves — a child who reads „მეტი“ as „ნაკლები“ picks one
      // of these — and a number outside the interval.
      return [low, high, high + 1, low - 1].filter((value) => value >= 0 && value <= 10);
    },
    explanation: ({ vars, answer }) =>
      `${answer} მეტია ${vars.low}-ზე და ნაკლებია ${vars.high}-ზე: ${vars.low} < ${answer} < ${vars.high}.`,
  }),

  /**
   * Level 3 — the largest of four under ten (Q11).
   *
   * Four numbers to compare against each other rather than two against two:
   * the student has to hold the running winner, which is the extra step the
   * level is for.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-2-largest-of-four', subtopicId: 'Sedareba10', difficulty: 3 }),
    prompt: 'მოცემულია რიცხვები: {shown}. აირჩიე უდიდესი რიცხვი.',
    variables: {
      items: { kind: 'list', pick: { values: range(0, 10), length: 4, unique: true } },
      shown: { kind: 'choice', values: (v: Vars) => [asRun(numbersOf(v, 'items'))] },
    },
    answer: (v: Vars) => Math.max(...numbersOf(v, 'items')),
    format: { kind: 'integer', min: 0, max: 10 },
    optionCount: 3,
    distractors: ({ vars }) => {
      const items = numbersOf(vars, 'items').slice().sort((a, b) => b - a);
      // The runners-up, not random numbers: every option is one of the four.
      return items.slice(1);
    },
    explanation: ({ vars, answer }) => `უდიდესია ${answer}: ${asRun(numbersOf(vars, 'items').slice().sort((a, b) => b - a))}.`,
  }),

  /**
   * Level 3, second answer shape — the smallest of four (Q12).
   *
   * The other end of the same set. Asking both is what stops "the biggest one"
   * being answered by a habit rather than by comparing.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-2-smallest-of-four', subtopicId: 'Sedareba10', difficulty: 3 }),
    prompt: 'მოცემულია რიცხვები: {shown}. აირჩიე უმცირესი რიცხვი.',
    variables: {
      items: { kind: 'list', pick: { values: range(0, 10), length: 4, unique: true } },
      shown: { kind: 'choice', values: (v: Vars) => [asRun(numbersOf(v, 'items'))] },
    },
    answer: (v: Vars) => Math.min(...numbersOf(v, 'items')),
    format: { kind: 'integer', min: 0, max: 10 },
    optionCount: 3,
    distractors: ({ vars }) => {
      const items = numbersOf(vars, 'items').slice().sort((a, b) => a - b);
      return items.slice(1);
    },
    explanation: ({ vars, answer }) => `უმცირესია ${answer}: ${asRun(numbersOf(vars, 'items').slice().sort((a, b) => a - b))}.`,
  }),
];

/* ================================================================== *\
 * U05.3 — რიცხვების შედარება 100-ის ფარგლებში
 * ================================================================== */

const u053: QuestionTemplate[] = [
  /**
   * Level 1 — the larger of two two-digit numbers (Q13).
   *
   * The pair is chosen so the answer is not decided by the units digit alone:
   * at least one draw has the same tens in both numbers, which forces the child
   * to look at the units.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-3-larger', subtopicId: 'Sedareba100', difficulty: 1 }),
    prompt: 'რომელი რიცხვია მეტი: {a} თუ {b}?',
    variables: {
      a: { kind: 'int', min: 10, max: 99 },
      b: { kind: 'int', min: 10, max: 99 },
    },
    constraints: [{ note: 'two different numbers', test: (v: Vars) => v.a !== v.b }],
    answer: (v: Vars) => Math.max(Number(v.a), Number(v.b)),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 2,
    distractors: ({ vars }) => [Math.min(Number(vars.a), Number(vars.b))],
    explanation: ({ vars }) =>
      `${Math.max(Number(vars.a), Number(vars.b))} მეტია ${Math.min(Number(vars.a), Number(vars.b))}-ზე.`,
  }),

  /**
   * Level 1, second answer shape — a number compared with itself (Q14).
   *
   * „=` is a real answer and the one children forget exists, so it is asked on
   * its own rather than only as the third option in a comparison.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-3-equal', subtopicId: 'Sedareba100', difficulty: 1 }),
    prompt: 'შეავსე გამოტოვებული ნიშანი: {a} __ {b}.',
    variables: {
      a: { kind: 'int', min: 10, max: 99 },
      same: { kind: 'choice', values: ['yes', 'no'] },
      delta: { kind: 'int', min: 1, max: 9 },
      b: {
        kind: 'choice',
        values: (v: Vars) => [
          v.same === 'yes'
            ? Number(v.a)
            : Number(v.a) + (Number(v.a) % 10 === 9 ? -Number(v.delta) : Number(v.delta)),
        ],
      },
    },
    constraints: [
      {
        note: 'the two numbers stay two-digit',
        test: (v: Vars) =>
          Number(v.b) >= 10 &&
          Number(v.b) <= 99 &&
          (v.same === 'yes' ? v.a === v.b : v.a !== v.b),
      },
    ],
    answer: (v: Vars) => signOf(Number(v.a), Number(v.b)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const [a, b] = [Number(vars.a), Number(vars.b)];
      return ['>', '<', '='].filter((sign) => sign !== signOf(a, b));
    },
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  /**
   * Level 2 — the larger of two, drawn apart in the eighties (Q15).
   *
   * The numbers are close enough that the tens digit cannot decide it on its
   * own, which is exactly the mistake the level is checking for.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-3-larger-close', subtopicId: 'Sedareba100', difficulty: 2 }),
    prompt: 'შეადარე {a} და {b}. რომელი რიცხვია მეტი?',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      ua: { kind: 'int', min: 0, max: 9 },
      ub: { kind: 'int', min: 0, max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ua)] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.ub)] },
    },
    constraints: [{ note: 'the units differ, so one is really larger', test: (v: Vars) => v.ua !== v.ub }],
    answer: (v: Vars) => Math.max(Number(v.a), Number(v.b)),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 2,
    distractors: ({ vars }) => [Math.min(Number(vars.a), Number(vars.b))],
    explanation: ({ vars }) =>
      `ორივეს ერთი ათეული აქვს, ამიტომ ერთეულები წყვეტს: ${Math.max(Number(vars.a), Number(vars.b))} მეტია ${Math.min(Number(vars.a), Number(vars.b))}-ზე.`,
  }),

  /**
   * Level 2, second answer shape — the smallest of three (Q16).
   */
  defineTemplate({
    ...at({ id: 'g1-u05-3-smallest-of-three', subtopicId: 'Sedareba100', difficulty: 2 }),
    prompt: 'მოცემულია რიცხვები: {shown}. აირჩიე უმცირესი რიცხვი.',
    variables: {
      items: { kind: 'list', pick: { values: range(10, 99), length: 3, unique: true } },
      shown: { kind: 'choice', values: (v: Vars) => [asRun(numbersOf(v, 'items'))] },
    },
    answer: (v: Vars) => Math.min(...numbersOf(v, 'items')),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 3,
    distractors: ({ vars }) => numbersOf(vars, 'items').slice().sort((a, b) => a - b).slice(1),
    explanation: ({ vars, answer }) =>
      `უმცირესია ${answer}: ${asRun(numbersOf(vars, 'items').slice().sort((a, b) => a - b))}.`,
  }),

  /**
   * Level 3 — a reversed pair (Q17).
   *
   * 67 and 76 print the same two digits. A child who compares the digits
   * without their places cannot answer it, which is the extra step this level
   * asks for.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-3-reversed', subtopicId: 'Sedareba100', difficulty: 3 }),
    prompt: 'შეავსე გამოტოვებული ნიშანი: {a} __ {b}.',
    variables: {
      tens: { kind: 'int', min: 2, max: 9 },
      units: { kind: 'int', min: 1, max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.units)] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.units) * 10 + Number(v.tens)] },
    },
    constraints: [{ note: 'reversing the digits changes the number', test: (v: Vars) => v.tens !== v.units }],
    answer: (v: Vars) => signOf(Number(v.a), Number(v.b)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const [a, b] = [Number(vars.a), Number(vars.b)];
      return ['>', '<', '='].filter((sign) => sign !== signOf(a, b));
    },
    explanation: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return `${a} ${answer} ${b}: ათეულების ციფრი წყვეტს.`;
    },
  }),

  /**
   * Level 3, second answer shape — the largest of four similar numbers (Q18).
   *
   * The four all start with 5 or 8, so the tens digit alone picks two of them
   * and the units decide the rest.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-3-largest-of-four', subtopicId: 'Sedareba100', difficulty: 3 }),
    prompt: 'მოცემულია რიცხვები: {shown}. აირჩიე უდიდესი რიცხვი.',
    variables: {
      highTens: { kind: 'int', min: 4, max: 8 },
      items: {
        kind: 'list',
        pick: {
          values: range(10, 99),
          length: 4,
          unique: true,
          // All four share the higher tens digit, so the tens digit cannot
          // decide it and the units digit has to be read in each pair.
          filter: (item, v) =>
            Number(item) >= Number(v.highTens) * 10 &&
            Number(item) < (Number(v.highTens) + 1) * 10,
        },
      },
      shown: { kind: 'choice', values: (v: Vars) => [asRun(numbersOf(v, 'items'))] },
    },
    constraints: [
      { note: 'a full set of four', test: (v: Vars) => numbersOf(v, 'items').length === 4 },
    ],
    answer: (v: Vars) => Math.max(...numbersOf(v, 'items')),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 3,
    distractors: ({ vars }) => numbersOf(vars, 'items').slice().sort((a, b) => b - a).slice(1),
    explanation: ({ vars, answer }) =>
      `უდიდესია ${answer}: ${asRun(numbersOf(vars, 'items').slice().sort((a, b) => b - a))}.`,
  }),
];

/* ================================================================== *\
 * U05.4 — რამდენით მეტია? ამოცანები
 * ================================================================== */

/**
 * One „how many more“ story.
 *
 * The question half is not a name: „რამდენით მეტი აქვს ანას?“ asks about a
 * person, „რამდენით მეტია პირველ თეფშზე?“ asks about a plate, and the two
 * cannot be swapped. So each story carries its own closing question along with
 * its opening, and the two are written together rather than one being derived
 * from the other.
 */
function howManyMore(spec: {
  id: string;
  difficulty: 1 | 2 | 3;
  min: number;
  max: number;
  /** Whether the two quantities belong to children, which decides the names. */
  people: boolean;
  /**
   * The objects the story may name, if it names any.
   *
   * Given, the story prints „9 {item}“ and the object is drawn; omitted, the
   * story has a fixed subject and the counts are the only thing that varies.
   */
  items?: string[];
  /** The opening sentence, with the two quantities already drawn. */
  story: (v: Vars) => string;
  /** The question that follows it — „რამდენით მეტი აქვს ანას?“ */
  asks: (v: Vars) => string;
}) {
  const variables: Record<string, ReturnType<typeof defineTemplate>['variables'][string]> = {
    b: { kind: 'int', min: spec.min, max: spec.max },
    // A gap of one is a real answer, but always *one* is not: the difference
    // has to be worth finding, so the gap starts at two and the easiest
    // variation is still a subtraction.
    gap: { kind: 'int', min: 2, max: Math.max(3, Math.round((spec.max - spec.min) / 2)) },
    a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.gap)] },
  };
  if (spec.people) {
    variables.who = { kind: 'choice', values: NAMES };
    variables.others = {
      kind: 'choice',
      values: (v: Vars) => NAMES.filter((name) => name !== v.who),
    };
  } else if (spec.items) {
    // The object is drawn so the sentence is not the same every time the counts
    // are. Only stories that name their objects *before* a numeral get one, and
    // the question that follows never declines the object — Georgian case
    // endings are irregular (მსხალი → მსხლით, not მსხალიით), so a sentence that
    // would need an instrumental asks about the place instead.
    variables.item = { kind: 'choice', values: spec.items };
  }
  variables.story = { kind: 'choice', values: (v: Vars) => [spec.story(v)] };
  variables.asks = { kind: 'choice', values: (v: Vars) => [spec.asks(v)] };

  return defineTemplate({
    ...at({ id: spec.id, subtopicId: 'ramdenit-meti', difficulty: spec.difficulty }),
    prompt: '{story} {asks}',
    variables,
    constraints: [
      { note: 'the two quantities differ', test: (v: Vars) => Number(v.a) > Number(v.b) },
      { note: 'the larger quantity stays inside the level’s range', test: (v: Vars) => Number(v.a) <= spec.max },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 2, max: spec.max },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      // Both quantities are offered, because „how many more“ is most often
      // answered with one of them, and so is the difference one step off.
      return [
        Number(vars.a),
        Number(vars.b),
        Number(answer) + 1,
        Number(vars.a) + Number(vars.b),
      ].filter((candidate) => candidate !== Number(answer) && candidate > 0);
    },
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  });
}

const u054: QuestionTemplate[] = [
  /** Level 1 — pencils (Q19). */
  howManyMore({
    id: 'g1-u05-4-pencils',
    difficulty: 1,
    min: 1,
    max: 10,
    people: true,
    story: (v) => `${whoseOf(String(v.who))} აქვს ${v.a} ფანქარი, ${whoseOf(String(v.others))} — ${v.b}.`,
    asks: (v) => `რამდენით მეტი ფანქარი აქვს ${String(v.who).replace(/ა$/, 'ა')}ს?`,
  }),

  /** Level 1, second answer shape — cakes on two plates (Q20). */
  howManyMore({
    id: 'g1-u05-4-plates',
    difficulty: 1,
    min: 1,
    max: 10,
    people: false,
    items: CRITTER_NAMES,
    story: (v) => `ერთ თეფშზე არის ${v.a} ${String(v.item)}, მეორეზე — ${v.b}.`,
    asks: () => 'რამდენით მეტია პირველ თეფშზე?',
  }),

  /** Level 2 — flowers in the garden (Q21). */
  howManyMore({
    id: 'g1-u05-4-flowers',
    difficulty: 2,
    min: 2,
    max: 20,
    people: false,
    items: ['ყვავილი', 'ვაშლი'],
    // Only things a garden actually grows, and things that really do come in
    // red and yellow: „წითელი ვარსკვლავი“ is not a flower bed.
    story: (v) => `ბაღში არის ${v.a} წითელი ${String(v.item)} და ${v.b} ყვითელი ${String(v.item)}.`,
    asks: (v) => `რამდენით მეტია წითელი ${String(v.item)}?`,
  }),

  /** Level 2, second answer shape — cubes in two boxes (Q22). */
  howManyMore({
    id: 'g1-u05-4-cubes',
    difficulty: 2,
    min: 3,
    max: 20,
    people: false,
    items: CRITTER_NAMES,
    story: (v) => `ერთ ყუთში არის ${v.a} ${String(v.item)}, მეორეში — ${v.b}.`,
    asks: () => 'რამდენით მეტია პირველ ყუთში?',
  }),

  /** Level 3 — stickers (Q23). */
  howManyMore({
    id: 'g1-u05-4-stickers',
    difficulty: 3,
    min: 10,
    max: 40,
    people: true,
    story: (v) => `${whoseOf(String(v.who))} აქვს ${v.a} სტიკერი, ${whoseOf(String(v.others))} — ${v.b}.`,
    asks: (v) => `რამდენით მეტი სტიკერი აქვს ${String(v.who).replace(/ა$/, 'ა')}ს?`,
  }),

  /** Level 3, second answer shape — books on two shelves (Q24). */
  howManyMore({
    id: 'g1-u05-4-books',
    difficulty: 3,
    min: 10,
    max: 60,
    people: false,
    story: (v) => `ერთ თაროზე არის ${v.a} წიგნი, მეორეზე — ${v.b}.`,
    asks: () => 'რამდენი წიგნით მეტია პირველ თაროზე?',
  }),
];

/* ================================================================== *\
 * U05.5 — უახლოეს ათეულამდე შეფასება
 * ================================================================== */

const u055: QuestionTemplate[] = [
  /**
   * Level 1 — which ten is nearer, units below five (Q25).
   *
   * Only two options, because there are only two neighbouring tens. The number
   * is never an exact ten, so the question always has an answer to find. The
   * units are restricted to one side of the half so the two level-1 questions
   * are not the same question twice: here the nearer ten is always the lower
   * one, and Q26's is always the upper one.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-5-nearest-ten', subtopicId: 'SeFaseba-aTeulamde', difficulty: 1 }),
    prompt: 'რომელ ათეულთან არის {n} უფრო ახლოს?',
    variables: {
      tens: { kind: 'int', min: 1, max: 8 },
      units: { kind: 'int', min: 1, max: 4 },
      n: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.units)] },
      below: { kind: 'choice', values: (v: Vars) => [tensAround(Number(v.n))[0]] },
      above: { kind: 'choice', values: (v: Vars) => [tensAround(Number(v.n))[1]] },
    },
    constraints: [{ note: 'not already a ten, or the answer is the number itself', test: (v: Vars) => NOT_A_TEN(Number(v.n)) }],
    answer: (v: Vars) => nearestTen(Number(v.n)),
    format: { kind: 'integer', min: 10, max: 100 },
    optionCount: 2,
    distractors: ({ vars }) => {
      const answer = nearestTen(Number(vars.n));
      const [below, above] = tensAround(Number(vars.n));
      return [below, above].filter((ten) => ten !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.n}-ის ერთეულია ${Number(vars.n) % 10} — ხუთზე ნაკლები, ამიტომ უახლოესი ათეულია ${answer}.`,
  }),

  /**
   * Level 1, second answer shape — the same question on the other side of the
   * half (Q26). The nearer ten is now the upper one, so a child who always
   * rounds down is caught here rather than a level later.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-5-nearest-ten-up', subtopicId: 'SeFaseba-aTeulamde', difficulty: 1 }),
    prompt: 'რომელ ათეულთან არის {n} უფრო ახლოს?',
    variables: {
      tens: { kind: 'int', min: 1, max: 8 },
      units: { kind: 'int', min: 6, max: 9 },
      n: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + Number(v.units)] },
      below: { kind: 'choice', values: (v: Vars) => [tensAround(Number(v.n))[0]] },
      above: { kind: 'choice', values: (v: Vars) => [tensAround(Number(v.n))[1]] },
    },
    constraints: [{ note: 'not already a ten', test: (v: Vars) => NOT_A_TEN(Number(v.n)) }],
    answer: (v: Vars) => nearestTen(Number(v.n)),
    format: { kind: 'integer', min: 10, max: 100 },
    optionCount: 2,
    distractors: ({ vars }) => {
      const answer = nearestTen(Number(vars.n));
      const [below, above] = tensAround(Number(vars.n));
      return [below, above].filter((ten) => ten !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.n}-ის ერთეულია ${Number(vars.n) % 10} — ხუთზე მეტი, ამიტომ უახლოესი ათეულია ${answer}.`,
  }),

  /**
   * Level 2 — round a number under fifty (Q27, Q28).
   *
   * Typed, because a rounded number is one number and choosing it from a list
   * would give away which decade it is in.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-5-round-small', subtopicId: 'SeFaseba-aTeulamde', difficulty: 2 }),
    prompt: 'დაამრგვალე {n} უახლოეს ათეულამდე.',
    variables: {
      n: { kind: 'int', min: 11, max: 60 },
    },
    constraints: [{ note: 'not already a ten', test: (v: Vars) => NOT_A_TEN(Number(v.n)) }],
    answer: (v: Vars) => nearestTen(Number(v.n)),
    format: { kind: 'integer', min: 10, max: 60, entry: true },
    explanation: ({ vars, answer }) => {
      const units = Number(vars.n) % 10;
      return `${vars.n}-ის ერთეულია ${units}, ამიტომ ${units >= 5 ? 'ზედა' : 'ქვედა'} ათეული: ${answer}.`;
    },
  }),

  /**
   * Level 2, second answer shape — round a number in the sixties and seventies
   * (Q28). The same rule on a range where the answer is no longer the first
   * tens pair a child can count off.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-5-round-large', subtopicId: 'SeFaseba-aTeulamde', difficulty: 2 }),
    prompt: 'დაამრგვალე {n} უახლოეს ათეულამდე.',
    variables: {
      n: { kind: 'int', min: 61, max: 99 },
    },
    constraints: [{ note: 'not already a ten', test: (v: Vars) => NOT_A_TEN(Number(v.n)) }],
    answer: (v: Vars) => nearestTen(Number(v.n)),
    format: { kind: 'integer', min: 60, max: 100, entry: true },
    explanation: ({ vars, answer }) => {
      const units = Number(vars.n) % 10;
      return `${vars.n}-ის ერთეულია ${units}, ამიტომ ${units >= 5 ? 'ზედა' : 'ქვედა'} ათეული: ${answer}.`;
    },
  }),

  /**
   * Level 3 — a number ending in five (Q29).
   *
   * The half-way case, which the unit's note decides: five rounds *up*. Asked
   * as a choice between the two neighbouring tens rather than as a typed
   * number, because the answer to a half-way number is the rule itself, and
   * „80“ being one of two options is what makes the rule visible.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-5-round-half', subtopicId: 'SeFaseba-aTeulamde', difficulty: 3 }),
    prompt: 'დაამრგვალე {n} უახლოეს ათეულამდე. რომელი ათეულია სწორი?',
    variables: {
      tens: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + 5] },
      below: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10] },
      above: { kind: 'choice', values: (v: Vars) => [Number(v.tens) * 10 + 10] },
    },
    constraints: [{ note: 'five units is a real half-way case', test: (v: Vars) => Number(v.n) % 10 === 5 }],
    answer: (v: Vars) => nearestTen(Number(v.n)),
    format: { kind: 'integer', min: 10, max: 100 },
    optionCount: 2,
    distractors: ({ vars, answer }) => {
      const [below, above] = [Number(vars.n) - 5, Number(vars.n) + 5];
      return [below, above].filter((ten) => ten !== Number(answer));
    },
    explanation: ({ vars, answer }) =>
      `${vars.n}-ის ერთეულია 5 — ჩვეულებრივი წესით ზედა ათეულს ვირჩევთ: ${answer}.`,
  }),

  /**
   * Level 3, second answer shape — round three numbers, in the order given
   * (Q30).
   *
   * Three rounded values as one answer, which is the shape Q30 states: the
   * numbers are printed in a fixed order and the three tens are written in that
   * same order. A wrong option rounds one of the three the wrong way, which is
   * the mistake the question is checking for.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-5-round-three', subtopicId: 'SeFaseba-aTeulamde', difficulty: 3 }),
    prompt: 'მოცემულია რიცხვები {a}, {b} და {c}. ჩაწერე თითოეულის უახლოესი ათეული იმავე თანმიმდევრობით. რომელი რიგია სწორი?',
    variables: {
      items: { kind: 'list', pick: { values: range(11, 99), length: 3, unique: true } },
      a: { kind: 'choice', values: (v: Vars) => [numbersOf(v, 'items')[0]] },
      b: { kind: 'choice', values: (v: Vars) => [numbersOf(v, 'items')[1]] },
      c: { kind: 'choice', values: (v: Vars) => [numbersOf(v, 'items')[2]] },
    },
    constraints: [
      { note: 'none of the three is already a ten', test: (v: Vars) => numbersOf(v, 'items').every(NOT_A_TEN) },
    ],
    answer: (v: Vars) => numbersOf(v, 'items').map(nearestTen).join(', '),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const values = numbersOf(vars, 'items');
      const correct = String(answer).split(', ');
      // One of the three rounded the other way — the half-way mistake, made
      // once, in a position that moves.
      return correct.map((_, index) => {
        const wrong = [...correct];
        const target = values[index];
        wrong[index] = String(nearestTen(target) === Math.floor(target / 10) * 10
          ? Math.ceil(target / 10) * 10
          : Math.floor(target / 10) * 10);
        return wrong.join(', ');
      });
    },
    explanation: ({ vars, answer }) => `${asRun(numbersOf(vars, 'items'))} → ${answer}.`,
  }),
];

/* ================================================================== *\
 * U05.6 — დალაგება ზრდადობით და კლებადობით
 * ================================================================== */

/**
 * An ordering question: the numbers are shown scrambled and the student taps
 * them into sequence.
 *
 * The answer is a sequence of *display* positions, which is what the student
 * actually produces — the generator builds the scramble before calling the
 * answer function so both sides are talking about the same arrangement. The
 * shuffle rejects a scramble that came out already sorted, so the answer is
 * never on the page.
 */
function ordering(spec: {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
  direction: 'asc' | 'desc';
  min: number;
  max: number;
  count: number | { min: number; max: number };
}) {
  const word = spec.direction === 'asc' ? 'ზრდადობით' : 'კლებადობით';
  return defineTemplate({
    ...at({ id: spec.id, subtopicId: spec.subtopicId, difficulty: spec.difficulty }),
    prompt: `დაალაგე რიცხვები ${word}: ${spec.direction === 'asc' ? 'ჯერ უმცირესი, ბოლოს — უდიდესი' : 'ჯერ უდიდესი, ბოლოს — უმცირესი'}.`,
    variables: {
      items: {
        kind: 'list',
        pick: { values: range(spec.min, spec.max), length: spec.count, unique: true },
      },
    },
    shuffle: { source: 'items', direction: spec.direction },
    answer: (_v: Vars, ctx) => {
      const shown = (ctx.order ?? []).map(Number);
      const sorted =
        spec.direction === 'asc'
          ? [...shown].sort((a, b) => a - b)
          : [...shown].sort((a, b) => b - a);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    format: { kind: 'text' },
    explanation: ({ vars }) => {
      const values = numbersOf(vars, 'items');
      const sorted =
        spec.direction === 'asc'
          ? [...values].sort((a, b) => a - b)
          : [...values].sort((a, b) => b - a);
      return `${word}: ${asRun(sorted)}.`;
    },
  });
}

const u056: QuestionTemplate[] = [
  /** Level 1 — three small numbers, increasing (Q31). */
  ordering({ id: 'g1-u05-6-three-asc', subtopicId: 'dalageba', difficulty: 1, direction: 'asc', min: 1, max: 10, count: 3 }),
  /** Level 1, second answer shape — decreasing (Q32). */
  ordering({ id: 'g1-u05-6-three-desc', subtopicId: 'dalageba', difficulty: 1, direction: 'desc', min: 1, max: 10, count: 3 }),
  /** Level 2 — four two-digit numbers, increasing (Q33). */
  ordering({ id: 'g1-u05-6-four-asc', subtopicId: 'dalageba', difficulty: 2, direction: 'asc', min: 1, max: 30, count: 4 }),
  /** Level 2, second answer shape — decreasing (Q34). */
  ordering({ id: 'g1-u05-6-four-desc', subtopicId: 'dalageba', difficulty: 2, direction: 'desc', min: 1, max: 40, count: 4 }),
  /** Level 3 — five numbers, increasing (Q35). */
  ordering({ id: 'g1-u05-6-five-asc', subtopicId: 'dalageba', difficulty: 3, direction: 'asc', min: 30, max: 70, count: 5 }),
  /** Level 3, second answer shape — decreasing (Q36). */
  ordering({ id: 'g1-u05-6-five-desc', subtopicId: 'dalageba', difficulty: 3, direction: 'desc', min: 40, max: 90, count: 5 }),
];

/* ================================================================== *\
 * U05.7 — რიცხვების დალაგება
 * ================================================================== */

/**
 * The same ordering task as U05.6, on the ranges the unit's drag-and-drop
 * subtopic states.
 *
 * This is not a second way of asking the same thing: U05.6 is „დაალაგე“ — the
 * student puts a printed set in order — while U05.7 is the dragging exercise,
 * where the set is the whole task and there is no other question around it. The
 * engine delivers both through the same tap-to-order control because that is
 * the ordering control the app has; the difference the student experiences is
 * the range and the size of the set.
 */
const u057: QuestionTemplate[] = [
  /** Level 1 — three or four numbers under ten (Q37). */
  ordering({ id: 'g1-u05-7-small-asc', subtopicId: 'dalageba-danayi', difficulty: 1, direction: 'asc', min: 1, max: 10, count: { min: 3, max: 4 } }),
  /** Level 1, second answer shape — under twenty, decreasing (Q38). */
  ordering({ id: 'g1-u05-7-small-desc', subtopicId: 'dalageba-danayi', difficulty: 1, direction: 'desc', min: 1, max: 20, count: { min: 3, max: 4 } }),
  /** Level 2 — four two-digit numbers, increasing (Q39). */
  ordering({ id: 'g1-u05-7-four-asc', subtopicId: 'dalageba-danayi', difficulty: 2, direction: 'asc', min: 10, max: 100, count: 4 }),
  /** Level 2, second answer shape — five, decreasing (Q40). */
  ordering({ id: 'g1-u05-7-five-desc', subtopicId: 'dalageba-danayi', difficulty: 2, direction: 'desc', min: 10, max: 100, count: 5 }),
  /** Level 3 — five numbers anywhere under a hundred (Q41). */
  ordering({ id: 'g1-u05-7-five-asc', subtopicId: 'dalageba-danayi', difficulty: 3, direction: 'asc', min: 1, max: 100, count: 5 }),
  /** Level 3, second answer shape — six, decreasing (Q42). */
  ordering({ id: 'g1-u05-7-six-desc', subtopicId: 'dalageba-danayi', difficulty: 3, direction: 'desc', min: 1, max: 100, count: 6 }),
];

/* ================================================================== *\
 * U05.8 — ტოლი და შერეული რაოდენობები
 * ================================================================== */

const u058: QuestionTemplate[] = [
  /**
   * Level 1 — two groups of different kinds, are they equal (Q43).
   *
   * The kinds differ (circles against squares) while the *counts* may be equal,
   * which is the point: equality is about how many, not about what.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-8-equal-groups', subtopicId: 'toli-raodenoba', difficulty: 1 }),
    prompt: 'პირველ ჯგუფში არის {a} {first}, მეორეში — {b} {second}. რომელია სწორი?',
    variables: {
      firstShape: { kind: 'choice', values: SHAPE_NAMES },
      secondShape: { kind: 'choice', values: (v: Vars) => SHAPE_NAMES.filter((name) => name !== v.firstShape) },
      mode: { kind: 'choice', values: ['equal', 'first', 'second'] },
      base: { kind: 'int', min: 2, max: 10 },
      gap: { kind: 'choice', values: [1, 2, 3] },
      a: {
        kind: 'choice',
        values: (v: Vars) => [v.mode === 'second' ? Number(v.base) : Number(v.base) + (v.mode === 'equal' ? 0 : Number(v.gap))],
      },
      b: {
        kind: 'choice',
        values: (v: Vars) => [v.mode === 'first' ? Number(v.base) : Number(v.base) + (v.mode === 'equal' ? 0 : Number(v.gap))],
      },
      first: { kind: 'choice', values: (v: Vars) => [shapeByName(String(v.firstShape)).name] },
      second: { kind: 'choice', values: (v: Vars) => [shapeByName(String(v.secondShape)).name] },
    },
    constraints: [
      {
        note: 'the counts match the answer the sentence claims',
        test: (v: Vars) =>
          v.mode === 'equal'
            ? v.a === v.b
            : v.mode === 'first'
              ? Number(v.a) > Number(v.b)
              : Number(v.b) > Number(v.a),
      },
    ],
    answer: (v: Vars) => {
      const a = Number(v.a);
      const b = Number(v.b);
      if (a === b) return 'ჯგუფებში საგნების რაოდენობა ტოლია';
      return a > b ? 'პირველ ჯგუფში მეტია' : 'მეორე ჯგუფში მეტია';
    },
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ answer }) =>
      ['პირველ ჯგუფში მეტია', 'მეორე ჯგუფში მეტია', 'ჯგუფებში საგნების რაოდენობა ტოლია'].filter(
        (option) => option !== answer,
      ),
    explanation: ({ vars, answer }) => {
      const first = shapeByName(String(vars.firstShape));
      const second = shapeByName(String(vars.secondShape));
      return `${vars.a} ${first.name} და ${vars.b} ${second.name}. ${answer}.`;
    },
    visual: (v: Vars) => {
      const first = shapeByName(String(v.firstShape));
      const second = shapeByName(String(v.secondShape));
      return drawTwoGroups(
        { label: 'პირველი ჯგუფი', emoji: first.emoji, count: Number(v.a) },
        { label: 'მეორე ჯგუფი', emoji: second.emoji, count: Number(v.b) },
      );
    },
  }),

  /**
   * Level 1, second answer shape — which group has *fewer* (Q44).
   *
   * The reverse of „which has more“. Same picture, different question, and the
   * answer is the group a child who only ever looks for the bigger one will
   * name by mistake.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-8-fewer-group', subtopicId: 'toli-raodenoba', difficulty: 1 }),
    prompt: 'პირველ ჯგუფში არის {a} {item}, მეორეში — {b}. რომელ ჯგუფშია ნაკლები საგანი?',
    variables: {
      item: { kind: 'choice', values: CRITTER_NAMES },
      a: { kind: 'int', min: 1, max: 12 },
      b: { kind: 'int', min: 1, max: 12 },
    },
    constraints: [{ note: 'a comparison needs two different counts', test: (v: Vars) => v.a !== v.b }],
    answer: (v: Vars) => (Number(v.a) < Number(v.b) ? 'პირველში' : 'მეორეში'),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => [answer === 'პირველში' ? 'მეორეში' : 'პირველში'],
    explanation: ({ vars, answer }) =>
      `${vars.a} და ${vars.b} — ნაკლებია ${Math.min(Number(vars.a), Number(vars.b))}, ამიტომ ${answer}.`,
  }),

  /**
   * Level 2 — a mixed quantity, how many altogether (Q45).
   *
   * Two kinds on one plate: the total is the addition of the two counts, so
   * this one *adds* where the rest of the unit compares. That is what „შერეული
   * რაოდენობები“ means, and the picture shows the two kinds apart so the sum
   * can be checked by eye.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-8-altogether', subtopicId: 'toli-raodenoba', difficulty: 2 }),
    prompt: 'თეფშზე არის {a} {first} და {b} {second}. სულ რამდენი საგანია თეფშზე?',
    variables: {
      firstKind: { kind: 'choice', values: CRITTER_NAMES },
      secondKind: { kind: 'choice', values: (v: Vars) => CRITTER_NAMES.filter((name) => name !== v.firstKind) },
      a: { kind: 'int', min: 1, max: 10 },
      b: { kind: 'int', min: 1, max: 10 },
      first: { kind: 'choice', values: (v: Vars) => [critterByName(String(v.firstKind)).name] },
      second: { kind: 'choice', values: (v: Vars) => [critterByName(String(v.secondKind)).name] },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 2, max: 20, entry: true },
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
    visual: (v: Vars) => {
      const first = critterByName(String(v.firstKind));
      const second = critterByName(String(v.secondKind));
      return drawTwoGroups(
        { label: first.name, emoji: first.emoji, count: Number(v.a) },
        { label: second.name, emoji: second.emoji, count: Number(v.b) },
      );
    },
  }),

  /**
   * Level 2, second answer shape — how many more, on the mixed page (Q46).
   */
  defineTemplate({
    ...at({ id: 'g1-u05-8-more-in-first', subtopicId: 'toli-raodenoba', difficulty: 2 }),
    prompt: 'პირველ ჯგუფში არის {a} {first}, მეორეში — {b} {second}. რამდენი საგნით მეტია პირველ ჯგუფში?',
    variables: {
      firstKind: { kind: 'choice', values: CRITTER_NAMES },
      secondKind: { kind: 'choice', values: (v: Vars) => CRITTER_NAMES.filter((name) => name !== v.firstKind) },
      b: { kind: 'int', min: 1, max: 10 },
      gap: { kind: 'int', min: 1, max: 6 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.gap)] },
      first: { kind: 'choice', values: (v: Vars) => [critterByName(String(v.firstKind)).name] },
      second: { kind: 'choice', values: (v: Vars) => [critterByName(String(v.secondKind)).name] },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 1, max: 20, entry: true },
    optionCount: 3,
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  /**
   * Level 3 — a sum compared against a stated total (Q47).
   *
   * The extra step is that the first basket's quantity has to be *computed* (8
   * apples and 4 pears is 12 fruit) before it can be compared with the second
   * basket's 12. Neither printed number is the answer.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-8-sum-compare', subtopicId: 'toli-raodenoba', difficulty: 3 }),
    prompt:
      'პირველ კალათაში არის {a} {first} და {b} {second}. მეორე კალათაში {total} საგანია. ტოლია თუ არა კალათებში საგნების რაოდენობა?',
    variables: {
      firstKind: { kind: 'choice', values: CRITTER_NAMES },
      secondKind: { kind: 'choice', values: (v: Vars) => CRITTER_NAMES.filter((name) => name !== v.firstKind) },
      a: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 2, max: 9 },
      mode: { kind: 'choice', values: ['equal', 'second', 'first'] },
      drift: { kind: 'choice', values: [-2, -1, 1, 2] },
      total: {
        kind: 'choice',
        values: (v: Vars) => [
          Number(v.a) + Number(v.b) + (v.mode === 'equal' ? 0 : Number(v.drift)),
        ],
      },
      first: { kind: 'choice', values: (v: Vars) => [critterByName(String(v.firstKind)).name] },
      second: { kind: 'choice', values: (v: Vars) => [critterByName(String(v.secondKind)).name] },
    },
    constraints: [{ note: 'the second basket holds a sensible number of fruit', test: (v: Vars) => Number(v.total) >= 5 && Number(v.total) <= 18 }],
    answer: (v: Vars) => {
      const first = Number(v.a) + Number(v.b);
      const second = Number(v.total);
      if (first === second) return 'ტოლია';
      return first > second ? 'პირველში მეტია' : 'მეორეში მეტია';
    },
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ answer }) => ['ტოლია', 'პირველში მეტია', 'მეორეში მეტია'].filter((option) => option !== answer),
    explanation: ({ vars, answer }) => {
      const first = Number(vars.a) + Number(vars.b);
      return `პირველში ${vars.a} + ${vars.b} = ${first}, მეორეში — ${vars.total}. ${answer}.`;
    },
    // Both rows are the *first* basket, so they are labelled by what they hold.
    // The second basket's total is a number, and printing it as a row of
    // emoji would ask the student to count what the sentence already gave.
    visual: (v: Vars) => {
      const first = critterByName(String(v.firstKind));
      const second = critterByName(String(v.secondKind));
      return drawTwoGroups(
        { label: `პირველი კალათა — ${first.name}`, emoji: first.emoji, count: Number(v.a) },
        { label: `პირველი კალათა — ${second.name}`, emoji: second.emoji, count: Number(v.b) },
      );
    },
  }),

  /**
   * Level 3, second answer shape — how many to add to make the groups equal
   * (Q48, Q50).
   *
   * The difference, again — but the question is stated as a *balancing* task,
   * which is the form a child meets in the unit's own last questions. The
   * bigger quantity is offered, because "make it equal" invites adding the
   * whole of the other group.
   */
  defineTemplate({
    ...at({ id: 'g1-u05-8-balance', subtopicId: 'toli-raodenoba', difficulty: 3 }),
    prompt:
      'პირველ ჯგუფში არის {a} {item}, მეორეში — {b}. რამდენი {item} უნდა დაემატოს მეორე ჯგუფს, რომ ორივეში ტოლი რაოდენობა იყოს?',
    variables: {
      item: { kind: 'choice', values: CRITTER_NAMES },
      b: { kind: 'int', min: 2, max: 12 },
      gap: { kind: 'int', min: 1, max: 7 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.gap)] },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 1, max: 20, entry: true },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      // The difference added instead of subtracted, and the two quantities.
      return [Number(vars.a) + Number(vars.b), Number(vars.a), Number(answer) + 1].filter(
        (candidate) => candidate !== Number(answer) && candidate > 0,
      );
    },
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer}: მეორე ჯგუფს ${answer} საგანი სჭირდება.`,
  }),

  /**
   * Level 3, third answer shape — the total of three boxes (Q49).
   */
  defineTemplate({
    ...at({ id: 'g1-u05-8-three-boxes', subtopicId: 'toli-raodenoba', difficulty: 3 }),
    prompt: 'სამ ყუთში არის {a}, {b} და {c} კუბიკი. რამდენია კუბიკების საერთო რაოდენობა?',
    variables: {
      a: { kind: 'int', min: 2, max: 12 },
      b: { kind: 'int', min: 2, max: 12 },
      c: { kind: 'int', min: 2, max: 12 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 6, max: 36, entry: true },
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),
];

/* ================================================================== *\
 * Export
 * ================================================================== */

export const U05_TEMPLATES: QuestionTemplate[] = [
  ...u051,
  ...u052,
  ...u053,
  ...u054,
  ...u055,
  ...u056,
  ...u057,
  ...u058,
];

/** Subtopic ids this library is responsible for. */
export const U05_SUBTOPICS = [
  'meti-naklebi-toli',
  'Sedareba10',
  'Sedareba100',
  'ramdenit-meti',
  'SeFaseba-aTeulamde',
  'dalageba',
  'dalageba-danayi',
  'toli-raodenoba',
] as const;

export { signOf };
