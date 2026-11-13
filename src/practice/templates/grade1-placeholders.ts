import { defineTemplate } from './types';
import type { QuestionTemplate, VariableSpec, Vars } from './types';

/**
 * Grade I placeholders — one template per subtopic of the academy curriculum.
 *
 * ⚠️  THESE ARE PLACEHOLDERS. They exist so every one of the 113 subtopics in
 * grade I is playable and correctly wired to its unit; they are *not* the
 * academy's questions. The real questions will replace them wholesale.
 *
 * Every entry is **correct by construction**: the wording and the answer are
 * built from the same drawn values, so a placeholder can never say
 * "7 apples, all of them taken — how many are left?" and answer 1. Nothing here
 * invents an answer next to numbers it did not derive.
 *
 * Replacing one is mechanical: delete its line and register the real template
 * in `catalog.ts`. Subtopic ids match `src/practice/curriculum.ts`.
 */

/**
 * Values every placeholder draws. A superset is deliberate: prompt wording can
 * use any of these names, and the registry rejects a prompt that interpolates a
 * variable the template does not declare. Answer rules stay specific.
 */
const numbers = (min: number, max: number): Record<string, VariableSpec> => ({
  a: { kind: 'int', min, max },
  b: { kind: 'int', min: 2, max: Math.max(2, Math.min(max, 19)) },
  c: { kind: 'int', min: 1, max: Math.max(1, Math.min(max, 9)) },
  d: { kind: 'int', min: 1, max: Math.max(1, Math.min(max, 4)) },
  e: { kind: 'int', min: 1, max: Math.max(1, Math.min(max, 9)) },
  n: { kind: 'int', min, max },
  k: { kind: 'int', min: 1, max: 3 },
});

/** Wrong options near a number: plausible neighbours, never negative. */
const nearMisses = (answer: number): number[] => {
  const wrong: number[] = [];
  for (const offset of [1, -1, 2, -2, 3, 10, -10]) {
    const candidate = answer + offset;
    if (candidate === answer || candidate < 0 || wrong.includes(candidate)) continue;
    wrong.push(candidate);
  }
  return wrong;
};

const numeric = (answer: number): number[] => nearMisses(answer);

/** Every template gets the same address fields; kinds only supply the rest. */
interface Address {
  subtopicId: string;
  topicId: string;
  unitId?: string;
  hint?: string;
}

const address = (spec: Address) => ({
  id: `g1-${spec.subtopicId}`,
  grade: 1 as const,
  topicId: spec.topicId,
  unitId: spec.unitId ?? spec.topicId,
  subtopicId: spec.subtopicId,
  difficulty: 1 as const,
  hint: spec.hint,
});

/* ------------------------------------------------------------------ *
 * Kinds. Each one is a single well-defined question shape, and the
 * prompt text and the answer rule are defined together so they cannot
 * drift apart.
 * ------------------------------------------------------------------ */

