/**
 * Grade 4 — U01: რიცხვები და რიცხვითი სისტემები (Numbers and Number Systems).
 *
 * Full curriculum implementation for Grade 4 Unit 1 from Google Drive document U01
 * (folder "WEBSITE GRADE 4"):
 * 90 templates (Q01–Q90) across 15 subtopics with complete Level 1, 2, and 3 coverage (6 questions per subtopic):
 *
 *   U01.1  u01-roman-numerals          (რომაული ციფრები, Q01–Q06)
 *   U01.2  u01-even-odd                (ლუწი და კენტი რიცხვები, Q07–Q12)
 *   U01.3  u01-dates                   (მოქმედებები თარიღებთან, Q13–Q18)
 *   U01.4  u01-rounding                (ნატურალური რიცხვების დამრგვალება, Q19–Q24)
 *   U01.5  u01-prime-composite         (მარტივი და შედგენილი რიცხვები, Q25–Q30)
 *   U01.6  u01-compare-million         (რიცხვების შედარება მილიონამდე, Q31–Q36)
 *   U01.7  u01-patterns-sequences      (შესაბამისი რიცხვები და ნიმუშები, Q37–Q42)
 *   U01.8  u01-hundred-chart           (ასეულების ცხრილის ანალიზი, Q43–Q48)
 *   U01.9  u01-min-max-even-odd        (უმცირესი და უდიდესი ლუწი/კენტი რიცხვები, Q49–Q54)
 *   U01.10 u01-multiply-tens           (ათზე და მის ჯერადებზე გამრავლება, Q55–Q60)
 *   U01.11 u01-digit-counting          (ციფრების დათვლა, Q61–Q66)
 *   U01.12 u01-operations              (მოქმედებები რიცხვებზე, Q67–Q72)
 *   U01.13 u01-extreme-values          (მოქმედებები უმცირეს და უდიდეს მნიშვნელობებზე, Q73–Q78)
 *   U01.14 u01-difference-word-problems(განსხვავებული რაოდენობების პოვნა, Q79–Q84)
 *   U01.15 u01-arithmetic-mean         (საშუალო არითმეტიკული, Q85–Q90)
 */

import { defineTemplate } from './types';
import type { QuestionTemplate } from './types';

const grade = 4 as const;
const topicId = 'g4-ricxvebi-sistemebi' as const;
const unitId = 'g4-ricxvebi-sistemebi' as const;

export const G4_U01_SUBTOPICS = [
  'u01-roman-numerals',
  'u01-even-odd',
  'u01-dates',
  'u01-rounding',
  'u01-prime-composite',
  'u01-compare-million',
  'u01-patterns-sequences',
  'u01-hundred-chart',
  'u01-min-max-even-odd',
  'u01-multiply-tens',
  'u01-digit-counting',
  'u01-operations',
  'u01-extreme-values',
  'u01-difference-word-problems',
  'u01-arithmetic-mean',
] as const;

export type G4U01SubtopicId = (typeof G4_U01_SUBTOPICS)[number];

const addr = (spec: { id: string; subtopicId: G4U01SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  id: spec.id,
  grade,
  topicId,
  unitId,
  subtopicId: spec.subtopicId,
  difficulty: spec.difficulty,
});

/** Near-miss helper for integer distractors */
export const nearMisses = (answer: number, count = 3, step = 1, minVal = 0): number[] => {
  const safeStep = Math.max(1, Math.abs(step));
  const wrong: number[] = [];
  const offsets = [safeStep, -safeStep, 2 * safeStep, -2 * safeStep, 3 * safeStep, 5 * safeStep, -5 * safeStep, 10 * safeStep, -10 * safeStep];
  for (const offset of offsets) {
    const cand = answer + offset;
    if (cand >= minVal && cand !== answer && !wrong.includes(cand)) {
      wrong.push(cand);
      if (wrong.length >= count) break;
    }
  }
  let fallback = answer + safeStep;
  while (wrong.length < count) {
    if (fallback >= minVal && fallback !== answer && !wrong.includes(fallback)) {
      wrong.push(fallback);
    }
    fallback += safeStep;
  }
  return wrong.slice(0, count);
};

const ROMAN_MAP: [number, string][] = [
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

export const toRoman = (n: number): string => {
  if (n <= 0) return '';
  let left = n;
  let out = '';
  for (const [val, sym] of ROMAN_MAP) {
    while (left >= val) {
      out += sym;
      left -= val;
    }
  }
  return out;
};

export const fromRoman = (roman: string): number => {
  const values: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 };
  let total = 0;
  for (let i = 0; i < roman.length; i++) {
    const cur = values[roman[i]] ?? 0;
    const next = values[roman[i + 1]] ?? 0;
    if (cur < next) {
      total -= cur;
    } else {
      total += cur;
    }
  }
  return total;
};

