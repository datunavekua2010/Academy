import type { QuestionTemplate } from './types';
import { C, D, I, MINUS, N, SIGNS, fText, fr, gcd, mText, q6, sg, sign3 } from './g6-helpers';
import { PLACE_GEN, PLACE_NOM, dd, ds, fx, pow10, roundAt, sc, truncAt } from './g6-dec';

/**
 * Grade VI — Unit 5: ათწილადები.
 *
 * Converted from the academy's `U05` bank: 14 subtopics × 6 questions.
 *
 * A decimal is drawn as an integer and a number of places, so every key is
 * computed in integers. Operands keep their printed trailing zeros where the
 * lesson needs them (`12,340` against `12,34`), results are printed trimmed,
 * and wrong options are the slips of the topic: a place shifted, digits added
 * as if they were whole numbers, a number truncated instead of rounded.
 */

export const G6_U05_SUBTOPICS = [
  'u05-01', 'u05-02', 'u05-03', 'u05-04', 'u05-05', 'u05-06', 'u05-07',
  'u05-08', 'u05-09', 'u05-10', 'u05-11', 'u05-12', 'u05-13', 'u05-14',
] as const;

const T = 'g6-decimals';
let seq = 0;
const nextId = (): string => `g6-u05-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

const ints = (xs: number[]): string[] => xs.map(ds);
/** Slips of a decimal result, as printed strings. */
const shifts = (r: number, extra: number[] = []): string[] => ints([...extra, r * 10, r / 10, r + 0.1, r - 0.1, r + 1, r - 1, r * 100, r / 100]);
const exact = (x: number): number => Math.round(x * 1e8) / 1e8;

const NOM = ['', 'მეათედი', 'მეასედი', 'მეათასედი'];
const sig = (a: number): number => (a % 10 === 0 ? 1 : 0);
void sig;


export const G6_U05_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U05.1 — ათწილადების მნიშვნელობა და გამოყენება ═════════
  t({
    sub: 'u05-01',
    prompt: 'ჩაწერე წილადი {f} ათწილადის სახით.',
    vars: { p: C([1, 2, 3]), n: I(1, 99), f: D((v) => `${N(v, 'n')}/${pow10(N(v, 'p'))}`) },
    constraints: [{ test: (v) => N(v, 'n') < pow10(N(v, 'p')) && N(v, 'n') % 10 !== 0, note: 'a proper fraction, no trailing zero' }],
    answer: (v) => dd(N(v, 'n'), N(v, 'p')),
    wrong: () => [],
    options: (v, right) => {
      const n = N(v, 'n'), p = N(v, 'p');
      return [right, dd(n, p + 1), dd(n, Math.max(p - 1, 0)), `0,${String(n).split('').reverse().join('')}`, fx(n * 10, 0).length > 0 ? ds(n) : ''].filter(Boolean);
    },
    why: (v, a) => `მნიშვნელში ${pow10(N(v, 'p'))}-ია, ამიტომ მძიმის შემდეგ ${N(v, 'p')} ციფრია: ${String(v.f)} = ${a}.`,
  }),
  t({
    sub: 'u05-01',
    prompt: 'ჩაწერე ათწილადი {x} ჩვეულებრივი წილადის სახით და გაამარტივე.',
    vars: { p: C([1, 2, 3]), a: I(1, 999), x: D((v) => fx(N(v, 'a'), N(v, 'p'))) },
    constraints: [{ test: (v) => N(v, 'a') < pow10(N(v, 'p')) && N(v, 'a') % 10 !== 0 && gcd(N(v, 'a'), pow10(N(v, 'p'))) > 1 && N(v, 'a') >= pow10(N(v, 'p') - 1), note: 'reduces, uses all its places' }],
    answer: (v) => fText(fr(N(v, 'a'), pow10(N(v, 'p')))),
    options: (v, right) => {
      const a = N(v, 'a'), p = N(v, 'p');
      const r = fr(a, pow10(p));
      return [right, `${r.n}/${r.d * 10}`, `${r.n}/${r.d % 10 === 0 ? r.d / 10 : r.d * 2}`, `${r.d}/${r.n}`, `${r.n + 1}/${r.d}`, `${r.n}/${r.d + 1}`];
    },
    why: (v, a) => `${String(v.x)} = ${N(v, 'a')}/${pow10(N(v, 'p'))} = ${a}.`,
  }),
  t({
    sub: 'u05-01',
    prompt: 'ჩაწერე {m} ათწილადის სახით.',
    vars: { w: I(1, 20), n: I(1, 99), m: D((v) => `${N(v, 'w')} ${N(v, 'n')}/100`) },
    constraints: [{ test: (v) => N(v, 'n') % 10 !== 0 && N(v, 'n') < 100 && gcd(N(v, 'n'), 100) === 1, note: 'a lowest-terms hundredths part' }],
    answer: (v) => dd(N(v, 'w') * 100 + N(v, 'n'), 2),
    options: (v, right) => {
      const w = N(v, 'w'), n = N(v, 'n');
      return [right, dd(w * 1000 + n, 3), dd(w * 10 + n, 1), `${w},${n < 10 ? '0' : ''}${n}`.length ? ds(w + n / 10) : '', ds(w + n)].filter(Boolean);
    },
    why: (v, a) => `${N(v, 'n')}/100 = ${dd(N(v, 'n'), 2)}, ამიტომ ${String(v.m)} = ${a}.`,
  }),
  t({
    sub: 'u05-01',
    d: 2,
    prompt: 'რიცხვში {x} რას აღნიშნავს ციფრი {g}?',
    vars: {
      w: I(1, 99), d1: I(0, 9), d2: I(0, 9), d3: I(0, 9), k: C([1, 2, 3]),
      x: D((v) => fx(N(v, 'w') * 1000 + N(v, 'd1') * 100 + N(v, 'd2') * 10 + N(v, 'd3'), 3)),
      g: D((v) => [N(v, 'd1'), N(v, 'd2'), N(v, 'd3')][N(v, 'k') - 1]!),
    },
    constraints: [{ test: (v) => { const g = String(N(v, 'g')); const x = String(v.x); return x.split(g).length === 2 && N(v, 'g') !== 0 && N(v, 'd3') !== 0; }, note: 'the digit occurs once' }],
    answer: (v) => `${N(v, 'g')} ${PLACE_NOM[N(v, 'k')]}`,
    options: (v, right) => [right, ...[0, 1, 2, 3].filter((k) => k !== N(v, 'k')).map((k) => `${N(v, 'g')} ${PLACE_NOM[k]}`)],
    why: (v, a) => `ციფრი ${N(v, 'g')} მძიმის შემდეგ ${N(v, 'k')}-ე ადგილზეა: ${a}.`,
  }),
  t({
    sub: 'u05-01',
    prompt: 'ჩაწერე ათწილადის სახით: {w} მთელი და {n} {name}.',
    vars: {
      k: C([1, 2, 3]), w: I(1, 20), n: I(1, 99),
      name: D((v) => NOM[N(v, 'k')]!),
    },
    constraints: [{ test: (v) => N(v, 'n') < pow10(N(v, 'k')) && N(v, 'n') % 10 !== 0 && (N(v, 'k') > 1 || N(v, 'n') < 10) && (N(v, 'k') < 3 || N(v, 'n') >= 10), note: 'a fitting numerator' }],
    answer: (v) => dd(N(v, 'w') * pow10(N(v, 'k')) + N(v, 'n'), N(v, 'k')),
    options: (v, right) => {
      const w = N(v, 'w'), n = N(v, 'n'), k = N(v, 'k');
      return [right, ds(w + n / 10 ** Math.max(k - 1, 0) / (k === 1 ? 10 : 1)), dd(w * pow10(k + 1) + n, k + 1), dd(w * pow10(k) + n, Math.max(k - 1, 0)), dd(w * 100 + n, 2), dd(w * 10 + n, 1)];
    },
    why: (v, a) => `${N(v, 'n')} ${String(v.name)} ჩავწეროთ ${N(v, 'k')} ციფრით მძიმის შემდეგ: ${a}.`,
  }),
  t({
    sub: 'u05-01',
    prompt: 'მაღაზიაში ერთი კილოგრამი ვაშლი ღირს {x} ლარი. რამდენი ლარი ღირს {k} კგ ვაშლი?',
    vars: { a: I(110, 899), k: I(2, 9), x: D((v) => fx(N(v, 'a'), 2)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0, note: 'real hundredths' }],
    answer: (v) => `${dd(N(v, 'a') * N(v, 'k'), 2)} ლარი`,
    wrong: () => [],
    options: (v, right) => {
      const r = (N(v, 'a') * N(v, 'k')) / 100;
      return [right, ...shifts(r, [N(v, 'a') / 100 + N(v, 'k')]).map((x) => `${x} ლარი`)];
    },
    why: (v, a) => `${String(v.x)} × ${N(v, 'k')} = ${a}.`,
  }),

  // ═════════ U05.2 — ათწილადების თანრიგები ═════════
  ...[1, 2, 3].map((k) =>
    t({
      sub: 'u05-02',
      d: k === 1 ? 1 : 2,
      prompt: `რიცხვში {x} რომელი ციფრია ${PLACE_GEN[k]} თანრიგში?`,
      vars: {
        w: I(1, 99), d1: I(0, 9), d2: I(0, 9), d3: I(0, 9),
        x: D((v) => fx(N(v, 'w') * 1000 + N(v, 'd1') * 100 + N(v, 'd2') * 10 + N(v, 'd3'), 3)),
      },
      constraints: [{ test: (v) => N(v, 'd3') !== 0 && new Set([N(v, 'd1'), N(v, 'd2'), N(v, 'd3')]).size === 3, note: 'three different decimal digits' }],
      answer: (v) => String([N(v, 'd1'), N(v, 'd2'), N(v, 'd3')][k - 1]),
      wrong: (v) => [N(v, 'd1'), N(v, 'd2'), N(v, 'd3'), N(v, 'w') % 10].filter((d) => d !== [N(v, 'd1'), N(v, 'd2'), N(v, 'd3')][k - 1]),
      why: (_v, a) => `მძიმის შემდეგ ${k}-ე ციფრია ${a}.`,
    }),
  ),
  t({
    sub: 'u05-02',
    d: 2,
    prompt: 'გაშალე რიცხვი {x} თანრიგების ჯამის სახით.',
    vars: {
      w: I(10, 99), d1: I(0, 9), d2: I(0, 9), d3: I(1, 9),
      x: D((v) => fx(N(v, 'w') * 1000 + N(v, 'd1') * 100 + N(v, 'd2') * 10 + N(v, 'd3'), 3)),
    },
    answer: (v) => expansion(N(v, 'w'), [N(v, 'd1'), N(v, 'd2'), N(v, 'd3')], 0),
    options: (v, right) => [right, expansion(N(v, 'w'), [N(v, 'd1'), N(v, 'd2'), N(v, 'd3')], 1), expansion(N(v, 'w'), [N(v, 'd2'), N(v, 'd1'), N(v, 'd3')], 0), expansion(N(v, 'w'), [N(v, 'd1'), N(v, 'd3'), N(v, 'd2')], 0), expansion(N(v, 'w'), [N(v, 'd3'), N(v, 'd2'), N(v, 'd1')], 0), expansion(N(v, 'w'), [N(v, 'd1'), N(v, 'd2'), N(v, 'd3')], 2), expansion(N(v, 'w') * 10, [N(v, 'd1'), N(v, 'd2'), N(v, 'd3')], 0)],
    why: (v, a) => `${String(v.x)} = ${a}.`,
  }),
  t({
    sub: 'u05-02',
    prompt: 'რა მნიშვნელობა აქვს ციფრ {g}-ს რიცხვში {x}?',
    vars: {
      w: I(1, 99), d1: I(1, 9), d2: I(1, 9), d3: I(1, 9), k: C([1, 2, 3]),
      x: D((v) => fx(N(v, 'w') * 1000 + N(v, 'd1') * 100 + N(v, 'd2') * 10 + N(v, 'd3'), 3)),
      g: D((v) => [N(v, 'd1'), N(v, 'd2'), N(v, 'd3')][N(v, 'k') - 1]!),
    },
    constraints: [{ test: (v) => new Set([N(v, 'd1'), N(v, 'd2'), N(v, 'd3')]).size === 3 && !String(N(v, 'w')).includes(String(N(v, 'g'))), note: 'the digit occurs once' }],
    answer: (v) => ds(N(v, 'g') / 10 ** N(v, 'k')),
    options: (v, right) => [right, ...[0, 1, 2, 3].filter((k) => k !== N(v, 'k')).map((k) => ds(N(v, 'g') / 10 ** k))].slice(0, 5),
    why: (v, a) => `ციფრი ${N(v, 'g')} ${PLACE_GEN[N(v, 'k')]} თანრიგშია, ამიტომ მისი მნიშვნელობაა ${a}.`,
  }),
  t({
    sub: 'u05-02',
    prompt: 'ჩაწერე რიცხვი, რომელშიც არის {w} მთელი, {a} მეათედი, {b} მეასედი და {c} მეათასედი.',
    vars: { w: I(1, 99), a: I(0, 9), b: I(0, 9), c: I(1, 9) },
    answer: (v) => dd(N(v, 'w') * 1000 + N(v, 'a') * 100 + N(v, 'b') * 10 + N(v, 'c'), 3),
    options: (v, right) => [right, dd(N(v, 'w') * 1000 + N(v, 'c') * 100 + N(v, 'b') * 10 + N(v, 'a'), 3), dd(N(v, 'w') * 1000 + N(v, 'b') * 100 + N(v, 'a') * 10 + N(v, 'c'), 3), `${N(v, 'w')}${N(v, 'a')},${N(v, 'b')}${N(v, 'c')}`, dd((N(v, 'w') * 100 + N(v, 'a') * 10 + N(v, 'b')) * 10 + N(v, 'c'), 4)],
    why: (v, a) => `მთელი ნაწილი ${N(v, 'w')}, შემდეგ მძიმე და ციფრები თანრიგების მიხედვით: ${a}.`,
  }),
  t({
    sub: 'u05-02',
    prompt: 'შეავსე გამოტოვებული ციფრი: {w},{d1}□{d3}. თუ {place} ციფრია {g}, რა ციფრი უნდა ჩაწერო?',
    vars: { w: I(1, 9), d1: I(1, 9), d3: I(1, 9), g: I(0, 9), place: D(() => 'მეასედების') },
    constraints: [{ test: (v) => N(v, 'g') !== N(v, 'd1') && N(v, 'g') !== N(v, 'd3'), note: 'the answer is not already printed' }],
    answer: (v) => String(N(v, 'g')),
    wrong: (v) => [N(v, 'd1'), N(v, 'd3'), N(v, 'w'), (N(v, 'g') + 1) % 10, (N(v, 'g') + 9) % 10].filter((d) => d !== N(v, 'g')),
    why: (_v, a) => `გამოტოვებული ციფრი მეასედების თანრიგშია, ამიტომ □ = ${a}.`,
  }),

  // ═════════ U05.3 — ათწილადები და შერეული რიცხვები ═════════
  t({
    sub: 'u05-03',
    prompt: 'ჩაწერე ათწილადი {x} შერეული რიცხვის სახით.',
    vars: { w: I(1, 20), p: C([2, 3]), n: I(1, 999), x: D((v) => fx(N(v, 'w') * pow10(N(v, 'p')) + N(v, 'n'), N(v, 'p'))) },
    constraints: [{ test: (v) => N(v, 'n') < pow10(N(v, 'p')) && N(v, 'n') % 10 !== 0 && gcd(N(v, 'n'), pow10(N(v, 'p'))) > 1 && N(v, 'n') >= pow10(N(v, 'p') - 1), note: 'a reducible fractional part' }],
    answer: (v) => `${N(v, 'w')} ${fText(fr(N(v, 'n'), pow10(N(v, 'p'))))}`,
    options: (v, right) => {
      const r = fr(N(v, 'n'), pow10(N(v, 'p')));
      const w = N(v, 'w');
      return [right, `${w} ${r.n}/${r.d * 10}`, `${w} ${r.d}/${r.n}`, `${w + 1} ${r.n}/${r.d}`, `${w} ${r.n}/${r.d % 10 === 0 ? r.d / 10 : r.d * 2}`];
    },
    why: (v, a) => `${String(v.x)} = ${N(v, 'w')} ${N(v, 'n')}/${pow10(N(v, 'p'))} = ${a}.`,
  }),
  t({
    sub: 'u05-03',
    prompt: 'ჩაწერე {m} ათწილადის სახით.',
    vars: { w: I(1, 12), n: I(1, 9), m: D((v) => `${N(v, 'w')} ${N(v, 'n')}/10`) },
    answer: (v) => dd(N(v, 'w') * 10 + N(v, 'n'), 1),
    wrong: (v) => [N(v, 'w') + N(v, 'n') / 100, N(v, 'w') * 10 + N(v, 'n'), N(v, 'w') + N(v, 'n'), N(v, 'n') + N(v, 'w') / 10],
    why: (v, a) => `${N(v, 'n')}/10 = ${dd(N(v, 'n'), 1)}, ამიტომ ${String(v.m)} = ${a}.`,
  }),
  t({
    sub: 'u05-03',
    prompt: 'ჩაწერე {m} ათწილადის სახით.',
    vars: { w: I(1, 12), n: I(1, 99), m: D((v) => `${N(v, 'w')} ${N(v, 'n')}/100`) },
    constraints: [{ test: (v) => N(v, 'n') % 10 !== 0 && N(v, 'n') > 9, note: 'two real digits' }],
    answer: (v) => dd(N(v, 'w') * 100 + N(v, 'n'), 2),
    wrong: (v) => [N(v, 'w') + N(v, 'n') / 10, N(v, 'w') + N(v, 'n') / 1000, N(v, 'w') * 100 + N(v, 'n'), N(v, 'w') + N(v, 'n')],
    why: (v, a) => `${N(v, 'n')}/100 = ${dd(N(v, 'n'), 2)}, ამიტომ ${String(v.m)} = ${a}.`,
  }),
  t({
    sub: 'u05-03',
    d: 2,
    prompt: 'ჩაწერე {m} ათწილადის სახით.',
    vars: { w: I(1, 12), den: C([4, 5, 20, 25]), n: I(1, 24), m: D((v) => `${N(v, 'w')} ${N(v, 'n')}/${N(v, 'den')}`) },
    constraints: [{ test: (v) => N(v, 'n') < N(v, 'den') && gcd(N(v, 'n'), N(v, 'den')) === 1, note: 'lowest-terms proper part' }],
    answer: (v) => ds(N(v, 'w') + N(v, 'n') / N(v, 'den')),
    wrong: (v) => [N(v, 'w') + N(v, 'n') / 10, N(v, 'w') + N(v, 'n') / 100, N(v, 'w') + N(v, 'n') / (N(v, 'den') * 10), N(v, 'w') + N(v, 'den') / N(v, 'n') / 10],
    why: (v, a) => `${N(v, 'n')}/${N(v, 'den')} = ${ds(N(v, 'n') / N(v, 'den'))}, ამიტომ ${String(v.m)} = ${a}.`,
  }),
  t({
    sub: 'u05-03',
    d: 2,
    prompt: 'ჩაწერე ათწილადი {x} ჩვეულებრივი წილადის სახით და გაამარტივე.',
    vars: { a: I(125, 999), x: D((v) => fx(N(v, 'a'), 3)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0 && gcd(N(v, 'a'), 1000) > 1 && N(v, 'a') < 1000, note: 'reducible thousandths' }],
    answer: (v) => fText(fr(N(v, 'a'), 1000)),
    options: (v, right) => {
      const r = fr(N(v, 'a'), 1000);
      return [right, `${r.n}/${r.d * 10}`, `${r.n}/${r.d % 10 === 0 ? r.d / 10 : r.d * 2}`, `${r.d}/${r.n}`, `${r.n + 1}/${r.d}`];
    },
    why: (v, a) => `${String(v.x)} = ${N(v, 'a')}/1 000 = ${a}.`,
  }),
  t({
    sub: 'u05-03',
    d: 2,
    prompt: 'ჩაწერე ათწილადი {x} შერეული რიცხვის სახით.',
    vars: { w: I(1, 12), n: I(1, 9), x: D((v) => fx(N(v, 'w') * 10 + N(v, 'n'), 1)) },
    constraints: [{ test: (v) => gcd(N(v, 'n'), 10) > 1, note: 'the tenths part reduces' }],
    answer: (v) => `${N(v, 'w')} ${fText(fr(N(v, 'n'), 10))}`,
    options: (v, right) => [right, `${N(v, 'w')} ${N(v, 'n')}/${100}`, `${N(v, 'w')} 10/${N(v, 'n')}`, `${N(v, 'w') + 1} ${fText(fr(N(v, 'n'), 10))}`, `${N(v, 'n')} ${fText(fr(N(v, 'w'), 10))}`],
    why: (v, a) => `${String(v.x)} = ${N(v, 'w')} ${N(v, 'n')}/10 = ${a}.`,
  }),

  // ═════════ U05.4 — ათწილადების შედარება და დალაგება ═════════
  t({
    sub: 'u05-04',
    prompt: 'ჩასვი შესაბამისი ნიშანი: {x} □ {y}.',
    vars: { a: I(10, 99), b: I(100, 999), x: D((v) => fx(N(v, 'a'), 1)), y: D((v) => fx(N(v, 'b'), 2)) },
    constraints: [{ test: (v) => Math.abs(N(v, 'a') * 10 - N(v, 'b')) < 40 && N(v, 'b') % 10 !== 0 && N(v, 'a') % 10 !== 0, note: 'close values' }],
    optionCount: 3,
    answer: (v) => sign3(N(v, 'a') * 10, N(v, 'b')),
    options: () => SIGNS,
    why: (v, a) => `${fx(N(v, 'a') * 10, 2)} ${a} ${String(v.y)}, ამიტომ ${String(v.x)} ${a} ${String(v.y)}.`,
  }),
  t({
    sub: 'u05-04',
    prompt: 'შეადარე: {x} □ {y}.',
    vars: { a: I(100, 999), b: I(10, 99), x: D((v) => fx(N(v, 'a'), 3)), y: D((v) => fx(N(v, 'b'), 2)) },
    constraints: [{ test: (v) => Math.abs(N(v, 'a') - N(v, 'b') * 10) < 120 && N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0, note: 'close values' }],
    optionCount: 3,
    answer: (v) => sign3(N(v, 'a'), N(v, 'b') * 10),
    options: () => SIGNS,
    why: (v, a) => `${String(v.x)} ${a} ${fx(N(v, 'b') * 10, 3)} = ${String(v.y)}: ${String(v.x)} ${a} ${String(v.y)}.`,
  }),
  t({
    sub: 'u05-04',
    d: 2,
    prompt: 'შეადარე: {x} □ {y}.',
    vars: { a: I(10, 999), k: C([1, 2]), x: D((v) => fx(N(v, 'a'), 2)), y: D((v) => fx(N(v, 'a') * 10 ** N(v, 'k'), 2 + N(v, 'k'))) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0, note: 'real hundredths' }],
    optionCount: 3,
    answer: () => '=',
    options: () => SIGNS,
    why: (v) => `ბოლო ნულები რიცხვს არ ცვლის: ${String(v.x)} = ${String(v.y)}.`,
  }),
  t({
    sub: 'u05-04',
    d: 2,
    prompt: 'დაალაგე ზრდადობით: {x1}; {x2}; {x3}; {x4}. რომელია სწორი რიგი?',
    vars: orderVars(),
    constraints: [{ test: orderDistinct, note: 'four different values' }],
    answer: (v) => orderOf(v, true),
    options: (v, right) => orderSlips(v, right, true),
    why: (_v, a) => `მიყვანით ერთნაირ თანრიგებზე და ვადარებთ: ${a}.`,
  }),
  t({
    sub: 'u05-04',
    d: 2,
    prompt: 'დაალაგე კლებადობით: {x1}; {x2}; {x3}; {x4}. რომელია სწორი რიგი?',
    vars: orderVars(),
    constraints: [{ test: orderDistinct, note: 'four different values' }],
    answer: (v) => orderOf(v, false),
    options: (v, right) => orderSlips(v, right, false),
    why: (_v, a) => `მიყვანით ერთნაირ თანრიგებზე და ვადარებთ: ${a}.`,
  }),
  t({
    sub: 'u05-04',
    prompt: 'ჩასვი შესაბამისი ნიშანი: {x} □ {y}.',
    vars: { w: I(0, 20), a: C([1, 5, 7, 9, 3]), b: C([1, 5, 7, 9, 3]), x: D((v) => `${N(v, 'w')},${N(v, 'a')}`), y: D((v) => `${N(v, 'w')},${N(v, 'b')}`) },
    optionCount: 3,
    answer: (v) => sign3(N(v, 'a'), N(v, 'b')),
    options: () => SIGNS,
    why: (v, a) => `მთელი ნაწილები ერთნაირია, ამიტომ მეათედებს ვადარებთ: ${String(v.x)} ${a} ${String(v.y)}.`,
  }),

  // ═════════ U05.5 — ათწილადების დამრგვალება ═════════
  ...([
    { target: 0, word: 'უახლოეს მთელ რიცხვამდე', ps: [2, 3], d: 1 as const },
    { target: 1, word: 'მეათედებამდე', ps: [2, 3], d: 1 as const },
    { target: 2, word: 'მეასედებამდე', ps: [3, 4], d: 2 as const },
  ].flatMap(({ target, word, ps, d }) => [
    t({
      sub: 'u05-05',
      d,
      prompt: `დაამრგვალე {x} ${word}.`,
      vars: {
        p: C(ps), w: I(1, 199), r: I(1, 9999),
        x: D((v) => fx(N(v, 'w') * pow10(N(v, 'p')) + (N(v, 'r') % pow10(N(v, 'p'))), N(v, 'p'))),
      },
      constraints: [{ test: (v) => N(v, 'r') % pow10(N(v, 'p')) % 10 !== 0 && N(v, 'p') > target, note: 'a real last digit, something to round' }],
      answer: (v) => rounded(v, target),
      options: (v, right) => {
        const a = N(v, 'w') * pow10(N(v, 'p')) + (N(v, 'r') % pow10(N(v, 'p')));
        const p = N(v, 'p');
        const up = roundAt(a, p, target) + 1, dn = roundAt(a, p, target) - 1;
        return [right, dd(truncAt(a, p, target), target), dd(up, target), dd(dn, target), dd(roundAt(a, p, Math.min(target + 1, p)), Math.min(target + 1, p)), dd(roundAt(a, p, Math.max(target - 1, 0)), Math.max(target - 1, 0))];
      },
      why: (v, a) => `${String(v.x)} ≈ ${a}.`,
    }),
  ])),
  t({
    sub: 'u05-05',
    d: 2,
    prompt: 'დაამრგვალე {x} {word}.',
    vars: { w: I(1, 199), r: I(100, 999), k: C([0, 1, 2]), x: D((v) => fx(N(v, 'w') * 1000 + N(v, 'r'), 3)), word: D((v) => ['უახლოეს მთელ რიცხვამდე', 'მეათედებამდე', 'მეასედებამდე'][N(v, 'k')]!) },
    constraints: [{ test: (v) => N(v, 'r') % 10 !== 0, note: 'real thousandths' }],
    answer: (v) => dd(roundAt(N(v, 'w') * 1000 + N(v, 'r'), 3, N(v, 'k')), N(v, 'k')),
    options: (v, right) => {
      const a = N(v, 'w') * 1000 + N(v, 'r'), k = N(v, 'k');
      return [right, dd(truncAt(a, 3, k), k), dd(roundAt(a, 3, k) + 1, k), dd(roundAt(a, 3, k) - 1, k), dd(roundAt(a, 3, k + 1), k + 1), dd(roundAt(a, 3, Math.max(k - 1, 0)), Math.max(k - 1, 0))];
    },
    why: (v, a) => `${String(v.x)} ≈ ${a}.`,
  }),

  // ═════════ U05.6 — ათწილადების შეკრება ═════════
  ...([
    { pa: 2, pb: 1, d: 1 as const, hi: 999 },
    { pa: 2, pb: 3, d: 1 as const, hi: 9999 },
    { pa: 3, pb: 3, d: 2 as const, hi: 3999 },
    { pa: 2, pb: 3, d: 2 as const, hi: 30000 },
  ].map(({ pa, pb, d, hi }) =>
    t({
      sub: 'u05-06',
      d,
      prompt: 'გამოთვალე: {x} + {y}.',
      vars: { a: I(Math.max(pow10(pa - 1), 100), hi), b: I(pow10(pb - 1) * 3, hi), x: D((v) => dd(N(v, 'a'), pa)), y: D((v) => dd(N(v, 'b'), pb)) },
      constraints: [{ test: (v) => N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0, note: 'real last digits' }],
      answer: (v) => dd(sc(N(v, 'a'), pa, Math.max(pa, pb)) + sc(N(v, 'b'), pb, Math.max(pa, pb)), Math.max(pa, pb)),
      wrong: () => [],
      options: (v, right) => {
        const r = (N(v, 'a') / 10 ** pa) + (N(v, 'b') / 10 ** pb);
        const misaligned = (N(v, 'a') + N(v, 'b')) / 10 ** Math.max(pa, pb);
        return [right, ...ints([misaligned, r + 0.1, r - 0.1, r + 1, r - 1, r + 0.01, r * 10]).filter((s) => s !== right)];
      },
      why: (v, a) => `მძიმე მძიმის ქვეშ დავწეროთ: ${String(v.x)} + ${String(v.y)} = ${a}.`,
    }),
  )),
  t({
    sub: 'u05-06',
    prompt: 'ლაშამ იყიდა რვეული {x} ლარად და კალამი {y} ლარად. რამდენი ლარი გადაიხადა სულ?',
    vars: { a: I(100, 899), b: I(100, 599), x: D((v) => dd(N(v, 'a'), 2)), y: D((v) => dd(N(v, 'b'), 2)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0, note: 'real hundredths' }],
    answer: (v) => `${dd(N(v, 'a') + N(v, 'b'), 2)} ლარი`,
    options: (v, right) => {
      const r = (N(v, 'a') + N(v, 'b')) / 100;
      return [right, ...ints([r + 0.1, r - 0.1, r + 1, r - 1, r * 10]).map((s) => `${s} ლარი`)];
    },
    why: (v, a) => `${String(v.x)} + ${String(v.y)} = ${a}.`,
  }),

  // ═════════ U05.7 — ათწილადების გამოკლება ═════════
  ...([
    { pa: 1, pb: 2, d: 1 as const, lo: 100, hi: 999 },
    { pa: 2, pb: 3, d: 2 as const, lo: 1000, hi: 99999 },
    { pa: 3, pb: 3, d: 2 as const, lo: 10000, hi: 99999 },
  ].map(({ pa, pb, d, lo, hi }) =>
    t({
      sub: 'u05-07',
      d,
      prompt: 'გამოთვალე: {x} ' + MINUS + ' {y}.',
      vars: { a: I(lo, hi), b: I(pow10(pb - 1) * 2, lo - 1 > 0 ? Math.min(hi, 99999) : hi), x: D((v) => dd(N(v, 'a'), pa)), y: D((v) => dd(N(v, 'b'), pb)) },
      constraints: [{ test: (v) => sc(N(v, 'a'), pa, Math.max(pa, pb)) > sc(N(v, 'b'), pb, Math.max(pa, pb)) && N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0, note: 'positive difference, real last digits' }],
      answer: (v) => dd(sc(N(v, 'a'), pa, Math.max(pa, pb)) - sc(N(v, 'b'), pb, Math.max(pa, pb)), Math.max(pa, pb)),
      options: (v, right) => {
        const r = N(v, 'a') / 10 ** pa - N(v, 'b') / 10 ** pb;
        const misaligned = Math.abs(N(v, 'a') - N(v, 'b')) / 10 ** Math.max(pa, pb);
        return [right, ...ints([misaligned, r + 0.1, r - 0.1, r + 1, r - 1, r + 0.01, r * 10]).filter((s) => s !== right && !s.startsWith(MINUS))];
      },
      why: (v, a) => `${String(v.x)} ${MINUS} ${String(v.y)} = ${a}.`,
    }),
  )),
  t({
    sub: 'u05-07',
    d: 2,
    prompt: 'გამოთვალე: {w} ' + MINUS + ' {y}.',
    vars: { w: C([10, 20, 50, 100]), b: I(1001, 9999), y: D((v) => dd(N(v, 'b'), 3)) },
    constraints: [{ test: (v) => N(v, 'b') % 10 !== 0 && N(v, 'b') < N(v, 'w') * 100, note: 'positive difference' }],
    answer: (v) => dd(N(v, 'w') * 1000 - N(v, 'b'), 3),
    options: (v, right) => {
      const r = N(v, 'w') - N(v, 'b') / 1000;
      return [right, ...ints([r + 0.1, r - 0.1, r + 1, r - 1, r + 0.01, r * 10]).filter((s) => s !== right)];
    },
    why: (v, a) => `${N(v, 'w')} = ${fx(N(v, 'w') * 1000, 3)}; ${fx(N(v, 'w') * 1000, 3)} ${MINUS} ${String(v.y)} = ${a}.`,
  }),
  t({
    sub: 'u05-07',
    prompt: 'წყლის ავზში იყო {x} ლიტრი წყალი. გამოიყენეს {y} ლიტრი. რამდენი ლიტრი დარჩა?',
    vars: { a: I(100, 999), b: I(100, 999), x: D((v) => dd(N(v, 'a'), 1)), y: D((v) => dd(N(v, 'b'), 2)) },
    constraints: [{ test: (v) => N(v, 'a') * 10 > N(v, 'b') && N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0, note: 'positive remainder' }],
    answer: (v) => `${dd(N(v, 'a') * 10 - N(v, 'b'), 2)} ლ`,
    options: (v, right) => {
      const r = N(v, 'a') / 10 - N(v, 'b') / 100;
      return [right, ...ints([r + 0.1, r - 0.1, r + 1, r - 1, r * 10, Math.abs(N(v, 'a') - N(v, 'b')) / 100]).map((s) => `${s} ლ`)];
    },
    why: (v, a) => `${String(v.x)} ${MINUS} ${String(v.y)} = ${a}.`,
  }),

  // ═════════ U05.8 — ათწილადების გამრავლება ═════════
  t({
    sub: 'u05-08',
    prompt: 'გამოთვალე: {x} × {k}.',
    vars: { a: I(11, 99), k: I(2, 9), x: D((v) => dd(N(v, 'a'), 1)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0, note: 'real tenths' }],
    answer: (v) => dd(N(v, 'a') * N(v, 'k'), 1),
    options: (v, right) => [right, ...shifts((N(v, 'a') * N(v, 'k')) / 10).filter((s) => s !== right)],
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'k')} = ${N(v, 'a') * N(v, 'k')}, ერთი ციფრი მძიმის შემდეგ: ${a}.`,
  }),
  t({
    sub: 'u05-08',
    prompt: 'გამოთვალე: {x} × {k}.',
    vars: { a: I(101, 999), k: C([4, 5, 6, 8, 12]), x: D((v) => dd(N(v, 'a'), 2)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0, note: 'real hundredths' }],
    answer: (v) => dd(N(v, 'a') * N(v, 'k'), 2),
    options: (v, right) => [right, ...shifts((N(v, 'a') * N(v, 'k')) / 100).filter((s) => s !== right)],
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'k')} = ${N(v, 'a') * N(v, 'k')}, ორი ციფრი მძიმის შემდეგ: ${a}.`,
  }),
  t({
    sub: 'u05-08',
    d: 2,
    prompt: 'გამოთვალე: {x} × {y}.',
    vars: { a: I(11, 99), b: I(11, 99), x: D((v) => dd(N(v, 'a'), 1)), y: D((v) => dd(N(v, 'b'), 1)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0, note: 'real tenths' }],
    answer: (v) => dd(N(v, 'a') * N(v, 'b'), 2),
    options: (v, right) => [right, ...shifts((N(v, 'a') * N(v, 'b')) / 100).filter((s) => s !== right)],
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'b')} = ${N(v, 'a') * N(v, 'b')}, ორი ციფრი მძიმის შემდეგ: ${a}.`,
  }),
  t({
    sub: 'u05-08',
    d: 2,
    prompt: 'გამოთვალე: {x} × {y}.',
    vars: { a: I(11, 99), b: I(11, 99), x: D((v) => dd(N(v, 'a'), 2)), y: D((v) => dd(N(v, 'b'), 1)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0, note: 'real digits' }],
    answer: (v) => dd(N(v, 'a') * N(v, 'b'), 3),
    options: (v, right) => [right, ...shifts((N(v, 'a') * N(v, 'b')) / 1000).filter((s) => s !== right)],
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'b')} = ${N(v, 'a') * N(v, 'b')}, სამი ციფრი მძიმის შემდეგ: ${a}.`,
  }),
  t({
    sub: 'u05-08',
    d: 2,
    prompt: 'გამოთვალე: {x} × {y}.',
    vars: { a: I(1001, 3999), b: I(2, 9), x: D((v) => dd(N(v, 'a'), 2)), y: D((v) => dd(N(v, 'b'), 1)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0, note: 'real hundredths' }],
    answer: (v) => dd(N(v, 'a') * N(v, 'b'), 3),
    options: (v, right) => [right, ...shifts((N(v, 'a') * N(v, 'b')) / 1000).filter((s) => s !== right)],
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'b')} = ${N(v, 'a') * N(v, 'b')}, სამი ციფრი მძიმის შემდეგ: ${a}.`,
  }),
  t({
    sub: 'u05-08',
    prompt: 'ერთი მეტრი ქსოვილი ღირს {x} ლარი. რამდენი ლარი ღირს {y} მეტრი?',
    vars: { a: I(301, 999), b: I(11, 59), x: D((v) => dd(N(v, 'a'), 2)), y: D((v) => dd(N(v, 'b'), 1)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0, note: 'real digits' }],
    answer: (v) => `${dd(N(v, 'a') * N(v, 'b'), 3)} ლარი`,
    options: (v, right) => [right, ...shifts((N(v, 'a') * N(v, 'b')) / 1000).map((s) => `${s} ლარი`)],
    why: (v, a) => `${String(v.x)} × ${String(v.y)} = ${a}.`,
  }),

  // ═════════ U05.9 — ნამრავლის მიახლოებითი შეფასება ═════════
  t({
    sub: 'u05-09',
    prompt: 'შეაფასე {x} × {y}, ორივე რიცხვის უახლოეს მთელ რიცხვამდე დამრგვალებით.',
    vars: { a: I(11, 99), b: I(11, 99), x: D((v) => dd(N(v, 'a'), 1)), y: D((v) => dd(N(v, 'b'), 1)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 5 && N(v, 'b') % 10 !== 5 && N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0, note: 'no ties' }],
    answer: (v) => sg(roundAt(N(v, 'a'), 1, 0) * roundAt(N(v, 'b'), 1, 0)),
    wrong: (v) => {
      const k = roundAt(N(v, 'a'), 1, 0) * roundAt(N(v, 'b'), 1, 0);
      return [truncAt(N(v, 'a'), 1, 0) * truncAt(N(v, 'b'), 1, 0), k + 1, k - 1, k * 10, k + 5, (N(v, 'a') * N(v, 'b')) / 100 | 0];
    },
    why: (v, a) => `${roundAt(N(v, 'a'), 1, 0)} × ${roundAt(N(v, 'b'), 1, 0)} = ${a}.`,
  }),
  t({
    sub: 'u05-09',
    d: 2,
    prompt: 'შეაფასე {x} × {y}, ორივე რიცხვის უახლოეს მთელ რიცხვამდე დამრგვალებით.',
    vars: { a: I(101, 399), b: I(11, 99), x: D((v) => dd(N(v, 'a'), 1)), y: D((v) => dd(N(v, 'b'), 1)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 5 && N(v, 'b') % 10 !== 5 && N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0, note: 'no ties' }],
    answer: (v) => sg(roundAt(N(v, 'a'), 1, 0) * roundAt(N(v, 'b'), 1, 0)),
    wrong: (v) => {
      const k = roundAt(N(v, 'a'), 1, 0) * roundAt(N(v, 'b'), 1, 0);
      return [truncAt(N(v, 'a'), 1, 0) * truncAt(N(v, 'b'), 1, 0), k + 1, k - 1, k * 10, k + 5];
    },
    why: (v, a) => `${roundAt(N(v, 'a'), 1, 0)} × ${roundAt(N(v, 'b'), 1, 0)} = ${a}.`,
  }),
  t({
    sub: 'u05-09',
    d: 2,
    prompt: 'შეაფასე {x} × {y}, პირველი რიცხვის {ra}-მდე და მეორის {rb}-მდე დამრგვალებით.',
    vars: {
      a: I(41, 49), b: I(71, 99),
      x: D((v) => dd(N(v, 'a'), 2)), y: D((v) => dd(N(v, 'b'), 1)),
      ra: D(() => '0,5'), rb: D((v) => roundAt(N(v, 'b'), 1, 0)),
    },
    constraints: [{ test: (v) => N(v, 'b') % 10 !== 5 && N(v, 'b') % 10 !== 0, note: 'no tie' }],
    answer: (v) => dd(5 * roundAt(N(v, 'b'), 1, 0), 1),
    wrong: (v) => { const k = roundAt(N(v, 'b'), 1, 0); return [k * 5, k / 2 + 1, k * 5 + 0.5, k * 50 / 10 + 1, k / 5].map((x) => x / 10); },
    why: (v, a) => `0,5 × ${roundAt(N(v, 'b'), 1, 0)} = ${a}.`,
  }),
  t({
    sub: 'u05-09',
    d: 2,
    prompt: 'შეაფასე {x} × {y}, პირველი რიცხვის {ra}-მდე და მეორის {rb}-მდე დამრგვალებით.',
    vars: {
      a: I(655, 744), b: I(11, 29), x: D((v) => dd(N(v, 'a'), 2)), y: D((v) => dd(N(v, 'b'), 1)),
      ra: D((v) => roundAt(N(v, 'a'), 2, 0)), rb: D((v) => roundAt(N(v, 'b'), 1, 0)),
    },
    constraints: [{ test: (v) => N(v, 'a') % 100 !== 50 && N(v, 'b') % 10 !== 5 && N(v, 'b') % 10 !== 0 && N(v, 'a') % 10 !== 0, note: 'no ties' }],
    answer: (v) => sg(roundAt(N(v, 'a'), 2, 0) * roundAt(N(v, 'b'), 1, 0)),
    wrong: (v) => { const k = roundAt(N(v, 'a'), 2, 0) * roundAt(N(v, 'b'), 1, 0); return [k + 1, k - 1, k + 7, k * 10, k - roundAt(N(v, 'b'), 1, 0)]; },
    why: (v, a) => `${roundAt(N(v, 'a'), 2, 0)} × ${roundAt(N(v, 'b'), 1, 0)} = ${a}.`,
  }),
  t({
    sub: 'u05-09',
    prompt: 'დაახლოებით რამდენია {x} × {y}, თუ რიცხვებს შესაბამისად {ra}-მდე და {rb}-მდე დავამრგვალებთ?',
    vars: {
      ra: C([20, 25, 30, 40, 50]), rb: C([5, 6, 8, 10, 20]), da: I(-4, 4, { nonZero: true }), db: I(-3, 3, { nonZero: true }),
      x: D((v) => dd(N(v, 'ra') * 10 + N(v, 'da'), 1)), y: D((v) => dd(N(v, 'rb') * 10 + N(v, 'db'), 1)),
    },
    answer: (v) => sg(N(v, 'ra') * N(v, 'rb')),
    wrong: (v) => { const k = N(v, 'ra') * N(v, 'rb'); return [k + 10, k - 10, k * 10, k / 10, k + N(v, 'ra')]; },
    why: (v, a) => `${N(v, 'ra')} × ${N(v, 'rb')} = ${a}.`,
  }),

  // ═════════ U05.10 — ათწილადის გაყოფა ნატურალურ რიცხვზე ═════════
  ...([
    { qa: [11, 99], pq: 1, b: [2, 9], d: 1 as const },
    { qa: [101, 999], pq: 2, b: [2, 9], d: 1 as const },
    { qa: [1011, 3999], pq: 3, b: [4, 9], d: 2 as const },
    { qa: [101, 399], pq: 2, b: [11, 24], d: 2 as const },
  ].map(({ qa, pq, b, d }) =>
    t({
      sub: 'u05-10',
      d,
      prompt: 'გამოთვალე: {x} ÷ {b}.',
      vars: { qv: I(qa[0]!, qa[1]!), b: I(b[0]!, b[1]!), x: D((v) => dd(N(v, 'qv') * N(v, 'b'), pq)) },
      constraints: [{ test: (v) => N(v, 'qv') % 10 !== 0 && N(v, 'qv') * N(v, 'b') < 1e6, note: 'a real last digit' }],
      answer: (v) => dd(N(v, 'qv'), pq),
      options: (v, right) => [right, ...shifts(N(v, 'qv') / 10 ** pq).filter((s) => s !== right)],
      why: (v, a) => `${String(v.x)} ÷ ${N(v, 'b')} = ${a}.`,
    }),
  )),
  t({
    sub: 'u05-10',
    prompt: '{x} ლიტრი წვენი თანაბრად ჩაასხეს {b} ბოთლში. რამდენი ლიტრი წვენია თითოეულ ბოთლში?',
    vars: { qv: I(11, 99), b: I(2, 9), x: D((v) => dd(N(v, 'qv') * N(v, 'b'), 1)) },
    constraints: [{ test: (v) => N(v, 'qv') % 10 !== 0, note: 'real tenths' }],
    answer: (v) => `${dd(N(v, 'qv'), 1)} ლ`,
    options: (v, right) => [right, ...shifts(N(v, 'qv') / 10).map((s) => `${s} ლ`)],
    why: (v, a) => `${String(v.x)} ÷ ${N(v, 'b')} = ${a}.`,
  }),
  t({
    sub: 'u05-10',
    d: 2,
    prompt: '{b} ერთნაირი წიგნის წონაა {x} კგ. რამდენი კილოგრამია ერთი წიგნი?',
    vars: { qv: I(101, 899), b: I(3, 9), x: D((v) => dd(N(v, 'qv') * N(v, 'b'), 2)) },
    constraints: [{ test: (v) => N(v, 'qv') % 10 !== 0, note: 'real hundredths' }],
    answer: (v) => `${dd(N(v, 'qv'), 2)} კგ`,
    options: (v, right) => [right, ...shifts(N(v, 'qv') / 100).map((s) => `${s} კგ`)],
    why: (v, a) => `${String(v.x)} ÷ ${N(v, 'b')} = ${a}.`,
  }),

  // ═════════ U05.11 — ათწილადების გაყოფა ═════════
  t({
    sub: 'u05-11',
    prompt: 'გამოთვალე: {x} ÷ {y}.',
    vars: { b: I(2, 9), k: I(2, 20), x: D((v) => dd(N(v, 'b') * N(v, 'k'), 1)), y: D((v) => dd(N(v, 'b'), 1)) },
    answer: (v) => sg(N(v, 'k')),
    wrong: (v) => [N(v, 'k') * 10, N(v, 'k') / 10, N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'k') * 100],
    why: (v, a) => `ორივე რიცხვი 10-ზე გავამრავლოთ: ${N(v, 'b') * N(v, 'k')} ÷ ${N(v, 'b')} = ${a}.`,
  }),
  t({
    sub: 'u05-11',
    prompt: 'გამოთვალე: {x} ÷ {y}.',
    vars: { b: I(11, 49), k: I(2, 30), x: D((v) => dd(N(v, 'b') * N(v, 'k'), 2)), y: D((v) => dd(N(v, 'b'), 1)) },
    constraints: [{ test: (v) => N(v, 'b') % 10 !== 0, note: 'real tenths divisor' }],
    answer: (v) => dd(N(v, 'k'), 1),
    options: (v, right) => [right, ...shifts(N(v, 'k') / 10).filter((s) => s !== right)],
    why: (v, a) => `ორივე რიცხვი 100-ზე გავამრავლოთ: ${sg(N(v, 'b') * N(v, 'k'))} ÷ ${sg(N(v, 'b') * 10)} = ${a}.`,
  }),
  t({
    sub: 'u05-11',
    d: 2,
    prompt: 'გამოთვალე: {x} ÷ {y}.',
    vars: { b: I(11, 99), k: I(2, 99), x: D((v) => dd(N(v, 'b') * N(v, 'k'), 3)), y: D((v) => dd(N(v, 'b'), 2)) },
    constraints: [{ test: (v) => N(v, 'b') % 10 !== 0 && N(v, 'k') % 10 !== 0 && N(v, 'b') * N(v, 'k') < 100000, note: 'real digits' }],
    answer: (v) => dd(N(v, 'k'), 1),
    options: (v, right) => [right, ...shifts(N(v, 'k') / 10).filter((s) => s !== right)],
    why: (_v, a) => `ორივე რიცხვი 1000-ზე გავამრავლოთ და გავყოთ: ${a}.`,
  }),
  t({
    sub: 'u05-11',
    d: 2,
    prompt: 'გამოთვალე: {x} ÷ {y}.',
    vars: { b: I(11, 99), k: I(2, 60), x: D((v) => dd(N(v, 'b') * N(v, 'k'), 3)), y: D((v) => dd(N(v, 'b'), 2)) },
    constraints: [{ test: (v) => N(v, 'b') % 10 !== 0 && N(v, 'k') % 10 !== 0 && N(v, 'b') * N(v, 'k') < 100000, note: 'real digits' }],
    answer: (v) => dd(N(v, 'k'), 1),
    options: (v, right) => [right, ...shifts(N(v, 'k') / 10).filter((s) => s !== right)],
    why: (v, a) => `${String(v.x)} ÷ ${String(v.y)} = ${a}.`,
  }),
  t({
    sub: 'u05-11',
    prompt: '{x} მეტრი ლენტი თანაბრად გაჭრეს {y}-მეტრიან ნაწილებად. რამდენი ნაწილი მიიღეს?',
    vars: { b: I(2, 9), k: I(2, 30), x: D((v) => dd(N(v, 'b') * N(v, 'k'), 1)), y: D((v) => dd(N(v, 'b'), 1)) },
    answer: (v) => sg(N(v, 'k')),
    wrong: (v) => [N(v, 'k') * 10, N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'k') / 10, N(v, 'k') * 2],
    why: (v, a) => `${String(v.x)} ÷ ${String(v.y)} = ${a}.`,
  }),

  // ═════════ U05.12 — განაყოფის მიახლოებითი შეფასება ═════════
  ...[1, 2].map((variant) =>
    t({
      sub: 'u05-12',
      d: variant === 1 ? 1 : 2,
      prompt: 'შეაფასე {x} ÷ {y}, ორივე რიცხვის უახლოეს მთელ რიცხვამდე დამრგვალებით.',
      vars: {
        r: I(2, variant === 1 ? 9 : 14), k: I(2, variant === 1 ? 9 : 14), da: I(-4, 4, { nonZero: true }), db: I(-4, 4, { nonZero: true }),
        x: D((v) => dd(N(v, 'r') * N(v, 'k') * 10 + N(v, 'da'), 1)), y: D((v) => dd(N(v, 'r') * 10 + N(v, 'db'), 1)),
      },
      answer: (v) => sg(N(v, 'k')),
      wrong: (v) => [N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'k') * 10, N(v, 'k') + 2, N(v, 'r')],
      why: (v, a) => `${N(v, 'r') * N(v, 'k')} ÷ ${N(v, 'r')} = ${a}.`,
    }),
  ),
  t({
    sub: 'u05-12',
    prompt: 'შეაფასე {x} ÷ {y}, რიცხვების {ra}-მდე და {rb}-მდე დამრგვალებით.',
    vars: {
      rb: C([2, 5, 10, 20]), k: I(2, 20), da: I(-4, 4, { nonZero: true }), db: I(-3, 3, { nonZero: true }),
      ra: D((v) => N(v, 'rb') * N(v, 'k')),
      x: D((v) => dd(N(v, 'rb') * N(v, 'k') * 10 + N(v, 'da'), 1)), y: D((v) => dd(N(v, 'rb') * 10 + N(v, 'db'), 1)),
    },
    answer: (v) => sg(N(v, 'k')),
    wrong: (v) => [N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'k') * 10, N(v, 'k') + 2, N(v, 'k') / 2 + 1],
    why: (v, a) => `${N(v, 'ra')} ÷ ${N(v, 'rb')} = ${a}.`,
  }),
  t({
    sub: 'u05-12',
    d: 2,
    prompt: 'დაახლოებით რამდენია {x} ÷ {y}, თუ რიცხვებს შესაბამისად {ra}-მდე და {rb}-მდე დავამრგვალებთ?',
    vars: {
      rb: C([4, 5, 6, 8]), k: I(3, 12), da: I(-3, 3, { nonZero: true }), db: I(-2, 2, { nonZero: true }),
      ra: D((v) => N(v, 'rb') * N(v, 'k')),
      x: D((v) => dd(N(v, 'rb') * N(v, 'k') * 10 + N(v, 'da'), 1)), y: D((v) => dd(N(v, 'rb') * 10 + N(v, 'db'), 1)),
    },
    answer: (v) => sg(N(v, 'k')),
    wrong: (v) => [N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'k') * 10, N(v, 'k') + 2],
    why: (v, a) => `${N(v, 'ra')} ÷ ${N(v, 'rb')} = ${a}.`,
  }),
  t({
    sub: 'u05-12',
    prompt: 'შეაფასე {x} ÷ {y}, რიცხვების {ra}-მდე და {rb}-მდე დამრგვალებით.',
    vars: {
      rb: C([5, 10]), k: C([2, 5, 10, 20]), da: I(-4, 4, { nonZero: true }), db: I(-3, 3, { nonZero: true }),
      ra: D((v) => N(v, 'rb') * N(v, 'k')),
      x: D((v) => dd(N(v, 'rb') * N(v, 'k') * 10 + N(v, 'da'), 1)), y: D((v) => dd(N(v, 'rb') * 10 + N(v, 'db'), 1)),
    },
    answer: (v) => sg(N(v, 'k')),
    wrong: (v) => [N(v, 'k') + 1, N(v, 'k') * 10, N(v, 'k') + 3, N(v, 'k') * 2],
    why: (v, a) => `${N(v, 'ra')} ÷ ${N(v, 'rb')} = ${a}.`,
  }),

  // ═════════ U05.13 — გამრავლება და გაყოფა 10-ის ხარისხებზე ═════════
  ...(['×', '÷'] as const).flatMap((op) =>
    [1, 2, 3].map((k) =>
      t({
        sub: 'u05-13',
        d: k === 3 ? 2 : 1,
        prompt: `გამოთვალე: {x} ${op} {pw}.`,
        vars: { a: I(1001, 99999), p: C([1, 2, 3]), x: D((v) => dd(N(v, 'a'), N(v, 'p'))), pw: D(() => fx(10 ** k, 0)) },
        constraints: [{ test: (v) => N(v, 'a') % 10 !== 0, note: 'a real last digit' }],
        answer: (v) => ds(op === '×' ? exact((N(v, 'a') / 10 ** N(v, 'p')) * 10 ** k) : exact((N(v, 'a') / 10 ** N(v, 'p')) / 10 ** k)),
        options: (v, right) => {
          const x = N(v, 'a') / 10 ** N(v, 'p');
          const r = op === '×' ? x * 10 ** k : x / 10 ** k;
          return [right, ...ints([op === '×' ? x / 10 ** k : x * 10 ** k, r * 10, r / 10, op === '×' ? x * 10 ** (k + 1) : x / 10 ** (k - 1 || 1), x]).filter((s) => s !== right)];
        },
        why: (_v, a) => `მძიმე ${k} ადგილით გადადის ${op === '×' ? 'მარჯვნივ' : 'მარცხნივ'}: ${a}.`,
      }),
    ),
  ),

  // ═════════ U05.14 — უტოლობები ათწილადებით ═════════
  t({
    sub: 'u05-14',
    prompt: 'ჩასვი შესაბამისი ნიშანი: {x} □ {y}.',
    vars: { a: I(100, 999), b: I(10, 99), x: D((v) => fx(N(v, 'a'), 2)), y: D((v) => fx(N(v, 'b'), 1)) },
    constraints: [{ test: (v) => Math.abs(N(v, 'a') - N(v, 'b') * 10) < 100 && N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0, note: 'close' }],
    optionCount: 3,
    answer: (v) => sign3(N(v, 'a'), N(v, 'b') * 10),
    options: () => SIGNS,
    why: (v, a) => `${String(v.x)} ${a} ${fx(N(v, 'b') * 10, 2)}: ${String(v.x)} ${a} ${String(v.y)}.`,
  }),
  t({
    sub: 'u05-14',
    prompt: 'იპოვე უმცირესი მთელი რიცხვი, რომელიც აკმაყოფილებს პირობას: x > {b}.',
    vars: { w: I(1, 90), f: I(1, 9), b: D((v) => fx(N(v, 'w') * 10 + N(v, 'f'), 1)) },
    answer: (v) => sg(N(v, 'w') + 1),
    wrong: (v) => [N(v, 'w'), N(v, 'w') + 2, N(v, 'w') - 1, N(v, 'w') * 10 + N(v, 'f')],
    why: (v, a) => `${String(v.b)}-ზე დიდი უმცირესი მთელია ${a}.`,
  }),
  t({
    sub: 'u05-14',
    prompt: 'იპოვე უდიდესი მთელი რიცხვი, რომელიც აკმაყოფილებს პირობას: x < {b}.',
    vars: { w: I(2, 90), f: I(1, 9), b: D((v) => fx(N(v, 'w') * 10 + N(v, 'f'), 1)) },
    answer: (v) => sg(N(v, 'w')),
    wrong: (v) => [N(v, 'w') + 1, N(v, 'w') - 1, N(v, 'w') + 2, N(v, 'w') * 10 + N(v, 'f')],
    why: (v, a) => `${String(v.b)}-ზე პატარა უდიდესი მთელია ${a}.`,
  }),
  t({
    sub: 'u05-14',
    d: 2,
    prompt: 'ჩასვი შესაბამისი ნიშანი: {x} + {y} □ {z}.',
    vars: { a: I(11, 99), b: I(1, 9), z: C([1, 2, 5]), x: D((v) => dd(N(v, 'a'), 2)), y: D((v) => dd(N(v, 'b'), 1)) },
    constraints: [{ test: (v) => Math.abs(N(v, 'a') + N(v, 'b') * 10 - N(v, 'z') * 100) <= 15 && N(v, 'a') % 10 !== 0, note: 'near the target' }],
    optionCount: 3,
    answer: (v) => sign3(N(v, 'a') + N(v, 'b') * 10, N(v, 'z') * 100),
    options: () => SIGNS,
    why: (v, a) => `${String(v.x)} + ${String(v.y)} = ${dd(N(v, 'a') + N(v, 'b') * 10, 2)}; ამიტომ ${dd(N(v, 'a') + N(v, 'b') * 10, 2)} ${a} ${N(v, 'z')}.`,
  }),
  t({
    sub: 'u05-14',
    d: 2,
    prompt: 'იპოვე ყველა მოცემული რიცხვი, რომელიც აკმაყოფილებს პირობას {lo} < x < {hi}: {list}.',
    vars: {
      lo: I(1, 6), span: C([1, 2, 3]), shift: I(0, 3), hi: D((v) => N(v, 'lo') + N(v, 'span')),
      list: D((v) => {
        const lo = N(v, 'lo'), hi = N(v, 'hi');
        return [lo - 0.1, lo + 0.2 + 0.1 * N(v, 'shift'), hi - 0.2, hi, hi + 0.2].map((x) => ds(Math.round(x * 10) / 10)).join('; ');
      }),
    },
    answer: (v) => inRange(v).join('; '),
    options: (v, right) => {
      const items = String(v.list).split('; ');
      const lo = N(v, 'lo'), hi = N(v, 'hi');
      const inside = inRange(v);
      return [right, items.filter((x) => valueOf(x) >= lo && valueOf(x) <= hi).join('; '), items.filter((x) => valueOf(x) > lo).join('; '), items.filter((x) => valueOf(x) < hi).join('; '), inside.slice(0, 1).join('; '), items.slice(0, 3).join('; ')];
    },
    why: (v, a) => `${N(v, 'lo')}-ზე მეტი და ${N(v, 'hi')}-ზე ნაკლები: ${a}.`,
  }),
  t({
    sub: 'u05-14',
    d: 2,
    prompt: 'შეავსე გამოტოვებული ციფრი ისე, რომ უტოლობა სწორი იყოს: {w},{f}□ < {w},{f}{g}. ჩამოთვალე ყველა შესაძლო ციფრი.',
    vars: { w: I(1, 20), f: I(1, 9), g: I(2, 9) },
    answer: (v) => digitsBelow(N(v, 'g')).join(', '),
    options: (v, right) => {
      const g = N(v, 'g');
      return [right, digitsBelow(g + 1).join(', '), digitsBelow(g).slice(1).join(', '), Array.from({ length: 10 - g }, (_, i) => g + i).join(', '), String(g - 1)];
    },
    why: (v, a) => `${N(v, 'w')},${N(v, 'f')}□ < ${N(v, 'w')},${N(v, 'f')}${N(v, 'g')} სწორია, თუ □ < ${N(v, 'g')}: ${a}.`,
  }),
];

