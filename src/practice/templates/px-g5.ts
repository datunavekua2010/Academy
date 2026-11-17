/**
 * Grade V — pictured templates.
 *
 * Most of Grade V was words and bare numbers. These templates ask about something
 * that is drawn: angles, triangles, quadrilaterals, circles and solids, a
 * coordinate plane, a negative number line, a thermometer, shaded squares for
 * fractions, decimals and percents, bar charts and pie charts. Every picture is
 * built from the same variables as the question and its key, so it cannot disagree.
 */
import type { QuestionTemplate, Vars } from './types';
import { derived, distinct, int, interactiveSet, num, pick, str } from './ix-kit';
import { partsPic, fractionChoices } from './ix-kit34';
import { dec, decOf, gcd, neg, opts4, regularMath } from './ix-kit56';
import {
  anglePic, areaModelPic, circlePic, columnChartPic, crossingPic, cuboidPic, gridPic, hundredPic, lineGraphPic, numberLinePic, parallelogramMath, planePic, piePic,
  polyPic, prismPic, pyramidPic, raysPic, rightTriangleMath, thermometerPic, trapezoidMath, triangleFromSides,
} from '../pictures/draw';

const P = (topicId: string, unit: string) => interactiveSet(5, topicId, `g5-px-${unit}`);
const LABELS = ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ'];
const FRUITS = ['ვაშლი', 'მსხალი', 'ატამი', 'ყურძენი', 'ალუბალი'];

/* ------------------------------------------------------------ U01 */
const u01 = P('g5-numbers-place-value', 'u01');
const U01: QuestionTemplate[] = [
  u01('u01-07', 'neg-line', 1, {
    prompt: 'რომელი რიცხვია წითლად მონიშნული რიცხვით ღერძზე?',
    variables: { k: int(-9, 9) },
    constraints: [{ test: (v) => num(v, 'k') !== 0, note: 'არა ნული' }],
    pictures: (v) => [numberLinePic(-10, 10, 1, (x) => neg(x), [{ value: num(v, 'k') }], 5)],
    options: (v) => opts4(neg(num(v, 'k')), [neg(-num(v, 'k')), neg(num(v, 'k') + 1), neg(num(v, 'k') - 1), neg(num(v, 'k') + 2)]),
    text: true,
    answer: (v) => neg(num(v, 'k')),
    explanation: ({ answer }) => `მონიშნული რიცხვია ${answer}.`,
  }),
  u01('u01-07', 'thermo-read', 1, {
    prompt: 'რამდენ გრადუსს აჩვენებს თერმომეტრი (°C)?',
    variables: { t: int(-14, 14) },
    pictures: (v) => [thermometerPic(num(v, 't'), -15, 15, 5)],
    options: (v) => opts4(neg(num(v, 't')), [neg(-num(v, 't')), neg(num(v, 't') + 5), neg(num(v, 't') - 5), neg(num(v, 't') + 1)]),
    constraints: [{ test: (v) => num(v, 't') !== 0, note: 'არა ნული' }],
    text: true,
    answer: (v) => neg(num(v, 't')),
    explanation: ({ answer }) => `თერმომეტრი ${answer}°C-ს აჩვენებს.`,
  }),
  u01('u01-07', 'neg-compare', 2, {
    prompt: 'ორი წერტილი მონიშნულია რიცხვით ღერძზე: წითელი და ლურჯი. რომელია მეტი?',
    variables: { a: int(-9, 9), b: int(-9, 9) },
    constraints: [distinct('a', 'b')],
    pictures: (v) => [numberLinePic(-10, 10, 1, (x) => neg(x), [{ value: num(v, 'a'), label: 'A' }, { value: num(v, 'b'), label: 'B', color: '#2f7de1' }], 5)],
    options: () => ['A', 'B'],
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'a') > num(v, 'b') ? 'A' : 'B'),
    explanation: () => 'რიცხვითი ღერძის მარჯვენა წერტილი მეტია.',
  }),
];

