import { defineTemplate, QuestionTemplate } from './types';
import type { Vars } from './types';

/**
 * Grade 3 — Unit 11: ფინანსური წიგნიერება და ფული (Financial Literacy & Money)
 *
 * Covers 5 subtopics (30 templates total: Q01–Q30, 6 per subtopic):
 *   U11.1 — თეთრისა და ლარის დათვლა (u11-counting-tetri-lari)
 *   U11.2 — თანხის დამრგვალება (u11-rounding-money)
 *   U11.3 — შეკრება, გამოკლება, გამრავლება და გაყოფა ფულზე (u11-money-operations)
 *   U11.4 — საკმარისი თანხა და ფასების შედარება (u11-sufficient-funds-shopping)
 *   U11.5 — ტექსტური ამოცანები ფულზე (u11-money-word-problems)
 */

export const G3_U11_SUBTOPICS = [
  'u11-counting-tetri-lari',
  'u11-rounding-money',
  'u11-money-operations',
  'u11-sufficient-funds-shopping',
  'u11-money-word-problems',
] as const;

export type G3U11SubtopicId = (typeof G3_U11_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G3U11SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 3 as const,
  topicId: 'g3-fuli' as const,
  unitId: 'g3-fuli' as const,
  ...options,
});


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
    fallback += 1;
  }
  return Array.from(result);
}

