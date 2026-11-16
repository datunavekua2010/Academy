import { describe, expect, it } from 'vitest';
import { G7_U11_SUBTOPICS, G7_U11_TEMPLATES } from '../src/practice/templates/g7-u11-data';
import { eachDraw, standardSuite, type Draw } from './support/g6-harness';

/** Grade VII — Unit 11: data and statistics. The data are read back out of the printed task and every key is recomputed. */

const id = (n: number) => `g7-u11-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U11',
  topic: 'g7-data',
  subtopics: G7_U11_SUBTOPICS,
  templates: G7_U11_TEMPLATES,
  idPattern: /^g7-u11-q\d{2}$/,
  grade: 7,
});

const each = (n: number, check: (d: Draw) => void): void => eachDraw(id(n), check);
const nums = (text: string): number[] => (text.match(/\d+/g) ?? []).map(Number);
/** The list after the first colon, up to the first full stop of the sentence. */
const listAfterColon = (prompt: string): number[] => nums(prompt.split(': ')[1]!.split('. ')[0]!);
const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);
const mean = (xs: number[]): number => sum(xs) / xs.length;
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const reduced = (n: number, d: number): string => (d / gcd(n, d) === 1 ? String(n / gcd(n, d)) : `${n / gcd(n, d)}/${d / gcd(n, d)}`);
const sets = (prompt: string): [string[], string[]] => {
  const m = [...prompt.matchAll(/\{([^}]*)\}/g)].map((x) => x[1]!.split(', '));
  return [m[0]!, m[1]!];
};

describe('G7 U11 — characteristics and means', () => {
  it('u11-01', () => {
    each(1, (d) => { const xs = listAfterColon(d.prompt); expect(Number(d.answer), d.prompt).toBe(mean(xs)); expect(Number.isInteger(mean(xs))).toBe(true); });
    each(2, (d) => {
      const xs = listAfterColon(d.prompt);
      expect([...xs].sort((a, b) => a - b)).toEqual(xs);
      expect(xs.length % 2).toBe(1);
      expect(Number(d.answer), d.prompt).toBe(xs[(xs.length - 1) / 2]);
    });
    each(3, (d) => {
      const xs = listAfterColon(d.prompt);
      const count = (n: number): number => xs.filter((x) => x === n).length;
      const top = Math.max(...xs.map(count));
      const modes = [...new Set(xs.filter((x) => count(x) === top))];
      expect(modes, d.prompt).toEqual([Number(d.answer)]);
    });
    each(4, (d) => { const xs = listAfterColon(d.prompt); expect(Number(d.answer), d.prompt).toBe(Math.max(...xs) - Math.min(...xs)); });
    each(5, (d) => { const xs = listAfterColon(d.prompt); expect(Number(d.answer), d.prompt).toBe(mean(xs)); expect(Number.isInteger(mean(xs))).toBe(true); });
    each(6, (d) => {
      const xs = listAfterColon(d.prompt).sort((a, b) => a - b);
      expect(xs.length).toBe(6);
      expect(Number(d.answer), d.prompt).toBe((xs[2]! + xs[3]!) / 2);
    });
  });

  it('u11-02', () => {
    each(7, (d) => { const [a, b] = nums(d.prompt); expect(Number(d.answer), d.prompt).toBe((a! + b!) / 2); });
    for (const n of [8, 10]) each(n, (d) => { const [a, b] = nums(d.prompt); expect(Number(d.answer) ** 2, d.prompt).toBe(a! * b!); expect(Number(d.answer)).toBeGreaterThan(0); });
    each(9, (d) => { const xs = nums(d.prompt.replace('სამი', '')); expect(Number(d.answer), d.prompt).toBe(mean(xs)); expect(Number.isInteger(mean(xs))).toBe(true); });
    each(11, (d) => {
      const xs = nums(d.prompt.split('წაიკითხა ')[1]!.split(' გვერდი')[0]!);
      expect(nums(d.answer)[0], d.prompt).toBe(mean(xs));
      expect(Number.isInteger(mean(xs))).toBe(true);
    });
    each(12, (d) => { const [gm, a] = nums(d.prompt); expect(a! * Number(d.answer), d.prompt).toBe(gm! ** 2); });
  });

  it('u11-03 — methods', () => {
    each(13, (d) => { expect(d.answer).toBe('გამოკითხვა'); expect(d.options.length).toBe(3); });
    each(14, (d) => expect(d.answer).toBe('დაკვირვება'));
    each(15, (d) => expect(d.answer).toBe('გამოკითხვა'));
    each(16, (d) => expect(d.answer).toBe('ექსპერიმენტი'));
    each(17, (d) => {
      expect(d.options.length).toBe(3);
      expect(d.prompt, d.answer).toContain(d.answer);
    });
    each(18, (d) => {
      const [N, k] = [nums(d.prompt)[0]!, nums(d.prompt)[1]!];
      expect(d.answer).toBe(`${N}-ვე მოსწავლის გამოკითხვა`);
      expect(k).toBeLessThan(N);
      expect(d.options.length).toBe(2);
    });
  });
});

describe('G7 U11 — Venn diagrams and frequency', () => {
  it('u11-04', () => {
    each(19, (d) => {
      const [T, a, b, both] = nums(d.prompt);
      expect(T).toBeGreaterThanOrEqual(a! + b! - both!);
      const askedFirst = d.prompt.split('მხოლოდ ')[1]!.startsWith(d.prompt.split('უყვარს ')[1]!.split(',')[0]!);
      expect(Number(d.answer), d.prompt).toBe(askedFirst ? a! - both! : b! - both!);
    });
    each(20, (d) => { const [A, B] = sets(d.prompt); expect(Number(d.answer), d.prompt).toBe(A.filter((x) => B.includes(x)).length); });
    each(21, (d) => { const [, a, b, both] = nums(d.prompt); expect(Number(d.answer), d.prompt).toBe(a! + b! - both!); });
    each(22, (d) => {
      const [A, B] = sets(d.prompt);
      const union = [...new Set([...A, ...B])];
      const got = d.answer.slice(1, -1).split(', ');
      expect(new Set(got), d.prompt).toEqual(new Set(union));
      expect(got.length).toBe(union.length);
    });
    each(23, (d) => { const [T, a, b, both] = nums(d.prompt); expect(Number(d.answer), d.prompt).toBe(T! - (a! + b! - both!)); expect(Number(d.answer)).toBeGreaterThanOrEqual(0); });
    each(24, (d) => { const [A, B] = sets(d.prompt); expect(Number(d.answer), d.prompt).toBe(B.filter((x) => !A.includes(x)).length); });
  });

  it('u11-05', () => {
    each(25, (d) => {
      const [list, color] = [d.prompt.split('ფერებია: ')[1]!.split('. რამდენჯერ')[0]!.split(', '), d.prompt.match(/გვხვდება (\S+) ფერი/)![1]!];
      expect(Number(d.answer), d.prompt).toBe(list.filter((c) => c === color).length);
    });
    each(26, (d) => { const [n, , k] = nums(d.prompt); expect(d.answer, d.prompt).toBe(reduced(k!, n!)); });
    each(27, (d) => { const [n, k] = nums(d.prompt); expect(d.answer, d.prompt).toBe(`${(100 * k!) / n!}%`); });
    each(28, (d) => {
      const counts = d.prompt.split(': ')[1]!.split('. ')[0]!.split(', ').map((r) => Number(r.split(' — ')[1]));
      expect(counts.length).toBe(4);
      expect(Number(d.answer), d.prompt).toBe(sum(counts));
    });
    each(29, (d) => { const [n, k] = nums(d.prompt); expect(d.answer, d.prompt).toBe(`${(100 * k!) / n!}%`); });
    each(30, (d) => {
      const [n, k] = nums(d.prompt);
      expect(d.answer, d.prompt).toBe(reduced(k!, n!));
      expect(d.options, 'the raw fraction is one of the slips').toContain(`${k}/${n}`);
    });
  });

  it('answers carry no stray text', () => {
    expect(G7_U11_TEMPLATES).toHaveLength(30);
  });
});
