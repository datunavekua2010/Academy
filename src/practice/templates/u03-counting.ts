import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

/**
 * U03 — თვლა (counting).
 *
 * The academy's third grade-1 unit, replacing the placeholders that used to sit
 * on these six subtopics.
 *
 * The unit is about quantity and sequence, so nearly every picture here is a
 * drawn collection. Four rules hold it together:
 *
 *  1. **Everything printed is drawn.** A counting question that always shows
 *     six stars is one question asked forever; every count, start, step and
 *     target here comes from a variable.
 *  2. **The picture and the answer are one draw.** A row of stars is built from
 *     the same number the answer is read from, so no seed can print seven stars
 *     and key six.
 *  3. **The level is the thinking, not the size of the numbers.** Level 1 reads
 *     a quantity or a run; level 2 has to pick one kind out of a mixture or
 *     take a step; level 3 combines two or three groups, or holds two answers
 *     at once. The ranges stay inside grade 1 at every level.
 *  4. **A wrong option is a wrong answer to this question.** The size of the
 *     other group, the neighbour in the wrong direction, the number one step
 *     short — the mistake a child actually makes is on the page, so the right
 *     answer has to be found rather than eliminated.
 */

/* ================================================================== *
 * Shared vocabulary
 * ================================================================== */

interface Toy {
  emoji: string;
  /** Singular, which is also what Georgian prints after a numeral. */
  name: string;
}

/** Objects with one emoji each — safe to repeat in a row and count by eye. */
const TOYS: Toy[] = [
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
];

const toyByName = (name: string): Toy => TOYS.find((toy) => toy.name === name)!;
const TOY_NAMES = TOYS.map((toy) => toy.name);

/** The shapes the mixtures are built from. */
interface Shape {
  emoji: string;
  /** Singular, as used after a numeral: „სამი კვადრატი“. */
  name: string;
  /** Plural, for „დაითვალე კვადრატები“. */
  plural: string;
}

const SHAPES: Shape[] = [
  { emoji: '▲', name: 'სამკუთხედი', plural: 'სამკუთხედები' },
  { emoji: '●', name: 'წრე', plural: 'წრეები' },
  { emoji: '■', name: 'კვადრატი', plural: 'კვადრატები' },
  { emoji: '◆', name: 'რომბი', plural: 'რომბები' },
];

const shapeByName = (name: string): Shape => SHAPES.find((shape) => shape.name === name)!;
const SHAPE_NAMES = SHAPES.map((shape) => shape.name);

/** Coloured balls, for "count the red ones". */
const BALLS = [
  { emoji: '🔴', colour: 'წითელი' },
  { emoji: '🔵', colour: 'ლურჯი' },
  { emoji: '🟡', colour: 'ყვითელი' },
  { emoji: '🟢', colour: 'მწვანე' },
] as const;

const COLOURS = BALLS.map((ball) => ball.colour);
const ballByColour = (colour: string) => BALLS.find((ball) => ball.colour === colour)!;

/**
 * Animals and things, for "count the animals".
 *
 * Each entry carries whether it is an animal, so the answer is counted from the
 * same list that drew the picture — never from a separate idea of which emoji
 * count as animals.
 */
const PICTURES: Array<{ emoji: string; name: string; animal: boolean }> = [
  { emoji: '🐱', name: 'კატა', animal: true },
  { emoji: '🐶', name: 'ძაღლი', animal: true },
  { emoji: '🐦', name: 'ჩიტი', animal: true },
  { emoji: '🐟', name: 'თევზი', animal: true },
  { emoji: '🚗', name: 'მანქანა', animal: false },
  { emoji: '🌳', name: 'ხე', animal: false },
  { emoji: '⛵', name: 'ნავი', animal: false },
  { emoji: '🏠', name: 'სახლი', animal: false },
];

const ANIMAL_NAMES = PICTURES.filter((item) => item.animal).map((item) => item.name);
const OBJECT_NAMES = PICTURES.filter((item) => !item.animal).map((item) => item.name);
const pictureByName = (name: string) => PICTURES.find((item) => item.name === name)!;

/* ================================================================== *
 * Small helpers
 * ================================================================== */

const asRun = (numbers: number[]): string => numbers.join(', ');

const runOf = (start: number, count: number, step = 1): number[] =>
  Array.from({ length: count }, (_, index) => start + index * step);

/** The last number a run prints — used to check a drawn start keeps the run in range. */
const runEnd = (start: number, count: number, step: number): number => start + (count - 1) * step;

/** The run with the given 1-based positions replaced by blanks. */
const runWithGaps = (start: number, count: number, gaps: number[], step = 1): string =>
  runOf(start, count, step)
    .map((number, index) => (gaps.includes(index + 1) ? '__' : String(number)))
    .join(', ');

/**
 * Numbers close to `answer`, alternating below and above.
 *
 * A wrong count has to be a plausible miscount: 13 is a believable answer for
 * twelve objects, 6 is not. `min`/`max` keep every option inside the range the
 * question is about, so a count of three never offers zero or ninety.
 */
const neighbouring = (answer: number, min: number, max: number, spread = 2): number[] => {
  const out: number[] = [];
  for (let delta = 1; delta <= spread * 2; delta += 1) {
    if (answer - delta >= min) out.push(answer - delta);
    if (answer + delta <= max) out.push(answer + delta);
  }
  return out;
};

