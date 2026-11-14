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
  arithmetic({
    id: 'cov-g4-thousands',
    grade: 4,
    topicId: 'didi-ricxvebi',
    unitId: 'u1',
    subtopicId: 'tanrigi',
    prompt: 'რამდენი ათასეულია {n}-ში?',
    variables: {
      thousands: { kind: 'int', min: 1, max: 9 },
      hundreds: { kind: 'choice', values: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
      n: {
        kind: 'int',
        min: (v) => Number(v.thousands) * 1000 + Number(v.hundreds),
        max: (v) => Number(v.thousands) * 1000 + Number(v.hundreds),
      },
    },
    answer: (v) => Math.floor(Number(v.n) / 1000),
    explanation: (vars, answer) => `${vars.n}-ში ${answer} სრული ათასეულია.`,
  }),

  textual({
    id: 'cov-g4-compare-fractions',
    grade: 4,
    topicId: 'wiladebi',
    unitId: 'u2',
    subtopicId: 'shedareba',
    prompt: 'რომელი წილადია მეტი: {a}/{d} თუ {b}/{d}?',
    hint: 'მნიშვნელები ერთნაირია — შეადარე მრიცხველები.',
    variables: {
      d: { kind: 'int', min: 4, max: 10 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
      b: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
    },
    constraints: [{ test: (v) => v.a !== v.b, note: 'მრიცხველები განსხვავებული იყოს' }],
    answer: (v) => (Number(v.a) > Number(v.b) ? `${v.a}/${v.d}` : `${v.b}/${v.d}`),
    wrong: (vars, answer) => {
      const d = Number(vars.d);
      const other = String(answer) === `${vars.a}/${d}` ? `${vars.b}/${d}` : `${vars.a}/${d}`;
      return [other, `${Number(vars.a) + Number(vars.b)}/${d}`, `${Math.max(Number(vars.a), Number(vars.b))}/${d + 1}`];
    },
    explanation: (_vars, answer) => `${answer} უფრო დიდია, რადგან მისი მრიცხველი მეტია.`,
  }),

  arithmetic({
    id: 'cov-g4-speed',
    grade: 4,
    topicId: 'mozraoba',
    unitId: 'u1',
    subtopicId: 'sichqare',
    prompt: 'ავტობუსმა {d} კმ გაიარა {t} საათში. რა იყო მისი სიჩქარე?',
    hint: 'v = მანძილი ÷ დრო',
    variables: {
      t: { kind: 'int', min: 2, max: 6 },
      v: { kind: 'int', min: 10, max: 25 },
      d: { kind: 'int', min: (v) => Number(v.t) * Number(v.v), max: (v) => Number(v.t) * Number(v.v) },
    },
    answer: (v) => Number(v.d) / Number(v.t),
    explanation: (vars, answer) => `${vars.d} ÷ ${vars.t} = ${answer} კმ/სთ.`,
    unit: ' კმ/სთ',
  }),

  arithmetic({
    id: 'cov-g4-distance',
    grade: 4,
    topicId: 'mozraoba',
    unitId: 'u2',
    subtopicId: 'mandzili',
    prompt: 'მატარებელი {v} კმ/სთ სიჩქარით მოძრაობს {t} საათის განმავლობაში. რა მანძილს გაივლის?',
    hint: 's = სიჩქარე × დრო',
    variables: {
      v: { kind: 'int', min: 5, max: 45, step: 5 },
      t: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v) => Number(v.v) * Number(v.t),
    explanation: (vars, answer) => `${vars.v} × ${vars.t} = ${answer} კმ.`,
    unit: ' კმ',
  }),

  // ------------------------------------------------------------- grade V
  textual({
    id: 'cov-g5-mixed-number',
    grade: 5,
    topicId: 'wiladebi',
    unitId: 'u2',
    subtopicId: 'sereuli',
    prompt: 'გადააქციე შერეული რიცხვი {w} {a}/{d} არასწორ წილადად.',
    hint: 'მთელი ნაწილი გაამრავლე მნიშვნელზე და მიუმატე მრიცხველი.',
    variables: {
      w: { kind: 'int', min: 1, max: 4 },
      d: { kind: 'int', min: 2, max: 6 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
    },
    answer: (v) => `${Number(v.w) * Number(v.d) + Number(v.a)}/${v.d}`,
    wrong: (vars) => {
      const d = Number(vars.d);
      const numerator = Number(vars.w) * d + Number(vars.a);
      return [`${numerator + 1}/${d}`, `${numerator - 1}/${d}`, `${Number(vars.w) + Number(vars.a)}/${d}`];
    },
    explanation: (vars, answer) =>
      `${vars.w} × ${vars.d} + ${vars.a} = ${Number(vars.w) * Number(vars.d) + Number(vars.a)}, ამიტომ ${answer}.`,
  }),

  arithmetic({
    id: 'cov-g5-scale',
    grade: 5,
    topicId: 'proporciebi',
    unitId: 'u1',
    subtopicId: 'masStabi',
    prompt: 'რუკის მასშტაბი: 1 სმ = {k} კმ. რამდენი კმ-ია {x} სმ?',
    variables: {
      k: { kind: 'choice', values: [5, 10, 15, 20, 25, 50, 100] },
      x: { kind: 'int', min: 2, max: 12 },
    },
    answer: (v) => Number(v.k) * Number(v.x),
    explanation: (vars, answer) => `${vars.x} × ${vars.k} = ${answer} კმ.`,
    unit: ' კმ',
  }),

  arithmetic({
    id: 'cov-g5-three-rule',
    grade: 5,
    topicId: 'proporciebi',
    unitId: 'u2',
    subtopicId: 'sami',
    prompt: '{a} რვეული ღირს {p} ლარი. რა ღირს {b} ასეთი რვეული?',
    hint: 'ჯერ იპოვე ერთი რვეულის ფასი.',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      unitPrice: { kind: 'int', min: 2, max: 9 },
      multiplier: { kind: 'int', min: 2, max: 5 },
      p: { kind: 'int', min: (v) => Number(v.a) * Number(v.unitPrice), max: (v) => Number(v.a) * Number(v.unitPrice) },
      b: { kind: 'int', min: (v) => Number(v.a) * Number(v.multiplier), max: (v) => Number(v.a) * Number(v.multiplier) },
    },
    answer: (v) => Number(v.b) * Number(v.unitPrice),
    explanation: (vars, answer) =>
      `ერთი რვეულია ${vars.p} ÷ ${vars.a} = ${vars.unitPrice} ლარი, ამიტომ ${vars.b} × ${vars.unitPrice} = ${answer} ლარი.`,
    unit: ' ლარი',
  }),

  textual({
    id: 'cov-g5-angle-type',
    grade: 5,
    topicId: 'kuTxeebi',
    unitId: 'u1',
    subtopicId: 'kuTxe',
    prompt: '{deg}°-იანი კუთხე როგორია?',
    variables: { deg: { kind: 'int', min: 10, max: 170, step: 1 } },
    constraints: [{ test: (v) => Number(v.deg) !== 90, note: 'მართი კუთხე ცალკე შაბლონია' }],
    answer: (v) => (Number(v.deg) < 90 ? 'მახვილი' : 'ბლაგვი'),
    wrong: (_v, answer) => ['მახვილი', 'მართი', 'ბლაგვი', 'გაშლილი'].filter((item) => item !== answer),
    explanation: (_vars, answer) => `90°-ზე ნაკლებია მახვილი, მეტი — ბლაგვი, ამიტომ ${answer}.`,
  }),

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
