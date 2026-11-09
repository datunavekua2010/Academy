import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

/**
 * U01 — სივრცე და მდებარეობა (space and position).
 *
 * The academy's real grade-1 unit, replacing the placeholders that used to sit
 * on these eight subtopics.
 *
 * Two rules run through every template here:
 *
 *  1. **Every `{placeholder}` is a declared variable.** The registry enforces
 *     this, and it is why the wording can never show a literal `{thing}`: text
 *     the student sees is always a value that was drawn.
 *  2. **The answer is derived from the values that are displayed.** A row of
 *     objects comes from a `list` variable and the question about it is
 *     answered by reading that same list. Nothing is claimed about a picture
 *     that was not drawn from the numbers behind it, so no seed can produce a
 *     self-contradicting question.
 *
 * Where a template needs two facts that must agree (the object shown and the
 * noun that names it, the relation asked about and the scene drawn), the
 * pairing is either made in one variable or enforced by a constraint that
 * rejects the draw. Consistency is never left to chance.
 */

/* ------------------------------------------------------------------ *
 * Object vocabulary.
 *
 * Names matter as much as emojis: "the second from the left" is answerable
 * only if each object can be named. `name` and `emoji` are two views of one
 * entry, so a question can never say "apple" over a picture of a star.
 * ------------------------------------------------------------------ */

interface Thing {
  emoji: string;
  name: string;
}

const THINGS: Thing[] = [
  { emoji: '🍎', name: 'ვაშლი' },
  { emoji: '⭐', name: 'ვარსკვლავი' },
  { emoji: '🧸', name: 'დათუნია' },
  { emoji: '🌳', name: 'ხე' },
  { emoji: '🐟', name: 'თევზი' },
  { emoji: '🎈', name: 'ბუშტი' },
  { emoji: '🚗', name: 'მანქანა' },
  { emoji: '🌼', name: 'ყვავილი' },
  { emoji: '⚽', name: 'ბურთი' },
  { emoji: '🐤', name: 'წიწილა' },
  { emoji: '🍌', name: 'ბანანი' },
  { emoji: '🔔', name: 'ზარი' },
];

const EMOJIS = THINGS.map((thing) => thing.emoji);
const NAMES = THINGS.map((thing) => thing.name);

const thingByName = (name: string): Thing | undefined => THINGS.find((t) => t.name === name);
const nameOf = (emoji: string): string => THINGS.find((t) => t.emoji === emoji)?.name ?? 'ობიექტი';

/** Georgian ordinals 1st–5th. */
const ORDINALS = ['პირველი', 'მეორე', 'მესამე', 'მეოთხე', 'მეხუთე'];
const ordinal = (n: number): string => ORDINALS[n - 1] ?? `${n}`;

/** Renders drawn objects as one spaced row. */
const row = (items: Array<number | string>): string => items.join(' ');

