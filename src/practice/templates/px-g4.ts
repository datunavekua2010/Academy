/**
 * Grade IV — pictured templates.
 *
 * Most of Grade IV was words and bare numbers. These templates ask the same
 * kinds of question about something that is drawn: a written column, a bar
 * model, a number pyramid, an array, a balance, bars and tallies, price tags,
 * coins, a number line, clocks, a shape cut into equal parts. Every picture is
 * built from the drawn numbers, so it cannot disagree with the question or the key.
 */
import type { QuestionTemplate, Vars } from './types';
import type { Picture } from '../pictures/types';
import { derived, distinct, fixed, icons, int, interactiveSet, manyRows, num, pick } from './ix-kit';
import { arrayPic, barsPic, clockPic, fractionChoices, groupsPic, linePic, list, modelPic, partsPic, rectPic, sum, tenths } from './ix-kit34';

const P = (topicId: string, unit: string) => interactiveSet(4, topicId, `g4-px-${unit}`);
const COUNT_ICONS = ['apple', 'star', 'ball', 'cookie', 'fish', 'balloon'];
const coinList = { kind: 'list' as const, pick: { values: [5, 10, 20, 50, 5, 10, 20], length: { min: 4, max: 7 } } };
const column = (top: number | string, sign: string, bottom: number | string, result?: number | string): Picture => ({
  kind: 'column',
  top: String(top),
  sign,
  bottom: String(bottom),
  result: result === undefined ? undefined : String(result),
});
const chips = (...items: Array<string | number>): Picture => ({ kind: 'chips', arrows: true, items: items.map((text) => ({ text: String(text) })) });
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const nearest = (n: number, unit: number): number => Math.round(n / unit) * unit;
const notHalf = (n: number, unit: number): boolean => n % unit !== 0 && n % unit !== unit / 2;

