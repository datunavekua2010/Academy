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
  /**
   * Genitive, used in phrases like "the balloon's left". Georgian declines
   * nouns irregularly (ხე → ხის, წიწილა → წიწილას), so the form is stored
   * rather than derived — a wrong ending reads as broken Georgian to a child.
   */
  gen?: string;
}

const THINGS: Thing[] = [
  { emoji: '🍎', name: 'ვაშლი', gen: 'ვაშლის' },
  { emoji: '⭐', name: 'ვარსკვლავი', gen: 'ვარსკვლავის' },
  { emoji: '🧸', name: 'დათუნია', gen: 'დათუნიას' },
  { emoji: '🌳', name: 'ხე', gen: 'ხის' },
  { emoji: '🐟', name: 'თევზი', gen: 'თევზის' },
  { emoji: '🎈', name: 'ბუშტი', gen: 'ბუშტის' },
  { emoji: '🚗', name: 'მანქანა', gen: 'მანქანის' },
  { emoji: '🌼', name: 'ყვავილი', gen: 'ყვავილის' },
  { emoji: '⚽', name: 'ბურთი', gen: 'ბურთის' },
  { emoji: '🐤', name: 'წიწილა', gen: 'წიწილას' },
  { emoji: '🍌', name: 'ბანანი', gen: 'ბანანის' },
  { emoji: '🔔', name: 'ზარი', gen: 'ზარის' },
  { emoji: '🪀', name: 'ბზრიალა', gen: 'ბზრიალას' },
  { emoji: '🪆', name: 'თოჯინა', gen: 'თოჯინას' },
  { emoji: '🚂', name: 'მატარებელი', gen: 'მატარებლის' },
  { emoji: '🌙', name: 'მთვარე', gen: 'მთვარის' },
  { emoji: '🐦', name: 'ჩიტი', gen: 'ჩიტის' },
  { emoji: '🕐', name: 'საათი', gen: 'საათის' },
  { emoji: '🪑', name: 'სკამი', gen: 'სკამის' },
];

const EMOJIS = THINGS.map((thing) => thing.emoji);

/**
 * The three relations in the form that follows a genitive:
 * "ხის ზემოთ", "სკამის ქვეშ", "ყუთის გვერდით".
 */
const GEORGIAN_RELATION: Record<Relation, string> = {
  above: 'ზემოთ',
  below: 'ქვეშ',
  beside: 'გვერდით',
};

const RELATIONS = Object.keys(GEORGIAN_RELATION) as Relation[];
const NAMES = THINGS.map((thing) => thing.name);

const thingByName = (name: string): Thing | undefined => THINGS.find((t) => t.name === name);

/**
 * Toys for U01.1, drawn from the same vocabulary the rest of the unit uses.
 * A second list would let a question name an object it cannot draw — the exact
 * bug that produced "ობიექტი" placeholders — so there is only ever one list.
 */
const TOY_NAMES = ['მანქანა', 'დათუნია', 'ბზრიალა', 'ბურთი', 'თოჯინა', 'მატარებელი'];
const toyEmoji = (name: number | string): string => thingByName(String(name))?.emoji ?? '🧸';

/** Children's names, as used in Q6. */
const CHILD_NAMES = ['ანა', 'ლუკა', 'ნინო', 'საბა', 'მარიამი', 'გიორგი'];
const nameOf = (emoji: string): string => THINGS.find((t) => t.emoji === emoji)?.name ?? 'ობიექტი';

/** Georgian ordinals 1st–6th. */
const ORDINALS = ['პირველი', 'მეორე', 'მესამე', 'მეოთხე', 'მეხუთე', 'მეექვსე'];
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

/* ------------------------------------------------------------------ *
 * U01.1 — the other shapes the reference questions use.
 *
 * Q3 (second from the left), Q4 (immediately left of X), Q5 (ends given,
 * which is in the middle) and Q6 (who stands left of the third child) are all
 * "read or infer a position in a row", but each tests a different step. They
 * are separate templates rather than one template with a mode switch, because
 * the *reasoning* differs and the difficulty differs.
 * ------------------------------------------------------------------ */