/** Names a row in words: "ვაშლი, ვარსკვლავი და დათუნია". */
const listInWords = (items: Array<number | string>): string => {
  const names = items.map((item) => nameOf(String(item)));
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} და ${names[names.length - 1]}`;
};

/* ------------------------------------------------------------------ *
 * Shared limits.
 * ------------------------------------------------------------------ */

const grade = 1 as const;
const topicId = 'mdebareoba';

/**
 * Rows stay short on purpose. Grade-1 positional questions are about three to
 * five objects; a longer row tests patience rather than understanding, and
 * would overflow the question card on a phone.
 */
const ROW_LENGTH = { min: 3, max: 5 };
const distinctRow = { values: EMOJIS, length: ROW_LENGTH, unique: true };

/** Plausible wrong answers for a numeric question: neighbours only. */
const nearMisses = (answer: number, spread = 3): number[] => {
  const out: number[] = [];
  for (let offset = 1; offset <= spread; offset += 1) {
    if (answer + offset <= 99) out.push(answer + offset);
    if (answer - offset >= 0) out.push(answer - offset);
  }
  return out;
};

/* ================================================================== *
 * U01.1 — მარცხენა, შუა, მარჯვენა
 * ================================================================== */

const u011: QuestionTemplate[] = [
  /**
   * Read a position off the row. `where` is the word the student sees and
   * `slot` is the position it refers to; the constraint demands the two
   * actually agree, so "შუაში" can never accompany a row with no middle.
   */
  defineTemplate({
    id: 'g1-u01-1-name-position',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'marcxena-marjvena',
    difficulty: 1,
    prompt: 'რომელი ობიექტი დგას {where}?',
    variables: {
      row: { kind: 'list', pick: distinctRow },
      slot: { kind: 'int', min: 1, max: (v: Vars) => (v.row as unknown[]).length },
      where: { kind: 'choice', values: ['მარცხნივ', 'შუაში', 'მარჯვნივ'] },
    },
    constraints: [
      {
        note: 'the word must describe where the drawn slot actually is',
        test: (v: Vars) => {
          const n = (v.row as unknown[]).length;
          const slot = Number(v.slot);
          if (v.where === 'მარცხნივ') return slot === 1;
          if (v.where === 'მარჯვნივ') return slot === n;
          return n % 2 === 1 && slot === Math.ceil(n / 2);
        },
      },
    ],
    answer: (v: Vars) => nameOf((v.row as string[])[Number(v.slot) - 1]),
    format: { kind: 'text' },
    // Every wrong option is another object in the same row, so the student has
    // to read the picture rather than the wording alone.
    distractors: ({ answer, vars }) =>
      (vars.row as string[]).map((item) => nameOf(item)).filter((name) => name !== answer),
    explanation: ({ vars, answer }) =>
      `რიგი იწყება მარცხნიდან: ${listInWords(vars.row as string[])}. ${answer} სწორედ იქ დგას.`,
    visual: (v: Vars) => row(v.row as string[]),
  }),

  /**
   * The reverse direction: given the object, name its position. `thing` is
   * declared as the noun, and the constraint requires the drawn row to
   * actually contain that object — because the row is drawn without repeats,
   * it then appears exactly once and has exactly one position.
   */
  defineTemplate({
    id: 'g1-u01-1-which-position',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'marcxena-marjvena',
    difficulty: 2,
    prompt: 'რომელია რიგში {thing}?',
    variables: {
      row: { kind: 'list', pick: distinctRow },
      thing: { kind: 'choice', values: NAMES },
    },
    constraints: [
      {
        note: 'the named object must be in the drawn row',
        test: (v: Vars) => {
          const emoji = thingByName(String(v.thing))?.emoji;
          return emoji !== undefined && (v.row as string[]).includes(emoji);
        },
      },
    ],
    answer: (v: Vars) => {
      const emoji = thingByName(String(v.thing))!.emoji;
      return ordinal((v.row as string[]).indexOf(emoji) + 1);
    },
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const n = (vars.row as unknown[]).length;
      const emoji = thingByName(String(vars.thing))!.emoji;
      const position = (vars.row as string[]).indexOf(emoji);
      return ORDINALS.slice(0, n).filter((_, i) => i !== position);
    },
    explanation: ({ vars }) => {
      const names = (vars.row as string[]).map((item, i) => `${i + 1}) ${nameOf(item)}`);
      return `მარცხნიდან თვლით: ${names.join(', ')}.`;
    },
    visual: (v: Vars) => row(v.row as string[]),
  }),
];

/* ================================================================== *
 * U01.2 — ზემოთ, ქვემოთ, გვერდით
 * ================================================================== */

const RELATION_WORDS = { above: 'ზემოთ', below: 'ქვემოთ', beside: 'გვერდით' } as const;
type Relation = keyof typeof RELATION_WORDS;

interface Scene {
  subject: Thing;
  landmark: Thing;
  /**
   * The landmark in the grammatical form the question needs. Georgian nouns
   * decline before a postposition ("ყუთი" → "ყუთთან"), so the surface form is
   * stored rather than glued together with a hyphen, which read as
   * "ყუთი-თან" and is simply not Georgian.
   */
  landmarkToward: string;
  relation: Relation;
  /** Georgian sentence stating the scene, used for the explanation. */
  text: string;
}

const SCENES: Scene[] = [
  { subject: { emoji: '🐦', name: 'ჩიტი' }, landmark: { emoji: '🌳', name: 'ხე' }, landmarkToward: 'ხესთან', relation: 'above', text: 'ჩიტი ხის ზემოთ დაფრინავს.' },
  { subject: { emoji: '🐟', name: 'თევზი' }, landmark: { emoji: '🌊', name: 'წყალი' }, landmarkToward: 'წყალთან', relation: 'below', text: 'თევზი წყლის ქვეშ ცურავს.' },
  { subject: { emoji: '🐱', name: 'კატა' }, landmark: { emoji: '🪑', name: 'სკამი' }, landmarkToward: 'სკამთან', relation: 'above', text: 'კატა სკამზე ზის.' },
  { subject: { emoji: '🐶', name: 'ძაღლი' }, landmark: { emoji: '🛏️', name: 'საწოლი' }, landmarkToward: 'საწოლთან', relation: 'below', text: 'ძაღლი საწოლის ქვეშ იწვა.' },
  { subject: { emoji: '🧸', name: 'დათუნია' }, landmark: { emoji: '📦', name: 'ყუთი' }, landmarkToward: 'ყუთთან', relation: 'beside', text: 'დათუნია ყუთის გვერდით ზის.' },
  { subject: { emoji: '🌼', name: 'ყვავილი' }, landmark: { emoji: '🪴', name: 'ქოთანი' }, landmarkToward: 'ქოთანთან', relation: 'beside', text: 'ყვავილი ქოთნის გვერდით დგას.' },
  { subject: { emoji: '☁️', name: 'ღრუბელი' }, landmark: { emoji: '🏠', name: 'სახლი' }, landmarkToward: 'სახლთან', relation: 'above', text: 'ღრუბელი სახლის ზემოთ არის.' },
  { subject: { emoji: '⚽', name: 'ბურთი' }, landmark: { emoji: '🪑', name: 'სკამი' }, landmarkToward: 'სკამთან', relation: 'below', text: 'ბურთი სკამის ქვეშ არის.' },
];

/**
 * Draws the scene. A vertical relation is shown vertically and a sideways one
 * side by side, so the layout itself carries the meaning.
 */
const sceneDrawing = (scene: Scene): string => {
  if (scene.relation === 'beside') return `${scene.landmark.emoji} ${scene.subject.emoji}`;
  if (scene.relation === 'above') return `${scene.subject.emoji}\n${scene.landmark.emoji}`;
  return `${scene.landmark.emoji}\n${scene.subject.emoji}`;
};

const u012: QuestionTemplate[] = [
  /**
   * `scene` is one variable, so the picture, the answer and the explanation
   * all read from the same entry. The subject and landmark are named in the
   * prompt through two further variables whose only job is to describe the
   * chosen scene — the constraint keeps them honest.
   */
  defineTemplate({
    id: 'g1-u01-2-where-is-it',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'zeda-qveda',
    difficulty: 1,
    prompt: 'სად არის {subject} {landmark}?',
    variables: {
      scene: { kind: 'choice', values: SCENES.map((_, i) => i) },
      subject: { kind: 'choice', values: Array.from(new Set(SCENES.map((s) => s.subject.name))) },
      landmark: { kind: 'choice', values: Array.from(new Set(SCENES.map((s) => s.landmarkToward))) },
    },
    constraints: [
      {
        note: 'subject and landmark must be the pair actually drawn',
        test: (v: Vars) => {
          const scene = SCENES[Number(v.scene)];
          return scene.subject.name === v.subject && scene.landmarkToward === v.landmark;
        },
      },
    ],
    answer: (v: Vars) => RELATION_WORDS[SCENES[Number(v.scene)].relation],
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => Object.values(RELATION_WORDS),
    explanation: ({ vars }) => SCENES[Number(vars.scene)].text,
    visual: (v: Vars) => sceneDrawing(SCENES[Number(v.scene)]),
  }),

  /**
   * The inverse: the relation is given, the object must be named.
   *
   * "გვერდით" is symmetric — both objects are beside each other — so those
   * scenes are excluded here; asking "which one is beside?" would have two
   * correct answers. That is exactly the kind of ambiguity the spec forbids,
   * and it is filtered out rather than left to a coin flip.
   */
  defineTemplate({
    id: 'g1-u01-2-name-the-object',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'zeda-qveda',
    difficulty: 2,
    prompt: 'რომელი ობიექტია {relation}?',
    variables: {
      scene: { kind: 'choice', values: SCENES.map((_, i) => i) },
      relation: { kind: 'choice', values: [RELATION_WORDS.above, RELATION_WORDS.below] },
    },
    constraints: [
      {
        note: 'the relation must match the scene, and the scene must not be symmetric',
        test: (v: Vars) => {
          const scene = SCENES[Number(v.scene)];
          if (scene.relation === 'beside') return false;
          return RELATION_WORDS[scene.relation] === v.relation;
        },
      },
    ],
    answer: (v: Vars) => {
      // The scene is laid out so the subject holds the position being asked
      // about: for an "above" scene it is drawn on top, for a "below" scene it
      // is drawn underneath. Either way the answer is the subject, and the
      // landmark is the plausible mistake the distractors offer. Naming the
      // landmark on "below" would return the object at the top instead.
      return SCENES[Number(v.scene)].subject.name;
    },
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const scene = SCENES[Number(vars.scene)];
      const others = SCENES.filter((s) => s !== scene).map((s) => s.subject.name);
      // Both objects of the drawn scene are plausible; drop whichever one is
      // actually correct so the correct answer never appears twice.
      return [scene.subject.name, scene.landmark.name, ...others].filter((name) => name !== answer);
    },
    explanation: ({ vars }) => SCENES[Number(vars.scene)].text,
    visual: (v: Vars) => sceneDrawing(SCENES[Number(v.scene)]),
  }),
];

/* ================================================================== *
 * U01.3–U01.6 — comparing length, height, weight, width
 * ================================================================== */

/**
 * These four subtopics share one reasoning — compare two quantities in the
 * same unit — so they share builders. They stay separate templates because the
 * unit, the vocabulary and the numbers differ, and the curriculum addresses
 * them separately.
 */
interface MeasureSpec {
  id: string;
  subtopicId: string;
  unit: string;
  noun: string;
  /** Georgian comparative adjectives. */
  more: string;
  min: number;
  max: number;
}

/**
 * A proportional bar, so the comparison is visible and not only numeric.
 *
 * Rounding is the trap here: scaled to ten cells across a 2–20 range, 3 and 7
 * both land on 2 blocks, and the picture would then show two equal bars while
 * the question says one is longer. A child reading the picture would be told
 * they were wrong for being right. So when the numbers differ the bars are
 * forced apart by at least one cell — the drawing always agrees with the
 * numbers, which is the whole point of drawing it.
 */
const bars = (a: number, b: number, spec: MeasureSpec): string => {
  const scale = 10;
  const lengthOf = (n: number) => Math.max(1, Math.round((n / spec.max) * scale));

  let la = lengthOf(a);
  let lb = lengthOf(b);
  if (a > b && la <= lb) la = lb + 1;
  if (b > a && lb <= la) lb = la + 1;

  return `ა) ${'▬'.repeat(la)} ${a} ${spec.unit}\nბ) ${'▬'.repeat(lb)} ${b} ${spec.unit}`;
};

const compareBuilder = (spec: MeasureSpec): QuestionTemplate =>
  defineTemplate({
    id: spec.id,
    grade,
    topicId,
    unitId: topicId,
    subtopicId: spec.subtopicId,
    difficulty: 2,
    prompt: `რომელი ${spec.noun} არის უფრო ${spec.more}: {a} ${spec.unit} თუ {b} ${spec.unit}?`,
    variables: {
      a: { kind: 'int', min: spec.min, max: spec.max },
      b: { kind: 'int', min: spec.min, max: spec.max },
    },
    constraints: [{ note: 'the two measures must differ', test: (v: Vars) => Number(v.a) !== Number(v.b) }],
    answer: (v: Vars) => Math.max(Number(v.a), Number(v.b)),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const other = Number(vars.a) === Number(answer) ? Number(vars.b) : Number(vars.a);
      return `${answer} ${spec.unit} მეტია, ვიდრე ${other} ${spec.unit}. ამიტომ ის უფრო ${spec.more} არის.`;
    },
    visual: (v: Vars) => bars(Number(v.a), Number(v.b), spec),
  });

/**
 * "How much longer?" — same measures, but the answer is the difference. This
 * is a genuinely different step (compare, then subtract), so it is its own
 * template at level 3 rather than a rewritten clause of the one above.
 */
const differenceBuilder = (spec: MeasureSpec): QuestionTemplate =>
  defineTemplate({
    id: `${spec.id}-difference`,
    grade,
    topicId,
    unitId: topicId,
    subtopicId: spec.subtopicId,
    difficulty: 3,
    prompt: `ერთი ${spec.noun} {a} ${spec.unit}-ია, მეორე — {b} ${spec.unit}. რამდენით უფრო ${spec.more} არის პირველი?`,
    variables: {
      a: { kind: 'int', min: spec.min + 1, max: spec.max },
      b: { kind: 'int', min: spec.min, max: (v: Vars) => Number(v.a) - 1 },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer}. პირველი ${answer} ${spec.unit}-ით უფრო ${spec.more} არის.`,
    visual: (v: Vars) => bars(Number(v.a), Number(v.b), spec),
  });

