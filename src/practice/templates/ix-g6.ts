/**
 * Grade VI — interactive templates.
 *
 * Numbers are built place by place, found on number lines (negative, fractional,
 * decimal), sorted into bins and compared with signs; the coordinate plane is
 * tapped in all four quarters, reflected and moved; angles are opened;
 * rectangles are built; fractions and percents are shaded; statistics become
 * bars, medians are tapped; coins go into a purse.
 */
import type { QuestionTemplate } from './types';
import { derived, distinct, int, interactiveSet, num, pick, str } from './ix-kit';
import { rotate, signOf } from './ix-kit34';
import { cmpFrac, dec, decOf, divisorsOf, gcd, lcm, romanFull } from './ix-kit56';

export const T6 = (topicId: string, unit: string) => interactiveSet(6, topicId, `g6-ix-${unit}`);
const T = T6;
const COINS = [1, 2, 5, 10, 20, 50];
const five = ['a', 'b', 'c', 'd', 'e'];
const digitCards = Array.from({ length: 10 }, (_, i) => String(i));
const roundTo = (n: number, unit: number): number => Math.round(n / unit) * unit;
const group = (n: number): string => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
export const sgn = (n: number): string => (n < 0 ? `−${Math.abs(n)}` : String(n));
export const par = (n: number): string => (n < 0 ? `(−${Math.abs(n)})` : String(n));
const fr = (n: number, d: number): string => `${n}/${d}`;
const isPrime = (n: number): boolean => n > 1 && divisorsOf(n).length === 2;
export const planeBox = (r = 6, extra: Record<string, unknown> = {}) => ({ kind: 'plane' as const, xmin: -r, xmax: r, ymin: -r, ymax: r, cell: r > 6 ? 22 : 26, ...extra });
const axisLine = (min: number, max: number, extra: Record<string, unknown> = {}) => ({ kind: 'line' as const, min, max, step: 1, labelEvery: max - min > 20 ? 5 : 2, ...extra });

