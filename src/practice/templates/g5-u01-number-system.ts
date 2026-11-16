import { defineTemplate, type QuestionTemplate } from './types';
import { powerText } from './g5-helpers';

/**
 * Grade V — Unit 01: რიცხვითი სისტემა და თანრიგები (number system and place value)
 *
 * Covers the 6 subtopics the academy's question bank `U01` carries: U01.4–U01.9.
 * The bank has no `U01.1`–`U01.3`; the curriculum matches it, so this library
 * does too.
 *
 * Each bank question becomes one template. The bank's numbers are fixed, so a
 * template holds a table of the academy's own values (`spec` below) plus a few
 * extra drawn neighbours; the wording and the answer are both computed from the
 * same row, which is what keeps them from disagreeing.
 *
 * Bank notation is LaTeX (`(\frac{3}{4})`, `(35^\circ)`) because it was written
 * for print. The app renders plain text, so answers are written the way a
 * student reads them: `10³`, `35°`, `3/4`.
 */

export const G5_U01_SUBTOPICS = [
  'u01-04',
  'u01-05',
  'u01-06',
  'u01-07',
  'u01-08',
  'u01-09',
] as const;

export type G5U01SubtopicId = (typeof G5_U01_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G5U01SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 5 as const,
  topicId: 'g5-numbers-place-value' as const,
  unitId: 'g5-numbers-place-value' as const,
  ...options,
});

/**
 * Numbers as a student reads them: a true minus sign for negatives.
 *
 * The bank prints `−4°C` with U+2212, so an option reading `-4` looked like a
 * different character from the one in the question. Integer answers here can be
 * negative (U01.7), so they all render through this.
 */
export const displayNumber = (value: number | string): string =>
  String(value).replace(/^-/, '\u2212');

/**
 * Distractors as the student reads them.
 *
 * Every numeric distractor in this unit is a near miss of an answer that may be
 * negative, so each number has to go through `displayNumber` before it becomes
 * an option; otherwise the wrong options read `-4` while the prompt and the
 * correct option read `−4`.
 */
export const wrongNumbers = (values: number[]): string[] => values.map((v) => displayNumber(v));

/** Georgian thousands separator, matching the bank's `624 381`. */
const group = (n: number): string => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** Distractors as a step away from the answer, all distinct and non-negative. */
export const nearMisses = (answer: number, count = 3, step = 1, min = 0): number[] => {
  const out: number[] = [];
  const deltas = [step, -step, 2 * step, -2 * step, 3 * step, -3 * step, 10, -10, 100, 1000];
  for (const delta of deltas) {
    const value = answer + delta;
    if (value >= min && value !== answer && !out.includes(value)) out.push(value);
    if (out.length >= count) break;
  }
  let extra = 1;
  while (out.length < count) {
    const value = answer + extra * step;
    if (value >= min && value !== answer && !out.includes(value)) out.push(value);
    extra += 1;
  }
  return out.slice(0, count);
};