/* ------------------------------------------------------------ U07 */
const u07 = P('g5-fractions-mixed', 'u07');
const U07: QuestionTemplate[] = [
  u07('u07-01', 'parts', 1, {
    prompt: 'მთელის რა ნაწილია შეღებილი?',
    variables: { n: int(3, 12), k: int(1, 11) },
    constraints: [{ test: (v: Vars) => num(v, 'k') < num(v, 'n'), note: 'k<n' }],
    pictures: (v) => [partsPic(num(v, 'n'), num(v, 'k'))],
    options: (v) => fractionChoices(num(v, 'k'), num(v, 'n'))(),
    text: true,
    answer: (v) => `${num(v, 'k')}/${num(v, 'n')}`,
    explanation: ({ answer }) => `${answer}.`,
  }),
  u07('u07-02', 'two-bars-compare', 2, {
    prompt: 'ორი ერთნაირი ზოლი ერთნაირ ნაწილებადაა დაყოფილი. რომელ ზოლზეა შეღებილი მეტი?',
    variables: { n: int(4, 12), a: int(1, 11), b: int(1, 11) },
    constraints: [{ test: (v: Vars) => num(v, 'a') < num(v, 'n') && num(v, 'b') < num(v, 'n') && num(v, 'a') !== num(v, 'b'), note: 'განსხვავებული' }],
    pictures: (v) => [partsPic(num(v, 'n'), num(v, 'a')), partsPic(num(v, 'n'), num(v, 'b'))],
    options: () => ['პირველზე', 'მეორეზე'],
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'a') > num(v, 'b') ? 'პირველზე' : 'მეორეზე'),
    explanation: ({ vars }) => `${vars.a}/${vars.n} და ${vars.b}/${vars.n}.`,
  }),
  u07('u07-03', 'bars-diff-den', 2, {
    prompt: 'ორი ერთნაირი ზოლი სხვადასხვა რაოდენობის ნაწილებადაა დაყოფილი. რომელ ზოლზეა შეღებილი მეტი?',
    variables: { n: int(2, 6), a: int(1, 5), m: int(3, 9), b: int(1, 8) },
    constraints: [{ test: (v: Vars) => num(v, 'a') < num(v, 'n') && num(v, 'b') < num(v, 'm') && num(v, 'n') !== num(v, 'm') && num(v, 'a') * num(v, 'm') !== num(v, 'b') * num(v, 'n'), note: 'განსხვავებული' }],
    pictures: (v) => [partsPic(num(v, 'n'), num(v, 'a')), partsPic(num(v, 'm'), num(v, 'b'))],
    options: () => ['პირველზე', 'მეორეზე'],
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'a') * num(v, 'm') > num(v, 'b') * num(v, 'n') ? 'პირველზე' : 'მეორეზე'),
    explanation: ({ vars }) => `${vars.a}/${vars.n} და ${vars.b}/${vars.m} შევადაროთ.`,
  }),
  u07('u07-04', 'simplify', 2, {
    prompt: 'რომელია შეფერილი ნაწილის უმარტივესი წილადი?',
    variables: { s: pick(1, 2, 3), d: pick(3, 4, 5), f: int(2, 4), n: derived((v) => num(v, 'd') * num(v, 'f')), m: derived((v) => num(v, 's') * num(v, 'f')) },
    constraints: [{ test: (v: Vars) => num(v, 's') < num(v, 'd') && gcd(num(v, 's'), num(v, 'd')) === 1, note: 'უმარტივესი' }],
    pictures: (v) => [partsPic(num(v, 'n'), num(v, 'm'))],
    options: (v) => fractionChoices(num(v, 's'), num(v, 'd'))(),
    text: true,
    answer: (v) => `${num(v, 's')}/${num(v, 'd')}`,
    explanation: ({ vars }) => `${vars.m}/${vars.n} = ${vars.s}/${vars.d}.`,
  }),
  u07('u07-12', 'line-read', 2, {
    prompt: 'რომელი წილადია მონიშნული რიცხვით ღერძზე?',
    variables: { d: int(3, 10), k: int(1, 9) },
    constraints: [{ test: (v: Vars) => num(v, 'k') < num(v, 'd'), note: 'k<d' }],
    pictures: (v) => [numberLinePic(0, num(v, 'd'), 1, (x) => (x === 0 ? '0' : x === num(v, 'd') ? '1' : `${x}/${num(v, 'd')}`), [{ value: num(v, 'k') }])],
    options: (v) => fractionChoices(num(v, 'k'), num(v, 'd'))(),
    text: true,
    answer: (v) => `${num(v, 'k')}/${num(v, 'd')}`,
    explanation: ({ answer }) => `${answer}.`,
  }),
];

/* ------------------------------------------------------------ U09 */
const u09 = P('g5-multiply-fractions', 'u09');
const U09: QuestionTemplate[] = [
  u09('u09-02', 'area-model', 3, {
    prompt: 'ფართობის მოდელზე ლურჯად {a}/{c} ნაწილია შეღებილი სვეტებით, ყვითლად — {b}/{r} სტრიქონებით. მწვანე გადაფარვა ორი წილადის ნამრავლია. რამდენი უჯრაა მწვანე?',
    variables: { c: int(3, 6), r: int(3, 6), a: int(1, 5), b: int(1, 5) },
    constraints: [{ test: (v: Vars) => num(v, 'a') < num(v, 'c') && num(v, 'b') < num(v, 'r'), note: 'სწორი წილადები' }],
    pictures: (v) => [areaModelPic(num(v, 'c'), num(v, 'a'), num(v, 'r'), num(v, 'b'))],
    answer: (v) => num(v, 'a') * num(v, 'b'),
    explanation: ({ vars }) => `${vars.a}/${vars.c} × ${vars.b}/${vars.r} = ${Number(vars.a) * Number(vars.b)}/${Number(vars.c) * Number(vars.r)}.`,
  }),
  u09('u09-01', 'of-grid', 2, {
    prompt: 'ბადეში {n} უჯრაა. შეღებილია მისი {a}/{d} ნაწილი. რამდენი უჯრაა შეღებილი?',
    variables: { d: pick(2, 3, 4, 5), a: int(1, 4), k: int(2, 5), n: derived((v) => num(v, 'd') * num(v, 'k')) },
    constraints: [{ test: (v: Vars) => num(v, 'a') < num(v, 'd'), note: 'a<d' }],
    pictures: (v) => [gridPic(num(v, 'k'), num(v, 'd'), (_r, c) => c < num(v, 'a'), 26)],
    answer: (v) => num(v, 'a') * num(v, 'k'),
    explanation: ({ vars }) => `${vars.n} ÷ ${vars.d} × ${vars.a} = ${Number(vars.a) * Number(vars.k)}.`,
  }),
];