/* ------------------------------------------------------------ U01 */
const u01 = T('g6-numbers', 'u01');
const U01: QuestionTemplate[] = [
  u01('u01-01', 'place7', 2, {
    prompt: 'ააგე რიცხვი: {a} მილიონი, {b} ასი ათასი, {c} ათი ათასი, {d} ათასი, {e} ასეული, {f} ათეული და {g} ერთეული.',
    variables: { a: int(1, 9), b: int(0, 9), c: int(0, 9), d: int(0, 9), e: int(0, 9), f: int(0, 9), g: int(0, 9) },
    interaction: () => ({ kind: 'place', digits: 7 }),
    answer: (v) => ['a', 'b', 'c', 'd', 'e', 'f', 'g'].reduce((acc, k) => acc * 10 + num(v, k), 0),
    explanation: ({ answer }) => `რიცხვია ${group(Number(answer))}.`,
  }),
  u01('u01-03', 'roman', 2, {
    prompt: 'ააწყვე რომაული ციფრებით რიცხვი {n}.',
    variables: { n: int(40, 399), r: int(0, 5) },
    interaction: (v) => {
      const key = romanFull(num(v, 'n'));
      return { kind: 'tiles', cards: rotate([...key.split(''), 'M', 'D'], num(v, 'r')), slots: key.length };
    },
    answer: (v) => romanFull(num(v, 'n')),
    text: true,
    options: (v) => [romanFull(num(v, 'n')), romanFull(num(v, 'n') + 1), romanFull(num(v, 'n') - 1), romanFull(num(v, 'n') + 10)],
    explanation: ({ answer, vars }) => `${vars.n} = ${answer}.`,
  }),
  u01('u01-04', 'prime-sort', 2, {
    prompt: 'ჩადე რიცხვები სწორ ყუთში: მარტივი თუ შედგენილი.',
    variables: { a: int(11, 99), b: int(11, 99), c: int(11, 99), d: int(11, 99), e: int(11, 99) },
    constraints: [distinct(...five), { test: (v) => five.some((k) => isPrime(num(v, k))) && five.some((k) => !isPrime(num(v, k))), note: 'ორივე სახეობა' }],
    interaction: (v) => ({ kind: 'bins', bins: ['მარტივი', 'შედგენილი'], items: five.map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) => five.map((k) => (isPrime(num(v, k)) ? 0 : 1)).join(','),
    explanation: () => 'მარტივს ორი გამყოფი აქვს: 1 და თავისი თავი.',
  }),
  u01('u01-05', 'prime-factors', 2, {
    prompt: 'დაშალე {n} მარტივ მამრავლებად (ზრდადობით).',
    variables: { a: pick(2, 3, 5, 7), b: pick(2, 3, 5, 7), c: pick(2, 3, 5, 7), n: derived((v) => num(v, 'a') * num(v, 'b') * num(v, 'c')), r: int(0, 3) },
    interaction: (v) => ({ kind: 'tiles', cards: rotate([num(v, 'a'), num(v, 'b'), num(v, 'c'), num(v, 'a') + num(v, 'b') + num(v, 'c') + 1].map(String), num(v, 'r')), slots: 3, joiner: '×' }),
    answer: (v) => [num(v, 'a'), num(v, 'b'), num(v, 'c')].sort((x, y) => x - y).join('×'),
    text: true,
    options: (v) => {
      const f = [num(v, 'a'), num(v, 'b'), num(v, 'c')].sort((x, y) => x - y);
      return [f.join('×'), `${f[0]}×${f[1]! + 1}×${f[2]}`, `${f[0]! + 1}×${f[1]}×${f[2]}`, `${f[0]}×${f[1]}×${f[2]! + 2}`];
    },
    explanation: ({ answer, vars }) => `${vars.n} = ${answer}.`,
  }),
  u01('u01-06', 'gcd-chart', 3, {
    prompt: 'იპოვე {x}-ისა და {y}-ის უდიდესი საერთო გამყოფი და შეეხე მას ცხრილში.',
    variables: { g: int(2, 12), p: int(2, 7), q: int(2, 7), x: derived((v) => num(v, 'g') * num(v, 'p')), y: derived((v) => num(v, 'g') * num(v, 'q')) },
    constraints: [{ test: (v) => num(v, 'p') !== num(v, 'q') && gcd(num(v, 'p'), num(v, 'q')) === 1, note: 'ურთიერთმარტივი' }],
    interaction: () => ({ kind: 'chart', from: 1, to: 60, cols: 10 }),
    answer: (v) => num(v, 'g'),
    explanation: ({ vars }) => `უდიდესი საერთო გამყოფია ${vars.g}.`,
  }),
  u01('u01-06', 'lcm-chart', 3, {
    prompt: 'იპოვე {a}-ისა და {b}-ის უმცირესი საერთო ჯერადი და შეეხე მას ცხრილში.',
    variables: { a: int(3, 12), b: int(3, 12) },
    constraints: [{ test: (v) => num(v, 'a') !== num(v, 'b') && lcm(num(v, 'a'), num(v, 'b')) <= 100, note: 'ცხრილის ფარგლებში' }],
    interaction: () => ({ kind: 'chart', from: 1, to: 100, cols: 10 }),
    answer: (v) => lcm(num(v, 'a'), num(v, 'b')),
    explanation: ({ answer }) => `უმცირესი საერთო ჯერადია ${answer}.`,
  }),
  u01('u01-07', 'neg-line', 1, {
    prompt: 'შეეხე რიცხვით ღერძზე რიცხვს {ns}.',
    variables: { k: int(-12, 12), ns: derived((v) => sgn(num(v, 'k'))) },
    interaction: () => axisLine(-12, 12),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${vars.ns} ნულიდან ${Math.abs(Number(vars.k))} ერთეულითაა დაშორებული.`,
  }),
  u01('u01-07', 'neg-compare', 1, {
    prompt: 'შეადარე რიცხვები და აირჩიე ნიშანი.',
    variables: { a: int(-20, 20), b: int(-20, 20) },
    constraints: [distinct('a', 'b')],
    interaction: (v) => ({ kind: 'slots', tokens: [sgn(num(v, 'a')), '?', sgn(num(v, 'b'))], options: ['<', '>'] }),
    answer: (v) => signOf(num(v, 'a'), num(v, 'b')),
    explanation: ({ vars }) => `${sgn(Number(vars.a))} და ${sgn(Number(vars.b))}: ღერძზე მარჯვნივ მდგომი მეტია.`,
  }),
  u01('u01-09', 'modulus-line', 2, {
    prompt: 'რიცხვის მოდული {m}-ია და რიცხვი უარყოფითია. შეეხე ამ რიცხვს ღერძზე.',
    variables: { m: int(1, 12) },
    interaction: () => axisLine(-12, 12),
    answer: (v) => -num(v, 'm'),
    explanation: ({ vars }) => `ნულიდან ${vars.m} ერთეულით მარცხნივ.`,
  }),
  u01('u01-10', 'order', 2, {
    prompt: 'დაალაგე რიცხვები ზრდადობით.',
    variables: { a: int(-15, 15), b: int(-15, 15), c: int(-15, 15) },
    constraints: [distinct('a', 'b', 'c')],
    interaction: (v) => ({ kind: 'tiles', cards: [num(v, 'a'), num(v, 'b'), num(v, 'c')].map(sgn), slots: 3, joiner: ' < ' }),
    answer: (v) => [num(v, 'a'), num(v, 'b'), num(v, 'c')].sort((x, y) => x - y).map(sgn).join(' < '),
    text: true,
    options: (v) => {
      const s = [num(v, 'a'), num(v, 'b'), num(v, 'c')].sort((x, y) => x - y).map(sgn);
      return [s.join(' < '), [...s].reverse().join(' < '), [s[1], s[0], s[2]].join(' < '), [s[0], s[2], s[1]].join(' < ')];
    },
    explanation: ({ answer }) => String(answer),
  }),
];

/* ------------------------------------------------------------ U02 */
const u02 = T('g6-whole-ops', 'u02');
const U02: QuestionTemplate[] = [
  u02('u02-05', 'zeros', 1, {
    prompt: 'გამოთვალე და ააგე პასუხი: {a}00 × {b}000',
    variables: { a: int(2, 9), b: int(2, 9) },
    interaction: () => ({ kind: 'place', digits: 7 }),
    answer: (v) => num(v, 'a') * num(v, 'b') * 100000,
    explanation: ({ vars }) => `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}, შემდეგ 5 ნული.`,
  }),
  u02('u02-09', 'estimate', 2, {
    prompt: 'დაამრგვალე მამრავლები უახლოეს ათეულამდე და შეაფასე ნამრავლი: {a} × {b}. შეეხე შეფასებას.',
    variables: { a: int(21, 99), b: int(21, 99) },
    constraints: [{ test: (v) => num(v, 'a') % 10 !== 5 && num(v, 'b') % 10 !== 5 && num(v, 'a') % 10 !== 0 && num(v, 'b') % 10 !== 0, note: 'არა შუა' }],
    interaction: (v) => ({ kind: 'line', min: roundTo(num(v, 'a'), 10) * roundTo(num(v, 'b'), 10) - 400, max: roundTo(num(v, 'a'), 10) * roundTo(num(v, 'b'), 10) + 400, step: 100, labelEvery: 1 }),
    answer: (v) => roundTo(num(v, 'a'), 10) * roundTo(num(v, 'b'), 10),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u02('u02-11', 'remainder', 2, {
    prompt: 'გაყავი {n} {k}-ზე: ჩასვი განაყოფი და ნაშთი.',
    variables: { k: int(3, 9), q: int(20, 99), r: int(1, 8), rem: derived((v) => num(v, 'r') % num(v, 'k') || 1), n: derived((v) => num(v, 'k') * num(v, 'q') + (num(v, 'r') % num(v, 'k') || 1)), rot: int(0, 3) },
    interaction: (v) => ({ kind: 'tiles', cards: rotate([num(v, 'q'), num(v, 'rem'), num(v, 'q') + 1, num(v, 'rem') + 1].map(String), num(v, 'rot')), frame: ['განაყოფი', '?', 'ნაშთი', '?'], joiner: ',' }),
    answer: (v) => `${num(v, 'q')},${num(v, 'rem')}`,
    text: true,
    options: (v) => [`${num(v, 'q')},${num(v, 'rem')}`, `${num(v, 'rem')},${num(v, 'q')}`, `${num(v, 'q') + 1},${num(v, 'rem')}`, `${num(v, 'q')},${num(v, 'rem') + 1}`],
    explanation: ({ vars }) => `${vars.n} = ${vars.k} × ${vars.q} + ${vars.rem}.`,
  }),
  u02('u02-10', 'missing-digit', 2, {
    prompt: 'იპოვე გამოტოვებული ციფრი: {p}□ × {b} = {prod}',
    variables: { p: int(10, 99), d: int(0, 9), b: int(2, 9), prod: derived((v) => (num(v, 'p') * 10 + num(v, 'd')) * num(v, 'b')) },
    interaction: (v) => ({ kind: 'tiles', cards: digitCards, frame: [String(num(v, 'p')), '?', `× ${num(v, 'b')} = ${num(v, 'prod')}`] }),
    answer: (v) => num(v, 'd'),
    text: true,
    options: (v) => [0, 1, 2, 3].map((k) => String((num(v, 'd') + k * 3) % 10)),
    explanation: ({ vars }) => `${vars.prod} ÷ ${vars.b} = ${Number(vars.p) * 10 + Number(vars.d)}.`,
  }),
];

/* ------------------------------------------------------------ U03 */
const u03 = T('g6-negative-rational', 'u03');
const U03: QuestionTemplate[] = [
  u03('u03-01', 'add-line', 2, {
    prompt: 'გამოთვალე {ap} + {bp} და შეეხე შედეგს ღერძზე (დაწყების წერტილი მონიშნულია).',
    variables: { a: int(-10, 10), b: int(-10, 10), ap: derived((v) => sgn(num(v, 'a'))), bp: derived((v) => par(num(v, 'b'))) },
    constraints: [{ test: (v) => Math.abs(num(v, 'a') + num(v, 'b')) <= 15 && num(v, 'b') !== 0, note: 'ღერძის ფარგლებში' }],
    interaction: (v) => axisLine(-15, 15, { start: num(v, 'a') }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars, answer }) => `${vars.ap} + ${vars.bp} = ${sgn(Number(answer))}.`,
  }),
  u03('u03-01', 'sub-line', 3, {
    prompt: 'გამოთვალე {ap} − {bp} და შეეხე შედეგს ღერძზე.',
    variables: { a: int(-10, 10), b: int(-10, 10), ap: derived((v) => sgn(num(v, 'a'))), bp: derived((v) => par(num(v, 'b'))) },
    constraints: [{ test: (v) => Math.abs(num(v, 'a') - num(v, 'b')) <= 18 && num(v, 'b') !== 0, note: 'ღერძის ფარგლებში' }],
    interaction: (v) => axisLine(-20, 20, { start: num(v, 'a'), labelEvery: 5 }),
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ vars, answer }) => `${vars.ap} − ${vars.bp} = ${sgn(Number(answer))}.`,
  }),
  u03('u03-02', 'multiply-line', 3, {
    prompt: 'გამოთვალე {ap} × {bp} და შეეხე შედეგს ღერძზე.',
    variables: { a: int(-6, 6), b: int(-6, 6), ap: derived((v) => sgn(num(v, 'a'))), bp: derived((v) => par(num(v, 'b'))) },
    constraints: [{ test: (v) => Math.abs(num(v, 'a')) > 1 && Math.abs(num(v, 'b')) > 1, note: 'არატრივიალური' }],
    interaction: () => axisLine(-36, 36, { labelEvery: 6 }),
    answer: (v) => num(v, 'a') * num(v, 'b'),
    explanation: ({ vars, answer }) => `${vars.ap} × ${vars.bp} = ${sgn(Number(answer))}.`,
  }),
  u03('u03-02', 'sign-of-product', 1, {
    prompt: 'ჩადე ნამრავლები სწორ ყუთში: დადებითი თუ უარყოფითი.',
    variables: { a: int(-9, 9), b: int(-9, 9), c: int(-9, 9), d: int(-9, 9), e: int(-9, 9), f: int(-9, 9) },
    constraints: [
      { test: (v) => ['a', 'b', 'c', 'd', 'e', 'f'].every((k) => num(v, k) !== 0), note: 'არა ნული' },
      { test: (v) => new Set([num(v, 'a') * num(v, 'b') > 0, num(v, 'c') * num(v, 'd') > 0, num(v, 'e') * num(v, 'f') > 0]).size === 2, note: 'ორივე' },
    ],
    interaction: (v) => ({
      kind: 'bins',
      bins: ['დადებითი', 'უარყოფითი'],
      items: [['a', 'b'], ['c', 'd'], ['e', 'f']].map(([x, y]) => ({ label: `${par(num(v, x!))} × ${par(num(v, y!))}` })),
    }),
    answer: (v) => [['a', 'b'], ['c', 'd'], ['e', 'f']].map(([x, y]) => (num(v, x!) * num(v, y!) > 0 ? 0 : 1)).join(','),
    explanation: () => 'ერთნაირი ნიშნების ნამრავლი დადებითია, განსხვავებულის — უარყოფითი.',
  }),
  u03('u03-03', 'rational-line', 3, {
    prompt: 'გამოთვალე {a}/{d} + {b}/{d} და შეეხე შედეგს ღერძზე.',
    variables: { d: int(3, 8), a: int(1, 7), b: int(1, 7) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'd') && num(v, 'b') < num(v, 'd'), note: 'სწორი წილადები' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: 2 * num(v, 'd'), step: 1, format: 'frac', den: num(v, 'd'), labelEvery: 1 }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${Number(vars.a) + Number(vars.b)}/${vars.d}.`,
  }),
];

