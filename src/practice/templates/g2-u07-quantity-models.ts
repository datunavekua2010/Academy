import { defineTemplate, QuestionTemplate } from './types';

/**
 * Grade 2 — Unit 07: რაოდენობის მოდელები (Quantity Models)
 *
 * Covers 6 subtopics (60 templates total: Q01–Q30 core, Q31–Q60 review):
 *   U07.1 — რიცხვის ამოცნობა მოდელიდან (u07-number-from-model)
 *   U07.2 — მოდელის შექმნა მოცემული რიცხვისთვის (u07-model-from-number)
 *   U07.3 — გაფერადებული ნაწილის რაოდენობა (u07-shaded-part-number)
 *   U07.4 — დაჯგუფება ათეულებად და ერთეულებად (u07-grouping-tens-ones)
 *   U07.5 — შეკრება მოდელების გამოყენებით (u07-adding-with-models)
 *   U07.6 — საჭირო რაოდენობის პოვნა (u07-required-quantity)
 */

export const G2_U07_SUBTOPICS = [
  'u07-number-from-model',
  'u07-model-from-number',
  'u07-shaded-part-number',
  'u07-grouping-tens-ones',
  'u07-adding-with-models',
  'u07-required-quantity',
] as const;

export type G2U07SubtopicId = (typeof G2_U07_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G2U07SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 2 as const,
  topicId: 'g2-raodenobis-modelebi' as const,
  unitId: 'g2-raodenobis-modelebi' as const,
  ...options,
});

