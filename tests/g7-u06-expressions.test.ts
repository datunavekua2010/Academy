import { describe, expect, it } from 'vitest';
import { G7_U06_SUBTOPICS, G7_U06_TEMPLATES } from '../src/practice/templates/g7-u06-expressions';
import { eachDraw, standardSuite } from './support/g6-harness';

/**
 * Grade VII — Unit 6: expressions with variables. Every prompt and every key is
 * turned into a JavaScript expression and compared at several points, so an
 * expansion or a factorisation is checked as an identity, whatever its form.
 */

const id = (n: number) => `g7-u06-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U06',
  topic: 'g7-expressions',
  subtopics: G7_U06_SUBTOPICS,
  templates: G7_U06_TEMPLATES,
  idPattern: /^g7-u06-q\d{2}$/,
  grade: 7,
});

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const NAMES = ['x', 'y', 'z', 'a', 'b', 'm', 't', 'n'];

/** `3x² − 5x + 2`, `(x + 2)(x − 3)`, `2x(x + 4)` → a function of the variable values. */
const compile = (text: string): ((env: Record<string, number>) => number) => {
  let js = text.replace(/\s/g, '').replace(/\u2212/g, '-');
  js = js.replace(new RegExp(`[${SUP}]+`, 'g'), (m) => `^${[...m].map((c) => SUP.indexOf(c)).join('')}`);
  // implicit products: 3x, 2(…), x(…), )(…), )x
  js = js.replace(/(\d|[a-z]|\)|\d\^\d)(?=[a-z(])/g, '$1*');
  js = js.replace(/(\d+|[a-z])\^(\d+)/g, '($1**$2)');
  js = js.replace(/\)\^(\d+)/g, ')**$1');
  const fn = new Function(...NAMES, `return ${js};`) as (...args: number[]) => number;
  return (env) => fn(...NAMES.map((n) => env[n] ?? 0));
};
const POINTS: Array<Record<string, number>> = [-3, -2, 1, 2, 5, 7].map((k, i) => Object.fromEntries(NAMES.map((n, j) => [n, k + ((i + j) % 3)])));
const same = (a: string, b: string): boolean => {
  const fa = compile(a);
  const fb = compile(b);
  return POINTS.every((p) => fa(p) === fb(p));
};
const expr = (prompt: string): string => prompt.replace(/^[^:]*: /, '').replace(/\.$/, '');
const num = (text: string): number => Number(text.replace(/\s/g, '').replace('\u2212', '-'));

describe('G7 U06 — independent checks', () => {
  it('the compiler reads the notation', () => {
    expect(compile('3x² − 5x + 2')({ x: 2 })).toBe(4);
    expect(compile('(x + 2)(x − 3)')({ x: 5 })).toBe(14);
    expect(compile('−x² + 3')({ x: 2 })).toBe(-1);
    expect(compile('2x(x + 4)')({ x: 1 })).toBe(10);
  });

  it('values of expressions (u06-01)', () => {
    for (const n of [1, 2, 4, 3, 5, 6]) {
      eachDraw(id(n), (d) => {
        const [left, right] = d.prompt.replace(/\.$/, '').split(', თუ ') as [string, string];
        const text = left.replace(/^(იპოვე|გამოთვალე) /, '').replace(/^გამოსახულების /, '').replace(/ მნიშვნელობა$/, '').replace(/-ის$/, '');
        const m = [left, text, right];
        const env: Record<string, number> = {};
        for (const part of m[2]!.split(' და ')) {
          const [name, value] = part.split(' = ') as [string, string];
          env[name] = num(value);
        }
        expect(num(d.answer), d.prompt).toBe(compile(m[1]!)(env));
      });
    }
  });

  it('sums and differences of polynomials (u06-02)', () => {
    for (const n of [7, 8, 9, 10, 11, 12]) eachDraw(id(n), (d) => expect(same(d.answer, expr(d.prompt)), d.prompt).toBe(true));
  });

  it('products of polynomials (u06-03)', () => {
    for (const n of [13, 14, 15, 16, 17, 18]) eachDraw(id(n), (d) => expect(same(d.answer, expr(d.prompt)), d.prompt).toBe(true));
  });

  it('abbreviated multiplication (u06-04)', () => {
    for (const n of [19, 20, 21, 24]) eachDraw(id(n), (d) => expect(same(d.answer, expr(d.prompt)), d.prompt).toBe(true));
    eachDraw(id(22), (d) => expect(num(d.answer), d.prompt).toBe(Number(/(\d+)²/.exec(d.prompt)![1]) ** 2));
    eachDraw(id(23), (d) => {
      const [a, b] = /(\d+) · (\d+)/.exec(d.prompt)!.slice(1).map(Number) as [number, number];
      expect(num(d.answer), d.prompt).toBe(a * b);
      expect((a + b) % 2).toBe(0);
    });
  });

  it('sum and difference of cubes (u06-05)', () => {
    for (const n of [25, 26, 27, 28]) {
      eachDraw(id(n), (d) => {
        expect(same(d.answer, expr(d.prompt)), d.prompt).toBe(true);
        expect(d.answer, 'two factors').toMatch(/^\(.+\)\(.+\)$/);
      });
    }
    eachDraw(id(29), (d) => {
      const [a, b] = /(\d+)³ \+ (\d+)³/.exec(d.prompt)!.slice(1).map(Number) as [number, number];
      expect(num(d.answer), d.prompt).toBe(a ** 3 + b ** 3);
    });
    eachDraw(id(30), (d) => expect(same(d.answer, expr(d.prompt)), d.prompt).toBe(true));
  });

  it('cube of a sum and a difference (u06-06)', () => {
    for (const n of [31, 32, 33, 34]) eachDraw(id(n), (d) => expect(same(d.answer, expr(d.prompt)), d.prompt).toBe(true));
    eachDraw(id(35), (d) => expect(num(d.answer), d.prompt).toBe(Number(/(\d+)³ ფორმულის/.exec(d.prompt)![1]) ** 3));
    eachDraw(id(36), (d) => expect(num(d.answer), d.prompt).toBe(Number(/(\d+)³ ფორმულის/.exec(d.prompt)![1]) ** 3));
  });

  it('factoring (u06-07)', () => {
    for (const n of [37, 38, 39, 40, 41, 42]) {
      eachDraw(id(n), (d) => {
        expect(same(d.answer, expr(d.prompt)), d.prompt).toBe(true);
        expect(d.answer, 'the key is a product, not a sum').toMatch(/\(/);
        expect(d.answer).not.toMatch(/^[^(]*[+−][^(]*$/);
      });
    }
    // 39: x² − k² is a difference of squares, 40: a trinomial with two distinct factors
    eachDraw(id(40), (d) => expect(d.answer, d.prompt).toMatch(/^\(\S+ \+ \d+\)\(\S+ \+ \d+\)$/));
    eachDraw(id(42), (d) => expect(d.answer, d.prompt).toMatch(/^\(\S+ [+−] \d+\)²$/));
  });
});
