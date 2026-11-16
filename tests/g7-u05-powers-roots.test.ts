import { describe, expect, it } from 'vitest';
import { G7_U05_SUBTOPICS, G7_U05_TEMPLATES } from '../src/practice/templates/g7-u05-powers-roots';
import { eachDraw, standardSuite } from './support/g6-harness';

/**
 * Grade VII — Unit 5: powers and roots. Operands are read back from the printed
 * prompt; keys are rebuilt with plain JavaScript arithmetic.
 */

const id = (n: number) => `g7-u05-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U05',
  topic: 'g7-powers-roots',
  subtopics: G7_U05_SUBTOPICS,
  templates: G7_U05_TEMPLATES,
  idPattern: /^g7-u05-q\d{2}$/,
  grade: 7,
});

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n: number): string => String(n).split('').map((d) => SUP[Number(d)]).join('');
const unsup = (text: string): number => Number([...text].map((c) => SUP.indexOf(c)).join(''));
const SUPS = '[⁰¹²³⁴⁵⁶⁷⁸⁹]+';
const body = (prompt: string): string => prompt.replace(/^[^:]*: /, '').replace(/[.,] ?(თუ|სადაც).*$/, '').replace(/\.$/, '');
const num = (text: string): number => Number(text.replace(/\s/g, '').replace('\u2212', '-'));
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const frac = (n: number, d: number): string => {
  const g = gcd(n, d);
  const [a, b] = [n / g, d / g];
  return b === 1 ? String(a) : `${a}/${b}`;
};
const norm = (answer: string): string => answer.replace('\u2212', '-');
const simp = (n: number): [number, number] => {
  let out = 1;
  let rest = n;
  for (let f = 2; f * f <= rest; f += 1) while (rest % (f * f) === 0) { rest /= f * f; out *= f; }
  return [out, rest];
};
const rootText = (out: number, rest: number, letter = ''): string =>
  rest === 1 ? `${out}${letter}` : `${out === 1 && !letter ? '' : out}${letter}√${rest}`;

describe('G7 U05 — independent checks', () => {
  it('powers of rational numbers (u05-01)', () => {
    for (const n of [1, 2]) {
      eachDraw(id(n), (d) => {
        const m = new RegExp(`\\(\\u2212(\\d+)\\)(${SUPS})`).exec(d.prompt)!;
        expect(num(d.answer), d.prompt).toBe((-Number(m[1])) ** unsup(m[2]!));
      });
    }
    eachDraw(id(3), (d) => {
      const m = new RegExp(`\\((\\d+)/(\\d+)\\)(${SUPS})`).exec(d.prompt)!;
      const e = unsup(m[3]!);
      expect(d.answer, d.prompt).toBe(frac(Number(m[1]) ** e, Number(m[2]) ** e));
    });
    eachDraw(id(4), (d) => {
      const m = new RegExp(`\\(\\u2212(\\d+)/(\\d+)\\)(${SUPS})`).exec(d.prompt)!;
      const e = unsup(m[3]!);
      expect(norm(d.answer), d.prompt).toBe(`${e % 2 ? '-' : ''}${frac(Number(m[1]) ** e, Number(m[2]) ** e)}`);
    });
    eachDraw(id(5), (d) => {
      const m = new RegExp(`\\(\\u2212(\\d+)\\)${sup(2)} \\+ (\\d+)${sup(3)}`).exec(d.prompt)!;
      expect(num(d.answer), d.prompt).toBe(Number(m[1]) ** 2 + Number(m[2]) ** 3);
    });
    eachDraw(id(6), (d) => {
      const m = new RegExp(`\\((\\d+)/(\\d+)\\)${sup(2)} \\u2212 \\((\\d+)/(\\d+)\\)${sup(2)}`).exec(d.prompt)!;
      const [p, q, r, s] = m.slice(1).map(Number) as [number, number, number, number];
      const num2 = p * p * s * s - r * r * q * q;
      expect(num2).toBeGreaterThan(0);
      expect(d.answer, d.prompt).toBe(frac(num2, q * q * s * s));
    });
  });

  it('products and quotients of powers (u05-02, u05-03)', () => {
    const term = (base: string, e: number) => `${base}${sup(e)}`;
    for (const n of [7, 9]) {
      eachDraw(id(n), (d) => {
        const m = new RegExp(`(\\S+?)(${SUPS}) · \\S+?(${SUPS})`).exec(d.prompt)!;
        expect(d.answer, d.prompt).toBe(term(m[1]!, unsup(m[2]!) + unsup(m[3]!)));
      });
    }
    for (const n of [8, 10]) {
      eachDraw(id(n), (d) => {
        const m = new RegExp(`(\\S+?)(${SUPS}) ÷ \\S+?(${SUPS})`).exec(d.prompt)!;
        expect(d.answer, d.prompt).toBe(term(m[1]!, unsup(m[2]!) - unsup(m[3]!)));
      });
    }
    for (const n of [11, 12]) {
      eachDraw(id(n), (d) => {
        const m = new RegExp(`(\\S+?)(${SUPS}) · \\S+?(${SUPS}) ÷ \\S+?(${SUPS})`).exec(d.prompt)!;
        expect(d.answer, d.prompt).toBe(term(m[1]!, unsup(m[2]!) + unsup(m[3]!) - unsup(m[4]!)));
      });
    }
    for (const n of [13, 14]) {
      eachDraw(id(n), (d) => {
        const m = new RegExp(`\\((\\S+?)(${SUPS})\\)(${SUPS})`).exec(d.prompt)!;
        expect(d.answer, d.prompt).toBe(term(m[1]!, unsup(m[2]!) * unsup(m[3]!)));
      });
    }
    eachDraw(id(15), (d) => {
      const m = new RegExp(`\\(\\u2212(\\d+)(${SUPS})\\)(${SUPS})`).exec(d.prompt)!;
      expect(num(d.answer), d.prompt).toBe((-(Number(m[1]) ** unsup(m[2]!))) ** unsup(m[3]!));
    });
    eachDraw(id(16), (d) => {
      const m = new RegExp(`\\((\\S+?)(${SUPS})\\)(${SUPS}) · \\S+?(${SUPS})`).exec(d.prompt)!;
      expect(d.answer, d.prompt).toBe(term(m[1]!, unsup(m[2]!) * unsup(m[3]!) + unsup(m[4]!)));
    });
    eachDraw(id(17), (d) => {
      const m = new RegExp(`\\((\\d+)(\\D)(${SUPS})\\)(${SUPS})`).exec(d.prompt)!;
      const e = unsup(m[4]!);
      expect(d.answer, d.prompt).toBe(`${Number(m[1]) ** e}${m[2]}${sup(unsup(m[3]!) * e)}`);
    });
    eachDraw(id(18), (d) => {
      const m = new RegExp(`\\(\\((\\S+?)(${SUPS})\\)(${SUPS})\\)(${SUPS})`).exec(d.prompt)!;
      expect(d.answer, d.prompt).toBe(term(m[1]!, unsup(m[2]!) * unsup(m[3]!) * unsup(m[4]!)));
    });
  });

  it('square roots (u05-04, u05-05)', () => {
    eachDraw(id(19), (d) => expect(num(d.answer) ** 2, d.prompt).toBe(num(body(d.prompt).replace('√', ''))));
    eachDraw(id(20), (d) => expect(num(d.answer) ** 2, d.prompt).toBe(num(body(d.prompt).replace('√', ''))));
    eachDraw(id(21), (d) => {
      const [a, b] = /√\((\d+)\/(\d+)\)/.exec(d.prompt)!.slice(1).map(Number) as [number, number];
      const [p, q] = d.answer.split('/').map(Number) as [number, number];
      expect([p * p, q * q], d.prompt).toEqual([a, b]);
    });
    eachDraw(id(22), (d) => expect(num(d.answer) ** 2, d.prompt).toBe(num(d.prompt.split('√')[1]!.replace('.', ''))));
    eachDraw(id(23), (d) => {
      const [a, b] = d.prompt.split('√').slice(1).map((x) => num(x.replace(/[^0-9]/g, ''))) as [number, number];
      expect(num(d.answer), d.prompt).toBe(Math.sqrt(a) + Math.sqrt(b));
    });
    eachDraw(id(24), (d) => {
      const [a, b] = d.prompt.split('√').slice(1).map((x) => num(x.replace(/[^0-9]/g, ''))) as [number, number];
      expect(num(d.answer), d.prompt).toBe(Math.sqrt(a) - Math.sqrt(b));
    });
    for (const n of [25, 27]) {
      eachDraw(id(n), (d) => {
        const [a, b] = /(\d[\d ]*) · (\d[\d ]*)/.exec(d.prompt)!.slice(1).map(num) as [number, number];
        expect(num(d.answer), d.prompt).toBe(Math.sqrt(a * b));
      });
    }
    eachDraw(id(26), (d) => {
      const [a, b] = /(\d[\d ]*) ÷ (\d[\d ]*)/.exec(d.prompt)!.slice(1).map(num) as [number, number];
      expect(num(d.answer), d.prompt).toBe(Math.sqrt(a / b));
    });
    eachDraw(id(28), (d) => {
      const [a, b] = d.prompt.split('·').map((x) => num(x.replace(/[^0-9]/g, ''))) as [number, number];
      expect(num(d.answer), d.prompt).toBe(Math.sqrt(a) * Math.sqrt(b));
    });
    eachDraw(id(29), (d) => {
      const [a, b] = d.prompt.split('÷').map((x) => num(x.replace(/[^0-9]/g, ''))) as [number, number];
      expect(num(d.answer), d.prompt).toBe(Math.sqrt(a) / Math.sqrt(b));
    });
    eachDraw(id(30), (d) => {
      const [a, b, c] = /(\d+) · (\d+) · (\d+)/.exec(d.prompt)!.slice(1).map(Number) as [number, number, number];
      expect(num(d.answer), d.prompt).toBe(Math.sqrt(a * b * c));
    });
  });

  it('taking factors out of and into roots (u05-06)', () => {
    eachDraw(id(31), (d) => {
      const m = /√\((\d+)(\D)/.exec(d.prompt)!;
      expect(d.answer, d.prompt).toBe(`${Math.sqrt(Number(m[1]))}${m[2]}`);
    });
    for (const n of [32, 33]) {
      eachDraw(id(n), (d) => {
        const [out, rest] = simp(num(d.prompt.split('√')[1]!.replace('.', '')));
        expect(d.answer, d.prompt).toBe(rootText(out, rest));
      });
    }
    for (const n of [34, 35]) {
      eachDraw(id(n), (d) => {
        const m = /(\d+)√(\d+)/.exec(d.prompt)!;
        expect(d.answer, d.prompt).toBe(`√${Number(m[1]) ** 2 * Number(m[2])}`);
      });
    }
    eachDraw(id(36), (d) => {
      const m = /√\((\d+)(\D)/.exec(d.prompt)!;
      const [out, rest] = simp(Number(m[1]));
      expect(d.answer, d.prompt).toBe(rootText(out, rest, m[2]));
    });
  });

  it('transforming root expressions (u05-07)', () => {
    eachDraw(id(37), (d) => {
      const m = /(\d+)√(\d+) \+ (\d+)√/.exec(d.prompt)!;
      expect(d.answer, d.prompt).toBe(`${Number(m[1]) + Number(m[3])}√${m[2]}`);
    });
    eachDraw(id(38), (d) => {
      const m = /(\d+)√(\d+) \u2212 (\d+)√/.exec(d.prompt)!;
      expect(d.answer, d.prompt).toBe(`${Number(m[1]) - Number(m[3])}√${m[2]}`);
    });
    eachDraw(id(39), (d) => {
      const [x, y] = /√(\d+) \+ √(\d+)/.exec(d.prompt)!.slice(1).map(Number) as [number, number];
      const [o1, r1] = simp(x);
      const [o2, r2] = simp(y);
      expect(r1).toBe(r2);
      expect(d.answer, d.prompt).toBe(`${o1 + o2}√${r1}`);
    });
    eachDraw(id(40), (d) => {
      const m = /(\d+)√(\d+) \u2212 √(\d+)/.exec(d.prompt)!;
      const [o1, r1] = simp(Number(m[2]));
      const [o2, r2] = simp(Number(m[3]));
      expect(r1).toBe(r2);
      expect(d.answer, d.prompt).toBe(`${Number(m[1]) * o1 - o2}√${r1}`);
    });
    eachDraw(id(41), (d) => {
      const [a, b] = /√(\d+) · √(\d+)/.exec(d.prompt)!.slice(1).map(Number) as [number, number];
      const [out, rest] = simp(a * b);
      expect(d.answer, d.prompt).toBe(rest === 1 ? String(out) : out === 1 ? `√${rest}` : `${out}√${rest}`);
    });
    eachDraw(id(42), (d) => {
      const m = /\(√(\d+) \+ (\d+)\)/.exec(d.prompt)!;
      expect(num(d.answer), d.prompt).toBe(Number(m[1]) - Number(m[2]) ** 2);
    });
  });
});
