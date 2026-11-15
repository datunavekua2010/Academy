import type { QuestionTemplate } from './types';
import { bank, group, shownVar } from './g5-helpers';

/**
 * Grade V — Unit 06: მრავალსაფეხურიანი ამოცანები და სიჩქარე
 * (multi-step word problems and speed).
 *
 * Converted from the academy's `U06` bank (6 subtopics × 6 questions):
 * two sets of multi-step problems, quantity over a time interval, and the
 * three speed relations — distance, time and speed.
 *
 * Note on the bank: U06.5's first three items sit in the unreadable middle of
 * the export (the document exceeds the reader's window), so this file follows
 * the pattern those items belong to — established by U06.4's „distance" items
 * and confirmed by U06.5's items 4–6, which are all „distance ÷ speed" — without
 * reproducing the three questions themselves.
 */

export const G5_U06_SUBTOPICS = [
  'u06-01',
  'u06-02',
  'u06-03',
  'u06-04',
  'u06-05',
  'u06-06',
] as const;

export type G5U06SubtopicId = (typeof G5_U06_SUBTOPICS)[number];

const TOPIC = 'g5-multi-step-speed';

const shown = (n: number): string => group(n);
const shownList = (values: number[]): string[] => values.map(shown);

const grouped = {
  kind: 'integer' as const,
  min: 0,
  format: (value: number | string) => shown(Number(value)),
};

/** `a|b|c` — three quantities a multi-step problem combines. */
const triple = [
  '245|178|296', '1 250|375|428', '840|1 260|2 400', '18|24|125',
  '15|36|248', '85|255|320', '1 250|1 475|980', '245|735|1 960',
  '28|3 500|125', '680|2 400|125', '320|85|255', '450|1 400|260',
  '175|325|640', '96|154|250', '2 400|680|1 720', '560|840|1 400',
  '312|488|205', '745|255|690', '1 080|420|365', '936|164|512',
  '2 050|950|1 480', '630|370|440', '1 815|285|1 100', '57|143|96',
];

/** `distance|speed` — the pair that yields a time. */
const timeRows = [
  '240|60', '64|4', '450|90', '1 800|600', '350|70', '120|15',
  '390|65', '540|90', '840|120', '270|45', '960|80', '1 500|250',
  '210|35', '480|60', '1 200|150', '630|70',
];

/** `distance|time` — the pair that yields a speed. */
const speedRows = [
  '210|3', '64|4', '450|5', '1 400|2', '260|4', '540|6',
  '390|6', '720|8', '850|5', '1 080|9', '600|4', '1 260|7',
  '350|7', '480|6', '990|9', '1 600|8',
];

const split = (row: unknown): number[] =>
  String(row)
    .split('|')
    .map((part) => Number(part.replace(/[\s\u00a0\u2009]/g, '')));

