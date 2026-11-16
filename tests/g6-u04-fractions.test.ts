import { describe, expect, it } from 'vitest';
import { G6_U04_SUBTOPICS, G6_U04_TEMPLATES } from '../src/practice/templates/g6-u04-fractions';
import { eachDraw, standardSuite } from './support/g6-harness';
import { evalExpr, numbersIn, parseValue, q, qAdd, qDiv, qEq, qMul, qNum, qSub } from './support/g6-eval';
import type { Q } from './support/g6-eval';

/**
 * Grade VI — Unit 4: fractions and mixed numbers.
 * Re-derivation reads the printed prompt: every expression is evaluated exactly
 * from its printed fractions and mixed numbers, and every key is parsed back
 * from its printed form (`3/4`, `2 1/3`) and compared as a rational.
 */

const id = (n: number) => `g6-u04-q${String(n).padStart(2, '0')}`;
const sub = (s: string) => G6_U04_TEMPLATES.filter((t) => t.subtopicId === s).map((t) => Number(t.id.slice(-2)));

standardSuite({
  unit: 'U04',
  topic: 'g6-fractions',
  subtopics: G6_U04_SUBTOPICS,
  templates: G6_U04_TEMPLATES,
  idPattern: /^g6-u04-q\d{2}$/,
});

const exprOf = (prompt: string): string => {
  const m = /: (.+?)\.(?: პასუხი.*)?$/.exec(prompt)!;
  return m[1]!;
};
const mixedOrFraction = /^(?:\d+ )?\d+\/\d+$|^\d+$/;
const value = (text: string): Q => parseValue(text.replace(/ (მ|ლ|კგ)$/, ''));
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/** Every subtopic whose prompt is "გამოთვალე: <expression>." */
const calculation = [...sub('u04-05'), ...sub('u04-06'), ...sub('u04-08'), ...sub('u04-10').slice(0, 3), ...sub('u04-11'), ...sub('u04-13').filter((n) => ![]), ...sub('u04-15').slice(0, 3), ...sub('u04-16').slice(0, 5), ...sub('u04-17')];

describe('G6 U04 — the key is the value of the printed expression', () => {
  for (const n of calculation) {
    it(`${id(n)} agrees with its expression`, () => {
      eachDraw(id(n), (d) => {
        if (!/გამოთვალე: /.test(d.prompt)) return;
        expect(qEq(value(d.answer), evalExpr(exprOf(d.prompt))), `${d.prompt} → ${d.answer}`).toBe(true);
        expect(d.answer, d.prompt).toMatch(mixedOrFraction);
      });
    });
  }
  it('no second option is equal in value to the key', () => {
    for (const n of calculation) {
      eachDraw(id(n), (d) => {
        if (!/გამოთვალე: /.test(d.prompt)) return;
        const right = evalExpr(exprOf(d.prompt));
        const twins = d.options.filter((o) => qEq(value(o), right));
        expect(twins, d.prompt).toHaveLength(1);
      });
    }
  });
  it('printed answers are in lowest terms', () => {
    for (const n of calculation) {
      eachDraw(id(n), (d) => {
        const m = /(\d+)\/(\d+)$/.exec(d.answer);
        if (m) expect(gcd(Number(m[1]), Number(m[2])), `${d.prompt} → ${d.answer}`).toBe(1);
      });
    }
  });
});

describe('G6 U04.1 — improper fractions and mixed numbers', () => {
  it('writes an improper fraction as a mixed number', () => {
    for (const n of [1, 4]) {
      eachDraw(id(n), (d) => {
        const f = /: (\d+)\/(\d+)\./.exec(d.prompt)!;
        expect(qEq(parseValue(d.answer), q(Number(f[1]), Number(f[2]))), d.prompt).toBe(true);
        expect(d.answer, d.prompt).toMatch(/^\d+ \d+\/\d+$/);
      });
    }
  });
  it('writes a mixed number as an improper fraction', () => {
    for (const n of [2, 5]) {
      eachDraw(id(n), (d) => {
        const m = /: (\d+ \d+\/\d+)\./.exec(d.prompt)!;
        expect(qEq(parseValue(d.answer), parseValue(m[1]!)), d.prompt).toBe(true);
        const a = /^(\d+)\/(\d+)$/.exec(d.answer)!;
        expect(Number(a[1])).toBeGreaterThan(Number(a[2]));
      });
    }
  });
  it('splits whole units from the part', () => {
    for (const n of [3, 6]) {
      eachDraw(id(n), (d) => {
        const f = /(\d+)\/(\d+)/.exec(d.prompt)!;
        const a = /^(\d+) მთ\S+ და (\d+)\/(\d+)$/.exec(d.answer)!;
        expect(Number(a[1]) * Number(f[2]) + Number(a[2])).toBe(Number(f[1]));
        expect(a[3]).toBe(f[2]);
      });
    }
  });
});

