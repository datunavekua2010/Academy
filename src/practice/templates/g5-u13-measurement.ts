import type { QuestionTemplate } from './types';
import { RELATION_OPTIONS, bank, fourOptions, group, relation, rowNumbers } from './g5-helpers';

/**
 * Grade V — Unit 13: საზომი ერთეულები და მასშტაბი (units and scale).
 *
 * Converted from the academy's `U13` bank (8 subtopics × 6 questions). Every
 * quantity is carried as a whole number of the *smallest* unit in play
 * (millimetres, grams, millilitres, square centimetres) so conversions never
 * pick up rounding, and only the final answer is rendered as a mixed unit
 * ("3 მ 45 სმ").
 */

export const G5_U13_SUBTOPICS = [
  'u13-01',
  'u13-02',
  'u13-03',
  'u13-04',
  'u13-05',
  'u13-06',
  'u13-07',
  'u13-08',
] as const;

export type G5U13SubtopicId = (typeof G5_U13_SUBTOPICS)[number];

const TOPIC = 'g5-measurement-scale';

const at = (row: unknown, index: number): number => rowNumbers(row)[index]!;

/** Render whole centimetres as metres, keeping a two-place decimal. */
const mFromCm = (cm: number): string => {
  const whole = Math.floor(cm / 100);
  const rest = cm % 100;
  if (rest === 0) return `${group(whole)} მ`;
  return `${whole} მ ${rest} სმ`;
};

/** Render whole grams as kilograms. */
const kgFromG = (g: number): string => {
  const whole = Math.floor(g / 1000);
  const rest = g % 1000;
  return rest === 0 ? `${group(whole)} კგ` : `${whole} კგ ${rest} გ`;
};

/** Render whole millilitres as litres. */
const lFromMl = (ml: number): string => {
  const whole = Math.floor(ml / 1000);
  const rest = ml % 1000;
  return rest === 0 ? `${group(whole)} ლ` : `${whole} ლ ${rest} მლ`;
};