/** A row drawn as one repeated emoji, one space between objects. */
const draw = (emoji: string, count: number): string =>
  Array.from({ length: count }, () => emoji).join(' ');

/**
 * Several kinds drawn on separate lines.
 *
 * Grouping matters when the question is about every group: mixing two kinds
 * inside one line is exactly what makes a count impossible to check by eye, so
 * a picture that must be counted whole keeps each group together.
 */
const drawGroups = (groups: Array<{ emoji: string; count: number }>): string =>
  groups.map((group) => draw(group.emoji, group.count)).join('\n');

/**
 * Several kinds interleaved on one line, one of each in turn.
 *
 * A picture that asks "how many of *this* kind?" has to mix the kinds, or the
 * asked group is simply its own line and counting it needs no selection at all.
 * Round-robin mixing keeps every kind spread across the whole row without ever
 * burying a kind so that it is missed.
 */
const drawMixed = (groups: Array<{ emoji: string; count: number }>): string => {
  const remaining = groups.map((group) => ({ ...group }));
  const out: string[] = [];
  let drew = true;
  while (drew) {
    drew = false;
    for (const group of remaining) {
      if (group.count > 0) {
        out.push(group.emoji);
        group.count -= 1;
        drew = true;
      }
    }
  }
  return out.join(' ');
};

/**
 * Two answers that have to be told apart, as options.
 *
 * A two-blank run is answered by a pair, so a wrong option has to be a pair a
 * child would really produce: the two numbers the wrong way round, or one of
 * them off by a step. Equal pairs ("5, 5") are dropped — nobody counts two
 * different places and writes the same number twice.
 */
const pairDistractors = (
  first: number,
  second: number,
  step: number,
  answer: string,
): string[] =>
  [
    `${second}, ${first}`,
    `${first + step}, ${second}`,
    `${first}, ${second + step}`,
    `${first - step}, ${second}`,
  ]
    .filter((option) => option !== answer)
    .filter((option) => {
      const [a, b] = option.split(',').map((part) => Number(part.trim()));
      return a !== b;
    })
    .filter((option, index, all) => all.indexOf(option) === index);

/* ================================================================== *
 * Address
 * ================================================================== */

const grade = 1 as const;
const topicId = 'datvla';
const unitId = 'datvla';

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
 * U03.1 — საგნების დათვლა
 * ================================================================== */

