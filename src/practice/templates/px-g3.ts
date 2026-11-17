/**
 * Grade III — pictured templates.
 *
 * Most of Grade III was words and bare numbers. These templates ask the same
 * kinds of question about something that is drawn: an array of objects, a
 * number strip, base-ten blocks, a bar model, a balance with an equation on it,
 * a number line, coins, tally marks, a clock, a shape cut into equal parts.
 * Every picture is built from the drawn numbers, so it cannot disagree with the
 * question or with its key.
 */
import type { QuestionTemplate, Vars } from './types';
import {
  SHAPES,
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
  objectVars,
  pick,
  str,
} from './ix-kit';
import { arrayPic, barsPic, clockPic, fractionChoices, groupsPic, linePic, list, modelPic, partsPic, sum } from './ix-kit34';

const P = (topicId: string, unit: string) => interactiveSet(3, topicId, `g3-px-${unit}`);
const clockWord = (h: number, m: number): string => `${h}:${String(m).padStart(2, '0')}`;
const timeChoices = (h: number, m: number) => (): string[] => {
  const set = new Set<string>([clockWord(h, m)]);
  for (const c of [clockWord((h % 12) + 1, m), clockWord(((h + 10) % 12) + 1, m), clockWord(h, (m + 30) % 60), clockWord(h, (m + 15) % 60), clockWord((h % 12) + 1, (m + 45) % 60)]) {
    if (set.size < 4) set.add(c);
  }
  return [...set];
};
const coinList = { kind: 'list' as const, pick: { values: [5, 10, 20, 50, 5, 10], length: { min: 3, max: 6 } } };

