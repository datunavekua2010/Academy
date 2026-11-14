import { defineTemplate, QuestionTemplate } from './types';

/**
 * Grade 2 — Unit 05: ორნიშნა რიცხვების გამოკლება (Two-Digit Subtraction)
 *
 * Covers 10 subtopics + Review (70 templates total):
 *   U05.1 — ათეულების გამოკლება (Q01–Q06)
 *   U05.2 — ორნიშნა რიცხვების გამოკლება ათეულის დაშლის გარეშე (Q07–Q12)
 *   U05.3 — ორნიშნა რიცხვების გამოკლება ათეულის დაშლით (Q13–Q18)
 *   U05.4 — გამოსახულებები სურათების მიხედვით (Q19–Q24)
 *   U05.5 — გამოკლების ცხრილი 100-ის ფარგლებში (Q25–Q30)
 *   U05.6 — სიტყვიერი ამოცანები (Q31–Q36)
 *   U05.7 — რიცხვის მიღების გზები გამოკლებით (Q37–Q42)
 *   U05.8 — გამოკლებების შედარება (Q43–Q48)
 *   U05.9 — ცხრილის შევსება გადათრევით (Q49–Q54)
 *   U05.10 — სამნიშნა რიცხვები: გამოკლების საწყისი წარმოდგენა (Q55–Q60)
 *   შერეული გამეორება (Q61–Q70)
 */

export const G2_U05_SUBTOPICS = [
  'u05-subtracting-tens',
  'u05-without-regrouping',
  'u05-with-regrouping',
  'u05-expressions-from-pictures',
  'u05-subtraction-table-100',
  'u05-word-problems',
  'u05-ways-to-make-number',
  'u05-comparing-examples',
  'u05-filling-table',
  'u05-three-digit-numbers',
] as const;

