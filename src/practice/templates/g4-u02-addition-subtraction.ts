/**
 * Grade 4 — U02: შეკრება და გამოკლება (Addition and Subtraction).
 *
 * Full curriculum implementation for Grade 4 Unit 2 from Google Drive document U02
 * (folder "WEBSITE GRADE 4"):
 * 60 templates (Q01–Q60) across 10 subtopics with complete Level 1, 2, and 3 coverage (6 questions per subtopic):
 *
 *   U02.1  u02-unknown-number          (უცნობი რიცხვის პოვნა, Q01–Q06)
 *   U02.2  u02-addition-million        (შეკრება მილიონამდე, Q07–Q12)
 *   U02.3  u02-subtraction-million     (გამოკლება მილიონამდე, Q13–Q18)
 *   U02.4  u02-expanded-form           (რიცხვის წარმოდგენა შესაკრებების ჯამის სახით, Q19–Q24)
 *   U02.5  u02-estimate-sum            (ჯამის მიახლოებითი გამოთვლა, Q25–Q30)
 *   U02.6  u02-estimate-diff           (სხვაობის მიახლოებითი გამოთვლა, Q31–Q36)
 *   U02.7  u02-estimate-word-problems  (ტექსტური ამოცანები მიახლოებით ჯამსა და სხვაობაზე, Q37–Q42)
 *   U02.8  u02-fill-table              (ცხრილის შევსება, Q43–Q48)
 *   U02.9  u02-related-operations      (შესაბამისი მოქმედებები, Q49–Q54)
 *   U02.10 u02-number-pyramids         (რიცხვითი პირამიდები, Q55–Q60)
 */

import { defineTemplate } from './types';
import type { QuestionTemplate, DifficultyLevel } from './types';

const grade = 4 as const;
const topicId = 'g4-shekreba-gamokleba' as const;
const unitId = 'g4-shekreba-gamokleba' as const;

export const G4_U02_SUBTOPICS = [
  'u02-unknown-number',
  'u02-addition-million',
  'u02-subtraction-million',
  'u02-expanded-form',
  'u02-estimate-sum',
  'u02-estimate-diff',
  'u02-estimate-word-problems',
  'u02-fill-table',
  'u02-related-operations',
  'u02-number-pyramids',
] as const;

export type G4U02SubtopicId = (typeof G4_U02_SUBTOPICS)[number];

