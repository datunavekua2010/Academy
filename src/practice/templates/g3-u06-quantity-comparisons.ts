import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

/**
 * Grade 3 — Unit 06: რაოდენობის განსაზღვრა და შედარება (Quantity Determination and Comparisons)
 *
 * 6 subtopics, 6 templates per subtopic = 36 authored templates (Q01–Q36).
 * Levels: Level 1 (easy), Level 2 (medium), Level 3 (hard).
 * Formats: Integer entry, Multiple-choice, Comparisons.
 */

const grade = 3 as const;
const topicId = 'g3-raodenobis-shedareba' as const;
const unitId = 'g3-raodenobis-shedareba' as const;

export const G3_U06_SUBTOPICS = [
  'u06-digit-ranks-place-values',
  'u06-corresponding-numbers-samples',
  'u06-multiplying-by-samples',
  'u06-comparing-sums-without-addition',
  'u06-equalizing-quantities',
  'u06-object-quantity-analysis',
] as const;

export type G3U06SubtopicId = (typeof G3_U06_SUBTOPICS)[number];

const addr = (spec: { id: string; subtopicId: G3U06SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  id: spec.id,
  grade,
  topicId,
  unitId,
  subtopicId: spec.subtopicId,
  difficulty: spec.difficulty,
});

const nearMisses = (correct: number, count = 3, step = 1): number[] => {
  const result: number[] = [];
  const deltas = [step, -step, step * 2, -step * 2, step * 5, -step * 5, 10, -10, 1, -1];
  for (const d of deltas) {
    const val = correct + d;
    if (val >= 0 && val !== correct && !result.includes(val)) {
      result.push(val);
      if (result.length >= count) break;
    }
  }
  let extra = 1;
  while (result.length < count) {
    const val = correct + extra * 3;
    if (val >= 0 && val !== correct && !result.includes(val)) {
      result.push(val);
    }
    extra += 1;
  }
  return result;
};