export const G5_U01_TEMPLATES: QuestionTemplate[] = [
  // ─────────────────────────── U01.4 — place-value form → number ───────────────────────────
  defineTemplate({
    ...addr({ id: 'g5-u01-q01', subtopicId: 'u01-04', difficulty: 1 }),
    prompt: 'ჩაწერე ციფრებით რიცხვი, რომელშიც არის {m} ათასეული, {ht} ასეული, {t} ათეული და {u} ერთეული.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '5|3|4|6', '8|0|1|9', '7|6|5|0', '2|4|8|1', '9|5|0|3',
          '6|2|7|4', '3|8|6|2', '4|1|9|7', '1|7|3|5', '7|9|2|6',
          '5|5|5|5', '8|3|0|4', '2|6|1|8', '6|9|4|3', '9|0|7|2',
          '3|4|5|9', '4|7|2|1', '1|2|8|6',
        ],
      },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ht: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      t: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      u: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      value: {
        kind: 'choice',
        values: (v) => {
          const [m, ht, t, u] = String(v.spec).split('|').map(Number);
          return [m * 1000 + ht * 100 + t * 10 + u];
        },
      },
      shown: { kind: 'choice', values: (v) => [group(Number(v.value))] },
    },
    answer: (v) => Number(v.value),
    format: { kind: 'integer', min: 1000 },
    distractors: (ctx) => wrongNumbers(nearMisses(Number(ctx.answer), 3)),
    explanation: ({ vars, answer }) =>
      `${vars.m} ათასეული = ${Number(vars.m) * 1000}, ${vars.ht} ასეული = ${Number(vars.ht) * 100}, ` +
      `${vars.t} ათეული = ${Number(vars.t) * 10}, ${vars.u} ერთეული = ${vars.u}. ` +
      `სულ: ${group(Number(answer))}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q02', subtopicId: 'u01-04', difficulty: 1 }),
    prompt: 'ჩაწერე ციფრებით: {m} ათასეული ათასეული, {ht} ათასეული, {t} ასეული, {u} ათეული და {z} ერთეული.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '8|4|6|1|9', '0|5|2|7|3', '6|7|0|4|8', '9|3|5|6|1',
          '2|8|4|3|5', '4|1|9|5|7', '5|6|8|2|0', '7|0|3|9|4',
          '3|9|1|8|6', '1|4|7|0|2', '8|2|5|1|6', '6|5|3|4|9',
          '2|7|8|6|1', '9|1|4|2|8', '4|6|0|5|3', '5|8|9|7|2',
        ],
      },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ht: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      t: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      u: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      z: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
      value: {
        kind: 'choice',
        values: (v) => {
          const [m, ht, t, u, z] = String(v.spec).split('|').map(Number);
          return [m * 10000 + ht * 1000 + t * 100 + u * 10 + z];
        },
      },
      shown: { kind: 'choice', values: (v) => [group(Number(v.value))] },
    },
    answer: (v) => Number(v.value),
    format: { kind: 'integer', min: 1000 },
    distractors: (ctx) => wrongNumbers(nearMisses(Number(ctx.answer), 3)),
    explanation: ({ answer }) => `სულ: ${group(Number(answer))}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q03', subtopicId: 'u01-04', difficulty: 2 }),
    prompt: 'წარმოადგინე რიცხვი {n} თანრიგების ჯამის სახით. რამდენია ათასეულების რაოდენობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['624381', '735204', '481627', '953418', '307256', '870513', '192845', '546790', '268374', '759061', '413928', '685137'],
      },
      n: { kind: 'choice', values: (v) => [group(Number(String(v.spec)))] },
      raw: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
      thousands: {
        kind: 'choice',
        values: (v) => [Math.floor(Number(v.raw) / 1000)],
      },
    },
    answer: (v) => Number(v.thousands),
    format: { kind: 'integer', min: 0 },
    distractors: (ctx) => wrongNumbers(nearMisses(Number(ctx.answer), 3)),
    explanation: ({ vars, answer }) =>
      `${vars.n} — ათასეულების ჯგუფია ${answer}, ამიტომ ათასეულების რაოდენობა ${answer}-ია.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q04', subtopicId: 'u01-04', difficulty: 2 }),
    prompt: 'რიცხვში {n} რამდენია ათიათასეული?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['735204', '624381', '481627', '953418', '307256', '870513', '546790', '268374', '413928', '685137', '192845', '759061'],
      },
      n: { kind: 'choice', values: (v) => [group(Number(String(v.spec)))] },
      raw: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
      digit: {
        kind: 'choice',
        values: (v) => [Math.floor(Number(v.raw) / 10000) % 10],
      },
    },
    answer: (v) => Number(v.digit),
    format: { kind: 'integer', min: 0, max: 9 },
    distractors: () => [1, 2, 3, 4, 5].filter((d) => d !== 0).slice(0, 3).concat([0]),
    explanation: ({ vars, answer }) =>
      `${vars.n} — ათიათასეულების ადგილზე დგას ციფრი ${answer}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q05', subtopicId: 'u01-04', difficulty: 2 }),
    prompt: 'რიცხვში {n} რა ციფრი დგას ათასეულების თანრიგში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['481627', '735204', '624381', '953418', '307256', '870513', '546790', '268374', '413928', '685137', '192845', '759061'],
      },
      n: { kind: 'choice', values: (v) => [group(Number(String(v.spec)))] },
      raw: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
      digit: { kind: 'choice', values: (v) => [Math.floor(Number(v.raw) / 1000) % 10] },
    },
    answer: (v) => Number(v.digit),
    format: { kind: 'integer', min: 0, max: 9 },
    distractors: (ctx) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => d !== Number(ctx.answer)).slice(0, 3),
    explanation: ({ vars, answer }) =>
      `${vars.n} — ათასეულების თანრიგში დგას ციფრი ${answer}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q06', subtopicId: 'u01-04', difficulty: 3 }),
    prompt: 'ჩაწერე რიცხვი, რომელიც შედგება {m} ასეული ათასეულისგან, {ht} ათასეულისგან და {t} ათეულისგან.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['9|2|5', '4|0|8', '7|5|3', '3|8|6', '6|1|9', '2|7|4', '8|4|0', '5|9|1', '1|6|7', '6|3|2', '7|2|8', '4|5|6'],
      },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ht: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      t: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      value: {
        kind: 'choice',
        values: (v) => {
          const [m, ht, t] = String(v.spec).split('|').map(Number);
          return [m * 100000 + ht * 1000 + t * 10];
        },
      },
      shown: { kind: 'choice', values: (v) => [group(Number(v.value))] },
    },
    answer: (v) => Number(v.value),
    format: { kind: 'integer', min: 1000 },
    distractors: (ctx) => wrongNumbers(nearMisses(Number(ctx.answer), 3)),
    explanation: ({ vars, answer }) =>
      `${vars.m} ასეული ათასეული = ${Number(vars.m) * 100000}, ${vars.ht} ათასეული = ${Number(vars.ht) * 1000}, ` +
      `${vars.t} ათეული = ${Number(vars.t) * 10}. სულ: ${group(Number(answer))}.`,
  }),

  // ─────────────────────────── U01.5 — missing digit ───────────────────────────
  defineTemplate({
    ...addr({ id: 'g5-u01-q07', subtopicId: 'u01-05', difficulty: 1 }),
    prompt: 'აღადგინე რიცხვი: {m} ასეული ათასეული, {ht} ათასეული, {t} ასეული და {u} ერთეული. ჩაწერე ციფრებით.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['4|6|2|8', '7|5|9|3', '2|8|0|5', '6|3|4|1', '9|1|7|6', '3|7|5|2', '8|0|3|9', '5|4|8|0', '1|9|6|4', '7|2|1|5', '4|8|9|7', '6|5|0|3'],
      },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ht: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      t: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      u: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      value: {
        kind: 'choice',
        values: (v) => {
          const [m, ht, t, u] = String(v.spec).split('|').map(Number);
          return [m * 100000 + ht * 1000 + t * 100 + u];
        },
      },
      shown: { kind: 'choice', values: (v) => [group(Number(v.value))] },
    },
    answer: (v) => Number(v.value),
    format: { kind: 'integer', min: 1000 },
    distractors: (ctx) => wrongNumbers(nearMisses(Number(ctx.answer), 3)),
    explanation: ({ answer }) => `სულ: ${group(Number(answer))}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q08', subtopicId: 'u01-05', difficulty: 2 }),
    prompt: 'რიცხვში {a}□{b} {c}{d} ათიათასეულების თანრიგში დგას ციფრი 7. ჩაწერე სრული რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '5|3|2|1', '4|7|3|9', '8|2|5|6', '6|9|1|4', '3|5|8|7', '9|1|4|2', '7|8|6|0', '2|4|9|5',
          '1|6|7|3', '8|9|0|6', '4|2|3|8', '6|7|5|9', '9|4|8|1', '2|1|6|7', '5|8|9|2', '3|0|4|5',
          '7|3|1|8', '1|8|2|4',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      d: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      value: {
        kind: 'choice',
        values: (v) => {
          const [a, b, c, d] = String(v.spec).split('|').map(Number);
          return [a * 100000 + 7 * 10000 + b * 1000 + c * 100 + d * 10];
        },
      },
      shown: { kind: 'choice', values: (v) => [group(Number(v.value))] },
    },
    answer: (v) => Number(v.value),
    format: { kind: 'integer', min: 1000 },
    distractors: (ctx) => wrongNumbers(nearMisses(Number(ctx.answer), 3)),
    explanation: ({ answer }) =>
      `ათიათასეულების ადგილზე უნდა იდგეს 7, ამიტომ რიცხვია ${group(Number(answer))}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q09', subtopicId: 'u01-05', difficulty: 2 }),
    prompt: 'რიცხვში {p}□ {c}{d}{u} ათასეულების თანრიგში დგას ციფრი 0. ჩაწერე სრული რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '82|4|5|1', '63|7|2|9', '91|3|8|6', '47|5|6|2', '38|9|1|4', '75|2|7|8', '26|8|3|5', '54|1|9|3',
          '19|6|4|7', '40|2|8|5', '68|3|9|1', '33|5|7|0', '72|8|1|6', '25|4|0|9', '86|1|5|3', '59|7|6|8',
          '14|9|2|5', '97|0|3|4',
        ],
      },
      p: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      d: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      u: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      value: {
        kind: 'choice',
        values: (v) => {
          const [p, c, d, u] = String(v.spec).split('|').map(Number);
          return [p * 10000 + 0 * 1000 + c * 100 + d * 10 + u];
        },
      },
      shown: { kind: 'choice', values: (v) => [group(Number(v.value))] },
    },
    answer: (v) => Number(v.value),
    format: { kind: 'integer', min: 1000 },
    distractors: (ctx) => wrongNumbers(nearMisses(Number(ctx.answer), 3)),
    explanation: ({ answer }) =>
      `ათასეულების ადგილზე 0 დგას, ამიტომ რიცხვია ${group(Number(answer))}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q10', subtopicId: 'u01-05', difficulty: 2 }),
    prompt: 'რიცხვში {a}□{b} {c}{d}{e} ათიათასეულების თანრიგში დგას ციფრი 4. ჩაწერე სრული რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '3|6|8|4|2', '7|1|5|9|3', '5|8|2|6|7', '9|3|4|1|8', '2|5|9|7|1', '6|4|7|3|5', '8|2|1|5|9', '1|7|3|8|6',
          '4|9|6|2|0', '6|2|3|7|8', '8|5|0|1|4', '1|3|9|6|2', '7|6|2|8|5', '2|8|4|0|9', '5|1|7|3|6', '9|7|8|5|1',
          '3|4|1|9|7', '6|5|8|2|3',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      d: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
      e: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
      value: {
        kind: 'choice',
        values: (v) => {
          const s = String(v.spec).split('|').map(Number);
          return [s[0] * 100000 + 4 * 10000 + s[2] * 1000 + s[3] * 100 + s[4] * 10];
        },
      },
      shown: { kind: 'choice', values: (v) => [group(Number(v.value))] },
    },
    answer: (v) => Number(v.value),
    format: { kind: 'integer', min: 1000 },
    distractors: (ctx) => wrongNumbers(nearMisses(Number(ctx.answer), 3)),
    explanation: ({ answer }) =>
      `ათიათასეულების ადგილზე 4 დგას, ამიტომ რიცხვია ${group(Number(answer))}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q11', subtopicId: 'u01-05', difficulty: 3 }),
    prompt: 'რიცხვში {th} □{tail} ასეულების თანრიგში დგას ციფრი 9. ჩაწერე სრული რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '617|35', '428|91', '305|72', '984|16', '560|43', '271|88', '843|50', '196|27',
          '732|64', '158|09', '409|83', '875|21', '263|57', '914|38', '580|76', '347|12',
          '691|45', '126|70',
        ],
      },
      th: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      tail: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      value: {
        kind: 'choice',
        values: (v) => [Number(v.th) * 1000 + 9 * 100 + Number(v.tail)],
      },
      shown: { kind: 'choice', values: (v) => [group(Number(v.value))] },
    },
    answer: (v) => Number(v.value),
    format: { kind: 'integer', min: 1000 },
    distractors: (ctx) => wrongNumbers(nearMisses(Number(ctx.answer), 3)),
    explanation: ({ answer }) =>
      `ასეულების ადგილზე 9 დგას, ამიტომ რიცხვია ${group(Number(answer))}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q12', subtopicId: 'u01-05', difficulty: 3 }),
    prompt: 'რიცხვში {front}□ {tail} ათასეულების თანრიგში დგას ციფრი 5. ჩაწერე სრული რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '24|681', '51|207', '73|940', '16|358', '89|124', '35|706', '62|493', '41|875',
          '97|032', '12|569', '68|174', '30|925', '85|317', '46|208', '79|643', '53|081',
          '21|794', '94|365',
        ],
      },
      front: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      tail: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      value: {
        kind: 'choice',
        values: (v) => [Number(v.front) * 10000 + 5 * 1000 + Number(v.tail)],
      },
      shown: { kind: 'choice', values: (v) => [group(Number(v.value))] },
    },
    answer: (v) => Number(v.value),
    format: { kind: 'integer', min: 1000 },
    distractors: (ctx) => wrongNumbers(nearMisses(Number(ctx.answer), 3)),
    explanation: ({ answer }) =>
      `ათასეულების ადგილზე 5 დგას, ამიტომ რიცხვია ${group(Number(answer))}.`,
  }),

  // ─────────────────────────── U01.6 — Roman numerals ───────────────────────────
  defineTemplate({
    ...addr({ id: 'g5-u01-q13', subtopicId: 'u01-06', difficulty: 1 }),
    prompt: 'ჩაწერე რომაული ციფრებით რიცხვი {n}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['16', '34', '49', '27', '58', '12', '45', '39', '64', '23', '71', '18', '56', '42', '33', '85', '29', '47'],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
      roman: { kind: 'choice', values: (v) => [toRoman(Number(v.n))] },
    },
    answer: (v) => String(v.roman),
    format: { kind: 'text' },
    distractors: (ctx) => romanDistractors(String(ctx.answer)),
    explanation: ({ vars, answer }) => `${vars.n} რომაული ციფრებით არის ${answer}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q14', subtopicId: 'u01-06', difficulty: 1 }),
    prompt: 'ჩაწერე არაბული ციფრებით: {roman}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['XXVII', 'XLVI', 'XXXII', 'XXIX', 'XIV', 'LVIII', 'XCI', 'LXIV', 'XXXVIII', 'XLIX', 'LXXV', 'XVIII', 'XLI', 'XXIII', 'LVI', 'LXXXIV'],
      },
      roman: { kind: 'choice', values: (v) => [String(v.spec)] },
      value: { kind: 'choice', values: (v) => [fromRoman(String(v.roman))] },
    },
    answer: (v) => Number(v.value),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => wrongNumbers(nearMisses(Number(ctx.answer), 3)),
    explanation: ({ vars, answer }) => `${vars.roman} არის ${answer}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q15', subtopicId: 'u01-06', difficulty: 2 }),
    prompt: 'ჩაწერე რომაული ციფრებით რიცხვი {n}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['49', '94', '99', '40', '90', '44', '89', '14', '19', '59', '60', '95', '48', '91', '69', '86'],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
      roman: { kind: 'choice', values: (v) => [toRoman(Number(v.n))] },
    },
    answer: (v) => String(v.roman),
    format: { kind: 'text' },
    distractors: (ctx) => romanDistractors(String(ctx.answer)),
    explanation: ({ vars, answer }) =>
      `მცირე ციფრი დიდის წინ აკლებას ნიშნავს, ამიტომ ${vars.n} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q16', subtopicId: 'u01-06', difficulty: 2 }),
    prompt: 'ჩაწერე არაბული ციფრებით: {roman}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['XLIX', 'XCIV', 'XCIX', 'XL', 'XC', 'XLIV', 'LXXXIX', 'XIV', 'XIX', 'LIX', 'LX', 'XCV', 'XLVIII', 'XCI', 'LXIX', 'LXXXVI'],
      },
      roman: { kind: 'choice', values: (v) => [String(v.spec)] },
      value: { kind: 'choice', values: (v) => [fromRoman(String(v.roman))] },
    },
    answer: (v) => Number(v.value),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => wrongNumbers(nearMisses(Number(ctx.answer), 3)),
    explanation: ({ vars, answer }) =>
      `${vars.roman}: როცა მცირე ციფრი დიდის წინ დგას, ვაკლებთ — ამიტომ ${answer}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q17', subtopicId: 'u01-06', difficulty: 2 }),
    prompt: 'რომელი რიცხვია მეტი: {a} თუ {b}?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'XXXII|XXIX', 'XLVI|XLV', 'XXVII|XXXI', 'XCI|LXXXIX', 'LXIV|LXVIII', 'XLIX|LI', 'LXXV|LXXII', 'XVIII|XXI',
          'XIV|XVI', 'LXXXIII|LXXXII', 'XCIX|XCVIII', 'XXIV|XLII', 'LVI|LVII', 'XXXVIII|XXXVII', 'LXXI|LXVII', 'XII|XXI',
          'XCIV|CIV', 'XXIX|XXXII', 'LXI|LIX', 'XLVIII|LIII',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      bigger: {
        kind: 'choice',
        values: (v) => [fromRoman(String(v.a)) > fromRoman(String(v.b)) ? String(v.a) : String(v.b)],
      },
    },
    optionCount: 2,
    options: (v) => [String(v.a), String(v.b)],
    answer: (v) => String(v.bigger),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `${vars.a} = ${fromRoman(String(vars.a))}, ${vars.b} = ${fromRoman(String(vars.b))}. მეტია ${answer} (${Math.max(fromRoman(String(vars.a)), fromRoman(String(vars.b)))}).`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q18', subtopicId: 'u01-06', difficulty: 3 }),
    prompt: 'ჩამოთვლილთაგან რომელია ყველაზე დიდი: {a}, {b}, {c}, {d}?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'XLV|LIV|XLIV|LXIV', 'XXVII|LXXII|XXXII|LXXIII', 'XC|LXXXIX|XCI|XLIX', 'XXX|L|XL|LX',
          'XCVIII|LXXXIX|XCIV|LXIX', 'XVII|LXXI|XVI|LXI', 'XIV|XLI|IV|XL', 'XXIX|XI|XC|LIX',
          'LVIII|LXXXV|XLVIII|LXXXVIII', 'XX|C|XC|LXXX', 'XIX|IX|XI|XCI', 'XLII|XXIV|LXXIV|XLIV',
          'LXV|LVI|XLVII|LXXIV', 'III|XXX|XIII|XXXIII', 'LXXVIII|LXXXVII|LXVIII|LXXXVI',
          'XXV|LII|V|LV', 'XCVI|LXIX|XCIX|LXVI', 'XII|XXI|II|XXII',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      d: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    options: (v) => [String(v.a), String(v.b), String(v.c), String(v.d)],
    answer: (v) => {
      const all = [String(v.a), String(v.b), String(v.c), String(v.d)];
      return all.reduce((best, cur) => (fromRoman(cur) > fromRoman(best) ? cur : best));
    },
    format: { kind: 'text' },
    explanation: ({ answer }) =>
      `${answer} = ${fromRoman(String(answer))} — ყველაზე დიდი.`,
  }),

  // ─────────────────────────── U01.7 — negative numbers ───────────────────────────
  defineTemplate({
    ...addr({ id: 'g5-u01-q19', subtopicId: 'u01-07', difficulty: 1 }),
    prompt: 'დილით ტემპერატურა იყო −{a}°C, შუადღეს კი {b}°C. რამდენი გრადუსით მოიმატა ტემპერატურამ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['4|3', '7|4', '5|6', '9|2', '3|8', '6|1', '10|5', '8|7', '2|9', '12|3', '6|6', '15|4'],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      rise: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b)] },
    },
    answer: (v) => Number(v.rise),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const { a, b } = ctx.vars as { a: number; b: number };
      return wrongNumbers([...nearMisses(Number(ctx.answer), 3, 1), Math.abs(Number(a) - Number(b))]);
    },
    explanation: ({ vars, answer }) =>
      `−${vars.a}-დან 0-მდე ${vars.a} გრადუსია, შემდეგ კიდევ ${vars.b}: ${vars.a} + ${vars.b} = ${answer} გრადუსი.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q20', subtopicId: 'u01-07', difficulty: 1 }),
    prompt: 'შეადარე რიცხვები: −{a} და −{b}. რომელია ნაკლები?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['7|2', '5|9', '3|8', '11|4', '6|10', '2|12', '8|3', '9|1', '13|6', '4|15', '7|14', '10|2'],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      smaller: { kind: 'choice', values: (v) => [Number(v.a) > Number(v.b) ? `−${v.a}` : `−${v.b}`] },
    },
    optionCount: 2,
    options: (v) => [`−${v.a}`, `−${v.b}`],
    answer: (v) => String(v.smaller),
    format: { kind: 'text' },
    explanation: ({ answer }) =>
      `უარყოფითი რიცხვებიდან ნაკლებია ის, რომლის მოდულიც (${answer.replace('−', '')}) მეტია. ამიტომ ნაკლებია ${answer}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q21', subtopicId: 'u01-07', difficulty: 2 }),
    prompt: 'დაალაგე ზრდადობით: −{a}, {b}, −{c}, 0, {d}. რომელია პირველი?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '5|3|1|6', '8|2|4|7', '3|5|6|2', '9|1|4|8', '6|4|2|9', '7|3|5|1', '2|8|9|4', '11|5|7|3',
          '4|6|8|10', '5|9|12|6', '12|2|3|7', '10|4|8|1', '13|6|2|9', '3|11|7|5', '15|2|8|4',
          '9|12|6|3', '14|5|1|10', '7|8|11|2',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      first: { kind: 'choice', values: (v) => [Number(v.a) > Number(v.c) ? `−${v.a}` : `−${v.c}`] },
    },
    optionCount: 5,
    options: (v) => [`−${v.a}`, `${v.b}`, `−${v.c}`, '0', `${v.d}`],
    answer: (v) => String(v.first),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `ზრდადობით: −${Math.max(Number(vars.a), Number(vars.c))}, −${Math.min(Number(vars.a), Number(vars.c))}, 0, ` +
      `${Math.min(Number(vars.b), Number(vars.d))}, ${Math.max(Number(vars.b), Number(vars.d))}. პირველია ${answer}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q22', subtopicId: 'u01-07', difficulty: 2 }),
    prompt: 'ლიფტი იყო −{a} სართულზე და ავიდა {b} სართულით. რომელ სართულზე აღმოჩნდა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '2|5', '3|4', '5|6', '4|7', '6|3', '1|8', '2|9', '7|5', '3|10', '5|2',
          '4|9', '6|8', '2|12', '5|11', '3|7', '8|13', '1|6', '7|14',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      level: { kind: 'choice', values: (v) => [Number(v.b) - Number(v.a)] },
    },
    answer: (v) => Number(v.level),
    format: { kind: 'integer', format: displayNumber },
    distractors: (ctx) =>
      wrongNumbers(
        [
          Number((ctx.vars as { a: number }).a) + Number((ctx.vars as { b: number }).b),
          -Number((ctx.vars as { a: number }).a),
          Number((ctx.vars as { b: number }).b),
        ].filter((n) => n !== Number(ctx.answer)),
      ),
    explanation: ({ vars, answer }) =>
      `−${vars.a} + ${vars.b} = ${answer}. ლიფტი აღმოჩნდა ${answer}-ე სართულზე.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q23', subtopicId: 'u01-07', difficulty: 2 }),
    prompt: 'იპოვე: −{a} + {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['6|9', '4|11', '7|3', '9|5', '12|8', '5|14', '8|2', '10|16', '3|7', '15|9', '11|4', '13|20'],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      result: { kind: 'choice', values: (v) => [Number(v.b) - Number(v.a)] },
    },
    answer: (v) => Number(v.result),
    format: { kind: 'integer', format: displayNumber },
    distractors: (ctx) => {
      const { a, b } = ctx.vars as { a: number; b: number };
      return wrongNumbers([Number(a) + Number(b), Math.abs(Number(a) - Number(b)), -(Number(a) + Number(b)), -Number(b)].filter(
        (n) => n !== Number(ctx.answer),
      ));
    },
    explanation: ({ vars, answer }) =>
      `−${vars.a} + ${vars.b} = ${vars.b} − ${vars.a} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q24', subtopicId: 'u01-07', difficulty: 3 }),
    prompt: 'იპოვე: {a} − {b}, სადაც {b} > {a}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '4|11', '6|9', '2|13', '8|15', '5|7', '3|12', '9|10', '1|6', '7|18', '14|20',
          '5|16', '3|9', '11|17', '2|8', '10|13', '6|19', '4|7', '12|21',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      result: { kind: 'choice', values: (v) => [Number(v.a) - Number(v.b)] },
    },
    answer: (v) => Number(v.result),
    format: { kind: 'integer', format: displayNumber },
    distractors: (ctx) => {
      const { a, b } = ctx.vars as { a: number; b: number };
      return wrongNumbers([Number(b) - Number(a), Number(a) + Number(b), -(Number(a) + Number(b)), -Number(a)].filter(
        (n) => n !== Number(ctx.answer),
      ));
    },
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = −(${vars.b} − ${vars.a}) = ${answer}.`,
  }),

  // ─────────────────────────── U01.8 — rounding ───────────────────────────
  defineTemplate({
    ...addr({ id: 'g5-u01-q25', subtopicId: 'u01-08', difficulty: 1 }),
    prompt: 'დაამრგვალე {n} ათეულამდე.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['4672', '38451', '267890', '745321', '586742', '92650', '7124', '53908', '180273', '4566', '91037', '624915'],
      },
      raw: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
      n: { kind: 'choice', values: (v) => [group(Number(v.raw))] },
      rounded: { kind: 'choice', values: (v) => [Math.round(Number(v.raw) / 10) * 10] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: (ctx) => {
      const r = Number(ctx.answer);
      return wrongNumbers([r + 10, r - 10, r + 100, r - 100].filter((n) => n >= 0 && n !== r));
    },
    explanation: ({ answer }) =>
      `ბოლო ციფრი წყვეტს: დაახლოებული ათეულია ${group(Number(answer))}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q26', subtopicId: 'u01-08', difficulty: 1 }),
    prompt: 'დაამრგვალე {n} ასეულამდე.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['38451', '4672', '267890', '745321', '586742', '92650', '53908', '7124', '180273', '624915', '91037', '4566'],
      },
      raw: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
      n: { kind: 'choice', values: (v) => [group(Number(v.raw))] },
      rounded: { kind: 'choice', values: (v) => [Math.round(Number(v.raw) / 100) * 100] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: (ctx) => {
      const r = Number(ctx.answer);
      return wrongNumbers([r + 100, r - 100, r + 10, r - 10].filter((n) => n >= 0 && n !== r));
    },
    explanation: ({ answer }) =>
      `ათეულებისა და ერთეულების ციფრები წყვეტს: ${group(Number(answer))}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q27', subtopicId: 'u01-08', difficulty: 1 }),
    prompt: 'დაამრგვალე {n} ათასეულამდე.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '267890', '745321', '586742', '92650', '38451', '180273', '624915', '91037', '4672', '53908',
          '138427', '592016', '47385', '806194', '24773', '915608', '36290', '714352',
        ],
      },
      raw: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
      n: { kind: 'choice', values: (v) => [group(Number(v.raw))] },
      rounded: { kind: 'choice', values: (v) => [Math.round(Number(v.raw) / 1000) * 1000] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: (ctx) => {
      const r = Number(ctx.answer);
      return wrongNumbers([r + 1000, r - 1000, r + 100, r - 100].filter((n) => n >= 0 && n !== r));
    },
    explanation: ({ answer }) =>
      `ასეულების ციფრი წყვეტს: ${group(Number(answer))}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q28', subtopicId: 'u01-08', difficulty: 2 }),
    prompt: 'დაამრგვალე {n} ათიათასეულამდე.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '745321', '267890', '586742', '180273', '624915', '38451', '92650', '91037', '53908', '7124',
          '138427', '592016', '47385', '806194', '24773', '915608', '36290', '714352',
        ],
      },
      raw: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
      n: { kind: 'choice', values: (v) => [group(Number(v.raw))] },
      rounded: { kind: 'choice', values: (v) => [Math.round(Number(v.raw) / 10000) * 10000] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: (ctx) => {
      const r = Number(ctx.answer);
      return wrongNumbers([r + 10000, r - 10000, r + 1000, r - 1000].filter((n) => n >= 0 && n !== r));
    },
    explanation: ({ answer }) =>
      `ათასეულების ციფრი წყვეტს: ${group(Number(answer))}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q29', subtopicId: 'u01-08', difficulty: 2 }),
    prompt: 'დაამრგვალე {n} ასეულ ათასეულამდე.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '586742', '745321', '267890', '180273', '624915', '38451', '92650', '91037',
          '138427', '592016', '806194', '247730', '915608', '362904', '714352', '461085',
          '293771', '659840',
        ],
      },
      raw: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
      n: { kind: 'choice', values: (v) => [group(Number(v.raw))] },
      rounded: { kind: 'choice', values: (v) => [Math.round(Number(v.raw) / 100000) * 100000] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: (ctx) => {
      const r = Number(ctx.answer);
      return wrongNumbers([r + 100000, r - 100000, r + 10000, r - 10000].filter((n) => n >= 0 && n !== r));
    },
    explanation: ({ answer }) =>
      `ათიათასეულების ციფრი წყვეტს: ${group(Number(answer))}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q30', subtopicId: 'u01-08', difficulty: 3 }),
    prompt: 'დაამრგვალე {n} ასეულ ათასეულამდე.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '92650', '7124', '4566', '53908', '91037', '38451', '180273', '624915', '267890', '745321', '586742', '4672',
          '13842', '59201', '473850', '80619', '247736', '91560',
        ],
      },
      raw: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
      n: { kind: 'choice', values: (v) => [group(Number(v.raw))] },
      rounded: { kind: 'choice', values: (v) => [Math.round(Number(v.raw) / 100000) * 100000] },
    },
    answer: (v) => Number(v.rounded),
    format: { kind: 'integer', min: 0 },
    distractors: (ctx) => {
      const r = Number(ctx.answer);
      return wrongNumbers([r + 100000, r - 100000, r + 10000, r - 10000].filter((n) => n >= 0 && n !== r));
    },
    explanation: ({ answer }) =>
      `ათიათასეულების ციფრი წყვეტს: ${group(Number(answer))}.`,
  }),

  // ─────────────────────────── U01.9 — even/odd and powers of ten ───────────────────────────
  defineTemplate({
    ...addr({ id: 'g5-u01-q31', subtopicId: 'u01-09', difficulty: 1 }),
    prompt: 'განსაზღვრე, ლუწია თუ კენტია რიცხვი {n}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '7438', '15627', '24680', '9371', '50004', '31957', '12006', '88883', '64012', '4739',
          '90210', '55555', '70316', '28495', '60008', '13742', '91563', '48020', '33219', '87654',
        ],
      },
      n: { kind: 'choice', values: (v) => [group(Number(String(v.spec)))] },
      raw: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
      parity: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
    },
    optionCount: 2,
    options: () => ['ლუწი', 'კენტი'],
    answer: (v) => (Number(v.parity) % 2 === 0 ? 'ლუწი' : 'კენტი'),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `ბოლო ციფრია ${String(vars.raw).slice(-1)}. ${answer === 'ლუწი' ? 'ლუწი რიცხვი 2-ზე იყოფა.' : 'კენტი რიცხვი 2-ზე უნაშთოდ არ იყოფა.'}`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q32', subtopicId: 'u01-09', difficulty: 1 }),
    prompt: 'განსაზღვრე, ლუწია თუ კენტია რიცხვი {n}.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '8734', '22221', '100003', '70010', '4915', '36002', '1588', '99997',
          '42039', '61394', '20517', '78430', '91806', '36571', '54028', '19954',
        ],
      },
      n: { kind: 'choice', values: (v) => [group(Number(String(v.spec)))] },
      raw: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
      parity: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
    },
    optionCount: 2,
    options: () => ['ლუწი', 'კენტი'],
    answer: (v) => (Number(v.parity) % 2 === 0 ? 'ლუწი' : 'კენტი'),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `ბოლო ციფრია ${String(vars.raw).slice(-1)}, ამიტომ რიცხვი ${answer}-ა.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q33', subtopicId: 'u01-09', difficulty: 2 }),
    prompt: 'გამოთვალე: {power}.',
    variables: {
      k: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      power: { kind: 'choice', values: (v) => [powerText(10, Number(v.k))] },
      value: { kind: 'choice', values: (v) => [10 ** Number(v.k)] },
      shown: { kind: 'choice', values: (v) => [group(Number(v.value))] },
    },
    answer: (v) => Number(v.value),
    format: { kind: 'integer', min: 10 },
    distractors: (ctx) => {
      const v = Number(ctx.answer);
      return wrongNumbers([v / 10, v * 10, v / 2, v + 10].filter((n) => Number.isInteger(n) && n > 0 && n !== v));
    },
    explanation: ({ vars, answer }) =>
      `${vars.power} — ერთიანს ${vars.k} ნული მოსდევს: ${group(Number(answer))}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q34', subtopicId: 'u01-09', difficulty: 2 }),
    prompt: 'რამდენი ნულია რიცხვში {power}?',
    variables: {
      k: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      power: { kind: 'choice', values: (v) => [powerText(10, Number(v.k))] },
    },
    answer: (v) => Number(v.k),
    format: { kind: 'integer', min: 2 },
    distractors: (ctx) => {
      const k = Number(ctx.answer);
      return wrongNumbers([k - 1, k + 1, k + 2].filter((n) => n > 0));
    },
    explanation: ({ vars, answer }) =>
      `${vars.power} — ათის ხარისხი, ამიტომ ნულების რაოდენობა ${answer}-ია.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q35', subtopicId: 'u01-09', difficulty: 2 }),
    prompt: 'დაწერე რიცხვი ხარისხის სახით: 10-ის {k}-ე ხარისხი.',
    variables: {
      k: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      power: { kind: 'choice', values: (v) => [powerText(10, Number(v.k))] },
      value: { kind: 'choice', values: (v) => [10 ** Number(v.k)] },
      shown: { kind: 'choice', values: (v) => [group(Number(v.value))] },
    },
    answer: (v) => Number(v.value),
    format: { kind: 'integer', min: 10 },
    distractors: (ctx) => {
      const v = Number(ctx.answer);
      return wrongNumbers([v / 10, v * 10, v / 2, v * 2].filter((n) => Number.isInteger(n) && n > 0 && n !== v));
    },
    explanation: ({ vars, answer }) => `${vars.power} = ${group(Number(answer))}.`,
  }),

  defineTemplate({
    ...addr({ id: 'g5-u01-q36', subtopicId: 'u01-09', difficulty: 3 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {power} = 10 × ____.',
    variables: {
      k: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      power: { kind: 'choice', values: (v) => [powerText(10, Number(v.k))] },
      prev: { kind: 'choice', values: (v) => [10 ** (Number(v.k) - 1)] },
      shown: { kind: 'choice', values: (v) => [group(Number(v.prev))] },
    },
    answer: (v) => Number(v.prev),
    format: { kind: 'integer', min: 10 },
    distractors: (ctx) => {
      const v = Number(ctx.answer);
      return wrongNumbers([v * 10, v / 10, v + 10, v * 2].filter((n) => Number.isInteger(n) && n >= 1 && n !== v));
    },
    explanation: ({ vars, answer }) =>
      `${vars.power} = 10 × ${powerText(10, Number(vars.k) - 1)} = 10 × ${group(Number(answer))}.`,
  }),
];

/** 1–3999 in Roman numerals, subtraction form as the bank writes it (XLIX, XCIV). */
export function toRoman(n: number): string {
  const table: Array<[number, string]> = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let rest = n;
  let out = '';
  for (const [value, numeral] of table) {
    while (rest >= value) {
      out += numeral;
      rest -= value;
    }
  }
  return out;
}

/** Numeric value of a Roman numeral, read left to right with subtraction. */
export function fromRoman(roman: string): number {
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < roman.length; i += 1) {
    const cur = map[roman[i]] ?? 0;
    const next = map[roman[i + 1]] ?? 0;
    total += cur < next ? -cur : cur;
  }
  return total;
}

/** Wrong Roman numerals: a swap, a wrong subtraction, and a near neighbour. */
export function romanDistractors(answer: string): string[] {
  const value = fromRoman(answer);
  const out: string[] = [];
  if (answer.length > 1) out.push(answer[1] + answer[0] + answer.slice(2));
  out.push(toRoman(value - 1), toRoman(value + 1), toRoman(value + 10));
  return out.filter((candidate, index) => candidate !== answer && out.indexOf(candidate) === index);
}
