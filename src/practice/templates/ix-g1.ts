/**
 * Grade I — interactive templates.
 *
 * One or more per subtopic where the child can *do* the thing the lesson is
 * about: fill a ten-frame, tap a number on a line, set the clock's hands, build
 * a number from tens and ones, put coins in a purse, sort numbers into bins,
 * mirror a picture. Every answer is checked from the final state of the widget —
 * there is no free-hand drawing anywhere.
 *
 * Wording is new on purpose: these questions ask the child to act, so the
 * sentence is an instruction, not a multiple-choice stem.
 */
import type { QuestionTemplate, Vars } from './types';
import {
  MONTH_NAMES,
  ORDINALS,
  OBJECTS,
  SHAPES,
  WEEKDAY_NAMES,
  hhmm,
  int,
  interactiveSet,
  nounOf,
  num,
  objectVars,
  pick,
  rowOf,
  str,
  twoGroups,
} from './ix-kit';

const T = (topicId: string, unit: string) => interactiveSet(1, topicId, `g1-ix-${unit}`);

const distinct = (...keys: string[]) => ({
  test: (v: Vars) => new Set(keys.map((k) => Number(v[k]))).size === keys.length,
  note: 'რიცხვები განსხვავებულია',
});

/* ------------------------------------------------------------ U01 */
const u01 = T('mdebareoba', 'u01');
const U01: QuestionTemplate[] = [
  u01('datvla-suratebidan', 'put-objects', 1, {
    prompt: 'მონიშნე ზუსტად {n} {noun}: შეეხე უჯრებს, სანამ {n} არ გახდება.',
    variables: { ...objectVars(), n: int(1, 10) },
    interaction: (v) => ({ kind: 'fill', shape: 'row', total: 10, icon: str(v, 'obj'), noun: str(v, 'noun') }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `მონიშნული უნდა იყოს ზუსტად ${vars.n}.`,
  }),
  u01('grZeli-mokle', 'measure-ribbon', 2, {
    prompt: 'ლენტი სახაზავზე 0-დან იწყება. რამდენ სანტიმეტრზე მთავრდება იგი? შეეხე შესაბამის დანაყოფს.',
    variables: { n: int(2, 10) },
    interaction: (v) => ({ kind: 'line', min: 0, max: 10, style: 'ruler', bar: num(v, 'n'), unit: 'სმ' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `ლენტი ${vars.n} სანტიმეტრზე მთავრდება.`,
  }),
];

/* ------------------------------------------------------------ U02 */
const u02 = T('ricxvebi20', 'u02');
const POSITIONS = ['dot-red', 'dot-blue', 'dot-green', 'dot-yellow', 'star', 'heart', 'apple', 'ball'];
const U02: QuestionTemplate[] = [
  u02('ricxvebi1-10', 'frame-ten', 1, {
    prompt: 'აჩვენე რიცხვი {n} ათეულის ჩარჩოში: მონიშნე იმდენი უჯრა, რამდენსაც რიცხვი ამბობს.',
    variables: { n: int(1, 10) },
    interaction: () => ({ kind: 'fill', shape: 'frame10', total: 10 }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `რიცხვი ${vars.n} ნიშნავს ${vars.n} მონიშნულ უჯრას.`,
  }),
  u02('ricxvebi11-20', 'frame-twenty', 2, {
    prompt: 'აჩვენე რიცხვი {n} ორ ჩარჩოში: მონიშნე უჯრები.',
    variables: { n: int(11, 20) },
    interaction: () => ({ kind: 'fill', shape: 'frame20', total: 20 }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `პირველი ჩარჩო ივსება (10), დანარჩენი ${Number(vars.n) - 10} მეორეშია.`,
  }),
  u02('rigobiti', 'nth-in-row', 1, {
    prompt: 'მარცხნიდან შეეხე {ord} ობიექტს.',
    variables: { k: int(1, 8), ord: { kind: 'choice', values: (v: Vars) => [ORDINALS[Number(v.k) - 1]!] }, shift: int(0, 7) },
    interaction: (v) => ({
      kind: 'pick',
      mode: 'one',
      items: Array.from({ length: 8 }, (_, i) => ({ icon: POSITIONS[(i + num(v, 'shift')) % POSITIONS.length]! })),
    }),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `მარცხნიდან ${vars.k}-ე ადგილზე მდგომია სწორი ობიექტი.`,
  }),
  u02('win-nak', 'number-after', 1, {
    prompt: 'რომელი რიცხვი მოდის {n}-ის შემდეგ? შეეხე მას რიცხვით ღერძზე.',
    variables: { n: int(0, 19) },
    interaction: () => ({ kind: 'line', min: 0, max: 20 }),
    answer: (v) => num(v, 'n') + 1,
    explanation: ({ vars }) => `${vars.n}-ის შემდეგ მოდის ${Number(vars.n) + 1}.`,
  }),
  u02('win-nak', 'number-before', 2, {
    prompt: 'რომელი რიცხვი მოდის {n}-მდე, უშუალოდ მის წინ? შეეხე მას რიცხვით ღერძზე.',
    variables: { n: int(1, 20) },
    interaction: () => ({ kind: 'line', min: 0, max: 20 }),
    answer: (v) => num(v, 'n') - 1,
    explanation: ({ vars }) => `${vars.n}-მდე უშუალოდ მოდის ${Number(vars.n) - 1}.`,
  }),
  u02('udidesi-umciresti', 'pick-extreme', 1, {
    prompt: 'შეეხე {which} რიცხვს.',
    variables: {
      a: int(0, 20),
      b: int(0, 20),
      c: int(0, 20),
      which: pick('უდიდეს', 'უმცირეს'),
    },
    constraints: [distinct('a', 'b', 'c')],
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: [num(v, 'a'), num(v, 'b'), num(v, 'c')].map((n) => ({ label: String(n) })) }),
    answer: (v) => {
      const items = [num(v, 'a'), num(v, 'b'), num(v, 'c')];
      const target = str(v, 'which') === 'უდიდეს' ? Math.max(...items) : Math.min(...items);
      return items.indexOf(target) + 1;
    },
    explanation: ({ vars }) => `${vars.which} რიცხვი ამ სამიდან სწორია.`,
  }),
  u02('ricxviTi-xazi20', 'find-on-line', 1, {
    prompt: 'იპოვე რიცხვი {n} რიცხვით ღერძზე და შეეხე მას.',
    variables: { n: int(0, 20) },
    interaction: () => ({ kind: 'line', min: 0, max: 20 }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} ღერძზე ${vars.n} დანაყოფის მოშორებითაა 0-დან.`,
  }),
  u02('luwi-kenti', 'sort-even-odd', 2, {
    prompt: 'დაახარისხე რიცხვები: ლუწები — ერთ ყუთში, კენტები — მეორეში.',
    variables: { a: int(1, 20), b: int(1, 20), c: int(1, 20), d: int(1, 20), e: int(1, 20) },
    constraints: [distinct('a', 'b', 'c', 'd', 'e'), { test: (v) => ['a', 'b', 'c', 'd', 'e'].some((k) => num(v, k) % 2 === 0) && ['a', 'b', 'c', 'd', 'e'].some((k) => num(v, k) % 2 === 1), note: 'ორივე სახეობა არის' }],
    interaction: (v) => ({
      kind: 'bins',
      bins: ['ლუწი', 'კენტი'],
      items: ['a', 'b', 'c', 'd', 'e'].map((k) => ({ label: String(num(v, k)) })),
    }),
    answer: (v) => ['a', 'b', 'c', 'd', 'e'].map((k) => (num(v, k) % 2 === 0 ? 0 : 1)).join(','),
    explanation: () => 'ლუწი რიცხვი წყვილდება ხოლმე, კენტს წყვილი არ ჰყავს: 0, 2, 4, 6, 8 ბოლოვდება ლუწი.',
  }),
];

/* ------------------------------------------------------------ U03 */
const u03 = T('datvla', 'u03');
const U03: QuestionTemplate[] = [
  u03('sruli-datvla', 'count-out', 1, {
    prompt: 'ჩადე კალათაში {n} {noun}: შეეხე უჯრებს.',
    variables: { ...objectVars(), n: int(3, 12) },
    interaction: (v) => ({ kind: 'fill', shape: 'row', total: 12, icon: str(v, 'obj'), noun: str(v, 'noun') }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `დაითვალე ${vars.n} ${vars.noun}.`,
  }),
  u03('win-ukan', 'count-forward', 1, {
    prompt: 'დაიწყე {s}-დან და გადადი {k} ნაბიჯით წინ. რომელ რიცხვზე მოხვდები?',
    variables: { s: int(0, 12), k: int(1, 6) },
    interaction: (v) => ({ kind: 'line', min: 0, max: 20, start: num(v, 's') }),
    answer: (v) => num(v, 's') + num(v, 'k'),
    explanation: ({ vars }) => `${vars.s}-დან ${vars.k} ნაბიჯი წინ — ${Number(vars.s) + Number(vars.k)}.`,
  }),
  u03('win-ukan', 'count-backward', 2, {
    prompt: 'დაიწყე {s}-დან და გადადი {k} ნაბიჯით უკან. რომელ რიცხვზე მოხვდები?',
    variables: { s: int(6, 20), k: int(1, 6) },
    interaction: (v) => ({ kind: 'line', min: 0, max: 20, start: num(v, 's') }),
    answer: (v) => num(v, 's') - num(v, 'k'),
    explanation: ({ vars }) => `${vars.s}-დან ${vars.k} ნაბიჯი უკან — ${Number(vars.s) - Number(vars.k)}.`,
  }),
  u03('100-mde', 'find-on-chart', 1, {
    prompt: 'იპოვე რიცხვი {n} ასეულის ცხრილში და შეეხე მას.',
    variables: { n: int(1, 100) },
    interaction: () => ({ kind: 'chart', from: 1, to: 100, cols: 10 }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `რიცხვი ${vars.n} ცხრილში თავის ადგილზეა.`,
  }),
  u03('atobit-nabijebit', 'count-by-tens', 2, {
    prompt: 'დათვალე ათეულებით: დაიწყე {s}-დან და გადადი {k} ნაბიჯით (თითო ნაბიჯი 10-ია). რომელ რიცხვზე მოხვდები?',
    variables: { s: int(0, 50, { step: 10 }), k: int(1, 4) },
    interaction: (v) => ({ kind: 'line', min: 0, max: 100, step: 10, start: num(v, 's') }),
    answer: (v) => num(v, 's') + 10 * num(v, 'k'),
    explanation: ({ vars }) => `${vars.s} + ${Number(vars.k) * 10} = ${Number(vars.s) + Number(vars.k) * 10}.`,
  }),
  u03('airCe-da-daTvale', 'choose-and-count', 1, {
    prompt: 'აიღე {n} {noun}: შეეხე ზუსტად ამდენ უჯრას.',
    variables: { ...objectVars(), n: int(4, 15) },
    interaction: (v) => ({ kind: 'fill', shape: 'grid', cols: 5, total: 15, icon: str(v, 'obj'), noun: str(v, 'noun') }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `ზუსტად ${vars.n} უნდა იყოს მონიშნული.`,
  }),
];

/* ------------------------------------------------------------ U04 */
const u04 = T('ricxvebi100', 'u04');
const U04: QuestionTemplate[] = [
  u04('aseulis-cxrili', 'find-on-hundred-chart', 1, {
    prompt: 'იპოვე რიცხვი {n} ასეულის ცხრილში.',
    variables: { n: int(11, 99) },
    interaction: () => ({ kind: 'chart', from: 1, to: 100, cols: 10 }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} არის ${Math.floor(Number(vars.n) / 10)}-ე რიგში (ათეულებით) და ${Number(vars.n) % 10} ერთეულით მეტი.`,
  }),
  u04('ateulebi-erteulebi', 'build-number', 1, {
    prompt: 'ააგე რიცხვი {n} ათეულებისა და ერთეულებისგან.',
    variables: { n: int(11, 99) },
    interaction: () => ({ kind: 'build', startTens: 0, startOnes: 0, output: 'number' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} = ${Math.floor(Number(vars.n) / 10)} ათეული და ${Number(vars.n) % 10} ერთეული.`,
  }),
  u04('ricxviTi-xazi100', 'line-window', 2, {
    prompt: 'იპოვე რიცხვი {n} რიცხვით ღერძზე.',
    variables: {
      base: int(0, 80, { step: 10 }),
      o: int(1, 9),
      n: { kind: 'choice', values: (v: Vars) => [num(v, 'base') + num(v, 'o')] },
    },
    interaction: (v) => ({ kind: 'line', min: num(v, 'base'), max: num(v, 'base') + 10 }),
    answer: (v) => num(v, 'base') + num(v, 'o'),
    explanation: ({ vars }) => `${Number(vars.base) + Number(vars.o)} ღერძზე ${vars.base}-ის შემდეგ ${vars.o} დანაყოფზეა.`,
  }),
  u04('mezoblebi', 'neighbour', 1, {
    prompt: 'რომელი რიცხვი მოდის {n}-ის შემდეგ? შეეხე მას.',
    variables: { n: int(10, 19) },
    interaction: () => ({ kind: 'line', min: 10, max: 20 }),
    answer: (v) => num(v, 'n') + 1,
    explanation: ({ vars }) => `${vars.n}-ის შემდეგ მოდის ${Number(vars.n) + 1}.`,
  }),
  u04('luwi-kenti-danayi', 'sort-even-odd-100', 2, {
    prompt: 'ლუწი და კენტი რიცხვები დაალაგე ორ ყუთში. გაიხსენე: რიცხვი ლუწია, თუ ბოლოვდება 0, 2, 4, 6 ან 8-ით.',
    variables: { a: int(10, 99), b: int(10, 99), c: int(10, 99), d: int(10, 99), e: int(10, 99), f: int(10, 99) },
    constraints: [distinct('a', 'b', 'c', 'd', 'e', 'f'), { test: (v) => ['a', 'b', 'c', 'd', 'e', 'f'].some((k) => num(v, k) % 2 === 0) && ['a', 'b', 'c', 'd', 'e', 'f'].some((k) => num(v, k) % 2 === 1), note: 'ორივე სახეობა არის' }],
    interaction: (v) => ({
      kind: 'bins',
      bins: ['ლუწი', 'კენტი'],
      items: ['a', 'b', 'c', 'd', 'e', 'f'].map((k) => ({ label: String(num(v, k)) })),
    }),
    answer: (v) => ['a', 'b', 'c', 'd', 'e', 'f'].map((k) => (num(v, k) % 2 === 0 ? 0 : 1)).join(','),
    explanation: () => 'ბოლო ციფრი გვეუბნება, ლუწია რიცხვი თუ კენტი.',
  }),
];

/* ------------------------------------------------------------ U05 */
const u05 = T('Sedareba', 'u05');
const SIGNS = ['<', '>', '='];
const signOf = (a: number, b: number): string => (a < b ? '<' : a > b ? '>' : '=');
const U05: QuestionTemplate[] = [
  u05('meti-naklebi-toli', 'sign-10', 1, {
    prompt: 'შეადარე რიცხვები და ჩასვი სწორი ნიშანი.',
    variables: { a: int(0, 10), b: int(0, 10) },
    interaction: (v) => ({ kind: 'slots', tokens: [String(num(v, 'a')), '?', String(num(v, 'b'))], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a'), num(v, 'b')),
    explanation: ({ vars }) => `${vars.a} ${signOf(Number(vars.a), Number(vars.b))} ${vars.b}.`,
  }),
  u05('Sedareba10', 'bigger-of-two', 1, {
    prompt: 'შეეხე უფრო დიდ რიცხვს.',
    variables: { a: int(0, 10), b: int(0, 10) },
    constraints: [distinct('a', 'b')],
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: [{ label: String(num(v, 'a')) }, { label: String(num(v, 'b')) }] }),
    answer: (v) => (num(v, 'a') > num(v, 'b') ? 1 : 2),
    explanation: ({ vars }) => `${Math.max(Number(vars.a), Number(vars.b))} უფრო დიდია.`,
  }),
  u05('Sedareba100', 'sign-100', 2, {
    prompt: 'შეადარე ორნიშნა რიცხვები: ჯერ ათეულები, მერე ერთეულები. ჩასვი ნიშანი.',
    variables: { a: int(10, 99), b: int(10, 99) },
    interaction: (v) => ({ kind: 'slots', tokens: [String(num(v, 'a')), '?', String(num(v, 'b'))], options: SIGNS }),
    answer: (v) => signOf(num(v, 'a'), num(v, 'b')),
    explanation: ({ vars }) => `${vars.a} ${signOf(Number(vars.a), Number(vars.b))} ${vars.b}.`,
  }),
  u05('ramdenit-meti', 'how-many-more', 2, {
    prompt: 'ზედა რიგში {a} ობიექტია (უკვე მონიშნულია), ქვედა რიგში — {b}. მონიშნე ის უჯრები, რომლებიც ქვედა რიგში მეტია. რამდენით მეტია?',
    variables: { a: int(2, 7), b: int(4, 10) },
    constraints: [{ test: (v) => num(v, 'b') > num(v, 'a'), note: 'b მეტია a-ზე' }],
    interaction: (v) => ({ kind: 'fill', shape: 'row', total: num(v, 'b'), start: num(v, 'a'), locked: num(v, 'a'), output: 'extra', icon: 'dot-blue', noun: 'მეტი' }),
    pictures: (v) => [rowOf('dot-red', num(v, 'a'), 'ზედა რიგი')],
    answer: (v) => num(v, 'b') - num(v, 'a'),
    explanation: ({ vars }) => `${vars.b} − ${vars.a} = ${Number(vars.b) - Number(vars.a)}.`,
  }),
  u05('SeFaseba-aTeulamde', 'nearest-ten', 2, {
    prompt: 'რომელ ათეულთან არის {n} უფრო ახლოს? შეეხე ამ ათეულს რიცხვით ღერძზე.',
    variables: {
      base: int(0, 90, { step: 10 }),
      o: pick(1, 2, 3, 4, 6, 7, 8, 9),
      n: { kind: 'choice', values: (v: Vars) => [num(v, 'base') + num(v, 'o')] },
    },
    interaction: (v) => ({ kind: 'line', min: num(v, 'base'), max: num(v, 'base') + 10 }),
    answer: (v) => (num(v, 'o') < 5 ? num(v, 'base') : num(v, 'base') + 10),
    explanation: ({ vars }) => `${Number(vars.base) + Number(vars.o)} ახლოსაა ${Number(vars.o) < 5 ? vars.base : Number(vars.base) + 10}-თან.`,
  }),
];

/* ------------------------------------------------------------ U06 */
const u06 = T('Sekreba', 'u06');
const U06: QuestionTemplate[] = [
  u06('ra-aris-Sekreba', 'join-groups', 1, {
    prompt: 'შეაერთე ორი ჯგუფი: მონიშნე უჯრებში, რამდენია სულ.',
    variables: { a: int(1, 6), b: int(1, 4) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 10, note: '≤ 10' }],
    pictures: (v) => [twoGroups('apple', num(v, 'a'), num(v, 'b'))],
    interaction: () => ({ kind: 'fill', shape: 'row', total: 10, icon: 'apple', noun: 'ვაშლი' }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u06('SuratiT-10', 'frame-add', 1, {
    prompt: 'გამოთვალე {a} + {b} ათეულის ჩარჩოში: მონიშნე ჯამის შესაბამისი უჯრები.',
    variables: { a: int(1, 9), b: int(1, 9) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 10, note: '≤ 10' }],
    interaction: () => ({ kind: 'fill', shape: 'frame10', total: 10 }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u06('ricxviT-xazze', 'line-add', 1, {
    prompt: 'რიცხვით ღერძზე დაიწყე {a}-დან და გადადი {b} ნაბიჯით მარჯვნივ. რას უდრის {a} + {b}?',
    variables: { a: int(0, 12), b: int(1, 8) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 20, note: '≤ 20' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: 20, start: num(v, 'a') }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u06('nuli-gakvireba', 'double', 2, {
    prompt: 'გააორმაგე რიცხვი {n}: მონიშნე იმდენი უჯრა, რამდენიც {n} + {n} არის.',
    variables: { ...objectVars(), n: int(1, 5) },
    pictures: (v) => [rowOf(str(v, 'obj'), num(v, 'n'))],
    interaction: () => ({ kind: 'fill', shape: 'frame10', total: 10 }),
    answer: (v) => num(v, 'n') * 2,
    explanation: ({ vars }) => `${vars.n} + ${vars.n} = ${Number(vars.n) * 2}.`,
  }),
  u06('uknobi-SeSveTi', 'missing-addend', 2, {
    prompt: '{a} + ? = {c}. უკვე მონიშნულია {a}. მონიშნე იმდენი ახალი უჯრა, რომ მიიღო {c}. რამდენი დაამატე?',
    variables: { a: int(1, 8), c: int(3, 10) },
    constraints: [{ test: (v) => num(v, 'c') > num(v, 'a'), note: 'c > a' }],
    interaction: (v) => ({ kind: 'fill', shape: 'row', total: num(v, 'c'), start: num(v, 'a'), locked: num(v, 'a'), output: 'extra', icon: 'dot-blue', noun: 'ახალი' }),
    answer: (v) => num(v, 'c') - num(v, 'a'),
    explanation: ({ vars }) => `${vars.c} − ${vars.a} = ${Number(vars.c) - Number(vars.a)}.`,
  }),
];

/* ------------------------------------------------------------ U07 */
const u07 = T('Gamokleba', 'u07');
const U07: QuestionTemplate[] = [
  u07('ra-aris-Gamokleba', 'take-away', 1, {
    prompt: 'იყო {a} {noun}. წაიღეს {b}. გამორთე ის უჯრები, რომლებიც წაიღეს. რამდენი დარჩა?',
    variables: { ...objectVars(), a: int(3, 10), b: int(1, 8) },
    constraints: [{ test: (v) => num(v, 'b') < num(v, 'a'), note: 'b < a' }],
    interaction: (v) => ({ kind: 'fill', shape: 'row', total: num(v, 'a'), start: num(v, 'a'), icon: str(v, 'obj'), noun: str(v, 'noun') }),
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}.`,
  }),
  u07('SuratiT-10-gamokleba', 'frame-subtract', 1, {
    prompt: 'ჩარჩოში {a} მონიშნული უჯრაა. გამოაკელი {b}: გამორთე {b} უჯრა. რამდენი დარჩა?',
    variables: { a: int(3, 10), b: int(1, 8) },
    constraints: [{ test: (v) => num(v, 'b') < num(v, 'a'), note: 'b < a' }],
    interaction: (v) => ({ kind: 'fill', shape: 'frame10', total: 10, start: num(v, 'a') }),
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}.`,
  }),
  u07('xazze-gamokleba', 'line-subtract', 1, {
    prompt: 'რიცხვით ღერძზე დაიწყე {a}-დან და გადადი {b} ნაბიჯით მარცხნივ. რას უდრის {a} − {b}?',
    variables: { a: int(5, 20), b: int(1, 8) },
    constraints: [{ test: (v) => num(v, 'b') < num(v, 'a'), note: 'b < a' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: 20, start: num(v, 'a') }),
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}.`,
  }),
  u07('uknobi-ricxvi', 'missing-subtrahend', 2, {
    prompt: '{a} − ? = {c}. რიგში {a} ობიექტია. გამორთე ისე, რომ დარჩეს {c}. რამდენი გამოირთო?',
    variables: { a: int(4, 10), c: int(0, 8) },
    constraints: [{ test: (v) => num(v, 'c') < num(v, 'a'), note: 'c < a' }],
    interaction: (v) => ({ kind: 'fill', shape: 'row', total: num(v, 'a'), start: num(v, 'a'), output: 'off', icon: 'dot-blue', noun: 'გამოირთო' }),
    answer: (v) => num(v, 'a') - num(v, 'c'),
    explanation: ({ vars }) => `${vars.a} − ${Number(vars.a) - Number(vars.c)} = ${vars.c}.`,
  }),
];

/* ------------------------------------------------------------ U08 */
const u08 = T('ateulebi-orcifra', 'u08');
const U08: QuestionTemplate[] = [
  u08('ateulebi-ateulebi', 'add-tens', 1, {
    prompt: 'ათეულებით ააგე ჯამი: {a} ათეული და კიდევ {b} ათეული. რა რიცხვი მიიღე?',
    variables: { a: int(1, 7), b: int(1, 3) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 10, note: '≤ 10 ათეული' }],
    interaction: (v) => ({ kind: 'build', startTens: num(v, 'a'), startOnes: 0, output: 'number' }),
    answer: (v) => (num(v, 'a') + num(v, 'b')) * 10,
    explanation: ({ vars }) => `${vars.a}0 + ${vars.b}0 = ${(Number(vars.a) + Number(vars.b)) * 10}.`,
  }),
  u08('ateulebis-gamokleba', 'subtract-tens', 1, {
    prompt: 'მოდელში {a} ათეულია. ამოიღე {b} ათეული. რა რიცხვი დარჩა?',
    variables: { a: int(2, 9), b: int(1, 8) },
    constraints: [{ test: (v) => num(v, 'b') < num(v, 'a'), note: 'b < a' }],
    interaction: (v) => ({ kind: 'build', startTens: num(v, 'a'), startOnes: 0, output: 'number' }),
    answer: (v) => (num(v, 'a') - num(v, 'b')) * 10,
    explanation: ({ vars }) => `${vars.a}0 − ${vars.b}0 = ${(Number(vars.a) - Number(vars.b)) * 10}.`,
  }),
  u08('orcifra-ertcifra', 'add-ones', 1, {
    prompt: 'მოდელში არის {t} ათეული და {o} ერთეული. დაამატე {k} ერთეული. რა რიცხვი მიიღე?',
    variables: { t: int(1, 8), o: int(0, 6), k: int(1, 3) },
    constraints: [{ test: (v) => num(v, 'o') + num(v, 'k') <= 9, note: 'გადაჯგუფების გარეშე' }],
    interaction: (v) => ({ kind: 'build', startTens: num(v, 't'), startOnes: num(v, 'o'), output: 'number' }),
    answer: (v) => num(v, 't') * 10 + num(v, 'o') + num(v, 'k'),
    explanation: ({ vars }) => `${Number(vars.t) * 10 + Number(vars.o)} + ${vars.k} = ${Number(vars.t) * 10 + Number(vars.o) + Number(vars.k)}.`,
  }),
  u08('gadajgufebiT', 'add-with-trade', 2, {
    prompt: 'მოდელში არის {t} ათეული და {o} ერთეული. დაამატე {k} ერთეული, შემდეგ 10 ერთეული შეცვალე 1 ათეულით. რა რიცხვი მიიღე?',
    variables: { t: int(1, 8), o: int(5, 9), k: int(3, 6) },
    constraints: [{ test: (v) => num(v, 'o') + num(v, 'k') >= 10 && num(v, 'o') + num(v, 'k') <= 19, note: 'გადაჯგუფებით' }],
    interaction: (v) => ({ kind: 'build', startTens: num(v, 't'), startOnes: num(v, 'o'), output: 'number' }),
    answer: (v) => num(v, 't') * 10 + num(v, 'o') + num(v, 'k'),
    explanation: ({ vars }) => `${vars.o} + ${vars.k} = ${Number(vars.o) + Number(vars.k)}: ეს 1 ათეული და ${Number(vars.o) + Number(vars.k) - 10} ერთეულია.`,
  }),
  u08('esveTis-chamowerTa', 'subtract-with-trade', 3, {
    prompt: 'მოდელში არის {t} ათეული და {o} ერთეული. ამოიღე {k} ერთეული (საჭიროა 1 ათეულის ერთეულებად გადაქცევა). რა რიცხვი დარჩა?',
    variables: { t: int(2, 9), o: int(0, 4), k: int(5, 9) },
    constraints: [{ test: (v) => num(v, 'k') > num(v, 'o'), note: 'k > o' }],
    interaction: (v) => ({ kind: 'build', startTens: num(v, 't'), startOnes: num(v, 'o'), output: 'number' }),
    answer: (v) => num(v, 't') * 10 + num(v, 'o') - num(v, 'k'),
    explanation: ({ vars }) => `${Number(vars.t) * 10 + Number(vars.o)} − ${vars.k} = ${Number(vars.t) * 10 + Number(vars.o) - Number(vars.k)}.`,
  }),
];

/* ------------------------------------------------------------ U09 */
const u09 = T('Sereuli-amocanebi', 'u09');
const U09: QuestionTemplate[] = [
  u09('romeli-moqmedeba', 'which-sign', 1, {
    prompt: 'ჩასვი „+“ ან „−“, რომ ტოლობა სწორი იყოს.',
    variables: { a: int(2, 12), b: int(1, 8), op: pick('+', '−') },
    constraints: [{ test: (v) => num(v, 'b') < num(v, 'a'), note: 'b < a' }],
    interaction: (v) => ({
      kind: 'slots',
      tokens: [String(num(v, 'a')), '?', String(num(v, 'b')), '=', String(str(v, 'op') === '+' ? num(v, 'a') + num(v, 'b') : num(v, 'a') - num(v, 'b'))],
      options: ['+', '−'],
    }),
    answer: (v) => str(v, 'op'),
    explanation: ({ vars }) => `${vars.a} ${vars.op} ${vars.b} ამ შედეგს იძლევა.`,
  }),
  u09('20-mde', 'line-20', 1, {
    prompt: 'გამოთვალე {a} + {b} რიცხვით ღერძზე: დაიწყე {a}-დან და გადადი {b} ნაბიჯით.',
    variables: { a: int(4, 12), b: int(2, 8) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 20, note: '≤ 20' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: 20, start: num(v, 'a') }),
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u09('ori-nabiji', 'two-jumps', 2, {
    prompt: 'დაიწყე {a}-დან, გადადი {b} ნაბიჯით წინ, შემდეგ {c} ნაბიჯით უკან. რომელ რიცხვზე მოხვდი?',
    variables: { a: int(3, 10), b: int(2, 8), c: int(1, 6) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'b') <= 20 && num(v, 'c') <= num(v, 'a') + num(v, 'b'), note: 'ღერძის ფარგლებშია' }],
    interaction: (v) => ({ kind: 'line', min: 0, max: 20, start: num(v, 'a') }),
    answer: (v) => num(v, 'a') + num(v, 'b') - num(v, 'c'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} − ${vars.c} = ${Number(vars.a) + Number(vars.b) - Number(vars.c)}.`,
  }),
  u09('martali-tolobebi', 'two-signs', 3, {
    prompt: 'ჩასვი ორი ნიშანი („+“ ან „−“) ისე, რომ ტოლობა სწორი იყოს.',
    variables: { a: int(4, 12), b: int(1, 6), c: int(1, 6), o1: pick('+', '−'), o2: pick('+', '−') },
    constraints: [
      { test: (v) => num(v, 'a') - num(v, 'b') - num(v, 'c') >= 0, note: 'არ გავიდეს 0-ის ქვემოთ' },
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
];

/* ------------------------------------------------------------ U10 */
const u10 = T('raodenobis-modeli', 'u10');
const U10: QuestionTemplate[] = [
  u10('ateuli-erteuli-modeli', 'build-tens-ones', 1, {
    prompt: 'ააგე მოდელი: {t} ათეული და {o} ერთეული. რა რიცხვია ეს?',
    variables: { t: int(1, 9), o: int(0, 9) },
    interaction: () => ({ kind: 'build', startTens: 0, startOnes: 0, output: 'number' }),
    answer: (v) => num(v, 't') * 10 + num(v, 'o'),
    explanation: ({ vars }) => `${vars.t} ათეული და ${vars.o} ერთეული — ${Number(vars.t) * 10 + Number(vars.o)}.`,
  }),
  u10('modelidan-ricxvi', 'copy-the-model', 2, {
    prompt: 'აქ ნაჩვენებია მოდელი. ააგე ისეთივე და დააფიქსირე რიცხვი.',
    variables: { t: int(1, 9), o: int(0, 9) },
    pictures: (v) => [{ kind: 'blocks', tens: num(v, 't'), ones: num(v, 'o') }],
    interaction: () => ({ kind: 'build', startTens: 0, startOnes: 0, output: 'number' }),
    answer: (v) => num(v, 't') * 10 + num(v, 'o'),
    explanation: ({ vars }) => `${vars.t} ათეული და ${vars.o} ერთეული — ${Number(vars.t) * 10 + Number(vars.o)}.`,
  }),
  u10('ricxvidan-modeli', 'model-from-number', 1, {
    prompt: 'ააგე რიცხვი {n} ათეულებისა და ერთეულებისგან.',
    variables: { n: int(11, 99) },
    interaction: () => ({ kind: 'build', startTens: 0, startOnes: 0, output: 'number' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} = ${Math.floor(Number(vars.n) / 10)} ათეული და ${Number(vars.n) % 10} ერთეული.`,
  }),
  u10('ateulidan-erteulebamde', 'trade-ten', 2, {
    prompt: 'მოდელში არის {t} ათეული და {o} ერთეული. გადააქციე 1 ათეული 10 ერთეულად. რამდენი ათეული და რამდენი ერთეული გახდა?',
    variables: { t: int(2, 9), o: int(0, 9) },
    interaction: (v) => ({ kind: 'build', startTens: num(v, 't'), startOnes: num(v, 'o'), output: 'pair' }),
    answer: (v) => `${num(v, 't') - 1},${num(v, 'o') + 10}`,
    explanation: ({ vars }) => `1 ათეული = 10 ერთეული, ამიტომ ${Number(vars.t) - 1} ათეული და ${Number(vars.o) + 10} ერთეული.`,
  }),
  u10('sawyisi-raodenoba', 'how-many-more', 2, {
    prompt: 'გვჭირდება {n} {noun}, უკვე გვაქვს {a}. მონიშნე, კიდევ რამდენი გვჭირდება.',
    variables: { ...objectVars(), n: int(5, 10), a: int(1, 8) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'n'), note: 'a < n' }],
    interaction: (v) => ({ kind: 'fill', shape: 'row', total: num(v, 'n'), start: num(v, 'a'), locked: num(v, 'a'), output: 'extra', icon: str(v, 'obj'), noun: str(v, 'noun') }),
    answer: (v) => num(v, 'n') - num(v, 'a'),
    explanation: ({ vars }) => `${vars.n} − ${vars.a} = ${Number(vars.n) - Number(vars.a)}.`,
  }),
];