export const G5_U13_TEMPLATES: QuestionTemplate[] = [
  // ───────────── U13.1 — მასისა და სიგრძის გადაყვანა ─────────────
  bank({
    id: 'g5-u13-q01',
    subtopicId: 'u13-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'რამდენი სანტიმეტრია {m} მეტრში?',
    variables: {
      tenths: { kind: 'choice', values: '15|25|35|45|55|65|75|85|95|12|24|36|48|56|64|72|18|42'.split('|') },
      m: { kind: 'choice', values: (v) => [`${Number(String(v.tenths)) / 10}`.replace('.', ',')] },
      cm: { kind: 'choice', values: (v) => [String(Number(String(v.tenths)) * 10)] },
    },
    answer: (v) => Number(v.cm),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer * 10, answer / 10, answer + 100, answer - 10 > 0 ? answer - 10 : answer + 50].map(String);
    },
    explain: ({ vars, answer }) => `1 მ = 100 სმ, ამიტომ ${vars.m} მ × 100 = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u13-q02',
    subtopicId: 'u13-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'რამდენი მილიმეტრია {m} სანტიმეტრში?',
    variables: {
      tenths: { kind: 'choice', values: '12|23|34|45|56|67|78|89|18|27|36|48|57|66|75|84|93|29'.split('|') },
      m: { kind: 'choice', values: (v) => [`${Number(String(v.tenths)) / 10}`.replace('.', ',')] },
      mm: { kind: 'choice', values: (v) => [String(Number(String(v.tenths)))] },
      mm10: { kind: 'choice', values: (v) => [String(Number(String(v.tenths)) * 10)] },
    },
    answer: (v) => Number(v.mm10),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer * 10, answer / 10, answer + 10, answer - 10 > 0 ? answer - 10 : answer + 20].map(String);
    },
    explain: ({ vars, answer }) => `1 სმ = 10 მმ, ამიტომ ${vars.m} სმ × 10 = ${answer} მმ.`,
  }),
  bank({
    id: 'g5-u13-q03',
    subtopicId: 'u13-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი მეტრია {mm} სანტიმეტრი?',
    variables: {
      spec: { kind: 'choice', values: ['2500|25', '3200|32', '4500|45', '1800|18', '6400|64', '7500|75', '1200|12', '8800|88', '5500|55', '9600|96', '3300|33', '4200|42'] },
      mm: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
      mmv: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      mv: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.mv),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer * 10, answer / 10, answer + 5, answer - 2 > 0 ? answer - 2 : answer + 8].map(String);
    },
    explain: ({ vars, answer }) => `100 სმ = 1 მ, ამიტომ ${vars.mm} ÷ 100 = ${answer} მ.`,
  }),
  bank({
    id: 'g5-u13-q04',
    subtopicId: 'u13-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი გრამია {kg} კილოგრამში?',
    variables: {
      spec: { kind: 'choice', values: ['3,5|3500', '2,4|2400', '1,5|1500', '4,2|4200', '0,5|500', '2,25|2250', '6,5|6500', '7,5|7500', '1,25|1250', '3,75|3750', '0,8|800', '5,5|5500'] },
      kg: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      g: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.g),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer * 10, answer / 10, answer + 500, answer - 200 > 0 ? answer - 200 : answer + 300].map(String);
    },
    explain: ({ vars, answer }) => `1 კგ = 1000 გ, ამიტომ ${vars.kg} კგ × 1000 = ${answer} გ.`,
  }),
  bank({
    id: 'g5-u13-q05',
    subtopicId: 'u13-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი კილოგრამია {g} გრამი?',
    variables: {
      spec: { kind: 'choice', values: ['4250|4,25', '3800|3,8', '7500|7,5', '6250|6,25', '2400|2,4', '9500|9,5', '5600|5,6', '1250|1,25', '8800|8,8', '4750|4,75', '6250|6,25', '3250|3,25', '7800|7,8', '5400|5,4'] },
      g: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
      gv: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      kgv: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
    },
    answer: (v) => String(v.kgv),
    format: { kind: 'text' },
    options: (v) => fourOptions(String(v.kgv), [
      `${Number(v.gv) / 100}`.replace('.', ','),
      `${Number(v.gv) / 10000}`.replace('.', ','),
      `${Number(String(v.kgv).replace(',', '.')) * 10}`.replace('.', ','),
    ]),
    explain: ({ vars, answer }) => `1000 გ = 1 კგ, ამიტომ ${vars.g} ÷ 1000 = ${answer} კგ.`,
  }),
  bank({
    id: 'g5-u13-q06',
    subtopicId: 'u13-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი მილიმეტრია {m} მეტრში?',
    variables: {
      spec: { kind: 'choice', values: ['2,4|2400', '3,2|3200', '1,5|1500', '4,6|4600', '0,5|500', '5,5|5500', '2,8|2800', '3,75|3750', '1,2|1200', '7,5|7500', '6,4|6400', '0,75|750', '4,25|4250', '9,5|9500'] },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      mm: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.mm),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer * 10, answer / 10, answer + 1000, answer - 400 > 0 ? answer - 400 : answer + 600].map(String);
    },
    explain: ({ vars, answer }) => `1 მ = 1000 მმ, ამიტომ ${vars.m} მ × 1000 = ${answer} მმ.`,
  }),

  // ───────────── U13.2 — ფართობისა და მოცულობის გადაყვანა ─────────────
  bank({
    id: 'g5-u13-q07',
    subtopicId: 'u13-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი კვადრატული სანტიმეტრია {a} კვადრატულ დეციმეტრში?',
    variables: {
      spec: { kind: 'choice', values: ['3|300', '5|500', '2|200', '7|700', '4|400', '9|900', '6|600', '8|800', '1|100', '12|1200', '11|1100', '15|1500', '14|1400', '13|1300'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      s: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.s),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer * 10, answer / 10, answer + 100, answer + 50].map(String);
    },
    explain: ({ vars, answer }) => `1 დმ² = 100 სმ², ამიტომ ${vars.a} დმ² × 100 = ${answer} სმ².`,
  }),
  bank({
    id: 'g5-u13-q08',
    subtopicId: 'u13-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი კვადრატული სანტიმეტრია {a} კვადრატულ მეტრში?',
    variables: {
      spec: { kind: 'choice', values: ['5|50000', '2|20000', '4|40000', '3|30000', '6|60000', '8|80000', '7|70000', '9|90000', '1|10000', '10|100000', '12|120000', '11|110000', '15|150000', '14|140000'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      s: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.s),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer * 10, answer / 10, answer + 10000, answer / 100].map(String);
    },
    explain: ({ vars, answer }) => `1 მ² = 10 000 სმ², ამიტომ ${vars.a} მ² × 10 000 = ${group(Number(answer))} სმ².`,
  }),
  bank({
    id: 'g5-u13-q09',
    subtopicId: 'u13-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი მილილიტრია {l} ლიტრში?',
    variables: {
      spec: { kind: 'choice', values: ['2,5|2500', '1,5|1500', '3,5|3500', '0,5|500', '4,5|4500', '2,25|2250', '0,75|750', '1,25|1250', '5,5|5500', '0,25|250', '3,25|3250', '6,5|6500', '1,75|1750', '4,25|4250'] },
      l: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      m: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.m),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer * 10, answer / 10, answer + 500, answer - 250 > 0 ? answer - 250 : answer + 750].map(String);
    },
    explain: ({ vars, answer }) => `1 ლ = 1000 მლ, ამიტომ ${vars.l} ლ × 1000 = ${answer} მლ.`,
  }),
  bank({
    id: 'g5-u13-q10',
    subtopicId: 'u13-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი ლიტრია {ml} მილილიტრი?',
    variables: {
      spec: { kind: 'choice', values: ['3500|3,5', '2500|2,5', '4500|4,5', '1250|1,25', '7500|7,5', '2250|2,25', '500|0,5', '8750|8,75', '6000|6', '1500|1,5', '3250|3,25', '6750|6,75', '4250|4,25', '2750|2,75'] },
      ml: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
      mlv: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      lv: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
    },
    answer: (v) => String(v.lv),
    format: { kind: 'text' },
    options: (v) => fourOptions(String(v.lv), [
      `${Number(v.mlv) / 100}`.replace('.', ','),
      `${Number(v.mlv) / 10000}`.replace('.', ','),
      `${Number(String(v.lv).replace(',', '.')) * 10}`.replace('.', ','),
    ]),
    explain: ({ vars, answer }) => `1000 მლ = 1 ლ, ამიტომ ${vars.ml} ÷ 1000 = ${answer} ლ.`,
  }),
  bank({
    id: 'g5-u13-q11',
    subtopicId: 'u13-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი კუბური სანტიმეტრია {a} კუბურ დეციმეტრში?',
    variables: {
      spec: { kind: 'choice', values: ['2|2000', '3|3000', '4|4000', '5|5000', '6|6000', '7|7000', '8|8000', '9|9000', '1|1000', '10|10000', '11|11000', '12|12000', '15|15000', '20|20000'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      s: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.s),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer * 10, answer / 10, answer + 500, answer + 1000].map(String);
    },
    explain: ({ vars, answer }) => `1 დმ³ = 1000 სმ³, ამიტომ ${vars.a} დმ³ × 1000 = ${answer} სმ³.`,
  }),

  // ───────────── U13.3 — ერთეულებით შეკრება და გამოკლება ─────────────
  bank({
    id: 'g5-u13-q12',
    subtopicId: 'u13-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a} მ {b} სმ + {c} მ {d} სმ',
    variables: {
      spec: { kind: 'choice', values: ['3|45|2|30', '5|20|1|95', '4|60|3|25', '2|80|4|40', '6|15|2|55', '7|35|1|70', '3|90|2|45', '8|25|3|60', '1|55|4|30', '5|75|2|65', '2|15|6|40', '4|5|3|85', '9|10|1|20', '7|55|2|5'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => mFromCm((Number(v.a) * 100 + Number(v.b)) + (Number(v.c) * 100 + Number(v.d))),
    format: { kind: 'text' },
    options: (v) => {
      const total = Number(v.a) * 100 + Number(v.b) + (Number(v.c) * 100 + Number(v.d));
      return fourOptions(mFromCm(total), [
        mFromCm(total + 100),
        mFromCm(total - 100),
        mFromCm(total + 10),
      ]);
    },
    explain: ({ vars, answer }) =>
      `სანტიმეტრებში: ${Number(vars.a) * 100 + Number(vars.b)} + ${Number(vars.c) * 100 + Number(vars.d)} = ${Number(vars.a) * 100 + Number(vars.b) + Number(vars.c) * 100 + Number(vars.d)} სმ = ${answer}.`,
  }),
  bank({
    id: 'g5-u13-q13',
    subtopicId: 'u13-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a} მ {b} სმ − {c} მ {d} სმ',
    variables: {
      spec: { kind: 'choice', values: ['7|25|3|80', '9|50|4|75', '8|40|2|95', '6|15|1|60', '5|90|3|25', '9|10|4|85', '7|60|2|75', '8|05|3|50', '6|45|2|90', '5|70|1|95', '9|95|2|10', '8|70|1|25', '7|15|3|40', '6|80|2|5'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => mFromCm((Number(v.a) * 100 + Number(v.b)) - (Number(v.c) * 100 + Number(v.d))),
    format: { kind: 'text' },
    options: (v) => {
      const diff = Number(v.a) * 100 + Number(v.b) - (Number(v.c) * 100 + Number(v.d));
      return fourOptions(mFromCm(diff), [mFromCm(diff + 100), mFromCm(diff - 100 > 0 ? diff - 100 : diff + 200), mFromCm(diff + 10)]);
    },
    explain: ({ vars, answer }) =>
      `სანტიმეტრებში: ${Number(vars.a) * 100 + Number(vars.b)} − ${Number(vars.c) * 100 + Number(vars.d)} = ${Number(vars.a) * 100 + Number(vars.b) - (Number(vars.c) * 100 + Number(vars.d))} სმ = ${answer}.`,
  }),
  bank({
    id: 'g5-u13-q14',
    subtopicId: 'u13-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a} კგ {b} გ + {c} კგ {d} გ',
    variables: {
      spec: { kind: 'choice', values: ['4|350|2|800', '3|250|1|900', '5|600|2|750', '2|150|4|450', '6|400|1|850', '7|250|2|300', '3|700|3|550', '5|100|2|950', '4|550|1|600', '2|800|5|350', '6|150|3|400', '1|900|4|250', '8|50|2|475', '3|350|5|700'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => kgFromG(Number(v.a) * 1000 + Number(v.b) + Number(v.c) * 1000 + Number(v.d)),
    format: { kind: 'text' },
    options: (v) => {
      const total = Number(v.a) * 1000 + Number(v.b) + Number(v.c) * 1000 + Number(v.d);
      return fourOptions(kgFromG(total), [kgFromG(total + 1000), kgFromG(total + 100), kgFromG(total - 500 > 0 ? total - 500 : total + 700)]);
    },
    explain: ({ vars, answer }) =>
      `გრამებში: ${Number(vars.a) * 1000 + Number(vars.b)} + ${Number(vars.c) * 1000 + Number(vars.d)} = ${Number(vars.a) * 1000 + Number(vars.b) + Number(vars.c) * 1000 + Number(vars.d)} გ = ${answer}.`,
  }),
  bank({
    id: 'g5-u13-q15',
    subtopicId: 'u13-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a} ლ {b} მლ − {c} ლ {d} მლ',
    variables: {
      spec: { kind: 'choice', values: ['9|200|4|750', '8|500|3|250', '7|100|2|850', '6|750|1|900', '9|050|5|300', '8|250|2|600', '7|600|4|150', '6|300|1|450', '9|900|3|100', '8|750|2|400', '7|250|1|600', '6|500|4|200', '9|450|5|850', '8|100|3|750'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => lFromMl(Number(v.a) * 1000 + Number(v.b) - (Number(v.c) * 1000 + Number(v.d))),
    format: { kind: 'text' },
    options: (v) => {
      const diff = Number(v.a) * 1000 + Number(v.b) - (Number(v.c) * 1000 + Number(v.d));
      return fourOptions(lFromMl(diff), [lFromMl(diff + 1000), lFromMl(diff - 500 > 0 ? diff - 500 : diff + 1500), lFromMl(diff + 100)]);
    },
    explain: ({ vars, answer }) =>
      `მილილიტრებში: ${Number(vars.a) * 1000 + Number(vars.b)} − ${Number(vars.c) * 1000 + Number(vars.d)} = ${Number(vars.a) * 1000 + Number(vars.b) - (Number(vars.c) * 1000 + Number(vars.d))} მლ = ${answer}.`,
  }),
  bank({
    id: 'g5-u13-q16',
    subtopicId: 'u13-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a} კგ {b} გ − {c} კგ {d} გ',
    variables: {
      spec: { kind: 'choice', values: ['6|100|2|650', '5|200|1|800', '7|400|3|750', '4|500|2|900', '8|300|3|550', '6|750|2|250', '9|400|4|650', '7|800|3|200', '5|650|1|400', '8|900|2|500', '9|250|5|700', '6|350|4|150'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => kgFromG(Number(v.a) * 1000 + Number(v.b) - (Number(v.c) * 1000 + Number(v.d))),
    format: { kind: 'text' },
    options: (v) => {
      const diff = Number(v.a) * 1000 + Number(v.b) - (Number(v.c) * 1000 + Number(v.d));
      return fourOptions(kgFromG(diff), [kgFromG(diff + 1000), kgFromG(diff + 100), kgFromG(diff - 200 > 0 ? diff - 200 : diff + 300)]);
    },
    explain: ({ vars, answer }) =>
      `გრამებში: ${Number(vars.a) * 1000 + Number(vars.b)} − ${Number(vars.c) * 1000 + Number(vars.d)} = ${answer}.`,
  }),

  // ───────────── U13.4 — ერთეულების შედარება ─────────────
  bank({
    id: 'g5-u13-q17',
    subtopicId: 'u13-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეადარე: {a} სმ ___ {b} მ',
    variables: {
      spec: { kind: 'choice', values: ['350|3,5', '240|2,4', '180|1,8', '425|4,25', '300|3', '275|2,75', '90|0,9', '115|1,15', '460|4,6', '225|2,25', '510|5,1', '340|3,4', '680|6,8', '155|1,55'] },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      av: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      bv: { kind: 'choice', values: (v) => [Math.round(Number(String(v.spec).split('|')[1]!.replace(',', '.')) * 100)] },
    },
    answer: (v) => relation(Number(v.av), Number(v.bv)),
    optionCount: 3,
    options: () => RELATION_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => `${vars.b} მ = ${vars.bv} სმ, ამიტომ ${vars.a} ${answer} ${vars.bv}.`,
  }),
  bank({
    id: 'g5-u13-q18',
    subtopicId: 'u13-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეადარე: {a} კგ ___ {b} გ',
    variables: {
      spec: { kind: 'choice', values: ['2,4|2350', '1,5|1500', '3,2|3200', '0,9|950', '2,25|2200', '4,5|4500', '1,8|1850', '3,75|3750', '2,05|2005', '0,5|550', '3,4|3400', '1,25|1200', '2,6|2650', '4,05|4000'] },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      b: { kind: 'choice', values: (v) => [group(at(v.spec, 1))] },
      av: { kind: 'choice', values: (v) => [Math.round(Number(String(v.spec).split('|')[0]!.replace(',', '.')) * 1000)] },
      bv: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => relation(Number(v.av), Number(v.bv)),
    optionCount: 3,
    options: () => RELATION_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => `${vars.a} კგ = ${vars.av} გ, ამიტომ ${vars.av} ${answer} ${vars.bv}.`,
  }),
  bank({
    id: 'g5-u13-q19',
    subtopicId: 'u13-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'დაალაგე ზრდადობით: {a} მ; {b} სმ; {c} მმ; {d} მ',
    variables: {
      spec: {
        kind: 'choice',
        values: ['1,5|140|1600|1,45', '2,4|230|2450|2,35', '1,2|115|1250|1,15', '3,5|340|3550|3,45',
          '0,8|75|850|0,75', '2,6|255|2650|2,55', '1,8|175|1850|1,75', '4,2|415|4250|4,15',
          '3,2|310|3250|3,15', '5,4|530|5450|5,35', '2,8|275|2850|2,75', '1,6|155|1650|1,55',
          '4,5|440|4550|4,45', '0,6|55|650|0,55'],
      },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      c: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      d: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]!] },
      al: { kind: 'choice', values: (v) => [`${String(v.spec).split('|')[0]} მ`] },
      bl: { kind: 'choice', values: (v) => [`${String(v.spec).split('|')[1]} სმ`] },
      cl: { kind: 'choice', values: (v) => [`${String(v.spec).split('|')[2]} მმ`] },
      dl: { kind: 'choice', values: (v) => [`${String(v.spec).split('|')[3]} მ`] },
    },
    answer: (v) => {
      const items = [
        { label: `${v.a} მ`, mm: Number(v.a) * 1000 },
        { label: `${v.b} სმ`, mm: Number(v.b) * 10 },
        { label: `${v.c} მმ`, mm: Number(v.c) },
        { label: `${v.d} მ`, mm: Number(v.d) * 1000 },
      ];
      return items.sort((x, y) => x.mm - y.mm).map((x) => x.label).join('; ');
    },
    format: { kind: 'text' },
    options: (v) => {
      const items = [
        { label: `${v.a} მ`, mm: Number(v.a) * 1000 },
        { label: `${v.b} სმ`, mm: Number(v.b) * 10 },
        { label: `${v.c} მმ`, mm: Number(v.c) },
        { label: `${v.d} მ`, mm: Number(v.d) * 1000 },
      ];
      const sorted = [...items].sort((x, y) => x.mm - y.mm);
      const right = sorted.map((x) => x.label).join('; ');
      return fourOptions(right, [
        [...sorted].reverse().map((x) => x.label).join('; '),
        items.map((x) => x.label).join('; '),
        [sorted[1]!, sorted[0]!, sorted[2]!, sorted[3]!].map((x) => x.label).join('; '),
      ]);
    },
    explain: ({ answer }) => `ყველა სიგრძე მილიმეტრებში გადავიყვანეთ და ზრდადობით დავალაგეთ: ${answer}.`,
  }),

  // ───────────── U13.5 — ერთეულების ცხრილი ─────────────
  bank({
    id: 'g5-u13-q20',
    subtopicId: 'u13-05',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'შეავსე გამოტოვებული რიცხვი: {m} მ = ____ სმ',
    variables: {
      spec: { kind: 'choice', values: ['3|300', '4,5|450', '2,7|270', '5,2|520', '1,8|180', '6,4|640', '3,5|350', '7,2|720', '0,9|90', '2,25|225', '6,8|680', '1,15|115', '4,75|475', '8,5|850'] },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      cm: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.cm),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer * 10, answer / 10, answer + 100, answer - 10 > 0 ? answer - 10 : answer + 20].map(String);
    },
    explain: ({ vars, answer }) => `1 მ = 100 სმ, ამიტომ ${vars.m} × 100 = ${answer}.`,
  }),
  bank({
    id: 'g5-u13-q21',
    subtopicId: 'u13-05',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'შეავსე გამოტოვებული რიცხვი: {k} კგ = ____ გ',
    variables: {
      spec: { kind: 'choice', values: ['4,5|4500', '2,25|2250', '3,2|3200', '1,75|1750', '6,5|6500', '0,8|800', '2,4|2400', '5,25|5250', '3,5|3500', '7,5|7500', '4,05|4050', '6,25|6250', '1,4|1400', '9,5|9500'] },
      k: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      g: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.g),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer * 10, answer / 10, answer + 500, answer - 200 > 0 ? answer - 200 : answer + 300].map(String);
    },
    explain: ({ vars, answer }) => `1 კგ = 1000 გ, ამიტომ ${vars.k} × 1000 = ${answer}.`,
  }),
  bank({
    id: 'g5-u13-q22',
    subtopicId: 'u13-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეავსე ცხრილი: {ml} მლ = ____ ლ',
    variables: {
      spec: { kind: 'choice', values: ['2700|2,7', '3500|3,5', '1500|1,5', '4750|4,75', '2250|2,25', '6000|6', '1250|1,25', '8750|8,75', '3250|3,25', '7800|7,8', '4250|4,25', '5400|5,4', '6750|6,75'] },
      ml: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
      mlv: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      lv: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
    },
    answer: (v) => String(v.lv),
    format: { kind: 'text' },
    options: (v) => fourOptions(String(v.lv), [
      `${Number(v.mlv) / 100}`.replace('.', ','),
      `${Number(v.mlv) / 10000}`.replace('.', ','),
      `${Number(String(v.lv).replace(',', '.')) * 10}`.replace('.', ','),
    ]),
    explain: ({ vars, answer }) => `${vars.ml} ÷ 1000 = ${answer} ლ.`,
  }),
  bank({
    id: 'g5-u13-q23',
    subtopicId: 'u13-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეავსე ცხრილი: {a} მ² = ____ სმ²',
    variables: {
      spec: { kind: 'choice', values: ['6|60000', '4|40000', '2|20000', '5|50000', '3|30000', '7|70000', '8|80000', '9|90000', '12|120000', '11|110000', '15|150000', '10|100000', '14|140000'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      s: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.s),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer * 10, answer / 10, answer + 10000, answer / 100].map(String);
    },
    explain: ({ vars, answer }) => `1 მ² = 10 000 სმ², ამიტომ ${vars.a} × 10 000 = ${group(Number(answer))}.`,
  }),

  // ───────────── U13.6 — შერეული ერთეულები ─────────────
  bank({
    id: 'g5-u13-q24',
    subtopicId: 'u13-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩაწერე მეტრებში: {a} მ {b} სმ',
    variables: {
      spec: { kind: 'choice', values: ['5|35|5,35', '3|45|3,45', '7|8|7,08', '2|75|2,75', '4|5|4,05', '6|90|6,9', '8|15|8,15', '1|25|1,25', '9|60|9,6', '4|8|4,08', '2|35|2,35', '6|5|6,05', '3|80|3,8', '5|9|5,09'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
    },
    answer: (v) => String(v.m),
    format: { kind: 'text' },
    options: (v) => fourOptions(String(v.m), [
      `${v.a},${v.b}`,
      `${v.b},${v.a}`,
      `${Number(String(v.m).replace(',', '.')) * 10}`.replace('.', ','),
    ]),
    explain: ({ vars, answer }) => `${vars.b} სმ = 0,${String(vars.b).padStart(2, '0')} მ, ამიტომ ${vars.a} მ ${vars.b} სმ = ${answer} მ.`,
  }),
  bank({
    id: 'g5-u13-q25',
    subtopicId: 'u13-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩაწერე სანტიმეტრებში: {a} მ {b} სმ',
    variables: {
      spec: { kind: 'choice', values: ['2|40|240', '3|15|315', '1|85|185', '4|8|408', '5|50|550', '2|7|207', '6|25|625', '3|90|390', '1|45|145', '7|5|705', '2|60|260', '4|35|435', '8|12|812'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => Number(v.c),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer * 10, answer / 10, answer + 10, answer - 10 > 0 ? answer - 10 : answer + 20].map(String);
    },
    explain: ({ vars, answer }) => `${vars.a} მ = ${Number(vars.a) * 100} სმ, + ${vars.b} სმ = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u13-q26',
    subtopicId: 'u13-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩაწერე კილოგრამებში: {a} კგ {b} გ',
    variables: {
      spec: { kind: 'choice', values: ['3|450|3,45', '5|200|5,2', '2|75|2,075', '4|8|4,008', '6|900|6,9', '1|250|1,25', '7|350|7,35', '2|50|2,05', '5|75|5,075', '8|450|8,45', '3|600|3,6', '4|120|4,12'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      k: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
    },
    answer: (v) => String(v.k),
    format: { kind: 'text' },
    options: (v) => fourOptions(String(v.k), [
      `${v.a},${v.b}`,
      `${Number(String(v.k).replace(',', '.')) * 10}`.replace('.', ','),
      `${Number(String(v.k).replace(',', '.')) / 10}`.replace('.', ','),
    ]),
    explain: ({ vars, answer }) => `${vars.a} კგ ${vars.b} გ = ${answer} კგ.`,
  }),
  bank({
    id: 'g5-u13-q27',
    subtopicId: 'u13-06',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე და ჩაწერე მეტრებში: {a} მ {b} სმ + {c} მ {d} სმ',
    variables: {
      spec: { kind: 'choice', values: ['2|40|1|85', '3|25|2|60', '1|75|4|45', '5|10|2|95', '4|65|1|55', '3|90|2|35', '2|15|3|70', '1|45|5|80', '4|85|2|25', '6|5|1|60', '3|55|2|90', '5|35|2|15'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => {
      const cm = Number(v.a) * 100 + Number(v.b) + Number(v.c) * 100 + Number(v.d);
      return `${Math.floor(cm / 100)},${String(cm % 100).padStart(2, '0')}`;
    },
    format: { kind: 'text' },
    options: (v) => {
      const cm = Number(v.a) * 100 + Number(v.b) + Number(v.c) * 100 + Number(v.d);
      const right = `${Math.floor(cm / 100)},${String(cm % 100).padStart(2, '0')}`;
      return fourOptions(right, [`${Number(v.a) + Number(v.c)},${Number(v.b) + Number(v.d)}`, `${Math.floor(cm / 100)},${String((cm % 100) + 10).padStart(2, '0')}`, `${cm}`]);
    },
    explain: ({ vars, answer }) =>
      `სანტიმეტრებში: ${Number(vars.a) * 100 + Number(vars.b)} + ${Number(vars.c) * 100 + Number(vars.d)} = ${Number(vars.a) * 100 + Number(vars.b) + Number(vars.c) * 100 + Number(vars.d)} სმ = ${answer} მ.`,
  }),

  // ───────────── U13.7 — შედარება ჯერადითა და ფარდობით ─────────────
  bank({
    id: 'g5-u13-q28',
    subtopicId: 'u13-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ერთი ლენტის სიგრძეა {a} მ, მეორისა — {b} მ. რამდენჯერ მეტია მეორე ლენტი პირველზე?',
    variables: {
      spec: { kind: 'choice', values: ['3|12', '4|20', '2|10', '5|15', '6|24', '8|16', '4|36', '3|21', '5|45', '6|30', '2|14', '7|28'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.b) / Number(v.a),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer - 1 > 0 ? answer - 1 : answer + 2, answer * 2, Number(ctx.vars.b) - Number(ctx.vars.a)].map(String);
    },
    explain: ({ vars, answer }) => `${vars.b} ÷ ${vars.a} = ${answer}, ამიტომ მეორე ლენტი ${answer} ჯერ მეტია.`,
  }),
  bank({
    id: 'g5-u13-q29',
    subtopicId: 'u13-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მართკუთხედის ერთი გვერდი {a} სმ-ია, მეორე — {b} სმ. რამდენჯერ მეტია მეორე გვერდი?',
    variables: {
      spec: { kind: 'choice', values: ['4|12', '3|15', '2|8', '5|20', '6|18', '4|24', '3|27', '7|21', '2|12', '5|30', '6|30', '8|24', '9|27', '4|28'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.b) / Number(v.a),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer - 1 > 0 ? answer - 1 : answer + 2, Number(ctx.vars.b) - Number(ctx.vars.a), answer + 2].map(String);
    },
    explain: ({ vars, answer }) => `${vars.b} ÷ ${vars.a} = ${answer}.`,
  }),
  bank({
    id: 'g5-u13-q30',
    subtopicId: 'u13-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ორი კვადრატის გვერდებია {a} სმ და {b} სმ. რამდენჯერ მეტია მეორე კვადრატის გვერდი?',
    variables: {
      spec: { kind: 'choice', values: ['3|9', '4|16', '2|6', '5|25', '6|12', '3|18', '4|8', '2|10', '7|14', '5|15', '9|18', '6|24', '8|16', '7|28'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.b) / Number(v.a),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer * 2, Number(ctx.vars.b) - Number(ctx.vars.a), answer - 1 > 0 ? answer - 1 : answer + 3].map(String);
    },
    explain: ({ vars, answer }) => `${vars.b} ÷ ${vars.a} = ${answer}.`,
  }),
  bank({
    id: 'g5-u13-q31',
    subtopicId: 'u13-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ორი თოკის სიგრძეებია {a} მ და {b} მ. ჩაწერე მათი შეფარდება უმცირესი მთელი რიცხვებით.',
    variables: {
      spec: { kind: 'choice', values: ['15|5', '20|4', '12|3', '10|2', '21|7', '18|6', '24|8', '30|10', '9|3', '25|5', '16|4', '27|9', '32|8', '35|7'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => `${Number(v.a) / Number(v.b)} : 1`,
    format: { kind: 'text' },
    options: (v) => fourOptions(`${Number(v.a) / Number(v.b)} : 1`, [
      `${v.a} : ${v.b}`,
      `1 : ${Number(v.a) / Number(v.b)}`,
      `${Number(v.a) / Number(v.b)} : ${Number(v.a) / Number(v.b)}`,
    ]),
    explain: ({ vars, answer }) => `${vars.a} : ${vars.b} = ${answer}, რადგან ორივე ${vars.b}-ზე იყოფა.`,
  }),

  // ───────────── U13.8 — მასშტაბი და ფართობი ─────────────
  bank({
    id: 'g5-u13-q32',
    subtopicId: 'u13-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რუკაზე 1 სმ რეალურ მანძილზე {k} კმ-ს შეესაბამება. რუკაზე {a} სმ რეალურად რამდენი კილომეტრია?',
    variables: {
      spec: { kind: 'choice', values: ['5|2', '4|3', '6|4', '3|5', '8|6', '7|2', '5|8', '9|3', '4|7', '6|9', '4|8', '6|3', '7|5', '9|6'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      k: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.a) * Number(v.k),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + Number(ctx.vars.k), answer - Number(ctx.vars.k) > 0 ? answer - Number(ctx.vars.k) : answer + 2, answer * 2, answer + 1].map(String);
    },
    explain: ({ vars, answer }) => `1 სმ → ${vars.k} კმ, ამიტომ ${vars.a} სმ → ${vars.a} × ${vars.k} = ${answer} კმ.`,
  }),
  bank({
    id: 'g5-u13-q33',
    subtopicId: 'u13-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გეგმის მასშტაბია 1:100. გეგმაზე {a} სმ-იანი ოთახის რეალური სიგრძე რამდენი მეტრია?',
    variables: {
      spec: { kind: 'choice', values: ['6|0,06', '4|0,04', '8|0,08', '5|0,05', '12|0,12', '9|0,09', '10|0,1', '7|0,07', '15|0,15', '3|0,03', '11|0,11', '14|0,14', '18|0,18', '13|0,13'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      m: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
    },
    answer: (v) => `${Number(v.a) / 100}`.replace('.', ','),
    format: { kind: 'text' },
    options: (v) => fourOptions(`${Number(v.a) / 100}`.replace('.', ','), [
      `${v.a}`,
      `${Number(v.a) / 10}`.replace('.', ','),
      `${Number(v.a) * 10}`,
    ]),
    explain: ({ vars, answer }) => `1:100 ნიშნავს, რომ რეალური სიგრძე 100-ჯერ მეტია: ${vars.a} სმ × 100 = ${Number(vars.a) * 100} სმ = ${String(answer).replace('.', ',')} მ.`,
  }),
  bank({
    id: 'g5-u13-q34',
    subtopicId: 'u13-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მართკუთხედის სიგრძე {a} სმ-ია, სიგანე — {b} სმ. იპოვე მისი ფართობი.',
    variables: {
      spec: { kind: 'choice', values: ['8|5', '9|4', '7|6', '12|3', '10|5', '11|4', '6|8', '9|7', '12|5', '14|3', '15|4', '13|6', '16|5', '10|7'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => `${Number(v.a) * Number(v.b)} სმ²`,
    format: { kind: 'text' },
    options: (v) => {
      const right = `${Number(v.a) * Number(v.b)} სმ²`;
      return fourOptions(right, [
        `${2 * (Number(v.a) + Number(v.b))} სმ²`,
        `${Number(v.a) * Number(v.b) + Number(v.a)} სმ²`,
        `${Number(v.a) + Number(v.b)} სმ²`,
      ]);
    },
    explain: ({ vars, answer }) => `ფართობი = სიგრძე × სიგანე = ${vars.a} × ${vars.b} = ${answer}.`,
  }),
  bank({
    id: 'g5-u13-q35',
    subtopicId: 'u13-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'კვადრატის გვერდია {a} სმ. იპოვე მისი ფართობი.',
    variables: {
      spec: { kind: 'choice', values: ['9|81', '7|49', '8|64', '6|36', '11|121', '12|144', '5|25', '4|16', '13|169', '10|100', '14|196', '15|225', '3|9', '17|289'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      s: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => `${v.s} სმ²`,
    format: { kind: 'text' },
    options: (v) => fourOptions(`${v.s} სმ²`, [
      `${Number(v.a) * 4} სმ²`,
      `${Number(v.s) + Number(v.a)} სმ²`,
      `${Number(v.s) - Number(v.a)} სმ²`,
    ]),
    explain: ({ vars, answer }) => `კვადრატის ფართობი = გვერდი × გვერდი = ${vars.a} × ${vars.a} = ${answer}.`,
  }),
  bank({
    id: 'g5-u13-q36',
    subtopicId: 'u13-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'მართკუთხედის ფართობია {s} სმ², სიგრძე — {a} სმ. იპოვე მისი სიგანე.',
    variables: {
      spec: { kind: 'choice', values: ['48|8|6', '63|9|7', '72|12|6', '35|7|5', '54|9|6', '40|8|5', '84|12|7', '56|8|7', '90|10|9', '66|11|6', '42|7|6', '96|12|8', '45|9|5', '77|11|7'] },
      s: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => `${v.b} სმ`,
    format: { kind: 'text' },
    options: (v) => fourOptions(`${v.b} სმ`, [
      `${Number(v.s) - Number(v.a)} სმ`,
      `${Number(v.s) + Number(v.a)} სმ`,
      `${Number(v.b) + 1} სმ`,
    ]),
    explain: ({ vars, answer }) => `სიგანე = ფართობი ÷ სიგრძე = ${vars.s} ÷ ${vars.a} = ${answer}.`,
  }),
];
