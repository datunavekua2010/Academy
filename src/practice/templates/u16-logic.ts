/**
 * U16 — ლოგიკური აზროვნება (Logical Reasoning).
 *
 * Thirty-one templates across the curriculum's four subtopics, directly implementing
 * all forty specification questions with full Level 1, 2, and 3 coverage:
 *
 *   U16.1 `ferebi-wesis-mixedviT` (Choosing Colors by Rule, Q1–Q10)   8 templates
 *   U16.2 `gamoricxva`           (Elimination, Q1–Q10)               7 templates
 *   U16.3 `sascori`              (Balance Scales, Q1–Q10)            7 templates
 *   U16.4 `Cafiqrebuli-ricxvi`   (The Thought-of Number, Q1–Q10)     9 templates
 *
 * Single source of truth:
 *  - Colors and sequences come from `logic.ts`;
 *  - Semantic categories and parity groups come from `ELIMINATION_SETS`;
 *  - Balance scale tilts and weight differences come from `createBalanceScale`;
 *  - Inverse arithmetic is computed directly from variable values.
 */

import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';
import {
  COLOR_KEYS,
  ELIMINATION_SETS,
  colorByKey,
  colorSequenceVisual,
  colorSequenceWords,
  createBalanceScale,
  drawBalanceScale,
} from './logic';

const grade = 1 as const;
const topicId = 'logikuri-azrovneba';
const unitId = 'logikuri-azrovneba';

export const U16_SUBTOPICS = [
  'ferebi-wesis-mixedviT',
  'gamoricxva',
  'sascori',
  'Cafiqrebuli-ricxvi',
] as const;

/** The curriculum address every template in this unit shares. */
const address = (spec: { id: string; subtopicId: (typeof U16_SUBTOPICS)[number]; difficulty: 1 | 2 | 3 }) => ({
  id: spec.id,
  grade,
  topicId,
  unitId,
  subtopicId: spec.subtopicId,
  difficulty: spec.difficulty,
});

const numericDistractors = (answer: number): string[] => {
  const candidates = [answer - 1, answer + 1, answer + 2, answer - 2, answer + 3]
    .filter((n) => n >= 0 && n !== answer);
  return candidates.slice(0, 3).map(String);
};

/* ================================================================== *\
 * U16.1: ფერების არჩევა წესით (ferebi-wesis-mixedviT)
 * ================================================================== */

