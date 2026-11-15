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

export const G4_U18_SUBTOPICS = [
  'u18-number-sequences',
  'u18-next-element',
  'u18-number-triangles',
] as const;

export type G4U18SubtopicId = (typeof G4_U18_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G4U18SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 4 as const,
  topicId: 'g4-kanonzomierebebi' as const,
  unitId: 'g4-kanonzomierebebi' as const,
  ...options,
});

export const G4_U18_TEMPLATES: QuestionTemplate[] = [
  // g4-u18-01 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u18-01', subtopicId: 'u18-number-sequences', difficulty: 1 }),
    prompt: 'გააგრძელე მიმდევრობა: {seq}, __.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3, 6, 9, 12|15|3", "4, 8, 12, 16|20|4", "5, 10, 15, 20|25|5", "6, 12, 18, 24|30|6", "7, 14, 21, 28|35|7", "8, 16, 24, 32|40|8", "9, 18, 27, 36|45|9", "10, 20, 30, 40|50|10", "2, 5, 8, 11|14|3", "3, 7, 11, 15|19|4", "4, 9, 14, 19|24|5", "5, 11, 17, 23|29|6", "1, 5, 9, 13|17|4", "2, 8, 14, 20|26|6", "6, 13, 20, 27|34|7", "3, 11, 19, 27|35|8", "7, 15, 23, 31|39|8", "4, 13, 22, 31|40|9"],
      },
      seq: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      step: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `თითოეული წევრი იზრდება ${vars.step}-ით, ამიტომ შემდეგი რიცხვია ${answer}.`,
  }),

  // g4-u18-02 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u18-02', subtopicId: 'u18-number-sequences', difficulty: 1 }),
    prompt: 'გააგრძელე მიმდევრობა: {seq}, __.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5, 10, 20, 40|80", "3, 6, 12, 24|48", "4, 8, 16, 32|64", "2, 4, 8, 16|32", "6, 12, 24, 48|96", "7, 14, 28, 56|112", "1, 2, 4, 8|16", "10, 20, 40, 80|160", "8, 16, 32, 64|128", "9, 18, 36, 72|144", "15, 30, 60, 120|240", "12, 24, 48, 96|192", "25, 50, 100, 200|400", "11, 22, 44, 88|176", "14, 28, 56, 112|224", "16, 32, 64, 128|256", "20, 40, 80, 160|320", "30, 60, 120, 240|480"],
      },
      seq: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 2, 4),
    explanation: ({ answer }) => `თითოეული წევრი ორმაგდება, ამიტომ შემდეგი რიცხვია ${answer}.`,
  }),

  // g4-u18-03 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u18-03', subtopicId: 'u18-number-sequences', difficulty: 2 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: {p1}, __, {p2}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12, 16|24, 28|20|4", "10, 15|25, 30|20|5", "14, 21|35, 42|28|7", "18, 24|36, 42|30|6", "16, 24|40, 48|32|8", "20, 30|50, 60|40|10", "15, 20|30, 35|25|5", "21, 28|42, 49|35|7", "24, 32|48, 56|40|8", "27, 36|54, 63|45|9", "11, 14|20, 23|17|3", "13, 17|25, 29|21|4", "22, 27|37, 42|32|5", "19, 25|37, 43|31|6", "25, 32|46, 53|39|7", "33, 41|57, 65|49|8", "40, 49|67, 76|58|9", "35, 45|65, 75|55|10"],
      },
      p1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      p2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      step: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ნაბიჯია ${vars.step}, ამიტომ გამოტოვებული რიცხვია ${answer}.`,
  }),

  // g4-u18-04 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u18-04', subtopicId: 'u18-number-sequences', difficulty: 2 }),
    prompt: 'გააგრძელე მიმდევრობა: {seq}, __.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["100, 90, 80, 70|60|10", "95, 85, 75, 65|55|10", "80, 72, 64, 56|48|8", "70, 63, 56, 49|42|7", "60, 54, 48, 42|36|6", "50, 45, 40, 35|30|5", "48, 44, 40, 36|32|4", "45, 42, 39, 36|33|3", "90, 80, 70, 60|50|10", "85, 75, 65, 55|45|10", "72, 64, 56, 48|40|8", "63, 56, 49, 42|35|7", "54, 48, 42, 36|30|6", "40, 35, 30, 25|20|5", "36, 32, 28, 24|20|4", "39, 36, 33, 30|27|3", "75, 65, 55, 45|35|10", "56, 49, 42, 35|28|7"],
      },
      seq: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      step: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `თითოეული წევრი მცირდება ${vars.step}-ით, ამიტომ შემდეგია ${answer}.`,
  }),

  // g4-u18-05 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u18-05', subtopicId: 'u18-number-sequences', difficulty: 3 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: {p1}, __, {p2}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2, 5, 8|14|11|3", "3, 7, 11|19|15|4", "4, 9, 14|24|19|5", "5, 11, 17|29|23|6", "6, 13, 20|34|27|7", "1, 5, 9|17|13|4", "7, 15, 23|39|31|8", "8, 17, 26|44|35|9", "10, 16, 22|34|28|6", "12, 17, 22|32|27|5", "15, 19, 23|31|27|4", "20, 27, 34|48|41|7", "14, 22, 30|46|38|8", "11, 18, 25|39|32|7", "16, 25, 34|52|43|9", "18, 24, 30|42|36|6", "21, 26, 31|41|36|5", "24, 28, 32|40|36|4"],
      },
      p1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      p2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      step: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ნაბიჯია ${vars.step}, ამიტომ გამოტოვებული რიცხვია ${answer}.`,
  }),

  // g4-u18-06 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u18-06', subtopicId: 'u18-number-sequences', difficulty: 3 }),
    prompt: 'გააგრძელე კვადრატული რიცხვების მიმდევრობა: {seq}, __.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1, 4, 9, 16|25|კვადრატები: 1×1, 2×2, 3×3, 4×4, 5×5", "4, 9, 16, 25|36|კვადრატები: 2×2, 3×3, 4×4, 5×5, 6×6", "9, 16, 25, 36|49|კვადრატები: 3×3, 4×4, 5×5, 6×6, 7×7", "16, 25, 36, 49|64|კვადრატები: 4×4, 5×5, 6×6, 7×7, 8×8", "25, 36, 49, 64|81|კვადრატები: 5×5, 6×6, 7×7, 8×8, 9×9", "36, 49, 64, 81|100|კვადრატები: 6×6, 7×7, 8×8, 9×9, 10×10", "1, 4, 9|16|კვადრატები: 1×1, 2×2, 3×3, 4×4", "4, 9, 16|25|კვადრატები: 2×2, 3×3, 4×4, 5×5", "9, 16, 25|36|კვადრატები: 3×3, 4×4, 5×5, 6×6", "16, 25, 36|49|კვადრატები: 4×4, 5×5, 6×6, 7×7", "25, 36, 49|64|კვადრატები: 5×5, 6×6, 7×7, 8×8", "49, 64, 81|100|კვადრატები: 7×7, 8×8, 9×9, 10×10", "64, 81, 100|121|კვადრატები: 8×8, 9×9, 10×10, 11×11", "81, 100, 121|144|კვადრატები: 9×9, 10×10, 11×11, 12×12", "1, 4, 9, 16, 25|36|კვადრატები: 1-დან 6-მდე რიცხვების კვადრატები", "4, 9, 16, 25, 36|49|კვადრატები: 2-დან 7-მდე რიცხვების კვადრატები", "9, 16, 25, 36, 49|64|კვადრატები: 3-დან 8-მდე რიცხვების კვადრატები", "16, 25, 36, 49, 64|81|კვადრატები: 4-დან 9-მდე რიცხვების კვადრატები"],
      },
      seq: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      rule: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 2, 2),
    explanation: ({ vars, answer }) => `${vars.rule}. შემდეგია ${answer}.`,
  }),

  // g4-u18-07 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u18-07', subtopicId: 'u18-next-element', difficulty: 1 }),
    prompt: 'რომელი რიცხვი უნდა იყოს შემდეგი: {seq}, __?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["7, 14, 21, 28|35|7", "8, 16, 24, 32|40|8", "9, 18, 27, 36|45|9", "6, 12, 18, 24|30|6", "12, 24, 36, 48|60|12", "15, 30, 45, 60|75|15", "20, 40, 60, 80|100|20", "25, 50, 75, 100|125|25", "14, 28, 42, 56|70|14", "16, 32, 48, 64|80|16", "18, 36, 54, 72|90|18", "13, 26, 39, 52|65|13", "11, 22, 33, 44|55|11", "17, 34, 51, 68|85|17", "19, 38, 57, 76|95|19", "21, 42, 63, 84|105|21", "22, 44, 66, 88|110|22", "30, 60, 90, 120|150|30"],
      },
      seq: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      step: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 2, 2),
    explanation: ({ vars, answer }) => `ნაბიჯია ${vars.step}, ამიტომ შემდეგი რიცხვია ${answer}.`,
  }),

  // g4-u18-08 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u18-08', subtopicId: 'u18-next-element', difficulty: 1 }),
    prompt: 'რომელი რიცხვი უნდა იყოს შემდეგი: {seq}, __?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["64, 32, 16, 8|4", "80, 40, 20, 10|5", "96, 48, 24, 12|6", "128, 64, 32, 16|8", "160, 80, 40, 20|10", "192, 96, 48, 24|12", "256, 128, 64, 32|16", "100, 50|25", "48, 24, 12|6", "72, 36, 18|9", "88, 44, 22|11", "112, 56, 28|14", "120, 60, 30|15", "144, 72, 36|18", "200, 100, 50|25", "240, 120, 60|30", "512, 256, 128, 64|32", "384, 192, 96, 48|24"],
      },
      seq: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ answer }) => `თითოეული წევრი ნახევრდება, ამიტომ შემდეგია ${answer}.`,
  }),

  // g4-u18-09 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u18-09', subtopicId: 'u18-next-element', difficulty: 2 }),
    prompt: 'რომელი რიცხვი უნდა იყოს შემდეგი: {seq}, __?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["11, 22, 33, 44|55|11", "22, 33, 44, 55|66|11", "33, 44, 55, 66|77|11", "44, 55, 66, 77|88|11", "12, 23, 34, 45|56|11", "15, 26, 37, 48|59|11", "18, 29, 40, 51|62|11", "21, 32, 43, 54|65|11", "13, 24, 35, 46|57|11", "14, 25, 36, 47|58|11", "16, 27, 38, 49|60|11", "17, 28, 39, 50|61|11", "19, 30, 41, 52|63|11", "20, 31, 42, 53|64|11", "23, 34, 45, 56|67|11", "25, 36, 47, 58|69|11", "55, 66, 77, 88|99|11", "24, 35, 46, 57|68|11"],
      },
      seq: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      step: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ნაბიჯია ${vars.step}, ამიტომ შემდეგი რიცხვია ${answer}.`,
  }),

  // g4-u18-10 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u18-10', subtopicId: 'u18-next-element', difficulty: 2 }),
    prompt: 'რომელი რიცხვი უნდა იყოს შემდეგი: {seq}, __?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2, 4, 8, 16|32", "4, 8, 16, 32|64", "8, 16, 32, 64|128", "16, 32, 64, 128|256", "1, 2, 4, 8|16", "3, 6, 12, 24|48", "6, 12, 24, 48|96", "12, 24, 48, 96|192", "5, 10, 20, 40|80", "10, 20, 40, 80|160", "20, 40, 80, 160|320", "7, 14, 28, 56|112", "9, 18, 36, 72|144", "15, 30, 60, 120|240", "25, 50, 100, 200|400", "11, 22, 44, 88|176", "32, 64, 128, 256|512", "14, 28, 56, 112|224"],
      },
      seq: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 2, 4),
    explanation: ({ answer }) => `თითოეული რიცხვი 2-ზე მრავლდება, ამიტომ შემდეგია ${answer}.`,
  }),

  // g4-u18-11 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u18-11', subtopicId: 'u18-next-element', difficulty: 3 }),
    prompt: 'რომელი რიცხვი უნდა იყოს შემდეგი: {seq}, __?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["50, 45, 40, 35|30|5", "65, 60, 55, 50|45|5", "75, 70, 65, 60|55|5", "85, 80, 75, 70|65|5", "90, 85, 80, 75|70|5", "100, 95, 90, 85|80|5", "40, 35, 30, 25|20|5", "55, 50, 45, 40|35|5", "60, 55, 50, 45|40|5", "70, 65, 60, 55|50|5", "80, 75, 70, 65|60|5", "95, 90, 85, 80|75|5", "45, 40, 35, 30|25|5", "35, 30, 25, 20|15|5", "30, 25, 20, 15|10|5", "105, 100, 95, 90|85|5", "110, 105, 100, 95|90|5", "120, 115, 110, 105|100|5"],
      },
      seq: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      step: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 2, 2),
    explanation: ({ vars, answer }) => `რიცხვები მცირდება ${vars.step}-ით, ამიტომ შემდეგია ${answer}.`,
  }),

  // g4-u18-12 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u18-12', subtopicId: 'u18-next-element', difficulty: 3 }),
    prompt: 'რომელი რიცხვი უნდა იყოს შემდეგი: {seq}, __?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1, 3, 6, 10, 15|21|+6", "3, 6, 10, 15, 21|28|+7", "6, 10, 15, 21, 28|36|+8", "10, 15, 21, 28, 36|45|+9", "15, 21, 28, 36, 45|55|+10", "2, 4, 7, 11, 16|22|+6", "4, 7, 11, 16, 22|29|+7", "5, 8, 12, 17, 23|30|+7", "1, 4, 8, 13, 19|26|+7", "2, 5, 9, 14, 20|27|+7", "3, 7, 12, 18, 25|33|+8", "1, 2, 4, 7, 11|16|+5", "2, 3, 5, 8, 12|17|+5", "5, 6, 8, 11, 15|20|+5", "4, 5, 7, 10, 14|19|+5", "6, 7, 9, 12, 16|21|+5", "7, 8, 10, 13, 17|22|+5", "8, 9, 11, 14, 18|23|+5"],
      },
      seq: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      step: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ნაბიჯი ყოველ ჯერზე 1-ით იზრდება (ბოლოს ემატება ${vars.step}), ამიტომ შემდეგი რიცხვია ${answer}.`,
  }),

  // g4-u18-13 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u18-13', subtopicId: 'u18-number-triangles', difficulty: 1 }),
    prompt: 'სამკუთხედში ზედა რიცხვი მიიღება ქვედა ორი რიცხვის შეკრებით. ქვედა რიცხვებია {b1} და {b2}. იპოვე ზედა რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|7|11", "5|8|13", "6|9|15", "3|8|11", "7|6|13", "8|5|13", "9|4|13", "6|8|14", "7|8|15", "5|9|14", "4|8|12", "7|7|14", "6|6|12", "8|8|16", "9|9|18", "5|7|12", "3|9|12", "8|6|14"],
      },
      b1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.b1} + ${vars.b2} = ${answer}.`,
  }),

  // g4-u18-14 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u18-14', subtopicId: 'u18-number-triangles', difficulty: 1 }),
    prompt: 'სამკუთხედში ზედა რიცხვი მიიღება ქვედა ორი რიცხვის შეკრებით. ქვედა რიცხვებია {b1} და {b2}. იპოვე ზედა რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|9|21", "14|8|22", "15|7|22", "16|9|25", "13|8|21", "17|6|23", "18|5|23", "11|12|23", "14|13|27", "15|11|26", "16|12|28", "19|8|27", "20|14|34", "17|15|32", "18|16|34", "13|15|28", "12|16|28", "15|14|29"],
      },
      b1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.b1} + ${vars.b2} = ${answer}.`,
  }),

  // g4-u18-15 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u18-15', subtopicId: 'u18-number-triangles', difficulty: 2 }),
    prompt: 'სამკუთხედში ზედა რიცხვი მიიღება ქვედა ორი რიცხვის შეკრებით. ზედა რიცხვია {top}, ხოლო ერთი ქვედა რიცხვია {b1}. იპოვე მეორე ქვედა რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["25|10|15", "30|12|18", "28|14|14", "35|15|20", "40|18|22", "32|16|16", "27|11|16", "36|14|22", "45|20|25", "34|12|22", "38|15|23", "42|17|25", "29|13|16", "33|11|22", "44|19|25", "48|20|28", "37|16|21", "50|22|28"],
      },
      top: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.top} − ${vars.b1} = ${answer}.`,
  }),

  // g4-u18-16 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u18-16', subtopicId: 'u18-number-triangles', difficulty: 2 }),
    prompt: 'სამკუთხედში ზედა რიცხვი მიიღება ქვედა ორი რიცხვის გამრავლებით. ქვედა რიცხვებია {b1} და {b2}. იპოვე ზედა რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|8|24", "4|7|28", "5|6|30", "6|7|42", "7|8|56", "8|9|72", "4|9|36", "5|8|40", "6|9|54", "3|9|27", "7|7|49", "8|8|64", "6|6|36", "5|7|35", "4|8|32", "9|9|81", "3|7|21", "5|9|45"],
      },
      b1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 2, 2),
    explanation: ({ vars, answer }) => `${vars.b1} × ${vars.b2} = ${answer}.`,
  }),

  // g4-u18-17 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u18-17', subtopicId: 'u18-number-triangles', difficulty: 3 }),
    prompt: 'სამკუთხედში ზედა რიცხვი მიიღება ქვედა ორი რიცხვის გამრავლებით. ზედა რიცხვია {top}, ხოლო ერთი ქვედა რიცხვია {b1}. იპოვე მეორე ქვედა რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["42|6|7", "56|7|8", "72|8|9", "48|6|8", "36|4|9", "45|5|9", "54|6|9", "63|7|9", "35|5|7", "28|4|7", "40|5|8", "32|4|8", "24|3|8", "27|3|9", "64|8|8", "49|7|7", "81|9|9", "30|5|6"],
      },
      top: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.top} ÷ ${vars.b1} = ${answer}.`,
  }),

  // g4-u18-18 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u18-18', subtopicId: 'u18-number-triangles', difficulty: 3 }),
    prompt: 'სამკუთხედში ზედა რიცხვი მიიღება ქვედა ორი რიცხვის შეკრებით. ქვედა რიცხვებია {b1} და {b2}. იპოვე ზედა რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["18|24|42", "25|35|60", "19|27|46", "32|28|60", "45|25|70", "36|24|60", "27|33|60", "38|22|60", "44|26|70", "52|28|80", "37|43|80", "46|34|80", "29|31|60", "48|32|80", "55|35|90", "42|38|80", "63|27|90", "54|36|90"],
      },
      b1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 2, 2),
    explanation: ({ vars, answer }) => `${vars.b1} + ${vars.b2} = ${answer}.`,
  }),
];