/* ------------------------------------------------------------ U04 */
const u04 = T('g6-fractions', 'u04');
function denItems(v: Record<string, unknown>): number[] {
  const b = Number(v.b);
  const d = Number(v.d);
  const l = lcm(b, d);
  return [l, b * d, l * 2, l + Math.max(b, d)];
}
const U04: QuestionTemplate[] = [
  u04('u04-01', 'mixed-tiles', 3, {
    prompt: 'არასწორი წილადი {n}/{d} ჩაწერე შერეულად: მთელი, მრიცხველი, მნიშვნელი.',
    variables: { d: int(3, 9), w: int(1, 6), r: int(1, 8), rem: derived((v) => 1 + ((num(v, 'r') - 1) % (num(v, 'd') - 1))), n: derived((v) => num(v, 'w') * num(v, 'd') + 1 + ((num(v, 'r') - 1) % (num(v, 'd') - 1))), rot: int(0, 3) },
    interaction: (v) => ({ kind: 'tiles', cards: rotate([num(v, 'w'), num(v, 'rem'), num(v, 'd'), num(v, 'w') + 1, num(v, 'rem') + 1].map(String), num(v, 'rot')), frame: ['?', 'და', '?', '/', '?'], joiner: ',' }),
    answer: (v) => `${num(v, 'w')},${num(v, 'rem')},${num(v, 'd')}`,
    text: true,
    options: (v) => [`${num(v, 'w')},${num(v, 'rem')},${num(v, 'd')}`, `${num(v, 'w') + 1},${num(v, 'rem')},${num(v, 'd')}`, `${num(v, 'w')},${num(v, 'rem') + 1},${num(v, 'd')}`, `${num(v, 'rem')},${num(v, 'w')},${num(v, 'd')}`],
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.d} = ${vars.w} (ნაშთი ${vars.rem}).`,
  }),
  u04('u04-02', 'equal-line', 2, {
    prompt: '{a}/{d} = ?/{m}. შეეხე სწორ ნიშნულს ღერძზე.',
    variables: { d: int(2, 6), a: int(1, 5), f: int(2, 4), m: derived((v) => num(v, 'd') * num(v, 'f')) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'd') && gcd(num(v, 'a'), num(v, 'd')) === 1, note: 'უმარტივესი' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'm'), step: 1, format: 'frac', den: num(v, 'm'), labelEvery: 1 }),
    answer: (v) => num(v, 'a') * num(v, 'f'),
    explanation: ({ vars }) => `${vars.a}/${vars.d} = ${Number(vars.a) * Number(vars.f)}/${vars.m}.`,
  }),
  u04('u04-02', 'reduce', 2, {
    prompt: 'შეკვეცე წილადი {n}/{m} უმარტივეს სახემდე: ჩასვი ბარათები.',
    variables: { p: int(1, 7), q: int(2, 9), f: int(2, 6), n: derived((v) => num(v, 'p') * num(v, 'f')), m: derived((v) => num(v, 'q') * num(v, 'f')), rot: int(0, 3) },
    constraints: [{ test: (v) => num(v, 'p') < num(v, 'q') && gcd(num(v, 'p'), num(v, 'q')) === 1, note: 'უმარტივესი' }],
    interaction: (v) => ({ kind: 'tiles', cards: rotate([num(v, 'p'), num(v, 'q'), num(v, 'n'), num(v, 'm')].map(String), num(v, 'rot')), frame: ['?', '/', '?'], joiner: '/' }),
    answer: (v) => fr(num(v, 'p'), num(v, 'q')),
    text: true,
    options: (v) => [fr(num(v, 'p'), num(v, 'q')), fr(num(v, 'q'), num(v, 'p')), fr(num(v, 'p') + 1, num(v, 'q')), fr(num(v, 'p'), num(v, 'q') + 1)],
    explanation: ({ vars }) => `${vars.n} და ${vars.m} ორივე იყოფა ${vars.f}-ზე.`,
  }),
  u04('u04-03', 'common-den', 3, {
    prompt: 'იპოვე {a}/{b} და {c}/{d} წილადების უმცირესი საერთო მნიშვნელი. შეეხე მას.',
    variables: { a: int(1, 7), b: int(2, 12), c: int(1, 7), d: int(2, 12), r: int(0, 3) },
    constraints: [
      { test: (v) => num(v, 'a') < num(v, 'b') && num(v, 'c') < num(v, 'd') && num(v, 'b') !== num(v, 'd') && lcm(num(v, 'b'), num(v, 'd')) < num(v, 'b') * num(v, 'd'), note: 'საერთო გამყოფი' },
      { test: (v) => new Set(denItems(v)).size === 4, note: 'განსხვავებული' },
    ],
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: rotate(denItems(v), num(v, 'r')).map((n) => ({ label: String(n) })) }),
    answer: (v) => rotate(denItems(v), num(v, 'r')).indexOf(lcm(num(v, 'b'), num(v, 'd'))) + 1,
    explanation: ({ vars }) => `უმცირესი საერთო მნიშვნელია ${lcm(Number(vars.b), Number(vars.d))}.`,
  }),
  u04('u04-04', 'compare', 2, {
    prompt: 'შეადარე წილადები და აირჩიე ნიშანი.',
    variables: { a: int(1, 8), b: int(2, 9), c: int(1, 8), d: int(2, 9) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'b') && num(v, 'c') < num(v, 'd') && num(v, 'b') !== num(v, 'd') && cmpFrac(num(v, 'a'), num(v, 'b'), num(v, 'c'), num(v, 'd')) !== 0, note: 'განსხვავებული' }],
    interaction: (v) => ({ kind: 'slots', tokens: [fr(num(v, 'a'), num(v, 'b')), '?', fr(num(v, 'c'), num(v, 'd'))], options: ['<', '>'] }),
    answer: (v) => (cmpFrac(num(v, 'a'), num(v, 'b'), num(v, 'c'), num(v, 'd')) < 0 ? '<' : '>'),
    explanation: ({ vars }) => `ჯვარედინად: ${Number(vars.a) * Number(vars.d)} და ${Number(vars.c) * Number(vars.b)}.`,
  }),
  u04('u04-06', 'add-line', 3, {
    prompt: 'იპოვე {a}/{d} + {b}/{m} და შეეხე შედეგს ღერძზე.',
    variables: { d: int(2, 5), f: int(2, 3), m: derived((v) => num(v, 'd') * num(v, 'f')), a: int(1, 4), b: int(1, 11) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'd') && num(v, 'a') * num(v, 'f') + num(v, 'b') < num(v, 'm'), note: 'ჯამი < 1' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'm'), step: 1, format: 'frac', den: num(v, 'm'), labelEvery: 1 }),
    answer: (v) => num(v, 'a') * num(v, 'f') + num(v, 'b'),
    explanation: ({ vars }) => `ჯამი ${Number(vars.a) * Number(vars.f) + Number(vars.b)}/${vars.m}.`,
  }),
  u04('u04-10', 'fill-of-set', 2, {
    prompt: '{n} ნივთიდან შეღებე {a}/{d}.',
    variables: { d: int(2, 6), k: int(2, 4), a: int(1, 5), n: derived((v) => num(v, 'd') * num(v, 'k')) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'd'), note: 'a<d' }],
    interaction: (v) => ({ kind: 'fill', shape: 'row', total: num(v, 'n') }),
    answer: (v) => num(v, 'a') * num(v, 'k'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.d} × ${vars.a} = ${Number(vars.a) * Number(vars.k)}.`,
  }),
  u04('u04-11', 'fill-grid', 3, {
    prompt: 'ბადე {c} სვეტად და {r} სტრიქონადაა დაყოფილი. შეღებე {a}/{c}-ის {b}/{r} ნაწილი.',
    variables: { c: int(2, 6), r: int(2, 6), a: int(1, 5), b: int(1, 5) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'c') && num(v, 'b') < num(v, 'r'), note: 'სწორი წილადები' }],
    interaction: (v) => ({ kind: 'fill', shape: 'grid', total: num(v, 'c') * num(v, 'r'), cols: num(v, 'c') }),
    answer: (v) => num(v, 'a') * num(v, 'b'),
    explanation: ({ vars }) => `${vars.a}/${vars.c} × ${vars.b}/${vars.r} = ${Number(vars.a) * Number(vars.b)}/${Number(vars.c) * Number(vars.r)}.`,
  }),
  u04('u04-14', 'reciprocal', 1, {
    prompt: 'იპოვე {n}/{d}-ის შებრუნებული წილადი: ჩასვი ბარათები.',
    variables: { n: int(1, 9), d: int(2, 10), rot: int(0, 3) },
    constraints: [{ test: (v) => num(v, 'n') !== num(v, 'd'), note: 'არა ერთეული' }],
    interaction: (v) => ({ kind: 'tiles', cards: rotate([num(v, 'n'), num(v, 'd'), num(v, 'n') + 1, num(v, 'd') + 1].map(String), num(v, 'rot')), frame: ['?', '/', '?'], joiner: '/' }),
    answer: (v) => fr(num(v, 'd'), num(v, 'n')),
    text: true,
    options: (v) => [fr(num(v, 'd'), num(v, 'n')), fr(num(v, 'n'), num(v, 'd')), fr(num(v, 'd') + 1, num(v, 'n')), fr(num(v, 'd'), num(v, 'n') + 1)],
    explanation: ({ vars }) => `${vars.d}/${vars.n}.`,
  }),
  u04('u04-15', 'div-whole-line', 3, {
    prompt: 'გამოთვალე {a}/{d} ÷ {k} და შეეხე შედეგს ღერძზე.',
    variables: { d: int(2, 5), k: int(2, 3), a: int(1, 4), m: derived((v) => num(v, 'd') * num(v, 'k')) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'd'), note: 'a<d' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'm'), step: 1, format: 'frac', den: num(v, 'm'), labelEvery: 1 }),
    answer: (v) => num(v, 'a'),
    explanation: ({ vars }) => `${vars.a}/${vars.d} ÷ ${vars.k} = ${vars.a}/${vars.m}.`,
  }),
];