/* ------------------------------------------------------------ U01 */
const u01 = P('g4-ricxvebi-sistemebi', 'u01');
const U01: QuestionTemplate[] = [
  u01('u01-patterns-sequences', 'chips-step', 2, {
    prompt: 'იპოვე გამოტოვებული რიცხვი მიმდევრობაში.',
    variables: { a: int(100, 900, { step: 10 }), d: pick(10, 20, 50, 100, 200, 500, 1000), slot: int(1, 3) },
    pictures: (v) => [chips(...[0, 1, 2, 3, 4].map((i) => (i === num(v, 'slot') + 1 ? '?' : num(v, 'a') + i * num(v, 'd'))))],
    answer: (v) => num(v, 'a') + (num(v, 'slot') + 1) * num(v, 'd'),
    explanation: ({ vars }) => `ყოველ ნაბიჯზე ემატება ${vars.d}.`,
  }),
  u01('u01-hundred-chart', 'strip-right', 1, {
    prompt: 'რომელი რიცხვი დგას {a}-ის მარჯვნივ ასეულის ცხრილში?',
    variables: { a: int(11, 98) },
    constraints: [{ test: (v) => num(v, 'a') % 10 !== 0, note: 'არა რიგის ბოლო' }],
    pictures: (v) => [{ kind: 'strip', cells: [{ text: String(num(v, 'a') - 1) }, { text: String(num(v, 'a')), mark: true }, { text: '?', unknown: true }] }],
    answer: (v) => num(v, 'a') + 1,
    explanation: ({ answer }) => `მარჯვნივ არის ${answer}.`,
  }),
  u01('u01-difference-word-problems', 'bars-difference', 1, {
    prompt: 'რამდენით მეტია ვაშლი, ვიდრე მსხალი?',
    variables: { b: int(8, 40), h: int(2, 20), a: derived((v) => num(v, 'b') + num(v, 'h')) },
    pictures: (v) => [barsPic([{ label: 'ვაშლი', size: num(v, 'a'), caption: String(num(v, 'a')) }, { label: 'მსხალი', size: num(v, 'b'), caption: String(num(v, 'b')) }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${vars.h}.`,
  }),
  u01('u01-arithmetic-mean', 'bars-mean', 3, {
    prompt: 'იპოვე სამი რიცხვის საშუალო არითმეტიკული.',
    variables: { m: int(10, 40), p: int(1, 6), q: int(1, 6), a: derived((v) => num(v, 'm') - num(v, 'p')), b: derived((v) => num(v, 'm') + num(v, 'p') - num(v, 'q')), c: derived((v) => num(v, 'm') + num(v, 'q')) },
    pictures: (v) => [barsPic([num(v, 'a'), num(v, 'b'), num(v, 'c')].map((n, i) => ({ label: ['I', 'II', 'III'][i], size: n, caption: String(n) })))],
    answer: (v) => num(v, 'm'),
    explanation: ({ vars }) => `(${vars.a} + ${vars.b} + ${vars.c}) ÷ 3 = ${vars.m}.`,
  }),
];

/* ------------------------------------------------------------ U02 */
const u02 = P('g4-shekreba-gamokleba', 'u02');
const U02: QuestionTemplate[] = [
  u02('u02-addition-million', 'column', 2, {
    prompt: 'შეასრულე შეკრება სვეტად.',
    variables: { a: int(10000, 59999), b: int(10000, 39999) },
    pictures: (v) => [column(num(v, 'a'), '+', num(v, 'b'), '?')],
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u02('u02-subtraction-million', 'column-2', 2, {
    prompt: 'შეასრულე გამოკლება სვეტად.',
    variables: { a: int(50000, 99999), b: int(10000, 49999) },
    pictures: (v) => [column(num(v, 'a'), '−', num(v, 'b'), '?')],
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}.`,
  }),
  u02('u02-fill-table', 'column-missing', 2, {
    prompt: 'რომელი რიცხვი უნდა ეწეროს ❓ ადგილას?',
    variables: { a: int(1000, 9000), b: int(1000, 9000), s: derived((v) => num(v, 'a') + num(v, 'b')) },
    pictures: (v) => [column('?', '+', num(v, 'b'), num(v, 's'))],
    answer: (v) => num(v, 'a'),
    explanation: ({ vars }) => `${vars.s} − ${vars.b} = ${vars.a}.`,
  }),
  u02('u02-number-pyramids', 'pyramid', 2, {
    prompt: 'რიცხვით პირამიდაში ზედა უჯრაში იწერება ქვედა ორი უჯრის ჯამი. რა რიცხვი ეწერება ❓ უჯრაში?',
    variables: { a: int(2, 30), b: int(2, 30), c: int(2, 30) },
    pictures: (v) => [modelPic('?', num(v, 'a') + num(v, 'b'), num(v, 'b') + num(v, 'c')), modelPic(num(v, 'a') + num(v, 'b'), num(v, 'a'), num(v, 'b')), modelPic(num(v, 'b') + num(v, 'c'), num(v, 'b'), num(v, 'c'))],
    answer: (v) => num(v, 'a') + 2 * num(v, 'b') + num(v, 'c'),
    explanation: ({ vars }) => `${Number(vars.a) + Number(vars.b)} + ${Number(vars.b) + Number(vars.c)} = ${Number(vars.a) + 2 * Number(vars.b) + Number(vars.c)}.`,
  }),
  u02('u02-estimate-word-problems', 'line-thousands', 2, {
    prompt: 'დაამრგვალე ორივე რიცხვი უახლოეს ათასეულამდე და იპოვე მიახლოებითი ჯამი.',
    variables: { a: int(1100, 7900), b: int(1100, 7900) },
    constraints: [{ test: (v) => notHalf(num(v, 'a'), 1000) && notHalf(num(v, 'b'), 1000), note: 'არა შუა' }],
    pictures: (v) => [linePic(0, 10000, 1000, num(v, 'a'), num(v, 'b'))],
    answer: (v) => nearest(num(v, 'a'), 1000) + nearest(num(v, 'b'), 1000),
    explanation: ({ vars, answer }) => `${nearest(Number(vars.a), 1000)} + ${nearest(Number(vars.b), 1000)} = ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U03 */
const u03 = P('g4-gamravleba', 'u03');
const U03: QuestionTemplate[] = [
  u03('u03-commutative-arrays', 'array', 1, {
    prompt: 'რამდენი ობიექტია სულ?',
    variables: { r: int(2, 9), c: int(3, 9), i: int(0, 5) },
    pictures: (v) => [arrayPic(num(v, 'r'), num(v, 'c'), COUNT_ICONS[num(v, 'i')]!)],
    answer: (v) => num(v, 'r') * num(v, 'c'),
    explanation: ({ vars }) => `${vars.r} × ${vars.c} = ${Number(vars.r) * Number(vars.c)}.`,
  }),
  u03('u03-commutative-law', 'two-arrays', 2, {
    prompt: 'ორივე განლაგებაში ობიექტები ერთი და იგივეა. რამდენია სულ თითოეულში?',
    variables: { r: int(3, 8), c: int(3, 8) },
    constraints: [distinct('r', 'c')],
    pictures: (v) => [arrayPic(num(v, 'r'), num(v, 'c'), 'sq-blue', `${num(v, 'r')} × ${num(v, 'c')}`), arrayPic(num(v, 'c'), num(v, 'r'), 'sq-orange', `${num(v, 'c')} × ${num(v, 'r')}`)],
    answer: (v) => num(v, 'r') * num(v, 'c'),
    explanation: ({ vars }) => `${vars.r} × ${vars.c} = ${vars.c} × ${vars.r} = ${Number(vars.r) * Number(vars.c)}.`,
  }),
  u03('u03-multiply-same-number', 'square', 2, {
    prompt: 'კვადრატულ განლაგებაში რამდენი კვადრატია?',
    variables: { s: int(3, 9) },
    pictures: (v) => [arrayPic(num(v, 's'), num(v, 's'), 'sq-green')],
    answer: (v) => num(v, 's') * num(v, 's'),
    explanation: ({ vars }) => `${vars.s} × ${vars.s} = ${Number(vars.s) * Number(vars.s)}.`,
  }),
  u03('u03-multiplication-table-12', 'table-cell', 2, {
    prompt: 'რომელი რიცხვი უნდა ეწეროს გამრავლების ცხრილის ❓ უჯრაში?',
    variables: { a: int(6, 12), b: int(6, 10), slot: int(0, 2) },
    pictures: (v) => {
      const a = num(v, 'a');
      const cols = [num(v, 'b'), num(v, 'b') + 1, num(v, 'b') + 2];
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
  u03('u03-pattern-table', 'chips-rule', 2, {
    prompt: 'ცხრილში მეორე რიცხვი პირველზე {k}-ჯერ მეტია. რა რიცხვი უნდა დაიწეროს ❓ ადგილას?',
    variables: { k: int(2, 9), t: int(6, 12) },
    pictures: (v) => [chips(...[1, 2, 3].map((x) => `${x} → ${x * num(v, 'k')}`), `${num(v, 't')} → ?`)],
    answer: (v) => num(v, 'k') * num(v, 't'),
    explanation: ({ vars }) => `${vars.t} × ${vars.k} = ${Number(vars.t) * Number(vars.k)}.`,
  }),
  u03('u03-multiple-factors', 'groups-of-groups', 3, {
    prompt: '{g} ყუთში თითოეულში {r} რიგია, ყოველ რიგში კი {c} ობიექტი. რამდენი ობიექტია ერთ ყუთში?',
    variables: { g: int(2, 4), r: int(2, 5), c: int(2, 6), i: int(0, 5) },
    pictures: (v) => [arrayPic(num(v, 'r'), num(v, 'c'), COUNT_ICONS[num(v, 'i')]!, 'ერთი ყუთი')],
    answer: (v) => num(v, 'r') * num(v, 'c'),
    explanation: ({ vars }) => `${vars.r} × ${vars.c} = ${Number(vars.r) * Number(vars.c)}.`,
  }),
];

/* ------------------------------------------------------------ U04 */
const u04 = P('g4-gayofa', 'u04');
const remainderPic = (k: number, q: number, r: number, icon: string): Picture =>
  manyRows([{ tokens: [...Array.from({ length: q }, () => ({ t: 'group' as const, tokens: icons(icon, k) })), { t: 'sep' as const, style: 'bar' as const }, ...icons(icon, r)] }]);
const U04: QuestionTemplate[] = [
  u04('u04-quotient-and-remainder', 'groups-quotient', 2, {
    prompt: 'ობიექტები დაჯგუფეს {k}-ობით. რამდენი სრული ჯგუფი გამოვიდა? (მარჯვნივ დარჩენილია ჯგუფში შეუსვლელი ობიექტები.)',
    variables: { k: int(3, 5), q: int(2, 4), r: int(1, 2), i: int(0, 5) },
    constraints: [{ test: (v) => num(v, 'r') < num(v, 'k'), note: 'ნაშთი < გამყოფი' }],
    pictures: (v) => [remainderPic(num(v, 'k'), num(v, 'q'), num(v, 'r'), COUNT_ICONS[num(v, 'i')]!)],
    answer: (v) => num(v, 'q'),
    explanation: ({ vars }) => `${Number(vars.q) * Number(vars.k) + Number(vars.r)} ÷ ${vars.k} = ${vars.q} (ნაშთი ${vars.r}).`,
  }),
  u04('u04-long-division-remainder', 'groups-remainder', 2, {
    prompt: 'ობიექტები დაჯგუფეს {k}-ობით. რამდენი ობიექტი დარჩა ჯგუფებს გარეთ — რა არის ნაშთი?',
    variables: { k: int(3, 6), q: int(2, 4), r: int(1, 4), i: int(0, 5) },
    constraints: [{ test: (v) => num(v, 'r') < num(v, 'k'), note: 'ნაშთი < გამყოფი' }],
    pictures: (v) => [remainderPic(num(v, 'k'), num(v, 'q'), num(v, 'r'), COUNT_ICONS[num(v, 'i')]!)],
    answer: (v) => num(v, 'r'),
    explanation: ({ vars }) => `ნაშთი ${vars.r}.`,
  }),
  u04('u04-divide-up-to-12', 'model', 1, {
    prompt: 'მთელი ტოლ ნაწილებადაა გაყოფილი. რა რიცხვი უნდა ეწეროს ❓ ადგილას?',
    variables: { k: int(3, 8), q: int(3, 12), n: derived((v) => num(v, 'k') * num(v, 'q')) },
    pictures: (v) => [modelPic(num(v, 'n'), ...Array.from({ length: num(v, 'k') }, (_, i) => (i === 0 ? '?' : num(v, 'q'))))],
    answer: (v) => num(v, 'q'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.k} = ${vars.q}.`,
  }),
  u04('u04-find-divisor', 'count-groups', 2, {
    prompt: 'ობიექტები {q}-ობით დაჯგუფეს. რამდენ ჯგუფად გაიყო ისინი?',
    variables: { k: int(2, 6), q: int(2, 6), i: int(0, 5) },
    pictures: (v) => [groupsPic(COUNT_ICONS[num(v, 'i')]!, Array.from({ length: num(v, 'k') }, () => num(v, 'q')), '|')],
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${Number(vars.k) * Number(vars.q)} ÷ ${vars.q} = ${vars.k}.`,
  }),
];

/* ------------------------------------------------------------ U05 */
const u05 = P('g4-algebra', 'u05');
const U05: QuestionTemplate[] = [
  u05('u05-evaluate-expression', 'chips', 1, {
    prompt: 'გამოთვალე გამოსახულება მოცემული მნიშვნელობისთვის.',
    variables: { b: int(3, 20), k: int(3, 15) },
    pictures: (v) => [chips(`b = ${num(v, 'b')}`, `b + ${num(v, 'k')} = ?`)],
    answer: (v) => num(v, 'b') + num(v, 'k'),
    explanation: ({ vars }) => `${vars.b} + ${vars.k} = ${Number(vars.b) + Number(vars.k)}.`,
  }),
  u05('u05-evaluate-multiple-values', 'balance', 2, {
    prompt: 'სასწორი წონასწორობაშია. რას უდრის t?',
    variables: { k: int(3, 20), t: int(3, 20), s: derived((v) => num(v, 'k') + num(v, 't')) },
    pictures: (v) => [{ kind: 'balance', left: [{ t: 'text', text: `t + ${num(v, 'k')}` }], right: [{ t: 'text', text: String(num(v, 's')) }], tilt: 'level' }],
    answer: (v) => num(v, 't'),
    explanation: ({ vars }) => `t = ${vars.s} − ${vars.k} = ${vars.t}.`,
  }),
];

/* ------------------------------------------------------------ U06 */
const u06 = P('g4-shedarebiti-amocanebi', 'u06');
const twoRows = (a: number, b: number, icon: string): Picture =>
  manyRows([{ label: 'I', tokens: icons(icon, a) }, { label: 'II', tokens: icons(icon, b) }]);
const U06: QuestionTemplate[] = [
  u06('u06-how-much-more', 'bars', 1, {
    prompt: 'რამდენით მეტია პირველ ყუთში, ვიდრე მეორეში?',
    variables: { b: int(8, 40), h: int(2, 20), a: derived((v) => num(v, 'b') + num(v, 'h')) },
    pictures: (v) => [barsPic([{ label: 'I', size: num(v, 'a'), caption: String(num(v, 'a')) }, { label: 'II', size: num(v, 'b'), caption: String(num(v, 'b')) }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${vars.h}.`,
  }),
  u06('u06-how-much-less', 'bars-2', 1, {
    prompt: 'რამდენით ნაკლებია მეორე ყუთში, ვიდრე პირველში?',
    variables: { b: int(8, 40), h: int(2, 20), a: derived((v) => num(v, 'b') + num(v, 'h')) },
    pictures: (v) => [barsPic([{ label: 'I', size: num(v, 'a'), caption: String(num(v, 'a')) }, { label: 'II', size: num(v, 'b'), caption: String(num(v, 'b')) }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${vars.h}.`,
  }),
  u06('u06-how-many-times-more', 'rows', 2, {
    prompt: 'რამდენჯერ მეტია მეორე რიგში, ვიდრე პირველში?',
    variables: { a: int(2, 4), k: int(2, 4), i: int(0, 5) },
    pictures: (v) => [twoRows(num(v, 'a'), num(v, 'a') * num(v, 'k'), COUNT_ICONS[num(v, 'i')]!)],
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${Number(vars.a) * Number(vars.k)} ÷ ${vars.a} = ${vars.k}.`,
  }),
  u06('u06-how-many-times-less', 'rows-2', 2, {
    prompt: 'რამდენჯერ ნაკლებია პირველ რიგში, ვიდრე მეორეში?',
    variables: { a: int(2, 4), k: int(2, 5), i: int(0, 5) },
    pictures: (v) => [twoRows(num(v, 'a'), num(v, 'a') * num(v, 'k'), COUNT_ICONS[num(v, 'i')]!)],
    answer: (v) => num(v, 'k'),
    explanation: ({ vars }) => `${Number(vars.a) * Number(vars.k)} ÷ ${vars.a} = ${vars.k}.`,
  }),
  u06('u06-compare-quantities', 'bars-times', 2, {
    prompt: 'პირველ კალათაში {n} მსხალია, მეორეში — {k}-ჯერ ნაკლები. რამდენია მეორე კალათაში?',
    variables: { k: int(2, 8), q: int(2, 12), n: derived((v) => num(v, 'k') * num(v, 'q')) },
    pictures: (v) => [barsPic([{ label: 'I', size: num(v, 'n'), caption: String(num(v, 'n')) }, { label: 'II', size: num(v, 'q'), caption: '?' }])],
    answer: (v) => num(v, 'q'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.k} = ${vars.q}.`,
  }),
];

/* ------------------------------------------------------------ U07 */
const u07 = P('g4-mravalsapexuriani-amocanebi', 'u07');
const U07: QuestionTemplate[] = [
  u07('u07-addition-problems', 'model-total', 1, {
    prompt: 'რამდენია სულ?',
    variables: { a: int(120, 480), b: int(120, 480) },
    pictures: (v) => [modelPic('?', num(v, 'a'), num(v, 'b'))],
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u07('u07-mixed-problems', 'chips-chain', 2, {
    prompt: 'მაღაზიაში რვეულები იყო, ზოგი გაიყიდა, ზოგი შემოიტანეს. რამდენი რვეული გახდა ბოლოს?',
    variables: { s: int(200, 400, { step: 10 }), a: int(50, 150, { step: 10 }), b: int(20, 120, { step: 10 }) },
    pictures: (v) => [chips(num(v, 's'), `− ${num(v, 'a')}`, `+ ${num(v, 'b')}`, '?')],
    answer: (v) => num(v, 's') - num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.s} − ${vars.a} + ${vars.b} = ${Number(vars.s) - Number(vars.a) + Number(vars.b)}.`,
  }),
  u07('u07-multiplication-addition', 'groups-plus', 2, {
    prompt: 'სულ რამდენი ობიექტია: {k} ჯგუფი {c}-ობით და კიდევ {e} ცალკე?',
    variables: { k: int(2, 4), c: int(3, 6), e: int(1, 5), i: int(0, 5) },
    pictures: (v) => [manyRows([{ tokens: [...Array.from({ length: num(v, 'k') }, () => ({ t: 'group' as const, tokens: icons(COUNT_ICONS[num(v, 'i')]!, num(v, 'c')) })), { t: 'sep' as const, style: 'bar' as const }, ...icons(COUNT_ICONS[num(v, 'i')]!, num(v, 'e'))] }])],
    answer: (v) => num(v, 'k') * num(v, 'c') + num(v, 'e'),
    explanation: ({ vars }) => `${vars.k} × ${vars.c} + ${vars.e} = ${Number(vars.k) * Number(vars.c) + Number(vars.e)}.`,
  }),
  u07('u07-equalizing-quantities', 'bars-equalize', 2, {
    prompt: 'რამდენი ბურთი უნდა დაამატონ მეორე ყუთს, რომ ორივეში ტოლი იყოს?',
    variables: { b: int(10, 40), h: int(3, 25), a: derived((v) => num(v, 'b') + num(v, 'h')) },
    pictures: (v) => [barsPic([{ label: 'I', size: num(v, 'a'), caption: String(num(v, 'a')) }, { label: 'II', size: num(v, 'b'), caption: String(num(v, 'b')) }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${vars.h}.`,
  }),
  u07('u07-determine-compare', 'bars-times', 3, {
    prompt: 'პირველ ყუთში {n} ბურთია, მეორეში — {k}-ჯერ ნაკლები. რამდენით მეტია პირველში?',
    variables: { k: int(2, 8), q: int(3, 12), n: derived((v) => num(v, 'k') * num(v, 'q')) },
    pictures: (v) => [barsPic([{ label: 'I', size: num(v, 'n'), caption: String(num(v, 'n')) }, { label: 'II', size: num(v, 'q'), caption: String(num(v, 'q')) }])],
    answer: (v) => num(v, 'n') - num(v, 'q'),
    explanation: ({ vars }) => `${vars.n} − ${vars.q} = ${Number(vars.n) - Number(vars.q)}.`,
  }),
  u07('u07-approximate-sums', 'line-round', 2, {
    prompt: 'დაამრგვალე ორივე რიცხვი უახლოეს ათასეულამდე და იპოვე მიახლოებითი ჯამი.',
    variables: { a: int(1100, 7900), b: int(1100, 7900) },
    constraints: [{ test: (v) => notHalf(num(v, 'a'), 1000) && notHalf(num(v, 'b'), 1000), note: 'არა შუა' }],
    pictures: (v) => [linePic(0, 10000, 1000, num(v, 'a'), num(v, 'b'))],
    answer: (v) => nearest(num(v, 'a'), 1000) + nearest(num(v, 'b'), 1000),
    explanation: ({ vars, answer }) => `${nearest(Number(vars.a), 1000)} + ${nearest(Number(vars.b), 1000)} = ${answer}.`,
  }),
  u07('u07-time-intervals', 'two-clocks', 2, {
    prompt: 'პირველი საათი გაკვეთილის დაწყების დროა, მეორე — დასრულების. რამდენი წუთი გრძელდებოდა გაკვეთილი?',
    variables: { h: int(1, 10), a: pick(0, 10, 15), d: pick(30, 35, 40, 45) },
    constraints: [{ test: (v: Vars) => num(v, 'a') + num(v, 'd') < 60, note: 'იგივე საათი' }],
    pictures: (v) => [clockPic(num(v, 'h'), num(v, 'a')), clockPic(num(v, 'h'), num(v, 'a') + num(v, 'd'))],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `${answer} წუთი.`,
  }),
];

/* ------------------------------------------------------------ U08 */
const u08 = P('g4-monacemta-analizi', 'u08');
const U08: QuestionTemplate[] = [
  u08('u08-bar-charts', 'bars-difference', 1, {
    prompt: 'რამდენით მეტი პური გაიყიდა ორშაბათს, ვიდრე სამშაბათს?',
    variables: { b: int(8, 40), h: int(2, 20), a: derived((v) => num(v, 'b') + num(v, 'h')) },
    pictures: (v) => [barsPic([{ label: 'ორშ', size: num(v, 'a'), caption: String(num(v, 'a')) }, { label: 'სამ', size: num(v, 'b'), caption: String(num(v, 'b')) }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${vars.h}.`,
  }),
  u08('u08-reading-tables', 'bars-sum', 2, {
    prompt: 'რამდენი ხილია სულ?',
    variables: { a: int(4, 20), b: int(4, 20), c: int(4, 20) },
    pictures: (v) => [barsPic([{ label: 'ვაშლი', size: num(v, 'a'), caption: String(num(v, 'a')) }, { label: 'ბანანი', size: num(v, 'b'), caption: String(num(v, 'b')) }, { label: 'მსხალი', size: num(v, 'c'), caption: String(num(v, 'c')) }])],
    answer: (v) => num(v, 'a') + num(v, 'b') + num(v, 'c'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} + ${vars.c} = ${Number(vars.a) + Number(vars.b) + Number(vars.c)}.`,
  }),
  u08('u08-reading-charts', 'bars-range', 2, {
    prompt: 'რამდენით მეტია ყველაზე დიდი სვეტი ყველაზე პატარაზე?',
    variables: { a: int(5, 40), b: int(5, 40), c: int(5, 40) },
    constraints: [distinct('a', 'b', 'c')],
    pictures: (v) => [barsPic([{ label: 'ორშ', size: num(v, 'a'), caption: String(num(v, 'a')) }, { label: 'სამ', size: num(v, 'b'), caption: String(num(v, 'b')) }, { label: 'ოთხ', size: num(v, 'c'), caption: String(num(v, 'c')) }])],
    answer: (v) => Math.max(num(v, 'a'), num(v, 'b'), num(v, 'c')) - Math.min(num(v, 'a'), num(v, 'b'), num(v, 'c')),
    explanation: ({ answer }) => `უდიდესი მინუს უმცირესი = ${answer}.`,
  }),
  u08('u08-pictograms', 'total', 2, {
    prompt: 'პიქტოგრამაზე ერთი ★ ნიშნავს 5 წიგნს. რამდენი წიგნია სულ?',
    variables: { x: int(2, 6), y: int(2, 6) },
    pictures: (v) => [manyRows([{ label: 'ზღაპრები', tokens: icons('star', num(v, 'x')) }, { label: 'ენციკლოპედია', tokens: icons('star', num(v, 'y')) }])],
    answer: (v) => 5 * (num(v, 'x') + num(v, 'y')),
    explanation: ({ vars }) => `(${vars.x} + ${vars.y}) × 5 = ${5 * (Number(vars.x) + Number(vars.y))}.`,
  }),
  u08('u08-data-collection', 'tally-total', 1, {
    prompt: 'რამდენი მოსწავლეა სულ?',
    variables: { a: int(4, 14), b: int(4, 12), c: int(3, 10) },
    pictures: (v) => [{ kind: 'tally', rows: [{ label: 'ფეხბურთი', count: num(v, 'a') }, { label: 'კალათბურთი', count: num(v, 'b') }, { label: 'ცურვა', count: num(v, 'c') }] }],
    answer: (v) => num(v, 'a') + num(v, 'b') + num(v, 'c'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} + ${vars.c} = ${Number(vars.a) + Number(vars.b) + Number(vars.c)}.`,
  }),
  u08('u08-frequency-tables', 'tally-difference', 2, {
    prompt: 'რამდენით მეტ მოსწავლეს უყვარს მწვანე, ვიდრე წითელი?',
    variables: { r: int(2, 8), h: int(1, 6), g: derived((v) => num(v, 'r') + num(v, 'h')), y: int(2, 10) },
    pictures: (v) => [{ kind: 'tally', rows: [{ label: 'მწვანე', count: num(v, 'g') }, { label: 'ყვითელი', count: num(v, 'y') }, { label: 'წითელი', count: num(v, 'r') }] }],
    answer: (v) => num(v, 'h'),
    explanation: ({ vars }) => `${vars.g} − ${vars.r} = ${vars.h}.`,
  }),
];

/* ------------------------------------------------------------ U09 */
const u09 = P('g4-finansuri-tsigniereba-fuli', 'u09');
const tags = (...items: Array<{ label?: string; amount: number }>): Picture => ({ kind: 'tags', items });
const U09: QuestionTemplate[] = [
  u09('u09-counting-coins', 'coins-total', 1, {
    prompt: 'რამდენი თეთრია სულ?',
    variables: { c: coinList },
    constraints: [{ test: (v: Vars) => sum(list(v, 'c')) <= 250, note: 'small' }],
    pictures: (v) => [{ kind: 'coins', coins: list(v, 'c') }],
    answer: (v) => sum(list(v, 'c')),
    explanation: ({ answer }) => `მონეტები ერთად: ${answer} თეთრი.`,
  }),
  u09('u09-money-addition', 'tags-sum', 1, {
    prompt: 'რამდენი თეთრი ღირს ორივე ნივთი ერთად?',
    variables: { p: int(15, 95, { step: 5 }), q: int(15, 95, { step: 5 }) },
    pictures: (v) => [tags({ label: 'I', amount: num(v, 'p') }, { label: 'II', amount: num(v, 'q') })],
    answer: (v) => num(v, 'p') + num(v, 'q'),
    explanation: ({ vars }) => `${vars.p} + ${vars.q} = ${Number(vars.p) + Number(vars.q)}.`,
  }),
  u09('u09-unit-price', 'tags-times', 1, {
    prompt: 'ყველა ფანქარი ერთი ფასისაა. რა ღირს ისინი ერთად?',
    variables: { p: int(10, 60, { step: 5 }), k: int(2, 5) },
    pictures: (v) => [tags(...Array.from({ length: num(v, 'k') }, () => ({ amount: num(v, 'p') })))],
    answer: (v) => num(v, 'p') * num(v, 'k'),
    explanation: ({ vars }) => `${vars.k} × ${vars.p} = ${Number(vars.k) * Number(vars.p)}.`,
  }),
  u09('u09-total-cost', 'tags-two-kinds', 2, {
    prompt: 'რვეულები ერთნაირი ფასისაა. რამდენი თეთრი უნდა გადაიხადო რვეულებისა და კალმისთვის ერთად?',
    variables: { p: int(10, 40, { step: 5 }), k: int(2, 4), q: int(15, 60, { step: 5 }) },
    pictures: (v) => [tags(...Array.from({ length: num(v, 'k') }, () => ({ label: 'რვეული', amount: num(v, 'p') })), { label: 'კალამი', amount: num(v, 'q') })],
    answer: (v) => num(v, 'k') * num(v, 'p') + num(v, 'q'),
    explanation: ({ vars }) => `${vars.k} × ${vars.p} + ${vars.q} = ${Number(vars.k) * Number(vars.p) + Number(vars.q)}.`,
  }),
  u09('u09-sufficient-money', 'enough', 2, {
    prompt: 'ეყოფა თუ არა ეს მონეტები ნივთის საყიდლად?',
    variables: { c: coinList, p: int(40, 200, { step: 5 }) },
    constraints: [{ test: (v: Vars) => sum(list(v, 'c')) !== num(v, 'p'), note: 'არა ზუსტად' }],
    pictures: (v) => [{ kind: 'coins', label: 'მონეტები', coins: list(v, 'c') }, tags({ label: 'ფასი', amount: num(v, 'p') })],
    options: fixed('კი', 'არა'),
    optionCount: 2,
    text: true,
    answer: (v) => (sum(list(v, 'c')) >= num(v, 'p') ? 'კი' : 'არა'),
    explanation: ({ vars }) => `მონეტები ერთად ${sum(list(vars as Vars, 'c'))} თეთრია, ფასი — ${vars.p}.`,
  }),
];

/* ------------------------------------------------------------ U10 */
const u10 = P('g4-gazomva', 'u10');
const U10: QuestionTemplate[] = [
  u10('u10-fill-to-target', 'line', 2, {
    prompt: 'რამდენი სანტიმეტრი უნდა დაემატოს წითელ ნიშნულს, რომ მივიღოთ 1 მეტრი?',
    variables: { n: int(11, 94) },
    pictures: (v) => [linePic(0, 100, 10, num(v, 'n'))],
    answer: (v) => 100 - num(v, 'n'),
    explanation: ({ vars }) => `100 − ${vars.n} = ${100 - Number(vars.n)}.`,
  }),
];

/* ------------------------------------------------------------ U11 */
const u11 = P('g4-geometria', 'u11');
const POLY = [
  { icon: 'shape-triangle', name: 'სამკუთხედი', sides: 3 },
  { icon: 'shape-square', name: 'კვადრატი', sides: 4 },
  { icon: 'shape-pentagon', name: 'ხუთკუთხედი', sides: 5 },
  { icon: 'shape-hexagon', name: 'ექვსკუთხედი', sides: 6 },
];
const QUADS = [
  { icon: 'shape-square', name: 'კვადრატი' },
  { icon: 'shape-rectangle', name: 'მართკუთხედი' },
  { icon: 'shape-rhombus', name: 'რომბი' },
];
const SOLIDS = [
  { icon: 'dice', name: 'კუბი' },
  { icon: 'ball', name: 'სფერო' },
  { icon: 'can', name: 'ცილინდრი' },
  { icon: 'box', name: 'პარალელეპიპედი' },
];
const OPEN = ['line-open', 'line-wave', 'line-arc'];
const single = (icon: string): Picture => manyRows([{ tokens: [{ t: 'icon', icon }] }]);
const U11: QuestionTemplate[] = [
  u11('u11-polygons', 'name', 1, {
    prompt: 'რა ჰქვია ამ მრავალკუთხედს?',
    variables: { i: int(0, 3) },
    pictures: (v) => [single(POLY[num(v, 'i')]!.icon)],
    options: () => POLY.map((p) => p.name),
    optionCount: 4,
    text: true,
    answer: (v) => POLY[num(v, 'i')]!.name,
    explanation: ({ answer }) => `ეს არის ${answer}.`,
  }),
  u11('u11-sides-vertices', 'count-sides', 1, {
    prompt: 'რამდენი გვერდი და რამდენი წვერო აქვს ამ ფიგურას? ჩაწერე ერთი რიცხვი — გვერდების რაოდენობა.',
    variables: { i: int(0, 3) },
    pictures: (v) => [single(POLY[num(v, 'i')]!.icon)],
    answer: (v) => POLY[num(v, 'i')]!.sides,
    explanation: ({ answer }) => `${answer} გვერდი და ${answer} წვერო.`,
  }),
  u11('u11-quadrilateral-classification', 'name-2', 2, {
    prompt: 'რომელი ოთხკუთხედია ეს?',
    variables: { i: int(0, 2) },
    pictures: (v) => [single(QUADS[num(v, 'i')]!.icon)],
    options: (v) => [0, 1, 2].map((k) => QUADS[(num(v, 'i') + k) % 3]!.name).concat(['ტრაპეცია']),
    optionCount: 4,
    text: true,
    answer: (v) => QUADS[num(v, 'i')]!.name,
    explanation: ({ answer }) => `ეს არის ${answer}.`,
  }),
  u11('u11-solid-figures', 'name-3', 1, {
    prompt: 'რომელ სივრცულ ფიგურას გავს ეს საგანი?',
    variables: { i: int(0, 3) },
    pictures: (v) => [single(SOLIDS[num(v, 'i')]!.icon)],
    options: () => SOLIDS.map((s) => s.name),
    optionCount: 4,
    text: true,
    answer: (v) => SOLIDS[num(v, 'i')]!.name,
    explanation: ({ answer }) => `ეს არის ${answer}.`,
  }),
  u11('u11-open-closed-lines', 'open-closed', 1, {
    prompt: 'ეს ხაზი დახურულია თუ ღია?',
    variables: { i: int(0, 5) },
    pictures: (v) => [single(num(v, 'i') < 3 ? OPEN[num(v, 'i')]! : POLY[num(v, 'i') - 3]!.icon)],
    options: fixed('დახურული', 'ღია'),
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'i') < 3 ? 'ღია' : 'დახურული'),
    explanation: ({ answer }) => `ხაზი ${answer} არის.`,
  }),
  u11('u11-area', 'rect-area', 2, {
    prompt: 'იპოვე მართკუთხედის ფართობი (კვ. სმ).',
    variables: { w: int(3, 12), h: int(2, 9) },
    constraints: [distinct('w', 'h')],
    pictures: (v) => [rectPic(num(v, 'w'), num(v, 'h'))],
    answer: (v) => num(v, 'w') * num(v, 'h'),
    explanation: ({ vars }) => `${vars.w} × ${vars.h} = ${Number(vars.w) * Number(vars.h)}.`,
  }),
  u11('u11-equal-areas', 'array-area', 2, {
    prompt: 'ერთი კვადრატი 1 კვ. ერთეულია. იპოვე ფიგურის ფართობი.',
    variables: { r: int(3, 8), c: int(3, 10) },
    pictures: (v) => [arrayPic(num(v, 'r'), num(v, 'c'), 'sq-yellow')],
    answer: (v) => num(v, 'r') * num(v, 'c'),
    explanation: ({ vars }) => `${vars.r} × ${vars.c} = ${Number(vars.r) * Number(vars.c)}.`,
  }),
];

/* ------------------------------------------------------------ U12 */
const u12 = P('g4-dro', 'u12');
const U12: QuestionTemplate[] = [
  u12('u12-elapsed-time', 'two-clocks', 2, {
    prompt: 'პირველი საათი დაწყების დროა, მეორე — დასრულების. რამდენი წუთი გავიდა?',
    variables: { h: int(1, 10), a: pick(0, 10, 15, 20), d: pick(15, 20, 25, 30, 35, 40) },
    constraints: [{ test: (v: Vars) => num(v, 'a') + num(v, 'd') < 60, note: 'იგივე საათი' }],
    pictures: (v) => [clockPic(num(v, 'h'), num(v, 'a')), clockPic(num(v, 'h'), num(v, 'a') + num(v, 'd'))],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `${answer} წუთი.`,
  }),
  u12('u12-elapsed-time', 'two-clocks-hours', 2, {
    prompt: 'საათები აჩვენებს დაწყებისა და დასრულების დროს. რამდენი საათი გავიდა?',
    variables: { h: int(1, 8), d: int(2, 4) },
    pictures: (v) => [clockPic(num(v, 'h'), 0), clockPic(num(v, 'h') + num(v, 'd'), 0)],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `${answer} საათი.`,
  }),
  u12('u12-age-problems', 'bars', 1, {
    prompt: 'რამდენი წლით უფროსია ძმა?',
    variables: { a: int(6, 12), h: int(1, 6), b: derived((v) => num(v, 'a') + num(v, 'h')) },
    pictures: (v) => [barsPic([{ label: 'და', size: num(v, 'a'), caption: `${num(v, 'a')} წ.` }, { label: 'ძმა', size: num(v, 'b'), caption: `${num(v, 'b')} წ.` }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ vars }) => `${vars.b} − ${vars.a} = ${vars.h}.`,
  }),
];

/* ------------------------------------------------------------ U13 */
const u13 = P('g4-sichkare-mandzili', 'u13');
const hourMarks = (v: number, t: number) => Array.from({ length: t }, (_, i) => ({ value: v * (i + 1), label: `${i + 1} სთ` }));
const U13: QuestionTemplate[] = [
  u13('u13-distance', 'line-hours', 1, {
    prompt: 'მანქანა ყოველ საათში ერთი და იმავე მანძილს გადის (იხილე ღერძი). რამდენ კილომეტრს გაივლის {t} საათში?',
    variables: { v: pick(20, 30, 40, 50, 60, 80), t: int(4, 8) },
    pictures: (v) => [linePic(0, num(v, 'v') * 3, num(v, 'v'), ...hourMarks(num(v, 'v'), 3))],
    answer: (v) => num(v, 'v') * num(v, 't'),
    explanation: ({ vars }) => `${vars.v} × ${vars.t} = ${Number(vars.v) * Number(vars.t)}.`,
  }),
  u13('u13-speed-time-distance', 'line-hours-2', 2, {
    prompt: 'მანქანა ყოველ საათში ერთსა და იმავე მანძილს გადის. რა მანძილს გაივლის {t} საათში? (ღერძზე პირველი საათებია ნაჩვენები.)',
    variables: { v: pick(15, 25, 35, 45, 55, 65), t: int(4, 6) },
    pictures: (v) => [linePic(0, num(v, 'v') * 3, num(v, 'v'), ...hourMarks(num(v, 'v'), 3))],
    answer: (v) => num(v, 'v') * num(v, 't'),
    explanation: ({ vars }) => `${vars.v} × ${vars.t} = ${Number(vars.v) * Number(vars.t)}.`,
  }),
  u13('u13-duration', 'line-ticks', 2, {
    prompt: 'მანქანა ყოველ საათში {v} კმ-ს გადის. ღერძზე თითო დანაყოფი ერთი საათია. რამდენ საათში მიაღწევს წითელ ნიშნულს?',
    variables: { v: pick(20, 25, 30, 40, 50), t: int(3, 9) },
    pictures: (v) => [linePic(0, num(v, 'v') * num(v, 't'), num(v, 'v'), num(v, 'v') * num(v, 't'))],
    answer: (v) => num(v, 't'),
    explanation: ({ vars }) => `${Number(vars.v) * Number(vars.t)} ÷ ${vars.v} = ${vars.t}.`,
  }),
  u13('u13-speed', 'model', 2, {
    prompt: 'მანქანამ {d} კმ გაიარა {t} საათში ერთნაირი სიჩქარით. რამდენ კილომეტრს გადიოდა ყოველ საათში?',
    variables: { v: int(30, 90, { step: 5 }), t: int(2, 6), d: derived((v) => num(v, 'v') * num(v, 't')) },
    pictures: (v) => [modelPic(num(v, 'd'), ...Array.from({ length: num(v, 't') }, (_, i) => (i === 0 ? '?' : num(v, 'v'))))],
    answer: (v) => num(v, 'v'),
    explanation: ({ vars }) => `${vars.d} ÷ ${vars.t} = ${vars.v}.`,
  }),
];

/* ------------------------------------------------------------ U14 */
const u14 = P('g4-albatoba', 'u14');
const COLOR_ICONS = ['dot-red', 'dot-blue', 'dot-green', 'dot-yellow', 'dot-purple', 'dot-orange', 'dot-black'];
const U14: QuestionTemplate[] = [
  u14('u14-most-likely', 'likelier', 1, {
    prompt: 'ჩანთიდან დაუხედავად იღებენ ერთ ბურთს. რომელი ფერის ბურთის ამოღებაა უფრო სავარაუდო?',
    variables: { a: int(2, 12), b: int(2, 12) },
    constraints: [distinct('a', 'b')],
    pictures: (v) => [manyRows([{ tokens: icons('dot-green', num(v, 'a')) }, { tokens: icons('dot-red', num(v, 'b')) }])],
    options: fixed('მწვანე', 'წითელი'),
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'a') > num(v, 'b') ? 'მწვანე' : 'წითელი'),
    explanation: ({ answer }) => `მეტია ${answer} ბურთი.`,
  }),
  u14('u14-outcomes', 'colors', 1, {
    prompt: 'ჩანთაში სხვადასხვა ფერის ბურთებია. რამდენი განსხვავებული შედეგი აქვს ერთი ბურთის ამოღებას?',
    variables: { n: int(3, 7) },
    pictures: (v) => [manyRows([{ tokens: COLOR_ICONS.slice(0, num(v, 'n')).map((icon) => ({ t: 'icon' as const, icon })) }])],
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} ფერი — ${vars.n} შედეგი.`,
  }),
  u14('u14-combinations', 'shirts-pants', 2, {
    prompt: 'რამდენი განსხვავებული ჩაცმულობის კომბინაცია შეიძლება: ერთი მაისური და ერთი შარვალი?',
    variables: { a: int(2, 5), b: int(2, 4) },
    pictures: (v) => [manyRows([{ label: 'მაისურები', tokens: icons('sq-red', num(v, 'a')) }, { label: 'შარვლები', tokens: icons('sq-blue', num(v, 'b')) }])],
    answer: (v) => num(v, 'a') * num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}.`,
  }),
  u14('u14-probability-changes', 'add-balls', 1, {
    prompt: 'ყუთში ბურთებია (სურათზე). ჩავამატეთ კიდევ {k} წითელი ბურთი. რამდენი ბურთი იქნება ყუთში სულ?',
    variables: { r: int(1, 6), b: int(2, 8), k: int(1, 4) },
    pictures: (v) => [manyRows([{ tokens: [...icons('dot-red', num(v, 'r')), ...icons('dot-blue', num(v, 'b'))] }])],
    answer: (v) => num(v, 'r') + num(v, 'b') + num(v, 'k'),
    explanation: ({ vars }) => `${vars.r} + ${vars.b} + ${vars.k} = ${Number(vars.r) + Number(vars.b) + Number(vars.k)}.`,
  }),
];

/* ------------------------------------------------------------ U15 */
const u15 = P('g4-tsiladebi', 'u15');
const U15: QuestionTemplate[] = [
  u15('u15-parts-of-whole', 'shaded-fraction', 1, {
    prompt: 'მთელის რა ნაწილია შეღებილი?',
    variables: { n: int(3, 12), k: int(1, 11) },
    constraints: [{ test: (v: Vars) => num(v, 'k') < num(v, 'n'), note: 'k<n' }],
    pictures: (v) => [partsPic(num(v, 'n'), num(v, 'k'))],
    options: (v) => fractionChoices(num(v, 'k'), num(v, 'n'))(),
    text: true,
    answer: (v) => `${num(v, 'k')}/${num(v, 'n')}`,
    explanation: ({ answer }) => `${answer}.`,
  }),
  u15('u15-equivalent-fractions-visual', 'two-bars', 2, {
    prompt: 'ორივე ზოლზე ერთი და იგივე ნაწილია შეფერილი. რამდენი ნაწილია შეფერილი მეორე ზოლზე?',
    variables: { n: int(2, 5), k: int(1, 4), f: int(2, 4), n2: derived((v) => num(v, 'n') * num(v, 'f')) },
    constraints: [{ test: (v: Vars) => num(v, 'k') < num(v, 'n'), note: 'k<n' }],
    pictures: (v) => [{ kind: 'parts', bars: [Array.from({ length: num(v, 'n') }, (_, i) => ({ size: 1, shaded: i < num(v, 'k') })), Array.from({ length: num(v, 'n2') }, (_, i) => ({ size: num(v, 'n') / num(v, 'n2'), shaded: i < num(v, 'k') * num(v, 'f') }))] }],
    answer: (v) => num(v, 'k') * num(v, 'f'),
    explanation: ({ vars }) => `${vars.k}/${vars.n} = ${Number(vars.k) * Number(vars.f)}/${vars.n2}.`,
  }),
  u15('u15-equivalent-fractions', 'which-equal', 2, {
    prompt: 'რომელი წილადია შეფერილი ნაწილის ტოლი მეორე ზოლზე? (პირველ ზოლზე {k}/{n} არის შეფერილი.)',
    variables: { n: int(2, 5), k: int(1, 4), f: int(2, 4), n2: derived((v) => num(v, 'n') * num(v, 'f')) },
    constraints: [{ test: (v: Vars) => num(v, 'k') < num(v, 'n'), note: 'k<n' }],
    pictures: (v) => [{ kind: 'parts', bars: [Array.from({ length: num(v, 'n') }, (_, i) => ({ size: 1, shaded: i < num(v, 'k') })), Array.from({ length: num(v, 'n2') }, (_, i) => ({ size: num(v, 'n') / num(v, 'n2'), shaded: i < num(v, 'k') * num(v, 'f') }))] }],
    options: (v) => fractionChoices(num(v, 'k') * num(v, 'f'), num(v, 'n2'))(),
    text: true,
    answer: (v) => `${num(v, 'k') * num(v, 'f')}/${num(v, 'n2')}`,
    explanation: ({ vars }) => `${vars.k}/${vars.n} = ${Number(vars.k) * Number(vars.f)}/${vars.n2}.`,
  }),
  u15('u15-simplifying-fractions', 'simplify', 2, {
    prompt: 'რომელია ამ წილადის უმარტივესი სახე? (შეფერილია {m}/{n} ნაწილი.)',
    variables: { s: pick(1, 2, 3), d: pick(3, 4, 5), f: int(2, 3), n: derived((v) => num(v, 'd') * num(v, 'f')), m: derived((v) => num(v, 's') * num(v, 'f')) },
    constraints: [{ test: (v: Vars) => num(v, 's') < num(v, 'd') && gcd(num(v, 's'), num(v, 'd')) === 1, note: 'უმარტივესი' }],
    pictures: (v) => [partsPic(num(v, 'n'), num(v, 'm'))],
    options: (v) => fractionChoices(num(v, 's'), num(v, 'd'))(),
    text: true,
    answer: (v) => `${num(v, 's')}/${num(v, 'd')}`,
    explanation: ({ vars }) => `${vars.m}/${vars.n} = ${vars.s}/${vars.d}.`,
  }),
  u15('u15-fraction-word-problems', 'two-bars-sum', 2, {
    prompt: 'ორი ბავშვი ტორტის ტოლი ნაწილებიდან შეჭამა ის, რაც შეღებილია. ტორტის რა ნაწილი შეჭამეს ერთად?',
    variables: { n: int(6, 12), a: int(1, 4), b: int(1, 4) },
    constraints: [{ test: (v: Vars) => num(v, 'a') + num(v, 'b') < num(v, 'n'), note: 'ჯამი < მთელი' }],
    pictures: (v) => [{ kind: 'parts', bars: [Array.from({ length: num(v, 'n') }, (_, i) => ({ size: 1, shaded: i < num(v, 'a') })), Array.from({ length: num(v, 'n') }, (_, i) => ({ size: 1, shaded: i < num(v, 'b') }))] }],
    options: (v) => fractionChoices(num(v, 'a') + num(v, 'b'), num(v, 'n'))(),
    text: true,
    answer: (v) => `${num(v, 'a') + num(v, 'b')}/${num(v, 'n')}`,
    explanation: ({ vars }) => `${vars.a}/${vars.n} + ${vars.b}/${vars.n} = ${Number(vars.a) + Number(vars.b)}/${vars.n}.`,
  }),
];

/* ------------------------------------------------------------ U16 */
const u16 = P('g4-atwiladebi', 'u16');
const U16: QuestionTemplate[] = [
  u16('u16-decimal-concept', 'read-bar', 1, {
    prompt: 'რომელი ათწილადია ზოლზე შეფერილი?',
    variables: { k: int(1, 9) },
    constraints: [{ test: (v: Vars) => num(v, 'k') !== 5, note: 'k ≠ 10 − k' }],
    pictures: (v) => [partsPic(10, num(v, 'k'))],
    options: (v) => [...new Set([tenths(num(v, 'k')), tenths(10 - num(v, 'k')), `0,0${num(v, 'k')}`, `${num(v, 'k')},0`])].slice(0, 4),
    text: true,
    answer: (v) => tenths(num(v, 'k')),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u16('u16-decimal-comparison', 'bars-compare', 1, {
    prompt: 'რომელ ზოლზეა შეფერილი უფრო დიდი ათწილადი?',
    variables: { a: int(1, 9), b: int(1, 9) },
    constraints: [distinct('a', 'b')],
    pictures: (v) => [partsPic(10, num(v, 'a')), partsPic(10, num(v, 'b'))],
    options: fixed('პირველზე', 'მეორეზე'),
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'a') > num(v, 'b') ? 'პირველზე' : 'მეორეზე'),
    explanation: ({ vars }) => `${tenths(Number(vars.a))} და ${tenths(Number(vars.b))}.`,
  }),
  u16('u16-decimal-addition', 'bars-sum', 2, {
    prompt: 'ორი ზოლის შეფერილი ნაწილების ჯამი რომელი ათწილადია?',
    variables: { a: int(1, 8), b: int(1, 8) },
    constraints: [{ test: (v: Vars) => num(v, 'a') + num(v, 'b') < 10, note: 'ჯამი < 1' }],
    pictures: (v) => [partsPic(10, num(v, 'a')), partsPic(10, num(v, 'b'))],
    options: (v) => [...new Set([tenths(num(v, 'a') + num(v, 'b')), tenths(num(v, 'a') + num(v, 'b') + 1), tenths(num(v, 'a') + num(v, 'b') + 2), tenths(num(v, 'a') + num(v, 'b') - 1), tenths(Math.abs(num(v, 'a') - num(v, 'b')) + 1)])].slice(0, 4),
    text: true,
    answer: (v) => tenths(num(v, 'a') + num(v, 'b')),
    explanation: ({ answer }) => `${answer}.`,
  }),
];

/* ------------------------------------------------------------ U17 */
const u17 = P('g4-logika', 'u17');
const FRUITS = ['ვაშლი', 'მსხალი', 'ბანანი', 'ფორთოხალი'];
const U17: QuestionTemplate[] = [
  u17('u17-graphs', 'bars-max', 1, {
    prompt: 'რომელი ხილია ყველაზე მეტი?',
    variables: { a: int(4, 24), b: int(4, 24), c: int(4, 24), d: int(4, 24) },
    constraints: [distinct('a', 'b', 'c', 'd')],
    pictures: (v) => [barsPic(['a', 'b', 'c', 'd'].map((k, i) => ({ label: FRUITS[i], size: num(v, k), caption: String(num(v, k)) })))],
    options: () => FRUITS,
    optionCount: 4,
    text: true,
    answer: (v) => FRUITS[['a', 'b', 'c', 'd'].map((k) => num(v, k)).indexOf(Math.max(...['a', 'b', 'c', 'd'].map((k) => num(v, k))))]!,
    explanation: ({ answer }) => `ყველაზე გრძელი სვეტი: ${answer}.`,
  }),
  u17('u17-segment-problems', 'model', 1, {
    prompt: 'გზის სიგრძეა {w} კმ. პირველი მონაკვეთი {a} კმ-ია. რამდენი კილომეტრია დარჩენილი?',
    variables: { a: int(20, 60), b: int(10, 40), w: derived((v) => num(v, 'a') + num(v, 'b')) },
    pictures: (v) => [modelPic(num(v, 'w'), num(v, 'a'), '?')],
    answer: (v) => num(v, 'b'),
    explanation: ({ vars }) => `${vars.w} − ${vars.a} = ${vars.b}.`,
  }),
  u17('u17-finding-differences', 'bars', 1, {
    prompt: 'იპოვე სხვაობა მარცხენა და მარჯვენა რიცხვებს შორის.',
    variables: { b: int(12, 60), h: int(5, 30), a: derived((v) => num(v, 'b') + num(v, 'h')) },
    pictures: (v) => [barsPic([{ size: num(v, 'a'), caption: String(num(v, 'a')) }, { size: num(v, 'b'), caption: String(num(v, 'b')) }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${vars.h}.`,
  }),
  u17('u17-shape-puzzles', 'balance-stars', 2, {
    prompt: 'სასწორი წონასწორობაშია და ყველა ვარსკვლავი ერთნაირია. რამდენია ერთი ★?',
    variables: { k: int(2, 3), s: int(3, 20), n: derived((v) => num(v, 'k') * num(v, 's')) },
    pictures: (v) => [{ kind: 'balance', left: icons('star', num(v, 'k')), right: [{ t: 'text', text: String(num(v, 'n')) }], tilt: 'level' }],
    answer: (v) => num(v, 's'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.k} = ${vars.s}.`,
  }),
  u17('u17-age-problems', 'bars-2', 1, {
    prompt: 'რამდენი წლით უფროსია და?',
    variables: { a: int(6, 12), h: int(2, 8), b: derived((v) => num(v, 'a') + num(v, 'h')) },
    pictures: (v) => [barsPic([{ label: 'ელენე', size: num(v, 'a'), caption: `${num(v, 'a')} წ.` }, { label: 'და', size: num(v, 'b'), caption: `${num(v, 'b')} წ.` }])],
    answer: (v) => num(v, 'h'),
    explanation: ({ vars }) => `${vars.b} − ${vars.a} = ${vars.h}.`,
  }),
];

/* ------------------------------------------------------------ U18 */
const u18 = P('g4-kanonzomierebebi', 'u18');
const U18: QuestionTemplate[] = [
  u18('u18-number-triangles', 'top', 1, {
    prompt: 'სამკუთხედში ზედა რიცხვი ქვედა ორი რიცხვის ჯამია. რა რიცხვი უნდა ეწეროს ❓ ადგილას?',
    variables: { a: int(4, 40), b: int(4, 40) },
    pictures: (v) => [modelPic('?', num(v, 'a'), num(v, 'b'))],
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}.`,
  }),
  u18('u18-number-triangles', 'bottom', 2, {
    prompt: 'სამკუთხედში ზედა რიცხვი ქვედა ორი რიცხვის ჯამია. რა რიცხვი უნდა ეწეროს ❓ ადგილას?',
    variables: { a: int(4, 40), b: int(4, 40), t: derived((v) => num(v, 'a') + num(v, 'b')) },
    pictures: (v) => [modelPic(num(v, 't'), num(v, 'a'), '?')],
    answer: (v) => num(v, 'b'),
    explanation: ({ vars }) => `${vars.t} − ${vars.a} = ${vars.b}.`,
  }),
];

export const G4_PICTURED_TEMPLATES: QuestionTemplate[] = [
  ...U01, ...U02, ...U03, ...U04, ...U05, ...U06, ...U07, ...U08, ...U09, ...U10, ...U11, ...U12, ...U13, ...U14, ...U15, ...U16, ...U17, ...U18,
];
