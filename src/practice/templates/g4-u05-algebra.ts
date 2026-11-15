/**
 * Grade 4 — U05: ალგებრა (Algebra).
 *
 * Full curriculum implementation for Grade 4 Unit 5 from Google Drive document U05
 * (folder "WEBSITE GRADE 4"):
 * 18 templates (Q01–Q18) across 3 subtopics with complete Level 1, 2, and 3 coverage (6 questions per subtopic):
 *
 *   U05.1  u05-write-expressions          (ალგებრული გამოსახულებების ჩაწერა, Q01–Q06)
 *   U05.2  u05-evaluate-expression        (გამოსახულების მნიშვნელობის გამოთვლა, Q07–Q12)
 *   U05.3  u05-evaluate-multiple-values   (გამოსახულების მნიშვნელობების გამოთვლა ცვლადების სხვადასხვა მნიშვნელობისთვის, Q13–Q18)
 */

import { defineTemplate } from './types';
import type { QuestionTemplate, DifficultyLevel } from './types';

const grade = 4 as const;
const topicId = 'g4-algebra' as const;
const unitId = 'g4-algebra' as const;

export const G4_U05_SUBTOPICS = [
  'u05-write-expressions',
  'u05-evaluate-expression',
  'u05-evaluate-multiple-values',
] as const;

export type G4U05SubtopicId = (typeof G4_U05_SUBTOPICS)[number];

const addr = (spec: { id: string; subtopicId: G4U05SubtopicId; difficulty: DifficultyLevel }) => ({
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
    }
    d += 1;
  }
  return result;
}