export const G3_U06_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U06.1 — თანრიგები და მათი მნიშვნელობა (Digit ranks and place values)
  // =========================================================================

  // Q01 — ციფრის პოვნა თანრიგში (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-01', subtopicId: 'u06-digit-ranks-place-values', difficulty: 1 }),
    prompt: 'რა ციფრი წერია ასეულების თანრიგში რიცხვში {num}?',
    variables: {
      h: { kind: 'int', min: 1, max: 9 },
      t: { kind: 'int', min: 0, max: 9 },
      u: { kind: 'int', min: 0, max: 9 },
      num: { kind: 'choice', values: (v: Vars) => [Number(v.h) * 100 + Number(v.t) * 10 + Number(v.u)] },
    },
    answer: (v: Vars) => Number(v.h),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars, answer }) => {
      const candidates = [Number(vars.t), Number(vars.u), Number(vars.h) + 1].filter((c) => c !== Number(answer));
      return candidates.length >= 3 ? candidates.slice(0, 3) : nearMisses(Number(answer));
    },
    explanation: ({ vars, answer }) =>
      `რიცხვში ${vars.num} ასეულების ციფრია ${answer} (პირველი ციფრი მარცხნიდან სამნიშნა რიცხვში).`,
  }),

  // Q02 — ციფრის თანრიგული მნიშვნელობა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-02', subtopicId: 'u06-digit-ranks-place-values', difficulty: 1 }),
    prompt: 'რას უდრის ციფრ {t}-ის თანრიგული მნიშვნელობა რიცხვში {num}?',
    variables: {
      h: { kind: 'int', min: 1, max: 9 },
      t: { kind: 'int', min: 2, max: 9 },
      u: { kind: 'int', min: 1, max: 9 },
      num: { kind: 'choice', values: (v: Vars) => [Number(v.h) * 100 + Number(v.t) * 10 + Number(v.u)] },
    },
    answer: (v: Vars) => Number(v.t) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars, answer }) => {
      const t = Number(vars.t);
      return [t, t * 100, (t + 1) * 10].filter((c) => c !== Number(answer));
    },
    explanation: ({ vars, answer }) =>
      `ციფრი ${vars.t} დგას ათეულების თანრიგში, ამიტომ მისი თანრიგული მნიშვნელობაა ${vars.t} × 10 = ${answer}.`,
  }),

  // Q03 — რიცხვის შედგენა თანრიგებისგან (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-03', subtopicId: 'u06-digit-ranks-place-values', difficulty: 2 }),
    prompt: 'დაწერე რიცხვი, რომელიც შედგება {h} ასეულის, {t} ათეულისა და {u} ერთეულისგან:',
    variables: {
      h: { kind: 'int', min: 1, max: 9 },
      t: { kind: 'int', min: 1, max: 9 },
      u: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v: Vars) => Number(v.h) * 100 + Number(v.t) * 10 + Number(v.u),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10),
    explanation: ({ vars, answer }) =>
      `${vars.h} ასეული (${Number(vars.h) * 100}) + ${vars.t} ათეული (${Number(vars.t) * 10}) + ${vars.u} ერთეული = ${answer}.`,
  }),

  // Q04 — სრული ათეულების რაოდენობა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-04', subtopicId: 'u06-digit-ranks-place-values', difficulty: 2 }),
    prompt: 'სულ რამდენი სრული ათეულია რიცხვში {num}?',
    variables: {
      h: { kind: 'int', min: 1, max: 9 },
      t: { kind: 'int', min: 1, max: 9 },
      u: { kind: 'int', min: 1, max: 9 },
      num: { kind: 'choice', values: (v: Vars) => [Number(v.h) * 100 + Number(v.t) * 10 + Number(v.u)] },
    },
    answer: (v: Vars) => Number(v.h) * 10 + Number(v.t),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars, answer }) => {
      const full = Number(answer);
      return [Number(vars.t), full + 1, full - 1].filter((c) => c !== full);
    },
    explanation: ({ vars, answer }) =>
      `რიცხვში ${vars.num} სრული ათეულების რაოდენობაა ${answer} (რადგან ${answer} × 10 = ${Number(answer) * 10} ≤ ${vars.num}).`,
  }),

  // Q05 — თანრიგის ციფრის გაზრდა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-05', subtopicId: 'u06-digit-ranks-place-values', difficulty: 3 }),
    prompt: 'თუ რიცხვში {num} ასეულების ციფრს გავზრდით {k}-ით, რა რიცხვს მივიღებთ?',
    variables: {
      h: { kind: 'int', min: 1, max: 6 },
      k: { kind: 'int', min: 1, max: 3 },
      t: { kind: 'int', min: 1, max: 9 },
      u: { kind: 'int', min: 0, max: 9 },
      num: { kind: 'choice', values: (v: Vars) => [Number(v.h) * 100 + Number(v.t) * 10 + Number(v.u)] },
    },
    answer: (v: Vars) => (Number(v.h) + Number(v.k)) * 100 + Number(v.t) * 10 + Number(v.u),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100),
    explanation: ({ vars, answer }) => {
      const newH = Number(vars.h) + Number(vars.k);
      return `ასეულების ციფრი ${vars.h} გახდება ${newH}. მიიღება რიცხვი ${answer}.`;
    },
  }),

  // Q06 — უდიდესი სამნიშნა რიცხვის შედგენა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-06', subtopicId: 'u06-digit-ranks-place-values', difficulty: 3 }),
    prompt: 'რა უდიდესი სამნიშნა რიცხვი შეიძლება შედგეს ციფრებისგან: {d1}, {d2}, {d3} (თითოეული ციფრის ერთხელ გამოყენებით)?',
    variables: {
      d1: { kind: 'int', min: 2, max: 4 },
      d2: { kind: 'int', min: 5, max: 7 },
      d3: { kind: 'int', min: 8, max: 9 },
    },
    answer: (v: Vars) => {
      const sorted = [Number(v.d1), Number(v.d2), Number(v.d3)].sort((a, b) => b - a);
      return sorted[0] * 100 + sorted[1] * 10 + sorted[2];
    },
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars, answer }) => {
      const arr = [Number(vars.d1), Number(vars.d2), Number(vars.d3)];
      const c1 = arr[0] * 100 + arr[1] * 10 + arr[2];
      const c2 = arr[1] * 100 + arr[2] * 10 + arr[0];
      const c3 = arr[0] * 100 + arr[2] * 10 + arr[1];
      return [c1, c2, c3].filter((c) => c !== Number(answer));
    },
    explanation: ({ answer }) =>
      `უდიდესი რიცხვის მისაღებად ციფრები უნდა დავალაგოთ კლების მიხედვით (დიდიდან პატარისკენ): ${answer}.`,
  }),

  // =========================================================================
  // U06.2 — შესაბამისი რიცხვები და ნიმუშები (Corresponding numbers and samples)
  // =========================================================================

  // Q07 — შესაბამისი რიცხვის პოვნა ნიმუშით (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-07', subtopicId: 'u06-corresponding-numbers-samples', difficulty: 1 }),
    prompt: 'მოცემულია ნიმუში: 2 → {s2}, 3 → {s3}, 4 → {s4}. რა რიცხვი შეესაბამება {n}-ს: {n} → ?',
    variables: {
      k: { kind: 'int', min: 3, max: 6 },
      n: { kind: 'int', min: 5, max: 15 },
      s2: { kind: 'choice', values: (v: Vars) => [2 * Number(v.k)] },
      s3: { kind: 'choice', values: (v: Vars) => [3 * Number(v.k)] },
      s4: { kind: 'choice', values: (v: Vars) => [4 * Number(v.k)] },
    },
    answer: (v: Vars) => Number(v.n) * Number(v.k),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `ნიმუშის წესია: რიცხვი მრავლდება ${vars.k}-ზე. ამიტომ ${vars.n} × ${vars.k} = ${answer}.`,
  }),

  // Q08 — წესის ამოცნობა სიტყვიერად (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-08', subtopicId: 'u06-corresponding-numbers-samples', difficulty: 1 }),
    prompt: 'მოცემულია რიცხვების წყვილები: {n1} და {p1}, {n2} და {p2}, {n3} და {p3}. რა წესით მიიღება მეორე რიცხვი პირველისგან?',
    variables: {
      n1: { kind: 'choice', values: [1, 2, 3] },
      n2: { kind: 'choice', values: (v: Vars) => [Number(v.n1) + 1] },
      n3: { kind: 'choice', values: (v: Vars) => [Number(v.n1) + 2] },
      k: { kind: 'choice', values: [2, 3, 4, 5, 6, 7, 8, 9] },
      p1: { kind: 'choice', values: (v: Vars) => [Number(v.n1) * Number(v.k)] },
      p2: { kind: 'choice', values: (v: Vars) => [Number(v.n2) * Number(v.k)] },
      p3: { kind: 'choice', values: (v: Vars) => [Number(v.n3) * Number(v.k)] },
    },
    answer: (v: Vars) => `მრავლდება ${v.k}-ზე`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const k = Number(vars.k);
      return [
        `ემატება ${k * 2}`,
        `მრავლდება ${k + 1}-ზე`,
        `ორმაგდება და ემატება 1`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `თითოეულ წყვილში მეორე რიცხვი პირველის ${vars.k}-ზე ნამრავლია, ამიტომ წესია '${answer}'.`,
  }),

  // Q09 — ორსაფეხურიანი ნიმუში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-09', subtopicId: 'u06-corresponding-numbers-samples', difficulty: 2 }),
    prompt: 'ნიმუშში წესია: რიცხვი მრავლდება {k}-ზე და ემატება {c}. მაგალითად: 2 → {s2}, 3 → {s3}. რა რიცხვი შეესაბამება {n}-ს?',
    variables: {
      k: { kind: 'int', min: 2, max: 4 },
      c: { kind: 'int', min: 1, max: 5 },
      n: { kind: 'int', min: 4, max: 12 },
      s2: { kind: 'choice', values: (v: Vars) => [2 * Number(v.k) + Number(v.c)] },
      s3: { kind: 'choice', values: (v: Vars) => [3 * Number(v.k) + Number(v.c)] },
    },
    answer: (v: Vars) => Number(v.n) * Number(v.k) + Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.n} × ${vars.k} + ${vars.c} = ${Number(vars.n) * Number(vars.k)} + ${vars.c} = ${answer}.`,
  }),

  // Q10 — შესაბამისი წყვილის არჩევა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-10', subtopicId: 'u06-corresponding-numbers-samples', difficulty: 2 }),
    prompt: 'რომელი წყვილი შეესაბამება წესს: „მეორე რიცხვი {k}-ით მეტია პირველის გაორკეცებულზე (2 × x + {k})“?',
    variables: {
      k: { kind: 'int', min: 2, max: 6 },
      x: { kind: 'int', min: 3, max: 8 },
    },
    answer: (v: Vars) => {
      const x = Number(v.x);
      const y = 2 * x + Number(v.k);
      return `${x} და ${y}`;
    },
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const x = Number(vars.x);
      const k = Number(vars.k);
      const y = 2 * x + k;
      return [
        `${x} და ${y + 2}`,
        `${x} და ${y - 3}`,
        `${x} და ${x * 2}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `2 × ${vars.x} + ${vars.k} = ${2 * Number(vars.x) + Number(vars.k)}, ამიტომ სწორი წყვილია ${answer}.`,
  }),

  // Q11 — შებრუნებული შესაბამისობა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-11', subtopicId: 'u06-corresponding-numbers-samples', difficulty: 3 }),
    prompt: 'ნიმუშის წესით საწყისი რიცხვი მრავლდება {k}-ზე და აკლდება {sub}. თუ შედეგად მიიღეს {res}, რა იყო საწყისი რიცხვი?',
    variables: {
      k: { kind: 'int', min: 2, max: 5 },
      sub: { kind: 'int', min: 1, max: 6 },
      x: { kind: 'int', min: 3, max: 10 },
      res: { kind: 'choice', values: (v: Vars) => [Number(v.k) * Number(v.x) - Number(v.sub)] },
    },
    answer: (v: Vars) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `შებრუნებული მოქმედებით: (${vars.res} + ${vars.sub}) ÷ ${vars.k} = ${Number(vars.res) + Number(vars.sub)} ÷ ${vars.k} = ${answer}.`,
  }),

  // Q12 — წესის დამრღვევი რიცხვი (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-12', subtopicId: 'u06-corresponding-numbers-samples', difficulty: 3 }),
    prompt: 'მიმდევრობაში თითოეული რიცხვი უნდა მიიღებოდეს წესით „მრავლდება {k}-ზე“: {v1}, {v2}, {wrongVal}, {v4}. რომელი რიცხვი არღვევს წესს?',
    variables: {
      k: { kind: 'choice', values: [3, 4, 5] },
      wrongOffset: { kind: 'choice', values: [1, 2, -1, -2] },
      v1: { kind: 'choice', values: (v: Vars) => [2 * Number(v.k)] },
      v2: { kind: 'choice', values: (v: Vars) => [3 * Number(v.k)] },
      wrongVal: { kind: 'choice', values: (v: Vars) => [4 * Number(v.k) + Number(v.wrongOffset)] },
      v4: { kind: 'choice', values: (v: Vars) => [5 * Number(v.k)] },
    },
    answer: (v: Vars) => Number(v.wrongVal),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.v1), Number(vars.v2), Number(vars.v4)],
    explanation: ({ vars, answer }) => {
      const k = Number(vars.k);
      const correct = 4 * k;
      return `4 × ${k} = ${correct}, ხოლო მიმდევრობაში შეცდომით წერია ${answer}.`;
    },
  }),

  // =========================================================================
  // U06.3 — რიცხვების გამრავლება ნიმუშის მიხედვით (Multiplying by samples)
  // =========================================================================

  // Q13 — ორნიშნას გამრავლება ნიმუშით (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-13', subtopicId: 'u06-multiplying-by-samples', difficulty: 1 }),
    prompt: 'ნიმუში: 3 × 12 = 3 × 10 + 3 × 2 = 30 + 6 = 36.\nამ ნიმუშის გამოყენებით გამოთვალე: {a} × {num} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      u: { kind: 'int', min: 2, max: 8 },
      num: { kind: 'choice', values: (v: Vars) => [10 + Number(v.u)] },
    },
    answer: (v: Vars) => Number(v.a) * (10 + Number(v.u)),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const p1 = Number(vars.a) * 10;
      const p2 = Number(vars.a) * Number(vars.u);
      return `${vars.a} × ${vars.num} = ${vars.a} × 10 + ${vars.a} × ${vars.u} = ${p1} + ${p2} = ${answer}.`;
    },
  }),

  // Q14 — გამრავლების დაშლა ნიმუშის მიხედვით (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-14', subtopicId: 'u06-multiplying-by-samples', difficulty: 1 }),
    prompt: 'როგორ დაიშლება ნამრავლი {a} × {num} ნიმუშის მიხედვით თანრიგების ჯამად?',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      t0: { kind: 'choice', values: [20, 30, 40] },
      u: { kind: 'int', min: 2, max: 7 },
      num: { kind: 'choice', values: (v: Vars) => [Number(v.t0) + Number(v.u)] },
    },
    answer: (v: Vars) => `${v.a} × ${v.t0} + ${v.a} × ${v.u}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.a} × ${vars.t0} + ${vars.u}`,
      `${vars.a} + ${vars.t0} + ${vars.u}`,
      `${vars.a} × ${Number(vars.t0) + 10} − ${vars.u}`,
    ],
    explanation: ({ vars, answer }) =>
      `${vars.num} = ${vars.t0} + ${vars.u}, ამიტომ ${vars.a} × ${vars.num} = ${answer}.`,
  }),

  // Q15 — გამოტოვებული რიცხვი ნიმუშში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-15', subtopicId: 'u06-multiplying-by-samples', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {a} × {num} = {a} × {t0} + □ × {u}',
    variables: {
      a: { kind: 'int', min: 2, max: 8 },
      t0: { kind: 'choice', values: [10, 20] },
      u: { kind: 'int', min: 2, max: 8 },
      num: { kind: 'choice', values: (v: Vars) => [Number(v.t0) + Number(v.u)] },
    },
    answer: (v: Vars) => Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.u), Number(vars.t0), Number(vars.a) + 1],
    explanation: ({ vars, answer }) =>
      `განრიგებადობის კანონით ორივე შესაკრები მრავლდება ${vars.a}-ზე, ამიტომ გამოტოვებული რიცხვია ${answer}.`,
  }),

  // Q16 — გაორმაგების ხერხი (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-16', subtopicId: 'u06-multiplying-by-samples', difficulty: 2 }),
    prompt: 'თუ 2 × {base} = {p2}, რას უდრის 4 × {base} (ნიმუში: 4-ზე გამრავლება არის ორჯერ გაორმაგება)?',
    variables: {
      base: { kind: 'int', min: 11, max: 35 },
      p2: { kind: 'choice', values: (v: Vars) => [2 * Number(v.base)] },
    },
    answer: (v: Vars) => 4 * Number(v.base),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10),
    explanation: ({ vars, answer }) =>
      `4 × ${vars.base} = 2 × (2 × ${vars.base}) = 2 × ${vars.p2} = ${answer}.`,
  }),

  // Q17 — მრგვალ რიცხვამდე შევსების ხერხი (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-17', subtopicId: 'u06-multiplying-by-samples', difficulty: 3 }),
    prompt: 'ნიმუში: a × 19 = a × 20 − a.\nამ ხერხის გამოყენებით გამოთვალე: {k} × 19 = ?',
    variables: {
      k: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => Number(v.k) * 19,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const k20 = Number(vars.k) * 20;
      return `${vars.k} × 20 − ${vars.k} = ${k20} − ${vars.k} = ${answer}.`;
    },
  }),

  // Q18 — მოსახერხებელი დაჯგუფება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-18', subtopicId: 'u06-multiplying-by-samples', difficulty: 3 }),
    prompt: 'გამოთვალე უმარტივესი ხერხით (დაჯგუფებით): {a} × {b} × 5 = ?',
    variables: {
      a: { kind: 'choice', values: [2, 4, 6, 8] },
      b: { kind: 'int', min: 3, max: 9 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b) * 5,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const p1 = Number(vars.a) * 5;
      return `ჯერ გავამრავლოთ ${vars.a} × 5 = ${p1}, შემდეგ ${p1} × ${vars.b} = ${answer}.`;
    },
  }),

  // =========================================================================
  // U06.4 — ჯამების შედარება შეკრების გარეშე (Comparing sums without addition)
  // =========================================================================

  // Q19 — შედარება ერთი საერთო შესაკრებით (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-19', subtopicId: 'u06-comparing-sums-without-addition', difficulty: 1 }),
    prompt: 'ჩასვი შესაბამისი ნიშანი შეკრების გარეშე: {a} + {b} □ {a} + {c}',
    variables: {
      a: { kind: 'int', min: 20, max: 80 },
      b: { kind: 'int', min: 10, max: 40 },
      c: { kind: 'int', min: 10, max: 40 },
    },
    answer: (v: Vars) => {
      const b = Number(v.b);
      const c = Number(v.c);
      return b > c ? '>' : b < c ? '<' : '=';
    },
    format: { kind: 'text' },
    optionCount: 3,
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) =>
      `რადგან ორივე მხარეს არის საერთო შესაკრები ${vars.a}, ვადარებთ მხოლოდ მეორე შესაკრებლებს: ${vars.b} ${answer} ${vars.c}. სწორი ნიშანია '${answer}'.`,
  }),

  // Q20 — რომელი ჯამია მეტი (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-20', subtopicId: 'u06-comparing-sums-without-addition', difficulty: 1 }),
    prompt: 'შეკრების გარეშე განსაზღვრე, რომელი ჯამია მეტი: {a} + {b} თუ {c} + {d}?',
    variables: {
      a: { kind: 'int', min: 20, max: 50 },
      b: { kind: 'int', min: 20, max: 50 },
      diff1: { kind: 'int', min: 2, max: 8 },
      diff2: { kind: 'int', min: 2, max: 8 },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.a) + Number(v.diff1)] },
      d: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.diff2)] },
    },
    answer: (v: Vars) => `${v.c} + ${v.d}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.a} + ${vars.b}`,
      'ორივე ტოლია',
      'დადგენა შეუძლებელია',
    ],
    explanation: ({ vars, answer }) =>
      `რადგან ${vars.c} > ${vars.a} და ${vars.d} > ${vars.b}, ამიტომ მეტია ${answer}.`,
  }),

  // Q21 — რამდენით მეტია ჯამი შეკრების გარეშე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-21', subtopicId: 'u06-comparing-sums-without-addition', difficulty: 2 }),
    prompt: 'შეკრების გარეშე განსაზღვრე: რამდენით მეტია ({a} + {b1}) ჯამზე ({a} + {b2})?',
    variables: {
      a: { kind: 'int', min: 20, max: 80 },
      b2: { kind: 'int', min: 10, max: 30 },
      diff: { kind: 'int', min: 2, max: 20 },
      b1: { kind: 'choice', values: (v: Vars) => [Number(v.b2) + Number(v.diff)] },
    },
    answer: (v: Vars) => Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `საერთო შესაკრებია ${vars.a}, ხოლო მეორე შესაკრებების სხვაობაა ${vars.b1} − ${vars.b2} = ${answer}. ამდენითვე მეტია პირველი ჯამი.`,
  }),

  // Q22 — კომპენსირებული ჯამების შედარება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-22', subtopicId: 'u06-comparing-sums-without-addition', difficulty: 2 }),
    prompt: 'ჩასვი შესაბამისი ნიშანი: ({a} + {k}) + ({b} − {k}) □ {a} + {b}',
    variables: {
      a: { kind: 'int', min: 25, max: 60 },
      b: { kind: 'int', min: 25, max: 60 },
      k: { kind: 'int', min: 2, max: 8 },
    },
    answer: () => '=',
    format: { kind: 'text' },
    optionCount: 3,
    options: () => ['=', '>', '<'],
    explanation: ({ vars, answer }) =>
      `ერთ შესაკრებს მიემატა ${vars.k}, ხოლო მეორეს გამოაკლდა ${vars.k}. ჯამი არ იცვლება, ამიტომ სწორი ნიშანია '${answer}'.`,
  }),

  // Q23 — გამოტოვებული შესაკრები ტოლობაში (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-23', subtopicId: 'u06-comparing-sums-without-addition', difficulty: 3 }),
    prompt: 'გამოთვლის გარეშე იპოვე გამოტოვებული რიცხვი: {a} + {b} = ({a} + {p1}) + □',
    variables: {
      a: { kind: 'int', min: 20, max: 80 },
      p1: { kind: 'choice', values: [20, 30, 40] },
      p2: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.p1) + Number(v.p2)] },
    },
    answer: (v: Vars) => Number(v.p2),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `რადგან ${vars.b} = ${vars.p1} + ${vars.p2}, გამოტოვებული რიცხვია ${answer}.`,
  }),

  // Q24 — შედარების მიზეზის ახსნა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-24', subtopicId: 'u06-comparing-sums-without-addition', difficulty: 3 }),
    prompt: 'რატომ არის {a1} + {b1} მეტი {a2} + {b2}-ზე გამოთვლის გარეშე?',
    variables: {
      a2: { kind: 'int', min: 30, max: 60 },
      b2: { kind: 'int', min: 20, max: 50 },
      d1: { kind: 'int', min: 2, max: 8 },
      d2: { kind: 'int', min: 2, max: 8 },
      a1: { kind: 'choice', values: (v: Vars) => [Number(v.a2) + Number(v.d1)] },
      b1: { kind: 'choice', values: (v: Vars) => [Number(v.b2) + Number(v.d2)] },
    },
    answer: () => 'ორივე შესაკრები შესაბამისად მეტია',
    format: { kind: 'text' },
    distractors: () => [
      'შესაკრებების რაოდენობა მეტია',
      'მხოლოდ ერთი შესაკრებია მეტი',
      'ჯამები ყოველთვის ტოლია',
    ],
    explanation: ({ vars, answer }) =>
      `რადგან ${vars.a1} > ${vars.a2} და ${vars.b1} > ${vars.b2}, ორივე შესაკრები ცალ-ცალკე მეტია, ამიტომ ჯამიც მეტია.`,
  }),

  // =========================================================================
  // U06.5 — რაოდენობების გათანაბრება (Equalizing quantities)
  // =========================================================================

  // Q25 — გადატანა გასათანაბრებლად (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-25', subtopicId: 'u06-equalizing-quantities', difficulty: 1 }),
    prompt: 'პირველ ყუთში არის {a} ფანქარი, მეორეში — {b}. რამდენი ფანქარი უნდა გადავიტანოთ პირველიდან მეორეში, რომ ორივეში თანაბრად იყოს?',
    variables: {
      base: { kind: 'int', min: 15, max: 40 },
      trans: { kind: 'int', min: 2, max: 10 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.base) + Number(v.trans)] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.base) - Number(v.trans)] },
    },
    answer: (v: Vars) => Number(v.trans),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const diff = Number(vars.a) - Number(vars.b);
      return `სხვაობაა ${vars.a} − ${vars.b} = ${diff}. გასათანაბრებლად უნდა გადავიტანოთ სხვაობის ნახევარი: ${diff} ÷ 2 = ${answer} ფანქარი.`;
    },
  }),

  // Q26 — რამდენი უნდა დავუმატოთ გასათანაბრებლად (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-26', subtopicId: 'u06-equalizing-quantities', difficulty: 1 }),
    prompt: 'პირველ თაროზე დევს {a} წიგნი, მეორეზე — {b}. რამდენი წიგნი უნდა დავდოთ პირველ თაროზე, რომ ორივეზე თანაბარი რაოდენობა გახდეს?',
    variables: {
      a: { kind: 'int', min: 15, max: 40 },
      more: { kind: 'int', min: 4, max: 20 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.a) + Number(v.more)] },
    },
    answer: (v: Vars) => Number(v.more),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `მეორე თაროზე ${vars.b} წიგნია. პირველზე რომ ამდენივე გახდეს, უნდა დავუმატოთ: ${vars.b} − ${vars.a} = ${answer} წიგნი.`,
  }),

  // Q27 — გათანაბრებული რაოდენობა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-27', subtopicId: 'u06-equalizing-quantities', difficulty: 2 }),
    prompt: 'ანას და ნინოს ერთად აქვთ {total} კანფეტი. როდესაც ანამ ნინოს მისცა {trans} კანფეტი, მათ რაოდენობა გაუტოლდათ. რამდენი კანფეტი აქვს ახლა თითოეულს?',
    variables: {
      half: { kind: 'int', min: 15, max: 40 },
      trans: { kind: 'int', min: 2, max: 8 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.half) * 2] },
    },
    answer: (v: Vars) => Number(v.half),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `რადგან კანფეტების საერთო რაოდენობა (${vars.total}) არ შეცვლილა და გათანაბრდა, თითოეულს აქვს: ${vars.total} ÷ 2 = ${answer} კანფეტი.`,
  }),

  // Q28 — საწყისი რაოდენობის პოვნა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-28', subtopicId: 'u06-equalizing-quantities', difficulty: 2 }),
    prompt: 'ორ კალათაში სულ {total} ვაშლი იყო. პირველიდან მეორეში გადაიტანეს {trans} ვაშლი და რაოდენობა გათანაბრდა. რამდენი ვაშლი იყო პირველ კალათაში თავიდან?',
    variables: {
      half: { kind: 'int', min: 15, max: 40 },
      trans: { kind: 'int', min: 2, max: 8 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.half) * 2] },
    },
    answer: (v: Vars) => Number(v.half) + Number(v.trans),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const h = Number(vars.half);
      return `გათანაბრების შემდეგ თითოეულში გახდა ${vars.total} ÷ 2 = ${h} ვაშლი. რადგან პირველიდან გადაიტანეს ${vars.trans} ვაშლი, თავიდან მასში იყო: ${h} + ${vars.trans} = ${answer} ვაშლი.`;
    },
  }),

  // Q29 — სამი ჯგუფის გათანაბრება (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-29', subtopicId: 'u06-equalizing-quantities', difficulty: 3 }),
    prompt: 'სამ თეფშზე დევს {p1}, {p2} და {p3} კაკალი. რამდენი კაკალი იქნება თითოეულ თეფშზე, თუ მათ თანაბრად გავანაწილებთ?',
    variables: {
      avg: { kind: 'int', min: 10, max: 30 },
      d1: { kind: 'int', min: 1, max: 5 },
      d2: { kind: 'int', min: 1, max: 5 },
      p1: { kind: 'choice', values: (v: Vars) => [Number(v.avg) - Number(v.d1)] },
      p2: { kind: 'choice', values: (v: Vars) => [Number(v.avg) + Number(v.d1) + Number(v.d2)] },
      p3: { kind: 'choice', values: (v: Vars) => [Number(v.avg) - Number(v.d2)] },
    },
    answer: (v: Vars) => Number(v.avg),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const sum = Number(vars.p1) + Number(vars.p2) + Number(vars.p3);
      return `სულ კაკალია: ${vars.p1} + ${vars.p2} + ${vars.p3} = ${sum}. თანაბრად განაწილების შემდეგ: ${sum} ÷ 3 = ${answer} კაკალი.`;
    },
  }),

  // Q30 — სხვაობის შენარჩუნებით გადანაწილება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-30', subtopicId: 'u06-equalizing-quantities', difficulty: 3 }),
    prompt: 'დათოს აქვს {a} ლარი, ხოლო ლუკას — {b} ლარი. რამდენი ლარი უნდა მისცეს დათომ ლუკას, რომ ორივეს თანაბარი თანხა გაუხდეს?',
    variables: {
      b: { kind: 'int', min: 10, max: 40 },
      diff: { kind: 'choice', values: [4, 6, 8, 10, 12, 14, 16] },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.diff)] },
    },
    answer: (v: Vars) => Number(v.diff) / 2,
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars, answer }) => [Number(vars.diff), Number(answer) + 1, Number(answer) - 1],
    explanation: ({ vars, answer }) =>
      `მათი სხვაობაა ${vars.a} − ${vars.b} = ${vars.diff} ლარი. გასათანაბრებლად დათომ უნდა მისცეს სხვაობის ნახევარი: ${vars.diff} ÷ 2 = ${answer} ლარი.`,
  }),

  // =========================================================================
  // U06.6 — საგნების რაოდენობის ანალიზი (Object quantity analysis)
  // =========================================================================

  // Q31 — ჯამი და სხვაობა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-31', subtopicId: 'u06-object-quantity-analysis', difficulty: 1 }),
    prompt: 'გიორგის და ლუკას ერთად აქვთ {total} ბურთი. გიორგის {more}-ით მეტი ბურთი აქვს, ვიდრე ლუკას. რამდენი ბურთი აქვს ლუკას?',
    variables: {
      luka: { kind: 'int', min: 5, max: 25 },
      more: { kind: 'choice', values: [2, 4, 6, 8, 10] },
      total: { kind: 'choice', values: (v: Vars) => [2 * Number(v.luka) + Number(v.more)] },
    },
    answer: (v: Vars) => Number(v.luka),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const rem = Number(vars.total) - Number(vars.more);
      return `გამოვაკლოთ მეტობა: ${vars.total} − ${vars.more} = ${rem}. გავყოთ ორზე: ${rem} ÷ 2 = ${answer} ბურთი.`;
    },
  }),

  // Q32 — რამდენჯერ მეტია (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-32', subtopicId: 'u06-object-quantity-analysis', difficulty: 1 }),
    prompt: 'მაგიდაზე დევს {pens} კალამი და {pencils} ფანქარი. რამდენჯერ მეტია ფანქრების რაოდენობა კალმების რაოდენობაზე?',
    variables: {
      pens: { kind: 'int', min: 2, max: 8 },
      mult: { kind: 'int', min: 2, max: 8 },
      pencils: { kind: 'choice', values: (v: Vars) => [Number(v.pens) * Number(v.mult)] },
    },
    answer: (v: Vars) => Number(v.mult),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.pencils} ÷ ${vars.pens} = ${answer}-ჯერ მეტია.`,
  }),

  // Q33 — ჯამი და ჯერადობა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-33', subtopicId: 'u06-object-quantity-analysis', difficulty: 2 }),
    prompt: 'სანდროს და ნიკას ერთად აქვთ {total} მარკა. სანდროს {mult}-ჯერ მეტი მარკა აქვს, ვიდრე ნიკას. რამდენი მარკა აქვს ნიკას?',
    variables: {
      mult: { kind: 'int', min: 2, max: 5 },
      nika: { kind: 'int', min: 3, max: 15 },
      total: { kind: 'choice', values: (v: Vars) => [(Number(v.mult) + 1) * Number(v.nika)] },
    },
    answer: (v: Vars) => Number(v.nika),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const parts = Number(vars.mult) + 1;
      return `სულ არის 1 + ${vars.mult} = ${parts} ნაწილი. ნიკას აქვს: ${vars.total} ÷ ${parts} = ${answer} მარკა.`;
    },
  }),

  // Q34 — ცხოველთა თათების საერთო რაოდენობა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-34', subtopicId: 'u06-object-quantity-analysis', difficulty: 2 }),
    prompt: 'ეზოში სეირნობს {cats} კატა და {dogs} ძაღლი. სულ რამდენი თათი აქვთ მათ ერთად?',
    variables: {
      cats: { kind: 'int', min: 2, max: 8 },
      dogs: { kind: 'int', min: 2, max: 8 },
    },
    answer: (v: Vars) => (Number(v.cats) + Number(v.dogs)) * 4,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 4),
    explanation: ({ vars, answer }) => {
      const totalAnimals = Number(vars.cats) + Number(vars.dogs);
      return `სულ არის ${vars.cats} + ${vars.dogs} = ${totalAnimals} ოთხფეხა ცხოველი. თათების რაოდენობაა: ${totalAnimals} × 4 = ${answer}.`;
    },
  }),

  // Q35 — სამი ტიპის საგანი ყუთში (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u06-35', subtopicId: 'u06-object-quantity-analysis', difficulty: 3 }),
    prompt: 'ყუთში სულ {total} ბურთულაა: წითელი, ლურჯი და მწვანე. წითელია {red}, ლურჯია {blue}. რამდენი მწვანე ბურთულაა ყუთში?',
    variables: {
      red: { kind: 'int', min: 5, max: 15 },
      blue: { kind: 'int', min: 5, max: 15 },
      green: { kind: 'int', min: 4, max: 15 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.red) + Number(v.blue) + Number(v.green)] },
    },
    answer: (v: Vars) => Number(v.green),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const rb = Number(vars.red) + Number(vars.blue);
      return `წითელი და ლურჯი ერთად: ${vars.red} + ${vars.blue} = ${rb}. მწვანე ბურთულებია: ${vars.total} − ${rb} = ${answer}.`;
    },
  }),

  // Q36 — თავები და ფეხები (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u06-36', subtopicId: 'u06-object-quantity-analysis', difficulty: 3 }),
    prompt: 'ეზოში არიან ქათმები და კურდღლები. სულ არის {heads} თავი და {legs} ფეხი. რამდენი კურდღელია ეზოში?',
    variables: {
      rabbits: { kind: 'int', min: 2, max: 8 },
      chickens: { kind: 'int', min: 2, max: 8 },
      heads: { kind: 'choice', values: (v: Vars) => [Number(v.rabbits) + Number(v.chickens)] },
      legs: { kind: 'choice', values: (v: Vars) => [4 * Number(v.rabbits) + 2 * Number(v.chickens)] },
    },
    answer: (v: Vars) => Number(v.rabbits),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const allChickensLegs = Number(vars.heads) * 2;
      const extraLegs = Number(vars.legs) - allChickensLegs;
      return `თუ ყველა ქათამი იქნებოდა, იქნებოდა ${vars.heads} × 2 = ${allChickensLegs} ფეხი. ზედმეტი ${extraLegs} ფეხი მოდის კურდღლებზე: ${extraLegs} ÷ 2 = ${answer} კურდღელი.`;
    },
  }),
];
