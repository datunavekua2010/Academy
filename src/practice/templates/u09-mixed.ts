import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

/**
 * U09 — შერეული ამოცანები (mixed problems).
 *
 * The ninth grade-1 unit, and the first one whose subject is *arithmetic
 * itself* rather than a quantity: the laws that let you regroup a sum, the
 * choice between adding and taking away, and the habit of checking whether an
 * equality is true. Everything stays inside twenty, because that is where the
 * unit's own learning goal stops.
 *
 * Six rules hold the library together:
 *
 *  1. **A two-step expression matches its sentence exactly** (spec rule 4). The
 *     story and the printed expression are built from the same drawn numbers in
 *     the same order, so „5 + 3 − 2“ is the sentence about 5 balls, 3 more and
 *     2 given away, never a rearrangement of it.
 *  2. **Nothing goes negative** at any intermediate step, not only at the end.
 *     `5 + 3 − 2` may pass through 8; it may never pass through −1, and it never
 *     does, because the number taken away is drawn from what is there.
 *  3. **A comparison evaluates both sides first** (spec rule 6), then reads the
 *     sign off the two values. Never off the shape of the expressions.
 *  4. **True/false is decided by arithmetic** (spec rule 5), and the false
 *     claims are off by one or two, so computing is the only way through.
 *  5. **Each answer is computed from the printed numbers.** Nothing stores an
 *     intended answer; a template prints numbers and derives the result.
 *  6. **A puzzle has one answer.** Where the spec asks for two blanks (Q48), the
 *     question is recast with one blank and one printed number, which is the
 *     same reasoning with one place to put it — the engine grades one answer
 *     per question, and a second blank would have nothing to check it against.
 *
 * Two shapes are offered through a computed sentence rather than two templates:
 * „which operation is needed“ draws the operation first and then prints the
 * story that belongs to it, so both answers occur without the item becoming
 * two items.
 */

const grade = 1 as const;
const topicId = 'Sereuli-amocanebi';
const unitId = 'Sereuli-amocanebi';

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
  /** The singular, printed after every numeral. */
  name: string;
}

const THINGS: Thing[] = [
  { emoji: '🍎', name: 'ვაშლი' },
  { emoji: '⚽', name: 'ბურთი' },
  { emoji: '⭐', name: 'ვარსკვლავი' },
  { emoji: '🧱', name: 'კუბიკი' },
  { emoji: '✏️', name: 'ფანქარი' },
  { emoji: '📚', name: 'წიგნი' },
  { emoji: '🍪', name: 'ნამცხვარი' },
  { emoji: '🎈', name: 'ბუშტი' },
  { emoji: '🧸', name: 'სათამაშო' },
  { emoji: '📘', name: 'რვეული' },
];

const THING_NAMES = THINGS.map((thing) => thing.name);
const thingByName = (name: string): Thing =>
  THINGS.find((thing) => thing.name === name) ?? THINGS[0];

/**
 * Children's names in the two cases this unit prints.
 *
 * „ანას აქვს“ and „ლუკას ჰქონდა“ both take the dative. The endings are irregular
 * (მარიამი → მარიამს, ანა → ანას by dropping its final vowel), so the forms are
 * stored and nothing is glued on at generation time.
 */
