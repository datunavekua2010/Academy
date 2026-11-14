/**
 * Grade 3 — U01: რიცხვები 100-მდე (Numbers up to 100).
 *
 * Full curriculum implementation for Grade 3 Unit 1 from Google Drive document U01:
 * 48 templates (Q01–Q48) across eight subtopics with complete Level 1, 2, and 3 coverage:
 *
 *   U01.1 `u01-hundred-chart`        (ასეულთა ცხრილი, Q01–Q06)                  6 templates
 *   U01.2 `u01-numbers-in-words`     (რიცხვები სიტყვიერად, Q07–Q12)              6 templates
 *   U01.3 `u01-ordinal-numbers`      (რიგობითი რიცხვები, Q13–Q18)                6 templates
 *   U01.4 `u01-tens-and-ones`        (ათეულები და ერთეულები, Q19–Q24)            6 templates
 *   U01.5 `u01-before-and-after`     (წინა და მომდევნო რიცხვები, Q25–Q30)        6 templates
 *   U01.6 `u01-number-line`          (რიცხვითი ღერძი 100-მდე, Q31–Q36)           6 templates
 *   U01.7 `u01-largest-and-smallest` (უდიდესი და უმცირესი რიცხვები, Q37–Q42)     6 templates
 *   U01.8 `u01-roman-numerals`       (რომაული ციფრები I, V, X, L, Q43–Q48)       6 templates
 */

import { defineTemplate } from './types';
import type { QuestionTemplate } from './types';
import { georgianNumber, toRoman } from './u04-numbers100';

const grade = 3 as const;
const topicId = 'g3-ricxvebi100' as const;
const unitId = 'g3-ricxvebi100' as const;

export const G3_U01_SUBTOPICS = [
  'u01-hundred-chart',
  'u01-numbers-in-words',
  'u01-ordinal-numbers',
  'u01-tens-and-ones',
  'u01-before-and-after',
  'u01-number-line',
  'u01-largest-and-smallest',
  'u01-roman-numerals',
] as const;

export type G3U01SubtopicId = (typeof G3_U01_SUBTOPICS)[number];

const addr = (spec: { id: string; subtopicId: G3U01SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  id: spec.id,
  grade,
  topicId,
  unitId,
  subtopicId: spec.subtopicId,
  difficulty: spec.difficulty,
});

/** Near-miss helper for integer distractors */
const nearMisses = (answer: number, minVal = 0, maxVal = 100): number[] => {
  const wrong: number[] = [];
  for (const offset of [1, -1, 2, -2, 10, -10, 5, -5, 20, -20]) {
    const cand = answer + offset;
    if (cand >= minVal && cand <= maxVal && cand !== answer && !wrong.includes(cand)) {
      wrong.push(cand);
    }
  }
  return wrong;
};

const ORDINAL_NAMES: Record<number, string> = {
  1: 'პირველი',
  2: 'მეორე',
  3: 'მესამე',
  4: 'მეოთხე',
  5: 'მეხუთე',
  6: 'მეექვსე',
  7: 'მეშვიდე',
  8: 'მერვე',
  9: 'მეცხრე',
  10: 'მეათე',
};

const CARDINAL_NAMES: Record<number, string> = {
  1: 'ერთი',
  2: 'ორი',
  3: 'სამი',
  4: 'ოთხი',
  5: 'ხუთი',
  6: 'ექვსი',
  7: 'შვიდი',
  8: 'რვა',
  9: 'ცხრა',
  10: 'ათი',
};

const FRACTION_NAMES: Record<number, string> = {
  2: 'ნახევარი',
  3: 'მესამედი',
  4: 'მეოთხედი',
  5: 'მეხუთედი',
  6: 'მეექვსედი',
  7: 'მეშვიდედი',
  8: 'მერვედი',
  9: 'მეცხრედი',
  10: 'მეათედი',
};

const TENS_NAMES: Record<number, string> = {
  2: 'ოცი',
  3: 'ოცდაათი',
  4: 'ორმოცი',
  5: 'ორმოცდაათი',
  6: 'სამოცი',
  7: 'სამოცდაათი',
  8: 'ოთხმოცი',
  9: 'ოთხმოცდაათი',
  10: 'ასი',
};

