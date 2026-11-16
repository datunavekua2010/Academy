import { describe, expect, it } from 'vitest';
import { G6_U09_SUBTOPICS, G6_U09_TEMPLATES } from '../src/practice/templates/g6-u09-multistep';
import { eachDraw, standardSuite } from './support/g6-harness';
import { parseValue, q, qEq, qMul, qSub } from './support/g6-eval';
import type { Q } from './support/g6-eval';

/**
 * Grade VI — Unit 9: multi-step problems.
 * Every story is solved again from the numbers in its printed prompt; the
 * inequalities are solved by trying every integer.
 */

const id = (n: number) => `g6-u09-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U09',
  topic: 'g6-multistep',
  subtopics: G6_U09_SUBTOPICS,
  templates: G6_U09_TEMPLATES,
  idPattern: /^g6-u09-q\d{2}$/,
});

const ungroup = (text: string): string => text.replace(/(\d)[\u2009\u00a0\u202f ](?=\d{3}(?!\d))/g, '$1');
/** Every number in a text, signed, decimals read with the comma. */
const nums = (text: string): number[] =>
  [...ungroup(text).matchAll(/(−)?(\d+(?:,\d+)?)/g)].map((m) => (m[1] ? -1 : 1) * Number(m[2]!.replace(',', '.')));
/** The number an answer starts with: `1 293`, `−6°C`, `5,5 ლ`. */
const lead = (answer: string): number => nums(answer)[0]!;

const numeric: Record<number, (n: number[]) => number> = {
  1: ([s, a, b]) => s! + a! - b!,
  2: ([b, k, sold]) => b! * k! - sold!,
  3: ([a, b, s]) => a! + b! - s!,
  4: ([c, k, m]) => c! * k! - m!,
  5: ([s, a, e]) => s! - a! - (a! + e!),
  6: ([r, d, g]) => r! * d! - g!,
  7: ([t0, r]) => t0! + r!,
  8: ([a, b]) => -(a! + b!),
  9: ([f, d]) => f! - d!,
  10: ([t0, d]) => t0! - d!,
  11: ([a, b, s]) => s! + a! - b!,
  12: ([h, b]) => h! + b!,
  25: ([w1, c1, w2, c2]) => w1! * c1! + w2! * c2!,
  26: ([a, b]) => a! + b!,
  27: ([s, a, u]) => s! + a! - u!,
  28: ([l, a, b]) => l! - a! - b!,
  29: ([v, k, u]) => v! * k! - u!,
  30: ([a, b, c]) => a! + b! + c!,
  31: ([b, k, s]) => b! * k! - s!,
  33: ([a, b, c, total]) => total! - a! - b! - c!,
  36: ([n, f, d, k]) => n! - (n! * f!) / d! + k!,
  49: ([v, t]) => v! * t!,
  50: ([dst, t]) => dst! / t!,
  51: ([v, dst]) => dst! / v!,
  53: ([v, m]) => (v! * m!) / 60,
  54: ([dist, v, t]) => dist! - v! * t!,
};

describe('G6 U09 — stories are solved again from the prompt', () => {
  for (const [key, solve] of Object.entries(numeric)) {
    const n = Number(key);
    it(`${id(n)} answer follows from the numbers`, () => {
      eachDraw(id(n), (d) => {
        const found = nums(d.prompt);
        expect(lead(d.answer), `${d.prompt} → ${d.answer}`).toBeCloseTo(solve(found), 6);
        for (const o of d.options.filter((x) => x !== d.answer)) expect(lead(o), `${d.prompt}: ${o}`).not.toBeCloseTo(lead(d.answer), 6);
      });
    });
  }
});

describe('G6 U09.3 — inequalities, every integer tried', () => {
  const solve = (text: string, pick: 'min' | 'max', nonNegative = false): number => {
    const js = text.replace(/−/g, '-').replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/(\d)(x|\()/g, '$1*$2');
    const holds = (x: number): boolean => new Function('x', `return ${js};`)(x) as boolean;
    const xs: number[] = [];
    for (let x = nonNegative ? 0 : -200; x <= 200; x += 1) if (holds(x)) xs.push(x);
    return pick === 'min' ? Math.min(...xs) : Math.max(...xs);
  };
  const cases: Array<[number, 'min' | 'max']> = [[13, 'min'], [14, 'max'], [15, 'max'], [16, 'min'], [17, 'max']];
  for (const [n, pick] of cases) {
    it(`${id(n)} finds the ${pick} integer`, () => {
      eachDraw(id(n), (d) => {
        const e = /(?:რომლისთვისაც|უტოლობა:) (.+?)\./.exec(d.prompt)![1]!;
        expect(Number(d.answer.replace('−', '-')), d.prompt).toBe(solve(e, pick));
      });
    });
  }
  it(`${id(18)} reads the word problem`, () => {
    eachDraw(id(18), (d) => {
      const [a, b, c] = nums(d.prompt) as [number, number, number];
      let best = -1;
      for (let x = 0; x < 200; x += 1) if (a * x - b < c) best = x;
      expect(Number(d.answer), d.prompt).toBe(best);
    });
  });
});

describe('G6 U09.4 / U09.6 — fraction stories', () => {
  const fractions = (prompt: string): Q[] => [...prompt.matchAll(/(\d+)\/(\d+)/g)].map((m) => q(Number(m[1]), Number(m[2])));
  const one = q(1);
  const value = (answer: string): Q => parseValue(answer.replace(/ (მ|კგ)$/, ''));
  it('what is left after two parts of the whole', () => {
    for (const n of [19, 20, 32]) {
      eachDraw(id(n), (d) => {
        const [f1, f2] = fractions(d.prompt) as [Q, Q];
        expect(qEq(value(d.answer), qSub(qSub(one, f1), f2)), d.prompt).toBe(true);
        expect(d.options.filter((o) => o !== d.answer).some((o) => qEq(value(o), value(d.answer))), d.prompt).toBe(false);
      });
    }
  });
  it('a part taken out of the water', () => {
    eachDraw(id(21), (d) => {
      const [f1, f2] = fractions(d.prompt) as [Q, Q];
      expect(qEq(value(d.answer), qSub(f1, f2)), d.prompt).toBe(true);
    });
  });
  it('a part of the remainder', () => {
    for (const n of [22, 23]) {
      eachDraw(id(n), (d) => {
        const [f1, f2] = fractions(d.prompt) as [Q, Q];
        expect(qEq(value(d.answer), qMul(qSub(one, f1), qSub(one, f2))), d.prompt).toBe(true);
      });
    }
    eachDraw(id(24), (d) => {
      const [f1, f2] = fractions(d.prompt) as [Q, Q];
      const length = q(nums(d.prompt)[0]!);
      expect(qEq(value(d.answer), qMul(length, qMul(qSub(one, f1), qSub(one, f2)))), d.prompt).toBe(true);
    });
    eachDraw(id(35), (d) => {
      const [f1, f2] = fractions(d.prompt) as [Q, Q];
      const total = q(nums(d.prompt)[0]!);
      expect(qEq(value(d.answer), qMul(total, qMul(qSub(one, f1), qSub(one, f2)))), d.prompt).toBe(true);
    });
  });
  it('the rectangle: perimeter and area', () => {
    eachDraw(id(34), (d) => {
      const [l, w] = nums(d.prompt) as [number, number];
      const p = nums(d.answer)[0]!;
      expect(p, d.prompt).toBeCloseTo(2 * (l + w), 6);
      const area = /ფართობი (.+?) სმ²/.exec(d.answer)![1]!;
      expect(nums(area)[0], d.prompt).toBeCloseTo(l * w, 6);
    });
  });
});

describe('G6 U09.7 — estimating', () => {
  const half = (x: number, unit: number): number => Math.floor(x / unit + 0.5);
  it('rounds then calculates', () => {
    eachDraw(id(37), (d) => {
      const [a, b] = nums(d.prompt) as [number, number];
      expect(lead(d.answer), d.prompt).toBe(half(a, 100) * 100 + half(b, 100) * 100);
    });
    eachDraw(id(38), (d) => {
      const [a, b] = nums(d.prompt) as [number, number];
      expect(lead(d.answer), d.prompt).toBe(half(a, 10) * 10 * half(b, 10) * 10);
    });
    eachDraw(id(39), (d) => {
      const [a, b, x, y] = nums(d.prompt) as [number, number, number, number];
      expect(Number(d.answer), d.prompt).toBe(x / y);
      expect(Math.abs(a - x), d.prompt).toBeLessThanOrEqual(3);
      expect(Math.abs(b - y), d.prompt).toBeLessThanOrEqual(3);
    });
    eachDraw(id(40), (d) => {
      const [p, k] = nums(d.prompt) as [number, number];
      expect(lead(d.answer), d.prompt).toBe(half(p, 10) * 10 * k);
    });
    eachDraw(id(41), (d) => {
      const xs = nums(d.prompt).slice(0, 3);
      expect(Number(d.answer), d.prompt).toBe(xs.reduce((s, x) => s + half(x, 100), 0));
    });
    eachDraw(id(42), (d) => {
      const [n, g] = nums(d.prompt) as [number, number];
      expect(Number(d.answer), d.prompt).toBe(Math.round(n / g));
    });
  });
});

describe('G6 U09.8 — extra and missing data', () => {
  it('apples, area and passengers name the right superfluous datum', () => {
    eachDraw(id(43), (d) => {
      const [b, k] = nums(d.prompt) as [number, number];
      expect(d.answer, d.prompt).toBe(`${b * k} ვაშლი; ზედმეტია ვაშლის ფასი`);
    });
    eachDraw(id(44), (d) => {
      const [l, w] = nums(d.prompt) as [number, number];
      expect(d.answer, d.prompt).toBe(`${l * w} სმ²; არ გჭირდება ფანქრის ფასი`);
    });
    eachDraw(id(45), (d) => {
      const [s, a, b] = nums(d.prompt) as [number, number, number];
      expect(d.answer, d.prompt).toBe(`${s - a + b} მგზავრი; ზედმეტია ავტობუსის ნომერი`);
    });
    eachDraw(id(46), (d) => {
      const [b, k] = nums(d.prompt) as [number, number];
      expect(d.answer, d.prompt).toBe(`${b * k} კგ; მონაცემები საკმარისია`);
    });
  });
  it('the price of one pen and the average speed', () => {
    eachDraw(id(47), (d) => {
      const [k, p, m, total] = nums(d.prompt) as [number, number, number, number];
      expect(lead(d.answer) * m + k * p, d.prompt).toBe(total);
    });
    eachDraw(id(48), (d) => {
      const [t, dist] = nums(d.prompt) as [number, number];
      expect(d.answer, d.prompt).toBe(`${dist / t} კმ; არ არის საჭირო საწვავის ფასი`);
    });
  });
});

describe('G6 U09.9 — time, speed and distance', () => {
  it('a journey time in hours and minutes', () => {
    eachDraw(id(52), (d) => {
      const [h1, m1, h2, m2] = nums(d.prompt) as [number, number, number, number];
      const dur = h2 * 60 + m2 - (h1 * 60 + m1);
      expect(d.answer, d.prompt).toBe(`${Math.floor(dur / 60)} სთ ${dur % 60} წთ`);
    });
  });
});
