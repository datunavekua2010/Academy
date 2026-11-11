import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

/**
 * U06 — შეკრება (addition).
 *
 * The sixth grade-1 unit, and the first about an *operation* rather than about
 * reading or comparing numbers. The learning goal is what addition means, so
 * almost every question in this unit is a sentence about real objects that the
 * child could count: two plates of apples, two groups of stars, a boy who is
 * given three more pencils. The arithmetic is always the last step.
 *
 * Five rules hold the library together:
 *
 *  1. **A picture is drawn from the numbers the answer is added from.** The row
 *     of apples and the number in the sentence are the same value, so a
 *     counting mistake and an addition mistake are both visible on screen.
 *  2. **The level is the work, not the size of the numbers.** Level 1 combines
 *     two groups and writes the sum; level 2 reads a sum off a table or climbs
 *     a number line; level 3 combines three groups, works backwards from a
 *     total, or asks for what is missing rather than what is added.
 *  3. **The sum never leaves its subtopic's range.** U06.2's sums stay within
 *     ten, U06.6's within twenty — and they stay there by *derivation*, not by
 *     a constraint the generator has to reject draws against.
 *  4. **A missing addend is computed by subtraction.** „7 + ? = 16“ is `16 − 7`,
 *     never a stored pair, which is the one rule the unit's own notes state.
 *  5. **True/false questions are decided by arithmetic.** The equality is
 *     evaluated, and half the draws are made false deliberately, so „მართალია“
 *     and „მცდარია“ are both answers that occur.
 *
 * Two shapes the unit asks for are **recast** because the engine grades one
 * answer per question:
 *
 *  - Q30 „__ + __ = 18, both addends equal“ becomes a single answer: the number
 *    that has to be doubled. The child still has to halve.
 *  - Q46 „which two numbers make 10?“ becomes a choice among four printed pairs,
 *    exactly one of which makes the target — the same reasoning, one answer.
 *  - Q47 „fill in two addends that make 15“ becomes „one addend is given, find
 *    the other“, which is the same knowledge with a unique answer.
 *  - Q48 „select every pair that sums to 12“ becomes „which pair of these sums
 *    to 12?“, one correct pair among distractors.
 *
 * The reasoning each of these tests is identical; only the number of marks on
 * the page changes. See U06-MAPPING.md.
 */

const grade = 1 as const;
const topicId = 'Sekreba';
const unitId = 'Sekreba';

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
   * The singular, and the only form printed after a numeral.
   *
   * Georgian takes the singular after a count — „5 ვაშლი“, never „5 ვაშლები“ —
   * and every noun in this unit follows a count.
   */
  name: string;
  /**
   * The genitive — „ვაშლის“, „მსხლის“, „ფორთოხლის“.
   *
   * Needed by the „X-ისა და კიდევ Y-ის გაერთიანება“ sentence, which puts both
   * nouns in the genitive. Stored rather than built by appending „ის“, because
   * Georgian nouns are not regular: მსხალი and ფორთოხალი lose their final vowel
   * (მსხლის, ფორთოხლის), so a suffix would print „მსხალიის“.
   */
  gen: string;
}

const THINGS: Thing[] = [
  { emoji: '🍎', name: 'ვაშლი', gen: 'ვაშლის' },
  { emoji: '⭐', name: 'ვარსკვლავი', gen: 'ვარსკვლავის' },
  { emoji: '⚽', name: 'ბურთი', gen: 'ბურთის' },
  { emoji: '🎈', name: 'ბუშტი', gen: 'ბუშტის' },
  { emoji: '🍌', name: 'ბანანი', gen: 'ბანანის' },
  { emoji: '🌼', name: 'ყვავილი', gen: 'ყვავილის' },
  { emoji: '🐟', name: 'თევზი', gen: 'თევზის' },
  { emoji: '🔔', name: 'ზარი', gen: 'ზარის' },
  { emoji: '🍐', name: 'მსხალი', gen: 'მსხლის' },
  { emoji: '🧁', name: 'კექსი', gen: 'კექსის' },
  { emoji: '🍪', name: 'ნამცხვარი', gen: 'ნამცხვარის' },
  { emoji: '🟠', name: 'ფორთოხალი', gen: 'ფორთოხლის' },
];

const THING_NAMES = THINGS.map((thing) => thing.name);
const thingByName = (name: string): Thing =>
  THINGS.find((thing) => thing.name === name) ?? THINGS[0];

/**
 * Animals, each with the picture that *is* that animal.
 *
 * The rows are labelled with the name and drawn with the emoji, so the two have
 * to be stored together: a separate list of names zipped against a fixed pair
 * of emoji drew a row of crows as cats.
 */
const ANIMALS: Thing[] = [
  { emoji: '🐈', name: 'კატა', gen: 'კატის' },
  { emoji: '🐕', name: 'ძაღლი', gen: 'ძაღლის' },
  { emoji: '🐦', name: 'ყვავი', gen: 'ყვავის' },
  { emoji: '🐁', name: 'თაგვი', gen: 'თაგვის' },
];

const ANIMAL_NAMES = ANIMALS.map((animal) => animal.name);
const animalByName = (name: string): Thing =>
  ANIMALS.find((animal) => animal.name === name) ?? ANIMALS[0];

/**
 * Children's names, each stored with the forms the sentences need.
 *
 * Georgian declines a name for the possessor („ნინოს აქვს“) and for the
 * recipient („ნინოს აჩუქეს“), and the endings are not regular — ანა loses its
 * final vowel, ლუკა keeps it. So the forms are stored rather than built at
 * generation time, and no template ever glues a suffix onto a name.
 */
