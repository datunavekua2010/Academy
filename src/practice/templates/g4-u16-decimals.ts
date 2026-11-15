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

export const G4_U16_SUBTOPICS = [
  'u16-decimal-concept',
  'u16-decimal-comparison',
  'u16-fractions-to-decimals',
  'u16-decimal-addition',
  'u16-decimal-subtraction',
] as const;

export type G4U16SubtopicId = (typeof G4_U16_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G4U16SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 4 as const,
  topicId: 'g4-atwiladebi' as const,
  unitId: 'g4-atwiladebi' as const,
  ...options,
});

export const G4_U16_TEMPLATES: QuestionTemplate[] = [
  // g4-u16-01 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u16-01', subtopicId: 'u16-decimal-concept', difficulty: 1 }),
    prompt: 'ჩაწერე ათწილადის სახით: {w} მთელი და {t} მეათედი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|5|3,5", "4|2|4,2", "6|8|6,8", "2|7|2,7", "5|1|5,1", "8|4|8,4", "1|9|1,9", "7|3|7,3", "9|6|9,6", "3|8|3,8", "5|4|5,4", "2|6|2,6", "4|7|4,7", "6|3|6,3", "8|1|8,1", "7|9|7,9", "1|5|1,5", "9|2|9,2"],
      },
      w: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${ctx.vars.w},0${ctx.vars.t}`,
      `${Number(ctx.vars.w) + 1},${ctx.vars.t}`,
      `${ctx.vars.t},${ctx.vars.w}`,
    ],
    explanation: ({ vars, answer }) => `${vars.w} მთელი და ${vars.t} მეათედი იწერება როგორც ${answer}.`,
  }),

  // g4-u16-02 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u16-02', subtopicId: 'u16-decimal-concept', difficulty: 1 }),
    prompt: 'ჩაწერე ათწილადის სახით: {w} მთელი და {h} მეასედი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["7|25|7,25", "4|35|4,35", "5|12|5,12", "8|45|8,45", "2|75|2,75", "6|50|6,50", "3|18|3,18", "9|05|9,05", "1|64|1,64", "5|82|5,82", "7|40|7,40", "4|15|4,15", "8|30|8,30", "2|95|2,95", "6|24|6,24", "3|60|3,60", "9|15|9,15", "1|08|1,08"],
      },
      w: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      h: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.w) + 1},${ctx.vars.h}`,
      `${ctx.vars.w},${Number(ctx.vars.h) + 10}`,
      `${Math.max(1, Number(ctx.vars.w) - 1)},${ctx.vars.h}`,
    ],
    explanation: ({ vars, answer }) => `${vars.w} მთელი და ${vars.h} მეასედი იწერება როგორც ${answer}.`,
  }),

  // g4-u16-03 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u16-03', subtopicId: 'u16-decimal-concept', difficulty: 2 }),
    prompt: 'რიცხვში {num} რას აღნიშნავს ციფრი {d}?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4,6|6|მეათედებს|მეასედებს|ერთეულებს|ათეულებს", "5,8|8|მეათედებს|მეასედებს|ერთეულებს|ათეულებს", "2,7|7|მეათედებს|მეასედებს|ერთეულებს|ათეულებს", "9,3|3|მეათედებს|მეასედებს|ერთეულებს|ათეულებს", "3,5|5|მეათედებს|მეასედებს|ერთეულებს|ათეულებს", "8,4|4|მეათედებს|მეასედებს|ერთეულებს|ათეულებს", "1,9|9|მეათედებს|მეასედებს|ერთეულებს|ათეულებს", "7,2|2|მეათედებს|მეასედებს|ერთეულებს|ათეულებს", "6,1|1|მეათედებს|მეასედებს|ერთეულებს|ათეულებს", "4,5|5|მეათედებს|მეასედებს|ერთეულებს|ათეულებს", "3,8|8|მეათედებს|მეასედებს|ერთეულებს|ათეულებს", "2,4|4|მეათედებს|მეასედებს|ერთეულებს|ათეულებს", "5,7|7|მეათედებს|მეასედებს|ერთეულებს|ათეულებს", "8,6|6|მეათედებს|მეასედებს|ერთეულებს|ათეულებს", "9,1|1|მეათედებს|მეასედებს|ერთეულებს|ათეულებს", "7,9|9|მეათედებს|მეასედებს|ერთეულებს|ათეულებს"],
      },
      num: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[5]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)],
    explanation: ({ vars, answer }) => `მძიმის შემდეგ პირველი ციფრი აღნიშნავს ${answer}.`,
  }),

  // g4-u16-04 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u16-04', subtopicId: 'u16-decimal-concept', difficulty: 2 }),
    prompt: 'ჩაწერე ათწილადის სახით: {w} მთელი და {t} მეათედი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|8|2,8", "1|4|1,4", "5|6|5,6", "7|1|7,1", "3|9|3,9", "8|2|8,2", "4|5|4,5", "6|7|6,7", "9|3|9,3", "2|4|2,4", "5|8|5,8", "7|5|7,5", "3|1|3,1", "8|7|8,7", "1|8|1,8", "4|9|4,9", "6|2|6,2", "9|5|9,5"],
      },
      w: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${ctx.vars.w},0${ctx.vars.t}`,
      `${Number(ctx.vars.w) + 1},${ctx.vars.t}`,
      `${ctx.vars.t},${ctx.vars.w}`,
    ],
    explanation: ({ vars, answer }) => `${vars.w} მთელი და ${vars.t} მეათედი არის ${answer}.`,
  }),

  // g4-u16-05 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u16-05', subtopicId: 'u16-decimal-concept', difficulty: 3 }),
    prompt: 'ჩაწერე ათწილადის სახით: {w} მთელი და {h} მეასედი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|34|5,34", "3|48|3,48", "8|16|8,16", "2|65|2,65", "7|29|7,29", "4|55|4,55", "6|12|6,12", "9|70|9,70", "1|45|1,45", "5|88|5,88", "7|15|7,15", "3|22|3,22", "8|75|8,75", "2|40|2,40", "4|18|4,18", "6|35|6,35", "9|05|9,05", "1|85|1,85"],
      },
      w: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      h: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.w) + 1},${ctx.vars.h}`,
      `${ctx.vars.w},${Number(ctx.vars.h) + 10}`,
      `${Math.max(1, Number(ctx.vars.w) - 1)},${ctx.vars.h}`,
    ],
    explanation: ({ vars, answer }) => `${vars.w} მთელი და ${vars.h} მეასედი არის ${answer}.`,
  }),

  // g4-u16-06 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u16-06', subtopicId: 'u16-decimal-concept', difficulty: 3 }),
    prompt: 'რიცხვში {num} რომელი ციფრი დგას მეასედების თანრიგში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8,42|2|4|8|0", "5,73|3|7|5|1", "6,18|8|1|6|2", "3,95|5|9|3|0", "7,24|4|2|7|3", "9,61|1|6|9|5", "4,87|7|8|4|2", "2,36|6|3|2|4", "5,19|9|1|5|0", "7,45|5|4|7|2", "6,82|2|8|6|3", "3,54|4|5|3|1", "8,91|1|9|8|4", "4,27|7|2|4|5", "9,38|8|3|9|2", "1,63|3|6|1|0"],
      },
      num: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      w1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      w2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      w3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
    },
    answer: (v) => Number(v.ans),
    options: (v) => [Number(v.ans), Number(v.w1), Number(v.w2), Number(v.w3)],
    explanation: ({ vars, answer }) => `მძიმის შემდეგ მეორე ციფრი არის მეასედების ციფრი, ამიტომ სწორი პასუხია ${answer}.`,
  }),

  // g4-u16-07 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u16-07', subtopicId: 'u16-decimal-comparison', difficulty: 1 }),
    optionCount: 3,
    prompt: 'შეადარე ნიშნებით >, < ან =: {a} [ ? ] {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3,5|3,8|<", "4,7|4,2|>", "5,6|5,6|=", "2,9|3,1|<", "6,4|6,1|>", "7,8|7,8|=", "1,5|1,9|<", "8,3|8,0|>", "9,4|9,4|=", "3,2|3,7|<", "5,8|5,2|>", "4,4|4,4|=", "7,1|7,6|<", "6,9|6,5|>", "2,3|2,3|=", "8,7|8,9|<", "9,5|9,2|>", "1,8|1,8|="],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      sign: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.sign),
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  // g4-u16-08 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u16-08', subtopicId: 'u16-decimal-comparison', difficulty: 1 }),
    optionCount: 3,
    prompt: 'შეადარე ნიშნებით >, < ან =: {a} [ ? ] {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4,25|4,2|>", "3,15|3,2|<", "5,50|5,5|=", "6,75|6,7|>", "2,40|2,4|=", "7,35|7,4|<", "8,62|8,6|>", "1,85|1,9|<", "4,40|4,4|=", "9,15|9,1|>", "5,28|5,3|<", "3,70|3,7|=", "6,45|6,4|>", "7,15|7,2|<", "8,80|8,8|=", "2,95|2,9|>", "4,65|4,7|<", "5,90|5,9|="],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      sign: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.sign),
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  // g4-u16-09 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u16-09', subtopicId: 'u16-decimal-comparison', difficulty: 2 }),
    optionCount: 3,
    prompt: 'შეადარე ნიშნებით >, < ან =: {a} [ ? ] {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["7,06|7,6|<", "4,08|4,8|<", "5,60|5,06|>", "3,05|3,5|<", "8,7|8,07|>", "2,09|2,9|<", "6,04|6,4|<", "9,5|9,05|>", "1,07|1,7|<", "7,8|7,08|>", "3,02|3,2|<", "5,9|5,09|>", "4,05|4,5|<", "6,7|6,07|>", "8,03|8,3|<", "2,8|2,08|>", "9,01|9,1|<", "1,6|1,06|>"],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      sign: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.sign),
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  // g4-u16-10 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u16-10', subtopicId: 'u16-decimal-comparison', difficulty: 2 }),
    optionCount: 3,
    prompt: 'შეადარე ნიშნებით >, < ან =: {a} [ ? ] {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2,75|2,75|=", "3,40|3,4|=", "5,6|5,60|=", "4,80|4,8|=", "6,25|6,25|=", "7,5|7,50|=", "1,90|1,9|=", "8,35|8,35|=", "9,7|9,70|=", "2,50|2,5|=", "4,15|4,15|=", "6,8|6,80|=", "3,90|3,9|=", "5,45|5,45|=", "7,2|7,20|=", "8,60|8,6|=", "1,45|1,45|=", "9,30|9,3|="],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      sign: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.sign),
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  // g4-u16-11 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u16-11', subtopicId: 'u16-decimal-comparison', difficulty: 3 }),
    optionCount: 3,
    prompt: 'შეადარე ნიშნებით >, < ან =: {a} [ ? ] {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["0,9|0,85|>", "0,7|0,75|<", "0,6|0,58|>", "0,4|0,45|<", "0,8|0,79|>", "0,5|0,52|<", "0,9|0,88|>", "0,3|0,35|<", "0,7|0,65|>", "0,2|0,25|<", "0,8|0,75|>", "0,6|0,63|<", "0,5|0,48|>", "0,4|0,42|<", "0,9|0,92|<", "0,7|0,68|>", "0,3|0,28|>", "0,8|0,84|<"],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      sign: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.sign),
    options: () => ['>', '<', '='],
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  // g4-u16-12 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u16-12', subtopicId: 'u16-decimal-comparison', difficulty: 3 }),
    prompt: 'დაალაგე რიცხვები ზრდადობით: {nums}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1,4; 1,04; 1,44; 1,14|1,04; 1,14; 1,4; 1,44|1,4; 1,04; 1,14; 1,44|1,04; 1,4; 1,14; 1,44|1,44; 1,4; 1,14; 1,04", "2,5; 2,05; 2,55; 2,15|2,05; 2,15; 2,5; 2,55|2,5; 2,05; 2,15; 2,55|2,05; 2,5; 2,15; 2,55|2,55; 2,5; 2,15; 2,05", "3,6; 3,06; 3,66; 3,16|3,06; 3,16; 3,6; 3,66|3,6; 3,06; 3,16; 3,66|3,06; 3,6; 3,16; 3,66|3,66; 3,6; 3,16; 3,06", "4,2; 4,02; 4,22; 4,12|4,02; 4,12; 4,2; 4,22|4,2; 4,02; 4,12; 4,22|4,02; 4,2; 4,12; 4,22|4,22; 4,2; 4,12; 4,02", "5,7; 5,07; 5,77; 5,17|5,07; 5,17; 5,7; 5,77|5,7; 5,07; 5,17; 5,77|5,07; 5,7; 5,17; 5,77|5,77; 5,7; 5,17; 5,07", "0,8; 0,08; 0,88; 0,18|0,08; 0,18; 0,8; 0,88|0,8; 0,08; 0,18; 0,88|0,08; 0,8; 0,18; 0,88|0,88; 0,8; 0,18; 0,08", "2,3; 2,03; 2,33; 2,13|2,03; 2,13; 2,3; 2,33|2,3; 2,03; 2,13; 2,33|2,03; 2,3; 2,13; 2,33|2,33; 2,3; 2,13; 2,03", "3,8; 3,08; 3,88; 3,18|3,08; 3,18; 3,8; 3,88|3,8; 3,08; 3,18; 3,88|3,08; 3,8; 3,18; 3,88|3,88; 3,8; 3,18; 3,08", "1,9; 1,09; 1,99; 1,19|1,09; 1,19; 1,9; 1,99|1,9; 1,09; 1,19; 1,99|1,09; 1,9; 1,19; 1,99|1,99; 1,9; 1,19; 1,09", "4,5; 4,05; 4,55; 4,15|4,05; 4,15; 4,5; 4,55|4,5; 4,05; 4,15; 4,55|4,05; 4,5; 4,15; 4,55|4,55; 4,5; 4,15; 4,05", "5,3; 5,03; 5,33; 5,13|5,03; 5,13; 5,3; 5,33|5,3; 5,03; 5,13; 5,33|5,03; 5,3; 5,13; 5,33|5,33; 5,3; 5,13; 5,03", "6,4; 6,04; 6,44; 6,14|6,04; 6,14; 6,4; 6,44|6,4; 6,04; 6,14; 6,44|6,04; 6,4; 6,14; 6,44|6,44; 6,4; 6,14; 6,04", "2,7; 2,07; 2,77; 2,17|2,07; 2,17; 2,7; 2,77|2,7; 2,07; 2,17; 2,77|2,07; 2,7; 2,17; 2,77|2,77; 2,7; 2,17; 2,07", "3,4; 3,04; 3,44; 3,14|3,04; 3,14; 3,4; 3,44|3,4; 3,04; 3,14; 3,44|3,04; 3,4; 3,14; 3,44|3,44; 3,4; 3,14; 3,04", "7,2; 7,02; 7,22; 7,12|7,02; 7,12; 7,2; 7,22|7,2; 7,02; 7,12; 7,22|7,02; 7,2; 7,12; 7,22|7,22; 7,2; 7,12; 7,02", "8,5; 8,05; 8,55; 8,15|8,05; 8,15; 8,5; 8,55|8,5; 8,05; 8,15; 8,55|8,05; 8,5; 8,15; 8,55|8,55; 8,5; 8,15; 8,05"],
      },
      nums: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)],
    explanation: ({ answer }) => `ზრდადობით დალაგებული რიცხვებია: ${answer}.`,
  }),

  // g4-u16-13 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u16-13', subtopicId: 'u16-fractions-to-decimals', difficulty: 1 }),
    prompt: 'ჩაწერე ათწილადის სახით: {n}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1|10|0,1", "2|10|0,2", "3|10|0,3", "4|10|0,4", "5|10|0,5", "6|10|0,6", "7|10|0,7", "8|10|0,8", "9|10|0,9", "11|10|1,1", "12|10|1,2", "13|10|1,3", "14|10|1,4", "15|10|1,5", "16|10|1,6", "17|10|1,7", "18|10|1,8", "19|10|1,9"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const num = Number(ctx.vars.n) / 10;
      return [
        (num + 0.1).toFixed(1).replace('.', ','),
        (num + 1).toFixed(1).replace('.', ','),
        `0,0${ctx.vars.n}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.n}/${vars.d} = ${answer}.`,
  }),

  // g4-u16-14 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u16-14', subtopicId: 'u16-fractions-to-decimals', difficulty: 1 }),
    prompt: 'გადაიყვანე ათწილადში: {n}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1|10|0,1", "2|10|0,2", "3|10|0,3", "4|10|0,4", "5|10|0,5", "6|10|0,6", "7|10|0,7", "8|10|0,8", "9|10|0,9", "21|10|2,1", "22|10|2,2", "23|10|2,3", "24|10|2,4", "25|10|2,5", "26|10|2,6", "27|10|2,7", "28|10|2,8", "29|10|2,9"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const num = Number(ctx.vars.n) / 10;
      return [
        (num + 0.1).toFixed(1).replace('.', ','),
        (num + 1).toFixed(1).replace('.', ','),
        `0,0${ctx.vars.n}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.n}/${vars.d} = ${answer}.`,
  }),

  // g4-u16-15 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u16-15', subtopicId: 'u16-fractions-to-decimals', difficulty: 2 }),
    prompt: 'ჩაწერე ათწილადის სახით: {n}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["25|100|0,25", "35|100|0,35", "45|100|0,45", "15|100|0,15", "75|100|0,75", "85|100|0,85", "55|100|0,55", "65|100|0,65", "95|100|0,95", "05|100|0,05", "12|100|0,12", "24|100|0,24", "36|100|0,36", "48|100|0,48", "64|100|0,64", "72|100|0,72", "84|100|0,84", "96|100|0,96"],
      },
      n: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `0,${Number(ctx.vars.n) + 10}`,
      `1,${ctx.vars.n}`,
      `0,${Math.max(1, Number(ctx.vars.n) - 5)}`,
    ],
    explanation: ({ vars, answer }) => `${vars.n}/${vars.d} = ${answer}.`,
  }),

  // g4-u16-16 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u16-16', subtopicId: 'u16-fractions-to-decimals', difficulty: 2 }),
    prompt: 'გადაიყვანე ათწილადში: {n}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["68|100|0,68", "52|100|0,52", "44|100|0,44", "76|100|0,76", "38|100|0,38", "82|100|0,82", "91|100|0,91", "27|100|0,27", "19|100|0,19", "63|100|0,63", "47|100|0,47", "58|100|0,58", "73|100|0,73", "86|100|0,86", "34|100|0,34", "92|100|0,92", "29|100|0,29", "61|100|0,61"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `0,${Number(ctx.vars.n) + 10}`,
      `1,${ctx.vars.n}`,
      `0,${Math.max(1, Number(ctx.vars.n) - 10)}`,
    ],
    explanation: ({ vars, answer }) => `${vars.n}/${vars.d} = ${answer}.`,
  }),

  // g4-u16-17 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u16-17', subtopicId: 'u16-fractions-to-decimals', difficulty: 3 }),
    prompt: 'ჩაწერე ათწილადის სახით: {w} + {n}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|4|10|2,4", "3|5|10|3,5", "4|7|10|4,7", "5|2|10|5,2", "1|8|10|1,8", "6|3|10|6,3", "7|6|10|7,6", "8|1|10|8,1", "9|9|10|9,9", "2|7|10|2,7", "4|3|10|4,3", "5|8|10|5,8", "3|1|10|3,1", "6|9|10|6,9", "1|5|10|1,5", "7|4|10|7,4", "8|6|10|8,6", "9|2|10|9,2"],
      },
      w: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${ctx.vars.w},0${ctx.vars.n}`,
      `${Number(ctx.vars.w) + 1},${ctx.vars.n}`,
      `${ctx.vars.n},${ctx.vars.w}`,
    ],
    explanation: ({ vars, answer }) => `${vars.w} + ${vars.n}/${vars.d} = ${answer}.`,
  }),

  // g4-u16-18 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u16-18', subtopicId: 'u16-fractions-to-decimals', difficulty: 3 }),
    prompt: 'ჩაწერე ათწილადის სახით: {w} + {n}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|37|100|5,37", "3|45|100|3,45", "7|18|100|7,18", "4|82|100|4,82", "2|64|100|2,64", "6|25|100|6,25", "8|50|100|8,50", "1|75|100|1,75", "9|12|100|9,12", "5|88|100|5,88", "3|29|100|3,29", "7|55|100|7,55", "4|16|100|4,16", "6|40|100|6,40", "2|95|100|2,95", "8|30|100|8,30", "1|42|100|1,42", "9|65|100|9,65"],
      },
      w: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.w) + 1},${ctx.vars.n}`,
      `${ctx.vars.w},${Number(ctx.vars.n) + 10}`,
      `${Math.max(1, Number(ctx.vars.w) - 1)},${ctx.vars.n}`,
    ],
    explanation: ({ vars, answer }) => `${vars.w} + ${vars.n}/${vars.d} = ${answer}.`,
  }),

  // g4-u16-19 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u16-19', subtopicId: 'u16-decimal-addition', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2,3|1,4|3,7", "3,2|2,5|5,7", "4,1|3,6|7,7", "1,5|2,3|3,8", "5,2|1,7|6,9", "2,4|3,4|5,8", "6,1|2,5|8,6", "3,3|4,2|7,5", "1,2|5,6|6,8", "4,3|2,4|6,7", "2,5|1,3|3,8", "5,4|3,2|8,6", "3,1|4,5|7,6", "2,6|3,2|5,8", "4,2|1,5|5,7", "6,3|2,4|8,7", "1,4|3,5|4,9", "5,1|2,7|7,8"],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 0.1).toFixed(1).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) - 0.1).toFixed(1).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 1.0).toFixed(1).replace('.', ',')}`,
    ],
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // g4-u16-20 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u16-20', subtopicId: 'u16-decimal-addition', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4,25|2,30|6,55", "3,15|1,40|4,55", "5,20|3,35|8,55", "2,45|4,10|6,55", "6,10|2,45|8,55", "1,50|3,25|4,75", "4,30|2,25|6,55", "5,15|1,60|6,75", "3,40|4,35|7,75", "2,20|5,45|7,65", "6,35|1,20|7,55", "4,10|3,55|7,65", "5,25|2,40|7,65", "3,50|1,25|4,75", "2,15|4,60|6,75", "6,40|2,35|8,75", "1,35|5,40|6,75", "4,50|3,25|7,75"],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 0.1).toFixed(2).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) - 0.1).toFixed(2).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 1.0).toFixed(2).replace('.', ',')}`,
    ],
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // g4-u16-21 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u16-21', subtopicId: 'u16-decimal-addition', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} + {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3,7|0,8|4,5", "2,6|1,7|4,3", "4,8|2,5|7,3", "5,9|1,4|7,3", "3,5|2,8|6,3", "6,7|1,6|8,3", "4,9|3,4|8,3", "2,8|1,5|4,3", "5,6|2,7|8,3", "3,8|1,9|5,7", "4,7|2,6|7,3", "6,5|1,8|8,3", "2,9|3,6|6,5", "5,8|1,7|7,5", "3,6|2,9|6,5", "4,5|1,8|6,3", "6,8|2,5|9,3", "1,9|3,7|5,6"],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 0.1).toFixed(1).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) - 0.1).toFixed(1).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) - 1.0).toFixed(1).replace('.', ',')}`,
    ],
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // g4-u16-22 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u16-22', subtopicId: 'u16-decimal-addition', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} + {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5,46|1,32|6,78", "4,23|2,54|6,77", "3,51|4,26|7,77", "6,14|2,63|8,77", "2,35|3,42|5,77", "5,21|3,47|8,68", "4,16|2,52|6,68", "3,44|1,23|4,67", "6,25|2,33|8,58", "1,53|4,24|5,77", "5,32|2,45|7,77", "3,61|2,17|5,78", "4,42|3,26|7,68", "2,54|4,13|6,67", "6,31|1,47|7,78", "5,15|3,52|8,67", "3,27|2,41|5,68", "4,36|1,52|5,88"],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 0.1).toFixed(2).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) - 0.1).toFixed(2).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 0.01).toFixed(2).replace('.', ',')}`,
    ],
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // g4-u16-23 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u16-23', subtopicId: 'u16-decimal-addition', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} + {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["7,08|2,15|9,23", "4,05|3,28|7,33", "5,06|2,47|7,53", "6,09|1,34|7,43", "3,07|4,56|7,63", "8,04|1,29|9,33", "2,08|5,35|7,43", "7,05|1,48|8,53", "4,06|3,37|7,43", "5,09|2,24|7,33", "6,07|3,16|9,23", "3,08|4,25|7,33", "8,05|1,58|9,63", "2,07|6,36|8,43", "7,09|2,34|9,43", "4,08|5,25|9,33", "5,04|3,49|8,53", "6,05|2,38|8,43"],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 0.1).toFixed(2).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) - 0.1).toFixed(2).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 1.0).toFixed(2).replace('.', ',')}`,
    ],
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // g4-u16-24 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u16-24', subtopicId: 'u16-decimal-addition', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} + {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12,5|3,75|16,25", "10,4|2,65|13,05", "14,5|1,85|16,35", "11,6|3,45|15,05", "13,2|2,95|16,15", "15,5|4,65|20,15", "12,8|1,35|14,15", "10,5|5,75|16,25", "14,2|3,95|18,15", "11,5|2,85|14,35", "13,6|1,75|15,35", "15,2|3,95|19,15", "12,4|4,75|17,15", "10,8|2,45|13,25", "14,6|2,55|17,15", "11,2|5,95|17,15", "13,5|3,65|17,15", "15,4|2,85|18,25"],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 0.1).toFixed(2).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) - 0.1).toFixed(2).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) - 1.0).toFixed(2).replace('.', ',')}`,
    ],
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // g4-u16-25 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u16-25', subtopicId: 'u16-decimal-subtraction', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} − {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5,8|2,3|3,5", "6,7|3,4|3,3", "7,9|4,5|3,4", "8,6|2,1|6,5", "4,9|1,6|3,3", "9,7|5,2|4,5", "5,6|2,4|3,2", "7,8|3,5|4,3", "6,9|1,7|5,2", "8,5|3,2|5,3", "4,7|2,3|2,4", "9,8|4,6|5,2", "5,9|3,1|2,8", "7,6|2,5|5,1", "6,8|4,4|2,4", "8,7|5,3|3,4", "4,8|1,5|3,3", "9,5|6,2|3,3"],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 0.1).toFixed(1).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) - 0.1).toFixed(1).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 1.0).toFixed(1).replace('.', ',')}`,
    ],
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // g4-u16-26 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u16-26', subtopicId: 'u16-decimal-subtraction', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} − {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["7,65|3,20|4,45", "8,75|4,30|4,45", "6,55|2,15|4,40", "9,85|5,40|4,45", "5,60|1,20|4,40", "7,90|3,45|4,45", "8,65|2,25|6,40", "6,75|3,35|3,40", "9,55|4,15|5,40", "5,80|2,40|3,40", "7,70|1,25|6,45", "8,95|3,50|5,45", "6,85|2,45|4,40", "9,60|4,20|5,40", "5,75|3,30|2,45", "7,85|2,40|5,45", "8,50|1,10|7,40", "6,90|3,45|3,45"],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 0.1).toFixed(2).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) - 0.1).toFixed(2).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) - 1.0).toFixed(2).replace('.', ',')}`,
    ],
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // g4-u16-27 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u16-27', subtopicId: 'u16-decimal-subtraction', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} − {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4,2|1,7|2,5", "5,3|2,8|2,5", "6,1|3,6|2,5", "7,4|4,9|2,5", "8,2|3,7|4,5", "5,1|1,6|3,5", "6,4|2,9|3,5", "7,3|3,8|3,5", "8,1|4,6|3,5", "9,2|5,7|3,5", "4,1|1,8|2,3", "5,2|2,9|2,3", "6,3|3,7|2,6", "7,1|2,8|4,3", "8,4|5,9|2,5", "9,3|4,8|4,5", "4,3|1,9|2,4", "5,4|3,8|1,6"],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 0.1).toFixed(1).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) - 0.1).toFixed(1).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 1.0).toFixed(1).replace('.', ',')}`,
    ],
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // g4-u16-28 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u16-28', subtopicId: 'u16-decimal-subtraction', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} − {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["9,84|4,31|5,53", "8,76|3,24|5,52", "7,68|2,15|5,53", "6,95|1,42|5,53", "5,87|2,34|3,53", "8,96|3,43|5,53", "7,85|4,32|3,53", "9,76|2,23|7,53", "6,88|1,35|5,53", "8,67|3,14|5,53", "7,94|2,41|5,53", "5,78|1,25|4,53", "9,65|4,12|5,53", "8,89|3,36|5,53", "6,77|2,24|4,53", "7,59|1,26|6,33", "8,78|4,25|4,53", "9,94|3,41|6,53"],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 0.1).toFixed(2).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) - 0.1).toFixed(2).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 0.01).toFixed(2).replace('.', ',')}`,
    ],
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // g4-u16-29 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u16-29', subtopicId: 'u16-decimal-subtraction', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} − {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["6,00|2,45|3,55", "5,00|1,35|3,65", "7,00|3,25|3,75", "8,00|4,15|3,85", "4,00|1,65|2,35", "9,00|5,45|3,55", "6,00|3,20|2,80", "5,00|2,75|2,25", "7,00|2,85|4,15", "8,00|3,65|4,35", "4,00|2,25|1,75", "9,00|4,85|4,15", "6,00|1,75|4,25", "5,00|3,40|1,60", "7,00|4,35|2,65", "8,00|2,55|5,45", "4,00|1,85|2,15", "9,00|3,75|5,25"],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 0.1).toFixed(2).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) - 0.1).toFixed(2).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) - 1.0).toFixed(2).replace('.', ',')}`,
    ],
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // g4-u16-30 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u16-30', subtopicId: 'u16-decimal-subtraction', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} − {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["15,5|7,85|7,65", "14,3|6,75|7,55", "16,2|8,45|7,75", "12,4|5,65|6,75", "13,1|4,85|8,25", "17,5|9,65|7,85", "15,2|8,75|6,45", "14,6|5,95|8,65", "16,4|7,85|8,55", "12,5|4,95|7,55", "13,3|6,75|6,55", "17,2|8,65|8,55", "15,4|6,85|8,55", "14,1|7,65|6,45", "16,5|9,75|6,75", "12,3|5,85|6,45", "13,5|8,95|4,55", "17,4|7,75|9,65"],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 0.1).toFixed(2).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) - 0.1).toFixed(2).replace('.', ',')}`,
      `${(parseFloat(ctx.vars.ans.replace(',', '.')) + 1.0).toFixed(2).replace('.', ',')}`,
    ],
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),
];