export const G3_U01_TEMPLATES: QuestionTemplate[] = [
  // ==================================================================
  // U01.1 — ასეულთა ცხრილი (u01-hundred-chart)
  // ==================================================================

  // Q01: იპოვე გამოტოვებული რიცხვი
  defineTemplate({
    ...addr({ id: 'g3-u01-01', subtopicId: 'u01-hundred-chart', difficulty: 1 }),
    prompt: 'ასეულის ცხრილში რიცხვები მარცხნიდან მარჯვნივ იზრდება 1-ით:\n\n{a}, {b}, __, {d}\n\nრა რიცხვია გამოტოვებული?',
    variables: {
      row: { kind: 'int', min: 1, max: 8 },
      col: { kind: 'int', min: 1, max: 6 },
      a: { kind: 'choice', values: (v) => [Number(v.row) * 10 + Number(v.col)] },
      b: { kind: 'choice', values: (v) => [Number(v.a) + 1] },
      d: { kind: 'choice', values: (v) => [Number(v.a) + 3] },
    },
    answer: (v) => Number(v.a) + 2,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars, answer }) => {
      const ans = Number(answer);
      const a = Number(vars.a);
      const d = Number(vars.d);
      return [a - 1, d + 1, ans + 10, ans - 10].filter((x) => x > 0 && x <= 100 && x !== ans);
    },
    explanation: ({ vars, answer }) => `${vars.b}-ის მომდევნო რიცხვი ასეულის ცხრილში არის ${answer}.`,
  }),

  // Q02: ერთი მწკრივით ქვემოთ
  defineTemplate({
    ...addr({ id: 'g3-u01-02', subtopicId: 'u01-hundred-chart', difficulty: 1 }),
    prompt: 'ასეულის ცხრილში {n}-ის უშუალოდ ქვემოთ მდებარე რიცხვია:',
    variables: { n: { kind: 'int', min: 1, max: 89 } },
    answer: (v) => Number(v.n) + 10,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      const ans = Number(answer);
      const wrong = [n - 10, n + 1, n - 1, ans + 1];
      return wrong.filter((x) => x > 0 && x <= 100 && x !== ans);
    },
    explanation: ({ vars, answer }) => `ასეულის ცხრილში ერთი მწკრივით ქვემოთ ჩასვლა ნიშნავს 10-ის დამატებას: ${vars.n} + 10 = ${answer}.`,
  }),

  // Q03: ერთი უჯრით მარცხნივ
  defineTemplate({
    ...addr({ id: 'g3-u01-03', subtopicId: 'u01-hundred-chart', difficulty: 2 }),
    prompt: 'ასეულის ცხრილში {n}-ის უშუალოდ მარცხნივ მდებარე რიცხვია:',
    variables: {
      row: { kind: 'int', min: 0, max: 8 },
      col: { kind: 'int', min: 2, max: 10 },
      n: { kind: 'choice', values: (v) => [Number(v.row) * 10 + Number(v.col)] },
    },
    answer: (v) => Number(v.n) - 1,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      const ans = Number(answer);
      const wrong = [n + 1, n - 10, n + 10, ans - 1];
      return wrong.filter((x) => x > 0 && x <= 100 && x !== ans);
    },
    explanation: ({ vars, answer }) => `ასეულის ცხრილში ერთი უჯრით მარცხნივ გადასვლა ნიშნავს 1-ის გამოკლებას: ${vars.n} − 1 = ${answer}.`,
  }),

  // Q04: ერთი უჯრით მარჯვნივ
  defineTemplate({
    ...addr({ id: 'g3-u01-04', subtopicId: 'u01-hundred-chart', difficulty: 2 }),
    prompt: 'ასეულის ცხრილში რომელი რიცხვია {n}-ის უშუალოდ მარჯვნივ?',
    variables: {
      row: { kind: 'int', min: 0, max: 8 },
      col: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.row) * 10 + Number(v.col)] },
    },
    answer: (v) => Number(v.n) + 1,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      const ans = Number(answer);
      const wrong = [n - 1, n + 10, n - 10, ans + 1];
      return wrong.filter((x) => x > 0 && x <= 100 && x !== ans);
    },
    explanation: ({ vars, answer }) => `ასეულის ცხრილში ერთი უჯრით მარჯვნივ გადასვლა ნიშნავს 1-ით გაზრდას: ${vars.n} + 1 = ${answer}.`,
  }),

  // Q05: ორი მწკრივით ქვემოთ
  defineTemplate({
    ...addr({ id: 'g3-u01-05', subtopicId: 'u01-hundred-chart', difficulty: 3 }),
    prompt: 'ასეულის ცხრილში {n}-დან ორი მწკრივით ქვემოთ რომ გადავიდეთ, რომელ რიცხვს მივიღებთ?',
    variables: { n: { kind: 'int', min: 1, max: 79 } },
    answer: (v) => Number(v.n) + 20,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      const ans = Number(answer);
      const wrong = [n + 10, n + 2, n + 12, ans + 1, ans - 1];
      return wrong.filter((x) => x > 0 && x <= 100 && x !== ans);
    },
    explanation: ({ vars, answer }) => `ორი მწკრივით ქვემოთ გადასვლა ნიშნავს 20-ის დამატებას: ${vars.n} + 20 = ${answer}.`,
  }),

  // Q06: იპოვე გამოტოვებული უჯრა (3x3 grid snippet)
  defineTemplate({
    ...addr({ id: 'g3-u01-06', subtopicId: 'u01-hundred-chart', difficulty: 3 }),
    prompt:
      'ასეულის ცხრილში მოცემულია მონაკვეთი:\n\n' +
      '{r1c1}, {r1c2}, {r1c3}\n' +
      '{r2c1}, __, {r2c3}\n' +
      '{r3c1}, {r3c2}, {r3c3}\n\n' +
      'რა რიცხვია გამოტოვებული ცენტრალურ უჯრაში?',
    variables: {
      row: { kind: 'int', min: 1, max: 7 },
      col: { kind: 'int', min: 1, max: 8 },
      center: { kind: 'choice', values: (v) => [(Number(v.row) + 1) * 10 + (Number(v.col) + 1)] },
      r1c1: { kind: 'choice', values: (v) => [Number(v.center) - 11] },
      r1c2: { kind: 'choice', values: (v) => [Number(v.center) - 10] },
      r1c3: { kind: 'choice', values: (v) => [Number(v.center) - 9] },
      r2c1: { kind: 'choice', values: (v) => [Number(v.center) - 1] },
      r2c3: { kind: 'choice', values: (v) => [Number(v.center) + 1] },
      r3c1: { kind: 'choice', values: (v) => [Number(v.center) + 9] },
      r3c2: { kind: 'choice', values: (v) => [Number(v.center) + 10] },
      r3c3: { kind: 'choice', values: (v) => [Number(v.center) + 11] },
    },
    answer: (v) => Number(v.center),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => {
      const c = Number(answer);
      return [c - 10, c + 10, c - 2, c + 2].filter((x) => x > 0 && x <= 100 && x !== c);
    },
    explanation: ({ vars, answer }) => `${vars.r2c1}-ისა და ${vars.r2c3}-ის შუა რიცხვია ${answer}.`,
  }),

  // ==================================================================
  // U01.2 — რიცხვები სიტყვიერად (u01-numbers-in-words)
  // ==================================================================

  // Q07: ჩაწერე რიცხვი ციფრებით
  defineTemplate({
    ...addr({ id: 'g3-u01-07', subtopicId: 'u01-numbers-in-words', difficulty: 1 }),
    prompt: 'ჩაწერე რიცხვი ციფრებით:\n\n„{words}“',
    variables: {
      tens: { kind: 'choice', values: [20, 30, 40, 50, 60, 70, 80, 90] },
      ones: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.tens) + Number(v.ones)] },
      words: { kind: 'choice', values: (v) => [georgianNumber(Number(v.n))] },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 10, max: 99 },
    distractors: ({ vars, answer }) => {
      const n = Number(answer);
      const tens = Number(vars.tens);
      const ones = Number(vars.ones);
      const flipped = ones * 10 + Math.floor(tens / 10);
      const cand = [n - 10, n + 10, flipped, n + 1, n - 1];
      return cand.filter((x) => x >= 10 && x <= 99 && x !== n);
    },
    explanation: ({ vars, answer }) => `„${vars.words}“ იწერება ციფრებით როგორც ${answer}.`,
  }),

  // Q08: რომელი რიცხვია „...“?
  defineTemplate({
    ...addr({ id: 'g3-u01-08', subtopicId: 'u01-numbers-in-words', difficulty: 1 }),
    prompt: 'რომელი რიცხვია „{words}“?',
    variables: {
      tens: { kind: 'choice', values: [20, 30, 40, 50, 60, 70, 80, 90] },
      ones: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.tens) + Number(v.ones)] },
      words: { kind: 'choice', values: (v) => [georgianNumber(Number(v.n))] },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 10, max: 99 },
    distractors: ({ answer }) => {
      const n = Number(answer);
      const cand = [n - 10, n + 10, n + 2, n - 2];
      return cand.filter((x) => x >= 10 && x <= 99 && x !== n);
    },
    explanation: ({ vars, answer }) => `„${vars.words}“ არის ${answer}.`,
  }),

  // Q09: აირჩიე სწორი სიტყვიერი ჩანაწერი
  defineTemplate({
    ...addr({ id: 'g3-u01-09', subtopicId: 'u01-numbers-in-words', difficulty: 2 }),
    prompt: 'რომელი სიტყვებით იკითხება რიცხვი {n}?',
    variables: {
      tens: { kind: 'choice', values: [20, 30, 40, 50, 60, 70, 80, 90] },
      ones: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.tens) + Number(v.ones)] },
    },
    answer: (v) => georgianNumber(Number(v.n)),
    format: { kind: 'text' },
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      const cand = [
        georgianNumber(n > 30 ? n - 10 : n + 10),
        georgianNumber(n < 85 ? n + 10 : n - 20),
        georgianNumber(n > 25 ? n - 2 : n + 3),
      ];
      return cand.filter((x) => x !== String(answer));
    },
    explanation: ({ vars, answer }) => `${vars.n} სიტყვებით იკითხება: ${answer}.`,
  }),

  // Q10: რიცხვი სიტყვიერად
  defineTemplate({
    ...addr({ id: 'g3-u01-10', subtopicId: 'u01-numbers-in-words', difficulty: 2 }),
    prompt: 'როგორ იკითხება რიცხვი {n} სიტყვიერად?',
    variables: {
      tens: { kind: 'choice', values: [20, 30, 40, 50, 60, 70, 80, 90] },
      ones: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.tens) + Number(v.ones)] },
    },
    answer: (v) => georgianNumber(Number(v.n)),
    format: { kind: 'text' },
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      const cand = [
        georgianNumber(n > 35 ? n - 10 : n + 10),
        georgianNumber(n < 80 ? n + 10 : n - 20),
        georgianNumber(n > 22 ? n - 1 : n + 2),
      ];
      return cand.filter((x) => x !== String(answer));
    },
    explanation: ({ vars, answer }) => `${vars.n} = ${answer}.`,
  }),

  // Q11: იპოვე რიცხვი
  defineTemplate({
    ...addr({ id: 'g3-u01-11', subtopicId: 'u01-numbers-in-words', difficulty: 3 }),
    prompt: '„{words}“ რომელი რიცხვია?',
    variables: {
      tens: { kind: 'choice', values: [20, 30, 40, 50, 60, 70, 80, 90] },
      ones: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.tens) + Number(v.ones)] },
      words: { kind: 'choice', values: (v) => [georgianNumber(Number(v.n))] },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 10, max: 99 },
    distractors: ({ answer }) => nearMisses(Number(answer), 10, 99),
    explanation: ({ vars, answer }) => `„${vars.words}“ არის ${answer}.`,
  }),

  // Q12: სიტყვებიდან ციფრებზე
  defineTemplate({
    ...addr({ id: 'g3-u01-12', subtopicId: 'u01-numbers-in-words', difficulty: 3 }),
    prompt: 'რომელი რიცხვია „{words}“?',
    variables: {
      tens: { kind: 'choice', values: [20, 30, 40, 50, 60, 70, 80, 90] },
      ones: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.tens) + Number(v.ones)] },
      words: { kind: 'choice', values: (v) => [georgianNumber(Number(v.n))] },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 10, max: 99 },
    distractors: ({ answer }) => nearMisses(Number(answer), 10, 99),
    explanation: ({ vars, answer }) => `ჩანაწერი „${vars.words}“ უდრის ${answer}-ს.`,
  }),

  // ==================================================================
  // U01.3 — რიგობითი რიცხვები (u01-ordinal-numbers)
  // ==================================================================

  // Q13: რიგში ადგილი
  defineTemplate({
    ...addr({ id: 'g3-u01-13', subtopicId: 'u01-ordinal-numbers', difficulty: 1 }),
    prompt: 'რბოლაში {child} {placeWord} ადგილზე გავიდა. რომელია მისი რიგითი ნომერი?',
    variables: {
      child: { kind: 'choice', values: ['ნიკა', 'გიორგი', 'ლუკა', 'სანდრო', 'დათო', 'ილია'] },
      place: { kind: 'int', min: 1, max: 8 },
      placeWord: { kind: 'choice', values: (v) => [ORDINAL_NAMES[Number(v.place)]] },
    },
    answer: (v) => (Number(v.place) === 1 ? '1-ლი' : `მე-${v.place}`),
    format: { kind: 'text' },
    distractors: ({ answer }) => {
      const allRanks = [1, 2, 3, 4, 5, 6, 7, 8].map((k) => (k === 1 ? '1-ლი' : `მე-${k}`));
      return allRanks.filter((r) => r !== String(answer)).slice(0, 3);
    },
    explanation: ({ vars, answer }) => `${vars.placeWord} ადგილი აღინიშნება როგორც ${answer}.`,
  }),

  // Q14: რიგის შემდეგი ადგილი
  defineTemplate({
    ...addr({ id: 'g3-u01-14', subtopicId: 'u01-ordinal-numbers', difficulty: 1 }),
    prompt: '{currWord}-ის შემდეგ რომელი ადგილია? {variant}',
    variables: {
      place: { kind: 'int', min: 1, max: 9 },
      currWord: { kind: 'choice', values: (v) => [ORDINAL_NAMES[Number(v.place)]] },
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'] },
    },
    answer: (v) => `მე-${Number(v.place) + 1}`,
    format: { kind: 'text' },
    distractors: ({ vars, answer }) => {
      const p = Number(vars.place);
      const wrong = [p === 1 ? '1-ლი' : `მე-${p}`, `მე-${p + 2}`, `მე-${p + 3}`];
      return wrong.filter((x) => x !== String(answer));
    },
    explanation: ({ vars, answer }) => `${vars.currWord}-ის შემდეგი ადგილია ${answer}.`,
  }),

  // Q15: მეხუთე საგანი
  defineTemplate({
    ...addr({ id: 'g3-u01-15', subtopicId: 'u01-ordinal-numbers', difficulty: 2 }),
    prompt: 'მაგიდაზე დალაგებულია {total} {obj}. მარცხნიდან მე-{k} {obj} რომელ პოზიციაზეა?',
    variables: {
      k: { kind: 'int', min: 2, max: 7 },
      total: { kind: 'int', min: 8, max: 12 },
      obj: { kind: 'choice', values: ['ფანქარი', 'წიგნი', 'ბურთი', 'რვეული', 'კალამი'] },
    },
    answer: (v) => ORDINAL_NAMES[Number(v.k)],
    format: { kind: 'text' },
    distractors: ({ vars, answer }) => {
      const k = Number(vars.k);
      const wrong = [ORDINAL_NAMES[k - 1], ORDINAL_NAMES[k + 1], ORDINAL_NAMES[1]];
      return wrong.filter((x) => x !== String(answer));
    },
    explanation: ({ vars, answer }) => `მარცხნიდან მე-${vars.k} პოზიცია არის ${answer}.`,
  }),

  // Q16: რიგობითი რიცხვი
  defineTemplate({
    ...addr({ id: 'g3-u01-16', subtopicId: 'u01-ordinal-numbers', difficulty: 2 }),
    prompt: '{phrase}',
    variables: {
      k: { kind: 'int', min: 2, max: 10 },
      form: {
        kind: 'choice',
        values: [
          'რომელი სიტყვა აღნიშნავს მე-{k} ადგილს?',
          'როგორ იკითხება მე-{k} ადგილი სიტყვიერად?',
        ],
      },
      phrase: { kind: 'choice', values: (v) => [String(v.form).replace('{k}', String(v.k))] },
    },
    answer: (v) => ORDINAL_NAMES[Number(v.k)],
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const k = Number(vars.k);
      return [CARDINAL_NAMES[k], TENS_NAMES[k], FRACTION_NAMES[k]];
    },
    explanation: ({ vars, answer }) => `მე-${vars.k} ადგილი სიტყვებით არის „${answer}“.`,
  }),

  // Q17: ვინ დგას წინ / შემდეგ?
  defineTemplate({
    ...addr({ id: 'g3-u01-17', subtopicId: 'u01-ordinal-numbers', difficulty: 3 }),
    prompt: 'რიგში {c1} პირველია, {c2} — მეორე, {c3} — მესამე. ვინ დგას {c2}-ის შემდეგ? {variant}',
    variables: {
      namesIdx: { kind: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
      c1: { kind: 'choice', values: (v) => [['ანა', 'ნინო', 'მარიამი', 'თეკლა', 'სალომე', 'ლიზი', 'ქეთი', 'მზია'][Number(v.namesIdx)]] },
      c2: { kind: 'choice', values: (v) => [['ლუკა', 'ნიკა', 'გიორგი', 'დათო', 'სანდრო', 'ილია', 'საბა', 'ვატო'][Number(v.namesIdx)]] },
      c3: { kind: 'choice', values: (v) => [['ნიკა', 'სანდრო', 'ირაკლი', 'ილია', 'ლევანი', 'ბაჩო', 'თორნიკე', 'გიგა'][Number(v.namesIdx)]] },
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი სახელი.', 'რომელია სწორი?'] },
    },
    answer: (v) => String(v.c3),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.c1), String(vars.c2), 'არცერთი'],
    explanation: ({ vars, answer }) => `მეორეს (${vars.c2}) შემდეგ დგას მესამე — ${answer}.`,
  }),

  // Q18: ბოლო ადგილი
  defineTemplate({
    ...addr({ id: 'g3-u01-18', subtopicId: 'u01-ordinal-numbers', difficulty: 3 }),
    prompt: 'თუ {total} {who} რიგში დგას, ბოლო {whoOne} რომელ ადგილზეა?',
    variables: {
      total: { kind: 'int', min: 5, max: 18 },
      group: { kind: 'choice', values: [0, 1] },
      who: { kind: 'choice', values: (v) => [['ბავშვი', 'მოსწავლე'][Number(v.group)]] },
      whoOne: { kind: 'choice', values: (v) => [['ბავშვი', 'მოსწავლე'][Number(v.group)]] },
    },
    answer: (v) => `მე-${v.total}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const t = Number(vars.total);
      return [`მე-${t - 1}`, `მე-${t + 1}`, `მე-${t - 2}`];
    },
    explanation: ({ vars, answer }) => `სულ ${vars.total} ${vars.who}ა, ამიტომ ბოლო დგას ${answer} ადგილზე.`,
  }),

  // ==================================================================
  // U01.4 — ათეულები და ერთეულები (u01-tens-and-ones)
  // ==================================================================

  // Q19: დაშალე რიცხვი
  defineTemplate({
    ...addr({ id: 'g3-u01-19', subtopicId: 'u01-tens-and-ones', difficulty: 1 }),
    prompt: 'რამდენი ათეული და რამდენი ერთეულია რიცხვში {n}?',
    variables: {
      tens: { kind: 'int', min: 2, max: 9 },
      ones: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [{ test: (v) => v.tens !== v.ones, note: 'tens != ones' }],
    answer: (v) => `${v.tens} ათეული და ${v.ones} ერთეული`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.ones} ათეული და ${vars.tens} ერთეული`,
      `${vars.tens} ათეული და 0 ერთეული`,
      `${Number(vars.tens) - 1} ათეული და ${vars.ones} ერთეული`,
    ],
    explanation: ({ vars, answer }) => `რიცხვში ${vars.n} არის ${answer}.`,
  }),

  // Q20: იპოვე რიცხვი
  defineTemplate({
    ...addr({ id: 'g3-u01-20', subtopicId: 'u01-tens-and-ones', difficulty: 1 }),
    prompt: '{tens} ათეული და {ones} ერთეული უდრის:',
    variables: {
      tens: { kind: 'int', min: 2, max: 9 },
      ones: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v) => Number(v.tens) * 10 + Number(v.ones),
    format: { kind: 'integer', min: 10, max: 99 },
    distractors: ({ vars, answer }) => {
      const ans = Number(answer);
      const flipped = Number(vars.ones) * 10 + Number(vars.tens);
      const sum = Number(vars.tens) + Number(vars.ones);
      return [flipped, sum, ans + 10];
    },
    explanation: ({ vars, answer }) => `${vars.tens} × 10 + ${vars.ones} = ${answer}.`,
  }),

  // Q21: რამდენი ათეულია?
  defineTemplate({
    ...addr({ id: 'g3-u01-21', subtopicId: 'u01-tens-and-ones', difficulty: 2 }),
    prompt: '{phrase}',
    variables: {
      tens: { kind: 'int', min: 2, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.tens) * 10] },
      form: {
        kind: 'choice',
        values: [
          'რამდენი სრული ათეულია რიცხვში {n}?',
          'რამდენ ათეულს შეიცავს რიცხვი {n}?',
        ],
      },
      phrase: { kind: 'choice', values: (v) => [String(v.form).replace('{n}', String(v.n))] },
    },
    answer: (v) => Number(v.tens),
    format: { kind: 'integer', min: 1, max: 9 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 9),
    explanation: ({ vars, answer }) => `${vars.n}-ში არის ${answer} ათეული (${answer} × 10 = ${vars.n}).`,
  }),

  // Q22: იპოვე ერთეულების ციფრი
  defineTemplate({
    ...addr({ id: 'g3-u01-22', subtopicId: 'u01-tens-and-ones', difficulty: 2 }),
    prompt: 'რიცხვში {n} ერთეულების ციფრია:',
    variables: {
      tens: { kind: 'int', min: 2, max: 9 },
      ones: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    constraints: [{ test: (v) => v.tens !== v.ones, note: 'tens != ones' }],
    answer: (v) => Number(v.ones),
    format: { kind: 'integer', min: 0, max: 9 },
    distractors: ({ vars, answer }) => {
      const u = Number(answer);
      const t = Number(vars.tens);
      return [t, 0, (u + 1) % 10];
    },
    explanation: ({ answer }) => `რიცხვის ბოლო ციფრია ერთეულები, ამიტომ ერთეულების ციფრია ${answer}.`,
  }),

  // Q23: შექმენი რიცხვი
  defineTemplate({
    ...addr({ id: 'g3-u01-23', subtopicId: 'u01-tens-and-ones', difficulty: 3 }),
    prompt: '{tens} ათეული და {ones} ერთეული რომელ რიცხვს ქმნის?',
    variables: {
      tens: { kind: 'int', min: 1, max: 9 },
      ones: { kind: 'int', min: 1, max: 9 },
    },
    constraints: [{ test: (v) => v.tens !== v.ones, note: 'tens != ones' }],
    answer: (v) => Number(v.tens) * 10 + Number(v.ones),
    format: { kind: 'integer', min: 10, max: 99 },
    distractors: ({ vars, answer }) => {
      const ans = Number(answer);
      const flipped = Number(vars.ones) * 10 + Number(vars.tens);
      return [flipped, ans - 10, ans + 10];
    },
    explanation: ({ vars, answer }) => `${vars.tens} ათეული და ${vars.ones} ერთეული არის ${answer}.`,
  }),

  // Q24: შეავსე გამოტოვებული რიცხვი
  defineTemplate({
    ...addr({ id: 'g3-u01-24', subtopicId: 'u01-tens-and-ones', difficulty: 3 }),
    prompt: '{tens} ათეული და __ ერთეული ქმნის რიცხვს {n}.',
    variables: {
      tens: { kind: 'int', min: 2, max: 9 },
      ones: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.tens) * 10 + Number(v.ones)] },
    },
    answer: (v) => Number(v.ones),
    format: { kind: 'integer', min: 1, max: 9 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 9),
    explanation: ({ vars, answer }) => `${vars.n}-ში ერთეულების რაოდენობაა ${answer}.`,
  }),

  // ==================================================================
  // U01.5 — წინა და მომდევნო რიცხვები (u01-before-and-after)
  // ==================================================================

  // Q25: წინა რიცხვი
  defineTemplate({
    ...addr({ id: 'g3-u01-25', subtopicId: 'u01-before-and-after', difficulty: 1 }),
    prompt: 'რომელი რიცხვია {n}-ის უშუალოდ წინ?',
    variables: { n: { kind: 'int', min: 15, max: 99 } },
    answer: (v) => Number(v.n) - 1,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars }) => {
      const n = Number(vars.n);
      return [n + 1, n - 2, n + 10];
    },
    explanation: ({ vars, answer }) => `${vars.n}-ის უშუალოდ წინა რიცხვია ${answer}.`,
  }),

  // Q26: მომდევნო რიცხვი
  defineTemplate({
    ...addr({ id: 'g3-u01-26', subtopicId: 'u01-before-and-after', difficulty: 1 }),
    prompt: 'რომელი რიცხვია {n}-ის შემდეგ?',
    variables: { n: { kind: 'int', min: 10, max: 98 } },
    answer: (v) => Number(v.n) + 1,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars }) => {
      const n = Number(vars.n);
      return [n - 1, n + 2, n + 10];
    },
    explanation: ({ vars, answer }) => `${vars.n}-ის მომდევნო რიცხვია ${answer}.`,
  }),

  // Q27: იპოვე შუა რიცხვი
  defineTemplate({
    ...addr({ id: 'g3-u01-27', subtopicId: 'u01-before-and-after', difficulty: 2 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი:\n\n{a}, __, {c}',
    variables: {
      a: { kind: 'int', min: 10, max: 97 },
      c: { kind: 'choice', values: (v) => [Number(v.a) + 2] },
    },
    answer: (v) => Number(v.a) + 1,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars, answer }) => {
      const a = Number(vars.a);
      const ans = Number(answer);
      return [a - 1, ans + 2, ans + 10];
    },
    explanation: ({ vars, answer }) => `${vars.a}-სა და ${vars.c}-ს შორის მდებარეობს ${answer}.`,
  }),

  // Q28: ორი რიცხვით წინ
  defineTemplate({
    ...addr({ id: 'g3-u01-28', subtopicId: 'u01-before-and-after', difficulty: 2 }),
    prompt: 'რომელი რიცხვია {n}-მდე ორი რიცხვით ადრე?',
    variables: { n: { kind: 'int', min: 15, max: 99 } },
    answer: (v) => Number(v.n) - 2,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars }) => {
      const n = Number(vars.n);
      return [n - 1, n - 3, n + 2];
    },
    explanation: ({ vars, answer }) => `${vars.n} − 2 = ${answer}.`,
  }),

  // Q29: ორი რიცხვით შემდეგ
  defineTemplate({
    ...addr({ id: 'g3-u01-29', subtopicId: 'u01-before-and-after', difficulty: 3 }),
    prompt: 'რომელი რიცხვია {n}-ის შემდეგ ორი რიცხვით?',
    variables: { n: { kind: 'int', min: 10, max: 96 } },
    answer: (v) => Number(v.n) + 2,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars }) => {
      const n = Number(vars.n);
      return [n + 1, n + 3, n + 4];
    },
    explanation: ({ vars, answer }) => `${vars.n} + 2 = ${answer}.`,
  }),

  // Q30: შეავსე თანმიმდევრობა
  defineTemplate({
    ...addr({ id: 'g3-u01-30', subtopicId: 'u01-before-and-after', difficulty: 3 }),
    prompt: 'შეავსე თანმიმდევრობა:\n\n{a}, {b}, __, {d}',
    variables: {
      a: { kind: 'int', min: 10, max: 95 },
      b: { kind: 'choice', values: (v) => [Number(v.a) + 1] },
      d: { kind: 'choice', values: (v) => [Number(v.a) + 3] },
    },
    answer: (v) => Number(v.a) + 2,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => {
      const ans = Number(answer);
      return [ans - 2, ans + 2, ans + 10];
    },
    explanation: ({ vars, answer }) => `${vars.b}-ის მომდევნოა ${answer}.`,
  }),

  // ==================================================================
  // U01.6 — რიცხვითი ღერძი 100-მდე (u01-number-line)
  // ==================================================================

  // Q31: ნაბიჯი მარჯვნივ
  defineTemplate({
    ...addr({ id: 'g3-u01-31', subtopicId: 'u01-number-line', difficulty: 1 }),
    prompt: 'რიცხვით ღერძზე დგახარ {start}-ზე და ერთი ნაბიჯით მიდიხარ მარჯვნივ. რომელ რიცხვზე აღმოჩნდები?',
    variables: { start: { kind: 'int', min: 10, max: 89 } },
    answer: (v) => Number(v.start) + 1,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars }) => {
      const s = Number(vars.start);
      return [s - 1, s, s + 2];
    },
    explanation: ({ vars, answer }) => `მარჯვნივ 1 ნაბიჯი არის +1: ${vars.start} + 1 = ${answer}.`,
  }),

  // Q32: ნაბიჯი მარცხნივ
  defineTemplate({
    ...addr({ id: 'g3-u01-32', subtopicId: 'u01-number-line', difficulty: 1 }),
    prompt: 'რიცხვით ღერძზე დგახარ {start}-ზე და ერთი ნაბიჯით მიდიხარ მარცხნივ. რომელ რიცხვზე აღმოჩნდები?',
    variables: { start: { kind: 'int', min: 12, max: 95 } },
    answer: (v) => Number(v.start) - 1,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars }) => {
      const s = Number(vars.start);
      return [s - 2, s, s + 1];
    },
    explanation: ({ vars, answer }) => `მარცხნივ 1 ნაბიჯი არის −1: ${vars.start} − 1 = ${answer}.`,
  }),

  // Q33: სამი ნაბიჯით წინ
  defineTemplate({
    ...addr({ id: 'g3-u01-33', subtopicId: 'u01-number-line', difficulty: 2 }),
    prompt: 'რიცხვით ღერძზე {start}-დან {step} ნაბიჯით მარჯვნივ გადადი. რომელ რიცხვზე აღმოჩნდები?',
    variables: {
      start: { kind: 'int', min: 15, max: 85 },
      step: { kind: 'choice', values: [3, 4, 5, 6] },
    },
    answer: (v) => Number(v.start) + Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars, answer }) => {
      const s = Number(vars.start);
      const step = Number(vars.step);
      const ans = Number(answer);
      return [ans - 1, ans + 1, s - step];
    },
    explanation: ({ vars, answer }) => `${vars.start} + ${vars.step} = ${answer}.`,
  }),

  // Q34: ოთხი ნაბიჯით უკან
  defineTemplate({
    ...addr({ id: 'g3-u01-34', subtopicId: 'u01-number-line', difficulty: 2 }),
    prompt: 'რიცხვით ღერძზე {start}-დან {step} ნაბიჯით მარცხნივ გადადი. რომელ რიცხვზე აღმოჩნდები?',
    variables: {
      start: { kind: 'int', min: 25, max: 90 },
      step: { kind: 'choice', values: [3, 4, 5, 6] },
    },
    answer: (v) => Number(v.start) - Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars, answer }) => {
      const s = Number(vars.start);
      const step = Number(vars.step);
      const ans = Number(answer);
      return [ans - 1, ans + 1, s + step];
    },
    explanation: ({ vars, answer }) => `${vars.start} − ${vars.step} = ${answer}.`,
  }),

  // Q35: მანძილი რიცხვით ღერძზე
  defineTemplate({
    ...addr({ id: 'g3-u01-35', subtopicId: 'u01-number-line', difficulty: 3 }),
    prompt: 'რამდენი ერთეულია {a}-დან {b}-მდე რიცხვით ღერძზე?',
    variables: {
      a: { kind: 'int', min: 10, max: 70 },
      diff: { kind: 'int', min: 4, max: 15 },
      b: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1, max: 50 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 50),
    explanation: ({ vars, answer }) => `მანძილია ${vars.b} − ${vars.a} = ${answer} ერთეული.`,
  }),

  // Q36: იპოვე საწყისი რიცხვი
  defineTemplate({
    ...addr({ id: 'g3-u01-36', subtopicId: 'u01-number-line', difficulty: 3 }),
    prompt: 'რიცხვით ღერძზე {step} ნაბიჯით მარჯვნივ გადასვლის შემდეგ მივიღეთ {end}. რომელ რიცხვზე დავიწყეთ?',
    variables: {
      start: { kind: 'int', min: 15, max: 80 },
      step: { kind: 'choice', values: [2, 3, 4, 5, 6] },
      end: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
    },
    answer: (v) => Number(v.start),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars, answer }) => {
      const e = Number(vars.end);
      const step = Number(vars.step);
      const s = Number(answer);
      return [s - 1, s + 1, e + step];
    },
    explanation: ({ vars, answer }) => `${vars.end} − ${vars.step} = ${answer}.`,
  }),

  // ==================================================================
  // U01.7 — უდიდესი და უმცირესი რიცხვები (u01-largest-and-smallest)
  // ==================================================================

  // Q37: იპოვე უდიდესი რიცხვი
  defineTemplate({
    ...addr({ id: 'g3-u01-37', subtopicId: 'u01-largest-and-smallest', difficulty: 1 }),
    prompt: 'ჩამოთვლილთაგან რომელია უდიდესი რიცხვი?\n\n{a}, {b}, {c}, {d}',
    variables: {
      t: { kind: 'int', min: 3, max: 8 },
      u: { kind: 'int', min: 1, max: 8 },
      a: { kind: 'choice', values: (v) => [Number(v.t) * 10 + Number(v.u)] },
      b: { kind: 'choice', values: (v) => [Number(v.u) * 10 + Number(v.t)] },
      c: { kind: 'choice', values: (v) => [Number(v.t) * 10 + Number(v.u) + 12] },
      d: { kind: 'choice', values: (v) => [Number(v.t) * 10 + Number(v.u) + 2] },
    },
    constraints: [{ test: (v) => v.t !== v.u, note: 't != u' }],
    answer: (v) => Math.max(Number(v.a), Number(v.b), Number(v.c), Number(v.d)),
    format: { kind: 'integer', min: 10, max: 99 },
    distractors: ({ vars, answer }) => {
      const nums = [Number(vars.a), Number(vars.b), Number(vars.c), Number(vars.d)];
      return nums.filter((x) => x !== Number(answer));
    },
    explanation: ({ answer }) => `მოცემულ რიცხვებს შორის უდიდესია ${answer}.`,
  }),

  // Q38: იპოვე უმცირესი რიცხვი
  defineTemplate({
    ...addr({ id: 'g3-u01-38', subtopicId: 'u01-largest-and-smallest', difficulty: 1 }),
    prompt: 'ჩამოთვლილთაგან რომელია უმცირესი რიცხვი?\n\n{a}, {b}, {c}, {d}',
    variables: {
      base: { kind: 'int', min: 25, max: 70 },
      d1: { kind: 'choice', values: [3, 5, 7] },
      d2: { kind: 'choice', values: [10, 12, 14] },
      d3: { kind: 'choice', values: [20, 22, 25] },
      a: { kind: 'choice', values: (v) => [Number(v.base)] },
      b: { kind: 'choice', values: (v) => [Number(v.base) + Number(v.d1)] },
      c: { kind: 'choice', values: (v) => [Number(v.base) + Number(v.d2)] },
      d: { kind: 'choice', values: (v) => [Number(v.base) + Number(v.d3)] },
    },
    answer: (v) => Number(v.a),
    format: { kind: 'integer', min: 10, max: 99 },
    distractors: ({ vars }) => [Number(vars.b), Number(vars.c), Number(vars.d)],
    explanation: ({ answer }) => `მოცემულ რიცხვებს შორის უმცირესია ${answer}.`,
  }),

  // Q39: შეადარე რიცხვები (ყველაზე დიდი)
  defineTemplate({
    ...addr({ id: 'g3-u01-39', subtopicId: 'u01-largest-and-smallest', difficulty: 2 }),
    prompt: 'რომელი რიცხვია ყველაზე დიდი: {a}, {b}, {c}, {d}?',
    variables: {
      big: { kind: 'int', min: 75, max: 95 },
      d1: { kind: 'choice', values: [2, 3, 4] },
      d2: { kind: 'choice', values: [5, 6, 7] },
      d3: { kind: 'choice', values: [12, 15, 18] },
      a: { kind: 'choice', values: (v) => [Number(v.big)] },
      b: { kind: 'choice', values: (v) => [Number(v.big) - Number(v.d1)] },
      c: { kind: 'choice', values: (v) => [Number(v.big) - Number(v.d2)] },
      d: { kind: 'choice', values: (v) => [Number(v.big) - Number(v.d3)] },
    },
    answer: (v) => Number(v.a),
    format: { kind: 'integer', min: 10, max: 99 },
    distractors: ({ vars }) => [Number(vars.b), Number(vars.c), Number(vars.d)],
    explanation: ({ answer }) => `ყველაზე დიდია ${answer}.`,
  }),

  // Q40: შეადარე რიცხვები (ყველაზე პატარა)
  defineTemplate({
    ...addr({ id: 'g3-u01-40', subtopicId: 'u01-largest-and-smallest', difficulty: 2 }),
    prompt: 'რომელი რიცხვია ყველაზე პატარა: {a}, {b}, {c}, {d}?',
    variables: {
      small: { kind: 'int', min: 15, max: 40 },
      d1: { kind: 'choice', values: [3, 4, 5] },
      d2: { kind: 'choice', values: [10, 12, 15] },
      d3: { kind: 'choice', values: [20, 22, 25] },
      a: { kind: 'choice', values: (v) => [Number(v.small)] },
      b: { kind: 'choice', values: (v) => [Number(v.small) + Number(v.d1)] },
      c: { kind: 'choice', values: (v) => [Number(v.small) + Number(v.d2)] },
      d: { kind: 'choice', values: (v) => [Number(v.small) + Number(v.d3)] },
    },
    answer: (v) => Number(v.a),
    format: { kind: 'integer', min: 10, max: 99 },
    distractors: ({ vars }) => [Number(vars.b), Number(vars.c), Number(vars.d)],
    explanation: ({ answer }) => `ყველაზე პატარაა ${answer}.`,
  }),

  // Q41: დაალაგე ზრდის მიხედვით
  defineTemplate({
    ...addr({ id: 'g3-u01-41', subtopicId: 'u01-largest-and-smallest', difficulty: 3 }),
    prompt: 'დაალაგე რიცხვები ზრდის მიხედვით: {x}, {y}, {z}.',
    variables: {
      s1: { kind: 'int', min: 12, max: 40 },
      d1: { kind: 'int', min: 5, max: 15 },
      d2: { kind: 'int', min: 5, max: 15 },
      s2: { kind: 'choice', values: (v) => [Number(v.s1) + Number(v.d1)] },
      s3: { kind: 'choice', values: (v) => [Number(v.s1) + Number(v.d1) + Number(v.d2)] },
      x: { kind: 'choice', values: (v) => [Number(v.s2)] },
      y: { kind: 'choice', values: (v) => [Number(v.s3)] },
      z: { kind: 'choice', values: (v) => [Number(v.s1)] },
    },
    answer: (v) => `${v.s1}, ${v.s2}, ${v.s3}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.s3}, ${vars.s2}, ${vars.s1}`,
      `${vars.s2}, ${vars.s1}, ${vars.s3}`,
      `${vars.s1}, ${vars.s3}, ${vars.s2}`,
    ],
    explanation: ({ answer }) => `ზრდის მიხედვით დალაგება ნიშნავს უმცირესიდან უდიდესისკენ: ${answer}.`,
  }),

  // Q42: დაალაგე კლების მიხედვით
  defineTemplate({
    ...addr({ id: 'g3-u01-42', subtopicId: 'u01-largest-and-smallest', difficulty: 3 }),
    prompt: 'დაალაგე რიცხვები კლების მიხედვით: {x}, {y}, {z}.',
    variables: {
      s1: { kind: 'int', min: 15, max: 45 },
      d1: { kind: 'int', min: 6, max: 16 },
      d2: { kind: 'int', min: 6, max: 16 },
      s2: { kind: 'choice', values: (v) => [Number(v.s1) + Number(v.d1)] },
      s3: { kind: 'choice', values: (v) => [Number(v.s1) + Number(v.d1) + Number(v.d2)] },
      x: { kind: 'choice', values: (v) => [Number(v.s1)] },
      y: { kind: 'choice', values: (v) => [Number(v.s3)] },
      z: { kind: 'choice', values: (v) => [Number(v.s2)] },
    },
    answer: (v) => `${v.s3}, ${v.s2}, ${v.s1}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.s1}, ${vars.s2}, ${vars.s3}`,
      `${vars.s2}, ${vars.s3}, ${vars.s1}`,
      `${vars.s3}, ${vars.s1}, ${vars.s2}`,
    ],
    explanation: ({ answer }) => `კლების მიხედვით დალაგება ნიშნავს უდიდესიდან უმცირესისკენ: ${answer}.`,
  }),

  // ==================================================================
  // U01.8 — რომაული ციფრები I, V, X, L (u01-roman-numerals)
  // ==================================================================

  // Q43: რომაული ციფრი I
  defineTemplate({
    ...addr({ id: 'g3-u01-43', subtopicId: 'u01-roman-numerals', difficulty: 1 }),
    prompt: '{intro} რას აღნიშნავს რომაული ციფრი I? {variant}',
    variables: {
      intro: {
        kind: 'choice',
        values: [
          'მათემატიკაში',
          'რომაულ ჩაწერაში',
          'დააკვირდი ჩანაწერს:',
          'რომაულ ციფრებში',
        ],
      },
      variant: {
        kind: 'choice',
        values: [
          'აირჩიე სწორი პასუხი.',
          'მონიშნე სწორი ვარიანტი.',
          'რომელი რიცხვი შეესაბამება?',
          'იპოვე სწორი მნიშვნელობა.',
        ],
      },
    },
    answer: () => 1,
    format: { kind: 'integer', min: 1, max: 50 },
    distractors: () => [2, 5, 10],
    explanation: () => 'რომაული ციფრი I აღნიშნავს 1-ს.',
  }),

  // Q44: რომაული ციფრი V
  defineTemplate({
    ...addr({ id: 'g3-u01-44', subtopicId: 'u01-roman-numerals', difficulty: 1 }),
    prompt: '{intro} რას აღნიშნავს რომაული ციფრი V? {variant}',
    variables: {
      intro: {
        kind: 'choice',
        values: [
          'მათემატიკაში',
          'რომაულ ჩაწერაში',
          'დააკვირდი ჩანაწერს:',
          'რომაულ ციფრებში',
        ],
      },
      variant: {
        kind: 'choice',
        values: [
          'აირჩიე სწორი პასუხი.',
          'მონიშნე სწორი ვარიანტი.',
          'რომელი რიცხვი შეესაბამება?',
          'იპოვე სწორი მნიშვნელობა.',
        ],
      },
    },
    answer: () => 5,
    format: { kind: 'integer', min: 1, max: 50 },
    distractors: () => [1, 10, 50],
    explanation: () => 'რომაული ციფრი V აღნიშნავს 5-ს.',
  }),

  // Q45: რომაული ციფრი X
  defineTemplate({
    ...addr({ id: 'g3-u01-45', subtopicId: 'u01-roman-numerals', difficulty: 2 }),
    prompt: '{intro} რას აღნიშნავს რომაული ციფრი X? {variant}',
    variables: {
      intro: {
        kind: 'choice',
        values: [
          'მათემატიკაში',
          'რომაულ ჩაწერაში',
          'დააკვირდი ჩანაწერს:',
          'რომაულ ციფრებში',
        ],
      },
      variant: {
        kind: 'choice',
        values: [
          'აირჩიე სწორი პასუხი.',
          'მონიშნე სწორი ვარიანტი.',
          'რომელი რიცხვი შეესაბამება?',
          'იპოვე სწორი მნიშვნელობა.',
        ],
      },
    },
    answer: () => 10,
    format: { kind: 'integer', min: 1, max: 50 },
    distractors: () => [5, 20, 50],
    explanation: () => 'რომაული ციფრი X აღნიშნავს 10-ს.',
  }),

  // Q46: რომაული ციფრი L
  defineTemplate({
    ...addr({ id: 'g3-u01-46', subtopicId: 'u01-roman-numerals', difficulty: 2 }),
    prompt: '{intro} რას აღნიშნავს რომაული ციფრი L? {variant}',
    variables: {
      intro: {
        kind: 'choice',
        values: [
          'მათემატიკაში',
          'რომაულ ჩაწერაში',
          'დააკვირდი ჩანაწერს:',
          'რომაულ ციფრებში',
        ],
      },
      variant: {
        kind: 'choice',
        values: [
          'აირჩიე სწორი პასუხი.',
          'მონიშნე სწორი ვარიანტი.',
          'რომელი რიცხვი შეესაბამება?',
          'იპოვე სწორი მნიშვნელობა.',
        ],
      },
    },
    answer: () => 50,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: () => [10, 20, 40],
    explanation: () => 'რომაული ციფრი L აღნიშნავს 50-ს.',
  }),

  // Q47: შეაერთე რომაული და ჩვეულებრივი ჩანაწერი
  defineTemplate({
    ...addr({ id: 'g3-u01-47', subtopicId: 'u01-roman-numerals', difficulty: 3 }),
    prompt: 'რას უდრის რომაული ჩანაწერი {roman}?',
    variables: {
      idx: { kind: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
      val: {
        kind: 'choice',
        values: (v) => [[2, 3, 4, 6, 7, 8, 9, 11, 12, 14, 15, 16, 19, 20, 25, 30, 40][Number(v.idx)]],
      },
      roman: { kind: 'choice', values: (v) => [toRoman(Number(v.val))] },
    },
    answer: (v) => Number(v.val),
    format: { kind: 'integer', min: 1, max: 50 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 50),
    explanation: ({ vars, answer }) => `რომაული ${vars.roman} უდრის ${answer}-ს.`,
  }),

  // Q48: ჩაწერე რომაულად
  defineTemplate({
    ...addr({ id: 'g3-u01-48', subtopicId: 'u01-roman-numerals', difficulty: 3 }),
    prompt: 'რომელი რომაული ჩანაწერი აღნიშნავს რიცხვს {n}?',
    variables: {
      idx: { kind: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
      n: {
        kind: 'choice',
        values: (v) => [[2, 3, 4, 6, 7, 8, 9, 11, 12, 14, 15, 16, 19, 20, 25, 30, 40][Number(v.idx)]],
      },
    },
    answer: (v) => toRoman(Number(v.n)),
    format: { kind: 'text' },
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      const wrong = [
        toRoman(n > 1 ? n - 1 : 2),
        toRoman(n + 1),
        toRoman(n > 5 ? n - 2 : n + 2),
      ];
      return wrong.filter((x) => x !== String(answer));
    },
    explanation: ({ vars, answer }) => `${vars.n} რომაული ციფრებით ჩაიწერება როგორც ${answer}.`,
  }),
];
