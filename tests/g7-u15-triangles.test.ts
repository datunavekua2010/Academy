import { describe, expect, it } from 'vitest';
import { G7_U15_SUBTOPICS, G7_U15_TEMPLATES } from '../src/practice/templates/g7-u15-triangles';
import { eachDraw, standardSuite, type Draw } from './support/g6-harness';

/** Grade VII — Unit 15: triangles. Every key is recomputed from the numbers and letters in the printed task. */

const id = (n: number) => `g7-u15-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U15',
  topic: 'g7-triangles',
  subtopics: G7_U15_SUBTOPICS,
  templates: G7_U15_TEMPLATES,
  idPattern: /^g7-u15-q\d{2}$/,
  grade: 7,
});

const each = (n: number, check: (d: Draw) => void): void => eachDraw(id(n), check);
const nums = (text: string): number[] => (text.replace(/(\d) (?=\d{3}(?!\d))/g, '$1').match(/\d+/g) ?? []).map(Number);
const first = (d: Draw): number => nums(d.answer)[0]!;
const coefs = (text: string): number[] => [...text.matchAll(/(?:\(|^|\s|,)(\d*)x(?:°| \+)/g)].map((m) => (m[1] ? Number(m[1]) : 1));
const YES = 'კი';
const NO = 'არა';
const SSS = 'სამი გვერდის ტოლობის ნიშანი (გგგ)';
const SAS = 'ორი გვერდისა და მათ შორის მოქცეული კუთხის ტოლობის ნიშანი (გკგ)';
const ASA = 'გვერდისა და მასთან მდებარე ორი კუთხის ტოლობის ნიშანი (კგკ)';
const NONE = 'ტოლობა არ დასტურდება';
const SIM_AA = 'ორი კუთხის ტოლობის ნიშანი (კკ)';
const SIM_SSS = 'სამი გვერდის პროპორციულობის ნიშანი (გგგ)';
const SIM_SAS = 'ორი გვერდის პროპორციულობისა და მათ შორის კუთხის ტოლობის ნიშანი (გკგ)';
const SIM_NONE = 'მსგავსება არ დასტურდება';
const isTriangle = (a: number, b: number, c: number): boolean => a + b > c && a + c > b && b + c > a;
const triple = (a: number, b: number, c: number): string => `${a}°, ${b}° და ${c}°`;
const isqrt = (n: number): number => Math.round(Math.sqrt(n));
const POLY = ['სამკუთხედის', 'ოთხკუთხედის', 'ხუთკუთხედის', 'ექვსკუთხედის', 'შვიდკუთხედის', 'რვაკუთხედის', 'ცხრაკუთხედის', 'ათკუთხედის', 'თერთმეტკუთხედის', 'თორმეტკუთხედის'];

/** The criterion that follows from a list of equalities, judged by which vertices they involve. */
const congruenceOf = (sides: string[], angles: string[]): string => {
  if (angles.length === 0) return sides.length === 3 ? SSS : NONE;
  if (angles.length === 3) return NONE;
  if (angles.length === 1) return sides.length === 2 && sides.every((s) => s.includes(angles[0]!)) ? SAS : NONE;
  return sides.length === 1 && angles.every((a) => sides[0]!.includes(a)) ? ASA : NONE;
};

describe('G7 U15 — elements, angles', () => {
  it('u15-01', () => {
    each(1, (d) => expect(d.answer, d.prompt).toBe(/მართობ/.test(d.prompt) ? 'სიმაღლე' : /შუაწერტილ/.test(d.prompt) ? 'მედიანა' : 'ბისექტრისა'));
    each(2, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! / 2));
    each(3, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! / 2));
    each(4, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! / 2));
    each(5, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! / 2));
    each(6, (d) => { const [S, b] = nums(d.prompt); expect(first(d), d.prompt).toBe((2 * S!) / b!); expect((2 * S!) % b!).toBe(0); });
  });

  it('u15-02', () => {
    each(7, (d) => { const [a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe(a! + b!); });
    each(8, (d) => { const [a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe(180 - a! - b!); });
    each(9, (d) => { const [a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe(a! + b!); });
    each(10, (d) => { const [E, a] = nums(d.prompt); expect(first(d), d.prompt).toBe(E! - a!); });
    each(11, (d) => {
      const m = /\((\d*)x \+ (\d+)\)° და (\d+)°, ხოლო გარე კუთხეა (\d+)°/.exec(d.prompt)!;
      expect((m[1] ? Number(m[1]) : 1) * first(d) + Number(m[2]) + Number(m[3]), d.prompt).toBe(Number(m[4]));
    });
    each(12, (d) => expect(first(d), d.prompt).toBe(180 - nums(d.prompt)[0]!));
  });

  it('u15-03', () => {
    each(13, (d) => { const [a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe(180 - a! - b!); });
    each(14, (d) => {
      const [p, q, r] = coefs(d.prompt);
      const x = 180 / (p! + q! + r!);
      expect(Number.isInteger(x), d.prompt).toBe(true);
      expect(d.answer, d.prompt).toBe(triple(p! * x, q! * x, r! * x));
    });
    each(15, (d) => { const [a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe(180 - a! - b!); });
    each(16, (d) => {
      const m = /\((\d*)x \+ (\d+)\)°, \((\d*)x \+ (\d+)\)° და (\d+)°/.exec(d.prompt)!;
      const [p, b, q, e, c] = [m[1] ? Number(m[1]) : 1, Number(m[2]), m[3] ? Number(m[3]) : 1, Number(m[4]), Number(m[5])];
      expect((p + q) * first(d) + b + e + c, d.prompt).toBe(180);
    });
    each(17, (d) => expect(first(d), d.prompt).toBe((180 - nums(d.prompt)[0]!) / 2));
    each(18, (d) => {
      const [p, q] = coefs(d.prompt);
      const c = nums(d.prompt.split('მესამე')[1]!)[0]!;
      const x = (180 - c) / (p! + q!);
      expect(Number.isInteger(x), d.prompt).toBe(true);
      expect(d.answer, d.prompt).toBe(`x = ${x}; ${triple(p! * x, q! * x, c)}`);
    });
  });

  it('u15-04: polygons', () => {
    for (const n of [19, 20, 21, 22]) each(n, (d) => { const k = POLY.findIndex((w) => d.prompt.includes(w)); expect(first(d), d.prompt).toBe((k + 1) * 180); });
    for (const n of [23, 24]) each(n, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! / 180 + 2));
  });
});

describe('G7 U15 — triangle inequality, isosceles', () => {
  it('u15-05', () => {
    for (const n of [25, 26]) each(n, (d) => { const [a, b, c] = nums(d.prompt); expect(d.answer, d.prompt).toBe(isTriangle(a!, b!, c!) ? YES : NO); });
    each(27, (d) => {
      const [a, b] = nums(d.prompt);
      const list = d.answer.split(', ').map(Number);
      const expected = Array.from({ length: a! + b! }, (_, i) => i + 1).filter((c) => isTriangle(a!, b!, c));
      expect(list, d.prompt).toEqual(expected);
    });
    each(28, (d) => { const [a, b, c] = nums(d.prompt); expect(d.answer, d.prompt).toBe(isTriangle(a!, b!, c!) ? YES : NO); });
    each(29, (d) => { const [a, b] = nums(d.prompt); const lo = Array.from({ length: a! + b! }, (_, i) => i + 1).find((c) => isTriangle(a!, b!, c))!; expect(first(d), d.prompt).toBe(lo); });
    each(30, (d) => { const [a, b] = nums(d.prompt); const hi = Array.from({ length: a! + b! }, (_, i) => i + 1).filter((c) => isTriangle(a!, b!, c)).pop()!; expect(first(d), d.prompt).toBe(hi); });
  });

  it('u15-05: both answers occur', () => {
    const seen = new Set<string>();
    for (const n of [25, 26, 28]) each(n, (d) => seen.add(d.answer));
    expect(seen).toEqual(new Set([YES, NO]));
  });

  it('u15-06', () => {
    each(31, (d) => expect(first(d), d.prompt).toBe(180 - 2 * nums(d.prompt)[0]!));
    each(32, (d) => expect(first(d), d.prompt).toBe((180 - nums(d.prompt)[0]!) / 2));
    each(33, (d) => { const [l, b] = nums(d.prompt); expect(first(d), d.prompt).toBe(2 * l! + b!); expect(b!).toBeLessThan(2 * l!); });
    each(34, (d) => { const [P, b] = nums(d.prompt); expect(first(d), d.prompt).toBe((P! - b!) / 2); expect(b!).toBeLessThan(P! - b!); });
    each(35, (d) => expect(first(d), d.prompt).toBe(180 - 2 * nums(d.prompt)[0]!));
    each(36, (d) => expect(first(d), d.prompt).toBe((180 - nums(d.prompt)[0]!) / 2));
  });
});

describe('G7 U15 — congruence, similarity', () => {
  it('u15-07', () => {
    each(37, (d) => {
      const want = d.prompt.includes('სამივე გვერდი') ? SSS : d.prompt.includes('ორი შესაბამისი გვერდი') ? SAS : d.prompt.includes('ერთი შესაბამისი გვერდი') ? ASA : NONE;
      expect(d.answer, d.prompt).toBe(want);
    });
    each(38, (d) => {
      const data = d.prompt.split('მოცემულია:')[1]!.split('. რომელი')[0]!;
      const sides = [...data.matchAll(/(?<![∠A-Z])([A-Z]{2}) = ([A-Z]{2})/g)].map((m) => m[1]!);
      const angles = [...data.matchAll(/∠([A-Z]) = ∠([A-Z])/g)].map((m) => m[1]!);
      expect(d.answer, d.prompt).toBe(congruenceOf(sides, angles));
    });
    each(39, (d) => {
      const first = d.prompt.split('. სამკუთხედ DEF')[0]!;
      const sides = (first.match(/[A-Z]{2} = /g) ?? []).length;
      expect(d.answer, d.prompt).toBe(sides === 3 ? SSS : sides === 2 ? SAS : ASA);
    });
    each(40, (d) => { const [a, b, c, a2, b2, c2] = nums(d.prompt); expect(d.answer, d.prompt).toBe(a === a2 && b === b2 && c === c2 ? 'ტოლია, გგგ ნიშნით' : 'არ არის ტოლი'); expect(isTriangle(a!, b!, c!)).toBe(true); });
    each(41, (d) => { const [a, b, a2, b2] = nums(d.prompt); expect(d.answer, d.prompt).toBe(a === a2 && b === b2 ? 'ტოლია, გკგ ნიშნით' : 'არ არის ტოლი'); });
    each(42, (d) => {
      const m = /([A-Z])([A-Z]) = ([A-Z]{2}), ([A-Z])([A-Z]) = ([A-Z]{2}) და (.*)\. რომელი/.exec(d.prompt)!;
      const common = [m[1], m[2]].find((ch) => [m[4], m[5]].includes(ch!))!;
      const last = m[7]!;
      const want = last.includes('∠') ? (/∠[A-Z]([A-Z])[A-Z]/.exec(last)![1] === common ? SAS : NONE) : SSS;
      expect(d.answer, d.prompt).toBe(want);
    });
  });

  it('u15-08', () => {
    each(43, (d) => {
      const want = /(^|\s)შესაბამისი კუთხეები ტოლია|ორი შესაბამისი კუთხე ტოლია/.test(d.prompt) ? SIM_AA : d.prompt.includes('სამივე შესაბამისი გვერდი') ? SIM_SSS : d.prompt.includes('გვერდი პროპორციულია') ? SIM_SAS : SIM_NONE;
      expect(d.answer, d.prompt).toBe(want);
    });
    each(44, (d) => {
      const [a, b, c, a2, b2, c2] = nums(d.prompt);
      const similar = a2! * b === b2! * a! && b2! * c! === c2! * b!;
      expect(d.answer, d.prompt).toBe(similar ? YES : NO);
    });
    each(45, (d) => { const [m, n, s] = nums(d.prompt); expect(first(d), d.prompt).toBe((n! * s!) / m!); expect(s! % m!).toBe(0); });
    each(46, (d) => { const [a, A, b] = nums(d.prompt); expect(first(d), d.prompt).toBe((b! * A!) / a!); expect(A! % a!).toBe(0); });
    each(47, (d) => {
      const [p, q, p2, q2] = nums(d.prompt);
      const ok = p! * q2! === q! * p2! && !d.prompt.includes('არ არის ტოლი');
      expect(d.answer, d.prompt).toBe(ok ? YES : NO);
    });
    each(48, (d) => { const [a, A, P] = nums(d.prompt); expect(first(d), d.prompt).toBe((P! * a!) / A!); expect((P! * a!) % A!).toBe(0); });
  });
});

describe('G7 U15 — Pythagoras, Thales, mixed problems, area', () => {
  it('u15-09', () => {
    for (const n of [49, 50, 54]) each(n, (d) => { const [a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe(isqrt(a! ** 2 + b! ** 2)); expect(first(d) ** 2).toBe(a! ** 2 + b! ** 2); });
    for (const n of [51, 52, 53]) each(n, (d) => { const [h, l] = nums(d.prompt); expect(first(d), d.prompt).toBe(isqrt(h! ** 2 - l! ** 2)); expect(first(d) ** 2).toBe(h! ** 2 - l! ** 2); });
  });

  it('u15-10', () => {
    const check = (n: number, f: (x: number[]) => number): void => each(n, (d) => { const x = nums(d.prompt); const r = f(x); expect(first(d), d.prompt).toBe(r); expect(Number.isInteger(r)).toBe(true); });
    check(55, ([ad, db, ae]) => (ae! * db!) / ad!);
    check(56, ([ad, ab, ac]) => (ad! * ac!) / ab!);
    check(57, ([ad, db, ec]) => (ad! * ec!) / db!);
    check(58, ([ad, db, ae]) => (ae! * db!) / ad!);
    check(59, ([ad, ab, de]) => (de! * ab!) / ad!);
    check(60, ([ad, ab, bc]) => (bc! * ad!) / ab!);
  });

  it('u15-11', () => {
    each(61, (d) => {
      const [b, c] = [...d.prompt.matchAll(/\(x \+ (\d+)\)°/g)].map((m) => Number(m[1]));
      const x = (180 - b! - c!) / 3;
      expect(Number.isInteger(x), d.prompt).toBe(true);
      expect(d.answer, d.prompt).toBe(triple(x, x + b!, x + c!));
    });
    each(62, (d) => { const [P, a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe(P! - a! - b!); expect(isTriangle(a!, b!, first(d))).toBe(true); });
    each(63, (d) => { const [a, b, c] = nums(d.prompt); expect(first(d), d.prompt).toBe(a! + b! + c!); expect(isTriangle(a!, b!, c!)).toBe(true); });
    each(64, (d) => {
      const [p, q] = coefs(d.prompt);
      const c = nums(d.prompt.split('მესამე')[1]!)[0]!;
      const x = (180 - c) / (p! + q!);
      expect(d.answer, d.prompt).toBe(`x = ${x}; ${triple(p! * x, q! * x, c)}`);
    });
    each(65, (d) => { const [P, l] = nums(d.prompt); expect(first(d), d.prompt).toBe(P! - 2 * l!); expect(first(d)).toBeLessThan(2 * l!); });
    each(66, (d) => { const [l, h] = nums(d.prompt); expect(first(d) ** 2, d.prompt).toBe(h! ** 2 - l! ** 2); });
  });

  it('u15-12', () => {
    for (const n of [67, 68, 70]) each(n, (d) => { const [a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe((a! * b!) / 2); expect((a! * b!) % 2).toBe(0); });
    for (const n of [69, 72]) each(n, (d) => { const [S, b] = nums(d.prompt); expect(first(d), d.prompt).toBe((2 * S!) / b!); expect((2 * S!) % b!).toBe(0); });
    each(71, (d) => { const a = nums(d.prompt)[0]!; const m = /^(\d*)√3/.exec(d.answer)!; expect(m[1] ? Number(m[1]) : 1, d.prompt).toBe((a / 2) ** 2); expect(a % 2).toBe(0); });
  });

  it('has the expected number of templates', () => {
    expect(G7_U15_TEMPLATES.length).toBe(72);
  });
});
