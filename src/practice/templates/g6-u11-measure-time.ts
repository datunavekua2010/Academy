import type { QuestionTemplate, Vars } from './types';
import { C, D, F, I, N, SPEC, dec, group, q6, sg } from './g6-helpers';
import { dd } from './g6-dec';

/**
 * Grade VI — Unit 11: გაზომვა და დრო (measurement and time).
 *
 * Converted from the academy's `U11` bank: 9 subtopics × 6 questions.
 *
 * Lengths, masses and volumes are carried as whole numbers of the smaller unit
 * and printed through `dd`, so a conversion never meets floating-point noise.
 * Times of day and durations are whole minutes printed as `HH:MM` and `h სთ m წთ`.
 * Wrong options are the slips of the topic: a factor of ten, the wrong
 * direction of a conversion, minutes borrowed without the hour.
 */

export const G6_U11_SUBTOPICS = [
  'u11-01', 'u11-02', 'u11-03', 'u11-04', 'u11-05', 'u11-06', 'u11-07', 'u11-08', 'u11-09',
] as const;

const T = 'g6-measure-time';
let seq = 0;
const nextId = (): string => `g6-u11-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

/** `12,5 კმ`. */
const val = (x: number, unit: string): string => `${dec(x, 3)} ${unit}`;
/** A value in several wrong powers of ten, plus any extra slips. */
const tenfold = (x: number, unit: string, extra: number[] = []): string[] =>
  [...extra, x * 10, x / 10, x * 100, x / 100, x * 1000, x / 1000]
    .filter((y) => Number.isFinite(y) && y > 0 && Math.abs(y - x) > 1e-9)
    .map((y) => val(y, unit));

/** A scale as printed: `1:100 000`. */
const scale = (s: number): string => `1:${group(s)}`;

/** Minutes → `2 სთ 35 წთ`, `45 წთ`, `3 სთ`. */
const hm = (m: number): string => {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h === 0 ? `${r} წთ` : r === 0 ? `${h} სთ` : `${h} სთ ${r} წთ`;
};
/** Minutes after midnight → `09:05`. */
const clock = (m: number): string => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const timeSlips = (m: number, unitMinutes: number[], fmt: (x: number) => string): string[] =>
  unitMinutes.flatMap((d) => [m + d, m - d]).filter((x) => x > 0).map(fmt);
const SHIFTS = [5, 10, 15, 20, 30, 60, 25, 40];

/** Several choose-the-reasonable-quantity rows: `thing|a|b|c|index of the right one`. */
const sense = (sub: string, d: 1 | 2, prompt: string, rows: string[]): QuestionTemplate =>
  t({
    sub,
    d,
    prompt,
    vars: { spec: SPEC(rows), thing: F(0), o1: F(1), o2: F(2), o3: F(3) },
    optionCount: 3,
    answer: (v) => String([v.o1, v.o2, v.o3][Number(String(v.spec).split('|')[4])]),
    options: (v, right) => [right, ...[v.o1, v.o2, v.o3].map(String).filter((x) => x !== right)],
    why: (v, a) => `${String(v.thing)}: ${[v.o1, v.o2, v.o3].map(String).join(', ')}. გონივრულია ${a}.`,
  });

export const G6_U11_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U11.1 — მასშტაბი ═════════
  t({
    sub: 'u11-01',
    prompt: 'რუკაზე ორ ქალაქს შორის მანძილია {c} სმ. თუ მასშტაბია {st}, რამდენი კილომეტრია რეალური მანძილი?',
    vars: { c: I(2, 12), s: C([50000, 100000, 200000, 250000, 500000]), st: D((v) => scale(N(v, 's'))) },
    answer: (v) => val((N(v, 'c') * N(v, 's')) / 100000, 'კმ'),
    wrong: (v) => tenfold((N(v, 'c') * N(v, 's')) / 100000, 'კმ', [N(v, 'c') * N(v, 's') / 1000, N(v, 'c') * N(v, 's')]),
    why: (v, a) => `${v.c} × ${group(N(v, 's'))} = ${group(N(v, 'c') * N(v, 's'))} სმ = ${a}.`,
  }),
  t({
    sub: 'u11-01',
    prompt: 'რუკის მასშტაბია {st}. რუკაზე გზის სიგრძეა {c} სმ. იპოვე რეალური მანძილი კილომეტრებში.',
    vars: { c: I(3, 15), s: C([50000, 100000, 200000, 250000, 500000]), st: D((v) => scale(N(v, 's'))) },
    answer: (v) => val((N(v, 'c') * N(v, 's')) / 100000, 'კმ'),
    wrong: (v) => tenfold((N(v, 'c') * N(v, 's')) / 100000, 'კმ', [N(v, 'c') * N(v, 's') / 1000, N(v, 'c') * N(v, 's')]),
    why: (v, a) => `${v.c} × ${group(N(v, 's'))} = ${group(N(v, 'c') * N(v, 's'))} სმ = ${a}.`,
  }),
  t({
    sub: 'u11-01',
    d: 2,
    prompt: 'რეალური მანძილი ორ სოფელს შორის {km} კმ-ია. თუ მასშტაბია {st}, რამდენი სანტიმეტრი იქნება ეს მანძილი რუკაზე?',
    vars: { c: I(2, 20), s: C([100000, 200000, 250000, 300000, 400000, 500000]), st: D((v) => scale(N(v, 's'))), km: D((v) => dd((N(v, 'c') * N(v, 's')) / 1000, 2)) },
    answer: (v) => val(N(v, 'c'), 'სმ'),
    wrong: (v) => tenfold(N(v, 'c'), 'სმ', [N(v, 'c') * N(v, 's') / 100000 * 1000]),
    why: (v, a) => `${v.km} კმ = ${group(N(v, 'c') * N(v, 's') / 100)} მ = ${group(N(v, 'c') * N(v, 's'))} სმ; ${group(N(v, 'c') * N(v, 's'))} ÷ ${group(N(v, 's'))} = ${a}.`,
  }),
  t({
    sub: 'u11-01',
    d: 2,
    prompt: 'ნახაზზე ოთახის სიგრძეა {c} სმ. თუ მასშტაბია {st}, რამდენი მეტრია ოთახის რეალური სიგრძე?',
    vars: { c: I(3, 15), s: C([20, 25, 50, 100, 200]), st: D((v) => scale(N(v, 's'))) },
    answer: (v) => val((N(v, 'c') * N(v, 's')) / 100, 'მ'),
    wrong: (v) => tenfold((N(v, 'c') * N(v, 's')) / 100, 'მ', [N(v, 'c') * N(v, 's')]),
    why: (v, a) => `${v.c} × ${v.s} = ${N(v, 'c') * N(v, 's')} სმ = ${a}.`,
  }),
  t({
    sub: 'u11-01',
    d: 2,
    prompt: 'რუკაზე მდინარის მონაკვეთის სიგრძეა {ct} სმ. მასშტაბია {st}. იპოვე მონაკვეთის რეალური სიგრძე კილომეტრებში.',
    vars: { c: I(11, 99), s: C([100000, 200000, 250000, 400000, 500000]), st: D((v) => scale(N(v, 's'))), ct: D((v) => dd(N(v, 'c'), 1)) },
    constraints: [{ test: (v) => N(v, 'c') % 10 !== 0, note: 'one decimal place' }],
    answer: (v) => val((N(v, 'c') * N(v, 's')) / 1000000, 'კმ'),
    wrong: (v) => tenfold((N(v, 'c') * N(v, 's')) / 1000000, 'კმ'),
    why: (v, a) => `${v.ct} × ${group(N(v, 's'))} = ${dd(N(v, 'c') * N(v, 's'), 1)} სმ = ${a}.`,
  }),
  t({
    sub: 'u11-01',
    d: 2,
    prompt: 'რეალური მანძილი ორ ქალაქს შორის {km} კმ-ია. რუკაზე ეს მანძილი {c} სმ-ითაა გამოსახული. რა არის რუკის მასშტაბი?',
    vars: { c: I(2, 12), s: C([100000, 200000, 250000, 300000, 400000, 500000]), km: D((v) => dd((N(v, 'c') * N(v, 's')) / 1000, 2)) },
    options: (v, right) => [right, scale(N(v, 's') * 10), scale(N(v, 's') / 10), scale(N(v, 's') * 100), scale(N(v, 's') / 100), scale(N(v, 's') + 50000)],
    answer: (v) => scale(N(v, 's')),
    why: (v, a) => `${v.km} კმ = ${group((N(v, 'c') * N(v, 's')) / 100)} მ = ${group(N(v, 'c') * N(v, 's'))} სმ; ${group(N(v, 'c') * N(v, 's'))} ÷ ${v.c} = ${group(N(v, 's'))}, ანუ ${a}.`,
  }),

  // ═════════ U11.2 — სიდიდის მიახლოებითი შეფასება ═════════
  sense('u11-02', 1, 'რომელი სიდიდეა უფრო გონივრული {thing}: {o1}, {o2} თუ {o3}?', [
    'სკოლის დერეფნის სიგრძისთვის|2 მ|20 მ|200 მ|1',
    'ფეხბურთის მოედნის სიგრძისთვის|1 მ|10 მ|100 მ|2',
    'სასკოლო კლასის სიგრძისთვის|8 მ|80 მ|800 მ|0',
    'ავტობუსის სიგრძისთვის|1,2 მ|12 მ|120 მ|1',
    'საცურაო აუზის სიგრძისთვის|5 მ|50 მ|500 მ|1',
    'ორსართულიანი სახლის სიმაღლისთვის|7 მ|70 მ|700 მ|0',
    'ტენისის მოედნის სიგრძისთვის|2 მ|24 მ|240 მ|1',
    'ბავშვის ნაბიჯის სიგრძისთვის|5 სმ|50 სმ|5 მ|1',
  ]),
  sense('u11-02', 1, 'შეაფასე {thing}: {o1}, {o2} თუ {o3}?', [
    'კლასის კარის სიმაღლე|20 სმ|2 მ|20 მ|1',
    'მაგიდის სიმაღლე|7 სმ|70 სმ|7 მ|1',
    'ზრდასრული ადამიანის სიმაღლე|17 სმ|170 სმ|17 მ|1',
    'ფანქრის სიგრძე|1,7 სმ|17 სმ|170 სმ|1',
    'ფეხსაცმლის სიგრძე|2,6 სმ|26 სმ|260 სმ|1',
    'მობილური ტელეფონის სიგრძე|1,5 სმ|15 სმ|150 სმ|1',
    'ხელის გულის სიგანე|8 მმ|8 სმ|80 სმ|1',
    'რვეულის სისქე|2 მმ|2 სმ|20 სმ|0',
  ]),
  sense('u11-02', 2, 'რომელი ერთეულია უფრო შესაფერისი {thing} გამოსახატავად: {o1}, {o2} თუ {o3}?', [
    'ქალაქებს შორის მანძილის|მილიმეტრი|მეტრი|კილომეტრი|2',
    'ფანქრის სისქის|მილიმეტრი|მეტრი|კილომეტრი|0',
    'ფეხბურთის მოედნის სიგრძის|სანტიმეტრი|მეტრი|კილომეტრი|1',
    'მწერის სხეულის სიგრძის|მილიმეტრი|მეტრი|კილომეტრი|0',
    'ქვეყნებს შორის მანძილის|სანტიმეტრი|მეტრი|კილომეტრი|2',
    'ოთახის სიგრძის|მილიმეტრი|მეტრი|კილომეტრი|1',
    'სატვირთო მანქანის მასის|გრამი|კილოგრამი|ტონა|2',
    'ჭიქის ტევადობის|მილილიტრი|ლიტრი|კუბური მეტრი|0',
  ]),
  sense('u11-02', 1, 'შეაფასე {thing}: {o1}, {o2} თუ {o3}?', [
    'წყლის ბოთლის ტევადობა|5 მლ|500 მლ|50 ლ|1',
    'ჭიქა წყლის ტევადობა|2 მლ|200 მლ|20 ლ|1',
    'ჩაის კოვზის ტევადობა|5 მლ|50 მლ|5 ლ|0',
    'აბაზანის ტევადობა|15 ლ|150 ლ|1 500 ლ|1',
    'რძის კოლოფის ტევადობა|1 ლ|10 ლ|100 ლ|0',
    'მანქანის საწვავის ავზის ტევადობა|5 ლ|50 ლ|500 ლ|1',
    'ვედროს ტევადობა|1 ლ|10 ლ|100 ლ|1',
    'პატარა ბოთლის (სიროფის) ტევადობა|10 მლ|1 ლ|10 ლ|0',
  ]),
  sense('u11-02', 1, 'რომელი სიდიდეა უფრო გონივრული {thing}: {o1}, {o2} თუ {o3}?', [
    'მოსწავლის მასისთვის|4 კგ|45 კგ|450 კგ|1',
    'ვაშლის მასისთვის|2 გ|200 გ|20 კგ|1',
    'კატის მასისთვის|4 კგ|40 კგ|400 კგ|0',
    'ზრდასრული კაცის მასისთვის|8 კგ|80 კგ|800 კგ|1',
    'წიგნის მასისთვის|3 გ|300 გ|30 კგ|1',
    'ავტომობილის მასისთვის|15 კგ|150 კგ|1,5 ტ|2',
    'ფანქრის მასისთვის|5 გ|500 გ|5 კგ|0',
    'პური ბატონის მასისთვის|5 გ|500 გ|50 კგ|1',
  ]),
  sense('u11-02', 1, 'შეაფასე {thing}: {o1}, {o2} თუ {o3}?', [
    'ერთი გაკვეთილის ხანგრძლივობა|5 წამი|45 წუთი|12 საათი|1',
    'ფილმის ხანგრძლივობა|2 წუთი|2 საათი|2 დღე|1',
    'კბილების გასუფთავების ხანგრძლივობა|2 წამი|2 წუთი|2 საათი|1',
    'სკოლაში ყოფნის ხანგრძლივობა დღეში|6 წუთი|6 საათი|6 დღე|1',
    'თვალის დახამხამების ხანგრძლივობა|0,3 წამი|3 წუთი|3 საათი|0',
    'ზაფხულის არდადეგების ხანგრძლივობა|3 დღე|3 თვე|3 წელი|1',
    'ხელების დაბანის ხანგრძლივობა|20 წამი|20 წუთი|20 საათი|0',
    'ღამის ძილის ხანგრძლივობა|9 წუთი|9 საათი|9 დღე|1',
  ]),

  // ═════════ U11.3 — სიგრძის ერთეულები ═════════
  t({
    sub: 'u11-03',
    prompt: 'გადაიყვანე {mt} მ სანტიმეტრებში.',
    vars: { m: I(11, 99), mt: D((v) => dd(N(v, 'm'), 1)) },
    constraints: [{ test: (v) => N(v, 'm') % 10 !== 0, note: 'one decimal place' }],
    answer: (v) => val(N(v, 'm') * 10, 'სმ'),
    wrong: (v) => tenfold(N(v, 'm') * 10, 'სმ', [N(v, 'm')]),
    why: (v, a) => `1 მ = 100 სმ; ${v.mt} × 100 = ${a}.`,
  }),
  t({
    sub: 'u11-03',
    d: 2,
    prompt: 'გადაიყვანე {mm} მმ მეტრებსა და სანტიმეტრებში.',
    vars: { c: I(105, 999), mm: D((v) => group(N(v, 'c') * 10)) },
    constraints: [{ test: (v) => N(v, 'c') % 100 !== 0 && N(v, 'c') % 10 !== 0, note: 'a metre part and a centimetre part' }],
    options: (v, right) => {
      const c = N(v, 'c');
      const mm = (x: number) => `${Math.floor(x / 100)} მ ${x % 100} სმ`;
      return [right, mm(c * 10 > 0 ? Math.floor(c / 10) * 100 + (c % 100) : c), `${Math.floor(c / 10)} მ ${(c % 10) * 10} სმ`, `${Math.floor(c / 100)} მ ${c % 100 * 10} სმ`, `${c % 100} მ ${Math.floor(c / 100)} სმ`, `${Math.floor(c / 100)} მ ${dec((c % 100) / 10, 1)} სმ`];
    },
    answer: (v) => `${Math.floor(N(v, 'c') / 100)} მ ${N(v, 'c') % 100} სმ`,
    why: (v, a) => `${v.mm} მმ = ${N(v, 'c')} სმ = ${a}.`,
  }),
  t({
    sub: 'u11-03',
    prompt: 'რამდენი მილიმეტრია {x} სმ-ში?',
    vars: { h: I(101, 999), x: D((v) => dd(N(v, 'h'), 2)) },
    constraints: [{ test: (v) => N(v, 'h') % 100 !== 0 && N(v, 'h') % 10 !== 0, note: 'two places' }],
    answer: (v) => val(N(v, 'h') / 10, 'მმ'),
    wrong: (v) => tenfold(N(v, 'h') / 10, 'მმ', [N(v, 'h') / 100]),
    why: (v, a) => `1 სმ = 10 მმ; ${v.x} × 10 = ${a}.`,
  }),
  t({
    sub: 'u11-03',
    prompt: 'გამოხატე {k} კმ {m} მ მხოლოდ მეტრებში.',
    vars: { k: I(2, 19), f: I(1, 19), m: D((v) => N(v, 'f') * 50) },
    constraints: [{ test: (v) => N(v, 'm') < 1000, note: 'under a kilometre' }],
    answer: (v) => val(N(v, 'k') * 1000 + N(v, 'm'), 'მ'),
    wrong: (v) => [N(v, 'k') * 100 + N(v, 'm'), N(v, 'k') * 10000 + N(v, 'm'), N(v, 'k') + N(v, 'm'), N(v, 'k') * 1000 + N(v, 'm') / 10, N(v, 'k') * 1000 * N(v, 'm') / 100].filter((x) => x > 0 && Number.isInteger(x)).map((x) => val(x, 'მ')),
    why: (v, a) => `${v.k} კმ = ${group(N(v, 'k') * 1000)} მ; ${group(N(v, 'k') * 1000)} + ${v.m} = ${a}.`,
  }),
  t({
    sub: 'u11-03',
    prompt: 'რამდენი სანტიმეტრია {x} მ-ში?',
    vars: { h: I(101, 999), x: D((v) => dd(N(v, 'h'), 2)) },
    constraints: [{ test: (v) => N(v, 'h') % 100 !== 0 && N(v, 'h') % 10 !== 0, note: 'two places' }],
    answer: (v) => val(N(v, 'h'), 'სმ'),
    wrong: (v) => tenfold(N(v, 'h'), 'სმ'),
    why: (v, a) => `1 მ = 100 სმ; ${v.x} × 100 = ${a}.`,
  }),
  t({
    sub: 'u11-03',
    d: 2,
    prompt: 'ლენტის სიგრძეა {m} მ {tc} სმ. მისგან მოჭრეს {s} სმ. რამდენი სანტიმეტრი ლენტი დარჩა?',
    vars: { m: I(3, 9), c: I(2, 19), s: I(110, 450), tc: D((v) => N(v, 'c') * 5) },
    constraints: [{ test: (v) => N(v, 'm') * 100 + N(v, 'tc') > N(v, 's') + 20, note: 'something is left' }],
    answer: (v) => val(N(v, 'm') * 100 + N(v, 'tc') - N(v, 's'), 'სმ'),
    wrong: (v) => [N(v, 'm') * 100 + N(v, 'tc') + N(v, 's'), N(v, 'm') * 10 + N(v, 'tc') - N(v, 's'), N(v, 'm') + N(v, 'tc') - N(v, 's'), N(v, 'm') * 100 - N(v, 'tc') - N(v, 's'), N(v, 's') - N(v, 'm') * 100 - N(v, 'tc'), N(v, 'm') * 100 + N(v, 'tc') - N(v, 's') + 10, N(v, 'm') * 100 + N(v, 'tc') - N(v, 's') - 10, N(v, 'm') * 100 + N(v, 'tc') - N(v, 's') + 100].filter((x) => x > 0).map((x) => val(x, 'სმ')),
    why: (v, a) => `${v.m} მ ${v.tc} სმ = ${N(v, 'm') * 100 + N(v, 'tc')} სმ; ${N(v, 'm') * 100 + N(v, 'tc')} − ${v.s} = ${a}.`,
  }),

  // ═════════ U11.4 — მილები და კილომეტრები ═════════
  ...([
    [1, 'გადაიყვანე {mi} მილი კილომეტრებში.', I(2, 30), 'km'],
    [1, 'დაახლოებით რამდენი კილომეტრია {mi} მილი?', I(31, 90), 'km'],
  ] as const).map(([d, p, mi]) =>
    t({
      sub: 'u11-04', d,
      prompt: `გამოიყენე 1 მილი ≈ 1,6 კმ. ${p}`,
      vars: { mi },
      answer: (v) => val((N(v, 'mi') * 16) / 10, 'კმ'),
      wrong: (v) => tenfold((N(v, 'mi') * 16) / 10, 'კმ', [N(v, 'mi') / 1.6, N(v, 'mi') + 1.6]),
      why: (v, a) => `${v.mi} × 1,6 = ${a}.`,
    }),
  ),
  ...([
    ['გამოიყენე 1 მილი ≈ 1,6 კმ. დაახლოებით რამდენი მილია {km} კმ?', 2],
    ['გამოიყენე 1 მილი ≈ 1,6 კმ. ორ ქალაქს შორის მანძილია {km} კმ. დაახლოებით რამდენი მილია ეს?', 2],
  ] as const).map(([p, d]) =>
    t({
      sub: 'u11-04', d,
      prompt: p,
      vars: { k: I(2, 20), km: D((v) => N(v, 'k') * 8) },
      answer: (v) => val(N(v, 'k') * 5, 'მილი'),
      wrong: (v) => tenfold(N(v, 'k') * 5, 'მილი', [N(v, 'k') * 8 * 1.6, N(v, 'k') * 8 - 1.6, N(v, 'k') * 8 + 1.6]),
      why: (v, a) => `${v.km} ÷ 1,6 = ${a}.`,
    }),
  ),
  t({
    sub: 'u11-04',
    prompt: 'გამოიყენე 1 მილი ≈ 1,6 კმ. ველოსიპედისტმა გაიარა {mi} მილი. დაახლოებით რამდენი კილომეტრი გაიარა?',
    vars: { mi: I(5, 40) },
    answer: (v) => val((N(v, 'mi') * 16) / 10, 'კმ'),
    wrong: (v) => tenfold((N(v, 'mi') * 16) / 10, 'კმ', [N(v, 'mi') / 1.6, N(v, 'mi') + 1.6]),
    why: (v, a) => `${v.mi} × 1,6 = ${a}.`,
  }),
  t({
    sub: 'u11-04',
    d: 2,
    prompt: 'გამოიყენე 1 მილი ≈ 1,6 კმ. მორბენალმა გაიარა {mit} მილი. დაახლოებით რამდენი კილომეტრია ეს?',
    vars: { m: I(11, 99), mit: D((v) => dd(N(v, 'm'), 1)) },
    constraints: [{ test: (v) => N(v, 'm') % 10 !== 0, note: 'one decimal place' }],
    answer: (v) => val((N(v, 'm') * 16) / 100, 'კმ'),
    wrong: (v) => tenfold((N(v, 'm') * 16) / 100, 'კმ', [N(v, 'm') / 16, N(v, 'm') / 10 + 1.6]),
    why: (v, a) => `${v.mit} × 1,6 = ${a}.`,
  }),

  // ═════════ U11.5 — საზომი ერთეულების გარდაქმნა ═════════
  t({
    sub: 'u11-05',
    prompt: 'გადაიყვანე {xt} კგ გრამებში.',
    vars: { x: I(11, 99), xt: D((v) => dd(N(v, 'x'), 1)) },
    constraints: [{ test: (v) => N(v, 'x') % 10 !== 0, note: 'one place' }],
    answer: (v) => val(N(v, 'x') * 100, 'გ'),
    wrong: (v) => tenfold(N(v, 'x') * 100, 'გ', [N(v, 'x')]),
    why: (v, a) => `1 კგ = 1 000 გ; ${v.xt} × 1 000 = ${a}.`,
  }),
  t({
    sub: 'u11-05',
    prompt: 'გადაიყვანე {xt} ლიტრი მილილიტრებში.',
    vars: { x: I(11, 99), xt: D((v) => dd(N(v, 'x'), 1)) },
    constraints: [{ test: (v) => N(v, 'x') % 10 !== 0, note: 'one place' }],
    answer: (v) => val(N(v, 'x') * 100, 'მლ'),
    wrong: (v) => tenfold(N(v, 'x') * 100, 'მლ', [N(v, 'x')]),
    why: (v, a) => `1 ლ = 1 000 მლ; ${v.xt} × 1 000 = ${a}.`,
  }),
  t({
    sub: 'u11-05',
    prompt: 'რამდენი წუთია {xt} საათში?',
    vars: { qh: I(5, 40), xt: D((v) => dd(N(v, 'qh') * 25, 2)) },
    constraints: [{ test: (v) => N(v, 'qh') % 4 !== 0, note: 'a fractional hour' }],
    answer: (v) => val(N(v, 'qh') * 15, 'წთ'),
    wrong: (v) => [N(v, 'qh') * 25, N(v, 'qh') * 10, N(v, 'qh') * 15 + 25, N(v, 'qh') * 15 - 15, N(v, 'qh') * 100 / 4 + 5, N(v, 'qh') * 15 + 15].filter((x) => x > 0).map((x) => val(x, 'წთ')),
    why: (v, a) => `${v.xt} × 60 = ${a}.`,
  }),
  t({
    sub: 'u11-05',
    prompt: 'გადაიყვანე {g} გრამი კილოგრამებში.',
    vars: { h: I(11, 99), g: D((v) => group(N(v, 'h') * 100)) },
    constraints: [{ test: (v) => N(v, 'h') % 10 !== 0, note: 'not a whole number of kilograms' }],
    answer: (v) => val(N(v, 'h') / 10, 'კგ'),
    wrong: (v) => tenfold(N(v, 'h') / 10, 'კგ'),
    why: (v, a) => `1 000 გ = 1 კგ; ${v.g} ÷ 1 000 = ${a}.`,
  }),
  t({
    sub: 'u11-05',
    d: 2,
    prompt: 'რამდენი მილილიტრია {l} ლიტრსა და {ml} მილილიტრში?',
    vars: { l: I(2, 9), f: I(1, 19), ml: D((v) => N(v, 'f') * 50) },
    constraints: [{ test: (v) => N(v, 'ml') < 1000, note: 'under a litre' }],
    answer: (v) => val(N(v, 'l') * 1000 + N(v, 'ml'), 'მლ'),
    wrong: (v) => [N(v, 'l') * 100 + N(v, 'ml'), N(v, 'l') * 10000 + N(v, 'ml'), N(v, 'l') + N(v, 'ml'), N(v, 'l') * 1000 + N(v, 'ml') / 10, N(v, 'l') * 1000 - N(v, 'ml')].filter((x) => x > 0 && Number.isInteger(x)).map((x) => val(x, 'მლ')),
    why: (v, a) => `${v.l} ლ = ${group(N(v, 'l') * 1000)} მლ; ${group(N(v, 'l') * 1000)} + ${v.ml} = ${a}.`,
  }),
  t({
    sub: 'u11-05',
    d: 2,
    prompt: 'მართკუთხა ყუთის სიგრძეა {ta} სმ, სიგანე — {tb} სმ, სიმაღლე — {tc} სმ. გამოხატე თითოეული განზომილება მეტრებში.',
    vars: { a: I(4, 19), b: I(4, 19), c: I(4, 19), ta: D((v) => N(v, 'a') * 5), tb: D((v) => N(v, 'b') * 5), tc: D((v) => N(v, 'c') * 5) },
    constraints: [{ test: (v) => N(v, 'a') !== N(v, 'b') && N(v, 'b') !== N(v, 'c') && N(v, 'a') !== N(v, 'c'), note: 'three sizes' }],
    answer: (v) => `სიგრძე ${dec(N(v, 'a') * 0.05, 2)} მ, სიგანე ${dec(N(v, 'b') * 0.05, 2)} მ, სიმაღლე ${dec(N(v, 'c') * 0.05, 2)} მ`,
    options: (v, right) => {
      const f = (k: number) => `სიგრძე ${dec(N(v, 'a') * 0.05 * k, 3)} მ, სიგანე ${dec(N(v, 'b') * 0.05 * k, 3)} მ, სიმაღლე ${dec(N(v, 'c') * 0.05 * k, 3)} მ`;
      const sw = `სიგრძე ${dec(N(v, 'b') * 0.05, 2)} მ, სიგანე ${dec(N(v, 'a') * 0.05, 2)} მ, სიმაღლე ${dec(N(v, 'c') * 0.05, 2)} მ`;
      return [right, f(10), f(0.1), f(100), sw];
    },
    why: (v, a) => `1 მ = 100 სმ; ${N(v, 'a') * 5} სმ, ${N(v, 'b') * 5} სმ და ${N(v, 'c') * 5} სმ ვყოფთ 100-ზე: ${a}.`,
  }),

  // ═════════ U11.6 — დადებითი და უარყოფითი ტემპერატურა ═════════
  ...[0].map(() =>
    t({
      sub: 'u11-06',
      prompt: 'დილით ტემპერატურა იყო {a}°C, შუადღეს კი გაიზარდა {b} გრადუსით. რა ტემპერატურა გახდა შუადღეს?',
      vars: { n: I(1, 12), b: I(2, 18), a: D((v) => sg(-N(v, 'n'))) },
      constraints: [{ test: (v) => N(v, 'b') !== N(v, 'n'), note: 'not zero' }],
      answer: (v) => `${sg(N(v, 'b') - N(v, 'n'))}°C`,
      wrong: (v) => [-N(v, 'n') - N(v, 'b'), N(v, 'n') + N(v, 'b'), N(v, 'n') - N(v, 'b'), -(N(v, 'b') - N(v, 'n'))].filter((x) => x !== N(v, 'b') - N(v, 'n')).map((x) => `${sg(x)}°C`),
      why: (v, a) => `${v.a} + ${v.b} = ${a.replace('°C', '')}; ტემპერატურა გახდა ${a}.`,
    })),
  t({
    sub: 'u11-06',
    prompt: 'ტემპერატურა იყო {a}°C, შემდეგ დაეცა {b} გრადუსით. რა არის ახალი ტემპერატურა?',
    vars: { a: I(2, 12), b: I(3, 20) },
    constraints: [{ test: (v) => N(v, 'b') > N(v, 'a'), note: 'drops below zero' }],
    answer: (v) => `${sg(N(v, 'a') - N(v, 'b'))}°C`,
    wrong: (v) => [N(v, 'b') - N(v, 'a'), N(v, 'a') + N(v, 'b'), -(N(v, 'a') + N(v, 'b')), N(v, 'a') - N(v, 'b') + 1].filter((x) => x !== N(v, 'a') - N(v, 'b')).map((x) => `${sg(x)}°C`),
    why: (v, a) => `${v.a} − ${v.b} = ${a.replace('°C', '')}; ახალი ტემპერატურაა ${a}.`,
  }),
  t({
    sub: 'u11-06',
    d: 2,
    prompt: 'დილით იყო {a}°C, საღამოს კი {b}°C. რამდენი გრადუსით შეიცვალა ტემპერატურა?',
    vars: { m: I(2, 15), e: I(1, 14), a: D((v) => sg(-N(v, 'm'))), b: D((v) => sg(-N(v, 'e'))) },
    constraints: [{ test: (v) => N(v, 'm') !== N(v, 'e'), note: 'a change' }],
    answer: (v) => `${Math.abs(N(v, 'm') - N(v, 'e'))} გრადუსით`,
    wrong: (v) => [N(v, 'm') + N(v, 'e'), N(v, 'm'), N(v, 'e'), Math.abs(N(v, 'm') - N(v, 'e')) + 1, Math.abs(N(v, 'm') - N(v, 'e')) - 1, Math.abs(N(v, 'm') - N(v, 'e')) + 2, Math.abs(N(v, 'm') - N(v, 'e')) + 5].filter((x) => x > 0 && x !== Math.abs(N(v, 'm') - N(v, 'e'))).map((x) => `${x} გრადუსით`),
    why: (v, a) => `${v.a} და ${v.b} შორის მანძილი რიცხვით წრფეზე არის ${a}.`,
  }),
  t({
    sub: 'u11-06',
    d: 2,
    prompt: 'ერთ ქალაქში ტემპერატურაა {a}°C, მეორეში კი {b}°C. რამდენი გრადუსით განსხვავდება ტემპერატურები?',
    vars: { m: I(2, 15), e: I(2, 15), a: D((v) => sg(-N(v, 'm'))) , b: D((v) => sg(N(v, 'e'))) },
    answer: (v) => `${N(v, 'm') + N(v, 'e')} გრადუსით`,
    wrong: (v) => [Math.abs(N(v, 'm') - N(v, 'e')), N(v, 'm'), N(v, 'e'), N(v, 'm') + N(v, 'e') + 1, N(v, 'm') + N(v, 'e') - 1, N(v, 'm') * N(v, 'e'), N(v, 'm') + N(v, 'e') + 2, N(v, 'm') + N(v, 'e') + 5].filter((x) => x > 0 && x !== N(v, 'm') + N(v, 'e')).map((x) => `${x} გრადუსით`),
    why: (v, a) => `${v.e} − (${v.a}) = ${v.e} + ${v.m} = ${a}.`,
  }),
  t({
    sub: 'u11-06',
    prompt: 'საყინულეში ტემპერატურა იყო {a}°C. ის გაიზარდა {b}°C-ით. რა ტემპერატურაა ახლა?',
    vars: { n: I(10, 30), b: I(2, 9), a: D((v) => sg(-N(v, 'n'))) },
    answer: (v) => `${sg(N(v, 'b') - N(v, 'n'))}°C`,
    wrong: (v) => [-N(v, 'n') - N(v, 'b'), N(v, 'n') - N(v, 'b'), N(v, 'n') + N(v, 'b'), N(v, 'b') - N(v, 'n') + 1].filter((x) => x !== N(v, 'b') - N(v, 'n')).map((x) => `${sg(x)}°C`),
    why: (v, a) => `${v.a} + ${v.b} = ${a.replace('°C', '')}; ახლა ${a}.`,
  }),
  t({
    sub: 'u11-06',
    d: 2,
    prompt: 'მთაში ტემპერატურა იყო {a}°C, ღამით კი დაეცა {b} გრადუსით. მეორე დილით ტემპერატურა კიდევ გაიზარდა {c} გრადუსით. რა ტემპერატურაა საბოლოოდ?',
    vars: { a: I(1, 8), b: I(9, 15), c: I(2, 12) },
    constraints: [{ test: (v) => N(v, 'a') - N(v, 'b') + N(v, 'c') !== 0, note: 'not zero' }],
    answer: (v) => `${sg(N(v, 'a') - N(v, 'b') + N(v, 'c'))}°C`,
    wrong: (v) => [N(v, 'a') - N(v, 'b') - N(v, 'c'), N(v, 'a') + N(v, 'b') + N(v, 'c'), N(v, 'b') - N(v, 'a') + N(v, 'c'), N(v, 'a') - N(v, 'b'), N(v, 'a') + N(v, 'b') - N(v, 'c')].filter((x) => x !== N(v, 'a') - N(v, 'b') + N(v, 'c')).map((x) => `${sg(x)}°C`),
    why: (v, a) => `${v.a} − ${v.b} = ${sg(N(v, 'a') - N(v, 'b'))}; ${sg(N(v, 'a') - N(v, 'b'))} + ${v.c} = ${a.replace('°C', '')}; საბოლოოდ ${a}.`,
  }),

  // ═════════ U11.7 — ფარენჰაიტი და ცელსიუსი ═════════
  ...([
    [1, 'გადაიყვანე {c}°C ფარენჰაიტებში.', I(1, 9), 5, -1],
    [1, 'გადაიყვანე {c}°C ფარენჰაიტებში.', I(0, 10), 5, 1],
    [2, 'გადაიყვანე {c}°C ფარენჰაიტებში.', I(11, 24), 5, 1],
  ] as const).map(([d, p, kk, , sign]) =>
    t({
      sub: 'u11-07', d,
      prompt: `გამოიყენე ფორმულები: F = 9/5 × C + 32 და C = 5/9 × (F − 32). ${p}`,
      vars: { k: kk, c: D((v) => sg(sign * 5 * N(v, 'k'))) },
            answer: (v) => `${sg(9 * sign * N(v, 'k') + 32)}°F`,
      wrong: (v) => [5 * sign * N(v, 'k') + 32, 2 * 5 * sign * N(v, 'k') + 30, 9 * sign * N(v, 'k'), 9 * sign * N(v, 'k') + 32 - 5, 9 * sign * N(v, 'k') - 32, (5 * sign * N(v, 'k') + 32) * 2].filter((x) => x !== 9 * sign * N(v, 'k') + 32).map((x) => `${sg(x)}°F`),
      why: (v, a) => `F = 9/5 × ${sign < 0 ? `(${String(v.c)})` : String(v.c)} + 32 = ${sg(9 * sign * N(v, 'k'))} + 32 = ${a.replace('°F', '')}; პასუხი: ${a}.`,
    }),
  ),
  ...([
    [1, 'გადაიყვანე {f}°F ცელსიუსებში.', I(2, 15), 1],
    [2, 'გადაიყვანე {f}°F ცელსიუსებში.', I(2, 12), 1],
    [2, 'თერმომეტრი აჩვენებს {f}°F-ს. რამდენი გრადუსია ეს ცელსიუსით?', I(1, 20), 1],
  ] as const).map(([d, p, kk]) =>
    t({
      sub: 'u11-07', d,
      prompt: `გამოიყენე ფორმულები: F = 9/5 × C + 32 და C = 5/9 × (F − 32). ${p}`,
      vars: { k: kk, f: D((v) => sg(9 * N(v, 'k') + 32)) },
      answer: (v) => `${sg(5 * N(v, 'k'))}°C`,
      wrong: (v) => [9 * N(v, 'k'), 5 * N(v, 'k') + 32, 9 * N(v, 'k') + 32 - 5 * N(v, 'k'), 5 * N(v, 'k') + 5, 5 * N(v, 'k') - 5, 5 * N(v, 'k') + 10].filter((x) => x !== 5 * N(v, 'k')).map((x) => `${sg(x)}°C`),
      why: (v, a) => `C = 5/9 × (${v.f} − 32) = 5/9 × ${sg(9 * N(v, 'k'))} = ${a.replace('°C', '')}; პასუხი: ${a}.`,
    }),
  ),

  // ═════════ U11.8 — ამოცანები დროზე ═════════
  ...([
    ['ფილმი დაიწყო {a} საათზე და დასრულდა {b} საათზე. რამდენ ხანს გაგრძელდა ფილმი?'],
    ['ფეხბურთის მატჩი დაიწყო {a} საათზე და დასრულდა {b} საათზე. რამდენ ხანს გაგრძელდა მატჩი?'],
  ] as const).map(([p], i) =>
    t({
      sub: 'u11-08', d: i === 0 ? 1 : 2,
      prompt: p,
      vars: i === 0
        ? { s: I(14, 19), m: C([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]), dur: I(62, 170), a: D((v) => clock(N(v, 's') * 60 + N(v, 'm'))), b: D((v) => clock(N(v, 's') * 60 + N(v, 'm') + N(v, 'dur'))) }
        : { s: I(17, 20), m: C([0, 15, 30, 45]), dur: C([90, 105, 120, 135, 150]), a: D((v) => clock(N(v, 's') * 60 + N(v, 'm'))), b: D((v) => clock(N(v, 's') * 60 + N(v, 'm') + N(v, 'dur'))) },
      constraints: [{ test: (v) => N(v, 'dur') % 60 !== 0 || i === 1, note: 'minutes remain' }],
      answer: (v) => hm(N(v, 'dur')),
      options: (v, right) => {
        const a = N(v, 's') * 60 + N(v, 'm');
        const b = a + N(v, 'dur');
        // The classic slip: hours and minutes subtracted separately, the smaller minutes taken from the larger.
        const slip = (Math.floor(b / 60) - Math.floor(a / 60)) * 60 + Math.abs((b % 60) - (a % 60));
        return [right, hm(slip), ...timeSlips(N(v, 'dur'), SHIFTS, hm)];
      },
      why: (v, a) => `${v.a}-დან ${v.b}-მდე გავიდა ${a}.`,
    }),
  ),
  t({
    sub: 'u11-08',
    prompt: 'მატარებელი გავიდა {a} საათზე. მგზავრობა გაგრძელდა {h} საათი და {m} წუთი. რომელ საათზე მივიდა მატარებელი?',
    vars: { s: I(6, 14), mm: C([0, 5, 10, 15, 20, 30, 40, 45, 50, 55]), h: I(1, 5), m: C([10, 15, 20, 25, 30, 35, 40, 45, 50, 55]), a: D((v) => clock(N(v, 's') * 60 + N(v, 'mm'))) },
    answer: (v) => clock(N(v, 's') * 60 + N(v, 'mm') + N(v, 'h') * 60 + N(v, 'm')),
    wrong: (v) => {
      const a = N(v, 's') * 60 + N(v, 'mm');
      const r = a + N(v, 'h') * 60 + N(v, 'm');
      return [r + 10, r - 10, r + 60, r - 60, a + N(v, 'h') * 60, a + N(v, 'm')].filter((x) => x !== r).map(clock);
    },
    why: (v, a) => `${v.a} + ${v.h} სთ ${v.m} წთ = ${a}.`,
  }),
  t({
    sub: 'u11-08',
    prompt: 'გაკვეთილი დაიწყო {a} საათზე და გაგრძელდა {m} წუთი. რომელ საათზე დასრულდა?',
    vars: { s: I(8, 15), mm: C([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]), m: C([35, 40, 45, 50, 55, 60, 90]), a: D((v) => clock(N(v, 's') * 60 + N(v, 'mm'))) },
    answer: (v) => clock(N(v, 's') * 60 + N(v, 'mm') + N(v, 'm')),
    wrong: (v) => {
      const r = N(v, 's') * 60 + N(v, 'mm') + N(v, 'm');
      return [r + 5, r - 5, r + 10, r - 10, r + 60, r - 60, r + 15].filter((x) => x !== r).map(clock);
    },
    why: (v, a) => `${v.a} + ${v.m} წთ = ${a}.`,
  }),
  t({
    sub: 'u11-08',
    prompt: 'ნინო სახლიდან გავიდა {a} საათზე და სკოლაში მივიდა {b} საათზე. რამდენი წუთი დასჭირდა გზას?',
    vars: { s: I(7, 8), mm: I(0, 35), dur: I(12, 40), a: D((v) => clock(N(v, 's') * 60 + N(v, 'mm'))), b: D((v) => clock(N(v, 's') * 60 + N(v, 'mm') + N(v, 'dur'))) },
    constraints: [{ test: (v) => N(v, 'mm') % 5 === 0, note: 'minutes in fives' }],
    answer: (v) => `${N(v, 'dur')} წუთი`,
    wrong: (v) => [N(v, 'dur') + 10, N(v, 'dur') - 10, N(v, 'dur') + 5, N(v, 'dur') - 5, N(v, 'dur') + 20, N(v, 'dur') + 40].filter((x) => x > 0).map((x) => `${x} წუთი`),
    why: (v, a) => `${v.a}-დან ${v.b}-მდე გავიდა ${a}.`,
  }),
  t({
    sub: 'u11-08',
    d: 3,
    prompt: 'ავტობუსი გავიდა {a} საათზე. პირველი მგზავრობა გაგრძელდა {h} საათი და {m} წუთი, შემდეგ კი გაჩერებაზე {w} წუთი გაატარა. რომელ საათზე განაგრძო ავტობუსმა გზა?',
    vars: { s: I(8, 15), mm: C([0, 10, 15, 20, 30, 40, 45, 50]), h: I(1, 3), m: C([10, 15, 20, 25, 30, 35, 40, 45, 50]), w: C([10, 15, 20, 25, 30]), a: D((v) => clock(N(v, 's') * 60 + N(v, 'mm'))) },
    answer: (v) => clock(N(v, 's') * 60 + N(v, 'mm') + N(v, 'h') * 60 + N(v, 'm') + N(v, 'w')),
    wrong: (v) => {
      const a = N(v, 's') * 60 + N(v, 'mm');
      const r = a + N(v, 'h') * 60 + N(v, 'm') + N(v, 'w');
      return [r - N(v, 'w'), r - 2 * N(v, 'w'), r + 10, r - 10, r + 60, r - 60].filter((x) => x !== r).map(clock);
    },
    why: (v, a) => `${v.a} + ${v.h} სთ ${v.m} წთ = ${clock(N(v, 's') * 60 + N(v, 'mm') + N(v, 'h') * 60 + N(v, 'm'))}; ${v.w} წუთის შემდეგ ${a}.`,
  }),

  // ═════════ U11.9 — დროის ერთეულები, თანმიმდევრობა და მართვა ═════════
  t({
    sub: 'u11-09',
    d: 2,
    prompt: 'დაალაგე დროის მონაკვეთები ზრდადობით: {a}, {b}, {c}, {e}.',
    vars: {
      s1: C([45, 50, 60, 75, 80, 90, 100, 110, 120, 130, 150, 180]),
      s2: C([40, 55, 70, 85, 95, 105, 115, 125, 135, 160, 190, 240]),
      s3: C([30, 65, 72, 88, 98, 108, 140, 170, 200, 210, 300]),
      s4: C([60, 120, 180, 240, 75, 90, 150, 105]),
      a: D((v) => span(N(v, 's1'))), b: D((v) => span(N(v, 's2'))), c: D((v) => span(N(v, 's3'))), e: D((v) => span(N(v, 's4'))),
    },
    constraints: [{ test: (v) => new Set([N(v, 's1'), N(v, 's2'), N(v, 's3'), N(v, 's4')]).size === 4 && [N(v, 's1'), N(v, 's2'), N(v, 's3'), N(v, 's4')].some((x) => x % 60 === 0), note: 'four different spans, one in whole minutes' }],
    answer: (v) => order(v, false),
    options: (v, right) => {
      const xs = [N(v, 's1'), N(v, 's2'), N(v, 's3'), N(v, 's4')].sort((p, q) => p - q);
      const join = (arr: number[]) => arr.map(span).join('; ');
      const swapMid = [xs[0]!, xs[2]!, xs[1]!, xs[3]!];
      const swapEnds = [xs[1]!, xs[0]!, xs[2]!, xs[3]!];
      const bySeconds = [...xs].sort((p, q) => String(span(p)).length - String(span(q)).length || p - q);
      return [right, order(v, true), join(swapMid), join(swapEnds), join(bySeconds), join([xs[3]!, xs[0]!, xs[1]!, xs[2]!])];
    },
    why: (v, a) => `ყველაფერი წამებში: ${[N(v, 's1'), N(v, 's2'), N(v, 's3'), N(v, 's4')].map((x) => `${x} წმ`).join(', ')}. ზრდადობით: ${a}.`,
  }),
  t({
    sub: 'u11-09',
    prompt: 'რამდენი წამია {m} წუთსა და {s} წამში?',
    vars: { m: I(2, 9), s: I(5, 55) },
    constraints: [{ test: (v) => N(v, 's') % 5 === 0, note: 'seconds in fives' }],
    answer: (v) => `${N(v, 'm') * 60 + N(v, 's')} წამი`,
    wrong: (v) => [N(v, 'm') * 100 + N(v, 's'), N(v, 'm') * 10 + N(v, 's'), N(v, 'm') + N(v, 's'), N(v, 'm') * 60, N(v, 'm') * 60 + N(v, 's') * 10, N(v, 'm') * 60 - N(v, 's')].filter((x) => x > 0).map((x) => `${x} წამი`),
    why: (v, a) => `${v.m} × 60 = ${N(v, 'm') * 60}; ${N(v, 'm') * 60} + ${v.s} = ${a}.`,
  }),
  t({
    sub: 'u11-09',
    prompt: 'რამდენი საათი და წუთია {n} წუთი?',
    vars: { h: I(1, 9), r: C([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]), n: D((v) => N(v, 'h') * 60 + N(v, 'r')) },
    answer: (v) => hm(N(v, 'h') * 60 + N(v, 'r')),
    options: (v, right) => [right, `${N(v, 'h')} სთ ${N(v, 'r') + 10} წთ`, `${N(v, 'h') + 1} სთ ${N(v, 'r')} წთ`, `${N(v, 'r')} სთ ${N(v, 'h')} წთ`, `${Math.max(N(v, 'h') - 1, 1)} სთ ${N(v, 'r') + 20} წთ`, `${N(v, 'h')} სთ ${N(v, 'r') / 5 + 40} წთ`],
    why: (v, a) => `${v.n} = ${N(v, 'h')} × 60 + ${v.r}; ${a}.`,
  }),
  t({
    sub: 'u11-09',
    prompt: 'მოსწავლემ მათემატიკას {a} წუთი დაუთმო, კითხვას — {b} წუთი, ხოლო დასვენებას — {c} წუთი. რამდენი დრო დახარჯა სულ?',
    vars: { x: I(4, 12), y: I(3, 10), z: I(2, 9), a: D((v) => N(v, 'x') * 5), b: D((v) => N(v, 'y') * 5), c: D((v) => N(v, 'z') * 5) },
    constraints: [{ test: (v) => (N(v, 'x') + N(v, 'y') + N(v, 'z')) * 5 > 60, note: 'over an hour' }],
    answer: (v) => hm((N(v, 'x') + N(v, 'y') + N(v, 'z')) * 5),
    options: (v, right) => {
      const s = (N(v, 'x') + N(v, 'y') + N(v, 'z')) * 5;
      return [right, ...timeSlips(s, [5, 10, 15, 20, 30, 40, 60], hm), `${s} სთ`];
    },
    why: (v, a) => `${v.a} + ${v.b} + ${v.c} = ${(N(v, 'x') + N(v, 'y') + N(v, 'z')) * 5} წთ = ${a}.`,
  }),
  t({
    sub: 'u11-09',
    d: 2,
    prompt: 'გაკვეთილები იწყება {a} საათზე. თითოეული გაკვეთილი {l} წუთია, ხოლო გაკვეთილებს შორის შესვენება — {b} წუთი. რომელ საათზე დასრულდება მეორე გაკვეთილი?',
    vars: { s: I(8, 10), mm: C([0, 15, 30]), l: C([40, 45, 50]), b: C([5, 10, 15, 20]), a: D((v) => clock(N(v, 's') * 60 + N(v, 'mm'))) },
    answer: (v) => clock(N(v, 's') * 60 + N(v, 'mm') + 2 * N(v, 'l') + N(v, 'b')),
    wrong: (v) => {
      const a = N(v, 's') * 60 + N(v, 'mm');
      const r = a + 2 * N(v, 'l') + N(v, 'b');
      return [a + N(v, 'l'), a + N(v, 'l') + N(v, 'b'), r - N(v, 'b'), r + N(v, 'b'), r + 10, r - 10, r + 60].filter((x) => x !== r).map(clock);
    },
    why: (v, a) => `2 × ${v.l} + ${v.b} = ${2 * N(v, 'l') + N(v, 'b')} წთ; ${v.a} + ${hm(2 * N(v, 'l') + N(v, 'b'))} = ${a}.`,
  }),
  t({
    sub: 'u11-09',
    d: 2,
    prompt: 'პროექტის შესრულებას სჭირდება {d} დღე, დღეში {h} საათი და {m} წუთი. რამდენი საათი და წუთი დაიხარჯება პროექტზე სულ?',
    vars: { d: I(2, 7), h: I(1, 4), m: C([10, 15, 20, 30, 40, 45, 50]) },
    answer: (v) => hm(N(v, 'd') * (N(v, 'h') * 60 + N(v, 'm'))),
    options: (v, right) => {
      const total = N(v, 'd') * (N(v, 'h') * 60 + N(v, 'm'));
      return [right, `${N(v, 'd') * N(v, 'h')} სთ ${N(v, 'd') * N(v, 'm')} წთ`, ...timeSlips(total, [10, 30, 60, 20, 40], hm)];
    },
    why: (v, a) => `${v.h} სთ ${v.m} წთ = ${N(v, 'h') * 60 + N(v, 'm')} წთ; ${v.d} × ${N(v, 'h') * 60 + N(v, 'm')} = ${N(v, 'd') * (N(v, 'h') * 60 + N(v, 'm'))} წთ = ${a}.`,
  }),
];

/** A span in seconds as printed: whole minutes as minutes, the rest as seconds. */
function span(s: number): string {
  return s % 60 === 0 ? `${s / 60} წუთი` : `${s} წამი`;
}
function order(v: Vars, descending: boolean): string {
  const xs = [N(v, 's1'), N(v, 's2'), N(v, 's3'), N(v, 's4')].sort((p, q) => (descending ? q - p : p - q));
  return xs.map(span).join('; ');
}
