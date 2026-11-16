import { describe, expect, it } from 'vitest';
import { G7_U08_SUBTOPICS, G7_U08_TEMPLATES } from '../src/practice/templates/g7-u08-proportion-percent';
import { eachDraw, standardSuite, type Draw } from './support/g6-harness';

/**
 * Grade VII — Unit 8: proportion and percent. The data of every task is read back
 * out of the printed prompt (grouped thousands merged) and the key is rebuilt
 * with plain arithmetic.
 */

const id = (n: number) => `g7-u08-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U08',
  topic: 'g7-proportion-percent',
  subtopics: G7_U08_SUBTOPICS,
  templates: G7_U08_TEMPLATES,
  idPattern: /^g7-u08-q\d{2}$/,
  grade: 7,
});

/** Whole numbers of a text, a grouped `1 000` read as one. */
const nums = (text: string): number[] => (text.replace(/(\d) (?=\d{3}(?!\d))/g, '$1').match(/\d+/g) ?? []).map(Number);
const answerNums = nums;
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
/** Run `check(promptNumbers, draw)` over the draws of one template. */
const each = (n: number, check: (p: number[], d: Draw) => void): void => eachDraw(id(n), (d) => check(nums(d.prompt), d));
const key = (d: Draw): number => answerNums(d.answer)[0]!;

describe('G7 U08 — independent checks', () => {
  it('proportions (u08-01)', () => {
    each(1, ([a, b, d], dr) => expect(key(dr), dr.prompt).toBe((a! * d!) / b!));
    each(2, ([a, b, c], dr) => expect(key(dr), dr.prompt).toBe((b! * c!) / a!));
    each(3, ([a, b, d], dr) => expect(key(dr), dr.prompt).toBe((a! * d!) / b!));
    each(4, ([a, b, c, d], dr) => expect(dr.answer, dr.prompt).toBe(a! * d! === b! * c! ? 'დიახ' : 'არა'));
    each(5, ([b, p, q], dr) => expect(key(dr), dr.prompt).toBe((b! * p!) / q!));
    each(6, ([a, c, d], dr) => expect(key(dr), dr.prompt).toBe((a! * d!) / c!));
    for (const n of [1, 2, 3, 5, 6]) each(n, (_p, dr) => expect(Number.isInteger(key(dr)), dr.prompt).toBe(true));
  });

  it('dividing in a ratio (u08-02)', () => {
    for (const n of [7, 10, 12]) {
      each(n, ([total, a, b], dr) => {
        const k = total! / (a! + b!);
        expect(Number.isInteger(k), dr.prompt).toBe(true);
        expect(answerNums(dr.answer), dr.prompt).toEqual([a! * k, b! * k]);
      });
    }
    each(8, ([total, a, b, c], dr) => {
      const k = total! / (a! + b! + c!);
      expect(answerNums(dr.answer), dr.prompt).toEqual([a! * k, b! * k, c! * k]);
    });
    each(9, ([a, b, sum], dr) => {
      const k = sum! / (a! + b!);
      expect(answerNums(dr.answer), dr.prompt).toEqual([a! * k, b! * k]);
    });
    each(11, ([a, b, c], dr) => {
      const k = 180 / (a! + b! + c!);
      expect(Number.isInteger(k), dr.prompt).toBe(true);
      expect(answerNums(dr.answer), dr.prompt).toEqual([a! * k, b! * k, c! * k]);
      expect(answerNums(dr.answer).reduce((x, y) => x + y, 0)).toBe(180);
    });
  });

  it('direct proportion (u08-03)', () => {
    for (const n of [13, 15, 16, 17]) each(n, ([m, c, q], dr) => expect(key(dr), dr.prompt).toBe((c! * q!) / m!));
    each(14, ([t, s, t2], dr) => expect(key(dr), dr.prompt).toBe((s! * t2!) / t!));
    each(18, ([x0, y0, x1], dr) => expect(key(dr), dr.prompt).toBe((y0! * x1!) / x0!));
  });

  it('inverse proportion (u08-04)', () => {
    for (const n of [19, 21, 22]) {
      each(n, ([w, d, m], dr) => {
        expect(key(dr), dr.prompt).toBe((w! * d!) / m!);
        expect(Number.isInteger(key(dr))).toBe(true);
      });
    }
    each(20, ([v1, h, v2], dr) => expect(key(dr), dr.prompt).toBe((v1! * h!) / v2!));
    each(23, ([s, , l2], dr) => expect(key(dr), dr.prompt).toBe(s! / l2!));
    each(24, ([x0, y0, x1], dr) => expect(key(dr), dr.prompt).toBe((x0! * y0!) / x1!));
  });

  it('the coefficient of proportionality (u08-05)', () => {
    each(25, ([x, y], dr) => expect(dr.answer, dr.prompt).toBe(`k = ${y! / x!}`));
    each(26, ([k, x], dr) => expect(key(dr), dr.prompt).toBe(k! * x!));
    each(27, ([x, y], dr) => expect(dr.answer, dr.prompt).toBe(`y = ${y! / x!}x`));
    each(28, ([x, y], dr) => expect(dr.answer, dr.prompt).toBe(`k = ${x! * y!}`));
    each(29, ([k, x], dr) => expect(key(dr), dr.prompt).toBe(k! / x!));
    each(30, ([x0, y0, x1], dr) => expect(key(dr), dr.prompt).toBe((y0! * x1!) / x0!));
  });

  it('percent as a number (u08-06)', () => {
    for (const n of [31, 36]) each(n, ([a, b], dr) => expect(key(dr), dr.prompt).toBe((a! * 100) / b!));
    eachDraw(id(32), (dr) => {
      const shown = /(\d,\d+)/.exec(dr.prompt)![1]!;
      expect(key(dr), dr.prompt).toBe(Math.round(Number(shown.replace(',', '.')) * 100));
    });
    each(33, ([p], dr) => {
      const g = gcd(p!, 100);
      expect(dr.answer, dr.prompt).toBe(`${p! / g}/${100 / g}`);
    });
    for (const n of [34, 35]) {
      each(n, ([a, b], dr) => {
        expect(key(dr), dr.prompt).toBe((a! * 100) / b!);
        expect(dr.answer.endsWith('%')).toBe(true);
      });
    }
  });

  it('discounts (u08-07)', () => {
    for (const n of [37, 40, 42]) each(n, ([price, p], dr) => expect(key(dr), dr.prompt).toBe((price! * (100 - p!)) / 100));
    each(38, ([price, p], dr) => expect(key(dr), dr.prompt).toBe((price! * p!) / 100));
    for (const n of [39, 41]) each(n, ([price, now], dr) => expect(key(dr), dr.prompt).toBe(((price! - now!) * 100) / price!));
    for (const n of [37, 38, 40, 42]) each(n, (_p, dr) => expect(Number.isInteger(key(dr)), dr.prompt).toBe(true));
  });

  it('taxes and fines (u08-08)', () => {
    each(43, ([price, p], dr) => expect(key(dr), dr.prompt).toBe((price! * p!) / 100));
    for (const n of [44, 45, 46, 47, 48]) each(n, ([price, p], dr) => expect(key(dr), dr.prompt).toBe(price! + (price! * p!) / 100));
    for (const n of [43, 44, 45, 46, 47, 48]) each(n, (_p, dr) => expect(Number.isInteger(key(dr)), dr.prompt).toBe(true));
  });

  it('simple interest (u08-09)', () => {
    each(49, ([s, r], dr) => expect(key(dr), dr.prompt).toBe((s! * r!) / 100));
    each(50, ([s, r, y], dr) => expect(key(dr), dr.prompt).toBe((s! * r! * y!) / 100));
    for (const n of [51, 53]) each(n, ([s, r, y], dr) => expect(key(dr), dr.prompt).toBe(s! + (s! * r! * y!) / 100));
    each(52, ([s, i], dr) => expect(key(dr), dr.prompt).toBe((i! * 100) / s!));
    each(54, ([s, r, m], dr) => {
      expect((s! * r! * m!) % 1200, dr.prompt).toBe(0);
      expect(key(dr), dr.prompt).toBe((s! * r! * m!) / 1200);
    });
  });
});