/* ------------------------------------------------------------ U11–U12 */
const u11 = P('g5-decimals', 'u11');
const u12 = P('g5-percents', 'u12');
const U11: QuestionTemplate[] = [
  u11('u11-01', 'hundred-decimal', 1, {
    prompt: 'ას უჯრიან კვადრატში შეღებილია ნაწილი. რომელი ათწილადია შეღებილი?',
    variables: { p: int(11, 99) },
    constraints: [{ test: (v) => num(v, 'p') % 10 !== 0, note: 'არა მთელი მეათედი' }],
    pictures: (v) => [hundredPic(num(v, 'p'))],
    options: (v) => opts4(decOf(num(v, 'p'), 2), [decOf(num(v, 'p') < 10 ? num(v, 'p') * 10 : Math.floor(num(v, 'p') / 10), 1), decOf(100 - num(v, 'p'), 2), decOf(num(v, 'p') + 10, 2), decOf(num(v, 'p') + 1, 2)]),
    text: true,
    answer: (v) => decOf(num(v, 'p'), 2),
    explanation: ({ answer, vars }) => `${vars.p} უჯრა ას უჯრიდან = ${answer}.`,
  }),
  u11('u11-02', 'hundred-compare', 2, {
    prompt: 'ორ კვადრატზე ცალკე ასი უჯრიდან შეღებილია ნაწილი. რომელია მეტი შეღებილი?',
    variables: { a: int(5, 95), b: int(5, 95) },
    constraints: [distinct('a', 'b')],
    pictures: (v) => [hundredPic(num(v, 'a')), hundredPic(num(v, 'b'))],
    options: () => ['პირველზე', 'მეორეზე'],
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'a') > num(v, 'b') ? 'პირველზე' : 'მეორეზე'),
    explanation: ({ vars }) => `${decOf(Number(vars.a), 2)} და ${decOf(Number(vars.b), 2)}.`,
  }),
  u11('u11-04', 'line-read', 1, {
    prompt: 'რომელი ათწილადია მონიშნული რიცხვით ღერძზე?',
    variables: { a: int(0, 3), t: int(1, 9) },
    pictures: (v) => [numberLinePic(num(v, 'a'), num(v, 'a') + 1, 0.1, (x) => dec(x, 1), [{ value: num(v, 'a') + num(v, 't') / 10 }], 5)],
    options: (v) => opts4(decOf(num(v, 'a') * 10 + num(v, 't'), 1), [decOf(num(v, 'a') * 10 + 10 - num(v, 't'), 1), decOf(num(v, 'a') * 10 + num(v, 't') + 1, 1), decOf(num(v, 'a') * 10 + num(v, 't') - 1, 1)]),
    text: true,
    constraints: [{ test: (v: Vars) => num(v, 't') !== 5, note: 'არა შუა' }],
    answer: (v) => decOf(num(v, 'a') * 10 + num(v, 't'), 1),
    explanation: ({ answer }) => `მონიშნული რიცხვია ${answer}.`,
  }),
];
const U12: QuestionTemplate[] = [
  u12('u12-04', 'hundred-percent', 1, {
    prompt: 'ას უჯრიან კვადრატში შეღებილი ნაწილი რამდენი პროცენტია?',
    variables: { p: int(1, 99) },
    pictures: (v) => [hundredPic(num(v, 'p'))],
    answer: (v) => num(v, 'p'),
    explanation: ({ vars }) => `${vars.p} უჯრა ასიდან = ${vars.p}%.`,
  }),
  u12('u12-05', 'hundred-unshaded', 2, {
    prompt: 'ას უჯრიან კვადრატში რამდენი პროცენტი არ არის შეღებილი?',
    variables: { p: int(1, 99) },
    pictures: (v) => [hundredPic(num(v, 'p'))],
    answer: (v) => 100 - num(v, 'p'),
    explanation: ({ vars }) => `100 − ${vars.p} = ${100 - Number(vars.p)}.`,
  }),
  u12('u12-07', 'pie-percent', 2, {
    prompt: 'წრიულ დიაგრამაზე A ნაწილი {pa}%-ია, B — {pb}%. რამდენი პროცენტია C?',
    variables: { a: int(1, 8, { step: 1 }), b: int(1, 8), pa: derived((v) => num(v, 'a') * 5), pb: derived((v) => num(v, 'b') * 5) },
    constraints: [{ test: (v: Vars) => num(v, 'pa') + num(v, 'pb') < 100, note: 'ჯამი < 100' }],
    pictures: (v) => [piePic([{ label: 'A', value: num(v, 'pa') }, { label: 'B', value: num(v, 'pb') }, { label: 'C', value: 100 - num(v, 'pa') - num(v, 'pb') }], { showValue: false })],
    answer: (v) => 100 - num(v, 'pa') - num(v, 'pb'),
    explanation: ({ vars }) => `100 − ${vars.pa} − ${vars.pb}.`,
  }),
];
void str;

