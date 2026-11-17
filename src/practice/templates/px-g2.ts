/**
 * Grade II — pictured templates.
 *
 * Units 04–15 were wording only: a child read „34 + 28“ and „a rope is 60 cm“
 * and had nothing to look at. These templates ask the same kinds of question
 * about something that is drawn — base-ten blocks, a part–whole model, tally
 * marks, a bar chart, a clock, coins, a balance, a shape cut into equal parts.
 * Every picture is built from the drawn numbers, so it cannot disagree with the
 * question or its key.
 */
import type { QuestionTemplate, Vars } from './types';
import type { Picture } from '../pictures/types';
import {
  MONTH_NAMES,
  WEEKDAY_NAMES,
  blocksOf,
  blocksTO,
  derived,
  distinct,
  fixed,
  iconRow,
  icons,
  int,
  interactiveSet,
  manyRows,
  num,
  pick,
  SHAPES,
} from './ix-kit';

const P = (topicId: string, unit: string) => interactiveSet(2, topicId, `g2-px-${unit}`);
const model = (whole: string | number, ...parts: Array<string | number>): Picture => ({
  kind: 'model',
  whole: String(whole),
  parts: parts.map(String),
});
const bars = (items: Array<{ label?: string; size: number; caption?: string }>): Picture => ({ kind: 'bars', items });
const tens = (n: number) => Math.floor(n / 10);
const ones = (n: number) => n % 10;
const minutesOf = (h: number, m: number): number => (h % 12) * 60 + m;
const clockWord = (h: number, m: number): string => `${h}:${String(m).padStart(2, '0')}`;
const timeChoices = (h: number, m: number) => (): string[] => {
  const set = new Set<string>([clockWord(h, m)]);
  const candidates = [
    clockWord((h % 12) + 1, m),
    clockWord(((h + 10) % 12) + 1, m),
    clockWord(h, (m + 30) % 60),
    clockWord(h, (m + 15) % 60),
    clockWord(m === 0 ? 6 : Math.max(1, Math.floor(m / 5)), m === 0 ? 0 : h * 5 > 55 ? 55 : h * 5),
  ];
  for (const c of candidates) if (set.size < 4) set.add(c);
  return [...set];
};
const COLORS: Array<{ icon: string; name: string }> = [
  { icon: 'dot-red', name: 'წითელი' },
  { icon: 'dot-blue', name: 'ლურჯი' },
  { icon: 'dot-green', name: 'მწვანე' },
  { icon: 'dot-yellow', name: 'ყვითელი' },
];

