import { describe, expect, it } from 'vitest';
import { G6_U03_SUBTOPICS, G6_U03_TEMPLATES } from '../src/practice/templates/g6-u03-negative-rational';
import { eachDraw, standardSuite } from './support/g6-harness';
import { evalExpr, numbersIn, parseValue, qEq } from './support/g6-eval';

/**
 * Grade VI — Unit 3: negative and rational numbers.
 * Every expression is re-evaluated from its printed form with exact rational
 * arithmetic, so a sign or a fraction that is printed differently from how it
 * was computed fails here.
 */

const id = (n: number) => `g6-u03-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U03',
  topic: 'g6-negative-rational',
  subtopics: G6_U03_SUBTOPICS,
  templates: G6_U03_TEMPLATES,
  idPattern: /^g6-u03-q\d{2}$/,
});

const exprOf = (prompt: string): string => /: ([^:]+?)\.$/.exec(prompt)![1]!;
const expressions = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

describe('G6 U03 — the key is the value of the printed expression', () => {
  for (const n of expressions) {
    it(`${id(n)} agrees with its expression`, () => {
      eachDraw(id(n), (d) => {
        expect(qEq(parseValue(d.answer), evalExpr(exprOf(d.prompt))), `${d.prompt} → ${d.answer}`).toBe(true);
      });
    });
  }
  it('no other option is equal to the key (no unreduced twin)', () => {
    for (const n of expressions) {
      eachDraw(id(n), (d) => {
        const right = evalExpr(exprOf(d.prompt));
        const equal = d.options.filter((o) => qEq(parseValue(o), right));
        expect(equal, d.prompt).toHaveLength(1);
      });
    }
  });
  it('fraction keys are in lowest terms', () => {
    for (const n of [14, 15, 16, 17, 18, 20, 21, 22, 23]) {
      eachDraw(id(n), (d) => {
        const m = /^[\u2212]?(\d+)\/(\d+)$/.exec(d.answer);
        if (!m) return;
        const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
        expect(gcd(Number(m[1]), Number(m[2])), `${d.prompt} → ${d.answer}`).toBe(1);
      });
    }
  });
});

describe('G6 U03 — the temperature story', () => {
  it('q06 applies the rise and the fall to the start', () => {
    eachDraw(id(6), (d) => {
      const [start, up, down] = numbersIn(d.prompt.replace('°C', ''));
      expect(parseValue(d.answer.replace(' °C', '')).n / parseValue(d.answer.replace(' °C', '')).d, d.prompt).toBe(start! + up! - down!);
    });
  });
});

describe('G6 U03 — signs behave', () => {
  it('q10/q11 quotients undo their products', () => {
    for (const n of [10, 11]) {
      eachDraw(id(n), (d) => {
        const [a, b] = numbersIn(exprOf(d.prompt));
        expect(Number(d.answer.replace('\u2212', '-')) * b!, d.prompt).toBe(a);
      });
    }
  });
});
