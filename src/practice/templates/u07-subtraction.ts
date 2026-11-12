import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

/**
 * U07 — გამოკლება (subtraction).
 *
 * The seventh grade-1 unit, and the mirror of U06. The learning goal is what
 * subtraction *means* — taking away, finding what is left, finding the
 * difference between two quantities — so almost every question is a sentence
 * about real objects, and the arithmetic is the last step.
 *
 * Five rules hold the library together:
 *
 *  1. **A difference is never negative.** The subtrahend is drawn from what is
 *     left of the minuend, so `a − b ≥ 0` by construction and no draw has to be
 *     rejected. The unit's own note says a negative result must be a separate
 *     learning goal, and it is not one here.
 *  2. **The picture is the minuend, and the crossed-out part is the
 *     subtrahend.** A row of nine stars with four crossed out is drawn from the
 *     same two numbers the answer is read from, so a child who counts the
 *     picture and a child who subtracts arrive at the same number.
 *  3. **The level is the work, not the size of the numbers.** Level 1 takes
 *     away and counts what is left; level 2 reads a difference off a table or
 *     walks a number line; level 3 combines several steps, works backwards from
 *     a result, or asks for what is missing rather than what is left.
 *  4. **A missing number is solved from the equation**, not stored: „8 − ? = 5“
 *     is `8 − 5`, and „? − 6 = 9“ is `9 + 6`. The direction is chosen by which
 *     side of the equation is blank — the one place where subtraction and
 *     addition genuinely meet.
 *  5. **True/false is decided by arithmetic**, and the false claims are off by
 *     one or two rather than by ten, so computing is the only way through.
 *
 * Two shapes the unit asks for are **recast** because the engine grades one
 * answer per question, both recorded in U07-MAPPING.md:
 *
 *  - Q5 „name the minuend, subtrahend and difference“ becomes one ordered
 *    answer, which is the same three numbers in the same order.
 *  - Q48 „select every expression whose difference is 7“ becomes „which
 *    expression has a difference of 7“, one correct expression among
 *    distractors.
 *
 * U07.11 (choose the minuend and subtrahend by dragging) and U07.12 (fill the
 * subtraction table) are built as the spec asks: both are in the curriculum, so
 * both have to be playable.
 */

const grade = 1 as const;
const topicId = 'Gamokleba';
const unitId = 'Gamokleba';

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

interface Thing {
  emoji: string;
  /**
   * The singular, printed after every numeral.
   *
   * Georgian takes the singular after a count — „5 ბურთი“, never „5 ბურთები“ —
   * and every noun in this unit follows a count or a quantifier.
   */
  name: string;
  /**
   * The genitive — „ვაშლის“, „მსხლის“.
   *
   * Needed by the „X-ისა და Y-ის“ constructions. Stored rather than built by
   * appending „ის“: მსხალი loses its final vowel (მსხლის), so a suffix would
   * print „მსხალიის“.
   */
  gen: string;
}

const THINGS: Thing[] = [
  { emoji: '🍎', name: 'ვაშლი', gen: 'ვაშლის' },
  { emoji: '⚽', name: 'ბურთი', gen: 'ბურთის' },
  { emoji: '⭐', name: 'ვარსკვლავი', gen: 'ვარსკვლავის' },
  { emoji: '🎈', name: 'ბუშტი', gen: 'ბუშტის' },
  { emoji: '🌼', name: 'ყვავილი', gen: 'ყვავილის' },
  { emoji: '🐟', name: 'თევზი', gen: 'თევზის' },
  { emoji: '🔔', name: 'ზარი', gen: 'ზარის' },
  { emoji: '🍐', name: 'მსხალი', gen: 'მსხლის' },
  { emoji: '🧁', name: 'კექსი', gen: 'კექსის' },
  { emoji: '🍪', name: 'ნამცხვარი', gen: 'ნამცხვარის' },
  { emoji: '🟠', name: 'ფორთოხალი', gen: 'ფორთოხლის' },
  { emoji: '🍌', name: 'ბანანი', gen: 'ბანანის' },
];

const THING_NAMES = THINGS.map((thing) => thing.name);
const thingByName = (name: string): Thing =>
  THINGS.find((thing) => thing.name === name) ?? THINGS[0];

/**
 * Children's names in the two cases this unit prints.
 *
 * „ლუკას ჰქონდა“ and „მან … მისცა“ — the possessor of „ჰქონდა“ takes the
 * **dative**, exactly as the possessor of „აქვს“ does. The endings are
 * irregular (მარიამი → მარიამს, ანა → ანას by dropping its final vowel), so the
 * forms are stored and nothing is glued on at generation time.
 */
interface Child {
  name: string;
  /** The dative — „ლუკას“ for „ლუკას ჰქონდა“. */
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
 * Small helpers
 * ================================================================== */

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index);

/** A row of one emoji, one space between objects. */
const draw = (emoji: string, count: number): string =>
  Array.from({ length: count }, () => emoji).join(' ');

/**
 * A row with the taken-away objects struck through.
 *
 * The whole row is the minuend and the struck part is the subtrahend, so the
 * child can count either "what is left" or "what is gone" and both agree with
 * the sentence. Past twenty objects the counts are printed instead of the
 * objects, because a row that long stops being countable by eye.
 */
const drawTakeAway = (label: string, emoji: string, whole: number, gone: number): string => {
  if (whole === 0) return `${label}: არაფერი`;
  if (whole > 20) return `${label}: ${whole} (${gone} მოშორებული)`;
  const kept = Array.from({ length: whole - gone }, () => emoji);
  const removed = Array.from({ length: gone }, () => `~~${emoji}~~`);
  return `${label}: ${[...kept, ...removed].join(' ')}`;
};

/** Two groups, one above the other. */
const drawTwoGroups = (
  first: { label: string; emoji: string; count: number },
  second: { label: string; emoji: string; count: number },
): string => `${drawGroup(first.label, first.emoji, first.count)}\n${drawGroup(second.label, second.emoji, second.count)}`;

const drawGroup = (label: string, emoji: string, count: number): string => {
  if (count === 0) return `${label}: არაფერი`;
  return count <= 20 ? `${label}: ${draw(emoji, count)}` : `${label}: ${count}`;
};

/**
 * A number line drawn *backwards* from a start, so a walk to the left is
 * visible without anything to the left of the destination.
 */
const drawLineBack = (from: number, steps: number): string => {
  const ticks = range(from - steps, from);
  const first = ticks[0];
  const row = ticks.map((tick) => (tick === first ? `${tick}?` : String(tick))).join(' — ');
  return row;
};


/**
 * Wrong answers for a difference, chosen as the mistakes children make.
 *
 * `a + b` is the classic (subtracting by adding), `a` and `b` are the two
 * printed numbers read back, and ±1 catches the counting slip.
 */
const differenceDistractors = (a: number, b: number): number[] => {
  const answer = a - b;
  const wrong = new Set<number>();
  wrong.add(answer + 1);
  wrong.add(answer - 1);
  // Adding instead of subtracting is the mistake this unit exists to catch.
  wrong.add(a + b);
  // Reading one of the printed numbers back.
  wrong.add(a);
  wrong.delete(answer);
  return [...wrong].filter((value) => value >= 0);
};

/**
 * Wrong answers for a missing number, where the answer is a whole or a part.
 *
 * The candidates are the printed numbers themselves plus their neighbours, so
 * the child cannot answer by picking the number that was not mentioned.
 */
const missingDistractors = (answer: number, printed: number[]): number[] => {
  const candidates = [answer + 1, answer - 1, answer + 2, ...printed, ...printed.map((n) => n + 1)];
  return [...new Set(candidates)].filter((value) => value !== answer && value >= 0);
};

/* ================================================================== *\
 * U07.1 — გამოკლების მნიშვნელობა და ტერმინები
 * ================================================================== */

