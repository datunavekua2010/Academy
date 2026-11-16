import type { QuestionTemplate, Vars } from './types';
import { C, D, I, MINUS, N, S, dec, factorize, fAdd, fDiv, fMul, fSub, fCmp, fText, fr, gcd, group, lcm, mText, par, q6, rawF, sg } from './g6-helpers';
import { dd } from './g6-dec';
import { fracSlips, fv, mixedPool, nd, properPool, wnd } from './g6-frac';

/**
 * Grade VII — Unit 1: რიცხვები და მოქმედებები (numbers and operations).
 *
 * Converted from the academy's Grade VII `U01` bank: 14 subtopics × 6 questions.
 *
 * Every question is a pattern whose numbers are drawn; the key and each wrong
 * option come from the same drawn values and stand for a slip students really
 * make (dropping a sign, adding instead of subtracting, forgetting to reduce).
 */

export const G7_U01_SUBTOPICS = [
  'u01-01', 'u01-02', 'u01-03', 'u01-04', 'u01-05', 'u01-06', 'u01-07',
  'u01-08', 'u01-09', 'u01-10', 'u01-11', 'u01-12', 'u01-13', 'u01-14',
] as const;

const T = 'g7-numbers-ops';
let seq = 0;
const nextId = (): string => `g7-u01-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic' | 'grade'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, grade: 7, ...spec });

/** Wrong options around a fraction key; signed keys get their own neighbours. */
const fracWrong = (answer: ReturnType<typeof fr>, extra: Array<ReturnType<typeof fr>> = []): string[] => {
  const a = { n: Math.abs(answer.n), d: answer.d };
  const sign = answer.n < 0 ? -1 : 1;
  const base = fracSlips(a, extra.map((f) => fr(Math.abs(f.n), f.d)));
  return base.filter((s) => s !== mText(a)).map((s) => (sign < 0 ? `${MINUS}${s}` : s));
};

const SQUARES = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144];
const NON_SQUARES = [2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 38, 39, 40];
const isSquare = (n: number): boolean => Number.isInteger(Math.sqrt(n));

const quotientAndRest = (a: number, b: number): string => `${Math.floor(a / b)}, ნაშთი ${a % b}`;
const quotientSlips = (a: number, b: number): string[] => {
  const qt = Math.floor(a / b);
  const r = a % b;
  return [`${qt + 1}, ნაშთი ${b - r}`, `${qt}, ნაშთი ${r + 1}`, `${qt - 1}, ნაშთი ${r + b}`, `${r}, ნაშთი ${qt}`, `${qt + 1}, ნაშთი ${r}`];
};

const periodText = (digits: string): string => `0,(${digits})`;

export const G7_U01_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U01.1 — მოდული ═════════
  t({
    sub: 'u01-01',
    prompt: 'გამოთვალე: |{aS}|.',
    vars: { a: I(-40, 40, { nonZero: true }), aS: S('a') },
    answer: (v) => sg(Math.abs(N(v, 'a'))),
    wrong: (v) => [-Math.abs(N(v, 'a')), N(v, 'a') < 0 ? N(v, 'a') : -N(v, 'a'), Math.abs(N(v, 'a')) + 1, Math.abs(N(v, 'a')) - 1],
    why: (v, a) => `რიცხვის მოდული არის მისი მანძილი ნულიდან: |${sg(N(v, 'a'))}| = ${a}.`,
  }),
  t({
    sub: 'u01-01',
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(-30, 30, { nonZero: true }), b: I(-30, 30, { nonZero: true }), e: D((v) => `|${sg(N(v, 'a'))}| + |${sg(N(v, 'b'))}|`) },
    answer: (v) => sg(Math.abs(N(v, 'a')) + Math.abs(N(v, 'b'))),
    wrong: (v) => [N(v, 'a') + N(v, 'b'), Math.abs(N(v, 'a') + N(v, 'b')), Math.abs(Math.abs(N(v, 'a')) - Math.abs(N(v, 'b'))), -(Math.abs(N(v, 'a')) + Math.abs(N(v, 'b')))],
    why: (v, a) => `${String(v.e)} = ${Math.abs(N(v, 'a'))} + ${Math.abs(N(v, 'b'))} = ${a}.`,
  }),
  t({
    sub: 'u01-01',
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(-30, 30, { nonZero: true }), b: I(-30, 30, { nonZero: true }), e: D((v) => `|${sg(N(v, 'a'))}| ${MINUS} |${sg(N(v, 'b'))}|`) },
    answer: (v) => sg(Math.abs(N(v, 'a')) - Math.abs(N(v, 'b'))),
    wrong: (v) => [Math.abs(N(v, 'a')) + Math.abs(N(v, 'b')), N(v, 'a') - N(v, 'b'), Math.abs(N(v, 'b')) - Math.abs(N(v, 'a')), N(v, 'a') + N(v, 'b')],
    why: (v, a) => `${String(v.e)} = ${Math.abs(N(v, 'a'))} ${MINUS} ${Math.abs(N(v, 'b'))} = ${a}.`,
  }),
  t({
    sub: 'u01-01',
    d: 2,
    prompt: 'იპოვე x, თუ |x| = {k}. ჩაწერე ორივე შესაძლო მნიშვნელობა.',
    vars: { k: I(2, 40) },
    answer: (v) => `${MINUS}${N(v, 'k')} და ${N(v, 'k')}`,
    options: (v, right) => [right, `მხოლოდ ${N(v, 'k')}`, `მხოლოდ ${MINUS}${N(v, 'k')}`, `0 და ${N(v, 'k')}`],
    why: (v, a) => `|x| = ${v.k} ნიშნავს, რომ x ნულიდან ${v.k} ერთეულითაა დაშორებული: ${a}.`,
  }),
  t({
    sub: 'u01-01',
    d: 2,
    prompt: 'შეადარე: |{aS}| და |{bS}|. რომელი მეტია და რამდენით?',
    vars: { a: I(-30, 30, { nonZero: true }), b: I(-30, 30, { nonZero: true }), aS: S('a'), bS: S('b') },
    constraints: [{ test: (v: Vars) => Math.abs(N(v, 'a')) !== Math.abs(N(v, 'b')), note: 'different moduli' }],
    answer: (v) => {
      const big = Math.abs(N(v, 'a')) > Math.abs(N(v, 'b')) ? 'a' : 'b';
      return `|${sg(N(v, big))}| მეტია ${Math.abs(Math.abs(N(v, 'a')) - Math.abs(N(v, 'b')))}-ით`;
    },
    options: (v, right) => {
      const [ma, mb] = [Math.abs(N(v, 'a')), Math.abs(N(v, 'b'))];
      const diff = Math.abs(ma - mb);
      const big = ma > mb ? 'a' : 'b';
      const small = ma > mb ? 'b' : 'a';
      return [right, `|${sg(N(v, small))}| მეტია ${diff}-ით`, `|${sg(N(v, big))}| მეტია ${ma + mb}-ით`, `|${sg(N(v, big))}| მეტია ${diff + 1}-ით`, `|${sg(N(v, big))}| მეტია ${Math.abs(N(v, 'a') - N(v, 'b'))}-ით`];
    },
    why: (v, a) => `|${sg(N(v, 'a'))}| = ${Math.abs(N(v, 'a'))}, |${sg(N(v, 'b'))}| = ${Math.abs(N(v, 'b'))}; ${a}.`,
  }),
  t({
    sub: 'u01-01',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: {
      a: I(-20, 20, { nonZero: true }), b: I(-20, 20, { nonZero: true }), c: I(-20, 20, { nonZero: true }),
      e: D((v) => `|${sg(N(v, 'a'))}| + |${sg(N(v, 'b'))}| ${MINUS} |${sg(N(v, 'c'))}|`),
    },
    answer: (v) => sg(Math.abs(N(v, 'a')) + Math.abs(N(v, 'b')) - Math.abs(N(v, 'c'))),
    wrong: (v) => [N(v, 'a') + N(v, 'b') - N(v, 'c'), Math.abs(N(v, 'a')) + Math.abs(N(v, 'b')) + Math.abs(N(v, 'c')), Math.abs(N(v, 'a')) - Math.abs(N(v, 'b')) - Math.abs(N(v, 'c')), Math.abs(N(v, 'a') + N(v, 'b') - N(v, 'c'))],
    why: (v, a) => `${Math.abs(N(v, 'a'))} + ${Math.abs(N(v, 'b'))} ${MINUS} ${Math.abs(N(v, 'c'))} = ${a}.`,
  }),

  // ═════════ U01.2 — მოპირდაპირე და შებრუნებული რიცხვები ═════════
  t({
    sub: 'u01-02',
    prompt: 'იპოვე რიცხვის {aS} მოპირდაპირე რიცხვი.',
    vars: { a: I(-40, 40, { nonZero: true }), aS: S('a') },
    answer: (v) => sg(-N(v, 'a')),
    wrong: (v) => [N(v, 'a'), -N(v, 'a') + 1, -N(v, 'a') - 1, 0],
    why: (_v, a) => `მოპირდაპირე რიცხვს მხოლოდ ნიშანი აქვს შეცვლილი: ${a}.`,
  }),
  t({
    sub: 'u01-02',
    prompt: 'იპოვე რიცხვის {f} შებრუნებული რიცხვი.',
    vars: { f: C(properPool(3, 12, 2)) },
    answer: (v) => fText(fr(nd(v, 'f')[1], nd(v, 'f')[0])),
    wrong: (v) => fracWrong(fr(nd(v, 'f')[1], nd(v, 'f')[0]), [fr(nd(v, 'f')[0], nd(v, 'f')[1])]).concat([String(v.f), `${MINUS}${nd(v, 'f')[1]}/${nd(v, 'f')[0]}`]),
    why: (v, a) => `შებრუნებული რიცხვისთვის მრიცხველი და მნიშვნელი ადგილს იცვლის: ${v.f} → ${a}.`,
  }),
  t({
    sub: 'u01-02',
    d: 2,
    prompt: 'იპოვე რიცხვის {fS} შებრუნებული რიცხვი.',
    vars: { f: C(properPool(3, 12, 2)), fS: D((v) => `${MINUS}${String(v.f)}`) },
    answer: (v) => `${MINUS}${fText(fr(nd(v, 'f')[1], nd(v, 'f')[0]))}`,
    wrong: (v) => [fText(fr(nd(v, 'f')[1], nd(v, 'f')[0])), String(v.f), `${MINUS}${String(v.f)}`, `${MINUS}${nd(v, 'f')[1] + 1}/${nd(v, 'f')[0]}`],
    why: (v, a) => `ნიშანი ინახება, მრიცხველი და მნიშვნელი ადგილს იცვლის: ${v.fS} → ${a}.`,
  }),
  t({
    sub: 'u01-02',
    prompt: 'რიცხვის მოპირდაპირეა {kS}. იპოვე ეს რიცხვი.',
    vars: { k: I(-40, 40, { nonZero: true }), kS: S('k') },
    answer: (v) => sg(-N(v, 'k')),
    wrong: (v) => [N(v, 'k'), -N(v, 'k') + 1, -N(v, 'k') - 1, 0],
    why: (v, a) => `თუ მოპირდაპირეა ${sg(N(v, 'k'))}, თავად რიცხვია ${a}.`,
  }),
  t({
    sub: 'u01-02',
    d: 2,
    prompt: 'იპოვე რიცხვის {aS} მოპირდაპირე და შებრუნებული რიცხვები.',
    vars: { a: I(-12, 12, { nonZero: true }), aS: S('a') },
    constraints: [{ test: (v: Vars) => Math.abs(N(v, 'a')) >= 2, note: 'not ±1' }],
    answer: (v) => `${sg(-N(v, 'a'))} და ${fText(fr(1, N(v, 'a')))}`,
    options: (v, right) => [
      right,
      `${sg(N(v, 'a'))} და ${fText(fr(1, N(v, 'a')))}`,
      `${sg(-N(v, 'a'))} და ${fText(fr(-1, N(v, 'a')))}`,
      `${fText(fr(1, N(v, 'a')))} და ${sg(-N(v, 'a'))}`,
      `${sg(-N(v, 'a'))} და ${sg(-N(v, 'a'))}`,
    ],
    why: (v, a) => `მოპირდაპირეა ${sg(-N(v, 'a'))}, შებრუნებულია ${fText(fr(1, N(v, 'a')))}: ${a}.`,
  }),
  t({
    sub: 'u01-02',
    d: 2,
    prompt: 'იპოვე x, თუ x-ის შებრუნებული რიცხვია {fS}.',
    vars: { f: C(properPool(3, 12, 2)), s: C([-1, 1]), fS: D((v) => `${N(v, 's') < 0 ? MINUS : ''}${String(v.f)}`) },
    answer: (v) => `${N(v, 's') < 0 ? MINUS : ''}${fText(fr(nd(v, 'f')[1], nd(v, 'f')[0]))}`,
    wrong: (v) => [`${N(v, 's') < 0 ? '' : MINUS}${fText(fr(nd(v, 'f')[1], nd(v, 'f')[0]))}`, String(v.fS), `${N(v, 's') < 0 ? '' : MINUS}${String(v.f)}`, `${N(v, 's') < 0 ? MINUS : ''}${nd(v, 'f')[1]}/${nd(v, 'f')[0] + 1}`],
    why: (v, a) => `x არის ${v.fS}-ის შებრუნებული: ${a}.`,
  }),

  // ═════════ U01.3 — რიცხვების სხვადასხვა ფორმით ჩაწერა ═════════
  t({
    sub: 'u01-03',
    prompt: 'ჩაწერე {f} ათწილადის სახით.',
    vars: { d: C([2, 4, 5, 8, 10, 20, 25]), n: I(1, (v: Vars) => N(v, 'd') - 1), f: D((v) => `${N(v, 'n')}/${N(v, 'd')}`) },
    constraints: [{ test: (v: Vars) => gcd(N(v, 'n'), N(v, 'd')) === 1, note: 'lowest terms' }],
    answer: (v) => dec(N(v, 'n') / N(v, 'd'), 3),
    wrong: (v) => [dec((10 * N(v, 'n')) / N(v, 'd'), 3), dec(N(v, 'n') / N(v, 'd') / 10, 4), `0,${N(v, 'n')}${N(v, 'd')}`, dec(N(v, 'd') / N(v, 'n') / 10, 3)],
    why: (v, a) => `${v.f} = ${N(v, 'n')} ÷ ${N(v, 'd')} = ${a}.`,
  }),
  t({
    sub: 'u01-03',
    prompt: 'ჩაწერე {dS} ჩვეულებრივი წილადის სახით და გაამარტივე.',
    vars: { n: I(5, 95), dS: D((v) => dec(N(v, 'n') / 100, 2)) },
    constraints: [{ test: (v: Vars) => gcd(N(v, 'n'), 100) > 1, note: 'needs reducing' }],
    answer: (v) => fText(fr(N(v, 'n'), 100)),
    wrong: (v) => [rawF(N(v, 'n'), 100), fText(fr(N(v, 'n'), 10)), fText(fr(N(v, 'n'), 1000)), fText(fr(100, N(v, 'n')))],
    why: (v, a) => `${v.dS} = ${rawF(N(v, 'n'), 100)} = ${a}.`,
  }),
  t({
    sub: 'u01-03',
    prompt: 'ჩაწერე {m} არასწორი წილადის სახით.',
    vars: { m: C(mixedPool(6, 2, 9)) },
    answer: (v) => `${wnd(v, 'm')[0] * wnd(v, 'm')[2] + wnd(v, 'm')[1]}/${wnd(v, 'm')[2]}`,
    wrong: (v) => {
      const [w, n, d] = wnd(v, 'm');
      return [`${w + n}/${d}`, `${w * n + d}/${d}`, `${w * d}/${d}`, `${w * d + n}/${d + 1}`, `${w * d + n + d}/${d}`];
    },
    why: (v, a) => `მთელს ვამრავლებთ მნიშვნელზე და ვუმატებთ მრიცხველს: ${v.m} = ${a}.`,
  }),
  t({
    sub: 'u01-03',
    prompt: 'ჩაწერე {f} შერეული რიცხვის სახით.',
    vars: { d: I(2, 12), w: I(1, 6), r: I(1, (v: Vars) => N(v, 'd') - 1), f: D((v) => `${N(v, 'w') * N(v, 'd') + N(v, 'r')}/${N(v, 'd')}`) },
    constraints: [{ test: (v: Vars) => gcd(N(v, 'r'), N(v, 'd')) === 1, note: 'proper part in lowest terms' }],
    answer: (v) => `${N(v, 'w')} ${N(v, 'r')}/${N(v, 'd')}`,
    wrong: (v) => [`${N(v, 'w') + 1} ${N(v, 'r')}/${N(v, 'd')}`, `${N(v, 'w')} ${N(v, 'd') - N(v, 'r')}/${N(v, 'd')}`, `${N(v, 'w') - 1} ${N(v, 'r')}/${N(v, 'd')}`, `${N(v, 'r')} ${N(v, 'w')}/${N(v, 'd')}`],
    why: (v, a) => `${v.f}: ${N(v, 'w') * N(v, 'd')} ÷ ${v.d} → ${v.w}, ნაშთი ${v.r}, ამიტომ ${a}.`,
  }),
  t({
    sub: 'u01-03',
    d: 2,
    prompt: 'ჩაწერე {dS} ჩვეულებრივი წილადის სახით და გაამარტივე.',
    vars: { n: I(5, 995), dS: D((v) => dec(N(v, 'n') / 1000, 3)) },
    constraints: [{ test: (v: Vars) => N(v, 'n') % 10 !== 0 && gcd(N(v, 'n'), 1000) > 1, note: 'three decimals, needs reducing' }],
    answer: (v) => fText(fr(N(v, 'n'), 1000)),
    wrong: (v) => [rawF(N(v, 'n'), 1000), fText(fr(N(v, 'n'), 100)), fText(fr(N(v, 'n'), 10000)), fText(fr(1000, N(v, 'n')))],
    why: (v, a) => `${v.dS} = ${rawF(N(v, 'n'), 1000)} = ${a}.`,
  }),
  t({
    sub: 'u01-03',
    d: 2,
    prompt: 'ჩაწერე {dS} შერეული რიცხვის სახით.',
    vars: { w: I(1, 9), f: I(1, 99), dS: D((v) => dec(N(v, 'w') + N(v, 'f') / 100, 2)) },
    constraints: [{ test: (v: Vars) => N(v, 'f') % 10 !== 0, note: 'two decimals' }],
    answer: (v) => mText(fr(N(v, 'w') * 100 + N(v, 'f'), 100)),
    wrong: (v) => [`${N(v, 'w')} ${N(v, 'f')}/10`, `${N(v, 'w')} ${N(v, 'f')}/1000`, rawF(N(v, 'w') * 100 + N(v, 'f'), 100), `${N(v, 'f')} ${N(v, 'w')}/100`],
    why: (v, a) => `${v.dS} = ${v.w} და ${v.f}/100 = ${a}.`,
  }),

  // ═════════ U01.4 — მოქმედებები მთელ რიცხვებსა და წილადებზე ═════════
  t({
    sub: 'u01-04',
    prompt: 'გამოთვალე: {a} + {b}.',
    vars: { a: I(100, 999), b: I(100, 999) },
    answer: (v) => group(N(v, 'a') + N(v, 'b')),
    wrong: (v) => [N(v, 'a') + N(v, 'b') + 10, N(v, 'a') + N(v, 'b') - 10, N(v, 'a') + N(v, 'b') + 100, N(v, 'a') + N(v, 'b') - 100],
    why: (v, a) => `${v.a} + ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u01-04',
    prompt: 'გამოთვალე: {a} − {b}.',
    vars: { b: I(100, 999), a: I((v: Vars) => N(v, 'b') + 1, 1999) },
    answer: (v) => group(N(v, 'a') - N(v, 'b')),
    wrong: (v) => [N(v, 'a') - N(v, 'b') + 10, N(v, 'a') - N(v, 'b') - 10, N(v, 'a') - N(v, 'b') + 100, N(v, 'a') + N(v, 'b')],
    why: (v, a) => `${v.a} − ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u01-04',
    prompt: 'გამოთვალე: {a} + {b}.',
    vars: { a: C(properPool(2, 12)), b: C(properPool(2, 12)) },
    answer: (v) => mText(fAdd(fv(v, 'a'), fv(v, 'b'))),
    wrong: (v) => [`${nd(v, 'a')[0] + nd(v, 'b')[0]}/${nd(v, 'a')[1] + nd(v, 'b')[1]}`, ...fracWrong(fAdd(fv(v, 'a'), fv(v, 'b')), [fMul(fv(v, 'a'), fv(v, 'b'))])],
    why: (v, a) => `საერთო მნიშვნელზე მიყვანის შემდეგ: ${v.a} + ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u01-04',
    prompt: 'გამოთვალე: {a} − {b}.',
    vars: { a: C(properPool(2, 12)), b: C(properPool(2, 12)) },
    constraints: [{ test: (v: Vars) => fCmp(fv(v, 'a'), fv(v, 'b')) > 0, note: 'positive difference' }],
    answer: (v) => mText(fSub(fv(v, 'a'), fv(v, 'b'))),
    wrong: (v) => [rawF(nd(v, 'a')[0] - nd(v, 'b')[0], Math.abs(nd(v, 'a')[1] - nd(v, 'b')[1]) || 1), ...fracWrong(fSub(fv(v, 'a'), fv(v, 'b')), [fAdd(fv(v, 'a'), fv(v, 'b'))])],
    why: (v, a) => `საერთო მნიშვნელზე მიყვანის შემდეგ: ${v.a} − ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u01-04',
    prompt: 'გამოთვალე: {a} × {b}.',
    vars: { a: C(properPool(2, 12)), b: C(properPool(2, 12)) },
    answer: (v) => mText(fMul(fv(v, 'a'), fv(v, 'b'))),
    wrong: (v) => fracWrong(fMul(fv(v, 'a'), fv(v, 'b')), [fAdd(fv(v, 'a'), fv(v, 'b')), fDiv(fv(v, 'a'), fv(v, 'b'))]),
    why: (v, a) => `მრიცხველი მრიცხველზე, მნიშვნელი მნიშვნელზე: ${v.a} × ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u01-04',
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    vars: { a: C(properPool(2, 12)), b: C(properPool(2, 12)) },
    constraints: [{ test: (v: Vars) => fCmp(fv(v, 'a'), fv(v, 'b')) !== 0, note: 'different fractions' }],
    answer: (v) => mText(fDiv(fv(v, 'a'), fv(v, 'b'))),
    wrong: (v) => fracWrong(fDiv(fv(v, 'a'), fv(v, 'b')), [fMul(fv(v, 'a'), fv(v, 'b')), fDiv(fv(v, 'b'), fv(v, 'a'))]),
    why: (v, a) => `გაყოფა შებრუნებულზე გამრავლებაა: ${v.a} ÷ ${v.b} = ${a}.`,
  }),

  // ═════════ U01.5 — მოქმედებები შერეულ რიცხვებსა და ათწილადებზე ═════════
  t({
    sub: 'u01-05',
    prompt: 'გამოთვალე: {a} + {b}.',
    vars: { a: C(mixedPool(5, 2, 9)), b: C(mixedPool(5, 2, 9)) },
    answer: (v) => mText(fAdd(fv(v, 'a'), fv(v, 'b'))),
    wrong: (v) => fracWrong(fAdd(fv(v, 'a'), fv(v, 'b')), [fMul(fv(v, 'a'), fv(v, 'b'))]),
    why: (v, a) => `მთელები და წილადები ცალ-ცალკე ვკრიბავთ: ${v.a} + ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u01-05',
    prompt: 'გამოთვალე: {a} − {b}.',
    vars: { a: C(mixedPool(6, 2, 9)), b: C(mixedPool(5, 2, 9)) },
    constraints: [{ test: (v: Vars) => fCmp(fv(v, 'a'), fv(v, 'b')) > 0, note: 'positive difference' }],
    answer: (v) => mText(fSub(fv(v, 'a'), fv(v, 'b'))),
    wrong: (v) => fracWrong(fSub(fv(v, 'a'), fv(v, 'b')), [fAdd(fv(v, 'a'), fv(v, 'b'))]),
    why: (v, a) => `${v.a} − ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u01-05',
    prompt: 'გამოთვალე: {aS} + {bS}.',
    vars: { a: I(101, 999), b: I(101, 999), aS: D((v) => dd(N(v, 'a'), 2)), bS: D((v) => dd(N(v, 'b'), 2)) },
    answer: (v) => dd(N(v, 'a') + N(v, 'b'), 2),
    wrong: (v) => [dd(N(v, 'a') + N(v, 'b') + 10, 2), dd(N(v, 'a') + N(v, 'b') - 10, 2), dd(N(v, 'a') + N(v, 'b'), 1), dd(N(v, 'a') + N(v, 'b') + 100, 2)],
    why: (v, a) => `მძიმეს მძიმის ქვეშ ვწერთ: ${v.aS} + ${v.bS} = ${a}.`,
  }),
  t({
    sub: 'u01-05',
    prompt: 'გამოთვალე: {aS} − {bS}.',
    vars: { b: I(101, 899), a: I((v: Vars) => N(v, 'b') + 11, 999), aS: D((v) => dd(N(v, 'a'), 2)), bS: D((v) => dd(N(v, 'b'), 2)) },
    answer: (v) => dd(N(v, 'a') - N(v, 'b'), 2),
    wrong: (v) => [dd(N(v, 'a') - N(v, 'b') + 10, 2), dd(N(v, 'a') - N(v, 'b') - 10, 2), dd(N(v, 'a') + N(v, 'b'), 2), dd(N(v, 'a') - N(v, 'b') + 100, 2)],
    why: (v, a) => `${v.aS} − ${v.bS} = ${a}.`,
  }),
  t({
    sub: 'u01-05',
    prompt: 'გამოთვალე: {aS} × {k}.',
    vars: { a: I(101, 599), k: I(2, 9), aS: D((v) => dd(N(v, 'a'), 2)) },
    constraints: [{ test: (v: Vars) => N(v, 'a') % 10 !== 0, note: 'two real places' }],
    answer: (v) => dd(N(v, 'a') * N(v, 'k'), 2),
    wrong: (v) => [dd(N(v, 'a') * N(v, 'k'), 1), dd(N(v, 'a') * N(v, 'k'), 3), dd(N(v, 'a') * N(v, 'k') + 10, 2), dd(N(v, 'a') + N(v, 'k'), 2)],
    why: (v, a) => `${v.aS} × ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u01-05',
    d: 2,
    prompt: 'გამოთვალე: {aS} ÷ {k}.',
    vars: { q: I(101, 899), k: I(2, 9), a: D((v) => N(v, 'q') * N(v, 'k')), aS: D((v) => dd(N(v, 'q') * N(v, 'k'), 2)) },
    constraints: [{ test: (v: Vars) => N(v, 'q') % 10 !== 0, note: 'two real places' }],
    answer: (v) => dd(N(v, 'q'), 2),
    wrong: (v) => [dd(N(v, 'q'), 1), dd(N(v, 'q'), 3), dd(N(v, 'q') + 10, 2), dd(N(v, 'q') - 10, 2)],
    why: (v, a) => `${v.aS} ÷ ${v.k} = ${a}.`,
  }),

  // ═════════ U01.6 — მოქმედებები უარყოფით და რაციონალურ რიცხვებზე ═════════
  t({
    sub: 'u01-06',
    prompt: 'გამოთვალე: {aS} + {bP}.',
    vars: { a: I(-30, 30, { nonZero: true }), b: I(-30, 30, { nonZero: true }), aS: S('a'), bP: D((v) => par(N(v, 'b'))) },
    answer: (v) => sg(N(v, 'a') + N(v, 'b')),
    wrong: (v) => [Math.abs(N(v, 'a')) + Math.abs(N(v, 'b')), N(v, 'a') - N(v, 'b'), -(N(v, 'a') + N(v, 'b')), N(v, 'a') + N(v, 'b') + 2],
    why: (v, a) => `${sg(N(v, 'a'))} + ${par(N(v, 'b'))} = ${a}.`,
  }),
  t({
    sub: 'u01-06',
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(-30, 30, { nonZero: true }), b: I(-30, 30, { nonZero: true }), e: D((v) => `${sg(N(v, 'a'))} ${MINUS} ${par(N(v, 'b'))}`) },
    answer: (v) => sg(N(v, 'a') - N(v, 'b')),
    wrong: (v) => [N(v, 'a') + N(v, 'b'), -(N(v, 'a') - N(v, 'b')), N(v, 'b') - N(v, 'a'), N(v, 'a') - N(v, 'b') + 2],
    why: (v, a) => `${sg(N(v, 'a'))} ${MINUS} ${par(N(v, 'b'))} = ${sg(N(v, 'a'))} + ${sg(-N(v, 'b'))} = ${a}.`,
  }),
  t({
    sub: 'u01-06',
    prompt: 'გამოთვალე: {aP} × {bP}.',
    vars: { a: I(-12, 12, { nonZero: true }), b: I(-12, 12, { nonZero: true }), aP: D((v) => par(N(v, 'a'))), bP: D((v) => par(N(v, 'b'))) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b')),
    wrong: (v) => [-(N(v, 'a') * N(v, 'b')), N(v, 'a') + N(v, 'b'), N(v, 'a') * N(v, 'b') + 1, N(v, 'a') * N(v, 'b') - 1],
    why: (v, a) => `${par(N(v, 'a'))} × ${par(N(v, 'b'))} = ${a}: ${N(v, 'a') * N(v, 'b') > 0 ? 'ერთნაირი ნიშნები დადებით ნამრავლს იძლევა' : 'სხვადასხვა ნიშნები უარყოფით ნამრავლს იძლევა'}.`,
  }),
  t({
    sub: 'u01-06',
    prompt: 'გამოთვალე: {aP} ÷ {bP}.',
    vars: { q: I(-12, 12, { nonZero: true }), b: I(-12, 12, { nonZero: true }), a: D((v) => N(v, 'q') * N(v, 'b')), aP: D((v) => par(N(v, 'q') * N(v, 'b'))), bP: D((v) => par(N(v, 'b'))) },
    answer: (v) => sg(N(v, 'q')),
    wrong: (v) => [-N(v, 'q'), N(v, 'q') + 1, N(v, 'q') - 1, N(v, 'a') + N(v, 'b')],
    why: (v, a) => `${par(N(v, 'a'))} ÷ ${par(N(v, 'b'))} = ${a}.`,
  }),
  t({
    sub: 'u01-06',
    d: 2,
    prompt: 'გამოთვალე: {a} + {b}.',
    vars: { f: C(properPool(2, 9)), g: C(properPool(2, 9)), a: D((v) => `${MINUS}${String(v.f)}`), b: D((v) => String(v.g)) },
    constraints: [{ test: (v: Vars) => fCmp(fv(v, 'f'), fv(v, 'g')) !== 0, note: 'non-zero sum' }],
    answer: (v) => {
      const r = fAdd(fr(-fv(v, 'f').n, fv(v, 'f').d), fv(v, 'g'));
      return r.n < 0 ? `${MINUS}${mText(fr(-r.n, r.d))}` : mText(r);
    },
    wrong: (v) => {
      const r = fAdd(fr(-fv(v, 'f').n, fv(v, 'f').d), fv(v, 'g'));
      const swapped = fAdd(fv(v, 'f'), fv(v, 'g'));
      return [...fracWrong(r, [swapped]), `${r.n < 0 ? '' : MINUS}${mText(fr(Math.abs(r.n), r.d))}`];
    },
    why: (v, a) => `${v.a} + ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u01-06',
    d: 2,
    prompt: 'გამოთვალე: {a} × {b}.',
    vars: { f: C(properPool(2, 9)), g: C(properPool(2, 9)), a: D((v) => `${MINUS}${String(v.f)}`), b: D((v) => String(v.g)) },
    answer: (v) => `${MINUS}${mText(fMul(fv(v, 'f'), fv(v, 'g')))}`,
    wrong: (v) => [mText(fMul(fv(v, 'f'), fv(v, 'g'))), `${MINUS}${mText(fAdd(fv(v, 'f'), fv(v, 'g')))}`, `${MINUS}${mText(fDiv(fv(v, 'f'), fv(v, 'g')))}`, `${MINUS}${mText(fr(fv(v, 'f').n + fv(v, 'g').n, fv(v, 'f').d * fv(v, 'g').d))}`, `${MINUS}${mText(fr(fv(v, 'f').n * fv(v, 'g').n + 1, fv(v, 'f').d * fv(v, 'g').d))}`],
    why: (v, a) => `${v.a} × ${v.b} = ${a}: უარყოფითის დადებითზე ნამრავლი უარყოფითია.`,
  }),

  // ═════════ U01.7 — დამრგვალება და მიახლოებითი გამოთვლა ═════════
  t({
    sub: 'u01-07',
    prompt: 'დაამრგვალე {n} უახლოეს ათეულამდე.',
    vars: { n: I(101, 999) },
    constraints: [{ test: (v: Vars) => N(v, 'n') % 10 !== 0, note: 'not already a multiple of ten' }],
    answer: (v) => group(Math.round(N(v, 'n') / 10) * 10),
    wrong: (v) => [Math.floor(N(v, 'n') / 10) * 10, Math.floor(N(v, 'n') / 10) * 10 + 10, Math.round(N(v, 'n') / 100) * 100, Math.floor(N(v, 'n') / 10) * 10 - 10],
    why: (v, a) => `ერთეულების ციფრის მიხედვით ${v.n} უახლოვდება ${a}-ს.`,
  }),
  t({
    sub: 'u01-07',
    prompt: 'დაამრგვალე {nS} უახლოეს ასეულამდე.',
    vars: { n: I(1001, 9999), nS: D((v) => group(N(v, 'n'))) },
    constraints: [{ test: (v: Vars) => N(v, 'n') % 100 !== 0, note: 'not already a multiple of 100' }],
    answer: (v) => group(Math.round(N(v, 'n') / 100) * 100),
    wrong: (v) => [Math.floor(N(v, 'n') / 100) * 100, Math.floor(N(v, 'n') / 100) * 100 + 100, Math.round(N(v, 'n') / 10) * 10, Math.round(N(v, 'n') / 1000) * 1000],
    why: (v, a) => `ათეულების ციფრის მიხედვით ${v.nS} უახლოვდება ${a}-ს.`,
  }),
  t({
    sub: 'u01-07',
    prompt: 'დაამრგვალე {aS} მეათედამდე.',
    vars: { a: I(1001, 29999), aS: D((v) => dd(N(v, 'a'), 3)) },
    constraints: [{ test: (v: Vars) => N(v, 'a') % 10 !== 0, note: 'three real places' }],
    answer: (v) => dd(Math.round(N(v, 'a') / 100) * 100, 3),
    wrong: (v) => [dd(Math.floor(N(v, 'a') / 100) * 100, 3), dd(Math.floor(N(v, 'a') / 100) * 100 + 100, 3), dd(Math.round(N(v, 'a') / 10) * 10, 3), dd(Math.round(N(v, 'a') / 1000) * 1000, 3)],
    why: (v, a) => `მეორე ციფრის მიხედვით ${v.aS} მეათედამდე იდგება ${a}.`,
  }),
  t({
    sub: 'u01-07',
    prompt: 'დაამრგვალე {aS} მეასედამდე.',
    vars: { a: I(1001, 9999), aS: D((v) => dd(N(v, 'a'), 3)) },
    constraints: [{ test: (v: Vars) => N(v, 'a') % 10 !== 0, note: 'three real places' }],
    answer: (v) => dd(Math.round(N(v, 'a') / 10) * 10, 3),
    wrong: (v) => [dd(Math.floor(N(v, 'a') / 10) * 10, 3), dd(Math.floor(N(v, 'a') / 10) * 10 + 10, 3), dd(Math.round(N(v, 'a') / 100) * 100, 3), dd(Math.floor(N(v, 'a') / 10) * 10 - 10, 3)],
    why: (v, a) => `მესამე ციფრის მიხედვით ${v.aS} მეასედამდე იდგება ${a}.`,
  }),
  t({
    sub: 'u01-07',
    d: 2,
    prompt: 'შეაფასე {a} × {b} ნამრავლი ორივე რიცხვის უახლოეს ათეულამდე დამრგვალებით.',
    vars: { a: I(21, 98), b: I(21, 98) },
    constraints: [{ test: (v: Vars) => N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0, note: 'both need rounding' }],
    answer: (v) => group(Math.round(N(v, 'a') / 10) * 10 * (Math.round(N(v, 'b') / 10) * 10)),
    wrong: (v) => [N(v, 'a') * N(v, 'b'), Math.floor(N(v, 'a') / 10) * 10 * Math.floor(N(v, 'b') / 10) * 10, (Math.floor(N(v, 'a') / 10) * 10 + 10) * (Math.floor(N(v, 'b') / 10) * 10 + 10), Math.round(N(v, 'a') / 10) * 10 + Math.round(N(v, 'b') / 10) * 10, Math.round(N(v, 'a') / 10) * 10 * (Math.round(N(v, 'b') / 10) * 10) * 10],
    why: (v, a) => `${Math.round(N(v, 'a') / 10) * 10} × ${Math.round(N(v, 'b') / 10) * 10} = ${a}.`,
  }),
  t({
    sub: 'u01-07',
    d: 2,
    prompt: 'შეაფასე {a} ÷ {b} განაყოფი, თუ {a}-ს დაამრგვალებ უახლოეს ასეულამდე.',
    vars: { a: I(401, 995), b: C([2, 4, 5, 10, 20, 25, 50]) },
    constraints: [{ test: (v: Vars) => N(v, 'a') % 100 !== 0, note: 'needs rounding' }],
    answer: (v) => group((Math.round(N(v, 'a') / 100) * 100) / N(v, 'b')),
    wrong: (v) => {
      const r = (Math.round(N(v, 'a') / 100) * 100) / N(v, 'b');
      return [Math.floor(N(v, 'a') / N(v, 'b')), r * 10, r + 1, r - 1, Math.round(N(v, 'a') / N(v, 'b')) + 2];
    },
    why: (v, a) => `${Math.round(N(v, 'a') / 100) * 100} ÷ ${v.b} = ${a}.`,
  }),

  // ═════════ U01.8 — წილადი გამოსახულებების გამარტივება ═════════
  t({
    sub: 'u01-08',
    prompt: 'გაამარტივე: {f}.',
    vars: { g: I(2, 9), x: I(1, 9), y: I(2, 12), f: D((v) => rawF(N(v, 'g') * N(v, 'x'), N(v, 'g') * N(v, 'y'))) },
    constraints: [{ test: (v: Vars) => gcd(N(v, 'x'), N(v, 'y')) === 1 && N(v, 'x') !== N(v, 'y'), note: 'lowest terms after reducing' }],
    answer: (v) => mText(fr(N(v, 'x'), N(v, 'y'))),
    wrong: (v) => [rawF(N(v, 'g') * N(v, 'x') + N(v, 'g'), N(v, 'g') * N(v, 'y') + N(v, 'g')), String(v.f), `${N(v, 'x') + 1}/${N(v, 'y')}`, `${N(v, 'x')}/${N(v, 'y') + 1}`, `${N(v, 'y')}/${N(v, 'x')}`],
    why: (v, a) => `მრიცხველსა და მნიშვნელს ვყოფთ ${v.g}-ზე: ${v.f} = ${a}.`,
  }),
  t({
    sub: 'u01-08',
    prompt: 'გაამარტივე: {f}.',
    vars: { g: I(3, 14), x: I(1, 11), y: I(2, 13), f: D((v) => rawF(N(v, 'g') * N(v, 'x'), N(v, 'g') * N(v, 'y'))) },
    constraints: [{ test: (v: Vars) => gcd(N(v, 'x'), N(v, 'y')) === 1 && N(v, 'x') !== N(v, 'y'), note: 'lowest terms after reducing' }],
    answer: (v) => mText(fr(N(v, 'x'), N(v, 'y'))),
    wrong: (v) => [String(v.f), `${N(v, 'x') + 1}/${N(v, 'y')}`, `${N(v, 'x')}/${N(v, 'y') + 1}`, `${N(v, 'y')}/${N(v, 'x')}`, `${N(v, 'x') * 2}/${N(v, 'y') * 2}`],
    why: (v, a) => `უდიდესი საერთო გამყოფია ${v.g}: ${v.f} = ${a}.`,
  }),
  t({
    sub: 'u01-08',
    prompt: 'გამოთვალე და გაამარტივე: {a} + {b}.',
    vars: { k: C([2, 3, 4, 5, 6]), m: C([2, 3, 4, 5]), p: I(1, 5), q: I(1, 9), a: D((v) => `${N(v, 'p')}/${N(v, 'k')}`), b: D((v) => `${N(v, 'q')}/${N(v, 'k') * N(v, 'm')}`) },
    constraints: [{ test: (v: Vars) => N(v, 'p') < N(v, 'k') && N(v, 'q') < N(v, 'k') * N(v, 'm') && gcd(N(v, 'p'), N(v, 'k')) === 1 && gcd(N(v, 'q'), N(v, 'k') * N(v, 'm')) === 1, note: 'proper fractions in lowest terms' }],
    answer: (v) => mText(fAdd(fr(N(v, 'p'), N(v, 'k')), fr(N(v, 'q'), N(v, 'k') * N(v, 'm')))),
    wrong: (v) => {
      const r = fAdd(fr(N(v, 'p'), N(v, 'k')), fr(N(v, 'q'), N(v, 'k') * N(v, 'm')));
      return [`${N(v, 'p') + N(v, 'q')}/${N(v, 'k') + N(v, 'k') * N(v, 'm')}`, rawF(N(v, 'p') * N(v, 'm') + N(v, 'q'), N(v, 'k') * N(v, 'm')), ...fracWrong(r, [])];
    },
    why: (v, a) => `${v.a} + ${v.b} = ${rawF(N(v, 'p') * N(v, 'm') + N(v, 'q'), N(v, 'k') * N(v, 'm'))} = ${a}.`,
  }),
  t({
    sub: 'u01-08',
    prompt: 'გამოთვალე და გაამარტივე: {a} − {b}.',
    vars: { k: C([4, 6, 8, 12]), m: C([2, 3]), p: I(1, 11), q: I(1, 11), a: D((v) => `${N(v, 'p')}/${N(v, 'k')}`), b: D((v) => `${N(v, 'q')}/${N(v, 'k') * N(v, 'm')}`) },
    constraints: [{
      test: (v: Vars) => N(v, 'p') < N(v, 'k') && N(v, 'q') < N(v, 'k') * N(v, 'm') && gcd(N(v, 'p'), N(v, 'k')) === 1 && gcd(N(v, 'q'), N(v, 'k') * N(v, 'm')) === 1 &&
        fCmp(fr(N(v, 'p'), N(v, 'k')), fr(N(v, 'q'), N(v, 'k') * N(v, 'm'))) > 0,
      note: 'proper fractions in lowest terms, positive difference',
    }],
    answer: (v) => mText(fSub(fr(N(v, 'p'), N(v, 'k')), fr(N(v, 'q'), N(v, 'k') * N(v, 'm')))),
    wrong: (v) => {
      const r = fSub(fr(N(v, 'p'), N(v, 'k')), fr(N(v, 'q'), N(v, 'k') * N(v, 'm')));
      return [rawF(N(v, 'p') - N(v, 'q'), N(v, 'k') * N(v, 'm') - N(v, 'k')), rawF(N(v, 'p') * N(v, 'm') - N(v, 'q'), N(v, 'k') * N(v, 'm')), ...fracWrong(r, [fAdd(fr(N(v, 'p'), N(v, 'k')), fr(N(v, 'q'), N(v, 'k') * N(v, 'm')))])];
    },
    why: (v, a) => `${v.a} − ${v.b} = ${rawF(N(v, 'p') * N(v, 'm') - N(v, 'q'), N(v, 'k') * N(v, 'm'))} = ${a}.`,
  }),
  t({
    sub: 'u01-08',
    prompt: 'გამოთვალე და გაამარტივე: {a} × {b}.',
    vars: { a: C(properPool(3, 16)), b: C(properPool(3, 16)) },
    constraints: [{ test: (v: Vars) => { return fMul(fv(v, 'a'), fv(v, 'b')).d !== nd(v, 'a')[1] * nd(v, 'b')[1]; }, note: 'the product needs reducing' }],
    answer: (v) => mText(fMul(fv(v, 'a'), fv(v, 'b'))),
    wrong: (v) => [rawF(nd(v, 'a')[0] * nd(v, 'b')[0], nd(v, 'a')[1] * nd(v, 'b')[1]), ...fracWrong(fMul(fv(v, 'a'), fv(v, 'b')), [fAdd(fv(v, 'a'), fv(v, 'b'))])],
    why: (v, a) => `${v.a} × ${v.b} = ${rawF(nd(v, 'a')[0] * nd(v, 'b')[0], nd(v, 'a')[1] * nd(v, 'b')[1])} = ${a}.`,
  }),
  t({
    sub: 'u01-08',
    prompt: 'გამოთვალე და გაამარტივე: {a} ÷ {b}.',
    vars: { a: C(properPool(3, 16)), b: C(properPool(3, 16)) },
    constraints: [{ test: (v: Vars) => fCmp(fv(v, 'a'), fv(v, 'b')) !== 0, note: 'different fractions' }],
    answer: (v) => mText(fDiv(fv(v, 'a'), fv(v, 'b'))),
    wrong: (v) => [mText(fDiv(fv(v, 'b'), fv(v, 'a'))), ...fracWrong(fDiv(fv(v, 'a'), fv(v, 'b')), [fMul(fv(v, 'a'), fv(v, 'b'))])],
    why: (v, a) => `${v.a} ÷ ${v.b} = ${v.a} × ${fText(fr(nd(v, 'b')[1], nd(v, 'b')[0]))} = ${a}.`,
  }),

  // ═════════ U01.9 — მარტივ მამრავლებად დაშლა, უსგ და უსჯ ═════════
  t({
    sub: 'u01-09',
    prompt: 'დაშალე {n} მარტივ მამრავლებად.',
    vars: { n: I(24, 200) },
    constraints: [{ test: (v: Vars) => factorize(N(v, 'n')).length >= 3 && new Set(factorize(N(v, 'n'))).size >= 2, note: 'rich factorisation' }],
    answer: (v) => factorize(N(v, 'n')).join(' × '),
    wrong: (v) => {
      const f = factorize(N(v, 'n'));
      const merged = f.length > 2 ? [f[0]! * f[1]!, ...f.slice(2)] : f;
      return [merged.join(' × '), [...f, 1].join(' × '), f.slice(0, -1).concat([f[f.length - 1]! + 1]).join(' × '), [f[0]! * 2, ...f.slice(1)].join(' × ')];
    },
    why: (v, a) => `${v.n} = ${a}: ყველა მამრავლი მარტივია.`,
  }),
  t({
    sub: 'u01-09',
    prompt: 'დაშალე {n} მარტივ მამრავლებად.',
    vars: { n: I(48, 360) },
    constraints: [{ test: (v: Vars) => factorize(N(v, 'n')).length >= 4 && new Set(factorize(N(v, 'n'))).size >= 2, note: 'rich factorisation' }],
    answer: (v) => factorize(N(v, 'n')).join(' × '),
    wrong: (v) => {
      const f = factorize(N(v, 'n'));
      return [[f[0]! * f[1]!, ...f.slice(2)].join(' × '), [...f, 1].join(' × '), f.slice(1).join(' × '), [f[0]! * 2, ...f.slice(1)].join(' × ')];
    },
    why: (v, a) => `${v.n} = ${a}: ყველა მამრავლი მარტივია.`,
  }),
  t({
    sub: 'u01-09',
    prompt: 'იპოვე {a}-ისა და {b}-ის უდიდესი საერთო გამყოფი.',
    vars: { g: I(2, 15), x: I(2, 9), y: I(2, 9), a: D((v) => N(v, 'g') * N(v, 'x')), b: D((v) => N(v, 'g') * N(v, 'y')) },
    constraints: [{ test: (v: Vars) => gcd(N(v, 'x'), N(v, 'y')) === 1 && N(v, 'x') !== N(v, 'y'), note: 'gcd is g' }],
    answer: (v) => String(N(v, 'g')),
    wrong: (v) => [lcm(N(v, 'a'), N(v, 'b')), Math.abs(N(v, 'a') - N(v, 'b')), 1, N(v, 'g') * 2, Math.min(N(v, 'a'), N(v, 'b'))],
    why: (v, a) => `${v.a} = ${a} · ${v.x}, ${v.b} = ${a} · ${v.y}; ${v.x} და ${v.y} ურთიერთმარტივია, ამიტომ უსგ = ${a}.`,
  }),
  t({
    sub: 'u01-09',
    prompt: 'იპოვე {a}-ისა და {b}-ის უმცირესი საერთო ჯერადი.',
    vars: { g: I(2, 9), x: I(2, 9), y: I(2, 9), a: D((v) => N(v, 'g') * N(v, 'x')), b: D((v) => N(v, 'g') * N(v, 'y')) },
    constraints: [{ test: (v: Vars) => gcd(N(v, 'x'), N(v, 'y')) === 1 && N(v, 'x') !== N(v, 'y'), note: 'lcm is g·x·y' }],
    answer: (v) => String(N(v, 'g') * N(v, 'x') * N(v, 'y')),
    wrong: (v) => [N(v, 'a') * N(v, 'b'), N(v, 'g'), N(v, 'a') + N(v, 'b'), Math.max(N(v, 'a'), N(v, 'b')), N(v, 'g') * N(v, 'x') * N(v, 'y') * 2],
    why: (v, a) => `უსჯ = ${v.a} · ${v.b} ÷ უსგ = ${N(v, 'a') * N(v, 'b')} ÷ ${v.g} = ${a}.`,
  }),
  t({
    sub: 'u01-09',
    prompt: 'იპოვე {a}-ისა და {b}-ის უდიდესი საერთო გამყოფი.',
    vars: { g: I(3, 25), x: I(2, 7), y: I(2, 7), a: D((v) => N(v, 'g') * N(v, 'x')), b: D((v) => N(v, 'g') * N(v, 'y')) },
    constraints: [{ test: (v: Vars) => gcd(N(v, 'x'), N(v, 'y')) === 1 && N(v, 'x') !== N(v, 'y'), note: 'gcd is g' }],
    answer: (v) => String(N(v, 'g')),
    wrong: (v) => [lcm(N(v, 'a'), N(v, 'b')), Math.abs(N(v, 'a') - N(v, 'b')), 1, N(v, 'g') * 2, Math.min(N(v, 'a'), N(v, 'b'))],
    why: (v, a) => `${v.a} = ${a} · ${v.x}, ${v.b} = ${a} · ${v.y}: უსგ = ${a}.`,
  }),
  t({
    sub: 'u01-09',
    prompt: 'იპოვე {a}-ისა და {b}-ის უმცირესი საერთო ჯერადი.',
    vars: { g: I(2, 6), x: I(2, 8), y: I(2, 8), a: D((v) => N(v, 'g') * N(v, 'x')), b: D((v) => N(v, 'g') * N(v, 'y')) },
    constraints: [{ test: (v: Vars) => gcd(N(v, 'x'), N(v, 'y')) === 1 && N(v, 'x') !== N(v, 'y'), note: 'lcm is g·x·y' }],
    answer: (v) => String(N(v, 'g') * N(v, 'x') * N(v, 'y')),
    wrong: (v) => [N(v, 'a') * N(v, 'b'), N(v, 'g'), N(v, 'a') + N(v, 'b'), Math.max(N(v, 'a'), N(v, 'b')), N(v, 'g') * N(v, 'x') * N(v, 'y') + N(v, 'g')],
    why: (v, a) => `უსჯ = ${v.a} · ${v.b} ÷ უსგ = ${N(v, 'a') * N(v, 'b')} ÷ ${v.g} = ${a}.`,
  }),

  // ═════════ U01.10 — გამრავლებისა და გაყოფის თვისებები ═════════
  t({
    sub: 'u01-10',
    prompt: 'გამოთვალე მოხერხებული ხერხით: {a} × {m} × {b}.',
    vars: {
      pr: C(['25|4', '125|8', '50|2', '20|5', '250|4', '4|25', '8|125']),
      m: I(3, 49),
      a: D((v) => Number(String(v.pr).split('|')[0])),
      b: D((v) => Number(String(v.pr).split('|')[1])),
    },
    answer: (v) => String(N(v, 'a') * N(v, 'b') * N(v, 'm')),
    wrong: (v) => [N(v, 'a') * N(v, 'b') * N(v, 'm') + N(v, 'm'), N(v, 'a') * N(v, 'b') * N(v, 'm') - N(v, 'm'), N(v, 'a') * N(v, 'b') * N(v, 'm') * 10, (N(v, 'a') + N(v, 'b')) * N(v, 'm')],
    why: (v, a) => `${v.a} × ${v.b} = ${N(v, 'a') * N(v, 'b')}, ამიტომ ${N(v, 'a') * N(v, 'b')} × ${v.m} = ${a}.`,
  }),
  t({
    sub: 'u01-10',
    prompt: 'გამოიყენე განაწილებადობის თვისება და გამოთვალე: {a} × {b}.',
    vars: { a: I(12, 49), b: C([101, 102, 103, 104, 98, 99, 97, 201, 202, 199, 198]) },
    answer: (v) => String(N(v, 'a') * N(v, 'b')),
    wrong: (v) => [N(v, 'a') * N(v, 'b') + N(v, 'a'), N(v, 'a') * N(v, 'b') - N(v, 'a'), N(v, 'a') * N(v, 'b') + 10, N(v, 'a') * N(v, 'b') - 10],
    why: (v, a) => {
      const base = Math.round(N(v, 'b') / 100) * 100;
      const diff = N(v, 'b') - base;
      return `${v.a} × ${v.b} = ${v.a} × ${base} ${diff < 0 ? MINUS : '+'} ${v.a} × ${Math.abs(diff)} = ${N(v, 'a') * base} ${diff < 0 ? MINUS : '+'} ${N(v, 'a') * Math.abs(diff)} = ${a}.`;
    },
  }),
  t({
    sub: 'u01-10',
    prompt: 'გამოთვალე: {n} {op}.',
    vars: { n: I(100, 999), op: C(['÷ 1', '× 1', '+ 0', `${MINUS} 0`]) },
    answer: (v) => String(N(v, 'n')),
    wrong: (v) => [1, 0, N(v, 'n') + 1, N(v, 'n') - 1, N(v, 'n') * 10],
    why: (v, a) => `რიცხვზე ${String(v.op).replace(/\s/g, ' ')} მისი მნიშვნელობა არ იცვლება: ${a}.`,
  }),
  t({
    sub: 'u01-10',
    prompt: 'გამოთვალე: {a} ÷ {b}.',
    vars: { b: I(11, 25), q: I(12, 48), a: D((v) => N(v, 'b') * N(v, 'q')) },
    answer: (v) => String(N(v, 'q')),
    wrong: (v) => [N(v, 'q') + 1, N(v, 'q') - 1, N(v, 'q') + 10, N(v, 'q') - 10],
    why: (v, a) => `${v.b} × ${a} = ${v.a}, ამიტომ ${v.a} ÷ ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u01-10',
    prompt: 'შეავსე გამოტოვებული რიცხვი: {a} × {s} = {a} × ({p} + □).',
    vars: { a: I(12, 79), p: C([20, 30, 40, 50, 10, 60]), c: I(2, 9), s: D((v) => N(v, 'p') + N(v, 'c')) },
    answer: (v) => String(N(v, 'c')),
    wrong: (v) => [N(v, 'p'), N(v, 's'), N(v, 'c') + 1, N(v, 'c') - 1],
    why: (v, a) => `${v.s} = ${v.p} + ${a}, ამიტომ გამოტოვებული რიცხვია ${a}.`,
  }),
  t({
    sub: 'u01-10',
    prompt: 'გამოთვალე მოხერხებული ხერხით: {a} × {b}.',
    vars: {
      pr: C(['125|8', '125|16', '125|24', '125|32', '25|12', '25|16', '25|24', '25|36', '50|18', '50|14', '250|12', '250|8', '5|14', '5|18']),
      a: D((v) => Number(String(v.pr).split('|')[0])),
      b: D((v) => Number(String(v.pr).split('|')[1])),
    },
    answer: (v) => String(N(v, 'a') * N(v, 'b')),
    wrong: (v) => [N(v, 'a') * N(v, 'b') + N(v, 'a'), N(v, 'a') * N(v, 'b') - N(v, 'a'), N(v, 'a') * N(v, 'b') * 10, N(v, 'a') * N(v, 'b') / 10],
    why: (v, a) => `${v.a} × ${v.b} = ${a}: მოხერხებულია, რადგან ${v.a} ეტევა 100-სა და 1000-ში მთელი რაოდენობით.`,
  }),

  // ═════════ U01.11 — ამოცანები ═════════
  t({
    sub: 'u01-11',
    prompt: 'დილით ტემპერატურა იყო {aS} °C, შუადღისთვის კი {b} გრადუსით მოიმატა. რა ტემპერატურა გახდა შუადღისთვის?',
    vars: { a: I(-15, -1), b: I(3, 18), aS: S('a') },
    constraints: [{ test: (v: Vars) => N(v, 'a') + N(v, 'b') !== 0, note: 'not zero' }],
    answer: (v) => `${sg(N(v, 'a') + N(v, 'b'))} °C`,
    wrong: (v) => [`${sg(N(v, 'a') - N(v, 'b'))} °C`, `${sg(N(v, 'b') - N(v, 'a'))} °C`, `${sg(-(N(v, 'a') + N(v, 'b')))} °C`, `${sg(N(v, 'a') + N(v, 'b') + 1)} °C`],
    why: (v, a) => `${sg(N(v, 'a'))} + ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u01-11',
    prompt: 'ნინოს ჰქონდა {n} ლარი. მან დახარჯა თანხის {f}. რამდენი ლარი დარჩა?',
    vars: { q: C([2, 3, 4, 5, 6, 8, 10]), p: I(1, 9), k: I(2, 12), n: D((v) => N(v, 'q') * N(v, 'k')), f: D((v) => rawF(N(v, 'p'), N(v, 'q'))) },
    constraints: [{ test: (v: Vars) => N(v, 'p') < N(v, 'q') && gcd(N(v, 'p'), N(v, 'q')) === 1 && N(v, 'p') * 2 !== N(v, 'q'), note: 'proper fraction in lowest terms' }],
    answer: (v) => String((N(v, 'q') - N(v, 'p')) * N(v, 'k')),
    wrong: (v) => [N(v, 'p') * N(v, 'k'), N(v, 'n') - N(v, 'p'), (N(v, 'q') - N(v, 'p')) * N(v, 'k') + 1, (N(v, 'q') - N(v, 'p')) * N(v, 'k') - 1],
    why: (v, a) => `დახარჯა ${v.n} ÷ ${v.q} × ${v.p} = ${N(v, 'p') * N(v, 'k')} ლარი, დარჩა ${v.n} − ${N(v, 'p') * N(v, 'k')} = ${a}.`,
  }),
  t({
    sub: 'u01-11',
    prompt: 'გამოთვალე: {a} − {b} × {c} + {d} ÷ {e}.',
    vars: { a: I(20, 60), b: I(2, 6), c: I(2, 6), e: I(2, 5), k: I(2, 9), d: D((v) => N(v, 'e') * N(v, 'k')) },
    constraints: [{ test: (v: Vars) => N(v, 'a') - N(v, 'b') * N(v, 'c') > 0, note: 'positive result' }],
    answer: (v) => String(N(v, 'a') - N(v, 'b') * N(v, 'c') + N(v, 'k')),
    wrong: (v) => [(N(v, 'a') - N(v, 'b')) * N(v, 'c') + N(v, 'k'), N(v, 'a') - N(v, 'b') * N(v, 'c') - N(v, 'k'), N(v, 'a') - N(v, 'b') * (N(v, 'c') + N(v, 'k')), (N(v, 'a') - N(v, 'b') * N(v, 'c') + N(v, 'd')) / N(v, 'e')],
    why: (v, a) => `ჯერ გამრავლება და გაყოფა: ${v.b} × ${v.c} = ${N(v, 'b') * N(v, 'c')}, ${v.d} ÷ ${v.e} = ${v.k}; შემდეგ ${v.a} − ${N(v, 'b') * N(v, 'c')} + ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u01-11',
    prompt: 'გამოთვალე: ({a} − {b}) ÷ {c} + {d} × {e}.',
    vars: { c: I(2, 6), k: I(2, 9), b: I(3, 15), d: I(2, 9), e: I(2, 9), a: D((v) => N(v, 'b') + N(v, 'c') * N(v, 'k')) },
    answer: (v) => String(N(v, 'k') + N(v, 'd') * N(v, 'e')),
    wrong: (v) => [(N(v, 'k') + N(v, 'd')) * N(v, 'e'), N(v, 'k') + N(v, 'd') + N(v, 'e'), N(v, 'a') - N(v, 'b') + N(v, 'd') * N(v, 'e'), N(v, 'k') + N(v, 'd') * N(v, 'e') + N(v, 'c')],
    why: (v, a) => `(${v.a} − ${v.b}) ÷ ${v.c} = ${v.k}, ${v.d} × ${v.e} = ${N(v, 'd') * N(v, 'e')}; ჯამი ${a}.`,
  }),
  t({
    sub: 'u01-11',
    prompt: 'ავზში იყო {x} ლ წყალი. დაამატეს {y} ლ, შემდეგ კი დახარჯეს {z} ლ. რამდენი ლიტრი დარჩა?',
    vars: {
      p: I(60, 200),
      q: I(110, 480),
      r: I(11, 99),
      x: D((v) => dd(N(v, 'p'), 1)),
      y: D((v) => dd(N(v, 'q'), 2)),
      z: D((v) => dd(N(v, 'r'), 1)),
    },
    constraints: [{ test: (v: Vars) => N(v, 'p') * 10 + N(v, 'q') - N(v, 'r') * 10 > 0 && (N(v, 'p') * 10 + N(v, 'q') - N(v, 'r') * 10) % 10 !== 0, note: 'positive hundredths result' }],
    answer: (v) => dd(N(v, 'p') * 10 + N(v, 'q') - N(v, 'r') * 10, 2),
    wrong: (v) => [dd(N(v, 'p') * 10 + N(v, 'q') + N(v, 'r') * 10, 2), dd(N(v, 'p') * 10 - N(v, 'q') - N(v, 'r') * 10, 2), dd(N(v, 'p') + N(v, 'q') - N(v, 'r'), 2), dd(N(v, 'p') * 10 + N(v, 'q') - N(v, 'r') * 10 + 10, 2)],
    why: (v, a) => `${v.x} + ${v.y} = ${dd(N(v, 'p') * 10 + N(v, 'q'), 2)}, შემდეგ ${dd(N(v, 'p') * 10 + N(v, 'q'), 2)} − ${v.z} = ${a}.`,
  }),
  t({
    sub: 'u01-11',
    prompt: 'ლაშამ წიგნის პირველ დღეს წაიკითხა მისი {fa}, მეორე დღეს — {fb}. წიგნის რა ნაწილი დარჩა წასაკითხი?',
    vars: { a: I(3, 6), b: I(3, 8), fa: D((v) => rawF(1, N(v, 'a'))), fb: D((v) => rawF(1, N(v, 'b'))) },
    constraints: [{ test: (v: Vars) => N(v, 'a') !== N(v, 'b'), note: 'different parts' }],
    answer: (v) => mText(fSub(fSub(fr(1), fr(1, N(v, 'a'))), fr(1, N(v, 'b')))),
    wrong: (v) => {
      const read = fAdd(fr(1, N(v, 'a')), fr(1, N(v, 'b')));
      const right = fSub(fr(1), read);
      return [mText(read), rawF(1, N(v, 'a') + N(v, 'b')), rawF(N(v, 'a') + N(v, 'b') - 2, N(v, 'a') + N(v, 'b')), ...fracWrong(right, [read])];
    },
    why: (v, a) => `წაიკითხა ${v.fa} + ${v.fb} = ${mText(fAdd(fr(1, N(v, 'a')), fr(1, N(v, 'b'))))}; დარჩა 1 − ${mText(fAdd(fr(1, N(v, 'a')), fr(1, N(v, 'b'))))} = ${a}.`,
  }),

  // ═════════ U01.12 — გაყოფა ნაშთით ═════════
  t({
    sub: 'u01-12',
    prompt: 'გაყავი {a} {b}-ზე და მიუთითე განაყოფი და ნაშთი.',
    vars: { b: I(3, 9), q: I(4, 15), r: I(1, 8), a: D((v) => N(v, 'b') * N(v, 'q') + N(v, 'r')) },
    constraints: [{ test: (v: Vars) => N(v, 'r') < N(v, 'b'), note: 'remainder below divisor' }],
    answer: (v) => quotientAndRest(N(v, 'a'), N(v, 'b')),
    wrong: (v) => quotientSlips(N(v, 'a'), N(v, 'b')),
    why: (v, a) => `${v.b} × ${v.q} = ${N(v, 'b') * N(v, 'q')}, ${v.a} − ${N(v, 'b') * N(v, 'q')} = ${v.r}: ${a}.`,
  }),
  t({
    sub: 'u01-12',
    prompt: 'გაყავი {a} {b}-ზე და მიუთითე განაყოფი და ნაშთი.',
    vars: { b: I(6, 13), q: I(8, 25), r: I(1, 12), a: D((v) => N(v, 'b') * N(v, 'q') + N(v, 'r')) },
    constraints: [{ test: (v: Vars) => N(v, 'r') < N(v, 'b'), note: 'remainder below divisor' }],
    answer: (v) => quotientAndRest(N(v, 'a'), N(v, 'b')),
    wrong: (v) => quotientSlips(N(v, 'a'), N(v, 'b')),
    why: (v, a) => `${v.b} × ${v.q} = ${N(v, 'b') * N(v, 'q')}, ${v.a} − ${N(v, 'b') * N(v, 'q')} = ${v.r}: ${a}.`,
  }),
  t({
    sub: 'u01-12',
    prompt: 'იპოვე ნაშთი: {a} ÷ {b}.',
    vars: { b: I(4, 12), q: I(8, 30), r: I(1, 11), a: D((v) => N(v, 'b') * N(v, 'q') + N(v, 'r')) },
    constraints: [{ test: (v: Vars) => N(v, 'r') < N(v, 'b'), note: 'remainder below divisor' }],
    answer: (v) => String(N(v, 'r')),
    wrong: (v) => [N(v, 'b') - N(v, 'r'), N(v, 'q'), N(v, 'r') + 1, N(v, 'r') + N(v, 'b')],
    why: (v, a) => `${v.b} × ${v.q} = ${N(v, 'b') * N(v, 'q')}, ${v.a} − ${N(v, 'b') * N(v, 'q')} = ${a}.`,
  }),
  t({
    sub: 'u01-12',
    prompt: '{a} ფანქარი თანაბრად გადაანაწილეს {b} მოსწავლეს შორის. რამდენი ფანქარი შეხვდა თითოეულს და რამდენი დარჩა?',
    vars: { b: I(4, 12), q: I(5, 20), r: I(1, 11), a: D((v) => N(v, 'b') * N(v, 'q') + N(v, 'r')) },
    constraints: [{ test: (v: Vars) => N(v, 'r') < N(v, 'b'), note: 'remainder below divisor' }],
    answer: (v) => `${N(v, 'q')} ფანქარი, დარჩა ${N(v, 'r')}`,
    wrong: (v) => quotientSlips(N(v, 'a'), N(v, 'b')).map((x) => x.replace('ნაშთი', 'დარჩა').replace(/^(\d+)/, '$1 ფანქარი')),
    why: (v, a) => `${v.a} ÷ ${v.b}: ${N(v, 'b')} × ${v.q} = ${N(v, 'b') * N(v, 'q')}, ნაშთი ${v.r}. პასუხი: ${a}.`,
  }),
  t({
    sub: 'u01-12',
    prompt: 'იპოვე უდიდესი რიცხვი, რომელიც {d}-ზე გაყოფისას იძლევა განაყოფს {q}.',
    vars: { d: I(4, 12), q: I(5, 25) },
    answer: (v) => String(N(v, 'd') * N(v, 'q') + N(v, 'd') - 1),
    wrong: (v) => [N(v, 'd') * N(v, 'q'), N(v, 'd') * N(v, 'q') + N(v, 'd'), N(v, 'd') * N(v, 'q') + 1, N(v, 'd') * N(v, 'q') + N(v, 'd') - 2],
    why: (v, a) => `უდიდესი ნაშთი ${N(v, 'd') - 1}-ია, ამიტომ ${v.d} × ${v.q} + ${N(v, 'd') - 1} = ${a}.`,
  }),
  t({
    sub: 'u01-12',
    prompt: 'რიცხვის {d}-ზე გაყოფისას განაყოფია {q}, ნაშთი კი {r}. იპოვე ეს რიცხვი.',
    vars: { d: I(5, 12), q: I(6, 30), r: I(1, 11) },
    constraints: [{ test: (v: Vars) => N(v, 'r') < N(v, 'd'), note: 'remainder below divisor' }],
    answer: (v) => String(N(v, 'd') * N(v, 'q') + N(v, 'r')),
    wrong: (v) => [N(v, 'd') * N(v, 'q'), N(v, 'd') * N(v, 'q') - N(v, 'r'), N(v, 'd') + N(v, 'q') + N(v, 'r'), N(v, 'd') * (N(v, 'q') + N(v, 'r'))],
    why: (v, a) => `გასაყოფი = გამყოფი × განაყოფი + ნაშთი = ${v.d} × ${v.q} + ${v.r} = ${a}.`,
  }),

  // ═════════ U01.13 — ირაციონალური და ნამდვილი რიცხვები ═════════
  t({
    sub: 'u01-13',
    prompt: 'არის თუ არა √{n} რაციონალური რიცხვი?',
    vars: { n: C([...SQUARES, ...NON_SQUARES]) },
    answer: (v) => (isSquare(N(v, 'n')) ? `დიახ, √${v.n} = ${Math.sqrt(N(v, 'n'))}` : `არა, √${v.n} ირაციონალურია`),
    options: (v, right) => {
      const n = N(v, 'n');
      const k = Math.floor(Math.sqrt(n));
      return isSquare(n)
        ? [right, `არა, √${n} ირაციონალურია`, `დიახ, √${n} = ${k + 1}`, `დიახ, √${n} = ${k * 2}`]
        : [right, `დიახ, √${n} = ${k}`, `დიახ, √${n} = ${k + 1}`, `დიახ, √${n} = ${k + 2}`];
    },
    why: (v, a) => (isSquare(N(v, 'n')) ? `${Math.sqrt(N(v, 'n'))} × ${Math.sqrt(N(v, 'n'))} = ${v.n}, ამიტომ √${v.n} მთელია და რაციონალური: ${a}.` : `${v.n} არ არის სრული კვადრატი, ამიტომ √${v.n} ირაციონალურია: ${a}.`),
  }),
  t({
    sub: 'u01-13',
    prompt: 'რომელია ირაციონალური რიცხვი: {list}?',
    vars: {
      a: C(SQUARES),
      b: C(NON_SQUARES),
      f: C(['3/4', '5/8', '2/3', '7/9', '1/6', '5/7', '4/9', '3/10']),
      d: C(['0,25', '0,5', '1,75', '0,125', '2,4', '3,6']),
      o: I(0, 3),
      list: D((v) => {
        const items = [`√${N(v, 'a')}`, `√${N(v, 'b')}`, String(v.f), String(v.d)];
        const o = N(v, 'o');
        return [...items.slice(o), ...items.slice(0, o)].join(', ');
      }),
    },
    answer: (v) => `√${v.b}`,
    options: (v, right) => [right, `√${v.a}`, String(v.f), String(v.d)],
    why: (v, a) => `√${v.a} = ${Math.sqrt(N(v, 'a'))}, ${v.f} და ${v.d} რაციონალურია; ${a} არ არის სრული კვადრატის ფესვი, ამიტომ ირაციონალურია.`,
  }),
  t({
    sub: 'u01-13',
    prompt: 'გამოთვალე: √{n}.',
    vars: { n: C([...SQUARES, 169, 196, 225, 256, 289, 324, 361, 400]) },
    answer: (v) => String(Math.sqrt(N(v, 'n'))),
    wrong: (v) => [Math.sqrt(N(v, 'n')) + 1, Math.sqrt(N(v, 'n')) - 1, Math.sqrt(N(v, 'n')) * 2, Math.round(N(v, 'n') / 2)],
    why: (v, a) => `${a} × ${a} = ${v.n}, ამიტომ √${v.n} = ${a}.`,
  }),
  t({
    sub: 'u01-13',
    prompt: 'რომელ ორ მთელ რიცხვს შორის მდებარეობს √{n}?',
    vars: { n: I(2, 120) },
    constraints: [{ test: (v: Vars) => !isSquare(N(v, 'n')), note: 'not a perfect square' }],
    answer: (v) => `${Math.floor(Math.sqrt(N(v, 'n')))} და ${Math.floor(Math.sqrt(N(v, 'n'))) + 1}`,
    wrong: (v) => {
      const k = Math.floor(Math.sqrt(N(v, 'n')));
      return [`${k - 1} და ${k}`, `${k + 1} და ${k + 2}`, `${k} და ${k + 2}`, `${k - 1} და ${k + 1}`];
    },
    why: (v, a) => {
      const k = Math.floor(Math.sqrt(N(v, 'n')));
      return `${k}² = ${k * k} < ${v.n} < ${(k + 1) * (k + 1)} = ${k + 1}², ამიტომ √${v.n} მდებარეობს რიცხვებს ${a} შორის.`;
    },
  }),
  t({
    sub: 'u01-13',
    prompt: 'დაალაგე ზრდადობით: √{a}, √{b}, √{c}.',
    vars: { a: I(2, 80), b: I(2, 80), c: I(2, 80) },
    constraints: [{ test: (v: Vars) => new Set([N(v, 'a'), N(v, 'b'), N(v, 'c')]).size === 3, note: 'three different numbers' }],
    answer: (v) => [N(v, 'a'), N(v, 'b'), N(v, 'c')].sort((x, y) => x - y).map((x) => `√${x}`).join(' < '),
    options: (v, right) => {
      const s = [N(v, 'a'), N(v, 'b'), N(v, 'c')].sort((x, y) => x - y);
      const fmt = (arr: number[]): string => arr.map((x) => `√${x}`).join(' < ');
      const [x, y, z] = s as [number, number, number];
      return [right, fmt([z, y, x]), fmt([y, x, z]), fmt([x, z, y]), fmt([y, z, x])];
    },
    why: (_v, a) => `რაც მეტია ფესვქვეშა რიცხვი, მით მეტია ფესვი: ${a}.`,
  }),
  t({
    sub: 'u01-13',
    prompt: 'რამდენი რაციონალური რიცხვია ჩამონათვალში: √{x}, √{y}, {f}, π?',
    vars: { x: C([...SQUARES, ...NON_SQUARES]), y: C([...SQUARES, ...NON_SQUARES]), f: C(['5/8', '3/4', '2/9', '7/10', '1/6', '4/5']) },
    constraints: [{ test: (v: Vars) => N(v, 'x') !== N(v, 'y'), note: 'different roots' }],
    answer: (v) => String(1 + (isSquare(N(v, 'x')) ? 1 : 0) + (isSquare(N(v, 'y')) ? 1 : 0)),
    wrong: (v) => [0, 1, 2, 3, 4].filter((k) => k !== 1 + (isSquare(N(v, 'x')) ? 1 : 0) + (isSquare(N(v, 'y')) ? 1 : 0)),
    why: (v, a) => `${v.f} რაციონალურია, π ირაციონალურია; √${v.x} და √${v.y}-დან რაციონალურია მხოლოდ სრული კვადრატის ფესვი. სულ: ${a}.`,
  }),

  // ═════════ U01.14 — პერიოდული ათწილადები ═════════
  t({
    sub: 'u01-14',
    prompt: 'ჩაწერე 0,({d}) ჩვეულებრივი წილადის სახით.',
    vars: { d: I(1, 8) },
    answer: (v) => mText(fr(N(v, 'd'), 9)),
    wrong: (v) => [rawF(N(v, 'd'), 10), rawF(N(v, 'd'), 99), rawF(N(v, 'd'), 8), rawF(N(v, 'd') + 1, 9)],
    why: (v, a) => `0,(${v.d}) = ${v.d}/9 = ${a}.`,
  }),
  t({
    sub: 'u01-14',
    prompt: 'გამოსახე ჩვეულებრივი წილადით: 0,({ab}).',
    vars: { ab: I(10, 98) },
    answer: (v) => mText(fr(N(v, 'ab'), 99)),
    wrong: (v) => [rawF(N(v, 'ab'), 100), rawF(N(v, 'ab'), 90), rawF(N(v, 'ab'), 9), rawF(N(v, 'ab'), 999)],
    why: (v, a) => `0,(${v.ab}) = ${v.ab}/99 = ${a}.`,
  }),
  t({
    sub: 'u01-14',
    prompt: 'ჩაწერე 0,({ab}) ჩვეულებრივი წილადის სახით და გაამარტივე.',
    vars: { ab: I(12, 96) },
    constraints: [{ test: (v: Vars) => gcd(N(v, 'ab'), 99) > 1, note: 'reducible by 3, 9 or 11' }],
    answer: (v) => mText(fr(N(v, 'ab'), 99)),
    wrong: (v) => [rawF(N(v, 'ab'), 99), rawF(N(v, 'ab'), 100), rawF(N(v, 'ab'), 90), rawF(N(v, 'ab') + 1, 99)],
    why: (v, a) => `0,(${v.ab}) = ${v.ab}/99, უსგ = ${gcd(N(v, 'ab'), 99)}: ${a}.`,
  }),
  t({
    sub: 'u01-14',
    prompt: '{w} {f} პერიოდული ათწილადის სახით.',
    vars: { d: I(1, 8), w: C(['ჩაწერე', 'გამოსახე']), f: D((v) => rawF(N(v, 'd'), 9)) },
    answer: (v) => `0,(${v.d})`,
    wrong: (v) => [`0,${v.d}`, `0,(${N(v, 'd') + 1})`, `0,${v.d}${v.d}`, `0,(0${v.d})`],
    why: (v, a) => `${v.f} = ${v.d} ÷ 9 = ${a}.`,
  }),
  t({
    sub: 'u01-14',
    prompt: 'ჩაწერე {f} პერიოდული ათწილადის სახით.',
    vars: { m: I(1, 10), f: D((v) => rawF(N(v, 'm'), 11)) },
    answer: (v) => periodText(String(N(v, 'm') * 9).padStart(2, '0')),
    wrong: (v) => {
      const xx = String(N(v, 'm') * 9).padStart(2, '0');
      return [`0,${xx}`, periodText([...xx].reverse().join('')), periodText(String(N(v, 'm') * 9 + 1).padStart(2, '0')), periodText(String(N(v, 'm')).padStart(2, '0'))];
    },
    why: (v, a) => `${v.m}/11 = ${v.m} × 9/99 = ${String(N(v, 'm') * 9).padStart(2, '0')}/99 = ${a}.`,
  }),
  t({
    sub: 'u01-14',
    prompt: 'გადააქციე პერიოდულ ათწილადად: {f}.',
    vars: { m: I(1, 10), f: D((v) => rawF(N(v, 'm'), 11)) },
    answer: (v) => periodText(String(N(v, 'm') * 9).padStart(2, '0')),
    wrong: (v) => {
      const xx = String(N(v, 'm') * 9).padStart(2, '0');
      return [`0,${xx}`, periodText([...xx].reverse().join('')), periodText(String(N(v, 'm') * 9 - 1).padStart(2, '0')), periodText(String(N(v, 'm')).padStart(2, '0'))];
    },
    why: (v, a) => `${v.m}/11 = ${v.m} × 9/99 = ${String(N(v, 'm') * 9).padStart(2, '0')}/99 = ${a}.`,
  }),
];