// ─────────────────────────── local helpers ───────────────────────────

function digitsBelow(g: number): number[] {
  return Array.from({ length: g }, (_, i) => i);
}

function inRange(v: Record<string, unknown>): string[] {
  const lo = Number(v.lo), hi = Number(v.hi);
  return String(v.list).split('; ').filter((x) => valueOf(x) > lo && valueOf(x) < hi);
}

function expansion(w: number, digits: number[], shift: number): string {
  const terms: string[] = [];
  const whole = String(w);
  [...whole].forEach((d, i) => {
    if (d !== '0') terms.push(`${d}${'0'.repeat(whole.length - 1 - i)}`);
  });
  digits.forEach((d, i) => {
    if (d !== 0) terms.push(ds(d / 10 ** (i + 1 + shift)));
  });
  return terms.join(' + ');
}

function rounded(v: Record<string, unknown>, target: number): string {
  const p = Number(v.p);
  const a = Number(v.w) * pow10(p) + (Number(v.r) % pow10(p));
  return dd(roundAt(a, p, target), target);
}

function makeOrderPool(): string[] {
  const out: string[] = [];
  const digits = ['0', '3', '5', '7', '9'];
  for (const a of digits) {
    if (a !== '0') out.push(a);
    for (const b of digits) {
      if (b !== '0') out.push(a + b);
      for (const c of digits) if (c !== '0') out.push(a + b + c);
    }
  }
  return out;
}

