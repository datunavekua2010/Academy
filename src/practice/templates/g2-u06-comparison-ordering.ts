import { defineTemplate, QuestionTemplate } from './types';

/**
 * Grade 2 — Unit 06: შედარება და დალაგება (Comparison and Ordering)
 *
 * Covers 10 subtopics + Review (70 templates total):
 *   U06.1 — რიცხვების შედარება 100-ის ფარგლებში (Q01–Q06)
 *   U06.2 — უდიდესი და უმცირესი რიცხვი (Q07–Q12)
 *   U06.3 — რიცხვების ზრდადობითა და კლებადობით დალაგება 100-მდე (Q13–Q18)
 *   U06.4 — ათეულებისა და ერთეულების შედარება (Q19–Q24)
 *   U06.5 — ჯამებისა და სხვაობების შედარება (Q25–Q30)
 *   U06.6 — რიცხვების შედარება 1000-ის ფარგლებში (Q31–Q36)
 *   U06.7 — რიცხვების დალაგება 1000-ის ფარგლებში (Q37–Q42)
 *   U06.8 — რიცხვების დახარისხება: მეტი და ნაკლები (Q43–Q48)
 *   U06.9 — რიცხვების დალაგება გადათრევა-ჩასმით (Q49–Q54)
 *   U06.10 — ორნიშნა რიცხვების შედარება გადათრევა-ჩასმით (Q55–Q60)
 *   შერეული გამეორება (Q61–Q70)
 */

export const G2_U06_SUBTOPICS = [
  'u06-comparing-to-100',
  'u06-largest-smallest-group',
  'u06-ordering-to-100',
  'u06-comparing-tens-ones',
  'u06-comparing-sums-differences',
  'u06-comparing-to-1000',
  'u06-ordering-to-1000',
  'u06-sorting-more-less',
  'u06-ordering-drag-drop',
  'u06-comparing-two-digit-drag',
] as const;

