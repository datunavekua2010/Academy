import { describe, expect, it } from 'vitest';
import { G6_U02_SUBTOPICS, G6_U02_TEMPLATES } from '../src/practice/templates/g6-u02-whole-ops';
import { eachDraw, standardSuite } from './support/g6-harness';
import { evalExpr, numbersIn, parseDecimal, qEq, q, qNum } from './support/g6-eval';

/**
 * Grade VI — Unit 2: operations on whole numbers.
 *
 * Each re-derivation reads the **printed** prompt and recomputes the key on
 * its own, never through the template's formula.
 */

const TOPIC = 'g6-whole-ops';
const id = (n: number) => `g6-u02-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U02',
  topic: TOPIC,
  subtopics: G6_U02_SUBTOPICS,
  templates: G6_U02_TEMPLATES,
  idPattern: /^g6-u02-q\d{2}$/,
});

const asNumber = (text: string): number => qNum(parseDecimal(text));
/** The expression that follows the last colon of a prompt. */
const exprOf = (prompt: string): string => /: ([^:]+?)\.$/.exec(prompt)![1]!;
const nums = (prompt: string): number[] => numbersIn(prompt);
const roundTo = (n: number, step: number): number => Math.round(n / step) * step;
const restOf = (answer: string): [number, number] => {
  const m = /^([\d\s]+), ნაშთი (\d+)$/.exec(answer)!;
  return [asNumber(m[1]!), Number(m[2])];
};

describe('G6 U02.1–U02.8 — an expression computes to its key', () => {
  const plain = [1, 2, 3, 4, 7, 8, 9, 10, 13, 14, 15, 18, 19, 20, 24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 35, 37, 38, 39, 40, 43, 44, 45, 48];
  for (const n of plain) {
    it(`${id(n)} agrees with the printed expression`, () => {
      eachDraw(id(n), (d) => {
        expect(asNumber(d.answer), d.prompt).toBe(qNum(evalExpr(exprOf(d.prompt))));
      });
    });
  }
  it('the printed expression is exact (no remainder in a quotient)', () => {
    for (const n of [7, 8, 9, 10, 19, 20, 31, 32, 33, 34, 35, 37, 38, 39, 40]) {
      eachDraw(id(n), (d) => {
        const value = evalExpr(exprOf(d.prompt));
        expect(value.d, d.prompt).toBe(1);
      });
    }
  });
});

describe('G6 U02 — word problems', () => {
  const products: Record<number, number> = { 5: 2, 6: 2, 30: 2, 46: 2, 47: 3, 55: 2, 57: 2 };
  for (const [n, k] of Object.entries(products)) {
    it(`${id(Number(n))} multiplies the ${k} printed quantities`, () => {
      eachDraw(id(Number(n)), (d) => {
        const given = nums(d.prompt);
        expect(given.length, d.prompt).toBe(k);
        expect(asNumber(d.answer), d.prompt).toBe(given.reduce((a, b) => a * b, 1));
      });
    });
  }
  for (const n of [11, 12, 36, 41, 42, 56, 58]) {
    it(`${id(n)} shares the first quantity among the second`, () => {
      eachDraw(id(n), (d) => {
        const [total, parts] = nums(d.prompt);
        expect(total! % parts!, d.prompt).toBe(0);
        expect(asNumber(d.answer), d.prompt).toBe(total! / parts!);
      });
    });
  }
  for (const n of [59, 60]) {
    it(`${id(n)} multiplies two quantities and shares the product`, () => {
      eachDraw(id(n), (d) => {
        const [a, b, c] = nums(d.prompt);
        expect((a! * b!) % c!, d.prompt).toBe(0);
        expect(asNumber(d.answer), d.prompt).toBe((a! * b!) / c!);
      });
    });
  }
});

describe('G6 U02.3–U02.4 — properties', () => {
  it('q16 fills the missing addend of a split factor', () => {
    eachDraw(id(16), (d) => {
      const [a, b, a2, t] = nums(d.prompt);
      expect(a2).toBe(a);
      expect(a! * b!).toBe(a! * t! + a! * asNumber(d.answer));
    });
  });
  it('q17 fills the missing part of a split factor', () => {
    eachDraw(id(17), (d) => {
      const [a, b, a2, k] = nums(d.prompt);
      expect(a2).toBe(a);
      expect(a! * b!).toBe(a! * (asNumber(d.answer) + k!));
    });
  });
  it('q21 judges the printed equality', () => {
    eachDraw(id(21), (d) => {
      const [left, right] = exprOf(d.prompt).split(' = ');
      const same = qEq(evalExpr(left!), evalExpr(right!));
      expect(d.answer, d.prompt).toBe(same ? 'სწორია' : 'არასწორია');
    });
  });
  it('q22 finds the divisor', () => {
    eachDraw(id(22), (d) => {
      const [a, quotient] = nums(d.prompt);
      expect(a! / asNumber(d.answer), d.prompt).toBe(quotient);
    });
  });
  it('q23 finds the second divisor', () => {
    eachDraw(id(23), (d) => {
      const [a, b, c] = nums(d.prompt);
      expect(a! / (b! * c!), d.prompt).toBe(a! / b! / asNumber(d.answer));
    });
  });
});

describe('G6 U02.9 — estimates', () => {
  it('q49 rounds both factors to tens', () => {
    eachDraw(id(49), (d) => {
      const [a, b] = nums(d.prompt);
      expect(asNumber(d.answer), d.prompt).toBe(roundTo(a!, 10) * roundTo(b!, 10));
    });
  });
  it('q50 rounds the dividend to hundreds and the divisor to tens', () => {
    eachDraw(id(50), (d) => {
      const [a, b] = nums(d.prompt);
      expect(asNumber(d.answer), d.prompt).toBe(roundTo(a!, 100) / roundTo(b!, 10));
    });
  });
  it('q51 rounds to hundreds and tens', () => {
    eachDraw(id(51), (d) => {
      const [a, b] = nums(d.prompt);
      expect(asNumber(d.answer), d.prompt).toBe(roundTo(a!, 100) * roundTo(b!, 10));
    });
  });
  it('q52 rounds to thousands and tens', () => {
    eachDraw(id(52), (d) => {
      const [a, b] = nums(d.prompt);
      expect(asNumber(d.answer), d.prompt).toBe(roundTo(a!, 1000) / roundTo(b!, 10));
    });
  });
  it('q53 uses the rounded values named in the prompt, and they are the true roundings', () => {
    eachDraw(id(53), (d) => {
      const [a, b, , ra, , rb] = nums(d.prompt);
      expect(ra).toBe(roundTo(a!, 1000));
      expect(rb).toBe(roundTo(b!, 10));
      expect(asNumber(d.answer), d.prompt).toBe(ra! * rb!);
    });
  });
  it('q54 rounds to thousands and tens', () => {
    eachDraw(id(54), (d) => {
      const [a, b] = nums(d.prompt);
      expect(asNumber(d.answer), d.prompt).toBe(roundTo(a!, 1000) * roundTo(b!, 10));
    });
  });
});

describe('G6 U02.11–U02.12 — remainders and built expressions', () => {
  for (const n of [61, 62, 63, 64, 65, 66]) {
    it(`${id(n)} divides with a real remainder`, () => {
      eachDraw(id(n), (d) => {
        const [a, b] = nums(d.prompt);
        const [quotient, rest] = restOf(d.answer);
        expect(quotient * b! + rest, d.prompt).toBe(a);
        expect(rest, d.prompt).toBeGreaterThan(0);
        expect(rest, d.prompt).toBeLessThan(b!);
      });
    });
  }
  it('q67 adds a product', () => {
    eachDraw(id(67), (d) => {
      const [a, b, c] = nums(d.prompt);
      expect(asNumber(d.answer), d.prompt).toBe(a! + b! * c!);
    });
  });
  it('q68 divides, then subtracts', () => {
    eachDraw(id(68), (d) => {
      const [a, b, c] = nums(d.prompt);
      expect(asNumber(d.answer), d.prompt).toBe(a! / b! - c!);
    });
  });
  it('q69 multiplies a sum', () => {
    eachDraw(id(69), (d) => {
      const [a, b, c] = nums(d.prompt);
      expect(asNumber(d.answer), d.prompt).toBe((a! + b!) * c!);
    });
  });
  it('q70 subtracts a quotient', () => {
    eachDraw(id(70), (d) => {
      const [a, b, c] = nums(d.prompt);
      expect(asNumber(d.answer), d.prompt).toBe(a! - b! / c!);
    });
  });
  it('q71 puts the brackets where the equality holds', () => {
    eachDraw(id(71), (d) => {
      const m = /: (\d+) ([+\u2212]) (\d+) × (\d+) = (\d+)\?/.exec(d.prompt)!;
      const [a, b, c, target] = [m[1], m[3], m[4], m[5]].map(Number) as [number, number, number, number];
      const plus = m[2] === '+';
      const bracketed = (plus ? a + b : a - b) * c;
      const bare = plus ? a + b * c : a - b * c;
      expect(bracketed).toBe(target);
      expect(bare).not.toBe(target);
      expect(d.answer).toBe(`(${a} ${m[2]} ${b}) × ${c}`);
    });
  });
  it('q72 respects the order of operations', () => {
    eachDraw(id(72), (d) => {
      expect(asNumber(d.answer), d.prompt).toBe(qNum(evalExpr(exprOf(d.prompt))));
    });
  });
});

describe('G6 U02.3 — the convenient grouping really is round', () => {
  it('q13 and q18 pair factors into a power of ten', () => {
    for (const n of [13, 18]) {
      eachDraw(id(n), (d) => {
        const [a, b, c] = nums(exprOf(d.prompt));
        const pairs = [a! * b!, a! * c!, b! * c!];
        expect(pairs.some((p) => /^10*$/.test(String(p)) || p % 100 === 0), d.prompt).toBe(true);
        expect(qEq(evalExpr(exprOf(d.prompt)), q(asNumber(d.answer))), d.prompt).toBe(true);
      });
    }
  });
});