const u011Extra: QuestionTemplate[] = [
  /** Q3 — "which toy is second from the left?" Counting along a row. */
  defineTemplate({
    id: 'g1-u01-1-ordinal-from-left',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'marcxena-marjvena',
    difficulty: 2,
    prompt: 'მწკრივში საგნები დგანან. რომელი საგანია მარცხნიდან {which}?',
    variables: {
      row: { kind: 'list', pick: distinctRow },
      which: { kind: 'choice', values: ORDINALS.slice(0, 4) },
    },
    constraints: [
      {
        note: 'the row must be long enough for the ordinal asked',
        test: (v: Vars) => (v.row as unknown[]).length >= ORDINALS.indexOf(String(v.which)) + 1,
      },
    ],
    answer: (v: Vars) => nameOf((v.row as string[])[ORDINALS.indexOf(String(v.which))]),
    format: { kind: 'text' },
    distractors: ({ answer, vars }) =>
      (vars.row as string[]).map((item) => nameOf(item)).filter((name) => name !== answer),
    explanation: ({ vars }) => {
      const names = (vars.row as string[]).map((item, i) => `${i + 1}) ${nameOf(item)}`);
      return `მარცხნიდან თვლით: ${names.join(', ')}.`;
    },
    visual: (v: Vars) => row(v.row as string[]),
  }),

  /** Q4 — "which object is immediately to the left of the cup?" */
  defineTemplate({
    id: 'g1-u01-1-neighbour-of',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'marcxena-marjvena',
    difficulty: 2,
    // Three objects, not five: the answer must be deducible from the picture,
    // and every option must be one of the drawn objects. A five-item row drew
    // two objects that could not be offered as options at all.
    prompt: 'მწკრივში სამი საგანი დგას: {row}. რომელი საგანია {thingGen} უშუალოდ მარცხნივ?',
    variables: {
      row: { kind: 'list', pick: { values: EMOJIS, length: 3, unique: true } },
      thing: { kind: 'choice', values: NAMES },
      thingGen: { kind: 'choice', values: (v: Vars) => [thingByName(String(v.thing))?.gen ?? ''] },
    },
    constraints: [
      {
        note: 'the named object must be drawn, and must not be leftmost',
        test: (v: Vars) => {
          const entry = thingByName(String(v.thing));
          if (entry === undefined) return false;
          const at = (v.row as string[]).indexOf(entry.emoji);
          return at > 0;
        },
      },
    ],
    answer: (v: Vars) => {
      const at = (v.row as string[]).indexOf(thingByName(String(v.thing))!.emoji);
      return nameOf((v.row as string[])[at - 1]);
    },
    format: { kind: 'text' },
    optionCount: 3,
    // Every wrong option is one of the other objects actually in the row, so
    // "it was not in the picture" can never rule an option out.
    distractors: ({ answer, vars }) =>
      (vars.row as string[]).map((item) => nameOf(item)).filter((name) => name !== answer),
    explanation: ({ vars }) => {
      const names = (vars.row as string[]).map((item, i) => `${i + 1}) ${nameOf(item)}`);
      return `მარცხნიდან თვლით: ${names.join(', ')}.`;
    },
    visual: (v: Vars) => row(v.row as string[]),
  }),


  /**
   * Q5 — "the car is on the left, the teddy on the right, the doll is the only
   * one left; which is in the middle?" The row is DRAWN from the same three
   * facts the prompt states, so the inference and the picture agree.
   */
  defineTemplate({
    id: 'g1-u01-1-infer-middle',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'marcxena-marjvena',
    difficulty: 3,
    prompt:
      'სამი სათამაშოა მწკრივში. {left} მარცხნივ დგას, {right} — მარჯვნივ. ერთადერთი დარჩენილი სათამაშო შუაშია. რომელი სათამაშოა შუაში?',
    variables: {
      leftItem: { kind: 'choice', values: TOY_NAMES },
      middleItem: { kind: 'choice', values: TOY_NAMES },
      rightItem: { kind: 'choice', values: TOY_NAMES },
      // The ends named in the prompt ARE the ends drawn, derived rather than
      // drawn again — two independent draws would nearly always disagree.
      left: { kind: 'choice', values: (v: Vars) => [String(v.leftItem)] },
      right: { kind: 'choice', values: (v: Vars) => [String(v.rightItem)] },
    },
    constraints: [
      {
        note: 'the three toys must be different, so only one is left for the middle',
        test: (v: Vars) =>
          v.leftItem !== v.rightItem && v.leftItem !== v.middleItem && v.rightItem !== v.middleItem,
      },
    ],
    answer: (v: Vars) => String(v.middleItem),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ answer, vars }) =>
      TOY_NAMES.filter((name) => name !== answer && name !== vars.left && name !== vars.right),
    explanation: ({ vars, answer }) =>
      `მარცხნივ დგას ${vars.left}, მარჯვნივ — ${vars.right}. შუაში რჩება ${answer}.`,
    // The row is drawn from the answer, so the picture never contradicts it.
    visual: (v: Vars) => [v.leftItem, v.middleItem, v.rightItem].map((n) => toyEmoji(String(n))).join(' '),
  }),


  /**
   * Q6 — "Nino is third from the left; who is immediately left of her?"
   * Two steps: turn the ordinal into a position, then step one place left.
   */
  defineTemplate({
    id: 'g1-u01-1-neighbour-by-ordinal',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'marcxena-marjvena',
    difficulty: 3,
    prompt:
      'მწკრივში ოთხი ბავშვი დგას: {first}, {second}, {third} და {fourth}. {who} მარცხნიდან {which} ადგილზე დგას. ვინ დგას მის უშუალოდ მარცხნივ?',
    variables: {
      first: { kind: 'choice', values: CHILD_NAMES },
      second: { kind: 'choice', values: CHILD_NAMES },
      third: { kind: 'choice', values: CHILD_NAMES },
      fourth: { kind: 'choice', values: CHILD_NAMES },
      who: { kind: 'choice', values: CHILD_NAMES },
      // Second, third or fourth — never the leftmost, who has no left neighbour.
      which: { kind: 'choice', values: ORDINALS.slice(1, 4) },
    },
    constraints: [
      {
        note: 'four different children, and the child named is really in the stated place',
        test: (v: Vars) => {
          const order = [v.first, v.second, v.third, v.fourth].map(String);
          if (new Set(order).size !== 4) return false;
          return order[ORDINALS.indexOf(String(v.which))] === String(v.who);
        },
      },
    ],
    answer: (v: Vars) => {
      const order = [v.first, v.second, v.third, v.fourth].map(String);
      return order[ORDINALS.indexOf(String(v.which)) - 1];
    },
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) =>
      [vars.first, vars.second, vars.third, vars.fourth].map(String).filter((name) => name !== answer),
    explanation: ({ vars, answer }) => {
      const order = [vars.first, vars.second, vars.third, vars.fourth].map(String);
      return `მარცხნიდან: ${order.map((name, i) => `${i + 1}) ${name}`).join(', ')}. ${vars.who} ${vars.which} ადგილზე დგას, მის მარცხნივ — ${answer}.`;
    },
    visual: (v: Vars) => [v.first, v.second, v.third, v.fourth].join('  '),
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
  /** Genitive of the landmark: "ხის ზემოთ", "სკამის ქვეშ". */
  landmarkGen: string;
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
  { subject: { emoji: '🐦', name: 'ჩიტი' }, landmark: { emoji: '🌳', name: 'ხე' }, landmarkGen: 'ხის', landmarkToward: 'ხესთან', relation: 'above', text: 'ჩიტი ხის ზემოთ დაფრინავს.' },
  { subject: { emoji: '🐟', name: 'თევზი' }, landmark: { emoji: '🌊', name: 'წყალი' }, landmarkGen: 'წყლის', landmarkToward: 'წყალთან', relation: 'below', text: 'თევზი წყლის ქვეშ ცურავს.' },
  { subject: { emoji: '🐱', name: 'კატა' }, landmark: { emoji: '🪑', name: 'სკამი' }, landmarkGen: 'სკამის', landmarkToward: 'სკამთან', relation: 'above', text: 'კატა სკამზე ზის.' },
  { subject: { emoji: '🐶', name: 'ძაღლი' }, landmark: { emoji: '🛏️', name: 'საწოლი' }, landmarkGen: 'საწოლის', landmarkToward: 'საწოლთან', relation: 'below', text: 'ძაღლი საწოლის ქვეშ იწვა.' },
  { subject: { emoji: '🧸', name: 'დათუნია' }, landmark: { emoji: '📦', name: 'ყუთი' }, landmarkGen: 'ყუთის', landmarkToward: 'ყუთთან', relation: 'beside', text: 'დათუნია ყუთის გვერდით ზის.' },
  { subject: { emoji: '🌼', name: 'ყვავილი' }, landmark: { emoji: '🪴', name: 'ქოთანი' }, landmarkGen: 'ქოთნის', landmarkToward: 'ქოთანთან', relation: 'beside', text: 'ყვავილი ქოთნის გვერდით დგას.' },
  { subject: { emoji: '☁️', name: 'ღრუბელი' }, landmark: { emoji: '🏠', name: 'სახლი' }, landmarkGen: 'სახლის', landmarkToward: 'სახლთან', relation: 'above', text: 'ღრუბელი სახლის ზემოთ არის.' },
  { subject: { emoji: '⚽', name: 'ბურთი' }, landmark: { emoji: '🪑', name: 'სკამი' }, landmarkGen: 'სკამის', landmarkToward: 'სკამთან', relation: 'below', text: 'ბურთი სკამის ქვეშ არის.' },
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
      // Derived from the scene, so the wording is always the pair that is drawn.
      subject: { kind: 'choice', values: (v: Vars) => [SCENES[Number(v.scene)].subject.name] },
      landmark: { kind: 'choice', values: (v: Vars) => [SCENES[Number(v.scene)].landmarkToward] },
    },
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
      // Scenes whose relation is symmetric are excluded: "which object is
      // beside?" would have two correct answers.
      scene: { kind: 'choice', values: SCENES.map((_, i) => i).filter((i) => SCENES[i].relation !== 'beside') },
      // Derived from the scene, so the asked relation is the drawn one.
      relation: { kind: 'choice', values: (v: Vars) => [RELATION_WORDS[SCENES[Number(v.scene)].relation]] },
    },
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

