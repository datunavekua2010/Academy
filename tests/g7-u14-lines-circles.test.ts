import { describe, expect, it } from 'vitest';
import { G7_U14_SUBTOPICS, G7_U14_TEMPLATES } from '../src/practice/templates/g7-u14-lines-circles';
import { eachDraw, standardSuite, type Draw } from './support/g6-harness';

/** Grade VII — Unit 14: lines, angles and circles. Every key is recomputed from the numbers in the printed task. */

const id = (n: number) => `g7-u14-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U14',
  topic: 'g7-lines-circles',
  subtopics: G7_U14_SUBTOPICS,
  templates: G7_U14_TEMPLATES,
  idPattern: /^g7-u14-q\d{2}$/,
  grade: 7,
});

const each = (n: number, check: (d: Draw) => void): void => eachDraw(id(n), check);
const nums = (text: string): number[] => (text.replace(/(\d) (?=\d{3}(?!\d))/g, '$1').match(/\d+/g) ?? []).map(Number);
const MINUS = '\u2212';
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const first = (d: Draw): number => nums(d.answer)[0]!;
const radText = (degrees: number): string => {
  const k = gcd(degrees, 180);
  const n = degrees / k;
  const dd = 180 / k;
  const top = n === 1 ? 'π' : `${n}π`;
  return dd === 1 ? top : `${top}/${dd}`;
};
/** The degrees of every `nπ/d` radian measure in a text. */
const radsIn = (text: string): number[] => [...text.matchAll(/(\d*)π(?:\/(\d+))?/g)].map((m) => (180 * (m[1] ? Number(m[1]) : 1)) / (m[2] ? Number(m[2]) : 1));
/** A π answer's multiplier: `12π სმ` → 12, `π სმ` → 1, `1 369π სმ²` → 1369. */
const piOf = (answer: string): number => {
  const m = /^([\d ]*)π/.exec(answer)!;
  return m[1]!.trim() ? Number(m[1]!.replace(/ /g, '')) : 1;
};
const POSITIONS = ['ერთმანეთის გარეთ მდებარეობენ', 'ერთმანეთს გარედან ეხებიან', 'ორ წერტილში იკვეთებიან', 'ერთმანეთს შიგნიდან ეხებიან', 'ერთი მეორის შიგნით მდებარეობს'];
const kindOf = (r1: number, r2: number, dist: number): number => {
  const big = Math.max(r1, r2);
  const small = Math.min(r1, r2);
  return dist > big + small ? 0 : dist === big + small ? 1 : dist > big - small ? 2 : dist === big - small ? 3 : 4;
};
const COMMON = [0, 1, 2, 1, 0];
const isqrt = (n: number): number => Math.round(Math.sqrt(n));

describe('G7 U14 — angles', () => {
  it('u14-01: degrees and radians', () => {
    const NAMED: Array<[string, number]> = [['მართი კუთხის მესამედი', 30], ['მართი კუთხის ნახევარი', 45], ['ორი მართი კუთხის ჯამი', 180], ['სამი მართი კუთხის ჯამი', 270], ['ოთხი მართი კუთხის ჯამი', 360], ['გაშლილი კუთხის მესამედი', 60], ['გაშლილი კუთხის მეექვსედი', 30], ['მართი კუთხე', 90], ['გაშლილი კუთხე', 180], ['სრული კუთხე', 360]];
    each(1, (d) => { const hit = NAMED.find(([k]) => d.prompt.startsWith(k))!; expect(d.answer, d.prompt).toBe(`${hit[1]}°`); });
    each(2, (d) => expect(d.answer, d.prompt).toBe(radText(nums(d.prompt)[0]!)));
    each(3, (d) => expect(first(d), d.prompt).toBe(radsIn(d.prompt)[0]));
    each(4, (d) => expect(first(d), d.prompt).toBe(radsIn(d.prompt)[0]));
    each(5, (d) => { const [x, y] = radsIn(d.prompt); expect(first(d), d.prompt).toBe(x! + y!); });
    each(6, (d) => { const [a, b] = nums(d.prompt); expect(d.answer, d.prompt).toBe(radText(180 - a! - b!)); });
  });

  it('u14-02: adjacent and vertical angles', () => {
    each(7, (d) => expect(first(d), d.prompt).toBe(180 - nums(d.prompt)[0]!));
    each(8, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]));
    each(9, (d) => {
      const [p, q] = [...d.prompt.matchAll(/(\d*)x°/g)].map((m) => (m[1] ? Number(m[1]) : 1));
      const x = 180 / (p! + q!);
      expect(Number.isInteger(x), d.prompt).toBe(true);
      expect(d.answer, d.prompt).toBe(`${p! * x}° და ${q! * x}°`);
    });
    each(10, (d) => { const m = /\((\d*)x \+ (\d+)\)° და (\d+)°/.exec(d.prompt)!; expect((m[1] ? Number(m[1]) : 1) * first(d) + Number(m[2]), d.prompt).toBe(Number(m[3])); });
    each(11, (d) => {
      const m = /\((\d*)x \+ (\d+)\)° და \((\d*)x \+ (\d+)\)°/.exec(d.prompt)!;
      const [p, b, q, e] = [m[1] ? Number(m[1]) : 1, Number(m[2]), m[3] ? Number(m[3]) : 1, Number(m[4])];
      const x = (180 - b - e) / (p + q);
      expect(Number.isInteger(x), d.prompt).toBe(true);
      expect(d.answer, d.prompt).toBe(`${p * x + b}° და ${q * x + e}°`);
    });
    each(12, (d) => { const a = nums(d.prompt)[0]!; expect(d.answer, d.prompt).toBe(`${180 - a}°, ${a}° და ${180 - a}°`); });
  });

  it('u14-03: parallel lines and a transversal', () => {
    each(13, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]));
    each(14, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]));
    each(15, (d) => expect(first(d), d.prompt).toBe(180 - nums(d.prompt)[0]!));
    each(16, (d) => { const m = /\((\d*)x \+ (\d+)\)° და (\d+)°/.exec(d.prompt)!; expect((m[1] ? Number(m[1]) : 1) * first(d) + Number(m[2]), d.prompt).toBe(Number(m[3])); });
    each(17, (d) => {
      const m = /\((\d*)x \+ (\d+)\)° და \((\d*)x \+ (\d+)\)°/.exec(d.prompt)!;
      const x = first(d);
      expect((m[1] ? Number(m[1]) : 1) * x + Number(m[2]) + (m[3] ? Number(m[3]) : 1) * x + Number(m[4]), d.prompt).toBe(180);
    });
    each(18, (d) => {
      const a = nums(d.prompt)[0]!;
      const big = Math.max(a, 180 - a);
      expect(d.answer, d.prompt).toBe(`ოთხი კუთხე ${big}° და ოთხი კუთხე ${180 - big}°`);
    });
  });

  it('u14-04: criteria and properties of parallel lines', () => {
    each(19, (d) => {
      const [a, b] = nums(d.prompt);
      const cosided = d.prompt.includes('ცალმხრივი');
      expect(d.answer, d.prompt).toBe((cosided ? a! + b! === 180 : a === b) ? 'კი' : 'არა');
    });
    each(20, (d) => { const [a, b] = nums(d.prompt); expect(d.answer, d.prompt).toBe(a === b ? 'წრფეები პარალელურია' : 'წრფეები პარალელური არ არის'); });
    each(21, (d) => expect(d.answer, d.prompt).toBe(nums(d.prompt)[0] === 180 ? 'წრფეები პარალელურია' : 'წრფეები პარალელური არ არის'));
    each(22, (d) => {
      const m = new RegExp(`\\((\\d*)x ([+${MINUS}]) (\\d+)\\)° და (\\d+)°`).exec(d.prompt)!;
      const a = m[1] ? Number(m[1]) : 1;
      const b = (m[2] === '+' ? 1 : -1) * Number(m[3]);
      expect(a * first(d) + b, d.prompt).toBe(Number(m[4]));
    });
    each(23, (d) => expect(first(d), d.prompt).toBe(180 - nums(d.prompt)[0]!));
    each(24, (d) => { const a = nums(d.prompt)[0]!; expect(first(d), d.prompt).toBe(d.prompt.includes('ვერტიკალური') ? a : 180 - a); });
  });

  it('u14-05: central and inscribed angles', () => {
    each(25, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! / 2));
    each(26, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! * 2));
    each(27, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]));
    each(28, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! * 2));
    each(29, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]));
    const parts: Array<[string, number]> = [['ნახევარწრეს', 2], ['მესამედს', 3], ['მეოთხედს', 4], ['მეხუთედს', 5], ['მეექვსედს', 6], ['მეცხრედს', 9], ['მეათედს', 10], ['მეთორმეტედს', 12]];
    each(30, (d) => expect(first(d), d.prompt).toBe(180 / parts.find(([k]) => d.prompt.includes(k))![1]));
  });
});

describe('G7 U14 — circles', () => {
  it('u14-06: two circles', () => {
    for (const n of [31, 35]) each(n, (d) => { const [a, b, dist] = nums(d.prompt); expect(d.answer, d.prompt).toBe(POSITIONS[kindOf(a!, b!, dist!)]); });
    for (const n of [32, 36]) each(n, (d) => { const [a, b, dist] = nums(d.prompt); expect(first(d), d.prompt).toBe(COMMON[kindOf(a!, b!, dist!)]); });
    each(33, (d) => { const [a, b, dist] = nums(d.prompt); expect(d.answer, d.prompt).toBe(kindOf(a!, b!, dist!) === 2 ? 'კი' : 'არა'); });
    each(34, (d) => { const [a, b, dist] = nums(d.prompt); expect(d.answer, d.prompt).toBe(COMMON[kindOf(a!, b!, dist!)]! > 0 ? 'კი' : 'არა'); });
  });

  it('u14-06: every position occurs', () => {
    const seen = new Set<string>();
    for (const n of [31, 35]) each(n, (d) => seen.add(d.answer));
    expect(seen.size).toBe(5);
  });

  it('u14-07: radius, diameter and chord', () => {
    each(37, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! * 2));
    each(38, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! / 2));
    each(39, (d) => { const [r, len] = nums(d.prompt); expect(d.answer, d.prompt).toBe(len! <= 2 * r! ? 'კი' : 'არა'); });
    each(40, (d) => { const v = nums(d.prompt)[0]!; expect(first(d), d.prompt).toBe(d.prompt.includes('რადიუსია') ? 2 * v : v); });
    each(41, (d) => { const [dist, R] = nums(d.prompt); expect(first(d), d.prompt).toBe(2 * isqrt(R! ** 2 - dist! ** 2)); expect(isqrt(R! ** 2 - dist! ** 2) ** 2).toBe(R! ** 2 - dist! ** 2); });
    each(42, (d) => { const [R, dist] = nums(d.prompt); expect(first(d), d.prompt).toBe(2 * isqrt(R! ** 2 - dist! ** 2)); expect(isqrt(R! ** 2 - dist! ** 2) ** 2).toBe(R! ** 2 - dist! ** 2); });
  });

  it('u14-08: intersecting chords', () => {
    for (const n of [43, 44, 45, 46, 47, 48]) each(n, (d) => {
      const [p, q, c] = nums(d.prompt);
      expect(first(d), d.prompt).toBe((p! * q!) / c!);
      expect((p! * q!) % c!, d.prompt).toBe(0);
    });
  });

  it('u14-09: tangent and arc measures', () => {
    each(49, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]));
    each(50, (d) => expect(first(d), d.prompt).toBe(360 - nums(d.prompt)[0]!));
    each(51, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! / 2));
    each(52, (d) => expect(d.answer, d.prompt).toBe('90°'));
    each(53, (d) => expect(d.answer, d.prompt).toBe('90°'));
    each(54, (d) => expect(first(d), d.prompt).toBe(360 - nums(d.prompt)[0]!));
  });

  it('u14-10: tangents and secants', () => {
    each(55, (d) => { const [t, e] = nums(d.prompt); expect(first(d), d.prompt).toBe(t! ** 2 / e!); expect(t! ** 2 % e!).toBe(0); });
    each(57, (d) => { const [t, e] = nums(d.prompt); expect(first(d), d.prompt).toBe(t! ** 2 / e!); expect(t! ** 2 % e!).toBe(0); });
    for (const n of [56, 60]) each(n, (d) => { const [e1, f1, e2] = nums(d.prompt); expect(first(d), d.prompt).toBe((e1! * f1!) / e2!); expect(f1!, d.prompt).toBeGreaterThan(e1!); expect((e1! * f1!) % e2!).toBe(0); });
    each(58, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]));
    each(59, (d) => { const [e, i] = nums(d.prompt); expect(first(d) ** 2, d.prompt).toBe(e! * (e! + i!)); });
  });
});

describe('G7 U14 — circumference, area, sector, inscribed circles', () => {
  it('u14-11', () => {
    each(61, (d) => expect(piOf(d.answer), d.prompt).toBe(2 * nums(d.prompt)[0]!));
    each(62, (d) => expect(piOf(d.answer), d.prompt).toBe(nums(d.prompt)[0]! ** 2));
    each(63, (d) => expect(piOf(d.answer), d.prompt).toBe(nums(d.prompt)[0]));
    each(64, (d) => expect(piOf(d.answer), d.prompt).toBe(nums(d.prompt)[0]! ** 2));
    each(65, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! / 2));
    each(66, (d) => expect(first(d) ** 2, d.prompt).toBe(nums(d.prompt)[0]));
    each(61, (d) => expect(d.answer.endsWith('π სმ')).toBe(true));
    each(62, (d) => expect(d.answer.endsWith('π სმ²')).toBe(true));
  });

  it('u14-12', () => {
    for (const n of [67, 68, 69]) each(n, (d) => { const [r, a] = nums(d.prompt); expect(piOf(d.answer), d.prompt).toBe((r! ** 2 * a!) / 360); expect((r! ** 2 * a!) % 360).toBe(0); });
    for (const n of [70, 71]) each(n, (d) => { const [r, a] = nums(d.prompt); expect(piOf(d.answer), d.prompt).toBe((r! * a!) / 180); expect((r! * a!) % 180).toBe(0); expect(d.answer.endsWith('π სმ')).toBe(true); });
    each(72, (d) => { const [r, a] = nums(d.prompt); expect(piOf(d.answer), d.prompt).toBe(r! ** 2 - (r! ** 2 * a!) / 360); });
  });

  it('u14-13', () => {
    const rad = (a: string): number => { const m = /^(\d*)√3/.exec(a)!; return m[1] ? Number(m[1]) : 1; };
    each(73, (d) => expect(rad(d.answer), d.prompt).toBe(nums(d.prompt)[0]! / 6));
    each(74, (d) => expect(rad(d.answer), d.prompt).toBe(nums(d.prompt)[0]! / 6));
    each(75, (d) => expect(rad(d.answer), d.prompt).toBe(nums(d.prompt)[0]! / 3));
    each(76, (d) => { const [r, S] = nums(d.prompt); expect(first(d), d.prompt).toBe(S! / r!); expect(S! % r!).toBe(0); });
    each(77, (d) => {
      const [a, b] = nums(d.prompt);
      const c = isqrt(a! ** 2 + b! ** 2);
      expect(c ** 2).toBe(a! ** 2 + b! ** 2);
      expect(d.answer, d.prompt).toBe(`ჰიპოტენუზა ${c} სმ, რადიუსი ${c / 2} სმ`);
    });
    each(78, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! / 2));
  });

  it('keeps a stable number of templates', () => {
    expect(G7_U14_TEMPLATES.length).toBe(78);
  });
});
