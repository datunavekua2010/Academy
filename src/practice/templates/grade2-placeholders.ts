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

  // ================= U09: დამრგვალება =================
  defineTemplate({
    ...addr({ topicId: 'g2-damrgvaleba', subtopicId: 'u09-nearest-5' }),
    prompt: 'დაამრგვალე {n} უახლოეს 5-მდე:',
    variables: { n: { kind: 'int', min: 1, max: 99 } },
    answer: (v) => Math.round(Number(v.n) / 5) * 5,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n}-ის უახლოესი 5-ის ჯერადია ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-damrgvaleba', subtopicId: 'u09-nearest-10' }),
    prompt: 'დაამრგვალე {n} უახლოეს ათეულამდე (10-მდე):',
    variables: { n: { kind: 'int', min: 11, max: 99 } },
    answer: (v) => Math.round(Number(v.n) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} უახლოეს ათეულამდე არის ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-damrgvaleba', subtopicId: 'u09-nearest-20' }),
    prompt: 'დაამრგვალე {n} უახლოეს 20-მდე:',
    variables: { n: { kind: 'int', min: 10, max: 90 } },
    answer: (v) => Math.round(Number(v.n) / 20) * 20,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} უახლოეს 20-მდე არის ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-damrgvaleba', subtopicId: 'u09-rounding-sums' }),
    prompt: 'დაამრგვალე შესაკრებები ათეულამდე და შეაფასე ჯამი: {a} + {b} ≈ ?',
    variables: {
      a: { kind: 'int', min: 11, max: 49 },
      b: { kind: 'int', min: 11, max: 49 },
    },
    answer: (v) => Math.round(Number(v.a) / 10) * 10 + Math.round(Number(v.b) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.a} ≈ ${Math.round(Number(vars.a) / 10) * 10}, ${vars.b} ≈ ${Math.round(Number(vars.b) / 10) * 10}, ჯამი ≈ ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-damrgvaleba', subtopicId: 'u09-rounding-differences' }),
    prompt: 'დაამრგვალე რიცხვები ათეულამდე და შეაფასე სხვაობა: {a} − {b} ≈ ?',
    variables: {
      a: { kind: 'int', min: 51, max: 99 },
      b: { kind: 'int', min: 11, max: 49 },
    },
    answer: (v) => Math.round(Number(v.a) / 10) * 10 - Math.round(Number(v.b) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.a} ≈ ${Math.round(Number(vars.a) / 10) * 10}, ${vars.b} ≈ ${Math.round(Number(vars.b) / 10) * 10}, სხვაობა ≈ ${answer}.`,
  }),

  // ================= U10: მონაცემები და ალბათობა =================
  choiceFact({
    topicId: 'g2-monacemebi-albatoba',
    subtopicId: 'u10-choosing-tables-charts',
    prompt: 'მონაცემების თვალსაჩინოდ წარმოსადგენად რომელია უკეთესი: ცხრილი/დიაგრამა თუ ჩვეულებრივი ტექსტი?',
    options: ['ცხრილი ან დიაგრამა', 'გრძელი ტექსტი'],
    answer: 'ცხრილი ან დიაგრამა',
    why: 'ცხრილი და დიაგრამა მონაცემებს თვალსაჩინოს ხდის.',
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-monacemebi-albatoba', subtopicId: 'u10-tally-marks' }),
    prompt: 'ჭდეების ერთი შეკვრა (||||/) აღნიშნავს 5-ს. რამდენს აღნიშნავს {bundles} შეკვრა და {singles} ხაზი?',
    variables: {
      bundles: { kind: 'int', min: 1, max: 6 },
      singles: { kind: 'int', min: 1, max: 4 },
    },
    answer: (v) => Number(v.bundles) * 5 + Number(v.singles),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.bundles} × 5 + ${vars.singles} = ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-monacemebi-albatoba', subtopicId: 'u10-collecting-data' }),
    prompt: 'გამოკითხეს {total} ბავშვი. მათგან {a}-მ აირჩია ფეხბურთი, დანარჩენმა — კალათბურთი. რამდენმა აირჩია კალათბურთი?',
    variables: {
      total: { kind: 'int', min: 20, max: 50 },
      a: { kind: 'int', min: 5, max: 18 },
    },
    answer: (v) => Number(v.total) - Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.a} = ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-monacemebi-albatoba', subtopicId: 'u10-pictograms' }),
    prompt: 'პიქტოგრამაზე ერთი ვარსკვლავი აღნიშნავს {val} ქულას. რამდენ ქულას აღნიშნავს {count} ვარსკვლავი?',
    variables: {
      val: { kind: 'choice', values: [2, 3, 5, 10] },
      count: { kind: 'int', min: 2, max: 8 },
    },
    answer: (v) => Number(v.val) * Number(v.count),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.count} × ${vars.val} = ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-monacemebi-albatoba', subtopicId: 'u10-bar-charts' }),
    prompt: 'დიაგრამაზე ლურჯი სვეტის სიმაღლეა {a}, წითლის — {b}. რამდენით მაღალია ლურჯი სვეტი წითელზე?',
    variables: {
      b: { kind: 'int', min: 5, max: 20 },
      diff: { kind: 'int', min: 2, max: 15 },
      a: { kind: 'choice', values: (v) => [Number(v.b) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-monacemebi-albatoba', subtopicId: 'u10-dot-plots' }),
    prompt: 'წერტილოვან დიაგრამაზე რიცხვ 4-ის ზემოთ დასმულია {k} წერტილი. რამდენჯერ შეგვხვდა რიცხვი 4?',
    variables: { k: { kind: 'int', min: 2, max: 12 } },
    answer: (v) => Number(v.k),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ answer }) => `წერტილების რაოდენობაა ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-monacemebi-albatoba', subtopicId: 'u10-more-less-equally-likely' }),
    prompt: 'ტომარაში არის {a} წითელი და {b} ლურჯი ბურთი ({a} > {b}). რომელი ფერის ამოღებაა უფრო მოსალოდნელი?',
    variables: {
      b: { kind: 'int', min: 2, max: 8 },
      diff: { kind: 'int', min: 2, max: 10 },
      a: { kind: 'choice', values: (v) => [Number(v.b) + Number(v.diff)] },
    },
    optionCount: 2,
    answer: () => 'წითელი',
    format: { kind: 'text' },
    distractors: () => ['ლურჯი'],
    explanation: ({ vars }) => `წითელი ბურთი მეტია (${vars.a} > ${vars.b}), ამიტომ მისი ამოღება უფრო მოსალოდნელია.`,
  }),
  choiceFact({
    topicId: 'g2-monacemebi-albatoba',
    subtopicId: 'u10-possible-impossible',
    prompt: 'ტომარაში მხოლოდ მწვანე ბურთებია. ყვითელი ბურთის ამოღება:',
    options: ['შეუძლებელია', 'შესაძლებელია'],
    answer: 'შეუძლებელია',
    why: 'რადგან ყვითელი ბურთი ტომარაში საერთოდ არ არის.',
  }),
  choiceFact({
    topicId: 'g2-monacemebi-albatoba',
    subtopicId: 'u10-changing-chances',
    prompt: 'ტომარაში თეთრი ბურთები იყო. დავამატეთ ბევრი შავი ბურთი. შავი ბურთის ამოღების შანსი:',
    options: ['გაიზარდა', 'შემცირდა', 'არ შეცვლილა'],
    answer: 'გაიზარდა',
    why: 'შავი ბურთების დამატებით მათი ამოღების შანსი იზრდება.',
  }),

  // ================= U11: გაზომვა და გეომეტრია =================
  defineTemplate({
    ...addr({ topicId: 'g2-gazomva-geometria', subtopicId: 'u11-meters-and-centimeters' }),
    prompt: '{m} მ და {cm} სმ სულ რამდენი სანტიმეტრია?',
    variables: {
      m: { kind: 'int', min: 1, max: 9 },
      cm: { kind: 'choice', values: [0, 10, 20, 30, 40, 50, 60, 75] },
    },
    answer: (v) => Number(v.m) * 100 + Number(v.cm),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `1 მ = 100 სმ; ${vars.m} × 100 + ${vars.cm} = ${answer} სმ.`,
  }),
  choiceFact({
    topicId: 'g2-gazomva-geometria',
    subtopicId: 'u11-units-of-length',
    prompt: 'რვეულის სიგრძის გასაზომად რომელი ერთეულია მოსახერხებელი?',
    options: ['სანტიმეტრი', 'მეტრი', 'კილომეტრი'],
    answer: 'სანტიმეტრი',
    why: 'მცირე ზომის საგნები სანტიმეტრებით იზომება.',
  }),
  choiceFact({
    topicId: 'g2-gazomva-geometria',
    subtopicId: 'u11-units-of-weight',
    prompt: 'საზამთროს მასა იზომება:',
    options: ['კილოგრამებში', 'სანტიმეტრებში', 'ლიტრებში', 'საათებში'],
    answer: 'კილოგრამებში',
    why: 'მასის ერთეულია კილოგრამი.',
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-gazomva-geometria', subtopicId: 'u11-thermometer' }),
    prompt: 'თერმომეტრი აჩვენებდა {t}°C-ს. ტემპერატურა გაიზარდა {dt}°C-ით. რას აჩვენებს თერმომეტრი ახლა?',
    variables: {
      t: { kind: 'int', min: 10, max: 25 },
      dt: { kind: 'int', min: 2, max: 10 },
    },
    answer: (v) => Number(v.t) + Number(v.dt),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.t} + ${vars.dt} = ${answer}°C.`,
  }),
  choiceFact({
    topicId: 'g2-gazomva-geometria',
    subtopicId: 'u11-flat-and-solid-shapes',
    prompt: 'ჩამოთვლილთაგან რომელია სივრცითი (მოცულობითი) ფიგურა?',
    options: ['კუბი', 'კვადრატი', 'წრე', 'სამკუთხედი'],
    answer: 'კუბი',
    why: 'კუბი სივრცითი ფიგურაა, დანარჩენები — ბრტყელი.',
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-gazomva-geometria', subtopicId: 'u11-perimeter' }),
    prompt: 'მართკუთხედის გვერდებია {a} სმ და {b} სმ. რისი ტოლია მისი პერიმეტრი?',
    variables: {
      a: { kind: 'int', min: 2, max: 10 },
      b: { kind: 'int', min: 2, max: 10 },
    },
    answer: (v) => 2 * (Number(v.a) + Number(v.b)),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `პერიმეტრია 2 × (${vars.a} + ${vars.b}) = ${answer} სმ.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-gazomva-geometria', subtopicId: 'u11-counting-sides' }),
    prompt: 'რამდენი გვერდი აქვს {shapeName}-ს?',
    variables: {
      sides: { kind: 'choice', values: [3, 4, 5, 6] },
      shapeName: {
        kind: 'choice',
        values: (v) => {
          const map: Record<number, string> = { 3: 'სამკუთხედ', 4: 'ოთხკუთხედ', 5: 'ხუთკუთხედ', 6: 'ექვსკუთხედ' };
          return [map[Number(v.sides)]];
        },
      },
    },
    answer: (v) => Number(v.sides),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.shapeName}-ს აქვს ${answer} გვერდი.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-gazomva-geometria', subtopicId: 'u11-counting-angles' }),
    prompt: 'რამდენი კუთხე აქვს {shapeName}-ს?',
    variables: {
      angles: { kind: 'choice', values: [3, 4, 5, 6] },
      shapeName: {
        kind: 'choice',
        values: (v) => {
          const map: Record<number, string> = { 3: 'სამკუთხედ', 4: 'ოთხკუთხედ', 5: 'ხუთკუთხედ', 6: 'ექვსკუთხედ' };
          return [map[Number(v.angles)]];
        },
      },
    },
    answer: (v) => Number(v.angles),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.shapeName}-ს აქვს ${answer} კუთხე.`,
  }),
  choiceFact({
    topicId: 'g2-gazomva-geometria',
    subtopicId: 'u11-grouping-by-sides',
    prompt: 'რომელ ფიგურას აქვს ზუსტად 3 გვერდი?',
    options: ['სამკუთხედს', 'კვადრატს', 'ხუთკუთხედს', 'წრეს'],
    answer: 'სამკუთხედს',
    why: 'სამკუთხედს აქვს 3 გვერდი.',
  }),
  choiceFact({
    topicId: 'g2-gazomva-geometria',
    subtopicId: 'u11-grouping-by-angles',
    prompt: 'რომელ ფიგურას არ აქვს არცერთი კუთხე?',
    options: ['წრეს', 'სამკუთხედს', 'კვადრატს', 'რომბს'],
    answer: 'წრეს',
    why: 'წრეს არ გააჩნია კუთხეები.',
  }),
  choiceFact({
    topicId: 'g2-gazomva-geometria',
    subtopicId: 'u11-inside-and-outside',
    prompt: 'წერტილი მოთავსებულია წრის საზღვრის შიგნით. სად მდებარეობს ის?',
    options: ['შიგნით', 'გარეთ'],
    answer: 'შიგნით',
    why: 'წერტილი წრის შიგნითაა.',
  }),
  choiceFact({
    topicId: 'g2-gazomva-geometria',
    subtopicId: 'u11-equal-shapes',
    prompt: 'ორ ფიგურას აქვს ზუსტად ერთნაირი ფორმა და ზომა. როგორია ეს ფიგურები?',
    options: ['ტოლი', 'განსხვავებული'],
    answer: 'ტოლი',
    why: 'ერთნაირი ფორმისა და ზომის ფიგურები ტოლია.',
  }),
  choiceFact({
    topicId: 'g2-gazomva-geometria',
    subtopicId: 'u11-symmetry',
    prompt: 'ფიგურა ღერძზე გადაკეცვისას ზუსტად დაემთხვა თავის მეორე ნახევარს. როგორია ეს ფიგურა?',
    options: ['სიმეტრიული', 'არასიმეტრიული'],
    answer: 'სიმეტრიული',
    why: 'ნახევრების ზუსტი დამთხვევა სიმეტრიულობას ნიშნავს.',
  }),

  // ================= U12: ფული =================
  defineTemplate({
    ...addr({ topicId: 'g2-fuli', subtopicId: 'u12-counting-tetri' }),
    prompt: 'გვაქვს {a} ცალი 10-თეთრიანი და {b} ცალი 5-თეთრიანი. სულ რამდენი თეთრია?',
    variables: {
      a: { kind: 'int', min: 1, max: 8 },
      b: { kind: 'int', min: 1, max: 6 },
    },
    answer: (v) => Number(v.a) * 10 + Number(v.b) * 5,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} × 10 + ${vars.b} × 5 = ${answer} თეთრი.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-fuli', subtopicId: 'u12-counting-values' }),
    prompt: 'გვაქვს {lari} ლარი და {tetri} თეთრი. სულ რამდენი თეთრია?',
    variables: {
      lari: { kind: 'int', min: 1, max: 5 },
      tetri: { kind: 'choice', values: [10, 20, 30, 40, 50, 70] },
    },
    answer: (v) => Number(v.lari) * 100 + Number(v.tetri),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.lari} ლარი = ${Number(vars.lari) * 100} თეთრი; სულ ${answer} თეთრი.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-fuli', subtopicId: 'u12-fewest-coins' }),
    prompt: '{amount} თეთრის გადასახდელად ყველაზე ცოტა რამდენი 50-თეთრიანი მონეტაა საჭირო?',
    variables: {
      coins: { kind: 'int', min: 1, max: 4 },
      amount: { kind: 'choice', values: (v) => [Number(v.coins) * 50] },
    },
    answer: (v) => Number(v.coins),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.amount} ÷ 50 = ${answer}.`,
  }),
  choiceFact({
    topicId: 'g2-fuli',
    subtopicId: 'u12-equal-values',
    prompt: '1 ლარი უდრის:',
    options: ['100 თეთრს', '50 თეთრს', '10 თეთრს', '20 თეთრს'],
    answer: '100 თეთრს',
    why: '1 ლარში 100 თეთრია.',
  }),
  add2({ topicId: 'g2-fuli', subtopicId: 'u12-adding-amounts' }, 5, 45, 5, 45, '{a} ლარს დავამატოთ {b} ლარი. სულ რამდენი ლარია?'),
  sub2({ topicId: 'g2-fuli', subtopicId: 'u12-subtracting-amounts' }, 20, 80, 5, 30, '{a} ლარიდან დავხარჯეთ {b} ლარი. რამდენი ლარი დარჩა?'),
  comp2({ topicId: 'g2-fuli', subtopicId: 'u12-comparing-amounts' }, 5, 95),
  defineTemplate({
    ...addr({ topicId: 'g2-fuli', subtopicId: 'u12-do-we-have-enough' }),
    prompt: 'წიგნი ღირს {price} ლარი. გვაქვს {have} ლარი. გვეყოფა თუ არა ფული წიგნის საყიდლად?',
    variables: {
      price: { kind: 'int', min: 10, max: 50 },
      diff: { kind: 'int', min: 1, max: 10 },
      haveChoice: { kind: 'choice', values: ['enough', 'not-enough'] },
      have: { kind: 'choice', values: (v) => [v.haveChoice === 'enough' ? Number(v.price) + Number(v.diff) : Number(v.price) - Number(v.diff)] },
    },
    optionCount: 2,
    answer: (v) => (Number(v.have) >= Number(v.price) ? 'გვეყოფა' : 'არ გვეყოფა'),
    format: { kind: 'text' },
    distractors: ({ answer }) => (answer === 'გვეყოფა' ? ['არ გვეყოფა'] : ['გვეყოფა']),
    explanation: ({ vars, answer }) => `${vars.have} ლარი ${Number(vars.have) >= Number(vars.price) ? '≥' : '<'} ${vars.price} ლარი, ამიტომ ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-fuli', subtopicId: 'u12-making-1-lari' }),
    prompt: 'გვაქვს {have} თეთრი. რამდენი თეთრი გვაკლია 1 ლარამდე (100 თეთრამდე)?',
    variables: { have: { kind: 'choice', values: [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90] } },
    answer: (v) => 100 - Number(v.have),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `100 − ${vars.have} = ${answer} თეთრი.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-fuli', subtopicId: 'u12-estimating-amounts' }),
    prompt: 'კალამი ღირს {p1} ლარი, რვეული — {p2} ლარი. სულ რამდენი ლარია საჭირო?',
    variables: {
      p1: { kind: 'int', min: 2, max: 15 },
      p2: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v) => Number(v.p1) + Number(v.p2),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.p1} + ${vars.p2} = ${answer} ლარი.`,
  }),

  // ================= U13: დრო =================
  defineTemplate({
    ...addr({ topicId: 'g2-dro', subtopicId: 'u13-analog-clocks' }),
    prompt: 'ისრიან საათზე პატარა ისარი უჩვენებს {h}-ს, დიდი — 12-ს. რომელი საათია?',
    variables: { h: { kind: 'int', min: 1, max: 12 } },
    answer: (v) => Number(v.h),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ answer }) => `ზუსტად ${answer} საათია.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-dro', subtopicId: 'u13-digital-clocks' }),
    prompt: 'ელექტრონულ საათზე წერია {h}:00. რომელი საათია?',
    variables: { h: { kind: 'int', min: 1, max: 12 } },
    answer: (v) => Number(v.h),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ answer }) => `საათი უჩვენებს ${answer}-ს.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-dro', subtopicId: 'u13-comparing-clocks' }),
    prompt: 'რომელი დროა უფრო გვიან: {h1}:00 თუ {h2}:00?',
    variables: {
      h1: { kind: 'int', min: 1, max: 11 },
      diff: { kind: 'int', min: 1, max: 5 },
      h2: { kind: 'choice', values: (v) => [Number(v.h1) + Number(v.diff)] },
    },
    optionCount: 2,
    answer: (v) => `${v.h2}:00`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [`${vars.h1}:00`],
    explanation: ({ vars, answer }) => `${answer} უფრო გვიანაა, ვიდრე ${vars.h1}:00.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-dro', subtopicId: 'u13-days-of-week' }),
    prompt: '{day}-ის მომდევნო დღე არის:',
    variables: {
      dayIdx: { kind: 'int', min: 0, max: 6 },
      day: {
        kind: 'choice',
        values: (v) => {
          const days = ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი', 'კვირა'];
          return [days[Number(v.dayIdx)]];
        },
      },
    },
    answer: (v) => {
      const days = ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი', 'კვირა'];
      return days[(Number(v.dayIdx) + 1) % 7];
    },
    format: { kind: 'text' },
    distractors: ({ vars, answer }) => {
      const days = ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი', 'კვირა'];
      return days.filter((d) => d !== answer && d !== vars.day).slice(0, 3);
    },
    explanation: ({ vars, answer }) => `${vars.day}-ის შემდეგ მოდის ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-dro', subtopicId: 'u13-seasons-and-months' }),
    prompt: 'რომელ სეზონს ეკუთვნის თვე {month}?',
    variables: {
      item: {
        kind: 'choice',
        values: [
          'იანვარი:ზამთარი', 'თებერვალი:ზამთარი', 'მარტი:გაზაფხული', 'აპრილი:გაზაფხული',
          'მაისი:გაზაფხული', 'ივნისი:ზაფხული', 'ივლისი:ზაფხული', 'აგვისტო:ზაფხული',
          'სექტემბერი:შემოდგომა', 'ოქტომბერი:შემოდგომა', 'ნოემბერი:შემოდგომა', 'დეკემბერი:ზამთარი',
        ],
      },
      month: { kind: 'choice', values: (v) => [String(v.item).split(':')[0]] },
    },
    answer: (v) => String(v.item).split(':')[1],
    format: { kind: 'text' },
    distractors: ({ answer }) => ['ზამთარი', 'გაზაფხული', 'ზაფხული', 'შემოდგომა'].filter((s) => s !== answer),
    explanation: ({ vars, answer }) => `${vars.month} არის ${answer}.`,
  }),
  choiceFact({
    topicId: 'g2-dro',
    subtopicId: 'u13-days-in-each-month',
    prompt: 'რამდენი დღეა ერთ ჩვეულებრივ კვირაში?',
    options: ['7', '5', '10', '12'],
    answer: '7',
    why: 'კვირაში 7 დღეა.',
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-dro', subtopicId: 'u13-the-calendar' }),
    prompt: 'თუ დღეს არის რიცხვი {d}, რა რიცხვი იქნება ზუსტად 1 კვირის (7 დღის) შემდეგ?',
    variables: { d: { kind: 'int', min: 1, max: 21 } },
    answer: (v) => Number(v.d) + 7,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.d} + 7 = ${answer}.`,
  }),
  choiceFact({
    topicId: 'g2-dro',
    subtopicId: 'u13-comparing-times',
    prompt: 'რომელი დროა მეტი: 1 საათი თუ 45 წუთი?',
    options: ['1 საათი', '45 წუთი'],
    answer: '1 საათი',
    why: '1 საათი არის 60 წუთი, რაც მეტია 45 წუთზე.',
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-dro', subtopicId: 'u13-time-spent' }),
    prompt: 'გაკვეთილი დაიწყო {start}:00 საათზე და გაგრძელდა {dur} საათი. რომელ საათზე დასრულდა?',
    variables: {
      start: { kind: 'int', min: 9, max: 15 },
      dur: { kind: 'int', min: 1, max: 3 },
    },
    answer: (v) => Number(v.start) + Number(v.dur),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.start} + ${vars.dur} = ${answer} საათი.`,
  }),
  choiceFact({
    topicId: 'g2-dro',
    subtopicId: 'u13-time-units-sequence',
    prompt: '1 საათში არის:',
    options: ['60 წუთი', '30 წუთი', '100 წუთი', '24 წუთი'],
    answer: '60 წუთი',
    why: '1 საათი = 60 წუთი.',
  }),

  // ================= U14: კანონზომიერება და ლოგიკა =================
  choiceFact({
    topicId: 'g2-kanonzomiereba-logika',
    subtopicId: 'u14-repeating-patterns',
    prompt: 'მიმდევრობა მეორდება: ▲, ●, ■, ▲, ●, ■, ▲, ... რა იქნება შემდეგი ფიგურა?',
    options: ['●', '■', '▲', '★'],
    answer: '●',
    why: '▲-ს შემდეგ მოდის ●.',
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-kanonzomiereba-logika', subtopicId: 'u14-growing-patterns' }),
    prompt: 'მიმდევრობა იზრდება: {a}, {b}, {c}, ... რა იქნება შემდეგი რიცხვი?',
    variables: {
      step: { kind: 'choice', values: [3, 4, 5, 10] },
      start: { kind: 'int', min: 2, max: 30 },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 2 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) + 3 * Number(v.step),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `ყოველ ბიჯზე ემატება ${vars.step}; ${vars.c} + ${vars.step} = ${answer}.`,
  }),
  choiceFact({
    topicId: 'g2-kanonzomiereba-logika',
    subtopicId: 'u14-describing-the-rule',
    prompt: 'მიმდევრობაში 2, 4, 6, 8, 10 რა არის წესი?',
    options: ['ემატება 2', 'აკლდება 2', 'ემატება 3', 'ორმაგდება'],
    answer: 'ემატება 2',
    why: 'თითოეულ წევრს ემატება 2.',
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-kanonzomiereba-logika', subtopicId: 'u14-number-triangles' }),
    prompt: 'სამკუთხედის ქვედა კუთხეებში წერია {a} და {b}. ზედა კუთხეში მათი ჯამია. რა წერია ზემოთ?',
    variables: {
      a: { kind: 'int', min: 5, max: 30 },
      b: { kind: 'int', min: 5, max: 30 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-kanonzomiereba-logika', subtopicId: 'u14-number-guessing' }),
    prompt: 'ჩაფიქრებული რიცხვი მეტია {low}-ზე და ნაკლებია {high}-ზე ({high} − {low} = 2). რომელია ეს რიცხვი?',
    variables: {
      low: { kind: 'int', min: 10, max: 80 },
      high: { kind: 'choice', values: (v) => [Number(v.low) + 2] },
    },
    answer: (v) => Number(v.low) + 1,
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [
      Number(vars.low),
      Number(vars.high),
      Number(vars.high) + 1,
    ],
    explanation: ({ vars, answer }) => `${vars.low}-სა და ${vars.high}-ს შორის არის ${answer}.`,
  }),
  choiceFact({
    topicId: 'g2-kanonzomiereba-logika',
    subtopicId: 'u14-word-coding',
    prompt: 'თუ A=1, B=2, C=3, მაშინ რომელი რიცხვი შეესაბამება ასო D-ს?',
    options: ['4', '5', '6', '7'],
    answer: '4',
    why: 'D არის ანბანის მე-4 ასო.',
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-kanonzomiereba-logika', subtopicId: 'u14-age-problems' }),
    prompt: 'ნიკა {a} წლისაა. მისი და {diff} წლით უფროსია. რამდენი წლისაა და?',
    variables: {
      a: { kind: 'int', min: 6, max: 12 },
      diff: { kind: 'int', min: 2, max: 8 },
    },
    answer: (v) => Number(v.a) + Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.diff} = ${answer} წელი.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-kanonzomiereba-logika', subtopicId: 'u14-elimination' }),
    prompt: 'ჩამოთვლილთაგან რომელი რიცხვია ზედმეტი: {o1}, {o2}, {o3}, {even} (ყველა კენტია ერთის გარდა)?',
    variables: {
      k: { kind: 'int', min: 5, max: 30 },
      even: { kind: 'choice', values: (v) => [Number(v.k) * 2] },
      o1: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 1] },
      o2: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 3] },
      o3: { kind: 'choice', values: (v) => [Number(v.k) * 2 - 1] },
    },
    answer: (v) => Number(v.even),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.o1), Number(vars.o2), Number(vars.o3)],
    explanation: ({ answer }) => `${answer} ლუწია, დანარჩენები კენტია.`,
  }),
  choiceFact({
    topicId: 'g2-kanonzomiereba-logika',
    subtopicId: 'u14-color-choice',
    prompt: 'ყუთში მხოლოდ წითელი და ლურჯი ფანქრებია. ამოღებული ფანქარი არ არის წითელი. რა ფერისაა ის?',
    options: ['ლურჯი', 'წითელი'],
    answer: 'ლურჯი',
    why: 'რადგან სხვა ფერი ყუთში არ არის.',
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-kanonzomiereba-logika', subtopicId: 'u14-balance-scales' }),
    prompt: 'სასწორის მარცხენა თეფშზე დევს {a} კგ, მარჯვენაზე — {b} კგ ({a} > {b}). რომელი მხარე დაიწევს დაბლა?',
    variables: {
      b: { kind: 'int', min: 2, max: 15 },
      diff: { kind: 'int', min: 2, max: 10 },
      a: { kind: 'choice', values: (v) => [Number(v.b) + Number(v.diff)] },
    },
    optionCount: 2,
    answer: () => 'მარცხენა',
    format: { kind: 'text' },
    distractors: () => ['მარჯვენა'],
    explanation: ({ vars }) => `მარცხენა თეფში უფრო მძიმეა (${vars.a} კგ > ${vars.b} კგ), ამიტომ ის დაიწევს.`,
  }),
  choiceFact({
    topicId: 'g2-kanonzomiereba-logika',
    subtopicId: 'u14-elimination-harder',
    prompt: 'რიცხვებიდან 10, 20, 30, 35 რომელია ზედმეტი (ყველა მრგვალი ათეულია ერთის გარდა)?',
    options: ['35', '10', '20', '30'],
    answer: '35',
    why: '35 არ მთავრდება 0-ით, დანარჩენები სრული ათეულებია.',
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-kanonzomiereba-logika', subtopicId: 'u14-thought-of-number' }),
    prompt: 'ჩავიფიქრე რიცხვი. მას მივუმატე {add} და მივიღე {sum}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      orig: { kind: 'int', min: 10, max: 50 },
      add: { kind: 'int', min: 5, max: 25 },
      sum: { kind: 'choice', values: (v) => [Number(v.orig) + Number(v.add)] },
    },
    answer: (v) => Number(v.orig),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.sum} − ${vars.add} = ${answer}.`,
  }),
  defineTemplate({
    ...addr({ topicId: 'g2-kanonzomiereba-logika', subtopicId: 'u14-matching-conditions' }),
    prompt: 'რიცხვი არის ლუწი და მოთავსებულია {low}-სა და {high}-ს შორის. რომელია ეს რიცხვი?',
    variables: {
      k: { kind: 'int', min: 10, max: 40 },
      even: { kind: 'choice', values: (v) => [Number(v.k) * 2] },
      low: { kind: 'choice', values: (v) => [Number(v.k) * 2 - 1] },
      high: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 1] },
    },
    answer: (v) => Number(v.even),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars, answer }) => [
      Number(vars.low),
      Number(vars.high),
      Number(answer) + 2,
    ],
    explanation: ({ vars, answer }) => `${vars.low}-სა და ${vars.high}-ს შორის ერთადერთი ლუწი რიცხვია ${answer}.`,
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
