import { describe, expect, it } from 'vitest';
import { G7_U02_SUBTOPICS, G7_U02_TEMPLATES } from '../src/practice/templates/g7-u02-comparing';
import { eachDraw, standardSuite } from './support/g6-harness';
import { evalExpr, parseValue, qNum } from './support/g6-eval';

/**
 * Grade VII — Unit 2: comparing and ordering. Signs are decided again here from
 * the printed expressions, and sorted lists are checked number by number.
 */

const id = (n: number) => `g7-u02-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U02',
  topic: 'g7-comparing',
  subtopics: G7_U02_SUBTOPICS,
  templates: G7_U02_TEMPLATES,
  idPattern: /^g7-u02-q\d{2}$/,
  grade: 7,
});

/** The two sides of "… : L □ R." */
const sides = (prompt: string): [string, string] => {
  const body = prompt.slice(prompt.lastIndexOf(': ') + 2).replace(/\.$/, '');
  const [l, r] = body.split(' □ ');
  return [l!, r!];
};
const sign = (a: number, b: number): string => (Math.abs(a - b) < 1e-9 ? '=' : a < b ? '<' : '>');
const num = (text: string): number => qNum(parseValue(text));
const plain = (text: string): number => qNum(evalExpr(text.replace(/\s/g, ' ')));

describe('G7 U02 — independent checks', () => {
  it('numbers and fractions (u02-01) compare as printed', () => {
    for (const n of [1, 2, 3, 4, 5, 6]) {
      eachDraw(id(n), (d) => {
        const [l, r] = sides(d.prompt);
        expect(d.answer, d.prompt).toBe(sign(num(l), num(r)));
      });
    }
  });

  it('sums and differences (u02-02)', () => {
    for (const n of [7, 8, 11, 12]) {
      eachDraw(id(n), (d) => {
        const [l, r] = sides(d.prompt);
        expect(d.answer, d.prompt).toBe(sign(plain(l), plain(r)));
      });
    }
    for (const n of [9, 10]) {
      eachDraw(id(n), (d) => {
        const [l, r] = sides(d.prompt);
        expect(d.answer, d.prompt).toBe(sign(plain(l), plain(r)));
      });
    }
  });

  it('expressions with a given value (u02-03) match direct substitution', () => {
    const value = (expr: string, name: string, x: number): number => {
      const withMul = expr
        .replace(/²/g, '^2')
        .replace(new RegExp(`(\\d)${name}`, 'g'), `$1*${name}`)
        .replace(new RegExp(`(^|[^\\w])${name}`, 'g'), `$1(${x})`)
        .replace(/\*\(/g, '*(')
        .replace(new RegExp(`\\*${name}`, 'g'), `*(${x})`);
      // eslint-disable-next-line no-new-func
      return Function(`return ${withMul.replace(/×/g, '*').replace(/\u2212/g, '-').replace(/(\d)\(/g, '$1*(').replace(/\^/g, '**')}`)() as number;
    };
    eachDraw(id(13), (d) => {
      const [l, r] = sides(d.prompt);
      const x = Number(/x = (\d+)/.exec(d.prompt)![1]);
      expect(d.answer, d.prompt).toBe(sign(value(l, 'x', x), value(r, 'x', x)));
    });
    eachDraw(id(14), (d) => {
      const [l, r] = sides(d.prompt);
      const [, name, x] = /თუ (\w) = (\d+)/.exec(d.prompt)!;
      expect(d.answer, d.prompt).toBe(sign(value(l, name!, Number(x)), value(r, name!, Number(x))));
    });
    eachDraw(id(15), (d) => {
      const [l, r] = sides(d.prompt);
      expect(d.answer, d.prompt).toBe(sign(value(l.replace(/(\d)\(/, '$1*('), 'x', 0), value(r, 'x', 0)));
    });
    eachDraw(id(17), (d) => {
      const [, a, b] = /a = (\d+) და b = (\d+)/.exec(d.prompt)! as unknown as [string, string, string];
      const k = Number(/(\d)a \+ b/.exec(d.prompt)![1]);
      expect(d.answer, d.prompt).toBe(sign(k * Number(a) + Number(b), Number(a) + k * Number(b)));
    });
    eachDraw(id(18), (d) => {
      const [l, r] = sides(d.prompt);
      const x = Number(/x = (\d+)/.exec(d.prompt)![1]);
      expect(d.answer, d.prompt).toBe(sign(value(l, 'x', x), value(r, 'x', x)));
    });
    eachDraw(id(16), (d) => {
      const x = num(/x = ([^:]+):/.exec(d.prompt)![1]!);
      const [, r] = sides(d.prompt);
      const c = /^\u2212?\d*/.exec(r)![0].replace('\u2212', '-');
      const coef = c === '-' ? -1 : c === '' ? 1 : Number(c);
      expect(d.answer, d.prompt).toBe(sign(x * x, coef * x));
    });
  });

  it('sorted lists (u02-04) are in order and keep every number', () => {
    const value = (text: string): number => (text.includes('√') ? (text.startsWith('\u2212') ? -1 : 1) * Math.sqrt(Number(text.replace(/[^\d]/g, ''))) : num(text));
    for (const n of [19, 20, 21, 22, 23, 24]) {
      eachDraw(id(n), (d) => {
        const asked = d.prompt.slice(d.prompt.indexOf(': ') + 2).replace(/\.$/, '').split(', ');
        const got = d.answer.split(', ');
        expect([...got].sort(), d.prompt).toEqual([...asked].sort());
        const vals = got.map(value);
        const up = d.prompt.includes('ზრდადობით');
        for (let i = 1; i < vals.length; i += 1) expect(up ? vals[i]! > vals[i - 1]! : vals[i]! < vals[i - 1]!, d.prompt).toBe(true);
      });
    }
  });
});