/* ------------------------------------------------------------ U14 */
const u14 = P('g5-coordinate-plane', 'u14');
const BOX = { xmin: 0, xmax: 8, ymin: 0, ymax: 8, cell: 28 };
const U14: QuestionTemplate[] = [
  u14('u14-03', 'read-point', 1, {
    prompt: 'რა კოორდინატები აქვს A წერტილს?',
    variables: { x: int(1, 8), y: int(1, 8) },
    constraints: [{ test: (v: Vars) => num(v, 'x') !== num(v, 'y'), note: 'x≠y' }],
    pictures: (v) => [planePic({ ...BOX, points: [{ x: num(v, 'x'), y: num(v, 'y'), label: 'A' }] })],
    options: (v) => opts4(`(${num(v, 'x')}; ${num(v, 'y')})`, [`(${num(v, 'y')}; ${num(v, 'x')})`, `(${num(v, 'x')}; ${Math.max(0, num(v, 'y') - 1)})`, `(${Math.min(8, num(v, 'x') + 1)}; ${num(v, 'y')})`, `(${num(v, 'x')}; ${Math.min(8, num(v, 'y') + 2)})`]),
    text: true,
    answer: (v) => `(${num(v, 'x')}; ${num(v, 'y')})`,
    explanation: ({ answer }) => `A${answer}: ჯერ x, შემდეგ y.`,
  }),
  u14('u14-03', 'abscissa', 1, {
    prompt: 'რა არის A წერტილის {which}?',
    variables: { x: int(1, 8), y: int(1, 8), w: pick(0, 1), which: derived((v) => (num(v, 'w') === 0 ? 'აბსცისა (x)' : 'ორდინატა (y)')) },
    constraints: [{ test: (v: Vars) => num(v, 'x') !== num(v, 'y'), note: 'x≠y' }],
    pictures: (v) => [planePic({ ...BOX, points: [{ x: num(v, 'x'), y: num(v, 'y'), label: 'A' }] })],
    answer: (v) => (num(v, 'w') === 0 ? num(v, 'x') : num(v, 'y')),
    explanation: ({ vars }) => `A(${vars.x}; ${vars.y}).`,
  }),
  u14('u14-02', 'segment-length', 2, {
    prompt: 'რამდენი ერთეულია AB მონაკვეთის სიგრძე?',
    variables: { x: int(0, 4), y: int(0, 8), d: int(2, 4), horizontal: pick(0, 1) },
    constraints: [{ test: (v: Vars) => (num(v, 'horizontal') === 0 ? num(v, 'x') + num(v, 'd') <= 8 : num(v, 'y') + num(v, 'd') <= 8), note: 'ბადეში' }],
    pictures: (v) => {
      const a = { x: num(v, 'x'), y: num(v, 'y'), label: 'A' };
      const b = num(v, 'horizontal') === 0 ? { x: num(v, 'x') + num(v, 'd'), y: num(v, 'y'), label: 'B' } : { x: num(v, 'x'), y: num(v, 'y') + num(v, 'd'), label: 'B' };
      return [planePic({ ...BOX, points: [a, b], segments: [[[a.x, a.y], [b.x, b.y]]] })];
    },
    answer: (v) => num(v, 'd'),
    explanation: ({ vars }) => `მონაკვეთი ${vars.d} ერთეულია.`,
  }),
  u14('u14-04', 'rect-area', 3, {
    prompt: 'ბადეზე მართკუთხედია გამოსახული. რამდენი კვადრატული ერთეულია მისი ფართობი?',
    variables: { x1: int(0, 3), x2: int(4, 8), y1: int(0, 3), y2: int(4, 8) },
    pictures: (v) => [planePic({ ...BOX, polygon: [[num(v, 'x1'), num(v, 'y1')], [num(v, 'x2'), num(v, 'y1')], [num(v, 'x2'), num(v, 'y2')], [num(v, 'x1'), num(v, 'y2')]] })],
    answer: (v) => (num(v, 'x2') - num(v, 'x1')) * (num(v, 'y2') - num(v, 'y1')),
    explanation: ({ vars }) => `${Number(vars.x2) - Number(vars.x1)} × ${Number(vars.y2) - Number(vars.y1)}.`,
  }),
  u14('u14-05', 'move', 2, {
    prompt: 'A წერტილი წყვეტილი ისრით B-ში გადავიდა. რამდენი ერთეულით გადაადგილდა ის {dir}?',
    variables: { x: int(0, 4), y: int(0, 4), dx: int(1, 4), dy: int(1, 4), w: pick(0, 1), dir: derived((v) => (num(v, 'w') === 0 ? 'მარჯვნივ' : 'ზემოთ')) },
    pictures: (v) => [
      planePic({ ...BOX, points: [{ x: num(v, 'x'), y: num(v, 'y'), label: 'A' }, { x: num(v, 'x') + num(v, 'dx'), y: num(v, 'y') + num(v, 'dy'), label: 'B' }], dashed: [[[num(v, 'x'), num(v, 'y')], [num(v, 'x') + num(v, 'dx'), num(v, 'y')]], [[num(v, 'x') + num(v, 'dx'), num(v, 'y')], [num(v, 'x') + num(v, 'dx'), num(v, 'y') + num(v, 'dy')]]] }),
    ],
    answer: (v) => (num(v, 'w') === 0 ? num(v, 'dx') : num(v, 'dy')),
    explanation: ({ vars }) => `B(${Number(vars.x) + Number(vars.dx)}; ${Number(vars.y) + Number(vars.dy)}).`,
  }),
];

