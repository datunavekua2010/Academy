import { defineTemplate } from './types';

/**
 * SAMPLE templates only.
 *
 * These exist so the generator can be exercised end to end and so the expected
 * shape is obvious. They are deliberately few — the real curriculum templates
 * are supplied by the academy and can be dropped into `catalog.ts` without
 * touching the UI, the session engine or the scoring engine.
 *
 * Each one demonstrates a different capability of the template model:
 *   • plain integer ranges
 *   • dependent bounds (a divisor drawn from the dividend, so the result is whole)
 *   • constraints (answer must stay positive)
 *   • choice variables (operator, unit names)
 *   • text answers (fractions)
 *   • decimal answers with rounding
 *   • custom, pedagogically sensible distractors
 */

export const SAMPLE_TEMPLATES = [
  // --------------------------------------------------------------- samples
  defineTemplate({
    id: 'g2-times-table',
    grade: 3,
    topicId: 'g3-gamravleba',
    unitId: 'g3-gamravleba',
    subtopicId: 'u04-full-table',
    prompt: '{a} × {b} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      b: { kind: 'int', min: 2, max: 10 },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer', min: 0 },
    explanation: ({ vars, answer }) =>
      `${vars.a} × ${vars.b} = ${answer}: ${vars.a} ჯგუფი ${vars.b}-ად.`,
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [a * b + a, a * b - a, a * b + b, a * b - 1, Math.round(a * b * 0.5)];
    },
  }),

  defineTemplate({
    id: 'g2-meter-cm',
    grade: 2,
    topicId: 'g2-gazomva-geometria',
    unitId: 'g2-gazomva-geometria',
    subtopicId: 'u11-meters-and-centimeters',
    prompt: '{m} მ და {cm} სმ სულ რამდენი სანტიმეტრია?',
    variables: {
      m: { kind: 'int', min: 1, max: 9 },
      cm: { kind: 'choice', values: [0, 5, 10, 15, 20, 25, 30, 40, 50, 60] },
    },
    answer: (v) => Number(v.m) * 100 + Number(v.cm),
    format: { kind: 'integer', min: 0 },
    explanation: ({ vars, answer }) =>
      `1 მ = 100 სმ, ამიტომ ${vars.m} × 100 + ${vars.cm} = ${answer} სმ.`,
    distractors: ({ vars, answer }) => [
      Number(vars.m) * 10 + Number(vars.cm),
      Number(answer) + 10,
      Number(answer) - 10,
      Number(vars.m) + Number(vars.cm),
    ],
  }),

  // -------------------------------------------------------------- grade III
  defineTemplate({
    id: 'g3-divide-exact',
    grade: 3,
    topicId: 'g3-gayofa',
    unitId: 'g3-gayofa',
    subtopicId: 'u05-division-within-10',
    prompt: '{a} ÷ {b} = ?',
    variables: {
      // Draw the divisor first, then build a dividend that divides exactly.
      b: { kind: 'int', min: 2, max: 10 },
      q: { kind: 'int', min: 2, max: 12 },
      a: { kind: 'int', min: (v) => Number(v.b) * Number(v.q), max: (v) => Number(v.b) * Number(v.q) },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: { kind: 'integer', min: 0 },
    explanation: ({ vars, answer }) =>
      `${vars.b} × ${answer} = ${vars.a}, ამიტომ ${vars.a} ÷ ${vars.b} = ${answer}.`,
    distractors: ({ answer, vars }) => {
      const value = Number(answer);
      const b = Number(vars.b);
      return [value + 1, value - 1, value + b, value * b];
    },
  }),

  defineTemplate({
    id: 'g3-perimeter-rect',
    grade: 3,
    topicId: 'g3-gazomva-geometria',
    unitId: 'g3-gazomva-geometria',
    subtopicId: 'u10-perimeter-calculations',
    prompt: 'მართკუთხედის გვერდებია {w} სმ და {h} სმ. პერიმეტრი?',
    hint: 'P = 2 × (სიგრძე + სიგანე)',
    variables: {
      w: { kind: 'int', min: 2, max: 12 },
      h: { kind: 'int', min: 2, max: 12 },
    },
    constraints: [{ test: (v) => v.w !== v.h, note: 'გვერდები განსხვავებული იყოს' }],
    answer: (v) => 2 * (Number(v.w) + Number(v.h)),
    format: { kind: 'integer', min: 0 },
    explanation: ({ vars, answer }) =>
      `P = 2 × (${vars.w} + ${vars.h}) = ${answer} სმ.`,
    distractors: ({ vars }) => {
      const w = Number(vars.w);
      const h = Number(vars.h);
      return [w + h, w * h, 2 * w + h, 2 * (w + h) + 2];
    },
  }),

  // --------------------------------------------------------------- grade IV
  // --------------------------------------------------------------- grade VI


  // -------------------------------------------------------------- grade VII
  defineTemplate({
    id: 'g7-linear-equation',
    grade: 7,
    topicId: 'xazovani',
    unitId: 'u1',
    subtopicId: 'ertucnobiani',
    prompt: 'ამოხსენი: {a}x + {b} = {c}',
    variables: {
      a: { kind: 'int', min: 2, max: 7 },
      x: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 1, max: 12 },
      c: { kind: 'int', min: (v) => Number(v.a) * Number(v.x) + Number(v.b), max: (v) => Number(v.a) * Number(v.x) + Number(v.b) },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    explanation: ({ vars, answer }) =>
      `${vars.a}x = ${vars.c} − ${vars.b} = ${Number(vars.c) - Number(vars.b)}, ამიტომ x = ${answer}.`,
    distractors: ({ answer, vars }) => {
      const value = Number(answer);
      return [value + 1, value - 1, value + Number(vars.a), Number(vars.c) - value];
    },
  }),

  defineTemplate({
    id: 'g7-area-triangle',
    grade: 7,
    topicId: 'geometria',
    unitId: 'u1',
    subtopicId: 'fartobi',
    prompt: 'სამკუთხედის ფუძეა {b} სმ, სიმაღლე — {h} სმ. ფართობი?',
    hint: 'S = ½ × ფუძე × სიმაღლე',
    variables: {
      b: { kind: 'int', min: 2, max: 14, step: 2 },
      h: { kind: 'int', min: 2, max: 12 },
    },
    answer: (v) => 0.5 * Number(v.b) * Number(v.h),
    format: { kind: 'decimal', decimals: 1, min: 0, format: (value) => `${value} სმ²` },
    explanation: ({ vars, answer }) =>
      `S = ½ × ${vars.b} × ${vars.h} = ${answer}.`,
    distractors: ({ vars }) => {
      const b = Number(vars.b);
      const h = Number(vars.h);
      const half = (b * h) / 2;
      return [
        `${half + 1} სმ²`,
        `${half - 1} სმ²`,
        `${half + 2} სმ²`,
        `${b * h} სმ²`,
        `${b + h} სმ²`,
      ];
    },
  }),
];