/* ------------------------------------------------------------ U01 */
const u01 = P('g3-ricxvebi100', 'u01');
const U01: QuestionTemplate[] = [
  u01('u01-tens-and-ones', 'read-blocks', 1, {
    prompt: 'რომელი რიცხვია გამოსახული მოდელზე?',
    variables: { t: int(1, 9), o: int(0, 9), n: derived((v) => num(v, 't') * 10 + num(v, 'o')) },
    pictures: (v) => [blocksTO(num(v, 't'), num(v, 'o'))],
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.t} ათეული და ${vars.o} ერთეული — ეს არის ${vars.n}.`,
  }),
  u01('u01-before-and-after', 'after', 1, {
    prompt: 'რომელი რიცხვი უნდა იყოს ❓ ადგილას?',
    variables: { n: int(11, 99) },
    pictures: (v) => [{ kind: 'chips', arrows: true, items: [{ text: String(num(v, 'n') - 1) }, { text: String(num(v, 'n')) }, { text: '?' }] }],
    answer: (v) => num(v, 'n') + 1,
    explanation: ({ answer }) => `ერთით მეტია ${answer}.`,
  }),
  u01('u01-before-and-after', 'before', 1, {
    prompt: 'რომელი რიცხვი უნდა იყოს ❓ ადგილას?',
    variables: { n: int(12, 100) },
    pictures: (v) => [{ kind: 'chips', arrows: true, items: [{ text: '?' }, { text: String(num(v, 'n')) }, { text: String(num(v, 'n') + 1) }] }],
    answer: (v) => num(v, 'n') - 1,
    explanation: ({ answer }) => `ერთით ნაკლებია ${answer}.`,
  }),
  u01('u01-hundred-chart', 'strip-missing', 1, {
    prompt: 'რომელი რიცხვი აკლია ცხრილის ამ ნაწილს?',
    variables: { a: int(1, 90), slot: int(1, 2) },
    pictures: (v) => [{ kind: 'strip', cells: [0, 1, 2, 3].map((i) => ({ text: String(num(v, 'a') + i), unknown: i === num(v, 'slot') })) }],
    answer: (v) => num(v, 'a') + num(v, 'slot'),
    explanation: ({ answer }) => `აკლია ${answer}.`,
  }),
  u01('u01-number-line', 'read-line', 2, {
    prompt: 'რომელ რიცხვზე დგას წითელი წერტილი რიცხვით ღერძზე?',
    variables: { n: int(1, 19) },
    pictures: (v) => [{ kind: 'line', from: 0, to: 100, step: 10, marks: [{ value: num(v, 'n') * 5 }] }],
    answer: (v) => num(v, 'n') * 5,
    explanation: ({ answer }) => `წერტილი ${answer}-ზე დგას.`,
  }),
];

/* ------------------------------------------------------------ U02 */
const u02 = P('g3-tvla-mimdevrobebi', 'u02');
const U02: QuestionTemplate[] = [
  u02('u02-counting-objects', 'array-total', 1, {
    prompt: 'რამდენი {noun} არის სულ?',
    variables: { ...objectVars(), r: int(2, 7), c: int(2, 8) },
    pictures: (v) => [arrayPic(num(v, 'r'), num(v, 'c'), str(v, 'obj'))],
    answer: (v) => num(v, 'r') * num(v, 'c'),
    explanation: ({ vars }) => `${vars.r} რიგი თითო ${vars.c}: ${Number(vars.r) * Number(vars.c)}.`,
  }),
  u02('u02-number-patterns', 'chips-missing', 2, {
    prompt: 'რომელი რიცხვი უნდა იყოს ❓ ადგილას?',
    variables: { a: int(2, 40), d: int(2, 9), slot: int(1, 3) },
    pictures: (v) => [{ kind: 'chips', arrows: true, items: [0, 1, 2, 3, 4].map((i) => ({ text: i === num(v, 'slot') + 1 ? '?' : String(num(v, 'a') + i * num(v, 'd')) })) }],
    answer: (v) => num(v, 'a') + (num(v, 'slot') + 1) * num(v, 'd'),
    explanation: ({ vars }) => `ყოველ ნაბიჯზე ემატება ${vars.d}.`,
  }),
  u02('u02-counting-tables', 'chips-step', 2, {
    prompt: 'ცხრილში რიცხვები თანაბრად იზრდება. რომელი რიცხვია ❓ ადგილას?',
    variables: { a: int(3, 30), d: int(3, 9) },
    pictures: (v) => [{ kind: 'chips', arrows: true, items: [0, 1, 2, 3].map((i) => ({ text: String(num(v, 'a') + i * num(v, 'd')) })).concat([{ text: '?' }]) }],
    answer: (v) => num(v, 'a') + 4 * num(v, 'd'),
    explanation: ({ vars }) => `ყოველ ნაბიჯზე ემატება ${vars.d}.`,
  }),
];

/* ------------------------------------------------------------ U03 */
const u03 = P('g3-ertnishna-moqmedebebi', 'u03');
const COUNT_ICONS = ['apple', 'star', 'ball', 'cookie', 'fish', 'balloon'];
const U03: QuestionTemplate[] = [
  u03('u03-single-digit-addition', 'two-groups', 1, {
    prompt: 'რამდენია სულ?',
    variables: { a: int(2, 9), b: int(2, 9), i: int(0, 5) },
    pictures: (v) => [groupsPic(COUNT_ICONS[num(v, 'i')]!, [num(v, 'a'), num(v, 'b')])],
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u03('u03-adding-three-numbers', 'three-groups', 2, {
    prompt: 'რამდენია სულ სამივე ჯგუფში?',
    variables: { a: int(2, 7), b: int(2, 7), c: int(2, 7), i: int(0, 5) },
    pictures: (v) => [groupsPic(COUNT_ICONS[num(v, 'i')]!, [num(v, 'a'), num(v, 'b'), num(v, 'c')])],
    answer: (v) => num(v, 'a') + num(v, 'b') + num(v, 'c'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} + ${vars.c} = ${Number(vars.a) + Number(vars.b) + Number(vars.c)}.`,
  }),
  u03('u03-adding-four-or-more', 'four-groups', 3, {
    prompt: 'რამდენია სულ ოთხივე ჯგუფში?',
    variables: { a: int(2, 6), b: int(2, 6), c: int(2, 6), d: int(2, 6), i: int(0, 5) },
    pictures: (v) => [groupsPic(COUNT_ICONS[num(v, 'i')]!, [num(v, 'a'), num(v, 'b'), num(v, 'c'), num(v, 'd')])],
    answer: (v) => num(v, 'a') + num(v, 'b') + num(v, 'c') + num(v, 'd'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} = ${['a', 'b', 'c', 'd'].reduce((s, k) => s + Number(vars[k]), 0)}.`,
  }),
  u03('u03-doubling-halving', 'double-groups', 1, {
    prompt: 'ორივე ჯგუფში ერთნაირი რაოდენობაა. რამდენია სულ?',
    variables: { a: int(3, 9), i: int(0, 5) },
    pictures: (v) => [groupsPic(COUNT_ICONS[num(v, 'i')]!, [num(v, 'a'), num(v, 'a')])],
    answer: (v) => 2 * num(v, 'a'),
    explanation: ({ vars }) => `${vars.a} + ${vars.a} = ${2 * Number(vars.a)}.`,
  }),
  u03('u03-subtraction-within-20', 'crossed', 1, {
    prompt: 'გადახაზულები წაიღეს. რამდენი დარჩა?',
    variables: { a: int(8, 18), b: int(2, 7), i: int(0, 5) },
    pictures: (v) => [iconRow(COUNT_ICONS[num(v, 'i')]!, num(v, 'a'), undefined, num(v, 'b'))],
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}.`,
  }),
];

