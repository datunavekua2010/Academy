/**
 * Grade V — interactive templates.
 *
 * Numbers are built place by place, rounded and estimated on a number line,
 * sorted by divisibility; fractions are shaded, placed on number lines and
 * ordered with cards; decimals and percents are built and shaded; the
 * coordinate plane is tapped; angles are opened; arrays show perimeter and
 * area; clocks are set and coins counted; data becomes bars and pictograms.
 */
import type { QuestionTemplate } from './types';
import { derived, distinct, hhmm, int, interactiveSet, num, pick, str } from './ix-kit';
import { SIGNS, rotate, signOf } from './ix-kit34';
import { SIGN4, cmpFrac, dec, decOf, divisorsOf, evalSigns, gcd, lcm, neg, romanFull } from './ix-kit56';
import { clockPic, modelPic, partsPic } from './ix-kit34';

const T = (topicId: string, unit: string) => interactiveSet(5, topicId, `g5-ix-${unit}`);
const COINS = [1, 2, 5, 10, 20, 50];
const five = ['a', 'b', 'c', 'd', 'e'];
const lo = (n: number, unit: number): number => Math.floor(n / unit) * unit;
const roundTo = (n: number, unit: number): number => Math.round(n / unit) * unit;
const digitCards = Array.from({ length: 10 }, (_, i) => String(i));
const plane = (box = 8, extra: Record<string, unknown> = {}) => ({ kind: 'plane' as const, xmin: 0, xmax: box, ymin: 0, ymax: box, cell: 30, ...extra });

/* ------------------------------------------------------------ U01 */
const u01 = T('g5-numbers-place-value', 'u01');
const powerItems = (v: { k: number; r: number }) => rotate([10 ** v.k, 2 * 10 ** v.k, 11 * 10 ** (v.k - 1), 5 * 10 ** v.k], v.r);
const U01: QuestionTemplate[] = [
  u01('u01-04', 'place6', 2, {
    prompt: 'ააგე რიცხვი: {a} ასი ათასეული, {b} ათი ათასეული, {c} ათასეული, {d} ასეული, {e} ათეული და {f} ერთეული.',
    variables: { a: int(1, 9), b: int(0, 9), c: int(0, 9), d: int(0, 9), e: int(0, 9), f: int(0, 9) },
    interaction: () => ({ kind: 'place', digits: 6 }),
    answer: (v) => num(v, 'a') * 100000 + num(v, 'b') * 10000 + num(v, 'c') * 1000 + num(v, 'd') * 100 + num(v, 'e') * 10 + num(v, 'f'),
    explanation: ({ answer }) => `რიცხვია ${answer}.`,
  }),
  u01('u01-04', 'place4', 1, {
    prompt: 'ააგე რიცხვი: {a} ათასეული, {b} ასეული, {c} ათეული და {d} ერთეული.',
    variables: { a: int(1, 9), b: int(0, 9), c: int(0, 9), d: int(0, 9) },
    interaction: () => ({ kind: 'place', digits: 4 }),
    answer: (v) => num(v, 'a') * 1000 + num(v, 'b') * 100 + num(v, 'c') * 10 + num(v, 'd'),
    explanation: ({ answer }) => `რიცხვია ${answer}.`,
  }),
  u01('u01-05', 'cards5', 2, {
    prompt: 'ბარათებით {a}, {b}, {c}, {d} და {e} ჩაწერე {which} ხუთნიშნა რიცხვი (თითოეული ბარათი ერთხელ).',
    variables: { a: int(1, 9), b: int(1, 9), c: int(1, 9), d: int(1, 9), e: int(1, 9), which: pick('უდიდესი', 'უმცირესი') },
    constraints: [distinct(...five)],
    interaction: (v) => ({ kind: 'tiles', cards: five.map((k) => String(num(v, k))), slots: 5 }),
    answer: (v) => five.map((k) => num(v, k)).sort((x, y) => (str(v, 'which') === 'უდიდესი' ? y - x : x - y)).join(''),
    explanation: ({ vars }) => `${vars.which} რიცხვისთვის ციფრები ${vars.which === 'უდიდესი' ? 'კლებადობით' : 'ზრდადობით'} დაალაგე.`,
  }),
  u01('u01-06', 'roman', 2, {
    prompt: 'ააწყვე რომაული ციფრებით რიცხვი {n}.',
    variables: { n: int(12, 99), r: int(0, 5) },
    interaction: (v) => {
      const key = romanFull(num(v, 'n'));
      return { kind: 'tiles', cards: rotate([...key.split(''), 'D'], num(v, 'r')), slots: key.length };
    },
    answer: (v) => romanFull(num(v, 'n')),
    text: true,
    options: (v) => [romanFull(num(v, 'n')), romanFull(num(v, 'n') + 1), romanFull(num(v, 'n') - 1), romanFull(num(v, 'n') + 10)],
    explanation: ({ answer, vars }) => `${vars.n} = ${answer}.`,
  }),
  u01('u01-07', 'thermometer', 2, {
    prompt: 'ტემპერატურა იყო {an}°C, შემდეგ {d} გრადუსით {dir}. შეეხე ახალ ტემპერატურას თერმომეტრზე.',
    variables: { a: int(-12, 12), an: derived((v) => neg(num(v, 'a'))), d: int(2, 10), dir: pick('დაეცა', 'გაიზარდა') },
    constraints: [{ test: (v) => Math.abs(num(v, 'a') + (str(v, 'dir') === 'დაეცა' ? -1 : 1) * num(v, 'd')) <= 15, note: 'ღერძის ფარგლებში' }],
    interaction: (v) => ({ kind: 'line', min: -15, max: 15, step: 1, labelEvery: 5, style: 'thermo', start: num(v, 'a'), unit: '°C' }),
    answer: (v) => num(v, 'a') + (str(v, 'dir') === 'დაეცა' ? -1 : 1) * num(v, 'd'),
    explanation: ({ answer }) => `ახალი ტემპერატურაა ${neg(Number(answer))}°C.`,
  }),
  u01('u01-08', 'round-line', 2, {
    prompt: 'დაამრგვალე {n} უახლოეს {name}: შეეხე უახლოეს {to} ღერძზე.',
    variables: {
      n: int(100001, 989999),
      unit: pick(10, 100, 1000, 10000),
      name: derived((v) => ({ 10: 'ათეულამდე', 100: 'ასეულამდე', 1000: 'ათასეულამდე', 10000: 'ათი ათასეულამდე' }[num(v, 'unit') as 10 | 100 | 1000 | 10000])!),
      to: derived((v) => ({ 10: 'ათეულს', 100: 'ასეულს', 1000: 'ათასეულს', 10000: 'ათი ათასეულს' }[num(v, 'unit') as 10 | 100 | 1000 | 10000])!),
    },
    constraints: [{ test: (v) => num(v, 'n') % num(v, 'unit') !== num(v, 'unit') / 2 && num(v, 'n') % num(v, 'unit') !== 0, note: 'არა შუა და არა წრგვალი' }],
    interaction: (v) => ({ kind: 'line', min: lo(num(v, 'n'), num(v, 'unit')) - num(v, 'unit'), max: lo(num(v, 'n'), num(v, 'unit')) + 2 * num(v, 'unit'), step: num(v, 'unit'), labelEvery: 1 }),
    answer: (v) => roundTo(num(v, 'n'), num(v, 'unit')),
    explanation: ({ answer, vars }) => `${vars.n} უფრო ახლოსაა ${answer}-თან.`,
  }),
  u01('u01-09', 'even-odd', 1, {
    prompt: 'ჩადე რიცხვები სწორ ყუთში: ლუწი თუ კენტი.',
    variables: { a: int(10000, 999999), b: int(10000, 999999), c: int(10000, 999999), d: int(10000, 999999), e: int(10000, 999999) },
    constraints: [distinct(...five), { test: (v) => five.some((k) => num(v, k) % 2 === 0) && five.some((k) => num(v, k) % 2 === 1), note: 'ორივე სახეობა' }],
    interaction: (v) => ({ kind: 'bins', bins: ['ლუწი', 'კენტი'], items: five.map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) => five.map((k) => (num(v, k) % 2 === 0 ? 0 : 1)).join(','),
    explanation: () => 'ლუწობას ბოლო ციფრი განსაზღვრავს.',
  }),
  u01('u01-09', 'power-of-ten', 2, {
    prompt: 'რომელია 10-ის ხარისხი? შეეხე მას.',
    variables: { k: int(1, 6), r: int(0, 3) },
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: powerItems({ k: num(v, 'k'), r: num(v, 'r') }).map((n) => ({ label: String(n) })) }),
    answer: (v) => powerItems({ k: num(v, 'k'), r: num(v, 'r') }).indexOf(10 ** num(v, 'k')) + 1,
    explanation: ({ vars }) => `10-ის ხარისხია 1 და ${vars.k} ნული: ${10 ** Number(vars.k)}.`,
  }),
];

/* ------------------------------------------------------------ U02 */
const u02 = T('g5-divisibility', 'u02');
const PRIME_FOR_FACTORS = [2, 3, 5, 7];
const divItems = (v: Record<string, unknown>, d: number): number[] => {
  const rem = (r: unknown) => 1 + (Number(r) % (d - 1));
  return rotate(
    [d * Number(v.k1), d * Number(v.k2), d * Number(v.k3), d * Number(v.n1) + rem(v.r1), d * Number(v.n2) + rem(v.r2), d * Number(v.n3) + rem(v.r3)],
    Number(v.rot),
  );
};
const divVars = { k1: int(12, 300), k2: int(12, 300), k3: int(12, 300), n1: int(12, 300), n2: int(12, 300), n3: int(12, 300), r1: int(1, 9), r2: int(1, 9), r3: int(1, 9), rot: int(0, 5) };
const divTemplate = (sub: string, key: string, choices: number[]) =>
  u02(sub, key, 1, {
    prompt: 'რომელი რიცხვი იყოფა {d}-ზე უნაშთოდ? ჩადე რიცხვები სწორ ყუთში.',
    variables: { d: choices.length > 1 ? pick(...choices) : derived(() => choices[0]!), ...divVars },
    constraints: [{ test: (v) => new Set(divItems(v, num(v, 'd'))).size === 6, note: 'განსხვავებული' }],
    interaction: (v) => ({ kind: 'bins', bins: ['იყოფა', 'არ იყოფა'], items: divItems(v, num(v, 'd')).map((n) => ({ label: String(n) })) }),
    answer: (v) => divItems(v, num(v, 'd')).map((n) => (n % num(v, 'd') === 0 ? 0 : 1)).join(','),
    explanation: ({ vars }) => `რიცხვი ${vars.d}-ზე იყოფა მხოლოდ მაშინ, როცა გაყოფადობის ნიშანი სრულდება.`,
  });