export const G4_U05_TEMPLATES: QuestionTemplate[] = [
  // ==================================================================
  // U05.1 — ალგებრული გამოსახულებების ჩაწერა (u05-write-expressions)
  // ==================================================================

  // Q01 (Level 1): ჩაწერე გამოსახულების სახით: რიცხვ a-ს დაუმატე 12.
  defineTemplate({
    ...addr({ id: 'g4-u05-01', subtopicId: 'u05-write-expressions', difficulty: 1 }),
    prompt: 'ჩაწერე გამოსახულების სახით: რიცხვ {var}-ს დაუმატე {k}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'a|12', 'b|15', 'x|8', 'y|20', 'n|14', 'm|25',
          'c|9', 'p|30', 'k|17', 't|11', 'd|16', 'z|22',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => `${v.var} + ${v.k}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => [
      `${vars.var} - ${vars.k}`,
      `${vars.k} - ${vars.var}`,
      `${vars.var} × ${vars.k}`,
    ],
    explanation: ({ vars, answer }) => `რიცხვ ${vars.var}-ზე ${vars.k}-ის დამატება იწერება შეკრების სახით: ${answer}.`,
  }),

  // Q02 (Level 1): ჩაწერე გამოსახულების სახით: რიცხვ b-ს გამოაკელი 7.
  defineTemplate({
    ...addr({ id: 'g4-u05-02', subtopicId: 'u05-write-expressions', difficulty: 1 }),
    prompt: 'ჩაწერე გამოსახულების სახით: რიცხვ {var}-ს გამოაკელი {k}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'b|7', 'a|9', 'x|13', 'y|18', 'm|5', 'n|12',
          'c|15', 'p|8', 't|14', 'k|20', 'd|11', 'z|16',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => `${v.var} - ${v.k}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => [
      `${vars.k} - ${vars.var}`,
      `${vars.var} + ${vars.k}`,
      `${vars.var} ÷ ${vars.k}`,
    ],
    explanation: ({ vars, answer }) => `რიცხვ ${vars.var}-დან ${vars.k}-ის გამოკლება იწერება სხვაობის სახით: ${answer}.`,
  }),

  // Q03 (Level 2): ჩაწერე გამოსახულების სახით: რიცხვი x გაამრავლე 8-ზე.
  defineTemplate({
    ...addr({ id: 'g4-u05-03', subtopicId: 'u05-write-expressions', difficulty: 2 }),
    prompt: 'ჩაწერე გამოსახულების სახით: რიცხვი {var} გაამრავლე {k}-ზე.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'x|8', 'y|6', 'a|7', 'b|5', 'n|9', 'm|4',
          'c|3', 'p|10', 't|12', 'k|15', 'd|20', 'z|2',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => `${v.k}${v.var}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => [
      `${vars.var} + ${vars.k}`,
      `${vars.var} ÷ ${vars.k}`,
      `${vars.var} - ${vars.k}`,
    ],
    explanation: ({ vars, answer }) => `რიცხვი ${vars.var}-ის ${vars.k}-ზე გამრავლება ალგებრულად ჩაიწერება როგორც ${answer}.`,
  }),

  // Q04 (Level 2): ჩაწერე გამოსახულების სახით: რიცხვი y გაყავი 6-ზე.
  defineTemplate({
    ...addr({ id: 'g4-u05-04', subtopicId: 'u05-write-expressions', difficulty: 2 }),
    prompt: 'ჩაწერე გამოსახულების სახით: რიცხვი {var} გაყავი {k}-ზე.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'y|6', 'x|8', 'a|4', 'b|5', 'n|7', 'm|9',
          'p|3', 'c|2', 't|10', 'k|12', 'd|15', 'z|20',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => `${v.var} ÷ ${v.k}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => [
      `${vars.k} ÷ ${vars.var}`,
      `${vars.var} × ${vars.k}`,
      `${vars.var} - ${vars.k}`,
    ],
    explanation: ({ vars, answer }) => `რიცხვი ${vars.var}-ის ${vars.k}-ზე გაყოფა იწერება განაყოფის სახით: ${answer}.`,
  }),

  // Q05 (Level 3): ჩაწერე გამოსახულების სახით: რიცხვ n-ს დაუმატე 15 და მიღებული შედეგი გაამრავლე 3-ზე.
  defineTemplate({
    ...addr({ id: 'g4-u05-05', subtopicId: 'u05-write-expressions', difficulty: 3 }),
    prompt: 'ჩაწერე გამოსახულების სახით: რიცხვ {var}-ს დაუმატე {k} და მიღებული შედეგი გაამრავლე {m}-ზე.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'n|15|3', 'x|12|4', 'a|8|2', 'b|10|5',
          'y|6|7', 'm|20|2', 'p|14|3', 'c|9|6',
          't|11|8', 'k|7|9', 'd|18|2', 'z|25|4',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => `(${v.var} + ${v.k}) × ${v.m}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => [
      `${vars.var} + ${vars.k} × ${vars.m}`,
      `${vars.m}${vars.var} + ${vars.k}`,
      `(${vars.var} - ${vars.k}) × ${vars.m}`,
    ],
    explanation: ({ vars, answer }) => `ჯერ ვასრულებთ შეკრებას ფრჩხილებში (${vars.var} + ${vars.k}), შემდეგ კი შედეგს ვამრავლებთ ${vars.m}-ზე: ${answer}.`,
  }),

  // Q06 (Level 3): ჩაწერე გამოსახულების სახით: რიცხვ m-ს გაამრავლე 4-ზე და მიღებულ შედეგს გამოაკელი 9.
  defineTemplate({
    ...addr({ id: 'g4-u05-06', subtopicId: 'u05-write-expressions', difficulty: 3 }),
    prompt: 'ჩაწერე გამოსახულების სახით: რიცხვ {var}-ს გაამრავლე {m}-ზე და მიღებულ შედეგს გამოაკელი {k}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'm|4|9', 'n|3|7', 'x|5|12', 'y|6|15',
          'a|2|8', 'b|7|6', 'c|8|14', 'p|9|10',
          't|10|11', 'k|12|5', 'd|15|16', 'z|20|20',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      k: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => `${v.m}${v.var} - ${v.k}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => [
      `${vars.m}(${vars.var} - ${vars.k})`,
      `${vars.var} - ${vars.m} × ${vars.k}`,
      `${vars.m}${vars.var} + ${vars.k}`,
    ],
    explanation: ({ vars, answer }) => `რიცხვ ${vars.var}-ის ${vars.m}-ზე გამრავლებით მიიღება ${vars.m}${vars.var}, შემდეგ ვაკლებთ ${vars.k}-ს: ${answer}.`,
  }),

  // ==================================================================
  // U05.2 — გამოსახულების მნიშვნელობის გამოთვლა (u05-evaluate-expression)
  // ==================================================================

  // Q07 (Level 1): გამოთვალე a + 14, თუ a = 6.
  defineTemplate({
    ...addr({ id: 'g4-u05-07', subtopicId: 'u05-evaluate-expression', difficulty: 1 }),
    prompt: 'გამოთვალე: {var} + {k}, თუ {var} = {val}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'a|14|6', 'b|12|8', 'x|15|9', 'y|18|7',
          'n|20|13', 'm|16|14', 'c|25|15', 'p|19|11',
          't|22|18', 'k|17|23', 'd|30|15', 'z|24|16',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      val: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.val) + Number(v.k),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 0),
    explanation: ({ vars, answer }) => `${vars.var}-ის ნაცვლად ჩავსვათ ${vars.val}: ${vars.val} + ${vars.k} = ${answer}.`,
  }),

  // Q08 (Level 1): გამოთვალე b - 18, თუ b = 45.
  defineTemplate({
    ...addr({ id: 'g4-u05-08', subtopicId: 'u05-evaluate-expression', difficulty: 1 }),
    prompt: 'გამოთვალე: {var} - {k}, თუ {var} = {val}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'b|18|45', 'a|15|32', 'x|12|40', 'y|16|51',
          'n|14|30', 'm|25|60', 'c|19|42', 'p|22|55',
          't|17|36', 'k|21|63', 'd|24|48', 'z|13|35',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      val: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.val) - Number(v.k),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 0),
    explanation: ({ vars, answer }) => `${vars.var}-ის ნაცვლად ჩავსვათ ${vars.val}: ${vars.val} - ${vars.k} = ${answer}.`,
  }),

  // Q09 (Level 2): გამოთვალე 7x, თუ x = 9.
  defineTemplate({
    ...addr({ id: 'g4-u05-09', subtopicId: 'u05-evaluate-expression', difficulty: 2 }),
    prompt: 'გამოთვალე: {k}{var}, თუ {var} = {val}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'x|7|9', 'y|6|8', 'a|8|7', 'b|9|6',
          'n|5|12', 'm|4|15', 'c|3|16', 'p|7|11',
          't|8|12', 'k|6|14', 'd|5|18', 'z|4|25',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      val: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.k) * Number(v.val),
    format: { kind: 'integer' },
    distractors: ({ answer, vars }) => nearMisses(Number(answer), 3, Number(vars.k), 1),
    explanation: ({ vars, answer }) => `${vars.k}${vars.var} ნიშნავს ${vars.k} × ${vars.var}. ${vars.var}-ის ნაცვლად ჩავსვათ ${vars.val}: ${vars.k} × ${vars.val} = ${answer}.`,
  }),

  // Q10 (Level 2): გამოთვალე y ÷ 5, თუ y = 60.
  defineTemplate({
    ...addr({ id: 'g4-u05-10', subtopicId: 'u05-evaluate-expression', difficulty: 2 }),
    prompt: 'გამოთვალე: {var} ÷ {k}, თუ {var} = {val}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'y|5|60', 'x|6|72', 'a|4|48', 'b|7|84',
          'n|8|96', 'm|9|108', 'c|3|45', 'p|6|90',
          't|5|75', 'k|8|120', 'd|7|98', 'z|4|68',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      val: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.val) / Number(v.k),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.var}-ის ნაცვლად ჩავსვათ ${vars.val}: ${vars.val} ÷ ${vars.k} = ${answer}.`,
  }),

  // Q11 (Level 3): გამოთვალე 3n + 8, თუ n = 7.
  defineTemplate({
    ...addr({ id: 'g4-u05-11', subtopicId: 'u05-evaluate-expression', difficulty: 3 }),
    prompt: 'გამოთვალე: {k}{var} + {c}, თუ {var} = {val}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'n|3|7|8', 'x|4|6|11', 'y|5|5|12', 'a|2|14|9',
          'b|6|6|15', 'm|7|4|10', 'p|8|5|7', 'c|3|12|14',
          't|4|9|16', 'k|5|8|15', 'd|6|7|18', 'z|2|18|20',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      val: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.k) * Number(v.val) + Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => {
      const prod = Number(vars.k) * Number(vars.val);
      return `${vars.var}-ის ნაცვლად ჩავსვათ ${vars.val}: ${vars.k} × ${vars.val} + ${vars.c} = ${prod} + ${vars.c} = ${answer}.`;
    },
  }),

  // Q12 (Level 3): გამოთვალე 4m - 12, თუ m = 8.
  defineTemplate({
    ...addr({ id: 'g4-u05-12', subtopicId: 'u05-evaluate-expression', difficulty: 3 }),
    prompt: 'გამოთვალე: {k}{var} - {c}, თუ {var} = {val}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'm|4|8|12', 'n|5|7|15', 'x|3|12|10', 'y|6|6|16',
          'a|7|5|14', 'b|8|4|12', 'p|9|4|16', 'c|5|9|20',
          't|4|11|14', 'k|3|15|15', 'd|6|8|18', 'z|7|6|22',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      val: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.k) * Number(v.val) - Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => {
      const prod = Number(vars.k) * Number(vars.val);
      return `${vars.var}-ის ნაცვლად ჩავსვათ ${vars.val}: ${vars.k} × ${vars.val} - ${vars.c} = ${prod} - ${vars.c} = ${answer}.`;
    },
  }),

  // ==================================================================
  // U05.3 — გამოსახულების მნიშვნელობების გამოთვლა ცვლადების სხვადასხვა მნიშვნელობისთვის
  // (u05-evaluate-multiple-values)
  // ==================================================================

  // Q13 (Level 1): გამოთვალე x + 5, თუ x = 2, x = 6 და x = 10.
  defineTemplate({
    ...addr({ id: 'g4-u05-13', subtopicId: 'u05-evaluate-multiple-values', difficulty: 1 }),
    prompt: 'გამოთვალე {var} + {k}, თუ {var} = {v1}, {var} = {v2} და {var} = {v3}. რომელია მიღებული მნიშვნელობების სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'x|5|2|6|10', 'a|7|3|8|12', 'b|4|5|9|15', 'y|6|4|7|11',
          'n|8|2|6|12', 'm|9|1|5|10', 'c|10|3|7|14', 'p|12|2|8|15',
          't|15|5|10|20', 'k|11|4|9|16', 'd|14|3|6|12', 'z|13|2|7|15',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      v1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      v2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      v3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
    },
    answer: (v) => {
      const k = Number(v.k);
      return `${Number(v.v1) + k}, ${Number(v.v2) + k}, ${Number(v.v3) + k}`;
    },
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => {
      const k = Number(vars.k);
      const r1 = Number(vars.v1) + k;
      const r2 = Number(vars.v2) + k;
      const r3 = Number(vars.v3) + k;
      return [
        `${r1 + 1}, ${r2 + 1}, ${r3 + 1}`,
        `${r1 - 1}, ${r2 - 1}, ${r3 - 1}`,
        `${r1}, ${r2 + 1}, ${r3 - 1}`,
      ];
    },
    explanation: ({ vars, answer }) => {
      const k = Number(vars.k);
      const r1 = Number(vars.v1) + k;
      const r2 = Number(vars.v2) + k;
      const r3 = Number(vars.v3) + k;
      return `${vars.v1} + ${k} = ${r1}; ${vars.v2} + ${k} = ${r2}; ${vars.v3} + ${k} = ${r3}. სწორი თანმიმდევრობაა: ${answer}.`;
    },
  }),

  // Q14 (Level 1): იპოვე 3a-ს მნიშვნელობა, თუ a = 4, a = 7 და a = 9.
  defineTemplate({
    ...addr({ id: 'g4-u05-14', subtopicId: 'u05-evaluate-multiple-values', difficulty: 1 }),
    prompt: 'იპოვე {k}{var}-ის მნიშვნელობა, თუ {var} = {v1}, {var} = {v2} და {var} = {v3}. რომელია მიღებული მნიშვნელობების სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'a|3|4|7|9', 'x|2|5|8|11', 'y|4|3|6|8', 'b|5|2|6|9',
          'n|3|5|8|12', 'm|6|2|5|7', 'c|4|4|7|10', 'p|2|6|9|14',
          't|5|3|7|11', 'k|3|6|9|11', 'd|4|5|8|12', 'z|6|3|6|8',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      v1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      v2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      v3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
    },
    answer: (v) => {
      const k = Number(v.k);
      return `${Number(v.v1) * k}, ${Number(v.v2) * k}, ${Number(v.v3) * k}`;
    },
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => {
      const k = Number(vars.k);
      const r1 = Number(vars.v1) * k;
      const r2 = Number(vars.v2) * k;
      const r3 = Number(vars.v3) * k;
      return [
        `${r1 + k}, ${r2 + k}, ${r3 + k}`,
        `${r1 - k}, ${r2 - k}, ${r3 - k}`,
        `${r1}, ${r2 + k}, ${r3 - k}`,
      ];
    },
    explanation: ({ vars, answer }) => {
      const k = Number(vars.k);
      const r1 = Number(vars.v1) * k;
      const r2 = Number(vars.v2) * k;
      const r3 = Number(vars.v3) * k;
      return `${k} × ${vars.v1} = ${r1}; ${k} × ${vars.v2} = ${r2}; ${k} × ${vars.v3} = ${r3}. სწორი თანმიმდევრობაა: ${answer}.`;
    },
  }),

  // Q15 (Level 2): გამოთვალე b - 6, თუ b = 12, b = 20 და b = 35.
  defineTemplate({
    ...addr({ id: 'g4-u05-15', subtopicId: 'u05-evaluate-multiple-values', difficulty: 2 }),
    prompt: 'გამოთვალე {var} - {k}, თუ {var} = {v1}, {var} = {v2} და {var} = {v3}. რომელია მიღებული მნიშვნელობების სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'b|6|12|20|35', 'a|5|15|22|30', 'x|8|18|25|40', 'y|7|14|21|38',
          'n|9|19|27|45', 'm|10|20|32|50', 'c|4|12|24|36', 'p|11|21|33|48',
          't|12|22|35|52', 'k|15|25|38|60', 'd|14|24|37|54', 'z|13|23|36|55',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      v1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      v2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      v3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
    },
    answer: (v) => {
      const k = Number(v.k);
      return `${Number(v.v1) - k}, ${Number(v.v2) - k}, ${Number(v.v3) - k}`;
    },
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => {
      const k = Number(vars.k);
      const r1 = Number(vars.v1) - k;
      const r2 = Number(vars.v2) - k;
      const r3 = Number(vars.v3) - k;
      return [
        `${r1 + 1}, ${r2 + 1}, ${r3 + 1}`,
        `${r1 - 1}, ${r2 - 1}, ${r3 - 1}`,
        `${r1 + 2}, ${r2 - 1}, ${r3 + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => {
      const k = Number(vars.k);
      const r1 = Number(vars.v1) - k;
      const r2 = Number(vars.v2) - k;
      const r3 = Number(vars.v3) - k;
      return `${vars.v1} - ${k} = ${r1}; ${vars.v2} - ${k} = ${r2}; ${vars.v3} - ${k} = ${r3}. სწორი თანმიმდევრობაა: ${answer}.`;
    },
  }),

  // Q16 (Level 2): იპოვე 2y + 3-ის მნიშვნელობა, თუ y = 1, y = 5 და y = 8.
  defineTemplate({
    ...addr({ id: 'g4-u05-16', subtopicId: 'u05-evaluate-multiple-values', difficulty: 2 }),
    prompt: 'იპოვე {k}{var} + {c}-ის მნიშვნელობა, თუ {var} = {v1}, {var} = {v2} და {var} = {v3}. რომელია მიღებული მნიშვნელობების სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'y|2|3|1|5|8', 'x|3|2|2|4|7', 'a|4|1|2|5|9', 'b|2|5|3|6|10',
          'n|3|4|1|6|9', 'm|5|2|2|4|6', 'c|2|7|2|5|8', 'p|4|3|1|4|7',
          't|3|5|2|5|8', 'k|2|6|3|7|11', 'd|5|1|1|3|5', 'z|3|1|3|6|10',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      v1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      v2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
      v3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[5])] },
    },
    answer: (v) => {
      const k = Number(v.k);
      const c = Number(v.c);
      return `${k * Number(v.v1) + c}, ${k * Number(v.v2) + c}, ${k * Number(v.v3) + c}`;
    },
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => {
      const k = Number(vars.k);
      const c = Number(vars.c);
      const r1 = k * Number(vars.v1) + c;
      const r2 = k * Number(vars.v2) + c;
      const r3 = k * Number(vars.v3) + c;
      return [
        `${r1 + 1}, ${r2 + 1}, ${r3 + 1}`,
        `${r1 - 1}, ${r2 - 1}, ${r3 - 1}`,
        `${r1}, ${r2 + 2}, ${r3 - 2}`,
      ];
    },
    explanation: ({ vars, answer }) => {
      const k = Number(vars.k);
      const c = Number(vars.c);
      const r1 = k * Number(vars.v1) + c;
      const r2 = k * Number(vars.v2) + c;
      const r3 = k * Number(vars.v3) + c;
      return `${k} × ${vars.v1} + ${c} = ${r1}; ${k} × ${vars.v2} + ${c} = ${r2}; ${k} × ${vars.v3} + ${c} = ${r3}. სწორი თანმიმდევრობაა: ${answer}.`;
    },
  }),

  // Q17 (Level 3): გამოთვალე n ÷ 4, თუ n = 16, n = 28 და n = 40.
  defineTemplate({
    ...addr({ id: 'g4-u05-17', subtopicId: 'u05-evaluate-multiple-values', difficulty: 3 }),
    prompt: 'გამოთვალე {var} ÷ {k}, თუ {var} = {v1}, {var} = {v2} და {var} = {v3}. რომელია მიღებული მნიშვნელობების სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'n|4|16|28|40', 'x|3|15|24|36', 'y|5|25|35|50', 'a|6|24|42|54',
          'b|7|28|49|63', 'm|8|32|56|72', 'c|4|20|32|48', 'p|5|30|45|60',
          't|6|36|48|66', 'k|7|35|56|70', 'd|8|40|64|80', 'z|9|27|54|81',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      v1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      v2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      v3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
    },
    answer: (v) => {
      const k = Number(v.k);
      return `${Math.floor(Number(v.v1) / k)}, ${Math.floor(Number(v.v2) / k)}, ${Math.floor(Number(v.v3) / k)}`;
    },
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => {
      const k = Number(vars.k);
      const r1 = Math.floor(Number(vars.v1) / k);
      const r2 = Math.floor(Number(vars.v2) / k);
      const r3 = Math.floor(Number(vars.v3) / k);
      return [
        `${r1 + 1}, ${r2 + 1}, ${r3 + 1}`,
        `${r1 - 1}, ${r2 - 1}, ${r3 - 1}`,
        `${r1}, ${r2 + 1}, ${r3 - 1}`,
      ];
    },
    explanation: ({ vars, answer }) => {
      const k = Number(vars.k);
      const r1 = Math.floor(Number(vars.v1) / k);
      const r2 = Math.floor(Number(vars.v2) / k);
      const r3 = Math.floor(Number(vars.v3) / k);
      return `${vars.v1} ÷ ${k} = ${r1}; ${vars.v2} ÷ ${k} = ${r2}; ${vars.v3} ÷ ${k} = ${r3}. სწორი თანმიმდევრობაა: ${answer}.`;
    },
  }),

  // Q18 (Level 3): იპოვე 5m - 10-ის მნიშვნელობა, თუ m = 3, m = 6 და m = 10.
  defineTemplate({
    ...addr({ id: 'g4-u05-18', subtopicId: 'u05-evaluate-multiple-values', difficulty: 3 }),
    prompt: 'იპოვე {k}{var} - {c}-ის მნიშვნელობა, თუ {var} = {v1}, {var} = {v2} და {var} = {v3}. რომელია მიღებული მნიშვნელობების სწორი თანმიმდევრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'm|5|10|3|6|10', 'n|4|8|4|7|11', 'x|3|6|5|8|12', 'y|6|12|3|5|8',
          'a|2|4|6|9|15', 'b|5|15|4|7|10', 'c|4|12|5|8|12', 'p|3|5|6|10|14',
          't|6|10|3|6|9', 'k|2|3|5|8|12', 'd|4|6|4|8|11', 'z|5|8|3|6|9',
        ],
      },
      var: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      v1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      v2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
      v3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[5])] },
    },
    answer: (v) => {
      const k = Number(v.k);
      const c = Number(v.c);
      return `${k * Number(v.v1) - c}, ${k * Number(v.v2) - c}, ${k * Number(v.v3) - c}`;
    },
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => {
      const k = Number(vars.k);
      const c = Number(vars.c);
      const r1 = k * Number(vars.v1) - c;
      const r2 = k * Number(vars.v2) - c;
      const r3 = k * Number(vars.v3) - c;
      return [
        `${r1 + 1}, ${r2 + 1}, ${r3 + 1}`,
        `${r1 - 1}, ${r2 - 1}, ${r3 - 1}`,
        `${r1}, ${r2 + 2}, ${r3 - 2}`,
      ];
    },
    explanation: ({ vars, answer }) => {
      const k = Number(vars.k);
      const c = Number(vars.c);
      const r1 = k * Number(vars.v1) - c;
      const r2 = k * Number(vars.v2) - c;
      const r3 = k * Number(vars.v3) - c;
      return `${k} × ${vars.v1} - ${c} = ${r1}; ${k} × ${vars.v2} - ${c} = ${r2}; ${k} × ${vars.v3} - ${c} = ${r3}. სწორი თანმიმდევრობაა: ${answer}.`;
    },
  }),
];
