/**
 * Grade VI — interactive templates, part two (units 10–18): algebra, measures,
 * the four-quarter coordinate plane, powers, patterns, statistics, angles and
 * circles, triangles, area and volume. Part one is in `ix-g6.ts`.
 */
import type { QuestionTemplate } from './types';
import { derived, distinct, hhmm, int, num, pick, str } from './ix-kit';
import { rotate } from './ix-kit34';
import { decOf } from './ix-kit56';
import { T6 as T, par, planeBox, sgn } from './ix-g6';

const five = ['a', 'b', 'c', 'd', 'e'];
const axisLine = (min: number, max: number, extra: Record<string, unknown> = {}) => ({ kind: 'line' as const, min, max, step: 1, labelEvery: max - min > 20 ? 5 : 2, ...extra });
const PAIRS = [['a', 'ya'], ['b', 'yb'], ['c', 'yc'], ['d', 'yd']] as const;

/* ------------------------------------------------------------ U10 */
const u10 = T('g6-algebra', 'u10');
const U10: QuestionTemplate[] = [
  u10('u10-09', 'one-step', 1, {
    prompt: 'ამოხსენი განტოლება: x + {a} = {s}. შეეხე x-ს ღერძზე.',
    variables: { x: int(-12, 12), a: int(1, 12), s: derived((v) => num(v, 'x') + num(v, 'a')) },
    interaction: () => axisLine(-15, 15, { labelEvery: 5 }),
    answer: (v) => num(v, 'x'),
    explanation: ({ vars }) => `x = ${sgn(Number(vars.s))} − ${vars.a} = ${sgn(Number(vars.x))}.`,
  }),
  u10('u10-04', 'unknown-factor', 1, {
    prompt: 'იპოვე x: {k} × x = {p}. შეეხე ღერძზე.',
    variables: { k: int(2, 9), x: int(2, 12), p: derived((v) => num(v, 'k') * num(v, 'x')) },
    interaction: () => ({ kind: 'line', min: 0, max: 15, step: 1, labelEvery: 5 }),
    answer: (v) => num(v, 'x'),
    explanation: ({ vars }) => `x = ${vars.p} ÷ ${vars.k}.`,
  }),
  u10('u10-10', 'two-step', 2, {
    prompt: 'ამოხსენი განტოლება: {k}x + {c} = {s}. შეეხე x-ს ღერძზე.',
    variables: { k: int(2, 9), x: int(-6, 12), c: int(1, 30), s: derived((v) => num(v, 'k') * num(v, 'x') + num(v, 'c')) },
    interaction: () => axisLine(-8, 14, { labelEvery: 2 }),
    answer: (v) => num(v, 'x'),
    explanation: ({ vars }) => `(${sgn(Number(vars.s))} − ${vars.c}) ÷ ${vars.k} = ${sgn(Number(vars.x))}.`,
  }),
  u10('u10-08', 'evaluate', 2, {
    prompt: 'იპოვე გამოსახულების მნიშვნელობა, თუ x = {xp}: {k}x + {c}. შეეხე ღერძზე.',
    variables: { x: int(-5, 5), k: int(2, 5), c: int(1, 9), xp: derived((v) => sgn(num(v, 'x'))) },
    interaction: () => axisLine(-30, 30, { labelEvery: 10 }),
    answer: (v) => num(v, 'k') * num(v, 'x') + num(v, 'c'),
    explanation: ({ vars, answer }) => `${vars.k} × ${par(Number(vars.x))} + ${vars.c} = ${sgn(Number(answer))}.`,
  }),
  u10('u10-12', 'satisfies', 2, {
    prompt: 'ჩადე წყვილები სწორ ყუთში: აკმაყოფილებს თუ არა ტოლობას x + y = {s}.',
    variables: { s: int(5, 15), a: int(0, 12), b: int(0, 12), c: int(0, 12), d: int(0, 12), ya: int(0, 12), yb: int(0, 12), yc: int(0, 12), yd: int(0, 12) },
    constraints: [
      { test: (v) => PAIRS.some(([x, y]) => num(v, x) + num(v, y) === num(v, 's')) && PAIRS.some(([x, y]) => num(v, x) + num(v, y) !== num(v, 's')), note: 'ორივე' },
    ],
    interaction: (v) => ({ kind: 'bins', bins: ['აკმაყოფილებს', 'არ აკმაყოფილებს'], items: PAIRS.map(([x, y]) => ({ label: `(${num(v, x)}; ${num(v, y)})` })) }),
    answer: (v) => PAIRS.map(([x, y]) => (num(v, x) + num(v, y) === num(v, 's') ? 0 : 1)).join(','),
    explanation: ({ vars }) => `წყვილი კარგია, თუ ჯამი ${vars.s}-ია.`,
  }),
  u10('u10-13', 'inequality', 2, {
    prompt: 'შეეხე ყველა x-ს, რომლისთვისაც x + {a} < {s}.',
    variables: { a: int(1, 8), s: int(6, 14) },
    constraints: [{ test: (v) => num(v, 's') - num(v, 'a') >= 2 && num(v, 's') - num(v, 'a') <= 10, note: 'ჩანს ცხრილში' }],
    interaction: () => ({ kind: 'pick', mode: 'many', items: Array.from({ length: 12 }, (_, i) => ({ label: String(i + 1) })) }),
    answer: (v) => Array.from({ length: 12 }, (_, i) => i + 1).filter((x) => x + num(v, 'a') < num(v, 's')).join(','),
    explanation: ({ vars }) => `x < ${Number(vars.s) - Number(vars.a)}.`,
  }),
];

