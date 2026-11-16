import type { QuestionTemplate } from './types';
import { C, D, I, MINUS, N, S, SPEC, q6, roundToPlace, sg } from './g6-helpers';

/**
 * Grade VI — Unit 2: მოქმედებები მთელ რიცხვებზე (whole-number operations).
 *
 * Converted from the academy's `U02` bank: 12 subtopics × 6 questions.
 *
 * The bank's questions are fixed products and quotients. Each template here is
 * the *pattern*: the factors are drawn so a quotient always divides exactly, a
 * „convenient" product always has a round partner, and an estimate never lands
 * on a rounding tie. Wrong options are the slips a student makes — a product one
 * multiple off, a zero lost or gained, evaluating left to right ignoring
 * priority — not near-neighbours picked at random.
 */

export const G6_U02_SUBTOPICS = [
  'u02-01', 'u02-02', 'u02-03', 'u02-04', 'u02-05', 'u02-06',
  'u02-07', 'u02-08', 'u02-09', 'u02-10', 'u02-11', 'u02-12',
] as const;

const T = 'g6-whole-ops';
let seq = 0;
const nextId = (): string => `g6-u02-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

const x = (a: number, b: number): string => `${sg(a)} × ${sg(b)}`;
const div = (a: number, b: number): string => `${sg(a)} ÷ ${sg(b)}`;

/** Slips of a product: one multiple too many or few, a lost or extra zero. */
const productSlips = (a: number, b: number): number[] => {
  const p = a * b;
  return [p + a, p - a, p + 10, p - 10, p * 10, p / 10, p + 100];
};
/** Slips of a quotient. */
const quotientSlips = (n: number): number[] => [n + 1, n - 1, n * 10, n / 10, n + 10, n - 10, n + 100];

const quotientAndRest = (a: number, b: number): string => `${Math.floor(a / b)}, ნაშთი ${a % b}`;

export const G6_U02_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U02.1 — მთელი რიცხვების ნამრავლი ═════════
  t({
    sub: 'u02-01',
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(120, 999), b: I(3, 9), e: D((v) => x(N(v, 'a'), N(v, 'b'))) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b')),
    wrong: (v) => productSlips(N(v, 'a'), N(v, 'b')),
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u02-01',
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(1200, 9999), b: I(3, 9), e: D((v) => x(N(v, 'a'), N(v, 'b'))) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b')),
    wrong: (v) => productSlips(N(v, 'a'), N(v, 'b')),
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u02-01',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(120, 999), b: I(11, 49), e: D((v) => x(N(v, 'a'), N(v, 'b'))) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b')),
    wrong: (v) => [N(v, 'a') * (N(v, 'b') - (N(v, 'b') % 10)) + N(v, 'a') * (N(v, 'b') % 10) * 10, ...productSlips(N(v, 'a'), N(v, 'b'))],
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u02-01',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(1000, 4999), b: I(12, 39), e: D((v) => x(N(v, 'a'), N(v, 'b'))) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b')),
    wrong: (v) => productSlips(N(v, 'a'), N(v, 'b')),
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u02-01',
    d: 2,
    prompt: 'ერთ ყუთში {a} ფურცელია. რამდენი ფურცელია {b} ასეთ ყუთში?',
    vars: { a: I(120, 480), b: I(12, 48) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b')),
    wrong: (v) => productSlips(N(v, 'a'), N(v, 'b')),
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'b')} = ${a}.`,
  }),
  t({
    sub: 'u02-01',
    d: 2,
    prompt: 'ქარხანა ერთ დღეში {a} ნაწილს ამზადებს. რამდენ ნაწილს დაამზადებს ის {b} დღეში?',
    vars: { a: I(205, 899), b: I(14, 36) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b')),
    wrong: (v) => productSlips(N(v, 'a'), N(v, 'b')),
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'b')} = ${a}.`,
  }),

  // ═════════ U02.2 — მთელი რიცხვების განაყოფი ═════════
  t({
    sub: 'u02-02',
    prompt: 'გამოთვალე: {e}.',
    vars: { b: I(3, 9), q: I(60, 199), a: D((v) => N(v, 'b') * N(v, 'q')), e: D((v) => div(N(v, 'a'), N(v, 'b'))) },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => quotientSlips(N(v, 'q')),
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u02-02',
    prompt: 'გამოთვალე: {e}.',
    vars: { b: I(3, 9), q: I(300, 999), a: D((v) => N(v, 'b') * N(v, 'q')), e: D((v) => div(N(v, 'a'), N(v, 'b'))) },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => quotientSlips(N(v, 'q')),
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u02-02',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: { b: I(11, 24), q: I(100, 420), a: D((v) => N(v, 'b') * N(v, 'q')), e: D((v) => div(N(v, 'a'), N(v, 'b'))) },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => quotientSlips(N(v, 'q')),
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u02-02',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: { b: I(18, 48), q: I(120, 400), a: D((v) => N(v, 'b') * N(v, 'q')), e: D((v) => div(N(v, 'a'), N(v, 'b'))) },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => quotientSlips(N(v, 'q')),
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u02-02',
    d: 2,
    prompt: '{aS} წიგნი თანაბრად გადაანაწილეს {b} თაროზე. რამდენი წიგნი მოთავსდა თითოეულ თაროზე?',
    vars: { b: I(12, 36), q: I(30, 90), a: D((v) => N(v, 'b') * N(v, 'q')), aS: S('a') },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => quotientSlips(N(v, 'q')),
    why: (v, a) => `${sg(N(v, 'a'))} ÷ ${N(v, 'b')} = ${a}.`,
  }),
  t({
    sub: 'u02-02',
    d: 2,
    prompt: 'სკოლაში {aS} მოსწავლეა. ისინი თანაბრად დაყვეს {b} ჯგუფად. რამდენი მოსწავლეა თითოეულ ჯგუფში?',
    vars: { b: I(8, 24), q: I(25, 80), a: D((v) => N(v, 'b') * N(v, 'q')), aS: S('a') },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => quotientSlips(N(v, 'q')),
    why: (v, a) => `${sg(N(v, 'a'))} ÷ ${N(v, 'b')} = ${a}.`,
  }),

  // ═════════ U02.3 — გამრავლების თვისებები ═════════
  t({
    sub: 'u02-03',
    prompt: 'გამოთვალე მოხერხებული ხერხით: {e}.',
    vars: {
      spec: SPEC(['25|16|4', '125|24|8', '25|12|4', '125|16|8', '50|13|2', '25|18|4', '125|32|8', '20|15|5', '250|14|4', '25|28|4']),
      a: D((v) => Number(String(v.spec).split('|')[0])),
      b: D((v) => Number(String(v.spec).split('|')[1])),
      c: D((v) => Number(String(v.spec).split('|')[2])),
      e: D((v) => `${x(N(v, 'a'), N(v, 'b'))} × ${N(v, 'c')}`),
    },
    answer: (v) => sg(N(v, 'a') * N(v, 'b') * N(v, 'c')),
    wrong: (v) => {
      const p = N(v, 'a') * N(v, 'b') * N(v, 'c');
      return [p / 10, p * 10, p + N(v, 'b'), p - N(v, 'b')];
    },
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'c')} = ${sg(N(v, 'a') * N(v, 'c'))}, ${sg(N(v, 'a') * N(v, 'c'))} × ${N(v, 'b')} = ${a}.`,
  }),
  t({
    sub: 'u02-03',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: {
      a: I(12, 49), b: I(6, 17),
      c: I(3, 14),
      e: D((v) => `${N(v, 'a')} × ${N(v, 'b')} + ${N(v, 'a')} × ${N(v, 'c')}`),
    },
    answer: (v) => sg(N(v, 'a') * (N(v, 'b') + N(v, 'c'))),
    wrong: (v) => {
      const a = N(v, 'a'), b = N(v, 'b'), c = N(v, 'c');
      return [a * b + c, a + b * c, a * b * c, a * (b + c) + a];
    },
    why: (v, a) => `${N(v, 'a')} × (${N(v, 'b')} + ${N(v, 'c')}) = ${N(v, 'a')} × ${N(v, 'b') + N(v, 'c')} = ${a}.`,
  }),
  t({
    sub: 'u02-03',
    d: 2,
    prompt: 'გამოიყენე განაწილებადობის თვისება და გამოთვალე: {e}.',
    vars: {
      a: I(12, 79), k: I(1, 9), side: C([1, -1]),
      b: D((v) => 100 + N(v, 'side') * N(v, 'k')),
      e: D((v) => x(N(v, 'a'), N(v, 'b'))),
    },
    answer: (v) => sg(N(v, 'a') * N(v, 'b')),
    wrong: (v) => {
      const a = N(v, 'a'), k = N(v, 'k');
      return [a * 100 + k, a * 100 - k, a * 100 + a * k * -N(v, 'side'), a * 10 * 10 + a * k * 10 * N(v, 'side')];
    },
    why: (v, a) => `${N(v, 'a')} × (100 ${N(v, 'side') > 0 ? '+' : MINUS} ${N(v, 'k')}) = ${sg(N(v, 'a') * 100)} ${N(v, 'side') > 0 ? '+' : MINUS} ${sg(N(v, 'a') * N(v, 'k'))} = ${a}.`,
  }),
  t({
    sub: 'u02-03',
    d: 2,
    prompt: 'შეავსე გამოტოვებული რიცხვი: {a} × {b} = {a} × {t} + {a} × □.',
    vars: { a: I(12, 59), t: C([10, 20, 30]), k: I(2, 9), b: D((v) => N(v, 't') + N(v, 'k')) },
    answer: (v) => String(N(v, 'k')),
    wrong: (v) => [N(v, 'b'), N(v, 't'), N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'a')],
    why: (v, a) => `${N(v, 'b')} = ${N(v, 't')} + ${a}, ამიტომ □ = ${a}.`,
  }),
  t({
    sub: 'u02-03',
    d: 2,
    prompt: 'შეავსე გამოტოვებული რიცხვი: {a} × {b} = {a} × (□ + {k}).',
    vars: { a: I(12, 59), m: I(2, 9), k: C([3, 4, 5, 6]), b: D((v) => 10 * N(v, 'm') + N(v, 'k')) },
    answer: (v) => String(10 * N(v, 'm')),
    wrong: (v) => [N(v, 'b'), N(v, 'm'), 10 * N(v, 'm') + 10, 10 * N(v, 'm') - 10, N(v, 'k')],
    why: (v, a) => `${N(v, 'b')} = ${a} + ${N(v, 'k')}, ამიტომ □ = ${a}.`,
  }),
  t({
    sub: 'u02-03',
    prompt: 'გამოთვალე მოხერხებული ხერხით: {e}.',
    vars: {
      spec: SPEC(['5|17|20', '2|13|50', '4|9|25', '5|23|20', '2|37|50', '4|11|25', '8|7|125', '5|31|20', '2|19|50', '4|15|25']),
      a: D((v) => Number(String(v.spec).split('|')[0])),
      b: D((v) => Number(String(v.spec).split('|')[1])),
      c: D((v) => Number(String(v.spec).split('|')[2])),
      e: D((v) => `${N(v, 'a')} × ${N(v, 'b')} × ${N(v, 'c')}`),
    },
    answer: (v) => sg(N(v, 'a') * N(v, 'b') * N(v, 'c')),
    wrong: (v) => {
      const p = N(v, 'a') * N(v, 'b') * N(v, 'c');
      return [p / 10, p * 10, p + N(v, 'b'), p - N(v, 'b')];
    },
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'c')} = ${sg(N(v, 'a') * N(v, 'c'))}, ${sg(N(v, 'a') * N(v, 'c'))} × ${N(v, 'b')} = ${a}.`,
  }),

  // ═════════ U02.4 — გაყოფის თვისებები ═════════
  t({
    sub: 'u02-04',
    prompt: 'გამოთვალე: {e}.',
    vars: { c: I(3, 12), m: I(10, 90), n: I(10, 90), e: D((v) => `(${sg(N(v, 'c') * N(v, 'm'))} + ${sg(N(v, 'c') * N(v, 'n'))}) ÷ ${N(v, 'c')}`) },
    answer: (v) => sg(N(v, 'm') + N(v, 'n')),
    wrong: (v) => [N(v, 'm') + N(v, 'n') * N(v, 'c'), N(v, 'm') * N(v, 'n'), N(v, 'm') + N(v, 'n') + 1, N(v, 'm') + N(v, 'n') - 1],
    why: (v, a) => `${String(v.e)} = ${N(v, 'm')} + ${N(v, 'n')} = ${a}.`,
  }),
  t({
    sub: 'u02-04',
    prompt: 'გამოთვალე: {e}.',
    vars: { c: I(3, 12), m: I(30, 99), n: I(10, 29), e: D((v) => `(${sg(N(v, 'c') * N(v, 'm'))} ${MINUS} ${sg(N(v, 'c') * N(v, 'n'))}) ÷ ${N(v, 'c')}`) },
    answer: (v) => sg(N(v, 'm') - N(v, 'n')),
    wrong: (v) => [N(v, 'm') + N(v, 'n'), N(v, 'm') - N(v, 'n') * N(v, 'c'), N(v, 'm') - N(v, 'n') + 1, N(v, 'm') - N(v, 'n') - 1],
    why: (v, a) => `${String(v.e)} = ${N(v, 'm')} ${MINUS} ${N(v, 'n')} = ${a}.`,
  }),
  t({
    sub: 'u02-04',
    d: 2,
    prompt: 'შეამოწმე, სწორია თუ არა ტოლობა: {e}.',
    vars: {
      kind: C(['ok', 'bad']),
      b: I(2, 9), c: I(2, 9), k: I(10, 99),
      a: D((v) => N(v, 'b') * N(v, 'c') * N(v, 'k')),
      e: D((v) =>
        String(v.kind) === 'ok'
          ? `${sg(N(v, 'a'))} ÷ (${N(v, 'b')} × ${N(v, 'c')}) = ${sg(N(v, 'a'))} ÷ ${N(v, 'b')} ÷ ${N(v, 'c')}`
          : `${sg(N(v, 'a'))} ÷ (${N(v, 'b')} × ${N(v, 'c')}) = ${sg(N(v, 'a'))} ÷ ${N(v, 'b')} × ${N(v, 'c')}`,
      ),
    },
    optionCount: 2,
    answer: (v) => (String(v.kind) === 'ok' ? 'სწორია' : 'არასწორია'),
    options: (v, right) => [right, String(v.kind) === 'ok' ? 'არასწორია' : 'სწორია'],
    why: (v, a) =>
      `${sg(N(v, 'a'))} ÷ (${N(v, 'b')} × ${N(v, 'c')}) = ${N(v, 'k')}, ხოლო მეორე მხარე ${String(v.kind) === 'ok' ? `ასევე ${N(v, 'k')}` : sg(N(v, 'a') / N(v, 'b') * N(v, 'c'))}; ტოლობა ${a}.`,
  }),
  t({
    sub: 'u02-04',
    prompt: 'იპოვე უცნობი რიცხვი: {aS} ÷ □ = {q}.',
    vars: { b: I(4, 49), q: I(6, 60), a: D((v) => N(v, 'b') * N(v, 'q')), aS: S('a') },
    answer: (v) => sg(N(v, 'b')),
    wrong: (v) => [N(v, 'q'), N(v, 'a') - N(v, 'q'), N(v, 'b') + 1, N(v, 'b') - 1, N(v, 'b') * 2],
    why: (v, a) => `${sg(N(v, 'a'))} ÷ ${a} = ${N(v, 'q')}, ამიტომ □ = ${a}.`,
  }),
  t({
    sub: 'u02-04',
    d: 2,
    prompt: 'შეავსე გამოტოვებული რიცხვი: {aS} ÷ ({b} × {c}) = {aS} ÷ {b} ÷ □.',
    vars: { b: I(2, 9), c: I(2, 9), k: I(12, 99), a: D((v) => N(v, 'b') * N(v, 'c') * N(v, 'k')), aS: S('a') },
    answer: (v) => String(N(v, 'c')),
    wrong: (v) => [N(v, 'b'), N(v, 'b') * N(v, 'c'), N(v, 'k'), N(v, 'c') + 1, N(v, 'c') - 1],
    why: (_v, a) => `რიცხვის ორ მამრავლზე გაყოფა ერთმანეთის მიყოლებით გაყოფის ტოლია, ამიტომ □ = ${a}.`,
  }),
  t({
    sub: 'u02-04',
    prompt: 'გამოთვალე: {e}.',
    vars: { b: I(12, 36), q: I(40, 200), a: D((v) => N(v, 'b') * N(v, 'q')), e: D((v) => div(N(v, 'a'), N(v, 'b'))) },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => quotientSlips(N(v, 'q')),
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),

  // ═════════ U02.5 — ნულით დამთავრებული რიცხვების გამრავლება ═════════
  t({
    sub: 'u02-05',
    prompt: 'გამოთვალე: {e}.',
    vars: { m: I(12, 99), n: I(2, 9), e: D((v) => x(N(v, 'm') * 10, N(v, 'n') * 10)) },
    answer: (v) => sg(N(v, 'm') * N(v, 'n') * 100),
    wrong: (v) => [N(v, 'm') * N(v, 'n') * 10, N(v, 'm') * N(v, 'n') * 1000, N(v, 'm') * N(v, 'n'), N(v, 'm') * N(v, 'n') * 100 + 100],
    why: (v, a) => `${N(v, 'm')} × ${N(v, 'n')} = ${sg(N(v, 'm') * N(v, 'n'))}, ბოლოში ვამატებთ ორ ნულს: ${a}.`,
  }),
  t({
    sub: 'u02-05',
    prompt: 'გამოთვალე: {e}.',
    vars: { m: I(12, 99), n: I(2, 9), e: D((v) => x(N(v, 'm') * 10, N(v, 'n') * 100)) },
    answer: (v) => sg(N(v, 'm') * N(v, 'n') * 1000),
    wrong: (v) => [N(v, 'm') * N(v, 'n') * 100, N(v, 'm') * N(v, 'n') * 10000, N(v, 'm') * N(v, 'n'), N(v, 'm') * N(v, 'n') * 1000 + 1000],
    why: (v, a) => `${N(v, 'm')} × ${N(v, 'n')} = ${sg(N(v, 'm') * N(v, 'n'))}, ბოლოში ვამატებთ სამ ნულს: ${a}.`,
  }),
  t({
    sub: 'u02-05',
    prompt: 'გამოთვალე: {e}.',
    vars: { m: I(12, 99), n: I(2, 9), e: D((v) => x(N(v, 'm') * 100, N(v, 'n') * 10)) },
    answer: (v) => sg(N(v, 'm') * N(v, 'n') * 1000),
    wrong: (v) => [N(v, 'm') * N(v, 'n') * 100, N(v, 'm') * N(v, 'n') * 10000, N(v, 'm') * N(v, 'n') * 10, N(v, 'm') * N(v, 'n') * 1000 - 1000],
    why: (v, a) => `${N(v, 'm')} × ${N(v, 'n')} = ${sg(N(v, 'm') * N(v, 'n'))}, ბოლოში ვამატებთ სამ ნულს: ${a}.`,
  }),
  t({
    sub: 'u02-05',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: { m: I(12, 99), n: I(12, 99), e: D((v) => x(N(v, 'm') * 100, N(v, 'n') * 10)) },
    answer: (v) => sg(N(v, 'm') * N(v, 'n') * 1000),
    wrong: (v) => [N(v, 'm') * N(v, 'n') * 100, N(v, 'm') * N(v, 'n') * 10000, N(v, 'm') * N(v, 'n') * 10, N(v, 'm') * N(v, 'n') * 1000 + 10],
    why: (v, a) => `${N(v, 'm')} × ${N(v, 'n')} = ${sg(N(v, 'm') * N(v, 'n'))}, ბოლოში ვამატებთ სამ ნულს: ${a}.`,
  }),
  t({
    sub: 'u02-05',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: { m: I(12, 49), n: I(12, 49), e: D((v) => x(N(v, 'm') * 1000, N(v, 'n') * 10)) },
    answer: (v) => sg(N(v, 'm') * N(v, 'n') * 10000),
    wrong: (v) => [N(v, 'm') * N(v, 'n') * 1000, N(v, 'm') * N(v, 'n') * 100000, N(v, 'm') * N(v, 'n') * 100, N(v, 'm') * N(v, 'n') * 10000 + 10],
    why: (v, a) => `${N(v, 'm')} × ${N(v, 'n')} = ${sg(N(v, 'm') * N(v, 'n'))}, ბოლოში ვამატებთ ოთხ ნულს: ${a}.`,
  }),
  t({
    sub: 'u02-05',
    d: 2,
    prompt: 'ერთ საწარმოში ყოველდღე {a} დეტალს ამზადებენ. რამდენ დეტალს დაამზადებენ {b} დღეში?',
    vars: { m: I(12, 69), n: I(2, 9), a: D((v) => N(v, 'm') * 10), b: D((v) => N(v, 'n') * 10 + 10 * (N(v, 'n') % 3)) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b')),
    wrong: (v) => [N(v, 'a') * N(v, 'b') / 10, N(v, 'a') * N(v, 'b') * 10, N(v, 'a') * N(v, 'b') + 100, N(v, 'a') * N(v, 'b') - 100],
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'b')} = ${a}.`,
  }),

  // ═════════ U02.6 — ნულით დამთავრებული რიცხვების გაყოფა ═════════
  t({
    sub: 'u02-06',
    prompt: 'გამოთვალე: {e}.',
    vars: { b: I(2, 9), q: I(12, 99), a: D((v) => N(v, 'b') * 10 * N(v, 'q') * 10), e: D((v) => div(N(v, 'a'), N(v, 'b') * 10)) },
    answer: (v) => sg(N(v, 'q') * 10),
    wrong: (v) => [N(v, 'q'), N(v, 'q') * 100, N(v, 'q') * 10 + 10, N(v, 'q') * 10 - 10],
    why: (v, a) => `ორივე რიცხვს ერთი ნულით ვამოკლებთ: ${sg(N(v, 'b') * N(v, 'q') * 10)} ÷ ${N(v, 'b')} = ${a}.`,
  }),
  t({
    sub: 'u02-06',
    prompt: 'გამოთვალე: {e}.',
    vars: { b: I(2, 9), q: I(12, 99), a: D((v) => N(v, 'b') * 100 * N(v, 'q') * 10), e: D((v) => div(N(v, 'a'), N(v, 'b') * 100)) },
    answer: (v) => sg(N(v, 'q') * 10),
    wrong: (v) => [N(v, 'q'), N(v, 'q') * 100, N(v, 'q') * 10 + 10, N(v, 'q') * 10 - 10],
    why: (_v, a) => `ორივე რიცხვს ორი ნულით ვამოკლებთ და ვყოფთ: ${a}.`,
  }),
  t({
    sub: 'u02-06',
    prompt: 'გამოთვალე: {e}.',
    vars: { b: I(2, 9), q: I(12, 99), a: D((v) => N(v, 'b') * 100 * N(v, 'q') * 100), e: D((v) => div(N(v, 'a'), N(v, 'b') * 100)) },
    answer: (v) => sg(N(v, 'q') * 100),
    wrong: (v) => [N(v, 'q') * 10, N(v, 'q') * 1000, N(v, 'q'), N(v, 'q') * 100 + 100],
    why: (_v, a) => `ორივე რიცხვს ორი ნულით ვამოკლებთ და ვყოფთ: ${a}.`,
  }),
  t({
    sub: 'u02-06',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: { b: I(2, 9), q: I(12, 99), a: D((v) => N(v, 'b') * 1000 * N(v, 'q') * 100), e: D((v) => div(N(v, 'a'), N(v, 'b') * 1000)) },
    answer: (v) => sg(N(v, 'q') * 100),
    wrong: (v) => [N(v, 'q') * 10, N(v, 'q') * 1000, N(v, 'q'), N(v, 'q') * 100 + 100],
    why: (_v, a) => `ორივე რიცხვს სამი ნულით ვამოკლებთ და ვყოფთ: ${a}.`,
  }),
  t({
    sub: 'u02-06',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: { b: I(12, 49), q: I(12, 99), a: D((v) => N(v, 'b') * 1000 * N(v, 'q') * 10), e: D((v) => div(N(v, 'a'), N(v, 'b') * 1000)) },
    answer: (v) => sg(N(v, 'q') * 10),
    wrong: (v) => [N(v, 'q'), N(v, 'q') * 100, N(v, 'q') * 10 + 10, N(v, 'q') * 10 - 10],
    why: (_v, a) => `ორივე რიცხვს სამი ნულით ვამოკლებთ და ვყოფთ: ${a}.`,
  }),
  t({
    sub: 'u02-06',
    d: 2,
    prompt: '{aS} კგ მარცვლეული თანაბრად გაანაწილეს {b} სატვირთო მანქანაში. რამდენი კილოგრამი მარცვლეული გადაიტანა თითოეულმა მანქანამ?',
    vars: { m: I(2, 12), q: I(12, 60), b: D((v) => N(v, 'm') * 10), a: D((v) => N(v, 'b') * N(v, 'q') * 100), aS: S('a') },
    answer: (v) => sg(N(v, 'q') * 100),
    wrong: (v) => [N(v, 'q') * 10, N(v, 'q') * 1000, N(v, 'q'), N(v, 'q') * 100 + 100],
    why: (v, a) => `${sg(N(v, 'a'))} ÷ ${N(v, 'b')} = ${a} (კგ).`,
  }),

  // ═════════ U02.7 — დიდი რიცხვების გაყოფა ═════════
  t({
    sub: 'u02-07',
    prompt: 'გამოთვალე: {e}.',
    vars: { b: I(12, 36), q: I(300, 1500), a: D((v) => N(v, 'b') * N(v, 'q')), e: D((v) => div(N(v, 'a'), N(v, 'b'))) },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => quotientSlips(N(v, 'q')),
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u02-07',
    prompt: 'გამოთვალე: {e}.',
    vars: { b: I(24, 72), q: I(500, 2500), a: D((v) => N(v, 'b') * N(v, 'q')), e: D((v) => div(N(v, 'a'), N(v, 'b'))) },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => quotientSlips(N(v, 'q')),
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u02-07',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: { b: I(36, 99), q: I(1000, 4000), a: D((v) => N(v, 'b') * N(v, 'q')), e: D((v) => div(N(v, 'a'), N(v, 'b'))) },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => quotientSlips(N(v, 'q')),
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u02-07',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: { b: C([125, 150, 175, 225, 250, 125, 375]), q: I(300, 2400), a: D((v) => N(v, 'b') * N(v, 'q')), e: D((v) => div(N(v, 'a'), N(v, 'b'))) },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => quotientSlips(N(v, 'q')),
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u02-07',
    d: 2,
    prompt: 'ბიბლიოთეკაში {aS} წიგნი თანაბრად გადაანაწილეს {b} ოთახში. რამდენი წიგნი მოხვდა თითოეულ ოთახში?',
    vars: { b: I(24, 72), q: I(600, 2500), a: D((v) => N(v, 'b') * N(v, 'q')), aS: S('a') },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => quotientSlips(N(v, 'q')),
    why: (v, a) => `${sg(N(v, 'a'))} ÷ ${N(v, 'b')} = ${a}.`,
  }),
  t({
    sub: 'u02-07',
    d: 2,
    prompt: 'სტადიონზე {aS} მაყურებელი {b} სექტორში თანაბრად განაწილდა. რამდენი მაყურებელი იყო თითოეულ სექტორში?',
    vars: { b: I(12, 48), q: I(400, 1800), a: D((v) => N(v, 'b') * N(v, 'q')), aS: S('a') },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => quotientSlips(N(v, 'q')),
    why: (v, a) => `${sg(N(v, 'a'))} ÷ ${N(v, 'b')} = ${a}.`,
  }),

  // ═════════ U02.8 — სამი ან მეტი რიცხვის ნამრავლი ═════════
  t({
    sub: 'u02-08',
    prompt: 'გამოთვალე: {e}.',
    vars: {
      spec: SPEC(['4|7|25', '8|13|125', '4|9|25', '2|17|50', '8|11|125', '4|23|25', '5|19|20', '2|31|50', '8|15|125', '4|31|25']),
      a: D((v) => Number(String(v.spec).split('|')[0])),
      b: D((v) => Number(String(v.spec).split('|')[1])),
      c: D((v) => Number(String(v.spec).split('|')[2])),
      e: D((v) => `${N(v, 'a')} × ${N(v, 'b')} × ${N(v, 'c')}`),
    },
    answer: (v) => sg(N(v, 'a') * N(v, 'b') * N(v, 'c')),
    wrong: (v) => { const p = N(v, 'a') * N(v, 'b') * N(v, 'c'); return [p + N(v, 'b'), p - N(v, 'b'), p * 10, p / 10]; },
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u02-08',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(11, 29), b: I(2, 9), c: I(11, 29), e: D((v) => `${N(v, 'a')} × ${N(v, 'b')} × ${N(v, 'c')}`) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b') * N(v, 'c')),
    wrong: (v) => { const p = N(v, 'a') * N(v, 'b') * N(v, 'c'); return [p + N(v, 'a'), p - N(v, 'c'), p * 10, p / 10]; },
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u02-08',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: {
      spec: SPEC(['5|18|20|4', '5|12|20|3', '2|35|50|4', '5|14|20|6', '25|7|4|8', '5|16|20|3', '2|45|50|7', '25|9|4|6']),
      a: D((v) => Number(String(v.spec).split('|')[0])),
      b: D((v) => Number(String(v.spec).split('|')[1])),
      c: D((v) => Number(String(v.spec).split('|')[2])),
      d: D((v) => Number(String(v.spec).split('|')[3])),
      e: D((v) => `${N(v, 'a')} × ${N(v, 'b')} × ${N(v, 'c')} × ${N(v, 'd')}`),
    },
    answer: (v) => sg(N(v, 'a') * N(v, 'b') * N(v, 'c') * N(v, 'd')),
    wrong: (v) => { const p = N(v, 'a') * N(v, 'b') * N(v, 'c') * N(v, 'd'); return [p / 10, p * 10, p + N(v, 'b'), p - N(v, 'd')]; },
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u02-08',
    d: 2,
    prompt: 'დარბაზში {a} რიგია, თითოეულ რიგში {b} სკამია, ხოლო თითოეულ სკამზე ერთი ადამიანი ჯდება. რამდენ ადამიანს იტევს დარბაზი?',
    vars: { a: I(12, 36), b: I(14, 38) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b')),
    wrong: (v) => productSlips(N(v, 'a'), N(v, 'b')),
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'b')} = ${a}.`,
  }),
  t({
    sub: 'u02-08',
    d: 2,
    prompt: '{a} ყუთიდან თითოეულში {b} პაკეტია, ხოლო თითოეულ პაკეტში {c} ფანქარია. რამდენი ფანქარია სულ?',
    vars: { a: I(6, 24), b: I(8, 20), c: I(10, 24) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b') * N(v, 'c')),
    wrong: (v) => { const p = N(v, 'a') * N(v, 'b') * N(v, 'c'); return [N(v, 'a') * N(v, 'b'), N(v, 'b') * N(v, 'c'), p + N(v, 'c'), p - N(v, 'a')]; },
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'b')} × ${N(v, 'c')} = ${a}.`,
  }),
  t({
    sub: 'u02-08',
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(2, 9), b: I(2, 9), c: I(2, 9), d: I(2, 9), e: D((v) => `${N(v, 'a')} × ${N(v, 'b')} × ${N(v, 'c')} × ${N(v, 'd')}`) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b') * N(v, 'c') * N(v, 'd')),
    wrong: (v) => { const p = N(v, 'a') * N(v, 'b') * N(v, 'c') * N(v, 'd'); return [p + N(v, 'a'), p - N(v, 'b'), p + 10, p - 10]; },
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),

  // ═════════ U02.9 — ნამრავლისა და განაყოფის მიახლოებითი შეფასება ═════════
  t({
    sub: 'u02-09',
    prompt: 'შეაფასე {a} × {b} ნამრავლის მნიშვნელობა, ორივე რიცხვის უახლოეს ათეულამდე დამრგვალებით.',
    vars: { a: I(121, 999), b: I(21, 99) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 5 && N(v, 'b') % 10 !== 5, note: 'no rounding tie' }],
    answer: (v) => sg(roundToPlace(N(v, 'a'), 10) * roundToPlace(N(v, 'b'), 10)),
    wrong: (v) => {
      const a = N(v, 'a'), b = N(v, 'b');
      return [Math.floor(a / 10) * 10 * (Math.floor(b / 10) * 10), Math.ceil(a / 10) * 10 * (Math.ceil(b / 10) * 10), roundToPlace(a, 100) * roundToPlace(b, 100), roundToPlace(a, 10) * roundToPlace(b, 10) / 10, a * b];
    },
    why: (v, a) => `${sg(roundToPlace(N(v, 'a'), 10))} × ${sg(roundToPlace(N(v, 'b'), 10))} = ${a}.`,
  }),
  t({
    sub: 'u02-09',
    d: 2,
    prompt: 'შეაფასე {aS} ÷ {b} განაყოფის მნიშვნელობა: გასაყოფი დაამრგვალე უახლოეს ასეულამდე, გამყოფი — უახლოეს ათეულამდე.',
    vars: { bb: I(2, 8), k: I(1, 9), n1: I(-40, 40), n2: I(-4, 4), a: D((v) => 100 * N(v, 'bb') * N(v, 'k') + N(v, 'n1')), aS: S('a'), b: D((v) => 10 * N(v, 'bb') + N(v, 'n2')) },
    constraints: [{ test: (v) => N(v, 'n2') !== 0 && N(v, 'n1') !== 0, note: 'really needs rounding' }],
    answer: (v) => sg(10 * N(v, 'k')),
    wrong: (v) => [N(v, 'k'), 100 * N(v, 'k'), 10 * N(v, 'k') + 10, 10 * N(v, 'k') - 10, Math.round(N(v, 'a') / N(v, 'b'))],
    why: (v, a) => `${sg(roundToPlace(N(v, 'a'), 100))} ÷ ${sg(roundToPlace(N(v, 'b'), 10))} = ${a}.`,
  }),
  t({
    sub: 'u02-09',
    d: 2,
    prompt: 'შეაფასე {a} × {b} ნამრავლის მნიშვნელობა: პირველი რიცხვი დაამრგვალე უახლოეს ასეულამდე, მეორე — უახლოეს ათეულამდე.',
    vars: { a: I(201, 899), b: I(21, 99) },
    constraints: [{ test: (v) => N(v, 'a') % 100 !== 50 && N(v, 'b') % 10 !== 5, note: 'no rounding tie' }],
    answer: (v) => sg(roundToPlace(N(v, 'a'), 100) * roundToPlace(N(v, 'b'), 10)),
    wrong: (v) => {
      const a = N(v, 'a'), b = N(v, 'b');
      return [roundToPlace(a, 10) * roundToPlace(b, 10), roundToPlace(a, 100) * roundToPlace(b, 100), roundToPlace(a, 100) * roundToPlace(b, 10) / 10, roundToPlace(a, 100) * roundToPlace(b, 10) * 10];
    },
    why: (v, a) => `${sg(roundToPlace(N(v, 'a'), 100))} × ${sg(roundToPlace(N(v, 'b'), 10))} = ${a}.`,
  }),
  t({
    sub: 'u02-09',
    d: 2,
    prompt: 'შეაფასე {aS} ÷ {b} განაყოფის მნიშვნელობა: გასაყოფი დაამრგვალე უახლოეს ათასეულამდე, გამყოფი — უახლოეს ათეულამდე.',
    vars: { bb: I(2, 9), k: I(1, 9), n1: I(-300, 300), n2: I(-4, 4), a: D((v) => 1000 * N(v, 'bb') * N(v, 'k') + N(v, 'n1')), aS: S('a'), b: D((v) => 10 * N(v, 'bb') + N(v, 'n2')) },
    constraints: [{ test: (v) => N(v, 'n2') !== 0 && N(v, 'n1') !== 0, note: 'really needs rounding' }],
    answer: (v) => sg(100 * N(v, 'k')),
    wrong: (v) => [10 * N(v, 'k'), 1000 * N(v, 'k'), 100 * N(v, 'k') + 100, 100 * N(v, 'k') - 100, Math.round(N(v, 'a') / N(v, 'b'))],
    why: (v, a) => `${sg(roundToPlace(N(v, 'a'), 1000))} ÷ ${sg(roundToPlace(N(v, 'b'), 10))} = ${a}.`,
  }),
  t({
    sub: 'u02-09',
    prompt: 'დაახლოებით რამდენია {aS} × {b}, თუ {aS} დავამრგვალებთ {raS}-მდე, ხოლო {b}-ს — {rb}-მდე?',
    vars: {
      ra: C([1000, 2000, 3000, 4000, 5000]), rb: C([20, 30, 40, 50, 60]),
      da: I(-40, 40, { nonZero: true }), db: I(-4, 4, { nonZero: true }),
      a: D((v) => N(v, 'ra') + N(v, 'da')), aS: S('a'), raS: S('ra'), b: D((v) => N(v, 'rb') + N(v, 'db')),
    },
    answer: (v) => sg(N(v, 'ra') * N(v, 'rb')),
    wrong: (v) => [N(v, 'a') * N(v, 'b'), N(v, 'ra') * N(v, 'rb') / 10, N(v, 'ra') * N(v, 'rb') * 10, N(v, 'ra') * N(v, 'rb') + N(v, 'ra')],
    why: (v, a) => `${sg(N(v, 'ra'))} × ${N(v, 'rb')} = ${a}.`,
  }),
  t({
    sub: 'u02-09',
    d: 2,
    prompt: 'შეაფასე {aS} × {b} ნამრავლის მნიშვნელობა: პირველი რიცხვი დაამრგვალე უახლოეს ათასეულამდე, მეორე — უახლოეს ათეულამდე.',
    vars: { a: I(2101, 8899), aS: S('a'), b: I(21, 99) },
    constraints: [{ test: (v) => N(v, 'a') % 1000 !== 500 && N(v, 'b') % 10 !== 5, note: 'no rounding tie' }],
    answer: (v) => sg(roundToPlace(N(v, 'a'), 1000) * roundToPlace(N(v, 'b'), 10)),
    wrong: (v) => {
      const a = N(v, 'a'), b = N(v, 'b');
      return [roundToPlace(a, 100) * roundToPlace(b, 10), roundToPlace(a, 1000) * roundToPlace(b, 100), roundToPlace(a, 1000) * roundToPlace(b, 10) / 10, roundToPlace(a, 1000) * roundToPlace(b, 10) * 10];
    },
    why: (v, a) => `${sg(roundToPlace(N(v, 'a'), 1000))} × ${sg(roundToPlace(N(v, 'b'), 10))} = ${a}.`,
  }),

  // ═════════ U02.10 — გამრავლებისა და გაყოფის ამოცანები ═════════
  t({
    sub: 'u02-10',
    prompt: 'ერთ ყუთში {a} ფანქარია. რამდენი ფანქარია {b} ასეთ ყუთში?',
    vars: { a: I(24, 96), b: I(24, 64) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b')),
    wrong: (v) => productSlips(N(v, 'a'), N(v, 'b')),
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'b')} = ${a}.`,
  }),
  t({
    sub: 'u02-10',
    prompt: '{aS} წიგნი თანაბრად გადაანაწილეს {b} კლასში. რამდენი წიგნი მიიღო თითოეულმა კლასმა?',
    vars: { b: I(15, 45), q: I(40, 120), a: D((v) => N(v, 'b') * N(v, 'q')), aS: S('a') },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => quotientSlips(N(v, 'q')),
    why: (v, a) => `${sg(N(v, 'a'))} ÷ ${N(v, 'b')} = ${a}.`,
  }),
  t({
    sub: 'u02-10',
    prompt: 'ქარხანა საათში {a} სათამაშოს ამზადებს. რამდენ სათამაშოს დაამზადებს ის {b} საათში?',
    vars: { a: I(215, 690), b: I(12, 36) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b')),
    wrong: (v) => productSlips(N(v, 'a'), N(v, 'b')),
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'b')} = ${a}.`,
  }),
  t({
    sub: 'u02-10',
    prompt: '{aS} კგ კარტოფილი თანაბრად ჩატვირთეს {b} სატვირთო მანქანაში. რამდენი კილოგრამი კარტოფილი გადაიტანა თითოეულმა მანქანამ?',
    vars: { b: I(14, 42), q: I(120, 480), a: D((v) => N(v, 'b') * N(v, 'q')), aS: S('a') },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => quotientSlips(N(v, 'q')),
    why: (v, a) => `${sg(N(v, 'a'))} ÷ ${N(v, 'b')} = ${a}.`,
  }),
  t({
    sub: 'u02-10',
    d: 2,
    prompt: 'მაღაზიამ მიიღო {a} ყუთი, თითოეულში {b} ბოთლით. თუ ყველა ბოთლი თანაბრად გადაანაწილეს {c} მაღაზიაში, რამდენი ბოთლი მიიღო თითოეულმა მაღაზიამ?',
    vars: { c: I(5, 25), m: I(2, 9), a: D((v) => N(v, 'c') * N(v, 'm')), b: I(12, 60) },
    constraints: [{ test: (v) => (N(v, 'a') * N(v, 'b')) % N(v, 'c') === 0, note: 'divides exactly' }],
    answer: (v) => sg((N(v, 'a') * N(v, 'b')) / N(v, 'c')),
    wrong: (v) => { const r = (N(v, 'a') * N(v, 'b')) / N(v, 'c'); return [N(v, 'a') * N(v, 'b'), N(v, 'a') * N(v, 'b') * N(v, 'c'), r + N(v, 'b'), r * 10, r - N(v, 'm')]; },
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'b')} = ${sg(N(v, 'a') * N(v, 'b'))}, ${sg(N(v, 'a') * N(v, 'b'))} ÷ ${N(v, 'c')} = ${a}.`,
  }),
  t({
    sub: 'u02-10',
    d: 2,
    prompt: 'სკოლამ {a} კომპლექტი შეიძინა, თითოეულ კომპლექტში {b} წიგნით. წიგნები თანაბრად გადაანაწილეს {c} კლასში. რამდენი წიგნი მიიღო თითოეულმა კლასმა?',
    vars: { c: I(6, 24), m: I(2, 9), a: D((v) => N(v, 'c') * N(v, 'm')), b: I(12, 60) },
    constraints: [{ test: (v) => (N(v, 'a') * N(v, 'b')) % N(v, 'c') === 0, note: 'divides exactly' }],
    answer: (v) => sg((N(v, 'a') * N(v, 'b')) / N(v, 'c')),
    wrong: (v) => { const r = (N(v, 'a') * N(v, 'b')) / N(v, 'c'); return [N(v, 'a') * N(v, 'b'), N(v, 'a') * N(v, 'b') * N(v, 'c'), r + N(v, 'b'), r * 10, r - N(v, 'm')]; },
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'b')} = ${sg(N(v, 'a') * N(v, 'b'))}, ${sg(N(v, 'a') * N(v, 'b'))} ÷ ${N(v, 'c')} = ${a}.`,
  }),

  // ═════════ U02.11 — გაყოფა ნაშთით ═════════
  t({
    sub: 'u02-11',
    prompt: 'გაყავი {aS} რიცხვზე {b}. იპოვე განაყოფი და ნაშთი.',
    vars: { b: I(7, 19), a: I(100, 400), aS: S('a') },
    constraints: [{ test: (v) => N(v, 'a') % N(v, 'b') !== 0, note: 'a real remainder' }],
    answer: (v) => quotientAndRest(N(v, 'a'), N(v, 'b')),
    options: (v, right) => restOptions(N(v, 'a'), N(v, 'b'), right),
    why: (v, a) => `${sg(N(v, 'a'))} = ${N(v, 'b')} × ${Math.floor(N(v, 'a') / N(v, 'b'))} + ${N(v, 'a') % N(v, 'b')}: ${a}.`,
  }),
  t({
    sub: 'u02-11',
    prompt: 'გაყავი {aS} რიცხვზე {b}. იპოვე განაყოფი და ნაშთი.',
    vars: { b: I(12, 29), a: I(300, 900), aS: S('a') },
    constraints: [{ test: (v) => N(v, 'a') % N(v, 'b') !== 0, note: 'a real remainder' }],
    answer: (v) => quotientAndRest(N(v, 'a'), N(v, 'b')),
    options: (v, right) => restOptions(N(v, 'a'), N(v, 'b'), right),
    why: (v, a) => `${sg(N(v, 'a'))} = ${N(v, 'b')} × ${Math.floor(N(v, 'a') / N(v, 'b'))} + ${N(v, 'a') % N(v, 'b')}: ${a}.`,
  }),
  t({
    sub: 'u02-11',
    d: 2,
    prompt: 'გაყავი {aS} რიცხვზე {b}. იპოვე განაყოფი და ნაშთი.',
    vars: { b: I(25, 48), a: I(600, 1500), aS: S('a') },
    constraints: [{ test: (v) => N(v, 'a') % N(v, 'b') !== 0, note: 'a real remainder' }],
    answer: (v) => quotientAndRest(N(v, 'a'), N(v, 'b')),
    options: (v, right) => restOptions(N(v, 'a'), N(v, 'b'), right),
    why: (v, a) => `${sg(N(v, 'a'))} = ${N(v, 'b')} × ${Math.floor(N(v, 'a') / N(v, 'b'))} + ${N(v, 'a') % N(v, 'b')}: ${a}.`,
  }),
  t({
    sub: 'u02-11',
    d: 2,
    prompt: '{aS} კანფეტი უნდა გადანაწილდეს {b} ბავშვს თანაბრად. რამდენ კანფეტს მიიღებს თითოეული ბავშვი და რამდენი დარჩება?',
    vars: { b: I(7, 25), a: I(120, 400), aS: S('a') },
    constraints: [{ test: (v) => N(v, 'a') % N(v, 'b') !== 0, note: 'a real remainder' }],
    answer: (v) => quotientAndRest(N(v, 'a'), N(v, 'b')),
    options: (v, right) => restOptions(N(v, 'a'), N(v, 'b'), right),
    why: (v, a) => `${N(v, 'a')} ÷ ${N(v, 'b')}: ${a}.`,
  }),
  t({
    sub: 'u02-11',
    d: 2,
    prompt: 'რამდენი სრული ყუთის შევსებაა შესაძლებელი {aS} ფანქრით, თუ თითოეულ ყუთში {b} ფანქარი ეტევა? რამდენი ფანქარი დარჩება?',
    vars: { b: I(12, 36), a: I(300, 900), aS: S('a') },
    constraints: [{ test: (v) => N(v, 'a') % N(v, 'b') !== 0, note: 'a real remainder' }],
    answer: (v) => quotientAndRest(N(v, 'a'), N(v, 'b')),
    options: (v, right) => restOptions(N(v, 'a'), N(v, 'b'), right),
    why: (v, a) => `${N(v, 'a')} ÷ ${N(v, 'b')}: ${a}.`,
  }),
  t({
    sub: 'u02-11',
    d: 2,
    prompt: '{aS} მოსწავლე ჯგუფებად უნდა დაიყოს, თითოეულ ჯგუფში {b} მოსწავლით. რამდენი სრული ჯგუფი შეიქმნება და რამდენი მოსწავლე დარჩება ჯგუფის გარეშე?',
    vars: { b: I(14, 36), a: I(500, 1500), aS: S('a') },
    constraints: [{ test: (v) => N(v, 'a') % N(v, 'b') !== 0, note: 'a real remainder' }],
    answer: (v) => quotientAndRest(N(v, 'a'), N(v, 'b')),
    options: (v, right) => restOptions(N(v, 'a'), N(v, 'b'), right),
    why: (v, a) => `${sg(N(v, 'a'))} ÷ ${N(v, 'b')}: ${a}.`,
  }),

  // ═════════ U02.12 — რიცხვითი გამოსახულებების შედგენა ═════════
  t({
    sub: 'u02-12',
    prompt: 'შეადგინე და გამოთვალე გამოსახულება: {a}-ს დაუმატე {b}-ისა და {c}-ის ნამრავლი.',
    vars: { a: I(20, 99), b: I(6, 19), c: I(3, 9) },
    answer: (v) => sg(N(v, 'a') + N(v, 'b') * N(v, 'c')),
    wrong: (v) => [(N(v, 'a') + N(v, 'b')) * N(v, 'c'), N(v, 'a') + N(v, 'b') + N(v, 'c'), N(v, 'a') * N(v, 'b') + N(v, 'c'), N(v, 'a') + N(v, 'b') * N(v, 'c') + 10],
    why: (v, a) => `${N(v, 'a')} + ${N(v, 'b')} × ${N(v, 'c')} = ${a}.`,
  }),
  t({
    sub: 'u02-12',
    prompt: 'შეადგინე და გამოთვალე გამოსახულება: {a} გაყავი {b}-ზე, შემდეგ კი შედეგს გამოაკელი {c}.',
    vars: { b: I(4, 12), q: I(20, 60), c: I(3, 17), a: D((v) => N(v, 'b') * N(v, 'q')) },
    answer: (v) => sg(N(v, 'q') - N(v, 'c')),
    wrong: (v) => [N(v, 'a') / (N(v, 'b') + N(v, 'c')), N(v, 'a') - N(v, 'c'), N(v, 'q') + N(v, 'c'), (N(v, 'a') - N(v, 'c')) / N(v, 'b')],
    why: (v, a) => `${sg(N(v, 'a'))} ÷ ${N(v, 'b')} ${MINUS} ${N(v, 'c')} = ${N(v, 'q')} ${MINUS} ${N(v, 'c')} = ${a}.`,
  }),
  t({
    sub: 'u02-12',
    prompt: 'შეადგინე და გამოთვალე გამოსახულება: {a}-ისა და {b}-ის ჯამი გაამრავლე {c}-ზე.',
    vars: { a: I(15, 60), b: I(12, 45), c: I(3, 9) },
    answer: (v) => sg((N(v, 'a') + N(v, 'b')) * N(v, 'c')),
    wrong: (v) => [N(v, 'a') + N(v, 'b') * N(v, 'c'), N(v, 'a') * N(v, 'c') + N(v, 'b'), N(v, 'a') + N(v, 'b') + N(v, 'c'), (N(v, 'a') + N(v, 'b')) * N(v, 'c') + 10],
    why: (v, a) => `(${N(v, 'a')} + ${N(v, 'b')}) × ${N(v, 'c')} = ${a}.`,
  }),
  t({
    sub: 'u02-12',
    prompt: 'შეადგინე და გამოთვალე გამოსახულება: {a}-ს გამოაკელი {b}-ისა და {c}-ის განაყოფი.',
    vars: { c: I(2, 9), m: I(8, 40), a: I(300, 900), b: D((v) => N(v, 'c') * N(v, 'm')) },
    answer: (v) => sg(N(v, 'a') - N(v, 'm')),
    wrong: (v) => [(N(v, 'a') - N(v, 'b')) / N(v, 'c'), N(v, 'a') - N(v, 'b'), N(v, 'a') - N(v, 'c'), N(v, 'a') - N(v, 'm') + 10],
    why: (v, a) => `${N(v, 'a')} ${MINUS} ${N(v, 'b')} ÷ ${N(v, 'c')} = ${N(v, 'a')} ${MINUS} ${N(v, 'm')} = ${a}.`,
  }),
  t({
    sub: 'u02-12',
    d: 2,
    prompt: 'სად უნდა ჩაისვას ფრჩხილები, რომ ტოლობა სწორი გახდეს: {a} {op} {b} × {c} = {target}?',
    vars: {
      op: C(['+', MINUS]), a: I(20, 60), b: I(4, 15), c: I(3, 9),
      target: D((v) => (String(v.op) === '+' ? N(v, 'a') + N(v, 'b') : N(v, 'a') - N(v, 'b')) * N(v, 'c')),
    },
    constraints: [{ test: (v) => N(v, 'a') > N(v, 'b') && N(v, 'target') > 0, note: 'positive and different from the unbracketed value' }],
    answer: (v) => `(${N(v, 'a')} ${String(v.op)} ${N(v, 'b')}) × ${N(v, 'c')}`,
    options: (v, right) => [right, `${N(v, 'a')} ${String(v.op)} (${N(v, 'b')} × ${N(v, 'c')})`, 'ფრჩხილები საჭირო არ არის', 'ტოლობა ვერც ერთი ხერხით ვერ გახდება სწორი'],
    why: (v, a) => `${a} = ${N(v, 'target')}.`,
  }),
  t({
    sub: 'u02-12',
    d: 2,
    prompt: 'გამოთვალე გამოსახულება მოქმედებების სწორი თანმიმდევრობით: {e}.',
    vars: {
      b: I(4, 12), q: I(5, 40), c: I(5, 20), d: I(3, 9), f: I(5, 40),
      a: D((v) => N(v, 'b') * N(v, 'q')),
      e: D((v) => `${sg(N(v, 'a'))} ÷ ${N(v, 'b')} + ${N(v, 'c')} × ${N(v, 'd')} ${MINUS} ${N(v, 'f')}`),
    },
    constraints: [{ test: (v) => N(v, 'q') + N(v, 'c') * N(v, 'd') - N(v, 'f') > 0, note: 'positive result' }],
    answer: (v) => sg(N(v, 'q') + N(v, 'c') * N(v, 'd') - N(v, 'f')),
    wrong: (v) => [((N(v, 'q') + N(v, 'c')) * N(v, 'd')) - N(v, 'f'), N(v, 'q') + N(v, 'c') * (N(v, 'd') - N(v, 'f')), N(v, 'q') + N(v, 'c') * N(v, 'd') + N(v, 'f'), N(v, 'q') + N(v, 'c') * N(v, 'd') - N(v, 'f') + 10],
    why: (v, a) => `ჯერ ვყოფთ და ვამრავლებთ: ${N(v, 'q')} + ${N(v, 'c') * N(v, 'd')} ${MINUS} ${N(v, 'f')} = ${a}.`,
  }),
];

// ─────────────────────────── local helpers ───────────────────────────

/** `q, ნაშთი r` and the mistakes around it: a remainder as big as the divisor, the divisor's complement, the pair swapped. */
function restOptions(a: number, b: number, right: string): string[] {
  const qt = Math.floor(a / b);
  const r = a % b;
  return [
    right,
    `${qt + 1}, ნაშთი ${b - r}`,
    `${qt - 1}, ნაშთი ${r + b}`,
    `${qt}, ნაშთი ${b - r}`,
    `${qt + 1}, ნაშთი ${r}`,
    `${r}, ნაშთი ${qt}`,
  ];
}
