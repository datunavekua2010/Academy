import { defineTemplate, QuestionTemplate } from './types';

/**
 * Grade 3 — Unit 09: დამრგვალება და მიახლოება (Rounding & Approximation)
 *
 * Covers 3 subtopics (24 templates total: Q01–Q24, 8 per subtopic):
 *   U09.1 — დამრგვალება ათეულებამდე, ასეულებამდე და ათასეულებამდე (u09-rounding-tens-hundreds-thousands)
 *   U09.2 — ტექსტური ამოცანები დამრგვალებაზე (u09-word-problems-rounding)
 *   U09.3 — მიახლოებითი ჯამი, სხვაობა, ნამრავლი და განაყოფი (u09-approximate-operations)
 */

export const G3_U09_SUBTOPICS = [
  'u09-rounding-tens-hundreds-thousands',
  'u09-word-problems-rounding',
  'u09-approximate-operations',
] as const;

export type G3U09SubtopicId = (typeof G3_U09_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G3U09SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 3 as const,
  topicId: 'g3-damrgvaleba' as const,
  unitId: 'g3-damrgvaleba' as const,
  ...options,
});

type Vars = Record<string, string | number>;

export const roundNearest = (n: number, step: number): number => Math.round(n / step) * step;

export function nearMisses(answer: number, count = 3, min = 0, step = 10): number[] {
  const result = new Set<number>();
  const deltas = [step, -step, 2 * step, -2 * step, 3 * step, -3 * step, 5, -5];
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

export const G3_U09_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U09.1 — დამრგვალება ათეულებამდე, ასეულებამდე და ათასეულებამდე (Q01–Q08)
  // =========================================================================

  // Q01 — ორნიშნა რიცხვის დამრგვალება ათეულამდე (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u09-01', subtopicId: 'u09-rounding-tens-hundreds-thousands', difficulty: 1 }),
    prompt: 'დაამრგვალე {n} უახლოეს ათეულამდე:',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      d: { kind: 'choice', values: [1, 2, 3, 4, 6, 7, 8, 9] },
      n: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.d)] },
    },
    answer: (v: Vars) => Math.round(Number(v.n) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) => {
      const d = Number(vars.d);
      const direction = d >= 5 ? 'მეტობით (ზემოთ)' : 'ნაკლებობით (ქვემოთ)';
      return `რიცხვის ბოლო ციფრია ${d}, ამიტომ ვამრგვალებთ ${direction} და ვიღებთ ${answer}-ს.`;
    },
  }),

  // Q02 — რომელი რიცხვი მრგვალდება მოცემულ ათეულამდე (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u09-02', subtopicId: 'u09-rounding-tens-hundreds-thousands', difficulty: 1 }),
    prompt: 'ჩამოთვლილთაგან რომელი რიცხვი მრგვალდება {target}-მდე უახლოეს ათეულამდე დამრგვალებით?',
    variables: {
      t: { kind: 'int', min: 2, max: 8 },
      target: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10] },
      offset: { kind: 'choice', values: [-4, -3, -2, -1, 1, 2, 3, 4] },
      correct: { kind: 'choice', values: (v: Vars) => [Number(v.target) + Number(v.offset)] },
    },
    answer: (v: Vars) => String(v.correct),
    format: { kind: 'text' },
    options: (v: Vars) => [
      String(v.correct),
      String(Number(v.target) - 8),
      String(Number(v.target) + 8),
      String(Number(v.target) + 14),
    ],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${answer} უახლოეს ათეულამდე დამრგვალებით არის ${vars.target}, რადგან მისი მანძილი ${vars.target}-მდე 5-ზე ნაკლებია.`,
  }),

  // Q03 — სამნიშნა რიცხვის დამრგვალება ასეულამდე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u09-03', subtopicId: 'u09-rounding-tens-hundreds-thousands', difficulty: 2 }),
    prompt: 'დაამრგვალე {n} უახლოეს ასეულამდე:',
    variables: {
      h: { kind: 'int', min: 1, max: 8 },
      rem: { kind: 'choice', values: [15, 28, 37, 45, 55, 63, 78, 89] },
      n: { kind: 'choice', values: (v: Vars) => [Number(v.h) * 100 + Number(v.rem)] },
    },
    answer: (v: Vars) => Math.round(Number(v.n) / 100) * 100,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 100),
    explanation: ({ vars, answer }) => {
      const rem = Number(vars.rem);
      const dir = rem >= 50 ? 'მეტობით' : 'ნაკლებობით';
      return `${vars.n}-ში ათეულების ნაწილია ${rem}. რადგან ${rem} ${rem >= 50 ? '≥ 50' : '< 50'}, ვამრგვალებთ ${dir} ${answer}-მდე.`;
    },
  }),

  // Q04 — სამნიშნა რიცხვის დამრგვალება ათეულამდე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u09-04', subtopicId: 'u09-rounding-tens-hundreds-thousands', difficulty: 2 }),
    prompt: 'დაამრგვალე {n} უახლოეს ათეულამდე:',
    variables: {
      h: { kind: 'int', min: 1, max: 7 },
      t: { kind: 'int', min: 1, max: 8 },
      d: { kind: 'choice', values: [1, 2, 3, 4, 6, 7, 8, 9] },
      n: { kind: 'choice', values: (v: Vars) => [Number(v.h) * 100 + Number(v.t) * 10 + Number(v.d)] },
    },
    answer: (v: Vars) => Math.round(Number(v.n) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) =>
      `${vars.n}-ის ბოლო ციფრია ${vars.d}. შესაბამისად, უახლოეს ათეულამდე დამრგვალებით მივიღებთ ${answer}-ს.`,
  }),

  // Q05 — 5-ით დაბოლოებული რიცხვის დამრგვალების წესი (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u09-05', subtopicId: 'u09-rounding-tens-hundreds-thousands', difficulty: 2 }),
    prompt: 'როდესაც რიცხვი ბოლოვდება 5-ით (მაგალითად, {n}), როგორ ვამრგვალებთ მას უახლოეს ათეულამდე?',
    variables: {
      h: { kind: 'choice', values: [0, 1, 2, 3, 4] },
      t: { kind: 'int', min: 1, max: 8 },
      n: { kind: 'choice', values: (v: Vars) => [Number(v.h) > 0 ? Number(v.h) * 100 + Number(v.t) * 10 + 5 : Number(v.t) * 10 + 5] },
      upper: { kind: 'choice', values: (v: Vars) => [Math.round(Number(v.n) / 10) * 10] },
      lower: { kind: 'choice', values: (v: Vars) => [Math.floor(Number(v.n) / 10) * 10] },
    },
    answer: (v: Vars) => `მეტობით (ზემოთ, ${v.upper}-მდე)`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `მეტობით (ზემოთ, ${v.upper}-მდე)`,
      `ნაკლებობით (ქვემოთ, ${v.lower}-მდე)`,
      'არ მრგვალდება, რადგან ზუსტად შუაშია',
      `ყოველთვის მრგვალდება 0-მდე`,
    ],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `მათემატიკური წესით, როდესაც გასამრგვალებელი ციფრი არის 5, ვამრგვალებთ ${answer}.`,
  }),

  // Q06 — ოთხნიშნა რიცხვის დამრგვალება ათასეულამდე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u09-06', subtopicId: 'u09-rounding-tens-hundreds-thousands', difficulty: 2 }),
    prompt: 'დაამრგვალე {n} უახლოეს ათასეულამდე:',
    variables: {
      th: { kind: 'int', min: 1, max: 8 },
      h: { kind: 'choice', values: [1, 2, 3, 4, 6, 7, 8, 9] },
      tens: { kind: 'choice', values: [20, 50, 70] },
      n: { kind: 'choice', values: (v: Vars) => [Number(v.th) * 1000 + Number(v.h) * 100 + Number(v.tens)] },
    },
    answer: (v: Vars) => Math.round(Number(v.n) / 1000) * 1000,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 1000),
    explanation: ({ vars, answer }) => {
      const h = Number(vars.h);
      return `${vars.n}-ში ასეულების ციფრია ${h}. რადგან ${h} ${h >= 5 ? '≥ 5' : '< 5'}, დამრგვალებით მიიღება ${answer}.`;
    },
  }),

  // Q07 — უმცირესი რიცხვი, რომელიც მრგვალდება სამიზნემდე (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u09-07', subtopicId: 'u09-rounding-tens-hundreds-thousands', difficulty: 3 }),
    prompt: 'რა არის უმცირესი რიცხვი, რომელიც უახლოეს ათეულამდე დამრგვალებით იძლევა {target}-ს?',
    variables: {
      t: { kind: 'int', min: 2, max: 19 },
      target: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10] },
    },
    answer: (v: Vars) => Number(v.target) - 5,
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars, answer }) => {
      const t = Number(vars.target);
      return [Number(answer) + 1, t - 10, t - 1];
    },
    explanation: ({ vars, answer }) =>
      `${answer}-დან ${Number(vars.target) + 4}-მდე ყველა რიცხვი მრგვალდება ${vars.target}-მდე. მათ შორის უმცირესია ${answer}.`,
  }),

  // Q08 — უდიდესი რიცხვი, რომელიც მრგვალდება სამიზნემდე (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u09-08', subtopicId: 'u09-rounding-tens-hundreds-thousands', difficulty: 3 }),
    prompt: 'რა არის უდიდესი რიცხვი, რომელიც უახლოეს ათეულამდე დამრგვალებით იძლევა {target}-ს?',
    variables: {
      t: { kind: 'int', min: 2, max: 19 },
      target: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10] },
    },
    answer: (v: Vars) => Number(v.target) + 4,
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars, answer }) => {
      const t = Number(vars.target);
      return [t + 5, t + 1, Number(answer) - 1];
    },
    explanation: ({ vars, answer }) =>
      `${Number(vars.target) - 5}-დან ${answer}-მდე ყველა რიცხვი მრგვალდება ${vars.target}-მდე. მათ შორის უდიდესია ${answer}.`,
  }),

  // =========================================================================
  // U09.2 — ტექსტური ამოცანები დამრგვალებაზე (Q09–Q16)
  // =========================================================================

  // Q09 — ნივთის ფასის დამრგვალება ათეულამდე ლარებში (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u09-09', subtopicId: 'u09-word-problems-rounding', difficulty: 1 }),
    prompt: '{item} ღირს {price} ლარი. დაამრგვალე ფასი უახლოეს ათეულამდე ლარებში:',
    variables: {
      item: { kind: 'choice', values: ['წიგნი', 'სათამაშო', 'ზურგჩანთა', 'ბურთი'] },
      t: { kind: 'int', min: 2, max: 8 },
      d: { kind: 'choice', values: [1, 2, 3, 4, 6, 7, 8, 9] },
      price: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.d)] },
    },
    answer: (v: Vars) => Math.round(Number(v.price) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) =>
      `${vars.item} ღირს ${vars.price} ლარი. უახლოეს ათეულამდე დამრგვალებით ფასია ${answer} ლარი.`,
  }),

  // Q10 — მანძილის დამრგვალება ასეულამდე მეტრებში (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u09-10', subtopicId: 'u09-word-problems-rounding', difficulty: 1 }),
    prompt: '{person}-მ გაირბინა {dist} მეტრი. უახლოეს ასეულამდე დამრგვალებით რამდენ მეტრთანაა ეს მანძილი უფრო ახლოს?',
    variables: {
      person: { kind: 'choice', values: ['სანდრო', 'გიორგი', 'ნიკა', 'დავითი'] },
      h: { kind: 'int', min: 2, max: 7 },
      rem: { kind: 'choice', values: [18, 32, 45, 65, 78, 85] },
      dist: { kind: 'choice', values: (v: Vars) => [Number(v.h) * 100 + Number(v.rem)] },
      rounded: { kind: 'choice', values: (v: Vars) => [Math.round(Number(v.dist) / 100) * 100] },
    },
    answer: (v: Vars) => `${v.rounded} მეტრი`,
    format: { kind: 'text' },
    options: (v: Vars) => {
      const r = Number(v.rounded);
      return [
        `${r} მეტრი`,
        `${r - 100} მეტრი`,
        `${r + 100} მეტრი`,
        `${r + 50} მეტრი`,
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.dist} მეტრი უახლოეს ასეულამდე დამრგვალებით არის ${answer}.`,
  }),

  // Q11 — გვერდების რაოდენობის დამრგვალება ასეულამდე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u09-11', subtopicId: 'u09-word-problems-rounding', difficulty: 2 }),
    prompt: 'საბავშვო წიგნში {pages} გვერდია. რამდენი გვერდია წიგნში უახლოეს ასეულამდე დამრგვალებით?',
    variables: {
      h: { kind: 'int', min: 1, max: 6 },
      rem: { kind: 'choice', values: [18, 25, 36, 44, 58, 67, 75, 84] },
      pages: { kind: 'choice', values: (v: Vars) => [Number(v.h) * 100 + Number(v.rem)] },
    },
    answer: (v: Vars) => Math.round(Number(v.pages) / 100) * 100,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 100),
    explanation: ({ vars, answer }) =>
      `${vars.pages} უახლოეს ასეულამდე დამრგვალებით არის ${answer}.`,
  }),

  // Q12 — წონის დამრგვალება ათეულამდე კილოგრამებში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u09-12', subtopicId: 'u09-word-problems-rounding', difficulty: 2 }),
    prompt: 'ტომარა კარტოფილი იწონის {weight} კგ-ს. დაამრგვალე ეს წონა უახლოეს ათეულამდე კილოგრამებში:',
    variables: {
      t: { kind: 'int', min: 2, max: 7 },
      d: { kind: 'choice', values: [2, 3, 4, 5, 6, 7, 8] },
      weight: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.d)] },
    },
    answer: (v: Vars) => Math.round(Number(v.weight) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) =>
      `${vars.weight} კგ უახლოეს ათეულამდე დამრგვალებით არის ${answer} კგ.`,
  }),

  // Q13 — მაყურებელთა რაოდენობის დამრგვალება ათასეულამდე (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u09-13', subtopicId: 'u09-word-problems-rounding', difficulty: 2 }),
    prompt: 'სტადიონზე მატჩს ესწრებოდა {att} მაყურებელი. უახლოეს ათასეულამდე დამრგვალებით ეს არის:',
    variables: {
      th: { kind: 'int', min: 2, max: 7 },
      rem: { kind: 'choice', values: [150, 320, 480, 620, 750, 890] },
      att: { kind: 'choice', values: (v: Vars) => [Number(v.th) * 1000 + Number(v.rem)] },
      rounded: { kind: 'choice', values: (v: Vars) => [Math.round(Number(v.att) / 1000) * 1000] },
    },
    answer: (v: Vars) => `${v.rounded} მაყურებელი`,
    format: { kind: 'text' },
    options: (v: Vars) => {
      const r = Number(v.rounded);
      return [
        `${r} მაყურებელი`,
        `${r - 1000} მაყურებელი`,
        `${r + 1000} მაყურებელი`,
        `${r + 500} მაყურებელი`,
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.att} უახლოეს ათასეულამდე დამრგვალებით შეადგენს ${answer}-ს.`,
  }),

  // Q14 — რომელი ნივთის ფასი მრგვალდება სამიზნემდე (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u09-14', subtopicId: 'u09-word-problems-rounding', difficulty: 2 }),
    prompt: 'მაღაზიაში ნივთების ფასებია ჩამოთვლილი. რომელი ნივთის ფასი მრგვალდება {target} ლარამდე (უახლოეს ათეულამდე)?',
    variables: {
      target: { kind: 'choice', values: [30, 40, 50, 60, 70, 80] },
      offset: { kind: 'choice', values: [-4, -3, -2, 2, 3, 4] },
      correct: { kind: 'choice', values: (v: Vars) => [Number(v.target) + Number(v.offset)] },
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
      `${vars.correct} ლარი უახლოეს ათეულამდე დამრგვალებით იძლევა ${vars.target} ლარს, ამიტომ სწორია ${answer}.`,
  }),

  // Q15 — ორი შენაძენის მიახლოებითი ჯამი ათეულებამდე (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u09-15', subtopicId: 'u09-word-problems-rounding', difficulty: 3 }),
    prompt: 'მარიამმა იყიდა კალამი {p1} ლარად და რვეული {p2} ლარად. თითოეული ფასის ათეულამდე დამრგვალებით, სულ დაახლოებით რამდენი ლარი გადაიხადა?',
    variables: {
      p1: { kind: 'choice', values: [12, 14, 18, 21, 23, 27] },
      p2: { kind: 'choice', values: [31, 33, 38, 42, 44, 49] },
    },
    answer: (v: Vars) => Math.round(Number(v.p1) / 10) * 10 + Math.round(Number(v.p2) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) => {
      const r1 = Math.round(Number(vars.p1) / 10) * 10;
      const r2 = Math.round(Number(vars.p2) / 10) * 10;
      return `${vars.p1} ≈ ${r1}, ხოლო ${vars.p2} ≈ ${r2}. ჯამი: ${r1} + ${r2} = ${answer} ლარი.`;
    },
  }),

  // Q16 — შეფასების შედარება: მიახლოებითი ჯამი მეტია თუ ნაკლები ზუსტ ჯამზე? (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u09-16', subtopicId: 'u09-word-problems-rounding', difficulty: 3 }),
    prompt: 'ორი ნივთის ფასებია {p1} ლარი და {p2} ლარი. თუ ორივე ფასს ათეულებამდე დავამრგვალებთ, მიახლოებითი ჯამი ზუსტ ჯამზე მეტი იქნება თუ ნაკლები?',
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
      const p1 = Number(vars.p1);
      const p2 = Number(vars.p2);
      const exact = p1 + p2;
      const r1 = Math.round(p1 / 10) * 10;
      const r2 = Math.round(p2 / 10) * 10;
      const roundedSum = r1 + r2;
      return `ზუსტი ჯამია ${exact}, ხოლო დამრგვალებული ჯამია ${r1} + ${r2} = ${roundedSum}. შესაბამისად, მიახლოებითი ჯამი არის ${answer}.`;
    },
  }),

  // =========================================================================
  // U09.3 — მიახლოებითი ჯამი, სხვაობა, ნამრავლი და განაყოფი (Q17–Q24)
  // =========================================================================

  // Q17 — ორნიშნა რიცხვების მიახლოებითი ჯამი (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u09-17', subtopicId: 'u09-approximate-operations', difficulty: 1 }),
    prompt: 'დაამრგვალე {a} და {b} ათეულებამდე და იპოვე მათი მიახლოებითი ჯამი:',
    variables: {
      a: { kind: 'choice', values: [21, 23, 28, 32, 37, 43, 48, 52] },
      b: { kind: 'choice', values: [17, 22, 29, 31, 38, 41, 47] },
    },
    answer: (v: Vars) => Math.round(Number(v.a) / 10) * 10 + Math.round(Number(v.b) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 10) * 10;
      const rb = Math.round(Number(vars.b) / 10) * 10;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}. მიახლოებითი ჯამია: ${ra} + ${rb} = ${answer}.`;
    },
  }),

  // Q18 — ორნიშნა რიცხვების მიახლოებითი სხვაობა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u09-18', subtopicId: 'u09-approximate-operations', difficulty: 1 }),
    prompt: 'დაამრგვალე {a} და {b} ათეულებამდე და იპოვე მათი მიახლოებითი სხვაობა ({a} − {b}):',
    variables: {
      a: { kind: 'choice', values: [61, 68, 72, 79, 83, 87, 92] },
      b: { kind: 'choice', values: [19, 23, 28, 32, 39, 44] },
    },
    answer: (v: Vars) => Math.round(Number(v.a) / 10) * 10 - Math.round(Number(v.b) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 10) * 10;
      const rb = Math.round(Number(vars.b) / 10) * 10;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}. მიახლოებითი სხვაობაა: ${ra} − ${rb} = ${answer}.`;
    },
  }),

  // Q19 — სამნიშნა რიცხვების მიახლოებითი ჯამი ასეულებამდე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u09-19', subtopicId: 'u09-approximate-operations', difficulty: 2 }),
    prompt: 'დაამრგვალე {a} და {b} ასეულებამდე და გამოთვალე მათი მიახლოებითი ჯამი:',
    variables: {
      h1: { kind: 'int', min: 1, max: 4 },
      r1: { kind: 'choice', values: [18, 35, 62, 85] },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.h1) * 100 + Number(v.r1)] },
      h2: { kind: 'int', min: 1, max: 4 },
      r2: { kind: 'choice', values: [25, 45, 75, 92] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.h2) * 100 + Number(v.r2)] },
    },
    answer: (v: Vars) => Math.round(Number(v.a) / 100) * 100 + Math.round(Number(v.b) / 100) * 100,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 100),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 100) * 100;
      const rb = Math.round(Number(vars.b) / 100) * 100;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}. ჯამი: ${ra} + ${rb} = ${answer}.`;
    },
  }),

  // Q20 — სამნიშნა რიცხვების მიახლოებითი სხვაობა ასეულებამდე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u09-20', subtopicId: 'u09-approximate-operations', difficulty: 2 }),
    prompt: 'დაამრგვალე {a} და {b} ასეულებამდე და გამოთვალე მათი მიახლოებითი სხვაობა ({a} − {b}):',
    variables: {
      h1: { kind: 'int', min: 5, max: 8 },
      r1: { kind: 'choice', values: [22, 38, 71, 89] },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.h1) * 100 + Number(v.r1)] },
      h2: { kind: 'int', min: 1, max: 4 },
      r2: { kind: 'choice', values: [15, 42, 65, 82] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.h2) * 100 + Number(v.r2)] },
    },
    answer: (v: Vars) => Math.round(Number(v.a) / 100) * 100 - Math.round(Number(v.b) / 100) * 100,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 100),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 100) * 100;
      const rb = Math.round(Number(vars.b) / 100) * 100;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}. სხვაობა: ${ra} − ${rb} = ${answer}.`;
    },
  }),

  // Q21 — მიახლოებითი გამრავლება (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u09-21', subtopicId: 'u09-approximate-operations', difficulty: 2 }),
    prompt: 'დაამრგვალე {a} უახლოეს ათეულამდე და იპოვე მიახლოებითი ნამრავლი: {m} × {a}:',
    variables: {
      m: { kind: 'choice', values: [2, 3, 4, 5] },
      t: { kind: 'int', min: 2, max: 6 },
      d: { kind: 'choice', values: [1, 2, 8, 9] },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.t) * 10 + Number(v.d)] },
    },
    answer: (v: Vars) => Number(v.m) * (Math.round(Number(v.a) / 10) * 10),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars, answer }) => {
      const m = Number(vars.m);
      const step = m * 10;
      return nearMisses(Number(answer), 3, 0, step);
    },
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 10) * 10;
      return `${vars.a} დამრგვალებით არის ${ra}. ${vars.m} × ${ra} = ${answer}.`;
    },
  }),

  // Q22 — მიახლოებითი გაყოფა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u09-22', subtopicId: 'u09-approximate-operations', difficulty: 2 }),
    prompt: 'დაამრგვალე გასაყოფი ({dividend}) უახლოეს ათეულამდე და გამოთვალე მიახლოებითი განაყოფი: {dividend} ÷ {divisor}:',
    variables: {
      divisor: { kind: 'choice', values: [2, 3, 4, 5] },
      quotient: { kind: 'choice', values: [10, 20, 30, 40] },
      offset: { kind: 'choice', values: [-2, -1, 1, 2] },
      dividend: { kind: 'choice', values: (v: Vars) => [Number(v.divisor) * Number(v.quotient) + Number(v.offset)] },
    },
    answer: (v: Vars) => Number(v.quotient),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) => {
      const rDiv = Math.round(Number(vars.dividend) / 10) * 10;
      return `${vars.dividend} ≈ ${rDiv}. ${rDiv} ÷ ${vars.divisor} = ${answer}.`;
    },
  }),

  // Q23 — საუკეთესო მიახლოების გამოსახულება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u09-23', subtopicId: 'u09-approximate-operations', difficulty: 3 }),
    prompt: 'რომელი გამოსახულება გამოსახავს {a} + {b} ჯამის საუკეთესო მიახლოებას ათეულებამდე დამრგვალებით?',
    variables: {
      t1: { kind: 'int', min: 2, max: 5 },
      d1: { kind: 'choice', values: [1, 2, 8, 9] },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.t1) * 10 + Number(v.d1)] },
      t2: { kind: 'int', min: 2, max: 4 },
      d2: { kind: 'choice', values: [1, 2, 8, 9] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.t2) * 10 + Number(v.d2)] },
    },
    answer: (v: Vars) => {
      const ra = Math.round(Number(v.a) / 10) * 10;
      const rb = Math.round(Number(v.b) / 10) * 10;
      return `${ra} + ${rb} = ${ra + rb}`;
    },
    format: { kind: 'text' },
    options: (v: Vars) => {
      const ra = Math.round(Number(v.a) / 10) * 10;
      const rb = Math.round(Number(v.b) / 10) * 10;
      return [
        `${ra} + ${rb} = ${ra + rb}`,
        `${ra - 10} + ${rb} = ${ra + rb - 10}`,
        `${ra} + ${rb + 10} = ${ra + rb + 10}`,
        `${ra + 10} + ${rb + 10} = ${ra + rb + 20}`,
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 10) * 10;
      const rb = Math.round(Number(vars.b) / 10) * 10;
      return `${vars.a} ≈ ${ra}, ხოლო ${vars.b} ≈ ${rb}. ამიტომ საუკეთესო მიახლოებაა: ${answer}.`;
    },
  }),

  // Q24 — რომელი რიცხვების მიახლოებითი ჯამია სამიზნე (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u09-24', subtopicId: 'u09-approximate-operations', difficulty: 3 }),
    prompt: 'რომელი ორი რიცხვის მიახლოებითი ჯამია {target} (ათეულებამდე დამრგვალებით)?',
    variables: {
      target: { kind: 'choice', values: [60, 70, 80, 90, 100] },
      p1: { kind: 'choice', values: [20, 30, 40] },
      off1: { kind: 'choice', values: [-2, -1, 1, 2] },
      off2: { kind: 'choice', values: [-2, -1, 1, 2] },
    },
    answer: (v: Vars) => {
      const a = Number(v.p1) + Number(v.off1);
      const b = (Number(v.target) - Number(v.p1)) + Number(v.off2);
      return `${a} და ${b}`;
    },
    format: { kind: 'text' },
    options: (v: Vars) => {
      const t = Number(v.target);
      const p1 = Number(v.p1);
      const a = p1 + Number(v.off1);
      const b = (t - p1) + Number(v.off2);
      return [
        `${a} და ${b}`,
        `${a + 10} და ${b}`,
        `${a} და ${b - 10}`,
        `${a + 10} და ${b + 10}`,
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) => {
      return `${answer}-ს თითოეული რიცხვის ათეულამდე დამრგვალებით ჯამში მიიღება ${vars.target}.`;
    },
  }),
];