const U02: QuestionTemplate[] = [
  u02('u02-01', 'prime-sort', 2, {
    prompt: 'ჩადე რიცხვები სწორ ყუთში: მარტივი თუ შედგენილი.',
    variables: { a: int(2, 70), b: int(2, 70), c: int(2, 70), d: int(2, 70), e: int(2, 70) },
    constraints: [
      distinct(...five),
      { test: (v) => five.some((k) => divisorsOf(num(v, k)).length === 2) && five.some((k) => divisorsOf(num(v, k)).length > 2), note: 'ორივე სახეობა' },
    ],
    interaction: (v) => ({ kind: 'bins', bins: ['მარტივი', 'შედგენილი'], items: five.map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) => five.map((k) => (divisorsOf(num(v, k)).length === 2 ? 0 : 1)).join(','),
    explanation: () => 'მარტივს ორი გამყოფი აქვს: 1 და თავისი თავი.',
  }),
  u02('u02-02', 'divisors', 2, {
    prompt: 'შეეხე {n}-ის ყველა გამყოფს 1-დან 12-მდე.',
    variables: { n: pick(12, 18, 20, 24, 30, 36, 40, 48, 60, 72, 84, 90) },
    interaction: () => ({ kind: 'pick', mode: 'many', items: Array.from({ length: 12 }, (_, i) => ({ label: String(i + 1) })) }),
    answer: (v) => Array.from({ length: 12 }, (_, i) => i + 1).filter((d) => num(v, 'n') % d === 0).join(','),
    explanation: ({ vars }) => `${vars.n}-ის გამყოფებია: ${divisorsOf(Number(vars.n)).filter((d) => d <= 12).join(', ')}.`,
  }),
  u02('u02-02', 'multiples', 1, {
    prompt: 'შეეხე ყველა რიცხვს, რომელიც {d}-ის ჯერადია.',
    variables: { d: int(3, 9), s: int(1, 40) },
    interaction: (v) => ({ kind: 'pick', mode: 'many', items: Array.from({ length: 12 }, (_, i) => ({ label: String(num(v, 's') + i) })) }),
    answer: (v) => Array.from({ length: 12 }, (_, i) => i + 1).filter((p) => (num(v, 's') + p - 1) % num(v, 'd') === 0).join(','),
    explanation: ({ vars }) => `${vars.d}-ის ჯერადები ყოველ მე-${vars.d} რიცხვზე მეორდება.`,
  }),
  u02('u02-03', 'prime-factors', 2, {
    prompt: 'დაშალე {n} სამ მარტივ მამრავლად (ზრდადობით).',
    variables: { a: pick(...PRIME_FOR_FACTORS), b: pick(...PRIME_FOR_FACTORS), c: pick(...PRIME_FOR_FACTORS), n: derived((v) => num(v, 'a') * num(v, 'b') * num(v, 'c')), r: int(0, 3) },
    interaction: (v) => ({ kind: 'tiles', cards: rotate([num(v, 'a'), num(v, 'b'), num(v, 'c'), num(v, 'a') + num(v, 'b') + num(v, 'c')].map(String), num(v, 'r')), slots: 3, joiner: '×' }),
    answer: (v) => [num(v, 'a'), num(v, 'b'), num(v, 'c')].sort((x, y) => x - y).join('×'),
    text: true,
    options: (v) => {
      const f = [num(v, 'a'), num(v, 'b'), num(v, 'c')].sort((x, y) => x - y);
      return [f.join('×'), `${f[0]}×${f[1]! + 1}×${f[2]}`, `${f[0]! + 1}×${f[1]}×${f[2]}`, `${f[0]}×${f[1]}×${f[2]! + 2}`];
    },
    explanation: ({ answer, vars }) => `${vars.n} = ${answer}.`,
  }),
  u02('u02-04', 'gcd-chart', 3, {
    prompt: 'იპოვე {x}-ისა და {y}-ის უდიდესი საერთო გამყოფი და შეეხე მას ცხრილში.',
    variables: { g: int(2, 9), p: int(2, 7), q: int(2, 7), x: derived((v) => num(v, 'g') * num(v, 'p')), y: derived((v) => num(v, 'g') * num(v, 'q')) },
    constraints: [{ test: (v) => num(v, 'p') !== num(v, 'q') && gcd(num(v, 'p'), num(v, 'q')) === 1, note: 'ურთიერთმარტივი' }],
    interaction: () => ({ kind: 'chart', from: 1, to: 40, cols: 10 }),
    answer: (v) => num(v, 'g'),
    explanation: ({ vars }) => `უდიდესი საერთო გამყოფია ${vars.g}.`,
  }),
  u02('u02-05', 'lcm-chart', 3, {
    prompt: 'იპოვე {a}-ისა და {b}-ის უმცირესი საერთო ჯერადი და შეეხე მას ცხრილში.',
    variables: { a: int(2, 9), b: int(2, 9) },
    constraints: [{ test: (v) => num(v, 'a') !== num(v, 'b') && lcm(num(v, 'a'), num(v, 'b')) <= 60, note: 'ცხრილის ფარგლებში' }],
    interaction: () => ({ kind: 'chart', from: 1, to: 60, cols: 10 }),
    answer: (v) => lcm(num(v, 'a'), num(v, 'b')),
    explanation: ({ answer }) => `უმცირესი საერთო ჯერადია ${answer}.`,
  }),
  divTemplate('u02-06', 'by-2-4', [2, 4]),
  divTemplate('u02-07', 'by-3-9', [3, 9]),
  divTemplate('u02-08', 'by-5-10', [5, 10]),
  divTemplate('u02-09', 'by-6', [6]),
];

/* ------------------------------------------------------------ U03 */
const u03 = T('g5-add-sub-whole', 'u03');
const U03: QuestionTemplate[] = [
  u03('u03-01', 'missing', 1, {
    prompt: 'შეავსე გამოტოვებული რიცხვი: {a} + {b} = {b} + ?',
    variables: { a: int(1000, 99999), b: int(1000, 99999) },
    interaction: () => ({ kind: 'place', digits: 5 }),
    answer: (v) => num(v, 'a'),
    explanation: ({ vars }) => `შესაკრებების გადანაცვლებით: ${vars.b} + ${vars.a}.`,
  }),
  u03('u03-03', 'estimate', 2, {
    prompt: 'დაამრგვალე შესაკრებები ათასეულებამდე და შეაფასე ჯამი: {a} + {b}. შეეხე შეფასებას ღერძზე.',
    variables: { a: int(11000, 89999), b: int(11000, 89999) },
    constraints: [{ test: (v) => num(v, 'a') % 1000 !== 500 && num(v, 'b') % 1000 !== 500, note: 'არა შუა' }],
    interaction: (v) => ({ kind: 'line', min: roundTo(num(v, 'a'), 1000) + roundTo(num(v, 'b'), 1000) - 3000, max: roundTo(num(v, 'a'), 1000) + roundTo(num(v, 'b'), 1000) + 3000, step: 1000, labelEvery: 1 }),
    answer: (v) => roundTo(num(v, 'a'), 1000) + roundTo(num(v, 'b'), 1000),
    explanation: ({ answer }) => `დამრგვალებული ჯამია ${answer}.`,
  }),
  u03('u03-05', 'sign', 1, {
    prompt: 'შეადარე გამოსახულება რიცხვს და აირჩიე ნიშანი.',
    variables: { a: int(100, 9999), b: int(100, 9999), d: pick(-300, -50, -10, 10, 50, 300) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') + num(v, 'd') > 0, note: 'დადებითი' }],
    interaction: (v) => ({ kind: 'slots', tokens: [`${num(v, 'a')} + ${num(v, 'b')}`, '?', String(num(v, 'a') + num(v, 'b') + num(v, 'd'))], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a') + num(v, 'b'), num(v, 'a') + num(v, 'b') + num(v, 'd')),
    explanation: ({ vars }) => `${Number(vars.a) + Number(vars.b)} და ${Number(vars.a) + Number(vars.b) + Number(vars.d)} შეადარე.`,
  }),
  u03('u03-06', 'pyramid', 2, {
    prompt: 'რიცხვით პირამიდაში ზედა უჯრაში ქვედა ორი უჯრის ჯამი იწერება. ქვედა რიცხვებია {a}, {b} და {c}. ააგე ყველაზე ზედა რიცხვი.',
    variables: { a: int(10, 400), b: int(10, 400), c: int(10, 400) },
    pictures: (v) => [modelPic('?', num(v, 'a') + num(v, 'b'), num(v, 'b') + num(v, 'c')), modelPic(num(v, 'a') + num(v, 'b'), num(v, 'a'), num(v, 'b')), modelPic(num(v, 'b') + num(v, 'c'), num(v, 'b'), num(v, 'c'))],
    interaction: () => ({ kind: 'place', digits: 4 }),
    answer: (v) => num(v, 'a') + 2 * num(v, 'b') + num(v, 'c'),
    explanation: ({ answer }) => `ზედა რიცხვია ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U04 */
const u04 = T('g5-multiplication', 'u04');
const U04: QuestionTemplate[] = [
  u04('u04-04', 'missing-digit', 2, {
    prompt: 'იპოვე გამოტოვებული ციფრი: {p}□ × {b} = {prod}',
    variables: { p: int(10, 99), d: int(0, 9), b: int(2, 9), prod: derived((v) => (num(v, 'p') * 10 + num(v, 'd')) * num(v, 'b')) },
    interaction: (v) => ({ kind: 'tiles', cards: digitCards, frame: [String(num(v, 'p')), '?', `× ${num(v, 'b')} = ${num(v, 'prod')}`] }),
    answer: (v) => num(v, 'd'),
    text: true,
    options: (v) => [0, 1, 2, 3].map((k) => String((num(v, 'd') + k * 3) % 10)),
    explanation: ({ vars }) => `${vars.prod} ÷ ${vars.b} = ${Number(vars.p) * 10 + Number(vars.d)}.`,
  }),
  u04('u04-06', 'estimate', 2, {
    prompt: 'დაამრგვალე თითოეული მამრავლი უახლოეს ათეულამდე და შეაფასე ნამრავლი: {a} × {b}. შეეხე შეფასებას.',
    variables: { a: int(21, 99), b: int(21, 99) },
    constraints: [{ test: (v) => num(v, 'a') % 10 !== 5 && num(v, 'b') % 10 !== 5 && num(v, 'a') % 10 !== 0 && num(v, 'b') % 10 !== 0, note: 'არა შუა' }],
    interaction: (v) => ({ kind: 'line', min: roundTo(num(v, 'a'), 10) * roundTo(num(v, 'b'), 10) - 300, max: roundTo(num(v, 'a'), 10) * roundTo(num(v, 'b'), 10) + 300, step: 100, labelEvery: 1 }),
    answer: (v) => roundTo(num(v, 'a'), 10) * roundTo(num(v, 'b'), 10),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u04('u04-05', 'zeros', 1, {
    prompt: 'გამოთვალე და ააგე პასუხი: {a}00 × {b}00',
    variables: { a: int(2, 9), b: int(2, 9) },
    interaction: () => ({ kind: 'place', digits: 6 }),
    answer: (v) => num(v, 'a') * num(v, 'b') * 10000,
    explanation: ({ vars }) => `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}, შემდეგ 4 ნული.`,
  }),
  u04('u04-09', 'sign', 2, {
    prompt: 'შეადარე ნამრავლი რიცხვს და აირჩიე ნიშანი.',
    variables: { a: int(11, 99), b: int(3, 9), d: pick(-20, -5, 5, 20) },
    interaction: (v) => ({ kind: 'slots', tokens: [`${num(v, 'a')} × ${num(v, 'b')}`, '?', String(num(v, 'a') * num(v, 'b') + num(v, 'd'))], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a') * num(v, 'b'), num(v, 'a') * num(v, 'b') + num(v, 'd')),
    explanation: ({ vars }) => `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}.`,
  }),
];

/* ------------------------------------------------------------ U05 */
const u05 = T('g5-division', 'u05');
const U05: QuestionTemplate[] = [
  u05('u05-05', 'estimate', 2, {
    prompt: 'დაამრგვალე გასაყოფი ასეულებამდე და შეაფასე განაყოფი: {n} ÷ {k}. შეეხე შეფასებას.',
    variables: { n: int(321, 989), k: pick(2, 4, 5), st: derived((v) => ({ 2: 50, 4: 25, 5: 20 }[num(v, 'k') as 2 | 4 | 5])!) },
    constraints: [{ test: (v) => num(v, 'n') % 100 !== 50 && num(v, 'n') % 100 !== 0, note: 'არა შუა' }],
    interaction: (v) => ({ kind: 'line', min: Math.max(0, roundTo(num(v, 'n'), 100) / num(v, 'k') - 3 * num(v, 'st')), max: roundTo(num(v, 'n'), 100) / num(v, 'k') + 3 * num(v, 'st'), step: num(v, 'st'), labelEvery: 1 }),
    answer: (v) => roundTo(num(v, 'n'), 100) / num(v, 'k'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u05('u05-07', 'digit', 2, {
    prompt: 'რომელია უმცირესი ციფრი □-ის ადგილას, რომ {p}□ უნაშთოდ იყოფოდეს {k}-ზე?',
    variables: { p: int(10, 99), k: pick(2, 3, 4, 5, 6, 9) },
    interaction: (v) => ({ kind: 'tiles', cards: digitCards, frame: [String(num(v, 'p')), '?'] }),
    answer: (v) => digitCards.map(Number).find((d) => (num(v, 'p') * 10 + d) % num(v, 'k') === 0)!,
    text: true,
    options: (v) => {
      const key = digitCards.map(Number).find((d) => (num(v, 'p') * 10 + d) % num(v, 'k') === 0)!;
      return [key, (key + 1) % 10, (key + 4) % 10, (key + 7) % 10].map(String);
    },
    explanation: ({ answer, vars }) => `${vars.p}${answer} იყოფა ${vars.k}-ზე.`,
  }),
  u05('u05-04', 'remainder', 2, {
    prompt: 'გაყავი {n} რიცხვი {k}-ზე: ჩასვი განაყოფი და ნაშთი.',
    variables: { k: int(3, 9), q: int(10, 99), r: int(1, 8), n: derived((v) => num(v, 'k') * num(v, 'q') + (num(v, 'r') % num(v, 'k') || 1)), rem: derived((v) => num(v, 'r') % num(v, 'k') || 1), rot: int(0, 3) },
    interaction: (v) => ({ kind: 'tiles', cards: rotate([num(v, 'q'), num(v, 'rem'), num(v, 'q') + 1, num(v, 'rem') + 1].map(String), num(v, 'rot')), frame: ['განაყოფი', '?', 'ნაშთი', '?'], joiner: ',' }),
    answer: (v) => `${num(v, 'q')},${num(v, 'rem')}`,
    text: true,
    options: (v) => [`${num(v, 'q')},${num(v, 'rem')}`, `${num(v, 'rem')},${num(v, 'q')}`, `${num(v, 'q') + 1},${num(v, 'rem')}`, `${num(v, 'q')},${num(v, 'rem') + 1}`],
    explanation: ({ vars }) => `${vars.n} = ${vars.k} × ${vars.q} + ${vars.rem}.`,
  }),
];

/* ------------------------------------------------------------ U06 */
const u06 = T('g5-multi-step-speed', 'u06');
const U06: QuestionTemplate[] = [
  u06('u06-03', 'distance-line', 1, {
    prompt: 'მანქანა ყოველ საათში {v} კმ-ს გადის. რამდენ კილომეტრს გაივლის {t} საათში? შეეხე ღერძზე.',
    variables: { v: pick(20, 30, 40, 50, 60, 80, 90, 100), t: int(2, 8) },
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'v') * 8, step: num(v, 'v'), labelEvery: 3, unit: 'კმ' }),
    answer: (v) => num(v, 'v') * num(v, 't'),
    explanation: ({ vars }) => `${vars.v} × ${vars.t} = ${Number(vars.v) * Number(vars.t)}.`,
  }),
  u06('u06-05', 'time-fill', 2, {
    prompt: 'ავტობუსმა {d} კმ გაიარა საათში {v} კმ სიჩქარით. შეღებე იმდენი საათი, რამდენი იმოგზაურა.',
    variables: { v: pick(15, 20, 25, 30, 40, 50, 60), t: int(2, 8), d: derived((v) => num(v, 'v') * num(v, 't')) },
    interaction: () => ({ kind: 'fill', shape: 'row', total: 8, noun: 'საათი' }),
    answer: (v) => num(v, 't'),
    explanation: ({ vars }) => `${vars.d} ÷ ${vars.v} = ${vars.t}.`,
  }),
  u06('u06-06', 'speed-line', 2, {
    prompt: 'ავტობუსმა {t} საათში {d} კმ გაიარა. რა იყო მისი სიჩქარე (კმ/სთ)? შეეხე ღერძზე.',
    variables: { v: int(2, 12), t: int(2, 9), d: derived((v) => num(v, 'v') * 10 * num(v, 't')) },
    interaction: () => ({ kind: 'line', min: 0, max: 120, step: 10, labelEvery: 2, unit: 'კმ/სთ' }),
    answer: (v) => num(v, 'v') * 10,
    explanation: ({ vars }) => `${vars.d} ÷ ${vars.t} = ${Number(vars.v) * 10}.`,
  }),
];

/* ------------------------------------------------------------ U07 */
const u07 = T('g5-fractions-mixed', 'u07');
const fr = (n: number, d: number): string => `${n}/${d}`;
const U07: QuestionTemplate[] = [
  u07('u07-01', 'shade', 1, {
    prompt: 'ფიგურა {n} თანაბარ ნაწილადაა დაყოფილი. შეღებე მისი {k}/{n}.',
    variables: { n: int(4, 12), k: int(1, 11), shape: pick('circle', 'bar') },
    constraints: [{ test: (v) => num(v, 'k') < num(v, 'n'), note: 'k<n' }],
    interaction: (v) => ({ kind: 'fill', shape: str(v, 'shape') as 'bar' | 'circle', total: num(v, 'n') }),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${vars.k}/${vars.n} ნიშნავს ${vars.k} ნაწილს ${vars.n}-დან.`,
  }),
  u07('u07-02', 'same-den-sign', 1, {
    prompt: 'შეადარე წილადები და აირჩიე ნიშანი.',
    variables: { d: int(3, 20), a: int(1, 19), b: int(1, 19) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'd') && num(v, 'b') < num(v, 'd'), note: 'სწორი წილადები' }],
    interaction: (v) => ({ kind: 'slots', tokens: [fr(num(v, 'a'), num(v, 'd')), '?', fr(num(v, 'b'), num(v, 'd'))], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a'), num(v, 'b')),
    explanation: () => 'ერთნაირი მნიშვნელისას უფრო დიდია დიდი მრიცხველის მქონე წილადი.',
  }),
  u07('u07-03', 'diff-den-sign', 2, {
    prompt: 'შეადარე წილადები და აირჩიე ნიშანი.',
    variables: { a: int(1, 8), b: int(2, 9), c: int(1, 8), d: int(2, 9) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'b') && num(v, 'c') < num(v, 'd') && num(v, 'b') !== num(v, 'd') && cmpFrac(num(v, 'a'), num(v, 'b'), num(v, 'c'), num(v, 'd')) !== 0, note: 'განსხვავებული' }],
    interaction: (v) => ({ kind: 'slots', tokens: [fr(num(v, 'a'), num(v, 'b')), '?', fr(num(v, 'c'), num(v, 'd'))], options: SIGNS }),
    answer: (v) => ['<', '=', '>'][cmpFrac(num(v, 'a'), num(v, 'b'), num(v, 'c'), num(v, 'd')) + 1]!,
    explanation: ({ vars }) => `ჯვარედინად: ${Number(vars.a) * Number(vars.d)} და ${Number(vars.c) * Number(vars.b)}.`,
  }),
  u07('u07-04', 'reduce', 2, {
    prompt: 'შეკვეცე წილადი {n}/{m} უმარტივეს სახემდე: ჩასვი ბარათები.',
    variables: { p: int(1, 7), q: int(2, 9), f: int(2, 5), n: derived((v) => num(v, 'p') * num(v, 'f')), m: derived((v) => num(v, 'q') * num(v, 'f')), rot: int(0, 3) },
    constraints: [{ test: (v) => num(v, 'p') < num(v, 'q') && gcd(num(v, 'p'), num(v, 'q')) === 1, note: 'უმარტივესი' }],
    interaction: (v) => ({ kind: 'tiles', cards: rotate([num(v, 'p'), num(v, 'q'), num(v, 'n'), num(v, 'm')].map(String), num(v, 'rot')), frame: ['?', '/', '?'], joiner: '/' }),
    answer: (v) => fr(num(v, 'p'), num(v, 'q')),
    text: true,
    options: (v) => [fr(num(v, 'p'), num(v, 'q')), fr(num(v, 'q'), num(v, 'p')), fr(num(v, 'p') + 1, num(v, 'q')), fr(num(v, 'p'), num(v, 'q') + 1)],
    explanation: ({ vars }) => `${vars.n} და ${vars.m} ორივე იყოფა ${vars.f}-ზე.`,
  }),
  u07('u07-06', 'equal-line', 2, {
    prompt: '{a}/{d} = ?/{m}. შეეხე სწორ ნიშნულს ღერძზე.',
    variables: { d: int(2, 5), a: int(1, 4), f: int(2, 3), m: derived((v) => num(v, 'd') * num(v, 'f')) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'd'), note: 'a<d' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'm'), step: 1, format: 'frac', den: num(v, 'm'), labelEvery: 1 }),
    answer: (v) => num(v, 'a') * num(v, 'f'),
    explanation: ({ vars }) => `${vars.a}/${vars.d} = ${Number(vars.a) * Number(vars.f)}/${vars.m}.`,
  }),
  u07('u07-07', 'proper-bins', 1, {
    prompt: 'ჩადე წილადები სწორ ყუთში: სწორი თუ არასწორი.',
    variables: { a: int(1, 15), b: int(1, 15), c: int(1, 15), d: int(1, 15), e: int(1, 15), q: int(2, 12), r: int(0, 4) },
    constraints: [
      { test: (v) => five.every((k) => num(v, k) !== num(v, 'q')), note: 'არა ერთეული' },
      { test: (v) => five.some((k) => num(v, k) < num(v, 'q')) && five.some((k) => num(v, k) > num(v, 'q')), note: 'ორივე სახეობა' },
      { test: (v) => new Set(five.map((k) => num(v, k))).size === 5, note: 'განსხვავებული' },
    ],
    interaction: (v) => ({ kind: 'bins', bins: ['სწორი', 'არასწორი'], items: five.map((k) => ({ label: fr(num(v, k), num(v, 'q')) })) }),
    answer: (v) => five.map((k) => (num(v, k) < num(v, 'q') ? 0 : 1)).join(','),
    explanation: () => 'სწორია წილადი, რომლის მრიცხველი მნიშვნელზე ნაკლებია.',
  }),
  u07('u07-08', 'to-mixed', 3, {
    prompt: 'არასწორი წილადი {n}/{d} ჩაწერე შერეული რიცხვის სახით: მთელი, მრიცხველი, მნიშვნელი.',
    variables: { d: int(3, 9), w: int(1, 5), r: int(1, 8), rem: derived((v) => 1 + ((num(v, 'r') - 1) % (num(v, 'd') - 1))), n: derived((v) => num(v, 'w') * num(v, 'd') + 1 + ((num(v, 'r') - 1) % (num(v, 'd') - 1))), rot: int(0, 3) },
    interaction: (v) => ({ kind: 'tiles', cards: rotate([num(v, 'w'), num(v, 'rem'), num(v, 'd'), num(v, 'w') + 1, num(v, 'rem') + 1].map(String), num(v, 'rot')), frame: ['?', 'და', '?', '/', '?'], joiner: ',' }),
    answer: (v) => `${num(v, 'w')},${num(v, 'rem')},${num(v, 'd')}`,
    text: true,
    options: (v) => [`${num(v, 'w')},${num(v, 'rem')},${num(v, 'd')}`, `${num(v, 'w') + 1},${num(v, 'rem')},${num(v, 'd')}`, `${num(v, 'w')},${num(v, 'rem') + 1},${num(v, 'd')}`, `${num(v, 'rem')},${num(v, 'w')},${num(v, 'd')}`],
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.d} = ${vars.w} (ნაშთი ${vars.rem}).`,
  }),
  u07('u07-09', 'to-improper', 3, {
    prompt: 'შერეული რიცხვი {w} {rr}/{d} ჩაწერე არასწორი წილადის სახით.',
    variables: { d: int(3, 9), w: int(1, 6), r: int(1, 8), rr: derived((v) => 1 + ((num(v, 'r') - 1) % (num(v, 'd') - 1))), rot: int(0, 3) },
    interaction: (v) => ({ kind: 'tiles', cards: rotate([num(v, 'w') * num(v, 'd') + num(v, 'rr'), num(v, 'd'), num(v, 'w') * num(v, 'd'), num(v, 'rr')].map(String), num(v, 'rot')), frame: ['?', '/', '?'], joiner: '/' }),
    answer: (v) => fr(num(v, 'w') * num(v, 'd') + num(v, 'rr'), num(v, 'd')),
    text: true,
    options: (v) => [fr(num(v, 'w') * num(v, 'd') + num(v, 'rr'), num(v, 'd')), fr(num(v, 'w') + num(v, 'rr'), num(v, 'd')), fr(num(v, 'w') * num(v, 'd'), num(v, 'd')), fr(num(v, 'w') * num(v, 'rr') + num(v, 'd'), num(v, 'd'))],
    explanation: ({ vars }) => `${vars.w} × ${vars.d} + ${vars.rr} = ${Number(vars.w) * Number(vars.d) + Number(vars.rr)}.`,
  }),
  u07('u07-10', 'order', 2, {
    prompt: 'დაალაგე წილადები ზრდადობით.',
    variables: { a: int(1, 9), b: int(2, 10), c: int(1, 9), d: int(2, 10), e: int(1, 9), f: int(2, 10) },
    constraints: [
      { test: (v) => num(v, 'a') < num(v, 'b') && num(v, 'c') < num(v, 'd') && num(v, 'e') < num(v, 'f'), note: 'სწორი წილადები' },
      {
        test: (v) => {
          const x = [num(v, 'a') / num(v, 'b'), num(v, 'c') / num(v, 'd'), num(v, 'e') / num(v, 'f')];
          return new Set(x.map((y) => y.toFixed(6))).size === 3;
        },
        note: 'განსხვავებული მნიშვნელობები',
      },
    ],
    interaction: (v) => ({ kind: 'tiles', cards: [fr(num(v, 'a'), num(v, 'b')), fr(num(v, 'c'), num(v, 'd')), fr(num(v, 'e'), num(v, 'f'))], slots: 3, joiner: ' < ' }),
    answer: (v) =>
      [
        [num(v, 'a'), num(v, 'b')],
        [num(v, 'c'), num(v, 'd')],
        [num(v, 'e'), num(v, 'f')],
      ]
        .sort((x, y) => x[0]! * y[1]! - y[0]! * x[1]!)
        .map(([n, d]) => fr(n!, d!))
        .join(' < '),
    text: true,
    options: (v) => {
      const sorted = [
        [num(v, 'a'), num(v, 'b')],
        [num(v, 'c'), num(v, 'd')],
        [num(v, 'e'), num(v, 'f')],
      ]
        .sort((x, y) => x[0]! * y[1]! - y[0]! * x[1]!)
        .map(([n, d]) => fr(n!, d!));
      return [sorted.join(' < '), [...sorted].reverse().join(' < '), [sorted[1], sorted[0], sorted[2]].join(' < '), [sorted[0], sorted[2], sorted[1]].join(' < ')];
    },
    explanation: ({ answer }) => String(answer),
  }),
  u07('u07-11', 'reciprocal', 1, {
    prompt: 'იპოვე {n}/{d}-ის შებრუნებული წილადი: ჩასვი ბარათები.',
    variables: { n: int(1, 9), d: int(2, 10), rot: int(0, 3) },
    constraints: [{ test: (v) => num(v, 'n') !== num(v, 'd'), note: 'არა ერთეული' }],
    interaction: (v) => ({ kind: 'tiles', cards: rotate([num(v, 'n'), num(v, 'd'), num(v, 'n') + 1, num(v, 'd') + 1].map(String), num(v, 'rot')), frame: ['?', '/', '?'], joiner: '/' }),
    answer: (v) => fr(num(v, 'd'), num(v, 'n')),
    text: true,
    options: (v) => [fr(num(v, 'd'), num(v, 'n')), fr(num(v, 'n'), num(v, 'd')), fr(num(v, 'd') + 1, num(v, 'n')), fr(num(v, 'd'), num(v, 'n') + 1)],
    explanation: ({ vars }) => `მრიცხველი და მნიშვნელი ადგილს იცვლის: ${vars.d}/${vars.n}.`,
  }),
  u07('u07-12', 'frac-line', 1, {
    prompt: 'მონიშნე რიცხვითი ღერძზე წილადი {k}/{d}.',
    variables: { d: int(3, 12), k: int(1, 11) },
    constraints: [{ test: (v) => num(v, 'k') < num(v, 'd'), note: 'k<d' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'd'), step: 1, format: 'frac', den: num(v, 'd'), labelEvery: 1 }),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `ერთეული ${vars.d} თანაბარ ნაწილადაა დაყოფილი, ვითვლით ${vars.k} ნაწილს.`,
  }),
  u07('u07-05', 'common-den', 3, {
    prompt: 'იპოვე {a}/{b} და {c}/{d} წილადების უმცირესი საერთო მნიშვნელი. შეეხე მას.',
    variables: { a: int(1, 5), b: int(2, 9), c: int(1, 5), d: int(2, 9), r: int(0, 3) },
    constraints: [
      { test: (v) => num(v, 'a') < num(v, 'b') && num(v, 'c') < num(v, 'd') && num(v, 'b') !== num(v, 'd'), note: 'სწორი' },
      { test: (v) => new Set(commonDenItems(v)).size === 4, note: 'განსხვავებული' },
    ],
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: rotate(commonDenItems(v), num(v, 'r')).map((n) => ({ label: String(n) })) }),
    answer: (v) => rotate(commonDenItems(v), num(v, 'r')).indexOf(lcm(num(v, 'b'), num(v, 'd'))) + 1,
    explanation: ({ vars }) => `უმცირესი საერთო მნიშვნელია ${lcm(Number(vars.b), Number(vars.d))}.`,
  }),
];
function commonDenItems(v: Record<string, unknown>): number[] {
  const b = Number(v.b);
  const d = Number(v.d);
  const l = lcm(b, d);
  return [l, b * d, l * 2, Math.max(b, d) === l ? l + 1 : Math.max(b, d)];
}

/* ------------------------------------------------------------ U08 */
const u08 = T('g5-add-sub-fractions', 'u08');
const U08: QuestionTemplate[] = [
  u08('u08-01', 'fill-sum', 1, {
    prompt: 'შეღებე ჯამი: {a}/10 + {b}/10.',
    variables: { a: int(1, 8), b: int(1, 8) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 10, note: 'ჯამი ≤ 1' }],
    interaction: () => ({ kind: 'fill', shape: 'bar', total: 10 }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a}/10 + ${vars.b}/10 = ${Number(vars.a) + Number(vars.b)}/10.`,
  }),
  u08('u08-02', 'fill-rest', 1, {
    prompt: 'შეღებე სხვაობა: 1 − {a}/{d}.',
    variables: { d: int(4, 12), a: int(1, 11) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'd'), note: 'a<d' }],
    interaction: (v) => ({ kind: 'fill', shape: 'bar', total: num(v, 'd') }),
    answer: (v) => num(v, 'd') - num(v, 'a'),
    explanation: ({ vars }) => `1 − ${vars.a}/${vars.d} = ${Number(vars.d) - Number(vars.a)}/${vars.d}.`,
  }),
  u08('u08-04', 'line-sum', 3, {
    prompt: 'იპოვე {a}/{d} + {b}/{m} და შეეხე შედეგს ღერძზე.',
    variables: { d: int(2, 5), f: int(2, 3), m: derived((v) => num(v, 'd') * num(v, 'f')), a: int(1, 4), b: int(1, 8) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'd') && num(v, 'a') * num(v, 'f') + num(v, 'b') < num(v, 'm'), note: 'ჯამი < 1' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'm'), step: 1, format: 'frac', den: num(v, 'm'), labelEvery: 1 }),
    answer: (v) => num(v, 'a') * num(v, 'f') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a}/${vars.d} = ${Number(vars.a) * Number(vars.f)}/${vars.m}; ჯამი ${Number(vars.a) * Number(vars.f) + Number(vars.b)}/${vars.m}.`,
  }),
  u08('u08-08', 'fill-unknown', 2, {
    prompt: 'იპოვე x: x + {a}/{d} = {b}/{d}. შეღებე x.',
    variables: { d: int(4, 12), a: int(1, 10), b: int(2, 11) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'b') && num(v, 'b') < num(v, 'd'), note: 'a<b<d' }],
    interaction: (v) => ({ kind: 'fill', shape: 'bar', total: num(v, 'd') }),
    answer: (v) => num(v, 'b') - num(v, 'a'),
    explanation: ({ vars }) => `x = ${Number(vars.b) - Number(vars.a)}/${vars.d}.`,
  }),
  u08('u08-07', 'sign', 2, {
    prompt: 'შეადარე ჯამი წილადს და აირჩიე ნიშანი.',
    variables: { d: int(4, 15), a: int(1, 6), b: int(1, 6), c: int(2, 13) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') !== num(v, 'c') && num(v, 'c') < num(v, 'd') && num(v, 'a') + num(v, 'b') < num(v, 'd'), note: 'არა ტოლი' }],
    interaction: (v) => ({ kind: 'slots', tokens: [`${num(v, 'a')}/${num(v, 'd')} + ${num(v, 'b')}/${num(v, 'd')}`, '?', fr(num(v, 'c'), num(v, 'd'))], options: ['<', '>'] }),
    answer: (v) => signOf(num(v, 'a') + num(v, 'b'), num(v, 'c')),
    explanation: ({ vars }) => `ჯამია ${Number(vars.a) + Number(vars.b)}/${vars.d}.`,
  }),
];

/* ------------------------------------------------------------ U09 */
const u09 = T('g5-multiply-fractions', 'u09');
const U09: QuestionTemplate[] = [
  u09('u09-01', 'fill-of-set', 2, {
    prompt: '{n} ნივთიდან შეღებე {a}/{d}.',
    variables: { d: int(2, 5), k: int(2, 4), a: int(1, 4), n: derived((v) => num(v, 'd') * num(v, 'k')) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'd'), note: 'a<d' }],
    interaction: (v) => ({ kind: 'fill', shape: 'row', total: num(v, 'n') }),
    answer: (v) => num(v, 'a') * num(v, 'k'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.d} × ${vars.a} = ${Number(vars.a) * Number(vars.k)}.`,
  }),
  u09('u09-02', 'fill-grid', 3, {
    prompt: 'ბადე {c} სვეტად და {r} სტრიქონადაა დაყოფილი. შეღებე {a}/{c}-ის {b}/{r} ნაწილი.',
    variables: { c: int(2, 6), r: int(2, 6), a: int(1, 5), b: int(1, 5) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'c') && num(v, 'b') < num(v, 'r'), note: 'სწორი წილადები' }],
    interaction: (v) => ({ kind: 'fill', shape: 'grid', total: num(v, 'c') * num(v, 'r'), cols: num(v, 'c') }),
    answer: (v) => num(v, 'a') * num(v, 'b'),
    explanation: ({ vars }) => `${vars.a}/${vars.c} × ${vars.b}/${vars.r} = ${Number(vars.a) * Number(vars.b)}/${Number(vars.c) * Number(vars.r)}.`,
  }),
  u09('u09-05', 'sign', 2, {
    prompt: 'შეადარე ნამრავლი პირველ მამრავლს და აირჩიე ნიშანი.',
    variables: { a: int(1, 7), b: int(2, 9), p: int(1, 9), q: int(2, 9) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'b') && num(v, 'p') !== num(v, 'q'), note: 'სწორი, არა ერთეული' }],
    interaction: (v) => ({ kind: 'slots', tokens: [`${num(v, 'a')}/${num(v, 'b')} × ${num(v, 'p')}/${num(v, 'q')}`, '?', fr(num(v, 'a'), num(v, 'b'))], options: ['<', '>'] }),
    answer: (v) => (num(v, 'p') > num(v, 'q') ? '>' : '<'),
    explanation: ({ vars }) => `მეორე მამრავლი ${Number(vars.p) > Number(vars.q) ? '1-ზე მეტია' : '1-ზე ნაკლებია'}.`,
  }),
];