/**
 * Three-object vertical arrangements, ordered top → bottom, written as emoji and
 * resolved against THINGS so every drawing has a name in the same vocabulary.
 */
const COLUMNS: Array<[string, string, string]> = [
  ['⭐', '🌙', '⚽'],
  ['🎈', '🐦', '🌳'],
  ['🎈', '🧸', '🪑'],
  ['🕐', '🪑', '⚽'],
];

/** Resolves a column's emoji to their entries; throws rather than inventing one. */
const columnThings = (index: number): [Thing, Thing, Thing] => {
  const entries = COLUMNS[index].map((emoji) => THINGS.find((t) => t.emoji === emoji));
  if (entries.some((entry) => entry === undefined)) {
    throw new Error(`column ${index} names an object that is not in THINGS`);
  }
  return entries as [Thing, Thing, Thing];
};

/* ------------------------------------------------------------------ *
 * U01.2 — the remaining shapes from the reference.
 *
 * Q9 (which sentence is right), Q11 (which of three is highest) and Q22
 * (which of three is lowest) are not the same reasoning as "where is the
 * bird?": one judges a claim, the others rank three things. Separate
 * templates, at the levels the document assigns.
 * ------------------------------------------------------------------ */

/** Draws three objects stacked vertically, given their order top → bottom. */
const column = (top: Thing, middle: Thing, bottom: Thing): string =>
  `${top.emoji}\n${middle.emoji}\n${bottom.emoji}`;