interface Child {
  name: string;
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
 * Distractor helpers
 * ================================================================== */

/**
 * Wrong answers for a small computed number.
 *
 * Neighbours of the answer, plus whatever the sentence would have given if the
 * operation had been the other one — the mistake this unit exists to catch.
 */
const nearMisses = (answer: number, also: number[] = []): number[] => {
  const candidates = [answer + 1, answer - 1, answer + 2, answer - 2, ...also];
  const out: number[] = [];
  for (const candidate of candidates) {
    if (!Number.isInteger(candidate)) continue;
    if (candidate === answer) continue;
    if (candidate < 0 || candidate > 40) continue;
    if (out.includes(candidate)) continue;
    out.push(candidate);
  }
  return out;
};

/** A row of one emoji, one space between objects. */
const draw = (emoji: string, count: number): string =>
  Array.from({ length: count }, () => emoji).join(' ');

/* ================================================================== *\
 * U09.1 — შეკრებისა და გამოკლების თვისებები
 * ================================================================== */

/**
 * The laws, each demonstrated rather than named.
 *
 *  - **Commutativity** is the whole of Q2 and Q3: `7 + 3 = 3 + __` is answered 7
 *    without adding anything, which is the point — the child is meant to see
 *    that the missing number is the one on the other side.
 *  - **Subtraction is not commutative**, so Q4 asks which of `12 − 4` and
 *    `12 − 5` is larger. Taking away less leaves more; the answer is read off
 *    the subtrahend, and both expressions are computed anyway so the reasoning
 *    and the arithmetic agree.
 *  - **Both sides equal** is Q6: `16 − 7 = __ − 8` is solved by making the left
 *    side, 9, and then finding what must be taken from 8 to leave 9.
 */
const u091: QuestionTemplate[] = [
  /** Level 1 — 3 + 5 straight (Q1). */
  defineTemplate({
    ...at({ id: 'g1-u09-1-add', subtopicId: 'Tvisebebi', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b} = __.',
    variables: {
      a: { kind: 'int', min: 1, max: 9 },
      b: { kind: 'int', min: 1, max: 9 },
    },
    constraints: [{ note: 'the sum stays inside twenty', test: (v: Vars) => Number(v.a) + Number(v.b) <= 20 }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  /** Level 1 — are 4 + 6 and 6 + 4 equal? (Q2). */
  defineTemplate({
    ...at({ id: 'g1-u09-1-commutative-choice', subtopicId: 'Tvisebebi', difficulty: 1 }),
    prompt: 'შეადარე: {a} + {b} და {b} + {a}.',
    variables: {
      a: { kind: 'int', min: 1, max: 9 },
      b: { kind: 'int', min: 1, max: 9 },
    },
    constraints: [
      { note: 'the two addends differ, so the swap is visible', test: (v: Vars) => Number(v.a) !== Number(v.b) },
      { note: 'the sum stays inside twenty', test: (v: Vars) => Number(v.a) + Number(v.b) <= 20 },
    ],
    // The two sums are equal by the law, so the correct option is always the
    // third one; the other two are the mistakes of comparing the addends.
    answer: () => 'ჯამები ტოლია',
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => ['პირველი ჯამი მეტია', 'მეორე ჯამი მეტია'],
    explanation: ({ vars }) =>
      `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)} და ${vars.b} + ${vars.a} = ${Number(vars.a) + Number(vars.b)} — შესაკრებების ადგილის შეცვლა ჯამს არ ცვლის.`,
  }),

  /** Level 2 — 7 + 3 = 3 + __, the missing addend is the other one (Q3). */
  defineTemplate({
    ...at({ id: 'g1-u09-1-swapped-addend', subtopicId: 'Tvisebebi', difficulty: 2 }),
    prompt: 'შეავსე: {a} + {b} = {b} + __.',
    variables: {
      a: { kind: 'int', min: 1, max: 9 },
      b: { kind: 'int', min: 1, max: 9 },
    },
    constraints: [
      { note: 'the two addends differ, so the answer is not printed twice', test: (v: Vars) => Number(v.a) !== Number(v.b) },
      { note: 'the sum stays inside twenty', test: (v: Vars) => Number(v.a) + Number(v.b) <= 20 },
    ],
    answer: (v: Vars) => Number(v.a),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) => nearMisses(Number(answer), [Number(vars.b)]).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, ამიტომ ${vars.b}-ს ${answer} უნდა დაემატოს.`,
  }),

  /** Level 2 — which of 12 − 4 and 12 − 5 is larger? (Q4). */
  defineTemplate({
    ...at({ id: 'g1-u09-1-which-difference', subtopicId: 'Tvisebebi', difficulty: 2 }),
    prompt: 'გამოთვალე ორი გამოსახულება: {a} − {b} და {a} − {c}. რომელს აქვს მეტი მნიშვნელობა?',
    variables: {
      a: { kind: 'int', min: 10, max: 20 },
      b: { kind: 'int', min: 1, max: 5 },
      c: { kind: 'int', min: 4, max: 9 },
    },
    constraints: [
      { note: 'the second subtrahend is the larger, so the first expression is the larger', test: (v: Vars) => Number(v.b) < Number(v.c) && Number(v.a) - Number(v.c) >= 0 },
    ],
    // Taking away less leaves more, so the expression with the smaller
    // subtrahend is the larger one — derived, never stored.
    answer: (v: Vars) => `${v.a} − ${v.b}`,
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ vars }) => [`${vars.a} − ${vars.c}`],
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}, ხოლო ${vars.a} − ${vars.c} = ${Number(vars.a) - Number(vars.c)}; მეტია ${answer}.`,
  }),

  /** Level 3 — 8 + 5 = 5 + __ (Q5). */
  defineTemplate({
    ...at({ id: 'g1-u09-1-swapped-large', subtopicId: 'Tvisebebi', difficulty: 3 }),
    prompt: 'შეავსე: {a} + {b} = {b} + __.',
    variables: {
      a: { kind: 'int', min: 5, max: 12 },
      b: { kind: 'int', min: 5, max: 9 },
    },
    constraints: [
      { note: 'the two addends differ, so the answer is not printed twice', test: (v: Vars) => Number(v.a) !== Number(v.b) },
      { note: 'the sum stays inside twenty', test: (v: Vars) => Number(v.a) + Number(v.b) <= 20 },
    ],
    answer: (v: Vars) => Number(v.a),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) => nearMisses(Number(answer), [Number(vars.b)]).map(String),
    explanation: ({ vars, answer }) =>
      `შესაკრებების ადგილის შეცვლა ჯამს არ ცვლის: ${vars.a} + ${vars.b} = ${vars.b} + ${answer}.`,
  }),

  /** Level 3 — 16 − 7 = __ − 8, both sides equal (Q6). */
  defineTemplate({
    ...at({ id: 'g1-u09-1-both-sides', subtopicId: 'Tvisebebi', difficulty: 3 }),
    prompt: 'იპოვე უცნობი რიცხვი: {a} − {b} = __ − {c}.',
    variables: {
      a: { kind: 'int', min: 12, max: 20 },
      b: { kind: 'int', min: 3, max: 9 },
      c: { kind: 'int', min: 4, max: 9 },
      // The right-hand minuend is the left-hand value plus c, so the two sides
      // are equal by construction rather than by a lucky draw.
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.a) - Number(v.b) + Number(v.c)] },
    },
    constraints: [
      { note: 'the left side is positive and the unknown differs from every printed number', test: (v: Vars) =>
          Number(v.a) - Number(v.b) > 0 && Number(v.answer) !== Number(v.a) && Number(v.answer) !== Number(v.b) && Number(v.answer) !== Number(v.c) },
      { note: 'the unknown stays inside twenty', test: (v: Vars) => Number(v.answer) <= 20 },
    ],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) => nearMisses(Number(answer), [Number(vars.a), Number(vars.c)]).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}, ამიტომ ${answer} − ${vars.c} = ${Number(vars.a) - Number(vars.b)} და უცნობი რიცხვია ${answer}.`,
  }),
];

/* ================================================================== *\
 * U09.2 — რომელი მოქმედება უნდა გამოვიყენოთ?
 * ================================================================== */

/**
 * Choosing the operation, and then doing it.
 *
 * Q7 and Q8 ask *only* which operation is needed, and the answer is a word. So
 * the operation is not chosen by the template author and printed — it is drawn,
 * and the story is then built to match it. That way „შეკრება“ and „გამოკლება“
 * both occur for the same item, which is the whole point of the subtopic: the
 * child has to read „და კიდევ … მიიღო“ as adding and „დაკარგა“ as taking away,
 * not recognise a template that always adds.
 */
const u092: QuestionTemplate[] = [
  /** Level 1 — adding or taking away, said in one sentence (Q7, Q8). */
  defineTemplate({
    ...at({ id: 'g1-u09-2-which-operation', subtopicId: 'romeli-moqmedeba', difficulty: 1 }),
    // The sentence is split by the drawn operation, so one template produces
    // both stories. „{who}ს ჰქონდა …“ takes the dative.
    prompt: '{who} ჰქონდა {a} {item} და {tail}',
    variables: {
      who: { kind: 'choice', values: WHOM },
      item: { kind: 'choice', values: THING_NAMES },
      op: { kind: 'choice', values: ['add', 'subtract'] },
      a: { kind: 'int', min: 4, max: 15 },
      b: { kind: 'int', min: 2, max: 8 },
      // The tail is the sentence that belongs to the drawn operation.
      tail: {
        kind: 'choice',
        values: (v: Vars) =>
          v.op === 'add'
            ? [`კიდევ ${v.b} აჩუქეს. რომელი მოქმედებაა საჭირო?`]
            : [`${v.b} დაკარგა. რომელი მოქმედებაა საჭირო?`],
      },
    },
    constraints: [
      { note: 'taking away leaves something behind', test: (v: Vars) => v.op === 'add' || Number(v.a) - Number(v.b) > 0 },
    ],
    answer: (v: Vars) => (v.op === 'add' ? 'შეკრება' : 'გამოკლება'),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => [answer === 'შეკრება' ? 'გამოკლება' : 'შეკრება'],
    explanation: ({ vars }) =>
      vars.op === 'add'
        ? `„კიდევ ${vars.b} აჩუქეს“ ნიშნავს, რომ რაოდენობა გაიზარდა — საჭიროა შეკრება.`
        : `„${vars.b} დაკარგა“ ნიშნავს, რომ რაოდენობა შემცირდა — საჭიროა გამოკლება.`,
  }),

  /** Level 2 — choose the operation and also solve it: adding (Q9). */
  defineTemplate({
    ...at({ id: 'g1-u09-2-add-and-solve', subtopicId: 'romeli-moqmedeba', difficulty: 2 }),
    prompt: 'ყუთში იყო {a} {item}. კიდევ {b} დაამატეს. რამდენი {item}ა ახლა?',
    variables: {
      item: { kind: 'choice', values: THING_NAMES },
      a: { kind: 'int', min: 8, max: 15 },
      b: { kind: 'int', min: 2, max: 7 },
    },
    constraints: [{ note: 'the total stays inside twenty', test: (v: Vars) => Number(v.a) + Number(v.b) <= 20 }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    // The tempting wrong answer is taking away instead of adding.
    distractors: ({ vars, answer }) => nearMisses(Number(answer), [Number(vars.a) - Number(vars.b)]).map(String),
    explanation: ({ vars, answer }) => `„კიდევ ${vars.b} დაამატეს“ — შეკრება: ${vars.a} + ${vars.b} = ${answer}.`,
    visual: (v: Vars) =>
      `${draw(thingByName(String(v.item)).emoji, Number(v.a))}   (+${v.b})`,
  }),

  /** Level 2 — choose the operation and also solve it: taking away (Q10). */
  defineTemplate({
    ...at({ id: 'g1-u09-2-take-and-solve', subtopicId: 'romeli-moqmedeba', difficulty: 2 }),
    prompt: 'ბიბლიოთეკაში {a} {item} იყო. მოსწავლეებმა {b} წაიღეს. რამდენი დარჩა?',
    variables: {
      item: { kind: 'choice', values: ['წიგნი', 'რვეული', 'ჟურნალი'] },
      a: { kind: 'int', min: 10, max: 20 },
      b: { kind: 'int', min: 2, max: 8 },
    },
    constraints: [{ note: 'something is left behind', test: (v: Vars) => Number(v.a) - Number(v.b) > 0 }],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    // The tempting wrong answer is adding instead of taking away.
    distractors: ({ vars, answer }) => nearMisses(Number(answer), [Number(vars.a) + Number(vars.b)]).map(String),
    explanation: ({ vars, answer }) => `„${vars.b} წაიღეს“ — გამოკლება: ${vars.a} − ${vars.b} = ${answer}.`,
  }),

  /** Level 3 — which expression describes the situation? (Q11). */
  defineTemplate({
    ...at({ id: 'g1-u09-2-which-expression', subtopicId: 'romeli-moqmedeba', difficulty: 3 }),
    prompt:
      '{who} ჰქონდა {a} {item}, შემდეგ {b} მიიღო და {c} მეგობარს აჩუქა. რომელი გამოსახულება აღწერს სიტუაციას?',
    variables: {
      who: { kind: 'choice', values: WHOM },
      item: { kind: 'choice', values: THING_NAMES },
      a: { kind: 'int', min: 5, max: 12 },
      b: { kind: 'int', min: 2, max: 6 },
      c: { kind: 'int', min: 1, max: 5 },
    },
    constraints: [
      { note: 'the two amounts differ, so the three expressions are distinct', test: (v: Vars) => Number(v.b) !== Number(v.c) },
      { note: 'the result never goes negative', test: (v: Vars) => Number(v.a) + Number(v.b) - Number(v.c) >= 0 },
    ],
    answer: (v: Vars) => `${v.a} + ${v.b} − ${v.c}`,
    format: { kind: 'text' },
    optionCount: 3,
    // Both wrong options are genuine misreadings of the sentence: swapping
    // which amount was received and which was given away.
    distractors: ({ vars }) => [`${vars.a} − ${vars.b} + ${vars.c}`, `${vars.a} + ${vars.b} + ${vars.c}`],
    explanation: ({ vars, answer }) =>
      `მიიღო — შეკრება, აჩუქა — გამოკლება, ამიტომ სწორია ${answer} = ${Number(vars.a) + Number(vars.b) - Number(vars.c)}.`,
  }),

  /** Level 2 — cubes in a box: some taken out, then more put back (Q50, mixed review). */
  defineTemplate({
    ...at({ id: 'g1-u09-2-cubes', subtopicId: 'romeli-moqmedeba', difficulty: 2 }),
    prompt: 'ყუთში იყო {a} {item}. {b} აიღეს, შემდეგ კი {c} დაამატეს. რამდენი {item}ა ახლა ყუთში?',
    variables: {
      item: { kind: 'choice', values: ['კუბიკი', 'ვაშლი', 'ბურთი', 'ვარსკვლავი'] },
      a: { kind: 'int', min: 12, max: 18 },
      b: { kind: 'int', min: 3, max: 7 },
      c: { kind: 'int', min: 2, max: 5 },
    },
    constraints: [
      { note: 'something is left after the first step and the total stays inside twenty', test: (v: Vars) => Number(v.a) - Number(v.b) > 0 && Number(v.a) - Number(v.b) + Number(v.c) <= 20 },
      { note: 'the two amounts differ', test: (v: Vars) => Number(v.b) !== Number(v.c) },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) =>
      nearMisses(Number(answer), [
        Number(vars.a) + Number(vars.b) - Number(vars.c),
        Number(vars.a) - Number(vars.b) - Number(vars.c),
      ]),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} + ${vars.c} = ${answer}.`,
    visual: (v: Vars) => `${v.a} − ${v.b} + ${v.c} =`,
  }),

  /** Level 3 — the bus, solved from the expression the sentence describes (Q12). */
  defineTemplate({
    ...at({ id: 'g1-u09-2-bus', subtopicId: 'romeli-moqmedeba', difficulty: 3 }),
    prompt: 'ავტობუსში {a} მგზავრი იყო, {b} ჩავიდა და {c} ავიდა. რამდენი მგზავრია ახლა ავტობუსში?',
    variables: {
      a: { kind: 'int', min: 10, max: 18 },
      b: { kind: 'int', min: 2, max: 6 },
      c: { kind: 'int', min: 2, max: 6 },
    },
    constraints: [
      { note: 'the two amounts differ, so the sentence reads as three numbers', test: (v: Vars) => Number(v.b) !== Number(v.c) },
      { note: 'the bus is never empty and never overloaded', test: (v: Vars) => Number(v.a) - Number(v.b) > 0 && Number(v.a) - Number(v.b) + Number(v.c) <= 20 },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    // The two real mistakes: adding the ones who got off, and adding the ones
    // who got off while taking away the ones who got on.
    distractors: ({ vars, answer }) =>
      nearMisses(Number(answer), [
        Number(vars.a) + Number(vars.b) + Number(vars.c),
        Number(vars.a) - Number(vars.b) - Number(vars.c),
        Number(vars.a) + Number(vars.b) - Number(vars.c),
      ]),
    explanation: ({ vars }) =>
      `ჩავიდა — გამოკლება, ავიდა — შეკრება: ${vars.a} − ${vars.b} + ${vars.c} = ${Number(vars.a) - Number(vars.b) + Number(vars.c)}.`,
  }),
];