/** Helper to generate distinct integer distractors near an answer. */
export function nearMisses(answer: number, count = 3, min = 0, step = 1): number[] {
  const result = new Set<number>();
  const deltas = [step, -step, 2 * step, -2 * step, 3 * step, -3 * step, 10, -10, 5, -5];
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

/** Helper to repeat emojis with spaces. */
export const repeatEmoji = (emoji: string, count: number): string =>
  count <= 0 ? '' : Array.from({ length: count }, () => emoji).join(' ');

/** Helper to generate dot grids. */
export const createDotGrid = (rows: number, cols: number, dot = '🔵'): string => {
  const line = Array.from({ length: cols }, () => dot).join(' ');
  return Array.from({ length: rows }, () => line).join('\n');
};

/** Helper to generate shaded grids (10 or 20 blocks). */
export const createShadedGrid = (
  shaded: number,
  total: number,
  shadedIcon = '🟩',
  emptyIcon = '⬜',
): string => {
  const shadedPart = Array.from({ length: shaded }, () => shadedIcon);
  const emptyPart = Array.from({ length: Math.max(0, total - shaded) }, () => emptyIcon);
  const all = [...shadedPart, ...emptyPart];
  if (total === 20) {
    return all.slice(0, 10).join(' ') + '\n' + all.slice(10).join(' ');
  }
  return all.join(' ');
};

export const G2_U07_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U07.1 — რიცხვის ამოცნობა მოდელიდან (Q01–Q06)
  // =========================================================================

  // Q01 — დაითვალე ობიექტები (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-01', subtopicId: 'u07-number-from-model', difficulty: 1 }),
    prompt: '{displayRow}\n\nრამდენი {itemName}-ია გამოსახული?',
    variables: {
      count: { kind: 'int', min: 3, max: 18 },
      itemIdx: { kind: 'choice', values: ['0', '1', '2', '3', '4'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const c = Number(v.count);
          const idx = Number(v.itemIdx);
          const items = [
            { name: 'ვაშლი', emoji: '🍎' },
            { name: 'ვარსკვლავი', emoji: '⭐' },
            { name: 'ბუშტი', emoji: '🎈' },
            { name: 'ყვავილი', emoji: '🌸' },
            { name: 'კანფეტი', emoji: '🍬' },
          ];
          const it = items[idx];
          const display = repeatEmoji(it.emoji, c);
          return [`${it.name};${display}`];
        },
      },
      itemName: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      displayRow: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.count),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `გამოსახულია ${answer} ${vars.itemName}.`,
  }),

  // Q02 — ამოიცანი რაოდენობა ათეულებისა და ერთეულების მოდელით (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-02', subtopicId: 'u07-number-from-model', difficulty: 1 }),
    prompt:
      'მოდელზე გამოსახულია {tens} ათეული (ღერო) და {ones} ერთეული (კუბი).\n\n' +
      'რომელი რიცხვია გამოსახული?',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      ones: { kind: 'int', min: 1, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const correct = t * 10 + o;
          const w1 = o * 10 + t;
          const w2 = t * 10;
          const w3 = t + o;
          return [`${correct};${w1};${w2};${w3}`];
        },
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 10 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.tens} ათეული არის ${Number(vars.tens) * 10}, ხოლო ${vars.ones} ერთეულის დამატებით მიიღება ${answer}.`,
  }),

  // Q03 — ამოიცანი წერტილების რაოდენობა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-03', subtopicId: 'u07-number-from-model', difficulty: 1 }),
    prompt:
      '{grid}\n\n' +
      'წერტილები დალაგებულია {rows} რიგად, თითოეულ რიგში {cols} წერტილით.\n\n' +
      'რამდენია წერტილების საერთო რაოდენობა?',
    variables: {
      rows: { kind: 'int', min: 2, max: 5 },
      cols: { kind: 'int', min: 2, max: 7 },
      grid: {
        kind: 'choice',
        values: (v) => [createDotGrid(Number(v.rows), Number(v.cols), '🔵')],
      },
    },
    answer: (v) => Number(v.rows) * Number(v.cols),
    format: { kind: 'integer', min: 4 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) =>
      `${vars.rows} რიგი × ${vars.cols} წერტილი = ${answer} წერტილი.`,
  }),

  // Q04 — შეადარე მოდელი და რიცხვი (Level 2, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u07-04', subtopicId: 'u07-number-from-model', difficulty: 2 }),
    prompt:
      '{modelRow}\n\n' +
      'მოდელში გამოსახულია {a} ვარსკვლავი.\n\n' +
      'შეადარე: {a}  ❓  {b}\n\n' +
      'რომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      a: { kind: 'int', min: 7, max: 20 },
      mode: { kind: 'choice', values: ['lt', 'gt', 'eq'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const m = String(v.mode);
          let b = a;
          if (m === 'lt') b = a + 3;
          else if (m === 'gt') b = a - 3;
          const row = repeatEmoji('⭐', a);
          return [`${b};${row}`];
        },
      },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      modelRow: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => (Number(v.a) > Number(v.b) ? '>' : Number(v.a) < Number(v.b) ? '<' : '='),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  // Q05 — რომელი მოდელი აჩვენებს უდიდეს რაოდენობას? (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-05', subtopicId: 'u07-number-from-model', difficulty: 2 }),
    prompt:
      'რომელი მოდელი აჩვენებს უდიდეს რაოდენობას?\n\n' +
      '• მოდელი A: {countA} წრე\n' +
      '• მოდელი B: {countB} წრე\n' +
      '• მოდელი C: {countC} წრე',
    variables: {
      base: { kind: 'int', min: 8, max: 25 },
      winner: { kind: 'choice', values: ['მოდელი A', 'მოდელი B', 'მოდელი C'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const w = String(v.winner);
          let cA = b;
          let cB = b + 3;
          let cC = b + 6;
          if (w === 'მოდელი A') {
            cA = b + 10;
            cB = b + 2;
            cC = b + 5;
          } else if (w === 'მოდელი B') {
            cA = b + 2;
            cB = b + 10;
            cC = b + 5;
          } else {
            cA = b + 2;
            cB = b + 5;
            cC = b + 10;
          }
          return [`${cA};${cB};${cC}`];
        },
      },
      countA: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      countB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      countC: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    optionCount: 3,
    options: () => ['მოდელი A', 'მოდელი B', 'მოდელი C'],
    answer: (v) => String(v.winner),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => {
      const maxVal = Math.max(Number(vars.countA), Number(vars.countB), Number(vars.countC));
      return `უდიდესი რაოდენობაა ${maxVal}, რომელსაც აჩვენებს ${answer}.`;
    },
  }),

  // Q06 — ამოიცანი რაოდენობა რამდენიმე პირობით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-06', subtopicId: 'u07-number-from-model', difficulty: 3 }),
    prompt:
      'მოდელში გამოსახულია {tens} ათეული და {ones} ერთეული.\n\n' +
      'რომელია გამოსახული რიცხვი, თუ ის {bound}-ზე მეტია და ლუწია?',
    variables: {
      tens: { kind: 'int', min: 3, max: 7 },
      evOnes: { kind: 'choice', values: ['2', '4', '6', '8'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.evOnes);
          const correct = t * 10 + o;
          const bound = t * 10 - 2;
          const w1 = (t - 1) * 10 + o;
          const w2 = t * 10 + ((o + 1) % 10);
          const w3 = (t + 1) * 10 + o;
          return [`${o};${bound};${correct};${w1};${w2};${w3}`];
        },
      },
      ones: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      bound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 10 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.tens} ათეული და ${vars.ones} ერთეული ქმნის რიცხვს ${answer}, რომელიც ლუწია და მეტია ${vars.bound}-ზე.`,
  }),

  // =========================================================================
  // U07.2 — მოდელის შექმნა მოცემული რიცხვისთვის (Q07–Q12)
  // =========================================================================

  // Q07 — აირჩიე შესაბამისი მოდელი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-07', subtopicId: 'u07-model-from-number', difficulty: 1 }),
    prompt:
      'წარმოადგინე რიცხვი {target}.\n\n' +
      'რომელი მოდელი შეესაბამება ამ რიცხვს?\n\n' +
      '• მოდელი A: {countA} წრე\n' +
      '• მოდელი B: {countB} წრე\n' +
      '• მოდელი C: {countC} წრე\n' +
      '• მოდელი D: {countD} წრე',
    variables: {
      target: { kind: 'int', min: 6, max: 20 },
      winner: { kind: 'choice', values: ['მოდელი A', 'მოდელი B', 'მოდელი C', 'მოდელი D'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.target);
          const w = String(v.winner);
          let cA = t - 2;
          let cB = t - 1;
          let cC = t + 1;
          let cD = t + 2;
          if (w === 'მოდელი A') cA = t;
          else if (w === 'მოდელი B') cB = t;
          else if (w === 'მოდელი C') cC = t;
          else if (w === 'მოდელი D') cD = t;
          return [`${cA};${cB};${cC};${cD}`];
        },
      },
      countA: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      countB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      countC: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      countD: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    optionCount: 4,
    options: () => ['მოდელი A', 'მოდელი B', 'მოდელი C', 'მოდელი D'],
    answer: (v) => String(v.winner),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => `${answer} შეიცავს ზუსტად ${vars.target} წრეს.`,
  }),

  // Q08 — წარმოადგინე რიცხვი ათეულებითა და ერთეულებით (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-08', subtopicId: 'u07-model-from-number', difficulty: 1 }),
    prompt:
      'მოცემულია რიცხვი {num}.\n\n' +
      'აირჩიე ამ რიცხვის სწორი წარმოდგენა ათეულებითა და ერთეულებით:',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      ones: { kind: 'int', min: 1, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const num = t * 10 + o;
          const correct = `${t} ათეული და ${o} ერთეული`;
          const w1 = `${o} ათეული და ${t} ერთეული`;
          const w2 = `${t} ათეული და 0 ერთეული`;
          const w3 = `${t + 1} ათეული და ${o} ერთეული`;
          return [`${num};${correct};${w1};${w2};${w3}`];
        },
      },
      num: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${vars.num} = ${answer}.`,
  }),

  // Q09 — დააკავშირე რიცხვი და მოდელი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-09', subtopicId: 'u07-model-from-number', difficulty: 2 }),
    prompt:
      'დააკავშირე რიცხვები შესაბამის მოდელებთან:\n\n' +
      '{n1}, {n2}, {n3}\n\n' +
      'რომელ ვარიანტშია სწორი შესაბამისობა?',
    variables: {
      t: { kind: 'int', min: 1, max: 7 },
      onesOffset: { kind: 'choice', values: ['0', '1', '2'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.t);
          const off = Number(v.onesOffset);
          const n1 = t * 10 + 2 + off;
          const n2 = (t + 1) * 10 + 1 + off;
          const n3 = (t + 2) * 10 + 5 + off;
          const m1 = `${t} ათ. ${2 + off} ერთ.`;
          const m2 = `${t + 1} ათ. ${1 + off} ერთ.`;
          const m3 = `${t + 2} ათ. ${5 + off} ერთ.`;
          const correct = `${n1} → ${m1} | ${n2} → ${m2} | ${n3} → ${m3}`;
          const w1 = `${n1} → ${m2} | ${n2} → ${m1} | ${n3} → ${m3}`;
          const w2 = `${n1} → ${m3} | ${n2} → ${m2} | ${n3} → ${m1}`;
          const w3 = `${n1} → ${m1} | ${n2} → ${m3} | ${n3} → ${m2}`;
          return [`${n1};${n2};${n3};${correct};${w1};${w2};${w3}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `სწორი შესაბამისობაა: ${answer}.`,
  }),

  // Q10 — შეარჩიე მოდელი პირობის მიხედვით (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-10', subtopicId: 'u07-model-from-number', difficulty: 2 }),
    prompt:
      'შეარჩიე მოდელი, რომელიც {minBound}-ზე მეტსა და {maxBound}-ზე ნაკლებ რაოდენობას წარმოადგენს:\n\n' +
      '• მოდელი A: {countA} ობიექტი\n' +
      '• მოდელი B: {countB} ობიექტი\n' +
      '• მოდელი C: {countC} ობიექტი\n' +
      '• მოდელი D: {countD} ობიექტი',
    variables: {
      tens: { kind: 'int', min: 2, max: 7 },
      off: { kind: 'int', min: 2, max: 8 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const off = Number(v.off);
          const minB = t * 10;
          const maxB = (t + 1) * 10;
          const target = minB + off;
          const below = minB - 2;
          const equalMax = maxB;
          const above = maxB + 3;
          return [`${minB};${maxB};${below};${target};${equalMax};${above}`];
        },
      },
      minBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      maxBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      countA: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      countB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      countC: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      countD: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    optionCount: 4,
    options: () => ['მოდელი A', 'მოდელი B', 'მოდელი C', 'მოდელი D'],
    answer: () => 'მოდელი B',
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `${answer} შეიცავს ${vars.countB} ობიექტს, რაც მოთავსებულია ${vars.minBound}-სა და ${vars.maxBound}-ს შორის.`,
  }),

  // Q11 — წარმოადგინე ერთი რიცხვი სხვადასხვა გზით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-11', subtopicId: 'u07-model-from-number', difficulty: 3 }),
    prompt:
      'რომელი ჩანაწერი წარმოადგენს რიცხვ {num}-ს?\n\n' +
      'გაითვალისწინე გადაჯგუფების შესაძლებლობა.',
    variables: {
      tens: { kind: 'int', min: 2, max: 6 },
      ones: { kind: 'int', min: 1, max: 8 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const num = t * 10 + o;
          const correct = `${t - 1} ათეული და ${o + 10} ერთეული`;
          const w1 = `${t} ათეული და ${o + 10} ერთეული`;
          const w2 = `${t - 1} ათეული და ${o} ერთეული`;
          const w3 = `${t + 1} ათეული და ${o + 10} ერთეული`;
          return [`${num};${correct};${w1};${w2};${w3}`];
        },
      },
      num: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${answer} = ${vars.num}.`,
  }),

  // Q12 — შეავსე მოდელის აღწერა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-12', subtopicId: 'u07-model-from-number', difficulty: 3 }),
    prompt:
      'რიცხვი {num} წარმოდგენილია {tens} ათეულითა და ❓ ერთეულით.\n\n' +
      'რა რიცხვი უნდა ეწეროს ❓-ის ნაცვლად?',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      ones: { kind: 'int', min: 1, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.tens) * 10 + Number(v.ones))],
      },
      num: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.ones),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 1),
    explanation: ({ vars, answer }) =>
      `${vars.num}-ში არის ${vars.tens} ათეული და ${answer} ერთეული.`,
  }),

  // =========================================================================
  // U07.3 — გაფერადებული ნაწილის რაოდენობა (Q13–Q18)
  // =========================================================================

  // Q13 — დაითვალე გაფერადებული უჯრები (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-13', subtopicId: 'u07-shaded-part-number', difficulty: 1 }),
    prompt: '{gridRow}\n\n10 უჯრიდან რამდენი უჯრაა გაფერადებული ({icon})?',
    variables: {
      k: { kind: 'int', min: 1, max: 9 },
      icon: { kind: 'choice', values: ['🟩', '🟦', '🟧'] },
      gridRow: {
        kind: 'choice',
        values: (v) => [createShadedGrid(Number(v.k), 10, String(v.icon), '⬜')],
      },
    },
    answer: (v) => Number(v.k),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ answer }) => `გაფერადებულია ${answer} უჯრა 10-დან.`,
  }),

  // Q14 — აირჩიე გაფერადებული რაოდენობა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-14', subtopicId: 'u07-shaded-part-number', difficulty: 1 }),
    prompt:
      '{circlesRow}\n\n' +
      'სულ გამოსახულია {total} წრე. რამდენი წრეა გაფერადებული (🔵)?',
    variables: {
      total: { kind: 'int', min: 10, max: 15 },
      shaded: { kind: 'int', min: 3, max: 9 },
      circlesRow: {
        kind: 'choice',
        values: (v) => [createShadedGrid(Number(v.shaded), Number(v.total), '🔵', '⚪')],
      },
    },
    answer: (v) => Number(v.shaded),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => {
      const s = Number(vars.shaded);
      const tot = Number(vars.total);
      return [tot - s, s + 1, s - 1];
    },
    explanation: ({ vars, answer }) => `გაფერადებულია ${answer} წრე ${vars.total}-დან.`,
  }),

  // Q15 — რამდენი უჯრა არ არის გაფერადებული? (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-15', subtopicId: 'u07-shaded-part-number', difficulty: 2 }),
    prompt:
      '{grid}\n\n' +
      'სულ {total} უჯრაა, მათგან {shaded} გაფერადებულია ({icon}).\n\n' +
      'რამდენი უჯრა არ არის გაფერადებული (⬜)?',
    variables: {
      total: { kind: 'choice', values: ['10', '20'] },
      offset: { kind: 'int', min: 1, max: 8 },
      icon: { kind: 'choice', values: ['🟩', '🟦', '🟧'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const tot = Number(v.total);
          const off = Number(v.offset);
          const icon = String(v.icon);
          const shaded = tot === 10 ? off : off + 5;
          const unshaded = tot - shaded;
          const grid = createShadedGrid(shaded, tot, icon, '⬜');
          return [`${shaded};${unshaded};${grid}`];
        },
      },
      shaded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      unshaded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      grid: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.unshaded),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [Number(vars.shaded), Number(vars.unshaded) + 2, Number(vars.unshaded) - 2],
    explanation: ({ vars, answer }) =>
      `${vars.total} − ${vars.shaded} = ${answer} გაუფერადებელი უჯრა.`,
  }),

  // Q16 — შეადარე გაფერადებული რაოდენობები (Level 2, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u07-16', subtopicId: 'u07-shaded-part-number', difficulty: 2 }),
    prompt:
      'მოცემულია ორი მოდელი:\n\n' +
      '• მოდელი A: {sA} გაფერადებული უჯრა\n' +
      '• მოდელი B: {sB} გაფერადებული უჯრა\n\n' +
      'შეადარე: {sA}  ❓  {sB}\n\n' +
      'რომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      sA: { kind: 'int', min: 4, max: 18 },
      mode: { kind: 'choice', values: ['lt', 'gt', 'eq'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.sA);
          const m = String(v.mode);
          let b = a;
          if (m === 'lt') b = a + 3;
          else if (m === 'gt') b = a - 3;
          return [String(b)];
        },
      },
      sB: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => (Number(v.sA) > Number(v.sB) ? '>' : Number(v.sA) < Number(v.sB) ? '<' : '='),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => `${vars.sA} ${answer} ${vars.sB}.`,
  }),

  // Q17 — იპოვე გაფერადებული რაოდენობა პირობებით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-17', subtopicId: 'u07-shaded-part-number', difficulty: 3 }),
    prompt:
      'მოდელში სულ 20 უჯრაა.\n\n' +
      'გაფერადებული უჯრების რაოდენობა {minBound}-ზე მეტია და {maxBound}-ზე ნაკლებია.\n\n' +
      'აირჩიე შესაბამისი რაოდენობა:',
    variables: {
      minBound: { kind: 'int', min: 4, max: 14 },
      targetOffset: { kind: 'choice', values: ['1', '2', '3'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const minB = Number(v.minBound);
          const off = Number(v.targetOffset);
          const maxB = minB + 5;
          const target = minB + off;
          const below = minB - 2;
          const equalMin = minB;
          const above = maxB + 1;
          return [`${maxB};${target};${below};${equalMin};${above}`];
        },
      },
      maxBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      target: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.target),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.minBound} < ${answer} < ${vars.maxBound}.`,
  }),

  // Q18 — შეავსე გაფერადებული მოდელი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-18', subtopicId: 'u07-shaded-part-number', difficulty: 3 }),
    prompt:
      'მოდელში სულ {total} უჯრაა. მათგან {shaded} გაფერადებულია.\n\n' +
      'რამდენი უჯრის გაფერადებაა დარჩენილი, რომ ყველა უჯრა გაფერადდეს?',
    variables: {
      total: { kind: 'int', min: 20, max: 40 },
      diff: { kind: 'int', min: 5, max: 15 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const tot = Number(v.total);
          const d = Number(v.diff);
          const shaded = tot - d;
          return [`${shaded};${d}`];
        },
      },
      shaded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      remain: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.remain),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.total} − ${vars.shaded} = ${answer} დარჩენილი უჯრა.`,
  }),

  // =========================================================================
  // U07.4 — დაჯგუფება ათეულებად და ერთეულებად (Q19–Q24)
  // =========================================================================

  // Q19 — რამდენი ათეული და ერთეულია? (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-19', subtopicId: 'u07-grouping-tens-ones', difficulty: 1 }),
    prompt:
      'მოცემულია რიცხვი {num}.\n\n' +
      'მიუთითე ათეულებისა და ერთეულების სწორი რაოდენობა:',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      ones: { kind: 'int', min: 1, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const num = t * 10 + o;
          const correct = `${t} ათეული და ${o} ერთეული`;
          const w1 = `${o} ათეული და ${t} ერთეული`;
          const w2 = `${t} ათეული და 0 ერთეული`;
          const w3 = `${t - 1} ათეული და ${o} ერთეული`;
          return [`${num};${correct};${w1};${w2};${w3}`];
        },
      },
      num: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${vars.num}-ში არის ${answer}.`,
  }),

  // Q20 — დააჯგუფე ობიექტები ათეულებად (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-20', subtopicId: 'u07-grouping-tens-ones', difficulty: 1 }),
    prompt:
      'მოცემულია {num} ცალი ერთეული კუბიკი.\n\n' +
      'დააჯგუფე ისინი ათეულებად და დარჩენილ ერთეულებად:',
    variables: {
      tens: { kind: 'int', min: 2, max: 7 },
      ones: { kind: 'int', min: 1, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const num = t * 10 + o;
          const correct = `${t} ათეული და ${o} ერთეული`;
          const w1 = `${t + 1} ათეული და ${o} ერთეული`;
          const w2 = `${t} ათეული და ${o + 2} ერთეული`;
          const w3 = `${o} ათეული და ${t} ერთეული`;
          return [`${num};${correct};${w1};${w2};${w3}`];
        },
      },
      num: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${vars.num} კუბიკი = ${answer}.`,
  }),

  // Q21 — წარმოადგინე რიცხვი დაშლილი სახით (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-21', subtopicId: 'u07-grouping-tens-ones', difficulty: 2 }),
    prompt:
      'აირჩიე რიცხვი {num}-ის სწორი დაშლა სრული ათეულისა და ერთეულების ჯამის სახით:\n\n' +
      '{num} = ❓',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      ones: { kind: 'int', min: 1, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const num = t * 10 + o;
          const correct = `${t * 10} + ${o}`;
          const w1 = `${t} + ${o}`;
          const w2 = `${t * 10} + ${o * 10}`;
          const w3 = `${o * 10} + ${t}`;
          return [`${num};${correct};${w1};${w2};${w3}`];
        },
      },
      num: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${vars.num} = ${answer}.`,
  }),

  // Q22 — იპოვე გამოტოვებული ერთეულები (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-22', subtopicId: 'u07-grouping-tens-ones', difficulty: 2 }),
    prompt:
      'რიცხვი შედგება {tens} ათეულისა და ❓ ერთეულისგან.\n\n' +
      'ეს რიცხვი არის {num}. რამდენი ერთეულია?',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      ones: { kind: 'int', min: 1, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.tens) * 10 + Number(v.ones))],
      },
      num: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.ones),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 1),
    explanation: ({ vars, answer }) =>
      `${vars.tens} ათეული და ${answer} ერთეული = ${vars.num}.`,
  }),

  // Q23 — შეადარე ორი დაჯგუფება (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-23', subtopicId: 'u07-grouping-tens-ones', difficulty: 3 }),
    prompt:
      'ორი მოდელი სხვადასხვა გზით წარმოადგენს რაოდენობებს:\n\n' +
      '• მოდელი A: {tA} ათეული და {oA} ერთეული\n' +
      '• მოდელი B: {tB} ათეული და {oB} ერთეული\n\n' +
      'რომელი მოდელი აჩვენებს მეტ ობიექტს?',
    variables: {
      base: { kind: 'int', min: 2, max: 8 },
      rel: { kind: 'choice', values: ['greater', 'less', 'equal'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const rel = String(v.rel);
          const tA = b;
          const oA = 4;
          const tB = b - 1;
          let oB = 14;
          let ans = 'ორივე ტოლია';
          if (rel === 'greater') {
            oB = 11;
            ans = 'მოდელი A';
          } else if (rel === 'less') {
            oB = 18;
            ans = 'მოდელი B';
          }
          const valA = tA * 10 + oA;
          const valB = tB * 10 + oB;
          return [`${tA};${oA};${tB};${oB};${valA};${valB};${ans}`];
        },
      },
      tA: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      oA: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      tB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      oB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      valA: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      valB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
    },
    optionCount: 3,
    options: () => ['მოდელი A', 'მოდელი B', 'ორივე ტოლია'],
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `მოდელი A = ${vars.valA}, ხოლო მოდელი B = ${vars.valB}. სწორი პასუხია: ${answer}.`,
  }),

  // Q24 — იპოვე საჭირო დაჯგუფება (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-24', subtopicId: 'u07-grouping-tens-ones', difficulty: 3 }),
    prompt:
      'მოცემულია {num} ობიექტი.\n\n' +
      'აირჩიე ამ რაოდენობის სწორი დაჯგუფება ათეულებად და ერთეულებად:',
    variables: {
      tens: { kind: 'int', min: 4, max: 9 },
      ones: { kind: 'int', min: 2, max: 8 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const num = t * 10 + o;
          const correct = `${t} ათეული და ${o} ერთეული`;
          const w1 = `${t} ათეული და ${o + 10} ერთეული`;
          const w2 = `${o} ათეული და ${t} ერთეული`;
          const w3 = `${t - 1} ათეული და ${o} ერთეული`;
          return [`${num};${correct};${w1};${w2};${w3}`];
        },
      },
      num: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${vars.num} = ${answer}.`,
  }),

  // =========================================================================
  // U07.5 — შეკრება მოდელების გამოყენებით (Q25–Q30)
  // =========================================================================

  // Q25 — შეკრება ობიექტების დათვლით (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-25', subtopicId: 'u07-adding-with-models', difficulty: 1 }),
    prompt:
      '{rowA}  და  {rowB}\n\n' +
      'გამოსახულია {a} ვაშლი და {b} ვაშლი.\n\n' +
      'რამდენია მათი საერთო რაოდენობა?',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      b: { kind: 'int', min: 2, max: 8 },
      rowA: { kind: 'choice', values: (v) => [repeatEmoji('🍎', Number(v.a))] },
      rowB: { kind: 'choice', values: (v) => [repeatEmoji('🍎', Number(v.b))] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q26 — შეკრება ათეულებისა და ერთეულების მოდელით (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-26', subtopicId: 'u07-adding-with-models', difficulty: 1 }),
    prompt:
      'მოდელზე შეკრიბე ორნიშნა რიცხვები:\n\n' +
      '({t1} ათეული და {o1} ერთეული) + ({t2} ათეული და {o2} ერთეული)\n\n' +
      'რას უდრის მიღებული ჯამი?',
    variables: {
      t1: { kind: 'int', min: 1, max: 4 },
      t2: { kind: 'int', min: 1, max: 4 },
      o1: { kind: 'int', min: 1, max: 4 },
      o2: { kind: 'int', min: 1, max: 4 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.t1) * 10 + Number(v.o1);
          const b = Number(v.t2) * 10 + Number(v.o2);
          const sum = a + b;
          return [String(sum)];
        },
      },
      sum: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.sum),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => {
      const a = Number(vars.t1) * 10 + Number(vars.o1);
      const b = Number(vars.t2) * 10 + Number(vars.o2);
      return `${a} + ${b} = ${answer}.`;
    },
  }),

  // Q27 — შეკრება ბადის მოდელით (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-27', subtopicId: 'u07-adding-with-models', difficulty: 2 }),
    prompt:
      'უჯრების ბადეში პირველ ჯგუფში არის {a} უჯრა, ხოლო მეორე ჯგუფში — {b} უჯრა.\n\n' +
      'რამდენია ორივე ჯგუფის საერთო ჯამი?',
    variables: {
      a: { kind: 'int', min: 11, max: 25 },
      b: { kind: 'int', min: 8, max: 20 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q28 — შეავსე გამოტოვებული რაოდენობა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-28', subtopicId: 'u07-adding-with-models', difficulty: 2 }),
    prompt:
      'მოდელი აჩვენებს {have} ობიექტს. ჯამი უნდა იყოს {target}.\n\n' +
      'რამდენი ობიექტი უნდა დაემატოს?',
    variables: {
      have: { kind: 'int', min: 12, max: 35 },
      add: { kind: 'int', min: 6, max: 18 },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.have) + Number(v.add))],
      },
      target: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.add),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.target} − ${vars.have} = ${answer}.`,
  }),

  // Q29 — შეკრება ათეულის გადაჯგუფებით (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-29', subtopicId: 'u07-adding-with-models', difficulty: 3 }),
    prompt:
      'მოდელზე შეკრიბე: {t1} ათეული და {o1} ერთეული + {t2} ათეული და {o2} ერთეული.\n\n' +
      'გადააჯგუფე 10 ერთეული ერთ ათეულად. რა რიცხვი მიიღება?',
    variables: {
      t1: { kind: 'int', min: 2, max: 4 },
      t2: { kind: 'int', min: 1, max: 3 },
      o1: { kind: 'int', min: 6, max: 9 },
      o2: { kind: 'int', min: 5, max: 8 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.t1) * 10 + Number(v.o1);
          const b = Number(v.t2) * 10 + Number(v.o2);
          const sum = a + b;
          return [String(sum)];
        },
      },
      sum: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.sum),
    format: { kind: 'integer', min: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 20, 1),
    explanation: ({ vars, answer }) => {
      const a = Number(vars.t1) * 10 + Number(vars.o1);
      const b = Number(vars.t2) * 10 + Number(vars.o2);
      return `${a} + ${b} = ${answer}.`;
    },
  }),

  // Q30 — იპოვე ორი მოდელის ჯამი (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-30', subtopicId: 'u07-adding-with-models', difficulty: 3 }),
    prompt:
      'მოდელი A აჩვენებს {a} ობიექტს, ხოლო მოდელი B — {b} ობიექტს.\n\n' +
      'რამდენია ორივე მოდელის საერთო ჯამი?',
    variables: {
      a: { kind: 'int', min: 25, max: 48 },
      b: { kind: 'int', min: 18, max: 39 },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.a) + Number(v.b))],
      },
      sum: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.sum),
    format: { kind: 'integer', min: 30 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 30, 1),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // =========================================================================
  // Part B: შერეული მიმოხილვა (Q31–Q60)
  // =========================================================================

  // Q31 — დაითვალე ობიექტები ჯგუფებში (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-31', subtopicId: 'u07-number-from-model', difficulty: 1 }),
    prompt:
      'თაროზე დევს {groups} ყუთი, თითოეულში {perGroup} წიგნია.\n\n' +
      'რამდენი წიგნია სულ?',
    variables: {
      groups: { kind: 'int', min: 2, max: 6 },
      perGroup: { kind: 'int', min: 3, max: 5 },
    },
    answer: (v) => Number(v.groups) * Number(v.perGroup),
    format: { kind: 'integer', min: 6 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) =>
      `${vars.groups} × ${vars.perGroup} = ${answer} წიგნი.`,
  }),

  // Q32 — ამოიცანი რიცხვი ათეულების მოდელიდან (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-32', subtopicId: 'u07-number-from-model', difficulty: 2 }),
    prompt:
      'მოდელზე ნაჩვენებია {tens} ათეული და {ones} ერთეული.\n\n' +
      'რა რიცხვია გამოსახული?',
    variables: {
      tens: { kind: 'int', min: 3, max: 9 },
      ones: { kind: 'int', min: 0, max: 9 },
    },
    answer: (v) => Number(v.tens) * 10 + Number(v.ones),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.tens} ათეული და ${vars.ones} ერთეული = ${answer}.`,
  }),

  // Q33 — შეადარე ორი მოდელი (Level 3, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u07-33', subtopicId: 'u07-number-from-model', difficulty: 3 }),
    prompt:
      'მოდელი A შედგება {tA} ათეულისა და {oA} ერთეულისგან.\n' +
      'მოდელი B შედგება {tB} ათეულისა და {oB} ერთეულისგან.\n\n' +
      'შეადარე მოდელი A და მოდელი B:\n\n' +
      'მოდელი A  ❓  მოდელი B',
    variables: {
      tA: { kind: 'int', min: 2, max: 7 },
      oA: { kind: 'int', min: 1, max: 9 },
      delta: { kind: 'choice', values: ['-2', '0', '3'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const valA = Number(v.tA) * 10 + Number(v.oA);
          const d = Number(v.delta);
          const valB = valA + d;
          const tB = Math.floor(valB / 10);
          const oB = valB % 10;
          return [`${tB};${oB};${valA};${valB}`];
        },
      },
      tB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      oB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      valA: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      valB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => (Number(v.valA) > Number(v.valB) ? '>' : Number(v.valA) < Number(v.valB) ? '<' : '='),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `მოდელი A = ${vars.valA}, მოდელი B = ${vars.valB}. აქედან, ${vars.valA} ${answer} ${vars.valB}.`,
  }),

  // Q34 — შექმენი მოდელი მოცემული რიცხვისთვის (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-34', subtopicId: 'u07-model-from-number', difficulty: 1 }),
    prompt:
      'რომელი მოდელი შეესაბამება რიცხვ {num}-ს?\n\n' +
      'აირჩიე სწორი ვარიანტი:',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      ones: { kind: 'int', min: 1, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const num = t * 10 + o;
          const correct = `${t} ათეული და ${o} ერთეული`;
          const w1 = `${o} ათეული და ${t} ერთეული`;
          const w2 = `${t - 1} ათეული და ${o} ერთეული`;
          const w3 = `${t} ათეული და 0 ერთეული`;
          return [`${num};${correct};${w1};${w2};${w3}`];
        },
      },
      num: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${vars.num} = ${answer}.`,
  }),

  // Q35 — იპოვე მოდელი მოცემულ შუალედში (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-35', subtopicId: 'u07-model-from-number', difficulty: 2 }),
    prompt:
      'რომელი მოდელის რაოდენობაა მოთავსებული {minBound}-სა და {maxBound}-ს შორის?\n\n' +
      '• მოდელი A: {cA} ერთეული\n' +
      '• მოდელი B: {cB} ერთეული\n' +
      '• მოდელი C: {cC} ერთეული',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      winner: { kind: 'choice', values: ['მოდელი A', 'მოდელი B', 'მოდელი C'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const w = String(v.winner);
          const minB = t * 10;
          const maxB = (t + 1) * 10;
          const inside = minB + 4;
          let cA = minB - 3;
          let cB = inside;
          let cC = maxB + 3;
          if (w === 'მოდელი A') {
            cA = inside;
            cB = minB - 3;
            cC = maxB + 3;
          } else if (w === 'მოდელი C') {
            cA = minB - 3;
            cB = maxB + 3;
            cC = inside;
          }
          return [`${minB};${maxB};${cA};${cB};${cC}`];
        },
      },
      minBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      maxBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      cA: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      cB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      cC: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    optionCount: 3,
    options: () => ['მოდელი A', 'მოდელი B', 'მოდელი C'],
    answer: (v) => String(v.winner),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `${answer} აკმაყოფილებს პირობას: მოთავსებულია ${vars.minBound}-სა და ${vars.maxBound}-ს შორის.`,
  }),

  // Q36 — გადაჯგუფებული მოდელის პოვნა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-36', subtopicId: 'u07-model-from-number', difficulty: 3 }),
    prompt:
      'რიცხვი {num} წარმოდგენილია როგორც ({tens} ათეული და ❓ ერთეული).\n\n' +
      'რა რიცხვი უნდა ეწეროს ❓-ის ნაცვლად?',
    variables: {
      actualTens: { kind: 'int', min: 3, max: 6 },
      ones: { kind: 'int', min: 1, max: 8 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const at = Number(v.actualTens);
          const o = Number(v.ones);
          const num = at * 10 + o;
          const tDisplay = at - 1;
          const correctOnes = o + 10;
          return [`${num};${tDisplay};${correctOnes}`];
        },
      },
      num: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      tens: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      missingOnes: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.missingOnes),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.tens} ათეული არის ${Number(vars.tens) * 10}. ${vars.num} − ${Number(vars.tens) * 10} = ${answer} ერთეული.`,
  }),

  // Q37 — გაფერადებული უჯრები 10-იან ბადეში (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-37', subtopicId: 'u07-shaded-part-number', difficulty: 1 }),
    prompt:
      '{gridRow}\n\n' +
      '10 უჯრიდან რამდენი უჯრაა გაფერადებული ({icon})?',
    variables: {
      shaded: { kind: 'int', min: 1, max: 9 },
      icon: { kind: 'choice', values: ['🔵', '🟢', '🟡'] },
      gridRow: {
        kind: 'choice',
        values: (v) => [createShadedGrid(Number(v.shaded), 10, String(v.icon), '⚪')],
      },
    },
    answer: (v) => Number(v.shaded),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ answer }) => `გაფერადებულია ${answer} უჯრა.`,
  }),

  // Q38 — გაუფერადებელი უჯრების რაოდენობა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-38', subtopicId: 'u07-shaded-part-number', difficulty: 2 }),
    prompt:
      '{gridRow}\n\n' +
      '10 უჯრიდან {shaded} გაფერადებულია ({icon}).\n\n' +
      'რამდენი უჯრაა გაუფერადებელი (⚪)?',
    variables: {
      shaded: { kind: 'int', min: 1, max: 9 },
      icon: { kind: 'choice', values: ['🔵', '🟢', '🟣'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const s = Number(v.shaded);
          const icon = String(v.icon);
          const grid = createShadedGrid(s, 10, icon, '⚪');
          const unshaded = 10 - s;
          return [`${unshaded};${grid}`];
        },
      },
      unshaded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      gridRow: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.unshaded),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `10 − ${vars.shaded} = ${answer} გაუფერადებელი უჯრა.`,
  }),

  // Q39 — გაფერადებული ნაწილების შედარება (Level 2, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u07-39', subtopicId: 'u07-shaded-part-number', difficulty: 2 }),
    prompt:
      'მოდელ A-ში გაფერადებულია {sA} უჯრა.\n' +
      'მოდელ B-ში გაფერადებულია {sB} უჯრა.\n\n' +
      'შეადარე გაფერადებული უჯრები: {sA}  ❓  {sB}',
    variables: {
      sA: { kind: 'int', min: 3, max: 15 },
      delta: { kind: 'choice', values: ['-3', '0', '3'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.sA);
          const b = Math.max(1, a + Number(v.delta));
          return [String(b)];
        },
      },
      sB: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => (Number(v.sA) > Number(v.sB) ? '>' : Number(v.sA) < Number(v.sB) ? '<' : '='),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => `${vars.sA} ${answer} ${vars.sB}.`,
  }),

  // Q40 — გაფერადებული ნაწილი 20-იან ბადეში (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-40', subtopicId: 'u07-shaded-part-number', difficulty: 2 }),
    prompt:
      '{grid}\n\n' +
      '20 უჯრიდან რამდენი უჯრაა გაფერადებული (🟩)?',
    variables: {
      shaded: { kind: 'int', min: 5, max: 18 },
      grid: {
        kind: 'choice',
        values: (v) => [createShadedGrid(Number(v.shaded), 20, '🟩', '⬜')],
      },
    },
    answer: (v) => Number(v.shaded),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ answer }) => `20 უჯრიდან გაფერადებულია ${answer} უჯრა.`,
  }),

  // Q41 — გაფერადებული უჯრების შევსება 20-მდე (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-41', subtopicId: 'u07-shaded-part-number', difficulty: 3 }),
    prompt:
      '20 უჯრიან ბადეში გაფერადებულია {shaded} უჯრა.\n\n' +
      'კიდევ რამდენი უჯრა უნდა გაფერადდეს, რომ სულ 20-ვე უჯრა იყოს გაფერადებული?',
    variables: {
      shaded: { kind: 'int', min: 1, max: 19 },
    },
    answer: (v) => 20 - Number(v.shaded),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `20 − ${vars.shaded} = ${answer} დარჩენილი უჯრა.`,
  }),

  // Q42 — რიცხვის დაშლა ათეულებად და ერთეულებად (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-42', subtopicId: 'u07-grouping-tens-ones', difficulty: 1 }),
    prompt:
      'რამდენი ათეული და ერთეულია რიცხვ {num}-ში?',
    variables: {
      tens: { kind: 'int', min: 3, max: 8 },
      ones: { kind: 'int', min: 1, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const num = t * 10 + o;
          const correct = `${t} ათეული და ${o} ერთეული`;
          const w1 = `${o} ათეული და ${t} ერთეული`;
          const w2 = `${t} ათეული და 0 ერთეული`;
          const w3 = `${t + 1} ათეული და ${o} ერთეული`;
          return [`${num};${correct};${w1};${w2};${w3}`];
        },
      },
      num: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${vars.num} = ${answer}.`,
  }),

  // Q43 — ათეულების რაოდენობა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-43', subtopicId: 'u07-grouping-tens-ones', difficulty: 1 }),
    prompt:
      'რამდენი ათეულია რიცხვ {num}-ში?',
    variables: {
      tens: { kind: 'int', min: 2, max: 9 },
      ones: { kind: 'int', min: 0, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.tens) * 10 + Number(v.ones))],
      },
      num: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.tens),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.num}-ში არის ${answer} ათეული.`,
  }),

  // Q44 — ერთეულების რაოდენობა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-44', subtopicId: 'u07-grouping-tens-ones', difficulty: 1 }),
    prompt:
      'რამდენი ერთეულია რიცხვ {num}-ში?',
    variables: {
      tens: { kind: 'int', min: 2, max: 9 },
      ones: { kind: 'int', min: 1, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.tens) * 10 + Number(v.ones))],
      },
      num: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.ones),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 1),
    explanation: ({ vars, answer }) => `${vars.num}-ში არის ${answer} ერთეული.`,
  }),

  // Q45 — სრული ათეულებისა და ერთეულების ჯამი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-45', subtopicId: 'u07-grouping-tens-ones', difficulty: 2 }),
    prompt:
      'რომელი ჯამია {num}-ის ტოლი?',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      ones: { kind: 'int', min: 1, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const num = t * 10 + o;
          const correct = `${t * 10} + ${o}`;
          const w1 = `${t} + ${o}`;
          const w2 = `${t * 10} + ${o * 10}`;
          const w3 = `${(t - 1) * 10} + ${o}`;
          return [`${num};${correct};${w1};${w2};${w3}`];
        },
      },
      num: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${vars.num} = ${answer}.`,
  }),

  // Q46 — ექვივალენტური დაჯგუფება (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-46', subtopicId: 'u07-grouping-tens-ones', difficulty: 3 }),
    prompt:
      'რომელი გამოსახულება წარმოადგენს იგივე რიცხვს, რასაც {t} ათეული და {o} ერთეული?',
    variables: {
      t: { kind: 'int', min: 3, max: 7 },
      o: { kind: 'int', min: 2, max: 8 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.t);
          const o = Number(v.o);
          const correct = `${t - 1} ათეული და ${o + 10} ერთეული`;
          const w1 = `${t} ათეული და ${o + 10} ერთეული`;
          const w2 = `${t - 1} ათეული და ${o} ერთეული`;
          const w3 = `${t + 1} ათეული და ${o + 10} ერთეული`;
          return [`${correct};${w1};${w2};${w3}`];
        },
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.t} ათეული და ${vars.o} ერთეული = ${answer}.`,
  }),

  // Q47 — შეკრება ათეულების დამატებით (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-47', subtopicId: 'u07-adding-with-models', difficulty: 1 }),
    prompt:
      '{t1} ათეულს დაემატა {t2} ათეული.\n\n' +
      'რამდენი ათეულია სულ?',
    variables: {
      t1: { kind: 'int', min: 2, max: 5 },
      t2: { kind: 'int', min: 1, max: 4 },
    },
    answer: (v) => Number(v.t1) + Number(v.t2),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.t1} + ${vars.t2} = ${answer} ათეული.`,
  }),

  // Q48 — ორნიშნა რიცხვების შეკრება მოდელით (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-48', subtopicId: 'u07-adding-with-models', difficulty: 2 }),
    prompt:
      'პირველ მოდელში არის {a} კუბი, მეორეში — {b} კუბი.\n\n' +
      'რამდენია ორივე მოდელის კუბების ჯამი?',
    variables: {
      a: { kind: 'int', min: 14, max: 35 },
      b: { kind: 'int', min: 11, max: 28 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q49 — მოდელების შეკრება გადაჯგუფებით (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-49', subtopicId: 'u07-adding-with-models', difficulty: 2 }),
    prompt:
      'შეიკრიბა {a} და {b}.\n\n' +
      'გამოიყენე მოდელი და იპოვე ჯამი:',
    variables: {
      a: { kind: 'int', min: 17, max: 38 },
      b: { kind: 'int', min: 15, max: 29 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 20, 1),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q50 — სამი მოდელის შეკრება (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-50', subtopicId: 'u07-adding-with-models', difficulty: 3 }),
    prompt:
      'სამ თაროზე დევს წიგნები: პირველზე — {a}, მეორეზე — {b}, მესამეზე — {c}.\n\n' +
      'რამდენი წიგნია სამივე თაროზე ერთად?',
    variables: {
      a: { kind: 'int', min: 10, max: 25 },
      b: { kind: 'int', min: 5, max: 15 },
      c: { kind: 'int', min: 4, max: 12 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 15 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 15, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} = ${answer} წიგნი.`,
  }),

  // Q51 — შეკრების შემოწმება მოდელით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-51', subtopicId: 'u07-adding-with-models', difficulty: 3 }),
    prompt:
      'მოდელი A აჩვენებს {a} წრეს, მოდელი B — {b} წრეს.\n\n' +
      'რომელი ტოლობაა სწორი?',
    variables: {
      a: { kind: 'int', min: 15, max: 35 },
      b: { kind: 'int', min: 12, max: 25 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const b = Number(v.b);
          const sum = a + b;
          const correct = `${a} + ${b} = ${sum}`;
          const w1 = `${a} + ${b} = ${sum + 2}`;
          const w2 = `${a} + ${b} = ${sum - 2}`;
          const w3 = `${a} + ${b} = ${sum + 10}`;
          return [`${correct};${w1};${w2};${w3}`];
        },
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `სწორი ტოლობაა: ${answer}.`,
  }),

  // =========================================================================
  // U07.6 — საჭირო რაოდენობის პოვნა (Q52–Q60)
  // =========================================================================

  // Q52 — რამდენი აკლია ათეულამდე? (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-52', subtopicId: 'u07-required-quantity', difficulty: 1 }),
    prompt:
      'კალათაში არის {have} {item}. სულ გვინდა 10 {item}.\n\n' +
      'კიდევ რამდენი {item} უნდა ჩავდოთ კალათაში?',
    variables: {
      have: { kind: 'int', min: 1, max: 9 },
      item: { kind: 'choice', values: ['ვაშლი', 'მსხალი', 'ფორთოხალი'] },
    },
    answer: (v) => 10 - Number(v.have),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `10 − ${vars.have} = ${answer} ${vars.item}.`,
  }),

  // Q53 — რამდენი აკლია 20-მდე? (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-53', subtopicId: 'u07-required-quantity', difficulty: 1 }),
    prompt:
      'მოდელზე მოცემულია {have} {item}. მიზანია 20 {item}.\n\n' +
      'რამდენი {item} აკლია 20-მდე?',
    variables: {
      have: { kind: 'int', min: 11, max: 19 },
      item: { kind: 'choice', values: ['წრე', 'კუბი', 'ვარსკვლავი'] },
    },
    answer: (v) => 20 - Number(v.have),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `20 − ${vars.have} = ${answer} ${vars.item}.`,
  }),

  // Q54 — რამდენი აკლია შემდეგ სრულ ათეულამდე? (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-54', subtopicId: 'u07-required-quantity', difficulty: 1 }),
    prompt:
      'მოცემულია რიცხვი {num}.\n\n' +
      'რამდენი უნდა დაემატოს ამ რიცხვს, რომ მივიღოთ შემდეგი სრული ათეული ({target})?',
    variables: {
      tens: { kind: 'int', min: 2, max: 7 },
      ones: { kind: 'int', min: 1, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const num = t * 10 + o;
          const target = (t + 1) * 10;
          const needed = 10 - o;
          return [`${num};${target};${needed}`];
        },
      },
      num: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      target: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      needed: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.needed),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.target} − ${vars.num} = ${answer}.`,
  }),

  // Q55 — იპოვე საჭირო რაოდენობა მიზნობრივ რიცხვამდე (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-55', subtopicId: 'u07-required-quantity', difficulty: 2 }),
    prompt:
      'დაფაზე წერია რიცხვი {have}. გვინდა მივიღოთ {target}.\n\n' +
      'რა რიცხვი უნდა დავუმატოთ?',
    variables: {
      have: { kind: 'int', min: 15, max: 45 },
      add: { kind: 'int', min: 8, max: 25 },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.have) + Number(v.add))],
      },
      target: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.add),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.target} − ${vars.have} = ${answer}.`,
  }),

  // Q56 — რამდენი კუბია დასამატებელი მოდელში? (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-56', subtopicId: 'u07-required-quantity', difficulty: 2 }),
    prompt:
      'კონსტრუქციაში გამოყენებულია {have} კუბი. სულ საჭიროა {target} კუბი.\n\n' +
      'რამდენი კუბი აკლია კონსტრუქციას?',
    variables: {
      have: { kind: 'int', min: 22, max: 55 },
      diff: { kind: 'int', min: 7, max: 20 },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.have) + Number(v.diff))],
      },
      target: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.target} − ${vars.have} = ${answer} კუბი.`,
  }),

  // Q57 — აირჩიე სწორი დასამატებელი რაოდენობა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u07-57', subtopicId: 'u07-required-quantity', difficulty: 2 }),
    prompt:
      '{have} + ❓ = {target}\n\n' +
      'რომელი რიცხვი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      have: { kind: 'int', min: 18, max: 48 },
      needed: { kind: 'int', min: 12, max: 30 },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.have) + Number(v.needed))],
      },
      target: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.needed),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.target} − ${vars.have} = ${answer}.`,
  }),

  // Q58 — შეადარე საჭირო რაოდენობები (Level 3, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u07-58', subtopicId: 'u07-required-quantity', difficulty: 3 }),
    prompt:
      'მიზანია მივიღოთ 50:\n\n' +
      '• ჯგუფი A-ს აქვს {haveA} და აკლია ❓_A\n' +
      '• ჯგუფი B-ს აქვს {haveB} და აკლია ❓_B\n\n' +
      'შეადარე საჭირო რაოდენობები: ❓_A  ❓  ❓_B',
    variables: {
      haveA: { kind: 'int', min: 25, max: 42 },
      delta: { kind: 'choice', values: ['-4', '0', '4'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.haveA);
          const b = Math.max(10, Math.min(48, a + Number(v.delta)));
          const needA = 50 - a;
          const needB = 50 - b;
          return [`${b};${needA};${needB}`];
        },
      },
      haveB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      needA: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      needB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => (Number(v.needA) > Number(v.needB) ? '>' : Number(v.needA) < Number(v.needB) ? '<' : '='),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `ჯგუფ A-ს აკლია ${vars.needA}, ჯგუფ B-ს აკლია ${vars.needB}. აქედან: ${vars.needA} ${answer} ${vars.needB}.`,
  }),

  // Q59 — იპოვე საჭირო რაოდენობა ორეტაპიანი პირობით (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-59', subtopicId: 'u07-required-quantity', difficulty: 3 }),
    prompt:
      'გიორგის აქვს {a} მარკა, ნინოს — {b} მარკა.\n\n' +
      'მათ ერთად სურთ ჰქონდეთ {target} მარკა.\n\n' +
      'კიდევ რამდენი მარკა აკლიათ ერთად?',
    variables: {
      a: { kind: 'int', min: 12, max: 25 },
      b: { kind: 'int', min: 10, max: 22 },
      diff: { kind: 'int', min: 8, max: 25 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const sum = Number(v.a) + Number(v.b);
          const target = sum + Number(v.diff);
          return [`${sum};${target}`];
        },
      },
      sum: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      target: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `ერთად აქვთ ${vars.a} + ${vars.b} = ${vars.sum}. მიზნამდე აკლიათ ${vars.target} − ${vars.sum} = ${answer} მარკა.`,
  }),

  // Q60 — კომპლექსური ამოცანა საჭირო რაოდენობაზე (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u07-60', subtopicId: 'u07-required-quantity', difficulty: 3 }),
    prompt:
      'ყუთში ეტევა {capacity} ბურთი. მასში უკვე ჩააწყვეს {tens} ათეული და {ones} ერთეული ბურთი.\n\n' +
      'კიდევ რამდენი ბურთი ჩაეტევა ყუთში?',
    variables: {
      tens: { kind: 'int', min: 2, max: 5 },
      ones: { kind: 'int', min: 1, max: 8 },
      diff: { kind: 'int', min: 5, max: 20 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const current = Number(v.tens) * 10 + Number(v.ones);
          const capacity = current + Number(v.diff);
          return [`${current};${capacity}`];
        },
      },
      current: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      capacity: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `ყუთში უკვე არის ${vars.tens} ათეული და ${vars.ones} ერთეული = ${vars.current} ბურთი. ჩაეტევა კიდევ ${vars.capacity} − ${vars.current} = ${answer} ბურთი.`,
  }),
];
