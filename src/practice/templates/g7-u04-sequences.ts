import type { QuestionTemplate, Vars } from './types';
import { C, D, I, MINUS, N, par, q6, sg } from './g6-helpers';

/**
 * Grade VII — Unit 4: sequences and progressions.
 *
 * Converted from the academy's Grade VII `U04` bank: 7 subtopics × 6 questions.
 *
 * Terms are generated from the first term and the difference / ratio, printed
 * through `sg`, and every key is the closed formula (aₙ = a₁ + (n−1)d,
 * bₙ = b₁qⁿ⁻¹, Sₙ = n(a₁ + aₙ)/2 …) evaluated on the drawn numbers.
 */

export const G7_U04_SUBTOPICS = ['u04-01', 'u04-02', 'u04-03', 'u04-04', 'u04-05', 'u04-06', 'u04-07'] as const;

const T = 'g7-sequences';
let seq = 0;
const nextId = (): string => `g7-u04-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic' | 'grade'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, grade: 7, ...spec });

const WORDS = ['', 'პირველი', 'მეორე', 'მესამე', 'მეოთხე', 'მეხუთე', 'მეექვსე', 'მეშვიდე', 'მერვე', 'მეცხრე', 'მეათე'];
/** Georgian ordinal: `მეხუთე`, `მე-12`. */
const ord = (n: number): string => (n <= 10 ? WORDS[n]! : `მე-${n}`);
/** "3, 6, 9" */
const lst = (xs: number[]): string => xs.map(sg).join(', ');
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n: number): string => [...String(n)].map((d) => SUB[Number(d)]!).join('');

const ap = (a: number, d: number, n: number): number => a + (n - 1) * d;
const gp = (b: number, q: number, n: number): number => b * q ** (n - 1);
const terms = <X>(count: number, f: (i: number) => X): X[] => Array.from({ length: count }, (_, i) => f(i + 1));
const apSum = (a: number, d: number, n: number): number => (n * (2 * a + (n - 1) * d)) / 2;
const gpSum = (b: number, q: number, n: number): number => terms(n, (i) => gp(b, q, i)).reduce((x, y) => x + y, 0);

/** Options for a list key: the key first, then lists built from typical slips. */
const listWrong = (...alts: number[][]): string[] => alts.map(lst);

export const G7_U04_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U04.1 — რიცხვითი მიმდევრობები ═════════
  t({
    sub: 'u04-01',
    prompt: 'მოცემულია მიმდევრობა: {shown}, … . ჩაწერე შემდეგი ორი წევრი.',
    vars: { a: I(1, 12), d: I(2, 9), shown: D((v) => lst(terms(4, (i) => ap(N(v, 'a'), N(v, 'd'), i)))) },
    answer: (v) => lst([ap(N(v, 'a'), N(v, 'd'), 5), ap(N(v, 'a'), N(v, 'd'), 6)]),
    options: (v, right) => {
      const [a, d] = [N(v, 'a'), N(v, 'd')];
      return [right, ...listWrong([ap(a, d, 5), ap(a, d, 6) + d], [ap(a, d, 5) + 1, ap(a, d, 6) + 1], [ap(a, d, 5) - 1, ap(a, d, 6)], [ap(a, d, 5), ap(a, d, 6) - d + 1])];
    },
    why: (v, a) => `თითოეული წევრი წინაზე ${v.d}-ით მეტია, ამიტომ შემდეგი ორი წევრია ${a}.`,
  }),
  t({
    sub: 'u04-01',
    prompt: 'მოცემულია მიმდევრობა: {shown}, … . იპოვე შემდეგი წევრი.',
    vars: { k: C([1, 1, 2, 3]), c: C([1, 2, 3, 4, 5, -1, -2, -3]), shown: D((v) => lst(terms(5, (i) => N(v, 'k') * i * i + N(v, 'c')))) },
    answer: (v) => sg(36 * N(v, 'k') + N(v, 'c')),
    wrong: (v) => {
      const [k, c] = [N(v, 'k'), N(v, 'c')];
      return [(25 * k + c) + (25 * k - 16 * k), 36 * k + c + 1, 36 * k + c - 1, 2 * (25 * k + c) - (16 * k + c), 36 * k + c + k];
    },
    why: (v, a) => `წევრები ${N(v, 'k') === 1 ? '' : `${v.k} · `}n² ${N(v, 'c') < 0 ? MINUS : '+'} ${Math.abs(N(v, 'c'))}; მეექვსეა ${a}.`,
  }),
  t({
    sub: 'u04-01',
    prompt: 'შეავსე გამოტოვებული წევრი: {shown}.',
    vars: { a: I(1, 20), d: I(2, 9), p: I(2, 4), shown: D((v) => terms(5, (i) => (i === N(v, 'p') ? '□' : sg(ap(N(v, 'a'), N(v, 'd'), i)))).join(', ')) },
    answer: (v) => sg(ap(N(v, 'a'), N(v, 'd'), N(v, 'p'))),
    wrong: (v) => [ap(N(v, 'a'), N(v, 'd'), N(v, 'p')) + 1, ap(N(v, 'a'), N(v, 'd'), N(v, 'p')) - 1, ap(N(v, 'a'), N(v, 'd'), N(v, 'p')) + N(v, 'd'), ap(N(v, 'a'), N(v, 'd'), N(v, 'p')) - N(v, 'd')],
    why: (v, a) => `მეზობელი წევრები ${v.d}-ით განსხვავდება, ამიტომ გამოტოვებული წევრია ${a}.`,
  }),
  t({
    sub: 'u04-01',
    prompt: 'მოცემულია მიმდევრობა: {shown}, … . ჩაწერე შემდეგი წევრი.',
    vars: {
      form: C([0, 1, 2, 3]),
      m: I(1, 4),
      shown: D((v) => lst(terms(5, (i) => pattern(N(v, 'form'), N(v, 'm'), i)))),
    },
    answer: (v) => sg(pattern(N(v, 'form'), N(v, 'm'), 6)),
    wrong: (v) => {
      const p = (i: number): number => pattern(N(v, 'form'), N(v, 'm'), i);
      return [p(5) + (p(5) - p(4)), p(6) + 1, p(6) - 1, p(5) * 2, p(5) + (p(5) - p(4)) + 1];
    },
    why: (v, a) => `${['კვადრატები', 'კუბები', 'სამკუთხა რიცხვები', 'ყოველი წევრი წინაზე ორჯერ მეტია'][N(v, 'form')]}: შემდეგი წევრია ${a}.`,
  }),
  t({
    sub: 'u04-01',
    prompt: 'მიმდევრობის პირველი წევრია {a}, ხოლო ყოველი შემდეგი წევრი წინა წევრზე {d}-ით მეტია. იპოვე {w} წევრი.',
    vars: { a: I(2, 15), d: I(2, 9), n: I(4, 8), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => sg(ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))),
    wrong: (v) => [ap(N(v, 'a'), N(v, 'd'), N(v, 'n')) + N(v, 'd'), ap(N(v, 'a'), N(v, 'd'), N(v, 'n')) - N(v, 'd'), N(v, 'a') * N(v, 'n') + N(v, 'd'), N(v, 'a') + N(v, 'd') * N(v, 'n') + 1],
    why: (v, a) => `${terms(N(v, 'n'), (i) => ap(N(v, 'a'), N(v, 'd'), i)).join(', ')}: ${ord(N(v, 'n'))} წევრია ${a}.`,
  }),
  t({
    sub: 'u04-01',
    prompt: 'მოცემულია მიმდევრობა: {shown}, … . იპოვე შემდეგი ორი წევრი.',
    vars: { q: C([2, 3, 4, 5]), e: I(1, 3), shown: D((v) => lst(terms(4, (i) => N(v, 'e') * N(v, 'q') ** (6 - i)))) },
    answer: (v) => lst([N(v, 'e') * N(v, 'q'), N(v, 'e')]),
    options: (v, right) => {
      const [e, q] = [N(v, 'e'), N(v, 'q')];
      return [right, ...listWrong([e * q - 1, e], [e * q, e - 1 || 2], [e * q, q], [e * q + 1, e + 1])];
    },
    why: (v, a) => `ყოველი წევრი წინაზე ${v.q}-ჯერ ნაკლებია, ამიტომ შემდეგი ორი წევრია ${a}.`,
  }),

  // ═════════ U04.2 — პერიოდული მიმდევრობები ═════════
  t({
    sub: 'u04-02',
    prompt: 'მოცემულია პერიოდული მიმდევრობა: {shown}, … . ჩაწერე {w} წევრი.',
    vars: { p: C(['1,3,5', '2,4,6', '3,5,9', '4,7,1', '6,2,8', '9,3,7', '1,4,7', '5,2,9']), n: I(8, 25), shown: D((v) => [...cycle(v), ...cycle(v)].join(', ')), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => cycle(v)[(N(v, 'n') - 1) % 3]!,
    wrong: (v) => [cycle(v)[N(v, 'n') % 3]!, cycle(v)[(N(v, 'n') + 1) % 3]!, N(v, 'n')],
    why: (v, a) => `პერიოდი 3 წევრისგან შედგება; ${v.n} = ${3 * Math.floor((N(v, 'n') - 1) / 3)} + ${((N(v, 'n') - 1) % 3) + 1}, ამიტომ პასუხია ${a}.`,
  }),
  t({
    sub: 'u04-02',
    prompt: 'მოცემულია მიმდევრობა: {shown}, … . რომელი ასოა {w} ადგილზე?',
    vars: { p: C(['ABCD', 'PQRS', 'KLMN', 'WXYZ', 'EFGH', 'ABCDE', 'MNPQR']), n: I(9, 30), shown: D((v) => [...String(v.p), ...String(v.p)].join(', ')), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => String(v.p)[(N(v, 'n') - 1) % String(v.p).length]!,
    options: (v, right) => [right, ...[...String(v.p)].filter((x) => x !== right)],
    why: (v, a) => `პერიოდი ${String(v.p).length} ასოსგან შედგება; ${v.n}-ე ადგილზე დგას ${a}.`,
  }),
  t({
    sub: 'u04-02',
    prompt: 'მოცემულია მიმდევრობა: {shown}, … . ჩაწერე {w} წევრი.',
    vars: { p: C(['2,4,6', '1,3,5', '3,6,9', '5,10,15', '4,8,12', '7,9,11']), n: I(10, 40), shown: D((v) => [...cycle(v), ...cycle(v)].join(', ')), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => cycle(v)[(N(v, 'n') - 1) % 3]!,
    wrong: (v) => [cycle(v)[N(v, 'n') % 3]!, cycle(v)[(N(v, 'n') + 1) % 3]!, Number(cycle(v)[0]) + Number(cycle(v)[1])],
    why: (v, a) => `${v.n} ÷ 3 = ${Math.floor(N(v, 'n') / 3)}, ნაშთი ${N(v, 'n') % 3}; ამიტომ ${ord(N(v, 'n'))} წევრია ${a}.`,
  }),
  t({
    sub: 'u04-02',
    prompt: 'მიმდევრობის პერიოდია ({p}). თუ მიმდევრობა იწყება {shown}, …-ით, იპოვე {w} წევრი.',
    vars: { p: C(['5, 8, 2', '4, 9, 1', '6, 3, 7', '2, 7, 5', '8, 1, 4', '3, 9, 6']), n: I(15, 50), shown: D((v) => `${String(v.p)}, ${String(v.p)}`), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => cycle({ p: String(v.p).replace(/ /g, '') } as Vars)[(N(v, 'n') - 1) % 3]!,
    wrong: (v) => [cycle({ p: String(v.p).replace(/ /g, '') } as Vars)[N(v, 'n') % 3]!, cycle({ p: String(v.p).replace(/ /g, '') } as Vars)[(N(v, 'n') + 1) % 3]!, N(v, 'n') % 3],
    why: (v, a) => `${v.n} = 3 · ${Math.floor((N(v, 'n') - 1) / 3)} + ${((N(v, 'n') - 1) % 3) + 1}; პერიოდის ${((N(v, 'n') - 1) % 3) + 1}-ლი წევრია ${a}.`,
  }),
  t({
    sub: 'u04-02',
    prompt: 'მოცემულია პერიოდული მიმდევრობა: {shown}, … . რამდენჯერ გვხვდება რიცხვი {x} პირველ {n} წევრში?',
    vars: { p: C(['7,1,4', '2,5,8', '3,6,9', '4,1,7', '9,2,5', '6,8,3']), k: I(0, 2), n: I(9, 25), x: D((v) => cycle(v)[N(v, 'k')]!), shown: D((v) => [...cycle(v), ...cycle(v)].join(', ')) },
    answer: (v) => String(Math.floor(N(v, 'n') / 3) + (N(v, 'n') % 3 > N(v, 'k') ? 1 : 0)),
    wrong: (v) => [Math.floor(N(v, 'n') / 3), Math.floor(N(v, 'n') / 3) + 1, Math.floor(N(v, 'n') / 3) + (N(v, 'n') % 3 > N(v, 'k') ? 0 : 1) + 1, Math.floor(N(v, 'n') / 3) + 2],
    why: (v, a) => `პირველ ${v.n} წევრში არის ${Math.floor(N(v, 'n') / 3)} სრული პერიოდი${N(v, 'n') % 3 > N(v, 'k') ? ' და დარჩენილ წევრებშიც ერთხელ' : ''}. პასუხი: ${a}.`,
  }),
  t({
    sub: 'u04-02',
    prompt: 'მიმდევრობა შედგება პერიოდულად გამეორებადი წევრებისგან: ({p}). იპოვე {w} წევრი.',
    vars: { p: C(['3, 6, 9, 12', '2, 5, 8, 11', '1, 4, 9, 16', '5, 7, 3, 1', '6, 2, 9, 4', '8, 3, 5, 1']), n: I(12, 40), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => String(v.p).split(', ')[(N(v, 'n') - 1) % 4]!,
    options: (v, right) => [right, ...String(v.p).split(', ').filter((x) => x !== right)],
    why: (v, a) => `პერიოდი 4 წევრისგანაა; ${v.n} = 4 · ${Math.floor((N(v, 'n') - 1) / 4)} + ${((N(v, 'n') - 1) % 4) + 1}, ამიტომ პასუხია ${a}.`,
  }),

  // ═════════ U04.3 — არითმეტიკული პროგრესია ═════════
  t({
    sub: 'u04-03',
    prompt: 'იპოვე არითმეტიკული პროგრესიის სხვაობა: {shown}, … .',
    vars: { a: I(-10, 20), d: I(-9, 9, { nonZero: true }), shown: D((v) => lst(terms(4, (i) => ap(N(v, 'a'), N(v, 'd'), i)))) },
    answer: (v) => sg(N(v, 'd')),
    wrong: (v) => [-N(v, 'd'), N(v, 'd') + 1, N(v, 'd') - 1, N(v, 'a')],
    why: (v, a) => `სხვაობა = მეორე წევრი − პირველი წევრი = ${sg(ap(N(v, 'a'), N(v, 'd'), 2))} ${MINUS} ${par(N(v, 'a'))} = ${a}.`,
  }),
  t({
    sub: 'u04-03',
    prompt: 'არითმეტიკული პროგრესიის პირველი წევრია {aS}, ხოლო სხვაობა — {dS}. ჩაწერე პირველი ხუთი წევრი.',
    vars: { a: I(-6, 20), d: I(-5, 9, { nonZero: true }), aS: D((v) => sg(N(v, 'a'))), dS: D((v) => par(N(v, 'd'))) },
    answer: (v) => lst(terms(5, (i) => ap(N(v, 'a'), N(v, 'd'), i))),
    options: (v, right) => {
      const [a, d] = [N(v, 'a'), N(v, 'd')];
      return [right, ...listWrong(terms(5, (i) => ap(a, -d, i)), terms(5, (i) => ap(a + d, d, i)), terms(5, (i) => a * Math.abs(d) ** (i - 1) * (d < 0 ? (-1) ** (i - 1) : 1)), terms(5, (i) => ap(a, d + 1, i)))];
    },
    why: (v, a) => `ყოველ შემდეგ წევრს ვუმატებთ ${sg(N(v, 'd'))}: ${a}.`,
  }),
  t({
    sub: 'u04-03',
    prompt: 'არითმეტიკული პროგრესიის პირველი წევრია {a}, ხოლო სხვაობა — {dS}. იპოვე {w} წევრი.',
    vars: { a: I(10, 40), d: I(-9, -2), n: I(3, 6), dS: D((v) => par(N(v, 'd'))), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => sg(ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))),
    wrong: (v) => [ap(N(v, 'a'), N(v, 'd'), N(v, 'n')) + 2 * Math.abs(N(v, 'd')), N(v, 'a') + N(v, 'd') * N(v, 'n'), ap(N(v, 'a'), N(v, 'd'), N(v, 'n')) + 1, ap(N(v, 'a'), -N(v, 'd'), N(v, 'n'))],
    why: (v, a) => `${N(v, 'a')} + ${N(v, 'n') - 1} · ${par(N(v, 'd'))} = ${a}.`,
  }),
  t({
    sub: 'u04-03',
    prompt: 'მოცემულია არითმეტიკული პროგრესია: {shown}, … . იპოვე {w} წევრი.',
    vars: { a: I(1, 30), d: I(2, 9), n: I(5, 9), shown: D((v) => lst(terms(4, (i) => ap(N(v, 'a'), N(v, 'd'), i)))), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => sg(ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))),
    wrong: (v) => [ap(N(v, 'a'), N(v, 'd'), N(v, 'n')) + N(v, 'd'), ap(N(v, 'a'), N(v, 'd'), N(v, 'n')) - N(v, 'd'), N(v, 'a') + N(v, 'd') * N(v, 'n'), ap(N(v, 'a'), N(v, 'd'), N(v, 'n')) + 1],
    why: (v, a) => `d = ${v.d}; ${v.a} + ${N(v, 'n') - 1} · ${v.d} = ${a}.`,
  }),
  t({
    sub: 'u04-03',
    prompt: 'არითმეტიკული პროგრესიის {w1} წევრია {x}, ხოლო {w2} წევრი — {y}. იპოვე პირველი წევრი.',
    vars: { k: C([2, 3, 4]), a: I(1, 15), d: I(2, 9), w1: D((v) => ord(N(v, 'k'))), w2: D((v) => ord(N(v, 'k') + 1)), x: D((v) => ap(N(v, 'a'), N(v, 'd'), N(v, 'k'))), y: D((v) => ap(N(v, 'a'), N(v, 'd'), N(v, 'k') + 1)) },
    answer: (v) => sg(N(v, 'a')),
    wrong: (v) => [N(v, 'a') + N(v, 'd'), N(v, 'a') - N(v, 'd'), N(v, 'x') - N(v, 'k') * N(v, 'd'), N(v, 'a') + 1],
    why: (v, a) => `d = ${v.y} − ${v.x} = ${v.d}; პირველი წევრია ${v.x} − ${N(v, 'k') - 1} · ${v.d} = ${a}.`,
  }),
  t({
    sub: 'u04-03',
    prompt: 'არითმეტიკული პროგრესიის პირველი წევრია {aS}, ხოლო სხვაობა — {d}. იპოვე {w} წევრი.',
    vars: { a: I(-12, -1), d: I(2, 9), n: I(5, 10), aS: D((v) => par(N(v, 'a'))), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => sg(ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))),
    wrong: (v) => [ap(N(v, 'a'), N(v, 'd'), N(v, 'n')) + N(v, 'd'), ap(N(v, 'a'), N(v, 'd'), N(v, 'n')) - N(v, 'd'), -ap(N(v, 'a'), N(v, 'd'), N(v, 'n')), N(v, 'a') + N(v, 'd') * N(v, 'n')],
    why: (v, a) => `${sg(N(v, 'a'))} + ${N(v, 'n') - 1} · ${v.d} = ${a}.`,
  }),

  // ═════════ U04.4 — არითმეტიკული პროგრესიის n-ური წევრი ═════════
  t({
    sub: 'u04-04',
    prompt: 'არითმეტიკული პროგრესიის პირველი წევრია {a}, ხოლო სხვაობა — {d}. იპოვე {w} წევრი.',
    vars: { a: I(1, 15), d: I(2, 9), n: I(10, 20), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => sg(ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))),
    wrong: (v) => [N(v, 'a') + N(v, 'n') * N(v, 'd'), N(v, 'a') + (N(v, 'n') - 2) * N(v, 'd'), N(v, 'a') * N(v, 'd') * N(v, 'n'), ap(N(v, 'a'), N(v, 'd'), N(v, 'n')) + 1],
    why: (v, a) => `aₙ = a₁ + (n − 1)d = ${v.a} + ${N(v, 'n') - 1} · ${v.d} = ${a}.`,
  }),
  t({
    sub: 'u04-04',
    prompt: 'არითმეტიკული პროგრესიის პირველი წევრია {a}, ხოლო სხვაობა — {dS}. იპოვე {w} წევრი.',
    vars: { a: I(12, 40), d: I(-6, -2), n: I(5, 9), dS: D((v) => par(N(v, 'd'))), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => sg(ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))),
    wrong: (v) => [N(v, 'a') + N(v, 'n') * N(v, 'd'), ap(N(v, 'a'), -N(v, 'd'), N(v, 'n')), N(v, 'a') + (N(v, 'n') - 2) * N(v, 'd'), ap(N(v, 'a'), N(v, 'd'), N(v, 'n')) + 1],
    why: (v, a) => `aₙ = ${v.a} + ${N(v, 'n') - 1} · ${par(N(v, 'd'))} = ${a}.`,
  }),
  t({
    sub: 'u04-04',
    prompt: 'არითმეტიკული პროგრესიის ზოგადი წევრია aₙ = {p}n + {q}. იპოვე a{ms}.',
    vars: { p: I(2, 9), q: I(1, 9), m: I(6, 25), ms: D((v) => sub(N(v, 'm'))) },
    answer: (v) => sg(N(v, 'p') * N(v, 'm') + N(v, 'q')),
    wrong: (v) => [N(v, 'p') * N(v, 'm'), N(v, 'p') * (N(v, 'm') + 1) + N(v, 'q'), N(v, 'p') * (N(v, 'm') - 1) + N(v, 'q'), (N(v, 'p') + N(v, 'q')) * N(v, 'm')],
    why: (v, a) => `a${sub(N(v, 'm'))} = ${v.p} · ${v.m} + ${v.q} = ${a}.`,
  }),
  t({
    sub: 'u04-04',
    prompt: 'მოცემულია არითმეტიკული პროგრესია: {shown}, … . იპოვე {w} წევრი.',
    vars: { a: I(1, 20), d: I(2, 9), n: I(10, 20), shown: D((v) => lst(terms(4, (i) => ap(N(v, 'a'), N(v, 'd'), i)))), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => sg(ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))),
    wrong: (v) => [N(v, 'a') + N(v, 'n') * N(v, 'd'), N(v, 'a') + (N(v, 'n') - 2) * N(v, 'd'), ap(N(v, 'a'), N(v, 'd'), N(v, 'n')) + N(v, 'd'), N(v, 'a') * N(v, 'n')],
    why: (v, a) => `d = ${v.d}; a${sub(N(v, 'n'))} = ${v.a} + ${N(v, 'n') - 1} · ${v.d} = ${a}.`,
  }),
  t({
    sub: 'u04-04',
    prompt: 'არითმეტიკული პროგრესიის პირველი წევრია {aS}, ხოლო სხვაობა — {d}. იპოვე {w} წევრი.',
    vars: { a: I(-20, -5), d: I(2, 6), n: I(8, 16), aS: D((v) => par(N(v, 'a'))), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => sg(ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))),
    wrong: (v) => [N(v, 'a') + N(v, 'n') * N(v, 'd'), N(v, 'a') + (N(v, 'n') - 2) * N(v, 'd'), -ap(N(v, 'a'), N(v, 'd'), N(v, 'n')), ap(N(v, 'a'), N(v, 'd'), N(v, 'n')) + N(v, 'd')],
    why: (v, a) => `a${sub(N(v, 'n'))} = ${sg(N(v, 'a'))} + ${N(v, 'n') - 1} · ${v.d} = ${a}.`,
  }),
  t({
    sub: 'u04-04',
    prompt: 'არითმეტიკული პროგრესიის ზოგადი წევრია aₙ = {q} {MINUS} {p}n. იპოვე a{ms}.',
    vars: { q: I(15, 40), p: I(2, 6), m: I(4, 12), ms: D((v) => sub(N(v, 'm'))), MINUS: D(() => MINUS) },
    answer: (v) => sg(N(v, 'q') - N(v, 'p') * N(v, 'm')),
    wrong: (v) => [N(v, 'q') + N(v, 'p') * N(v, 'm'), N(v, 'p') * N(v, 'm') - N(v, 'q'), N(v, 'q') - N(v, 'p') * (N(v, 'm') + 1), N(v, 'q') - N(v, 'p') * (N(v, 'm') - 1)],
    why: (v, a) => `a${sub(N(v, 'm'))} = ${v.q} ${MINUS} ${v.p} · ${v.m} = ${a}.`,
  }),

  // ═════════ U04.5 — არითმეტიკული პროგრესიის ჯამი ═════════
  t({
    sub: 'u04-05',
    prompt: '{ask}',
    vars: {
      n: I(8, 30),
      form: C([0, 1, 2]),
      ask: D((v) =>
        N(v, 'form') === 0
          ? `იპოვე პირველი ${N(v, 'n')} ნატურალური რიცხვის ჯამი: 1 + 2 + 3 + ⋯ + ${N(v, 'n')}.`
          : N(v, 'form') === 1
            ? `იპოვე პირველი ${N(v, 'n')} ლუწი რიცხვის ჯამი: 2 + 4 + 6 + ⋯ + ${2 * N(v, 'n')}.`
            : `იპოვე პირველი ${N(v, 'n')} კენტი რიცხვის ჯამი: 1 + 3 + 5 + ⋯ + ${2 * N(v, 'n') - 1}.`,
      ),
    },
    answer: (v) => sg(N(v, 'form') === 0 ? (N(v, 'n') * (N(v, 'n') + 1)) / 2 : N(v, 'form') === 1 ? N(v, 'n') * (N(v, 'n') + 1) : N(v, 'n') ** 2),
    wrong: (v) => {
      const n = N(v, 'n');
      return [(n * (n + 1)) / 2, n * (n + 1), n * n, (n * (n - 1)) / 2, n * (n + 1) / 2 + n].filter((x) => x !== (N(v, 'form') === 0 ? (n * (n + 1)) / 2 : N(v, 'form') === 1 ? n * (n + 1) : n * n));
    },
    why: (_v, a) => `Sₙ = n(a₁ + aₙ)/2, ამიტომ ჯამი ${a}.`,
  }),
  t({
    sub: 'u04-05',
    prompt: 'არითმეტიკული პროგრესიის პირველი წევრია {a}, ხოლო {w} წევრი — {l}. იპოვე პირველი {n} წევრის ჯამი.',
    vars: { a: I(1, 10), d: I(2, 6), n: I(6, 15), l: D((v) => ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => sg(apSum(N(v, 'a'), N(v, 'd'), N(v, 'n'))),
    wrong: (v) => [N(v, 'n') * (N(v, 'a') + N(v, 'l')), (N(v, 'n') * (N(v, 'a') + N(v, 'l'))) / 2 + N(v, 'a'), ((N(v, 'n') - 1) * (N(v, 'a') + N(v, 'l'))) / 2, (N(v, 'a') + N(v, 'l')) / 2],
    why: (v, a) => `Sₙ = n(a₁ + aₙ)/2 = ${v.n} · (${v.a} + ${v.l}) ÷ 2 = ${a}.`,
  }),
  t({
    sub: 'u04-05',
    prompt: 'იპოვე პროგრესიის პირველი {n} წევრის ჯამი: {shown}, … .',
    vars: { a: I(1, 9), d: I(2, 6), n: I(6, 12), shown: D((v) => lst(terms(4, (i) => ap(N(v, 'a'), N(v, 'd'), i)))) },
    answer: (v) => sg(apSum(N(v, 'a'), N(v, 'd'), N(v, 'n'))),
    wrong: (v) => [N(v, 'n') * (N(v, 'a') + ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))), apSum(N(v, 'a'), N(v, 'd'), N(v, 'n') - 1), apSum(N(v, 'a'), N(v, 'd'), N(v, 'n') + 1), apSum(N(v, 'a'), N(v, 'd'), N(v, 'n')) + N(v, 'd')],
    why: (v, a) => `d = ${v.d}, a${sub(N(v, 'n'))} = ${ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))}; S = ${v.n} · (${v.a} + ${ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))}) ÷ 2 = ${a}.`,
  }),
  t({
    sub: 'u04-05',
    prompt: 'არითმეტიკული პროგრესიის პირველი წევრია {a}, ხოლო სხვაობა — {d}. იპოვე პირველი {n} წევრის ჯამი.',
    vars: { a: I(2, 20), d: I(2, 6), n: I(5, 10) },
    answer: (v) => sg(apSum(N(v, 'a'), N(v, 'd'), N(v, 'n'))),
    wrong: (v) => [N(v, 'n') * (N(v, 'a') + ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))), apSum(N(v, 'a'), N(v, 'd'), N(v, 'n') - 1), N(v, 'n') * N(v, 'a') + N(v, 'n') * N(v, 'd'), apSum(N(v, 'a'), N(v, 'd'), N(v, 'n')) + N(v, 'a')],
    why: (v, a) => `Sₙ = n(2a₁ + (n − 1)d)/2 = ${v.n} · (${2 * N(v, 'a')} + ${(N(v, 'n') - 1) * N(v, 'd')}) ÷ 2 = ${a}.`,
  }),
  t({
    sub: 'u04-05',
    prompt: 'იპოვე პირველი {n} წევრის ჯამი არითმეტიკული პროგრესიისთვის, რომლის პირველი წევრია {a}, ხოლო სხვაობა — {d}.',
    vars: { a: I(2, 15), d: I(2, 8), n: I(8, 20) },
    answer: (v) => sg(apSum(N(v, 'a'), N(v, 'd'), N(v, 'n'))),
    wrong: (v) => [N(v, 'n') * (N(v, 'a') + ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))), apSum(N(v, 'a'), N(v, 'd'), N(v, 'n') - 1), N(v, 'n') * N(v, 'a') + N(v, 'n') * N(v, 'd'), apSum(N(v, 'a'), N(v, 'd'), N(v, 'n')) + N(v, 'd')],
    why: (v, a) => `a${sub(N(v, 'n'))} = ${ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))}; S = ${v.n} · (${v.a} + ${ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))}) ÷ 2 = ${a}.`,
  }),
  t({
    sub: 'u04-05',
    prompt: 'არითმეტიკული პროგრესიის პირველი წევრია {a}, ხოლო {w} წევრი — {lS}. იპოვე პირველი {n} წევრის ჯამი.',
    vars: { a: I(20, 50), d: I(-6, -2), n: I(4, 8), l: D((v) => ap(N(v, 'a'), N(v, 'd'), N(v, 'n'))), lS: D((v) => sg(N(v, 'l'))), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => sg(apSum(N(v, 'a'), N(v, 'd'), N(v, 'n'))),
    wrong: (v) => [N(v, 'n') * (N(v, 'a') + N(v, 'l')), apSum(N(v, 'a'), N(v, 'd'), N(v, 'n') - 1), apSum(N(v, 'a'), N(v, 'd'), N(v, 'n') + 1), apSum(N(v, 'a'), N(v, 'd'), N(v, 'n')) + 5],
    why: (v, a) => `Sₙ = n(a₁ + aₙ)/2 = ${v.n} · (${v.a} + ${par(N(v, 'l'))}) ÷ 2 = ${a}.`,
  }),

  // ═════════ U04.6 — გეომეტრიული პროგრესია და მისი n-ური წევრი ═════════
  t({
    sub: 'u04-06',
    prompt: 'იპოვე გეომეტრიული პროგრესიის მნიშვნელი: {shown}, … .',
    vars: { b: I(1, 6), q: C([2, 3, 4, 5, -2, -3]), shown: D((v) => lst(terms(4, (i) => gp(N(v, 'b'), N(v, 'q'), i)))) },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => [N(v, 'q') + 1, N(v, 'q') - 1, -N(v, 'q'), (N(v, 'q') - 1) * N(v, 'b')],
    why: (v, a) => `q = მეორე წევრი ÷ პირველი წევრი = ${sg(gp(N(v, 'b'), N(v, 'q'), 2))} ÷ ${par(N(v, 'b'))} = ${a}.`,
  }),
  t({
    sub: 'u04-06',
    prompt: 'გეომეტრიული პროგრესიის პირველი წევრია {b}, ხოლო მნიშვნელი — {q}. ჩაწერე პირველი {n} წევრი.',
    vars: { b: I(1, 6), q: I(2, 4), n: I(4, 6) },
    answer: (v) => lst(terms(N(v, 'n'), (i) => gp(N(v, 'b'), N(v, 'q'), i))),
    options: (v, right) => {
      const [b, q, n] = [N(v, 'b'), N(v, 'q'), N(v, 'n')];
      return [right, ...listWrong(terms(n, (i) => ap(b, q, i)), terms(n, (i) => gp(b, q + 1, i)), terms(n, (i) => gp(b * q, q, i)), terms(n, (i) => b * i * q))];
    },
    why: (v, a) => `ყოველი წევრი წინაზე ${v.q}-ჯერ მეტია: ${a}.`,
  }),
  t({
    sub: 'u04-06',
    prompt: 'გეომეტრიული პროგრესიის პირველი წევრია {b}, ხოლო მნიშვნელი — {f}. იპოვე {w} წევრი.',
    vars: { p: I(2, 4), e: I(1, 3), n: I(3, 5), x: C([0, 1]), b: D((v) => N(v, 'e') * N(v, 'p') ** (N(v, 'n') - 1 + N(v, 'x'))), f: D((v) => `1/${N(v, 'p')}`), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => sg(N(v, 'b') / N(v, 'p') ** (N(v, 'n') - 1)),
    wrong: (v) => [N(v, 'b') / N(v, 'p') ** N(v, 'n'), N(v, 'b') / N(v, 'p') ** (N(v, 'n') - 1) * N(v, 'p'), N(v, 'b') - (N(v, 'n') - 1) * N(v, 'p'), N(v, 'b') / N(v, 'p') ** (N(v, 'n') - 1) + 1],
    why: (v, a) => `bₙ = b₁qⁿ⁻¹ = ${sg(N(v, 'b'))} ÷ ${v.p}${N(v, 'n') - 1 > 1 ? ` ${N(v, 'n') - 1}-ჯერ` : ''} = ${a}.`,
  }),
  t({
    sub: 'u04-06',
    prompt: 'მოცემულია გეომეტრიული პროგრესია: {shown}, … . იპოვე {w} წევრი.',
    vars: { b: I(1, 5), q: I(2, 4), n: I(5, 7), shown: D((v) => lst(terms(4, (i) => gp(N(v, 'b'), N(v, 'q'), i)))), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => sg(gp(N(v, 'b'), N(v, 'q'), N(v, 'n'))),
    wrong: (v) => [gp(N(v, 'b'), N(v, 'q'), N(v, 'n')) * N(v, 'q'), gp(N(v, 'b'), N(v, 'q'), N(v, 'n')) / N(v, 'q'), N(v, 'b') * N(v, 'q') * N(v, 'n'), gp(N(v, 'b'), N(v, 'q'), N(v, 'n')) + N(v, 'q')],
    why: (v, a) => `q = ${v.q}; bₙ = ${v.b} · ${N(v, 'q') ** (N(v, 'n') - 1)} = ${a}.`,
  }),
  t({
    sub: 'u04-06',
    prompt: 'გეომეტრიული პროგრესიის პირველი წევრია {b}, ხოლო მნიშვნელი — {q}. იპოვე {w} წევრი.',
    vars: { b: I(1, 6), q: I(2, 5), n: I(4, 6), w: D((v) => ord(N(v, 'n'))) },
    answer: (v) => sg(gp(N(v, 'b'), N(v, 'q'), N(v, 'n'))),
    wrong: (v) => [gp(N(v, 'b'), N(v, 'q'), N(v, 'n')) * N(v, 'q'), gp(N(v, 'b'), N(v, 'q'), N(v, 'n')) / N(v, 'q'), N(v, 'b') * N(v, 'q') * N(v, 'n'), (N(v, 'b') * N(v, 'q')) ** (N(v, 'n') - 1)],
    why: (v, a) => `bₙ = b₁qⁿ⁻¹ = ${v.b} · ${N(v, 'q') ** (N(v, 'n') - 1)} = ${a}.`,
  }),
  t({
    sub: 'u04-06',
    prompt: 'გეომეტრიული პროგრესიის ზოგადი წევრია bₙ = {c} · {p}ⁿ⁻¹. იპოვე b{ms}.',
    vars: { c: I(1, 6), p: I(2, 4), m: I(4, 7), ms: D((v) => sub(N(v, 'm'))) },
    answer: (v) => sg(N(v, 'c') * N(v, 'p') ** (N(v, 'm') - 1)),
    wrong: (v) => [N(v, 'c') * N(v, 'p') ** N(v, 'm'), N(v, 'c') * N(v, 'p') ** (N(v, 'm') - 2), (N(v, 'c') * N(v, 'p')) ** (N(v, 'm') - 1), N(v, 'c') * N(v, 'p') * (N(v, 'm') - 1)],
    why: (v, a) => `b${sub(N(v, 'm'))} = ${v.c} · ${v.p}${superscript(N(v, 'm') - 1)} = ${v.c} · ${N(v, 'p') ** (N(v, 'm') - 1)} = ${a}.`,
  }),

  // ═════════ U04.7 — გეომეტრიული პროგრესიის ჯამი ═════════
  t({
    sub: 'u04-07',
    prompt: 'იპოვე პირველი {n} წევრის ჯამი: {shown}.',
    vars: { b: I(1, 6), q: I(2, 4), n: I(4, 5), shown: D((v) => lst(terms(N(v, 'n'), (i) => gp(N(v, 'b'), N(v, 'q'), i)))) },
    answer: (v) => sg(gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n'))),
    wrong: (v) => [gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n')) + 1, gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n')) - 1, gp(N(v, 'b'), N(v, 'q'), N(v, 'n') + 1), gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n')) - N(v, 'b')],
    why: (v, a) => `${terms(N(v, 'n'), (i) => gp(N(v, 'b'), N(v, 'q'), i)).join(' + ')} = ${a}.`,
  }),
  t({
    sub: 'u04-07',
    prompt: 'გეომეტრიული პროგრესიის პირველი წევრია {b}, ხოლო მნიშვნელი — {q}. იპოვე პირველი {n} წევრის ჯამი.',
    vars: { b: I(1, 5), q: C([2, 3, 4]), n: I(4, 6) },
    answer: (v) => sg(gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n'))),
    wrong: (v) => [gp(N(v, 'b'), N(v, 'q'), N(v, 'n')), gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n') - 1), gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n')) + N(v, 'b'), (N(v, 'b') * (N(v, 'q') ** N(v, 'n') + 1)) / (N(v, 'q') - 1)],
    why: (v, a) => `Sₙ = b₁(qⁿ − 1)/(q − 1) = ${v.b} · (${N(v, 'q') ** N(v, 'n')} − 1) ÷ ${N(v, 'q') - 1} = ${a}.`,
  }),
  t({
    sub: 'u04-07',
    prompt: 'იპოვე პირველი {n} წევრის ჯამი: {shown}.',
    vars: { b: I(3, 8), q: I(2, 3), n: I(4, 5), shown: D((v) => lst(terms(N(v, 'n'), (i) => gp(N(v, 'b'), N(v, 'q'), i)))) },
    answer: (v) => sg(gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n'))),
    wrong: (v) => [gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n')) + 1, gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n')) - 1, gp(N(v, 'b'), N(v, 'q'), N(v, 'n') + 1), gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n')) - N(v, 'b')],
    why: (_v, a) => `ვკრებთ ყველა წევრს: ${a}.`,
  }),
  t({
    sub: 'u04-07',
    prompt: 'გეომეტრიული პროგრესიის პირველი წევრია {b}, ხოლო მნიშვნელი — {q}. იპოვე პირველი {n} წევრის ჯამი.',
    vars: { b: I(1, 4), q: I(3, 5), n: I(3, 5) },
    answer: (v) => sg(gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n'))),
    wrong: (v) => [gp(N(v, 'b'), N(v, 'q'), N(v, 'n')), gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n') - 1), gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n')) + N(v, 'b'), N(v, 'b') * N(v, 'q') ** N(v, 'n')],
    why: (v, a) => `Sₙ = ${v.b} · (${N(v, 'q') ** N(v, 'n')} − 1) ÷ ${N(v, 'q') - 1} = ${a}.`,
  }),
  t({
    sub: 'u04-07',
    prompt: 'იპოვე პირველი {n} წევრის ჯამი: {shown}.',
    vars: { b: I(1, 2), q: I(2, 3), n: I(4, 6), shown: D((v) => lst(terms(N(v, 'n'), (i) => gp(N(v, 'b'), N(v, 'q'), i)))) },
    answer: (v) => sg(gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n'))),
    wrong: (v) => [gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n')) + 1, gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n')) - 1, gp(N(v, 'b'), N(v, 'q'), N(v, 'n') + 1), gpSum(N(v, 'b'), N(v, 'q'), N(v, 'n')) + N(v, 'q')],
    why: (v, a) => `${String(v.shown).split(', ').join(' + ')} = ${a}.`,
  }),
  t({
    sub: 'u04-07',
    prompt: 'გეომეტრიული პროგრესიის პირველი წევრია {b}, ხოლო მნიშვნელი — {f}. იპოვე პირველი {n} წევრის ჯამი.',
    vars: { p: I(2, 3), e: I(1, 3), n: I(4, 6), b: D((v) => N(v, 'e') * N(v, 'p') ** (N(v, 'n') - 1)), f: D((v) => `1/${N(v, 'p')}`) },
    answer: (v) => sg((N(v, 'e') * (N(v, 'p') ** N(v, 'n') - 1)) / (N(v, 'p') - 1)),
    wrong: (v) => [N(v, 'b'), (N(v, 'e') * (N(v, 'p') ** N(v, 'n') - 1)) / (N(v, 'p') - 1) + N(v, 'e'), (N(v, 'e') * (N(v, 'p') ** (N(v, 'n') - 1) - 1)) / (N(v, 'p') - 1), N(v, 'b') * N(v, 'n')],
    why: (v, a) => `წევრებია ${terms(N(v, 'n'), (i) => N(v, 'b') / N(v, 'p') ** (i - 1)).join(', ')}; ჯამი ${a}.`,
  }),
];

/** The three numbers of a period given as `a,b,c`. */
function cycle(v: Vars): string[] {
  return String(v.p).split(',');
}

function pattern(form: number, m: number, i: number): number {
  if (form === 0) return (m + i - 1) ** 2;
  if (form === 1) return (m + i - 1) ** 3;
  if (form === 2) return ((m + i - 1) * (m + i)) / 2;
  return m * 2 ** (i - 1);
}

function superscript(n: number): string {
  const S = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  return [...String(n)].map((d) => S[Number(d)]!).join('');
}
