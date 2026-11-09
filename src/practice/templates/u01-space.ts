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

/** Children's names, as used in Q6. */
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

/**
 * Values an ordering question draws from.
 *
 * Deliberately a short, evenly spaced set: the task is the ordering, not
 * arithmetic on awkward numbers, and three values from a tight range would
 * often repeat.
 */
const ORDER_VALUES = (spec: MeasureSpec): number[] => {
  const out: number[] = [];
  for (let value = spec.min; value <= Math.min(spec.max, 10); value += 1) out.push(value);
  return out;
};

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
    // The stem names the row it is about. Without this the wording never
    // changes — only the picture does — so the de-duplication that compares
    // prompts treated different questions as the same one, and a session
    // repeated the identical sentence over and over.
    prompt: 'მწკრივში დგას: {row}. რომელი ობიექტი დგას {where}?',
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
    // "რომელია რიგში X" reads as "which one is X, in a row?" — the adverbial
    // form "რომელ ადგილას" is what a child is actually being asked.
    prompt: 'მწკრივში დგას: {row}. რომელ ადგილას დგას რიგში {thing}?',
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
 * U01.1 — level 3: deduce a position instead of reading it off.
 *
 * The two ends of the row are named and the third object is the one in the
 * middle. It is the same picture as level 1, but the student has to place two
 * given things before the remaining one can be located.
 * ------------------------------------------------------------------ */

const u011Extra: QuestionTemplate[] = [
  defineTemplate({
    id: 'g1-u01-1-infer-middle',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'marcxena-marjvena',
    difficulty: 3,
    prompt:
      'მწკრივში სამი საგანი დგას. {left} მარცხნივ დგას, {right} — მარჯვნივ. რომელი საგანია შუაში?',
    variables: {
      left: { kind: 'choice', values: NAMES },
      // Both others are derived from what was drawn, so the three objects are
      // always different — otherwise the "middle" could be a repeat of an end.
      right: { kind: 'choice', values: (v: Vars) => NAMES.filter((n) => n !== v.left) },
      middle: {
        kind: 'choice',
        values: (v: Vars) => NAMES.filter((n) => n !== v.left && n !== v.right),
      },
    },
    answer: (v: Vars) => String(v.middle),
    format: { kind: 'text' },
    optionCount: 3,
    // The two named ends were given, so only the middle is a candidate; the
    // other two options repeat what the stem already placed.
    distractors: ({ vars }) => [String(vars.left), String(vars.right)],
    explanation: ({ vars }) =>
      `მარცხნივ ${vars.left}, მარჯვნივ ${vars.right}. ამიტომ შუაში ${vars.middle} დგას.`,
    visual: (v: Vars) =>
      `${thingByName(String(v.left))!.emoji} ${thingByName(String(v.middle))!.emoji} ${thingByName(String(v.right))!.emoji}`,
  }),
];

/* ================================================================== *
 * U01.2 — ზემოთ, ქვემოთ, გვერდით
 *
 * Positions are drawn, not looked up. Two objects and one relation are picked
 * independently from the shared vocabulary, and the drawing is composed from
 * that same draw — so every wording matches its picture by construction, and
 * the variation is the size of the vocabulary rather than the size of a
 * hand-written scene table.
 *
 * Georgian declines the lower object differently per relation ("ხის ქვეშ",
 * "მაგიდის ზემოთ"), so the file lists the correct forms for the relation it
 * actually draws instead of gluing a suffix onto a noun.
 * ================================================================== */

const RELATION_WORDS = { above: 'ზემოთ', below: 'ქვემოთ', beside: 'გვერდით' } as const;
type Relation = keyof typeof RELATION_WORDS;

/**
 * Irregular declensions, listed rather than derived: "წყალი" → "წყლის" and
 * "საწოლი" → "საწოლის" both lose a vowel, which no suffix rule reproduces.
 */
const GENITIVE: Record<string, string> = { წყალი: 'წყლის', საწოლი: 'საწოლის' };

/** The genitive of a vocabulary entry: "ხის", "სკამის", "აუზის". */
const genitiveOf = (thing: Thing): string =>
  GENITIVE[thing.name] ??
  (['ა', 'ე', 'ი', 'ო', 'უ'].includes(thing.name.slice(-1))
    ? `${thing.name.slice(0, -1)}ის`
    : `${thing.name}ის`);

