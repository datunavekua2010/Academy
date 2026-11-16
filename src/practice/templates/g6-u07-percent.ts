import type { QuestionTemplate, Vars } from './types';
import { C, D, I, N, S, fText, fr, gcd, q6, sg } from './g6-helpers';
import { dd, ds } from './g6-dec';

/**
 * Grade VI — Unit 7: პროცენტი (percent).
 *
 * Converted from the academy's `U07` bank: 6 subtopics × 6 questions.
 *
 * A percentage travels as tenths of a percent (`p10`: 125 = 12,5%) so every
 * result is computed from integers; a money amount is printed trimmed, with the
 * currency after it. A wrong option is the slip of the topic: the percentage
 * taken as a count, the discount added instead of subtracted, two successive
 * percentages added into one, the tax taken off instead of put on.
 */

export const G6_U07_SUBTOPICS = ['u07-01', 'u07-02', 'u07-03', 'u07-04', 'u07-05', 'u07-06'] as const;

const T = 'g6-percent';
let seq = 0;
const nextId = (): string => `g6-u07-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

/** A float cleaned of noise and printed trimmed. */
const m = (x: number): string => ds(Math.round(x * 1e6) / 1e6);
const lari = (x: number): string => `${m(x)} ლარი`;
const around = (r: number): number[] => [r * 10, r / 10, r + 10, r - 10, r + 1, r - 1, r * 100, r / 100].filter((x) => x > 0);
const lariSlips = (r: number, extra: number[] = []): string[] => [...extra, ...around(r)].map(lari);
const ps = (name: string) => D((v) => dd(N(v, name), 1));
const round100 = (from: number, to: number, step = 100): number[] => {
  const out: number[] = [];
  for (let n = from; n <= to; n += step) out.push(n);
  return out;
};
const pctName = (v: Vars, name = 'p10'): string => dd(N(v, name), 1);

const ITEMS = ['ჩანთა', 'ფეხსაცმელი', 'ქურთუკი', 'წიგნი', 'ველოსიპედი', 'ტელეფონი', 'საათი', 'ჩაი'];

const part = (n: number, p10: number): number => (n * p10) / 1000;

export const G6_U07_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U07.1 — დიდი რიცხვის პროცენტის გამოთვლა ═════════
  t({
    sub: 'u07-01',
    prompt: 'გამოთვალე {p}% რიცხვიდან {nt}.',
    vars: { n: C(round100(500, 5000)), p10: C([100, 200, 250, 500, 400, 300]), p: ps('p10'), nt: S('n') },
    answer: (v) => m(part(N(v, 'n'), N(v, 'p10'))),
    wrong: (v) => around(part(N(v, 'n'), N(v, 'p10'))).concat([N(v, 'n') - part(N(v, 'n'), N(v, 'p10'))]).map(m),
    why: (v, a) => `${sg(N(v, 'n'))} ÷ 100 × ${pctName(v)} = ${a}.`,
  }),
  t({
    sub: 'u07-01',
    prompt: 'იპოვე {p}% რიცხვიდან {nt}.',
    vars: { n: C(round100(1200, 4800, 200)), p10: C([150, 120, 350, 450, 80, 180, 650]), p: ps('p10'), nt: S('n') },
    answer: (v) => m(part(N(v, 'n'), N(v, 'p10'))),
    wrong: (v) => around(part(N(v, 'n'), N(v, 'p10'))).concat([N(v, 'n') + part(N(v, 'n'), N(v, 'p10'))]).map(m),
    why: (v, a) => `1% = ${m(N(v, 'n') / 100)}, ამიტომ ${pctName(v)}% = ${m(N(v, 'n') / 100)} × ${pctName(v)} = ${a}.`,
  }),
  t({
    sub: 'u07-01',
    prompt: 'რამდენია {p}% რიცხვიდან {nt}?',
    vars: { n: C(round100(800, 9600, 400)), p10: C([250, 500, 750, 1000, 100, 200]), p: ps('p10'), nt: S('n') },
    answer: (v) => m(part(N(v, 'n'), N(v, 'p10'))),
    wrong: (v) => around(part(N(v, 'n'), N(v, 'p10'))).map(m),
    why: (v, a) => `${sg(N(v, 'n'))} × ${pctName(v)} ÷ 100 = ${a}.`,
  }),
  t({
    sub: 'u07-01',
    d: 2,
    prompt: 'გამოთვალე {p}% რიცხვიდან {nt}.',
    vars: { n: C(round100(1000, 7000, 500)), p10: C([120, 110, 130, 140, 160, 170, 190, 280, 360, 380, 420]), p: ps('p10'), nt: S('n') },
    answer: (v) => m(part(N(v, 'n'), N(v, 'p10'))),
    wrong: (v) => around(part(N(v, 'n'), N(v, 'p10'))).map(m),
    why: (v, a) => `${sg(N(v, 'n'))} ÷ 100 = ${m(N(v, 'n') / 100)}; ${m(N(v, 'n') / 100)} × ${pctName(v)} = ${a}.`,
  }),
  t({
    sub: 'u07-01',
    d: 2,
    prompt: 'იპოვე {p}% რიცხვიდან {nt}.',
    vars: { n: C(round100(2000, 9000, 1000)), p10: C([350, 450, 550, 650, 850, 950, 750, 250]), p: ps('p10'), nt: S('n') },
    answer: (v) => m(part(N(v, 'n'), N(v, 'p10'))),
    wrong: (v) => around(part(N(v, 'n'), N(v, 'p10'))).map(m),
    why: (v, a) => `${sg(N(v, 'n'))} × ${pctName(v)} ÷ 100 = ${a}.`,
  }),
  t({
    sub: 'u07-01',
    d: 3,
    prompt: 'რამდენია {p}% რიცხვიდან {nt}?',
    vars: { n: C(round100(1600, 9600, 800)), p10: C([75, 25, 125, 65, 45, 85, 15, 35]), p: ps('p10'), nt: S('n') },
    answer: (v) => m(part(N(v, 'n'), N(v, 'p10'))),
    wrong: (v) => around(part(N(v, 'n'), N(v, 'p10'))).map(m),
    why: (v, a) => `${sg(N(v, 'n'))} × ${pctName(v)} ÷ 100 = ${a}.`,
  }),

  // ═════════ U07.2 — ფასდაკლებები ═════════
  t({
    sub: 'u07-02',
    prompt: '{item} ღირს {n} ლარი. ფასდაკლებაა {p}%. რამდენი ლარით შემცირდება ფასი?',
    vars: { item: C(ITEMS), n: C(round100(40, 200, 20)), p10: C([100, 200, 250, 500, 150, 300]), p: ps('p10') },
    answer: (v) => lari(part(N(v, 'n'), N(v, 'p10'))),
    wrong: (v) => lariSlips(part(N(v, 'n'), N(v, 'p10')), [N(v, 'n') - part(N(v, 'n'), N(v, 'p10'))]),
    why: (v, a) => `${N(v, 'n')} × ${pctName(v)} ÷ 100 = ${a}.`,
  }),
  t({
    sub: 'u07-02',
    prompt: '{item} ღირს {n} ლარი. ფასდაკლებაა {p}%. რა იქნება ახალი ფასი?',
    vars: { item: C(ITEMS), n: C(round100(120, 480, 40)), p10: C([100, 200, 250, 500, 150, 300]), p: ps('p10') },
    answer: (v) => lari(N(v, 'n') - part(N(v, 'n'), N(v, 'p10'))),
    wrong: (v) => lariSlips(N(v, 'n') - part(N(v, 'n'), N(v, 'p10')), [part(N(v, 'n'), N(v, 'p10')), N(v, 'n') + part(N(v, 'n'), N(v, 'p10'))]),
    why: (v, a) => `ფასდაკლება: ${N(v, 'n')} × ${pctName(v)} ÷ 100 = ${m(part(N(v, 'n'), N(v, 'p10')))}; ${N(v, 'n')} − ${m(part(N(v, 'n'), N(v, 'p10')))} = ${a}.`,
  }),
  t({
    sub: 'u07-02',
    d: 2,
    prompt: '{item} ღირს {n} ლარი. ფასდაკლებაა {p}%. რამდენი ლარი უნდა გადაიხადო ფასდაკლების შემდეგ?',
    vars: { item: C(ITEMS), n: C(round100(200, 800, 20)), p10: C([150, 120, 180, 350, 450, 280]), p: ps('p10') },
    constraints: [{ test: (v) => (N(v, 'n') * N(v, 'p10')) % 100 === 0, note: 'a money amount' }],
    answer: (v) => lari(N(v, 'n') - part(N(v, 'n'), N(v, 'p10'))),
    wrong: (v) => lariSlips(N(v, 'n') - part(N(v, 'n'), N(v, 'p10')), [part(N(v, 'n'), N(v, 'p10')), N(v, 'n') + part(N(v, 'n'), N(v, 'p10'))]),
    why: (v, a) => `ფასდაკლება: ${m(part(N(v, 'n'), N(v, 'p10')))} ლარი; ${N(v, 'n')} − ${m(part(N(v, 'n'), N(v, 'p10')))} = ${a}.`,
  }),
  t({
    sub: 'u07-02',
    prompt: '{item} ღირს {n} ლარი. ფასდაკლებაა {p}%. რამდენია ახალი ფასი?',
    vars: { item: C(ITEMS), n: C(round100(30, 90, 10)), p10: C([200, 100, 400, 500, 250, 300]), p: ps('p10') },
    answer: (v) => lari(N(v, 'n') - part(N(v, 'n'), N(v, 'p10'))),
    wrong: (v) => lariSlips(N(v, 'n') - part(N(v, 'n'), N(v, 'p10')), [part(N(v, 'n'), N(v, 'p10'))]),
    why: (v, a) => `${N(v, 'n')} × (100 − ${pctName(v)}) ÷ 100 = ${a}.`,
  }),
  t({
    sub: 'u07-02',
    d: 2,
    prompt: '{item} ღირს {n} ლარი. ფასდაკლებაა {p}%. რამდენი ლარი ღირს {item} ფასდაკლების შემდეგ?',
    vars: { item: C(['ველოსიპედი', 'ტელეფონი', 'საათი']), n: C(round100(240, 960, 80)), p10: C([125, 75, 25, 225]), p: ps('p10') },
    answer: (v) => lari(N(v, 'n') - part(N(v, 'n'), N(v, 'p10'))),
    wrong: (v) => lariSlips(N(v, 'n') - part(N(v, 'n'), N(v, 'p10')), [part(N(v, 'n'), N(v, 'p10')), N(v, 'n') + part(N(v, 'n'), N(v, 'p10'))]),
    why: (v, a) => `${pctName(v)}% = ${m(part(N(v, 'n'), N(v, 'p10')))} ლარი; ${N(v, 'n')} − ${m(part(N(v, 'n'), N(v, 'p10')))} = ${a}.`,
  }),
  t({
    sub: 'u07-02',
    d: 3,
    prompt: '{item} ღირს {nt} ლარი. ჯერ ფასდაკლებაა {p1}%, შემდეგ ახალ ფასზე დამატებით კიდევ {p2}%. რა არის საბოლოო ფასი?',
    vars: { item: C(['ტელეფონი', 'ლეპტოპი', 'ველოსიპედი']), n: C(round100(400, 2400, 400)), p1: C([10, 20, 25, 50]), p2: C([5, 10, 20]), nt: S('n') },
    answer: (v) => lari((N(v, 'n') * (100 - N(v, 'p1')) * (100 - N(v, 'p2'))) / 10000),
    wrong: (v) => lariSlips((N(v, 'n') * (100 - N(v, 'p1')) * (100 - N(v, 'p2'))) / 10000, [N(v, 'n') * (100 - N(v, 'p1') - N(v, 'p2')) / 100, N(v, 'n') * (100 - N(v, 'p1')) / 100]),
    why: (v, a) => `${N(v, 'n')} × ${dd(100 - N(v, 'p1'), 2)} = ${m((N(v, 'n') * (100 - N(v, 'p1'))) / 100)}; ${m((N(v, 'n') * (100 - N(v, 'p1'))) / 100)} × ${dd(100 - N(v, 'p2'), 2)} = ${a}.`,
  }),

  // ═════════ U07.3 — წილადები და პროცენტები ═════════
  ...[
    { d: 1, pool: ['1/2', '1/4', '3/4', '1/5', '2/5', '3/5', '4/5', '1/10', '3/10', '7/10', '9/10'] },
    { d: 1, pool: ['1/20', '3/20', '7/20', '9/20', '11/20', '17/20', '1/25', '3/25', '7/25', '12/25', '1/50', '7/50', '13/50'] },
    { d: 2, pool: ['1/8', '3/8', '5/8', '7/8', '1/40', '3/40', '7/40', '9/40'] },
  ].map(({ d, pool }) =>
    t({
      sub: 'u07-03',
      d: d as 1 | 2,
      prompt: 'ჩაწერე {f} პროცენტის სახით.',
      vars: { f: C(pool) },
      answer: (v) => `${m((Number(String(v.f).split('/')[0]) * 100) / Number(String(v.f).split('/')[1]))}%`,
      wrong: (v) => {
        const [a, b] = String(v.f).split('/').map(Number) as [number, number];
        const r = (a * 100) / b;
        return [r / 10, r * 10, a, b, 100 - r, a + b, (b * 100) / a].filter((x) => x > 0).map((x) => `${m(x)}%`);
      },
      why: (v, a) => `${String(v.f)} = ${String(v.f).split('/')[0]} × 100% ÷ ${String(v.f).split('/')[1]} = ${a}.`,
    }),
  ),
  t({
    sub: 'u07-03',
    d: 2,
    prompt: 'ჩაწერე {p}% ჩვეულებრივი წილადის სახით და შეამცირე.',
    vars: { p: I(2, 98) },
    constraints: [{ test: (v) => gcd(N(v, 'p'), 100) > 1 && N(v, 'p') % 50 !== 0, note: 'reducible' }],
    answer: (v) => fText(fr(N(v, 'p'), 100)),
    options: (v, right) => {
      const k = fr(N(v, 'p'), 100);
      return [right, `${N(v, 'p')}/100`, `${N(v, 'p')}/10`, `${k.d}/${k.n}`, `${k.n}/${k.d + 1}`, `${k.n + 1}/${k.d}`];
    },
    why: (v, a) => `${N(v, 'p')}% = ${N(v, 'p')}/100 = ${a}.`,
  }),
  t({
    sub: 'u07-03',
    d: 2,
    prompt: 'ჩაწერე {p}% ჩვეულებრივი წილადის სახით და შეამცირე.',
    vars: { p: C([110, 120, 125, 150, 160, 175, 180, 200, 225, 250, 300, 140, 130]) },
    answer: (v) => fText(fr(N(v, 'p'), 100)),
    options: (v, right) => {
      const k = fr(N(v, 'p'), 100);
      return [right, `${N(v, 'p')}/100`, `${k.d}/${k.n}`, `${k.n}/${k.d + 1}`, `${k.n + 1}/${k.d}`, `${N(v, 'p')}/10`];
    },
    why: (v, a) => `${N(v, 'p')}% = ${N(v, 'p')}/100 = ${a}.`,
  }),
  t({
    sub: 'u07-03',
    d: 2,
    prompt: 'კლასის {f} ნაწილი გოგონებია. კლასის რამდენი პროცენტია გოგონები?',
    vars: { f: C(['7/20', '3/5', '2/5', '9/20', '11/25', '3/4', '7/10', '13/20', '17/25', '3/10', '21/50']) },
    answer: (v) => `${m((Number(String(v.f).split('/')[0]) * 100) / Number(String(v.f).split('/')[1]))}%`,
    wrong: (v) => {
      const [a, b] = String(v.f).split('/').map(Number) as [number, number];
      const r = (a * 100) / b;
      return [r / 10, r * 10, 100 - r, a + b, a * b, r + 10, r - 10].filter((x) => x > 0).map((x) => `${m(x)}%`);
    },
    why: (v, a) => `${String(v.f)} = ${String(v.f).split('/')[0]} × 100% ÷ ${String(v.f).split('/')[1]} = ${a}.`,
  }),

  // ═════════ U07.4 — ათწილადები და პროცენტები ═════════
  t({
    sub: 'u07-04',
    prompt: 'ჩაწერე {x} პროცენტის სახით.',
    vars: { a: I(2, 98), x: D((v) => dd(N(v, 'a'), 2)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0, note: 'two places' }],
    answer: (v) => `${N(v, 'a')}%`,
    wrong: (v) => [N(v, 'a') / 10, N(v, 'a') * 10, N(v, 'a') / 100, 100 - N(v, 'a'), N(v, 'a') + 10].map((x) => `${m(x)}%`),
    why: (v, a) => `${String(v.x)} × 100% = ${a}.`,
  }),
  t({
    sub: 'u07-04',
    prompt: 'ჩაწერე {x} პროცენტის სახით.',
    vars: { a: I(1, 9), x: D((v) => dd(N(v, 'a'), 1)) },
    answer: (v) => `${N(v, 'a') * 10}%`,
    wrong: (v) => [N(v, 'a'), N(v, 'a') * 100, N(v, 'a') / 10, 100 - N(v, 'a') * 10, N(v, 'a') * 10 + 10].map((x) => `${m(x)}%`),
    why: (v, a) => `${String(v.x)} × 100% = ${a}.`,
  }),
  t({
    sub: 'u07-04',
    d: 2,
    prompt: 'ჩაწერე {x} პროცენტის სახით.',
    vars: { a: I(101, 299), x: D((v) => dd(N(v, 'a'), 2)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0, note: 'two places' }],
    answer: (v) => `${N(v, 'a')}%`,
    wrong: (v) => [N(v, 'a') / 10, N(v, 'a') * 10, N(v, 'a') - 100, N(v, 'a') + 10, N(v, 'a') - 10].map((x) => `${m(x)}%`),
    why: (v, a) => `${String(v.x)} × 100% = ${a}.`,
  }),
  t({
    sub: 'u07-04',
    prompt: 'ჩაწერე {p}% ათწილადის სახით.',
    vars: { p: I(2, 98) },
    answer: (v) => dd(N(v, 'p'), 2),
    wrong: (v) => [N(v, 'p') / 10, N(v, 'p'), N(v, 'p') / 1000, N(v, 'p') / 100 + 0.1].map(m),
    why: (v, a) => `${N(v, 'p')}% = ${N(v, 'p')} ÷ 100 = ${a}.`,
  }),
  t({
    sub: 'u07-04',
    d: 2,
    prompt: 'ჩაწერე {p}% ათწილადის სახით.',
    vars: { p10: I(11, 199), p: ps('p10') },
    constraints: [{ test: (v) => N(v, 'p10') % 10 !== 0, note: 'one place' }],
    answer: (v) => dd(N(v, 'p10'), 3),
    wrong: (v) => [N(v, 'p10') / 100, N(v, 'p10') / 10, N(v, 'p10') / 10000, N(v, 'p10') / 1000 * 10].map(m),
    why: (v, a) => `${pctName(v)}% = ${pctName(v)} ÷ 100 = ${a}.`,
  }),
  t({
    sub: 'u07-04',
    d: 2,
    prompt: 'რიცხვის რა პროცენტია {x}, თუ მთელ რიცხვად 1-ს მივიჩნევთ?',
    vars: { a: I(1, 9), x: D((v) => dd(N(v, 'a'), 2)) },
    answer: (v) => `${N(v, 'a')}%`,
    wrong: (v) => [N(v, 'a') / 10, N(v, 'a') * 10, N(v, 'a') / 100, 100 - N(v, 'a'), N(v, 'a') + 1].map((x) => `${m(x)}%`),
    why: (v, a) => `${String(v.x)} × 100% = ${a}.`,
  }),

  // ═════════ U07.5 — პროცენტის გამოსახვა ილუსტრაციებით ═════════
  ...[
    { d: 1, text: 'კვადრატი დაყოფილია 100 თანაბარ უჯრად. შეღებილია {k} უჯრა. კვადრატის რამდენი პროცენტია შეღებილი?', total: [100], kk: [3, 97] },
    { d: 1, text: 'ბადეზე 50 უჯრიდან შეღებილია {k}. რა პროცენტია შეღებილი?', total: [50], kk: [2, 48] },
    { d: 1, text: 'წრე დაყოფილია 10 თანაბარ ნაწილად. შეღებილია {k} ნაწილი. წრის რამდენი პროცენტია შეღებილი?', total: [10], kk: [1, 9] },
  ].map(({ d, text, total, kk }) =>
    t({
      sub: 'u07-05',
      d: d as 1,
      prompt: text,
      vars: { k: I(kk[0]!, kk[1]!) },
      constraints: [{ test: (v) => N(v, 'k') % 10 !== 0, note: 'not a round tenth' }],
      answer: (v) => `${(N(v, 'k') * 100) / total[0]!}%`,
      wrong: (v) => [N(v, 'k'), N(v, 'k') * 10, N(v, 'k') / 10, 100 - (N(v, 'k') * 100) / total[0]!, N(v, 'k') * 2].map((x) => `${m(x)}%`),
      why: (v, a) => `${N(v, 'k')} ÷ ${total[0]} × 100% = ${a}.`,
    }),
  ),
  t({
    sub: 'u07-05',
    d: 2,
    prompt: 'სურათზე {tot} ვარსკვლავია, რომელთაგან {k} ლურჯია. ვარსკვლავების რამდენი პროცენტია ლურჯი?',
    vars: { tot: C([20, 25, 40, 50]), k: I(3, 39) },
    constraints: [{ test: (v) => N(v, 'k') < N(v, 'tot') && (N(v, 'k') * 100) % N(v, 'tot') === 0, note: 'a whole percent' }],
    answer: (v) => `${(N(v, 'k') * 100) / N(v, 'tot')}%`,
    wrong: (v) => [N(v, 'k'), N(v, 'k') * 10, 100 - (N(v, 'k') * 100) / N(v, 'tot'), (N(v, 'tot') * 100) / N(v, 'k'), N(v, 'k') + N(v, 'tot')].map((x) => `${m(x)}%`),
    why: (v, a) => `${N(v, 'k')} ÷ ${N(v, 'tot')} × 100% = ${a}.`,
  }),
  t({
    sub: 'u07-05',
    d: 2,
    prompt: 'ბაღში {tot} ყვავილია. მათგან {k} წითელია. ყვავილების რამდენი პროცენტია წითელი?',
    vars: { tot: C([40, 80, 120, 200, 160]), k: I(5, 150) },
    constraints: [{ test: (v) => N(v, 'k') < N(v, 'tot') && (N(v, 'k') * 100) % N(v, 'tot') === 0, note: 'a whole percent' }],
    answer: (v) => `${(N(v, 'k') * 100) / N(v, 'tot')}%`,
    wrong: (v) => [N(v, 'k'), N(v, 'k') / 10, 100 - (N(v, 'k') * 100) / N(v, 'tot'), (N(v, 'tot') * 100) / N(v, 'k'), (N(v, 'k') * 10) / N(v, 'tot')].map((x) => `${m(x)}%`),
    why: (v, a) => `${N(v, 'k')} ÷ ${N(v, 'tot')} × 100% = ${a}.`,
  }),
  t({
    sub: 'u07-05',
    d: 2,
    prompt: 'ბადეზე {tot} უჯრიდან შეღებილია {k}. რა პროცენტია შეღებილი?',
    vars: { tot: C([200, 400, 500, 250]), k: I(5, 300) },
    constraints: [{ test: (v) => N(v, 'k') < N(v, 'tot') && (N(v, 'k') * 1000) % N(v, 'tot') === 0 && (N(v, 'k') * 100) % N(v, 'tot') !== 0, note: 'one decimal place' }],
    answer: (v) => `${m((N(v, 'k') * 100) / N(v, 'tot'))}%`,
    wrong: (v) => {
      const r = (N(v, 'k') * 100) / N(v, 'tot');
      return [r * 10, r / 10, N(v, 'k') / 2, 100 - r, r + 1].map((x) => `${m(x)}%`);
    },
    why: (v, a) => `${N(v, 'k')} ÷ ${N(v, 'tot')} × 100% = ${a}.`,
  }),

  // ═════════ U07.6 — გადასახადი ═════════
  t({
    sub: 'u07-06',
    prompt: 'ნივთი ღირს {n} ლარი. გადასახადია {p}%. რამდენია გადასახადი?',
    vars: { n: C([100, 200, 300, 500, 1000]), p: C([10, 20, 5, 15, 18, 12]) },
    answer: (v) => lari((N(v, 'n') * N(v, 'p')) / 100),
    wrong: (v) => lariSlips((N(v, 'n') * N(v, 'p')) / 100, [N(v, 'n') + (N(v, 'n') * N(v, 'p')) / 100, N(v, 'p')]),
    why: (v, a) => `${N(v, 'n')} × ${N(v, 'p')} ÷ 100 = ${a}.`,
  }),
  t({
    sub: 'u07-06',
    prompt: 'წიგნის ფასი გადასახადამდე {n} ლარია. თუ გადასახადი არის {p}%, რამდენია გადასახადის თანხა?',
    vars: { n: C(round100(20, 90, 10)), p: C([18, 10, 5, 15, 20, 12]) },
    answer: (v) => lari((N(v, 'n') * N(v, 'p')) / 100),
    wrong: (v) => lariSlips((N(v, 'n') * N(v, 'p')) / 100, [N(v, 'n') + (N(v, 'n') * N(v, 'p')) / 100]),
    why: (v, a) => `${N(v, 'n')} × ${N(v, 'p')} ÷ 100 = ${a}.`,
  }),
  t({
    sub: 'u07-06',
    prompt: 'ნივთი გადასახადამდე ღირს {n} ლარი. გადასახადი შეადგენს {p}%. რა არის საბოლოო ფასი?',
    vars: { n: C(round100(150, 650, 50)), p: C([20, 10, 5, 15, 25, 18]) },
    constraints: [{ test: (v) => (N(v, 'n') * N(v, 'p')) % 50 === 0, note: 'a tidy amount' }],
    answer: (v) => lari((N(v, 'n') * (100 + N(v, 'p'))) / 100),
    wrong: (v) => lariSlips((N(v, 'n') * (100 + N(v, 'p'))) / 100, [(N(v, 'n') * N(v, 'p')) / 100, (N(v, 'n') * (100 - N(v, 'p'))) / 100]),
    why: (v, a) => `გადასახადი: ${m((N(v, 'n') * N(v, 'p')) / 100)} ლარი; ${N(v, 'n')} + ${m((N(v, 'n') * N(v, 'p')) / 100)} = ${a}.`,
  }),
  t({
    sub: 'u07-06',
    d: 2,
    prompt: 'კომპიუტერი გადასახადამდე ღირს {nt} ლარი. გადასახადია {p}%. რამდენია ფასი გადასახადის ჩათვლით?',
    vars: { n: C(round100(1000, 3000, 500)), p: C([18, 20, 12, 10]), nt: S('n') },
    answer: (v) => lari((N(v, 'n') * (100 + N(v, 'p'))) / 100),
    wrong: (v) => lariSlips((N(v, 'n') * (100 + N(v, 'p'))) / 100, [(N(v, 'n') * N(v, 'p')) / 100, (N(v, 'n') * (100 - N(v, 'p'))) / 100]),
    why: (v, a) => `${sg(N(v, 'n'))} × ${dd(100 + N(v, 'p'), 2)} = ${a}.`,
  }),
  t({
    sub: 'u07-06',
    d: 3,
    prompt: 'ნივთის საბოლოო ფასი გადასახადით არის {f} ლარი. გადასახადი საწყისი ფასის {p}%-ია. რა იყო ფასი გადასახადამდე?',
    vars: { b: C(round100(100, 900, 100)), p: C([18, 20, 25, 10, 5, 50]), f: D((v) => String((N(v, 'b') * (100 + N(v, 'p'))) / 100)) },
    answer: (v) => lari(N(v, 'b')),
    wrong: (v) => lariSlips(N(v, 'b'), [(N(v, 'b') * (100 + N(v, 'p'))) / 100 * (100 - N(v, 'p')) / 100, N(v, 'b') * (100 + N(v, 'p')) / 100 - N(v, 'p'), Number(v.f)]),
    why: (v, a) => `${String(v.f)} ლარი არის საწყისი ფასის ${100 + N(v, 'p')}%; ${String(v.f)} ÷ ${100 + N(v, 'p')} × 100 = ${a}.`,
  }),
  t({
    sub: 'u07-06',
    d: 3,
    prompt: 'მაღაზიაში ნივთი ღირს {nt} ლარი გადასახადის გარეშე. გადასახადია {p1}%, შემდეგ საბოლოო ფასს აკლდება {p2}% ფასდაკლება. რამდენია გადასახდელი თანხა?',
    vars: { n: C(round100(200, 1000, 200)), p1: C([18, 20, 10, 15]), p2: C([10, 20, 5, 15]), nt: S('n') },
    answer: (v) => lari((N(v, 'n') * (100 + N(v, 'p1')) * (100 - N(v, 'p2'))) / 10000),
    wrong: (v) => lariSlips((N(v, 'n') * (100 + N(v, 'p1')) * (100 - N(v, 'p2'))) / 10000, [N(v, 'n') * (100 + N(v, 'p1') - N(v, 'p2')) / 100, (N(v, 'n') * (100 + N(v, 'p1'))) / 100]),
    why: (v, a) => `${sg(N(v, 'n'))} × ${dd(100 + N(v, 'p1'), 2)} = ${m((N(v, 'n') * (100 + N(v, 'p1'))) / 100)}; ${m((N(v, 'n') * (100 + N(v, 'p1'))) / 100)} × ${dd(100 - N(v, 'p2'), 2)} = ${a}.`,
  }),
];
