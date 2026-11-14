import { defineTemplate, QuestionTemplate } from './types';

/**
 * Grade 2 — Unit 09: დამრგვალება (Rounding)
 *
 * Covers 5 subtopics (30 templates total: Q01–Q30, 6 per subtopic):
 *   U09.1 — დამრგვალება უახლოეს 5-მდე (u09-nearest-5)
 *   U09.2 — დამრგვალება უახლოეს 10-მდე (u09-nearest-10)
 *   U09.3 — დამრგვალება უახლოეს 20-მდე (u09-nearest-20)
 *   U09.4 — ჯამების დამრგვალება (u09-rounding-sums)
 *   U09.5 — სხვაობების დამრგვალება (u09-rounding-differences)
 */

export const G2_U09_SUBTOPICS = [
  'u09-nearest-5',
  'u09-nearest-10',
  'u09-nearest-20',
  'u09-rounding-sums',
  'u09-rounding-differences',
] as const;

export type G2U09SubtopicId = (typeof G2_U09_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G2U09SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 2 as const,
  topicId: 'g2-damrgvaleba' as const,
  unitId: 'g2-damrgvaleba' as const,
  ...options,
});

/** Helper to round to nearest step with half rounded up */
export const roundNearest = (n: number, step: number): number => Math.round(n / step) * step;
export const roundToNearest5 = (n: number): number => roundNearest(n, 5);
export const roundToNearest10 = (n: number): number => roundNearest(n, 10);
export const roundToNearest20 = (n: number): number => roundNearest(n, 20);

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