const u012Extra: QuestionTemplate[] = [
  /**
   * Q9 — which of three sentences describes the picture?
   *
   * The wrong sentences are built from the SAME subject and landmark by
   * changing only the relation: "the cup is beside the plate" against "the cup
   * is above the plate". Generated from the drawn scene rather than stored, so
   * a wrong option can never accidentally be true.
   */
  defineTemplate({
    id: 'g1-u01-2-true-sentence',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'zeda-qveda',
    difficulty: 2,
    prompt: 'რომელი წინადადება აღწერს სურათს სწორად?',
    variables: {
      scene: { kind: 'choice', values: SCENES.map((_, i) => i) },
    },
    answer: (v: Vars) => SCENES[Number(v.scene)].text,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const scene = SCENES[Number(vars.scene)];
      // Same subject and landmark, only the relation changed — that is exactly
      // the distinction the question is testing.
      return RELATIONS.filter((relation) => relation !== scene.relation).map(
        (relation) => `${scene.subject.name} ${scene.landmarkGen} ${GEORGIAN_RELATION[relation]} არის.`,
      );
    },
    explanation: ({ vars }) => `სწორია: ${SCENES[Number(vars.scene)].text}`,
    visual: (v: Vars) => sceneDrawing(SCENES[Number(v.scene)]),
  }),

  /**
   * Q11 / Q22 — three objects in a vertical column; which is highest / lowest.
   * The column is drawn from a single ordered choice, so "highest" is simply
   * the first entry and "lowest" the last.
   */
  defineTemplate({
    id: 'g1-u01-2-extreme-of-three',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'zeda-qveda',
    difficulty: 3,
    prompt: 'სამი საგანი ვერტიკალურადაა განლაგებული. რომელი საგანია {which}?',
    variables: {
      column: { kind: 'choice', values: COLUMNS.map((_, i) => i) },
      which: { kind: 'choice', values: ['ყველაზე მაღლა', 'ყველაზე დაბლა'] },
    },
    answer: (v: Vars) => {
      const col = columnThings(Number(v.column));
      return v.which === 'ყველაზე მაღლა' ? col[0].name : col[2].name;
    },
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ answer, vars }) =>
      columnThings(Number(vars.column)).map((t) => t.name).filter((name) => name !== answer),
    explanation: ({ vars }) => {
      const col = columnThings(Number(vars.column));
      return `ზემოდან ქვემოთ: ${col.map((t) => t.name).join(', ')}.`;
    },
    visual: (v: Vars) => {
      const col = columnThings(Number(v.column));
      return column(col[0], col[1], col[2]);
    },
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
  /** Georgian comparative adjectives, both directions. */
  more: string;
  less: string;
  /** Plural, used when three things are shown: "სამი ლენტი". */
  plural: string;
  /** Genitive, used in "ლენტის სიგრძე". */
  genitive: string;
  /** What the measure is: "სიგრძე", "სიმაღლე", "წონა", "სიგანე". */
  dimension: string;
  /** "the second one's" — a stored form, not name + suffix. */
  secondGenitive: string;
  /** "the second one" — nominative, for the option that names it. */
  secondNominative: string;
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

/**
 * "Which is MORE" and "which is LESS" are not the same question: one is the
 * obvious direction, the other needs the comparison reversed. The reference
 * asks both (Q14 "which is shorter", Q26 "which is lighter", Q32 "which is
 * narrower"), so the direction is a parameter rather than a second template
 * body.
 */
