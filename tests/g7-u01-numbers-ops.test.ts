import { describe, expect, it } from 'vitest';
import { G7_U01_SUBTOPICS, G7_U01_TEMPLATES } from '../src/practice/templates/g7-u01-numbers-ops';
import { eachDraw, standardSuite } from './support/g6-harness';

/**
 * Grade VII — Unit 1: numbers and operations. Keys are recomputed from the numbers
 * printed in the prompt with independent arithmetic.
 */

const id = (n: number) => `g7-u01-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U01',
  topic: 'g7-numbers-ops',
  subtopics: G7_U01_SUBTOPICS,
  templates: G7_U01_TEMPLATES,
  idPattern: /^g7-u01-q\d{2}$/,
  grade: 7,
});

const num = (text: string): number => Number(text.replace(/[\u2212\u2009\u00a0\u202f ]/g, (c) => (c === '\u2212' ? '-' : '')).replace(',', '.').replace(/[^\d.-].*$/, ''));
const signed = (text: string): number[] => (text.match(/[\u2212]?\d+/g) ?? []).map((x) => Number(x.replace('\u2212', '-')));

describe('G7 U01 — independent checks', () => {
  it('modulus (q01) is non-negative and matches |a|', () => {
    eachDraw(id(1), (d) => {
      const [a] = signed(d.prompt);
      expect(num(d.answer), d.prompt).toBe(Math.abs(a!));
    });
  });

  it('remainder keys (u01-12) rebuild the dividend', () => {
    eachDraw(id(67), (d) => {
      const [a, b] = signed(d.prompt) as [number, number];
      expect(d.answer, d.prompt).toBe(`${Math.floor(a / b)}, ნაშთი ${a % b}`);
    });
    eachDraw(id(69), (d) => {
      const [a, b] = signed(d.prompt) as [number, number];
      expect(num(d.answer), d.prompt).toBe(a % b);
    });
    eachDraw(id(71), (d) => {
      const [dv, q] = signed(d.prompt) as [number, number];
      const n = num(d.answer);
      expect(Math.floor(n / dv), d.prompt).toBe(q);
      expect(n % dv, d.prompt).toBe(dv - 1);
    });
    eachDraw(id(72), (d) => {
      const [dv, q, r] = signed(d.prompt) as [number, number, number];
      expect(num(d.answer), d.prompt).toBe(dv * q + r);
    });
  });

  it('prime factorisations multiply back', () => {
    eachDraw(id(49), (d) => {
      const [n] = signed(d.prompt) as [number];
      const prod = d.answer.split(' × ').map(Number).reduce((x, y) => x * y, 1);
      expect(prod, d.prompt).toBe(n);
      for (const p of d.answer.split(' × ').map(Number)) {
        for (let k = 2; k * k <= p; k += 1) expect(p % k, d.prompt).not.toBe(0);
      }
    });
  });

  it('gcd and lcm keys (u01-09)', () => {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    eachDraw(id(51), (d) => {
      const [a, b] = signed(d.prompt) as [number, number];
      expect(num(d.answer), d.prompt).toBe(gcd(a, b));
    });
    eachDraw(id(52), (d) => {
      const [a, b] = signed(d.prompt) as [number, number];
      expect(num(d.answer), d.prompt).toBe((a * b) / gcd(a, b));
    });
  });

  it('square roots (u01-13)', () => {
    eachDraw(id(75), (d) => {
      const [n] = signed(d.prompt) as [number];
      expect(num(d.answer) ** 2, d.prompt).toBe(n);
    });
    eachDraw(id(76), (d) => {
      const [n] = signed(d.prompt) as [number];
      const [lo, hi] = signed(d.answer) as [number, number];
      expect(lo * lo, d.prompt).toBeLessThan(n);
      expect(hi * hi, d.prompt).toBeGreaterThan(n);
      expect(hi - lo).toBe(1);
    });
  });

  it('periodic decimals (u01-14) rebuild the printed fraction', () => {
    eachDraw(id(79), (d) => {
      const dg = Number(/0,\((\d)\)/.exec(d.prompt)![1]);
      const [n, m] = d.answer.split('/').map(Number) as [number, number];
      expect(n * 9, d.prompt).toBe(dg * m);
    });
    eachDraw(id(80), (d) => {
      const ab = Number(/0,\((\d+)\)/.exec(d.prompt)![1]);
      const [n, m] = d.answer.split('/').map(Number) as [number, number];
      expect(n * 99, d.prompt).toBe(ab * m);
    });
    eachDraw(id(83), (d) => {
      const [m] = signed(d.prompt) as [number];
      const digits = /\((\d+)\)/.exec(d.answer)![1]!;
      expect(Number(digits) * 11, d.prompt).toBe(m * 99);
    });
  });

  it('order of operations (u01-11)', () => {
    eachDraw(id(63), (d) => {
      const [a, b, c, dd, e] = signed(d.prompt.replace(/−/g, ' ')) as number[];
      expect(num(d.answer), d.prompt).toBe(a! - b! * c! + dd! / e!);
    });
    eachDraw(id(64), (d) => {
      const [a, b, c, x, y] = signed(d.prompt.replace(/−/g, ' ')) as number[];
      expect(num(d.answer), d.prompt).toBe((a! - b!) / c! + x! * y!);
    });
  });

  it('convenient multiplication (u01-10)', () => {
    eachDraw(id(55), (d) => {
      const [a, m, b] = signed(d.prompt) as [number, number, number];
      expect(num(d.answer.replace(/\s/g, '')), d.prompt).toBe(a * m * b);
    });
    eachDraw(id(56), (d) => {
      const [a, b] = signed(d.prompt) as [number, number];
      expect(num(d.answer.replace(/\s/g, '')), d.prompt).toBe(a * b);
    });
  });
});