const u071: QuestionTemplate[] = [
  /**
   * Level 1 — apples taken from a basket (Q1).
   *
   * The picture is the basket before and after, so the child can count what is
   * left rather than recall a fact.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-1-basket', subtopicId: 'ra-aris-Gamokleba', difficulty: 1 }),
    prompt: 'კალათაში {a} {item}ა. {b} {item} აიღეს. რამდენი {item} დარჩა?',
    variables: {
      item: { kind: 'choice', values: THING_NAMES },
      a: { kind: 'int', min: 2, max: 10 },
      b: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, Number(v.a) - 1) },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
    visual: (v: Vars) => {
      const thing = thingByName(String(v.item));
      return drawTakeAway('კალათა', thing.emoji, Number(v.a), Number(v.b));
    },
  }),

  /**
   * Level 1 — which operation means "took three away from six" (Q2).
   *
   * All three options are real expressions built from the two printed numbers,
   * and the addition one is the mistake the question exists to catch.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-1-which-operation', subtopicId: 'ra-aris-Gamokleba', difficulty: 1 }),
    prompt: 'რომელი მოქმედება გვიჩვენებს, რომ {a} საგნიდან {b} საგანი მოვაშორეთ?',
    variables: {
      a: { kind: 'int', min: 3, max: 10 },
      b: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, Number(v.a) - 1) },
    },
    answer: (v: Vars) => `${v.a} − ${v.b}`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      // „took b away“ is subtraction; addition, the doubling and the reverse
      // order are the three things a child writes instead.
      return [`${a} + ${b}`, `${b} + ${b}`, `${b} − ${a}`].filter(
        (option) => option !== `${a} − ${b}`,
      );
    },
    explanation: ({ answer }) => `მოშორება არის გამოკლება: ${answer}.`,
    visual: (v: Vars) =>
      drawTakeAway('სურათზე', '⬛', Number(v.a), Number(v.b)),
  }),

  /**
   * Level 2 — which number is the minuend (Q3).
   *
   * The three numbers are printed as one equation and the student names the
   * one the question asks for. All three are options, so the child has to know
   * which term is which rather than spot a leftover.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-1-name-minuend', subtopicId: 'ra-aris-Gamokleba', difficulty: 2 }),
    prompt: 'გამოკლების გამოსახულებაში ({a} − {b} = {c}) რომელი რიცხვია საკლები?',
    variables: {
      b: { kind: 'int', min: 1, max: 8 },
      c: { kind: 'int', min: 1, max: 9 },
      // The minuend is derived, so the printed equation is true by construction.
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.c)] },
    },
    constraints: [{ note: 'the minuend stays a single or small two-digit number', test: (v: Vars) => Number(v.a) <= 20 }],
    answer: (v: Vars) => Number(v.a),
    format: { kind: 'integer', min: 0 },
    optionCount: 3,
    distractors: ({ vars }) => [Number(vars.b), Number(vars.c)],
    explanation: ({ vars, answer }) =>
      `${answer} არის საკლები — რიცხვი, რომელსაც ვაკლებთ ${vars.b}-ს.`,
  }),

  /** Level 2 — which number is the difference (Q4). */
  defineTemplate({
    ...at({ id: 'g1-u07-1-name-difference', subtopicId: 'ra-aris-Gamokleba', difficulty: 2 }),
    prompt: 'გამოკლების გამოსახულებაში ({a} − {b} = {c}) რომელი რიცხვია სხვაობა?',
    variables: {
      a: { kind: 'int', min: 10, max: 20 },
      b: { kind: 'int', min: 2, max: 9 },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.a) - Number(v.b)] },
    },
    answer: (v: Vars) => Number(v.c),
    format: { kind: 'integer', min: 0 },
    optionCount: 3,
    distractors: ({ vars }) => [Number(vars.a), Number(vars.b)],
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}, ამიტომ სხვაობა ${answer}-ია.`,
  }),

  /**
   * Level 3 — name all three terms (Q5).
   *
   * Recast as one ordered answer: the three numbers in the order the question
   * names them (საკლები, მაკლები, სხვაობა). The engine grades a sequence
   * exactly, so partial credit is not silently given for the right numbers in
   * the wrong roles.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-1-name-all-terms', subtopicId: 'ra-aris-Gamokleba', difficulty: 3 }),
    prompt: 'გამოსახულებაში ({a} − {b} = {c}) ჩაწერე ზედიზედ საკლები, მაკლები და სხვაობა, მძიმეებით გამოყოფილი.',
    variables: {
      a: { kind: 'int', min: 11, max: 20 },
      b: { kind: 'int', min: 2, max: 9 },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.a) - Number(v.b)] },
    },
    answer: (v: Vars) => `${v.a}, ${v.b}, ${v.c}`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [
      // The same three numbers in the two other orders, which is exactly the
      // mistake of not knowing which term is which.
      `${vars.b}, ${vars.a}, ${vars.c}`,
      `${vars.a}, ${vars.c}, ${vars.b}`,
    ],
    explanation: ({ vars, answer }) =>
      `საკლებია ${vars.a}, მაკლები — ${vars.b}, სხვაობა — ${vars.c}. პასუხი: ${answer}.`,
  }),

  /**
   * Level 3 — which expression has a difference of four (Q6).
   *
   * Recast from „select every expression whose difference is 4“ to „which one
   * does“, the spec's own stated shape for the answer. Every option is a real
   * subtraction, and exactly one evaluates to the target.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-1-which-difference', subtopicId: 'ra-aris-Gamokleba', difficulty: 3 }),
    prompt: 'რომელი გამოსახულების სხვაობაა {target}?',
    variables: {
      target: { kind: 'int', min: 1, max: 6 },
      a: { kind: 'int', min: 6, max: 20 },
      b: { kind: 'int', min: 1, max: 9 },
    },
    constraints: [
      { note: 'the correct pair really differs by the target', test: (v: Vars) => Number(v.a) - Number(v.b) === Number(v.target) },
    ],
    answer: (v: Vars) => `${v.a} − ${v.b}`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const target = Number(vars.target);
      // Two other subtractions that are close but land on a different number.
      return [`${a} − ${b + 1}`, `${a + 1} − ${b}`, `${a + target} − ${b}`]
        .filter((option) => option !== `${a} − ${b}`)
        .filter((option) => {
          const [x, y] = option.split(' − ').map(Number);
          return x - y !== target && x >= 0 && y >= 0 && x - y >= 0;
        });
    },
    explanation: ({ vars, answer }) => `${answer} = ${vars.target}.`,
  }),
];

/* ================================================================== *\
 * U07.2 — გამოკლება სურათების დახმარებით 10-ის ფარგლებში
 * ================================================================== */

const u072: QuestionTemplate[] = [
  /** Level 1 — balls disappearing from a picture (Q7). */
  defineTemplate({
    ...at({ id: 'g1-u07-2-balls', subtopicId: 'SuratiT-10-gamokleba', difficulty: 1 }),
    prompt: 'სურათზე არის {a} ბურთი. {b} ბურთი გაქრა. რამდენი ბურთი დარჩა?',
    variables: {
      a: { kind: 'int', min: 2, max: 10 },
      b: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, Number(v.a) - 1) },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
    visual: (v: Vars) => drawTakeAway('ბურთები', '⚽', Number(v.a), Number(v.b)),
  }),

  /** Level 1 — birds flying off a branch (Q8). */
  defineTemplate({
    ...at({ id: 'g1-u07-2-birds', subtopicId: 'SuratiT-10-gamokleba', difficulty: 1 }),
    prompt: 'ტოტზე {a} ჩიტი იჯდა. {b} გაფრინდა. რამდენი დარჩა?',
    variables: {
      a: { kind: 'int', min: 3, max: 10 },
      b: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, Number(v.a) - 1) },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
    visual: (v: Vars) => drawTakeAway('ტოტზე', '🐦', Number(v.a), Number(v.b)),
  }),

  /** Level 2 — stars crossed out (Q9). */
  defineTemplate({
    ...at({ id: 'g1-u07-2-stars', subtopicId: 'SuratiT-10-gamokleba', difficulty: 2 }),
    prompt: 'სურათზე არის {a} ვარსკვლავი. {b} მათგანი გადაიხაზა. რამდენი ვარსკვლავი დარჩა?',
    variables: {
      a: { kind: 'int', min: 4, max: 10 },
      b: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, Number(v.a) - 1) },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
    visual: (v: Vars) => drawTakeAway('ვარსკვლავები', '⭐', Number(v.a), Number(v.b)),
  }),

  /** Level 2 — cubes removed (Q10). */
  defineTemplate({
    ...at({ id: 'g1-u07-2-cubes', subtopicId: 'SuratiT-10-gamokleba', difficulty: 2 }),
    prompt: 'მოცემულია {a} კუბიკი. {b} კუბიკი მოაშორეს. რამდენი კუბიკი დარჩა?',
    variables: {
      a: { kind: 'int', min: 4, max: 10 },
      b: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, Number(v.a) - 1) },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
    visual: (v: Vars) => drawTakeAway('კუბიკები', '🟦', Number(v.a), Number(v.b)),
  }),

  /**
   * Level 3 — how many are hidden (Q11).
   *
   * The whole is stated, some are shown, and the answer is what is *not* shown.
   * The picture draws exactly the visible part, so the hidden ones are the only
   * ones missing from it — the gap between the sentence and the drawing is the
   * question.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-2-hidden', subtopicId: 'SuratiT-10-gamokleba', difficulty: 3 }),
    prompt: 'სურათზე სულ {a} {item}ა. რამდენიმე დამალულია, ხოლო {visible} ჩანს. რამდენია დამალული?',
    variables: {
      item: { kind: 'choice', values: THING_NAMES },
      a: { kind: 'int', min: 5, max: 10 },
      visible: { kind: 'int', min: 2, max: (v: Vars) => Math.max(2, Number(v.a) - 1) },
    },
    constraints: [
      { note: 'some really are hidden, and the visible part is countable', test: (v: Vars) => Number(v.a) > Number(v.visible) },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.visible),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) =>
      missingDistractors(Number(vars.a) - Number(vars.visible), [Number(vars.a), Number(vars.visible)]).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.visible} = ${answer}, ამიტომ დამალულია ${answer}.`,
    visual: (v: Vars) => {
      const thing = thingByName(String(v.item));
      return `${drawGroup('ჩანს', thing.emoji, Number(v.visible))}\nდამალული: ?`;
    },
  }),

  /**
   * Level 3 — how many must be removed to leave three (Q12).
   *
   * The inverse of the rest of the subtopic: the remaining count is fixed and
   * the removed count is the answer.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-2-remove-to', subtopicId: 'SuratiT-10-gamokleba', difficulty: 3 }),
    prompt: 'მოცემულია {a} {item}. რამდენი უნდა მოვაშოროთ, რომ {left} დარჩეს?',
    variables: {
      item: { kind: 'choice', values: THING_NAMES },
      a: { kind: 'int', min: 6, max: 10 },
      left: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, Number(v.a) - 2) },
    },
    constraints: [{ note: 'something really has to be removed', test: (v: Vars) => Number(v.a) > Number(v.left) }],
    answer: (v: Vars) => Number(v.a) - Number(v.left),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) =>
      missingDistractors(Number(vars.a) - Number(vars.left), [Number(vars.a), Number(vars.left)]).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${answer} = ${vars.left}, ამიტომ ${answer} უნდა მოვაშოროთ.`,
    visual: (v: Vars) => {
      const thing = thingByName(String(v.item));
      return drawGroup('სურათზე', thing.emoji, Number(v.a));
    },
  }),
];

/* ================================================================== *\
 * U07.3 — ტექსტური ამოცანები გამოკლებაზე
 * ================================================================== */

