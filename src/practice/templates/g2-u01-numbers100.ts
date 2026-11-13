/**
 * Grade 2 — U01: რიცხვები 100-ის ფარგლებში (Numbers to 100).
 *
 * Full curriculum implementation for Grade 2 Unit 1:
 * Sixty templates (Q01–Q60) across eight subtopics with complete Level 1, 2, and 3 coverage:
 *
 *   U01.1 `u01-hundred-chart`       (ასეულების ცხრილი, Q01–Q06, Q49, Q54)       8 templates
 *   U01.2 `u01-numbers-in-words`    (რიცხვები სიტყვებით, Q07–Q12, Q55)          7 templates
 *   U01.3 `u01-ordinal-numbers`     (რიგობითი რიცხვები, Q13–Q18, Q52)           7 templates
 *   U01.4 `u01-tens-and-ones`       (ათეულები და ერთეულები, Q19–Q24, Q50, Q53, Q57, Q60) 10 templates
 *   U01.5 `u01-before-and-after`    (წინ და შემდეგ, Q25–Q30)                    6 templates
 *   U01.6 `u01-number-line-100`     (რიცხვითი ღერძი 100-მდე, Q31–Q36, Q59)      7 templates
 *   U01.7 `u01-largest-and-smallest`(უდიდესი და უმცირესი, Q37–Q42, Q51, Q56)    8 templates
 *   U01.8 `u01-roman-numerals`      (რომაული ციფრები I, V, X, L, Q43–Q48, Q58)  7 templates
 */

import { defineTemplate } from './types';
import type { QuestionTemplate } from './types';
import { georgianNumber, toRoman, fromRoman } from './u04-numbers100';

const grade = 2 as const;
const topicId = 'g2-ricxvebi100' as const;
const unitId = 'g2-ricxvebi100' as const;

export const G2_U01_SUBTOPICS = [
  'u01-hundred-chart',
  'u01-numbers-in-words',
  'u01-ordinal-numbers',
  'u01-tens-and-ones',
  'u01-before-and-after',
  'u01-number-line-100',
  'u01-largest-and-smallest',
  'u01-roman-numerals',
] as const;

export type G2U01SubtopicId = (typeof G2_U01_SUBTOPICS)[number];

const addr = (spec: { id: string; subtopicId: G2U01SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  id: spec.id,
  grade,
  topicId,
  unitId,
  subtopicId: spec.subtopicId,
  difficulty: spec.difficulty,
});

/** Helper for near miss distractors */
const nearMisses = (answer: number): number[] => {
  const candidates = [answer - 1, answer + 1, answer - 2, answer + 2, answer - 10, answer + 10];
  return candidates.filter((n) => n >= 0 && n !== answer);
};

/** Visual snippet of the hundred chart around a target cell */
export function chartSnippet(target: number): string {
  const row = Math.floor((target - 1) / 10);
  const col = (target - 1) % 10;
  const rStart = Math.max(0, Math.min(7, row - 1));
  const cStart = Math.max(0, Math.min(7, col - 1));
  const lines: string[] = [];
  for (let r = rStart; r < rStart + 3; r += 1) {
    const cells: string[] = [];
    for (let c = cStart; c < cStart + 3; c += 1) {
      const val = r * 10 + c + 1;
      if (val === target) {
        cells.push(`👉[${String(val).padStart(2)}]`);
      } else {
        cells.push(`  [${String(val).padStart(2)}]`);
      }
    }
    lines.push(cells.join(' '));
  }
  return lines.join('\n');
}

/** Visual 3x3 snippet of the hundred chart with an erroneous center value */
export function drawFaultyGridSnippet(startRow: number, startCol: number, wrongCenter: number): string {
  const lines: string[] = [];
  for (let r = 0; r < 3; r += 1) {
    const cells: string[] = [];
    for (let c = 0; c < 3; c += 1) {
      const currR = startRow + r;
      const currC = startCol + c;
      const trueVal = (currR - 1) * 10 + currC;
      if (r === 1 && c === 1) {
        cells.push(`[${String(wrongCenter).padStart(2)}]`);
      } else {
        cells.push(`[${String(trueVal).padStart(2)}]`);
      }
    }
    lines.push(cells.join(' '));
  }
  return lines.join('\n');
}

/** Visual representation of base-10 blocks */
export function blockModelVisual(tens: number, ones: number): string {
  const tensRow = Array.from({ length: tens }, () => '[10]').join(' ');
  const onesRow = Array.from({ length: ones }, () => '▫️').join(' ');
  return `ათეულები: ${tensRow}\nერთეულები: ${onesRow}`;
}

/** Visual representation of number line around a marked point */
export function numberLineSnippet(target: number): string {
  const start = Math.max(0, target - 15);
  const marks: string[] = [];
  for (let i = start; i <= start + 30; i += 5) {
    marks.push(i === target ? `[▼${i}]` : `${i}`);
  }
  return marks.join(' — ');
}