export type G2U05SubtopicId = (typeof G2_U05_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G2U05SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 2 as const,
  topicId: 'g2-ornishna-gamokleba' as const,
  unitId: 'g2-ornishna-gamokleba' as const,
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

/** Helper to repeat an emoji count times separated by space. */
export function repeatEmoji(emoji: string, count: number): string {
  if (count <= 0) return '';
  return Array(count).fill(emoji).join(' ');
}

export const G2_U05_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U05.1 — ათეულების გამოკლება (Q01–Q06)
  // =========================================================================

  // Q01 — გამოაკელი ათეულები (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-01', subtopicId: 'u05-subtracting-tens', difficulty: 1 }),
    prompt: '{intro}\n\n{a} − {b} = ?',
    variables: {
      intro: {
        kind: 'choice',
        values: [
          'გამოაკელი ათეულები:',
          'გამოთვალე სხვაობა:',
          'იპოვე გამოკლების შედეგი:',
          'შეასრულე გამოკლება:',
        ],
      },
      aTens: { kind: 'int', min: 2, max: 9 },
      bTens: { kind: 'int', min: 1, max: 8 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const aT = Number(v.aTens);
          let bT = Number(v.bTens);
          if (bT >= aT) {
            bT = Math.max(1, aT - 1);
          }
          const a = aT * 10;
          const b = bT * 10;
          return [`${a};${b};${aT};${bT}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      aT: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      bT: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) =>
      `${vars.aT} ათეულს გამოვაკლოთ ${vars.bT} ათეული არის ${Number(vars.aT) - Number(vars.bT)} ათეული, ანუ ${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q02 — რამდენი ათეული დარჩა? (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-02', subtopicId: 'u05-subtracting-tens', difficulty: 1 }),
    prompt: '{name}-ს ჰქონდა {a} ათეული {item}. მან მეგობრებს დაურიგა {b} ათეული. რამდენი ათეული {item} დარჩა {name}-ს?',
    variables: {
      name: { kind: 'choice', values: ['ლუკა', 'ნიკო', 'ანო', 'დათო', 'სანდრო', 'ელენე'] },
      item: { kind: 'choice', values: ['ფანქარი', 'სტიკერი', 'ბუშტი', 'კანფეტი', 'ღილი'] },
      a: { kind: 'int', min: 4, max: 9 },
      b: { kind: 'int', min: 1, max: 3 },
    },
    constraints: [{ test: (v) => Number(v.a) > Number(v.b), note: 'a > b' }],
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} ათეულს − ${vars.b} ათეული = ${answer} ათეული.`,
  }),

  // Q03 — შეავსე გამოკლება (Level 2, Missing number)
  defineTemplate({
    ...addr({ id: 'g2-u05-03', subtopicId: 'u05-subtracting-tens', difficulty: 2 }),
    prompt: '{a} − ❓ = {b}\n\nრომელი რიცხვი უნდა ეწეროს კითხვის ნიშნის ნაცვლად?',
    variables: {
      aTens: { kind: 'int', min: 4, max: 9 },
      bTens: { kind: 'int', min: 1, max: 3 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.aTens) * 10;
          const b = Number(v.bTens) * 10;
          const diff = a - b;
          return [`${a};${b};${diff}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) =>
      `მაკლების საპოვნელად საკლებს ვაკლებთ სხვაობას: ${vars.a} − ${vars.b} = ${answer}. შემოწმება: ${vars.a} − ${answer} = ${vars.b}.`,
  }),

  // Q04 — იპოვე სხვაობა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-04', subtopicId: 'u05-subtracting-tens', difficulty: 2 }),
    prompt: 'იპოვე ათეულების სხვაობა:\n\n{a} − {b} = ?',
    variables: {
      aTens: { kind: 'int', min: 5, max: 9 },
      subTens: { kind: 'int', min: 2, max: 4 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.aTens) * 10;
          const b = Number(v.subTens) * 10;
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q05 — შეადარე გამოკლებები (Level 3, Compare symbols)
  defineTemplate({
    ...addr({ id: 'g2-u05-05', subtopicId: 'u05-subtracting-tens', difficulty: 3 }),
    prompt: 'შეადარე ორი სხვაობა:\n\n{a} − {b}  ❓  {c} − {d}\n\nრომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      mode: { kind: 'choice', values: ['eq', 'gt', 'lt'] },
      base: { kind: 'int', min: 2, max: 6 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const m = String(v.mode);
          const k = Number(v.base) * 10; // diff1 = k
          const a = k + 30;
          const b = 30;
          let c = 0;
          let d = 0;
          if (m === 'eq') {
            c = k + 20;
            d = 20;
          } else if (m === 'gt') {
            c = k + 10;
            d = 20; // c - d = k - 10 < k
          } else {
            c = k + 30;
            d = 20; // c - d = k + 10 > k
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
      const right = Number(v.c) - Number(v.d);
      return left > right ? '>' : left < right ? '<' : '=';
    },
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => {
      const left = Number(vars.a) - Number(vars.b);
      const right = Number(vars.c) - Number(vars.d);
      return `${vars.a} − ${vars.b} = ${left}, ხოლო ${vars.c} − ${vars.d} = ${right}. რადგან ${left} ${answer} ${right}, სწორი ნიშანია '${answer}'.`;
    },
  }),

  // Q06 — ამოცანა ათეულებზე (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-06', subtopicId: 'u05-subtracting-tens', difficulty: 3 }),
    prompt: 'სასკოლო ყუთში იყო {a} ცალი {item}. გაკვეთილზე მოსწავლეებმა აიღეს {b} ცალი. რამდენი {item} დარჩა ყუთში?',
    variables: {
      item: { kind: 'choice', values: ['ფანქარი', 'საშლელი', 'რვეული', 'სახაზავი'] },
      aTens: { kind: 'int', min: 4, max: 9 },
      bTens: { kind: 'int', min: 1, max: 3 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.aTens) * 10;
          const b = Number(v.bTens) * 10;
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer} ${vars.item}.`,
  }),

  // =========================================================================
  // U05.2 — ორნიშნა რიცხვების გამოკლება ათეულის დაშლის გარეშე (Q07–Q12)
  // =========================================================================

  // Q07 — გამოკლება ათეულის დაშლის გარეშე (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-07', subtopicId: 'u05-without-regrouping', difficulty: 1 }),
    prompt: '{intro}\n\n{a} − {b} = ?',
    variables: {
      intro: {
        kind: 'choice',
        values: [
          'გამოაკელი გადაჯგუფების გარეშე:',
          'გამოთვალე სხვაობა:',
          'შეასრულე ორნიშნა გამოკლება:',
        ],
      },
      tA: { kind: 'int', min: 4, max: 8 },
      oA: { kind: 'int', min: 4, max: 9 },
      tB: { kind: 'int', min: 1, max: 3 },
      oB: { kind: 'int', min: 1, max: 3 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.tA) * 10 + Number(v.oA);
          const b = Number(v.tB) * 10 + Number(v.oB);
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `ერთეულებს ვაკლებთ ერთეულებს: ${Number(vars.a) % 10} − ${Number(vars.b) % 10} = ${Number(answer) % 10}. ათეულებს ვაკლებთ ათეულებს: ${Math.floor(Number(vars.a) / 10)}0 − ${Math.floor(Number(vars.b) / 10)}0 = ${Math.floor(Number(answer) / 10)}0. შედეგია ${answer}.`,
  }),

  // Q08 — გამოკლება ათეულებისა და ერთეულების მიხედვით (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-08', subtopicId: 'u05-without-regrouping', difficulty: 1 }),
    prompt: 'გამოთვალე თანრიგების მიხედვით:\n\n{a} − {b} = ({tensA}0 − {tensB}0) + ({onesA} − {onesB}) = ?',
    variables: {
      tensA: { kind: 'int', min: 5, max: 8 },
      onesA: { kind: 'int', min: 5, max: 9 },
      tensB: { kind: 'int', min: 1, max: 3 },
      onesB: { kind: 'int', min: 1, max: 4 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.tensA) * 10 + Number(v.onesA);
          const b = Number(v.tensB) * 10 + Number(v.onesB);
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => {
      const diffTens = (Number(vars.tensA) - Number(vars.tensB)) * 10;
      const diffOnes = Number(vars.onesA) - Number(vars.onesB);
      return `(${vars.tensA}0 − ${vars.tensB}0) = ${diffTens}, (${vars.onesA} − ${vars.onesB}) = ${diffOnes}. ${diffTens} + ${diffOnes} = ${answer}.`;
    },
  }),

  // Q09 — იპოვე გამოტოვებული მაკლები (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-09', subtopicId: 'u05-without-regrouping', difficulty: 2 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი:\n\n{a} − ❓ = {c}',
    variables: {
      tensA: { kind: 'int', min: 5, max: 8 },
      onesA: { kind: 'int', min: 5, max: 9 },
      tensSub: { kind: 'int', min: 2, max: 4 },
      onesSub: { kind: 'int', min: 1, max: 4 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.tensA) * 10 + Number(v.onesA);
          const sub = Number(v.tensSub) * 10 + Number(v.onesSub);
          const c = a - sub;
          return [`${a};${sub};${c}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      sub: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      c: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.sub),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `მაკლების მოსაძებნად საკლებს გამოვაკლოთ სხვაობა: ${vars.a} − ${vars.c} = ${answer}.`,
  }),

  // Q10 — რომელი გამოკლებაა სწორი? (Level 2, MC single choice)
  defineTemplate({
    ...addr({ id: 'g2-u05-10', subtopicId: 'u05-without-regrouping', difficulty: 2 }),
    prompt: 'რომელი გამოსახულების პასუხია {target}?',
    variables: {
      target: { kind: 'int', min: 21, max: 45 },
      sub: { kind: 'int', min: 12, max: 24 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.target);
          const s = Number(v.sub);
          const correctMinuend = t + s;
          return [`${correctMinuend};${s};${t}`];
        },
      },
      minuend: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      subtrahend: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => `${v.minuend} − ${v.subtrahend}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const m = Number(vars.minuend);
      const s = Number(vars.subtrahend);
      return [
        `${m + 1} − ${s}`,
        `${m + 2} − ${s}`,
        `${m - 1} − ${s}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${answer} = ${vars.target}, ამიტომ ეს გამოსახულებაა სწორი.`,
  }),

  // Q11 — შეავსე ცხრილი (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g2-u05-11', subtopicId: 'u05-without-regrouping', difficulty: 3 }),
    prompt:
      'გამოთვალე სხვაობები ცხრილის თითოეულ მწკრივში:\n\n' +
      '| საკლები | მაკლები | სხვაობა |\n' +
      '| :---: | :---: | :---: |\n' +
      '| {a1} | {b1} | ❓ |\n' +
      '| {a2} | {b2} | ❓ |\n' +
      '| {a3} | {b3} | ❓ |\n\n' +
      'რა რიცხვები უნდა ეწეროს სხვაობის სვეტში?',
    variables: {
      diff: { kind: 'int', min: 31, max: 44 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const d = Number(v.diff);
          const b1 = 25;
          const a1 = d + b1;
          const b2 = 36;
          const a2 = d + b2;
          const b3 = 14;
          const a3 = d + b3;
          return [`${a1};${b1};${a2};${b2};${a3};${b3};${d}`];
        },
      },
      a1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      a2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      b2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      a3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      b3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      d: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
    },
    answer: (v) => `${v.d}, ${v.d}, ${v.d}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const d = Number(vars.d);
      return [
        `${d - 1}, ${d}, ${d}`,
        `${d}, ${d + 1}, ${d}`,
        `${d + 10}, ${d}, ${d}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${vars.a1} − ${vars.b1} = ${vars.d}, ${vars.a2} − ${vars.b2} = ${vars.d}, ${vars.a3} − ${vars.b3} = ${vars.d}. სწორი პასუხია: ${answer}.`,
  }),

  // Q12 — იპოვე სწორი წყვილი (Level 3, Pair selection)
  defineTemplate({
    ...addr({ id: 'g2-u05-12', subtopicId: 'u05-without-regrouping', difficulty: 3 }),
    prompt: 'რომელი წყვილის სხვაობაა {target}?',
    variables: {
      target: { kind: 'int', min: 21, max: 35 },
      sub: { kind: 'int', min: 32, max: 54 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.target);
          const b = Number(v.sub);
          const a = t + b;
          return [`${a};${b};${t}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => `${v.a} და ${v.b}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [
        `${a} და ${b - 1}`,
        `${a + 1} და ${b}`,
        `${a - 1} და ${b}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${vars.target}, ამიტომ სწორი წყვილია: ${answer}.`,
  }),

  // =========================================================================
  // U05.3 — ორნიშნა რიცხვების გამოკლება ათეულის დაშლით (Q13–Q18)
  // =========================================================================

  // Q13 — გამოკლება ათეულის დაშლით (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-13', subtopicId: 'u05-with-regrouping', difficulty: 1 }),
    prompt: '{intro}\n\n{a} − {b} = ?',
    variables: {
      intro: {
        kind: 'choice',
        values: [
          'გამოაკელი ათეულის დაშლით:',
          'გამოთვალე სხვაობა გადაჯგუფებით:',
          'შეასრულე გამოკლება:',
        ],
      },
      tensA: { kind: 'int', min: 4, max: 8 },
      onesA: { kind: 'int', min: 1, max: 4 },
      tensB: { kind: 'int', min: 1, max: 3 },
      onesB: { kind: 'int', min: 6, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.tensA) * 10 + Number(v.onesA);
          const b = Number(v.tensB) * 10 + Number(v.onesB);
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ vars, answer }) => {
      const ans = Number(answer);
      const forgotRegroup = ans + 10;
      const backwardsOnes =
        (Math.floor(Number(vars.a) / 10) - Math.floor(Number(vars.b) / 10)) * 10 +
        ((Number(vars.b) % 10) - (Number(vars.a) % 10));
      const res = new Set<number>([forgotRegroup, backwardsOnes, ans - 2, ans + 2]);
      res.delete(ans);
      return Array.from(res).slice(0, 3);
    },
    explanation: ({ vars, answer }) => {
      const oA = Number(vars.a) % 10;
      const oB = Number(vars.b) % 10;
      const tA = Math.floor(Number(vars.a) / 10);
      const tB = Math.floor(Number(vars.b) / 10);
      return `რადგან ${oA} < ${oB}, ვშლით 1 ათეულს: 10 + ${oA} = ${10 + oA}. ${10 + oA} − ${oB} = ${10 + oA - oB}. ათეულებში დარჩა ${tA - 1}: ${tA - 1} − ${tB} = ${tA - 1 - tB}. შედეგია ${answer}.`;
    },
  }),

  // Q14 — ათეულის დაშლა მოდელით (Level 1, Visual choice)
  defineTemplate({
    ...addr({ id: 'g2-u05-14', subtopicId: 'u05-with-regrouping', difficulty: 1 }),
    prompt:
      'მოდელზე მოცემულია საკლები {a}: {tensA} ათეული [10] და {onesA} ერთეული [1].\n' +
      'ვშლით 1 ათეულს 10 ერთეულად:\n' +
      'ვიღებთ {tensMinus1} ათეულს და {onesPlus10} ერთეულს.\n' +
      'გამოვაკლოთ {b} ({tensB} ათეული და {onesB} ერთეული).\n\n' +
      'რამდენი დარჩება?',
    variables: {
      tensA: { kind: 'int', min: 4, max: 7 },
      onesA: { kind: 'int', min: 1, max: 4 },
      tensB: { kind: 'int', min: 1, max: 3 },
      onesB: { kind: 'int', min: 6, max: 8 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const tA = Number(v.tensA);
          const oA = Number(v.onesA);
          const tB = Number(v.tensB);
          const oB = Number(v.onesB);
          const a = tA * 10 + oA;
          const b = tB * 10 + oB;
          return [`${a};${b};${tA - 1};${oA + 10}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      tensMinus1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      onesPlus10: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.tensMinus1} ათეულს − ${vars.tensB} ათეული = ${Number(vars.tensMinus1) - Number(vars.tensB)} ათეული. ${vars.onesPlus10} ერთეულს − ${vars.onesB} ერთეული = ${Number(vars.onesPlus10) - Number(vars.onesB)} ერთეული. სულ დარჩა ${answer}.`,
  }),

  // Q15 — იპოვე სხვაობა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-15', subtopicId: 'u05-with-regrouping', difficulty: 2 }),
    prompt: 'გამოთვალე სხვაობა:\n\n{a} − {b} = ?',
    variables: {
      tensA: { kind: 'int', min: 5, max: 8 },
      onesA: { kind: 'int', min: 1, max: 4 },
      tensB: { kind: 'int', min: 2, max: 4 },
      onesB: { kind: 'int', min: 6, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.tensA) * 10 + Number(v.onesA);
          const b = Number(v.tensB) * 10 + Number(v.onesB);
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q16 — შეავსე გამოტოვებული რიცხვი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-16', subtopicId: 'u05-with-regrouping', difficulty: 2 }),
    prompt: 'იპოვე გამოტოვებული საკლები:\n\n❓ − {b} = {c}',
    variables: {
      tensAns: { kind: 'int', min: 5, max: 8 },
      onesAns: { kind: 'int', min: 1, max: 4 },
      tensB: { kind: 'int', min: 2, max: 3 },
      onesB: { kind: 'int', min: 6, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const ans = Number(v.tensAns) * 10 + Number(v.onesAns);
          const b = Number(v.tensB) * 10 + Number(v.onesB);
          const c = ans - b;
          return [`${ans};${b};${c}`];
        },
      },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      c: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer', min: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 20, 1),
    explanation: ({ vars, answer }) =>
      `საკლების მოსაძებნად მაკლებსა და სხვაობას ვკრებთ: ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // Q17 — შეარჩიე სწორი გამოთვლა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-17', subtopicId: 'u05-with-regrouping', difficulty: 3 }),
    prompt: 'შეარჩიე სწორი გამოთვლა:\n\n{a} − {b} = ?',
    variables: {
      tensA: { kind: 'int', min: 5, max: 7 },
      onesA: { kind: 'int', min: 1, max: 3 },
      tensB: { kind: 'int', min: 2, max: 3 },
      onesB: { kind: 'int', min: 7, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.tensA) * 10 + Number(v.onesA);
          const b = Number(v.tensB) * 10 + Number(v.onesB);
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ vars, answer }) => {
      const ans = Number(answer);
      const forgotRegroup = ans + 10;
      const reversedOnes =
        (Math.floor(Number(vars.a) / 10) - Math.floor(Number(vars.b) / 10)) * 10 +
        ((Number(vars.b) % 10) - (Number(vars.a) % 10));
      const res = new Set<number>([forgotRegroup, reversedOnes, ans + 2]);
      res.delete(ans);
      while (res.size < 3) {
        res.add(ans - (res.size + 1));
      }
      return Array.from(res).slice(0, 3);
    },
    explanation: ({ answer }) =>
      `სწორი პასუხია ${answer}. ხშირი შეცდომაა ათეულის დაშლის დავიწყება ან ერთეულების უკუღმა გამოკლება.`,
  }),

  // Q18 — ორნაბიჯიანი გამოკლება (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-18', subtopicId: 'u05-with-regrouping', difficulty: 3 }),
    prompt: 'გამოთვალე ორნაბიჯიანი გამოკლება:\n\n{a} − {b} − {c} = ?',
    variables: {
      a: { kind: 'int', min: 70, max: 90 },
      b: { kind: 'int', min: 18, max: 28 },
      c: { kind: 'int', min: 12, max: 24 },
    },
    constraints: [{ test: (v) => Number(v.a) - Number(v.b) - Number(v.c) >= 15, note: 'positive result' }],
    answer: (v) => Number(v.a) - Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => {
      const step1 = Number(vars.a) - Number(vars.b);
      return `ჯერ გამოვაკლოთ ${vars.b}: ${vars.a} − ${vars.b} = ${step1}. შემდეგ გამოვაკლოთ ${vars.c}: ${step1} − ${vars.c} = ${answer}.`;
    },
  }),

  // =========================================================================
  // U05.4 — გამოსახულებები სურათების მიხედვით (Q19–Q24)
  // =========================================================================

  // Q19 — რამდენი დარჩა? (Level 1, Picture-based)
  defineTemplate({
    ...addr({ id: 'g2-u05-19', subtopicId: 'u05-expressions-from-pictures', difficulty: 1 }),
    prompt:
      'ხეზე იყო {a} {item}.\n' +
      'მათგან {b} {action}:\n\n' +
      '{vis}\n\n' +
      'რამდენი {item} დარჩა?',
    variables: {
      item: { kind: 'choice', values: ['ვაშლი 🍎', 'მსხალი 🍐', 'ჩიტი 🐦', 'ფორთოხალი 🍊'] },
      action: { kind: 'choice', values: ['მოწყვიტეს', 'ჩამოვარდა', 'გაფრინდა'] },
      a: { kind: 'int', min: 12, max: 18 },
      b: { kind: 'int', min: 4, max: 8 },
      vis: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const b = Number(v.b);
          const icon = String(v.item).split(' ')[1] || '🍎';
          const leftIcons = repeatEmoji(icon, a - b);
          const crossed = repeatEmoji('❌', b);
          return [`დარჩენილი: ${leftIcons} | წაღებული: ${crossed}`];
        },
      },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer}. დარჩა ${answer} ცალი.`,
  }),

  // Q20 — სურათის შესაბამისი გამოსახულება (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-20', subtopicId: 'u05-expressions-from-pictures', difficulty: 1 }),
    prompt:
      'სურათზე სულ იყო {a} {item}. აქედან {b} {action}.\n\n' +
      'რომელი გამოსახულება შეესაბამება დარჩენილი რაოდენობის პოვნას?',
    variables: {
      item: { kind: 'choice', values: ['ბუშტი 🎈', 'პეპელა 🦋', 'ბურთი ⚽'] },
      action: { kind: 'choice', values: ['გაფრინდა', 'გასკდა', 'წაიღეს'] },
      a: { kind: 'int', min: 20, max: 48 },
      b: { kind: 'int', min: 8, max: 15 },
    },
    answer: (v) => `${v.a} − ${v.b}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.a} + ${vars.b}`,
      `${vars.a} − ${Number(vars.b) - 2}`,
      `${Number(vars.a) + 2} − ${vars.b}`,
    ],
    explanation: ({ vars, answer }) =>
      `საწყის რაოდენობას (${vars.a}) უნდა გამოვაკლოთ წასული რაოდენობა (${vars.b}), ამიტომ სწორია ${answer}.`,
  }),

  // Q21 — შეავსე გამოსახულება (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-21', subtopicId: 'u05-expressions-from-pictures', difficulty: 2 }),
    prompt:
      'სურათზე სულ {a} {item}-ია. მათგან {b} გამოყოფილია ჩარჩოთი (წაღებულია).\n\n' +
      'რამდენი {item} დარჩა ჩარჩოს გარეთ?',
    variables: {
      item: { kind: 'choice', values: ['ვარსკვლავი ⭐', 'გული 💖', 'ყვავილი 🌸'] },
      a: { kind: 'int', min: 28, max: 46 },
      b: { kind: 'int', min: 11, max: 19 },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q22 — შეადარე ორი სურათი (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g2-u05-22', subtopicId: 'u05-expressions-from-pictures', difficulty: 2 }),
    prompt:
      'შეადარე ორი სურათის დარჩენილი რაოდენობები:\n\n' +
      'სურათი A: {a} − {b}\n' +
      'სურათი B: {c} − {d}\n\n' +
      'რომელი ნიშანი უნდა ჩაისვას მათ შორის?',
    variables: {
      mode: { kind: 'choice', values: ['eq', 'gt', 'lt'] },
      diffBase: { kind: 'int', min: 12, max: 20 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const m = String(v.mode);
          const d1 = Number(v.diffBase);
          const a = d1 + 13;
          const b = 13;
          let c = 0;
          let d = 0;
          if (m === 'eq') {
            c = d1 + 15;
            d = 15;
          } else if (m === 'gt') {
            c = d1 + 10;
            d = 15; // d2 = d1 - 5 < d1
          } else {
            c = d1 + 20;
            d = 15; // d2 = d1 + 5 > d1
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
      const right = Number(v.c) - Number(v.d);
      return left > right ? '>' : left < right ? '<' : '=';
    },
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => {
      const left = Number(vars.a) - Number(vars.b);
      const right = Number(vars.c) - Number(vars.d);
      return `სურათი A: ${vars.a} − ${vars.b} = ${left}. სურათი B: ${vars.c} − ${vars.d} = ${right}. რადგან ${left} ${answer} ${right}, სწორი ნიშანია '${answer}'.`;
    },
  }),

  // Q23 — იპოვე წაღებული ობიექტები (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-23', subtopicId: 'u05-expressions-from-pictures', difficulty: 3 }),
    prompt:
      'ყუთში იყო {a} ცალი {item}.\n' +
      'რამდენიმე წაიღეს და დარჩა {c} ცალი.\n\n' +
      'რამდენი {item} წაუღიათ?',
    variables: {
      item: { kind: 'choice', values: ['ბურთი ⚽', 'ფანქარი ✏️', 'კუბი 🎲'] },
      a: { kind: 'int', min: 42, max: 65 },
      c: { kind: 'int', min: 18, max: 29 },
    },
    answer: (v) => Number(v.a) - Number(v.c),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `წაღებული რაოდენობის გასაგებად საწყის რაოდენობას ვაკლებთ დარჩენილს: ${vars.a} − ${vars.c} = ${answer}.`,
  }),

  // Q24 — შექმენი გამოსახულება (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-24', subtopicId: 'u05-expressions-from-pictures', difficulty: 3 }),
    prompt:
      'კალათაში იყო {a} {item}. იქიდან ამოიღეს {b} ცალი.\n\n' +
      'რომელი გამოსახულება გვიჩვენებს, რამდენი {item} დარჩა კალათაში?',
    variables: {
      item: { kind: 'choice', values: ['მსხალი 🍐', 'ლიმონი 🍋', 'ატამი 🍑', 'ქლიავი 🫐'] },
      a: { kind: 'int', min: 35, max: 55 },
      b: { kind: 'int', min: 12, max: 24 },
    },
    answer: (v) => `${v.a} − ${v.b}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.a} + ${vars.b}`,
      `${Number(vars.a) + 3} − ${vars.b}`,
      `${vars.a} − ${Number(vars.b) - 2}`,
    ],
    explanation: ({ answer }) =>
      `დარჩენილ რაოდენობას აღწერს გამოკლება: ${answer}.`,
  }),

  // =========================================================================
  // U05.5 — გამოკლების ცხრილი 100-ის ფარგლებში (Q25–Q30)
  // =========================================================================

  // Q25 — შეავსე ცხრილის უჯრა (Level 1, Table cell numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-25', subtopicId: 'u05-subtraction-table-100', difficulty: 1 }),
    prompt:
      'შეავსე ცხრილის ცარიელი უჯრა:\n\n' +
      '| საკლები | მაკლები | სხვაობა |\n' +
      '| :---: | :---: | :---: |\n' +
      '| {a} | {b} | ❓ |\n' +
      '| {c} | {d} | {cdDiff} |\n' +
      '| {e} | {f} | {efDiff} |',
    variables: {
      a: { kind: 'int', min: 55, max: 75 },
      b: { kind: 'int', min: 15, max: 25 },
      c: { kind: 'int', min: 46, max: 52 },
      d: { kind: 'int', min: 12, max: 16 },
      e: { kind: 'int', min: 75, max: 88 },
      f: { kind: 'int', min: 30, max: 35 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const cd = Number(v.c) - Number(v.d);
          const ef = Number(v.e) - Number(v.f);
          return [`${cd};${ef}`];
        },
      },
      cdDiff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      efDiff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `პირველ მწკრივში: ${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q26 — იპოვე გამოტოვებული მაკლები (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-26', subtopicId: 'u05-subtraction-table-100', difficulty: 1 }),
    prompt: 'იპოვე გამოტოვებული მაკლები:\n\n{a} − ❓ = {c}',
    variables: {
      a: { kind: 'int', min: 62, max: 85 },
      c: { kind: 'int', min: 31, max: 48 },
    },
    constraints: [{ test: (v) => Number(v.a) > Number(v.c), note: 'a > c' }],
    answer: (v) => Number(v.a) - Number(v.c),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.c} = ${answer}, ამიტომ ${vars.a} − ${answer} = ${vars.c}.`,
  }),

  // Q27 — ცხრილის წესი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-27', subtopicId: 'u05-subtraction-table-100', difficulty: 2 }),
    prompt:
      'დააკვირდი ცხრილს და ამოიცანი წესი. რა რიცხვი უნდა ეწეროს მესამე მწკრივში?\n\n' +
      '| A | B | შედეგი |\n' +
      '| :---: | :---: | :---: |\n' +
      '| {a1} | {b1} | {ruleDiff} |\n' +
      '| {a2} | {b2} | {ruleDiff} |\n' +
      '| {a3} | {b3} | ❓ |',
    variables: {
      ruleDiff: { kind: 'int', min: 35, max: 45 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const d = Number(v.ruleDiff);
          const b1 = 12;
          const a1 = d + b1;
          const b2 = 25;
          const a2 = d + b2;
          const b3 = 41;
          const a3 = d + b3;
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
    answer: (v) => Number(v.ruleDiff),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `წესია A − B. ${vars.a3} − ${vars.b3} = ${answer}.`,
  }),

  // Q28 — შეავსე ორი უჯრა (Level 2, MC Pair)
  defineTemplate({
    ...addr({ id: 'g2-u05-28', subtopicId: 'u05-subtraction-table-100', difficulty: 2 }),
    prompt:
      'იპოვე გამოტოვებული მაკლები ორივე გამოსახულებაში:\n\n' +
      '1) {a1} − ❓ = {diff1}\n' +
      '2) {a2} − ❓ = {diff2}',
    variables: {
      a1: { kind: 'int', min: 65, max: 78 },
      diff1: { kind: 'int', min: 28, max: 35 },
      a2: { kind: 'int', min: 80, max: 92 },
      diff2: { kind: 'int', min: 38, max: 45 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const sub1 = Number(v.a1) - Number(v.diff1);
          const sub2 = Number(v.a2) - Number(v.diff2);
          return [`${sub1};${sub2}`];
        },
      },
      sub1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      sub2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => `${v.sub1} და ${v.sub2}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const s1 = Number(vars.sub1);
      const s2 = Number(vars.sub2);
      return [
        `${s1 + 1} და ${s2}`,
        `${s1} და ${s2 - 1}`,
        `${s1 - 2} და ${s2 + 2}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `1) ${vars.a1} − ${vars.diff1} = ${vars.sub1}. 2) ${vars.a2} − ${vars.diff2} = ${vars.sub2}. სწორია: ${answer}.`,
  }),

  // Q29 — იპოვე გამოტოვებული სხვაობა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-29', subtopicId: 'u05-subtraction-table-100', difficulty: 3 }),
    prompt:
      'დააკვირდი ცხრილს და შეავსე ცარიელი უჯრა:\n\n' +
      '| საკლები | მაკლები | სხვაობა |\n' +
      '| :---: | :---: | :---: |\n' +
      '| {a1} | {b1} | {targetDiff} |\n' +
      '| {a2} | {b2} | {targetDiff} |\n' +
      '| {a3} | {b3} | ❓ |',
    variables: {
      targetDiff: { kind: 'int', min: 50, max: 68 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const d = Number(v.targetDiff);
          const b1 = 27;
          const a1 = d + b1;
          const b2 = 18;
          const a2 = d + b2;
          const b3 = 11;
          const a3 = d + b3;
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
    answer: (v) => Number(v.targetDiff),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a3} − ${vars.b3} = ${answer}.`,
  }),

  // Q30 — ცხრილის შეცდომა (Level 3, MC Row selection)
  defineTemplate({
    ...addr({ id: 'g2-u05-30', subtopicId: 'u05-subtraction-table-100', difficulty: 3 }),
    prompt:
      'ცხრილში ერთ-ერთ მწკრივში სხვაობა არასწორად არის გამოთვლილი. რომელი მწკრივია მცდარი?\n\n' +
      '| მწკრივი | საკლები | მაკლები | მითითებული სხვაობა |\n' +
      '| :---: | :---: | :---: | :---: |\n' +
      '| I | {a1} | {b1} | {d1} |\n' +
      '| II | {a2} | {b2} | {d2} |\n' +
      '| III | {a3} | {b3} | {d3} |\n' +
      '| IV | {a4} | {b4} | {d4} |',
    variables: {
      wrongRow: { kind: 'choice', values: ['I', 'II', 'III', 'IV'] },
      correctDiff: { kind: 'int', min: 38, max: 48 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const wr = String(v.wrongRow);
          const d = Number(v.correctDiff);
          const b1 = 21;
          const a1 = d + b1;
          const b2 = 32;
          const a2 = d + b2;
          const b3 = 44;
          const a3 = d + b3;
          const b4 = 16;
          const a4 = d + b4;

          const d1 = wr === 'I' ? d + 2 : d;
          const d2 = wr === 'II' ? d + 2 : d;
          const d3 = wr === 'III' ? d + 2 : d;
          const d4 = wr === 'IV' ? d + 2 : d;

          return [`${a1};${b1};${d1};${a2};${b2};${d2};${a3};${b3};${d3};${a4};${b4};${d4}`];
        },
      },
      a1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      d1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      a2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      b2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      d2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      a3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      b3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
      d3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[8]] },
      a4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[9]] },
      b4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[10]] },
      d4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[11]] },
    },
    answer: (v) => `${v.wrongRow} მწკრივი`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const all = ['I მწკრივი', 'II მწკრივი', 'III მწკრივი', 'IV მწკრივი'];
      return all.filter((r) => r !== `${vars.wrongRow} მწკრივი`);
    },
    explanation: ({ vars, answer }) =>
      `${answer}-ში მითითებულია არასწორი სხვაობა, რადგან სწორი სხვაობა უნდა იყოს ${vars.correctDiff}.`,
  }),

  // =========================================================================
  // U05.6 — სიტყვიერი ამოცანები (Q31–Q36)
  // =========================================================================

  // Q31 — ნივთების რაოდენობა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-31', subtopicId: 'u05-word-problems', difficulty: 1 }),
    prompt:
      'მაღაზიაში იყო {a} ცალი {item}.\n' +
      'დღის განმავლობაში გაიყიდა {b} ცალი.\n\n' +
      'რამდენი {item} დარჩა მაღაზიაში?',
    variables: {
      item: { kind: 'choice', values: ['რვეული', 'სახატავი რვეული', 'ფანქრების ნაკრები', 'სათამაშო'] },
      a: { kind: 'int', min: 45, max: 78 },
      b: { kind: 'int', min: 12, max: 25 },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer} ${vars.item}.`,
  }),

  // Q32 — მგზავრები (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-32', subtopicId: 'u05-word-problems', difficulty: 1 }),
    prompt:
      'ავტობუსში იყო {a} მგზავრი.\n' +
      'გაჩერებაზე ჩავიდა {b} მგზავრი.\n\n' +
      'რამდენი მგზავრი დარჩა ავტობუსში?',
    variables: {
      a: { kind: 'int', min: 38, max: 55 },
      b: { kind: 'int', min: 14, max: 22 },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer} მგზავრი.`,
  }),

  // Q33 — წიგნები ბიბლიოთეკაში (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-33', subtopicId: 'u05-word-problems', difficulty: 2 }),
    prompt:
      'სასკოლო ბიბლიოთეკაში თაროზე იდო {a} წიგნი.\n' +
      'მოსწავლეებმა სახლში წასაკითხად გაიტანეს {b} წიგნი.\n\n' +
      'რამდენი წიგნი დარჩა თაროზე?',
    variables: {
      a: { kind: 'int', min: 62, max: 88 },
      b: { kind: 'int', min: 25, max: 39 },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer} წიგნი.`,
  }),

  // Q34 — რამდენით მეტია? (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-34', subtopicId: 'u05-word-problems', difficulty: 2 }),
    prompt:
      '{name1}-ს აქვს {a} {item}, ხოლო {name2}-ს — {b} {item}.\n\n' +
      'რამდენით მეტი {item} აქვს {name1}-ს, ვიდრე {name2}-ს?',
    variables: {
      name1: { kind: 'choice', values: ['ნინო', 'მარიამი', 'ანა', 'ლილე'] },
      name2: { kind: 'choice', values: ['ლუკა', 'სანდრო', 'გიორგი', 'დათო'] },
      item: { kind: 'choice', values: ['სტიკერი', 'მარკა', 'სამკერდე ნიშანი', 'ბარათი'] },
      a: { kind: 'int', min: 45, max: 75 },
      b: { kind: 'int', min: 18, max: 34 },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer}. ${vars.name1}-ს ${answer}-ით მეტი აქვს.`,
  }),

  // Q35 — ორნაბიჯიანი სიტყვიერი ამოცანა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-35', subtopicId: 'u05-word-problems', difficulty: 3 }),
    prompt:
      'კალათაში იყო {a} ცალი {item}.\n' +
      'ჯერ აიღეს {b} ცალი, შემდეგ კი კიდევ {c} ცალი.\n\n' +
      'რამდენი {item} დარჩა კალათაში?',
    variables: {
      item: { kind: 'choice', values: ['ვაშლი', 'ფორთოხალი', 'მსხალი', 'ატამი'] },
      a: { kind: 'int', min: 72, max: 95 },
      b: { kind: 'int', min: 16, max: 28 },
      c: { kind: 'int', min: 14, max: 27 },
    },
    constraints: [{ test: (v) => Number(v.a) - Number(v.b) - Number(v.c) >= 15, note: 'valid remainder' }],
    answer: (v) => Number(v.a) - Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => {
      const step1 = Number(vars.a) - Number(vars.b);
      return `ჯერ დარჩა: ${vars.a} − ${vars.b} = ${step1}. შემდეგ: ${step1} − ${vars.c} = ${answer} ${vars.item}.`;
    },
  }),

  // Q36 — იპოვე უცნობი რაოდენობა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-36', subtopicId: 'u05-word-problems', difficulty: 3 }),
    prompt:
      'ყუთში რამდენიმე {item} იყო.\n' +
      'მას შემდეგ, რაც იქიდან {b} ცალი აიღეს, ყუთში დარჩა {c} ცალი.\n\n' +
      'რამდენი {item} იყო ყუთში თავდაპირველად?',
    variables: {
      item: { kind: 'choice', values: ['ფანქარი', 'კუბი', 'ბურთი', 'სათამაშო'] },
      b: { kind: 'int', min: 18, max: 35 },
      c: { kind: 'int', min: 25, max: 48 },
    },
    answer: (v) => Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 30 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 30, 1),
    explanation: ({ vars, answer }) =>
      `თავდაპირველი რაოდენობის გასაგებად შევკრიბოთ: ${vars.b} + ${vars.c} = ${answer} ${vars.item}.`,
  }),

  // =========================================================================
  // U05.7 — რიცხვის მიღების გზები გამოკლებით (Q37–Q42)
  // =========================================================================

  // Q37 — რომელი რიცხვი უნდა გამოვაკლოთ? (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-37', subtopicId: 'u05-ways-to-make-number', difficulty: 1 }),
    prompt: '{a} − ❓ = {c}\n\nრომელი რიცხვი უნდა გამოვაკლოთ {a}-ს, რომ მივიღოთ {c}?',
    variables: {
      a: { kind: 'int', min: 70, max: 95 },
      diff: { kind: 'int', min: 25, max: 45 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const d = Number(v.diff);
          const c = a - d;
          return [`${a};${c};${d}`];
        },
      },
      c: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      d: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.d),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.c} = ${answer}. შემოწმება: ${vars.a} − ${answer} = ${vars.c}.`,
  }),

  // Q38 — შეავსე რამდენიმე გამოსახულება (Level 1, MC Pair)
  defineTemplate({
    ...addr({ id: 'g2-u05-38', subtopicId: 'u05-ways-to-make-number', difficulty: 1 }),
    prompt:
      'იპოვე გამოტოვებული მაკლები თითოეული გამოსახულებისთვის:\n\n' +
      '1) {a1} − ❓ = {target}\n' +
      '2) {a2} − ❓ = {target}',
    variables: {
      target: { kind: 'int', min: 20, max: 35 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.target);
          const a1 = t + 25;
          const a2 = t + 45;
          const sub1 = a1 - t;
          const sub2 = a2 - t;
          return [`${a1};${a2};${sub1};${sub2}`];
        },
      },
      a1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      a2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      sub1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      sub2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => `${v.sub1} და ${v.sub2}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const s1 = Number(vars.sub1);
      const s2 = Number(vars.sub2);
      return [
        `${s1 + 5} და ${s2}`,
        `${s1} და ${s2 - 5}`,
        `${s1 - 5} და ${s2 + 5}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${vars.a1} − ${vars.target} = ${vars.sub1}, ხოლო ${vars.a2} − ${vars.target} = ${vars.sub2}. სწორია: ${answer}.`,
  }),

  // Q39 — შეადგინე გამოკლება (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-39', subtopicId: 'u05-ways-to-make-number', difficulty: 2 }),
    prompt:
      'საწყისი რიცხვია {a}, ხოლო სხვაობა — {targetDiff}.\n\n' +
      'რომელი გამოკლების ტოლობაა სწორი?',
    variables: {
      a: { kind: 'int', min: 60, max: 85 },
      targetDiff: { kind: 'int', min: 25, max: 40 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const td = Number(v.targetDiff);
          const sub = a - td;
          return [`${a};${sub};${td}`];
        },
      },
      sub: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => `${v.a} − ${v.sub} = ${v.targetDiff}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const sub = Number(vars.sub);
      const td = Number(vars.targetDiff);
      return [
        `${a} − ${sub + 2} = ${td}`,
        `${a} − ${sub - 2} = ${td}`,
        `${a + 2} − ${sub} = ${td}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.sub} = ${vars.targetDiff}, ამიტომ სწორი ტოლობაა: ${answer}.`,
  }),

  // Q40 — იპოვე სხვადასხვა გზა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g2-u05-40', subtopicId: 'u05-ways-to-make-number', difficulty: 2 }),
    prompt:
      'რომელი გამოსახულებების პასუხია {target}?\n\n' +
      'I) {e1}\n' +
      'II) {e2}\n' +
      'III) {e3}\n' +
      'IV) {e4}',
    variables: {
      target: { kind: 'int', min: 20, max: 35 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.target);
          const e1 = `${t + 20} − 20`; // = t
          const e2 = `${t + 30} − 30`; // = t
          const e3 = `${t + 40} − 25`; // = t + 15 != t
          const e4 = `${t + 50} − 50`; // = t
          return [`${e1};${e2};${e3};${e4}`];
        },
      },
      e1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      e2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      e3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      e4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: () => 'I, II და IV',
    format: { kind: 'text' },
    distractors: () => [
      'I და III',
      'II და III',
      'ყველა მათგანი',
    ],
    explanation: ({ vars, answer }) =>
      `I, II და IV გამოსახულებების მნიშვნელობაა ${vars.target}. III-ის კი განსხვავებულია. სწორია: ${answer}.`,
  }),

  // Q41 — შეავსე გამოსახულება პირობით (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-41', subtopicId: 'u05-ways-to-make-number', difficulty: 3 }),
    prompt:
      '{a} − ❓ = {c}\n\n' +
      'ცნობილია, რომ გამოკლებული რიცხვი {bound}-ზე მეტია.\n' +
      'რა რიცხვია გამოტოვებული?',
    variables: {
      a: { kind: 'int', min: 75, max: 94 },
      sub: { kind: 'int', min: 42, max: 55 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const sub = Number(v.sub);
          const c = a - sub;
          const bound = sub - 5;
          return [`${a};${sub};${c};${bound}`];
        },
      },
      subVal: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      c: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      bound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.subVal),
    format: { kind: 'integer', min: 30 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 30, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.c} = ${answer}. ეს რიცხვი ნამდვილად აღემატება ${vars.bound}-ს.`,
  }),

  // Q42 — იპოვე გამოსახულება (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-42', subtopicId: 'u05-ways-to-make-number', difficulty: 3 }),
    prompt: 'რომელი გამოსახულების პასუხია {target}?',
    variables: {
      target: { kind: 'int', min: 25, max: 36 },
      sub: { kind: 'int', min: 28, max: 38 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.target);
          const s = Number(v.sub);
          const a = t + s;
          return [`${a};${s};${t}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      s: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => `${v.a} − ${v.s}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const s = Number(vars.s);
      return [
        `${a + 1} − ${s}`,
        `${a + 2} − ${s}`,
        `${a + 3} − ${s}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${answer} = ${vars.target}, ამიტომ ეს ვარიანტია სწორი.`,
  }),

  // =========================================================================
  // U05.8 — გამოკლებების შედარება (Q43–Q48)
  // =========================================================================

  // Q43 — შეადარე ორი სხვაობა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g2-u05-43', subtopicId: 'u05-comparing-examples', difficulty: 1 }),
    prompt: 'შეადარე ორი სხვაობა:\n\n{a} − {b}  ❓  {c} − {d}\n\nრომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      mode: { kind: 'choice', values: ['eq', 'gt', 'lt'] },
      diffBase: { kind: 'int', min: 25, max: 45 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const m = String(v.mode);
          const d1 = Number(v.diffBase);
          const a = d1 + 20;
          const b = 20;
          let c = 0;
          let d = 0;
          if (m === 'eq') {
            c = d1 + 30;
            d = 30;
          } else if (m === 'gt') {
            c = d1 + 15;
            d = 25; // c - d = d1 - 10 < d1
          } else {
            c = d1 + 35;
            d = 25; // c - d = d1 + 10 > d1
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
      const right = Number(v.c) - Number(v.d);
      return left > right ? '>' : left < right ? '<' : '=';
    },
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => {
      const left = Number(vars.a) - Number(vars.b);
      const right = Number(vars.c) - Number(vars.d);
      return `${vars.a} − ${vars.b} = ${left}, ${vars.c} − ${vars.d} = ${right}. რადგან ${left} ${answer} ${right}, სწორი ნიშანია '${answer}'.`;
    },
  }),

  // Q44 — რომელია მეტი? (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-44', subtopicId: 'u05-comparing-examples', difficulty: 1 }),
    prompt: 'რომელ გამოსახულებას აქვს უდიდესი სხვაობა?\n\nI) {e1}\nII) {e2}\nIII) {e3}',
    variables: {
      base: { kind: 'int', min: 35, max: 45 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const diff1 = b;
          const diff2 = b + 7; // greatest
          const diff3 = b - 3;
          const str1 = `${diff1 + 25} − 25`;
          const str2 = `${diff2 + 20} − 20`;
          const str3 = `${diff3 + 30} − 30`;
          return [`${str1};${str2};${str3};${diff1};${diff2};${diff3}`];
        },
      },
      e1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      e2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      e3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    optionCount: 3,
    options: (v) => [String(v.e1), String(v.e2), String(v.e3)],
    answer: (v) => String(v.e2),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `${vars.e2} არის უდიდესი, რადგან მისი მნიშვნელობა აღემატება დანარჩენებს. სწორია: ${answer}.`,
  }),

  // Q45 — იპოვე ტოლი სხვაობები (Level 2, Pair selection)
  defineTemplate({
    ...addr({ id: 'g2-u05-45', subtopicId: 'u05-comparing-examples', difficulty: 2 }),
    prompt:
      'რომელი ორი გამოსახულების სხვაობებია ერთმანეთის ტოლი?\n\n' +
      'A: {ea}\n' +
      'B: {eb}\n' +
      'C: {ec}',
    variables: {
      diff: { kind: 'int', min: 38, max: 54 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const d = Number(v.diff);
          const ea = `${d + 24} − 24`; // d
          const eb = `${d + 12} − 12`; // d
          const ec = `${d + 35} − 22`; // d + 13
          return [`${ea};${eb};${ec}`];
        },
      },
      ea: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      eb: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      ec: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    optionCount: 3,
    options: () => ['A და B', 'A და C', 'B და C'],
    answer: () => 'A და B',
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `A = ${vars.diff} და B = ${vars.diff}, ხოლო C-ს სხვა მნიშვნელობა აქვს. სწორი წყვილია ${answer}.`,
  }),

  // Q46 — შეადარე გამოკლება და რიცხვი (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g2-u05-46', subtopicId: 'u05-comparing-examples', difficulty: 2 }),
    prompt: 'შეადარე გამოკლების შედეგი და რიცხვი:\n\n{a} − {b}  ❓  {c}\n\nრომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      mode: { kind: 'choice', values: ['lt', 'gt', 'eq'] },
      a: { kind: 'int', min: 72, max: 94 },
      b: { kind: 'int', min: 25, max: 39 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const m = String(v.mode);
          const left = Number(v.a) - Number(v.b);
          let c = left;
          if (m === 'lt') {
            c = left + 2;
          } else if (m === 'gt') {
            c = left - 2;
          }
          return [`${c}`];
        },
      },
      c: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
    },
    optionCount: 3,
    options: () => ['>', '<', '='],
    answer: (v) => {
      const left = Number(v.a) - Number(v.b);
      const right = Number(v.c);
      return left > right ? '>' : left < right ? '<' : '=';
    },
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => {
      const left = Number(vars.a) - Number(vars.b);
      return `${vars.a} − ${vars.b} = ${left}. რადგან ${left} ${answer} ${vars.c}, სწორი ნიშანია '${answer}'.`;
    },
  }),

  // Q47 — იპოვე მცდარი ტოლობა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-47', subtopicId: 'u05-comparing-examples', difficulty: 3 }),
    prompt: 'მოცემული ოთხი ტოლობიდან მხოლოდ ერთია მცდარი. იპოვე მცდარი ტოლობა:\n\n{intro}',
    variables: {
      intro: {
        kind: 'choice',
        values: [
          'ყურადღებით გამოთვალე თითოეული:',
          'შეამოწმე გამოთვლები:',
          'რომელი ტოლობაა არასწორი?',
        ],
      },
      fakeRow: { kind: 'choice', values: ['4', '1', '2', '3'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const r = String(v.fakeRow);
          const eq1 = r === '1' ? '65 − 23 = 45' : '65 − 23 = 42';
          const eq2 = r === '2' ? '74 − 31 = 45' : '74 − 31 = 43';
          const eq3 = r === '3' ? '82 − 47 = 38' : '82 − 47 = 35';
          const eq4 = r === '4' ? '91 − 26 = 66' : '91 − 26 = 65';
          const falseEq = r === '1' ? eq1 : r === '2' ? eq2 : r === '3' ? eq3 : eq4;
          return [`${eq1};${eq2};${eq3};${eq4};${falseEq}`];
        },
      },
      eq1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      eq2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      eq3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      eq4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      falseEq: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.falseEq),
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const all = [String(vars.eq1), String(vars.eq2), String(vars.eq3), String(vars.eq4)];
      return all.filter((e) => e !== String(vars.falseEq));
    },
    explanation: ({ answer }) =>
      `${answer} არის მცდარი ტოლობა. დანარჩენი სამი სწორადაა გამოთვლილი.`,
  }),

  // Q48 — გამოკლებების დალაგება (Level 3, MC Ordering)
  defineTemplate({
    ...addr({ id: 'g2-u05-48', subtopicId: 'u05-comparing-examples', difficulty: 3 }),
    prompt:
      'დაალაგე სამი გამოსახულება მათი სხვაობების ზრდის მიხედვით:\n\n' +
      'I) {e1} = {d1}\n' +
      'II) {e2} = {d2}\n' +
      'III) {e3} = {d3}',
    variables: {
      base: { kind: 'int', min: 38, max: 45 },
      step1: { kind: 'int', min: 2, max: 4 },
      step2: { kind: 'int', min: 2, max: 4 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const d1 = Number(v.base);
          const d2 = d1 + Number(v.step1);
          const d3 = d2 + Number(v.step2);
          const e1 = `${d1 + 28} − 28`;
          const e2 = `${d2 + 39} − 39`;
          const e3 = `${d3 + 17} − 17`;
          return [`${e1};${e2};${e3};${d1};${d2};${d3}`];
        },
      },
      e1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      e2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      e3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      d1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      d2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      d3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => `(${v.e1}), (${v.e2}), (${v.e3})`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `(${vars.e2}), (${vars.e1}), (${vars.e3})`,
      `(${vars.e3}), (${vars.e2}), (${vars.e1})`,
      `(${vars.e1}), (${vars.e3}), (${vars.e2})`,
    ],
    explanation: ({ vars, answer }) =>
      `სხვაობებია ${vars.d1}, ${vars.d2}, ${vars.d3}. ზრდის მიხედვით დალაგებაა: ${answer}.`,
  }),

  // =========================================================================
  // U05.9 — ცხრილის შევსება გადათრევით (Q49–Q54)
  // =========================================================================

  // Q49 — ჩასვი სწორი სხვაობა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-49', subtopicId: 'u05-filling-table', difficulty: 1 }),
    prompt:
      'ჩასვი სწორი სხვაობა ცხრილის ცარიელ უჯრაში:\n\n' +
      '| გამოსახულება | სხვაობა |\n' +
      '| :---: | :---: |\n' +
      '| {e1} | ❓ |\n' +
      '| {e2} | {d} |\n' +
      '| {e3} | {d} |',
    variables: {
      d: { kind: 'int', min: 38, max: 48 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const d = Number(v.d);
          const e1 = `${d + 14} − 14`;
          const e2 = `${d + 25} − 25`;
          const e3 = `${d + 36} − 36`;
          return [`${e1};${e2};${e3}`];
        },
      },
      e1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      e2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      e3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.d),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.e1} = ${answer}.`,
  }),

  // Q50 — შეავსე მაკლები (Level 1, MC Pair)
  defineTemplate({
    ...addr({ id: 'g2-u05-50', subtopicId: 'u05-filling-table', difficulty: 1 }),
    prompt:
      'შეავსე გამოტოვებული მაკლები:\n\n' +
      '1) {a1} − ❓ = {c1}\n' +
      '2) {a2} − ❓ = {c2}',
    variables: {
      a1: { kind: 'int', min: 70, max: 80 },
      c1: { kind: 'int', min: 35, max: 45 },
      a2: { kind: 'int', min: 60, max: 70 },
      c2: { kind: 'int', min: 25, max: 35 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const sub1 = Number(v.a1) - Number(v.c1);
          const sub2 = Number(v.a2) - Number(v.c2);
          return [`${sub1};${sub2}`];
        },
      },
      sub1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      sub2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => `${v.sub1} და ${v.sub2}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const s1 = Number(vars.sub1);
      const s2 = Number(vars.sub2);
      return [
        `${s1 + 2} და ${s2}`,
        `${s1} და ${s2 - 2}`,
        `${s1 - 2} და ${s2 + 2}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `1) ${vars.a1} − ${vars.c1} = ${vars.sub1}. 2) ${vars.a2} − ${vars.c2} = ${vars.sub2}. სწორია: ${answer}.`,
  }),

  // Q51 — დააკავშირე გამოსახულება და პასუხი (Level 2, Matching)
  defineTemplate({
    ...addr({ id: 'g2-u05-51', subtopicId: 'u05-filling-table', difficulty: 2 }),
    prompt:
      'რომელია სწორი შესაბამისობა გამოსახულებებსა და მათ მნიშვნელობებს შორის?\n\n' +
      'I) {e1}\n' +
      'II) {e2}\n' +
      'III) {e3}',
    variables: {
      base: { kind: 'int', min: 38, max: 46 },
      offset: { kind: 'int', min: 15, max: 25 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const r2 = Number(v.base);
          const r3 = r2;
          const r1 = r2 + Number(v.offset);
          const e1 = `${r1 + 21} − 21`;
          const e2 = `${r2 + 32} − 32`;
          const e3 = `${r3 + 27} − 27`;
          return [`${e1};${e2};${e3};${r1};${r2};${r3}`];
        },
      },
      e1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      e2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      e3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      r1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      r2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      r3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => `I → ${v.r1}, II → ${v.r2}, III → ${v.r3}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `I → ${vars.r2}, II → ${vars.r1}, III → ${vars.r3}`,
      `I → ${vars.r1}, II → ${Number(vars.r2) + 2}, III → ${vars.r3}`,
      `I → ${Number(vars.r1) - 2}, II → ${vars.r2}, III → ${vars.r3}`,
    ],
    explanation: ({ vars, answer }) =>
      `${vars.e1} = ${vars.r1}, ${vars.e2} = ${vars.r2}, ${vars.e3} = ${vars.r3}. სწორი შესაბამისობაა: ${answer}.`,
  }),

  // Q52 — შეავსე რიცხვითი ცხრილი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-52', subtopicId: 'u05-filling-table', difficulty: 2 }),
    prompt:
      'გამოთვალე სხვაობები ცხრილის ყველა მწკრივში:\n\n' +
      '| საკლები | მაკლები | სხვაობა |\n' +
      '| :---: | :---: | :---: |\n' +
      '| {a1} | {b1} | ❓ |\n' +
      '| {a2} | {b2} | ❓ |\n' +
      '| {a3} | {b3} | ❓ |\n\n' +
      'რა რიცხვები უნდა ეწეროს სხვაობის სვეტში?',
    variables: {
      diff: { kind: 'int', min: 46, max: 56 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const d = Number(v.diff);
          const b1 = 24;
          const a1 = d + b1;
          const b2 = 37;
          const a2 = d + b2;
          const b3 = 12;
          const a3 = d + b3;
          return [`${a1};${b1};${a2};${b2};${a3};${b3};${d}`];
        },
      },
      a1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      a2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      b2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      a3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      b3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      d: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
    },
    answer: (v) => `${v.d}, ${v.d}, ${v.d}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const d = Number(vars.d);
      return [
        `${d - 2}, ${d}, ${d}`,
        `${d}, ${d + 2}, ${d}`,
        `${d + 10}, ${d}, ${d}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `ყველა მწკრივში სხვაობაა ${vars.d}, ამიტომ სწორი პასუხია: ${answer}.`,
  }),

  // Q53 — შეავსე ორი გამოტოვებული უჯრა (Level 3, MC Pair)
  defineTemplate({
    ...addr({ id: 'g2-u05-53', subtopicId: 'u05-filling-table', difficulty: 3 }),
    prompt:
      'იპოვე გამოტოვებული რიცხვები:\n\n' +
      '1) {a1} − ❓ = {c1}\n' +
      '2) {a2} − ❓ = {c2}',
    variables: {
      a1: { kind: 'int', min: 78, max: 88 },
      c1: { kind: 'int', min: 42, max: 48 },
      a2: { kind: 'int', min: 68, max: 76 },
      c2: { kind: 'int', min: 25, max: 32 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const s1 = Number(v.a1) - Number(v.c1);
          const s2 = Number(v.a2) - Number(v.c2);
          return [`${s1};${s2}`];
        },
      },
      s1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      s2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => `${v.s1} და ${v.s2}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const s1 = Number(vars.s1);
      const s2 = Number(vars.s2);
      return [
        `${s1 + 2} და ${s2}`,
        `${s1} და ${s2 - 2}`,
        `${s1 - 2} და ${s2 + 2}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `1) ${vars.a1} − ${vars.c1} = ${vars.s1}. 2) ${vars.a2} − ${vars.c2} = ${vars.s2}. პასუხია: ${answer}.`,
  }),

  // Q54 — შეასწორე ცხრილი (Level 3, MC Row selection)
  defineTemplate({
    ...addr({ id: 'g2-u05-54', subtopicId: 'u05-filling-table', difficulty: 3 }),
    prompt:
      'ცხრილში მხოლოდ ერთ მწკრივშია შეცდომა. რომელი მწკრივი უნდა შესწორდეს?\n\n' +
      '| მწკრივი | გამოსახულება | მითითებული სხვაობა |\n' +
      '| :---: | :---: | :---: |\n' +
      '| I | {e1} | {d1} |\n' +
      '| II | {e2} | {d2} |\n' +
      '| III | {e3} | {d3} |\n' +
      '| IV | {e4} | {d4} |',
    variables: {
      wrongRow: { kind: 'choice', values: ['III', 'I', 'II', 'IV'] },
      base: { kind: 'int', min: 40, max: 48 },
      delta: { kind: 'int', min: 2, max: 5 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const wr = String(v.wrongRow);
          const b = Number(v.base);
          const delta = Number(v.delta);

          const r1 = b;
          const r2 = b + 10;
          const r3 = b + 3;
          const r4 = b + 10;

          const e1 = `${r1 + 25} − 25`;
          const e2 = `${r2 + 32} − 32`;
          const e3 = `${r3 + 46} − 46`;
          const e4 = `${r4 + 23} − 23`;

          const d1 = wr === 'I' ? String(r1 + delta) : String(r1);
          const d2 = wr === 'II' ? String(r2 + delta) : String(r2);
          const d3 = wr === 'III' ? String(r3 + delta) : String(r3);
          const d4 = wr === 'IV' ? String(r4 + delta) : String(r4);

          return [`${e1};${d1};${e2};${d2};${e3};${d3};${e4};${d4}`];
        },
      },
      e1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      d1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      e2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      d2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      e3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      d3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      e4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      d4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
    },
    answer: (v) => `${v.wrongRow} მწკრივი`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const all = ['I მწკრივი', 'II მწკრივი', 'III მწკრივი', 'IV მწკრივი'];
      return all.filter((r) => r !== `${vars.wrongRow} მწკრივი`);
    },
    explanation: ({ answer }) =>
      `${answer} შეიცავს შეცდომას და საჭიროებს შესწორებას.`,
  }),

  // =========================================================================
  // U05.10 — სამნიშნა რიცხვები: გამოკლების საწყისი წარმოდგენა (Q55–Q60)
  // =========================================================================

  // Q55 — გამოაკელი ასეულები (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-55', subtopicId: 'u05-three-digit-numbers', difficulty: 1 }),
    prompt: '{intro}\n\n{a} − {b} = ?',
    variables: {
      intro: {
        kind: 'choice',
        values: [
          'გამოაკელი სრული ასეულები:',
          'გამოთვალე სხვაობა:',
          'შეასრულე გამოკლება ასეულებში:',
        ],
      },
      aHundreds: { kind: 'int', min: 4, max: 9 },
      bHundreds: { kind: 'int', min: 1, max: 3 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.aHundreds) * 100;
          const b = Number(v.bHundreds) * 100;
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) =>
      `${Number(vars.a) / 100} ასეულს გამოვაკლოთ ${Number(vars.b) / 100} ასეული არის ${Number(answer) / 100} ასეული, ანუ ${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q56 — სამნიშნა რიცხვიდან ორნიშნა რიცხვის გამოკლება (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-56', subtopicId: 'u05-three-digit-numbers', difficulty: 1 }),
    prompt: 'გამოთვალე სხვაობა:\n\n{a} − {b} = ?',
    variables: {
      h: { kind: 'int', min: 2, max: 5 },
      tA: { kind: 'int', min: 4, max: 8 },
      oA: { kind: 'int', min: 5, max: 9 },
      tB: { kind: 'int', min: 1, max: 3 },
      oB: { kind: 'int', min: 1, max: 4 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.h) * 100 + Number(v.tA) * 10 + Number(v.oA);
          const b = Number(v.tB) * 10 + Number(v.oB);
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q57 — გამოტოვებული რიცხვი სამნიშნა გამოკლებაში (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-57', subtopicId: 'u05-three-digit-numbers', difficulty: 2 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი:\n\n{a} − ❓ = {c}',
    variables: {
      h: { kind: 'int', min: 2, max: 6 },
      tensOnes: { kind: 'int', min: 45, max: 95 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.h) * 100 + Number(v.tensOnes);
          const c = Number(v.h) * 100; // result is round hundreds
          const sub = a - c; // sub is two-digit
          return [`${a};${sub};${c}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      sub: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      c: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.sub),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.c} = ${answer}.`,
  }),

  // Q58 — შეადარე სამნიშნა გამოკლებები (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g2-u05-58', subtopicId: 'u05-three-digit-numbers', difficulty: 2 }),
    prompt: 'შეადარე ორი გამოკლების შედეგი:\n\n{a} − {b}  ❓  {c} − {d}\n\nრომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      mode: { kind: 'choice', values: ['eq', 'gt', 'lt'] },
      diffBase: { kind: 'int', min: 400, max: 600 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const m = String(v.mode);
          const d1 = Number(v.diffBase);
          const a = d1 + 120;
          const b = 120;
          let c = 0;
          let d = 0;
          if (m === 'eq') {
            c = d1 + 170;
            d = 170;
          } else if (m === 'gt') {
            c = d1 + 100;
            d = 150; // d2 = d1 - 50 < d1
          } else {
            c = d1 + 200;
            d = 150; // d2 = d1 + 50 > d1
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
      const right = Number(v.c) - Number(v.d);
      return left > right ? '>' : left < right ? '<' : '=';
    },
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => {
      const left = Number(vars.a) - Number(vars.b);
      const right = Number(vars.c) - Number(vars.d);
      return `${vars.a} − ${vars.b} = ${left}, ხოლო ${vars.c} − ${vars.d} = ${right}. რადგან ${left} ${answer} ${right}, სწორი ნიშანია '${answer}'.`;
    },
  }),

  // Q59 — სიტყვიერი ამოცანა სამნიშნა რიცხვებით (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-59', subtopicId: 'u05-three-digit-numbers', difficulty: 3 }),
    prompt:
      'საწყობში იყო {a} ცალი {item}.\n' +
      'მაღაზიებში გასაგზავნად გაიტანეს {b} ცალი.\n\n' +
      'რამდენი {item} დარჩა საწყობში?',
    variables: {
      item: { kind: 'choice', values: ['ყუთი', 'ტვირთი', 'წიგნი', 'პაკეტი'] },
      h: { kind: 'int', min: 3, max: 7 },
      tA: { kind: 'int', min: 4, max: 8 },
      oA: { kind: 'int', min: 5, max: 9 },
      tB: { kind: 'int', min: 1, max: 3 },
      oB: { kind: 'int', min: 0, max: 4 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.h) * 100 + Number(v.tA) * 10 + Number(v.oA);
          const b = Number(v.tB) * 100 + Number(v.oB) * 10;
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer} ${vars.item}.`,
  }),

  // Q60 — იპოვე დაკარგული სამნიშნა საკლები (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-60', subtopicId: 'u05-three-digit-numbers', difficulty: 3 }),
    prompt: 'იპოვე გამოტოვებული საკლები:\n\n❓ − {b} = {c}',
    variables: {
      b: { kind: 'int', min: 120, max: 250 },
      c: { kind: 'int', min: 150, max: 350 },
    },
    answer: (v) => Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 200 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 200, 10),
    explanation: ({ vars, answer }) =>
      `საკლების მოსაძებნად შევკრიბოთ: ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // =========================================================================
  // ნაწილი B — შერეული გამეორება (Q61–Q70)
  // =========================================================================

  // Q61 — ორნიშნა რიცხვების გამოკლება (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-61', subtopicId: 'u05-without-regrouping', difficulty: 1 }),
    prompt: 'შეასრულე გამოკლება:\n\n{a} − {b} = ?',
    variables: {
      tA: { kind: 'int', min: 6, max: 9 },
      oA: { kind: 'int', min: 5, max: 9 },
      tB: { kind: 'int', min: 2, max: 4 },
      oB: { kind: 'int', min: 1, max: 4 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.tA) * 10 + Number(v.oA);
          const b = Number(v.tB) * 10 + Number(v.oB);
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q62 — გამოკლება ათეულის დაშლით (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-62', subtopicId: 'u05-with-regrouping', difficulty: 1 }),
    prompt: 'გამოთვალე ათეულის დაშლით:\n\n{a} − {b} = ?',
    variables: {
      tA: { kind: 'int', min: 6, max: 8 },
      oA: { kind: 'int', min: 1, max: 3 },
      tB: { kind: 'int', min: 2, max: 4 },
      oB: { kind: 'int', min: 6, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.tA) * 10 + Number(v.oA);
          const b = Number(v.tB) * 10 + Number(v.oB);
          return [`${a};${b}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q63 — იპოვე მაკლები (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-63', subtopicId: 'u05-ways-to-make-number', difficulty: 2 }),
    prompt: 'იპოვე გამოტოვებული მაკლები:\n\n{a} − ❓ = {c}',
    variables: {
      a: { kind: 'int', min: 75, max: 98 },
      c: { kind: 'int', min: 38, max: 62 },
    },
    constraints: [{ test: (v) => Number(v.a) > Number(v.c), note: 'a > c' }],
    answer: (v) => Number(v.a) - Number(v.c),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `მაკლების მოსაძებნად: ${vars.a} − ${vars.c} = ${answer}.`,
  }),

  // Q64 — შეადარე ორი სხვაობა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g2-u05-64', subtopicId: 'u05-comparing-examples', difficulty: 2 }),
    prompt: 'შეადარე ორი სხვაობა:\n\n{a} − {b}  ❓  {c} − {d}\n\nრომელი ნიშანი უნდა ჩაისვას ❓-ის ნაცვლად?',
    variables: {
      mode: { kind: 'choice', values: ['eq', 'gt', 'lt'] },
      diffBase: { kind: 'int', min: 45, max: 65 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const m = String(v.mode);
          const d1 = Number(v.diffBase);
          const a = d1 + 28;
          const b = 28;
          let c = 0;
          let d = 0;
          if (m === 'eq') {
            c = d1 + 21;
            d = 21;
          } else if (m === 'gt') {
            c = d1 + 15;
            d = 25;
          } else {
            c = d1 + 35;
            d = 25;
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
      const right = Number(v.c) - Number(v.d);
      return left > right ? '>' : left < right ? '<' : '=';
    },
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => {
      const left = Number(vars.a) - Number(vars.b);
      const right = Number(vars.c) - Number(vars.d);
      return `${vars.a} − ${vars.b} = ${left}, ხოლო ${vars.c} − ${vars.d} = ${right}. რადგან ${left} ${answer} ${right}, სწორი ნიშანია '${answer}'.`;
    },
  }),

  // Q65 — სიტყვიერი ამოცანა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-65', subtopicId: 'u05-word-problems', difficulty: 2 }),
    prompt:
      '{name}-ს ჰქონდა {a} ცალი {item}.\n' +
      'მან მეგობარს აჩუქა {b} ცალი.\n\n' +
      'რამდენი {item} დარჩა {name}-ს?',
    variables: {
      name: { kind: 'choice', values: ['ლუკა', 'სანდრო', 'გიორგი', 'ნიკა'] },
      item: { kind: 'choice', values: ['ბარათი', 'სტიკერი', 'მარკა', 'სათამაშო მანქანა'] },
      a: { kind: 'int', min: 58, max: 85 },
      b: { kind: 'int', min: 24, max: 38 },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer} ${vars.item}.`,
  }),

  // Q66 — ამოცანა ორ მოქმედებაზე (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-66', subtopicId: 'u05-word-problems', difficulty: 3 }),
    prompt:
      'მაღაზიაში იყო {a} ცალი {item}.\n' +
      'პირველ დღეს გაიყიდა {b} ცალი, ხოლო მეორე დღეს — {c} ცალი.\n\n' +
      'რამდენი {item} დარჩა მაღაზიაში?',
    variables: {
      item: { kind: 'choice', values: ['წიგნი', 'რვეული', 'ჩანთა', 'ბურთი'] },
      a: { kind: 'int', min: 85, max: 98 },
      b: { kind: 'int', min: 16, max: 28 },
      c: { kind: 'int', min: 18, max: 29 },
    },
    constraints: [{ test: (v) => Number(v.a) - Number(v.b) - Number(v.c) >= 20, note: 'valid remainder' }],
    answer: (v) => Number(v.a) - Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => {
      const step1 = Number(vars.a) - Number(vars.b);
      return `პირველი დღის შემდეგ: ${vars.a} − ${vars.b} = ${step1}. მეორე დღის შემდეგ: ${step1} − ${vars.c} = ${answer} ${vars.item}.`;
    },
  }),

  // Q67 — იპოვე მცდარი ტოლობა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-67', subtopicId: 'u05-comparing-examples', difficulty: 3 }),
    prompt: 'ოთხი გამოკლებიდან მხოლოდ ერთია არასწორი. აირჩიე მცდარი გამოკლება:\n\n{intro}',
    variables: {
      intro: {
        kind: 'choice',
        values: [
          'შეამოწმე თითოეული ტოლობა:',
          'იპოვე შეცდომა:',
          'რომელი გამოკლებაა მცდარი?',
        ],
      },
      wrongIdx: { kind: 'choice', values: ['4', '1', '2', '3'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const w = String(v.wrongIdx);
          const eq1 = w === '1' ? '74 − 32 = 44' : '74 − 32 = 42';
          const eq2 = w === '2' ? '85 − 43 = 45' : '85 − 43 = 42';
          const eq3 = w === '3' ? '63 − 21 = 44' : '63 − 21 = 42';
          const eq4 = w === '4' ? '91 − 48 = 44' : '91 − 48 = 43';
          const falseEq = w === '1' ? eq1 : w === '2' ? eq2 : w === '3' ? eq3 : eq4;
          return [`${eq1};${eq2};${eq3};${eq4};${falseEq}`];
        },
      },
      eq1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      eq2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      eq3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      eq4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      falseEq: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.falseEq),
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const all = [String(vars.eq1), String(vars.eq2), String(vars.eq3), String(vars.eq4)];
      return all.filter((e) => e !== String(vars.falseEq));
    },
    explanation: ({ answer }) =>
      `${answer} არის მცდარი გამოკლება. დანარჩენი ტოლობები სწორია.`,
  }),

  // Q68 — ცხრილის შევსება (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-68', subtopicId: 'u05-filling-table', difficulty: 3 }),
    prompt:
      'შეავსე გამოტოვებული სხვაობები ცხრილში:\n\n' +
      '| საკლები | მაკლები | სხვაობა |\n' +
      '| :---: | :---: | :---: |\n' +
      '| {a1} | {b1} | ❓ |\n' +
      '| {a2} | {b2} | ❓ |\n' +
      '| {a3} | {b3} | ❓ |\n\n' +
      'რა რიცხვები უნდა ეწეროს სხვაობის სვეტში?',
    variables: {
      diff: { kind: 'int', min: 52, max: 62 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const d = Number(v.diff);
          const b1 = 27;
          const a1 = d + b1;
          const b2 = 16;
          const a2 = d + b2;
          const b3 = 38;
          const a3 = d + b3;
          return [`${a1};${b1};${a2};${b2};${a3};${b3};${d}`];
        },
      },
      a1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      a2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      b2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      a3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      b3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      d: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
    },
    answer: (v) => `${v.d}, ${v.d}, ${v.d}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const d = Number(vars.d);
      return [
        `${d - 1}, ${d}, ${d}`,
        `${d}, ${d + 1}, ${d}`,
        `${d + 5}, ${d}, ${d}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${vars.a1} − ${vars.b1} = ${vars.d}, ${vars.a2} − ${vars.b2} = ${vars.d}, ${vars.a3} − ${vars.b3} = ${vars.d}. სწორია: ${answer}.`,
  }),

  // Q69 — გამოკლების შესაბამისი გამოსახულება (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u05-69', subtopicId: 'u05-with-regrouping', difficulty: 3 }),
    prompt: 'შეარჩიე გამოსახულება, რომლის შედეგიც {target}-ის ტოლია:',
    variables: {
      target: { kind: 'int', min: 35, max: 48 },
      sub: { kind: 'int', min: 25, max: 35 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.target);
          const s = Number(v.sub);
          const a = t + s;
          return [`${a};${s};${t}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      s: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => `${v.a} − ${v.s}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const s = Number(vars.s);
      return [
        `${a - 1} − ${s}`,
        `${a + 1} − ${s}`,
        `${a + 2} − ${s}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${answer} = ${vars.target}, ამიტომ ეს გამოსახულებაა სწორი.`,
  }),

  // Q70 — საბოლოო გამოწვევა (Level 3, Multi-condition Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u05-70', subtopicId: 'u05-ways-to-make-number', difficulty: 3 }),
    prompt:
      'იპოვე რიცხვი n, რომელიც აკმაყოფილებს შემდეგ პირობებს:\n\n' +
      '• {minBound} < n < {maxBound};\n' +
      '• n-ის ერთეულების ციფრი არის {onesDigit};\n' +
      '• n − {sub} = {diff}.\n\n' +
      'რა რიცხვია n?',
    variables: {
      tensVal: { kind: 'int', min: 5, max: 8 },
      subVal: { kind: 'int', min: 15, max: 35 },
      onesChoice: { kind: 'choice', values: [3, 5, 7] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tensVal);
          const o = Number(v.onesChoice);
          const n = t * 10 + o;
          const minBound = (t - 1) * 10;
          const maxBound = (t + 2) * 10;
          const sub = Number(v.subVal);
          const diff = n - sub;
          return [`${n};${minBound};${maxBound};${o};${sub};${diff}`];
        },
      },
      n: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      minBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      maxBound: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      onesDigit: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      sub: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 40 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 40, 10),
    explanation: ({ vars, answer }) =>
      `${answer} აკმაყოფილებს ყველა პირობას: ${vars.minBound} < ${answer} < ${vars.maxBound}, ერთეულების ციფრია ${vars.onesDigit}, ხოლო ${answer} − ${vars.sub} = ${vars.diff}.`,
  }),
];
