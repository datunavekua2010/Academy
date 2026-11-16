import type { QuestionTemplate, Vars } from './types';
import { C, D, I, MINUS, N, fAdd, fSub, fr, q6, sg } from './g6-helpers';
import { dd, fx } from './g6-dec';
import { fracSlips, fv } from './g6-frac';

/**
 * Grade VI — Unit 10: ალგებრა (algebra).
 *
 * Converted from the academy's `U10` bank: 15 subtopics × 6 questions.
 *
 * An expression is drawn as numbers and a letter, printed in the form a student
 * reads (`3(x + 4) + 2x`), and its simplified form is computed from the
 * coefficients. Wrong options are the usual slips: a like term added to an
 * unlike one, a factor not distributed to the second term, a sign lost when a
 * bracket is opened after a minus, an inequality turned the wrong way.
 */

export const G6_U10_SUBTOPICS = [
  'u10-01', 'u10-02', 'u10-03', 'u10-04', 'u10-05', 'u10-06', 'u10-07', 'u10-08',
  'u10-09', 'u10-10', 'u10-11', 'u10-12', 'u10-13', 'u10-14', 'u10-15',
] as const;

const T = 'g6-algebra';
let seq = 0;
const nextId = (): string => `g6-u10-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

const LETTERS = ['x', 'a', 'm', 'y', 'n', 't', 'z', 'k'];
const PAIRS = ['x|y', 'a|b', 'm|n', 'p|q', 'c|d', 's|t', 'u|v', 'k|l'];
const sup = '²';

/** `3x + 5`, `x − 2`, `−4y + 1`: coefficients over names, then the constant. */
const lin = (co: number[], names: string[], c: number): string => {
  const parts: string[] = [];
  co.forEach((k, i) => {
    if (k === 0) return;
    const body = `${Math.abs(k) === 1 ? '' : Math.abs(k)}${names[i]}`;
    parts.push(parts.length === 0 ? (k < 0 ? `${MINUS}${body}` : body) : `${k < 0 ? MINUS : '+'} ${body}`);
  });
  if (c !== 0 || parts.length === 0) {
    const body = String(Math.abs(c));
    parts.push(parts.length === 0 ? (c < 0 ? `${MINUS}${body}` : body) : `${c < 0 ? MINUS : '+'} ${body}`);
  }
  return parts.join(' ');
};

/** Slips of a simplified linear form. */
const lslips = (co: number[], names: string[], c: number): string[] => {
  const out: string[] = [];
  co.forEach((_k, i) => {
    for (const d of [1, -1, 2]) out.push(lin(co.map((x, j) => (j === i ? x + d : x)), names, c));
  });
  for (const d of [1, -1, 2]) out.push(lin(co, names, c + d));
  if (c !== 0) {
    out.push(lin(co, names, 0));
    out.push(lin(co, names, -c));
    out.push(lin([co.reduce((s, k) => s + k, 0) + c], [names[0]!], 0));
  }
  if (co.length > 1) out.push(lin([co.reduce((s, k) => s + k, 0)], [names[0]!], c));
  return out;
};

const lsimp = (
  sub: string, d: 1 | 2 | 3, prompt: string, vars: Record<string, ReturnType<typeof C>>,
  calc: (v: Vars) => { expr: string; co: number[]; names: string[]; c: number; why: string },
  constraint?: (v: Vars) => boolean,
): QuestionTemplate =>
  t({
    sub, d, prompt,
    vars: { ...vars, e: D((v) => calc(v).expr) },
    ...(constraint ? { constraints: [{ test: constraint, note: 'a tidy form' }] } : {}),
    answer: (v) => { const r = calc(v); return lin(r.co, r.names, r.c); },
    options: (v, right) => { const r = calc(v); return [right, ...lslips(r.co, r.names, r.c)]; },
    why: (v, a) => `${calc(v).why}${a}.`,
  });

/** `a x` printed with an omitted 1. */
const tm = (k: number, name: string): string => `${k === 1 ? '' : k}${name}`;

/** Numeric answers with slips. */
const nslips = (r: number, extra: number[] = []): string[] =>
  [...extra, r + 1, r - 1, r + 2, r - 2, r * 2, r + 10, r - 10].filter((x) => Number.isInteger(x) && x >= 0).map((x) => sg(x));

const L = C(LETTERS);
const Lv = (v: Vars): string => String(v.L);
const eqAns = (v: Vars, value: number | string): string => `${Lv(v)} = ${typeof value === 'number' ? sg(value) : value}`;
const eqSlips = (v: Vars, r: number, extra: number[] = []): string[] =>
  [...extra, r + 1, r - 1, r + 2, r - 2, r * 2, r + 10, r - 10].filter((x) => x > 0 && Number.isInteger(x)).map((x) => `${Lv(v)} = ${sg(x)}`);

export const G6_U10_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U10.1 — მსგავსი წევრების დაჯგუფება ═════════
  lsimp('u10-01', 1, 'გაამარტივე: {e}.', { L, a: I(2, 9), b: I(2, 9) },
    (v) => ({ expr: `${N(v, 'a')}${Lv(v)} + ${N(v, 'b')}${Lv(v)}`, co: [N(v, 'a') + N(v, 'b')], names: [Lv(v)], c: 0, why: `${N(v, 'a')} + ${N(v, 'b')} = ${N(v, 'a') + N(v, 'b')}: ` })),
  lsimp('u10-01', 1, 'გაამარტივე: {e}.', { L, a: I(5, 12), b: I(2, 4), c: I(2, 6) },
    (v) => ({ expr: `${N(v, 'a')}${Lv(v)} − ${N(v, 'b')}${Lv(v)} + ${N(v, 'c')}${Lv(v)}`, co: [N(v, 'a') - N(v, 'b') + N(v, 'c')], names: [Lv(v)], c: 0, why: `${N(v, 'a')} − ${N(v, 'b')} + ${N(v, 'c')} = ${N(v, 'a') - N(v, 'b') + N(v, 'c')}: ` })),
  lsimp('u10-01', 1, 'გაამარტივე: {e}.', { L, a: I(2, 9), b: I(2, 9), p: I(2, 9), q: I(2, 9) },
    (v) => ({ expr: `${N(v, 'a')}${Lv(v)} + ${N(v, 'p')} + ${N(v, 'b')}${Lv(v)} + ${N(v, 'q')}`, co: [N(v, 'a') + N(v, 'b')], names: [Lv(v)], c: N(v, 'p') + N(v, 'q'), why: `ცვლადიანი წევრები: ${N(v, 'a') + N(v, 'b')}${Lv(v)}, რიცხვები: ${N(v, 'p') + N(v, 'q')}. ` })),
  lsimp('u10-01', 2, 'გაამარტივე: {e}.', { L, a: I(5, 12), b: I(2, 5), p: I(2, 6), q: I(7, 12) },
    (v) => ({ expr: `${N(v, 'a')}${Lv(v)} − ${N(v, 'p')} + ${N(v, 'b')}${Lv(v)} + ${N(v, 'q')}`, co: [N(v, 'a') + N(v, 'b')], names: [Lv(v)], c: N(v, 'q') - N(v, 'p'), why: `ცვლადიანი წევრები: ${N(v, 'a') + N(v, 'b')}${Lv(v)}, რიცხვები: ${N(v, 'q') - N(v, 'p')}. ` }),
    (v) => N(v, 'q') !== N(v, 'p')),
  lsimp('u10-01', 2, 'გაამარტივე: {e}.', { P: C(PAIRS), a: I(2, 9), b: I(2, 9), c: I(2, 9), d: I(2, 9), },
    (v) => { const [x, y] = String(v.P).split('|') as [string, string]; return { expr: `${N(v, 'a')}${x} + ${N(v, 'b')}${y} + ${N(v, 'c')}${x} + ${N(v, 'd')}${y}`, co: [N(v, 'a') + N(v, 'c'), N(v, 'b') + N(v, 'd')], names: [x, y], c: 0, why: `${x}-ის წევრები და ${y}-ის წევრები ცალ-ცალკე შევკრიბოთ: ` }; }),
  lsimp('u10-01', 2, 'გაამარტივე: {e}.', { P: C(PAIRS), a: I(6, 12), b: I(2, 5), c: I(2, 6), d: I(6, 11) },
    (v) => { const [x, y] = String(v.P).split('|') as [string, string]; return { expr: `${N(v, 'a')}${x} − ${N(v, 'b')}${y} + ${N(v, 'c')}${x} + ${N(v, 'd')}${y}`, co: [N(v, 'a') + N(v, 'c'), N(v, 'd') - N(v, 'b')], names: [x, y], c: 0, why: `${x}-ის წევრები: ${N(v, 'a') + N(v, 'c')}${x}; ${y}-ის წევრები: ${N(v, 'd') - N(v, 'b')}${y}: ` }; },
    (v) => N(v, 'd') !== N(v, 'b')),

  // ═════════ U10.2 — განაწილებადობის კანონი ═════════
  lsimp('u10-02', 1, 'გახსენი ფრჩხილები: {e}.', { L, a: I(2, 9), b: I(2, 9) },
    (v) => ({ expr: `${N(v, 'a')}(${Lv(v)} + ${N(v, 'b')})`, co: [N(v, 'a')], names: [Lv(v)], c: N(v, 'a') * N(v, 'b'), why: `${N(v, 'a')} × ${Lv(v)} და ${N(v, 'a')} × ${N(v, 'b')}: ` })),
  lsimp('u10-02', 1, 'გახსენი ფრჩხილები: {e}.', { L, a: I(2, 9), b: I(2, 4), c: I(2, 9) },
    (v) => ({ expr: `${N(v, 'a')}(${tm(N(v, 'b'), Lv(v))} − ${N(v, 'c')})`, co: [N(v, 'a') * N(v, 'b')], names: [Lv(v)], c: -N(v, 'a') * N(v, 'c'), why: `${N(v, 'a')} × ${tm(N(v, 'b'), Lv(v))} და ${N(v, 'a')} × ${N(v, 'c')}: ` })),
  lsimp('u10-02', 1, 'გაამარტივე: {e}.', { L, a: I(2, 6), b: I(2, 9), c: I(2, 9) },
    (v) => ({ expr: `${N(v, 'a')}(${Lv(v)} + ${N(v, 'b')}) + ${tm(N(v, 'c'), Lv(v))}`, co: [N(v, 'a') + N(v, 'c')], names: [Lv(v)], c: N(v, 'a') * N(v, 'b'), why: `${N(v, 'a')}${Lv(v)} + ${N(v, 'a') * N(v, 'b')} + ${tm(N(v, 'c'), Lv(v))}: ` })),
  lsimp('u10-02', 2, 'გაამარტივე: {e}.', { L, a: I(2, 5), b: I(2, 4), c: I(2, 9), d: I(2, 9) },
    (v) => ({ expr: `${N(v, 'a')}(${tm(N(v, 'b'), Lv(v))} + ${N(v, 'c')}) − ${tm(N(v, 'd'), Lv(v))}`, co: [N(v, 'a') * N(v, 'b') - N(v, 'd')], names: [Lv(v)], c: N(v, 'a') * N(v, 'c'), why: `${N(v, 'a') * N(v, 'b')}${Lv(v)} + ${N(v, 'a') * N(v, 'c')} − ${tm(N(v, 'd'), Lv(v))}: ` }),
    (v) => N(v, 'a') * N(v, 'b') > N(v, 'd') && N(v, 'a') * N(v, 'b') !== N(v, 'd')),
  t({
    sub: 'u10-02',
    d: 2,
    prompt: 'გამოთვალე მოხერხებული გზით: {k} × {m} + {k} × {n}.',
    vars: { k: I(3, 9), m: C([18, 17, 16, 14, 13, 12, 28, 27, 26, 19]), n: D((v) => 10 - (N(v, 'm') % 10)) },
    answer: (v) => sg(N(v, 'k') * (N(v, 'm') + N(v, 'n'))),
    wrong: (v) => [N(v, 'k') * N(v, 'm') + N(v, 'n'), N(v, 'k') * N(v, 'm'), N(v, 'k') + N(v, 'm') + N(v, 'n'), N(v, 'k') * (N(v, 'm') + N(v, 'n')) + N(v, 'k'), N(v, 'k') * (N(v, 'm') + N(v, 'n')) - N(v, 'k')],
    why: (v, a) => `${v.k} × (${v.m} + ${v.n}) = ${v.k} × ${N(v, 'm') + N(v, 'n')} = ${a}.`,
  }),
  lsimp('u10-02', 3, 'გახსენი ფრჩხილები და გაამარტივე: {e}.', { L, a: I(2, 5), b: I(2, 4), c: I(2, 6), d: I(2, 3), f: I(2, 8) },
    (v) => ({ expr: `${N(v, 'a')}(${tm(N(v, 'b'), Lv(v))} + ${N(v, 'c')}) − ${N(v, 'd')}(${Lv(v)} − ${N(v, 'f')})`, co: [N(v, 'a') * N(v, 'b') - N(v, 'd')], names: [Lv(v)], c: N(v, 'a') * N(v, 'c') + N(v, 'd') * N(v, 'f'), why: `${N(v, 'a') * N(v, 'b')}${Lv(v)} + ${N(v, 'a') * N(v, 'c')} − ${N(v, 'd')}${Lv(v)} + ${N(v, 'd') * N(v, 'f')}: ` }),
    (v) => N(v, 'a') * N(v, 'b') > N(v, 'd')),

  // ═════════ U10.3 — გადანაცვლებადობისა და ჯუფთებადობის კანონები ═════════
  t({
    sub: 'u10-03',
    prompt: 'გამოიყენე გადანაცვლებადობის კანონი და გამოთვალე: {a} + {b} + {c}.',
    vars: { a: I(11, 89), b: I(11, 99), c: D((v) => 100 - N(v, 'a')) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0 && N(v, 'b') !== N(v, 'a') && N(v, 'b') !== N(v, 'c'), note: 'a pair that makes 100' }],
    answer: (v) => sg(100 + N(v, 'b')),
    wrong: (v) => nslips(100 + N(v, 'b'), [N(v, 'b'), 100]),
    why: (v, a) => `${v.a} + ${v.c} = 100; 100 + ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u10-03',
    prompt: 'გამოიყენე ჯუფთებადობის კანონი და გამოთვალე: {a} × {b} × {c}.',
    vars: { pair: C(['25|4', '5|20', '50|2', '20|5', '125|8']), a: D((v) => Number(String(v.pair).split('|')[0])), b: I(3, 9), c: D((v) => Number(String(v.pair).split('|')[1])) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b') * N(v, 'c')),
    wrong: (v) => nslips(N(v, 'a') * N(v, 'b') * N(v, 'c'), [N(v, 'a') * N(v, 'b') * N(v, 'c') / 10, N(v, 'a') * N(v, 'b') * N(v, 'c') * 10]),
    why: (v, a) => `${v.a} × ${v.c} = ${N(v, 'a') * N(v, 'c')}; ${N(v, 'a') * N(v, 'c')} × ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u10-03',
    prompt: 'გამოთვალე მოხერხებული დაჯგუფებით: {a} + {b} + {c} + {d}.',
    vars: { a: I(11, 89), b: I(11, 89), c: D((v) => 100 - N(v, 'a')), d: D((v) => 100 - N(v, 'b')) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0 && N(v, 'a') !== N(v, 'b') && N(v, 'a') + N(v, 'b') !== 100, note: 'two pairs that make 100' }],
    answer: () => '200',
    wrong: () => ['190', '210', '100', '300'],
    why: (v, a) => `${v.a} + ${v.c} = 100, ${v.b} + ${v.d} = 100; 100 + 100 = ${a}.`,
  }),
  t({
    sub: 'u10-03',
    prompt: 'გამოთვალე მოხერხებული დაჯგუფებით: {a} × {b} × {c}.',
    vars: { pair: C(['5|2', '25|4', '50|2', '5|4', '25|2']), a: D((v) => Number(String(v.pair).split('|')[0])), b: I(11, 29), c: D((v) => Number(String(v.pair).split('|')[1])) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b') * N(v, 'c')),
    wrong: (v) => nslips(N(v, 'a') * N(v, 'b') * N(v, 'c'), [N(v, 'a') * N(v, 'b') * N(v, 'c') / 10, N(v, 'a') * N(v, 'b') * N(v, 'c') * 10]),
    why: (v, a) => `${v.a} × ${v.c} = ${N(v, 'a') * N(v, 'c')}; ${N(v, 'a') * N(v, 'c')} × ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u10-03',
    d: 2,
    prompt: 'ჩასვი გამოტოვებული რიცხვი: {a} × (□ × {c}) = ({a} × {b}) × {c}.',
    vars: { a: I(11, 29), b: I(2, 9), c: I(2, 9) },
    constraints: [{ test: (v) => N(v, 'b') !== N(v, 'c'), note: 'distinct' }],
    answer: (v) => String(N(v, 'b')),
    wrong: (v) => [N(v, 'a'), N(v, 'c'), N(v, 'a') * N(v, 'b'), N(v, 'b') + 1, N(v, 'b') - 1, N(v, 'b') * N(v, 'c')],
    why: (_v, a) => `ჯუფთებადობის კანონით პირველ ფრჩხილში ${a} უნდა იყოს.`,
  }),
  t({
    sub: 'u10-03',
    d: 2,
    prompt: 'გამოიყენე მოქმედებათა კანონები და გამოთვალე: {a} × {b} × {c}.',
    vars: { pair: C(['125|8', '25|4', '50|2', '20|5', '250|4']), a: D((v) => Number(String(v.pair).split('|')[0])), b: D((v) => Number(String(v.pair).split('|')[1])), c: I(3, 19) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b') * N(v, 'c')),
    wrong: (v) => nslips(N(v, 'a') * N(v, 'b') * N(v, 'c'), [N(v, 'a') * N(v, 'b') * N(v, 'c') / 10, N(v, 'a') * N(v, 'b') * N(v, 'c') * 10]),
    why: (v, a) => `${v.a} × ${v.b} = ${N(v, 'a') * N(v, 'b')}; ${N(v, 'a') * N(v, 'b')} × ${v.c} = ${a}.`,
  }),

  // ═════════ U10.4 — უცნობი მამრავლი ═════════
  t({
    sub: 'u10-04',
    prompt: 'იპოვე {L}: {L} × {a} = {p}.',
    vars: { L, a: I(3, 9), x: I(4, 12), p: D((v) => N(v, 'a') * N(v, 'x')) },
    answer: (v) => String(N(v, 'x')),
    wrong: (v) => [N(v, 'p') - N(v, 'a'), N(v, 'p') + N(v, 'a'), N(v, 'x') + 1, N(v, 'x') - 1, N(v, 'a'), N(v, 'p') * N(v, 'a')],
    why: (v, a) => `${v.p} ÷ ${v.a} = ${a}.`,
  }),
  t({
    sub: 'u10-04',
    prompt: 'იპოვე {L}: {a}{L} = {p}.',
    vars: { L, a: I(3, 9), x: I(5, 15), p: D((v) => N(v, 'a') * N(v, 'x')) },
    answer: (v) => String(N(v, 'x')),
    wrong: (v) => [N(v, 'p') - N(v, 'a'), N(v, 'p') + N(v, 'a'), N(v, 'x') + 1, N(v, 'x') - 1, N(v, 'a'), N(v, 'p') * N(v, 'a')],
    why: (v, a) => `${v.p} ÷ ${v.a} = ${a}.`,
  }),
  t({
    sub: 'u10-04',
    prompt: 'იპოვე {L}: {a}{L} = {p}.',
    vars: { L, a: I(6, 9), x: I(12, 29), p: D((v) => N(v, 'a') * N(v, 'x')) },
    answer: (v) => String(N(v, 'x')),
    wrong: (v) => [N(v, 'p') - N(v, 'a'), N(v, 'x') + 1, N(v, 'x') - 1, N(v, 'x') + 10, N(v, 'x') - 10, N(v, 'p') / 2],
    why: (v, a) => `${v.p} ÷ ${v.a} = ${a}.`,
  }),
  t({
    sub: 'u10-04',
    prompt: 'იპოვე {L}: {L} × {a} = {p}.',
    vars: { L, a: C([11, 12, 13, 14, 15]), x: I(6, 19), p: D((v) => N(v, 'a') * N(v, 'x')) },
    answer: (v) => String(N(v, 'x')),
    wrong: (v) => [N(v, 'p') - N(v, 'a'), N(v, 'x') + 1, N(v, 'x') - 1, N(v, 'x') + 10, N(v, 'x') - 10, N(v, 'a')],
    why: (v, a) => `${v.p} ÷ ${v.a} = ${a}.`,
  }),
  t({
    sub: 'u10-04',
    prompt: 'იპოვე {L}: {a}{L} = {p}.',
    vars: { L, a: C([12, 13, 14, 15, 16, 25]), x: I(8, 29), p: D((v) => N(v, 'a') * N(v, 'x')) },
    answer: (v) => String(N(v, 'x')),
    wrong: (v) => [N(v, 'p') - N(v, 'a'), N(v, 'x') + 1, N(v, 'x') - 1, N(v, 'x') + 10, N(v, 'x') - 10, N(v, 'a')],
    why: (v, a) => `${v.p} ÷ ${v.a} = ${a}.`,
  }),
  t({
    sub: 'u10-04',
    d: 2,
    prompt: 'იპოვე {L}: {a}({L} + {b}) = {p}.',
    vars: { L, a: I(3, 9), b: I(2, 6), x: I(2, 12), p: D((v) => N(v, 'a') * (N(v, 'x') + N(v, 'b'))) },
    answer: (v) => String(N(v, 'x')),
    wrong: (v) => [N(v, 'x') + N(v, 'b'), N(v, 'p') / N(v, 'a'), N(v, 'x') + 1, N(v, 'x') - 1, N(v, 'p') / N(v, 'a') + N(v, 'b'), N(v, 'p') - N(v, 'b')],
    why: (v, a) => `${v.p} ÷ ${v.a} = ${N(v, 'x') + N(v, 'b')}; ${N(v, 'x') + N(v, 'b')} − ${v.b} = ${a}.`,
  }),

  // ═════════ U10.5 — გამოსახულებები ერთი ცვლადით ═════════
  ...(
    [
      ['{a}{L} + {b}', (v: Vars) => N(v, 'a') * N(v, 'k') + N(v, 'b'), (v: Vars) => `${N(v, 'a')} × ${N(v, 'k')} + ${N(v, 'b')}`],
      ['{a}{L} − {b}', (v: Vars) => N(v, 'a') * N(v, 'k') - N(v, 'b'), (v: Vars) => `${N(v, 'a')} × ${N(v, 'k')} − ${N(v, 'b')}`],
      [`{a}{L}${sup} + {b}`, (v: Vars) => N(v, 'a') * N(v, 'k') ** 2 + N(v, 'b'), (v: Vars) => `${N(v, 'a')} × ${N(v, 'k')}${sup} + ${N(v, 'b')}`],
      ['{a}{L} + {b}{L} − {c}', (v: Vars) => (N(v, 'a') + N(v, 'b')) * N(v, 'k') - N(v, 'c'), (v: Vars) => `(${N(v, 'a')} + ${N(v, 'b')}) × ${N(v, 'k')} − ${N(v, 'c')}`],
      ['{a}({L} + {b})', (v: Vars) => N(v, 'a') * (N(v, 'k') + N(v, 'b')), (v: Vars) => `${N(v, 'a')} × (${N(v, 'k')} + ${N(v, 'b')})`],
      [`{a}{L}${sup} − {b}{L}`, (v: Vars) => N(v, 'a') * N(v, 'k') ** 2 - N(v, 'b') * N(v, 'k'), (v: Vars) => `${N(v, 'a')} × ${N(v, 'k')}${sup} − ${N(v, 'b')} × ${N(v, 'k')}`],
    ] as Array<[string, (v: Vars) => number, (v: Vars) => string]>
  ).map(([form, value, work], i) =>
    t({
      sub: 'u10-05',
      d: i < 2 ? 1 : 2,
      prompt: `გამოთვალე ${form}, თუ {L} = {k}.`,
      vars: { L, a: I(2, 9), b: i === 5 ? I(2, 3) : I(2, 9), c: I(2, 9), k: I(2, 8) },
      constraints: [{ test: (v) => value(v) > 0 && (i !== 1 || N(v, 'a') * N(v, 'k') > N(v, 'b')) && (i !== 3 || (N(v, 'a') + N(v, 'b')) * N(v, 'k') > N(v, 'c')) && (i !== 5 || N(v, 'a') * N(v, 'k') > N(v, 'b')), note: 'positive value' }],
      answer: (v) => sg(value(v)),
      wrong: (v) => nslips(value(v), i === 2 || i === 5 ? [N(v, 'a') * N(v, 'k') * 2 + N(v, 'b')] : []),
      why: (v, a) => `${work(v)} = ${a}.`,
    }),
  ),

  // ═════════ U10.6 — გამოსახულებები ორი ცვლადით ═════════
  ...(
    [
      ['{x} + {y}', (v: Vars) => N(v, 'u') + N(v, 'w'), (v: Vars) => `${N(v, 'u')} + ${N(v, 'w')}`, 1],
      ['{a}{x} + {b}{y}', (v: Vars) => N(v, 'a') * N(v, 'u') + N(v, 'b') * N(v, 'w'), (v: Vars) => `${N(v, 'a')} × ${N(v, 'u')} + ${N(v, 'b')} × ${N(v, 'w')}`, 1],
      ['{a}{x} − {y}', (v: Vars) => N(v, 'a') * N(v, 'u') - N(v, 'w'), (v: Vars) => `${N(v, 'a')} × ${N(v, 'u')} − ${N(v, 'w')}`, 1],
      ['{x}{y} + {a}', (v: Vars) => N(v, 'u') * N(v, 'w') + N(v, 'a'), (v: Vars) => `${N(v, 'u')} × ${N(v, 'w')} + ${N(v, 'a')}`, 2],
      [`{a}{x}${sup} + {y}`, (v: Vars) => N(v, 'a') * N(v, 'u') ** 2 + N(v, 'w'), (v: Vars) => `${N(v, 'a')} × ${N(v, 'u')}${sup} + ${N(v, 'w')}`, 2],
      ['{a}{x} + {b}{y} − {c}', (v: Vars) => N(v, 'a') * N(v, 'u') + N(v, 'b') * N(v, 'w') - N(v, 'c'), (v: Vars) => `${N(v, 'a')} × ${N(v, 'u')} + ${N(v, 'b')} × ${N(v, 'w')} − ${N(v, 'c')}`, 2],
    ] as Array<[string, (v: Vars) => number, (v: Vars) => string, 1 | 2]>
  ).map(([form, value, work, d]) =>
    t({
      sub: 'u10-06',
      d,
      prompt: `გამოთვალე ${form}, თუ {x} = {u} და {y} = {w}.`,
      vars: { P: C(PAIRS), x: D((v) => String(v.P).split('|')[0]!), y: D((v) => String(v.P).split('|')[1]!), a: I(2, 5), b: I(2, 5), c: I(2, 9), u: I(2, 9), w: I(2, 9) },
      constraints: [{ test: (v) => value(v) > 0 && N(v, 'u') !== N(v, 'w'), note: 'positive value' }],
      answer: (v) => sg(value(v)),
      wrong: (v) => nslips(value(v), [N(v, 'u') + N(v, 'w'), N(v, 'u') * N(v, 'w')]),
      why: (v, a) => `${work(v)} = ${a}.`,
    }),
  ),

  // ═════════ U10.7 — გამოსახულებების გამარტივება ═════════
  lsimp('u10-07', 1, 'გაამარტივე: {e}.', { L, a: I(4, 9), b: I(2, 5), c: I(2, 3) },
    (v) => ({ expr: `${N(v, 'a')}${Lv(v)} + ${N(v, 'b')}${Lv(v)} − ${N(v, 'c')}${Lv(v)}`, co: [N(v, 'a') + N(v, 'b') - N(v, 'c')], names: [Lv(v)], c: 0, why: `${N(v, 'a')} + ${N(v, 'b')} − ${N(v, 'c')} = ${N(v, 'a') + N(v, 'b') - N(v, 'c')}: ` })),
  lsimp('u10-07', 1, 'გაამარტივე: {e}.', { L, a: I(2, 9), b: I(2, 5), c: I(2, 9) },
    (v) => ({ expr: `${N(v, 'a')}${Lv(v)} + ${N(v, 'b')}(${Lv(v)} + ${N(v, 'c')})`, co: [N(v, 'a') + N(v, 'b')], names: [Lv(v)], c: N(v, 'b') * N(v, 'c'), why: `${N(v, 'a')}${Lv(v)} + ${N(v, 'b')}${Lv(v)} + ${N(v, 'b') * N(v, 'c')}: ` })),
  lsimp('u10-07', 2, 'გაამარტივე: {e}.', { L, a: I(2, 5), b: I(2, 4), c: I(2, 9), d: I(1, 5) },
    (v) => ({ expr: `${N(v, 'a')}(${tm(N(v, 'b'), Lv(v))} − ${N(v, 'c')}) + ${tm(N(v, 'd'), Lv(v))}`, co: [N(v, 'a') * N(v, 'b') + N(v, 'd')], names: [Lv(v)], c: -N(v, 'a') * N(v, 'c'), why: `${N(v, 'a') * N(v, 'b')}${Lv(v)} − ${N(v, 'a') * N(v, 'c')} + ${tm(N(v, 'd'), Lv(v))}: ` })),
  lsimp('u10-07', 2, 'გაამარტივე: {e}.', { L, a: I(7, 12), b: I(2, 3), c: I(2, 3), d: I(3, 9) },
    (v) => ({ expr: `${N(v, 'a')}${Lv(v)} − ${N(v, 'b')}(${tm(N(v, 'c'), Lv(v))} − ${N(v, 'd')})`, co: [N(v, 'a') - N(v, 'b') * N(v, 'c')], names: [Lv(v)], c: N(v, 'b') * N(v, 'd'), why: `${N(v, 'a')}${Lv(v)} − ${N(v, 'b') * N(v, 'c')}${Lv(v)} + ${N(v, 'b') * N(v, 'd')}: ` }),
    (v) => N(v, 'a') > N(v, 'b') * N(v, 'c')),
  lsimp('u10-07', 2, 'გაამარტივე: {e}.', { L, a: I(2, 6), b: I(2, 9), c: I(2, 5), d: I(2, 6) },
    (v) => ({ expr: `${N(v, 'a')}(${Lv(v)} + ${N(v, 'b')}) + ${N(v, 'c')}(${Lv(v)} − ${N(v, 'd')})`, co: [N(v, 'a') + N(v, 'c')], names: [Lv(v)], c: N(v, 'a') * N(v, 'b') - N(v, 'c') * N(v, 'd'), why: `${N(v, 'a')}${Lv(v)} + ${N(v, 'a') * N(v, 'b')} + ${N(v, 'c')}${Lv(v)} − ${N(v, 'c') * N(v, 'd')}: ` }),
    (v) => N(v, 'a') * N(v, 'b') !== N(v, 'c') * N(v, 'd')),
  lsimp('u10-07', 3, 'გაამარტივე: {e}.', { L, a: I(2, 4), b: I(2, 4), c: I(2, 6), d: I(2, 3), f: I(2, 5), g: I(2, 9) },
    (v) => ({ expr: `${N(v, 'a')}(${tm(N(v, 'b'), Lv(v))} + ${N(v, 'c')}) − ${N(v, 'd')}(${Lv(v)} − ${N(v, 'f')}) + ${N(v, 'g')}`, co: [N(v, 'a') * N(v, 'b') - N(v, 'd')], names: [Lv(v)], c: N(v, 'a') * N(v, 'c') + N(v, 'd') * N(v, 'f') + N(v, 'g'), why: `${N(v, 'a') * N(v, 'b')}${Lv(v)} + ${N(v, 'a') * N(v, 'c')} − ${N(v, 'd')}${Lv(v)} + ${N(v, 'd') * N(v, 'f')} + ${N(v, 'g')}: ` }),
    (v) => N(v, 'a') * N(v, 'b') > N(v, 'd')),

  // ═════════ U10.8 — გამოსახულების მნიშვნელობის პოვნა ═════════
  ...(
    [
      ['{a}{L} + {b}', (v: Vars) => N(v, 'a') * N(v, 'k') + N(v, 'b'), (v: Vars) => `${N(v, 'a')} × ${N(v, 'k')} + ${N(v, 'b')}`, 1],
      ['{a}{L} − {b}', (v: Vars) => N(v, 'a') * N(v, 'k') - N(v, 'b'), (v: Vars) => `${N(v, 'a')} × ${N(v, 'k')} − ${N(v, 'b')}`, 1],
      [`{L}${sup} + {a}{L}`, (v: Vars) => N(v, 'k') ** 2 + N(v, 'a') * N(v, 'k'), (v: Vars) => `${N(v, 'k')}${sup} + ${N(v, 'a')} × ${N(v, 'k')}`, 2],
    ] as Array<[string, (v: Vars) => number, (v: Vars) => string, 1 | 2]>
  ).map(([form, value, work, d]) =>
    t({
      sub: 'u10-08',
      d,
      prompt: `იპოვე გამოსახულების მნიშვნელობა: ${form}, თუ {L} = {k}.`,
      vars: { L, a: I(2, 9), b: I(2, 9), k: I(3, 9) },
      constraints: [{ test: (v) => value(v) > 0, note: 'positive value' }],
      answer: (v) => sg(value(v)),
      wrong: (v) => nslips(value(v), [N(v, 'k') ** 2 + N(v, 'a'), N(v, 'a') + N(v, 'k')]),
      why: (v, a) => `${work(v)} = ${a}.`,
    }),
  ),
  t({
    sub: 'u10-08',
    d: 2,
    prompt: 'იპოვე გამოსახულების მნიშვნელობა: {a}{x} + {b}{y}, თუ {x} = {u} და {y} = {w}.',
    vars: { P: C(['m|n', 'a|b', 'x|y', 'p|q']), x: D((v) => String(v.P).split('|')[0]!), y: D((v) => String(v.P).split('|')[1]!), a: I(2, 5), b: I(2, 5), u: I(3, 9), w: I(2, 8) },
    constraints: [{ test: (v) => N(v, 'u') !== N(v, 'w'), note: 'distinct' }],
    answer: (v) => sg(N(v, 'a') * N(v, 'u') + N(v, 'b') * N(v, 'w')),
    wrong: (v) => nslips(N(v, 'a') * N(v, 'u') + N(v, 'b') * N(v, 'w'), [N(v, 'a') + N(v, 'u') + N(v, 'b') + N(v, 'w'), (N(v, 'a') + N(v, 'b')) * (N(v, 'u') + N(v, 'w'))]),
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'u')} + ${N(v, 'b')} × ${N(v, 'w')} = ${a}.`,
  }),
  t({
    sub: 'u10-08',
    d: 2,
    prompt: 'იპოვე გამოსახულების მნიშვნელობა: {a}{x}² − {y}, თუ {x} = {u} და {y} = {w}.',
    vars: { P: C(['a|b', 'x|y', 'm|n', 'p|q']), x: D((v) => String(v.P).split('|')[0]!), y: D((v) => String(v.P).split('|')[1]!), a: I(2, 4), u: I(3, 6), w: I(2, 12) },
    constraints: [{ test: (v) => N(v, 'a') * N(v, 'u') ** 2 > N(v, 'w') && N(v, 'u') !== N(v, 'w'), note: 'positive value' }],
    answer: (v) => sg(N(v, 'a') * N(v, 'u') ** 2 - N(v, 'w')),
    wrong: (v) => nslips(N(v, 'a') * N(v, 'u') ** 2 - N(v, 'w'), [(N(v, 'a') * N(v, 'u')) ** 2 - N(v, 'w'), N(v, 'a') * N(v, 'u') * 2 - N(v, 'w')]),
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'u')}² − ${N(v, 'w')} = ${a}.`,
  }),
  t({
    sub: 'u10-08',
    d: 2,
    prompt: 'იპოვე გამოსახულების მნიშვნელობა: {a}({x} + {b}) − {c}{y}, თუ {x} = {u} და {y} = {w}.',
    vars: { P: C(['x|y', 'a|b', 'm|n', 'p|q']), x: D((v) => String(v.P).split('|')[0]!), y: D((v) => String(v.P).split('|')[1]!), a: I(2, 4), b: I(2, 5), c: I(2, 3), u: I(3, 8), w: I(2, 6) },
    constraints: [{ test: (v) => N(v, 'a') * (N(v, 'u') + N(v, 'b')) > N(v, 'c') * N(v, 'w') && N(v, 'u') !== N(v, 'w'), note: 'positive value' }],
    answer: (v) => sg(N(v, 'a') * (N(v, 'u') + N(v, 'b')) - N(v, 'c') * N(v, 'w')),
    wrong: (v) => nslips(N(v, 'a') * (N(v, 'u') + N(v, 'b')) - N(v, 'c') * N(v, 'w'), [N(v, 'a') * N(v, 'u') + N(v, 'b') - N(v, 'c') * N(v, 'w')]),
    why: (v, a) => `${N(v, 'a')} × ${N(v, 'u') + N(v, 'b')} − ${N(v, 'c')} × ${N(v, 'w')} = ${a}.`,
  }),

  // ═════════ U10.9 — განტოლებები ერთი მოქმედებით ═════════
  t({
    sub: 'u10-09', prompt: 'ამოხსენი: {L} + {a} = {p}.',
    vars: { L, a: I(11, 49), x: I(12, 60), p: D((v) => N(v, 'a') + N(v, 'x')) },
    answer: (v) => eqAns(v, N(v, 'x')), wrong: (v) => eqSlips(v, N(v, 'x'), [N(v, 'a') + N(v, 'p')]),
    why: (v, a) => `${v.p} − ${v.a} = ${N(v, 'x')}: ${a}.`,
  }),
  t({
    sub: 'u10-09', prompt: 'ამოხსენი: {L} − {a} = {p}.',
    vars: { L, a: I(11, 49), x: I(30, 90), p: D((v) => N(v, 'x') - N(v, 'a')) },
    constraints: [{ test: (v) => N(v, 'p') > 0, note: 'positive' }],
    answer: (v) => eqAns(v, N(v, 'x')), wrong: (v) => eqSlips(v, N(v, 'x'), [N(v, 'p') - N(v, 'a')]),
    why: (v, a) => `${v.p} + ${v.a} = ${N(v, 'x')}: ${a}.`,
  }),
  t({
    sub: 'u10-09', prompt: 'ამოხსენი: {a}{L} = {p}.',
    vars: { L, a: I(3, 9), x: I(5, 15), p: D((v) => N(v, 'a') * N(v, 'x')) },
    answer: (v) => eqAns(v, N(v, 'x')), wrong: (v) => eqSlips(v, N(v, 'x'), [N(v, 'p') - N(v, 'a'), N(v, 'p') + N(v, 'a')]),
    why: (v, a) => `${v.p} ÷ ${v.a} = ${N(v, 'x')}: ${a}.`,
  }),
  t({
    sub: 'u10-09', d: 2, prompt: 'ამოხსენი: {L}/{a} = {b}.',
    vars: { L, a: I(2, 9), b: I(3, 12), x: D((v) => N(v, 'a') * N(v, 'b')) },
    answer: (v) => eqAns(v, N(v, 'x')), wrong: (v) => eqSlips(v, N(v, 'x'), [N(v, 'a') + N(v, 'b'), N(v, 'b') / N(v, 'a')]),
    why: (v, a) => `${v.b} × ${v.a} = ${N(v, 'x')}: ${a}.`,
  }),
  t({
    sub: 'u10-09', d: 2, prompt: 'ამოხსენი: {L} + {ax} = {p}.',
    vars: { L, a: I(11, 59), x: I(11, 59), ax: D((v) => dd(N(v, 'a'), 1)), xx: D((v) => dd(N(v, 'x'), 1)), p: D((v) => dd(N(v, 'a') + N(v, 'x'), 1)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0 && N(v, 'x') % 10 !== 0, note: 'one place' }],
    answer: (v) => eqAns(v, String(v.xx)),
    options: (v, right) => [right, `${Lv(v)} = ${dd(N(v, 'a') + N(v, 'x'), 1)}`, `${Lv(v)} = ${dd(N(v, 'x') + 10, 1)}`, `${Lv(v)} = ${dd(N(v, 'x') - 10 > 0 ? N(v, 'x') - 10 : N(v, 'x') + 20, 1)}`, `${Lv(v)} = ${dd(N(v, 'x') * 10, 1)}`, `${Lv(v)} = ${dd(N(v, 'x') + 1, 1)}`],
    why: (v, a) => `${v.p} − ${v.ax} = ${v.xx}: ${a}.`,
  }),
  t({
    sub: 'u10-09', d: 2, prompt: 'ამოხსენი: {a}{L} = {p}.',
    vars: { L, a: I(2, 9), x: I(11, 99), p: D((v) => dd(N(v, 'a') * N(v, 'x'), 1)), xx: D((v) => dd(N(v, 'x'), 1)) },
    constraints: [{ test: (v) => N(v, 'x') % 10 !== 0 && (N(v, 'a') * N(v, 'x')) % 10 !== 0, note: 'one place' }],
    answer: (v) => eqAns(v, String(v.xx)),
    options: (v, right) => [right, `${Lv(v)} = ${dd(N(v, 'x') * 10, 1)}`, `${Lv(v)} = ${dd(N(v, 'x'), 2)}`, `${Lv(v)} = ${dd(N(v, 'x') + 10, 1)}`, `${Lv(v)} = ${dd(N(v, 'x') - 10 > 0 ? N(v, 'x') - 10 : N(v, 'x') + 20, 1)}`],
    why: (v, a) => `${v.p} ÷ ${v.a} = ${v.xx}: ${a}.`,
  }),

  // ═════════ U10.10 — განტოლებები ორი მოქმედებით ═════════
  t({
    sub: 'u10-10', prompt: 'ამოხსენი: {a}{L} + {b} = {p}.',
    vars: { L, a: I(2, 9), b: I(2, 12), x: I(3, 12), p: D((v) => N(v, 'a') * N(v, 'x') + N(v, 'b')) },
    answer: (v) => eqAns(v, N(v, 'x')), wrong: (v) => eqSlips(v, N(v, 'x'), [(N(v, 'p') + N(v, 'b')) / N(v, 'a'), N(v, 'p') - N(v, 'b'), N(v, 'p') / N(v, 'a') - N(v, 'b')]),
    why: (v, a) => `${v.p} − ${v.b} = ${N(v, 'p') - N(v, 'b')}; ${N(v, 'p') - N(v, 'b')} ÷ ${v.a} = ${N(v, 'x')}: ${a}.`,
  }),
  t({
    sub: 'u10-10', prompt: 'ამოხსენი: {a}{L} − {b} = {p}.',
    vars: { L, a: I(2, 9), b: I(2, 12), x: I(5, 15), p: D((v) => N(v, 'a') * N(v, 'x') - N(v, 'b')) },
    constraints: [{ test: (v) => N(v, 'p') > 0, note: 'positive' }],
    answer: (v) => eqAns(v, N(v, 'x')), wrong: (v) => eqSlips(v, N(v, 'x'), [(N(v, 'p') - N(v, 'b')) / N(v, 'a'), N(v, 'p') + N(v, 'b'), N(v, 'p') / N(v, 'a') + N(v, 'b')]),
    why: (v, a) => `${v.p} + ${v.b} = ${N(v, 'p') + N(v, 'b')}; ${N(v, 'p') + N(v, 'b')} ÷ ${v.a} = ${N(v, 'x')}: ${a}.`,
  }),
  t({
    sub: 'u10-10', d: 2, prompt: 'ამოხსენი: {L}/{a} + {b} = {p}.',
    vars: { L, a: I(2, 9), b: I(2, 12), m: I(2, 9), x: D((v) => N(v, 'a') * N(v, 'm')), p: D((v) => N(v, 'm') + N(v, 'b')) },
    answer: (v) => eqAns(v, N(v, 'x')), wrong: (v) => eqSlips(v, N(v, 'x'), [N(v, 'p') - N(v, 'b'), N(v, 'p') * N(v, 'a'), (N(v, 'p') + N(v, 'b')) * N(v, 'a')]),
    why: (v, a) => `${v.p} − ${v.b} = ${N(v, 'm')}; ${N(v, 'm')} × ${v.a} = ${N(v, 'x')}: ${a}.`,
  }),
  t({
    sub: 'u10-10', d: 2, prompt: 'ამოხსენი: {a}{L} − {b} = {p}.',
    vars: { L, a: I(5, 9), b: I(6, 19), x: I(7, 19), p: D((v) => N(v, 'a') * N(v, 'x') - N(v, 'b')) },
    answer: (v) => eqAns(v, N(v, 'x')), wrong: (v) => eqSlips(v, N(v, 'x'), [(N(v, 'p') - N(v, 'b')) / N(v, 'a'), N(v, 'p') + N(v, 'b'), N(v, 'p') / N(v, 'a') + N(v, 'b')]),
    why: (v, a) => `${v.p} + ${v.b} = ${N(v, 'p') + N(v, 'b')}; ${N(v, 'p') + N(v, 'b')} ÷ ${v.a} = ${N(v, 'x')}: ${a}.`,
  }),
  t({
    sub: 'u10-10', prompt: 'ამოხსენი: {a}{L} + {b} = {p}.',
    vars: { L, a: I(2, 6), b: I(5, 19), x: I(6, 19), p: D((v) => N(v, 'a') * N(v, 'x') + N(v, 'b')) },
    answer: (v) => eqAns(v, N(v, 'x')), wrong: (v) => eqSlips(v, N(v, 'x'), [(N(v, 'p') + N(v, 'b')) / N(v, 'a'), N(v, 'p') - N(v, 'b'), N(v, 'p') / N(v, 'a') - N(v, 'b')]),
    why: (v, a) => `${v.p} − ${v.b} = ${N(v, 'p') - N(v, 'b')}; ${N(v, 'p') - N(v, 'b')} ÷ ${v.a} = ${N(v, 'x')}: ${a}.`,
  }),
  t({
    sub: 'u10-10', d: 2, prompt: 'ამოხსენი: {a}{L} + {bt} = {pt}.',
    vars: { L, a: I(2, 9), x: I(2, 9), b: C([25, 35, 15, 45, 55]), p: D((v) => N(v, 'a') * N(v, 'x') * 10 + N(v, 'b')), bt: D((v) => dd(N(v, 'b'), 1)), pt: D((v) => dd(N(v, 'p'), 1)) },
    answer: (v) => eqAns(v, N(v, 'x')), wrong: (v) => eqSlips(v, N(v, 'x'), [(N(v, 'p') + N(v, 'b')) / 10 / N(v, 'a'), N(v, 'x') * 10]),
    why: (v, a) => `${v.pt} − ${v.bt} = ${dd(N(v, 'a') * N(v, 'x') * 10, 1)}; ${dd(N(v, 'a') * N(v, 'x') * 10, 1)} ÷ ${v.a} = ${N(v, 'x')}: ${a}.`,
  }),

  // ═════════ U10.11 — მრავალსაფეხურიანი გამოსახულებები ═════════
  t({
    sub: 'u10-11', prompt: 'გამოთვალე: {a}({b} + {c}) − {d}.',
    vars: { a: I(2, 9), b: I(3, 12), c: I(2, 9), d: I(2, 9) },
    answer: (v) => sg(N(v, 'a') * (N(v, 'b') + N(v, 'c')) - N(v, 'd')),
    wrong: (v) => nslips(N(v, 'a') * (N(v, 'b') + N(v, 'c')) - N(v, 'd'), [N(v, 'a') * N(v, 'b') + N(v, 'c') - N(v, 'd'), N(v, 'a') * (N(v, 'b') + N(v, 'c') - N(v, 'd'))]),
    why: (v, a) => `${v.b} + ${v.c} = ${N(v, 'b') + N(v, 'c')}; ${v.a} × ${N(v, 'b') + N(v, 'c')} − ${v.d} = ${a}.`,
  }),
  t({
    sub: 'u10-11', prompt: 'გამოთვალე: {a} ÷ {b} + {c} × {d}.',
    vars: { b: I(2, 9), m: I(3, 12), a: D((v) => N(v, 'b') * N(v, 'm')), c: I(2, 9), d: I(2, 9) },
    answer: (v) => sg(N(v, 'm') + N(v, 'c') * N(v, 'd')),
    wrong: (v) => nslips(N(v, 'm') + N(v, 'c') * N(v, 'd'), [(N(v, 'm') + N(v, 'c')) * N(v, 'd')]),
    why: (v, a) => `${v.a} ÷ ${v.b} = ${N(v, 'm')}; ${v.c} × ${v.d} = ${N(v, 'c') * N(v, 'd')}; ${N(v, 'm')} + ${N(v, 'c') * N(v, 'd')} = ${a}.`,
  }),
  t({
    sub: 'u10-11', prompt: 'გამოთვალე: {a}({b} − {c}) + {e} ÷ {f}.',
    vars: { a: I(2, 9), b: I(10, 20), c: I(2, 9), f: I(2, 6), m: I(2, 9), e: D((v) => N(v, 'f') * N(v, 'm')) },
    answer: (v) => sg(N(v, 'a') * (N(v, 'b') - N(v, 'c')) + N(v, 'm')),
    wrong: (v) => nslips(N(v, 'a') * (N(v, 'b') - N(v, 'c')) + N(v, 'm'), [N(v, 'a') * N(v, 'b') - N(v, 'c') + N(v, 'm')]),
    why: (v, a) => `${v.a} × ${N(v, 'b') - N(v, 'c')} = ${N(v, 'a') * (N(v, 'b') - N(v, 'c'))}; ${v.e} ÷ ${v.f} = ${N(v, 'm')}; ${a}.`,
  }),
  t({
    sub: 'u10-11', d: 2, prompt: 'გამოთვალე: {a} ÷ ({b} × {c}) + {d}.',
    vars: { b: I(2, 6), c: I(2, 6), m: I(2, 9), a: D((v) => N(v, 'b') * N(v, 'c') * N(v, 'm')), d: I(2, 12) },
    answer: (v) => sg(N(v, 'm') + N(v, 'd')),
    wrong: (v) => nslips(N(v, 'm') + N(v, 'd'), [N(v, 'a') / N(v, 'b') * N(v, 'c') + N(v, 'd')]),
    why: (v, a) => `${v.b} × ${v.c} = ${N(v, 'b') * N(v, 'c')}; ${v.a} ÷ ${N(v, 'b') * N(v, 'c')} = ${N(v, 'm')}; ${N(v, 'm')} + ${v.d} = ${a}.`,
  }),
  t({
    sub: 'u10-11', d: 2, prompt: 'გამოთვალე: {a}[{b} − ({c} + {d})] + {e}.',
    vars: { a: I(2, 6), c: I(2, 7), d: I(2, 7), b: I(15, 25), e: I(2, 9) },
    constraints: [{ test: (v) => N(v, 'b') > N(v, 'c') + N(v, 'd'), note: 'positive bracket' }],
    answer: (v) => sg(N(v, 'a') * (N(v, 'b') - (N(v, 'c') + N(v, 'd'))) + N(v, 'e')),
    wrong: (v) => nslips(N(v, 'a') * (N(v, 'b') - (N(v, 'c') + N(v, 'd'))) + N(v, 'e'), [N(v, 'a') * (N(v, 'b') - N(v, 'c') + N(v, 'd')) + N(v, 'e')]),
    why: (v, a) => `${v.c} + ${v.d} = ${N(v, 'c') + N(v, 'd')}; ${v.b} − ${N(v, 'c') + N(v, 'd')} = ${N(v, 'b') - N(v, 'c') - N(v, 'd')}; ${v.a} × ${N(v, 'b') - N(v, 'c') - N(v, 'd')} + ${v.e} = ${a}.`,
  }),
  t({
    sub: 'u10-11', d: 2, prompt: 'გამოთვალე: {a}({b}{L} + {c}) − {d}, თუ {L} = {k}.',
    vars: { L, a: I(2, 5), b: I(2, 5), c: I(2, 6), d: I(2, 9), k: I(2, 6) },
    answer: (v) => sg(N(v, 'a') * (N(v, 'b') * N(v, 'k') + N(v, 'c')) - N(v, 'd')),
    wrong: (v) => nslips(N(v, 'a') * (N(v, 'b') * N(v, 'k') + N(v, 'c')) - N(v, 'd'), [N(v, 'a') * N(v, 'b') * N(v, 'k') + N(v, 'c') - N(v, 'd')]),
    why: (v, a) => `${v.b} × ${v.k} + ${v.c} = ${N(v, 'b') * N(v, 'k') + N(v, 'c')}; ${v.a} × ${N(v, 'b') * N(v, 'k') + N(v, 'c')} − ${v.d} = ${a}.`,
  }),

  // ═════════ U10.12 — აკმაყოფილებს თუ არა (x, y) ტოლობას? ═════════
  ...(
    [
      ['{x} + {y} = {s}', (v: Vars) => N(v, 'u') + N(v, 'w'), 1],
      ['{a}{x} + {y} = {s}', (v: Vars) => N(v, 'a') * N(v, 'u') + N(v, 'w'), 1],
      ['{x} + {a}{y} = {s}', (v: Vars) => N(v, 'u') + N(v, 'a') * N(v, 'w'), 1],
      ['{a}{x} − {y} = {s}', (v: Vars) => N(v, 'a') * N(v, 'u') - N(v, 'w'), 2],
      ['{x}{y} = {s}', (v: Vars) => N(v, 'u') * N(v, 'w'), 2],
      ['{a}{x} + {b}{y} = {s}', (v: Vars) => N(v, 'a') * N(v, 'u') + N(v, 'b') * N(v, 'w'), 2],
    ] as Array<[string, (v: Vars) => number, 1 | 2]>
  ).map(([form, value, d]) =>
    t({
      sub: 'u10-12',
      d,
      prompt: `აკმაყოფილებს თუ არა წყვილი ({u}, {w}) ტოლობას ${form}?`,
      vars: { x: D(() => 'x'), y: D(() => 'y'), a: I(2, 5), b: I(2, 5), u: I(2, 9), w: I(2, 9), off: C([0, 0, 1, -1, 2, -2]), s: D((v) => value(v) + N(v, 'off')) },
      constraints: [{ test: (v) => N(v, 'u') !== N(v, 'w') && N(v, 's') > 0, note: 'a positive right side' }],
      optionCount: 2,
      answer: (v) => (N(v, 'off') === 0 ? 'დიახ' : 'არა'),
      options: () => ['დიახ', 'არა'],
      why: (v, a) => `${value(v)} ${N(v, 'off') === 0 ? '=' : '≠'} ${v.s}; პასუხი: ${a}.`,
    }),
  ),

  // ═════════ U10.13 — უტოლობები ═════════
  t({
    sub: 'u10-13', prompt: 'ამოხსენი: {L} + {a} > {p}.',
    vars: { L, a: I(2, 9), b: I(3, 20), p: D((v) => N(v, 'a') + N(v, 'b')) },
    answer: (v) => `${Lv(v)} > ${N(v, 'b')}`,
    options: (v, right) => [right, `${Lv(v)} < ${N(v, 'b')}`, `${Lv(v)} > ${N(v, 'p') + N(v, 'a')}`, `${Lv(v)} < ${N(v, 'p') + N(v, 'a')}`, `${Lv(v)} > ${N(v, 'b') + 1}`],
    why: (v, a) => `${v.p} − ${v.a} = ${N(v, 'b')}: ${a}.`,
  }),
  t({
    sub: 'u10-13', prompt: 'ამოხსენი: {L} − {a} ≤ {p}.',
    vars: { L, a: I(2, 9), p: I(3, 20), b: D((v) => N(v, 'a') + N(v, 'p')) },
    answer: (v) => `${Lv(v)} ≤ ${N(v, 'b')}`,
    options: (v, right) => [right, `${Lv(v)} ≥ ${N(v, 'b')}`, `${Lv(v)} ≤ ${N(v, 'p') - N(v, 'a') > 0 ? N(v, 'p') - N(v, 'a') : N(v, 'p') + 1}`, `${Lv(v)} < ${N(v, 'b')}`, `${Lv(v)} ≥ ${N(v, 'p')}`],
    why: (v, a) => `${v.p} + ${v.a} = ${N(v, 'b')}: ${a}.`,
  }),
  t({
    sub: 'u10-13', prompt: 'ამოხსენი: {a}{L} < {p}.',
    vars: { L, a: I(2, 9), b: I(3, 12), p: D((v) => N(v, 'a') * N(v, 'b')) },
    answer: (v) => `${Lv(v)} < ${N(v, 'b')}`,
    options: (v, right) => [right, `${Lv(v)} > ${N(v, 'b')}`, `${Lv(v)} < ${N(v, 'p') - N(v, 'a')}`, `${Lv(v)} > ${N(v, 'p') - N(v, 'a')}`, `${Lv(v)} < ${N(v, 'b') + 1}`],
    why: (v, a) => `${v.p} ÷ ${v.a} = ${N(v, 'b')}: ${a}.`,
  }),
  t({
    sub: 'u10-13', d: 2, prompt: 'ამოხსენი: {L}/{a} ≥ {b}.',
    vars: { L, a: I(2, 9), b: I(3, 12), p: D((v) => N(v, 'a') * N(v, 'b')) },
    answer: (v) => `${Lv(v)} ≥ ${N(v, 'p')}`,
    options: (v, right) => [right, `${Lv(v)} ≤ ${N(v, 'p')}`, `${Lv(v)} ≥ ${N(v, 'b') / N(v, 'a') === Math.floor(N(v, 'b') / N(v, 'a')) ? N(v, 'b') / N(v, 'a') : N(v, 'a') + N(v, 'b')}`, `${Lv(v)} ≥ ${N(v, 'a') + N(v, 'b')}`, `${Lv(v)} > ${N(v, 'p')}`],
    why: (v, a) => `${v.b} × ${v.a} = ${N(v, 'p')}: ${a}.`,
  }),
  t({
    sub: 'u10-13', d: 2, prompt: 'იპოვე {L} ცვლადის უდიდესი მთელი მნიშვნელობა, თუ {a}{L} + {b} < {c}.',
    vars: { L, a: I(2, 6), b: I(2, 9), c: I(12, 40) },
    answer: (v) => sg(Math.ceil((N(v, 'c') - N(v, 'b')) / N(v, 'a')) - 1),
    wrong: (v) => { const q = (N(v, 'c') - N(v, 'b')) / N(v, 'a'); return [Math.floor(q), Math.ceil(q), Math.floor(q) + 2, Math.round(N(v, 'c') / N(v, 'a')), Math.ceil(q) + 1].filter((x) => x > 0); },
    why: (v, a) => `${v.a}${Lv(v)} < ${N(v, 'c') - N(v, 'b')}, ${Lv(v)} < ${mixed(fr(N(v, 'c') - N(v, 'b'), N(v, 'a')))}; უდიდესი მთელი მნიშვნელობა: ${a}.`,
  }),
  t({
    sub: 'u10-13', d: 2, prompt: 'იპოვე {L} ცვლადის უმცირესი მთელი მნიშვნელობა, თუ {a}{L} − {b} ≥ {c}.',
    vars: { L, a: I(2, 6), b: I(2, 9), c: I(12, 40) },
    answer: (v) => sg(Math.ceil((N(v, 'c') + N(v, 'b')) / N(v, 'a'))),
    wrong: (v) => { const q = (N(v, 'c') + N(v, 'b')) / N(v, 'a'); return [Math.floor(q), Math.ceil(q) + 1, Math.ceil(q) - 1, Math.floor(q) + 2, Math.round(N(v, 'c') / N(v, 'a'))].filter((x) => x > 0); },
    why: (v, a) => `${v.a}${Lv(v)} ≥ ${N(v, 'c') + N(v, 'b')}, ${Lv(v)} ≥ ${mixed(fr(N(v, 'c') + N(v, 'b'), N(v, 'a')))}; უმცირესი მთელი მნიშვნელობა: ${a}.`,
  }),

  // ═════════ U10.14 — განტოლებები ათწილადებითა და წილადებით ═════════
  t({
    sub: 'u10-14', prompt: 'ამოხსენი: {L} + {at} = {pt}.',
    vars: { L, a: I(11, 59), x: I(21, 99), at: D((v) => dd(N(v, 'a'), 1)), p: D((v) => N(v, 'a') + N(v, 'x')), pt: D((v) => dd(N(v, 'a') + N(v, 'x'), 1)), xt: D((v) => dd(N(v, 'x'), 1)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0 && N(v, 'x') % 10 !== 0, note: 'one place' }],
    answer: (v) => eqAns(v, String(v.xt)),
    options: (v, right) => [right, `${Lv(v)} = ${dd(N(v, 'a') + N(v, 'p'), 1)}`, `${Lv(v)} = ${dd(N(v, 'x') + 10, 1)}`, `${Lv(v)} = ${dd(N(v, 'x') - 10 > 0 ? N(v, 'x') - 10 : N(v, 'x') + 20, 1)}`, `${Lv(v)} = ${dd(N(v, 'x') * 10, 1)}`],
    why: (v, a) => `${v.pt} − ${v.at} = ${v.xt}: ${a}.`,
  }),
  t({
    sub: 'u10-14', prompt: 'ამოხსენი: {L} − {at} = {pt}.',
    vars: { L, a: I(11, 39), p: I(21, 69), x: D((v) => N(v, 'a') + N(v, 'p')), at: D((v) => dd(N(v, 'a'), 1)), pt: D((v) => dd(N(v, 'p'), 1)), xt: D((v) => dd(N(v, 'a') + N(v, 'p'), 1)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0 && N(v, 'p') % 10 !== 0 && N(v, 'x') % 10 !== 0, note: 'one place' }],
    answer: (v) => eqAns(v, String(v.xt)),
    options: (v, right) => [right, `${Lv(v)} = ${dd(N(v, 'p') - N(v, 'a') > 0 ? N(v, 'p') - N(v, 'a') : N(v, 'p') + 10, 1)}`, `${Lv(v)} = ${dd(N(v, 'x') + 10, 1)}`, `${Lv(v)} = ${dd(N(v, 'x') - 10, 1)}`, `${Lv(v)} = ${dd(N(v, 'x') * 10, 1)}`],
    why: (v, a) => `${v.pt} + ${v.at} = ${v.xt}: ${a}.`,
  }),
  t({
    sub: 'u10-14', prompt: 'ამოხსენი: {a}{L} = {pt}.',
    vars: { L, a: I(2, 9), x: I(11, 59), pt: D((v) => dd(N(v, 'a') * N(v, 'x'), 1)), xt: D((v) => dd(N(v, 'x'), 1)) },
    constraints: [{ test: (v) => N(v, 'x') % 10 !== 0 && (N(v, 'a') * N(v, 'x')) % 10 !== 0, note: 'one place' }],
    answer: (v) => eqAns(v, String(v.xt)),
    options: (v, right) => [right, `${Lv(v)} = ${dd(N(v, 'x') * 10, 1)}`, `${Lv(v)} = ${dd(N(v, 'x'), 2)}`, `${Lv(v)} = ${dd(N(v, 'x') + 10, 1)}`, `${Lv(v)} = ${dd(N(v, 'x') + 1, 1)}`],
    why: (v, a) => `${v.pt} ÷ ${v.a} = ${v.xt}: ${a}.`,
  }),
  t({
    sub: 'u10-14', d: 2, prompt: 'ამოხსენი: {L}/{a} = {pt}.',
    vars: { L, a: I(2, 9), m: C([225, 125, 175, 375, 75, 15, 35, 45]), x: D((v) => N(v, 'a') * N(v, 'm')), pt: D((v) => fx(N(v, 'm'), 2)), xt: D((v) => dd(N(v, 'a') * N(v, 'm'), 2)) },
    answer: (v) => eqAns(v, String(v.xt)),
    options: (v, right) => [right, `${Lv(v)} = ${dd(N(v, 'm') + N(v, 'a') * 100, 2)}`, `${Lv(v)} = ${dd(N(v, 'a') * N(v, 'm') * 10, 2)}`, `${Lv(v)} = ${dd(N(v, 'a') * N(v, 'm') + 100, 2)}`, `${Lv(v)} = ${dd(N(v, 'm') / N(v, 'a'), 2)}`],
    why: (v, a) => `${v.pt} × ${v.a} = ${v.xt}: ${a}.`,
  }),
  t({
    sub: 'u10-14', d: 2, prompt: 'ამოხსენი: {L} + {f1} = {f2}.',
    vars: { L, f1: C(['2/3', '1/4', '1/5', '3/8', '1/6', '2/7', '3/5']), f2: C(['5/3', '3/4', '4/5', '7/8', '5/6', '6/7', '8/5', '7/4', '9/5']) },
    constraints: [{ test: (v) => fSub(fv(v, 'f2'), fv(v, 'f1')).n > 0 && fSub(fv(v, 'f2'), fv(v, 'f1')).d <= 40, note: 'a positive answer' }],
    answer: (v) => eqAns(v, mixed(fSub(fv(v, 'f2'), fv(v, 'f1')))),
    options: (v, right) => [right, ...fracSlips(fSub(fv(v, 'f2'), fv(v, 'f1')), [fAdd(fv(v, 'f1'), fv(v, 'f2'))], (f) => `${Lv(v)} = ${mixed(f)}`)],
    why: (v, a) => `${String(v.f2)} − ${String(v.f1)} = ${mixed(fSub(fv(v, 'f2'), fv(v, 'f1')))}: ${a}.`,
  }),
  t({
    sub: 'u10-14', d: 2, prompt: 'ამოხსენი: ({f}){L} = {k}.',
    vars: { L, f: C(['3/4', '2/3', '3/5', '2/5', '4/5', '3/8', '5/6']), m: I(2, 9), k: D((v) => Number(String(v.f).split('/')[0]) * N(v, 'm')) },
    answer: (v) => eqAns(v, Number(String(v.f).split('/')[1]) * N(v, 'm')),
    wrong: (v) => eqSlips(v, Number(String(v.f).split('/')[1]) * N(v, 'm'), [N(v, 'k') * Number(String(v.f).split('/')[0]) / Number(String(v.f).split('/')[1])]),
    why: (v, a) => `${v.k} ÷ ${String(v.f)} = ${v.k} × ${String(v.f).split('/')[1]}/${String(v.f).split('/')[0]}; ${a}.`,
  }),

  // ═════════ U10.15 — გამოსახულებების შედგენა ასოებით ═════════
  t({
    sub: 'u10-15', prompt: 'ჩაწერე გამოსახულება: რიცხვ x-ს დაუმატე {k}.',
    vars: { k: I(3, 20) },
    answer: (v) => `x + ${N(v, 'k')}`,
    options: (v, right) => [right, `x − ${N(v, 'k')}`, `${N(v, 'k')}x`, `${N(v, 'k')} − x`, `x × ${N(v, 'k')}`],
    why: (_v, a) => `დამატება ნიშნავს შეკრებას: ${a}.`,
  }),
  t({
    sub: 'u10-15', prompt: 'ჩაწერე გამოსახულება: რიცხვ a-ს გაამრავლე რიცხვზე {k} და გამოაკელი {m}.',
    vars: { k: I(2, 9), m: I(2, 9) },
    answer: (v) => `${N(v, 'k')}a − ${N(v, 'm')}`,
    options: (v, right) => [right, `${N(v, 'k')}(a − ${N(v, 'm')})`, `a + ${N(v, 'k')} − ${N(v, 'm')}`, `${N(v, 'k')}a + ${N(v, 'm')}`, `${N(v, 'm')}a − ${N(v, 'k')}`],
    why: (v, a) => `ჯერ ნამრავლი ${N(v, 'k')}a, შემდეგ გამოკლება: ${a}.`,
  }),
  t({
    sub: 'u10-15', d: 2, prompt: 'ჯამი: y და რიცხვი {k}. ეს ჯამი გაამრავლეს რიცხვზე {m}. ჩაწერე გამოსახულება.',
    vars: { k: I(2, 12), m: I(2, 9) },
    answer: (v) => `${N(v, 'm')}(y + ${N(v, 'k')})`,
    options: (v, right) => [right, `${N(v, 'm')}y + ${N(v, 'k')}`, `y + ${N(v, 'k') * N(v, 'm')}`, `${N(v, 'm')} + y + ${N(v, 'k')}`, `${N(v, 'm')}(y − ${N(v, 'k')})`],
    why: (_v, a) => `ჯამს ფრჩხილებში ვწერთ: ${a}.`,
  }),
  t({
    sub: 'u10-15', d: 2, prompt: 'მართკუთხედის სიგრძეა {p}, სიგანე კი {q}. ჩაწერე მისი პერიმეტრის გამოსახულება.',
    vars: { P: C(PAIRS), p: D((v) => String(v.P).split('|')[0]!), q: D((v) => String(v.P).split('|')[1]!) },
    answer: (v) => `2(${v.p} + ${v.q})`,
    options: (v, right) => [right, `2${v.p} + ${v.q}`, `${v.p} + ${v.q}`, `${v.p}${v.q}`, `2${v.p}${v.q}`],
    why: (v, a) => `P = 2 × (${v.p} + ${v.q}): ${a}.`,
  }),
  t({
    sub: 'u10-15', prompt: 'ერთი რვეული ღირს {L} ლარი. ჩაწერე {k} რვეულის ღირებულების გამოსახულება.',
    vars: { L, k: I(3, 12) },
    answer: (v) => `${N(v, 'k')}${Lv(v)}`,
    options: (v, right) => [right, `${Lv(v)} + ${N(v, 'k')}`, `${Lv(v)}/${N(v, 'k')}`, `${Lv(v)} − ${N(v, 'k')}`, `${N(v, 'k')} − ${Lv(v)}`],
    why: (v, a) => `${N(v, 'k')} ცალის ფასი: ${N(v, 'k')} × ${Lv(v)} = ${a}.`,
  }),
  t({
    sub: 'u10-15', d: 2, prompt: 'ორი რიცხვის ჯამია {s}. ჩაწერე გამოსახულება, რომელიც ამ ჯამის ნახევარს აღნიშნავს.',
    vars: { P: C(PAIRS), p: D((v) => String(v.P).split('|')[0]!), q: D((v) => String(v.P).split('|')[1]!), s: D((v) => `(${String(v.P).split('|')[0]} + ${String(v.P).split('|')[1]})`) },
    answer: (v) => `(${v.p} + ${v.q})/2`,
    options: (v, right) => [right, `${v.p} + ${v.q}/2`, `2(${v.p} + ${v.q})`, `${v.p} + ${v.q} − 2`, `(${v.p} + ${v.q}) × 2`],
    why: (v, a) => `ჯამი (${v.p} + ${v.q}), მისი ნახევარია ${a}.`,
  }),
];

/** A fraction as `2 1/3`, `3/4` or a whole number. */
function mixed(f: ReturnType<typeof fr>): string {
  const top = Math.abs(f.n);
  const whole = Math.floor(top / f.d);
  const rest = top % f.d;
  const body = rest === 0 ? String(whole) : whole === 0 ? `${rest}/${f.d}` : `${whole} ${rest}/${f.d}`;
  return f.n < 0 ? `${MINUS}${body}` : body;
}
