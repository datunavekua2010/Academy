import { defineTemplate, type QuestionTemplate } from './types';

export function nearMisses(answer: number, count = 3, min = 0, step = 1): number[] {
  const result = new Set<number>();
  const deltas = [step, -step, 2 * step, -2 * step, 3 * step, -3 * step, 5, -5, 10, -10];
  for (const delta of deltas) {
    const val = answer + delta;
    if (val >= min && val !== answer) {
      result.add(val);
      if (result.size >= count) break;
    }
  }
  let fallback = 1;
  while (result.size < count) {
    const val = answer + fallback * step;
    if (val >= min && val !== answer) {
      result.add(val);
    }
    fallback++;
  }
  return Array.from(result).slice(0, count);
}

export const G4_U10_SUBTOPICS = [
  'u10-mass-conversion',
  'u10-length-conversion',
  'u10-volume-conversion',
  'u10-measurement-operations',
  'u10-unit-suitability',
  'u10-unit-comparison',
  'u10-fill-to-target',
  'u10-centimeter-ruler',
  'u10-protractor-angles',
] as const;

export type G4U10SubtopicId = (typeof G4_U10_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G4U10SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 4 as const,
  topicId: 'g4-gazomva' as const,
  unitId: 'g4-gazomva' as const,
  ...options,
});

