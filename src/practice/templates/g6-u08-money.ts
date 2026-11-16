import type { QuestionTemplate, Vars } from './types';
import { C, D, F, I, N, S, SPEC, group, q6 } from './g6-helpers';
import { dd, fx } from './g6-dec';

/**
 * Grade VI — Unit 8: ფული (money).
 *
 * Converted from the academy's `U08` bank: 5 subtopics × 6 questions.
 *
 * Money is carried in tetri (hundredths of a lari) as integers, so every sum,
 * share and change is exact. A price prints with two places when it has tetri
 * (`3,50`), a round amount without (`4`). A wrong option is the slip of the
 * topic: tetri read as lari, the amounts added instead of subtracted, a share
 * rounded down instead of to the nearest tetri, the verdict reversed.
 */

export const G6_U08_SUBTOPICS = ['u08-01', 'u08-02', 'u08-03', 'u08-04', 'u08-05'] as const;

const T = 'g6-money';
let seq = 0;
const nextId = (): string => `g6-u08-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

/** Tetri → `3,50`, or `4` when round. */
const cash = (c: number): string => (c % 100 === 0 ? group(c / 100) : fx(c, 2));
const lari = (c: number): string => `${cash(c)} ლარი`;
const price = (name: string) => D((v) => cash(N(v, name)));

const slipsOf = (c: number, extra: number[] = []): string[] =>
  [...extra, c + 100, c - 100, c + 10, c - 10, c * 10, c / 10, c + 50, c - 50, c + 1000, c - 1000]
    .filter((x) => Number.isInteger(x) && x > 0)
    .map(lari);

// Names in the two cases the bank uses: acting (`ნინომ იყიდა`) and owning (`ნინოს აქვს`).
const NAMES = SPEC(['ნინომ|ნინოს', 'ლუკამ|ლუკას', 'მარიამმა|მარიამს', 'გიორგიმ|გიორგის', 'ანამ|ანას', 'საბამ|საბას', 'დათომ|დათოს', 'ელენემ|ელენეს']);
const FIRST = ['რვეული', 'წიგნი', 'ბურთი', 'ჩანთა'];
const SECOND = ['კალამი', 'ფანქარი', 'საშლელი', 'სახაზავი'];

/** A verdict about whether `have` covers `need`: the one place the sign decides the wording. */
const verdict = (have: number, need: number): string =>
  have >= need ? `ეყოფა, დარჩება ${lari(have - need)}` : `არ ეყოფა, დააკლდება ${lari(need - have)}`;
const verdictOptions = (have: number, need: number, right: string): string[] => {
  const diff = Math.abs(have - need);
  const flipped = have >= need ? `არ ეყოფა, დააკლდება ${lari(diff)}` : `ეყოფა, დარჩება ${lari(diff)}`;
  return [
    right, flipped,
    verdict(have, need + 100), verdict(have, need - 100 > 0 ? need - 100 : need + 200),
    `ეყოფა, დარჩება ${lari(need)}`, `არ ეყოფა, დააკლდება ${lari(need)}`, verdict(have + 100, need),
  ];
};
const haveNeed = (sub: string, d: 1 | 2 | 3, prompt: string, vars: Record<string, ReturnType<typeof C>>, have: (v: Vars) => number, need: (v: Vars) => number, why: (v: Vars) => string): QuestionTemplate =>
  t({
    sub,
    d,
    prompt,
    vars,
    constraints: [{ test: (v) => have(v) !== need(v), note: 'the sum is not exactly enough' }],
    answer: (v) => verdict(have(v), need(v)),
    options: (v, right) => verdictOptions(have(v), need(v), right),
    why: (v, a) => `${why(v)} ${a}.`,
  });

const share = (total: number, k: number): number => Math.round(total / k);

export const G6_U08_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U08.1 — ფულზე მოქმედებები ═════════
  t({
    sub: 'u08-01',
    prompt: '{who} იყიდა {a1} {at} ლარად და {a2} {bt} ლარად. რამდენი გადაიხადა სულ?',
    vars: { spec: NAMES, who: F(0), a1: C(FIRST), a2: C(SECOND), a: I(150, 950, { step: 10 }), b: I(100, 650, { step: 10 }), at: price('a'), bt: price('b') },
    constraints: [{ test: (v) => (N(v, 'a') + N(v, 'b')) % 100 !== 0, note: 'tetri in the total' }],
    answer: (v) => lari(N(v, 'a') + N(v, 'b')),
    wrong: (v) => slipsOf(N(v, 'a') + N(v, 'b'), [N(v, 'a') - N(v, 'b')]),
    why: (v, a) => `${v.at} + ${v.bt} = ${a}.`,
  }),
  t({
    sub: 'u08-01',
    prompt: '{whom} ჰქონდა {h} ლარი. {who2} იყიდა წიგნი {bt} ლარად. რამდენი ლარი დარჩა?',
    vars: { spec: NAMES, whom: D((v) => String(v.spec).split('|')[1]!), who2: F(0), h: C([50, 60, 80, 100, 200]), b: I(375, 4895, { step: 5 }), bt: price('b') },
    constraints: [{ test: (v) => N(v, 'b') < N(v, 'h') * 100 && N(v, 'b') % 100 !== 0, note: 'a book cheaper than the money' }],
    answer: (v) => lari(N(v, 'h') * 100 - N(v, 'b')),
    wrong: (v) => slipsOf(N(v, 'h') * 100 - N(v, 'b'), [N(v, 'h') * 100 + N(v, 'b')]),
    why: (v, a) => `${v.h} − ${v.bt} = ${a}.`,
  }),
  t({
    sub: 'u08-01',
    prompt: 'ერთი {item} ღირს {ct} ლარი. რა ღირს {k} ასეთი {item}?',
    vars: { item: C(['კალკულატორი', 'რვეული', 'წიგნი', 'ბურთი', 'ჩანთა']), c: I(450, 2950, { step: 10 }), k: I(2, 9), ct: price('c') },
    constraints: [{ test: (v) => N(v, 'c') % 100 !== 0, note: 'tetri in the price' }],
    answer: (v) => lari(N(v, 'c') * N(v, 'k')),
    wrong: (v) => slipsOf(N(v, 'c') * N(v, 'k'), [N(v, 'c') + N(v, 'k') * 100, N(v, 'c') * N(v, 'k') * 10]),
    why: (v, a) => `${v.ct} × ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u08-01',
    prompt: '{k} ერთნაირი რვეული ჯამში {tt} ლარი ღირს. რა ღირს ერთი რვეული?',
    vars: { k: C([2, 4, 5, 8]), tot: I(10, 60), tt: S('tot') },
    constraints: [{ test: (v) => (N(v, 'tot') * 100) % N(v, 'k') === 0 && (N(v, 'tot') * 100) / N(v, 'k') % 100 !== 0, note: 'exact, with tetri' }],
    answer: (v) => lari((N(v, 'tot') * 100) / N(v, 'k')),
    wrong: (v) => slipsOf((N(v, 'tot') * 100) / N(v, 'k'), [N(v, 'tot') * 100 / (N(v, 'k') + 1)]),
    why: (v, a) => `${v.tt} ÷ ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u08-01',
    d: 2,
    prompt: '{who} იყიდა {wt} კგ ვაშლი, რომლის 1 კგ ღირს {ct} ლარი. რამდენი გადაიხადა?',
    vars: { spec: NAMES, who: F(0), w: C([15, 25, 35, 45, 5, 12, 24]), c: C([320, 280, 360, 240, 410, 350, 190]), wt: D((v) => dd(N(v, 'w'), 1)), ct: price('c') },
    answer: (v) => lari((N(v, 'w') * N(v, 'c')) / 10),
    wrong: (v) => slipsOf((N(v, 'w') * N(v, 'c')) / 10, [N(v, 'c') + N(v, 'w') * 10]),
    why: (v, a) => `${v.wt} × ${v.ct} = ${a}.`,
  }),
  t({
    sub: 'u08-01',
    d: 2,
    prompt: '{who} იყიდა მაისური {at} ლარად და შარვალი {bt} ლარად. მან მოლარეს {p} ლარი მისცა. რამდენი ხურდა უნდა მიიღოს?',
    vars: { spec: NAMES, who: F(0), a: I(2590, 4990, { step: 10 }), b: I(3500, 6990, { step: 10 }), p: C([100, 120, 150, 200]), at: price('a'), bt: price('b') },
    constraints: [{ test: (v) => N(v, 'a') + N(v, 'b') < N(v, 'p') * 100 && (N(v, 'a') + N(v, 'b')) % 100 !== 0, note: 'change due' }],
    answer: (v) => lari(N(v, 'p') * 100 - N(v, 'a') - N(v, 'b')),
    wrong: (v) => slipsOf(N(v, 'p') * 100 - N(v, 'a') - N(v, 'b'), [N(v, 'a') + N(v, 'b'), N(v, 'p') * 100 - N(v, 'a')]),
    why: (v, a) => `${v.at} + ${v.bt} = ${cash(N(v, 'a') + N(v, 'b'))}; ${v.p} − ${cash(N(v, 'a') + N(v, 'b'))} = ${a}.`,
  }),

  // ═════════ U08.2 — ამოცანები ფულზე ═════════
  t({
    sub: 'u08-02',
    prompt: 'ერთი ბილეთი ღირს {c} ლარი. რამდენი ლარი ღირს {k} ბილეთი?',
    vars: { c: I(4, 19), k: I(3, 9) },
    answer: (v) => lari(N(v, 'c') * N(v, 'k') * 100),
    wrong: (v) => slipsOf(N(v, 'c') * N(v, 'k') * 100, [(N(v, 'c') + N(v, 'k')) * 100]),
    why: (v, a) => `${v.c} × ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u08-02',
    prompt: '{whom} ჰქონდა {h} ლარი. {who2} დახარჯა თანხის {part}. რამდენი ლარი დარჩა?',
    vars: { spec: NAMES, whom: D((v) => String(v.spec).split('|')[1]!), who2: F(0), h: C([60, 120, 180, 240, 360]), f: SPEC(['მეოთხედი|4', 'მესამედი|3', 'მეხუთედი|5', 'ნახევარი|2', 'მეექვსედი|6']), part: D((v) => String(v.f).split('|')[0]!), den: D((v) => Number(String(v.f).split('|')[1]!)) },
    answer: (v) => lari(N(v, 'h') * 100 - (N(v, 'h') * 100) / N(v, 'den')),
    wrong: (v) => slipsOf(N(v, 'h') * 100 - (N(v, 'h') * 100) / N(v, 'den'), [(N(v, 'h') * 100) / N(v, 'den')]),
    why: (v, a) => `${v.h} ÷ ${v.den} = ${cash((N(v, 'h') * 100) / N(v, 'den'))}; ${v.h} − ${cash((N(v, 'h') * 100) / N(v, 'den'))} = ${a}.`,
  }),
  t({
    sub: 'u08-02',
    prompt: 'მაღაზიაში {w} კგ ფორთოხალი იყიდეს, თითოეული კილოგრამი {ct} ლარად. რამდენი გადაიხადეს?',
    vars: { w: I(2, 9), c: C([450, 380, 520, 340, 275, 640, 290]), ct: price('c') },
    answer: (v) => lari(N(v, 'w') * N(v, 'c')),
    wrong: (v) => slipsOf(N(v, 'w') * N(v, 'c'), [N(v, 'c') + N(v, 'w') * 100]),
    why: (v, a) => `${v.w} × ${v.ct} = ${a}.`,
  }),
  t({
    sub: 'u08-02',
    prompt: '{whom} ყოველდღე {c} ლარი აქვს სასკოლო ხარჯებისთვის. რამდენი ლარი ექნება {k} დღეში, თუ არაფერს დახარჯავს?',
    vars: { spec: NAMES, whom: D((v) => String(v.spec).split('|')[1]!), c: I(3, 12), k: I(4, 9) },
    answer: (v) => lari(N(v, 'c') * N(v, 'k') * 100),
    wrong: (v) => slipsOf(N(v, 'c') * N(v, 'k') * 100, [(N(v, 'c') + N(v, 'k')) * 100]),
    why: (v, a) => `${v.c} × ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u08-02',
    d: 2,
    prompt: 'ოჯახმა პროდუქტებში გადაიხადა {at} ლარი, ხოლო საყოფაცხოვრებო ნივთებში — {bt} ლარი. რამდენი ლარით მეტი დახარჯა ოჯახმა პროდუქტებში, ვიდრე საყოფაცხოვრებო ნივთებში?',
    vars: { a: I(3500, 9990, { step: 10 }), b: I(1500, 3490, { step: 10 }), at: price('a'), bt: price('b') },
    constraints: [{ test: (v) => (N(v, 'a') - N(v, 'b')) % 100 !== 0, note: 'tetri in the difference' }],
    answer: (v) => lari(N(v, 'a') - N(v, 'b')),
    wrong: (v) => slipsOf(N(v, 'a') - N(v, 'b'), [N(v, 'a') + N(v, 'b')]),
    why: (v, a) => `${v.at} − ${v.bt} = ${a}.`,
  }),
  t({
    sub: 'u08-02',
    d: 2,
    prompt: 'ლეპტოპი ღირს {pt} ლარი. მყიდველმა გადაიხადა ფასის {f} ნაწილი. რამდენი ლარი დარჩა გადასახდელი?',
    vars: { p: C([600, 900, 1200, 1500, 1800, 2400]), f: C(['3/5', '2/5', '1/4', '3/4', '1/3', '2/3', '1/5', '4/5']), pt: S('p') },
    constraints: [{ test: (v) => N(v, 'p') % Number(String(v.f).split('/')[1]) === 0, note: 'a whole number of lari' }],
    answer: (v) => lari(((N(v, 'p') * (Number(String(v.f).split('/')[1]) - Number(String(v.f).split('/')[0]))) / Number(String(v.f).split('/')[1])) * 100),
    wrong: (v) => {
      const [n, d] = String(v.f).split('/').map(Number) as [number, number];
      return slipsOf(((N(v, 'p') * (d - n)) / d) * 100, [((N(v, 'p') * n) / d) * 100]);
    },
    why: (v, a) => {
      const [n, d] = String(v.f).split('/').map(Number) as [number, number];
      return `${v.pt} × ${n}/${d} = ${cash(((N(v, 'p') * n) / d) * 100)}; ${v.pt} − ${cash(((N(v, 'p') * n) / d) * 100)} = ${a}.`;
    },
  }),

  // ═════════ U08.3 — თანხის გაყოფა და დამრგვალება ═════════
  t({
    sub: 'u08-03',
    prompt: '{tt} ლარი თანაბრად გაუნაწილეს {k} ბავშვს. რამდენი ლარი შეხვდა თითოეულს?',
    vars: { k: C([3, 4, 5, 6, 8]), per: I(2, 15), tot: D((v) => N(v, 'k') * N(v, 'per')), tt: S('tot') },
    answer: (v) => lari(N(v, 'per') * 100),
    wrong: (v) => slipsOf(N(v, 'per') * 100, [N(v, 'tot') * 100 / (N(v, 'k') + 1)]),
    why: (v, a) => `${v.tt} ÷ ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u08-03',
    d: 2,
    prompt: '{tt} ლარი თანაბრად უნდა გაიყოს {k} ბავშვზე. რამდენი ლარი შეხვდება თითოეულს, თუ თანხას მხოლოდ თეთრებში, ორ ათწილადამდე გამოვსახავთ?',
    vars: { k: C([4, 8, 5, 2, 20, 25]), tot: I(5, 49), tt: S('tot') },
    constraints: [{ test: (v) => N(v, 'tot') % N(v, 'k') !== 0 && (N(v, 'tot') * 100) % N(v, 'k') === 0, note: 'exact in tetri, not whole lari' }],
    answer: (v) => lari((N(v, 'tot') * 100) / N(v, 'k')),
    wrong: (v) => slipsOf((N(v, 'tot') * 100) / N(v, 'k'), [Math.floor(N(v, 'tot') / N(v, 'k')) * 100]),
    why: (v, a) => `${v.tt} ÷ ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u08-03',
    prompt: '{tt} ლარი თანაბრად გაიყო {k} ადამიანზე. რამდენი ლარი შეხვდა თითოეულს?',
    vars: { k: C([3, 4, 6, 7, 9]), per: I(250, 1990, { step: 10 }), tot: D((v) => N(v, 'k') * N(v, 'per')), tt: price('tot') },
    constraints: [{ test: (v) => N(v, 'per') % 100 !== 0, note: 'tetri in the share' }],
    answer: (v) => lari(N(v, 'per')),
    wrong: (v) => slipsOf(N(v, 'per'), [Math.floor(N(v, 'tot') / (N(v, 'k') + 1))]),
    why: (v, a) => `${v.tt} ÷ ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u08-03',
    d: 2,
    prompt: '{tt} ლარი თანაბრად უნდა გაიყოს {k} ადამიანზე. რამდენი ლარი შეხვდება თითოეულს, თუ თითოეულისთვის განკუთვნილ თანხას უახლოეს თეთრამდე დავამრგვალებთ?',
    vars: { k: C([3, 6, 7, 9, 11, 12]), tot: I(20, 99), tt: S('tot') },
    constraints: [{ test: (v) => (N(v, 'tot') * 100) % N(v, 'k') !== 0 && ((N(v, 'tot') * 100) % N(v, 'k')) * 2 !== N(v, 'k'), note: 'needs rounding, no tie' }],
    answer: (v) => lari(share(N(v, 'tot') * 100, N(v, 'k'))),
    wrong: (v) => {
      const exact = Math.floor((N(v, 'tot') * 100) / N(v, 'k'));
      const right = share(N(v, 'tot') * 100, N(v, 'k'));
      return slipsOf(right, [exact, exact + 1, exact - 1, Math.floor(N(v, 'tot') / N(v, 'k')) * 100]);
    },
    why: (v, a) => `${v.tt} ÷ ${v.k} ≈ ${a}.`,
  }),
  t({
    sub: 'u08-03',
    prompt: '{tt} ლარი თანაბრად გაიყო {k} ბავშვზე. რამდენი ლარი მიიღო თითოეულმა?',
    vars: { k: C([2, 4, 5, 8]), per: I(125, 975, { step: 25 }), tot: D((v) => N(v, 'k') * N(v, 'per')), tt: price('tot') },
    constraints: [{ test: (v) => N(v, 'per') % 100 !== 0 && N(v, 'tot') % 100 !== 0 && N(v, 'tot') < 10000, note: 'a share with tetri' }],
    answer: (v) => lari(N(v, 'per')),
    wrong: (v) => slipsOf(N(v, 'per'), [Math.floor(N(v, 'tot') / (N(v, 'k') + 1))]),
    why: (v, a) => `${v.tt} ÷ ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u08-03',
    d: 2,
    prompt: '{tt} ლარი თანაბრად უნდა გაიყოს {k} ადამიანზე. რამდენი ლარი შეხვდება თითოეულს, თუ თანხას უახლოეს თეთრამდე დავამრგვალებთ?',
    vars: { k: C([7, 8, 12, 13, 16]), tot: C([100, 200, 300, 150, 250, 500]), tt: S('tot') },
    constraints: [{ test: (v) => (N(v, 'tot') * 100) % N(v, 'k') !== 0 && ((N(v, 'tot') * 100) % N(v, 'k')) * 2 !== N(v, 'k'), note: 'needs rounding, no tie' }],
    answer: (v) => lari(share(N(v, 'tot') * 100, N(v, 'k'))),
    wrong: (v) => {
      const exact = Math.floor((N(v, 'tot') * 100) / N(v, 'k'));
      return slipsOf(share(N(v, 'tot') * 100, N(v, 'k')), [exact, exact + 1, exact - 1]);
    },
    why: (v, a) => `${v.tt} ÷ ${v.k} ≈ ${a}.`,
  }),

  // ═════════ U08.4 — საკმარისია თუ არა თანხა? ═════════
  haveNeed('u08-04', 1,
    '{whom} აქვს {h} ლარი. მას სურს იყიდოს წიგნი {at} ლარად და კალამი {bt} ლარად. ეყოფა თუ არა თანხა და რამდენი დარჩება ან დააკლდება?',
    { spec: NAMES, whom: D((v) => String(v.spec).split('|')[1]!), h: C([15, 20, 25, 30]), a: I(850, 1950, { step: 50 }), b: I(250, 850, { step: 50 }), at: price('a'), bt: price('b') },
    (v) => N(v, 'h') * 100, (v) => N(v, 'a') + N(v, 'b'),
    (v) => `${v.at} + ${v.bt} = ${cash(N(v, 'a') + N(v, 'b'))}; ${v.h} და ${cash(N(v, 'a') + N(v, 'b'))} შევადაროთ:`),
  haveNeed('u08-04', 1,
    '{whom} აქვს {h} ლარი. მას სურს იყიდოს ბურთი {at} ლარად და წყალი {bt} ლარად. ეყოფა თუ არა თანხა და რამდენი დარჩება ან დააკლდება?',
    { spec: NAMES, whom: D((v) => String(v.spec).split('|')[1]!), h: C([25, 30, 35, 40]), a: I(1850, 3250, { step: 50 }), b: I(150, 450, { step: 50 }), at: price('a'), bt: price('b') },
    (v) => N(v, 'h') * 100, (v) => N(v, 'a') + N(v, 'b'),
    (v) => `${v.at} + ${v.bt} = ${cash(N(v, 'a') + N(v, 'b'))}; ${v.h} და ${cash(N(v, 'a') + N(v, 'b'))} შევადაროთ:`),
  haveNeed('u08-04', 1,
    '{who} სურს იყიდოს {k} რვეული, თითოეული {ct} ლარად. მას აქვს {h} ლარი. ეყოფა თუ არა თანხა და რამდენი დააკლდება ან დარჩება?',
    { spec: NAMES, who: D((v) => String(v.spec).split('|')[1]!), k: C([3, 4, 5, 6]), c: C([380, 420, 480, 520, 350, 275]), h: C([10, 15, 20, 25]), ct: price('c') },
    (v) => N(v, 'h') * 100, (v) => N(v, 'k') * N(v, 'c'),
    (v) => `${v.k} × ${v.ct} = ${cash(N(v, 'k') * N(v, 'c'))}; ${v.h} და ${cash(N(v, 'k') * N(v, 'c'))} შევადაროთ:`),
  haveNeed('u08-04', 2,
    '{whom} აქვს {h} ლარი. მას სურს იყიდოს ფეხსაცმელი {at} ლარად და მაისური {bt} ლარად. ეყოფა თუ არა თანხა და რამდენი დააკლდება ან დარჩება?',
    { spec: NAMES, whom: D((v) => String(v.spec).split('|')[1]!), h: C([80, 100, 120, 150]), a: I(5990, 8990, { step: 100 }), b: I(1900, 3500, { step: 100 }), at: price('a'), bt: price('b') },
    (v) => N(v, 'h') * 100, (v) => N(v, 'a') + N(v, 'b'),
    (v) => `${v.at} + ${v.bt} = ${cash(N(v, 'a') + N(v, 'b'))}; ${v.h} და ${cash(N(v, 'a') + N(v, 'b'))} შევადაროთ:`),
  haveNeed('u08-04', 2,
    'მოსწავლემ უნდა იყიდოს {k} წიგნი, თითოეული {ct} ლარად, და ჩანთა {bt} ლარად. თუ მას აქვს {h} ლარი, ეყოფა თუ არა თანხა და რამდენი დარჩება ან დააკლდება?',
    { k: C([2, 3]), c: C([1650, 1450, 1850, 1250, 2150]), b: C([4200, 3800, 4500, 3500]), h: C([70, 80, 90, 100]), ct: price('c'), bt: price('b') },
    (v) => N(v, 'h') * 100, (v) => N(v, 'k') * N(v, 'c') + N(v, 'b'),
    (v) => `${v.k} × ${v.ct} + ${v.bt} = ${cash(N(v, 'k') * N(v, 'c') + N(v, 'b'))}; ${v.h} და ${cash(N(v, 'k') * N(v, 'c') + N(v, 'b'))} შევადაროთ:`),
  haveNeed('u08-04', 3,
    'მაღაზიაში კალამი ღირს {at} ლარი, რვეული — {bt} ლარი, ხოლო ფანქარი — {ct} ლარი. {whom} აქვს {h} ლარი და სურს თითოეული ნივთიდან 2 ცალი იყიდოს. ეყოფა თუ არა თანხა და რამდენი დარჩება ან დააკლდება?',
    { spec: NAMES, whom: D((v) => String(v.spec).split('|')[1]!), a: C([240, 260, 220, 180]), b: C([360, 340, 420, 380]), c: C([180, 160, 140, 120]), h: C([15, 18, 20, 22]), at: price('a'), bt: price('b'), ct: price('c') },
    (v) => N(v, 'h') * 100, (v) => 2 * (N(v, 'a') + N(v, 'b') + N(v, 'c')),
    (v) => `2 × (${v.at} + ${v.bt} + ${v.ct}) = ${cash(2 * (N(v, 'a') + N(v, 'b') + N(v, 'c')))}; ${v.h} და ${cash(2 * (N(v, 'a') + N(v, 'b') + N(v, 'c')))} შევადაროთ:`),

  // ═════════ U08.5 — ჯარიმები ═════════
  t({
    sub: 'u08-05',
    prompt: 'მძღოლს დაუწესეს {f} ლარიანი ჯარიმა. მან გადაიხადა {p} ლარი. რამდენი ლარი დარჩა გადასახდელი?',
    vars: { f: C([50, 80, 100, 120, 150, 200]), p: C([20, 30, 40, 25, 35, 60]) },
    constraints: [{ test: (v) => N(v, 'p') < N(v, 'f'), note: 'part-paid' }],
    answer: (v) => lari((N(v, 'f') - N(v, 'p')) * 100),
    wrong: (v) => slipsOf((N(v, 'f') - N(v, 'p')) * 100, [(N(v, 'f') + N(v, 'p')) * 100, N(v, 'p') * 100]),
    why: (v, a) => `${v.f} − ${v.p} = ${a}.`,
  }),
  t({
    sub: 'u08-05',
    prompt: 'ჯარიმა შეადგენს {f} ლარს. თუ ჯარიმის {p}% დამატებით დაერიცხა, რამდენია გადასახდელი თანხა?',
    vars: { f: C([100, 200, 80, 120, 150, 250]), p: C([10, 15, 20, 25, 5, 50]) },
    constraints: [{ test: (v) => (N(v, 'f') * N(v, 'p')) % 10 === 0, note: 'tidy tetri' }],
    answer: (v) => lari(N(v, 'f') * (100 + N(v, 'p'))),
    wrong: (v) => slipsOf(N(v, 'f') * (100 + N(v, 'p')), [N(v, 'f') * N(v, 'p'), N(v, 'f') * (100 - N(v, 'p'))]),
    why: (v, a) => `${v.f} × ${v.p} ÷ 100 = ${cash(N(v, 'f') * N(v, 'p'))}; ${v.f} + ${cash(N(v, 'f') * N(v, 'p'))} = ${a}.`,
  }),
  t({
    sub: 'u08-05',
    prompt: 'მძღოლს ჰქონდა ორი ჯარიმა: {a} ლარი და {b} ლარი. რამდენი ლარია ჯამში გადასახდელი?',
    vars: { a: C([30, 40, 50, 60, 80]), b: C([55, 65, 75, 85, 95, 100]) },
    answer: (v) => lari((N(v, 'a') + N(v, 'b')) * 100),
    wrong: (v) => slipsOf((N(v, 'a') + N(v, 'b')) * 100, [(N(v, 'b') - N(v, 'a')) * 100]),
    why: (v, a) => `${v.a} + ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u08-05',
    prompt: 'ჯარიმა იყო {f} ლარი. მისი {p}% გადაიხადეს. რამდენი ლარი დარჩა გადასახდელი?',
    vars: { f: C([120, 200, 160, 240, 80, 300]), p: C([25, 50, 10, 20, 75, 40]) },
    constraints: [{ test: (v) => (N(v, 'f') * N(v, 'p')) % 10 === 0, note: 'tidy tetri' }],
    answer: (v) => lari(N(v, 'f') * (100 - N(v, 'p'))),
    wrong: (v) => slipsOf(N(v, 'f') * (100 - N(v, 'p')), [N(v, 'f') * N(v, 'p'), N(v, 'f') * 100 - N(v, 'p') * 100]),
    why: (v, a) => `${v.f} × ${v.p} ÷ 100 = ${cash(N(v, 'f') * N(v, 'p'))}; ${v.f} − ${cash(N(v, 'f') * N(v, 'p'))} = ${a}.`,
  }),
  t({
    sub: 'u08-05',
    prompt: 'ჯარიმის თანხა {f} ლარია. დაგვიანებული გადახდისთვის დაემატა {e} ლარი. რამდენია საბოლოო გადასახდელი თანხა?',
    vars: { f: C([80, 100, 60, 120, 150]), e: C([10, 15, 20, 25, 5]) },
    answer: (v) => lari((N(v, 'f') + N(v, 'e')) * 100),
    wrong: (v) => slipsOf((N(v, 'f') + N(v, 'e')) * 100, [(N(v, 'f') - N(v, 'e')) * 100]),
    why: (v, a) => `${v.f} + ${v.e} = ${a}.`,
  }),
  t({
    sub: 'u08-05',
    d: 2,
    prompt: 'მძღოლს აქვს სამი ჯარიმა: {a} ლარი, {b} ლარი და {c} ლარი. მან გადაიხადა მთლიანი თანხის ნახევარი. რამდენი ლარი დარჩა გადასახდელი?',
    vars: { a: C([45, 60, 35, 55, 25]), b: C([60, 50, 40, 70, 30]), c: C([95, 85, 75, 65, 45]) },
    constraints: [{ test: (v) => (N(v, 'a') + N(v, 'b') + N(v, 'c')) % 2 === 0, note: 'half is whole' }],
    answer: (v) => lari(((N(v, 'a') + N(v, 'b') + N(v, 'c')) / 2) * 100),
    wrong: (v) => slipsOf(((N(v, 'a') + N(v, 'b') + N(v, 'c')) / 2) * 100, [(N(v, 'a') + N(v, 'b') + N(v, 'c')) * 100]),
    why: (v, a) => `${v.a} + ${v.b} + ${v.c} = ${N(v, 'a') + N(v, 'b') + N(v, 'c')}; ${N(v, 'a') + N(v, 'b') + N(v, 'c')} ÷ 2 = ${a}.`,
  }),
];