/* ------------------------------------------------------------ U11 */
const u11 = T('kanonzomiereba', 'u11');
const PATTERN_ICONS = ['dot-red', 'dot-blue', 'dot-green', 'dot-yellow', 'star', 'heart', 'apple', 'shape-triangle'];
const patternTokens = (v: Vars): { shown: string[]; next: string[]; palette: string[] } => {
  const unit = str(v, 'pat');
  const map: Record<string, string> = { A: PATTERN_ICONS[num(v, 'x')]!, B: PATTERN_ICONS[num(v, 'y')]!, C: PATTERN_ICONS[num(v, 'z')]! };
  const seq = (n: number) => Array.from({ length: n }, (_, i) => map[unit[i % unit.length]!]!);
  const shownLength = unit.length * 2 + 1;
  return { shown: seq(shownLength), next: seq(shownLength + 2).slice(shownLength), palette: [...new Set(Object.values(map))] };
};
const U11: QuestionTemplate[] = [
  u11('gameorebadi', 'continue-pattern', 1, {
    prompt: 'გააგრძელე კანონზომიერება: აირჩიე ორი შემდეგი ფიგურა.',
    variables: { pat: pick('AB', 'AAB', 'ABB', 'ABC'), x: int(0, 7), y: int(0, 7), z: int(0, 7) },
    constraints: [distinct('x', 'y', 'z')],
    interaction: (v) => ({ kind: 'sequence', shown: patternTokens(v).shown, palette: patternTokens(v).palette, length: 2 }),
    answer: (v) => patternTokens(v).next.join(','),
    explanation: ({ vars }) => `კანონზომიერება მეორდება: ${vars.pat}.`,
  }),
  u11('mzardi', 'next-growing', 2, {
    prompt: 'რიცხვები იზრდება ყოველ ჯერზე {d}-ით: {a}, {b}, {c}, ? — შეეხე შემდეგ რიცხვს რიცხვით ღერძზე.',
    variables: {
      a: int(0, 4),
      d: int(1, 3),
      b: { kind: 'choice', values: (v: Vars) => [num(v, 'a') + num(v, 'd')] },
      c: { kind: 'choice', values: (v: Vars) => [num(v, 'a') + 2 * num(v, 'd')] },
    },
    interaction: () => ({ kind: 'line', min: 0, max: 20 }),
    answer: (v) => num(v, 'a') + 3 * num(v, 'd'),
    explanation: ({ vars }) => `${Number(vars.a) + 2 * Number(vars.d)} + ${vars.d} = ${Number(vars.a) + 3 * Number(vars.d)}.`,
  }),
  u11('ricxviTi-mimdevroba', 'next-shrinking', 3, {
    prompt: 'რიცხვები მცირდება ყოველ ჯერზე {d}-ით: {a}, {b}, {c}, ? — შეეხე შემდეგ რიცხვს.',
    variables: {
      a: int(10, 20),
      d: int(1, 3),
      b: { kind: 'choice', values: (v: Vars) => [num(v, 'a') - num(v, 'd')] },
      c: { kind: 'choice', values: (v: Vars) => [num(v, 'a') - 2 * num(v, 'd')] },
    },
    interaction: () => ({ kind: 'line', min: 0, max: 20 }),
    answer: (v) => num(v, 'a') - 3 * num(v, 'd'),
    explanation: ({ vars }) => `${Number(vars.a) - 2 * Number(vars.d)} − ${vars.d} = ${Number(vars.a) - 3 * Number(vars.d)}.`,
  }),
];