const LENGTH: MeasureSpec = { id: 'g1-u01-3-ribbon', subtopicId: 'grZeli-mokle', unit: 'სმ', noun: 'ლენტი', more: 'გრძელი', min: 2, max: 20 };
const HEIGHT: MeasureSpec = { id: 'g1-u01-4-tower', subtopicId: 'magle-dabali', unit: 'სმ', noun: 'კოშკი', more: 'მაღალი', min: 3, max: 20 };
const WEIGHT: MeasureSpec = { id: 'g1-u01-5-bag', subtopicId: 'mZime-msubuqi', unit: 'კგ', noun: 'ჩანთა', more: 'მძიმე', min: 1, max: 20 };
const WIDTH: MeasureSpec = { id: 'g1-u01-6-box', subtopicId: 'gansieri-vicki', unit: 'სმ', noun: 'ყუთი', more: 'განიერი', min: 2, max: 20 };

const u013to016: QuestionTemplate[] = [
  compareBuilder(LENGTH),
  differenceBuilder(LENGTH),
  compareBuilder(HEIGHT),
  differenceBuilder(HEIGHT),
  compareBuilder(WEIGHT),
  differenceBuilder(WEIGHT),
  compareBuilder(WIDTH),
  differenceBuilder(WIDTH),
];

/* ================================================================== *
 * U01.7 — ყველა და ზოგიერთი
 * ================================================================== */

