import type { QuestionTemplate, Vars } from './types';
import { C, D, I, MINUS, N, q6 } from './g6-helpers';
import { fmt, pair, textOptions, unitOptions } from './g7-u08-proportion-percent';
import { group } from './g5-helpers';

/**
 * Grade VII — Unit 9: multi-step word problems.
 *
 * Converted from the academy's Grade VII `U09` bank: 4 subtopics × 6 questions.
 *
 * Proportion tasks, distance–speed–time, map scales and tasks solved by an
 * equation or a system. Every task is built backwards from whole-number data;
 * answers carry their unit. Slips are the slips of the topic: a direct
 * proportion for an inverse one, the scale read the wrong way round, speeds
 * averaged instead of total distance over total time.
 */

export const G7_U09_SUBTOPICS = ['u09-01', 'u09-02', 'u09-03', 'u09-04'] as const;

const T = 'g7-multistep';
let seq = 0;
const nextId = (): string => `g7-u09-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic' | 'grade'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, grade: 7, ...spec });

const g = (v: Vars, key: string): number => N(v, key);
/** `1 : 100 000`. */
const scale = (n: number): string => `1 : ${group(n)}`;
const scaleOptions = (key: number, slips: number[]): string[] => {
  const out = [scale(key)];
  for (const n of [...slips, key * 2, key / 2, key * 10, key / 10, key + 50000]) {
    if (!Number.isInteger(n) || n <= 0) continue;
    const text = scale(n);
    if (!out.includes(text)) out.push(text);
  }
  return out;
};
const SCALES = [50000, 100000, 200000, 250000, 500000, 1000000];

export const G7_U09_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U09.1 — ამოცანები პროპორციაზე ═════════
  t({
    sub: 'u09-01',
    prompt: '{m} რვეული ღირს {c} ლარი. რა ეღირება {n} ასეთი რვეული?',
    vars: { m: I(2, 9), p: I(2, 9), n: I(3, 16), c: D((v) => g(v, 'm') * g(v, 'p')) },
    constraints: [{ test: (v: Vars) => g(v, 'm') !== g(v, 'n'), note: 'a different quantity' }],
    answer: (v) => fmt(g(v, 'n') * g(v, 'p'), 'ლარი'),
    options: (v) => unitOptions(g(v, 'n') * g(v, 'p'), 'ლარი', [g(v, 'c') + g(v, 'n') - g(v, 'm'), (g(v, 'c') * g(v, 'm')) / g(v, 'n'), g(v, 'c') + g(v, 'p')]),
    why: (v, a) => `1 რვეული ღირს ${v.c} ÷ ${v.m} = ${v.p} ლარი; ${v.n} · ${v.p} = ${a}.`,
  }),
  t({
    sub: 'u09-01',
    prompt: '{w} მუშა სამუშაოს {d} დღეში ასრულებს. რამდენი დღე დასჭირდება იმავე სამუშაოს {n} მუშას, თუ ყველა ერთნაირი წარმადობით მუშაობს?',
    vars: { w: I(2, 10), d: I(4, 15), n: I(2, 20), T: D((v) => g(v, 'w') * g(v, 'd')) },
    constraints: [{ test: (v: Vars) => (g(v, 'w') * g(v, 'd')) % g(v, 'n') === 0 && g(v, 'n') !== g(v, 'w'), note: 'whole days' }],
    answer: (v) => fmt((g(v, 'w') * g(v, 'd')) / g(v, 'n'), 'დღე'),
    options: (v) => unitOptions((g(v, 'w') * g(v, 'd')) / g(v, 'n'), 'დღე', [(g(v, 'd') * g(v, 'n')) / g(v, 'w'), g(v, 'd') + g(v, 'n') - g(v, 'w'), g(v, 'd') - g(v, 'n') + g(v, 'w')]),
    why: (v, a) => `მთელი სამუშაო ${v.w} · ${v.d} = ${v.T} მუშა-დღეა; ${v.T} ÷ ${v.n} = ${a}.`,
  }),
  t({
    sub: 'u09-01',
    prompt: 'რუკაზე {a} სმ რეალურ მანძილზე {k} კმ-ს შეესაბამება. რამდენ კილომეტრს შეესაბამება რუკაზე {b} სმ?',
    vars: { a: I(2, 8), p: I(2, 9), b: I(3, 14), k: D((v) => g(v, 'a') * g(v, 'p')) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b'), note: 'a different distance' }],
    answer: (v) => fmt(g(v, 'b') * g(v, 'p'), 'კმ'),
    options: (v) => unitOptions(g(v, 'b') * g(v, 'p'), 'კმ', [g(v, 'k') + g(v, 'b') - g(v, 'a'), (g(v, 'k') * g(v, 'a')) / g(v, 'b'), g(v, 'k') + g(v, 'p')]),
    why: (v, a) => `1 სმ რუკაზე ${v.k} ÷ ${v.a} = ${v.p} კმ-ია; ${v.b} · ${v.p} = ${a}.`,
  }),
  t({
    sub: 'u09-01',
    prompt: 'ორი რიცხვის შეფარდებაა ({a} : {b}), ხოლო მათი ჯამია {s}. იპოვე ორივე რიცხვი.',
    vars: { a: I(1, 8), b: I(2, 9), k: I(2, 12), s: D((v) => (g(v, 'a') + g(v, 'b')) * g(v, 'k')) },
    constraints: [{ test: (v: Vars) => g(v, 'a') < g(v, 'b'), note: 'ordered parts' }],
    answer: (v) => pair(g(v, 'a') * g(v, 'k'), g(v, 'b') * g(v, 'k'), ''),
    options: (v, right) => textOptions(right, [pair(g(v, 'b') * g(v, 'k'), g(v, 'a') * g(v, 'k'), ''), pair(g(v, 'a') * g(v, 'k') - 1, g(v, 'b') * g(v, 'k') + 1, ''), pair(g(v, 'a'), g(v, 'b'), ''), pair(g(v, 'a') * g(v, 'k') + 2, g(v, 'b') * g(v, 'k') - 2, '')]),
    why: (v, a) => `ერთი ნაწილი ${v.s} ÷ ${g(v, 'a') + g(v, 'b')} = ${v.k}; რიცხვები ${g(v, 'a')} · ${v.k} და ${g(v, 'b')} · ${v.k}. ${a}.`,
  }),
  t({
    sub: 'u09-01',
    prompt: '{m} კგ ფორთოხალი ღირს {c} ლარი. რამდენი კილოგრამი ფორთოხლის ყიდვა შეიძლება {n} ლარად იმავე ფასით?',
    vars: { m: I(2, 8), p: I(2, 9), q: I(3, 15), c: D((v) => g(v, 'm') * g(v, 'p')), n: D((v) => g(v, 'p') * g(v, 'q')) },
    constraints: [{ test: (v: Vars) => g(v, 'm') !== g(v, 'q'), note: 'a different quantity' }],
    answer: (v) => fmt(g(v, 'q'), 'კგ'),
    options: (v) => unitOptions(g(v, 'q'), 'კგ', [g(v, 'n') - g(v, 'c') + g(v, 'm'), g(v, 'p'), (g(v, 'm') * g(v, 'c')) / g(v, 'n'), g(v, 'q') + g(v, 'm')]),
    why: (v, a) => `1 კგ ღირს ${v.c} ÷ ${v.m} = ${v.p} ლარი; ${v.n} ÷ ${v.p} = ${a}.`,
  }),
  t({
    sub: 'u09-01',
    prompt: '{m} მანქანა ერთ დღეში გადააქვს {c} ტონა ტვირთი. რამდენ ტონა ტვირთს გადაიტანს {n} ასეთი მანქანა ერთ დღეში, თუ თითოეული მანქანის წარმადობა ერთნაირია?',
    vars: { m: I(2, 9), p: C([10, 15, 20, 25, 30, 40]), n: I(2, 12), c: D((v) => g(v, 'm') * g(v, 'p')) },
    constraints: [{ test: (v: Vars) => g(v, 'm') !== g(v, 'n'), note: 'a different quantity' }],
    answer: (v) => fmt(g(v, 'n') * g(v, 'p'), 'ტონა'),
    options: (v) => unitOptions(g(v, 'n') * g(v, 'p'), 'ტონა', [g(v, 'c') + g(v, 'n') - g(v, 'm'), (g(v, 'c') * g(v, 'm')) / g(v, 'n'), g(v, 'c') - g(v, 'p')]),
    why: (v, a) => `ერთი მანქანა გადააქვს ${v.c} ÷ ${v.m} = ${v.p} ტონას; ${v.n} · ${v.p} = ${a}.`,
  }),

  // ═════════ U09.2 — დრო, სიჩქარე და მანძილი ═════════
  t({
    sub: 'u09-02',
    prompt: 'ავტომობილი {t} საათში {s} კმ-ს გადის. რა სიჩქარით მოძრაობს ავტომობილი?',
    vars: { t: I(2, 6), v: I(30, 110, { step: 10 }), s: D((v) => g(v, 't') * g(v, 'v')) },
    answer: (v) => fmt(g(v, 'v'), 'კმ/სთ'),
    options: (v) => unitOptions(g(v, 'v'), 'კმ/სთ', [g(v, 's') + g(v, 't'), g(v, 's') - g(v, 't'), g(v, 't'), g(v, 's')]),
    why: (v, a) => `სიჩქარე = მანძილი ÷ დრო = ${v.s} ÷ ${v.t} = ${a}.`,
  }),
  t({
    sub: 'u09-02',
    prompt: 'ველოსიპედისტი {v} კმ/სთ სიჩქარით {t} საათის განმავლობაში მოძრაობს. რა მანძილს გაივლის?',
    vars: { v: I(10, 30, { step: 2 }), t: I(2, 6) },
    answer: (v) => fmt(g(v, 'v') * g(v, 't'), 'კმ'),
    options: (v) => unitOptions(g(v, 'v') * g(v, 't'), 'კმ', [g(v, 'v') + g(v, 't'), g(v, 'v') / g(v, 't'), g(v, 'v') * g(v, 't') + g(v, 'v')]),
    why: (v, a) => `მანძილი = სიჩქარე · დრო = ${v.v} · ${v.t} = ${a}.`,
  }),
  t({
    sub: 'u09-02',
    prompt: 'მატარებელმა {s} კმ გაიარა {t} საათში. რამდენი დრო დასჭირდება {s2} კმ-ის გასავლელად იმავე სიჩქარით?',
    vars: { t: I(2, 6), v: I(40, 120, { step: 10 }), k: I(2, 8), s: D((v) => g(v, 't') * g(v, 'v')), s2: D((v) => g(v, 'v') * g(v, 'k')) },
    constraints: [{ test: (v: Vars) => g(v, 'k') !== g(v, 't'), note: 'a different distance' }],
    answer: (v) => fmt(g(v, 'k'), 'საათი'),
    options: (v) => unitOptions(g(v, 'k'), 'საათი', [g(v, 'v'), g(v, 't') + 1, g(v, 't') * g(v, 'k'), (g(v, 't') * g(v, 's')) / g(v, 's2')]),
    why: (v, a) => `სიჩქარე ${v.s} ÷ ${v.t} = ${v.v} კმ/სთ; ${v.s2} ÷ ${v.v} = ${a}.`,
  }),
  t({
    sub: 'u09-02',
    prompt: 'ორი ქალაქის დაშორებაა {s} კმ. ავტომობილი მოძრაობს {v} კმ/სთ სიჩქარით. რამდენ საათში მივა დანიშნულების ადგილზე?',
    vars: { v: C([40, 50, 60, 80, 90, 100]), t: I(2, 8), s: D((v) => g(v, 'v') * g(v, 't')) },
    answer: (v) => fmt(g(v, 't'), 'საათი'),
    options: (v) => unitOptions(g(v, 't'), 'საათი', [g(v, 'v'), g(v, 's') - g(v, 'v'), g(v, 't') + 1, g(v, 't') * 2]),
    why: (v, a) => `დრო = მანძილი ÷ სიჩქარე = ${v.s} ÷ ${v.v} = ${a}.`,
  }),
  t({
    sub: 'u09-02',
    prompt: 'ფეხით მოსიარულე {v} კმ/სთ სიჩქარით {h} საათსა და {m} წუთს მოძრაობს. რა მანძილს გაივლის?',
    vars: { v: C([4, 8, 12, 16]), h: I(1, 4), m: C([15, 30, 45]) },
    answer: (v) => fmt((g(v, 'v') * (60 * g(v, 'h') + g(v, 'm'))) / 60, 'კმ'),
    options: (v) => unitOptions((g(v, 'v') * (60 * g(v, 'h') + g(v, 'm'))) / 60, 'კმ', [g(v, 'v') * g(v, 'h'), g(v, 'v') * (g(v, 'h') + g(v, 'm')), g(v, 'v') * g(v, 'h') + g(v, 'm'), g(v, 'v') * (g(v, 'h') + 1)]),
    why: (v, a) => `${v.h} საათი და ${v.m} წუთი = ${(60 * g(v, 'h') + g(v, 'm')) / 60 === Math.floor((60 * g(v, 'h') + g(v, 'm')) / 60) ? (60 * g(v, 'h') + g(v, 'm')) / 60 : `${60 * g(v, 'h') + g(v, 'm')}/60`} საათი; ${v.v} · ${60 * g(v, 'h') + g(v, 'm')} ÷ 60 = ${a}.`,
  }),
  t({
    sub: 'u09-02',
    prompt: 'ავტომობილი პირველ {t1} საათში {s1} კმ-ს გადის, შემდეგ კი კიდევ {t2} საათში {s2} კმ-ს. იპოვე ავტომობილის საშუალო სიჩქარე მთელ გზაზე.',
    vars: { t1: I(1, 4), t2: I(2, 5), avg: I(40, 90, { step: 10 }), s1: I(30, 150, { step: 10 }), s2: D((v) => g(v, 'avg') * (g(v, 't1') + g(v, 't2')) - g(v, 's1')) },
    constraints: [{ test: (v: Vars) => g(v, 'avg') * (g(v, 't1') + g(v, 't2')) - g(v, 's1') > 0 && g(v, 's1') / g(v, 't1') !== g(v, 'avg') && (g(v, 'avg') * (g(v, 't1') + g(v, 't2')) - g(v, 's1')) / g(v, 't2') !== g(v, 'avg'), note: 'two different speeds' }],
    answer: (v) => fmt(g(v, 'avg'), 'კმ/სთ'),
    options: (v) => unitOptions(g(v, 'avg'), 'კმ/სთ', [(g(v, 's1') / g(v, 't1') + g(v, 's2') / g(v, 't2')) / 2, g(v, 's1') + g(v, 's2'), g(v, 'avg') + 10, g(v, 'avg') - 10, g(v, 's1') / g(v, 't1')]),
    why: (v, a) => `მთელი მანძილი ${v.s1} + ${v.s2} = ${g(v, 's1') + g(v, 's2')} კმ, მთელი დრო ${v.t1} + ${v.t2} = ${g(v, 't1') + g(v, 't2')} საათი; ${g(v, 's1') + g(v, 's2')} ÷ ${g(v, 't1') + g(v, 't2')} = ${a}.`,
  }),

  // ═════════ U09.3 — მასშტაბი ═════════
  t({
    sub: 'u09-03',
    prompt: 'რუკის მასშტაბია ({sc}). რუკაზე ორ ქალაქს შორის მანძილი {d} სმ-ია. იპოვე რეალური მანძილი კილომეტრებში.',
    vars: { N: C(SCALES), d: I(2, 12), sc: D((v) => scale(g(v, 'N'))) },
    constraints: [{ test: (v: Vars) => (g(v, 'd') * g(v, 'N')) % 100000 === 0, note: 'whole kilometres' }],
    answer: (v) => fmt((g(v, 'd') * g(v, 'N')) / 100000, 'კმ'),
    options: (v) => unitOptions((g(v, 'd') * g(v, 'N')) / 100000, 'კმ', [(g(v, 'd') * g(v, 'N')) / 10000, (g(v, 'd') * g(v, 'N')) / 1000000, (g(v, 'd') * g(v, 'N')) / 1000, g(v, 'd') * 10]),
    why: (v, a) => `${v.d} · ${group(g(v, 'N'))} = ${group(g(v, 'd') * g(v, 'N'))} სმ = ${a}.`,
  }),
  t({
    sub: 'u09-03',
    prompt: 'რეალური მანძილი ორ სოფელს შორის {D} კმ-ია. თუ რუკის მასშტაბია ({sc}), რამდენი სანტიმეტრი იქნება ეს მანძილი რუკაზე?',
    vars: { N: C(SCALES), D: I(4, 40), sc: D((v) => scale(g(v, 'N'))) },
    constraints: [{ test: (v: Vars) => (g(v, 'D') * 100000) % g(v, 'N') === 0, note: 'whole centimetres' }],
    answer: (v) => fmt((g(v, 'D') * 100000) / g(v, 'N'), 'სმ'),
    options: (v) => unitOptions((g(v, 'D') * 100000) / g(v, 'N'), 'სმ', [(g(v, 'D') * 10000) / g(v, 'N'), (g(v, 'D') * 1000000) / g(v, 'N'), (g(v, 'D') * g(v, 'N')) / 100000, g(v, 'D')]),
    why: (v, a) => `${v.D} კმ = ${group(g(v, 'D') * 100000)} სმ; ${group(g(v, 'D') * 100000)} ÷ ${group(g(v, 'N'))} = ${a}.`,
  }),
  t({
    sub: 'u09-03',
    prompt: 'რუკაზე მანძილი {d} სმ-ია, ხოლო რეალური მანძილი — {D} კმ. იპოვე რუკის მასშტაბი.',
    vars: { d: I(2, 10), N: C([50000, 100000, 200000, 250000, 500000]), D: D((v) => (g(v, 'd') * g(v, 'N')) / 100000) },
    constraints: [{ test: (v: Vars) => (g(v, 'd') * g(v, 'N')) % 100000 === 0, note: 'whole kilometres' }],
    answer: (v) => scale(g(v, 'N')),
    options: (v) => scaleOptions(g(v, 'N'), [(g(v, 'D') * 1000) / g(v, 'd'), (g(v, 'D') * 10000) / g(v, 'd'), g(v, 'D') / g(v, 'd')]),
    why: (v, a) => `${v.D} კმ = ${group(g(v, 'D') * 100000)} სმ; ${group(g(v, 'D') * 100000)} ÷ ${v.d} = ${group(g(v, 'N'))}, ამიტომ მასშტაბია ${a}.`,
  }),
  t({
    sub: 'u09-03',
    prompt: 'შენობის გეგმის მასშტაბია ({sc}). თუ ოთახის სიგრძე გეგმაზე {d} სმ-ია, რამდენი მეტრია ოთახის რეალური სიგრძე?',
    vars: { N: C([20, 25, 50, 100, 200]), d: I(2, 12), sc: D((v) => scale(g(v, 'N'))) },
    constraints: [{ test: (v: Vars) => (g(v, 'd') * g(v, 'N')) % 100 === 0, note: 'whole metres' }],
    answer: (v) => fmt((g(v, 'd') * g(v, 'N')) / 100, 'მ'),
    options: (v) => unitOptions((g(v, 'd') * g(v, 'N')) / 100, 'მ', [g(v, 'd') * g(v, 'N'), (g(v, 'd') * g(v, 'N')) / 10, (g(v, 'd') * g(v, 'N')) / 1000, g(v, 'd') * g(v, 'N') + 100]),
    why: (v, a) => `${v.d} · ${v.N} = ${g(v, 'd') * g(v, 'N')} სმ = ${a}.`,
  }),
  t({
    sub: 'u09-03',
    prompt: 'მოდელის მასშტაბია ({sc}). თუ მოდელის სიგრძეა {d} სმ, იპოვე რეალური ობიექტის სიგრძე მეტრებში.',
    vars: { N: C([10, 20, 25, 40, 50, 100]), d: I(5, 40), sc: D((v) => scale(g(v, 'N'))) },
    constraints: [{ test: (v: Vars) => (g(v, 'd') * g(v, 'N')) % 100 === 0, note: 'whole metres' }],
    answer: (v) => fmt((g(v, 'd') * g(v, 'N')) / 100, 'მ'),
    options: (v) => unitOptions((g(v, 'd') * g(v, 'N')) / 100, 'მ', [g(v, 'd') * g(v, 'N'), (g(v, 'd') * g(v, 'N')) / 10, g(v, 'd') / g(v, 'N'), g(v, 'd') * g(v, 'N') + 100]),
    why: (v, a) => `${v.d} · ${v.N} = ${group(g(v, 'd') * g(v, 'N'))} სმ = ${a}.`,
  }),
  t({
    sub: 'u09-03',
    prompt: 'რეალური გზის სიგრძეა {D} კმ. რუკის მასშტაბია ({sc}). რამდენი სანტიმეტრი იქნება გზა რუკაზე?',
    vars: { N: C([100000, 200000, 250000, 500000, 1000000]), D: I(5, 50, { step: 5 }), sc: D((v) => scale(g(v, 'N'))) },
    constraints: [{ test: (v: Vars) => (g(v, 'D') * 100000) % g(v, 'N') === 0, note: 'whole centimetres' }],
    answer: (v) => fmt((g(v, 'D') * 100000) / g(v, 'N'), 'სმ'),
    options: (v) => unitOptions((g(v, 'D') * 100000) / g(v, 'N'), 'სმ', [(g(v, 'D') * 10000) / g(v, 'N'), (g(v, 'D') * 1000000) / g(v, 'N'), (g(v, 'D') * g(v, 'N')) / 100000, g(v, 'D')]),
    why: (v, a) => `${v.D} კმ = ${group(g(v, 'D') * 100000)} სმ; ${group(g(v, 'D') * 100000)} ÷ ${group(g(v, 'N'))} = ${a}.`,
  }),

  // ═════════ U09.4 — ამოცანების ამოხსნა სხვადასხვა მეთოდით ═════════
  t({
    sub: 'u09-04',
    prompt: 'მაღაზიაში {a} კალამი და {b} რვეული ერთად {c} ლარი ღირს. ერთი კალამი {p} ლარი ღირს. რა ღირს ერთი რვეული?',
    vars: { a: I(2, 5), b: I(2, 4), p: I(2, 6), q: I(2, 9), c: D((v) => g(v, 'a') * g(v, 'p') + g(v, 'b') * g(v, 'q')) },
    answer: (v) => fmt(g(v, 'q'), 'ლარი'),
    options: (v) => unitOptions(g(v, 'q'), 'ლარი', [g(v, 'c') - g(v, 'p'), (g(v, 'c') - g(v, 'p')) / g(v, 'b'), g(v, 'c') / (g(v, 'a') + g(v, 'b')), g(v, 'q') + g(v, 'p')]),
    why: (v, a) => `კალმები ${v.a} · ${v.p} = ${g(v, 'a') * g(v, 'p')} ლარი; რვეულები ${v.c} ${MINUS} ${g(v, 'a') * g(v, 'p')} = ${g(v, 'b') * g(v, 'q')} ლარი; ერთი ${a}.`,
  }),
  t({
    sub: 'u09-04',
    prompt: 'ორი რიცხვის ჯამია {s}, ხოლო მათი სხვაობა — {d}. იპოვე ორივე რიცხვი.',
    vars: { y: I(5, 40), d: I(2, 20), s: D((v) => 2 * g(v, 'y') + g(v, 'd')) },
    answer: (v) => pair(g(v, 'y') + g(v, 'd'), g(v, 'y'), ''),
    options: (v, right) => textOptions(right, [pair(g(v, 'y'), g(v, 'y') + g(v, 'd'), ''), pair(g(v, 'y') + g(v, 'd') + 1, g(v, 'y') - 1, ''), pair(g(v, 'y') + 2 * g(v, 'd'), g(v, 'y') - g(v, 'd') > 0 ? g(v, 'y') - g(v, 'd') : g(v, 'y') + 1, ''), pair(Math.floor(g(v, 's') / 2) + g(v, 'd'), Math.floor(g(v, 's') / 2), '')]),
    why: (v, a) => `დიდი რიცხვი (${v.s} + ${v.d}) ÷ 2 = ${g(v, 'y') + g(v, 'd')}, მცირე (${v.s} ${MINUS} ${v.d}) ÷ 2 = ${v.y}. ${a}.`,
  }),
  t({
    sub: 'u09-04',
    prompt: 'მართკუთხედის პერიმეტრია {P} სმ. მისი სიგრძე სიგანეზე {d} სმ-ით მეტია. იპოვე მართკუთხედის სიგრძე და სიგანე.',
    vars: { w: I(2, 14), d: I(1, 9), P: D((v) => 2 * (2 * g(v, 'w') + g(v, 'd'))) },
    answer: (v) => `სიგრძე ${g(v, 'w') + g(v, 'd')} სმ, სიგანე ${v.w} სმ`,
    options: (v, right) => textOptions(right, [`სიგრძე ${g(v, 'w')} სმ, სიგანე ${g(v, 'w') + g(v, 'd')} სმ`, `სიგრძე ${g(v, 'w') + 2 * g(v, 'd')} სმ, სიგანე ${g(v, 'w') + g(v, 'd')} სმ`, `სიგრძე ${g(v, 'P') / 2 - g(v, 'd')} სმ, სიგანე ${g(v, 'd')} სმ`, `სიგრძე ${g(v, 'w') + g(v, 'd') + 1} სმ, სიგანე ${g(v, 'w') - 1} სმ`, `სიგრძე ${g(v, 'w') + 1} სმ, სიგანე ${g(v, 'w') - g(v, 'd') + 1 > 0 ? g(v, 'w') - g(v, 'd') + 1 : g(v, 'w') + 2} სმ`]),
    why: (v, a) => `ნახევარპერიმეტრი ${g(v, 'P') / 2} სმ = 2 · სიგანე + ${v.d}; სიგანე ${(g(v, 'P') / 2 - g(v, 'd')) / 2} სმ. ${a}.`,
  }),
  t({
    sub: 'u09-04',
    prompt: 'კინოთეატრის ბილეთი ბავშვისთვის {pk} ლარი ღირს, ხოლო უფროსისთვის — {pa} ლარი. გაიყიდა {n} ბილეთი და მიღებული თანხა {s} ლარია. რამდენი ბავშვის და რამდენი უფროსის ბილეთი გაიყიდა?',
    vars: { pk: I(5, 10), dp: I(2, 6), k: I(2, 9), a: I(2, 9), pa: D((v) => g(v, 'pk') + g(v, 'dp')), n: D((v) => g(v, 'k') + g(v, 'a')), s: D((v) => g(v, 'pk') * g(v, 'k') + (g(v, 'pk') + g(v, 'dp')) * g(v, 'a')) },
    constraints: [{ test: (v: Vars) => g(v, 'k') !== g(v, 'a'), note: 'different counts' }],
    answer: (v) => `ბავშვის — ${v.k}, უფროსის — ${v.a}`,
    options: (v, right) => textOptions(right, [`ბავშვის — ${v.a}, უფროსის — ${v.k}`, `ბავშვის — ${g(v, 'k') + 1}, უფროსის — ${g(v, 'a') - 1}`, `ბავშვის — ${g(v, 'k') - 1}, უფროსის — ${g(v, 'a') + 1}`, `ბავშვის — ${g(v, 'n') / 2 === Math.floor(g(v, 'n') / 2) ? g(v, 'n') / 2 : g(v, 'k') + 2}, უფროსის — ${g(v, 'n') / 2 === Math.floor(g(v, 'n') / 2) ? g(v, 'n') / 2 : g(v, 'a') - 2}`]),
    why: (v, a) => `თუ ყველა ბილეთი ბავშვისაა, ${v.n} · ${v.pk} = ${g(v, 'n') * g(v, 'pk')} ლარი; დარჩენილი ${g(v, 's') - g(v, 'n') * g(v, 'pk')} ლარი უფროსების ბილეთებზე, თითო ${g(v, 'dp')} ლარით მეტზე: ${g(v, 'a')} ბილეთი. ${a}.`,
  }),
  t({
    sub: 'u09-04',
    prompt: 'ავზში იყო გარკვეული რაოდენობის წყალი. მას {a} ლიტრი დაამატეს და ახლა {b} ლიტრი წყალია. რამდენი ლიტრი წყალი იყო ავზში თავდაპირველად?',
    vars: { x: I(10, 80), a: I(5, 40), b: D((v) => g(v, 'x') + g(v, 'a')) },
    answer: (v) => fmt(g(v, 'x'), 'ლიტრი'),
    options: (v) => unitOptions(g(v, 'x'), 'ლიტრი', [g(v, 'b') + g(v, 'a'), g(v, 'a'), g(v, 'b'), g(v, 'x') + 2]),
    why: (v, a) => `${v.b} ${MINUS} ${v.a} = ${a}.`,
  }),
  t({
    sub: 'u09-04',
    prompt: 'ორი მეგობრის ასაკების ჯამია {s} წელი. ერთი მეგობარი მეორეზე {d} წლით უფროსია. იპოვე თითოეულის ასაკი.',
    vars: { y: I(8, 30), d: I(2, 12), s: D((v) => 2 * g(v, 'y') + g(v, 'd')) },
    answer: (v) => `${g(v, 'y') + g(v, 'd')} და ${v.y} წელი`,
    options: (v, right) => textOptions(right, [`${v.y} და ${g(v, 'y') + g(v, 'd')} წელი`, `${g(v, 'y') + g(v, 'd') + 1} და ${g(v, 'y') - 1} წელი`, `${g(v, 'y') + 2 * g(v, 'd')} და ${g(v, 'y') + g(v, 'd') - g(v, 'd') + 1} წელი`, `${Math.floor(g(v, 's') / 2) + g(v, 'd')} და ${Math.floor(g(v, 's') / 2)} წელი`]),
    why: (v, a) => `უმცროსის ასაკი (${v.s} ${MINUS} ${v.d}) ÷ 2 = ${v.y}, უფროსის ${g(v, 'y') + g(v, 'd')}. ${a}.`,
  }),
];