const compareBuilder = (spec: MeasureSpec, direction: 'more' | 'less' = 'more'): QuestionTemplate =>
  defineTemplate({
    id: direction === 'more' ? spec.id : `${spec.id}-${direction}`,
    grade,
    topicId,
    unitId: topicId,
    subtopicId: spec.subtopicId,
    difficulty: 2,
    prompt: `რომელი ${spec.noun} არის უფრო ${direction === 'more' ? spec.more : spec.less}: {a} ${spec.unit} თუ {b} ${spec.unit}?`,
    variables: {
      a: { kind: 'int', min: spec.min, max: spec.max },
      b: { kind: 'int', min: spec.min, max: spec.max },
    },
    constraints: [{ note: 'the two measures must differ', test: (v: Vars) => Number(v.a) !== Number(v.b) }],
    answer: (v: Vars) =>
      direction === 'more' ? Math.max(Number(v.a), Number(v.b)) : Math.min(Number(v.a), Number(v.b)),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const other = Number(vars.a) === Number(answer) ? Number(vars.b) : Number(vars.a);
      const adjective = direction === 'more' ? spec.more : spec.less;
      const [big, small] = direction === 'more' ? [answer, other] : [other, answer];
      return `${big} ${spec.unit} მეტია, ვიდრე ${small} ${spec.unit}. ამიტომ ${answer} ${spec.unit} უფრო ${adjective} არის.`;
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
    format: { kind: 'integer', min: 1 , entry: true},
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer}. პირველი ${answer} ${spec.unit}-ით უფრო ${spec.more} არის.`,
    visual: (v: Vars) => bars(Number(v.a), Number(v.b), spec),
  });

const LENGTH: MeasureSpec = {
  id: 'g1-u01-3-ribbon', subtopicId: 'grZeli-mokle', unit: 'სმ', noun: 'ლენტი',
  plural: 'ლენტი', genitive: 'ლენტის', dimension: 'სიგრძე', secondGenitive: 'მეორესი', secondNominative: 'მეორე', more: 'გრძელი', less: 'მოკლე', min: 2, max: 20,
};
const HEIGHT: MeasureSpec = {
  id: 'g1-u01-4-tower', subtopicId: 'magle-dabali', unit: 'სმ', noun: 'კოშკი',
  plural: 'კოშკი', genitive: 'კოშკის', dimension: 'სიმაღლე', secondGenitive: 'მეორესი', secondNominative: 'მეორე', more: 'მაღალი', less: 'დაბალი', min: 3, max: 20,
};
const WEIGHT: MeasureSpec = {
  id: 'g1-u01-5-bag', subtopicId: 'mZime-msubuqi', unit: 'კგ', noun: 'ჩანთა',
  plural: 'ჩანთა', genitive: 'ჩანთის', dimension: 'წონა', secondGenitive: 'მეორესი', secondNominative: 'მეორე', more: 'მძიმე', less: 'მსუბუქი', min: 1, max: 20,
};
const WIDTH: MeasureSpec = {
  id: 'g1-u01-6-box', subtopicId: 'gansieri-vicki', unit: 'სმ', noun: 'ყუთი',
  plural: 'ყუთი', genitive: 'ყუთის', dimension: 'სიგანე', secondGenitive: 'მეორესი', secondNominative: 'მეორე', more: 'განიერი', less: 'ვიწრო', min: 2, max: 20,
};

const u013to016: QuestionTemplate[] = [
  compareBuilder(LENGTH),
  compareBuilder(LENGTH, 'less'),
  differenceBuilder(LENGTH),
  compareBuilder(HEIGHT),
  compareBuilder(HEIGHT, 'less'),
  differenceBuilder(HEIGHT),
  compareBuilder(WEIGHT),
  compareBuilder(WEIGHT, 'less'),
  differenceBuilder(WEIGHT),
  compareBuilder(WIDTH),
  compareBuilder(WIDTH, 'less'),
  differenceBuilder(WIDTH),
];

/* ------------------------------------------------------------------ *
 * U01.3–U01.6 — the other judgement the reference asks for.
 *
 * Beyond "which is longer" (a two-way comparison) the document asks for
 * three more distinct steps: notice that two measures are EQUAL (Q16, Q34),
 * pick an extreme from THREE values (Q21, Q29, Q35), and read a balance
 * (Q28). Equality in particular is not a comparison — it is the case where
 * the comparison has no winner, and a child who only ever sees "which is
 * more" learns to always pick one.
 * ------------------------------------------------------------------ */

const equalBuilder = (spec: MeasureSpec): QuestionTemplate =>
  defineTemplate({
    id: `${spec.id}-equal`,
    grade,
    topicId,
    unitId: topicId,
    subtopicId: spec.subtopicId,
    difficulty: 2,
    // Georgian does not decline the second item's name with a suffix here: one
    // adjective governs both ("პირველი … 6 სმ-ია, მეორე — 6 სმ").
    prompt: `პირველი ${spec.genitive} ${spec.dimension} {a} ${spec.unit}-ია, მეორე — {b} ${spec.unit}. რომელი წინადადებაა სწორი?`,
    variables: {
      a: { kind: 'int', min: spec.min, max: spec.max - 3 },
      /** Never shorter than the first, so the three options stay meaningful. */
      b: { kind: 'int', min: (v: Vars) => Number(v.a), max: (v: Vars) => Math.min(spec.max, Number(v.a) + 3) },
    },
    answer: (v: Vars) =>
      Number(v.a) === Number(v.b)
        ? 'ორივე ერთნაირია'
        : `მეორე უფრო ${spec.more} არის`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ answer }) => {
      const all = [
        `მეორე უფრო ${spec.more} არის`,
        'ორივე ერთნაირია',
        `პირველი უფრო ${spec.more} არის`,
      ];
      return all.filter((option) => option !== answer);
    },
    explanation: ({ vars }) =>
      Number(vars.a) === Number(vars.b)
        ? `ორივე ${vars.a} ${spec.unit}-ია, ამიტომ ისინი ერთნაირია.`
        : `${vars.b} ${spec.unit} მეტია ${vars.a} ${spec.unit}-ზე, ამიტომ მეორე უფრო ${spec.more} არის.`,
    // Bars are drawn at two characters per unit, so measures that differ by one
    // cannot land on the same length — a picture that contradicts the numbers
    // is worse than no picture.
    visual: (v: Vars) => `${'▬'.repeat(Number(v.a))}\n${'▬'.repeat(Number(v.b))}`,
  });

/**
 * Q21 / Q29 / Q35 — an extreme of THREE values. Three-way comparison is
 * harder than two-way: the child has to hold one winner while checking the
 * other two.
 */
const extremeOfThreeBuilder = (spec: MeasureSpec, which: 'max' | 'min'): QuestionTemplate =>
  defineTemplate({
    id: `${spec.id}-${which === 'max' ? 'largest' : 'smallest'}-of-three`,
    grade,
    topicId,
    unitId: topicId,
    subtopicId: spec.subtopicId,
    difficulty: 3,
    prompt: `სამი ${spec.plural} გვაქვს. პირველი — {a} ${spec.unit}, მეორე — {b} ${spec.unit}, მესამე — {c} ${spec.unit}. რომელია ${which === 'max' ? `ყველაზე ${spec.more}` : `ყველაზე ${spec.less}`}?`,
    variables: {
      a: { kind: 'int', min: spec.min, max: spec.max },
      b: { kind: 'int', min: spec.min, max: spec.max },
      c: { kind: 'int', min: spec.min, max: spec.max },
    },
    constraints: [
      { note: 'all three must differ, so a single extreme exists', test: (v: Vars) => new Set([v.a, v.b, v.c]).size === 3 },
    ],
    answer: (v: Vars) => {
      const values = [Number(v.a), Number(v.b), Number(v.c)];
      const wanted = values.indexOf(which === 'max' ? Math.max(...values) : Math.min(...values));
      // Named, not lettered: a six-year-old is asked about the first, second or
      // third one, not about "A".
      return ['პირველი', 'მეორე', 'მესამე'][wanted];
    },
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ answer }) => ['პირველი', 'მეორე', 'მესამე'].filter((name) => name !== answer),
    explanation: ({ vars, answer }) => {
      const rows: Array<[string, number]> = [
        ['პირველი', Number(vars.a)],
        ['მეორე', Number(vars.b)],
        ['მესამე', Number(vars.c)],
      ];
      const sorted = [...rows].sort((x, y) => x[1] - y[1]);
      return `ზრდადობით: ${sorted.map(([name, value]) => `${name} — ${value} ${spec.unit}`).join(', ')}. პასუხია ${answer}.`;
    },
  });

/**
 * Q28 — a balance. The left pan holds more, so the rule "the heavier side
 * sinks" gives the left, and the drawing shows its pan lower so the picture
 * and the answer cannot disagree.
 */
const balanceBuilder = (spec: MeasureSpec): QuestionTemplate =>
  defineTemplate({
    id: `${spec.id}-balance`,
    grade,
    topicId,
    unitId: topicId,
    subtopicId: spec.subtopicId,
    difficulty: 3,
    prompt: `სასწორის მარცხენა მხარეს {heavy} ${spec.unit}-ია, მარჯვენაზე — {light} ${spec.unit}. რომელი მხარე დაიწევს ქვემოთ?`,
    variables: {
      heavy: { kind: 'int', min: spec.min + 1, max: spec.max },
      light: { kind: 'int', min: spec.min, max: (v: Vars) => Number(v.heavy) - 1 },
    },
    answer: () => 'მარცხენა',
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => ['მარჯვენა', 'არცერთი'],
    explanation: ({ vars }) =>
      `მარცხნივ ${vars.heavy} ${spec.unit} მეტია, ვიდრე მარჯვნივ ${vars.light} ${spec.unit}. მძიმე მხარე ჩადის, ამიტომ დაიწევს მარცხენა.`,
    visual: (v: Vars) => `⬇️ ${Number(v.heavy)} ${spec.unit}    ⚖    ${Number(v.light)} ${spec.unit} ⬆️`,
  });

const u013to016Extra: QuestionTemplate[] = [
  equalBuilder(LENGTH), equalBuilder(WIDTH),
  extremeOfThreeBuilder(LENGTH, 'max'), extremeOfThreeBuilder(LENGTH, 'min'),
  extremeOfThreeBuilder(HEIGHT, 'max'),
  extremeOfThreeBuilder(WEIGHT, 'min'), extremeOfThreeBuilder(WEIGHT, 'max'),
  extremeOfThreeBuilder(WIDTH, 'max'), extremeOfThreeBuilder(WIDTH, 'min'),
  balanceBuilder(WEIGHT),
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
    prompt: 'მართალია თუ არა: „ჯგუფში ყველა {colour} არის“?',
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
    format: { kind: 'integer', min: 1 , entry: true},
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

/* ------------------------------------------------------------------ *
 * U01.7 — the quantifier judgements the reference adds.
 *
 * "All are red" (true or false) is one judgement. Q39–Q42 ask three more:
 * whether "some" is true, which of two sentences is right, whether BOTH
 * sentences are true, and — the hardest — which sentence is *wrong*.
 * Finding a falsehood among true statements is a different scan from
 * confirming a truth, so it is its own template at level 3.
 *
 * Shapes rather than colours are used here, because the reference mixes
 * cats/dogs and circles/triangles and the reasoning is identical.
 * ------------------------------------------------------------------ */

const SHAPES = [
  { emoji: '🔴', name: 'წრე' },
  { emoji: '🔺', name: 'სამკუთხედი' },
  { emoji: '🟩', name: 'კვადრატი' },
  { emoji: '⭐', name: 'ვარსკვლავი' },
];

const shapeByName = (name: string) => SHAPES.find((s) => s.name === name);

const u017Extra: QuestionTemplate[] = [
  /** Q39 — the group contains some of the named shape; is "some are…" true? */
  defineTemplate({
    id: 'g1-u01-7-some-is-true',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'yvela-rame',
    difficulty: 2,
    prompt: 'მართალია თუ არა: „ჯგუფში ზოგიერთი {shape} არის“?',
    variables: {
      shape: { kind: 'choice', values: SHAPES.map((x) => x.name) },
      group: { kind: 'list', pick: { values: SHAPES.map((x) => x.emoji), length: { min: 2, max: 5 } } },
    },
    answer: (v: Vars) => {
      const target = shapeByName(String(v.shape))!.emoji;
      return (v.group as string[]).includes(target) ? 'მართალია' : 'არ არის მართალი';
    },
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => (answer === 'მართალია' ? ['არ არის მართალი'] : ['მართალია']),
    explanation: ({ vars }) => {
      const target = shapeByName(String(vars.shape))!.emoji;
      const n = (vars.group as string[]).filter((x) => x === target).length;
      return n > 0
        ? `ჯგუფში ${n} ${vars.shape} არის, ამიტომ დებულება მართალია.`
        : `ჯგუფში არცერთი ${vars.shape} არ არის, ამიტომ დებულება არ არის მართალი.`;
    },
    visual: (v: Vars) => (v.group as string[]).join(' '),
  }),

  /**
   * Q40 — a group where "all" is wrong and "some" is right, so the child has
   * to see that one counter-example defeats "all" while leaving "some" true.
   * Every wrong option is false by construction, not by luck.
   */
  defineTemplate({
    id: 'g1-u01-7-quantifier-sentence',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'yvela-rame',
    difficulty: 2,
    prompt: 'ჯგუფს ვუყურებთ. რომელი წინადადებაა სწორი?',
    variables: {
      group: { kind: 'list', pick: { values: SHAPES.map((x) => x.emoji), length: { min: 3, max: 5 } } },
    },
    constraints: [
      {
        note: 'mixed group with at least one shape absent, so "some" and "all" differ',
        test: (v: Vars) => {
          const group = v.group as string[];
          const present = SHAPES.filter((x) => group.includes(x.emoji));
          return present.length >= 1 && present.length < SHAPES.length;
        },
      },
    ],
    answer: (v: Vars) => {
      const present = SHAPES.filter((x) => (v.group as string[]).includes(x.emoji));
      return `ზოგიერთი ${present[0].name} არის`;
    },
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const group = vars.group as string[];
      const present = SHAPES.filter((x) => group.includes(x.emoji));
      const missing = SHAPES.filter((x) => !group.includes(x.emoji));
      return [
        // false: nothing of that shape is in the group
        `ყველა ${missing[0].name} არის`,
        // false: that shape certainly is in the group
        `ვერცერთი ${present[0].name} არ არის`,
      ].filter((option) => option !== answer);
    },
    explanation: ({ vars, answer }) => {
      const group = vars.group as string[];
      const present = SHAPES.filter((x) => group.includes(x.emoji)).map((x) => x.name);
      const missing = SHAPES.filter((x) => !group.includes(x.emoji)).map((x) => x.name);
      return `ჯგუფში არის ${present.join(', ')}, მაგრამ არ არის ${missing.join(', ')}. ამიტომ სწორია: „${answer}“.`;
    },
    visual: (v: Vars) => (v.group as string[]).join(' '),
  }),

  /**
   * Q41 — every object is the same shape, so both "all" and "some" hold.
   * The options are the two sentences plus "both" and "neither", in the form a
   * six-year-old reads rather than as a quoted meta-statement.
   */
  defineTemplate({
    id: 'g1-u01-7-all-and-some',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'yvela-rame',
    difficulty: 3,
    prompt: 'ჯგუფში ყველა საგანი {shape} არის. რომელია სწორი?',
    variables: {
      shape: { kind: 'choice', values: SHAPES.map((x) => x.name) },
      count: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v: Vars) => `ორივე მართალია: ყველა ${v.shape} არის და ზოგიერთი ${v.shape} არის`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [
      `მხოლოდ „ყველა ${vars.shape} არის“ მართალია`,
      `არცერთი არ არის მართალი`,
    ],
    explanation: ({ vars }) =>
      `ჯგუფში ყველა საგანი ${vars.shape} არის. ამიტომ მართალია „ყველა ${vars.shape} არის“ და მართალია „ზოგიერთი ${vars.shape} არის“.`,
    visual: (v: Vars) => shapeByName(String(v.shape))!.emoji.repeat(Number(v.count)),
  }),

  /**
   * Q42 — which sentence is WRONG? Finding a false statement among true ones
   * is a different scan from confirming a true one, so it is its own template.
   * The wrong sentence claims "all" of a shape that is not in the group at all.
   */
  defineTemplate({
    id: 'g1-u01-7-false-sentence',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'yvela-rame',
    difficulty: 3,
    prompt: 'ჯგუფს ვუყურებთ. რომელი წინადადებაა არასწორი?',
    variables: {
      group: { kind: 'list', pick: { values: SHAPES.map((x) => x.emoji), length: { min: 3, max: 5 } } },
    },
    constraints: [
      {
        note: 'at least one shape present and one absent, so both true and false sentences exist',
        test: (v: Vars) => {
          const group = v.group as string[];
          const present = SHAPES.filter((x) => group.includes(x.emoji));
          return present.length >= 1 && present.length < SHAPES.length;
        },
      },
    ],
    answer: (v: Vars) => {
      const missing = SHAPES.filter((x) => !(v.group as string[]).includes(x.emoji));
      return `ყველა ${missing[0].name} არის`;
    },
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const group = vars.group as string[];
      const present = SHAPES.filter((x) => group.includes(x.emoji));
      const options = present.map((x) => `ზოგიერთი ${x.name} არის`);
      return options.filter((option) => option !== answer);
    },
    explanation: ({ vars, answer }) => {
      const group = vars.group as string[];
      const present = SHAPES.filter((x) => group.includes(x.emoji)).map((x) => x.name);
      const missing = SHAPES.filter((x) => !group.includes(x.emoji)).map((x) => x.name);
      return `ჯგუფში ${present.join(', ')} არის, ხოლო ${missing.join(', ')} — არა. ამიტომ არასწორია: „${answer}“.`;
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
      count: { kind: 'int', min: 2, max: 10 },
    },
    answer: (v: Vars) => Number(v.count),
    format: { kind: 'integer', min: 2 , entry: true},
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
    format: { kind: 'integer', min: 2 , entry: true},
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
    format: { kind: 'integer', min: 1 , entry: true},
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
    visual: (v: Vars) => (thingByName(String(v.thing))?.emoji ?? '⭐').repeat(Number(v.a)),
  }),
];

/* ------------------------------------------------------------------ *
 * U01.8 — the remainder question.
 *
 * Q50 gives the total and the count of one colour and asks for the rest.
 * It is subtraction, but the picture shows the whole set so the child can
 * also count what is left — two routes to the same number, which is the
 * point at this level.
 * ------------------------------------------------------------------ */

const u018Extra: QuestionTemplate[] = [
  defineTemplate({
    id: 'g1-u01-8-rest-are',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'datvla-suratebidan',
    difficulty: 3,
    prompt: 'სურათზე {total} ფერადი წრეა. {red} წითელია, დანარჩენი ლურჯი. რამდენი ლურჯია?',
    variables: {
      red: { kind: 'int', min: 1, max: 7 },
      blue: { kind: 'int', min: 1, max: 7 },
      total: { kind: 'int', min: 2, max: 14 },
    },
    constraints: [
      { note: 'the stated total must be exactly what is drawn', test: (v: Vars) => Number(v.red) + Number(v.blue) === Number(v.total) },
    ],
    answer: (v: Vars) => Number(v.blue),
    format: { kind: 'integer', min: 1 , entry: true},
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.red} + ${answer} = ${Number(vars.red) + Number(vars.blue)}.`,
    visual: (v: Vars) => `${'🔴'.repeat(Number(v.red))} ${'🔵'.repeat(Number(v.blue))}`,
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
  ...u011Extra,
  ...u012,
  ...u012Extra,
  ...u013to016,
  ...u013to016Extra,
  ...u017,
  ...u017Extra,
  ...u018,
  ...u018Extra,
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