/**
 * Objects that can sensibly sit above or below something, and objects that can
 * be the landmark underneath. Kept broad so the same template keeps producing
 * new pictures.
 */
const SITTERS = THINGS.filter((t) => ['ჩიტი', 'კატა', 'ძაღლი', 'დათუნია', 'ბურთი', 'ყვავილი', 'ბუშტი', 'ვარსკვლავი', 'მთვარე', 'საათი', 'თოჯინა', 'წიწილა', 'თევზი', 'პეპელა'].includes(t.name));

const LANDMARKS: Thing[] = [
  ...THINGS.filter((t) => ['ხე', 'სკამი', 'ყუთი', 'მაგიდა', 'საწოლი', 'სახლი', 'ავტობუსი', 'თარო', 'ჭიქა', 'ფოთოლი', 'ქოთანი'].includes(t.name)),
];

/** A vertical picture: the sitter on top or underneath the landmark. */
const stack = (relation: 'above' | 'below', sitter: Thing, landmark: Thing): string =>
  relation === 'above' ? `${sitter.emoji}\n${landmark.emoji}` : `${landmark.emoji}\n${sitter.emoji}`;

const u012: QuestionTemplate[] = [
  /**
   * Level 1 — name the position from the picture. The relation is drawn
   * vertically or side by side, so the layout itself carries the meaning.
   */
  defineTemplate({
    id: 'g1-u01-2-where-is-it',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'zeda-qveda',
    difficulty: 1,
    // No declined landmark in the stem: the picture already shows which two
    // objects are meant, so a genitive here would only be a declension trap.
    prompt: 'სურათზე {subject} და {landmark} არიან. სად არის {subject}?',
    variables: {
      subject: { kind: 'choice', values: SITTERS.map((t) => t.name) },
      landmark: {
        kind: 'choice',
        values: (v: Vars) => LANDMARKS.filter((t) => t.name !== v.subject).map((t) => t.name),
      },
      relation: { kind: 'choice', values: RELATIONS },
    },
    answer: (v: Vars) => RELATION_WORDS[String(v.relation) as Relation],
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => Object.values(RELATION_WORDS),
    explanation: ({ vars }) => {
      const relation = String(vars.relation) as Relation;
      const subject = thingByName(String(vars.subject))!;
      const landmark = thingByName(String(vars.landmark))!;
      const where =
        relation === 'above'
          ? `${genitiveOf(landmark)} ზემოთ`
          : relation === 'below'
            ? `${genitiveOf(landmark)} ქვეშ`
            : `${genitiveOf(landmark)} გვერდით`;
      return `${subject.name} ${where} არის, ამიტომ პასუხია „${RELATION_WORDS[relation]}“.`;
    },
    visual: (v: Vars) => {
      const relation = String(v.relation) as Relation;
      const subject = thingByName(String(v.subject))!;
      const landmark = thingByName(String(v.landmark))!;
      return relation === 'beside'
        ? `${landmark.emoji} ${subject.emoji}`
        : stack(relation, subject, landmark);
    },
  }),

  /**
   * Level 2 — the inverse: the relation is given, the object has to be named.
   * "გვერდით" is symmetric — both objects are beside each other — so it is
   * excluded here; asking "which one is beside?" would have two correct
   * answers.
   */
  defineTemplate({
    id: 'g1-u01-2-name-the-object',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'zeda-qveda',
    difficulty: 2,
    // `relation` is drawn as the Georgian surface form, not as the internal
    // key: rendering the key printed "რომელი საგანია above?" to a six-year-old.
    prompt: 'სურათზე {subject} და {landmark} არის. რომელი საგანია {relation}?',
    variables: {
      subject: { kind: 'choice', values: SITTERS.map((t) => t.name) },
      landmark: {
        kind: 'choice',
        values: (v: Vars) => LANDMARKS.filter((t) => t.name !== v.subject).map((t) => t.name),
      },
      // Georgian surface forms, derived from the relations this template can
      // actually draw. "გვერდით" is not one of them — see the note above.
      relation: { kind: 'choice', values: ['ზემოთ', 'ქვემოთ'] },
    },
    // The drawing always puts the *subject* in the asked position — on top for
    // "ზემოთ", underneath for "ქვემოთ" — so the question has the same answer
    // whichever relation was drawn. What varies is where the subject sits.
    answer: (v: Vars) => String(v.subject),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const others = THINGS.filter((t) => t.name !== vars.subject && t.name !== vars.landmark)
        .slice(0, 12)
        .map((t) => t.name);
      return [String(vars.landmark), String(vars.subject), ...others].filter(
        (name) => name !== answer,
      );
    },
    explanation: ({ vars }) => {
      const subject = thingByName(String(vars.subject))!;
      const landmark = thingByName(String(vars.landmark))!;
      return `${subject.name} ${genitiveOf(landmark)} ${vars.relation === 'ზემოთ' ? 'ზემოთ' : 'ქვეშ'} არის.`;
    },
    visual: (v: Vars) =>
      // By definition of the question, the object in the asked position is the
      // one on top for "ზემოთ" and underneath for "ქვემოთ".
      String(v.relation) === 'ზემოთ'
        ? `${thingByName(String(v.subject))!.emoji}\n${thingByName(String(v.landmark))!.emoji}`
        : `${thingByName(String(v.landmark))!.emoji}\n${thingByName(String(v.subject))!.emoji}`,
  }),

  /**
   * Level 3 — three objects in a column. Two comparisons in one question, and
   * the answer is a named object rather than a direction.
   */
  defineTemplate({
    id: 'g1-u01-2-extreme-of-three',
    grade,
    topicId,
    unitId: topicId,
    subtopicId: 'zeda-qveda',
    difficulty: 3,
    prompt: 'სამი საგანი ვერტიკალურადაა განლაგებული: {top}, {middle}, {bottom}. რომელია {which}?',
    variables: {
      top: { kind: 'choice', values: NAMES },
      // Distinct from the one above, so "highest" and "lowest" are never the
      // same object and the picture always shows three different things.
      middle: { kind: 'choice', values: (v: Vars) => NAMES.filter((n) => n !== v.top) },
      bottom: {
        kind: 'choice',
        values: (v: Vars) => NAMES.filter((n) => n !== v.top && n !== v.middle),
      },
      which: { kind: 'choice', values: ['ყველაზე მაღლა', 'ყველაზე დაბლა'] },
    },
    answer: (v: Vars) => String(v.which === 'ყველაზე მაღლა' ? v.top : v.bottom),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [String(vars.middle), String(vars.bottom), String(vars.top)],
    explanation: ({ vars, answer }) =>
      `ზემოდან ქვემოთ: ${vars.top}, ${vars.middle}, ${vars.bottom}. ამიტომ ${vars.which} არის ${answer}.`,
    visual: (v: Vars) =>
      `${thingByName(String(v.top))!.emoji}\n${thingByName(String(v.middle))!.emoji}\n${thingByName(String(v.bottom))!.emoji}`,
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
  /** Instrumental of the dimension: "სიგრძით", "სიმაღლით", "წონით". */
  dimensionInstr: string;
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
const compareBuilder = (spec: MeasureSpec): QuestionTemplate =>
  defineTemplate({
    id: spec.id,
    grade,
    topicId,
    unitId: topicId,
    subtopicId: spec.subtopicId,
    // "Which is longer" with two printed measures is the recognising question
    // (Q13: "9 cm or 4 cm?"), so it is level 1: one comparison, one answer.
    difficulty: 1,
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
      return `${answer} ${spec.unit} მეტია, ვიდრე ${other} ${spec.unit}. ამიტომ ${answer} ${spec.unit} უფრო ${spec.more} არის.`;
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
  plural: 'ლენტი', genitive: 'ლენტის', dimension: 'სიგრძე', dimensionInstr: 'სიგრძით', secondGenitive: 'მეორესი', secondNominative: 'მეორე', more: 'გრძელი', less: 'მოკლე', min: 2, max: 20,
};
const HEIGHT: MeasureSpec = {
  id: 'g1-u01-4-tower', subtopicId: 'magle-dabali', unit: 'სმ', noun: 'კოშკი',
  plural: 'კოშკი', genitive: 'კოშკის', dimension: 'სიმაღლე', dimensionInstr: 'სიმაღლით', secondGenitive: 'მეორესი', secondNominative: 'მეორე', more: 'მაღალი', less: 'დაბალი', min: 3, max: 20,
};
const WEIGHT: MeasureSpec = {
  id: 'g1-u01-5-bag', subtopicId: 'mZime-msubuqi', unit: 'კგ', noun: 'ჩანთა',
  plural: 'ჩანთა', genitive: 'ჩანთის', dimension: 'წონა', dimensionInstr: 'წონით', secondGenitive: 'მეორესი', secondNominative: 'მეორე', more: 'მძიმე', less: 'მსუბუქი', min: 1, max: 20,
};
const WIDTH: MeasureSpec = {
  id: 'g1-u01-6-box', subtopicId: 'gansieri-vicki', unit: 'სმ', noun: 'ყუთი',
  plural: 'ყუთი', genitive: 'ყუთის', dimension: 'სიგანე', dimensionInstr: 'სიგანით', secondGenitive: 'მეორესი', secondNominative: 'მეორე', more: 'განიერი', less: 'ვიწრო', min: 2, max: 20,
};

/**
 * One comparison per measure at level 1. U01.3 reaches level 3 by ordering (see
 * `u013to016Extra`), so its difference template is not registered here; the
 * other three measure the difference with a typed number.
 */
const u013to016: QuestionTemplate[] = [
  compareBuilder(LENGTH),
  compareBuilder(HEIGHT),
  differenceBuilder(HEIGHT),
  compareBuilder(WEIGHT),
  differenceBuilder(WEIGHT),
  compareBuilder(WIDTH),
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

/* ------------------------------------------------------------------ *
 * Ordering — "დაალაგე უმოკლესიდან უგრძელესისკენ" (Q17, Q24, Q36, Q59).
 *
 * The third answer format the specification names. The three measures are
 * shown in a scrambled order and the student taps them into order; the answer
 * key is the sequence of *display positions*, computed after the scramble.
 *
 * This is not the same task as "which is the largest": that needs one
 * comparison and one answer, this needs the whole sequence, which is the
 * difference between recognising a comparison and applying it.
 * ------------------------------------------------------------------ */

const orderBuilder = (spec: MeasureSpec): QuestionTemplate =>
  defineTemplate({
    id: `${spec.id}-order`,
    grade,
    topicId,
    unitId: topicId,
    subtopicId: spec.subtopicId,
    difficulty: 3,
    // The dimension is the instrument ("სიგრძით", "სიმაღლით") and the plural
    // names them in the stem, so the wording never needs a hyphenated case
    // ending glued onto a noun.
    prompt: `დაალაგე სამი საგანი ${spec.dimensionInstr} ზრდადობით: ჯერ ყველაზე ${spec.less}, ბოლოს — ყველაზე ${spec.more}.`,
    variables: {
      // Three different measures, drawn as a list so the template can shuffle
      // them without inventing a fourth variable.
      items: { kind: 'list', pick: { values: ORDER_VALUES(spec), length: 3, unique: true } },
    },
    answer: (_v: Vars, ctx) => {
      // The key is the *display* positions (1-based) in sorted order.
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((a, b) => a - b);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    shuffle: { source: 'items', direction: 'asc' },
    format: { kind: 'text' },
    explanation: ({ vars }) => {
      const values = (vars.items as string[]).map(Number).sort((a, b) => a - b);
      return `უმცირესიდან: ${values.map((value) => `${value} ${spec.unit}`).join(' < ')}.`;
    },
  });

/**
 * The U01.3–U01.6 library: exactly one template per level, per subtopic.
 *
 * Level 1 asks one comparison, level 2 asks about equality — where "neither is
 * more" is a third answer beside two directions — and level 3 applies it.
 * U01.3 applies it by ordering a whole row, because "longest, middle, shortest"
 * is the task the reference asks for; U01.4–U01.6 apply it by measuring the
 * difference, which those reference questions ask with a typed number.
 */
const u013to016Extra: QuestionTemplate[] = [
  equalBuilder(LENGTH), equalBuilder(HEIGHT), equalBuilder(WEIGHT), equalBuilder(WIDTH),
  orderBuilder(LENGTH),
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
    prompt: 'ჯგუფში {count} საგანია და ყველა {shape} არის. რომელია სწორი?',
    variables: {
      shape: { kind: 'choice', values: SHAPES.map((x) => x.name) },
      // The count is in the stem, not only in the picture: a group of two and a
      // group of ten are different questions, and this keeps one template from
      // running out of variations inside a single session.
      count: { kind: 'int', min: 2, max: 10 },
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

export { THINGS, COLOURS, nameOf, ordinal };