export const G2_U01_TEMPLATES: QuestionTemplate[] = [
  // ==================================================================
  // U01.1 — ასეულების ცხრილი (u01-hundred-chart)
  // ==================================================================

  // Q01 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-01', subtopicId: 'u01-hundred-chart', difficulty: 1 }),
    prompt: 'შეხედე ასეულების ცხრილის ამ მონაკვეთს. რომელ რიცხვზე მიუთითებს ისარი (👉)?\n\n{visual}',
    variables: {
      n: { kind: 'int', min: 1, max: 100 },
      visual: { kind: 'choice', values: (v) => [chartSnippet(Number(v.n))] },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 1, max: 100 },
    optionCount: 3,
    distractors: ({ answer }) => {
      const n = Number(answer);
      const c1 = n > 1 ? n - 1 : n + 2;
      const c2 = n < 100 ? n + 1 : n - 2;
      return [c1, c2];
    },
    explanation: ({ answer }) => `ისარი მიუთითებს უჯრაზე, რომელშიც წერია ${answer}.`,
  }),

  // Q02 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-02', subtopicId: 'u01-hundred-chart', difficulty: 1 }),
    prompt: 'ასეულების ცხრილში {n}-ის მარჯვნივ რომელი რიცხვია?',
    variables: {
      n: { kind: 'int', min: 1, max: 99 },
    },
    constraints: [{ test: (v) => Number(v.n) % 10 !== 0, note: 'not in 10th column' }],
    answer: (v) => Number(v.n) + 1,
    format: { kind: 'integer', min: 1, max: 100 },
    optionCount: 3,
    distractors: ({ vars }) => {
      const n = Number(vars.n);
      return [n - 1 >= 1 ? n - 1 : n + 2, n + 10 <= 100 ? n + 10 : n - 10];
    },
    explanation: ({ vars, answer }) =>
      `ასეულების ცხრილში მარჯვნივ ერთი უჯრით გადასვლისას რიცხვი ერთით იზრდება: ${vars.n} + 1 = ${answer}.`,
  }),

  // Q03 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-03', subtopicId: 'u01-hundred-chart', difficulty: 2 }),
    prompt: 'ასეულების ცხრილში იპოვე რიცხვი მე-{r} მწკრივისა და მე-{c} სვეტის გადაკვეთაზე.',
    variables: {
      r: { kind: 'int', min: 1, max: 10 },
      c: { kind: 'int', min: 1, max: 10 },
    },
    answer: (v) => 10 * (Number(v.r) - 1) + Number(v.c),
    format: { kind: 'integer', min: 1, max: 100, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `მე-${vars.r} მწკრივში და მე-${vars.c} სვეტში არის 10 × (${vars.r} − 1) + ${vars.c} = ${answer}.`,
  }),

  // Q04 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-04', subtopicId: 'u01-hundred-chart', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {a}, {b}, □, {d}.',
    variables: {
      start: {
        kind: 'choice',
        values: [
          1, 2, 3, 4, 5, 6, 11, 12, 13, 14, 15, 16, 21, 22, 23, 24, 25, 26,
          31, 32, 33, 34, 35, 36, 41, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 56,
          61, 62, 63, 64, 65, 66, 71, 72, 73, 74, 75, 76, 81, 82, 83, 84, 85, 86,
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + 1] },
      d: { kind: 'choice', values: (v) => [Number(v.start) + 3] },
    },
    answer: (v) => Number(v.start) + 2,
    format: { kind: 'integer', min: 1, max: 100, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ answer }) => `რიცხვები მარცხნიდან მარჯვნივ ერთით იზრდება: გამოტოვებულია ${answer}.`,
  }),

  // Q05 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-05', subtopicId: 'u01-hundred-chart', difficulty: 3 }),
    prompt: 'ასეულების ცხრილში დაიწყე {n}-დან. გადადი ორი უჯრით მარჯვნივ და ერთი მწკრივით ქვემოთ. რომელ რიცხვზე მოხვდები?',
    variables: {
      n: { kind: 'int', min: 1, max: 88 },
    },
    constraints: [{ test: (v) => (Number(v.n) - 1) % 10 <= 7, note: 'can move 2 right' }],
    answer: (v) => Number(v.n) + 12,
    format: { kind: 'integer', min: 1, max: 100 },
    optionCount: 3,
    distractors: ({ vars }) => [Number(vars.n) + 2, Number(vars.n) + 11],
    explanation: ({ vars, answer }) =>
      `ორი უჯრით მარჯვნივ გადასვლა უმატებს 2-ს, ხოლო ერთი მწკრივით ქვემოთ — 10-ს: ${vars.n} + 2 + 10 = ${answer}.`,
  }),

  // Q06 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-06', subtopicId: 'u01-hundred-chart', difficulty: 3 }),
    prompt: 'ასეულების ცხრილის ამ 3×3 მონაკვეთში ერთ უჯრაში შეცდომით წერია {wrongVal}. რომელი რიცხვი უნდა ეწეროს ამ უჯრაში?\n\n{gridVisual}',
    variables: {
      startRow: { kind: 'int', min: 1, max: 7 },
      startCol: { kind: 'int', min: 1, max: 7 },
      wrongVal: {
        kind: 'choice',
        values: (v) => {
          const center = (Number(v.startRow) + 1 - 1) * 10 + (Number(v.startCol) + 1);
          return [center + 5, center - 4, center + 7];
        },
      },
      gridVisual: {
        kind: 'choice',
        values: (v) => [drawFaultyGridSnippet(Number(v.startRow), Number(v.startCol), Number(v.wrongVal))],
      },
    },
    answer: (v) => (Number(v.startRow) + 1 - 1) * 10 + (Number(v.startCol) + 1),
    format: { kind: 'integer', min: 1, max: 100 },
    optionCount: 3,
    distractors: ({ vars, answer }) => [Number(vars.wrongVal), Number(answer) + 2],
    explanation: ({ answer }) =>
      `თითოეულ მწკრივში რიცხვები ერთით იზრდება, ხოლო თითოეულ სვეტში — 10-ით. ამ უჯრაში უნდა ეწეროს ${answer}.`,
  }),

  // ==================================================================
  // U01.2 — რიცხვები სიტყვებით (u01-numbers-in-words)
  // ==================================================================

  // Q07 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-07', subtopicId: 'u01-numbers-in-words', difficulty: 1 }),
    prompt: 'როგორ ჩაიწერება რიცხვი {n} სიტყვებით?',
    variables: {
      n: { kind: 'int', min: 1, max: 20 },
    },
    answer: (v) => georgianNumber(Number(v.n)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const n = Number(vars.n);
      const w1 = n > 1 ? georgianNumber(n - 1) : georgianNumber(n + 2);
      const w2 = n < 20 ? georgianNumber(n + 1) : georgianNumber(n - 2);
      return [w1, w2];
    },
    explanation: ({ vars, answer }) => `${vars.n} სიტყვებით ჩაიწერება: „${answer}“.`,
  }),

  // Q08 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-08', subtopicId: 'u01-numbers-in-words', difficulty: 1 }),
    prompt: 'რომელ რიცხვს ნიშნავს სიტყვა „{word}“?',
    variables: {
      n: { kind: 'int', min: 21, max: 99 },
      word: { kind: 'choice', values: (v) => [georgianNumber(Number(v.n))] },
    },
    constraints: [{ test: (v) => Math.floor(Number(v.n) / 10) !== Number(v.n) % 10, note: 'digits differ' }],
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 1, max: 100 },
    optionCount: 3,
    distractors: ({ answer }) => {
      const n = Number(answer);
      const tens = Math.floor(n / 10);
      const ones = n % 10;
      const flipped = ones !== 0 ? ones * 10 + tens : n + 2;
      const d2 = n > 30 ? n - 10 : n + 10;
      return [flipped !== n ? flipped : n + 5, d2 !== n && d2 !== flipped ? d2 : n + 1];
    },
    explanation: ({ vars, answer }) => `„${vars.word}“ ნიშნავს რიცხვს ${answer}.`,
  }),

  // Q09 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-09', subtopicId: 'u01-numbers-in-words', difficulty: 2 }),
    prompt: 'როგორ ჩაიწერება {n} სიტყვებით?',
    variables: {
      n: { kind: 'int', min: 21, max: 99 },
    },
    constraints: [{ test: (v) => Math.floor(Number(v.n) / 10) !== Number(v.n) % 10, note: 'digits differ' }],
    answer: (v) => georgianNumber(Number(v.n)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const n = Number(vars.n);
      const tens = Math.floor(n / 10);
      const ones = n % 10;
      const flipped = ones !== 0 ? ones * 10 + tens : (n > 30 ? n - 10 : n + 10);
      const d2 = n > 30 ? n - 10 : n + 10;
      const w1 = georgianNumber(flipped !== n ? flipped : (n + 1 <= 100 ? n + 1 : n - 1));
      const w2 = georgianNumber(d2 !== n && d2 !== flipped ? d2 : (n + 2 <= 100 ? n + 2 : n - 2));
      return [w1, w2];
    },
    explanation: ({ vars, answer }) => `${vars.n} სწორად ჩაიწერება როგორც „${answer}“.`,
  }),

  // Q10 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-10', subtopicId: 'u01-numbers-in-words', difficulty: 2 }),
    prompt: 'რომელი რიცხვი შეესაბამება მოცემულ სიტყვიერ ჩანაწერს „{word}“?',
    variables: {
      t: { kind: 'int', min: 2, max: 9 },
      u: { kind: 'int', min: 1, max: 9 },
      word: { kind: 'choice', values: (v) => [georgianNumber(Number(v.t) * 10 + Number(v.u))] },
    },
    constraints: [{ test: (v) => Number(v.t) !== Number(v.u), note: 'digits differ' }],
    answer: (v) => Number(v.t) * 10 + Number(v.u),
    format: { kind: 'integer', min: 1, max: 100 },
    optionCount: 3,
    distractors: ({ vars }) => [Number(vars.u) * 10 + Number(vars.t), Number(vars.t) * 10],
    explanation: ({ vars, answer }) => `სიტყვიერი ჩანაწერი „${vars.word}“ შეესაბამება რიცხვს ${answer}.`,
  }),

  // Q11 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-11', subtopicId: 'u01-numbers-in-words', difficulty: 3 }),
    prompt: 'რიცხვს აქვს {t} ათეული და {u} ერთეული. ჩაწერე მიღებული რიცხვი:',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      u: { kind: 'int', min: 0, max: 9 },
    },
    answer: (v) => Number(v.t) * 10 + Number(v.u),
    format: { kind: 'integer', min: 10, max: 99, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `ათეულების რაოდენობა მრავლდება 10-ზე (10 × ${vars.t} = ${Number(vars.t) * 10}), შემდეგ ემატება ${vars.u}: ${answer}.`,
  }),

  // Q12 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-12', subtopicId: 'u01-numbers-in-words', difficulty: 3 }),
    prompt: 'რომელი რიცხვია მეტი: „{wordA}“ თუ „{wordB}“?',
    variables: {
      a: { kind: 'int', min: 1, max: 99 },
      b: { kind: 'int', min: 1, max: 99 },
      wordA: { kind: 'choice', values: (v) => [georgianNumber(Number(v.a))] },
      wordB: { kind: 'choice', values: (v) => [georgianNumber(Number(v.b))] },
    },
    constraints: [{ test: (v) => Number(v.a) !== Number(v.b), note: 'distinct' }],
    answer: (v) => (Number(v.a) > Number(v.b) ? String(v.wordA) : String(v.wordB)),
    format: { kind: 'text' },
    optionCount: 3,
    options: (v) => [String(v.wordA), String(v.wordB), 'ტოლია'],
    explanation: ({ vars, answer }) => `„${vars.wordA}“ = ${vars.a}, „${vars.wordB}“ = ${vars.b}. მათ შორის მეტია „${answer}“.`,
  }),

  // ==================================================================
  // U01.3 — რიგობითი რიცხვები (u01-ordinal-numbers)
  // ==================================================================

  // Q13 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-13', subtopicId: 'u01-ordinal-numbers', difficulty: 1 }),
    prompt: 'ბავშვები რიგში დგანან (მარცხნიდან მარჯვნივ): {line}. ვინ დგას პირველი?',
    variables: {
      p1: { kind: 'choice', values: ['ნინო', 'გიორგი', 'ანა', 'ლუკა', 'მარიამი', 'დავითი'] },
      p2: { kind: 'choice', values: ['საბა', 'ელენე', 'თეკლა', 'ნიკოლოზი', 'ქეთევანი'] },
      p3: { kind: 'choice', values: ['ირაკლი', 'სალომე', 'ალექსანდრე', 'ბარბარე'] },
      line: { kind: 'choice', values: (v) => [`${v.p1}, ${v.p2}, ${v.p3}`] },
    },
    answer: (v) => String(v.p1),
    format: { kind: 'text' },
    optionCount: 3,
    options: (v) => [String(v.p1), String(v.p2), String(v.p3)],
    explanation: ({ answer }) => `რიგის დასაწყისში დგას ${answer}, ამიტომ ის პირველია.`,
  }),

  // Q14 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-14', subtopicId: 'u01-ordinal-numbers', difficulty: 1 }),
    prompt: 'სათამაშოები რიგში დგანან მარცხნიდან მარჯვნივ: {line}. რომელი სათამაშოა რიგში მესამე?',
    variables: {
      t1: { kind: 'choice', values: ['🐻 დათუნია', '🚗 მანქანა', '⚽ ბურთი'] },
      t2: { kind: 'choice', values: ['🤖 რობოტი', '🚀 რაკეტა', '🚂 მატარებელი'] },
      t3: { kind: 'choice', values: ['🐰 კურდღელი', '🥁 დოლი', '🚁 ვერტმფრენი'] },
      t4: { kind: 'choice', values: ['⛵ გემი', '🎨 საღებავები', '🧩 ფაზლი'] },
      line: { kind: 'choice', values: (v) => [`${v.t1}, ${v.t2}, ${v.t3}, ${v.t4}`] },
    },
    answer: (v) => String(v.t3),
    format: { kind: 'text' },
    optionCount: 3,
    options: (v) => [String(v.t3), String(v.t2), String(v.t4)],
    explanation: ({ answer }) => `მარცხნიდან მესამე სათამაშოა ${answer}.`,
  }),

  // Q15 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-15', subtopicId: 'u01-ordinal-numbers', difficulty: 2 }),
    prompt: '{name1} რიგში მე-{k}-ეა, ხოლო {name2} {name1}-ის უშუალოდ შემდეგ დგას. მერამდენეა {name2}?',
    variables: {
      k: { kind: 'int', min: 2, max: 18 },
      name1: { kind: 'choice', values: ['ანა', 'ნიკა', 'სალომე', 'დათო', 'ლილე'] },
      name2: { kind: 'choice', values: ['ლუკა', 'საბა', 'მარიამი', 'გიორგი', 'თორნიკე'] },
    },
    answer: (v) => `მე-${Number(v.k) + 1}-ე`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [`მე-${Number(vars.k) - 1}-ე`, `მე-${Number(vars.k) + 2}-ე`],
    explanation: ({ vars, answer }) =>
      `${vars.name1}-ის შემდეგ მდგომი ადამიანი ერთი ადგილით უკანაა, ამიტომ ${vars.name2} ${answer} ადგილზეა.`,
  }),

  // Q16 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-16', subtopicId: 'u01-ordinal-numbers', difficulty: 2 }),
    prompt: 'რიგში დგანან: პირველი — {p1}, მეორე — {p2}, მესამე — □, მეოთხე — {p4}. ვინ შეიძლება იდგეს მესამე ადგილზე?',
    variables: {
      p1: { kind: 'choice', values: ['ნინო', 'მარიამი', 'ელენე'] },
      p2: { kind: 'choice', values: ['გიორგი', 'დავითი', 'სანდრო'] },
      p3: { kind: 'choice', values: ['ლუკა', 'საბა', 'ნიკოლოზი'] },
      p4: { kind: 'choice', values: ['ანა', 'თეკლა', 'ლიზი'] },
      extra: { kind: 'choice', values: ['თორნიკე', 'ბექა', 'ირაკლი'] },
    },
    answer: (v) => String(v.p3),
    format: { kind: 'text' },
    optionCount: 3,
    options: (v) => [String(v.p3), String(v.p1), String(v.extra)],
    explanation: ({ answer }) => `მესამე ადგილი მეორე და მეოთხე ადგილებს შორის მდებარეობს, იქ დგას ${answer}.`,
  }),

  // Q17 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-17', subtopicId: 'u01-ordinal-numbers', difficulty: 3 }),
    prompt: '{nameA} {nameB}-ს წინ დგას, ხოლო {nameB} {nameC}-ს წინ. ვინ დგას რიგში მესამე ადგილზე, თუ სულ სამი ბავშვია?',
    variables: {
      nameA: { kind: 'choice', values: ['ნინო', 'ანა', 'მარიამი', 'ლილე'] },
      nameB: { kind: 'choice', values: ['ლუკა', 'საბა', 'ნიკა', 'გიორგი'] },
      nameC: { kind: 'choice', values: ['დათო', 'სანდრო', 'ერეკლე', 'ვაჟა'] },
    },
    constraints: [
      {
        test: (v) => v.nameA !== v.nameB && v.nameB !== v.nameC && v.nameA !== v.nameC,
        note: 'distinct names',
      },
    ],
    answer: (v) => String(v.nameC),
    format: { kind: 'text' },
    optionCount: 3,
    options: (v) => [String(v.nameC), String(v.nameA), String(v.nameB)],
    explanation: ({ vars, answer }) =>
      `რიგის სწორი მიმდევრობაა: 1. ${vars.nameA}, 2. ${vars.nameB}, 3. ${vars.nameC}. მესამე ადგილზე დგას ${answer}.`,
  }),

  // Q18 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-18', subtopicId: 'u01-ordinal-numbers', difficulty: 3 }),
    prompt: 'მორბენალი მე-{startPos}-ე ადგილზე იყო. მან {passed} მონაწილეს გაასწრო. რომელ ადგილზე გადავიდა?',
    variables: {
      startPos: { kind: 'int', min: 4, max: 15 },
      passed: { kind: 'int', min: 1, max: 3 },
    },
    answer: (v) => `მე-${Number(v.startPos) - Number(v.passed)}-ე`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => {
      const newPos = Number(vars.startPos) - Number(vars.passed);
      return [`მე-${newPos - 1}-ე`, `მე-${newPos + 1}-ე`];
    },
    explanation: ({ vars, answer }) =>
      `მე-${vars.startPos}-ე ადგილიდან ${vars.passed} ადგილის წინ გადასვლა ნიშნავს ${answer} ადგილზე გადასვლას.`,
  }),

  // ==================================================================
  // U01.4 — ათეულები და ერთეულები (u01-tens-and-ones)
  // ==================================================================

  // Q19 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-19', subtopicId: 'u01-tens-and-ones', difficulty: 1 }),
    prompt: 'რამდენი ათეული და რამდენი ერთეული აქვს რიცხვს {n}?',
    variables: {
      t: { kind: 'int', min: 2, max: 9 },
      u: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.t) * 10 + Number(v.u)] },
    },
    constraints: [{ test: (v) => Number(v.t) !== Number(v.u), note: 'digits differ' }],
    answer: (v) => `${v.t} ათეული და ${v.u} ერთეული`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [`${vars.u} ათეული და ${vars.t} ერთეული`, `${vars.t} ათეული და 0 ერთეული`],
    explanation: ({ vars, answer }) => `${vars.n} = ${Number(vars.t) * 10} + ${vars.u}, ანუ მას აქვს ${answer}.`,
  }),

  // Q20 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-20', subtopicId: 'u01-tens-and-ones', difficulty: 1 }),
    prompt: 'სურათზე ნაჩვენებია {t} ათეულის შეკვრა და {u} ცალკეული კუბი. რომელი რიცხვია გამოსახული?\n\n{modelVisual}',
    variables: {
      t: { kind: 'int', min: 1, max: 8 },
      u: { kind: 'int', min: 1, max: 9 },
      modelVisual: { kind: 'choice', values: (v) => [blockModelVisual(Number(v.t), Number(v.u))] },
    },
    constraints: [{ test: (v) => Number(v.t) !== Number(v.u), note: 'distinct' }],
    answer: (v) => Number(v.t) * 10 + Number(v.u),
    format: { kind: 'integer', min: 1, max: 100 },
    optionCount: 3,
    distractors: ({ vars }) => [Number(vars.t) * 10, Number(vars.u) * 10 + Number(vars.t)],
    explanation: ({ vars, answer }) =>
      `${vars.t} ათეული უდრის ${Number(vars.t) * 10}-ს, ხოლო ${vars.u} ერთეული — ${vars.u}-ს. ერთად მიიღება ${answer}.`,
  }),

  // Q21 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-21', subtopicId: 'u01-tens-and-ones', difficulty: 2 }),
    prompt: 'დაშალე რიცხვი {n} ათეულებად და ერთეულებად: {n} = □ + {u}. რა რიცხვი უნდა ეწეროს □-ის ნაცვლად?',
    variables: {
      t: { kind: 'int', min: 2, max: 9 },
      u: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.t) * 10 + Number(v.u)] },
    },
    answer: (v) => Number(v.t) * 10,
    format: { kind: 'integer', min: 10, max: 90, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} შედგება ${vars.t} ათეულისა (${answer}) და ${vars.u} ერთეულისგან.`,
  }),

  // Q22 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-22', subtopicId: 'u01-tens-and-ones', difficulty: 2 }),
    prompt: 'რომელი რიცხვია მეტი: {a} თუ {b}?',
    variables: {
      t: { kind: 'int', min: 2, max: 9 },
      u: { kind: 'int', min: 1, max: 9 },
      a: { kind: 'choice', values: (v) => [Number(v.t) * 10 + Number(v.u)] },
      b: { kind: 'choice', values: (v) => [Number(v.u) * 10 + Number(v.t)] },
    },
    constraints: [{ test: (v) => Number(v.t) !== Number(v.u), note: 'distinct digits' }],
    answer: (v) => Math.max(Number(v.a), Number(v.b)),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 3,
    options: (v) => [Math.max(Number(v.a), Number(v.b)), Math.min(Number(v.a), Number(v.b)), 100],
    explanation: ({ answer }) => `${answer}-ს აქვს მეტი ათეული, ამიტომ ის მეტია.`,
  }),

  // Q23 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-23', subtopicId: 'u01-tens-and-ones', difficulty: 3 }),
    prompt: 'რიცხვს აქვს {u} ერთეული და სულ {n}-ს უდრის. რამდენი ათეული აქვს მას?',
    variables: {
      t: { kind: 'int', min: 2, max: 9 },
      u: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.t) * 10 + Number(v.u)] },
    },
    answer: (v) => Number(v.t),
    format: { kind: 'integer', min: 1, max: 9, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} = ${Number(vars.t) * 10} + ${vars.u}, ანუ მას აქვს ${answer} ათეული.`,
  }),

  // Q24 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-24', subtopicId: 'u01-tens-and-ones', difficulty: 3 }),
    prompt: 'რიცხვს აქვს {t} ათეული და {u} ერთეული. თუ მის ერთეულებს 2-ს დავუმატებთ, მივიღებთ {m}-ს. იპოვე საწყისი რიცხვი:',
    variables: {
      t: { kind: 'int', min: 2, max: 8 },
      u: { kind: 'int', min: 1, max: 7 },
      m: { kind: 'choice', values: (v) => [Number(v.t) * 10 + Number(v.u) + 2] },
    },
    answer: (v) => Number(v.m) - 2,
    format: { kind: 'integer', min: 10, max: 99, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `საწყისი რიცხვის მისაღებად დამატებული 2 უნდა გამოვაკლოთ: ${vars.m} − 2 = ${answer}.`,
  }),

  // ==================================================================
  // U01.5 — წინა და მომდევნო რიცხვები (u01-before-and-after)
  // ==================================================================

  // Q25 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-25', subtopicId: 'u01-before-and-after', difficulty: 1 }),
    prompt: 'რომელი რიცხვია {n}-ის უშუალოდ წინ?',
    variables: {
      n: { kind: 'int', min: 10, max: 100 },
    },
    answer: (v) => Number(v.n) - 1,
    format: { kind: 'integer', min: 1, max: 99, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `წინა რიცხვის მისაღებად ერთს ვაკლებთ: ${vars.n} − 1 = ${answer}.`,
  }),

  // Q26 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-26', subtopicId: 'u01-before-and-after', difficulty: 1 }),
    prompt: 'რომელი რიცხვია {n}-ის უშუალოდ შემდეგ?',
    variables: {
      n: { kind: 'int', min: 10, max: 99 },
    },
    answer: (v) => Number(v.n) + 1,
    format: { kind: 'integer', min: 11, max: 100, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `მომდევნო რიცხვის მისაღებად ერთს ვუმატებთ: ${vars.n} + 1 = ${answer}.`,
  }),

  // Q27 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-27', subtopicId: 'u01-before-and-after', difficulty: 2 }),
    prompt: 'რომელი რიცხვია {n}-ზე 10-ით მეტი?',
    variables: {
      n: { kind: 'int', min: 11, max: 89 },
    },
    answer: (v) => Number(v.n) + 10,
    format: { kind: 'integer', min: 1, max: 100 },
    optionCount: 3,
    distractors: ({ vars }) => [Number(vars.n) + 1, Number(vars.n) + 9],
    explanation: ({ vars, answer }) => `${vars.n} + 10 = ${answer}.`,
  }),

  // Q28 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-28', subtopicId: 'u01-before-and-after', difficulty: 2 }),
    prompt: 'რომელი რიცხვია {n}-ზე 20-ით ნაკლები?',
    variables: {
      n: { kind: 'int', min: 25, max: 99 },
    },
    answer: (v) => Number(v.n) - 20,
    format: { kind: 'integer', min: 1, max: 100 },
    optionCount: 3,
    distractors: ({ vars }) => [Number(vars.n) - 10, Number(vars.n) - 2],
    explanation: ({ vars, answer }) => `${vars.n} − 20 = ${answer}.`,
  }),

  // Q29 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-29', subtopicId: 'u01-before-and-after', difficulty: 3 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი მიმდევრობაში: {a}, {b}, □, {d}, {e}.',
    variables: {
      start: { kind: 'int', min: 11, max: 59 },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + 10] },
      d: { kind: 'choice', values: (v) => [Number(v.start) + 30] },
      e: { kind: 'choice', values: (v) => [Number(v.start) + 40] },
    },
    answer: (v) => Number(v.start) + 20,
    format: { kind: 'integer', min: 10, max: 99, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ answer }) => `თითოეული მომდევნო რიცხვი წინაზე 10-ით მეტია: გამოტოვებულია ${answer}.`,
  }),

  // Q30 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-30', subtopicId: 'u01-before-and-after', difficulty: 3 }),
    prompt: 'ორ მეზობელ რიცხვს შორის შუაში მოცემულია {n}. რომელია მისი წინა და მომდევნო რიცხვები?',
    variables: {
      n: { kind: 'int', min: 15, max: 95 },
    },
    answer: (v) => `${Number(v.n) - 1} და ${Number(v.n) + 1}`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [`${Number(vars.n) - 10} და ${Number(vars.n) + 10}`, `${Number(vars.n) - 2} და ${Number(vars.n) + 2}`],
    explanation: ({ vars }) => `${vars.n}-ის წინა რიცხვია ${Number(vars.n) - 1}, ხოლო მომდევნო — ${Number(vars.n) + 1}.`,
  }),

  // ==================================================================
  // U01.6 — რიცხვითი ღერძი 100-მდე (u01-number-line-100)
  // ==================================================================

  // Q31 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-31', subtopicId: 'u01-number-line-100', difficulty: 1 }),
    prompt: 'რიცხვით ღერძზე ისრით (▼) მონიშნულია ერთი წერტილი. რომელ რიცხვს შეესაბამება იგი?\n\n{lineVisual}',
    variables: {
      n: {
        kind: 'choice',
        values: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90],
      },
      lineVisual: { kind: 'choice', values: (v) => [numberLineSnippet(Number(v.n))] },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 1, max: 100 },
    optionCount: 3,
    distractors: ({ vars }) => [Number(vars.n) - 5, Number(vars.n) + 5],
    explanation: ({ answer }) => `მონიშნული წერტილი შეესაბამება რიცხვს ${answer}.`,
  }),

  // Q32 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-32', subtopicId: 'u01-number-line-100', difficulty: 1 }),
    prompt: 'რიცხვით ღერძზე (0, 10, 20, ..., 100) რომელ ორ ათეულს შორის მდებარეობს რიცხვი {n}?',
    variables: {
      t: { kind: 'int', min: 1, max: 8 },
      u: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.t) * 10 + Number(v.u)] },
    },
    answer: (v) => `${Number(v.t) * 10}-სა და ${(Number(v.t) + 1) * 10}-ს შორის`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [
      `${(Number(vars.t) - 1) * 10}-სა და ${Number(vars.t) * 10}-ს შორის`,
      `${(Number(vars.t) + 1) * 10}-სა და ${(Number(vars.t) + 2) * 10}-ს შორის`,
    ],
    explanation: ({ vars, answer }) => `${vars.n} მდებარეობს ${answer}.`,
  }),

  // Q33 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-33', subtopicId: 'u01-number-line-100', difficulty: 2 }),
    prompt: 'რიცხვით ღერძზე დაიწყე {start}-დან და გადადი {step} ერთეულით მარჯვნივ. რომელ რიცხვზე მოხვდები?',
    variables: {
      start: { kind: 'int', min: 10, max: 85 },
      step: { kind: 'int', min: 3, max: 9 },
    },
    answer: (v) => Number(v.start) + Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    optionCount: 3,
    distractors: ({ vars, answer }) => [Number(vars.start) - Number(vars.step), Number(answer) + 1],
    explanation: ({ vars, answer }) =>
      `მარჯვნივ გადაადგილება რიცხვს ზრდის: ${vars.start} + ${vars.step} = ${answer}.`,
  }),

  // Q34 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-34', subtopicId: 'u01-number-line-100', difficulty: 2 }),
    prompt: 'რიცხვით ღერძზე დაიწყე {start}-დან და გადადი {step} ერთეულით მარცხნივ. რომელ რიცხვზე მოხვდები?',
    variables: {
      start: { kind: 'int', min: 20, max: 95 },
      step: { kind: 'int', min: 4, max: 9 },
    },
    answer: (v) => Number(v.start) - Number(v.step),
    format: { kind: 'integer', min: 1, max: 100, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `მარცხნივ გადაადგილება რიცხვს ამცირებს: ${vars.start} − ${vars.step} = ${answer}.`,
  }),

  // Q35 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-35', subtopicId: 'u01-number-line-100', difficulty: 3 }),
    prompt: 'რიცხვით ღერძზე დაიწყე {start}-დან. გადადი 10 ერთეულით მარჯვნივ, შემდეგ კი {step} ერთეულით მარცხნივ. რომელ რიცხვზე მოხვდები?',
    variables: {
      start: { kind: 'int', min: 20, max: 80 },
      step: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v) => Number(v.start) + 10 - Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    optionCount: 3,
    distractors: ({ vars }) => [Number(vars.start) + 10 + Number(vars.step), Number(vars.start) - 10 + Number(vars.step)],
    explanation: ({ vars, answer }) => `${vars.start} + 10 − ${vars.step} = ${answer}.`,
  }),

  // Q36 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-36', subtopicId: 'u01-number-line-100', difficulty: 3 }),
    prompt: 'რიცხვით ღერძზე {step} ერთეულით მარჯვნივ გადაადგილების შემდეგ მივიღეთ {finish}. საიდან დავიწყეთ?',
    variables: {
      finish: { kind: 'int', min: 20, max: 95 },
      step: { kind: 'int', min: 3, max: 9 },
    },
    answer: (v) => Number(v.finish) - Number(v.step),
    format: { kind: 'integer', min: 1, max: 100, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `საწყისი რიცხვის საპოვნელად ${vars.finish}-ს ვაკლებთ ${vars.step}-ს: ${vars.finish} − ${vars.step} = ${answer}.`,
  }),

  // ==================================================================
  // U01.7 — უდიდესი და უმცირესი რიცხვები (u01-largest-and-smallest)
  // ==================================================================

  // Q37 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-37', subtopicId: 'u01-largest-and-smallest', difficulty: 1 }),
    prompt: 'რომელი რიცხვია უდიდესი: {a}, {b} თუ {c}?',
    variables: {
      a: { kind: 'int', min: 10, max: 99 },
      b: { kind: 'int', min: 10, max: 99 },
      c: { kind: 'int', min: 10, max: 99 },
    },
    constraints: [{ test: (v) => v.a !== v.b && v.b !== v.c && v.a !== v.c, note: 'distinct' }],
    answer: (v) => Math.max(Number(v.a), Number(v.b), Number(v.c)),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 3,
    options: (v) => [Number(v.a), Number(v.b), Number(v.c)],
    explanation: ({ answer }) => `უდიდესია ${answer}.`,
  }),

  // Q38 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-38', subtopicId: 'u01-largest-and-smallest', difficulty: 1 }),
    prompt: 'რომელი რიცხვია უმცირესი: {a}, {b} თუ {c}?',
    variables: {
      a: { kind: 'int', min: 10, max: 99 },
      b: { kind: 'int', min: 10, max: 99 },
      c: { kind: 'int', min: 10, max: 99 },
    },
    constraints: [{ test: (v) => v.a !== v.b && v.b !== v.c && v.a !== v.c, note: 'distinct' }],
    answer: (v) => Math.min(Number(v.a), Number(v.b), Number(v.c)),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 3,
    options: (v) => [Number(v.a), Number(v.b), Number(v.c)],
    explanation: ({ answer }) => `უმცირესია ${answer}.`,
  }),

  // Q39 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-39', subtopicId: 'u01-largest-and-smallest', difficulty: 2 }),
    prompt: 'მოცემულია რიცხვები: {a}, {b}, {c} და {d}. რომელია უდიდესი?',
    variables: {
      a: { kind: 'int', min: 10, max: 99 },
      b: { kind: 'int', min: 10, max: 99 },
      c: { kind: 'int', min: 10, max: 99 },
      d: { kind: 'int', min: 10, max: 99 },
    },
    constraints: [{ test: (v) => new Set([v.a, v.b, v.c, v.d]).size === 4, note: '4 distinct' }],
    answer: (v) => Math.max(Number(v.a), Number(v.b), Number(v.c), Number(v.d)),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 3,
    distractors: ({ vars, answer }) =>
      [Number(vars.a), Number(vars.b), Number(vars.c), Number(vars.d)]
        .filter((x) => x !== Number(answer))
        .slice(0, 2),
    explanation: ({ answer }) => `მოცემულ რიცხვებს შორის უდიდესია ${answer}.`,
  }),

  // Q40 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-40', subtopicId: 'u01-largest-and-smallest', difficulty: 2 }),
    prompt: '{instruction}',
    variables: {
      instruction: {
        kind: 'choice',
        values: [
          'დაალაგე რიცხვები მცირედან დიდისკენ (ზრდადობით):',
          'დაალაგე მოცემული რიცხვები ზრდადობით (ჯერ უმცირესი):',
          'დაალაგე რიცხვები ზრდადი თანმიმდევრობით:',
        ],
      },
      items: {
        kind: 'list',
        pick: {
          values: [26, 36, 62, 63, 15, 51, 24, 42, 37, 73, 48, 84, 59, 95],
          length: 4,
          unique: true,
        },
      },
    },
    shuffle: { source: 'items', direction: 'asc' },
    format: { kind: 'text' },
    answer: (_v, ctx) => {
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((a, b) => a - b);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    explanation: ({ vars }) =>
      `რიცხვები ზრდადობით: ${([...(vars.items as number[])].sort((a, b) => a - b)).join(', ')}.`,
  }),

  // Q41 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-41', subtopicId: 'u01-largest-and-smallest', difficulty: 3 }),
    prompt: 'ციფრებით {d1} და {d2} შეადგინე უდიდესი ორნიშნა რიცხვი ისე, რომ თითოეული ციფრი ერთხელ გამოიყენო:',
    variables: {
      d1: { kind: 'int', min: 1, max: 9 },
      d2: { kind: 'int', min: 1, max: 9 },
    },
    constraints: [{ test: (v) => Number(v.d1) !== Number(v.d2), note: 'distinct digits' }],
    answer: (v) => Math.max(Number(v.d1), Number(v.d2)) * 10 + Math.min(Number(v.d1), Number(v.d2)),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 3,
    distractors: ({ vars }) => {
      const big = Math.max(Number(vars.d1), Number(vars.d2));
      const small = Math.min(Number(vars.d1), Number(vars.d2));
      return [small * 10 + big, big * 10 + big];
    },
    explanation: ({ answer }) =>
      `უდიდესი რიცხვის შესადგენად უფრო დიდი ციფრი ათეულების ადგილზე უნდა მოვათავსოთ: ${answer}.`,
  }),

  // Q42 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-42', subtopicId: 'u01-largest-and-smallest', difficulty: 3 }),
    prompt: 'რომელი რიცხვია {min}-ზე მეტი, {max}-ზე ნაკლები, აქვს {u} ერთეული და {t} ათეული?',
    variables: {
      t: { kind: 'int', min: 3, max: 8 },
      u: { kind: 'int', min: 1, max: 9 },
      min: { kind: 'choice', values: (v) => [(Number(v.t) - 1) * 10] },
      max: { kind: 'choice', values: (v) => [(Number(v.t) + 1) * 10] },
    },
    constraints: [{ test: (v) => Number(v.t) !== Number(v.u), note: 'digits differ' }],
    answer: (v) => Number(v.t) * 10 + Number(v.u),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 3,
    distractors: ({ vars }) => [Number(vars.u) * 10 + Number(vars.t), (Number(vars.t) + 1) * 10 + Number(vars.u)],
    explanation: ({ vars, answer }) =>
      `${vars.t} ათეული და ${vars.u} ერთეული ქმნის რიცხვს ${answer}, რომელიც აკმაყოფილებს ყველა პირობას.`,
  }),

  // ==================================================================
  // U01.8 — რომაული რიცხვები I, V, X, L (u01-roman-numerals)
  // ==================================================================

  // Q43 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-43', subtopicId: 'u01-roman-numerals', difficulty: 1 }),
    prompt: 'რომელ რიცხვს აღნიშნავს რომაული სიმბოლო „{symbol}“?',
    variables: {
      symbol: { kind: 'choice', values: ['I', 'V', 'X', 'L'] },
    },
    answer: (v) => ({ I: 1, V: 5, X: 10, L: 50 }[String(v.symbol)]!),
    format: { kind: 'integer', min: 1, max: 50 },
    optionCount: 3,
    distractors: ({ answer }) => {
      const all = [1, 5, 10, 50];
      return all.filter((x) => x !== Number(answer)).slice(0, 2);
    },
    explanation: ({ vars, answer }) => `რომაული სიმბოლო „${vars.symbol}“ აღნიშნავს ${answer}-ს.`,
  }),

  // Q44 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-44', subtopicId: 'u01-roman-numerals', difficulty: 1 }),
    prompt: 'რომელი რომაული სიმბოლო აღნიშნავს რიცხვს {val}?',
    variables: {
      val: { kind: 'choice', values: [1, 5, 10, 50] },
    },
    answer: (v) => ({ 1: 'I', 5: 'V', 10: 'X', 50: 'L' }[Number(v.val)]!),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ answer }) => {
      const all = ['I', 'V', 'X', 'L'];
      return all.filter((x) => x !== answer).slice(0, 2);
    },
    explanation: ({ vars, answer }) => `${vars.val} რომაული სიმბოლოთი აღინიშნება როგორც „${answer}“.`,
  }),

  // Q45 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-45', subtopicId: 'u01-roman-numerals', difficulty: 2 }),
    prompt: 'რას უდრის რომაული რიცხვი „{roman}“?',
    variables: {
      val: {
        kind: 'choice',
        values: [
          2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 30,
        ],
      },
      roman: { kind: 'choice', values: (v) => [toRoman(Number(v.val))] },
    },
    answer: (v) => Number(v.val),
    format: { kind: 'integer', min: 1, max: 35 },
    optionCount: 3,
    distractors: ({ answer }) => [Number(answer) - 1, Number(answer) + 1],
    explanation: ({ vars, answer }) => `„${vars.roman}“ = ${answer}.`,
  }),

  // Q46 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-46', subtopicId: 'u01-roman-numerals', difficulty: 2 }),
    prompt: 'როგორ ჩაიწერება {val} რომაული რიცხვებით?',
    variables: {
      val: {
        kind: 'choice',
        values: [
          2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 30,
        ],
      },
    },
    answer: (v) => toRoman(Number(v.val)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [toRoman(Number(vars.val) - 1), toRoman(Number(vars.val) + 1)],
    explanation: ({ vars, answer }) => `${vars.val} რომაულად ჩაიწერება: „${answer}“.`,
  }),

  // Q47 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-47', subtopicId: 'u01-roman-numerals', difficulty: 3 }),
    prompt: 'რომელი რიცხვია მეტი: „{romA}“ თუ „{romB}“?',
    variables: {
      pair: {
        kind: 'choice',
        values: [
          'XII,XV',
          'VII,IX',
          'XIV,XVI',
          'XI,VIII',
          'XX,XXV',
          'VI,IV',
          'XVIII,XXI',
          'IX,XI',
          'XIII,XVII',
          'XXII,XXIV',
          'XXVI,XXIX',
          'XXX,XXXV',
          'XV,XIX',
          'XVI,XVIII',
          'V,VII',
          'VIII,X',
          'XI,XIII',
          'XXI,XXIII',
          'XXV,XXVIII',
          'XXVII,XXX',
          'IV,VIII',
          'IX,XII',
          'XIV,XVIII',
          'XIX,XXII',
        ],
      },
      romA: { kind: 'choice', values: (v) => [String(v.pair).split(',')[0]] },
      romB: { kind: 'choice', values: (v) => [String(v.pair).split(',')[1]] },
    },
    answer: (v) =>
      fromRoman(String(v.romA)) > fromRoman(String(v.romB)) ? String(v.romA) : String(v.romB),
    format: { kind: 'text' },
    optionCount: 3,
    options: (v) => [String(v.romA), String(v.romB), 'ტოლია'],
    explanation: ({ vars, answer }) =>
      `„${vars.romA}“ = ${fromRoman(String(vars.romA))}, ხოლო „${vars.romB}“ = ${fromRoman(String(vars.romB))}. მეტია „${answer}“.`,
  }),

  // Q48 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-48', subtopicId: 'u01-roman-numerals', difficulty: 3 }),
    prompt: 'რომელი ჩანაწერი აღნიშნავს {target}-ს?',
    variables: {
      target: {
        kind: 'choice',
        values: [12, 15, 16, 19, 20, 21, 24, 25, 29, 30, 35, 40],
      },
    },
    answer: (v) => toRoman(Number(v.target)),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const t = Number(vars.target);
      const candidates = [
        toRoman(t - 1 > 0 ? t - 1 : 1),
        toRoman(t + 1),
        toRoman(t + 5),
        toRoman(t - 5 > 0 ? t - 5 : 2),
      ].filter((cand) => cand !== answer);
      return [candidates[0], candidates[1]];
    },
    explanation: ({ vars, answer }) => `${vars.target} სწორად ჩაიწერება როგორც „${answer}“.`,
  }),

  // ==================================================================
  // შერეული მიმოხილვა — U01 (Q49–Q60)
  // ==================================================================

  // Q49 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-49', subtopicId: 'u01-hundred-chart', difficulty: 1 }),
    prompt: 'ასეულების ცხრილში მონიშნულია რიცხვი, რომელიც {lowTen}-ის შემდეგ და {highTen}-ის წინ მდებარეობს. რომელი შეიძლება იყოს ეს რიცხვი?',
    variables: {
      lowTen: { kind: 'choice', values: [20, 30, 40, 50, 60, 70] },
      offset: { kind: 'int', min: 1, max: 9 },
      highTen: { kind: 'choice', values: (v) => [Number(v.lowTen) + 10] },
    },
    answer: (v) => Number(v.lowTen) + Number(v.offset),
    format: { kind: 'integer', min: 1, max: 100 },
    optionCount: 3,
    distractors: ({ vars }) => [Number(vars.lowTen) - 5, Number(vars.lowTen) + 15],
    explanation: ({ vars, answer }) => `${vars.lowTen}-სა და ${vars.highTen}-ს შორის მდებარეობს ${answer}.`,
  }),

  // Q50 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u01-50', subtopicId: 'u01-tens-and-ones', difficulty: 1 }),
    prompt: 'რამდენი ათეულია რიცხვში {n}?',
    variables: {
      t: { kind: 'int', min: 2, max: 9 },
      u: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.t) * 10 + Number(v.u)] },
    },
    constraints: [{ test: (v) => Number(v.t) !== Number(v.u), note: 'distinct' }],
    answer: (v) => `${v.t} ათეული`,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars }) => [`${vars.u} ათეული`, `${Number(vars.t) + 1} ათეული`],
    explanation: ({ vars, answer }) => `${vars.n} = ${Number(vars.t) * 10} + ${vars.u}, ამიტომ მასში არის ${answer}.`,
  }),

  // Q51 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-51', subtopicId: 'u01-largest-and-smallest', difficulty: 2 }),
    prompt: '{instruction}',
    variables: {
      instruction: {
        kind: 'choice',
        values: [
          'დაალაგე რიცხვები მცირედან დიდისკენ (ზრდადობით):',
          'დაალაგე მოცემული რიცხვები ზრდადობით:',
          'დაალაგე რიცხვები მცირედან დიდისკენ:',
        ],
      },
      items: {
        kind: 'list',
        pick: {
          values: [19, 91, 29, 90, 18, 81, 28, 82, 37, 73, 47, 74],
          length: 4,
          unique: true,
        },
      },
    },
    shuffle: { source: 'items', direction: 'asc' },
    format: { kind: 'text' },
    answer: (_v, ctx) => {
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((a, b) => a - b);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    explanation: ({ vars }) =>
      `სწორი თანმიმდევრობაა: ${([...(vars.items as number[])].sort((a, b) => a - b)).join(', ')}.`,
  }),

  // Q52 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u01-52', subtopicId: 'u01-ordinal-numbers', difficulty: 2 }),
    prompt: 'ხუთი ყუთი დგას რიგში: {boxesVisual}. რომელი ყუთია მე-{pos}-ე, თუ მარცხნიდან ვითვლით?',
    variables: {
      palette: {
        kind: 'choice',
        values: [
          'წითელი,ლურჯი,მწვანე,ყვითელი,იისფერი',
          'ლურჯი,მწვანე,ყვითელი,იისფერი,ნარინჯისფერი',
          'მწვანე,ყვითელი,იისფერი,ნარინჯისფერი,წითელი',
        ],
      },
      pos: { kind: 'int', min: 2, max: 5 },
      boxesVisual: {
        kind: 'choice',
        values: (v) => {
          const colors = String(v.palette).split(',');
          return [colors.map((c) => `[📦 ${c}]`).join('  ')];
        },
      },
    },
    answer: (v) => String(v.palette).split(',')[Number(v.pos) - 1]!,
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ vars, answer }) => {
      const all = String(vars.palette).split(',');
      return all.filter((x) => x !== answer).slice(0, 2);
    },
    explanation: ({ vars, answer }) => `მარცხნიდან მე-${vars.pos}-ე ყუთია ${answer}.`,
  }),

  // Q53 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-53', subtopicId: 'u01-tens-and-ones', difficulty: 3 }),
    prompt: 'რიცხვი {low}-ზე მეტია, {high}-ზე ნაკლები და იყოფა 10-ზე (ბოლოვდება 0-ით). რომელია ეს რიცხვი?',
    variables: {
      target: { kind: 'choice', values: [20, 30, 40, 50, 60, 70, 80] },
      dLow: { kind: 'choice', values: [3, 5, 7] },
      dHigh: { kind: 'choice', values: [3, 5, 7] },
      low: { kind: 'choice', values: (v) => [Number(v.target) - Number(v.dLow)] },
      high: { kind: 'choice', values: (v) => [Number(v.target) + Number(v.dHigh)] },
    },
    answer: (v) => Number(v.target),
    format: { kind: 'integer', min: 10, max: 90 },
    optionCount: 3,
    options: (v) => [
      Number(v.target),
      Number(v.target) - 10,
      Number(v.target) + 10,
    ],
    explanation: ({ vars, answer }) =>
      `${vars.low}-სა და ${vars.high}-ს შორის 10-ის ჯერადი (0-ით დაბოლოებული) ერთადერთი რიცხვია ${answer}.`,
  }),

  // Q54 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-54', subtopicId: 'u01-hundred-chart', difficulty: 3 }),
    prompt: 'ასეულების ცხრილში ორი უჯრით ქვემოთ გადასვლის შემდეგ მიიღე {finish}. საიდან დაიწყე?',
    variables: {
      finish: { kind: 'int', min: 31, max: 99 },
    },
    answer: (v) => Number(v.finish) - 20,
    format: { kind: 'integer', min: 11, max: 79, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `ორი მწკრივით ქვემოთ გადასვლა რიცხვს 20-ს უმატებს, ამიტომ ${vars.finish} − 20 = ${answer}.`,
  }),

  // Q55 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-55', subtopicId: 'u01-numbers-in-words', difficulty: 3 }),
    prompt: 'რომელი რაოდენობა შეესაბამება სიტყვას „{word}“?',
    variables: {
      t: { kind: 'int', min: 2, max: 9 },
      u: { kind: 'int', min: 1, max: 9 },
      word: { kind: 'choice', values: (v) => [georgianNumber(Number(v.t) * 10 + Number(v.u))] },
    },
    constraints: [{ test: (v) => Number(v.t) !== Number(v.u), note: 'distinct digits' }],
    answer: (v) => Number(v.t) * 10 + Number(v.u),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 3,
    distractors: ({ vars }) => [Number(vars.u) * 10 + Number(vars.t), Number(vars.t) * 10],
    explanation: ({ vars, answer }) => `„${vars.word}“ ნიშნავს ${vars.t} ათეულსა და ${vars.u} ერთეულს: ${answer}.`,
  }),

  // Q56 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-56', subtopicId: 'u01-largest-and-smallest', difficulty: 3 }),
    prompt: 'მოცემულია რიცხვები: {a}, {b}, {c} და {d}. რამდენია უდიდეს და უმცირეს რიცხვებს შორის სხვაობა?',
    variables: {
      a: { kind: 'int', min: 10, max: 99 },
      b: { kind: 'int', min: 10, max: 99 },
      c: { kind: 'int', min: 10, max: 99 },
      d: { kind: 'int', min: 10, max: 99 },
    },
    constraints: [{ test: (v) => new Set([v.a, v.b, v.c, v.d]).size === 4, note: '4 distinct' }],
    answer: (v) =>
      Math.max(Number(v.a), Number(v.b), Number(v.c), Number(v.d)) -
      Math.min(Number(v.a), Number(v.b), Number(v.c), Number(v.d)),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const vals = [Number(vars.a), Number(vars.b), Number(vars.c), Number(vars.d)];
      const maxVal = Math.max(...vals);
      const minVal = Math.min(...vals);
      return `უდიდესია ${maxVal}, უმცირესია ${minVal}; ${maxVal} − ${minVal} = ${answer}.`;
    },
  }),

  // Q57 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-57', subtopicId: 'u01-tens-and-ones', difficulty: 3 }),
    prompt: 'რიცხვს აქვს {t} ათეული და {u} ერთეული. რომელი რიცხვია მასზე 10-ით ნაკლები?',
    variables: {
      t: { kind: 'int', min: 2, max: 9 },
      u: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v) => (Number(v.t) - 1) * 10 + Number(v.u),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 3,
    distractors: ({ vars }) => [
      Number(vars.t) * 10 + Number(vars.u) - 1,
      Number(vars.t) * 10 + Number(vars.u) + 10,
    ],
    explanation: ({ vars, answer }) =>
      `საწყისი რიცხვია ${Number(vars.t) * 10 + Number(vars.u)}. მასზე 10-ით ნაკლებია ${answer}.`,
  }),

  // Q58 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-58', subtopicId: 'u01-roman-numerals', difficulty: 3 }),
    prompt: 'რომელი ჩანაწერი აღნიშნავს უფრო დიდ რიცხვს: „{romA}“ თუ „{romB}“?',
    variables: {
      pair: {
        kind: 'choice',
        values: [
          'XIV,XVI',
          'IX,XI',
          'XIX,XXI',
          'XII,XV',
          'IV,VI',
          'VII,VIII',
          'XXIV,XXVI',
          'XVI,XX',
          'XXI,XXV',
          'XXVIII,XXXI',
          'XXXII,XXXV',
          'XIII,XVIII',
          'XXIII,XXVII',
          'XI,XIV',
          'XV,XVII',
          'XXII,XXVI',
          'XXVII,XXIX',
          'VIII,XII',
        ],
      },
      romA: { kind: 'choice', values: (v) => [String(v.pair).split(',')[0]] },
      romB: { kind: 'choice', values: (v) => [String(v.pair).split(',')[1]] },
    },
    answer: (v) =>
      fromRoman(String(v.romA)) > fromRoman(String(v.romB)) ? String(v.romA) : String(v.romB),
    format: { kind: 'text' },
    optionCount: 3,
    options: (v) => [String(v.romA), String(v.romB), 'ტოლია'],
    explanation: ({ vars, answer }) =>
      `„${vars.romA}“ = ${fromRoman(String(vars.romA))}, „${vars.romB}“ = ${fromRoman(String(vars.romB))}. უფრო დიდია „${answer}“.`,
  }),

  // Q59 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-59', subtopicId: 'u01-number-line-100', difficulty: 3 }),
    prompt: 'დაიწყე {start}-დან. გადადი 10 ერთეულით მარჯვნივ, შემდეგ {step} ერთეულით მარცხნივ. რომელ რიცხვზე მოხვდები?',
    variables: {
      start: { kind: 'int', min: 20, max: 80 },
      step: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v) => Number(v.start) + 10 - Number(v.step),
    format: { kind: 'integer', min: 1, max: 100, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.start} + 10 − ${vars.step} = ${answer}.`,
  }),

  // Q60 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u01-60', subtopicId: 'u01-tens-and-ones', difficulty: 3 }),
    prompt: 'იპოვე რიცხვი, რომელიც {low}-ზე მეტია, {high}-ზე ნაკლები, აქვს {u} ერთეული და მისი ათეულების რაოდენობაა {t}:',
    variables: {
      t: { kind: 'int', min: 3, max: 8 },
      u: { kind: 'int', min: 1, max: 9 },
      low: { kind: 'choice', values: (v) => [(Number(v.t) - 1) * 10] },
      high: { kind: 'choice', values: (v) => [(Number(v.t) + 1) * 10] },
    },
    constraints: [{ test: (v) => Number(v.t) !== Number(v.u), note: 'digits differ' }],
    answer: (v) => Number(v.t) * 10 + Number(v.u),
    format: { kind: 'integer', min: 10, max: 99 },
    optionCount: 3,
    distractors: ({ vars }) => [Number(vars.u) * 10 + Number(vars.t), (Number(vars.t) + 1) * 10 + Number(vars.u)],
    explanation: ({ vars, answer }) =>
      `${vars.t} ათეული და ${vars.u} ერთეული ქმნის რიცხვს ${answer}, რომელიც ყველა პირობას აკმაყოფილებს.`,
  }),
];