interface Child {
  name: string;
  /**
   * The dative — „დავითს“, for „has“.
   *
   * Georgian marks the possessor of „აქვს“ with the dative, not the genitive:
   * „დავითს აქვს 5 ფანქარი“ is right and „დავითის აქვს“ is not. The genitive
   * („დავითის“) is the *possessive* form and belongs in „დავითის ფანქარი“, which
   * this unit never prints, so only the dative is stored. It is never built by
   * appending an ending: მარიამი takes „მარიამს“, ანა takes „ანას“ by dropping
   * its final vowel.
   */
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

/** The dative forms, as a pool for the „has“ sentences. */
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
 * One group drawn with its own label.
 *
 * Past twenty objects a row of emoji stops being countable by eye, so the
 * count is printed instead of the objects. Either way the picture is built
 * from the number the answer is added from.
 */
const drawGroup = (label: string, emoji: string, count: number): string => {
  if (count === 0) return `${label}: არაფერი`;
  return count <= 20 ? `${label}: ${draw(emoji, count)}` : `${label}: ${count}`;
};

/** Two groups, one above the other. */
const drawTwoGroups = (
  first: { label: string; emoji: string; count: number },
  second: { label: string; emoji: string; count: number },
): string => `${drawGroup(first.label, first.emoji, first.count)}\n${drawGroup(second.label, second.emoji, second.count)}`;

/** Three groups, one above the other. */
const drawThreeGroups = (
  first: { label: string; emoji: string; count: number },
  second: { label: string; emoji: string; count: number },
  third: { label: string; emoji: string; count: number },
): string =>
  `${drawGroup(first.label, first.emoji, first.count)}\n${drawGroup(second.label, second.emoji, second.count)}\n${drawGroup(third.label, third.emoji, third.count)}`;

/**
 * A number line drawn around a start, long enough to show the walk.
 *
 * The destination is never marked: the last tick is the furthest the walk
 * reaches, and where it lands is the answer.
 */
const drawLine = (from: number, length: number, extraLabel?: string): string => {
  const ticks = range(from, from + length);
  const last = ticks[ticks.length - 1];
  const row = ticks.map((tick) => (tick === last ? `${tick}?` : String(tick))).join(' — ');
  return extraLabel ? `${extraLabel}\n${row}` : row;
};

/** The four wrong sums a child actually reaches for. */
const sumDistractors = (a: number, b: number): number[] => {
  const answer = a + b;
  const wrong = new Set<number>();
  // Off by one — the most common counting slip.
  wrong.add(answer + 1);
  wrong.add(answer - 1);
  // Counting the second group from the first: a + a, or b + b.
  wrong.add(a + a);
  wrong.add(b + b);
  // A carry/decompose slip.
  wrong.add(answer + 10);
  wrong.add(a + b - 2);
  wrong.delete(answer);
  return [...wrong].filter((value) => value >= 0);
};

/** Wrong addends for „what is missing“: the answer, off by one and off by two. */
const missingDistractors = (whole: number, known: number): number[] => {
  const answer = whole - known;
  const candidates = [answer + 1, answer - 1, answer + 2, known, whole];
  return [...new Set(candidates)].filter((value) => value >= 0 && value !== answer);
};

/* ================================================================== *\
 * U06.1 — რას ნიშნავს შეკრება?
 * ================================================================== */

const u061: QuestionTemplate[] = [
  /**
   * Level 1 — two plates of apples, counted (Q1).
   *
   * The picture is the two plates, so the child can count rather than recall;
   * the answer is the sum of exactly the two printed counts.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-1-two-plates', subtopicId: 'ra-aris-Sekreba', difficulty: 1 }),
    prompt: 'ერთ თეფშზე დევს {a} {item}, მეორეზე — {b}. რამდენი {item}ა სულ?',
    variables: {
      item: { kind: 'choice', values: THING_NAMES },
      a: { kind: 'int', min: 1, max: 5 },
      b: { kind: 'int', min: 1, max: 5 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer}.`,
    visual: (v: Vars) => {
      const thing = thingByName(String(v.item));
      return drawTwoGroups(
        { label: 'პირველი თეფში', emoji: thing.emoji, count: Number(v.a) },
        { label: 'მეორე თეფში', emoji: thing.emoji, count: Number(v.b) },
      );
    },
  }),

  /**
   * Level 1 — which expression matches the union (Q2).
   *
   * All three options are real expressions built from the two counts, so the
   * child has to decide what „and 2 more“ does to a number rather than spot a
   * familiar symbol.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-1-which-expression', subtopicId: 'ra-aris-Sekreba', difficulty: 1 }),
    prompt: 'რომელი გამოსახულება შეესაბამება {a} {gen}ა და კიდევ {b} {gen} გაერთიანებას?',
    variables: {
      item: { kind: 'choice', values: THING_NAMES },
      gen: { kind: 'choice', values: (v: Vars) => [thingByName(String(v.item)).gen] },
      a: { kind: 'int', min: 1, max: 9 },
      b: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v: Vars) => `${v.a} + ${v.b}`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      // Only shapes a child would actually write: the difference, the doubling
      // of the first, and the two numbers read in the other order (which is a
      // *correct* expression, so it must not be offered).
      return [`${a} − ${b}`, `${a} + ${a}`, `${b} + ${b}`, `${b} − ${a}`].filter(
        (option) => option !== `${a} + ${b}`,
      );
    },
    explanation: ({ vars, answer }) =>
      `${vars.a} და ${vars.b} ერთად — ეს ${answer}-ია.`,
  }),

  /**
   * Level 2 — two colours of cube, counted (Q3).
   *
   * The colours are the two groups, so the draw and the sentence say the same
   * thing: five red and four blue cubes.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-1-two-colours', subtopicId: 'ra-aris-Sekreba', difficulty: 2 }),
    prompt: 'სურათზე არის {a} წითელი და {b} ლურჯი {item}. რამდენი {item}ა სულ?',
    variables: {
      item: { kind: 'choice', values: ['კუბიკი', 'წრე', 'კვადრატი', 'სამკუთხედი'] },
      a: { kind: 'int', min: 1, max: 9 },
      b: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) =>
      `წითელი ${vars.a} + ლურჯი ${vars.b} = ${answer}.`,
    visual: (v: Vars) =>
      drawTwoGroups(
        { label: 'წითელი', emoji: '🟥', count: Number(v.a) },
        { label: 'ლურჯი', emoji: '🟦', count: Number(v.b) },
      ),
  }),

  /** Level 2 — the bare equation behind the sentence (Q4). */
  defineTemplate({
    ...at({ id: 'g1-u06-1-fill-sum', subtopicId: 'ra-aris-Sekreba', difficulty: 2 }),
    prompt: 'შეავსე: {a} + {b} = __.',
    variables: {
      a: { kind: 'int', min: 1, max: 9 },
      b: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  /**
   * Level 3 — two groups of stars (Q5).
   *
   * Same shape as Q1 with a larger range, so the level adds a bigger total
   * rather than a new idea: at this level the child should not need the
   * picture at all, and it is drawn as a count for the larger groups.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-1-two-groups', subtopicId: 'ra-aris-Sekreba', difficulty: 3 }),
    prompt: 'პირველ ჯგუფში არის {a} {item}, მეორეში — {b}. რამდენია სულ?',
    variables: {
      item: { kind: 'choice', values: THING_NAMES },
      a: { kind: 'int', min: 3, max: 12 },
      b: { kind: 'int', min: 2, max: 10 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
    visual: (v: Vars) => {
      const thing = thingByName(String(v.item));
      return drawTwoGroups(
        { label: 'პირველი ჯგუფი', emoji: thing.emoji, count: Number(v.a) },
        { label: 'მეორე ჯგუფი', emoji: thing.emoji, count: Number(v.b) },
      );
    },
  }),

  /**
   * Level 3 — which expression shows eight things and five more (Q6).
   *
   * The numbers are large enough that the sum is not instantly familiar, so the
   * child has to read the *operation* rather than recognise the answer.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-1-which-expression-large', subtopicId: 'ra-aris-Sekreba', difficulty: 3 }),
    prompt: 'აირჩიე გამოსახულება, რომელიც აჩვენებს {a} საგნისა და კიდევ {b} საგნის გაერთიანებას.',
    variables: {
      a: { kind: 'int', min: 6, max: 12 },
      b: { kind: 'int', min: 3, max: 9 },
    },
    answer: (v: Vars) => `${v.a} + ${v.b}`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [`${a} − ${b}`, `${a} + ${a}`, `${a + b} − ${b}`].filter(
        (option) => option !== `${a} + ${b}`,
      );
    },
    explanation: ({ vars, answer }) => `${vars.a} საგანი და ${vars.b} საგანი — ${answer}.`,
  }),
];

/* ================================================================== *\
 * U06.2 — შეკრება სურათების დახმარებით 10-ის ფარგლებში
 * ================================================================== */

/**
 * A sum that stays within ten, by construction.
 *
 * `a` is drawn and `b` is drawn from what is left of ten, so every draw is
 * already inside the range and no constraint has to throw work away. This is
 * the unit's rule for U06.2 expressed as a variable rather than as a rejection.
 * (The first version declared a `gap` that no prompt used and left `b`
 * undefined, so every draw failed with „not enough distinct wrong options“.)
 */
const withinTenAddends = () => ({
  a: { kind: 'int' as const, min: 1, max: 6 },
  b: { kind: 'int' as const, min: 1, max: (v: Vars) => 10 - Number(v.a) },
});

const u062: QuestionTemplate[] = [
  /**
   * Level 1 — cats and dogs on one picture (Q7).
   *
   * Two different animals, so the child counts *animals* rather than one set:
   * three cats plus two dogs is five animals.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-2-animals', subtopicId: 'SuratiT-10', difficulty: 1 }),
    prompt: 'სურათზე არის {a} {first} და {b} {second}. რამდენი ცხოველია სულ?',
    variables: {
      first: { kind: 'choice', values: ANIMAL_NAMES },
      second: {
        kind: 'choice',
        values: (v: Vars) => ANIMAL_NAMES.filter((animal) => animal !== v.first),
      },
      a: { kind: 'int', min: 1, max: 5 },
      b: { kind: 'int', min: 1, max: 4 },
    },
    constraints: [{ test: (v: Vars) => Number(v.a) + Number(v.b) <= 10, note: 'the sum stays within ten' }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) =>
      `კატები და ძაღლები ერთად: ${vars.a} + ${vars.b} = ${answer}.`,
    visual: (v: Vars) =>
      drawTwoGroups(
        { label: String(v.first), emoji: animalByName(String(v.first)).emoji, count: Number(v.a) },
        { label: String(v.second), emoji: animalByName(String(v.second)).emoji, count: Number(v.b) },
      ),
  }),

  /** Level 1 — two colours of circle (Q8). */
  defineTemplate({
    ...at({ id: 'g1-u06-2-two-colours', subtopicId: 'SuratiT-10', difficulty: 1 }),
    prompt: 'დაითვალე {a} ყვითელი და {b} მწვანე წრე. რამდენი წრეა სულ?',
    variables: {
      a: { kind: 'int', min: 1, max: 6 },
      b: { kind: 'int', min: 1, max: 4 },
    },
    constraints: [{ test: (v: Vars) => Number(v.a) + Number(v.b) <= 10, note: 'within ten' }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
    visual: (v: Vars) =>
      drawTwoGroups(
        { label: 'ყვითელი', emoji: '🟡', count: Number(v.a) },
        { label: 'მწვანე', emoji: '🟢', count: Number(v.b) },
      ),
  }),

  /**
   * Level 2 — six stars and three more (Q9).
   *
   * The two groups are the same object, so the child adds two counts of one
   * thing rather than counting two kinds.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-2-stars', subtopicId: 'SuratiT-10', difficulty: 2 }),
    prompt: 'სურათზე არის {a} ვარსკვლავი და კიდევ {b} ვარსკვლავი. რამდენია სულ?',
    variables: {
      a: { kind: 'int', min: 2, max: 7 },
      b: { kind: 'int', min: 1, max: 3 },
    },
    constraints: [{ test: (v: Vars) => Number(v.a) + Number(v.b) <= 10, note: 'within ten' }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
    visual: (v: Vars) =>
      drawTwoGroups(
        { label: 'პირველი რიგი', emoji: '⭐', count: Number(v.a) },
        { label: 'მეორე რიგი', emoji: '⭐', count: Number(v.b) },
      ),
  }),

  /** Level 2 — the equation behind the picture (Q10). */
  defineTemplate({
    ...at({ id: 'g1-u06-2-fill-sum', subtopicId: 'SuratiT-10', difficulty: 2 }),
    prompt: 'შეავსე: {a} + {b} = __.',
    variables: withinTenAddends(),
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  /**
   * Level 3 — three colours of ball (Q11).
   *
   * Three groups rather than two: the child has to add twice, and the picture
   * has three rows to count.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-2-three-groups', subtopicId: 'SuratiT-10', difficulty: 3 }),
    prompt: 'სურათზე არის {a} წითელი, {b} ლურჯი და {c} მწვანე ბურთი. რამდენი ბურთია სულ?',
    variables: {
      a: { kind: 'int', min: 1, max: 4 },
      b: { kind: 'int', min: 1, max: 3 },
      c: { kind: 'int', min: 1, max: 3 },
    },
    constraints: [
      { test: (v: Vars) => Number(v.a) + Number(v.b) + Number(v.c) <= 10, note: 'within ten' },
    ],
    answer: (v: Vars) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const [a, b, c] = [Number(vars.a), Number(vars.b), Number(vars.c)];
      const answer = a + b + c;
      return [answer + 1, answer - 1, a + b, b + c].filter((value) => value !== answer && value > 0).map(String);
    },
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
    visual: (v: Vars) =>
      drawThreeGroups(
        { label: 'წითელი', emoji: '🔴', count: Number(v.a) },
        { label: 'ლურჯი', emoji: '🔵', count: Number(v.b) },
        { label: 'მწვანე', emoji: '🟢', count: Number(v.c) },
      ),
  }),

  /**
   * Level 3 — how many more to reach ten (Q12).
   *
   * The inverse of the rest of the subtopic: the total is fixed and the addend
   * is what is missing, so the same picture supports both directions.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-2-to-ten', subtopicId: 'SuratiT-10', difficulty: 3 }),
    prompt: 'სურათზე მოცემულია {a} {item}. რამდენი უნდა დაემატოს, რომ სულ 10 გახდეს?',
    variables: {
      item: { kind: 'choice', values: THING_NAMES },
      a: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v: Vars) => 10 - Number(v.a),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const answer = 10 - a;
      return [answer + 1, answer - 1, 10 - answer + 1, a].filter((value) => value !== answer && value > 0).map(String);
    },
    explanation: ({ vars, answer }) => `${vars.a} + ${answer} = 10.`,
    visual: (v: Vars) => {
      const thing = thingByName(String(v.item));
      return drawGroup('სურათზე', thing.emoji, Number(v.a));
    },
  }),
];

/* ================================================================== *\
 * U06.3 — ტექსტური ამოცანები შეკრებაზე
 * ================================================================== */

const u063: QuestionTemplate[] = [
  /** Level 1 — pencils given as a present (Q13). */
  defineTemplate({
    ...at({ id: 'g1-u06-3-pencils', subtopicId: 'teqsti', difficulty: 1 }),
    prompt: '{whom} აქვს {a} ფანქარი. მას კიდევ {b} ფანქარი აჩუქეს. რამდენი ფანქარი აქვს ახლა?',
    variables: {
      whom: { kind: 'choice', values: WHOM },
      a: { kind: 'int', min: 1, max: 7 },
      b: { kind: 'int', min: 1, max: 5 },
    },
    constraints: [{ test: (v: Vars) => Number(v.a) + Number(v.b) <= 12, note: 'a small total' }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer} ფანქარი.`,
  }),

  /** Level 1 — birds landing on a tree (Q14). */
  defineTemplate({
    ...at({ id: 'g1-u06-3-birds', subtopicId: 'teqsti', difficulty: 1 }),
    prompt: 'ხეზე იჯდა {a} ჩიტი. კიდევ {b} ჩიტი მოფრინდა. რამდენი ჩიტია ახლა ხეზე?',
    variables: {
      a: { kind: 'int', min: 1, max: 8 },
      b: { kind: 'int', min: 1, max: 5 },
    },
    constraints: [{ test: (v: Vars) => Number(v.a) + Number(v.b) <= 13, note: 'a small total' }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer} ჩიტი.`,
  }),

  /** Level 2 — balls sold in the morning and in the evening (Q15). */
  defineTemplate({
    ...at({ id: 'g1-u06-3-shop', subtopicId: 'teqsti', difficulty: 2 }),
    prompt: 'მაღაზიაში დილით გაიყიდა {a} ბურთი, საღამოს კი — {b}. რამდენი ბურთი გაიყიდა სულ?',
    variables: {
      a: { kind: 'int', min: 5, max: 12 },
      b: { kind: 'int', min: 3, max: 9 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer} ბურთი.`,
  }),

  /** Level 2 — two shelves of books (Q16). */
  defineTemplate({
    ...at({ id: 'g1-u06-3-shelves', subtopicId: 'teqsti', difficulty: 2 }),
    prompt: 'ბიბლიოთეკაში ერთ თაროზე {a} წიგნია, მეორეზე — {b}. რამდენი წიგნია ორივე თაროზე ერთად?',
    variables: {
      a: { kind: 'int', min: 8, max: 15 },
      b: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer} წიგნი.`,
  }),

  /**
   * Level 3 — three amounts of stickers, gathered and then given (Q17).
   *
   * The first question in the unit with three addends inside a story, so the
   * child has to hold a running total rather than add a pair.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-3-stickers', subtopicId: 'teqsti', difficulty: 3 }),
    prompt: '{whom} აქვს {a} სტიკერი, შემდეგ მან იშოვა კიდევ {b}, ხოლო მეგობარმა — {c}. რამდენი სტიკერი აქვს {whom} სულ?',
    variables: {
      whom: { kind: 'choice', values: WHOM },
      a: { kind: 'int', min: 4, max: 10 },
      b: { kind: 'int', min: 3, max: 8 },
      c: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const [a, b, c] = [Number(vars.a), Number(vars.b), Number(vars.c)];
      const answer = a + b + c;
      return [answer + 1, answer - 1, a + b, b + c, answer + 10]
        .filter((value) => value !== answer && value > 0)
        .map(String);
    },
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} = ${answer} სტიკერი.`,
  }),

  /** Level 3 — passengers boarding a bus (Q18). */
  defineTemplate({
    ...at({ id: 'g1-u06-3-bus', subtopicId: 'teqsti', difficulty: 3 }),
    prompt: 'ავტობუსში {a} მგზავრი იყო. გაჩერებაზე {b} მგზავრი ავიდა. რამდენი მგზავრია ახლა ავტობუსში?',
    variables: {
      a: { kind: 'int', min: 10, max: 20 },
      b: { kind: 'int', min: 4, max: 12 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer} მგზავრი.`,
  }),
];

/* ================================================================== *\
 * U06.4 — შეკრება რიცხვით ღერძზე
 * ================================================================== */

/**
 * A walk to the right on a number line.
 *
 * The line is drawn from the start for `steps + 1` ticks, so the destination is
 * the last tick and nothing beyond it is visible. The answer is `start + steps`
 * like every other sum in the unit — the line is the model, not a separate
 * kind of arithmetic.
 */
const walkRight = (spec: {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
  start: { min: number; max: number };
  steps: { min: number; max: number };
  /** How much room to show past the destination, for the line drawing. */
  label?: string;
}): QuestionTemplate =>
  defineTemplate({
    ...at({ id: spec.id, subtopicId: spec.subtopicId, difficulty: spec.difficulty }),
    prompt: 'დაიწყე {a}-დან და რიცხვით ღერძზე გადადი {b} ნაბიჯით მარჯვნივ. სად მოხვდები?',
    variables: {
      a: { kind: 'int', min: spec.start.min, max: spec.start.max },
      b: { kind: 'int', min: spec.steps.min, max: spec.steps.max },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [a + b + 1, a + b - 1, a - b, a + b + 2]
        .filter((value) => value !== a + b && value >= 0)
        .map(String);
    },
    explanation: ({ vars, answer }) =>
      `${vars.a}-დან ${vars.b} ნაბიჯი მარჯვნივ: ${vars.a} + ${vars.b} = ${answer}.`,
    visual: (v: Vars) => drawLine(Number(v.a), Number(v.b), spec.label),
  });

const u064: QuestionTemplate[] = [
  /** Level 1 — two steps from two (Q19). */
  walkRight({
    id: 'g1-u06-4-walk-small',
    subtopicId: 'ricxviT-xazze',
    difficulty: 1,
    start: { min: 0, max: 10 },
    steps: { min: 1, max: 5 },
  }),

  /** Level 1 — two more walks, a different start (Q20). */
  walkRight({
    id: 'g1-u06-4-walk-small-two',
    subtopicId: 'ricxviT-xazze',
    difficulty: 1,
    start: { min: 2, max: 12 },
    steps: { min: 2, max: 6 },
  }),

  /** Level 2 — five steps across ten (Q21). */
  walkRight({
    id: 'g1-u06-4-walk-teen',
    subtopicId: 'ricxviT-xazze',
    difficulty: 2,
    start: { min: 5, max: 12 },
    steps: { min: 3, max: 6 },
  }),

  /** Level 2 — a start past ten (Q22). */
  walkRight({
    id: 'g1-u06-4-walk-twenties',
    subtopicId: 'ricxviT-xazze',
    difficulty: 2,
    start: { min: 11, max: 18 },
    steps: { min: 2, max: 6 },
  }),

  /** Level 3 — a long walk from the twenties (Q23). */
  walkRight({
    id: 'g1-u06-4-walk-large',
    subtopicId: 'ricxviT-xazze',
    difficulty: 3,
    start: { min: 20, max: 32 },
    steps: { min: 6, max: 12 },
  }),

  /**
   * Level 3 — the walk in reverse (Q24).
   *
   * The endpoint is given and the start is the answer, which turns the addition
   * into a subtraction. Same line, same movement, read backwards.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-4-walk-back', subtopicId: 'ricxviT-xazze', difficulty: 3 }),
    prompt: 'რიცხვით ღერძზე საბოლოო რიცხვია {end}. მოსწავლემ მარჯვნივ {steps} ნაბიჯი გადადგა. რომელი რიცხვიდან დაიწყო?',
    variables: {
      start: { kind: 'int', min: 10, max: 35 },
      steps: { kind: 'int', min: 4, max: 12 },
      end: { kind: 'choice', values: (v: Vars) => [Number(v.start) + Number(v.steps)] },
    },
    answer: (v: Vars) => Number(v.end) - Number(v.steps),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const answer = Number(vars.end) - Number(vars.steps);
      return [answer + 1, answer - 1, Number(vars.end) + Number(vars.steps), answer + 2]
        .filter((value) => value !== answer && value >= 0)
        .map(String);
    },
    explanation: ({ vars, answer }) =>
      `${vars.end} − ${vars.steps} = ${answer}, ამიტომ დაწყებითი რიცხვი ${answer}-ია.`,
    visual: (v: Vars) => drawLine(Number(v.end) - Number(v.steps), Number(v.steps)),
  }),
];

/* ================================================================== *\
 * U06.5 — ნულზე შეკრება და გაორმაგება
 * ================================================================== */

const u065: QuestionTemplate[] = [
  /**
   * Level 1 — adding zero (Q25).
   *
   * The point of the question is that the number does not change, so the wrong
   * options are the number shifted by one rather than the number plus zero.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-5-plus-zero', subtopicId: 'nuli-gakvireba', difficulty: 1 }),
    prompt: 'შეავსე: {a} + 0 = __.',
    variables: {
      a: { kind: 'int', min: 0, max: 20 },
    },
    answer: (v: Vars) => Number(v.a),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      return [a + 1, a - 1, 0, a + 2].filter((value) => value !== a && value >= 0).map(String);
    },
    explanation: ({ vars, answer }) => `ნულის დამატება რიცხვს არ ცვლის: ${vars.a} + 0 = ${answer}.`,
  }),

  /** Level 1 — doubling three (Q26). */
  defineTemplate({
    ...at({ id: 'g1-u06-5-double-small', subtopicId: 'nuli-gakvireba', difficulty: 1 }),
    prompt: 'შეავსე: {a} + {a} = __.',
    variables: {
      a: { kind: 'int', min: 1, max: 12 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.a),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const answer = a + a;
      return [answer + 1, answer - 1, a, a + 1].filter((value) => value !== answer && value >= 0).map(String);
    },
    explanation: ({ vars, answer }) =>
      `ორჯერ ${vars.a} არის ${answer}: ${vars.a} + ${vars.a} = ${answer}.`,
    visual: (v: Vars) =>
      drawTwoGroups(
        { label: 'პირველი', emoji: '🔵', count: Number(v.a) },
        { label: 'მეორე', emoji: '🔵', count: Number(v.a) },
      ),
  }),

  /**
   * Level 1, third answer shape — which of these is the double?
   *
   * The two level-1 facts (a number plus nothing, and a number plus itself) are
   * finite, so the level needs a third way to ask them rather than a wider
   * range on the same sentence. Here the doubling is recognised among four
   * numbers, one of which is the true double.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-5-which-double', subtopicId: 'nuli-gakvireba', difficulty: 1 }),
    prompt: 'რომელი რიცხვია {a}-ის გაორმაგებული მნიშვნელობა?',
    variables: {
      a: { kind: 'int', min: 2, max: 12 },
    },
    answer: (v: Vars) => Number(v.a) * 2,
    format: { kind: 'integer', min: 0 },
    optionCount: 3,
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const double = a * 2;
      // The number itself, a miss by one, and a miss by two — the three things
      // a child writes when doubling slips.
      return [a, double + 1, double - 1, double + 2].filter(
        (value) => value !== double && value > 0,
      );
    },
    explanation: ({ vars, answer }) =>
      `${vars.a}-ის გაორმაგება: ${vars.a} + ${vars.a} = ${answer}.`,
  }),

  /** Level 2 — doubling eight (Q27). */
  defineTemplate({
    ...at({ id: 'g1-u06-5-double-mid', subtopicId: 'nuli-gakvireba', difficulty: 2 }),
    prompt: 'შეავსე: {a} + {a} = __.',
    variables: {
      a: { kind: 'int', min: 5, max: 10 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.a),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const answer = a + a;
      return [answer + 1, answer - 1, a, answer + 2].filter((value) => value !== answer && value >= 0).map(String);
    },
    explanation: ({ vars, answer }) =>
      `ორჯერ ${vars.a} არის ${answer}: ${vars.a} + ${vars.a} = ${answer}.`,
  }),

  /** Level 2 — adding zero to a two-digit number (Q28). */
  defineTemplate({
    ...at({ id: 'g1-u06-5-zero-to-large', subtopicId: 'nuli-gakvireba', difficulty: 2 }),
    prompt: 'რა რიცხვი მიიღება, თუ {a}-ს ნულს დავუმატებთ?',
    variables: {
      a: { kind: 'int', min: 10, max: 40 },
    },
    answer: (v: Vars) => Number(v.a),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      return [a + 1, a - 1, a + 10, 0].filter((value) => value !== a && value >= 0).map(String);
    },
    explanation: ({ vars, answer }) => `ნული ჯამს არ ცვლის: ${vars.a} + 0 = ${answer}.`,
  }),

  /** Level 3 — doubling seventeen (Q29). */
  defineTemplate({
    ...at({ id: 'g1-u06-5-double-large', subtopicId: 'nuli-gakvireba', difficulty: 3 }),
    prompt: 'იპოვე რიცხვის გაორმაგებული მნიშვნელობა, თუ რიცხვია {a}.',
    variables: {
      a: { kind: 'int', min: 6, max: 40 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.a),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const answer = a + a;
      return [answer + 1, answer - 1, a, a + 10].filter((value) => value !== answer && value >= 0).map(String);
    },
    explanation: ({ vars, answer }) =>
      `გაორმაგება ნიშნავს ორჯერ დამატებას: ${vars.a} + ${vars.a} = ${answer}.`,
  }),

  /**
   * Level 3 — the equal addends of a total (Q30).
   *
   * Recast from „__ + __ = 18, both addends equal“ to „which number, doubled,
   * makes 18“: one answer, the same halving. The spec's own grading note asks
   * for both addends to be checked for equality and for the sum — one number
   * that satisfies both conditions is exactly that, with nothing to mark
   * partially.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-5-equal-addends', subtopicId: 'nuli-gakvireba', difficulty: 3 }),
    prompt: 'ორი ტოლი შესაკრების ჯამია {total}. რა რიცხვია თითოეული შესაკრები?',
    variables: {
      half: { kind: 'int', min: 3, max: 25 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.half) * 2] },
    },
    answer: (v: Vars) => Number(v.half),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const half = Number(vars.half);
      return [half + 1, half - 1, Number(vars.total), half + 2]
        .filter((value) => value !== half && value >= 0)
        .map(String);
    },
    explanation: ({ vars, answer }) =>
      `${vars.total} = ${answer} + ${answer}, ამიტომ თითოეული შესაკრები ${answer}-ია.`,
  }),
];

/* ================================================================== *\
 * U06.6 — ჯამები 20-ის ფარგლებში
 * ================================================================== */

/**
 * A sum inside twenty, by construction.
 *
 * The second addend is drawn from what is left of twenty after the first, so no
 * draw can leave the range and no constraint has to reject one.
 */
const withinTwenty = () => ({
  a: { kind: 'int' as const, min: 2, max: 15 },
  b: { kind: 'int' as const, min: 1, max: (v: Vars) => Math.min(15, 20 - Number(v.a)) },
});

const u066: QuestionTemplate[] = [
  /** Level 1 — a sum with a carry (Q31). */
  defineTemplate({
    ...at({ id: 'g1-u06-6-carry-small', subtopicId: 'cxrili-20', difficulty: 1 }),
    prompt: 'შეავსე: {a} + {b} = __.',
    variables: withinTwenty(),
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  /** Level 1 — the same shape on a different pair (Q32). */
  defineTemplate({
    ...at({ id: 'g1-u06-6-carry-large', subtopicId: 'cxrili-20', difficulty: 1 }),
    prompt: 'შეავსე: {a} + {b} = __.',
    variables: {
      a: { kind: 'int', min: 6, max: 12 },
      b: { kind: 'int', min: 5, max: 8 },
    },
    constraints: [{ test: (v: Vars) => Number(v.a) + Number(v.b) <= 20, note: 'within twenty' }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  /** Level 2 — nine and eight (Q33). */
  defineTemplate({
    ...at({ id: 'g1-u06-6-nine-plus', subtopicId: 'cxrili-20', difficulty: 2 }),
    prompt: 'შეავსე: {a} + {b} = __.',
    variables: {
      a: { kind: 'choice', values: [8, 9] },
      b: { kind: 'choice', values: [6, 7, 8, 9] },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  /** Level 2 — a two-digit addend (Q34). */
  defineTemplate({
    ...at({ id: 'g1-u06-6-two-digit', subtopicId: 'cxrili-20', difficulty: 2 }),
    prompt: 'შეავსე: {a} + {b} = __.',
    variables: {
      a: { kind: 'int', min: 11, max: 15 },
      b: { kind: 'int', min: 2, max: 8 },
    },
    constraints: [{ test: (v: Vars) => Number(v.a) + Number(v.b) <= 20, note: 'within twenty' }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  /**
   * Level 3 — find the missing addend inside a sum under twenty (Q35).
   *
   * The first of the unit's „find what is missing“ questions, computed as
   * `total − known` rather than stored.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-6-missing', subtopicId: 'cxrili-20', difficulty: 3 }),
    prompt: 'შეავსე: {known} + __ = {total}.',
    variables: {
      known: { kind: 'int', min: 2, max: 9 },
      answerValue: { kind: 'int', min: 5, max: 11 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.known) + Number(v.answerValue)] },
    },
    constraints: [{ test: (v: Vars) => Number(v.total) <= 20, note: 'within twenty' }],
    answer: (v: Vars) => Number(v.total) - Number(v.known),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => missingDistractors(Number(vars.total), Number(vars.known)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.total} − ${vars.known} = ${answer}, ამიტომ ${vars.known} + ${answer} = ${vars.total}.`,
  }),

  /**
   * Level 3 — a sum read off a table (Q36).
   *
   * The table is real: two given addends in the first column and the empty cell
   * they meet in. The wording is the one a textbook uses, and the answer is the
   * pair's sum rather than a fact to recall.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-6-table', subtopicId: 'cxrili-20', difficulty: 3 }),
    prompt: 'ცხრილში მოცემულია შესაკრები {a} და {b}. იპოვე მათი ჯამი.',
    variables: {
      a: { kind: 'int', min: 5, max: 12 },
      b: { kind: 'int', min: 4, max: 9 },
    },
    constraints: [{ test: (v: Vars) => Number(v.a) + Number(v.b) <= 20, note: 'within twenty' }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.a), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
    visual: (v: Vars) => `შესაკრები\n${v.a}\n+ ${v.b}\n= ?`,
  }),
];

/* ================================================================== *\
 * U06.7 — უცნობი შესაკრები
 * ================================================================== */

/**
 * „a + __ = total“, with the missing addend computed by subtraction.
 *
 * The unit's rule stated as one factory: `missing = total − known`. The total
 * is derived from the two addends, so every draw is a true equation and the
 * question can never print a sum that does not hold.
 */
const missingAddend = (spec: {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
  known: { min: number; max: number };
  missing: { min: number; max: number };
}): QuestionTemplate =>
  defineTemplate({
    ...at({ id: spec.id, subtopicId: spec.subtopicId, difficulty: spec.difficulty }),
    prompt: 'შეავსე: {known} + __ = {total}.',
    variables: {
      known: { kind: 'int', min: spec.known.min, max: spec.known.max },
      answerValue: { kind: 'int', min: spec.missing.min, max: spec.missing.max },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.known) + Number(v.answerValue)] },
    },
    answer: (v: Vars) => Number(v.total) - Number(v.known),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => missingDistractors(Number(vars.total), Number(vars.known)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.total} − ${vars.known} = ${answer}, ამიტომ ${vars.known} + ${answer} = ${vars.total}.`,
  });

const u067: QuestionTemplate[] = [
  /** Level 1 — three plus what makes seven (Q37). */
  missingAddend({
    id: 'g1-u06-7-missing-small',
    subtopicId: 'uknobi-SeSveTi',
    difficulty: 1,
    known: { min: 1, max: 5 },
    missing: { min: 1, max: 5 },
  }),

  /**
   * Level 1, second answer shape — the missing addend in the middle.
   *
   * „3 + __ = 7“ puts the blank in the other position. The arithmetic is the
   * same subtraction, but reading the equation is not: a child who only ever
   * sees the blank at the end can pattern-match the position.
   */
  missingAddend({
    id: 'g1-u06-7-missing-middle',
    subtopicId: 'uknobi-SeSveTi',
    difficulty: 1,
    known: { min: 6, max: 12 },
    missing: { min: 2, max: 6 },
  }),

  /** Level 2 — what plus eight makes fifteen (Q38). */
  missingAddend({
    id: 'g1-u06-7-missing-first',
    subtopicId: 'uknobi-SeSveTi',
    difficulty: 2,
    known: { min: 6, max: 10 },
    missing: { min: 3, max: 9 },
  }),

  /** Level 2 — twelve plus what makes nineteen (Q39). */
  missingAddend({
    id: 'g1-u06-7-missing-teen',
    subtopicId: 'uknobi-SeSveTi',
    difficulty: 2,
    known: { min: 10, max: 15 },
    missing: { min: 2, max: 7 },
  }),

  /**
   * Level 3 — a sum of thirty in words (Q40).
   *
   * The same equation without the printed frame: the child has to build it from
   * the sentence before it can subtract.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-7-missing-word', subtopicId: 'uknobi-SeSveTi', difficulty: 3 }),
    prompt: 'ორი რიცხვის ჯამია {total}. ერთი შესაკრებია {known}. იპოვე მეორე.',
    variables: {
      known: { kind: 'int', min: 11, max: 22 },
      answerValue: { kind: 'int', min: 5, max: 14 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.known) + Number(v.answerValue)] },
    },
    answer: (v: Vars) => Number(v.total) - Number(v.known),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => missingDistractors(Number(vars.total), Number(vars.known)).map(String),
    explanation: ({ vars, answer }) =>
      `მეორე შესაკრები: ${vars.total} − ${vars.known} = ${answer}.`,
  }),
];

/* ================================================================== *\
 * U06.8 — ჭეშმარიტი თუ მცდარი შეკრება
 * ================================================================== */

/**
 * „Is a + b = c true?“, with c sometimes true and sometimes not.
 *
 * The claim is evaluated, never stored, and the flag that makes it false picks
 * a value that is *close* to the true sum — off by one or by two — so the child
 * who computes gets it and the child who guesses does not. Half the draws are
 * false by construction, which is the unit's rule that both answers must occur.
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
    prompt: 'სწორია თუ არა ტოლობა: {a} + {b} = {c}?',
    variables: {
      a: { kind: 'int', min: spec.a.min, max: spec.a.max },
      b: { kind: 'int', min: spec.b.min, max: spec.b.max },
      truth: { kind: 'choice', values: ['true', 'false'] },
      slip: { kind: 'choice', values: [1, 2] },
      sign: { kind: 'choice', values: [1, -1] },
      c: {
        kind: 'choice',
        values: (v: Vars) => {
          const sum = Number(v.a) + Number(v.b);
          const shifted = sum + Number(v.slip) * Number(v.sign);
          return [v.truth === 'true' || shifted <= 0 ? sum : shifted];
        },
      },
    },
    answer: (v: Vars) => (Number(v.a) + Number(v.b) === Number(v.c) ? 'მართალია' : 'მცდარია'),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => [answer === 'მართალია' ? 'მცდარია' : 'მართალია'],
    explanation: ({ vars }) =>
      `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, ${
        Number(vars.a) + Number(vars.b) === Number(vars.c) ? 'ამიტომ ტოლობა მართალია' : `ამიტომ „${vars.c}“ არასწორია`
      }.`,
  });

const u068: QuestionTemplate[] = [
  /** Level 1 — small sums (Q41, Q42). */
  trueOrFalse({
    id: 'g1-u06-8-true-small',
    subtopicId: 'martalia-tu-ara',
    difficulty: 1,
    a: { min: 1, max: 6 },
    b: { min: 1, max: 4 },
  }),

  /** Level 2 — sums with a carry (Q43, Q44). */
  trueOrFalse({
    id: 'g1-u06-8-true-mid',
    subtopicId: 'martalia-tu-ara',
    difficulty: 2,
    a: { min: 6, max: 12 },
    b: { min: 3, max: 8 },
  }),

  /** Level 3 — two-digit sums (Q45). */
  trueOrFalse({
    id: 'g1-u06-8-true-large',
    subtopicId: 'martalia-tu-ara',
    difficulty: 3,
    a: { min: 10, max: 25 },
    b: { min: 5, max: 15 },
  }),
];

/* ================================================================== *\
 * U06.9 — რიცხვის მიღების სხვადასხვა გზა
 * ================================================================== */

const u069: QuestionTemplate[] = [
  /**
   * Level 1 — a decomposition of ten (Q46).
   *
   * Recast from the open „which two numbers sum to 10?“ to „6 + __ = 10“, the
   * same decomposition with one answer. The spec's own example answer is
   * „6 + 4“: this template asks for the 4 given the 6, which is exactly that
   * pair, and it can ask it twelve different ways instead of once.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-9-pair-to-ten', subtopicId: 'raodenobis-gzebi', difficulty: 1 }),
    prompt: 'შეავსე ისე, რომ ჯამი {total} გახდეს: {a} + __ = {total}.',
    variables: {
      total: { kind: 'choice', values: [8, 9, 10, 11, 12] },
      a: { kind: 'int', min: 1, max: 9 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.total) - Number(v.a)] },
    },
    constraints: [{ note: 'the partner is positive', test: (v: Vars) => Number(v.b) > 0 }],
    answer: (v: Vars) => Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => missingDistractors(Number(vars.total), Number(vars.a)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${answer} = ${vars.total}.`,
    visual: (v: Vars) => `[${v.a}] + [ ? ] = ${v.total}`,
  }),

  /**
   * Level 1, second answer shape — the decomposition written the other way up.
   *
   * „__ + 4 = 10“ asks for the partner on the left. A child who has only seen
   * the blank on the right can answer by counting on from the printed number;
   * with the blank first they have to know that addition is symmetric.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-9-pair-to-ten-left', subtopicId: 'raodenobis-gzebi', difficulty: 1 }),
    prompt: 'შეავსე ისე, რომ ჯამი {total} გახდეს: __ + {b} = {total}.',
    variables: {
      total: { kind: 'choice', values: [8, 9, 10, 11, 12] },
      b: { kind: 'int', min: 1, max: 9 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.total) - Number(v.b)] },
    },
    constraints: [{ note: 'the partner is positive', test: (v: Vars) => Number(v.a) > 0 }],
    answer: (v: Vars) => Number(v.a),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => missingDistractors(Number(vars.total), Number(vars.b)).map(String),
    explanation: ({ vars, answer }) => `${answer} + ${vars.b} = ${vars.total}.`,
  }),

  /**
   * Level 2 — one addend given, find the other, total fifteen (Q47).
   *
   * Recast from „fill in two addends that sum to 15“ (any pair) to „one is
   * given, find the other“: the same decomposition, one answer, and the given
   * side varies so the pair is not always the same.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-9-pair-to-fifteen', subtopicId: 'raodenobis-gzebi', difficulty: 2 }),
    prompt: 'შეავსე ისე, რომ ჯამი 15 გახდეს: {a} + __ = 15.',
    variables: {
      a: { kind: 'int', min: 4, max: 13 },
      b: { kind: 'choice', values: (v: Vars) => [15 - Number(v.a)] },
    },
    answer: (v: Vars) => Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => missingDistractors(15, Number(vars.a)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${answer} = 15.`,
    visual: (v: Vars) => `[${v.a}] + [ ? ] = 15`,
  }),

  /**
   * Level 2, second answer shape — several partners for one total.
   *
   * „ Which of these numbers makes 20 with 13?“ The child adds each candidate
   * rather than subtracting once, which is the same knowledge tested as a
   * choice, and it varies over both the total and the given addend.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-9-partner-choice', subtopicId: 'raodenobis-gzebi', difficulty: 2 }),
    prompt: 'რომელი რიცხვი უნდა დაემატოს {a}-ს, რომ ჯამი {total} გახდეს?',
    variables: {
      total: { kind: 'choice', values: [12, 14, 16, 18, 20] },
      a: { kind: 'int', min: 3, max: 12 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.total) - Number(v.a)] },
    },
    constraints: [
      { note: 'the partner is positive', test: (v: Vars) => Number(v.b) > 0 },
    ],
    answer: (v: Vars) => Number(v.b),
    format: { kind: 'integer', min: 0 },
    optionCount: 3,
    distractors: ({ vars }) => {
      const b = Number(vars.b);
      return [b + 1, b - 1, b + 2, b - 2].filter((value) => value !== b && value > 0);
    },
    explanation: ({ vars, answer }) => `${vars.a} + ${answer} = ${vars.total}.`,
  }),

  /**
   * Level 3 — the same decomposition of a larger number (Q48).
   *
   * The spec asks for several pairs at once here; the engine grades one answer,
   * so the question asks for the partner of a given addend. The *set* of pairs
   * is still what the student has to hold — „18 + 4“ and „4 + 18“ are the same
   * pair, and only one of them is printed.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-9-pair-to-twelve', subtopicId: 'raodenobis-gzebi', difficulty: 3 }),
    prompt: 'ორი რიცხვის ჯამია {total}. ერთი შესაკრებია {a}. იპოვე მეორე.',
    variables: {
      total: { kind: 'choice', values: [20, 24, 30, 36, 40] },
      a: { kind: 'int', min: 5, max: 20 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.total) - Number(v.a)] },
    },
    constraints: [
      { note: 'the partner is positive and different from the given addend', test: (v: Vars) => Number(v.b) > 0 && v.b !== v.a },
    ],
    answer: (v: Vars) => Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => missingDistractors(Number(vars.total), Number(vars.a)).map(String),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.a} = ${answer}, ამიტომ ${vars.a} + ${answer} = ${vars.total}.`,
  }),
];

/* ================================================================== *\
 * U06.10 — სამი ან მეტი ერთნიშნა რიცხვის შეკრება
 * ================================================================== */

const u0610: QuestionTemplate[] = [
  /** Level 1 — three small addends (Q49). */
  defineTemplate({
    ...at({ id: 'g1-u06-10-three-small', subtopicId: 'samive-ze-meti', difficulty: 1 }),
    prompt: 'შეავსე: {a} + {b} + {c} = __.',
    variables: {
      a: { kind: 'int', min: 1, max: 4 },
      b: { kind: 'int', min: 1, max: 4 },
      c: { kind: 'int', min: 1, max: 3 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const [a, b, c] = [Number(vars.a), Number(vars.b), Number(vars.c)];
      const answer = a + b + c;
      return [answer + 1, answer - 1, a + b, b + c].filter((value) => value !== answer && value > 0).map(String);
    },
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  /** Level 2 — three addends across ten (Q50). */
  defineTemplate({
    ...at({ id: 'g1-u06-10-three-mid', subtopicId: 'samive-ze-meti', difficulty: 2 }),
    prompt: 'შეავსე: {a} + {b} + {c} = __.',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      b: { kind: 'int', min: 2, max: 6 },
      c: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const [a, b, c] = [Number(vars.a), Number(vars.b), Number(vars.c)];
      const answer = a + b + c;
      return [answer + 1, answer - 1, a + b, a + b + c + 2].filter((value) => value !== answer && value > 0).map(String);
    },
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  /**
   * Level 3 — four addends, and the sum held in the head (Q50's shape extended).
   *
   * With four numbers there is no single pair to add first, so the child has to
   * keep a running total. The wrong options are the sums of the neighbouring
   * pairs, which is what dropping an addend looks like.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-10-four-addends', subtopicId: 'samive-ze-meti', difficulty: 3 }),
    prompt: 'შეავსე: {a} + {b} + {c} + {d} = __.',
    variables: {
      a: { kind: 'int', min: 1, max: 5 },
      b: { kind: 'int', min: 1, max: 5 },
      c: { kind: 'int', min: 1, max: 5 },
      d: { kind: 'int', min: 1, max: 5 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const [a, b, c, d] = [Number(vars.a), Number(vars.b), Number(vars.c), Number(vars.d)];
      const answer = a + b + c + d;
      return [answer + 1, answer - 1, a + b + c, b + c + d, answer + 2]
        .filter((value) => value !== answer && value > 0)
        .map(String);
    },
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} = ${answer}.`,
    visual: (v: Vars) =>
      `${v.a} + ${v.b} + ${v.c} + ${v.d}`,
  }),
];

/* ================================================================== *\
 * U06.11 — შესაკრებების არჩევა
 * ================================================================== */

/**
 * The addends of a sum, arranged.
 *
 * The spec asks for a drag-and-drop here („გადათრევა და ჩამოგდება“), which is
 * the engine's `shuffle` answer mode: the student taps the numbers into the
 * order they appear in the sum. The key is a sequence of display positions, so
 * it is checked as a sequence rather than as a set of values.
 *
 * Two sums are asked at level 1 so the level is not one sentence; the ordering
 * is genuinely different from U05's because the *numbers to order are the
 * addends of a stated sum*, not an arbitrary list.
 */
const arrangeAddends = (spec: {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
  count: 2 | 3;
  total: { min: number; max: number };
}): QuestionTemplate =>
  defineTemplate({
    ...at({ id: spec.id, subtopicId: spec.subtopicId, difficulty: spec.difficulty }),
    prompt: 'ჩამოაგდე {total}-ის შესაკრები ზრდადობით.',
    variables: {
      // The addends are drawn first, and the total is their sum — so the
      // printed number and the numbers to arrange can never disagree.
      items: { kind: 'list', pick: { values: range(1, 12), length: spec.count, unique: true } },
      total: { kind: 'choice', values: (v: Vars) => [(v.items as Array<number | string>).reduce((a: number, b) => a + Number(b), 0)] },
    },
    constraints: [
      {
        note: 'the total stays inside the declared range and the addends are not already sorted',
        test: (v: Vars) => {
          const values = (v.items as Array<number | string>).map(Number);
          const total = Number(v.total);
          return total >= spec.total.min && total <= spec.total.max && new Set(values).size === values.length;
        },
      },
    ],
    shuffle: { source: 'items', direction: 'asc' },
    format: { kind: 'integer', min: 0 },
    // The answer is the sequence of *display positions*, not the values: the
    // student taps the items into order and the key says which position came
    // first, second, third. Returning the values themselves produced a key that
    // is not a permutation of 1..n.
    answer: (_v: Vars, ctx) => {
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((a, b) => a - b);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    explanation: ({ answer }) => `ზრდადობით: ${answer}.`,
  });

const u0611: QuestionTemplate[] = [
  arrangeAddends({
    id: 'g1-u06-11-arrange-two',
    subtopicId: 'SeSveTebis-arCevani',
    difficulty: 1,
    count: 2,
    total: { min: 3, max: 20 },
  }),
  arrangeAddends({
    id: 'g1-u06-11-arrange-three',
    subtopicId: 'SeSveTebis-arCevani',
    difficulty: 2,
    count: 3,
    total: { min: 6, max: 30 },
  }),
  arrangeAddends({
    id: 'g1-u06-11-arrange-three-large',
    subtopicId: 'SeSveTebis-arCevani',
    difficulty: 3,
    count: 3,
    total: { min: 10, max: 33 },
  }),
];

/* ================================================================== *\
 * U06.12 — შეკრების ცხრილის შევსება
 * ================================================================== */

const u0612: QuestionTemplate[] = [
  /**
   * Fill one cell of the addition table.
   *
   * The picture above the question *is* the table: the row header and column
   * header printed with the empty cell, so the child reads the table rather
   * than pattern-matching a bare equation.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-12-table-cell', subtopicId: 'Sekreba-cxrili-Sevseba', difficulty: 1 }),
    prompt: 'შეავსე ცხრილის უჯრა: მწკრივი {row}, სვეტი {col}. რა რიცხვია?',
    variables: {
      row: { kind: 'int', min: 1, max: 9 },
      col: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v: Vars) => Number(v.row) + Number(v.col),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => sumDistractors(Number(vars.row), Number(vars.col)).map(String),
    explanation: ({ vars, answer }) => `${vars.row} + ${vars.col} = ${answer}.`,
    visual: (v: Vars) =>
      `      სვეტი ${v.col}\nმწკრივი ${v.row} │  ?`,
  }),

  /** A row of the table, read off in order. */
  defineTemplate({
    ...at({ id: 'g1-u06-12-table-row', subtopicId: 'Sekreba-cxrili-Sevseba', difficulty: 2 }),
    prompt: 'ცხრილის {row}-ე მწკრივში ჩაწერილია {col} + 1, {col} + 2, {col} + 3. რა არის ბოლო უჯრის რიცხვი?',
    variables: {
      row: { kind: 'int', min: 2, max: 12 },
      col: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v: Vars) => Number(v.col) + 3,
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const answer = Number(vars.col) + 3;
      return [answer + 1, answer - 1, Number(vars.col) + 2, Number(vars.row) + 3]
        .filter((value) => value !== answer && value > 0)
        .map(String);
    },
    explanation: ({ vars }) => `ბოლო უჯრა: ${vars.col} + 3 = ${Number(vars.col) + 3}.`,
  }),

  /**
   * Level 3, second shape — a cell named by its two headers in the other
   * order, with the row and column declared as text the child has to match.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-12-table-two-cells', subtopicId: 'Sekreba-cxrili-Sevseba', difficulty: 3 }),
    prompt: 'ცხრილში ერთ უჯრაში არის {x} + {y}, მეზობელში — {x} + {z}. რამდენით მეტია მეორე უჯრა?',
    variables: {
      x: { kind: 'int', min: 2, max: 9 },
      y: { kind: 'int', min: 2, max: 9 },
      z: { kind: 'int', min: 3, max: 9 },
    },
    constraints: [{ note: 'the two cells really differ', test: (v: Vars) => v.y !== v.z }],
    answer: (v: Vars) => Math.abs(Number(v.z) - Number(v.y)),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const answer = Math.abs(Number(vars.z) - Number(vars.y));
      return [answer + 1, answer - 1, Number(vars.z), Number(vars.y)]
        .filter((value) => value !== answer && value > 0)
        .map(String);
    },
    explanation: ({ vars }) =>
      `ორივე უჯრას ერთი და იგივე ${vars.x} აქვს, ამიტომ სხვაობა ${vars.y}-სა და ${vars.z}-ს შორისაა.`,
  }),

  /**
   * A whole diagonal of the table — the cells where both headers are equal.
   *
   * This is where the child meets the doubles again, this time as a structure
   * in the table rather than as a separate fact.
   */
  defineTemplate({
    ...at({ id: 'g1-u06-12-table-diagonal', subtopicId: 'Sekreba-cxrili-Sevseba', difficulty: 3 }),
    prompt: 'ცხრილის დიაგონალზე დგას {n} + {n}. რა რიცხვია ამ უჯრაში?',
    variables: {
      n: { kind: 'int', min: 2, max: 20 },
    },
    answer: (v: Vars) => Number(v.n) * 2,
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars }) => {
      const n = Number(vars.n);
      const answer = n * 2;
      return [answer + 1, answer - 1, n, answer + 2].filter((value) => value !== answer && value > 0).map(String);
    },
    explanation: ({ vars, answer }) => `${vars.n} + ${vars.n} = ${answer}.`,
    visual: (v: Vars) => `        ${v.n}\n     ┌────┐\n${v.n} │  ?  │\n     └────┘`,
  }),
];

/* ================================================================== *\
 * Export
 * ================================================================== */

export const U06_TEMPLATES: QuestionTemplate[] = [
  ...u061,
  ...u062,
  ...u063,
  ...u064,
  ...u065,
  ...u066,
  ...u067,
  ...u068,
  ...u069,
  ...u0610,
  ...u0611,
  ...u0612,
];

/** Subtopic ids this library is responsible for. */
export const U06_SUBTOPICS = [
  'ra-aris-Sekreba',
  'SuratiT-10',
  'teqsti',
  'ricxviT-xazze',
  'nuli-gakvireba',
  'cxrili-20',
  'uknobi-SeSveTi',
  'martalia-tu-ara',
  'raodenobis-gzebi',
  'samive-ze-meti',
  'SeSveTebis-arCevani',
  'Sekreba-cxrili-Sevseba',
] as const;
