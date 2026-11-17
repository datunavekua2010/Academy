/**
 * Grade III — interactive templates.
 *
 * The child builds a number in its columns, grows a rectangle of squares to
 * show a product or a perimeter, hops along a number line, sets a clock or an
 * angle, fills a part of a whole, puts coins in a purse, sorts numbers, builds
 * a bar chart. Each answer is the canonical string of what was done.
 */
import type { QuestionTemplate, Vars } from './types';
import {
  MONTH_NAMES,
  ORDINALS,
  WEEKDAY_NAMES,
  derived,
  distinct,
  hhmm,
  int,
  interactiveSet,
  num,
  objectVars,
  pick,
  str,
} from './ix-kit';
import { SIGNS, WEEKDAY_SHORT, linePic, minCoins, patternSeq, signOf } from './ix-kit34';

const T = (topicId: string, unit: string) => interactiveSet(3, topicId, `g3-ix-${unit}`);
const place = (cols: number) => (): { kind: 'place'; digits: number } => ({ kind: 'place', digits: cols });
const COINS = [1, 2, 5, 10, 20, 50];
const four = ['a', 'b', 'c', 'd'];

/* ------------------------------------------------------------ U01 */
const u01 = T('g3-ricxvebi100', 'u01');
const U01: QuestionTemplate[] = [
  u01('u01-hundred-chart', 'find-on-chart', 1, {
    prompt: 'იპოვე რიცხვი {n} ასეულის ცხრილში.',
    variables: { n: int(1, 100) },
    interaction: () => ({ kind: 'chart', from: 1, to: 100, cols: 10 }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} ცხრილში თავის ადგილზეა.`,
  }),
  u01('u01-hundred-chart', 'ten-less', 2, {
    prompt: 'იპოვე ცხრილში რიცხვი, რომელიც {n}-ზე 10-ით ნაკლებია.',
    variables: { n: int(11, 100) },
    interaction: () => ({ kind: 'chart', from: 1, to: 100, cols: 10 }),
    answer: (v) => num(v, 'n') - 10,
    explanation: ({ vars }) => `10-ით ნაკლები ნიშნავს ერთი რიგით ზემოთ: ${Number(vars.n) - 10}.`,
  }),
  u01('u01-before-and-after', 'just-before', 1, {
    prompt: 'იპოვე ცხრილში რიცხვი, რომელიც {n}-ის უშუალოდ წინაა.',
    variables: { n: int(2, 100) },
    interaction: () => ({ kind: 'chart', from: 1, to: 100, cols: 10 }),
    answer: (v) => num(v, 'n') - 1,
    explanation: ({ vars }) => `${vars.n}-ის წინ არის ${Number(vars.n) - 1}.`,
  }),
  u01('u01-tens-and-ones', 'build-number', 1, {
    prompt: 'ააგე რიცხვი {n} ათეულებისა და ერთეულებისგან.',
    variables: { n: int(11, 99) },
    interaction: () => ({ kind: 'build', startTens: 0, startOnes: 0, output: 'number' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${Math.floor(Number(vars.n) / 10)} ათეული და ${Number(vars.n) % 10} ერთეული.`,
  }),
  u01('u01-number-line', 'tap-on-line', 1, {
    prompt: 'შეეხე რიცხვს {n} რიცხვით ღერძზე.',
    variables: { n: int(5, 95, { step: 5 }) },
    interaction: () => ({ kind: 'line', min: 0, max: 100, step: 5, labelEvery: 2 }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} ღერძზე თავის ადგილას დგას.`,
  }),
  u01('u01-largest-and-smallest', 'tap-extreme', 1, {
    prompt: 'შეეხე {which} რიცხვს: {a}, {b}, {c}, {d}.',
    variables: { a: int(10, 99), b: int(10, 99), c: int(10, 99), d: int(10, 99), which: pick('უდიდეს', 'უმცირეს') },
    constraints: [distinct(...four)],
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: four.map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) => {
      const xs = four.map((k) => num(v, k));
      return xs.indexOf(str(v, 'which') === 'უდიდეს' ? Math.max(...xs) : Math.min(...xs)) + 1;
    },
    explanation: ({ vars }) => `შეადარე ათეულები, შემდეგ ერთეულები — ${vars.which}ი რიცხვი ერთია.`,
  }),
  u01('u01-largest-and-smallest', 'cards', 2, {
    prompt: 'ბარათებით {a} და {b} ჩაწერე {which} ორნიშნა რიცხვი.',
    variables: { a: int(1, 9), b: int(1, 9), which: pick('უდიდესი', 'უმცირესი') },
    constraints: [distinct('a', 'b')],
    interaction: (v) => ({ kind: 'tiles', cards: [String(num(v, 'a')), String(num(v, 'b'))], slots: 2 }),
    answer: (v) => {
      const hi = Math.max(num(v, 'a'), num(v, 'b'));
      const lo = Math.min(num(v, 'a'), num(v, 'b'));
      return str(v, 'which') === 'უდიდესი' ? `${hi}${lo}` : `${lo}${hi}`;
    },
    text: true,
    options: (v) => [`${Math.max(num(v, 'a'), num(v, 'b'))}${Math.min(num(v, 'a'), num(v, 'b'))}`, `${Math.min(num(v, 'a'), num(v, 'b'))}${Math.max(num(v, 'a'), num(v, 'b'))}`],
    explanation: ({ vars }) => `${vars.which} რიცხვში ${vars.which === 'უდიდესი' ? 'დიდი' : 'პატარა'} ციფრი ათეულებშია.`,
  }),
  u01('u01-ordinal-numbers', 'nth-item', 1, {
    prompt: 'მარცხნიდან შეეხე {ord} ობიექტს.',
    variables: { k: int(1, 10), ord: { kind: 'choice', values: (v: Vars) => [ORDINALS[Number(v.k) - 1]!] } },
    interaction: () => ({ kind: 'pick', mode: 'one', items: ['apple', 'pear', 'banana', 'star', 'ball', 'flower-pink', 'fish', 'bird', 'balloon', 'heart'].map((icon) => ({ icon })) }),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${vars.ord} ობიექტი მარცხნიდან ${vars.k}-ეა.`,
  }),
  u01('u01-roman-numerals', 'tap-roman', 2, {
    prompt: 'რომელი რიცხვია რომაული ციფრით „{roman}“? შეეხე მას.',
    variables: { i: int(0, 4), roman: { kind: 'choice', values: (v: Vars) => [['I', 'V', 'X', 'L', 'C'][num(v, 'i')]!] } },
    interaction: () => ({ kind: 'pick', mode: 'one', items: [1, 5, 10, 50, 100].map((n) => ({ label: String(n) })) }),
    answer: (v) => num(v, 'i') + 1,
    explanation: ({ vars }) => `${vars.roman} = ${[1, 5, 10, 50, 100][Number(vars.i)]}.`,
  }),
];

