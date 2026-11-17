/**
 * Grade II — interactive templates.
 *
 * Same idea as `ix-g1.ts`, one level up: the child builds two-digit numbers from
 * tens and ones (and regroups), sets clocks, reads rulers and thermometers,
 * puts coins in a purse, builds tally marks, pictograms and bar charts from
 * data, sorts into bins, shades fractions, mirrors a picture.
 */
import type { QuestionTemplate, Vars } from './types';
import {
  MONTH_NAMES,
  ORDINALS,
  SHAPES,
  WEEKDAY_NAMES,
  hhmm,
  int,
  interactiveSet,
  num,
  objectVars,
  pick,
  rowOf,
  str,
  twoGroups,
} from './ix-kit';

const T = (topicId: string, unit: string) => interactiveSet(2, topicId, `g2-ix-${unit}`);
const same = (...keys: string[]) => ({
  test: (v: Vars) => new Set(keys.map((k) => Number(v[k]))).size === keys.length,
  note: 'განსხვავებული რიცხვები',
});
const derived = (fn: (v: Vars) => number | string) => ({ kind: 'choice' as const, values: (v: Vars) => [fn(v)] });
const signOf = (a: number, b: number): string => (a < b ? '<' : a > b ? '>' : '=');
const SIGNS = ['<', '>', '='];
const KEYS6 = ['a', 'b', 'c', 'd', 'e', 'f'];
const tensOf = (n: number): number => Math.floor(n / 10);
const onesOf = (n: number): number => n % 10;
const spokenModel = (n: number): string => `${tensOf(n)} ათეული და ${onesOf(n)} ერთეული`;