const addr = (spec: { id: string; subtopicId: G4U02SubtopicId; difficulty: DifficultyLevel }) => ({
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

export const G4_U02_TEMPLATES: QuestionTemplate[] = [
  // ==================================================================
  // U02.1 — უცნობი რიცხვის პოვნა (u02-unknown-number)
  // ==================================================================

  // Q01 (Level 1): □ + A = B -> □ = B - A (4-digit)
  defineTemplate({
    ...addr({ id: 'g4-u02-01', subtopicId: 'u02-unknown-number', difficulty: 1 }),
    prompt: 'იპოვე უცნობი რიცხვი: □ + {a} = {b}',
    variables: {
      a: { kind: 'choice', values: [2450, 1850, 3200, 2150, 4300, 1650, 2800, 3450, 1250, 2650, 3150, 2250] },
      x: { kind: 'choice', values: [4250, 3150, 2800, 4850, 1700, 5350, 3200, 2550, 4750, 3350, 2850, 3750] },
      b: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.x)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 50, 100),
    explanation: ({ vars, answer }) => `უცნობი შესაკრები ტოლია ჯამს გამოკლებული ცნობილი შესაკრები: ${vars.b} − ${vars.a} = ${answer}.`,
  }),

  // Q02 (Level 1): A − □ = B -> □ = A - B (4-digit)
  defineTemplate({
    ...addr({ id: 'g4-u02-02', subtopicId: 'u02-unknown-number', difficulty: 1 }),
    prompt: 'იპოვე უცნობი რიცხვი: {a} − □ = {b}',
    variables: {
      a: { kind: 'choice', values: [8300, 7500, 9200, 6800, 8500, 7200, 9400, 6500, 8100, 7800, 9600, 8700] },
      b: { kind: 'choice', values: [3650, 2850, 4350, 2150, 3850, 2950, 4150, 2750, 3450, 3250, 4450, 3950] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 50, 100),
    explanation: ({ vars, answer }) => `უცნობი მაკლები ტოლია საკლებს გამოკლებული სხვაობა: ${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q03 (Level 2): □ − A = B -> □ = A + B (4-digit)
  defineTemplate({
    ...addr({ id: 'g4-u02-03', subtopicId: 'u02-unknown-number', difficulty: 2 }),
    prompt: 'იპოვე უცნობი რიცხვი: □ − {a} = {b}',
    variables: {
      a: { kind: 'choice', values: [1875, 2350, 1625, 2750, 3125, 1450, 2675, 1950, 2225, 1780, 2450, 3250] },
      b: { kind: 'choice', values: [4125, 3650, 4375, 3250, 2875, 4550, 3325, 4050, 3775, 4220, 3550, 2750] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 50, 100),
    explanation: ({ vars, answer }) => `უცნობი საკლები ტოლია სხვაობას მიმატებული მაკლები: ${vars.b} + ${vars.a} = ${answer}.`,
  }),

  // Q04 (Level 2): A + □ = B (B round thousands, 4-digit)
  defineTemplate({
    ...addr({ id: 'g4-u02-04', subtopicId: 'u02-unknown-number', difficulty: 2 }),
    prompt: 'იპოვე უცნობი რიცხვი: {a} + □ = {b}',
    variables: {
      b: { kind: 'choice', values: [9000, 8000, 7000, 6000, 10000, 8500, 9500, 7500] },
      a: { kind: 'choice', values: [3680, 2450, 4120, 1850, 5240, 2760, 3890, 4350, 1920, 2830, 3470, 4610] },
    },
    answer: (v) => Number(v.b) - Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 100),
    explanation: ({ vars, answer }) => `უცნობი შესაკრები ტოლია ჯამს გამოკლებული ცნობილი შესაკრები: ${vars.b} − ${vars.a} = ${answer}.`,
  }),

  // Q05 (Level 3): □ + A = B (5-digit)
  defineTemplate({
    ...addr({ id: 'g4-u02-05', subtopicId: 'u02-unknown-number', difficulty: 3 }),
    prompt: 'იპოვე უცნობი რიცხვი: □ + {a} = {b}',
    variables: {
      b: { kind: 'choice', values: [40000, 50000, 60000, 70000, 80000, 45000, 55000, 65000, 75000, 85000] },
      a: { kind: 'choice', values: [15750, 18250, 22500, 14750, 26250, 19500, 23750, 17250, 28500, 21250, 24750, 16500] },
    },
    answer: (v) => Number(v.b) - Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 50, 100),
    explanation: ({ vars, answer }) => `უცნობი შესაკრების საპოვნელად: ${vars.b} − ${vars.a} = ${answer}.`,
  }),

  // Q06 (Level 3): A − □ = B (5-digit)
  defineTemplate({
    ...addr({ id: 'g4-u02-06', subtopicId: 'u02-unknown-number', difficulty: 3 }),
    prompt: 'იპოვე უცნობი რიცხვი: {a} − □ = {b}',
    variables: {
      a: { kind: 'choice', values: [72500, 84200, 65800, 91400, 78600, 82300, 69500, 88700, 74900, 81500, 67200, 93600] },
      b: { kind: 'choice', values: [28750, 35400, 27300, 42800, 31500, 36200, 24800, 39400, 29600, 33700, 26500, 45100] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 50, 100),
    explanation: ({ vars, answer }) => `უცნობი მაკლების საპოვნელად: ${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // ==================================================================
  // U02.2 — შეკრება მილიონამდე (u02-addition-million)
  // ==================================================================

  // Q07 (Level 1): 5-ნიშნა შეკრება
  defineTemplate({
    ...addr({ id: 'g4-u02-07', subtopicId: 'u02-addition-million', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b}.',
    variables: {
      a: { kind: 'choice', values: [24560, 18420, 32150, 27340, 41280, 15630, 23750, 34810, 28190, 19470, 36240, 25180] },
      b: { kind: 'choice', values: [13280, 21350, 14620, 18530, 12410, 23150, 15240, 11360, 17250, 22180, 14350, 16290] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 100),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q08 (Level 1): 6-ნიშნა შეკრება მრგვალი ასეულებით
  defineTemplate({
    ...addr({ id: 'g4-u02-08', subtopicId: 'u02-addition-million', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b}.',
    variables: {
      a: { kind: 'choice', values: [156700, 234500, 182600, 315400, 248300, 173800, 261500, 324200, 195600, 278100, 142900, 286400] },
      b: { kind: 'choice', values: [242500, 153200, 214300, 162500, 131400, 225100, 143200, 152600, 231200, 114500, 253100, 122300] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 1000),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q09 (Level 2): 6-ნიშნა შეკრება (ზოგადი)
  defineTemplate({
    ...addr({ id: 'g4-u02-09', subtopicId: 'u02-addition-million', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} + {b}.',
    variables: {
      a: { kind: 'choice', values: [378456, 245618, 412384, 189245, 326715, 274839, 351294, 198427, 283516, 427183, 316942, 258731] },
      b: { kind: 'choice', values: [214327, 132145, 175423, 241532, 162148, 213052, 137425, 211348, 125341, 142305, 182036, 131245] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1000),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q10 (Level 2): 6-ნიშნა შეკრება ნულებით
  defineTemplate({
    ...addr({ id: 'g4-u02-10', subtopicId: 'u02-addition-million', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} + {b}.',
    variables: {
      a: { kind: 'choice', values: [425680, 510420, 360250, 480170, 290340, 530180, 370460, 440290, 280510, 520370, 390140, 470260] },
      b: { kind: 'choice', values: [306145, 204315, 108425, 205318, 304215, 107342, 205138, 106245, 304128, 206145, 105238, 204316] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1000),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q11 (Level 3): 6-ნიშნა შეკრება გადასვლებით
  defineTemplate({
    ...addr({ id: 'g4-u02-11', subtopicId: 'u02-addition-million', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} + {b}.',
    variables: {
      a: { kind: 'choice', values: [567890, 478659, 389476, 594837, 468759, 379584, 584967, 495876, 386795, 574896, 485967, 396874] },
      b: { kind: 'choice', values: [123456, 245678, 324589, 187654, 254873, 345689, 168745, 238765, 345829, 178456, 268475, 347856] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1000),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q12 (Level 3): 6-ნიშნა შეკრება მრგვალ ჯამზე
  defineTemplate({
    ...addr({ id: 'g4-u02-12', subtopicId: 'u02-addition-million', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} + {b}.',
    variables: {
      a: { kind: 'choice', values: [648275, 532150, 427840, 715625, 384750, 629180, 543275, 476850, 618325, 524160, 439250, 651840] },
      b: { kind: 'choice', values: [251725, 167850, 272160, 184375, 215250, 170820, 256725, 223150, 181675, 275840, 260750, 148160] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 1000),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // ==================================================================
  // U02.3 — გამოკლება მილიონამდე (u02-subtraction-million)
  // ==================================================================

  // Q13 (Level 1): 5-ნიშნა გამოკლება
  defineTemplate({
    ...addr({ id: 'g4-u02-13', subtopicId: 'u02-subtraction-million', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} − {b}.',
    variables: {
      a: { kind: 'choice', values: [58600, 67800, 79400, 86500, 94700, 75300, 82600, 91800, 64900, 73500, 85200, 93400] },
      b: { kind: 'choice', values: [24300, 32500, 41200, 35100, 42300, 31200, 41400, 50300, 23500, 32100, 43100, 51200] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q14 (Level 1): მრგვალი ასიათასეულებიდან გამოკლება
  defineTemplate({
    ...addr({ id: 'g4-u02-14', subtopicId: 'u02-subtraction-million', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} − {b}.',
    variables: {
      a: { kind: 'choice', values: [300000, 400000, 500000, 600000, 700000, 800000] },
      b: { kind: 'choice', values: [147500, 125000, 235000, 168000, 245000, 312000, 185000, 275000, 340000, 155000, 260000, 375000] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 500, 1000),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q15 (Level 2): 6-ნიშნა გამოკლება
  defineTemplate({
    ...addr({ id: 'g4-u02-15', subtopicId: 'u02-subtraction-million', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} − {b}.',
    variables: {
      a: { kind: 'choice', values: [624815, 735924, 846735, 592846, 683719, 754823, 819642, 672538, 743615, 825471, 638924, 761835] },
      b: { kind: 'choice', values: [312407, 214312, 423514, 251423, 341208, 231511, 405321, 231215, 321403, 412320, 215412, 320412] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1000),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q16 (Level 2): გამოკლება ნულებიანი საკლებიდან
  defineTemplate({
    ...addr({ id: 'g4-u02-16', subtopicId: 'u02-subtraction-million', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} − {b}.',
    variables: {
      a: { kind: 'choice', values: [700000, 800000, 900000, 600000, 500000] },
      b: { kind: 'choice', values: [286459, 341275, 412386, 175842, 238914, 354128, 421675, 189342, 267415, 381254, 194528, 273641] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1000),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q17 (Level 3): 6-ნიშნა გამოკლება შუა ნულებით
  defineTemplate({
    ...addr({ id: 'g4-u02-17', subtopicId: 'u02-subtraction-million', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} − {b}.',
    variables: {
      a: { kind: 'choice', values: [905620, 804530, 703640, 602750, 904810, 803920, 705430, 604810, 802740, 903650, 702810, 805930] },
      b: { kind: 'choice', values: [478235, 385142, 294153, 281642, 459328, 376241, 287315, 265418, 384152, 467215, 291438, 378245] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1000),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q18 (Level 3): გამოკლება მილიონიდან
  defineTemplate({
    ...addr({ id: 'g4-u02-18', subtopicId: 'u02-subtraction-million', difficulty: 3 }),
    prompt: 'გამოთვალე: 1 000 000 − {b}.',
    variables: {
      b: { kind: 'choice', values: [654789, 423851, 581246, 314782, 725419, 489325, 638147, 512964, 374825, 692154, 458712, 536928] },
    },
    answer: (v) => 1000000 - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1000),
    explanation: ({ vars, answer }) => `1 000 000 − ${vars.b} = ${answer}.`,
  }),

  // ==================================================================
  // U02.4 — რიცხვის წარმოდგენა შესაკრებების ჯამის სახით (u02-expanded-form)
  // ==================================================================

  // Q19 (Level 1): 4-ნიშნა რიცხვის დაშლა სათანრიგო შესაკრებებად
  defineTemplate({
    ...addr({ id: 'g4-u02-19', subtopicId: 'u02-expanded-form', difficulty: 1 }),
    prompt: 'წარმოადგინე {n} თანრიგების მიხედვით შესაკრებთა ჯამის სახით.',
    variables: {
      item: {
        kind: 'choice',
        values: [
          '4582|4 000 + 500 + 80 + 2',
          '3741|3 000 + 700 + 40 + 1',
          '2865|2 000 + 800 + 60 + 5',
          '5194|5 000 + 100 + 90 + 4',
          '6428|6 000 + 400 + 20 + 8',
          '7356|7 000 + 300 + 50 + 6',
          '8219|8 000 + 200 + 10 + 9',
          '1937|1 000 + 900 + 30 + 7',
          '4623|4 000 + 600 + 20 + 3',
          '5841|5 000 + 800 + 40 + 1',
          '3298|3 000 + 200 + 90 + 8',
          '2476|2 000 + 400 + 70 + 6',
        ],
      },
      n: { kind: 'choice', values: (v) => [String(v.item).split('|')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.item).split('|')[1]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const s = String(vars.n);
      const d0 = s[0];
      const d1 = s[1];
      const d2 = s[2];
      const d3 = s[3];
      const w1 = `${d0} 000 + ${d1}00 + ${d2} + ${d3}`;
      const w2 = `${d0}00 + ${d1}0 + ${d2} + ${d3}`;
      const w3 = `${d0} 000 + ${d1}0 + ${d2}0 + ${d3}`;
      return [w1, w2, w3].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.n} = ${answer}.`,
  }),

  // Q20 (Level 1): 5-ნიშნა რიცხვის დაშლა ნულით
  defineTemplate({
    ...addr({ id: 'g4-u02-20', subtopicId: 'u02-expanded-form', difficulty: 1 }),
    prompt: 'წარმოადგინე {n} თანრიგების მიხედვით შესაკრებთა ჯამის სახით.',
    variables: {
      item: {
        kind: 'choice',
        values: [
          '36407|30 000 + 6 000 + 400 + 7',
          '42058|40 000 + 2 000 + 50 + 8',
          '51302|50 000 + 1 000 + 300 + 2',
          '64025|60 000 + 4 000 + 20 + 5',
          '28504|20 000 + 8 000 + 500 + 4',
          '73041|70 000 + 3 000 + 40 + 1',
          '85206|80 000 + 5 000 + 200 + 6',
          '19047|10 000 + 9 000 + 40 + 7',
          '34608|30 000 + 4 000 + 600 + 8',
          '47019|40 000 + 7 000 + 10 + 9',
          '58203|50 000 + 8 000 + 200 + 3',
          '62074|60 000 + 2 000 + 70 + 4',
        ],
      },
      n: { kind: 'choice', values: (v) => [String(v.item).split('|')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.item).split('|')[1]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const s = String(vars.n);
      const w1 = `${s[0]}0 000 + ${s[1]}00 + ${s[2]}0 + ${s[4]}`;
      const w2 = `${s[0]} 000 + ${s[1]}00 + ${s[2]}0 + ${s[4]}`;
      const w3 = `${s[0]}0 000 + ${s[1]} 000 + ${s[2]} + ${s[4]}`;
      return [w1, w2, w3].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.n} = ${answer} (ნულოვანი თანრიგები გამოიტოვება).`,
  }),

  // Q21 (Level 2): 6-ნიშნა რიცხვის დაშლა ნულით
  defineTemplate({
    ...addr({ id: 'g4-u02-21', subtopicId: 'u02-expanded-form', difficulty: 2 }),
    prompt: 'წარმოადგინე {n} თანრიგების მიხედვით შესაკრებთა ჯამის სახით.',
    variables: {
      item: {
        kind: 'choice',
        values: [
          '205630|200 000 + 5 000 + 600 + 30',
          '304520|300 000 + 4 000 + 500 + 20',
          '407810|400 000 + 7 000 + 800 + 10',
          '502460|500 000 + 2 000 + 400 + 60',
          '608350|600 000 + 8 000 + 300 + 50',
          '701940|700 000 + 1 000 + 900 + 40',
          '803270|800 000 + 3 000 + 200 + 70',
          '106540|100 000 + 6 000 + 500 + 40',
          '209480|200 000 + 9 000 + 400 + 80',
          '403750|400 000 + 3 000 + 700 + 50',
          '506190|500 000 + 6 000 + 100 + 90',
          '704820|700 000 + 4 000 + 800 + 20',
        ],
      },
      n: { kind: 'choice', values: (v) => [String(v.item).split('|')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.item).split('|')[1]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const s = String(vars.n);
      const w1 = `${s[0]}0 000 + ${s[2]} 000 + ${s[3]}00 + ${s[4]}0`;
      const w2 = `${s[0]}00 000 + ${s[2]}00 + ${s[3]}0 + ${s[4]}`;
      const w3 = `${s[0]}00 000 + ${s[2]}0 000 + ${s[3]}00 + ${s[4]}0`;
      return [w1, w2, w3].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.n} = ${answer}.`,
  }),

  // Q22 (Level 2): 6-ნიშნა რიცხვის დაშლა რამდენიმე ნულით
  defineTemplate({
    ...addr({ id: 'g4-u02-22', subtopicId: 'u02-expanded-form', difficulty: 2 }),
    prompt: 'წარმოადგინე {n} თანრიგების მიხედვით შესაკრებთა ჯამის სახით.',
    variables: {
      item: {
        kind: 'choice',
        values: [
          '740018|700 000 + 40 000 + 10 + 8',
          '830025|800 000 + 30 000 + 20 + 5',
          '520034|500 000 + 20 000 + 30 + 4',
          '610047|600 000 + 10 000 + 40 + 7',
          '950012|900 000 + 50 000 + 10 + 2',
          '480036|400 000 + 80 000 + 30 + 6',
          '370019|300 000 + 70 000 + 10 + 9',
          '260045|200 000 + 60 000 + 40 + 5',
          '810023|800 000 + 10 000 + 20 + 3',
          '920038|900 000 + 20 000 + 30 + 8',
          '630014|600 000 + 30 000 + 10 + 4',
          '750029|700 000 + 50 000 + 20 + 9',
        ],
      },
      n: { kind: 'choice', values: (v) => [String(v.item).split('|')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.item).split('|')[1]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const s = String(vars.n);
      const w1 = `${s[0]}00 000 + ${s[1]} 000 + ${s[4]}0 + ${s[5]}`;
      const w2 = `${s[0]}0 000 + ${s[1]} 000 + ${s[4]}0 + ${s[5]}`;
      const w3 = `${s[0]}00 000 + ${s[1]}0 000 + ${s[4]} + ${s[5]}`;
      return [w1, w2, w3].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.n} = ${answer}.`,
  }),

  // Q23 (Level 3): შეავსე გამოტოვებული შესაკრები
  defineTemplate({
    ...addr({ id: 'g4-u02-23', subtopicId: 'u02-expanded-form', difficulty: 3 }),
    prompt: 'შეავსე გამოტოვებული შესაკრები: {p1} + {p2} + □ + {p4} = {total}',
    variables: {
      item: {
        kind: 'choice',
        values: [
          '50000|7000|840|6|57846|840',
          '40000|3000|250|8|43258|250',
          '60000|4000|710|3|64713|710',
          '30000|8000|620|5|38625|620',
          '70000|2000|480|9|72489|480',
          '80000|5000|390|1|85391|390',
          '20000|9000|530|4|29534|530',
          '90000|1000|760|2|91762|760',
          '40000|6000|820|7|46827|820',
          '50000|3000|140|8|53148|140',
          '60000|2000|950|4|62954|950',
          '70000|4000|380|5|74385|380',
        ],
      },
      p1: { kind: 'choice', values: (v) => [String(v.item).split('|')[0]] },
      p2: { kind: 'choice', values: (v) => [String(v.item).split('|')[1]] },
      p4: { kind: 'choice', values: (v) => [String(v.item).split('|')[3]] },
      total: { kind: 'choice', values: (v) => [String(v.item).split('|')[4]] },
      ans: { kind: 'choice', values: (v) => [String(v.item).split('|')[5]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.total} − (${vars.p1} + ${vars.p2} + ${vars.p4}) = ${answer}.`,
  }),

  // Q24 (Level 3): რიცხვის აღდგენა გაშლილი ფორმიდან
  defineTemplate({
    ...addr({ id: 'g4-u02-24', subtopicId: 'u02-expanded-form', difficulty: 3 }),
    prompt: 'ჩაწერე რიცხვი, რომელიც მიიღება ჯამით: {expr}',
    variables: {
      item: {
        kind: 'choice',
        values: [
          '300 000 + 40 000 + 2 000 + 500 + 9|342509',
          '400 000 + 50 000 + 3 000 + 600 + 8|453608',
          '200 000 + 70 000 + 4 000 + 800 + 3|274803',
          '500 000 + 20 000 + 6 000 + 100 + 7|526107',
          '600 000 + 80 000 + 1 000 + 400 + 2|681402',
          '700 000 + 30 000 + 5 000 + 900 + 4|735904',
          '800 000 + 10 000 + 7 000 + 200 + 5|817205',
          '100 000 + 60 000 + 8 000 + 300 + 1|168301',
          '300 000 + 90 000 + 2 000 + 700 + 6|392706',
          '400 000 + 10 000 + 5 000 + 400 + 8|415408',
          '500 000 + 60 000 + 3 000 + 800 + 2|563802',
          '600 000 + 40 000 + 9 000 + 100 + 7|649107',
        ],
      },
      expr: { kind: 'choice', values: (v) => [String(v.item).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.item).split('|')[1]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1000),
    explanation: ({ vars, answer }) => `${vars.expr} = ${answer}.`,
  }),

  // ==================================================================
  // U02.5 — ჯამის მიახლოებითი გამოთვლა (u02-estimate-sum)
  // ==================================================================

  // Q25 (Level 1): დამრგვალება უახლოეს ათასეულამდე: A + B
  defineTemplate({
    ...addr({ id: 'g4-u02-25', subtopicId: 'u02-estimate-sum', difficulty: 1 }),
    prompt: 'დაამრგვალე თითოეული შესაკრები უახლოეს ათასეულამდე და მიახლოებით გამოთვალე: {a} + {b}.',
    variables: {
      a: { kind: 'choice', values: [4280, 3610, 2490, 5120, 1870, 3420, 4750, 2830, 5210, 3890, 4150, 2760] },
      b: { kind: 'choice', values: [3610, 2450, 4180, 1920, 3240, 2810, 1490, 3620, 2410, 1780, 3250, 4320] },
    },
    answer: (v) => Math.round(Number(v.a) / 1000) * 1000 + Math.round(Number(v.b) / 1000) * 1000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 1000) * 1000;
      const rb = Math.round(Number(vars.b) / 1000) * 1000;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} + ${rb} = ${answer}.`;
    },
  }),

  // Q26 (Level 1): დამრგვალება უახლოეს ათიათასეულამდე: A + B
  defineTemplate({
    ...addr({ id: 'g4-u02-26', subtopicId: 'u02-estimate-sum', difficulty: 1 }),
    prompt: 'დაამრგვალე უახლოეს ათიათასეულამდე და მიახლოებით გამოთვალე: {a} + {b}.',
    variables: {
      a: { kind: 'choice', values: [34500, 42700, 28100, 51200, 19400, 63800, 37200, 48500, 26900, 54100, 32800, 46300] },
      b: { kind: 'choice', values: [42700, 35100, 21800, 28400, 41200, 22100, 31400, 18200, 34100, 23500, 41800, 27300] },
    },
    answer: (v) => Math.round(Number(v.a) / 10000) * 10000 + Math.round(Number(v.b) / 10000) * 10000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10000, 10000),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 10000) * 10000;
      const rb = Math.round(Number(vars.b) / 10000) * 10000;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} + ${rb} = ${answer}.`;
    },
  }),

  // Q27 (Level 2): 5-ნიშნა მიახლოებითი ჯამი უახლოეს ათასეულამდე
  defineTemplate({
    ...addr({ id: 'g4-u02-27', subtopicId: 'u02-estimate-sum', difficulty: 2 }),
    prompt: 'მიახლოებით გამოთვალე უახლოეს ათასეულამდე დამრგვალებით: {a} + {b}.',
    variables: {
      a: { kind: 'choice', values: [26480, 34250, 18720, 42150, 29840, 35190, 23640, 48210, 19450, 31780, 27350, 44820] },
      b: { kind: 'choice', values: [12350, 21480, 15620, 23810, 14250, 18340, 22150, 13740, 25180, 16420, 19250, 11840] },
    },
    answer: (v) => Math.round(Number(v.a) / 1000) * 1000 + Math.round(Number(v.b) / 1000) * 1000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 1000) * 1000;
      const rb = Math.round(Number(vars.b) / 1000) * 1000;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} + ${rb} = ${answer}.`;
    },
  }),

  // Q28 (Level 2): დამრგვალება უახლოეს ასეულამდე: A + B
  defineTemplate({
    ...addr({ id: 'g4-u02-28', subtopicId: 'u02-estimate-sum', difficulty: 2 }),
    prompt: 'დაამრგვალე უახლოეს ასეულამდე და მიახლოებით გამოთვალე: {a} + {b}.',
    variables: {
      a: { kind: 'choice', values: [3478, 2641, 4125, 1892, 3564, 2718, 4381, 1945, 3284, 2835, 4162, 3749] },
      b: { kind: 'choice', values: [2641, 1835, 2418, 3124, 1542, 2381, 1725, 2419, 1832, 2145, 1674, 2251] },
    },
    answer: (v) => Math.round(Number(v.a) / 100) * 100 + Math.round(Number(v.b) / 100) * 100,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 100) * 100;
      const rb = Math.round(Number(vars.b) / 100) * 100;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} + ${rb} = ${answer}.`;
    },
  }),

  // Q29 (Level 3): 6-ნიშნა დამრგვალება უახლოეს ათიათასეულამდე: A + B
  defineTemplate({
    ...addr({ id: 'g4-u02-29', subtopicId: 'u02-estimate-sum', difficulty: 3 }),
    prompt: 'მიახლოებით გამოთვალე უახლოეს ათიათასეულამდე დამრგვალებით: {a} + {b}.',
    variables: {
      a: { kind: 'choice', values: [248000, 361000, 184000, 427000, 293000, 352000, 418000, 275000, 384000, 192000, 461000, 329000] },
      b: { kind: 'choice', values: [361000, 214000, 252000, 183000, 324000, 171000, 235000, 312000, 142000, 281000, 154000, 241000] },
    },
    answer: (v) => Math.round(Number(v.a) / 10000) * 10000 + Math.round(Number(v.b) / 10000) * 10000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10000, 10000),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 10000) * 10000;
      const rb = Math.round(Number(vars.b) / 10000) * 10000;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} + ${rb} = ${answer}.`;
    },
  }),

  // Q30 (Level 3): ტექსტური ამოცანა ჯამის მიახლოებაზე
  defineTemplate({
    ...addr({ id: 'g4-u02-30', subtopicId: 'u02-estimate-sum', difficulty: 3 }),
    prompt: 'წიგნების მაღაზიაში ერთ დღეს {a} წიგნი მიიღეს, მეორე დღეს — {b}. მიახლოებით რამდენი წიგნი მიიღეს სულ, თუ ორივე რიცხვს უახლოეს ათასეულამდე დავამრგვალებთ?',
    variables: {
      a: { kind: 'choice', values: [18650, 14280, 21450, 16820, 23140, 19350, 15720, 22480, 17910, 24150, 13840, 20620] },
      b: { kind: 'choice', values: [22420, 18350, 15280, 24150, 17820, 21340, 18950, 16240, 23180, 19450, 21820, 17350] },
    },
    answer: (v) => Math.round(Number(v.a) / 1000) * 1000 + Math.round(Number(v.b) / 1000) * 1000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 1000) * 1000;
      const rb = Math.round(Number(vars.b) / 1000) * 1000;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} + ${rb} = ${answer} წიგნი.`;
    },
  }),

  // ==================================================================
  // U02.6 — სხვაობის მიახლოებითი გამოთვლა (u02-estimate-diff)
  // ==================================================================

  // Q31 (Level 1): დამრგვალება უახლოეს ათასეულამდე: A − B (4-digit)
  defineTemplate({
    ...addr({ id: 'g4-u02-31', subtopicId: 'u02-estimate-diff', difficulty: 1 }),
    prompt: 'დაამრგვალე ორივე რიცხვი უახლოეს ათასეულამდე და მიახლოებით გამოთვალე: {a} − {b}.',
    variables: {
      a: { kind: 'choice', values: [8750, 7820, 9340, 6890, 8420, 7560, 9180, 6450, 8290, 7640, 9510, 8830] },
      b: { kind: 'choice', values: [3280, 2450, 4120, 1890, 3510, 2740, 3820, 1950, 3180, 2630, 4210, 3470] },
    },
    answer: (v) => Math.round(Number(v.a) / 1000) * 1000 - Math.round(Number(v.b) / 1000) * 1000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 1000) * 1000;
      const rb = Math.round(Number(vars.b) / 1000) * 1000;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} − ${rb} = ${answer}.`;
    },
  }),

  // Q32 (Level 1): დამრგვალება უახლოეს ათიათასეულამდე: A − B (5-digit)
  defineTemplate({
    ...addr({ id: 'g4-u02-32', subtopicId: 'u02-estimate-diff', difficulty: 1 }),
    prompt: 'დაამრგვალე უახლოეს ათიათასეულამდე და მიახლოებით გამოთვალე: {a} − {b}.',
    variables: {
      a: { kind: 'choice', values: [76000, 84000, 68000, 92000, 74000, 85000, 69000, 91000, 78000, 83000, 65000, 94000] },
      b: { kind: 'choice', values: [32000, 28000, 21000, 35000, 24000, 31000, 27000, 38000, 25000, 34000, 22000, 41000] },
    },
    answer: (v) => Math.round(Number(v.a) / 10000) * 10000 - Math.round(Number(v.b) / 10000) * 10000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10000, 10000),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 10000) * 10000;
      const rb = Math.round(Number(vars.b) / 10000) * 10000;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} − ${rb} = ${answer}.`;
    },
  }),

  // Q33 (Level 2): დამრგვალება უახლოეს ასეულამდე: A − B (4-digit)
  defineTemplate({
    ...addr({ id: 'g4-u02-33', subtopicId: 'u02-estimate-diff', difficulty: 2 }),
    prompt: 'მიახლოებით გამოთვალე უახლოეს ასეულამდე დამრგვალებით: {a} − {b}.',
    variables: {
      a: { kind: 'choice', values: [5683, 6745, 4829, 7352, 5914, 6438, 7125, 4962, 5841, 6519, 7483, 5372] },
      b: { kind: 'choice', values: [2241, 3182, 1735, 2846, 2154, 3218, 2435, 1827, 2315, 2741, 3128, 1945] },
    },
    answer: (v) => Math.round(Number(v.a) / 100) * 100 - Math.round(Number(v.b) / 100) * 100,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 100) * 100;
      const rb = Math.round(Number(vars.b) / 100) * 100;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} − ${rb} = ${answer}.`;
    },
  }),

  // Q34 (Level 2): დამრგვალება უახლოეს ათასეულამდე: A − B (5-digit)
  defineTemplate({
    ...addr({ id: 'g4-u02-34', subtopicId: 'u02-estimate-diff', difficulty: 2 }),
    prompt: 'დაამრგვალე უახლოეს ათასეულამდე და მიახლოებით გამოთვალე: {a} − {b}.',
    variables: {
      a: { kind: 'choice', values: [42650, 53420, 38750, 61280, 47350, 56190, 49820, 64250, 51380, 45910, 58240, 62710] },
      b: { kind: 'choice', values: [18420, 21350, 14280, 27150, 19420, 24310, 17850, 28410, 22150, 16340, 23780, 25140] },
    },
    answer: (v) => Math.round(Number(v.a) / 1000) * 1000 - Math.round(Number(v.b) / 1000) * 1000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 1000) * 1000;
      const rb = Math.round(Number(vars.b) / 1000) * 1000;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} − ${rb} = ${answer}.`;
    },
  }),

  // Q35 (Level 3): დამრგვალება უახლოეს ათიათასეულამდე: A − B (6-digit)
  defineTemplate({
    ...addr({ id: 'g4-u02-35', subtopicId: 'u02-estimate-diff', difficulty: 3 }),
    prompt: 'მიახლოებით გამოთვალე უახლოეს ათიათასეულამდე დამრგვალებით: {a} − {b}.',
    variables: {
      a: { kind: 'choice', values: [685000, 742000, 819000, 594000, 728000, 853000, 671000, 786000, 834000, 647000, 792000, 825000] },
      b: { kind: 'choice', values: [243000, 318000, 372000, 215000, 284000, 341000, 263000, 329000, 291000, 235000, 354000, 278000] },
    },
    answer: (v) => Math.round(Number(v.a) / 10000) * 10000 - Math.round(Number(v.b) / 10000) * 10000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10000, 10000),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 10000) * 10000;
      const rb = Math.round(Number(vars.b) / 10000) * 10000;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} − ${rb} = ${answer}.`;
    },
  }),

  // Q36 (Level 3): ტექსტური ამოცანა სხვაობის მიახლოებაზე
  defineTemplate({
    ...addr({ id: 'g4-u02-36', subtopicId: 'u02-estimate-diff', difficulty: 3 }),
    prompt: 'საწყობში {a} კგ ფქვილი იყო. გაიყიდა {b} კგ. დაახლოებით რამდენი კილოგრამი დარჩა, თუ რიცხვებს უახლოეს ათასეულამდე დავამრგვალებთ?',
    variables: {
      a: { kind: 'choice', values: [52780, 61450, 48320, 73210, 58490, 64180, 51920, 67340, 49810, 72150, 56340, 63820] },
      b: { kind: 'choice', values: [19360, 24150, 17280, 28410, 21350, 23820, 18450, 25190, 16420, 27350, 19840, 22150] },
    },
    answer: (v) => Math.round(Number(v.a) / 1000) * 1000 - Math.round(Number(v.b) / 1000) * 1000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 1000) * 1000;
      const rb = Math.round(Number(vars.b) / 1000) * 1000;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} − ${rb} = ${answer} კგ ფქვილი.`;
    },
  }),

  // ==================================================================
  // U02.7 — ტექსტური ამოცანები მიახლოებით ჯამსა და სხვაობაზე (u02-estimate-word-problems)
  // ==================================================================

  // Q37 (Level 1): ბიბლიოთეკაში წიგნების საერთო რაოდენობა (უახლოეს ათასეულამდე)
  defineTemplate({
    ...addr({ id: 'g4-u02-37', subtopicId: 'u02-estimate-word-problems', difficulty: 1 }),
    prompt: 'ბიბლიოთეკაში {a} ქართული და {b} უცხოური წიგნია. დაახლოებით რამდენი წიგნია სულ, თუ რიცხვებს უახლოეს ათასეულამდე დავამრგვალებთ?',
    variables: {
      a: { kind: 'choice', values: [12480, 14250, 11820, 15340, 13710, 16190, 12850, 14720, 11390, 15840, 13260, 14910] },
      b: { kind: 'choice', values: [8620, 7410, 9280, 6850, 8140, 7920, 9450, 6720, 8350, 7180, 9120, 8470] },
    },
    answer: (v) => Math.round(Number(v.a) / 1000) * 1000 + Math.round(Number(v.b) / 1000) * 1000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 1000) * 1000;
      const rb = Math.round(Number(vars.b) / 1000) * 1000;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} + ${rb} = ${answer} წიგნი.`;
    },
  }),

  // Q38 (Level 1): უბნების მოსახლეობის სხვაობა (უახლოეს ათასეულამდე)
  defineTemplate({
    ...addr({ id: 'g4-u02-38', subtopicId: 'u02-estimate-word-problems', difficulty: 1 }),
    prompt: 'ქალაქის პირველ უბანში {a} ადამიანი ცხოვრობს, მეორეში — {b}. დაახლოებით რამდენით მეტია პირველი უბნის მოსახლეობა, თუ რიცხვებს უახლოეს ათასეულამდე დავამრგვალებთ?',
    variables: {
      a: { kind: 'choice', values: [34700, 38200, 42100, 36400, 41500, 37800, 43200, 35900, 39400, 44100, 36800, 42700] },
      b: { kind: 'choice', values: [28400, 24100, 27300, 21800, 26200, 23500, 29100, 22400, 25800, 28700, 21400, 27500] },
    },
    answer: (v) => Math.round(Number(v.a) / 1000) * 1000 - Math.round(Number(v.b) / 1000) * 1000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 1000) * 1000;
      const rb = Math.round(Number(vars.b) / 1000) * 1000;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} − ${rb} = ${answer} ადამიანი.`;
    },
  }),

  // Q39 (Level 2): ქარხნის მიერ დამზადებული ნივთები (უახლოეს ათიათასეულამდე)
  defineTemplate({
    ...addr({ id: 'g4-u02-39', subtopicId: 'u02-estimate-word-problems', difficulty: 2 }),
    prompt: 'ქარხანამ ერთ თვეში {a} ნივთი დაამზადა, შემდეგ თვეში — {b}. დაახლოებით რამდენი ნივთი დამზადდა ამ ორ თვეში, თუ რიცხვებს უახლოეს ათიათასეულამდე დავამრგვალებთ?',
    variables: {
      a: { kind: 'choice', values: [148600, 162400, 137800, 174200, 153100, 181500, 142900, 168400, 157200, 172600, 139500, 164800] },
      b: { kind: 'choice', values: [162300, 141800, 154200, 138500, 171400, 129600, 158200, 143700, 165100, 132400, 176800, 147500] },
    },
    answer: (v) => Math.round(Number(v.a) / 10000) * 10000 + Math.round(Number(v.b) / 10000) * 10000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10000, 10000),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 10000) * 10000;
      const rb = Math.round(Number(vars.b) / 10000) * 10000;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} + ${rb} = ${answer} ნივთი.`;
    },
  }),

  // Q40 (Level 2): მაღაზიაში დარჩენილი ბოთლები (უახლოეს ათასეულამდე)
  defineTemplate({
    ...addr({ id: 'g4-u02-40', subtopicId: 'u02-estimate-word-problems', difficulty: 2 }),
    prompt: 'მაღაზიაში {a} ბოთლი წყალი იყო. გაიყიდა {b} ბოთლი. დაახლოებით რამდენი ბოთლი დარჩა, თუ რიცხვებს უახლოეს ათასეულამდე დავამრგვალებთ?',
    variables: {
      a: { kind: 'choice', values: [25680, 28450, 31240, 27810, 34150, 29320, 32840, 26750, 30420, 35190, 28940, 33260] },
      b: { kind: 'choice', values: [9420, 8150, 11240, 7850, 12410, 8920, 10350, 7420, 9810, 11840, 8450, 10720] },
    },
    answer: (v) => Math.round(Number(v.a) / 1000) * 1000 - Math.round(Number(v.b) / 1000) * 1000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 1000) * 1000;
      const rb = Math.round(Number(vars.b) / 1000) * 1000;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} − ${rb} = ${answer} ბოთლი.`;
    },
  }),

  // Q41 (Level 3): მუზეუმის დამთვალიერებლები ორ დღეში (უახლოეს ათასეულამდე)
  defineTemplate({
    ...addr({ id: 'g4-u02-41', subtopicId: 'u02-estimate-word-problems', difficulty: 3 }),
    prompt: 'პირველ დღეს მუზეუმს {a} ადამიანი ეწვია, მეორე დღეს — {b}. დაახლოებით რამდენი ადამიანი ეწვია მუზეუმს ორივე დღეს, თუ რიცხვებს უახლოეს ათასეულამდე დავამრგვალებთ?',
    variables: {
      a: { kind: 'choice', values: [18750, 21420, 16890, 23150, 19480, 24310, 17250, 22840, 15910, 25180, 18340, 20720] },
      b: { kind: 'choice', values: [21380, 17820, 24150, 18920, 22450, 16740, 23810, 19250, 21490, 17350, 24820, 18640] },
    },
    answer: (v) => Math.round(Number(v.a) / 1000) * 1000 + Math.round(Number(v.b) / 1000) * 1000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 1000) * 1000;
      const rb = Math.round(Number(vars.b) / 1000) * 1000;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} + ${rb} = ${answer} ადამიანი.`;
    },
  }),

  // Q42 (Level 3): სოფლების მოსახლეობის სხვაობა (უახლოეს ათიათასეულამდე)
  defineTemplate({
    ...addr({ id: 'g4-u02-42', subtopicId: 'u02-estimate-word-problems', difficulty: 3 }),
    prompt: 'ორ სოფელში ცხოვრობს {a} და {b} ადამიანი. დაახლოებით რამდენით განსხვავდება მათი მოსახლეობა, თუ რიცხვებს უახლოეს ათიათასეულამდე დავამრგვალებთ?',
    variables: {
      a: { kind: 'choice', values: [46200, 52400, 61800, 48300, 54100, 63700, 49500, 57200, 64900, 47800, 53600, 62100] },
      b: { kind: 'choice', values: [31700, 24800, 28200, 19400, 27500, 22100, 33400, 26800, 21900, 28600, 23700, 31200] },
    },
    answer: (v) => Math.round(Number(v.a) / 10000) * 10000 - Math.round(Number(v.b) / 10000) * 10000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10000, 10000),
    explanation: ({ vars, answer }) => {
      const ra = Math.round(Number(vars.a) / 10000) * 10000;
      const rb = Math.round(Number(vars.b) / 10000) * 10000;
      return `${vars.a} ≈ ${ra}, ${vars.b} ≈ ${rb}; ${ra} − ${rb} = ${answer} ადამიანი.`;
    },
  }),

  // ==================================================================
  // U02.8 — ცხრილის შევსება (u02-fill-table)
  // ==================================================================

  // Q43 (Level 1): პირველი შესაკრები A, მეორე შესაკრები B -> ჯამი
  defineTemplate({
    ...addr({ id: 'g4-u02-43', subtopicId: 'u02-fill-table', difficulty: 1 }),
    prompt: 'შეავსე ცხრილის გამოტოვებული მნიშვნელობა: პირველი შესაკრები: {a} მეორე შესაკრები: {b} ჯამი: □',
    variables: {
      a: { kind: 'choice', values: [2450, 3180, 1850, 4230, 2760, 3540, 1920, 4150, 2830, 3670, 1490, 2980] },
      b: { kind: 'choice', values: [3280, 2450, 4120, 1860, 3140, 2650, 3810, 1720, 2950, 2180, 4350, 2240] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 100),
    explanation: ({ vars, answer }) => `ჯამი = პირველი შესაკრები + მეორე შესაკრები = ${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q44 (Level 1): საკლები A, მაკლები B -> სხვაობა
  defineTemplate({
    ...addr({ id: 'g4-u02-44', subtopicId: 'u02-fill-table', difficulty: 1 }),
    prompt: 'შეავსე ცხრილის გამოტოვებული მნიშვნელობა: საკლები: {a} მაკლები: {b} სხვაობა: □',
    variables: {
      a: { kind: 'choice', values: [9000, 8500, 7800, 9200, 8100, 7400, 9500, 8300, 7600, 8900, 9400, 8200] },
      b: { kind: 'choice', values: [4650, 3280, 2950, 4120, 3740, 2810, 4350, 3420, 2790, 4180, 3650, 2980] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 100),
    explanation: ({ vars, answer }) => `სხვაობა = საკლები − მაკლები = ${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q45 (Level 2): პირველი შესაკრები A, ჯამი S -> მეორე შესაკრები
  defineTemplate({
    ...addr({ id: 'g4-u02-45', subtopicId: 'u02-fill-table', difficulty: 2 }),
    prompt: 'შეავსე ცხრილის გამოტოვებული მნიშვნელობა: პირველი შესაკრები: {a} მეორე შესაკრები: □ ჯამი: {s}',
    variables: {
      s: { kind: 'choice', values: [40000, 50000, 60000, 45000, 55000, 65000, 70000, 75000, 80000, 85000] },
      a: { kind: 'choice', values: [15600, 18400, 22300, 14200, 26500, 19100, 23800, 17500, 28200, 21400, 24600, 16900] },
    },
    answer: (v) => Number(v.s) - Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `მეორე შესაკრები = ჯამი − პირველი შესაკრები = ${vars.s} − ${vars.a} = ${answer}.`,
  }),

  // Q46 (Level 2): საკლები A, სხვაობა D -> მაკლები
  defineTemplate({
    ...addr({ id: 'g4-u02-46', subtopicId: 'u02-fill-table', difficulty: 2 }),
    prompt: 'შეავსე ცხრილის გამოტოვებული მნიშვნელობა: საკლები: {a} მაკლები: □ სხვაობა: {d}',
    variables: {
      a: { kind: 'choice', values: [72500, 81400, 68900, 93200, 76500, 84100, 69800, 88300, 75400, 82700, 67400, 91500] },
      d: { kind: 'choice', values: [28750, 34200, 26100, 41500, 32400, 37800, 25300, 39100, 28400, 33600, 27200, 44300] },
    },
    answer: (v) => Number(v.a) - Number(v.d),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 50, 100),
    explanation: ({ vars, answer }) => `მაკლები = საკლები − სხვაობა = ${vars.a} − ${vars.d} = ${answer}.`,
  }),

  // Q47 (Level 3): მაკლები B, სხვაობა D -> საკლები
  defineTemplate({
    ...addr({ id: 'g4-u02-47', subtopicId: 'u02-fill-table', difficulty: 3 }),
    prompt: 'შეავსე ცხრილის გამოტოვებული მნიშვნელობა: საკლები: □ მაკლები: {b} სხვაობა: {d}',
    variables: {
      b: { kind: 'choice', values: [16840, 21450, 18320, 24150, 19280, 22640, 17510, 23820, 18940, 25120, 16350, 20740] },
      d: { kind: 'choice', values: [23160, 18550, 24180, 17350, 22420, 19160, 25290, 18480, 21860, 16880, 24450, 21260] },
    },
    answer: (v) => Number(v.b) + Number(v.d),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `საკლები = სხვაობა + მაკლები = ${vars.d} + ${vars.b} = ${answer}.`,
  }),

  // Q48 (Level 3): 6-ნიშნა პირველი შესაკრები A, ჯამი S -> მეორე შესაკრები
  defineTemplate({
    ...addr({ id: 'g4-u02-48', subtopicId: 'u02-fill-table', difficulty: 3 }),
    prompt: 'შეავსე ცხრილის გამოტოვებული მნიშვნელობა: პირველი შესაკრები: {a} მეორე შესაკრები: □ ჯამი: {s}',
    variables: {
      s: { kind: 'choice', values: [300000, 400000, 500000, 600000, 700000] },
      a: { kind: 'choice', values: [125000, 148000, 172000, 135000, 184000, 156000, 163000, 192000, 141000, 178000, 152000, 167000] },
    },
    answer: (v) => Number(v.s) - Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => `მეორე შესაკრები = ${vars.s} − ${vars.a} = ${answer}.`,
  }),

  // ==================================================================
  // U02.9 — შესაბამისი მოქმედებები (u02-related-operations)
  // ==================================================================

  // Q49 (Level 1): თუ A + B = S, მაშინ A0 + B0 = □
  defineTemplate({
    ...addr({ id: 'g4-u02-49', subtopicId: 'u02-related-operations', difficulty: 1 }),
    prompt: 'თუ {a} + {b} = {s}, მაშინ რამდენია: {a0} + {b0} = □',
    variables: {
      a: { kind: 'choice', values: [345, 238, 412, 186, 324, 275, 431, 194, 356, 283, 417, 362] },
      b: { kind: 'choice', values: [278, 145, 326, 251, 183, 314, 248, 312, 172, 245, 181, 254] },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b)] },
      a0: { kind: 'choice', values: (v) => [Number(v.a) * 10] },
      b0: { kind: 'choice', values: (v) => [Number(v.b) * 10] },
    },
    answer: (v) => (Number(v.a) + Number(v.b)) * 10,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 100),
    explanation: ({ vars, answer }) => `რადგან თითოეული შესაკრები 10-ჯერ გაიზარდა, ჯამიც 10-ჯერ გაიზრდება: ${vars.s} × 10 = ${answer}.`,
  }),

  // Q50 (Level 1): თუ A − B = D, მაშინ A0 − B0 = □
  defineTemplate({
    ...addr({ id: 'g4-u02-50', subtopicId: 'u02-related-operations', difficulty: 1 }),
    prompt: 'თუ {a} − {b} = {d}, მაშინ რამდენია: {a0} − {b0} = □',
    variables: {
      a: { kind: 'choice', values: [900, 840, 750, 920, 810, 760, 950, 830, 780, 890, 940, 820] },
      b: { kind: 'choice', values: [365, 284, 312, 425, 271, 348, 412, 295, 318, 421, 352, 289] },
      d: { kind: 'choice', values: (v) => [Number(v.a) - Number(v.b)] },
      a0: { kind: 'choice', values: (v) => [Number(v.a) * 10] },
      b0: { kind: 'choice', values: (v) => [Number(v.b) * 10] },
    },
    answer: (v) => (Number(v.a) - Number(v.b)) * 10,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 100),
    explanation: ({ vars, answer }) => `საკლებიც და მაკლებიც 10-ჯერ გაიზარდა, ამიტომ სხვაობაც 10-ჯერ გაიზრდება: ${vars.d} × 10 = ${answer}.`,
  }),

  // Q51 (Level 2): შეკრების გადანაცვლებადობა: A + B = B + □
  defineTemplate({
    ...addr({ id: 'g4-u02-51', subtopicId: 'u02-related-operations', difficulty: 2 }),
    prompt: 'შეავსე ტოლობა: {a} + {b} = {b} + □',
    variables: {
      a: { kind: 'choice', values: [4500, 3200, 5100, 2800, 4300, 3600, 5400, 2700, 4800, 3900, 5200, 3100] },
      b: { kind: 'choice', values: [2300, 1800, 2400, 3100, 1700, 2500, 1900, 2600, 1500, 2200, 1600, 2900] },
    },
    answer: (v) => Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [b, a + b, Math.abs(a - b)].filter((x) => x !== Number(answer));
    },
    explanation: ({ answer }) => `შეკრების გადანაცვლებადობის თვისებით: შესაკრებთა გადანაცვლებით ჯამი არ იცვლება, ამიტომ გამოტოვებული რიცხვია ${answer}.`,
  }),

  // Q52 (Level 2): შეავსე ტოლობა: A − B = A − □
  defineTemplate({
    ...addr({ id: 'g4-u02-52', subtopicId: 'u02-related-operations', difficulty: 2 }),
    prompt: 'შეავსე ტოლობა: {a} − {b} = {a} − □',
    variables: {
      a: { kind: 'choice', values: [8750, 7620, 9140, 6830, 8410, 7590, 9280, 6740, 8350, 7810, 9460, 8120] },
      b: { kind: 'choice', values: [2500, 1800, 3100, 2200, 2700, 1900, 3400, 2100, 2600, 1700, 3200, 2300] },
    },
    answer: (v) => Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [a, a - b, a + b].filter((x) => x !== Number(answer));
    },
    explanation: ({ answer }) => `ტოლობის ორივე მხარე ერთმანეთის ტოლი რომ იყოს, გამოტოვებული რიცხვი უნდა იყოს ${answer}.`,
  }),

  // Q53 (Level 3): შებრუნებული მოქმედება: თუ A + B = S, მაშინ S − A = □
  defineTemplate({
    ...addr({ id: 'g4-u02-53', subtopicId: 'u02-related-operations', difficulty: 3 }),
    prompt: 'თუ {a} + {b} = {s}, მაშინ გამოთვალე: {s} − {a} = □',
    variables: {
      a: { kind: 'choice', values: [25000, 32000, 18000, 27000, 35000, 21000, 29000, 34000, 19000, 28000, 31000, 23000] },
      b: { kind: 'choice', values: [15000, 18000, 22000, 13000, 25000, 19000, 21000, 16000, 24000, 17000, 14000, 26000] },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b)] },
    },
    answer: (v) => Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => {
      const a = Number(vars.a);
      const s = Number(vars.s);
      return [a, s, s - Number(answer) + 1000].filter((x) => x !== Number(answer));
    },
    explanation: ({ vars, answer }) => `შეკრებასა და გამოკლებას შორის კავშირით: თუ ${vars.a} + ${vars.b} = ${vars.s}, მაშინ ${vars.s} − ${vars.a} = ${answer}.`,
  }),

  // Q54 (Level 3): ბალანსის ტოლობა: A + B = □ − C
  defineTemplate({
    ...addr({ id: 'g4-u02-54', subtopicId: 'u02-related-operations', difficulty: 3 }),
    prompt: 'შეავსე ტოლობა: {a} + {b} = □ − {c}',
    variables: {
      a: { kind: 'choice', values: [125000, 140000, 110000, 150000, 130000, 160000, 120000, 145000, 135000, 155000, 115000, 165000] },
      b: { kind: 'choice', values: [75000, 60000, 90000, 50000, 70000, 40000, 80000, 55000, 65000, 45000, 85000, 35000] },
      c: { kind: 'choice', values: [100000, 50000, 80000, 60000, 70000] },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10000, 10000),
    explanation: ({ vars, answer }) => `მარცხენა მხარეა ${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}. აქედან □ = ${Number(vars.a) + Number(vars.b)} + ${vars.c} = ${answer}.`,
  }),

  // ==================================================================
  // U02.10 — რიცხვითი პირამიდები (u02-number-pyramids)
  // ==================================================================

  // Q55 (Level 1): პატარა რიცხვების პირამიდა
  defineTemplate({
    ...addr({ id: 'g4-u02-55', subtopicId: 'u02-number-pyramids', difficulty: 1 }),
    prompt: 'რიცხვით პირამიდაში თითოეულ ზედა უჯრაში იწერება მის ქვემოთ მდებარე ორი მეზობელი უჯრის რიცხვების ჯამი. ქვედა რიგში წერია: {a}, {b}, {c}. იპოვე ზედა უჯრის რიცხვი.',
    variables: {
      a: { kind: 'choice', values: [3, 4, 5, 2, 6, 1, 7, 3, 4, 2, 5, 1] },
      b: { kind: 'choice', values: [5, 3, 4, 6, 2, 7, 1, 4, 6, 5, 3, 8] },
      c: { kind: 'choice', values: [2, 6, 1, 3, 5, 4, 2, 7, 1, 3, 6, 2] },
    },
    answer: (v) => Number(v.a) + 2 * Number(v.b) + Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => {
      const m1 = Number(vars.a) + Number(vars.b);
      const m2 = Number(vars.b) + Number(vars.c);
      return `შუა რიგის უჯრებია: ${vars.a} + ${vars.b} = ${m1} და ${vars.b} + ${vars.c} = ${m2}. ზედა უჯრაა: ${m1} + ${m2} = ${answer}.`;
    },
  }),

  // Q56 (Level 1): ათეულების პირამიდა
  defineTemplate({
    ...addr({ id: 'g4-u02-56', subtopicId: 'u02-number-pyramids', difficulty: 1 }),
    prompt: 'რიცხვით პირამიდაში ქვედა რიგში წერია: {a}, {b}, {c}. თითოეულ ზედა უჯრაში იწერება ქვემოთ მდებარე ორი მეზობელი უჯრის ჯამი. იპოვე ზედა უჯრის რიცხვი.',
    variables: {
      a: { kind: 'choice', values: [10, 15, 20, 25, 30, 12, 18, 22, 28, 14, 16, 24] },
      b: { kind: 'choice', values: [20, 25, 30, 15, 10, 24, 16, 18, 12, 22, 26, 14] },
      c: { kind: 'choice', values: [30, 20, 10, 25, 15, 18, 22, 14, 26, 16, 12, 28] },
    },
    answer: (v) => Number(v.a) + 2 * Number(v.b) + Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 10),
    explanation: ({ vars, answer }) => {
      const m1 = Number(vars.a) + Number(vars.b);
      const m2 = Number(vars.b) + Number(vars.c);
      return `შუა რიგშია: ${vars.a} + ${vars.b} = ${m1} და ${vars.b} + ${vars.c} = ${m2}. ზედა უჯრაშია: ${m1} + ${m2} = ${answer}.`;
    },
  }),

  // Q57 (Level 2): ასეულების პირამიდა
  defineTemplate({
    ...addr({ id: 'g4-u02-57', subtopicId: 'u02-number-pyramids', difficulty: 2 }),
    prompt: 'რიცხვითი პირამიდის ქვედა რიგში წერია: {a}, {b}, {c}. იპოვე ზედა უჯრის რიცხვი.',
    variables: {
      a: { kind: 'choice', values: [125, 150, 175, 200, 225, 100, 140, 160, 180, 210, 230, 120] },
      b: { kind: 'choice', values: [250, 200, 225, 175, 150, 240, 180, 210, 190, 160, 220, 230] },
      c: { kind: 'choice', values: [375, 350, 325, 300, 275, 260, 280, 230, 210, 240, 250, 220] },
    },
    answer: (v) => Number(v.a) + 2 * Number(v.b) + Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 25, 100),
    explanation: ({ vars, answer }) => {
      const m1 = Number(vars.a) + Number(vars.b);
      const m2 = Number(vars.b) + Number(vars.c);
      return `შუა რიგშია: ${vars.a} + ${vars.b} = ${m1} და ${vars.b} + ${vars.c} = ${m2}. ზედა უჯრაა: ${m1} + ${m2} = ${answer}.`;
    },
  }),

  // Q58 (Level 2): ათასეულების პირამიდა
  defineTemplate({
    ...addr({ id: 'g4-u02-58', subtopicId: 'u02-number-pyramids', difficulty: 2 }),
    prompt: 'რიცხვითი პირამიდის ქვედა რიგში წერია: {a}, {b}, {c}. იპოვე ზედა უჯრის რიცხვი.',
    variables: {
      a: { kind: 'choice', values: [1200, 1400, 1100, 1500, 1300, 1600, 1000, 1250, 1350, 1450, 1150, 1550] },
      b: { kind: 'choice', values: [800, 900, 750, 850, 700, 950, 650, 820, 780, 880, 720, 920] },
      c: { kind: 'choice', values: [600, 700, 550, 650, 500, 750, 450, 620, 580, 680, 520, 720] },
    },
    answer: (v) => Number(v.a) + 2 * Number(v.b) + Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => {
      const m1 = Number(vars.a) + Number(vars.b);
      const m2 = Number(vars.b) + Number(vars.c);
      return `შუა რიგშია: ${vars.a} + ${vars.b} = ${m1} და ${vars.b} + ${vars.c} = ${m2}. ზედა უჯრაა: ${m1} + ${m2} = ${answer}.`;
    },
  }),

  // Q59 (Level 3): შერეული ათასეულების პირამიდა
  defineTemplate({
    ...addr({ id: 'g4-u02-59', subtopicId: 'u02-number-pyramids', difficulty: 3 }),
    prompt: 'რიცხვითი პირამიდის ქვედა რიგში წერია: {a}, {b}, {c}. იპოვე ზედა უჯრის რიცხვი.',
    variables: {
      a: { kind: 'choice', values: [2450, 2150, 2350, 2650, 1850, 2250, 2550, 1950, 2750, 2050, 2850, 2100] },
      b: { kind: 'choice', values: [1550, 1850, 1650, 1450, 2150, 1750, 1350, 2050, 1250, 1950, 1150, 1600] },
      c: { kind: 'choice', values: [3000, 2500, 2800, 3200, 2400, 2700, 3100, 2600, 3300, 2900, 3400, 2800] },
    },
    answer: (v) => Number(v.a) + 2 * Number(v.b) + Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => {
      const m1 = Number(vars.a) + Number(vars.b);
      const m2 = Number(vars.b) + Number(vars.c);
      return `შუა რიგშია: ${vars.a} + ${vars.b} = ${m1} და ${vars.b} + ${vars.c} = ${m2}. ზედა უჯრაა: ${m1} + ${m2} = ${answer}.`;
    },
  }),

  // Q60 (Level 3): პირამიდაში გამოტოვებული ქვედა უჯრის პოვნა
  defineTemplate({
    ...addr({ id: 'g4-u02-60', subtopicId: 'u02-number-pyramids', difficulty: 3 }),
    prompt: 'პირამიდის ქვედა რიგში წერია: {a}, □, {c}. შუა რიგის მარცხენა უჯრაში წერია {m1}, ხოლო მარჯვენა უჯრაში — {m2}. იპოვე გამოტოვებული რიცხვი ქვედა რიგში.',
    variables: {
      a: { kind: 'choice', values: [4000, 3500, 4500, 3000, 5000, 2500, 4200, 3800, 4600, 3200, 4800, 3600] },
      x: { kind: 'choice', values: [3000, 2500, 3500, 2000, 4000, 1500, 2800, 3200, 2400, 3600, 2200, 3400] },
      c: { kind: 'choice', values: [2500, 2000, 3000, 1500, 3500, 1800, 2200, 2600, 1900, 2700, 2100, 2400] },
      m1: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.x)] },
      m2: { kind: 'choice', values: (v) => [Number(v.x) + Number(v.c)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `რადგან შუა რიგის მარცხენა უჯრა ტოლია ${vars.a} + □ = ${vars.m1}, გამოტოვებული რიცხვია: ${vars.m1} − ${vars.a} = ${answer}.`,
  }),
];