/* ------------------------------------------------------------ U02 */
const u02 = T('g3-tvla-mimdevrobebi', 'u02');
const U02: QuestionTemplate[] = [
  u02('u02-skip-counting', 'hops', 1, {
    prompt: 'ღერძზე 0-დან დაიწყე და გააკეთე {k} ნახტომი {d}-ობით. რომელ რიცხვზე აღმოჩნდები?',
    variables: { d: pick(2, 3, 4, 5, 10), k: int(3, 9) },
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'd') * 10, step: num(v, 'd'), start: 0, labelEvery: 1 }),
    answer: (v) => num(v, 'd') * num(v, 'k'),
    explanation: ({ vars }) => `${vars.k} ნახტომი ${vars.d}-ობით: ${Number(vars.d) * Number(vars.k)}.`,
  }),
  u02('u02-skip-counting', 'tap-multiples', 2, {
    prompt: 'შეეხე ყველა რიცხვს, რომელიც {d}-ის ჯერადია.',
    variables: { d: pick(2, 3, 4, 5), base: int(10, 40) },
    interaction: (v) => ({ kind: 'pick', mode: 'many', items: Array.from({ length: 10 }, (_, i) => ({ label: String(num(v, 'base') + i) })) }),
    answer: (v) =>
      Array.from({ length: 10 }, (_, i) => i)
        .filter((i) => (num(v, 'base') + i) % num(v, 'd') === 0)
        .map((i) => i + 1)
        .join(','),
    explanation: ({ vars }) => `${vars.d}-ის ჯერადები ${vars.d}-ობით ითვლება.`,
  }),
  u02('u02-even-odd', 'sort', 1, {
    prompt: 'დაახარისხე რიცხვები: ლუწები ერთ ყუთში, კენტები — მეორეში.',
    variables: { a: int(10, 199), b: int(10, 199), c: int(10, 199), d: int(10, 199), e: int(10, 199), f: int(10, 199) },
    constraints: [
      distinct('a', 'b', 'c', 'd', 'e', 'f'),
      { test: (v) => ['a', 'b', 'c', 'd', 'e', 'f'].some((k) => num(v, k) % 2 === 0) && ['a', 'b', 'c', 'd', 'e', 'f'].some((k) => num(v, k) % 2 === 1), note: 'ორივე სახეობა' },
    ],
    interaction: (v) => ({ kind: 'bins', bins: ['ლუწი', 'კენტი'], items: ['a', 'b', 'c', 'd', 'e', 'f'].map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) => ['a', 'b', 'c', 'd', 'e', 'f'].map((k) => (num(v, k) % 2 === 0 ? 0 : 1)).join(','),
    explanation: () => 'ლუწი რიცხვი 0, 2, 4, 6 ან 8-ზე მთავრდება, კენტი — 1, 3, 5, 7 ან 9-ზე.',
  }),
  u02('u02-sorting-even-odd', 'sort-big', 2, {
    prompt: 'ჩადე სამნიშნა რიცხვები სწორ ყუთში: ლუწი თუ კენტი.',
    variables: { a: int(100, 999), b: int(100, 999), c: int(100, 999), d: int(100, 999), e: int(100, 999) },
    constraints: [
      distinct('a', 'b', 'c', 'd', 'e'),
      { test: (v) => ['a', 'b', 'c', 'd', 'e'].some((k) => num(v, k) % 2 === 0) && ['a', 'b', 'c', 'd', 'e'].some((k) => num(v, k) % 2 === 1), note: 'ორივე სახეობა' },
    ],
    interaction: (v) => ({ kind: 'bins', bins: ['ლუწი', 'კენტი'], items: ['a', 'b', 'c', 'd', 'e'].map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) => ['a', 'b', 'c', 'd', 'e'].map((k) => (num(v, k) % 2 === 0 ? 0 : 1)).join(','),
    explanation: () => 'რიცხვის ლუწობას მხოლოდ ბოლო ციფრი განსაზღვრავს.',
  }),
  u02('u02-number-line-movement', 'jump', 1, {
    prompt: 'ღერძზე დგახარ {s}-ზე. გადაადგილდი {d} ნაბიჯით {dir}. რომელ რიცხვზე აღმოჩნდები?',
    variables: { s: int(10, 40), d: int(2, 8), sign: pick(1, -1), dir: derived((v) => (num(v, 'sign') > 0 ? 'მარჯვნივ' : 'მარცხნივ')) },
    interaction: (v) => ({ kind: 'line', min: num(v, 's') - 10, max: num(v, 's') + 10, start: num(v, 's'), labelEvery: 5 }),
    answer: (v) => num(v, 's') + num(v, 'sign') * num(v, 'd'),
    explanation: ({ vars }) => `${vars.s} ${Number(vars.sign) > 0 ? '+' : '−'} ${vars.d} = ${Number(vars.s) + Number(vars.sign) * Number(vars.d)}.`,
  }),
  u02('u02-number-patterns', 'next-on-chart', 2, {
    prompt: 'მიმდევრობაში {a}, {b}, {c} ... შეეხე შემდეგ რიცხვს ასეულის ცხრილში.',
    variables: { a: int(1, 30), d: pick(2, 3, 4, 5, 6, 7, 8, 9, 10), b: derived((v) => num(v, 'a') + num(v, 'd')), c: derived((v) => num(v, 'a') + 2 * num(v, 'd')) },
    constraints: [{ test: (v) => num(v, 'a') + 3 * num(v, 'd') <= 100, note: 'ცხრილში ეტევა' }],
    interaction: () => ({ kind: 'chart', from: 1, to: 100, cols: 10 }),
    answer: (v) => num(v, 'a') + 3 * num(v, 'd'),
    explanation: ({ vars }) => `ყოველ ნაბიჯზე ემატება ${vars.d}: ${Number(vars.a) + 3 * Number(vars.d)}.`,
  }),
];

/* ------------------------------------------------------------ U03 */
const u03 = T('g3-ertnishna-moqmedebebi', 'u03');
const U03: QuestionTemplate[] = [
  u03('u03-addition-within-20', 'frame-add', 1, {
    prompt: 'ჩარჩოში უკვე {a} წრეა. დაამატე კიდევ {b}. რამდენი წრეა სულ?',
    variables: { a: int(6, 12), b: int(4, 9) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 20, note: '20-მდე' }],
    interaction: (v) => ({ kind: 'fill', shape: 'frame20', total: 20, start: num(v, 'a'), locked: num(v, 'a'), output: 'all' }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u03('u03-subtraction-within-20', 'frame-take', 1, {
    prompt: 'ჩარჩოში {a} წრეა. ამოიღე {b}. რამდენი დარჩა?',
    variables: { a: int(11, 20), b: int(2, 9) },
    interaction: (v) => ({ kind: 'fill', shape: 'frame20', total: 20, start: num(v, 'a') }),
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}.`,
  }),
  u03('u03-doubling-halving', 'double', 1, {
    prompt: 'ბადეში უკვე {a} {noun} არის. გააორმაგე ისინი: რამდენი უნდა იყოს სულ?',
    variables: { ...objectVars(), a: int(3, 10) },
    interaction: (v) => ({ kind: 'fill', shape: 'grid', cols: 5, total: 20, start: num(v, 'a'), locked: num(v, 'a'), output: 'all', icon: str(v, 'obj'), noun: str(v, 'noun') }),
    answer: (v) => 2 * num(v, 'a'),
    explanation: ({ vars }) => `${vars.a} + ${vars.a} = ${2 * Number(vars.a)}.`,
  }),
  u03('u03-doubling-halving', 'half', 2, {
    prompt: 'ბადეში {a} {noun} არის. დატოვე მათი ნახევარი: რამდენი დარჩება?',
    variables: { ...objectVars(), h: int(2, 10), a: derived((v) => num(v, 'h') * 2) },
    interaction: (v) => ({ kind: 'fill', shape: 'grid', cols: 5, total: 20, start: num(v, 'a'), icon: str(v, 'obj'), noun: str(v, 'noun') }),
    answer: (v) => num(v, 'h'),
    explanation: ({ vars }) => `${vars.a}-ის ნახევარია ${vars.h}.`,
  }),
  u03('u03-adding-three-numbers', 'line-three', 2, {
    prompt: 'ღერძზე დაიწყე {a}-დან, დაუმატე {b}, შემდეგ კიდევ {c}. რომელ რიცხვზე აღმოჩნდები?',
    variables: { a: int(2, 9), b: int(2, 9), c: int(2, 9) },
    interaction: () => ({ kind: 'line', min: 0, max: 30, labelEvery: 5 }),
    answer: (v) => num(v, 'a') + num(v, 'b') + num(v, 'c'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} + ${vars.c} = ${Number(vars.a) + Number(vars.b) + Number(vars.c)}.`,
  }),
  u03('u03-adding-four-or-more', 'line-four', 3, {
    prompt: 'ღერძზე დაიწყე 0-დან და სათითაოდ დაამატე {a}, {b}, {c} და {d}. რომელ რიცხვზე აღმოჩნდები?',
    variables: { a: int(2, 9), b: int(2, 9), c: int(2, 9), d: int(2, 9) },
    interaction: () => ({ kind: 'line', min: 0, max: 40, labelEvery: 5 }),
    answer: (v) => num(v, 'a') + num(v, 'b') + num(v, 'c') + num(v, 'd'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} = ${['a', 'b', 'c', 'd'].reduce((s, k) => s + Number(vars[k]), 0)}.`,
  }),
];

/* ------------------------------------------------------------ U04 */
const u04 = T('g3-gamravleba', 'u04');
const U04: QuestionTemplate[] = [
  u04('u04-facts-0-to-5', 'hops', 1, {
    prompt: 'გააკეთე {k} ნახტომი {d}-ობით 0-დან. რამდენია {k} × {d}? შეეხე შედეგს ღერძზე.',
    variables: { d: int(2, 5), k: int(2, 10) },
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'd') * 10, step: num(v, 'd'), start: 0, labelEvery: 1 }),
    answer: (v) => num(v, 'd') * num(v, 'k'),
    explanation: ({ vars }) => `${vars.k} × ${vars.d} = ${Number(vars.d) * Number(vars.k)}.`,
  }),
  u04('u04-facts-6-to-10', 'hops-2', 2, {
    prompt: 'გააკეთე {k} ნახტომი {d}-ობით 0-დან. რამდენია {k} × {d}? შეეხე შედეგს ღერძზე.',
    variables: { d: int(6, 10), k: int(3, 10) },
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'd') * 10, step: num(v, 'd'), start: 0, labelEvery: 1 }),
    answer: (v) => num(v, 'd') * num(v, 'k'),
    explanation: ({ vars }) => `${vars.k} × ${vars.d} = ${Number(vars.d) * Number(vars.k)}.`,
  }),
  u04('u04-rectangular-tables', 'build-grid', 1, {
    prompt: 'ააგე კვადრატებისგან ბადე: {r} რიგი და {c} სვეტი.',
    variables: { r: int(2, 8), c: int(2, 9) },
    interaction: () => ({ kind: 'array', maxRows: 9, maxCols: 10, output: 'dims' }),
    answer: (v) => `${num(v, 'r')},${num(v, 'c')}`,
    text: true,
    options: (v) => [`${num(v, 'r')},${num(v, 'c')}`, `${num(v, 'c')},${num(v, 'r')}`],
    explanation: ({ vars }) => `${vars.r} რიგი, თითოეულში ${vars.c} კვადრატი: ${Number(vars.r) * Number(vars.c)}.`,
  }),
  u04('u04-rectangular-tables', 'find-columns', 2, {
    prompt: 'ბადეს {r} რიგი აქვს. რამდენი სვეტი უნდა დაამატო, რომ სულ {n} კვადრატი იყოს?',
    variables: { r: int(2, 9), c: int(2, 10), n: derived((v) => num(v, 'r') * num(v, 'c')) },
    interaction: (v) => ({ kind: 'array', maxRows: 9, maxCols: 10, fixedRows: num(v, 'r'), output: 'count' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.r} = ${vars.c} სვეტი.`,
  }),
  u04('u04-unknown-factors', 'grid-factor', 2, {
    prompt: '{r} × □ = {n}. ააგე ბადე {r} რიგით და იპოვე, რამდენი სვეტი გჭირდება.',
    variables: { r: int(2, 9), c: int(2, 10), n: derived((v) => num(v, 'r') * num(v, 'c')) },
    interaction: (v) => ({ kind: 'array', maxRows: 9, maxCols: 10, fixedRows: num(v, 'r'), output: 'count' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.r} × ${vars.c} = ${vars.n}.`,
  }),
  u04('u04-multiplying-same-number', 'square', 2, {
    prompt: 'ააგე კვადრატი, რომლის გვერდზე {s} კვადრატია. რამდენი კვადრატი დაგჭირდა სულ?',
    variables: { s: int(2, 10), n: derived((v) => num(v, 's') * num(v, 's')) },
    interaction: (v) => ({ kind: 'array', maxRows: 10, maxCols: 10, fixedRows: num(v, 's'), startCols: 1, output: 'count' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.s} × ${vars.s} = ${vars.n}.`,
  }),
  u04('u04-table-filling', 'tap-product', 2, {
    prompt: 'შეეხე რიცხვს, რომელიც ტოლია {a} × {b}-ის.',
    variables: { a: int(3, 9), b: int(3, 9), slot: int(0, 3) },
    interaction: (v) => {
      const p = num(v, 'a') * num(v, 'b');
      const list = [p + num(v, 'a'), p - num(v, 'b'), p + 1];
      list.splice(num(v, 'slot'), 0, p);
      return { kind: 'pick', mode: 'one', items: list.map((n) => ({ label: String(n) })) };
    },
    answer: (v) => num(v, 'slot') + 1,
    explanation: ({ vars }) => `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}.`,
  }),
  u04('u04-round-numbers', 'place-build', 2, {
    prompt: 'გამოთვალე {a} × {t} და ააგე ნამრავლი თანრიგებით.',
    variables: { a: int(2, 9), b: int(1, 9), t: derived((v) => num(v, 'b') * 10) },
    interaction: place(3),
    answer: (v) => num(v, 'a') * num(v, 't'),
    explanation: ({ vars }) => `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}, ამიტომ ${vars.a} × ${vars.t} = ${Number(vars.a) * Number(vars.t)}.`,
  }),
  u04('u04-tens-hundreds-multiplication', 'place-build-thousand', 3, {
    prompt: 'გამოთვალე {a} × {t} და ააგე ნამრავლი თანრიგებით.',
    variables: { a: int(2, 9), b: int(2, 9), t: derived((v) => num(v, 'b') * 100) },
    interaction: place(4),
    answer: (v) => num(v, 'a') * num(v, 't'),
    explanation: ({ vars }) => `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)} ასეული = ${Number(vars.a) * Number(vars.t)}.`,
  }),
];
/* ------------------------------------------------------------ U05 */
const u05 = T('g3-gayofa', 'u05');
const shareLabels = (k: number): string[] => Array.from({ length: k }, (_, i) => `თეფში ${i + 1}`);
const U05: QuestionTemplate[] = [
  u05('u05-facts-1-to-5', 'share', 1, {
    prompt: 'გაანაწილე {n} {noun} თანაბრად {k} თეფშზე. რამდენი უნდა იდოს თითოეულზე?',
    variables: { ...objectVars(), k: int(2, 5), q: int(2, 6), n: derived((v) => num(v, 'k') * num(v, 'q')) },
    interaction: (v) => ({ kind: 'counters', style: 'icons', labels: shareLabels(num(v, 'k')), icon: str(v, 'obj'), max: 10 }),
    answer: (v) => Array.from({ length: num(v, 'k') }, () => num(v, 'q')).join(','),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.k} = ${vars.q}.`,
  }),
  u05('u05-word-problems-division', 'share-more', 2, {
    prompt: '{n} {noun} თანაბრად უნდა გაიყოს {k} ყუთში. რამდენი {noun} ჩავა თითო ყუთში?',
    variables: { ...objectVars(), k: int(3, 6), q: int(3, 9), n: derived((v) => num(v, 'k') * num(v, 'q')) },
    interaction: (v) => ({ kind: 'counters', style: 'icons', labels: Array.from({ length: num(v, 'k') }, (_, i) => `ყუთი ${i + 1}`), icon: str(v, 'obj'), max: 10 }),
    answer: (v) => Array.from({ length: num(v, 'k') }, () => num(v, 'q')).join(','),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.k} = ${vars.q}.`,
  }),
  u05('u05-facts-6-to-10', 'rows', 2, {
    prompt: '{n} კვადრატი თანაბრად დააწყვე {k} რიგად. რამდენი სვეტი გამოვა?',
    variables: { k: int(2, 9), q: int(2, 10), n: derived((v) => num(v, 'k') * num(v, 'q')) },
    interaction: (v) => ({ kind: 'array', maxRows: 9, maxCols: 12, fixedRows: num(v, 'k'), output: 'count' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.k} = ${vars.q}.`,
  }),
  u05('u05-unknown-dividends-divisors', 'rows-divisor', 3, {
    prompt: '{n} ÷ □ = {q}. ააგე ბადე, რომელშიც ყოველ რიგში {q} კვადრატია და სულ {n}. რამდენი რიგია?',
    variables: { k: int(2, 9), q: int(2, 10), n: derived((v) => num(v, 'k') * num(v, 'q')) },
    interaction: (v) => ({ kind: 'array', maxRows: 9, maxCols: 12, fixedCols: num(v, 'q'), output: 'count' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.q} = ${vars.k} რიგი.`,
  }),
  u05('u05-round-numbers', 'place-build', 2, {
    prompt: 'გამოთვალე {a} ÷ {b} და ააგე განაყოფი თანრიგებით.',
    variables: { b: int(2, 9), q: int(2, 9), a: derived((v) => num(v, 'b') * num(v, 'q') * 10) },
    interaction: place(2),
    answer: (v) => num(v, 'q') * 10,
    explanation: ({ vars }) => `${Number(vars.a) / 10} ÷ ${vars.b} = ${vars.q}, ამიტომ ${vars.a} ÷ ${vars.b} = ${Number(vars.q) * 10}.`,
  }),
];

/* ------------------------------------------------------------ U06 */
const u06 = T('g3-raodenobis-shedareba', 'u06');
const U06: QuestionTemplate[] = [
  u06('u06-digit-ranks-place-values', 'build-hundreds', 1, {
    prompt: 'ააგე რიცხვი: {h} ასეული, {t} ათეული და {o} ერთეული.',
    variables: { h: int(1, 9), t: int(0, 9), o: int(0, 9) },
    interaction: place(3),
    answer: (v) => num(v, 'h') * 100 + num(v, 't') * 10 + num(v, 'o'),
    explanation: ({ vars }) => `${Number(vars.h) * 100} + ${Number(vars.t) * 10} + ${vars.o} = ${Number(vars.h) * 100 + Number(vars.t) * 10 + Number(vars.o)}.`,
  }),
  u06('u06-digit-ranks-place-values', 'build-thousands', 2, {
    prompt: 'ააგე რიცხვი: {th} ათასეული, {h} ასეული, {t} ათეული და {o} ერთეული.',
    variables: { th: int(1, 9), h: int(0, 9), t: int(0, 9), o: int(0, 9) },
    interaction: place(4),
    answer: (v) => num(v, 'th') * 1000 + num(v, 'h') * 100 + num(v, 't') * 10 + num(v, 'o'),
    explanation: ({ vars }) => `ციფრები თანრიგებში: ${vars.th}, ${vars.h}, ${vars.t}, ${vars.o}.`,
  }),
  u06('u06-comparing-sums-without-addition', 'sign', 2, {
    prompt: 'შეადარე შეკრების გარეშე და აირჩიე ნიშანი: {b} + {x}  ?  {b} + {y}',
    variables: { b: int(20, 80, { step: 5 }), x: int(10, 40), y: int(10, 40) },
    interaction: (v) => ({ kind: 'slots', tokens: [`${num(v, 'b')} + ${num(v, 'x')}`, '?', `${num(v, 'b')} + ${num(v, 'y')}`], options: SIGNS }),
    answer: (v) => signOf(num(v, 'x'), num(v, 'y')),
    explanation: ({ vars }) => `პირველი შესაკრები ერთნაირია, ამიტომ ${vars.x} და ${vars.y} ადარებს შედეგს.`,
  }),
];

/* ------------------------------------------------------------ U07 */
const u07 = T('g3-mravalmoqmedebiani', 'u07');
const U07: QuestionTemplate[] = [
  u07('u07-comparing-sums-products', 'sign', 2, {
    prompt: 'შეადარე გამოსახულებები: {a} × {b}  ?  {c} + {d}',
    variables: { a: int(3, 9), b: int(3, 9), c: int(10, 60), d: int(10, 40) },
    constraints: [{ test: (v) => num(v, 'a') * num(v, 'b') !== num(v, 'c') + num(v, 'd'), note: 'არ არის ტოლი' }],
    interaction: (v) => ({ kind: 'slots', tokens: [`${num(v, 'a')} × ${num(v, 'b')}`, '?', `${num(v, 'c')} + ${num(v, 'd')}`], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a') * num(v, 'b'), num(v, 'c') + num(v, 'd')),
    explanation: ({ vars }) => `${Number(vars.a) * Number(vars.b)} და ${Number(vars.c) + Number(vars.d)}.`,
  }),
  u07('u07-comparing-differences-quotients', 'sign-2', 2, {
    prompt: 'შეადარე გამოსახულებები: {a} − {b}  ?  {c} ÷ {d}',
    variables: { a: int(20, 60), b: int(2, 19), d: int(2, 6), q: int(2, 9), c: derived((v) => num(v, 'd') * num(v, 'q')) },
    constraints: [{ test: (v) => num(v, 'a') - num(v, 'b') !== num(v, 'q'), note: 'არ არის ტოლი' }],
    interaction: (v) => ({ kind: 'slots', tokens: [`${num(v, 'a')} − ${num(v, 'b')}`, '?', `${num(v, 'c')} ÷ ${num(v, 'd')}`], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a') - num(v, 'b'), num(v, 'q')),
    explanation: ({ vars }) => `${Number(vars.a) - Number(vars.b)} და ${vars.q}.`,
  }),
];

/* ------------------------------------------------------------ U08 */
const u08 = T('g3-gantolebebi', 'u08');
const U08: QuestionTemplate[] = [
  u08('u08-unknown-addends', 'find-x', 2, {
    prompt: 'x + {a} = {b}. შეეხე x-ის მნიშვნელობას ღერძზე.',
    variables: { a: int(3, 14), x: int(3, 15), b: derived((v) => num(v, 'a') + num(v, 'x')) },
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'b'), labelEvery: 5 }),
    answer: (v) => num(v, 'x'),
    explanation: ({ vars }) => `x = ${vars.b} − ${vars.a} = ${vars.x}.`,
  }),
  u08('u08-unknown-minuends-subtrahends', 'find-x-2', 2, {
    prompt: 'x − {a} = {b}. შეეხე x-ის მნიშვნელობას ღერძზე.',
    variables: { a: int(3, 14), b: int(3, 15), x: derived((v) => num(v, 'a') + num(v, 'b')) },
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'x') + 5, labelEvery: 5 }),
    answer: (v) => num(v, 'x'),
    explanation: ({ vars }) => `x = ${vars.b} + ${vars.a} = ${vars.x}.`,
  }),
];

/* ------------------------------------------------------------ U09 */
const u09 = T('g3-damrgvaleba', 'u09');
const U09: QuestionTemplate[] = [
  u09('u09-rounding-tens-hundreds-thousands', 'round-tens', 1, {
    prompt: 'დაამრგვალე {n} უახლოეს ათეულამდე: შეეხე უახლოეს ათეულს ღერძზე.',
    variables: { n: int(11, 98) },
    constraints: [{ test: (v) => num(v, 'n') % 10 !== 0, note: 'არა ათეული' }],
    interaction: (v) => ({ kind: 'line', min: Math.floor(num(v, 'n') / 10) * 10, max: Math.floor(num(v, 'n') / 10) * 10 + 10, start: num(v, 'n'), labelEvery: 5 }),
    answer: (v) => Math.round(num(v, 'n') / 10) * 10,
    explanation: ({ answer, vars }) => `${vars.n} უფრო ახლოსაა ${answer}-თან.`,
  }),
  u09('u09-rounding-tens-hundreds-thousands', 'round-hundreds', 2, {
    prompt: 'დაამრგვალე {n} უახლოეს ასეულამდე: შეეხე უახლოეს ასეულს ღერძზე.',
    variables: { n: int(101, 999) },
    constraints: [{ test: (v) => num(v, 'n') % 100 !== 0, note: 'არა ასეული' }],
    pictures: (v) => [linePic(Math.floor(num(v, 'n') / 100) * 100, Math.floor(num(v, 'n') / 100) * 100 + 100, 10, num(v, 'n'))],
    interaction: (v) => ({ kind: 'line', min: Math.floor(num(v, 'n') / 100) * 100, max: Math.floor(num(v, 'n') / 100) * 100 + 100, step: 100, labelEvery: 1 }),
    answer: (v) => Math.round(num(v, 'n') / 100) * 100,
    explanation: ({ answer, vars }) => `${vars.n} უფრო ახლოსაა ${answer}-თან.`,
  }),
  u09('u09-rounding-tens-hundreds-thousands', 'round-thousands', 3, {
    prompt: 'დაამრგვალე {n} უახლოეს ათასეულამდე: შეეხე უახლოეს ათასეულს ღერძზე.',
    variables: { n: int(1001, 9999) },
    constraints: [{ test: (v) => num(v, 'n') % 1000 !== 0, note: 'არა ათასეული' }],
    pictures: (v) => [linePic(Math.floor(num(v, 'n') / 1000) * 1000, Math.floor(num(v, 'n') / 1000) * 1000 + 1000, 100, num(v, 'n'))],
    interaction: (v) => ({ kind: 'line', min: Math.floor(num(v, 'n') / 1000) * 1000, max: Math.floor(num(v, 'n') / 1000) * 1000 + 1000, step: 1000, labelEvery: 1 }),
    answer: (v) => Math.round(num(v, 'n') / 1000) * 1000,
    explanation: ({ answer, vars }) => `${vars.n} უფრო ახლოსაა ${answer}-თან.`,
  }),
  u09('u09-word-problems-rounding', 'price', 1, {
    prompt: 'წიგნი ღირს {n} ლარი. დაამრგვალე ფასი უახლოეს ათეულამდე: შეეხე შედეგს ღერძზე.',
    variables: { n: int(11, 98) },
    constraints: [{ test: (v) => num(v, 'n') % 10 !== 0, note: 'არა ათეული' }],
    interaction: (v) => ({ kind: 'line', min: Math.floor(num(v, 'n') / 10) * 10, max: Math.floor(num(v, 'n') / 10) * 10 + 10, start: num(v, 'n'), labelEvery: 5, unit: 'ლარი' }),
    answer: (v) => Math.round(num(v, 'n') / 10) * 10,
    explanation: ({ answer, vars }) => `${vars.n} ლარი დაახლოებით ${answer} ლარია.`,
  }),
];

/* ------------------------------------------------------------ U10 */
const u10 = T('g3-gazomva-geometria', 'u10');
const ANGLES = ['20', '30', '40', '45', '50', '60', '70', '80', '90', '100', '110', '120', '130', '135', '140', '150', '160'];
const kindOf = (deg: number): number => (deg < 90 ? 0 : deg === 90 ? 1 : 2);
const U10: QuestionTemplate[] = [
  u10('u10-thermometers-units', 'read', 2, {
    prompt: 'რამდენ გრადუსს აჩვენებს თერმომეტრი? შეეხე შესაბამის დანაყოფს.',
    variables: { h: int(2, 19), t: derived((v) => num(v, 'h') * 2) },
    interaction: (v) => ({ kind: 'line', min: 0, max: 40, step: 2, style: 'thermo', bar: num(v, 't'), unit: '°C', labelEvery: 2 }),
    answer: (v) => num(v, 't'),
    explanation: ({ vars }) => `წითელი სვეტი ${vars.t}°C-ზეა.`,
  }),
  u10('u10-ruler-applications', 'read-length', 1, {
    prompt: 'რამდენი სანტიმეტრია ფანქრის სიგრძე? შეეხე სახაზავზე იმ ნიშნულს, სადაც ფანქარი მთავრდება.',
    variables: { n: int(3, 19) },
    interaction: (v) => ({ kind: 'line', min: 0, max: 20, style: 'ruler', bar: num(v, 'n'), barIcon: 'pencil', unit: 'სმ' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `ფანქარი ${vars.n} სმ-ზე მთავრდება.`,
  }),
  u10('u10-angle-classification', 'set-angle', 1, {
    prompt: 'გახსენი კუთხე {deg} გრადუსამდე.',
    variables: { deg: pick(...ANGLES) },
    interaction: () => ({ kind: 'angle', step: 5 }),
    answer: (v) => num(v, 'deg'),
    explanation: ({ vars }) => `ისარი ${vars.deg}°-ზე უნდა გაჩერდეს.`,
  }),
  u10('u10-angle-classification', 'right-acute-obtuse', 2, {
    prompt: 'ჩადე თითოეული კუთხე სწორ ყუთში: მახვილი, მართი ან ბლაგვი.',
    variables: { a1: int(2, 17, { step: 1 }), a2: int(2, 17), o1: int(19, 35), o2: int(19, 35), rot: int(0, 4) },
    constraints: [distinct('a1', 'a2'), distinct('o1', 'o2')],
    interaction: (v) => ({ kind: 'bins', bins: ['მახვილი', 'მართი', 'ბლაგვი'], items: angleItems(v).map((d) => ({ label: `${d}°` })) }),
    answer: (v) => angleItems(v).map(kindOf).join(','),
    explanation: () => '90°-ზე ნაკლები კუთხე მახვილია, 90° — მართი, 90°-ზე მეტი — ბლაგვი.',
  }),
  u10('u10-perimeter-calculations', 'grid-perimeter', 2, {
    prompt: 'ბადეს {r} რიგი აქვს. რამდენი სვეტი უნდა ჰქონდეს, რომ პერიმეტრი {p} იყოს?',
    variables: { r: int(2, 6), c: int(2, 8), p: derived((v) => 2 * (num(v, 'r') + num(v, 'c'))) },
    interaction: (v) => ({ kind: 'array', maxRows: 9, maxCols: 12, fixedRows: num(v, 'r'), output: 'perimeter' }),
    answer: (v) => num(v, 'p'),
    explanation: ({ vars }) => `პერიმეტრი = 2 × (${vars.r} + ${vars.c}) = ${vars.p}.`,
  }),
];
function angleItems(v: Vars): number[] {
  const list = [num(v, 'a1') * 5, num(v, 'o1') * 5, 90, num(v, 'a2') * 5, num(v, 'o2') * 5];
  const r = num(v, 'rot');
  return [...list.slice(r), ...list.slice(0, r)];
}

/* ------------------------------------------------------------ U11 */
const u11 = T('g3-fuli', 'u11');
const U11: QuestionTemplate[] = [
  u11('u11-counting-tetri-lari', 'pay', 1, {
    prompt: 'ჩაიდე ყულაბაში ზუსტად {n} თეთრი.',
    variables: { n: int(21, 199) },
    interaction: () => ({ kind: 'purse', coins: COINS, output: 'total' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `მონეტების ჯამი ${vars.n} თეთრი უნდა იყოს.`,
  }),
  u11('u11-money-operations', 'change', 2, {
    prompt: 'ნივთი ღირს {p} თეთრი. გადაიხადე 100 თეთრი. ჩაიდე ხურდა, რომელიც უნდა დაგიბრუნონ.',
    variables: { p: int(11, 95) },
    interaction: () => ({ kind: 'purse', coins: COINS, output: 'total' }),
    answer: (v) => 100 - num(v, 'p'),
    explanation: ({ vars }) => `100 − ${vars.p} = ${100 - Number(vars.p)}.`,
  }),
  u11('u11-money-word-problems', 'fewest', 3, {
    prompt: 'შეადგინე {n} თეთრი ყველაზე ცოტა მონეტით.',
    variables: { n: int(31, 199) },
    constraints: [{ test: (v) => minCoins(num(v, 'n')) >= 4, note: 'არა მარტივი' }],
    interaction: () => ({ kind: 'purse', coins: COINS, output: 'totalCount' }),
    answer: (v) => `${num(v, 'n')}/${minCoins(num(v, 'n'))}`,
    explanation: ({ vars }) => `${vars.n} თეთრი ${minCoins(Number(vars.n))} მონეტით იკრიბება: დაიწყე უდიდესი მონეტით.`,
  }),
  u11('u11-counting-tetri-lari', 'two-prices', 2, {
    prompt: 'ორი ნივთი ღირს {p} და {q} თეთრი. ჩაიდე ყულაბაში ორივეს ფასი.',
    variables: { p: int(11, 70), q: int(11, 70) },
    interaction: () => ({ kind: 'purse', coins: COINS, output: 'total' }),
    answer: (v) => num(v, 'p') + num(v, 'q'),
    explanation: ({ vars }) => `${vars.p} + ${vars.q} = ${Number(vars.p) + Number(vars.q)}.`,
  }),
];

/* ------------------------------------------------------------ U12 */
const u12 = T('g3-monacemebi-albatoba', 'u12');
const U12: QuestionTemplate[] = [
  u12('u12-diagrams-pictograms-dotplots', 'bars', 2, {
    prompt: 'მოსწავლეებმა ხილი აირჩიეს: ვაშლი — {a}, მსხალი — {b}, ბანანი — {c}. ააგე სვეტოვანი დიაგრამა.',
    variables: { a: int(1, 8), b: int(1, 8), c: int(1, 8) },
    interaction: () => ({ kind: 'counters', style: 'bars', labels: ['ვაშლი', 'მსხალი', 'ბანანი'], icon: 'sq-red', max: 8 }),
    answer: (v) => `${num(v, 'a')},${num(v, 'b')},${num(v, 'c')}`,
    explanation: ({ vars }) => `სვეტების სიმაღლეებია ${vars.a}, ${vars.b} და ${vars.c}.`,
  }),
  u12('u12-diagrams-pictograms-dotplots', 'pictogram', 2, {
    prompt: 'ერთი ⭐ ნიშნავს 2 წიგნს. წიგნები: ზღაპრები — {a}, ენციკლოპედია — {b}. ააგე პიქტოგრამა: რამდენი ვარსკვლავი უნდა დაიხატოს?',
    variables: { x: int(1, 6), y: int(1, 6), a: derived((v) => num(v, 'x') * 2), b: derived((v) => num(v, 'y') * 2) },
    interaction: () => ({ kind: 'counters', style: 'icons', labels: ['ზღაპრები', 'ენციკლოპედია'], icon: 'star', max: 6, per: 2 }),
    answer: (v) => `${num(v, 'x')},${num(v, 'y')}`,
    explanation: ({ vars }) => `${vars.a} ÷ 2 = ${vars.x}, ${vars.b} ÷ 2 = ${vars.y}.`,
  }),
  u12('u12-gathering-grouping-data', 'tally', 1, {
    prompt: 'კლასში {a} ბიჭი და {b} გოგოა. ჩაწერე მონაცემები ტალის ნიშნებით.',
    variables: { a: int(3, 12), b: int(3, 12) },
    interaction: () => ({ kind: 'counters', style: 'tally', labels: ['ბიჭები', 'გოგოები'], icon: 'dot-blue', max: 15 }),
    answer: (v) => `${num(v, 'a')},${num(v, 'b')}`,
    explanation: ({ vars }) => `${vars.a} და ${vars.b} ტალის ნიშანი.`,
  }),
];

/* ------------------------------------------------------------ U13 */
const u13 = T('g3-dro-kalendari', 'u13');
const clockWord = (h: number, m: number): string => `${h}:${String(m).padStart(2, '0')}`;
const endOf = (h: number, m: number, d: number): { h: number; m: number } => {
  const t = h * 60 + m + d;
  return { h: Math.floor(t / 60) % 12 || 12, m: t % 60 };
};
const firstOf = (o: number, w: number): number => 1 + ((w - o + 7) % 7);
const lastOf = (o: number, w: number): number => firstOf(o, w) + 7 * Math.floor((30 - firstOf(o, w)) / 7);
const U13: QuestionTemplate[] = [
  u13('u13-time-sequences-comparisons', 'set-time', 1, {
    prompt: 'დააყენე საათის ისრები ისე, რომ საათმა აჩვენოს {h}:{m}.',
    variables: { h: int(1, 12), m: pick('00', '15', '30', '45') },
    interaction: () => ({ kind: 'clock' }),
    answer: (v) => hhmm(num(v, 'h'), num(v, 'm')),
    time: true,
    explanation: ({ vars }) => `${vars.h}:${vars.m}.`,
  }),
  u13('u13-time-sequences-comparisons', 'set-five', 2, {
    prompt: 'დააყენე საათის ისრები ისე, რომ საათმა აჩვენოს {h}:{mm}.',
    variables: { h: int(1, 12), m: int(1, 11), mm: derived((v) => String(num(v, 'm') * 5).padStart(2, '0')) },
    interaction: () => ({ kind: 'clock' }),
    answer: (v) => hhmm(num(v, 'h'), num(v, 'm') * 5),
    time: true,
    explanation: ({ vars }) => `${vars.h}:${vars.mm}.`,
  }),
  u13('u13-elapsed-time-problems', 'end-time', 2, {
    prompt: 'ვარჯიში {start}-ზე დაიწყო და {d} წუთი გაგრძელდა. დააყენე საათზე დასრულების დრო.',
    variables: { h: int(1, 12), m: pick(0, 15, 30, 45), d: pick(15, 30, 45, 60, 75, 90), start: derived((v) => clockWord(num(v, 'h'), num(v, 'm'))) },
    interaction: () => ({ kind: 'clock' }),
    answer: (v) => {
      const e = endOf(num(v, 'h'), num(v, 'm'), num(v, 'd'));
      return hhmm(e.h, e.m);
    },
    time: true,
    explanation: ({ vars }) => `${vars.start} + ${vars.d} წუთი.`,
  }),
  u13('u13-calendar-unit-relations', 'calendar', 2, {
    prompt: 'თვის 1 რიცხვი {first} არის. იპოვე ამ თვის {ord} „{day}“ და შეეხე მის რიცხვს.',
    variables: {
      o: int(0, 6),
      k: int(1, 3),
      ord: derived((v) => ORDINALS[num(v, 'k') - 1]!),
      w: int(0, 6),
      first: derived((v) => WEEKDAY_NAMES[num(v, 'o')]!),
      day: derived((v) => WEEKDAY_NAMES[num(v, 'w')]!),
    },
    interaction: (v) => ({ kind: 'chart', from: 1, to: 30, cols: 7, heads: WEEKDAY_SHORT, offset: num(v, 'o') }),
    answer: (v) => 1 + ((num(v, 'w') - num(v, 'o') + 7) % 7) + 7 * (num(v, 'k') - 1),
    explanation: ({ vars }) => `პირველი ${vars.day} არის ${1 + ((Number(vars.w) - Number(vars.o) + 7) % 7)}-ში; შემდეგი — 7 დღის შემდეგ.`,
  }),
  u13('u13-calendar-unit-relations', 'last-weekday', 3, {
    prompt: '{month} 30 დღისაა და მისი 1 რიცხვი {first} არის. იპოვე ამ თვის ბოლო „{day}“ და შეეხე მის რიცხვს.',
    variables: { o: int(0, 6), w: int(0, 6), mi: pick(3, 5, 8, 10), month: derived((v) => MONTH_NAMES[num(v, 'mi')]!), first: derived((v) => WEEKDAY_NAMES[num(v, 'o')]!), day: derived((v) => WEEKDAY_NAMES[num(v, 'w')]!) },
    interaction: (v) => ({ kind: 'chart', from: 1, to: 30, cols: 7, heads: WEEKDAY_SHORT, offset: num(v, 'o') }),
    answer: (v) => lastOf(num(v, 'o'), num(v, 'w')),
    explanation: ({ vars }) => `ბოლო ${vars.day} ${lastOf(Number(vars.o), Number(vars.w))} რიცხვია.`,
  }),
];

/* ------------------------------------------------------------ U14 */
const u14 = T('g3-kanonzomiereba-logika', 'u14');
const U14: QuestionTemplate[] = [
  u14('u14-illustrated-patterns', 'continue', 1, {
    prompt: 'გააგრძელე კანონზომიერება: აირჩიე სამი შემდეგი ფიგურა.',
    variables: { pat: pick('AB', 'AAB', 'ABB', 'ABC', 'AABB', 'ABCD'), x: int(0, 7), y: int(0, 7), z: int(0, 7), w: int(0, 7) },
    constraints: [distinct('x', 'y', 'z', 'w')],
    interaction: (v) => {
      const s = patternSeq(str(v, 'pat'), [num(v, 'x'), num(v, 'y'), num(v, 'z'), num(v, 'w')]);
      return { kind: 'sequence', shown: s.shown, palette: s.palette, length: 3 };
    },
    answer: (v) => patternSeq(str(v, 'pat'), [num(v, 'x'), num(v, 'y'), num(v, 'z'), num(v, 'w')]).next.join(','),
    explanation: ({ vars }) => `კანონზომიერება მეორდება: ${vars.pat}.`,
  }),
  u14('u14-sorting-largest-smallest', 'tap-extreme', 1, {
    prompt: 'შეეხე {which} რიცხვს: {a}, {b}, {c}, {d}.',
    variables: { a: int(100, 999), b: int(100, 999), c: int(100, 999), d: int(100, 999), which: pick('უდიდეს', 'უმცირეს') },
    constraints: [distinct(...four)],
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: four.map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) => {
      const xs = four.map((k) => num(v, k));
      return xs.indexOf(str(v, 'which') === 'უდიდეს' ? Math.max(...xs) : Math.min(...xs)) + 1;
    },
    explanation: ({ vars }) => `ჯერ ასეულებს შეადარე, მერე ათეულებს — ${vars.which}ი რიცხვი ერთია.`,
  }),
  u14('u14-number-sequences-triangles', 'next-on-chart', 2, {
    prompt: 'იპოვე შემდეგი რიცხვი: {a}, {b}, {c}, ? — შეეხე მას ასეულის ცხრილში.',
    variables: { a: int(1, 30), d: int(3, 9), b: derived((v) => num(v, 'a') + num(v, 'd')), c: derived((v) => num(v, 'a') + 2 * num(v, 'd')) },
    constraints: [{ test: (v) => num(v, 'a') + 3 * num(v, 'd') <= 100, note: 'ცხრილში ეტევა' }],
    interaction: () => ({ kind: 'chart', from: 1, to: 100, cols: 10 }),
    answer: (v) => num(v, 'a') + 3 * num(v, 'd'),
    explanation: ({ vars }) => `ყოველ ნაბიჯზე ემატება ${vars.d}: ${Number(vars.a) + 3 * Number(vars.d)}.`,
  }),
];

/* ------------------------------------------------------------ U15 */
const u15 = T('g3-wiladebi-shesavali', 'u15');
const U15: QuestionTemplate[] = [
  u15('u15-parts-of-a-whole', 'shade', 1, {
    prompt: 'ფიგურა {n} ტოლ ნაწილადაა გაყოფილი. გააფერადე მისი {k}/{n}.',
    variables: { n: pick(2, 3, 4, 5, 6, 8, 10), k: int(1, 9), shape: pick('bar', 'circle') },
    constraints: [{ test: (v) => num(v, 'k') < num(v, 'n'), note: 'k<n' }, { test: (v) => str(v, 'shape') === 'bar' || num(v, 'n') <= 8, note: 'წრე ≤ 8' }],
    interaction: (v) => ({ kind: 'fill', shape: str(v, 'shape') as 'bar' | 'circle', total: num(v, 'n') }),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${vars.k}/${vars.n} ნიშნავს ${vars.k} ნაწილს ${vars.n}-დან.`,
  }),
  u15('u15-parts-of-a-whole', 'tap-fraction', 2, {
    prompt: 'მონაკვეთი 0-დან 1-მდე {n} ტოლ ნაწილადაა გაყოფილი. შეეხე წერტილს {k}/{n}.',
    variables: { n: pick(2, 3, 4, 5, 6, 8, 10), k: int(1, 9) },
    constraints: [{ test: (v) => num(v, 'k') < num(v, 'n'), note: 'k<n' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'n'), format: 'frac', den: num(v, 'n') }),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${vars.k}/${vars.n} არის ${vars.k}-ე დანაყოფი ნულიდან.`,
  }),
  u15('u15-equal-parts-halves', 'half-of', 2, {
    prompt: 'რიგში {a} {noun} არის. გააფერადე მათი ნახევარი.',
    variables: { ...objectVars(), h: int(2, 10), a: derived((v) => num(v, 'h') * 2) },
    interaction: (v) => ({ kind: 'fill', shape: 'row', total: num(v, 'a'), icon: str(v, 'obj'), noun: str(v, 'noun') }),
    answer: (v) => num(v, 'h'),
    explanation: ({ vars }) => `${vars.a}-ის ნახევარია ${vars.h}.`,
  }),
  u15('u15-thirds-and-quarters', 'third-of', 2, {
    prompt: 'რიგში {a} {noun} არის. გააფერადე მათი მესამედი.',
    variables: { ...objectVars(), h: int(2, 6), a: derived((v) => num(v, 'h') * 3) },
    interaction: (v) => ({ kind: 'fill', shape: 'row', total: num(v, 'a'), icon: str(v, 'obj'), noun: str(v, 'noun') }),
    answer: (v) => num(v, 'h'),
    explanation: ({ vars }) => `${vars.a}-ის მესამედია ${vars.h}.`,
  }),
  u15('u15-thirds-and-quarters', 'quarter-of', 3, {
    prompt: 'რიგში {a} {noun} არის. გააფერადე მათი მეოთხედი.',
    variables: { ...objectVars(), h: int(2, 5), a: derived((v) => num(v, 'h') * 4) },
    interaction: (v) => ({ kind: 'fill', shape: 'row', total: num(v, 'a'), icon: str(v, 'obj'), noun: str(v, 'noun') }),
    answer: (v) => num(v, 'h'),
    explanation: ({ vars }) => `${vars.a}-ის მეოთხედია ${vars.h}.`,
  }),
];

export const G3_INTERACTIVE_TEMPLATES: QuestionTemplate[] = [
  ...U01, ...U02, ...U03, ...U04, ...U05, ...U06, ...U07, ...U08, ...U09, ...U10, ...U11, ...U12, ...U13, ...U14, ...U15,
];