/* ------------------------------------------------------------ U05 */
const u05 = T('g6-decimals', 'u05');
const U05: QuestionTemplate[] = [
  u05('u05-02', 'place3', 2, {
    prompt: 'ააგე ათწილადი: {a} მთელი, {b} მეათედი, {c} მეასედი და {d} მეათასედი.',
    variables: { a: int(0, 9), b: int(0, 9), c: int(0, 9), d: int(1, 9) },
    interaction: () => ({ kind: 'place', digits: 1, decimals: 3 }),
    answer: (v) => decOf(num(v, 'a') * 1000 + num(v, 'b') * 100 + num(v, 'c') * 10 + num(v, 'd'), 3),
    explanation: ({ answer }) => `რიცხვია ${answer}.`,
  }),
  u05('u05-04', 'compare', 2, {
    prompt: 'შეადარე ათწილადები და აირჩიე ნიშანი.',
    variables: { x: int(100, 999), y: int(10, 99) },
    constraints: [{ test: (v) => num(v, 'y') * 10 !== num(v, 'x'), note: 'არა ტოლი' }],
    interaction: (v) => ({ kind: 'slots', tokens: [decOf(num(v, 'x'), 3), '?', decOf(num(v, 'y'), 2)], options: ['<', '>'] }),
    answer: (v) => signOf(num(v, 'x'), num(v, 'y') * 10),
    explanation: ({ vars }) => `${decOf(Number(vars.x), 3)} და ${decOf(Number(vars.y), 2)}.`,
  }),
  u05('u05-05', 'round-tenth', 2, {
    prompt: 'დაამრგვალე {x} უახლოეს მეათედამდე: შეეხე უახლოეს მეათედს ღერძზე.',
    variables: { w: int(0, 5), h: int(1, 99), x: derived((v) => decOf(num(v, 'w') * 100 + num(v, 'h'), 2)) },
    constraints: [{ test: (v) => num(v, 'h') % 10 !== 5 && num(v, 'h') % 10 !== 0, note: 'არა შუა' }],
    interaction: (v) => ({ kind: 'line', min: Math.floor((num(v, 'w') * 100 + num(v, 'h')) / 10) * 10 - 10, max: Math.floor((num(v, 'w') * 100 + num(v, 'h')) / 10) * 10 + 20, step: 10, format: 'dec', den: 100, labelEvery: 1 }),
    answer: (v) => roundTo(num(v, 'w') * 100 + num(v, 'h'), 10),
    explanation: ({ vars, answer }) => `${vars.x} ≈ ${decOf(Number(answer), 2)}.`,
  }),
  u05('u05-05', 'round-whole', 1, {
    prompt: 'დაამრგვალე {x} უახლოეს მთელამდე: შეეხე უახლოეს მთელს ღერძზე.',
    variables: { w: int(1, 8), t: int(1, 9), x: derived((v) => decOf(num(v, 'w') * 10 + num(v, 't'), 1)) },
    constraints: [{ test: (v) => num(v, 't') !== 5, note: 'არა შუა' }],
    interaction: (v) => ({ kind: 'line', min: (num(v, 'w') - 1) * 10, max: (num(v, 'w') + 2) * 10, step: 10, format: 'dec', den: 10, labelEvery: 1 }),
    answer: (v) => roundTo(num(v, 'w') * 10 + num(v, 't'), 10),
    explanation: ({ vars }) => `${vars.x} ≈ ${Math.round(Number(vars.w) + Number(vars.t) / 10)}.`,
  }),
  u05('u05-06', 'add-line', 2, {
    prompt: 'გამოთვალე {x} + {y} და შეეხე შედეგს ღერძზე.',
    variables: { a: int(1, 15), b: int(1, 15), x: derived((v) => decOf(num(v, 'a'), 1)), y: derived((v) => decOf(num(v, 'b'), 1)) },
    interaction: () => ({ kind: 'line', min: 0, max: 30, step: 1, format: 'dec', den: 10, labelEvery: 5 }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.x} + ${vars.y} = ${decOf(Number(vars.a) + Number(vars.b), 1)}.`,
  }),
  u05('u05-07', 'sub-line', 2, {
    prompt: 'გამოთვალე {x} − {y} და შეეხე შედეგს ღერძზე.',
    variables: { a: int(5, 30), b: int(1, 25), x: derived((v) => decOf(num(v, 'a'), 1)), y: derived((v) => decOf(num(v, 'b'), 1)) },
    constraints: [{ test: (v) => num(v, 'a') > num(v, 'b'), note: 'a>b' }],
    interaction: () => ({ kind: 'line', min: 0, max: 30, step: 1, format: 'dec', den: 10, labelEvery: 5 }),
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ vars }) => `${vars.x} − ${vars.y} = ${decOf(Number(vars.a) - Number(vars.b), 1)}.`,
  }),
  u05('u05-13', 'times-power', 2, {
    prompt: 'გამოთვალე და ააგე პასუხი: {x} × {p}',
    variables: { m: int(11, 99), x: derived((v) => decOf(num(v, 'm'), 2)), p: pick(10, 100) },
    interaction: () => ({ kind: 'place', digits: 3, decimals: 2 }),
    answer: (v) => dec((num(v, 'm') / 100) * num(v, 'p'), 2),
    explanation: ({ answer }) => `პასუხია ${answer}.`,
  }),
  u05('u05-13', 'divide-power', 2, {
    prompt: 'გამოთვალე და ააგე პასუხი: {n} ÷ {p}',
    variables: { n: int(11, 999), p: pick(10, 100) },
    constraints: [{ test: (v) => num(v, 'n') % 10 !== 0, note: 'არა ათეული' }],
    interaction: () => ({ kind: 'place', digits: 2, decimals: 3 }),
    answer: (v) => dec(num(v, 'n') / num(v, 'p'), 3),
    explanation: ({ answer }) => `პასუხია ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U06 */
const u06 = T('g6-fraction-decimal', 'u06');
export const FD: Array<[number, number]> = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 8], [3, 8], [1, 10], [7, 10], [9, 20], [11, 20], [3, 25], [7, 50]];
const fdVal = (v: Record<string, unknown>, k: string): number => FD[Number(v[k])]![0] / FD[Number(v[k])]![1];
const fdText = (v: Record<string, unknown>, k: string): string => fr(FD[Number(v[k])]![0], FD[Number(v[k])]![1]);
const U06: QuestionTemplate[] = [
  u06('u06-01', 'to-decimal', 2, {
    prompt: 'ჩაწერე {n}/{d} ათწილადის სახით.',
    variables: { i: int(0, FD.length - 1), n: derived((v) => FD[num(v, 'i')]![0]), d: derived((v) => FD[num(v, 'i')]![1]) },
    interaction: () => ({ kind: 'place', digits: 1, decimals: 3 }),
    answer: (v) => dec(num(v, 'n') / num(v, 'd'), 3),
    explanation: ({ answer, vars }) => `${vars.n}/${vars.d} = ${answer}.`,
  }),
  u06('u06-02', 'compare', 2, {
    prompt: 'შეადარე წილადი და ათწილადი და აირჩიე ნიშანი.',
    variables: { i: int(0, FD.length - 1), t: int(1, 99) },
    constraints: [{ test: (v) => Math.round(fdVal(v, 'i') * 100) !== num(v, 't'), note: 'არა ტოლი' }],
    interaction: (v) => ({ kind: 'slots', tokens: [fdText(v, 'i'), '?', decOf(num(v, 't'), 2)], options: ['<', '>'] }),
    answer: (v) => (fdVal(v, 'i') * 100 > num(v, 't') ? '>' : '<'),
    explanation: ({ vars }) => `${fdText(vars, 'i')} = ${dec(fdVal(vars, 'i'), 3)}.`,
  }),
  u06('u06-04', 'order', 3, {
    prompt: 'დაალაგე რიცხვები ზრდადობით.',
    variables: { i: int(0, FD.length - 1), j: int(0, FD.length - 1), t: int(1, 99) },
    constraints: [
      { test: (v) => num(v, 'i') !== num(v, 'j'), note: 'განსხვავებული' },
      { test: (v) => new Set([fdVal(v, 'i'), fdVal(v, 'j'), num(v, 't') / 100].map((y) => y.toFixed(5))).size === 3, note: 'განსხვავებული მნიშვნელობები' },
    ],
    interaction: (v) => ({ kind: 'tiles', cards: rotate([fdText(v, 'i'), fdText(v, 'j'), decOf(num(v, 't'), 2)], num(v, 't') % 3), slots: 3, joiner: ' < ' }),
    answer: (v) => orderOf(v).join(' < '),
    text: true,
    options: (v) => {
      const s = orderOf(v);
      return [s.join(' < '), [...s].reverse().join(' < '), [s[1], s[0], s[2]].join(' < '), [s[0], s[2], s[1]].join(' < ')];
    },
    explanation: ({ answer }) => String(answer),
  }),
];
function orderOf(v: Record<string, unknown>): string[] {
  return [
    [fdVal(v, 'i'), fdText(v, 'i')],
    [fdVal(v, 'j'), fdText(v, 'j')],
    [Number(v.t) / 100, decOf(Number(v.t), 2)],
  ]
    .sort((a, b) => (a[0] as number) - (b[0] as number))
    .map((x) => x[1] as string);
}

/* ------------------------------------------------------------ U07 */
const u07 = T('g6-percent', 'u07');
const U07: QuestionTemplate[] = [
  u07('u07-05', 'shade-percent', 1, {
    prompt: 'კვადრატი 100 თანაბარ უჯრადაა დაყოფილი. შეღებე მისი {p}%.',
    variables: { p: int(1, 99) },
    interaction: () => ({ kind: 'fill', shape: 'grid', total: 100, cols: 10 }),
    answer: (v) => num(v, 'p'),
    explanation: ({ vars }) => `${vars.p}% = ${vars.p} უჯრა ასიდან.`,
  }),
  u07('u07-03', 'fraction-percent', 2, {
    prompt: 'კვადრატი 100 თანაბარ უჯრადაა დაყოფილი. შეღებე მისი {a}/{b}.',
    variables: { b: pick(2, 4, 5, 10, 20, 25, 50), a: int(1, 49) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'b'), note: 'a<b' }],
    interaction: () => ({ kind: 'fill', shape: 'grid', total: 100, cols: 10 }),
    answer: (v) => (100 * num(v, 'a')) / num(v, 'b'),
    explanation: ({ vars, answer }) => `${vars.a}/${vars.b} = ${answer}%.`,
  }),
  u07('u07-01', 'percent-of-line', 2, {
    prompt: 'იპოვე {n}-ის {p}% და შეეხე შედეგს ღერძზე.',
    variables: { n: pick(20, 40, 50, 60, 80, 100, 120, 200), p: pick(10, 20, 30, 40, 50, 60, 70, 80) },
    constraints: [{ test: (v) => (num(v, 'n') * num(v, 'p')) % 100 === 0, note: 'მთელი' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'n'), step: num(v, 'n') / 10, labelEvery: 2 }),
    answer: (v) => (num(v, 'n') * num(v, 'p')) / 100,
    explanation: ({ vars, answer }) => `${vars.n} × ${vars.p}/100 = ${answer}.`,
  }),
  u07('u07-02', 'discount-line', 3, {
    prompt: 'ფასი {p} ლარია. ფასდაკლება {d}%. შეეხე ახალ ფასს ღერძზე.',
    variables: { p: pick(20, 40, 50, 60, 80, 100, 200), d: pick(10, 20, 25, 50) },
    constraints: [{ test: (v) => (num(v, 'p') * num(v, 'd')) % 100 === 0 && (num(v, 'p') * num(v, 'd')) / 100 !== 0 && (num(v, 'p') - (num(v, 'p') * num(v, 'd')) / 100) % (num(v, 'p') / 10) === 0, note: 'ღერძზე ჩანს' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'p'), step: num(v, 'p') / 10, labelEvery: 2, unit: 'ლარი' }),
    answer: (v) => num(v, 'p') - (num(v, 'p') * num(v, 'd')) / 100,
    explanation: ({ vars, answer }) => `${vars.p} − ${(Number(vars.p) * Number(vars.d)) / 100} = ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U08 */
const u08 = T('g6-money', 'u08');
const U08: QuestionTemplate[] = [
  u08('u08-01', 'purse', 1, {
    prompt: 'აიღე ქისიდან {n} თეთრი.',
    variables: { n: int(21, 189) },
    interaction: () => ({ kind: 'purse', coins: COINS, output: 'total' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} თეთრი.`,
  }),
  u08('u08-02', 'change', 2, {
    prompt: 'საქონელი {p} თეთრი ღირს. მყიდველმა {q} თეთრი გადაიხადა. აიღე ხურდა ქისიდან.',
    variables: { p: int(11, 195), q: pick(100, 200, 250) },
    constraints: [{ test: (v) => num(v, 'p') < num(v, 'q'), note: 'p<q' }],
    interaction: () => ({ kind: 'purse', coins: COINS, output: 'total' }),
    answer: (v) => num(v, 'q') - num(v, 'p'),
    explanation: ({ vars, answer }) => `${vars.q} − ${vars.p} = ${answer}.`,
  }),
  u08('u08-04', 'enough', 2, {
    prompt: 'გაქვს {m} ლარი. ჩადე ნივთები ყუთში: საკმარისია თუ არა ფული თითოეულის საყიდლად.',
    variables: { m: int(10, 40), a: int(5, 50), b: int(5, 50), c: int(5, 50), d: int(5, 50) },
    constraints: [{ test: (v) => ['a', 'b', 'c', 'd'].some((k) => num(v, k) <= num(v, 'm')) && ['a', 'b', 'c', 'd'].some((k) => num(v, k) > num(v, 'm')), note: 'ორივე სახეობა' }],
    interaction: (v) => ({ kind: 'bins', bins: ['საკმარისია', 'არ არის საკმარისი'], items: ['a', 'b', 'c', 'd'].map((k) => ({ label: `${num(v, k)} ლარი` })) }),
    answer: (v) => ['a', 'b', 'c', 'd'].map((k) => (num(v, k) <= num(v, 'm') ? 0 : 1)).join(','),
    explanation: ({ vars }) => `ნივთი საკმარისია, თუ ფასი არ აღემატება ${vars.m} ლარს.`,
  }),
];