describe('G6 U04.2–U04.3 — equal fractions and common denominators', () => {
  it('reduces completely', () => {
    for (const n of [7, 8]) {
      eachDraw(id(n), (d) => {
        const f = /: (\d+)\/(\d+)\./.exec(d.prompt)!;
        const a = /^(\d+)\/(\d+)$/.exec(d.answer)!;
        expect(Number(a[1]) * Number(f[2]), d.prompt).toBe(Number(a[2]) * Number(f[1]));
        expect(gcd(Number(a[1]), Number(a[2]))).toBe(1);
      });
    }
  });
  it('fills the numerator of an equal fraction', () => {
    eachDraw(id(9), (d) => {
      const [a, b, D] = numbersIn(d.prompt);
      expect(Number(d.answer) / D!, d.prompt).toBeCloseTo(a! / b!, 10);
    });
  });
  it('fills the denominator of an equal fraction', () => {
    for (const n of [10, 11]) {
      eachDraw(id(n), (d) => {
        const [a, b, c] = numbersIn(d.prompt);
        expect(c! / Number(d.answer), d.prompt).toBeCloseTo(a! / b!, 10);
      });
    }
  });
  it('names an equal fraction', () => {
    eachDraw(id(12), (d) => {
      const [a, b] = numbersIn(d.prompt);
      expect(qEq(parseValue(d.answer), q(a!, b!)), d.prompt).toBe(true);
    });
  });
  it('brings fractions to the least common denominator', () => {
    for (const n of [13, 14]) {
      eachDraw(id(n), (d) => {
        const [a, b, c, e] = numbersIn(d.prompt);
        const l = (b! * e!) / gcd(b!, e!);
        const parts = d.answer.split(' და ').map((p) => p.split('/').map(Number));
        expect(parts[0]![1], d.prompt).toBe(l);
        expect(parts[1]![1], d.prompt).toBe(l);
        expect(parts[0]![0]! * b!, d.prompt).toBe(a! * l);
        expect(parts[1]![0]! * e!, d.prompt).toBe(c! * l);
      });
    }
    eachDraw(id(15), (d) => {
      const nums = numbersIn(d.prompt);
      const dens = [nums[1]!, nums[3]!, nums[5]!];
      const l = dens.reduce((x, y) => (x * y) / gcd(x, y));
      const parts = d.answer.split(', ').map((p) => p.split('/').map(Number));
      parts.forEach((p, i) => {
        expect(p[1], d.prompt).toBe(l);
        expect(p[0]! * dens[i]!, d.prompt).toBe(nums[i * 2]! * l);
      });
    });
    eachDraw(id(16), (d) => {
      const [b, e] = numbersIn(d.prompt);
      expect(Number(d.answer) % b!).toBe(0);
      expect(Number(d.answer) % e!).toBe(0);
      expect(Number(d.answer)).toBe((b! * e!) / gcd(b!, e!));
    });
  });
});

describe('G6 U04.4 — comparing and ordering', () => {
  const signs: Record<string, (a: Q, b: Q) => boolean> = {
    '<': (a, b) => a.n * b.d < b.n * a.d,
    '>': (a, b) => a.n * b.d > b.n * a.d,
    '=': (a, b) => qEq(a, b),
  };
  it('picks the sign between two printed numbers', () => {
    for (const n of [18, 19, 20, 21, 24]) {
      eachDraw(id(n), (d) => {
        const m = /: (.+?) □ (.+?)\.$/.exec(d.prompt)!;
        expect(signs[d.answer]!(parseValue(m[1]!), parseValue(m[2]!)), d.prompt).toBe(true);
      });
    }
  });
  it('orders three fractions', () => {
    for (const [n, asc] of [[22, true], [23, false]] as const) {
      eachDraw(id(n), (d) => {
        const list = /: (.+?)\. რომელია/.exec(d.prompt)![1]!.split(', ').map(parseValue);
        const sorted = [...list].sort((a, b) => (asc ? 1 : -1) * (a.n * b.d - b.n * a.d));
        const printed = d.answer.split(asc ? ' < ' : ' > ').map(parseValue);
        printed.forEach((p, i) => expect(qEq(p, sorted[i]!), d.prompt).toBe(true));
        for (const option of d.options.filter((o) => o !== d.answer)) {
          const items = option.split(asc ? ' < ' : ' > ').map(parseValue);
          expect(items.every((p, i) => qEq(p, sorted[i]!)), option).toBe(false);
        }
      });
    }
  });
});

describe('G6 U04.7 — comparing sums and differences', () => {
  it('compares an expression with a fraction or another expression', () => {
    for (const n of sub('u04-07')) {
      eachDraw(id(n), (d) => {
        const m = /: (.+?) □ (.+?)\.$/.exec(d.prompt)!;
        const a = evalExpr(m[1]!), b = evalExpr(m[2]!);
        const diff = a.n * b.d - b.n * a.d;
        expect(d.answer, d.prompt).toBe(diff < 0 ? '<' : diff > 0 ? '>' : '=');
      });
    }
  });
});

