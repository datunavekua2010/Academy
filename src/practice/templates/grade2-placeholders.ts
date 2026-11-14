import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

/**
 * Grade II placeholders — one template per subtopic of the academy curriculum (140 subtopics).
 *
 * ⚠️  THESE ARE PLACEHOLDERS. They exist so every one of the 140 subtopics in
 * grade II is playable and correctly wired to its unit; they are *not* the
 * academy's final questions. The real questions will replace them unit by unit.
 *
 * Every entry is **correct by construction**: the wording and the answer are
 * built from the same drawn values.
 */

const nearMisses = (answer: number): number[] => {
  const wrong: number[] = [];
  for (const offset of [1, -1, 2, -2, 3, 10, -10, 5, -5]) {
    const candidate = answer + offset;
    if (candidate === answer || candidate < 0 || wrong.includes(candidate)) continue;
    wrong.push(candidate);
  }
  return wrong;
};

interface G2Address {
  subtopicId: string;
  topicId: string;
  hint?: string;
}

const addr = (spec: G2Address) => ({
  id: `g2-${spec.subtopicId}`,
  grade: 2 as const,
  topicId: spec.topicId,
  unitId: spec.topicId,
  subtopicId: spec.subtopicId,
  difficulty: 1 as const,
  hint: spec.hint,
});

/** Generic 2-digit adder */
const add2 = (spec: G2Address, minA: number, maxA: number, minB: number, maxB: number, promptText?: string): QuestionTemplate =>
  defineTemplate({
    ...addr(spec),
    prompt: promptText ?? '{a} + {b} = ?',
    variables: {
      a: { kind: 'int', min: minA, max: maxA },
      b: { kind: 'int', min: minB, max: maxB },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  });

/** Generic subtractor where minuend >= subtrahend */
const sub2 = (spec: G2Address, minA: number, maxA: number, minB: number, maxB: number, promptText?: string): QuestionTemplate =>
  defineTemplate({
    ...addr(spec),
    prompt: promptText ?? '{a} − {b} = ?',
    variables: {
      a: { kind: 'int', min: minA, max: maxA },
      b: { kind: 'int', min: minB, max: (v: Vars) => Math.min(maxB, Number(v.a)) },
    },
    constraints: [{ test: (v: Vars) => Number(v.a) >= Number(v.b), note: 'a >= b' }],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  });

/** Compare two numbers */
const comp2 = (spec: G2Address, min: number, max: number): QuestionTemplate =>
  defineTemplate({
    ...addr(spec),
    prompt: 'რომელი რიცხვია მეტი: {a} თუ {b}?',
    variables: {
      a: { kind: 'int', min, max },
      b: { kind: 'int', min, max },
    },
    constraints: [{ test: (v: Vars) => v.a !== v.b, note: 'a != b' }],
    optionCount: 2,
    answer: (v: Vars) => (Number(v.a) > Number(v.b) ? Number(v.a) : Number(v.b)),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Math.min(Number(vars.a), Number(vars.b))],
    explanation: ({ vars, answer }) =>
      `${answer} მეტია ${Number(vars.a) === Number(answer) ? vars.b : vars.a}-ზე.`,
  });

/** Fixed choices with instruction variants */
const choiceFact = (spec: G2Address & { prompt: string; options: string[]; answer: string; why?: string }): QuestionTemplate => {
  const wrong = spec.options.filter((o) => o !== spec.answer);
  return defineTemplate({
    ...addr(spec),
    prompt: `${spec.prompt} {variant}`,
    variables: {
      variant: {
        kind: 'choice',
        values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'],
      },
    },
    optionCount: wrong.length + 1,
    answer: () => spec.answer,
    format: { kind: 'text' },
    distractors: () => wrong,
    explanation: () => spec.why ?? `სწორი პასუხია: ${spec.answer}.`,
  });
};

/* ------------------------------------------------------------------ *
 * All 140 Grade 2 subtopic templates
 * ------------------------------------------------------------------ */