export const G4_U01_TEMPLATES: QuestionTemplate[] = [
  // ==================================================================
  // U01.1 — რომაული ციფრები (u01-roman-numerals)
  // ==================================================================

  // Q01 (Level 1): ჩაწერე რომაული ციფრებით 1-15
  defineTemplate({
    ...addr({ id: 'g4-u01-01', subtopicId: 'u01-roman-numerals', difficulty: 1 }),
    prompt: 'ჩაწერე რომაული ციფრებით რიცხვი {val}.',
    variables: {
      val: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
    },
    answer: (v) => toRoman(Number(v.val)),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const val = Number(vars.val);
      const wrong = [val - 1, val + 1, val + 2, val - 2]
        .filter((x) => x >= 1 && x <= 20 && x !== val)
        .map(toRoman);
      return Array.from(new Set(wrong)).filter((x) => x !== answer).slice(0, 3);
    },
    explanation: ({ vars, answer }) => `რიცხვი ${vars.val} რომაული ციფრებით იწერება როგორც ${answer}.`,
  }),

  // Q02 (Level 1): ჩაწერე რომაული ციფრებით 16-30
  defineTemplate({
    ...addr({ id: 'g4-u01-02', subtopicId: 'u01-roman-numerals', difficulty: 1 }),
    prompt: 'ჩაწერე რომაული ციფრებით რიცხვი {val}.',
    variables: {
      val: { kind: 'choice', values: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30] },
    },
    answer: (v) => toRoman(Number(v.val)),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const val = Number(vars.val);
      const wrong = [val - 1, val + 1, val + 2, val - 2]
        .filter((x) => x >= 10 && x <= 35 && x !== val)
        .map(toRoman);
      return Array.from(new Set(wrong)).filter((x) => x !== answer).slice(0, 3);
    },
    explanation: ({ vars, answer }) => `რიცხვი ${vars.val} რომაული ციფრებით იწერება როგორც ${answer}.`,
  }),

  // Q03 (Level 2): რას უდრის რომაული ჩანაწერი 11-25
  defineTemplate({
    ...addr({ id: 'g4-u01-03', subtopicId: 'u01-roman-numerals', difficulty: 2 }),
    prompt: 'რას უდრის რომაული ჩანაწერი {numeral}?',
    variables: {
      val: { kind: 'choice', values: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25] },
      numeral: { kind: 'choice', values: (v) => [toRoman(Number(v.val))] },
    },
    answer: (v) => Number(v.val),
    format: { kind: 'integer', min: 1, max: 50 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `რომაული ჩანაწერი ${vars.numeral} უდრის ${answer}-ს.`,
  }),

  // Q04 (Level 2): რას უდრის რომაული ჩანაწერი 26-39
  defineTemplate({
    ...addr({ id: 'g4-u01-04', subtopicId: 'u01-roman-numerals', difficulty: 2 }),
    prompt: 'რას უდრის რომაული ჩანაწერი {numeral}?',
    variables: {
      val: { kind: 'choice', values: [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39] },
      numeral: { kind: 'choice', values: (v) => [toRoman(Number(v.val))] },
    },
    answer: (v) => Number(v.val),
    format: { kind: 'integer', min: 1, max: 50 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `რომაული ჩანაწერი ${vars.numeral} უდრის ${answer}-ს.`,
  }),

  // Q05 (Level 3): ჩაწერე რომაული ციფრებით 31-85 (L / XL)
  defineTemplate({
    ...addr({ id: 'g4-u01-05', subtopicId: 'u01-roman-numerals', difficulty: 3 }),
    prompt: 'ჩაწერე რომაული ციფრებით რიცხვი {val}.',
    variables: {
      val: { kind: 'choice', values: [36, 40, 42, 44, 45, 48, 49, 50, 52, 54, 55, 58, 60, 64, 65, 70, 75, 80] },
    },
    answer: (v) => toRoman(Number(v.val)),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const val = Number(vars.val);
      const wrong = [val - 1, val + 1, val + 5, val - 5]
        .filter((x) => x >= 30 && x <= 90 && x !== val)
        .map(toRoman);
      return Array.from(new Set(wrong)).filter((x) => x !== answer).slice(0, 3);
    },
    explanation: ({ vars, answer }) => `რიცხვი ${vars.val} რომაული ციფრებით იწერება როგორც ${answer}.`,
  }),

  // Q06 (Level 3): ჩაწერე ჩვეულებრივი ციფრებით: XLII
  defineTemplate({
    ...addr({ id: 'g4-u01-06', subtopicId: 'u01-roman-numerals', difficulty: 3 }),
    prompt: 'ჩაწერე ჩვეულებრივი ციფრებით: {numeral}.',
    variables: {
      val: { kind: 'choice', values: [40, 41, 42, 44, 45, 49, 50, 52, 55, 58, 60, 62, 65, 69, 70, 74, 75] },
      numeral: { kind: 'choice', values: (v) => [toRoman(Number(v.val))] },
    },
    answer: (v) => Number(v.val),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.numeral} ჩვეულებრივი ციფრებით არის ${answer}.`,
  }),

  // ==================================================================
  // U01.2 — ლუწი და კენტი რიცხვები (u01-even-odd)
  // ==================================================================

  // Q07 (Level 1): მოცემული რიცხვებიდან რომელია ლუწი
  defineTemplate({
    ...addr({ id: 'g4-u01-07', subtopicId: 'u01-even-odd', difficulty: 1 }),
    prompt: 'მოცემული რიცხვებიდან რომელია ლუწი: {a}, {b}, {c}?',
    variables: {
      odd1: { kind: 'choice', values: [347, 581, 693, 125, 439, 751, 863, 217, 945, 369, 521, 673, 815, 937] },
      even: { kind: 'choice', values: [582, 348, 694, 126, 440, 752, 864, 218, 946, 370, 522, 674, 816, 938] },
      odd2: { kind: 'choice', values: [691, 349, 583, 127, 441, 753, 865, 219, 947, 371, 523, 675, 817, 939] },
      a: { kind: 'choice', values: (v) => [Number(v.odd1)] },
      b: { kind: 'choice', values: (v) => [Number(v.even)] },
      c: { kind: 'choice', values: (v) => [Number(v.odd2)] },
    },
    answer: (v) => Number(v.even),
    format: { kind: 'integer' },
    optionCount: 3,
    distractors: ({ vars }) => [Number(vars.odd1), Number(vars.odd2)],
    explanation: ({ answer }) => `${answer} ლუწია, რადგან მისი ბოლო ციფრი ლუწია (0, 2, 4, 6 ან 8).`,
  }),

  // Q08 (Level 1): მოცემული რიცხვებიდან რომელია კენტი
  defineTemplate({
    ...addr({ id: 'g4-u01-08', subtopicId: 'u01-even-odd', difficulty: 1 }),
    prompt: 'მოცემული რიცხვებიდან რომელია კენტი: {a}, {b}, {c}?',
    variables: {
      even1: { kind: 'choice', values: [420, 532, 644, 756, 868, 122, 234, 346, 458, 560, 672, 784, 896, 918] },
      odd: { kind: 'choice', values: [735, 421, 533, 645, 757, 869, 123, 235, 347, 459, 561, 673, 785, 897] },
      even2: { kind: 'choice', values: [864, 422, 534, 646, 758, 870, 124, 236, 348, 460, 562, 674, 786, 898] },
      a: { kind: 'choice', values: (v) => [Number(v.even1)] },
      b: { kind: 'choice', values: (v) => [Number(v.odd)] },
      c: { kind: 'choice', values: (v) => [Number(v.even2)] },
    },
    answer: (v) => Number(v.odd),
    format: { kind: 'integer' },
    optionCount: 3,
    distractors: ({ vars }) => [Number(vars.even1), Number(vars.even2)],
    explanation: ({ answer }) => `${answer} კენტია, რადგან მისი ბოლო ციფრი კენტია (1, 3, 5, 7 ან 9).`,
  }),

  // Q09 (Level 2): დაწერე უმცირესი ლუწი K-ნიშნა რიცხვი პირველი ციფრით D
  defineTemplate({
    ...addr({ id: 'g4-u01-09', subtopicId: 'u01-even-odd', difficulty: 2 }),
    prompt: 'დაწერე უმცირესი ლუწი {digitsLabel}-ნიშნა რიცხვი, რომლის პირველი ციფრია {d}.',
    variables: {
      k: { kind: 'choice', values: [3, 4, 5] },
      d: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      digitsLabel: { kind: 'choice', values: (v) => [v.k === 3 ? 'სამ' : v.k === 4 ? 'ოთხ' : 'ხუთ'] },
    },
    answer: (v) => Number(v.d) * Math.pow(10, Number(v.k) - 1),
    format: { kind: 'integer' },
    distractors: ({ answer }) => {
      const ans = Number(answer);
      return [ans + 2, ans + 4, ans + 10];
    },
    explanation: ({ vars, answer }) => `უმცირესი ლუწი ${vars.digitsLabel}-ნიშნა რიცხვი ციფრით ${vars.d} დასაწყისში არის ${answer}.`,
  }),

  // Q10 (Level 2): დაწერე უდიდესი კენტი K-ნიშნა რიცხვი პირველი ციფრით D
  defineTemplate({
    ...addr({ id: 'g4-u01-10', subtopicId: 'u01-even-odd', difficulty: 2 }),
    prompt: 'დაწერე უდიდესი კენტი {digitsLabel}-ნიშნა რიცხვი, რომლის პირველი ციფრია {d}.',
    variables: {
      k: { kind: 'choice', values: [3, 4] },
      d: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      digitsLabel: { kind: 'choice', values: (v) => [v.k === 3 ? 'სამ' : 'ოთხ'] },
    },
    answer: (v) => (Number(v.d) + 1) * Math.pow(10, Number(v.k) - 1) - 1,
    format: { kind: 'integer' },
    distractors: ({ answer }) => {
      const ans = Number(answer);
      return [ans - 2, ans - 4, ans - 10];
    },
    explanation: ({ vars, answer }) => `უდიდესი კენტი ${vars.digitsLabel}-ნიშნა რიცხვი პირველი ციფრით ${vars.d} არის ${answer}.`,
  }),

  // Q11 (Level 3): რამდენი ლუწი/კენტი რიცხვია A-დან B-ის ჩათვლით
  defineTemplate({
    ...addr({ id: 'g4-u01-11', subtopicId: 'u01-even-odd', difficulty: 3 }),
    prompt: 'რამდენი {parity} რიცხვია {a}-დან {b}-ის ჩათვლით?',
    variables: {
      a: { kind: 'choice', values: [20, 30, 40, 50, 60, 70, 80, 100, 120, 140, 160, 180, 200] },
      span: { kind: 'choice', values: [10, 20, 30] },
      b: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.span)] },
      parity: { kind: 'choice', values: ['ლუწი', 'კენტი'] },
    },
    answer: (v) => {
      const span = Number(v.span);
      return v.parity === 'ლუწი' ? span / 2 + 1 : span / 2;
    },
    format: { kind: 'integer' },
    distractors: ({ answer }) => {
      const ans = Number(answer);
      return [ans - 1, ans + 1, ans + 2].filter((x) => x > 0 && x !== ans);
    },
    explanation: ({ vars, answer }) => `${vars.a}-დან ${vars.b}-ის ჩათვლით სულ ${answer} ${vars.parity} რიცხვია.`,
  }),

  // Q12 (Level 3): რიცხვი N ლუწია თუ კენტი
  defineTemplate({
    ...addr({ id: 'g4-u01-12', subtopicId: 'u01-even-odd', difficulty: 3 }),
    prompt: 'რიცხვი {n} ლუწია თუ კენტი?',
    variables: {
      n: { kind: 'choice', values: [4578, 2341, 6784, 1295, 8762, 9037, 3450, 5673, 7896, 4329, 6548, 8761, 2194, 9875, 3412, 5627, 7830, 4983, 6216, 8439] },
    },
    answer: (v) => (Number(v.n) % 2 === 0 ? 'ლუწი' : 'კენტი'),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => [answer === 'ლუწი' ? 'კენტი' : 'ლუწი'],
    explanation: ({ vars, answer }) => {
      const last = String(vars.n).slice(-1);
      return `რიცხვი ${vars.n} მთავრდება ციფრით ${last}, ამიტომ ის არის ${answer}.`;
    },
  }),

  // ==================================================================
  // U01.3 — მოქმედებები თარიღებთან (u01-dates)
  // ==================================================================

  // Q13 (Level 1): დღეს D Month-ია. რა თარიღი იქნება K დღის შემდეგ?
  defineTemplate({
    ...addr({ id: 'g4-u01-13', subtopicId: 'u01-dates', difficulty: 1 }),
    prompt: 'დღეს {d} {month}ა. რა თარიღი იქნება {k} დღის შემდეგ?',
    variables: {
      month: { kind: 'choice', values: ['მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი'] },
      d: { kind: 'choice', values: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20] },
      k: { kind: 'choice', values: [3, 4, 5, 6, 7] },
    },
    answer: (v) => `${Number(v.d) + Number(v.k)} ${v.month}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const d = Number(vars.d);
      const k = Number(vars.k);
      const m = String(vars.month);
      return [
        `${d + k - 1} ${m}`,
        `${d + k + 1} ${m}`,
        `${d + k + 2} ${m}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.d} + ${vars.k} = ${Number(vars.d) + Number(vars.k)}, ამიტომ იქნება ${answer}.`,
  }),

  // Q14 (Level 1): ღონისძიება D2 Month-საა, დღეს კი D1 Month-ია
  defineTemplate({
    ...addr({ id: 'g4-u01-14', subtopicId: 'u01-dates', difficulty: 1 }),
    prompt: 'ღონისძიება {d2} {month}საა, დღეს კი {d1} {month}ა. რამდენ დღეში გაიმართება ღონისძიება?',
    variables: {
      month: { kind: 'choice', values: ['ივნისი', 'მაისი', 'აპრილი', 'მარტი', 'ივლისი', 'აგვისტო'] },
      d1: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
      k: { kind: 'choice', values: [4, 5, 6, 7, 8, 9, 10] },
      d2: { kind: 'choice', values: (v) => [Number(v.d1) + Number(v.k)] },
    },
    answer: (v) => Number(v.k),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.d2} − ${vars.d1} = ${answer} დღეში გაიმართება ღონისძიება.`,
  }),

  // Q15 (Level 2): თვის გადასვლა
  defineTemplate({
    ...addr({ id: 'g4-u01-15', subtopicId: 'u01-dates', difficulty: 2 }),
    prompt: 'დღეს {d1} {m1}ა. რა თარიღი იქნება {k} დღის შემდეგ?',
    variables: {
      pair: {
        kind: 'choice',
        values: [
          '27|აპრილი|30|4|1|მაისი',
          '28|აპრილი|30|4|2|მაისი',
          '29|მაისი|31|4|2|ივნისი',
          '28|მაისი|31|5|2|ივნისი',
          '27|ივნისი|30|5|2|ივლისი',
          '26|ივნისი|30|6|2|ივლისი',
          '29|ივლისი|31|4|2|აგვისტო',
          '28|აგვისტო|31|5|2|სექტემბერი',
          '27|სექტემბერი|30|5|2|ოქტომბერი',
          '28|ოქტომბერი|31|5|2|ნოემბერი',
          '27|ნოემბერი|30|5|2|დეკემბერი',
          '29|იანვარი|31|4|2|თებერვალი',
          '28|მარტი|31|5|2|აპრილი',
        ],
      },
      d1: { kind: 'choice', values: (v) => [String(v.pair).split('|')[0]] },
      m1: { kind: 'choice', values: (v) => [String(v.pair).split('|')[1]] },
      daysInM1: { kind: 'choice', values: (v) => [String(v.pair).split('|')[2]] },
      k: { kind: 'choice', values: (v) => [String(v.pair).split('|')[3]] },
      targetDay: { kind: 'choice', values: (v) => [String(v.pair).split('|')[4]] },
      m2: { kind: 'choice', values: (v) => [String(v.pair).split('|')[5]] },
    },
    answer: (v) => `${v.targetDay} ${v.m2}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const td = Number(vars.targetDay);
      const m2 = String(vars.m2);
      return [
        `${td + 1} ${m2}`,
        `${td + 2} ${m2}`,
        `${td + 3} ${m2}`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `${vars.m1}-ში ${vars.daysInM1} დღეა, ამიტომ ${vars.d1} ${vars.m1}-დან ${vars.k} დღის შემდეგ იქნება ${answer}.`,
  }),

  // Q16 (Level 2): არდადეგები D1-დან D2-მდე
  defineTemplate({
    ...addr({ id: 'g4-u01-16', subtopicId: 'u01-dates', difficulty: 2 }),
    prompt: 'არდადეგები {d1} {month}ს იწყება და {d2} {month}ს მთავრდება. რამდენი დღეა ამ თარიღებს შორის?',
    variables: {
      month: { kind: 'choice', values: ['ივლისი', 'აგვისტო', 'იანვარი', 'ივნისი'] },
      d1: { kind: 'choice', values: [5, 8, 10, 12, 14, 15] },
      span: { kind: 'choice', values: [8, 9, 10, 11, 12, 14, 15] },
      d2: { kind: 'choice', values: (v) => [Number(v.d1) + Number(v.span)] },
    },
    answer: (v) => Number(v.span),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.d2} − ${vars.d1} = ${answer} დღეა ამ თარიღებს შორის.`,
  }),

  // Q17 (Level 3): თვის D1 რიცხვში დაიწყო პროექტი, ხოლო D2-ში დასრულდა
  defineTemplate({
    ...addr({ id: 'g4-u01-17', subtopicId: 'u01-dates', difficulty: 3 }),
    prompt: 'თვის {d1} რიცხვში დაიწყო პროექტი, ხოლო {d2} რიცხვში დასრულდა. რამდენი დღე გავიდა დაწყებიდან დასრულებამდე?',
    variables: {
      d1: { kind: 'choice', values: [3, 5, 7, 9, 11, 13] },
      span: { kind: 'choice', values: [7, 8, 9, 10, 11, 12, 14, 15] },
      d2: { kind: 'choice', values: (v) => [Number(v.d1) + Number(v.span)] },
    },
    answer: (v) => Number(v.span),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.d2} − ${vars.d1} = ${answer} დღე გავიდა დაწყებიდან დასრულებამდე.`,
  }),

  // Q18 (Level 3): ნაკიანი წელი — თებერვალი
  defineTemplate({
    ...addr({ id: 'g4-u01-18', subtopicId: 'u01-dates', difficulty: 3 }),
    prompt: 'თუ დღეს {d} თებერვალია და წელი ნაკიანია, რა თარიღი იქნება {k} დღის შემდეგ?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '28|1|29 თებერვალი',
          '28|2|1 მარტი',
          '28|3|2 მარტი',
          '28|4|3 მარტი',
          '28|5|4 მარტი',
          '27|2|29 თებერვალი',
          '27|3|1 მარტი',
          '27|4|2 მარტი',
          '27|5|3 მარტი',
          '26|3|29 თებერვალი',
          '26|4|1 მარტი',
          '26|5|2 მარტი',
          '29|1|1 მარტი',
          '29|2|2 მარტი',
        ],
      },
      d: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      k: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      target: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.target),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ answer }) => {
      const pool = ['29 თებერვალი', '1 მარტი', '2 მარტი', '3 მარტი', '4 მარტი', '5 მარტი'];
      return pool.filter((x) => x !== answer).slice(0, 3);
    },
    explanation: ({ vars, answer }) => `ნაკიან წელს თებერვალში 29 დღეა, ამიტომ ${vars.d} თებერვლიდან ${vars.k} დღის შემდეგ იქნება ${answer}.`,
  }),

  // ==================================================================
  // U01.4 — ნატურალური რიცხვების დამრგვალება (u01-rounding)
  // ==================================================================

  // Q19 (Level 1): დაამრგვალე უახლოეს ათეულამდე
  defineTemplate({
    ...addr({ id: 'g4-u01-19', subtopicId: 'u01-rounding', difficulty: 1 }),
    prompt: 'დაამრგვალე {n} უახლოეს ათეულამდე.',
    variables: {
      n: { kind: 'choice', values: [4638, 5214, 7826, 3145, 8952, 6477, 2383, 9129, 1564, 3891, 7428, 5632, 4176, 8253] },
    },
    answer: (v) => Math.round(Number(v.n) / 10) * 10,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 0),
    explanation: ({ vars, answer }) => `${vars.n}-ის ბოლო ციფრიდან გამომდინარე, უახლოეს ათეულამდე დამრგვალებით მიიღება ${answer}.`,
  }),

  // Q20 (Level 1): დაამრგვალე უახლოეს ასეულამდე
  defineTemplate({
    ...addr({ id: 'g4-u01-20', subtopicId: 'u01-rounding', difficulty: 1 }),
    prompt: 'დაამრგვალე {n} უახლოეს ასეულამდე.',
    variables: {
      n: { kind: 'choice', values: [7251, 4638, 3849, 8165, 5923, 2478, 6314, 9582, 1746, 4291, 5837, 7624, 3185, 8462] },
    },
    answer: (v) => Math.round(Number(v.n) / 100) * 100,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 0),
    explanation: ({ vars, answer }) => `${vars.n}-ის უახლოეს ასეულამდე დამრგვალებით მიიღება ${answer}.`,
  }),

  // Q21 (Level 2): დაამრგვალე უახლოეს ათასეულამდე
  defineTemplate({
    ...addr({ id: 'g4-u01-21', subtopicId: 'u01-rounding', difficulty: 2 }),
    prompt: 'დაამრგვალე {n} უახლოეს ათასეულამდე.',
    variables: {
      n: { kind: 'choice', values: [38649, 86749, 24350, 47820, 52190, 68910, 73450, 91280, 15670, 34820, 62490, 79530, 83140] },
    },
    answer: (v) => Math.round(Number(v.n) / 1000) * 1000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 0),
    explanation: ({ vars, answer }) => `${vars.n}-ის უახლოეს ათასეულამდე დამრგვალებით მიიღება ${answer}.`,
  }),

  // Q22 (Level 2): დაამრგვალე უახლოეს ათიათასეულამდე
  defineTemplate({
    ...addr({ id: 'g4-u01-22', subtopicId: 'u01-rounding', difficulty: 2 }),
    prompt: 'დაამრგვალე {n} უახლოეს ათიათასეულამდე.',
    variables: {
      n: { kind: 'choice', values: [465200, 382400, 528900, 714600, 836500, 247100, 693800, 158200, 924300, 341900, 576400, 782100] },
    },
    answer: (v) => Math.round(Number(v.n) / 10000) * 10000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10000, 0),
    explanation: ({ vars, answer }) => `${vars.n}-ის უახლოეს ათიათასეულამდე დამრგვალებით მიიღება ${answer}.`,
  }),

  // Q23 (Level 3): რომელი რიცხვი მიიღება N-ის უახლოეს ათასეულამდე დამრგვალებით
  defineTemplate({
    ...addr({ id: 'g4-u01-23', subtopicId: 'u01-rounding', difficulty: 3 }),
    prompt: 'რომელი რიცხვი მიიღება {n}-ის უახლოეს ათასეულამდე დამრგვალებით?',
    variables: {
      n: { kind: 'choice', values: [86749, 38649, 52190, 64820, 71490, 49510, 27650, 93280, 18450, 34890, 76230, 82740] },
    },
    answer: (v) => Math.round(Number(v.n) / 1000) * 1000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 0),
    explanation: ({ vars, answer }) => `${vars.n}-ის უახლოეს ათასეულამდე დამრგვალებით მიიღება ${answer}.`,
  }),

  // Q24 (Level 3): უმცირესი მთელი რიცხვი, რომელიც ასეულამდე დამრგვალებისას Target-ს იძლევა
  defineTemplate({
    ...addr({ id: 'g4-u01-24', subtopicId: 'u01-rounding', difficulty: 3 }),
    prompt: 'დაასახელე უმცირესი მთელი რიცხვი, რომელიც უახლოეს ასეულამდე დამრგვალებისას {target}-ს იძლევა.',
    variables: {
      h: { kind: 'choice', values: [25, 28, 32, 35, 42, 45, 50, 56, 62, 68, 75, 84, 90] },
      target: { kind: 'choice', values: (v) => [Number(v.h) * 100] },
    },
    answer: (v) => Number(v.target) - 50,
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => {
      const t = Number(vars.target);
      const ans = Number(answer);
      return [t - 49, t - 100, t - 1].filter((x) => x !== ans);
    },
    explanation: ({ vars, answer }) => `${vars.target}-მდე დასამრგვალებლად უმცირესი რიცხვია ${vars.target} − 50 = ${answer}.`,
  }),

  // ==================================================================
  // U01.5 — მარტივი და შედგენილი რიცხვები (u01-prime-composite)
  // ==================================================================

  // Q25 (Level 1): რიცხვი N მარტივია თუ შედგენილი (მარტივები)
  defineTemplate({
    ...addr({ id: 'g4-u01-25', subtopicId: 'u01-prime-composite', difficulty: 1 }),
    prompt: 'რიცხვი {n} მარტივია თუ შედგენილი?',
    variables: {
      n: { kind: 'choice', values: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47] },
    },
    answer: () => 'მარტივი',
    format: { kind: 'text' },
    optionCount: 2,
    distractors: () => ['შედგენილი'],
    explanation: ({ vars }) => `რიცხვი ${vars.n} მარტივია, რადგან მას მხოლოდ ორი გამყოფი აქვს: 1 და თავისი თავი.`,
  }),

  // Q26 (Level 1): რიცხვი N მარტივია თუ შედგენილი (შედგენილები)
  defineTemplate({
    ...addr({ id: 'g4-u01-26', subtopicId: 'u01-prime-composite', difficulty: 1 }),
    prompt: 'რიცხვი {n} მარტივია თუ შედგენილი?',
    variables: {
      n: { kind: 'choice', values: [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27] },
    },
    answer: () => 'შედგენილი',
    format: { kind: 'text' },
    optionCount: 2,
    distractors: () => ['მარტივი'],
    explanation: ({ vars }) => `რიცხვი ${vars.n} შედგენილია, რადგან მას ორზე მეტი გამყოფი აქვს.`,
  }),

  // Q27 (Level 2): ჩამოთვლილთაგან რომელია მარტივი
  defineTemplate({
    ...addr({ id: 'g4-u01-27', subtopicId: 'u01-prime-composite', difficulty: 2 }),
    prompt: 'ჩამოთვლილთაგან რომელია მარტივი: {a}, {b}, {c}, {d}?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '9|11|21|27|11',
          '15|17|25|35|17',
          '14|19|22|26|19',
          '21|23|27|33|23',
          '25|29|35|45|29',
          '27|31|39|49|31',
          '33|37|45|55|37',
          '39|41|49|51|41',
          '45|43|49|63|43',
          '51|47|55|65|47',
          '8|13|18|24|13',
          '16|23|28|34|23',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      d: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      prime: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => Number(v.prime),
    format: { kind: 'integer' },
    optionCount: 4,
    distractors: ({ vars, answer }) => [Number(vars.a), Number(vars.b), Number(vars.c), Number(vars.d)].filter((x) => x !== Number(answer)),
    explanation: ({ answer }) => `${answer} მარტივი რიცხვია, დანარჩენები კი შედგენილია.`,
  }),

  // Q28 (Level 2): ჩამოთვლილთაგან რომელია შედგენილი
  defineTemplate({
    ...addr({ id: 'g4-u01-28', subtopicId: 'u01-prime-composite', difficulty: 2 }),
    prompt: 'ჩამოთვლილთაგან რომელია შედგენილი: {a}, {b}, {c}, {d}?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '13|17|19|25|25',
          '11|13|15|17|15',
          '19|21|23|29|21',
          '23|27|29|31|27',
          '31|33|37|41|33',
          '37|39|41|43|39',
          '41|43|47|49|49',
          '7|9|11|13|9',
          '2|3|5|8|8',
          '5|7|11|12|12',
          '17|19|23|26|26',
          '29|31|35|37|35',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      d: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      comp: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => Number(v.comp),
    format: { kind: 'integer' },
    optionCount: 4,
    distractors: ({ vars, answer }) => [Number(vars.a), Number(vars.b), Number(vars.c), Number(vars.d)].filter((x) => x !== Number(answer)),
    explanation: ({ answer }) => `${answer} შედგენილი რიცხვია, რადგან აქვს 1-ისა და თავის გარდა სხვა გამყოფებიც.`,
  }),

  // Q29 (Level 3): რამდენი მარტივი რიცხვია A-დან B-მდე
  defineTemplate({
    ...addr({ id: 'g4-u01-29', subtopicId: 'u01-prime-composite', difficulty: 3 }),
    prompt: 'რამდენი მარტივი რიცხვია {a}-დან {b}-ის ჩათვლით?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '1|10|4',
          '10|20|4',
          '20|30|2',
          '30|40|2',
          '40|50|3',
          '10|25|5',
          '20|35|3',
          '30|45|4',
          '1|15|6',
          '15|25|3',
          '25|35|2',
          '35|45|3',
          '45|55|2',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      count: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => Number(v.count),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a}-დან ${vars.b}-ის ჩათვლით სულ ${answer} მარტივი რიცხვია.`,
  }),

  // Q30 (Level 3): რომელია უმცირესი Category რიცხვი
  defineTemplate({
    ...addr({ id: 'g4-u01-30', subtopicId: 'u01-prime-composite', difficulty: 3 }),
    prompt: 'რომელია უმცირესი {category} რიცხვი?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'მარტივი|2',
          'ლუწი მარტივი|2',
          'კენტი მარტივი|3',
          'ორნიშნა მარტივი|11',
          'შედგენილი|4',
          'ლუწი შედგენილი|4',
          'კენტი შედგენილი|9',
          'ორნიშნა შედგენილი|10',
          'სამნიშნა მარტივი|101',
          'სამნიშნა შედგენილი|100',
          'ორნიშნა კენტი შედგენილი|15',
          'ორნიშნა კენტი მარტივი|11',
        ],
      },
      category: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      val: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => Number(v.val),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `უმცირესი ${vars.category} რიცხვი არის ${answer}.`,
  }),

  // ==================================================================
  // U01.6 — რიცხვების შედარება მილიონამდე (u01-compare-million)
  // ==================================================================

  // Q31 (Level 1): შეადარე 5-ნიშნა რიცხვები
  defineTemplate({
    ...addr({ id: 'g4-u01-31', subtopicId: 'u01-compare-million', difficulty: 1 }),
    prompt: 'შეადარე: {a} __ {b}. ჩასვი სწორი ნიშანი.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '45678|45687|<',
          '45687|45678|>',
          '52340|52340|=',
          '67890|67809|>',
          '34512|34521|<',
          '89123|89132|<',
          '74560|74560|=',
          '12345|12354|<',
          '98765|98756|>',
          '43210|43201|>',
          '56789|56798|<',
          '65432|65432|=',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      sign: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.sign),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ answer }) => ['<', '>', '='].filter((x) => x !== answer),
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  // Q32 (Level 1): შეადარე 6-ნიშნა რიცხვები
  defineTemplate({
    ...addr({ id: 'g4-u01-32', subtopicId: 'u01-compare-million', difficulty: 1 }),
    prompt: 'შეადარე: {a} __ {b}. ჩასვი სწორი ნიშანი.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '302450|302405|>',
          '302405|302450|<',
          '508120|580120|<',
          '580120|508120|>',
          '415600|415600|=',
          '654321|654312|>',
          '123456|123465|<',
          '789012|789021|<',
          '852147|852147|=',
          '963852|963825|>',
          '741852|741852|=',
          '369258|369285|<',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      sign: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.sign),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ answer }) => ['<', '>', '='].filter((x) => x !== answer),
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  // Q33 (Level 2): დაალაგე ზრდადობით
  defineTemplate({
    ...addr({ id: 'g4-u01-33', subtopicId: 'u01-compare-million', difficulty: 2 }),
    prompt: 'დაალაგე მოცემული რიცხვები ზრდადობით (უმცირესიდან უდიდესისკენ): {list}',
    variables: {
      base: {
        kind: 'choice',
        values: [
          '67450|67540|76405|76540',
          '12300|12350|21300|21350',
          '45100|45200|54100|54200',
          '31400|31500|41300|41500',
          '52100|52300|62100|62300',
          '71200|71400|81200|81400',
          '23400|23500|32400|32500',
          '64100|64200|74100|74200',
          '83100|83200|93100|93200',
          '15200|15400|25100|25400',
          '36100|36400|46100|46400',
          '58100|58300|68100|68300',
        ],
      },
      list: {
        kind: 'choice',
        values: (v) => {
          const parts = String(v.base).split('|');
          return [[parts[1], parts[3], parts[0], parts[2]].join(', ')];
        },
      },
    },
    answer: (v) => String(v.base).split('|').join('; '),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const parts = String(vars.base).split('|');
      const w1 = [parts[1], parts[0], parts[2], parts[3]].join('; ');
      const w2 = [parts[0], parts[2], parts[1], parts[3]].join('; ');
      const w3 = [parts[3], parts[2], parts[1], parts[0]].join('; ');
      return [w1, w2, w3].filter((x) => x !== answer);
    },
    explanation: ({ answer }) => `ზრდადობით სწორი თანმიმდევრობაა: ${answer}.`,
  }),

  // Q34 (Level 2): დაალაგე კლებადობით
  defineTemplate({
    ...addr({ id: 'g4-u01-34', subtopicId: 'u01-compare-million', difficulty: 2 }),
    prompt: 'დაალაგე მოცემული რიცხვები კლებადობით (უდიდესიდან უმცირესისკენ): {list}',
    variables: {
      base: {
        kind: 'choice',
        values: [
          '580210|580120|508210|508120',
          '690320|690230|609320|609230',
          '740510|740150|704510|704150',
          '830620|830260|803620|803260',
          '920410|920140|902410|902140',
          '470830|470380|407830|407380',
          '360920|360290|306920|306290',
          '590410|590140|509410|509140',
          '680520|680250|608520|608250',
          '750630|750360|705630|705360',
          '840710|840170|804710|804170',
          '930820|930280|903820|903280',
        ],
      },
      list: {
        kind: 'choice',
        values: (v) => {
          const parts = String(v.base).split('|');
          return [[parts[2], parts[0], parts[3], parts[1]].join(', ')];
        },
      },
    },
    answer: (v) => String(v.base).split('|').join('; '),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const parts = String(vars.base).split('|');
      const w1 = [parts[1], parts[0], parts[2], parts[3]].join('; ');
      const w2 = [parts[3], parts[2], parts[1], parts[0]].join('; ');
      const w3 = [parts[0], parts[2], parts[1], parts[3]].join('; ');
      return [w1, w2, w3].filter((x) => x !== answer);
    },
    explanation: ({ answer }) => `კლებადობით სწორი თანმიმდევრობაა: ${answer}.`,
  }),

  // Q35 (Level 3): შედარება მილიონთან
  defineTemplate({
    ...addr({ id: 'g4-u01-35', subtopicId: 'u01-compare-million', difficulty: 3 }),
    prompt: 'ჩასვი შესაბამისი ნიშანი: {a} __ {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '999999|1000000|<',
          '1000000|999999|>',
          '1000000|1000000|=',
          '999990|1000000|<',
          '1000000|999990|>',
          '999000|1000000|<',
          '1000000|999000|>',
          '999995|1000000|<',
          '1000000|999995|>',
          '990000|1000000|<',
          '1000000|990000|>',
          '999999|999999|=',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      sign: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.sign),
    format: { kind: 'text' },
    optionCount: 3,
    distractors: ({ answer }) => ['<', '>', '='].filter((x) => x !== answer),
    explanation: ({ vars, answer }) => `${vars.a} ${answer} ${vars.b}.`,
  }),

  // Q36 (Level 3): დაწერე უდიდესი რიცხვი, რომელიც M-ზე ნაკლებია
  defineTemplate({
    ...addr({ id: 'g4-u01-36', subtopicId: 'u01-compare-million', difficulty: 3 }),
    prompt: 'დაწერე უდიდესი ექვსნიშნა რიცხვი, რომელიც {m}-ზე ნაკლებია.',
    variables: {
      m: { kind: 'choice', values: [654321, 500000, 789450, 432100, 876540, 999000, 246800, 357910, 680240, 753190, 824650, 915370, 482610] },
    },
    answer: (v) => Number(v.m) - 1,
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => {
      const m = Number(vars.m);
      const ans = Number(answer);
      return [m - 2, m + 1, m - 10].filter((x) => x !== ans);
    },
    explanation: ({ vars, answer }) => `${vars.m}-ის უშუალოდ წინა რიცხვია ${vars.m} − 1 = ${answer}.`,
  }),

  // ==================================================================
  // U01.7 — შესაბამისი რიცხვები და ნიმუშები (u01-patterns-sequences)
  // ==================================================================

  // Q37 (Level 1): იპოვე გამოტოვებული რიცხვი (ზრდადი ასეულებით)
  defineTemplate({
    ...addr({ id: 'g4-u01-37', subtopicId: 'u01-patterns-sequences', difficulty: 1 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: {t1}, {t2}, {t3}, __, {t5}.',
    variables: {
      start: { kind: 'choice', values: [120, 150, 180, 210, 240, 100, 130, 140, 160, 200, 220, 250] },
      step: { kind: 'choice', values: [120, 100, 150, 200] },
      t1: { kind: 'choice', values: (v) => [Number(v.start)] },
      t2: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
      t3: { kind: 'choice', values: (v) => [Number(v.start) + 2 * Number(v.step)] },
      t5: { kind: 'choice', values: (v) => [Number(v.start) + 4 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) + 3 * Number(v.step),
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => nearMisses(Number(answer), 3, Number(vars.step)),
    explanation: ({ vars, answer }) => `მიმდევრობა იზრდება ${vars.step}-ით, ამიტომ გამოტოვებული რიცხვია ${answer}.`,
  }),

  // Q38 (Level 1): კლებადი მიმდევრობა
  defineTemplate({
    ...addr({ id: 'g4-u01-38', subtopicId: 'u01-patterns-sequences', difficulty: 1 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: {t1}, {t2}, {t3}, __, {t5}.',
    variables: {
      start: { kind: 'choice', values: [1500, 1600, 1800, 2000, 2200, 2500, 2800, 3000, 3200, 3500, 4000, 4500] },
      step: { kind: 'choice', values: [100, 200, 300] },
      t1: { kind: 'choice', values: (v) => [Number(v.start)] },
      t2: { kind: 'choice', values: (v) => [Number(v.start) - Number(v.step)] },
      t3: { kind: 'choice', values: (v) => [Number(v.start) - 2 * Number(v.step)] },
      t5: { kind: 'choice', values: (v) => [Number(v.start) - 4 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) - 3 * Number(v.step),
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => nearMisses(Number(answer), 3, Number(vars.step)),
    explanation: ({ vars, answer }) => `მიმდევრობა მცირდება ${vars.step}-ით, ამიტომ გამოტოვებული რიცხვია ${answer}.`,
  }),

  // Q39 (Level 2): დაასრულე მიმდევრობა (ათასეულებით)
  defineTemplate({
    ...addr({ id: 'g4-u01-39', subtopicId: 'u01-patterns-sequences', difficulty: 2 }),
    prompt: 'დაასრულე მიმდევრობა — რა არის შემდეგი რიცხვი: {t1}, {t2}, {t3}, __',
    variables: {
      start: { kind: 'choice', values: [1000, 2000, 3000, 4000, 5000, 1500, 2500, 3500, 4500, 1200, 2200, 3200] },
      step: { kind: 'choice', values: [1000, 2000, 3000] },
      t1: { kind: 'choice', values: (v) => [Number(v.start)] },
      t2: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
      t3: { kind: 'choice', values: (v) => [Number(v.start) + 2 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) + 3 * Number(v.step),
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => nearMisses(Number(answer), 3, Number(vars.step)),
    explanation: ({ vars, answer }) => `ყოველ ბიჯზე ემატება ${vars.step}, ამიტომ შემდეგი რიცხვია ${answer}.`,
  }),

  // Q40 (Level 2): რა წესით არის შედგენილი მიმდევრობა
  defineTemplate({
    ...addr({ id: 'g4-u01-40', subtopicId: 'u01-patterns-sequences', difficulty: 2 }),
    prompt: 'რა წესით არის შედგენილი მიმდევრობა: {t1}, {t2}, {t3}, {t4}?',
    variables: {
      step: { kind: 'choice', values: [45, 50, 60, 75, 80, 90, 120, 150, 200, 250, 300, 500] },
      t1: { kind: 'choice', values: (v) => [Number(v.step)] },
      t2: { kind: 'choice', values: (v) => [2 * Number(v.step)] },
      t3: { kind: 'choice', values: (v) => [3 * Number(v.step)] },
      t4: { kind: 'choice', values: (v) => [4 * Number(v.step)] },
    },
    answer: (v) => `ყოველ ბიჯზე ემატება ${v.step}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars, answer }) => {
      const s = Number(vars.step);
      return [
        `ყოველ ბიჯზე ემატება ${s + 10}`,
        `ყოველ ბიჯზე აკლდება ${s}`,
        `ყოველ ბიჯზე მრავლდება 2-ზე`,
      ].filter((x) => x !== answer);
    },
    explanation: ({ vars, answer }) => `თითოეული წევრი წინაზე ${vars.step}-ით მეტია: ${answer}.`,
  }),

  // Q41 (Level 3): მიმდევრობა ათიათასეულებში
  defineTemplate({
    ...addr({ id: 'g4-u01-41', subtopicId: 'u01-patterns-sequences', difficulty: 3 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: {t1}, {t2}, __, {t4}.',
    variables: {
      start: { kind: 'choice', values: [15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000] },
      step: { kind: 'choice', values: [5000, 10000] },
      t1: { kind: 'choice', values: (v) => [Number(v.start)] },
      t2: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
      t4: { kind: 'choice', values: (v) => [Number(v.start) + 3 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) + 2 * Number(v.step),
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => nearMisses(Number(answer), 3, Number(vars.step)),
    explanation: ({ vars, answer }) => `ნაბიჯი არის ${vars.step}, ამიტომ გამოტოვებული რიცხვია ${answer}.`,
  }),

  // Q42 (Level 3): შერეული ბიჯი (250, 500, 750)
  defineTemplate({
    ...addr({ id: 'g4-u01-42', subtopicId: 'u01-patterns-sequences', difficulty: 3 }),
    prompt: 'შეავსე ცარიელი ადგილი ისე, რომ მიმდევრობა გაგრძელდეს ერთი და იმავე წესით: {t1}, {t2}, {t3}, __.',
    variables: {
      start: { kind: 'choice', values: [8250, 1250, 2250, 3250, 4500, 5250, 6500, 7250, 8500, 9250, 1500, 3500] },
      step: { kind: 'choice', values: [250, 500, 750] },
      t1: { kind: 'choice', values: (v) => [Number(v.start)] },
      t2: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
      t3: { kind: 'choice', values: (v) => [Number(v.start) + 2 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) + 3 * Number(v.step),
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => nearMisses(Number(answer), 3, Number(vars.step)),
    explanation: ({ vars, answer }) => `ყოველ ბიჯზე ემატება ${vars.step}, ამიტომ შემდეგი რიცხვია ${answer}.`,
  }),

  // ==================================================================
  // U01.8 — ასეულების ცხრილის ანალიზი (u01-hundred-chart)
  // ==================================================================

  // Q43 (Level 1): რა რიცხვია N-ის მარჯვნივ
  defineTemplate({
    ...addr({ id: 'g4-u01-43', subtopicId: 'u01-hundred-chart', difficulty: 1 }),
    prompt: 'ასეულების ცხრილში რიცხვი {n} მდებარეობს. რა რიცხვია მის მარჯვნივ?',
    variables: {
      n: { kind: 'choice', values: [46, 23, 34, 57, 68, 72, 85, 14, 28, 39, 51, 63, 76, 82] },
    },
    answer: (v) => Number(v.n) + 1,
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      return [n - 1, n + 10, n - 10].filter((x) => x !== Number(answer));
    },
    explanation: ({ vars, answer }) => `ასეულების ცხრილში მარჯვნივ გადასვლა 1-ით ზრდას ნიშნავს: ${vars.n} + 1 = ${answer}.`,
  }),

  // Q44 (Level 1): რა რიცხვია N-ის ქვემოთ
  defineTemplate({
    ...addr({ id: 'g4-u01-44', subtopicId: 'u01-hundred-chart', difficulty: 1 }),
    prompt: 'რა რიცხვია {n}-ის ქვემოთ, თუ ცხრილში ქვემოთ გადაადგილება 10-ით ზრდას ნიშნავს?',
    variables: {
      n: { kind: 'choice', values: [58, 24, 35, 46, 67, 73, 12, 19, 27, 38, 49, 62, 71, 78] },
    },
    answer: (v) => Number(v.n) + 10,
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      return [n - 10, n + 1, n - 1].filter((x) => x !== Number(answer));
    },
    explanation: ({ vars, answer }) => `ცხრილში ქვემოთ გადაადგილება 10-ით ზრდას ნიშნავს: ${vars.n} + 10 = ${answer}.`,
  }),

  // Q45 (Level 2): რა რიცხვია N-ის მარცხნივ
  defineTemplate({
    ...addr({ id: 'g4-u01-45', subtopicId: 'u01-hundred-chart', difficulty: 2 }),
    prompt: 'რა რიცხვია {n}-ის მარცხნივ ასეულების ცხრილში?',
    variables: {
      n: { kind: 'choice', values: [73, 45, 56, 67, 84, 92, 25, 36, 48, 59, 62, 77, 88, 95] },
    },
    answer: (v) => Number(v.n) - 1,
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      return [n + 1, n + 10, n - 10].filter((x) => x !== Number(answer));
    },
    explanation: ({ vars, answer }) => `ასეულების ცხრილში მარცხნივ გადასვლა 1-ით შემცირებას ნიშნავს: ${vars.n} − 1 = ${answer}.`,
  }),

  // Q46 (Level 2): 1 ქვემოთ და R მარჯვნივ
  defineTemplate({
    ...addr({ id: 'g4-u01-46', subtopicId: 'u01-hundred-chart', difficulty: 2 }),
    prompt: '{n}-დან ერთი უჯრით ქვემოთ და {r} უჯრით მარჯვნივ გადავედით. რომელ რიცხვზე მოვხვდით?',
    variables: {
      n: { kind: 'choice', values: [34, 21, 23, 25, 42, 44, 46, 51, 53, 55, 62, 64] },
      r: { kind: 'choice', values: [1, 2, 3] },
    },
    answer: (v) => Number(v.n) + 10 + Number(v.r),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `1 უჯრა ქვემოთ (+10) და ${vars.r} უჯრა მარჯვნივ (+${vars.r}): ${vars.n} + 10 + ${vars.r} = ${answer}.`,
  }),

  // Q47 (Level 3): U უჯრით ზემოთ
  defineTemplate({
    ...addr({ id: 'g4-u01-47', subtopicId: 'u01-hundred-chart', difficulty: 3 }),
    prompt: '{n}-დან {u} უჯრით ზემოთ გადავედით ასეულების ცხრილში. რომელ რიცხვზე მოვხვდით?',
    variables: {
      n: { kind: 'choice', values: [87, 75, 96, 84, 68, 79, 92, 85, 73, 64, 91, 88] },
      u: { kind: 'choice', values: [1, 2, 3] },
    },
    answer: (v) => Number(v.n) - Number(v.u) * 10,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `ზემოთ ${vars.u} უჯრით გადასვლა ნიშნავს ${Number(vars.u) * 10}-ით შემცირებას: ${vars.n} − ${Number(vars.u) * 10} = ${answer}.`,
  }),

  // Q48 (Level 3): R მარჯვნივ და D ქვემოთ
  defineTemplate({
    ...addr({ id: 'g4-u01-48', subtopicId: 'u01-hundred-chart', difficulty: 3 }),
    prompt: 'ცხრილში {n}-დან {r} უჯრით მარჯვნივ და {d} უჯრით ქვემოთ გადავედით. რომელ რიცხვზე მოვხვდით?',
    variables: {
      n: { kind: 'choice', values: [25, 14, 32, 21, 35, 16, 23, 41, 33, 24, 15, 31] },
      r: { kind: 'choice', values: [2, 3, 4] },
      d: { kind: 'choice', values: [1, 2, 3] },
    },
    answer: (v) => Number(v.n) + Number(v.r) + Number(v.d) * 10,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.n} + ${vars.r} + ${Number(vars.d) * 10} = ${answer}.`,
  }),

  // ==================================================================
  // U01.9 — უმცირესი და უდიდესი ლუწი/კენტი რიცხვები (u01-min-max-even-odd)
  // ==================================================================

  // Q49 (Level 1): დაწერე უდიდესი ლუწი/კენტი სამნიშნა რიცხვი ციფრით D დასაწყისში
  defineTemplate({
    ...addr({ id: 'g4-u01-49', subtopicId: 'u01-min-max-even-odd', difficulty: 1 }),
    prompt: 'დაწერე უდიდესი {parity} სამნიშნა რიცხვი, რომლის პირველი ციფრია {d}.',
    variables: {
      d: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      parity: { kind: 'choice', values: ['ლუწი', 'კენტი'] },
    },
    answer: (v) => (v.parity === 'ლუწი' ? Number(v.d) * 100 + 98 : Number(v.d) * 100 + 99),
    format: { kind: 'integer' },
    distractors: ({ answer }) => {
      const ans = Number(answer);
      return [ans - 1, ans - 2, ans - 10].filter((x) => x !== ans);
    },
    explanation: ({ vars, answer }) => `უდიდესი ${vars.parity} სამნიშნა რიცხვი ციფრით ${vars.d} დასაწყისში არის ${answer}.`,
  }),

  // Q50 (Level 1): დაწერე უმცირესი ლუწი/კენტი ოთხნიშნა რიცხვი ციფრით D დასაწყისში
  defineTemplate({
    ...addr({ id: 'g4-u01-50', subtopicId: 'u01-min-max-even-odd', difficulty: 1 }),
    prompt: 'დაწერე უმცირესი {parity} ოთხნიშნა რიცხვი, რომლის პირველი ციფრია {d}.',
    variables: {
      d: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      parity: { kind: 'choice', values: ['ლუწი', 'კენტი'] },
    },
    answer: (v) => (v.parity === 'ლუწი' ? Number(v.d) * 1000 : Number(v.d) * 1000 + 1),
    format: { kind: 'integer' },
    distractors: ({ answer }) => {
      const ans = Number(answer);
      return [ans + 1, ans + 2, ans + 10].filter((x) => x !== ans);
    },
    explanation: ({ vars, answer }) => `უმცირესი ${vars.parity} ოთხნიშნა რიცხვი ციფრით ${vars.d} დასაწყისში არის ${answer}.`,
  }),

  // Q51 (Level 2): დაწერე უდიდესი ლუწი/კენტი ოთხნიშნა რიცხვი პირველი ორი ციფრით P
  defineTemplate({
    ...addr({ id: 'g4-u01-51', subtopicId: 'u01-min-max-even-odd', difficulty: 2 }),
    prompt: 'დაწერე უდიდესი {parity} ოთხნიშნა რიცხვი, რომლის პირველი ორი ციფრია {p}.',
    variables: {
      p: { kind: 'choice', values: [25, 34, 48, 51, 62, 73, 84, 91, 19, 28, 37, 46, 55, 64] },
      parity: { kind: 'choice', values: ['ლუწი', 'კენტი'] },
    },
    answer: (v) => (v.parity === 'ლუწი' ? Number(v.p) * 100 + 98 : Number(v.p) * 100 + 99),
    format: { kind: 'integer' },
    distractors: ({ answer }) => {
      const ans = Number(answer);
      return [ans - 1, ans - 2, ans - 10].filter((x) => x !== ans);
    },
    explanation: ({ vars, answer }) => `უდიდესი ${vars.parity} ოთხნიშნა რიცხვი, რომელიც იწყება ${vars.p}-ით, არის ${answer}.`,
  }),

  // Q52 (Level 2): დაწერე უმცირესი ლუწი/კენტი ექვსნიშნა რიცხვი ციფრით D
  defineTemplate({
    ...addr({ id: 'g4-u01-52', subtopicId: 'u01-min-max-even-odd', difficulty: 2 }),
    prompt: 'დაწერე უმცირესი {parity} ექვსნიშნა რიცხვი, რომლის პირველი ციფრია {d}.',
    variables: {
      d: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      parity: { kind: 'choice', values: ['ლუწი', 'კენტი'] },
    },
    answer: (v) => (v.parity === 'ლუწი' ? Number(v.d) * 100000 : Number(v.d) * 100000 + 1),
    format: { kind: 'integer' },
    distractors: ({ answer }) => {
      const ans = Number(answer);
      return [ans + 1, ans + 2, ans + 10].filter((x) => x !== ans);
    },
    explanation: ({ vars, answer }) => `უმცირესი ${vars.parity} ექვსნიშნა რიცხვი პირველი ციფრით ${vars.d} არის ${answer}.`,
  }),

  // Q53 (Level 3): უდიდესი ლუწი/კენტი რიცხვი, რომელიც Limit-ზე ნაკლებია
  defineTemplate({
    ...addr({ id: 'g4-u01-53', subtopicId: 'u01-min-max-even-odd', difficulty: 3 }),
    prompt: 'იპოვე უდიდესი {parity} რიცხვი, რომელიც {limit}-ზე ნაკლებია.',
    variables: {
      limit: { kind: 'choice', values: [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000] },
      parity: { kind: 'choice', values: ['ლუწი', 'კენტი'] },
    },
    answer: (v) => (v.parity === 'ლუწი' ? Number(v.limit) - 2 : Number(v.limit) - 1),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.limit}-ზე ნაკლები უდიდესი ${vars.parity} რიცხვია ${answer}.`,
  }),

  // Q54 (Level 3): უმცირესი კენტი/ლუწი რიცხვი, რომელიც Limit-ზე მეტია
  defineTemplate({
    ...addr({ id: 'g4-u01-54', subtopicId: 'u01-min-max-even-odd', difficulty: 3 }),
    prompt: 'იპოვე უმცირესი {parity} რიცხვი, რომელიც {limit}-ზე მეტია.',
    variables: {
      limit: { kind: 'choice', values: [999, 1999, 2999, 3999, 4999, 5999, 6999, 7999, 8999, 9999] },
      parity: { kind: 'choice', values: ['ლუწი', 'კენტი'] },
    },
    answer: (v) => (v.parity === 'ლუწი' ? Number(v.limit) + 1 : Number(v.limit) + 2),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.limit}-ზე მეტი უმცირესი ${vars.parity} რიცხვია ${answer}.`,
  }),

  // ==================================================================
  // U01.10 — ათზე და მის ჯერადებზე გამრავლება (u01-multiply-tens)
  // ==================================================================

  // Q55 (Level 1): გამოთვალე A × 10
  defineTemplate({
    ...addr({ id: 'g4-u01-55', subtopicId: 'u01-multiply-tens', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × 10.',
    variables: {
      a: { kind: 'choice', values: [46, 23, 35, 58, 67, 74, 82, 19, 28, 37, 49, 53, 62, 79, 85, 94] },
    },
    answer: (v) => Number(v.a) * 10,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} × 10 = ${answer}.`,
  }),

  // Q56 (Level 1): გამოთვალე A × 100
  defineTemplate({
    ...addr({ id: 'g4-u01-56', subtopicId: 'u01-multiply-tens', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} × 100.',
    variables: {
      a: { kind: 'choice', values: [328, 145, 256, 412, 534, 623, 718, 842, 935, 172, 284, 391, 467, 589] },
    },
    answer: (v) => Number(v.a) * 100,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 1),
    explanation: ({ vars, answer }) => `${vars.a} × 100 = ${answer}.`,
  }),

  // Q57 (Level 2): გამოთვალე A × 1 000
  defineTemplate({
    ...addr({ id: 'g4-u01-57', subtopicId: 'u01-multiply-tens', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} × 1 000.',
    variables: {
      a: { kind: 'choice', values: [57, 24, 38, 45, 63, 72, 86, 91, 16, 29, 34, 48, 52, 69, 78, 83] },
    },
    answer: (v) => Number(v.a) * 1000,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1),
    explanation: ({ vars, answer }) => `${vars.a} × 1 000 = ${answer}.`,
  }),

  // Q58 (Level 2): გამოთვალე A0 × B0 (e.g. 640 × 30)
  defineTemplate({
    ...addr({ id: 'g4-u01-58', subtopicId: 'u01-multiply-tens', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [640, 250, 320, 450, 520, 180, 240, 360, 420, 540, 620, 710] },
      b: { kind: 'choice', values: [20, 30, 40, 50] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q59 (Level 3): გამოთვალე A × B00 (e.g. 125 × 400)
  defineTemplate({
    ...addr({ id: 'g4-u01-59', subtopicId: 'u01-multiply-tens', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [125, 250, 150, 175, 225, 350, 450, 120, 140, 160, 180, 240] },
      b: { kind: 'choice', values: [200, 300, 400, 500] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q60 (Level 3): უცნობი რიცხვი: □ × factor = product
  defineTemplate({
    ...addr({ id: 'g4-u01-60', subtopicId: 'u01-multiply-tens', difficulty: 3 }),
    prompt: 'იპოვე უცნობი რიცხვი: □ × {factor} = {product}',
    variables: {
      factor: { kind: 'choice', values: [100, 1000] },
      ans: { kind: 'choice', values: [385, 246, 172, 459, 513, 628, 734, 841, 952, 163, 274, 386] },
      product: { kind: 'choice', values: (v) => [Number(v.ans) * Number(v.factor)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.product} ÷ ${vars.factor} = ${answer}.`,
  }),

  // ==================================================================
  // U01.11 — ციფრების დათვლა (u01-digit-counting)
  // ==================================================================

  // Q61 (Level 1): რამდენი ციფრია რიცხვში N (3-5 ნიშნა)
  defineTemplate({
    ...addr({ id: 'g4-u01-61', subtopicId: 'u01-digit-counting', difficulty: 1 }),
    prompt: 'რამდენი ციფრია რიცხვში {n}?',
    variables: {
      n: { kind: 'choice', values: [8462, 735, 12948, 4521, 689, 34712, 9284, 516, 23847, 6193, 842, 57193] },
    },
    answer: (v) => String(v.n).length,
    format: { kind: 'integer' },
    optionCount: 4,
    distractors: ({ answer }) => [3, 4, 5, 6].filter((x) => x !== Number(answer)),
    explanation: ({ vars, answer }) => `რიცხვში ${vars.n} არის ${answer} ციფრი.`,
  }),

  // Q62 (Level 1): რამდენი ციფრია რიცხვში N (5-6 ნიშნა)
  defineTemplate({
    ...addr({ id: 'g4-u01-62', subtopicId: 'u01-digit-counting', difficulty: 1 }),
    prompt: 'რამდენი ციფრია რიცხვში {n}?',
    variables: {
      n: { kind: 'choice', values: [735019, 48215, 619284, 35741, 892143, 24680, 517932, 68421, 935174, 15926, 428613, 73195] },
    },
    answer: (v) => String(v.n).length,
    format: { kind: 'integer' },
    optionCount: 4,
    distractors: ({ answer }) => [4, 5, 6, 7].filter((x) => x !== Number(answer)),
    explanation: ({ vars, answer }) => `რიცხვში ${vars.n} არის ${answer} ციფრი.`,
  }),

  // Q63 (Level 2): რამდენჯერ გვხვდება ციფრი D რიცხვში N
  defineTemplate({
    ...addr({ id: 'g4-u01-63', subtopicId: 'u01-digit-counting', difficulty: 2 }),
    prompt: 'რამდენჯერ გვხვდება ციფრი {d} რიცხვში {n}?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '4|444248|4',
          '2|444248|1',
          '8|444248|1',
          '3|331353|4',
          '5|525551|4',
          '7|772717|4',
          '6|166266|4',
          '9|919929|4',
          '1|121314|3',
          '8|882848|4',
          '3|532383|3',
          '5|545152|3',
        ],
      },
      d: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      n: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      count: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => Number(v.count),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 0),
    explanation: ({ vars, answer }) => `ციფრი ${vars.d} რიცხვში ${vars.n} გვხვდება ${answer}-ჯერ.`,
  }),

  // Q64 (Level 2): რამდენჯერ გვხვდება ციფრი 0 რიცხვში N
  defineTemplate({
    ...addr({ id: 'g4-u01-64', subtopicId: 'u01-digit-counting', difficulty: 2 }),
    prompt: 'რამდენჯერ გვხვდება ციფრი 0 რიცხვში {n}?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '602040|3',
          '500200|4',
          '401050|3',
          '302010|3',
          '100020|4',
          '705001|3',
          '800402|3',
          '902004|3',
          '204060|3',
          '105020|3',
          '300502|3',
          '400010|4',
          '602001|3',
        ],
      },
      n: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      count: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => Number(v.count),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 0),
    explanation: ({ vars, answer }) => `ციფრი 0 რიცხვში ${vars.n} გვხვდება ${answer}-ჯერ.`,
  }),

  // Q65 (Level 3): რამდენი სხვადასხვა ციფრია რიცხვში N
  defineTemplate({
    ...addr({ id: 'g4-u01-65', subtopicId: 'u01-digit-counting', difficulty: 3 }),
    prompt: 'რამდენი სხვადასხვა ციფრია რიცხვში {n}?',
    variables: {
      n: { kind: 'choice', values: [121313, 232425, 343434, 454564, 565758, 676767, 787978, 898989, 123123, 234234, 345345, 456456, 567567] },
    },
    answer: (v) => new Set(String(v.n).split('')).size,
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => {
      const distinct = Array.from(new Set(String(vars.n).split(''))).join(', ');
      return `რიცხვში ${vars.n} სხვადასხვა ციფრებია (${distinct}), სულ ${answer} სხვადასხვა ციფრი.`;
    },
  }),

  // Q66 (Level 3): რიცხვში N რამდენჯერ გვხვდება ციფრი D
  defineTemplate({
    ...addr({ id: 'g4-u01-66', subtopicId: 'u01-digit-counting', difficulty: 3 }),
    prompt: 'რიცხვში {n} რამდენჯერ გვხვდება ციფრი {d}?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '583858|8|3',
          '583858|5|2',
          '583858|3|1',
          '742747|7|3',
          '742747|4|2',
          '916919|9|3',
          '916919|1|2',
          '384383|3|3',
          '384383|8|2',
          '625626|6|3',
          '625626|2|2',
          '491494|4|3',
        ],
      },
      n: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      d: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      count: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => Number(v.count),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 0),
    explanation: ({ vars, answer }) => `ციფრი ${vars.d} რიცხვში ${vars.n} გვხვდება ${answer}-ჯერ.`,
  }),

  // ==================================================================
  // U01.12 — მოქმედებები რიცხვებზე (u01-operations)
  // ==================================================================

  // Q67 (Level 1): 4-ნიშნა შეკრება
  defineTemplate({
    ...addr({ id: 'g4-u01-67', subtopicId: 'u01-operations', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b}.',
    variables: {
      a: { kind: 'choice', values: [3450, 2180, 4230, 5140, 1620, 2750, 3810, 4920, 1540, 2630, 3720, 4810] },
      b: { kind: 'choice', values: [2780, 1650, 3490, 2580, 4170, 3260, 2450, 1870, 3190, 2380, 1490, 2560] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 0),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q68 (Level 1): გამოკლება მრგვალი ათასეულიდან
  defineTemplate({
    ...addr({ id: 'g4-u01-68', subtopicId: 'u01-operations', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} − {b}.',
    variables: {
      a: { kind: 'choice', values: [9000, 8000, 7000, 6000, 5000, 10000] },
      b: { kind: 'choice', values: [4675, 3240, 2580, 1495, 3820, 4150, 2735, 1860, 3425, 2910, 1675, 3540] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 0),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q69 (Level 2): 3-ნიშნა გამრავლება 1-ნიშნაზე
  defineTemplate({
    ...addr({ id: 'g4-u01-69', subtopicId: 'u01-operations', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} × {b}.',
    variables: {
      a: { kind: 'choice', values: [236, 148, 312, 425, 164, 253, 341, 175, 284, 392, 156, 267] },
      b: { kind: 'choice', values: [3, 4, 5, 6, 7] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 0),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q70 (Level 2): 3-ნიშნა გაყოფა 1-ნიშნაზე
  defineTemplate({
    ...addr({ id: 'g4-u01-70', subtopicId: 'u01-operations', difficulty: 2 }),
    prompt: 'გამოთვალე: {dividend} ÷ {divisor}.',
    variables: {
      divisor: { kind: 'choice', values: [6, 7, 8, 9] },
      quotient: { kind: 'choice', values: [108, 112, 115, 124, 135, 142, 156, 164, 172, 185, 192, 148] },
      dividend: { kind: 'choice', values: (v) => [Number(v.divisor) * Number(v.quotient)] },
    },
    answer: (v) => Number(v.quotient),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.dividend} ÷ ${vars.divisor} = ${answer}.`,
  }),

  // Q71 (Level 3): შერეული მოქმედება: A × B + C
  defineTemplate({
    ...addr({ id: 'g4-u01-71', subtopicId: 'u01-operations', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × {b} + {c}.',
    variables: {
      a: { kind: 'choice', values: [125, 150, 175, 225, 250, 110, 130, 140, 160, 210, 240, 180] },
      b: { kind: 'choice', values: [4, 5, 6, 7, 8] },
      c: { kind: 'choice', values: [340, 250, 180, 420, 560, 150, 270, 310, 450, 290, 380, 410] },
    },
    answer: (v) => Number(v.a) * Number(v.b) + Number(v.c),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 0),
    explanation: ({ vars, answer }) => `ჯერ ვასრულებთ გამრავლებას: ${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}, შემდეგ შეკრებას: + ${vars.c} = ${answer}.`,
  }),

  // Q72 (Level 3): შერეული მოქმედება: A − B ÷ C
  defineTemplate({
    ...addr({ id: 'g4-u01-72', subtopicId: 'u01-operations', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} − {b} ÷ {c}.',
    variables: {
      a: { kind: 'choice', values: [7200, 5400, 6300, 8100, 4500, 9000, 3600, 4200, 4800, 5600, 6400, 7500] },
      c: { kind: 'choice', values: [4, 5, 6, 7, 8, 9] },
      q: { kind: 'choice', values: [40, 50, 60, 70, 80, 90, 30, 45, 55, 65, 75, 85] },
      b: { kind: 'choice', values: (v) => [Number(v.c) * Number(v.q)] },
    },
    answer: (v) => Number(v.a) - Number(v.q),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 0),
    explanation: ({ vars, answer }) => `ჯერ ვასრულებთ გაყოფას: ${vars.b} ÷ ${vars.c} = ${vars.q}, შემდეგ გამოკლებას: ${vars.a} − ${vars.q} = ${answer}.`,
  }),

  // ==================================================================
  // U01.13 — მოქმედებები უმცირეს და უდიდეს მნიშვნელობებზე (u01-extreme-values)
  // ==================================================================

  // Q73 (Level 1): ციფრებით D1, D2, D3 შეადგინე უდიდესი 3-ნიშნა რიცხვი
  defineTemplate({
    ...addr({ id: 'g4-u01-73', subtopicId: 'u01-extreme-values', difficulty: 1 }),
    prompt: 'ციფრებით {d1}, {d2} და {d3}, თითოეულის ერთხელ გამოყენებით, შეადგინე უდიდესი სამნიშნა რიცხვი.',
    variables: {
      triple: {
        kind: 'choice',
        values: [
          '2|5|8|852',
          '1|4|7|741',
          '3|6|9|963',
          '2|4|6|642',
          '1|5|9|951',
          '3|5|7|753',
          '2|6|8|862',
          '4|5|8|854',
          '1|3|8|831',
          '2|7|9|972',
          '3|4|8|843',
          '1|6|7|761',
        ],
      },
      d1: { kind: 'choice', values: (v) => [String(v.triple).split('|')[0]] },
      d2: { kind: 'choice', values: (v) => [String(v.triple).split('|')[1]] },
      d3: { kind: 'choice', values: (v) => [String(v.triple).split('|')[2]] },
      ans: { kind: 'choice', values: (v) => [String(v.triple).split('|')[3]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => {
      const d1 = vars.d1;
      const d2 = vars.d2;
      const d3 = vars.d3;
      const wrong = [
        Number(`${d1}${d2}${d3}`),
        Number(`${d2}${d1}${d3}`),
        Number(`${d3}${d1}${d2}`),
      ].filter((x) => x !== Number(answer));
      return Array.from(new Set(wrong)).slice(0, 3);
    },
    explanation: ({ answer }) => `უდიდესი რიცხვის მისაღებად ციფრები უნდა დავალაგოთ კლებადობით: ${answer}.`,
  }),

  // Q74 (Level 1): ციფრებით D1, D2, D3 შეადგინე უმცირესი 3-ნიშნა რიცხვი
  defineTemplate({
    ...addr({ id: 'g4-u01-74', subtopicId: 'u01-extreme-values', difficulty: 1 }),
    prompt: 'ციფრებით {d1}, {d2} და {d3}, თითოეულის ერთხელ გამოყენებით, შეადგინე უმცირესი სამნიშნა რიცხვი.',
    variables: {
      triple: {
        kind: 'choice',
        values: [
          '1|4|7|147',
          '2|5|8|258',
          '3|6|9|369',
          '2|4|6|246',
          '1|5|9|159',
          '3|5|7|357',
          '2|6|8|268',
          '4|5|8|458',
          '1|3|8|138',
          '2|7|9|279',
          '3|4|8|348',
          '1|6|7|167',
        ],
      },
      d1: { kind: 'choice', values: (v) => [String(v.triple).split('|')[0]] },
      d2: { kind: 'choice', values: (v) => [String(v.triple).split('|')[1]] },
      d3: { kind: 'choice', values: (v) => [String(v.triple).split('|')[2]] },
      ans: { kind: 'choice', values: (v) => [String(v.triple).split('|')[3]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => {
      const d1 = vars.d1;
      const d2 = vars.d2;
      const d3 = vars.d3;
      const wrong = [
        Number(`${d3}${d2}${d1}`),
        Number(`${d2}${d1}${d3}`),
        Number(`${d1}${d3}${d2}`),
      ].filter((x) => x !== Number(answer));
      return Array.from(new Set(wrong)).slice(0, 3);
    },
    explanation: ({ answer }) => `უმცირესი რიცხვის მისაღებად ციფრები უნდა დავალაგოთ ზრდადობით: ${answer}.`,
  }),

  // Q75 (Level 2): სხვაობა უდიდეს K1-ნიშნა და უმცირეს K2-ნიშნა რიცხვებს შორის
  defineTemplate({
    ...addr({ id: 'g4-u01-75', subtopicId: 'u01-extreme-values', difficulty: 2 }),
    prompt: 'იპოვე სხვაობა უდიდეს {l1}-ნიშნა და უმცირეს {l2}-ნიშნა რიცხვებს შორის.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'სამ|სამ|999|100|899',
          'სამ|ორ|999|10|989',
          'სამ|ერთ|999|1|998',
          'ოთხ|ოთხ|9999|1000|8999',
          'ოთხ|სამ|9999|100|9899',
          'ოთხ|ორ|9999|10|9989',
          'ოთხ|ერთ|9999|1|9998',
          'ხუთ|ხუთ|99999|10000|89999',
          'ხუთ|ოთხ|99999|1000|98999',
          'ხუთ|სამ|99999|100|99899',
          'ორ|ორ|99|10|89',
          'ორ|ერთ|99|1|98',
        ],
      },
      l1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      l2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      maxN: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      minN: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      diff: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => {
      const d = Number(vars.diff);
      return [d - 1, d + 1, d - 10].filter((x) => x !== Number(answer));
    },
    explanation: ({ vars, answer }) => `${vars.maxN} − ${vars.minN} = ${answer}.`,
  }),

  // Q76 (Level 2): უდიდესი L1-ნიშნა და უმცირესი L2-ნიშნა რიცხვების ჯამი
  defineTemplate({
    ...addr({ id: 'g4-u01-76', subtopicId: 'u01-extreme-values', difficulty: 2 }),
    prompt: 'იპოვე უდიდესი {l1}-ნიშნა და უმცირესი {l2}-ნიშნა რიცხვების ჯამი.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'ოთხ|ოთხ|9999|1000|10999',
          'ოთხ|სამ|9999|100|10099',
          'ოთხ|ორ|9999|10|10009',
          'სამ|სამ|999|100|1099',
          'სამ|ორ|999|10|1009',
          'სამ|ერთ|999|1|1000',
          'ხუთ|ხუთ|99999|10000|109999',
          'ხუთ|ოთხ|99999|1000|100999',
          'ხუთ|სამ|99999|100|100099',
          'ორ|ორ|99|10|109',
          'ორ|ერთ|99|1|100',
          'ოთხ|ერთ|9999|1|10000',
        ],
      },
      l1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      l2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      maxN: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      minN: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      sum: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => Number(v.sum),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 0),
    explanation: ({ vars, answer }) => `${vars.maxN} + ${vars.minN} = ${answer}.`,
  }),

  // Q77 (Level 3): ციფრებით 0, D1, D2, D3 შეადგინე უდიდესი 4-ნიშნა რიცხვი
  defineTemplate({
    ...addr({ id: 'g4-u01-77', subtopicId: 'u01-extreme-values', difficulty: 3 }),
    prompt: 'ციფრებით 0, {d1}, {d2} და {d3}, თითოეულის ერთხელ გამოყენებით, შეადგინე უდიდესი ოთხნიშნა რიცხვი.',
    variables: {
      quad: {
        kind: 'choice',
        values: [
          '3|6|9|9630',
          '2|5|8|8520',
          '1|4|7|7410',
          '2|4|6|6420',
          '1|5|9|9510',
          '3|5|7|7530',
          '4|6|8|8640',
          '1|3|8|8310',
          '2|7|9|9720',
          '3|4|8|8430',
          '1|6|7|7610',
          '4|5|9|9540',
        ],
      },
      d1: { kind: 'choice', values: (v) => [String(v.quad).split('|')[0]] },
      d2: { kind: 'choice', values: (v) => [String(v.quad).split('|')[1]] },
      d3: { kind: 'choice', values: (v) => [String(v.quad).split('|')[2]] },
      ans: { kind: 'choice', values: (v) => [String(v.quad).split('|')[3]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => {
      const d1 = vars.d1;
      const d2 = vars.d2;
      const d3 = vars.d3;
      const wrong = [
        Number(`${d3}${d1}${d2}0`),
        Number(`${d2}${d3}${d1}0`),
        Number(`${d3}${d2}0${d1}`),
      ].filter((x) => x !== Number(answer));
      return Array.from(new Set(wrong)).slice(0, 3);
    },
    explanation: ({ answer }) => `უდიდესი ოთხნიშნა რიცხვის მისაღებად ციფრები უნდა დავალაგოთ კლებადობით: ${answer}.`,
  }),

  // Q78 (Level 3): ციფრებით 0, D1, D2, D3 შეადგინე უმცირესი 4-ნიშნა რიცხვი
  defineTemplate({
    ...addr({ id: 'g4-u01-78', subtopicId: 'u01-extreme-values', difficulty: 3 }),
    prompt: 'ციფრებით 0, {d1}, {d2} და {d3}, თითოეულის ერთხელ გამოყენებით, შეადგინე უმცირესი ოთხნიშნა რიცხვი.',
    variables: {
      quad: {
        kind: 'choice',
        values: [
          '2|5|8|2058',
          '1|4|7|1047',
          '3|6|9|3069',
          '2|4|6|2046',
          '1|5|9|1059',
          '3|5|7|3057',
          '4|6|8|4068',
          '1|3|8|1038',
          '2|7|9|2079',
          '3|4|8|3048',
          '1|6|7|1067',
          '4|5|9|4059',
        ],
      },
      d1: { kind: 'choice', values: (v) => [String(v.quad).split('|')[0]] },
      d2: { kind: 'choice', values: (v) => [String(v.quad).split('|')[1]] },
      d3: { kind: 'choice', values: (v) => [String(v.quad).split('|')[2]] },
      ans: { kind: 'choice', values: (v) => [String(v.quad).split('|')[3]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => {
      const d1 = vars.d1;
      const d2 = vars.d2;
      const d3 = vars.d3;
      const wrong = [
        Number(`${d1}${d2}0${d3}`),
        Number(`${d1}${d2}${d3}0`),
        Number(`${d2}0${d1}${d3}`),
      ].filter((x) => x !== Number(answer));
      return Array.from(new Set(wrong)).slice(0, 3);
    },
    explanation: ({ answer }) => `რადგან რიცხვი 0-ით ვერ დაიწყება, პირველ ადგილზე ვსვამთ უმცირეს არანულოვან ციფრს, შემდეგ 0-ს, და დანარჩენებს ზრდადობით: ${answer}.`,
  }),

  // ==================================================================
  // U01.14 — განსხვავებული რაოდენობების პოვნა (u01-difference-word-problems)
  // ==================================================================

  // Q79 (Level 1): რამდენით მეტია ვაშლი მსხალზე
  defineTemplate({
    ...addr({ id: 'g4-u01-79', subtopicId: 'u01-difference-word-problems', difficulty: 1 }),
    prompt: 'კალათაში {a} ვაშლი და {b} მსხალია. რამდენით მეტია ვაშლი მსხალზე?',
    variables: {
      b: { kind: 'choice', values: [12, 14, 15, 17, 18, 19, 21, 23, 25, 26, 27, 28] },
      diff: { kind: 'choice', values: [5, 6, 7, 8, 9, 10, 11, 12] },
      a: { kind: 'choice', values: (v) => [Number(v.b) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}-ით მეტია ვაშლი მსხალზე.`,
  }),

  // Q80 (Level 1): რამდენით ნაკლები ფანქარია
  defineTemplate({
    ...addr({ id: 'g4-u01-80', subtopicId: 'u01-difference-word-problems', difficulty: 1 }),
    prompt: 'ერთ ყუთში {a} ფანქარია, მეორეში — {b}. რამდენით ნაკლები ფანქარია მეორე ყუთში?',
    variables: {
      b: { kind: 'choice', values: [20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42] },
      diff: { kind: 'choice', values: [6, 7, 8, 9, 10, 11, 12, 14] },
      a: { kind: 'choice', values: (v) => [Number(v.b) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}-ით ნაკლები ფანქარია მეორე ყუთში.`,
  }),

  // Q81 (Level 2): რამდენით განსხვავდება მათი რაოდენობა
  defineTemplate({
    ...addr({ id: 'g4-u01-81', subtopicId: 'u01-difference-word-problems', difficulty: 2 }),
    prompt: 'ბიბლიოთეკაში {a} ქართული წიგნი და {b} ინგლისური წიგნია. რამდენით განსხვავდება მათი რაოდენობა?',
    variables: {
      b: { kind: 'choice', values: [85, 90, 95, 98, 105, 110, 115, 120, 125, 130, 135, 140] },
      diff: { kind: 'choice', values: [21, 23, 25, 27, 29, 31, 33, 35, 37] },
      a: { kind: 'choice', values: (v) => [Number(v.b) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}-ით განსხვავდება მათი რაოდენობა.`,
  }),

  // Q82 (Level 2): რამდენით მეტი ნივთი გაიყიდა მეორე დღეს
  defineTemplate({
    ...addr({ id: 'g4-u01-82', subtopicId: 'u01-difference-word-problems', difficulty: 2 }),
    prompt: 'პირველ დღეს მაღაზიამ {a} ნივთი გაყიდა, მეორე დღეს — {b}. რამდენით მეტი ნივთი გაიყიდა მეორე დღეს?',
    variables: {
      a: { kind: 'choice', values: [210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320] },
      diff: { kind: 'choice', values: [65, 70, 75, 80, 85, 90, 95, 105] },
      b: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 1),
    explanation: ({ vars, answer }) => `${vars.b} − ${vars.a} = ${answer}-ით მეტი ნივთი გაიყიდა მეორე დღეს.`,
  }),

  // Q83 (Level 3): ორ საწყობში ერთად Total ყუთია, პირველში Part1-ია
  defineTemplate({
    ...addr({ id: 'g4-u01-83', subtopicId: 'u01-difference-word-problems', difficulty: 3 }),
    prompt: 'ორ საწყობში ერთად {total} ყუთია. პირველში {part1} ყუთია. რამდენი ყუთია მეორეში?',
    variables: {
      total: { kind: 'choice', values: [750, 800, 850, 900, 950, 1000, 1100, 1200, 1250, 1300, 1400, 1500] },
      part1: { kind: 'choice', values: [275, 325, 375, 425, 475, 525, 575, 625, 675, 725, 775, 825] },
    },
    answer: (v) => Number(v.total) - Number(v.part1),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 25, 1),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.part1} = ${answer} ყუთია მეორე საწყობში.`,
  }),

  // Q84 (Level 3): სხვაობაა Diff, დიდი რიცხვია Large. იპოვე პატარა რიცხვი
  defineTemplate({
    ...addr({ id: 'g4-u01-84', subtopicId: 'u01-difference-word-problems', difficulty: 3 }),
    prompt: 'ორ რიცხვს შორის სხვაობაა {diff}. დიდი რიცხვია {large}. იპოვე პატარა რიცხვი.',
    variables: {
      large: { kind: 'choice', values: [540, 580, 620, 660, 700, 740, 780, 820, 860, 900, 940, 980] },
      diff: { kind: 'choice', values: [125, 135, 145, 155, 165, 175, 185, 195] },
    },
    answer: (v) => Number(v.large) - Number(v.diff),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.large} − ${vars.diff} = ${answer}.`,
  }),

  // ==================================================================
  // U01.15 — საშუალო არითმეტიკული (u01-arithmetic-mean)
  // ==================================================================

  // Q85 (Level 1): 3 რიცხვის საშუალო არითმეტიკული
  defineTemplate({
    ...addr({ id: 'g4-u01-85', subtopicId: 'u01-arithmetic-mean', difficulty: 1 }),
    prompt: 'იპოვე რიცხვების {a}, {b} და {c} საშუალო არითმეტიკული.',
    variables: {
      m: { kind: 'choice', values: [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28] },
      d: { kind: 'choice', values: [2, 3, 4, 5] },
      a: { kind: 'choice', values: (v) => [Number(v.m) - Number(v.d)] },
      b: { kind: 'choice', values: (v) => [Number(v.m)] },
      c: { kind: 'choice', values: (v) => [Number(v.m) + Number(v.d)] },
    },
    answer: (v) => Number(v.m),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `(${vars.a} + ${vars.b} + ${vars.c}) ÷ 3 = ${answer}.`,
  }),

  // Q86 (Level 1): 4 რიცხვის საშუალო არითმეტიკული
  defineTemplate({
    ...addr({ id: 'g4-u01-86', subtopicId: 'u01-arithmetic-mean', difficulty: 1 }),
    prompt: 'იპოვე რიცხვების {a}, {b}, {c} და {d} საშუალო არითმეტიკული.',
    variables: {
      m: { kind: 'choice', values: [10, 12, 13, 14, 15, 16, 18, 20, 22, 24, 25, 30] },
      step: { kind: 'choice', values: [1, 2, 3] },
      a: { kind: 'choice', values: (v) => [Number(v.m) - 3 * Number(v.step)] },
      b: { kind: 'choice', values: (v) => [Number(v.m) - Number(v.step)] },
      c: { kind: 'choice', values: (v) => [Number(v.m) + Number(v.step)] },
      d: { kind: 'choice', values: (v) => [Number(v.m) + 3 * Number(v.step)] },
    },
    answer: (v) => Number(v.m),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `(${vars.a} + ${vars.b} + ${vars.c} + ${vars.d}) ÷ 4 = ${answer}.`,
  }),

  // Q87 (Level 2): მოსწავლის ოთხი ტესტის საშუალო ქულა
  defineTemplate({
    ...addr({ id: 'g4-u01-87', subtopicId: 'u01-arithmetic-mean', difficulty: 2 }),
    prompt: 'მოსწავლემ ოთხ ტესტში მიიღო ქულები: {s1}, {s2}, {s3} და {s4}. რა არის მისი საშუალო ქულა?',
    variables: {
      quad: {
        kind: 'choice',
        values: [
          '8|10|9|9|9',
          '7|9|8|8|8',
          '6|8|10|8|8',
          '9|10|9|8|9',
          '8|8|10|10|9',
          '7|9|7|9|8',
          '10|10|8|8|9',
          '6|7|9|10|8',
          '8|9|9|10|9',
          '7|8|9|8|8',
          '6|8|7|7|7',
          '9|9|10|8|9',
        ],
      },
      s1: { kind: 'choice', values: (v) => [String(v.quad).split('|')[0]] },
      s2: { kind: 'choice', values: (v) => [String(v.quad).split('|')[1]] },
      s3: { kind: 'choice', values: (v) => [String(v.quad).split('|')[2]] },
      s4: { kind: 'choice', values: (v) => [String(v.quad).split('|')[3]] },
      mean: { kind: 'choice', values: (v) => [String(v.quad).split('|')[4]] },
    },
    answer: (v) => Number(v.mean),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `(${vars.s1} + ${vars.s2} + ${vars.s3} + ${vars.s4}) ÷ 4 = ${answer}.`,
  }),

  // Q88 (Level 2): სამი დღის საშუალო ტემპერატურა
  defineTemplate({
    ...addr({ id: 'g4-u01-88', subtopicId: 'u01-arithmetic-mean', difficulty: 2 }),
    prompt: 'სამი დღის განმავლობაში ტემპერატურა იყო {t1}°C, {t2}°C და {t3}°C. იპოვე საშუალო ტემპერატურა.',
    variables: {
      mean: { kind: 'choice', values: [18, 19, 20, 21, 22, 23, 24, 25, 15, 16, 17, 26] },
      d: { kind: 'choice', values: [1, 2, 3] },
      t1: { kind: 'choice', values: (v) => [Number(v.mean) - Number(v.d)] },
      t2: { kind: 'choice', values: (v) => [Number(v.mean)] },
      t3: { kind: 'choice', values: (v) => [Number(v.mean) + Number(v.d)] },
    },
    answer: (v) => Number(v.mean),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 0),
    explanation: ({ vars, answer }) => `(${vars.t1} + ${vars.t2} + ${vars.t3}) ÷ 3 = ${answer}°C.`,
  }),

  // Q89 (Level 3): K რიცხვის ჯამია Sum. რა არის მათი საშუალო არითმეტიკული
  defineTemplate({
    ...addr({ id: 'g4-u01-89', subtopicId: 'u01-arithmetic-mean', difficulty: 3 }),
    prompt: '{k} რიცხვის ჯამია {sum}. რა არის მათი საშუალო არითმეტიკული?',
    variables: {
      k: { kind: 'choice', values: [4, 5, 6] },
      mean: { kind: 'choice', values: [15, 18, 20, 24, 25, 30, 32, 40, 45, 50, 60, 75] },
      sum: { kind: 'choice', values: (v) => [Number(v.k) * Number(v.mean)] },
    },
    answer: (v) => Number(v.mean),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.sum} ÷ ${vars.k} = ${answer}.`,
  }),

  // Q90 (Level 3): K რიცხვის საშუალო არითმეტიკულია Mean. მათი ჯამი რამდენია
  defineTemplate({
    ...addr({ id: 'g4-u01-90', subtopicId: 'u01-arithmetic-mean', difficulty: 3 }),
    prompt: '{k} რიცხვის საშუალო არითმეტიკულია {mean}. მათი ჯამი რამდენია?',
    variables: {
      k: { kind: 'choice', values: [4, 5, 6] },
      mean: { kind: 'choice', values: [12, 14, 15, 16, 18, 20, 22, 25, 28, 30, 35, 40] },
    },
    answer: (v) => Number(v.k) * Number(v.mean),
    format: { kind: 'integer' },
    distractors: ({ vars, answer }) => nearMisses(Number(answer), 3, Number(vars.k), 1),
    explanation: ({ vars, answer }) => `${vars.k} × ${vars.mean} = ${answer}.`,
  }),
];
