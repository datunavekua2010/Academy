import { defineTemplate } from './types';
import type { QuestionTemplate, TemplateConstraint, VariableSpec, Vars } from './types';

/**
 * One template per curriculum subtopic that the showcase templates in
 * `samples.ts` do not cover.
 *
 * These are still *patterns*, not questions: each entry is a few lines of
 * arithmetic that the generator turns into an unlimited number of variations.
 * They exist so every grade → topic → subtopic in the curriculum is playable
 * today. When the academy supplies its own templates, delete this file and
 * swap it in `catalog.ts` — nothing else changes.
 */

interface ArithmeticSpec {
  id: string;
  grade: QuestionTemplate['grade'];
  topicId: string;
  unitId?: string;
  subtopicId: string;
  prompt: string;
  hint?: string;
  variables: Record<string, VariableSpec>;
  constraints?: TemplateConstraint[];
  answer: (vars: Vars) => number;
  explanation: (vars: Vars, answer: string) => string;
  /** Optional answer suffix, e.g. " სმ" or " კმ". */
  unit?: string;
  /** Optional custom wrong answers; the numeric default is used otherwise. */
  mistakes?: (vars: Vars, answer: number) => number[];
}

/** Numeric template with the generator's default distractors. */
const arithmetic = (spec: ArithmeticSpec): QuestionTemplate =>
  defineTemplate({
    id: spec.id,
    grade: spec.grade,
    topicId: spec.topicId,
    unitId: spec.unitId,
    subtopicId: spec.subtopicId,
    prompt: spec.prompt,
    hint: spec.hint,
    variables: spec.variables,
    constraints: spec.constraints,
    answer: spec.answer,
    format: {
      kind: 'integer',
      format: spec.unit ? (value) => `${value}${spec.unit}` : undefined,
    },
    explanation: ({ vars, answer }) => spec.explanation(vars, answer),
    distractors: spec.mistakes
      ? ({ vars, answer }) => spec.mistakes!(vars, Number(answer))
      : undefined,
  });

/** Text template: all four options must be supplied explicitly. */
const textual = (spec: {
  id: string;
  grade: QuestionTemplate['grade'];
  topicId: string;
  unitId?: string;
  subtopicId: string;
  prompt: string;
  hint?: string;
  variables: Record<string, VariableSpec>;
  constraints?: TemplateConstraint[];
  answer: (vars: Vars) => string;
  wrong: (vars: Vars, answer: string) => string[];
  explanation: (vars: Vars, answer: string) => string;
}): QuestionTemplate =>
  defineTemplate({
    id: spec.id,
    grade: spec.grade,
    topicId: spec.topicId,
    unitId: spec.unitId,
    subtopicId: spec.subtopicId,
    prompt: spec.prompt,
    hint: spec.hint,
    variables: spec.variables,
    constraints: spec.constraints,
    answer: spec.answer,
    format: { kind: 'text' },
    explanation: ({ vars, answer }) => spec.explanation(vars, answer),
    distractors: ({ vars, answer }) => spec.wrong(vars, String(answer)),
  });

