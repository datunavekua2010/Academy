import { describe, expect, it } from 'vitest';
import { G6_U13_SUBTOPICS, G6_U13_TEMPLATES } from '../src/practice/templates/g6-u13-powers-roots';
import { eachDraw, standardSuite } from './support/g6-harness';

/**
 * Grade VI — Unit 13: powers and roots. Each prompt is read back — `6⁴`,
 * `√529`, `∛216` — and the power or root is recomputed with plain numbers.
 */

const id = (n: number) => `g6-u13-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U13',
  topic: 'g6-powers-roots',
  subtopics: G6_U13_SUBTOPICS,
  templates: G6_U13_TEMPLATES,
  idPattern: /^g6-u13-q\d{2}$/,
});

const ungroup = (text: string): string => text.replace(/(\d)[\u2009\u00a0\u202f ](?=\d{3}(?!\d))/g, '$1');
const SUP: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
const supToNumber = (s: string): number => Number([...s].map((c) => SUP[c]).join(''));
/** `3² + 4²` → 25. */
const powersIn = (text: string): number[] => [...ungroup(text).matchAll(/(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g)].map((m) => Number(m[1]) ** supToNumber(m[2]!));
const num = (text: string): number => Number(ungroup(text).replace(/\D.*$/, ''));
const nums = (text: string): number[] => (ungroup(text).match(/\d+/g) ?? []).map(Number);

describe('G6 U13 — powers', () => {
  it('a power, and the sum of two', () => {
    for (const n of [1, 2, 13, 14]) eachDraw(id(n), (d) => expect(num(d.answer), d.prompt).toBe(powersIn(d.prompt)[0]));
    for (const n of [5, 17]) eachDraw(id(n), (d) => expect(num(d.answer), d.prompt).toBe(powersIn(d.prompt).reduce((a, b) => a + b, 0)));
    eachDraw(id(15), (d) => expect(num(d.answer), d.prompt).toBe(nums(d.prompt)[0]! ** 2));
    eachDraw(id(16), (d) => expect(num(d.answer), d.prompt).toBe(nums(d.prompt)[0]! ** 3));
  });
  it('squares and cubes in geometry', () => {
    eachDraw(id(3), (d) => {
      expect(d.answer).toMatch(/ სმ²$/);
      expect(num(d.answer), d.prompt).toBe(nums(d.prompt)[0]! ** 2);
    });
    eachDraw(id(4), (d) => {
      const s = nums(d.prompt)[0]!;
      expect(num(d.answer) ** 2, d.prompt).toBe(s);
      expect(d.answer).toMatch(/ სმ$/);
    });
    eachDraw(id(18), (d) => {
      expect(d.answer).toMatch(/ სმ³$/);
      expect(num(d.answer), d.prompt).toBe(nums(d.prompt)[0]! ** 3);
    });
    eachDraw(id(6), (d) => {
      const a = nums(d.prompt)[0]!;
      const k = d.prompt.includes('გააორმაგებენ') ? 2 : 3;
      expect(d.answer, d.prompt).toBe(`${a * a} მ²; ${k * k}-ჯერ`);
    });
  });
});

describe('G6 U13 — roots', () => {
  it('square roots of perfect squares', () => {
    for (const n of [7, 8, 19, 21]) {
      eachDraw(id(n), (d) => {
        const radicand = nums(d.prompt)[0]!;
        expect(num(d.answer) ** 2, d.prompt).toBe(radicand);
      });
    }
    eachDraw(id(9), (d) => expect(num(d.answer) ** 2, d.prompt).toBe(nums(d.prompt.replace('x²', ''))[0]));
    eachDraw(id(12), (d) => expect(num(d.answer) ** 2, d.prompt).toBe(nums(d.prompt)[0]));
  });
  it('cube roots of perfect cubes', () => {
    for (const n of [20, 22]) eachDraw(id(n), (d) => expect(num(d.answer) ** 3, d.prompt).toBe(nums(d.prompt)[0]));
  });
  it('a root divided', () => {
    for (const n of [10, 11]) {
      eachDraw(id(n), (d) => {
        const [r, k] = nums(d.prompt) as [number, number];
        expect(num(d.answer), d.prompt).toBe(Math.sqrt(r) / k);
        expect(Number.isInteger(num(d.answer))).toBe(true);
      });
    }
  });
  it('the unknown under a root', () => {
    eachDraw(id(23), (d) => expect(num(d.answer), d.prompt).toBe(nums(d.prompt)[0]! ** 2));
    eachDraw(id(24), (d) => expect(num(d.answer), d.prompt).toBe(nums(d.prompt)[0]! ** 3));
  });
});