/* ------------------------------------------------------------ U09 */
const u09 = T('g6-multistep', 'u09');
const U09: QuestionTemplate[] = [
  u09('u09-09', 'distance', 1, {
    prompt: 'მანქანა ყოველ საათში {s} კმ-ს გადის. რამდენს გაივლის {t} საათში? შეეხე ღერძზე.',
    variables: { s: pick(20, 30, 40, 50, 60, 80, 90, 100), t: int(2, 8) },
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 's') * 8, step: num(v, 's'), labelEvery: 3, unit: 'კმ' }),
    answer: (v) => num(v, 's') * num(v, 't'),
    explanation: ({ vars }) => `${vars.s} × ${vars.t}.`,
  }),
  u09('u09-09', 'time', 2, {
    prompt: 'ავტობუსმა {d} კმ გაიარა საათში {s} კმ სიჩქარით. შეღებე იმდენი საათი, რამდენი იმოგზაურა.',
    variables: { s: pick(15, 20, 25, 30, 40, 50, 60), t: int(2, 8), d: derived((v) => num(v, 's') * num(v, 't')) },
    interaction: () => ({ kind: 'fill', shape: 'row', total: 8, noun: 'საათი' }),
    answer: (v) => num(v, 't'),
    explanation: ({ vars }) => `${vars.d} ÷ ${vars.s} = ${vars.t}.`,
  }),
  u09('u09-09', 'speed', 2, {
    prompt: 'ავტობუსმა {t} საათში {d} კმ გაიარა. რა იყო სიჩქარე (კმ/სთ)? შეეხე ღერძზე.',
    variables: { s: int(2, 12), t: int(2, 9), d: derived((v) => num(v, 's') * 10 * num(v, 't')) },
    interaction: () => ({ kind: 'line', min: 0, max: 120, step: 10, labelEvery: 2, unit: 'კმ/სთ' }),
    answer: (v) => num(v, 's') * 10,
    explanation: ({ vars }) => `${vars.d} ÷ ${vars.t} = ${Number(vars.s) * 10}.`,
  }),
  u09('u09-02', 'temperature-change', 2, {
    prompt: 'ტემპერატურა იყო {an}°C, შემდეგ {d} გრადუსით {dir}. შეეხე ახალ ტემპერატურას თერმომეტრზე.',
    variables: { a: int(-12, 12), an: derived((v) => sgn(num(v, 'a'))), d: int(2, 10), dir: pick('დაეცა', 'გაიზარდა') },
    constraints: [{ test: (v) => Math.abs(num(v, 'a') + (str(v, 'dir') === 'დაეცა' ? -1 : 1) * num(v, 'd')) <= 15, note: 'ღერძის ფარგლებში' }],
    interaction: (v) => ({ kind: 'line', min: -15, max: 15, step: 1, labelEvery: 5, style: 'thermo', start: num(v, 'a'), unit: '°C' }),
    answer: (v) => num(v, 'a') + (str(v, 'dir') === 'დაეცა' ? -1 : 1) * num(v, 'd'),
    explanation: ({ answer }) => `ახალი ტემპერატურაა ${sgn(Number(answer))}°C.`,
  }),
];

export const G6_PART_A: QuestionTemplate[] = [...U01, ...U02, ...U03, ...U04, ...U05, ...U06, ...U07, ...U08, ...U09];