export const G2_U09_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U09.1 — დამრგვალება უახლოეს 5-მდე (Q01–Q06)
  // =========================================================================

  // Q01 — რომელ რიცხვთანაა უფრო ახლოს: low თუ high? (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g2-u09-01', subtopicId: 'u09-nearest-5', difficulty: 1 }),
    prompt: 'რომელ რიცხვთანაა {n} უფრო ახლოს: {low}-თან თუ {high}-თან?',
    variables: {
      tensBase: { kind: 'int', min: 2, max: 16 },
      offset: { kind: 'choice', values: ['1', '2', '3', '4'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const low = Number(v.tensBase) * 5;
          const high = low + 5;
          const off = Number(v.offset);
          const n = low + off;
          const ans = off < 3 ? low : high;
          return [`${n};${low};${high};${ans}`];
        },
      },
      n: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      low: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      high: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    optionCount: 2,
    options: (v) => [String(v.low), String(v.high)],
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `${vars.n} უფრო ახლოსაა ${answer}-თან.`,
  }),

  // Q02 — დაამრგვალე უახლოეს 5-მდე (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u09-02', subtopicId: 'u09-nearest-5', difficulty: 1 }),
    prompt: 'დაამრგვალე {n} უახლოეს 5-მდე.',
    variables: {
      tensBase: { kind: 'int', min: 2, max: 12 },
      offset: { kind: 'choice', values: ['1', '2', '3', '4'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const base = Number(v.tensBase) * 5;
          const n = base + Number(v.offset);
          const correct = roundNearest(n, 5);
          const w1 = correct - 5;
          const w2 = correct + 5;
          const w3 = correct + 10;
          return [`${n};${correct};${w1};${w2};${w3}`];
        },
      },
      n: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n}-ის უახლოესი 5-ის ჯერადია ${answer}.`,
  }),

  // Q03 — დაამრგვალე უახლოეს 5-მდე (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u09-03', subtopicId: 'u09-nearest-5', difficulty: 2 }),
    prompt: 'დაამრგვალე {n} უახლოეს 5-მდე.',
    variables: {
      tensBase: { kind: 'int', min: 5, max: 12 },
      offset: { kind: 'choice', values: ['1', '2', '3', '4'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const base = Number(v.tensBase) * 5;
          const n = base + Number(v.offset);
          const correct = roundNearest(n, 5);
          const w1 = correct - 5;
          const w2 = correct + 5;
          const w3 = correct - 10;
          return [`${n};${correct};${w1};${w2};${w3}`];
        },
      },
      n: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n}-ის უახლოესი 5-ის ჯერადია ${answer}.`,
  }),

  // Q04 — რომელ რიცხვამდე დამრგვალდება უახლოეს 5-მდე (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u09-04', subtopicId: 'u09-nearest-5', difficulty: 2 }),
    prompt: 'რომელ რიცხვამდე დამრგვალდება {n} უახლოეს 5-მდე?',
    variables: {
      tensBase: { kind: 'int', min: 7, max: 14 },
      offset: { kind: 'choice', values: ['1', '2', '3', '4'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const base = Number(v.tensBase) * 5;
          const n = base + Number(v.offset);
          const correct = roundNearest(n, 5);
          const w1 = correct - 5;
          const w2 = correct + 5;
          const w3 = correct + 10;
          return [`${n};${correct};${w1};${w2};${w3}`];
        },
      },
      n: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n} უახლოეს 5-მდე მრგვალდება ${answer}-მდე.`,
  }),

  // Q05 — დაამრგვალე უახლოეს 5-მდე (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u09-05', subtopicId: 'u09-nearest-5', difficulty: 3 }),
    prompt: 'დაამრგვალე {n} უახლოეს 5-მდე.',
    variables: {
      tensBase: { kind: 'int', min: 11, max: 17 },
      offset: { kind: 'choice', values: ['1', '2', '3', '4'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const base = Number(v.tensBase) * 5;
          const n = base + Number(v.offset);
          const correct = roundNearest(n, 5);
          const w1 = correct - 5;
          const w2 = correct + 5;
          const w3 = correct + 10;
          return [`${n};${correct};${w1};${w2};${w3}`];
        },
      },
      n: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n} უახლოეს 5-მდე არის ${answer}.`,
  }),

  // Q06 — დაამრგვალე მაღალი ორნიშნა რიცხვი უახლოეს 5-მდე (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u09-06', subtopicId: 'u09-nearest-5', difficulty: 3 }),
    prompt: 'დაამრგვალე {n} უახლოეს 5-მდე.',
    variables: {
      tensBase: { kind: 'int', min: 14, max: 19 },
      offset: { kind: 'choice', values: ['1', '2', '3', '4'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const base = Number(v.tensBase) * 5;
          const n = base + Number(v.offset);
          const correct = roundNearest(n, 5);
          const w1 = correct - 5;
          const w2 = correct + 5;
          const w3 = correct - 10;
          return [`${n};${correct};${w1};${w2};${w3}`];
        },
      },
      n: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n} უახლოეს 5-მდე არის ${answer}.`,
  }),

  // =========================================================================
  // U09.2 — დამრგვალება უახლოეს 10-მდე (Q07–Q12)
  // =========================================================================

  // Q07 — დამრგვალება ქვემოთ (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u09-07', subtopicId: 'u09-nearest-10', difficulty: 1 }),
    prompt: 'დაამრგვალე {n} უახლოეს ათეულამდე.',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      ones: { kind: 'choice', values: ['1', '2', '3', '4'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const n = t * 10 + o;
          const correct = t * 10;
          const w1 = (t - 1) * 10;
          const w2 = (t + 1) * 10;
          const w3 = (t + 2) * 10;
          return [`${n};${correct};${w1};${w2};${w3}`];
        },
      },
      n: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n}-ის ერთეულების ციფრია ${Number(vars.n) % 10}, ამიტომ მრგვალდება ქვემოთ: ${answer}.`,
  }),

  // Q08 — დამრგვალება ზემოთ (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u09-08', subtopicId: 'u09-nearest-10', difficulty: 1 }),
    prompt: 'დაამრგვალე {n} უახლოეს ათეულამდე.',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      ones: { kind: 'choice', values: ['6', '7', '8', '9'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const n = t * 10 + o;
          const correct = (t + 1) * 10;
          const w1 = t * 10;
          const w2 = (t - 1) * 10;
          const w3 = (t + 2) * 10;
          return [`${n};${correct};${w1};${w2};${w3}`];
        },
      },
      n: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n}-ის ერთეულების ციფრია ${Number(vars.n) % 10}, ამიტომ მრგვალდება ზემოთ: ${answer}.`,
  }),

  // Q09 — დამრგვალება ათეულამდე (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u09-09', subtopicId: 'u09-nearest-10', difficulty: 2 }),
    prompt: 'დაამრგვალე {n} უახლოეს ათეულამდე.',
    variables: {
      tens: { kind: 'int', min: 3, max: 8 },
      ones: { kind: 'choice', values: ['1', '2', '3', '4', '6', '7', '8', '9'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const n = t * 10 + o;
          const correct = roundNearest(n, 10);
          const w1 = correct === t * 10 ? (t + 1) * 10 : t * 10;
          const w2 = correct - 20;
          const w3 = correct + 20;
          return [`${n};${correct};${w1};${w2};${w3}`];
        },
      },
      n: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n} უახლოეს ათეულამდე არის ${answer}.`,
  }),

  // Q10 — 5-ზე დაბოლოებული რიცხვების დამრგვალება (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u09-10', subtopicId: 'u09-nearest-10', difficulty: 2 }),
    prompt: '{promptText}',
    variables: {
      tens: { kind: 'int', min: 0, max: 8 },
      promptStyle: { kind: 'choice', values: ['standard', 'short'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const n = t * 10 + 5;
          const correct = (t + 1) * 10;
          const lower = t * 10;
          const misses = nearMisses(correct, 4, 0, 10);
          const pool = Array.from(new Set([lower, ...misses])).filter((x) => x !== correct);
          const w1 = pool[0];
          const w2 = pool[1];
          const w3 = pool[2];
          const promptText =
            v.promptStyle === 'standard'
              ? `დაამრგვალე ${n} უახლოეს ათეულამდე.\n\n(გაითვალისწინე: 5-ზე დაბოლოებული რიცხვი მრგვალდება მეტი ათეულისკენ)`
              : `დაამრგვალე რიცხვი ${n} უახლოეს ათეულამდე (შუა რიცხვი მრგვალდება ზემოთ).`;
          return [`${n};${correct};${w1};${w2};${w3};${promptText}`];
        },
      },
      n: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      promptText: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n} ზუსტად შუაშია, ამიტომ წესის თანახმად მრგვალდება ზემოთ: ${answer}.`,
  }),

  // Q11 — რომელ ათეულებს შორისაა მოთავსებული (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u09-11', subtopicId: 'u09-nearest-10', difficulty: 3 }),
    prompt: 'რომელ ორ უახლოეს ათეულს შორისაა მოთავსებული რიცხვი {n}?',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      ones: { kind: 'choice', values: ['1', '2', '3', '4', '6', '7', '8', '9'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.tens);
          const o = Number(v.ones);
          const n = t * 10 + o;
          const low = t * 10;
          const high = (t + 1) * 10;
          const correct = `${low} და ${high}`;
          const w1 = `${low - 10} და ${low}`;
          const w2 = `${high} და ${high + 10}`;
          const w3 = `${low - 20} და ${low - 10}`;
          return [`${n};${correct};${w1};${w2};${w3}`];
        },
      },
      n: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n} მოთავსებულია ${answer}-ს შორის.`,
  }),

  // Q12 — 90-იანების დამრგვალება 100-მდე (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u09-12', subtopicId: 'u09-nearest-10', difficulty: 3 }),
    prompt: '{promptText}',
    variables: {
      ones: { kind: 'choice', values: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
      style: { kind: 'choice', values: ['A', 'B'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const o = Number(v.ones);
          const n = 90 + o;
          const correct = o >= 5 ? 100 : 90;
          const w1 = correct === 100 ? 90 : 100;
          const w2 = 80;
          const w3 = 110;
          const promptText =
            v.style === 'A'
              ? `დაამრგვალე ${n} უახლოეს ათეულამდე.`
              : `რომელია ${n}-ის უახლოესი ათეული?`;
          return [`${n};${correct};${w1};${w2};${w3};${promptText}`];
        },
      },
      n: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      promptText: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n} უახლოეს ათეულამდე არის ${answer}.`,
  }),

  // =========================================================================
  // U09.3 — დამრგვალება უახლოეს 20-მდე (Q13–Q18)
  // =========================================================================

  // Q13 — რომელ 20-ის ჯერადთანაა უფრო ახლოს (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g2-u09-13', subtopicId: 'u09-nearest-20', difficulty: 1 }),
    prompt: 'რომელ რიცხვთანაა {n} უფრო ახლოს: {low}-თან თუ {high}-თან?',
    variables: {
      baseMult: { kind: 'int', min: 1, max: 4 },
      offset: { kind: 'choice', values: ['3', '6', '7', '13', '14', '17'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const low = Number(v.baseMult) * 20;
          const high = low + 20;
          const off = Number(v.offset);
          const n = low + off;
          const ans = off < 10 ? low : high;
          return [`${n};${low};${high};${ans}`];
        },
      },
      n: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      low: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      high: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    optionCount: 2,
    options: (v) => [String(v.low), String(v.high)],
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `${vars.n} უფრო ახლოსაა ${answer}-თან.`,
  }),

  // Q14 — დაამრგვალე უახლოეს 20-მდე (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u09-14', subtopicId: 'u09-nearest-20', difficulty: 1 }),
    prompt: 'დაამრგვალე {n} უახლოეს 20-ის ჯერადამდე.',
    variables: {
      n: { kind: 'int', min: 21, max: 49 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const n = Number(v.n);
          const correct = roundNearest(n, 20);
          const w1 = correct === 20 ? 40 : 20;
          const w2 = 60;
          const w3 = 80;
          return [`${correct};${w1};${w2};${w3}`];
        },
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n} უახლოეს 20-ის ჯერადამდე არის ${answer}.`,
  }),

  // Q15 — დაამრგვალე უახლოეს 20-მდე (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u09-15', subtopicId: 'u09-nearest-20', difficulty: 2 }),
    prompt: 'დაამრგვალე {n} უახლოეს 20-ის ჯერადამდე.',
    variables: {
      n: { kind: 'int', min: 41, max: 69 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const n = Number(v.n);
          const correct = roundNearest(n, 20);
          const w1 = correct === 40 ? 60 : 40;
          const w2 = 20;
          const w3 = 80;
          return [`${correct};${w1};${w2};${w3}`];
        },
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n} უახლოეს 20-ის ჯერადამდე არის ${answer}.`,
  }),

  // Q16 — დაამრგვალე უახლოეს 20-მდე (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u09-16', subtopicId: 'u09-nearest-20', difficulty: 2 }),
    prompt: 'დაამრგვალე {n} უახლოეს 20-ის ჯერადამდე.',
    variables: {
      n: { kind: 'int', min: 61, max: 89 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const n = Number(v.n);
          const correct = roundNearest(n, 20);
          const w1 = correct === 60 ? 80 : 60;
          const w2 = 40;
          const w3 = 100;
          return [`${correct};${w1};${w2};${w3}`];
        },
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n} უახლოეს 20-ის ჯერადამდე არის ${answer}.`,
  }),

  // Q17 — შუა რიცხვების დამრგვალება 20-მდე (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u09-17', subtopicId: 'u09-nearest-20', difficulty: 3 }),
    prompt: '{promptText}',
    variables: {
      halfBase: {
        kind: 'choice',
        values: ['10', '30', '50', '70', '90', '110', '130', '150', '170'],
      },
      style: { kind: 'choice', values: ['standard', 'short'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const n = Number(v.halfBase);
          const correct = roundNearest(n, 20);
          const lower = n - 10;
          const misses = nearMisses(correct, 4, 0, 20);
          const pool = Array.from(new Set([lower, ...misses])).filter((x) => x !== correct);
          const w1 = pool[0];
          const w2 = pool[1];
          const w3 = pool[2];
          const promptText =
            v.style === 'standard'
              ? `დაამრგვალე ${n} უახლოეს 20-ის ჯერადამდე.\n\n(გაითვალისწინე: ზუსტად შუაში მოქცეული რიცხვი მრგვალდება მეტი მნიშვნელობისკენ)`
              : `დაამრგვალე რიცხვი ${n} უახლოეს 20-ის ჯერადამდე (შუა რიცხვი მრგვალდება ზემოთ).`;
          return [`${correct};${w1};${w2};${w3};${promptText}`];
        },
      },
      n: { kind: 'choice', values: (v) => [String(v.halfBase)] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      promptText: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n} ზუსტად შუაშია, ამიტომ წესის მიხედვით მრგვალდება ზემოთ: ${answer}.`,
  }),

  // Q18 — 100-ს ზემოთ რიცხვების დამრგვალება 20-მდე (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u09-18', subtopicId: 'u09-nearest-20', difficulty: 3 }),
    prompt: 'დაამრგვალე {n} უახლოეს 20-ის ჯერადამდე.',
    variables: {
      n: { kind: 'int', min: 102, max: 138 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const n = Number(v.n);
          const correct = roundNearest(n, 20);
          const w1 = correct - 20;
          const w2 = correct + 20;
          const w3 = correct === 120 ? 80 : 120;
          return [`${correct};${w1};${w2};${w3}`];
        },
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n} უახლოეს 20-ის ჯერადამდე არის ${answer}.`,
  }),

  // =========================================================================
  // U09.4 — ჯამების დამრგვალება (Q19–Q24)
  // =========================================================================

  // Q19 — ჯამის დამრგვალება ათეულამდე (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u09-19', subtopicId: 'u09-rounding-sums', difficulty: 1 }),
    prompt:
      'გამოთვალე ჯამი და დაამრგვალე უახლოეს ათეულამდე:\\n\\n' +
      '{a} + {b}',
    variables: {
      a: { kind: 'int', min: 14, max: 32 },
      b: { kind: 'int', min: 12, max: 28 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const sum = Number(v.a) + Number(v.b);
          const rounded = roundNearest(sum, 10);
          return [`${sum};${rounded}`];
        },
      },
      sum: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      rounded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${vars.sum}, რაც უახლოეს ათეულამდე მრგვალდება ${answer}-მდე.`,
  }),

  // Q20 — ჯამის დამრგვალება ათეულამდე (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u09-20', subtopicId: 'u09-rounding-sums', difficulty: 1 }),
    prompt:
      'გამოთვალე ჯამი და დაამრგვალე უახლოეს ათეულამდე:\\n\\n' +
      '{a} + {b}',
    variables: {
      a: { kind: 'int', min: 25, max: 45 },
      b: { kind: 'int', min: 15, max: 35 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const sum = Number(v.a) + Number(v.b);
          const rounded = roundNearest(sum, 10);
          return [`${sum};${rounded}`];
        },
      },
      sum: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      rounded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${vars.sum}, რაც უახლოეს ათეულამდე მრგვალდება ${answer}-მდე.`,
  }),

  // Q21 — ჯამის დამრგვალება ათეულამდე (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u09-21', subtopicId: 'u09-rounding-sums', difficulty: 2 }),
    prompt:
      'გამოთვალე ჯამი და დაამრგვალე უახლოეს ათეულამდე:\\n\\n' +
      '{a} + {b}',
    variables: {
      a: { kind: 'int', min: 35, max: 55 },
      b: { kind: 'int', min: 22, max: 42 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const sum = Number(v.a) + Number(v.b);
          const rounded = roundNearest(sum, 10);
          return [`${sum};${rounded}`];
        },
      },
      sum: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      rounded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${vars.sum}, რაც უახლოეს ათეულამდე მრგვალდება ${answer}-მდე.`,
  }),

  // Q22 — ჯამის დამრგვალება 20-მდე (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u09-22', subtopicId: 'u09-rounding-sums', difficulty: 2 }),
    prompt:
      'გამოთვალე ჯამი და დაამრგვალე უახლოეს 20-ის ჯერადამდე:\\n\\n' +
      '{a} + {b}',
    variables: {
      a: { kind: 'int', min: 18, max: 40 },
      b: { kind: 'int', min: 16, max: 38 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const sum = Number(v.a) + Number(v.b);
          const rounded = roundNearest(sum, 20);
          return [`${sum};${rounded}`];
        },
      },
      sum: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      rounded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 20),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${vars.sum}, რაც უახლოეს 20-ის ჯერადამდე მრგვალდება ${answer}-მდე.`,
  }),

  // Q23 — ჯამის დამრგვალება ათეულამდე (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u09-23', subtopicId: 'u09-rounding-sums', difficulty: 3 }),
    prompt:
      'გამოთვალე ჯამი და დაამრგვალე უახლოეს ათეულამდე:\\n\\n' +
      '{a} + {b}',
    variables: {
      a: { kind: 'int', min: 48, max: 68 },
      b: { kind: 'int', min: 24, max: 44 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const sum = Number(v.a) + Number(v.b);
          const rounded = roundNearest(sum, 10);
          return [`${sum};${rounded}`];
        },
      },
      sum: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      rounded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${vars.sum}, რაც უახლოეს ათეულამდე მრგვალდება ${answer}-მდე.`,
  }),

  // Q24 — ჯამის დამრგვალება 20-მდე (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u09-24', subtopicId: 'u09-rounding-sums', difficulty: 3 }),
    prompt:
      'გამოთვალე ჯამი და დაამრგვალე უახლოეს 20-ის ჯერადამდე:\\n\\n' +
      '{a} + {b}',
    variables: {
      a: { kind: 'int', min: 36, max: 62 },
      b: { kind: 'int', min: 28, max: 54 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const sum = Number(v.a) + Number(v.b);
          const rounded = roundNearest(sum, 20);
          return [`${sum};${rounded}`];
        },
      },
      sum: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      rounded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 20),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${vars.sum}, რაც უახლოეს 20-ის ჯერადამდე მრგვალდება ${answer}-მდე.`,
  }),

  // =========================================================================
  // U09.5 — სხვაობების დამრგვალება (Q25–Q30)
  // =========================================================================

  // Q25 — სხვაობის დამრგვალება ათეულამდე (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u09-25', subtopicId: 'u09-rounding-differences', difficulty: 1 }),
    prompt:
      'გამოთვალე სხვაობა და დაამრგვალე უახლოეს ათეულამდე:\\n\\n' +
      '{a} − {b}',
    variables: {
      a: { kind: 'int', min: 38, max: 65 },
      b: { kind: 'int', min: 12, max: 28 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const diff = Number(v.a) - Number(v.b);
          const rounded = roundNearest(diff, 10);
          return [`${diff};${rounded}`];
        },
      },
      diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      rounded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${vars.diff}, რაც უახლოეს ათეულამდე მრგვალდება ${answer}-მდე.`,
  }),

  // Q26 — სხვაობის დამრგვალება ათეულამდე (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u09-26', subtopicId: 'u09-rounding-differences', difficulty: 1 }),
    prompt:
      'გამოთვალე სხვაობა და დაამრგვალე უახლოეს ათეულამდე:\\n\\n' +
      '{a} − {b}',
    variables: {
      a: { kind: 'int', min: 52, max: 82 },
      b: { kind: 'int', min: 18, max: 38 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const diff = Number(v.a) - Number(v.b);
          const rounded = roundNearest(diff, 10);
          return [`${diff};${rounded}`];
        },
      },
      diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      rounded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${vars.diff}, რაც უახლოეს ათეულამდე მრგვალდება ${answer}-მდე.`,
  }),

  // Q27 — სხვაობის დამრგვალება ათეულამდე (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u09-27', subtopicId: 'u09-rounding-differences', difficulty: 2 }),
    prompt:
      'გამოთვალე სხვაობა და დაამრგვალე უახლოეს ათეულამდე:\\n\\n' +
      '{a} − {b}',
    variables: {
      a: { kind: 'int', min: 72, max: 98 },
      b: { kind: 'int', min: 28, max: 54 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const diff = Number(v.a) - Number(v.b);
          const rounded = roundNearest(diff, 10);
          return [`${diff};${rounded}`];
        },
      },
      diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      rounded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${vars.diff}, რაც უახლოეს ათეულამდე მრგვალდება ${answer}-მდე.`,
  }),

  // Q28 — სხვაობის დამრგვალება 20-მდე (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u09-28', subtopicId: 'u09-rounding-differences', difficulty: 2 }),
    prompt:
      'გამოთვალე სხვაობა და დაამრგვალე უახლოეს 20-ის ჯერადამდე:\\n\\n' +
      '{a} − {b}',
    variables: {
      a: { kind: 'int', min: 65, max: 96 },
      b: { kind: 'int', min: 18, max: 42 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const diff = Number(v.a) - Number(v.b);
          const rounded = roundNearest(diff, 20);
          return [`${diff};${rounded}`];
        },
      },
      diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      rounded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 20),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${vars.diff}, რაც უახლოეს 20-ის ჯერადამდე მრგვალდება ${answer}-მდე.`,
  }),

  // Q29 — სხვაობის დამრგვალება ათეულამდე (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u09-29', subtopicId: 'u09-rounding-differences', difficulty: 3 }),
    prompt:
      'გამოთვალე სხვაობა და დაამრგვალე უახლოეს ათეულამდე:\\n\\n' +
      '{a} − {b}',
    variables: {
      a: { kind: 'int', min: 58, max: 95 },
      b: { kind: 'int', min: 25, max: 48 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const diff = Number(v.a) - Number(v.b);
          const rounded = roundNearest(diff, 10);
          return [`${diff};${rounded}`];
        },
      },
      diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      rounded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${vars.diff}, რაც უახლოეს ათეულამდე მრგვალდება ${answer}-მდე.`,
  }),

  // Q30 — სხვაობის დამრგვალება 20-მდე (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u09-30', subtopicId: 'u09-rounding-differences', difficulty: 3 }),
    prompt:
      'გამოთვალე სხვაობა და დაამრგვალე უახლოეს 20-ის ჯერადამდე:\\n\\n' +
      '{a} − {b}',
    variables: {
      a: { kind: 'int', min: 78, max: 99 },
      b: { kind: 'int', min: 18, max: 46 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const diff = Number(v.a) - Number(v.b);
          const rounded = roundNearest(diff, 20);
          return [`${diff};${rounded}`];
        },
      },
      diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      rounded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 20),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${vars.diff}, რაც უახლოეს 20-ის ჯერადამდე მრგვალდება ${answer}-მდე.`,
  }),
];