const u073: QuestionTemplate[] = [
  /** Level 1 — pencils given away (Q13). */
  defineTemplate({
    ...at({ id: 'g1-u07-3-pencils', subtopicId: 'teqsti-gamokleba', difficulty: 1 }),
    prompt: '{who} ჰქონდა {a} ფანქარი. მან {b} ფანქარი მეგობარს აჩუქა. რამდენი ფანქარი დარჩა?',
    variables: {
      who: { kind: 'choice', values: WHOM },
      a: { kind: 'int', min: 3, max: 10 },
      b: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, Number(v.a) - 1) },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} ფანქარი.`,
  }),

  /** Level 1 — cakes eaten (Q14). */
  defineTemplate({
    ...at({ id: 'g1-u07-3-cakes', subtopicId: 'teqsti-gamokleba', difficulty: 1 }),
    prompt: 'თეფშზე იდო {a} ნამცხვარი. ბავშვებმა {b} შეჭამეს. რამდენი ნამცხვარი დარჩა?',
    variables: {
      a: { kind: 'int', min: 3, max: 10 },
      b: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, Number(v.a) - 1) },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} ნამცხვარი.`,
  }),

  /** Level 2 — balls sold (Q15). */
  defineTemplate({
    ...at({ id: 'g1-u07-3-shop', subtopicId: 'teqsti-gamokleba', difficulty: 2 }),
    prompt: 'მაღაზიაში იყო {a} ბურთი. {b} გაიყიდა. რამდენი ბურთი დარჩა?',
    variables: {
      a: { kind: 'int', min: 12, max: 20 },
      b: { kind: 'int', min: 3, max: 9 },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} ბურთი.`,
  }),

  /** Level 2 — books taken from a shelf (Q16). */
  defineTemplate({
    ...at({ id: 'g1-u07-3-books', subtopicId: 'teqsti-gamokleba', difficulty: 2 }),
    prompt: 'ბიბლიოთეკაში იყო {a} წიგნი. მოსწავლეებმა {b} წიგნი წაიღეს. რამდენი წიგნი დარჩა თაროზე?',
    variables: {
      a: { kind: 'int', min: 21, max: 30 },
      b: { kind: 'int', min: 4, max: 9 },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} წიგნი.`,
  }),

  /** Level 3 — stickers given to a friend (Q17). */
  defineTemplate({
    ...at({ id: 'g1-u07-3-stickers', subtopicId: 'teqsti-gamokleba', difficulty: 3 }),
    prompt: '{who} ჰქონდა {a} სტიკერი. მან {b} სტიკერი მეგობარს მისცა. რამდენი სტიკერი დარჩა?',
    variables: {
      who: { kind: 'choice', values: WHOM },
      a: { kind: 'int', min: 30, max: 45 },
      b: { kind: 'int', min: 11, max: 19 },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} სტიკერი.`,
  }),

  /** Level 3 — passengers getting off a bus (Q18). */
  defineTemplate({
    ...at({ id: 'g1-u07-3-bus', subtopicId: 'teqsti-gamokleba', difficulty: 3 }),
    prompt: 'ავტობუსში {a} მგზავრი იყო. გაჩერებაზე {b} მგზავრი ჩავიდა. რამდენი მგზავრი დარჩა ავტობუსში?',
    variables: {
      a: { kind: 'int', min: 40, max: 55 },
      b: { kind: 'int', min: 15, max: 25 },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} მგზავრი.`,
  }),
];

/* ================================================================== *\
 * U07.4 — გამოკლება რიცხვით ღერძზე
 * ================================================================== */

/**
 * A walk to the left on a number line.
 *
 * The line is drawn from `start − steps` to `start`, so the destination is the
 * first tick and nothing to the left of it is visible — the picture never marks
 * the answer. The arithmetic is `start − steps` like every other difference in
 * the unit; the line is the model, not a separate kind of subtraction.
 */
const walkLeft = (spec: {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
  start: { min: number; max: number };
  steps: { min: number; max: number };
}): QuestionTemplate =>
  defineTemplate({
    ...at({ id: spec.id, subtopicId: spec.subtopicId, difficulty: spec.difficulty }),
    prompt: 'დაიწყე {a}-დან და რიცხვით ღერძზე გადადი {b} ნაბიჯით მარცხნივ. სად მოხვდები?',
    variables: {
      a: { kind: 'int', min: spec.start.min, max: spec.start.max },
      b: { kind: 'int', min: spec.steps.min, max: (v: Vars) => Math.max(spec.steps.min, Math.min(spec.steps.max, Number(v.a))) },
    },
    constraints: [{ note: 'the walk never leaves the line', test: (v: Vars) => Number(v.a) - Number(v.b) >= 0 }],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [a - b + 1, a - b - 1, a + b, a - b + 2]
        .filter((value) => value !== a - b && value >= 0)
        .map(String);
    },
    explanation: ({ vars, answer }) =>
      `${vars.a}-დან ${vars.b} ნაბიჯი მარცხნივ: ${vars.a} − ${vars.b} = ${answer}.`,
    visual: (v: Vars) => drawLineBack(Number(v.a), Number(v.b)),
  });

