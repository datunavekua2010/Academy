/**
 * Grade VI — pictured templates.
 *
 * Grade VI asks about negative numbers on a line and a thermometer, fractions
 * and decimals as shaded squares, percents on a hundred-square and a pie chart,
 * points in all four quarters of the coordinate plane, angles between lines and
 * in circles, triangles and quadrilaterals with labelled sides, solids and
 * statistics charts. Every picture is built from the question's own variables.
 */
import type { QuestionTemplate, Vars } from './types';
import { derived, distinct, int, interactiveSet, num, pick } from './ix-kit';
import { fractionChoices } from './ix-kit34';
import { dec, decOf, gcd, neg, opts4 } from './ix-kit56';
import { triangleFromAngles } from './px-g5';
import {
  anglePic, areaModelPic, circlePic, columnChartPic, crossingPic, cuboidPic, gridPic, hundredPic, lineGraphPic, numberLinePic, parallelogramMath, piePic, planePic,
  polyPic, rhombusMath, rightTriangleMath, spinnerPic, thermometerPic, transversalPic, twoCirclesPic,
} from '../pictures/draw';

const P = (topicId: string, unit: string) => interactiveSet(6, topicId, `g6-px-${unit}`);
const DAYS = ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ'];
const TRAP: Array<[number, number]> = [[0, 0], [8, 0], [6.5, 4], [1.5, 4]];
const BOX = { xmin: -6, xmax: 6, ymin: -6, ymax: 6, cell: 24 };
const pt = (x: number, y: number): string => `(${neg(x)}; ${neg(y)})`;
const quarterName = (x: number, y: number): string => (x > 0 && y > 0 ? 'I' : x < 0 && y > 0 ? 'II' : x < 0 && y < 0 ? 'III' : 'IV');
const nonZero = (...keys: string[]) => ({ test: (v: Vars) => keys.every((k) => num(v, k) !== 0), note: 'არა ღერძზე' });
const mean5 = (v: Vars): number => (num(v, 'a') + num(v, 'b') + num(v, 'c') + num(v, 'd') + num(v, 'e')) / 5;
const FD: Array<[number, number]> = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [7, 10], [9, 20], [11, 20], [3, 25], [7, 25]];

/* ------------------------------------------------------------ U01 */
const u01 = P('g6-numbers', 'u01');
const U01: QuestionTemplate[] = [
  u01('u01-08', 'neg-line', 1, {
    prompt: 'რომელი რიცხვია წითლად მონიშნული რიცხვით ღერძზე?',
    variables: { k: int(-11, 11) },
    constraints: [{ test: (v) => num(v, 'k') !== 0, note: 'არა ნული' }],
    pictures: (v) => [numberLinePic(-12, 12, 1, (x) => neg(x), [{ value: num(v, 'k') }], 4)],
    options: (v) => opts4(neg(num(v, 'k')), [neg(-num(v, 'k')), neg(num(v, 'k') + 1), neg(num(v, 'k') - 1), neg(num(v, 'k') + 2)]),
    text: true,
    answer: (v) => neg(num(v, 'k')),
    explanation: ({ answer }) => `მონიშნული რიცხვია ${answer}.`,
  }),
  u01('u01-10', 'which-greater', 1, {
    prompt: 'ღერძზე მონიშნულია A და B. რომელი რიცხვია მეტი?',
    variables: { a: int(-10, 10), b: int(-10, 10) },
    constraints: [distinct('a', 'b')],
    pictures: (v) => [numberLinePic(-12, 12, 1, (x) => neg(x), [{ value: num(v, 'a'), label: 'A' }, { value: num(v, 'b'), label: 'B', color: '#2f7de1' }], 4)],
    options: () => ['A', 'B'],
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'a') > num(v, 'b') ? 'A' : 'B'),
    explanation: () => 'ღერძზე მარჯვნივ მდგომი რიცხვი მეტია.',
  }),
  u01('u01-09', 'modulus-distance', 2, {
    prompt: 'რა მანძილზეა მონიშნული რიცხვი ნულიდან? (ანუ რისი ტოლია მისი მოდული?)',
    variables: { k: int(-11, 11) },
    constraints: [{ test: (v) => num(v, 'k') !== 0, note: 'არა ნული' }],
    pictures: (v) => [numberLinePic(-12, 12, 1, (x) => neg(x), [{ value: num(v, 'k') }], 4)],
    answer: (v) => Math.abs(num(v, 'k')),
    explanation: ({ vars }) => `|${neg(Number(vars.k))}| = ${Math.abs(Number(vars.k))}.`,
  }),
];