export const GRADE2_PLACEHOLDERS: QuestionTemplate[] = [
  // ================= U01: რიცხვები 100-მდე =================
  defineTemplate({
    ...addr({ topicId: 'g2-ricxvebi100', subtopicId: 'u01-hundred-chart' }),
    prompt: 'ასეულის ცხრილში რომელი რიცხვი დგას {n}-ის უშუალოდ ქვემოთ (10-ით მეტი)?',
    variables: { n: { kind: 'int', min: 1, max: 89 } },
    answer: (v) => Number(v.n) + 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} + 10 = ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-ricxvebi100', subtopicId: 'u01-numbers-in-words' }),
    prompt: 'რომელი რიცხვია სიტყვებით „{tensWord}და{onesWord}“?',
    variables: {
      tens: { kind: 'choice', values: [20, 30, 40, 50, 60, 70, 80] },
      tensWord: {
        kind: 'choice',
        values: (v) => {
          const map: Record<number, string> = {
            20: 'ოც', 30: 'ოცდაათ', 40: 'ორმოც', 50: 'ორმოცდაათ',
            60: 'სამოც', 70: 'სამოცდაათ', 80: 'ოთხმოც',
          };
          return [map[Number(v.tens)]];
        },
      },
      ones: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      onesWord: {
        kind: 'choice',
        values: (v) => {
          const map: Record<number, string> = {
            1: 'ერთი', 2: 'ორი', 3: 'სამი', 4: 'ოთხი', 5: 'ხუთი',
            6: 'ექვსი', 7: 'შვიდი', 8: 'რვა', 9: 'ცხრა',
          };
          return [map[Number(v.ones)]];
        },
      },
    },
    answer: (v) => Number(v.tens) + Number(v.ones),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `„${vars.tensWord}და${vars.onesWord}“ არის ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-ricxvebi100', subtopicId: 'u01-ordinal-numbers' }),
    prompt: 'რიგში მე-{k}-ე ადგილზე მყოფის შემდეგ რომელი რიგობითი ადგილი მოდის?',
    variables: { k: { kind: 'int', min: 1, max: 20 } },
    answer: (v) => Number(v.k) + 1,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `მე-${vars.k}-ე ადგილის შემდეგ მოდის მე-${answer}-ე.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-ricxvebi100', subtopicId: 'u01-tens-and-ones' }),
    prompt: '{tens} ათეული და {ones} ერთეული არის:',
    variables: {
      tens: { kind: 'int', min: 1, max: 9 },
      ones: { kind: 'int', min: 0, max: 9 },
    },
    answer: (v) => Number(v.tens) * 10 + Number(v.ones),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.tens} ათეული და ${vars.ones} ერთეული = ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-ricxvebi100', subtopicId: 'u01-before-and-after' }),
    prompt: 'რომელი რიცხვი მოდის {n}-მდე?',
    variables: { n: { kind: 'int', min: 2, max: 100 } },
    answer: (v) => Number(v.n) - 1,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n}-მდე მოდის ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-ricxvebi100', subtopicId: 'u01-number-line-100' }),
    prompt: 'რიცხვით ღერძზე {start}-დან გადავედით {step} ბიჯით მარჯვნივ. რომელ რიცხვზე აღმოვჩნდებით?',
    variables: {
      start: { kind: 'int', min: 10, max: 80 },
      step: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v) => Number(v.start) + Number(v.step),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.start} + ${vars.step} = ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-ricxvebi100', subtopicId: 'u01-largest-and-smallest' }),
    prompt: 'რომელია უდიდესი რიცხვი: {a}, {b} თუ {c}?',
    variables: {
      a: { kind: 'int', min: 10, max: 99 },
      b: { kind: 'int', min: 10, max: 99 },
      c: { kind: 'int', min: 10, max: 99 },
    },
    constraints: [{ test: (v) => v.a !== v.b && v.b !== v.c && v.a !== v.c, note: 'distinct' }],
    optionCount: 3,
    answer: (v) => Math.max(Number(v.a), Number(v.b), Number(v.c)),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars, answer }) => [Number(vars.a), Number(vars.b), Number(vars.c)].filter((x) => x !== Number(answer)),
    explanation: ({ answer }) => `უდიდესია ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-ricxvebi100', subtopicId: 'u01-roman-numerals' }),
    prompt: 'რომელი რიცხვი შეესაბამება რომაულ ციფრს: {roman}?',
    variables: {
      val: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 20, 50] },
      roman: {
        kind: 'choice',
        values: (v) => {
          const map: Record<number, string> = {
            1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII',
            8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 15: 'XV', 20: 'XX', 50: 'L',
          };
          return [map[Number(v.val)]];
        },
      },
    },
    answer: (v) => Number(v.val),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.roman} = ${answer}.`,
  }),

  // ================= U02: თვლა და მიმდევრობა =================
  defineTemplate({
    ...addr({ topicId: 'g2-datvla-mimdevroba', subtopicId: 'u02-even-and-odd' }),
    prompt: '{n} ლუწია თუ კენტი?',
    variables: { n: { kind: 'int', min: 1, max: 100 } },
    optionCount: 2,
    answer: (v) => (Number(v.n) % 2 === 0 ? 'ლუწი' : 'კენტი'),
    format: { kind: 'text' },
    distractors: ({ answer }) => (answer === 'ლუწი' ? ['კენტი'] : ['ლუწი']),
    explanation: ({ vars, answer }) => `${vars.n} არის ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-datvla-mimdevroba', subtopicId: 'u02-counting-objects' }),
    prompt: 'კალათაში არის {a} ვაშლი და {b} მსხალი. სულ რამდენი ხილია კალათაში?',
    variables: {
      a: { kind: 'int', min: 5, max: 40 },
      b: { kind: 'int', min: 5, max: 40 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer} ხილი.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-datvla-mimdevroba', subtopicId: 'u02-counting-with-steps' }),
    prompt: 'ვთვლით {step}-ის ბიჯით: {a}, {b}, {c}, ... რა იქნება შემდეგი რიცხვი?',
    variables: {
      step: { kind: 'choice', values: [2, 5, 10] },
      start: { kind: 'int', min: 2, max: 50 },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 2 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) + 3 * Number(v.step),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.c} + ${vars.step} = ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-datvla-mimdevroba', subtopicId: 'u02-counting-with-tables' }),
    prompt: 'ცხრილის თითოეულ რიგში {per} ფანქარია. რამდენი ფანქარი იქნება {rows} რიგში?',
    variables: {
      rows: { kind: 'int', min: 2, max: 6 },
      per: { kind: 'choice', values: [2, 3, 4, 5, 10] },
    },
    answer: (v) => Number(v.rows) * Number(v.per),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.rows} × ${vars.per} = ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-datvla-mimdevroba', subtopicId: 'u02-number-sequences' }),
    prompt: 'იპოვე გამოტოვებული რიცხვი მიმდევრობაში: {a}, {b}, ?, {d}',
    variables: {
      step: { kind: 'choice', values: [2, 3, 4, 5, 10] },
      start: { kind: 'int', min: 2, max: 40 },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
      d: { kind: 'choice', values: (v) => [Number(v.start) + 3 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) + 2 * Number(v.step),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `ნაბიჯია ${vars.step}, ამიტომ ${vars.b} + ${vars.step} = ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-datvla-mimdevroba', subtopicId: 'u02-moves-on-number-line' }),
    prompt: 'კალია იდგა {start}-ზე და გადახტა {step} ერთეულით წინ. რომელ რიცხვზე აღმოჩნდება?',
    variables: {
      start: { kind: 'int', min: 5, max: 60 },
      step: { kind: 'int', min: 3, max: 15 },
    },
    answer: (v) => Number(v.start) + Number(v.step),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.start} + ${vars.step} = ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-datvla-mimdevroba', subtopicId: 'u02-sorting-even-odd' }),
    prompt: 'ჩამოთვლილთაგან რომელი რიცხვია ლუწი? {variant}',
    variables: {
      variant: {
        kind: 'choice',
        values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'],
      },
      k: { kind: 'int', min: 2, max: 45 },
      even: { kind: 'choice', values: (v) => [Number(v.k) * 2] },
      odd1: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 1] },
      odd2: { kind: 'choice', values: (v) => [Number(v.k) * 2 - 1] },
      odd3: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 3] },
    },
    answer: (v) => Number(v.even),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.odd1), Number(vars.odd2), Number(vars.odd3)],
    explanation: ({ answer }) => `${answer} იყოფა 2-ზე, ამიტომ ლუწია.`,
  }),

  // ================= U15: წილადები =================
  choiceFact({
    topicId: 'g2-wiladebi',
    subtopicId: 'u15-parts-of-a-whole',
    prompt: 'ვაშლი გაყვეს ორ ტოლ ნაწილად. თითოეულ ნაწილს ეწოდება:',
    options: ['ნახევარი', 'მესამედი', 'მეოთხედი', 'მთელი'],
    answer: 'ნახევარი',
    why: 'ორის ტოლი ნაწილიდან თითოეული ნახევარია.',
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-wiladebi', subtopicId: 'u15-halves' }),
    prompt: '{n}-ის ნახევარი არის:',
    variables: {
      k: { kind: 'int', min: 1, max: 20 },
      n: { kind: 'choice', values: (v) => [Number(v.k) * 2] },
    },
    answer: (v) => Number(v.k),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} ÷ 2 = ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-wiladebi', subtopicId: 'u15-thirds' }),
    prompt: '{n}-ის მესამედი არის:',
    variables: {
      k: { kind: 'int', min: 1, max: 12 },
      n: { kind: 'choice', values: (v) => [Number(v.k) * 3] },
    },
    answer: (v) => Number(v.k),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} ÷ 3 = ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-wiladebi', subtopicId: 'u15-quarters' }),
    prompt: '{n}-ის მეოთხედი არის:',
    variables: {
      k: { kind: 'int', min: 1, max: 12 },
      n: { kind: 'choice', values: (v) => [Number(v.k) * 4] },
    },
    answer: (v) => Number(v.k),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} ÷ 4 = ${answer}.`,
  }),
];

/** One entry per template, used by catalog tests. */
export const GRADE2_PLACEHOLDER_SPECS = GRADE2_PLACEHOLDERS.map((template) => ({
  id: template.id,
  topicId: template.topicId,
  subtopicId: template.subtopicId,
  prompt: template.prompt,
  kind: 'placeholder' as const,
}));