/* ------------------------------------------------------------ U01 */
const u01 = T('g2-ricxvebi100', 'u01');
const U01: QuestionTemplate[] = [
  u01('u01-hundred-chart', 'find-on-chart', 1, {
    prompt: 'იპოვე რიცხვი {n} ასეულის ცხრილში.',
    variables: { n: int(1, 100) },
    interaction: () => ({ kind: 'chart', from: 1, to: 100, cols: 10 }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} ცხრილში თავის ადგილზეა.`,
  }),
  u01('u01-hundred-chart', 'ten-more', 2, {
    prompt: 'იპოვე ცხრილში რიცხვი, რომელიც {n}-ზე 10-ით მეტია.',
    variables: { n: int(1, 90) },
    interaction: () => ({ kind: 'chart', from: 1, to: 100, cols: 10 }),
    answer: (v) => num(v, 'n') + 10,
    explanation: ({ vars }) => `10-ით მეტი ნიშნავს ერთი რიგით ქვემოთ: ${Number(vars.n) + 10}.`,
  }),
  u01('u01-ordinal-numbers', 'nth-of-ten', 1, {
    prompt: 'მარცხნიდან შეეხე {ord} ობიექტს.',
    variables: { k: int(1, 10), ord: { kind: 'choice', values: (v: Vars) => [ORDINALS[Number(v.k) - 1]!] } },
    interaction: () => ({ kind: 'pick', mode: 'one', items: ['apple', 'pear', 'banana', 'star', 'ball', 'flower-pink', 'fish', 'bird', 'balloon', 'heart'].map((icon) => ({ icon })) }),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${vars.ord} ობიექტი მარცხნიდან ${vars.k}-ე ადგილზეა.`,
  }),
  u01('u01-tens-and-ones', 'build', 1, {
    prompt: 'ააგე რიცხვი {n}: აიღე სწორი რაოდენობის ათეულები და ერთეულები.',
    variables: { n: int(11, 99) },
    interaction: () => ({ kind: 'build', startTens: 0, startOnes: 0, output: 'number' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} = ${spokenModel(Number(vars.n))}.`,
  }),
  u01('u01-before-and-after', 'neighbour-line', 1, {
    prompt: 'იპოვე რიცხვი, რომელიც {n}-ის {where}.',
    variables: { base: int(0, 80, { step: 10 }), o: int(1, 9), where: pick('შემდეგ მოდის', 'წინ დგას'), n: derived((v) => num(v, 'base') + num(v, 'o')) },
    interaction: (v) => ({ kind: 'line', min: num(v, 'base'), max: num(v, 'base') + 10 }),
    answer: (v) => num(v, 'base') + num(v, 'o') + (str(v, 'where') === 'წინ დგას' ? -1 : 1),
    explanation: ({ vars }) => `${vars.n}-ის ${vars.where === 'წინ დგას' ? 'წინ დგას' : 'შემდეგ მოდის'} ${Number(vars.n) + (vars.where === 'წინ დგას' ? -1 : 1)}.`,
  }),
  u01('u01-number-line-100', 'window', 2, {
    prompt: 'იპოვე {n} რიცხვით ღერძზე.',
    variables: { base: int(0, 90, { step: 10 }), o: int(1, 9), n: derived((v) => num(v, 'base') + num(v, 'o')) },
    interaction: (v) => ({ kind: 'line', min: num(v, 'base'), max: num(v, 'base') + 10 }),
    answer: (v) => num(v, 'base') + num(v, 'o'),
    explanation: ({ vars }) => `${vars.n} არის ${vars.base}-დან ${vars.o} დანაყოფის შემდეგ.`,
  }),
  u01('u01-largest-and-smallest', 'extreme-of-four', 1, {
    prompt: 'შეეხე {which} რიცხვს.',
    variables: { a: int(10, 99), b: int(10, 99), c: int(10, 99), d: int(10, 99), which: pick('უდიდეს', 'უმცირეს') },
    constraints: [same('a', 'b', 'c', 'd')],
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: ['a', 'b', 'c', 'd'].map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) => {
      const items = ['a', 'b', 'c', 'd'].map((k) => num(v, k));
      return items.indexOf(str(v, 'which') === 'უდიდეს' ? Math.max(...items) : Math.min(...items)) + 1;
    },
    explanation: ({ vars }) => `${vars.which} რიცხვი ათეულებით შეადარე, საჭიროების შემთხვევაში ერთეულებითაც.`,
  }),
  u01('u01-roman-numerals', 'roman', 2, {
    prompt: 'რომელი რიცხვია რომაული ციფრით „{roman}“? შეეხე მას.',
    variables: { i: int(0, 3), roman: { kind: 'choice', values: (v: Vars) => [['I', 'V', 'X', 'L'][num(v, 'i')]!] } },
    interaction: () => ({ kind: 'pick', mode: 'one', items: [1, 5, 10, 50].map((n) => ({ label: String(n) })) }),
    answer: (v) => num(v, 'i') + 1,
    explanation: ({ vars }) => `${vars.roman} = ${[1, 5, 10, 50][Number(vars.i)]}.`,
  }),
];

/* ------------------------------------------------------------ U02 */
const u02 = T('g2-datvla-mimdevroba', 'u02');
const U02: QuestionTemplate[] = [
  u02('u02-even-and-odd', 'sort', 1, {
    prompt: 'დაახარისხე რიცხვები: ლუწები ერთ ყუთში, კენტები — მეორეში.',
    variables: { a: int(1, 99), b: int(1, 99), c: int(1, 99), d: int(1, 99), e: int(1, 99), f: int(1, 99) },
    constraints: [same(...KEYS6), { test: (v) => KEYS6.some((k) => num(v, k) % 2 === 0) && KEYS6.some((k) => num(v, k) % 2 === 1), note: 'ორივე სახეობა' }],
    interaction: (v) => ({ kind: 'bins', bins: ['ლუწი', 'კენტი'], items: KEYS6.map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) => KEYS6.map((k) => (num(v, k) % 2 === 0 ? 0 : 1)).join(','),
    explanation: () => 'ლუწი რიცხვი 0, 2, 4, 6 ან 8-ზე მთავრდება, კენტი — 1, 3, 5, 7 ან 9-ზე.',
  }),
  u02('u02-counting-objects', 'count-out', 1, {
    prompt: 'მონიშნე {n} {noun}.',
    variables: { ...objectVars(), n: int(6, 20) },
    interaction: (v) => ({ kind: 'fill', shape: 'grid', cols: 5, total: 20, icon: str(v, 'obj'), noun: str(v, 'noun') }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `ზუსტად ${vars.n} უჯრა უნდა იყოს მონიშნული.`,
  }),
  u02('u02-counting-with-steps', 'count-by', 2, {
    prompt: 'დათვალე {d}-ობით: დაიწყე {s}-დან და გადადი 3 ნაბიჯით წინ. რომელ რიცხვზე მოხვდები?',
    variables: { d: pick(2, 5, 10), s: pick(0, 2, 4, 5, 10) },
    constraints: [{ test: (v) => num(v, 's') % num(v, 'd') === 0, note: 'დასაწყისი ჯერადია' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: num(v, 'd') * 20, step: num(v, 'd'), start: num(v, 's'), labelEvery: 2 }),
    answer: (v) => num(v, 's') + 3 * num(v, 'd'),
    explanation: ({ vars }) => `${vars.s} + ${vars.d} + ${vars.d} + ${vars.d} = ${Number(vars.s) + 3 * Number(vars.d)}.`,
  }),
  u02('u02-number-sequences', 'next-in-sequence', 2, {
    prompt: 'იპოვე მიმდევრობის შემდეგი რიცხვი: {a}, {b}, {c}, ? — შეეხე მას.',
    variables: { d: pick(2, 3, 4, 5), a: int(0, 10), b: derived((v) => num(v, 'a') + num(v, 'd')), c: derived((v) => num(v, 'a') + 2 * num(v, 'd')) },
    interaction: () => ({ kind: 'line', min: 0, max: 40, step: 1, labelEvery: 5 }),
    answer: (v) => num(v, 'a') + 3 * num(v, 'd'),
    explanation: ({ vars }) => `ყოველ ჯერზე ემატება ${vars.d}: ${Number(vars.a) + 3 * Number(vars.d)}.`,
  }),
  u02('u02-moves-on-number-line', 'jump', 1, {
    prompt: 'რიცხვით ღერძზე დგახარ {s}-ზე. {k} ნაბიჯით {dir} მიდიხარ. რომელ რიცხვზე აღმოჩნდები?',
    variables: { s: int(5, 25), k: int(1, 6), dir: pick('მარჯვნივ', 'მარცხნივ') },
    interaction: (v) => ({ kind: 'line', min: 0, max: 30, start: num(v, 's'), labelEvery: 5 }),
    answer: (v) => num(v, 's') + (str(v, 'dir') === 'მარჯვნივ' ? 1 : -1) * num(v, 'k'),
    explanation: ({ vars }) => `${vars.s} ${vars.dir === 'მარჯვნივ' ? '+' : '−'} ${vars.k} = ${Number(vars.s) + (vars.dir === 'მარჯვნივ' ? 1 : -1) * Number(vars.k)}.`,
  }),
  u02('u02-sorting-even-odd', 'sort-by-ending', 2, {
    prompt: 'ყველა რიცხვი ჩადე შესაბამის ყუთში — ბოლო ციფრი გეტყვის, ლუწია თუ კენტი.',
    variables: { a: int(10, 60), b: int(10, 60), c: int(10, 60), d: int(10, 60), e: int(10, 60) },
    constraints: [same('a', 'b', 'c', 'd', 'e'), { test: (v) => ['a', 'b', 'c', 'd', 'e'].some((k) => num(v, k) % 2 === 0) && ['a', 'b', 'c', 'd', 'e'].some((k) => num(v, k) % 2 === 1), note: 'ორივე' }],
    interaction: (v) => ({ kind: 'bins', bins: ['ლუწი', 'კენტი'], items: ['a', 'b', 'c', 'd', 'e'].map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) => ['a', 'b', 'c', 'd', 'e'].map((k) => (num(v, k) % 2 === 0 ? 0 : 1)).join(','),
    explanation: () => 'ლუწი რიცხვები 2-ზე უნაშთოდ იყოფა.',
  }),
];

/* ------------------------------------------------------------ U03 */
const u03 = T('g2-ertnishna-moqmedebebi', 'u03');
const U03: QuestionTemplate[] = [
  u03('u03-single-digit-add-sub', 'frame-add', 1, {
    prompt: '{a} + {b}: ორ ჩარჩოში მონიშნე ჯამის შესაბამისი უჯრები.',
    variables: { a: int(2, 12), b: int(2, 9) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 20, note: '≤ 20' }],
    interaction: () => ({ kind: 'fill', shape: 'frame20', total: 20 }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u03('u03-doubling-and-halving', 'double', 1, {
    prompt: 'გააორმაგე {n}: მონიშნე იმდენი უჯრა, რამდენიც {n} + {n} არის.',
    variables: { n: int(2, 10) },
    interaction: () => ({ kind: 'fill', shape: 'frame20', total: 20 }),
    answer: (v) => num(v, 'n') * 2,
    explanation: ({ vars }) => `${vars.n} + ${vars.n} = ${Number(vars.n) * 2}.`,
  }),
  u03('u03-doubling-and-halving', 'half', 2, {
    prompt: 'განახევრე {n}: {n} უჯრა უკვე მონიშნულია. გამორთე ნახევარი. რამდენი დარჩა?',
    variables: { h: int(1, 9), n: derived((v) => num(v, 'h') * 2) },
    interaction: (v) => ({ kind: 'fill', shape: 'row', total: num(v, 'n'), start: num(v, 'n'), icon: 'dot-blue', noun: 'დარჩა' }),
    answer: (v) => num(v, 'h'),
    explanation: ({ vars }) => `${vars.n}-ის ნახევარია ${vars.h}.`,
  }),
  u03('u03-adding-to-20-pictures', 'groups', 1, {
    prompt: 'შეაერთე ორი ჯგუფი და მონიშნე ჯამი ორ ჩარჩოში.',
    variables: { ...objectVars(), a: int(3, 12), b: int(2, 8) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 20, note: '≤ 20' }],
    pictures: (v) => [twoGroups(str(v, 'obj'), num(v, 'a'), num(v, 'b'))],
    interaction: () => ({ kind: 'fill', shape: 'frame20', total: 20 }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u03('u03-subtracting-to-20-pictures', 'take-away', 2, {
    prompt: 'ჩარჩოში {a} მონიშნული უჯრაა. გამოაკელი {b}: გამორთე {b} უჯრა. რამდენი დარჩა?',
    variables: { a: int(8, 20), b: int(2, 9) },
    constraints: [{ test: (v) => num(v, 'b') < num(v, 'a'), note: 'b < a' }],
    interaction: (v) => ({ kind: 'fill', shape: 'frame20', total: 20, start: num(v, 'a') }),
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}.`,
  }),
  u03('u03-missing-digit', 'missing', 2, {
    prompt: '{a} + ? = {c}. უკვე მონიშნულია {a}. მონიშნე ახალი უჯრები, სანამ არ მიიღებ {c}-ს. რამდენი დაამატე?',
    variables: { a: int(2, 12), c: int(8, 20) },
    constraints: [{ test: (v) => num(v, 'c') > num(v, 'a'), note: 'c > a' }],
    interaction: (v) => ({ kind: 'fill', shape: 'frame20', total: 20, start: num(v, 'a'), locked: num(v, 'a'), output: 'extra' }),
    answer: (v) => num(v, 'c') - num(v, 'a'),
    explanation: ({ vars }) => `${vars.c} − ${vars.a} = ${Number(vars.c) - Number(vars.a)}.`,
  }),
];

/* ------------------------------------------------------------ U04 */
const u04 = T('g2-ornishna-sekreba', 'u04');
const noCarry = (v: Vars) => num(v, 'a') % 10 + num(v, 'b') % 10 < 10 && num(v, 'a') + num(v, 'b') <= 99;
const carry = (v: Vars) => num(v, 'a') % 10 + num(v, 'b') % 10 >= 10 && num(v, 'a') + num(v, 'b') <= 99;
const U04: QuestionTemplate[] = [
  u04('u04-adding-tens', 'tens', 1, {
    prompt: '{a}0 + {b}0: ააგე ჯამი ათეულებით. რა რიცხვი მიიღე?',
    variables: { a: int(1, 7), b: int(1, 3) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 10, note: '≤ 100' }],
    interaction: (v) => ({ kind: 'build', startTens: num(v, 'a'), startOnes: 0, output: 'number' }),
    answer: (v) => (num(v, 'a') + num(v, 'b')) * 10,
    explanation: ({ vars }) => `${vars.a} ათეული + ${vars.b} ათეული = ${Number(vars.a) + Number(vars.b)} ათეული.`,
  }),
  u04('u04-without-regrouping', 'add-no-carry', 1, {
    prompt: 'მოდელი აჩვენებს {a}-ს. დაამატე {b}: დაამატე ორივე ათეულები და ერთეულები. რა რიცხვი მიიღე?',
    variables: { a: int(11, 78), b: int(11, 45) },
    constraints: [{ test: noCarry, note: 'გადაჯგუფების გარეშე' }],
    interaction: (v) => ({ kind: 'build', startTens: tensOf(num(v, 'a')), startOnes: onesOf(num(v, 'a')), output: 'number' }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u04('u04-with-regrouping', 'add-carry', 2, {
    prompt: 'მოდელი აჩვენებს {a}-ს. დაამატე {b}, 10 ერთეული შეცვალე ათეულით. რამდენი ათეული და რამდენი ერთეული მიიღე?',
    variables: { a: int(15, 78), b: int(15, 45) },
    constraints: [{ test: carry, note: 'გადაჯგუფებით' }],
    interaction: (v) => ({ kind: 'build', startTens: tensOf(num(v, 'a')), startOnes: onesOf(num(v, 'a')), output: 'pair' }),
    answer: (v) => `${tensOf(num(v, 'a') + num(v, 'b'))},${onesOf(num(v, 'a') + num(v, 'b'))}`,
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}: ${spokenModel(Number(vars.a) + Number(vars.b))}.`,
  }),
  u04('u04-comparing-examples', 'compare-sums', 2, {
    prompt: 'შეადარე ჯამები: ჩასვი სწორი ნიშანი.',
    variables: { a: int(10, 50), b: int(5, 40), c: int(10, 50), d: int(5, 40) },
    interaction: (v) => ({ kind: 'slots', tokens: [`${num(v, 'a')} + ${num(v, 'b')}`, '?', `${num(v, 'c')} + ${num(v, 'd')}`], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a') + num(v, 'b'), num(v, 'c') + num(v, 'd')),
    explanation: ({ vars }) => `${Number(vars.a) + Number(vars.b)} ${signOf(Number(vars.a) + Number(vars.b), Number(vars.c) + Number(vars.d))} ${Number(vars.c) + Number(vars.d)}.`,
  }),
  u04('u04-missing-addend', 'build-missing', 3, {
    prompt: '{a} + ? = {c}. ააგე მოდელით ის რიცხვი, რომელიც {a}-ს უნდა დაემატოს.',
    variables: { a: int(11, 60), m: int(11, 38), c: derived((v) => num(v, 'a') + num(v, 'm')) },
    interaction: () => ({ kind: 'build', startTens: 0, startOnes: 0, output: 'number' }),
    answer: (v) => num(v, 'm'),
    explanation: ({ vars }) => `${vars.c} − ${vars.a} = ${vars.m}.`,
  }),
];

/* ------------------------------------------------------------ U05 */
const u05 = T('g2-ornishna-gamokleba', 'u05');
const noBorrow = (v: Vars) => onesOf(num(v, 'a')) >= onesOf(num(v, 'b')) && num(v, 'a') > num(v, 'b');
const borrow = (v: Vars) => onesOf(num(v, 'a')) < onesOf(num(v, 'b')) && num(v, 'a') > num(v, 'b');
const U05: QuestionTemplate[] = [
  u05('u05-subtracting-tens', 'tens', 1, {
    prompt: 'მოდელში {a} ათეულია. ამოიღე {b} ათეული. რა რიცხვი დარჩა?',
    variables: { a: int(3, 10), b: int(1, 8) },
    constraints: [{ test: (v) => num(v, 'b') < num(v, 'a'), note: 'b < a' }],
    interaction: (v) => ({ kind: 'build', startTens: num(v, 'a'), startOnes: 0, output: 'number' }),
    answer: (v) => (num(v, 'a') - num(v, 'b')) * 10,
    explanation: ({ vars }) => `${vars.a}0 − ${vars.b}0 = ${(Number(vars.a) - Number(vars.b)) * 10}.`,
  }),
  u05('u05-without-regrouping', 'sub-no-borrow', 1, {
    prompt: 'მოდელი აჩვენებს {a}-ს. გამოაკელი {b}: ამოიღე ათეულებიც და ერთეულებიც. რა რიცხვი დარჩა?',
    variables: { a: int(21, 99), b: int(11, 68) },
    constraints: [{ test: noBorrow, note: 'ათეულიდან გადაჯგუფების გარეშე' }],
    interaction: (v) => ({ kind: 'build', startTens: tensOf(num(v, 'a')), startOnes: onesOf(num(v, 'a')), output: 'number' }),
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}.`,
  }),
  u05('u05-with-regrouping', 'sub-borrow', 2, {
    prompt: 'მოდელი აჩვენებს {a}-ს. გამოაკელი {b}: საჭიროა 1 ათეულის 10 ერთეულად გადაქცევა. რა რიცხვი დარჩა?',
    variables: { a: int(21, 99), b: int(12, 69) },
    constraints: [{ test: borrow, note: 'გადაჯგუფებით' }],
    interaction: (v) => ({ kind: 'build', startTens: tensOf(num(v, 'a')), startOnes: onesOf(num(v, 'a')), output: 'number' }),
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}.`,
  }),
  u05('u05-word-problems', 'story', 2, {
    prompt: 'მაღაზიაში იყო {a} რვეული. გაიყიდა {b}. გამოაკელი მოდელზე და მიუთითე, რამდენი რვეული დარჩა.',
    variables: { a: int(31, 99), b: int(12, 29) },
    interaction: (v) => ({ kind: 'build', startTens: tensOf(num(v, 'a')), startOnes: onesOf(num(v, 'a')), output: 'number' }),
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}.`,
  }),
  u05('u05-comparing-examples', 'compare-differences', 3, {
    prompt: 'შეადარე სხვაობები: ჩასვი სწორი ნიშანი.',
    variables: { a: int(40, 99), b: int(10, 39), c: int(40, 99), d: int(10, 39) },
    interaction: (v) => ({ kind: 'slots', tokens: [`${num(v, 'a')} − ${num(v, 'b')}`, '?', `${num(v, 'c')} − ${num(v, 'd')}`], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a') - num(v, 'b'), num(v, 'c') - num(v, 'd')),
    explanation: ({ vars }) => `${Number(vars.a) - Number(vars.b)} ${signOf(Number(vars.a) - Number(vars.b), Number(vars.c) - Number(vars.d))} ${Number(vars.c) - Number(vars.d)}.`,
  }),
];

/* ------------------------------------------------------------ U06 */
const u06 = T('g2-shedareba-dalageba', 'u06');
const U06: QuestionTemplate[] = [
  u06('u06-comparing-to-100', 'sign', 1, {
    prompt: 'შეადარე ორი რიცხვი და ჩასვი სწორი ნიშანი.',
    variables: { a: int(10, 99), b: int(10, 99) },
    interaction: (v) => ({ kind: 'slots', tokens: [String(num(v, 'a')), '?', String(num(v, 'b'))], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a'), num(v, 'b')),
    explanation: ({ vars }) => `${vars.a} ${signOf(Number(vars.a), Number(vars.b))} ${vars.b}.`,
  }),
  u06('u06-largest-smallest-group', 'extreme', 1, {
    prompt: 'შეეხე {which} რიცხვს.',
    variables: { a: int(10, 99), b: int(10, 99), c: int(10, 99), d: int(10, 99), which: pick('უდიდეს', 'უმცირეს') },
    constraints: [same('a', 'b', 'c', 'd')],
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: ['a', 'b', 'c', 'd'].map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) => {
      const items = ['a', 'b', 'c', 'd'].map((k) => num(v, k));
      return items.indexOf(str(v, 'which') === 'უდიდეს' ? Math.max(...items) : Math.min(...items)) + 1;
    },
    explanation: ({ vars }) => `${vars.which} რიცხვია სწორი.`,
  }),
  u06('u06-comparing-tens-ones', 'blocks-sign', 2, {
    prompt: 'შეადარე ორი მოდელი — ჯერ ათეულები, მერე ერთეულები. ჩასვი სწორი ნიშანი.',
    variables: { a: int(11, 99), b: int(11, 99) },
    pictures: (v) => [
      { kind: 'blocks', tens: tensOf(num(v, 'a')), ones: onesOf(num(v, 'a')) },
      { kind: 'blocks', tens: tensOf(num(v, 'b')), ones: onesOf(num(v, 'b')) },
    ],
    interaction: () => ({ kind: 'slots', tokens: ['პირველი', '?', 'მეორე'], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a'), num(v, 'b')),
    explanation: ({ vars }) => `${spokenModel(Number(vars.a))} და ${spokenModel(Number(vars.b))}: ${vars.a} ${signOf(Number(vars.a), Number(vars.b))} ${vars.b}.`,
  }),
  u06('u06-comparing-sums-differences', 'sum-vs-difference', 3, {
    prompt: 'შეადარე გამოსახულებების მნიშვნელობები და ჩასვი ნიშანი.',
    variables: { a: int(10, 50), b: int(5, 40), c: int(50, 99), d: int(5, 40) },
    interaction: (v) => ({ kind: 'slots', tokens: [`${num(v, 'a')} + ${num(v, 'b')}`, '?', `${num(v, 'c')} − ${num(v, 'd')}`], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a') + num(v, 'b'), num(v, 'c') - num(v, 'd')),
    explanation: ({ vars }) => `${Number(vars.a) + Number(vars.b)} ${signOf(Number(vars.a) + Number(vars.b), Number(vars.c) - Number(vars.d))} ${Number(vars.c) - Number(vars.d)}.`,
  }),
  u06('u06-comparing-to-1000', 'sign-1000', 2, {
    prompt: 'შეადარე სამნიშნა რიცხვები: ჯერ ასეულები, მერე ათეულები. ჩასვი ნიშანი.',
    variables: { a: int(100, 999), b: int(100, 999) },
    interaction: (v) => ({ kind: 'slots', tokens: [String(num(v, 'a')), '?', String(num(v, 'b'))], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a'), num(v, 'b')),
    explanation: ({ vars }) => `${vars.a} ${signOf(Number(vars.a), Number(vars.b))} ${vars.b}.`,
  }),
  u06('u06-sorting-more-less', 'sort-50', 2, {
    prompt: 'დაახარისხე რიცხვები: რომელია 50-ზე ნაკლები და რომელი — 50 ან მეტი?',
    variables: { a: int(1, 99), b: int(1, 99), c: int(1, 99), d: int(1, 99), e: int(1, 99) },
    constraints: [same('a', 'b', 'c', 'd', 'e'), { test: (v) => ['a', 'b', 'c', 'd', 'e'].some((k) => num(v, k) < 50) && ['a', 'b', 'c', 'd', 'e'].some((k) => num(v, k) >= 50), note: 'ორივე' }],
    interaction: (v) => ({ kind: 'bins', bins: ['50-ზე ნაკლები', '50 ან მეტი'], items: ['a', 'b', 'c', 'd', 'e'].map((k) => ({ label: String(num(v, k)) })) }),
    answer: (v) => ['a', 'b', 'c', 'd', 'e'].map((k) => (num(v, k) < 50 ? 0 : 1)).join(','),
    explanation: () => 'ათეულებს შეხედე: 5 ათეულიდან იწყება „50 ან მეტი“.',
  }),
  u06('u06-comparing-two-digit-drag', 'sign-two-digit', 1, {
    prompt: 'ჩასვი სწორი ნიშანი ორნიშნა რიცხვებს შორის.',
    variables: { a: int(10, 99), b: int(10, 99) },
    interaction: (v) => ({ kind: 'slots', tokens: [String(num(v, 'a')), '?', String(num(v, 'b'))], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a'), num(v, 'b')),
    explanation: ({ vars }) => `${vars.a} ${signOf(Number(vars.a), Number(vars.b))} ${vars.b}.`,
  }),
];

/* ------------------------------------------------------------ U07 */
const u07 = T('g2-raodenobis-modelebi', 'u07');
const U07: QuestionTemplate[] = [
  u07('u07-model-from-number', 'build', 1, {
    prompt: 'ააგე მოდელი რიცხვისთვის {n}.',
    variables: { n: int(11, 99) },
    interaction: () => ({ kind: 'build', startTens: 0, startOnes: 0, output: 'number' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} = ${spokenModel(Number(vars.n))}.`,
  }),
  u07('u07-shaded-part-number', 'frame-shade', 1, {
    prompt: 'გააფერადე ჩარჩოში {n} უჯრა.',
    variables: { n: int(1, 10) },
    interaction: () => ({ kind: 'fill', shape: 'frame10', total: 10 }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `მონიშნული უჯრების რაოდენობა ${vars.n} უნდა იყოს.`,
  }),
  u07('u07-grouping-tens-ones', 'group', 2, {
    prompt: 'მოდელში {n} ერთეულია. შეაერთე ათ-ათი ერთეული ათეულებად. რამდენი ათეული და რამდენი ერთეული გახდა?',
    variables: { n: int(11, 29) },
    interaction: (v) => ({ kind: 'build', startTens: 0, startOnes: num(v, 'n'), output: 'pair' }),
    answer: (v) => `${tensOf(num(v, 'n'))},${onesOf(num(v, 'n'))}`,
    explanation: ({ vars }) => `${vars.n} ერთეული = ${spokenModel(Number(vars.n))}.`,
  }),
  u07('u07-adding-with-models', 'add-models', 2, {
    prompt: 'ორი მოდელია: {a} და {b}. შეაერთე ისინი ერთ მოდელში. რა რიცხვი მიიღე?',
    variables: { a: int(11, 60), b: int(11, 38) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 99, note: '≤ 99' }],
    pictures: (v) => [
      { kind: 'blocks', tens: tensOf(num(v, 'a')), ones: onesOf(num(v, 'a')) },
      { kind: 'blocks', tens: tensOf(num(v, 'b')), ones: onesOf(num(v, 'b')) },
    ],
    interaction: () => ({ kind: 'build', startTens: 0, startOnes: 0, output: 'number' }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u07('u07-required-quantity', 'how-many-more', 3, {
    prompt: 'გვაქვს {a} ერთეული ობიექტი, გვჭირდება {n}. ააგე მოდელით ის რაოდენობა, რომელიც კიდევ უნდა დავამატოთ.',
    variables: { a: int(11, 50), m: int(11, 38), n: derived((v) => num(v, 'a') + num(v, 'm')) },
    pictures: (v) => [{ kind: 'blocks', tens: tensOf(num(v, 'a')), ones: onesOf(num(v, 'a')) }],
    interaction: () => ({ kind: 'build', startTens: 0, startOnes: 0, output: 'number' }),
    answer: (v) => num(v, 'm'),
    explanation: ({ vars }) => `${vars.n} − ${vars.a} = ${vars.m}.`,
  }),
];

/* ------------------------------------------------------------ U08 */
const u08 = T('g2-mravalnabijiani-amocanebi', 'u08');
const U08: QuestionTemplate[] = [
  u08('u08-ways-to-add-subtract', 'which-sign', 1, {
    prompt: 'ჩასვი „+“ ან „−“, რომ ტოლობა სწორი იყოს.',
    variables: { a: int(12, 60), b: int(5, 30), op: pick('+', '−') },
    interaction: (v) => ({ kind: 'slots', tokens: [String(num(v, 'a')), '?', String(num(v, 'b')), '=', String(str(v, 'op') === '+' ? num(v, 'a') + num(v, 'b') : num(v, 'a') - num(v, 'b'))], options: ['+', '−'] }),
    answer: (v) => str(v, 'op'),
    explanation: ({ vars }) => `${vars.a} ${vars.op} ${vars.b}.`,
  }),
  u08('u08-true-false-equalities', 'sign-equal', 2, {
    prompt: 'ჩასვი „<“, „>“ ან „=“ ისე, რომ მიიღო ჭეშმარიტი გამონათქვამი.',
    variables: { a: int(10, 40), b: int(5, 30), c: int(10, 60) },
    interaction: (v) => ({ kind: 'slots', tokens: [`${num(v, 'a')} + ${num(v, 'b')}`, '?', String(num(v, 'c'))], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a') + num(v, 'b'), num(v, 'c')),
    explanation: ({ vars }) => `${Number(vars.a) + Number(vars.b)} ${signOf(Number(vars.a) + Number(vars.b), Number(vars.c))} ${vars.c}.`,
  }),
  u08('u08-add-subtract-within-100', 'build', 2, {
    prompt: 'გამოთვალე {a} {op} {b} მოდელზე: დაიწყე {a}-ით და ააგე შედეგი.',
    variables: { a: int(21, 80), b: int(5, 19), op: pick('+', '−') },
    constraints: [{ test: (v) => str(v, 'op') === '−' || num(v, 'a') + num(v, 'b') <= 99, note: '≤ 99' }],
    interaction: (v) => ({ kind: 'build', startTens: tensOf(num(v, 'a')), startOnes: onesOf(num(v, 'a')), output: 'number' }),
    answer: (v) => (str(v, 'op') === '+' ? num(v, 'a') + num(v, 'b') : num(v, 'a') - num(v, 'b')),
    explanation: ({ vars }) => `${vars.a} ${vars.op} ${vars.b} = ${vars.op === '+' ? Number(vars.a) + Number(vars.b) : Number(vars.a) - Number(vars.b)}.`,
  }),
  u08('u08-placing-plus-minus', 'two-signs', 3, {
    prompt: 'ჩასვი ორი ნიშანი („+“ ან „−“), რომ ტოლობა სწორი იყოს.',
    variables: { a: int(20, 50), b: int(5, 15), c: int(5, 15), o1: pick('+', '−'), o2: pick('+', '−') },
    constraints: [
      {
        test: (v) => {
          const calc = (x: string, y: string) => {
            const first = x === '+' ? num(v, 'a') + num(v, 'b') : num(v, 'a') - num(v, 'b');
            return y === '+' ? first + num(v, 'c') : first - num(v, 'c');
          };
          const target = calc(str(v, 'o1'), str(v, 'o2'));
          return ['+', '−'].flatMap((x) => ['+', '−'].map((y) => calc(x, y))).filter((r) => r === target).length === 1;
        },
        note: 'ერთადერთი ამოხსნა',
      },
    ],
    interaction: (v) => {
      const first = str(v, 'o1') === '+' ? num(v, 'a') + num(v, 'b') : num(v, 'a') - num(v, 'b');
      const result = str(v, 'o2') === '+' ? first + num(v, 'c') : first - num(v, 'c');
      return { kind: 'slots', tokens: [String(num(v, 'a')), '?', String(num(v, 'b')), '?', String(num(v, 'c')), '=', String(result)], options: ['+', '−'] };
    },
    answer: (v) => `${str(v, 'o1')},${str(v, 'o2')}`,
    explanation: ({ vars }) => `${vars.a} ${vars.o1} ${vars.b} ${vars.o2} ${vars.c}.`,
  }),
  u08('u08-equalizing-quantities', 'equalize', 2, {
    prompt: 'ერთ თაროზე {a} წიგნია, მეორეზე — {b}. მონიშნე, კიდევ რამდენი წიგნი უნდა დაემატოს პირველ თაროს, რომ ორივეზე ტოლი გახდეს.',
    variables: { a: int(3, 8), b: int(6, 14) },
    constraints: [{ test: (v) => num(v, 'b') > num(v, 'a'), note: 'b > a' }],
    interaction: (v) => ({ kind: 'fill', shape: 'row', total: num(v, 'b'), start: num(v, 'a'), locked: num(v, 'a'), output: 'extra', icon: 'book-blue', noun: 'წიგნი' }),
    answer: (v) => num(v, 'b') - num(v, 'a'),
    explanation: ({ vars }) => `${vars.b} − ${vars.a} = ${Number(vars.b) - Number(vars.a)}.`,
  }),
  u08('u08-distance-problems', 'distance', 2, {
    prompt: 'ბიჭმა დილით {a} მეტრი გაიარა, შემდეგ კიდევ {b} მეტრი. რამდენ მეტრზე აღმოჩნდა სახლიდან? შეეხე რიცხვს ღერძზე.',
    variables: { a: int(5, 30), b: int(5, 20) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 50, note: '≤ 50' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: 50, step: 1, start: num(v, 'a'), labelEvery: 5 }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u08('u08-sorting-add-subtract', 'sort-results', 3, {
    prompt: 'გამოთვალე და დაახარისხე: რომლის შედეგია ლუწი და რომლის — კენტი?',
    variables: { a: int(20, 50), b: int(5, 19), c: int(20, 50), d: int(5, 19), e: int(20, 50), f: int(5, 19) },
    constraints: [{ test: (v) => { const r = [num(v, 'a') + num(v, 'b'), num(v, 'c') - num(v, 'd'), num(v, 'e') + num(v, 'f')]; return r.some((x) => x % 2 === 0) && r.some((x) => x % 2 === 1); }, note: 'ორივე' }],
    interaction: (v) => ({ kind: 'bins', bins: ['ლუწი შედეგი', 'კენტი შედეგი'], items: [`${num(v, 'a')} + ${num(v, 'b')}`, `${num(v, 'c')} − ${num(v, 'd')}`, `${num(v, 'e')} + ${num(v, 'f')}`].map((label) => ({ label })) }),
    answer: (v) => [num(v, 'a') + num(v, 'b'), num(v, 'c') - num(v, 'd'), num(v, 'e') + num(v, 'f')].map((x) => (x % 2 === 0 ? 0 : 1)).join(','),
    explanation: () => 'ჯერ გამოთვალე შედეგი, მერე შეხედე მის ბოლო ციფრს.',
  }),
];

/* ------------------------------------------------------------ U09 */
const u09 = T('g2-damrgvaleba', 'u09');
const roundTo = (n: number, unit: number): number => Math.round(n / unit) * unit;
const U09: QuestionTemplate[] = [
  u09('u09-nearest-5', 'to-5', 1, {
    prompt: 'დაამრგვალე {n} უახლოეს 5-მდე: შეეხე მას რიცხვით ღერძზე.',
    variables: { base: int(0, 90, { step: 5 }), o: pick(1, 2, 3, 4), n: derived((v) => num(v, 'base') + num(v, 'o')) },
    interaction: (v) => ({ kind: 'line', min: num(v, 'base'), max: num(v, 'base') + 5 }),
    answer: (v) => roundTo(num(v, 'n'), 5),
    explanation: ({ vars }) => `${vars.n} უახლოესია ${roundTo(Number(vars.n), 5)}-თან.`,
  }),
  u09('u09-nearest-10', 'to-10', 1, {
    prompt: 'დაამრგვალე {n} უახლოეს ათეულამდე: შეეხე მას რიცხვით ღერძზე.',
    variables: { base: int(0, 90, { step: 10 }), o: pick(1, 2, 3, 4, 6, 7, 8, 9), n: derived((v) => num(v, 'base') + num(v, 'o')) },
    interaction: (v) => ({ kind: 'line', min: num(v, 'base'), max: num(v, 'base') + 10 }),
    answer: (v) => roundTo(num(v, 'n'), 10),
    explanation: ({ vars }) => `${vars.n} უახლოესია ${roundTo(Number(vars.n), 10)}-თან.`,
  }),
  u09('u09-nearest-20', 'to-20', 2, {
    prompt: 'დაამრგვალე {n} უახლოეს 20-მდე: შეეხე მას რიცხვით ღერძზე.',
    variables: { base: int(0, 80, { step: 20 }), o: pick(1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19), n: derived((v) => num(v, 'base') + num(v, 'o')) },
    constraints: [{ test: (v) => num(v, 'o') !== 10, note: 'არა შუა' }],
    interaction: (v) => ({ kind: 'line', min: num(v, 'base'), max: num(v, 'base') + 20, labelEvery: 5 }),
    answer: (v) => roundTo(num(v, 'n'), 20),
    explanation: ({ vars }) => `${vars.n} უახლოესია ${roundTo(Number(vars.n), 20)}-თან.`,
  }),
  u09('u09-rounding-sums', 'sum', 3, {
    prompt: 'გამოთვალე {a} + {b} და შედეგი დაამრგვალე უახლოეს ათეულამდე. შეეხე ათეულს რიცხვით ღერძზე.',
    variables: { a: int(10, 50), b: int(5, 40) },
    constraints: [{ test: (v) => (num(v, 'a') + num(v, 'b')) % 10 !== 5 && num(v, 'a') + num(v, 'b') < 100, note: 'არა შუა' }],
    interaction: () => ({ kind: 'line', min: 0, max: 100, step: 10 }),
    answer: (v) => roundTo(num(v, 'a') + num(v, 'b'), 10),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)} ≈ ${roundTo(Number(vars.a) + Number(vars.b), 10)}.`,
  }),
  u09('u09-rounding-differences', 'difference', 3, {
    prompt: 'გამოთვალე {a} − {b} და შედეგი დაამრგვალე უახლოეს ათეულამდე. შეეხე ათეულს რიცხვით ღერძზე.',
    variables: { a: int(40, 99), b: int(5, 39) },
    constraints: [{ test: (v) => (num(v, 'a') - num(v, 'b')) % 10 !== 5, note: 'არა შუა' }],
    interaction: () => ({ kind: 'line', min: 0, max: 100, step: 10 }),
    answer: (v) => roundTo(num(v, 'a') - num(v, 'b'), 10),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)} ≈ ${roundTo(Number(vars.a) - Number(vars.b), 10)}.`,
  }),
];

/* ------------------------------------------------------------ U10 */
const u10 = T('g2-monacemebi-albatoba', 'u10');
const FRUITS = [
  { icon: 'apple', name: 'ვაშლი' },
  { icon: 'pear', name: 'მსხალი' },
  { icon: 'banana', name: 'ბანანი' },
];
const U10: QuestionTemplate[] = [
  u10('u10-tally-marks', 'tally', 1, {
    prompt: 'ბავშვებმა ხილი აირჩიეს: ვაშლი — {a}, მსხალი — {b}. ჩაწერე თითოეული აღრიცხვის ნიშნებით.',
    variables: { a: int(1, 12), b: int(1, 12) },
    interaction: () => ({ kind: 'counters', style: 'tally', labels: ['ვაშლი', 'მსხალი'], icon: 'apple', max: 15 }),
    answer: (v) => `${num(v, 'a')},${num(v, 'b')}`,
    explanation: ({ vars }) => `ხუთი ჯოხი — ერთი ხუთეული. ვაშლი ${vars.a}, მსხალი ${vars.b}.`,
  }),
  u10('u10-collecting-data', 'bars-from-table', 2, {
    prompt: 'ცხრილი: ვაშლი — {a}, მსხალი — {b}, ბანანი — {c}. ააგე სვეტოვანი დიაგრამა.',
    variables: { a: int(1, 8), b: int(1, 8), c: int(1, 8) },
    interaction: () => ({ kind: 'counters', style: 'bars', labels: FRUITS.map((f) => f.name), icon: 'apple', max: 8 }),
    answer: (v) => `${num(v, 'a')},${num(v, 'b')},${num(v, 'c')}`,
    explanation: ({ vars }) => `სვეტების სიმაღლეებია ${vars.a}, ${vars.b} და ${vars.c}.`,
  }),
  u10('u10-pictograms', 'pictogram', 2, {
    prompt: 'ერთი ⭐ ნიშნავს 2 წიგნს. წიგნები: ზღაპრები — {a}, ენციკლოპედია — {b}. ააგე პიქტოგრამა: რამდენი ვარსკვლავი უნდა დაიხატოს?',
    variables: { x: int(1, 5), y: int(1, 5), a: derived((v) => num(v, 'x') * 2), b: derived((v) => num(v, 'y') * 2) },
    interaction: () => ({ kind: 'counters', style: 'icons', labels: ['ზღაპრები', 'ენციკლოპედია'], icon: 'star', max: 6, per: 2 }),
    answer: (v) => `${num(v, 'x')},${num(v, 'y')}`,
    explanation: ({ vars }) => `${vars.a} ÷ 2 = ${vars.x}, ${vars.b} ÷ 2 = ${vars.y}.`,
  }),
  u10('u10-bar-charts', 'bars', 1, {
    prompt: 'ბავშვებმა სახელმძღვანელოები აირჩიეს: წითელი — {a}, ლურჯი — {b}, მწვანე — {c}. ააგე სვეტოვანი დიაგრამა.',
    variables: { a: int(1, 9), b: int(1, 9), c: int(1, 9) },
    interaction: () => ({ kind: 'counters', style: 'bars', labels: ['წითელი', 'ლურჯი', 'მწვანე'], icon: 'sq-red', max: 9 }),
    answer: (v) => `${num(v, 'a')},${num(v, 'b')},${num(v, 'c')}`,
    explanation: ({ vars }) => `სვეტები: ${vars.a}, ${vars.b}, ${vars.c}.`,
  }),
  u10('u10-dot-plots', 'dots', 2, {
    prompt: 'ქულები: 1 ქულა — {a} მოსწავლე, 2 ქულა — {b} მოსწავლე, 3 ქულა — {c} მოსწავლე. დახატე წერტილოვანი დიაგრამა: ყოველი მოსწავლე ერთი წერტილია.',
    variables: { a: int(0, 6), b: int(1, 6), c: int(0, 6) },
    interaction: () => ({ kind: 'counters', style: 'icons', labels: ['1 ქულა', '2 ქულა', '3 ქულა'], icon: 'dot-blue', max: 8 }),
    answer: (v) => `${num(v, 'a')},${num(v, 'b')},${num(v, 'c')}`,
    explanation: ({ vars }) => `წერტილები: ${vars.a}, ${vars.b}, ${vars.c}.`,
  }),
  u10('u10-possible-impossible', 'dice', 1, {
    prompt: 'ჩვეულებრივ კამათელზე 1-დან 6-მდე რიცხვებია. დაახარისხე მოვლენები: შესაძლებელია თუ შეუძლებელი?',
    variables: { a: int(0, 9), b: int(0, 9), c: int(0, 9), d: int(0, 9) },
    constraints: [same('a', 'b', 'c', 'd'), { test: (v) => ['a', 'b', 'c', 'd'].some((k) => num(v, k) >= 1 && num(v, k) <= 6) && ['a', 'b', 'c', 'd'].some((k) => num(v, k) < 1 || num(v, k) > 6), note: 'ორივე' }],
    interaction: (v) => ({ kind: 'bins', bins: ['შესაძლებელია', 'შეუძლებელია'], items: ['a', 'b', 'c', 'd'].map((k) => ({ label: `კამათელზე ${num(v, k)}` })) }),
    answer: (v) => ['a', 'b', 'c', 'd'].map((k) => (num(v, k) >= 1 && num(v, k) <= 6 ? 0 : 1)).join(','),
    explanation: () => 'კამათელზე მხოლოდ 1, 2, 3, 4, 5, 6 არის.',
  }),
  u10('u10-changing-chances', 'which-more-likely', 2, {
    prompt: 'ჩანთაში {a} წითელი და {b} ლურჯი ბურთია. თვალდახუჭულმა რომელი ფერის ბურთი უფრო მოსალოდნელია, რომ ამოიღოს? შეეხე მას.',
    variables: { a: int(1, 9), b: int(1, 9) },
    constraints: [{ test: (v) => num(v, 'a') !== num(v, 'b'), note: 'არა ტოლი' }],
    pictures: (v) => [rowOf('dot-red', num(v, 'a'), 'წითელი'), rowOf('dot-blue', num(v, 'b'), 'ლურჯი')],
    interaction: () => ({ kind: 'pick', mode: 'one', items: [{ icon: 'dot-red' }, { icon: 'dot-blue' }] }),
    answer: (v) => (num(v, 'a') > num(v, 'b') ? 1 : 2),
    explanation: () => 'უფრო მეტი ბურთის ფერია უფრო მოსალოდნელი.',
  }),
];

/* ------------------------------------------------------------ U11 */
const u11 = T('g2-gazomva-geometria', 'u11');
const FLAT2 = SHAPES.filter((s) => s.sides > 0);
const LENGTH_ITEMS = [
  ['ფანქრის სიგრძე', 1], ['კლასის სიგრძე', 0], ['ეზოს სიგრძე', 0], ['საშლელის სიგრძე', 1], ['ქუჩის სიგრძე', 0], ['ღილის სიგანე', 1], ['ფურცლის სიგრძე', 1], ['კარის სიმაღლე', 0],
] as const;
const WEIGHT_ITEMS = [
  ['ვაშლი', 0], ['ჩანთა სახელმძღვანელოებით', 1], ['კალამი', 0], ['ჩოგბურთის ბურთი', 0], ['ბოსტნეულის ტომარა', 1], ['ბუმბული', 0], ['მეგობარი ბავშვი', 1], ['ფანქარი', 0],
] as const;
const U11: QuestionTemplate[] = [
  u11('u11-meters-and-centimeters', 'ruler', 1, {
    prompt: 'სახაზავზე ლენტი 0-დან იწყება. რამდენ სანტიმეტრზე მთავრდება იგი?',
    variables: { n: int(3, 15) },
    interaction: (v) => ({ kind: 'line', min: 0, max: 15, style: 'ruler', bar: num(v, 'n'), unit: 'სმ' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `ლენტი ${vars.n} სანტიმეტრია.`,
  }),
  u11('u11-units-of-length', 'sort-length', 2, {
    prompt: 'რით გაზომავ? ჩადე თითოეული საგანი მისთვის შესაფერის ყუთში.',
    variables: { rot: int(0, 7) },
    interaction: (v) => ({ kind: 'bins', bins: ['მეტრი', 'სანტიმეტრი'], items: Array.from({ length: 5 }, (_, i) => ({ label: LENGTH_ITEMS[(i + num(v, 'rot')) % 8]![0] })) }),
    answer: (v) => Array.from({ length: 5 }, (_, i) => LENGTH_ITEMS[(i + num(v, 'rot')) % 8]![1]).join(','),
    explanation: () => 'დიდ მანძილს მეტრით ვზომავთ, პატარას — სანტიმეტრით.',
  }),
  u11('u11-units-of-weight', 'sort-weight', 2, {
    prompt: 'რით გავზომავთ წონას? ჩადე საგნები შესაფერის ყუთში.',
    variables: { rot: int(0, 7) },
    interaction: (v) => ({ kind: 'bins', bins: ['გრამი', 'კილოგრამი'], items: Array.from({ length: 5 }, (_, i) => ({ label: WEIGHT_ITEMS[(i + num(v, 'rot')) % 8]![0] })) }),
    answer: (v) => Array.from({ length: 5 }, (_, i) => WEIGHT_ITEMS[(i + num(v, 'rot')) % 8]![1]).join(','),
    explanation: () => 'მსუბუქს გრამით ვზომავთ, მძიმეს — კილოგრამით.',
  }),
  u11('u11-thermometer', 'read', 2, {
    prompt: 'თერმომეტრზე წითელი სვეტი {t}°C-ზე ავიდა. შეეხე ამ დანაყოფს.',
    variables: { h: int(1, 14), t: derived((v) => num(v, 'h') * 2) },
    interaction: (v) => ({ kind: 'line', min: 0, max: 30, step: 2, style: 'thermo', bar: num(v, 't'), unit: '°C', labelEvery: 1 }),
    answer: (v) => num(v, 't'),
    explanation: ({ vars }) => `სვეტის წვერი ${vars.t}°C-ზეა.`,
  }),
  u11('u11-counting-sides', 'mark-sides', 1, {
    prompt: 'ფიგურა — {name}. მონიშნე იმდენი უჯრა, რამდენი გვერდიც აქვს მას.',
    variables: { t: int(0, 4), name: { kind: 'choice', values: (v: Vars) => [FLAT2[num(v, 't')]!.name] } },
    pictures: (v) => [{ kind: 'rows', rows: [{ tokens: [{ t: 'icon', icon: FLAT2[num(v, 't')]!.icon }] }] }],
    interaction: () => ({ kind: 'fill', shape: 'row', total: 8, noun: 'გვერდი', icon: 'dot-blue' }),
    answer: (v) => FLAT2[num(v, 't')]!.sides,
    explanation: ({ vars }) => `${vars.name}-ს ${FLAT2[Number(vars.t)]!.sides} გვერდი აქვს.`,
  }),
  u11('u11-counting-angles', 'mark-angles', 2, {
    prompt: 'ფიგურა — {name}. მონიშნე იმდენი უჯრა, რამდენი კუთხეც აქვს მას.',
    variables: { t: int(0, 4), name: { kind: 'choice', values: (v: Vars) => [FLAT2[num(v, 't')]!.name] } },
    pictures: (v) => [{ kind: 'rows', rows: [{ tokens: [{ t: 'icon', icon: FLAT2[num(v, 't')]!.icon }] }] }],
    interaction: () => ({ kind: 'fill', shape: 'row', total: 8, noun: 'კუთხე', icon: 'dot-red' }),
    answer: (v) => FLAT2[num(v, 't')]!.sides,
    explanation: ({ vars }) => `${vars.name}-ს იმდენი კუთხე აქვს, რამდენი გვერდიც: ${FLAT2[Number(vars.t)]!.sides}.`,
  }),
  u11('u11-grouping-by-sides', 'group', 2, {
    prompt: 'დაახარისხე ფიგურები გვერდების რაოდენობით.',
    variables: { a: int(0, 4), b: int(0, 4), c: int(0, 4), d: int(0, 4), e: int(0, 4) },
    constraints: [{ test: (v) => new Set(['a', 'b', 'c', 'd', 'e'].map((k) => FLAT2[num(v, k)]!.sides >= 5 ? 5 : FLAT2[num(v, k)]!.sides)).size >= 2, note: 'სხვადასხვა ჯგუფი' }],
    interaction: (v) => ({ kind: 'bins', bins: ['3 გვერდი', '4 გვერდი', '5 ან მეტი'], items: ['a', 'b', 'c', 'd', 'e'].map((k) => ({ icon: FLAT2[num(v, k)]!.icon })) }),
    answer: (v) => ['a', 'b', 'c', 'd', 'e'].map((k) => { const s = FLAT2[num(v, k)]!.sides; return s === 3 ? 0 : s === 4 ? 1 : 2; }).join(','),
    explanation: () => 'დათვალე ყოველი ფიგურის გვერდები.',
  }),
  u11('u11-symmetry', 'mirror', 3, {
    prompt: 'წითელი ხაზი სარკეა. შეავსე მარჯვენა მხარე ისე, რომ სურათი სიმეტრიული გახდეს.',
    variables: { r1: int(0, 15), r2: int(0, 15), r3: int(0, 15), r4: int(0, 15) },
    constraints: [{ test: (v) => ['r1', 'r2', 'r3', 'r4'].some((k) => num(v, k) > 0), note: 'არა ცარიელი' }],
    interaction: (v) => ({ kind: 'cells', rows: ['r1', 'r2', 'r3', 'r4'].map((k) => [...num(v, k).toString(2).padStart(4, '0')].map((b) => (b === '1' ? '#' : '.')).join('')) }),
    answer: (v) => ['r1', 'r2', 'r3', 'r4'].map((k) => [...num(v, k).toString(2).padStart(4, '0')].reverse().map((b) => (b === '1' ? '#' : '.')).join('')).join('/'),
    explanation: () => 'სარკეში უჯრები საპირისპირო მხარეს იმავე მანძილზე ჩანს.',
  }),
];

/* ------------------------------------------------------------ U12 */
const u12 = T('g2-fuli', 'u12');
const COINS_G2 = [1, 2, 5, 10, 20, 50];
const minCoins2 = (amount: number): number => {
  let left = amount;
  let count = 0;
  for (const coin of [...COINS_G2].reverse()) {
    count += Math.floor(left / coin);
    left %= coin;
  }
  return count;
};
const U12: QuestionTemplate[] = [
  u12('u12-counting-tetri', 'pay', 1, {
    prompt: 'ჩაიდე ყულაბაში ზუსტად {n} თეთრი.',
    variables: { n: int(6, 99) },
    interaction: () => ({ kind: 'purse', coins: COINS_G2, output: 'total' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `მონეტების ჯამი ${vars.n} თეთრი უნდა იყოს.`,
  }),
  u12('u12-counting-money', 'pay-price', 1, {
    prompt: 'წიგნი ღირს {n} თეთრი. გადაიხადე ზუსტად ამდენი.',
    variables: { n: int(11, 95) },
    pictures: (v) => [{ kind: 'tags', items: [{ amount: num(v, 'n') }] }],
    interaction: () => ({ kind: 'purse', coins: COINS_G2, output: 'total' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `წიგნის ფასია ${vars.n} თეთრი.`,
  }),
  u12('u12-minimum-coins', 'fewest', 3, {
    prompt: 'შეადგინე {n} თეთრი ყველაზე ცოტა მონეტით.',
    variables: { n: int(11, 99) },
    constraints: [{ test: (v) => minCoins2(num(v, 'n')) >= 3, note: 'არა მოსახერხებელი' }],
    interaction: () => ({ kind: 'purse', coins: COINS_G2, output: 'totalCount' }),
    answer: (v) => `${num(v, 'n')}/${minCoins2(num(v, 'n'))}`,
    explanation: ({ vars }) => `${vars.n} თეთრი ყველაზე ცოტა ${minCoins2(Number(vars.n))} მონეტით იკრიბება: დაიწყე უდიდესი მონეტით.`,
  }),
  u12('u12-equivalent-amounts', 'same-value', 2, {
    prompt: 'შეადგინე {n} თეთრი ზუსტად 3 მონეტით.',
    variables: { c1: pick(5, 10, 20, 50), c2: pick(5, 10, 20, 50), c3: pick(1, 2, 5, 10), n: derived((v) => num(v, 'c1') + num(v, 'c2') + num(v, 'c3')) },
    interaction: () => ({ kind: 'purse', coins: COINS_G2, output: 'totalCount' }),
    answer: (v) => `${num(v, 'n')}/3`,
    explanation: ({ vars }) => `მაგალითად: ${vars.c1} + ${vars.c2} + ${vars.c3} = ${vars.n}.`,
  }),
  u12('u12-money-addition-subtraction', 'remaining', 2, {
    prompt: 'გქონდა {a} თეთრი, დახარჯე {b}. ჩაიდე ყულაბაში დარჩენილი თანხა.',
    variables: { a: int(40, 99), b: int(11, 39), left: derived((v) => num(v, 'a') - num(v, 'b')) },
    interaction: () => ({ kind: 'purse', coins: COINS_G2, output: 'total' }),
    answer: (v) => num(v, 'left'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${vars.left}.`,
  }),
  u12('u12-making-one-lari', 'complete-lari', 2, {
    prompt: 'გაქვს {a} თეთრი. ჩაიდე ყულაბაში ის თანხა, რომელიც აკლია 1 ლარამდე (100 თეთრამდე).',
    variables: { a: int(10, 95, { step: 5 }), need: derived((v) => 100 - num(v, 'a')) },
    interaction: () => ({ kind: 'purse', coins: COINS_G2, output: 'total' }),
    answer: (v) => num(v, 'need'),
    explanation: ({ vars }) => `100 − ${vars.a} = ${vars.need}.`,
  }),
  u12('u12-making-one-lari', 'one-lari-coins', 1, {
    prompt: 'შეადგინე 1 ლარი ({c}-თეთრიანი მონეტებით). რამდენი მონეტა დაგჭირდა?',
    variables: { c: pick(10, 20, 50) },
    interaction: (v) => ({ kind: 'purse', coins: [num(v, 'c')], output: 'totalCount' }),
    answer: (v) => `100/${100 / num(v, 'c')}`,
    explanation: ({ vars }) => `100 ÷ ${vars.c} = ${100 / Number(vars.c)} მონეტა.`,
  }),
];

/* ------------------------------------------------------------ U13 */
const u13 = T('g2-dro', 'u13');
const SEASONS: Array<{ name: string; months: number[] }> = [
  { name: 'გაზაფხულის', months: [2, 3, 4] },
  { name: 'ზაფხულის', months: [5, 6, 7] },
  { name: 'შემოდგომის', months: [8, 9, 10] },
  { name: 'ზამთრის', months: [11, 0, 1] },
];
const U13: QuestionTemplate[] = [
  u13('u13-analog-digital-clocks', 'set-time', 1, {
    prompt: 'დააყენე ისრები ისე, რომ საათმა აჩვენოს {h}:{mm}.',
    variables: { h: int(1, 12), m: pick(0, 15, 30, 45), mm: derived((v) => String(num(v, 'm')).padStart(2, '0')) },
    interaction: () => ({ kind: 'clock' }),
    answer: (v) => hhmm(num(v, 'h'), num(v, 'm')),
    time: true,
    explanation: ({ vars }) => `მოკლე ისარი ${vars.h}-ზეა (ან მის გასცდა), გრძელი — ${Number(vars.m) / 5}-ზე.`,
  }),
  u13('u13-analog-digital-clocks', 'set-five-minutes', 2, {
    prompt: 'დააყენე ისრები ისე, რომ საათმა აჩვენოს {h}:{mm}.',
    variables: { h: int(1, 12), m: pick(5, 10, 20, 25, 35, 40, 50, 55), mm: derived((v) => String(num(v, 'm')).padStart(2, '0')) },
    interaction: () => ({ kind: 'clock' }),
    answer: (v) => hhmm(num(v, 'h'), num(v, 'm')),
    time: true,
    explanation: ({ vars }) => `გრძელი ისარი ${Number(vars.m) / 5}-ზეა, რადგან ${vars.m} წუთია.`,
  }),
  u13('u13-days-of-week', 'weekday-after', 1, {
    prompt: 'კვირის რომელი დღე მოდის {day}-ის {where}? შეეხე მას.',
    variables: { i: int(1, 5), where: pick('შემდეგ', 'წინ'), day: { kind: 'choice', values: (v: Vars) => [WEEKDAY_NAMES[num(v, 'i')]!] } },
    interaction: () => ({ kind: 'pick', mode: 'one', items: WEEKDAY_NAMES.map((label) => ({ label })) }),
    answer: (v) => num(v, 'i') + 1 + (str(v, 'where') === 'შემდეგ' ? 1 : -1),
    explanation: ({ vars }) => `${vars.day}-ის ${vars.where} ${WEEKDAY_NAMES[Number(vars.i) + (vars.where === 'შემდეგ' ? 1 : -1)]} არის.`,
  }),
  u13('u13-seasons-and-months', 'season-months', 2, {
    prompt: 'შეეხე ყველა {season} თვეს.',
    variables: { s: int(0, 3), season: { kind: 'choice', values: (v: Vars) => [SEASONS[num(v, 's')]!.name] } },
    interaction: () => ({ kind: 'pick', mode: 'many', items: MONTH_NAMES.map((label) => ({ label })) }),
    answer: (v) => [...SEASONS[num(v, 's')]!.months].sort((a, b) => a - b).map((m) => m + 1).join(','),
    explanation: ({ vars }) => `${vars.season} თვეებია: ${SEASONS[Number(vars.s)]!.months.map((m) => MONTH_NAMES[m]).join(', ')}.`,
  }),
  u13('u13-calendar', 'calendar-day', 2, {
    prompt: 'თვის 1 რიცხვი {first} არის. იპოვე კალენდარში {k}-ე რიცხვი და შეეხე მას.',
    variables: { offset: int(0, 6), k: int(2, 28), first: { kind: 'choice', values: (v: Vars) => [WEEKDAY_NAMES[num(v, 'offset')]!] } },
    interaction: (v) => ({ kind: 'chart', from: 1, to: 30, cols: 7, heads: ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'], offset: num(v, 'offset') }),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `ეს რიცხვი კალენდარში ${vars.k}-ეა.`,
  }),
  u13('u13-calendar', 'calendar-weekday', 3, {
    prompt: 'თვის 1 რიცხვი {first} არის. შეეხე კალენდარში იმ დღეს, რომელიც ამ თვის პირველ {target}-ს შეესაბამება.',
    variables: { offset: int(0, 6), t: int(0, 6), first: { kind: 'choice', values: (v: Vars) => [WEEKDAY_NAMES[num(v, 'offset')]!] }, target: { kind: 'choice', values: (v: Vars) => [WEEKDAY_NAMES[num(v, 't')]!] } },
    interaction: (v) => ({ kind: 'chart', from: 1, to: 30, cols: 7, heads: ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'], offset: num(v, 'offset') }),
    answer: (v) => ((num(v, 't') - num(v, 'offset') + 7) % 7) + 1,
    explanation: ({ vars }) => `პირველი ${vars.target} თვის ${((Number(vars.t) - Number(vars.offset) + 7) % 7) + 1} რიცხვშია.`,
  }),
  u13('u13-time-spent', 'end-time', 2, {
    prompt: 'გაკვეთილი {h}:00-ზე დაიწყო და {k} საათი გაგრძელდა. დააყენე საათზე დასრულების დრო.',
    variables: { h: int(1, 12), k: int(1, 4) },
    interaction: () => ({ kind: 'clock' }),
    answer: (v) => hhmm(num(v, 'h') + num(v, 'k'), 0),
    time: true,
    explanation: ({ vars }) => `${vars.h} + ${vars.k} საათი = ${hhmm(Number(vars.h) + Number(vars.k), 0)}.`,
  }),
  u13('u13-time-spent', 'end-time-half', 3, {
    prompt: 'ფილმი {h}:00-ზე დაიწყო და {k} საათი და 30 წუთი გაგრძელდა. დააყენე საათზე დასრულების დრო.',
    variables: { h: int(1, 12), k: int(1, 3) },
    interaction: () => ({ kind: 'clock' }),
    answer: (v) => hhmm(num(v, 'h') + num(v, 'k'), 30),
    time: true,
    explanation: ({ vars }) => `${vars.h}:00 + ${vars.k} საათი და 30 წუთი = ${hhmm(Number(vars.h) + Number(vars.k), 30)}.`,
  }),
];

/* ------------------------------------------------------------ U14 */
const u14 = T('g2-kanonzomiereba-logika', 'u14');
const PATTERN_ICONS = ['dot-red', 'dot-blue', 'dot-green', 'dot-yellow', 'star', 'heart', 'apple', 'shape-triangle'];
const patternTokens = (v: Vars): { shown: string[]; next: string[]; palette: string[] } => {
  const unit = str(v, 'pat');
  const map: Record<string, string> = { A: PATTERN_ICONS[num(v, 'x')]!, B: PATTERN_ICONS[num(v, 'y')]!, C: PATTERN_ICONS[num(v, 'z')]!, D: PATTERN_ICONS[num(v, 'w')]! };
  const seq = (n: number) => Array.from({ length: n }, (_, i) => map[unit[i % unit.length]!]!);
  const shownLength = unit.length * 2 + 1;
  return { shown: seq(shownLength), next: seq(shownLength + 3).slice(shownLength), palette: [...new Set(Object.values(map))] };
};
const U14: QuestionTemplate[] = [
  u14('u14-repeating-patterns', 'continue', 1, {
    prompt: 'გააგრძელე კანონზომიერება: აირჩიე სამი შემდეგი ფიგურა.',
    variables: { pat: pick('AB', 'AAB', 'ABB', 'ABC', 'AABB', 'ABCD'), x: int(0, 7), y: int(0, 7), z: int(0, 7), w: int(0, 7) },
    constraints: [same('x', 'y', 'z', 'w')],
    interaction: (v) => ({ kind: 'sequence', shown: patternTokens(v).shown, palette: patternTokens(v).palette, length: 3 }),
    answer: (v) => patternTokens(v).next.join(','),
    explanation: ({ vars }) => `კანონზომიერება მეორდება: ${vars.pat}.`,
  }),
  u14('u14-growing-patterns', 'next-number', 2, {
    prompt: 'იპოვე შემდეგი რიცხვი: {a}, {b}, {c}, ? — შეეხე მას რიცხვით ღერძზე.',
    variables: { d: int(2, 6), a: int(0, 8), b: derived((v) => num(v, 'a') + num(v, 'd')), c: derived((v) => num(v, 'a') + 2 * num(v, 'd')) },
    interaction: () => ({ kind: 'line', min: 0, max: 40, labelEvery: 5 }),
    answer: (v) => num(v, 'a') + 3 * num(v, 'd'),
    explanation: ({ vars }) => `ყოველ ჯერზე ემატება ${vars.d}: ${Number(vars.a) + 3 * Number(vars.d)}.`,
  }),
  u14('u14-number-guessing', 'guess', 2, {
    prompt: 'ჩავიფიქრე რიცხვი. დავუმატე {k} და მივიღე {r}. შეეხე ჩაფიქრებულ რიცხვს რიცხვით ღერძზე.',
    variables: { n: int(3, 25), k: int(2, 15), r: derived((v) => num(v, 'n') + num(v, 'k')) },
    interaction: () => ({ kind: 'line', min: 0, max: 40, labelEvery: 5 }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.r} − ${vars.k} = ${vars.n}.`,
  }),
  u14('u14-age-problems', 'age', 2, {
    prompt: 'ნიკა {a} წლისაა, ანა მასზე {d} წლით უმცროსია. რამდენი წლისაა ანა? შეეხე რიცხვს რიცხვით ღერძზე.',
    variables: { a: int(6, 15), d: int(1, 5) },
    constraints: [{ test: (v) => num(v, 'd') < num(v, 'a'), note: 'd < a' }],
    interaction: () => ({ kind: 'line', min: 0, max: 20 }),
    answer: (v) => num(v, 'a') - num(v, 'd'),
    explanation: ({ vars }) => `${vars.a} − ${vars.d} = ${Number(vars.a) - Number(vars.d)}.`,
  }),
  u14('u14-elimination', 'which-number', 2, {
    prompt: 'მე ვარ {lo}-ზე მეტი, {hi}-ზე ნაკლები და {par} რიცხვი. შეეხე ჩემს ნომერს.',
    variables: { lo: int(5, 15), hi: derived((v) => num(v, 'lo') + 6), par: pick('ლუწი', 'კენტი'), pos: int(1, 5) },
    interaction: (v) => {
      const want = str(v, 'par') === 'ლუწი' ? 0 : 1;
      const lo = num(v, 'lo');
      const hi = num(v, 'hi');
      const ok = [];
      for (let n = lo + 1; n < hi; n += 1) if (n % 2 === want) ok.push(n);
      const target = ok[0]!;
      const others = [lo - 1, lo, hi, hi + 1, hi - 1].filter((n) => !(n > lo && n < hi && n % 2 === want));
      const items = [...others.slice(0, 4)];
      items.splice(num(v, 'pos') - 1, 0, target);
      return { kind: 'pick', mode: 'one', items: items.map((n) => ({ label: String(n) })) };
    },
    answer: (v) => num(v, 'pos'),
    explanation: () => 'შეამოწმე ყველა პირობა თითოეულ რიცხვზე.',
  }),
  u14('u14-color-choice', 'colours', 1, {
    prompt: 'აირჩიე მხოლოდ {colour} ფიგურები.',
    variables: { t: int(0, 3), colour: { kind: 'choice', values: (v: Vars) => [['წითელი', 'ლურჯი', 'მწვანე', 'ყვითელი'][num(v, 't')]!] }, c1: int(0, 3), c2: int(0, 3), c3: int(0, 3), c4: int(0, 3), c5: int(0, 3), c6: int(0, 3) },
    constraints: [{ test: (v) => { const n = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].filter((k) => num(v, k) === num(v, 't')).length; return n >= 1 && n <= 3; }, note: '1–3' }],
    interaction: (v) => ({ kind: 'pick', mode: 'many', items: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].map((k) => ({ icon: PATTERN_ICONS[num(v, k)]! })) }),
    answer: (v) => ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].flatMap((k, i) => (num(v, k) === num(v, 't') ? [i + 1] : [])).join(','),
    explanation: ({ vars }) => `სწორია ყველა ${vars.colour} ფიგურა.`,
  }),
  u14('u14-thought-of-number', 'think', 3, {
    prompt: 'ჩავიფიქრე რიცხვი, გავაორმაგე და მივიღე {r}. შეეხე ჩაფიქრებულ რიცხვს რიცხვით ღერძზე.',
    variables: { n: int(2, 20), r: derived((v) => num(v, 'n') * 2) },
    interaction: () => ({ kind: 'line', min: 0, max: 25, labelEvery: 5 }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.r} ÷ 2 = ${vars.n}.`,
  }),
];

/* ------------------------------------------------------------ U15 */
const u15 = T('g2-wiladebi', 'u15');
const shape = (v: Vars): 'bar' | 'circle' => (str(v, 'shape') === 'circle' ? 'circle' : 'bar');
const U15: QuestionTemplate[] = [
  u15('u15-parts-of-a-whole', 'shade-k', 1, {
    prompt: 'ფიგურა {n} ტოლ ნაწილადაა გაყოფილი. გააფერადე {k} ნაწილი.',
    variables: { n: int(3, 8), k: int(1, 7), shape: pick('bar', 'circle') },
    constraints: [{ test: (v) => num(v, 'k') < num(v, 'n'), note: 'k < n' }],
    interaction: (v) => ({ kind: 'fill', shape: shape(v), total: num(v, 'n') }),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${vars.k} ნაწილი ${vars.n}-დან გააფერადე.`,
  }),
  u15('u15-halves', 'shade-half', 1, {
    prompt: 'ფიგურა {n} ტოლ ნაწილადაა გაყოფილი. გააფერადე მისი ნახევარი.',
    variables: { n: pick(2, 4, 6, 8, 10), shape: pick('bar', 'circle') },
    interaction: (v) => ({ kind: 'fill', shape: shape(v), total: num(v, 'n') }),
    answer: (v) => num(v, 'n') / 2,
    explanation: ({ vars }) => `${vars.n}-ის ნახევარია ${Number(vars.n) / 2}.`,
  }),
  u15('u15-thirds', 'shade-third', 2, {
    prompt: 'ფიგურა {n} ტოლ ნაწილადაა გაყოფილი. გააფერადე მისი მესამედი.',
    variables: { n: pick(3, 6, 9), shape: pick('bar', 'circle') },
    interaction: (v) => ({ kind: 'fill', shape: shape(v), total: num(v, 'n') }),
    answer: (v) => num(v, 'n') / 3,
    explanation: ({ vars }) => `${vars.n}-ის მესამედია ${Number(vars.n) / 3}.`,
  }),
  u15('u15-quarters', 'shade-quarter', 2, {
    prompt: 'ფიგურა {n} ტოლ ნაწილადაა გაყოფილი. გააფერადე მისი მეოთხედი.',
    variables: { n: pick(4, 8, 12), shape: pick('bar', 'circle') },
    interaction: (v) => ({ kind: 'fill', shape: shape(v), total: num(v, 'n') }),
    answer: (v) => num(v, 'n') / 4,
    explanation: ({ vars }) => `${vars.n}-ის მეოთხედია ${Number(vars.n) / 4}.`,
  }),
];

export const G2_INTERACTIVE_TEMPLATES: QuestionTemplate[] = [
  ...U01, ...U02, ...U03, ...U04, ...U05, ...U06, ...U07, ...U08, ...U09, ...U10, ...U11, ...U12, ...U13, ...U14, ...U15,
];