/* ------------------------------------------------------------ U10 */
const u10 = T('g5-divide-fractions', 'u10');
const U10: QuestionTemplate[] = [
  u10('u10-01', 'line-div-whole', 3, {
    prompt: 'გამოთვალე {a}/{d} ÷ {k} და შეეხე შედეგს ღერძზე.',
    variables: { d: int(2, 5), k: int(2, 3), a: int(1, 4), m: derived((v) => num(v, 'd') * num(v, 'k')) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'd'), note: 'a<d' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'm'), step: 1, format: 'frac', den: num(v, 'm'), labelEvery: 1 }),
    answer: (v) => num(v, 'a'),
    explanation: ({ vars }) => `${vars.a}/${vars.d} ÷ ${vars.k} = ${vars.a}/${vars.m}.`,
  }),
  u10('u10-05', 'pieces', 2, {
    prompt: 'ლენტი {a}/{d} მეტრია. მას 1/{d} მეტრიან ნაჭრებად ჭრიან. შეღებე იმდენი ნაჭერი, რამდენიც გამოვა.',
    variables: { d: int(4, 12), a: int(1, 11) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'd'), note: 'a<d' }],
    interaction: (v) => ({ kind: 'fill', shape: 'row', total: num(v, 'd'), noun: 'ნაჭერი' }),
    answer: (v) => num(v, 'a'),
    explanation: ({ vars }) => `${vars.a}/${vars.d} ÷ 1/${vars.d} = ${vars.a}.`,
  }),
];