/* ------------------------------------------------------------ U03 */
const u03 = P('g6-negative-rational', 'u03');
const U03: QuestionTemplate[] = [
  u03('u03-01', 'jump', 2, {
    prompt: 'A წერტილიდან {d} ერთეულით {dir} გადავიდეთ. რომელ რიცხვს მივიღებთ?',
    variables: { a: int(-8, 8), d: int(2, 7), w: pick(0, 1), dir: derived((v) => (num(v, 'w') === 0 ? 'მარჯვნივ' : 'მარცხნივ')) },
    constraints: [{ test: (v) => Math.abs(num(v, 'a') + (num(v, 'w') === 0 ? 1 : -1) * num(v, 'd')) <= 12, note: 'ღერძზეა' }],
    pictures: (v) => [numberLinePic(-12, 12, 1, (x) => neg(x), [{ value: num(v, 'a'), label: 'A' }], 4)],
    answer: (v) => neg(num(v, 'a') + (num(v, 'w') === 0 ? 1 : -1) * num(v, 'd')),
    options: (v) => {
      const r = num(v, 'a') + (num(v, 'w') === 0 ? 1 : -1) * num(v, 'd');
      return opts4(neg(r), [neg(-r), neg(r + 1), neg(r - 1), neg(r + 2)]);
    },
    text: true,
    explanation: ({ answer }) => `მივიღებთ ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U04 */
const u04 = P('g6-fractions', 'u04');
const U04: QuestionTemplate[] = [
  u04('u04-11', 'area-product', 3, {
    prompt: 'ფერადი ნაწილები გვიჩვენებს {a}/{c} და {b}/{r} წილადებს. ორივეს გადაკვეთა მწვანეა. რას უდრის {a}/{c} × {b}/{r}?',
    variables: { c: int(3, 7), r: int(3, 7), a: int(1, 6), b: int(1, 6) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'c') && num(v, 'b') < num(v, 'r'), note: 'სწორი წილადები' }],
    pictures: (v) => [areaModelPic(num(v, 'c'), num(v, 'a'), num(v, 'r'), num(v, 'b'))],
    options: (v) => fractionChoices(num(v, 'a') * num(v, 'b'), num(v, 'c') * num(v, 'r'))(),
    text: true,
    answer: (v) => `${num(v, 'a') * num(v, 'b')}/${num(v, 'c') * num(v, 'r')}`,
    explanation: ({ vars }) => `მწვანე უჯრები: ${Number(vars.a) * Number(vars.b)} სულ ${Number(vars.c) * Number(vars.r)}-დან.`,
  }),
  u04('u04-01', 'whole-parts', 2, {
    prompt: 'სურათზე {n} უჯრაა, ფერადია {k}. ჩაწერე ფერადი ნაწილი უმარტივესი წილადით.',
    variables: { d: int(2, 6), f: int(2, 4), a: int(1, 5), n: derived((v) => num(v, 'd') * num(v, 'f')), k: derived((v) => num(v, 'a') * num(v, 'f')) },
    constraints: [{ test: (v) => num(v, 'a') < num(v, 'd') && gcd(num(v, 'a'), num(v, 'd')) === 1, note: 'უმარტივესი' }],
    pictures: (v) => [gridPic(1, num(v, 'n'), (_r, c) => c < num(v, 'k'), num(v, 'n') > 12 ? 20 : 28)],
    options: (v) => fractionChoices(num(v, 'a'), num(v, 'd'))(),
    text: true,
    answer: (v) => `${num(v, 'a')}/${num(v, 'd')}`,
    explanation: ({ vars }) => `${vars.k}/${vars.n} = ${vars.a}/${vars.d}.`,
  }),
];

/* ------------------------------------------------------------ U05 */
const u05 = P('g6-decimals', 'u05');
const U05: QuestionTemplate[] = [
  u05('u05-01', 'line-tenths', 1, {
    prompt: 'რომელი ათწილადია მონიშნული ღერძზე?',
    variables: { w: int(0, 3), t: int(1, 9) },
    pictures: (v) => [numberLinePic(num(v, 'w') * 10, num(v, 'w') * 10 + 10, 1, (x) => dec(x / 10, 1), [{ value: num(v, 'w') * 10 + num(v, 't') }], 1)],
    options: (v) => opts4(decOf(num(v, 'w') * 10 + num(v, 't'), 1), [decOf(num(v, 'w') * 10 + num(v, 't') + 1, 1), decOf(num(v, 'w') * 10 + num(v, 't') - 1, 1), decOf((num(v, 'w') * 10 + num(v, 't')) * 10 + 1, 2), decOf(num(v, 'w') * 10 + 10 - num(v, 't'), 1)]),
    text: true,
    answer: (v) => decOf(num(v, 'w') * 10 + num(v, 't'), 1),
    explanation: ({ answer }) => `ნიშნული ${answer}-ს შეესაბამება.`,
  }),
  u05('u05-02', 'hundred-shaded', 1, {
    prompt: 'ას უჯრიან კვადრატში შეღებილია ნაწილი. რომელი ათწილადია შეღებილი?',
    variables: { p: int(11, 99) },
    constraints: [{ test: (v) => num(v, 'p') % 10 !== 0, note: 'არა მეათედი' }],
    pictures: (v) => [hundredPic(num(v, 'p'))],
    options: (v) => opts4(decOf(num(v, 'p'), 2), [decOf(num(v, 'p') + 1, 2), decOf(100 - num(v, 'p'), 2), decOf(Math.floor(num(v, 'p') / 10), 1), decOf(num(v, 'p') + 10, 2)]),
    text: true,
    answer: (v) => decOf(num(v, 'p'), 2),
    explanation: ({ answer }) => `შეღებილია ${answer}.`,
  }),
  u05('u05-04', 'shade-compare', 2, {
    prompt: 'ორი კვადრატიდან თითოეული ას უჯრად არის დაყოფილი. რომელშია უფრო მეტი შეღებილი?',
    variables: { a: int(5, 95), b: int(5, 95) },
    constraints: [distinct('a', 'b')],
    pictures: (v) => [hundredPic(num(v, 'a')), hundredPic(num(v, 'b'))],
    options: () => ['პირველში', 'მეორეში'],
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'a') > num(v, 'b') ? 'პირველში' : 'მეორეში'),
    explanation: ({ vars }) => `${decOf(Number(vars.a), 2)} და ${decOf(Number(vars.b), 2)}.`,
  }),
];

/* ------------------------------------------------------------ U06 */
const u06 = P('g6-fraction-decimal', 'u06');
const U06: QuestionTemplate[] = [
  u06('u06-01', 'shaded-fraction-decimal', 2, {
    prompt: 'ას უჯრიან კვადრატში შეღებილია ნაწილი. რომელი ათწილადის ტოლია შეღებილი ნაწილი ({n}/{d})?',
    variables: { i: int(0, FD.length - 1), n: derived((v) => FD[num(v, 'i')]![0]), d: derived((v) => FD[num(v, 'i')]![1]) },
    pictures: (v) => [hundredPic((100 * num(v, 'n')) / num(v, 'd'))],
    options: (v) => {
      const x = num(v, 'n') / num(v, 'd');
      return opts4(dec(x, 2), [dec(x / 10, 3), dec(x * 10, 1), dec(1 - x, 2), dec(x + 0.1, 2)]);
    },
    text: true,
    answer: (v) => dec(num(v, 'n') / num(v, 'd'), 2),
    explanation: ({ vars, answer }) => `${vars.n}/${vars.d} = ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U07 */
const u07 = P('g6-percent', 'u07');
const U07: QuestionTemplate[] = [
  u07('u07-05', 'hundred-percent', 1, {
    prompt: 'ას უჯრიან კვადრატში შეღებილია ნაწილი. რამდენი პროცენტია შეღებილი?',
    variables: { p: int(5, 95) },
    pictures: (v) => [hundredPic(num(v, 'p'))],
    answer: (v) => num(v, 'p'),
    explanation: ({ vars }) => `${vars.p} უჯრა ასიდან — ${vars.p}%.`,
  }),
  u07('u07-05', 'pie-percent', 2, {
    prompt: 'წრიულ დიაგრამაზე A და B წილებია {pa}% და {pb}%. რამდენ პროცენტს შეადგენს C?',
    variables: { pa: int(10, 50, { step: 5 }), pb: int(10, 40, { step: 5 }) },
    constraints: [{ test: (v) => num(v, 'pa') + num(v, 'pb') <= 85, note: 'C დადებითია' }],
    pictures: (v) => [piePic([{ label: 'A', value: num(v, 'pa') }, { label: 'B', value: num(v, 'pb') }, { label: 'C', value: 100 - num(v, 'pa') - num(v, 'pb') }], { showValue: false })],
    answer: (v) => 100 - num(v, 'pa') - num(v, 'pb'),
    explanation: ({ answer }) => `100% − ... = ${answer}%.`,
  }),
  u07('u07-05', 'pie-amount', 3, {
    prompt: 'კლასში {n} მოსწავლეა. დიაგრამაზე სპორტის მოყვარულები {p}%-ს შეადგენენ. რამდენი მოსწავლეა ისინი?',
    variables: { n: pick(20, 40, 50, 60, 80, 100, 200), p: pick(10, 20, 25, 30, 40, 50) },
    constraints: [{ test: (v) => (num(v, 'n') * num(v, 'p')) % 100 === 0, note: 'მთელი რიცხვია' }],
    pictures: (v) => [piePic([{ label: 'სპორტი', value: num(v, 'p') }, { label: 'სხვა', value: 100 - num(v, 'p') }], { showValue: true, suffix: '%' })],
    answer: (v) => (num(v, 'n') * num(v, 'p')) / 100,
    explanation: ({ vars, answer }) => `${vars.n} × ${vars.p}/100 = ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U11 */
const u11 = P('g6-measure-time', 'u11');
const U11: QuestionTemplate[] = [
  u11('u11-06', 'thermo-read', 1, {
    prompt: 'რამდენ გრადუსს აჩვენებს თერმომეტრი?',
    variables: { t: int(-18, 18) },
    constraints: [{ test: (v) => num(v, 't') !== 0, note: 'არა ნული' }],
    pictures: (v) => [thermometerPic(num(v, 't'), -20, 20, 5)],
    options: (v) => opts4(`${neg(num(v, 't'))}°C`, [`${neg(-num(v, 't'))}°C`, `${neg(num(v, 't') + 1)}°C`, `${neg(num(v, 't') - 1)}°C`, `${neg(-num(v, 't') + 1)}°C`]),
    text: true,
    answer: (v) => `${neg(num(v, 't'))}°C`,
    explanation: ({ answer }) => `თერმომეტრი ${answer}-ს აჩვენებს.`,
  }),
  u11('u11-06', 'thermo-warmer', 2, {
    prompt: 'თერმომეტრი {an}°C-ს აჩვენებს. რამდენ გრადუსს აჩვენებს, თუ ტემპერატურა {d} გრადუსით გაიზრდება?',
    variables: { a: int(-15, -2), d: int(2, 12), an: derived((v) => neg(num(v, 'a'))) },
    constraints: [{ test: (v) => num(v, 'a') + num(v, 'd') <= 18, note: 'სკალის ფარგლებში' }],
    pictures: (v) => [thermometerPic(num(v, 'a'), -20, 20, 5)],
    answer: (v) => num(v, 'a') + num(v, 'd'),
    explanation: ({ vars, answer }) => `${neg(Number(vars.a))} + ${vars.d} = ${neg(Number(answer))}.`,
  }),
];

/* ------------------------------------------------------------ U12 */
const u12 = P('g6-coordinates', 'u12');
const U12: QuestionTemplate[] = [
  u12('u12-01', 'read-point', 1, {
    prompt: 'რა კოორდინატები აქვს A წერტილს?',
    variables: { x: int(-5, 5), y: int(-5, 5) },
    constraints: [nonZero('x', 'y')],
    pictures: (v) => [planePic({ ...BOX, points: [{ x: num(v, 'x'), y: num(v, 'y'), label: 'A' }] })],
    options: (v) => opts4(pt(num(v, 'x'), num(v, 'y')), [pt(num(v, 'y'), num(v, 'x')), pt(-num(v, 'x'), num(v, 'y')), pt(num(v, 'x'), -num(v, 'y')), pt(-num(v, 'x'), -num(v, 'y'))]),
    text: true,
    answer: (v) => pt(num(v, 'x'), num(v, 'y')),
    explanation: ({ answer }) => `A${answer}: ჯერ x, შემდეგ y.`,
  }),
  u12('u12-02', 'which-quarter', 1, {
    prompt: 'რომელ მეოთხედშია A წერტილი?',
    variables: { x: int(-5, 5), y: int(-5, 5) },
    constraints: [nonZero('x', 'y')],
    pictures: (v) => [planePic({ ...BOX, points: [{ x: num(v, 'x'), y: num(v, 'y'), label: 'A' }] })],
    options: () => ['I', 'II', 'III', 'IV'],
    text: true,
    answer: (v) => quarterName(num(v, 'x'), num(v, 'y')),
    explanation: ({ answer }) => `A ${answer} მეოთხედშია.`,
  }),
  u12('u12-03', 'on-axis', 2, {
    prompt: 'A წერტილი ღერძზე დევს. რა კოორდინატები აქვს?',
    variables: { k: int(-5, 5), w: pick(0, 1) },
    constraints: [{ test: (v) => num(v, 'k') !== 0, note: 'არა სათავე' }],
    pictures: (v) => [planePic({ ...BOX, points: [{ x: num(v, 'w') === 0 ? num(v, 'k') : 0, y: num(v, 'w') === 0 ? 0 : num(v, 'k'), label: 'A' }] })],
    options: (v) => {
      const k = num(v, 'k');
      return opts4(num(v, 'w') === 0 ? pt(k, 0) : pt(0, k), [num(v, 'w') === 0 ? pt(0, k) : pt(k, 0), pt(-k, 0), pt(0, -k), pt(k, k)]);
    },
    text: true,
    answer: (v) => (num(v, 'w') === 0 ? pt(num(v, 'k'), 0) : pt(0, num(v, 'k'))),
    explanation: () => 'ღერძზე ერთი კოორდინატი ნულია.',
  }),
  u12('u12-05', 'reflect-axis', 2, {
    prompt: 'A წერტილი y-ღერძის მიმართ აირეკლა და მივიღეთ A′. რას უდრის A′-ის x კოორდინატი?',
    variables: { x: int(-5, 5), y: int(-5, 5) },
    constraints: [nonZero('x', 'y')],
    pictures: (v) => [planePic({ ...BOX, points: [{ x: num(v, 'x'), y: num(v, 'y'), label: 'A' }] })],
    answer: (v) => -num(v, 'x'),
    explanation: ({ vars }) => `x იცვლის ნიშანს: ${neg(-Number(vars.x))}.`,
  }),
  u12('u12-06', 'center-symmetry', 3, {
    prompt: 'A წერტილი სათავის მიმართ სიმეტრიულად გადავიტანეთ. რა კოორდინატები აქვს ახალ წერტილს?',
    variables: { x: int(-5, 5), y: int(-5, 5) },
    constraints: [nonZero('x', 'y')],
    pictures: (v) => [planePic({ ...BOX, points: [{ x: num(v, 'x'), y: num(v, 'y'), label: 'A' }] })],
    options: (v) => opts4(pt(-num(v, 'x'), -num(v, 'y')), [pt(-num(v, 'x'), num(v, 'y')), pt(num(v, 'x'), -num(v, 'y')), pt(num(v, 'y'), num(v, 'x')), pt(num(v, 'x'), num(v, 'y'))]),
    text: true,
    answer: (v) => pt(-num(v, 'x'), -num(v, 'y')),
    explanation: ({ answer }) => `ორივე კოორდინატი იცვლის ნიშანს: ${answer}.`,
  }),
  u12('u12-04', 'segment-length', 2, {
    prompt: 'A და B წერტილები ერთ ჰორიზონტალურ წრფეზეა. რამდენია AB მონაკვეთის სიგრძე (ერთეულებში)?',
    variables: { x1: int(-5, 0), x2: int(1, 5), y: int(-5, 5) },
    pictures: (v) => [planePic({ ...BOX, points: [{ x: num(v, 'x1'), y: num(v, 'y'), label: 'A' }, { x: num(v, 'x2'), y: num(v, 'y'), label: 'B' }], segments: [[[num(v, 'x1'), num(v, 'y')], [num(v, 'x2'), num(v, 'y')]]] })],
    answer: (v) => num(v, 'x2') - num(v, 'x1'),
    explanation: ({ vars }) => `${vars.x2} − (${neg(Number(vars.x1))}) = ${Number(vars.x2) - Number(vars.x1)}.`,
  }),
  u12('u12-03', 'rectangle-area', 3, {
    prompt: 'ABCD მართკუთხედის გვერდები ბადის ხაზებს ეყრდნობა. რამდენი კვადრატული ერთეულია მისი ფართობი?',
    variables: { x1: int(-5, -1), x2: int(1, 5), y1: int(-5, -1), y2: int(1, 5) },
    pictures: (v) => [planePic({ ...BOX, points: [{ x: num(v, 'x1'), y: num(v, 'y1'), label: 'A' }, { x: num(v, 'x2'), y: num(v, 'y1'), label: 'B' }, { x: num(v, 'x2'), y: num(v, 'y2'), label: 'C' }, { x: num(v, 'x1'), y: num(v, 'y2'), label: 'D' }], polygon: [[num(v, 'x1'), num(v, 'y1')], [num(v, 'x2'), num(v, 'y1')], [num(v, 'x2'), num(v, 'y2')], [num(v, 'x1'), num(v, 'y2')]] })],
    answer: (v) => (num(v, 'x2') - num(v, 'x1')) * (num(v, 'y2') - num(v, 'y1')),
    explanation: ({ vars }) => `${Number(vars.x2) - Number(vars.x1)} × ${Number(vars.y2) - Number(vars.y1)}.`,
  }),
];

/* ------------------------------------------------------------ U14 */
const u14 = P('g6-patterns-chance', 'u14');
const COLORS = ['#e8473f', '#2f7de1', '#f2b705', '#2e9d5b'];
const COLOR_NAMES = ['წითელი', 'ლურჯი', 'ყვითელი', 'მწვანე'];
const spinnerColors = (v: Vars): string[] => [...Array(num(v, 'n'))].map((_, i) => (i < num(v, 'r') ? COLORS[0]! : COLORS[1 + (i % 3)]!));
const U14: QuestionTemplate[] = [
  u14('u14-04', 'spinner-chance', 2, {
    prompt: 'ისარი სექტორების წითელ ნაწილზე გაჩერდება. რამდენი სექტორია წითელი, თუ სულ {n} ტოლი სექტორია?',
    variables: { n: int(4, 10), r: int(1, 3) },
    pictures: (v) => [spinnerPic(spinnerColors(v))],
    answer: (v) => num(v, 'r'),
    explanation: ({ vars }) => `წითელია ${vars.r} სექტორი ${vars.n}-დან.`,
  }),
  u14('u14-05', 'spinner-fraction', 3, {
    prompt: 'რისი ტოლია იმის ალბათობა, რომ ისარი წითელ სექტორზე გაჩერდება? (სულ {n} ტოლი სექტორია.)',
    variables: { n: int(4, 10), r: int(1, 3) },
    constraints: [{ test: (v) => gcd(num(v, 'r'), num(v, 'n')) === 1, note: 'უკვე უმარტივესია' }],
    pictures: (v) => [spinnerPic(spinnerColors(v))],
    options: (v) => fractionChoices(num(v, 'r'), num(v, 'n'))(),
    text: true,
    answer: (v) => `${num(v, 'r')}/${num(v, 'n')}`,
    explanation: ({ answer }) => `ალბათობაა ${answer}.`,
  }),
  u14('u14-05', 'spinner-color', 1, {
    prompt: 'რომელი ფერის სექტორები უფრო მეტია?',
    variables: { n: int(5, 9), r: int(1, 4) },
    constraints: [{ test: (v) => num(v, 'r') * 2 !== num(v, 'n'), note: 'არა ტოლი' }],
    pictures: (v) => [spinnerPic([...Array(num(v, 'n'))].map((_, i) => (i < num(v, 'r') ? COLORS[0]! : COLORS[1]!)))],
    options: () => [COLOR_NAMES[0]!, COLOR_NAMES[1]!],
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'r') * 2 > num(v, 'n') ? COLOR_NAMES[0]! : COLOR_NAMES[1]!),
    explanation: () => 'უფრო მეტი სექტორი უფრო სავარაუდოა.',
  }),
];

/* ------------------------------------------------------------ U15 */
const u15 = P('g6-statistics', 'u15');
const U15: QuestionTemplate[] = [
  u15('u15-02', 'bar-mean', 3, {
    prompt: 'დიაგრამაზე ხუთი დღის მონაცემებია. რამდენია საშუალო არითმეტიკული?',
    variables: { a: int(2, 10), b: int(2, 10), c: int(2, 10), d: int(2, 10), e: int(2, 10) },
    constraints: [{ test: (v) => (num(v, 'a') + num(v, 'b') + num(v, 'c') + num(v, 'd') + num(v, 'e')) % 5 === 0, note: 'მთელი საშუალო' }],
    pictures: (v) => [columnChartPic(['a', 'b', 'c', 'd', 'e'].map((k, i) => ({ label: DAYS[i]!, value: num(v, k) })), 10, 2)],
    answer: (v) => mean5(v),
    explanation: ({ vars, answer }) => `ჯამი ${Number(vars.a) + Number(vars.b) + Number(vars.c) + Number(vars.d) + Number(vars.e)}, გაყოფილი 5-ზე: ${answer}.`,
  }),
  u15('u15-01', 'bar-range', 2, {
    prompt: 'დიაგრამაზე ხუთი დღის მონაცემებია. რამდენია განაყოფის ფარგლები (უდიდესი მინუს უმცირესი)?',
    variables: { a: int(1, 10), b: int(1, 10), c: int(1, 10), d: int(1, 10), e: int(1, 10) },
    constraints: [{ test: (v) => new Set(['a', 'b', 'c', 'd', 'e'].map((k) => num(v, k))).size >= 3, note: 'სხვადასხვა მონაცემი' }],
    pictures: (v) => [columnChartPic(['a', 'b', 'c', 'd', 'e'].map((k, i) => ({ label: DAYS[i]!, value: num(v, k) })), 10, 2)],
    answer: (v) => Math.max(...['a', 'b', 'c', 'd', 'e'].map((k) => num(v, k))) - Math.min(...['a', 'b', 'c', 'd', 'e'].map((k) => num(v, k))),
    explanation: ({ answer }) => `უდიდესი მინუს უმცირესი = ${answer}.`,
  }),
  u15('u15-03', 'bar-mode', 2, {
    prompt: 'დიაგრამაზე ხუთი დღის მონაცემებია. რომელია მოდა — ყველაზე ხშირი მნიშვნელობა?',
    variables: { m: int(2, 9), x: int(1, 10), y: int(1, 10), r: int(0, 4) },
    constraints: [{ test: (v) => num(v, 'x') !== num(v, 'm') && num(v, 'y') !== num(v, 'm') && num(v, 'x') !== num(v, 'y'), note: 'ერთადერთი მოდა' }],
    pictures: (v) => [columnChartPic([num(v, 'm'), num(v, 'x'), num(v, 'm'), num(v, 'y'), num(v, 'm')].map((value, i) => ({ label: DAYS[(i + num(v, 'r')) % 5]!, value })), 10, 2)],
    answer: (v) => num(v, 'm'),
    explanation: ({ vars }) => `${vars.m} სამჯერ გვხვდება.`,
  }),
  u15('u15-05', 'line-rise', 1, {
    prompt: 'გრაფიკზე ნაჩვენებია სამი დღის მონაცემი. რამდენით გაიზარდა მონაცემი პირველი დღიდან მესამემდე?',
    variables: { a: int(1, 4), b: int(1, 9), c: int(5, 9) },
    constraints: [{ test: (v) => num(v, 'c') > num(v, 'a'), note: 'იზრდება' }],
    pictures: (v) => [lineGraphPic([{ label: '1', value: num(v, 'a') }, { label: '2', value: num(v, 'b') }, { label: '3', value: num(v, 'c') }], 10, 2, { values: true })],
    answer: (v) => num(v, 'c') - num(v, 'a'),
    explanation: ({ vars }) => `${vars.c} − ${vars.a}.`,
  }),
];

/* ------------------------------------------------------------ U16 */
const u16 = P('g6-angles-circles', 'u16');
const kind4 = (d: number): string => (d < 90 ? 'მახვილი' : d === 90 ? 'მართი' : d < 180 ? 'ბლაგვი' : 'გაშლილი');
const U16: QuestionTemplate[] = [
  u16('u16-02', 'angle-kind', 1, {
    prompt: 'რა სახის კუთხეა გამოსახული?',
    variables: { d: pick(25, 35, 45, 60, 75, 90, 100, 115, 135, 150, 165) },
    pictures: (v) => [anglePic(num(v, 'd'), '?')],
    options: () => ['მახვილი', 'მართი', 'ბლაგვი', 'გაშლილი'],
    text: true,
    answer: (v) => kind4(num(v, 'd')),
    explanation: ({ answer }) => `ეს ${answer} კუთხეა.`,
  }),
  u16('u16-05', 'adjacent', 1, {
    prompt: 'ორი წრფე იკვეთება. ერთი კუთხეა {a}°. რამდენია მასთან მომიჯნავე კუთხე?',
    variables: { a: int(30, 150, { step: 10 }) },
    constraints: [{ test: (v) => num(v, 'a') !== 90, note: 'არა მართი' }],
    pictures: (v) => [crossingPic(num(v, 'a'), [`${num(v, 'a')}°`, '?', '', ''])],
    answer: (v) => 180 - num(v, 'a'),
    explanation: ({ vars, answer }) => `180° − ${vars.a}° = ${answer}°.`,
  }),
  u16('u16-05', 'vertical', 1, {
    prompt: 'ორი წრფე იკვეთება. ერთი კუთხეა {a}°. რამდენია მისი ვერტიკალური კუთხე?',
    variables: { a: int(30, 150, { step: 10 }) },
    constraints: [{ test: (v) => num(v, 'a') !== 90, note: 'არა მართი' }],
    pictures: (v) => [crossingPic(num(v, 'a'), [`${num(v, 'a')}°`, '', '?', ''])],
    answer: (v) => num(v, 'a'),
    explanation: ({ vars }) => `ვერტიკალური კუთხეები ტოლია: ${vars.a}°.`,
  }),
  u16('u16-04', 'corresponding', 2, {
    prompt: 'a ∥ b და მკვეთმა ისინი გადაკვეთა. ზედა წვეროზე მონიშნული კუთხეა {a}°. რამდენია ქვედა წვეროზე მონიშნული შესაბამისი კუთხე?',
    variables: { a: int(40, 140, { step: 10 }) },
    constraints: [{ test: (v) => num(v, 'a') !== 90, note: 'არა მართი' }],
    pictures: (v) => [transversalPic(num(v, 'a'), [`${num(v, 'a')}°`, '', '', ''], ['?', '', '', ''])],
    answer: (v) => num(v, 'a'),
    explanation: ({ vars }) => `შესაბამისი კუთხეები ტოლია: ${vars.a}°.`,
  }),
  u16('u16-04', 'cointerior', 3, {
    prompt: 'a ∥ b და მკვეთმა ისინი გადაკვეთა. ზედა წვეროზე მონიშნული კუთხეა {a}°. რამდენია ქვედა წვეროზე მონიშნული შიგა ცალმხრივი კუთხე?',
    variables: { a: int(40, 140, { step: 10 }) },
    constraints: [{ test: (v) => num(v, 'a') !== 90, note: 'არა მართი' }],
    pictures: (v) => [transversalPic(num(v, 'a'), ['', '', `${num(v, 'a')}°`, ''], ['', '?', '', ''])],
    answer: (v) => 180 - num(v, 'a'),
    explanation: ({ vars, answer }) => `შიგა ცალმხრივი კუთხეების ჯამია 180°: ${180 - Number(vars.a)}° = ${answer}°.`,
  }),
  u16('u16-08', 'inscribed', 3, {
    prompt: 'AOB ცენტრალური კუთხეა {c}°. რამდენია იმავე AB რკალზე დაყრდნობილი ACB ჩახაზული კუთხე?',
    variables: { k: int(3, 15), c: derived((v) => num(v, 'k') * 10) },
    constraints: [{ test: (v) => num(v, 'c') < 180, note: 'ჩახაზული კუთხე' }, { test: (v) => num(v, 'c') % 20 === 0, note: 'ნახევარი მთელია' }],
    pictures: (v) => [circlePic({ central: { from: 225 - num(v, 'c') / 2, to: 225 + num(v, 'c') / 2, label: `${num(v, 'c')}°` }, inscribed: { label: '?' } })],
    answer: (v) => num(v, 'c') / 2,
    explanation: ({ vars }) => `ჩახაზული კუთხე ცენტრალურის ნახევარია: ${Number(vars.c) / 2}°.`,
  }),
  u16('u16-09', 'circle-radius', 1, {
    prompt: 'წრეწირის დიამეტრია {d} სმ. რამდენია რადიუსი?',
    variables: { r: int(2, 19), d: derived((v) => 2 * num(v, 'r')) },
    pictures: (v) => [circlePic({ diameter: `${num(v, 'd')} სმ` })],
    answer: (v) => num(v, 'r'),
    explanation: ({ vars }) => `${vars.d} ÷ 2 = ${vars.r}.`,
  }),
  u16('u16-09', 'chord-name', 2, {
    prompt: 'როგორ ჰქვია წრეწირზე მოხაზულ ფერად მონაკვეთს?',
    variables: { k: int(0, 2) },
    pictures: (v) => [num(v, 'k') === 0 ? circlePic({ chord: '' }) : num(v, 'k') === 1 ? circlePic({ radius: '' }) : circlePic({ diameter: '' })],
    options: () => ['ქორდა', 'რადიუსი', 'დიამეტრი', 'რკალი'],
    text: true,
    answer: (v) => (num(v, 'k') === 0 ? 'ქორდა' : num(v, 'k') === 1 ? 'რადიუსი' : 'დიამეტრი'),
    explanation: () => 'ქორდა წრეწირის ორ წერტილს აერთებს; რადიუსი ცენტრს უერთებს წრეწირს; დიამეტრი ცენტრზე გამავალი ქორდაა.',
  }),
  u16('u16-07', 'two-circles', 3, {
    prompt: 'ორი წრეწირის რადიუსებია {r1} და {r2} სმ, ცენტრებს შორის მანძილი — {d} სმ. როგორ მდებარეობენ ისინი?',
    variables: { r1: int(2, 6), r2: int(2, 6), m: int(0, 3), d: derived((v) => [num(v, 'r1') + num(v, 'r2') + 2, num(v, 'r1') + num(v, 'r2'), Math.abs(num(v, 'r1') - num(v, 'r2')) + 1, Math.max(Math.abs(num(v, 'r1') - num(v, 'r2')) - 1, 0)][num(v, 'm')]!) },
    constraints: [
      { test: (v) => num(v, 'r1') !== num(v, 'r2'), note: 'განსხვავებული რადიუსები' },
      { test: (v) => Math.abs(num(v, 'r1') - num(v, 'r2')) >= 2 || num(v, 'm') !== 3, note: 'შიგნით მოთავსება' },
      { test: (v) => num(v, 'm') !== 2 || num(v, 'd') < num(v, 'r1') + num(v, 'r2'), note: 'იკვეთება' },
    ],
    pictures: (v) => [twoCirclesPic(num(v, 'r1'), num(v, 'r2'), num(v, 'd'))],
    options: () => ['ერთმანეთს არ ეხებიან', 'ეხებიან გარედან', 'იკვეთებიან', 'ერთი მეორეშია'],
    text: true,
    answer: (v) => ['ერთმანეთს არ ეხებიან', 'ეხებიან გარედან', 'იკვეთებიან', 'ერთი მეორეშია'][num(v, 'm')]!,
    explanation: ({ vars }) => `ცენტრებს შორის მანძილი ${vars.d} სმ-ია, რადიუსების ჯამი — ${Number(vars.r1) + Number(vars.r2)} სმ.`,
  }),
];

/* ------------------------------------------------------------ U17 */
const u17 = P('g6-triangles-quads', 'u17');
const TRIPLES = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15]];
const U17: QuestionTemplate[] = [
  u17('u17-04', 'third-angle', 1, {
    prompt: 'სამკუთხედის ორი კუთხეა {a}° და {b}°. რამდენია მესამე კუთხე?',
    variables: { a: int(30, 100, { step: 5 }), b: int(30, 80, { step: 5 }) },
    constraints: [{ test: (v: Vars) => num(v, 'a') + num(v, 'b') < 165, note: 'მესამე დადებითია' }],
    pictures: (v) => [polyPic(triangleFromAngles(num(v, 'a'), num(v, 'b')), { angles: [`${num(v, 'a')}°`, `${num(v, 'b')}°`, '?'] })],
    answer: (v) => 180 - num(v, 'a') - num(v, 'b'),
    explanation: ({ vars, answer }) => `180° − ${vars.a}° − ${vars.b}° = ${answer}°.`,
  }),
  u17('u17-04', 'isosceles-base', 2, {
    prompt: 'ტოლფერდა სამკუთხედის წვეროს კუთხეა {t}°. რამდენია თითოეული ფუძესთან კუთხე?',
    variables: { t: int(20, 120, { step: 10 }) },
    pictures: (v) => [polyPic(triangleFromAngles((180 - num(v, 't')) / 2, (180 - num(v, 't')) / 2), { angles: ['?', '?', `${num(v, 't')}°`], names: ['A', 'B', 'C'] })],
    answer: (v) => (180 - num(v, 't')) / 2,
    explanation: ({ vars, answer }) => `(180° − ${vars.t}°) ÷ 2 = ${answer}°.`,
  }),
  u17('u17-05', 'hypotenuse', 3, {
    prompt: 'მართკუთხა სამკუთხედის კათეტებია {a} და {b} სმ. რამდენია ჰიპოტენუზა?',
    variables: { t: int(0, TRIPLES.length - 1), a: derived((v) => TRIPLES[num(v, 't')]![0]!), b: derived((v) => TRIPLES[num(v, 't')]![1]!) },
    pictures: (v) => [polyPic(rightTriangleMath(num(v, 'a'), num(v, 'b')), { right: [0], sides: [`${num(v, 'a')}`, '?', `${num(v, 'b')}`], width: 240, height: 180 })],
    answer: (v) => TRIPLES[num(v, 't')]![2]!,
    explanation: ({ vars, answer }) => `${vars.a}² + ${vars.b}² = ${answer}².`,
  }),
  u17('u17-07', 'parallelogram-angle', 2, {
    prompt: 'პარალელოგრამის ერთი კუთხეა {a}°. რამდენია მის მეზობელ კუთხე?',
    variables: { a: int(50, 130, { step: 10 }) },
    constraints: [{ test: (v) => num(v, 'a') !== 90, note: 'არა მართკუთხედი' }],
    pictures: (v) => [polyPic(parallelogramMath(6, 4, num(v, 'a') < 90 ? 2.2 : -2.2), { angles: [`${num(v, 'a')}°`, '?', undefined, undefined] })],
    answer: (v) => 180 - num(v, 'a'),
    explanation: ({ vars, answer }) => `მეზობელი კუთხეების ჯამია 180°: ${vars.a}° + ${answer}°.`,
  }),
  u17('u17-07', 'rhombus-perimeter', 1, {
    prompt: 'რომბის გვერდია {s} სმ. რამდენია მისი პერიმეტრი?',
    variables: { s: int(2, 15) },
    pictures: (v) => [polyPic(rhombusMath(6, 4), { sides: [`${num(v, 's')} სმ`, undefined, undefined, undefined] })],
    answer: (v) => 4 * num(v, 's'),
    explanation: ({ vars }) => `4 × ${vars.s}.`,
  }),
  u17('u17-09', 'midline', 3, {
    prompt: 'ტრაპეციის ფუძეებია {a} და {b} სმ. რამდენია მისი შუა ხაზის სიგრძე?',
    variables: { a: int(2, 20), b: int(2, 20) },
    constraints: [{ test: (v) => (num(v, 'a') + num(v, 'b')) % 2 === 0 && num(v, 'a') > num(v, 'b'), note: 'მთელი' }],
    pictures: (v) => [polyPic(TRAP, { sides: [`${num(v, 'a')}`, undefined, `${num(v, 'b')}`, undefined] })],
    answer: (v) => (num(v, 'a') + num(v, 'b')) / 2,
    explanation: ({ vars }) => `(${vars.a} + ${vars.b}) ÷ 2.`,
  }),
];

/* ------------------------------------------------------------ U18 */
const u18 = P('g6-area-volume', 'u18');
const U18: QuestionTemplate[] = [
  u18('u18-02', 'rect-area', 1, {
    prompt: 'რამდენია მართკუთხედის ფართობი (კვ. სმ)?',
    variables: { a: int(3, 15), b: int(2, 12) },
    constraints: [distinct('a', 'b')],
    pictures: (v) => [polyPic([[0, 0], [num(v, 'a'), 0], [num(v, 'a'), num(v, 'b')], [0, num(v, 'b')]], { sides: [`${num(v, 'a')} სმ`, `${num(v, 'b')} სმ`, undefined, undefined], width: 250, height: 170 })],
    answer: (v) => num(v, 'a') * num(v, 'b'),
    explanation: ({ vars }) => `${vars.a} × ${vars.b}.`,
  }),
  u18('u18-05', 'triangle-area', 2, {
    prompt: 'მართკუთხა სამკუთხედის კათეტებია {a} და {b} სმ. რამდენია მისი ფართობი (კვ. სმ)?',
    variables: { a: int(3, 16), b: int(2, 12) },
    constraints: [{ test: (v) => (num(v, 'a') * num(v, 'b')) % 2 === 0, note: 'მთელი' }],
    pictures: (v) => [polyPic(rightTriangleMath(num(v, 'a'), num(v, 'b')), { right: [0], sides: [`${num(v, 'a')} სმ`, undefined, `${num(v, 'b')} სმ`], width: 250, height: 180 })],
    answer: (v) => (num(v, 'a') * num(v, 'b')) / 2,
    explanation: ({ vars }) => `${vars.a} × ${vars.b} ÷ 2.`,
  }),
  u18('u18-05', 'parallelogram-area', 2, {
    prompt: 'პარალელოგრამის ფუძეა {b} სმ და სიმაღლე {h} სმ. რამდენია მისი ფართობი (კვ. სმ)?',
    variables: { b: int(3, 15), h: int(2, 10) },
    pictures: (v) => [polyPic(parallelogramMath(6, 4, 2), { sides: [`${num(v, 'b')} სმ`, undefined, undefined, undefined], extra: (p) => [{ t: 'line', from: [p[3]![0], p[3]![1]], to: [p[3]![0], p[0]![1]], dash: true, stroke: '#e8473f', width: 2.5 }, { t: 'text', at: [p[3]![0] - 28, (p[3]![1] + p[0]![1]) / 2], text: `${num(v, 'h')} სმ`, size: 13, color: '#e8473f' }] })],
    answer: (v) => num(v, 'b') * num(v, 'h'),
    explanation: ({ vars }) => `${vars.b} × ${vars.h}.`,
  }),
  u18('u18-05', 'trapezoid-area', 3, {
    prompt: 'ტრაპეციის ფუძეებია {a} და {b} სმ, სიმაღლე — {h} სმ. რამდენია ფართობი (კვ. სმ)?',
    variables: { a: int(6, 16), b: int(2, 12), h: int(2, 10) },
    constraints: [{ test: (v) => num(v, 'a') > num(v, 'b') && ((num(v, 'a') + num(v, 'b')) * num(v, 'h')) % 2 === 0, note: 'მთელი' }],
    pictures: (v) => [polyPic(TRAP, { sides: [`${num(v, 'a')} სმ`, undefined, `${num(v, 'b')} სმ`, undefined], extra: (p) => [{ t: 'line', from: [p[3]![0], p[3]![1]], to: [p[3]![0], p[0]![1]], dash: true, stroke: '#e8473f', width: 2.5 }, { t: 'text', at: [p[3]![0] - 28, (p[3]![1] + p[0]![1]) / 2], text: `${num(v, 'h')} სმ`, size: 13, color: '#e8473f' }] })],
    answer: (v) => ((num(v, 'a') + num(v, 'b')) * num(v, 'h')) / 2,
    explanation: ({ vars, answer }) => `(${vars.a} + ${vars.b}) × ${vars.h} ÷ 2 = ${answer}.`,
  }),
  u18('u18-03', 'l-shape', 3, {
    prompt: 'რამდენია ამ ფიგურის ფართობი (კვ. სმ)?',
    variables: { a: int(8, 14), b: int(6, 10), c: int(3, 6), d: int(2, 4) },
    constraints: [{ test: (v) => num(v, 'c') < num(v, 'a') - 1 && num(v, 'd') < num(v, 'b') - 1, note: 'ამოჭრა' }],
    pictures: (v) => {
      const a = num(v, 'a');
      const b = num(v, 'b');
      const c = num(v, 'c');
      const d = num(v, 'd');
      return [polyPic([[0, 0], [a, 0], [a, d], [c, d], [c, b], [0, b]], { sides: [`${a}`, `${d}`, `${a - c}`, `${b - d}`, `${c}`, `${b}`], width: 280, height: 190 })];
    },
    answer: (v) => num(v, 'a') * num(v, 'b') - (num(v, 'a') - num(v, 'c')) * (num(v, 'b') - num(v, 'd')),
    explanation: ({ vars }) => `${Number(vars.a) * Number(vars.b)} − ${(Number(vars.a) - Number(vars.c)) * (Number(vars.b) - Number(vars.d))}.`,
  }),
  u18('u18-08', 'cuboid-volume', 2, {
    prompt: 'რამდენია ამ ყუთის მოცულობა (კუბური სმ)?',
    variables: { l: int(2, 9), w: int(2, 6), h: int(2, 6) },
    pictures: (v) => [cuboidPic(num(v, 'l'), num(v, 'w'), num(v, 'h'), { unit: 'სმ' })],
    answer: (v) => num(v, 'l') * num(v, 'w') * num(v, 'h'),
    explanation: ({ vars }) => `${vars.l} × ${vars.w} × ${vars.h}.`,
  }),
  u18('u18-10', 'cuboid-surface', 3, {
    prompt: 'რამდენია ამ ყუთის სრული ზედაპირის ფართობი (კვ. სმ)?',
    variables: { l: int(2, 8), w: int(2, 6), h: int(2, 6) },
    pictures: (v) => [cuboidPic(num(v, 'l'), num(v, 'w'), num(v, 'h'), { unit: 'სმ' })],
    answer: (v) => 2 * (num(v, 'l') * num(v, 'w') + num(v, 'l') * num(v, 'h') + num(v, 'w') * num(v, 'h')),
    explanation: ({ vars }) => `2 × (${vars.l}×${vars.w} + ${vars.l}×${vars.h} + ${vars.w}×${vars.h}).`,
  }),
  u18('u18-08', 'unit-cubes', 1, {
    prompt: 'ყუთი ერთეულოვანი კუბებისგან არის აგებული. რამდენი კუბია მასში?',
    variables: { l: int(2, 5), w: int(2, 4), h: int(2, 4) },
    pictures: (v) => [cuboidPic(num(v, 'l'), num(v, 'w'), num(v, 'h'), { grid: true })],
    answer: (v) => num(v, 'l') * num(v, 'w') * num(v, 'h'),
    explanation: ({ vars }) => `${vars.l} × ${vars.w} × ${vars.h}.`,
  }),
];

export const G6_PICTURED_TEMPLATES: QuestionTemplate[] = [...U01, ...U03, ...U04, ...U05, ...U06, ...U07, ...U11, ...U12, ...U14, ...U15, ...U16, ...U17, ...U18];