const u074: QuestionTemplate[] = [
  /** Level 1 — three steps left from seven (Q19). */
  walkLeft({
    id: 'g1-u07-4-walk-small',
    subtopicId: 'xazze-gamokleba',
    difficulty: 1,
    start: { min: 3, max: 10 },
    steps: { min: 1, max: 4 },
  }),

  /** Level 1 — a different start, a different walk (Q20). */
  walkLeft({
    id: 'g1-u07-4-walk-small-two',
    subtopicId: 'xazze-gamokleba',
    difficulty: 1,
    start: { min: 5, max: 12 },
    steps: { min: 2, max: 5 },
  }),

  /** Level 2 — a walk from the teens (Q21). */
  walkLeft({
    id: 'g1-u07-4-walk-teen',
    subtopicId: 'xazze-gamokleba',
    difficulty: 2,
    start: { min: 12, max: 20 },
    steps: { min: 5, max: 9 },
  }),

  /** Level 2 — a walk across twenty (Q22). */
  walkLeft({
    id: 'g1-u07-4-walk-twenties',
    subtopicId: 'xazze-gamokleba',
    difficulty: 2,
    start: { min: 20, max: 30 },
    steps: { min: 6, max: 12 },
  }),

  /** Level 3 — a long walk from the sixties (Q23). */
  walkLeft({
    id: 'g1-u07-4-walk-large',
    subtopicId: 'xazze-gamokleba',
    difficulty: 3,
    start: { min: 50, max: 70 },
    steps: { min: 15, max: 25 },
  }),

  /**
   * Level 3 — the walk in reverse (Q24).
   *
   * The endpoint is given and the start is the answer, which turns the
   * subtraction into an addition. Same line, read backwards.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-4-walk-back', subtopicId: 'xazze-gamokleba', difficulty: 3 }),
    prompt: 'რიცხვით ღერძზე მოსწავლემ მარცხნივ {steps} ნაბიჯი გადადგა და {end}-ზე აღმოჩნდა. რომელი რიცხვიდან დაიწყო?',
    variables: {
      start: { kind: 'int', min: 20, max: 60 },
      steps: { kind: 'int', min: 5, max: 20 },
      end: { kind: 'choice', values: (v: Vars) => [Number(v.start) - Number(v.steps)] },
    },
    constraints: [{ note: 'the endpoint is not negative', test: (v: Vars) => Number(v.end) >= 0 }],
    answer: (v: Vars) => Number(v.end) + Number(v.steps),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const answer = Number(vars.end) + Number(vars.steps);
      return [answer + 1, answer - 1, Number(vars.end) - Number(vars.steps), answer + 2]
        .filter((value) => value !== answer && value >= 0)
        .map(String);
    },
    explanation: ({ vars, answer }) =>
      `${vars.end} + ${vars.steps} = ${answer}, ამიტომ დაწყებითი რიცხვი ${answer}-ია.`,
    visual: (v: Vars) => {
      // The line is drawn from the *unknown* start, so it begins one tick below
      // the endpoint rather than revealing the answer — and the „?" goes on
      // that first, missing tick.
      const end = Number(v.end);
      const first = Math.max(0, end - 1);
      const ticks = range(first, first + Math.min(Number(v.steps), 6));
      return ticks.map((tick) => (tick === first ? '?' : String(tick))).join(' — ');
    },
  }),
];

/* ================================================================== *\
 * U07.5 — ნულისა და თვით რიცხვის გამოკლება; განახევრება
 * ================================================================== */

const u075: QuestionTemplate[] = [
  /** Level 1 — subtracting zero changes nothing (Q25). */
  defineTemplate({
    ...at({ id: 'g1-u07-5-minus-zero', subtopicId: 'nuli-taviT-gamokleba', difficulty: 1 }),
    prompt: 'კალათაში {a} {item}ა. არც ერთი არ აუღიათ. რამდენი {item} დარჩა?',
    variables: {
      item: { kind: 'choice', values: ['ვაშლი', 'ბურთი', 'ვარსკვლავი', 'კუბიკი', 'მსხალი', 'ფანქარი'] },
      a: { kind: 'int', min: 1, max: 20 },
    },
    answer: (v: Vars) => Number(v.a),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      return [0, a + 1, a - 1, a + 2].filter((value) => value !== a && value >= 0).map(String);
    },
    explanation: ({ vars, answer }) => `ნულის გამოკლება რიცხვს არ ცვლის: ${vars.a} − 0 = ${answer}.`,
  }),

  /** Level 1 — a number minus itself is zero (Q26). */
  defineTemplate({
    ...at({ id: 'g1-u07-5-minus-itself', subtopicId: 'nuli-taviT-gamokleba', difficulty: 1 }),
    prompt: 'ყუთში {a} {item} იყო. ყველა {a} {item} აიღეს. რამდენი დარჩა?',
    variables: {
      item: { kind: 'choice', values: ['ვაშლი', 'ბურთი', 'ვარსკვლავი', 'კუბიკი', 'მსხალი', 'ფანქარი'] },
      a: { kind: 'int', min: 2, max: 20 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.a)] },
    },
    answer: () => 0,
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      return [a, a + 1, 1, a - 1].filter((value) => value !== 0 && value >= 0).map(String);
    },
    explanation: ({ vars }) => `თუ იმავე რიცხვს გამოვაკლებთ, ნული რჩება: ${vars.a} − ${vars.a} = 0.`,
  }),

  /**
   * Level 2 — halving by sharing (Q27).
   *
   * The total is drawn as two equal rows so the answer is the size of one row.
   * The total is *derived* as `2 × half`, so it is always even and the share is
   * always a whole number.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-5-share', subtopicId: 'nuli-taviT-gamokleba', difficulty: 2 }),
    prompt: '{a} {item} თანაბრად გაუნაწილეს 2 ბავშვს. რამდენი {item} შეხვდა თითოეულს?',
    variables: {
      item: { kind: 'choice', values: THING_NAMES },
      half: { kind: 'int', min: 2, max: 8 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.half) * 2] },
    },
    answer: (v: Vars) => Number(v.half),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const half = Number(vars.half);
      return [half + 1, half - 1, Number(vars.a), half + 2]
        .filter((value) => value !== half && value >= 0)
        .map(String);
    },
    explanation: ({ vars, answer }) => `${vars.a} = ${answer} + ${answer}, ამიტომ თითოეულს ${answer} შეხვდა.`,
    visual: (v: Vars) => {
      const thing = thingByName(String(v.item));
      return drawTwoGroups(
        { label: 'პირველი ბავშვი', emoji: thing.emoji, count: Number(v.half) },
        { label: 'მეორე ბავშვი', emoji: thing.emoji, count: Number(v.half) },
      );
    },
  }),

  /** Level 2 — subtracting zero from a two-digit number (Q28). */
  defineTemplate({
    ...at({ id: 'g1-u07-5-zero-large', subtopicId: 'nuli-taviT-gamokleba', difficulty: 2 }),
    prompt: 'შეავსე: {a} − 0 = __.',
    variables: {
      a: { kind: 'int', min: 21, max: 60 },
    },
    answer: (v: Vars) => Number(v.a),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      return [0, a + 1, a - 1, a - 10].filter((value) => value !== a && value >= 0).map(String);
    },
    explanation: ({ vars, answer }) => `ნული ვერაფერს ცვლის: ${vars.a} − 0 = ${answer}.`,
  }),

  /**
   * Level 3 — halve a number (Q29).
   *
   * The inverse of doubling, and the third distinct way this subtopic asks
   * about two equal parts. The number is always even by construction.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-5-halve', subtopicId: 'nuli-taviT-gamokleba', difficulty: 3 }),
    prompt: 'გაანახევრე {a}.',
    variables: {
      half: { kind: 'int', min: 4, max: 25 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.half) * 2] },
    },
    answer: (v: Vars) => Number(v.half),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const half = Number(vars.half);
      return [half + 1, half - 1, Number(vars.a), half + 2]
        .filter((value) => value !== half && value >= 0)
        .map(String);
    },
    explanation: ({ vars, answer }) =>
      `განახევრება ნიშნავს ორ ტოლ ნაწილად გაყოფას: ${vars.a} = ${answer} + ${answer}.`,
  }),

  /**
   * Level 3 — the minuend that gives zero (Q30).
   *
   * The blank is on the left, so the answer is the number that was subtracted
   * *from* — the equation has to be read backwards.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-5-zero-result', subtopicId: 'nuli-taviT-gamokleba', difficulty: 3 }),
    prompt: 'შეავსე: __ − {b} = 0.',
    variables: {
      b: { kind: 'int', min: 3, max: 20 },
    },
    answer: (v: Vars) => Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const b = Number(vars.b);
      return [0, b + 1, b - 1, b + 2].filter((value) => value !== b && value >= 0).map(String);
    },
    explanation: ({ vars, answer }) =>
      `${answer} − ${vars.b} = 0, ამიტომ საკლები ${answer}-ია.`,
  }),
];

/* ================================================================== *\
 * U07.6 — სხვაობები 20-ის ფარგლებში
 * ================================================================== */

