import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

/**
 * Grade 3 — Unit 04: გამრავლება (Multiplication)
 *
 * 11 subtopics, 6 templates per subtopic = 66 authored templates (Q01–Q66).
 * Levels: Level 1 (easy), Level 2 (medium), Level 3 (hard).
 * Formats: Integer entry, Multiple-choice, True/False, Table/Grid models.
 */

const grade = 3 as const;
const topicId = 'g3-gamravleba' as const;
const unitId = 'g3-gamravleba' as const;

export const G3_U04_SUBTOPICS = [
  'u04-facts-0-to-5',
  'u04-facts-6-to-10',
  'u04-full-table',
  'u04-unknown-factors',
  'u04-round-numbers',
  'u04-single-digit-products',
  'u04-rectangular-tables',
  'u04-addition-multiplication-relation',
  'u04-multiplying-same-number',
  'u04-tens-hundreds-multiplication',
  'u04-table-filling',
] as const;

export type G3U04SubtopicId = (typeof G3_U04_SUBTOPICS)[number];

const addr = (spec: { id: string; subtopicId: G3U04SubtopicId; difficulty: 1 | 2 | 3 }) => ({
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

export const G3_U04_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U04.1 — გამრავლება 0-დან 5-მდე (Facts 0 to 5)
  // =========================================================================

  // Q01 — მარტივი გამრავლება 0-დან 5-მდე (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-01', subtopicId: 'u04-facts-0-to-5', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {b} = ?',
    variables: {
      a: { kind: 'int', min: 1, max: 5 },
      b: { kind: 'int', min: 1, max: 5 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q02 — ნულზე და ერთზე გამრავლება (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-02', subtopicId: 'u04-facts-0-to-5', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {special} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      special: { kind: 'choice', values: [0, 1] },
    },
    answer: (v: Vars) => (Number(v.special) === 0 ? 0 : Number(v.a)),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars, answer }) => {
      const a = Number(vars.a);
      const isZero = Number(vars.special) === 0;
      const candidates = isZero ? [a, a + 1, 1] : [0, a + 1, a * 2];
      return candidates.filter((c) => c !== Number(answer));
    },
    explanation: ({ vars, answer }) =>
      Number(vars.special) === 0
        ? `ნებისმიერი რიცხვის ნულზე ნამრავლი უდრის 0-ს: ${vars.a} × 0 = 0.`
        : `ნებისმიერი რიცხვის 1-ზე ნამრავლი უდრის იმავე რიცხვს: ${vars.a} × 1 = ${answer}.`,
  }),

  // Q03 — ტექსტური ამოცანა ჯგუფებზე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-03', subtopicId: 'u04-facts-0-to-5', difficulty: 2 }),
    prompt: '{plates} თეფშზე დევს {apples}–{apples} ვაშლი. სულ რამდენი ვაშლია თეფშებზე?',
    variables: {
      plates: { kind: 'int', min: 2, max: 5 },
      apples: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v: Vars) => Number(v.plates) * Number(v.apples),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `თეფშების რაოდენობა გავამრავლოთ ვაშლების რაოდენობაზე: ${vars.plates} × ${vars.apples} = ${answer} ვაშლი.`,
  }),

  // Q04 — ნამრავლების შედარება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-04', subtopicId: 'u04-facts-0-to-5', difficulty: 2 }),
    prompt: 'ჩასვი შესაბამისი ნიშანი: {a} × {b} □ {c} × {d}',
    variables: {
      a: { kind: 'int', min: 1, max: 5 },
      b: { kind: 'int', min: 1, max: 5 },
      c: { kind: 'int', min: 1, max: 5 },
      d: { kind: 'int', min: 1, max: 5 },
    },
    answer: (v: Vars) => {
      const p1 = Number(v.a) * Number(v.b);
      const p2 = Number(v.c) * Number(v.d);
      return p1 > p2 ? '>' : p1 < p2 ? '<' : '=';
    },
    format: { kind: 'text' },
    optionCount: 3,
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) => {
      const p1 = Number(vars.a) * Number(vars.b);
      const p2 = Number(vars.c) * Number(vars.d);
      return `${vars.a} × ${vars.b} = ${p1}, ხოლო ${vars.c} × ${vars.d} = ${p2}. რადგან ${p1} ${answer} ${p2}, სწორი ნიშანია '${answer}'.`;
    },
  }),

  // Q05 — გამრავლება და მიმატება (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-05', subtopicId: 'u04-facts-0-to-5', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × {b} + {c} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 5 },
      b: { kind: 'int', min: 2, max: 5 },
      c: { kind: 'int', min: 3, max: 15 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const prod = Number(vars.a) * Number(vars.b);
      return `პირველ რიგში ვასრულებთ გამრავლებას: ${vars.a} × ${vars.b} = ${prod}. შემდეგ ვუმატებთ ${vars.c}: ${prod} + ${vars.c} = ${answer}.`;
    },
  }),

  // Q06 — ტექსტური ამოცანა ორ საფეხურად (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-06', subtopicId: 'u04-facts-0-to-5', difficulty: 3 }),
    prompt: 'დათომ იყიდა {notebooks} რვეული, თითო {p} ლარად, და 1 კალამი {pen} ლარად. სულ რამდენი ლარი გადაიხადა დათომ?',
    variables: {
      notebooks: { kind: 'int', min: 2, max: 6 },
      p: { kind: 'int', min: 2, max: 5 },
      pen: { kind: 'int', min: 2, max: 8 },
    },
    answer: (v: Vars) => Number(v.notebooks) * Number(v.p) + Number(v.pen),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const nCost = Number(vars.notebooks) * Number(vars.p);
      return `რვეულების ფასია: ${vars.notebooks} × ${vars.p} = ${nCost} ლარი. სულ: ${nCost} + ${vars.pen} = ${answer} ლარი.`;
    },
  }),

  // =========================================================================
  // U04.2 — გამრავლება 6-დან 10-მდე (Facts 6 to 10)
  // =========================================================================

  // Q07 — საბაზისო გამრავლება 6-დან 10-მდე (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-07', subtopicId: 'u04-facts-6-to-10', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {b} = ?',
    variables: {
      a: { kind: 'int', min: 6, max: 10 },
      b: { kind: 'int', min: 2, max: 10 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q08 — 10-ზე გამრავლება (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-08', subtopicId: 'u04-facts-6-to-10', difficulty: 1 }),
    prompt: 'რას უდრის {n} × 10?',
    variables: {
      n: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => Number(v.n) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      return [n + 10, (n - 1) * 10, (n + 1) * 10].filter((c) => c !== Number(answer));
    },
    explanation: ({ vars, answer }) =>
      `რიცხვის 10-ზე გასამრავლებლად მას მარჯვნივ ვუწერთ ერთ ნულს: ${vars.n} × 10 = ${answer}.`,
  }),

  // Q09 — ტექსტური ამოცანა ყუთებზე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-09', subtopicId: 'u04-facts-6-to-10', difficulty: 2 }),
    prompt: '{boxes} ყუთში დევს {pencils}–{pencils} ფანქარი. სულ რამდენი ფანქარია?',
    variables: {
      boxes: { kind: 'int', min: 6, max: 9 },
      pencils: { kind: 'int', min: 6, max: 9 },
    },
    answer: (v: Vars) => Number(v.boxes) * Number(v.pencils),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.boxes} × ${vars.pencils} = ${answer} ფანქარი.`,
  }),

  // Q10 — გამოსახულებების შედარება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-10', subtopicId: 'u04-facts-6-to-10', difficulty: 2 }),
    prompt: 'ჩასვი შესაბამისი ნიშანი: {a} × {b} □ {c} × {d}',
    variables: {
      a: { kind: 'int', min: 6, max: 9 },
      b: { kind: 'int', min: 6, max: 9 },
      c: { kind: 'int', min: 6, max: 9 },
      d: { kind: 'int', min: 6, max: 9 },
    },
    answer: (v: Vars) => {
      const p1 = Number(v.a) * Number(v.b);
      const p2 = Number(v.c) * Number(v.d);
      return p1 > p2 ? '>' : p1 < p2 ? '<' : '=';
    },
    format: { kind: 'text' },
    optionCount: 3,
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) => {
      const p1 = Number(vars.a) * Number(vars.b);
      const p2 = Number(vars.c) * Number(vars.d);
      return `${vars.a} × ${vars.b} = ${p1}, ${vars.c} × ${vars.d} = ${p2}. ${p1} ${answer} ${p2}.`;
    },
  }),

  // Q11 — გამოკლება და გამრავლება (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-11', subtopicId: 'u04-facts-6-to-10', difficulty: 3 }),
    prompt: 'გამოთვალე: 100 − {a} × {b} = ?',
    variables: {
      a: { kind: 'int', min: 6, max: 9 },
      b: { kind: 'int', min: 6, max: 9 },
    },
    answer: (v: Vars) => 100 - Number(v.a) * Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const prod = Number(vars.a) * Number(vars.b);
      return `ჯერ ვამრავლებთ: ${vars.a} × ${vars.b} = ${prod}. შემდეგ: 100 − ${prod} = ${answer}.`;
    },
  }),

  // Q12 — სკოლის დარბაზის ამოცანა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-12', subtopicId: 'u04-facts-6-to-10', difficulty: 3 }),
    prompt: 'სკოლის დარბაზში არის {rows} რიგი, თითოეულ რიგში {seats} სკამია. სულ რამდენი სკამია დარბაზში?',
    variables: {
      rows: { kind: 'int', min: 6, max: 10 },
      seats: { kind: 'int', min: 6, max: 10 },
    },
    answer: (v: Vars) => Number(v.rows) * Number(v.seats),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.rows} × ${vars.seats} = ${answer} სკამი.`,
  }),

  // =========================================================================
  // U04.3 — გამრავლების სრული ცხრილი (The Full Multiplication Table)
  // =========================================================================

  // Q13 — ცხრილის ნამრავლი (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-13', subtopicId: 'u04-full-table', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {b} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q14 — მამრავლების პოვნა ნამრავლით (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-14', subtopicId: 'u04-full-table', difficulty: 1 }),
    prompt: 'რომელი ორი რიცხვის ნამრავლია {prod}?',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      b: { kind: 'int', min: 3, max: 9 },
      prod: { kind: 'choice', values: (v: Vars) => [Number(v.a) * Number(v.b)] },
    },
    answer: (v: Vars) => `${v.a} და ${v.b}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [
        `${a + 1} და ${b}`,
        `${a} და ${b - 1}`,
        `${a - 1} და ${b + 1}`,
      ];
    },
    explanation: ({ vars }) =>
      `${vars.a} × ${vars.b} = ${vars.prod}, ამიტომ სწორი პასუხია ${vars.a} და ${vars.b}.`,
  }),

  // Q15 — გადასაცვლელობის თვისება (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-15', subtopicId: 'u04-full-table', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {a} × {b} = {b} × □',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      b: { kind: 'int', min: 3, max: 9 },
    },
    answer: (v: Vars) => Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.b), Number(vars.a) + 1, Number(vars.a) - 1],
    explanation: ({ vars }) =>
      `გამრავლების გადასაცვლელობის კანონის თანახმად: ${vars.a} × ${vars.b} = ${vars.b} × ${vars.a}. გამოტოვებული რიცხვია ${vars.a}.`,
  }),

  // Q16 — ჭეშმარიტი ტოლობის არჩევა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-16', subtopicId: 'u04-full-table', difficulty: 2 }),
    prompt: 'მოცემულია გამრავლება {a} × {b}. რომელი ტოლობაა ჭეშმარიტი?',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      b: { kind: 'int', min: 3, max: 9 },
    },
    answer: (v: Vars) => `${v.a} × ${v.b} = ${Number(v.a) * Number(v.b)}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const p = a * b;
      return [
        `${a} × ${b} = ${p + 2}`,
        `${a} × ${b} = ${p - 3}`,
        `${a} × ${b} = ${p + 5}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}, ამიტომ სწორი ტოლობაა ${answer}.`,
  }),

  // Q17 — ორი ნამრავლის სხვაობა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-17', subtopicId: 'u04-full-table', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × {b} − {c} × {d} = ?',
    variables: {
      a: { kind: 'int', min: 6, max: 9 },
      b: { kind: 'int', min: 6, max: 9 },
      c: { kind: 'int', min: 2, max: 5 },
      d: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b) - Number(v.c) * Number(v.d),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const p1 = Number(vars.a) * Number(vars.b);
      const p2 = Number(vars.c) * Number(vars.d);
      return `${vars.a} × ${vars.b} = ${p1}, ${vars.c} × ${vars.d} = ${p2}. ${p1} − ${p2} = ${answer}.`;
    },
  }),

  // Q18 — ფულის დათვლა მონეტებითა და კუპიურებით (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-18', subtopicId: 'u04-full-table', difficulty: 3 }),
    prompt: 'ნინოს აქვს {coins} ცალი {cVal}-ლარიანი მონეტა და {notes} ცალი {nVal}-ლარიანი კუპიურა. სულ რამდენი ლარი აქვს ნინოს?',
    variables: {
      coins: { kind: 'int', min: 3, max: 8 },
      cVal: { kind: 'choice', values: [2, 5] },
      notes: { kind: 'int', min: 2, max: 6 },
      nVal: { kind: 'choice', values: [5, 10] },
    },
    answer: (v: Vars) => Number(v.coins) * Number(v.cVal) + Number(v.notes) * Number(v.nVal),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const cTotal = Number(vars.coins) * Number(vars.cVal);
      const nTotal = Number(vars.notes) * Number(vars.nVal);
      return `მონეტები: ${vars.coins} × ${vars.cVal} = ${cTotal} ლარი. კუპიურები: ${vars.notes} × ${vars.nVal} = ${nTotal} ლარი. სულ: ${cTotal} + ${nTotal} = ${answer} ლარი.`;
    },
  }),

  // =========================================================================
  // U04.4 — უცნობი თანამამრავლი (Unknown Factors)
  // =========================================================================

  // Q19 — უცნობი მეორე მამრავლი (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-19', subtopicId: 'u04-unknown-factors', difficulty: 1 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: {a} × □ = {prod}',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 2, max: 9 },
      prod: { kind: 'choice', values: (v: Vars) => [Number(v.a) * Number(v.b)] },
    },
    answer: (v: Vars) => Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `უცნობი მამრავლის საპოვნელად ნამრავლი გავყოთ ცნობილ მამრავლზე: ${vars.prod} ÷ ${vars.a} = ${answer}.`,
  }),

  // Q20 — უცნობი პირველი მამრავლი (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-20', subtopicId: 'u04-unknown-factors', difficulty: 1 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: □ × {b} = {prod}',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 2, max: 9 },
      prod: { kind: 'choice', values: (v: Vars) => [Number(v.a) * Number(v.b)] },
    },
    answer: (v: Vars) => Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `□ = ${vars.prod} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q21 — განტოლება x-ით (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-21', subtopicId: 'u04-unknown-factors', difficulty: 2 }),
    prompt: 'ამოხსენი განტოლება: {a} × x = {prod}. რას უდრის x?',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      x: { kind: 'int', min: 3, max: 9 },
      prod: { kind: 'choice', values: (v: Vars) => [Number(v.a) * Number(v.x)] },
    },
    answer: (v: Vars) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `x = ${vars.prod} ÷ ${vars.a} = ${answer}.`,
  }),

  // Q22 — ტექსტური ამოცანა განაწილებაზე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-22', subtopicId: 'u04-unknown-factors', difficulty: 2 }),
    prompt: '{total} კანფეტი თანაბრად გაუნაწილეს {kids} ბავშვს. თითოეულმა მიიღო □ კანფეტი. იპოვე □.',
    variables: {
      kids: { kind: 'int', min: 3, max: 8 },
      each: { kind: 'int', min: 3, max: 8 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.kids) * Number(v.each)] },
    },
    answer: (v: Vars) => Number(v.each),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `კანფეტების საერთო რაოდენობა გავყოთ ბავშვების რაოდენობაზე: ${vars.total} ÷ ${vars.kids} = ${answer}.`,
  }),

  // Q23 — უტოლობის შევსება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-23', subtopicId: 'u04-unknown-factors', difficulty: 3 }),
    prompt: 'რა უდიდესი მთელი რიცხვი შეიძლება ჩაისვას □-ის ნაცვლად, რომ უტოლობა იყოს ჭეშმარიტი: {a} × □ < {limit}?',
    variables: {
      a: { kind: 'int', min: 4, max: 8 },
      maxFactor: { kind: 'int', min: 3, max: 8 },
      limit: { kind: 'choice', values: (v: Vars) => [Number(v.a) * Number(v.maxFactor) + 2] },
    },
    answer: (v: Vars) => Number(v.maxFactor),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const a = Number(vars.a);
      const ans = Number(answer);
      const lim = Number(vars.limit);
      return `${a} × ${ans} = ${a * ans} < ${lim}, ხოლო ${a} × ${ans + 1} = ${a * (ans + 1)} ≥ ${lim}. ამიტომ უდიდესი მნიშვნელობაა ${answer}.`;
    },
  }),

  // Q24 — უცნობი მამრავლი გამოსახულებაში (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-24', subtopicId: 'u04-unknown-factors', difficulty: 3 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: {a} × □ + {c} = {total}',
    variables: {
      a: { kind: 'int', min: 3, max: 7 },
      box: { kind: 'int', min: 3, max: 8 },
      c: { kind: 'int', min: 4, max: 15 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.a) * Number(v.box) + Number(v.c)] },
    },
    answer: (v: Vars) => Number(v.box),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const diff = Number(vars.total) - Number(vars.c);
      return `ჯერ გამოვაკლოთ ${vars.c}: ${vars.total} − ${vars.c} = ${diff}. შემდეგ გავყოთ ${vars.a}-ზე: ${diff} ÷ ${vars.a} = ${answer}.`;
    },
  }),

  // =========================================================================
  // U04.5 — მრგვალ რიცხვებზე გამრავლება (Multiplication by Round Numbers)
  // =========================================================================

  // Q25 — ერთნიშნას გამრავლება მრგვალ ათეულზე (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-25', subtopicId: 'u04-round-numbers', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {b0} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 8 },
      b: { kind: 'int', min: 2, max: 6 },
      b0: { kind: 'choice', values: (v: Vars) => [Number(v.b) * 10] },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b0),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10),
    explanation: ({ vars, answer }) =>
      `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}, ამიტომ ${vars.a} × ${vars.b0} = ${answer}.`,
  }),

  // Q26 — მრგვალი ათეულის გამრავლება ერთნიშნაზე (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-26', subtopicId: 'u04-round-numbers', difficulty: 1 }),
    prompt: 'რას უდრის {b0} × {a}?',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      b: { kind: 'int', min: 2, max: 7 },
      b0: { kind: 'choice', values: (v: Vars) => [Number(v.b) * 10] },
    },
    answer: (v: Vars) => Number(v.b0) * Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10),
    explanation: ({ vars, answer }) =>
      `${vars.b0} × ${vars.a} = ${answer}.`,
  }),

  // Q27 — 100-ზე გამრავლება (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-27', subtopicId: 'u04-round-numbers', difficulty: 2 }),
    prompt: 'გამოთვალე: {n} × 100 = ?',
    variables: {
      n: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => Number(v.n) * 100,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100),
    explanation: ({ vars, answer }) =>
      `რიცხვის 100-ზე გასამრავლებლად მას მარჯვნივ ვუწერთ ორ ნულს: ${vars.n} × 100 = ${answer}.`,
  }),

  // Q28 — ტექსტური ამოცანა შეკვრებზე (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-28', subtopicId: 'u04-round-numbers', difficulty: 2 }),
    prompt: 'მაღაზიაში მიიტანეს {packs} შეკვრა რვეული. თითოეულ შეკვრაში {perPack} რვეულია. სულ რამდენი რვეული მიიტანეს?',
    variables: {
      packs: { kind: 'int', min: 3, max: 8 },
      perPack: { kind: 'choice', values: [20, 30, 40, 50] },
    },
    answer: (v: Vars) => Number(v.packs) * Number(v.perPack),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10),
    explanation: ({ vars, answer }) =>
      `${vars.packs} × ${vars.perPack} = ${answer} რვეული.`,
  }),

  // Q29 — მრგვალი რიცხვის ნამრავლი შეკრებით (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-29', subtopicId: 'u04-round-numbers', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × {b0} + {c} = ?',
    variables: {
      a: { kind: 'int', min: 3, max: 7 },
      b: { kind: 'int', min: 2, max: 5 },
      b0: { kind: 'choice', values: (v: Vars) => [Number(v.b) * 10] },
      c: { kind: 'int', min: 12, max: 45 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b0) + Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const prod = Number(vars.a) * Number(vars.b0);
      return `${vars.a} × ${vars.b0} = ${prod}. ${prod} + ${vars.c} = ${answer}.`;
    },
  }),

  // Q30 — გამოტოვებული მრგვალი მამრავლი (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-30', subtopicId: 'u04-round-numbers', difficulty: 3 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: {a} × □ = {total}',
    variables: {
      a: { kind: 'int', min: 3, max: 8 },
      roundFactor: { kind: 'choice', values: [20, 30, 40, 50] },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.a) * Number(v.roundFactor)] },
    },
    answer: (v: Vars) => Number(v.roundFactor),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10),
    explanation: ({ vars, answer }) =>
      `□ = ${vars.total} ÷ ${vars.a} = ${answer}.`,
  }),

  // =========================================================================
  // U04.6 — ერთნიშნა რიცხვებზე ნამრავლი (Products with Single-Digit Numbers)
  // =========================================================================

  // Q31 — სამი ერთნიშნა რიცხვის ნამრავლი (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-31', subtopicId: 'u04-single-digit-products', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {b} × {c} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 4 },
      b: { kind: 'int', min: 2, max: 4 },
      c: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b) * Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const p1 = Number(vars.a) * Number(vars.b);
      return `${vars.a} × ${vars.b} = ${p1}. ${p1} × ${vars.c} = ${answer}.`;
    },
  }),

  // Q32 — ნამრავლის ლუწ-კენტობა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-32', subtopicId: 'u04-single-digit-products', difficulty: 1 }),
    prompt: 'ლუწია თუ კენტი ნამრავლი {a} × {b}?',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v: Vars) => ((Number(v.a) * Number(v.b)) % 2 === 0 ? 'ლუწი' : 'კენტი'),
    format: { kind: 'text' },
    optionCount: 2,
    options: () => ['ლუწი', 'კენტი'],
    explanation: ({ vars, answer }) => {
      const prod = Number(vars.a) * Number(vars.b);
      return `${vars.a} × ${vars.b} = ${prod}, რაც არის ${answer} რიცხვი.`;
    },
  }),

  // Q33 — განრიგებადობის კანონი (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-33', subtopicId: 'u04-single-digit-products', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} × ({b} + {c}) = ?',
    variables: {
      a: { kind: 'int', min: 3, max: 7 },
      b: { kind: 'int', min: 2, max: 5 },
      c: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v: Vars) => Number(v.a) * (Number(v.b) + Number(v.c)),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const sum = Number(vars.b) + Number(vars.c);
      return `ჯერ ვასრულებთ მოქმედებას ფრჩხილებში: ${vars.b} + ${vars.c} = ${sum}. შემდეგ: ${vars.a} × ${sum} = ${answer}.`;
    },
  }),

  // Q34 — ბოლო ციფრი ნამრავლში (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-34', subtopicId: 'u04-single-digit-products', difficulty: 2 }),
    prompt: 'რა ციფრით ბოლოვდება {a} × {b}?',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      b: { kind: 'int', min: 3, max: 9 },
    },
    answer: (v: Vars) => (Number(v.a) * Number(v.b)) % 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => {
      const ans = Number(answer);
      return [(ans + 2) % 10, (ans + 4) % 10, (ans + 5) % 10].filter((d) => d !== ans);
    },
    explanation: ({ vars, answer }) => {
      const prod = Number(vars.a) * Number(vars.b);
      return `${vars.a} × ${vars.b} = ${prod}, რომელიც ბოლოვდება ციფრით ${answer}.`;
    },
  }),

  // Q35 — მამრავლებად დაშლა ჯამის მიხედვით (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-35', subtopicId: 'u04-single-digit-products', difficulty: 3 }),
    prompt: 'რიცხვი {prod} დაშალე ორ ერთნიშნა მამრავლად, რომელთა ჯამია {sum}. იპოვე უდიდესი მამრავლი.',
    variables: {
      a: { kind: 'int', min: 3, max: 7 },
      diff: { kind: 'int', min: 1, max: 3 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.a) + Number(v.diff)] },
      prod: { kind: 'choice', values: (v: Vars) => [Number(v.a) * (Number(v.a) + Number(v.diff))] },
      sum: { kind: 'choice', values: (v: Vars) => [Number(v.a) + (Number(v.a) + Number(v.diff))] },
    },
    answer: (v: Vars) => Math.max(Number(v.a), Number(v.b)),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.a} × ${vars.b} = ${vars.prod} და ${vars.a} + ${vars.b} = ${vars.sum}. უდიდესი მამრავლია ${answer}.`,
  }),

  // Q36 — სამსაფეხურიანი ტექსტური ამოცანა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-36', subtopicId: 'u04-single-digit-products', difficulty: 3 }),
    prompt: 'მაღაზიაში {shelves} თაროა. თითოეულ თაროზე დევს {boxes} ყუთი, თითო ყუთში კი {toys} სათამაშოა. სულ რამდენი სათამაშოა?',
    variables: {
      shelves: { kind: 'int', min: 2, max: 4 },
      boxes: { kind: 'int', min: 3, max: 5 },
      toys: { kind: 'int', min: 2, max: 4 },
    },
    answer: (v: Vars) => Number(v.shelves) * Number(v.boxes) * Number(v.toys),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const bTotal = Number(vars.shelves) * Number(vars.boxes);
      return `ყუთების რაოდენობა: ${vars.shelves} × ${vars.boxes} = ${bTotal}. სათამაშოების საერთო რაოდენობა: ${bTotal} × ${vars.toys} = ${answer}.`;
    },
  }),

  // =========================================================================
  // U04.7 — მართკუთხა ცხრილები და ილუსტრაციები (Rectangular Tables & Models)
  // =========================================================================

  // Q37 — მართკუთხა ბადის უჯრები (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-37', subtopicId: 'u04-rectangular-tables', difficulty: 1 }),
    prompt: 'მართკუთხა ბადეში არის {rows} რიგი და {cols} სვეტი. სულ რამდენი უჯრაა ბადეში?',
    variables: {
      rows: { kind: 'int', min: 3, max: 8 },
      cols: { kind: 'int', min: 3, max: 8 },
    },
    answer: (v: Vars) => Number(v.rows) * Number(v.cols),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `რიგების რაოდენობა გავამრავლოთ სვეტების რაოდენობაზე: ${vars.rows} × ${vars.cols} = ${answer} უჯრა.`,
  }),

  // Q38 — ნახატის შესაბამისი გამოსახულება (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-38', subtopicId: 'u04-rectangular-tables', difficulty: 1 }),
    prompt: 'სურათზე მოცემულია {rows} რიგი, თითოეულ რიგში {cols} ვარსკვლავია (⭐). რომელი გამოსახულებით გამოითვლება ვარსკვლავების საერთო რაოდენობა?',
    variables: {
      rows: { kind: 'int', min: 2, max: 6 },
      cols: { kind: 'int', min: 3, max: 7 },
    },
    answer: (v: Vars) => `${v.rows} × ${v.cols}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const r = Number(vars.rows);
      const c = Number(vars.cols);
      return [
        `${r} + ${c}`,
        `${r + 1} × ${c}`,
        `${r} × ${c + 1}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${vars.rows} რიგი ${vars.cols}–${vars.cols} ელემენტით ჩაიწერება როგორც ${answer}.`,
  }),

  // Q39 — იატაკის ფილები (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-39', subtopicId: 'u04-rectangular-tables', difficulty: 2 }),
    prompt: 'ოთახის იატაკის დასაგებად საჭიროა {rows} რიგი, თითოეულ რიგში {cols} ფილა. სულ რამდენი ფილაა საჭირო?',
    variables: {
      rows: { kind: 'int', min: 5, max: 9 },
      cols: { kind: 'int', min: 4, max: 8 },
    },
    answer: (v: Vars) => Number(v.rows) * Number(v.cols),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.rows} × ${vars.cols} = ${answer} ფილა.`,
  }),

  // Q40 — ბაღში ხეების რიგები (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-40', subtopicId: 'u04-rectangular-tables', difficulty: 2 }),
    prompt: 'ბაღში ხეები დარგულია {rows} რიგად, თითოეულ რიგში {cols} ხეა. სულ რამდენი ხეა ბაღში?',
    variables: {
      rows: { kind: 'int', min: 4, max: 8 },
      cols: { kind: 'int', min: 5, max: 9 },
    },
    answer: (v: Vars) => Number(v.rows) * Number(v.cols),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.rows} × ${vars.cols} = ${answer} ხე.`,
  }),

  // Q41 — გამოტოვებული განზომილება ბადეში (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-41', subtopicId: 'u04-rectangular-tables', difficulty: 3 }),
    prompt: 'მართკუთხა ბადეში სულ არის {total} უჯრა და {rows} რიგი. რამდენი სვეტია ამ ბადეში?',
    variables: {
      rows: { kind: 'int', min: 4, max: 8 },
      cols: { kind: 'int', min: 4, max: 9 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.rows) * Number(v.cols)] },
    },
    answer: (v: Vars) => Number(v.cols),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `სვეტების რაოდენობა = უჯრების საერთო რაოდენობა ÷ რიგების რაოდენობა: ${vars.total} ÷ ${vars.rows} = ${answer} სვეტი.`,
  }),

  // Q42 — ბადის დაყოფა ორ ნაწილად (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-42', subtopicId: 'u04-rectangular-tables', difficulty: 3 }),
    prompt: 'მართკუთხა ბადე ზომით {r} × {c} გაყვეს ორ ნაწილად: {r} × {c1} და {r} × {c2} (სადაც {c1} + {c2} = {c}). რას უდრის მთლიანი ბადის უჯრების რაოდენობა?',
    variables: {
      r: { kind: 'int', min: 4, max: 7 },
      c1: { kind: 'int', min: 2, max: 4 },
      c2: { kind: 'int', min: 2, max: 4 },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.c1) + Number(v.c2)] },
    },
    answer: (v: Vars) => Number(v.r) * (Number(v.c1) + Number(v.c2)),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const p1 = Number(vars.r) * Number(vars.c1);
      const p2 = Number(vars.r) * Number(vars.c2);
      return `${vars.r} × ${vars.c1} = ${p1}, ${vars.r} × ${vars.c2} = ${p2}. სულ: ${p1} + ${p2} = ${vars.r} × ${vars.c} = ${answer}.`;
    },
  }),

  // =========================================================================
  // U04.8 — კავშირი შეკრებასა და გამრავლებას შორის (Addition & Multiplication Relation)
  // =========================================================================

  // Q43 — განმეორებითი შეკრების გამოთვლა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-43', subtopicId: 'u04-addition-multiplication-relation', difficulty: 1 }),
    prompt: 'გამოთვალე გამრავლების გამოყენებით: {a} + {a} + {a} + {a} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => 4 * Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `4 ცალი ${vars.a}-ის შეკრება იგივეა, რაც 4 × ${vars.a} = ${answer}.`,
  }),

  // Q44 — შეკრების ჩაწერა გამრავლების სახით (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-44', subtopicId: 'u04-addition-multiplication-relation', difficulty: 1 }),
    prompt: 'როგორ ჩაიწერება შეკრება {a} + {a} + {a} + {a} + {a} გამრავლების სახით?',
    variables: {
      a: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => `5 × ${v.a}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      return [`4 × ${a}`, `6 × ${a}`, `5 + ${a}`];
    },
    explanation: ({ vars, answer }) =>
      `რადგან ${vars.a} მეორდება 5-ჯერ, იგი ჩაიწერება როგორც ${answer}.`,
  }),

  // Q45 — გამოტოვებული შესაკრები ტოლობაში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-45', subtopicId: 'u04-addition-multiplication-relation', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: 3 × {a} = {a} + {a} + □',
    variables: {
      a: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.a) * 2, Number(vars.a) + 1, 3],
    explanation: ({ vars }) =>
      `3 × ${vars.a} ნიშნავს სამი ${vars.a}-ის შეკრებას: ${vars.a} + ${vars.a} + ${vars.a}. გამოტოვებული რიცხვია ${vars.a}.`,
  }),

  // Q46 — შეკრებისა და გამრავლების შედარება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-46', subtopicId: 'u04-addition-multiplication-relation', difficulty: 2 }),
    prompt: 'ჩასვი შესაბამისი ნიშანი: {a} + {a} + {a} □ {k} × {a}',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      k: { kind: 'int', min: 2, max: 4 },
    },
    answer: (v: Vars) => {
      const k = Number(v.k);
      return 3 > k ? '>' : 3 < k ? '<' : '=';
    },
    format: { kind: 'text' },
    optionCount: 3,
    options: () => ['<', '>', '='],
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.a} + ${vars.a} არის 3 × ${vars.a}, ხოლო მარჯვნივაა ${vars.k} × ${vars.a}. სწორი ნიშანია '${answer}'.`,
  }),

  // Q47 — ნამრავლის დაშლა ორ ნამრავლად (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-47', subtopicId: 'u04-addition-multiplication-relation', difficulty: 3 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: 7 × {a} = 5 × {a} + □ × {a}',
    variables: {
      a: { kind: 'int', min: 2, max: 15 },
    },
    answer: () => 2,
    format: { kind: 'integer', min: 0 },
    distractors: () => [1, 3, 4],
    explanation: ({ vars }) =>
      `7 × ${vars.a} = (5 + 2) × ${vars.a} = 5 × ${vars.a} + 2 × ${vars.a}. გამოტოვებული რიცხვია 2.`,
  }),

  // Q48 — ყოველდღიური მოქმედების გამოსახულება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-48', subtopicId: 'u04-addition-multiplication-relation', difficulty: 3 }),
    prompt: 'სანდრო ყოველდღე კითხულობს {pages} გვერდს {days} დღის განმავლობაში. რომელი გამოსახულება გვიჩვენებს წაკითხული გვერდების საერთო რაოდენობას?',
    variables: {
      pages: { kind: 'int', min: 4, max: 9 },
      days: { kind: 'int', min: 4, max: 7 },
    },
    answer: (v: Vars) => `${v.days} × ${v.pages}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.days} + ${vars.pages}`,
      `${vars.days} × ${Number(vars.pages) + 1}`,
      `${Number(vars.days) - 1} × ${vars.pages}`,
    ],
    explanation: ({ vars, answer }) =>
      `ყოველდღე ${vars.pages} გვერდი ${vars.days} დღის მანძილზე ჩაიწერება როგორც ${answer}.`,
  }),

  // =========================================================================
  // U04.9 — იმავე რიცხვზე გამრავლება (Multiplying by the Same Number)
  // =========================================================================

  // Q49 — რიცხვის თავის თავზე გამრავლება (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-49', subtopicId: 'u04-multiplying-same-number', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {a} = ?',
    variables: {
      a: { kind: 'int', min: 1, max: 15 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.a} = ${answer}.`,
  }),

  // Q50 — კვადრატული რიცხვის ამოცნობა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-50', subtopicId: 'u04-multiplying-same-number', difficulty: 1 }),
    prompt: 'რომელი რიცხვია {base}-ის თავის თავზე ნამრავლი ({base} × {base})?',
    variables: {
      base: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => Number(v.base) * Number(v.base),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => {
      const b = Number(vars.base);
      const sq = b * b;
      return [sq - 2, sq + 3, sq - 5];
    },
    explanation: ({ vars, answer }) =>
      `${vars.base} × ${vars.base} = ${answer}.`,
  }),

  // Q51 — კვადრატის ფართობი (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-51', subtopicId: 'u04-multiplying-same-number', difficulty: 2 }),
    prompt: 'კვადრატის გვერდის სიგრძეა {side} სმ. რას უდრის მისი ფართობი კვადრატულ სანტიმეტრებში?',
    variables: {
      side: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => Number(v.side) * Number(v.side),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `კვადრატის ფართობი = გვერდი × გვერდი = ${vars.side} × ${vars.side} = ${answer} სმ².`,
  }),

  // Q52 — ფესვის შებრუნებული ამოცანა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-52', subtopicId: 'u04-multiplying-same-number', difficulty: 2 }),
    prompt: 'რომელი რიცხვი უნდა გავამრავლოთ თავის თავზე, რომ მივიღოთ {sq}?',
    variables: {
      base: { kind: 'int', min: 2, max: 15 },
      sq: { kind: 'choice', values: (v: Vars) => [Number(v.base) * Number(v.base)] },
    },
    answer: (v: Vars) => Number(v.base),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${answer} × ${answer} = ${vars.sq}, ამიტომ საძიებელი რიცხვია ${answer}.`,
  }),

  // Q53 — ორი კვადრატის ჯამი (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-53', subtopicId: 'u04-multiplying-same-number', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × {a} + {b} × {b} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      b: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.a) + Number(v.b) * Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const sq1 = Number(vars.a) * Number(vars.a);
      const sq2 = Number(vars.b) * Number(vars.b);
      return `${vars.a} × ${vars.a} = ${sq1}, ${vars.b} × ${vars.b} = ${sq2}. ${sq1} + ${sq2} = ${answer}.`;
    },
  }),

  // Q54 — მომდევნო კვადრატების სხვაობა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-54', subtopicId: 'u04-multiplying-same-number', difficulty: 3 }),
    prompt: 'რამდენით მეტია {next} × {next} რიცხვ {a} × {a}-ზე?',
    variables: {
      a: { kind: 'int', min: 2, max: 15 },
      next: { kind: 'choice', values: (v: Vars) => [Number(v.a) + 1] },
    },
    answer: (v: Vars) => (Number(v.a) + 1) * (Number(v.a) + 1) - Number(v.a) * Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const sq1 = Number(vars.a) * Number(vars.a);
      const sq2 = Number(vars.next) * Number(vars.next);
      return `${vars.next} × ${vars.next} = ${sq2}, ხოლო ${vars.a} × ${vars.a} = ${sq1}. სხვაობაა: ${sq2} − ${sq1} = ${answer}.`;
    },
  }),

  // =========================================================================
  // U04.10 — ათეულებისა და ასეულების გამრავლება (Tens & Hundreds Multiplication)
  // =========================================================================

  // Q55 — ერთნიშნა გამრავლებული ასეულზე (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-55', subtopicId: 'u04-tens-hundreds-multiplication', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {h00} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 5 },
      h: { kind: 'int', min: 1, max: 4 },
      h00: { kind: 'choice', values: (v: Vars) => [Number(v.h) * 100] },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.h00),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100),
    explanation: ({ vars, answer }) =>
      `${vars.a} × ${vars.h} = ${Number(vars.a) * Number(vars.h)}, ამიტომ ${vars.a} × ${vars.h00} = ${answer}.`,
  }),

  // Q56 — ასეულის გამრავლება ერთნიშნაზე (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-56', subtopicId: 'u04-tens-hundreds-multiplication', difficulty: 1 }),
    prompt: 'რას უდრის {h00} × {a}?',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      h: { kind: 'int', min: 1, max: 5 },
      h00: { kind: 'choice', values: (v: Vars) => [Number(v.h) * 100] },
    },
    answer: (v: Vars) => Number(v.h00) * Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100),
    explanation: ({ vars, answer }) =>
      `${vars.h00} × ${vars.a} = ${answer}.`,
  }),

  // Q57 — ორი ათეულის ნამრავლი (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-57', subtopicId: 'u04-tens-hundreds-multiplication', difficulty: 2 }),
    prompt: 'გამოთვალე: {a0} × {b0} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      b: { kind: 'int', min: 2, max: 6 },
      a0: { kind: 'choice', values: (v: Vars) => [Number(v.a) * 10] },
      b0: { kind: 'choice', values: (v: Vars) => [Number(v.b) * 10] },
    },
    answer: (v: Vars) => Number(v.a0) * Number(v.b0),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100),
    explanation: ({ vars, answer }) =>
      `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}, ამიტომ ${vars.a0} × ${vars.b0} = ${answer}.`,
  }),

  // Q58 — ასეულების ამოცანა საწყობზე (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-58', subtopicId: 'u04-tens-hundreds-multiplication', difficulty: 2 }),
    prompt: 'საწყობში შემოიტანეს {boxes} ყუთი. თითოეულ ყუთში {perBox} წიგნია. სულ რამდენი წიგნი შემოიტანეს?',
    variables: {
      boxes: { kind: 'int', min: 2, max: 5 },
      perBox: { kind: 'choice', values: [100, 200, 300, 400] },
    },
    answer: (v: Vars) => Number(v.boxes) * Number(v.perBox),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100),
    explanation: ({ vars, answer }) =>
      `${vars.boxes} × ${vars.perBox} = ${answer} წიგნი.`,
  }),

  // Q59 — ასეულის ნამრავლი გამოკლებით (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-59', subtopicId: 'u04-tens-hundreds-multiplication', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × {h00} − {sub} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 4 },
      h: { kind: 'int', min: 2, max: 4 },
      h00: { kind: 'choice', values: (v: Vars) => [Number(v.h) * 100] },
      sub: { kind: 'choice', values: [20, 30, 40, 50, 70] },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.h00) - Number(v.sub),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10),
    explanation: ({ vars, answer }) => {
      const prod = Number(vars.a) * Number(vars.h00);
      return `${vars.a} × ${vars.h00} = ${prod}. ${prod} − ${vars.sub} = ${answer}.`;
    },
  }),

  // Q60 — დიდი ნამრავლების შედარება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-60', subtopicId: 'u04-tens-hundreds-multiplication', difficulty: 3 }),
    prompt: 'ჩასვი შესაბამისი ნიშანი: {a} × {h1}00 □ {b}0 × {c}0',
    variables: {
      a: { kind: 'int', min: 2, max: 4 },
      h1: { kind: 'int', min: 2, max: 3 },
      b: { kind: 'int', min: 2, max: 3 },
      c: { kind: 'int', min: 2, max: 4 },
    },
    answer: (v: Vars) => {
      const p1 = Number(v.a) * Number(v.h1) * 100;
      const p2 = Number(v.b) * 10 * (Number(v.c) * 10);
      return p1 > p2 ? '>' : p1 < p2 ? '<' : '=';
    },
    format: { kind: 'text' },
    optionCount: 3,
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) => {
      const p1 = Number(vars.a) * Number(vars.h1) * 100;
      const p2 = Number(vars.b) * 10 * (Number(vars.c) * 10);
      return `${vars.a} × ${vars.h1}00 = ${p1}, ${vars.b}0 × ${vars.c}0 = ${p2}. ${p1} ${answer} ${p2}.`;
    },
  }),

  // =========================================================================
  // U04.11 — გამრავლების ცხრილის შევსება (Multiplication Table Filling)
  // =========================================================================

  // Q61 — ცხრილის უჯრის პოვნა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-61', subtopicId: 'u04-table-filling', difficulty: 1 }),
    prompt: 'გამრავლების ცხრილში {a}-ის სვეტი და {b}-ის რიგი იკვეთება ერთ უჯრაზე. რა რიცხვი წერია ამ უჯრაში?',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      b: { kind: 'int', min: 3, max: 9 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.a}-ის სვეტისა და ${vars.b}-ის რიგის გადაკვეთაზე წერია ${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q62 — ცხრილის სვეტში ნამრავლის პოვნა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-62', subtopicId: 'u04-table-filling', difficulty: 1 }),
    prompt: 'გამრავლების ცხრილში {col}-ის სვეტის {row}-ე უჯრაში წერია რიცხვი:',
    variables: {
      col: { kind: 'int', min: 2, max: 9 },
      row: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v: Vars) => Number(v.col) * Number(v.row),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.col} × ${vars.row} = ${answer}.`,
  }),

  // Q63 — გამოტოვებული უჯრა ცხრილში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-63', subtopicId: 'u04-table-filling', difficulty: 2 }),
    prompt: 'მოცემულია გამრავლების ცხრილის ფრაგმენტი:\n× | {c1} | {c2}\n{r1} | {p11} | □\nიპოვე გამოტოვებული რიცხვი □.',
    variables: {
      r1: { kind: 'int', min: 3, max: 8 },
      c1: { kind: 'int', min: 3, max: 8 },
      c2: { kind: 'int', min: 4, max: 9 },
      p11: { kind: 'choice', values: (v: Vars) => [Number(v.r1) * Number(v.c1)] },
    },
    answer: (v: Vars) => Number(v.r1) * Number(v.c2),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `გამოტოვებული უჯრა არის ${vars.r1}-ისა და ${vars.c2}-ის გადაკვეთაზე: ${vars.r1} × ${vars.c2} = ${answer}.`,
  }),

  // Q64 — სიმეტრიული უჯრები ცხრილში (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-64', subtopicId: 'u04-table-filling', difficulty: 2 }),
    prompt: 'გამრავლების ცხრილში {a} × {b} და {b} × {a} ერთი და იგივე რიცხვია. რას უდრის ეს ნამრავლი?',
    variables: {
      a: { kind: 'int', min: 4, max: 9 },
      b: { kind: 'int', min: 4, max: 9 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.a} × ${vars.b} = ${vars.b} × ${vars.a} = ${answer}.`,
  }),

  // Q65 — გამოტოვებული სათაური ცხრილში (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u04-65', subtopicId: 'u04-table-filling', difficulty: 3 }),
    prompt: 'მოცემულია გამრავლების ცხრილის ფრაგმენტი:\n× | □ | {c2}\n{r1} | {p11} | {p12}\nიპოვე გამოტოვებული სვეტის მამრავლი □.',
    variables: {
      r1: { kind: 'int', min: 3, max: 8 },
      missingCol: { kind: 'int', min: 3, max: 9 },
      c2: { kind: 'int', min: 3, max: 9 },
      p11: { kind: 'choice', values: (v: Vars) => [Number(v.r1) * Number(v.missingCol)] },
      p12: { kind: 'choice', values: (v: Vars) => [Number(v.r1) * Number(v.c2)] },
    },
    answer: (v: Vars) => Number(v.missingCol),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `რადგან ${vars.r1} × □ = ${vars.p11}, ამიტომ □ = ${vars.p11} ÷ ${vars.r1} = ${answer}.`,
  }),

  // Q66 — შეცდომის პოვნა მწკრივში (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u04-66', subtopicId: 'u04-table-filling', difficulty: 3 }),
    prompt: 'გამრავლების ცხრილის ერთ მწკრივში წერია: {v1}, {v2}, {wrongVal}, {v4}. რომელი რიცხვია შეცდომით ჩაწერილი?',
    variables: {
      factor: { kind: 'choice', values: [3, 4, 6, 7] },
      wrongOffset: { kind: 'choice', values: [1, 2, -1, -2] },
      v1: { kind: 'choice', values: (v: Vars) => [Number(v.factor) * 2] },
      v2: { kind: 'choice', values: (v: Vars) => [Number(v.factor) * 3] },
      wrongVal: { kind: 'choice', values: (v: Vars) => [Number(v.factor) * 4 + Number(v.wrongOffset)] },
      v4: { kind: 'choice', values: (v: Vars) => [Number(v.factor) * 5] },
    },
    answer: (v: Vars) => Number(v.wrongVal),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.v1), Number(vars.v2), Number(vars.v4)],
    explanation: ({ vars, answer }) => {
      const f = Number(vars.factor);
      const correct = f * 4;
      return `ეს არის ${f}-ზე გამრავლების მწკრივი: ${f}×2=${vars.v1}, ${f}×3=${vars.v2}, ${f}×4=${correct}, ${f}×5=${vars.v4}. ${answer}-ის ნაცვლად უნდა ეწეროს ${correct}.`;
    },
  }),
];