/* ------------------------------------------------------------ U04 */
const u04 = P('g3-gamravleba', 'u04');
const U04: QuestionTemplate[] = [
  u04('u04-facts-0-to-5', 'array', 1, {
    prompt: 'რამდენი ობიექტია სულ? ჩაწერე გამრავლებით.',
    variables: { ...objectVars(), r: int(2, 5), c: int(2, 5) },
    pictures: (v) => [arrayPic(num(v, 'r'), num(v, 'c'), str(v, 'obj'))],
    answer: (v) => num(v, 'r') * num(v, 'c'),
    explanation: ({ vars }) => `${vars.r} × ${vars.c} = ${Number(vars.r) * Number(vars.c)}.`,
  }),
  u04('u04-facts-6-to-10', 'array-2', 2, {
    prompt: 'რამდენი ობიექტია სულ?',
    variables: { ...objectVars(), r: int(6, 9), c: int(3, 9) },
    pictures: (v) => [arrayPic(num(v, 'r'), num(v, 'c'), str(v, 'obj'))],
    answer: (v) => num(v, 'r') * num(v, 'c'),
    explanation: ({ vars }) => `${vars.r} × ${vars.c} = ${Number(vars.r) * Number(vars.c)}.`,
  }),
  u04('u04-rectangular-tables', 'tiles', 1, {
    prompt: 'სულ რამდენი უჯრაა ბადეში?',
    variables: { r: int(2, 8), c: int(2, 9) },
    pictures: (v) => [arrayPic(num(v, 'r'), num(v, 'c'), 'sq-yellow')],
    answer: (v) => num(v, 'r') * num(v, 'c'),
    explanation: ({ vars }) => `${vars.r} × ${vars.c} = ${Number(vars.r) * Number(vars.c)}.`,
  }),
  u04('u04-unknown-factors', 'array-columns', 2, {
    prompt: 'ბადეში {n} კვადრატია და {r} რიგი. რამდენი კვადრატია ერთ რიგში?',
    variables: { r: int(2, 6), c: int(3, 9), n: derived((v) => num(v, 'r') * num(v, 'c')) },
    pictures: (v) => [arrayPic(num(v, 'r'), num(v, 'c'), 'sq-orange')],
    answer: (v) => num(v, 'c'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.r} = ${vars.c}.`,
  }),
  u04('u04-addition-multiplication-relation', 'equal-groups', 2, {
    prompt: 'ყველა ჯგუფში ერთნაირი რაოდენობაა. რამდენია სულ? ჩაწერე გამრავლებით.',
    variables: { k: int(3, 6), c: int(2, 7), i: int(0, 5) },
    pictures: (v) => [groupsPic(COUNT_ICONS[num(v, 'i')]!, Array.from({ length: num(v, 'k') }, () => num(v, 'c')))],
    answer: (v) => num(v, 'k') * num(v, 'c'),
    explanation: ({ vars }) => `${vars.k} × ${vars.c} = ${Number(vars.k) * Number(vars.c)}.`,
  }),
  u04('u04-multiplying-same-number', 'square-array', 2, {
    prompt: 'კვადრატულ განლაგებაში რამდენი კვადრატია?',
    variables: { s: int(3, 10) },
    pictures: (v) => [arrayPic(num(v, 's'), num(v, 's'), 'sq-blue')],
    answer: (v) => num(v, 's') * num(v, 's'),
    explanation: ({ vars }) => `${vars.s} × ${vars.s} = ${Number(vars.s) * Number(vars.s)}.`,
  }),
  u04('u04-table-filling', 'table-cell', 2, {
    prompt: 'რომელი რიცხვი უნდა ეწეროს გამრავლების ცხრილის ❓ უჯრაში?',
    variables: { a: int(3, 9), b: int(2, 6), slot: int(0, 2) },
    pictures: (v) => {
      const a = num(v, 'a');
      const b = num(v, 'b');
      const cols = [b, b + 1, b + 2];
      return [
        {
          kind: 'chart',
          rows: [
            [{ text: '×' }, ...cols.map((c) => ({ text: String(c), mark: true }))],
            [{ text: String(a), mark: true }, ...cols.map((c, i) => ({ text: i === num(v, 'slot') ? '?' : String(a * c), unknown: i === num(v, 'slot') }))],
          ],
        },
      ];
    },
    answer: (v) => num(v, 'a') * (num(v, 'b') + num(v, 'slot')),
    explanation: ({ answer }) => `უჯრაში ${answer} იწერება.`,
  }),
];

/* ------------------------------------------------------------ U05 */
const u05 = P('g3-gayofa', 'u05');
const U05: QuestionTemplate[] = [
  u05('u05-facts-1-to-5', 'share', 1, {
    prompt: 'ეს {noun} თანაბრად უნდა გაუნაწილონ {k} ბავშვს. რამდენი შეხვდება თითოეულს?',
    variables: { ...objectVars(), k: int(2, 5), q: int(2, 5), n: derived((v) => num(v, 'k') * num(v, 'q')) },
    pictures: (v) => [iconRow(str(v, 'obj'), num(v, 'n'))],
    answer: (v) => num(v, 'q'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.k} = ${vars.q}.`,
  }),
  u05('u05-division-tables', 'model', 2, {
    prompt: 'მთელი ტოლ ნაწილებადაა გაყოფილი. რა რიცხვი უნდა ეწეროს ❓ ადგილას?',
    variables: { k: int(2, 6), q: int(2, 9), n: derived((v) => num(v, 'k') * num(v, 'q')) },
    pictures: (v) => [modelPic(num(v, 'n'), ...Array.from({ length: num(v, 'k') }, (_, i) => (i === 0 ? '?' : num(v, 'q'))))],
    answer: (v) => num(v, 'q'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.k} = ${vars.q}.`,
  }),
  u05('u05-word-problems-division', 'rows', 2, {
    prompt: 'სულ {n} ობიექტია, ისინი {k} რიგადაა დაწყობილი. რამდენია ერთ რიგში?',
    variables: { ...objectVars(), k: int(2, 6), q: int(3, 9), n: derived((v) => num(v, 'k') * num(v, 'q')) },
    pictures: (v) => [arrayPic(num(v, 'k'), num(v, 'q'), str(v, 'obj'))],
    answer: (v) => num(v, 'q'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.k} = ${vars.q}.`,
  }),
  u05('u05-unknown-dividends-divisors', 'model-unknown', 2, {
    prompt: 'მთელი {k} ტოლ ნაწილადაა გაყოფილი, თითოეული {q}. რა რიცხვია მთელი?',
    variables: { k: int(2, 6), q: int(2, 9) },
    pictures: (v) => [modelPic('?', ...Array.from({ length: num(v, 'k') }, () => num(v, 'q')))],
    answer: (v) => num(v, 'k') * num(v, 'q'),
    explanation: ({ vars }) => `${vars.k} × ${vars.q} = ${Number(vars.k) * Number(vars.q)}.`,
  }),
];