/* ------------------------------------------------------------ U11 */
const u11 = T('g5-decimals', 'u11');
const U11: QuestionTemplate[] = [
  u11('u11-01', 'build', 2, {
    prompt: 'ააგე ათწილადი: {w} მთელი, {t} მეათედი და {h} მეასედი.',
    variables: { w: int(0, 9), t: int(0, 9), h: int(0, 9) },
    constraints: [{ test: (v) => num(v, 'w') + num(v, 't') + num(v, 'h') > 0, note: 'არა ნული' }],
    interaction: () => ({ kind: 'place', digits: 1, decimals: 2 }),
    answer: (v) => decOf(num(v, 'w') * 100 + num(v, 't') * 10 + num(v, 'h'), 2),
    explanation: ({ answer }) => `რიცხვია ${answer}.`,
  }),
  u11('u11-03', 'from-fraction', 1, {
    prompt: 'ჩაწერე ათწილადის სახით: {n}/{den}.',
    variables: { den: pick(10, 100), n: int(1, 99) },
    constraints: [{ test: (v) => num(v, 'n') < num(v, 'den') * 1 || num(v, 'den') === 100, note: 'მთელზე ნაკლები' }, { test: (v) => num(v, 'den') === 100 || num(v, 'n') <= 9, note: 'მეათედები' }],
    interaction: () => ({ kind: 'place', digits: 1, decimals: 2 }),
    answer: (v) => decOf(num(v, 'den') === 10 ? num(v, 'n') * 10 : num(v, 'n'), 2),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u11('u11-02', 'compare', 2, {
    prompt: 'შეადარე ათწილადები და აირჩიე ნიშანი.',
    variables: { x: int(1, 99), y: int(1, 99) },
    constraints: [distinct('x', 'y')],
    interaction: (v) => ({ kind: 'slots', tokens: [decOf(num(v, 'x'), 2), '?', decOf(num(v, 'y'), 2)], options: ['<', '>'] }),
    answer: (v) => signOf(num(v, 'x'), num(v, 'y')),
    explanation: ({ vars }) => `${decOf(Number(vars.x), 2)} და ${decOf(Number(vars.y), 2)}.`,
  }),
  u11('u11-04', 'line-add', 2, {
    prompt: 'გამოთვალე {x} + {y} და შეეხე შედეგს ღერძზე.',
    variables: { a: int(1, 12), b: int(1, 12), x: derived((v) => decOf(num(v, 'a'), 1)), y: derived((v) => decOf(num(v, 'b'), 1)) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 20, note: 'ღერძის ფარგლებში' }],
    interaction: () => ({ kind: 'line', min: 0, max: 20, step: 1, format: 'dec', den: 10, labelEvery: 2 }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.x} + ${vars.y} = ${decOf(Number(vars.a) + Number(vars.b), 1)}.`,
  }),
  u11('u11-05', 'line-sub', 2, {
    prompt: 'გამოთვალე {x} − {y} და შეეხე შედეგს ღერძზე.',
    variables: { a: int(3, 20), b: int(1, 18), x: derived((v) => decOf(num(v, 'a'), 1)), y: derived((v) => decOf(num(v, 'b'), 1)) },
    constraints: [{ test: (v) => num(v, 'a') > num(v, 'b'), note: 'a>b' }],
    interaction: () => ({ kind: 'line', min: 0, max: 20, step: 1, format: 'dec', den: 10, labelEvery: 2 }),
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ vars }) => `${vars.x} − ${vars.y} = ${decOf(Number(vars.a) - Number(vars.b), 1)}.`,
  }),
];

/* ------------------------------------------------------------ U12 */
const u12 = T('g5-percents', 'u12');
const U12: QuestionTemplate[] = [
  u12('u12-04', 'shade-fraction', 2, {
    prompt: 'კვადრატი 100 თანაბარ უჯრადაა დაყოფილი. შეღებე მისი {a}/{b}.',
    variables: { b: pick(2, 4, 5, 10, 20, 25), a: int(1, 24) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'b'), note: 'a<b' }],
    interaction: () => ({ kind: 'fill', shape: 'grid', total: 100, cols: 10 }),
    answer: (v) => (100 * num(v, 'a')) / num(v, 'b'),
    explanation: ({ vars, answer }) => `${vars.a}/${vars.b} = ${answer}%.`,
  }),
  u12('u12-05', 'shade-decimal', 2, {
    prompt: 'კვადრატი 100 თანაბარ უჯრადაა დაყოფილი. შეღებე მისი {x}.',
    variables: { p: int(1, 99), x: derived((v) => decOf(num(v, 'p'), 2)) },
    interaction: () => ({ kind: 'fill', shape: 'grid', total: 100, cols: 10 }),
    answer: (v) => num(v, 'p'),
    explanation: ({ vars }) => `${vars.x} = ${vars.p}%.`,
  }),
  u12('u12-06', 'percent-line', 2, {
    prompt: '{n} ნივთიდან {k} გაიყიდა. ნივთების რამდენი პროცენტი გაიყიდა? შეეხე ღერძზე.',
    variables: { n: pick(4, 5, 10, 20), k: int(1, 19) },
    constraints: [{ test: (v) => num(v, 'k') < num(v, 'n'), note: 'k<n' }],
    interaction: () => ({ kind: 'line', min: 0, max: 100, step: 5, labelEvery: 2, unit: '%' }),
    answer: (v) => (100 * num(v, 'k')) / num(v, 'n'),
    explanation: ({ vars, answer }) => `${vars.k}/${vars.n} = ${answer}%.`,
  }),
  u12('u12-02', 'percent-of', 2, {
    prompt: '{b}-ის რამდენი პროცენტია {a}? შეეხე ღერძზე.',
    variables: { b: pick(4, 5, 10, 20), a: int(1, 19) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'b'), note: 'a<b' }],
    interaction: () => ({ kind: 'line', min: 0, max: 100, step: 5, labelEvery: 2, unit: '%' }),
    answer: (v) => (100 * num(v, 'a')) / num(v, 'b'),
    explanation: ({ answer }) => `${answer}%.`,
  }),
];

/* ------------------------------------------------------------ U13 */
const u13 = T('g5-measurement-scale', 'u13');
const U13: QuestionTemplate[] = [
  u13('u13-01', 'm-to-cm', 1, {
    prompt: 'რამდენი სანტიმეტრია {m} მეტრში? შეეხე ღერძზე.',
    variables: { t: int(1, 8), m: derived((v) => decOf(num(v, 't') * 5, 1)) },
    interaction: () => ({ kind: 'line', min: 0, max: 400, step: 50, labelEvery: 2, unit: 'სმ' }),
    answer: (v) => num(v, 't') * 50,
    explanation: ({ vars }) => `${vars.m} მ = ${Number(vars.t) * 50} სმ.`,
  }),
  u13('u13-04', 'sign', 2, {
    prompt: 'შეადარე სიგრძეები და აირჩიე ნიშანი.',
    variables: { cm: int(20, 900), m: int(2, 9), t: int(0, 9) },
    interaction: (v) => ({ kind: 'slots', tokens: [`${num(v, 'cm')} სმ`, '?', `${decOf(num(v, 'm') * 10 + num(v, 't'), 1)} მ`], options: SIGNS }),
    answer: (v) => signOf(num(v, 'cm'), (num(v, 'm') * 10 + num(v, 't')) * 10),
    explanation: ({ vars }) => `${decOf(Number(vars.m) * 10 + Number(vars.t), 1)} მ = ${(Number(vars.m) * 10 + Number(vars.t)) * 10} სმ.`,
  }),
  u13('u13-08', 'scale-line', 2, {
    prompt: 'რუკაზე 1 სმ რეალურად {s} კმ-ს შეესაბამება. რეალურად რამდენი კმ იქნება რუკაზე {n} სმ? შეეხე ღერძზე.',
    variables: { s: pick(2, 3, 5, 10, 20), n: int(2, 9) },
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 's') * 10, step: num(v, 's'), labelEvery: 2, unit: 'კმ' }),
    answer: (v) => num(v, 's') * num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} × ${vars.s} = ${Number(vars.n) * Number(vars.s)}.`,
  }),
];

/* ------------------------------------------------------------ U14 */
const u14 = T('g5-coordinate-plane', 'u14');
const U14: QuestionTemplate[] = [
  u14('u14-01', 'plot', 1, {
    prompt: 'მონიშნე ბადეზე წერტილი ({x}; {y}).',
    variables: { x: int(0, 8), y: int(0, 8) },
    interaction: () => plane(),
    answer: (v) => `${num(v, 'x')},${num(v, 'y')}`,
    explanation: ({ vars }) => `${vars.x} ერთეული მარჯვნივ, ${vars.y} ერთეული ზემოთ.`,
  }),
  u14('u14-03', 'abscissa', 1, {
    prompt: 'A წერტილის აბსცისაა {x}, ორდინატა — {y}. მონიშნე A წერტილი.',
    variables: { x: int(1, 8), y: int(1, 8) },
    interaction: () => plane(),
    answer: (v) => `${num(v, 'x')},${num(v, 'y')}`,
    explanation: ({ vars }) => `A(${vars.x}; ${vars.y}).`,
  }),
  u14('u14-02', 'on-axis', 2, {
    prompt: 'მონიშნე წერტილი, რომელიც {axis}-ღერძზეა და მისი {other}-კოორდინატია {k}.',
    variables: { axis: pick('x', 'y'), other: derived((v) => (str(v, 'axis') === 'x' ? 'x' : 'y')), k: int(1, 8) },
    interaction: () => plane(),
    answer: (v) => (str(v, 'axis') === 'x' ? `${num(v, 'k')},0` : `0,${num(v, 'k')}`),
    explanation: ({ vars }) => `${vars.axis}-ღერძზე ${vars.axis === 'x' ? 'y' : 'x'} = 0.`,
  }),
  u14('u14-05', 'move', 2, {
    prompt: 'A წერტილი {dx} ერთეულით მარჯვნივ და {dy} ერთეულით ზემოთ გადაადგილდა. მონიშნე მისი ახალი მდებარეობა.',
    variables: { x: int(0, 5), y: int(0, 5), dx: int(1, 3), dy: int(1, 3) },
    interaction: (v) => plane(8, { points: [{ x: num(v, 'x'), y: num(v, 'y'), label: 'A' }] }),
    answer: (v) => `${num(v, 'x') + num(v, 'dx')},${num(v, 'y') + num(v, 'dy')}`,
    explanation: ({ vars }) => `(${Number(vars.x) + Number(vars.dx)}; ${Number(vars.y) + Number(vars.dy)}).`,
  }),
  u14('u14-04', 'same-row', 2, {
    prompt: 'მონიშნე წერტილი, რომელიც A-სთან ერთ ჰორიზონტალზეა და მისგან {d} ერთეულით მარჯვნივაა.',
    variables: { x: int(0, 5), y: int(0, 8), d: int(1, 3) },
    interaction: (v) => plane(8, { points: [{ x: num(v, 'x'), y: num(v, 'y'), label: 'A' }] }),
    answer: (v) => `${num(v, 'x') + num(v, 'd')},${num(v, 'y')}`,
    explanation: ({ vars }) => `y იგივეა, x გაიზარდა ${vars.d}-ით.`,
  }),
  u14('u14-04', 'rectangle', 3, {
    prompt: 'A, B და C მართკუთხედის სამი წვეროა. მონიშნე მეოთხე წვერო D.',
    variables: { x1: int(0, 3), x2: int(4, 8), y1: int(0, 3), y2: int(4, 8) },
    interaction: (v) =>
      plane(8, {
        points: [
          { x: num(v, 'x1'), y: num(v, 'y1'), label: 'A' },
          { x: num(v, 'x2'), y: num(v, 'y1'), label: 'B' },
          { x: num(v, 'x2'), y: num(v, 'y2'), label: 'C' },
        ],
        segments: [[[num(v, 'x1'), num(v, 'y1')], [num(v, 'x2'), num(v, 'y1')]], [[num(v, 'x2'), num(v, 'y1')], [num(v, 'x2'), num(v, 'y2')]]],
      }),
    answer: (v) => `${num(v, 'x1')},${num(v, 'y2')}`,
    explanation: ({ vars }) => `D(${vars.x1}; ${vars.y2}).`,
  }),
  u14('u14-03', 'two-points', 2, {
    prompt: 'მონიშნე ორივე წერტილი: A({x1}; {y1}) და B({x2}; {y2}).',
    variables: { x1: int(0, 8), y1: int(0, 8), x2: int(0, 8), y2: int(0, 8) },
    constraints: [{ test: (v) => num(v, 'x1') !== num(v, 'x2') || num(v, 'y1') !== num(v, 'y2'), note: 'განსხვავებული წერტილები' }],
    interaction: () => plane(8, { count: 2 }),
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

/* ------------------------------------------------------------ U15 */
const u15 = T('g5-geometry', 'u15');
const angleKind = (d: number): number => (d < 90 ? 0 : d === 90 ? 1 : 2);
const AD = ['a', 'b', 'c', 'd', 'e'];
const sideType = (s: number[]): number => (s[0] === s[1] && s[1] === s[2] ? 0 : s[0] === s[1] || s[1] === s[2] || s[0] === s[2] ? 1 : 2);
const triples = (v: Record<string, unknown>): number[][] => {
  const a = Number(v.a);
  const b = Number(v.b);
  const c = Number(v.c);
  const d = Number(v.d);
  const e = Number(v.e);
  return rotate(
    [
      [a, a, a],
      [b, b, b + (Number(v.o) % 2 === 0 ? 1 : 2)],
      [c, c + 1, c + 2],
      [d, d + 2, d + 3],
      [e + 1, e, e + 1],
    ],
    Number(v.rot),
  );
};
const U15: QuestionTemplate[] = [
  u15('u15-01', 'angle-bins', 1, {
    prompt: 'ჩადე კუთხეები სწორ ყუთში: მახვილი, მართი თუ ბლაგვი.',
    variables: { a: int(1, 17), b: int(1, 17), c: int(1, 17), d: int(1, 17), e: int(1, 17) },
    constraints: [
      { test: (v) => AD.some((k) => angleKind(num(v, k) * 10) === 0) && AD.some((k) => angleKind(num(v, k) * 10) === 2), note: 'მახვილი და ბლაგვი' },
      distinct(...AD),
    ],
    interaction: (v) => ({ kind: 'bins', bins: ['მახვილი', 'მართი', 'ბლაგვი'], items: AD.map((k) => ({ label: `${num(v, k) * 10}°` })) }),
    answer: (v) => AD.map((k) => angleKind(num(v, k) * 10)).join(','),
    explanation: () => 'მახვილი < 90°, მართი = 90°, ბლაგვი > 90°.',
  }),
  u15('u15-02', 'split-right', 1, {
    prompt: 'მართი კუთხე ორ ნაწილად გავყავით. ერთი ნაწილია {x}°. გახსენი მეორე ნაწილი.',
    variables: { a: int(2, 16, { step: 1 }), x: derived((v) => num(v, 'a') * 5) },
    constraints: [{ test: (v) => num(v, 'a') * 5 < 90, note: 'ნაკლებია მართზე' }],
    interaction: () => ({ kind: 'angle', step: 5, max: 90 }),
    answer: (v) => 90 - num(v, 'a') * 5,
    explanation: ({ answer }) => `90° − ... = ${answer}°.`,
  }),
  u15('u15-03', 'unknown-angle', 2, {
    prompt: 'ორი კუთხის ჯამია {s}°. ერთია {a}°. გახსენი მეორე კუთხე.',
    variables: { s: pick(90, 180), k: int(2, 17), a: derived((v) => num(v, 'k') * 5) },
    constraints: [{ test: (v) => num(v, 'k') * 5 < num(v, 's'), note: 'a<s' }],
    interaction: () => ({ kind: 'angle', step: 5, max: 180 }),
    answer: (v) => num(v, 's') - num(v, 'k') * 5,
    explanation: ({ vars, answer }) => `${vars.s}° − ${vars.a}° = ${answer}°.`,
  }),
  u15('u15-05', 'quad-fourth', 2, {
    prompt: 'ოთხკუთხედის სამი კუთხეა {a}°, {b}° და {c}°. გახსენი მეოთხე კუთხე.',
    variables: { a: int(60, 140, { step: 5 }), b: int(60, 140, { step: 5 }), c: int(60, 140, { step: 5 }) },
    constraints: [{ test: (v) => 360 - num(v, 'a') - num(v, 'b') - num(v, 'c') >= 5 && 360 - num(v, 'a') - num(v, 'b') - num(v, 'c') <= 175, note: 'მეოთხე კუთხე ≤ 175' }],
    interaction: () => ({ kind: 'angle', step: 5, max: 180 }),
    answer: (v) => 360 - num(v, 'a') - num(v, 'b') - num(v, 'c'),
    explanation: ({ answer }) => `ოთხკუთხედის კუთხეთა ჯამია 360°; მეოთხე ${answer}°.`,
  }),
  u15('u15-09', 'adjacent', 1, {
    prompt: 'ორი წრფე იკვეთება და ერთი კუთხეა {a}°. გახსენი მისი მომიჯნავე კუთხე.',
    variables: { k: int(1, 17), a: derived((v) => num(v, 'k') * 10) },
    constraints: [{ test: (v) => num(v, 'k') !== 9, note: 'არა მართი' }],
    interaction: () => ({ kind: 'angle', step: 5, max: 180 }),
    answer: (v) => 180 - num(v, 'k') * 10,
    explanation: ({ answer }) => `მომიჯნავე კუთხეთა ჯამია 180°; მეორე ${answer}°.`,
  }),
  u15('u15-04', 'triangle-types', 2, {
    prompt: 'ჩადე სამკუთხედები სწორ ყუთში გვერდების მიხედვით (სმ).',
    variables: { a: int(3, 9), b: int(3, 9), c: int(3, 9), d: int(3, 9), e: int(3, 9), o: int(0, 1), rot: int(0, 4) },
    constraints: [{ test: (v) => new Set(triples(v).map(sideType)).size >= 2, note: 'ორი სახეობა' }, { test: (v) => new Set(triples(v).map((s) => s.join(','))).size === 5, note: 'განსხვავებული' }],
    interaction: (v) => ({ kind: 'bins', bins: ['ტოლგვერდა', 'ტოლფერდა', 'სხვადასხვაგვერდა'], items: triples(v).map((s) => ({ label: s.join(', ') })) }),
    answer: (v) => triples(v).map(sideType).join(','),
    explanation: () => 'ტოლგვერდას სამივე გვერდი ტოლი აქვს, ტოლფერდას — ორი.',
  }),
  u15('u15-12', 'perimeter', 2, {
    prompt: 'ააგე მართკუთხედი, რომლის ერთი გვერდია {r} უჯრა და პერიმეტრია {p}.',
    variables: { r: int(2, 9), c: int(2, 12), p: derived((v) => 2 * (num(v, 'r') + num(v, 'c'))) },
    interaction: (v) => ({ kind: 'array', maxRows: 12, maxCols: 14, fixedRows: num(v, 'r'), output: 'perimeter' }),
    answer: (v) => 2 * (num(v, 'r') + num(v, 'c')),
    explanation: ({ vars }) => `მეორე გვერდია ${vars.c}.`,
  }),
  u15('u15-13', 'area', 2, {
    prompt: 'ააგე მართკუთხედი, რომლის ერთი გვერდია {r} უჯრა და ფართობია {a} უჯრა.',
    variables: { r: int(2, 9), c: int(2, 12), a: derived((v) => num(v, 'r') * num(v, 'c')) },
    interaction: (v) => ({ kind: 'array', maxRows: 12, maxCols: 14, fixedRows: num(v, 'r'), output: 'count' }),
    answer: (v) => num(v, 'r') * num(v, 'c'),
    explanation: ({ vars }) => `${vars.a} ÷ ${vars.r} = ${vars.c}.`,
  }),
  u15('u15-08', 'midpoint', 1, {
    prompt: 'მონაკვეთის სიგრძეა {l} სმ. მას შუაზე ყოფენ. შეეხე შუა წერტილს სახაზავზე.',
    variables: { k: int(2, 12), l: derived((v) => num(v, 'k') * 10) },
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'l'), step: 5, labelEvery: 2, style: 'ruler', unit: 'სმ' }),
    answer: (v) => num(v, 'k') * 5,
    explanation: ({ vars }) => `${vars.l} ÷ 2 = ${Number(vars.k) * 5}.`,
  }),
  u15('u15-10', 'diameter', 1, {
    prompt: 'წრის რადიუსია {r} სმ. რამდენია დიამეტრი? შეეხე ღერძზე.',
    variables: { r: int(3, 19) },
    interaction: () => ({ kind: 'line', min: 0, max: 40, step: 2, labelEvery: 5, unit: 'სმ' }),
    answer: (v) => 2 * num(v, 'r'),
    explanation: ({ vars }) => `2 × ${vars.r} = ${2 * Number(vars.r)}.`,
  }),
];

/* ------------------------------------------------------------ U16 */
const u16 = T('g5-algebra-powers', 'u16');
const signSolutions = (a: number, b: number, c: number, target: number): string[][] => {
  const out: string[][] = [];
  for (const s1 of SIGN4) for (const s2 of SIGN4) if (evalSigns(a, s1, b, s2, c) === target) out.push([s1, s2]);
  return out;
};
const U16: QuestionTemplate[] = [
  u16('u16-01', 'signs', 3, {
    prompt: 'ჩასვი მოქმედების ნიშნები ისე, რომ ტოლობა სწორი იყოს (ჯერ × და ÷).',
    variables: { a: int(2, 12), b: int(2, 9), c: int(2, 9), s1: pick(...SIGN4), s2: pick(...SIGN4), t: derived((v) => evalSigns(num(v, 'a'), str(v, 's1'), num(v, 'b'), str(v, 's2'), num(v, 'c')) ?? -999) },
    constraints: [
      { test: (v) => num(v, 't') >= 0 && num(v, 't') < 200, note: 'სწორი მნიშვნელობა' },
      { test: (v) => signSolutions(num(v, 'a'), num(v, 'b'), num(v, 'c'), num(v, 't')).length === 1, note: 'ერთადერთი ამოხსნა' },
    ],
    interaction: (v) => ({ kind: 'slots', tokens: [String(num(v, 'a')), '?', String(num(v, 'b')), '?', String(num(v, 'c')), '=', String(num(v, 't'))], options: SIGN4 }),
    answer: (v) => `${str(v, 's1')},${str(v, 's2')}`,
    explanation: ({ vars }) => `${vars.a} ${vars.s1} ${vars.b} ${vars.s2} ${vars.c} = ${vars.t}.`,
  }),
  u16('u16-02', 'find-b', 2, {
    prompt: 'იპოვე b, თუ {k}b + {c} = {s}. შეეხე ღერძზე.',
    variables: { k: int(2, 9), b: int(1, 15), c: int(1, 30), s: derived((v) => num(v, 'k') * num(v, 'b') + num(v, 'c')) },
    interaction: () => ({ kind: 'line', min: 0, max: 20, step: 1, labelEvery: 5 }),
    answer: (v) => num(v, 'b'),
    explanation: ({ vars }) => `(${vars.s} − ${vars.c}) ÷ ${vars.k} = ${vars.b}.`,
  }),
  u16('u16-03', 'divide-eq', 2, {
    prompt: 'ამოხსენი განტოლება: b ÷ {k} = {r}. შეეხე b-ს ღერძზე.',
    variables: { k: int(2, 9), r: int(2, 9) },
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'k') * 10, step: num(v, 'k'), labelEvery: 2 }),
    answer: (v) => num(v, 'k') * num(v, 'r'),
    explanation: ({ vars }) => `b = ${vars.r} × ${vars.k}.`,
  }),
  u16('u16-04', 'square', 2, {
    prompt: 'ააგე კვადრატი, რომლის ფართობია {a} კვადრატული უჯრა.',
    variables: { n: int(3, 10), a: derived((v) => num(v, 'n') * num(v, 'n')) },
    interaction: () => ({ kind: 'array', maxRows: 12, maxCols: 12, output: 'dims' }),
    answer: (v) => `${num(v, 'n')},${num(v, 'n')}`,
    explanation: ({ vars }) => `${vars.n}² = ${vars.a}.`,
  }),
  u16('u16-06', 'power-cards', 2, {
    prompt: 'ჩაწერე ნამრავლი ხარისხის სახით: {b} × {b}{more}',
    variables: { b: int(2, 9), e: int(2, 5), more: derived((v) => Array.from({ length: num(v, 'e') - 1 }, () => ` × ${num(v, 'b')}`).slice(1).join('')), r: int(0, 3) },
    interaction: (v) => ({ kind: 'tiles', cards: rotate([String(num(v, 'b')), '²', '³', '⁴', '⁵'], num(v, 'r')), slots: 2 }),
    answer: (v) => `${num(v, 'b')}${['', '', '²', '³', '⁴', '⁵'][num(v, 'e')]}`,
    text: true,
    options: (v) => [0, 1, 2, 3].map((k) => `${num(v, 'b')}${['²', '³', '⁴', '⁵'][(num(v, 'e') - 2 + k) % 4]}`),
    explanation: ({ answer }) => `${answer}.`,
  }),
];