/* ------------------------------------------------------------ U12 */
const u12 = T('geometria', 'u12');
const FLAT = SHAPES.filter((s) => s.sides > 0);
const shapeItems = (v: Vars, keys: string[]) => keys.map((k) => ({ icon: FLAT[num(v, k)]!.icon }));
const U12: QuestionTemplate[] = [
  u12('brtyeli-formebi', 'tap-all-shape', 1, {
    prompt: 'შეეხე ყველა {name}-ს.',
    variables: {
      t: int(0, 4),
      name: { kind: 'choice', values: (v: Vars) => [FLAT[num(v, 't')]!.name] },
      s1: int(0, 4),
      s2: int(0, 4),
      s3: int(0, 4),
      s4: int(0, 4),
      s5: int(0, 4),
      s6: int(0, 4),
    },
    constraints: [
      { test: (v) => { const n = ['s1', 's2', 's3', 's4', 's5', 's6'].filter((k) => num(v, k) === num(v, 't')).length; return n >= 1 && n <= 3; }, note: '1–3 სამიზნე' },
      { test: (v) => FLAT[num(v, 't')]!.name !== 'მართკუთხედი' || ['s1', 's2', 's3', 's4', 's5', 's6'].every((k) => FLAT[num(v, k)]!.name !== 'კვადრატი'), note: 'კვადრატი არ ერევა' },
    ],
    interaction: (v) => ({ kind: 'pick', mode: 'many', items: shapeItems(v, ['s1', 's2', 's3', 's4', 's5', 's6']) }),
    answer: (v) => ['s1', 's2', 's3', 's4', 's5', 's6'].flatMap((k, i) => (num(v, k) === num(v, 't') ? [i + 1] : [])).join(','),
    explanation: ({ vars }) => `სწორია ყველა ${vars.name}.`,
  }),
  u12('msgavsi-formebi', 'odd-one-out', 2, {
    prompt: 'ერთი ფიგურა დანარჩენებისგან განსხვავდება. შეეხე მას.',
    variables: { same: int(0, 4), odd: int(0, 4), pos: int(1, 5) },
    constraints: [{ test: (v) => num(v, 'same') !== num(v, 'odd') && !(['კვადრატი', 'მართკუთხედი'].includes(FLAT[num(v, 'same')]!.name) && ['კვადრატი', 'მართკუთხედი'].includes(FLAT[num(v, 'odd')]!.name)), note: 'ადვილად გასარჩევია' }],
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: Array.from({ length: 5 }, (_, i) => ({ icon: FLAT[i + 1 === num(v, 'pos') ? num(v, 'odd') : num(v, 'same')]!.icon })) }),
    answer: (v) => num(v, 'pos'),
    explanation: () => 'სხვა ფორმის ფიგურაა სწორი პასუხი.',
  }),
  u12('gverdebis-datvla', 'mark-sides', 2, {
    prompt: 'ფიგურა — {name}. მონიშნე იმდენი უჯრა, რამდენი გვერდიც აქვს ამ ფიგურას.',
    variables: { t: int(1, 5), name: { kind: 'choice', values: (v: Vars) => [SHAPES[num(v, 't')]!.name] } },
    pictures: (v) => [{ kind: 'rows', rows: [{ tokens: [{ t: 'icon', icon: SHAPES[num(v, 't')]!.icon }] }] }],
    interaction: () => ({ kind: 'fill', shape: 'row', total: 8, noun: 'გვერდი', icon: 'dot-blue' }),
    answer: (v) => SHAPES[num(v, 't')]!.sides,
    explanation: ({ vars }) => `${vars.name}-ს ${SHAPES[Number(vars.t)]!.sides} გვერდი აქვს.`,
  }),
  u12('simetria', 'mirror-image', 3, {
    prompt: 'წითელი ხაზი სარკეა. შეავსე მარჯვენა მხარე ისე, რომ სურათი სიმეტრიული გახდეს.',
    variables: { r1: int(0, 7), r2: int(0, 7), r3: int(0, 7), r4: int(0, 7) },
    constraints: [{ test: (v) => ['r1', 'r2', 'r3', 'r4'].some((k) => num(v, k) > 0), note: 'არა ცარიელი' }],
    interaction: (v) => ({ kind: 'cells', rows: ['r1', 'r2', 'r3', 'r4'].map((k) => [...num(v, k).toString(2).padStart(3, '0')].map((b) => (b === '1' ? '#' : '.')).join('')) }),
    answer: (v) => ['r1', 'r2', 'r3', 'r4'].map((k) => [...num(v, k).toString(2).padStart(3, '0')].reverse().map((b) => (b === '1' ? '#' : '.')).join('')).join('/'),
    explanation: () => 'სარკეში ყოველი უჯრა საპირისპირო მხარეს ზუსტად ისევე ჩანს.',
  }),
];

