import type { QuestionTemplate, Vars } from './types';
import { C, D, I, MINUS, N, fr, fText, gcd, q6 } from './g6-helpers';
import { fmt, textOptions, unitOptions } from './g7-u08-proportion-percent';
import { WORDS, slipFracs } from './g7-u11-data';
import { group } from './g5-helpers';

/**
 * Grade VII — Unit 12: probability and counting.
 *
 * Converted from the academy's Grade VII `U12` bank: 8 subtopics × 6 questions.
 *
 * Probabilities are favourable ÷ possible in lowest terms; the favourable
 * outcomes of a die or card event are counted by a predicate, so the key and
 * the printed event cannot drift apart. Counting tasks give n!, C(n, k) and
 * A(n, k) as whole numbers. Slips are the slips of the topic: the complement,
 * odds instead of probability, the sum for the product, order ignored or
 * counted by mistake.
 */

export const G7_U12_SUBTOPICS = ['u12-01', 'u12-02', 'u12-03', 'u12-04', 'u12-05', 'u12-06', 'u12-07', 'u12-08'] as const;

const T = 'g7-probability';
let seq = 0;
const nextId = (): string => `g7-u12-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic' | 'grade'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, grade: 7, ...spec });

const g = (v: Vars, key: string): number => N(v, key);
const isPrime = (n: number): boolean => n > 1 && Array.from({ length: n - 2 }, (_, i) => i + 2).every((d) => n % d !== 0);
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const comb = (n: number, k: number): number => fact(n) / (fact(k) * fact(n - k));
const arr = (n: number, k: number): number => fact(n) / fact(n - k);
const range = (a: number, b: number): number[] => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/** The key `n/d` in lowest terms; the options are slips of the same shape. */
const P = (n: number, d: number): string => fText(fr(n, d));
const probOptions = (n: number, d: number, extra: Array<[number, number]> = []): string[] => {
  const key = fr(n, d);
  return [P(n, d), ...slipFracs(key, extra.map(([a, b]) => fr(a, b)))];
};
const why = (n: number, d: number): string => (P(n, d) === `${n}/${d}` ? `${n}/${d}` : `${n}/${d} = ${P(n, d)}`);
const COUNT_SLIP = (key: number, slips: number[]): string[] => unitOptions(key, '', slips);

// ───────────────────────── die events ─────────────────────────
interface DieEvent {
  g: string;
  test: (x: number) => boolean;
}
const FACES: DieEvent[] = range(1, 6).map((k) => ({ g: `${k}-ის`, test: (x) => x === k }));
const GROUPS: DieEvent[] = [
  { g: 'ლუწი რიცხვის', test: (x) => x % 2 === 0 },
  { g: 'კენტი რიცხვის', test: (x) => x % 2 === 1 },
  { g: '3-ის ჯერადი რიცხვის', test: (x) => x % 3 === 0 },
  { g: '4-ზე მეტი რიცხვის', test: (x) => x > 4 },
  { g: '3-ზე ნაკლები რიცხვის', test: (x) => x < 3 },
  { g: 'მარტივი რიცხვის', test: (x) => isPrime(x) },
];
const ALL_EVENTS = [...FACES, ...GROUPS];
const evCount = (e: DieEvent): number => range(1, 6).filter(e.test).length;
const evVar = (list: DieEvent[]) => ({ ev: I(0, list.length - 1), eg: D((v: Vars) => list[g(v, 'ev')]!.g) });

const COLOR3 = ['წითელი', 'ლურჯი', 'მწვანე'];
const COLOR_PAIRS = ['წითელი|ლურჯი', 'თეთრი|შავი', 'მწვანე|ყვითელი', 'ლურჯი|წითელი'];
const pairVars = (pairs: string[]) => ({
  cp: C(pairs),
  c1: D((v: Vars) => String(v.cp).split('|')[0]!),
  c2: D((v: Vars) => String(v.cp).split('|')[1]!),
});
const SIDES = ['გერბი|გერბის', 'საფასური|საფასურის'];
const sideVars = (key = 'sd', nom = 'sn', gen = 'sg') => ({
  [key]: C(SIDES),
  [nom]: D((v: Vars) => String(v[key]).split('|')[0]!),
  [gen]: D((v: Vars) => String(v[key]).split('|')[1]!),
});
const DIE_FRAMES = ['სამართლიან ექვსწახნაგა კამათელს აგორებენ ერთხელ.', 'ერთ სამართლიან კამათელს აგდებენ.', 'კამათელს ერთხელ აგორებენ; ექვსივე წახნაგი თანაბრად შესაძლებელია.'];
const dieFrame = { fr0: C([0, 1, 2]), frame: D((v: Vars) => DIE_FRAMES[g(v, 'fr0')]!) };
const NOUNS = ['წიგნი', 'ჟურნალი', 'ალბომი', 'სურათი', 'ბარათი', 'ნახატი', 'კუბიკი'];
/** `წიგნი|წიგნიდან|წიგნის`. */
const nounVars = (pool: string[] = NOUNS) => ({
  np: C(pool.map((w) => `${w}|${w}დან|${w}ს`)),
  nm: D((v: Vars) => String(v.np).split('|')[0]!),
  nf: D((v: Vars) => String(v.np).split('|')[1]!),
  ng: D((v: Vars) => String(v.np).split('|')[2]!),
});
const PEOPLE = ['მოსწავლიდან|მოსწავლე', 'მოხალისიდან|მოხალისე', 'სპორტსმენიდან|სპორტსმენი', 'მუსიკოსიდან|მუსიკოსი'];
const peopleVars = (pool: string[] = PEOPLE) => ({
  pp: C(pool),
  pf: D((v: Vars) => String(v.pp).split('|')[0]!),
  pn: D((v: Vars) => String(v.pp).split('|')[1]!),
});
const reduceOk = (n: number, d: number): boolean => n > 0 && n < d && fr(n, d).d > 1;

export const G7_U12_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U12.1 — ფარდობითი სიხშირე და ალბათობა ═════════
  t({
    sub: 'u12-01',
    prompt: 'მონეტა {n}-ჯერ ააგდეს და {sn} {k}-ჯერ მოვიდა. იპოვე {sg} მოსვლის ფარდობითი სიხშირე უმარტივესი წილადის სახით.',
    vars: { n: C([20, 30, 40, 50, 60, 80, 100]), k: I(4, 70), ...sideVars() },
    constraints: [{ test: (v: Vars) => reduceOk(g(v, 'k'), g(v, 'n')) && gcd(g(v, 'k'), g(v, 'n')) > 1, note: 'a fraction to reduce' }],
    answer: (v) => P(g(v, 'k'), g(v, 'n')),
    options: (v) => probOptions(g(v, 'k'), g(v, 'n'), [[g(v, 'n') - g(v, 'k'), g(v, 'n')], [g(v, 'k'), g(v, 'n') - g(v, 'k')]]),
    why: (v, a) => `${v.k}/${v.n} = ${a}.`,
  }),
  t({
    sub: 'u12-01',
    prompt: 'კამათელი {n}-ჯერ გააგორეს და რიცხვი {f} ამოვიდა {k}-ჯერ. იპოვე {f}-ის ამოსვლის ფარდობითი სიხშირე პროცენტებში.',
    vars: { n: C([20, 25, 40, 50, 100, 200]), k: I(2, 80), f: I(1, 6) },
    constraints: [{ test: (v: Vars) => g(v, 'k') < g(v, 'n') && (100 * g(v, 'k')) % g(v, 'n') === 0, note: 'a whole percent' }],
    answer: (v) => fmt((100 * g(v, 'k')) / g(v, 'n'), '%'),
    options: (v) => unitOptions((100 * g(v, 'k')) / g(v, 'n'), '%', [g(v, 'k'), g(v, 'n') - g(v, 'k'), 100 - (100 * g(v, 'k')) / g(v, 'n'), (g(v, 'k') * g(v, 'n')) / 100]),
    why: (v, a) => `${v.k} ÷ ${v.n} · 100% = ${a}.`,
  }),
  t({
    sub: 'u12-01',
    prompt: 'ჩანთაში {r} {c1} და {b} {c2} ბურთია. შემთხვევით ამოიღეს ერთი ბურთი. იპოვე {c1} ბურთის ამოღების ალბათობა.',
    vars: { r: I(1, 9), b: I(2, 15), ...pairVars(COLOR_PAIRS) },
    constraints: [{ test: (v: Vars) => fr(g(v, 'r'), g(v, 'r') + g(v, 'b')).d > 1, note: 'a proper fraction' }],
    answer: (v) => P(g(v, 'r'), g(v, 'r') + g(v, 'b')),
    options: (v) => probOptions(g(v, 'r'), g(v, 'r') + g(v, 'b'), [[g(v, 'b'), g(v, 'r') + g(v, 'b')], [g(v, 'r'), g(v, 'b')], [1, g(v, 'r')]]),
    why: (v, a) => `ბურთები სულ ${g(v, 'r') + g(v, 'b')}, ხელსაყრელი ${v.r}: ${why(g(v, 'r'), g(v, 'r') + g(v, 'b'))}. ${a}.`,
  }),
  t({
    sub: 'u12-01',
    prompt: 'ყუთში {a} მწვანე, {b} ყვითელი და {c} წითელი ბარათია. შემთხვევით იღებენ ერთ ბარათს. იპოვე {col} ბარათის ამოღების ალბათობა.',
    vars: { a: I(2, 6), b: I(2, 6), c: I(2, 6), ask: I(0, 2), col: D((v: Vars) => ['მწვანე', 'ყვითელი', 'წითელი'][g(v, 'ask')]!) },
    answer: (v) => P(g(v, ['a', 'b', 'c'][g(v, 'ask')]!), g(v, 'a') + g(v, 'b') + g(v, 'c')),
    options: (v) => {
      const k = g(v, ['a', 'b', 'c'][g(v, 'ask')]!);
      const tot = g(v, 'a') + g(v, 'b') + g(v, 'c');
      return probOptions(k, tot, [[tot - k, tot], [k, tot - k], [1, 3]]);
    },
    why: (v, a) => {
      const k = g(v, ['a', 'b', 'c'][g(v, 'ask')]!);
      const tot = g(v, 'a') + g(v, 'b') + g(v, 'c');
      return `ბარათები სულ ${tot}, ${v.col} ${k}: ${why(k, tot)}. ${a}.`;
    },
  }),
  t({
    sub: 'u12-01',
    prompt: 'ბორბალი დაყოფილია {N} თანაბარ სექტორად: {a} ლურჯი, {b} წითელი და {c} მწვანე. იპოვე {col} სექტორზე გაჩერების ალბათობა.',
    vars: { a: I(1, 4), b: I(1, 4), c: I(1, 4), ask: I(0, 2), N: D((v: Vars) => g(v, 'a') + g(v, 'b') + g(v, 'c')), col: D((v: Vars) => ['ლურჯ', 'წითელ', 'მწვანე'][g(v, 'ask')]!) },
    answer: (v) => P(g(v, ['a', 'b', 'c'][g(v, 'ask')]!), g(v, 'N')),
    options: (v) => {
      const k = g(v, ['a', 'b', 'c'][g(v, 'ask')]!);
      return probOptions(k, g(v, 'N'), [[g(v, 'N') - k, g(v, 'N')], [k, g(v, 'N') - k], [1, 3]]);
    },
    why: (v, a) => {
      const k = g(v, ['a', 'b', 'c'][g(v, 'ask')]!);
      return `სექტორები სულ ${v.N}, ${v.col} ${k}: ${why(k, g(v, 'N'))}. ${a}.`;
    },
  }),
  t({
    sub: 'u12-01',
    prompt: 'ექსპერიმენტში მოვლენის ფარდობითი სიხშირე იყო {fr}. ექსპერიმენტი ჩატარდა {N}-ჯერ. რამდენჯერ მოხდა მოვლენა, თუ მოცემული ფარდობითი სიხშირე ზუსტად შენარჩუნდა?',
    vars: { pq: C(['3|10', '1|4', '2|5', '3|8', '7|20', '4|5', '1|5', '3|20']), m: I(2, 20), p: D((v: Vars) => Number(String(v.pq).split('|')[0])), q: D((v: Vars) => Number(String(v.pq).split('|')[1])), N: D((v: Vars) => g(v, 'q') * g(v, 'm')), fr: D((v: Vars) => String(v.pq).replace('|', '/')) },
    constraints: [{ test: (v: Vars) => g(v, 'N') >= 40 && g(v, 'N') <= 400 && g(v, 'N') % 10 === 0, note: 'a round number of trials' }],
    answer: (v) => fmt(g(v, 'p') * g(v, 'm'), 'ჯერ'),
    options: (v) => unitOptions(g(v, 'p') * g(v, 'm'), 'ჯერ', [g(v, 'N') / g(v, 'q'), g(v, 'N') - g(v, 'p') * g(v, 'm'), g(v, 'p') + g(v, 'N'), g(v, 'q') * g(v, 'm') - g(v, 'p')]),
    why: (v, a) => `${v.N} · ${v.p}/${v.q} = ${v.m} · ${v.p} = ${a}.`,
  }),

  // ═════════ U12.2 — მოვლენის ალბათობა ═════════
  t({
    sub: 'u12-02',
    prompt: '{frame} იპოვე {eg} ამოსვლის ალბათობა.',
    vars: { ...evVar(GROUPS), ...dieFrame },
    answer: (v) => P(evCount(GROUPS[g(v, 'ev')]!), 6),
    options: (v) => probOptions(evCount(GROUPS[g(v, 'ev')]!), 6, [[6 - evCount(GROUPS[g(v, 'ev')]!), 6], [evCount(GROUPS[g(v, 'ev')]!), 5], [1, 6]]),
    why: (v, a) => `ხელსაყრელი შედეგებია ${range(1, 6).filter(GROUPS[g(v, 'ev')]!.test).join(', ')}; ${why(evCount(GROUPS[g(v, 'ev')]!), 6)}. ${a}.`,
  }),
  t({
    sub: 'u12-02',
    prompt: 'ყუთში არის {w} {c1} და {b} {c2} ბურთი. შემთხვევით იღებენ ერთ ბურთს. იპოვე {c2} ბურთის ამოღების ალბათობა.',
    vars: { w: I(2, 12), b: I(1, 9), ...pairVars(['თეთრი|შავი', 'წითელი|ლურჯი', 'მწვანე|ყვითელი']) },
    constraints: [{ test: (v: Vars) => fr(g(v, 'b'), g(v, 'w') + g(v, 'b')).d > 1, note: 'a proper fraction' }],
    answer: (v) => P(g(v, 'b'), g(v, 'w') + g(v, 'b')),
    options: (v) => probOptions(g(v, 'b'), g(v, 'w') + g(v, 'b'), [[g(v, 'w'), g(v, 'w') + g(v, 'b')], [g(v, 'b'), g(v, 'w')], [1, g(v, 'b')]]),
    why: (v, a) => `ბურთები სულ ${g(v, 'w') + g(v, 'b')}, ${v.c2} ${v.b}: ${why(g(v, 'b'), g(v, 'w') + g(v, 'b'))}. ${a}.`,
  }),
  t({
    sub: 'u12-02',
    prompt: 'ბარათებზე წერია რიცხვები 1-დან {N}-მდე. შემთხვევით იღებენ ერთ ბარათს. იპოვე {k}-ზე დიდი რიცხვის ამოღების ალბათობა.',
    vars: { N: C([10, 12, 15, 20]), k: I(3, 14) },
    constraints: [{ test: (v: Vars) => g(v, 'k') < g(v, 'N') - 1 && fr(g(v, 'N') - g(v, 'k'), g(v, 'N')).d > 1, note: 'a proper fraction' }],
    answer: (v) => P(g(v, 'N') - g(v, 'k'), g(v, 'N')),
    options: (v) => probOptions(g(v, 'N') - g(v, 'k'), g(v, 'N'), [[g(v, 'k'), g(v, 'N')], [g(v, 'N') - g(v, 'k') + 1, g(v, 'N')], [g(v, 'N') - g(v, 'k'), g(v, 'k')]]),
    why: (v, a) => `${v.k}-ზე დიდია ${g(v, 'N') - g(v, 'k')} რიცხვი ${v.N}-დან: ${why(g(v, 'N') - g(v, 'k'), g(v, 'N'))}. ${a}.`,
  }),
  t({
    sub: 'u12-02',
    prompt: '{frame} იპოვე {k}-ზე {dw} რიცხვის ამოსვლის ალბათობა.',
    vars: { k: I(2, 5), dir: C([0, 1]), dw: D((v: Vars) => (g(v, 'dir') ? 'მეტი' : 'ნაკლები')), ...dieFrame },
    answer: (v) => P(g(v, 'dir') ? 6 - g(v, 'k') : g(v, 'k') - 1, 6),
    options: (v) => {
      const fav = g(v, 'dir') ? 6 - g(v, 'k') : g(v, 'k') - 1;
      return probOptions(fav, 6, [[fav + 1, 6], [6 - fav, 6], [fav, 5]]);
    },
    why: (v, a) => {
      const fav = g(v, 'dir') ? 6 - g(v, 'k') : g(v, 'k') - 1;
      return `${v.k}-ზე ${v.dw} არის ${fav} რიცხვი: ${why(fav, 6)}. ${a}.`;
    },
  }),
  t({
    sub: 'u12-02',
    prompt: 'ჩანთაში {a} წითელი, {b} ლურჯი და {c} მწვანე ბურთია. შემთხვევით იღებენ ერთ ბურთს. იპოვე იმის ალბათობა, რომ ბურთი არც {x} იყოს და არც {y}.',
    vars: { a: I(2, 7), b: I(2, 7), c: I(2, 10), ex: I(0, 2), x: D((v: Vars) => COLOR3.filter((_, i) => i !== g(v, 'ex'))[0]!), y: D((v: Vars) => COLOR3.filter((_, i) => i !== g(v, 'ex'))[1]!) },
    constraints: [{ test: (v: Vars) => fr(g(v, ['a', 'b', 'c'][g(v, 'ex')]!), g(v, 'a') + g(v, 'b') + g(v, 'c')).d > 1, note: 'a proper fraction' }],
    answer: (v) => P(g(v, ['a', 'b', 'c'][g(v, 'ex')]!), g(v, 'a') + g(v, 'b') + g(v, 'c')),
    options: (v) => {
      const k = g(v, ['a', 'b', 'c'][g(v, 'ex')]!);
      const tot = g(v, 'a') + g(v, 'b') + g(v, 'c');
      return probOptions(k, tot, [[tot - k, tot], [k, tot - k], [1, 3]]);
    },
    why: (v, a) => {
      const k = g(v, ['a', 'b', 'c'][g(v, 'ex')]!);
      const tot = g(v, 'a') + g(v, 'b') + g(v, 'c');
      return `დარჩენილი ფერის ბურთია ${k} ${tot}-დან: ${why(k, tot)}. ${a}.`;
    },
  }),
  t({
    sub: 'u12-02',
    prompt: '{cards} რიცხვები 1-დან {N}-მდე. შემთხვევით იღებენ ერთ ბარათს. იპოვე მარტივი რიცხვის ამოღების ალბათობა.',
    vars: { N: C([8, 10, 12, 14, 15, 18, 20, 25]), ph: C([0, 1]), cards: D((v: Vars) => (g(v, 'ph') ? 'ბარათებზე დაწერილია' : 'ბარათებზე წერია')) },
    answer: (v) => P(range(1, g(v, 'N')).filter(isPrime).length, g(v, 'N')),
    options: (v) => probOptions(range(1, g(v, 'N')).filter(isPrime).length, g(v, 'N'), [[range(1, g(v, 'N')).filter(isPrime).length + 1, g(v, 'N')], [g(v, 'N') - range(1, g(v, 'N')).filter(isPrime).length, g(v, 'N')], [range(1, g(v, 'N')).filter(isPrime).length, g(v, 'N') - 1]]),
    why: (v, a) => `მარტივებია ${range(1, g(v, 'N')).filter(isPrime).join(', ')}; ${why(range(1, g(v, 'N')).filter(isPrime).length, g(v, 'N'))}. ${a}.`,
  }),

  // ═════════ U12.3 — დამოუკიდებელი მოვლენები ═════════
  t({
    sub: 'u12-03',
    prompt: '{ctx} იპოვე {phr} {sg} მოსვლის ალბათობა.',
    vars: {
      ...sideVars(),
      form: C([0, 1, 2, 3, 4]),
      ctx: D((v: Vars) => ['მონეტას ორჯერ აგდებენ.', 'მონეტას ზედიზედ ორჯერ აგდებენ.', 'ორ სამართლიან მონეტას ერთდროულად აგდებენ.', 'ორმა მეგობარმა თითო მონეტა ააგდო.', 'სამართლიან მონეტას ორჯერ აგდებენ.'][g(v, 'form')]!),
      phr: D((v: Vars) => (g(v, 'form') === 2 || g(v, 'form') === 3 ? 'ორივე მონეტაზე' : 'ორივეჯერ')),
    },
    answer: () => P(1, 4),
    options: (_v, right) => textOptions(right, ['1/2', '1/3', '3/4', '1/8']),
    why: (_v, a) => `თითოეულის ალბათობაა 1/2; 1/2 · 1/2 = ${a}.`,
  }),
  t({
    sub: 'u12-03',
    prompt: 'სამართლიან კამათელს {nw} აგორებენ. იპოვე ყველა აგდებაზე {f}-ის ამოსვლის ალბათობა.',
    vars: { n: C([2, 2, 3]), f: I(1, 6), nw: D((v: Vars) => (g(v, 'n') === 2 ? 'ორჯერ' : 'სამჯერ')) },
    answer: (v) => P(1, 6 ** g(v, 'n')),
    options: (v, right) => textOptions(right, [P(1, 6 * g(v, 'n')), P(g(v, 'n'), 6), P(1, 6), P(1, 6 ** (g(v, 'n') + 1))]),
    why: (v, a) => `${g(v, 'n') === 2 ? '1/6 · 1/6' : '1/6 · 1/6 · 1/6'} = ${a}.`,
  }),
  t({
    sub: 'u12-03',
    prompt: 'ყუთში არის {r} {c1} და {b} {c2} ბურთი. ბურთს იღებენ, აბრუნებენ ყუთში და შემდეგ იღებენ მეორეს. იპოვე ორივეჯერ {c1} ბურთის ამოღების ალბათობა.',
    vars: { r: I(1, 6), b: I(1, 6), ...pairVars(['წითელი|ლურჯი', 'თეთრი|შავი', 'მწვანე|ყვითელი']) },
    constraints: [{ test: (v: Vars) => g(v, 'r') + g(v, 'b') >= 4, note: 'enough balls' }],
    answer: (v) => P(g(v, 'r') ** 2, (g(v, 'r') + g(v, 'b')) ** 2),
    options: (v) => probOptions(g(v, 'r') ** 2, (g(v, 'r') + g(v, 'b')) ** 2, [[g(v, 'r'), g(v, 'r') + g(v, 'b')], [2 * g(v, 'r'), 2 * (g(v, 'r') + g(v, 'b'))], [g(v, 'r') * (g(v, 'r') - 1), (g(v, 'r') + g(v, 'b')) * (g(v, 'r') + g(v, 'b') - 1)], [g(v, 'r') * 2, g(v, 'r') + g(v, 'b')]]),
    why: (v, a) => `თითოეულჯერ ${P(g(v, 'r'), g(v, 'r') + g(v, 'b'))}; ნამრავლი ${why(g(v, 'r') ** 2, (g(v, 'r') + g(v, 'b')) ** 2)}. ${a}.`,
  }),
  t({
    sub: 'u12-03',
    prompt: 'მონეტას ერთხელ აგდებენ და კამათელს ერთხელ აგორებენ. იპოვე {sg} და {eg} ერთდროულად მიღების ალბათობა.',
    vars: { ...sideVars(), ...evVar(ALL_EVENTS) },
    answer: (v) => P(evCount(ALL_EVENTS[g(v, 'ev')]!), 12),
    options: (v) => probOptions(evCount(ALL_EVENTS[g(v, 'ev')]!), 12, [[evCount(ALL_EVENTS[g(v, 'ev')]!), 6], [evCount(ALL_EVENTS[g(v, 'ev')]!) + 1, 12], [evCount(ALL_EVENTS[g(v, 'ev')]!) + 6, 12], [1, 2]]),
    why: (v, a) => `1/2 · ${P(evCount(ALL_EVENTS[g(v, 'ev')]!), 6)} = ${a}.`,
  }),
  t({
    sub: 'u12-03',
    prompt: '{ctx} იპოვე ორივე კამათელზე {eg} ამოსვლის ალბათობა.',
    vars: { ...evVar(GROUPS), cx: C([0, 1, 2]), ctx: D((v: Vars) => ['ორი სამართლიანი ექვსწახნაგა კამათელი ერთდროულად გააგორეს.', 'ორ სამართლიან კამათელს ერთდროულად აგდებენ.', 'ორ ერთნაირ კამათელს ერთხელ აგორებენ.'][g(v, 'cx')]!) },
    answer: (v) => P(evCount(GROUPS[g(v, 'ev')]!) ** 2, 36),
    options: (v) => probOptions(evCount(GROUPS[g(v, 'ev')]!) ** 2, 36, [[evCount(GROUPS[g(v, 'ev')]!), 6], [2 * evCount(GROUPS[g(v, 'ev')]!), 12], [evCount(GROUPS[g(v, 'ev')]!) * 2, 6], [1, 36]]),
    why: (v, a) => `თითო კამათელზე ${P(evCount(GROUPS[g(v, 'ev')]!), 6)}; ნამრავლი ${why(evCount(GROUPS[g(v, 'ev')]!) ** 2, 36)}. ${a}.`,
  }),
  t({
    sub: 'u12-03',
    prompt: 'ყუთში არის {g} {c1} და {y} {c2} ბურთი. ბურთს იღებენ, უკან აბრუნებენ და მეორედ იღებენ. იპოვე ჯერ {c1}, შემდეგ კი {c2} ბურთის ამოღების ალბათობა.',
    vars: { g: I(1, 7), y: I(1, 7), ...pairVars(['მწვანე|ყვითელი', 'წითელი|ლურჯი', 'თეთრი|შავი']) },
    constraints: [{ test: (v: Vars) => g(v, 'g') !== g(v, 'y'), note: 'different counts' }],
    answer: (v) => P(g(v, 'g') * g(v, 'y'), (g(v, 'g') + g(v, 'y')) ** 2),
    options: (v) => probOptions(g(v, 'g') * g(v, 'y'), (g(v, 'g') + g(v, 'y')) ** 2, [[g(v, 'g'), g(v, 'g') + g(v, 'y')], [g(v, 'g') * g(v, 'y'), (g(v, 'g') + g(v, 'y')) * (g(v, 'g') + g(v, 'y') - 1)], [g(v, 'g') + g(v, 'y'), (g(v, 'g') + g(v, 'y')) ** 2], [g(v, 'g') ** 2, (g(v, 'g') + g(v, 'y')) ** 2]]),
    why: (v, a) => `${P(g(v, 'g'), g(v, 'g') + g(v, 'y'))} · ${P(g(v, 'y'), g(v, 'g') + g(v, 'y'))} = ${a}.`,
  }),

  // ═════════ U12.4 — მოვლენათა ჯამის ალბათობა ═════════
  t({
    sub: 'u12-04',
    prompt: 'სამართლიან კამათელს აგორებენ ერთხელ. იპოვე {list} ამოსვლის ალბათობა.',
    vars: { f1: I(1, 6), f2: I(1, 6), f3: I(1, 6), cnt: C([2, 3]), list: D((v: Vars) => [g(v, 'f1'), g(v, 'f2'), g(v, 'f3')].slice(0, g(v, 'cnt')).join('-ის ან ') + '-ის') },
    constraints: [{ test: (v: Vars) => new Set([g(v, 'f1'), g(v, 'f2'), g(v, 'f3')].slice(0, g(v, 'cnt'))).size === g(v, 'cnt'), note: 'different faces' }],
    answer: (v) => P(g(v, 'cnt'), 6),
    options: (v) => probOptions(g(v, 'cnt'), 6, [[1, 6], [g(v, 'cnt'), 36], [g(v, 'cnt') + 1, 6], [g(v, 'cnt'), 12]]),
    why: (v, a) => `ორივე შედეგი ერთმანეთს გამორიცხავს: ${[...Array(g(v, 'cnt'))].map(() => '1/6').join(' + ')} = ${a}.`,
  }),
  t({
    sub: 'u12-04',
    prompt: 'ბარათებზე წერია რიცხვები 1-დან {N}-მდე. შემთხვევით იღებენ ერთ ბარათს. იპოვე {a}-ის ჯერადი ან {b}-ის ჯერადი რიცხვის ამოღების ალბათობა.',
    vars: { N: C([12, 15, 20, 30]), ab: C(['3|5', '2|3', '3|4', '2|5', '4|5']), a: D((v: Vars) => Number(String(v.ab).split('|')[0])), b: D((v: Vars) => Number(String(v.ab).split('|')[1])) },
    constraints: [{ test: (v: Vars) => reduceOk(favMult(v), g(v, 'N')), note: 'a proper fraction' }],
    answer: (v) => P(favMult(v), g(v, 'N')),
    options: (v) => {
      const [a, b, N] = [g(v, 'a'), g(v, 'b'), g(v, 'N')];
      const both = range(1, N).filter((x) => x % a === 0 && x % b === 0).length;
      return probOptions(favMult(v), N, [[Math.floor(N / a) + Math.floor(N / b), N], [favMult(v) - 1, N], [favMult(v) + both + 1, N], [Math.floor(N / a), N]]);
    },
    why: (v, a) => `${v.a}-ის ჯერადი ${Math.floor(g(v, 'N') / g(v, 'a'))}, ${v.b}-ის ჯერადი ${Math.floor(g(v, 'N') / g(v, 'b'))}; საერთო რიცხვები ერთხელ ითვლება — სულ ${favMult(v)}: ${why(favMult(v), g(v, 'N'))}. ${a}.`,
  }),
  t({
    sub: 'u12-04',
    prompt: 'ყუთში არის {r} წითელი, {b} ლურჯი და {c} მწვანე ბურთი. შემთხვევით იღებენ ერთ ბურთს. იპოვე {x} ან {y} ბურთის ამოღების ალბათობა.',
    vars: { r: I(2, 7), b: I(2, 7), c: I(2, 7), ex: I(0, 2), x: D((v: Vars) => COLOR3.filter((_, i) => i !== g(v, 'ex'))[0]!), y: D((v: Vars) => COLOR3.filter((_, i) => i !== g(v, 'ex'))[1]!) },
    constraints: [{ test: (v: Vars) => reduceOk(favTwo(v), g(v, 'r') + g(v, 'b') + g(v, 'c')), note: 'a proper fraction' }],
    answer: (v) => P(favTwo(v), g(v, 'r') + g(v, 'b') + g(v, 'c')),
    options: (v) => {
      const tot = g(v, 'r') + g(v, 'b') + g(v, 'c');
      return probOptions(favTwo(v), tot, [[tot - favTwo(v), tot], [favTwo(v), tot - favTwo(v)], [favTwo(v) + 1, tot], [1, 2]]);
    },
    why: (v, a) => `ორი ფერის ბურთები ერთად ${favTwo(v)} ${g(v, 'r') + g(v, 'b') + g(v, 'c')}-დან: ${why(favTwo(v), g(v, 'r') + g(v, 'b') + g(v, 'c'))}. ${a}.`,
  }),
  t({
    sub: 'u12-04',
    prompt: 'სამართლიან კამათელს აგორებენ ერთხელ. იპოვე {a}-ზე ნაკლები ან {b}-ზე დიდი რიცხვის ამოსვლის ალბათობა.',
    vars: { a: I(2, 4), b: I(3, 5) },
    constraints: [{ test: (v: Vars) => g(v, 'a') <= g(v, 'b'), note: 'the two events do not overlap' }],
    answer: (v) => P(g(v, 'a') - 1 + 6 - g(v, 'b'), 6),
    options: (v) => probOptions(g(v, 'a') - 1 + 6 - g(v, 'b'), 6, [[g(v, 'a') - 1, 6], [6 - g(v, 'b'), 6], [g(v, 'a') + 6 - g(v, 'b'), 6], [g(v, 'a') - 1 + 6 - g(v, 'b'), 12]]),
    why: (v, a) => `${v.a}-ზე ნაკლებია ${g(v, 'a') - 1}, ${v.b}-ზე დიდია ${6 - g(v, 'b')}; ${why(g(v, 'a') - 1 + 6 - g(v, 'b'), 6)}. ${a}.`,
  }),
  t({
    sub: 'u12-04',
    prompt: 'ბარათებზე წერია რიცხვები 1-დან {N}-მდე. შემთხვევით იღებენ ერთ ბარათს. იპოვე {par} ან {k}-ის ტოლი რიცხვის ამოღების ალბათობა.',
    vars: { N: C([10, 12, 14, 16, 20]), pr: C([0, 1]), k: I(1, 19), par: D((v: Vars) => (g(v, 'pr') ? 'კენტი' : 'ლუწი')) },
    constraints: [{ test: (v: Vars) => g(v, 'k') <= g(v, 'N') && g(v, 'k') % 2 !== g(v, 'pr'), note: 'the number is outside the parity class' }],
    answer: (v) => P(g(v, 'N') / 2 + 1, g(v, 'N')),
    options: (v) => probOptions(g(v, 'N') / 2 + 1, g(v, 'N'), [[g(v, 'N') / 2, g(v, 'N')], [g(v, 'N') / 2 + 2, g(v, 'N')], [g(v, 'N') / 2 + 1, g(v, 'N') + 1], [1, 2]]),
    why: (v, a) => `${v.par} რიცხვებია ${g(v, 'N') / 2}; ${v.k} მათ არ ეკუთვნის, ამიტომ ხელსაყრელია ${g(v, 'N') / 2 + 1}: ${why(g(v, 'N') / 2 + 1, g(v, 'N'))}. ${a}.`,
  }),
  t({
    sub: 'u12-04',
    prompt: 'კლასში {a} მოსწავლეს უყვარს ფეხბურთი, {b}-ს — კალათბურთი, ხოლო {both}-ს — ორივე სპორტი. სულ {T} მოსწავლეა. შემთხვევით შერჩეულ მოსწავლეს ფეხბურთი ან კალათბურთი უყვარს. იპოვე ამ მოვლენის ალბათობა.',
    vars: { oa: I(2, 10), ob: I(2, 8), both: I(2, 6), no: I(1, 6), a: D((v: Vars) => g(v, 'oa') + g(v, 'both')), b: D((v: Vars) => g(v, 'ob') + g(v, 'both')), T: D((v: Vars) => g(v, 'oa') + g(v, 'ob') + g(v, 'both') + g(v, 'no')) },
    constraints: [{ test: (v: Vars) => fr(g(v, 'oa') + g(v, 'ob') + g(v, 'both'), g(v, 'T')).d > 1, note: 'a proper fraction' }],
    answer: (v) => P(g(v, 'oa') + g(v, 'ob') + g(v, 'both'), g(v, 'T')),
    options: (v) => {
      const [fav, tot] = [g(v, 'oa') + g(v, 'ob') + g(v, 'both'), g(v, 'T')];
      return probOptions(fav, tot, [[g(v, 'a') + g(v, 'b'), tot], [g(v, 'no'), tot], [fav + g(v, 'both'), tot], [tot - fav, tot]]);
    },
    why: (v, a) => `ფეხბურთი ან კალათბურთი უყვარს ${v.a} + ${v.b} ${MINUS} ${v.both} = ${g(v, 'oa') + g(v, 'ob') + g(v, 'both')} მოსწავლეს: ${why(g(v, 'oa') + g(v, 'ob') + g(v, 'both'), g(v, 'T'))}. ${a}.`,
  }),

  // ═════════ U12.5 — მოვლენათა ნამრავლის ალბათობა ═════════
  t({
    sub: 'u12-05',
    prompt: '{ctx} იპოვე პირველ აგდებაზე {g1} და მეორე აგდებაზე {g2} მოსვლის ალბათობა.',
    vars: { cx: C([0, 1, 2]), ctx: D((v: Vars) => ['მონეტას ორჯერ აგდებენ.', 'მონეტას ზედიზედ ორჯერ აგდებენ.', 'სამართლიან მონეტას ორჯერ აგდებენ.'][g(v, 'cx')]!), s1: C([0, 1]), s2: C([0, 1]), g1: D((v: Vars) => (g(v, 's1') ? 'გერბისა' : 'საფასურისა')), g2: D((v: Vars) => (g(v, 's2') ? 'გერბის' : 'საფასურის')) },
    answer: () => P(1, 4),
    options: (_v, right) => textOptions(right, ['1/2', '1/3', '3/4', '1/8']),
    why: (_v, a) => `1/2 · 1/2 = ${a}.`,
  }),
  t({
    sub: 'u12-05',
    prompt: 'სამართლიან კამათელს ორჯერ აგორებენ. იპოვე პირველ აგდებაზე {x}-ისა და მეორეზე {y}-ის ამოსვლის ალბათობა.',
    vars: { x: I(1, 6), y: I(1, 6) },
    answer: () => P(1, 36),
    options: (_v, right) => textOptions(right, ['1/12', '1/6', '1/18', '1/3']),
    why: (_v, a) => `1/6 · 1/6 = ${a}.`,
  }),
  t({
    sub: 'u12-05',
    prompt: 'ყუთში არის {r} {c1} და {b} {c2} ბურთი. ბურთს იღებენ, უკან აბრუნებენ და მეორედ იღებენ. იპოვე ორჯერ {c2} ბურთის ამოღების ალბათობა.',
    vars: { r: I(2, 7), b: I(2, 7), ...pairVars(['წითელი|ლურჯი', 'თეთრი|შავი', 'მწვანე|ყვითელი']) },
    answer: (v) => P(g(v, 'b') ** 2, (g(v, 'r') + g(v, 'b')) ** 2),
    options: (v) => probOptions(g(v, 'b') ** 2, (g(v, 'r') + g(v, 'b')) ** 2, [[g(v, 'b'), g(v, 'r') + g(v, 'b')], [2 * g(v, 'b'), 2 * (g(v, 'r') + g(v, 'b'))], [g(v, 'r') ** 2, (g(v, 'r') + g(v, 'b')) ** 2], [g(v, 'b') * g(v, 'r'), (g(v, 'r') + g(v, 'b')) ** 2]]),
    why: (v, a) => `თითოეულჯერ ${P(g(v, 'b'), g(v, 'r') + g(v, 'b'))}; ნამრავლი ${why(g(v, 'b') ** 2, (g(v, 'r') + g(v, 'b')) ** 2)}. ${a}.`,
  }),
  t({
    sub: 'u12-05',
    prompt: 'ორი სამართლიანი კამათელი ერთდროულად გააგორეს. იპოვე პირველ კამათელზე {x}-ის, ხოლო მეორეზე {y}-ის ამოსვლის ალბათობა.',
    vars: { x: I(1, 6), y: I(1, 6) },
    answer: () => P(1, 36),
    options: (_v, right) => textOptions(right, ['1/12', '1/6', '1/18', '1/3']),
    why: (_v, a) => `1/6 · 1/6 = ${a}.`,
  }),
  t({
    sub: 'u12-05',
    prompt: '{ctx} იპოვე ყველა აგდებაზე {sg} მოსვლის ალბათობა.',
    vars: { n: C([3, 4, 5, 6]), cx: C([0, 1]), ...sideVars(), nw: D((v: Vars) => ['', '', '', 'სამჯერ', 'ოთხჯერ', 'ხუთჯერ', 'ექვსჯერ'][g(v, 'n')]!), ctx: D((v: Vars) => (g(v, 'cx') ? `ერთ მონეტას ზედიზედ ${['', '', '', 'სამჯერ', 'ოთხჯერ', 'ხუთჯერ', 'ექვსჯერ'][g(v, 'n')]} აგდებენ.` : `მონეტას ${['', '', '', 'სამჯერ', 'ოთხჯერ', 'ხუთჯერ', 'ექვსჯერ'][g(v, 'n')]} აგდებენ.`)) },
    answer: (v) => P(1, 2 ** g(v, 'n')),
    options: (v, right) => textOptions(right, [P(1, 2 * g(v, 'n')), P(1, 2 ** (g(v, 'n') - 1)), P(1, 2 ** (g(v, 'n') + 1)), P(g(v, 'n'), 2 ** g(v, 'n'))]),
    why: (v, a) => `${[...Array(g(v, 'n'))].map(() => '1/2').join(' · ')} = ${a}.`,
  }),
  t({
    sub: 'u12-05',
    prompt: 'ყუთში არის {w} {c1} და {b} {c2} ბურთი. ბურთს იღებენ, უკან აბრუნებენ და მეორედ იღებენ. იპოვე ჯერ {c1}, შემდეგ კი {c2} ბურთის ამოღების ალბათობა.',
    vars: { w: I(1, 7), b: I(1, 9), ...pairVars(['თეთრი|შავი', 'წითელი|ლურჯი', 'მწვანე|ყვითელი']) },
    constraints: [{ test: (v: Vars) => g(v, 'w') !== g(v, 'b'), note: 'different counts' }],
    answer: (v) => P(g(v, 'w') * g(v, 'b'), (g(v, 'w') + g(v, 'b')) ** 2),
    options: (v) => probOptions(g(v, 'w') * g(v, 'b'), (g(v, 'w') + g(v, 'b')) ** 2, [[g(v, 'w'), g(v, 'w') + g(v, 'b')], [g(v, 'w') * g(v, 'b'), (g(v, 'w') + g(v, 'b')) * (g(v, 'w') + g(v, 'b') - 1)], [g(v, 'w') + g(v, 'b'), (g(v, 'w') + g(v, 'b')) ** 2], [g(v, 'w') ** 2, (g(v, 'w') + g(v, 'b')) ** 2]]),
    why: (v, a) => `${P(g(v, 'w'), g(v, 'w') + g(v, 'b'))} · ${P(g(v, 'b'), g(v, 'w') + g(v, 'b'))} = ${a}.`,
  }),

  // ═════════ U12.6 — გადანაცვლებები ═════════
  ...[
    ['განლაგდეს {n} განსხვავებული {o} თაროზე', ['წიგნი', 'ალბომი', 'ჟურნალი', 'სათამაშო', 'დისკი']],
    ['განლაგდეს {n} განსხვავებული {o} ერთ რიგში', ['ბარათი', 'ფოტო', 'ნახატი', 'კუბიკი', 'მედალი']],
  ].map(([frame, objs]) =>
    t({
      sub: 'u12-06',
      prompt: `რამდენი განსხვავებული თანმიმდევრობით შეიძლება ${frame as string}?`,
      vars: { n: I(3, 8), o: C(objs as string[]) },
      answer: (v) => group(fact(g(v, 'n'))),
      options: (v) => COUNT_SLIP(fact(g(v, 'n')), [g(v, 'n') ** 2, g(v, 'n') * 2, fact(g(v, 'n')) / 2, fact(g(v, 'n') - 1), 2 ** g(v, 'n')]),
      why: (v, a) => `${range(1, g(v, 'n')).reverse().join(' · ')} = ${a}.`,
    }),
  ),
  t({
    sub: 'u12-06',
    prompt: 'რამდენი განსხვავებული გზით შეიძლება {n} განსხვავებული {o} დადგეს ერთ რიგში?',
    vars: { n: I(3, 8), o: C(['მოსწავლე', 'მორბენალი', 'მოცეკვავე', 'მომღერალი']) },
    answer: (v) => group(fact(g(v, 'n'))),
    options: (v) => COUNT_SLIP(fact(g(v, 'n')), [g(v, 'n') ** 2, g(v, 'n') * 2, fact(g(v, 'n')) / 2, fact(g(v, 'n') - 1), 2 ** g(v, 'n')]),
    why: (v, a) => `${range(1, g(v, 'n')).reverse().join(' · ')} = ${a}.`,
  }),
  t({
    sub: 'u12-06',
    prompt: 'რამდენი განსხვავებული თანმიმდევრობით შეიძლება განლაგდეს ასოები {letters}?',
    vars: { n: I(3, 6), set: C(['ABCDEF', 'KLMNPQ', 'XYZUVW']), letters: D((v: Vars) => { const xs = String(v.set).slice(0, g(v, 'n')).split(''); return `${xs.slice(0, -1).join(', ')} და ${xs[xs.length - 1]}`; }) },
    answer: (v) => group(fact(g(v, 'n'))),
    options: (v) => COUNT_SLIP(fact(g(v, 'n')), [g(v, 'n') ** 2, g(v, 'n') * 2, fact(g(v, 'n')) / 2, fact(g(v, 'n') - 1), 2 ** g(v, 'n')]),
    why: (v, a) => `${range(1, g(v, 'n')).reverse().join(' · ')} = ${a}.`,
  }),
  t({
    sub: 'u12-06',
    prompt: '{nw} განსხვავებული {o} ერთ რიგში უნდა განლაგდეს. რამდენი განსხვავებული განლაგება არსებობს?',
    vars: { n: I(3, 8), nw: D((v: Vars) => WORDS[g(v, 'n')]!), o: C(['დროშა', 'ფოტო', 'ქანდაკება', 'მაკეტი']) },
    answer: (v) => group(fact(g(v, 'n'))),
    options: (v) => COUNT_SLIP(fact(g(v, 'n')), [g(v, 'n') ** 2, g(v, 'n') * 2, fact(g(v, 'n')) / 2, fact(g(v, 'n') - 1), 2 ** g(v, 'n')]),
    why: (v, a) => `${range(1, g(v, 'n')).reverse().join(' · ')} = ${a}.`,
  }),
  t({
    sub: 'u12-06',
    prompt: '{nw} განსხვავებული {nf} რამდენი განსხვავებული თანმიმდევრობით შეიძლება ყველა {ng} თაროზე განლაგება?',
    vars: { n: I(3, 8), nw: D((v: Vars) => WORDS[g(v, 'n')]!), ...nounVars() },
    answer: (v) => group(fact(g(v, 'n'))),
    options: (v) => COUNT_SLIP(fact(g(v, 'n')), [g(v, 'n') ** 2, g(v, 'n') * 2, fact(g(v, 'n')) / 2, fact(g(v, 'n') - 1), 2 ** g(v, 'n')]),
    why: (v, a) => `${range(1, g(v, 'n')).reverse().join(' · ')} = ${a}.`,
  }),

  // ═════════ U12.7 — კომბინაციები ═════════
  ...[
    { n: [5, 9], k: 0, text: '{n} {pf} უნდა შეირჩეს {k} {pn} პროექტისთვის. რამდენი განსხვავებული არჩევაა შესაძლებელი?', extra: peopleVars() },
    { n: [5, 9], k: 3, text: '{n} განსხვავებული {nf} უნდა შეირჩეს {k} {nm}. რამდენი განსხვავებული არჩევანია შესაძლებელი?', extra: nounVars() },
    { n: [4, 9], k: 2, text: '{n} {pf} უნდა შეირჩეს {k} განსხვავებული {pn}. რამდენი განსხვავებული წყვილის არჩევაა შესაძლებელი?', extra: peopleVars(['ხილიდან|ხილი', 'ბოსტნეულიდან|ბოსტნეული', 'ტკბილეულიდან|ტკბილეული', 'სასმელიდან|სასმელი']) },
    { n: [5, 10], k: 2, text: '{n} მოსწავლიდან უნდა შეირჩეს {k} {pn}. რამდენი განსხვავებული წყვილის არჩევაა შესაძლებელი, თუ რიგითობას მნიშვნელობა არ აქვს?', extra: peopleVars(['წარმომადგენელიდან|წარმომადგენელი', 'დელეგატიდან|დელეგატი', 'მოხალისიდან|მოხალისე', 'მორიგიდან|მორიგე']) },
    { n: [5, 9], k: 3, text: '{n} განსხვავებული ფერიდან უნდა შეირჩეს {k} ფერი {pf}. რამდენი განსხვავებული არჩევანია შესაძლებელი?', extra: peopleVars(['ნახატისთვის|', 'დროშისთვის|', 'პლაკატისთვის|', 'ნაქარგისთვის|']) },
    { n: [6, 10], k: 3, text: '{n} {pf} უნდა შეირჩეს {k} {pn} გუნდში. რამდენი განსხვავებული გუნდის შედგენაა შესაძლებელი?', extra: peopleVars() },
  ].map((spec) =>
    t({
      sub: 'u12-07',
      prompt: spec.text,
      vars: { n: I(spec.n[0]!, spec.n[1]!), k: spec.k ? D(() => spec.k) : C([2, 3]), ...spec.extra },
      answer: (v) => group(comb(g(v, 'n'), g(v, 'k'))),
      options: (v) => COUNT_SLIP(comb(g(v, 'n'), g(v, 'k')), [arr(g(v, 'n'), g(v, 'k')), g(v, 'n') * g(v, 'k'), g(v, 'n') ** g(v, 'k'), g(v, 'n') + g(v, 'k'), comb(g(v, 'n') + 1, g(v, 'k'))]),
      why: (v, a) => `C(${v.n}, ${v.k}) = ${arr(g(v, 'n'), g(v, 'k'))} ÷ ${fact(g(v, 'k'))} = ${a}.`,
    }),
  ),

  // ═════════ U12.8 — განლაგებები ═════════
  ...[
    { n: [4, 10], k: 2, text: '{n} {pf} უნდა შეირჩეს {role}. რამდენი განსხვავებული არჩევანია შესაძლებელი?', extra: { ...peopleVars(), rp: C(['კლასის პრეზიდენტი და ვიცე-პრეზიდენტი', 'კლუბის თავმჯდომარე და მოადგილე', 'გუნდის კაპიტანი და ვიცე-კაპიტანი']), role: D((v: Vars) => String(v.rp)) } },
    { n: [4, 9], k: 2, text: '{n} განსხვავებული {nf} უნდა შეირჩეს 2 {nm} და განლაგდეს პირველ და მეორე ადგილზე. რამდენი განსხვავებული განლაგებაა შესაძლებელი?', extra: nounVars() },
    { n: [4, 8], k: 3, text: '{n} {pf} უნდა შეირჩეს 3 {pn} და განაწილდეს პირველ, მეორე და მესამე ადგილებზე. რამდენი განსხვავებული შედეგია შესაძლებელი?', extra: peopleVars() },
    { n: [4, 10], k: 2, text: '{n} განსხვავებული {nf} უნდა შეირჩეს 2 და განლაგდეს მარცხნიდან მარჯვნივ. რამდენი განსხვავებული განლაგებაა შესაძლებელი?', extra: nounVars(['ბარათი', 'სურათი', 'კუბიკი', 'ნახატი']) },
    { n: [3, 9], k: 2, text: '{n} {pf} უნდა შეირჩეს ოქროსა და ვერცხლის მედლის მფლობელები. რამდენი განსხვავებული შედეგია შესაძლებელი?', extra: peopleVars(['მონაწილიდან|მონაწილე', 'მორბენალიდან|მორბენალი', 'მოცურავიდან|მოცურავე', 'მსროლელიდან|მსროლელი']) },
    { n: [4, 9], k: 3, text: '{n} განსხვავებული {nf} უნდა შეირჩეს 3 და განლაგდეს პირველ, მეორე და მესამე ადგილზე. რამდენი განსხვავებული განლაგებაა შესაძლებელი?', extra: nounVars() },
  ].map((spec) =>
    t({
      sub: 'u12-08',
      prompt: spec.text,
      vars: { n: I(spec.n[0]!, spec.n[1]!), ...spec.extra },
      answer: (v) => group(arr(g(v, 'n'), spec.k)),
      options: (v) => COUNT_SLIP(arr(g(v, 'n'), spec.k), [comb(g(v, 'n'), spec.k), g(v, 'n') ** spec.k, g(v, 'n') * spec.k, fact(g(v, 'n')), arr(g(v, 'n') + 1, spec.k)]),
      why: (v, a) => `${range(0, spec.k - 1).map((i) => g(v, 'n') - i).join(' · ')} = ${a}.`,
    }),
  ),
];

/** Multiples of `a` or `b` among 1…N, each counted once. */
function favMult(v: Vars): number {
  const [a, b, N] = [g(v, 'a'), g(v, 'b'), g(v, 'N')];
  return range(1, N).filter((x) => x % a === 0 || x % b === 0).length;
}
/** Balls of the two colours that are not the excluded one. */
function favTwo(v: Vars): number {
  const counts = [g(v, 'r'), g(v, 'b'), g(v, 'c')];
  return counts.filter((_, i) => i !== g(v, 'ex')).reduce((x, y) => x + y, 0);
}