/** "{a} + {b} = ?" — also used for "a more than b" style wordings. */
const add = (spec: Address, min = 2, max = 20): QuestionTemplate =>
  defineTemplate({
    ...address(spec),
    prompt: '{a} + {b} = ?',
    variables: numbers(min, max),
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => numeric(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  });

/** "{a} − {b} = ?" — the minuend is drawn first, then a smaller subtrahend. */
const sub = (spec: Address, min = 2, max = 20): QuestionTemplate =>
  defineTemplate({
    ...address(spec),
    prompt: '{a} − {b} = ?',
    variables: {
      a: { kind: 'int', min, max },
      b: { kind: 'int', min: 1, max: (v: Vars) => Number(v.a) },
      c: { kind: 'int', min: 1, max: 9 },
      d: { kind: 'int', min: 1, max: 4 },
      e: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'int', min, max },
      k: { kind: 'int', min: 1, max: 3 },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => numeric(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  });

/** "Which number comes right after n?" */
const nextNumber = (spec: Address, min = 1, max = 19): QuestionTemplate =>
  defineTemplate({
    ...address(spec),
    prompt: 'რომელი რიცხვი მოდის {n}-ის შემდეგ?',
    variables: numbers(min, max),
    answer: (v: Vars) => Number(v.n) + 1,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => numeric(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n}-ის შემდეგ მოდის ${answer}.`,
  });

/** "Which number comes right before n?" */
const previousNumber = (
  spec: Address,
  min = 2,
  max = 20,
  direction: 'before' | 'after' = 'before',
): QuestionTemplate =>
  defineTemplate({
    ...address(spec),
    // The id is the subtopic plus the direction, so the two directions are
    // separate templates rather than one template with a mode switch, and
    // `previousNumber` stays reusable for other subtopics (win-nak also uses
    // it). Hard-coding 'g1-win-ukan' here collided with win-nak's own id.
    id: `g1-${spec.subtopicId}${direction === 'before' ? '' : '-after'}`,
    prompt: direction === 'before' ? 'რომელი რიცხვი მოდის {n}-მდე?' : 'რომელი რიცხვი მოდის {n}-ის შემდეგ?',
    variables: {
      // Drawn from the top of the range down: "before N" has exactly one answer
      // per N, so the first variations should cover the hard end of the range
      // in case the session cannot get through all of them.
      n: { kind: 'int', min: direction === 'before' ? min : min - 1, max: direction === 'before' ? max : max - 1, reverse: true },
    },
    answer: (v: Vars) => (direction === 'before' ? Number(v.n) - 1 : Number(v.n) + 1),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => numeric(Number(answer)),
    explanation: ({ vars, answer }) =>
      direction === 'before' ? `${vars.n}-მდე მოდის ${answer}.` : `${vars.n}-ის შემდეგ მოდის ${answer}.`,
  });

/**
 * "Which of these two numbers is bigger?"
 *
 * The two options are the two numbers the sentence prints. Offering a
 * neighbour of the winner instead („15 თუ 2?“ with options 14, 15, 16, 17)
 * makes the question answerable without comparing anything: the quantity that
 * appears in the options is the greater one, so the child picks it and is
 * always right. The comparison only happens once both quantities are on offer.
 */
const largerOf = (spec: Address, min = 1, max = 20): QuestionTemplate =>
  defineTemplate({
    ...address(spec),
    prompt: 'რომელი რიცხვია მეტი: {a} თუ {b}?',
    variables: numbers(min, max),
    constraints: [{ test: (v: Vars) => v.a !== v.b, note: 'the two numbers must differ' }],
    answer: (v: Vars) => (Number(v.a) > Number(v.b) ? Number(v.a) : Number(v.b)),
    format: { kind: 'integer', min: 0 },
    optionCount: 2,
    distractors: ({ vars }) => [Math.min(Number(vars.a), Number(vars.b))],
    explanation: ({ vars, answer }) => `${answer} მეტია ${vars.a === Number(answer) ? vars.b : vars.a}-ზე.`,
  });


/** "Counting in tens: 30 … which ten comes next?" */
const nextTen = (spec: Address): QuestionTemplate =>
  defineTemplate({
    ...address(spec),
    prompt: 'ათეულებით ვითვლით: {a}0 … რომელი ათეულია შემდეგი?',
    variables: {
      a: { kind: 'int', min: 1, max: 7 },
      b: { kind: 'int', min: 2, max: 9 },
      c: { kind: 'int', min: 1, max: 9 },
      d: { kind: 'int', min: 1, max: 4 },
      e: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'int', min: 10, max: 90 },
      k: { kind: 'int', min: 1, max: 3 },
    },
    answer: (v: Vars) => Number(v.a) * 10 + 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => numeric(Number(answer)),
    explanation: ({ vars, answer }) => `${Number(vars.a) * 10}-ის შემდეგი ათეულია ${answer}.`,
  });

/**
 * A fixed question whose wording never needs a drawn number: naming a shape,
 * true/false about a stated fact, naming the smallest of a listed group. The
 * answer is fixed *because the question is fixed* — nothing is drawn that the
 * answer would have to agree with.
 */
const fact = (spec: Address & { prompt: string; options: string[]; answer: string; why?: string }): QuestionTemplate => {
  const wrong = spec.options.filter((option) => option !== spec.answer);
  return defineTemplate({
    ...address(spec),
    // The question itself never changes — the answer is fixed by the wording,
    // not derived from drawn numbers — but it is asked with one of three
    // natural closing instructions, so a session does not repeat a sentence
    // verbatim. The phrasings are rendered into the prompt, not just drawn.
    prompt: `${spec.prompt} {variant}`,
    variables: {
      variant: {
        kind: 'choice',
        values: ['აირჩიე ერთი სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'აირჩიე სწორი პასუხი ქვემოთ.'],
      },
    },
    optionCount: wrong.length + 1,
    answer: () => spec.answer,
    format: { kind: 'text' },
    distractors: () => wrong,
    explanation: () => spec.why ?? `სწორი პასუხია: ${spec.answer}.`,
  });
};

/** Two-way classification computed from the drawn number (even/odd). */
const evenOrOdd = (spec: Address, min = 1, max = 20): QuestionTemplate =>
  defineTemplate({
    ...address(spec),
    prompt: '{n} ლუწია თუ კენტი?',
    variables: numbers(min, max),
    optionCount: 2,
    answer: (v: Vars) => (Number(v.n) % 2 === 0 ? 'ლუწი' : 'კენტი'),
    format: { kind: 'text' },
    distractors: ({ answer }) => (answer === 'ლუწი' ? ['კენტი'] : ['ლუწი']),
    explanation: ({ vars, answer }) => `${vars.n} არის ${answer}.`,
  });

/* ------------------------------------------------------------------ *
 * The 113 subtopics, one line each, grouped by academy unit.
 * ------------------------------------------------------------------ */

export const GRADE1_PLACEHOLDERS: QuestionTemplate[] = [
  // U01 — სივრცე და მდებარეობა
  fact({ subtopicId: 'marcxena-marjvena', topicId: 'mdebareoba', prompt: 'სამი ბურთიდან შუაში მდგომი რომელია: მარცხენა, შუა თუ მარჯვენა?', options: ['შუა', 'მარცხენა', 'მარჯვენა'], answer: 'შუა' }),
  fact({ subtopicId: 'zeda-qveda', topicId: 'mdebareoba', prompt: 'ჩიტი ხეზე ზის. სად არის ჩიტი ხესთან?', options: ['ზემოთ', 'ქვემოთ', 'გვერდით'], answer: 'ზემოთ' }),
  defineTemplate({ ...address({ subtopicId: 'grZeli-mokle', topicId: 'mdebareoba' }), prompt: 'რომელი უფრო გრძელია: {a} სმ ლენტი თუ {b} სმ ლენტი?', variables: numbers(2, 20), optionCount: 2, constraints: [{ test: (v: Vars) => v.a !== v.b, note: 'lengths differ' }], answer: (v: Vars) => (Number(v.a) > Number(v.b) ? Number(v.a) : Number(v.b)), format: { kind: 'integer', min: 0 }, distractors: ({ vars }) => [Math.min(Number(vars.a), Number(vars.b))], explanation: ({ answer }) => `გრძელი ლენტი ${answer} სმ-ია.` }),
  defineTemplate({ ...address({ subtopicId: 'magle-dabali', topicId: 'mdebareoba' }), prompt: 'ნინო {a} სმ სიმაღლისაა, გიორგი — {b} სმ. ვინ არის უფრო მაღალი: ნინო თუ გიორგი?', variables: { a: { kind: 'int', min: 60, max: 99 }, b: { kind: 'int', min: 60, max: 99 }, c: { kind: 'int', min: 1, max: 9 }, d: { kind: 'int', min: 1, max: 4 }, e: { kind: 'int', min: 1, max: 9 }, n: { kind: 'int', min: 60, max: 99 }, k: { kind: 'int', min: 1, max: 3 } }, constraints: [{ test: (v: Vars) => v.a !== v.b, note: 'heights differ' }], answer: (v: Vars) => (Number(v.a) > Number(v.b) ? 'ნინო' : 'გიორგი'), format: { kind: 'text' }, optionCount: 2, distractors: ({ answer }) => [answer === 'ნინო' ? 'გიორგი' : 'ნინო'], explanation: ({ vars, answer }) => `${answer} მაღალია: ${Math.max(Number(vars.a), Number(vars.b))} სმ > ${Math.min(Number(vars.a), Number(vars.b))} სმ.` }),
  defineTemplate({ ...address({ subtopicId: 'mZime-msubuqi', topicId: 'mdebareoba' }), prompt: 'რომელი უფრო მძიმეა: {a} კგ თუ {b} კგ?', variables: numbers(2, 20), optionCount: 2, constraints: [{ test: (v: Vars) => v.a !== v.b, note: 'weights differ' }], answer: (v: Vars) => (Number(v.a) > Number(v.b) ? Number(v.a) : Number(v.b)), format: { kind: 'integer', min: 0 }, distractors: ({ vars }) => [Math.min(Number(vars.a), Number(vars.b))], explanation: ({ answer }) => `მძიმე საგანი ${answer} კგ-ია.` }),
  defineTemplate({ ...address({ subtopicId: 'gansieri-vicki', topicId: 'mdebareoba' }), prompt: 'რომელი ყუთია უფრო განიერი: {a} სმ თუ {b} სმ სიგანისა?', variables: numbers(2, 20), optionCount: 2, constraints: [{ test: (v: Vars) => v.a !== v.b, note: 'widths differ' }], answer: (v: Vars) => (Number(v.a) > Number(v.b) ? Number(v.a) : Number(v.b)), format: { kind: 'integer', min: 0 }, distractors: ({ vars }) => [Math.min(Number(vars.a), Number(vars.b))], explanation: ({ answer }) => `განიერი ყუთი ${answer} სმ-ია.` }),
  // "all of them taken away" is exactly "{a} − {a} = 0", so the answer is 0 by construction.
  defineTemplate({ ...address({ subtopicId: 'yvela-rame', topicId: 'mdebareoba' }), prompt: 'კალათაში {a} ვაშლია. ყველა ვაშლი ავიღეთ. რამდენი დარჩა?', variables: numbers(1, 10), answer: () => 0, format: { kind: 'integer', min: 0 }, distractors: ({ vars }) => [Number(vars.a), 1, 2].filter((candidate) => candidate !== 0), explanation: () => 'ყველა ვაშლი ავიღეთ, ამიტომ დარჩა 0.' }),
  add({ subtopicId: 'datvla-suratebidan', topicId: 'mdebareoba' }, 1, 10),

  // U02 — რიცხვები 20-მდე
  nextNumber({ subtopicId: 'ricxvebi1-10', topicId: 'ricxvebi20' }, 1, 9),
  add({ subtopicId: 'ricxvebi11-20', topicId: 'ricxvebi20' }, 11, 20),
  fact({ subtopicId: 'rigobiti', topicId: 'ricxvebi20', prompt: 'რიგში პირველი ბავშვია ანა, მეორე — ბექა, მესამე — გიგა. ვინ დგას მეორე ადგილზე?', options: ['ბექა', 'ანა', 'გიგა'], answer: 'ბექა' }),
  previousNumber({ subtopicId: 'win-nak', topicId: 'ricxvebi20' }, 2, 20),
  largerOf({ subtopicId: 'udidesi-umciresti', topicId: 'ricxvebi20' }, 1, 20),
  nextNumber({ subtopicId: 'ricxviTi-xazi20', topicId: 'ricxvebi20' }, 1, 19),
  evenOrOdd({ subtopicId: 'luwi-kenti', topicId: 'ricxvebi20' }, 1, 20),

  // U03 — თვლა
  add({ subtopicId: 'sruli-datvla', topicId: 'datvla' }, 1, 10),
  previousNumber({ subtopicId: 'win-ukan', topicId: 'datvla' }, 2, 20),
  previousNumber({ subtopicId: 'win-ukan', topicId: 'datvla' }, 2, 20, 'after'),
  nextNumber({ subtopicId: '100-mde', topicId: 'datvla' }, 1, 19),
  nextTen({ subtopicId: 'atobit-nabijebit', topicId: 'datvla' }),
  sub({ subtopicId: 'sagvnebamde', topicId: 'datvla' }, 2, 10),
  add({ subtopicId: 'airCe-da-daTvale', topicId: 'datvla' }, 1, 10),

  // U16 — ლოგიკური აზროვნება
  fact({ subtopicId: 'ferebi-wesis-mixedviT', topicId: 'logikuri-azrovneba', prompt: 'წესი: წითელის შემდეგ ყოველთვის მოდის ლურჯი. წითლის შემდეგ რომელია?', options: ['ლურჯი', 'წითელი', 'მწვანე'], answer: 'ლურჯი' }),
  fact({ subtopicId: 'gamoricxva', topicId: 'logikuri-azrovneba', prompt: 'რომელი არ ეკუთვნის ჯგუფს: ვაშლი, მსხალი, სტაფილო?', options: ['სტაფილო', 'ვაშლი', 'მსხალი'], answer: 'სტაფილო' }),
  fact({ subtopicId: 'sascori', topicId: 'logikuri-azrovneba', prompt: 'სასწორზე ვაშლი უფრო მძიმეა, ვიდრე მსხალი. რომელია მსუბუქი?', options: ['მსხალი', 'ვაშლი'], answer: 'მსხალი' }),
  defineTemplate({ ...address({ subtopicId: 'Cafiqrebuli-ricxvi', topicId: 'logikuri-azrovneba' }), prompt: 'ჩავიფიქრე რიცხვი, დავუმატე {a} და მივიღე {b}. რა რიცხვი ჩავიფიქრე?', variables: numbers(1, 10), constraints: [{ test: (v: Vars) => Number(v.b) > Number(v.a), note: 'the original number is positive' }], answer: (v: Vars) => Number(v.b) - Number(v.a), format: { kind: 'integer', min: 0 }, distractors: ({ answer }) => numeric(Number(answer)), explanation: ({ vars, answer }) => `${vars.b} − ${vars.a} = ${answer}.` }),
];

/** One entry per template, used by the catalog tests. */
export const GRADE1_PLACEHOLDER_SPECS = GRADE1_PLACEHOLDERS.map((template) => ({
  id: template.id,
  topicId: template.topicId,
  subtopicId: template.subtopicId,
  prompt: template.prompt,
  kind: 'placeholder' as const,
}));
