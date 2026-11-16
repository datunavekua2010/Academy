import type { QuestionTemplate, Vars } from './types';
import { C, D, I, MINUS, N, par, q6, sg } from './g6-helpers';
import { textOptions } from './g7-u08-proportion-percent';

/**
 * Grade VII — Unit 10: the number line and the coordinate plane.
 *
 * Converted from the academy's Grade VII `U10` bank: 8 subtopics × 6 questions.
 *
 * Intervals are printed as `[a; b)` with every signed end through `sg`; the key
 * of each interval task is rebuilt from the drawn ends and the drawn brackets.
 * Points are printed `A(−3; 4)`. Slips are the slips of the topic: the open end
 * taken as closed, abscissa and ordinate swapped, the wrong axis for a
 * reflection, the sum of the ends for the midpoint.
 */

export const G7_U10_SUBTOPICS = ['u10-01', 'u10-02', 'u10-03', 'u10-04', 'u10-05', 'u10-06', 'u10-07', 'u10-08'] as const;

const T = 'g7-number-line';
let seq = 0;
const nextId = (): string => `g7-u10-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic' | 'grade'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, grade: 7, ...spec });

const g = (v: Vars, key: string): number => N(v, key);
const S = (v: Vars, key: string): string => sg(N(v, key));
const B01 = C([0, 1]);
const INF = '∞';
const NEG_INF = `${MINUS}∞`;

/** `[a; b)` from the printed ends and the bracket flags (1 = closed). */
const br = (lo: string, hi: string, lc: number, rc: number): string => `${lc ? '[' : '('}${lo}; ${hi}${rc ? ']' : ')'}`;
const iv = (a: number, b: number, lc: number, rc: number): string => br(sg(a), sg(b), lc, rc);
const P2 = (x: number, y: number): string => `(${sg(x)}; ${sg(y)})`;
/** Whole numbers as options: the key first, then the slips, then its neighbours. */
const sgOptions = (key: number, slips: number[], min?: number): string[] => {
  const out = [sg(key)];
  for (const n of [...slips, key + 1, key - 1, key + 2, key - 2, key + 3, key - 3]) {
    if (!Number.isInteger(n) || (min !== undefined && n < min)) continue;
    const text = sg(n);
    if (!out.includes(text)) out.push(text);
  }
  return out;
};
const ptOptions = (x: number, y: number, slips: Array<[number, number]>): string[] => {
  const out = [P2(x, y)];
  for (const [a, b] of [...slips, [x + 1, y], [x, y + 1], [x - 1, y], [x, y - 1], [x + 2, y + 1]] as Array<[number, number]>) {
    const text = P2(a, b);
    if (!out.includes(text)) out.push(text);
  }
  return out;
};
const eq1 = (L: string, n: number): string => `${L} = ${sg(n)}`;

const LP = ['A', 'B', 'C', 'D', 'P', 'Q', 'M', 'K'];
const Lp = C(LP);
const PAIRS = C(['A|B', 'C|D', 'M|N', 'K|L', 'P|Q']);
const pairVars = {
  lp: PAIRS,
  L1: D((v: Vars) => String(v.lp).split('|')[0]!),
  L2: D((v: Vars) => String(v.lp).split('|')[1]!),
};
/** An abscissa/ordinate that is never zero. */
const nz = (n: number) => I(-n, n, { nonZero: true });
/** Display vars for a point's two coordinates. */
const XY = (x = 'x', y = 'y') => ({ X: D((v: Vars) => S(v, x)), Y: D((v: Vars) => S(v, y)) });

const QUADS = ['I მეოთხედში', 'II მეოთხედში', 'III მეოთხედში', 'IV მეოთხედში'];
const quadrant = (sx: number, sy: number): string => (sx > 0 ? (sy > 0 ? QUADS[0]! : QUADS[3]!) : sy > 0 ? QUADS[1]! : QUADS[2]!);
const quadTemplate = (sx: number, sy: number): QuestionTemplate =>
  t({
    sub: 'u10-03',
    prompt: 'რომელ მეოთხედში მდებარეობს წერტილი {L}({X}; {Y})?',
    vars: { L: Lp, x: I(1, 9), y: I(1, 9), X: D((v: Vars) => sg(sx * g(v, 'x'))), Y: D((v: Vars) => sg(sy * g(v, 'y'))) },
    answer: () => quadrant(sx, sy),
    options: (_v, right) => textOptions(right, QUADS),
    why: (_v, a) => `აბსცისა ${sx > 0 ? 'დადებითია' : 'უარყოფითია'}, ორდინატა ${sy > 0 ? 'დადებითია' : 'უარყოფითია'}; წერტილი მდებარეობს ${a}.`,
  });

const AXES = ['x-ღერძზე', 'y-ღერძზე', 'კოორდინატთა სათავეში', 'არც ერთ ღერძზე'];
const members = (a: number, b: number, lc: number, rc: number): string => {
  const out: number[] = [];
  for (let n = lc ? a : a + 1; n <= (rc ? b : b - 1); n += 1) out.push(n);
  return out.map(sg).join(', ');
};
const KEEP = (n: number): string => (n ? 'ფრჩხილი კვადრატულია — ბოლო წერტილი შედის' : 'ფრჩხილი მრგვალია — ბოლო წერტილი არ შედის');
const OPSIGN: Record<string, string> = { '0': '>', '1': '≥', '2': '<', '3': '≤' };
const rayText = (op: number, a: number): string => {
  const A = sg(a);
  if (op === 0) return `(${A}; +${INF})`;
  if (op === 1) return `[${A}; +${INF})`;
  if (op === 2) return `(${NEG_INF}; ${A})`;
  return `(${NEG_INF}; ${A}]`;
};
const midOpts = (key: number, slips: number[]): string[] => sgOptions(key, slips);

export const G7_U10_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U10.1 — რიცხვითი შუალედები ═════════
  t({
    sub: 'u10-01',
    prompt: 'ჩაწერე შუალედის სახით ყველა {L}, რომლისთვისაც {A} {o1} {L} {o2} {B}.',
    vars: { L: C(['x', 'y', 't']), a: I(-9, 4), w: I(2, 9), lc: B01, rc: B01, A: D((v: Vars) => S(v, 'a')), B: D((v: Vars) => sg(g(v, 'a') + g(v, 'w'))), o1: D((v: Vars) => (g(v, 'lc') ? '≤' : '<')), o2: D((v: Vars) => (g(v, 'rc') ? '≤' : '<')) },
    answer: (v) => iv(g(v, 'a'), g(v, 'a') + g(v, 'w'), g(v, 'lc'), g(v, 'rc')),
    options: (v, right) => {
      const [a, b] = [g(v, 'a'), g(v, 'a') + g(v, 'w')];
      return textOptions(right, [iv(a, b, 1 - g(v, 'lc'), g(v, 'rc')), iv(a, b, g(v, 'lc'), 1 - g(v, 'rc')), iv(a, b, 1 - g(v, 'lc'), 1 - g(v, 'rc'))]);
    },
    why: (v, a) => `${g(v, 'lc') ? 'ნაკლები ან ტოლი ნიშანი ბოლოს ათავსებს შუალედში' : 'მკაცრი უტოლობა ბოლოს გამორიცხავს'}; ${v.L} ∈ ${a}.`,
  }),
  t({
    sub: 'u10-01',
    prompt: 'ჩაწერე უტოლობის სახით შუალედი {IV}.',
    vars: { a: I(-9, 4), w: I(2, 9), lc: B01, rc: B01, IV: D((v: Vars) => iv(g(v, 'a'), g(v, 'a') + g(v, 'w'), g(v, 'lc'), g(v, 'rc'))) },
    answer: (v) => `${S(v, 'a')} ${g(v, 'lc') ? '≤' : '<'} x ${g(v, 'rc') ? '≤' : '<'} ${sg(g(v, 'a') + g(v, 'w'))}`,
    options: (v, right) => {
      const [a, b] = [S(v, 'a'), sg(g(v, 'a') + g(v, 'w'))];
      const f = (lc: number, rc: number): string => `${a} ${lc ? '≤' : '<'} x ${rc ? '≤' : '<'} ${b}`;
      return textOptions(right, [f(1 - g(v, 'lc'), g(v, 'rc')), f(g(v, 'lc'), 1 - g(v, 'rc')), f(1 - g(v, 'lc'), 1 - g(v, 'rc'))]);
    },
    why: (v, a) => `${g(v, 'lc') ? 'კვადრატული' : 'მრგვალი'} ფრჩხილი მარცხნივ და ${g(v, 'rc') ? 'კვადრატული' : 'მრგვალი'} მარჯვნივ; ${a}.`,
  }),
  t({
    sub: 'u10-01',
    prompt: 'ეკუთვნის თუ არა რიცხვი {X} შუალედს {IV}?',
    vars: {
      a: I(-9, 4),
      w: I(2, 9),
      lc: B01,
      rc: B01,
      pos: C([0, 1, 2, 3, 4]),
      X: D((v: Vars) => sg([g(v, 'a'), g(v, 'a') + g(v, 'w'), g(v, 'a') + 1, g(v, 'a') - 1, g(v, 'a') + g(v, 'w') + 1][g(v, 'pos')]!)),
      IV: D((v: Vars) => iv(g(v, 'a'), g(v, 'a') + g(v, 'w'), g(v, 'lc'), g(v, 'rc'))),
    },
    answer: (v) => (g(v, 'pos') === 2 || (g(v, 'pos') === 0 && g(v, 'lc') === 1) || (g(v, 'pos') === 1 && g(v, 'rc') === 1) ? 'დიახ' : 'არა'),
    options: () => ['დიახ', 'არა'],
    optionCount: 2,
    why: (v, a) => {
      const pos = g(v, 'pos');
      if (pos === 0) return `${v.X} შუალედის მარცხენა ბოლოა; ${KEEP(g(v, 'lc'))}. ${a}.`;
      if (pos === 1) return `${v.X} შუალედის მარჯვენა ბოლოა; ${KEEP(g(v, 'rc'))}. ${a}.`;
      if (pos === 2) return `${v.X} ბოლოებს შორისაა, ამიტომ შუალედს ეკუთვნის. ${a}.`;
      return `${v.X} ბოლოებს გარეთაა, ამიტომ შუალედს არ ეკუთვნის. ${a}.`;
    },
  }),
  t({
    sub: 'u10-01',
    prompt: 'ჩამოთვლილთაგან რომელი რიცხვი ეკუთვნის შუალედს {IV}?',
    vars: { a: I(-9, 4), w: I(2, 9), lc: B01, rc: B01, side: B01, IV: D((v: Vars) => iv(g(v, 'a'), g(v, 'a') + g(v, 'w'), g(v, 'lc'), g(v, 'rc'))) },
    answer: (v) => sg(g(v, 'side') ? g(v, 'a') + g(v, 'w') - 1 : g(v, 'a') + 1),
    options: (v, right) => {
      const [a, b, lc, rc] = [g(v, 'a'), g(v, 'a') + g(v, 'w'), g(v, 'lc'), g(v, 'rc')];
      const cand = [lc ? a - 1 : a, rc ? b + 1 : b, a - 1, b + 1, a - 2, b + 2].map(sg);
      return textOptions(right, cand);
    },
    why: (_v, a) => `${a} ბოლოებს შორისაა, ამიტომ შუალედს ეკუთვნის; სხვა რიცხვები ბოლოებს გარეთაა ან გამორიცხული ბოლო წერტილია.`,
  }),
  t({
    sub: 'u10-01',
    prompt: 'ჩაწერე შუალედის სახით უტოლობა {L} {OP} {A}.',
    vars: { L: C(['x', 'y', 't']), a: I(-9, 9), op: C([0, 1, 2, 3]), A: D((v: Vars) => S(v, 'a')), OP: D((v: Vars) => OPSIGN[String(g(v, 'op'))]!) },
    answer: (v) => rayText(g(v, 'op'), g(v, 'a')),
    options: (v, right) => textOptions(right, [0, 1, 2, 3].filter((o) => o !== g(v, 'op')).map((o) => rayText(o, g(v, 'a')))),
    why: (v, a) => `უტოლობა ${v.L} ${v.OP} ${v.A} ${g(v, 'op') < 2 ? 'ათავსებს ყველა რიცხვს ამ წერტილის მარჯვნივ' : 'ათავსებს ყველა რიცხვს ამ წერტილის მარცხნივ'}; ${a}.`,
  }),
  t({
    sub: 'u10-01',
    prompt: 'იპოვე ყველა მთელი რიცხვი, რომელიც ეკუთვნის შუალედს {IV}.',
    vars: { a: I(-6, 2), w: I(3, 6), lc: B01, rc: B01, IV: D((v: Vars) => iv(g(v, 'a'), g(v, 'a') + g(v, 'w'), g(v, 'lc'), g(v, 'rc'))) },
    answer: (v) => members(g(v, 'a'), g(v, 'a') + g(v, 'w'), g(v, 'lc'), g(v, 'rc')),
    options: (v, right) => {
      const [a, b, lc, rc] = [g(v, 'a'), g(v, 'a') + g(v, 'w'), g(v, 'lc'), g(v, 'rc')];
      return textOptions(right, [members(a, b, 1 - lc, rc), members(a, b, lc, 1 - rc), members(a, b, 1 - lc, 1 - rc)]);
    },
    why: (v, a) => `${g(v, 'lc') ? 'მარცხენა ბოლო შედის' : 'მარცხენა ბოლო არ შედის'}, ${g(v, 'rc') ? 'მარჯვენა ბოლო შედის' : 'მარჯვენა ბოლო არ შედის'}; მთელი რიცხვებია ${a}.`,
  }),

  // ═════════ U10.2 — შუალედების გაერთიანება და თანაკვეთა ═════════
  t({
    sub: 'u10-02',
    prompt: 'იპოვე შუალედების {I1} და {I2} თანაკვეთა.',
    vars: {
      a: I(-8, 2),
      i: I(1, 4),
      j: I(1, 4),
      k: I(1, 4),
      I1: D((v: Vars) => iv(g(v, 'a'), g(v, 'a') + g(v, 'i') + g(v, 'j'), 1, 1)),
      I2: D((v: Vars) => iv(g(v, 'a') + g(v, 'i'), g(v, 'a') + g(v, 'i') + g(v, 'j') + g(v, 'k'), 1, 1)),
    },
    answer: (v) => iv(g(v, 'a') + g(v, 'i'), g(v, 'a') + g(v, 'i') + g(v, 'j'), 1, 1),
    options: (v, right) => {
      const [a, c, b, d] = [g(v, 'a'), g(v, 'a') + g(v, 'i'), g(v, 'a') + g(v, 'i') + g(v, 'j'), g(v, 'a') + g(v, 'i') + g(v, 'j') + g(v, 'k')];
      return textOptions(right, [iv(a, d, 1, 1), iv(c, d, 1, 1), iv(a, b, 1, 1), iv(c, b, 0, 0)]);
    },
    why: (_v, a) => `საერთო ნაწილი იწყება უფრო დიდი მარცხენა ბოლოდან და მთავრდება უფრო პატარა მარჯვენა ბოლოთი: ${a}.`,
  }),
  t({
    sub: 'u10-02',
    prompt: 'იპოვე შუალედების {I1} და {I2} თანაკვეთა.',
    vars: {
      a: I(-8, 0),
      i: I(2, 5),
      j: I(2, 5),
      tl: B01,
      tr: B01,
      lc: B01,
      rc: B01,
      I1: D((v: Vars) => iv(g(v, 'a'), g(v, 'a') + g(v, 'i'), g(v, 'lc'), g(v, 'tr'))),
      I2: D((v: Vars) => iv(g(v, 'a') + g(v, 'i'), g(v, 'a') + g(v, 'i') + g(v, 'j'), g(v, 'tl'), g(v, 'rc'))),
    },
    answer: (v) => (g(v, 'tl') && g(v, 'tr') ? `{${sg(g(v, 'a') + g(v, 'i'))}}` : '∅'),
    options: (v, right) => {
      const [a, tt, b] = [g(v, 'a'), g(v, 'a') + g(v, 'i'), g(v, 'a') + g(v, 'i') + g(v, 'j')];
      return textOptions(right, [g(v, 'tl') && g(v, 'tr') ? '∅' : `{${sg(tt)}}`, iv(a, b, 1, 1), iv(a, b, 0, 0), iv(a, b, g(v, 'lc'), g(v, 'rc'))]);
    },
    why: (v, a) => `შუალედები მხოლოდ ${sg(g(v, 'a') + g(v, 'i'))} წერტილში ეხება ერთმანეთს; ${g(v, 'tl') && g(v, 'tr') ? 'ორივეში ეს წერტილი შედის' : 'ერთში მაინც არ შედის'}. ${a}.`,
  }),
  t({
    sub: 'u10-02',
    prompt: 'იპოვე შუალედების {I1} და {I2} გაერთიანება.',
    vars: {
      a: I(-8, 0),
      i: I(2, 5),
      j: I(1, 4),
      k: I(2, 5),
      lc1: B01,
      rc1: B01,
      lc2: B01,
      rc2: B01,
      I1: D((v: Vars) => iv(g(v, 'a'), g(v, 'a') + g(v, 'i'), g(v, 'lc1'), g(v, 'rc1'))),
      I2: D((v: Vars) => iv(g(v, 'a') + g(v, 'i') + g(v, 'j'), g(v, 'a') + g(v, 'i') + g(v, 'j') + g(v, 'k'), g(v, 'lc2'), g(v, 'rc2'))),
    },
    answer: (v) => `${v.I1} ∪ ${v.I2}`,
    options: (v, right) => {
      const [a, b, c, d] = [g(v, 'a'), g(v, 'a') + g(v, 'i'), g(v, 'a') + g(v, 'i') + g(v, 'j'), g(v, 'a') + g(v, 'i') + g(v, 'j') + g(v, 'k')];
      return textOptions(right, [iv(a, d, g(v, 'lc1'), g(v, 'rc2')), `${iv(b, c, 1 - g(v, 'rc1'), 1 - g(v, 'lc2'))}`, '∅', `${iv(a, b, 1 - g(v, 'lc1'), g(v, 'rc1'))} ∪ ${iv(c, d, g(v, 'lc2'), 1 - g(v, 'rc2'))}`]);
    },
    why: (_v, a) => `შუალედებს საერთო წერტილი არ აქვთ, ამიტომ გაერთიანება ორი ცალკე ნაწილია: ${a}.`,
  }),
  t({
    sub: 'u10-02',
    prompt: 'იპოვე შუალედების {I1} და {I2} თანაკვეთა.',
    vars: {
      a: I(-8, 2),
      i: I(1, 4),
      j: I(1, 4),
      k: I(1, 4),
      lc1: B01,
      rc1: B01,
      lc2: B01,
      rc2: B01,
      I1: D((v: Vars) => iv(g(v, 'a'), g(v, 'a') + g(v, 'i') + g(v, 'j'), g(v, 'lc1'), g(v, 'rc1'))),
      I2: D((v: Vars) => iv(g(v, 'a') + g(v, 'i'), g(v, 'a') + g(v, 'i') + g(v, 'j') + g(v, 'k'), g(v, 'lc2'), g(v, 'rc2'))),
    },
    answer: (v) => iv(g(v, 'a') + g(v, 'i'), g(v, 'a') + g(v, 'i') + g(v, 'j'), g(v, 'lc2'), g(v, 'rc1')),
    options: (v, right) => {
      const [a, c, b, d] = [g(v, 'a'), g(v, 'a') + g(v, 'i'), g(v, 'a') + g(v, 'i') + g(v, 'j'), g(v, 'a') + g(v, 'i') + g(v, 'j') + g(v, 'k')];
      return textOptions(right, [iv(a, d, g(v, 'lc1'), g(v, 'rc2')), iv(c, b, 1 - g(v, 'lc2'), g(v, 'rc1')), iv(c, b, g(v, 'lc2'), 1 - g(v, 'rc1')), iv(c, d, g(v, 'lc2'), g(v, 'rc2'))]);
    },
    why: (v, a) => `საერთო ნაწილი ${sg(g(v, 'a') + g(v, 'i'))}-დან ${sg(g(v, 'a') + g(v, 'i') + g(v, 'j'))}-მდეა, ბოლოების ფრჩხილები იმ შუალედისაა, რომლის ბოლოც საზღვარს ადგენს: ${a}.`,
  }),
  t({
    sub: 'u10-02',
    prompt: 'იპოვე შუალედების {I1} და {I2} გაერთიანება.',
    vars: {
      a: I(-8, 0),
      i: I(3, 6),
      j: I(1, 3),
      k: I(2, 5),
      lc1: B01,
      rc1: B01,
      lc2: B01,
      rc2: B01,
      I1: D((v: Vars) => iv(g(v, 'a'), g(v, 'a') + g(v, 'i'), g(v, 'lc1'), g(v, 'rc1'))),
      I2: D((v: Vars) => iv(g(v, 'a') + g(v, 'j'), g(v, 'a') + g(v, 'i') + g(v, 'k'), g(v, 'lc2'), g(v, 'rc2'))),
    },
    constraints: [{ test: (v: Vars) => g(v, 'j') < g(v, 'i'), note: 'the intervals overlap' }],
    answer: (v) => iv(g(v, 'a'), g(v, 'a') + g(v, 'i') + g(v, 'k'), g(v, 'lc1'), g(v, 'rc2')),
    options: (v, right) => {
      const [a, c, b, d] = [g(v, 'a'), g(v, 'a') + g(v, 'j'), g(v, 'a') + g(v, 'i'), g(v, 'a') + g(v, 'i') + g(v, 'k')];
      return textOptions(right, [iv(c, b, g(v, 'lc2'), g(v, 'rc1')), iv(a, d, 1 - g(v, 'lc1'), g(v, 'rc2')), iv(a, d, g(v, 'lc1'), 1 - g(v, 'rc2')), iv(a, b, g(v, 'lc1'), g(v, 'rc1'))]);
    },
    why: (_v, a) => `შუალედები გადაფარავს ერთმანეთს, ამიტომ გაერთიანება მთლიანი შუალედია უკიდურესი ბოლოებით: ${a}.`,
  }),
  t({
    sub: 'u10-02',
    prompt: 'იპოვე შუალედების ({NI}; {A}{rb1} და {lb2}{C}; +∞) თანაკვეთა.',
    vars: {
      c: I(-8, 2),
      w: I(1, 8),
      rc1: B01,
      lc2: B01,
      NI: D(() => NEG_INF),
      A: D((v: Vars) => sg(g(v, 'c') + g(v, 'w'))),
      C: D((v: Vars) => S(v, 'c')),
      rb1: D((v: Vars) => (g(v, 'rc1') ? ']' : ')')),
      lb2: D((v: Vars) => (g(v, 'lc2') ? '[' : '(')),
    },
    answer: (v) => iv(g(v, 'c'), g(v, 'c') + g(v, 'w'), g(v, 'lc2'), g(v, 'rc1')),
    options: (v, right) => {
      const [c, a] = [g(v, 'c'), g(v, 'c') + g(v, 'w')];
      return textOptions(right, [`(${NEG_INF}; +${INF})`, iv(a, c, g(v, 'lc2'), g(v, 'rc1')), iv(c, a, 1 - g(v, 'lc2'), g(v, 'rc1')), iv(c, a, g(v, 'lc2'), 1 - g(v, 'rc1'))]);
    },
    why: (v, a) => `ერთი შუალედი ${v.A}-მდეა, მეორე ${v.C}-დან; საერთო ნაწილია ${a}.`,
  }),

  // ═════════ U10.3 — მეოთხედები და ღერძები ═════════
  quadTemplate(1, 1),
  quadTemplate(-1, 1),
  quadTemplate(-1, -1),
  quadTemplate(1, -1),
  t({
    sub: 'u10-03',
    prompt: 'რომელ ღერძზე მდებარეობს წერტილი {L}(0; {Y})?',
    vars: { L: Lp, y: nz(9), Y: D((v: Vars) => S(v, 'y')) },
    answer: () => AXES[1]!,
    options: (_v, right) => textOptions(right, AXES),
    why: (_v, a) => `აბსცისა ნულია, ამიტომ წერტილი მდებარეობს ${a}.`,
  }),
  t({
    sub: 'u10-03',
    prompt: 'რომელ ღერძზე მდებარეობს წერტილი {L}({X}; 0)?',
    vars: { L: Lp, x: nz(9), X: D((v: Vars) => S(v, 'x')) },
    answer: () => AXES[0]!,
    options: (_v, right) => textOptions(right, AXES),
    why: (_v, a) => `ორდინატა ნულია, ამიტომ წერტილი მდებარეობს ${a}.`,
  }),

  // ═════════ U10.4 — წერტილის კოორდინატები ═════════
  t({
    sub: 'u10-04',
    prompt: 'ჩაწერე წერტილის კოორდინატები, თუ მისი აბსცისაა {X}, ხოლო ორდინატა — {Y}.',
    vars: { x: nz(9), y: nz(9), ...XY() },
    constraints: [{ test: (v: Vars) => Math.abs(g(v, 'x')) !== Math.abs(g(v, 'y')), note: 'the coordinates are distinguishable' }],
    answer: (v) => P2(g(v, 'x'), g(v, 'y')),
    options: (v) => ptOptions(g(v, 'x'), g(v, 'y'), [[g(v, 'y'), g(v, 'x')], [-g(v, 'x'), g(v, 'y')], [g(v, 'x'), -g(v, 'y')]]),
    why: (_v, a) => `კოორდინატები იწერება (აბსცისა; ორდინატა): ${a}.`,
  }),
  t({
    sub: 'u10-04',
    prompt: 'წერტილია {L}({X}; {Y}). რომელია მისი აბსცისა?',
    vars: { L: Lp, x: nz(9), y: nz(9), ...XY() },
    constraints: [{ test: (v: Vars) => Math.abs(g(v, 'x')) !== Math.abs(g(v, 'y')), note: 'the coordinates are distinguishable' }],
    answer: (v) => S(v, 'x'),
    options: (v) => sgOptions(g(v, 'x'), [g(v, 'y'), -g(v, 'x'), g(v, 'x') + g(v, 'y')]),
    why: (_v, a) => `აბსცისა წერტილის პირველი კოორდინატია: ${a}.`,
  }),
  t({
    sub: 'u10-04',
    prompt: 'წერტილია {L}({X}; {Y}). რომელია მისი ორდინატა?',
    vars: { L: Lp, x: nz(9), y: nz(9), ...XY() },
    constraints: [{ test: (v: Vars) => Math.abs(g(v, 'x')) !== Math.abs(g(v, 'y')), note: 'the coordinates are distinguishable' }],
    answer: (v) => S(v, 'y'),
    options: (v) => sgOptions(g(v, 'y'), [g(v, 'x'), -g(v, 'y'), g(v, 'x') + g(v, 'y')]),
    why: (_v, a) => `ორდინატა წერტილის მეორე კოორდინატია: ${a}.`,
  }),
  t({
    sub: 'u10-04',
    prompt: 'წერტილი {L} მდებარეობს x-ღერძზე და მისი აბსცისაა {X}. ჩაწერე მისი კოორდინატები.',
    vars: { L: Lp, x: nz(9), ...XY('x', 'x') },
    answer: (v) => P2(g(v, 'x'), 0),
    options: (v) => ptOptions(g(v, 'x'), 0, [[0, g(v, 'x')], [g(v, 'x'), g(v, 'x')], [0, 0], [-g(v, 'x'), 0]]),
    why: (_v, a) => `x-ღერძზე ორდინატა ნულია: ${a}.`,
  }),
  t({
    sub: 'u10-04',
    prompt: 'წერტილი {L} მდებარეობს y-ღერძზე და მისი ორდინატაა {Y}. ჩაწერე მისი კოორდინატები.',
    vars: { L: Lp, y: nz(9), ...XY('y', 'y') },
    answer: (v) => P2(0, g(v, 'y')),
    options: (v) => ptOptions(0, g(v, 'y'), [[g(v, 'y'), 0], [g(v, 'y'), g(v, 'y')], [0, 0], [0, -g(v, 'y')]]),
    why: (_v, a) => `y-ღერძზე აბსცისა ნულია: ${a}.`,
  }),
  t({
    sub: 'u10-04',
    prompt: 'იპოვე k, თუ წერტილი {L}{PT} მდებარეობს {AX}-ღერძზე.',
    vars: {
      L: Lp,
      a: I(-6, 6),
      m: nz(9),
      ax: B01,
      AX: D((v: Vars) => (g(v, 'ax') ? 'x' : 'y')),
      KA: D((v: Vars) => (g(v, 'a') === 0 ? 'k' : g(v, 'a') > 0 ? `k + ${g(v, 'a')}` : `k ${MINUS} ${-g(v, 'a')}`)),
      PT: D((v: Vars) => (g(v, 'ax') ? `(${S(v, 'm')}; ${v.KA})` : `(${v.KA}; ${S(v, 'm')})`)),
    },
    answer: (v) => eq1('k', -g(v, 'a') || 0),
    options: (v, right) => {
      const a = g(v, 'a');
      return textOptions(right, [eq1('k', a), eq1('k', g(v, 'm')), eq1('k', -g(v, 'm')), eq1('k', a + 1), eq1('k', -a - 1), eq1('k', 2)]);
    },
    why: (v, a) => `${g(v, 'ax') ? 'x-ღერძზე ორდინატა' : 'y-ღერძზე აბსცისა'} ნულია: ${v.KA} = 0, ამიტომ ${a}.`,
  }),

  // ═════════ U10.5 — მანძილი ორ წერტილს შორის ═════════
  t({
    sub: 'u10-05',
    prompt: 'იპოვე რიცხვით ღერძზე მდებარე წერტილებს {L1}({a}) და {L2}({b}) შორის მანძილი.',
    vars: { ...pairVars, a: I(1, 8), d: I(2, 9), b: D((v: Vars) => g(v, 'a') + g(v, 'd')) },
    answer: (v) => sg(g(v, 'd')),
    options: (v) => sgOptions(g(v, 'd'), [g(v, 'a') + g(v, 'b'), g(v, 'b'), g(v, 'a')], 1),
    why: (v, a) => `${v.b} ${MINUS} ${v.a} = ${a}.`,
  }),
  t({
    sub: 'u10-05',
    prompt: 'იპოვე რიცხვით ღერძზე მდებარე წერტილებს {L1}({A}) და {L2}({B}) შორის მანძილი.',
    vars: { ...pairVars, a: I(-9, -1), b: I(1, 9), A: D((v: Vars) => S(v, 'a')), B: D((v: Vars) => S(v, 'b')) },
    answer: (v) => sg(g(v, 'b') - g(v, 'a')),
    options: (v) => sgOptions(g(v, 'b') - g(v, 'a'), [Math.abs(Math.abs(g(v, 'a')) - g(v, 'b')), g(v, 'a') + g(v, 'b'), g(v, 'b')], 1),
    why: (v, a) => `${v.B} ${MINUS} (${v.A}) = ${v.B} + ${-g(v, 'a')} = ${a}.`,
  }),
  t({
    sub: 'u10-05',
    prompt: 'იპოვე საკოორდინატო სიბრტყეზე წერტილებს {L1}({X1}; {Y}) და {L2}({X2}; {Y}) შორის მანძილი.',
    vars: { ...pairVars, x1: I(-8, 4), d: I(2, 9), s: C([1, -1]), y: I(-8, 8), X1: D((v: Vars) => S(v, 'x1')), X2: D((v: Vars) => sg(g(v, 'x1') + g(v, 's') * g(v, 'd'))), Y: D((v: Vars) => S(v, 'y')) },
    answer: (v) => sg(g(v, 'd')),
    options: (v) => sgOptions(g(v, 'd'), [Math.abs(2 * g(v, 'x1') + g(v, 's') * g(v, 'd')), Math.abs(g(v, 'x1')) + Math.abs(g(v, 'x1') + g(v, 's') * g(v, 'd')), g(v, 'd') + Math.abs(g(v, 'y'))], 1),
    why: (_v, a) => `ორდინატები ტოლია, ამიტომ მანძილი აბსცისების სხვაობის მოდულია: ${a}.`,
  }),
  t({
    sub: 'u10-05',
    prompt: 'იპოვე წერტილებს {L1}({X}; {Y1}) და {L2}({X}; {Y2}) შორის მანძილი.',
    vars: { ...pairVars, x: I(-8, 8), y1: I(-8, 4), d: I(2, 9), s: C([1, -1]), X: D((v: Vars) => S(v, 'x')), Y1: D((v: Vars) => S(v, 'y1')), Y2: D((v: Vars) => sg(g(v, 'y1') + g(v, 's') * g(v, 'd'))) },
    answer: (v) => sg(g(v, 'd')),
    options: (v) => sgOptions(g(v, 'd'), [Math.abs(2 * g(v, 'y1') + g(v, 's') * g(v, 'd')), Math.abs(g(v, 'y1')) + Math.abs(g(v, 'y1') + g(v, 's') * g(v, 'd')), g(v, 'd') + Math.abs(g(v, 'x'))], 1),
    why: (_v, a) => `აბსცისები ტოლია, ამიტომ მანძილი ორდინატების სხვაობის მოდულია: ${a}.`,
  }),
  t({
    sub: 'u10-05',
    prompt: 'იპოვე წერტილებს {L1}(0; 0) და {L2}({X}; {Y}) შორის მანძილი.',
    vars: { ...pairVars, tr: C(['3|4|5', '6|8|10', '5|12|13', '8|15|17', '9|12|15', '7|24|25']), sx: C([1, -1]), sy: C([1, -1]), sw: B01,
      p: D((v: Vars) => Number(String(v.tr).split('|')[0])), q: D((v: Vars) => Number(String(v.tr).split('|')[1])), r: D((v: Vars) => Number(String(v.tr).split('|')[2])),
      X: D((v: Vars) => sg(g(v, 'sx') * (g(v, 'sw') ? g(v, 'q') : g(v, 'p')))), Y: D((v: Vars) => sg(g(v, 'sy') * (g(v, 'sw') ? g(v, 'p') : g(v, 'q')))) },
    answer: (v) => sg(g(v, 'r')),
    options: (v) => sgOptions(g(v, 'r'), [g(v, 'p') + g(v, 'q'), g(v, 'q') - g(v, 'p'), g(v, 'r') * g(v, 'r'), g(v, 'q')], 1),
    why: (v, a) => `მანძილი = √(${g(v, 'p') ** 2} + ${g(v, 'q') ** 2}) = √${g(v, 'r') ** 2} = ${a}.`,
  }),
  t({
    sub: 'u10-05',
    prompt: 'იპოვე წერტილებს {L1}({X1}; {Y1}) და {L2}({X2}; {Y2}) შორის მანძილი.',
    vars: { ...pairVars, x: I(-6, 6), y: I(-6, 6), tr: C(['3|4|5', '6|8|10', '5|12|13', '8|15|17', '9|12|15']), sx: C([1, -1]), sy: C([1, -1]),
      p: D((v: Vars) => Number(String(v.tr).split('|')[0])), q: D((v: Vars) => Number(String(v.tr).split('|')[1])), r: D((v: Vars) => Number(String(v.tr).split('|')[2])),
      X1: D((v: Vars) => S(v, 'x')), Y1: D((v: Vars) => S(v, 'y')), X2: D((v: Vars) => sg(g(v, 'x') + g(v, 'sx') * g(v, 'p'))), Y2: D((v: Vars) => sg(g(v, 'y') + g(v, 'sy') * g(v, 'q'))) },
    answer: (v) => sg(g(v, 'r')),
    options: (v) => sgOptions(g(v, 'r'), [g(v, 'p') + g(v, 'q'), g(v, 'q') - g(v, 'p'), g(v, 'r') * g(v, 'r'), g(v, 'q')], 1),
    why: (v, a) => `განივი ცვლილებებია ${g(v, 'p')} და ${g(v, 'q')}; მანძილი = √(${g(v, 'p') ** 2} + ${g(v, 'q') ** 2}) = ${a}.`,
  }),

  // ═════════ U10.6 — მონაკვეთის შუაწერტილი ═════════
  t({
    sub: 'u10-06',
    prompt: 'იპოვე მონაკვეთის შუაწერტილი, თუ მისი ბოლოებია {L1}({a}) და {L2}({b}) რიცხვით ღერძზე.',
    vars: { ...pairVars, a: I(1, 9), k: I(1, 9), b: D((v: Vars) => g(v, 'a') + 2 * g(v, 'k')) },
    answer: (v) => sg(g(v, 'a') + g(v, 'k')),
    options: (v) => midOpts(g(v, 'a') + g(v, 'k'), [g(v, 'a') + g(v, 'b'), g(v, 'k'), g(v, 'b') - g(v, 'a')]),
    why: (v, a) => `(${v.a} + ${v.b}) ÷ 2 = ${a}.`,
  }),
  t({
    sub: 'u10-06',
    prompt: 'იპოვე მონაკვეთის შუაწერტილის კოორდინატები, თუ ბოლოებია {L1}({x1}; {y1}) და {L2}({x2}; {y2}).',
    vars: { ...pairVars, x1: I(1, 7), y1: I(1, 7), kx: I(1, 5), ky: I(1, 5), x2: D((v: Vars) => g(v, 'x1') + 2 * g(v, 'kx')), y2: D((v: Vars) => g(v, 'y1') + 2 * g(v, 'ky')) },
    answer: (v) => P2(g(v, 'x1') + g(v, 'kx'), g(v, 'y1') + g(v, 'ky')),
    options: (v) => ptOptions(g(v, 'x1') + g(v, 'kx'), g(v, 'y1') + g(v, 'ky'), [[g(v, 'x1') + g(v, 'x2'), g(v, 'y1') + g(v, 'y2')], [g(v, 'kx'), g(v, 'ky')], [g(v, 'y1') + g(v, 'ky'), g(v, 'x1') + g(v, 'kx')]]),
    why: (v, a) => `აბსცისა (${v.x1} + ${v.x2}) ÷ 2, ორდინატა (${v.y1} + ${v.y2}) ÷ 2: ${a}.`,
  }),
  t({
    sub: 'u10-06',
    prompt: 'მონაკვეთის ბოლოებია {L1}({X1}; {Y1}) და {L2}({X2}; {Y2}). იპოვე შუაწერტილი.',
    vars: { ...pairVars, x1: I(-9, -1), y1: I(-4, 6), kx: nz(5), ky: nz(5), X1: D((v: Vars) => S(v, 'x1')), Y1: D((v: Vars) => S(v, 'y1')), X2: D((v: Vars) => sg(g(v, 'x1') + 2 * g(v, 'kx'))), Y2: D((v: Vars) => sg(g(v, 'y1') + 2 * g(v, 'ky'))) },
    answer: (v) => P2(g(v, 'x1') + g(v, 'kx'), g(v, 'y1') + g(v, 'ky')),
    options: (v) => ptOptions(g(v, 'x1') + g(v, 'kx'), g(v, 'y1') + g(v, 'ky'), [[2 * g(v, 'x1') + 2 * g(v, 'kx'), 2 * g(v, 'y1') + 2 * g(v, 'ky')], [g(v, 'kx'), g(v, 'ky')], [g(v, 'y1') + g(v, 'ky'), g(v, 'x1') + g(v, 'kx')]]),
    why: (v, a) => `აბსცისა (${v.X1} + ${par(g(v, 'x1') + 2 * g(v, 'kx'))}) ÷ 2, ორდინატა (${v.Y1} + ${par(g(v, 'y1') + 2 * g(v, 'ky'))}) ÷ 2: ${a}.`,
  }),
  t({
    sub: 'u10-06',
    prompt: 'მონაკვეთის შუაწერტილია M({MX}; {MY}), ხოლო ერთი ბოლოა A({AX}; {AY}). იპოვე მეორე ბოლოს B კოორდინატები.',
    vars: { mx: I(-6, 8), my: I(-6, 8), ax: I(-6, 8), ay: I(-6, 8), MX: D((v: Vars) => S(v, 'mx')), MY: D((v: Vars) => S(v, 'my')), AX: D((v: Vars) => S(v, 'ax')), AY: D((v: Vars) => S(v, 'ay')) },
    constraints: [{ test: (v: Vars) => g(v, 'mx') !== g(v, 'ax') && g(v, 'my') !== g(v, 'ay'), note: 'the other end differs' }],
    answer: (v) => P2(2 * g(v, 'mx') - g(v, 'ax'), 2 * g(v, 'my') - g(v, 'ay')),
    options: (v) => ptOptions(2 * g(v, 'mx') - g(v, 'ax'), 2 * g(v, 'my') - g(v, 'ay'), [[g(v, 'mx') + g(v, 'ax'), g(v, 'my') + g(v, 'ay')], [g(v, 'mx') - g(v, 'ax'), g(v, 'my') - g(v, 'ay')], [2 * g(v, 'mx') + g(v, 'ax'), 2 * g(v, 'my') + g(v, 'ay')]]),
    why: (_v, a) => `B = 2M ${MINUS} A: ${a}.`,
  }),
  t({
    sub: 'u10-06',
    prompt: 'რიცხვით ღერძზე მონაკვეთის ბოლოებია {L1}({A}) და {L2}({B}). იპოვე შუაწერტილის კოორდინატი.',
    vars: { ...pairVars, a: I(-12, -2), k: I(3, 10), A: D((v: Vars) => S(v, 'a')), B: D((v: Vars) => sg(g(v, 'a') + 2 * g(v, 'k'))) },
    answer: (v) => sg(g(v, 'a') + g(v, 'k')),
    options: (v) => midOpts(g(v, 'a') + g(v, 'k'), [2 * g(v, 'a') + 2 * g(v, 'k'), g(v, 'k'), -(g(v, 'a') + g(v, 'k'))]),
    why: (v, a) => `(${v.A} + ${par(g(v, 'a') + 2 * g(v, 'k'))}) ÷ 2 = ${a}.`,
  }),
  t({
    sub: 'u10-06',
    prompt: 'მონაკვეთის ბოლოებია {L1}({X1}; {Y1}) და {L2}({X2}; {Y2}). იპოვე შუაწერტილი.',
    vars: { ...pairVars, x1: I(-8, -2), y1: I(-8, -2), kx: I(2, 6), ky: I(2, 6), X1: D((v: Vars) => S(v, 'x1')), Y1: D((v: Vars) => S(v, 'y1')), X2: D((v: Vars) => sg(g(v, 'x1') + 2 * g(v, 'kx'))), Y2: D((v: Vars) => sg(g(v, 'y1') + 2 * g(v, 'ky'))) },
    answer: (v) => P2(g(v, 'x1') + g(v, 'kx'), g(v, 'y1') + g(v, 'ky')),
    options: (v) => ptOptions(g(v, 'x1') + g(v, 'kx'), g(v, 'y1') + g(v, 'ky'), [[g(v, 'kx'), g(v, 'ky')], [g(v, 'y1') + g(v, 'ky'), g(v, 'x1') + g(v, 'kx')], [g(v, 'x1') + 2 * g(v, 'kx'), g(v, 'y1') + 2 * g(v, 'ky')]]),
    why: (v, a) => `აბსცისა (${v.X1} + ${par(g(v, 'x1') + 2 * g(v, 'kx'))}) ÷ 2, ორდინატა (${v.Y1} + ${par(g(v, 'y1') + 2 * g(v, 'ky'))}) ÷ 2: ${a}.`,
  }),

  // ═════════ U10.7 — ცენტრალური და ღერძული სიმეტრია ═════════
  t({
    sub: 'u10-07',
    prompt: 'იპოვე წერტილ {L}({X}; {Y})-ის სიმეტრიული წერტილის კოორდინატები კოორდინატთა სათავის მიმართ.',
    vars: { L: Lp, x: nz(9), y: nz(9), ...XY() },
    answer: (v) => P2(-g(v, 'x'), -g(v, 'y')),
    options: (v) => ptOptions(-g(v, 'x'), -g(v, 'y'), [[-g(v, 'x'), g(v, 'y')], [g(v, 'x'), -g(v, 'y')], [g(v, 'x'), g(v, 'y')]]),
    why: (_v, a) => `სათავის მიმართ ორივე კოორდინატის ნიშანი იცვლება: ${a}.`,
  }),
  t({
    sub: 'u10-07',
    prompt: 'იპოვე წერტილ {L}({X}; {Y})-ის სიმეტრიული წერტილის კოორდინატები y-ღერძის მიმართ.',
    vars: { L: Lp, x: nz(9), y: nz(9), ...XY() },
    answer: (v) => P2(-g(v, 'x'), g(v, 'y')),
    options: (v) => ptOptions(-g(v, 'x'), g(v, 'y'), [[g(v, 'x'), -g(v, 'y')], [-g(v, 'x'), -g(v, 'y')], [g(v, 'x'), g(v, 'y')]]),
    why: (_v, a) => `y-ღერძის მიმართ აბსცისის ნიშანი იცვლება, ორდინატა რჩება: ${a}.`,
  }),
  t({
    sub: 'u10-07',
    prompt: 'იპოვე წერტილ {L}({X}; {Y})-ის სიმეტრიული წერტილის კოორდინატები x-ღერძის მიმართ.',
    vars: { L: Lp, x: nz(9), y: nz(9), ...XY() },
    answer: (v) => P2(g(v, 'x'), -g(v, 'y')),
    options: (v) => ptOptions(g(v, 'x'), -g(v, 'y'), [[-g(v, 'x'), g(v, 'y')], [-g(v, 'x'), -g(v, 'y')], [g(v, 'x'), g(v, 'y')]]),
    why: (_v, a) => `x-ღერძის მიმართ ორდინატის ნიშანი იცვლება, აბსცისა რჩება: ${a}.`,
  }),
  t({
    sub: 'u10-07',
    prompt: 'წერტილი {L}({X}; {Y}) აისახა {AX}-ღერძის მიმართ. ჩაწერე მიღებული წერტილის კოორდინატები.',
    vars: { L: Lp, x: nz(9), y: nz(9), ax: B01, AX: D((v: Vars) => (g(v, 'ax') ? 'x' : 'y')), ...XY() },
    answer: (v) => (g(v, 'ax') ? P2(g(v, 'x'), -g(v, 'y')) : P2(-g(v, 'x'), g(v, 'y'))),
    options: (v) => (g(v, 'ax') ? ptOptions(g(v, 'x'), -g(v, 'y'), [[-g(v, 'x'), g(v, 'y')], [-g(v, 'x'), -g(v, 'y')], [g(v, 'x'), g(v, 'y')]]) : ptOptions(-g(v, 'x'), g(v, 'y'), [[g(v, 'x'), -g(v, 'y')], [-g(v, 'x'), -g(v, 'y')], [g(v, 'x'), g(v, 'y')]])),
    why: (v, a) => `${g(v, 'ax') ? 'x-ღერძის მიმართ იცვლება ორდინატის ნიშანი' : 'y-ღერძის მიმართ იცვლება აბსცისის ნიშანი'}: ${a}.`,
  }),
  t({
    sub: 'u10-07',
    prompt: 'იპოვე წერტილ {L}({X}; {Y})-ის სიმეტრიული წერტილის კოორდინატები კოორდინატთა სათავის მიმართ.',
    vars: { L: Lp, x: I(-9, -1), y: I(-9, -1), ...XY() },
    answer: (v) => P2(-g(v, 'x'), -g(v, 'y')),
    options: (v) => ptOptions(-g(v, 'x'), -g(v, 'y'), [[-g(v, 'x'), g(v, 'y')], [g(v, 'x'), -g(v, 'y')], [g(v, 'y'), g(v, 'x')]]),
    why: (_v, a) => `ორივე კოორდინატა საპირისპირო ნიშნით იწერება: ${a}.`,
  }),
  t({
    sub: 'u10-07',
    prompt: 'წერტილი {L}({X}; {Y}) აისახა {AX}-ღერძის მიმართ. იპოვე მიღებული წერტილის {WHAT}.',
    vars: { L: Lp, x: nz(9), y: nz(9), ax: B01, ask: B01, AX: D((v: Vars) => (g(v, 'ax') ? 'x' : 'y')), WHAT: D((v: Vars) => (g(v, 'ask') ? 'ორდინატა' : 'აბსცისა')), ...XY() },
    answer: (v) => sg(g(v, 'ask') ? (g(v, 'ax') ? -g(v, 'y') : g(v, 'y')) : g(v, 'ax') ? g(v, 'x') : -g(v, 'x')),
    options: (v) => {
      const key = g(v, 'ask') ? (g(v, 'ax') ? -g(v, 'y') : g(v, 'y')) : g(v, 'ax') ? g(v, 'x') : -g(v, 'x');
      return sgOptions(key, [-key, g(v, 'ask') ? g(v, 'x') : g(v, 'y'), g(v, 'ask') ? -g(v, 'x') : -g(v, 'y')]);
    },
    why: (v, a) => `${g(v, 'ax') ? 'x-ღერძზე ასახვისას ორდინატა იცვლის ნიშანს, აბსცისა რჩება' : 'y-ღერძზე ასახვისას აბსცისა იცვლის ნიშანს, ორდინატა რჩება'}; ${v.WHAT} ${a}.`,
  }),

  // ═════════ U10.8 — პარალელური გადატანა ═════════
  t({
    sub: 'u10-08',
    prompt: 'წერტილი {L}({X}; {Y}) გადაიტანეს {a} ერთეულით მარჯვნივ და {b} ერთეულით ზემოთ. იპოვე ახალი წერტილის კოორდინატები.',
    vars: { L: Lp, x: I(-6, 6), y: I(-6, 6), a: I(1, 7), b: I(1, 7), ...XY() },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b'), note: 'different shifts' }],
    answer: (v) => P2(g(v, 'x') + g(v, 'a'), g(v, 'y') + g(v, 'b')),
    options: (v) => ptOptions(g(v, 'x') + g(v, 'a'), g(v, 'y') + g(v, 'b'), [[g(v, 'x') - g(v, 'a'), g(v, 'y') + g(v, 'b')], [g(v, 'x') + g(v, 'a'), g(v, 'y') - g(v, 'b')], [g(v, 'x') + g(v, 'b'), g(v, 'y') + g(v, 'a')], [g(v, 'x') + g(v, 'a'), g(v, 'y')]]),
    why: (v, a) => `მარჯვნივ აბსცისას ემატება ${v.a}, ზემოთ ორდინატას ემატება ${v.b}: ${a}.`,
  }),
  t({
    sub: 'u10-08',
    prompt: 'წერტილი {L}({X}; {Y}) გადაიტანეს {a} ერთეულით მარცხნივ და {b} ერთეულით ქვემოთ. იპოვე ახალი კოორდინატები.',
    vars: { L: Lp, x: I(-6, 6), y: I(-6, 6), a: I(1, 7), b: I(1, 7), ...XY() },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b'), note: 'different shifts' }],
    answer: (v) => P2(g(v, 'x') - g(v, 'a'), g(v, 'y') - g(v, 'b')),
    options: (v) => ptOptions(g(v, 'x') - g(v, 'a'), g(v, 'y') - g(v, 'b'), [[g(v, 'x') + g(v, 'a'), g(v, 'y') + g(v, 'b')], [g(v, 'x') - g(v, 'a'), g(v, 'y') + g(v, 'b')], [g(v, 'x') - g(v, 'b'), g(v, 'y') - g(v, 'a')], [g(v, 'x') - g(v, 'a'), g(v, 'y')]]),
    why: (v, a) => `მარცხნივ აბსცისას აკლდება ${v.a}, ქვემოთ ორდინატას აკლდება ${v.b}: ${a}.`,
  }),
  t({
    sub: 'u10-08',
    prompt: 'წერტილი {L}({X}; {Y}) გადაიტანეს ვექტორით ({VX}; {VY}). იპოვე მიღებული წერტილის კოორდინატები.',
    vars: { L: Lp, x: I(-6, 6), y: I(-6, 6), vx: I(1, 6), vy: I(1, 6), ...XY(), VX: D((v: Vars) => S(v, 'vx')), VY: D((v: Vars) => S(v, 'vy')) },
    constraints: [{ test: (v: Vars) => g(v, 'vx') !== g(v, 'vy'), note: 'different components' }],
    answer: (v) => P2(g(v, 'x') + g(v, 'vx'), g(v, 'y') + g(v, 'vy')),
    options: (v) => ptOptions(g(v, 'x') + g(v, 'vx'), g(v, 'y') + g(v, 'vy'), [[g(v, 'x') - g(v, 'vx'), g(v, 'y') - g(v, 'vy')], [g(v, 'x') + g(v, 'vy'), g(v, 'y') + g(v, 'vx')], [g(v, 'vx'), g(v, 'vy')]]),
    why: (v, a) => `აბსცისას ემატება ${v.VX}, ორდინატას ემატება ${v.VY}: ${a}.`,
  }),
  t({
    sub: 'u10-08',
    prompt: 'წერტილი {L}({X}; {Y}) გადაიტანეს ვექტორით ({VX}; {VY}). იპოვე მიღებული წერტილის კოორდინატები.',
    vars: { L: Lp, x: I(-6, 6), y: I(-6, 6), vx: nz(6), vy: nz(6), ...XY(), VX: D((v: Vars) => S(v, 'vx')), VY: D((v: Vars) => S(v, 'vy')) },
    constraints: [{ test: (v: Vars) => g(v, 'vx') < 0 || g(v, 'vy') < 0, note: 'a negative component' }],
    answer: (v) => P2(g(v, 'x') + g(v, 'vx'), g(v, 'y') + g(v, 'vy')),
    options: (v) => ptOptions(g(v, 'x') + g(v, 'vx'), g(v, 'y') + g(v, 'vy'), [[g(v, 'x') - g(v, 'vx'), g(v, 'y') - g(v, 'vy')], [g(v, 'x') + g(v, 'vy'), g(v, 'y') + g(v, 'vx')], [g(v, 'vx'), g(v, 'vy')]]),
    why: (v, a) => `აბსცისას ემატება ${v.VX}, ორდინატას ემატება ${v.VY}: ${a}.`,
  }),
  t({
    sub: 'u10-08',
    prompt: 'წერტილი {L}({X}; {Y}) გადაიტანეს ისე, რომ ახალი წერტილი გახდა {L}′({X2}; {Y2}). რამდენი ერთეულით და რა მიმართულებით გადაიტანეს წერტილი თითოეულ ღერძზე?',
    vars: { L: Lp, x: I(-6, 6), y: I(-6, 6), dx: nz(7), dy: nz(7), ...XY(), X2: D((v: Vars) => sg(g(v, 'x') + g(v, 'dx'))), Y2: D((v: Vars) => sg(g(v, 'y') + g(v, 'dy'))) },
    answer: (v) => shift(g(v, 'dx'), g(v, 'dy')),
    options: (v, right) => textOptions(right, [shift(-g(v, 'dx'), g(v, 'dy')), shift(g(v, 'dx'), -g(v, 'dy')), shift(g(v, 'dy'), g(v, 'dx')), shift(-g(v, 'dx'), -g(v, 'dy'))]),
    why: (v, a) => `აბსცისა ${v.X}-დან ${v.X2}-მდე შეიცვალა ${g(v, 'dx') > 0 ? 'მარჯვნივ' : 'მარცხნივ'}, ორდინატა ${v.Y}-დან ${v.Y2}-მდე ${g(v, 'dy') > 0 ? 'ზემოთ' : 'ქვემოთ'}: ${a}.`,
  }),
  t({
    sub: 'u10-08',
    prompt: 'წერტილი {L}({X}; {Y}) გადაიტანეს {a} ერთეულით მარჯვნივ და {b} ერთეულით ქვემოთ. იპოვე ახალი წერტილის კოორდინატები.',
    vars: { L: Lp, x: I(-6, 6), y: I(-6, 6), a: I(2, 8), b: I(2, 8), ...XY() },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b'), note: 'different shifts' }],
    answer: (v) => P2(g(v, 'x') + g(v, 'a'), g(v, 'y') - g(v, 'b')),
    options: (v) => ptOptions(g(v, 'x') + g(v, 'a'), g(v, 'y') - g(v, 'b'), [[g(v, 'x') - g(v, 'a'), g(v, 'y') + g(v, 'b')], [g(v, 'x') + g(v, 'a'), g(v, 'y') + g(v, 'b')], [g(v, 'x') - g(v, 'a'), g(v, 'y') - g(v, 'b')], [g(v, 'x') + g(v, 'b'), g(v, 'y') - g(v, 'a')]]),
    why: (v, a) => `მარჯვნივ აბსცისას ემატება ${v.a}, ქვემოთ ორდინატას აკლდება ${v.b}: ${a}.`,
  }),
];

/** `4 ერთეულით მარჯვნივ და 5 ერთეულით ზემოთ`. */
function shift(dx: number, dy: number): string {
  return `${Math.abs(dx)} ერთეულით ${dx > 0 ? 'მარჯვნივ' : 'მარცხნივ'} და ${Math.abs(dy)} ერთეულით ${dy > 0 ? 'ზემოთ' : 'ქვემოთ'}`;
}
