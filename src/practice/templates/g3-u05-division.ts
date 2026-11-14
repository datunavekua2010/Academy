import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

/**
 * Grade 3 — Unit 05: გაყოფა (Division)
 *
 * 7 subtopics, 6 templates per subtopic = 42 authored templates (Q01–Q42).
 * Levels: Level 1 (easy), Level 2 (medium), Level 3 (hard).
 * Formats: Integer entry, Multiple-choice, Comparisons.
 */

const grade = 3 as const;
const topicId = 'g3-gayofa' as const;
const unitId = 'g3-gayofa' as const;

export const G3_U05_SUBTOPICS = [
  'u05-facts-1-to-5',
  'u05-facts-6-to-10',
  'u05-division-within-10',
  'u05-round-numbers',
  'u05-unknown-dividends-divisors',
  'u05-division-tables',
  'u05-word-problems-division',
] as const;

export type G3U05SubtopicId = (typeof G3_U05_SUBTOPICS)[number];

const addr = (spec: { id: string; subtopicId: G3U05SubtopicId; difficulty: 1 | 2 | 3 }) => ({
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

export const G3_U05_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U05.1 — გაყოფა 1-დან 5-მდე (Division facts 1 to 5)
  // =========================================================================

  // Q01 — მარტივი გაყოფა 1-დან 5-მდე (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-01', subtopicId: 'u05-facts-1-to-5', difficulty: 1 }),
    prompt: 'გამოთვალე: {total} ÷ {divisor} = ?',
    variables: {
      divisor: { kind: 'int', min: 1, max: 5 },
      quot: { kind: 'int', min: 2, max: 10 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.divisor) * Number(v.quot)] },
    },
    answer: (v: Vars) => Number(v.quot),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.divisor} = ${answer}, რადგან ${vars.divisor} × ${answer} = ${vars.total}.`,
  }),

  // Q02 — 1-ზე და თავის თავზე გაყოფა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-02', subtopicId: 'u05-facts-1-to-5', difficulty: 1 }),
    prompt: 'გამოთვალე: {n} ÷ {div} = ?',
    variables: {
      n: { kind: 'int', min: 2, max: 15 },
      mode: { kind: 'choice', values: ['one', 'same'] },
      div: { kind: 'choice', values: (v: Vars) => [v.mode === 'one' ? 1 : Number(v.n)] },
    },
    answer: (v: Vars) => (v.mode === 'one' ? Number(v.n) : 1),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      const isOne = Number(answer) === 1;
      const candidates = isOne ? [0, n, n - 1] : [1, n + 1, n - 1];
      return candidates.filter((c) => c !== Number(answer));
    },
    explanation: ({ vars, answer }) =>
      Number(vars.div) === 1
        ? `ნებისმიერი რიცხვის 1-ზე გაყოფით მიიღება იგივე რიცხვი: ${vars.n} ÷ 1 = ${answer}.`
        : `რიცხვის თავის თავზე გაყოფით ყოველთვის მიიღება 1: ${vars.n} ÷ ${vars.n} = 1.`,
  }),

  // Q03 — ტექსტური ამოცანა გაყოფაზე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-03', subtopicId: 'u05-facts-1-to-5', difficulty: 2 }),
    prompt: '{total} ვაშლი თანაბრად გაუნაწილეს {divisor} ბავშვს. რამდენი ვაშლი შეხვდა თითოეულ ბავშვს?',
    variables: {
      divisor: { kind: 'int', min: 2, max: 5 },
      per: { kind: 'int', min: 2, max: 10 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.divisor) * Number(v.per)] },
    },
    answer: (v: Vars) => Number(v.per),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.divisor} = ${answer} ვაშლი.`,
  }),

  // Q04 — განაყოფების შედარება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-04', subtopicId: 'u05-facts-1-to-5', difficulty: 2 }),
    prompt: 'ჩასვი შესაბამისი ნიშანი: {t1} ÷ {d1} □ {t2} ÷ {d2}',
    variables: {
      d1: { kind: 'int', min: 2, max: 5 },
      q1: { kind: 'int', min: 2, max: 8 },
      t1: { kind: 'choice', values: (v: Vars) => [Number(v.d1) * Number(v.q1)] },
      d2: { kind: 'int', min: 2, max: 5 },
      q2: { kind: 'int', min: 2, max: 8 },
      t2: { kind: 'choice', values: (v: Vars) => [Number(v.d2) * Number(v.q2)] },
    },
    answer: (v: Vars) => {
      const q1 = Number(v.q1);
      const q2 = Number(v.q2);
      return q1 > q2 ? '>' : q1 < q2 ? '<' : '=';
    },
    format: { kind: 'text' },
    optionCount: 3,
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) => {
      const q1 = Number(vars.q1);
      const q2 = Number(vars.q2);
      return `${vars.t1} ÷ ${vars.d1} = ${q1}, ხოლო ${vars.t2} ÷ ${vars.d2} = ${q2}. რადგან ${q1} ${answer} ${q2}, სწორი ნიშანია '${answer}'.`;
    },
  }),

  // Q05 — გაყოფა და მიმატება (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-05', subtopicId: 'u05-facts-1-to-5', difficulty: 3 }),
    prompt: 'გამოთვალე: {total} ÷ {divisor} + {c} = ?',
    variables: {
      divisor: { kind: 'int', min: 2, max: 5 },
      q: { kind: 'int', min: 2, max: 10 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.divisor) * Number(v.q)] },
      c: { kind: 'int', min: 3, max: 15 },
    },
    answer: (v: Vars) => Number(v.q) + Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const q = Number(vars.q);
      return `პირველ რიგში ვასრულებთ გაყოფას: ${vars.total} ÷ ${vars.divisor} = ${q}. შემდეგ ვუმატებთ ${vars.c}: ${q} + ${vars.c} = ${answer}.`;
    },
  }),

  // Q06 — ტექსტური ამოცანა ნაშთისა და სხვაობის გარეშე ორ ნაბიჯად (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-06', subtopicId: 'u05-facts-1-to-5', difficulty: 3 }),
    prompt: 'გიორგის ჰქონდა {money} ლარი. მან {spent} ლარად იყიდა წიგნი, ხოლო დარჩენილი თანხით იყიდა {qty} ცალი ერთნაირი რვეული. რა ღირს ერთი რვეული?',
    variables: {
      qty: { kind: 'int', min: 2, max: 5 },
      price: { kind: 'int', min: 2, max: 6 },
      spent: { kind: 'int', min: 5, max: 15 },
      money: { kind: 'choice', values: (v: Vars) => [Number(v.spent) + Number(v.qty) * Number(v.price)] },
    },
    answer: (v: Vars) => Number(v.price),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const rem = Number(vars.money) - Number(vars.spent);
      return `წიგნის ყიდვის შემდეგ დარჩა: ${vars.money} − ${vars.spent} = ${rem} ლარი. ერთი რვეულის ფასია: ${rem} ÷ ${vars.qty} = ${answer} ლარი.`;
    },
  }),

  // =========================================================================
  // U05.2 — გაყოფა 6-დან 10-მდე (Division facts 6 to 10)
  // =========================================================================

  // Q07 — საბაზისო გაყოფა 6-დან 10-მდე (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-07', subtopicId: 'u05-facts-6-to-10', difficulty: 1 }),
    prompt: 'გამოთვალე: {total} ÷ {divisor} = ?',
    variables: {
      divisor: { kind: 'int', min: 6, max: 10 },
      quot: { kind: 'int', min: 2, max: 10 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.divisor) * Number(v.quot)] },
    },
    answer: (v: Vars) => Number(v.quot),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.divisor} = ${answer}.`,
  }),

  // Q08 — 10-ზე გაყოფა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-08', subtopicId: 'u05-facts-6-to-10', difficulty: 1 }),
    prompt: 'რას უდრის {n0} ÷ 10?',
    variables: {
      n: { kind: 'int', min: 2, max: 15 },
      n0: { kind: 'choice', values: (v: Vars) => [Number(v.n) * 10] },
    },
    answer: (v: Vars) => Number(v.n),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `რიცხვის 10-ზე გაყოფისას მას მარჯვნიდან ჩამოვაშორებთ ერთ ნულს: ${vars.n0} ÷ 10 = ${answer}.`,
  }),

  // Q09 — ტექსტური ამოცანა ყუთებზე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-09', subtopicId: 'u05-facts-6-to-10', difficulty: 2 }),
    prompt: '{total} ფანქარი თანაბრად ჩააწყვეს {boxes} ყუთში. რამდენი ფანქარია თითოეულ ყუთში?',
    variables: {
      boxes: { kind: 'int', min: 6, max: 9 },
      per: { kind: 'int', min: 3, max: 9 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.boxes) * Number(v.per)] },
    },
    answer: (v: Vars) => Number(v.per),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.boxes} = ${answer} ფანქარი.`,
  }),

  // Q10 — განაყოფების შედარება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-10', subtopicId: 'u05-facts-6-to-10', difficulty: 2 }),
    prompt: 'ჩასვი შესაბამისი ნიშანი: {t1} ÷ {d1} □ {t2} ÷ {d2}',
    variables: {
      d1: { kind: 'int', min: 6, max: 9 },
      q1: { kind: 'int', min: 2, max: 8 },
      t1: { kind: 'choice', values: (v: Vars) => [Number(v.d1) * Number(v.q1)] },
      d2: { kind: 'int', min: 6, max: 9 },
      q2: { kind: 'int', min: 2, max: 8 },
      t2: { kind: 'choice', values: (v: Vars) => [Number(v.d2) * Number(v.q2)] },
    },
    answer: (v: Vars) => {
      const q1 = Number(v.q1);
      const q2 = Number(v.q2);
      return q1 > q2 ? '>' : q1 < q2 ? '<' : '=';
    },
    format: { kind: 'text' },
    optionCount: 3,
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) => {
      const q1 = Number(vars.q1);
      const q2 = Number(vars.q2);
      return `${vars.t1} ÷ ${vars.d1} = ${q1}, ${vars.t2} ÷ ${vars.d2} = ${q2}. ${q1} ${answer} ${q2}.`;
    },
  }),

  // Q11 — გამოკლება და გაყოფა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-11', subtopicId: 'u05-facts-6-to-10', difficulty: 3 }),
    prompt: 'გამოთვალე: 100 − {total} ÷ {divisor} = ?',
    variables: {
      divisor: { kind: 'int', min: 6, max: 9 },
      quot: { kind: 'int', min: 2, max: 9 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.divisor) * Number(v.quot)] },
    },
    answer: (v: Vars) => 100 - Number(v.quot),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const q = Number(vars.quot);
      return `ჯერ ვასრულებთ გაყოფას: ${vars.total} ÷ ${vars.divisor} = ${q}. შემდეგ: 100 − ${q} = ${answer}.`;
    },
  }),

  // Q12 — ტექსტური ამოცანა კლასებზე (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-12', subtopicId: 'u05-facts-6-to-10', difficulty: 3 }),
    prompt: 'სკოლის {students} მოსწავლე თანაბრად განაწილდა {classes} კლასში. თითოეულ კლასში {boys} ბიჭია. რამდენი გოგონაა თითოეულ კლასში?',
    variables: {
      classes: { kind: 'int', min: 6, max: 8 },
      perClass: { kind: 'int', min: 20, max: 28 },
      boys: { kind: 'int', min: 10, max: 15 },
      students: { kind: 'choice', values: (v: Vars) => [Number(v.classes) * Number(v.perClass)] },
    },
    answer: (v: Vars) => Number(v.perClass) - Number(v.boys),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const per = Number(vars.perClass);
      return `თითოეულ კლასშია: ${vars.students} ÷ ${vars.classes} = ${per} მოსწავლე. გოგონების რაოდენობაა: ${per} − ${vars.boys} = ${answer}.`;
    },
  }),

  // =========================================================================
  // U05.3 — გაყოფა 10-ის ფარგლებში (Division within 10)
  // =========================================================================

  // Q13 — ერთნიშნა განაყოფი (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-13', subtopicId: 'u05-division-within-10', difficulty: 1 }),
    prompt: 'გამოთვალე: {total} ÷ {divisor} = ?',
    variables: {
      divisor: { kind: 'int', min: 2, max: 9 },
      quot: { kind: 'int', min: 2, max: 9 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.divisor) * Number(v.quot)] },
    },
    answer: (v: Vars) => Number(v.quot),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.divisor} = ${answer}.`,
  }),

  // Q14 — კავშირი გამრავლებასა და გაყოფას შორის (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-14', subtopicId: 'u05-division-within-10', difficulty: 1 }),
    prompt: 'თუ {a} × {b} = {prod}, მაშინ რას უდრის {prod} ÷ {a}?',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 2, max: 9 },
      prod: { kind: 'choice', values: (v: Vars) => [Number(v.a) * Number(v.b)] },
    },
    answer: (v: Vars) => Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars, answer }) => {
      const b = Number(vars.b);
      const a = Number(vars.a);
      return [a, b + 1, b - 1].filter((c) => c !== Number(answer) && c > 0);
    },
    explanation: ({ vars, answer }) =>
      `გამრავლება და გაყოფა ურთიერთშებრუნებული მოქმედებებია: რადგან ${vars.a} × ${vars.b} = ${vars.prod}, ამიტომ ${vars.prod} ÷ ${vars.a} = ${answer}.`,
  }),

  // Q15 — გაყოფა და გამრავლება (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-15', subtopicId: 'u05-division-within-10', difficulty: 2 }),
    prompt: 'გამოთვალე: ({total} ÷ {d}) × {k} = ?',
    variables: {
      d: { kind: 'int', min: 2, max: 8 },
      q: { kind: 'int', min: 2, max: 8 },
      k: { kind: 'int', min: 2, max: 4 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.d) * Number(v.q)] },
    },
    answer: (v: Vars) => Number(v.q) * Number(v.k),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const q = Number(vars.q);
      return `ფრჩხილებში: ${vars.total} ÷ ${vars.d} = ${q}. შემდეგ: ${q} × ${vars.k} = ${answer}.`;
    },
  }),

  // Q16 — ჭეშმარიტი ტოლობის არჩევა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-16', subtopicId: 'u05-division-within-10', difficulty: 2 }),
    prompt: 'მოცემულია გაყოფა {total} ÷ {divisor}. რომელი ტოლობაა ჭეშმარიტი?',
    variables: {
      divisor: { kind: 'int', min: 3, max: 9 },
      quot: { kind: 'int', min: 3, max: 9 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.divisor) * Number(v.quot)] },
    },
    answer: (v: Vars) => `${v.total} ÷ ${v.divisor} = ${v.quot}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const tot = Number(vars.total);
      const div = Number(vars.divisor);
      const q = Number(vars.quot);
      return [
        `${tot} ÷ ${div} = ${q + 1}`,
        `${tot} ÷ ${div} = ${q - 1}`,
        `${tot} ÷ ${div} = ${q + 2}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.divisor} = ${vars.quot}, ამიტომ სწორი ტოლობაა ${answer}.`,
  }),

  // Q17 — ორი განაყოფის ჯამი (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-17', subtopicId: 'u05-division-within-10', difficulty: 3 }),
    prompt: 'გამოთვალე: {t1} ÷ {d1} + {t2} ÷ {d2} = ?',
    variables: {
      d1: { kind: 'int', min: 2, max: 6 },
      q1: { kind: 'int', min: 2, max: 7 },
      t1: { kind: 'choice', values: (v: Vars) => [Number(v.d1) * Number(v.q1)] },
      d2: { kind: 'int', min: 2, max: 6 },
      q2: { kind: 'int', min: 2, max: 7 },
      t2: { kind: 'choice', values: (v: Vars) => [Number(v.d2) * Number(v.q2)] },
    },
    answer: (v: Vars) => Number(v.q1) + Number(v.q2),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const q1 = Number(vars.q1);
      const q2 = Number(vars.q2);
      return `${vars.t1} ÷ ${vars.d1} = ${q1}, ხოლო ${vars.t2} ÷ ${vars.d2} = ${q2}. ჯამი: ${q1} + ${q2} = ${answer}.`;
    },
  }),

  // Q18 — უდიდესი განაყოფის პოვნა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-18', subtopicId: 'u05-division-within-10', difficulty: 3 }),
    prompt: 'ჩამოთვლილთაგან რომელი განაყოფია უდიდესი?\n{variant}',
    variables: {
      a: { kind: 'int', min: 2, max: 8 },
      q: { kind: 'int', min: 6, max: 9 },
      variant: { kind: 'choice', values: ['იპოვე სწორი პასუხი.', 'მონიშნე უდიდესი მნიშვნელობა.', 'აირჩიე სწორი ვარიანტი:'] },
      prod: { kind: 'choice', values: (v: Vars) => [Number(v.a) * Number(v.q)] },
    },
    answer: (v: Vars) => `${v.prod} ÷ ${v.a}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const q = Number(vars.q);
      return [
        `${a * (q - 2)} ÷ ${a}`,
        `${a * (q - 3)} ÷ ${a}`,
        `${a * (q - 4)} ÷ ${a}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${vars.prod} ÷ ${vars.a} = ${vars.q}, რაც მოცემულ ვარიანტებს შორის უდიდესია.`,
  }),

  // =========================================================================
  // U05.4 — მრგვალი რიცხვების გაყოფა (Division of round numbers)
  // =========================================================================

  // Q19 — მრგვალი ათეულის გაყოფა ერთნიშნაზე (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-19', subtopicId: 'u05-round-numbers', difficulty: 1 }),
    prompt: 'გამოთვალე: {a0} ÷ {b} = ?',
    variables: {
      b: { kind: 'int', min: 2, max: 6 },
      q: { kind: 'int', min: 2, max: 8 },
      a0: { kind: 'choice', values: (v: Vars) => [Number(v.b) * Number(v.q) * 10] },
    },
    answer: (v: Vars) => Number(v.q) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10),
    explanation: ({ vars, answer }) => {
      const simple = Number(vars.a0) / 10;
      return `${simple} ÷ ${vars.b} = ${Number(vars.q)}, ამიტომ ${vars.a0} ÷ ${vars.b} = ${answer}.`;
    },
  }),

  // Q20 — ასეულის გაყოფა ერთნიშნაზე (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-20', subtopicId: 'u05-round-numbers', difficulty: 1 }),
    prompt: 'რას უდრის {h00} ÷ {b}?',
    variables: {
      b: { kind: 'int', min: 2, max: 5 },
      q: { kind: 'int', min: 2, max: 8 },
      h00: { kind: 'choice', values: (v: Vars) => [Number(v.b) * Number(v.q) * 100] },
    },
    answer: (v: Vars) => Number(v.q) * 100,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100),
    explanation: ({ vars, answer }) =>
      `${vars.h00} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q21 — 100-ზე გაყოფა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-21', subtopicId: 'u05-round-numbers', difficulty: 2 }),
    prompt: 'გამოთვალე: {n00} ÷ 100 = ?',
    variables: {
      n: { kind: 'int', min: 2, max: 15 },
      n00: { kind: 'choice', values: (v: Vars) => [Number(v.n) * 100] },
    },
    answer: (v: Vars) => Number(v.n),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `რიცხვის 100-ზე გაყოფისას მას მარჯვნიდან ჩამოვაშორებთ ორ ნულს: ${vars.n00} ÷ 100 = ${answer}.`,
  }),

  // Q22 — მრგვალი ათეულის გაყოფა მრგვალ ათეულზე (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-22', subtopicId: 'u05-round-numbers', difficulty: 2 }),
    prompt: 'რას უდრის {p0} ÷ {b0}?',
    variables: {
      b: { kind: 'int', min: 2, max: 6 },
      q: { kind: 'int', min: 2, max: 6 },
      b0: { kind: 'choice', values: (v: Vars) => [Number(v.b) * 10] },
      p0: { kind: 'choice', values: (v: Vars) => [Number(v.b) * Number(v.q) * 10] },
    },
    answer: (v: Vars) => Number(v.q),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `ორივე რიცხვს ჩამოვაშოროთ თითო ნული: ${Number(vars.p0) / 10} ÷ ${Number(vars.b0) / 10} = ${answer}. ამიტომ ${vars.p0} ÷ ${vars.b0} = ${answer}.`,
  }),

  // Q23 — მრგვალი რიცხვის გაყოფა შეკრებით (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-23', subtopicId: 'u05-round-numbers', difficulty: 3 }),
    prompt: 'გამოთვალე: {a0} ÷ {b} + {c} = ?',
    variables: {
      b: { kind: 'int', min: 2, max: 6 },
      q: { kind: 'int', min: 2, max: 8 },
      a0: { kind: 'choice', values: (v: Vars) => [Number(v.b) * Number(v.q) * 10] },
      c: { kind: 'int', min: 10, max: 40 },
    },
    answer: (v: Vars) => Number(v.q) * 10 + Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const q0 = Number(vars.q) * 10;
      return `${vars.a0} ÷ ${vars.b} = ${q0}. ${q0} + ${vars.c} = ${answer}.`;
    },
  }),

  // Q24 — ტექსტური ამოცანა ტომრებზე (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-24', subtopicId: 'u05-round-numbers', difficulty: 3 }),
    prompt: '{total0} კგ კარტოფილი თანაბრად გაანაწილეს {sacks} ტომარაში. რამდენი კილოგრამი კარტოფილია თითოეულ ტომარაში?',
    variables: {
      sacks: { kind: 'int', min: 4, max: 8 },
      perSack: { kind: 'choice', values: [20, 30, 40, 50] },
      total0: { kind: 'choice', values: (v: Vars) => [Number(v.sacks) * Number(v.perSack)] },
    },
    answer: (v: Vars) => Number(v.perSack),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10),
    explanation: ({ vars, answer }) =>
      `${vars.total0} ÷ ${vars.sacks} = ${answer} კგ.`,
  }),

  // =========================================================================
  // U05.5 — უცნობი გასაყოფის და გამყოფის პოვნა (Unknown dividends & divisors)
  // =========================================================================

  // Q25 — უცნობი გასაყოფი (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-25', subtopicId: 'u05-unknown-dividends-divisors', difficulty: 1 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: □ ÷ {b} = {quot}',
    variables: {
      b: { kind: 'int', min: 2, max: 8 },
      quot: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v: Vars) => Number(v.b) * Number(v.quot),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `უცნობი გასაყოფის საპოვნელად გამყოფი გავამრავლოთ განაყოფზე: □ = ${vars.b} × ${vars.quot} = ${answer}.`,
  }),

  // Q26 — უცნობი გამყოფი (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-26', subtopicId: 'u05-unknown-dividends-divisors', difficulty: 1 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: {dividend} ÷ □ = {quot}',
    variables: {
      b: { kind: 'int', min: 2, max: 8 },
      quot: { kind: 'int', min: 2, max: 9 },
      dividend: { kind: 'choice', values: (v: Vars) => [Number(v.b) * Number(v.quot)] },
    },
    answer: (v: Vars) => Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `უცნობი გამყოფის საპოვნელად გასაყოფი გავყოთ განაყოფზე: □ = ${vars.dividend} ÷ ${vars.quot} = ${answer}.`,
  }),

  // Q27 — განტოლება x-ით გასაყოფში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-27', subtopicId: 'u05-unknown-dividends-divisors', difficulty: 2 }),
    prompt: 'ამოხსენი განტოლება: x ÷ {b} = {quot}. რას უდრის x?',
    variables: {
      b: { kind: 'int', min: 2, max: 8 },
      quot: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v: Vars) => Number(v.b) * Number(v.quot),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `x = ${vars.b} × ${vars.quot} = ${answer}.`,
  }),

  // Q28 — განტოლება x-ით გამყოფში (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-28', subtopicId: 'u05-unknown-dividends-divisors', difficulty: 2 }),
    prompt: 'ამოხსენი განტოლება: {dividend} ÷ x = {quot}. რას უდრის x?',
    variables: {
      b: { kind: 'int', min: 2, max: 8 },
      quot: { kind: 'int', min: 2, max: 9 },
      dividend: { kind: 'choice', values: (v: Vars) => [Number(v.b) * Number(v.quot)] },
    },
    answer: (v: Vars) => Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `x = ${vars.dividend} ÷ ${vars.quot} = ${answer}.`,
  }),

  // Q29 — უცნობი გასაყოფი გამოსახულებაში (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-29', subtopicId: 'u05-unknown-dividends-divisors', difficulty: 3 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: □ ÷ {b} + {c} = {total}',
    variables: {
      b: { kind: 'int', min: 2, max: 6 },
      quot: { kind: 'int', min: 2, max: 8 },
      c: { kind: 'int', min: 3, max: 12 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.quot) + Number(v.c)] },
    },
    answer: (v: Vars) => Number(v.b) * Number(v.quot),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const q = Number(vars.quot);
      return `ჯერ ვიპოვოთ განაყოფი: ${vars.total} − ${vars.c} = ${q}. შემდეგ გასაყოფი: □ = ${vars.b} × ${q} = ${answer}.`;
    },
  }),

  // Q30 — ჩაფიქრებული რიცხვის გამოცნობა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-30', subtopicId: 'u05-unknown-dividends-divisors', difficulty: 3 }),
    prompt: 'სანდრომ ჩაიფიქრა რიცხვი, გაყო {b}-ზე და მიიღო {quot}. რა რიცხვი ჩაიფიქრა სანდრომ?',
    variables: {
      b: { kind: 'int', min: 2, max: 8 },
      quot: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v: Vars) => Number(v.b) * Number(v.quot),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `ჩაფიქრებული რიცხვის საპოვნელად განაყოფი გავამრავლოთ გამყოფზე: ${vars.quot} × ${vars.b} = ${answer}.`,
  }),

  // =========================================================================
  // U05.6 — გაყოფის ცხრილები (Using division tables)
  // =========================================================================

  // Q31 — გაყოფის ცხრილის უჯრა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-31', subtopicId: 'u05-division-tables', difficulty: 1 }),
    prompt: 'გაყოფის ცხრილში გასაყოფია {dividend}, გამყოფია {divisor}. რა რიცხვი ჩაიწერება განაყოფის უჯრაში?',
    variables: {
      divisor: { kind: 'int', min: 2, max: 9 },
      quot: { kind: 'int', min: 2, max: 9 },
      dividend: { kind: 'choice', values: (v: Vars) => [Number(v.divisor) * Number(v.quot)] },
    },
    answer: (v: Vars) => Number(v.quot),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.dividend} ÷ ${vars.divisor} = ${answer}.`,
  }),

  // Q32 — ცხრილის სვეტში განაყოფის პოვნა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-32', subtopicId: 'u05-division-tables', difficulty: 1 }),
    prompt: 'გაყოფის ცხრილში {col}-ზე გაყოფის სვეტში რიცხვ {dividend}-ის გასწვრივ წერია:',
    variables: {
      col: { kind: 'int', min: 2, max: 9 },
      row: { kind: 'int', min: 2, max: 9 },
      dividend: { kind: 'choice', values: (v: Vars) => [Number(v.col) * Number(v.row)] },
    },
    answer: (v: Vars) => Number(v.row),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.dividend} ÷ ${vars.col} = ${answer}.`,
  }),

  // Q33 — გამოტოვებული უჯრა გაყოფის ცხრილში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-33', subtopicId: 'u05-division-tables', difficulty: 2 }),
    prompt: 'მოცემულია გაყოფის ცხრილის ფრაგმენტი:\n÷ | {d1} | {d2}\n{div} | {q1} | □\nიპოვე გამოტოვებული რიცხვი □.',
    variables: {
      d1: { kind: 'int', min: 2, max: 5 },
      d2: { kind: 'int', min: 2, max: 5 },
      base: { kind: 'int', min: 2, max: 6 },
      div: { kind: 'choice', values: (v: Vars) => [Number(v.d1) * Number(v.d2) * Number(v.base)] },
      q1: { kind: 'choice', values: (v: Vars) => [Number(v.d2) * Number(v.base)] },
    },
    answer: (v: Vars) => Number(v.d1) * Number(v.base),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.div} ÷ ${vars.d2} = ${answer}.`,
  }),

  // Q34 — მიმდევრობა გაყოფის წესით (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-34', subtopicId: 'u05-division-tables', difficulty: 2 }),
    prompt: 'მიმდევრობაში თითოეული რიცხვი მიიღება წინა რიცხვის {divisor}-ზე გაყოფით: {n1}, {n2}, {n3}, □. იპოვე □.',
    variables: {
      divisor: { kind: 'choice', values: [2, 3] },
      n4: { kind: 'int', min: 2, max: 8 },
      n3: { kind: 'choice', values: (v: Vars) => [Number(v.n4) * Number(v.divisor)] },
      n2: { kind: 'choice', values: (v: Vars) => [Number(v.n4) * Number(v.divisor) * Number(v.divisor)] },
      n1: { kind: 'choice', values: (v: Vars) => [Number(v.n4) * Number(v.divisor) * Number(v.divisor) * Number(v.divisor)] },
    },
    answer: (v: Vars) => Number(v.n4),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.n3} ÷ ${vars.divisor} = ${answer}.`,
  }),

  // Q35 — გამოტოვებული გასაყოფი ცხრილის სათაურში (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-35', subtopicId: 'u05-division-tables', difficulty: 3 }),
    prompt: 'მოცემულია გაყოფის ცხრილის ფრაგმენტი:\n÷ | {d}\n□ | {q1}\n{div2} | {q2}\nიპოვე გამოტოვებული გასაყოფი □.',
    variables: {
      d: { kind: 'int', min: 2, max: 6 },
      q1: { kind: 'int', min: 2, max: 8 },
      q2: { kind: 'int', min: 2, max: 8 },
      div2: { kind: 'choice', values: (v: Vars) => [Number(v.d) * Number(v.q2)] },
    },
    answer: (v: Vars) => Number(v.d) * Number(v.q1),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `რადგან □ ÷ ${vars.d} = ${vars.q1}, ამიტომ □ = ${vars.d} × ${vars.q1} = ${answer}.`,
  }),

  // Q36 — შეცდომის პოვნა გაყოფის მწკრივში (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-36', subtopicId: 'u05-division-tables', difficulty: 3 }),
    prompt: '{divisor}-ზე გაყოფის ცხრილის ერთ მწკრივში წერია განაყოფები: {v1}, {v2}, {wrongVal}, {v4}. რომელი რიცხვია შეცდომით ჩაწერილი?',
    variables: {
      divisor: { kind: 'choice', values: [2, 3, 4, 5] },
      wrongOffset: { kind: 'choice', values: [1, 2, -1, -2] },
      start: { kind: 'int', min: 2, max: 6 },
      v1: { kind: 'choice', values: (v: Vars) => [Number(v.start)] },
      v2: { kind: 'choice', values: (v: Vars) => [Number(v.start) + 1] },
      wrongVal: { kind: 'choice', values: (v: Vars) => [Number(v.start) + 2 + Number(v.wrongOffset)] },
      v4: { kind: 'choice', values: (v: Vars) => [Number(v.start) + 3] },
    },
    answer: (v: Vars) => Number(v.wrongVal),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.v1), Number(vars.v2), Number(vars.v4)],
    explanation: ({ vars, answer }) => {
      const correct = Number(vars.start) + 2;
      return `თანმიმდევრული განაყოფები უნდა იყოს ${vars.v1}, ${vars.v2}, ${correct}, ${vars.v4}. შეცდომით წერია ${answer}, რომლის ნაცვლად უნდა ეწეროს ${correct}.`;
    },
  }),

  // =========================================================================
  // U05.7 — ტექსტური ამოცანები გაყოფაზე (Word problems on division)
  // =========================================================================

  // Q37 — თანაბარი განაწილება ბავშვებზე (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-37', subtopicId: 'u05-word-problems-division', difficulty: 1 }),
    prompt: '{total} კანფეტი თანაბრად გაუნაწილეს {kids} ბავშვს. რამდენი კანფეტი შეხვდა თითოეულ ბავშვს?',
    variables: {
      kids: { kind: 'int', min: 2, max: 8 },
      per: { kind: 'int', min: 2, max: 8 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.kids) * Number(v.per)] },
    },
    answer: (v: Vars) => Number(v.per),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.kids} = ${answer} კანფეტი.`,
  }),

  // Q38 — თაიგულების შეკვრა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-38', subtopicId: 'u05-word-problems-division', difficulty: 1 }),
    prompt: '{total} ყვავილი შეკრეს თაიგულებად, თითოეულში {per} ყვავილი. სულ რამდენი თაიგული გამოვიდა?',
    variables: {
      per: { kind: 'int', min: 3, max: 8 },
      bouquets: { kind: 'int', min: 2, max: 8 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.per) * Number(v.bouquets)] },
    },
    answer: (v: Vars) => Number(v.bouquets),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.per} = ${answer} თაიგული.`,
  }),

  // Q39 — ერთი ნივთის ფასი (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-39', subtopicId: 'u05-word-problems-division', difficulty: 2 }),
    prompt: 'ანა გადაიხადა {total} ლარი {count} ერთნაირ ნაყინში. რა ღირს 1 ასეთი ნაყინი?',
    variables: {
      count: { kind: 'int', min: 2, max: 6 },
      price: { kind: 'int', min: 2, max: 8 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.count) * Number(v.price)] },
    },
    answer: (v: Vars) => Number(v.price),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.count} = ${answer} ლარი.`,
  }),

  // Q40 — რამდენჯერ მეტია (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-40', subtopicId: 'u05-word-problems-division', difficulty: 2 }),
    prompt: 'დათოს აქვს {a} წიგნი, ხოლო ლუკას — {b} წიგნი. რამდენჯერ მეტი წიგნი აქვს დათოს ლუკაზე?',
    variables: {
      b: { kind: 'int', min: 2, max: 8 },
      mult: { kind: 'int', min: 2, max: 8 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) * Number(v.mult)] },
    },
    answer: (v: Vars) => Number(v.mult),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `გავიგოთ რამდენჯერ მეტია: ${vars.a} ÷ ${vars.b} = ${answer}-ჯერ მეტი.`,
  }),

  // Q41 — ბავშვები სკამებზე ორ საფეხურად (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u05-41', subtopicId: 'u05-word-problems-division', difficulty: 3 }),
    prompt: 'ოთახში შემოვიდა {boys} ბიჭი და {girls} გოგონა. ისინი თანაბრად დასხდნენ {benches} სკამზე. რამდენი ბავშვი ზის თითოეულ სკამზე?',
    variables: {
      benches: { kind: 'int', min: 2, max: 6 },
      bPer: { kind: 'int', min: 2, max: 5 },
      gPer: { kind: 'int', min: 2, max: 5 },
      boys: { kind: 'choice', values: (v: Vars) => [Number(v.benches) * Number(v.bPer)] },
      girls: { kind: 'choice', values: (v: Vars) => [Number(v.benches) * Number(v.gPer)] },
    },
    answer: (v: Vars) => Number(v.bPer) + Number(v.gPer),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const totalKids = Number(vars.boys) + Number(vars.girls);
      return `სულ ბავშვია: ${vars.boys} + ${vars.girls} = ${totalKids}. თითო სკამზე ზის: ${totalKids} ÷ ${vars.benches} = ${answer} ბავშვი.`;
    },
  }),

  // Q42 — ნაშთის გარეშე ორსაფეხურიანი შესყიდვა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u05-42', subtopicId: 'u05-word-problems-division', difficulty: 3 }),
    prompt: 'ნიკას ჰქონდა {start} ლარი. მან იყიდა წიგნი {spent} ლარად, ხოლო დარჩენილი ფულით იყიდა {qty} ცალი ერთნაირი ფლომასტერი. რა ღირდა 1 ფლომასტერი?',
    variables: {
      qty: { kind: 'int', min: 2, max: 6 },
      price: { kind: 'int', min: 2, max: 6 },
      spent: { kind: 'int', min: 5, max: 20 },
      start: { kind: 'choice', values: (v: Vars) => [Number(v.spent) + Number(v.qty) * Number(v.price)] },
    },
    answer: (v: Vars) => Number(v.price),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const rem = Number(vars.start) - Number(vars.spent);
      return `დარჩა თანხა: ${vars.start} − ${vars.spent} = ${rem} ლარი. 1 ფლომასტერის ფასია: ${rem} ÷ ${vars.qty} = ${answer} ლარი.`;
    },
  }),
];