export const G5_U06_TEMPLATES: QuestionTemplate[] = [
  // ─────────────── U06.1 — მოქმედებებით ამოცანები I ───────────────
  bank({
    id: 'g5-u06-q01',
    subtopicId: 'u06-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'მაღაზიაში დილით {a} კგ ვაშლი შეიტანეს, შუადღეს — კიდევ {b} კგ. დღის განმავლობაში {c} კგ გაიყიდა. რამდენი კილოგრამი ვაშლი დარჩა?',
    variables: {
      row: { kind: 'choice', values: triple },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      sa: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sb: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
      sc: { kind: 'choice', values: (v) => [shown(split(v.row)[2]!)] },
    },
    answer: (v) => Number(v.a) + Number(v.b) - Number(v.c),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const c = Number(ctx.vars.c);
      return shownList([a + b, a + b + c, Math.abs(a - b) + c, Number(ctx.answer) + 10]);
    },
    explain: ({ vars, answer }) =>
      `${vars.sa} + ${vars.sb} = ${shown(Number(vars.a) + Number(vars.b))} კგ შეიტანეს; ${shown(Number(vars.a) + Number(vars.b))} − ${vars.sc} = ${answer} კგ დარჩა.`,
  }),
  bank({
    id: 'g5-u06-q02',
    subtopicId: 'u06-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ბიბლიოთეკაში {sa} წიგნი იყო. შეიტანეს კიდევ {sb} წიგნი, შემდეგ {sc} წიგნი გაიტანეს. რამდენი წიგნი დარჩა?',
    variables: {
      row: { kind: 'choice', values: triple },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      sa: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sb: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
      sc: { kind: 'choice', values: (v) => [shown(split(v.row)[2]!)] },
    },
    answer: (v) => Number(v.a) + Number(v.b) - Number(v.c),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const c = Number(ctx.vars.c);
      return shownList([a - b + c, a + b, a + b + c, a + c - b]);
    },
    explain: ({ vars, answer }) => `(${vars.sa} + ${vars.sb}) − ${vars.sc} = ${answer}.`,
  }),
  bank({
    id: 'g5-u06-q03',
    subtopicId: 'u06-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ერთ საწყობში {sa} ყუთია, მეორეში — {sb}. თითოეულ ყუთში {sc} ნივთია. რამდენი ნივთია ორივე საწყობში ერთად?',
    variables: {
      row: { kind: 'choice', values: [
        '28|3 500|125', '680|2 400|125', '320|85|255', '450|1 400|260',
        '36|2 800|115', '540|1 200|230', '215|365|180', '760|1 040|150',
        '42|3 200|105', '310|490|275', '185|415|245', '95|1 305|140',
        '620|1 380|170', '48|2 600|130', '260|340|190', '510|890|210',
      ] },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      sa: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sb: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
      sc: { kind: 'choice', values: (v) => [shown(split(v.row)[2]!)] },
    },
    answer: (v) => (Number(v.a) + Number(v.b)) * Number(v.c),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const c = Number(ctx.vars.c);
      return shownList([a * c + b, a + b + c, a * c, Number(ctx.answer) + c]);
    },
    explain: ({ vars, answer }) => `(${vars.sa} + ${vars.sb}) × ${vars.sc} = ${answer}.`,
  }),
  bank({
    id: 'g5-u06-q04',
    subtopicId: 'u06-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ავტობუსში {sa} მგზავრია. ნახევარი ჩამოვიდა, შემდეგ {sb} ადამიანი ავიდა. რამდენი მგზავრია ახლა?',
    variables: {
      row: { kind: 'choice', values: triple },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]! * 2] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      sa: { kind: 'choice', values: (v) => [shown(split(v.row)[0]! * 2)] },
      sb: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => Number(v.a) / 2 + Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return shownList([a - b, a + b, a / 2 - b, a / 2]);
    },
    explain: ({ vars, answer }) =>
      `${vars.sa} ÷ 2 = ${shown(Number(vars.a) / 2)}, შემდეგ + ${vars.sb} = ${answer}.`,
  }),
  bank({
    id: 'g5-u06-q05',
    subtopicId: 'u06-01',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'სკოლამ შეიძინა {sa} ყუთი ფანქარი, თითოეულში {sb} ფანქარია. მოსწავლეებს {sc} ფანქარი დაურიგეს. რამდენი ფანქარი დარჩა?',
    variables: {
      a: { kind: 'int', min: 15, max: 40 },
      b: { kind: 'int', min: 28, max: 48 },
      c: { kind: 'int', min: 200, max: 500 },
      sa: shownVar('a'),
      sb: shownVar('b'),
      sc: shownVar('c'),
    },
    answer: (v) => Number(v.a) * Number(v.b) - Number(v.c),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const c = Number(ctx.vars.c);
      return shownList([a * b, a + b - c, a * b + c, Number(ctx.answer) + 12]);
    },
    explain: ({ vars, answer }) => {
      const total = Number(vars.a) * Number(vars.b);
      return `${vars.sa} × ${vars.sb} = ${group(total)} ფანქარი სულ; ${group(total)} − ${vars.sc} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u06-q06',
    subtopicId: 'u06-01',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ნინოს პირველ დღეს {sa} გვერდი წაიკითხა, მეორე დღეს — სამჯერ მეტი, ხოლო მესამე დღეს — 85 გვერდი ნაკლები, ვიდრე მეორე დღეს. რამდენი გვერდი წაიკითხა ნინომ სამ დღეში?',
    variables: {
      a: { kind: 'int', min: 60, max: 140 },
      sa: shownVar('a'),
    },
    answer: (v) => {
      const a = Number(v.a);
      return a + a * 3 + (a * 3 - 85);
    },
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      return shownList([a + a * 3, a * 3, Number(ctx.answer) + 85, a + a * 3 - 85]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      return `მეორე დღე ${group(a * 3)} გვერდი, მესამე — ${group(a * 3 - 85)}. სულ: ${vars.sa} + ${group(a * 3)} + ${group(a * 3 - 85)} = ${answer}.`;
    },
  }),

  // ─────────────── U06.2 — მოქმედებებით ამოცანები II ───────────────
  bank({
    id: 'g5-u06-q07',
    subtopicId: 'u06-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ქარხანამ 8 დღეში ყოველდღე {sa} დეტალი დაამზადა. {sb} დეტალი გაგზავნეს სხვა მაღაზიაში, დანარჩენი კი — მეორეში. რამდენი დეტალი გაიგზავნა მეორე მაღაზიაში?',
    variables: {
      a: { kind: 'int', min: 1_100, max: 1_500 },
      b: { kind: 'int', min: 2_000, max: 6_000 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.a) * 8 - Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return shownList([a * 8, a * 8 + b, a + b, Number(ctx.answer) + 400]);
    },
    explain: ({ vars, answer }) => {
      const total = Number(vars.a) * 8;
      return `${vars.sa} × 8 = ${group(total)}; ${group(total)} − ${vars.sb} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u06-q08',
    subtopicId: 'u06-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მაღაზიაში {sa} ყუთი წვენი იყო, თითოეულში {sb} ბოთლი. დღის განმავლობაში {sc} ბოთლი გაიყიდა. რამდენი ბოთლი დარჩა?',
    variables: {
      a: { kind: 'int', min: 30, max: 42 },
      b: { kind: 'int', min: 20, max: 28 },
      c: { kind: 'int', min: 300, max: 500 },
      sa: shownVar('a'),
      sb: shownVar('b'),
      sc: shownVar('c'),
    },
    answer: (v) => Number(v.a) * Number(v.b) - Number(v.c),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const c = Number(ctx.vars.c);
      return shownList([a * b, a + b - c, a * b + c, Number(ctx.answer) + b]);
    },
    explain: ({ vars, answer }) => {
      const total = Number(vars.a) * Number(vars.b);
      return `${vars.sa} × ${vars.sb} = ${group(total)} ბოთლი; ${group(total)} − ${vars.sc} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u06-q09',
    subtopicId: 'u06-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'სამმა გუნდმა შეაგროვა {sa}, {sb} და {sc} კგ ქაღალდი. შეგროვებული ქაღალდი თანაბრად გადაანაწილეს 5 მანქანაზე. რამდენი კილოგრამი ქაღალდი დაატვირთეს თითოეულ მანქანაზე?',
    variables: {
      a: { kind: 'int', min: 1_200, max: 1_600 },
      b: { kind: 'int', min: 1_300, max: 1_700 },
      c: { kind: 'int', min: 900, max: 1_100 },
      sa: shownVar('a'),
      sb: shownVar('b'),
      sc: shownVar('c'),
    },
    answer: (v) => (Number(v.a) + Number(v.b) + Number(v.c)) / 5,
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const c = Number(ctx.vars.c);
      return shownList([a + b + c, (a + b) / 5, Number(ctx.answer) * 5, Number(ctx.answer) + 100]);
    },
    explain: ({ vars, answer }) => {
      const total = Number(vars.a) + Number(vars.b) + Number(vars.c);
      return `${vars.sa} + ${vars.sb} + ${vars.sc} = ${group(total)}; ${group(total)} ÷ 5 = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u06-q10',
    subtopicId: 'u06-02',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ფერმაში {sa} ქათამია. ყოველი ქათამი დღეში 1 კვერცხს დებს. რამდენი კვერცხია სულ ერთ კვირაში?',
    variables: {
      a: { kind: 'int', min: 200, max: 400 },
      sa: shownVar('a'),
    },
    answer: (v) => Number(v.a) * 7,
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      return shownList([a, a * 30, a + 7, a * 7 + a]);
    },
    explain: ({ vars, answer }) => `${vars.sa} × 7 = ${answer}.`,
  }),
  bank({
    id: 'g5-u06-q11',
    subtopicId: 'u06-02',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'სკოლაში 28 კლასია, თითოეულში 125 რვეული გადასცა. სულ გადაეცა 4 000 რვეული. რამდენი რვეული დარჩა?',
    variables: {
      classes: { kind: 'choice', values: [28, 24, 32, 26, 30, 25, 27, 36] },
      each: { kind: 'choice', values: [125, 120, 115, 130, 110, 140, 105, 135] },
      total: { kind: 'int', min: 3_800, max: 4_800 },
      sclasses: shownVar('classes'),
      seach: shownVar('each'),
      stotal: shownVar('total'),
    },
    answer: (v) => Number(v.total) - Number(v.classes) * Number(v.each),
    format: grouped,
    distractors: (ctx) => {
      const classes = Number(ctx.vars.classes);
      const each = Number(ctx.vars.each);
      const total = Number(ctx.vars.total);
      return shownList([classes * each, total + classes * each, total - classes, Number(ctx.answer) + each]);
    },
    explain: ({ vars, answer }) => {
      const handed = Number(vars.classes) * Number(vars.each);
      return `${vars.sclasses} × ${vars.seach} = ${group(handed)} გადაეცა; ${vars.stotal} − ${group(handed)} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u06-q12',
    subtopicId: 'u06-02',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'საწყობში 2 400 კგ ფქვილი იყო. პირველ დღეს გაიყიდა 680 კგ, მეორე დღეს — პირველ დღეზე 125 კგ-ით მეტი. რამდენი კილოგრამი ფქვილი დარჩა?',
    variables: {
      total: { kind: 'choice', values: [2_400, 2_600, 3_000, 2_800, 3_200, 2_500] },
      first: { kind: 'choice', values: [680, 640, 720, 560, 700, 620] },
      extra: { kind: 'choice', values: [125, 135, 115, 140, 120, 150] },
      stotal: shownVar('total'),
      sfirst: shownVar('first'),
      sextra: shownVar('extra'),
    },
    answer: (v) => Number(v.total) - Number(v.first) - (Number(v.first) + Number(v.extra)),
    format: grouped,
    distractors: (ctx) => {
      const total = Number(ctx.vars.total);
      const first = Number(ctx.vars.first);
      const extra = Number(ctx.vars.extra);
      return shownList([total - first * 2, total - first, first + extra, Number(ctx.answer) + extra]);
    },
    explain: ({ vars, answer }) => {
      const second = Number(vars.first) + Number(vars.extra);
      return `მეორე დღეს გაიყიდა ${group(second)} კგ. ${vars.stotal} − ${vars.sfirst} − ${group(second)} = ${answer}.`;
    },
  }),

  // ─────────────── U06.3 — რაოდენობა დროის მონაკვეთში ───────────────
  bank({
    id: 'g5-u06-q13',
    subtopicId: 'u06-03',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'მანქანა 1 საათში {srate} კმ-ს გადის. რამდენ კილომეტრს გაივლის 4 საათში?',
    variables: {
      rate: { kind: 'choice', values: [65, 70, 80, 90, 60, 75, 85, 100, 55, 95, 50, 120, 45, 105, 40, 110] },
      srate: shownVar('rate'),
    },
    answer: (v) => Number(v.rate) * 4,
    format: grouped,
    distractors: (ctx) => {
      const rate = Number(ctx.vars.rate);
      return shownList([rate, rate * 5, rate + 4, rate * 4 + rate]);
    },
    explain: ({ vars, answer }) => `${vars.srate} × 4 = ${answer} კმ.`,
  }),
  bank({
    id: 'g5-u06-q14',
    subtopicId: 'u06-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'საცარმო საათში {srate} დეტალს ამზადებს. რამდენ დეტალს დაამზადებს 7 საათში?',
    variables: {
      rate: { kind: 'choice', values: [24, 36, 18, 45, 52, 60, 30, 48, 42, 56, 33, 27, 54, 39, 21, 63] },
      srate: shownVar('rate'),
    },
    answer: (v) => Number(v.rate) * 7,
    format: grouped,
    distractors: (ctx) => {
      const rate = Number(ctx.vars.rate);
      return shownList([rate, rate * 6, rate + 7, rate * 8]);
    },
    explain: ({ vars, answer }) => `${vars.srate} × 7 = ${answer}.`,
  }),
  bank({
    id: 'g5-u06-q15',
    subtopicId: 'u06-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მებაღე საათში {srate} ხეს რგავს. რამდენ ხეს დარგავს 6 საათში?',
    variables: {
      rate: { kind: 'choice', values: [18, 12, 15, 20, 14, 16, 22, 25, 10, 24, 28, 30, 32, 35, 40, 45] },
      srate: shownVar('rate'),
    },
    answer: (v) => Number(v.rate) * 6,
    format: grouped,
    distractors: (ctx) => {
      const rate = Number(ctx.vars.rate);
      return shownList([rate, rate * 5, rate * 7, rate + 6]);
    },
    explain: ({ vars, answer }) => `${vars.srate} × 6 = ${answer}.`,
  }),
  bank({
    id: 'g5-u06-q16',
    subtopicId: 'u06-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ქარხანა დღეში {srate} ლიტრ წვენს აწარმოებს. რამდენ ლიტრს აწარმოებს 7 დღეში?',
    variables: {
      rate: { kind: 'choice', values: [240, 320, 180, 450, 360, 280, 400, 500, 220, 260, 300, 340, 380, 420, 460, 480] },
      srate: shownVar('rate'),
    },
    answer: (v) => Number(v.rate) * 7,
    format: grouped,
    distractors: (ctx) => {
      const rate = Number(ctx.vars.rate);
      return shownList([rate, rate * 6, rate * 8, rate + 7]);
    },
    explain: ({ vars, answer }) => `${vars.srate} × 7 = ${answer} ლიტრი.`,
  }),
  bank({
    id: 'g5-u06-q17',
    subtopicId: 'u06-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'პრინტერი წუთში 32 გვერდს ბეჭდავს. რამდენ გვერდს დაბეჭდავს 15 წუთში?',
    variables: {
      rate: { kind: 'choice', values: [32, 24, 45, 28, 36, 40, 25, 48, 18, 20, 22, 30, 42, 50, 55, 60] },
      srate: shownVar('rate'),
    },
    answer: (v) => Number(v.rate) * 15,
    format: grouped,
    distractors: (ctx) => {
      const rate = Number(ctx.vars.rate);
      return shownList([rate, rate * 10, rate * 20, rate + 15]);
    },
    explain: ({ vars, answer }) => `${vars.srate} × 15 = ${answer} გვერდი.`,
  }),
  bank({
    id: 'g5-u06-q18',
    subtopicId: 'u06-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ტუმბო წუთში 75 ლიტრ წყალს ამოტუმბავს. რამდენ ლიტრს ამოტუმბავს 12 წუთში?',
    variables: {
      rate: { kind: 'choice', values: [75, 60, 90, 85, 70, 80, 65, 95, 50, 55, 100, 105, 110, 115, 120, 125] },
      srate: shownVar('rate'),
    },
    answer: (v) => Number(v.rate) * 12,
    format: grouped,
    distractors: (ctx) => {
      const rate = Number(ctx.vars.rate);
      return shownList([rate, rate * 10, rate * 15, rate + 12]);
    },
    explain: ({ vars, answer }) => `${vars.srate} × 12 = ${answer} ლიტრი.`,
  }),

  // ─────────────── U06.4 — მანძილის პოვნა ───────────────
  bank({
    id: 'g5-u06-q19',
    subtopicId: 'u06-04',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ავტობუსი {t} საათის განმავლობაში საათში {v} კმ-ს გადის. რა მანძილს გაივლის ავტობუსი?',
    variables: {
      v: { kind: 'choice', values: [70, 15, 90, 4, 65, 105, 55, 45] },
      t: { kind: 'choice', values: [3, 4, 5, 6, 2, 7, 8, 3] },
      sv: shownVar('v'),
      st: shownVar('t'),
    },
    answer: (v) => Number(v.v) * Number(v.t),
    format: grouped,
    distractors: (ctx) => {
      const v = Number(ctx.vars.v);
      const t = Number(ctx.vars.t);
      return shownList([v + t, v * t + v, v * t - t, v]);
    },
    explain: ({ vars, answer }) => `მანძილი = სიჩქარე × დრო = ${vars.sv} × ${vars.st} = ${answer} კმ.`,
  }),
  bank({
    id: 'g5-u06-q20',
    subtopicId: 'u06-04',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ველოსიპედისტი 4 საათის განმავლობაში საათში 15 კმ-ს გადის. რა მანძილს გაივლის?',
    variables: {
      v: { kind: 'choice', values: [15, 12, 18, 20, 14, 16, 22, 25, 10, 24, 28, 30, 32, 35, 40, 45] },
      sv: shownVar('v'),
    },
    answer: (v) => Number(v.v) * 4,
    format: grouped,
    distractors: (ctx) => {
      const v = Number(ctx.vars.v);
      return shownList([v + 4, v * 5, v * 3, v]);
    },
    explain: ({ vars, answer }) => `${vars.sv} × 4 = ${answer} კმ.`,
  }),
  bank({
    id: 'g5-u06-q21',
    subtopicId: 'u06-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მატარებელი 5 საათის განმავლობაში საათში {sv} კმ-ს გადის. რა მანძილს გაივლის?',
    variables: {
      v: { kind: 'choice', values: [90, 80, 75, 100, 95, 85, 70, 110, 60, 65, 105, 115, 120, 125, 130, 140] },
      sv: shownVar('v'),
    },
    answer: (v) => Number(v.v) * 5,
    format: grouped,
    distractors: (ctx) => {
      const v = Number(ctx.vars.v);
      return shownList([v + 5, v * 4, v * 6, v]);
    },
    explain: ({ vars, answer }) => `${vars.sv} × 5 = ${answer} კმ.`,
  }),
  bank({
    id: 'g5-u06-q22',
    subtopicId: 'u06-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ფეხით მოსიარულე საათში 4 კმ-ს გადის. რამდენ კილომეტრს გაივლის 6 საათში?',
    variables: {
      v: { kind: 'choice', values: [4, 5, 3, 6, 7, 8, 9, 10, 12, 2, 11, 14, 15, 16, 18, 20] },
      sv: shownVar('v'),
    },
    answer: (v) => Number(v.v) * 6,
    format: grouped,
    distractors: (ctx) => {
      const v = Number(ctx.vars.v);
      return shownList([v + 6, v * 5, v * 7, v]);
    },
    explain: ({ vars, answer }) => `${vars.sv} × 6 = ${answer} კმ.`,
  }),
  bank({
    id: 'g5-u06-q23',
    subtopicId: 'u06-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'თვითმფრინავი 2 საათის განმავლობაში საათში {sv} კმ-ს გადის. რა მანძილს გაივლის?',
    variables: {
      v: { kind: 'choice', values: [750, 600, 800, 700, 900, 650, 850, 550, 500, 950, 1000, 1050, 450, 400, 350, 300] },
      sv: shownVar('v'),
    },
    answer: (v) => Number(v.v) * 2,
    format: grouped,
    distractors: (ctx) => {
      const v = Number(ctx.vars.v);
      return shownList([v + 2, v * 3, v / 2, v]);
    },
    explain: ({ vars, answer }) => `${vars.sv} × 2 = ${answer} კმ.`,
  }),
  bank({
    id: 'g5-u06-q24',
    subtopicId: 'u06-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მოტოციკლეტი 3 საათის განმავლობაში საათში {sv} კმ-ს გადის. რა მანძილს გაივლის?',
    variables: {
      v: { kind: 'choice', values: [65, 55, 75, 45, 85, 60, 50, 70, 40, 80, 90, 95, 100, 35, 30, 25] },
      sv: shownVar('v'),
    },
    answer: (v) => Number(v.v) * 3,
    format: grouped,
    distractors: (ctx) => {
      const v = Number(ctx.vars.v);
      return shownList([v + 3, v * 2, v * 4, v]);
    },
    explain: ({ vars, answer }) => `${vars.sv} × 3 = ${answer} კმ.`,
  }),

  // ─────────────── U06.5 — დროის პოვნა ───────────────
  bank({
    id: 'g5-u06-q25',
    subtopicId: 'u06-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ავტობუსმა {sd} კმ გაიარა საათში {sv} კმ სიჩქარით. რამდენი საათი იმოგზაურა ავტობუსმა?',
    variables: {
      row: { kind: 'choice', values: timeRows },
      d: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      v: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      sd: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sv: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => Number(v.d) / Number(v.v),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 1, answer - 1 > 0 ? answer - 1 : answer + 2, answer * 2, answer + 10]);
    },
    explain: ({ vars, answer }) =>
      `დრო = მანძილი ÷ სიჩქარე = ${vars.sd} ÷ ${vars.sv} = ${answer} საათი.`,
  }),
  bank({
    id: 'g5-u06-q26',
    subtopicId: 'u06-05',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ველოსიპედისტმა {sd} კმ გაიარა საათში {sv} კმ სიჩქარით. რამდენი საათი იმოგზაურა?',
    variables: {
      row: { kind: 'choice', values: timeRows },
      d: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      v: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      sd: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sv: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => Number(v.d) / Number(v.v),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 1, answer * 2, answer + 2, answer + 10]);
    },
    explain: ({ vars, answer }) => `${vars.sd} ÷ ${vars.sv} = ${answer} საათი.`,
  }),
  bank({
    id: 'g5-u06-q27',
    subtopicId: 'u06-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'თვითმფრინავმა {sd} კმ გაიარა საათში {sv} კმ სიჩქარით. რამდენი საათი იფრინა?',
    variables: {
      row: { kind: 'choice', values: timeRows },
      d: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      v: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      sd: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sv: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => Number(v.d) / Number(v.v),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 1, answer - 1 > 0 ? answer - 1 : answer + 2, answer * 2, answer + 5]);
    },
    explain: ({ vars, answer }) => `${vars.sd} ÷ ${vars.sv} = ${answer} საათი.`,
  }),
  bank({
    id: 'g5-u06-q28',
    subtopicId: 'u06-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ფეხით მოსიარულემ {sd} კმ-ს საათში {sv} კმ სიჩქარით გაიარა. რამდენი საათი იარა?',
    variables: {
      row: { kind: 'choice', values: timeRows },
      d: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      v: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      sd: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sv: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => Number(v.d) / Number(v.v),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 1, answer + 2, answer * 2, answer + 5]);
    },
    explain: ({ vars, answer }) => `20 ÷ ${vars.sv} = ${answer} საათი.`,
  }),
  bank({
    id: 'g5-u06-q29',
    subtopicId: 'u06-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'თვითმფრინავი {sd} კმ-ს საათში {sv} კმ სიჩქარით დაფრინავს. რამდენი საათი სჭირდება ამ მანძილის დასაფარად?',
    variables: {
      row: { kind: 'choice', values: timeRows },
      d: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      v: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      sd: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sv: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => Number(v.d) / Number(v.v),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 1, answer + 2, answer * 2, answer + 10]);
    },
    explain: ({ vars, answer }) => `${vars.sd} ÷ ${vars.sv} = ${answer} საათი.`,
  }),
  bank({
    id: 'g5-u06-q30',
    subtopicId: 'u06-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მატარებელმა {sd} კმ გაიარა საათში {sv} კმ სიჩქარით. რამდენი საათი იმოგზაურა მატარებელმა?',
    variables: {
      row: { kind: 'choice', values: timeRows },
      d: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      v: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      sd: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sv: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => Number(v.d) / Number(v.v),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 1, answer - 1 > 0 ? answer - 1 : answer + 2, answer * 2, answer + 10]);
    },
    explain: ({ vars, answer }) => `${vars.sd} ÷ ${vars.sv} = ${answer} საათი.`,
  }),

  // ─────────────── U06.6 — სიჩქარის პოვნა ───────────────
  bank({
    id: 'g5-u06-q31',
    subtopicId: 'u06-06',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ავტობუსმა {st} საათში {sd} კმ გაიარა. რა იყო მისი სიჩქარე?',
    variables: {
      row: { kind: 'choice', values: speedRows },
      d: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      t: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      sd: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      st: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => Number(v.d) / Number(v.t),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 10, answer - 10 > 0 ? answer - 10 : answer + 15, answer * 2, answer + 5]);
    },
    explain: ({ vars, answer }) =>
      `სიჩქარე = მანძილი ÷ დრო = ${vars.sd} ÷ ${vars.st} = ${answer} კმ/სთ.`,
  }),
  bank({
    id: 'g5-u06-q32',
    subtopicId: 'u06-06',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ველოსიპედისტმა 4 საათში {sd} კმ გაიარა. რა იყო მისი სიჩქარე?',
    variables: {
      d: { kind: 'choice', values: [64, 48, 72, 56, 80, 60, 40, 84, 44, 52, 68, 76, 88, 92, 96, 100] },
      sd: shownVar('d'),
    },
    answer: (v) => Number(v.d) / 4,
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 10, answer - 10 > 0 ? answer - 10 : answer + 15, answer * 2, answer + 4]);
    },
    explain: ({ vars, answer }) => `${vars.sd} ÷ 4 = ${answer} კმ/სთ.`,
  }),
  bank({
    id: 'g5-u06-q33',
    subtopicId: 'u06-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მატარებელმა 5 საათში {sd} კმ გაიარა. რა იყო მისი სიჩქარე?',
    variables: {
      d: { kind: 'choice', values: [450, 350, 500, 400, 550, 300, 600, 250, 150, 200, 650, 700, 750, 800, 850, 900] },
      sd: shownVar('d'),
    },
    answer: (v) => Number(v.d) / 5,
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 10, answer - 10 > 0 ? answer - 10 : answer + 15, answer * 2, answer + 5]);
    },
    explain: ({ vars, answer }) => `${vars.sd} ÷ 5 = ${answer} კმ/სთ.`,
  }),
  bank({
    id: 'g5-u06-q34',
    subtopicId: 'u06-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ფეხით მოსიარულემ 3 საათში 12 კმ გაიარა. რამდენი კილომეტრი გაიარა საათში საშუალოდ?',
    variables: {
      d: { kind: 'choice', values: [12, 15, 9, 18, 6, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51] },
      sd: shownVar('d'),
    },
    answer: (v) => Number(v.d) / 3,
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 1, answer + 2, answer * 3, answer + 5]);
    },
    explain: ({ vars, answer }) => `${vars.sd} ÷ 3 = ${answer} კმ/სთ.`,
  }),
  bank({
    id: 'g5-u06-q35',
    subtopicId: 'u06-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'თვითმფრინავმა 2 საათში 1 400 კმ გაიარა. რა იყო მისი სიჩქარე?',
    variables: {
      d: { kind: 'choice', values: [1_400, 1_200, 1_600, 1_000, 1_800, 800, 1_500, 900, 2_000, 700, 600, 500, 2_200, 2_400, 2_600, 2_800] },
      sd: shownVar('d'),
    },
    answer: (v) => Number(v.d) / 2,
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 100, answer - 100, answer * 2, answer + 50]);
    },
    explain: ({ vars, answer }) => `${vars.sd} ÷ 2 = ${answer} კმ/სთ.`,
  }),
  bank({
    id: 'g5-u06-q36',
    subtopicId: 'u06-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მოტოციკლეტმა 4 საათში {sd} კმ გაიარა. რა იყო მისი სიჩქარე?',
    variables: {
      row: { kind: 'choice', values: speedRows },
      d: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      t: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      sd: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
    },
    answer: (v) => Number(v.d) / Number(v.t),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 10, answer - 10 > 0 ? answer - 10 : answer + 15, answer * 2, answer + 5]);
    },
    explain: ({ vars, answer }) => `${vars.sd} ÷ 4 = ${answer} კმ/სთ.`,
  }),
];