const COLOURS = [
  { emoji: '🔴', name: 'წითელი' },
  { emoji: '🔵', name: 'ლურჯი' },
  { emoji: '🟡', name: 'ყვითელი' },
];

const colourByName = (name: string) => COLOURS.find((c) => c.name === name);

const u017: QuestionTemplate[] = [
  /** "All of them taken" is a − a = 0 whatever was drawn, so it cannot be wrong. */
  defineTemplate({
    id: 'g1-u01-7-all-taken',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'yvela-rame',
    difficulty: 1,
    prompt: 'კალათაში {a} {thing} იყო. ყველა ავიღეთ. რამდენი დარჩა?',
    variables: {
      a: { kind: 'int', min: 1, max: 10 },
      thing: { kind: 'choice', values: ['ვაშლი', 'მსხალი', 'ბურთი', 'კექსი'] },
    },
    answer: () => 0,
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.a), 1, 2],
    explanation: ({ vars }) => `${vars.a} − ${vars.a} = 0. ყველა ავიღეთ, ამიტომ კალათა ცარიელია.`,
    visual: (v: Vars) => {
      const emoji =
        v.thing === 'ვაშლი' ? '🍎' : v.thing === 'მსხალი' ? '🍐' : v.thing === 'ბურთი' ? '⚽' : '🧁';
      return emoji.repeat(Number(v.a));
    },
  }),

  /**
   * "Is it true that every one is red?" The claim's truth value and the
   * picture are both derived from `group` and `mixed`, so the statement is
   * true or false because of how the objects were drawn — never by luck.
   */
  defineTemplate({
    id: 'g1-u01-7-is-it-true',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'yvela-rame',
    difficulty: 2,
    prompt: 'მართალია თუ არა: „ჯგუფში ყველა {colour} არის"?',
    variables: {
      colour: { kind: 'choice', values: COLOURS.map((c) => c.name) },
      count: { kind: 'int', min: 2, max: 5 },
      /** 1 = one object is a different colour, so the claim is false. */
      mixed: { kind: 'int', min: 0, max: 1 },
    },
    answer: (v: Vars) => (Number(v.mixed) === 1 ? 'არ არის მართალი' : 'მართალია'),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => (answer === 'მართალია' ? ['არ არის მართალი'] : ['მართალია']),
    explanation: ({ vars, answer }) => {
      const main = colourByName(String(vars.colour))!;
      const other = COLOURS.find((c) => c !== main)!;
      return Number(vars.mixed) === 1
        ? `ჯგუფში ერთი ${other.name} წრეა, ამიტომ დებულება არ არის მართალი.`
        : `ჯგუფში ყველა წრე ${main.name}ა, ამიტომ დებულება ${answer.toLowerCase()}ა.`;
    },
    visual: (v: Vars) => {
      const main = colourByName(String(v.colour))!;
      const other = COLOURS.find((c) => c !== main)!;
      const n = Number(v.count);
      const items = Array.from({ length: n }, () => main.emoji);
      if (Number(v.mixed) === 1) items[n - 1] = other.emoji;
      return items.join(' ');
    },
  }),

  /** Count one colour inside a mixed group. */
  defineTemplate({
    id: 'g1-u01-7-count-in-group',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'yvela-rame',
    difficulty: 2,
    prompt: 'ჯგუფში რამდენი {colour} არის?',
    variables: {
      colour: { kind: 'choice', values: COLOURS.map((c) => c.name) },
      group: { kind: 'list', pick: { values: COLOURS.map((c) => c.emoji), length: { min: 2, max: 5 } } },
    },
    constraints: [
      {
        note: 'the group must contain the colour being asked about',
        test: (v: Vars) => {
          const target = colourByName(String(v.colour))!.emoji;
          return (v.group as string[]).includes(target);
        },
      },
    ],
    answer: (v: Vars) => {
      const target = colourByName(String(v.colour))!.emoji;
      return (v.group as string[]).filter((c) => c === target).length;
    },
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars, answer }) => {
      const target = colourByName(String(vars.colour))!.emoji;
      const present = (vars.group as string[]).filter((c) => c !== target).length;
      return [present, Number(answer) + 1, Number(answer) - 1, Number(answer) + 2];
    },
    explanation: ({ vars, answer }) => {
      const target = colourByName(String(vars.colour))!.emoji;
      return `${target} — სულ ${answer}.`;
    },
    visual: (v: Vars) => (v.group as string[]).join(' '),
  }),
];