/* ------------------------------------------------------------ U17 */
const u17 = T('g5-data-chance', 'u17');
const WHO: Array<[string, string]> = [['ფეხბურთი', 'ცურვა'], ['წიგნები', 'ფანქრები'], ['ვაშლი', 'მსხალი'], ['კატა', 'ძაღლი']];
const U17: QuestionTemplate[] = [
  u17('u17-02', 'pictogram', 2, {
    prompt: 'ააგე პიქტოგრამა: ერთი ★ აღნიშნავს {per} ერთეულს. {l1} — {x}, {l2} — {y}.',
    variables: { per: pick(2, 5, 10), ka: int(1, 8), kb: int(1, 8), w: int(0, 3), l1: derived((v) => WHO[num(v, 'w')]![0]), l2: derived((v) => WHO[num(v, 'w')]![1]), x: derived((v) => num(v, 'per') * num(v, 'ka')), y: derived((v) => num(v, 'per') * num(v, 'kb')) },
    interaction: (v) => ({ kind: 'counters', style: 'icons', labels: WHO[num(v, 'w')]!, icon: 'star', max: 9, per: num(v, 'per') }),
    answer: (v) => `${num(v, 'ka')},${num(v, 'kb')}`,
    explanation: ({ vars }) => `${vars.x} ÷ ${vars.per} = ${vars.ka}; ${vars.y} ÷ ${vars.per} = ${vars.kb}.`,
  }),
  u17('u17-03', 'frequency-bars', 2, {
    prompt: 'სიხშირეთა ცხრილი: 0 → {a}, 1 → {b}, 2 → {c}, 3 → {d}. ააგე სვეტოვანი დიაგრამა.',
    variables: { a: int(1, 9), b: int(1, 9), c: int(1, 9), d: int(1, 9) },
    interaction: () => ({ kind: 'counters', style: 'bars', labels: ['0', '1', '2', '3'], icon: 'sq-blue', max: 10 }),
    answer: (v) => `${num(v, 'a')},${num(v, 'b')},${num(v, 'c')},${num(v, 'd')}`,
    explanation: () => 'სვეტის სიმაღლე სიხშირეს უდრის.',
  }),
  u17('u17-05', 'bars-days', 1, {
    prompt: 'კვირის განმავლობაში გაიყიდა ნაყინი: ორშაბათი — {a}, სამშაბათი — {b}, ოთხშაბათი — {c}. ააგე სვეტოვანი დიაგრამა.',
    variables: { a: int(1, 10), b: int(1, 10), c: int(1, 10) },
    interaction: () => ({ kind: 'counters', style: 'bars', labels: ['ორშ', 'სამ', 'ოთხ'], icon: 'sq-orange', max: 10 }),
    answer: (v) => `${num(v, 'a')},${num(v, 'b')},${num(v, 'c')}`,
    explanation: () => 'თითო სვეტი თითო დღეა.',
  }),
  u17('u17-08', 'shade-probability', 2, {
    prompt: 'ყუთში {n} ბურთია და წითლის ამოღების ალბათობა {a}/{d}. შეღებე წითელი ბურთები.',
    variables: { d: int(2, 6), k: int(2, 3), a: int(1, 5), n: derived((v) => num(v, 'd') * num(v, 'k')) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'd'), note: 'a<d' }],
    interaction: (v) => ({ kind: 'fill', shape: 'circle', total: num(v, 'n') }),
    answer: (v) => num(v, 'a') * num(v, 'k'),
    explanation: ({ vars }) => `${vars.n} × ${vars.a}/${vars.d} = ${Number(vars.a) * Number(vars.k)}.`,
  }),
  u17('u17-07', 'certain-bins', 2, {
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
];

/* ------------------------------------------------------------ U18 */
const u18 = T('g5-time-money', 'u18');
const clockAt = (h: number, m: number, plus: number): string => {
  const total = (h % 12) * 60 + m + plus;
  return hhmm(Math.floor(total / 60), total % 60);
};
const U18: QuestionTemplate[] = [
  u18('u18-03', 'lesson-end', 2, {
    prompt: 'გაკვეთილი საათზე ნაჩვენებ დროს დაიწყო და {d} წუთი გაგრძელდა. დააყენე საათი დასრულების დროზე.',
    variables: { h: int(1, 11), m: pick(0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55), d: pick(25, 35, 40, 45, 55, 70, 85, 90) },
    pictures: (v) => [clockPic(num(v, 'h'), num(v, 'm'))],
    interaction: () => ({ kind: 'clock', minuteStep: 5 }),
    answer: (v) => clockAt(num(v, 'h'), num(v, 'm'), num(v, 'd')),
    time: true,
    explanation: ({ answer }) => `დასრულდა ${answer}-ზე.`,
  }),
  u18('u18-04', 'later', 2, {
    prompt: 'საათი {t}-ს აჩვენებს. დააყენე საათი {d} წუთის შემდეგ.',
    variables: { h: int(1, 12), m: pick(0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55), d: pick(15, 20, 25, 30, 35, 40, 50), t: derived((v) => hhmm(num(v, 'h'), num(v, 'm'))) },
    interaction: () => ({ kind: 'clock', minuteStep: 5 }),
    answer: (v) => clockAt(num(v, 'h'), num(v, 'm'), num(v, 'd')),
    time: true,
    explanation: ({ answer }) => `${answer}.`,
  }),
  u18('u18-05', 'purse', 1, {
    prompt: 'აიღე ქისიდან {n} თეთრი.',
    variables: { n: int(11, 149) },
    interaction: () => ({ kind: 'purse', coins: COINS, output: 'total' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} თეთრი.`,
  }),
  u18('u18-06', 'change', 2, {
    prompt: 'საქონელი {p} თეთრი ღირს. მყიდველმა {q} თეთრი გადაიხადა. აიღე ხურდა ქისიდან.',
    variables: { p: int(11, 95), q: pick(100, 150, 200) },
    interaction: () => ({ kind: 'purse', coins: COINS, output: 'total' }),
    answer: (v) => num(v, 'q') - num(v, 'p'),
    explanation: ({ vars, answer }) => `${vars.q} − ${vars.p} = ${answer}.`,
  }),
  u18('u18-10', 'round-lari', 2, {
    prompt: 'ფასი {p} თეთრია. დაამრგვალე უახლოეს ლარამდე: შეეხე ღერძზე (თეთრებში).',
    variables: { p: int(101, 899) },
    constraints: [{ test: (v) => num(v, 'p') % 100 !== 50 && num(v, 'p') % 100 !== 0, note: 'არა შუა' }],
    interaction: (v) => ({ kind: 'line', min: lo(num(v, 'p'), 100) - 100, max: lo(num(v, 'p'), 100) + 200, step: 100, labelEvery: 1, unit: 'თეთრი' }),
    answer: (v) => roundTo(num(v, 'p'), 100),
    explanation: ({ answer }) => `${answer} თეთრი.`,
  }),
];

/* ------------------------------------------------------------ U19 */
const u19 = T('g5-patterns-logic', 'u19');
const oddItems = (v: Record<string, unknown>): number[] => {
  const d = Number(v.d);
  return rotate([d * Number(v.a), d * Number(v.b), d * Number(v.c), d * Number(v.x) + 1 + (Number(v.y) % (d - 1))], Number(v.r));
};
const U19: QuestionTemplate[] = [
  u19('u19-01', 'odd-one', 2, {
    prompt: 'სამი რიცხვი ერთ წესს ემორჩილება, ერთი — არა. შეეხე ზედმეტს.',
    variables: { d: int(3, 9), a: int(2, 15), b: int(2, 15), c: int(2, 15), x: int(2, 15), y: int(0, 8), r: int(0, 3) },
    constraints: [{ test: (v) => new Set(oddItems(v)).size === 4 && new Set([num(v, 'a'), num(v, 'b'), num(v, 'c')]).size === 3, note: 'განსხვავებული' }],
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: oddItems(v).map((n) => ({ label: String(n) })) }),
    answer: (v) => oddItems(v).findIndex((n) => n % num(v, 'd') !== 0) + 1,
    explanation: ({ vars }) => `სამი რიცხვი ${vars.d}-ის ჯერადია.`,
  }),
  u19('u19-02', 'next-chart', 1, {
    prompt: 'გააგრძელე მიმდევრობა: {a}, {b}, {c}, {e}, … შეეხე შემდეგ რიცხვს ცხრილში.',
    variables: { a: int(2, 30), d: int(2, 12), b: derived((v) => num(v, 'a') + num(v, 'd')), c: derived((v) => num(v, 'a') + 2 * num(v, 'd')), e: derived((v) => num(v, 'a') + 3 * num(v, 'd')) },
    constraints: [{ test: (v) => num(v, 'a') + 4 * num(v, 'd') <= 100, note: 'ცხრილის ფარგლებში' }],
    interaction: () => ({ kind: 'chart', from: 1, to: 100, cols: 10 }),
    answer: (v) => num(v, 'a') + 4 * num(v, 'd'),
    explanation: ({ vars, answer }) => `ყოველ ნაბიჯზე ემატება ${vars.d}; შემდეგია ${answer}.`,
  }),
];

void [gcd, dec, partsPic, derived];

export const G5_INTERACTIVE_TEMPLATES: QuestionTemplate[] = [
  ...U01, ...U02, ...U03, ...U04, ...U05, ...U06, ...U07, ...U08, ...U09, ...U10, ...U11, ...U12, ...U13, ...U14, ...U15, ...U16, ...U17, ...U18, ...U19,
];
