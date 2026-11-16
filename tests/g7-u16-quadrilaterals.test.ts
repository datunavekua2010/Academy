import { describe, expect, it } from 'vitest';
import { G7_U16_SUBTOPICS, G7_U16_TEMPLATES } from '../src/practice/templates/g7-u16-quadrilaterals';
import { eachDraw, standardSuite, type Draw } from './support/g6-harness';

/** Grade VII — Unit 16: quadrilaterals. Every key is recomputed from the numbers printed in the task. */

const id = (n: number) => `g7-u16-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U16',
  topic: 'g7-quadrilaterals',
  subtopics: G7_U16_SUBTOPICS,
  templates: G7_U16_TEMPLATES,
  idPattern: /^g7-u16-q\d{2}$/,
  grade: 7,
});

const each = (n: number, check: (d: Draw) => void): void => eachDraw(id(n), check);
const nums = (text: string): number[] => (text.replace(/(\d) (?=\d{3}(?!\d))/g, '$1').match(/\d+/g) ?? []).map(Number);
const first = (d: Draw): number => nums(d.answer)[0]!;
const YES = 'კი';
const NO = 'არა';

describe('G7 U16 — classification, parallelogram', () => {
  it('u16-01', () => {
    each(1, (d) => {
      const n = [['სამკუთხედს', 3], ['ოთხკუთხედს', 4], ['ხუთკუთხედს', 5], ['ექვსკუთხედს', 6], ['შვიდკუთხედს', 7], ['რვაკუთხედს', 8]].find(([w]) => d.prompt.includes(w as string))![1] as number;
      const want = d.prompt.includes('დიაგონალი') ? (n * (n - 3)) / 2 : n;
      expect(first(d), d.prompt).toBe(want);
    });
    each(2, (d) => { const [l, w] = nums(d.prompt); expect(first(d), d.prompt).toBe(2 * (l! + w!)); expect(l!).toBeGreaterThan(w!); });
    each(3, (d) => expect(first(d), d.prompt).toBe(4 * nums(d.prompt)[0]!));
    each(4, (d) => { const [a, b, c] = nums(d.prompt); expect(first(d), d.prompt).toBe(360 - a! - b! - c!); expect(first(d)).toBeGreaterThan(0); });
    each(5, (d) => {
      const p = d.prompt;
      const want = /მხოლოდ ერთი წყვილი|ორი გვერდი პარალელური/.test(p) ? 'ტრაპეცია'
        : /მართი არ არის და მეზობელი|მართი არ არის და გვერდები ერთნაირი/.test(p) ? 'პარალელოგრამი'
        : /ოთხივე კუთხე მართია|ყველა კუთხე მართი აქვს/.test(p) ? 'მართკუთხედი'
        : /ტოლი და ოთხივე კუთხე მართი|ყველა გვერდი ტოლია და ყველა კუთხე მართია/.test(p) ? 'კვადრატი' : 'რომბი';
      expect(d.answer, p).toBe(want);
    });
    each(6, (d) => {
      const a = nums(d.prompt)[0]!;
      expect(a).not.toBe(90);
      expect(d.answer, d.prompt).toBe(`${180 - a}°, ${a}° და ${180 - a}°`);
    });
  });

  it('u16-02', () => {
    each(7, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]!));
    each(8, (d) => expect(first(d), d.prompt).toBe(180 - nums(d.prompt)[0]!));
    each(9, (d) => {
      const m = /\((\d+)x \+ (\d+)\)° და (\d+)°/.exec(d.prompt)!;
      expect(Number(m[1]) * first(d) + Number(m[2]), d.prompt).toBe(Number(m[3]));
    });
    each(10, (d) => { const [a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe(2 * (a! + b!)); });
    each(11, (d) => expect(first(d), d.prompt).toBe(2 * nums(d.prompt.replace(/[A-Z]+/g, ''))[0]!));
    each(12, (d) => {
      const suff = ['დიაგონალები ერთმანეთს შუაზე ყოფს', 'ორივე წყვილი მოპირდაპირე გვერდი ტოლია', 'ორი მოპირდაპირე გვერდი პარალელური და ტოლია', 'ორივე წყვილი მოპირდაპირე კუთხე ტოლია'];
      expect(d.answer, d.prompt).toBe(suff.some((s) => d.prompt.includes(s)) ? YES : NO);
    });
  });

  it('u16-02: both yes and no occur', () => {
    const seen = new Set<string>();
    each(12, (d) => seen.add(d.answer));
    expect(seen).toEqual(new Set([YES, NO]));
  });
});

describe('G7 U16 — trapezoid, mixed problems', () => {
  it('u16-03', () => {
    each(13, (d) => { const [a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe((a! + b!) / 2); expect(a).not.toBe(b); });
    each(14, (d) => { const [a, b, h] = nums(d.prompt); expect(first(d), d.prompt).toBe(((a! + b!) * h!) / 2); });
    each(15, (d) => {
      const a = nums(d.prompt)[0]!;
      expect(first(d), d.prompt).toBe(d.prompt.includes('მეორე ფუძესთან') ? 180 - a : a);
    });
    each(16, (d) => { const [a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe((a! + b!) / 2); });
    each(17, (d) => { const [m, a] = nums(d.prompt); expect(first(d), d.prompt).toBe(2 * m! - a!); expect(first(d)).toBeGreaterThan(0); });
    each(18, (d) => { const [a, b, h] = nums(d.prompt); expect(first(d), d.prompt).toBe(((a! + b!) * h!) / 2); });
  });

  it('u16-04', () => {
    each(19, (d) => { const [a, b, c] = nums(d.prompt); expect(first(d), d.prompt).toBe(360 - a! - b! - c!); });
    each(20, (d) => { const [l, w] = nums(d.prompt); expect(first(d), d.prompt).toBe(2 * (l! + w!)); });
    each(21, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! / 4));
    each(22, (d) => { const [P, a] = nums(d.prompt); expect(first(d), d.prompt).toBe(P! / 2 - a!); expect(first(d)).not.toBe(a); });
    each(23, (d) => expect(first(d), d.prompt).toBe(nums(d.prompt)[0]! / 4));
    each(24, (d) => {
      const m = /x°, \(x \+ (\d+)\)°, (\d+)x° და (\d+)°/.exec(d.prompt)!;
      expect(first(d) + first(d) + Number(m[1]) + Number(m[2]) * first(d) + Number(m[3]), d.prompt).toBe(360);
    });
  });
});

describe('G7 U16 — areas', () => {
  it('u16-05', () => {
    for (const n of [25, 26, 27]) each(n, (d) => { const [b, h] = nums(d.prompt); expect(first(d), d.prompt).toBe(b! * h!); });
    for (const n of [28, 29, 30]) each(n, (d) => { const [S, k] = nums(d.prompt); expect(first(d), d.prompt).toBe(S! / k!); expect(S! % k!).toBe(0); });
  });

  it('u16-06', () => {
    for (const n of [31, 32, 33, 34]) each(n, (d) => { const [a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe((a! * b!) / 2); expect(a).not.toBe(b); });
    for (const n of [35, 36]) each(n, (d) => { const [S, a] = nums(d.prompt); expect(first(d), d.prompt).toBe((2 * S!) / a!); expect((2 * S!) % a!).toBe(0); });
  });

  it('u16-07', () => {
    for (const n of [37, 38, 39]) each(n, (d) => { const [a, b, h] = nums(d.prompt); expect(first(d), d.prompt).toBe(((a! + b!) * h!) / 2); expect(a).not.toBe(b); });
    for (const n of [40, 41]) each(n, (d) => { const [S, a, b] = nums(d.prompt); expect(first(d), d.prompt).toBe((2 * S!) / (a! + b!)); expect((2 * S!) % (a! + b!)).toBe(0); });
    each(42, (d) => { const [S, h, a] = nums(d.prompt); expect(first(d), d.prompt).toBe((2 * S!) / h! - a!); expect(first(d)).not.toBe(a); expect((2 * S!) % h!).toBe(0); });
  });

  it('has the expected number of templates', () => {
    expect(G7_U16_TEMPLATES.length).toBe(42);
  });
});