/* ------------------------------------------------------------ U13 */
const u13 = T('dro', 'u13');
const U13: QuestionTemplate[] = [
  u13('saatis-wakitxva', 'set-oclock', 1, {
    prompt: 'დააყენე საათის ისრები ისე, რომ საათმა აჩვენოს {h}:00.',
    variables: { h: int(1, 12) },
    interaction: () => ({ kind: 'clock' }),
    answer: (v) => hhmm(num(v, 'h'), 0),
    time: true,
    explanation: ({ vars }) => `${vars.h} საათზე გრძელი ისარი 12-ზეა, მოკლე კი ${vars.h}-ზე.`,
  }),
  u13('saatis-wakitxva', 'set-half', 2, {
    prompt: 'დააყენე ისრები ისე, რომ საათმა აჩვენოს {h}:30 (ნახევარი).',
    variables: { h: int(1, 12) },
    interaction: () => ({ kind: 'clock' }),
    answer: (v) => hhmm(num(v, 'h'), 30),
    time: true,
    explanation: ({ vars }) => `ნახევარზე გრძელი ისარი 6-ზეა, მოკლე კი ${vars.h}-ზე გასცდა.`,
  }),
  u13('kviris-dgeebi', 'next-weekday', 1, {
    prompt: 'კვირის რომელი დღე მოდის {day}-ის შემდეგ? შეეხე მას.',
    variables: { i: int(0, 5), day: { kind: 'choice', values: (v: Vars) => [WEEKDAY_NAMES[num(v, 'i')]!] } },
    interaction: () => ({ kind: 'pick', mode: 'one', items: WEEKDAY_NAMES.map((label) => ({ label })) }),
    answer: (v) => num(v, 'i') + 2,
    explanation: ({ vars }) => `${vars.day}-ის შემდეგ მოდის ${WEEKDAY_NAMES[Number(vars.i) + 1]}.`,
  }),
  u13('Tveebi-seasonebi', 'next-month', 1, {
    prompt: 'რომელი თვე მოდის {month}-ის შემდეგ? შეეხე მას.',
    variables: { i: int(0, 10), month: { kind: 'choice', values: (v: Vars) => [MONTH_NAMES[num(v, 'i')]!] } },
    interaction: () => ({ kind: 'pick', mode: 'one', items: MONTH_NAMES.map((label) => ({ label })) }),
    answer: (v) => num(v, 'i') + 2,
    explanation: ({ vars }) => `${vars.month}-ის შემდეგ მოდის ${MONTH_NAMES[Number(vars.i) + 1]}.`,
  }),
  u13('drois-amocanebi', 'hours-later', 2, {
    prompt: 'ახლა {h}:00 საათია. {k} საათის შემდეგ რომელი დრო იქნება? დააყენე ეს დრო საათზე.',
    variables: { h: int(1, 12), k: int(1, 5) },
    interaction: () => ({ kind: 'clock' }),
    answer: (v) => hhmm(num(v, 'h') + num(v, 'k'), 0),
    time: true,
    explanation: ({ vars }) => `${vars.h} + ${vars.k} საათი = ${hhmm(Number(vars.h) + Number(vars.k), 0)}.`,
  }),
  u13('sxva-dro', 'half-hour-later', 3, {
    prompt: 'ახლა {h}:00 საათია. ნახევარი საათის შემდეგ რომელი დრო იქნება? დააყენე საათზე.',
    variables: { h: int(1, 12) },
    interaction: () => ({ kind: 'clock' }),
    answer: (v) => hhmm(num(v, 'h'), 30),
    time: true,
    explanation: ({ vars }) => `${vars.h}:00-ს ნახევარი საათი რომ დაემატოს, გახდება ${vars.h}:30.`,
  }),
];

