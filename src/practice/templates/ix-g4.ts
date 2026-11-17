/**
 * Grade IV — interactive templates.
 *
 * Numbers are built column by column, rounded on a number line, compared with
 * signs, ordered with cards. Rectangles grow square by square to show products,
 * quotients, perimeter and area; angles are opened; clocks are set; fractions
 * and decimals are shaded and found on number lines; data becomes bars, tallies
 * and pictograms; coins go into a purse.
 */
import type { QuestionTemplate } from './types';
import { MONTH_NAMES, derived, distinct, hhmm, int, interactiveSet, num, pick, str } from './ix-kit';
import { SIGNS, WEEKDAY_SHORT, isPrime, linePic, minCoins, rotate, roman, signOf, tenths } from './ix-kit34';

const T = (topicId: string, unit: string) => interactiveSet(4, topicId, `g4-ix-${unit}`);
const place = (digits: number) => (): { kind: 'place'; digits: number } => ({ kind: 'place', digits });
const COINS = [1, 2, 5, 10, 20, 50];
const five = ['a', 'b', 'c', 'd', 'e'];
const lo = (n: number, unit: number): number => Math.floor(n / unit) * unit;
const roundTo = (n: number, unit: number): number => Math.round(n / unit) * unit;

/* ------------------------------------------------------------ U01 */
const u01 = T('g4-ricxvebi-sistemebi', 'u01');
const U01: QuestionTemplate[] = [
  u01('u01-rounding', 'tens', 1, {
    prompt: 'დაამრგვალე {n} უახლოეს ათეულამდე: შეეხე უახლოეს ათეულს ღერძზე.',
    variables: { n: int(1011, 9989) },
    constraints: [{ test: (v) => num(v, 'n') % 10 !== 0, note: 'არა ათეული' }],
    interaction: (v) => ({ kind: 'line', min: lo(num(v, 'n'), 10), max: lo(num(v, 'n'), 10) + 10, start: num(v, 'n'), labelEvery: 5 }),
    answer: (v) => roundTo(num(v, 'n'), 10),
    explanation: ({ answer, vars }) => `${vars.n} უფრო ახლოსაა ${answer}-თან.`,
  }),
  u01('u01-rounding', 'hundreds', 2, {
    prompt: 'დაამრგვალე {n} უახლოეს ასეულამდე: შეეხე უახლოეს ასეულს ღერძზე.',
    variables: { n: int(1101, 9899) },
    constraints: [{ test: (v) => num(v, 'n') % 100 !== 0, note: 'არა ასეული' }],
    pictures: (v) => [linePic(lo(num(v, 'n'), 100), lo(num(v, 'n'), 100) + 100, 10, num(v, 'n'))],
    interaction: (v) => ({ kind: 'line', min: lo(num(v, 'n'), 100), max: lo(num(v, 'n'), 100) + 100, step: 100, labelEvery: 1 }),
    answer: (v) => roundTo(num(v, 'n'), 100),
    explanation: ({ answer, vars }) => `${vars.n} უფრო ახლოსაა ${answer}-თან.`,
  }),
  u01('u01-rounding', 'thousands', 2, {
    prompt: 'დაამრგვალე {n} უახლოეს ათასეულამდე: შეეხე უახლოეს ათასეულს ღერძზე.',
    variables: { n: int(10001, 98999) },
    constraints: [{ test: (v) => num(v, 'n') % 1000 !== 0, note: 'არა ათასეული' }],
    pictures: (v) => [linePic(lo(num(v, 'n'), 1000), lo(num(v, 'n'), 1000) + 1000, 100, num(v, 'n'))],
    interaction: (v) => ({ kind: 'line', min: lo(num(v, 'n'), 1000), max: lo(num(v, 'n'), 1000) + 1000, step: 1000, labelEvery: 1 }),
    answer: (v) => roundTo(num(v, 'n'), 1000),
    explanation: ({ answer, vars }) => `${vars.n} უფრო ახლოსაა ${answer}-თან.`,
  }),
  u01('u01-compare-million', 'sign', 1, {
    prompt: 'შეადარე რიცხვები და აირჩიე ნიშანი.',
    variables: { a: int(10000, 99999), b: int(10000, 99999) },
    interaction: (v) => ({ kind: 'slots', tokens: [String(num(v, 'a')), '?', String(num(v, 'b'))], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a'), num(v, 'b')),
    explanation: ({ vars }) => `ჯერ შეადარე უმაღლესი თანრიგები: ${vars.a} და ${vars.b}.`,
  }),
  u01('u01-digit-counting', 'extreme-k-digit', 2, {
    prompt: 'ააგე {which} {k}-ნიშნა რიცხვი.',
    variables: {
      k: int(3, 6),
      kind: int(0, 3),
      which: derived((v) => ['უდიდესი', 'უმცირესი', 'უდიდესი ლუწი', 'უმცირესი კენტი'][num(v, 'kind')]!),
      n: derived((v) => [10 ** num(v, 'k') - 1, 10 ** (num(v, 'k') - 1), 10 ** num(v, 'k') - 2, 10 ** (num(v, 'k') - 1) + 1][num(v, 'kind')]!),
    },
    interaction: place(6),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.which} ${vars.k}-ნიშნა რიცხვია ${vars.n}.`,
  }),
  u01('u01-extreme-values', 'cards', 2, {
    prompt: 'ბარათებით {a}, {b} და {c} ჩაწერე {which} სამნიშნა რიცხვი (თითოეული ბარათი ერთხელ).',
    variables: { a: int(1, 9), b: int(1, 9), c: int(1, 9), which: pick('უდიდესი', 'უმცირესი') },
    constraints: [distinct('a', 'b', 'c')],
    interaction: (v) => ({ kind: 'tiles', cards: [num(v, 'a'), num(v, 'b'), num(v, 'c')].map(String), slots: 3 }),
    answer: (v) => {
      const d = [num(v, 'a'), num(v, 'b'), num(v, 'c')].sort((x, y) => (str(v, 'which') === 'უდიდესი' ? y - x : x - y));
      return d.join('');
    },
    text: true,
    options: (v) => {
      const d = [num(v, 'a'), num(v, 'b'), num(v, 'c')];
      return [[...d].sort((x, y) => (str(v, 'which') === 'უდიდესი' ? y - x : x - y)).join(''), [...d].sort((x, y) => (str(v, 'which') === 'უდიდესი' ? x - y : y - x)).join('')];
    },
    explanation: ({ vars }) => `${vars.which} რიცხვში ${vars.which === 'უდიდესი' ? 'უდიდესი' : 'უმცირესი'} ციფრი დასაწყისშია.`,
  }),
  u01('u01-prime-composite', 'sort', 2, {
    prompt: 'ჩადე რიცხვები სწორ ყუთში: მარტივი თუ შედგენილი.',
    variables: { a: int(2, 50), b: int(2, 50), c: int(2, 50), d: int(2, 50), e: int(2, 50) },
    constraints: [distinct(...five), { test: (v) => five.some((k) => isPrime(num(v, k))) && five.some((k) => !isPrime(num(v, k))), note: 'ორივე სახეობა' }],
    interaction: (v) => ({ kind: 'bins', bins: ['მარტივი', 'შედგენილი'], items: five.map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) => five.map((k) => (isPrime(num(v, k)) ? 0 : 1)).join(','),
    explanation: () => 'მარტივ რიცხვს მხოლოდ ორი გამყოფი აქვს: 1 და თავისი თავი.',
  }),
  u01('u01-even-odd', 'sort-2', 1, {
    prompt: 'ჩადე რიცხვები სწორ ყუთში: ლუწი თუ კენტი.',
    variables: { a: int(1000, 99999), b: int(1000, 99999), c: int(1000, 99999), d: int(1000, 99999), e: int(1000, 99999) },
    constraints: [distinct(...five), { test: (v) => five.some((k) => num(v, k) % 2 === 0) && five.some((k) => num(v, k) % 2 === 1), note: 'ორივე სახეობა' }],
    interaction: (v) => ({ kind: 'bins', bins: ['ლუწი', 'კენტი'], items: five.map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) => five.map((k) => (num(v, k) % 2 === 0 ? 0 : 1)).join(','),
    explanation: () => 'რიცხვის ლუწობას მხოლოდ ბოლო ციფრი განსაზღვრავს.',
  }),
  u01('u01-multiply-tens', 'place-tens', 1, {
    prompt: 'გამოთვალე {a} × {m} და ააგე შედეგი თანრიგებით.',
    variables: { a: int(11, 99), m: pick(10, 100) },
    interaction: place(5),
    answer: (v) => num(v, 'a') * num(v, 'm'),
    explanation: ({ vars }) => `${vars.a} × ${vars.m} = ${Number(vars.a) * Number(vars.m)}.`,
  }),
  u01('u01-operations', 'place-sum', 2, {
    prompt: 'გამოთვალე {a} + {b} და ააგე შედეგი თანრიგებით.',
    variables: { a: int(1000, 8999), b: int(1000, 8999) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') < 100000, note: '5 ციფრი' }],
    interaction: place(5),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u01('u01-dates', 'calendar', 1, {
    prompt: 'დღეს {m} {d}-ია. შეეხე თარიღს {k} დღის შემდეგ.',
    variables: { mi: pick(0, 2, 4, 6, 7, 9, 11), m: derived((v) => MONTH_NAMES[num(v, 'mi')]!), d: int(1, 20), k: int(2, 9), o: int(0, 6) },
    interaction: (v) => ({ kind: 'chart', from: 1, to: 31, cols: 7, heads: WEEKDAY_SHORT, offset: num(v, 'o') }),
    answer: (v) => num(v, 'd') + num(v, 'k'),
    explanation: ({ vars }) => `${vars.d} + ${vars.k} = ${Number(vars.d) + Number(vars.k)}.`,
  }),
  u01('u01-roman-numerals', 'pick-roman', 2, {
    prompt: 'შეეხე რიცხვ {n}-ის რომაულ ჩანაწერს.',
    variables: { n: int(4, 39), slot: int(0, 3) },
    interaction: (v) => {
      const n = num(v, 'n');
      const wrong = [roman(n + 1), roman(n - 1), roman(n + 5)].filter((r) => r !== roman(n));
      const list = [...new Set(wrong)].slice(0, 3);
      list.splice(Math.min(num(v, 'slot'), list.length), 0, roman(n));
      return { kind: 'pick', mode: 'one', items: list.map((label) => ({ label })) };
    },
    answer: (v) => {
      const n = num(v, 'n');
      const wrong = [...new Set([roman(n + 1), roman(n - 1), roman(n + 5)].filter((r) => r !== roman(n)))].slice(0, 3);
      return Math.min(num(v, 'slot'), wrong.length) + 1;
    },
    explanation: ({ vars }) => `${vars.n} = ${roman(Number(vars.n))}.`,
  }),
];

/* ------------------------------------------------------------ U02 */
const u02 = T('g4-shekreba-gamokleba', 'u02');
const U02: QuestionTemplate[] = [
  u02('u02-expanded-form', 'build-4', 1, {
    prompt: 'ააგე რიცხვი: {th} ათასი + {h} ასეული + {t} ათეული + {o} ერთეული.',
    variables: { th: int(1, 9), h: int(0, 9), t: int(0, 9), o: int(0, 9) },
    interaction: place(4),
    answer: (v) => num(v, 'th') * 1000 + num(v, 'h') * 100 + num(v, 't') * 10 + num(v, 'o'),
    explanation: ({ vars }) => `${Number(vars.th) * 1000} + ${Number(vars.h) * 100} + ${Number(vars.t) * 10} + ${vars.o}.`,
  }),
  u02('u02-expanded-form', 'build-5', 2, {
    prompt: 'ააგე რიცხვი: {ta} ათი ათასი + {th} ათასი + {h} ასეული + {t} ათეული + {o} ერთეული.',
    variables: { ta: int(1, 9), th: int(0, 9), h: int(0, 9), t: int(0, 9), o: int(0, 9) },
    interaction: place(5),
    answer: (v) => num(v, 'ta') * 10000 + num(v, 'th') * 1000 + num(v, 'h') * 100 + num(v, 't') * 10 + num(v, 'o'),
    explanation: ({ vars }) => `ციფრები თანრიგებში: ${vars.ta}, ${vars.th}, ${vars.h}, ${vars.t}, ${vars.o}.`,
  }),
  u02('u02-estimate-sum', 'place-estimate', 2, {
    prompt: 'დაამრგვალე თითოეული შესაკრები უახლოეს ათასეულამდე და ააგე მიახლოებითი ჯამი: {a} + {b}.',
    variables: { a: int(1100, 9400), b: int(1100, 9400) },
    constraints: [{ test: (v) => num(v, 'a') % 1000 !== 500 && num(v, 'b') % 1000 !== 500 && num(v, 'a') % 1000 !== 0 && num(v, 'b') % 1000 !== 0, note: 'არა შუა' }],
    interaction: place(5),
    answer: (v) => roundTo(num(v, 'a'), 1000) + roundTo(num(v, 'b'), 1000),
    explanation: ({ vars, answer }) => `${roundTo(Number(vars.a), 1000)} + ${roundTo(Number(vars.b), 1000)} = ${answer}.`,
  }),
  u02('u02-estimate-diff', 'place-estimate-2', 2, {
    prompt: 'დაამრგვალე ორივე რიცხვი უახლოეს ათასეულამდე და ააგე მიახლოებითი სხვაობა: {a} − {b}.',
    variables: { a: int(5100, 9400), b: int(1100, 4400) },
    constraints: [{ test: (v) => num(v, 'a') % 1000 !== 500 && num(v, 'b') % 1000 !== 500 && num(v, 'a') % 1000 !== 0 && num(v, 'b') % 1000 !== 0, note: 'არა შუა' }],
    interaction: place(4),
    answer: (v) => roundTo(num(v, 'a'), 1000) - roundTo(num(v, 'b'), 1000),
    explanation: ({ vars, answer }) => `${roundTo(Number(vars.a), 1000)} − ${roundTo(Number(vars.b), 1000)} = ${answer}.`,
  }),
  u02('u02-estimate-word-problems', 'books', 2, {
    prompt: 'ბიბლიოთეკაში {a} ქართული და {b} უცხოური წიგნია. დაამრგვალე ათასეულებამდე და ააგე მიახლოებითი საერთო რაოდენობა.',
    variables: { a: int(10100, 19400), b: int(1100, 9400) },
    constraints: [{ test: (v) => num(v, 'a') % 1000 !== 500 && num(v, 'b') % 1000 !== 500 && num(v, 'a') % 1000 !== 0 && num(v, 'b') % 1000 !== 0, note: 'არა შუა' }],
    interaction: place(5),
    answer: (v) => roundTo(num(v, 'a'), 1000) + roundTo(num(v, 'b'), 1000),
    explanation: ({ vars, answer }) => `${roundTo(Number(vars.a), 1000)} + ${roundTo(Number(vars.b), 1000)} = ${answer}.`,
  }),
  u02('u02-addition-million', 'place-sum', 2, {
    prompt: 'გამოთვალე {a} + {b} და ააგე შედეგი თანრიგებით.',
    variables: { a: int(10000, 59999), b: int(10000, 39999) },
    interaction: place(6),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u02('u02-subtraction-million', 'place-diff', 2, {
    prompt: 'გამოთვალე {a} − {b} და ააგე შედეგი თანრიგებით.',
    variables: { a: int(50000, 99999), b: int(10000, 49999) },
    interaction: place(5),
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}.`,
  }),
  u02('u02-related-operations', 'times-ten', 3, {
    prompt: 'თუ {a} + {b} = {s}, მაშინ ააგე {a0} + {b0}.',
    variables: { a: int(100, 480), b: int(100, 480), s: derived((v) => num(v, 'a') + num(v, 'b')), a0: derived((v) => num(v, 'a') * 10), b0: derived((v) => num(v, 'b') * 10) },
    interaction: place(5),
    answer: (v) => num(v, 's') * 10,
    explanation: ({ vars }) => `ორივე შესაკრები 10-ჯერ მეტია, ამიტომ ჯამიც 10-ჯერ მეტია: ${Number(vars.s) * 10}.`,
  }),
];

/* ------------------------------------------------------------ U03 */
const u03 = T('g4-gamravleba', 'u03');
const U03: QuestionTemplate[] = [
  u03('u03-written-single-digit', 'place', 1, {
    prompt: 'გამოთვალე {a} × {b} და ააგე ნამრავლი თანრიგებით.',
    variables: { a: int(112, 999), b: int(2, 9) },
    interaction: place(4),
    answer: (v) => num(v, 'a') * num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}.`,
  }),
  u03('u03-multiply-ending-zeros', 'place-2', 1, {
    prompt: 'გამოთვალე {a} × {b} და ააგე ნამრავლი თანრიგებით.',
    variables: { a: int(2, 9), b: int(2, 9), x: derived((v) => num(v, 'a') * 10), y: derived((v) => num(v, 'b')) },
    interaction: place(3),
    answer: (v) => num(v, 'x') * num(v, 'y'),
    explanation: ({ vars }) => `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}, ამიტომ ${vars.x} × ${vars.y} = ${Number(vars.x) * Number(vars.y)}.`,
  }),
  u03('u03-written-multi-digit', 'place-3', 2, {
    prompt: 'გამოთვალე {a} × {b} და ააგე ნამრავლი თანრიგებით.',
    variables: { a: int(12, 99), b: int(11, 49) },
    interaction: place(4),
    answer: (v) => num(v, 'a') * num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}.`,
  }),
  u03('u03-multiplication-table-12', 'grid', 2, {
    prompt: 'ბადეს {r} რიგი აქვს. რამდენი სვეტი უნდა ჰქონდეს, რომ სულ {n} კვადრატი იყოს?',
    variables: { r: int(3, 12), c: int(3, 12), n: derived((v) => num(v, 'r') * num(v, 'c')) },
    interaction: (v) => ({ kind: 'array', maxRows: 12, maxCols: 12, fixedRows: num(v, 'r'), output: 'count' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.r} = ${vars.c}.`,
  }),
  u03('u03-unknown-factor', 'grid-2', 2, {
    prompt: '□ × {c} = {n}. ააგე ბადე, რომლის ყოველ რიგში {c} კვადრატია, და იპოვე რამდენი რიგი გჭირდება.',
    variables: { r: int(3, 12), c: int(3, 12), n: derived((v) => num(v, 'r') * num(v, 'c')) },
    interaction: (v) => ({ kind: 'array', maxRows: 12, maxCols: 12, fixedCols: num(v, 'c'), output: 'count' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.c} = ${vars.r}.`,
  }),
  u03('u03-table-fill-drag', 'tiles', 2, {
    prompt: 'შეავსე ნამრავლები ბარათებით.',
    variables: { b: int(3, 9), x: int(2, 6), rot: int(0, 2) },
    interaction: (v) => {
      const b = num(v, 'b');
      const x = num(v, 'x');
      const products = [x * b, (x + 2) * b, (x + 5) * b];
      return {
        kind: 'tiles',
        cards: rotate(products.map(String), num(v, 'rot')),
        frame: [`${x} × ${b} =`, '?', `${x + 2} × ${b} =`, '?', `${x + 5} × ${b} =`, '?'],
        joiner: ',',
      };
    },
    answer: (v) => [0, 2, 5].map((k) => (num(v, 'x') + k) * num(v, 'b')).join(','),
    text: true,
    options: (v) => [[0, 2, 5].map((k) => (num(v, 'x') + k) * num(v, 'b')).join(','), [5, 2, 0].map((k) => (num(v, 'x') + k) * num(v, 'b')).join(',')],
    explanation: ({ vars }) => `${vars.x} × ${vars.b} = ${Number(vars.x) * Number(vars.b)} და ასე შემდეგ.`,
  }),
  u03('u03-product-comparison-bounds', 'sign', 2, {
    prompt: 'შეადარე ნამრავლი მოცემულ რიცხვს.',
    variables: { a: int(21, 89), b: int(3, 9), c: pick(100, 200, 300, 400, 500) },
    constraints: [{ test: (v) => Math.abs(num(v, 'a') * num(v, 'b') - num(v, 'c')) > 5, note: 'არა ტოლი' }],
    interaction: (v) => ({ kind: 'slots', tokens: [`${num(v, 'a')} × ${num(v, 'b')}`, '?', String(num(v, 'c'))], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a') * num(v, 'b'), num(v, 'c')),
    explanation: ({ vars }) => `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}.`,
  }),
];

/* ------------------------------------------------------------ U04 */
const u04 = T('g4-gayofa', 'u04');
const U04: QuestionTemplate[] = [
  u04('u04-divide-up-to-12', 'rows', 1, {
    prompt: '{n} კვადრატი თანაბრად დააწყვე {k} რიგად. რამდენი სვეტი გამოვა?',
    variables: { k: int(3, 12), q: int(3, 12), n: derived((v) => num(v, 'k') * num(v, 'q')) },
    interaction: (v) => ({ kind: 'array', maxRows: 12, maxCols: 12, fixedRows: num(v, 'k'), output: 'count' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.k} = ${vars.q}.`,
  }),
  u04('u04-find-divisor', 'rows-divisor', 2, {
    prompt: '{n} ÷ □ = {q}. ააგე ბადე, რომლის ყოველ რიგში {q} კვადრატია და სულ {n}. რამდენი რიგია?',
    variables: { k: int(3, 12), q: int(3, 12), n: derived((v) => num(v, 'k') * num(v, 'q')) },
    interaction: (v) => ({ kind: 'array', maxRows: 12, maxCols: 12, fixedCols: num(v, 'q'), output: 'count' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.q} = ${vars.k}.`,
  }),
  u04('u04-find-dividend', 'place', 2, {
    prompt: '□ ÷ {k} = {q}. ააგე უცნობი რიცხვი თანრიგებით.',
    variables: { k: int(3, 9), q: int(5, 30) },
    interaction: place(3),
    answer: (v) => num(v, 'k') * num(v, 'q'),
    explanation: ({ vars }) => `${vars.k} × ${vars.q} = ${Number(vars.k) * Number(vars.q)}.`,
  }),
  u04('u04-divide-ending-zeros-single', 'place-2', 1, {
    prompt: 'გამოთვალე {a} ÷ {b} და ააგე განაყოფი თანრიგებით.',
    variables: { b: int(2, 9), q: int(2, 9), a: derived((v) => num(v, 'b') * num(v, 'q') * 10) },
    interaction: place(3),
    answer: (v) => num(v, 'q') * 10,
    explanation: ({ vars }) => `${Number(vars.a) / 10} ÷ ${vars.b} = ${vars.q}, ამიტომ ${vars.a} ÷ ${vars.b} = ${Number(vars.q) * 10}.`,
  }),
  u04('u04-divide-ending-zeros', 'place-3', 2, {
    prompt: 'გამოთვალე {a} ÷ {b} და ააგე განაყოფი თანრიგებით.',
    variables: { q: int(2, 9), t: int(2, 9), b: derived((v) => num(v, 't') * 10), a: derived((v) => num(v, 't') * num(v, 'q') * 100) },
    interaction: place(2),
    answer: (v) => num(v, 'q') * 10,
    explanation: ({ vars }) => `${vars.a} ÷ ${vars.b} = ${Number(vars.q) * 10}.`,
  }),
  u04('u04-divide-by-two-digit', 'place-4', 3, {
    prompt: 'გამოთვალე {a} ÷ {b} და ააგე განაყოფი.',
    variables: { b: int(11, 19), q: int(5, 12), a: derived((v) => num(v, 'b') * num(v, 'q')) },
    interaction: place(2),
    answer: (v) => num(v, 'q'),
    explanation: ({ vars }) => `${vars.b} × ${vars.q} = ${vars.a}.`,
  }),
  u04('u04-estimate-quotient', 'place-5', 2, {
    prompt: 'დაამრგვალე {n} უახლოეს ასეულამდე და ააგე მიახლოებითი განაყოფი: {n} ÷ {b}.',
    variables: { n: int(121, 899), b: pick(2, 4, 5) },
    constraints: [{ test: (v) => num(v, 'n') % 100 !== 50 && num(v, 'n') % 100 !== 0, note: 'არა შუა' }],
    interaction: place(3),
    answer: (v) => roundTo(num(v, 'n'), 100) / num(v, 'b'),
    explanation: ({ vars, answer }) => `${roundTo(Number(vars.n), 100)} ÷ ${vars.b} = ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U05 */
const u05 = T('g4-algebra', 'u05');
const EXPR = [
  { phrase: 'დაუმატე', make: (k: number) => `n + ${k}` },
  { phrase: 'გამოაკელი', make: (k: number) => `n − ${k}` },
  { phrase: 'გაამრავლე', make: (k: number) => `n × ${k}` },
  { phrase: 'გაყავი', make: (k: number) => `n ÷ ${k}` },
];
const exprOptions = (k: number, kind: number, slot: number): string[] => {
  const rest = EXPR.map((e, i) => (i === kind ? null : e.make(k))).filter((x): x is string => x !== null);
  const list = [...rest];
  list.splice(slot, 0, EXPR[kind]!.make(k));
  return list;
};
const U05: QuestionTemplate[] = [
  u05('u05-write-expressions', 'pick-expression', 2, {
    prompt: 'რიცხვ n-ს {phrase} {k}. შეეხე სწორ გამოსახულებას.',
    variables: { kind: int(0, 3), k: int(2, 19), slot: int(0, 3), phrase: derived((v) => EXPR[num(v, 'kind')]!.phrase) },
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: exprOptions(num(v, 'k'), num(v, 'kind'), num(v, 'slot')).map((label) => ({ label })) }),
    answer: (v) => num(v, 'slot') + 1,
    explanation: ({ vars }) => `სწორი გამოსახულებაა ${EXPR[Number(vars.kind)]!.make(Number(vars.k))}.`,
  }),
  u05('u05-evaluate-expression', 'line', 1, {
    prompt: 'გამოთვალე b + {k}, თუ b = {b}. შეეხე შედეგს ღერძზე.',
    variables: { b: int(3, 20), k: int(3, 15) },
    interaction: () => ({ kind: 'line', min: 0, max: 40, labelEvery: 5 }),
    answer: (v) => num(v, 'b') + num(v, 'k'),
    explanation: ({ vars }) => `${vars.b} + ${vars.k} = ${Number(vars.b) + Number(vars.k)}.`,
  }),
  u05('u05-evaluate-expression', 'line-times', 2, {
    prompt: 'გამოთვალე {k} × b, თუ b = {b}. შეეხე შედეგს ღერძზე.',
    variables: { b: int(2, 9), k: int(2, 4) },
    interaction: () => ({ kind: 'line', min: 0, max: 40, labelEvery: 5 }),
    answer: (v) => num(v, 'b') * num(v, 'k'),
    explanation: ({ vars }) => `${vars.k} × ${vars.b} = ${Number(vars.b) * Number(vars.k)}.`,
  }),
  u05('u05-evaluate-multiple-values', 'cards', 3, {
    prompt: 'გამოთვალე t + {k} სამი მნიშვნელობისთვის და ჩააწყე ბარათები სწორ ადგილებზე.',
    variables: { k: int(3, 15), rot: int(0, 2) },
    interaction: (v) => ({
      kind: 'tiles',
      cards: rotate([5, 10, 20].map((t) => String(t + num(v, 'k'))), num(v, 'rot')),
      frame: ['t = 5 →', '?', 't = 10 →', '?', 't = 20 →', '?'],
      joiner: ',',
    }),
    answer: (v) => [5, 10, 20].map((t) => t + num(v, 'k')).join(','),
    text: true,
    options: (v) => [[5, 10, 20].map((t) => t + num(v, 'k')).join(','), [20, 10, 5].map((t) => t + num(v, 'k')).join(',')],
    explanation: ({ vars }) => `5 + ${vars.k}, 10 + ${vars.k}, 20 + ${vars.k}.`,
  }),
];

/* ------------------------------------------------------------ U07 */
const u07 = T('g4-mravalsapexuriani-amocanebi', 'u07');
const SIGN_ITEMS = ['+', '−'];
const U07: QuestionTemplate[] = [
  u07('u07-operation-signs', 'one-sign', 1, {
    prompt: 'ჩასვი სწორი ნიშანი.',
    variables: { a: int(20, 80), b: int(5, 19), op: pick('+', '−') },
    interaction: (v) => ({ kind: 'slots', tokens: [String(num(v, 'a')), '?', String(num(v, 'b')), '=', String(str(v, 'op') === '+' ? num(v, 'a') + num(v, 'b') : num(v, 'a') - num(v, 'b'))], options: SIGN_ITEMS }),
    answer: (v) => str(v, 'op'),
    explanation: ({ vars }) => `${vars.a} ${vars.op} ${vars.b}.`,
  }),
  u07('u07-operation-signs', 'two-signs', 2, {
    prompt: 'ჩასვი ორი სწორი ნიშანი.',
    variables: { a: int(20, 60), b: int(5, 19), c: int(2, 15), s1: pick('+', '−'), s2: pick('+', '−') },
    constraints: [
      {
        test: (v) => {
          const hit = SIGN_ITEMS.flatMap((x) => SIGN_ITEMS.map((y) => [x, y] as const)).filter(([x, y]) => calc(num(v, 'a'), x, num(v, 'b'), y, num(v, 'c')) === calc(num(v, 'a'), str(v, 's1'), num(v, 'b'), str(v, 's2'), num(v, 'c')));
          return hit.length === 1;
        },
        note: 'ერთადერთი ამოხსნა',
      },
    ],
    interaction: (v) => ({ kind: 'slots', tokens: [String(num(v, 'a')), '?', String(num(v, 'b')), '?', String(num(v, 'c')), '=', String(calc(num(v, 'a'), str(v, 's1'), num(v, 'b'), str(v, 's2'), num(v, 'c')))], options: SIGN_ITEMS }),
    answer: (v) => `${str(v, 's1')},${str(v, 's2')}`,
    explanation: ({ vars }) => `${vars.a} ${vars.s1} ${vars.b} ${vars.s2} ${vars.c}.`,
  }),
  u07('u07-time-intervals', 'end-time', 2, {
    prompt: 'გაკვეთილი {h}:00 საათზე დაიწყო და {d} წუთს გაგრძელდა. დააყენე საათზე დასრულების დრო.',
    variables: { h: int(1, 12), d: pick(30, 35, 40, 45, 50, 55) },
    interaction: () => ({ kind: 'clock' }),
    answer: (v) => hhmm(num(v, 'h'), num(v, 'd')),
    time: true,
    explanation: ({ vars }) => `${vars.h}:00 + ${vars.d} წუთი = ${vars.h}:${vars.d}.`,
  }),
  u07('u07-equations', 'line', 2, {
    prompt: 'x + {a} = {b}. შეეხე x-ის მნიშვნელობას ღერძზე.',
    variables: { a: int(5, 30), x: int(5, 30), b: derived((v) => num(v, 'a') + num(v, 'x')) },
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'b'), labelEvery: 5 }),
    answer: (v) => num(v, 'x'),
    explanation: ({ vars }) => `x = ${vars.b} − ${vars.a} = ${vars.x}.`,
  }),
];
function calc(a: number, s1: string, b: number, s2: string, c: number): number {
  const first = s1 === '+' ? a + b : a - b;
  return s2 === '+' ? first + c : first - c;
}

/* ------------------------------------------------------------ U08 */
const u08 = T('g4-monacemta-analizi', 'u08');
const COLORS = [
  { name: 'მწვანე', icon: 'dot-green' },
  { name: 'ყვითელი', icon: 'dot-yellow' },
  { name: 'წითელი', icon: 'dot-red' },
  { name: 'ლურჯი', icon: 'dot-blue' },
];
const colorSeq = (counts: number[]): string => {
  const out: string[] = [];
  for (let i = 0; i < Math.max(...counts); i += 1) counts.forEach((c, k) => c > i && out.push(COLORS[k]!.name));
  return out.join(', ');
};
const U08: QuestionTemplate[] = [
  u08('u08-bar-charts', 'bars', 2, {
    prompt: 'გაყიდული პური: ორშაბათი — {a}, სამშაბათი — {b}, ოთხშაბათი — {c}. ააგე სვეტოვანი დიაგრამა.',
    variables: { a: int(1, 9), b: int(1, 9), c: int(1, 9) },
    interaction: () => ({ kind: 'counters', style: 'bars', labels: ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი'], icon: 'sq-orange', max: 10 }),
    answer: (v) => `${num(v, 'a')},${num(v, 'b')},${num(v, 'c')}`,
    explanation: ({ vars }) => `სვეტები: ${vars.a}, ${vars.b}, ${vars.c}.`,
  }),
  u08('u08-pictograms', 'pictogram', 2, {
    prompt: 'ერთი ★ ნიშნავს 5 წიგნს. წიგნები: ზღაპრები — {a}, ენციკლოპედია — {b}. ააგე პიქტოგრამა: რამდენი ვარსკვლავი უნდა დაიხატოს?',
    variables: { x: int(1, 6), y: int(1, 6), a: derived((v) => num(v, 'x') * 5), b: derived((v) => num(v, 'y') * 5) },
    interaction: () => ({ kind: 'counters', style: 'icons', labels: ['ზღაპრები', 'ენციკლოპედია'], icon: 'star', max: 8, per: 5 }),
    answer: (v) => `${num(v, 'x')},${num(v, 'y')}`,
    explanation: ({ vars }) => `${vars.a} ÷ 5 = ${vars.x}, ${vars.b} ÷ 5 = ${vars.y}.`,
  }),
  u08('u08-frequency-tables', 'tally', 2, {
    prompt: 'მოსწავლეთა საყვარელი ფერებია: {seq}. ჩაწერე ტალის ნიშნებით, რამდენჯერ დასახელდა თითოეული ფერი.',
    variables: { a: int(1, 6), b: int(1, 6), c: int(1, 6), seq: derived((v) => colorSeq([num(v, 'a'), num(v, 'b'), num(v, 'c')])) },
    interaction: () => ({ kind: 'counters', style: 'tally', labels: ['მწვანე', 'ყვითელი', 'წითელი'], icon: 'dot-blue', max: 8 }),
    answer: (v) => `${num(v, 'a')},${num(v, 'b')},${num(v, 'c')}`,
    explanation: ({ vars }) => `მწვანე ${vars.a}, ყვითელი ${vars.b}, წითელი ${vars.c}.`,
  }),
  u08('u08-data-selection', 'tap-greater', 1, {
    prompt: 'შეეხე ყველა რიცხვს, რომელიც {t}-ზე მეტია.',
    variables: { t: int(8, 20), a: int(1, 30), b: int(1, 30), c: int(1, 30), d: int(1, 30), e: int(1, 30), f: int(1, 30) },
    constraints: [
      distinct('a', 'b', 'c', 'd', 'e', 'f'),
      { test: (v) => ['a', 'b', 'c', 'd', 'e', 'f'].some((k) => num(v, k) > num(v, 't')), note: 'არის პასუხი' },
      { test: (v) => ['a', 'b', 'c', 'd', 'e', 'f'].every((k) => num(v, k) !== num(v, 't')), note: 'არა ტოლი' },
    ],
    interaction: (v) => ({ kind: 'pick', mode: 'many', items: ['a', 'b', 'c', 'd', 'e', 'f'].map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) =>
      ['a', 'b', 'c', 'd', 'e', 'f']
        .map((k, i) => (num(v, k) > num(v, 't') ? i + 1 : 0))
        .filter(Boolean)
        .join(','),
    explanation: ({ vars }) => `${vars.t}-ზე მეტი რიცხვები მონიშნე.`,
  }),
];

/* ------------------------------------------------------------ U09 */
const u09 = T('g4-finansuri-tsigniereba-fuli', 'u09');
const U09: QuestionTemplate[] = [
  u09('u09-counting-coins', 'pay', 1, {
    prompt: 'ჩაიდე ყულაბაში ზუსტად {n} თეთრი.',
    variables: { n: int(31, 199) },
    interaction: () => ({ kind: 'purse', coins: COINS, output: 'total' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `მონეტების ჯამი ${vars.n} თეთრი უნდა იყოს.`,
  }),
  u09('u09-money-subtraction', 'change', 2, {
    prompt: 'ნივთი ღირს {p} თეთრი. გადაიხადე 200 თეთრი. ჩაიდე ხურდა, რომელიც უნდა დაგიბრუნონ.',
    variables: { p: int(41, 195, { step: 2 }) },
    interaction: () => ({ kind: 'purse', coins: COINS, output: 'total' }),
    answer: (v) => 200 - num(v, 'p'),
    explanation: ({ vars }) => `200 − ${vars.p} = ${200 - Number(vars.p)}.`,
  }),
  u09('u09-multi-step-money', 'fewest', 3, {
    prompt: 'შეადგინე {n} თეთრი ყველაზე ცოტა მონეტით.',
    variables: { n: int(41, 249) },
    constraints: [{ test: (v) => minCoins(num(v, 'n')) >= 5 && minCoins(num(v, 'n')) <= 12, note: 'ზომიერი' }],
    interaction: () => ({ kind: 'purse', coins: COINS, output: 'totalCount' }),
    answer: (v) => `${num(v, 'n')}/${minCoins(num(v, 'n'))}`,
    explanation: ({ vars }) => `${vars.n} თეთრი ${minCoins(Number(vars.n))} მონეტით იკრიბება.`,
  }),
  u09('u09-unit-price', 'two-prices', 2, {
    prompt: 'ორი ნივთი ღირს {p} და {q} თეთრი. ჩაიდე ყულაბაში ორივეს ფასი.',
    variables: { p: int(21, 99), q: int(21, 99) },
    interaction: () => ({ kind: 'purse', coins: COINS, output: 'total' }),
    answer: (v) => num(v, 'p') + num(v, 'q'),
    explanation: ({ vars }) => `${vars.p} + ${vars.q} = ${Number(vars.p) + Number(vars.q)}.`,
  }),
  u09('u09-comparing-money', 'sign', 2, {
    prompt: 'შეადარე თანხები.',
    variables: { a: int(110, 990, { step: 10 }), l: int(2, 9) },
    constraints: [{ test: (v) => num(v, 'a') !== num(v, 'l') * 100, note: 'არა ტოლი' }],
    interaction: (v) => ({ kind: 'slots', tokens: [`${num(v, 'a')} თეთრი`, '?', `${num(v, 'l')} ლარი`], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a'), num(v, 'l') * 100),
    explanation: ({ vars }) => `${vars.l} ლარი = ${Number(vars.l) * 100} თეთრი.`,
  }),
];

/* ------------------------------------------------------------ U10 */
const u10 = T('g4-gazomva', 'u10');
const LENGTHS = [['კარის სიმაღლე', 1], ['ფანქრის სიგრძე', 0], ['საფეხბურთო მოედნის სიგრძე', 1], ['ქალაქებს შორის მანძილი', 2], ['წიგნის სისქე', 0], ['ქუჩის სიგრძე', 1], ['თბილისი–ბათუმის გზა', 2], ['საშლელის სიგრძე', 0]] as const;
const U10: QuestionTemplate[] = [
  u10('u10-protractor-angles', 'set-angle', 1, {
    prompt: 'გახსენი კუთხე {n} გრადუსამდე.',
    variables: { deg: int(3, 36), n: derived((v) => num(v, 'deg') * 5) },
    interaction: () => ({ kind: 'angle', step: 5 }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `ისარი ${vars.n}°-ზე უნდა გაჩერდეს.`,
  }),
  u10('u10-centimeter-ruler', 'read-length', 1, {
    prompt: 'რამდენი სანტიმეტრია ფანქრის სიგრძე? შეეხე სახაზავზე იმ ნიშნულს, სადაც ფანქარი მთავრდება.',
    variables: { n: int(4, 24) },
    interaction: (v) => ({ kind: 'line', min: 0, max: 25, style: 'ruler', bar: num(v, 'n'), barIcon: 'pencil', unit: 'სმ' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `ფანქარი ${vars.n} სმ-ზე მთავრდება.`,
  }),
  u10('u10-length-conversion', 'place', 1, {
    prompt: 'გადაიყვანე {m} მეტრი სანტიმეტრებში და ააგე შედეგი.',
    variables: { m: int(2, 99) },
    interaction: place(4),
    answer: (v) => num(v, 'm') * 100,
    explanation: ({ vars }) => `${vars.m} მ = ${Number(vars.m) * 100} სმ.`,
  }),
  u10('u10-mass-conversion', 'place-2', 1, {
    prompt: 'გადაიყვანე {k} კილოგრამი გრამებში და ააგე შედეგი.',
    variables: { k: int(2, 99) },
    interaction: place(5),
    answer: (v) => num(v, 'k') * 1000,
    explanation: ({ vars }) => `${vars.k} კგ = ${Number(vars.k) * 1000} გ.`,
  }),
  u10('u10-volume-conversion', 'place-3', 1, {
    prompt: 'გადაიყვანე {l} ლიტრი მილილიტრებში და ააგე შედეგი.',
    variables: { l: int(2, 99) },
    interaction: place(5),
    answer: (v) => num(v, 'l') * 1000,
    explanation: ({ vars }) => `${vars.l} ლ = ${Number(vars.l) * 1000} მლ.`,
  }),
  u10('u10-measurement-operations', 'place-4', 2, {
    prompt: 'გამოთვალე {m} მ + {c} სმ და ააგე შედეგი სანტიმეტრებში.',
    variables: { m: int(2, 9), c: int(10, 99) },
    interaction: place(4),
    answer: (v) => num(v, 'm') * 100 + num(v, 'c'),
    explanation: ({ vars }) => `${Number(vars.m) * 100} + ${vars.c} = ${Number(vars.m) * 100 + Number(vars.c)} სმ.`,
  }),
  u10('u10-unit-comparison', 'sign', 2, {
    prompt: 'შეადარე სიგრძეები.',
    variables: { m: int(2, 9), c: int(150, 950, { step: 10 }) },
    constraints: [{ test: (v) => num(v, 'm') * 100 !== num(v, 'c'), note: 'არა ტოლი' }],
    interaction: (v) => ({ kind: 'slots', tokens: [`${num(v, 'm')} მ`, '?', `${num(v, 'c')} სმ`], options: SIGNS }),
    answer: (v) => signOf(num(v, 'm') * 100, num(v, 'c')),
    explanation: ({ vars }) => `${vars.m} მ = ${Number(vars.m) * 100} სმ.`,
  }),
  u10('u10-fill-to-target', 'place-5', 2, {
    prompt: 'რამდენი სანტიმეტრი უნდა დაამატო {n} სმ-ს, რომ მიიღო 1 მეტრი? ააგე პასუხი.',
    variables: { n: int(11, 94) },
    interaction: place(2),
    answer: (v) => 100 - num(v, 'n'),
    explanation: ({ vars }) => `100 − ${vars.n} = ${100 - Number(vars.n)}.`,
  }),
  u10('u10-unit-suitability', 'sort', 1, {
    prompt: 'რით ზომავენ? ჩადე თითოეული საგანი ყუთში: სანტიმეტრი, მეტრი ან კილომეტრი.',
    variables: { rot: int(0, 7) },
    interaction: (v) => ({ kind: 'bins', bins: ['სანტიმეტრი', 'მეტრი', 'კილომეტრი'], items: rotate([...LENGTHS], num(v, 'rot')).slice(0, 5).map((x) => ({ label: x[0] })) }),
    answer: (v) => rotate([...LENGTHS], num(v, 'rot')).slice(0, 5).map((x) => x[1]).join(','),
    explanation: () => 'პატარას სანტიმეტრით ვზომავთ, ოთახ-ეზოს — მეტრით, გზას — კილომეტრით.',
  }),
];

/* ------------------------------------------------------------ U11 */
const u11 = T('g4-geometria', 'u11');
const U11: QuestionTemplate[] = [
  u11('u11-area', 'grid-area', 2, {
    prompt: 'მართკუთხედის სიგანე {r} სმ-ია, ფართობი კი {n} კვ. სმ. ააგე ბადე ერთეულოვანი კვადრატებით და იპოვე სიგრძე.',
    variables: { r: int(2, 8), c: int(3, 12), n: derived((v) => num(v, 'r') * num(v, 'c')) },
    interaction: (v) => ({ kind: 'array', maxRows: 12, maxCols: 12, fixedRows: num(v, 'r'), output: 'count', unit: 'კვ. სმ' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.r} = ${vars.c} სმ.`,
  }),
  u11('u11-area-square-units', 'grid-area-2', 2, {
    prompt: 'მართკუთხედი {c} ერთეული კვადრატისგან შედგება თითო რიგში. ფართობი {n} კვ. ერთეულია. რამდენი რიგია?',
    variables: { r: int(2, 9), c: int(3, 12), n: derived((v) => num(v, 'r') * num(v, 'c')) },
    interaction: (v) => ({ kind: 'array', maxRows: 12, maxCols: 12, fixedCols: num(v, 'c'), output: 'count' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.c} = ${vars.r}.`,
  }),
  u11('u11-perimeter', 'grid-perimeter', 2, {
    prompt: 'მართკუთხედის სიგანე {r} სმ-ია, პერიმეტრი — {p} სმ. ააგე ბადე და იპოვე სიგრძე.',
    variables: { r: int(2, 8), c: int(3, 12), p: derived((v) => 2 * (num(v, 'r') + num(v, 'c'))) },
    interaction: (v) => ({ kind: 'array', maxRows: 12, maxCols: 12, fixedRows: num(v, 'r'), output: 'perimeter', unit: 'სმ' }),
    answer: (v) => num(v, 'p'),
    explanation: ({ vars }) => `2 × (${vars.r} + ${vars.c}) = ${vars.p}.`,
  }),
  u11('u11-perimeter-area-relation', 'dims', 3, {
    prompt: 'ააგე მართკუთხედი, რომლის ფართობია {n} კვ. სმ და პერიმეტრი {p} სმ. რიგების რაოდენობა სვეტებზე ნაკლები უნდა იყოს.',
    variables: { r: int(2, 6), d: int(1, 6), c: derived((v) => num(v, 'r') + num(v, 'd')), n: derived((v) => num(v, 'r') * num(v, 'c')), p: derived((v) => 2 * (num(v, 'r') + num(v, 'c'))) },
    constraints: [
      {
        test: (v) => {
          let found = 0;
          for (let r = 1; r <= 12; r += 1) for (let c = r + 1; c <= 12; c += 1) if (r * c === num(v, 'n') && 2 * (r + c) === num(v, 'p')) found += 1;
          return found === 1;
        },
        note: 'ერთადერთი',
      },
    ],
    interaction: () => ({ kind: 'array', maxRows: 12, maxCols: 12, output: 'dims' }),
    answer: (v) => `${num(v, 'r')},${num(v, 'c')}`,
    text: true,
    options: (v) => [`${num(v, 'r')},${num(v, 'c')}`, `${num(v, 'c')},${num(v, 'r')}`],
    explanation: ({ vars }) => `${vars.r} × ${vars.c} = ${vars.n}, 2 × (${vars.r} + ${vars.c}) = ${vars.p}.`,
  }),
];

/* ------------------------------------------------------------ U12 */
const u12 = T('g4-dro', 'u12');
const U12: QuestionTemplate[] = [
  u12('u12-elapsed-time', 'end-time', 2, {
    prompt: 'ვარჯიში {h}:{mm}-ზე დაიწყო და {d} წუთი გაგრძელდა. დააყენე საათზე დასრულების დრო.',
    variables: { h: int(1, 12), m: pick(0, 10, 15, 20, 30, 40, 45), d: pick(15, 20, 25, 30, 35, 40, 45, 50), mm: derived((v) => String(num(v, 'm')).padStart(2, '0')) },
    interaction: () => ({ kind: 'clock' }),
    answer: (v) => {
      const t = num(v, 'h') * 60 + num(v, 'm') + num(v, 'd');
      return hhmm(Math.floor(t / 60), t % 60);
    },
    time: true,
    explanation: ({ vars }) => `${vars.h}:${vars.mm} + ${vars.d} წუთი.`,
  }),
  u12('u12-time-unit-conversion', 'place-minutes', 1, {
    prompt: 'რამდენი წუთია {h} საათში? ააგე პასუხი.',
    variables: { h: int(2, 16) },
    interaction: place(4),
    answer: (v) => num(v, 'h') * 60,
    explanation: ({ vars }) => `${vars.h} × 60 = ${Number(vars.h) * 60}.`,
  }),
  u12('u12-time-unit-conversion', 'place-seconds', 2, {
    prompt: 'რამდენი წამია {m} წუთში? ააგე პასუხი.',
    variables: { m: int(2, 30) },
    interaction: place(4),
    answer: (v) => num(v, 'm') * 60,
    explanation: ({ vars }) => `${vars.m} × 60 = ${Number(vars.m) * 60}.`,
  }),
  u12('u12-work-rate-time', 'place-distance', 2, {
    prompt: 'მანქანა ერთ საათში {v} კმ-ს გადის. ააგე, რამდენ კილომეტრს გაივლის {t} საათში.',
    variables: { v: int(40, 95, { step: 5 }), t: int(2, 5) },
    interaction: place(3),
    answer: (v) => num(v, 'v') * num(v, 't'),
    explanation: ({ vars }) => `${vars.v} × ${vars.t} = ${Number(vars.v) * Number(vars.t)}.`,
  }),
];

/* ------------------------------------------------------------ U13 */
const u13 = T('g4-sichkare-mandzili', 'u13');
const U13: QuestionTemplate[] = [
  u13('u13-distance', 'hops', 1, {
    prompt: 'მანქანა ყოველ საათში {v} კმ-ს გადის. ღერძზე გააკეთე {t} ნახტომი — თითო საათი. რამდენ კილომეტრზე აღმოჩნდები?',
    variables: { v: pick(10, 20, 30, 40, 50, 60), t: int(3, 9) },
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'v') * 10, step: num(v, 'v'), start: 0, labelEvery: 1, unit: 'კმ' }),
    answer: (v) => num(v, 'v') * num(v, 't'),
    explanation: ({ vars }) => `${vars.t} × ${vars.v} = ${Number(vars.v) * Number(vars.t)}.`,
  }),
  u13('u13-speed-time-distance', 'place', 2, {
    prompt: 'მანქანა საათში {v} კმ-ს გადის. ააგე, რამდენ კილომეტრს გაივლის {t} საათში.',
    variables: { v: int(45, 95, { step: 5 }), t: int(3, 8) },
    interaction: place(3),
    answer: (v) => num(v, 'v') * num(v, 't'),
    explanation: ({ vars }) => `${vars.v} × ${vars.t} = ${Number(vars.v) * Number(vars.t)}.`,
  }),
  u13('u13-speed', 'place-speed', 2, {
    prompt: 'მანქანამ {d} კმ {t} საათში გაიარა. ააგე მისი სიჩქარე (კმ/სთ).',
    variables: { v: int(30, 95, { step: 5 }), t: int(2, 6), d: derived((v) => num(v, 'v') * num(v, 't')) },
    interaction: place(3),
    answer: (v) => num(v, 'v'),
    explanation: ({ vars }) => `${vars.d} ÷ ${vars.t} = ${vars.v}.`,
  }),
  u13('u13-duration', 'place-hours', 2, {
    prompt: 'მანქანამ {d} კმ გაიარა {v} კმ/სთ სიჩქარით. რამდენი საათი იმოძრავა? ააგე პასუხი.',
    variables: { v: pick(40, 50, 60, 80), t: int(2, 9), d: derived((v) => num(v, 'v') * num(v, 't')) },
    interaction: place(2),
    answer: (v) => num(v, 't'),
    explanation: ({ vars }) => `${vars.d} ÷ ${vars.v} = ${vars.t}.`,
  }),
];

/* ------------------------------------------------------------ U14 */
const u14 = T('g4-albatoba', 'u14');
const ITEM_KINDS = ['red', 'blue', 'any'] as const;
const certainty = (r: number, b: number, kind: (typeof ITEM_KINDS)[number]): number => {
  if (kind === 'any') return 2;
  const mine = kind === 'red' ? r : b;
  const other = kind === 'red' ? b : r;
  return mine === 0 ? 0 : other === 0 ? 2 : 1;
};
const U14: QuestionTemplate[] = [
  u14('u14-event-likelihood', 'bag', 2, {
    prompt: 'ჩანთაში ბურთებია (სურათზე). ჩადე თითოეული ხდომილება ყუთში: შეუძლებელი, შესაძლებელი ან აუცილებელი.',
    variables: { r: int(0, 5), b: int(0, 5) },
    constraints: [{ test: (v) => num(v, 'r') + num(v, 'b') >= 2 && (num(v, 'r') === 0 || num(v, 'b') === 0 || num(v, 'r') + num(v, 'b') >= 4), note: 'ბურთები არის' }, { test: (v) => num(v, 'r') + num(v, 'b') > 0, note: 'არა ცარიელი' }],
    pictures: (v) => [{ kind: 'rows', rows: [{ tokens: [...Array.from({ length: num(v, 'r') }, () => ({ t: 'icon' as const, icon: 'dot-red' })), ...Array.from({ length: num(v, 'b') }, () => ({ t: 'icon' as const, icon: 'dot-blue' }))] }] }],
    interaction: () => ({ kind: 'bins', bins: ['შეუძლებელი', 'შესაძლებელი', 'აუცილებელი'], items: [{ label: 'ამოვიღებ წითელ ბურთს' }, { label: 'ამოვიღებ ლურჯ ბურთს' }, { label: 'ამოვიღებ რომელიმე ბურთს' }] }),
    answer: (v) => ITEM_KINDS.map((k) => certainty(num(v, 'r'), num(v, 'b'), k)).join(','),
    explanation: () => 'თუ ფერი არ არის — შეუძლებელია; თუ მხოლოდ ის არის — აუცილებელია; თუ ორივე არის — შესაძლებელია.',
  }),
];

/* ------------------------------------------------------------ U15 */
const u15 = T('g4-tsiladebi', 'u15');
const U15: QuestionTemplate[] = [
  u15('u15-parts-of-whole', 'shade', 1, {
    prompt: 'ფიგურა {n} ტოლ ნაწილადაა გაყოფილი. გააფერადე მისი {k}/{n}.',
    variables: { n: pick(3, 4, 5, 6, 8, 10, 12), k: int(1, 11), shape: pick('bar', 'circle') },
    constraints: [{ test: (v) => num(v, 'k') < num(v, 'n'), note: 'k<n' }, { test: (v) => str(v, 'shape') === 'bar' || num(v, 'n') <= 8, note: 'წრე ≤ 8' }],
    interaction: (v) => ({ kind: 'fill', shape: str(v, 'shape') as 'bar' | 'circle', total: num(v, 'n') }),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${vars.k}/${vars.n} ნიშნავს ${vars.k} ნაწილს ${vars.n}-დან.`,
  }),
  u15('u15-numerator-denominator', 'which-is', 1, {
    prompt: 'წილადში {k}/{n} შეეხე {which}.',
    variables: { k: int(1, 19), n: int(2, 20), which: pick('მრიცხველს', 'მნიშვნელს') },
    constraints: [distinct('k', 'n')],
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: [{ label: String(num(v, 'k')) }, { label: String(num(v, 'n')) }] }),
    answer: (v) => (str(v, 'which') === 'მრიცხველს' ? 1 : 2),
    explanation: ({ vars }) => `მრიცხველი ზემოთაა (${vars.k}), მნიშვნელი — ქვემოთ (${vars.n}).`,
  }),
  u15('u15-fractions-number-line', 'tap-fraction', 2, {
    prompt: 'მონაკვეთი 0-დან 1-მდე {n} ტოლ ნაწილადაა დაყოფილი. შეეხე წერტილს {k}/{n}.',
    variables: { n: int(3, 12), k: int(1, 11) },
    constraints: [{ test: (v) => num(v, 'k') < num(v, 'n'), note: 'k<n' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'n'), format: 'frac', den: num(v, 'n') }),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${vars.k}/${vars.n} არის ${vars.k}-ე დანაყოფი ნულიდან.`,
  }),
  u15('u15-equivalent-fractions', 'shade-equivalent', 2, {
    prompt: 'გააფერადე ფიგურის {m2} ნაწილიდან იმდენი, რომ შეფერილი ნაწილი {k}/{n}-ის ტოლი იყოს.',
    variables: { n: pick(2, 3, 4, 5), k: int(1, 4), f: int(2, 4), m2: derived((v) => num(v, 'n') * num(v, 'f')) },
    constraints: [{ test: (v) => num(v, 'k') < num(v, 'n'), note: 'k<n' }],
    interaction: (v) => ({ kind: 'fill', shape: 'bar', total: num(v, 'm2') }),
    answer: (v) => num(v, 'k') * num(v, 'f'),
    explanation: ({ vars }) => `${vars.k}/${vars.n} = ${Number(vars.k) * Number(vars.f)}/${vars.m2}.`,
  }),
  u15('u15-equivalent-fractions-problems', 'missing-numerator', 2, {
    prompt: '{k}/{n} = □/{m2}. გააფერადე ფიგურა ისე, რომ მიიღო უცნობი მრიცხველი.',
    variables: { n: pick(2, 3, 4, 5), k: int(1, 4), f: int(2, 4), m2: derived((v) => num(v, 'n') * num(v, 'f')) },
    constraints: [{ test: (v) => num(v, 'k') < num(v, 'n'), note: 'k<n' }],
    interaction: (v) => ({ kind: 'fill', shape: 'bar', total: num(v, 'm2') }),
    answer: (v) => num(v, 'k') * num(v, 'f'),
    explanation: ({ vars }) => `${vars.k} × ${vars.f} = ${Number(vars.k) * Number(vars.f)}.`,
  }),
  u15('u15-fraction-addition-same-denom', 'shade-add', 2, {
    prompt: 'ზოლი {n} ტოლ ნაწილადაა გაყოფილი და {a}/{n} უკვე შეფერილია. დაამატე კიდევ {b}/{n}. რამდენი ნაწილია შეფერილი სულ?',
    variables: { n: int(5, 12), a: int(1, 5), b: int(1, 5) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') < num(v, 'n'), note: 'ჯამი < მთელი' }],
    interaction: (v) => ({ kind: 'fill', shape: 'bar', total: num(v, 'n'), start: num(v, 'a'), locked: num(v, 'a'), output: 'all' }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a}/${vars.n} + ${vars.b}/${vars.n} = ${Number(vars.a) + Number(vars.b)}/${vars.n}.`,
  }),
  u15('u15-fraction-subtraction-same-denom', 'shade-take', 2, {
    prompt: 'ზოლი {n} ტოლ ნაწილადაა გაყოფილი და {a}/{n} შეფერილია. მოხსენი {b}/{n}. რამდენი ნაწილი დარჩა შეფერილი?',
    variables: { n: int(5, 12), a: int(3, 9), b: int(1, 5) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'n') && num(v, 'b') < num(v, 'a'), note: 'b<a<n' }],
    interaction: (v) => ({ kind: 'fill', shape: 'bar', total: num(v, 'n'), start: num(v, 'a') }),
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ vars }) => `${vars.a}/${vars.n} − ${vars.b}/${vars.n} = ${Number(vars.a) - Number(vars.b)}/${vars.n}.`,
  }),
  u15('u15-fraction-word-problems', 'cake', 2, {
    prompt: 'ტორტი {n} ტოლ ნაწილადაა დაჭრილი. პირველმა {a} ნაწილი შეჭამა, მეორემ — {b}. გააფერადე შეჭმული ნაწილები: რამდენია სულ?',
    variables: { n: pick(6, 8), a: int(1, 3), b: int(1, 3) },
    interaction: (v) => ({ kind: 'fill', shape: 'circle', total: num(v, 'n') }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)} ნაწილი.`,
  }),
];

/* ------------------------------------------------------------ U16 (decimals) */
const u16 = T('g4-atwiladebi', 'u16');
const U16: QuestionTemplate[] = [
  u16('u16-decimal-concept', 'shade-tenths', 1, {
    prompt: 'ზოლი 10 ტოლ ნაწილადაა გაყოფილი. გააფერადე {dec} მთელი.',
    variables: { k: int(1, 9), dec: derived((v) => tenths(num(v, 'k'))) },
    interaction: () => ({ kind: 'fill', shape: 'bar', total: 10 }),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${vars.dec} = ${vars.k}/10.`,
  }),
  u16('u16-decimal-concept', 'tap-tenths', 2, {
    prompt: 'შეეხე რიცხვს {dec} ღერძზე.',
    variables: { k: int(1, 19), dec: derived((v) => tenths(num(v, 'k'))) },
    constraints: [{ test: (v) => num(v, 'k') % 10 !== 0, note: 'არა მთელი' }],
    interaction: () => ({ kind: 'line', min: 0, max: 20, format: 'dec', den: 10, labelEvery: 1 }),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${vars.dec} არის ${vars.k}-ე დანაყოფი ნულიდან.`,
  }),
  u16('u16-fractions-to-decimals', 'tap-fraction', 2, {
    prompt: 'ჩაწერე ათწილადად {k}/10 და შეეხე ამ რიცხვს ღერძზე.',
    variables: { k: int(1, 19) },
    constraints: [{ test: (v) => num(v, 'k') % 10 !== 0, note: 'არა მთელი' }],
    interaction: () => ({ kind: 'line', min: 0, max: 20, format: 'dec', den: 10, labelEvery: 1 }),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${vars.k}/10 = ${tenths(Number(vars.k))}.`,
  }),
  u16('u16-decimal-comparison', 'sign', 2, {
    prompt: 'შეადარე ათწილადები.',
    variables: { a: int(11, 99), b: int(11, 99) },
    constraints: [{ test: (v) => num(v, 'a') % 10 !== 0 && num(v, 'b') % 10 !== 0, note: 'არა მთელი' }],
    interaction: (v) => ({ kind: 'slots', tokens: [tenths(num(v, 'a')), '?', tenths(num(v, 'b'))], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a'), num(v, 'b')),
    explanation: ({ vars }) => `${tenths(Number(vars.a))} და ${tenths(Number(vars.b))}.`,
  }),
  u16('u16-decimal-addition', 'on-line', 2, {
    prompt: 'გამოთვალე {x} + {y} და შეეხე შედეგს ღერძზე.',
    variables: { a: int(1, 9), b: int(1, 9), x: derived((v) => tenths(num(v, 'a'))), y: derived((v) => tenths(num(v, 'b'))) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 20, note: 'ღერძზე ეტევა' }],
    interaction: () => ({ kind: 'line', min: 0, max: 20, format: 'dec', den: 10, labelEvery: 1 }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.x} + ${vars.y} = ${tenths(Number(vars.a) + Number(vars.b))}.`,
  }),
  u16('u16-decimal-subtraction', 'on-line-2', 2, {
    prompt: 'გამოთვალე {x} − {y} და შეეხე შედეგს ღერძზე.',
    variables: { a: int(8, 19), b: int(1, 7), x: derived((v) => tenths(num(v, 'a'))), y: derived((v) => tenths(num(v, 'b'))) },
    interaction: () => ({ kind: 'line', min: 0, max: 20, format: 'dec', den: 10, labelEvery: 1 }),
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ vars }) => `${vars.x} − ${vars.y} = ${tenths(Number(vars.a) - Number(vars.b))}.`,
  }),
];

/* ------------------------------------------------------------ U17 */
const u17 = T('g4-logika', 'u17');
const four = ['a', 'b', 'c', 'd'];
const U17: QuestionTemplate[] = [
  u17('u17-number-ordering', 'cards-ascending', 1, {
    prompt: 'ჩააწყე რიცხვები ზრდადობით — ჯერ უმცირესი.',
    variables: { a: int(100, 999), b: int(100, 999), c: int(100, 999), d: int(100, 999) },
    constraints: [distinct(...four)],
    interaction: (v) => ({ kind: 'tiles', cards: four.map((k) => String(num(v, k))), slots: 4, joiner: ',' }),
    answer: (v) => four.map((k) => num(v, k)).sort((x, y) => x - y).join(','),
    text: true,
    options: (v) => [four.map((k) => num(v, k)).sort((x, y) => x - y).join(','), four.map((k) => num(v, k)).sort((x, y) => y - x).join(',')],
    explanation: () => 'შეადარე ასეულები, მერე ათეულები.',
  }),
  u17('u17-number-ordering', 'cards-descending', 2, {
    prompt: 'ჩააწყე რიცხვები კლებადობით — ჯერ უდიდესი.',
    variables: { a: int(1000, 9999), b: int(1000, 9999), c: int(1000, 9999), d: int(1000, 9999) },
    constraints: [distinct(...four)],
    interaction: (v) => ({ kind: 'tiles', cards: four.map((k) => String(num(v, k))), slots: 4, joiner: ',' }),
    answer: (v) => four.map((k) => num(v, k)).sort((x, y) => y - x).join(','),
    text: true,
    options: (v) => [four.map((k) => num(v, k)).sort((x, y) => y - x).join(','), four.map((k) => num(v, k)).sort((x, y) => x - y).join(',')],
    explanation: () => 'შეადარე ათასეულები, მერე ასეულები.',
  }),
  u17('u17-thought-numbers', 'line', 2, {
    prompt: 'ჩაფიქრებულ რიცხვს დაუმატეს {a} და მიიღეს {b}. შეეხე ჩაფიქრებულ რიცხვს ღერძზე.',
    variables: { a: int(5, 30), x: int(5, 30), b: derived((v) => num(v, 'a') + num(v, 'x')) },
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'b'), labelEvery: 5 }),
    answer: (v) => num(v, 'x'),
    explanation: ({ vars }) => `${vars.b} − ${vars.a} = ${vars.x}.`,
  }),
];

/* ------------------------------------------------------------ U18 */
const u18 = T('g4-kanonzomierebebi', 'u18');
const U18: QuestionTemplate[] = [
  u18('u18-number-sequences', 'hops-next', 1, {
    prompt: 'გააგრძელე მიმდევრობა: {a}, {b}, {c}, {e}, ? — შეეხე შემდეგ რიცხვს ღერძზე.',
    variables: { d: int(3, 9), a: derived((v) => num(v, 'd')), b: derived((v) => num(v, 'd') * 2), c: derived((v) => num(v, 'd') * 3), e: derived((v) => num(v, 'd') * 4) },
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'd') * 10, step: num(v, 'd'), labelEvery: 1 }),
    answer: (v) => num(v, 'd') * 5,
    explanation: ({ vars }) => `ყოველ ნაბიჯზე ემატება ${vars.d}.`,
  }),
  u18('u18-next-element', 'chart-next', 2, {
    prompt: 'იპოვე შემდეგი რიცხვი: {a}, {b}, {c}, ? — შეეხე მას ასეულის ცხრილში.',
    variables: { a: int(2, 30), d: int(3, 15), b: derived((v) => num(v, 'a') + num(v, 'd')), c: derived((v) => num(v, 'a') + 2 * num(v, 'd')) },
    constraints: [{ test: (v) => num(v, 'a') + 3 * num(v, 'd') <= 100, note: 'ცხრილში ეტევა' }],
    interaction: () => ({ kind: 'chart', from: 1, to: 100, cols: 10 }),
    answer: (v) => num(v, 'a') + 3 * num(v, 'd'),
    explanation: ({ vars }) => `ყოველ ნაბიჯზე ემატება ${vars.d}.`,
  }),
  u18('u18-number-triangles', 'tiles-top', 2, {
    prompt: 'სამკუთხედში ზედა რიცხვი ქვედა ორი რიცხვის ჯამია. ქვედა რიცხვებია {a} და {b}. ჩააწყე ზედა რიცხვი ბარათებით.',
    variables: { a: int(4, 40), b: int(4, 40) },
    interaction: (v) => ({ kind: 'tiles', cards: rotate([num(v, 'a') + num(v, 'b'), Math.abs(num(v, 'a') - num(v, 'b')), num(v, 'a') * 2, num(v, 'b') * 2].map(String), num(v, 'a') % 4), frame: [`${num(v, 'a')} + ${num(v, 'b')} =`, '?'] }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    text: true,
    options: (v) => [String(num(v, 'a') + num(v, 'b')), String(Math.abs(num(v, 'a') - num(v, 'b')))],
    constraints: [{ test: (v) => new Set([num(v, 'a') + num(v, 'b'), Math.abs(num(v, 'a') - num(v, 'b')), num(v, 'a') * 2, num(v, 'b') * 2]).size === 4, note: 'ბარათები განსხვავებულია' }],
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
];

export const G4_INTERACTIVE_TEMPLATES: QuestionTemplate[] = [
  ...U01, ...U02, ...U03, ...U04, ...U05, ...U07, ...U08, ...U09, ...U10, ...U11, ...U12, ...U13, ...U14, ...U15, ...U16, ...U17, ...U18,
];