/* ------------------------------------------------------------ U15 */
const u15 = P('g5-geometry', 'u15');
/** A triangle with the given angles at its base vertices A and B (degrees). */
export const triangleFromAngles = (a: number, b: number): Array<[number, number]> => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const c = 180 - a - b;
  const base = Math.sin(rad(c));
  const side = Math.sin(rad(b));
  return [[0, 0], [base, 0], [side * Math.cos(rad(a)), side * Math.sin(rad(a))]];
};
const kind3 = (d: number): string => (d < 90 ? 'მახვილი' : d === 90 ? 'მართი' : 'ბლაგვი');
const U15: QuestionTemplate[] = [
  u15('u15-01', 'angle-kind', 1, {
    prompt: 'რა სახის კუთხეა გამოსახული?',
    variables: { d: pick(25, 35, 45, 60, 75, 90, 90, 100, 115, 135, 150, 165) },
    pictures: (v) => [anglePic(num(v, 'd'), '?')],
    options: () => ['მახვილი', 'მართი', 'ბლაგვი'],
    optionCount: 3,
    text: true,
    answer: (v) => kind3(num(v, 'd')),
    explanation: ({ answer }) => `კუთხე ${answer}ა.`,
  }),
  u15('u15-03', 'angle-sum-rays', 2, {
    prompt: 'ერთი წვეროდან გამოსულმა სხივებმა განზე გაშლილი (180°) კუთხე ორად გაჰყვეს. ერთი კუთხეა {a}°. რამდენია მეორე?',
    variables: { k: int(2, 16), a: derived((v) => num(v, 'k') * 10) },
    constraints: [{ test: (v: Vars) => num(v, 'k') !== 9, note: 'არა მართი' }],
    pictures: (v) => [raysPic([0, num(v, 'a'), 180], [{ from: 0, to: num(v, 'a'), label: `${num(v, 'a')}°` }, { from: num(v, 'a'), to: 180, label: '?', color: '#2f7de1' }])],
    answer: (v) => 180 - num(v, 'a'),
    explanation: ({ vars }) => `180° − ${vars.a}° = ${180 - Number(vars.a)}°.`,
  }),
  u15('u15-03', 'right-split', 1, {
    prompt: 'მართი კუთხე ორად გაიყო. ერთი ნაწილია {a}°. რამდენია მეორე ნაწილი?',
    variables: { k: int(1, 8), a: derived((v) => num(v, 'k') * 10) },
    pictures: (v) => [raysPic([0, num(v, 'a'), 90], [{ from: 0, to: num(v, 'a'), label: `${num(v, 'a')}°` }, { from: num(v, 'a'), to: 90, label: '?', color: '#2f7de1' }], 0)],
    answer: (v) => 90 - num(v, 'a'),
    explanation: ({ vars }) => `90° − ${vars.a}° = ${90 - Number(vars.a)}°.`,
  }),
  u15('u15-09', 'crossing', 2, {
    prompt: 'ორი წრფე იკვეთება. ერთი კუთხეა {a}°. რამდენია {which} კუთხე?',
    variables: { k: int(2, 16), a: derived((v) => num(v, 'k') * 10), w: pick(0, 1), which: derived((v) => (num(v, 'w') === 0 ? 'მისი ვერტიკალური (მოპირდაპირე)' : 'მისი მომიჯნავე')) },
    constraints: [{ test: (v: Vars) => num(v, 'k') !== 9, note: 'არა მართი' }],
    pictures: (v) => [crossingPic(num(v, 'a'), [`${num(v, 'a')}°`, num(v, 'w') === 0 ? '' : '?', num(v, 'w') === 0 ? '?' : '', ''])],
    answer: (v) => (num(v, 'w') === 0 ? num(v, 'a') : 180 - num(v, 'a')),
    explanation: ({ vars }) => `ვერტიკალური კუთხეები ტოლია, მომიჯნავეთა ჯამი 180°. (${vars.a}°)`,
  }),
  u15('u15-04', 'triangle-type', 2, {
    prompt: 'სამკუთხედის გვერდების სიგრძეა {a}, {b} და {c} სმ. როგორია ეს სამკუთხედი?',
    variables: { a: int(3, 9), k: int(0, 2), b: derived((v) => [num(v, 'a'), num(v, 'a') + 1, num(v, 'a')][num(v, 'k')]!), c: derived((v) => [num(v, 'a'), num(v, 'a') + 2, num(v, 'a') + 1][num(v, 'k')]!) },
    constraints: [{ test: (v: Vars) => num(v, 'a') + num(v, 'b') > num(v, 'c') && num(v, 'a') + num(v, 'c') > num(v, 'b'), note: 'სამკუთხედის უტოლობა' }],
    pictures: (v) => [polyPic(triangleFromSides(num(v, 'a'), num(v, 'b'), num(v, 'c')), { sides: [`${num(v, 'c')}`, `${num(v, 'a')}`, `${num(v, 'b')}`] })],
    options: () => ['ტოლგვერდა', 'ტოლფერდა', 'სხვადასხვაგვერდა'],
    optionCount: 3,
    text: true,
    answer: (v) => (num(v, 'a') === num(v, 'b') && num(v, 'b') === num(v, 'c') ? 'ტოლგვერდა' : num(v, 'a') === num(v, 'b') || num(v, 'b') === num(v, 'c') || num(v, 'a') === num(v, 'c') ? 'ტოლფერდა' : 'სხვადასხვაგვერდა'),
    explanation: () => 'შეადარე გვერდები: სამი ტოლი — ტოლგვერდა, ორი ტოლი — ტოლფერდა.',
  }),
  u15('u15-04', 'triangle-angle', 2, {
    prompt: 'სამკუთხედის ორი კუთხეა {a}° და {b}°. რამდენია მესამე კუთხე?',
    variables: { a: int(30, 90, { step: 5 }), b: int(30, 80, { step: 5 }) },
    constraints: [{ test: (v: Vars) => num(v, 'a') + num(v, 'b') < 170, note: 'მესამე დადებითია' }],
    pictures: (v) => [polyPic(triangleFromAngles(num(v, 'a'), num(v, 'b')), { angles: [`${num(v, 'a')}°`, `${num(v, 'b')}°`, '?'] })],
    answer: (v) => 180 - num(v, 'a') - num(v, 'b'),
    explanation: ({ vars }) => `180° − ${vars.a}° − ${vars.b}° = ${180 - Number(vars.a) - Number(vars.b)}°.`,
  }),
  u15('u15-05', 'quad-name', 2, {
    prompt: 'აირჩიე ყველაზე ზუსტი სახელი ამ ოთხკუთხედისთვის.',
    variables: { k: int(0, 3), w: int(5, 8), h: int(3, 4) },
    pictures: (v) => [polyPic([[[0, 0], [num(v, 'w'), 0], [num(v, 'w'), num(v, 'h')], [0, num(v, 'h')]], parallelogramMath(num(v, 'w'), num(v, 'h'), 2), [[0, 0], [4, 0], [4, 4], [0, 4]], trapezoidMath(num(v, 'w') + 2, 3, num(v, 'h'))][num(v, 'k')] as Array<[number, number]>)],
    options: () => ['მართკუთხედი', 'პარალელოგრამი', 'კვადრატი', 'ტრაპეცია'],
    text: true,
    answer: (v) => ['მართკუთხედი', 'პარალელოგრამი', 'კვადრატი', 'ტრაპეცია'][num(v, 'k')]!,
    explanation: ({ answer }) => `ეს ${answer}ა.`,
  }),
  u15('u15-05', 'quad-fourth', 2, {
    prompt: 'ოთხკუთხედის სამი კუთხეა {a}°, {b}° და {c}°. რამდენია მეოთხე კუთხე? (ნახაზი მასშტაბის გარეშეა.)',
    variables: { a: int(60, 120, { step: 5 }), b: int(60, 120, { step: 5 }), c: int(60, 120, { step: 5 }) },
    constraints: [{ test: (v: Vars) => 360 - num(v, 'a') - num(v, 'b') - num(v, 'c') > 20, note: 'მეოთხე დადებითია' }],
    pictures: (v) => [polyPic(parallelogramMath(6, 4, 2).map(([x, y], i) => (i === 3 ? [x - 0.4, y] : [x, y]) as [number, number]), { angles: [`${num(v, 'a')}°`, `${num(v, 'b')}°`, `${num(v, 'c')}°`, '?'] })],
    answer: (v) => 360 - num(v, 'a') - num(v, 'b') - num(v, 'c'),
    explanation: ({ answer }) => `360° − ... = ${answer}°.`,
  }),
  u15('u15-06', 'polygon-sides', 1, {
    prompt: 'რამდენი გვერდი აქვს ამ მრავალკუთხედს?',
    variables: { n: int(3, 10) },
    pictures: (v) => [polyPic(regularMath(num(v, 'n')), { width: 200, height: 170 })],
    answer: (v) => num(v, 'n'),
    explanation: ({ vars }) => `${vars.n} გვერდი და ${vars.n} წვერო.`,
  }),
  u15('u15-07', 'solid-count', 3, {
    prompt: 'რამდენი {what} აქვს ამ სხეულს?',
    variables: { n: int(3, 8), solid: pick(0, 1), w: int(0, 2), what: derived((v) => ['წახნაგი', 'კიდე', 'წვერო'][num(v, 'w')]!) },
    pictures: (v) => [num(v, 'solid') === 0 ? prismPic(num(v, 'n')) : pyramidPic(num(v, 'n'))],
    answer: (v) => {
      const n = num(v, 'n');
      const prism = [n + 2, 3 * n, 2 * n];
      const pyramid = [n + 1, 2 * n, n + 1];
      return (num(v, 'solid') === 0 ? prism : pyramid)[num(v, 'w')]!;
    },
    explanation: ({ vars }) => `${vars.n}-კუთხა ${Number(vars.solid) === 0 ? 'პრიზმის' : 'პირამიდის'} ${vars.what}ების რაოდენობა ითვლება ნახაზზე.`,
  }),
  u15('u15-12', 'rect-perimeter', 1, {
    prompt: 'იპოვე მართკუთხედის პერიმეტრი (სმ).',
    variables: { a: int(3, 15), b: int(2, 12) },
    constraints: [{ test: (v: Vars) => num(v, 'a') !== num(v, 'b'), note: 'არა კვადრატი' }],
    pictures: (v) => [polyPic([[0, 0], [num(v, 'a'), 0], [num(v, 'a'), num(v, 'b')], [0, num(v, 'b')]], { sides: [`${num(v, 'a')} სმ`, `${num(v, 'b')} სმ`, undefined, undefined], right: [0, 1, 2, 3] })],
    answer: (v) => 2 * (num(v, 'a') + num(v, 'b')),
    explanation: ({ vars }) => `2 × (${vars.a} + ${vars.b}).`,
  }),
  u15('u15-13', 'rect-area', 1, {
    prompt: 'იპოვე მართკუთხედის ფართობი (სმ²).',
    variables: { a: int(3, 15), b: int(2, 12) },
    constraints: [{ test: (v: Vars) => num(v, 'a') !== num(v, 'b'), note: 'არა კვადრატი' }],
    pictures: (v) => [polyPic([[0, 0], [num(v, 'a'), 0], [num(v, 'a'), num(v, 'b')], [0, num(v, 'b')]], { sides: [`${num(v, 'a')} სმ`, `${num(v, 'b')} სმ`, undefined, undefined], right: [0, 1, 2, 3] })],
    answer: (v) => num(v, 'a') * num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} × ${vars.b}.`,
  }),
  u15('u15-14', 'right-triangle-area', 2, {
    prompt: 'იპოვე მართკუთხა სამკუთხედის ფართობი (სმ²).',
    variables: { a: int(3, 14), b: int(2, 12) },
    constraints: [{ test: (v: Vars) => (num(v, 'a') * num(v, 'b')) % 2 === 0 && num(v, 'a') !== num(v, 'b'), note: 'ფართობი მთელია' }],
    pictures: (v) => [polyPic(rightTriangleMath(num(v, 'a'), num(v, 'b')), { sides: [`${num(v, 'a')} სმ`, undefined, `${num(v, 'b')} სმ`], right: [0] })],
    answer: (v) => (num(v, 'a') * num(v, 'b')) / 2,
    explanation: ({ vars }) => `${vars.a} × ${vars.b} ÷ 2.`,
  }),
  u15('u15-15', 'l-shape', 3, {
    prompt: 'იპოვე ამ L-ფორმის ფიგურის ფართობი (სმ²).',
    variables: { a: int(6, 12), b: int(6, 10), c: int(2, 4), d: int(2, 4) },
    pictures: (v) => {
      const [a, b, c, d] = [num(v, 'a'), num(v, 'b'), num(v, 'c'), num(v, 'd')];
      return [polyPic([[0, 0], [a, 0], [a, d], [c, d], [c, b], [0, b]], { sides: [`${a}`, `${d}`, `${a - c}`, `${b - d}`, `${c}`, `${b}`], width: 280, height: 190 })];
    },
    answer: (v) => num(v, 'a') * num(v, 'b') - (num(v, 'a') - num(v, 'c')) * (num(v, 'b') - num(v, 'd')),
    explanation: ({ vars }) => `დიდი მართკუთხედი ${Number(vars.a) * Number(vars.b)} მინუს ამოჭრილი ${(Number(vars.a) - Number(vars.c)) * (Number(vars.b) - Number(vars.d))}.`,
  }),
  u15('u15-10', 'diameter', 1, {
    prompt: 'წრეწირის რადიუსია {r} სმ. რამდენია დიამეტრი?',
    variables: { r: int(2, 19) },
    pictures: (v) => [circlePic({ radius: `${num(v, 'r')} სმ` })],
    answer: (v) => 2 * num(v, 'r'),
    explanation: ({ vars }) => `2 × ${vars.r}.`,
  }),
];

/* ------------------------------------------------------------ U16 */
const u16 = P('g5-algebra-powers', 'u16');
const U16: QuestionTemplate[] = [
  u16('u16-04', 'square-grid', 1, {
    prompt: 'კვადრატი {n} × {n} უჯრისგან შედგება. რამდენი უჯრაა მასში სულ?',
    variables: { n: int(3, 10) },
    pictures: (v) => [gridPic(num(v, 'n'), num(v, 'n'), () => true, num(v, 'n') > 7 ? 20 : 26)],
    answer: (v) => num(v, 'n') * num(v, 'n'),
    explanation: ({ vars }) => `${vars.n}² = ${Number(vars.n) ** 2}.`,
  }),
];

/* ------------------------------------------------------------ U17 */
const u17 = P('g5-data-chance', 'u17');
const U17: QuestionTemplate[] = [
  u17('u17-05', 'bar-read', 1, {
    prompt: 'რამდენი {what} გაიყიდა {day}?',
    variables: { a: int(1, 9), b: int(1, 9), c: int(1, 9), d: int(1, 9), i: int(0, 3), what: pick('ნაყინი', 'წიგნი', 'ბილეთი'), day: derived((v) => LABELS[num(v, 'i')]!) },
    pictures: (v) => [columnChartPic([num(v, 'a'), num(v, 'b'), num(v, 'c'), num(v, 'd')].map((value, i) => ({ label: LABELS[i]!, value })), 10, 2)],
    answer: (v) => [num(v, 'a'), num(v, 'b'), num(v, 'c'), num(v, 'd')][num(v, 'i')]!,
    explanation: ({ answer }) => `სვეტის სიმაღლე ${answer}-ია.`,
  }),
  u17('u17-05', 'bar-diff', 2, {
    prompt: 'რამდენით მეტია პირველი სვეტი მეორეზე?',
    variables: { x: int(3, 10), y: int(1, 8) },
    constraints: [{ test: (v: Vars) => num(v, 'x') > num(v, 'y'), note: 'x>y' }],
    pictures: (v) => [columnChartPic([{ label: 'I', value: num(v, 'x') }, { label: 'II', value: num(v, 'y') }], 10, 2, { values: false })],
    answer: (v) => num(v, 'x') - num(v, 'y'),
    explanation: ({ vars }) => `${vars.x} − ${vars.y}.`,
  }),
  u17('u17-03', 'bar-total', 2, {
    prompt: 'რამდენია A, B და C სვეტების მნიშვნელობათა ჯამი?',
    variables: { x: int(1, 9), y: int(1, 9), z: int(1, 9) },
    pictures: (v) => [columnChartPic([{ label: 'A', value: num(v, 'x') }, { label: 'B', value: num(v, 'y') }, { label: 'C', value: num(v, 'z') }], 10, 2)],
    answer: (v) => num(v, 'x') + num(v, 'y') + num(v, 'z'),
    explanation: ({ vars }) => `${vars.x} + ${vars.y} + ${vars.z}.`,
  }),
  u17('u17-04', 'pie-half', 2, {
    prompt: 'წრიულ დიაგრამაზე ყველაზე დიდი სექტორი რომელი ხილია?',
    variables: { a: int(1, 5), b: int(1, 5), c: int(1, 5), f: int(0, 2) },
    constraints: [{ test: (v: Vars) => new Set([num(v, 'a'), num(v, 'b'), num(v, 'c')]).size === 3, note: 'განსხვავებული' }],
    pictures: (v) => [piePic([num(v, 'a'), num(v, 'b'), num(v, 'c')].map((value, i) => ({ label: FRUITS[(i + num(v, 'f')) % 5]!, value })))],
    options: (v) => [0, 1, 2].map((i) => FRUITS[(i + num(v, 'f')) % 5]!),
    optionCount: 3,
    text: true,
    answer: (v) => FRUITS[([num(v, 'a'), num(v, 'b'), num(v, 'c')].indexOf(Math.max(num(v, 'a'), num(v, 'b'), num(v, 'c'))) + num(v, 'f')) % 5]!,
    explanation: ({ answer }) => `ყველაზე დიდი სექტორია: ${answer}.`,
  }),
  u17('u17-02', 'line-change', 2, {
    prompt: 'გრაფიკზე რამდენით გაიზარდა მნიშვნელობა პირველი წერტილიდან მეორემდე?',
    variables: { a: int(1, 5), b: int(6, 10), c: int(1, 10) },
    pictures: (v) => [lineGraphPic([{ label: '1', value: num(v, 'a') }, { label: '2', value: num(v, 'b') }, { label: '3', value: num(v, 'c') }], 10, 2, { values: false })],
    answer: (v) => num(v, 'b') - num(v, 'a'),
    explanation: ({ vars }) => `${vars.b} − ${vars.a}.`,
  }),
];

/* ------------------------------------------------------------ U13 */
const u13 = P('g5-measurement-scale', 'u13');
const U13: QuestionTemplate[] = [
  u13('u13-02', 'cuboid-volume', 3, {
    prompt: 'იპოვე ყუთის მოცულობა (სმ³).',
    variables: { l: int(2, 8), w: int(2, 6), h: int(2, 6) },
    pictures: (v) => [cuboidPic(num(v, 'l'), num(v, 'w'), num(v, 'h'), { unit: 'სმ' })],
    answer: (v) => num(v, 'l') * num(v, 'w') * num(v, 'h'),
    explanation: ({ vars }) => `${vars.l} × ${vars.w} × ${vars.h}.`,
  }),
];

export const G5_PICTURED_TEMPLATES: QuestionTemplate[] = [...U01, ...U07, ...U09, ...U11, ...U12, ...U13, ...U14, ...U15, ...U16, ...U17];