/* ------------------------------------------------------------ U11 */
const u11 = T('g6-measure-time', 'u11');
const U11: QuestionTemplate[] = [
  u11('u11-01', 'scale', 2, {
    prompt: 'რუკაზე 1 სმ რეალურად {s} კმ-ს შეესაბამება. რამდენი კმ იქნება {n} სმ? შეეხე ღერძზე.',
    variables: { s: pick(2, 3, 5, 10, 20), n: int(2, 9) },
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 's') * 10, step: num(v, 's'), labelEvery: 2, unit: 'კმ' }),
    answer: (v) => num(v, 's') * num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} × ${vars.s}.`,
  }),
  u11('u11-05', 'm-to-cm', 1, {
    prompt: 'რამდენი სანტიმეტრია {m} მეტრში? შეეხე ღერძზე.',
    variables: { t: int(1, 8), m: derived((v) => decOf(num(v, 't') * 5, 1)) },
    interaction: () => ({ kind: 'line', min: 0, max: 400, step: 50, labelEvery: 2, unit: 'სმ' }),
    answer: (v) => num(v, 't') * 50,
    explanation: ({ vars }) => `${vars.m} მ = ${Number(vars.t) * 50} სმ.`,
  }),
  u11('u11-06', 'temp-diff', 2, {
    prompt: 'დილით ტემპერატურა იყო {an}°C, დღისით კი {bn}°C. რამდენი გრადუსით გაცხელდა? შეეხე სხვაობას ღერძზე.',
    variables: { a: int(-12, -1), b: int(1, 14), an: derived((v) => sgn(num(v, 'a'))), bn: derived((v) => sgn(num(v, 'b'))) },
    interaction: () => ({ kind: 'line', min: 0, max: 30, step: 1, labelEvery: 5, unit: '°C' }),
    answer: (v) => num(v, 'b') - num(v, 'a'),
    explanation: ({ vars, answer }) => `${vars.bn} − (${vars.an}) = ${answer}.`,
  }),
  u11('u11-08', 'clock-later', 2, {
    prompt: 'საათი {t}-ს აჩვენებს. დააყენე საათი {d} წუთის შემდეგ.',
    variables: { h: int(1, 12), m: pick(0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55), d: pick(15, 20, 25, 35, 40, 50, 65, 80), t: derived((v) => hhmm(num(v, 'h'), num(v, 'm'))) },
    interaction: () => ({ kind: 'clock', minuteStep: 5 }),
    answer: (v) => {
      const total = (num(v, 'h') % 12) * 60 + num(v, 'm') + num(v, 'd');
      return hhmm(Math.floor(total / 60), total % 60);
    },
    time: true,
    explanation: ({ answer }) => `${answer}.`,
  }),
];

/* ------------------------------------------------------------ U12 */
const u12 = T('g6-coordinates', 'u12');
const quadrant = (x: number, y: number): number => (x > 0 && y > 0 ? 0 : x < 0 && y > 0 ? 1 : x < 0 && y < 0 ? 2 : 3);
const U12: QuestionTemplate[] = [
  u12('u12-01', 'plot', 1, {
    prompt: 'მონიშნე ბადეზე წერტილი ({xs}; {ys}).',
    variables: { x: int(-6, 6), y: int(-6, 6), xs: derived((v) => sgn(num(v, 'x'))), ys: derived((v) => sgn(num(v, 'y'))) },
    interaction: () => planeBox(),
    answer: (v) => `${num(v, 'x')},${num(v, 'y')}`,
    explanation: ({ vars }) => `(${vars.xs}; ${vars.ys}).`,
  }),
  u12('u12-02', 'quadrant-bins', 2, {
    prompt: 'ჩადე წერტილები იმ მეოთხედის ყუთში, რომელშიც ისინი მდებარეობს.',
    variables: { a: int(-6, 6), b: int(-6, 6), c: int(-6, 6), d: int(-6, 6), e: int(-6, 6), f: int(-6, 6) },
    constraints: [
      { test: (v) => ['a', 'b', 'c', 'd', 'e', 'f'].every((k) => num(v, k) !== 0), note: 'არა ღერძზე' },
      { test: (v) => new Set([quadrant(num(v, 'a'), num(v, 'b')), quadrant(num(v, 'c'), num(v, 'd')), quadrant(num(v, 'e'), num(v, 'f'))]).size >= 2, note: 'ორი მეოთხედი' },
    ],
    interaction: (v) => ({ kind: 'bins', bins: ['I', 'II', 'III', 'IV'], items: [['a', 'b'], ['c', 'd'], ['e', 'f']].map(([x, y]) => ({ label: `(${sgn(num(v, x!))}; ${sgn(num(v, y!))})` })) }),
    answer: (v) => [['a', 'b'], ['c', 'd'], ['e', 'f']].map(([x, y]) => quadrant(num(v, x!), num(v, y!))).join(','),
    explanation: () => 'I: (+; +), II: (−; +), III: (−; −), IV: (+; −).',
  }),
  u12('u12-04', 'move', 2, {
    prompt: 'A წერტილი {dx} ერთეულით {hdir} და {dy} ერთეულით {vdir} გადაადგილდა. მონიშნე ახალი მდებარეობა.',
    variables: { x: int(-3, 3), y: int(-3, 3), dx: int(1, 3), dy: int(1, 3), h: pick(-1, 1), w: pick(-1, 1), hdir: derived((v) => (num(v, 'h') > 0 ? 'მარჯვნივ' : 'მარცხნივ')), vdir: derived((v) => (num(v, 'w') > 0 ? 'ზემოთ' : 'ქვემოთ')) },
    interaction: (v) => planeBox(6, { points: [{ x: num(v, 'x'), y: num(v, 'y'), label: 'A' }] }),
    answer: (v) => `${num(v, 'x') + num(v, 'h') * num(v, 'dx')},${num(v, 'y') + num(v, 'w') * num(v, 'dy')}`,
    explanation: ({ vars }) => `ახალი წერტილია (${Number(vars.x) + Number(vars.h) * Number(vars.dx)}; ${Number(vars.y) + Number(vars.w) * Number(vars.dy)}).`,
  }),
  u12('u12-05', 'axis-symmetry', 2, {
    prompt: 'მონიშნე A წერტილის სიმეტრიული წერტილი {ax}-ღერძის მიმართ.',
    variables: { x: int(-5, 5), y: int(-5, 5), ax: pick('y', 'x') },
    constraints: [{ test: (v) => num(v, 'x') !== 0 && num(v, 'y') !== 0, note: 'არა ღერძზე' }],
    interaction: (v) => planeBox(6, { points: [{ x: num(v, 'x'), y: num(v, 'y'), label: 'A' }] }),
    answer: (v) => (str(v, 'ax') === 'y' ? `${-num(v, 'x')},${num(v, 'y')}` : `${num(v, 'x')},${-num(v, 'y')}`),
    explanation: ({ vars }) => `${vars.ax}-ღერძის მიმართ ${vars.ax === 'y' ? 'x' : 'y'} იცვლის ნიშანს.`,
  }),
  u12('u12-06', 'center-symmetry', 3, {
    prompt: 'მონიშნე A წერტილის სიმეტრიული წერტილი კოორდინატთა სათავის მიმართ.',
    variables: { x: int(-5, 5), y: int(-5, 5) },
    constraints: [{ test: (v) => num(v, 'x') !== 0 && num(v, 'y') !== 0, note: 'არა ღერძზე' }],
    interaction: (v) => planeBox(6, { points: [{ x: num(v, 'x'), y: num(v, 'y'), label: 'A' }] }),
    answer: (v) => `${-num(v, 'x')},${-num(v, 'y')}`,
    explanation: () => 'სათავის მიმართ ორივე კოორდინატი იცვლის ნიშანს.',
  }),
  u12('u12-03', 'rectangle', 3, {
    prompt: 'A, B და C მართკუთხედის სამი წვეროა. მონიშნე მეოთხე წვერო D.',
    variables: { x1: int(-5, -1), x2: int(1, 5), y1: int(-5, -1), y2: int(1, 5) },
    interaction: (v) =>
      planeBox(6, {
        points: [
          { x: num(v, 'x1'), y: num(v, 'y1'), label: 'A' },
          { x: num(v, 'x2'), y: num(v, 'y1'), label: 'B' },
          { x: num(v, 'x2'), y: num(v, 'y2'), label: 'C' },
        ],
        segments: [[[num(v, 'x1'), num(v, 'y1')], [num(v, 'x2'), num(v, 'y1')]], [[num(v, 'x2'), num(v, 'y1')], [num(v, 'x2'), num(v, 'y2')]]],
      }),
    answer: (v) => `${num(v, 'x1')},${num(v, 'y2')}`,
    explanation: ({ vars }) => `D(${sgn(Number(vars.x1))}; ${sgn(Number(vars.y2))}).`,
  }),
  u12('u12-01', 'two-points', 2, {
    prompt: 'მონიშნე ორივე წერტილი: A({xa}; {ya}) და B({xb}; {yb}).',
    variables: { x1: int(-6, 6), y1: int(-6, 6), x2: int(-6, 6), y2: int(-6, 6), xa: derived((v) => sgn(num(v, 'x1'))), ya: derived((v) => sgn(num(v, 'y1'))), xb: derived((v) => sgn(num(v, 'x2'))), yb: derived((v) => sgn(num(v, 'y2'))) },
    constraints: [{ test: (v) => num(v, 'x1') !== num(v, 'x2') || num(v, 'y1') !== num(v, 'y2'), note: 'განსხვავებული' }],
    interaction: () => planeBox(6, { count: 2 }),
    answer: (v) =>
      [
        [num(v, 'x1'), num(v, 'y1')],
        [num(v, 'x2'), num(v, 'y2')],
      ]
        .sort((a, b) => a[0]! - b[0]! || a[1]! - b[1]!)
        .map(([x, y]) => `${x},${y}`)
        .join(';'),
    explanation: () => 'ჯერ x, შემდეგ y.',
  }),
];

/* ------------------------------------------------------------ U13 */
const u13 = T('g6-powers-roots', 'u13');
const U13: QuestionTemplate[] = [
  u13('u13-01', 'square-area', 2, {
    prompt: 'ააგე კვადრატი, რომლის ფართობია {a} კვადრატული უჯრა.',
    variables: { n: int(3, 12), a: derived((v) => num(v, 'n') * num(v, 'n')) },
    interaction: () => ({ kind: 'array', maxRows: 12, maxCols: 12, output: 'dims' }),
    answer: (v) => `${num(v, 'n')},${num(v, 'n')}`,
    explanation: ({ vars }) => `${vars.n}² = ${vars.a}.`,
  }),
  u13('u13-03', 'perfect-squares', 2, {
    prompt: 'შეეხე ყველა სრულ კვადრატს.',
    variables: { s: int(1, 40) },
    constraints: [{ test: (v) => Array.from({ length: 12 }, (_, i) => num(v, 's') + i).some((n) => Number.isInteger(Math.sqrt(n))), note: 'არის კვადრატი' }],
    interaction: (v) => ({ kind: 'pick', mode: 'many', items: Array.from({ length: 12 }, (_, i) => ({ label: String(num(v, 's') + i) })) }),
    answer: (v) =>
      Array.from({ length: 12 }, (_, i) => i + 1)
        .filter((p) => Number.isInteger(Math.sqrt(num(v, 's') + p - 1)))
        .join(','),
    explanation: () => 'სრული კვადრატია რიცხვი, რომელიც მთელი რიცხვის კვადრატია.',
  }),
  u13('u13-04', 'sqrt-line', 2, {
    prompt: 'იპოვე √{a} და შეეხე შედეგს ღერძზე.',
    variables: { n: int(2, 12), a: derived((v) => num(v, 'n') * num(v, 'n')) },
    interaction: () => ({ kind: 'line', min: 0, max: 12, step: 1, labelEvery: 2 }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n}² = ${vars.a}, ამიტომ √${vars.a} = ${vars.n}.`,
  }),
  u13('u13-03', 'cube', 2, {
    prompt: 'გამოთვალე {n}³ და ააგე პასუხი.',
    variables: { n: int(2, 9) },
    interaction: () => ({ kind: 'place', digits: 3 }),
    answer: (v) => num(v, 'n') ** 3,
    explanation: ({ vars }) => `${vars.n}³ = ${Number(vars.n) ** 3}.`,
  }),
];