export type G2U06SubtopicId = (typeof G2_U06_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G2U06SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 2 as const,
  topicId: 'g2-shedareba-dalageba' as const,
  unitId: 'g2-shedareba-dalageba' as const,
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

export const G2_U06_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U06.1 — რიცხვების შედარება 100-ის ფარგლებში (Q01–Q06)
  // =========================================================================

  // Q01 — შეადარე ორი რიცხვი (Level 1, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u06-01', subtopicId: 'u06-comparing-to-100', difficulty: 1 }),
    prompt: '{intro}\n\n{a}  ❓  {b}\n\nრომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      intro: {
        kind: 'choice',
        values: [
          'შეადარე ორი რიცხვი:',
          'ჩასვი სწორი შედარების ნიშანი:',
          'აირჩიე სწორი სიმბოლო:',
        ],
      },
      mode: { kind: 'choice', values: ['lt', 'gt', 'eq'] },
      baseA: { kind: 'int', min: 15, max: 88 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.baseA);
          const m = String(v.mode);
          let b = a;
          if (m === 'lt') {
            b = a + 16;
          } else if (m === 'gt') {
            b = a - 14;
          }
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => {
      const a = Number(v.a);
      const b = Number(v.b);
      return a > b ? '>' : a < b ? '<' : '=';
    },
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `${vars.a} ${answer} ${vars.b}, ამიტომ სწორი ნიშანია '${answer}'.`,
  }),

  // Q02 — იპოვე სწორი შედარება (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-02', subtopicId: 'u06-comparing-to-100', difficulty: 1 }),
    prompt: '{intro}\n\nრომელი უტოლობაა სწორი?',
    variables: {
      intro: {
        kind: 'choice',
        values: [
          'დააკვირდი ჩანაწერებს:',
          'შეამოწმე უტოლობები:',
          'იპოვე სწორი შედარება:',
        ],
      },
      tensA: { kind: 'int', min: 3, max: 7 },
      onesA: { kind: 'int', min: 1, max: 6 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tensA);
          const o = Number(v.onesA);
          const n1 = t * 10 + o; // e.g. 46
          const n2 = o * 10 + t; // e.g. 64
          // True inequality: n1 < n2 (since t < o or vice versa)
          const smaller = Math.min(n1, n2);
          const larger = Math.max(n1, n2);
          const correctEq = `${smaller} < ${larger}`;
          const wrong1 = `${larger} < ${smaller}`;
          const wrong2 = `${smaller} > ${larger}`;
          const wrong3 = `${smaller} = ${larger}`;
          return [`${correctEq};${wrong1};${wrong2};${wrong3}`];
        },
      },
      correctEq: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      wrong1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      wrong2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      wrong3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correctEq),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.wrong1), String(vars.wrong2), String(vars.wrong3)],
    explanation: ({ answer }) =>
      `${answer} არის ჭეშმარიტი შედარება.`,
  }),

  // Q03 — ჩასვი გამოტოვებული რიცხვი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u06-03', subtopicId: 'u06-comparing-to-100', difficulty: 2 }),
    prompt: '{a} < ❓ < {b}\n\nრა მთელი რიცხვი უნდა ეწეროს კითხვის ნიშნის ნაცვლად?',
    variables: {
      a: { kind: 'int', min: 20, max: 88 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const b = a + 2;
          const ans = a + 1;
          return [`${b};${ans}`];
        },
      },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a}-სა და ${vars.b}-ს შორის მდებარეობს რიცხვი ${answer} (${vars.a} < ${answer} < ${vars.b}).`,
  }),

  // Q04 — შეადარე სამეული (Level 2, MC single choice)
  defineTemplate({
    ...addr({ id: 'g2-u06-04', subtopicId: 'u06-comparing-to-100', difficulty: 2 }),
    prompt: 'რომელი რიცხვია {minBound}-ზე მეტი და {maxBound}-ზე ნაკლები?',
    variables: {
      minBound: { kind: 'int', min: 25, max: 75 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const minB = Number(v.minBound);
          const maxB = minB + 6;
          const target = minB + 3;
          const below = minB - 3;
          const equalMax = maxB;
          const above = maxB + 3;
          return [`${maxB};${target};${below};${equalMax};${above}`];
        },
      },
      maxBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      target: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      below: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      equalMax: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      above: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.target),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [
      Number(vars.below),
      Number(vars.equalMax),
      Number(vars.above),
    ],
    explanation: ({ vars, answer }) =>
      `${vars.minBound} < ${answer} < ${vars.maxBound}, ამიტომ სწორი პასუხია ${answer}.`,
  }),

  // Q05 — იპოვე უდიდესი რიცხვი (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-05', subtopicId: 'u06-comparing-to-100', difficulty: 3 }),
    prompt: 'მოცემული ოთხი რიცხვიდან რომელია უდიდესი?\n\n{n1}, {n2}, {n3}, {n4}',
    variables: {
      base: { kind: 'int', min: 45, max: 75 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const nums = [b, b + 17, b - 8, b + 9];
          const maxVal = Math.max(...nums);
          return [`${nums[0]};${nums[1]};${nums[2]};${nums[3]};${maxVal}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      maxVal: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.maxVal),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => {
      const all = [Number(vars.n1), Number(vars.n2), Number(vars.n3), Number(vars.n4)];
      return all.filter((x) => x !== Number(vars.maxVal));
    },
    explanation: ({ answer }) =>
      `უდიდესი რიცხვია ${answer}.`,
  }),

  // Q06 — რიცხვების შედარება პირობის მიხედვით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-06', subtopicId: 'u06-comparing-to-100', difficulty: 3 }),
    prompt: 'იპოვე რიცხვი, რომელიც {minBound}-ზე მეტია, {maxBound}-ზე ნაკლებია და ლუწია:',
    variables: {
      tens: { kind: 'int', min: 2, max: 7 },
      evOff: { kind: 'choice', values: () => ['2', '4', '6', '8'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const off = Number(v.evOff);
          const minB = t * 10;
          const maxB = (t + 2) * 10;
          const correct = minB + 10 + off; // even and between minB and maxB
          const wrongOdd1 = minB - 1; // < minB
          const wrongOdd2 = minB + 7; // odd
          const wrongOdd3 = maxB + 3; // > maxB
          return [`${minB};${maxB};${correct};${wrongOdd1};${wrongOdd2};${wrongOdd3}`];
        },
      },
      minBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      maxBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${answer} მოთავსებულია ${vars.minBound}-სა და ${vars.maxBound}-ს შორის და არის ლუწი.`,
  }),

  // =========================================================================
  // U06.2 — უდიდესი და უმცირესი რიცხვი (Q07–Q12)
  // =========================================================================

  // Q07 — იპოვე უდიდესი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-07', subtopicId: 'u06-largest-smallest-group', difficulty: 1 }),
    prompt: 'მოცემული რიცხვებიდან აირჩიე უდიდესი:\n\n{n1}, {n2}, {n3}, {n4}',
    variables: {
      base: { kind: 'int', min: 20, max: 70 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const n1 = b + 6;
          const n2 = b + 32; // max
          const n3 = b + 16;
          const n4 = b + 22;
          return [`${n1};${n2};${n3};${n4}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.n2),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [Number(vars.n1), Number(vars.n3), Number(vars.n4)],
    explanation: ({ answer }) => `მოცემულ რიცხვებში უდიდესია ${answer}.`,
  }),

  // Q08 — იპოვე უმცირესი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-08', subtopicId: 'u06-largest-smallest-group', difficulty: 1 }),
    prompt: 'მოცემული რიცხვებიდან აირჩიე უმცირესი:\n\n{n1}, {n2}, {n3}, {n4}',
    variables: {
      base: { kind: 'int', min: 30, max: 80 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const n1 = b + 19;
          const n2 = b + 43;
          const n3 = b; // min
          const n4 = b + 29;
          return [`${n1};${n2};${n3};${n4}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.n3),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [Number(vars.n1), Number(vars.n2), Number(vars.n4)],
    explanation: ({ answer }) => `მოცემულ რიცხვებში უმცირესია ${answer}.`,
  }),

  // Q09 — იპოვე უდიდესისა და უმცირესის სხვაობა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u06-09', subtopicId: 'u06-largest-smallest-group', difficulty: 2 }),
    prompt:
      'მოცემულია რიცხვები: {n1}, {n2}, {n3}, {n4}.\n\n' +
      'იპოვე უდიდესი და უმცირესი რიცხვები, შემდეგ გამოთვალე მათი სხვაობა.',
    variables: {
      minVal: { kind: 'int', min: 12, max: 35 },
      diffVal: { kind: 'int', min: 25, max: 55 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const mn = Number(v.minVal);
          const d = Number(v.diffVal);
          const mx = mn + d;
          const m1 = mn + 12;
          const m2 = mn + 18;
          return [`${mn};${mx};${m1};${m2};${d}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] }, // min
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] }, // max
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `უდიდესია ${vars.n2}, უმცირესია ${vars.n1}. მათი სხვაობაა: ${vars.n2} − ${vars.n1} = ${answer}.`,
  }),

  // Q10 — იპოვე რიცხვი, რომელიც შუაშია (Level 2, MC single choice)
  defineTemplate({
    ...addr({ id: 'g2-u06-10', subtopicId: 'u06-largest-smallest-group', difficulty: 2 }),
    prompt: 'რომელი რიცხვი მდებარეობს {a}-სა და {b}-ს შორის?',
    variables: {
      a: { kind: 'int', min: 32, max: 72 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const b = a + 10;
          const target = a + 5;
          const below = a - 3;
          const atB = b;
          const above = b + 5;
          return [`${b};${target};${below};${atB};${above}`];
        },
      },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      target: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      below: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      atB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      above: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.target),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [Number(vars.below), Number(vars.atB), Number(vars.above)],
    explanation: ({ vars, answer }) =>
      `${answer} მდებარეობს ${vars.a}-სა და ${vars.b}-ს შორის.`,
  }),

  // Q11 — უდიდესი ლუწი რიცხვი (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-11', subtopicId: 'u06-largest-smallest-group', difficulty: 3 }),
    prompt: 'მოცემული რიცხვებიდან აირჩიე უდიდესი ლუწი რიცხვი:\n\n{n1}, {n2}, {n3}, {n4}, {n5}',
    variables: {
      base: { kind: 'int', min: 35, max: 65 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const n1 = b + 3; // odd
          const n2 = b + 16; // even
          const n3 = b + 27; // odd
          const n4 = b + 32; // greatest even
          const n5 = b + 35; // greatest odd
          return [`${n1};${n2};${n3};${n4};${n5}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      n5: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.n4),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [
      Number(vars.n2),
      Number(vars.n3),
      Number(vars.n5),
    ],
    explanation: ({ answer }) =>
      `ლუწ რიცხვებს შორის უდიდესია ${answer}.`,
  }),

  // Q12 — უმცირესი რიცხვი პირობებით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-12', subtopicId: 'u06-largest-smallest-group', difficulty: 3 }),
    prompt:
      'რიცხვი {minBound}-ზე მეტია, {maxBound}-ზე ნაკლებია და მისი ერთეულების ციფრი არის {ones}.\n\n' +
      'რომელია ამ პირობების შესაბამისი უმცირესი რიცხვი?',
    variables: {
      tens: { kind: 'int', min: 3, max: 6 },
      ones: { kind: 'choice', values: [2, 3, 4, 7] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const minB = t * 10;
          const maxB = (t + 2) * 10;
          const target = minB + o; // smallest in interval
          const optionBelow = (t - 1) * 10 + o;
          const optionNext = (t + 1) * 10 + o;
          const optionAbove = (t + 2) * 10 + o;
          return [`${minB};${maxB};${target};${optionBelow};${optionNext};${optionAbove}`];
        },
      },
      minBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      maxBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      target: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => Number(v.target),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.minBound}-სა და ${vars.maxBound}-ს შორის რიცხვებიდან, რომელთა ერთეულებია ${vars.ones}, უმცირესია ${answer}.`,
  }),

  // =========================================================================
  // U06.3 — რიცხვების ზრდადობითა და კლებადობით დალაგება 100-მდე (Q13–Q18)
  // =========================================================================

  // Q13 — ზრდადობით დალაგება (Level 1, MC Ordering)
  defineTemplate({
    ...addr({ id: 'g2-u06-13', subtopicId: 'u06-ordering-to-100', difficulty: 1 }),
    prompt:
      'დაალაგე ოთხი რიცხვი უმცირესიდან უდიდესისკენ (ზრდადობით):\n\n' +
      '{n1}, {n2}, {n3}, {n4}',
    variables: {
      base: { kind: 'int', min: 15, max: 45 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const a = b + 24;
          const c = b;
          const d = b + 47;
          const e = b + 13;
          const sorted = [c, e, a, d];
          return [`${a};${c};${d};${e};${sorted.join(', ')}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      sortedStr: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.sortedStr),
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const parts = String(vars.sortedStr).split(', ');
      return [
        `${parts[1]}, ${parts[0]}, ${parts[2]}, ${parts[3]}`,
        `${parts[0]}, ${parts[2]}, ${parts[1]}, ${parts[3]}`,
        `${parts[3]}, ${parts[2]}, ${parts[1]}, ${parts[0]}`,
      ];
    },
    explanation: ({ answer }) => `ზრდადობით დალაგებაა: ${answer}.`,
  }),

  // Q14 — კლებადობით დალაგება (Level 1, MC Ordering)
  defineTemplate({
    ...addr({ id: 'g2-u06-14', subtopicId: 'u06-ordering-to-100', difficulty: 1 }),
    prompt:
      'დაალაგე ოთხი რიცხვი უდიდესიდან უმცირესისკენ (კლებადობით):\n\n' +
      '{n1}, {n2}, {n3}, {n4}',
    variables: {
      base: { kind: 'int', min: 18, max: 48 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const a = b + 9;
          const c = b + 63;
          const d = b + 36;
          const e = b + 21;
          const sorted = [c, d, e, a]; // descending
          return [`${a};${c};${d};${e};${sorted.join(', ')}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      sortedStr: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.sortedStr),
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const parts = String(vars.sortedStr).split(', ');
      return [
        `${parts[1]}, ${parts[0]}, ${parts[2]}, ${parts[3]}`,
        `${parts[3]}, ${parts[2]}, ${parts[1]}, ${parts[0]}`,
        `${parts[0]}, ${parts[2]}, ${parts[1]}, ${parts[3]}`,
      ];
    },
    explanation: ({ answer }) => `კლებადობით დალაგებაა: ${answer}.`,
  }),

  // Q15 — ჩასვი რიცხვი მიმდევრობაში (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u06-15', subtopicId: 'u06-ordering-to-100', difficulty: 2 }),
    prompt:
      'იპოვე გამოტოვებული რიცხვი ზრდად მიმდევრობაში:\n\n' +
      '{n1}, {n2}, ❓, {n4}',
    variables: {
      start: { kind: 'int', min: 12, max: 45 },
      step: { kind: 'int', min: 6, max: 12 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const s = Number(v.start);
          const d = Number(v.step);
          const n1 = s;
          const n2 = s + d;
          const ans = s + 2 * d;
          const n4 = s + 3 * d;
          return [`${n1};${n2};${ans};${n4}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `მიმდევრობის ბიჯია ${vars.step}. ${vars.n2} + ${vars.step} = ${answer}.`,
  }),

  // Q16 — რომელი დალაგებაა სწორი? (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-16', subtopicId: 'u06-ordering-to-100', difficulty: 2 }),
    prompt:
      'რომელ ვარიანტშია მოცემული რიცხვები ზრდადობით დალაგებული?\n\n' +
      '{n1}, {n2}, {n3}',
    variables: {
      a: { kind: 'int', min: 15, max: 40 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const n1 = a;
          const n2 = a + 12;
          const n3 = a + 18;
          const correct = `${n1}, ${n2}, ${n3}`;
          const w1 = `${n3}, ${n2}, ${n1}`;
          const w2 = `${n2}, ${n1}, ${n3}`;
          const w3 = `${n1}, ${n3}, ${n2}`;
          return [`${correct};${w1};${w2};${w3};${n2};${n1};${n3}`];
        },
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `${answer} დალაგებულია ზრდადობით.`,
  }),

  // Q17 — დაალაგე პირობის მიხედვით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-17', subtopicId: 'u06-ordering-to-100', difficulty: 3 }),
    prompt:
      'დაალაგე რიცხვები კლებადობით და იპოვე მეორე რიცხვი:\n\n' +
      '{n1}, {n2}, {n3}, {n4}',
    variables: {
      base: { kind: 'int', min: 30, max: 55 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const c1 = b + 35; // largest
          const c2 = b + 23; // 2nd largest
          const c3 = b + 8;
          const c4 = b;
          return [`${c1};${c2};${c3};${c4}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      secondLargest: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.secondLargest),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [
      Number(vars.n2),
      Number(vars.n3),
      Number(vars.n4),
    ],
    explanation: ({ vars, answer }) =>
      `კლებადობით დალაგებაა: ${vars.n3}, ${answer}, ${vars.n4}, ${vars.n2}. მეორე რიცხვია ${answer}.`,
  }),

  // Q18 — შეავსე რიცხვითი რიგი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u06-18', subtopicId: 'u06-ordering-to-100', difficulty: 3 }),
    prompt: '{a} < ❓ < {b}\n\nრომელი მთელი რიცხვი აკმაყოფილებს უტოლობას?',
    variables: {
      a: { kind: 'int', min: 31, max: 89 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const b = a + 2;
          const ans = a + 1;
          return [`${b};${ans}`];
        },
      },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} < ${answer} < ${vars.b}.`,
  }),

  // =========================================================================
  // U06.4 — ათეულებისა და ერთეულების შედარება (Q19–Q24)
  // =========================================================================

  // Q19 — შეადარე ათეულების ციფრები (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-19', subtopicId: 'u06-comparing-tens-ones', difficulty: 1 }),
    prompt: 'შეადარე ორი რიცხვი ათეულების მიხედვით: {a} და {b}.\n\nრომელი მტკიცებაა სწორი?',
    variables: {
      tensA: { kind: 'int', min: 5, max: 8 },
      tensB: { kind: 'int', min: 2, max: 4 },
      onesA: { kind: 'int', min: 1, max: 9 },
      onesB: { kind: 'int', min: 1, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.tensA) * 10 + Number(v.onesA);
          const b = Number(v.tensB) * 10 + Number(v.onesB);
          const tA = Number(v.tensA);
          const tB = Number(v.tensB);
          const correct = `${a} > ${b}, რადგან ${tA} ათეული მეტია ${tB} ათეულზე`;
          const w1 = `${a} < ${b}, რადგან ${tA} ათეული ნაკლებია ${tB} ათეულზე`;
          const w2 = `${a} = ${b}, რადგან ორივე ორნიშნაა`;
          const w3 = `${a} < ${b}, რადგან ერთეულები განსხვავებულია`;
          return [`${a};${b};${correct};${w1};${w2};${w3}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `სწორია: ${answer}.`,
  }),

  // Q20 — ერთნაირი ათეულები (Level 1, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u06-20', subtopicId: 'u06-comparing-tens-ones', difficulty: 1 }),
    prompt:
      'შეადარე რიცხვები ერთნაირი ათეულებით:\n\n' +
      '{a}  ❓  {b}\n\n' +
      'რომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      onesA: { kind: 'int', min: 5, max: 9 },
      onesB: { kind: 'int', min: 1, max: 4 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const oA = Number(v.onesA);
          const oB = Number(v.onesB);
          const a = t * 10 + oA;
          const b = t * 10 + oB;
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => (Number(v.a) > Number(v.b) ? '>' : Number(v.a) < Number(v.b) ? '<' : '='),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `ათეულები ტოლია, ხოლო ${Number(vars.a) % 10} > ${Number(vars.b) % 10}, ამიტომ ${vars.a} ${answer} ${vars.b}.`,
  }),

  // Q21 — დაშალე და შეადარე (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-21', subtopicId: 'u06-comparing-tens-ones', difficulty: 2 }),
    prompt:
      'შეადარე:\n\n' +
      '{tA} ათეული + {oA} ერთეული  და  {tB} ათეული + {oB} ერთეული\n\n' +
      'რომელი შედარებაა სწორი?',
    variables: {
      tA: { kind: 'int', min: 3, max: 5 },
      oA: { kind: 'int', min: 2, max: 8 },
      tB: { kind: 'int', min: 6, max: 8 },
      oB: { kind: 'int', min: 1, max: 7 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.tA) * 10 + Number(v.oA);
          const b = Number(v.tB) * 10 + Number(v.oB);
          const correct = `${a} < ${b}`;
          const w1 = `${a} > ${b}`;
          const w2 = `${a} = ${b}`;
          const w3 = `${a} + 10 = ${b}`;
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
    explanation: ({ answer }) => `სწორი შედარებაა: ${answer}.`,
  }),

  // Q22 — იპოვე გამოტოვებული ციფრი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-22', subtopicId: 'u06-comparing-tens-ones', difficulty: 2 }),
    prompt:
      '{tens}❓ < {tens}{limit}\n\n' +
      'ჩამოთვლილთაგან რომელი ციფრი შეიძლება ეწეროს ❓-ის ნაცვლად, რომ უტოლობა ჭეშმარიტი იყოს?',
    variables: {
      tens: { kind: 'int', min: 3, max: 8 },
      limit: { kind: 'int', min: 4, max: 8 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const lim = Number(v.limit);
          const valid = lim - 2; // < lim
          const w1 = lim;
          const w2 = lim + 1;
          const w3 = 9;
          return [`${valid};${w1};${w2};${w3}`];
        },
      },
      valid: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.valid),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${answer} < ${vars.limit}, ამიტომ ${vars.tens}${answer} < ${vars.tens}${vars.limit}.`,
  }),

  // Q23 — შეადარე ორი რიცხვი თანრიგების მიხედვით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-23', subtopicId: 'u06-comparing-tens-ones', difficulty: 3 }),
    prompt: 'შეადარე რიცხვები {a} და {b}. რომელი დასკვნაა სწორი?',
    variables: {
      tensA: { kind: 'int', min: 3, max: 6 },
      tensB: { kind: 'int', min: 7, max: 9 },
      unitsA: { kind: 'int', min: 5, max: 9 },
      unitsB: { kind: 'int', min: 1, max: 4 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.tensA) * 10 + Number(v.unitsA);
          const b = Number(v.tensB) * 10 + Number(v.unitsB);
          const correct = `${b} მეტია, რადგან მისი ათეულების ციფრი უფრო დიდია`;
          const w1 = `${a} მეტია, რადგან მისი ერთეულების ციფრი უფრო დიდია`;
          const w2 = `ორივე რიცხვი ტოლია`;
          const w3 = `${a} მეტია, რადგან ჯამში მეტია`;
          return [`${a};${b};${correct};${w1};${w2};${w3}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `სწორი დასკვნაა: ${answer}.`,
  }),

  // Q24 — რიცხვი პირობებით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-24', subtopicId: 'u06-comparing-tens-ones', difficulty: 3 }),
    prompt:
      'იპოვე რიცხვი, რომლის ათეულების ციფრი {tens}-ია და რომელიც {limit}-ზე ნაკლებია:',
    variables: {
      tens: { kind: 'int', min: 4, max: 7 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const limit = t * 10 + 7;
          const correct = t * 10 + 4; // < limit and tens = t
          const w1 = (t - 1) * 10 + 9; // tens != t
          const w2 = limit; // = limit
          const w3 = (t + 1) * 10 + 1; // > limit
          return [`${limit};${correct};${w1};${w2};${w3}`];
        },
      },
      limit: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${answer}-ის ათეულების ციფრია ${vars.tens} და ის ნაკლებია ${vars.limit}-ზე.`,
  }),

  // =========================================================================
  // U06.5 — ჯამებისა და სხვაობების შედარება (Q25–Q30)
  // =========================================================================

  // Q25 — შეადარე ორი ჯამი (Level 1, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u06-25', subtopicId: 'u06-comparing-sums-differences', difficulty: 1 }),
    prompt: 'შეადარე ორი ჯამი:\n\n{a} + {b}  ❓  {c} + {d}\n\nრომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      mode: { kind: 'choice', values: ['eq', 'gt', 'lt'] },
      sumBase: { kind: 'int', min: 35, max: 65 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const s = Number(v.sumBase);
          const m = String(v.mode);
          const a = 20;
          const b = s - a;
          let c = 30;
          let d = s - c;
          if (m === 'gt') {
            d = s - c - 5; // left > right
          } else if (m === 'lt') {
            d = s - c + 5; // left < right
          }
          return [`${a};${b};${c};${d}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      c: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      d: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => {
      const left = Number(v.a) + Number(v.b);
      const right = Number(v.c) + Number(v.d);
      return left > right ? '>' : left < right ? '<' : '=';
    },
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => {
      const left = Number(vars.a) + Number(vars.b);
      const right = Number(vars.c) + Number(vars.d);
      return `${vars.a} + ${vars.b} = ${left}, ${vars.c} + ${vars.d} = ${right}. ${left} ${answer} ${right}.`;
    },
  }),

  // Q26 — შეადარე ორი სხვაობა (Level 1, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u06-26', subtopicId: 'u06-comparing-sums-differences', difficulty: 1 }),
    prompt: 'შეადარე ორი სხვაობა:\n\n{a} − {b}  ❓  {c} − {d}\n\nრომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      mode: { kind: 'choice', values: ['lt', 'gt', 'eq'] },
      diffBase: { kind: 'int', min: 30, max: 55 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const d = Number(v.diffBase);
          const m = String(v.mode);
          const b = 20;
          const a = d + b;
          const dSub = 10;
          let c = d + dSub;
          if (m === 'lt') {
            c += 4; // left < right
          } else if (m === 'gt') {
            c -= 4; // left > right
          }
          return [`${a};${b};${c};${dSub}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      c: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      d: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => {
      const left = Number(v.a) - Number(v.b);
      const right = Number(v.c) - Number(v.d);
      return left > right ? '>' : left < right ? '<' : '=';
    },
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => {
      const left = Number(vars.a) - Number(vars.b);
      const right = Number(vars.c) - Number(vars.d);
      return `${vars.a} − ${vars.b} = ${left}, ხოლო ${vars.c} − ${vars.d} = ${right}. ${left} ${answer} ${right}.`;
    },
  }),

  // Q27 — რომელი ჯამია უდიდესი? (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-27', subtopicId: 'u06-comparing-sums-differences', difficulty: 2 }),
    prompt: 'გამოთვალე და აირჩიე უდიდესი ჯამი:\n\n{intro}',
    variables: {
      intro: {
        kind: 'choice',
        values: [
          'შეადარე შემდეგი გამოსახულებები:',
          'რომელი გამოსახულების შედეგია უდიდესი?',
          'იპოვე ყველაზე დიდი ჯამი:',
        ],
      },
      base: { kind: 'int', min: 25, max: 45 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const e1 = `${b} + 15`; // b + 15
          const e2 = `${b + 5} + 18`; // b + 23
          const e3 = `${b + 7} + 25`; // b + 32 (greatest)
          return [`${e1};${e2};${e3}`];
        },
      },
      e1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      e2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      e3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    optionCount: 3,
    options: (v) => [String(v.e1), String(v.e2), String(v.e3)],
    answer: (v) => String(v.e3),
    format: { kind: 'text' },
    explanation: ({ answer }) =>
      `${answer} არის უდიდესი ჯამი.`,
  }),

  // Q28 — შეადარე ჯამი და სხვაობა (Level 2, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u06-28', subtopicId: 'u06-comparing-sums-differences', difficulty: 2 }),
    prompt: 'შეადარე ჯამი და სხვაობა:\n\n{a} + {b}  ❓  {c} − {d}\n\nრომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      mode: { kind: 'choice', values: ['lt', 'gt', 'eq'] },
      val: { kind: 'int', min: 38, max: 55 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const val = Number(v.val);
          const m = String(v.mode);
          const a = 18;
          const b = val - a;
          const d = 30;
          let c = val + d;
          if (m === 'lt') {
            c += 5; // left < right
          } else if (m === 'gt') {
            c -= 5; // left > right
          }
          return [`${a};${b};${c};${d}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      c: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      d: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => {
      const left = Number(v.a) + Number(v.b);
      const right = Number(v.c) - Number(v.d);
      return left > right ? '>' : left < right ? '<' : '=';
    },
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => {
      const left = Number(vars.a) + Number(vars.b);
      const right = Number(vars.c) - Number(vars.d);
      return `${vars.a} + ${vars.b} = ${left}, ხოლო ${vars.c} − ${vars.d} = ${right}. ${left} ${answer} ${right}.`;
    },
  }),

  // Q29 — იპოვე უცნობი რიცხვი შედარებით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-29', subtopicId: 'u06-comparing-sums-differences', difficulty: 3 }),
    prompt:
      '{a} + x < {target}\n\n' +
      'აირჩიე ყველაზე დიდი ერთნიშნა მთელი რიცხვი x, რომელიც ამ უტოლობას აკმაყოფილებს:',
    variables: {
      a: { kind: 'int', min: 25, max: 45 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const target = a + 10; // max single digit < 10 is 9
          const ans = 9;
          const w1 = 8;
          const w2 = 7;
          const w3 = 6;
          return [`${target};${ans};${w1};${w2};${w3}`];
        },
      },
      target: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${answer} = ${Number(vars.a) + Number(answer)}, რაც ნაკლებია ${vars.target}-ზე. ეს არის უდიდესი ერთნიშნა რიცხვი.`,
  }),

  // Q30 — შეადარე გამოსახულებები (Level 3, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u06-30', subtopicId: 'u06-comparing-sums-differences', difficulty: 3 }),
    prompt: 'შეადარე ორი გამოსახულება:\n\n({a} − {b})  ❓  ({c} + {d})\n\nრომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      mode: { kind: 'choice', values: ['lt', 'gt', 'eq'] },
      val: { kind: 'int', min: 42, max: 62 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const val = Number(v.val);
          const m = String(v.mode);
          const b = 25;
          const a = val + b; // left = val
          const c = 18;
          let d = val - c;
          if (m === 'lt') {
            d += 2; // right = val + 2 > left
          } else if (m === 'gt') {
            d -= 2; // right = val - 2 < left
          }
          return [`${a};${b};${c};${d}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      c: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      d: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => {
      const left = Number(v.a) - Number(v.b);
      const right = Number(v.c) + Number(v.d);
      return left > right ? '>' : left < right ? '<' : '=';
    },
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => {
      const left = Number(vars.a) - Number(vars.b);
      const right = Number(vars.c) + Number(vars.d);
      return `(${vars.a} − ${vars.b}) = ${left}, ხოლო (${vars.c} + ${vars.d}) = ${right}. ${left} ${answer} ${right}.`;
    },
  }),

  // =========================================================================
  // U06.6 — რიცხვების შედარება 1000-ის ფარგლებში (Q31–Q36)
  // =========================================================================

  // Q31 — შეადარე სამნიშნა რიცხვები (Level 1, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u06-31', subtopicId: 'u06-comparing-to-1000', difficulty: 1 }),
    prompt: 'შეადარე სამნიშნა რიცხვები:\n\n{a}  ❓  {b}\n\nრომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      mode: { kind: 'choice', values: ['lt', 'gt', 'eq'] },
      h: { kind: 'int', min: 2, max: 8 },
      tensOnes: { kind: 'int', min: 25, max: 75 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const h = Number(v.h);
          const to = Number(v.tensOnes);
          const m = String(v.mode);
          const a = h * 100 + to;
          let b = a;
          if (m === 'lt') {
            b = a + 9;
          } else if (m === 'gt') {
            b = a - 9;
          }
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => (Number(v.a) > Number(v.b) ? '>' : Number(v.a) < Number(v.b) ? '<' : '='),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  // Q32 — იპოვე უდიდესი სამნიშნა რიცხვი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-32', subtopicId: 'u06-comparing-to-1000', difficulty: 1 }),
    prompt: 'მოცემული ოთხი რიცხვიდან აირჩიე უდიდესი:\n\n{n1}, {n2}, {n3}, {n4}',
    variables: {
      d1: { kind: 'int', min: 4, max: 6 },
      d2: { kind: 'int', min: 2, max: 3 },
      d3: { kind: 'int', min: 7, max: 8 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const x = Number(v.d1);
          const y = Number(v.d2);
          const z = Number(v.d3);
          const n1 = x * 100 + y * 10 + z;
          const n2 = x * 100 + z * 10 + y;
          const n3 = z * 100 + y * 10 + x;
          const n4 = z * 100 + x * 10 + y; // largest
          return [`${n1};${n2};${n3};${n4}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.n4),
    format: { kind: 'integer', min: 100 },
    distractors: ({ vars }) => [Number(vars.n1), Number(vars.n2), Number(vars.n3)],
    explanation: ({ answer }) => `უდიდესი რიცხვია ${answer}.`,
  }),

  // Q33 — შეადარე ასეულები (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-33', subtopicId: 'u06-comparing-to-1000', difficulty: 2 }),
    prompt: 'შეადარე რიცხვები: {a} და {b}.\n\nრომელი შედარებაა სწორი?',
    variables: {
      hA: { kind: 'int', min: 4, max: 6 },
      hB: { kind: 'int', min: 7, max: 9 },
      toA: { kind: 'int', min: 20, max: 85 },
      toB: { kind: 'int', min: 10, max: 50 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.hA) * 100 + Number(v.toA);
          const b = Number(v.hB) * 100 + Number(v.toB);
          const correct = `${a} < ${b}`;
          const w1 = `${a} > ${b}`;
          const w2 = `${a} = ${b}`;
          const w3 = `${a} + 100 = ${b}`;
          return [`${a};${b};${correct};${w1};${w2};${w3}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `სწორი შედარებაა: ${answer}.`,
  }),

  // Q34 — ჩასვი გამოტოვებული რიცხვი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u06-34', subtopicId: 'u06-comparing-to-1000', difficulty: 2 }),
    prompt: '{a} < ❓ < {b}\n\nრა მთელი რიცხვი უნდა ეწეროს კითხვის ნიშნის ნაცვლად?',
    variables: {
      a: { kind: 'int', min: 480, max: 980 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const b = a + 2;
          const ans = a + 1;
          return [`${b};${ans}`];
        },
      },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer', min: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} < ${answer} < ${vars.b}.`,
  }),

  // Q35 — რიცხვი პირობებით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-35', subtopicId: 'u06-comparing-to-1000', difficulty: 3 }),
    prompt:
      'რიცხვი {minBound}-ზე მეტია, {maxBound}-ზე ნაკლებია და მისი ერთეულების ციფრი 5-ია:\n\n' +
      'რომელია ეს რიცხვი?',
    variables: {
      h: { kind: 'int', min: 4, max: 8 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const h = Number(v.h);
          const minB = h * 100;
          const maxB = (h + 1) * 100;
          const correct = minB + 75; // e.g. 675
          const w1 = minB - 5; // e.g. 595
          const w2 = minB + 16; // units 6 != 5
          const w3 = maxB + 5; // e.g. 705
          return [`${minB};${maxB};${correct};${w1};${w2};${w3}`];
        },
      },
      minBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      maxBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 100 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.minBound} < ${answer} < ${vars.maxBound} და მისი ერთეულების ციფრია 5.`,
  }),

  // Q36 — შეადარე სამნიშნა რიცხვები პირობების მიხედვით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-36', subtopicId: 'u06-comparing-to-1000', difficulty: 3 }),
    prompt:
      'მოცემულია ოთხი რიცხვი: {n1}, {n2}, {n3}, {n4}.\n\n' +
      'აირჩიე ერთადერთი რიცხვი, რომელიც {minBound}-ზე მეტია, {maxBound}-ზე ნაკლებია და ლუწია:',
    variables: {
      h: { kind: 'int', min: 4, max: 7 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const h = Number(v.h);
          const minB = h * 100;
          const maxB = (h + 3) * 100;
          const correct = minB + 26; // even and in range
          const w1 = minB - 11; // < minB
          const w2 = minB + 131; // odd
          const w3 = maxB + 4; // > maxB
          return [`${minB};${maxB};${w1};${correct};${w2};${w3}`];
        },
      },
      minBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      maxBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => Number(v.n2),
    format: { kind: 'integer', min: 100 },
    distractors: ({ vars }) => [Number(vars.n1), Number(vars.n3), Number(vars.n4)],
    explanation: ({ vars, answer }) =>
      `${answer} აკმაყოფილებს ყველა პირობას: ${vars.minBound} < ${answer} < ${vars.maxBound} და არის ლუწი.`,
  }),

  // =========================================================================
  // U06.7 — რიცხვების დალაგება 1000-ის ფარგლებში (Q37–Q42)
  // =========================================================================

  // Q37 — ზრდადობით დალაგება (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-37', subtopicId: 'u06-ordering-to-1000', difficulty: 1 }),
    prompt:
      'დაალაგე ოთხი სამნიშნა რიცხვი უმცირესიდან უდიდესისკენ (ზრდადობით):\n\n' +
      '{n1}, {n2}, {n3}, {n4}',
    variables: {
      pack: {
        kind: 'choice',
        values: () => {
          const sets = [
            '342;234;423;324;234, 324, 342, 423',
            '516;156;615;165;156, 165, 516, 615',
            '427;247;724;472;247, 427, 472, 724',
            '638;368;836;386;368, 386, 638, 836',
          ];
          return sets;
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      sortedStr: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.sortedStr),
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const p = String(vars.sortedStr).split(', ');
      return [
        `${p[1]}, ${p[0]}, ${p[2]}, ${p[3]}`,
        `${p[3]}, ${p[2]}, ${p[1]}, ${p[0]}`,
        `${p[0]}, ${p[2]}, ${p[1]}, ${p[3]}`,
      ];
    },
    explanation: ({ answer }) => `სწორი დალაგებაა: ${answer}.`,
  }),

  // Q38 — კლებადობით დალაგება (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-38', subtopicId: 'u06-ordering-to-1000', difficulty: 1 }),
    prompt:
      'დაალაგე ოთხი სამნიშნა რიცხვი უდიდესიდან უმცირესისკენ (კლებადობით):\n\n' +
      '{n1}, {n2}, {n3}, {n4}',
    variables: {
      pack: {
        kind: 'choice',
        values: () => [
          '608;860;680;806;860, 806, 680, 608',
          '507;750;570;705;750, 705, 570, 507',
          '409;940;490;904;940, 904, 490, 409',
          '308;830;380;803;830, 803, 380, 308',
        ],
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      sortedStr: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.sortedStr),
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const p = String(vars.sortedStr).split(', ');
      return [
        `${p[1]}, ${p[0]}, ${p[2]}, ${p[3]}`,
        `${p[3]}, ${p[2]}, ${p[1]}, ${p[0]}`,
        `${p[0]}, ${p[2]}, ${p[1]}, ${p[3]}`,
      ];
    },
    explanation: ({ answer }) => `კლებადობით დალაგებაა: ${answer}.`,
  }),

  // Q39 — იპოვე მეორე უდიდესი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-39', subtopicId: 'u06-ordering-to-1000', difficulty: 2 }),
    prompt:
      'დაალაგე რიცხვები ზრდადობით და აირჩიე მეორე უდიდესი:\n\n' +
      '{n1}, {n2}, {n3}, {n4}',
    variables: {
      pack: {
        kind: 'choice',
        values: () => [
          '412;421;214;241;412',
          '523;532;235;253;523',
          '634;643;346;364;634',
          '745;754;457;475;745',
        ],
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer', min: 100 },
    distractors: ({ vars }) => [
      Number(vars.n2),
      Number(vars.n3),
      Number(vars.n4),
    ],
    explanation: ({ answer }) => `მეორე უდიდესი რიცხვია ${answer}.`,
  }),

  // Q40 — დაასრულე მიმდევრობა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u06-40', subtopicId: 'u06-ordering-to-1000', difficulty: 2 }),
    prompt:
      'შეავსე ზრდადი რიცხვითი მიმდევრობის გამოტოვებული წევრი:\n\n' +
      '{n1}, {n2}, ❓, {n4}',
    variables: {
      start: { kind: 'int', min: 250, max: 700 },
      step: { kind: 'choice', values: [20, 25, 50] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const s = Number(v.start);
          const d = Number(v.step);
          const n1 = s;
          const n2 = s + d;
          const ans = s + 2 * d;
          const n4 = s + 3 * d;
          return [`${n1};${n2};${ans};${n4}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer', min: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 10),
    explanation: ({ vars, answer }) =>
      `მიმდევრობის ბიჯია ${vars.step}. ${vars.n2} + ${vars.step} = ${answer}.`,
  }),

  // Q41 — დაალაგე რიცხვები ასეულების მიხედვით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-41', subtopicId: 'u06-ordering-to-1000', difficulty: 3 }),
    prompt:
      'დაალაგე რიცხვები ზრდადობით:\n\n' +
      '{n1}, {n2}, {n3}, {n4}',
    variables: {
      pack: {
        kind: 'choice',
        values: () => [
          '572;527;752;725;527, 572, 725, 752',
          '483;438;843;834;438, 483, 834, 843',
          '391;319;931;913;319, 391, 913, 931',
          '652;625;562;526;526, 562, 625, 652',
        ],
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      sortedStr: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.sortedStr),
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const p = String(vars.sortedStr).split(', ');
      return [
        `${p[1]}, ${p[0]}, ${p[2]}, ${p[3]}`,
        `${p[3]}, ${p[2]}, ${p[1]}, ${p[0]}`,
        `${p[0]}, ${p[2]}, ${p[1]}, ${p[3]}`,
      ];
    },
    explanation: ({ answer }) => `სწორი დალაგებაა: ${answer}.`,
  }),

  // Q42 — იპოვე რიცხვი დალაგების პირობებით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-42', subtopicId: 'u06-ordering-to-1000', difficulty: 3 }),
    prompt:
      'იპოვე რიცხვი, რომელიც ზრდად სიაში ორ რიცხვს შორის უნდა ჩაისვას:\n\n' +
      '{leftVal}, ❓, {rightVal}',
    variables: {
      leftVal: { kind: 'int', min: 410, max: 750 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const l = Number(v.leftVal);
          const r = l + 40;
          const target = l + 20;
          const below = l - 10;
          const above = r + 15;
          const farAbove = r + 50;
          return [`${r};${target};${below};${above};${farAbove}`];
        },
      },
      rightVal: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      target: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      below: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      above: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      farAbove: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.target),
    format: { kind: 'integer', min: 100 },
    distractors: ({ vars }) => [
      Number(vars.below),
      Number(vars.above),
      Number(vars.farAbove),
    ],
    explanation: ({ vars, answer }) =>
      `${vars.leftVal} < ${answer} < ${vars.rightVal}.`,
  }),

  // =========================================================================
  // U06.8 — რიცხვების დახარისხება: მეტი და ნაკლები (Q43–Q48)
  // =========================================================================

  // Q43 — დაახარისხე რიცხვები (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-43', subtopicId: 'u06-sorting-more-less', difficulty: 1 }),
    prompt:
      'გადაანაწილე რიცხვები ორ ჯგუფში: „50-ზე ნაკლები“ და „50 ან მეტი“:\n\n' +
      '{n1}, {n2}, {n3}, {n4}, {n5}',
    variables: {
      a: { kind: 'int', min: 12, max: 38 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const n1 = a; // < 50
          const n2 = 50; // >= 50
          const n3 = a + 35; // >= 50
          const n4 = a + 8; // < 50
          const n5 = a + 45; // >= 50
          const correct = `ნაკლები: ${n1}, ${n4} | მეტი ან ტოლი: ${n2}, ${n3}, ${n5}`;
          const w1 = `ნაკლები: ${n1}, ${n2} | მეტი ან ტოლი: ${n3}, ${n4}, ${n5}`;
          const w2 = `ნაკლები: ${n1}, ${n3} | მეტი ან ტოლი: ${n2}, ${n4}, ${n5}`;
          const w3 = `ნაკლები: ${n4}, ${n5} | მეტი ან ტოლი: ${n1}, ${n2}, ${n3}`;
          return [`${n1};${n2};${n3};${n4};${n5};${correct};${w1};${w2};${w3}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      n5: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[8]] },
    },
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `სწორი განაწილებაა: ${answer}.`,
  }),

  // Q44 — ლუწი და კენტი რიცხვები (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-44', subtopicId: 'u06-sorting-more-less', difficulty: 1 }),
    prompt:
      'გადაანაწილე რიცხვები ლუწ და კენტ ჯგუფებში:\n\n' +
      '{n1}, {n2}, {n3}, {n4}, {n5}, {n6}',
    variables: {
      base: { kind: 'int', min: 10, max: 35 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base) * 2;
          const n1 = b + 1; // odd
          const n2 = b + 4; // even
          const n3 = b + 5; // odd
          const n4 = b + 8; // even
          const n5 = b + 11; // odd
          const n6 = b + 14; // even
          const correct = `ლუწი: ${n2}, ${n4}, ${n6} | კენტი: ${n1}, ${n3}, ${n5}`;
          const w1 = `ლუწი: ${n1}, ${n2}, ${n4} | კენტი: ${n3}, ${n5}, ${n6}`;
          const w2 = `ლუწი: ${n2}, ${n3}, ${n6} | კენტი: ${n1}, ${n4}, ${n5}`;
          const w3 = `ლუწი: ${n1}, ${n3}, ${n5} | კენტი: ${n2}, ${n4}, ${n6}`;
          return [`${n1};${n2};${n3};${n4};${n5};${n6};${correct};${w1};${w2};${w3}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      n5: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      n6: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[8]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[9]] },
    },
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `სწორი განაწილებაა: ${answer}.`,
  }),

  // Q45 — დაახარისხე რიცხვები პირობების მიხედვით (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-45', subtopicId: 'u06-sorting-more-less', difficulty: 2 }),
    prompt:
      'გადაანაწილე რიცხვები ორ ჯგუფში: „100-ზე ნაკლები“ და „100 ან მეტი“:\n\n' +
      '{n1}, {n2}, {n3}, {n4}, {n5}',
    variables: {
      a: { kind: 'int', min: 45, max: 85 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const n1 = a; // < 100
          const n2 = 100; // >= 100
          const n3 = a + 75; // >= 100
          const n4 = a + 12; // < 100
          const n5 = a + 110; // >= 100
          const correct = `ნაკლები: ${n1}, ${n4} | 100 ან მეტი: ${n2}, ${n3}, ${n5}`;
          const w1 = `ნაკლები: ${n1}, ${n2} | 100 ან მეტი: ${n3}, ${n4}, ${n5}`;
          const w2 = `ნაკლები: ${n1}, ${n3} | 100 ან მეტი: ${n2}, ${n4}, ${n5}`;
          const w3 = `ნაკლები: ${n4}, ${n5} | 100 ან მეტი: ${n1}, ${n2}, ${n3}`;
          return [`${n1};${n2};${n3};${n4};${n5};${correct};${w1};${w2};${w3}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      n5: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[8]] },
    },
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `სწორი დახარისხებაა: ${answer}.`,
  }),

  // Q46 — რომელი რიცხვები აკმაყოფილებს პირობას? (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-46', subtopicId: 'u06-sorting-more-less', difficulty: 2 }),
    prompt:
      'მოცემულია რიცხვები: {n1}, {n2}, {n3}, {n4}, {n5}.\n\n' +
      'რომელი რიცხვებია 40-ზე მეტი და 70-ზე ნაკლები?',
    variables: {
      offset: { kind: 'int', min: 1, max: 25 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const off = Number(v.offset);
          const n1 = 30 + (off % 8); // < 40
          const n2 = 42 + (off % 6); // 40..70
          const n3 = 70 + (off % 5); // >= 70
          const n4 = 65 - (off % 5); // 40..70
          const n5 = 50 + (off % 10); // 40..70
          const correct = `${n2}, ${n5}, ${n4}`;
          const w1 = `${n1}, ${n2}, ${n5}`;
          const w2 = `${n2}, ${n3}, ${n4}`;
          const w3 = `ყველა მათგანი`;
          return [`${n1};${n2};${n3};${n4};${n5};${correct};${w1};${w2};${w3}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      n5: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[8]] },
    },
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `${answer} მოთავსებულია 40-სა და 70-ს შორის.`,
  }),

  // Q47 — დაახარისხე სამი ჯგუფი (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-47', subtopicId: 'u06-sorting-more-less', difficulty: 3 }),
    prompt:
      'გადაანაწილე რიცხვები სამ ჯგუფში (0–99, 100–499, 500–999):\n\n' +
      '{n1}, {n2}, {n3}, {n4}, {n5}, {n6}',
    variables: {
      seed: { kind: 'int', min: 10, max: 35 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const s = Number(v.seed);
          const n1 = s * 2 + 15; // < 100 (35..85)
          const n2 = s * 10 + 50; // 150..400
          const n3 = s * 15 + 350; // 500..875
          const n4 = s * 11 + 100; // 210..485
          const n5 = s * 12 + 450; // 570..870
          const n6 = s * 2 + 25; // < 100 (45..95)
          const correct = `0–99: ${n1}, ${n6} | 100–499: ${n2}, ${n4} | 500–999: ${n3}, ${n5}`;
          const w1 = `0–99: ${n1}, ${n2} | 100–499: ${n3}, ${n4} | 500–999: ${n5}, ${n6}`;
          const w2 = `0–99: ${n1}, ${n4} | 100–499: ${n2}, ${n5} | 500–999: ${n3}, ${n6}`;
          const w3 = `0–99: ${n6} | 100–499: ${n1}, ${n2}, ${n4} | 500–999: ${n3}, ${n5}`;
          return [`${n1};${n2};${n3};${n4};${n5};${n6};${correct};${w1};${w2};${w3}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      n5: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      n6: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[8]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[9]] },
    },
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `სწორი დახარისხებაა: ${answer}.`,
  }),

  // Q48 — დახარისხება ორი პირობით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-48', subtopicId: 'u06-sorting-more-less', difficulty: 3 }),
    prompt:
      'მოცემულია რიცხვები: {n1}, {n2}, {n3}, {n4}, {n5}, {n6}.\n\n' +
      'რომელი რიცხვებია 200-ზე მეტი, 600-ზე ნაკლები და თან ლუწი?',
    variables: {
      step: { kind: 'int', min: 1, max: 25 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const s = Number(v.step);
          const n1 = 190 + (s % 5) * 2; // < 200
          const n2 = 220 + s * 4; // 224..320, even, 200..600
          const n3 = 301 + s * 2; // odd
          const n4 = 520 + (s % 10) * 4; // 520..556, even, 200..600
          const n5 = 602 + (s % 4) * 2; // > 600
          const n6 = 405 + (s % 6) * 2; // odd
          const correct = `${n2}, ${n4}`;
          const w1 = `${n1}, ${n2}`;
          const w2 = `${n2}, ${n3}, ${n4}`;
          const w3 = `${n2}, ${n4}, ${n5}`;
          return [`${n1};${n2};${n3};${n4};${n5};${n6};${correct};${w1};${w2};${w3}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      n5: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      n6: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[8]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[9]] },
    },
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `${answer} აკმაყოფილებს ყველა პირობას (200-სა და 600-ს შორის მდებარეობს და ლუწია).`,
  }),

  // =========================================================================
  // U06.9 — რიცხვების დალაგება გადათრევა-ჩასმით (Q49–Q54)
  // =========================================================================

  // Q49 — ზრდადობით დალაგება (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-49', subtopicId: 'u06-ordering-drag-drop', difficulty: 1 }),
    prompt:
      'დაალაგე ოთხი რიცხვი ზრდადობით (უმცირესიდან უდიდესისკენ):\n\n' +
      '{n1}, {n2}, {n3}, {n4}',
    variables: {
      base: { kind: 'int', min: 15, max: 45 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const a1 = b;
          const a2 = b + 14;
          const a3 = b + 28;
          const a4 = b + 42;
          const n1 = a3;
          const n2 = a1;
          const n3 = a4;
          const n4 = a2;
          const correct = `${a1}, ${a2}, ${a3}, ${a4}`;
          const w1 = `${a4}, ${a3}, ${a2}, ${a1}`;
          const w2 = `${a1}, ${a3}, ${a2}, ${a4}`;
          const w3 = `${a2}, ${a1}, ${a3}, ${a4}`;
          return [`${n1};${n2};${n3};${n4};${correct};${w1};${w2};${w3}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
    },
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `ზრდადობით დალაგებაა: ${answer}.`,
  }),

  // Q50 — კლებადობით დალაგება (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-50', subtopicId: 'u06-ordering-drag-drop', difficulty: 1 }),
    prompt:
      'დაალაგე ოთხი რიცხვი კლებადობით (უდიდესიდან უმცირესისკენ):\n\n' +
      '{n1}, {n2}, {n3}, {n4}',
    variables: {
      base: { kind: 'int', min: 15, max: 45 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const a1 = b;
          const a2 = b + 15;
          const a3 = b + 30;
          const a4 = b + 48;
          const n1 = a1;
          const n2 = a4;
          const n3 = a2;
          const n4 = a3;
          const correct = `${a4}, ${a3}, ${a2}, ${a1}`;
          const w1 = `${a1}, ${a2}, ${a3}, ${a4}`;
          const w2 = `${a4}, ${a2}, ${a3}, ${a1}`;
          const w3 = `${a3}, ${a4}, ${a2}, ${a1}`;
          return [`${n1};${n2};${n3};${n4};${correct};${w1};${w2};${w3}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
    },
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `კლებადობით დალაგებაა: ${answer}.`,
  }),

  // Q51 — შეავსე რიცხვითი ხაზი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-51', subtopicId: 'u06-ordering-drag-drop', difficulty: 2 }),
    prompt:
      'განალაგე რიცხვები რიცხვით ხაზზე მნიშვნელობების ზრდის მიხედვით:\n\n' +
      '{n1}, {n2}, {n3}, {n4}',
    variables: {
      d: { kind: 'int', min: 2, max: 8 },
      tens: { kind: 'int', min: 1, max: 4 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const d = Number(v.d);
          const t = Number(v.tens);
          const a1 = 100 + d;
          const a2 = 100 + t * 10 + d;
          const a3 = d * 100 + t;
          const a4 = d * 100 + t * 10;
          const n1 = a2;
          const n2 = a1;
          const n3 = a4;
          const n4 = a3;
          const correct = `${a1}, ${a2}, ${a3}, ${a4}`;
          const w1 = `${a2}, ${a1}, ${a4}, ${a3}`;
          const w2 = `${a4}, ${a3}, ${a2}, ${a1}`;
          const w3 = `${a1}, ${a3}, ${a2}, ${a4}`;
          return [`${n1};${n2};${n3};${n4};${correct};${w1};${w2};${w3}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
    },
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `რიცხვით ხაზზე ზრდადი თანმიმდევრობაა: ${answer}.`,
  }),

  // Q52 — დალაგება თანრიგების მიხედვით (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-52', subtopicId: 'u06-ordering-drag-drop', difficulty: 2 }),
    prompt:
      'დაალაგე სამნიშნა რიცხვები ზრდადობით:\n\n' +
      '{n1}, {n2}, {n3}, {n4}',
    variables: {
      h1: { kind: 'int', min: 1, max: 5 },
      h2: { kind: 'int', min: 6, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const h1 = Number(v.h1);
          const h2 = Number(v.h2);
          const a1 = h1 * 100 + 25;
          const a2 = h1 * 100 + 72;
          const a3 = h2 * 100 + 14;
          const a4 = h2 * 100 + 86;
          const n1 = a4;
          const n2 = a2;
          const n3 = a1;
          const n4 = a3;
          const correct = `${a1}, ${a2}, ${a3}, ${a4}`;
          const w1 = `${a4}, ${a3}, ${a2}, ${a1}`;
          const w2 = `${a1}, ${a3}, ${a2}, ${a4}`;
          const w3 = `${a2}, ${a1}, ${a4}, ${a3}`;
          return [`${n1};${n2};${n3};${n4};${correct};${w1};${w2};${w3}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
    },
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `სწორი დალაგებაა: ${answer}.`,
  }),

  // Q53 — იპოვე სწორი პოზიცია (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-53', subtopicId: 'u06-ordering-drag-drop', difficulty: 3 }),
    prompt:
      'მოცემულია დალაგებული სია: {s1}, {s2}, {s3}, {s4}.\n\n' +
      'ჩასვი რიცხვი {insertVal} თავის სწორ პოზიციაზე, რომ სია ზრდადი დარჩეს:',
    variables: {
      base: { kind: 'int', min: 10, max: 40 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base) * 10;
          const s1 = b + 10;
          const s2 = b + 30;
          const s3 = b + 70;
          const s4 = b + 90;
          const insertVal = b + 50;
          const correct = `${s1}, ${s2}, ${insertVal}, ${s3}, ${s4}`;
          const w1 = `${insertVal}, ${s1}, ${s2}, ${s3}, ${s4}`;
          const w2 = `${s1}, ${insertVal}, ${s2}, ${s3}, ${s4}`;
          const w3 = `${s1}, ${s2}, ${s3}, ${s4}, ${insertVal}`;
          return [`${s1};${s2};${s3};${s4};${insertVal};${correct};${w1};${w2};${w3}`];
        },
      },
      s1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      s2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      s3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      s4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      insertVal: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[8]] },
    },
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.insertVal} მოთავსდება ${vars.s2}-სა და ${vars.s3}-ს შორის: ${answer}.`,
  }),

  // Q54 — დალაგება და პოზიციის განსაზღვრა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-54', subtopicId: 'u06-ordering-drag-drop', difficulty: 3 }),
    prompt:
      'დაალაგე ხუთი რიცხვი ზრდადობით და მიუთითე მესამე რიცხვი:\n\n' +
      '{n1}, {n2}, {n3}, {n4}, {n5}',
    variables: {
      base: { kind: 'int', min: 10, max: 40 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base) * 20;
          const a1 = b + 10;
          const a2 = b + 25;
          const a3 = b + 40; // 3rd
          const a4 = b + 65;
          const a5 = b + 90;
          const n1 = a4;
          const n2 = a1;
          const n3 = a5;
          const n4 = a2;
          const n5 = a3;
          return [`${n1};${n2};${n3};${n4};${n5};${a3};${a1};${a2};${a4}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      n5: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      thirdVal: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[8]] },
    },
    answer: (v) => Number(v.thirdVal),
    format: { kind: 'integer', min: 100 },
    distractors: ({ vars }) => [
      Number(vars.w1),
      Number(vars.w2),
      Number(vars.w3),
    ],
    explanation: ({ answer }) =>
      `ზრდადობით დალაგებისას მესამე ადგილზე დგას რიცხვი ${answer}.`,
  }),

  // =========================================================================
  // U06.10 — ორნიშნა რიცხვების შედარება გადათრევა-ჩასმით (Q55–Q60)
  // =========================================================================

  // Q55 — შეავსე შედარების სიმბოლო (Level 1, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u06-55', subtopicId: 'u06-comparing-two-digit-drag', difficulty: 1 }),
    prompt: '{a}  ❓  {b}\n\nრომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      tensA: { kind: 'int', min: 2, max: 7 },
      onesA: { kind: 'int', min: 2, max: 8 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const tA = Number(v.tensA);
          const oA = Number(v.onesA);
          const a = tA * 10 + oA;
          const b = oA * 10 + tA; // reversed digits
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => (Number(v.a) > Number(v.b) ? '>' : Number(v.a) < Number(v.b) ? '<' : '='),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  // Q56 — შეადარე რიცხვი და ათეული (Level 1, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u06-56', subtopicId: 'u06-comparing-two-digit-drag', difficulty: 1 }),
    prompt:
      'შეადარე ორნიშნა რიცხვი და სრული ათეული:\n\n' +
      '{a}  ❓  {b}\n\n' +
      'რომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      tens: { kind: 'int', min: 3, max: 8 },
      ones: { kind: 'int', min: 4, max: 8 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const a = t * 10 + o;
          const b = (t + 1) * 10;
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => (Number(v.a) > Number(v.b) ? '>' : Number(v.a) < Number(v.b) ? '<' : '='),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  // Q57 — შეავსე რამდენიმე უტოლობა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-57', subtopicId: 'u06-comparing-two-digit-drag', difficulty: 2 }),
    prompt:
      'რომელი ნიშნები უნდა ჩაისვას უტოლობებში თანმიმდევრობით?\n\n' +
      '1) {a1}  ❓  {b1}\n' +
      '2) {a2}  ❓  {b2}\n' +
      '3) {a3}  ❓  {b3}',
    variables: {
      base: { kind: 'int', min: 25, max: 55 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const a1 = b;
          const b1 = b + 9; // <
          const a2 = b + 15;
          const b2 = b + 8; // >
          const a3 = b + 10;
          const b3 = b + 10; // =
          return [`${a1};${b1};${a2};${b2};${a3};${b3}`];
        },
      },
      a1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      a2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      b2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      a3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      b3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: () => '<, >, =',
    format: { kind: 'text' },
    distractors: () => ['>, <, =', '<, <, =', '>, >, ='],
    explanation: ({ vars, answer }) =>
      `1) ${vars.a1} < ${vars.b1}, 2) ${vars.a2} > ${vars.b2}, 3) ${vars.a3} = ${vars.b3}. სწორი თანმიმდევრობაა: ${answer}.`,
  }),

  // Q58 — იპოვე რიცხვი ორ საზღვარს შორის (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-58', subtopicId: 'u06-comparing-two-digit-drag', difficulty: 2 }),
    prompt: 'რომელ ინტერვალში მდებარეობს რიცხვი {val}?',
    variables: {
      tens: { kind: 'int', min: 3, max: 7 },
      ones: { kind: 'int', min: 2, max: 8 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const val = t * 10 + o;
          const correctInterval = `${t * 10}–${t * 10 + 9}`;
          const intBelow = `${(t - 1) * 10}–${(t - 1) * 10 + 9}`;
          const intAbove = `${(t + 1) * 10}–${(t + 1) * 10 + 9}`;
          return [`${val};${correctInterval};${intBelow};${intAbove}`];
        },
      },
      val: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correctInterval: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      intBelow: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      intAbove: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    optionCount: 3,
    options: (v) => [String(v.intBelow), String(v.correctInterval), String(v.intAbove)],
    answer: (v) => String(v.correctInterval),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `${vars.val} ეკუთვნის ინტერვალს ${answer}.`,
  }),

  // Q59 — შედარება დამატებითი პირობით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-59', subtopicId: 'u06-comparing-two-digit-drag', difficulty: 3 }),
    prompt:
      'იპოვე რიცხვი, რომელიც {minBound}-ზე მეტია, {maxBound}-ზე ნაკლებია და მისი ერთეულების ციფრი ნაკლებია ათეულების ციფრზე:',
    variables: {
      minBound: { kind: 'int', min: 50, max: 70 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const minB = Number(v.minBound);
          const maxB = minB + 20;
          // e.g. minB = 60, maxB = 80.
          // Pick a number with tens t and ones o < t.
          // e.g. 72 (t=7, o=2 < 7) -> correct
          // Distractors:
          // w1: 68 (o=8 > 6)
          // w2: minB - 7 (below range)
          // w3: 79 (o=9 > 7)
          const midT = Math.floor(minB / 10) + 1; // e.g. 7
          const correct = midT * 10 + 2; // e.g. 72 (2 < 7)
          const w1 = (midT - 1) * 10 + 8; // e.g. 68 (8 > 6)
          const w2 = minB - 3; // < minB
          const w3 = midT * 10 + 9; // e.g. 79 (9 > 7)
          return [`${maxB};${correct};${w1};${w2};${w3}`];
        },
      },
      maxBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) => {
      const ansNum = Number(answer);
      const t = Math.floor(ansNum / 10);
      const o = ansNum % 10;
      return `${answer} მოთავსებულია ${vars.minBound}-სა და ${vars.maxBound}-ს შორის და მისი ერთეულების ციფრი (${o}) ნაკლებია ათეულების ციფრზე (${t}).`;
    },
  }),

  // Q60 — შედარების საბოლოო გამოწვევა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-60', subtopicId: 'u06-comparing-two-digit-drag', difficulty: 3 }),
    prompt:
      'იპოვე ორნიშნა რიცხვი, რომელიც აკმაყოფილებს პირობებს:\n\n' +
      '• {minBound}-ზე მეტია;\n' +
      '• {maxBound}-ზე ნაკლებია;\n' +
      '• ლუწია;\n' +
      '• მისი ერთეულების ციფრი არის {targetOnes}.',
    variables: {
      tens: { kind: 'int', min: 3, max: 8 },
      targetOnes: { kind: 'choice', values: [2, 4, 6, 8] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const minB = t * 10;
          const maxB = (t + 1) * 10;
          const o = Number(v.targetOnes);
          const correct = minB + o;
          const w1 = (t - 1) * 10 + o;
          const w2 = minB + ((o + 1) % 10);
          const w3 = maxB + o;
          return [`${minB};${maxB};${correct};${w1};${w2};${w3}`];
        },
      },
      minBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      maxBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${answer} აკმაყოფილებს ყველა პირობას (არის ${vars.minBound}-სა და ${vars.maxBound}-ს შორის, ლუწია და ერთეულების ციფრია ${vars.targetOnes}).`,
  }),

  // =========================================================================
  // ნაწილი B — შერეული გამეორება (Q61–Q70)
  // =========================================================================

  // Q61 — შეადარე რიცხვები (Level 1, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u06-61', subtopicId: 'u06-comparing-to-100', difficulty: 1 }),
    prompt: 'შეადარე რიცხვები:\n\n{a}  ❓  {b}\n\nრომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      tensA: { kind: 'int', min: 5, max: 9 },
      onesA: { kind: 'int', min: 1, max: 4 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const tA = Number(v.tensA);
          const oA = Number(v.onesA);
          const a = tA * 10 + oA;
          const b = oA * 10 + tA;
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => (Number(v.a) > Number(v.b) ? '>' : Number(v.a) < Number(v.b) ? '<' : '='),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  // Q62 — იპოვე უმცირესი რიცხვი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-62', subtopicId: 'u06-largest-smallest-group', difficulty: 1 }),
    prompt: 'აირჩიე უმცირესი რიცხვი:\n\n{n1}, {n2}, {n3}, {n4}',
    variables: {
      base: { kind: 'int', min: 30, max: 65 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const n1 = b + 10;
          const n2 = b + 46;
          const n3 = b; // min
          const n4 = b + 45;
          return [`${n1};${n2};${n3};${n4}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.n3),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [Number(vars.n1), Number(vars.n2), Number(vars.n4)],
    explanation: ({ answer }) => `უმცირესი რიცხვია ${answer}.`,
  }),

  // Q63 — დაალაგე რიცხვები (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-63', subtopicId: 'u06-ordering-to-100', difficulty: 2 }),
    prompt:
      'დაალაგე მოცემული რიცხვები ზრდადობით:\n\n' +
      '{n1}, {n2}, {n3}, {n4}',
    variables: {
      a: { kind: 'int', min: 15, max: 40 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const a1 = a;
          const a2 = a + 12;
          const a3 = a + 25;
          const a4 = a + 39;
          const n1 = a2;
          const n2 = a4;
          const n3 = a1;
          const n4 = a3;
          const correct = `${a1}, ${a2}, ${a3}, ${a4}`;
          const w1 = `${a4}, ${a3}, ${a2}, ${a1}`;
          const w2 = `${a1}, ${a3}, ${a2}, ${a4}`;
          const w3 = `${a2}, ${a1}, ${a4}, ${a3}`;
          return [`${n1};${n2};${n3};${n4};${correct};${w1};${w2};${w3}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
    },
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `ზრდადობით სწორი დალაგებაა: ${answer}.`,
  }),

  // Q64 — შეადარე ჯამი და სხვაობა (Level 2, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u06-64', subtopicId: 'u06-comparing-sums-differences', difficulty: 2 }),
    prompt:
      'გამოთვალე ორივე გამოსახულება და შეადარე შედეგები:\n\n' +
      '{a} + {b}  ❓  {c} − {d}\n\n' +
      'რომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      mode: { kind: 'choice', values: ['lt', 'gt', 'eq'] },
      val: { kind: 'int', min: 35, max: 55 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const val = Number(v.val);
          const m = String(v.mode);
          const a = 28;
          const b = val - a; // sum = val
          const d = 30;
          let c = val + d;
          if (m === 'lt') {
            c += 5;
          } else if (m === 'gt') {
            c -= 5;
          }
          return [`${a};${b};${c};${d}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      c: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      d: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => {
      const left = Number(v.a) + Number(v.b);
      const right = Number(v.c) - Number(v.d);
      return left > right ? '>' : left < right ? '<' : '=';
    },
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => {
      const left = Number(vars.a) + Number(vars.b);
      const right = Number(vars.c) - Number(vars.d);
      return `${vars.a} + ${vars.b} = ${left}, ხოლო ${vars.c} − ${vars.d} = ${right}. ${left} ${answer} ${right}.`;
    },
  }),

  // Q65 — შეადარე სამნიშნა რიცხვები (Level 2, Choice >, <, =)
  defineTemplate({
    ...addr({ id: 'g2-u06-65', subtopicId: 'u06-comparing-to-1000', difficulty: 2 }),
    prompt: 'შეადარე ორი სამნიშნა რიცხვი:\n\n{a}  ❓  {b}\n\nრომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      h: { kind: 'int', min: 2, max: 8 },
      tens: { kind: 'int', min: 1, max: 9 },
      mode: { kind: 'choice', values: ['gt', 'lt', 'eq'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const h = Number(v.h);
          const t = Number(v.tens);
          const m = String(v.mode);
          const a = h * 100 + t * 10 + 4;
          let b = a;
          if (m === 'gt') {
            b = h * 100 + t * 10 + 1;
          } else if (m === 'lt') {
            b = h * 100 + t * 10 + 9;
          }
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => (Number(v.a) > Number(v.b) ? '>' : Number(v.a) < Number(v.b) ? '<' : '='),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  // Q66 — იპოვე მეორე უმცირესი (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-66', subtopicId: 'u06-ordering-to-1000', difficulty: 3 }),
    prompt:
      'დაალაგე მოცემული რიცხვები ზრდადობით და აირჩიე მეორე უმცირესი:\n\n' +
      '{n1}, {n2}, {n3}, {n4}',
    variables: {
      seed: { kind: 'int', min: 10, max: 35 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const s = Number(v.seed) * 20;
          const a1 = s + 15;
          const a2 = s + 45;
          const a3 = s + 90;
          const a4 = s + 140;
          const n1 = a3;
          const n2 = a1;
          const n3 = a4;
          const n4 = a2;
          return [`${n1};${n2};${n3};${n4};${a2};${a1};${a3};${a4}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      secondMin: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
    },
    answer: (v) => Number(v.secondMin),
    format: { kind: 'integer', min: 100 },
    distractors: ({ vars }) => [
      Number(vars.w1),
      Number(vars.w2),
      Number(vars.w3),
    ],
    explanation: ({ answer }) =>
      `ზრდადობით დალაგებისას მეორე უმცირესი რიცხვია ${answer}.`,
  }),

  // Q67 — დაახარისხე რიცხვები (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-67', subtopicId: 'u06-sorting-more-less', difficulty: 3 }),
    prompt:
      'გადაანაწილე რიცხვები ორ ჯგუფში: „500-ზე ნაკლები“ და „500 ან მეტი“:\n\n' +
      '{n1}, {n2}, {n3}, {n4}, {n5}',
    variables: {
      seed: { kind: 'int', min: 10, max: 35 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const s = Number(v.seed);
          const n1 = 200 + s * 5;
          const n2 = 500;
          const n3 = 600 + s * 6;
          const n4 = 480 + (s % 15);
          const n5 = 700 + s * 5;
          const correct = `500-ზე ნაკლები: ${n1}, ${n4} | 500 ან მეტი: ${n2}, ${n3}, ${n5}`;
          const w1 = `500-ზე ნაკლები: ${n1}, ${n2} | 500 ან მეტი: ${n3}, ${n4}, ${n5}`;
          const w2 = `500-ზე ნაკლები: ${n1}, ${n3} | 500 ან მეტი: ${n2}, ${n4}, ${n5}`;
          const w3 = `500-ზე ნაკლები: ${n4}, ${n5} | 500 ან მეტი: ${n1}, ${n2}, ${n3}`;
          return [`${n1};${n2};${n3};${n4};${n5};${correct};${w1};${w2};${w3}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      n5: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[8]] },
    },
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `სწორი დახარისხებაა: ${answer}.`,
  }),

  // Q68 — იპოვე უდიდესისა და უმცირესის სხვაობა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u06-68', subtopicId: 'u06-largest-smallest-group', difficulty: 3 }),
    prompt:
      'მოცემულია სამნიშნა რიცხვები: {n1}, {n2}, {n3}, {n4}.\n\n' +
      'იპოვე უდიდესი და უმცირესი რიცხვები, შემდეგ გამოთვალე მათი სხვაობა.',
    variables: {
      seed: { kind: 'int', min: 10, max: 35 },
      diffVal: { kind: 'choice', values: [320, 350, 420, 450, 520, 550] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const s = Number(v.seed) * 10;
          const d = Number(v.diffVal);
          const minVal = 100 + s;
          const maxVal = minVal + d;
          const n3 = minVal + 60;
          const n4 = maxVal - 50;
          return [`${minVal};${maxVal};${n3};${n4};${d}`];
        },
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 10),
    explanation: ({ vars, answer }) =>
      `უდიდესია ${vars.n2}, უმცირესია ${vars.n1}. ${vars.n2} − ${vars.n1} = ${answer}.`,
  }),

  // Q69 — შეავსე უტოლობა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u06-69', subtopicId: 'u06-comparing-to-100', difficulty: 3 }),
    prompt: '{a} < ❓ < {b}\n\nიპოვე ერთადერთი მთელი რიცხვი, რომელიც ამ უტოლობას აკმაყოფილებს:',
    variables: {
      a: { kind: 'int', min: 45, max: 95 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const b = a + 2;
          const ans = a + 1;
          return [`${b};${ans}`];
        },
      },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} < ${answer} < ${vars.b}.`,
  }),

  // Q70 — საბოლოო გამოწვევა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u06-70', subtopicId: 'u06-comparing-tens-ones', difficulty: 3 }),
    prompt:
      'იპოვე სამნიშნა რიცხვი, რომელიც აკმაყოფილებს ყველა პირობას:\n\n' +
      '• {minH}-ზე მეტია;\n' +
      '• {maxH}-ზე ნაკლებია;\n' +
      '• ლუწია;\n' +
      '• ათეულების ციფრი არის {tensDigit}.',
    variables: {
      h: { kind: 'int', min: 3, max: 7 },
      tensDigit: { kind: 'int', min: 2, max: 6 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const h = Number(v.h);
          const td = Number(v.tensDigit);
          const minH = h * 100;
          const maxH = (h + 1) * 100;
          const correct = minH + td * 10 + 4;
          const w1 = (h - 1) * 100 + td * 10 + 2;
          const w2 = minH + td * 10 + 7;
          const w3 = (h + 1) * 100 + td * 10 + 2;
          return [`${minH};${maxH};${td};${correct};${w1};${w2};${w3}`];
        },
      },
      minH: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      maxH: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer', min: 100 },
    distractors: ({ vars }) => [
      Number(vars.w1),
      Number(vars.w2),
      Number(vars.w3),
    ],
    explanation: ({ vars, answer }) =>
      `${answer} აკმაყოფილებს ყველა პირობას: არის ${vars.minH}-სა და ${vars.maxH}-ს შორის, ლუწია და ათეულების ციფრია ${vars.tensDigit}.`,
  }),
];
