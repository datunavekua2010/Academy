import type { QuestionTemplate, DifficultyLevel } from './types';
import { defineTemplate } from './types';
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

export const G4_U04_SUBTOPICS = [
  'u04-find-dividend',
  'u04-find-divisor',
  'u04-divide-up-to-12',
  'u04-long-division-remainder',
  'u04-quotient-and-remainder',
  'u04-divide-ending-zeros-single',
  'u04-divide-ending-zeros',
  'u04-division-principles',
  'u04-divide-by-two-digit',
  'u04-estimate-quotient',
  'u04-obtain-numbers-division',
] as const;

export type G4U04SubtopicId = (typeof G4_U04_SUBTOPICS)[number];

const addr = (spec: { id: string; subtopicId: G4U04SubtopicId; difficulty: DifficultyLevel }) => ({
  grade: 4 as const,
  topicId: 'g4-gayofa' as const,
  unitId: 'g4-gayofa' as const,
  subtopicId: spec.subtopicId,
  id: spec.id,
  difficulty: spec.difficulty,
});

export const G4_U04_TEMPLATES: QuestionTemplate[] = [
  // ==================================================================
  // U04.1 — გასაყოფის პოვნა (u04-find-dividend)
  // ==================================================================

  // Q01 (Level 1): □ ÷ B = C (1-digit)
  defineTemplate({
    ...addr({ id: 'g4-u04-01', subtopicId: 'u04-find-dividend', difficulty: 1 }),
    prompt: 'იპოვე უცნობი გასაყოფი: □ ÷ {b} = {c}',
    variables: {
      b: { kind: 'choice', values: [6, 7, 8, 9, 5, 4, 8, 7, 6, 9, 8, 7] },
      c: { kind: 'choice', values: [8, 9, 7, 6, 8, 9, 6, 8, 7, 7, 9, 8] },
    },
    answer: (v) => Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `უცნობი გასაყოფის საპოვნელად გამყოფი უნდა გავამრავლოთ განაყოფზე: ${vars.b} × ${vars.c} = ${answer}.`,
  }),

  // Q02 (Level 1): □ ÷ B = C (C <= 12)
  defineTemplate({
    ...addr({ id: 'g4-u04-02', subtopicId: 'u04-find-dividend', difficulty: 1 }),
    prompt: 'იპოვე უცნობი გასაყოფი: □ ÷ {b} = {c}',
    variables: {
      b: { kind: 'choice', values: [9, 8, 7, 6, 12, 11, 8, 9, 7, 6, 11, 12] },
      c: { kind: 'choice', values: [12, 11, 12, 11, 8, 9, 11, 12, 10, 12, 7, 8] },
    },
    answer: (v) => Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `გასაყოფი = გამყოფი × განაყოფი: ${vars.b} × ${vars.c} = ${answer}.`,
  }),

  // Q03 (Level 2): □ ÷ B = C (C = 13..25)
  defineTemplate({
    ...addr({ id: 'g4-u04-03', subtopicId: 'u04-find-dividend', difficulty: 2 }),
    prompt: 'შეავსე ტოლობა: □ ÷ {b} = {c}',
    variables: {
      b: { kind: 'choice', values: [7, 6, 8, 5, 9, 4, 7, 6, 8, 5, 9, 4] },
      c: { kind: 'choice', values: [15, 14, 16, 18, 13, 22, 25, 17, 19, 21, 24, 20] },
    },
    answer: (v) => Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.b} × ${vars.c} = ${answer}.`,
  }),

  // Q04 (Level 2): □ ÷ 25 = C
  defineTemplate({
    ...addr({ id: 'g4-u04-04', subtopicId: 'u04-find-dividend', difficulty: 2 }),
    prompt: 'იპოვე უცნობი რიცხვი: □ ÷ {b} = {c}',
    variables: {
      b: { kind: 'choice', values: [25, 20, 50, 25, 20, 50, 25, 20, 50, 25, 20, 50] },
      c: { kind: 'choice', values: [20, 30, 12, 16, 25, 14, 18, 35, 15, 24, 40, 18] },
    },
    answer: (v) => Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 25, 10),
    explanation: ({ vars, answer }) => `${vars.b} × ${vars.c} = ${answer}.`,
  }),

  // Q05 (Level 3): □ ÷ B = C (მრგვალი ათეულები)
  defineTemplate({
    ...addr({ id: 'g4-u04-05', subtopicId: 'u04-find-dividend', difficulty: 3 }),
    prompt: 'შეავსე ტოლობა: □ ÷ {b} = {c}',
    variables: {
      b: { kind: 'choice', values: [40, 30, 50, 60, 20, 70, 80, 40, 30, 50, 60, 20] },
      c: { kind: 'choice', values: [30, 40, 20, 30, 50, 20, 30, 60, 50, 40, 20, 70] },
    },
    answer: (v) => Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.b} × ${vars.c} = ${answer}.`,
  }),

  // Q06 (Level 3): □ ÷ 125 = C
  defineTemplate({
    ...addr({ id: 'g4-u04-06', subtopicId: 'u04-find-dividend', difficulty: 3 }),
    prompt: 'იპოვე უცნობი გასაყოფი: □ ÷ {b} = {c}',
    variables: {
      b: { kind: 'choice', values: [125, 125, 125, 125, 250, 125, 250, 125, 250, 125, 125, 250] },
      c: { kind: 'choice', values: [8, 16, 4, 12, 4, 24, 8, 32, 6, 20, 28, 12] },
    },
    answer: (v) => Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 250, 100),
    explanation: ({ vars, answer }) => `${vars.b} × ${vars.c} = ${answer}.`,
  }),

  // ==================================================================
  // U04.2 — გამყოფის პოვნა (u04-find-divisor)
  // ==================================================================

  // Q07 (Level 1): A ÷ □ = C (ტაბულური)
  defineTemplate({
    ...addr({ id: 'g4-u04-07', subtopicId: 'u04-find-divisor', difficulty: 1 }),
    prompt: 'იპოვე უცნობი გამყოფი: {a} ÷ □ = {c}',
    variables: {
      c: { kind: 'choice', values: [6, 7, 8, 9, 6, 7, 8, 9, 5, 8, 7, 6] },
      ans: { kind: 'choice', values: [8, 9, 7, 6, 7, 8, 9, 8, 9, 6, 7, 9] },
      a: { kind: 'choice', values: (v) => [Number(v.c) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `უცნობი გამყოფის საპოვნელად გასაყოფი უნდა გავყოთ განაყოფზე: ${vars.a} ÷ ${vars.c} = ${answer}.`,
  }),

  // Q08 (Level 1): A ÷ □ = C (C <= 12)
  defineTemplate({
    ...addr({ id: 'g4-u04-08', subtopicId: 'u04-find-divisor', difficulty: 1 }),
    prompt: 'იპოვე უცნობი გამყოფი: {a} ÷ □ = {c}',
    variables: {
      c: { kind: 'choice', values: [12, 11, 12, 11, 9, 8, 12, 11, 10, 12, 8, 9] },
      ans: { kind: 'choice', values: [9, 8, 7, 9, 12, 11, 8, 12, 11, 6, 12, 8] },
      a: { kind: 'choice', values: (v) => [Number(v.c) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.c} = ${answer}.`,
  }),

  // Q09 (Level 2): შეავსე ტოლობა: A ÷ □ = C
  defineTemplate({
    ...addr({ id: 'g4-u04-09', subtopicId: 'u04-find-divisor', difficulty: 2 }),
    prompt: 'შეავსე ტოლობა: {a} ÷ □ = {c}',
    variables: {
      c: { kind: 'choice', values: [9, 8, 7, 6, 8, 9, 7, 6, 8, 9, 7, 6] },
      ans: { kind: 'choice', values: [16, 18, 15, 24, 14, 15, 22, 18, 12, 14, 16, 25] },
      a: { kind: 'choice', values: (v) => [Number(v.c) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.c} = ${answer}.`,
  }),

  // Q10 (Level 2): A ÷ □ = 10
  defineTemplate({
    ...addr({ id: 'g4-u04-10', subtopicId: 'u04-find-divisor', difficulty: 2 }),
    prompt: 'იპოვე უცნობი რიცხვი: {a} ÷ □ = 10',
    variables: {
      ans: { kind: 'choice', values: [25, 34, 48, 52, 65, 78, 85, 92, 18, 27, 36, 45] },
      a: { kind: 'choice', values: (v) => [Number(v.ans) * 10] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ 10 = ${answer}.`,
  }),

  // Q11 (Level 3): შეავსე ტოლობა: A ÷ □ = C (3-ნიშნა)
  defineTemplate({
    ...addr({ id: 'g4-u04-11', subtopicId: 'u04-find-divisor', difficulty: 3 }),
    prompt: 'შეავსე ტოლობა: {a} ÷ □ = {c}',
    variables: {
      c: { kind: 'choice', values: [12, 15, 14, 16, 18, 20, 24, 25, 11, 13, 15, 12] },
      ans: { kind: 'choice', values: [30, 25, 40, 20, 30, 25, 20, 40, 30, 20, 35, 45] },
      a: { kind: 'choice', values: (v) => [Number(v.c) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.c} = ${answer}.`,
  }),

  // Q12 (Level 3): 1000 ÷ □ = C
  defineTemplate({
    ...addr({ id: 'g4-u04-12', subtopicId: 'u04-find-divisor', difficulty: 3 }),
    prompt: 'იპოვე უცნობი გამყოფი: {a} ÷ □ = {c}',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '1000|25|40', '1000|40|25', '1000|50|20', '1000|20|50',
          '1000|8|125', '1000|125|8', '1000|10|100', '1000|100|10',
          '2000|25|80', '2000|50|40', '2000|40|50', '2000|20|100',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.c} = ${answer}.`,
  }),

  // ==================================================================
  // U04.3 — გაყოფა 12-მდე რიცხვებზე (u04-divide-up-to-12)
  // ==================================================================

  // Q13 (Level 1): A ÷ B (ერთნიშნა)
  defineTemplate({
    ...addr({ id: 'g4-u04-13', subtopicId: 'u04-divide-up-to-12', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [7, 6, 8, 9, 7, 8, 6, 9, 8, 7, 9, 6] },
      ans: { kind: 'choice', values: [8, 9, 7, 6, 9, 8, 8, 7, 6, 8, 8, 7] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q14 (Level 1): A ÷ 12
  defineTemplate({
    ...addr({ id: 'g4-u04-14', subtopicId: 'u04-divide-up-to-12', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} ÷ 12.',
    variables: {
      ans: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
      a: { kind: 'choice', values: (v) => [Number(v.ans) * 12] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ 12 = ${answer}.`,
  }),

  // Q15 (Level 2): A ÷ 9
  defineTemplate({
    ...addr({ id: 'g4-u04-15', subtopicId: 'u04-divide-up-to-12', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} ÷ 9.',
    variables: {
      ans: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
      a: { kind: 'choice', values: (v) => [Number(v.ans) * 9] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ 9 = ${answer}.`,
  }),

  // Q16 (Level 2): A ÷ 8
  defineTemplate({
    ...addr({ id: 'g4-u04-16', subtopicId: 'u04-divide-up-to-12', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} ÷ 8.',
    variables: {
      ans: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
      a: { kind: 'choice', values: (v) => [Number(v.ans) * 8] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ 8 = ${answer}.`,
  }),

  // Q17 (Level 3): A ÷ 11
  defineTemplate({
    ...addr({ id: 'g4-u04-17', subtopicId: 'u04-divide-up-to-12', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} ÷ 11.',
    variables: {
      ans: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
      a: { kind: 'choice', values: (v) => [Number(v.ans) * 11] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ 11 = ${answer}.`,
  }),

  // Q18 (Level 3): A ÷ 12 (რთული)
  defineTemplate({
    ...addr({ id: 'g4-u04-18', subtopicId: 'u04-divide-up-to-12', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} ÷ 12.',
    variables: {
      ans: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
      a: { kind: 'choice', values: (v) => [Number(v.ans) * 12] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ 12 = ${answer}.`,
  }),
  // ==================================================================
  // U04.4 — დიდი რიცხვების ერთნიშნა რიცხვზე გაყოფა და ნაშთი (u04-long-division-remainder)
  // ==================================================================

  // Q19 (Level 1): 3-ნიშნა ÷ 1-ნიშნა (უნაშთო)
  defineTemplate({
    ...addr({ id: 'g4-u04-19', subtopicId: 'u04-long-division-remainder', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [4, 3, 5, 6, 4, 3, 5, 6, 4, 3, 5, 6] },
      ans: { kind: 'choice', values: [216, 248, 135, 142, 172, 284, 165, 153, 234, 182, 145, 164] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q20 (Level 1): 4-ნიშნა ÷ 1-ნიშნა (უნაშთო)
  defineTemplate({
    ...addr({ id: 'g4-u04-20', subtopicId: 'u04-long-division-remainder', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [6, 4, 5, 7, 3, 8, 6, 4, 5, 7, 3, 8] },
      ans: { kind: 'choice', values: [208, 312, 245, 184, 421, 162, 235, 324, 218, 175, 412, 153] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q21 (Level 2): გაყავი ნაშთით (3-ნიშნა)
  defineTemplate({
    ...addr({ id: 'g4-u04-21', subtopicId: 'u04-long-division-remainder', difficulty: 2 }),
    prompt: 'გაყავი ნაშთით: {a} ÷ {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '725|4|181|1', '835|4|208|3', '627|5|125|2', '743|6|123|5',
          '854|7|122|0', '934|8|116|6', '652|3|217|1', '785|6|130|5',
          '843|5|168|3', '926|4|231|2', '617|4|154|1', '759|7|108|3',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      q: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      r: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `${v.q} (ნაშთი ${v.r})`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const q = Number(vars.q);
      const r = Number(vars.r);
      return [
        `${q} (ნაშთი ${r + 1})`,
        `${q + 1} (ნაშთი ${r})`,
        `${q - 1} (ნაშთი ${r})`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}. რადგან ${vars.b} × ${vars.q} + ${vars.r} = ${vars.a}.`,
  }),

  // Q22 (Level 2): გაყავი ნაშთით (3-ნიშნა)
  defineTemplate({
    ...addr({ id: 'g4-u04-22', subtopicId: 'u04-long-division-remainder', difficulty: 2 }),
    prompt: 'გაყავი ნაშთით: {a} ÷ {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '953|7|136|1', '874|6|145|4', '769|5|153|4', '685|4|171|1',
          '914|8|114|2', '823|7|117|4', '749|6|124|5', '658|5|131|3',
          '937|9|104|1', '852|8|106|4', '773|7|110|3', '694|6|115|4',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      q: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      r: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `${v.q} (ნაშთი ${v.r})`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const q = Number(vars.q);
      const r = Number(vars.r);
      return [
        `${q} (ნაშთი ${r + 1})`,
        `${q + 1} (ნაშთი ${r})`,
        `${q - 1} (ნაშთი ${r + 1})`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q23 (Level 3): 4-ნიშნა ÷ 1-ნიშნა (უნაშთო)
  defineTemplate({
    ...addr({ id: 'g4-u04-23', subtopicId: 'u04-long-division-remainder', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [3, 4, 6, 7, 8, 9, 3, 4, 6, 7, 8, 9] },
      ans: { kind: 'choice', values: [812, 624, 415, 342, 284, 218, 735, 528, 432, 318, 265, 234] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q24 (Level 3): გაყავი ნაშთით (4-ნიშნა)
  defineTemplate({
    ...addr({ id: 'g4-u04-24', subtopicId: 'u04-long-division-remainder', difficulty: 3 }),
    prompt: 'გაყავი ნაშთით: {a} ÷ {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '1007|9|111|8', '1205|8|150|5', '1406|7|200|6', '1508|6|251|2',
          '1609|5|321|4', '1705|4|426|1', '1807|9|200|7', '1906|8|238|2',
          '2011|7|287|2', '2115|6|352|3', '2218|5|443|3', '2314|4|578|2',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      q: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      r: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `${v.q} (ნაშთი ${v.r})`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const q = Number(vars.q);
      const r = Number(vars.r);
      return [
        `${q} (ნაშთი ${r - 1 > 0 ? r - 1 : r + 1})`,
        `${q + 1} (ნაშთი ${r})`,
        `${q - 1} (ნაშთი ${r})`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // ==================================================================
  // U04.5 — განაყოფისა და ნაშთის გამოთვლა (u04-quotient-and-remainder)
  // ==================================================================

  // Q25 (Level 1): 29 ÷ 4
  defineTemplate({
    ...addr({ id: 'g4-u04-25', subtopicId: 'u04-quotient-and-remainder', difficulty: 1 }),
    prompt: 'გაყავი ნაშთით და მიუთითე განაყოფი და ნაშთი: {a} ÷ {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '29|4|7|1', '34|5|6|4', '27|4|6|3', '38|5|7|3',
          '23|3|7|2', '31|4|7|3', '19|3|6|1', '26|4|6|2',
          '33|5|6|3', '22|4|5|2', '17|3|5|2', '39|4|9|3',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      q: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      r: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `განაყოფი ${v.q}, ნაშთი ${v.r}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const q = Number(vars.q);
      const r = Number(vars.r);
      return [
        `განაყოფი ${q}, ნაშთი ${r + 1}`,
        `განაყოფი ${q + 1}, ნაშთი ${r}`,
        `განაყოფი ${q - 1}, ნაშთი ${r + 1}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.a} = ${vars.b} × ${vars.q} + ${vars.r}, ამიტომ ${answer}.`,
  }),

  // Q26 (Level 1): 47 ÷ 6
  defineTemplate({
    ...addr({ id: 'g4-u04-26', subtopicId: 'u04-quotient-and-remainder', difficulty: 1 }),
    prompt: 'გაყავი ნაშთით და მიუთითე განაყოფი და ნაშთი: {a} ÷ {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '47|6|7|5', '53|6|8|5', '44|7|6|2', '58|7|8|2',
          '46|8|5|6', '54|7|7|5', '43|6|7|1', '59|8|7|3',
          '39|6|6|3', '51|7|7|2', '37|6|6|1', '52|8|6|4',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      q: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      r: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `განაყოფი ${v.q}, ნაშთი ${v.r}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const q = Number(vars.q);
      const r = Number(vars.r);
      return [
        `განაყოფი ${q}, ნაშთი ${r - 1 > 0 ? r - 1 : r + 1}`,
        `განაყოფი ${q + 1}, ნაშთი ${r}`,
        `განაყოფი ${q - 1}, ნაშთი ${r}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.a} = ${vars.b} × ${vars.q} + ${vars.r}, ამიტომ ${answer}.`,
  }),

  // Q27 (Level 2): 83 ÷ 9
  defineTemplate({
    ...addr({ id: 'g4-u04-27', subtopicId: 'u04-quotient-and-remainder', difficulty: 2 }),
    prompt: 'გაყავი ნაშთით და მიუთითე განაყოფი და ნაშთი: {a} ÷ {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '83|9|9|2', '76|8|9|4', '85|9|9|4', '69|8|8|5',
          '88|9|9|7', '75|8|9|3', '79|9|8|7', '68|7|9|5',
          '82|9|9|1', '67|8|8|3', '86|9|9|5', '74|8|9|2',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      q: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      r: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `განაყოფი ${v.q}, ნაშთი ${v.r}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const q = Number(vars.q);
      const r = Number(vars.r);
      return [
        `განაყოფი ${q}, ნაშთი ${r + 1}`,
        `განაყოფი ${q + 1}, ნაშთი ${r}`,
        `განაყოფი ${q - 1}, ნაშთი ${r}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.a} = ${vars.b} × ${vars.q} + ${vars.r}, ამიტომ ${answer}.`,
  }),

  // Q28 (Level 2): 125 ÷ 8
  defineTemplate({
    ...addr({ id: 'g4-u04-28', subtopicId: 'u04-quotient-and-remainder', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} ÷ {b}. მიუთითე განაყოფი და ნაშთი.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '125|8|15|5', '134|9|14|8', '142|7|20|2', '156|8|19|4',
          '165|9|18|3', '178|7|25|3', '186|8|23|2', '195|9|21|6',
          '118|7|16|6', '129|8|16|1', '148|9|16|4', '159|7|22|5',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      q: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      r: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `განაყოფი ${v.q}, ნაშთი ${v.r}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const q = Number(vars.q);
      const r = Number(vars.r);
      return [
        `განაყოფი ${q}, ნაშთი ${r + 1}`,
        `განაყოფი ${q + 1}, ნაშთი ${r}`,
        `განაყოფი ${q - 1}, ნაშთი ${r}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.a} = ${vars.b} × ${vars.q} + ${vars.r}, ამიტომ ${answer}.`,
  }),

  // Q29 (Level 3): 246 ÷ 7
  defineTemplate({
    ...addr({ id: 'g4-u04-29', subtopicId: 'u04-quotient-and-remainder', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} ÷ {b}. მიუთითე განაყოფი და ნაშთი.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '246|7|35|1', '258|8|32|2', '275|9|30|5', '284|6|47|2',
          '315|8|39|3', '328|7|46|6', '345|9|38|3', '362|8|45|2',
          '239|7|34|1', '267|8|33|3', '298|9|33|1', '356|7|50|6',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      q: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      r: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => `განაყოფი ${v.q}, ნაშთი ${v.r}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const q = Number(vars.q);
      const r = Number(vars.r);
      return [
        `განაყოფი ${q}, ნაშთი ${r + 1}`,
        `განაყოფი ${q + 1}, ნაშთი ${r}`,
        `განაყოფი ${q - 1}, ნაშთი ${r}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.a} = ${vars.b} × ${vars.q} + ${vars.r}, ამიტომ ${answer}.`,
  }),

  // Q30 (Level 3): 389 ÷ 12
  defineTemplate({
    ...addr({ id: 'g4-u04-30', subtopicId: 'u04-quotient-and-remainder', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} ÷ 12. მიუთითე განაყოფი და ნაშთი.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '389|32|5', '415|34|7', '438|36|6', '452|37|8',
          '465|38|9', '490|40|10', '512|42|8', '525|43|9',
          '375|31|3', '398|33|2', '427|35|7', '483|40|3',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      q: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      r: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => `განაყოფი ${v.q}, ნაშთი ${v.r}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const q = Number(vars.q);
      const r = Number(vars.r);
      return [
        `განაყოფი ${q}, ნაშთი ${r + 1}`,
        `განაყოფი ${q + 1}, ნაშთი ${r}`,
        `განაყოფი ${q - 1}, ნაშთი ${r}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.a} = 12 × ${vars.q} + ${vars.r}, ამიტომ ${answer}.`,
  }),
  // ==================================================================
  // U04.6 — ნულებით დამთავრებული რიცხვების ერთნიშნა რიცხვზე გაყოფა (u04-divide-ending-zeros-single)
  // ==================================================================

  // Q31 (Level 1): 80 ÷ 4
  defineTemplate({
    ...addr({ id: 'g4-u04-31', subtopicId: 'u04-divide-ending-zeros-single', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [4, 3, 2, 5, 4, 3, 2, 5, 3, 4, 2, 5] },
      ans: { kind: 'choice', values: [20, 30, 40, 20, 30, 40, 50, 30, 20, 40, 30, 40] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q32 (Level 1): 600 ÷ 3
  defineTemplate({
    ...addr({ id: 'g4-u04-32', subtopicId: 'u04-divide-ending-zeros-single', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [3, 2, 4, 5, 3, 2, 4, 5, 3, 2, 4, 5] },
      ans: { kind: 'choice', values: [200, 300, 200, 100, 300, 400, 300, 200, 400, 500, 100, 300] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 10),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q33 (Level 2): 720 ÷ 8
  defineTemplate({
    ...addr({ id: 'g4-u04-33', subtopicId: 'u04-divide-ending-zeros-single', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [8, 9, 7, 6, 8, 9, 7, 6, 8, 9, 7, 6] },
      ans: { kind: 'choice', values: [90, 80, 90, 70, 80, 90, 80, 90, 70, 60, 90, 80] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q34 (Level 2): 4500 ÷ 9
  defineTemplate({
    ...addr({ id: 'g4-u04-34', subtopicId: 'u04-divide-ending-zeros-single', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [9, 8, 7, 6, 9, 8, 7, 6, 9, 8, 7, 6] },
      ans: { kind: 'choice', values: [500, 600, 700, 800, 400, 500, 600, 700, 300, 400, 500, 600] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q35 (Level 3): 3600 ÷ 6
  defineTemplate({
    ...addr({ id: 'g4-u04-35', subtopicId: 'u04-divide-ending-zeros-single', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [6, 7, 8, 9, 6, 7, 8, 9, 6, 7, 8, 9] },
      ans: { kind: 'choice', values: [600, 700, 800, 900, 500, 600, 700, 800, 400, 500, 600, 700] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q36 (Level 3): 8400 ÷ 7
  defineTemplate({
    ...addr({ id: 'g4-u04-36', subtopicId: 'u04-divide-ending-zeros-single', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [7, 6, 8, 9, 7, 6, 8, 9, 7, 6, 8, 9] },
      ans: { kind: 'choice', values: [1200, 1100, 1200, 1100, 1300, 1400, 1300, 1200, 1400, 1300, 1100, 1200] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // ==================================================================
  // U04.7 — ნულებით დამთავრებული რიცხვების გაყოფა (u04-divide-ending-zeros)
  // ==================================================================

  // Q37 (Level 1): 600 ÷ 20
  defineTemplate({
    ...addr({ id: 'g4-u04-37', subtopicId: 'u04-divide-ending-zeros', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [20, 30, 40, 50, 20, 30, 40, 50, 20, 30, 40, 50] },
      ans: { kind: 'choice', values: [30, 20, 25, 12, 35, 15, 20, 14, 40, 25, 30, 18] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q38 (Level 1): 900 ÷ 30
  defineTemplate({
    ...addr({ id: 'g4-u04-38', subtopicId: 'u04-divide-ending-zeros', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [30, 40, 50, 60, 30, 40, 50, 60, 30, 40, 50, 60] },
      ans: { kind: 'choice', values: [30, 20, 18, 15, 25, 30, 16, 12, 35, 25, 20, 14] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q39 (Level 2): 2400 ÷ 40
  defineTemplate({
    ...addr({ id: 'g4-u04-39', subtopicId: 'u04-divide-ending-zeros', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [40, 50, 60, 70, 80, 90, 40, 50, 60, 70, 80, 90] },
      ans: { kind: 'choice', values: [60, 50, 40, 30, 40, 50, 70, 60, 50, 40, 30, 40] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q40 (Level 2): 3600 ÷ 60
  defineTemplate({
    ...addr({ id: 'g4-u04-40', subtopicId: 'u04-divide-ending-zeros', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [60, 70, 80, 90, 50, 40, 60, 70, 80, 90, 50, 40] },
      ans: { kind: 'choice', values: [60, 70, 80, 90, 80, 70, 50, 60, 70, 80, 90, 60] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q41 (Level 3): 12000 ÷ 300
  defineTemplate({
    ...addr({ id: 'g4-u04-41', subtopicId: 'u04-divide-ending-zeros', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [300, 400, 500, 600, 200, 700, 800, 300, 400, 500, 600, 200] },
      ans: { kind: 'choice', values: [40, 30, 24, 20, 50, 20, 30, 50, 40, 30, 25, 60] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q42 (Level 3): 24000 ÷ 800
  defineTemplate({
    ...addr({ id: 'g4-u04-42', subtopicId: 'u04-divide-ending-zeros', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [800, 700, 600, 500, 900, 400, 800, 700, 600, 500, 900, 400] },
      ans: { kind: 'choice', values: [30, 40, 50, 60, 20, 70, 40, 30, 40, 50, 30, 60] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // ==================================================================
  // U04.8 — რიცხვების გაყოფის პრინციპები (u04-division-principles)
  // ==================================================================

  // Q43 (Level 1): 240 ÷ 6
  defineTemplate({
    ...addr({ id: 'g4-u04-43', subtopicId: 'u04-division-principles', difficulty: 1 }),
    prompt: 'გამოიყენე გაყოფის თვისება და გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [6, 7, 8, 9, 5, 4, 6, 7, 8, 9, 5, 4] },
      ans: { kind: 'choice', values: [40, 30, 50, 40, 60, 50, 30, 40, 60, 50, 40, 60] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = (${Number(vars.a) / 10} ÷ ${vars.b}) × 10 = ${answer}.`,
  }),

  // Q44 (Level 1): 480 ÷ 12
  defineTemplate({
    ...addr({ id: 'g4-u04-44', subtopicId: 'u04-division-principles', difficulty: 1 }),
    prompt: 'გამოთვალე მოხერხებულად: {a} ÷ 12.',
    variables: {
      ans: { kind: 'choice', values: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120] },
      a: { kind: 'choice', values: (v) => [Number(v.ans) * 12] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ 12 = (${Number(vars.a) / 10} ÷ 12) × 10 = ${answer}.`,
  }),

  // Q45 (Level 2): ორივე რიცხვი გაყავი 10-ზე: 700 ÷ 20
  defineTemplate({
    ...addr({ id: 'g4-u04-45', subtopicId: 'u04-division-principles', difficulty: 2 }),
    prompt: 'ორივე რიცხვი გაყავი 10-ზე და გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [20, 30, 40, 50, 20, 30, 40, 50, 20, 30, 40, 50] },
      ans: { kind: 'choice', values: [35, 25, 15, 14, 45, 18, 24, 16, 28, 32, 22, 18] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${Number(vars.a) / 10} ÷ ${Number(vars.b) / 10} = ${answer}.`,
  }),

  // Q46 (Level 2): 1200 ÷ 30
  defineTemplate({
    ...addr({ id: 'g4-u04-46', subtopicId: 'u04-division-principles', difficulty: 2 }),
    prompt: 'გამოთვალე მოხერხებულად: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [30, 40, 50, 60, 30, 40, 50, 60, 20, 70, 80, 90] },
      ans: { kind: 'choice', values: [40, 30, 24, 20, 50, 40, 30, 25, 60, 20, 25, 20] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${Number(vars.a) / 10} ÷ ${Number(vars.b) / 10} = ${answer}.`,
  }),

  // Q47 (Level 3): შეავსე ტოლობა: A0 ÷ B0 = A ÷ □
  defineTemplate({
    ...addr({ id: 'g4-u04-47', subtopicId: 'u04-division-principles', difficulty: 3 }),
    prompt: 'შეავსე ტოლობა: {a0} ÷ {b0} = {a} ÷ □',
    variables: {
      a: { kind: 'choice', values: [36, 48, 54, 72, 84, 96, 64, 42, 56, 63, 81, 75] },
      b: { kind: 'choice', values: [9, 6, 8, 12, 4, 3, 8, 7, 8, 9, 9, 5] },
      a0: { kind: 'choice', values: (v) => [Number(v.a) * 10] },
      b0: { kind: 'choice', values: (v) => [Number(v.b) * 10] },
    },
    answer: (v) => Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ vars }) => {
      const b = Number(vars.b);
      return [b * 10, b + 1, b - 1 > 0 ? b - 1 : b + 2].filter((x) => x !== b);
    },
    explanation: ({ vars, answer }) => `თუ გასაყოფსა და გამყოფს ორივეს 10-ზე გავყოფთ, განაყოფი არ შეიცვლება: ${vars.a0} ÷ ${vars.b0} = ${vars.a} ÷ ${answer}.`,
  }),

  // Q48 (Level 3): შეავსე ტოლობა: A0 ÷ B0 = A ÷ □
  defineTemplate({
    ...addr({ id: 'g4-u04-48', subtopicId: 'u04-division-principles', difficulty: 3 }),
    prompt: 'შეავსე ტოლობა: {a0} ÷ {b0} = {a} ÷ □',
    variables: {
      a: { kind: 'choice', values: [84, 92, 76, 68, 52, 96, 72, 88, 64, 56, 90, 80] },
      b: { kind: 'choice', values: [4, 2, 4, 2, 4, 3, 6, 8, 4, 8, 5, 5] },
      a0: { kind: 'choice', values: (v) => [Number(v.a) * 10] },
      b0: { kind: 'choice', values: (v) => [Number(v.b) * 10] },
    },
    answer: (v) => Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ vars }) => {
      const b = Number(vars.b);
      return [b * 10, b + 1, b - 1 > 0 ? b - 1 : b + 2].filter((x) => x !== b);
    },
    explanation: ({ vars, answer }) => `გასაყოფისა და გამყოფის 10-ზე გაყოფით: ${vars.a0} ÷ ${vars.b0} = ${vars.a} ÷ ${answer}.`,
  }),
  // ==================================================================
  // U04.9 — ორნიშნა რიცხვზე გაყოფა (u04-divide-by-two-digit)
  // ==================================================================

  // Q49 (Level 1): 144 ÷ 12
  defineTemplate({
    ...addr({ id: 'g4-u04-49', subtopicId: 'u04-divide-by-two-digit', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [12, 11, 13, 14, 15, 12, 11, 13, 14, 15, 12, 11] },
      ans: { kind: 'choice', values: [12, 13, 11, 12, 10, 14, 12, 12, 11, 12, 11, 14] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q50 (Level 1): 225 ÷ 15
  defineTemplate({
    ...addr({ id: 'g4-u04-50', subtopicId: 'u04-divide-by-two-digit', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [15, 16, 14, 18, 15, 16, 14, 18, 15, 16, 14, 18] },
      ans: { kind: 'choice', values: [15, 14, 16, 12, 18, 15, 15, 14, 16, 12, 18, 15] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q51 (Level 2): 336 ÷ 16
  defineTemplate({
    ...addr({ id: 'g4-u04-51', subtopicId: 'u04-divide-by-two-digit', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [16, 14, 18, 15, 16, 14, 18, 15, 16, 14, 18, 15] },
      ans: { kind: 'choice', values: [21, 24, 18, 22, 23, 25, 21, 24, 19, 23, 22, 26] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q52 (Level 2): 468 ÷ 18
  defineTemplate({
    ...addr({ id: 'g4-u04-52', subtopicId: 'u04-divide-by-two-digit', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [18, 22, 24, 16, 18, 22, 24, 16, 18, 22, 24, 16] },
      ans: { kind: 'choice', values: [26, 21, 19, 28, 24, 23, 22, 25, 27, 24, 21, 26] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q53 (Level 3): 624 ÷ 24
  defineTemplate({
    ...addr({ id: 'g4-u04-53', subtopicId: 'u04-divide-by-two-digit', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [24, 26, 28, 32, 25, 24, 26, 28, 32, 25, 24, 26] },
      ans: { kind: 'choice', values: [26, 24, 22, 21, 25, 28, 23, 24, 22, 26, 25, 27] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q54 (Level 3): 1152 ÷ 32
  defineTemplate({
    ...addr({ id: 'g4-u04-54', subtopicId: 'u04-divide-by-two-digit', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    variables: {
      b: { kind: 'choice', values: [32, 36, 28, 42, 35, 34, 32, 36, 28, 42, 35, 34] },
      ans: { kind: 'choice', values: [36, 32, 34, 28, 31, 35, 38, 29, 36, 32, 34, 30] },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // ==================================================================
  // U04.10 — მიახლოებითი განაყოფი (u04-estimate-quotient)
  // ==================================================================

  // Q55 (Level 1): დაამრგვალე A უახლოეს ასეულამდე და მიახლოებით გამოთვალე A ÷ 2
  defineTemplate({
    ...addr({ id: 'g4-u04-55', subtopicId: 'u04-estimate-quotient', difficulty: 1 }),
    prompt: 'დაამრგვალე {a} უახლოეს ასეულამდე და მიახლოებით გამოთვალე: {a} ÷ {b}.',
    variables: {
      a: { kind: 'choice', values: [198, 204, 396, 402, 597, 604, 192, 208, 392, 408, 592, 608] },
      b: { kind: 'choice', values: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2] },
    },
    answer: (v) => (Math.round(Number(v.a) / 100) * 100) / Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 50, 10),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 100) * 100;
      return `${vars.a} ≈ ${ra}; ${ra} ÷ ${vars.b} = ${answer}.`;
    },
  }),

  // Q56 (Level 1): დაამრგვალე A უახლოეს ასეულამდე და მიახლოებით გამოთვალე A ÷ 4
  defineTemplate({
    ...addr({ id: 'g4-u04-56', subtopicId: 'u04-estimate-quotient', difficulty: 1 }),
    prompt: 'დაამრგვალე {a} უახლოეს ასეულამდე და მიახლოებით გამოთვალე: {a} ÷ 4.',
    variables: {
      a: { kind: 'choice', values: [403, 398, 804, 796, 1205, 1195, 392, 408, 792, 808, 1192, 1208] },
    },
    answer: (v) => (Math.round(Number(v.a) / 100) * 100) / 4,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 25, 10),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 100) * 100;
      return `${vars.a} ≈ ${ra}; ${ra} ÷ 4 = ${answer}.`;
    },
  }),

  // Q57 (Level 2): დაამრგვალე A უახლოეს ასეულამდე და მიახლოებით გამოთვალე A ÷ 6
  defineTemplate({
    ...addr({ id: 'g4-u04-57', subtopicId: 'u04-estimate-quotient', difficulty: 2 }),
    prompt: 'დაამრგვალე {a} უახლოეს ასეულამდე და მიახლოებით გამოთვალე: {a} ÷ 6.',
    variables: {
      a: { kind: 'choice', values: [598, 604, 1196, 1205, 1795, 1804, 2396, 2405, 592, 608, 1192, 1208] },
    },
    answer: (v) => (Math.round(Number(v.a) / 100) * 100) / 6,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 50, 10),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 100) * 100;
      return `${vars.a} ≈ ${ra}; ${ra} ÷ 6 = ${answer}.`;
    },
  }),

  // Q58 (Level 2): დაამრგვალე A უახლოეს ასეულამდე და მიახლოებით გამოთვალე A ÷ 3
  defineTemplate({
    ...addr({ id: 'g4-u04-58', subtopicId: 'u04-estimate-quotient', difficulty: 2 }),
    prompt: 'დაამრგვალე {a} უახლოეს ასეულამდე და მიახლოებით გამოთვალე: {a} ÷ 3.',
    variables: {
      a: { kind: 'choice', values: [1198, 1204, 896, 905, 598, 604, 1496, 1505, 1192, 1208, 892, 908] },
    },
    answer: (v) => (Math.round(Number(v.a) / 100) * 100) / 3,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 50, 10),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 100) * 100;
      return `${vars.a} ≈ ${ra}; ${ra} ÷ 3 = ${answer}.`;
    },
  }),

  // Q59 (Level 3): ჩაანაცვლე A მრგვალი რიცხვით და მიახლოებით გამოთვალე: A ÷ B
  defineTemplate({
    ...addr({ id: 'g4-u04-59', subtopicId: 'u04-estimate-quotient', difficulty: 3 }),
    prompt: 'მიახლოებით გამოთვალე {a} ÷ {b}, თუ {a}-ს {ra}-ით ჩაანაცვლებ.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '782|800|8', '812|800|8', '695|700|7', '714|700|7',
          '588|600|6', '612|600|6', '492|500|5', '512|500|5',
          '394|400|4', '412|400|4', '885|900|9', '915|900|9',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ra: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => Number(v.ra) / Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.ra} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q60 (Level 3): ჩაანაცვლე 4-ნიშნა A მრგვალი რიცხვით და მიახლოებით გამოთვალე: A ÷ B
  defineTemplate({
    ...addr({ id: 'g4-u04-60', subtopicId: 'u04-estimate-quotient', difficulty: 3 }),
    prompt: 'მიახლოებით გამოთვალე {a} ÷ {b}, თუ {a}-ს {ra}-ით ჩაანაცვლებ.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '2410|2400|6', '2392|2400|6', '3195|3200|8', '3212|3200|8',
          '3490|3500|7', '3514|3500|7', '4185|4200|6', '4218|4200|6',
          '4788|4800|8', '4812|4800|8', '5385|5400|9', '5415|5400|9',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ra: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => Number(v.ra) / Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 50, 10),
    explanation: ({ vars, answer }) => `${vars.ra} ÷ ${vars.b} = ${answer}.`,
  }),

  // ==================================================================
  // U04.11 — რიცხვების მიღება გაყოფის საშუალებით (u04-obtain-numbers-division)
  // ==================================================================

  // Q61 (Level 1): რომელ რიცხვზე უნდა გავყოთ A, რომ მივიღოთ C?
  defineTemplate({
    ...addr({ id: 'g4-u04-61', subtopicId: 'u04-obtain-numbers-division', difficulty: 1 }),
    prompt: 'რომელ რიცხვზე უნდა გავყოთ {a}, რომ მივიღოთ {c}?',
    variables: {
      c: { kind: 'choice', values: [8, 9, 7, 6, 8, 9, 7, 6, 8, 9, 7, 6] },
      ans: { kind: 'choice', values: [9, 8, 7, 9, 6, 7, 8, 8, 7, 6, 9, 7] },
      a: { kind: 'choice', values: (v) => [Number(v.c) * Number(v.ans)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.c} = ${answer}.`,
  }),

  // Q62 (Level 1): რომელი რიცხვი უნდა გავყოთ B-ზე, რომ მივიღოთ C?
  defineTemplate({
    ...addr({ id: 'g4-u04-62', subtopicId: 'u04-obtain-numbers-division', difficulty: 1 }),
    prompt: 'რომელი რიცხვი უნდა გავყოთ {b}-ზე, რომ მივიღოთ {c}?',
    variables: {
      b: { kind: 'choice', values: [9, 8, 7, 6, 5, 4, 9, 8, 7, 6, 5, 4] },
      c: { kind: 'choice', values: [15, 12, 14, 16, 18, 20, 11, 13, 15, 14, 12, 16] },
    },
    answer: (v) => Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.b} × ${vars.c} = ${answer}.`,
  }),

  // Q63 (Level 2): იპოვე რიცხვი, რომლის B-ზე გაყოფით მიიღება C
  defineTemplate({
    ...addr({ id: 'g4-u04-63', subtopicId: 'u04-obtain-numbers-division', difficulty: 2 }),
    prompt: 'იპოვე რიცხვი, რომლის {b}-ზე გაყოფით მიიღება {c}.',
    variables: {
      b: { kind: 'choice', values: [6, 7, 8, 9, 5, 4, 6, 7, 8, 9, 5, 4] },
      c: { kind: 'choice', values: [24, 25, 22, 28, 32, 35, 18, 26, 34, 19, 27, 36] },
    },
    answer: (v) => Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.b} × ${vars.c} = ${answer}.`,
  }),

  // Q64 (Level 2): რომელი რიცხვის 12-ზე გაყოფით მივიღებთ C-ს?
  defineTemplate({
    ...addr({ id: 'g4-u04-64', subtopicId: 'u04-obtain-numbers-division', difficulty: 2 }),
    prompt: 'რომელი რიცხვის {b}-ზე გაყოფით მივიღებთ {c}-ს?',
    variables: {
      b: { kind: 'choice', values: [12, 11, 14, 15, 16, 12, 11, 14, 15, 16, 12, 11] },
      c: { kind: 'choice', values: [35, 25, 20, 30, 15, 40, 32, 28, 24, 18, 22, 34] },
    },
    answer: (v) => Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.b} × ${vars.c} = ${answer}.`,
  }),

  // Q65 (Level 3): იპოვე რიცხვი, რომლის 25-ზე გაყოფით მიიღება C
  defineTemplate({
    ...addr({ id: 'g4-u04-65', subtopicId: 'u04-obtain-numbers-division', difficulty: 3 }),
    prompt: 'იპოვე რიცხვი, რომლის {b}-ზე გაყოფით მიიღება {c}.',
    variables: {
      b: { kind: 'choice', values: [25, 20, 50, 40, 25, 20, 50, 40, 25, 20, 50, 40] },
      c: { kind: 'choice', values: [40, 35, 24, 30, 28, 45, 18, 25, 32, 55, 16, 36] },
    },
    answer: (v) => Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.b} × ${vars.c} = ${answer}.`,
  }),

  // Q66 (Level 3): რა რიცხვი უნდა გავყოთ B-ზე, რომ მივიღოთ C?
  defineTemplate({
    ...addr({ id: 'g4-u04-66', subtopicId: 'u04-obtain-numbers-division', difficulty: 3 }),
    prompt: 'რა რიცხვი უნდა გავყოთ {b}-ზე, რომ მივიღოთ {c}?',
    variables: {
      b: { kind: 'choice', values: [16, 18, 14, 15, 22, 24, 12, 25, 20, 16, 18, 14] },
      c: { kind: 'choice', values: [75, 65, 85, 45, 55, 35, 95, 40, 60, 50, 70, 80] },
    },
    answer: (v) => Number(v.b) * Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.b} × ${vars.c} = ${answer}.`,
  }),
];