const u076: QuestionTemplate[] = [
  /** Level 1 — a small difference (Q31). */
  defineTemplate({
    ...at({ id: 'g1-u07-6-small', subtopicId: 'cxrili-20-gamokleba', difficulty: 1 }),
    prompt: 'შეავსე: {a} − {b} = __.',
    variables: {
      a: { kind: 'int', min: 6, max: 15 },
      b: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, Number(v.a) - 1) },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  /** Level 1 — a difference across ten (Q32). */
  defineTemplate({
    ...at({ id: 'g1-u07-6-across-ten', subtopicId: 'cxrili-20-gamokleba', difficulty: 1 }),
    prompt: 'შეავსე: {a} − {b} = __.',
    variables: {
      a: { kind: 'int', min: 11, max: 18 },
      b: { kind: 'int', min: 2, max: 9 },
    },
    constraints: [{ note: 'the result is not negative', test: (v: Vars) => Number(v.a) > Number(v.b) }],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  /** Level 2 — a larger subtrahend (Q33). */
  defineTemplate({
    ...at({ id: 'g1-u07-6-large-subtrahend', subtopicId: 'cxrili-20-gamokleba', difficulty: 2 }),
    prompt: 'შეავსე: {a} − {b} = __.',
    variables: {
      a: { kind: 'int', min: 13, max: 20 },
      b: { kind: 'int', min: 5, max: 9 },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  /** Level 2 — subtracting from twenty (Q34). */
  defineTemplate({
    ...at({ id: 'g1-u07-6-from-twenty', subtopicId: 'cxrili-20-gamokleba', difficulty: 2 }),
    prompt: 'შეავსე: 20 − {b} = __.',
    variables: {
      b: { kind: 'int', min: 3, max: 12 },
    },
    answer: (v: Vars) => 20 - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(20, Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `20 − ${vars.b} = ${answer}.`,
  }),

  /**
   * Level 3 — the missing subtrahend (Q35).
   *
   * „18 − ? = 6“ is `18 − 6`: the blank is the part taken away, so it is the
   * difference between the two printed numbers rather than one of them.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-6-missing-subtrahend', subtopicId: 'cxrili-20-gamokleba', difficulty: 3 }),
    prompt: 'შეავსე: {a} − __ = {c}.',
    variables: {
      a: { kind: 'int', min: 12, max: 20 },
      c: { kind: 'int', min: 2, max: 9 },
    },
    constraints: [{ note: 'the missing part is positive', test: (v: Vars) => Number(v.a) > Number(v.c) }],
    answer: (v: Vars) => Number(v.a) - Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) =>
      missingDistractors(Number(vars.a) - Number(vars.c), [Number(vars.a), Number(vars.c)]).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${answer} = ${vars.c}, ამიტომ გამოკლებული რიცხვი ${answer}-ია.`,
  }),

  /**
   * Level 3 — a difference read off a table (Q36).
   *
   * The two terms are printed as a table's headers so the child reads a table
   * rather than a bare equation, and the answer is their difference.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-6-table', subtopicId: 'cxrili-20-gamokleba', difficulty: 3 }),
    prompt: 'ცხრილში მოცემულია საკლები {a} და მაკლები {b}. იპოვე სხვაობა.',
    variables: {
      a: { kind: 'int', min: 12, max: 20 },
      b: { kind: 'int', min: 3, max: 9 },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
    visual: (v: Vars) => `საკლები\n${v.a}\n− ${v.b}\n= ?`,
  }),
];

/* ================================================================== *\
 * U07.7 — უცნობი რიცხვი
 * ================================================================== */

/**
 * „a − __ = c“ — the subtrahend is the answer.
 *
 * The difference `a − c` is what is missing, and the two printed numbers are
 * the minuend and the result.
 */
const missingPart = (spec: {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
  a: { min: number; max: number };
  c: { min: number; max: number };
}): QuestionTemplate =>
  defineTemplate({
    ...at({ id: spec.id, subtopicId: spec.subtopicId, difficulty: spec.difficulty }),
    prompt: 'შეავსე: {a} − __ = {c}.',
    variables: {
      a: { kind: 'int', min: spec.a.min, max: spec.a.max },
      c: { kind: 'int', min: spec.c.min, max: spec.c.max },
    },
    constraints: [{ note: 'the missing part is positive', test: (v: Vars) => Number(v.a) > Number(v.c) }],
    answer: (v: Vars) => Number(v.a) - Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) =>
      missingDistractors(Number(vars.a) - Number(vars.c), [Number(vars.a), Number(vars.c)]).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.c} = ${answer}, ამიტომ გამოკლებული რიცხვი ${answer}-ია.`,
  });

const u077: QuestionTemplate[] = [
  /** Level 1 — a small missing part (Q37). */
  missingPart({
    id: 'g1-u07-7-missing-small',
    subtopicId: 'uknobi-ricxvi',
    difficulty: 1,
    a: { min: 5, max: 14 },
    c: { min: 1, max: 5 },
  }),

  /**
   * Level 2 — the blank is the minuend (Q38).
   *
   * „__ − 6 = 9“ is `9 + 6`: the whole is what is missing, and it is the one
   * place in this unit where a subtraction is solved by adding.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-7-missing-whole', subtopicId: 'uknobi-ricxvi', difficulty: 2 }),
    prompt: 'შეავსე: __ − {b} = {c}.',
    variables: {
      b: { kind: 'int', min: 2, max: 9 },
      c: { kind: 'int', min: 2, max: 9 },
      // The whole is the sum of the two parts, so the blank has exactly one
      // value and it is never negative.
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.c)] },
    },
    answer: (v: Vars) => Number(v.a),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) =>
      missingDistractors(Number(vars.a), [Number(vars.b), Number(vars.c)]).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.b} + ${vars.c} = ${answer}, ამიტომ საკლები ${answer}-ია.`,
    visual: (v: Vars) => `? − ${v.b} = ${v.c}`,
  }),

  /** Level 2 — the blank is the part taken away, above ten (Q39). */
  missingPart({
    id: 'g1-u07-7-missing-mid',
    subtopicId: 'uknobi-ricxvi',
    difficulty: 2,
    a: { min: 14, max: 20 },
    c: { min: 4, max: 10 },
  }),

  /**
   * Level 3 — a difference stated in words (Q40).
   *
   * „The difference between two numbers is 14; the minuend is 35; find what was
   * subtracted.“ The same `a − c` as the level 1 shape, but the arithmetic has
   * to be built from the sentence first.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-7-missing-word', subtopicId: 'uknobi-ricxvi', difficulty: 3 }),
    prompt: 'ორ რიცხვს შორის სხვაობაა {diff}. საკლებია {a}. იპოვე მაკლები.',
    variables: {
      answer: { kind: 'int', min: 5, max: 18 },
      diff: { kind: 'int', min: 4, max: 16 },
      // The minuend is the difference plus what was taken away, so it is
      // always the larger of the two numbers.
      a: { kind: 'choice', values: (v: Vars) => [Number(v.answer) + Number(v.diff)] },
    },
    constraints: [{ note: 'the minuend stays two-digit', test: (v: Vars) => Number(v.a) >= 12 && Number(v.a) <= 60 }],
    answer: (v: Vars) => Number(v.a) - Number(v.diff),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) =>
      missingDistractors(Number(vars.a) - Number(vars.diff), [Number(vars.a), Number(vars.diff)]).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${answer} = ${vars.diff}, ამიტომ მაკლები ${answer}-ია.`,
  }),
];

/* ================================================================== *\
 * U07.8 — ჭეშმარიტი თუ მცდარი გამოკლება
 * ================================================================== */

/**
 * „Is a − b = c true?“, with c sometimes true and sometimes not.
 *
 * The claim is evaluated, never stored, and the false case shifts the true
 * difference by one or two — never by ten — so the claim is plausible and the
 * only way through is to subtract. Both answers occur by construction.
 */
const trueOrFalse = (spec: {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
  a: { min: number; max: number };
  b: { min: number; max: number };
}): QuestionTemplate =>
  defineTemplate({
    ...at({ id: spec.id, subtopicId: spec.subtopicId, difficulty: spec.difficulty }),
    prompt: 'სწორია თუ არა ტოლობა: {a} − {b} = {c}?',
    variables: {
      a: { kind: 'int', min: spec.a.min, max: spec.a.max },
      b: { kind: 'int', min: spec.b.min, max: (v: Vars) => Math.max(spec.b.min, Math.min(spec.b.max, Number(v.a) - 1)) },
      truth: { kind: 'choice', values: ['true', 'false'] },
      slip: { kind: 'choice', values: [1, 2] },
      sign: { kind: 'choice', values: [1, -1] },
      c: {
        kind: 'choice',
        values: (v: Vars) => {
          const difference = Number(v.a) - Number(v.b);
          const shifted = difference + Number(v.slip) * Number(v.sign);
          return [v.truth === 'true' || shifted <= 0 ? difference : shifted];
        },
      },
    },
    constraints: [{ note: 'the subtraction is not negative', test: (v: Vars) => Number(v.a) >= Number(v.b) }],
    answer: (v: Vars) => (Number(v.a) - Number(v.b) === Number(v.c) ? 'მართალია' : 'მცდარია'),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => [answer === 'მართალია' ? 'მცდარია' : 'მართალია'],
    explanation: ({ vars }) =>
      `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}, ${
        Number(vars.a) - Number(vars.b) === Number(vars.c)
          ? 'ამიტომ ტოლობა მართალია'
          : `ამიტომ „${vars.c}“ არასწორია`
      }.`,
  });

const u078: QuestionTemplate[] = [
  /** Level 1 — small differences (Q41, Q42). */
  trueOrFalse({
    id: 'g1-u07-8-true-small',
    subtopicId: 'martalia-tu-ara-gamokleba',
    difficulty: 1,
    a: { min: 4, max: 10 },
    b: { min: 1, max: 4 },
  }),

  /** Level 2 — differences across ten (Q43, Q44). */
  trueOrFalse({
    id: 'g1-u07-8-true-mid',
    subtopicId: 'martalia-tu-ara-gamokleba',
    difficulty: 2,
    a: { min: 12, max: 20 },
    b: { min: 5, max: 9 },
  }),

  /** Level 3 — two-digit subtraction (Q45). */
  trueOrFalse({
    id: 'g1-u07-8-true-large',
    subtopicId: 'martalia-tu-ara-gamokleba',
    difficulty: 3,
    a: { min: 25, max: 50 },
    b: { min: 10, max: 20 },
  }),
];

/* ================================================================== *\
 * U07.9 — რიცხვის მიღების სხვადასხვა გზა გამოკლებით
 * ================================================================== */

const u079: QuestionTemplate[] = [
  /**
   * Level 1 — which expression has a difference of five (Q46).
   *
   * Every option is a real subtraction and exactly one evaluates to the target,
   * so the child computes rather than recognises a shape.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-9-which-expression', subtopicId: 'gamoakeli-raodenoba', difficulty: 1 }),
    prompt: 'ყუთში {a} {item} იყო. {b} {item} აიღეს. რომელი გამოსახულება გვიჩვენებს, რამდენი დარჩა?',
    variables: {
      item: { kind: 'choice', values: THING_NAMES },
      target: { kind: 'int', min: 2, max: 10 },
      b: { kind: 'int', min: 1, max: 9 },
      // The correct expression is built to evaluate to the target, so the
      // answer is right by construction rather than by luck of the draw.
      a: { kind: 'choice', values: (v: Vars) => [Number(v.target) + Number(v.b)] },
    },
    answer: (v: Vars) => `${v.a} − ${v.b}`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const target = Number(vars.target);
      // Three *different* mistakes: one number short, one number too many, and
      // adding instead of taking away. `${a + 1} − ${b - 1}` is the same
      // expression as `${a} − ${b}` and must never be generated.
      return [
        `${a} − ${b + 1}`,
        `${a + 1} − ${b}`,
        `${a} + ${b}`,
        `${a} − ${b + 2}`,
        `${a + 2} − ${b}`,
      ]
        .filter((option) => option !== `${a} − ${b}`)
        .filter((option) => {
          const parts = option.split(' − ');
          if (parts.length !== 2) return true; // the addition is always a wrong answer
          const [x, y] = parts.map(Number);
          return x - y !== target && y > 0 && x - y >= 0;
        });
    },
    explanation: ({ vars, answer }) => `${answer} = ${vars.target}.`,
  }),

  /**
   * Level 2 — a missing part of fourteen (Q47).
   *
   * The same question one step further along: the whole and the result are
   * given and the part taken away is what is missing.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-9-missing', subtopicId: 'gamoakeli-raodenoba', difficulty: 2 }),
    prompt: 'შეავსე: {a} − __ = {c}.',
    variables: {
      a: { kind: 'int', min: 12, max: 20 },
      c: { kind: 'int', min: 2, max: 9 },
    },
    constraints: [{ note: 'the missing part is positive', test: (v: Vars) => Number(v.a) > Number(v.c) }],
    answer: (v: Vars) => Number(v.a) - Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) =>
      missingDistractors(Number(vars.a) - Number(vars.c), [Number(vars.a), Number(vars.c)]).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.c} = ${answer}, ამიტომ გამოკლებული რიცხვი ${answer}-ია.`,
  }),

  /**
   * Level 3 — the expression with a difference of seven (Q48).
   *
   * Recast from „select every expression whose difference is 7“ to „which one
   * has a difference of 7“, which is the shape the spec states for the answer.
   * The distractors are subtractions that land one away from the target.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-9-which-expression-large', subtopicId: 'gamoakeli-raodenoba', difficulty: 3 }),
    prompt:
      'საწყობში {a} {item} იყო. {b} {item} გაიყიდა. რომელი გამოსახულება გვიჩვენებს, რამდენი {item} დარჩა?',
    variables: {
      item: { kind: 'choice', values: THING_NAMES },
      target: { kind: 'int', min: 4, max: 9 },
      b: { kind: 'int', min: 2, max: 12 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.target)] },
    },
    constraints: [{ note: 'the minuend stays inside thirty', test: (v: Vars) => Number(v.a) <= 30 }],
    answer: (v: Vars) => `${v.a} − ${v.b}`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const target = Number(vars.target);
      // `${a + 1} − ${b - 1}` equals the answer and is not a distractor.
      return [`${a} − ${b + 1}`, `${a + 1} − ${b}`, `${a} + ${b}`, `${a} − ${b + 2}`, `${a + 2} − ${b}`]
        .filter((option) => option !== `${a} − ${b}`)
        .filter((option) => {
          const parts = option.split(' − ');
          if (parts.length !== 2) return true;
          const [x, y] = parts.map(Number);
          return x - y !== target && y > 0 && x - y >= 0 && x <= 30;
        });
    },
    explanation: ({ vars, answer }) => `${answer} = ${vars.target}.`,
  }),
];

/* ================================================================== *\
 * U07.10 — რამდენით ნაკლებია?
 * ================================================================== */

/**
 * „How much fewer is the second than the first?“
 *
 * Two quantities, and the answer is their difference. The wrong options are the
 * two printed quantities and their sum, so a child who adds or reads a number
 * back lands on a wrong option.
 */
const howManyFewer = (spec: {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
  a: { min: number; max: number };
  gap: { min: number; max: number };
  /** The object both plates hold. */
  items: string[];
  /** The two containers in the sentence, each with the case the prompt needs. */
  place: string;
  place2: string;
  /** Dative form of the second container, for the question. */
  second: string;
}): QuestionTemplate =>
  defineTemplate({
    ...at({ id: spec.id, subtopicId: spec.subtopicId, difficulty: spec.difficulty }),
    prompt: `${spec.place} არის {a} {item}, ${spec.place2} — {b}. რამდენით ნაკლებია ${spec.second}?`,
    variables: {
      item: { kind: 'choice', values: spec.items },
      a: { kind: 'int', min: spec.a.min, max: spec.a.max },
      b: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, Number(v.a) - spec.gap.min) },
    },
    constraints: [{ note: 'the second really is smaller', test: (v: Vars) => Number(v.a) - Number(v.b) >= spec.gap.min }],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const answer = a - b;
      return [a, b, a + b, answer + 1].filter((value) => value !== answer && value > 0).map(String);
    },
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}, ამიტომ ${answer}-ით ნაკლებია.`,
  });

const u0710: QuestionTemplate[] = [
  /** Level 1 — cakes on two plates (Q49). */
  howManyFewer({
    id: 'g1-u07-10-plates',
    subtopicId: 'ramdenit-naklebi',
    difficulty: 1,
    a: { min: 5, max: 10 },
    gap: { min: 2, max: 4 },
    items: ['ნამცხვარი', 'ვაშლი', 'მსხალი'],
    place: 'პირველ თეფშზე',
    place2: 'მეორეზე',
    second: 'მეორე თეფშზე',
  }),

  /** Level 2 — cubes in two boxes (Q50). */
  howManyFewer({
    id: 'g1-u07-10-boxes',
    subtopicId: 'ramdenit-naklebi',
    difficulty: 2,
    a: { min: 18, max: 30 },
    gap: { min: 4, max: 10 },
    items: ['კუბიკი', 'ბურთი', 'ვარსკვლავი'],
    place: 'პირველ ყუთში',
    place2: 'მეორეში',
    second: 'მეორე ყუთში',
  }),

  /**
   * Level 3 — the same comparison in a story about two children.
   *
   * The third shape is a different *reading* of the same subtraction: not "how
   * much fewer" as a bare comparison, but "how many more does the first child
   * have", which is the same difference seen from the other side.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-10-children', subtopicId: 'ramdenit-naklebi', difficulty: 3 }),
    prompt: '{who1Dat} აქვს {a} სტიკერი, {who2Dat} — {b}. რამდენით მეტი სტიკერი აქვს {who1Dat}?',
    variables: {
      // „აქვს“ takes the dative on BOTH sides, and the dative is a stored form:
      // appending „-ს“ to „დავითი“ gives „დავითი-ს“, never „დავითს“.
      who1Dat: { kind: 'choice', values: WHOM },
      who2Dat: { kind: 'choice', values: (v: Vars) => WHOM.filter((name) => name !== v.who1Dat) },
      a: { kind: 'int', min: 15, max: 35 },
      b: { kind: 'int', min: 4, max: (v: Vars) => Math.max(4, Number(v.a) - 3) },
    },
    constraints: [{ note: 'the first really has more', test: (v: Vars) => Number(v.a) - Number(v.b) >= 3 }],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const answer = a - b;
      return [a, b, a + b, answer + 1].filter((value) => value !== answer && value > 0).map(String);
    },
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}, ამიტომ ${answer}-ით მეტი.`,
  }),
];

/* ================================================================== *\
 * U07.11 — საკლებისა და მაკლების არჩევა
 * ================================================================== */

/**
 * Choose which number plays which role, by arranging them.
 *
 * The spec asks for drag-and-drop: the student places the subtrahend and the
 * minuend. The engine's `shuffle` mode is that gesture — the tiles are tapped
 * into the order the equation needs, and the key is a sequence of display
 * positions.
 *
 * The gesture is "largest first", because that is what the two roles *mean*:
 * rule 3 says a result is never negative, so the minuend is always the largest
 * of the three numbers and the first tile is always the minuend. Ordering by
 * role alone would not work — a set of three numbers that forms a true
 * equation can always be read two ways (7 − 4 = 3 and 7 − 3 = 4), so "which is
 * the subtrahend" would have no single answer. Ordering by size is
 * unambiguous and its key varies, whereas a two-tile version has exactly one
 * possible key (the other order is the answer and is rejected), which a child
 * would learn to tap without reading.
 */
const arrangeTerms = (spec: {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
  a: { min: number; max: number };
}): QuestionTemplate =>
  defineTemplate({
    ...at({ id: spec.id, subtopicId: spec.subtopicId, difficulty: spec.difficulty }),
    // Only the numbers are printed, never the finished equation: printing
    // „7 − 4 = 3“ beside the tiles would hand over the order being asked for.
    prompt:
      'მოცემულია რიცხვები {itemsText}. ჩამოაგდე ისინი კლებადობით — ჯერ უდიდესი, ბოლოს უმცირესი.',
    variables: {
      // The terms of one true equation, drawn so that the child is arranging
      // the very numbers the subtraction is made of.
      b: { kind: 'int', min: 2, max: 9 },
      c: { kind: 'int', min: 1, max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.c)] },
      items: {
        kind: 'list',
        pick: {
          values: range(1, 30),
          length: 3,
          unique: true,
          filter: (item, vars) =>
            [Number(vars.a), Number(vars.b), Number(vars.c)].includes(Number(item)),
        },
      },
      itemsText: {
        kind: 'choice',
        values: (v: Vars) => [(v.items as Array<number | string>).map(String).join(', ')],
      },
    },
    constraints: [
      { note: 'the equation is inside the declared range', test: (v: Vars) => Number(v.a) <= spec.a.max && Number(v.a) >= spec.a.min },
      {
        // Without this the three tiles can contain a repeat, and then the sort
        // has more than one right key.
        note: 'the three terms are distinct',
        test: (v: Vars) => new Set((v.items as Array<number | string>).map(Number)).size === 3,
      },
    ],
    // Largest first, so a scramble that is already descending would BE the
    // answer and is rejected by the generator.
    shuffle: { source: 'items', direction: 'desc' },
    format: { kind: 'integer', min: 0 },
    answer: (_v: Vars, ctx) => {
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((x, y) => y - x);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    explanation: ({ vars, answer }) =>
      `უდიდესი რიცხვი საკლებია: ${vars.a} − ${vars.b} = ${vars.c}. პასუხი: ${answer}.`,
  });

const u0711: QuestionTemplate[] = [
  arrangeTerms({
    id: 'g1-u07-11-arrange-small',
    subtopicId: 'Cevrebi-arCevani',
    difficulty: 1,
    a: { min: 4, max: 10 },
  }),

  /**
   * Which of these numbers may be the subtrahend?
   *
   * The three tiles are one equation's terms, and the child reads the roles off
   * the *equation* printed here — a different shape from the drag item, and the
   * one the spec's wording anticipates ("which number can be taken away").
   */
  defineTemplate({
    ...at({ id: 'g1-u07-11-which-subtrahend', subtopicId: 'Cevrebi-arCevani', difficulty: 2 }),
    prompt: 'გამოსახულებაში {a} − __ = {c} რომელი რიცხვი შეიძლება იყოს მაკლები?',
    variables: {
      b: { kind: 'int', min: 2, max: 9 },
      c: { kind: 'int', min: 1, max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.c)] },
    },
    answer: (v: Vars) => Number(v.b),
    format: { kind: 'integer', min: 0 },
    optionCount: 3,
    // The two numbers printed in the expression are the two that are NOT the
    // answer, so guessing a printed number is always wrong. `a + 1` can never
    // equal either of them, because the constraint makes a ≠ b, c.
    distractors: ({ vars }) =>
      [Number(vars.a), Number(vars.c), Number(vars.a) + 1, Number(vars.c) + 1].map(String),
    constraints: [
      {
        note: 'the subtrahend differs from the other terms',
        test: (v: Vars) => Number(v.b) !== Number(v.c) && Number(v.b) !== Number(v.a),
      },
    ],
    explanation: ({ vars, answer }) => `${vars.a} − ${answer} = ${vars.c}.`,
  }),

  arrangeTerms({
    id: 'g1-u07-11-arrange-teen',
    subtopicId: 'Cevrebi-arCevani',
    difficulty: 3,
    a: { min: 11, max: 20 },
  }),
];