export const COVERAGE_TEMPLATES: QuestionTemplate[] = [
  // ------------------------------------------------------------ grade IV
  // ------------------------------------------------------------ grade VI
  textual({
    id: 'cov-g6-compare-negatives',
    grade: 6,
    topicId: 'racionaluri',
    unitId: 'u1',
    subtopicId: 'uaryofa',
    prompt: 'რომელი რიცხვია ნაკლები: {a} თუ {b}?',
    hint: 'რიცხვით ღერძზე მარცხენა ნაკლებია.',
    variables: {
      a: { kind: 'choice', values: [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1] },
      b: { kind: 'choice', values: [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, 1, 2, 3] },
    },
    constraints: [{ test: (v) => v.a !== v.b, note: 'რიცხვები განსხვავებული იყოს' }],
    answer: (v) => (Number(v.a) < Number(v.b) ? String(v.a) : String(v.b)),
    wrong: (vars, answer) => {
      const other = String(answer) === String(vars.a) ? String(vars.b) : String(vars.a);
      return [other, String(Number(answer) + 1), String(Number(answer) - 1)];
    },
    explanation: (_vars, answer) => `${answer} უფრო მარცხნივაა რიცხვით ღერძზე.`,
  }),

  arithmetic({
    id: 'cov-g6-discount',
    grade: 6,
    topicId: 'procenti',
    unitId: 'u2',
    subtopicId: 'fasdakleba',
    prompt: 'პროდუქტი ღირს {p} ლარი. ფასდაკლება {d}%. რამდენს გადაიხდი?',
    hint: 'ჯერ იპოვე ფასდაკლების თანხა.',
    variables: {
      d: { kind: 'choice', values: [10, 20, 25, 50] },
      base: { kind: 'int', min: 2, max: 12 },
      p: { kind: 'int', min: (v) => Number(v.base) * 20, max: (v) => Number(v.base) * 20 },
    },
    answer: (v) => Number(v.p) - (Number(v.p) * Number(v.d)) / 100,
    explanation: (vars, answer) =>
      `ფასდაკლება ${(Number(vars.p) * Number(vars.d)) / 100} ლარია, ამიტომ გადაიხდი ${answer} ლარს.`,
    unit: ' ლარი',
  }),

  textual({
    id: 'cov-g6-simplify',
    grade: 6,
    topicId: 'gamartiveba',
    unitId: 'u1',
    subtopicId: 'gamartiveba',
    prompt: 'გაამარტივე: {a}x + {b}x',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v) => `${Number(v.a) + Number(v.b)}x`,
    wrong: (vars, answer) => [
      `${vars.a}x + ${vars.b}`,
      `${Number(vars.a) * Number(vars.b)}x`,
      `${Number(vars.a) + Number(vars.b)}x + 1`,
      `${Number(answer.replace('x', '')) + 1}x`,
    ],
    explanation: (vars, answer) => `მსგავსი წევრები: ${vars.a} + ${vars.b} = ${answer}.`,
  }),

  arithmetic({
    id: 'cov-g6-simple-equation',
    grade: 6,
    topicId: 'gamartiveba',
    unitId: 'u2',
    subtopicId: 'gantoleba',
    prompt: 'ამოხსენი: x + {a} = {b}',
    hint: 'გადაიტანე რიცხვი მეორე მხარეს.',
    variables: {
      x: { kind: 'int', min: 2, max: 20 },
      a: { kind: 'int', min: 2, max: 15 },
      b: { kind: 'int', min: (v) => Number(v.x) + Number(v.a), max: (v) => Number(v.x) + Number(v.a) },
    },
    answer: (v) => Number(v.b) - Number(v.a),
    explanation: (vars, answer) => `x = ${vars.b} − ${vars.a} = ${answer}.`,
  }),

  // ----------------------------------------------------------- grade VII
  arithmetic({
    id: 'cov-g7-sum-difference',
    grade: 7,
    topicId: 'xazovani',
    unitId: 'u2',
    subtopicId: 'amocana',
    prompt: 'ორი რიცხვის ჯამია {s}, სხვაობა — {d}. იპოვე უფრო პატარა რიცხვი.',
    hint: 'ჯამს გამოაკელი სხვაობა და გაყავი ორზე.',
    variables: {
      small: { kind: 'int', min: 2, max: 20 },
      diff: { kind: 'int', min: 2, max: 10 },
      s: { kind: 'int', min: (v) => 2 * Number(v.small) + Number(v.diff), max: (v) => 2 * Number(v.small) + Number(v.diff) },
      d: { kind: 'int', min: (v) => Number(v.diff), max: (v) => Number(v.diff) },
    },
    answer: (v) => (Number(v.s) - Number(v.d)) / 2,
    explanation: (vars, answer) => `(${vars.s} − ${vars.d}) ÷ 2 = ${answer}.`,
  }),

  textual({
    id: 'cov-g7-quadrant',
    grade: 7,
    topicId: 'damokidebuleba',
    unitId: 'u1',
    subtopicId: 'koordinatebi',
    prompt: 'რომელ კვადრატში მდებარეობს წერტილი A({x}; {y})?',
    variables: {
      x: { kind: 'choice', values: [-5, -3, -1, 2, 4, 6] },
      y: { kind: 'choice', values: [-6, -4, -2, 1, 3, 5] },
    },
    answer: (v) => {
      const x = Number(v.x) > 0;
      const y = Number(v.y) > 0;
      if (x && y) return 'I კვადრატი';
      if (!x && y) return 'II კვადრატი';
      if (!x && !y) return 'III კვადრატი';
      return 'IV კვადრატი';
    },
    wrong: (_v, answer) =>
      ['I კვადრატი', 'II კვადრატი', 'III კვადრატი', 'IV კვადრატი'].filter((item) => item !== answer),
    explanation: (vars, answer) =>
      `x ${Number(vars.x) > 0 ? 'დადებითია' : 'უარყოფითია'}, y ${Number(vars.y) > 0 ? 'დადებითია' : 'უარყოფითია'} — ${answer}.`,
  }),

  arithmetic({
    id: 'cov-g7-linear-value',
    grade: 7,
    topicId: 'damokidebuleba',
    unitId: 'u2',
    subtopicId: 'grafiki',
    prompt: 'მოცემულია ფუნქცია y = {k}x + {b}. იპოვე y, როცა x = {x}.',
    variables: {
      k: { kind: 'int', min: 2, max: 6 },
      b: { kind: 'int', min: 1, max: 9 },
      x: { kind: 'int', min: 1, max: 8 },
    },
    answer: (v) => Number(v.k) * Number(v.x) + Number(v.b),
    explanation: (vars, answer) => `${vars.k} × ${vars.x} + ${vars.b} = ${answer}.`,
    mistakes: (vars, answer) => [Number(vars.k) * Number(vars.x), answer + Number(vars.k), answer - 1],
  }),

  arithmetic({
    id: 'cov-g7-volume',
    grade: 7,
    topicId: 'geometria',
    unitId: 'u2',
    subtopicId: 'moculoba',
    prompt: 'მართკუთხა პარალელეპიპედის ზომებია {a} სმ, {b} სმ და {c} სმ. მოცულობა?',
    hint: 'V = სიგრძე × სიგანე × სიმაღლე',
    variables: {
      a: { kind: 'int', min: 2, max: 8 },
      b: { kind: 'int', min: 2, max: 8 },
      c: { kind: 'int', min: 2, max: 8 },
    },
    answer: (v) => Number(v.a) * Number(v.b) * Number(v.c),
    explanation: (vars, answer) => `V = ${vars.a} × ${vars.b} × ${vars.c} = ${answer} სმ³.`,
    unit: ' სმ³',
    mistakes: (vars, answer) => [
      Number(vars.a) * Number(vars.b),
      2 * (Number(vars.a) + Number(vars.b) + Number(vars.c)),
      answer + Number(vars.a) * Number(vars.b),
    ],
  }),
];