function orderVars() {
  return {
    w: I(0, 20),
    f1: C(makeOrderPool()), f2: C(makeOrderPool()), f3: C(makeOrderPool()), f4: C(makeOrderPool()),
    x1: D((v) => `${N(v, 'w')},${String(v.f1)}`), x2: D((v) => `${N(v, 'w')},${String(v.f2)}`),
    x3: D((v) => `${N(v, 'w')},${String(v.f3)}`), x4: D((v) => `${N(v, 'w')},${String(v.f4)}`),
  };
}

const valueOf = (text: string): number => Number(text.replace(',', '.'));

function orderDistinct(v: Record<string, unknown>): boolean {
  const xs = ['x1', 'x2', 'x3', 'x4'].map((k) => valueOf(String(v[k])));
  return new Set(xs).size === 4;
}

function orderOf(v: Record<string, unknown>, asc: boolean): string {
  return ['x1', 'x2', 'x3', 'x4'].map((k) => String(v[k])).sort((a, b) => (asc ? 1 : -1) * (valueOf(a) - valueOf(b))).join('; ');
}

function orderSlips(v: Record<string, unknown>, right: string, asc: boolean): string[] {
  const items = ['x1', 'x2', 'x3', 'x4'].map((k) => String(v[k]));
  const sorted = right.split('; ');
  const swap = (i: number): string => { const c = [...sorted]; [c[i], c[i + 1]] = [c[i + 1]!, c[i]!]; return c.join('; '); };
  // The beginner's slip: read the digits after the comma as a whole number.
  const byDigits = [...items].sort((a, b) => (asc ? 1 : -1) * (Number(a.split(',')[1]) - Number(b.split(',')[1]))).join('; ');
  // The other slip: longer means bigger.
  const byLength = [...items].sort((a, b) => (asc ? 1 : -1) * (a.length - b.length || valueOf(a) - valueOf(b))).join('; ');
  return [right, byDigits, byLength, swap(0), swap(1), swap(2), [...sorted].reverse().join('; ')];
}

void [MINUS, mText, PLACE_GEN, sg];