/* ================================================================== *
 * U01.8 — რამდენია? (counting)
 * ================================================================== */

const u018: QuestionTemplate[] = [
  /**
   * Count a single repeated object. `thing` names it and `visual` draws that
   * same entry, so the noun and the picture are one choice.
   */
  defineTemplate({
    id: 'g1-u01-8-count-row',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'datvla-suratebidan',
    difficulty: 1,
    prompt: 'რამდენი {thing} არის სურათზე?',
    variables: {
      thing: { kind: 'choice', values: NAMES },
      count: { kind: 'int', min: 1, max: 5 },
    },
    answer: (v: Vars) => Number(v.count),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ answer }) => `სურათზე ${answer} ობიექტია.`,
    visual: (v: Vars) => (thingByName(String(v.thing))?.emoji ?? '⭐').repeat(Number(v.count)),
  }),

  /** Add the objects in two visually separate groups. */
  defineTemplate({
    id: 'g1-u01-8-count-groups',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'datvla-suratebidan',
    difficulty: 2,
    prompt: 'რამდენი ობიექტია სულ?',
    variables: {
      first: { kind: 'list', pick: { values: ['🔴', '🔵', '🟡'], length: { min: 1, max: 4 } } },
      second: { kind: 'list', pick: { values: ['⭐', '🔺', '🟩'], length: { min: 1, max: 4 } } },
    },
    answer: (v: Vars) => (v.first as string[]).length + (v.second as string[]).length,
    format: { kind: 'integer', min: 2 },
    distractors: ({ vars, answer }) => [
      (vars.first as string[]).length,
      (vars.second as string[]).length,
      Number(answer) + 1,
    ],
    explanation: ({ vars, answer }) =>
      `${(vars.first as string[]).length} + ${(vars.second as string[]).length} = ${answer}.`,
    visual: (v: Vars) => `${(v.first as string[]).join(' ')}\n${(v.second as string[]).join(' ')}`,
  }),

  /**
   * Count, then take away. The picture shows the starting set with the taken
   * objects still visible, which is how the operation is taught — showing only
   * the remainder would hand over the answer.
   */
  defineTemplate({
    id: 'g1-u01-8-count-and-take',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'datvla-suratebidan',
    difficulty: 3,
    prompt: 'სურათზე {a} {thing} არის. {b} წავიღეთ. რამდენი დარჩა?',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 1, max: (v: Vars) => Number(v.a) - 1 },
      thing: { kind: 'choice', values: NAMES },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
    visual: (v: Vars) => (thingByName(String(v.thing))?.emoji ?? '⭐').repeat(Number(v.a)),
  }),
];

/* ================================================================== *
 * Export
 * ================================================================== */

/**
 * The U01 library. `catalog.ts` registers it after the placeholders and drops
 * any placeholder whose subtopic is covered here, so these replace the
 * placeholder set for these eight subtopics without that file changing.
 */
export const U01_TEMPLATES: QuestionTemplate[] = [
  ...u011,
  ...u012,
  ...u013to016,
  ...u017,
  ...u018,
];

/** Subtopic ids this library is responsible for. */
export const U01_SUBTOPICS = [
  'marcxena-marjvena',
  'zeda-qveda',
  'grZeli-mokle',
  'magle-dabali',
  'mZime-msubuqi',
  'gansieri-vicki',
  'yvela-rame',
  'datvla-suratebidan',
] as const;

export { THINGS, COLOURS, SCENES, nameOf, ordinal };
