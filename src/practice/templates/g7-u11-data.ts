import type { QuestionTemplate, Vars } from './types';
import { C, D, I, N, fr, fText, gcd, q6, rawF } from './g6-helpers';
import { fmt, textOptions, unitOptions } from './g7-u08-proportion-percent';
import type { Frac } from './g6-helpers';

/**
 * Grade VII — Unit 11: data and statistics.
 *
 * Converted from the academy's Grade VII `U11` bank: 5 subtopics × 6 questions.
 *
 * Data lists are built backwards from the key (a chosen mean, a unique mode, a
 * middle pair of equal parity) so every average is a whole number. Venn tasks
 * draw the two sets as bit masks over one small universe. Answers that are
 * fractions are in lowest terms; percents carry `%`.
 */

export const G7_U11_SUBTOPICS = ['u11-01', 'u11-02', 'u11-03', 'u11-04', 'u11-05'] as const;

const T = 'g7-data';
let seq = 0;
const nextId = (): string => `g7-u11-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic' | 'grade'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, grade: 7, ...spec });

const g = (v: Vars, key: string): number => N(v, key);
const WORDS = ['', 'ერთი', 'ორი', 'სამი', 'ოთხი', 'ხუთი', 'ექვსი', 'შვიდი', 'რვა', 'ცხრა', 'ათი'];
const lst = (xs: number[]): string => xs.join(', ');
const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);
/** A deterministic shuffle: the same seed always gives the same order. */
const shuffle = (xs: number[], seed: number): number[] =>
  xs
    .map((x, i) => ({ x, i, k: ((i + 1) * (2 * seed + 3) + seed) % 13 }))
    .sort((a, b) => a.k - b.k || a.i - b.i)
    .map((e) => e.x);
const pos = (n: number): string => String(n);
/** Georgian genitive of a noun in -ი / -ა. */
const genitive = (w: string): string => (w.endsWith('ა') ? `${w.slice(0, -1)}ის` : `${w}ს`);

// ───────────────────────── list builders ─────────────────────────
/** `n` values with a whole mean `m`: the first n−1 are drawn, the last closes the sum. */
const FREE = ['p1', 'p2', 'p3', 'p4', 'p5'];
const freeVars = (lo: number, hi: number): Record<string, ReturnType<typeof I>> => Object.fromEntries(FREE.map((k) => [k, I(lo, hi)]));
const withMean = (v: Vars): number[] => {
  const n = g(v, 'n');
  const head = FREE.slice(0, n - 1).map((k) => g(v, k));
  return [...head, g(v, 'm') * n - sum(head)];
};
const meanOk = (lo: number, hi: number) => (v: Vars): boolean => {
  const xs = withMean(v);
  return xs.every((x) => x >= lo && x <= hi) && new Set(xs).size >= 3;
};
const sortedUp = (xs: number[]): number[] => [...xs].sort((a, b) => a - b);

// ───────────────────────── probability-like fractions ─────────────────────────
const slipFracs = (key: Frac, extra: Frac[]): string[] => {
  const out: Frac[] = [...extra, fr(key.d - key.n, key.d), fr(key.n + 1, key.d), fr(key.n, key.d + 1), fr(1, key.d), fr(key.n + 2, key.d), fr(key.n, key.d + 2), fr(key.d, key.n + key.d)];
  return out.filter((f) => f.n > 0 && f.d > 0 && f.n <= f.d && !(f.n === key.n && f.d === key.d)).map(fText);
};

// ───────────────────────── sets over a universe ─────────────────────────
const UNIVERSES = ['1,2,3,4,5,6,7,8,9,10', '2,4,6,8,10,12,14,16,18,20', '1,3,5,7,9,11,13,15,17,19'];
const LETTERS = ['a,b,c,d,e,f,g,h,i,j', 'k,l,m,n,p,q,r,s,u,w'];
const els = (v: Vars): string[] => String(v.u).split(',');
const pick = (v: Vars, k: string): string[] => els(v).filter((_, i) => ((g(v, k) >> i) & 1) === 1);
const inter = (a: string[], b: string[]): string[] => a.filter((x) => b.includes(x));
const diff = (a: string[], b: string[]): string[] => a.filter((x) => !b.includes(x));
const order = (v: Vars, xs: string[]): string[] => els(v).filter((e) => xs.includes(e));
const setText = (xs: string[]): string => (xs.length === 0 ? '∅' : `{${xs.join(', ')}}`);
const setVars = (universe: string[]) => ({
  u: C(universe),
  ma: I(1, 1023),
  mb: I(1, 1023),
  A: D((v: Vars) => setText(pick(v, 'ma'))),
  B: D((v: Vars) => setText(pick(v, 'mb'))),
});
const SET_RULES = [
  {
    test: (v: Vars) => {
      const [a, b] = [pick(v, 'ma'), pick(v, 'mb')];
      return a.length >= 3 && a.length <= 6 && b.length >= 3 && b.length <= 6 && inter(a, b).length >= 1 && diff(b, a).length >= 1 && diff(a, b).length >= 1;
    },
    note: 'two overlapping sets of 3–6 elements',
  },
];

// ───────────────────────── Venn word problems ─────────────────────────
/** `onlyA, onlyB, both, neither` → the figures a task prints. */
const vennVars = () => ({
  oa: I(2, 12),
  ob: I(2, 10),
  both: I(2, 8),
  no: I(0, 6),
  a: D((v: Vars) => g(v, 'oa') + g(v, 'both')),
  b: D((v: Vars) => g(v, 'ob') + g(v, 'both')),
  T: D((v: Vars) => g(v, 'oa') + g(v, 'ob') + g(v, 'both') + g(v, 'no')),
});

const METHODS = ['გამოკითხვა', 'დაკვირვება', 'ექსპერიმენტი', 'არსებული ჩანაწერების გამოყენება'];
const methodOptions = (key: string, pool: string[] = METHODS): string[] => textOptions(key, pool);

const SURVEY_TOPICS = [
  'რომელი სასკოლო კლუბია ყველაზე პოპულარული',
  'რომელი საგანია მოსწავლეების საყვარელი',
  'რომელი კერძი უყვართ მოსწავლეებს სკოლის კაფეში',
  'რით მიდიან მოსწავლეები სკოლაში',
  'რომელი სპორტი უყვართ ყველაზე მეტად მოსწავლეებს',
  'რომელი წიგნის წაკითხვა სურთ მოსწავლეებს',
  'რომელი ექსკურსია უფრო მოსწონთ მოსწავლეებს',
  'რომელი მუსიკალური ჟანრია ყველაზე პოპულარული',
];
const OBSERVE = [
  { period: 'ერთი კვირის', what: 'ტემპერატურას' },
  { period: 'ორი კვირის', what: 'ჰაერის ტემპერატურას' },
  { period: 'ერთი თვის', what: 'ნალექის რაოდენობას' },
  { period: 'ათი დღის', what: 'ქარის სიძლიერეს' },
  { period: 'ერთი კვირის', what: 'ბაღში მოსულ ჩიტებს' },
  { period: 'სამი კვირის', what: 'ამინდს' },
];
const POLL = [
  'რამდენი მოსწავლე დადის სკოლაში ფეხით',
  'რამდენ მოსწავლეს აქვს შინაური ცხოველი',
  'რამდენი მოსწავლე ირჩევს ჭამისას ხილს',
  'რამდენი მოსწავლე დადის წრეზე',
  'რამდენი მოსწავლე კითხულობს ყოველდღე',
];
const EXPERIMENTS = [
  'მკვლევარი სწავლობს, მოქმედებს თუ არა სინათლის რაოდენობა მცენარის ზრდაზე. ის ორ ერთნაირ მცენარეს სხვადასხვა განათების პირობებში ზრდის.',
  'მკვლევარი სწავლობს, მოქმედებს თუ არა მორწყვის სიხშირე თესლის აღმოცენებაზე. ის ერთნაირ თესლს სხვადასხვა რაოდენობის წყალს აძლევს.',
  'მკვლევარი სწავლობს, მოქმედებს თუ არა ტემპერატურა ყინულის დნობის სიჩქარეზე. ის ერთნაირ ყინულის ნაჭრებს სხვადასხვა ტემპერატურაზე ათავსებს.',
  'მკვლევარი სწავლობს, ახდენს თუ არა სასუქი გავლენას პომიდვრის მოსავალზე. ის ორ ერთნაირ ბუჩქს სხვადასხვა პირობებში ზრდის.',
  'მკვლევარი სწავლობს, ცვლის თუ არა შაქრის რაოდენობა წყალში გახსნის დროს. ის ერთნაირ ჭიქებს სხვადასხვა რაოდენობის შაქარს უმატებს.',
];
const DIRECT = [
  { goal: 'რომელი წიგნები გაიცა ყველაზე ხშირად გასულ თვეში', right: 'ბიბლიოთეკის გაცემის ჩანაწერები', w1: 'მოსწავლეების სიმაღლე', w2: 'ამინდის პროგნოზი', who: 'სკოლის ბიბლიოთეკარს' },
  { goal: 'რამდენი პორცია გაიყიდა კაფეში გასულ კვირას', right: 'კაფეს გაყიდვების ჩანაწერები', w1: 'მოსწავლეების წონა', w2: 'ავტობუსების განრიგი', who: 'სკოლის კაფეს მეპატრონეს' },
  { goal: 'რომელ დღეებში დაიგვიანეს ყველაზე მეტმა მოსწავლემ', right: 'სკოლის დასწრების ჟურნალი', w1: 'ბიბლიოთეკის გაცემის ჩანაწერები', w2: 'სპორტული შეჯიბრის შედეგები', who: 'კლასის ხელმძღვანელს' },
  { goal: 'რამდენი კილოვატსაათი დახარჯა სკოლამ გასულ თვეში', right: 'ელექტროენერგიის მრიცხველის ჩანაწერები', w1: 'მოსწავლეების ქულები', w2: 'სახელმძღვანელოების რაოდენობა', who: 'სკოლის ადმინისტრაციას' },
  { goal: 'რამდენმა მაყურებელმა ნახა სპექტაკლი', right: 'გაყიდული ბილეთების ჩანაწერები', w1: 'სცენის სიგრძე', w2: 'ამინდის პროგნოზი', who: 'თეატრის ადმინისტრატორს' },
];
const SPORTS = ['ფეხბურთი|კალათბურთი', 'ჩოგბურთი|ცურვა', 'ფრენბურთი|კალათბურთი', 'ცურვა|ფეხბურთი', 'ჭადრაკი|ჩოგბურთი'];
const LANGS = ['ფრანგული|გერმანული', 'ინგლისური|ესპანური', 'იტალიური|გერმანული', 'ფრანგული|ესპანური'];
const SUBJECTS = ['მათემატიკა|მეცნიერება', 'ისტორია|გეოგრაფია', 'ხატვა|მუსიკა', 'ფიზიკა|ქიმია'];
const FRUITS = ['ვაშლი', 'ბანანი', 'ფორთოხალი', 'მსხალი', 'ყურძენი', 'ატამი'];
const COLORS = ['წითელი', 'ლურჯი', 'მწვანე', 'ყვითელი'];
const side = (pairs: string[]) => ({
  sp: C(pairs),
  s1: D((v: Vars) => String(v.sp).split('|')[0]!),
  s2: D((v: Vars) => String(v.sp).split('|')[1]!),
});

export const G7_U11_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U11.1 — რიცხვითი მახასიათებლები ═════════
  t({
    sub: 'u11-01',
    prompt: 'მოცემულია რიცხვები: {list}. იპოვე ამ მონაცემების არითმეტიკული საშუალო.',
    vars: { ...freeVars(2, 20), n: C([4, 5, 5, 6]), m: I(6, 14), list: D((v: Vars) => lst(sortedUp(withMean(v)))) },
    constraints: [{ test: meanOk(1, 25), note: 'closing value in range, a real spread' }],
    answer: (v) => pos(g(v, 'm')),
    options: (v) => {
      const xs = sortedUp(withMean(v));
      const mid = xs[Math.floor(xs.length / 2)]!;
      return unitOptions(g(v, 'm'), '', [sum(xs), mid, Math.max(...xs) - Math.min(...xs), g(v, 'm') + 1, g(v, 'm') - 1]);
    },
    why: (v, a) => `ჯამი ${sum(withMean(v))}, რიცხვების რაოდენობა ${v.n}; ${sum(withMean(v))} ÷ ${v.n} = ${a}.`,
  }),
  t({
    sub: 'u11-01',
    prompt: 'მოცემულია მონაცემები: {list}. იპოვე მონაცემების მედიანა.',
    vars: { a: I(1, 8), d1: I(1, 4), d2: I(1, 4), d3: I(1, 4), d4: I(1, 4), d5: I(1, 4), d6: I(1, 4), n: C([5, 7]), list: D((v: Vars) => lst(ladder(v).slice(0, g(v, 'n')))) },
    answer: (v) => pos(ladder(v)[(g(v, 'n') - 1) / 2]!),
    options: (v) => {
      const xs = ladder(v).slice(0, g(v, 'n'));
      const mid = (g(v, 'n') - 1) / 2;
      return unitOptions(xs[mid]!, '', [xs[mid - 1]!, xs[mid + 1]!, Math.round(sum(xs) / xs.length), xs[xs.length - 1]!]);
    },
    why: (v, a) => `${v.n} რიცხვიდან მედიანაა ${(g(v, 'n') + 1) / 2}-ე რიცხვი ზრდადობით დალაგებულ სიაში: ${a}.`,
  }),
  t({
    sub: 'u11-01',
    prompt: 'მოცემულია რიცხვები: {list}. იპოვე ამ მონაცემების მოდა.',
    vars: { m: I(1, 15), o1: I(1, 15), o2: I(1, 15), o3: I(1, 15), o4: I(1, 15), sh: I(0, 5), list: D((v: Vars) => lst(shuffle([g(v, 'm'), g(v, 'm'), g(v, 'm'), g(v, 'o1'), g(v, 'o2'), g(v, 'o3'), g(v, 'o4')], g(v, 'sh')))) },
    constraints: [{ test: (v: Vars) => new Set([g(v, 'm'), g(v, 'o1'), g(v, 'o2'), g(v, 'o3'), g(v, 'o4')]).size === 5, note: 'the mode is unique' }],
    answer: (v) => pos(g(v, 'm')),
    options: (v) => unitOptions(g(v, 'm'), '', [g(v, 'o1'), g(v, 'o2'), g(v, 'o3'), g(v, 'o4'), Math.max(g(v, 'o1'), g(v, 'o2'), g(v, 'o3'), g(v, 'o4'))]),
    why: (_v, a) => `${a} ჩანს სამჯერ, დანარჩენი რიცხვები — ერთხელ; მოდაა ${a}.`,
  }),
  t({
    sub: 'u11-01',
    prompt: 'მოცემულია მონაცემები: {list}. იპოვე მონაცემების დიაპაზონი.',
    vars: { lo: I(2, 12), w: I(8, 30), i1: I(1, 7), i2: I(1, 7), i3: I(1, 7), i4: I(1, 7), sh: I(0, 5), list: D((v: Vars) => lst(shuffle(rng(v), g(v, 'sh')))) },
    answer: (v) => pos(g(v, 'w')),
    options: (v) => unitOptions(g(v, 'w'), '', [g(v, 'lo') + g(v, 'w'), g(v, 'lo'), 2 * g(v, 'lo') + g(v, 'w'), Math.round(sum(rng(v)) / 6)]),
    why: (v, a) => `უდიდესი ${g(v, 'lo') + g(v, 'w')}, უმცირესი ${v.lo}; ${g(v, 'lo') + g(v, 'w')} ${MINUSSIGN} ${v.lo} = ${a}.`,
  }),
  t({
    sub: 'u11-01',
    prompt: '{nw} მოსწავლის ქულებია: {list}. იპოვე ქულების არითმეტიკული საშუალო.',
    vars: { ...freeVars(4, 10), n: C([4, 5, 6]), m: I(6, 9), nw: D((v: Vars) => WORDS[g(v, 'n')]!), list: D((v: Vars) => lst(withMean(v))) },
    constraints: [{ test: meanOk(3, 10), note: 'scores between 3 and 10' }],
    answer: (v) => pos(g(v, 'm')),
    options: (v) => {
      const xs = withMean(v);
      return unitOptions(g(v, 'm'), '', [sum(xs), Math.max(...xs), Math.min(...xs), g(v, 'm') + 1, g(v, 'm') - 1]);
    },
    why: (v, a) => `ქულების ჯამი ${sum(withMean(v))}; ${sum(withMean(v))} ÷ ${v.n} = ${a}.`,
  }),
  t({
    sub: 'u11-01',
    prompt: 'მოცემულია მონაცემები: {list}. დაალაგე ისინი ზრდადობით და იპოვე მედიანა.',
    vars: { a: I(1, 10), d1: I(1, 4), d2: I(1, 4), d3: I(1, 4), d4: I(1, 4), d5: I(1, 4), d6: I(1, 4), sh: I(0, 5), list: D((v: Vars) => lst(shuffle(ladder(v).slice(0, 6), g(v, 'sh')))) },
    constraints: [{ test: (v: Vars) => (ladder(v)[2]! + ladder(v)[3]!) % 2 === 0, note: 'the middle pair has a whole mean' }],
    answer: (v) => pos((ladder(v)[2]! + ladder(v)[3]!) / 2),
    options: (v) => {
      const xs = ladder(v);
      return unitOptions((xs[2]! + xs[3]!) / 2, '', [xs[2]!, xs[3]!, Math.round(sum(xs.slice(0, 6)) / 6), (xs[1]! + xs[4]!) / 2]);
    },
    why: (v, a) => `დალაგებულია: ${lst(ladder(v).slice(0, 6))}. შუა ორი რიცხვია ${ladder(v)[2]} და ${ladder(v)[3]}; მათი საშუალოა ${a}.`,
  }),

  // ═════════ U11.2 — არითმეტიკული და გეომეტრიული საშუალო ═════════
  t({
    sub: 'u11-02',
    prompt: 'იპოვე {a}-ისა და {b}-ის არითმეტიკული საშუალო.',
    vars: { a: I(2, 30), k: I(1, 12), b: D((v: Vars) => g(v, 'a') + 2 * g(v, 'k')) },
    answer: (v) => pos(g(v, 'a') + g(v, 'k')),
    options: (v) => unitOptions(g(v, 'a') + g(v, 'k'), '', [g(v, 'a') + g(v, 'b'), g(v, 'b') - g(v, 'a'), g(v, 'k'), g(v, 'b')]),
    why: (v, a) => `(${v.a} + ${v.b}) ÷ 2 = ${a}.`,
  }),
  t({
    sub: 'u11-02',
    prompt: 'იპოვე {a}-ისა და {b}-ის დადებითი გეომეტრიული საშუალო.',
    vars: { m: C([1, 2, 3]), p: I(1, 3), q: I(2, 6), a: D((v: Vars) => g(v, 'm') * g(v, 'p') ** 2), b: D((v: Vars) => g(v, 'm') * g(v, 'q') ** 2) },
    constraints: [{ test: (v: Vars) => g(v, 'p') < g(v, 'q'), note: 'a < b' }],
    answer: (v) => pos(g(v, 'm') * g(v, 'p') * g(v, 'q')),
    options: (v) => unitOptions(g(v, 'm') * g(v, 'p') * g(v, 'q'), '', [(g(v, 'a') + g(v, 'b')) / 2, g(v, 'b') - g(v, 'a'), g(v, 'a') * g(v, 'b'), g(v, 'b') / 2]),
    why: (v, a) => `√(${v.a} · ${v.b}) = √${g(v, 'a') * g(v, 'b')} = ${a}.`,
  }),
  t({
    sub: 'u11-02',
    prompt: 'სამი რიცხვია {a}, {b} და {c}. იპოვე მათი არითმეტიკული საშუალო.',
    vars: { m: I(7, 20), x: I(1, 6), y: I(1, 6), a: D((v: Vars) => g(v, 'm') - g(v, 'x')), b: D((v: Vars) => g(v, 'm') + g(v, 'x') - g(v, 'y')), c: D((v: Vars) => g(v, 'm') + g(v, 'y')) },
    constraints: [{ test: (v: Vars) => g(v, 'x') !== g(v, 'y') && g(v, 'x') !== 0 && g(v, 'm') + g(v, 'x') - g(v, 'y') !== g(v, 'm'), note: 'the numbers are different' }],
    answer: (v) => pos(g(v, 'm')),
    options: (v) => unitOptions(g(v, 'm'), '', [g(v, 'a') + g(v, 'b') + g(v, 'c'), g(v, 'b'), g(v, 'c'), g(v, 'm') + 1, g(v, 'm') - 1]),
    why: (v, a) => `(${v.a} + ${v.b} + ${v.c}) ÷ 3 = ${g(v, 'a') + g(v, 'b') + g(v, 'c')} ÷ 3 = ${a}.`,
  }),
  t({
    sub: 'u11-02',
    prompt: 'იპოვე {a}-ისა და {b}-ის დადებითი გეომეტრიული საშუალო.',
    vars: { p: I(2, 7), q: I(3, 12), a: D((v: Vars) => g(v, 'p') ** 2), b: D((v: Vars) => g(v, 'q') ** 2) },
    constraints: [{ test: (v: Vars) => g(v, 'p') < g(v, 'q'), note: 'a < b' }],
    answer: (v) => pos(g(v, 'p') * g(v, 'q')),
    options: (v) => unitOptions(g(v, 'p') * g(v, 'q'), '', [(g(v, 'a') + g(v, 'b')) / 2, g(v, 'p') + g(v, 'q'), g(v, 'b') - g(v, 'a'), g(v, 'p') * g(v, 'q') + g(v, 'p')]),
    why: (v, a) => `√(${v.a} · ${v.b}) = ${v.p} · ${v.q} = ${a}.`,
  }),
  t({
    sub: 'u11-02',
    prompt: '{nw} დღის განმავლობაში მოსწავლემ წაიკითხა {list} გვერდი. საშუალოდ რამდენ გვერდს კითხულობდა ის დღეში?',
    vars: { ...freeVars(8, 30), n: C([3, 4, 5]), m: I(10, 24), nw: D((v: Vars) => WORDS[g(v, 'n')]!), list: D((v: Vars) => withListAnd(sortedUp(withMean(v)))) },
    constraints: [{ test: meanOk(5, 40), note: 'daily pages in range' }],
    answer: (v) => fmt(g(v, 'm'), 'გვერდი'),
    options: (v) => unitOptions(g(v, 'm'), 'გვერდი', [sum(withMean(v)), Math.max(...withMean(v)), Math.min(...withMean(v)), g(v, 'm') + 1, g(v, 'm') - 1]),
    why: (v, a) => `სულ ${sum(withMean(v))} გვერდი ${v.n} დღეში: ${sum(withMean(v))} ÷ ${v.n} = ${a}.`,
  }),
  t({
    sub: 'u11-02',
    prompt: 'ორი დადებითი რიცხვის გეომეტრიული საშუალოა {gm}. ერთ-ერთი რიცხვია {a}. იპოვე მეორე რიცხვი.',
    vars: { gm: I(3, 15), a: I(2, 30) },
    constraints: [{ test: (v: Vars) => (g(v, 'gm') ** 2) % g(v, 'a') === 0 && g(v, 'a') !== g(v, 'gm') && g(v, 'gm') ** 2 / g(v, 'a') <= 60, note: 'the other number is whole' }],
    answer: (v) => pos(g(v, 'gm') ** 2 / g(v, 'a')),
    options: (v) => unitOptions(g(v, 'gm') ** 2 / g(v, 'a'), '', [2 * g(v, 'gm') - g(v, 'a'), g(v, 'gm') * g(v, 'a'), g(v, 'gm'), g(v, 'gm') + g(v, 'a')]),
    why: (v, a) => `${v.a} · x = ${v.gm}² = ${g(v, 'gm') ** 2}, ამიტომ x = ${g(v, 'gm') ** 2} ÷ ${v.a} = ${a}.`,
  }),

  // ═════════ U11.3 — მონაცემების შეგროვების მეთოდები ═════════
  t({
    sub: 'u11-03',
    prompt: '{who} სურს გაიგოს, {topic}. რომელი მეთოდია უფრო შესაფერისი: გამოკითხვა, ექსპერიმენტი თუ მხოლოდ ამინდის დაკვირვება?',
    vars: { topic: C(SURVEY_TOPICS), wh: C(['სკოლის დირექტორს', 'კლასის ხელმძღვანელს', 'მოსწავლეთა მთავრობის თავმჯდომარეს']), who: D((v: Vars) => String(v.wh)) },
    answer: () => 'გამოკითხვა',
    options: (_v, right) => textOptions(right, ['ექსპერიმენტი', 'მხოლოდ ამინდის დაკვირვება']),
    optionCount: 3,
    why: (_v, a) => `მოსწავლეების არჩევანის გასაგებად ყველაზე პირდაპირი გზა მათი შეკითხვაა: ${a}.`,
  }),
  t({
    sub: 'u11-03',
    prompt: 'მკვლევარი {period} განმავლობაში ყოველდღე {verb} {what}. მონაცემების შეგროვების რომელი მეთოდია ეს?',
    vars: { k: I(0, OBSERVE.length - 1), vb: C(['აღრიცხავს', 'ინიშნავს', 'ზომავს და წერს']), verb: D((v: Vars) => String(v.vb)), period: D((v: Vars) => OBSERVE[g(v, 'k')]!.period), what: D((v: Vars) => OBSERVE[g(v, 'k')]!.what) },
    answer: () => 'დაკვირვება',
    options: (_v, right) => methodOptions(right),
    why: (_v, a) => `მკვლევარი არაფერს ცვლის და მხოლოდ აღრიცხავს იმას, რაც ხდება — ეს ${a}ა.`,
  }),
  t({
    sub: 'u11-03',
    prompt: 'მასწავლებელს სურს გაიგოს, {q}. {how}. მონაცემები რომელი მეთოდით შეგროვდა?',
    vars: { q: C(POLL), hw: C(['მან თითოეულ მოსწავლეს ერთი შეკითხვა დაუსვა', 'მან მოსწავლეებს ანკეტა დაურიგა', 'მან თითოეულ მოსწავლეს ზეპირად ჰკითხა', 'მან მოსწავლეებს ხელის აწევით ჩაატარა კენჭისყრა']), how: D((v: Vars) => String(v.hw)) },
    answer: () => 'გამოკითხვა',
    options: (_v, right) => methodOptions(right),
    why: (_v, a) => `მონაცემები მიიღეს შეკითხვის დასმით — ეს ${a}ა.`,
  }),
  t({
    sub: 'u11-03',
    prompt: '{text} {closing}',
    vars: { text: C(EXPERIMENTS), cl: C([0, 1, 2]), closing: D((v: Vars) => ['მონაცემების შეგროვების რომელი მეთოდი გამოიყენება?', 'რომელი მეთოდით აგროვებს ის მონაცემებს?', 'მონაცემების შეგროვების რომელი მეთოდია ეს?'][g(v, 'cl')]!) },
    answer: () => 'ექსპერიმენტი',
    options: (_v, right) => methodOptions(right),
    why: (_v, a) => `მკვლევარი თავად ქმნის განსხვავებულ პირობებს და ადარებს შედეგებს — ეს ${a}ია.`,
  }),
  t({
    sub: 'u11-03',
    prompt: '{who} სურს გაიგოს, {goal}. რომელი წყაროა ყველაზე პირდაპირი: {o1}, {o2} თუ {o3}?',
    vars: {
      k: I(0, DIRECT.length - 1),
      sh: I(0, 2),
      who: D((v: Vars) => DIRECT[g(v, 'k')]!.who),
      goal: D((v: Vars) => DIRECT[g(v, 'k')]!.goal),
      o1: D((v: Vars) => triple(v)[0]!),
      o2: D((v: Vars) => triple(v)[1]!),
      o3: D((v: Vars) => triple(v)[2]!),
    },
    answer: (v) => DIRECT[g(v, 'k')]!.right,
    options: (v, right) => textOptions(right, [DIRECT[g(v, 'k')]!.w1, DIRECT[g(v, 'k')]!.w2]),
    optionCount: 3,
    why: (_v, a) => `ამ კითხვას პირდაპირ პასუხობს ${a}; დანარჩენ წყაროებს მასთან კავშირი არ აქვს.`,
  }),
  t({
    sub: 'u11-03',
    prompt: 'კლასში {N} მოსწავლეა. დირექტორს სურს გაიგოს ყველა მოსწავლის საყვარელი {thing}. რომელია უფრო სრულყოფილი მეთოდი: მხოლოდ {k} მოსწავლის გამოკითხვა თუ {N}-ვე მოსწავლის გამოკითხვა?',
    vars: { N: C([24, 25, 28, 30, 32]), k: I(2, 5), thing: C(['სპორტი', 'საგანი', 'ფერი', 'წიგნი']) },
    answer: (v) => `${v.N}-ვე მოსწავლის გამოკითხვა`,
    options: (v, right) => textOptions(right, [`მხოლოდ ${v.k} მოსწავლის გამოკითხვა`]),
    optionCount: 2,
    why: (_v, a) => `ყველა მოსწავლის პასუხი სრულ სურათს იძლევა, ამიტომ უფრო სრულყოფილია: ${a}.`,
  }),

  // ═════════ U11.4 — ვენის დიაგრამები ═════════
  t({
    sub: 'u11-04',
    prompt: 'კლასში {T} მოსწავლეა. {a} მოსწავლეს უყვარს {s1}, {b}-ს — {s2}, ხოლო {both}-ს — ორივე სპორტი. რამდენ მოსწავლეს უყვარს მხოლოდ {s}?',
    vars: { ...vennVars(), ...side(SPORTS), ask: C([0, 1]), s: D((v: Vars) => (g(v, 'ask') ? String(v.s2) : String(v.s1))) },
    answer: (v) => pos(g(v, 'ask') ? g(v, 'ob') : g(v, 'oa')),
    options: (v) => {
      const key = g(v, 'ask') ? g(v, 'ob') : g(v, 'oa');
      return unitOptions(key, '', [g(v, 'ask') ? g(v, 'b') : g(v, 'a'), key + g(v, 'both'), g(v, 'both'), g(v, 'T') - key]);
    },
    why: (v, a) => `მხოლოდ ${v.s}: ${g(v, 'ask') ? v.b : v.a} ${MINUSSIGN} ${v.both} = ${a}.`,
  }),
  t({
    sub: 'u11-04',
    prompt: 'მოცემულია სიმრავლეები: A = {A} და B = {B}. რამდენი ელემენტია A ∩ B-ში?',
    vars: setVars(UNIVERSES),
    constraints: SET_RULES,
    answer: (v) => pos(inter(pick(v, 'ma'), pick(v, 'mb')).length),
    options: (v) => unitOptions(inter(pick(v, 'ma'), pick(v, 'mb')).length, '', [order(v, [...pick(v, 'ma'), ...pick(v, 'mb')]).length, diff(pick(v, 'mb'), pick(v, 'ma')).length, diff(pick(v, 'ma'), pick(v, 'mb')).length]),
    why: (v, a) => `საერთო ელემენტებია ${setText(inter(pick(v, 'ma'), pick(v, 'mb')))}; მათი რაოდენობაა ${a}.`,
  }),
  t({
    sub: 'u11-04',
    prompt: 'კლასში {T} მოსწავლეა. {a} მოსწავლე სწავლობს {s1}ს, {b} — {s2}ს, ხოლო {both} — ორივე ენას. რამდენი მოსწავლე სწავლობს სულ მცირე ერთ-ერთ ამ ენას?',
    vars: { ...vennVars(), ...langVars() },
    answer: (v) => pos(g(v, 'a') + g(v, 'b') - g(v, 'both')),
    options: (v) => unitOptions(g(v, 'a') + g(v, 'b') - g(v, 'both'), '', [g(v, 'a') + g(v, 'b'), g(v, 'T'), g(v, 'a') + g(v, 'b') + g(v, 'both'), g(v, 'oa') + g(v, 'ob')]),
    why: (v, a) => `${v.a} + ${v.b} ${MINUSSIGN} ${v.both} = ${a}.`,
  }),
  t({
    sub: 'u11-04',
    prompt: 'მოცემულია A = {A} და B = {B}. ჩამოწერე A ∪ B-ის ყველა ელემენტი.',
    vars: setVars(UNIVERSES),
    constraints: SET_RULES,
    answer: (v) => setText(order(v, [...pick(v, 'ma'), ...pick(v, 'mb')])),
    options: (v, right) => {
      const [a, b] = [pick(v, 'ma'), pick(v, 'mb')];
      const un = order(v, [...a, ...b]);
      return textOptions(right, [setText(inter(a, b)), setText(order(v, [...diff(a, b), ...diff(b, a)])), setText(un.slice(0, -1)), setText(order(v, [...a, ...b]).slice(1))]);
    },
    why: (_v, a) => `გაერთიანებაში ყველა ელემენტი ერთხელ ეწერება: ${a}.`,
  }),
  t({
    sub: 'u11-04',
    prompt: '{T} მოსწავლიდან {a}-ს უყვარს {s1}, {b}-ს — {s2}, ხოლო {both}-ს — ორივე საგანი. რამდენ მოსწავლეს არ უყვარს არც {s1} და არც {s2}?',
    vars: { ...vennVars(), ...subjectVars() },
    answer: (v) => pos(g(v, 'no')),
    options: (v) => unitOptions(g(v, 'no'), '', [g(v, 'T') - g(v, 'a') - g(v, 'b'), g(v, 'a') + g(v, 'b') - g(v, 'both'), g(v, 'T') - g(v, 'a'), g(v, 'no') + 1]),
    why: (v, a) => `ერთ მაინც უყვარს ${g(v, 'a') + g(v, 'b') - g(v, 'both')}; ${v.T} ${MINUSSIGN} ${g(v, 'a') + g(v, 'b') - g(v, 'both')} = ${a}.`,
  }),
  t({
    sub: 'u11-04',
    prompt: 'მოცემულია A = {A} და B = {B}. რამდენი ელემენტია მხოლოდ B-ში?',
    vars: setVars(LETTERS),
    constraints: SET_RULES,
    answer: (v) => pos(diff(pick(v, 'mb'), pick(v, 'ma')).length),
    options: (v) => unitOptions(diff(pick(v, 'mb'), pick(v, 'ma')).length, '', [pick(v, 'mb').length, inter(pick(v, 'ma'), pick(v, 'mb')).length, diff(pick(v, 'ma'), pick(v, 'mb')).length]),
    why: (v, a) => `მხოლოდ B-ში: ${setText(diff(pick(v, 'mb'), pick(v, 'ma')))}; ელემენტების რაოდენობაა ${a}.`,
  }),

  // ═════════ U11.5 — სიხშირე და ფარდობითი სიხშირე ═════════
  t({
    sub: 'u11-05',
    prompt: '{nw} მოსწავლის საყვარელი ფერებია: {list}. რამდენჯერ გვხვდება {color} ფერი?',
    vars: {
      c0: I(1, 4),
      c1: I(1, 4),
      c2: I(1, 4),
      c3: I(0, 3),
      sh: I(0, 5),
      ask: I(0, 2),
      n: D((v: Vars) => g(v, 'c0') + g(v, 'c1') + g(v, 'c2') + g(v, 'c3')),
      nw: D((v: Vars) => (g(v, 'n') <= 10 ? WORDS[g(v, 'n')]! : String(g(v, 'n')))),
      color: D((v: Vars) => COLORS[g(v, 'ask')]!),
      list: D((v: Vars) => colorList(v)),
    },
    constraints: [{ test: (v: Vars) => g(v, 'n') >= 4 && g(v, 'n') <= 10, note: 'a short list' }],
    answer: (v) => pos(g(v, `c${g(v, 'ask')}`)),
    options: (v) => unitOptions(g(v, `c${g(v, 'ask')}`), '', [g(v, 'n'), g(v, `c${(g(v, 'ask') + 1) % 3}`), g(v, `c${(g(v, 'ask') + 2) % 3}`), g(v, 'n') - g(v, `c${g(v, 'ask')}`)]),
    why: (v, a) => `${v.color} ფერი ჩამონათვალში ${a}-ჯერ გვხვდება.`,
  }),
  t({
    sub: 'u11-05',
    prompt: 'კამათელი {n}-ჯერ გააგორეს და რიცხვი {f} ამოვიდა {k}-ჯერ. იპოვე {f}-ის ამოსვლის ფარდობითი სიხშირე წილადის სახით.',
    vars: { n: C([20, 30, 40, 50, 60, 100]), k: I(2, 24), f: I(1, 6) },
    constraints: [{ test: (v: Vars) => g(v, 'k') < g(v, 'n') && gcd(g(v, 'k'), g(v, 'n')) > 1 && fr(g(v, 'k'), g(v, 'n')).d > 1, note: 'a fraction to reduce' }],
    answer: (v) => fText(fr(g(v, 'k'), g(v, 'n'))),
    options: (v, right) => textOptions(right, [...slipFracs(fr(g(v, 'k'), g(v, 'n')), [fr(g(v, 'n') - g(v, 'k'), g(v, 'n')), fr(g(v, 'k'), g(v, 'n') - g(v, 'k'))])]),
    why: (v, a) => `${v.k}/${v.n} = ${a}.`,
  }),
  t({
    sub: 'u11-05',
    prompt: 'გამოკითხვაში {n} მოსწავლე მონაწილეობდა. {k}-მა აირჩია {sport}. რამდენია {spg} არჩევის ფარდობითი სიხშირე პროცენტებში?',
    vars: { n: C([20, 25, 40, 50, 100, 200]), k: I(2, 80), sport: C(['ფეხბურთი', 'ცურვა', 'კალათბურთი', 'ჭადრაკი']), spg: D((v: Vars) => genitive(String(v.sport))) },
    constraints: [{ test: (v: Vars) => g(v, 'k') < g(v, 'n') && (100 * g(v, 'k')) % g(v, 'n') === 0, note: 'a whole percent' }],
    answer: (v) => fmt((100 * g(v, 'k')) / g(v, 'n'), '%'),
    options: (v) => unitOptions((100 * g(v, 'k')) / g(v, 'n'), '%', [g(v, 'k'), g(v, 'n') - g(v, 'k'), 100 - (100 * g(v, 'k')) / g(v, 'n'), (g(v, 'k') * g(v, 'n')) / 100]),
    why: (v, a) => `${v.k} ÷ ${v.n} · 100% = ${a}.`,
  }),
  t({
    sub: 'u11-05',
    prompt: 'ცხრილში მოცემულია საყვარელი ხილის რაოდენობები: {rows}. რამდენმა ადამიანმა მიიღო მონაწილეობა გამოკითხვაში?',
    vars: { r: I(0, 5), c1: I(2, 12), c2: I(2, 10), c3: I(2, 8), c4: I(1, 6), rows: D((v: Vars) => [1, 2, 3, 4].map((i) => `${FRUITS[(g(v, 'r') + i - 1) % 6]} — ${g(v, `c${i}`)}`).join(', ')) },
    answer: (v) => pos(g(v, 'c1') + g(v, 'c2') + g(v, 'c3') + g(v, 'c4')),
    options: (v) => {
      const total = g(v, 'c1') + g(v, 'c2') + g(v, 'c3') + g(v, 'c4');
      return unitOptions(total, '', [Math.max(g(v, 'c1'), g(v, 'c2'), g(v, 'c3'), g(v, 'c4')), total - g(v, 'c4'), total + 1, 4]);
    },
    why: (v, a) => `სიხშირეები ჯამდება: ${v.c1} + ${v.c2} + ${v.c3} + ${v.c4} = ${a}.`,
  }),
  t({
    sub: 'u11-05',
    prompt: 'მონეტა {n}-ჯერ ააგდეს და {side} {k}-ჯერ მოვიდა. იპოვე {side2} მოსვლის ფარდობითი სიხშირე პროცენტებში.',
    vars: { n: C([20, 25, 40, 50, 100]), k: I(3, 90), sd: C([0, 1]), side: D((v: Vars) => (g(v, 'sd') ? 'გერბი' : 'საფასური')), side2: D((v: Vars) => (g(v, 'sd') ? 'გერბის' : 'საფასურის')) },
    constraints: [{ test: (v: Vars) => g(v, 'k') < g(v, 'n') && (100 * g(v, 'k')) % g(v, 'n') === 0 && g(v, 'k') * 2 !== g(v, 'n'), note: 'a whole percent, not one half' }],
    answer: (v) => fmt((100 * g(v, 'k')) / g(v, 'n'), '%'),
    options: (v) => unitOptions((100 * g(v, 'k')) / g(v, 'n'), '%', [g(v, 'k'), g(v, 'n') - g(v, 'k'), 100 - (100 * g(v, 'k')) / g(v, 'n'), 50]),
    why: (v, a) => `${v.k} ÷ ${v.n} · 100% = ${a}.`,
  }),
  t({
    sub: 'u11-05',
    prompt: 'კლასში {n} მოსწავლეა. {k} მოსწავლემ აირჩია {sport} საყვარელ სპორტად. იპოვე {spg} არჩევის ფარდობითი სიხშირე წილადის სახით და გაამარტივე.',
    vars: { n: I(12, 40), k: I(2, 20), sport: C(['ცურვა', 'ფეხბურთი', 'ჩოგბურთი', 'კალათბურთი']), spg: D((v: Vars) => genitive(String(v.sport))) },
    constraints: [{ test: (v: Vars) => g(v, 'k') < g(v, 'n') && gcd(g(v, 'k'), g(v, 'n')) > 1 && fr(g(v, 'k'), g(v, 'n')).d > 1 && fr(g(v, 'k'), g(v, 'n')).n > 0, note: 'a fraction to reduce' }],
    answer: (v) => fText(fr(g(v, 'k'), g(v, 'n'))),
    options: (v, right) => textOptions(right, [rawF(g(v, 'k'), g(v, 'n')), ...slipFracs(fr(g(v, 'k'), g(v, 'n')), [fr(g(v, 'n') - g(v, 'k'), g(v, 'n')), fr(g(v, 'k'), g(v, 'n') - g(v, 'k'))])]),
    why: (v, a) => `${v.k}/${v.n} = ${a}.`,
  }),
];

// ───────────────────────── shared builders used above ─────────────────────────
/** A strictly increasing run built from a start and steps `d1…d6`. */
function ladder(v: Vars): number[] {
  const out = [g(v, 'a')];
  for (let i = 1; i <= 6; i += 1) out.push(out[i - 1]! + g(v, `d${i}`));
  return out;
}
/** Six values spread between `lo` and `lo + w` with both ends present. */
function rng(v: Vars): number[] {
  const lo = g(v, 'lo');
  const hi = lo + g(v, 'w');
  const mids = [1, 2, 3, 4].map((i) => lo + Math.min(g(v, `i${i}`), g(v, 'w') - 1));
  return [lo, ...mids, hi];
}
const MINUSSIGN = '−';
/** The three options of the "direct source" task, rotated by the draw. */
function triple(v: Vars): string[] {
  const d = DIRECT[g(v, 'k')]!;
  const all = [d.right, d.w1, d.w2];
  const r = g(v, 'sh');
  return [...all.slice(r), ...all.slice(0, r)];
}
function langVars() {
  return { sp: C(LANGS), s1: D((v: Vars) => String(v.sp).split('|')[0]!.replace(/ი$/, '')), s2: D((v: Vars) => String(v.sp).split('|')[1]!.replace(/ი$/, '')) };
}
function subjectVars() {
  return side(SUBJECTS);
}
/** `5, 10 და 15`-style enumeration. */
function withListAnd(xs: number[]): string {
  return xs.length < 2 ? lst(xs) : `${xs.slice(0, -1).join(', ')} და ${xs[xs.length - 1]}`;
}
/** A shuffled enumeration of the colours with their counts. */
function colorList(v: Vars): string {
  const items: string[] = [];
  for (let i = 0; i < 4; i += 1) for (let j = 0; j < g(v, `c${i}`); j += 1) items.push(COLORS[i]!);
  const idx = shuffle(items.map((_, i) => i), g(v, 'sh'));
  return idx.map((i) => items[i]!).join(', ');
}