const U16_1_TEMPLATES: QuestionTemplate[] = [
  /**
   * L1 — AB color pattern: e.g. red, blue, red, blue, ___ -> red (Spec Q1, Q4).
   */
  defineTemplate({
    ...address({ id: 'g1-u16-1-ab-color-sequence', subtopicId: 'ferebi-wesis-mixedviT', difficulty: 1 }),
    prompt: 'მიმდევრობაა: {seqWords}. რომელი ფერი უნდა იყოს შემდეგი?',
    variables: {
      c1Key: { kind: 'choice', values: COLOR_KEYS },
      c2Key: { kind: 'choice', values: COLOR_KEYS },
      seqWords: {
        kind: 'choice',
        values: (v: Vars) => {
          const c1 = colorByKey(String(v.c1Key));
          const c2 = colorByKey(String(v.c2Key));
          return [colorSequenceWords([c1, c2, c1, c2, c1], 4)];
        },
      },
    },
    constraints: [
      { test: (v: Vars) => v.c1Key !== v.c2Key, note: 'distinct colors' },
    ],
    answer: (v: Vars) => colorByKey(String(v.c1Key)).name,
    options: (v: Vars) => {
      const c1 = colorByKey(String(v.c1Key)).name;
      const c2 = colorByKey(String(v.c2Key)).name;
      const others = ['ყვითელი', 'მწვანე', 'ნარინჯისფერი', 'იისფერი'].filter((c) => c !== c1 && c !== c2);
      return [c1, c2, others[0]!, others[1]!];
    },
    explanation: ({ vars, answer }) => {
      const parts = String(vars.seqWords).split(',');
      return `მიმდევრობის წესია წყვილების განმეორება (${parts[0]} და ${parts[1]}). შემდეგი ფერია ${answer}.`;
    },
    visual: (v: Vars) => {
      const c1 = colorByKey(String(v.c1Key));
      const c2 = colorByKey(String(v.c2Key));
      return colorSequenceVisual([c1, c2, c1, c2, c1], 4);
    },
  }),

  /**
   * L1 — AAB color pattern: e.g. yellow, yellow, green, yellow, yellow, ___ -> green (Spec Q2, Q3, Q9).
   */
  defineTemplate({
    ...address({ id: 'g1-u16-1-aab-color-sequence', subtopicId: 'ferebi-wesis-mixedviT', difficulty: 1 }),
    prompt: 'მიმდევრობაა: {seqWords}. რომელი ფერი უნდა იყოს შემდეგი?',
    variables: {
      c1Key: { kind: 'choice', values: COLOR_KEYS },
      c2Key: { kind: 'choice', values: COLOR_KEYS },
      seqWords: {
        kind: 'choice',
        values: (v: Vars) => {
          const c1 = colorByKey(String(v.c1Key));
          const c2 = colorByKey(String(v.c2Key));
          return [colorSequenceWords([c1, c1, c2, c1, c1, c2], 5)];
        },
      },
    },
    constraints: [
      { test: (v: Vars) => v.c1Key !== v.c2Key, note: 'distinct colors' },
    ],
    answer: (v: Vars) => colorByKey(String(v.c2Key)).name,
    options: (v: Vars) => {
      const c1 = colorByKey(String(v.c1Key)).name;
      const c2 = colorByKey(String(v.c2Key)).name;
      const others = ['წითელი', 'ლურჯი', 'მწვანე', 'ყვითელი'].filter((c) => c !== c1 && c !== c2);
      return [c2, c1, others[0]!, others[1]!];
    },
    explanation: ({ answer }) =>
      `წესია ორი ერთნაირი ფერის შემდეგ ერთი განსხვავებული ფერი. შემდეგი ფერია ${answer}.`,
    visual: (v: Vars) => {
      const c1 = colorByKey(String(v.c1Key));
      const c2 = colorByKey(String(v.c2Key));
      return colorSequenceVisual([c1, c1, c2, c1, c1, c2], 5);
    },
  }),

  /**
   * L1 — ABB color pattern: e.g. red, blue, blue, red, blue, blue, ___ -> red (Spec Q6, Q7, Q10).
   */
  defineTemplate({
    ...address({ id: 'g1-u16-1-abb-color-sequence', subtopicId: 'ferebi-wesis-mixedviT', difficulty: 1 }),
    prompt: 'მიმდევრობაა: {seqWords}. რომელი ფერი უნდა იყოს შემდეგი?',
    variables: {
      c1Key: { kind: 'choice', values: COLOR_KEYS },
      c2Key: { kind: 'choice', values: COLOR_KEYS },
      seqWords: {
        kind: 'choice',
        values: (v: Vars) => {
          const c1 = colorByKey(String(v.c1Key));
          const c2 = colorByKey(String(v.c2Key));
          return [colorSequenceWords([c1, c2, c2, c1, c2, c2, c1], 6)];
        },
      },
    },
    constraints: [
      { test: (v: Vars) => v.c1Key !== v.c2Key, note: 'distinct colors' },
    ],
    answer: (v: Vars) => colorByKey(String(v.c1Key)).name,
    options: (v: Vars) => {
      const c1 = colorByKey(String(v.c1Key)).name;
      const c2 = colorByKey(String(v.c2Key)).name;
      const others = ['წითელი', 'ლურჯი', 'მწვანე', 'ყვითელი'].filter((c) => c !== c1 && c !== c2);
      return [c1, c2, others[0]!, others[1]!];
    },
    explanation: ({ answer }) =>
      `წესია ერთი ფერის შემდეგ ორი მეორე ფერი. შემდეგი ფერია ${answer}.`,
    visual: (v: Vars) => {
      const c1 = colorByKey(String(v.c1Key));
      const c2 = colorByKey(String(v.c2Key));
      return colorSequenceVisual([c1, c2, c2, c1, c2, c2, c1], 6);
    },
  }),

  /**
   * L2 — ABC color pattern: e.g. blue, red, yellow, blue, red, ___ -> yellow (Spec Q5, Q8).
   */
  defineTemplate({
    ...address({ id: 'g1-u16-1-abc-color-sequence', subtopicId: 'ferebi-wesis-mixedviT', difficulty: 2 }),
    prompt: 'მიმდევრობაა: {seqWords}. რომელი ფერი უნდა იყოს შემდეგი?',
    variables: {
      c1Key: { kind: 'choice', values: ['blue', 'red', 'green'] },
      c2Key: { kind: 'choice', values: ['red', 'yellow', 'orange'] },
      c3Key: { kind: 'choice', values: ['yellow', 'blue', 'purple'] },
      seqWords: {
        kind: 'choice',
        values: (v: Vars) => {
          const c1 = colorByKey(String(v.c1Key));
          const c2 = colorByKey(String(v.c2Key));
          const c3 = colorByKey(String(v.c3Key));
          return [colorSequenceWords([c1, c2, c3, c1, c2, c3], 5)];
        },
      },
    },
    constraints: [
      { test: (v: Vars) => v.c1Key !== v.c2Key && v.c2Key !== v.c3Key && v.c1Key !== v.c3Key, note: 'three distinct colors' },
    ],
    answer: (v: Vars) => colorByKey(String(v.c3Key)).name,
    options: (v: Vars) => {
      const c1 = colorByKey(String(v.c1Key)).name;
      const c2 = colorByKey(String(v.c2Key)).name;
      const c3 = colorByKey(String(v.c3Key)).name;
      const other = ['მწვანე', 'ნარინჯისფერი', 'იისფერი'].find((c) => c !== c1 && c !== c2 && c !== c3) ?? 'თეთრი';
      return [c3, c1, c2, other];
    },
    explanation: ({ answer }) =>
      `მიმდევრობაში მეორდება სამი ფერის ჯგუფი. შემდეგი ფერია ${answer}.`,
    visual: (v: Vars) => {
      const c1 = colorByKey(String(v.c1Key));
      const c2 = colorByKey(String(v.c2Key));
      const c3 = colorByKey(String(v.c3Key));
      return colorSequenceVisual([c1, c2, c3, c1, c2, c3], 5);
    },
  }),

  /**
   * L2 — Missing color in the middle of a pattern.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-1-middle-blank-color', subtopicId: 'ferebi-wesis-mixedviT', difficulty: 2 }),
    prompt: 'დააკვირდი მიმდევრობას: {seqWords}. რა ფერია გამოტოვებული?',
    variables: {
      c1Key: { kind: 'choice', values: COLOR_KEYS },
      c2Key: { kind: 'choice', values: COLOR_KEYS },
      seqWords: {
        kind: 'choice',
        values: (v: Vars) => {
          const c1 = colorByKey(String(v.c1Key));
          const c2 = colorByKey(String(v.c2Key));
          return [colorSequenceWords([c1, c2, c1, c2, c1, c2], 1)];
        },
      },
    },
    constraints: [
      { test: (v: Vars) => v.c1Key !== v.c2Key, note: 'distinct colors' },
    ],
    answer: (v: Vars) => colorByKey(String(v.c2Key)).name,
    options: (v: Vars) => {
      const c1 = colorByKey(String(v.c1Key)).name;
      const c2 = colorByKey(String(v.c2Key)).name;
      const others = ['წითელი', 'ლურჯი', 'მწვანე', 'ყვითელი'].filter((c) => c !== c1 && c !== c2);
      return [c2, c1, others[0]!, others[1]!];
    },
    explanation: ({ answer }) =>
      `მიმდევრობა მონაცვლეობს, ამიტომ გამოტოვებული ფერია ${answer}.`,
    visual: (v: Vars) => {
      const c1 = colorByKey(String(v.c1Key));
      const c2 = colorByKey(String(v.c2Key));
      return colorSequenceVisual([c1, c2, c1, c2, c1, c2], 1);
    },
  }),

  /**
   * L2 — Rule stated in words: predict next color.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-1-rule-text-color', subtopicId: 'ferebi-wesis-mixedviT', difficulty: 2 }),
    prompt: 'წესი: {c1Name}-ის შემდეგ ყოველთვის მოდის {c2Name}. რა ფერი იქნება {c1Name}-ის შემდეგ?',
    variables: {
      c1Key: { kind: 'choice', values: COLOR_KEYS },
      c2Key: { kind: 'choice', values: COLOR_KEYS },
      c1Name: { kind: 'choice', values: (v: Vars) => [colorByKey(String(v.c1Key)).name] },
      c2Name: { kind: 'choice', values: (v: Vars) => [colorByKey(String(v.c2Key)).name] },
    },
    constraints: [
      { test: (v: Vars) => v.c1Key !== v.c2Key, note: 'distinct colors' },
    ],
    answer: (v: Vars) => String(v.c2Name),
    options: (v: Vars) => {
      const c1 = String(v.c1Name);
      const c2 = String(v.c2Name);
      const others = ['მწვანე', 'ყვითელი', 'ლურჯი', 'წითელი'].filter((c) => c !== c1 && c !== c2);
      return [c2, c1, others[0]!, others[1]!];
    },
    explanation: ({ vars, answer }) =>
      `წესის მიხედვით ${vars.c1Name}-ის შემდეგ მოდის ${answer}.`,
    visual: (v: Vars) => {
      const c1 = colorByKey(String(v.c1Key));
      const c2 = colorByKey(String(v.c2Key));
      return `${c1.emoji}  ➔  ${c2.emoji}`;
    },
  }),

  /**
   * L3 — Pattern core identification.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-1-pattern-core', subtopicId: 'ferebi-wesis-mixedviT', difficulty: 3 }),
    prompt: 'მიმდევრობაა: {seqWords}. რა არის ამ მიმდევრობის განმეორებადი ნაწილი?',
    variables: {
      c1Key: { kind: 'choice', values: ['red', 'blue', 'green'] },
      c2Key: { kind: 'choice', values: ['yellow', 'orange', 'purple'] },
      seqWords: {
        kind: 'choice',
        values: (v: Vars) => {
          const c1 = colorByKey(String(v.c1Key));
          const c2 = colorByKey(String(v.c2Key));
          return [`${c1.name}, ${c2.name}, ${c1.name}, ${c2.name}, ${c1.name}, ${c2.name}`];
        },
      },
    },
    constraints: [
      { test: (v: Vars) => v.c1Key !== v.c2Key, note: 'distinct colors' },
    ],
    answer: (v: Vars) => {
      const c1 = colorByKey(String(v.c1Key)).name;
      const c2 = colorByKey(String(v.c2Key)).name;
      return `${c1}, ${c2}`;
    },
    optionCount: 3,
    options: (v: Vars) => {
      const c1 = colorByKey(String(v.c1Key)).name;
      const c2 = colorByKey(String(v.c2Key)).name;
      return [
        `${c1}, ${c2}`,
        `${c2}, ${c1}`,
        `${c1}, ${c1}`,
      ];
    },
    explanation: ({ answer }) => `მიმდევრობაში სწორედ (${answer}) მეორდება უცვლელად.`,
    visual: (v: Vars) => {
      const c1 = colorByKey(String(v.c1Key));
      const c2 = colorByKey(String(v.c2Key));
      return `${c1.emoji} ${c2.emoji}  │  ${c1.emoji} ${c2.emoji}  │  ${c1.emoji} ${c2.emoji}`;
    },
  }),

  /**
   * L3 — Position reasoning: what color will be at position N?
   */
  defineTemplate({
    ...address({ id: 'g1-u16-1-position-color', subtopicId: 'ferebi-wesis-mixedviT', difficulty: 3 }),
    prompt: 'მიმდევრობა იწყება ასე: 1-ლი {c1Name}, მე-2 {c2Name}, მე-3 {c1Name}, მე-4 {c2Name}... რა ფერი იქნება მე-{pos}? ',
    variables: {
      c1Key: { kind: 'choice', values: ['red', 'yellow', 'green'] },
      c2Key: { kind: 'choice', values: ['blue', 'purple', 'orange'] },
      pos: { kind: 'choice', values: [6, 7, 8, 9] },
      c1Name: { kind: 'choice', values: (v: Vars) => [colorByKey(String(v.c1Key)).name] },
      c2Name: { kind: 'choice', values: (v: Vars) => [colorByKey(String(v.c2Key)).name] },
    },
    answer: (v: Vars) => (Number(v.pos) % 2 === 1 ? String(v.c1Name) : String(v.c2Name)),
    optionCount: 2,
    options: (v: Vars) => [String(v.c1Name), String(v.c2Name)],
    explanation: ({ vars, answer }) => {
      const isOdd = Number(vars.pos) % 2 === 1;
      return `კენტი ნომრები არის ${vars.c1Name}, ლუწი ნომრები — ${vars.c2Name}. მე-${vars.pos} ადგილი არის ${isOdd ? 'კენტი' : 'ლუწი'}, ამიტომ ფერია ${answer}.`;
    },
    visual: (v: Vars) => {
      const c1 = colorByKey(String(v.c1Key));
      const c2 = colorByKey(String(v.c2Key));
      return `1:${c1.emoji}  2:${c2.emoji}  3:${c1.emoji}  4:${c2.emoji} ... ${v.pos}:❓`;
    },
  }),
];