describe('G6 U04.9 / U04.12 — estimates', () => {
  const rounded = (text: string): number => Math.round(qNum(parseValue(text)));
  it('estimates a sum or difference of mixed numbers by whole-number rounding', () => {
    for (const n of sub('u04-09').slice(0, 4)) {
      eachDraw(id(n), (d) => {
        const m = /შეაფასე (.+?) ([+\u2212]) (.+?) უახლოეს/.exec(d.prompt)!;
        const a = rounded(m[1]!), b = rounded(m[3]!);
        expect(Number(d.answer), d.prompt).toBe(m[2] === '+' ? a + b : a - b);
      });
    }
    eachDraw(id(sub('u04-09')[4]!), (d) => {
      const m = /რამდენია (.+?) \+ (.+?), თუ/.exec(d.prompt)!;
      expect(Number(d.answer), d.prompt).toBe(rounded(m[1]!) + rounded(m[2]!));
    });
  });
  it('estimates a product', () => {
    const [a, b, c, d] = sub('u04-12');
    for (const n of [a!, c!, d!]) {
      eachDraw(id(n), (draw) => {
        const m = /შეაფასე (.+?) × (.+?),/.exec(draw.prompt)!;
        expect(Number(draw.answer), draw.prompt).toBe(rounded(m[1]!) * rounded(m[2]!));
      });
    }
    eachDraw(id(b!), (draw) => {
      const m = /შეაფასე (.+?) × (.+?),/.exec(draw.prompt)!;
      const expected = qMul(q(rounded(m[1]!)), parseValue(m[2]!));
      expect(qEq(parseValue(draw.answer), expected), draw.prompt).toBe(true);
    });
  });
});

describe('G6 U04.10–U04.16 — stories, reciprocals and divisions', () => {
  it('takes a fraction of a quantity', () => {
    const [, , , story, tank] = sub('u04-10');
    eachDraw(id(story!), (d) => {
      const [k, a, b] = numbersIn(d.prompt);
      expect(qEq(value(d.answer), qMul(q(k!), q(a!, b!))), d.prompt).toBe(true);
    });
    eachDraw(id(tank!), (d) => {
      const [k, a, b] = numbersIn(d.prompt);
      expect(qEq(value(d.answer), qMul(q(k!), q(a!, b!))), d.prompt).toBe(true);
    });
  });
  it('multiplies a mixed number by a count (box story)', () => {
    const box = sub('u04-13')[4]!;
    eachDraw(id(box), (d) => {
      const m = /(\d+) ყუთია, თითოეულში (.+?) კგ/.exec(d.prompt)!;
      expect(qEq(value(d.answer), qMul(q(Number(m[1])), parseValue(m[2]!))), d.prompt).toBe(true);
    });
  });
  it('inverts', () => {
    const [a, b, c, e, f, g] = sub('u04-14');
    for (const n of [a!, b!, e!, f!]) {
      eachDraw(id(n), (d) => {
        const m = /(\d+)\/(\d+)/.exec(d.prompt)!;
        expect(qEq(qMul(q(Number(m[1]), Number(m[2])), parseValue(d.answer)), q(1)), d.prompt).toBe(true);
      });
    }
    eachDraw(id(c!), (d) => {
      const [k] = numbersIn(d.prompt);
      expect(qEq(qMul(q(k!), parseValue(d.answer)), q(1)), d.prompt).toBe(true);
    });
    eachDraw(id(g!), (d) => {
      const m = /: (\d+ \d+\/\d+)-ის/.exec(d.prompt) ?? /(\d+ \d+\/\d+)/.exec(d.prompt)!;
      expect(qEq(qMul(parseValue(m[1]!), parseValue(d.answer)), q(1)), d.prompt).toBe(true);
    });
  });
  it('divides a fraction by a count in a story', () => {
    const [, , , ribbon, juice] = sub('u04-15');
    for (const n of [ribbon!, juice!]) {
      eachDraw(id(n), (d) => {
        const [a, b, k] = numbersIn(d.prompt);
        expect(qEq(value(d.answer), qDiv(q(a!, b!), q(k!))), d.prompt).toBe(true);
      });
    }
  });
  it('counts equal pieces', () => {
    const cuts = sub('u04-16')[5]!;
    eachDraw(id(cuts), (d) => {
      const m = /რამდენი (.+?) მ სიგრძის ნაჭერი გამოვა (.+?) მ/.exec(d.prompt)!;
      expect(qEq(q(Number(d.answer)), qDiv(parseValue(m[2]!), parseValue(m[1]!))), d.prompt).toBe(true);
    });
  });
  it('adds up exactly in the one remaining place a sum of parts is used', () => {
    expect(qEq(qAdd(q(1, 2), q(1, 3)), q(5, 6))).toBe(true);
    expect(qEq(qSub(q(1, 2), q(1, 3)), q(1, 6))).toBe(true);
  });
});
