import { describe, expect, it } from 'vitest';
import { G6_U10_SUBTOPICS, G6_U10_TEMPLATES } from '../src/practice/templates/g6-u10-algebra';
import { eachDraw, standardSuite } from './support/g6-harness';
import { parseValue, qNum } from './support/g6-eval';

/**
 * Grade VI — Unit 10: algebra.
 *
 * Expressions are read back from the printed prompt and evaluated at several
 * points, so a simplified form must equal the original everywhere; equations
 * are checked by substituting the printed solution; inequalities by testing
 * values on both sides of the bound.
 */

const id = (n: number) => `g6-u10-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U10',
  topic: 'g6-algebra',
  subtopics: G6_U10_SUBTOPICS,
  templates: G6_U10_TEMPLATES,
  idPattern: /^g6-u10-q\d{2}$/,
});

const ungroup = (text: string): string => text.replace(/(\d)[\u2009\u00a0\u202f ](?=\d{3}(?!\d))/g, '$1');

/** `3(x + 4) − 2x²` → a JS function of the letters used. */
const compile = (source: string): ((env: Record<string, number>) => number) => {
  const js = ungroup(source)
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/²/g, '**2')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')')
    .replace(/(\d|\))\s*(?=[a-z(])/g, '$1*')
    .replace(/([a-z])\s*(?=[a-z(])/g, '$1*')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=');
  const letters = [...new Set(js.match(/[a-z]/g) ?? [])];
  const fn = new Function(...letters, `return (${js});`) as (...a: number[]) => number;
  return (env) => fn(...letters.map((l) => env[l] ?? 1));
};
const compileTest = (source: string): ((env: Record<string, number>) => boolean) => {
  const f = compile(`(${ungroup(source)})`.replace(/≤|≥|<|>/, (m) => `)${m}(`));
  return (env) => Boolean(f(env));
};

const POINTS: Array<Record<string, number>> = [1, 2, 3, 5, 7, 11].map((k) => ({ x: k, y: k + 2, a: k + 1, b: 2 * k, m: k, n: k + 3, t: k, z: k, p: k, q: k + 4, c: k, d: k + 1, s: k, u: k, v: k + 1, k, l: k + 2 }));
const same = (a: string, b: string): boolean => POINTS.every((p) => Math.abs(compile(a)(p) - compile(b)(p)) < 1e-9);
const afterColon = (prompt: string): string => /: (.+?)\.$/.exec(prompt)![1]!;

const SIMPLIFY = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 37, 38, 39, 40, 41, 42];
describe('G6 U10 — simplified forms equal the original everywhere', () => {
  for (const n of SIMPLIFY) {
    it(`${id(n)} ${n}`, () => {
      eachDraw(id(n), (d) => {
        const expr = afterColon(d.prompt);
        expect(same(expr, d.answer), `${d.prompt} → ${d.answer}`).toBe(true);
        for (const o of d.options.filter((x) => x !== d.answer)) expect(same(expr, o), `${d.prompt}: ${o}`).toBe(false);
        expect(d.answer, 'no brackets left').not.toMatch(/[()]/);
      });
    });
  }
});

describe('G6 U10 — numeric expressions', () => {
  it('11, 13–18, 61–65 are evaluated as printed', () => {
    for (const n of [11, 13, 14, 15, 16, 17, 18, 61, 62, 63, 64, 65]) {
      eachDraw(id(n), (d) => {
        let expr = d.prompt;
        if (n === 17) {
          // 14 × (□ × 5) = (14 × 4) × 5 : the box is the second factor of the inner product
          const [a, c] = ungroup(d.prompt).match(/\d+/g)!.map(Number) as [number, number];
          const b = Number(ungroup(d.prompt).match(/× (\d+)\) ×/)![1]);
          expect(Number(d.answer), d.prompt).toBe(b);
          expect(a * (b * c)).toBe(a * b * c);
          return;
        }
        expr = /(?:: )(.+?)\.$/.exec(d.prompt)![1]!;
        const value = compile(expr)({});
        expect(Number(ungroup(d.answer).replace(/\s/g, '')), `${d.prompt} → ${d.answer}`).toBe(value);
      });
    }
  });
});

describe('G6 U10 — expressions at given values', () => {
  const values = (prompt: string): Record<string, number> => {
    const tail = /თუ (.+?)\.$/.exec(prompt)![1]!;
    const env: Record<string, number> = {};
    for (const m of tail.matchAll(/([a-z]) = (\d+)/g)) env[m[1]!] = Number(m[2]);
    return env;
  };
  const exprOf = (prompt: string): string => /(?:გამოთვალე|მნიშვნელობა:?) ?(.+?), თუ /.exec(prompt)![1]!.replace(/^:\s*/, '');
  for (const n of [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 43, 44, 45, 46, 47, 48, 66]) {
    it(`${id(n)} value`, () => {
      eachDraw(id(n), (d) => {
        const e = exprOf(d.prompt.replace('იპოვე გამოსახულების მნიშვნელობა:', 'გამოთვალე'));
        expect(Number(d.answer), d.prompt).toBe(compile(e)(values(d.prompt)));
      });
    });
  }
});

describe('G6 U10 — equations are checked by substitution', () => {
  const EQ = [19, 20, 21, 22, 23, 24, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 79, 80, 81, 82, 83, 84];
  for (const n of EQ) {
    it(`${id(n)} substitution`, () => {
      eachDraw(id(n), (d) => {
        const eq = /: (.+?)\.$/.exec(d.prompt)![1]!;
        const [lhs, rhs] = eq.split(' = ') as [string, string];
        const letter = /[a-z]/.exec(lhs)![0];
        const shown = d.answer.includes('=') ? d.answer.split(' = ')[1]! : d.answer;
        const value = qNum(parseValue(shown));
        const left = compile(lhs)({ [letter]: value });
        const right = compile(rhs)({});
        expect(left, `${d.prompt} → ${d.answer}`).toBeCloseTo(right, 9);
        for (const o of d.options.filter((x) => x !== d.answer)) {
          const w = qNum(parseValue(o.includes('=') ? o.split(' = ')[1]! : o));
          expect(Math.abs(compile(lhs)({ [letter]: w }) - right), `${d.prompt}: ${o}`).toBeGreaterThan(1e-9);
        }
      });
    });
  }
});

describe('G6 U10 — yes / no pairs', () => {
  const NO = [67, 68, 69, 70, 71, 72];
  for (const n of NO) {
    it(`${id(n)} pair`, () => {
      eachDraw(id(n), (d) => {
        const [u, w] = /\((\d+), (\d+)\)/.exec(d.prompt)!.slice(1).map(Number) as [number, number];
        const eq = /ტოლობას (.+?)\?$/.exec(d.prompt)![1]!;
        const [lhs, rhs] = eq.split(' = ') as [string, string];
        const holds = compile(lhs)({ x: u, y: w }) === Number(rhs);
        expect(d.answer, d.prompt).toBe(holds ? 'დიახ' : 'არა');
      });
    });
  }
  it('both verdicts occur', () => {
    const seen = new Set<string>();
    for (const n of NO) eachDraw(id(n), (d) => seen.add(d.answer), 60);
    expect([...seen].sort()).toEqual(['დიახ', 'არა'].sort());
  });
});

describe('G6 U10 — inequalities', () => {
  it('73–76: the printed solution equals the original on both sides of the bound', () => {
    for (const n of [73, 74, 75, 76]) {
      eachDraw(id(n), (d) => {
        const original = compileTest(/: (.+?)\.$/.exec(d.prompt)![1]!);
        const solution = compileTest(d.answer);
        const letter = /[a-z]/.exec(d.answer)![0];
        for (let x = -5; x <= 200; x += 1) expect(solution({ [letter]: x }), `${d.prompt} → ${d.answer} at ${x}`).toBe(original({ [letter]: x }));
        for (const o of d.options.filter((z) => z !== d.answer)) {
          const bad = compileTest(o);
          let differs = false;
          for (let x = -5; x <= 200; x += 1) if (bad({ [letter]: x }) !== original({ [letter]: x })) differs = true;
          expect(differs, `${d.prompt}: ${o}`).toBe(true);
        }
      });
    }
  });
  it('77–78: the greatest / least whole value, by trying every integer', () => {
    for (const [n, pick] of [[77, 'max'], [78, 'min']] as const) {
      eachDraw(id(n), (d) => {
        const cond = compileTest(/თუ (.+?)\.$/.exec(d.prompt)![1]!);
        const letter = /([a-z]) ცვლადის/.exec(d.prompt)![1]!;
        const xs: number[] = [];
        for (let x = 0; x <= 200; x += 1) if (cond({ [letter]: x })) xs.push(x);
        expect(Number(d.answer), d.prompt).toBe(pick === 'max' ? Math.max(...xs) : Math.min(...xs));
      });
    }
  });
});

describe('G6 U10 — writing expressions with letters', () => {
  it('85–90', () => {
    eachDraw(id(85), (d) => {
      const k = Number(/დაუმატე (\d+)/.exec(d.prompt)![1]);
      expect(compile(d.answer)({ x: 4 }), d.prompt).toBe(4 + k);
    });
    eachDraw(id(86), (d) => {
      const [, a, k, m] = /რიცხვ ([a-z])-ს გაამრავლე რიცხვზე (\d+) და გამოაკელი (\d+)/.exec(d.prompt)!;
      expect(compile(d.answer)({ [a!]: 5 }), d.prompt).toBe(5 * Number(k) - Number(m));
    });
    eachDraw(id(87), (d) => {
      const [k, m] = [...d.prompt.matchAll(/რიცხვი (\d+)|რიცხვზე (\d+)/g)].map((x) => Number(x[1] ?? x[2]));
      expect(compile(d.answer)({ y: 5 }), d.prompt).toBe((5 + k!) * m!);
    });
    eachDraw(id(88), (d) => {
      const [, p, q] = /სიგრძეა ([a-z]), სიგანე კი ([a-z])/.exec(d.prompt)!;
      expect(compile(d.answer)({ [p!]: 3, [q!]: 5 }), d.prompt).toBe(16);
    });
    eachDraw(id(89), (d) => {
      const [, name, k] = /ღირს ([a-z]) ლარი\. ჩაწერე (\d+)/.exec(d.prompt)!;
      expect(compile(d.answer)({ [name!]: 7 }), d.prompt).toBe(7 * Number(k));
    });
    eachDraw(id(90), (d) => {
      const [, p, q] = /\(([a-z]) \+ ([a-z])\)/.exec(d.prompt)!;
      expect(compile(d.answer)({ [p!]: 3, [q!]: 7 }), d.prompt).toBe(5);
    });
  });
});