/* ------------------------------------------------------------ U01 */
const u01 = P('g2-ricxvebi100', 'u01');
const U01: QuestionTemplate[] = [
  u01('u01-tens-and-ones', 'read-blocks', 1, {
    prompt: 'რომელი რიცხვია გამოსახული მოდელზე? (ჯამური რაოდენობა: {n})',
    variables: { t: int(1, 9), o: int(0, 9), n: derived((v) => num(v, 't') * 10 + num(v, 'o')) },
    pictures: (v) => [blocksTO(num(v, 't'), num(v, 'o'))],
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.t} ათეული და ${vars.o} ერთეული — ეს არის ${vars.n}.`,
  }),
  u01('u01-number-line-100', 'read-line', 2, {
    prompt: 'რომელ რიცხვზე დგას წითელი წერტილი რიცხვით ღერძზე? (ათეულებს შორის ბიჯი: {s})',
    variables: { n: int(1, 19), s: derived(() => 5) },
    pictures: (v) => [{ kind: 'line', from: 0, to: 100, step: 10, marks: [{ value: num(v, 'n') * 5 }] }],
    answer: (v) => num(v, 'n') * 5,
    explanation: ({ answer }) => `წერტილი ${answer}-ზე დგას.`,
  }),
  u01('u01-before-and-after', 'between', 1, {
    prompt: 'რომელი რიცხვი უნდა იყოს ❓ ადგილას? ({n}-ის შემდეგ)',
    variables: { n: int(11, 98) },
    pictures: (v) => [{ kind: 'chips', arrows: true, items: [{ text: String(num(v, 'n') - 1) }, { text: String(num(v, 'n')) }, { text: '?' }] }],
    answer: (v) => num(v, 'n') + 1,
    explanation: ({ answer }) => `ერთით მეტი რიცხვია ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U02 */
const u02 = P('g2-datvla-mimdevroba', 'u02');
const U02: QuestionTemplate[] = [
  u02('u02-counting-with-steps', 'steps-chain', 1, {
    prompt: 'ათვლა {s}-ით. რომელი რიცხვი უნდა დაიწეროს ❓ ადგილას? (პირველი: {a})',
    variables: { a: int(0, 20), s: pick(2, 5, 10) },
    pictures: (v) => {
      const a = num(v, 'a');
      const s = num(v, 's');
      return [{ kind: 'chips', arrows: true, items: [a, a + s, a + 2 * s, a + 3 * s].map((x) => ({ text: String(x) })).concat([{ text: '?' }]) }];
    },
    answer: (v) => num(v, 'a') + 4 * num(v, 's'),
    explanation: ({ answer, vars }) => `ყოველ ნაბიჯზე ემატება ${vars.s}; შემდეგი რიცხვია ${answer}.`,
  }),
  u02('u02-counting-objects', 'count-groups', 1, {
    prompt: 'რამდენია სულ? თითო ჯგუფში {k} ობიექტია, ჯგუფები: {g}',
    variables: { k: pick(2, 5, 10), g: int(2, 5) },
    pictures: (v) => [manyRows(Array.from({ length: num(v, 'g') }, () => ({ tokens: icons('apple', num(v, 'k')) })))],
    answer: (v) => num(v, 'k') * num(v, 'g'),
    explanation: ({ answer }) => `ყველა ჯგუფი ერთად: ${answer}.`,
  }),
  u02('u02-moves-on-number-line', 'jump', 2, {
    prompt: 'წერტილი {a}-დან {s}-ით გადაადგილდა მარჯვნივ. რომელ რიცხვზე აღმოჩნდა?',
    variables: { a: int(0, 40, { step: 5 }), s: pick(10, 15, 20) },
    pictures: (v) => [{ kind: 'line', from: 0, to: 100, step: 10, marks: [{ value: num(v, 'a'), label: String(num(v, 'a')) }] }],
    answer: (v) => num(v, 'a') + num(v, 's'),
    explanation: ({ answer }) => `მარჯვნივ გადაადგილება — მეტი რიცხვი: ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U03 */
const u03 = P('g2-ertnishna-moqmedebebi', 'u03');
const U03: QuestionTemplate[] = [
  u03('u03-adding-to-20-pictures', 'two-groups', 1, {
    prompt: 'რამდენია სულ? ({a} და {b})',
    variables: { a: int(5, 12), b: int(3, 8) },
    constraints: [{ test: (v: Vars) => num(v, 'a') + num(v, 'b') <= 20, note: '≤ 20' }],
    pictures: (v) => [manyRows([{ tokens: icons('apple', num(v, 'a')) }, { tokens: icons('pear', num(v, 'b')) }])],
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ answer }) => `ორივე რიგი ერთად: ${answer}.`,
  }),
  u03('u03-subtracting-to-20-pictures', 'crossed', 1, {
    prompt: 'რამდენი დარჩა? (სულ {a}, გადახაზულია {b})',
    variables: { a: int(8, 18), b: int(2, 7) },
    pictures: (v) => [iconRow('ball', num(v, 'a'), undefined, num(v, 'b'))],
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ answer }) => `გადაუხაზავი დარჩა ${answer}.`,
  }),
  u03('u03-doubling-and-halving', 'double', 1, {
    prompt: 'ორი ერთნაირი რიგია. რამდენია სულ? (თითო რიგში {a})',
    variables: { a: int(3, 10) },
    pictures: (v) => [manyRows([{ tokens: icons('flower-pink', num(v, 'a')) }, { tokens: icons('flower-pink', num(v, 'a')) }])],
    answer: (v) => num(v, 'a') * 2,
    explanation: ({ answer }) => `გაორმაგება: ${answer}.`,
  }),
  u03('u03-missing-digit', 'part-whole', 2, {
    prompt: 'რომელი რიცხვი არის ❓ ადგილას? (მთელი: {w})',
    variables: { w: int(8, 20), a: int(2, 7) },
    constraints: [{ test: (v: Vars) => num(v, 'a') < num(v, 'w'), note: 'part < whole' }],
    pictures: (v) => [model(num(v, 'w'), num(v, 'a'), '?')],
    answer: (v) => num(v, 'w') - num(v, 'a'),
    explanation: ({ answer }) => `მთელს გამოკლებული ნაწილი: ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U04 */
const u04 = P('g2-ornishna-sekreba', 'u04');
const addVars = (carry: boolean): Record<string, ReturnType<typeof int>> => ({
  t1: int(1, 6),
  t2: int(1, 3),
  o1: carry ? int(4, 9) : int(0, 4),
  o2: carry ? int(4, 9) : int(0, 4),
});
const addConstraint = (carry: boolean) => ({
  test: (v: Vars) => (carry ? num(v, 'o1') + num(v, 'o2') >= 10 : num(v, 'o1') + num(v, 'o2') <= 9),
  note: carry ? 'regroup' : 'no regroup',
});
const U04: QuestionTemplate[] = [
  u04('u04-adding-tens', 'tens-blocks', 1, {
    prompt: 'იპოვე ჯამი. ({a} ათეული და {b} ათეული)',
    variables: { a: int(1, 5), b: int(1, 4) },
    pictures: (v) => [blocksTO(num(v, 'a'), 0, `${num(v, 'a') * 10}`), blocksTO(num(v, 'b'), 0, `+ ${num(v, 'b') * 10}`)],
    answer: (v) => (num(v, 'a') + num(v, 'b')) * 10,
    explanation: ({ answer }) => `ათეულები ერთად: ${answer}.`,
  }),
  u04('u04-without-regrouping', 'blocks-no-carry', 1, {
    prompt: 'იპოვე ჯამი: {t1}{o1} + {t2}{o2}',
    variables: addVars(false),
    constraints: [addConstraint(false)],
    pictures: (v) => [blocksTO(num(v, 't1'), num(v, 'o1'), `${v.t1}${v.o1}`), blocksTO(num(v, 't2'), num(v, 'o2'), `+ ${v.t2}${v.o2}`)],
    answer: (v) => (num(v, 't1') + num(v, 't2')) * 10 + num(v, 'o1') + num(v, 'o2'),
    explanation: ({ answer }) => `ათეულები და ერთეულები ცალ-ცალკე შეკრიბე: ${answer}.`,
  }),
  u04('u04-with-regrouping', 'blocks-carry', 2, {
    prompt: 'იპოვე ჯამი: {t1}{o1} + {t2}{o2}. ერთეულები 10-ზე მეტია.',
    variables: addVars(true),
    constraints: [addConstraint(true)],
    pictures: (v) => [blocksTO(num(v, 't1'), num(v, 'o1'), `${v.t1}${v.o1}`), blocksTO(num(v, 't2'), num(v, 'o2'), `+ ${v.t2}${v.o2}`)],
    answer: (v) => (num(v, 't1') + num(v, 't2')) * 10 + num(v, 'o1') + num(v, 'o2'),
    explanation: ({ answer }) => `10 ერთეული ერთ ათეულად იქცევა. პასუხი: ${answer}.`,
  }),
  u04('u04-missing-addend', 'part-model', 2, {
    prompt: 'რომელი რიცხვი უნდა იყოს ❓ ადგილას? ({a} + ❓ = {w})',
    variables: { a: int(11, 45), d: int(8, 40), w: derived((v) => num(v, 'a') + num(v, 'd')) },
    pictures: (v) => [model(num(v, 'w'), num(v, 'a'), '?')],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer, vars }) => `${vars.w} − ${vars.a} = ${answer}.`,
  }),
  u04('u04-word-problems-expressions', 'bar-total', 2, {
    prompt: 'ორი ზოლის სიგრძე {a} და {b} სმ-ია. რამდენია ორივე ერთად?',
    variables: { a: int(12, 48), b: int(11, 40) },
    pictures: (v) => [bars([{ label: 'I', size: num(v, 'a'), caption: `${v.a} სმ` }, { label: 'II', size: num(v, 'b'), caption: `${v.b} სმ` }])],
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ answer }) => `${answer} სმ.`,
  }),
];

/* ------------------------------------------------------------ U05 */
const u05 = P('g2-ornishna-gamokleba', 'u05');
const U05: QuestionTemplate[] = [
  u05('u05-subtracting-tens', 'tens-away', 1, {
    prompt: 'რამდენი დარჩა? (სულ {a} ათეული, წაიღეს {b} ათეული)',
    variables: { a: int(4, 9), b: int(1, 3) },
    pictures: (v) => [blocksTO(num(v, 'a'), 0, `${num(v, 'a') * 10}`), blocksTO(num(v, 'b'), 0, `− ${num(v, 'b') * 10}`)],
    answer: (v) => (num(v, 'a') - num(v, 'b')) * 10,
    explanation: ({ answer }) => `${answer}.`,
  }),
  u05('u05-without-regrouping', 'blocks-no-borrow', 1, {
    prompt: 'იპოვე სხვაობა: {a} − {b}',
    variables: { t: int(3, 9), o: int(4, 9), t2: int(1, 2), o2: int(1, 3), a: derived((v) => num(v, 't') * 10 + num(v, 'o')), b: derived((v) => num(v, 't2') * 10 + num(v, 'o2')) },
    constraints: [{ test: (v: Vars) => num(v, 'o') >= num(v, 'o2'), note: 'no borrow' }],
    pictures: (v) => [blocksOf(num(v, 'a'), String(v.a)), blocksOf(num(v, 'b'), `− ${v.b}`)],
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ answer }) => `ათეულები და ერთეულები ცალ-ცალკე გამოაკელი: ${answer}.`,
  }),
  u05('u05-with-regrouping', 'blocks-borrow', 2, {
    prompt: 'იპოვე სხვაობა: {a} − {b}. ერთეულები არ ყოფნის.',
    variables: { t: int(4, 9), o: int(0, 4), t2: int(1, 3), o2: int(5, 9), a: derived((v) => num(v, 't') * 10 + num(v, 'o')), b: derived((v) => num(v, 't2') * 10 + num(v, 'o2')) },
    constraints: [{ test: (v: Vars) => num(v, 'a') > num(v, 'b'), note: 'positive' }],
    pictures: (v) => [blocksOf(num(v, 'a'), String(v.a)), blocksOf(num(v, 'b'), `− ${v.b}`)],
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ answer }) => `ერთი ათეული 10 ერთეულად დაშალე. პასუხი: ${answer}.`,
  }),
  u05('u05-word-problems', 'part-model', 2, {
    prompt: 'სულ {w} ცალია. ნაწილი {a} ცალია, დანარჩენი — ❓. რამდენია დანარჩენი?',
    variables: { w: int(40, 95), a: int(11, 38) },
    pictures: (v) => [model(num(v, 'w'), num(v, 'a'), '?')],
    answer: (v) => num(v, 'w') - num(v, 'a'),
    explanation: ({ answer }) => `მთელს გამოკლებული ნაწილი: ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U06 */
const u06 = P('g2-shedareba-dalageba', 'u06');
const U06: QuestionTemplate[] = [
  u06('u06-comparing-to-100', 'bigger-blocks', 1, {
    prompt: 'რომელი რიცხვია მეტი: პირველი თუ მეორე? ({a} და {b})',
    variables: { a: int(12, 98), b: int(12, 98) },
    constraints: [distinct('a', 'b')],
    pictures: (v) => [blocksOf(num(v, 'a'), 'I'), blocksOf(num(v, 'b'), 'II')],
    options: fixed('პირველი', 'მეორე'),
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'a') > num(v, 'b') ? 'პირველი' : 'მეორე'),
    explanation: ({ vars, answer }) => `${vars.a} და ${vars.b}: მეტი არის ${answer}.`,
  }),
  u06('u06-largest-smallest-group', 'line-largest', 2, {
    prompt: 'ღერძზე სამი რიცხვია მონიშნული. რომელია უდიდესი?',
    variables: { a: int(5, 95, { step: 5 }), b: int(5, 95, { step: 5 }), c: int(5, 95, { step: 5 }) },
    constraints: [distinct('a', 'b', 'c')],
    pictures: (v) => [{ kind: 'line', from: 0, to: 100, step: 10, marks: [num(v, 'a'), num(v, 'b'), num(v, 'c')].map((value) => ({ value, label: String(value) })) }],
    answer: (v) => Math.max(num(v, 'a'), num(v, 'b'), num(v, 'c')),
    explanation: ({ answer }) => `ყველაზე მარჯვნივ არის ${answer}.`,
  }),
  u06('u06-comparing-tens-ones', 'sign-blocks', 2, {
    prompt: 'მოდელებით შეადარე რიცხვები. რომელი ნიშანი უნდა დაიწეროს ❓ ადგილას?',
    variables: { t1: int(2, 8), o1: int(0, 9), t2: int(2, 8), o2: int(0, 9) },
    pictures: (v) => [blocksTO(num(v, 't1'), num(v, 'o1')), blocksTO(num(v, 't2'), num(v, 'o2'))],
    options: fixed('<', '>', '='),
    optionCount: 3,
    text: true,
    answer: (v) => {
      const a = num(v, 't1') * 10 + num(v, 'o1');
      const b = num(v, 't2') * 10 + num(v, 'o2');
      return a < b ? '<' : a > b ? '>' : '=';
    },
    explanation: ({ answer }) => `ნიშანი: ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U07 */
const u07 = P('g2-raodenobis-modelebi', 'u07');
const U07: QuestionTemplate[] = [
  u07('u07-number-from-model', 'read-model', 1, {
    prompt: 'რა რიცხვია გამოსახული მოდელზე? ({t} ათეული და {o} ერთეული)',
    variables: { t: int(1, 9), o: int(0, 9) },
    pictures: (v) => [blocksTO(num(v, 't'), num(v, 'o'))],
    answer: (v) => num(v, 't') * 10 + num(v, 'o'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u07('u07-model-from-number', 'which-model', 1, {
    prompt: 'რომელი მოდელი აჩვენებს რიცხვს {n}?',
    variables: { n: int(21, 79), w1: derived((v) => num(v, 'n') + 10), w2: derived((v) => (ones(num(v, 'n')) === 0 ? num(v, 'n') + 1 : tens(num(v, 'n')) * 10 + ((ones(num(v, 'n')) + 3) % 10))), slot: pick(0, 1, 2) },
    constraints: [{ test: (v: Vars) => new Set([num(v, 'n'), num(v, 'w1'), num(v, 'w2')]).size === 3, note: 'distinct' }],
    pictures: (v) => {
      const list = [num(v, 'w1'), num(v, 'w2')];
      list.splice(num(v, 'slot'), 0, num(v, 'n'));
      return list.map((n, i) => blocksOf(n, ['ა', 'ბ', 'გ'][i]));
    },
    options: fixed('ა', 'ბ', 'გ'),
    optionCount: 3,
    text: true,
    answer: (v) => ['ა', 'ბ', 'გ'][num(v, 'slot')]!,
    explanation: ({ vars, answer }) => `${vars.n}-ს აჩვენებს მოდელი ${answer}.`,
  }),
  u07('u07-grouping-tens-ones', 'trade', 2, {
    prompt: 'მოდელში {t} ათეული და {o} ერთეულია. რა რიცხვია ეს?',
    variables: { t: int(1, 6), o: int(10, 17) },
    pictures: (v) => [blocksTO(num(v, 't'), num(v, 'o'))],
    answer: (v) => num(v, 't') * 10 + num(v, 'o'),
    explanation: ({ answer }) => `10 ერთეული ერთი ათეულია. სულ: ${answer}.`,
  }),
  u07('u07-adding-with-models', 'add-models', 2, {
    prompt: 'რამდენია ორივე მოდელი ერთად? ({a} და {b})',
    variables: { a: int(11, 59), b: int(11, 39) },
    pictures: (v) => [blocksOf(num(v, 'a'), 'I'), blocksOf(num(v, 'b'), '+ II')],
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u07('u07-required-quantity', 'need-more', 3, {
    prompt: 'გვაქვს {a}. გვინდა გვქონდეს {w}. რამდენი უნდა დავამატოთ?',
    variables: { a: int(11, 55), d: int(8, 35), w: derived((v) => num(v, 'a') + num(v, 'd')) },
    pictures: (v) => [model(num(v, 'w'), num(v, 'a'), '?')],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `დასამატებელი: ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U08 */
const u08 = P('g2-mravalnabijiani-amocanebi', 'u08');
const U08: QuestionTemplate[] = [
  u08('u08-equalizing-sums-diffs', 'bars-gap', 2, {
    prompt: 'ორი ყუთია: {a} და {b} ცალი. რამდენი უნდა დაემატოს პატარას, რომ ტოლები გახდეს?',
    variables: { a: int(31, 60), b: int(12, 30) },
    pictures: (v) => [bars([{ label: 'I', size: num(v, 'a'), caption: String(v.a) }, { label: 'II', size: num(v, 'b'), caption: String(v.b) }])],
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ answer }) => `სხვაობა: ${answer}.`,
  }),
  u08('u08-equalizing-quantities', 'move-half', 3, {
    prompt: 'ორ თაროზე წიგნებია: {a} და {b}. რამდენი უნდა გადავიტანოთ მეორე თაროდან, რომ ტოლი გახდეს?',
    variables: { b: int(11, 40), h: int(3, 12), a: derived((v) => num(v, 'b') + 2 * num(v, 'h')) },
    pictures: (v) => [bars([{ label: 'I', size: num(v, 'a'), caption: String(v.a) }, { label: 'II', size: num(v, 'b'), caption: String(v.b) }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ answer }) => `სხვაობის ნახევარი: ${answer}.`,
  }),
  u08('u08-distance-problems', 'model-total', 1, {
    prompt: 'დილით {a} მეტრი გაიარა, საღამოს {b} მეტრი. რამდენი მეტრია სულ?',
    variables: { a: int(11, 59), b: int(11, 39) },
    pictures: (v) => [model('?', num(v, 'a'), num(v, 'b'))],
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ answer }) => `${answer} მეტრი.`,
  }),
  u08('u08-table-rules-100', 'rule-arrows', 2, {
    prompt: 'ცხრილში ყველა რიცხვს ემატება {k}. რომელი რიცხვი უნდა იყოს ❓ ადგილას?',
    variables: { k: pick(5, 6, 7, 8, 9), a: int(10, 30), b: int(31, 50), c: int(51, 80) },
    pictures: (v) => [
      manyRows(
        [num(v, 'a'), num(v, 'b'), num(v, 'c')].map((x, i) => ({
          label: i === 0 ? 'შესავალი → გამოსავალი' : undefined,
          tokens: [
            { t: 'text' as const, text: String(x) },
            { t: 'sep' as const, style: 'arrow' as const },
            i === 2 ? { t: 'unknown' as const } : { t: 'text' as const, text: String(x + num(v, 'k')) },
          ],
        })),
      ),
    ],
    answer: (v) => num(v, 'c') + num(v, 'k'),
    explanation: ({ answer }) => `${answer}.`,
  }),
];

/* ------------------------------------------------------------ U09 */
const u09 = P('g2-damrgvaleba', 'u09');
const roundLine = (base: number) => (v: Vars): Picture[] => {
  const lo = Math.floor(num(v, 'n') / base) * base;
  return [{ kind: 'line', from: lo, to: lo + base, step: base === 5 ? 1 : base === 10 ? 1 : 2, marks: [{ value: num(v, 'n'), label: String(v.n) }] }];
};
const roundTo = (n: number, base: number): number => Math.round(n / base) * base;
const roundVars = () => ({ n: { kind: 'int' as const, min: 11, max: 98 } });
const U09: QuestionTemplate[] = [
  u09('u09-nearest-5', 'line-5', 1, {
    prompt: 'დაამრგვალე {n} უახლოეს 5-მდე. რომელ რიცხვთან უფრო ახლოსაა წერტილი?',
    variables: roundVars(),
    constraints: [{ test: (v: Vars) => num(v, 'n') % 5 !== 0 && num(v, 'n') % 5 !== 2.5, note: 'not a multiple' }],
    pictures: roundLine(5),
    answer: (v) => roundTo(num(v, 'n'), 5),
    explanation: ({ answer }) => `უახლოესი: ${answer}.`,
  }),
  u09('u09-nearest-10', 'line-10', 1, {
    prompt: 'დაამრგვალე {n} უახლოეს ათეულამდე. რომელ ათეულთან უფრო ახლოსაა წერტილი?',
    variables: roundVars(),
    constraints: [{ test: (v: Vars) => num(v, 'n') % 10 !== 0 && num(v, 'n') % 10 !== 5, note: 'not half' }],
    pictures: roundLine(10),
    answer: (v) => roundTo(num(v, 'n'), 10),
    explanation: ({ answer }) => `უახლოესი ათეული: ${answer}.`,
  }),
  u09('u09-nearest-20', 'line-20', 2, {
    prompt: 'დაამრგვალე {n} უახლოეს 20-ის ჯერადამდე. რომელ ნიშნულთან უფრო ახლოსაა წერტილი?',
    variables: roundVars(),
    constraints: [{ test: (v: Vars) => num(v, 'n') % 10 !== 0, note: 'not half' }],
    pictures: roundLine(20),
    answer: (v) => roundTo(num(v, 'n'), 20),
    explanation: ({ answer }) => `უახლოესი: ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U10 */
const u10 = P('g2-monacemebi-albatoba', 'u10');
const U10: QuestionTemplate[] = [
  u10('u10-tally-marks', 'tally-read', 1, {
    prompt: 'ხმები დათვლილია აღრიცხვის ნიშნებით. რამდენი ხმა აქვს პირველს?',
    variables: { a: int(3, 14), b: int(3, 14) },
    pictures: (v) => [{ kind: 'tally', rows: [{ label: 'I', count: num(v, 'a') }, { label: 'II', count: num(v, 'b') }] }],
    answer: (v) => num(v, 'a'),
    explanation: ({ answer }) => `ხუთეულები და დარჩენილი ხაზები: ${answer}.`,
  }),
  u10('u10-tally-marks', 'tally-more', 2, {
    prompt: 'რამდენით მეტი ხმა აქვს პირველს, ვიდრე მეორეს?',
    variables: { b: int(3, 12), d: int(2, 7), a: derived((v) => num(v, 'b') + num(v, 'd')) },
    pictures: (v) => [{ kind: 'tally', rows: [{ label: 'I', count: num(v, 'a') }, { label: 'II', count: num(v, 'b') }] }],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `სხვაობა: ${answer}.`,
  }),
  u10('u10-pictograms', 'pictogram', 1, {
    prompt: 'ერთი ვარსკვლავი {k} ბავშვს აღნიშნავს. რამდენ ბავშვს აღნიშნავს პირველი რიგი?',
    variables: { k: pick(2, 5, 10), a: int(2, 7), b: int(2, 7) },
    pictures: (v) => [manyRows([{ label: 'I', tokens: icons('star', num(v, 'a')) }, { label: 'II', tokens: icons('star', num(v, 'b')) }])],
    answer: (v) => num(v, 'a') * num(v, 'k'),
    explanation: ({ answer }) => `${answer} ბავშვი.`,
  }),
  u10('u10-bar-charts', 'bar-read', 1, {
    prompt: 'სვეტოვან დიაგრამაზე რამდენია პირველი სვეტის მნიშვნელობა?',
    variables: { a: int(4, 20), b: int(4, 20), c: int(4, 20) },
    pictures: (v) => [bars([{ label: 'ა', size: num(v, 'a'), caption: '' }, { label: 'ბ', size: num(v, 'b'), caption: '' }, { label: 'გ', size: num(v, 'c'), caption: '' }].map((x, i) => ({ ...x, caption: String([num(v, 'a'), num(v, 'b'), num(v, 'c')][i]) })))],
    answer: (v) => num(v, 'a'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u10('u10-bar-charts', 'bar-difference', 2, {
    prompt: 'რამდენით მეტია უდიდესი სვეტი უმცირესზე?',
    variables: { a: int(5, 24), b: int(5, 24), c: int(5, 24) },
    constraints: [distinct('a', 'b', 'c')],
    pictures: (v) => [bars(['ა', 'ბ', 'გ'].map((label, i) => ({ label, size: num(v, ['a', 'b', 'c'][i]!), caption: String(num(v, ['a', 'b', 'c'][i]!)) })))],
    answer: (v) => Math.max(num(v, 'a'), num(v, 'b'), num(v, 'c')) - Math.min(num(v, 'a'), num(v, 'b'), num(v, 'c')),
    explanation: ({ answer }) => `სხვაობა: ${answer}.`,
  }),
  u10('u10-dot-plots', 'dots-total', 2, {
    prompt: 'წერტილოვან დიაგრამაზე ყოველი წერტილი ერთ მოსწავლეს ნიშნავს. რამდენი მოსწავლეა სულ?',
    variables: { a: int(1, 6), b: int(1, 6), c: int(1, 6) },
    pictures: (v) => [manyRows([1, 2, 3].map((score, i) => ({ label: `${score} ქულა`, tokens: icons('dot-blue', num(v, ['a', 'b', 'c'][i]!)) })))],
    answer: (v) => num(v, 'a') + num(v, 'b') + num(v, 'c'),
    explanation: ({ answer }) => `ყველა წერტილი ერთად: ${answer}.`,
  }),
  u10('u10-more-less-equally-likely', 'bag-likely', 1, {
    prompt: 'ჩანთაში ბურთულებია (სურათზე). რომელი ფერის ამოღებაა უფრო მოსალოდნელი?',
    variables: { x: int(0, 1), y: int(2, 3), p: int(5, 9), q: int(1, 3) },
    pictures: (v) => [manyRows([{ tokens: [...icons(COLORS[num(v, 'x')]!.icon, num(v, 'p')), ...icons(COLORS[num(v, 'y')]!.icon, num(v, 'q'))] }])],
    options: (v) => [COLORS[num(v, 'x')]!.name, COLORS[num(v, 'y')]!.name],
    optionCount: 2,
    text: true,
    answer: (v) => COLORS[num(v, 'x')]!.name,
    explanation: ({ answer }) => `მეტია ${answer} ბურთულა, ამიტომ მისი ამოღება უფრო მოსალოდნელია.`,
  }),
  u10('u10-possible-impossible', 'bag-impossible', 2, {
    prompt: 'ჩანთაში მხოლოდ ერთი ფერის ბურთულებია. შესაძლებელია თუ არა {c} ბურთულის ამოღება?',
    variables: { x: int(0, 3), y: int(0, 3), n: int(4, 9), c: derived((v) => COLORS[num(v, 'y')]!.name) },
    pictures: (v) => [manyRows([{ tokens: icons(COLORS[num(v, 'x')]!.icon, num(v, 'n')) }])],
    options: fixed('შესაძლებელია', 'შეუძლებელია'),
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'x') === num(v, 'y') ? 'შესაძლებელია' : 'შეუძლებელია'),
    explanation: ({ answer }) => `${answer}.`,
  }),
];

/* ------------------------------------------------------------ U11 */
const u11 = P('g2-gazomva-geometria', 'u11');
const U11: QuestionTemplate[] = [
  u11('u11-meters-and-centimeters', 'to-meter', 1, {
    prompt: 'ძაფი {a} სმ-ია. რამდენი სმ აკლია 1 მეტრამდე?',
    variables: { a: int(2, 9, { step: 1 }), c: derived((v) => num(v, 'a') * 10) },
    pictures: (v) => [{ kind: 'line', from: 0, to: 100, step: 10, marks: [{ value: num(v, 'c'), label: `${v.c}` }] }],
    answer: (v) => 100 - num(v, 'c'),
    explanation: ({ answer, vars }) => `100 − ${vars.c} = ${answer}.`,
  }),
  u11('u11-units-of-length', 'two-bars', 1, {
    prompt: 'რამდენი სმ-ით გრძელია პირველი ზოლი მეორეზე?',
    variables: { b: int(20, 60), d: int(5, 30), a: derived((v) => num(v, 'b') + num(v, 'd')) },
    pictures: (v) => [bars([{ label: 'I', size: num(v, 'a'), caption: `${v.a} სმ` }, { label: 'II', size: num(v, 'b'), caption: `${v.b} სმ` }])],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `${answer} სმ.`,
  }),
  u11('u11-units-of-weight', 'balance', 2, {
    prompt: 'სასწორი წონასწორობაშია. რამდენ კგ-ს იწონის უცნობი ყუთი?',
    variables: { a: int(8, 20), b: int(2, 7) },
    pictures: (v) => [{ kind: 'balance', left: [{ t: 'text', text: `${v.a} კგ` }], right: [{ t: 'text', text: `${v.b} კგ` }, { t: 'unknown' }], tilt: 'level' }],
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ answer }) => `${answer} კგ.`,
  }),
  u11('u11-thermometer', 'read-temp', 1, {
    prompt: 'რამდენ გრადუსს აჩვენებს მონიშნული წერტილი?',
    variables: { t: int(-5, 25) },
    pictures: (v) => [{ kind: 'line', from: -10, to: 30, step: 5, marks: [{ value: num(v, 't') }] }],
    constraints: [{ test: (v: Vars) => num(v, 't') % 5 === 0, note: 'on a tick' }],
    answer: (v) => num(v, 't'),
    explanation: ({ answer }) => `${answer}°C.`,
  }),
  u11('u11-perimeter', 'rect-perimeter', 2, {
    prompt: 'იპოვე ფიგურის პერიმეტრი (სმ).',
    variables: { w: int(3, 12), h: int(2, 9) },
    pictures: (v) => [{ kind: 'rect', width: `${v.w} სმ`, height: `${v.h} სმ`, wv: num(v, 'w'), hv: num(v, 'h') }],
    answer: (v) => 2 * (num(v, 'w') + num(v, 'h')),
    explanation: ({ answer }) => `ოთხივე გვერდი ერთად: ${answer} სმ.`,
  }),
  u11('u11-counting-sides', 'sides-shape', 1, {
    prompt: 'რამდენი გვერდი აქვს ამ ფიგურას?',
    variables: { s: int(1, 5) },
    pictures: (v) => [{ kind: 'rows', rows: [{ tokens: [{ t: 'icon', icon: SHAPES[num(v, 's')]!.icon }] }] }],
    answer: (v) => SHAPES[num(v, 's')]!.sides,
    explanation: ({ answer }) => `${answer}.`,
  }),
  u11('u11-counting-angles', 'angles-shape', 1, {
    prompt: 'რამდენი კუთხე აქვს ამ ფიგურას?',
    variables: { s: int(1, 5) },
    pictures: (v) => [{ kind: 'rows', rows: [{ tokens: [{ t: 'icon', icon: SHAPES[num(v, 's')]!.icon }] }] }],
    answer: (v) => SHAPES[num(v, 's')]!.sides,
    explanation: ({ answer }) => `კუთხეები იმდენივეა, რამდენიც გვერდი: ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U12 */
const u12 = P('g2-fuli', 'u12');
const coinList = { kind: 'list' as const, pick: { values: [5, 10, 20, 50, 5, 10], length: { min: 3, max: 5 } } };
const sumOf = (v: Vars, key: string): number => (v[key] as number[]).reduce((a, b) => a + Number(b), 0);
const U12: QuestionTemplate[] = [
  u12('u12-counting-tetri', 'coins-total', 1, {
    prompt: 'რამდენი თეთრია სულ?',
    variables: { c: coinList },
    constraints: [{ test: (v: Vars) => sumOf(v, 'c') <= 150, note: 'small total' }],
    pictures: (v) => [{ kind: 'coins', coins: (v.c as number[]).map(Number) }],
    answer: (v) => sumOf(v, 'c'),
    explanation: ({ answer }) => `მონეტები ერთად: ${answer} თეთრი.`,
  }),
  u12('u12-counting-money', 'price-tags', 1, {
    prompt: 'რა ღირს ორივე ნივთი ერთად (თეთრი)?',
    variables: { a: int(10, 60, { step: 5 }), b: int(10, 40, { step: 5 }) },
    pictures: (v) => [{ kind: 'tags', items: [{ label: 'I', amount: num(v, 'a') }, { label: 'II', amount: num(v, 'b') }] }],
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ answer }) => `${answer} თეთრი.`,
  }),
  u12('u12-comparing-money', 'tags-more', 2, {
    prompt: 'რამდენი თეთრით ძვირია პირველი ნივთი მეორეზე?',
    variables: { b: int(10, 50, { step: 5 }), d: int(5, 40, { step: 5 }), a: derived((v) => num(v, 'b') + num(v, 'd')) },
    pictures: (v) => [{ kind: 'tags', items: [{ label: 'I', amount: num(v, 'a') }, { label: 'II', amount: num(v, 'b') }] }],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `სხვაობა: ${answer} თეთრი.`,
  }),
  u12('u12-sufficient-funds', 'enough', 2, {
    prompt: 'ჰყოფნის თუ არა ამ მონეტებს ნივთის საყიდლად?',
    variables: { c: coinList, p: int(20, 90, { step: 5 }) },
    constraints: [{ test: (v: Vars) => sumOf(v, 'c') !== num(v, 'p') && sumOf(v, 'c') <= 130, note: 'not equal' }],
    pictures: (v) => [{ kind: 'coins', label: 'მონეტები', coins: (v.c as number[]).map(Number) }, { kind: 'tags', items: [{ label: 'ფასი', amount: num(v, 'p') }] }],
    options: fixed('ჰყოფნის', 'არ ჰყოფნის'),
    optionCount: 2,
    text: true,
    answer: (v) => (sumOf(v, 'c') >= num(v, 'p') ? 'ჰყოფნის' : 'არ ჰყოფნის'),
    explanation: ({ vars, answer }) => `მონეტები: ${sumOf(vars, 'c')} თეთრი; ფასი: ${vars.p}. ${answer}.`,
  }),
  u12('u12-equivalent-amounts', 'five-coins', 1, {
    prompt: 'რამდენი თეთრის ტოლია ეს ხუთთეთრიანი მონეტები?',
    variables: { k: int(2, 12) },
    pictures: (v) => [{ kind: 'coins', coins: Array.from({ length: num(v, 'k') }, () => 5) }],
    answer: (v) => num(v, 'k') * 5,
    explanation: ({ answer }) => `${answer} თეთრი.`,
  }),
];

/* ------------------------------------------------------------ U13 */
const u13 = P('g2-dro', 'u13');
const hourVars = { h: int(1, 12), m: pick(0, 15, 30, 45) };
const U13: QuestionTemplate[] = [
  u13('u13-analog-digital-clocks', 'read-clock', 1, {
    prompt: 'რომელ დროს აჩვენებს საათი?',
    variables: hourVars,
    pictures: (v) => [{ kind: 'clock', minutes: minutesOf(num(v, 'h'), num(v, 'm')) }],
    options: (v) => timeChoices(num(v, 'h'), num(v, 'm'))(),
    text: true,
    answer: (v) => clockWord(num(v, 'h'), num(v, 'm')),
    explanation: ({ answer }) => `საათი ${answer}-ს აჩვენებს.`,
  }),
  u13('u13-comparing-clocks', 'minutes-between', 2, {
    prompt: 'პირველი საათი ადრეა, მეორე — გვიან. რამდენი წუთია მათ შორის?',
    variables: { h: int(1, 11), a: pick(0, 15), d: pick(15, 30, 45) },
    pictures: (v) => [
      { kind: 'clock', minutes: minutesOf(num(v, 'h'), num(v, 'a')) },
      { kind: 'clock', minutes: minutesOf(num(v, 'h'), num(v, 'a') + num(v, 'd')) },
    ],
    constraints: [{ test: (v: Vars) => num(v, 'a') + num(v, 'd') < 60, note: 'same hour' }],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `${answer} წუთი.`,
  }),
  u13('u13-time-spent', 'hours-between', 2, {
    prompt: 'საათები ჩვენებს დაწყებისა და დასრულების დროს. რამდენი საათი გავიდა?',
    variables: { h: int(1, 8), d: int(1, 4) },
    pictures: (v) => [{ kind: 'clock', minutes: minutesOf(num(v, 'h'), 0) }, { kind: 'clock', minutes: minutesOf(num(v, 'h') + num(v, 'd'), 0) }],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `${answer} საათი.`,
  }),
  u13('u13-days-of-week', 'tomorrow', 1, {
    prompt: 'დღეს მონიშნული დღეა ({d}). რომელი დღე იქნება ხვალ?',
    variables: { i: int(0, 6), d: derived((v) => WEEKDAY_NAMES[num(v, 'i')]!) },
    pictures: (v) => [{ kind: 'chips', arrows: true, items: WEEKDAY_NAMES.map((n, i) => ({ text: n, mark: i === num(v, 'i') })) }],
    options: (v) => [1, 2, 3, 6].map((k) => WEEKDAY_NAMES[(num(v, 'i') + k) % 7]!),
    text: true,
    answer: (v) => WEEKDAY_NAMES[(num(v, 'i') + 1) % 7]!,
    explanation: ({ answer }) => `მომდევნო დღე: ${answer}.`,
  }),
  u13('u13-seasons-and-months', 'month-after', 1, {
    prompt: 'მონიშნული თვე ({m}). რომელი თვე მოდის მის შემდეგ?',
    variables: { i: int(0, 11), m: derived((v) => MONTH_NAMES[num(v, 'i')]!) },
    pictures: (v) => [{ kind: 'chips', arrows: true, items: MONTH_NAMES.map((n, i) => ({ text: n, mark: i === num(v, 'i') })) }],
    options: (v) => [1, 2, 3, 11].map((k) => MONTH_NAMES[(num(v, 'i') + k) % 12]!),
    text: true,
    answer: (v) => MONTH_NAMES[(num(v, 'i') + 1) % 12]!,
    explanation: ({ answer }) => `${answer}.`,
  }),
];

/* ------------------------------------------------------------ U14 */
const u14 = P('g2-kanonzomiereba-logika', 'u14');
const U14: QuestionTemplate[] = [
  u14('u14-repeating-patterns', 'color-pattern', 1, {
    prompt: 'რომელი ფერი უნდა იყოს ❓ ადგილას?',
    variables: { x: int(0, 1), y: int(2, 3), r: int(2, 3) },
    pictures: (v) => {
      const unit = [COLORS[num(v, 'x')]!.icon, COLORS[num(v, 'y')]!.icon];
      const shown = Array.from({ length: num(v, 'r') * 2 + 1 }, (_, i) => unit[i % 2]!);
      return [{ kind: 'rows', rows: [{ tokens: [...shown.map((icon) => ({ t: 'icon' as const, icon })), { t: 'unknown' as const }] }] }];
    },
    options: () => COLORS.map((c) => c.name),
    text: true,
    answer: (v) => COLORS[[num(v, 'x'), num(v, 'y')][(num(v, 'r') * 2 + 1) % 2]!]!.name,
    explanation: ({ answer }) => `მიმდევრობა მეორდება; შემდეგი: ${answer}.`,
  }),
  u14('u14-growing-patterns', 'growing-groups', 2, {
    prompt: 'ჯგუფები ერთნაირად იზრდება. რამდენი ობიექტი უნდა იყოს მეოთხე ჯგუფში?',
    variables: { a: int(1, 4), s: int(1, 3) },
    pictures: (v) => {
      const a = num(v, 'a');
      const s = num(v, 's');
      return [manyRows([a, a + s, a + 2 * s].map((n) => ({ tokens: icons('star', n) })).concat([{ tokens: [{ t: 'unknown' as const }] }]))];
    },
    answer: (v) => num(v, 'a') + 3 * num(v, 's'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u14('u14-balance-scales', 'balance-weight', 2, {
    prompt: 'სასწორი წონასწორობაშია. რამდენს იწონის ერთი ბურთი?',
    variables: { k: int(2, 4), w: int(2, 6), t: derived((v) => num(v, 'k') * num(v, 'w')) },
    pictures: (v) => [{ kind: 'balance', left: icons('ball', num(v, 'k')), right: [{ t: 'text', text: `${v.t} კგ` }], tilt: 'level' }],
    answer: (v) => num(v, 'w'),
    explanation: ({ answer, vars }) => `${vars.t} ÷ ${vars.k} = ${answer}.`,
  }),
  u14('u14-word-coding', 'symbol-values', 2, {
    prompt: 'რას უდრის ★ + ● + ●?',
    variables: { s: int(2, 9), c: int(1, 5) },
    pictures: (v) => [manyRows([{ tokens: [{ t: 'icon', icon: 'star' }, { t: 'text', text: `= ${v.s}` }] }, { tokens: [{ t: 'icon', icon: 'dot-red' }, { t: 'text', text: `= ${v.c}` }] }])],
    answer: (v) => num(v, 's') + 2 * num(v, 'c'),
    explanation: ({ answer }) => `${answer}.`,
  }),
];

/* ------------------------------------------------------------ U15 */
const u15 = P('g2-wiladebi', 'u15');
const partsPic = (n: number, shaded: number): Picture => ({
  kind: 'parts',
  bars: [Array.from({ length: n }, (_, i) => ({ size: 1, shaded: i < shaded }))],
});
const U15: QuestionTemplate[] = [
  u15('u15-parts-of-a-whole', 'shaded-fraction', 1, {
    prompt: 'მთელის რა ნაწილია შეღებილი?',
    variables: { n: pick(2, 3, 4), k: pick(1, 2) },
    constraints: [{ test: (v: Vars) => num(v, 'k') < num(v, 'n'), note: 'k<n' }],
    pictures: (v) => [partsPic(num(v, 'n'), num(v, 'k'))],
    options: (v) => {
      const n = num(v, 'n');
      const k = num(v, 'k');
      return [...new Set([`${k}/${n}`, `${n - k}/${n}`, `1/${n + 1}`, `${k}/${n + 1}`, `${n}/${n + k}`, `${k + 1}/${n}`])].slice(0, 4);
    },
    text: true,
    answer: (v) => `${num(v, 'k')}/${num(v, 'n')}`,
    explanation: ({ answer }) => `${answer}.`,
  }),
  u15('u15-halves', 'half-of-row', 1, {
    prompt: 'რამდენია ამ რიგის ნახევარი?',
    variables: { h: int(2, 9) },
    pictures: (v) => [manyRows([{ tokens: [{ t: 'group', tokens: icons('apple', num(v, 'h')) }, { t: 'sep', style: 'bar' }, { t: 'group', tokens: icons('apple', num(v, 'h')) }] }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ answer }) => `ნახევარი: ${answer}.`,
  }),
  u15('u15-thirds', 'third-of-row', 2, {
    prompt: 'რიგი სამ ტოლ ნაწილადაა გაყოფილი. რამდენია მესამედი?',
    variables: { h: int(2, 6) },
    pictures: (v) => [manyRows([{ tokens: [0, 1, 2].flatMap((i) => (i < 2 ? [{ t: 'group' as const, tokens: icons('cookie', num(v, 'h')) }, { t: 'sep' as const, style: 'bar' as const }] : [{ t: 'group' as const, tokens: icons('cookie', num(v, 'h')) }])) }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u15('u15-quarters', 'quarter-of-row', 2, {
    prompt: 'რიგი ოთხ ტოლ ნაწილადაა გაყოფილი. რამდენია მეოთხედი?',
    variables: { h: int(2, 5) },
    pictures: (v) => [manyRows([{ tokens: [0, 1, 2, 3].flatMap((i) => (i < 3 ? [{ t: 'group' as const, tokens: icons('ball', num(v, 'h')) }, { t: 'sep' as const, style: 'bar' as const }] : [{ t: 'group' as const, tokens: icons('ball', num(v, 'h')) }])) }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ answer }) => `${answer}.`,
  }),
];


/* ------------------------------------------------------------ the remaining subtopics */
const x4 = P('g2-ornishna-sekreba', 'u04x');
const x5 = P('g2-ornishna-gamokleba', 'u05x');
const x6 = P('g2-shedareba-dalageba', 'u06x');
const x8 = P('g2-mravalnabijiani-amocanebi', 'u08x');
const x10 = P('g2-monacemebi-albatoba', 'u10x');
const x12 = P('g2-fuli', 'u12x');
const x13 = P('g2-dro', 'u13x');
const x14 = P('g2-kanonzomiereba-logika', 'u14x');
const ranked = (v: Vars, keys: string[]): number[] => keys.map((k) => num(v, k)).sort((a, b) => a - b);
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const EXTRA: QuestionTemplate[] = [
  x4('u04-ways-to-make-number', 'make-number', 1, {
    prompt: 'რიცხვი {w} ორი შესაკრებისგან შედგება. ერთი {a}-ია. რა არის მეორე?',
    variables: { a: int(11, 60), d: int(8, 35), w: derived((v) => num(v, 'a') + num(v, 'd')) },
    pictures: (v) => [model(num(v, 'w'), num(v, 'a'), '?')],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `მეორე შესაკრები: ${answer}.`,
  }),
  x4('u04-adding-three-numbers', 'three-parts', 2, {
    prompt: 'რამდენია სამივე ნაწილი ერთად? ({a}, {b}, {c})',
    variables: { a: int(11, 30), b: int(11, 30), c: int(11, 30) },
    pictures: (v) => [model('?', num(v, 'a'), num(v, 'b'), num(v, 'c'))],
    answer: (v) => num(v, 'a') + num(v, 'b') + num(v, 'c'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  x4('u04-missing-digits', 'column-digit', 2, {
    prompt: 'რომელი ციფრი აკლია შეკრებას? (ჯამი {r})',
    variables: { t: int(1, 5), o: int(0, 9), b: int(11, 29), r: derived((v) => num(v, 't') * 10 + num(v, 'o') + num(v, 'b')) },
    pictures: (v) => [{ kind: 'column', top: `${v.t}?`, sign: '+', bottom: String(v.b), result: String(v.r) }],
    answer: (v) => num(v, 'o'),
    explanation: ({ answer }) => `ერთეულების ადგილზე უნდა იყოს ${answer}.`,
  }),
  x5('u05-filling-table', 'rule-minus', 2, {
    prompt: 'ცხრილში ყველა რიცხვს აკლდება {k}. რომელი რიცხვი უნდა იყოს ❓ ადგილას?',
    variables: { k: pick(5, 6, 7, 8, 9), a: int(20, 40), b: int(41, 60), c: int(61, 90) },
    pictures: (v) => [
      manyRows(
        [num(v, 'a'), num(v, 'b'), num(v, 'c')].map((x, i) => ({
          label: i === 0 ? 'შესავალი → გამოსავალი' : undefined,
          tokens: [
            { t: 'text' as const, text: String(x) },
            { t: 'sep' as const, style: 'arrow' as const },
            i === 2 ? { t: 'unknown' as const } : { t: 'text' as const, text: String(x - num(v, 'k')) },
          ],
        })),
      ),
    ],
    answer: (v) => num(v, 'c') - num(v, 'k'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  x6('u06-ordering-to-100', 'line-second', 2, {
    prompt: 'ღერძზე ოთხი რიცხვია. რომელია მეორე ზრდადობით (უმცირესიდან)?',
    variables: { a: int(5, 95, { step: 5 }), b: int(5, 95, { step: 5 }), c: int(5, 95, { step: 5 }), d: int(5, 95, { step: 5 }) },
    constraints: [distinct('a', 'b', 'c', 'd')],
    pictures: (v) => [{ kind: 'line', from: 0, to: 100, step: 10, marks: ['a', 'b', 'c', 'd'].map((k) => ({ value: num(v, k), label: String(v[k]) })) }],
    answer: (v) => ranked(v, ['a', 'b', 'c', 'd'])[1]!,
    explanation: ({ answer }) => `${answer}.`,
  }),
  x6('u06-ordering-to-1000', 'line-1000', 2, {
    prompt: 'ღერძზე სამი რიცხვია. რომელია უმცირესი?',
    variables: { a: int(100, 900, { step: 50 }), b: int(100, 900, { step: 50 }), c: int(100, 900, { step: 50 }) },
    constraints: [distinct('a', 'b', 'c')],
    pictures: (v) => [{ kind: 'line', from: 0, to: 1000, step: 100, marks: ['a', 'b', 'c'].map((k) => ({ value: num(v, k), label: String(v[k]) })) }],
    answer: (v) => ranked(v, ['a', 'b', 'c'])[0]!,
    explanation: ({ answer }) => `ყველაზე მარცხენა: ${answer}.`,
  }),
  x6('u06-ordering-drag-drop', 'line-middle', 2, {
    prompt: 'ღერძზე სამი რიცხვია. რომელია შუა (არც უდიდესი, არც უმცირესი)?',
    variables: { a: int(5, 95, { step: 5 }), b: int(5, 95, { step: 5 }), c: int(5, 95, { step: 5 }) },
    constraints: [distinct('a', 'b', 'c')],
    pictures: (v) => [{ kind: 'line', from: 0, to: 100, step: 10, marks: ['a', 'b', 'c'].map((k) => ({ value: num(v, k), label: String(v[k]) })) }],
    answer: (v) => ranked(v, ['a', 'b', 'c'])[1]!,
    explanation: ({ answer }) => `${answer}.`,
  }),
  x8('u08-word-problems-multistep', 'steps-chain', 3, {
    prompt: 'დაიწყეს {a}-ით, მერე {b} გამოაკლეს და {c} დაუმატეს. რა მიიღეს?',
    variables: { a: int(30, 70), b: int(11, 25), c: int(11, 25) },
    pictures: (v) => [
      manyRows([
        {
          tokens: [
            { t: 'text', text: String(v.a) },
            { t: 'sep', style: 'arrow' },
            { t: 'text', text: `− ${v.b}` },
            { t: 'sep', style: 'arrow' },
            { t: 'text', text: `+ ${v.c}` },
            { t: 'sep', style: 'arrow' },
            { t: 'unknown' },
          ],
        },
      ]),
    ],
    answer: (v) => num(v, 'a') - num(v, 'b') + num(v, 'c'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  x10('u10-choosing-tables-charts', 'tallest-bar', 1, {
    prompt: 'სვეტოვან დიაგრამაზე რომელი სვეტია ყველაზე მაღალი?',
    variables: { a: int(3, 15), b: int(3, 15), c: int(3, 15) },
    constraints: [distinct('a', 'b', 'c')],
    pictures: (v) => [bars(['ა', 'ბ', 'გ'].map((label, i) => ({ label, size: num(v, ['a', 'b', 'c'][i]!), caption: String(num(v, ['a', 'b', 'c'][i]!)) })))],
    options: fixed('ა', 'ბ', 'გ'),
    optionCount: 3,
    text: true,
    answer: (v) => ['ა', 'ბ', 'გ'][[num(v, 'a'), num(v, 'b'), num(v, 'c')].indexOf(Math.max(num(v, 'a'), num(v, 'b'), num(v, 'c')))]!,
    explanation: ({ answer }) => `ყველაზე დიდი რიცხვი — ${answer} სვეტზე.`,
  }),
  x12('u12-estimating-money', 'round-tags', 3, {
    prompt: 'დაამრგვალე თითოეული ფასი ათეულამდე და შეკრიბე. რამდენი გამოვა?',
    variables: { a: pick(18, 21, 34, 37, 42), b: pick(19, 23, 31, 38, 44), c: pick(12, 26, 33, 49, 52) },
    pictures: (v) => [{ kind: 'tags', items: [num(v, 'a'), num(v, 'b'), num(v, 'c')].map((amount) => ({ amount })) }],
    answer: (v) => [num(v, 'a'), num(v, 'b'), num(v, 'c')].reduce((n, x) => n + Math.round(x / 10) * 10, 0),
    explanation: ({ answer }) => `დამრგვალებული ფასების ჯამი: ${answer}.`,
  }),
  x12('u12-mixed-review', 'change', 2, {
    prompt: 'ამ მონეტებით ვყიდულობთ {p} თეთრიან ნივთს. რამდენი თეთრი დარჩება?',
    variables: { c: coinList, p: int(10, 60, { step: 5 }) },
    constraints: [{ test: (v: Vars) => sumOf(v, 'c') > num(v, 'p') && sumOf(v, 'c') <= 150, note: 'enough' }],
    pictures: (v) => [{ kind: 'coins', coins: (v.c as number[]).map(Number) }],
    answer: (v) => sumOf(v, 'c') - num(v, 'p'),
    explanation: ({ answer }) => `${answer} თეთრი.`,
  }),
  x13('u13-days-in-each-month', 'month-days', 1, {
    prompt: 'რამდენი დღეა მონიშნულ თვეში? ({m})',
    variables: { i: int(0, 11), m: derived((v) => MONTH_NAMES[num(v, 'i')]!) },
    pictures: (v) => [{ kind: 'chips', items: MONTH_NAMES.map((n, i) => ({ text: n, mark: i === num(v, 'i') })) }],
    answer: (v) => DAYS[num(v, 'i')]!,
    explanation: ({ answer }) => `${answer} დღე.`,
  }),
  x14('u14-describing-the-rule', 'rule-step', 2, {
    prompt: 'რამდენი ემატება ყოველ ნაბიჯზე?',
    variables: { a: int(2, 30), s: int(2, 9) },
    pictures: (v) => [{ kind: 'chips', arrows: true, items: [0, 1, 2, 3].map((i) => ({ text: String(num(v, 'a') + i * num(v, 's')) })) }],
    answer: (v) => num(v, 's'),
    explanation: ({ answer }) => `${answer}.`,
  }),
];

export const G2_PICTURED_TEMPLATES: QuestionTemplate[] = [
  ...EXTRA,
  ...U01, ...U02, ...U03, ...U04, ...U05, ...U06, ...U07, ...U08, ...U09, ...U10, ...U11, ...U12, ...U13, ...U14, ...U15,
];