/* ================================================================== *\
 * U16.2: გამორიცხვა (gamoricxva)
 * ================================================================== */

const U16_2_TEMPLATES: QuestionTemplate[] = [
  /**
   * L1 — Semantic category elimination: odd one out (Spec Q1, Q2, Q4, Q5, Q7, Q8, Q10).
   */
  defineTemplate({
    ...address({ id: 'g1-u16-2-category-elimination', subtopicId: 'gamoricxva', difficulty: 1 }),
    prompt: 'რომელია ზედმეტი: {itemList}?',
    variables: {
      setIndex: { kind: 'choice', values: [0, 1, 2, 3, 4, 5, 6] },
      itemList: {
        kind: 'choice',
        values: (v: Vars) => {
          const group = ELIMINATION_SETS[Number(v.setIndex)]!;
          const items = [group.items[0]!.name, group.items[1]!.name, group.items[2]!.name, group.distractor.name];
          return [items.join(', ')];
        },
      },
    },
    answer: (v: Vars) => ELIMINATION_SETS[Number(v.setIndex)]!.distractor.name,
    options: (v: Vars) => {
      const group = ELIMINATION_SETS[Number(v.setIndex)]!;
      return [
        group.distractor.name,
        group.items[0]!.name,
        group.items[1]!.name,
        group.items[2]!.name,
      ];
    },
    explanation: ({ vars, answer }) => {
      const group = ELIMINATION_SETS[Number(vars.setIndex)]!;
      return `${answer} არის ${group.distractor.categoryName}, ხოლო დანარჩენი სამი არის ${group.categoryName}.`;
    },
    visual: (v: Vars) => {
      const group = ELIMINATION_SETS[Number(v.setIndex)]!;
      return `${group.items[0]!.emoji}   ${group.items[1]!.emoji}   ${group.items[2]!.emoji}   ${group.distractor.emoji}`;
    },
  }),

  /**
   * L1 — Parity elimination: 3 even and 1 odd number (Spec Q3).
   * E.g. 2, 4, 6, 7 -> 7.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-2-parity-even-odd', subtopicId: 'gamoricxva', difficulty: 1 }),
    prompt: 'რომელია ზედმეტი: {numList}?',
    variables: {
      oddNum: { kind: 'choice', values: [3, 5, 7, 9] },
      evenBase: { kind: 'choice', values: [2, 4, 6] },
      numList: {
        kind: 'choice',
        values: (v: Vars) => {
          const evens = [2, 4, 6, 8, 10].filter((n) => n !== Number(v.oddNum)).slice(0, 3);
          const list = [...evens, Number(v.oddNum)];
          return [list.join(', ')];
        },
      },
    },
    answer: (v: Vars) => Number(v.oddNum),
    options: (v: Vars) => {
      const evens = [2, 4, 6, 8, 10].filter((n) => n !== Number(v.oddNum)).slice(0, 3);
      return [String(v.oddNum), ...evens.map(String)];
    },
    explanation: ({ answer }) =>
      `${answer} არის კენტი რიცხვი, ხოლო დანარჩენი სამი რიცხვი ლუწია.`,
    visual: (v: Vars) => `🔢 ${v.numList}`,
  }),

  /**
   * L1 — Parity elimination: 3 odd and 1 even number (Spec Q6).
   * E.g. 1, 3, 5, 8 -> 8.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-2-parity-odd-even', subtopicId: 'gamoricxva', difficulty: 1 }),
    prompt: 'რომელია ზედმეტი: {numList}?',
    variables: {
      evenNum: { kind: 'choice', values: [4, 6, 8, 10] },
      numList: {
        kind: 'choice',
        values: (v: Vars) => {
          const odds = [1, 3, 5, 7, 9].slice(0, 3);
          const list = [...odds, Number(v.evenNum)];
          return [list.join(', ')];
        },
      },
    },
    answer: (v: Vars) => Number(v.evenNum),
    options: (v: Vars) => {
      const odds = [1, 3, 5, 7, 9].slice(0, 3);
      return [String(v.evenNum), ...odds.map(String)];
    },
    explanation: ({ answer }) =>
      `${answer} არის ლუწი რიცხვი, ხოლო დანარჩენი სამი რიცხვი კენტია.`,
    visual: (v: Vars) => `🔢 ${v.numList}`,
  }),

  /**
   * L2 — Multiples of 5 elimination (Spec Q9).
   * E.g. 5, 10, 15, 17 -> 17.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-2-multiples-of-five', subtopicId: 'gamoricxva', difficulty: 2 }),
    prompt: 'რომელია ზედმეტი: {numList}?',
    variables: {
      nonMultiple: { kind: 'choice', values: [7, 12, 14, 17, 19] },
      numList: {
        kind: 'choice',
        values: (v: Vars) => {
          const mults = [5, 10, 15];
          return [[...mults, Number(v.nonMultiple)].join(', ')];
        },
      },
    },
    answer: (v: Vars) => Number(v.nonMultiple),
    options: (v: Vars) => ['5', '10', '15', String(v.nonMultiple)],
    explanation: ({ answer }) =>
      `${answer} არ ბოლოვდება 0-ით ან 5-ით (არ არის 5-ის ჯერადი), განსხვავებით დანარჩენი სამისგან.`,
    visual: (v: Vars) => `🔢 ${v.numList}`,
  }),

  /**
   * L2 — Single-digit vs two-digit number.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-2-single-vs-two-digit', subtopicId: 'gamoricxva', difficulty: 2 }),
    prompt: 'რომელია ზედმეტი: {numList}?',
    variables: {
      twoDigit: { kind: 'choice', values: [12, 14, 15, 18, 20, 22, 25, 30] },
      numList: {
        kind: 'choice',
        values: (v: Vars) => {
          const singles = [3, 6, 8];
          return [[...singles, Number(v.twoDigit)].join(', ')];
        },
      },
    },
    answer: (v: Vars) => Number(v.twoDigit),
    options: (v: Vars) => ['3', '6', '8', String(v.twoDigit)],
    explanation: ({ answer }) =>
      `${answer} არის ორნიშნა რიცხვი, დანარჩენები კი ერთნიშნაა.`,
    visual: (v: Vars) => `🔢 ${v.numList}`,
  }),

  /**
   * L2 — Full tens elimination.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-2-full-tens', subtopicId: 'gamoricxva', difficulty: 2 }),
    prompt: 'რომელია ზედმეტი: {numList}?',
    variables: {
      caseIdx: { kind: 'int', min: 0, max: 5 },
      numList: {
        kind: 'choice',
        values: (v: Vars) => {
          const cases = [
            '10, 20, 30, 25',
            '10, 20, 40, 18',
            '20, 30, 34, 50',
            '10, 40, 50, 23',
            '30, 40, 50, 47',
            '20, 40, 60, 55',
          ];
          return [cases[Number(v.caseIdx)]!];
        },
      },
    },
    answer: (v: Vars) => {
      const answers = [25, 18, 34, 23, 47, 55];
      return answers[Number(v.caseIdx)]!;
    },
    options: (v: Vars) => {
      const opts: [number, number, number, number][] = [
        [10, 20, 30, 25],
        [10, 20, 40, 18],
        [20, 30, 34, 50],
        [10, 40, 50, 23],
        [30, 40, 50, 47],
        [20, 40, 60, 55],
      ];
      return opts[Number(v.caseIdx)]!.map(String);
    },
    explanation: ({ answer }) =>
      `${answer} არ არის სრული ათეული (არ ბოლოვდება 0-ით), დანარჩენები კი სრული ათეულებია.`,
    visual: (v: Vars) => `🔢 ${v.numList}`,
  }),

  /**
   * L3 — Geometric shapes vs round shape or 2D vs 3D shapes.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-2-polygons-vs-circle', subtopicId: 'gamoricxva', difficulty: 3 }),
    prompt: 'რომელია ზედმეტი ფიგურა: {promptList}?',
    variables: {
      setIdx: { kind: 'int', min: 0, max: 6 },
      promptList: {
        kind: 'choice',
        values: (v: Vars) => {
          const lists = [
            'სამკუთხედი, კვადრატი, მართკუთხედი, წრე',
            'კვადრატი, რომბი, სამკუთხედი, ოვალი',
            'ხუთკუთხედი, ექვსკუთხედი, კვადრატი, წრე',
            'კვადრატი, სამკუთხედი, წრე, კუბი',
            'მართკუთხედი, რომბი, სამკუთხედი, ბურთი',
            'კვადრატი, მართკუთხედი, რომბი, სამკუთხედი',
            'კვადრატი, მართკუთხედი, რომბი, ხუთკუთხედი',
          ];
          return [lists[Number(v.setIdx)]!];
        },
      },
    },
    answer: (v: Vars) => {
      const odds = ['წრე', 'ოვალი', 'წრე', 'კუბი', 'ბურთი', 'სამკუთხედი', 'ხუთკუთხედი'];
      return odds[Number(v.setIdx)]!;
    },
    options: (v: Vars) => {
      const all: [string, string, string, string][] = [
        ['წრე', 'სამკუთხედი', 'კვადრატი', 'მართკუთხედი'],
        ['ოვალი', 'კვადრატი', 'რომბი', 'სამკუთხედი'],
        ['წრე', 'ხუთკუთხედი', 'ექვსკუთხედი', 'კვადრატი'],
        ['კუბი', 'კვადრატი', 'სამკუთხედი', 'წრე'],
        ['ბურთი', 'მართკუთხედი', 'რომბი', 'სამკუთხედი'],
        ['სამკუთხედი', 'კვადრატი', 'მართკუთხედი', 'რომბი'],
        ['ხუთკუთხედი', 'კვადრატი', 'მართკუთხედი', 'რომბი'],
      ];
      return all[Number(v.setIdx)]!;
    },
    explanation: ({ vars }) => {
      const reasons = [
        'წრეს არ აქვს გვერდები და კუთხეები, დანარჩენებს კი აქვთ.',
        'ოვალს არ აქვს კუთხეები, დანარჩენებს კი აქვთ.',
        'წრე მრგვალი ფიგურაა, დანარჩენები კი მრავალკუთხედებია.',
        'კუბი სივრცითი (სამგანზომილებიანი) ფიგურაა, დანარჩენები კი ბრტყელია.',
        'ბურთი სივრცითი ფიგურაა, დანარჩენები კი ბრტყელი ფიგურებია.',
        'სამკუთხედს 3 კუთხე აქვს, დანარჩენებს კი 4.',
        'ხუთკუთხედს 5 კუთხე აქვს, დანარჩენებს კი 4.',
      ];
      return reasons[Number(vars.setIdx)]!;
    },
    visual: (v: Vars) => {
      const visuals = [
        '△   □   ▭   ○',
        '□   ◇   △   ⬭',
        '⬠   ⬡   □   ○',
        '□   △   ○   🧊',
        '▭   ◇   △   ⚽',
        '□   ▭   ◇   △',
        '□   ▭   ◇   ⬠',
      ];
      return visuals[Number(v.setIdx)]!;
    },
  }),

  /**
   * L3 — Why is it the odd one out? (Justification reasoning).
   */
  defineTemplate({
    ...address({ id: 'g1-u16-2-why-odd-one-out', subtopicId: 'gamoricxva', difficulty: 3 }),
    prompt: 'რატომ არის {target} ზედმეტი რიცხვებს შორის: {list}?',
    variables: {
      caseIdx: { kind: 'int', min: 0, max: 7 },
      target: {
        kind: 'choice',
        values: (v: Vars) => {
          const targets = [7, 3, 5, 9, 6, 8, 4, 10];
          return [targets[Number(v.caseIdx)]!];
        },
      },
      list: {
        kind: 'choice',
        values: (v: Vars) => {
          const lists = [
            '2, 4, 6, 7',
            '4, 8, 10, 3',
            '2, 6, 12, 5',
            '6, 8, 10, 9',
            '1, 3, 5, 6',
            '3, 5, 7, 8',
            '5, 7, 9, 4',
            '1, 5, 9, 10',
          ];
          return [lists[Number(v.caseIdx)]!];
        },
      },
    },
    answer: (v: Vars) => {
      const isOdd = Number(v.caseIdx) < 4;
      return isOdd
        ? `რადგან ${v.target} კენტია, დანარჩენები კი ლუწია`
        : `რადგან ${v.target} ლუწია, დანარჩენები კი კენტია`;
    },
    optionCount: 3,
    options: (v: Vars) => {
      const isOdd = Number(v.caseIdx) < 4;
      const correct = isOdd
        ? `რადგან ${v.target} კენტია, დანარჩენები კი ლუწია`
        : `რადგან ${v.target} ლუწია, დანარჩენები კი კენტია`;
      const wrong1 = isOdd
        ? `რადგან ${v.target} ლუწია, დანარჩენები კი კენტია`
        : `რადგან ${v.target} კენტია, დანარჩენები კი ლუწია`;
      const wrong2 = `რადგან ${v.target} ყველაზე პატარაა`;
      return [correct, wrong1, wrong2];
    },
    explanation: ({ answer }) => answer,
    visual: (v: Vars) => {
      const isOdd = Number(v.caseIdx) < 4;
      return isOdd
        ? `ლუწები  │  ${v.target} [კენტი]`
        : `კენტები  │  ${v.target} [ლუწი]`;
    },
  }),

  /**
   * L3 — Break the pattern / sequence rule.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-2-break-pattern-rule', subtopicId: 'gamoricxva', difficulty: 3 }),
    prompt: 'მიმდევრობაში {seq} რომელი რიცხვია ზედმეტი (არღვევს წესს)?',
    variables: {
      caseIdx: { kind: 'int', min: 0, max: 5 },
      seq: {
        kind: 'choice',
        values: (v: Vars) => {
          const seqs = [
            '2, 4, 6, 9, 10',
            '1, 3, 5, 8, 9',
            '3, 6, 9, 11, 15',
            '5, 10, 16, 20',
            '10, 20, 25, 40',
            '4, 8, 11, 16',
          ];
          return [seqs[Number(v.caseIdx)]!];
        },
      },
    },
    answer: (v: Vars) => {
      const wrong = [9, 8, 11, 16, 25, 11];
      return wrong[Number(v.caseIdx)]!;
    },
    options: (v: Vars) => {
      const opts: [number, number, number, number][] = [
        [2, 4, 6, 9],
        [3, 5, 8, 9],
        [3, 6, 9, 11],
        [5, 10, 16, 20],
        [10, 20, 25, 40],
        [4, 8, 11, 16],
      ];
      return opts[Number(v.caseIdx)]!.map(String);
    },
    explanation: ({ vars, answer }) => {
      const expected = [8, 7, 12, 15, 30, 12];
      const steps = [2, 2, 3, 5, 10, 4];
      const idx = Number(vars.caseIdx);
      return `მიმდევრობა იცვლება ${steps[idx]}-ით, ამიტომ ${answer}-ის ნაცვლად უნდა ეწეროს ${expected[idx]}.`;
    },
    visual: (v: Vars) => `🔢 ${v.seq}`,
  }),
];

/* ================================================================== *\
 * U16.3: სასწორი (sascori)
 * ================================================================== */

const U16_3_TEMPLATES: QuestionTemplate[] = [
  /**
   * L1 — Is scale balanced? (Spec Q1, Q4).
   * E.g. 2 apples on left, 2 apples on right -> დიახ.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-3-is-scale-balanced', subtopicId: 'sascori', difficulty: 1 }),
    prompt: 'სასწორის ერთ მხარეს დევს {left} {item}, მეორე მხარეს {right} {item}. სასწორი წონასწორობაშია?',
    variables: {
      item: { kind: 'choice', values: ['ვაშლი', 'კუბიკი', 'ბურთი'] },
      left: { kind: 'int', min: 2, max: 5 },
      diff: { kind: 'choice', values: [0, 1] },
      right: { kind: 'choice', values: (v: Vars) => [Number(v.left) + Number(v.diff)] },
    },
    answer: (v: Vars) => (Number(v.diff) === 0 ? 'დიახ' : 'არა'),
    optionCount: 2,
    options: () => ['დიახ', 'არა'],
    explanation: ({ vars, answer }) =>
      Number(vars.diff) === 0
        ? `ორივე მხარეს დევს ${vars.left} ${vars.item}, წონები ტოლია, ამიტომ სასწორი წონასწორობაშია (${answer}).`
        : `მხარეებზე სხვადასხვა რაოდენობაა (${vars.left} და ${vars.right}), ამიტომ სასწორი არ არის წონასწორობაში (${answer}).`,
    visual: (v: Vars) => {
      const emoji = String(v.item) === 'ვაშლი' ? '🍎' : String(v.item) === 'ბურთი' ? '⚽' : '🧊';
      const scale = createBalanceScale(Number(v.left), Number(v.right), String(v.item), emoji);
      return drawBalanceScale(scale);
    },
  }),

  /**
   * L1 — Which side is lower/heavier? (Spec Q2, Q3, Q5, Q8).
   * E.g. left 3 blocks, right 1 block -> 3 კუბიკის მხარეს.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-3-which-side-lower', subtopicId: 'sascori', difficulty: 1 }),
    prompt: 'სასწორის ერთ მხარეს დევს {left} {item}, მეორე მხარეს — {right} {item}. რომელ მხარეს იქნება სასწორი უფრო დაბლა?',
    variables: {
      item: { kind: 'choice', values: ['კუბიკი', 'ბურთი', 'ვაშლი'] },
      c1: { kind: 'choice', values: [1, 2, 3] },
      c2: { kind: 'choice', values: [4, 5] },
      flip: { kind: 'choice', values: [0, 1] },
      left: { kind: 'choice', values: (v: Vars) => [Number(v.flip) === 0 ? Number(v.c1) : Number(v.c2)] },
      right: { kind: 'choice', values: (v: Vars) => [Number(v.flip) === 0 ? Number(v.c2) : Number(v.c1)] },
    },
    answer: (v: Vars) => {
      const max = Math.max(Number(v.left), Number(v.right));
      return `${max} ${v.item}-ის მხარეს`;
    },
    optionCount: 2,
    options: (v: Vars) => {
      const max = Math.max(Number(v.left), Number(v.right));
      const min = Math.min(Number(v.left), Number(v.right));
      return [`${max} ${v.item}-ის მხარეს`, `${min} ${v.item}-ის მხარეს`];
    },
    explanation: ({ vars, answer }) => {
      const max = Math.max(Number(vars.left), Number(vars.right));
      return `უფრო მძიმე მხარე იწევს დაბლა. რადგან ${max} მეტია, სასწორი უფრო დაბლა იქნება ${answer}.`;
    },
    visual: (v: Vars) => {
      const emoji = String(v.item) === 'ვაშლი' ? '🍎' : String(v.item) === 'ბურთი' ? '⚽' : '🧊';
      const scale = createBalanceScale(Number(v.left), Number(v.right), String(v.item), emoji);
      return drawBalanceScale(scale);
    },
  }),

  /**
   * L1 — Which side is heavier: equal or one side? (Spec Q10).
   * E.g. left 3, right 3 -> არცერთი, ორივე მხარე თანაბარია.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-3-which-side-heavier', subtopicId: 'sascori', difficulty: 1 }),
    prompt: 'სასწორის ერთ მხარეს დევს {count} ერთნაირი {item}. მეორე მხარესაც {count} ასეთი {item} დევს. რომელი მხარეა უფრო მძიმე?',
    variables: {
      item: { kind: 'choice', values: ['კუბიკი', 'ბურთი', 'ვაშლი'] },
      count: { kind: 'choice', values: [2, 3, 4, 5] },
    },
    answer: () => 'არცერთი, ორივე მხარე თანაბარია',
    optionCount: 3,
    options: () => [
      'არცერთი, ორივე მხარე თანაბარია',
      'პირველი მხარე',
      'მეორე მხარე',
    ],
    explanation: ({ vars }) =>
      `ორივე მხარეს ${vars.count} ${vars.item} დევს, ამიტომ არცერთი მხარე არაა მძიმე — ისინი თანაბარია.`,
    visual: (v: Vars) => {
      const emoji = String(v.item) === 'ვაშლი' ? '🍎' : String(v.item) === 'ბურთი' ? '⚽' : '🧊';
      const scale = createBalanceScale(Number(v.count), Number(v.count), String(v.item), emoji);
      return drawBalanceScale(scale);
    },
  }),

  /**
   * L2 — How many more items on one side? (Spec Q6, Q9).
   */
  defineTemplate({
    ...address({ id: 'g1-u16-3-difference-between-sides', subtopicId: 'sascori', difficulty: 2 }),
    prompt: 'ერთ მხარეს დევს {left} ერთნაირი {item}, მეორე მხარეს — {right} ასეთი {item}. რამდენით მეტია პირველი მხარე მეორეზე?',
    variables: {
      item: { kind: 'choice', values: ['კუბიკი', 'ბურთი'] },
      right: { kind: 'choice', values: [2, 3, 4] },
      diff: { kind: 'choice', values: [0, 2] },
      left: { kind: 'choice', values: (v: Vars) => [Number(v.right) + Number(v.diff)] },
    },
    answer: (v: Vars) => Number(v.diff),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.left} - ${vars.right} = ${answer}.`,
    visual: (v: Vars) => {
      const emoji = String(v.item) === 'ბურთი' ? '⚽' : '🧊';
      const scale = createBalanceScale(Number(v.left), Number(v.right), String(v.item), emoji);
      return drawBalanceScale(scale);
    },
  }),

  /**
   * L2 — Adding items to achieve balance.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-3-add-to-balance', subtopicId: 'sascori', difficulty: 2 }),
    prompt: 'მარცხენა მხარეს დევს {left} {item}, მარჯვენა მხარეს კი {right} {item}. კიდევ რამდენი {item} უნდა დავდოთ მარჯვნივ, რომ სასწორი გათანაბრდეს?',
    variables: {
      item: { kind: 'choice', values: ['ვაშლი', 'კუბიკი', 'ბურთი'] },
      right: { kind: 'choice', values: [1, 2, 3] },
      diff: { kind: 'choice', values: [2, 3] },
      left: { kind: 'choice', values: (v: Vars) => [Number(v.right) + Number(v.diff)] },
    },
    answer: (v: Vars) => Number(v.diff),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `გასათანაბრებლად საჭიროა ${vars.left} - ${vars.right} = ${answer} ${vars.item}.`,
    visual: (v: Vars) => {
      const emoji = String(v.item) === 'ვაშლი' ? '🍎' : String(v.item) === 'ბურთი' ? '⚽' : '🧊';
      const scale = createBalanceScale(Number(v.left), Number(v.right), String(v.item), emoji);
      return drawBalanceScale(scale);
    },
  }),

  /**
   * L3 — Weight equivalence substitution (Spec Q7).
   * E.g. 1 big cube = 3 small cubes.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-3-equivalence-balance', subtopicId: 'sascori', difficulty: 3 }),
    prompt: 'ერთ მხარეს დევს 1 დიდი კუბიკი, მეორე მხარეს — {smallCount} პატარა კუბიკი. ვიცით, რომ 1 დიდი კუბიკი ზუსტად {target} პატარა კუბიკის ტოლია. სასწორი წონასწორობაშია?',
    variables: {
      target: { kind: 'choice', values: [3, 4] },
      diff: { kind: 'choice', values: [0, 1] },
      smallCount: { kind: 'choice', values: (v: Vars) => [Number(v.target) + Number(v.diff)] },
    },
    answer: (v: Vars) => (Number(v.diff) === 0 ? 'დიახ' : 'არა'),
    optionCount: 2,
    options: () => ['დიახ', 'არა'],
    explanation: ({ vars, answer }) =>
      Number(vars.diff) === 0
        ? `რადგან 1 დიდი კუბიკი = ${vars.target} პატარა კუბიკს და მეორე მხარესაც ${vars.smallCount} კუბიკია, სასწორი წონასწორობაშია (${answer}).`
        : `1 დიდი კუბიკი (${vars.target} პატარა კუბიკი) არ უდრის ${vars.smallCount} კუბიკს, ამიტომ სასწორი არ არის წონასწორობაში (${answer}).`,
    visual: (v: Vars) =>
      `[ 🧊 (დიდი) ]  ═══ ▲ ═══  [ ${Array.from({ length: Number(v.smallCount) }, () => '▫️').join(' ')} ]`,
  }),

  /**
   * L3 — Two-step balance scale equivalence.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-3-two-step-balance-scale', subtopicId: 'sascori', difficulty: 3 }),
    prompt: 'თუ 1 საზამთრო ზუსტად {ratio} ნესვს უდრის, მაშინ 2 საზამთრო რამდენ ნესვს გააწონასწორებს?',
    variables: {
      ratio: { kind: 'choice', values: [2, 3, 4] },
    },
    answer: (v: Vars) => Number(v.ratio) * 2,
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `თითოეული საზამთრო = ${vars.ratio} ნესვს. 2 საზამთრო = ${vars.ratio} + ${vars.ratio} = ${answer} ნესვი.`,
    visual: (v: Vars) => `🍉 = ${Number(v.ratio)} 🍈  ➔  🍉 🍉 = ? 🍈`,
  }),
];

/* ================================================================== *\
 * U16.4: ჩაფიქრებული რიცხვი (Cafiqrebuli-ricxvi)
 * ================================================================== */

const U16_4_TEMPLATES: QuestionTemplate[] = [
  /**
   * L1 — Thought-of number with addition: x + a = b -> x = b - a (Spec Q1, Q2, Q4, Q6, Q8, Q10).
   * E.g. added 2 got 5 -> 3.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-4-thought-add-single', subtopicId: 'Cafiqrebuli-ricxvi', difficulty: 1 }),
    prompt: 'ჩავიფიქრე რიცხვი. მას დავუმატე {a} და მივიღე {b}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      thought: { kind: 'int', min: 2, max: 8 },
      a: { kind: 'int', min: 1, max: 4 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.thought) + Number(v.a)] },
    },
    answer: (v: Vars) => Number(v.thought),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.b} − ${vars.a} = ${answer}. ჩაფიქრებული რიცხვია ${answer}.`,
    visual: (v: Vars) => `❓ + ${v.a} = ${v.b}`,
  }),

  /**
   * L1 — Thought-of number with subtraction: x - a = b -> x = b + a (Spec Q3, Q5, Q7, Q9).
   * E.g. subtracted 2 got 4 -> 6.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-4-thought-sub-single', subtopicId: 'Cafiqrebuli-ricxvi', difficulty: 1 }),
    prompt: 'ჩავიფიქრე რიცხვი. მას გამოვაკელი {a} და მივიღე {b}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      thought: { kind: 'int', min: 4, max: 9 },
      a: { kind: 'int', min: 1, max: 4 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.thought) - Number(v.a)] },
    },
    constraints: [
      { test: (v: Vars) => Number(v.thought) > Number(v.a), note: 'positive result' },
    ],
    answer: (v: Vars) => Number(v.thought),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.b} + ${vars.a} = ${answer}. ჩაფიქრებული რიცხვია ${answer}.`,
    visual: (v: Vars) => `❓ − ${v.a} = ${v.b}`,
  }),

  /**
   * L1 — Direct mystery box representation.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-4-mystery-box', subtopicId: 'Cafiqrebuli-ricxvi', difficulty: 1 }),
    prompt: 'იპოვე უცნობი რიცხვი: [ ? ] + {a} = {b}',
    variables: {
      thought: { kind: 'int', min: 2, max: 7 },
      a: { kind: 'int', min: 2, max: 5 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.thought) + Number(v.a)] },
    },
    answer: (v: Vars) => Number(v.thought),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `უცნობი რიცხვია ${vars.b} − ${vars.a} = ${answer}.`,
    visual: (v: Vars) => `📦 + ${v.a} = ${v.b}`,
  }),

  /**
   * L2 — Thought-of number with larger sum (sum up to 20).
   */
  defineTemplate({
    ...address({ id: 'g1-u16-4-thought-add-larger', subtopicId: 'Cafiqrebuli-ricxvi', difficulty: 2 }),
    prompt: 'ჩავიფიქრე რიცხვი. მას დავუმატე {a} და მივიღე {b}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      thought: { kind: 'int', min: 6, max: 12 },
      a: { kind: 'int', min: 5, max: 8 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.thought) + Number(v.a)] },
    },
    constraints: [
      { test: (v: Vars) => Number(v.b) <= 20, note: 'within 20' },
    ],
    answer: (v: Vars) => Number(v.thought),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.b} − ${vars.a} = ${answer}. ჩაფიქრებული რიცხვია ${answer}.`,
    visual: (v: Vars) => `❓ + ${v.a} = ${v.b}`,
  }),

  /**
   * L2 — Thought-of number with larger subtraction.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-4-thought-sub-larger', subtopicId: 'Cafiqrebuli-ricxvi', difficulty: 2 }),
    prompt: 'ჩავიფიქრე რიცხვი. მას გამოვაკელი {a} და მივიღე {b}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      thought: { kind: 'int', min: 11, max: 18 },
      a: { kind: 'int', min: 4, max: 8 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.thought) - Number(v.a)] },
    },
    answer: (v: Vars) => Number(v.thought),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.b} + ${vars.a} = ${answer}. ჩაფიქრებული რიცხვია ${answer}.`,
    visual: (v: Vars) => `❓ − ${v.a} = ${v.b}`,
  }),

  /**
   * L2 — Doubling a thought-of number.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-4-thought-double', subtopicId: 'Cafiqrebuli-ricxvi', difficulty: 2 }),
    prompt: 'ჩავიფიქრე რიცხვი. ის გავაორმაგე (დავუმატე თავისივე თავი) და მივიღე {b}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      thought: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.thought) * 2] },
    },
    answer: (v: Vars) => Number(v.thought),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.b} = ${answer} + ${answer}. ჩაფიქრებული რიცხვია ${answer}.`,
    visual: (v: Vars) => `❓ + ❓ = ${v.b}`,
  }),

  /**
   * L3 — Two-step thought-of number: (x + a) - c = b.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-4-thought-two-step', subtopicId: 'Cafiqrebuli-ricxvi', difficulty: 3 }),
    prompt: 'ჩავიფიქრე რიცხვი. მას დავუმატე {a}, შემდეგ გამოვაკელი {c} და მივიღე {b}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      thought: { kind: 'int', min: 3, max: 8 },
      a: { kind: 'int', min: 3, max: 5 },
      c: { kind: 'int', min: 1, max: 2 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.thought) + Number(v.a) - Number(v.c)] },
    },
    answer: (v: Vars) => Number(v.thought),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `საპირისპირო მოქმედებებით: ${vars.b} + ${vars.c} = ${Number(vars.b) + Number(vars.c)}, შემდეგ ${Number(vars.b) + Number(vars.c)} − ${vars.a} = ${answer}.`,
    visual: (v: Vars) => `(❓ + ${v.a}) − ${v.c} = ${v.b}`,
  }),

  /**
   * L3 — Halving a thought-of number.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-4-thought-halve', subtopicId: 'Cafiqrebuli-ricxvi', difficulty: 3 }),
    prompt: 'ჩავიფიქრე რიცხვი. ის გავანახევრე (გავყავი ორ ტოლ ნაწილად) და მივიღე {b}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      half: { kind: 'int', min: 3, max: 8 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.half)] },
    },
    answer: (v: Vars) => Number(v.half) * 2,
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `თუ ნახევარი არის ${vars.b}, მთელი რიცხვი იქნება ${vars.b} + ${vars.b} = ${answer}.`,
    visual: (v: Vars) => `❓ ÷ 2 = ${v.b}`,
  }),

  /**
   * L3 — Thought-of number with range bounds.
   */
  defineTemplate({
    ...address({ id: 'g1-u16-4-thought-range', subtopicId: 'Cafiqrebuli-ricxvi', difficulty: 3 }),
    prompt: 'ჩავიფიქრე რიცხვი. თუ მას დავუმატებ {a}-ს, მივიღებ {low}-ზე მეტს, მაგრამ {high}-ზე ნაკლებს. რა რიცხვი ჩავიფიქრე?',
    variables: {
      thought: { kind: 'choice', values: [5, 6, 7] },
      a: { kind: 'choice', values: [3, 4] },
      sum: { kind: 'choice', values: (v: Vars) => [Number(v.thought) + Number(v.a)] },
      low: { kind: 'choice', values: (v: Vars) => [Number(v.thought) + Number(v.a) - 1] },
      high: { kind: 'choice', values: (v: Vars) => [Number(v.thought) + Number(v.a) + 1] },
    },
    answer: (v: Vars) => Number(v.thought),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => numericDistractors(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.low}-სა და ${vars.high}-ს შორის ერთადერთი რიცხვია ${vars.sum}. ${vars.sum} − ${vars.a} = ${answer}.`,
    visual: (v: Vars) => `${v.low} < ❓ + ${v.a} < ${v.high}`,
  }),
];

export const U16_TEMPLATES: QuestionTemplate[] = [
  ...U16_1_TEMPLATES,
  ...U16_2_TEMPLATES,
  ...U16_3_TEMPLATES,
  ...U16_4_TEMPLATES,
];
