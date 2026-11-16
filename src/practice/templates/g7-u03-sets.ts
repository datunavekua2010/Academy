import type { QuestionTemplate, Vars } from './types';
import { C, D, I, N, q6 } from './g6-helpers';

/**
 * Grade VII — Unit 3: sets.
 *
 * Converted from the academy's Grade VII `U03` bank: 6 subtopics × 6 questions.
 *
 * A set is drawn as a bit mask over a small universe (numbers or letters), so
 * every union, intersection and difference is computed on the same elements the
 * prompt prints. A set is printed `{1, 2, 3}`; the empty set is `∅`.
 */

export const G7_U03_SUBTOPICS = ['u03-01', 'u03-02', 'u03-03', 'u03-04', 'u03-05', 'u03-06'] as const;

const T = 'g7-sets';
let seq = 0;
const nextId = (): string => `g7-u03-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic' | 'grade'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, grade: 7, ...spec });

const NUMERIC = ['1,2,3,4,5,6,7,8', '2,4,6,8,10,12,14,16', '1,3,5,7,9,11,13,15', '5,10,15,20,25,30,35,40', '3,6,9,12,15,18,21,24', '10,20,30,40,50,60,70,80', '2,3,5,7,11,13,17,19'];
const ALL = [...NUMERIC, 'a,b,c,d,e,f,g,h', 'k,l,m,n,p,q,r,s'];

const els = (v: Vars): string[] => String(v.u).split(',');
const bits = (m: number): number => m.toString(2).replace(/0/g, '').length;
const has = (m: number, i: number): boolean => ((m >> i) & 1) === 1;
const pick = (v: Vars, k: string): string[] => els(v).filter((_, i) => has(N(v, k), i));
/** Keep universe order. */
const order = (v: Vars, xs: string[]): string[] => els(v).filter((e) => xs.includes(e));
const fmt = (xs: string[]): string => (xs.length === 0 ? '∅' : `{${xs.join(', ')}}`);
const union = (v: Vars, a: string[], b: string[]): string[] => order(v, [...a, ...b]);
const inter = (a: string[], b: string[]): string[] => a.filter((x) => b.includes(x));
const diff = (a: string[], b: string[]): string[] => a.filter((x) => !b.includes(x));
const sym = (v: Vars, a: string[], b: string[]): string[] => order(v, [...diff(a, b), ...diff(b, a)]);
const SET_VARS = (u: string[], extra: Record<string, ReturnType<typeof I> | ReturnType<typeof C> | ReturnType<typeof D>> = {}): Spec['vars'] =>
  ({
    u: C(u),
    ma: I(1, 255),
    mb: I(1, 255),
    sa: D((v) => fmt(pick(v, 'ma'))),
    sb: D((v) => fmt(pick(v, 'mb'))),
    ...extra,
  }) as Spec['vars'];

const size = (v: Vars, k: string): number => bits(N(v, k) & ((1 << els(v).length) - 1));
const inSize = (lo: number, hi: number) => (v: Vars, k: string): boolean => size(v, k) >= lo && size(v, k) <= hi;

/** One set question over A and B; the key is a printed set (or a count). */
interface Two {
  sub: string;
  prompt: string;
  universes?: string[];
  sizeA: [number, number];
  sizeB: [number, number];
  /** Extra condition on the drawn sets. */
  when?: (a: string[], b: string[]) => boolean;
  note: string;
  result: (v: Vars, a: string[], b: string[]) => string[];
  /** A count question instead of the set itself. */
  count?: boolean;
  wrongSets: (v: Vars, a: string[], b: string[]) => string[][];
  how: (a: string[], b: string[]) => string;
  d?: 1 | 2 | 3;
}

const two = (c: Two): QuestionTemplate => {
  const both = (v: Vars): [string[], string[]] => [pick(v, 'ma'), pick(v, 'mb')];
  const ok = (v: Vars): boolean => {
    const [a, b] = both(v);
    return inSize(c.sizeA[0], c.sizeA[1])(v, 'ma') && inSize(c.sizeB[0], c.sizeB[1])(v, 'mb') && (c.when ? c.when(a, b) : true) && (c.count ? true : c.result(v, a, b).length !== 1);
  };
  return t({
    sub: c.sub,
    ...(c.d ? { d: c.d } : {}),
    prompt: c.prompt,
    vars: SET_VARS(c.universes ?? ALL),
    constraints: [{ test: ok, note: c.note }],
    answer: (v) => {
      const [a, b] = both(v);
      const r = c.result(v, a, b);
      return c.count ? String(r.length) : fmt(r);
    },
    ...(c.count
      ? {
          wrong: (v: Vars) => {
            const [a, b] = both(v);
            return c.wrongSets(v, a, b).map((x) => x.length);
          },
        }
      : {
          options: (v: Vars, right: string) => {
            const [a, b] = both(v);
            const outside = els(v).filter((e) => !union(v, a, b).includes(e));
            const items = [...c.wrongSets(v, a, b), a, b, union(v, a, b), inter(a, b), sym(v, a, b), diff(a, b), diff(b, a), union(v, a, b).slice(1), order(v, [...inter(a, b), ...outside.slice(0, 1)]), order(v, [...diff(a, b), ...outside.slice(0, 1)]), a.slice(1), b.slice(0, -1)].map(fmt);
            return [right, ...items.filter((x) => x !== right && !/^\{[^,}]*\}$/.test(x))];
          },
        }),
    why: (v, a) => {
      const [x, y] = both(v);
      return `${c.how(x, y)} პასუხი: ${a}.`;
    },
  });
};

export const G7_U03_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U03.1 — რიცხვთა სიმრავლეები და ქვესიმრავლეები ═════════
  t({
    sub: 'u03-01',
    prompt: 'მოცემულია A = {sa}. ჩამოთვლილთაგან რომელი არის A-ს ქვესიმრავლე?',
    vars: SET_VARS(ALL, { r: I(1, 15) }),
    constraints: [{ test: (v: Vars) => size(v, 'ma') >= 4 && size(v, 'ma') <= 5 && bits(N(v, 'r')) >= 2 && bits(N(v, 'r')) <= 3, note: 'A has 4–5 elements, the subset 2–3' }],
    answer: (v) => fmt(pick(v, 'ma').filter((_, i) => has(N(v, 'r'), i))),
    options: (v, right) => {
      const a = pick(v, 'ma');
      const sub = a.filter((_, i) => has(N(v, 'r'), i));
      const out = els(v).filter((e) => !a.includes(e));
      return [right, ...[0, 1, 2].map((j) => fmt(order(v, [...sub.filter((_, i) => i !== j % sub.length), out[j]!])))];
    },
    why: (v, a) => `ქვესიმრავლის ყველა ელემენტი A-ში უნდა იყოს: ${a} ⊆ ${v.sa}.`,
  }),
  t({
    sub: 'u03-01',
    prompt: 'მოცემულია B = {sb}. სწორია თუ არა ჩანაწერი {sub} ⊆ B?',
    vars: SET_VARS(ALL, { r: I(1, 15), bad: C([0, 1]), sub: D((v) => fmt(subOrBad(v))) }),
    constraints: [{ test: (v: Vars) => size(v, 'mb') >= 4 && size(v, 'mb') <= 6 && bits(N(v, 'r')) >= 2 && bits(N(v, 'r')) <= 3, note: 'B has 4–6 elements, the candidate 2–3' }],
    answer: (v) => (N(v, 'bad') === 0 ? 'დიახ' : 'არა'),
    options: () => ['დიახ', 'არა'],
    optionCount: 2,
    why: (v, a) => (N(v, 'bad') === 0 ? `${v.sub}-ის ყველა ელემენტი B-შია. პასუხი: ${a}.` : `${v.sub}-ში არის ელემენტი, რომელიც B-ში არ არის. პასუხი: ${a}.`),
  }),
  t({
    sub: 'u03-01',
    prompt: 'მოცემულია C = {sa}. რამდენი ელემენტი აქვს C-ს?',
    vars: SET_VARS(ALL),
    constraints: [{ test: (v: Vars) => size(v, 'ma') >= 3 && size(v, 'ma') <= 8, note: 'sets of 3–8 elements' }],
    answer: (v) => String(size(v, 'ma')),
    wrong: (v) => [size(v, 'ma') + 1, size(v, 'ma') - 1, size(v, 'ma') + 2, size(v, 'ma') - 2],
    why: (v, a) => `${v.sa} სიმრავლეში ელემენტებია ${pick(v, 'ma').join(', ')}, ანუ ${a} ელემენტი.`,
  }),
  t({
    sub: 'u03-01',
    prompt: 'მოცემულია D = {sa} და E = {sb}. სწორია თუ არა ჩანაწერი E ⊆ D?',
    vars: SET_VARS(ALL, { sub: C([0, 1]) }),
    constraints: [{ test: (v: Vars) => size(v, 'ma') >= 5 && size(v, 'ma') <= 7 && size(v, 'mb') >= 2 && size(v, 'mb') <= 4 && ((inter(pick(v, 'mb'), pick(v, 'ma')).length === size(v, 'mb')) === (N(v, 'sub') === 0)), note: 'E is a subset in about half of the draws' }],
    answer: (v) => (inter(pick(v, 'mb'), pick(v, 'ma')).length === size(v, 'mb') ? 'დიახ' : 'არა'),
    options: () => ['დიახ', 'არა'],
    optionCount: 2,
    why: (v, a) => `E-ს ელემენტებია ${pick(v, 'mb').join(', ')}; ${a === 'დიახ' ? 'ყველა მათგანი D-შია' : `${diff(pick(v, 'mb'), pick(v, 'ma')).join(', ')} D-ში არ არის`}. პასუხი: ${a}.`,
  }),
  t({
    sub: 'u03-01',
    prompt: 'მოცემულია F = {sa}. ჩამოწერე F-ის ყველა ელემენტი, რომელიც {lim}-ზე ნაკლებია.',
    vars: SET_VARS(NUMERIC, { k: I(2, 5), lim: D((v) => Number(els(v)[N(v, 'k')]!) + 1) }),
    constraints: [{ test: (v: Vars) => size(v, 'ma') >= 5 && size(v, 'ma') <= 7 && pick(v, 'ma').filter((x) => Number(x) < N(v, 'lim')).length >= 2 && pick(v, 'ma').filter((x) => Number(x) < N(v, 'lim')).length < size(v, 'ma') - 1, note: 'the threshold splits F' }],
    answer: (v) => fmt(pick(v, 'ma').filter((x) => Number(x) < N(v, 'lim'))),
    options: (v, right) => {
      const a = pick(v, 'ma');
      const lim = N(v, 'lim');
      return [right, fmt(a.filter((x) => Number(x) > lim)), fmt(a.filter((x) => Number(x) <= lim + 3)), fmt(a), fmt(a.filter((x) => Number(x) < lim).slice(1))];
    },
    why: (v, a) => `F-ის ელემენტებიდან ${v.lim}-ზე ნაკლებია ${a}.`,
  }),
  t({
    sub: 'u03-01',
    prompt: 'მოცემულია G = {sa}. რომელი სიმრავლე არ არის G-ს ქვესიმრავლე?',
    vars: SET_VARS(ALL, { r1: I(1, 15), r2: I(1, 15), r3: I(1, 15), r4: I(1, 15) }),
    constraints: [{
      test: (v: Vars) => size(v, 'ma') >= 4 && size(v, 'ma') <= 5 && [1, 2, 3, 4].every((i) => bits(N(v, `r${i}`)) >= 2 && bits(N(v, `r${i}`)) <= 3) && new Set([1, 2, 3].map((i) => N(v, `r${i}`))).size === 3,
      note: 'G has 4–5 elements; three different subsets',
    }],
    answer: (v) => {
      const a = pick(v, 'ma');
      const out = els(v).filter((e) => !a.includes(e));
      const base = a.filter((_, i) => has(N(v, 'r4'), i));
      return fmt(order(v, [...base.slice(1), out[0]!]));
    },
    options: (v, right) => {
      const a = pick(v, 'ma');
      return [right, ...[1, 2, 3].map((i) => fmt(a.filter((_, j) => has(N(v, `r${i}`), j))))];
    },
    why: (v, a) => `${a}-ში არის ელემენტი, რომელიც ${v.sa}-ში არ არის, ამიტომ ის ქვესიმრავლე არ არის.`,
  }),

  // ═════════ U03.2 — ქვესიმრავლეების რაოდენობა ═════════
  t({
    sub: 'u03-02',
    prompt: 'რამდენი ქვესიმრავლე აქვს სიმრავლეს A = {sa}?',
    vars: SET_VARS(ALL),
    constraints: [{ test: (v: Vars) => size(v, 'ma') >= 2 && size(v, 'ma') <= 4, note: 'small sets' }],
    answer: (v) => String(2 ** size(v, 'ma')),
    wrong: (v) => [2 * size(v, 'ma'), size(v, 'ma') ** 2, 2 ** size(v, 'ma') - 1, 2 ** (size(v, 'ma') + 1), size(v, 'ma') + 1],
    why: (v, a) => `n ელემენტიან სიმრავლეს 2ⁿ ქვესიმრავლე აქვს: n = ${size(v, 'ma')}, ამიტომ ${a}.`,
  }),
  t({
    sub: 'u03-02',
    prompt: 'რამდენი ქვესიმრავლე აქვს სიმრავლეს B = {sa}?',
    vars: SET_VARS(['a,b,c,d,e,f,g,h', 'k,l,m,n,p,q,r,s', 'x,y,z,u,v,w,s,t']),
    constraints: [{ test: (v: Vars) => size(v, 'ma') >= 3 && size(v, 'ma') <= 6, note: 'three to six letters' }],
    answer: (v) => String(2 ** size(v, 'ma')),
    wrong: (v) => [2 * size(v, 'ma'), size(v, 'ma') ** 2, 2 ** size(v, 'ma') - 1, 2 ** (size(v, 'ma') - 1), 2 ** size(v, 'ma') + 1],
    why: (v, a) => `${size(v, 'ma')} ელემენტიან სიმრავლეს ${a} ქვესიმრავლე აქვს.`,
  }),
  t({
    sub: 'u03-02',
    prompt: 'რამდენი ქვესიმრავლე აქვს სიმრავლეს C = {sa}?',
    vars: SET_VARS(NUMERIC),
    constraints: [{ test: (v: Vars) => size(v, 'ma') >= 3 && size(v, 'ma') <= 7, note: 'three to seven elements' }],
    answer: (v) => String(2 ** size(v, 'ma')),
    wrong: (v) => [2 * size(v, 'ma'), size(v, 'ma') ** 2, 2 ** size(v, 'ma') - 1, 2 ** (size(v, 'ma') - 1), 2 ** size(v, 'ma') + 1],
    why: (v, a) => `${size(v, 'ma')} ელემენტიან სიმრავლეს ${a} ქვესიმრავლე აქვს.`,
  }),
  t({
    sub: 'u03-02',
    prompt: 'სიმრავლე {S} შეიცავს {n} ელემენტს. რამდენი ქვესიმრავლე აქვს მას?',
    vars: { n: I(3, 8), S: C(['D', 'K', 'P', 'Q', 'T', 'M']) },
    answer: (v) => String(2 ** N(v, 'n')),
    wrong: (v) => [2 * N(v, 'n'), N(v, 'n') ** 2, 2 ** N(v, 'n') - 1, 2 ** (N(v, 'n') - 1), 2 ** (N(v, 'n') + 1)],
    why: (v, a) => `2 ამდენ ხარისხში: ${v.n} ელემენტიანი სიმრავლის ქვესიმრავლეთა რაოდენობაა ${a}.`,
  }),
  t({
    sub: 'u03-02',
    prompt: '{ask}',
    vars: {
      n: I(2, 7),
      form: C([0, 1, 2]),
      ask: D((v) =>
        N(v, 'form') === 0
          ? 'რამდენი ქვესიმრავლე აქვს ცარიელ სიმრავლეს ∅?'
          : N(v, 'form') === 1
            ? `სიმრავლე შეიცავს ${N(v, 'n')} ელემენტს. რამდენი არაცარიელი ქვესიმრავლე აქვს მას?`
            : `სიმრავლე შეიცავს ${N(v, 'n')} ელემენტს. რამდენი საკუთრივი ქვესიმრავლე აქვს მას (თვით სიმრავლის გარდა)?`,
      ),
    },
    answer: (v) => (N(v, 'form') === 0 ? '1' : String(2 ** N(v, 'n') - 1)),
    wrong: (v) => (N(v, 'form') === 0 ? [0, 2, 3] : [2 ** N(v, 'n'), 2 ** N(v, 'n') - 2, 2 ** N(v, 'n') + 1, 2 * N(v, 'n')]),
    why: (v, a) => (N(v, 'form') === 0 ? `ცარიელ სიმრავლეს ერთადერთი ქვესიმრავლე აქვს — თავად ∅. პასუხი: ${a}.` : `ყველა ქვესიმრავლეა ${2 ** N(v, 'n')}, ერთს ვაკლებთ. პასუხი: ${a}.`),
  }),
  t({
    sub: 'u03-02',
    prompt: '{S} სიმრავლეს ზუსტად {m} ქვესიმრავლე აქვს. რამდენი ელემენტია ამ სიმრავლეში?',
    vars: { n: I(2, 9), m: D((v) => 2 ** N(v, 'n')), S: C(['A', 'B', 'C', 'D', 'X']) },
    answer: (v) => String(N(v, 'n')),
    wrong: (v) => [N(v, 'n') + 1, N(v, 'n') - 1, N(v, 'm') / 2, N(v, 'n') + 2],
    why: (v, a) => `${v.m} = 2 ${a}-ჯერ გამრავლებული თავის თავზე, ამიტომ ელემენტების რაოდენობაა ${a}.`,
  }),

  // ═════════ U03.3 — სიმრავლეთა გაერთიანება ═════════
  two({ sub: 'u03-03', prompt: 'მოცემულია A = {sa} და B = {sb}. იპოვე A ∪ B.', sizeA: [3, 5], sizeB: [3, 5], when: (a, b) => inter(a, b).length >= 1, note: 'overlapping sets', result: (v, a, b) => union(v, a, b), wrongSets: (v, a, b) => [inter(a, b), sym(v, a, b), union(v, a, b).slice(1)], how: () => 'გაერთიანება შეიცავს ორივე სიმრავლის ყველა ელემენტს, განმეორების გარეშე.' }),
  two({ sub: 'u03-03', prompt: 'მოცემულია C = {sa} და D = {sb}. იპოვე C ∪ D.', universes: ['1,2,3,4,5,6,7,8', 'a,b,c,d,e,f,g,h', '2,3,5,7,11,13,17,19'], sizeA: [3, 4], sizeB: [3, 4], when: (a, b) => inter(a, b).length === 0, note: 'disjoint sets', result: (v, a, b) => union(v, a, b), wrongSets: (_v, a, b) => [a, b, a.slice(1).concat(b)], how: () => 'სიმრავლეებს საერთო ელემენტი არ აქვთ, ამიტომ გაერთიანებაში ყველა ელემენტი ერთხელ შედის.' }),
  two({ sub: 'u03-03', prompt: 'მოცემულია E = {sa} და F = {sb}. რამდენი ელემენტია E ∪ F-ში?', universes: ['a,b,c,d,e,f,g,h', 'k,l,m,n,p,q,r,s'], sizeA: [3, 5], sizeB: [3, 5], when: (a, b) => inter(a, b).length >= 1, note: 'overlapping letter sets', count: true, result: (v, a, b) => union(v, a, b), wrongSets: (_v, a, b) => [Array(a.length + b.length).fill('x'), Array(Math.max(a.length, b.length)).fill('x'), Array(a.length + b.length - 2 * inter(a, b).length).fill('x'), Array(a.length + b.length + 1).fill('x')], how: (a, b) => `|E ∪ F| = ${a.length} + ${b.length} − ${inter(a, b).length} (საერთო ელემენტები ერთხელ ითვლება).` }),
  two({ sub: 'u03-03', prompt: 'მოცემულია G = {sa} და H = {sb}. იპოვე G ∪ H.', universes: NUMERIC, sizeA: [3, 5], sizeB: [3, 5], when: (a, b) => inter(a, b).length >= 2, note: 'two or more common elements', result: (v, a, b) => union(v, a, b), wrongSets: (v, a, b) => [inter(a, b), sym(v, a, b), diff(a, b)], how: () => 'ვწერთ ორივე სიმრავლის ელემენტებს, საერთოებს ერთხელ.' }),
  two({ sub: 'u03-03', prompt: 'მოცემულია K = {sa} და L = {sb}. რამდენი ელემენტია K ∪ L-ში?', universes: NUMERIC, sizeA: [3, 4], sizeB: [3, 4], when: (a, b) => inter(a, b).length >= 1, note: 'overlapping sets', count: true, result: (v, a, b) => union(v, a, b), wrongSets: (_v, a, b) => [Array(a.length + b.length).fill('x'), Array(Math.max(a.length, b.length)).fill('x'), Array(a.length + b.length - 2 * inter(a, b).length).fill('x'), Array(a.length + b.length + 1).fill('x')], how: (a, b) => `|K ∪ L| = ${a.length} + ${b.length} − ${inter(a, b).length}.` }),
  two({ sub: 'u03-03', prompt: 'მოცემულია M = {sa} და N = {sb}. იპოვე M ∪ N.', universes: NUMERIC, sizeA: [4, 5], sizeB: [3, 5], when: (a, b) => inter(a, b).length >= 2 && diff(b, a).length >= 1, note: 'partial overlap', result: (v, a, b) => union(v, a, b), wrongSets: (v, a, b) => [inter(a, b), diff(a, b), sym(v, a, b)], how: () => 'გაერთიანებაში ყველა ელემენტი ერთხელ შედის.' }),

  // ═════════ U03.4 — სიმრავლეთა თანაკვეთა ═════════
  two({ sub: 'u03-04', prompt: 'მოცემულია A = {sa} და B = {sb}. იპოვე A ∩ B.', sizeA: [3, 5], sizeB: [3, 5], when: (a, b) => inter(a, b).length >= 2, note: 'two or more common elements', result: (_v, a, b) => inter(a, b), wrongSets: (v, a, b) => [union(v, a, b), sym(v, a, b), diff(a, b)], how: () => 'თანაკვეთაში მხოლოდ ის ელემენტებია, რომლებიც ორივე სიმრავლეშია.' }),
  two({ sub: 'u03-04', prompt: 'მოცემულია C = {sa} და D = {sb}. იპოვე C ∩ D.', universes: ['1,2,3,4,5,6,7,8', 'a,b,c,d,e,f,g,h'], sizeA: [3, 4], sizeB: [3, 4], when: (a, b) => inter(a, b).length === 0 || inter(a, b).length >= 2, note: 'no or several common elements', result: (_v, a, b) => inter(a, b), wrongSets: (v, a, b) => [union(v, a, b), a, b], how: (a, b) => (inter(a, b).length === 0 ? 'საერთო ელემენტი არ არის, ამიტომ თანაკვეთა ცარიელია.' : 'ვპოულობთ ელემენტებს, რომლებიც ორივე სიმრავლეშია.') }),
  two({ sub: 'u03-04', prompt: 'მოცემულია E = {sa} და F = {sb}. რამდენი ელემენტია E ∩ F-ში?', universes: ['a,b,c,d,e,f,g,h', 'k,l,m,n,p,q,r,s'], sizeA: [3, 5], sizeB: [3, 5], when: (a, b) => inter(a, b).length >= 1, note: 'overlapping letter sets', count: true, result: (_v, a, b) => inter(a, b), wrongSets: (_v, a, b) => [Array(inter(a, b).length + 1).fill('x'), Array(a.length + b.length - inter(a, b).length).fill('x'), Array(Math.max(1, inter(a, b).length - 1)).fill('x'), Array(a.length).fill('x'), Array(inter(a, b).length + 2).fill('x')], how: () => 'ვითვლით ელემენტებს, რომლებიც ორივე სიმრავლეშია.' }),
  two({ sub: 'u03-04', prompt: 'მოცემულია G = {sa} და H = {sb}. იპოვე G ∩ H.', universes: NUMERIC, sizeA: [4, 6], sizeB: [3, 5], when: (a, b) => inter(a, b).length >= 2, note: 'two or more common elements', result: (_v, a, b) => inter(a, b), wrongSets: (v, a, b) => [union(v, a, b), sym(v, a, b), diff(b, a)], how: () => 'თანაკვეთაში შედის ელემენტები, რომლებიც G-შიც არის და H-შიც.' }),
  two({ sub: 'u03-04', prompt: 'მოცემულია K = {sa} და L = {sb}. იპოვე K ∩ L.', universes: NUMERIC, sizeA: [4, 6], sizeB: [2, 4], when: (a, b) => inter(a, b).length === b.length && b.length >= 2, note: 'L is a subset of K', result: (_v, a, b) => inter(a, b), wrongSets: (v, a, b) => [a, diff(a, b), union(v, a, b)], how: () => 'L-ის ყველა ელემენტი K-შიც არის, ამიტომ K ∩ L = L.' }),
  two({ sub: 'u03-04', prompt: 'მოცემულია M = {sa} და N = {sb}. რამდენი ელემენტია M ∩ N-ში?', universes: NUMERIC, sizeA: [3, 4], sizeB: [3, 4], when: (a, b) => inter(a, b).length !== 1, note: 'none or several common elements', count: true, result: (_v, a, b) => inter(a, b), wrongSets: (_v, a, b) => [Array(inter(a, b).length + 1).fill('x'), Array(a.length + b.length).fill('x'), Array(a.length).fill('x'), Array(inter(a, b).length + 2).fill('x'), Array(inter(a, b).length + 3).fill('x')], how: (a, b) => (inter(a, b).length === 0 ? 'საერთო ელემენტი არ არის.' : 'ვითვლით საერთო ელემენტებს.') }),

  // ═════════ U03.5 — სხვაობა და სიმეტრიული სხვაობა ═════════
  two({ sub: 'u03-05', prompt: 'მოცემულია A = {sa} და B = {sb}. იპოვე A ∖ B.', sizeA: [4, 6], sizeB: [3, 5], when: (a, b) => inter(a, b).length >= 1 && diff(a, b).length >= 2, note: 'A has elements outside B', result: (_v, a, b) => diff(a, b), wrongSets: (v, a, b) => [diff(b, a), inter(a, b), sym(v, a, b)], how: () => 'A ∖ B-ში შედის A-ს ის ელემენტები, რომლებიც B-ში არ არის.' }),
  two({ sub: 'u03-05', prompt: 'მოცემულია C = {sa} და D = {sb}. იპოვე C ∖ D.', universes: NUMERIC, sizeA: [4, 6], sizeB: [2, 3], when: (a, b) => inter(a, b).length === b.length && diff(a, b).length >= 2, note: 'D is a subset of C', result: (_v, a, b) => diff(a, b), wrongSets: (v, a, b) => [b, inter(a, b), union(v, a, b)], how: () => 'D-ს ელემენტებს C-დან ვაკლებთ.' }),
  two({ sub: 'u03-05', prompt: 'მოცემულია E = {sa} და F = {sb}. იპოვე სიმეტრიული სხვაობა E △ F.', sizeA: [3, 4], sizeB: [3, 4], when: (a, b) => inter(a, b).length >= 1 && diff(a, b).length >= 1 && diff(b, a).length >= 1, note: 'each set has its own elements', result: (v, a, b) => sym(v, a, b), wrongSets: (v, a, b) => [inter(a, b), union(v, a, b), diff(a, b)], how: () => 'სიმეტრიულ სხვაობაში შედის ელემენტები, რომლებიც ზუსტად ერთ სიმრავლეშია.' }),
  two({ sub: 'u03-05', prompt: 'მოცემულია G = {sa} და H = {sb}. იპოვე G △ H.', universes: NUMERIC, sizeA: [3, 5], sizeB: [3, 5], when: (a, b) => inter(a, b).length >= 1 && diff(a, b).length >= 1 && diff(b, a).length >= 1, note: 'each set has its own elements', result: (v, a, b) => sym(v, a, b), wrongSets: (v, a, b) => [inter(a, b), union(v, a, b), diff(b, a)], how: () => 'G △ H = (G ∖ H) ∪ (H ∖ G).' }),
  two({ sub: 'u03-05', prompt: 'მოცემულია K = {sa} და L = {sb}. რამდენი ელემენტია K ∖ L-ში?', universes: NUMERIC, sizeA: [4, 5], sizeB: [3, 4], when: (a, b) => inter(a, b).length >= 1, note: 'overlapping sets', count: true, result: (_v, a, b) => diff(a, b), wrongSets: (_v, a, b) => [Array(diff(b, a).length).fill('x'), Array(inter(a, b).length).fill('x'), Array(a.length).fill('x'), Array(diff(a, b).length + 1).fill('x'), Array(diff(a, b).length + 2).fill('x')], how: (a, b) => `K-ს ${a.length} ელემენტიდან ${inter(a, b).length} L-შიც არის, დარჩა ${diff(a, b).length}.` }),
  two({ sub: 'u03-05', prompt: 'მოცემულია M = {sa} და N = {sb}. იპოვე M △ N.', universes: NUMERIC, sizeA: [4, 4], sizeB: [3, 4], when: (a, b) => inter(a, b).length >= 2 && diff(a, b).length >= 1 && diff(b, a).length >= 1, note: 'partial overlap', result: (v, a, b) => sym(v, a, b), wrongSets: (v, a, b) => [inter(a, b), union(v, a, b), diff(a, b)], how: () => 'საერთო ელემენტებს ვაგდებთ, დანარჩენებს ვტოვებთ.' }),
  // ═════════ U03.6 — სიმრავლის ელემენტების რაოდენობა ═════════
  t({
    sub: 'u03-06',
    prompt: 'მოცემულია A = {sa}. იპოვე n(A).',
    vars: SET_VARS(NUMERIC),
    constraints: [{ test: (v: Vars) => size(v, 'ma') >= 3 && size(v, 'ma') <= 8, note: 'sets of 3–8 elements' }],
    answer: (v) => String(size(v, 'ma')),
    wrong: (v) => [size(v, 'ma') + 1, size(v, 'ma') - 1, size(v, 'ma') + 2, size(v, 'ma') - 2],
    why: (v, a) => `n(A) არის A-ს ელემენტების რაოდენობა: ${pick(v, 'ma').join(', ')} — სულ ${a}.`,
  }),
  t({
    sub: 'u03-06',
    prompt: 'მოცემულია B = {sa}. იპოვე n(B).',
    vars: SET_VARS(['a,b,c,d,e,f,g,h', 'k,l,m,n,p,q,r,s']),
    constraints: [{ test: (v: Vars) => size(v, 'ma') >= 3 && size(v, 'ma') <= 8, note: 'sets of 3–8 elements' }],
    answer: (v) => String(size(v, 'ma')),
    wrong: (v) => [size(v, 'ma') + 1, size(v, 'ma') - 1, size(v, 'ma') + 2, size(v, 'ma') - 2],
    why: (v, a) => `B-ში ${a} ელემენტია: ${pick(v, 'ma').join(', ')}.`,
  }),
  two({ sub: 'u03-06', prompt: 'მოცემულია A = {sa} და B = {sb}. იპოვე n(A ∪ B).', universes: NUMERIC, sizeA: [3, 5], sizeB: [3, 5], when: (a, b) => inter(a, b).length >= 1, note: 'overlapping sets', count: true, result: (v, a, b) => union(v, a, b), wrongSets: (_v, a, b) => [Array(a.length + b.length).fill('x'), Array(Math.max(a.length, b.length)).fill('x'), Array(inter(a, b).length).fill('x'), Array(a.length + b.length - inter(a, b).length + 1).fill('x')], how: (a, b) => `n(A ∪ B) = ${a.length} + ${b.length} − ${inter(a, b).length}.` }),
  t({
    sub: 'u03-06',
    prompt: 'კლასში {a} მოსწავლეს უყვარს {x}, {b}-ს — {y}, ხოლო {c} მოსწავლეს ორივე სპორტი უყვარს. რამდენ მოსწავლეს უყვარს ამ ორი სპორტიდან ერთი მაინც?',
    vars: { pr: C(['ფეხბურთი|კალათბურთი', 'ჭადრაკი|ფეხბურთი', 'ცურვა|ტენისი', 'ვოლეიბოლი|კალათბურთი', 'ტენისი|ჭადრაკი', 'ცურვა|ფეხბურთი']), a: I(12, 25), b: I(8, 20), c: I(2, 7), x: D((v) => String(v.pr).split('|')[0]!), y: D((v) => String(v.pr).split('|')[1]!) },
    answer: (v) => String(N(v, 'a') + N(v, 'b') - N(v, 'c')),
    wrong: (v) => [N(v, 'a') + N(v, 'b'), N(v, 'a') + N(v, 'b') - 2 * N(v, 'c'), N(v, 'a') + N(v, 'b') + N(v, 'c'), Math.abs(N(v, 'a') - N(v, 'b'))],
    why: (v, a) => `${v.a} + ${v.b} − ${v.c} = ${a}: ორივე სპორტის მოყვარულები ორჯერ დაითვალა და ერთხელ გამოვაკლეთ.`,
  }),
  t({
    sub: 'u03-06',
    prompt: 'ჯგუფში {n} მოსწავლეა. {a} სწავლობს {x}, {b} — {y}, ხოლო {c} ორივე ენას სწავლობს. რამდენი მოსწავლე სწავლობს ამ ენებიდან არცერთს?',
    vars: { pr: C(['ინგლისურს|გერმანულს', 'ფრანგულს|ესპანურს', 'ინგლისურს|ფრანგულს', 'გერმანულს|ესპანურს', 'რუსულს|გერმანულს', 'ინგლისურს|ესპანურს']), a: I(10, 20), b: I(8, 16), c: I(2, 6), r: I(1, 9), x: D((v) => String(v.pr).split('|')[0]!), y: D((v) => String(v.pr).split('|')[1]!), n: D((v) => N(v, 'a') + N(v, 'b') - N(v, 'c') + N(v, 'r')) },
    answer: (v) => String(N(v, 'r')),
    wrong: (v) => [N(v, 'r') + N(v, 'c'), N(v, 'r') - N(v, 'c') > 0 ? N(v, 'r') - N(v, 'c') : N(v, 'r') + 2 * N(v, 'c'), N(v, 'n') - N(v, 'a') - N(v, 'b'), N(v, 'r') + 1],
    why: (v, a) => `ერთი მაინც სწავლობს ${v.a} + ${v.b} − ${v.c} = ${N(v, 'a') + N(v, 'b') - N(v, 'c')}; არცერთს — ${v.n} − ${N(v, 'a') + N(v, 'b') - N(v, 'c')} = ${a}.`,
  }),
  t({
    sub: 'u03-06',
    prompt: 'მოცემულია A = {sa} და B = {sb}. იპოვე n(A ∪ B) და n(A ∩ B).',
    vars: SET_VARS(NUMERIC),
    constraints: [{ test: (v: Vars) => size(v, 'ma') >= 5 && size(v, 'ma') <= 7 && size(v, 'mb') >= 3 && size(v, 'mb') <= 5 && inter(pick(v, 'ma'), pick(v, 'mb')).length >= 2, note: 'overlapping sets' }],
    answer: (v) => `n(A ∪ B) = ${union(v, pick(v, 'ma'), pick(v, 'mb')).length}, n(A ∩ B) = ${inter(pick(v, 'ma'), pick(v, 'mb')).length}`,
    options: (v, right) => {
      const a = pick(v, 'ma');
      const b = pick(v, 'mb');
      const u = union(v, a, b).length;
      const i = inter(a, b).length;
      const f = (x: number, y: number): string => `n(A ∪ B) = ${x}, n(A ∩ B) = ${y}`;
      return [right, f(i, u), f(a.length + b.length, i), f(u, i + 1), f(u + 1, i), f(u - 1, i)];
    },
    why: (v, a) => `${a}: n(A ∪ B) = ${size(v, 'ma')} + ${size(v, 'mb')} − ${inter(pick(v, 'ma'), pick(v, 'mb')).length}.`,
  }),
];

function subOrBad(v: Vars): string[] {
  const b = pick(v, 'mb');
  const base = b.filter((_, i) => has(N(v, 'r'), i));
  if (N(v, 'bad') === 0) return base;
  const out = els(v).filter((e) => !b.includes(e));
  return order(v, [...base.slice(1), out[0]!]);
}
