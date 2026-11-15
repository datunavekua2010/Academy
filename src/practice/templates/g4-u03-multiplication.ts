/**
 * Grade 4 — U03: გამრავლება (Multiplication).
 *
 * Full curriculum implementation for Grade 4 Unit 3 from Google Drive document U03
 * (folder "WEBSITE GRADE 4"):
 * 114 templates (Q01–Q114) across 19 subtopics with complete Level 1, 2, and 3 coverage (6 questions per subtopic):
 *
 *   U03.1  u03-multiplication-properties   (გამრავლების თვისებები, Q01–Q06)
 *   U03.2  u03-multiplication-table-12     (გამრავლების ტაბულა 12-მდე, Q07–Q12)
 *   U03.3  u03-unknown-factor              (უცნობი მამრავლის პოვნა, Q13–Q18)
 *   U03.4  u03-written-single-digit       (ერთნიშნა რიცხვზე მრავალნიშნა რიცხვის წერითი გამრავლება, Q19–Q24)
 *   U03.5  u03-multiply-ending-zeros       (ნულით დამთავრებული რიცხვების გამრავლება, Q25–Q30)
 *   U03.6  u03-written-multi-digit        (მრავალნიშნა რიცხვების წერითი გამრავლება, Q31–Q36)
 *   U03.7  u03-identify-factors           (ნამრავლის შესაბამისი მამრავლების ამოცნობა, Q37–Q42)
 *   U03.8  u03-associative-tricks         (დაჯგუფების თვისება და გამოთვლის ხერხები, Q43–Q48)
 *   U03.9  u03-commutative-law            (გამრავლების გადანაცვლებადობის კანონი, Q49–Q54)
 *   U03.10 u03-estimate-product           (ნამრავლის მიახლოებითი მნიშვნელობა, Q55–Q60)
 *   U03.11 u03-multiple-factors           (რამდენიმე მამრავლის მქონე მრავალნიშნა გამრავლება, Q61–Q66)
 *   U03.12 u03-pattern-table              (კანონზომიერებიანი ცხრილის შევსება, Q67–Q72)
 *   U03.13 u03-product-rounded-factors    (ნამრავლის გამოთვლა დამრგვალებული მამრავლებით, Q73–Q78)
 *   U03.14 u03-product-comparison-bounds  (ნამრავლის შეფასება, Q79–Q84)
 *   U03.15 u03-commutative-arrays         (გადანაცვლებადობის თვისება ილუსტრაციებით, Q85–Q90)
 *   U03.16 u03-apply-commutative          (გადანაცვლებადობის თვისების გამოყენება, Q91–Q96)
 *   U03.17 u03-multiply-same-number       (ერთი და იმავე რიცხვზე გამრავლება, Q97–Q102)
 *   U03.18 u03-table-fill-drag            (გამრავლების ცხრილის შევსება (გადათრევა და ჩასმა), Q103–Q108)
 *   U03.19 u03-table-12-drag              (გამრავლების ტაბულა 12-მდე (გადათრევა და ჩასმა), Q109–Q114)
 */

import { defineTemplate } from './types';
import type { QuestionTemplate, DifficultyLevel } from './types';

const grade = 4 as const;
const topicId = 'g4-gamravleba' as const;
const unitId = 'g4-gamravleba' as const;

export const G4_U03_SUBTOPICS = [
  'u03-multiplication-properties',
  'u03-multiplication-table-12',
  'u03-unknown-factor',
  'u03-written-single-digit',
  'u03-multiply-ending-zeros',
  'u03-written-multi-digit',
  'u03-identify-factors',
  'u03-associative-tricks',
  'u03-commutative-law',
  'u03-estimate-product',
  'u03-multiple-factors',
  'u03-pattern-table',
  'u03-product-rounded-factors',
  'u03-product-comparison-bounds',
  'u03-commutative-arrays',
  'u03-apply-commutative',
  'u03-multiply-same-number',
  'u03-table-fill-drag',
  'u03-table-12-drag',
] as const;

export type G4U03SubtopicId = (typeof G4_U03_SUBTOPICS)[number];

const addr = (spec: { id: string; subtopicId: G4U03SubtopicId; difficulty: DifficultyLevel }) => ({
  grade,
  topicId,
  unitId,
  id: spec.id,
  subtopicId: spec.subtopicId,
  difficulty: spec.difficulty,
});

function nearMisses(val: number, count = 3, step = 1, minVal = 0): number[] {
  const result: number[] = [];
  let d = 1;
  while (result.length < count) {
    const higher = val + d * step;
    const lower = val - d * step;
    if (higher !== val && !result.includes(higher) && higher >= minVal) {
      result.push(higher);
      if (result.length >= count) break;
    }
    if (lower !== val && !result.includes(lower) && lower >= minVal) {
      result.push(lower);
      if (result.length >= count) break;
    }
    d += 1;
  }
  return result;
}