const u031: QuestionTemplate[] = [
  /**
   * Level 1 — count a row and name the number (Q1, Q2).
   *
   * The row is drawn from the same count the answer is read from, and the wrong
   * options are neighbouring numbers, so a child who miscounts by one is caught
   * and a child who counts properly is not.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-1-count-row', subtopicId: 'sruli-datvla', difficulty: 1 }),
    prompt: 'რამდენი {toy} არის სურათზე?',
    variables: {
      toy: { kind: 'choice', values: TOY_NAMES },
      count: { kind: 'int', min: 1, max: 10 },
    },
    answer: (v: Vars) => Number(v.count),
    format: { kind: 'integer', min: 1 },
    optionCount: 3,
    distractors: ({ answer }) => neighbouring(Number(answer), 1, 12),
    explanation: ({ vars, answer }) => `სურათზე ${answer} ${vars.toy} არის.`,
    visual: (v: Vars) => draw(toyByName(String(v.toy)).emoji, Number(v.count)),
  }),

  /**
   * Level 2 — two kinds mixed on one line, count the one that is asked for
   * (Q1, Q4).
   *
   * The kinds are interleaved, so the asked group cannot simply be read off as
   * a line of its own. The other group's size is always an option: counting the
   * wrong kind is the mistake this question exists to catch.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-1-count-one-kind', subtopicId: 'sruli-datvla', difficulty: 2 }),
    prompt: 'სურათზე {first} და {second} შერეულია. რამდენი {second} არის?',
    variables: {
      first: { kind: 'choice', values: TOY_NAMES },
      second: { kind: 'choice', values: (v: Vars) => TOY_NAMES.filter((name) => name !== v.first) },
      firstCount: { kind: 'int', min: 1, max: 8 },
      secondCount: { kind: 'int', min: 1, max: 8 },
    },
    constraints: [
      {
        note: 'the picture holds five to sixteen objects in all',
        test: (v: Vars) => Number(v.firstCount) + Number(v.secondCount) <= 16,
      },
      {
        note: 'and at least five, so it is a real count',
        test: (v: Vars) => Number(v.firstCount) + Number(v.secondCount) >= 5,
      },
    ],
    answer: (v: Vars) => Number(v.secondCount),
    format: { kind: 'integer', min: 1 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const otherCount = Number(vars.firstCount);
      const options = neighbouring(Number(answer), 1, 12);
      return otherCount !== Number(answer) ? [otherCount, ...options] : options;
    },
    explanation: ({ vars, answer }) =>
      `სურათზე ${Number(vars.firstCount) + Number(vars.secondCount)} საგანია, მაგრამ ${vars.second} მხოლოდ ${answer} არის.`,
    visual: (v: Vars) =>
      drawMixed([
        { emoji: toyByName(String(v.first)).emoji, count: Number(v.firstCount) },
        { emoji: toyByName(String(v.second)).emoji, count: Number(v.secondCount) },
      ]),
  }),

  /**
   * Level 3 — add every group on the page (Q1, Q3, Q5, Q6).
   *
   * The groups are counted separately and then added, which is the extra step
   * this level is for. The number of groups is drawn as two or three: two
   * baskets of apples and pears, or three kinds of object on one page, are the
   * same operation asked with a different amount of work.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-1-add-groups', subtopicId: 'sruli-datvla', difficulty: 3 }),
    prompt: '{ask} სულ რამდენია?',
    variables: {
      kinds: { kind: 'int', min: 2, max: 3 },
      first: { kind: 'choice', values: TOY_NAMES },
      second: { kind: 'choice', values: (v: Vars) => TOY_NAMES.filter((name) => name !== v.first) },
      third: {
        kind: 'choice',
        values: (v: Vars) => TOY_NAMES.filter((name) => name !== v.first && name !== v.second),
      },
      firstCount: { kind: 'int', min: 2, max: 9 },
      secondCount: { kind: 'int', min: 1, max: 9 },
      thirdCount: { kind: 'int', min: 1, max: 6 },
      ask: {
        kind: 'choice',
        values: (v: Vars) =>
          Number(v.kinds) === 2
            ? [`სურათზე ${v.first} და ${v.second} არიან.`]
            : [`სურათზე სამი სახის საგანია: ${v.first}, ${v.second} და ${v.third}.`],
      },
    },
    constraints: [
      {
        note: 'the picture holds five to twenty objects in all',
        test: (v: Vars) => {
          const total =
            Number(v.firstCount) +
            Number(v.secondCount) +
            (Number(v.kinds) === 3 ? Number(v.thirdCount) : 0);
          return total >= 5 && total <= 20;
        },
      },
    ],
    answer: (v: Vars) =>
      Number(v.firstCount) +
      Number(v.secondCount) +
      (Number(v.kinds) === 3 ? Number(v.thirdCount) : 0),
    format: { kind: 'integer', min: 5, entry: true },
    explanation: ({ vars, answer }) =>
      Number(vars.kinds) === 3
        ? `${vars.firstCount} + ${vars.secondCount} + ${vars.thirdCount} = ${answer}.`
        : `${vars.firstCount} + ${vars.secondCount} = ${answer}.`,
    visual: (v: Vars) =>
      drawGroups([
        { emoji: toyByName(String(v.first)).emoji, count: Number(v.firstCount) },
        { emoji: toyByName(String(v.second)).emoji, count: Number(v.secondCount) },
        ...(Number(v.kinds) === 3
          ? [{ emoji: toyByName(String(v.third)).emoji, count: Number(v.thirdCount) }]
          : []),
      ]),
  }),
];

/* ================================================================== *
 * U03.2 — წინ და უკან თვლა
 * ================================================================== */

const u032: QuestionTemplate[] = [
  /**
   * Level 1 — one blank in a run that walks forwards or backwards (Q7, Q8).
   *
   * The direction is drawn, and the printed row is built from it — the wording
   * never says which way it goes, so the student has to read the numbers. The
   * blank is never the first place: a run has to start with something to
   * compare against.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-2-fill-one', subtopicId: 'win-ukan', difficulty: 1 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {shown}.',
    variables: {
      mode: { kind: 'choice', values: ['forward', 'back'] },
      // The number the run is built around: the missing one. Drawing it from the
      // top down means an early session covers the hard end of the range rather
      // than clustering at one, which is what `reverse` is for.
      n: { kind: 'int', min: 2, max: 19, reverse: true },
      gap: { kind: 'int', min: 2, max: 4 },
      // Where the printed row begins, so that the blank lands on `n`: one step
      // per place to the blank, in whichever direction the row walks.
      start: {
        kind: 'choice',
        values: (v: Vars) => [
          v.mode === 'forward'
            ? Number(v.n) - (Number(v.gap) - 1)
            : Number(v.n) + (Number(v.gap) - 1),
        ],
      },
      shown: {
        kind: 'choice',
        values: (v: Vars) => [
          runWithGaps(Number(v.start), 4, [Number(v.gap)], v.mode === 'forward' ? 1 : -1),
        ],
      },
    },
    constraints: [
      {
        note: 'the whole run stays between 1 and 20',
        test: (v: Vars) => {
          const end = runEnd(Number(v.start), 4, v.mode === 'forward' ? 1 : -1);
          return Math.min(Number(v.start), end) >= 1 && Math.max(Number(v.start), end) <= 20;
        },
      },
    ],
    answer: (v: Vars) => Number(v.n),
    format: { kind: 'integer', min: 1, entry: true },
    explanation: ({ vars, answer }) => {
      const step = vars.mode === 'forward' ? 1 : -1;
      return `რიგია ${asRun(runOf(Number(vars.start), 4, step))}. აკლდა ${answer}.`;
    },
  }),

  /**
   * Level 2 — start somewhere and take a number of steps (Q9, Q10).
   *
   * Nothing is printed: the student has to hold the running number and move it
   * the right way, which is a step beyond reading a row that is already there.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-2-take-steps', subtopicId: 'win-ukan', difficulty: 2 }),
    prompt:
      'დაიწყე {from}-დან და დაითვალე {steps} ნაბიჯი {direction}. რომელ რიცხვზე აღმოჩნდები?',
    variables: {
      mode: { kind: 'choice', values: ['forward', 'back'] },
      from: { kind: 'int', min: 2, max: 19 },
      steps: { kind: 'int', min: 2, max: 5 },
      direction: { kind: 'choice', values: (v: Vars) => [v.mode === 'forward' ? 'წინ' : 'უკან'] },
    },
    constraints: [
      {
        note: 'the walk stays between 1 and 20',
        test: (v: Vars) =>
          v.mode === 'forward'
            ? Number(v.from) + Number(v.steps) <= 20
            : Number(v.from) - Number(v.steps) >= 1,
      },
    ],
    answer: (v: Vars) =>
      v.mode === 'forward' ? Number(v.from) + Number(v.steps) : Number(v.from) - Number(v.steps),
    format: { kind: 'integer', min: 1, entry: true },
    explanation: ({ vars, answer }) =>
      `${vars.from}-დან ${vars.steps} ნაბიჯი ${vars.direction} — ეს არის ${answer}.`,
  }),

  /**
   * Level 3 — two blanks in one run (Q11).
   *
   * Two answers have to be held at once and both have to sit in the right
   * place, so this is answered with a pair rather than a single number.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-2-two-gaps', subtopicId: 'win-ukan', difficulty: 3 }),
    prompt: 'შეავსე ორივე გამოტოვებული რიცხვი რიგის მიხედვით: {shown}.',
    variables: {
      mode: { kind: 'choice', values: ['forward', 'back'] },
      start: {
        kind: 'int',
        min: (v: Vars) => (v.mode === 'forward' ? 1 : 5),
        max: (v: Vars) => (v.mode === 'forward' ? 16 : 20),
      },
      firstGap: { kind: 'int', min: 2, max: 3 },
      secondGap: { kind: 'int', min: 3, max: 4 },
      shown: {
        kind: 'choice',
        values: (v: Vars) => [
          runWithGaps(
            Number(v.start),
            5,
            [Number(v.firstGap), Number(v.secondGap)],
            v.mode === 'forward' ? 1 : -1,
          ),
        ],
      },
    },
    constraints: [
      { note: 'two different places', test: (v: Vars) => Number(v.secondGap) > Number(v.firstGap) },
      {
        note: 'the whole run stays between 1 and 20',
        test: (v: Vars) => {
          const end = runEnd(Number(v.start), 5, v.mode === 'forward' ? 1 : -1);
          return Math.min(Number(v.start), end) >= 1 && Math.max(Number(v.start), end) <= 20;
        },
      },
    ],
    answer: (v: Vars) => {
      const step = v.mode === 'forward' ? 1 : -1;
      const start = Number(v.start);
      const first = start + (Number(v.firstGap) - 1) * step;
      const second = start + (Number(v.secondGap) - 1) * step;
      return `${first}, ${second}`;
    },
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const step = vars.mode === 'forward' ? 1 : -1;
      const start = Number(vars.start);
      const first = start + (Number(vars.firstGap) - 1) * step;
      const second = start + (Number(vars.secondGap) - 1) * step;
      return pairDistractors(first, second, step, String(answer));
    },
    explanation: ({ vars, answer }) => {
      const step = vars.mode === 'forward' ? 1 : -1;
      return `რიგია ${asRun(runOf(Number(vars.start), 5, step))}. აკლდა ${answer}.`;
    },
  }),

  /**
   * Level 3, second answer shape — a walk that turns around (Q12).
   *
   * Its own template rather than another mode of the two-blank question: the
   * answer is a single number, and the move is different in kind — one step
   * forward, then a step back, so the student has to do both and see that the
   * second does not cancel the first.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-2-turn-around', subtopicId: 'win-ukan', difficulty: 3 }),
    prompt:
      'დაიწყე {from}-დან, დაითვალე {forward} ნაბიჯი წინ, შემდეგ კი {back} ნაბიჯი უკან. რომელ რიცხვზე აღმოჩნდები?',
    variables: {
      from: { kind: 'int', min: 2, max: 14 },
      forward: { kind: 'int', min: 2, max: 5 },
      back: { kind: 'int', min: 1, max: 4 },
    },
    constraints: [
      {
        note: 'the walk stays inside 20',
        test: (v: Vars) => Number(v.from) + Number(v.forward) <= 20,
      },
      {
        note: 'it turns around rather than cancelling out',
        test: (v: Vars) => Number(v.forward) !== Number(v.back),
      },
      {
        note: 'and never drops below 1 on the way back',
        test: (v: Vars) => Number(v.from) + Number(v.forward) - Number(v.back) >= 1,
      },
    ],
    answer: (v: Vars) => Number(v.from) + Number(v.forward) - Number(v.back),
    format: { kind: 'integer', min: 1, entry: true },
    explanation: ({ vars, answer }) => {
      const turned = Number(vars.from) + Number(vars.forward);
      return `${vars.from} + ${vars.forward} = ${turned}; ${turned} − ${vars.back} = ${answer}.`;
    },
  }),
];

/* ================================================================== *
 * U03.3 — თვლა 100-მდე
 * ================================================================== */

const u033: QuestionTemplate[] = [
  /**
   * Level 1 — the number after, or the number before (Q13, Q14).
   *
   * One template asks both halves of the question. The neighbour in the *other*
   * direction is always among the options: it is the mistake a child actually
   * makes, and it has to be there for the question to be about direction.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-3-neighbour', subtopicId: '100-mde', difficulty: 1 }),
    prompt: 'რომელი რიცხვია {n}-ის {direction}?',
    variables: {
      mode: { kind: 'choice', values: ['after', 'before'] },
      n: { kind: 'int', min: 1, max: 100 },
      direction: { kind: 'choice', values: (v: Vars) => [v.mode === 'after' ? 'შემდეგ' : 'წინ'] },
    },
    constraints: [
      {
        note: 'the neighbour has to exist between 1 and 100',
        test: (v: Vars) => (v.mode === 'after' ? Number(v.n) + 1 <= 100 : Number(v.n) - 1 >= 1),
      },
    ],
    answer: (v: Vars) => (v.mode === 'after' ? Number(v.n) + 1 : Number(v.n) - 1),
    format: { kind: 'integer', min: 1 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      // The neighbour in the other direction, then a two-step slip.
      const other = vars.mode === 'after' ? n - 1 : n + 1;
      return [other, Number(answer) + 2, Number(answer) - 2].filter(
        (value) => value >= 1 && value <= 100 && value !== Number(answer),
      );
    },
    explanation: ({ vars, answer }) => `${vars.n}-ის ${vars.direction} მოდის ${answer}.`,
  }),

  /**
   * Level 2 — one blank inside a run under a hundred (Q15).
   *
   * The run is printed from its start and the blank sits inside it, so the
   * student has to work out where in the count they are rather than what simply
   * follows a given number.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-3-fill-one', subtopicId: '100-mde', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {shown}.',
    variables: {
      length: { kind: 'int', min: 4, max: 6 },
      start: { kind: 'int', min: 1, max: (v: Vars) => 101 - Number(v.length) },
      gap: { kind: 'int', min: 2, max: (v: Vars) => Number(v.length) - 1 },
      shown: {
        kind: 'choice',
        values: (v: Vars) => [runWithGaps(Number(v.start), Number(v.length), [Number(v.gap)])],
      },
    },
    answer: (v: Vars) => Number(v.start) + Number(v.gap) - 1,
    format: { kind: 'integer', min: 1, entry: true },
    explanation: ({ vars, answer }) =>
      `რიგია ${asRun(runOf(Number(vars.start), Number(vars.length)))}. აკლდა ${answer}.`,
  }),

  /**
   * Level 3 — ten more or ten less (Q18).
   *
   * A move in whole tens, not in ones: the units stay and the tens change. It
   * is the place-value step of the subtopic, and the answer is typed so the
   * student has to produce the number rather than recognise it.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-3-ten-more-less', subtopicId: '100-mde', difficulty: 3 }),
    prompt: 'მოცემულია რიცხვი {n}. ჩაწერე რიცხვი, რომელიც მასზე 10-ით {direction}.',
    variables: {
      mode: { kind: 'choice', values: ['more', 'less'] },
      n: {
        kind: 'int',
        min: (v: Vars) => (v.mode === 'more' ? 0 : 10),
        max: (v: Vars) => (v.mode === 'more' ? 90 : 100),
      },
      direction: { kind: 'choice', values: (v: Vars) => [v.mode === 'more' ? 'მეტია' : 'ნაკლებია'] },
    },
    answer: (v: Vars) => (v.mode === 'more' ? Number(v.n) + 10 : Number(v.n) - 10),
    format: { kind: 'integer', min: 0, entry: true },
    explanation: ({ vars, answer }) => `${vars.n} ${vars.mode === 'more' ? '+' : '−'} 10 = ${answer}.`,
  }),

  /**
   * Level 3, second answer shape — put four numbers in order (Q16).
   *
   * Ordering rather than naming: the answer is a sequence of positions, and the
   * student has to compare all four numbers with each other, not just look at
   * one of them.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-3-order', subtopicId: '100-mde', difficulty: 3 }),
    prompt: 'დაალაგე რიცხვები ზრდადობით: ჯერ უმცირესი, ბოლოს — უდიდესი.',
    variables: {
      items: { kind: 'list', pick: { values: runOf(1, 100), length: 4, unique: true } },
    },
    shuffle: { source: 'items', direction: 'asc' },
    answer: (_v: Vars, ctx) => {
      // The key is the displayed positions in ascending order, 1-based.
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((a, b) => a - b);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    format: { kind: 'text' },
    explanation: ({ vars }) => {
      const values = (vars.items as Array<number | string>).map(Number).sort((a, b) => a - b);
      return `უმცირესიდან: ${asRun(values)}.`;
    },
  }),
];

/* ================================================================== *
 * U03.4 — თვლა ათეულებით და სხვა ბიჯებით
 * ================================================================== */

const u034: QuestionTemplate[] = [
  /**
   * Level 1 — continue a sequence (Q19–Q22).
   *
   * The step is drawn from four values and never printed: the student reads it
   * off the numbers, which is what skip counting is. Two to five numbers are
   * printed before the blank, so the run is not always the same length.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-4-continue', subtopicId: 'atobit-nabijebit', difficulty: 1 }),
    prompt: 'გააგრძელე თანმიმდევრობა: {shown}.',
    variables: {
      step: { kind: 'choice', values: [2, 3, 5, 10] },
      printed: { kind: 'int', min: 2, max: 4 },
      // The start is a multiple of the step, leaving room for the run.
      startMultiple: {
        kind: 'int',
        min: 1,
        max: (v: Vars) =>
          Math.max(1, Math.floor((100 - Number(v.printed) * Number(v.step)) / Number(v.step))),
      },
      shown: {
        kind: 'choice',
        values: (v: Vars) => {
          const step = Number(v.step);
          const start = Number(v.startMultiple) * step;
          return [runWithGaps(start, Number(v.printed) + 1, [Number(v.printed) + 1], step)];
        },
      },
    },
    constraints: [
      {
        note: 'the whole run, answer included, stays inside 100',
        test: (v: Vars) => {
          const step = Number(v.step);
          return Number(v.startMultiple) * step + Number(v.printed) * step <= 100;
        },
      },
    ],
    answer: (v: Vars) =>
      Number(v.startMultiple) * Number(v.step) + Number(v.printed) * Number(v.step),
    format: { kind: 'integer', min: 2, entry: true },
    explanation: ({ vars, answer }) => {
      const step = Number(vars.step);
      const start = Number(vars.startMultiple) * step;
      const run = runOf(start, Number(vars.printed) + 1, step);
      return `ყოველ ნაბიჯზე ${step}-ს ვამატებთ: ${asRun(run)}. შემდეგი რიცხვია ${answer}.`;
    },
  }),

  /**
   * Level 2 — the blank is in the middle of the skip sequence (Q23).
   *
   * A different search from continuing: the missing number has printed numbers
   * on both sides, so it can be found from either direction, and a child who
   * only adds the step to the last number has to check whether it landed in the
   * gap.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-4-step-gap', subtopicId: 'atobit-nabijebit', difficulty: 2 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: {shown}.',
    variables: {
      step: { kind: 'choice', values: [5, 3, 2] },
      gap: { kind: 'int', min: 2, max: 4 },
      startMultiple: {
        kind: 'int',
        min: 1,
        max: (v: Vars) => Math.max(1, Math.floor((100 - 4 * Number(v.step)) / Number(v.step))),
      },
      shown: {
        kind: 'choice',
        values: (v: Vars) => {
          const step = Number(v.step);
          return [runWithGaps(Number(v.startMultiple) * step, 5, [Number(v.gap)], step)];
        },
      },
    },
    answer: (v: Vars) =>
      Number(v.startMultiple) * Number(v.step) + (Number(v.gap) - 1) * Number(v.step),
    format: { kind: 'integer', min: 2, entry: true },
    explanation: ({ vars, answer }) => {
      const step = Number(vars.step);
      const run = runOf(Number(vars.startMultiple) * step, 5, step);
      return `ყოველ ნაბიჯზე ${step}-ს ვამატებთ: ${asRun(run)}. აკლდა ${answer}.`;
    },
  }),

  /**
   * Level 3 — the *third* number after a start (Q24).
   *
   * Three steps, not one: a child who adds the step once lands on the first
   * number after the start, and that number is one of the options.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-4-third-step', subtopicId: 'atobit-nabijebit', difficulty: 3 }),
    prompt:
      'დაიწყე {start}-დან და ყოველ ნაბიჯზე {step}-ს ამატებ. რომელი რიცხვი იქნება მესამე შემდეგი?',
    variables: {
      step: { kind: 'choice', values: [3, 4, 5] },
      start: { kind: 'int', min: 0, max: (v: Vars) => 100 - 3 * Number(v.step) },
    },
    answer: (v: Vars) => Number(v.start) + 3 * Number(v.step),
    format: { kind: 'integer', min: 3 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const start = Number(vars.start);
      const step = Number(vars.step);
      // Where a child lands after one step and after two.
      return [start + step, start + 2 * step, Number(answer) + step].filter(
        (value) => value !== Number(answer) && value <= 100,
      );
    },
    explanation: ({ vars, answer }) => {
      const start = Number(vars.start);
      const step = Number(vars.step);
      return `რიგია ${asRun(runOf(start, 4, step))}; მესამე შემდეგია ${answer}.`;
    },
  }),
];

/* ================================================================== *
 * U03.5 — სამიზნე რიცხვის შედგენა
 * ================================================================== */

const u035: QuestionTemplate[] = [
  /**
   * Level 1 — how many more to reach the target (Q25, Q26).
   *
   * Drawn as a basket, so the number already held is a quantity counted from 0
   * rather than a number line position. An empty basket gets its own sentence:
   * "0 ვაშლი" is not how Georgian says it.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-5-how-many-more', subtopicId: 'sagvnebamde', difficulty: 1 }),
    prompt: '{ask}',
    variables: {
      item: { kind: 'choice', values: TOY_NAMES },
      have: { kind: 'int', min: 0, max: 9 },
      target: { kind: 'int', min: 1, max: 20 },
      ask: {
        kind: 'choice',
        values: (v: Vars) =>
          Number(v.have) === 0
            ? [`კალათა ცარიელია. რამდენი ${v.item} უნდა ჩავდოთ, რომ სულ ${v.target} გახდეს?`]
            : [
                `კალათაში ${v.have} ${v.item} არის. რამდენი უნდა დავამატოთ, რომ სულ ${v.target} გახდეს?`,
              ],
      },
    },
    constraints: [
      {
        note: 'the target must be more than what is already in the basket',
        test: (v: Vars) => Number(v.target) > Number(v.have),
      },
    ],
    answer: (v: Vars) => Number(v.target) - Number(v.have),
    format: { kind: 'integer', min: 1, entry: true },
    explanation: ({ vars, answer }) => `${vars.have} + ${answer} = ${vars.target}.`,
  }),

  /**
   * Level 2 — a target split into two groups, one of them known (Q27, Q28).
   *
   * "Six chips, ten to fill" and "seven in the first group, fifteen in all" are
   * the same question seen from the other side, so one template asks both.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-5-second-group', subtopicId: 'sagvnebamde', difficulty: 2 }),
    prompt:
      'სამიზნე რიცხვია {target}. პირველ ჯგუფში {first} საგანია. რამდენი უნდა იყოს მეორე ჯგუფში, რომ სამიზნეს მივაღწიოთ?',
    variables: {
      target: { kind: 'int', min: 2, max: 20 },
      first: { kind: 'int', min: 1, max: (v: Vars) => Number(v.target) - 1 },
    },
    answer: (v: Vars) => Number(v.target) - Number(v.first),
    format: { kind: 'integer', min: 1, entry: true },
    explanation: ({ vars, answer }) => `${vars.first} + ${answer} = ${vars.target}.`,
  }),

  /**
   * Level 3 — a target built from three groups, two of them known (Q29, Q30).
   *
   * Two steps: add the known groups, then work out what is still missing from
   * the target. A child who subtracts one group only is one of the options.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-5-third-group', subtopicId: 'sagvnebamde', difficulty: 3 }),
    prompt:
      'უნდა შევადგინოთ რიცხვი {target}. უკვე გვაქვს ორი ჯგუფი: {first} საგანი და {second} საგანი. რამდენი საგანი გვაკლია?',
    variables: {
      target: { kind: 'int', min: 5, max: 20 },
      first: { kind: 'int', min: 1, max: 9 },
      second: { kind: 'int', min: 1, max: 9 },
    },
    constraints: [
      {
        note: 'the two known groups leave a third group of one to nine',
        test: (v: Vars) => {
          const left = Number(v.target) - Number(v.first) - Number(v.second);
          return left >= 1 && left <= 9;
        },
      },
    ],
    answer: (v: Vars) => Number(v.target) - Number(v.first) - Number(v.second),
    format: { kind: 'integer', min: 1, entry: true },
    explanation: ({ vars, answer }) => {
      const known = Number(vars.first) + Number(vars.second);
      return `${vars.first} + ${vars.second} = ${known}; ${vars.target} − ${known} = ${answer}.`;
    },
  }),
];

/* ================================================================== *
 * U03.6 — აირჩიე და დაითვალე
 * ================================================================== */

const u036: QuestionTemplate[] = [
  /**
   * Level 1 — two shapes on the page, count the one that is named (Q31, Q32).
   *
   * Both groups are drawn from the numbers the answer comes from, and the other
   * group's size is a full option, so counting only the asked shape is what
   * separates the right answer from the tempting one.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-6-count-a-shape', subtopicId: 'airCe-da-daTvale', difficulty: 1 }),
    prompt: 'სურათზე ორი სახის ფიგურაა. რამდენი {shape} არის?',
    variables: {
      shape: { kind: 'choice', values: SHAPE_NAMES },
      other: { kind: 'choice', values: (v: Vars) => SHAPE_NAMES.filter((name) => name !== v.shape) },
      count: { kind: 'int', min: 1, max: 10 },
      otherCount: { kind: 'int', min: 1, max: 10 },
    },
    answer: (v: Vars) => Number(v.count),
    format: { kind: 'integer', min: 1 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const otherCount = Number(vars.otherCount);
      const options = neighbouring(Number(answer), 1, 12);
      return otherCount !== Number(answer) ? [otherCount, ...options] : options;
    },
    explanation: ({ vars, answer }) =>
      `სურათზე ${shapeByName(String(vars.shape)).plural} ${answer} არის.`,
    // Mixed, not stacked: two neat lines would let the student count the length
    // of a line instead of picking the asked shape out of the picture.
    visual: (v: Vars) =>
      drawMixed([
        { emoji: shapeByName(String(v.shape)).emoji, count: Number(v.count) },
        { emoji: shapeByName(String(v.other)).emoji, count: Number(v.otherCount) },
      ]),
  }),

  /**
   * Level 2 — the description is a colour or a kind of thing, not a shape
   * (Q33, Q34).
   *
   * The student has to decide which objects match a description that is printed
   * on none of them, then count those. Counting the animals is the harder half
   * of the template: the animals are two different kinds, so they have to be
   * picked out and then added.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-6-count-a-category', subtopicId: 'airCe-da-daTvale', difficulty: 2 }),
    prompt: '{ask}',
    variables: {
      mode: { kind: 'choice', values: ['colour', 'animal'] },
      colour: { kind: 'choice', values: COLOURS },
      otherColour: { kind: 'choice', values: (v: Vars) => COLOURS.filter((c) => c !== v.colour) },
      animalOne: { kind: 'choice', values: ANIMAL_NAMES },
      animalTwo: {
        kind: 'choice',
        values: (v: Vars) => ANIMAL_NAMES.filter((name) => name !== v.animalOne),
      },
      object: { kind: 'choice', values: OBJECT_NAMES },
      count: { kind: 'int', min: 2, max: 9 },
      otherCount: { kind: 'int', min: 1, max: 6 },
      thirdCount: { kind: 'int', min: 1, max: 5 },
      ask: {
        kind: 'choice',
        values: (v: Vars) =>
          v.mode === 'colour'
            ? [
                `სურათზე ${v.colour} და ${v.otherColour} ბურთებია. რამდენი ${v.colour} ბურთია?`,
              ]
            : ['სურათზე ცხოველები და სხვა საგნებია. რამდენი ცხოველია?'],
      },
    },
    answer: (v: Vars) =>
      v.mode === 'colour' ? Number(v.count) : Number(v.count) + Number(v.otherCount),
    format: { kind: 'integer', min: 2 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      if (vars.mode === 'colour') {
        const otherCount = Number(vars.otherCount);
        const options = neighbouring(Number(answer), 2, 12);
        return otherCount !== Number(answer) ? [otherCount, ...options] : options;
      }
      // Counting only one kind of animal, or the whole picture, are the two
      // believable mistakes here.
      const first = Number(vars.count);
      const whole = Number(vars.count) + Number(vars.otherCount) + Number(vars.thirdCount);
      return [first, whole, ...neighbouring(Number(answer), 2, 20)].filter(
        (value) => value !== Number(answer),
      );
    },
    explanation: ({ vars, answer }) =>
      vars.mode === 'colour'
        ? `${answer} ბურთი ${vars.colour} ფერისაა.`
        : `${vars.count} ${vars.animalOne} + ${vars.otherCount} ${vars.animalTwo} = ${answer} ცხოველი.`,
    // Both readings are one mixed row: a colour question whose colours sit on
    // separate lines, or an animal question whose animals sit on their own
    // lines, is answered by reading a line rather than by selecting.
    visual: (v: Vars) =>
      v.mode === 'colour'
        ? drawMixed([
            { emoji: ballByColour(String(v.colour)).emoji, count: Number(v.count) },
            { emoji: ballByColour(String(v.otherColour)).emoji, count: Number(v.otherCount) },
          ])
        : drawMixed([
            { emoji: pictureByName(String(v.animalOne)).emoji, count: Number(v.count) },
            { emoji: pictureByName(String(v.animalTwo)).emoji, count: Number(v.otherCount) },
            { emoji: pictureByName(String(v.object)).emoji, count: Number(v.thirdCount) },
          ]),
  }),

  /**
   * Level 3 — two named kinds in a three-kind picture, added together (Q35, Q36).
   *
   * Three steps: pick the first kind, pick the second, add them. The third
   * group is the distractor, so a child who counts everything, or counts one
   * kind, lands on a number that is on offer but wrong.
   */
  defineTemplate({
    ...at({ id: 'g1-u03-6-add-two-kinds', subtopicId: 'airCe-da-daTvale', difficulty: 3 }),
    prompt: 'დაითვალე {firstPlural} და {secondPlural}. სულ რამდენია?',
    variables: {
      first: { kind: 'choice', values: SHAPE_NAMES },
      second: { kind: 'choice', values: (v: Vars) => SHAPE_NAMES.filter((name) => name !== v.first) },
      third: {
        kind: 'choice',
        values: (v: Vars) => SHAPE_NAMES.filter((name) => name !== v.first && name !== v.second),
      },
      firstCount: { kind: 'int', min: 1, max: 9 },
      secondCount: { kind: 'int', min: 1, max: 9 },
      thirdCount: { kind: 'int', min: 1, max: 9 },
      firstPlural: { kind: 'choice', values: (v: Vars) => [shapeByName(String(v.first)).plural] },
      secondPlural: { kind: 'choice', values: (v: Vars) => [shapeByName(String(v.second)).plural] },
    },
    answer: (v: Vars) => Number(v.firstCount) + Number(v.secondCount),
    format: { kind: 'integer', min: 2 },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const whole =
        Number(vars.firstCount) + Number(vars.secondCount) + Number(vars.thirdCount);
      return [
        whole,
        Number(vars.firstCount),
        Number(vars.secondCount),
        ...neighbouring(Number(answer), 2, 20),
      ].filter((value) => value !== Number(answer));
    },
    explanation: ({ vars, answer }) =>
      `${vars.firstCount} + ${vars.secondCount} = ${answer}. მესამე სახის ფიგურებს არ ვთვლით.`,
    visual: (v: Vars) =>
      drawGroups([
        { emoji: shapeByName(String(v.first)).emoji, count: Number(v.firstCount) },
        { emoji: shapeByName(String(v.second)).emoji, count: Number(v.secondCount) },
        { emoji: shapeByName(String(v.third)).emoji, count: Number(v.thirdCount) },
      ]),
  }),
];

/* ================================================================== *
 * Export
 * ================================================================== */

export const U03_TEMPLATES: QuestionTemplate[] = [
  ...u031,
  ...u032,
  ...u033,
  ...u034,
  ...u035,
  ...u036,
];

export const U03_SUBTOPICS = [
  'sruli-datvla',
  'win-ukan',
  '100-mde',
  'atobit-nabijebit',
  'sagvnebamde',
  'airCe-da-daTvale',
] as const;