/* ================================================================== *\
 * U09.3 — შეკრება და გამოკლება 20-ის ფარგლებში
 * ================================================================== */

/**
 * Long calculations inside twenty, including the two-step ones.
 *
 * Nothing here is a story: the arithmetic is the subject. Two-step expressions
 * are evaluated left to right, which is how grade 1 writes them, and the order
 * matters — `19 − 5 + 3` is 17, not 11 — so the intermediate value is checked
 * for non-negativity and the explanation prints it.
 */
const u093: QuestionTemplate[] = [
  /** Level 1 — 6 + 7 crossing ten (Q13). */
  defineTemplate({
    ...at({ id: 'g1-u09-3-add-cross', subtopicId: '20-mde', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b} = __.',
    variables: {
      a: { kind: 'int', min: 5, max: 9 },
      b: { kind: 'int', min: 5, max: 9 },
    },
    constraints: [{ note: 'the sum crosses ten and stays inside twenty', test: (v: Vars) => Number(v.a) + Number(v.b) > 10 && Number(v.a) + Number(v.b) <= 20 }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer}: ${vars.a} + ${10 - (Number(vars.a) - 1) - 1} = 10, შემდეგ კიდევ ${Number(vars.b) - (10 - Number(vars.a))}.`,
  }),

  /** Level 1 — 15 − 8 crossing ten back (Q14). */
  defineTemplate({
    ...at({ id: 'g1-u09-3-sub-cross', subtopicId: '20-mde', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} − {b} = __.',
    variables: {
      a: { kind: 'int', min: 11, max: 19 },
      b: { kind: 'int', min: 4, max: 9 },
    },
    constraints: [{ note: 'the subtrahend is larger than the ones digit, so a ten is broken, and the result stays positive', test: (v: Vars) => Number(v.b) > Number(v.a) % 10 && Number(v.a) - Number(v.b) > 0 }],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${Number(vars.a) % 10} = ${Number(vars.a) - (Number(vars.a) % 10)}, შემდეგ − ${Number(vars.b) - (Number(vars.a) % 10)} = ${answer}.`,
  }),

  /** Level 2 — adding to a teen, staying inside twenty (Q15). */
  defineTemplate({
    ...at({ id: 'g1-u09-3-add-teen', subtopicId: '20-mde', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} + {b} = __.',
    variables: {
      a: { kind: 'int', min: 11, max: 16 },
      b: { kind: 'int', min: 2, max: 8 },
    },
    constraints: [{ note: 'the total stays inside twenty', test: (v: Vars) => Number(v.a) + Number(v.b) <= 20 }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) => nearMisses(Number(answer), [Number(vars.a) - Number(vars.b)]).map(String),
    explanation: ({ vars, answer }) => {
      // A teen is a ten and its ones, and because the total stays inside twenty
      // the ones and the addend still make at most ten: 14 + 5 → 10 + 4 + 5.
      const ones = Number(vars.a) % 10;
      return `${vars.a} = 10 + ${ones}, ამიტომ 10 + ${ones} + ${vars.b} = ${answer}.`;
    },
  }),

  /** Level 2 — a teen minus a teen, which cannot be counted back one by one (Q16). */
  defineTemplate({
    ...at({ id: 'g1-u09-3-sub-teen-pair', subtopicId: '20-mde', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} − {b} = __.',
    variables: {
      a: { kind: 'int', min: 13, max: 20 },
      b: { kind: 'int', min: 11, max: 15 },
    },
    constraints: [
      {
        note: 'the result is positive and small enough to reach by counting on',
        test: (v: Vars) => Number(v.a) - Number(v.b) > 0 && Number(v.a) - Number(v.b) <= 9,
      },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  /** Level 3 — 7 + 6 − 4, two steps (Q17). */
  defineTemplate({
    ...at({ id: 'g1-u09-3-add-then-sub', subtopicId: '20-mde', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} + {b} − {c} = __.',
    variables: {
      a: { kind: 'int', min: 4, max: 9 },
      b: { kind: 'int', min: 3, max: 8 },
      c: { kind: 'int', min: 2, max: 6 },
    },
    constraints: [
      { note: 'the sum stays inside twenty and the result does not go negative', test: (v: Vars) => Number(v.a) + Number(v.b) <= 20 && Number(v.a) + Number(v.b) - Number(v.c) >= 0 },
    ],
    answer: (v: Vars) => Number(v.a) + Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    // The classic mistake: subtracting first, then adding.
    distractors: ({ vars, answer }) => nearMisses(Number(answer), [Number(vars.a) + Number(vars.b) + Number(vars.c)]),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, შემდეგ − ${vars.c} = ${answer}.`,
  }),

  /** Level 3 — 19 − 5 + 3, subtracting then adding (Q18). */
  defineTemplate({
    ...at({ id: 'g1-u09-3-sub-then-add', subtopicId: '20-mde', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} − {b} + {c} = __.',
    variables: {
      a: { kind: 'int', min: 12, max: 20 },
      b: { kind: 'int', min: 3, max: 8 },
      c: { kind: 'int', min: 2, max: 7 },
    },
    constraints: [
      { note: 'the first step does not go negative and the result stays inside twenty', test: (v: Vars) => Number(v.a) - Number(v.b) >= 0 && Number(v.a) - Number(v.b) + Number(v.c) <= 20 },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    // The classic mistake: adding first, then subtracting.
    distractors: ({ vars, answer }) => nearMisses(Number(answer), [Number(vars.a) - Number(vars.b) - Number(vars.c)]),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}, შემდეგ + ${vars.c} = ${answer}.`,
  }),
];

/* ================================================================== *\
 * U09.4 — ორსაფეხურიანი ამოცანები სურათებით და სურათების გარეშე
 * ================================================================== */

/**
 * Two-step stories, with the expression printed beside the answer.
 *
 * Spec rule 4 is the reason each template carries a `visual`: the picture must
 * show the *same* expression the sentence describes, in the same order. Both
 * are built from the same three drawn numbers, so they cannot disagree.
 */
const u094: QuestionTemplate[] = [
  /** Level 1 — balls: 5 + 3 − 2, with a picture (Q19). */
  defineTemplate({
    ...at({ id: 'g1-u09-4-balls', subtopicId: 'ori-nabiji', difficulty: 1 }),
    prompt:
      '{who} ჰქონდა {a} {item}. მას კიდევ {b} აჩუქეს, შემდეგ კი {c} მეგობარს მისცა. რამდენი {item} დარჩა?',
    variables: {
      who: { kind: 'choice', values: WHOM },
      item: { kind: 'choice', values: THING_NAMES },
      a: { kind: 'int', min: 4, max: 9 },
      b: { kind: 'int', min: 2, max: 5 },
      c: { kind: 'int', min: 1, max: 4 },
    },
    constraints: [
      { note: 'the three amounts differ, so the sentence reads as three numbers', test: (v: Vars) => new Set([Number(v.a), Number(v.b), Number(v.c)]).size === 3 },
      { note: 'the result never goes negative and stays inside twenty', test: (v: Vars) => Number(v.a) + Number(v.b) <= 20 && Number(v.a) + Number(v.b) - Number(v.c) >= 0 },
    ],
    answer: (v: Vars) => Number(v.a) + Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) =>
      nearMisses(Number(answer), [
        Number(vars.a) - Number(vars.b) + Number(vars.c),
        Number(vars.a) + Number(vars.b) + Number(vars.c),
      ]),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} − ${vars.c} = ${answer}: ჯერ აჩუქეს (შეკრება), შემდეგ მისცა (გამოკლება).`,
    visual: (v: Vars) => {
      const emoji = thingByName(String(v.item)).emoji;
      return `${v.a} + ${v.b} − ${v.c} =\n${draw(emoji, Number(v.a))}  +${draw(emoji, Number(v.b))}`;
    },
  }),

  /** Level 1 — cakes: 10 − 4 + 2 (Q20). */
  defineTemplate({
    ...at({ id: 'g1-u09-4-cakes', subtopicId: 'ori-nabiji', difficulty: 1 }),
    prompt:
      'თეფშზე იყო {a} {item}. {b} შეჭამეს, შემდეგ კი კიდევ {c} დადეს. რამდენი {item}ა ახლა?',
    variables: {
      item: { kind: 'choice', values: ['ნამცხვარი', 'ვაშლი', 'მსხალი', 'კექსი'] },
      a: { kind: 'int', min: 8, max: 14 },
      b: { kind: 'int', min: 3, max: 6 },
      c: { kind: 'int', min: 2, max: 5 },
    },
    constraints: [
      { note: 'the first step leaves something behind', test: (v: Vars) => Number(v.a) - Number(v.b) > 0 },
      { note: 'the result stays inside twenty', test: (v: Vars) => Number(v.a) - Number(v.b) + Number(v.c) <= 20 },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) =>
      nearMisses(Number(answer), [
        Number(vars.a) + Number(vars.b) - Number(vars.c),
        Number(vars.a) - Number(vars.b) - Number(vars.c),
      ]),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} + ${vars.c} = ${answer}: ჯერ შეჭამეს (გამოკლება), შემდეგ დადეს (შეკრება).`,
    // The plate after the first step, plus what was put back: the two steps
    // drawn, not the equation printed a second time.
    visual: (v: Vars) => {
      const emoji = thingByName(String(v.item)).emoji;
      return `🍽️ ${draw(emoji, Number(v.a) - Number(v.b))}   (+${v.c})`;
    },
  }),

  /** Level 2 — apples: 12 + 5 − 3 (Q21). */
  defineTemplate({
    ...at({ id: 'g1-u09-4-basket', subtopicId: 'ori-nabiji', difficulty: 2 }),
    prompt: 'კალათაში იყო {a} {item}. {b} დაამატეს და შემდეგ {c} აიღეს. რამდენი {item}ა კალათაში?',
    variables: {
      item: { kind: 'choice', values: ['ვაშლი', 'მსხალი', 'ფორთოხალი', 'ბანანი'] },
      a: { kind: 'int', min: 10, max: 15 },
      b: { kind: 'int', min: 3, max: 6 },
      c: { kind: 'int', min: 2, max: 6 },
    },
    constraints: [
      { note: 'the result stays inside twenty and does not go negative', test: (v: Vars) => Number(v.a) + Number(v.b) <= 20 && Number(v.a) + Number(v.b) - Number(v.c) >= 0 },
      { note: 'the two amounts differ', test: (v: Vars) => Number(v.b) !== Number(v.c) },
    ],
    answer: (v: Vars) => Number(v.a) + Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) =>
      nearMisses(Number(answer), [
        Number(vars.a) - Number(vars.b) + Number(vars.c),
        Number(vars.a) + Number(vars.b) + Number(vars.c),
      ]),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} − ${vars.c} = ${answer}.`,
  }),

  /** Level 2 — stickers: 17 − 6 + 4 (Q22). */
  defineTemplate({
    ...at({ id: 'g1-u09-4-stickers', subtopicId: 'ori-nabiji', difficulty: 2 }),
    prompt:
      '{who} ჰქონდა {a} სტიკერი. მან {b} მეგობარს აჩუქა და შემდეგ კიდევ {c} მიიღო. რამდენი სტიკერი აქვს ახლა?',
    variables: {
      who: { kind: 'choice', values: WHOM },
      a: { kind: 'int', min: 12, max: 18 },
      b: { kind: 'int', min: 3, max: 7 },
      c: { kind: 'int', min: 2, max: 6 },
    },
    constraints: [
      { note: 'something is left after giving away, and the total stays inside twenty', test: (v: Vars) => Number(v.a) - Number(v.b) > 0 && Number(v.a) - Number(v.b) + Number(v.c) <= 20 },
      { note: 'the two amounts differ', test: (v: Vars) => Number(v.b) !== Number(v.c) },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) =>
      nearMisses(Number(answer), [
        Number(vars.a) + Number(vars.b) - Number(vars.c),
        Number(vars.a) - Number(vars.b) - Number(vars.c),
      ]),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  /** Level 1 — pencils: given some, then losing some, 7 + 4 − 3 (Q49, mixed review). */
  defineTemplate({
    ...at({ id: 'g1-u09-4-pencils', subtopicId: 'ori-nabiji', difficulty: 1 }),
    prompt: '{who} ჰქონდა {a} ფანქარი. მეგობარმა კიდევ {b} აჩუქა, შემდეგ კი {c} დაკარგა. რამდენი ფანქარი აქვს ახლა?',
    variables: {
      who: { kind: 'choice', values: WHOM },
      a: { kind: 'int', min: 6, max: 14 },
      b: { kind: 'int', min: 2, max: 6 },
      c: { kind: 'int', min: 2, max: 5 },
    },
    constraints: [
      { note: 'the running total stays inside twenty', test: (v: Vars) => Number(v.a) + Number(v.b) <= 20 },
      { note: 'something is left after the loss, so no step goes negative', test: (v: Vars) => Number(v.a) + Number(v.b) - Number(v.c) > 0 },
      { note: 'the two amounts differ, so the order in the story is unmistakable', test: (v: Vars) => Number(v.b) !== Number(v.c) },
    ],
    answer: (v: Vars) => Number(v.a) + Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    // The classic misreading chains the two operations in the wrong order.
    distractors: ({ vars, answer }) =>
      nearMisses(Number(answer), [Number(vars.a) - Number(vars.b) + Number(vars.c)]),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} − ${vars.c} = ${answer}.`,
  }),

  /** Level 3 — toys in a shop: 20 − 7 + 5 (Q23). */
  defineTemplate({
    ...at({ id: 'g1-u09-4-shop', subtopicId: 'ori-nabiji', difficulty: 3 }),
    prompt:
      'მაღაზიაში იყო {a} სათამაშო. დილით {b} გაიყიდა, შემდეგ კი მაღაზიამ {c} ახალი სათამაშო მიიღო. რამდენი სათამაშოა ახლა?',
    variables: {
      a: { kind: 'int', min: 15, max: 20 },
      b: { kind: 'int', min: 4, max: 8 },
      c: { kind: 'int', min: 3, max: 7 },
    },
    constraints: [
      { note: 'something is left after the morning and the total stays inside twenty', test: (v: Vars) => Number(v.a) - Number(v.b) > 0 && Number(v.a) - Number(v.b) + Number(v.c) <= 20 },
      { note: 'the two amounts differ', test: (v: Vars) => Number(v.b) !== Number(v.c) },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) =>
      nearMisses(Number(answer), [
        Number(vars.a) + Number(vars.b) - Number(vars.c),
        Number(vars.a) - Number(vars.b) - Number(vars.c),
      ]),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  /** Level 3 — books returned: 18 − 6 + 4 (Q24). */
  defineTemplate({
    ...at({ id: 'g1-u09-4-library', subtopicId: 'ori-nabiji', difficulty: 3 }),
    prompt:
      'ბიბლიოთეკაში იყო {a} წიგნი. მოსწავლეებმა {b} წაიღეს, შემდეგ კი {c} დააბრუნეს. რამდენი წიგნია ახლა ბიბლიოთეკაში?',
    variables: {
      a: { kind: 'int', min: 14, max: 20 },
      b: { kind: 'int', min: 4, max: 8 },
      c: { kind: 'int', min: 2, max: 6 },
    },
    constraints: [
      { note: 'something is left after the borrowing and the total stays inside twenty', test: (v: Vars) => Number(v.a) - Number(v.b) > 0 && Number(v.a) - Number(v.b) + Number(v.c) <= 20 },
      { note: 'the two amounts differ', test: (v: Vars) => Number(v.b) !== Number(v.c) },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) =>
      nearMisses(Number(answer), [
        Number(vars.a) + Number(vars.b) - Number(vars.c),
        Number(vars.a) - Number(vars.b) - Number(vars.c),
      ]),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} + ${vars.c} = ${answer}.`,
  }),
];

/* ================================================================== *\
 * U09.5 — ჭეშმარიტი ან მცდარი ტოლობები
 * ================================================================== */

/**
 * „Is this equality true?“, decided by arithmetic (spec rule 5).
 *
 * The claim is evaluated, never stored. The false claims are off by one or two
 * rather than by ten, so the two sides are close enough that the only way
 * through is to compute them — a claim that is obviously wrong teaches nothing.
 */
const trueOrFalse = (spec: {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
  a: { min: number; max: number };
  b: { min: number; max: number };
  /** The sign between the first two numbers. */
  op: '+' | '−';
  /** An optional third step, which makes the claim a two-step one. */
  then?: '+' | '−';
}): QuestionTemplate => {
  const steps = (v: Vars): number => {
    const first = spec.op === '+' ? Number(v.a) + Number(v.b) : Number(v.a) - Number(v.b);
    if (!spec.then) return first;
    return spec.then === '+' ? first + Number(v.n) : first - Number(v.n);
  };
  const printed = (v: Vars): string =>
    `${v.a} ${spec.op} ${v.b}${spec.then ? ` ${spec.then} ${v.n}` : ''}`;

  // The operators are baked into the sentence: a `choice` variable with a
  // single value is rejected by the registry, and rightly so — a one-option
  // choice is not a choice, it is text.
  const sentence = spec.then
    ? `სწორია თუ არა: {a} ${spec.op} {b} ${spec.then} {n} = {c}?`
    : `სწორია თუ არა: {a} ${spec.op} {b} = {c}?`;

  return defineTemplate({
    ...at({ id: spec.id, subtopicId: spec.subtopicId, difficulty: spec.difficulty }),
    prompt: sentence,
    variables: {
      a: { kind: 'int', min: spec.a.min, max: spec.a.max },
      b: { kind: 'int', min: spec.b.min, max: spec.b.max },
      ...(spec.then ? { n: { kind: 'int' as const, min: 2, max: 5 } } : {}),
      truth: { kind: 'choice', values: ['true', 'false'] },
      slip: { kind: 'choice', values: [1, 2] },
      dir: { kind: 'choice', values: [1, -1] },
      c: {
        kind: 'choice',
        values: (v: Vars) => {
          const value = steps(v);
          // A false claim misses by one or two. The miss is nudged until it is
          // both non-negative and actually different from the value, so a
          // tightened bound can never silently produce a true claim.
          let shift = Number(v.slip) * Number(v.dir);
          if (value + shift < 0) shift = Number(v.slip);
          if (value + shift === value) shift = 1;
          return [v.truth === 'true' ? value : value + shift];
        },
      },
    },
    constraints: [
      {
        note: 'every step stays non-negative and inside twenty',
        test: (v: Vars) => {
          const first = spec.op === '+' ? Number(v.a) + Number(v.b) : Number(v.a) - Number(v.b);
          const value = steps(v);
          return first >= 0 && value >= 0 && value <= 20 && Number(v.c) >= 0;
        },
      },
      {
        note: 'a claim marked false really is false',
        test: (v: Vars) => (v.truth === 'true' ? Number(v.c) === steps(v) : Number(v.c) !== steps(v)),
      },
    ],
    answer: (v: Vars) => (steps(v) === Number(v.c) ? 'ჭეშმარიტია' : 'მცდარია'),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => [answer === 'ჭეშმარიტია' ? 'მცდარია' : 'ჭეშმარიტია'],
    explanation: ({ vars }) => {
      const value = steps(vars);
      return `${printed(vars)} = ${value}, ამიტომ ტოლობა ${value === Number(vars.c) ? 'ჭეშმარიტია' : 'მცდარია'}.`;
    },
  });
};

const u095: QuestionTemplate[] = [
  /** Level 1 — a small addition (Q25: 4 + 3 = 7). */
  trueOrFalse({ id: 'g1-u09-5-true-small', subtopicId: 'martali-tolobebi', difficulty: 1, a: { min: 2, max: 9 }, b: { min: 1, max: 8 }, op: '+' }),

  /** Level 1 — a small subtraction (Q26: 9 − 2 = 8, missing by one). */
  trueOrFalse({ id: 'g1-u09-5-true-small-sub', subtopicId: 'martali-tolobebi', difficulty: 1, a: { min: 5, max: 12 }, b: { min: 1, max: 6 }, op: '−' }),

  /** Level 2 — adding past ten (Q27: 6 + 8 = 14). */
  trueOrFalse({ id: 'g1-u09-5-true-mid', subtopicId: 'martali-tolobebi', difficulty: 2, a: { min: 4, max: 9 }, b: { min: 5, max: 9 }, op: '+' }),

  /** Level 2 — subtracting from a teen (Q28: 17 − 6 = 10, missing by one). */
  trueOrFalse({ id: 'g1-u09-5-true-mid-sub', subtopicId: 'martali-tolobebi', difficulty: 2, a: { min: 13, max: 19 }, b: { min: 3, max: 8 }, op: '−' }),

  /** Level 3 — add, then subtract, before comparing (Q29: 8 + 7 − 4 = 11). */
  trueOrFalse({ id: 'g1-u09-5-true-add-step', subtopicId: 'martali-tolobebi', difficulty: 3, a: { min: 5, max: 9 }, b: { min: 4, max: 8 }, op: '+', then: '−' }),

  /** Level 3 — subtract, then add (Q30: 18 − 5 + 2 = 14, missing by one). */
  trueOrFalse({ id: 'g1-u09-5-true-sub-step', subtopicId: 'martali-tolobebi', difficulty: 3, a: { min: 13, max: 19 }, b: { min: 3, max: 8 }, op: '−', then: '+' }),
];

/* ================================================================== *\
 * U09.6 — შეკრებისა და გამოკლების ტერმინები
 * ================================================================== */

/**
 * Naming the parts of an expression.
 *
 * Two of the spec's questions ask for a **pair** of numbers — Q31 „which numbers
 * are the addends“ (4 and 5) and Q34 „name the minuend *and* the subtrahend“.
 * The engine grades one answer per question, so both are recast as one ordered
 * answer in the shape U07 already uses for „name all three terms“: the two
 * numbers, in the order the sentence names them. The reasoning is identical;
 * only the number of places to put it changes.
 */
const u096: QuestionTemplate[] = [
  /** Level 1 — the addends, named together (Q31). */
  defineTemplate({
    ...at({ id: 'g1-u09-6-addends', subtopicId: 'jami-sxvaoba', difficulty: 1 }),
    prompt: 'შეკრების გამოსახულებაში {a} + {b} = {sum} ჩაწერე შესაკრებები მძიმით, მათი რიგით.',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 2, max: 9 },
      sum: { kind: 'choice', values: (v: Vars) => [Number(v.a) + Number(v.b)] },
    },
    constraints: [
      { note: 'the addends differ, so the order is unambiguous', test: (v: Vars) => Number(v.a) !== Number(v.b) },
      { note: 'the sum stays inside twenty', test: (v: Vars) => Number(v.sum) <= 20 },
    ],
    answer: (v: Vars) => `${v.a}, ${v.b}`,
    format: { kind: 'text' },
    optionCount: 3,
    // Both wrong options are order errors, not number errors: the pair is
    // right and the reading of „their order“ is wrong.
    distractors: ({ vars }) => [`${vars.b}, ${vars.a}`, `${vars.a}, ${vars.sum}`],
    explanation: ({ vars }) => `შესაკრებებია ${vars.a} და ${vars.b}; ჯამია ${vars.sum}.`,
  }),

  /** Level 1 — the difference (Q32). */
  defineTemplate({
    ...at({ id: 'g1-u09-6-difference', subtopicId: 'jami-sxvaoba', difficulty: 1 }),
    prompt: 'გამოკლების გამოსახულებაში {a} − {b} = {diff} რომელი რიცხვია სხვაობა?',
    variables: {
      a: { kind: 'int', min: 8, max: 19 },
      b: { kind: 'int', min: 2, max: 7 },
      diff: { kind: 'choice', values: (v: Vars) => [Number(v.a) - Number(v.b)] },
    },
    constraints: [{ note: 'the difference is positive', test: (v: Vars) => Number(v.diff) > 0 }],
    answer: (v: Vars) => Number(v.diff),
    format: { kind: 'integer', min: 0 },
    optionCount: 3,
    distractors: ({ vars, answer }) => nearMisses(Number(answer), [Number(vars.a), Number(vars.b)]).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}, ამიტომ სხვაობა ${answer}-ია.`,
  }),

  /** Level 2 — the sum (Q33). */
  defineTemplate({
    ...at({ id: 'g1-u09-6-sum', subtopicId: 'jami-sxvaoba', difficulty: 2 }),
    prompt: 'გამოსახულებაში {a} + {b} = {sum} მიუთითე ჯამი.',
    variables: {
      a: { kind: 'int', min: 5, max: 12 },
      b: { kind: 'int', min: 3, max: 8 },
      sum: { kind: 'choice', values: (v: Vars) => [Number(v.a) + Number(v.b)] },
    },
    constraints: [{ note: 'the sum stays inside twenty', test: (v: Vars) => Number(v.sum) <= 20 }],
    answer: (v: Vars) => Number(v.sum),
    format: { kind: 'integer', min: 0 },
    optionCount: 3,
    distractors: ({ vars, answer }) => nearMisses(Number(answer), [Number(vars.a), Number(vars.b)]).map(String),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}, ამიტომ ჯამი ${answer}-ია.`,
  }),

  /** Level 2 — the minuend and the subtrahend together (Q34). */
  defineTemplate({
    ...at({ id: 'g1-u09-6-minuend-subtrahend', subtopicId: 'jami-sxvaoba', difficulty: 2 }),
    prompt: 'გამოსახულებაში {a} − {b} = {diff} ჩაწერე ჯერ საკლები, შემდეგ მაკლები, მძიმით.',
    variables: {
      a: { kind: 'int', min: 12, max: 20 },
      b: { kind: 'int', min: 3, max: 9 },
      diff: { kind: 'choice', values: (v: Vars) => [Number(v.a) - Number(v.b)] },
    },
    constraints: [{ note: 'the difference is positive', test: (v: Vars) => Number(v.diff) > 0 }],
    answer: (v: Vars) => `${v.a}, ${v.b}`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [`${vars.b}, ${vars.a}`, `${vars.a}, ${vars.diff}`],
    explanation: ({ vars }) => `საკლებია ${vars.a}, მაკლები — ${vars.b}, სხვაობა — ${vars.diff}.`,
  }),

  /** Level 3 — which expression has a sum of sixteen (Q35). */
  defineTemplate({
    ...at({ id: 'g1-u09-6-which-sum', subtopicId: 'jami-sxvaoba', difficulty: 3 }),
    prompt: 'აირჩიე გამოსახულება, რომელშიც ჯამი {target}-ის ტოლია.',
    variables: {
      target: { kind: 'int', min: 11, max: 19 },
      b: { kind: 'int', min: 2, max: 8 },
      // The correct expression is built to the target, so it is right by
      // construction rather than by luck of the draw.
      a: { kind: 'choice', values: (v: Vars) => [Number(v.target) - Number(v.b)] },
    },
    constraints: [{ note: 'the addend is positive', test: (v: Vars) => Number(v.a) > 0 }],
    answer: (v: Vars) => `${v.a} + ${v.b}`,
    format: { kind: 'text' },
    optionCount: 3,
    // Both wrong options are one number out: near misses, never another sum
    // that also equals the target.
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [`${a + 1} + ${b}`, `${a} + ${b + 1}`, `${a} + ${b - 1}`].filter((option) => {
        const [x, y] = option.split(' + ').map(Number);
        return y > 0 && x + y !== Number(vars.target);
      });
    },
    explanation: ({ vars, answer }) => `${answer} = ${vars.target}.`,
  }),

  /** Level 3 — minuend 18, difference 7, find the subtrahend (Q36). */
  defineTemplate({
    ...at({ id: 'g1-u09-6-missing-subtrahend', subtopicId: 'jami-sxvaoba', difficulty: 3 }),
    prompt: 'გამოკლების გამოსახულებაში საკლებია {a}, ხოლო სხვაობა — {diff}. იპოვე მაკლები.',
    variables: {
      a: { kind: 'int', min: 13, max: 20 },
      diff: { kind: 'int', min: 4, max: 9 },
      // The subtrahend is the difference between the two printed numbers, so it
      // is never negative.
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.a) - Number(v.diff)] },
    },
    constraints: [{ note: 'the subtrahend is positive', test: (v: Vars) => Number(v.answer) > 0 }],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) => nearMisses(Number(answer), [Number(vars.a), Number(vars.diff)]).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${answer} = ${vars.diff}, ამიტომ მაკლები ${answer}-ია.`,
  }),
];

/* ================================================================== *\
 * U09.7 — ჯამებისა და სხვაობების შედარება
 * ================================================================== */

/**
 * Compare two expressions, or an expression with a number.
 *
 * Spec rule 6: **evaluate both sides, then read the sign.** No template compares
 * the shape of two expressions. The sign is drawn first and the right-hand side
 * is then built to have that sign, because left to chance `=` all but never
 * occurs — the same defect U08.8 had, and the same fix.
 */
const u097: QuestionTemplate[] = [
  /** Level 1 — a sum against a number (Q37). */
  defineTemplate({
    ...at({ id: 'g1-u09-7-sum-to-number', subtopicId: 'Sedareba-jamebi', difficulty: 1 }),
    prompt: 'შეადარე: {a} + {b} __ {c}.',
    variables: {
      a: { kind: 'int', min: 2, max: 8 },
      b: { kind: 'int', min: 2, max: 8 },
      sign: { kind: 'choice', values: ['<', '=', '>'] },
      gap: { kind: 'int', min: 1, max: 4 },
      // The number on the right is the sum plus or minus the gap, so the drawn
      // sign is the true one by construction.
      c: {
        kind: 'choice',
        values: (v: Vars) => {
          const sum = Number(v.a) + Number(v.b);
          return [v.sign === '<' ? sum + Number(v.gap) : v.sign === '>' ? sum - Number(v.gap) : sum];
        },
      },
    },
    constraints: [
      { note: 'the right-hand number is a positive whole number', test: (v: Vars) => Number(v.c) > 0 },
    ],
    answer: (v: Vars) => String(v.sign),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => ['<', '>', '='],
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, ხოლო ${vars.c} — ამიტომ სწორი ნიშანია „${answer}“.`,
  }),

  /** Level 1 — a difference against a number (Q38). */
  defineTemplate({
    ...at({ id: 'g1-u09-7-difference-to-number', subtopicId: 'Sedareba-jamebi', difficulty: 1 }),
    prompt: 'შეადარე: {a} − {b} __ {c}.',
    variables: {
      a: { kind: 'int', min: 10, max: 19 },
      b: { kind: 'int', min: 2, max: 8 },
      sign: { kind: 'choice', values: ['<', '=', '>'] },
      gap: { kind: 'int', min: 1, max: 3 },
      c: {
        kind: 'choice',
        values: (v: Vars) => {
          const value = Number(v.a) - Number(v.b);
          const right = v.sign === '<' ? value + Number(v.gap) : v.sign === '>' ? value - Number(v.gap) : value;
          return [right];
        },
      },
    },
    constraints: [
      { note: 'the difference and the right-hand number are both positive', test: (v: Vars) => Number(v.a) - Number(v.b) > 0 && Number(v.c) >= 0 },
    ],
    answer: (v: Vars) => String(v.sign),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => ['<', '>', '='],
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}, ხოლო ${vars.c} — ამიტომ „${answer}“.`,
  }),

  /** Level 2 — two sums compared (Q39). */
  defineTemplate({
    ...at({ id: 'g1-u09-7-two-sums', subtopicId: 'Sedareba-jamebi', difficulty: 2 }),
    prompt: 'შეადარე: {a} + {b} __ {c} + {d}.',
    variables: {
      a: { kind: 'int', min: 4, max: 10 },
      b: { kind: 'int', min: 2, max: 8 },
      sign: { kind: 'choice', values: ['<', '=', '>'] },
      gap: { kind: 'int', min: 1, max: 4 },
      d: { kind: 'int', min: 2, max: 7 },
      // The right-hand sum is derived from the left one and the drawn sign.
      c: {
        kind: 'choice',
        values: (v: Vars) => {
          const left = Number(v.a) + Number(v.b);
          const rightSum = v.sign === '<' ? left + Number(v.gap) : v.sign === '>' ? left - Number(v.gap) : left;
          return [rightSum - Number(v.d)];
        },
      },
    },
    constraints: [
      { note: 'both sides are non-negative and inside twenty', test: (v: Vars) => Number(v.c) > 0 && Number(v.a) + Number(v.b) <= 20 && Number(v.c) + Number(v.d) <= 20 },
    ],
    answer: (v: Vars) => String(v.sign),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => ['<', '>', '='],
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, ხოლო ${vars.c} + ${vars.d} = ${Number(vars.c) + Number(vars.d)}, ამიტომ „${answer}“.`,
  }),

  /** Level 2 — a difference against a sum (Q40). */
  defineTemplate({
    ...at({ id: 'g1-u09-7-difference-vs-sum', subtopicId: 'Sedareba-jamebi', difficulty: 2 }),
    prompt: 'შეადარე: {a} − {b} __ {c} + {d}.',
    variables: {
      a: { kind: 'int', min: 12, max: 19 },
      b: { kind: 'int', min: 2, max: 8 },
      sign: { kind: 'choice', values: ['<', '=', '>'] },
      gap: { kind: 'int', min: 1, max: 3 },
      c: { kind: 'int', min: 3, max: 9 },
      // The right-hand addend is derived so the sum has the drawn relation to
      // the left-hand difference.
      d: {
        kind: 'choice',
        values: (v: Vars) => {
          const left = Number(v.a) - Number(v.b);
          const rightSum = v.sign === '<' ? left + Number(v.gap) : v.sign === '>' ? left - Number(v.gap) : left;
          return [rightSum - Number(v.c)];
        },
      },
    },
    constraints: [
      { note: 'both sides are non-negative and inside twenty', test: (v: Vars) => Number(v.a) - Number(v.b) >= 0 && Number(v.d) > 0 && Number(v.c) + Number(v.d) <= 20 },
    ],
    answer: (v: Vars) => String(v.sign),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => ['<', '>', '='],
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}, ხოლო ${vars.c} + ${vars.d} = ${Number(vars.c) + Number(vars.d)}, ამიტომ „${answer}“.`,
  }),

  /** Level 3 — two-step against a difference (Q41). */
  defineTemplate({
    ...at({ id: 'g1-u09-7-two-step-vs-difference', subtopicId: 'Sedareba-jamebi', difficulty: 3 }),
    prompt: 'შეადარე: {a} + {b} − {n} __ {c} − {d}.',
    variables: {
      a: { kind: 'int', min: 5, max: 12 },
      b: { kind: 'int', min: 3, max: 8 },
      n: { kind: 'int', min: 2, max: 5 },
      sign: { kind: 'choice', values: ['<', '=', '>'] },
      gap: { kind: 'int', min: 1, max: 3 },
      d: { kind: 'int', min: 2, max: 6 },
      // The right-hand minuend is derived from the left value and the sign.
      c: {
        kind: 'choice',
        values: (v: Vars) => {
          const left = Number(v.a) + Number(v.b) - Number(v.n);
          const right = v.sign === '<' ? left + Number(v.gap) : v.sign === '>' ? left - Number(v.gap) : left;
          return [right + Number(v.d)];
        },
      },
    },
    constraints: [
      { note: 'the left side is non-negative and every printed number is positive', test: (v: Vars) => Number(v.a) + Number(v.b) - Number(v.n) >= 0 && Number(v.c) - Number(v.d) >= 0 },
    ],
    answer: (v: Vars) => String(v.sign),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => ['<', '>', '='],
    explanation: ({ vars, answer }) => {
      const left = Number(vars.a) + Number(vars.b) - Number(vars.n);
      const right = Number(vars.c) - Number(vars.d);
      return `${vars.a} + ${vars.b} − ${vars.n} = ${left}, ხოლო ${vars.c} − ${vars.d} = ${right}, ამიტომ „${answer}“.`;
    },
  }),

  /** Level 3 — subtracting then adding, against a sum (Q42). */
  defineTemplate({
    ...at({ id: 'g1-u09-7-sub-then-add', subtopicId: 'Sedareba-jamebi', difficulty: 3 }),
    prompt: 'შეადარე: {a} − {b} + {n} __ {c} + {d}.',
    variables: {
      a: { kind: 'int', min: 12, max: 19 },
      b: { kind: 'int', min: 2, max: 7 },
      n: { kind: 'int', min: 2, max: 5 },
      sign: { kind: 'choice', values: ['<', '=', '>'] },
      gap: { kind: 'int', min: 1, max: 3 },
      d: { kind: 'int', min: 2, max: 6 },
      c: {
        kind: 'choice',
        values: (v: Vars) => {
          const left = Number(v.a) - Number(v.b) + Number(v.n);
          const rightSum = v.sign === '<' ? left + Number(v.gap) : v.sign === '>' ? left - Number(v.gap) : left;
          return [rightSum - Number(v.d)];
        },
      },
    },
    constraints: [
      { note: 'both sides are non-negative', test: (v: Vars) => Number(v.a) - Number(v.b) >= 0 && Number(v.c) > 0 && Number(v.c) + Number(v.d) <= 20 },
    ],
    answer: (v: Vars) => String(v.sign),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => ['<', '>', '='],
    explanation: ({ vars, answer }) => {
      const left = Number(vars.a) - Number(vars.b) + Number(vars.n);
      const right = Number(vars.c) + Number(vars.d);
      return `${vars.a} − ${vars.b} + ${vars.n} = ${left}, ხოლო ${vars.c} + ${vars.d} = ${right}, ამიტომ „${answer}“.`;
    },
  }),
];

/* ================================================================== *\
 * U09.8 — შეკრებისა და გამოკლების თავსატეხები
 * ================================================================== */

/**
 * Number puzzles with exactly one answer (spec rule 8).
 *
 * The blank's value is drawn first and the sentence is built around it, so no
 * second number closes it. The options are that answer plus the mistakes that
 * belong to the shape: the other printed number, and one off either way.
 *
 * Q48 asks for **two** blanks — `__ + 4 = 15 − __` — which cannot be graded as
 * one answer, because the two values are not equal to each other and the engine
 * has one answer per question. It is recast to one blank with the other side
 * printed, which is the same reasoning (make the two sides meet) with one place
 * to put the result. Recorded in U09-MAPPING.md.
 */
const u098: QuestionTemplate[] = [
  /** Level 1 — 5 + __ = 9, four numbers offered (Q43). */
  defineTemplate({
    ...at({ id: 'g1-u09-8-drag-add', subtopicId: 'Sekreba-gamokleba-Tavsatexi', difficulty: 1 }),
    prompt: 'გადაიტანე სწორი რიცხვი გამოტოვებულ ადგილზე: {a} + __ = {total}.',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      answer: { kind: 'int', min: 2, max: 8 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.a) + Number(v.answer)] },
    },
    constraints: [
      { note: 'the two addends differ, so the answer is not printed in the sentence', test: (v: Vars) => Number(v.a) !== Number(v.answer) },
      { note: 'the total stays inside twenty', test: (v: Vars) => Number(v.total) <= 20 },
    ],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 0 },
    optionCount: 4,
    // Four options, and every wrong one is a plausible miscount: one off, the
    // printed number, and one more.
    distractors: ({ vars, answer }) => {
      const value = Number(answer);
      return [value + 1, value - 1, Number(vars.a), value + 2]
        .filter((candidate) => candidate !== value && candidate >= 0 && candidate <= 20)
        .map(String);
    },
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.a} = ${answer}.`,
  }),

  /** Level 1 — 8 − __ = 3 (Q44). */
  defineTemplate({
    ...at({ id: 'g1-u09-8-drag-sub', subtopicId: 'Sekreba-gamokleba-Tavsatexi', difficulty: 1 }),
    prompt: 'გადაიტანე სწორი რიცხვი გამოტოვებულ ადგილზე: {a} − __ = {diff}.',
    variables: {
      a: { kind: 'int', min: 6, max: 14 },
      answer: { kind: 'int', min: 2, max: 8 },
      diff: { kind: 'choice', values: (v: Vars) => [Number(v.a) - Number(v.answer)] },
    },
    constraints: [
      { note: 'the difference is positive and differs from the subtrahend', test: (v: Vars) => Number(v.diff) > 0 && Number(v.diff) !== Number(v.answer) },
    ],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) => nearMisses(Number(answer), [Number(vars.a), Number(vars.diff)]).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${answer} = ${vars.diff}.`,
  }),

  /** Level 2 — __ + 7 = 15 (Q45). */
  defineTemplate({
    ...at({ id: 'g1-u09-8-missing-addend', subtopicId: 'Sekreba-gamokleba-Tavsatexi', difficulty: 2 }),
    prompt: 'შეავსე: __ + {b} = {total}.',
    variables: {
      b: { kind: 'int', min: 3, max: 9 },
      total: { kind: 'int', min: 10, max: 20 },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.total) - Number(v.b)] },
    },
    constraints: [{ note: 'the missing addend is positive', test: (v: Vars) => Number(v.answer) > 0 }],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) => nearMisses(Number(answer), [Number(vars.b), Number(vars.total)]).map(String),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.b} = ${answer}.`,
  }),

  /** Level 2 — 19 − __ = 12 (Q46). */
  defineTemplate({
    ...at({ id: 'g1-u09-8-missing-subtrahend', subtopicId: 'Sekreba-gamokleba-Tavsatexi', difficulty: 2 }),
    prompt: 'შეავსე: {a} − __ = {diff}.',
    variables: {
      a: { kind: 'int', min: 13, max: 20 },
      diff: { kind: 'int', min: 3, max: 11 },
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.a) - Number(v.diff)] },
    },
    constraints: [{ note: 'the subtrahend is positive', test: (v: Vars) => Number(v.answer) > 0 }],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) => nearMisses(Number(answer), [Number(vars.a), Number(vars.diff)]).map(String),
    explanation: ({ vars, answer }) => `${vars.a} − ${answer} = ${vars.diff}.`,
  }),

  /** Level 3 — 8 + __ − 5 = 10 (Q47). */
  defineTemplate({
    ...at({ id: 'g1-u09-8-two-step-puzzle', subtopicId: 'Sekreba-gamokleba-Tavsatexi', difficulty: 3 }),
    prompt: 'გადაიტანე სწორი რიცხვი, რათა ტოლობა სწორი გახდეს: {a} + __ − {n} = {total}.',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      n: { kind: 'int', min: 2, max: 6 },
      total: { kind: 'int', min: 8, max: 16 },
      // The blank is whatever makes the sentence true — computed, not drawn.
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.total) + Number(v.n) - Number(v.a)] },
    },
    constraints: [
      { note: 'the missing number is positive and inside twenty', test: (v: Vars) => Number(v.answer) > 0 && Number(v.answer) <= 20 },
      { note: 'the intermediate value stays inside twenty', test: (v: Vars) => Number(v.a) + Number(v.answer) <= 20 },
    ],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) => nearMisses(Number(answer), [Number(vars.a), Number(vars.n)]).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${answer} = ${Number(vars.a) + Number(answer)}, შემდეგ − ${vars.n} = ${vars.total}.`,
  }),

  /** Level 3 — __ + 4 = 15 − 6, both sides made to meet (Q48, recast). */
  defineTemplate({
    ...at({ id: 'g1-u09-8-both-sides', subtopicId: 'Sekreba-gamokleba-Tavsatexi', difficulty: 3 }),
    prompt: 'შეავსე გამოტოვებული ადგილი ისე, რომ ორივე მხარე ტოლი იყოს: __ + {b} = {c} − {d}.',
    variables: {
      b: { kind: 'int', min: 2, max: 6 },
      c: { kind: 'int', min: 12, max: 19 },
      d: { kind: 'int', min: 3, max: 8 },
      // The blank is the right-hand value less b, so the two sides meet exactly.
      answer: { kind: 'choice', values: (v: Vars) => [Number(v.c) - Number(v.d) - Number(v.b)] },
    },
    constraints: [
      { note: 'the blank is non-negative and differs from every printed number', test: (v: Vars) =>
          Number(v.answer) >= 0 && Number(v.answer) !== Number(v.b) && Number(v.answer) !== Number(v.c) && Number(v.answer) !== Number(v.d) },
      { note: 'the right-hand side is positive', test: (v: Vars) => Number(v.c) - Number(v.d) > 0 },
    ],
    answer: (v: Vars) => Number(v.answer),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ vars, answer }) => nearMisses(Number(answer), [Number(vars.c) - Number(vars.d), Number(vars.b)]).map(String),
    explanation: ({ vars, answer }) =>
      `${vars.c} − ${vars.d} = ${Number(vars.c) - Number(vars.d)}, ამიტომ ${answer} + ${vars.b} = ${Number(vars.c) - Number(vars.d)}.`,
  }),

];

/* ================================================================== *\
 * Export
 * ================================================================== */

export const U09_TEMPLATES: QuestionTemplate[] = [
  ...u091,
  ...u092,
  ...u093,
  ...u094,
  ...u095,
  ...u096,
  ...u097,
  ...u098,
];

/** Subtopic ids this library is responsible for. */
export const U09_SUBTOPICS = [
  'Tvisebebi',
  'romeli-moqmedeba',
  '20-mde',
  'ori-nabiji',
  'martali-tolobebi',
  'jami-sxvaoba',
  'Sedareba-jamebi',
  'Sekreba-gamokleba-Tavsatexi',
];