/* ------------------------------------------------------------ U06 */
const u06 = P('g3-raodenobis-shedareba', 'u06');
const U06: QuestionTemplate[] = [
  u06('u06-equalizing-quantities', 'bars-equalize', 2, {
    prompt: 'რამდენი უნდა გადავიტანოთ პირველი ყუთიდან მეორეში, რომ ორივეში ტოლი რაოდენობა იყოს?',
    variables: { b: int(4, 20), h: int(1, 8), a: derived((v) => num(v, 'b') + 2 * num(v, 'h')) },
    pictures: (v) => [barsPic([{ label: 'I', size: num(v, 'a'), caption: String(num(v, 'a')) }, { label: 'II', size: num(v, 'b'), caption: String(num(v, 'b')) }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ vars }) => `სხვაობა ${2 * Number(vars.h)}, ნახევარი ${vars.h}.`,
  }),
  u06('u06-object-quantity-analysis', 'model-total', 1, {
    prompt: 'რამდენია სულ?',
    variables: { a: int(12, 60), b: int(12, 60) },
    pictures: (v) => [modelPic('?', num(v, 'a'), num(v, 'b'))],
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u06('u06-object-quantity-analysis', 'model-part', 2, {
    prompt: 'რა რიცხვი უნდა ეწეროს ❓ ადგილას?',
    variables: { a: int(12, 60), b: int(12, 60), w: derived((v) => num(v, 'a') + num(v, 'b')) },
    pictures: (v) => [modelPic(num(v, 'w'), num(v, 'a'), '?')],
    answer: (v) => num(v, 'b'),
    explanation: ({ vars }) => `${vars.w} − ${vars.a} = ${vars.b}.`,
  }),
];

/* ------------------------------------------------------------ U07 */
const u07 = P('g3-mravalmoqmedebiani', 'u07');
const U07: QuestionTemplate[] = [
  u07('u07-scale-comparisons', 'times-more', 2, {
    prompt: 'რამდენჯერ მეტია მეორე რიგში, ვიდრე პირველში?',
    variables: { a: int(2, 4), k: int(2, 4), i: int(0, 5) },
    pictures: (v) => [manyRows([{ label: 'I', tokens: icons(COUNT_ICONS[num(v, 'i')]!, num(v, 'a')) }, { label: 'II', tokens: icons(COUNT_ICONS[num(v, 'i')]!, num(v, 'a') * num(v, 'k')) }])],
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${Number(vars.a) * Number(vars.k)} ÷ ${vars.a} = ${vars.k}.`,
  }),
  u07('u07-scale-comparisons', 'times-less', 2, {
    prompt: 'რამდენჯერ ნაკლებია პირველ რიგში, ვიდრე მეორეში?',
    variables: { a: int(2, 4), k: int(2, 4), i: int(0, 5) },
    pictures: (v) => [manyRows([{ label: 'I', tokens: icons(COUNT_ICONS[num(v, 'i')]!, num(v, 'a')) }, { label: 'II', tokens: icons(COUNT_ICONS[num(v, 'i')]!, num(v, 'a') * num(v, 'k')) }])],
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${Number(vars.a) * Number(vars.k)} ÷ ${vars.a} = ${vars.k}.`,
  }),
  u07('u07-multistep-brackets', 'groups-plus', 3, {
    prompt: 'სულ რამდენი ობიექტია: {k} ჯგუფი {c}-ობით და კიდევ {e} ცალკე?',
    variables: { k: int(2, 4), c: int(2, 5), e: int(1, 5), i: int(0, 5) },
    pictures: (v) => [manyRows([{ tokens: [...Array.from({ length: num(v, 'k') }, () => ({ t: 'group' as const, tokens: icons(COUNT_ICONS[num(v, 'i')]!, num(v, 'c')) })), { t: 'sep' as const, style: 'bar' as const }, ...icons(COUNT_ICONS[num(v, 'i')]!, num(v, 'e'))] }])],
    answer: (v) => num(v, 'k') * num(v, 'c') + num(v, 'e'),
    explanation: ({ vars }) => `${vars.k} × ${vars.c} + ${vars.e} = ${Number(vars.k) * Number(vars.c) + Number(vars.e)}.`,
  }),
];

/* ------------------------------------------------------------ U08 */
const u08 = P('g3-gantolebebi', 'u08');
const balanceEq = (left: string, right: string) => ({ kind: 'balance' as const, left: [{ t: 'text' as const, text: left }], right: [{ t: 'text' as const, text: right }], tilt: 'level' as const });
const U08: QuestionTemplate[] = [
  u08('u08-unknown-addends', 'balance', 2, {
    prompt: 'სასწორი წონასწორობაშია. რას უდრის x?',
    variables: { a: int(3, 30), x: int(3, 30), b: derived((v) => num(v, 'a') + num(v, 'x')) },
    pictures: (v) => [balanceEq(`x + ${num(v, 'a')}`, String(num(v, 'b')))],
    answer: (v) => num(v, 'x'),
    explanation: ({ vars }) => `x = ${vars.b} − ${vars.a} = ${vars.x}.`,
  }),
  u08('u08-unknown-minuends-subtrahends', 'balance-2', 2, {
    prompt: 'სასწორი წონასწორობაშია. რას უდრის x?',
    variables: { a: int(3, 30), b: int(3, 30), x: derived((v) => num(v, 'a') + num(v, 'b')) },
    pictures: (v) => [balanceEq(`x − ${num(v, 'a')}`, String(num(v, 'b')))],
    answer: (v) => num(v, 'x'),
    explanation: ({ vars }) => `x = ${vars.b} + ${vars.a} = ${vars.x}.`,
  }),
  u08('u08-unknown-factors', 'balance-3', 2, {
    prompt: 'სასწორი წონასწორობაშია. რას უდრის x?',
    variables: { a: int(2, 9), x: int(2, 9), b: derived((v) => num(v, 'a') * num(v, 'x')) },
    pictures: (v) => [balanceEq(`x × ${num(v, 'a')}`, String(num(v, 'b')))],
    answer: (v) => num(v, 'x'),
    explanation: ({ vars }) => `x = ${vars.b} ÷ ${vars.a} = ${vars.x}.`,
  }),
  u08('u08-unknown-dividends-divisors', 'balance-4', 3, {
    prompt: 'სასწორი წონასწორობაშია. რას უდრის x?',
    variables: { a: int(2, 9), q: int(2, 9), x: derived((v) => num(v, 'a') * num(v, 'q')) },
    pictures: (v) => [balanceEq(`x ÷ ${num(v, 'a')}`, String(num(v, 'q')))],
    answer: (v) => num(v, 'x'),
    explanation: ({ vars }) => `x = ${vars.q} × ${vars.a} = ${vars.x}.`,
  }),
];

/* ------------------------------------------------------------ U09 */
const u09 = P('g3-damrgvaleba', 'u09');
const nearestTen = (n: number): number => Math.round(n / 10) * 10;
const U09: QuestionTemplate[] = [
  u09('u09-rounding-tens-hundreds-thousands', 'line-tens', 1, {
    prompt: 'რომელ ათეულთან ახლოსაა წითელი წერტილი?',
    variables: { lo: int(1, 9), o: pick(1, 2, 3, 4, 6, 7, 8, 9) },
    pictures: (v) => [linePic(num(v, 'lo') * 10, num(v, 'lo') * 10 + 10, 1, num(v, 'lo') * 10 + num(v, 'o'))],
    answer: (v) => nearestTen(num(v, 'lo') * 10 + num(v, 'o')),
    explanation: ({ answer, vars }) => `${Number(vars.lo) * 10 + Number(vars.o)} ≈ ${answer}.`,
  }),
  u09('u09-approximate-operations', 'sum-line', 2, {
    prompt: 'დაამრგვალე ორივე რიცხვი უახლოეს ათეულამდე და იპოვე მიახლოებითი ჯამი.',
    variables: { a: int(11, 49), b: int(11, 49) },
    constraints: [{ test: (v) => num(v, 'a') % 10 !== 5 && num(v, 'b') % 10 !== 5 && num(v, 'a') % 10 !== 0 && num(v, 'b') % 10 !== 0, note: 'არა ზუსტად შუა' }],
    pictures: (v) => [linePic(0, 100, 10, num(v, 'a'), num(v, 'b'))],
    answer: (v) => nearestTen(num(v, 'a')) + nearestTen(num(v, 'b')),
    explanation: ({ vars, answer }) => `${nearestTen(Number(vars.a))} + ${nearestTen(Number(vars.b))} = ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U10 */
const u10 = P('g3-gazomva-geometria', 'u10');
const SIDED = SHAPES.filter((s) => s.sides >= 3);
const U10: QuestionTemplate[] = [
  u10('u10-sides-vertices-edges-faces', 'count-sides', 1, {
    prompt: 'რამდენი გვერდი აქვს ამ ფიგურას?',
    variables: { i: int(0, SIDED.length - 1) },
    pictures: (v) => [manyRows([{ tokens: [{ t: 'icon', icon: SIDED[num(v, 'i')]!.icon }] }])],
    answer: (v) => SIDED[num(v, 'i')]!.sides,
    explanation: ({ answer }) => `ფიგურას ${answer} გვერდი აქვს.`,
  }),
  u10('u10-polygons-shape-filling', 'name-polygon', 2, {
    prompt: 'რა ჰქვია ამ ფიგურას?',
    variables: { i: int(0, SIDED.length - 1) },
    pictures: (v) => [manyRows([{ tokens: [{ t: 'icon', icon: SIDED[num(v, 'i')]!.icon }] }])],
    options: (v) => [0, 1, 2, 3].map((k) => SIDED[(num(v, 'i') + k) % SIDED.length]!.name),
    optionCount: 4,
    text: true,
    answer: (v) => SIDED[num(v, 'i')]!.name,
    explanation: ({ answer }) => `ეს არის ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U11 */
const u11 = P('g3-fuli', 'u11');
const U11: QuestionTemplate[] = [
  u11('u11-counting-tetri-lari', 'coins-total', 1, {
    prompt: 'რამდენი თეთრია სულ?',
    variables: { c: coinList },
    constraints: [{ test: (v: Vars) => sum(list(v, 'c')) <= 200, note: 'small' }],
    pictures: (v) => [{ kind: 'coins', coins: list(v, 'c') }],
    answer: (v) => sum(list(v, 'c')),
    explanation: ({ answer }) => `მონეტები ერთად: ${answer} თეთრი.`,
  }),
  u11('u11-sufficient-funds-shopping', 'enough', 2, {
    prompt: 'ეყოფა თუ არა ეს მონეტები ნივთის საყიდლად?',
    variables: { c: coinList, p: int(20, 150, { step: 5 }) },
    constraints: [{ test: (v: Vars) => sum(list(v, 'c')) !== num(v, 'p'), note: 'არა ზუსტად' }],
    pictures: (v) => [{ kind: 'coins', label: 'მონეტები', coins: list(v, 'c') }, { kind: 'tags', items: [{ label: 'ფასი', amount: num(v, 'p') }] }],
    options: fixed('კი', 'არა'),
    optionCount: 2,
    text: true,
    answer: (v) => (sum(list(v, 'c')) >= num(v, 'p') ? 'კი' : 'არა'),
    explanation: ({ vars }) => `მონეტები ერთად ${sum(list(vars as Vars, 'c'))} თეთრია, ფასი — ${vars.p}.`,
  }),
  u11('u11-money-operations', 'change-coins', 2, {
    prompt: 'ნივთი ღირს {p} თეთრი. გადაიხადეს ეს მონეტები. რამდენი თეთრი უნდა დაუბრუნონ ხურდად?',
    variables: { c: coinList, p: int(10, 140, { step: 5 }) },
    constraints: [{ test: (v: Vars) => sum(list(v, 'c')) > num(v, 'p'), note: 'ხურდა არის' }],
    pictures: (v) => [{ kind: 'coins', label: 'გადახდილი', coins: list(v, 'c') }],
    answer: (v) => sum(list(v, 'c')) - num(v, 'p'),
    explanation: ({ answer }) => `ხურდა: ${answer} თეთრი.`,
  }),
];

/* ------------------------------------------------------------ U12 */
const u12 = P('g3-monacemebi-albatoba', 'u12');
const U12: QuestionTemplate[] = [
  u12('u12-diagrams-pictograms-dotplots', 'pictogram-total', 2, {
    prompt: 'პიქტოგრამაზე ერთი ⭐ ნიშნავს 2 წიგნს. რამდენი წიგნია სულ?',
    variables: { x: int(2, 6), y: int(2, 6) },
    pictures: (v) => [manyRows([{ label: 'ზღაპრები', tokens: icons('star', num(v, 'x')) }, { label: 'ენციკლოპედია', tokens: icons('star', num(v, 'y')) }])],
    answer: (v) => 2 * (num(v, 'x') + num(v, 'y')),
    explanation: ({ vars }) => `(${vars.x} + ${vars.y}) × 2 = ${2 * (Number(vars.x) + Number(vars.y))}.`,
  }),
  u12('u12-table-data-comparison', 'bars-difference', 2, {
    prompt: 'რამდენით მეტია გაყიდული ორშაბათს, ვიდრე სამშაბათს?',
    variables: { b: int(4, 20), h: int(1, 9), a: derived((v) => num(v, 'b') + num(v, 'h')) },
    pictures: (v) => [barsPic([{ label: 'ორშ', size: num(v, 'a'), caption: String(num(v, 'a')) }, { label: 'სამ', size: num(v, 'b'), caption: String(num(v, 'b')) }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${vars.h}.`,
  }),
  u12('u12-gathering-grouping-data', 'tally-total', 1, {
    prompt: 'რამდენი მოსწავლეა სულ?',
    variables: { a: int(3, 12), b: int(3, 12) },
    pictures: (v) => [{ kind: 'tally', rows: [{ label: 'ბიჭები', count: num(v, 'a') }, { label: 'გოგოები', count: num(v, 'b') }] }],
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u12('u12-combinations-likelihood', 'likelier-color', 2, {
    prompt: 'ყუთიდან დაუხედავად იღებენ ერთ ბურთს. რომელი ფერის ბურთის ამოღებაა უფრო სავარაუდო?',
    variables: { a: int(2, 12), b: int(2, 12) },
    constraints: [distinct('a', 'b')],
    pictures: (v) => [manyRows([{ tokens: icons('dot-red', num(v, 'a')) }, { tokens: icons('dot-blue', num(v, 'b')) }])],
    options: fixed('წითელი', 'ლურჯი'),
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'a') > num(v, 'b') ? 'წითელი' : 'ლურჯი'),
    explanation: ({ answer }) => `მეტია ${answer} ბურთი.`,
  }),
];

/* ------------------------------------------------------------ U13 */
const u13 = P('g3-dro-kalendari', 'u13');
const U13: QuestionTemplate[] = [
  u13('u13-time-sequences-comparisons', 'read-clock', 1, {
    prompt: 'რომელ დროს აჩვენებს საათი?',
    variables: { h: int(1, 12), m: pick(0, 15, 30, 45) },
    pictures: (v) => [clockPic(num(v, 'h'), num(v, 'm'))],
    options: (v) => timeChoices(num(v, 'h'), num(v, 'm'))(),
    text: true,
    answer: (v) => clockWord(num(v, 'h'), num(v, 'm')),
    explanation: ({ answer }) => `საათი ${answer}-ს აჩვენებს.`,
  }),
  u13('u13-elapsed-time-problems', 'two-clocks', 2, {
    prompt: 'პირველი საათი დაწყების დროა, მეორე — დასრულების. რამდენი წუთი გაგრძელდა?',
    variables: { h: int(1, 10), a: pick(0, 15, 30), d: pick(15, 20, 25, 30, 35, 40, 45) },
    constraints: [{ test: (v: Vars) => num(v, 'a') + num(v, 'd') < 60, note: 'იგივე საათი' }],
    pictures: (v) => [clockPic(num(v, 'h'), num(v, 'a')), clockPic(num(v, 'h'), num(v, 'a') + num(v, 'd'))],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `${answer} წუთი.`,
  }),
  u13('u13-elapsed-time-problems', 'two-clocks-hours', 2, {
    prompt: 'საათები აჩვენებს დაწყებისა და დასრულების დროს. რამდენი საათი გავიდა?',
    variables: { h: int(1, 8), d: int(1, 4) },
    pictures: (v) => [clockPic(num(v, 'h'), 0), clockPic(num(v, 'h') + num(v, 'd'), 0)],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `${answer} საათი.`,
  }),
];

/* ------------------------------------------------------------ U14 */
const u14 = P('g3-kanonzomiereba-logika', 'u14');
const U14: QuestionTemplate[] = [
  u14('u14-balance-scale-reasoning', 'balance-missing', 2, {
    prompt: 'სასწორი წონასწორობაშია. მარჯვენა თეფშზე ❓ ადგილას რამდენი ბურთი უნდა იყოს?',
    variables: { n: int(5, 12), m: int(1, 4), k: derived((v) => num(v, 'n') - num(v, 'm')) },
    pictures: (v) => [{ kind: 'balance', left: icons('ball', num(v, 'n')), right: [...icons('ball', num(v, 'm')), { t: 'text', text: '?' }], tilt: 'level' }],
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${vars.n} − ${vars.m} = ${vars.k}.`,
  }),
  u14('u14-interval-problems-color-choices', 'trees', 2, {
    prompt: 'ბილიკზე დარგულია ხეები. რამდენი შუალედია მეზობელ ხეებს შორის?',
    variables: { n: int(4, 12) },
    pictures: (v) => [manyRows([{ tokens: icons('tree', num(v, 'n')) }])],
    answer: (v) => num(v, 'n') - 1,
    explanation: ({ vars }) => `${vars.n} ხეს შორის ${Number(vars.n) - 1} შუალედია.`,
  }),
  u14('u14-number-sequences-triangles', 'step-chips', 2, {
    prompt: 'იპოვე შემდეგი რიცხვი მიმდევრობაში.',
    variables: { a: int(4, 40), d: int(3, 12) },
    pictures: (v) => [{ kind: 'chips', arrows: true, items: [0, 1, 2].map((i) => ({ text: String(num(v, 'a') + i * num(v, 'd')) })).concat([{ text: '?' }]) }],
    answer: (v) => num(v, 'a') + 3 * num(v, 'd'),
    explanation: ({ vars }) => `ყოველ ნაბიჯზე ემატება ${vars.d}.`,
  }),
];

/* ------------------------------------------------------------ U15 */
const u15 = P('g3-wiladebi-shesavali', 'u15');
const U15: QuestionTemplate[] = [
  u15('u15-parts-of-a-whole', 'shaded-fraction', 1, {
    prompt: 'მთელის რა ნაწილია შეღებილი?',
    variables: { n: pick(2, 3, 4, 5, 6, 8, 10), k: int(1, 9) },
    constraints: [{ test: (v: Vars) => num(v, 'k') < num(v, 'n'), note: 'k<n' }],
    pictures: (v) => [partsPic(num(v, 'n'), num(v, 'k'))],
    options: (v) => fractionChoices(num(v, 'k'), num(v, 'n'))(),
    text: true,
    answer: (v) => `${num(v, 'k')}/${num(v, 'n')}`,
    explanation: ({ answer }) => `${answer}.`,
  }),
  u15('u15-equal-parts-halves', 'half-of-row', 1, {
    prompt: 'რამდენია ამ რიგის ნახევარი?',
    variables: { h: int(2, 10) },
    pictures: (v) => [manyRows([{ tokens: [{ t: 'group', tokens: icons('apple', num(v, 'h')) }, { t: 'sep', style: 'bar' }, { t: 'group', tokens: icons('apple', num(v, 'h')) }] }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ answer }) => `ნახევარი: ${answer}.`,
  }),
  u15('u15-thirds-and-quarters', 'third-of-row', 2, {
    prompt: 'რიგი სამ ტოლ ნაწილადაა გაყოფილი. რამდენია მესამედი?',
    variables: { h: int(2, 6) },
    pictures: (v) => [manyRows([{ tokens: [0, 1, 2].flatMap((i) => (i < 2 ? [{ t: 'group' as const, tokens: icons('cookie', num(v, 'h')) }, { t: 'sep' as const, style: 'bar' as const }] : [{ t: 'group' as const, tokens: icons('cookie', num(v, 'h')) }])) }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ answer }) => `მესამედი: ${answer}.`,
  }),
  u15('u15-thirds-and-quarters', 'quarter-of-row', 3, {
    prompt: 'რიგი ოთხ ტოლ ნაწილადაა გაყოფილი. რამდენია მეოთხედი?',
    variables: { h: int(2, 5) },
    pictures: (v) => [manyRows([{ tokens: [0, 1, 2, 3].flatMap((i) => (i < 3 ? [{ t: 'group' as const, tokens: icons('star', num(v, 'h')) }, { t: 'sep' as const, style: 'bar' as const }] : [{ t: 'group' as const, tokens: icons('star', num(v, 'h')) }])) }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ answer }) => `მეოთხედი: ${answer}.`,
  }),
];

export const G3_PICTURED_TEMPLATES: QuestionTemplate[] = [
  ...U01, ...U02, ...U03, ...U04, ...U05, ...U06, ...U07, ...U08, ...U09, ...U10, ...U11, ...U12, ...U13, ...U14, ...U15,
];
