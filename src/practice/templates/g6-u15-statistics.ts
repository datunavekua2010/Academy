import type { QuestionTemplate, Vars } from './types';
import { C, D, F, I, N, SPEC, group, q6, sg } from './g6-helpers';

/**
 * Grade VI — Unit 15: სტატისტიკა (statistics).
 *
 * Converted from the academy's `U15` bank: 5 subtopics × 6 questions.
 *
 * Data sets are built from a base value and gaps (so they are distinct and
 * ordered), then shown in a scrambled order. Where the question needs a whole
 * mean, the last value is chosen so the sum divides evenly. Where two or three
 * answers are asked at once ("median and mode") the key is one text with the
 * parts labelled, and the wrong options change one part at a time.
 */

export const G6_U15_SUBTOPICS = ['u15-01', 'u15-02', 'u15-03', 'u15-04', 'u15-05'] as const;

const T = 'g6-statistics';
let seq = 0;
const nextId = (): string => `g6-u15-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

// ───────────────────────────── data sets ─────────────────────────────

/** Base value and `n` gap variables. */
const ladderVars = (n: number, lo = 1, hi = 4, base: [number, number] = [1, 12]): Record<string, ReturnType<typeof I>> => ({
  b: I(base[0], base[1]),
  ...Object.fromEntries(Array.from({ length: n }, (_, i) => [`g${i}`, I(lo, hi)])),
});
/** An increasing run of `n` values from `b` and the gaps `g0…`. */
const ladder = (v: Vars, n: number): number[] => {
  const out = [N(v, 'b')];
  for (let i = 0; i < n - 1; i += 1) out.push(out[i]! + N(v, `g${i}`));
  return out;
};
/** The same run, but the last value is nudged (gap 1…n) so the sum divides by `n`. */
const ladderWholeMean = (v: Vars, n: number): number[] => {
  const head = ladder(v, n - 1);
  const sum = head.reduce((a, b) => a + b, 0);
  const gap = ((((-(sum + head[n - 2]!)) % n) + n) % n) || n;
  return [...head, head[n - 2]! + gap];
};
/** A fixed, key-dependent shuffle — the data never come out sorted by accident. */
const scramble = (xs: number[], key: number): number[] =>
  xs
    .map((x, i) => ({ x, h: (x * 7919 + (i + 1) * 104729 + key * 15485863) % 1009 }))
    .sort((a, b) => a.h - b.h || a.x - b.x)
    .map((p) => p.x);
const list = (xs: number[]): string => xs.map((x) => group(x)).join(', ');
const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);
const mean = (xs: number[]): number => sum(xs) / xs.length;
const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};
const modeOf = (xs: number[]): number => {
  const counts = new Map<number, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
};
const key = (v: Vars): number => N(v, 'k');

/** `მედიანა 7; მოდა 5` — labelled parts joined into one answer. */
const joined = (labels: string[], values: number[]): string => labels.map((l, i) => `${l} ${sg(values[i]!)}`).join('; ');
/**
 * Options for a labelled multi-part answer: the key, then one part changed at a
 * time (round-robin over the parts), then the parts swapped.
 */
const parts = (labels: string[], truth: number[], extras: number[][] = []): string[] => {
  const out = [joined(labels, truth)];
  const alts = truth.map((x, i) => [...(extras[i] ?? []), x + 1, x - 1, x + 2, x - 2].filter((y) => y > 0 && y !== x));
  for (let round = 0; round < 4; round += 1) {
    for (let i = 0; i < truth.length; i += 1) {
      const y = alts[i]![round];
      if (y === undefined) continue;
      out.push(joined(labels, truth.map((x, j) => (j === i ? y : x))));
    }
  }
  if (truth.length === 2) out.push(joined(labels, [truth[1]!, truth[0]!]));
  return [...new Set(out)];
};

export const G6_U15_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U15.1 — საშუალო, უდიდესი და უმცირესი მნიშვნელობები ═════════
  t({
    sub: 'u15-01',
    prompt: 'მოცემულია რიცხვები: {data}. იპოვე უდიდესი რიცხვი.',
    vars: { ...ladderVars(4, 1, 5), k: I(1, 500), data: D((v) => list(scramble(ladder(v, 5), key(v)))) },
    answer: (v) => sg(Math.max(...ladder(v, 5))),
    wrong: (v) => {
      const xs = ladder(v, 5);
      return [xs[3]!, xs[0]!, xs[4]! + 1, xs[4]! - 1, Math.round(mean(xs)), xs[4]! + xs[3]!];
    },
    why: (_v, a) => `მოცემულ რიცხვებს შორის ყველაზე დიდია ${a}.`,
  }),
  t({
    sub: 'u15-01',
    prompt: 'მოცემულია რიცხვები: {data}. იპოვე უმცირესი რიცხვი.',
    vars: { ...ladderVars(4, 1, 5, [2, 15]), k: I(1, 500), data: D((v) => list(scramble(ladder(v, 5), key(v)))) },
    answer: (v) => sg(Math.min(...ladder(v, 5))),
    wrong: (v) => {
      const xs = ladder(v, 5);
      return [xs[1]!, xs[4]!, xs[0]! + 1, xs[0]! - 1, Math.round(mean(xs)), xs[0]! + xs[1]!];
    },
    why: (_v, a) => `მოცემულ რიცხვებს შორის ყველაზე პატარაა ${a}.`,
  }),
  t({
    sub: 'u15-01',
    prompt: 'იპოვე რიცხვების საშუალო არითმეტიკული: {data}.',
    vars: { m: I(4, 40), a: I(1, 3), c: I(1, 3), k: I(1, 500), data: D((v) => list(scramble(three(v), key(v)))) },
    answer: (v) => sg(N(v, 'm')),
    wrong: (v) => [sum(three(v)), N(v, 'm') + 1, N(v, 'm') - 1, Math.max(...three(v)), Math.round(sum(three(v)) / 2), Math.min(...three(v))],
    why: (v, a) => `(${list(three(v)).replace(/, /g, ' + ')}) ÷ 3 = ${sum(three(v))} ÷ 3 = ${a}.`,
  }),
  t({
    sub: 'u15-01',
    prompt: 'მოსწავლემ ოთხ ტესტში მიიღო ქულები: {data}. იპოვე საშუალო ქულა.',
    vars: { ...ladderVars(2, 1, 5, [6, 18]), k: I(1, 500), data: D((v) => list(scramble(four(v), key(v)))) },
    answer: (v) => sg(mean(four(v))),
    wrong: (v) => [sum(four(v)), mean(four(v)) + 1, mean(four(v)) - 1, mean(four(v)) + 2, Math.round(sum(four(v)) / 3), Math.max(...four(v))],
    why: (v, a) => `(${list(four(v)).replace(/, /g, ' + ')}) ÷ 4 = ${sum(four(v))} ÷ 4 = ${a}.`,
  }),
  t({
    sub: 'u15-01',
    d: 2,
    prompt: 'მოცემულია რიცხვები: {data}. იპოვე უდიდესსა და უმცირეს რიცხვებს შორის სხვაობა.',
    vars: { ...ladderVars(4, 2, 7, [3, 14]), k: I(1, 500), data: D((v) => list(scramble(ladder(v, 5), key(v)))) },
    answer: (v) => sg(Math.max(...ladder(v, 5)) - Math.min(...ladder(v, 5))),
    wrong: (v) => {
      const xs = ladder(v, 5);
      return [xs[4]!, xs[0]!, xs[4]! + xs[0]!, xs[4]! - xs[0]! + 1, xs[4]! - xs[0]! - 1, xs[3]! - xs[0]!];
    },
    why: (v, a) => `${Math.max(...ladder(v, 5))} − ${Math.min(...ladder(v, 5))} = ${a}.`,
  }),
  t({
    sub: 'u15-01',
    prompt: 'ხუთი დღის განმავლობაში ტემპერატურა იყო: {data}. იპოვე საშუალო ტემპერატურა.',
    vars: { ...ladderVars(3, 1, 3, [10, 24]), k: I(1, 500), data: D((v) => temps(scramble(ladderWholeMean(v, 5), key(v)))) },
    answer: (v) => `${sg(mean(ladderWholeMean(v, 5)))}°C`,
    wrong: (v) => {
      const xs = ladderWholeMean(v, 5);
      return [sum(xs), mean(xs) + 1, mean(xs) - 1, Math.max(...xs), Math.min(...xs), median(xs) === mean(xs) ? mean(xs) + 2 : median(xs)].map((x) => `${sg(x)}°C`);
    },
    options: (v, right) => {
      const xs = ladderWholeMean(v, 5);
      return [right, ...[sum(xs), mean(xs) + 1, mean(xs) - 1, Math.max(...xs), Math.min(...xs), mean(xs) + 2].map((x) => `${sg(x)}°C`)];
    },
    why: (v, a) => `${sum(ladderWholeMean(v, 5))} ÷ 5 = ${a}.`,
  }),

  // ═════════ U15.2 — მონაცემთა საშუალო და გამოტოვებული მონაცემი ═════════
  ...missing('u15-02', 1, 'სამი რიცხვის საშუალო არითმეტიკულია {m}. პირველი ორი რიცხვია {x} და {y}. იპოვე მესამე რიცხვი.', 3),
  ...missing('u15-02', 1, 'ოთხი რიცხვის საშუალო არითმეტიკულია {m}. სამი რიცხვია {x}, {y} და {z}. იპოვე მეოთხე რიცხვი.', 4),
  t({
    sub: 'u15-02',
    prompt: 'ხუთი მოსწავლის ქულების საშუალო არითმეტიკულია {m}. ოთხმა მოსწავლემ მიიღო {x}, {y}, {z} და {w} ქულა. რამდენი ქულა მიიღო მეხუთე მოსწავლემ?',
    vars: knownVars(8, 20),
    answer: (v) => sg(lastOf(v, 5)),
    wrong: (v) => missSlips(v, 5),
    why: (v, a) => `5 × ${v.m} = ${5 * N(v, 'm')}; ${5 * N(v, 'm')} − ${known(v, 4).reduce((p, q) => p + q, 0)} = ${a}.`,
  }),
  t({
    sub: 'u15-02',
    d: 2,
    prompt: 'ოთხი რიცხვის საშუალო არითმეტიკულია {mt}. სამი რიცხვია {x}, {y} და {z}. იპოვე მეოთხე რიცხვი.',
    vars: {
      ...knownVars(3, 14),
      m: I(4, 12),
      mt: D((v) => `${N(v, 'm')},5`),
    },
    answer: (v) => sg(4 * N(v, 'm') + 2 - sum(known(v, 3))),
    wrong: (v) => [4 * N(v, 'm') - sum(known(v, 3)), 4 * N(v, 'm') + 3 - sum(known(v, 3)), 4 * N(v, 'm') + 1 - sum(known(v, 3)), 4 * N(v, 'm') + 2 + sum(known(v, 3)), N(v, 'm') * 5 - sum(known(v, 3))],
    constraints: [{ test: (v) => 4 * N(v, 'm') + 2 - sum(known(v, 3)) > 0, note: 'positive missing number' }],
    why: (v, a) => `4 × ${v.mt} = ${4 * N(v, 'm') + 2}; ${4 * N(v, 'm') + 2} − ${sum(known(v, 3))} = ${a}.`,
  }),
  t({
    sub: 'u15-02',
    d: 2,
    prompt: 'ექვსი დღის განმავლობაში მაღაზიამ გაყიდა საშუალოდ {m} {item} დღეში. პირველ ხუთ დღეში გაყიდა {x}, {y}, {z}, {w} და {u} {item}. რამდენი {item} გაყიდა მეექვსე დღეს?',
    vars: {
      ...knownVars(15, 40),
      spec: SPEC(['პური|პური', 'ფუნთუშა|ფუნთუშა', 'ბოთლი წყალი|ბოთლი წყალი', 'წიგნი|წიგნი']),
      item: F(0),
    },
    answer: (v) => sg(lastOf(v, 6)),
    wrong: (v) => missSlips(v, 6),
    constraints: [{ test: (v) => lastOf(v, 6) > 0, note: 'positive sixth day' }],
    why: (v, a) => `6 × ${v.m} = ${6 * N(v, 'm')}; ${6 * N(v, 'm')} − ${sum(known(v, 5))} = ${a}.`,
  }),
  t({
    sub: 'u15-02',
    d: 3,
    prompt: 'სამი რიცხვის საშუალო არითმეტიკულია {m}. მეოთხე რიცხვის დამატების შემდეგ ოთხი რიცხვის საშუალო გახდა {n}. იპოვე დამატებული მეოთხე რიცხვი.',
    vars: { m: I(6, 30), j: I(1, 6), n: D((v) => N(v, 'm') + N(v, 'j')) },
    answer: (v) => sg(N(v, 'm') + 4 * N(v, 'j')),
    wrong: (v) => [N(v, 'n'), N(v, 'm') + N(v, 'j'), 4 * N(v, 'n'), N(v, 'm') + 2 * N(v, 'j'), N(v, 'n') + N(v, 'j'), 4 * N(v, 'n') - 3 * N(v, 'm') + 1],
    why: (v, a) => `მთლიანი ჯამი: 3 × ${v.m} = ${3 * N(v, 'm')}; ახლა: 4 × ${v.n} = ${4 * N(v, 'n')}; ${4 * N(v, 'n')} − ${3 * N(v, 'm')} = ${a}.`,
  }),

  // ═════════ U15.3 — მედიანა და მოდა ═════════
  t({
    sub: 'u15-03',
    prompt: 'იპოვე მედიანა: {data}.',
    vars: { ...ladderVars(4, 1, 5, [1, 12]), k: I(1, 500), data: D((v) => list(scramble(ladder(v, 5), key(v)))) },
    answer: (v) => sg(ladder(v, 5)[2]!),
    wrong: (v) => {
      const xs = ladder(v, 5);
      const printed = scramble(xs, key(v));
      return [printed[2] === xs[2] ? xs[1]! : printed[2]!, Math.round(mean(xs)) === xs[2] ? xs[3]! : Math.round(mean(xs)), xs[1]!, xs[3]!, xs[2]! + 1];
    },
    why: (v, a) => `დალაგებული რიცხვები: ${list(ladder(v, 5))}; შუაში ${a} დგას.`,
  }),
  t({
    sub: 'u15-03',
    d: 2,
    prompt: 'იპოვე მედიანა: {data}.',
    vars: { ...ladderVars(5, 2, 6, [2, 12]), g2: C([2, 4, 6]), k: I(1, 500), data: D((v) => list(scramble(ladder(v, 6), key(v)))) },
    answer: (v) => sg(median(ladder(v, 6))),
    wrong: (v) => {
      const xs = ladder(v, 6);
      return [xs[2]!, xs[3]!, Math.round(mean(xs)) === median(xs) ? median(xs) + 2 : Math.round(mean(xs)), xs[2]! + xs[3]!, median(xs) + 1, median(xs) - 1];
    },
    why: (v, a) => `დალაგებული: ${list(ladder(v, 6))}; შუა ორი რიცხვია ${ladder(v, 6)[2]} და ${ladder(v, 6)[3]}: (${ladder(v, 6)[2]} + ${ladder(v, 6)[3]}) ÷ 2 = ${a}.`,
  }),
  t({
    sub: 'u15-03',
    prompt: 'იპოვე მოდა: {data}.',
    vars: { ...ladderVars(4, 1, 3, [1, 10]), m: I(0, 4), k: I(1, 500), data: D((v) => list(scramble(withMode(v, 1), key(v)))) },
    answer: (v) => sg(ladder(v, 5)[N(v, 'm')]!),
    wrong: (v) => modeSlips(v),
    why: (_v, a) => `${a} ყველაზე ხშირად, 3-ჯერ გვხვდება.`,
  }),
  t({
    sub: 'u15-03',
    d: 2,
    prompt: 'იპოვე მოდა: {data}.',
    vars: { ...ladderVars(4, 1, 3, [1, 10]), m: I(0, 4), k: I(1, 500), data: D((v) => list(scramble(withMode(v, 2), key(v)))) },
    answer: (v) => sg(ladder(v, 5)[N(v, 'm')]!),
    wrong: (v) => modeSlips(v),
    why: (_v, a) => `${a} ყველაზე ხშირად, 3-ჯერ გვხვდება.`,
  }),
  t({
    sub: 'u15-03',
    d: 2,
    prompt: 'იპოვე მედიანა და მოდა: {data}.',
    vars: { ...ladderVars(4, 1, 3, [1, 10]), m: I(0, 4), k: I(1, 500), data: D((v) => list(scramble(withMode(v, 1), key(v)))) },
    answer: (v) => joined(['მედიანა', 'მოდა'], [median(withMode(v, 1)), modeOf(withMode(v, 1))]),
    options: (v, right) => [right, ...parts(['მედიანა', 'მოდა'], [median(withMode(v, 1)), modeOf(withMode(v, 1))], [[Math.round(mean(withMode(v, 1)))], []]).slice(1)],
    why: (v, a) => `დალაგებული: ${list([...withMode(v, 1)].sort((x, y) => x - y))}; ${a}.`,
  }),
  t({
    sub: 'u15-03',
    d: 3,
    prompt: 'მონაცემებია: {data}. იპოვე მედიანა და მოდა.',
    vars: { ...ladderVars(4, 1, 3, [8, 14]), g2: C([2, 4]), m: I(0, 4), k: I(1, 500), data: D((v) => list(scramble(withMode(v, 2), key(v)))) },
    constraints: [{ test: (v) => Number.isInteger(median(withMode(v, 2))), note: 'whole median' }],
    answer: (v) => joined(['მედიანა', 'მოდა'], [median(withMode(v, 2)), modeOf(withMode(v, 2))]),
    options: (v, right) => [right, ...parts(['მედიანა', 'მოდა'], [median(withMode(v, 2)), modeOf(withMode(v, 2))], [[Math.round(mean(withMode(v, 2)))], []]).slice(1)],
    why: (v, a) => `დალაგებული: ${list([...withMode(v, 2)].sort((x, y) => x - y))}; ${a}.`,
  }),

  // ═════════ U15.4 — მონაცემთა შემაჯამებელი მახასიათებლები ═════════
  t({
    sub: 'u15-04',
    prompt: 'მონაცემებია: {data}. იპოვე მონაცემთა დიაპაზონი.',
    vars: { ...ladderVars(4, 1, 6, [3, 15]), data: D((v) => list(ladder(v, 5))) },
    answer: (v) => sg(range(ladder(v, 5))),
    wrong: (v) => {
      const xs = ladder(v, 5);
      return [xs[4]!, xs[0]!, xs[4]! + xs[0]!, range(xs) + 1, range(xs) - 1, xs[3]! - xs[0]!];
    },
    why: (v, a) => `${ladder(v, 5)[4]} − ${ladder(v, 5)[0]} = ${a}.`,
  }),
  t({
    sub: 'u15-04',
    prompt: 'მონაცემებია: {data}. იპოვე საშუალო არითმეტიკული და მედიანა.',
    vars: { ...ladderVars(3, 1, 4, [3, 12]), data: D((v) => list(ladderWholeMean(v, 5))) },
    answer: (v) => joined(['საშუალო', 'მედიანა'], [mean(ladderWholeMean(v, 5)), median(ladderWholeMean(v, 5))]),
    options: (v, right) => [right, ...parts(['საშუალო', 'მედიანა'], [mean(ladderWholeMean(v, 5)), median(ladderWholeMean(v, 5))], [[sum(ladderWholeMean(v, 5))], [Math.round(mean(ladderWholeMean(v, 5))) + 3]]).slice(1)],
    why: (v, a) => `საშუალო: ${sum(ladderWholeMean(v, 5))} ÷ 5 = ${mean(ladderWholeMean(v, 5))}; მედიანა — შუა რიცხვი: ${median(ladderWholeMean(v, 5))}. ${a}.`,
  }),
  t({
    sub: 'u15-04',
    d: 2,
    prompt: 'კლასში მოსწავლეთა ქულებია: {data}. იპოვე მოდა და დიაპაზონი.',
    vars: { ...ladderVars(3, 1, 4, [6, 14]), m: I(0, 3), data: D((v) => list(withPair(v))) },
    answer: (v) => joined(['მოდა', 'დიაპაზონი'], [modeOf(withPair(v)), range(withPair(v))]),
    options: (v, right) => [right, ...parts(['მოდა', 'დიაპაზონი'], [modeOf(withPair(v)), range(withPair(v))], [[withPair(v)[0]!], [withPair(v)[4]!]]).slice(1)],
    why: (v, a) => `მოდა: ${modeOf(withPair(v))} ორჯერ გვხვდება; დიაპაზონი: ${withPair(v)[4]} − ${withPair(v)[0]} = ${range(withPair(v))}. ${a}.`,
  }),
  t({
    sub: 'u15-04',
    d: 2,
    prompt: 'მონაცემებია: {data}. იპოვე საშუალო არითმეტიკული და მედიანა.',
    vars: { ...ladderVars(4, 1, 4, [2, 10]), g2: C([2, 4]), data: D((v) => list(ladderWholeMean(v, 6))) },
    answer: (v) => joined(['საშუალო', 'მედიანა'], [mean(ladderWholeMean(v, 6)), median(ladderWholeMean(v, 6))]),
    options: (v, right) => [right, ...parts(['საშუალო', 'მედიანა'], [mean(ladderWholeMean(v, 6)), median(ladderWholeMean(v, 6))], [[ladderWholeMean(v, 6)[2]!], [ladderWholeMean(v, 6)[3]!]]).slice(1)],
    why: (v, a) => `საშუალო: ${sum(ladderWholeMean(v, 6))} ÷ 6 = ${mean(ladderWholeMean(v, 6))}; მედიანა: (${ladderWholeMean(v, 6)[2]} + ${ladderWholeMean(v, 6)[3]}) ÷ 2 = ${median(ladderWholeMean(v, 6))}. ${a}.`,
  }),
  t({
    sub: 'u15-04',
    d: 2,
    prompt: 'მონაცემებია: {data}. იპოვე უდიდესი მნიშვნელობა, უმცირესი მნიშვნელობა და დიაპაზონი.',
    vars: { ...ladderVars(5, 0, 9, [5, 30]), data: D((v) => list(ladder(v, 6))) },
    constraints: [{ test: (v) => range(ladder(v, 6)) >= 5, note: 'a real range' }],
    answer: (v) => joined(['უდიდესი', 'უმცირესი', 'დიაპაზონი'], [Math.max(...ladder(v, 6)), Math.min(...ladder(v, 6)), range(ladder(v, 6))]),
    options: (v, right) => [right, ...parts(['უდიდესი', 'უმცირესი', 'დიაპაზონი'], [Math.max(...ladder(v, 6)), Math.min(...ladder(v, 6)), range(ladder(v, 6))], [[], [], [Math.max(...ladder(v, 6))]]).slice(1)],
    why: (v, a) => `${Math.max(...ladder(v, 6))} − ${Math.min(...ladder(v, 6))} = ${range(ladder(v, 6))}. ${a}.`,
  }),
  t({
    sub: 'u15-04',
    d: 3,
    prompt: 'მონაცემებია: {data}. იპოვე საშუალო არითმეტიკული, მედიანა და მოდა.',
    vars: { ...ladderVars(3, 1, 3, [4, 12]), z: I(0, 2), data: D((v) => list(modeSet(v))) },
    answer: (v) => joined(['საშუალო', 'მედიანა', 'მოდა'], [mean(modeSet(v)), median(modeSet(v)), modeOf(modeSet(v))]),
    options: (v, right) => [right, ...parts(['საშუალო', 'მედიანა', 'მოდა'], [mean(modeSet(v)), median(modeSet(v)), modeOf(modeSet(v))], [[sum(modeSet(v))], [], []]).slice(1)],
    why: (v, a) => `საშუალო: ${sum(modeSet(v))} ÷ 5 = ${mean(modeSet(v))}; შუა რიცხვი: ${median(modeSet(v))}; ორჯერ გვხვდება ${modeOf(modeSet(v))}. ${a}.`,
  }),

  // ═════════ U15.5 — დიაგრამების გამოყენება ═════════
  t({
    sub: 'u15-05',
    prompt: 'სვეტოვან დიაგრამაზე წიგნების რაოდენობა მოცემულია ასე: {n0} — {c0}, {n1} — {c1}, {n2} — {c2}. რომელი კატეგორიის წიგნებია ყველაზე მეტი?',
    vars: {
      spec: SPEC(['ქართული|მათემატიკა|მეცნიერება', 'ისტორია|ლიტერატურა|გეოგრაფია', 'ზღაპრები|რომანები|ლექსები', 'სათავგადასავლო|დეტექტიური|ფანტასტიკა', 'ინგლისური|მუსიკა|ხელოვნება']),
      n0: F(0), n1: F(1), n2: F(2), c0: I(4, 25), c1: I(4, 25), c2: I(4, 25),
    },
    constraints: [{ test: (v) => new Set([N(v, 'c0'), N(v, 'c1'), N(v, 'c2')]).size === 3, note: 'a clear winner' }],
    optionCount: 3,
    answer: (v) => String(v[`n${winner(v)}`]),
    options: (v, right) => [right, String(v.n0), String(v.n1), String(v.n2)],
    why: (v, a) => `${v.n0}: ${v.c0}, ${v.n1}: ${v.c1}, ${v.n2}: ${v.c2}; ყველაზე მაღალი სვეტი: ${a}.`,
  }),
  t({
    sub: 'u15-05',
    prompt: 'მაღაზიამ ორშაბათს გაყიდა {a}, სამშაბათს — {b}, ოთხშაბათს — {c} და ხუთშაბათს — {e} {item}. რამდენი {item} გაიყიდა ოთხ დღეში სულ?',
    vars: { a: I(12, 45), b: I(12, 45), c: I(12, 45), e: I(12, 45), spec: SPEC(['ბურთი|ბურთი', 'რვეული|რვეული', 'კალამი|კალამი', 'წიგნი|წიგნი']), item: F(0) },
    answer: (v) => sg(N(v, 'a') + N(v, 'b') + N(v, 'c') + N(v, 'e')),
    wrong: (v) => {
      const total = N(v, 'a') + N(v, 'b') + N(v, 'c') + N(v, 'e');
      return [total - 10, total + 10, total - 1, total + 1, total - N(v, 'a'), Math.max(N(v, 'a'), N(v, 'b'), N(v, 'c'), N(v, 'e'))];
    },
    why: (v, a) => `${v.a} + ${v.b} + ${v.c} + ${v.e} = ${a}.`,
  }),
  t({
    sub: 'u15-05',
    prompt: 'კლასის მოსწავლეთა საყვარელი {kind} მონაცემებია: {n0} — {c0}, {n1} — {c1}, {n2} — {c2}, {n3} — {c3}. რამდენმა მოსწავლემ აირჩია {pick} სულ?',
    vars: {
      spec: SPEC(['ხილის|ხილი|ვაშლი|ბანანი|ფორთოხალი|მსხალი', 'ხილის|ხილი|ატამი|ყურძენი|მანდარინი|ალუბალი', 'ფერის|ფერი|ლურჯი|წითელი|მწვანე|ყვითელი', 'სპორტის|სპორტი|ფეხბურთი|კალათბურთი|ცურვა|ჩოგბურთი', 'საგნის|საგანი|მათემატიკა|ხატვა|მუსიკა|ისტორია']),
      kind: F(0), pick: F(1), n0: F(2), n1: F(3), n2: F(4), n3: F(5),
      c0: I(3, 12), c1: I(3, 12), c2: I(3, 12), c3: I(3, 12),
    },
    answer: (v) => sg(N(v, 'c0') + N(v, 'c1') + N(v, 'c2') + N(v, 'c3')),
    wrong: (v) => {
      const total = N(v, 'c0') + N(v, 'c1') + N(v, 'c2') + N(v, 'c3');
      return [total + 1, total - 1, total + 2, total - 2, Math.max(N(v, 'c0'), N(v, 'c1'), N(v, 'c2'), N(v, 'c3')), total - Math.min(N(v, 'c0'), N(v, 'c1'), N(v, 'c2'), N(v, 'c3'))];
    },
    why: (v, a) => `${v.c0} + ${v.c1} + ${v.c2} + ${v.c3} = ${a}.`,
  }),
  t({
    sub: 'u15-05',
    d: 2,
    prompt: 'წრიულ დიაგრამაზე კლასის {a}% ფეხბურთს ანიჭებს უპირატესობას, {b}% — კალათბურთს, {c}% — ცურვას, ხოლო დანარჩენი — სხვა სპორტს. რამდენი პროცენტი ირჩევს სხვა სპორტს?',
    vars: { a: C([30, 35, 40, 45, 50]), b: C([10, 15, 20, 25]), c: C([5, 10, 15, 20]) },
    constraints: [{ test: (v) => N(v, 'a') + N(v, 'b') + N(v, 'c') <= 95, note: 'something is left' }],
    answer: (v) => `${100 - N(v, 'a') - N(v, 'b') - N(v, 'c')}%`,
    options: (v, right) => {
      const rest = 100 - N(v, 'a') - N(v, 'b') - N(v, 'c');
      return [right, ...[rest + 5, rest - 5, N(v, 'a') + N(v, 'b') + N(v, 'c'), 100 - N(v, 'a'), rest + 10, rest + 15].filter((x) => x > 0 && x < 100 && x !== rest).map((x) => `${x}%`)];
    },
    why: (v, a) => `${v.a} + ${v.b} + ${v.c} = ${N(v, 'a') + N(v, 'b') + N(v, 'c')}; 100 − ${N(v, 'a') + N(v, 'b') + N(v, 'c')} = ${a}.`,
  }),
  t({
    sub: 'u15-05',
    d: 2,
    prompt: 'ხაზოვან დიაგრამაზე ტემპერატურა ოთხ დღეს იყო: ორშაბათს {t0}°C, სამშაბათს {t1}°C, ოთხშაბათს {t2}°C და ხუთშაბათს {t3}°C. რომელ დღეებს შორის გაიზარდა ტემპერატურა ყველაზე მეტად?',
    vars: { t0: I(8, 22), r0: I(-4, 8), r1: I(-4, 8), r2: I(-4, 8), t1: D((v) => N(v, 't0') + N(v, 'r0')), t2: D((v) => N(v, 't0') + N(v, 'r0') + N(v, 'r1')), t3: D((v) => N(v, 't0') + N(v, 'r0') + N(v, 'r1') + N(v, 'r2')) },
    constraints: [{ test: (v) => { const r = [N(v, 'r0'), N(v, 'r1'), N(v, 'r2')]; const top = Math.max(...r); return top > 0 && r.filter((x) => x === top).length === 1 && N(v, 't1') >= 5 && N(v, 't2') >= 5 && N(v, 't3') >= 5; }, note: 'one clear biggest rise' }],
    optionCount: 3,
    answer: (v) => RISES[riseAt(v)]!,
    options: (_v, right) => [right, ...RISES.filter((x) => x !== right)],
    why: (v, a) => `ცვლილებები: ${[N(v, 'r0'), N(v, 'r1'), N(v, 'r2')].map((x) => (x >= 0 ? `+${x}` : `−${-x}`)).join(', ')}; ყველაზე დიდი ზრდა: ${a}.`,
  }),
  t({
    sub: 'u15-05',
    d: 2,
    prompt: 'სვეტოვან დიაგრამაზე ხუთი მოსწავლის მიერ წაკითხული წიგნების რაოდენობაა: ანა — {r0}, ლუკა — {r1}, მარიამი — {r2}, გიორგი — {r3}, ნინო — {r4}. იპოვე წაკითხული წიგნების საშუალო რაოდენობა ერთ მოსწავლეზე.',
    vars: { ...ladderVars(4, 1, 3, [2, 8]), k: I(1, 500), r0: D((v) => readers(v)[0]!), r1: D((v) => readers(v)[1]!), r2: D((v) => readers(v)[2]!), r3: D((v) => readers(v)[3]!), r4: D((v) => readers(v)[4]!) },
    answer: (v) => sg(mean(readers(v))),
    wrong: (v) => [sum(readers(v)), mean(readers(v)) + 1, mean(readers(v)) - 1, Math.max(...readers(v)), mean(readers(v)) + 2, Math.round(sum(readers(v)) / 4)],
    why: (v, a) => `${readers(v).join(' + ')} = ${sum(readers(v))}; ${sum(readers(v))} ÷ 5 = ${a}.`,
  }),
];

function three(v: Vars): number[] {
  const m = N(v, 'm');
  const lower = m - N(v, 'a');
  const upper = m + N(v, 'c');
  return [lower, upper, 3 * m - lower - upper];
}
function four(v: Vars): number[] {
  return ladderWholeMean(v, 4);
}
function temps(xs: number[]): string {
  return xs.map((x) => `${group(x)}°C`).join(', ');
}

/** Known values of a "find the missing one" problem: `x, y, z, w, u` (the first `n − 1`). */
function known(v: Vars, count: number): number[] {
  return ['x', 'y', 'z', 'w', 'u'].slice(0, count).map((name) => N(v, name));
}
function knownVars(lo: number, hi: number): Record<string, ReturnType<typeof I>> {
  const near = (name: string) => D((v: Vars) => Math.max(1, N(v, 'm') + N(v, `d${name}`)));
  return {
    m: I(lo, hi),
    dx: I(-5, 5), dy: I(-5, 5), dz: I(-5, 5), dw: I(-5, 5), du: I(-5, 5),
    x: near('x'), y: near('y'), z: near('z'), w: near('w'), u: near('u'),
  };
}
function lastOf(v: Vars, n: number): number {
  return n * N(v, 'm') - sum(known(v, n - 1));
}
function missSlips(v: Vars, n: number): number[] {
  const total = n * N(v, 'm');
  const k = sum(known(v, n - 1));
  return [N(v, 'm'), total + k, total - k + 1, total - k - 1, (n - 1) * N(v, 'm') - k, Math.abs(N(v, 'm') - Math.round(k / (n - 1))), total - k + 2];
}
/** Three or four numbers with a given mean, one missing. */
function missing(sub: string, d: 1 | 2, prompt: string, n: 3 | 4): QuestionTemplate[] {
  return [
    t({
      sub, d, prompt,
      vars: knownVars(6, 20),
      constraints: [{ test: (v) => lastOf(v, n) > 0, note: 'positive missing number' }],
      answer: (v) => sg(lastOf(v, n)),
      wrong: (v) => missSlips(v, n),
      why: (v, a) => `${n} × ${v.m} = ${n * N(v, 'm')}; ${n * N(v, 'm')} − ${sum(known(v, n - 1))} = ${a}.`,
    }),
  ];
}
/**
 * Five distinct values; value `m` appears three times. With `other` = 2 the next
 * value appears twice (8 numbers in all), with 1 every other value once (7).
 */
function withMode(v: Vars, other: 1 | 2): number[] {
  const base = ladder(v, 5);
  const m = N(v, 'm') % 5;
  const out: number[] = [];
  base.forEach((x, i) => {
    const copies = i === m ? 3 : other === 2 && i === (m + 1) % 5 ? 2 : 1;
    for (let c = 0; c < copies; c += 1) out.push(x);
  });
  return out;
}
function modeSlips(v: Vars): number[] {
  const base = ladder(v, 5);
  const m = N(v, 'm') % 5;
  return [...base.filter((_, i) => i !== m), mean(base)];
}

const range = (xs: number[]): number => Math.max(...xs) - Math.min(...xs);
const RISES = ['ორშაბათსა და სამშაბათს შორის', 'სამშაბათსა და ოთხშაბათს შორის', 'ოთხშაბათსა და ხუთშაბათს შორის'];
function riseAt(v: Vars): number {
  const r = [N(v, 'r0'), N(v, 'r1'), N(v, 'r2')];
  return r.indexOf(Math.max(...r));
}
function winner(v: Vars): number {
  const c = [N(v, 'c0'), N(v, 'c1'), N(v, 'c2')];
  return c.indexOf(Math.max(...c));
}
function readers(v: Vars): number[] {
  return scramble(ladderWholeMean(v, 5), key(v));
}
/** Four distinct values, one of them (index `m`) written twice; five numbers in order. */
function withPair(v: Vars): number[] {
  const base = ladder(v, 4);
  const m = N(v, 'm') % 4;
  const out: number[] = [];
  base.forEach((x, i) => {
    out.push(x);
    if (i === m) out.push(x);
  });
  return out;
}
/** Five numbers with a whole mean and exactly one repeated value (the gap `z` is zero). */
function modeSet(v: Vars): number[] {
  const z = N(v, 'z');
  const s = [N(v, 'b')];
  for (let i = 0; i < 3; i += 1) s.push(s[i]! + (i === z ? 0 : N(v, `g${i}`)));
  const total = sum(s);
  const gap = ((((-(total + s[3]!)) % 5) + 5) % 5) || 5;
  s.push(s[3]! + gap);
  return s;
}