/* ================================================================== *\
 * U07.12 — გამოკლების ცხრილის შევსება
 * ================================================================== */

const u0712: QuestionTemplate[] = [
  /**
   * One cell of the subtraction table.
   *
   * The row and column headers are printed above the empty cell, so the child
   * reads a table rather than a bare sum.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-12-table-cell', subtopicId: 'gamokleba-cxrili-Sevseba', difficulty: 1 }),
    prompt: 'შეავსე ცხრილის უჯრა: მწკრივი {row}, სვეტი {col}. რა რიცხვია?',
    variables: {
      row: { kind: 'int', min: 3, max: 20 },
      col: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, Number(v.row) - 1) },
    },
    answer: (v: Vars) => Number(v.row) - Number(v.col),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.row), Number(vars.col)).map(String),
    explanation: ({ vars, answer }) => `${vars.row} − ${vars.col} = ${answer}.`,
    visual: (v: Vars) => `         სვეტი ${v.col}\nმწკრივი ${v.row} │    ?`,
  }),

  /**
   * The same table read backwards (Q35's shape, inside the table).
   *
   * The row header and the cell's value are given; the column header — the
   * number taken away — is what is missing.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-12-table-missing-col', subtopicId: 'gamokleba-cxrili-Sevseba', difficulty: 2 }),
    prompt: 'ცხრილის {row}-ე მწკრივში {col}-ე სვეტის უჯრა არის {diff}. რამდენია სვეტის სათაური?',
    variables: {
      row: { kind: 'int', min: 6, max: 20 },
      col: { kind: 'int', min: 1, max: 6 },
      // The cell value is derived from the headers, so the three numbers always
      // agree: row − column = cell, and never negative.
      diff: { kind: 'choice', values: (v: Vars) => [Number(v.row) - Number(v.col)] },
    },
    answer: (v: Vars) => Number(v.col),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) =>
      missingDistractors(Number(vars.col), [Number(vars.row), Number(vars.diff)]).map(String),
    explanation: ({ vars, answer }) => `${vars.row} − ${answer} = ${vars.diff}.`,
    visual: (v: Vars) => `         სვეტი ?\nმწკრივი ${v.row} │  ${v.diff}`,
  }),

  /**
   * A whole row, read in order.
   *
   * The cells printed are `c + 1`, `c + 2`, `c + 3` subtracted from the row
   * header, so each cell is one less than the last and the last is the answer.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-12-table-row', subtopicId: 'gamokleba-cxrili-Sevseba', difficulty: 2 }),
    prompt: 'ცხრილის {row}-ე მწკრივში ჩაწერილია {a} − 1, {a} − 2, {a} − 3. რა არის ბოლო უჯრის რიცხვი?',
    variables: {
      row: { kind: 'int', min: 6, max: 20 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.row)] },
    },
    answer: (v: Vars) => Number(v.a) - 3,
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const answer = Number(vars.a) - 3;
      return [answer + 1, answer - 1, Number(vars.a) - 2, Number(vars.a)]
        .filter((value) => value !== answer && value >= 0)
        .map(String);
    },
    explanation: ({ vars, answer }) => `ბოლო უჯრა: ${vars.a} − 3 = ${answer}.`,
  }),

  /**
   * Two cells in one row compared.
   *
   * Both cells share the row header, so the difference between the cells is the
   * difference between the two columns — the shared minuend cancels, which is
   * the first taste of structure rather than fact.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-12-table-two-cells', subtopicId: 'gamokleba-cxrili-Sevseba', difficulty: 3 }),
    prompt: 'ცხრილში ერთ უჯრაში არის {a} − {x}, მეზობელში — {a} − {y}. რამდენით ნაკლებია მეორე უჯრა?',
    variables: {
      a: { kind: 'int', min: 8, max: 20 },
      x: { kind: 'int', min: 1, max: 5 },
      // y is the larger column, so the second cell — the same minuend, more
      // taken away — is genuinely the smaller one. Asking „by how much is the
      // second smaller“ when it was the larger was a false premise, not a hard
      // question.
      y: { kind: 'int', min: 6, max: 9 },
    },
    constraints: [
      { note: 'the two cells differ, and both are non-negative', test: (v: Vars) => Number(v.y) > Number(v.x) && Number(v.a) - Number(v.y) >= 0 },
    ],
    answer: (v: Vars) => Number(v.y) - Number(v.x),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const answer = Math.abs(Number(vars.y) - Number(vars.x));
      return [answer + 1, answer - 1, Number(vars.y), Number(vars.x)]
        .filter((value) => value !== answer && value > 0)
        .map(String);
    },
    explanation: ({ vars }) =>
      `ორივე უჯრას ერთი და იგივე ${vars.a} აქვს, ამიტომ სხვაობა ${vars.x}-სა და ${vars.y}-ს შორისაა.`,
  }),

  /**
   * The diagonal of the table — where the row and column headers are equal.
   *
   * Every cell on the diagonal is `n − n = 0`, which is the one place the
   * subtraction table has a constant. The question asks for the cell next to
   * it, so the constant is used rather than merely stated.
   */
  defineTemplate({
    ...at({ id: 'g1-u07-12-table-diagonal', subtopicId: 'gamokleba-cxrili-Sevseba', difficulty: 3 }),
    prompt: 'ცხრილის დიაგონალზე, სადაც მწკრივისა და სვეტის სათაურები ტოლია, უჯრა არის 0. მის გვერდით უჯრაში მწკრივი {n} და სვეტი {m}-ია. რა რიცხვია ამ უჯრაში?',
    variables: {
      n: { kind: 'int', min: 4, max: 20 },
      m: { kind: 'int', min: 1, max: (v: Vars) => Math.max(1, Number(v.n) - 1) },
    },
    answer: (v: Vars) => Number(v.n) - Number(v.m),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => differenceDistractors(Number(vars.n), Number(vars.m)).map(String),
    explanation: ({ vars, answer }) =>
      `დიაგონალზე ${vars.n} − ${vars.n} = 0, ხოლო გვერდით ${vars.n} − ${vars.m} = ${answer}.`,
    visual: (v: Vars) => `        სვეტი ${v.m}\nმწკრივი ${v.n} │    ?\nდიაგონალზე: 0`,
  }),
];

/* ================================================================== *\
 * Export
 * ================================================================== */

export const U07_TEMPLATES: QuestionTemplate[] = [
  ...u071,
  ...u072,
  ...u073,
  ...u074,
  ...u075,
  ...u076,
  ...u077,
  ...u078,
  ...u079,
  ...u0710,
  ...u0711,
  ...u0712,
];

/** Subtopic ids this library is responsible for. */
export const U07_SUBTOPICS = [
  'ra-aris-Gamokleba',
  'SuratiT-10-gamokleba',
  'teqsti-gamokleba',
  'xazze-gamokleba',
  'nuli-taviT-gamokleba',
  'cxrili-20-gamokleba',
  'uknobi-ricxvi',
  'martalia-tu-ara-gamokleba',
  'gamoakeli-raodenoba',
  'ramdenit-naklebi',
  'Cevrebi-arCevani',
  'gamokleba-cxrili-Sevseba',
] as const;
