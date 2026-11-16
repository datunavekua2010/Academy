import { describe, expect, it } from 'vitest';
import { G7_U09_SUBTOPICS, G7_U09_TEMPLATES } from '../src/practice/templates/g7-u09-multistep';
import { eachDraw, standardSuite, type Draw } from './support/g6-harness';

/** Grade VII — Unit 9: multi-step problems. Data is read back from the prompt and the key rebuilt. */

const id = (n: number) => `g7-u09-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U09',
  topic: 'g7-multistep',
  subtopics: G7_U09_SUBTOPICS,
  templates: G7_U09_TEMPLATES,
  idPattern: /^g7-u09-q\d{2}$/,
  grade: 7,
});

const nums = (text: string): number[] => (text.replace(/(\d) (?=\d{3}(?!\d))/g, '$1').match(/\d+/g) ?? []).map(Number);
const each = (n: number, check: (p: number[], d: Draw) => void): void => eachDraw(id(n), (d) => check(nums(d.prompt), d));
const key = (d: Draw): number => nums(d.answer)[0]!;

describe('G7 U09 — independent checks', () => {
  it('proportion (u09-01)', () => {
    each(1, ([m, c, n], d) => expect(key(d), d.prompt).toBe((c! * n!) / m!));
    each(2, ([w, days, n], d) => expect(key(d), d.prompt).toBe((w! * days!) / n!));
    each(3, ([a, k, b], d) => expect(key(d), d.prompt).toBe((k! * b!) / a!));
    each(4, ([a, b, s], d) => {
      const k = s! / (a! + b!);
      expect(Number.isInteger(k), d.prompt).toBe(true);
      expect(nums(d.answer), d.prompt).toEqual([a! * k, b! * k]);
    });
    each(5, ([m, c, n], d) => expect(key(d), d.prompt).toBe((n! * m!) / c!));
    each(6, ([m, c, n], d) => expect(key(d), d.prompt).toBe((c! * n!) / m!));
  });

  it('distance, speed and time (u09-02)', () => {
    each(7, ([t, s], d) => expect(key(d), d.prompt).toBe(s! / t!));
    each(8, ([v, t], d) => expect(key(d), d.prompt).toBe(v! * t!));
    each(9, ([s, t, s2], d) => expect(key(d), d.prompt).toBe((s2! * t!) / s!));
    each(10, ([s, v], d) => expect(key(d), d.prompt).toBe(s! / v!));
    each(11, ([v, h, m], d) => {
      expect(key(d), d.prompt).toBe((v! * (60 * h! + m!)) / 60);
      expect(Number.isInteger(key(d))).toBe(true);
    });
    each(12, ([t1, s1, t2, s2], d) => {
      expect(key(d), d.prompt).toBe((s1! + s2!) / (t1! + t2!));
      expect(Number.isInteger(key(d))).toBe(true);
    });
  });

  it('map scale (u09-03)', () => {
    // prompt of q13..q18 holds the scale as `1 : N`
    each(13, ([, n, cm], d) => expect(key(d), d.prompt).toBe((cm! * n!) / 100000));
    each(14, ([km, , n], d) => expect(key(d), d.prompt).toBe((km! * 100000) / n!));
    each(15, ([cm, km], d) => {
      expect(d.answer).toBe(`1 : ${(km! * 100000) / cm!}`.replace(/(\d)(?=(\d{3})+$)/g, '$1 '));
    });
    each(16, ([, n, cm], d) => expect(key(d), d.prompt).toBe((cm! * n!) / 100));
    each(17, ([, n, cm], d) => expect(key(d), d.prompt).toBe((cm! * n!) / 100));
    each(18, ([km, , n], d) => expect(key(d), d.prompt).toBe((km! * 100000) / n!));
  });

  it('equations and systems (u09-04)', () => {
    each(19, ([a, b, c, p], d) => expect(key(d), d.prompt).toBe((c! - a! * p!) / b!));
    each(20, ([s, diff], d) => expect(nums(d.answer), d.prompt).toEqual([(s! + diff!) / 2, (s! - diff!) / 2]));
    each(21, ([P, diff], d) => {
      const w = (P! / 2 - diff!) / 2;
      expect(nums(d.answer), d.prompt).toEqual([w + diff!, w]);
    });
    each(22, ([pk, pa, n, s], d) => {
      const adults = (s! - n! * pk!) / (pa! - pk!);
      expect(Number.isInteger(adults), d.prompt).toBe(true);
      expect(nums(d.answer), d.prompt).toEqual([n! - adults, adults]);
    });
    each(23, ([a, b], d) => expect(key(d), d.prompt).toBe(b! - a!));
    each(24, ([s, diff], d) => expect(nums(d.answer), d.prompt).toEqual([(s! + diff!) / 2, (s! - diff!) / 2]));
  });
});