export const G4_U03_TEMPLATES: QuestionTemplate[] = [
  // ==================================================================
  // U03.1 — გამრავლების თვისებები (u03-multiplication-properties)
  // ==================================================================

  // Q01 (Level 1): გამოთვალე A × B (მრგვალი ნამრავლი)
  defineTemplate({
    ...addr({ id: 'g4-u03-01', subtopicId: 'u03-multiplication-properties', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '25|4', '50|2', '20|5', '125|8', '250|4', '20|4', '50|4', '25|8',
          '125|4', '50|6', '25|6', '20|8', '50|8', '250|2',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q02 (Level 1): გამოიყენე გადანაცვლებადობის თვისება: A × B
  defineTemplate({
    ...addr({ id: 'g4-u03-02', subtopicId: 'u03-multiplication-properties', difficulty: 1 }),
    prompt: 'გამოიყენე გამრავლების გადანაცვლებადობის თვისება და გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [7, 6, 8, 9, 5, 4, 3] },
      b: { kind: 'choice', values: [36, 24, 45, 18, 52, 28, 32, 44, 25, 48, 16, 35] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${vars.b} × ${vars.a} = ${answer}.`,
  }),

  // Q03 (Level 2): გამოთვალე მოხერხებული დაჯგუფებით: A × B × C
  defineTemplate({
    ...addr({ id: 'g4-u03-03', subtopicId: 'u03-multiplication-properties', difficulty: 2 }),
    prompt: 'გამოთვალე მოხერხებული დაჯგუფებით: {a} × {b} × {c}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '2|5|9', '5|2|7', '2|5|13', '4|25|7', '25|4|9', '5|20|6', '20|5|8',
          '2|50|7', '50|2|9', '8|125|3', '125|8|5', '4|25|11',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => Number(v.a) * Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `მოხერხებულია ჯერ (${vars.a} × ${vars.b}) = ${Number(vars.a) * Number(vars.b)}, შემდეგ × ${vars.c} = ${answer}.`,
  }),

  // Q04 (Level 2): შეავსე ტოლობა (დაჯგუფებადობა): A × (B × C) = (A × B) × □
  defineTemplate({
    ...addr({ id: 'g4-u03-04', subtopicId: 'u03-multiplication-properties', difficulty: 2 }),
    prompt: 'შეავსე ტოლობა: {a} × ({b} × {c}) = ({a} × {b}) × □',
    variables: {
      a: { kind: 'choice', values: [8, 7, 6, 9, 5, 4, 11, 12] },
      b: { kind: 'choice', values: [3, 4, 5, 2, 6] },
      c: { kind: 'choice', values: [4, 7, 8, 9, 6, 5] },
    },
    answer: (v) => Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ vars }) => {
      const c = Number(vars.c);
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [a, b, b * c].filter((x) => x !== c).slice(0, 3);
    },
    explanation: ({ vars, answer }) => `გამრავლების დაჯგუფებადობის კანონით: ${vars.a} × (${vars.b} × ${vars.c}) = (${vars.a} × ${vars.b}) × ${answer}.`,
  }),

  // Q05 (Level 3): გამოთვალე: A × (B × C)
  defineTemplate({
    ...addr({ id: 'g4-u03-05', subtopicId: 'u03-multiplication-properties', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × ({b} × {c}).',
    variables: {
      a: { kind: 'choice', values: [15, 25, 35, 45, 18, 24, 16, 28, 32, 14, 22, 12] },
      b: { kind: 'choice', values: [2, 4, 5] },
      c: { kind: 'choice', values: [5, 10, 2] },
    },
    answer: (v) => Number(v.a) * (Number(v.b) * Number(v.c)),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `ფრჩხილებში: ${vars.b} × ${vars.c} = ${Number(vars.b) * Number(vars.c)}; შემდეგ ${vars.a} × ${Number(vars.b) * Number(vars.c)} = ${answer}.`,
  }),

  // Q06 (Level 3): შეავსე ტოლობა (განრიგებადობა): (T + U) × M = T × M + □ × M
  defineTemplate({
    ...addr({ id: 'g4-u03-06', subtopicId: 'u03-multiplication-properties', difficulty: 3 }),
    prompt: 'შეავსე ტოლობა: {n} × {m} = {tens} × {m} + □ × {m}',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '24|6|20|4', '35|4|30|5', '48|3|40|8', '56|7|50|6', '63|5|60|3',
          '72|8|70|2', '84|6|80|4', '93|4|90|3', '27|5|20|7', '38|6|30|8',
          '46|9|40|6', '54|8|50|4',
        ],
      },
      n: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      tens: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      ones: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => Number(v.ones),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `რადგან ${vars.n} = ${vars.tens} + ${vars.ones}, განრიგებადობის თვისებით: ${vars.n} × ${vars.m} = ${vars.tens} × ${vars.m} + ${answer} × ${vars.m}.`,
  }),

  // ==================================================================
  // U03.2 — გამრავლების ტაბულა 12-მდე (u03-multiplication-table-12)
  // ==================================================================

  // Q07 (Level 1): გამოთვალე A × B (ერთნიშნა)
  defineTemplate({
    ...addr({ id: 'g4-u03-07', subtopicId: 'u03-multiplication-table-12', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [7, 8, 6, 9, 7, 8, 9, 6, 8, 7, 9, 8] },
      b: { kind: 'choice', values: [8, 7, 9, 6, 6, 9, 8, 7, 6, 9, 7, 8] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q08 (Level 1): გამოთვალე A × 12
  defineTemplate({
    ...addr({ id: 'g4-u03-08', subtopicId: 'u03-multiplication-table-12', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × 12.',
    variables: {
      a: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    },
    answer: (v) => Number(v.a) * 12,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 12, 12),
    explanation: ({ vars, answer }) => `${vars.a} × 12 = ${answer}.`,
  }),

  // Q09 (Level 2): გამოთვალე A × 11
  defineTemplate({
    ...addr({ id: 'g4-u03-09', subtopicId: 'u03-multiplication-table-12', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} × 11.',
    variables: {
      a: { kind: 'choice', values: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
    },
    answer: (v) => Number(v.a) * 11,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 11, 11),
    explanation: ({ vars, answer }) => `${vars.a} × 11 = ${answer}.`,
  }),

  // Q10 (Level 2): იპოვე უცნობი რიცხვი: □ × A = P
  defineTemplate({
    ...addr({ id: 'g4-u03-10', subtopicId: 'u03-multiplication-table-12', difficulty: 2 }),
    prompt: 'იპოვე უცნობი რიცხვი: □ × {a} = {p}',
    variables: {
      a: { kind: 'choice', values: [7, 8, 9, 6, 8, 7, 9, 6, 8, 9, 7, 6] },
      ans: { kind: 'choice', values: [9, 8, 7, 9, 6, 8, 6, 8, 9, 8, 7, 7] },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.p} ÷ ${vars.a} = ${answer}.`,
  }),

  // Q11 (Level 3): იპოვე უცნობი რიცხვი: A × □ = P (ტაბულა 12)
  defineTemplate({
    ...addr({ id: 'g4-u03-11', subtopicId: 'u03-multiplication-table-12', difficulty: 3 }),
    prompt: 'იპოვე უცნობი რიცხვი: {a} × □ = {p}',
    variables: {
      a: { kind: 'choice', values: [8, 9, 7, 6, 11, 12, 8, 9, 7, 6, 8, 12] },
      ans: { kind: 'choice', values: [12, 11, 12, 11, 8, 8, 11, 12, 11, 12, 12, 9] },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.p} ÷ ${vars.a} = ${answer}.`,
  }),

  // Q12 (Level 3): გამოთვალე კვადრატი 12-მდე: A × A
  defineTemplate({
    ...addr({ id: 'g4-u03-12', subtopicId: 'u03-multiplication-table-12', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × {a}.',
    variables: {
      a: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    },
    answer: (v) => Number(v.a) * Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.a} = ${answer}.`,
  }),

  // ==================================================================
  // U03.3 — უცნობი მამრავლის პოვნა (u03-unknown-factor)
  // ==================================================================

  // Q13 (Level 1): □ × A = P (ტაბულური)
  defineTemplate({
    ...addr({ id: 'g4-u03-13', subtopicId: 'u03-unknown-factor', difficulty: 1 }),
    prompt: 'იპოვე უცნობი მამრავლი: □ × {a} = {p}',
    variables: {
      a: { kind: 'choice', values: [6, 7, 8, 9, 6, 7, 8, 9, 5, 6, 7, 8] },
      x: { kind: 'choice', values: [9, 8, 7, 6, 8, 9, 9, 7, 9, 8, 6, 8] },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.x)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `უცნობი მამრავლი ტოლია ნამრავლს გაყოფილი ცნობილი მამრავლი: ${vars.p} ÷ ${vars.a} = ${answer}.`,
  }),

  // Q14 (Level 1): A × □ = P (ტაბულა 12)
  defineTemplate({
    ...addr({ id: 'g4-u03-14', subtopicId: 'u03-unknown-factor', difficulty: 1 }),
    prompt: 'იპოვე უცნობი მამრავლი: {a} × □ = {p}',
    variables: {
      a: { kind: 'choice', values: [9, 8, 7, 6, 12, 11, 9, 8, 7, 6, 12, 8] },
      x: { kind: 'choice', values: [12, 11, 12, 11, 9, 8, 11, 12, 11, 12, 8, 12] },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.x)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.p} ÷ ${vars.a} = ${answer}.`,
  }),

  // Q15 (Level 2): □ × 25 = P
  defineTemplate({
    ...addr({ id: 'g4-u03-15', subtopicId: 'u03-unknown-factor', difficulty: 2 }),
    prompt: 'იპოვე უცნობი მამრავლი: □ × 25 = {p}',
    variables: {
      x: { kind: 'choice', values: [20, 16, 24, 12, 18, 28, 32, 14, 22, 26, 30, 36] },
      p: { kind: 'choice', values: (v) => [Number(v.x) * 25] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) => `${vars.p} ÷ 25 = ${answer}.`,
  }),

  // Q16 (Level 2): A × □ = P (ორნიშნა × ერთნიშნა)
  defineTemplate({
    ...addr({ id: 'g4-u03-16', subtopicId: 'u03-unknown-factor', difficulty: 2 }),
    prompt: 'იპოვე უცნობი მამრავლი: {a} × □ = {p}',
    variables: {
      a: { kind: 'choice', values: [32, 24, 36, 42, 28, 45, 18, 35, 48, 26, 34, 52] },
      x: { kind: 'choice', values: [8, 7, 6, 5, 9, 4, 7, 8, 6, 7, 8, 6] },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.x)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.p} ÷ ${vars.a} = ${answer}.`,
  }),

  // Q17 (Level 3): □ × A0 = P00
  defineTemplate({
    ...addr({ id: 'g4-u03-17', subtopicId: 'u03-unknown-factor', difficulty: 3 }),
    prompt: 'იპოვე უცნობი მამრავლი: □ × {a} = {p}',
    variables: {
      a: { kind: 'choice', values: [40, 50, 60, 30, 70, 80, 20, 90, 40, 50, 60, 80] },
      x: { kind: 'choice', values: [30, 40, 25, 50, 20, 15, 60, 35, 45, 24, 18, 22] },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.x)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 1),
    explanation: ({ vars, answer }) => `${vars.p} ÷ ${vars.a} = ${answer}.`,
  }),

  // Q18 (Level 3): 125 × □ = P
  defineTemplate({
    ...addr({ id: 'g4-u03-18', subtopicId: 'u03-unknown-factor', difficulty: 3 }),
    prompt: 'იპოვე უცნობი მამრავლი: 125 × □ = {p}',
    variables: {
      x: { kind: 'choice', values: [8, 16, 24, 12, 14, 18, 20, 28, 32, 10, 22, 26] },
      p: { kind: 'choice', values: (v) => [Number(v.x) * 125] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) => `${vars.p} ÷ 125 = ${answer}.`,
  }),

  // ==================================================================
  // U03.4 — ერთნიშნა რიცხვზე მრავალნიშნა რიცხვის წერითი გამრავლება (u03-written-single-digit)
  // ==================================================================

  // Q19 (Level 1): 3-ნიშნა × 1-ნიშნა
  defineTemplate({
    ...addr({ id: 'g4-u03-19', subtopicId: 'u03-written-single-digit', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [324, 215, 412, 136, 243, 314, 421, 235, 342, 154, 263, 371] },
      b: { kind: 'choice', values: [3, 4, 2, 5, 3, 4, 2, 3, 4, 5, 3, 2] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q20 (Level 1): 4-ნიშნა × 1-ნიშნა
  defineTemplate({
    ...addr({ id: 'g4-u03-20', subtopicId: 'u03-written-single-digit', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [1246, 2135, 1428, 3124, 2341, 1532, 2415, 3216, 1642, 2514, 1723, 2634] },
      b: { kind: 'choice', values: [4, 3, 5, 2, 4, 3, 5, 2, 4, 3, 5, 2] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q21 (Level 2): 4-ნიშნა ნულით × 1-ნიშნა
  defineTemplate({
    ...addr({ id: 'g4-u03-21', subtopicId: 'u03-written-single-digit', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [2305, 3406, 1807, 2504, 3108, 4203, 1709, 2604, 3502, 4106, 2803, 3705] },
      b: { kind: 'choice', values: [6, 4, 5, 7, 3, 6, 4, 5, 3, 4, 6, 5] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q22 (Level 2): 4-ნიშნა × 1-ნიშნა (გადასვლებით)
  defineTemplate({
    ...addr({ id: 'g4-u03-22', subtopicId: 'u03-written-single-digit', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [4718, 3846, 5294, 2768, 4385, 3629, 5472, 2984, 4836, 3749, 5168, 2875] },
      b: { kind: 'choice', values: [5, 6, 4, 7, 5, 8, 4, 6, 5, 7, 6, 8] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q23 (Level 3): 5-ნიშნა × 1-ნიშნა
  defineTemplate({
    ...addr({ id: 'g4-u03-23', subtopicId: 'u03-written-single-digit', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [12436, 23514, 18245, 31428, 24165, 15372, 28143, 34215, 19482, 26351, 32174, 17826] },
      b: { kind: 'choice', values: [7, 6, 8, 4, 5, 7, 6, 4, 8, 5, 6, 7] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q24 (Level 3): 5-ნიშნა ნულით × 1-ნიშნა
  defineTemplate({
    ...addr({ id: 'g4-u03-24', subtopicId: 'u03-written-single-digit', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [23809, 34078, 19084, 42065, 27058, 38042, 16095, 45032, 29064, 31085, 48027, 24076] },
      b: { kind: 'choice', values: [8, 7, 9, 6, 5, 8, 7, 6, 9, 5, 8, 7] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // ==================================================================
  // U03.5 — ნულით დამთავრებული რიცხვების გამრავლება (u03-multiply-ending-zeros)
  // ==================================================================

  // Q25 (Level 1): A0 × B
  defineTemplate({
    ...addr({ id: 'g4-u03-25', subtopicId: 'u03-multiply-ending-zeros', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [40, 50, 60, 70, 80, 90, 30, 40, 50, 60, 70, 80] },
      b: { kind: 'choice', values: [6, 7, 8, 9, 4, 5, 6, 8, 7, 9, 5, 6] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q26 (Level 1): A00 × B
  defineTemplate({
    ...addr({ id: 'g4-u03-26', subtopicId: 'u03-multiply-ending-zeros', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [300, 400, 500, 600, 700, 800, 200, 900, 300, 400, 500, 600] },
      b: { kind: 'choice', values: [7, 8, 6, 9, 5, 4, 7, 3, 8, 6, 5, 7] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q27 (Level 2): A0 × B0
  defineTemplate({
    ...addr({ id: 'g4-u03-27', subtopicId: 'u03-multiply-ending-zeros', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [60, 70, 80, 90, 50, 40, 70, 80, 60, 90, 50, 40] },
      b: { kind: 'choice', values: [80, 60, 70, 50, 90, 80, 90, 60, 70, 80, 60, 90] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q28 (Level 2): A0 × B0 (3-ნიშნა × 2-ნიშნა)
  defineTemplate({
    ...addr({ id: 'g4-u03-28', subtopicId: 'u03-multiply-ending-zeros', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [250, 180, 320, 150, 240, 350, 160, 280, 420, 140, 260, 380] },
      b: { kind: 'choice', values: [40, 50, 30, 60, 20, 40, 50, 30, 20, 60, 40, 50] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 500, 500),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q29 (Level 3): A00 × B0
  defineTemplate({
    ...addr({ id: 'g4-u03-29', subtopicId: 'u03-multiply-ending-zeros', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [1200, 1500, 1800, 2400, 1400, 1600, 2500, 3200, 2100, 2800, 3500, 1700] },
      b: { kind: 'choice', values: [30, 40, 50, 20, 60, 30, 40, 20, 50, 30, 40, 20] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q30 (Level 3): A00 × B00
  defineTemplate({
    ...addr({ id: 'g4-u03-30', subtopicId: 'u03-multiply-ending-zeros', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [4500, 2500, 3500, 1500, 1800, 2400, 3200, 1200, 2800, 1600, 4200, 2100] },
      b: { kind: 'choice', values: [200, 400, 300, 500, 200, 300, 200, 400, 300, 500, 200, 300] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10000, 10000),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // ==================================================================
  // U03.6 — მრავალნიშნა რიცხვების წერითი გამრავლება (u03-written-multi-digit)
  // ==================================================================

  // Q31 (Level 1): 2-ნიშნა × 2-ნიშნა
  defineTemplate({
    ...addr({ id: 'g4-u03-31', subtopicId: 'u03-written-multi-digit', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [24, 32, 23, 31, 42, 21, 34, 43, 25, 33, 41, 22] },
      b: { kind: 'choice', values: [13, 12, 14, 15, 11, 21, 13, 12, 14, 21, 13, 12] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q32 (Level 1): 2-ნიშნა × 2-ნიშნა (e.g. 36 × 25)
  defineTemplate({
    ...addr({ id: 'g4-u03-32', subtopicId: 'u03-written-multi-digit', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [36, 48, 28, 44, 32, 52, 24, 46, 38, 54, 26, 42] },
      b: { kind: 'choice', values: [25, 15, 35, 25, 45, 15, 25, 35, 25, 15, 35, 25] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 20, 10),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q33 (Level 2): 3-ნიშნა × 2-ნიშნა
  defineTemplate({
    ...addr({ id: 'g4-u03-33', subtopicId: 'u03-written-multi-digit', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [124, 213, 142, 312, 231, 152, 241, 321, 134, 223, 314, 143] },
      b: { kind: 'choice', values: [23, 31, 24, 32, 21, 42, 22, 33, 25, 34, 21, 43] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 50, 50),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q34 (Level 2): 3-ნიშნა × 2-ნიშნა
  defineTemplate({
    ...addr({ id: 'g4-u03-34', subtopicId: 'u03-written-multi-digit', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [215, 324, 185, 246, 318, 274, 352, 196, 283, 342, 228, 315] },
      b: { kind: 'choice', values: [34, 28, 36, 42, 25, 38, 24, 45, 32, 26, 44, 35] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q35 (Level 3): 3-ნიშნა × 2-ნიშნა (რთული)
  defineTemplate({
    ...addr({ id: 'g4-u03-35', subtopicId: 'u03-written-multi-digit', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [326, 438, 287, 514, 362, 475, 298, 526, 384, 462, 349, 518] },
      b: { kind: 'choice', values: [42, 53, 38, 46, 54, 37, 48, 52, 36, 45, 58, 44] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q36 (Level 3): 4-ნიშნა × 2-ნიშნა
  defineTemplate({
    ...addr({ id: 'g4-u03-36', subtopicId: 'u03-written-multi-digit', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [1245, 2134, 1426, 3125, 2318, 1542, 2416, 3214, 1635, 2518, 1724, 2635] },
      b: { kind: 'choice', values: [16, 24, 18, 25, 32, 14, 22, 15, 28, 19, 23, 26] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 1000),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // ==================================================================
  // U03.7 — ნამრავლის შესაბამისი მამრავლების ამოცნობა (u03-identify-factors)
  // ==================================================================

  // Q37 (Level 1): რომელი ორი რიცხვის ნამრავლია P
  defineTemplate({
    ...addr({ id: 'g4-u03-37', subtopicId: 'u03-identify-factors', difficulty: 1 }),
    prompt: 'რომელი ორი რიცხვის ნამრავლია {p}?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '36|4 × 9|5 × 7|6 × 8',
          '48|6 × 8|7 × 7|5 × 9',
          '42|6 × 7|5 × 8|8 × 6',
          '54|6 × 9|7 × 8|8 × 8',
          '56|7 × 8|6 × 9|9 × 7',
          '63|7 × 9|8 × 8|6 × 10',
          '45|5 × 9|6 × 7|8 × 6',
          '32|4 × 8|5 × 6|7 × 5',
          '28|4 × 7|5 × 5|6 × 5',
          '40|5 × 8|6 × 7|7 × 6',
          '64|8 × 8|7 × 9|9 × 8',
          '72|8 × 9|7 × 10|9 × 9',
        ],
      },
      p: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => [String(vars.w1), String(vars.w2)].filter((x) => x !== answer),
    explanation: ({ vars, answer }) => `${answer} = ${vars.p}.`,
  }),

  // Q38 (Level 1): შეარჩიე წყვილი, რომლის ნამრავლია P
  defineTemplate({
    ...addr({ id: 'g4-u03-38', subtopicId: 'u03-identify-factors', difficulty: 1 }),
    prompt: 'შეარჩიე წყვილი, რომლის ნამრავლია {p}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '72|8 × 9|7 × 9|6 × 10',
          '54|9 × 6|8 × 7|7 × 7',
          '63|9 × 7|8 × 8|7 × 8',
          '48|8 × 6|7 × 7|9 × 5',
          '56|8 × 7|9 × 6|7 × 7',
          '36|9 × 4|8 × 5|6 × 7',
          '42|7 × 6|8 × 5|9 × 5',
          '45|9 × 5|8 × 6|7 × 6',
          '32|8 × 4|7 × 5|6 × 6',
          '64|8 × 8|9 × 7|7 × 8',
          '81|9 × 9|8 × 10|7 × 11',
          '84|12 × 7|11 × 8|9 × 9',
        ],
      },
      p: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => [String(vars.w1), String(vars.w2)].filter((x) => x !== answer),
    explanation: ({ vars, answer }) => `${answer} = ${vars.p}.`,
  }),

  // Q39 (Level 2): რომელი წყვილი არ იძლევა ნამრავლს P
  defineTemplate({
    ...addr({ id: 'g4-u03-39', subtopicId: 'u03-identify-factors', difficulty: 2 }),
    prompt: 'რომელი წყვილის ნამრავლი არ არის {p}?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '24|5 × 5|3 × 8|4 × 6',
          '36|5 × 7|4 × 9|6 × 6',
          '48|7 × 7|6 × 8|4 × 12',
          '30|4 × 8|5 × 6|3 × 10',
          '40|6 × 7|5 × 8|4 × 10',
          '60|7 × 8|5 × 12|6 × 10',
          '72|8 × 8|8 × 9|6 × 12',
          '20|3 × 7|4 × 5|2 × 10',
          '18|4 × 5|2 × 9|3 × 6',
          '32|5 × 6|4 × 8|2 × 16',
          '50|6 × 8|5 × 10|2 × 25',
          '28|5 × 6|4 × 7|2 × 14',
        ],
      },
      p: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      wrong: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      c1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      c2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.wrong),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => [String(vars.c1), String(vars.c2)].filter((x) => x !== answer),
    explanation: ({ vars, answer }) => `${answer} არ უდრის ${vars.p}-ს.`,
  }),

  // Q40 (Level 2): იპოვე გამოტოვებული მამრავლი: A × □ = P
  defineTemplate({
    ...addr({ id: 'g4-u03-40', subtopicId: 'u03-identify-factors', difficulty: 2 }),
    prompt: 'იპოვე გამოტოვებული მამრავლი: {a} × □ = {p}',
    variables: {
      a: { kind: 'choice', values: [12, 11, 15, 14, 16, 18, 13, 25, 20, 12, 11, 14] },
      ans: { kind: 'choice', values: [12, 9, 8, 7, 6, 5, 8, 4, 7, 11, 12, 8] },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.p} ÷ ${vars.a} = ${answer}.`,
  }),

  // Q41 (Level 3): რომელი წყვილის ნამრავლია P (3-ნიშნა)
  defineTemplate({
    ...addr({ id: 'g4-u03-41', subtopicId: 'u03-identify-factors', difficulty: 3 }),
    prompt: 'რომელი წყვილის ნამრავლია {p}?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '120|10 × 12|15 × 9|20 × 5',
          '150|15 × 10|12 × 12|20 × 7',
          '180|15 × 12|14 × 12|20 × 8',
          '200|25 × 8|20 × 9|15 × 14',
          '240|20 × 12|15 × 15|25 × 9',
          '300|25 × 12|20 × 14|30 × 9',
          '144|12 × 12|11 × 13|15 × 10',
          '160|20 × 8|15 × 11|25 × 6',
          '100|25 × 4|20 × 6|15 × 7',
          '225|15 × 15|14 × 16|20 × 11',
          '250|25 × 10|20 × 12|15 × 16',
          '175|25 × 7|20 × 9|15 × 11',
        ],
      },
      p: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => [String(vars.w1), String(vars.w2)].filter((x) => x !== answer),
    explanation: ({ vars, answer }) => `${answer} = ${vars.p}.`,
  }),

  // Q42 (Level 3): შეავსე: A × B = (A/2) × □
  defineTemplate({
    ...addr({ id: 'g4-u03-42', subtopicId: 'u03-identify-factors', difficulty: 3 }),
    prompt: 'შეავსე: {a} × {b} = {halfA} × □',
    variables: {
      halfA: { kind: 'choice', values: [9, 8, 7, 6, 12, 10, 14, 15, 16, 11, 13, 18] },
      b: { kind: 'choice', values: [5, 4, 3, 6, 7, 5, 4, 3, 5, 6, 4, 5] },
      a: { kind: 'choice', values: (v) => [Number(v.halfA) * 2] },
    },
    answer: (v) => Number(v.b) * 2,
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => {
      const ans = Number(answer);
      const b = Number(vars.b);
      return [b, ans + 2, ans - 2].filter((x) => x > 0 && x !== ans);
    },
    explanation: ({ vars, answer }) => `რადგან პირველი მამრავლი 2-ჯერ შემცირდა (${vars.a} → ${vars.halfA}), ნამრავლი რომ არ შეიცვალოს, მეორე მამრავლი 2-ჯერ უნდა გაიზარდოს: ${vars.b} × 2 = ${answer}.`,
  }),

  // ==================================================================
  // U03.8 — დაჯგუფების თვისება და გამოთვლის ხერხები (u03-associative-tricks)
  // ==================================================================

  // Q43 (Level 1): 4 × 25 × A
  defineTemplate({
    ...addr({ id: 'g4-u03-43', subtopicId: 'u03-associative-tricks', difficulty: 1 }),
    prompt: 'გამოთვალე მოხერხებული დაჯგუფებით: 4 × 25 × {a}.',
    variables: {
      a: { kind: 'choice', values: [2, 3, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15] },
    },
    answer: (v) => 100 * Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `4 × 25 = 100; 100 × ${vars.a} = ${answer}.`,
  }),

  // Q44 (Level 1): 5 × A × 2
  defineTemplate({
    ...addr({ id: 'g4-u03-44', subtopicId: 'u03-associative-tricks', difficulty: 1 }),
    prompt: 'გამოთვალე მოხერხებული დაჯგუფებით: 5 × {a} × 2.',
    variables: {
      a: { kind: 'choice', values: [17, 13, 19, 23, 27, 31, 37, 43, 47, 53, 29, 39] },
    },
    answer: (v) => 10 * Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `5 × 2 = 10; 10 × ${vars.a} = ${answer}.`,
  }),

  // Q45 (Level 2): 8 × 125 × A
  defineTemplate({
    ...addr({ id: 'g4-u03-45', subtopicId: 'u03-associative-tricks', difficulty: 2 }),
    prompt: 'გამოთვალე მოხერხებული დაჯგუფებით: 8 × 125 × {a}.',
    variables: {
      a: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 15] },
    },
    answer: (v) => 1000 * Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => `8 × 125 = 1 000; 1 000 × ${vars.a} = ${answer}.`,
  }),

  // Q46 (Level 2): 25 × (4 × K)
  defineTemplate({
    ...addr({ id: 'g4-u03-46', subtopicId: 'u03-associative-tricks', difficulty: 2 }),
    prompt: 'გამოთვალე მოხერხებული ხერხით: 25 × {b}.',
    variables: {
      k: { kind: 'choice', values: [4, 6, 8, 12, 14, 16, 18, 20, 22, 24, 28, 32] },
      b: { kind: 'choice', values: (v) => [Number(v.k) * 4] },
    },
    answer: (v) => 100 * Number(v.k),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `25 × ${vars.b} = 25 × 4 × ${vars.k} = 100 × ${vars.k} = ${answer}.`,
  }),

  // Q47 (Level 3): 4 × A × 25
  defineTemplate({
    ...addr({ id: 'g4-u03-47', subtopicId: 'u03-associative-tricks', difficulty: 3 }),
    prompt: 'გამოთვალე მოხერხებული დაჯგუფებით: 4 × {a} × 25.',
    variables: {
      a: { kind: 'choice', values: [37, 29, 43, 18, 52, 64, 23, 48, 35, 71, 56, 42] },
    },
    answer: (v) => 100 * Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `4 × 25 = 100; 100 × ${vars.a} = ${answer}.`,
  }),

  // Q48 (Level 3): 50 × A × 2
  defineTemplate({
    ...addr({ id: 'g4-u03-48', subtopicId: 'u03-associative-tricks', difficulty: 3 }),
    prompt: 'გამოთვალე მოხერხებული დაჯგუფებით: 50 × {a} × 2.',
    variables: {
      a: { kind: 'choice', values: [7, 9, 13, 17, 23, 27, 34, 42, 19, 28, 36, 45] },
    },
    answer: (v) => 100 * Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `50 × 2 = 100; 100 × ${vars.a} = ${answer}.`,
  }),

  // ==================================================================
  // U03.9 — გამრავლების გადანაცვლებადობის კანონი (u03-commutative-law)
  // ==================================================================

  // Q49 (Level 1): შეავსე ტოლობა: A × B = B × □
  defineTemplate({
    ...addr({ id: 'g4-u03-49', subtopicId: 'u03-commutative-law', difficulty: 1 }),
    prompt: 'შეავსე ტოლობა: {a} × {b} = {b} × □',
    variables: {
      a: { kind: 'choice', values: [8, 7, 9, 6, 12, 11, 14, 15, 13, 16, 18, 17] },
      b: { kind: 'choice', values: [13, 14, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33] },
    },
    answer: (v) => Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [b, a + b, Math.abs(a - b)].filter((x) => x !== Number(answer));
    },
    explanation: ({ answer }) => `გამრავლების გადანაცვლებადობის კანონით: მამრავლების გადანაცვლებით ნამრავლი არ იცვლება, ამიტომ გამოტოვებული რიცხვია ${answer}.`,
  }),

  // Q50 (Level 1): შეადარე: (A × B) __ (B × A)
  defineTemplate({
    ...addr({ id: 'g4-u03-50', subtopicId: 'u03-commutative-law', difficulty: 1 }),
    prompt: 'შეადარე: {a} × {b} __ {b} × {a}. ჩასვი სწორი ნიშანი.',
    variables: {
      a: { kind: 'choice', values: [7, 6, 8, 9, 12, 14, 15, 18, 21, 24, 27, 30] },
      b: { kind: 'choice', values: [24, 35, 18, 42, 16, 25, 32, 28, 19, 22, 26, 31] },
    },
    answer: () => '=',
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => ['<', '>'],
    explanation: ({ vars }) => `გამრავლების გადანაცვლებადობის გამო: ${vars.a} × ${vars.b} = ${vars.b} × ${vars.a}.`,
  }),

  // Q51 (Level 2): შეავსე ტოლობა: A × B = B × □
  defineTemplate({
    ...addr({ id: 'g4-u03-51', subtopicId: 'u03-commutative-law', difficulty: 2 }),
    prompt: 'შეავსე ტოლობა: {a} × {b} = {b} × □',
    variables: {
      a: { kind: 'choice', values: [35, 42, 28, 56, 48, 64, 72, 36, 54, 63, 45, 81] },
      b: { kind: 'choice', values: [6, 7, 8, 9, 5, 4, 11, 12, 6, 7, 8, 9] },
    },
    answer: (v) => Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [b, a + b, Math.abs(a - b)].filter((x) => x !== Number(answer));
    },
    explanation: ({ vars, answer }) => `გადანაცვლებადობის თვისებით: ${vars.a} × ${vars.b} = ${vars.b} × ${answer}.`,
  }),

  // Q52 (Level 2): გამოთვალე: A × B და B × A
  defineTemplate({
    ...addr({ id: 'g4-u03-52', subtopicId: 'u03-commutative-law', difficulty: 2 }),
    prompt: 'გამოთვალე ნამრავლი: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [4, 8, 5, 25, 20, 50, 4, 8, 25, 50, 125, 250] },
      b: { kind: 'choice', values: [125, 125, 240, 36, 45, 18, 175, 250, 28, 34, 8, 4] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 10),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q53 (Level 3): ჩასვი ნიშანი: (A × B) __ (B × A)
  defineTemplate({
    ...addr({ id: 'g4-u03-53', subtopicId: 'u03-commutative-law', difficulty: 3 }),
    prompt: 'ჩასვი შესაბამისი ნიშანი: {a} × {b} __ {b} × {a}.',
    variables: {
      a: { kind: 'choice', values: [18, 24, 32, 45, 56, 68, 74, 85, 92, 108, 125, 144] },
      b: { kind: 'choice', values: [9, 8, 7, 6, 12, 11, 15, 14, 16, 18, 8, 7] },
    },
    answer: () => '=',
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => ['>', '<'],
    explanation: ({ vars }) => `ნამრავლი არ იცვლება მამრავლთა გადანაცვლებით, ამიტომ ${vars.a} × ${vars.b} = ${vars.b} × ${vars.a}.`,
  }),

  // Q54 (Level 3): დაწერე ტოლი გამოსახულება მამრავლების გადანაცვლებით
  defineTemplate({
    ...addr({ id: 'g4-u03-54', subtopicId: 'u03-commutative-law', difficulty: 3 }),
    prompt: 'რომელია {a} × {b}-ის ტოლი გამოსახულება მამრავლების გადანაცვლებით?',
    variables: {
      a: { kind: 'choice', values: [16, 25, 34, 48, 52, 64, 75, 82, 91, 18, 27, 36] },
      b: { kind: 'choice', values: [25, 36, 15, 24, 18, 35, 12, 45, 22, 38, 42, 14] },
    },
    answer: (v) => `${v.b} × ${v.a}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => [
      `${vars.a} + ${vars.b}`,
      `${vars.b} + ${vars.a}`,
      `${vars.a} × ${Number(vars.b) + 1}`,
    ].filter((x) => x !== answer),
    explanation: ({ vars, answer }) => `მამრავლთა გადანაცვლებით: ${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // ==================================================================
  // U03.10 — ნამრავლის მიახლოებითი მნიშვნელობა (u03-estimate-product)
  // ==================================================================

  // Q55 (Level 1): დაამრგვალე A უახლოეს ათეულამდე და მიახლოებით გამოთვალე A × B
  defineTemplate({
    ...addr({ id: 'g4-u03-55', subtopicId: 'u03-estimate-product', difficulty: 1 }),
    prompt: 'დაამრგვალე {a} უახლოეს ათეულამდე და მიახლოებით გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [48, 39, 52, 61, 29, 68, 72, 81, 42, 58, 31, 79] },
      b: { kind: 'choice', values: [6, 7, 5, 8, 4, 3, 6, 5, 7, 4, 8, 6] },
    },
    answer: (v) => Math.round(Number(v.a) / 10) * 10 * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 10) * 10;
      return `${vars.a} ≈ ${ra}; ${ra} × ${vars.b} = ${answer}.`;
    },
  }),

  // Q56 (Level 1): დაამრგვალე A უახლოეს ასეულამდე და მიახლოებით გამოთვალე A × B
  defineTemplate({
    ...addr({ id: 'g4-u03-56', subtopicId: 'u03-estimate-product', difficulty: 1 }),
    prompt: 'დაამრგვალე {a} უახლოეს ასეულამდე და მიახლოებით გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [192, 285, 314, 408, 492, 187, 212, 385, 412, 295, 318, 482] },
      b: { kind: 'choice', values: [4, 5, 3, 6, 4, 5, 3, 4, 6, 5, 3, 4] },
    },
    answer: (v) => Math.round(Number(v.a) / 100) * 100 * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 100) * 100;
      return `${vars.a} ≈ ${ra}; ${ra} × ${vars.b} = ${answer}.`;
    },
  }),

  // Q57 (Level 2): დაამრგვალე ორივე მამრავლი უახლოეს ათეულამდე: A × B
  defineTemplate({
    ...addr({ id: 'g4-u03-57', subtopicId: 'u03-estimate-product', difficulty: 2 }),
    prompt: 'დაამრგვალე ორივე მამრავლი უახლოეს ათეულამდე და მიახლოებით გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [38, 49, 52, 61, 29, 68, 42, 57, 31, 72, 81, 48] },
      b: { kind: 'choice', values: [52, 31, 42, 29, 58, 21, 39, 48, 62, 28, 32, 51] },
    },
    answer: (v) => (Math.round(Number(v.a) / 10) * 10) * (Math.round(Number(v.b) / 10) * 10),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 10) * 10;
      const rb = Math.round(Number(vars.b) / 10) * 10;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} × ${rb} = ${answer}.`;
    },
  }),

  // Q58 (Level 2): მიახლოებით გამოთვალე A × B (A დამრგვალებული ასეულამდე)
  defineTemplate({
    ...addr({ id: 'g4-u03-58', subtopicId: 'u03-estimate-product', difficulty: 2 }),
    prompt: 'მიახლოებით გამოთვალე {a} × {b}, თუ {a}-ს უახლოეს ასეულამდე დაამრგვალებ.',
    variables: {
      a: { kind: 'choice', values: [203, 298, 402, 495, 304, 597, 392, 198, 502, 604, 295, 408] },
      b: { kind: 'choice', values: [7, 6, 8, 5, 4, 3, 7, 8, 5, 4, 6, 7] },
    },
    answer: (v) => Math.round(Number(v.a) / 100) * 100 * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 100) * 100;
      return `${vars.a} ≈ ${ra}; ${ra} × ${vars.b} = ${answer}.`;
    },
  }),

  // Q59 (Level 3): მიახლოებით გამოთვალე A × B (ორივე ათეულებამდე)
  defineTemplate({
    ...addr({ id: 'g4-u03-59', subtopicId: 'u03-estimate-product', difficulty: 3 }),
    prompt: 'მიახლოებით გამოთვალე {a} × {b}, თუ ორივე რიცხვს უახლოეს ათეულამდე დაამრგვალებ.',
    variables: {
      a: { kind: 'choice', values: [61, 72, 81, 58, 42, 89, 68, 79, 52, 91, 48, 63] },
      b: { kind: 'choice', values: [29, 38, 49, 31, 52, 21, 41, 28, 59, 19, 32, 48] },
    },
    answer: (v) => (Math.round(Number(v.a) / 10) * 10) * (Math.round(Number(v.b) / 10) * 10),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 10) * 10;
      const rb = Math.round(Number(vars.b) / 10) * 10;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} × ${rb} = ${answer}.`;
    },
  }),

  // Q60 (Level 3): ტექსტური ამოცანა ნამრავლის მიახლოებაზე
  defineTemplate({
    ...addr({ id: 'g4-u03-60', subtopicId: 'u03-estimate-product', difficulty: 3 }),
    prompt: 'ქარხანა დღეში დაახლოებით {a} სათამაშოს აწარმოებს. დაახლოებით რამდენ სათამაშოს დაამზადებს {b} დღეში, თუ {a}-ს უახლოეს ასეულამდე დავამრგვალებთ?',
    variables: {
      a: { kind: 'choice', values: [198, 204, 295, 302, 396, 405, 492, 195, 298, 308, 402, 496] },
      b: { kind: 'choice', values: [5, 4, 6, 7, 3, 8, 5, 6, 4, 7, 5, 4] },
    },
    answer: (v) => Math.round(Number(v.a) / 100) * 100 * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 100) * 100;
      return `${vars.a} ≈ ${ra}; ${ra} × ${vars.b} = ${answer} სათამაშო.`;
    },
  }),

  // ==================================================================
  // U03.11 — რამდენიმე მამრავლის მქონე მრავალნიშნა გამრავლება (u03-multiple-factors)
  // ==================================================================

  // Q61 (Level 1): A × B × C
  defineTemplate({
    ...addr({ id: 'g4-u03-61', subtopicId: 'u03-multiple-factors', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {b} × {c}.',
    variables: {
      a: { kind: 'choice', values: [12, 15, 11, 14, 16, 13, 10, 18, 20, 12, 15, 14] },
      b: { kind: 'choice', values: [3, 2, 4, 3, 2, 3, 4, 2, 3, 4, 3, 2] },
      c: { kind: 'choice', values: [4, 5, 2, 3, 3, 2, 2, 3, 2, 2, 2, 5] },
    },
    answer: (v) => Number(v.a) * Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} × ${vars.c} = ${answer}.`,
  }),

  // Q62 (Level 1): A × B × C
  defineTemplate({
    ...addr({ id: 'g4-u03-62', subtopicId: 'u03-multiple-factors', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {b} × {c}.',
    variables: {
      a: { kind: 'choice', values: [25, 20, 50, 25, 20, 50, 25, 20, 50, 25, 20, 50] },
      b: { kind: 'choice', values: [8, 5, 4, 6, 7, 2, 4, 8, 3, 5, 6, 4] },
      c: { kind: 'choice', values: [2, 3, 2, 4, 2, 3, 2, 2, 3, 2, 2, 3] },
    },
    answer: (v) => Number(v.a) * Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} × ${vars.c} = ${answer}.`,
  }),

  // Q63 (Level 2): A × B × C
  defineTemplate({
    ...addr({ id: 'g4-u03-63', subtopicId: 'u03-multiple-factors', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} × {b} × {c}.',
    variables: {
      a: { kind: 'choice', values: [14, 18, 16, 22, 24, 28, 15, 26, 32, 12, 35, 18] },
      b: { kind: 'choice', values: [5, 4, 5, 5, 4, 5, 6, 5, 4, 8, 2, 5] },
      c: { kind: 'choice', values: [6, 5, 4, 3, 5, 2, 4, 3, 5, 3, 7, 4] },
    },
    answer: (v) => Number(v.a) * Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 20, 20),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} × ${vars.c} = ${answer}.`,
  }),

  // Q64 (Level 2): A × B × C (125-ით)
  defineTemplate({
    ...addr({ id: 'g4-u03-64', subtopicId: 'u03-multiple-factors', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} × {b} × {c}.',
    variables: {
      a: { kind: 'choice', values: [125, 250, 125, 250, 125, 125, 250, 125, 250, 125, 125, 250] },
      b: { kind: 'choice', values: [4, 2, 8, 4, 4, 8, 2, 4, 2, 8, 4, 4] },
      c: { kind: 'choice', values: [7, 9, 3, 5, 6, 4, 7, 8, 5, 6, 9, 3] },
    },
    answer: (v) => Number(v.a) * Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 500, 500),
    explanation: ({ vars, answer }) => `მოხერხებულია ჯერ ${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}, შემდეგ × ${vars.c} = ${answer}.`,
  }),

  // Q65 (Level 3): A × 25 × 4
  defineTemplate({
    ...addr({ id: 'g4-u03-65', subtopicId: 'u03-multiple-factors', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × 25 × 4.',
    variables: {
      a: { kind: 'choice', values: [32, 28, 36, 44, 48, 52, 64, 72, 84, 96, 56, 68] },
    },
    answer: (v) => Number(v.a) * 100,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `25 × 4 = 100; ${vars.a} × 100 = ${answer}.`,
  }),

  // Q66 (Level 3): A × B × C (რთული)
  defineTemplate({
    ...addr({ id: 'g4-u03-66', subtopicId: 'u03-multiple-factors', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × {b} × {c}.',
    variables: {
      a: { kind: 'choice', values: [15, 25, 35, 45, 16, 24, 18, 32, 28, 14, 22, 12] },
      b: { kind: 'choice', values: [12, 14, 16, 12, 15, 12, 14, 15, 12, 16, 15, 18] },
      c: { kind: 'choice', values: [8, 6, 5, 4, 6, 5, 8, 4, 5, 5, 4, 5] },
    },
    answer: (v) => Number(v.a) * Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} × ${vars.c} = ${answer}.`,
  }),

  // ==================================================================
  // U03.12 — კანონზომიერებიანი ცხრილის შევსება (u03-pattern-table)
  // ==================================================================

  // Q67 (Level 1): 3-ჯერ მეტი: N → □
  defineTemplate({
    ...addr({ id: 'g4-u03-67', subtopicId: 'u03-pattern-table', difficulty: 1 }),
    prompt: 'ცხრილში მეორე რიცხვი პირველზე 3-ჯერ მეტია. რა რიცხვი შეესაბამება {n}-ს ({n} → □)?',
    variables: {
      n: { kind: 'choice', values: [4, 7, 9, 12, 15, 8, 6, 11, 14, 16, 18, 13] },
    },
    answer: (v) => Number(v.n) * 3,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 3, 1),
    explanation: ({ vars, answer }) => `${vars.n} × 3 = ${answer}.`,
  }),

  // Q68 (Level 1): 8-ზე გამრავლება: N → □
  defineTemplate({
    ...addr({ id: 'g4-u03-68', subtopicId: 'u03-pattern-table', difficulty: 1 }),
    prompt: 'თუ თითოეული რიცხვი 8-ზე მრავლდება, რა რიცხვი შეესაბამება {n}-ს ({n} → □)?',
    variables: {
      n: { kind: 'choice', values: [12, 15, 20, 14, 16, 18, 22, 25, 11, 13, 17, 24] },
    },
    answer: (v) => Number(v.n) * 8,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 8, 1),
    explanation: ({ vars, answer }) => `${vars.n} × 8 = ${answer}.`,
  }),

  // Q69 (Level 2): 25-ზე გამრავლება: N → □
  defineTemplate({
    ...addr({ id: 'g4-u03-69', subtopicId: 'u03-pattern-table', difficulty: 2 }),
    prompt: 'თუ შედეგი მიიღება რიცხვის 25-ზე გამრავლებით, რა რიცხვი შეესაბამება {n}-ს ({n} → □)?',
    variables: {
      n: { kind: 'choice', values: [4, 8, 12, 16, 20, 24, 28, 32, 14, 18, 22, 26] },
    },
    answer: (v) => Number(v.n) * 25,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 25, 25),
    explanation: ({ vars, answer }) => `${vars.n} × 25 = ${answer}.`,
  }),

  // Q70 (Level 2): იპოვე წესი და შეავსე: N → □
  defineTemplate({
    ...addr({ id: 'g4-u03-70', subtopicId: 'u03-pattern-table', difficulty: 2 }),
    prompt: 'იპოვე წესი და შეავსე: 3 → 12; 5 → 20; {n} → □.',
    variables: {
      n: { kind: 'choice', values: [7, 9, 11, 13, 15, 6, 8, 10, 12, 14, 16, 18] },
    },
    answer: (v) => Number(v.n) * 4,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 4, 1),
    explanation: ({ vars, answer }) => `წესია 4-ზე გამრავლება: ${vars.n} × 4 = ${answer}.`,
  }),

  // Q71 (Level 3): 7-ზე გამრავლების წესი: N → □
  defineTemplate({
    ...addr({ id: 'g4-u03-71', subtopicId: 'u03-pattern-table', difficulty: 3 }),
    prompt: 'იპოვე წესი და შეავსე: 6 → 42; 8 → 56; {n} → □.',
    variables: {
      n: { kind: 'choice', values: [10, 12, 14, 15, 11, 13, 16, 18, 20, 9, 7, 17] },
    },
    answer: (v) => Number(v.n) * 7,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 7, 1),
    explanation: ({ vars, answer }) => `წესია 7-ზე გამრავლება: ${vars.n} × 7 = ${answer}.`,
  }),

  // Q72 (Level 3): რა რიცხვზე უნდა გამრავლდეს
  defineTemplate({
    ...addr({ id: 'g4-u03-72', subtopicId: 'u03-pattern-table', difficulty: 3 }),
    prompt: 'ცხრილში პირველი რიცხვი {a}-ია, ხოლო შედეგი {p}. რა რიცხვზე უნდა გამრავლდეს {a}?',
    variables: {
      a: { kind: 'choice', values: [15, 12, 14, 16, 18, 20, 24, 25, 11, 13, 17, 22] },
      k: { kind: 'choice', values: [12, 15, 11, 14, 16, 10, 13, 8, 9, 7, 6, 12] },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.k)] },
    },
    answer: (v) => Number(v.k),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.p} ÷ ${vars.a} = ${answer}.`,
  }),

  // ==================================================================
  // U03.13 — ნამრავლის გამოთვლა დამრგვალებული მამრავლებით (u03-product-rounded-factors)
  // ==================================================================

  // Q73 (Level 1): ჩაანაცვლე მამრავლი მრგვალი ათეულით
  defineTemplate({
    ...addr({ id: 'g4-u03-73', subtopicId: 'u03-product-rounded-factors', difficulty: 1 }),
    prompt: 'მიახლოებით გამოთვალე {a} × {b}, თუ {a}-ს {ra}-ით ჩაანაცვლებ.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '49|50|6', '39|40|7', '29|30|8', '59|60|5', '69|70|4',
          '79|80|3', '89|90|6', '19|20|9', '41|40|8', '51|50|7',
          '31|30|6', '61|60|5',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ra: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => Number(v.ra) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.ra} × ${vars.b} = ${answer}.`,
  }),

  // Q74 (Level 1): ჩაანაცვლე მამრავლი მრგვალი ასეულით
  defineTemplate({
    ...addr({ id: 'g4-u03-74', subtopicId: 'u03-product-rounded-factors', difficulty: 1 }),
    prompt: 'მიახლოებით გამოთვალე {a} × {b}, თუ {a}-ს {ra}-ით ჩაანაცვლებ.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '198|200|4', '295|300|5', '397|400|3', '496|500|6', '192|200|7',
          '289|300|6', '391|400|4', '498|500|2', '594|600|5', '692|700|3',
          '203|200|8', '302|300|7',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ra: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => Number(v.ra) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.ra} × ${vars.b} = ${answer}.`,
  }),

  // Q75 (Level 2): ჩაანაცვლე ორივე მამრავლი
  defineTemplate({
    ...addr({ id: 'g4-u03-75', subtopicId: 'u03-product-rounded-factors', difficulty: 2 }),
    prompt: 'მიახლოებით გამოთვალე {a} × {b}, თუ {a}-ს {ra}-ით, ხოლო {b}-ს {rb}-ით ჩაანაცვლებ.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '31|19|30|20', '42|29|40|30', '51|38|50|40', '62|19|60|20', '71|28|70|30',
          '39|48|40|50', '28|51|30|50', '49|31|50|30', '58|21|60|20', '69|32|70|30',
          '78|41|80|40', '89|19|90|20',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ra: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      rb: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => Number(v.ra) * Number(v.rb),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.ra} × ${vars.rb} = ${answer}.`,
  }),

  // Q76 (Level 2): ჩაანაცვლე 3-ნიშნა მამრავლი
  defineTemplate({
    ...addr({ id: 'g4-u03-76', subtopicId: 'u03-product-rounded-factors', difficulty: 2 }),
    prompt: 'მიახლოებით გამოთვალე {a} × {b}, თუ {a}-ს {ra}-ით ჩაანაცვლებ.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '402|400|8', '503|500|6', '604|600|7', '702|700|5', '304|300|9',
          '203|200|8', '801|800|4', '902|900|3', '405|400|6', '502|500|5',
          '601|600|4', '703|700|6',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ra: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => Number(v.ra) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.ra} × ${vars.b} = ${answer}.`,
  }),

  // Q77 (Level 3): ჩაანაცვლე ორივე 2-ნიშნა (რთული)
  defineTemplate({
    ...addr({ id: 'g4-u03-77', subtopicId: 'u03-product-rounded-factors', difficulty: 3 }),
    prompt: 'მიახლოებით გამოთვალე {a} × {b}, თუ {a}-ს {ra}-ით, ხოლო {b}-ს {rb}-ით ჩაანაცვლებ.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '62|48|60|50', '71|39|70|40', '82|29|80|30', '58|41|60|40', '49|52|50|50',
          '68|31|70|30', '79|48|80|50', '91|38|90|40', '63|58|60|60', '88|22|90|20',
          '52|69|50|70', '72|51|70|50',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ra: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      rb: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => Number(v.ra) * Number(v.rb),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.ra} × ${vars.rb} = ${answer}.`,
  }),

  // Q78 (Level 3): ჩაანაცვლე 3-ნიშნა და 2-ნიშნა
  defineTemplate({
    ...addr({ id: 'g4-u03-78', subtopicId: 'u03-product-rounded-factors', difficulty: 3 }),
    prompt: 'მიახლოებით გამოთვალე {a} × {b}, თუ {a}-ს {ra}-ით, ხოლო {b}-ს {rb}-ით ჩაანაცვლებ.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '297|21|300|20', '398|19|400|20', '495|31|500|30', '196|42|200|40',
          '292|28|300|30', '394|22|400|20', '491|18|500|20', '598|29|600|30',
          '695|21|700|20', '194|48|200|50', '299|32|300|30', '392|39|400|40',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ra: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      rb: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => Number(v.ra) * Number(v.rb),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => `${vars.ra} × ${vars.rb} = ${answer}.`,
  }),

  // ==================================================================
  // U03.14 — ნამრავლის შეფასება (u03-product-comparison-bounds)
  // ==================================================================

  // Q79 (Level 1): შეაფასე: ნამრავლი Bound-ზე მეტია თუ ნაკლები
  defineTemplate({
    ...addr({ id: 'g4-u03-79', subtopicId: 'u03-product-comparison-bounds', difficulty: 1 }),
    prompt: 'შეაფასე {a} × {b}: ნამრავლი {bound}-ზე მეტია თუ ნაკლები?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '39|5|100|მეტია', '19|4|100|ნაკლებია', '48|3|100|მეტია', '18|5|100|ნაკლებია',
          '29|4|100|მეტია', '21|4|100|ნაკლებია', '52|2|100|მეტია', '47|2|100|ნაკლებია',
          '38|3|100|მეტია', '24|4|100|ნაკლებია', '35|4|100|მეტია', '16|6|100|ნაკლებია',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      bound: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => ['მეტია', 'ნაკლებია'].filter((x) => x !== answer),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}, რაც ${vars.bound}-ზე ${answer}.`,
  }),

  // Q80 (Level 1): შეაფასე 1000-თან შედარებით
  defineTemplate({
    ...addr({ id: 'g4-u03-80', subtopicId: 'u03-product-comparison-bounds', difficulty: 1 }),
    prompt: 'შეაფასე {a} × {b}: ნამრავლი 1 000-ზე მეტია თუ ნაკლები?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '198|6|მეტია', '124|6|ნაკლებია', '215|5|მეტია', '185|4|ნაკლებია',
          '248|5|მეტია', '162|5|ნაკლებია', '312|4|მეტია', '142|6|ნაკლებია',
          '265|4|მეტია', '135|7|ნაკლებია', '342|3|მეტია', '158|6|ნაკლებია',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => ['მეტია', 'ნაკლებია'].filter((x) => x !== answer),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}, რაც 1 000-ზე ${answer}.`,
  }),

  // Q81 (Level 2): რომელ შუალედშია ნამრავლი
  defineTemplate({
    ...addr({ id: 'g4-u03-81', subtopicId: 'u03-product-comparison-bounds', difficulty: 2 }),
    prompt: 'ნამრავლის ერთი მამრავლია {a}, მეორე — {b}. რომელ შუალედშია მათი ნამრავლი?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '48|9|400-სა და 500-ს შორის|500-სა და 600-ს შორის',
          '58|9|500-სა და 600-ს შორის|400-სა და 500-ს შორის',
          '38|8|300-სა და 400-ს შორის|200-სა და 300-ს შორის',
          '68|8|500-სა და 600-ს შორის|400-სა და 500-ს შორის',
          '78|7|500-სა და 600-ს შორის|600-სა და 700-ს შორის',
          '88|7|600-სა და 700-ს შორის|500-სა და 600-ს შორის',
          '42|8|300-სა და 400-ს შორის|400-სა და 500-ს შორის',
          '52|7|300-სა და 400-ს შორის|400-სა და 500-ს შორის',
          '62|6|300-სა და 400-ს შორის|400-სა და 500-ს შორის',
          '72|6|400-სა და 500-ს შორის|300-სა და 400-ს შორის',
          '82|5|400-სა და 500-ს შორის|300-სა და 400-ს შორის',
          '92|5|400-სა და 500-ს შორის|500-სა და 600-ს შორის',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      wrong: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ vars, answer }) => [String(vars.wrong)].filter((x) => x !== answer),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}, რაც მოთავსებულია ${answer}.`,
  }),

  // Q82 (Level 2): შეაფასე: A × B __ Bound
  defineTemplate({
    ...addr({ id: 'g4-u03-82', subtopicId: 'u03-product-comparison-bounds', difficulty: 2 }),
    prompt: 'შეაფასე {a} × {b}: ნამრავლი {bound}-ზე მეტია თუ ნაკლები?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '302|4|1200|მეტია', '298|4|1200|ნაკლებია', '405|3|1200|მეტია', '395|3|1200|ნაკლებია',
          '502|3|1500|მეტია', '498|3|1500|ნაკლებია', '604|2|1200|მეტია', '594|2|1200|ნაკლებია',
          '203|6|1200|მეტია', '197|6|1200|ნაკლებია', '252|4|1000|მეტია', '248|4|1000|ნაკლებია',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      bound: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => ['მეტია', 'ნაკლებია'].filter((x) => x !== answer),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}, რაც ${vars.bound}-ზე ${answer}.`,
  }),

  // Q83 (Level 3): რომელი ნამრავლია მეტი: A1 × B თუ A2 × B
  defineTemplate({
    ...addr({ id: 'g4-u03-83', subtopicId: 'u03-product-comparison-bounds', difficulty: 3 }),
    prompt: 'რომელი ნამრავლია მეტი: {a1} × {b} თუ {a2} × {b}?',
    variables: {
      b: { kind: 'choice', values: [8, 7, 9, 6, 5, 4, 12, 11] },
      diff: { kind: 'choice', values: [2, 3, 4, 5] },
      base: { kind: 'choice', values: [49, 38, 57, 68, 74, 82, 35, 46, 63, 71] },
      a1: { kind: 'choice', values: (v) => [Number(v.base)] },
      a2: { kind: 'choice', values: (v) => [Number(v.base) + Number(v.diff)] },
    },
    answer: (v) => `${v.a2} × ${v.b}`,
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ vars }) => [`${vars.a1} × ${vars.b}`],
    explanation: ({ vars, answer }) => `რადგან ერთი მამრავლი (${vars.b}) საერთოა, ხოლო ${vars.a2} > ${vars.a1}, მეტია ${answer}.`,
  }),

  // Q84 (Level 3): ნამრავლის ქვედა ზღვარი: ერთი მამრავლია A, მეორე > B
  defineTemplate({
    ...addr({ id: 'g4-u03-84', subtopicId: 'u03-product-comparison-bounds', difficulty: 3 }),
    prompt: 'ნამრავლის ერთი მამრავლია {a}, ხოლო მეორე მამრავლი {b}-ზე მეტია. ნამრავლი აუცილებლად:',
    variables: {
      a: { kind: 'choice', values: [25, 20, 50, 40, 15, 30] },
      b: { kind: 'choice', values: [40, 50, 20, 25, 60, 30] },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.b)] },
    },
    answer: (v) => `${v.p}-ზე მეტია`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => [
      `${vars.p}-ის ტოლია`,
      `${vars.p}-ზე ნაკლებია`,
    ].filter((x) => x !== answer),
    explanation: ({ vars }) => `რადგან მეორე მამრავლი ${vars.b}-ზე მეტია, ნამრავლიც ${vars.a} × ${vars.b} = ${vars.p}-ზე მეტი იქნება.`,
  }),

  // ==================================================================
  // U03.15 — გადანაცვლებადობის თვისება ილუსტრაციებით (u03-commutative-arrays)
  // ==================================================================

  // Q85 (Level 1): R მწკრივი და C წერტილი
  defineTemplate({
    ...addr({ id: 'g4-u03-85', subtopicId: 'u03-commutative-arrays', difficulty: 1 }),
    prompt: 'მართკუთხა განლაგებაში {r} მწკრივია და თითოეულ მწკრივში {c} წერტილია. რამდენი წერტილია სულ?',
    variables: {
      r: { kind: 'choice', values: [3, 4, 5, 2, 6, 7, 4, 3, 5, 6, 8, 4] },
      c: { kind: 'choice', values: [5, 6, 4, 8, 3, 4, 7, 9, 8, 5, 3, 6] },
    },
    answer: (v) => Number(v.r) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.r} × ${vars.c} = ${answer} წერტილი.`,
  }),

  // Q86 (Level 1): გადალაგებული წერტილები: C მწკრივი და R წერტილი
  defineTemplate({
    ...addr({ id: 'g4-u03-86', subtopicId: 'u03-commutative-arrays', difficulty: 1 }),
    prompt: 'წერტილები {c} მწკრივად გადაალაგეს, თითოეულში {r} წერტილით. რამდენი წერტილია ახლა?',
    variables: {
      r: { kind: 'choice', values: [3, 4, 5, 2, 6, 7, 4, 3, 5, 6, 8, 4] },
      c: { kind: 'choice', values: [5, 6, 4, 8, 3, 4, 7, 9, 8, 5, 3, 6] },
    },
    answer: (v) => Number(v.r) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.c} × ${vars.r} = ${answer} წერტილი (რაოდენობა უცვლელია).`,
  }),

  // Q87 (Level 2): R მწკრივი და C ვარსკვლავი
  defineTemplate({
    ...addr({ id: 'g4-u03-87', subtopicId: 'u03-commutative-arrays', difficulty: 2 }),
    prompt: 'წარმოიდგინე {r} მწკრივი, თითოეულში {c} ვარსკვლავით. რამდენი ვარსკვლავია სულ?',
    variables: {
      r: { kind: 'choice', values: [4, 6, 5, 7, 8, 3, 9, 6, 5, 4, 7, 8] },
      c: { kind: 'choice', values: [6, 4, 7, 5, 4, 8, 4, 7, 9, 8, 6, 5] },
    },
    answer: (v) => Number(v.r) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.r} × ${vars.c} = ${answer} ვარსკვლავი.`,
  }),

  // Q88 (Level 2): C მწკრივად გადალაგებული ვარსკვლავები
  defineTemplate({
    ...addr({ id: 'g4-u03-88', subtopicId: 'u03-commutative-arrays', difficulty: 2 }),
    prompt: '{c} მწკრივად გადაალაგე იგივე ვარსკვლავები, თითოეულში {r} ვარსკვლავით. რამდენი ვარსკვლავია სულ?',
    variables: {
      r: { kind: 'choice', values: [4, 6, 5, 7, 8, 3, 9, 6, 5, 4, 7, 8] },
      c: { kind: 'choice', values: [6, 4, 7, 5, 4, 8, 4, 7, 9, 8, 6, 5] },
    },
    answer: (v) => Number(v.r) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.c} × ${vars.r} = ${answer} ვარსკვლავი.`,
  }),

  // Q89 (Level 3): შეავსე: R მწკრივი × C წერტილი = C მწკრივი × □ წერტილი
  defineTemplate({
    ...addr({ id: 'g4-u03-89', subtopicId: 'u03-commutative-arrays', difficulty: 3 }),
    prompt: 'შეავსე: {r} მწკრივი × {c} წერტილი = {c} მწკრივი × □ წერტილი.',
    variables: {
      r: { kind: 'choice', values: [7, 8, 6, 9, 5, 4, 12, 11, 8, 7, 6, 9] },
      c: { kind: 'choice', values: [8, 9, 7, 5, 8, 7, 5, 6, 12, 11, 8, 4] },
    },
    answer: (v) => Number(v.r),
    format: { kind: 'integer' },
    distractors: ({ vars }) => {
      const r = Number(vars.r);
      const c = Number(vars.c);
      return [c, r + 1, r - 1].filter((x) => x > 0 && x !== r);
    },
    explanation: ({ vars, answer }) => `გადანაცვლებადობის თვისებით: ${vars.r} × ${vars.c} = ${vars.c} × ${answer}.`,
  }),

  // Q90 (Level 3): სკამების რიგების გადაწყობა
  defineTemplate({
    ...addr({ id: 'g4-u03-90', subtopicId: 'u03-commutative-arrays', difficulty: 3 }),
    prompt: '{r} რიგში თითოეულში {c} სკამია. რამდენი სკამი იქნება, თუ სკამებს {c} რიგად გადააწყობენ, თითოეულში {r} სკამით?',
    variables: {
      r: { kind: 'choice', values: [9, 8, 7, 6, 12, 11, 8, 7, 6, 9, 10, 8] },
      c: { kind: 'choice', values: [4, 5, 6, 7, 4, 5, 6, 8, 9, 5, 6, 7] },
    },
    answer: (v) => Number(v.r) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.c} × ${vars.r} = ${answer} სკამი. სკამების საერთო რაოდენობა არ იცვლება.`,
  }),

  // ==================================================================
  // U03.16 — გადანაცვლებადობის თვისების გამოყენება (u03-apply-commutative)
  // ==================================================================

  // Q91 (Level 1): 4 × A
  defineTemplate({
    ...addr({ id: 'g4-u03-91', subtopicId: 'u03-apply-commutative', difficulty: 1 }),
    prompt: 'გამოთვალე მოხერხებულად: 4 × {a}.',
    variables: {
      a: { kind: 'choice', values: [27, 24, 32, 18, 26, 35, 19, 28, 34, 17, 23, 31] },
    },
    answer: (v) => 4 * Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 4, 1),
    explanation: ({ vars, answer }) => `4 × ${vars.a} = ${answer}.`,
  }),

  // Q92 (Level 1): 125 × A
  defineTemplate({
    ...addr({ id: 'g4-u03-92', subtopicId: 'u03-apply-commutative', difficulty: 1 }),
    prompt: 'გამოთვალე მოხერხებულად: 125 × {a}.',
    variables: {
      a: { kind: 'choice', values: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48] },
    },
    answer: (v) => 125 * Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 125, 100),
    explanation: ({ vars, answer }) => `125 × ${vars.a} = ${answer}.`,
  }),

  // Q93 (Level 2): გადაანაცვლე მამრავლები: A × 5
  defineTemplate({
    ...addr({ id: 'g4-u03-93', subtopicId: 'u03-apply-commutative', difficulty: 2 }),
    prompt: 'გადაანაცვლე მამრავლები და გამოთვალე: {a} × 5.',
    variables: {
      a: { kind: 'choice', values: [16, 18, 22, 24, 26, 28, 32, 34, 36, 38, 42, 44] },
    },
    answer: (v) => Number(v.a) * 5,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `5 × ${vars.a} = ${answer}.`,
  }),

  // Q94 (Level 2): 25 × A
  defineTemplate({
    ...addr({ id: 'g4-u03-94', subtopicId: 'u03-apply-commutative', difficulty: 2 }),
    prompt: 'გამოთვალე მოხერხებულად: 25 × {a}.',
    variables: {
      k: { kind: 'choice', values: [9, 7, 8, 6, 11, 12, 13, 14, 15, 16, 18, 21] },
      a: { kind: 'choice', values: (v) => [Number(v.k) * 4] },
    },
    answer: (v) => 100 * Number(v.k),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `25 × ${vars.a} = 25 × 4 × ${vars.k} = 100 × ${vars.k} = ${answer}.`,
  }),

  // Q95 (Level 3): შეავსე: A × 125 = 125 × □
  defineTemplate({
    ...addr({ id: 'g4-u03-95', subtopicId: 'u03-apply-commutative', difficulty: 3 }),
    prompt: 'შეავსე: {a} × 125 = 125 × □',
    variables: {
      a: { kind: 'choice', values: [7, 9, 11, 13, 15, 17, 19, 21, 23, 27, 29, 31] },
    },
    answer: (v) => Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      return [125, a + 1, a - 1].filter((x) => x !== a);
    },
    explanation: ({ vars, answer }) => `გადანაცვლებადობის თვისებით: ${vars.a} × 125 = 125 × ${answer}.`,
  }),

  // Q96 (Level 3): 2 × A × 5
  defineTemplate({
    ...addr({ id: 'g4-u03-96', subtopicId: 'u03-apply-commutative', difficulty: 3 }),
    prompt: 'გამოთვალე მოხერხებულად: 2 × {a} × 5.',
    variables: {
      a: { kind: 'choice', values: [37, 43, 29, 54, 68, 71, 83, 92, 47, 59, 63, 76] },
    },
    answer: (v) => 10 * Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `2 × 5 = 10; 10 × ${vars.a} = ${answer}.`,
  }),

  // ==================================================================
  // U03.17 — ერთი და იმავე რიცხვზე გამრავლება (u03-multiply-same-number)
  // ==================================================================

  // Q97 (Level 1): გამოთვალე A × B
  defineTemplate({
    ...addr({ id: 'g4-u03-97', subtopicId: 'u03-multiply-same-number', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [18, 16, 14, 15, 12, 22, 24, 25, 28, 32, 18, 15] },
      b: { kind: 'choice', values: [4, 5, 6, 3, 7, 4, 3, 4, 2, 3, 4, 6] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 4, 1),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q98 (Level 1): რამდენჯერ მეტია ნამრავლი
  defineTemplate({
    ...addr({ id: 'g4-u03-98', subtopicId: 'u03-multiply-same-number', difficulty: 1 }),
    prompt: 'თუ {a} × {b} = {p1}, რამდენჯერ მეტია ({a} × {doubleB}) პირველ ნამრავლზე?',
    variables: {
      a: { kind: 'choice', values: [18, 15, 14, 16, 12, 20, 24, 25, 11, 13, 17, 19] },
      b: { kind: 'choice', values: [4, 3, 5, 2, 6, 4, 3, 5, 2, 4, 3, 5] },
      p1: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.b)] },
      doubleB: { kind: 'choice', values: (v) => [Number(v.b) * 2] },
    },
    answer: () => '2-ჯერ',
    format: { kind: 'text' },
    optionCount: 3,
    distractors: () => ['3-ჯერ', '4-ჯერ'],
    explanation: () => `რადგან ერთი მამრავლი 2-ჯერ გაიზარდა, ნამრავლიც 2-ჯერ გაიზრდება.`,
  }),

  // Q99 (Level 2): თუ A × 5 = P, გამოთვალე A × 10
  defineTemplate({
    ...addr({ id: 'g4-u03-99', subtopicId: 'u03-multiply-same-number', difficulty: 2 }),
    prompt: 'თუ {a} × 5 = {p}, გამოთვალე: {a} × 10.',
    variables: {
      a: { kind: 'choice', values: [12, 14, 16, 18, 22, 24, 26, 28, 32, 34, 36, 15] },
      p: { kind: 'choice', values: (v) => [Number(v.a) * 5] },
    },
    answer: (v) => Number(v.a) * 10,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `რადგან 10 არის 5-ის გაორმაგება, ნამრავლიც გაორმაგდება: ${vars.p} × 2 = ${answer}.`,
  }),

  // Q100 (Level 2): თუ 25 × 4 = 100, გამოთვალე 25 × 8
  defineTemplate({
    ...addr({ id: 'g4-u03-100', subtopicId: 'u03-multiply-same-number', difficulty: 2 }),
    prompt: 'თუ {a} × 4 = {p}, გამოთვალე: {a} × 8.',
    variables: {
      a: { kind: 'choice', values: [25, 15, 35, 45, 12, 18, 22, 32, 14, 16, 24, 28] },
      p: { kind: 'choice', values: (v) => [Number(v.a) * 4] },
    },
    answer: (v) => Number(v.a) * 8,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 20, 10),
    explanation: ({ vars, answer }) => `რადგან 8 არის 4-ის გაორმაგება: ${vars.p} × 2 = ${answer}.`,
  }),

  // Q101 (Level 3): თუ A × 3 = P, ამიტომ A × 6 = □
  defineTemplate({
    ...addr({ id: 'g4-u03-101', subtopicId: 'u03-multiply-same-number', difficulty: 3 }),
    prompt: 'თუ {a} × 3 = {p}, ამიტომ {a} × 6 = □.',
    variables: {
      a: { kind: 'choice', values: [16, 18, 14, 15, 22, 24, 26, 28, 32, 35, 42, 12] },
      p: { kind: 'choice', values: (v) => [Number(v.a) * 3] },
    },
    answer: (v) => Number(v.a) * 6,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `მამრავლი გაორმაგდა (3 → 6), ამიტომ ${vars.p} × 2 = ${answer}.`,
  }),

  // Q102 (Level 3): რამდენჯერ იზრდება ნამრავლი: 4-დან 12-მდე (K-ჯერ)
  defineTemplate({
    ...addr({ id: 'g4-u03-102', subtopicId: 'u03-multiply-same-number', difficulty: 3 }),
    prompt: 'თუ ერთი მამრავლი უცვლელია, ხოლო მეორე მამრავლი {b1}-დან {b2}-მდე იზრდება, რამდენჯერ იზრდება ნამრავლი?',
    variables: {
      b1: { kind: 'choice', values: [4, 3, 5, 2, 4, 3, 5, 2, 6, 4, 3, 5] },
      k: { kind: 'choice', values: [3, 4, 2, 5, 2, 3, 3, 4, 2, 4, 5, 2] },
      b2: { kind: 'choice', values: (v) => [Number(v.b1) * Number(v.k)] },
    },
    answer: (v) => `${v.k}-ჯერ`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const k = Number(vars.k);
      return [`${k + 1}-ჯერ`, `${k + 2}-ჯერ`].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `რადგან მეორე მამრავლი ${vars.b2} ÷ ${vars.b1} = ${vars.k}-ჯერ გაიზარდა, ნამრავლიც ${answer} გაიზრდება.`,
  }),

    // ==================================================================
  // U03.18 — გამრავლების ცხრილის შევსება (გადათრევა და ჩასმა) (u03-table-fill-drag)
  // ==================================================================

  // Q103 (Level 1): შეავსე ტაბულა 3-ზე
  defineTemplate({
    ...addr({ id: 'g4-u03-103', subtopicId: 'u03-table-fill-drag', difficulty: 1 }),
    prompt: 'შეავსე ნამრავლები: {m} × {a} = □, {m} × {b} = □, {m} × {c} = □. რომელია სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '3|4|7|9', '3|2|5|8', '3|3|6|10', '3|5|8|11',
          '3|2|6|9', '3|4|8|12', '3|3|7|9', '3|5|7|11',
          '3|1|4|7', '3|6|8|10', '3|2|7|12', '3|4|6|11',
        ],
      },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `${Number(v.m) * Number(v.a)}; ${Number(v.m) * Number(v.b)}; ${Number(v.m) * Number(v.c)}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const m = Number(vars.m);
      const p1 = m * Number(vars.a);
      const p2 = m * Number(vars.b);
      const p3 = m * Number(vars.c);
      return [
        `${p1}; ${p2 + m}; ${p3}`,
        `${p1 + m}; ${p2}; ${p3}`,
        `${p1}; ${p2}; ${p3 + m}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.m} × ${vars.a} = ${Number(vars.m) * Number(vars.a)}, ${vars.m} × ${vars.b} = ${Number(vars.m) * Number(vars.b)}, ${vars.m} × ${vars.c} = ${Number(vars.m) * Number(vars.c)}. სწორი თანმიმდევრობაა: ${answer}.`,
  }),

  // Q104 (Level 1): შეავსე ტაბულა 5-ზე
  defineTemplate({
    ...addr({ id: 'g4-u03-104', subtopicId: 'u03-table-fill-drag', difficulty: 1 }),
    prompt: 'შეავსე ნამრავლები: {m} × {a} = □, {m} × {b} = □, {m} × {c} = □. რომელია სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '5|6|8|12', '5|3|7|9', '5|4|6|11', '5|5|8|10',
          '5|2|6|12', '5|4|7|9', '5|3|8|11', '5|6|9|12',
          '5|2|4|7', '5|5|7|11', '5|1|6|10', '5|3|5|8',
        ],
      },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `${Number(v.m) * Number(v.a)}; ${Number(v.m) * Number(v.b)}; ${Number(v.m) * Number(v.c)}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const m = Number(vars.m);
      const p1 = m * Number(vars.a);
      const p2 = m * Number(vars.b);
      const p3 = m * Number(vars.c);
      return [
        `${p1}; ${p2 + m}; ${p3}`,
        `${p1 + m}; ${p2}; ${p3}`,
        `${p1}; ${p2}; ${p3 - m}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.m} × ${vars.a} = ${Number(vars.m) * Number(vars.a)}, ${vars.m} × ${vars.b} = ${Number(vars.m) * Number(vars.b)}, ${vars.m} × ${vars.c} = ${Number(vars.m) * Number(vars.c)}. სწორი თანმიმდევრობაა: ${answer}.`,
  }),

  // Q105 (Level 2): შეავსე ტაბულა 7-ზე
  defineTemplate({
    ...addr({ id: 'g4-u03-105', subtopicId: 'u03-table-fill-drag', difficulty: 2 }),
    prompt: 'შეავსე ნამრავლები: {m} × {a} = □, {m} × {b} = □, {m} × {c} = □. რომელია სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '7|4|6|9', '7|3|5|8', '7|2|6|11', '7|5|7|10',
          '7|3|6|9', '7|4|7|12', '7|2|5|8', '7|6|8|11',
          '7|1|4|8', '7|3|7|11', '7|2|7|10', '7|5|8|12',
        ],
      },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `${Number(v.m) * Number(v.a)}; ${Number(v.m) * Number(v.b)}; ${Number(v.m) * Number(v.c)}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const m = Number(vars.m);
      const p1 = m * Number(vars.a);
      const p2 = m * Number(vars.b);
      const p3 = m * Number(vars.c);
      return [
        `${p1}; ${p2 - m}; ${p3}`,
        `${p1 - m}; ${p2}; ${p3}`,
        `${p1}; ${p2}; ${p3 - m}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.m} × ${vars.a} = ${Number(vars.m) * Number(vars.a)}, ${vars.m} × ${vars.b} = ${Number(vars.m) * Number(vars.b)}, ${vars.m} × ${vars.c} = ${Number(vars.m) * Number(vars.c)}. სწორი თანმიმდევრობაა: ${answer}.`,
  }),

  // Q106 (Level 2): შეავსე ტაბულა 8-ზე
  defineTemplate({
    ...addr({ id: 'g4-u03-106', subtopicId: 'u03-table-fill-drag', difficulty: 2 }),
    prompt: 'შეავსე ნამრავლები: {m} × {a} = □, {m} × {b} = □, {m} × {c} = □. რომელია სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '8|3|5|7', '8|2|4|6', '8|4|6|9', '8|3|6|8',
          '8|5|7|9', '8|2|5|7', '8|4|7|11', '8|3|8|12',
          '8|1|4|7', '8|2|6|10', '8|3|7|11', '8|5|8|12',
        ],
      },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `${Number(v.m) * Number(v.a)}; ${Number(v.m) * Number(v.b)}; ${Number(v.m) * Number(v.c)}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const m = Number(vars.m);
      const p1 = m * Number(vars.a);
      const p2 = m * Number(vars.b);
      const p3 = m * Number(vars.c);
      return [
        `${p1}; ${p2 + m}; ${p3}`,
        `${p1 + m}; ${p2}; ${p3}`,
        `${p1}; ${p2}; ${p3 + m}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.m} × ${vars.a} = ${Number(vars.m) * Number(vars.a)}, ${vars.m} × ${vars.b} = ${Number(vars.m) * Number(vars.b)}, ${vars.m} × ${vars.c} = ${Number(vars.m) * Number(vars.c)}. სწორი თანმიმდევრობაა: ${answer}.`,
  }),

  // Q107 (Level 3): შეავსე ტაბულა 9-ზე
  defineTemplate({
    ...addr({ id: 'g4-u03-107', subtopicId: 'u03-table-fill-drag', difficulty: 3 }),
    prompt: 'შეავსე ნამრავლები: {m} × {a} = □, {m} × {b} = □, {m} × {c} = □. რომელია სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '9|4|8|12', '9|3|6|9', '9|2|5|8', '9|5|7|11',
          '9|3|7|10', '9|4|6|11', '9|2|6|12', '9|5|8|12',
          '9|1|4|7', '9|2|7|11', '9|3|5|10', '9|6|8|12',
        ],
      },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `${Number(v.m) * Number(v.a)}; ${Number(v.m) * Number(v.b)}; ${Number(v.m) * Number(v.c)}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const m = Number(vars.m);
      const p1 = m * Number(vars.a);
      const p2 = m * Number(vars.b);
      const p3 = m * Number(vars.c);
      return [
        `${p1}; ${p2 - 2}; ${p3}`,
        `${p1 - 4}; ${p2}; ${p3}`,
        `${p1}; ${p2}; ${p3 + 10}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.m} × ${vars.a} = ${Number(vars.m) * Number(vars.a)}, ${vars.m} × ${vars.b} = ${Number(vars.m) * Number(vars.b)}, ${vars.m} × ${vars.c} = ${Number(vars.m) * Number(vars.c)}. სწორი თანმიმდევრობაა: ${answer}.`,
  }),

  // Q108 (Level 3): შეავსე ტაბულა 12-ზე
  defineTemplate({
    ...addr({ id: 'g4-u03-108', subtopicId: 'u03-table-fill-drag', difficulty: 3 }),
    prompt: 'შეავსე ნამრავლები: {m} × {a} = □, {m} × {b} = □, {m} × {c} = □. რომელია სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '12|3|6|9', '12|2|5|8', '12|4|7|10', '12|2|4|6',
          '12|3|5|8', '12|4|6|9', '12|2|6|11', '12|5|7|12',
          '12|1|4|7', '12|3|7|11', '12|2|7|10', '12|6|8|12',
        ],
      },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `${Number(v.m) * Number(v.a)}; ${Number(v.m) * Number(v.b)}; ${Number(v.m) * Number(v.c)}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const m = Number(vars.m);
      const p1 = m * Number(vars.a);
      const p2 = m * Number(vars.b);
      const p3 = m * Number(vars.c);
      return [
        `${p1}; ${p2 - 4}; ${p3}`,
        `${p1 - 2}; ${p2}; ${p3}`,
        `${p1}; ${p2}; ${p3 + 4}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.m} × ${vars.a} = ${Number(vars.m) * Number(vars.a)}, ${vars.m} × ${vars.b} = ${Number(vars.m) * Number(vars.b)}, ${vars.m} × ${vars.c} = ${Number(vars.m) * Number(vars.c)}. სწორი თანმიმდევრობაა: ${answer}.`,
  }),

  // ==================================================================
  // U03.19 — გამრავლების ტაბულა 12-მდე (გადათრევა და ჩასმა) (u03-table-12-drag)
  // ==================================================================

  // Q109 (Level 1): a × m, b × m, c × m (m = 7)
  defineTemplate({
    ...addr({ id: 'g4-u03-109', subtopicId: 'u03-table-12-drag', difficulty: 1 }),
    prompt: 'შეავსე: {a} × {m} = □, {b} × {m} = □, {c} × {m} = □. რომელია სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '7|2|4|6', '7|3|5|7', '7|1|3|5', '7|2|5|8',
          '7|3|6|9', '7|2|4|8', '7|4|6|8', '7|1|4|7',
          '7|3|7|11', '7|2|6|10', '7|5|8|12', '7|4|7|9',
        ],
      },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `${Number(v.a) * Number(v.m)}; ${Number(v.b) * Number(v.m)}; ${Number(v.c) * Number(v.m)}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const m = Number(vars.m);
      const p1 = Number(vars.a) * m;
      const p2 = Number(vars.b) * m;
      const p3 = Number(vars.c) * m;
      return [
        `${p1}; ${p2 - 4}; ${p3}`,
        `${p1 + 2}; ${p2}; ${p3}`,
        `${p1}; ${p2}; ${p3 + 6}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.m} = ${Number(vars.a) * Number(vars.m)}, ${vars.b} × ${vars.m} = ${Number(vars.b) * Number(vars.m)}, ${vars.c} × ${vars.m} = ${Number(vars.c) * Number(vars.m)}. სწორი თანმიმდევრობაა: ${answer}.`,
  }),

  // Q110 (Level 1): a × m, b × m, c × m (m = 8)
  defineTemplate({
    ...addr({ id: 'g4-u03-110', subtopicId: 'u03-table-12-drag', difficulty: 1 }),
    prompt: 'შეავსე: {a} × {m} = □, {b} × {m} = □, {c} × {m} = □. რომელია სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '8|3|5|7', '8|2|4|6', '8|1|3|5', '8|4|6|8',
          '8|2|5|8', '8|3|6|9', '8|2|6|10', '8|4|7|9',
          '8|1|4|8', '8|3|7|11', '8|5|7|10', '8|6|8|12',
        ],
      },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `${Number(v.a) * Number(v.m)}; ${Number(v.b) * Number(v.m)}; ${Number(v.c) * Number(v.m)}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const m = Number(vars.m);
      const p1 = Number(vars.a) * m;
      const p2 = Number(vars.b) * m;
      const p3 = Number(vars.c) * m;
      return [
        `${p1}; ${p2 - 2}; ${p3}`,
        `${p1 + 2}; ${p2}; ${p3}`,
        `${p1}; ${p2}; ${p3 + 2}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.m} = ${Number(vars.a) * Number(vars.m)}, ${vars.b} × ${vars.m} = ${Number(vars.b) * Number(vars.m)}, ${vars.c} × ${vars.m} = ${Number(vars.c) * Number(vars.m)}. სწორი თანმიმდევრობაა: ${answer}.`,
  }),

  // Q111 (Level 2): a × m, b × m, c × m (m = 9)
  defineTemplate({
    ...addr({ id: 'g4-u03-111', subtopicId: 'u03-table-12-drag', difficulty: 2 }),
    prompt: 'შეავსე: {a} × {m} = □, {b} × {m} = □, {c} × {m} = □. რომელია სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '9|4|6|8', '9|3|5|7', '9|2|4|6', '9|5|7|9',
          '9|3|6|8', '9|2|5|8', '9|4|7|10', '9|3|7|11',
          '9|1|4|7', '9|2|6|10', '9|5|8|12', '9|6|9|12',
        ],
      },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `${Number(v.a) * Number(v.m)}; ${Number(v.b) * Number(v.m)}; ${Number(v.c) * Number(v.m)}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const m = Number(vars.m);
      const p1 = Number(vars.a) * m;
      const p2 = Number(vars.b) * m;
      const p3 = Number(vars.c) * m;
      return [
        `${p1}; ${p2 - 2}; ${p3}`,
        `${p1 - 2}; ${p2}; ${p3}`,
        `${p1}; ${p2}; ${p3 + 2}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.m} = ${Number(vars.a) * Number(vars.m)}, ${vars.b} × ${vars.m} = ${Number(vars.b) * Number(vars.m)}, ${vars.c} × ${vars.m} = ${Number(vars.c) * Number(vars.m)}. სწორი თანმიმდევრობაა: ${answer}.`,
  }),

  // Q112 (Level 2): a × m, b × m, c × m (m = 12)
  defineTemplate({
    ...addr({ id: 'g4-u03-112', subtopicId: 'u03-table-12-drag', difficulty: 2 }),
    prompt: 'შეავსე: {a} × {m} = □, {b} × {m} = □, {c} × {m} = □. რომელია სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '12|3|6|9', '12|2|4|6', '12|4|7|10', '12|1|3|5',
          '12|2|5|8', '12|3|5|7', '12|4|6|8', '12|2|6|9',
          '12|1|4|8', '12|3|7|11', '12|5|8|12', '12|6|9|12',
        ],
      },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `${Number(v.a) * Number(v.m)}; ${Number(v.b) * Number(v.m)}; ${Number(v.c) * Number(v.m)}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const m = Number(vars.m);
      const p1 = Number(vars.a) * m;
      const p2 = Number(vars.b) * m;
      const p3 = Number(vars.c) * m;
      return [
        `${p1}; ${p2 - 2}; ${p3}`,
        `${p1 + 2}; ${p2}; ${p3}`,
        `${p1}; ${p2}; ${p3 + 2}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.m} = ${Number(vars.a) * Number(vars.m)}, ${vars.b} × ${vars.m} = ${Number(vars.b) * Number(vars.m)}, ${vars.c} × ${vars.m} = ${Number(vars.c) * Number(vars.m)}. სწორი თანმიმდევრობაა: ${answer}.`,
  }),

  // Q113 (Level 3): a × m, b × m, c × m (m = 11)
  defineTemplate({
    ...addr({ id: 'g4-u03-113', subtopicId: 'u03-table-12-drag', difficulty: 3 }),
    prompt: 'შეავსე: {a} × {m} = □, {b} × {m} = □, {c} × {m} = □. რომელია სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '11|4|7|9', '11|3|6|8', '11|2|5|7', '11|5|8|11',
          '11|3|5|9', '11|4|6|8', '11|2|6|12', '11|5|7|10',
          '11|1|4|7', '11|2|7|11', '11|3|8|12', '11|6|9|12',
        ],
      },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `${Number(v.a) * Number(v.m)}; ${Number(v.b) * Number(v.m)}; ${Number(v.c) * Number(v.m)}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const m = Number(vars.m);
      const p1 = Number(vars.a) * m;
      const p2 = Number(vars.b) * m;
      const p3 = Number(vars.c) * m;
      return [
        `${p1}; ${p2 - 2}; ${p3}`,
        `${p1 - 2}; ${p2}; ${p3}`,
        `${p1}; ${p2}; ${p3 - 4}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.m} = ${Number(vars.a) * Number(vars.m)}, ${vars.b} × ${vars.m} = ${Number(vars.b) * Number(vars.m)}, ${vars.c} × ${vars.m} = ${Number(vars.c) * Number(vars.m)}. სწორი თანმიმდევრობაა: ${answer}.`,
  }),

  // Q114 (Level 3): a × m, b × m, c × m (m = 12)
  defineTemplate({
    ...addr({ id: 'g4-u03-114', subtopicId: 'u03-table-12-drag', difficulty: 3 }),
    prompt: 'შეავსე: {a} × {m} = □, {b} × {m} = □, {c} × {m} = □. რომელია სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '12|5|8|11', '12|3|7|10', '12|4|8|12', '12|2|6|11',
          '12|3|6|9', '12|5|7|11', '12|4|7|10', '12|2|8|12',
          '12|1|5|9', '12|3|8|12', '12|4|6|11', '12|6|8|10',
        ],
      },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `${Number(v.a) * Number(v.m)}; ${Number(v.b) * Number(v.m)}; ${Number(v.c) * Number(v.m)}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const m = Number(vars.m);
      const p1 = Number(vars.a) * m;
      const p2 = Number(vars.b) * m;
      const p3 = Number(vars.c) * m;
      return [
        `${p1}; ${p2 - 2}; ${p3}`,
        `${p1 - 2}; ${p2}; ${p3}`,
        `${p1}; ${p2}; ${p3 - 2}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.m} = ${Number(vars.a) * Number(vars.m)}, ${vars.b} × ${vars.m} = ${Number(vars.b) * Number(vars.m)}, ${vars.c} × ${vars.m} = ${Number(vars.c) * Number(vars.m)}. სწორი თანმიმდევრობაა: ${answer}.`,
  }),
];