export const G4_U10_TEMPLATES: QuestionTemplate[] = [
  // g4-u10-01 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-01', subtopicId: 'u10-mass-conversion', difficulty: 1 }),
    prompt: 'გადაიყვანე {kg} კგ გრამებში.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|2000", "3|3000", "4|4000", "5|5000", "6|6000", "7|7000", "8|8000", "9|9000", "10|10000", "12|12000", "15|15000", "20|20000"],
      },
      kg: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => `1 კგ = 1 000 გ, ამიტომ ${vars.kg} კგ = ${vars.kg} × 1 000 = ${answer} გ.`,
  }),

  // g4-u10-02 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-02', subtopicId: 'u10-mass-conversion', difficulty: 1 }),
    prompt: 'რამდენი კილოგრამია {g} გ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2000|2", "3000|3", "4000|4", "5000|5", "6000|6", "7000|7", "8000|8", "9000|9", "10000|10", "11000|11", "14000|14", "16000|16"],
      },
      g: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `1 000 გ = 1 კგ, ამიტომ ${vars.g} გ = ${vars.g} ÷ 1 000 = ${answer} კგ.`,
  }),

  // g4-u10-03 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-03', subtopicId: 'u10-mass-conversion', difficulty: 2 }),
    prompt: 'გადაიყვანე {kg} კგ {g} გ გრამებში.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|450|2450", "3|250|3250", "4|300|4300", "5|150|5150", "6|800|6800", "7|500|7500", "1|650|1650", "8|200|8200", "9|100|9100", "3|750|3750", "5|400|5400", "4|900|4900"],
      },
      kg: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      g: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.kg} კგ = ${Number(vars.kg) * 1000} გ. სულ: ${Number(vars.kg) * 1000} + ${vars.g} = ${answer} გ.`,
  }),

  // g4-u10-04 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-04', subtopicId: 'u10-mass-conversion', difficulty: 2 }),
    prompt: 'რამდენი გრამია {kg} კგ {g} გ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|450|8450", "7|350|7350", "6|650|6650", "5|850|5850", "4|250|4250", "9|150|9150", "3|550|3550", "2|750|2750", "6|150|6150", "7|850|7850", "8|350|8350", "5|250|5250"],
      },
      kg: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      g: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.kg} კგ არის ${Number(vars.kg) * 1000} გ. ${Number(vars.kg) * 1000} + ${vars.g} = ${answer} გ.`,
  }),

  // g4-u10-05 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-05', subtopicId: 'u10-mass-conversion', difficulty: 3 }),
    prompt: 'გადაიყვანე {g} გ კილოგრამებში.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12000|12", "15000|15", "18000|18", "20000|20", "25000|25", "14000|14", "16000|16", "22000|22", "30000|30", "35000|35", "11000|11", "13000|13"],
      },
      g: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `1 000 გ = 1 კგ, ამიტომ ${vars.g} გ = ${vars.g} ÷ 1 000 = ${answer} კგ.`,
  }),

  // g4-u10-06 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-06', subtopicId: 'u10-mass-conversion', difficulty: 3 }),
    prompt: 'რამდენი კილოგრამია {t} ტონა? (1 ტონა = 1 000 კგ)',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|2000", "3|3000", "4|4000", "5|5000", "6|6000", "7|7000", "8|8000", "9|9000", "10|10000", "12|12000", "15|15000", "20|20000"],
      },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => `1 ტონა = 1 000 კგ, ამიტომ ${vars.t} ტონა = ${vars.t} × 1 000 = ${answer} კგ.`,
  }),

  // g4-u10-07 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-07', subtopicId: 'u10-length-conversion', difficulty: 1 }),
    prompt: 'გადაიყვანე {m} მ სანტიმეტრებში.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|200", "3|300", "4|400", "5|500", "6|600", "7|700", "8|800", "9|900", "10|1000", "12|1200", "15|1500", "20|2000"],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `1 მ = 100 სმ, ამიტომ ${vars.m} მ = ${vars.m} × 100 = ${answer} სმ.`,
  }),

  // g4-u10-08 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-08', subtopicId: 'u10-length-conversion', difficulty: 1 }),
    prompt: 'რამდენი მეტრია {cm} სმ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["200|2", "300|3", "400|4", "500|5", "600|6", "700|7", "800|8", "900|9", "1000|10", "1100|11", "1400|14", "1800|18"],
      },
      cm: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `100 სმ = 1 მ, ამიტომ ${vars.cm} სმ = ${vars.cm} ÷ 100 = ${answer} მ.`,
  }),

  // g4-u10-09 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-09', subtopicId: 'u10-length-conversion', difficulty: 2 }),
    prompt: 'გადაიყვანე {km} კმ მეტრებში.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|2000", "3|3000", "4|4000", "5|5000", "6|6000", "7|7000", "8|8000", "9|9000", "10|10000", "12|12000", "15|15000", "25|25000"],
      },
      km: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => `1 კმ = 1 000 მ, ამიტომ ${vars.km} კმ = ${vars.km} × 1 000 = ${answer} მ.`,
  }),

  // g4-u10-10 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-10', subtopicId: 'u10-length-conversion', difficulty: 2 }),
    prompt: 'რამდენი სანტიმეტრია {m} მ {cm} სმ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|25|325", "4|50|450", "2|75|275", "5|15|515", "6|80|680", "1|95|195", "7|30|730", "8|40|840", "9|10|910", "3|65|365", "4|85|485", "5|70|570"],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      cm: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.m} მ = ${Number(vars.m) * 100} სმ. სულ: ${Number(vars.m) * 100} + ${vars.cm} = ${answer} სმ.`,
  }),

  // g4-u10-11 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-11', subtopicId: 'u10-length-conversion', difficulty: 3 }),
    prompt: 'გადაიყვანე {m} მ მილიმეტრებში.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["7|7000", "5|5000", "8|8000", "3|3000", "9|9000", "4|4000", "6|6000", "2|2000", "10|10000", "12|12000", "1|1000", "15|15000"],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => `1 მ = 1 000 მმ, ამიტომ ${vars.m} მ = ${vars.m} × 1 000 = ${answer} მმ.`,
  }),

  // g4-u10-12 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-12', subtopicId: 'u10-length-conversion', difficulty: 3 }),
    prompt: 'რამდენი კილომეტრი და მეტრია {m} მ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5600|5|600", "3400|3|400", "7200|7|200", "4800|4|800", "6500|6|500", "8100|8|100", "2900|2|900", "9300|9|300", "1700|1|700", "4500|4|500", "3800|3|800", "6200|6|200", "2300|2|300", "7600|7|600", "8400|8|400", "5200|5|200", "9100|9|100", "1400|1|400"],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      km: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      rem: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => `${v.km} კმ ${v.rem} მ`,
    distractors: (ctx) => [
      `${Number(ctx.vars.km) + 1} კმ ${ctx.vars.rem} მ`,
      `${ctx.vars.km} კმ ${Number(ctx.vars.rem) + 100} მ`,
      `${Math.max(1, Number(ctx.vars.km) - 1)} კმ ${ctx.vars.rem} მ`,
    ],
    explanation: ({ vars, answer }) => `${vars.m} მ = ${answer}.`,
  }),

  // g4-u10-13 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-13', subtopicId: 'u10-volume-conversion', difficulty: 1 }),
    prompt: 'გადაიყვანე {l} ლიტრი მილილიტრებში.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|2000", "3|3000", "4|4000", "5|5000", "6|6000", "7|7000", "8|8000", "9|9000", "10|10000", "12|12000", "15|15000", "20|20000"],
      },
      l: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => `1 ლიტრი = 1 000 მლ, ამიტომ ${vars.l} ლიტრი = ${vars.l} × 1 000 = ${answer} მლ.`,
  }),

  // g4-u10-14 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-14', subtopicId: 'u10-volume-conversion', difficulty: 1 }),
    prompt: 'რამდენი ლიტრია {ml} მლ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2000|2", "3000|3", "4000|4", "5000|5", "6000|6", "7000|7", "8000|8", "9000|9", "10000|10", "12000|12", "14000|14", "18000|18"],
      },
      ml: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `1 000 მლ = 1 ლიტრი, ამიტომ ${vars.ml} მლ = ${vars.ml} ÷ 1 000 = ${answer} ლიტრი.`,
  }),

  // g4-u10-15 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-15', subtopicId: 'u10-volume-conversion', difficulty: 2 }),
    prompt: 'რამდენი მილილიტრია {l} ლ და {ml} მლ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|350|2350", "3|450|3450", "1|750|1750", "4|200|4200", "5|150|5150", "6|600|6600", "7|800|7800", "8|250|8250", "3|650|3650", "4|850|4850", "5|500|5500", "2|900|2900"],
      },
      l: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ml: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.l} ლ = ${Number(vars.l) * 1000} მლ. სულ: ${Number(vars.l) * 1000} + ${vars.ml} = ${answer} მლ.`,
  }),

  // g4-u10-16 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-16', subtopicId: 'u10-volume-conversion', difficulty: 2 }),
    prompt: 'გადაიყვანე {l} ლ {ml} მლ მილილიტრებში.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|75|8075", "5|60|5060", "4|45|4045", "7|30|7030", "3|85|3085", "6|20|6020", "2|95|2095", "9|15|9015", "4|65|4065", "5|40|5040", "7|80|7080", "8|50|8050"],
      },
      l: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ml: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.l} ლ = ${Number(vars.l) * 1000} მლ. სულ: ${Number(vars.l) * 1000} + ${vars.ml} = ${answer} მლ.`,
  }),

  // g4-u10-17 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-17', subtopicId: 'u10-volume-conversion', difficulty: 3 }),
    prompt: 'რამდენი ლიტრი და მილილიტრია {ml} მლ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4500|4|500", "3250|3|250", "6750|6|750", "2400|2|400", "5800|5|800", "7150|7|150", "8600|8|600", "1900|1|900", "4300|4|300", "5200|5|200", "3850|3|850", "6100|6|100", "2600|2|600", "7300|7|300", "8200|8|200", "5400|5|400", "9500|9|500", "1800|1|800"],
      },
      ml: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      l: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      rem: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => `${v.l} ლ ${v.rem} მლ`,
    distractors: (ctx) => [
      `${Number(ctx.vars.l) + 1} ლ ${ctx.vars.rem} მლ`,
      `${ctx.vars.l} ლ ${Number(ctx.vars.rem) + 100} მლ`,
      `${Math.max(1, Number(ctx.vars.l) - 1)} ლ ${ctx.vars.rem} მლ`,
    ],
    explanation: ({ vars, answer }) => `${vars.ml} მლ = ${answer}.`,
  }),

  // g4-u10-18 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-18', subtopicId: 'u10-volume-conversion', difficulty: 3 }),
    prompt: 'რამდენი მილილიტრია {l} ლიტრი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|12000", "15|15000", "18|18000", "20|20000", "25|25000", "14|14000", "16|16000", "30|30000", "11|11000", "22|22000", "13|13000", "35|35000"],
      },
      l: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => `1 ლიტრი = 1 000 მლ, ამიტომ ${vars.l} ლიტრი = ${vars.l} × 1 000 = ${answer} მლ.`,
  }),

  // g4-u10-19 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-19', subtopicId: 'u10-measurement-operations', difficulty: 1 }),
    prompt: 'გამოთვალე: {m} მ + {cm} სმ. პასუხი ჩაწერე სანტიმეტრებში.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|250|550", "2|150|350", "4|200|600", "5|350|850", "1|450|550", "3|180|480", "2|270|470", "4|120|520", "5|230|730", "1|380|480", "3|320|620", "2|410|610"],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      cm: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 50, 50),
    explanation: ({ vars, answer }) => `${vars.m} მ = ${Number(vars.m) * 100} სმ. ${Number(vars.m) * 100} + ${vars.cm} = ${answer} სმ.`,
  }),

  // g4-u10-20 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-20', subtopicId: 'u10-measurement-operations', difficulty: 1 }),
    prompt: 'გამოთვალე: {kg} კგ − {g} გ. პასუხი ჩაწერე გრამებში.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|1500|3500", "4|1200|2800", "6|2500|3500", "7|3200|3800", "3|800|2200", "8|4500|3500", "5|2200|2800", "6|1800|4200", "7|2400|4600", "4|1600|2400", "8|3500|4500", "9|4200|4800"],
      },
      kg: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      g: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.kg} კგ = ${Number(vars.kg) * 1000} გ. ${Number(vars.kg) * 1000} − ${vars.g} = ${answer} გ.`,
  }),

  // g4-u10-21 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-21', subtopicId: 'u10-measurement-operations', difficulty: 2 }),
    prompt: 'გამოთვალე: {l} ლ + {ml} მლ. პასუხი ჩაწერე მილილიტრებში.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|750|2750", "3|450|3450", "1|600|1600", "4|250|4250", "5|800|5800", "2|350|2350", "3|850|3850", "1|900|1900", "4|550|4550", "5|150|5150", "6|400|6400", "7|250|7250"],
      },
      l: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ml: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.l} ლ = ${Number(vars.l) * 1000} მლ. ${Number(vars.l) * 1000} + ${vars.ml} = ${answer} მლ.`,
  }),

  // g4-u10-22 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-22', subtopicId: 'u10-measurement-operations', difficulty: 2 }),
    prompt: 'გამოთვალე: {m1} მ {cm1} სმ + {m2} მ {cm2} სმ.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["6|40|2|30|8|70", "5|20|3|50|8|70", "4|35|2|40|6|75", "7|15|1|60|8|75", "3|50|4|25|7|75", "8|10|2|70|10|80", "5|45|3|35|8|80", "6|25|2|45|8|70", "4|60|3|20|7|80", "2|30|5|40|7|70", "7|20|2|50|9|70", "3|40|4|30|7|70"],
      },
      m1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      cm1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      m2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      cm2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      mAns: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
      cmAns: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[5])] },
    },
    answer: (v) => `${v.mAns} მ ${v.cmAns} სმ`,
    distractors: (ctx) => [
      `${Number(ctx.vars.mAns) + 1} მ ${ctx.vars.cmAns} სმ`,
      `${ctx.vars.mAns} მ ${Number(ctx.vars.cmAns) + 10} სმ`,
      `${Math.max(1, Number(ctx.vars.mAns) - 1)} მ ${ctx.vars.cmAns} სმ`,
    ],
    explanation: ({ vars, answer }) => `${vars.m1} მ + ${vars.m2} მ = ${vars.mAns} მ, ხოლო ${vars.cm1} სმ + ${vars.cm2} სმ = ${vars.cmAns} სმ. სულ: ${answer}.`,
  }),

  // g4-u10-23 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-23', subtopicId: 'u10-measurement-operations', difficulty: 3 }),
    prompt: 'გამოთვალე: {kg1} კგ − {kg2} კგ {g2} გ.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["9|3|250|5|750", "8|2|350|5|650", "7|1|450|5|550", "6|2|200|3|800", "10|4|150|5|850", "9|4|300|4|700", "8|3|400|4|600", "7|2|150|4|850", "6|1|350|4|650", "10|3|250|6|750", "9|2|500|6|500", "8|4|250|3|750"],
      },
      kg1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      kg2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      g2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      kgAns: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      gAns: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
    },
    answer: (v) => `${v.kgAns} კგ ${v.gAns} გ`,
    distractors: (ctx) => [
      `${Number(ctx.vars.kgAns) + 1} კგ ${ctx.vars.gAns} გ`,
      `${ctx.vars.kgAns} კგ ${Number(ctx.vars.gAns) - 100} გ`,
      `${Math.max(1, Number(ctx.vars.kgAns) - 1)} კგ ${ctx.vars.gAns} გ`,
    ],
    explanation: ({ vars, answer }) => `${vars.kg1} კგ = ${Number(vars.kg1) - 1} კგ 1 000 გ. გამოკლებით მიიღება: ${answer}.`,
  }),

  // g4-u10-24 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-24', subtopicId: 'u10-measurement-operations', difficulty: 3 }),
    prompt: 'გამოთვალე: {l1} ლ − {l2} ლ {ml2} მლ.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|1|600|3|400", "6|2|700|3|300", "7|3|450|3|550", "8|2|350|5|650", "4|1|250|2|750", "9|4|800|4|200", "5|2|400|2|600", "6|1|500|4|500", "7|2|650|4|350", "8|3|150|4|850", "10|4|300|5|700", "9|3|750|5|250"],
      },
      l1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      l2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ml2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      lAns: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      mlAns: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
    },
    answer: (v) => `${v.lAns} ლ ${v.mlAns} მლ`,
    distractors: (ctx) => [
      `${Number(ctx.vars.lAns) + 1} ლ ${ctx.vars.mlAns} მლ`,
      `${ctx.vars.lAns} ლ ${Number(ctx.vars.mlAns) - 100} მლ`,
      `${Math.max(1, Number(ctx.vars.lAns) - 1)} ლ ${ctx.vars.mlAns} მლ`,
    ],
    explanation: ({ vars, answer }) => `${vars.l1} ლ = ${Number(vars.l1) - 1} ლ 1 000 მლ. გამოკლებით მიიღება: ${answer}.`,
  }),

  // g4-u10-25 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-25', subtopicId: 'u10-unit-suitability', difficulty: 1 }),
    prompt: 'რომელ ერთეულში ჯობს გაიზომოს {item}?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["ფანქრის სიგრძე|სანტიმეტრებში|კილომეტრებში|მეტრებში|ლიტრებში", "კალმის სიგრძე|სანტიმეტრებში|კილომეტრებში|მეტრებში|გრამებში", "რვეულის სიგრძე|სანტიმეტრებში|კილომეტრებში|მეტრებში|მილილიტრებში", "საშლელის სიგრძე|სანტიმეტრებში|კილომეტრებში|მეტრებში|ლიტრებში", "ტელეფონის სიგრძე|სანტიმეტრებში|კილომეტრებში|მეტრებში|გრამებში", "მაკრატლის სიგრძე|სანტიმეტრებში|კილომეტრებში|მეტრებში|ტონებში", "კოვზის სიგრძე|სანტიმეტრებში|კილომეტრებში|მეტრებში|ლიტრებში", "ფუნჯის სიგრძე|სანტიმეტრებში|კილომეტრებში|მეტრებში|კილოგრამებში", "დანის სიგრძე|სანტიმეტრებში|კილომეტრებში|მეტრებში|მილილიტრებში", "საკომისიო ჩეკის სიგრძე|სანტიმეტრებში|კილომეტრებში|მეტრებში|ტონებში", "სახაზავის სიგრძე|სანტიმეტრებში|კილომეტრებში|მეტრებში|გრამებში", "ფურცლის სიგანე|სანტიმეტრებში|კილომეტრებში|მეტრებში|ლიტრებში"],
      },
      item: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)],
    explanation: ({ vars, answer }) => `${vars.item} მოსახერხებელია გაიზომოს ${answer}.`,
  }),

  // g4-u10-26 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-26', subtopicId: 'u10-unit-suitability', difficulty: 1 }),
    prompt: 'რომელ ერთეულში ჯობს გაიზომოს {item}?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["სკოლის შენობის სიგრძე|მეტრებში|მილიმეტრებში|ლიტრებში|გრამებში", "საკლასო ოთახის სიგრძე|მეტრებში|მილიმეტრებში|ლიტრებში|კილოგრამებში", "სტადიონის სიგრძე|მეტრებში|სანტიმეტრებში|მილილიტრებში|გრამებში", "საცურაო აუზის სიგრძე|მეტრებში|მილიმეტრებში|ლიტრებში|გრამებში", "ეზოს ღობის სიგრძე|მეტრებში|მილიმეტრებში|ლიტრებში|კილოგრამებში", "დერეფნის სიგრძე|მეტრებში|მილიმეტრებში|გრამებში|ლიტრებში", "საფეხბურთო მოედნის სიგანე|მეტრებში|მილიმეტრებში|ლიტრებში|ტონებში", "ხიდის სიგრძე|მეტრებში|სანტიმეტრებში|ლიტრებში|გრამებში", "სახლის სიმაღლე|მეტრებში|მილიმეტრებში|ლიტრებში|კილოგრამებში", "ხის სიმაღლე|მეტრებში|მილიმეტრებში|გრამებში|მილილიტრებში", "ავტობუსის სიგრძე|მეტრებში|მილიმეტრებში|ლიტრებში|გრამებში", "სპორტული დარბაზის სიგრძე|მეტრებში|მილიმეტრებში|ლიტრებში|კილოგრამებში"],
      },
      item: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)],
    explanation: ({ vars, answer }) => `${vars.item} მოსახერხებელია გაიზომოს ${answer}.`,
  }),

  // g4-u10-27 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-27', subtopicId: 'u10-unit-suitability', difficulty: 2 }),
    prompt: 'რომელ ერთეულში ჯობს გაიზომოს {item}?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["ვაშლის მასა|გრამებში|კილომეტრებში|ლიტრებში|მეტრებში", "კვერცხის მასა|გრამებში|კილომეტრებში|ლიტრებში|მეტრებში", "შოკოლადის ფილის მასა|გრამებში|კილომეტრებში|ლიტრებში|სანტიმეტრებში", "მონეტის მასა|გრამებში|კილომეტრებში|ლიტრებში|მეტრებში", "კალმის მასა|გრამებში|კილომეტრებში|ლიტრებში|სანტიმეტრებში", "პურის ნაჭრის მასა|გრამებში|კილომეტრებში|ლიტრებში|მეტრებში", "კანფეტის მასა|გრამებში|კილომეტრებში|ლიტრებში|სანტიმეტრებში", "ტელეფონის მასა|გრამებში|კილომეტრებში|ლიტრებში|მეტრებში", "ჩაის კოვზის მასა|გრამებში|კილომეტრებში|ლიტრებში|სანტიმეტრებში", "ფუნთუშის მასა|გრამებში|კილომეტრებში|ლიტრებში|მეტრებში", "ვაშლის ჩირის მასა|გრამებში|კილომეტრებში|ლიტრებში|სანტიმეტრებში", "ფორთოხლის მასა|გრამებში|კილომეტრებში|ლიტრებში|მეტრებში"],
      },
      item: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)],
    explanation: ({ vars, answer }) => `${vars.item} იზომება ${answer}.`,
  }),

  // g4-u10-28 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-28', subtopicId: 'u10-unit-suitability', difficulty: 2 }),
    prompt: 'რომელ ერთეულში ჯობს გაიზომოს {item}?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["წყლის ბოთლში არსებული სითხის მოცულობა|ლიტრებში|მეტრებში|კილოგრამებში|კილომეტრებში", "ჩაიდნის ტევადობა|ლიტრებში|მეტრებში|კილოგრამებში|სანტიმეტრებში", "რძის პაკეტის მოცულობა|ლიტრებში|მეტრებში|კილოგრამებში|კილომეტრებში", "აკვარიუმის წყლის მოცულობა|ლიტრებში|მეტრებში|კილოგრამებში|სანტიმეტრებში", "წვვენის ქილის მოცულობა|ლიტრებში|მეტრებში|კილოგრამებში|კილომეტრებში", "სათლის მოცულობა|ლიტრებში|მეტრებში|კილოგრამებში|სანტიმეტრებში", "საწვავის ავზის მოცულობა|ლიტრებში|მეტრებში|კილოგრამებში|კილომეტრებში", "სუპის ქვაბის მოცულობა|ლიტრებში|მეტრებში|კილოგრამებში|სანტიმეტრებში", "კომპოტის ქილის მოცულობა|ლიტრებში|მეტრებში|კილოგრამებში|კილომეტრებში", "ლიმონათის ბოთლის მოცულობა|ლიტრებში|მეტრებში|კილოგრამებში|სანტიმეტრებში", "ღვინის დოქის მოცულობა|ლიტრებში|მეტრებში|კილოგრამებში|კილომეტრებში", "ქვაბში ჩასხმული წყლის რაოდენობა|ლიტრებში|მეტრებში|კილოგრამებში|სანტიმეტრებში"],
      },
      item: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)],
    explanation: ({ vars, answer }) => `${vars.item} იზომება ${answer}.`,
  }),

  // g4-u10-29 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-29', subtopicId: 'u10-unit-suitability', difficulty: 3 }),
    prompt: 'რომელი ერთეულია შესაბამისი სიდიდისთვის: „{qty}“?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["მანძილი ორ ქალაქს შორის|კილომეტრი|გრამი|ლიტრი|წამი", "ადამიანის მასა|კილოგრამი|მეტრი|ლიტრი|საათი", "წამლის მოცულობა შპრიცში|მილილიტრი|კილომეტრი|კილოგრამი|მეტრი", "რვეულის სისქე|მილიმეტრი|კილოგრამი|ლიტრი|კილომეტრი", "ჩანთის მასა|კილოგრამი|მეტრი|ლიტრი|წუთი", "სირბილის მანძილი სტადიონზე|მეტრი|ლიტრი|გრამი|საათი", "წყლის ავზის ტევადობა|ლიტრი|კილომეტრი|გრამი|მეტრი", "მანქანის მასა|ტონა|მილილიტრი|სანტიმეტრი|წამი", "ფანქრის წვერის სისქე|მილიმეტრი|კილოგრამი|ლიტრი|კილომეტრი", "ქალაქებს შორის გზატკეცილის სიგრძე|კილომეტრი|გრამი|მილილიტრი|წუთი", "ჭიქის ტევადობა|მილილიტრი|კილომეტრი|კილოგრამი|მეტრი", "საზამთროს მასა|კილოგრამი|მეტრი|ლიტრი|წამი"],
      },
      qty: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)],
    explanation: ({ vars, answer }) => `${vars.qty} იზომება ერთეულით: ${answer}.`,
  }),

  // g4-u10-30 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-30', subtopicId: 'u10-unit-suitability', difficulty: 3 }),
    prompt: 'აირჩიე შესაფერისი ეკვივალენტური ერთეული {spec_label}-თვის:',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1 000 მეტრისთვის|კილომეტრი|გრამი|მილილიტრი|ტონა", "1 000 გრამისთვის|კილოგრამი|მეტრი|მილილიტრი|კილომეტრი", "1 000 მილილიტრისთვის|ლიტრი|გრამი|მეტრი|კილოგრამი", "1 000 კილოგრამისთვის|ტონა|კილომეტრი|ლიტრი|სანტიმეტრი", "100 სანტიმეტრისთვის|მეტრი|კილოგრამი|ლიტრი|კილომეტრი", "10 მილიმეტრისთვის|სანტიმეტრი|ლიტრი|გრამი|მეტრი", "100 დეციმეტრისთვის|10 მეტრი|კილოგრამი|ლიტრი|გრამი", "10 000 მეტრისთვის|10 კილომეტრი|100 გრამი|ლიტრი|ტონა", "2 000 გრამისთვის|2 კილოგრამი|2 მეტრი|2 ლიტრი|2 კილომეტრი", "5 000 მეტრისთვის|5 კილომეტრი|5 გრამი|5 ლიტრი|5 ტონა", "3 000 მილილიტრისთვის|3 ლიტრი|3 გრამი|3 მეტრი|3 კილოგრამი", "4 000 კილოგრამისთვის|4 ტონა|4 კილომეტრი|4 ლიტრი|4 მეტრი"],
      },
      spec_label: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)],
    explanation: ({ vars, answer }) => `${vars.spec_label} ეკვივალენტურია: ${answer}.`,
  }),

  // g4-u10-31 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-31', subtopicId: 'u10-unit-comparison', difficulty: 1 }),
    optionCount: 3,
    prompt: 'შეადარე ნიშნებით >, < ან =: {m} მ [ ? ] {cm} სმ.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|250|>", "2|250|<", "4|400|=", "5|490|>", "6|650|<", "7|700|=", "8|750|>", "3|320|<", "5|500|=", "4|380|>", "2|210|<", "9|900|="],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      cm: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      sign: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.sign),
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) => `${vars.m} მ = ${Number(vars.m) * 100} სმ. ${Number(vars.m) * 100} სმ ${answer} ${vars.cm} სმ.`,
  }),

  // g4-u10-32 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-32', subtopicId: 'u10-unit-comparison', difficulty: 1 }),
    optionCount: 3,
    prompt: 'შეადარე ნიშნებით >, < ან =: {kg} კგ [ ? ] {g} გ.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|3900|>", "3|3200|<", "5|5000|=", "6|5800|>", "2|2100|<", "7|7000|=", "8|7900|>", "4|4300|<", "9|9000|=", "5|4500|>", "3|3050|<", "6|6000|="],
      },
      kg: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      g: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      sign: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.sign),
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) => `${vars.kg} კგ = ${Number(vars.kg) * 1000} გ. ${Number(vars.kg) * 1000} გ ${answer} ${vars.g} გ.`,
  }),

  // g4-u10-33 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-33', subtopicId: 'u10-unit-comparison', difficulty: 2 }),
    optionCount: 3,
    prompt: 'შეადარე ნიშნებით >, < ან =: {l} ლ [ ? ] {ml} მლ.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|1800|>", "3|3500|<", "4|4000|=", "5|4800|>", "1|1200|<", "6|6000|=", "7|6900|>", "2|2300|<", "8|8000|=", "3|2700|>", "4|4100|<", "5|5000|="],
      },
      l: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ml: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      sign: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.sign),
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) => `${vars.l} ლ = ${Number(vars.l) * 1000} მლ. ${Number(vars.l) * 1000} მლ ${answer} ${vars.ml} მლ.`,
  }),

  // g4-u10-34 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-34', subtopicId: 'u10-unit-comparison', difficulty: 2 }),
    optionCount: 3,
    prompt: 'შეადარე: {km} კმ [ ? ] {m} მ.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|5000|=", "4|3800|>", "6|6200|<", "7|7000|=", "3|2900|>", "8|8500|<", "2|2000|=", "9|8800|>", "5|5300|<", "6|6000|=", "4|4200|<", "8|7800|>"],
      },
      km: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      sign: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.sign),
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) => `${vars.km} კმ = ${Number(vars.km) * 1000} მ, ამიტომ სწორი ნიშანია „${answer}“.`,
  }),

  // g4-u10-35 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-35', subtopicId: 'u10-unit-comparison', difficulty: 3 }),
    optionCount: 3,
    prompt: 'შეადარე: {cm} სმ [ ? ] {m} მ.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["750|8|<", "820|8|>", "600|6|=", "450|5|<", "530|5|>", "900|9|=", "340|4|<", "670|6|>", "700|7|=", "280|3|<", "410|4|>", "500|5|="],
      },
      cm: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      sign: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.sign),
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) => `${vars.m} მ = ${Number(vars.m) * 100} სმ. ${vars.cm} სმ ${answer} ${Number(vars.m) * 100} სმ.`,
  }),

  // g4-u10-36 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-36', subtopicId: 'u10-unit-comparison', difficulty: 3 }),
    optionCount: 3,
    prompt: 'შეადარე: {kg} კგ {g1} გ [ ? ] {g2} გ.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|300|2030|>", "3|50|3500|<", "4|200|4200|=", "5|100|5010|>", "6|40|6400|<", "7|500|7500|=", "3|700|3070|>", "2|80|2800|<", "8|300|8300|=", "4|90|4090|=", "5|600|5060|>", "6|150|6500|<"],
      },
      kg: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      g1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      g2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      sign: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.sign),
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) => `${vars.kg} კგ ${vars.g1} გ = ${Number(vars.kg) * 1000 + Number(vars.g1)} გ. ${Number(vars.kg) * 1000 + Number(vars.g1)} გ ${answer} ${vars.g2} გ.`,
  }),

  // g4-u10-37 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-37', subtopicId: 'u10-fill-to-target', difficulty: 1 }),
    prompt: 'რამდენი სანტიმეტრი უნდა დაამატო {cm} სმ-ს, რომ მიიღო 1 მ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["65|35", "70|30", "45|55", "80|20", "55|45", "75|25", "60|40", "85|15", "50|50", "40|60", "35|65", "90|10"],
      },
      cm: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 5, 5),
    explanation: ({ vars, answer }) => `1 მ = 100 სმ. 100 − ${vars.cm} = ${answer} სმ.`,
  }),

  // g4-u10-38 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-38', subtopicId: 'u10-fill-to-target', difficulty: 1 }),
    prompt: 'რამდენი გრამი უნდა დაამატო {g} გ-ს, რომ მიიღო 1 კგ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["750|250", "600|400", "850|150", "500|500", "700|300", "450|550", "800|200", "650|350", "900|100", "350|650", "550|450", "720|280"],
      },
      g: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 50, 50),
    explanation: ({ vars, answer }) => `1 კგ = 1 000 გ. 1 000 − ${vars.g} = ${answer} გ.`,
  }),

  // g4-u10-39 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-39', subtopicId: 'u10-fill-to-target', difficulty: 2 }),
    prompt: 'რამდენი მილილიტრი უნდა დაამატო 1 ლ {ml} მლ-ს, რომ მიიღო 2 ლ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["250|750", "350|650", "400|600", "150|850", "500|500", "650|350", "700|300", "800|200", "450|550", "600|400", "200|800", "750|250"],
      },
      ml: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 50, 50),
    explanation: ({ vars, answer }) => `2 ლ − 1 ლ ${vars.ml} მლ = 1 000 მლ − ${vars.ml} მლ = ${answer} მლ.`,
  }),

  // g4-u10-40 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-40', subtopicId: 'u10-fill-to-target', difficulty: 2 }),
    prompt: 'რამდენი მეტრი უნდა დაამატო 2 კმ {m} მ-ს, რომ მიიღო 3 კმ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["400|600", "350|650", "500|500", "250|750", "700|300", "450|550", "600|400", "800|200", "150|850", "650|350", "200|800", "750|250"],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 50, 50),
    explanation: ({ vars, answer }) => `3 კმ − 2 კმ ${vars.m} მ = 1 000 მ − ${vars.m} მ = ${answer} მ.`,
  }),

  // g4-u10-41 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-41', subtopicId: 'u10-fill-to-target', difficulty: 3 }),
    prompt: 'რამდენი გრამი აკლია 3 კგ {g} გ-ს, რომ მივიღოთ 4 კგ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["200|800", "350|650", "400|600", "150|850", "500|500", "250|750", "600|400", "700|300", "450|550", "650|350", "300|700", "800|200"],
      },
      g: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 50, 50),
    explanation: ({ vars, answer }) => `4 კგ − 3 კგ ${vars.g} გ = 1 000 გ − ${vars.g} გ = ${answer} გ.`,
  }),

  // g4-u10-42 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-42', subtopicId: 'u10-fill-to-target', difficulty: 3 }),
    prompt: 'რამდენი მილილიტრი აკლია 3 ლ {ml} მლ-ს, რომ მივიღოთ 5 ლ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["600|1400", "500|1500", "400|1600", "700|1300", "350|1650", "800|1200", "250|1750", "650|1350", "450|1550", "550|1450", "300|1700", "750|1250"],
      },
      ml: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 50, 50),
    explanation: ({ vars, answer }) => `5 ლ − 3 ლ ${vars.ml} მლ = 2 000 მლ − ${vars.ml} მლ = ${answer} მლ.`,
  }),

  // g4-u10-43 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-43', subtopicId: 'u10-centimeter-ruler', difficulty: 1 }),
    prompt: 'სახაზავზე მონაკვეთი იწყება {a} სმ ნიშნულთან და მთავრდება {b} სმ ნიშნულთან. რა სიგრძისაა მონაკვეთი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|9|7", "3|8|5", "1|7|6", "4|11|7", "5|12|7", "2|8|6", "3|10|7", "4|9|5", "1|6|5", "5|13|8", "2|11|9", "6|12|6"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `მონაკვეთის სიგრძეა: ${vars.b} − ${vars.a} = ${answer} სმ.`,
  }),

  // g4-u10-44 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-44', subtopicId: 'u10-centimeter-ruler', difficulty: 1 }),
    prompt: 'მონაკვეთი იწყება {a} სმ ნიშნულთან და მთავრდება {b} სმ ნიშნულთან. იპოვე მისი სიგრძე.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|12|8", "5|14|9", "3|11|8", "6|15|9", "2|13|11", "7|16|9", "4|15|11", "5|16|11", "3|13|10", "6|14|8", "2|12|10", "7|15|8"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `სიგრძეა: ${vars.b} − ${vars.a} = ${answer} სმ.`,
  }),

  // g4-u10-45 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-45', subtopicId: 'u10-centimeter-ruler', difficulty: 2 }),
    prompt: 'მონაკვეთის სიგრძეა {l} სმ. თუ მისი დასაწყისი {a} სმ ნიშნულთანაა, რომელ ნიშნულთან დასრულდება?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["7|3|10", "6|4|10", "8|2|10", "5|5|10", "9|2|11", "7|5|12", "6|6|12", "8|4|12", "5|7|12", "9|4|13", "8|5|13", "7|6|13"],
      },
      l: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `დასასრული ნიშნულია: ${vars.a} + ${vars.l} = ${answer} სმ.`,
  }),

  // g4-u10-46 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-46', subtopicId: 'u10-centimeter-ruler', difficulty: 2 }),
    prompt: 'მონაკვეთი იწყება {a} სმ ნიშნულთან და მთავრდება {b} სმ ნიშნულთან. რამდენი სანტიმეტრია მისი სიგრძე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|14|9", "4|13|9", "6|17|11", "7|18|11", "3|15|12", "8|19|11", "5|17|12", "4|16|12", "6|19|13", "7|20|13", "3|16|13", "8|20|12"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `მონაკვეთის სიგრძეა: ${vars.b} − ${vars.a} = ${answer} სმ.`,
  }),

  // g4-u10-47 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-47', subtopicId: 'u10-centimeter-ruler', difficulty: 3 }),
    prompt: 'სახაზავზე მონაკვეთი {a} სმ ნიშნულიდან {b} სმ ნიშნულამდეა. იპოვე მონაკვეთის სიგრძე.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["6|11|5", "5|13|8", "7|14|7", "8|15|7", "4|12|8", "9|16|7", "6|15|9", "5|14|9", "7|16|9", "8|17|9", "4|13|9", "9|17|8"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `მონაკვეთის სიგრძეა: ${vars.b} − ${vars.a} = ${answer} სმ.`,
  }),

  // g4-u10-48 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-48', subtopicId: 'u10-centimeter-ruler', difficulty: 3 }),
    prompt: 'მონაკვეთის სიგრძეა {l} სმ. თუ ის {a} სმ ნიშნულთან იწყება, რომელ ნიშნულთან დასრულდება?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|2|10", "9|3|12", "7|4|11", "8|5|13", "6|7|13", "10|3|13", "8|6|14", "9|5|14", "7|8|15", "11|3|14", "6|9|15", "10|5|15"],
      },
      l: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `მონაკვეთი დასრულდება ნიშნულთან: ${vars.a} + ${vars.l} = ${answer} სმ.`,
  }),

  // g4-u10-49 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-49', subtopicId: 'u10-protractor-angles', difficulty: 1 }),
    prompt: 'რა ზომისაა {spec_label} გრადუსებში (შეკითხვა #{num})?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["მართი კუთხე|90°|1", "მართი კუთხე|90°|2", "მართი კუთხე|90°|3", "მართი კუთხე|90°|4", "მართი კუთხე|90°|5", "მართი კუთხე|90°|6", "მართი კუთხე|90°|7", "მართი კუთხე|90°|8", "მართი კუთხე|90°|9", "მართი კუთხე|90°|10", "მართი კუთხე|90°|11", "მართი კუთხე|90°|12"],
      },
      spec_label: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      num: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => String(v.ans),
    options: () => ['90°', '180°', '45°', '60°'],
    explanation: ({ answer }) => `მართი კუთხის ზომაა ${answer}.`,
  }),

  // g4-u10-50 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u10-50', subtopicId: 'u10-protractor-angles', difficulty: 1 }),
    prompt: 'რამდენი გრადუსია {spec_label} (შეკითხვა #{num})?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["გაშლილი კუთხე|180°|1", "გაშლილი კუთხე|180°|2", "გაშლილი კუთხე|180°|3", "გაშლილი კუთხე|180°|4", "გაშლილი კუთხე|180°|5", "გაშლილი კუთხე|180°|6", "გაშლილი კუთხე|180°|7", "გაშლილი კუთხე|180°|8", "გაშლილი კუთხე|180°|9", "გაშლილი კუთხე|180°|10", "გაშლილი კუთხე|180°|11", "გაშლილი კუთხე|180°|12"],
      },
      spec_label: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      num: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => String(v.ans),
    options: () => ['180°', '90°', '360°', '120°'],
    explanation: ({ answer }) => `გაშლილი კუთხე არის ${answer}.`,
  }),

  // g4-u10-51 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-51', subtopicId: 'u10-protractor-angles', difficulty: 2 }),
    prompt: 'კუთხის ზომაა {deg}°. რამდენი გრადუსი აკლია მას მართ კუთხემდე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["45|45", "30|60", "60|30", "20|70", "70|20", "40|50", "50|40", "25|65", "35|55", "15|75", "75|15", "55|35"],
      },
      deg: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 5, 5),
    explanation: ({ vars, answer }) => `მართი კუთხე 90°-ია. 90° − ${vars.deg}° = ${answer}°.`,
  }),

  // g4-u10-52 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u10-52', subtopicId: 'u10-protractor-angles', difficulty: 2 }),
    prompt: 'კუთხის ზომაა {deg}°. რამდენი გრადუსით აღემატება ის მართ კუთხეს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["120|30", "135|45", "110|20", "100|10", "150|60", "130|40", "140|50", "105|15", "115|25", "125|35", "145|55", "160|70"],
      },
      deg: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 5, 5),
    explanation: ({ vars, answer }) => `${vars.deg}° − 90° = ${answer}°.`,
  }),

  // g4-u10-53 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-53', subtopicId: 'u10-protractor-angles', difficulty: 3 }),
    prompt: 'რომელი სახის კუთხეა {deg}-იანი კუთხე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["60°|მახვილი კუთხე", "45°|მახვილი კუთხე", "30°|მახვილი კუთხე", "75°|მახვილი კუთხე", "120°|ბლაგვი კუთხე", "135°|ბლაგვი კუთხე", "110°|ბლაგვი კუთხე", "150°|ბლაგვი კუთხე", "90°|მართი კუთხე", "180°|გაშლილი კუთხე", "85°|მახვილი კუთხე", "140°|ბლაგვი კუთხე"],
      },
      deg: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    options: () => ['მახვილი კუთხე', 'მართი კუთხე', 'ბლაგვი კუთხე', 'გაშლილი კუთხე'],
    explanation: ({ vars, answer }) => `${vars.deg}-იანი კუთხე არის ${answer}.`,
  }),

  // g4-u10-54 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u10-54', subtopicId: 'u10-protractor-angles', difficulty: 3 }),
    prompt: 'როგორი კუთხე მიიღება ტრანსპორტირზე {deg}-იანი ნიშნულის აზომვისას?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["90°|მართი კუთხე", "100°|ბლაგვი კუთხე", "50°|მახვილი კუთხე", "130°|ბლაგვი კუთხე", "70°|მახვილი კუთხე", "160°|ბლაგვი კუთხე", "180°|გაშლილი კუთხე", "40°|მახვილი კუთხე", "115°|ბლაგვი კუთხე", "65°|მახვილი კუთხე", "170°|ბლაგვი კუთხე", "80°|მახვილი კუთხე"],
      },
      deg: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    options: () => ['მართი კუთხე', 'მახვილი კუთხე', 'ბლაგვი კუთხე', 'გაშლილი კუთხე'],
    explanation: ({ vars, answer }) => `${vars.deg} არის ${answer}.`,
  }),
];