export const G3_U11_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U11.1 — თეთრისა და ლარის დათვლა (Q01–Q06)
  // =========================================================================

  // Q01 — ლარის გადაყვანა თეთრში (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-01', subtopicId: 'u11-counting-tetri-lari', difficulty: 1 }),
    prompt: 'რამდენი თეთრია {lari} ლარში?',
    variables: {
      lari: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => Number(v.lari) * 100,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 100),
    explanation: ({ vars, answer }) =>
      `1 ლარი = 100 თეთრი, ამიტომ ${vars.lari} ლარი = ${vars.lari} × 100 = ${answer} თეთრი.`,
  }),

  // Q02 — მონეტების დათვლა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-02', subtopicId: 'u11-counting-tetri-lari', difficulty: 1 }),
    prompt: 'ჯიბეში გაქვს {count} ცალი 20-თეთრიანი მონეტა. სულ რამდენი თეთრი გაქვს?',
    variables: {
      count: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => Number(v.count) * 20,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 20),
    explanation: ({ vars, answer }) =>
      `${vars.count} × 20 = ${answer} თეთრი.`,
  }),

  // Q03 — ლარისა და თეთრის გაერთიანება (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-03', subtopicId: 'u11-counting-tetri-lari', difficulty: 2 }),
    prompt: 'რამდენი თეთრია სულ {lari} ლარსა და {tetri} თეთრში ერთად?',
    variables: {
      lari: { kind: 'int', min: 1, max: 8 },
      tetri: { kind: 'choice', values: [15, 25, 40, 50, 65, 80] },
    },
    answer: (v: Vars) => Number(v.lari) * 100 + Number(v.tetri),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) =>
      `${vars.lari} ლარი = ${Number(vars.lari) * 100} თეთრი. ${Number(vars.lari) * 100} + ${vars.tetri} = ${answer} თეთრი.`,
  }),

  // Q04 — ასეულობით თეთრის გადაყვანა ლარში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-04', subtopicId: 'u11-counting-tetri-lari', difficulty: 2 }),
    prompt: '{tetri} თეთრი რამდენ ლარს შეადგენს?',
    variables: {
      lari: { kind: 'int', min: 2, max: 15 },
      tetri: { kind: 'choice', values: (v: Vars) => [Number(v.lari) * 100] },
    },
    answer: (v: Vars) => Number(v.lari),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `100 თეთრი = 1 ლარი, ამიტომ ${vars.tetri} ÷ 100 = ${answer} ლარი.`,
  }),

  // Q05 — კუპიურებისა და მონეტების დაჯამება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u11-05', subtopicId: 'u11-counting-tetri-lari', difficulty: 3 }),
    prompt: 'საფულეში დევს {b} ცალი 10-ლარიანი კუპიურა და {c} ცალი 2-ლარიანი მონეტა. სულ რამდენი ლარია?',
    variables: {
      b: { kind: 'int', min: 2, max: 6 },
      c: { kind: 'int', min: 2, max: 8 },
    },
    answer: (v: Vars) => `${Number(v.b) * 10 + Number(v.c) * 2} ლარი`,
    format: { kind: 'text' },
    options: (v: Vars) => {
      const correct = Number(v.b) * 10 + Number(v.c) * 2;
      return [
        `${correct} ლარი`,
        `${correct - 4} ლარი`,
        `${correct + 6} ლარი`,
        `${correct + 10} ლარი`,
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) => {
      const bSum = Number(vars.b) * 10;
      const cSum = Number(vars.c) * 2;
      return `${vars.b} × 10 = ${bSum} ლარი, ${vars.c} × 2 = ${cSum} ლარი. სულ: ${bSum} + ${cSum} = ${answer}.`;
    },
  }),

  // Q06 — 1 ლარამდე (100 თეთრამდე) შევსება (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-06', subtopicId: 'u11-counting-tetri-lari', difficulty: 3 }),
    prompt: 'გაქვს {tetri} თეთრი. კიდევ რამდენი თეთრი გაკლია 1 ლარამდე (100 თეთრამდე)?',
    variables: {
      tetri: { kind: 'choice', values: [15, 25, 30, 45, 55, 60, 65, 70, 75, 80, 85, 90] },
    },
    answer: (v: Vars) => 100 - Number(v.tetri),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) =>
      `1 ლარი = 100 თეთრი. 100 − ${vars.tetri} = ${answer} თეთრი გაკლია.`,
  }),

  // =========================================================================
  // U11.2 — თანხის დამრგვალება (Q07–Q12)
  // =========================================================================

  // Q07 — თეთრების დამრგვალება ათეულამდე (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-07', subtopicId: 'u11-rounding-money', difficulty: 1 }),
    prompt: 'დაამრგვალე {t} თეთრი უახლოეს ათეულამდე თეთრებში:',
    variables: {
      d1: { kind: 'int', min: 1, max: 9 },
      d2: { kind: 'choice', values: [1, 2, 3, 4, 6, 7, 8, 9] },
      t: { kind: 'choice', values: (v: Vars) => [Number(v.d1) * 10 + Number(v.d2)] },
    },
    answer: (v: Vars) => Math.round(Number(v.t) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) =>
      `${vars.t} თეთრი უახლოეს ათეულამდე დამრგვალებით არის ${answer} თეთრი.`,
  }),

  // Q08 — ფასის დამრგვალება ათეულამდე ლარებში (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-08', subtopicId: 'u11-rounding-money', difficulty: 1 }),
    prompt: 'წიგნი ღირს {price} ლარი. დაამრგვალე მისი ფასი უახლოეს ათეულამდე ლარებში:',
    variables: {
      t: { kind: 'int', min: 2, max: 8 },
      d: { kind: 'choice', values: [1, 2, 3, 4, 6, 7, 8, 9] },
      price: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.d)] },
    },
    answer: (v: Vars) => Math.round(Number(v.price) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) =>
      `${vars.price} ლარი უახლოეს ათეულამდე დამრგვალებით არის ${answer} ლარი.`,
  }),

  // Q09 — რომელი ნივთის ფასი მრგვალდება სამიზნე თანხამდე (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u11-09', subtopicId: 'u11-rounding-money', difficulty: 2 }),
    prompt: 'მაღაზიაში რომელი ნივთის ფასი მრგვალდება {target} ლარამდე (უახლოეს ათეულამდე)?',
    variables: {
      target: { kind: 'choice', values: [30, 40, 50, 60, 70, 80] },
      off: { kind: 'choice', values: [-4, -3, -2, 2, 3, 4] },
      correct: { kind: 'choice', values: (v: Vars) => [Number(v.target) + Number(v.off)] },
    },
    answer: (v: Vars) => `ნივთი A (${v.correct} ლარი)`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `ნივთი A (${v.correct} ლარი)`,
      `ნივთი B (${Number(v.target) - 8} ლარი)`,
      `ნივთი C (${Number(v.target) + 7} ლარი)`,
      `ნივთი D (${Number(v.target) + 12} ლარი)`,
    ],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.correct} ლარი დამრგვალებით არის ${vars.target} ლარი, ამიტომ სწორია ${answer}.`,
  }),

  // Q10 — ფასის დამრგვალება ასეულამდე ლარებში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-10', subtopicId: 'u11-rounding-money', difficulty: 2 }),
    prompt: 'ტელეფონი ღირს {price} ლარი. დაამრგვალე ეს თანხა უახლოეს ასეულამდე ლარებში:',
    variables: {
      h: { kind: 'int', min: 1, max: 7 },
      rem: { kind: 'choice', values: [15, 28, 35, 44, 58, 65, 78, 85] },
      price: { kind: 'choice', values: (v: Vars) => [Number(v.h) * 100 + Number(v.rem)] },
    },
    answer: (v: Vars) => Math.round(Number(v.price) / 100) * 100,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 100),
    explanation: ({ vars, answer }) =>
      `${vars.price} ლარი უახლოეს ასეულამდე დამრგვალებით არის ${answer} ლარი.`,
  }),

  // Q11 — ორი შენაძენის მიახლოებითი ჯამი (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-11', subtopicId: 'u11-rounding-money', difficulty: 3 }),
    prompt: 'მაისური ღირს {p1} ლარი, ხოლო ქუდი — {p2} ლარი. თითოეული ფასის ათეულამდე დამრგვალებით, სულ დაახლოებით რამდენი ლარი დაჯდება?',
    variables: {
      p1: { kind: 'choice', values: [18, 22, 27, 33, 38] },
      p2: { kind: 'choice', values: [12, 19, 23, 31, 42] },
    },
    answer: (v: Vars) => Math.round(Number(v.p1) / 10) * 10 + Math.round(Number(v.p2) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) => {
      const r1 = Math.round(Number(vars.p1) / 10) * 10;
      const r2 = Math.round(Number(vars.p2) / 10) * 10;
      return `${vars.p1} ≈ ${r1}, ${vars.p2} ≈ ${r2}. ჯამი: ${r1} + ${r2} = ${answer} ლარი.`;
    },
  }),

  // Q12 — მეტობით თუ ნაკლებობით დამრგვალება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u11-12', subtopicId: 'u11-rounding-money', difficulty: 3 }),
    prompt: 'თუ ნივთების ფასებია {p1} ლარი და {p2} ლარი, ათეულებამდე დამრგვალებული თანხა ზუსტ თანხაზე მეტი იქნება თუ ნაკლები?',
    variables: {
      type: { kind: 'choice', values: ['up', 'down'] },
      t1: { kind: 'int', min: 2, max: 4 },
      t2: { kind: 'int', min: 2, max: 4 },
      p1: { kind: 'choice', values: (v: Vars) => [v.type === 'up' ? Number(v.t1) * 10 + 7 : Number(v.t1) * 10 + 2] },
      p2: { kind: 'choice', values: (v: Vars) => [v.type === 'up' ? Number(v.t2) * 10 + 8 : Number(v.t2) * 10 + 3] },
    },
    answer: (v: Vars) => (v.type === 'up' ? 'მეტი' : 'ნაკლები'),
    format: { kind: 'text' },
    options: () => ['მეტი', 'ნაკლები', 'ზუსტად ტოლი', 'შეუძლებელია დადგენა'],
    optionCount: 4,
    explanation: ({ vars, answer }) => {
      const exact = Number(vars.p1) + Number(vars.p2);
      const r1 = Math.round(Number(vars.p1) / 10) * 10;
      const r2 = Math.round(Number(vars.p2) / 10) * 10;
      return `ზუსტი თანხაა ${exact} ლარი, ხოლო დამრგვალებული თანხაა ${r1} + ${r2} = ${r1 + r2} ლარი, რაც ${answer}ა.`;
    },
  }),

  // =========================================================================
  // U11.3 — შეკრება, გამოკლება, გამრავლება და გაყოფა ფულზე (Q13–Q18)
  // =========================================================================

  // Q13 — ფულის შეკრება (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-13', subtopicId: 'u11-money-operations', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} ლარი + {b} ლარი = ? (ჩაწერე მხოლოდ რიცხვი):',
    variables: {
      a: { kind: 'int', min: 15, max: 55 },
      b: { kind: 'int', min: 15, max: 40 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer} ლარი.`,
  }),

  // Q14 — ფულის გამოკლება (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-14', subtopicId: 'u11-money-operations', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} ლარი − {b} ლარი = ? (ჩაწერე მხოლოდ რიცხვი):',
    variables: {
      a: { kind: 'int', min: 40, max: 95 },
      b: { kind: 'int', min: 15, max: 35 },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer} ლარი.`,
  }),

  // Q15 — ფასის გამრავლება რაოდენობაზე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-15', subtopicId: 'u11-money-operations', difficulty: 2 }),
    prompt: '1 კგ ვაშლი ღირს {price} ლარი. რამდენი ლარი ეღირება {kg} კგ ვაშლი?',
    variables: {
      price: { kind: 'int', min: 2, max: 6 },
      kg: { kind: 'int', min: 3, max: 9 },
    },
    answer: (v: Vars) => Number(v.price) * Number(v.kg),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 3),
    explanation: ({ vars, answer }) =>
      `${vars.kg} × ${vars.price} = ${answer} ლარი.`,
  }),

  // Q16 — საერთო ღირებულების გაყოფა რაოდენობაზე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-16', subtopicId: 'u11-money-operations', difficulty: 2 }),
    prompt: '{count} ცალი ერთნაირი წიგნი სულ {total} ლარი ღირს. რამდენი ლარი ღირს 1 წიგნი?',
    variables: {
      count: { kind: 'choice', values: [2, 3, 4, 5, 6] },
      unit: { kind: 'int', min: 4, max: 12 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.count) * Number(v.unit)] },
    },
    answer: (v: Vars) => Number(v.unit),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.count} = ${answer} ლარი ღირს 1 წიგნი.`,
  }),

  // Q17 — კომბინირებული შენაძენის ღირებულება (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-17', subtopicId: 'u11-money-operations', difficulty: 3 }),
    prompt: 'სალომემ იყიდა {n} რვეული თითო {p} ლარად და 1 კალამი {pen} ლარად. სულ რამდენი ლარი გადაიხადა?',
    variables: {
      n: { kind: 'choice', values: [2, 3, 4, 5] },
      p: { kind: 'int', min: 2, max: 5 },
      pen: { kind: 'int', min: 3, max: 8 },
    },
    answer: (v: Vars) => Number(v.n) * Number(v.p) + Number(v.pen),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 2),
    explanation: ({ vars, answer }) => {
      const noteCost = Number(vars.n) * Number(vars.p);
      return `რვეულები: ${vars.n} × ${vars.p} = ${noteCost} ლარი. სულ: ${noteCost} + ${vars.pen} = ${answer} ლარი.`;
    },
  }),

  // Q18 — ხურდის გამოთვლა მსხვილი კუპიურიდან (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-18', subtopicId: 'u11-money-operations', difficulty: 3 }),
    prompt: 'გიორგიმ იყიდა {cost} ლარის პროდუქტები და მოლარეს მისცა {bill}-ლარიანი კუპიურა. რამდენი ლარი უნდა დაუბრუნოს მოლარემ ხურდა?',
    variables: {
      bill: { kind: 'choice', values: [50, 100] },
      cost: { kind: 'choice', values: (v: Vars) => [Number(v.bill) === 50 ? 28 : 64] },
      offset: { kind: 'choice', values: [-6, -4, -2, 2, 4, 6] },
      actualCost: { kind: 'choice', values: (v: Vars) => [Number(v.cost) + Number(v.offset)] },
    },
    answer: (v: Vars) => Number(v.bill) - Number(v.actualCost),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) =>
      `${vars.bill} − ${vars.actualCost} = ${answer} ლარი ხურდა.`,
  }),

  // =========================================================================
  // U11.4 — საკმარისი თანხა და ფასების შედარება (Q19–Q24)
  // =========================================================================

  // Q19 — ეყოფა თუ არა თანხა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u11-19', subtopicId: 'u11-sufficient-funds-shopping', difficulty: 1 }),
    prompt: 'ნივთი ღირს {cost} ლარი. ნინოს აქვს {have} ლარი. ეყოფა თუ არა მას ეს თანხა ნივთის საყიდლად?',
    variables: {
      cost: { kind: 'int', min: 20, max: 60 },
      diff: { kind: 'choice', values: [-8, -5, -3, 3, 5, 8] },
      have: { kind: 'choice', values: (v: Vars) => [Number(v.cost) + Number(v.diff)] },
    },
    answer: (v: Vars) => (Number(v.have) >= Number(v.cost) ? 'კი, ეყოფა' : 'არა, არ ეყოფა'),
    format: { kind: 'text' },
    options: () => ['კი, ეყოფა', 'არა, არ ეყოფა', 'ზუსტად ნახევარია', 'შეუძლებელია დადგენა'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `ნინოს აქვს ${vars.have} ლარი, ნივთი ღირს ${vars.cost} ლარი. ${Number(vars.have) >= Number(vars.cost) ? `${vars.have} ≥ ${vars.cost}` : `${vars.have} < ${vars.cost}`}, ამიტომ პასუხია: ${answer}.`,
  }),

  // Q20 — ნაშთი ყიდვის შემდეგ (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-20', subtopicId: 'u11-sufficient-funds-shopping', difficulty: 1 }),
    prompt: 'დათოს ჰქონდა {have} ლარი. მან იყიდა ბურთი {cost} ლარად. რამდენი ლარი დარჩა?',
    variables: {
      have: { kind: 'int', min: 40, max: 90 },
      cost: { kind: 'int', min: 15, max: 35 },
    },
    answer: (v: Vars) => Number(v.have) - Number(v.cost),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) =>
      `${vars.have} − ${vars.cost} = ${answer} ლარი დარჩა.`,
  }),

  // Q21 — რამდენი ლარი აკლია (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-21', subtopicId: 'u11-sufficient-funds-shopping', difficulty: 2 }),
    prompt: 'ველოსიპედი ღირს {price} ლარი. ლუკას აქვს {have} ლარი. კიდევ რამდენი ლარი სჭირდება ველოსიპედის საყიდლად?',
    variables: {
      price: { kind: 'int', min: 120, max: 250 },
      diff: { kind: 'choice', values: [25, 35, 45, 55, 65, 75, 85] },
      have: { kind: 'choice', values: (v: Vars) => [Number(v.price) - Number(v.diff)] },
    },
    answer: (v: Vars) => Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 10),
    explanation: ({ vars, answer }) =>
      `${vars.price} − ${vars.have} = ${answer} ლარი სჭირდება კიდევ.`,
  }),

  // Q22 — ფასების შედარება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u11-22', subtopicId: 'u11-sufficient-funds-shopping', difficulty: 2 }),
    prompt: 'ზურგჩანთა ღირს {p1} ლარი, ხოლო ქურთუკი — {p2} ლარი. რომელია უფრო ძვირი და რამდენით?',
    variables: {
      p1: { kind: 'int', min: 40, max: 70 },
      diff: { kind: 'int', min: 5, max: 20 },
      p2: { kind: 'choice', values: (v: Vars) => [Number(v.p1) + Number(v.diff)] },
    },
    answer: (v: Vars) => `ქურთუკი, ${v.diff} ლარით`,
    format: { kind: 'text' },
    options: (v: Vars) => {
      const d = Number(v.diff);
      return [
        `ქურთუკი, ${d} ლარით`,
        `ზურგჩანთა, ${d} ლარით`,
        `ქურთუკი, ${d + 5} ლარით`,
        `ზურგჩანთა, ${d + 5} ლარით`,
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.p2} − ${vars.p1} = ${vars.diff} ლარით ძვირია ქურთუკი (${answer}).`,
  }),

  // Q23 — ორი ნივთის ყიდვა ბიუჯეტით (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u11-23', subtopicId: 'u11-sufficient-funds-shopping', difficulty: 3 }),
    prompt: 'სანდროს აქვს {budget} ლარი. მას სურს იყიდოს წიგნი ({p1} ლარი) და სათამაშო ({p2} ლარი). ეყოფა თუ არა თანხა ორივე ნივთისთვის?',
    variables: {
      p1: { kind: 'int', min: 15, max: 35 },
      p2: { kind: 'int', min: 15, max: 35 },
      diff: { kind: 'choice', values: [-10, -5, 5, 10] },
      budget: { kind: 'choice', values: (v: Vars) => [Number(v.p1) + Number(v.p2) + Number(v.diff)] },
    },
    answer: (v: Vars) => (Number(v.budget) >= Number(v.p1) + Number(v.p2) ? 'კი, ეყოფა' : 'არა, არ ეყოფა'),
    format: { kind: 'text' },
    options: () => ['კი, ეყოფა', 'არა, არ ეყოფა', 'ზუსტად ნახევარია', 'შეუძლებელია დადგენა'],
    optionCount: 4,
    explanation: ({ vars, answer }) => {
      const tot = Number(vars.p1) + Number(vars.p2);
      return `ორივე ნივთი ჯამში ღირს ${vars.p1} + ${vars.p2} = ${tot} ლარი. ბიუჯეტია ${vars.budget} ლარი. პასუხი: ${answer}.`;
    },
  }),

  // Q24 — ორი ნივთის ყიდვის შემდეგ დარჩენილი თანხა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-24', subtopicId: 'u11-sufficient-funds-shopping', difficulty: 3 }),
    prompt: 'ანას ჰქონდა {bill} ლარი. მან იყიდა {p1} ლარის ხილი და {p2} ლარის ტკბილეული. რამდენი ლარი დარჩა?',
    variables: {
      bill: { kind: 'choice', values: [50, 100] },
      p1: { kind: 'int', min: 10, max: 20 },
      p2: { kind: 'int', min: 10, max: 20 },
    },
    answer: (v: Vars) => Number(v.bill) - (Number(v.p1) + Number(v.p2)),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) => {
      const spent = Number(vars.p1) + Number(vars.p2);
      return `დაიხარჯა: ${vars.p1} + ${vars.p2} = ${spent} ლარი. დარჩა: ${vars.bill} − ${spent} = ${answer} ლარი.`;
    },
  }),

  // =========================================================================
  // U11.5 — ტექსტური ამოცანები ფულზე (Q25–Q30)
  // =========================================================================

  // Q25 — თანხის დაგროვება ყოველდღიურად (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-25', subtopicId: 'u11-money-word-problems', difficulty: 1 }),
    prompt: 'ნიკა ყოველდღე ყულაბაში აგროვებს {daily} ლარს. რამდენ ლარს შეაგროვებს იგი {days} დღეში?',
    variables: {
      daily: { kind: 'choice', values: [2, 3, 4, 5] },
      days: { kind: 'int', min: 4, max: 10 },
    },
    answer: (v: Vars) => Number(v.daily) * Number(v.days),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 4),
    explanation: ({ vars, answer }) =>
      `${vars.days} დღეში შეაგროვებს ${vars.days} × ${vars.daily} = ${answer} ლარს.`,
  }),

  // Q26 — თანხის თანაბრად გაყოფა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-26', subtopicId: 'u11-money-word-problems', difficulty: 1 }),
    prompt: '{total} ლარი თანაბრად გაუნაწილეს {kids} ბავშვს. რამდენი ლარი ერგო თითოეულს?',
    variables: {
      kids: { kind: 'choice', values: [2, 3, 4, 5] },
      each: { kind: 'int', min: 5, max: 15 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.kids) * Number(v.each)] },
    },
    answer: (v: Vars) => Number(v.each),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.kids} = ${answer} ლარი თითოეულს.`,
  }),

  // Q27 — მრავალელემენტიანი შენაძენის გამოთვლა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-27', subtopicId: 'u11-money-word-problems', difficulty: 2 }),
    prompt: '1 კალამი ღირს {p1} ლარი, ხოლო 1 რვეული — {p2} ლარი. რა ეღირება {k1} კალამი და {k2} რვეული ერთად?',
    variables: {
      p1: { kind: 'choice', values: [2, 3] },
      p2: { kind: 'choice', values: [3, 4] },
      k1: { kind: 'int', min: 2, max: 4 },
      k2: { kind: 'int', min: 2, max: 4 },
    },
    answer: (v: Vars) => Number(v.k1) * Number(v.p1) + Number(v.k2) * Number(v.p2),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 2),
    explanation: ({ vars, answer }) => {
      const c1 = Number(vars.k1) * Number(vars.p1);
      const c2 = Number(vars.k2) * Number(vars.p2);
      return `${vars.k1} კალამი: ${c1} ლარი, ${vars.k2} რვეული: ${c2} ლარი. სულ: ${c1} + ${c2} = ${answer} ლარი.`;
    },
  }),

  // Q28 — თავდაპირველი თანხის პოვნა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-28', subtopicId: 'u11-money-word-problems', difficulty: 2 }),
    prompt: 'თინიკომ იყიდა თოჯინა {spent} ლარად და დარჩა {left} ლარი. რამდენი ლარი ჰქონდა თინიკოს თავდაპირველად?',
    variables: {
      spent: { kind: 'int', min: 15, max: 45 },
      left: { kind: 'int', min: 10, max: 35 },
    },
    answer: (v: Vars) => Number(v.spent) + Number(v.left),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) =>
      `${vars.spent} + ${vars.left} = ${answer} ლარი ჰქონდა თავდაპირველად.`,
  }),

  // Q29 — შემოსავლისა და ხარჯის ბალანსი (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u11-29', subtopicId: 'u11-money-word-problems', difficulty: 3 }),
    prompt: 'მარიამს ჰქონდა {have} ლარი. დაბადების დღეზე აჩუქეს {gift} ლარი, შემდეგ კი მან იყიდა წიგნი {spent} ლარად. რამდენი ლარი აქვს ახლა?',
    variables: {
      have: { kind: 'int', min: 20, max: 50 },
      gift: { kind: 'choice', values: [20, 30, 40, 50] },
      spent: { kind: 'int', min: 15, max: 35 },
    },
    answer: (v: Vars) => Number(v.have) + Number(v.gift) - Number(v.spent),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) =>
      `${vars.have} + ${vars.gift} − ${vars.spent} = ${answer} ლარი.`,
  }),

  // Q30 — ზუსტი ბიუჯეტით ნივთების შერჩევა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u11-30', subtopicId: 'u11-money-word-problems', difficulty: 3 }),
    prompt: 'გიორგის აქვს ზუსტად {budget} ლარი. რომელი ორი ნივთის ყიდვა შეუძლია მას ისე, რომ თანხა ზუსტად დაეხარჯოს?',
    variables: {
      budget: { kind: 'choice', values: [30, 40, 50, 60] },
      p1: { kind: 'choice', values: [12, 14, 16, 18, 22] },
      p2: { kind: 'choice', values: (v: Vars) => [Number(v.budget) - Number(v.p1)] },
    },
    answer: (v: Vars) => `ნივთი A (${v.p1} ლარი) და ნივთი B (${v.p2} ლარი)`,
    format: { kind: 'text' },
    options: (v: Vars) => {
      const p1 = Number(v.p1);
      const p2 = Number(v.p2);
      return [
        `ნივთი A (${p1} ლარი) და ნივთი B (${p2} ლარი)`,
        `ნივთი A (${p1} ლარი) და ნივთი C (${p2 + 5} ლარი)`,
        `ნივთი B (${p2} ლარი) და ნივთი D (${p1 - 4} ლარი)`,
        `ნივთი C (${p2 + 5} ლარი) და ნივთი D (${p1 + 5} ლარი)`,
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.p1} + ${vars.p2} = ${vars.budget} ლარი, ამიტომ სწორია: ${answer}.`,
  }),
];
