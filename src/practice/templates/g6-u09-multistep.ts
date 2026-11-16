import type { QuestionTemplate } from './types';
import { C, D, I, N, S, fAdd, fMul, fSub, fr, mText, q6, sg } from './g6-helpers';
import { dd, ds, fx } from './g6-dec';
import { fracSlips, fv } from './g6-frac';

/**
 * Grade VI — Unit 9: მრავალსაფეხურიანი ამოცანები (multi-step problems).
 *
 * Converted from the academy's `U09` bank: 9 subtopics × 6 questions.
 *
 * Each story is a pattern: the quantities are drawn, the answer is computed
 * step by step from them, and every wrong option is the slip of the story —
 * a step left out, an addition where a subtraction belongs, a fraction taken
 * of the whole instead of the remainder, a boundary value that does not satisfy
 * a strict inequality.
 */

export const G6_U09_SUBTOPICS = [
  'u09-01', 'u09-02', 'u09-03', 'u09-04', 'u09-05', 'u09-06', 'u09-07', 'u09-08', 'u09-09',
] as const;

const T = 'g6-multistep';
let seq = 0;
const nextId = (): string => `g6-u09-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

/** A whole answer with its unit. */
const an = (x: number, unit: string): string => (unit ? `${sg(x)} ${unit}` : sg(x));
const slips = (r: number, unit: string, extra: number[] = []): string[] =>
  [...extra, r + 1, r - 1, r + 10, r - 10, r * 10, r / 10, r + 100, r - 100]
    .filter((x) => Number.isInteger(x) && (x > 0 || r <= 0))
    .map((x) => an(x, unit));
const dslips = (r: number, unit: string, extra: number[] = []): string[] =>
  [...extra, r + 1, r - 1, r * 10, r / 10, r + 0.1, r - 0.1, r + 10, r - 10]
    .filter((x) => x > 0)
    .map((x) => `${ds(Math.round(x * 1e6) / 1e6)} ${unit}`);
const dm = (x: number, unit: string): string => `${ds(Math.round(x * 1e6) / 1e6)} ${unit}`;

export const G6_U09_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U09.1 — ამოცანები მთელ რიცხვებზე ═════════
  t({
    sub: 'u09-01',
    prompt: 'ბიბლიოთეკაში {st} წიგნი იყო. შეიტანეს კიდევ {at} წიგნი, შემდეგ კი {bt} წიგნი გაიტანეს. რამდენი წიგნი დარჩა ბიბლიოთეკაში?',
    vars: { s: I(800, 3200, { step: 10 }), a: I(120, 640), b: I(100, 700), st: S('s'), at: S('a'), bt: S('b') },
    answer: (v) => an(N(v, 's') + N(v, 'a') - N(v, 'b'), ''),
    wrong: (v) => slips(N(v, 's') + N(v, 'a') - N(v, 'b'), '', [N(v, 's') - N(v, 'a') - N(v, 'b'), N(v, 's') + N(v, 'a') + N(v, 'b'), N(v, 's') - N(v, 'a') + N(v, 'b')]),
    why: (v, a) => `${v.st} + ${v.at} = ${sg(N(v, 's') + N(v, 'a'))}; ${sg(N(v, 's') + N(v, 'a'))} − ${v.bt} = ${a}.`,
  }),
  t({
    sub: 'u09-01',
    prompt: 'საწყობში {b} ყუთია, თითოეულში {k} ბოთლი. თუ {sold} ბოთლი გაიყიდა, რამდენი ბოთლი დარჩა?',
    vars: { b: I(12, 48), k: I(12, 48), sold: I(120, 600, { step: 5 }) },
    constraints: [{ test: (v) => N(v, 'sold') < N(v, 'b') * N(v, 'k') - 20, note: 'something is left' }],
    answer: (v) => an(N(v, 'b') * N(v, 'k') - N(v, 'sold'), ''),
    wrong: (v) => slips(N(v, 'b') * N(v, 'k') - N(v, 'sold'), '', [N(v, 'b') * N(v, 'k'), N(v, 'b') + N(v, 'k') - N(v, 'sold'), N(v, 'b') * N(v, 'k') + N(v, 'sold')]),
    why: (v, a) => `${v.b} × ${v.k} = ${sg(N(v, 'b') * N(v, 'k'))}; ${sg(N(v, 'b') * N(v, 'k'))} − ${v.sold} = ${a}.`,
  }),
  t({
    sub: 'u09-01',
    prompt: 'ფერმერმა დილით {a} კგ ვაშლი მოკრიფა, შუადღეს — {b} კგ, ხოლო საღამოს მთელი მოსავლის {s} კგ გაყიდა. რამდენი კილოგრამი ვაშლი დარჩა?',
    vars: { a: I(300, 900), b: I(200, 700), s: I(100, 400, { step: 5 }) },
    answer: (v) => an(N(v, 'a') + N(v, 'b') - N(v, 's'), ''),
    wrong: (v) => slips(N(v, 'a') + N(v, 'b') - N(v, 's'), '', [N(v, 'a') + N(v, 'b'), N(v, 'a') - N(v, 'b') - N(v, 's'), N(v, 'a') + N(v, 'b') + N(v, 's')]),
    why: (v, a) => `${v.a} + ${v.b} = ${N(v, 'a') + N(v, 'b')}; ${N(v, 'a') + N(v, 'b')} − ${v.s} = ${a}.`,
  }),
  t({
    sub: 'u09-01',
    prompt: 'სკოლაში {c} კლასია და თითოეულ კლასში {k} მოსწავლეა. თუ {m} მოსწავლე ექსკურსიაზე არ წავიდა, რამდენი მოსწავლე წავიდა ექსკურსიაზე?',
    vars: { c: I(12, 30), k: I(20, 32), m: I(15, 60) },
    answer: (v) => an(N(v, 'c') * N(v, 'k') - N(v, 'm'), ''),
    wrong: (v) => slips(N(v, 'c') * N(v, 'k') - N(v, 'm'), '', [N(v, 'c') * N(v, 'k'), N(v, 'c') * N(v, 'k') + N(v, 'm'), N(v, 'c') + N(v, 'k') - N(v, 'm')]),
    why: (v, a) => `${v.c} × ${v.k} = ${N(v, 'c') * N(v, 'k')}; ${N(v, 'c') * N(v, 'k')} − ${v.m} = ${a}.`,
  }),
  t({
    sub: 'u09-01',
    d: 2,
    prompt: 'მაღაზიამ {st} რვეული მიიღო. პირველ დღეს გაყიდა {a}, მეორე დღეს კი — პირველ დღეს გაყიდულზე {e}-ით მეტი. რამდენი რვეული დარჩა?',
    vars: { s: I(600, 1200, { step: 10 }), a: I(150, 300), e: I(20, 90), st: S('s') },
    answer: (v) => an(N(v, 's') - N(v, 'a') - (N(v, 'a') + N(v, 'e')), ''),
    wrong: (v) => slips(N(v, 's') - 2 * N(v, 'a') - N(v, 'e'), '', [N(v, 's') - N(v, 'a') - N(v, 'e'), N(v, 's') - 2 * N(v, 'a'), N(v, 's') - 2 * N(v, 'a') + N(v, 'e')]),
    why: (v, a) => `მეორე დღეს: ${N(v, 'a')} + ${N(v, 'e')} = ${N(v, 'a') + N(v, 'e')}; ${v.st} − ${N(v, 'a')} − ${N(v, 'a') + N(v, 'e')} = ${a}.`,
  }),
  t({
    sub: 'u09-01',
    d: 2,
    prompt: 'ქარხანა დღეში {rt} დეტალს აწარმოებს. {days} დღეში გაიწარმოებულიდან {gt} დეტალი გაიგზავნა მომხმარებლებთან. რამდენი დეტალი დარჩა გასაგზავნი?',
    vars: { r: I(800, 2400, { step: 50 }), days: I(4, 9), g: I(1000, 3800, { step: 25 }), rt: S('r'), gt: S('g') },
    constraints: [{ test: (v) => N(v, 'g') < N(v, 'r') * N(v, 'days'), note: 'some left' }],
    answer: (v) => an(N(v, 'r') * N(v, 'days') - N(v, 'g'), ''),
    wrong: (v) => slips(N(v, 'r') * N(v, 'days') - N(v, 'g'), '', [N(v, 'r') * N(v, 'days'), N(v, 'r') * N(v, 'days') + N(v, 'g'), N(v, 'g') - N(v, 'r')]),
    why: (v, a) => `${v.rt} × ${v.days} = ${sg(N(v, 'r') * N(v, 'days'))}; ${sg(N(v, 'r') * N(v, 'days'))} − ${v.gt} = ${a}.`,
  }),

  // ═════════ U09.2 — ამოცანები დადებით და უარყოფით რიცხვებზე ═════════
  t({
    sub: 'u09-02',
    prompt: 'დილით ტემპერატურა იყო {x}°C, ხოლო შუადღეს გაიზარდა {r} გრადუსით. რა ტემპერატურა გახდა შუადღეს?',
    vars: { t0: I(-12, -2), r: I(5, 18), x: D((v) => sg(N(v, 't0'))) },
    answer: (v) => `${sg(N(v, 't0') + N(v, 'r'))}°C`,
    wrong: (v) => slips(N(v, 't0') + N(v, 'r'), '', [N(v, 'r') - N(v, 't0'), N(v, 't0') - N(v, 'r'), -N(v, 't0') - N(v, 'r'), N(v, 'r')]).map((x) => `${x}°C`),
    why: (v, a) => `${v.x} + ${v.r} = ${a}.`,
  }),
  t({
    sub: 'u09-02',
    prompt: 'მყვინთავი ზღვის დონიდან {a} მეტრით ქვემოთ იყო. შემდეგ კიდევ {b} მეტრით დაეშვა. რა რიცხვით გამოისახება მისი მდებარეობა ახლა, თუ ზღვის დონე 0-ია, ქვემოთ კი უარყოფითი რიცხვებია?',
    vars: { a: I(6, 40), b: I(4, 25) },
    answer: (v) => `${sg(-(N(v, 'a') + N(v, 'b')))} მ`,
    wrong: (v) => [N(v, 'a') + N(v, 'b'), -(N(v, 'a') - N(v, 'b')), N(v, 'a') - N(v, 'b'), -N(v, 'a'), -(N(v, 'a') + N(v, 'b')) - 10, -(N(v, 'a') + N(v, 'b')) + 10].map((x) => `${sg(x)} მ`),
    why: (v, a) => `−${v.a} − ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u09-02',
    prompt: 'ლიფტი იმ სართულზე იყო, რომლის ნომერია {f}. შემდეგ {d} სართულით ქვემოთ ჩავიდა (სარდაფები უარყოფითი ნომრებით აღინიშნება). რომელი ნომრის სართულზე აღმოჩნდა?',
    vars: { f: I(2, 6), d: I(7, 12) },
    answer: (v) => sg(N(v, 'f') - N(v, 'd')),
    wrong: (v) => [N(v, 'd') - N(v, 'f'), N(v, 'f') + N(v, 'd'), -(N(v, 'f') + N(v, 'd')), N(v, 'f') - N(v, 'd') + 1, N(v, 'f') - N(v, 'd') - 1].map(sg),
    why: (v, a) => `${v.f} − ${v.d} = ${a}.`,
  }),
  t({
    sub: 'u09-02',
    prompt: 'დილით ტემპერატურა იყო {x}°C, ღამით კი დაეცა {d} გრადუსით. რა გახდა ღამის ტემპერატურა?',
    vars: { t0: I(2, 14), d: I(10, 25), x: D((v) => sg(N(v, 't0'))) },
    constraints: [{ test: (v) => N(v, 'd') > N(v, 't0'), note: 'goes below zero' }],
    answer: (v) => `${sg(N(v, 't0') - N(v, 'd'))}°C`,
    wrong: (v) => [N(v, 'd') - N(v, 't0'), N(v, 't0') + N(v, 'd'), -(N(v, 't0') + N(v, 'd')), N(v, 't0') - N(v, 'd') + 2, N(v, 't0') - N(v, 'd') - 2].map((x) => `${sg(x)}°C`),
    why: (v, a) => `${v.x} − ${v.d} = ${a}.`,
  }),
  t({
    sub: 'u09-02',
    d: 2,
    prompt: 'ანგარიშზე არსებული თანხა შეიცვალა ასე: ჯერ დაემატა {a} ლარი, შემდეგ მოაკლდა {b} ლარი. თუ საწყისი ნაშთი იყო {s} ლარი, რა არის საბოლოო ნაშთი?',
    vars: { s: I(10, 40), a: I(20, 60), b: I(60, 140) },
    constraints: [{ test: (v) => N(v, 's') + N(v, 'a') - N(v, 'b') < 0, note: 'ends in debt' }],
    answer: (v) => `${sg(N(v, 's') + N(v, 'a') - N(v, 'b'))} ლარი`,
    wrong: (v) => [N(v, 'b') - N(v, 's') - N(v, 'a'), N(v, 's') + N(v, 'a') + N(v, 'b'), N(v, 's') - N(v, 'a') - N(v, 'b'), N(v, 's') + N(v, 'a') - N(v, 'b') + 10, N(v, 's') + N(v, 'a') - N(v, 'b') - 10].map((x) => `${sg(x)} ლარი`),
    why: (v, a) => `${v.s} + ${v.a} − ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u09-02',
    d: 2,
    prompt: 'მთა ზღვის დონიდან {ht} მეტრზეა, ხოლო წყალქვეშა სადგური ზღვის დონიდან {b} მეტრით ქვემოთ მდებარეობს. რამდენი მეტრია მათ შორის ვერტიკალური მანძილი?',
    vars: { h: I(800, 3200, { step: 50 }), b: I(30, 150, { step: 5 }), ht: S('h') },
    answer: (v) => an(N(v, 'h') + N(v, 'b'), 'მ'),
    wrong: (v) => slips(N(v, 'h') + N(v, 'b'), 'მ', [N(v, 'h') - N(v, 'b'), N(v, 'b')]),
    why: (v, a) => `${v.ht} + ${v.b} = ${a}.`,
  }),

  // ═════════ U09.3 — უტოლობები და შერეული მოქმედებები ═════════
  t({
    sub: 'u09-03',
    prompt: 'იპოვე x-ის უმცირესი მთელი მნიშვნელობა, რომლისთვისაც {e}.',
    vars: { a: I(2, 7), b: I(1, 9), c: I(14, 60), e: D((v) => `${N(v, 'a')}x + ${N(v, 'b')} > ${N(v, 'c')}`) },
    answer: (v) => sg(Math.floor((N(v, 'c') - N(v, 'b')) / N(v, 'a')) + 1),
    wrong: (v) => {
      const q = (N(v, 'c') - N(v, 'b')) / N(v, 'a');
      return [Math.ceil(q), Math.floor(q), Math.floor(q) + 2, Math.round(N(v, 'c') / N(v, 'a')), Math.ceil(q) + 1].map(sg);
    },
    why: (v, a) => `${v.e}: ${N(v, 'a')}x > ${N(v, 'c') - N(v, 'b')}, x > ${mText(fr(N(v, 'c') - N(v, 'b'), N(v, 'a')))}; უმცირესი მთელი ${a}.`,
  }),
  t({
    sub: 'u09-03',
    prompt: 'იპოვე x-ის უდიდესი მთელი მნიშვნელობა, რომლისთვისაც {e}.',
    vars: { a: I(2, 7), b: I(1, 9), c: I(12, 60), e: D((v) => `${N(v, 'a')}x − ${N(v, 'b')} < ${N(v, 'c')}`) },
    answer: (v) => sg(Math.ceil((N(v, 'c') + N(v, 'b')) / N(v, 'a')) - 1),
    wrong: (v) => {
      const q = (N(v, 'c') + N(v, 'b')) / N(v, 'a');
      return [Math.floor(q), Math.ceil(q), Math.floor(q) - 1 + 2, Math.round(N(v, 'c') / N(v, 'a')), Math.floor((N(v, 'c') - N(v, 'b')) / N(v, 'a'))].map(sg);
    },
    why: (v, a) => `${v.e}: ${N(v, 'a')}x < ${N(v, 'c') + N(v, 'b')}, x < ${mText(fr(N(v, 'c') + N(v, 'b'), N(v, 'a')))}; უდიდესი მთელი ${a}.`,
  }),
  t({
    sub: 'u09-03',
    d: 2,
    prompt: 'ამოხსენი უტოლობა: {e}. იპოვე x-ის უდიდესი მთელი მნიშვნელობა.',
    vars: { a: I(2, 6), b: I(2, 9), c: I(14, 60), e: D((v) => `${N(v, 'a')}(x + ${N(v, 'b')}) ≤ ${N(v, 'c')}`) },
    constraints: [{ test: (v) => N(v, 'c') >= N(v, 'a') * (N(v, 'b') + 1), note: 'x stays positive' }],
    answer: (v) => sg(Math.floor(N(v, 'c') / N(v, 'a')) - N(v, 'b')),
    wrong: (v) => {
      const q = N(v, 'c') / N(v, 'a');
      return [Math.floor(q), Math.floor(q) - N(v, 'b') - 1, Math.floor(q) + N(v, 'b'), Math.floor((N(v, 'c') - N(v, 'b')) / N(v, 'a')), Math.floor(q) - N(v, 'b') + 1].map(sg);
    },
    why: (v, a) => `${v.e}: x + ${N(v, 'b')} ≤ ${mText(fr(N(v, 'c'), N(v, 'a')))}, x ≤ ${mText(fr(N(v, 'c') - N(v, 'a') * N(v, 'b'), N(v, 'a')))}; უდიდესი მთელი ${a}.`,
  }),
  t({
    sub: 'u09-03',
    d: 2,
    prompt: 'იპოვე x-ის უმცირესი მთელი მნიშვნელობა, რომლისთვისაც {e}.',
    vars: { a: I(2, 8), b: I(2, 12), c: I(15, 60), e: D((v) => `${N(v, 'a')}x − ${N(v, 'b')} ≥ ${N(v, 'c')}`) },
    answer: (v) => sg(Math.ceil((N(v, 'c') + N(v, 'b')) / N(v, 'a'))),
    wrong: (v) => {
      const q = (N(v, 'c') + N(v, 'b')) / N(v, 'a');
      return [Math.floor(q), Math.ceil(q) + 1, Math.ceil((N(v, 'c') - N(v, 'b')) / N(v, 'a')), Math.floor(q) + 2, Math.ceil(q) - 1].map(sg);
    },
    why: (v, a) => `${v.e}: ${N(v, 'a')}x ≥ ${N(v, 'c') + N(v, 'b')}, x ≥ ${mText(fr(N(v, 'c') + N(v, 'b'), N(v, 'a')))}; უმცირესი მთელი ${a}.`,
  }),
  t({
    sub: 'u09-03',
    prompt: 'იპოვე x-ის უდიდესი მთელი მნიშვნელობა, რომლისთვისაც {e}.',
    vars: { a: I(2, 7), b: I(1, 9), c: I(10, 50), e: D((v) => `${N(v, 'a')}x + ${N(v, 'b')} < ${N(v, 'c')}`) },
    answer: (v) => sg(Math.ceil((N(v, 'c') - N(v, 'b')) / N(v, 'a')) - 1),
    wrong: (v) => {
      const q = (N(v, 'c') - N(v, 'b')) / N(v, 'a');
      return [Math.floor(q), Math.ceil(q), Math.floor(q) + 2, Math.round(N(v, 'c') / N(v, 'a')), Math.floor((N(v, 'c') + N(v, 'b')) / N(v, 'a'))].map(sg);
    },
    why: (v, a) => `${v.e}: ${N(v, 'a')}x < ${N(v, 'c') - N(v, 'b')}, x < ${mText(fr(N(v, 'c') - N(v, 'b'), N(v, 'a')))}; უდიდესი მთელი ${a}.`,
  }),
  t({
    sub: 'u09-03',
    d: 2,
    prompt: 'რიცხვი x გაამრავლეს რიცხვზე {a} და მიღებულ შედეგს გამოაკლეს {b}. შედეგი ნაკლებია რიცხვზე {c}. იპოვე x-ის უდიდესი მთელი მნიშვნელობა, თუ x არაუარყოფითი მთელი რიცხვია.',
    vars: { a: I(2, 7), b: I(2, 12), c: I(15, 50) },
    answer: (v) => sg(Math.ceil((N(v, 'c') + N(v, 'b')) / N(v, 'a')) - 1),
    wrong: (v) => {
      const q = (N(v, 'c') + N(v, 'b')) / N(v, 'a');
      return [Math.floor(q), Math.ceil(q), Math.floor(q) + 2, Math.floor((N(v, 'c') - N(v, 'b')) / N(v, 'a')), Math.round(N(v, 'c') / N(v, 'a'))].map(sg);
    },
    why: (v, a) => `${N(v, 'a')}x − ${N(v, 'b')} < ${N(v, 'c')}: x < ${mText(fr(N(v, 'c') + N(v, 'b'), N(v, 'a')))}; უდიდესი მთელი ${a}.`,
  }),

  // ═════════ U09.4 — ამოცანები წილადებზე ═════════
  ...(
    [
      ['ნინომ წიგნის {f1} ნაწილი ორშაბათს წაიკითხა, ხოლო {f2} ნაწილი — სამშაბათს. წიგნის რა ნაწილი დარჩა წასაკითხი?', ['2/5', '1/3', '1/4', '1/5', '3/10', '2/7', '1/6'], ['1/4', '1/5', '1/2', '1/3', '1/6', '1/8', '3/10']],
      ['ბაღის {f1} ნაწილი ვაშლის ხეებს უკავია, ხოლო {f2} ნაწილი — მსხლის ხეებს. ბაღის რა ნაწილი უკავია სხვა ხეებს?', ['2/7', '1/7', '3/7', '2/9', '4/9', '1/9'], ['3/7', '2/7', '1/7', '4/9', '2/9', '1/9']],
    ] as Array<[string, string[], string[]]>
  ).map(([text, p1, p2]) =>
    t({
      sub: 'u09-04',
      prompt: text,
      vars: { f1: C(p1), f2: C(p2) },
      constraints: [{ test: (v) => fAdd(fv(v, 'f1'), fv(v, 'f2')).n < fAdd(fv(v, 'f1'), fv(v, 'f2')).d, note: 'less than the whole' }],
      answer: (v) => mText(fSub(fSub(fr(1), fv(v, 'f1')), fv(v, 'f2'))),
      options: (v, right) => {
        const r = fSub(fSub(fr(1), fv(v, 'f1')), fv(v, 'f2'));
        return [right, ...fracSlips(r, [fAdd(fv(v, 'f1'), fv(v, 'f2')), fSub(fr(1), fv(v, 'f1')), fSub(fr(1), fv(v, 'f2'))])];
      },
      why: (v, a) => `${String(v.f1)} + ${String(v.f2)} = ${mText(fAdd(fv(v, 'f1'), fv(v, 'f2')))}; 1 − ${mText(fAdd(fv(v, 'f1'), fv(v, 'f2')))} = ${a}.`,
    }),
  ),
  t({
    sub: 'u09-04',
    prompt: 'ავზში წყლის {f1} ნაწილი იყო. გამოიყენეს ავზის სრული მოცულობის {f2} ნაწილი. ავზის რა ნაწილი დარჩა წყლით სავსე?',
    vars: { f1: C(['3/4', '2/3', '4/5', '5/6', '7/8', '3/5']), f2: C(['1/3', '1/4', '1/5', '1/2', '1/6', '1/8']) },
    constraints: [{ test: (v) => fSub(fv(v, 'f1'), fv(v, 'f2')).n > 0, note: 'water is left' }],
    answer: (v) => mText(fSub(fv(v, 'f1'), fv(v, 'f2'))),
    options: (v, right) => {
      const r = fSub(fv(v, 'f1'), fv(v, 'f2'));
      return [right, ...fracSlips(r, [fAdd(fv(v, 'f1'), fv(v, 'f2')), fSub(fr(1), fv(v, 'f2')), fr(Number(String(v.f1).split('/')[0]) - Number(String(v.f2).split('/')[0]), Number(String(v.f1).split('/')[1]) - Number(String(v.f2).split('/')[1]) || 1)])];
    },
    why: (v, a) => `${String(v.f1)} − ${String(v.f2)} = ${a}.`,
  }),
  ...(
    [
      'ტორტის {f1} ნაწილი სტუმრებმა შეჭამეს, შემდეგ კი დარჩენილი ტორტის {f2} ნაწილი შეჭამეს. ტორტის რა ნაწილი დარჩა?',
      'მოსწავლემ დავალების {f1} ნაწილი დილით შეასრულა, ხოლო დარჩენილი ნაწილის {f2} ნაწილი — საღამოს. დავალების რა ნაწილი დარჩა შეუსრულებელი?',
    ]
  ).map((text) =>
    t({
      sub: 'u09-04',
      d: 2,
      prompt: text,
      vars: { f1: C(['5/8', '2/9', '1/4', '2/5', '3/7', '1/6', '3/8']), f2: C(['1/3', '3/7', '1/5', '1/2', '2/3', '1/4']) },
      answer: (v) => mText(fMul(fSub(fr(1), fv(v, 'f1')), fSub(fr(1), fv(v, 'f2')))),
      options: (v, right) => {
        const r = fMul(fSub(fr(1), fv(v, 'f1')), fSub(fr(1), fv(v, 'f2')));
        return [right, ...fracSlips(r, [fSub(fSub(fr(1), fv(v, 'f1')), fv(v, 'f2')), fSub(fr(1), fv(v, 'f1')), fMul(fv(v, 'f1'), fv(v, 'f2'))])];
      },
      why: (v, a) => `დარჩა ${mText(fSub(fr(1), fv(v, 'f1')))}; ${mText(fSub(fr(1), fv(v, 'f1')))} × ${mText(fSub(fr(1), fv(v, 'f2')))} = ${a}.`,
    }),
  ),
  t({
    sub: 'u09-04',
    d: 2,
    prompt: 'ლენტა {L} მეტრი სიგრძისაა. ჯერ მისი {f1} ნაწილი მოჭრეს, შემდეგ კი დარჩენილი ლენტის {f2} ნაწილი. რამდენი მეტრი ლენტა დარჩა?',
    vars: { L: C([6, 12, 8, 9, 10, 15]), f1: C(['1/3', '1/4', '1/2', '1/5', '2/3']), f2: C(['1/4', '1/3', '1/2', '1/5', '3/4']) },
    answer: (v) => `${mText(fMul(fr(N(v, 'L')), fMul(fSub(fr(1), fv(v, 'f1')), fSub(fr(1), fv(v, 'f2')))))} მ`,
    options: (v, right) => {
      const L = fr(N(v, 'L'));
      const r = fMul(L, fMul(fSub(fr(1), fv(v, 'f1')), fSub(fr(1), fv(v, 'f2'))));
      return [right, ...fracSlips(r, [fMul(L, fSub(fSub(fr(1), fv(v, 'f1')), fv(v, 'f2'))), fMul(L, fSub(fr(1), fv(v, 'f1'))), fMul(L, fMul(fv(v, 'f1'), fv(v, 'f2')))]).map((x) => `${x} მ`)];
    },
    why: (v, a) => `მოჭრის შემდეგ: ${N(v, 'L')} × ${mText(fSub(fr(1), fv(v, 'f1')))} = ${mText(fMul(fr(N(v, 'L')), fSub(fr(1), fv(v, 'f1'))))}; ${mText(fMul(fr(N(v, 'L')), fSub(fr(1), fv(v, 'f1'))))} × ${mText(fSub(fr(1), fv(v, 'f2')))} = ${a}.`,
  }),

  // ═════════ U09.5 — ამოცანები ათწილადებზე ═════════
  t({
    sub: 'u09-05',
    prompt: 'ნინომ იყიდა {w1t} კგ ვაშლი, თითოეული კილოგრამი {c1t} ლარად, და {w2t} კგ მსხალი, თითოეული კილოგრამი {c2t} ლარად. რამდენი გადაიხადა სულ?',
    vars: { w1: C([15, 25, 35, 20, 30]), w2: C([15, 25, 5, 10, 20]), c1: C([320, 280, 240, 360]), c2: C([480, 420, 560, 360]), w1t: D((v) => dd(N(v, 'w1'), 1)), w2t: D((v) => dd(N(v, 'w2'), 1)), c1t: D((v) => fx(N(v, 'c1'), 2)), c2t: D((v) => fx(N(v, 'c2'), 2)) },
    answer: (v) => dm((N(v, 'w1') * N(v, 'c1') + N(v, 'w2') * N(v, 'c2')) / 1000, 'ლარი'),
    wrong: (v) => dslips((N(v, 'w1') * N(v, 'c1') + N(v, 'w2') * N(v, 'c2')) / 1000, 'ლარი', [(N(v, 'w1') + N(v, 'w2')) * N(v, 'c1') / 1000, N(v, 'w1') * N(v, 'c1') / 1000]),
    why: (v, a) => `${v.w1t} × ${v.c1t} = ${ds((N(v, 'w1') * N(v, 'c1')) / 1000)}; ${v.w2t} × ${v.c2t} = ${ds((N(v, 'w2') * N(v, 'c2')) / 1000)}; ჯამი ${a}.`,
  }),
  t({
    sub: 'u09-05',
    prompt: 'ავტომობილმა პირველ დღეს გაიარა {at} კმ, ხოლო მეორე დღეს — {bt} კმ. რამდენი კილომეტრი გაიარა სულ?',
    vars: { a: I(901, 2999), b: I(5001, 9999), at: D((v) => fx(N(v, 'a'), 1)), bt: D((v) => fx(N(v, 'b'), 2)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0, note: 'no trailing zero' }],
    answer: (v) => dm((N(v, 'a') * 10 + N(v, 'b')) / 100, 'კმ'),
    wrong: (v) => dslips((N(v, 'a') * 10 + N(v, 'b')) / 100, 'კმ', [(N(v, 'a') + N(v, 'b')) / 10, (N(v, 'a') + N(v, 'b')) / 100]),
    why: (v, a) => `${v.at} + ${v.bt} = ${a}.`,
  }),
  t({
    sub: 'u09-05',
    d: 2,
    prompt: 'წყლის ავზში {st} ლიტრი წყალი იყო. დაამატეს {at} ლიტრი და შემდეგ გამოიყენეს {ut} ლიტრი. რამდენი ლიტრი წყალი დარჩა?',
    vars: { s: I(301, 799), a: I(1001, 2999), u: I(101, 499), st: D((v) => fx(N(v, 's'), 1)), at: D((v) => fx(N(v, 'a'), 2)), ut: D((v) => fx(N(v, 'u'), 1)) },
    constraints: [{ test: (v) => N(v, 's') % 10 !== 0 && N(v, 'a') % 10 !== 0 && N(v, 'u') % 10 !== 0 && N(v, 'a') > 1000 && N(v, 's') * 10 + N(v, 'a') > N(v, 'u') * 10, note: 'tidy decimals, some water left' }],
    answer: (v) => dm((N(v, 's') * 10 + N(v, 'a') - N(v, 'u') * 10) / 100, 'ლ'),
    wrong: (v) => dslips((N(v, 's') * 10 + N(v, 'a') - N(v, 'u') * 10) / 100, 'ლ', [(N(v, 's') * 10 - N(v, 'a') - N(v, 'u') * 10) / 100, (N(v, 's') * 10 + N(v, 'a') + N(v, 'u') * 10) / 100]),
    why: (v, a) => `${v.st} + ${v.at} = ${ds((N(v, 's') * 10 + N(v, 'a')) / 100)}; ${ds((N(v, 's') * 10 + N(v, 'a')) / 100)} − ${v.ut} = ${a}.`,
  }),
  t({
    sub: 'u09-05',
    d: 2,
    prompt: 'ერთი ქსოვილის ნაჭერი {lt} მეტრია. მისგან მოჭრეს {at} მეტრი, შემდეგ კი — {bt} მეტრი. რამდენი მეტრი ქსოვილი დარჩა?',
    vars: { l: I(101, 199), a: I(301, 499), b: I(21, 59), lt: D((v) => fx(N(v, 'l'), 1)), at: D((v) => fx(N(v, 'a'), 2)), bt: D((v) => fx(N(v, 'b'), 1)) },
    constraints: [{ test: (v) => N(v, 'l') % 10 !== 0 && N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0 && N(v, 'l') * 10 > N(v, 'a') + N(v, 'b') * 10, note: 'cloth left' }],
    answer: (v) => dm((N(v, 'l') * 10 - N(v, 'a') - N(v, 'b') * 10) / 100, 'მ'),
    wrong: (v) => dslips((N(v, 'l') * 10 - N(v, 'a') - N(v, 'b') * 10) / 100, 'მ', [(N(v, 'l') * 10 + N(v, 'a') - N(v, 'b') * 10) / 100]),
    why: (v, a) => `${v.lt} − ${v.at} − ${v.bt} = ${a}.`,
  }),
  t({
    sub: 'u09-05',
    d: 2,
    prompt: 'ერთი ბოთლი წვენი {vt} ლიტრს შეიცავს. რამდენი ლიტრი წვენი დარჩება {k} ასეთ ბოთლში, თუ {ut} ლიტრი დაილია?',
    vars: { vv: C([125, 150, 175, 225, 250, 75]), k: I(4, 9), u: C([25, 35, 45, 15]), vt: D((v) => fx(N(v, 'vv'), 2)), ut: D((v) => dd(N(v, 'u'), 1)) },
    answer: (v) => dm((N(v, 'vv') * N(v, 'k') - N(v, 'u') * 10) / 100, 'ლ'),
    wrong: (v) => dslips((N(v, 'vv') * N(v, 'k') - N(v, 'u') * 10) / 100, 'ლ', [N(v, 'vv') * N(v, 'k') / 100, (N(v, 'vv') * N(v, 'k') + N(v, 'u') * 10) / 100]),
    why: (v, a) => `${v.vt} × ${v.k} = ${ds((N(v, 'vv') * N(v, 'k')) / 100)}; ${ds((N(v, 'vv') * N(v, 'k')) / 100)} − ${v.ut} = ${a}.`,
  }),
  t({
    sub: 'u09-05',
    prompt: 'მორბენალმა პირველ წრეზე {at} წუთი დახარჯა, მეორეზე — {bt} წუთი, მესამეზე კი — {ct} წუთი. რამდენი წუთი დასჭირდა სამივე წრეს?',
    vars: { a: I(201, 299), b: I(201, 299), c: I(201, 299), at: D((v) => fx(N(v, 'a'), 2)), bt: D((v) => fx(N(v, 'b'), 2)), ct: D((v) => fx(N(v, 'c'), 2)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0 && N(v, 'c') % 10 !== 0, note: 'no trailing zero' }],
    answer: (v) => dm((N(v, 'a') + N(v, 'b') + N(v, 'c')) / 100, 'წუთი'),
    wrong: (v) => dslips((N(v, 'a') + N(v, 'b') + N(v, 'c')) / 100, 'წუთი', [(N(v, 'a') + N(v, 'b') + N(v, 'c')) / 10]),
    why: (v, a) => `${v.at} + ${v.bt} + ${v.ct} = ${a}.`,
  }),

  // ═════════ U09.6 — შერეული ამოცანები ═════════
  t({
    sub: 'u09-06',
    prompt: 'მაღაზიამ მიიღო {b} ყუთი ფორთოხალი, თითოეულში {k} კგ. დღის განმავლობაში გაყიდა {s} კგ. რამდენი კილოგრამი ფორთოხალი დარჩა?',
    vars: { b: I(10, 30), k: C([12, 15, 18, 20, 24, 25]), s: I(100, 280, { step: 5 }) },
    constraints: [{ test: (v) => N(v, 's') < N(v, 'b') * N(v, 'k') - 10, note: 'something left' }],
    answer: (v) => an(N(v, 'b') * N(v, 'k') - N(v, 's'), 'კგ'),
    wrong: (v) => slips(N(v, 'b') * N(v, 'k') - N(v, 's'), 'კგ', [N(v, 'b') * N(v, 'k'), N(v, 'b') * N(v, 'k') + N(v, 's')]),
    why: (v, a) => `${v.b} × ${v.k} = ${N(v, 'b') * N(v, 'k')}; ${N(v, 'b') * N(v, 'k')} − ${v.s} = ${a}.`,
  }),
  t({
    sub: 'u09-06',
    prompt: 'მოსწავლემ პირველი კვირის განმავლობაში წაიკითხა წიგნის {f1} ნაწილი, მეორე კვირაში — {f2} ნაწილი. წიგნის რა ნაწილი დარჩა წასაკითხი?',
    vars: { f1: C(['1/3', '1/2', '2/5', '1/4', '3/8']), f2: C(['1/4', '1/5', '1/6', '1/3', '1/8']) },
    constraints: [{ test: (v) => fAdd(fv(v, 'f1'), fv(v, 'f2')).n < fAdd(fv(v, 'f1'), fv(v, 'f2')).d, note: 'less than the whole' }],
    answer: (v) => mText(fSub(fSub(fr(1), fv(v, 'f1')), fv(v, 'f2'))),
    options: (v, right) => [right, ...fracSlips(fSub(fSub(fr(1), fv(v, 'f1')), fv(v, 'f2')), [fAdd(fv(v, 'f1'), fv(v, 'f2')), fSub(fr(1), fv(v, 'f1'))])],
    why: (v, a) => `${String(v.f1)} + ${String(v.f2)} = ${mText(fAdd(fv(v, 'f1'), fv(v, 'f2')))}; 1 − ${mText(fAdd(fv(v, 'f1'), fv(v, 'f2')))} = ${a}.`,
  }),
  t({
    sub: 'u09-06',
    d: 2,
    prompt: 'ოჯახმა თვეში დახარჯა {at} ლარი საკვებზე, {bt} ლარი ტრანსპორტზე და {ct} ლარი კომუნალურ გადასახადებზე. თუ ოჯახის თვიური ბიუჯეტი {total} ლარია, რამდენი ლარი დარჩა?',
    vars: { a: I(600, 1000, { step: 10 }), b: I(200, 400, { step: 10 }), c: I(150, 350, { step: 5 }), tot: C([1800, 2000, 2200, 2500]), at: S('a'), bt: S('b'), ct: S('c'), total: S('tot') },
    constraints: [{ test: (v) => N(v, 'a') + N(v, 'b') + N(v, 'c') < N(v, 'tot'), note: 'something left' }],
    answer: (v) => an(N(v, 'tot') - N(v, 'a') - N(v, 'b') - N(v, 'c'), 'ლარი'),
    wrong: (v) => slips(N(v, 'tot') - N(v, 'a') - N(v, 'b') - N(v, 'c'), 'ლარი', [N(v, 'a') + N(v, 'b') + N(v, 'c'), N(v, 'tot') - N(v, 'a') - N(v, 'b')]),
    why: (v, a) => `${v.at} + ${v.bt} + ${v.ct} = ${sg(N(v, 'a') + N(v, 'b') + N(v, 'c'))}; ${v.total} − ${sg(N(v, 'a') + N(v, 'b') + N(v, 'c'))} = ${a}.`,
  }),
  t({
    sub: 'u09-06',
    d: 2,
    prompt: 'მართკუთხედის სიგრძეა {lt} სმ, ხოლო სიგანე — {wt} სმ. იპოვე მისი პერიმეტრი და ფართობი.',
    vars: { l: C([125, 85, 65, 95, 75, 105]), w: C([48, 36, 24, 52, 28, 44]), lt: D((v) => dd(N(v, 'l'), 1)), wt: D((v) => dd(N(v, 'w'), 1)) },
    answer: (v) => `პერიმეტრი ${dd(2 * (N(v, 'l') + N(v, 'w')), 1)} სმ; ფართობი ${dd(N(v, 'l') * N(v, 'w'), 2)} სმ²`,
    options: (v, right) => {
      const l = N(v, 'l'), w = N(v, 'w');
      const P = dd(2 * (l + w), 1), S = dd(l * w, 2);
      return [right, `პერიმეტრი ${S} სმ; ფართობი ${P} სმ²`, `პერიმეტრი ${dd(l + w, 1)} სმ; ფართობი ${S} სმ²`, `პერიმეტრი ${P} სმ; ფართობი ${dd(l * w, 1)} სმ²`, `პერიმეტრი ${dd(2 * l + w, 1)} სმ; ფართობი ${S} სმ²`, `პერიმეტრი ${P} სმ; ფართობი ${dd(l * w, 3)} სმ²`];
    },
    why: (v, a) => `P = 2 × (${v.lt} + ${v.wt}); S = ${v.lt} × ${v.wt}. ${a}.`,
  }),
  t({
    sub: 'u09-06',
    d: 2,
    prompt: 'საწყობში იყო {n} კგ ბრინჯი. პირველ დღეს გაიყიდა მისი {f1} ნაწილი, მეორე დღეს კი — დარჩენილი რაოდენობის {f2} ნაწილი. რამდენი კილოგრამი ბრინჯი დარჩა?',
    vars: { n: C([120, 240, 360, 480, 180, 300, 600]), f1: C(['1/4', '1/3', '1/5', '1/2', '2/5']), f2: C(['1/3', '1/4', '1/2', '1/5', '2/3']) },
    constraints: [{ test: (v) => fMul(fr(N(v, 'n')), fMul(fSub(fr(1), fv(v, 'f1')), fSub(fr(1), fv(v, 'f2')))).d === 1 && fMul(fr(N(v, 'n')), fv(v, 'f1')).d === 1, note: 'whole kilograms' }],
    answer: (v) => an(fMul(fr(N(v, 'n')), fMul(fSub(fr(1), fv(v, 'f1')), fSub(fr(1), fv(v, 'f2')))).n, 'კგ'),
    wrong: (v) => {
      const n = fr(N(v, 'n'));
      const r = fMul(n, fMul(fSub(fr(1), fv(v, 'f1')), fSub(fr(1), fv(v, 'f2')))).n;
      return slips(r, 'კგ', [fMul(n, fSub(fSub(fr(1), fv(v, 'f1')), fv(v, 'f2'))).n / fMul(n, fSub(fSub(fr(1), fv(v, 'f1')), fv(v, 'f2'))).d, fMul(n, fSub(fr(1), fv(v, 'f1'))).n, fMul(n, fv(v, 'f1')).n]);
    },
    why: (v, a) => `პირველ დღეს დარჩა ${N(v, 'n')} × ${mText(fSub(fr(1), fv(v, 'f1')))} = ${fMul(fr(N(v, 'n')), fSub(fr(1), fv(v, 'f1'))).n}; შემდეგ ${fMul(fr(N(v, 'n')), fSub(fr(1), fv(v, 'f1'))).n} × ${mText(fSub(fr(1), fv(v, 'f2')))} = ${a}.`,
  }),
  t({
    sub: 'u09-06',
    d: 2,
    prompt: 'ავტობუსში {n} მგზავრი იყო. პირველ გაჩერებაზე ჩამოვიდა მგზავრების {f} ნაწილი და ავიდა {k} მგზავრი. რამდენი მგზავრია ავტობუსში ახლა?',
    vars: { n: C([48, 36, 40, 60, 24, 32]), f: C(['1/4', '1/3', '1/2', '1/5', '3/4', '1/6']), k: I(4, 15) },
    constraints: [{ test: (v) => fMul(fr(N(v, 'n')), fv(v, 'f')).d === 1, note: 'whole passengers' }],
    answer: (v) => String(N(v, 'n') - fMul(fr(N(v, 'n')), fv(v, 'f')).n + N(v, 'k')),
    wrong: (v) => {
      const off = fMul(fr(N(v, 'n')), fv(v, 'f')).n;
      return [N(v, 'n') - off - N(v, 'k'), N(v, 'n') + off + N(v, 'k'), N(v, 'n') - off, N(v, 'n') + N(v, 'k'), off + N(v, 'k')].filter((x) => x > 0).map(String);
    },
    why: (v, a) => `ჩამოვიდა ${N(v, 'n')} × ${String(v.f)} = ${fMul(fr(N(v, 'n')), fv(v, 'f')).n}; ${N(v, 'n')} − ${fMul(fr(N(v, 'n')), fv(v, 'f')).n} + ${v.k} = ${a}.`,
  }),

  // ═════════ U09.7 — ამოცანების მიახლოებითი გამოთვლა ═════════
  t({
    sub: 'u09-07',
    prompt: 'შეაფასე {a} + {b} გამოსახულების მნიშვნელობა რიცხვების უახლოეს ასეულამდე დამრგვალებით.',
    vars: { a: I(120, 940), b: I(120, 940) },
    constraints: [{ test: (v) => N(v, 'a') % 100 !== 50 && N(v, 'b') % 100 !== 50 && N(v, 'a') % 100 > 10 && N(v, 'b') % 100 > 10, note: 'no ties' }],
    answer: (v) => sg(Math.round(N(v, 'a') / 100) * 100 + Math.round(N(v, 'b') / 100) * 100),
    wrong: (v) => {
      const r = Math.round(N(v, 'a') / 100) * 100 + Math.round(N(v, 'b') / 100) * 100;
      return [r + 100, r - 100, N(v, 'a') + N(v, 'b'), Math.floor(N(v, 'a') / 100) * 100 + Math.floor(N(v, 'b') / 100) * 100, r + 200, r * 10].map(sg);
    },
    why: (v, a) => `${v.a} ≈ ${Math.round(N(v, 'a') / 100) * 100}, ${v.b} ≈ ${Math.round(N(v, 'b') / 100) * 100}; ${a}.`,
  }),
  t({
    sub: 'u09-07',
    prompt: 'შეაფასე {a} × {b} ნამრავლი თითოეული რიცხვის უახლოეს ათეულამდე დამრგვალებით.',
    vars: { a: I(21, 89), b: I(11, 79) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 5 && N(v, 'b') % 10 !== 5 && N(v, 'a') % 10 !== 0 && N(v, 'b') % 10 !== 0, note: 'no ties' }],
    answer: (v) => sg(Math.round(N(v, 'a') / 10) * Math.round(N(v, 'b') / 10) * 100),
    wrong: (v) => {
      const r = Math.round(N(v, 'a') / 10) * Math.round(N(v, 'b') / 10) * 100;
      return [r / 10, r * 10, N(v, 'a') * N(v, 'b'), Math.floor(N(v, 'a') / 10) * Math.floor(N(v, 'b') / 10) * 100, r + 100, r - 100].map(sg);
    },
    why: (v, a) => `${v.a} ≈ ${Math.round(N(v, 'a') / 10) * 10}, ${v.b} ≈ ${Math.round(N(v, 'b') / 10) * 10}; ${Math.round(N(v, 'a') / 10) * 10} × ${Math.round(N(v, 'b') / 10) * 10} = ${a}.`,
  }),
  t({
    sub: 'u09-07',
    prompt: 'შეაფასე {a} ÷ {b} განაყოფი, რიცხვების შესაბამისად {x} და {y} რიცხვებამდე დამრგვალებით.',
    vars: { y: C([20, 30, 40, 50]), m: I(6, 30), x: D((v) => N(v, 'y') * N(v, 'm')), a: D((v) => N(v, 'x') + (N(v, 'm') % 2 === 0 ? 2 : -2)), b: D((v) => N(v, 'y') + (N(v, 'm') % 3 === 0 ? 1 : -1)) },
    answer: (v) => String(N(v, 'm')),
    wrong: (v) => [N(v, 'm') + 1, N(v, 'm') - 1, N(v, 'm') * 10, N(v, 'm') / 10, N(v, 'm') + 2].map(String),
    why: (v, a) => `${v.x} ÷ ${v.y} = ${a}.`,
  }),
  t({
    sub: 'u09-07',
    prompt: 'მაღაზიაში ერთი ნივთი დაახლოებით {p} ლარი ღირს. რამდენი ლარი დასჭირდება დაახლოებით {k} ასეთი ნივთის შესაძენად?',
    vars: { p: C([19, 29, 39, 49, 99, 21, 31, 18, 28]), k: I(4, 9) },
    answer: (v) => `${sg(Math.round(N(v, 'p') / 10) * 10 * N(v, 'k'))} ლარი`,
    wrong: (v) => {
      const r = Math.round(N(v, 'p') / 10) * 10 * N(v, 'k');
      return [r + N(v, 'k'), r - N(v, 'k'), r / 10, r * 10, N(v, 'p') * N(v, 'k'), r + 10].map((x) => `${sg(x)} ლარი`);
    },
    why: (v, a) => `${v.p} ≈ ${Math.round(N(v, 'p') / 10) * 10}; ${Math.round(N(v, 'p') / 10) * 10} × ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u09-07',
    d: 2,
    prompt: 'შეაფასე {a} + {b} + {c} ჯამის მნიშვნელობა თითოეული რიცხვის უახლოეს მთელ რიცხვამდე დამრგვალებით.',
    vars: { a: I(101, 989), b: I(101, 989), c: I(101, 989), at: D((v) => fx(N(v, 'a'), 2)) },
    constraints: [{ test: (v) => [N(v, 'a'), N(v, 'b'), N(v, 'c')].every((x) => x % 100 !== 50 && x % 100 > 4 && x % 100 < 96), note: 'no ties' }],
    answer: (v) => String([N(v, 'a'), N(v, 'b'), N(v, 'c')].reduce((s, x) => s + Math.round(x / 100), 0)),
    wrong: (v) => {
      const xs = [N(v, 'a'), N(v, 'b'), N(v, 'c')];
      const r = xs.reduce((s, x) => s + Math.round(x / 100), 0);
      return [r + 1, r - 1, xs.reduce((s, x) => s + Math.floor(x / 100), 0), r * 10, r + 2].map(String);
    },
    why: (v, a) => `${[N(v, 'a'), N(v, 'b'), N(v, 'c')].map((x) => Math.round(x / 100)).join(' + ')} = ${a}.`,
  }),
  t({
    sub: 'u09-07',
    d: 2,
    prompt: '{n} მოსწავლე უნდა გადანაწილდეს ჯგუფებში, თითოეულში დაახლოებით {g} მოსწავლით. დაახლოებით რამდენი ჯგუფი იქნება საჭირო?',
    vars: { g: C([20, 30, 25, 50]), m: I(5, 20), n: D((v) => N(v, 'g') * N(v, 'm') + (N(v, 'm') % 2 === 0 ? 3 : -3)) },
    answer: (v) => String(N(v, 'm')),
    wrong: (v) => [N(v, 'm') + 1, N(v, 'm') - 1, N(v, 'm') * 10, N(v, 'm') + 2, N(v, 'm') - 2].map(String),
    why: (v, a) => `${v.n} ≈ ${N(v, 'g') * N(v, 'm')}; ${N(v, 'g') * N(v, 'm')} ÷ ${v.g} = ${a}.`,
  }),

  // ═════════ U09.8 — ზედმეტი ან არასაკმარისი მონაცემები ═════════
  t({
    sub: 'u09-08',
    prompt: 'მაღაზიაში {b} ყუთია, თითოეულში {k} ვაშლი. ერთი ვაშლი {p} ლარი ღირს. რამდენი ვაშლია სულ? რომელი მონაცემია ზედმეტი?',
    vars: { b: I(6, 20), k: I(12, 36), p: I(2, 6) },
    answer: (v) => `${N(v, 'b') * N(v, 'k')} ვაშლი; ზედმეტია ვაშლის ფასი`,
    options: (v, right) => {
      const s = N(v, 'b') * N(v, 'k');
      return [right, `${N(v, 'b') + N(v, 'k')} ვაშლი; ზედმეტია ვაშლის ფასი`, `${s} ვაშლი; ზედმეტია ყუთების რაოდენობა`, `${s} ვაშლი; ზედმეტია ვაშლების რაოდენობა ყუთში`, `${s * N(v, 'p')} ვაშლი; ზედმეტი მონაცემი არ არის`];
    },
    why: (v, a) => `${v.b} × ${v.k} = ${N(v, 'b') * N(v, 'k')}; ფასი არ გვჭირდება: ${a}.`,
  }),
  t({
    sub: 'u09-08',
    prompt: 'მართკუთხედის სიგრძეა {l} სმ, სიგანე — {w} სმ, ხოლო წითელი ფანქარი {p} ლარი ღირს. იპოვე მართკუთხედის ფართობი. რომელი მონაცემი არ გჭირდება?',
    vars: { l: I(6, 15), w: I(3, 9), p: I(2, 6) },
    constraints: [{ test: (v) => N(v, 'l') !== N(v, 'w'), note: 'a rectangle, not a square' }],
    answer: (v) => `${N(v, 'l') * N(v, 'w')} სმ²; არ გჭირდება ფანქრის ფასი`,
    options: (v, right) => {
      const s = N(v, 'l') * N(v, 'w');
      return [right, `${2 * (N(v, 'l') + N(v, 'w'))} სმ²; არ გჭირდება ფანქრის ფასი`, `${s} სმ²; არ გჭირდება სიგანე`, `${s} სმ²; არ გჭირდება სიგრძე`, `${s * N(v, 'p')} სმ²; არ გჭირდება სიგანე`];
    },
    why: (v, a) => `S = ${v.l} × ${v.w} = ${N(v, 'l') * N(v, 'w')}; ფასი არ გჭირდება: ${a}.`,
  }),
  t({
    sub: 'u09-08',
    prompt: 'ავტობუსში {s} მგზავრი იყო. პირველ გაჩერებაზე {a} ჩამოვიდა, ხოლო მეორეზე {b} ავიდა. ავტობუსის ნომერია {no}. რამდენი მგზავრი დარჩა ავტობუსში? რომელი მონაცემია ზედმეტი?',
    vars: { s: I(25, 60), a: I(5, 20), b: I(4, 18), no: I(11, 99) },
    answer: (v) => `${N(v, 's') - N(v, 'a') + N(v, 'b')} მგზავრი; ზედმეტია ავტობუსის ნომერი`,
    options: (v, right) => {
      const r = N(v, 's') - N(v, 'a') + N(v, 'b');
      return [right, `${N(v, 's') - N(v, 'a') - N(v, 'b')} მგზავრი; ზედმეტია ავტობუსის ნომერი`, `${r} მგზავრი; ზედმეტია პირველი გაჩერება`, `${r} მგზავრი; ზედმეტია მგზავრების საწყისი რაოდენობა`, `${r + N(v, 'no')} მგზავრი; ზედმეტი მონაცემი არ არის`];
    },
    why: (v, a) => `${v.s} − ${v.a} + ${v.b} = ${N(v, 's') - N(v, 'a') + N(v, 'b')}; ნომერი არ გვჭირდება: ${a}.`,
  }),
  t({
    sub: 'u09-08',
    d: 2,
    prompt: 'მაღაზიაში {b} ყუთი ფორთოხალია, თითოეულში {k} კგ. რამდენი კილოგრამი ფორთოხალია სულ? საკმარისია თუ არა ეს მონაცემები ამოცანის ამოსახსნელად?',
    vars: { b: I(3, 12), k: I(10, 30) },
    answer: (v) => `${N(v, 'b') * N(v, 'k')} კგ; მონაცემები საკმარისია`,
    options: (v, right) => {
      const s = N(v, 'b') * N(v, 'k');
      return [right, `${s} კგ; მონაცემები არ არის საკმარისი`, `${N(v, 'b') + N(v, 'k')} კგ; მონაცემები საკმარისია`, `${s * 10} კგ; მონაცემები საკმარისია`, `${N(v, 'b') + N(v, 'k')} კგ; მონაცემები არ არის საკმარისი`];
    },
    why: (v, a) => `${v.b} × ${v.k} = ${N(v, 'b') * N(v, 'k')}: ${a}.`,
  }),
  t({
    sub: 'u09-08',
    d: 2,
    prompt: 'მოსწავლემ იყიდა {k} რვეული, თითოეული {p} ლარად, და {m} კალამი. სულ გადაიხადა {tot} ლარი. რამდენი ღირდა ერთი კალამი, თუ ყველა კალამი ერთნაირი ფასისაა?',
    vars: { k: I(2, 5), p: I(3, 6), m: C([2, 3, 4]), c: I(2, 7), tot: D((v) => N(v, 'k') * N(v, 'p') + N(v, 'm') * N(v, 'c')) },
    answer: (v) => `${N(v, 'c')} ლარი`,
    wrong: (v) => [N(v, 'tot') / N(v, 'm'), N(v, 'tot') - N(v, 'k') * N(v, 'p'), N(v, 'c') + 1, N(v, 'c') - 1, N(v, 'c') + 2, (N(v, 'tot') - N(v, 'p')) / N(v, 'm')].filter((x) => Number.isInteger(x) && x > 0).map((x) => `${x} ლარი`),
    why: (v, a) => `${v.tot} − ${v.k} × ${v.p} = ${N(v, 'tot') - N(v, 'k') * N(v, 'p')}; ${N(v, 'tot') - N(v, 'k') * N(v, 'p')} ÷ ${v.m} = ${a}.`,
  }),
  t({
    sub: 'u09-08',
    d: 2,
    prompt: 'მანქანამ {t} საათში გაიარა {dst} კმ. რამდენი კილომეტრი გაიარა საშუალოდ ერთ საათში? რომელი მონაცემი არ არის საჭირო: საწვავის ფასი, მგზავრობის დრო თუ გავლილი მანძილი?',
    vars: { t: I(2, 6), v: C([40, 50, 60, 70, 80, 90]), dst: D((v) => N(v, 't') * N(v, 'v')) },
    answer: (v) => `${N(v, 'v')} კმ; არ არის საჭირო საწვავის ფასი`,
    options: (v, right) => [right, `${N(v, 'dst') * N(v, 't')} კმ; არ არის საჭირო საწვავის ფასი`, `${N(v, 'v')} კმ; არ არის საჭირო მგზავრობის დრო`, `${N(v, 'v')} კმ; არ არის საჭირო გავლილი მანძილი`, `${N(v, 'dst') - N(v, 't')} კმ; არ არის საჭირო საწვავის ფასი`],
    why: (v, a) => `${v.dst} ÷ ${v.t} = ${N(v, 'v')}; ფასი არ გვჭირდება: ${a}.`,
  }),

  // ═════════ U09.9 — დრო, სიჩქარე და მანძილი ═════════
  t({
    sub: 'u09-09',
    prompt: 'ავტომობილი მოძრაობს {v} კმ/სთ სიჩქარით. რა მანძილს გაივლის {t} საათში?',
    vars: { v: C([40, 50, 60, 70, 80, 90, 100]), t: I(2, 6) },
    answer: (v) => an(N(v, 'v') * N(v, 't'), 'კმ'),
    wrong: (v) => slips(N(v, 'v') * N(v, 't'), 'კმ', [N(v, 'v') + N(v, 't'), N(v, 'v') / N(v, 't')]),
    why: (v, a) => `${v.v} × ${v.t} = ${a}.`,
  }),
  t({
    sub: 'u09-09',
    prompt: 'ველოსიპედისტმა {dst} კმ {t} საათში გაიარა. რა იყო მისი საშუალო სიჩქარე?',
    vars: { t: I(2, 6), v: I(10, 30), dst: D((v) => N(v, 't') * N(v, 'v')) },
    answer: (v) => `${N(v, 'v')} კმ/სთ`,
    wrong: (v) => [N(v, 'dst') * N(v, 't'), N(v, 'dst') - N(v, 't'), N(v, 'v') + 1, N(v, 'v') - 1, N(v, 'v') + 2, N(v, 't')].filter((x) => x > 0).map((x) => `${x} კმ/სთ`),
    why: (v, a) => `${v.dst} ÷ ${v.t} = ${a}.`,
  }),
  t({
    sub: 'u09-09',
    prompt: 'მატარებელი მოძრაობს {v} კმ/სთ სიჩქარით. რამდენი დრო დასჭირდება {dst} კმ-ის გასავლელად?',
    vars: { v: C([60, 90, 80, 120, 70, 100]), t: I(2, 7), dst: D((v) => N(v, 'v') * N(v, 't')) },
    answer: (v) => an(N(v, 't'), 'საათი'),
    wrong: (v) => [N(v, 't') * 2, N(v, 't') + 1, N(v, 't') - 1, N(v, 't') + 2, N(v, 'dst') - N(v, 'v')].filter((x) => x > 0).map((x) => `${x} საათი`),
    why: (v, a) => `${v.dst} ÷ ${v.v} = ${a}.`,
  }),
  t({
    sub: 'u09-09',
    d: 2,
    prompt: 'ავტობუსი {h1}:{m1} საათზე გავიდა და დანიშნულების ადგილზე {h2}:{m2} საათზე მივიდა. რამდენ ხანს გაგრძელდა მგზავრობა?',
    vars: { H1: I(6, 10), M1: C([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]), dur: I(65, 290), h1: D((v) => String(N(v, 'H1')).padStart(2, '0')), m1: D((v) => String(N(v, 'M1')).padStart(2, '0')), h2: D((v) => String(Math.floor((N(v, 'H1') * 60 + N(v, 'M1') + N(v, 'dur')) / 60)).padStart(2, '0')), m2: D((v) => String((N(v, 'M1') + N(v, 'dur')) % 60).padStart(2, '0')) },
    constraints: [{ test: (v) => N(v, 'dur') % 5 === 0 && N(v, 'dur') % 60 !== 0 && (N(v, 'M1') + N(v, 'dur')) % 60 !== 0, note: 'minutes in the answer' }],
    answer: (v) => `${Math.floor(N(v, 'dur') / 60)} სთ ${N(v, 'dur') % 60} წთ`,
    options: (v, right) => {
      const d = N(v, 'dur');
      const h = Math.floor(d / 60), m = d % 60;
      return [right, `${h} სთ ${60 - m} წთ`, `${h + 1} სთ ${m} წთ`, `${h} სთ ${m + 10 < 60 ? m + 10 : m - 10} წთ`, `${h + 1} სთ ${60 - m} წთ`, `${h - 1 >= 0 ? h - 1 : h + 2} სთ ${m} წთ`];
    },
    why: (v, a) => `${v.h2}:${v.m2} − ${v.h1}:${v.m1} = ${a}.`,
  }),
  t({
    sub: 'u09-09',
    d: 2,
    prompt: 'მორბენალი მოძრაობს {v} კმ/სთ სიჩქარით. რა მანძილს გაივლის {m} წუთში?',
    vars: { v: C([12, 8, 16, 10, 6, 9, 15, 18, 20]), m: C([15, 30, 45, 20, 40, 10, 50]) },
    constraints: [{ test: (v) => (N(v, 'v') * N(v, 'm')) % 6 === 0, note: 'a short decimal' }],
    answer: (v) => `${ds((N(v, 'v') * N(v, 'm')) / 60)} კმ`,
    wrong: (v) => [(N(v, 'v') * N(v, 'm')), N(v, 'v') * N(v, 'm') / 6, N(v, 'v') + N(v, 'm'), N(v, 'v') * N(v, 'm') / 600, N(v, 'v') * N(v, 'm') / 60 + 1, N(v, 'v') * N(v, 'm') / 60 - 1].filter((x) => x > 0).map((x) => dm(x, 'კმ')),
    why: (v, a) => `${v.m} წუთი = ${ds(N(v, 'm') / 60)} სთ; ${v.v} × ${v.m} ÷ 60 = ${a}.`,
  }),
  t({
    sub: 'u09-09',
    d: 2,
    prompt: 'ორი ქალაქი ერთმანეთისგან {dt} კმ-ითაა დაშორებული. ავტომობილი პირველი ქალაქიდან მეორისკენ {v} კმ/სთ სიჩქარით გაემართა. რამდენი კილომეტრი დარჩება გასავლელი {t} საათის შემდეგ?',
    vars: { dist: C([360, 420, 480, 300, 540, 600]), v: C([60, 70, 80, 90, 50]), t: I(2, 5), dt: S('dist') },
    constraints: [{ test: (v) => N(v, 'v') * N(v, 't') < N(v, 'dist'), note: 'not arrived yet' }],
    answer: (v) => an(N(v, 'dist') - N(v, 'v') * N(v, 't'), 'კმ'),
    wrong: (v) => slips(N(v, 'dist') - N(v, 'v') * N(v, 't'), 'კმ', [N(v, 'v') * N(v, 't'), N(v, 'dist') + N(v, 'v') * N(v, 't'), N(v, 'dist') - N(v, 'v') - N(v, 't')]),
    why: (v, a) => `${v.v} × ${v.t} = ${N(v, 'v') * N(v, 't')}; ${v.dt} − ${N(v, 'v') * N(v, 't')} = ${a}.`,
  }),
];