/* ------------------------------------------------------------ U14 */
const u14 = T('fasebi', 'u14');
const COINS_G1 = [1, 2, 5, 10, 20, 50];
const minCoins = (amount: number): number => {
  let left = amount;
  let count = 0;
  for (const coin of [...COINS_G1].reverse()) {
    count += Math.floor(left / coin);
    left %= coin;
  }
  return count;
};
const U14: QuestionTemplate[] = [
  u14('monetebis-vertoba', 'pay-exactly', 1, {
    prompt: 'ჩაიდე ყულაბაში ზუსტად {n} თეთრი. აირჩიე მონეტები.',
    variables: { n: int(3, 40) },
    interaction: () => ({ kind: 'purse', coins: COINS_G1, output: 'total' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `მონეტების ჯამი ${vars.n} თეთრი უნდა იყოს.`,
  }),
  u14('fulis-amocanebi', 'pay-price', 2, {
    prompt: 'სათამაშო ღირს {n} თეთრი. გადაიხადე ზუსტად ამდენი.',
    variables: { n: int(5, 60) },
    pictures: (v) => [{ kind: 'tags', items: [{ amount: num(v, 'n') }] }],
    interaction: () => ({ kind: 'purse', coins: COINS_G1, output: 'total' }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `სათამაშოს ფასია ${vars.n} თეთრი.`,
  }),
  u14('tolzRvari-monetebi', 'only-one-kind', 2, {
    prompt: 'შეადგინე {n} თეთრი მხოლოდ {c}-თეთრიანი მონეტებით. რამდენი მონეტა დაგჭირდა?',
    variables: {
      c: pick(2, 5, 10, 20),
      k: int(2, 5),
      n: { kind: 'choice', values: (v: Vars) => [num(v, 'c') * num(v, 'k')] },
    },
    interaction: (v) => ({ kind: 'purse', coins: [num(v, 'c')], output: 'totalCount' }),
    answer: (v) => `${num(v, 'c') * num(v, 'k')}/${num(v, 'k')}`,
    explanation: ({ vars }) => `${vars.k} მონეტა ${vars.c} თეთრიანით = ${Number(vars.c) * Number(vars.k)} თეთრი.`,
  }),
  u14('yvelaze-cota-monetebi', 'fewest-coins', 3, {
    prompt: 'შეადგინე {n} თეთრი ყველაზე ცოტა მონეტით.',
    variables: { n: pick(7, 12, 15, 17, 23, 25, 30, 35, 37, 40, 45, 48) },
    interaction: () => ({ kind: 'purse', coins: COINS_G1, output: 'totalCount' }),
    answer: (v) => `${num(v, 'n')}/${minCoins(num(v, 'n'))}`,
    explanation: ({ vars }) => `${vars.n} თეთრი ყველაზე ცოტა ${minCoins(Number(vars.n))} მონეტით იკრიბება: დაიწყე ყველაზე დიდი მონეტით.`,
  }),
];

/* ------------------------------------------------------------ U15 */
const u15 = T('toli-nawilebi', 'u15');
const FRACTION_WORDS: Record<number, string> = { 2: 'ნახევარი', 3: 'მესამედი', 4: 'მეოთხედი' };
const U15: QuestionTemplate[] = [
  u15('diagramiT-gayofa', 'shade-half', 1, {
    prompt: 'ფიგურა გაყოფილია ტოლ ნაწილებად. გააფერადე მისი ნახევარი: შეეხე ნაწილებს.',
    variables: { total: pick(2, 4, 6, 8), shape: pick('bar', 'circle') },
    interaction: (v) => ({ kind: 'fill', shape: str(v, 'shape') as 'bar' | 'circle', total: num(v, 'total') }),
    answer: (v) => num(v, 'total') / 2,
    explanation: ({ vars }) => `${vars.total} ნაწილის ნახევარია ${Number(vars.total) / 2}.`,
  }),
  u15('diagramiT-gayofa', 'shade-quarter', 2, {
    prompt: 'ფიგურა 4 ტოლ ნაწილადაა გაყოფილი. გააფერადე {k} ნაწილი.',
    variables: { k: int(1, 3), shape: pick('bar', 'circle') },
    interaction: (v) => ({ kind: 'fill', shape: str(v, 'shape') as 'bar' | 'circle', total: 4 }),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `მონიშნული უნდა იყოს ${vars.k} ნაწილი 4-დან.`,
  }),
  u15('toli-nawilebi-2', 'shade-named-part', 2, {
    prompt: 'ფიგურა გაყოფილია {n} ტოლ ნაწილად. გააფერადე ერთი {word}.',
    variables: { n: pick(2, 3, 4), word: { kind: 'choice', values: (v: Vars) => [FRACTION_WORDS[num(v, 'n')]!] }, shape: pick('bar', 'circle') },
    interaction: (v) => ({ kind: 'fill', shape: str(v, 'shape') as 'bar' | 'circle', total: num(v, 'n') }),
    answer: () => 1,
    explanation: ({ vars }) => `ერთი ${vars.word} ნიშნავს 1 ნაწილს ${vars.n}-დან.`,
  }),
  u15('toli-nawilebi-2', 'shade-k-of-n', 3, {
    prompt: 'გააფერადე {k} ნაწილი {n}-დან.',
    variables: { n: int(3, 8), k: int(1, 7), shape: pick('bar', 'circle') },
    constraints: [{ test: (v) => num(v, 'k') < num(v, 'n'), note: 'k < n' }],
    interaction: (v) => ({ kind: 'fill', shape: str(v, 'shape') as 'bar' | 'circle', total: num(v, 'n') }),
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `გააფერადე ${vars.k} ნაწილი ${vars.n}-დან.`,
  }),
];

/* ------------------------------------------------------------ U16 */
const u16 = T('logikuri-azrovneba', 'u16');
const COLOUR_ICONS = ['dot-red', 'dot-blue', 'dot-green', 'dot-yellow'];
const COLOUR_NAMES = ['წითელი', 'ლურჯი', 'მწვანე', 'ყვითელი'];
const U16: QuestionTemplate[] = [
  u16('ferebi-wesis-mixedviT', 'tap-colour', 1, {
    prompt: 'შეეხე ყველა {colour} წრეს.',
    variables: {
      t: int(0, 3),
      colour: { kind: 'choice', values: (v: Vars) => [COLOUR_NAMES[num(v, 't')]!] },
      c1: int(0, 3), c2: int(0, 3), c3: int(0, 3), c4: int(0, 3), c5: int(0, 3), c6: int(0, 3),
    },
    constraints: [{ test: (v) => { const n = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].filter((k) => num(v, k) === num(v, 't')).length; return n >= 1 && n <= 3; }, note: '1–3 სამიზნე' }],
    interaction: (v) => ({ kind: 'pick', mode: 'many', items: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].map((k) => ({ icon: COLOUR_ICONS[num(v, k)]! })) }),
    answer: (v) => ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].flatMap((k, i) => (num(v, k) === num(v, 't') ? [i + 1] : [])).join(','),
    explanation: ({ vars }) => `სწორია ყველა ${vars.colour} წრე.`,
  }),
  u16('gamoricxva', 'odd-colour', 2, {
    prompt: 'ერთი ფიგურა სხვა ფერისაა. შეეხე მას.',
    variables: { same: int(0, 3), odd: int(0, 3), pos: int(1, 6) },
    constraints: [{ test: (v) => num(v, 'same') !== num(v, 'odd'), note: 'სხვადასხვა' }],
    interaction: (v) => ({ kind: 'pick', mode: 'one', items: Array.from({ length: 6 }, (_, i) => ({ icon: COLOUR_ICONS[i + 1 === num(v, 'pos') ? num(v, 'odd') : num(v, 'same')]! })) }),
    answer: (v) => num(v, 'pos'),
    explanation: () => 'სხვა ფერის წრეა სწორი პასუხი.',
  }),
  u16('Cafiqrebuli-ricxvi', 'thought-number', 3, {
    prompt: 'ჩავიფიქრე რიცხვი. დავუმატე {k} და მივიღე {r}. შეეხე ჩაფიქრებულ რიცხვს რიცხვით ღერძზე.',
    variables: { n: int(0, 12), k: int(1, 8), r: { kind: 'choice', values: (v: Vars) => [num(v, 'n') + num(v, 'k')] } },
    interaction: () => ({ kind: 'line', min: 0, max: 20 }),
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.r} − ${vars.k} = ${vars.n}.`,
  }),
];

export const G1_INTERACTIVE_TEMPLATES: QuestionTemplate[] = [
  ...U01, ...U02, ...U03, ...U04, ...U05, ...U06, ...U07, ...U08, ...U09, ...U10, ...U11, ...U12, ...U13, ...U14, ...U15, ...U16,
];

void OBJECTS;
void nounOf;