/* ------------------------------------------------------------ U14 */
const u14 = T('g6-patterns-chance', 'u14');
const oddSet = (v: Record<string, unknown>): number[] => {
  const d = Number(v.d);
  return rotate([d * Number(v.a), d * Number(v.b), d * Number(v.c), d * Number(v.x) + 1 + (Number(v.y) % (d - 1))], Number(v.r));
};
const U14: QuestionTemplate[] = [
  u14('u14-01', 'next-chart', 1, {
    prompt: 'გააგრძელე მიმდევრობა: {a}, {b}, {c}, {e}, … შეეხე შემდეგ რიცხვს ცხრილში.',
    variables: { a: int(2, 30), d: int(2, 12), b: derived((v) => num(v, 'a') + num(v, 'd')), c: derived((v) => num(v, 'a') + 2 * num(v, 'd')), e: derived((v) => num(v, 'a') + 3 * num(v, 'd')) },
    constraints: [{ test: (v) => num(v, 'a') + 4 * num(v, 'd') <= 100, note: 'ცხრილის ფარგლებში' }],
    interaction: () => ({ kind: 'chart', from: 1, to: 100, cols: 10 }),
    answer: (v) => num(v, 'a') + 4 * num(v, 'd'),
    explanation: ({ vars, answer }) => `ყოველ ნაბიჯზე ემატება ${vars.d}; შემდეგია ${answer}.`,
  }),
  u14('u14-02', 'down-line', 2, {
    prompt: 'გააგრძელე კლებადი მიმდევრობა: {a}, {b}, {c}, … შეეხე შემდეგ რიცხვს ღერძზე.',
    variables: { d: int(2, 6), n: int(0, 8), a: derived((v) => (num(v, 'n') + 3) * num(v, 'd')), b: derived((v) => (num(v, 'n') + 2) * num(v, 'd')), c: derived((v) => (num(v, 'n') + 1) * num(v, 'd')) },
    interaction: (v) => ({ kind: 'line', min: 0, max: (num(v, 'n') + 3) * num(v, 'd'), step: num(v, 'd'), labelEvery: 2 }),
    answer: (v) => num(v, 'n') * num(v, 'd'),
    explanation: ({ vars }) => `ყოველ ნაბიჯზე მცირდება ${vars.d}-ით.`,
  }),
  u14('u14-03', 'odd-one', 2, {
    prompt: 'სამი რიცხვი ერთ წესს ემორჩილება, ერთი — არა. შეეხე ზედმეტს.',
    variables: { d: int(3, 9), a: int(2, 15), b: int(2, 15), c: int(2, 15), x: int(2, 15), y: int(0, 8), r: int(0, 3) },
    constraints: [{ test: (v) => new Set(oddSet(v)).size === 4 && new Set([num(v, 'a'), num(v, 'b'), num(v, 'c')]).size === 3, note: 'განსხვავებული' }],
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: oddSet(v).map((n) => ({ label: String(n) })) }),
    answer: (v) => oddSet(v).findIndex((n) => n % num(v, 'd') !== 0) + 1,
    explanation: ({ vars }) => `სამი რიცხვი ${vars.d}-ის ჯერადია.`,
  }),
  u14('u14-05', 'certain-bins', 2, {
    prompt: 'ჩვეულებრივი ექვსწახნაგა კამათლის გაგორებისას თითოეული მოვლენა შეუძლებელია, შესაძლებელია თუ აუცილებელი? ჩადე ყუთში.',
    variables: { a: int(1, 9), b: int(1, 7), c: int(1, 8) },
    interaction: (v) => ({
      kind: 'bins',
      bins: ['შეუძლებელი', 'შესაძლებელი', 'აუცილებელი'],
      items: [{ label: `ამოვა ${num(v, 'a')}` }, { label: 'ამოვა რიცხვი 1-დან 6-მდე' }, { label: `ამოვა ${num(v, 'b')}-ზე მეტი` }, { label: `ამოვა ${num(v, 'c')}-ზე ნაკლები ან ტოლი` }],
    }),
    answer: (v) => [num(v, 'a') > 6 ? 0 : 1, 2, num(v, 'b') >= 6 ? 0 : 1, num(v, 'c') >= 6 ? 2 : 1].join(','),
    explanation: () => 'კამათელზე 1-დან 6-მდე რიცხვებია.',
  }),
  u14('u14-06', 'factorial', 2, {
    prompt: 'გამოთვალე {n}! და ააგე პასუხი.',
    variables: { n: int(3, 7) },
    interaction: () => ({ kind: 'place', digits: 4 }),
    answer: (v) => Array.from({ length: num(v, 'n') }, (_, i) => i + 1).reduce((a, b) => a * b, 1),
    explanation: ({ vars, answer }) => `${vars.n}! = ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U15 */
const u15 = T('g6-statistics', 'u15');
const sorted5 = (v: Record<string, unknown>): number[] => ['a', 'b', 'c', 'd', 'e'].map((k) => Number(v[k])).sort((x, y) => x - y);
const U15: QuestionTemplate[] = [
  u15('u15-03', 'median', 2, {
    prompt: 'შეეხე მონაცემთა მედიანას: {a}, {b}, {c}, {d}, {e}.',
    variables: { a: int(1, 30), b: int(1, 30), c: int(1, 30), d: int(1, 30), e: int(1, 30) },
    constraints: [distinct('a', 'b', 'c', 'd', 'e')],
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: five.map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) => five.findIndex((k) => num(v, k) === sorted5(v)[2]) + 1,
    explanation: ({ vars }) => `დალაგებულ რიგში შუა რიცხვია ${sorted5(vars)[2]}.`,
  }),
  u15('u15-01', 'extreme', 1, {
    prompt: 'შეეხე მონაცემთა {which} მნიშვნელობას: {a}, {b}, {c}, {d}, {e}.',
    variables: { a: int(1, 30), b: int(1, 30), c: int(1, 30), d: int(1, 30), e: int(1, 30), w: pick(0, 1), which: derived((v) => (num(v, 'w') === 0 ? 'უდიდეს' : 'უმცირეს')) },
    constraints: [distinct('a', 'b', 'c', 'd', 'e')],
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: five.map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) => five.findIndex((k) => num(v, k) === sorted5(v)[num(v, 'w') === 0 ? 4 : 0]) + 1,
    explanation: ({ vars }) => `${vars.which === 'უდიდეს' ? 'უდიდესია' : 'უმცირესია'} ${sorted5(vars)[vars.which === 'უდიდეს' ? 4 : 0]}.`,
  }),
  u15('u15-02', 'mean-line', 2, {
    prompt: 'სამი რიცხვის საშუალო არითმეტიკულია {m}. ორი რიცხვია {a} და {b}. შეეხე მესამეს ღერძზე.',
    variables: { a: int(2, 15), b: int(2, 15), c: int(2, 15), m: derived((v) => (num(v, 'a') + num(v, 'b') + num(v, 'c')) / 3) },
    constraints: [{ test: (v) => (num(v, 'a') + num(v, 'b') + num(v, 'c')) % 3 === 0, note: 'მთელი საშუალო' }],
    interaction: () => ({ kind: 'line', min: 0, max: 20, step: 1, labelEvery: 5 }),
    answer: (v) => num(v, 'c'),
    explanation: ({ vars }) => `3 × ${vars.m} − ${vars.a} − ${vars.b} = ${vars.c}.`,
  }),
  u15('u15-05', 'bars', 2, {
    prompt: 'მონაცემები: A — {a}, B — {b}, C — {c}. ააგე სვეტოვანი დიაგრამა.',
    variables: { a: int(1, 9), b: int(1, 9), c: int(1, 9) },
    interaction: () => ({ kind: 'counters', style: 'bars', labels: ['A', 'B', 'C'], icon: 'sq-blue', max: 10 }),
    answer: (v) => `${num(v, 'a')},${num(v, 'b')},${num(v, 'c')}`,
    explanation: () => 'სვეტის სიმაღლე მონაცემის ტოლია.',
  }),
];

/* ------------------------------------------------------------ U16 */
const u16 = T('g6-angles-circles', 'u16');
const U16: QuestionTemplate[] = [
  u16('u16-02', 'angle-kind', 1, {
    prompt: 'ჩადე კუთხეები სწორ ყუთში: მახვილი, მართი თუ ბლაგვი.',
    variables: { a: int(1, 17), b: int(1, 17), c: int(1, 17), d: int(1, 17), e: int(1, 17) },
    constraints: [{ test: (v) => five.some((k) => num(v, k) < 9) && five.some((k) => num(v, k) > 9), note: 'მახვილი და ბლაგვი' }, distinct(...five)],
    interaction: (v) => ({ kind: 'bins', bins: ['მახვილი', 'მართი', 'ბლაგვი'], items: five.map((k) => ({ label: `${num(v, k) * 10}°` })) }),
    answer: (v) => five.map((k) => (num(v, k) < 9 ? 0 : num(v, k) === 9 ? 1 : 2)).join(','),
    explanation: () => 'მახვილი < 90°, მართი = 90°, ბლაგვი > 90°.',
  }),
  u16('u16-05', 'supplement', 1, {
    prompt: 'მომიჯნავე კუთხეების ჯამია 180°. ერთი კუთხეა {a}°. გახსენი მეორე.',
    variables: { k: int(1, 17), a: derived((v) => num(v, 'k') * 10) },
    constraints: [{ test: (v) => num(v, 'k') !== 9, note: 'არა მართი' }],
    interaction: () => ({ kind: 'angle', step: 5, max: 180 }),
    answer: (v) => 180 - num(v, 'k') * 10,
    explanation: ({ answer }) => `180° − ... = ${answer}°.`,
  }),
  u16('u16-04', 'parallel-corresponding', 2, {
    prompt: 'ორი პარალელური წრფე მკვეთმა გადაკვეთა. ერთი კუთხეა {a}°. გახსენი მისი შესაბამისი კუთხე.',
    variables: { k: int(2, 16), a: derived((v) => num(v, 'k') * 10) },
    constraints: [{ test: (v) => num(v, 'k') !== 9, note: 'არა მართი' }],
    interaction: () => ({ kind: 'angle', step: 5, max: 180 }),
    answer: (v) => num(v, 'k') * 10,
    explanation: ({ vars }) => `შესაბამისი კუთხეები ტოლია: ${vars.a}°.`,
  }),
  u16('u16-04', 'parallel-cointerior', 3, {
    prompt: 'ორი პარალელური წრფე მკვეთმა გადაკვეთა. ერთი შიგა ცალმხრივი კუთხეა {a}°. გახსენი მეორე შიგა ცალმხრივი კუთხე.',
    variables: { k: int(2, 16), a: derived((v) => num(v, 'k') * 10) },
    constraints: [{ test: (v) => num(v, 'k') !== 9, note: 'არა მართი' }],
    interaction: () => ({ kind: 'angle', step: 5, max: 180 }),
    answer: (v) => 180 - num(v, 'k') * 10,
    explanation: ({ answer }) => `შიგა ცალმხრივი კუთხეების ჯამია 180°; მეორე ${answer}°.`,
  }),
  u16('u16-05', 'vertical', 1, {
    prompt: 'ორი წრფე იკვეთება და ერთი კუთხეა {a}°. გახსენი მისი ვერტიკალური კუთხე.',
    variables: { k: int(1, 17), a: derived((v) => num(v, 'k') * 10) },
    interaction: () => ({ kind: 'angle', step: 5, max: 180 }),
    answer: (v) => num(v, 'k') * 10,
    explanation: ({ vars }) => `ვერტიკალური კუთხეები ტოლია: ${vars.a}°.`,
  }),
  u16('u16-08', 'inscribed', 3, {
    prompt: 'ცენტრალური კუთხე {a}°-ია. გახსენი იმავე რკალზე დაყრდნობილი ჩახაზული კუთხე.',
    variables: { k: int(2, 9), a: derived((v) => num(v, 'k') * 20) },
    interaction: () => ({ kind: 'angle', step: 5, max: 180 }),
    answer: (v) => num(v, 'k') * 10,
    explanation: ({ vars }) => `ჩახაზული კუთხე ცენტრალურის ნახევარია: ${Number(vars.a) / 2}°.`,
  }),
  u16('u16-10', 'sector', 3, {
    prompt: 'წრის სექტორი წრის {p}%-ია. გახსენი მისი ცენტრალური კუთხე (სრული წრე 360°-ია).',
    variables: { p: pick(5, 10, 15, 20, 25, 30, 35, 40, 45, 50) },
    interaction: () => ({ kind: 'angle', step: 2, max: 180 }),
    answer: (v) => (360 * num(v, 'p')) / 100,
    explanation: ({ vars, answer }) => `360° × ${vars.p}% = ${answer}°.`,
  }),
  u16('u16-09', 'diameter', 1, {
    prompt: 'წრის რადიუსია {r} სმ. რამდენია დიამეტრი? შეეხე ღერძზე.',
    variables: { r: int(3, 19) },
    interaction: () => ({ kind: 'line', min: 0, max: 40, step: 2, labelEvery: 5, unit: 'სმ' }),
    answer: (v) => 2 * num(v, 'r'),
    explanation: ({ vars }) => `2 × ${vars.r}.`,
  }),
];

/* ------------------------------------------------------------ U17 */
const u17 = T('g6-triangles-quads', 'u17');
const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
const U17: QuestionTemplate[] = [
  u17('u17-04', 'triangle-third', 2, {
    prompt: 'სამკუთხედის ორი კუთხეა {a}° და {b}°. გახსენი მესამე კუთხე.',
    variables: { a: int(20, 100, { step: 5 }), b: int(20, 100, { step: 5 }) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 175, note: 'მესამე დადებითია' }],
    interaction: () => ({ kind: 'angle', step: 5, max: 180 }),
    answer: (v) => 180 - num(v, 'a') - num(v, 'b'),
    explanation: ({ vars, answer }) => `180° − ${vars.a}° − ${vars.b}° = ${answer}°.`,
  }),
  u17('u17-03', 'exterior', 2, {
    prompt: 'სამკუთხედის ორი შიგა კუთხეა {a}° და {b}°. გახსენი მესამე წვეროს გარე კუთხე.',
    variables: { a: int(20, 100, { step: 5 }), b: int(20, 100, { step: 5 }) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 175, note: 'გარე კუთხე ≤ 175' }],
    interaction: () => ({ kind: 'angle', step: 5, max: 180 }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `გარე კუთხე ტოლია ორი არამომიჯნავე შიგა კუთხის ჯამის: ${Number(vars.a) + Number(vars.b)}°.`,
  }),
  u17('u17-07', 'quad-fourth', 2, {
    prompt: 'ოთხკუთხედის სამი კუთხეა {a}°, {b}° და {c}°. გახსენი მეოთხე კუთხე.',
    variables: { a: int(60, 140, { step: 5 }), b: int(60, 140, { step: 5 }), c: int(60, 140, { step: 5 }) },
    constraints: [{ test: (v) => 360 - num(v, 'a') - num(v, 'b') - num(v, 'c') >= 5 && 360 - num(v, 'a') - num(v, 'b') - num(v, 'c') <= 175, note: 'მეოთხე კუთხე ≤ 175' }],
    interaction: () => ({ kind: 'angle', step: 5, max: 180 }),
    answer: (v) => 360 - num(v, 'a') - num(v, 'b') - num(v, 'c'),
    explanation: ({ answer }) => `ოთხკუთხედის კუთხეთა ჯამია 360°; მეოთხე ${answer}°.`,
  }),
  u17('u17-05', 'hypotenuse', 3, {
    prompt: 'მართკუთხა სამკუთხედის კათეტებია {a} და {b} სმ. რამდენია ჰიპოტენუზა? შეეხე ღერძზე.',
    variables: { t: int(0, 3), k: int(1, 3), a: derived((v) => TRIPLES[num(v, 't')]![0]! * num(v, 'k')), b: derived((v) => TRIPLES[num(v, 't')]![1]! * num(v, 'k')) },
    constraints: [{ test: (v) => TRIPLES[num(v, 't')]![2]! * num(v, 'k') <= 40, note: 'ღერძის ფარგლებში' }],
    interaction: () => ({ kind: 'line', min: 0, max: 40, step: 1, labelEvery: 5, unit: 'სმ' }),
    answer: (v) => TRIPLES[num(v, 't')]![2]! * num(v, 'k'),
    explanation: ({ vars, answer }) => `${vars.a}² + ${vars.b}² = ${answer}².`,
  }),
  u17('u17-09', 'midline', 3, {
    prompt: 'ტრაპეციის ფუძეებია {a} და {b} სმ. რამდენია მისი შუა ხაზი? შეეხე ღერძზე.',
    variables: { a: int(2, 20), b: int(2, 20) },
    constraints: [{ test: (v) => (num(v, 'a') + num(v, 'b')) % 2 === 0 && num(v, 'a') !== num(v, 'b'), note: 'მთელი' }],
    interaction: () => ({ kind: 'line', min: 0, max: 20, step: 1, labelEvery: 5, unit: 'სმ' }),
    answer: (v) => (num(v, 'a') + num(v, 'b')) / 2,
    explanation: ({ vars }) => `(${vars.a} + ${vars.b}) ÷ 2.`,
  }),
];

/* ------------------------------------------------------------ U18 */
const u18 = T('g6-area-volume', 'u18');
const U18: QuestionTemplate[] = [
  u18('u18-01', 'perimeter', 2, {
    prompt: 'ააგე მართკუთხედი, რომლის ერთი გვერდია {r} უჯრა და პერიმეტრია {p}.',
    variables: { r: int(2, 9), c: int(2, 12), p: derived((v) => 2 * (num(v, 'r') + num(v, 'c'))) },
    interaction: (v) => ({ kind: 'array', maxRows: 12, maxCols: 14, fixedRows: num(v, 'r'), output: 'perimeter' }),
    answer: (v) => 2 * (num(v, 'r') + num(v, 'c')),
    explanation: ({ vars }) => `მეორე გვერდია ${vars.c}.`,
  }),
  u18('u18-02', 'area', 2, {
    prompt: 'ააგე მართკუთხედი, რომლის ერთი გვერდია {r} უჯრა და ფართობია {a} უჯრა.',
    variables: { r: int(2, 9), c: int(2, 12), a: derived((v) => num(v, 'r') * num(v, 'c')) },
    interaction: (v) => ({ kind: 'array', maxRows: 12, maxCols: 14, fixedRows: num(v, 'r'), output: 'count' }),
    answer: (v) => num(v, 'r') * num(v, 'c'),
    explanation: ({ vars }) => `${vars.a} ÷ ${vars.r} = ${vars.c}.`,
  }),
];

export const G6_PART_B: QuestionTemplate[] = [...U10, ...U11, ...U12, ...U13, ...U14, ...U15, ...U16, ...U17, ...U18];
