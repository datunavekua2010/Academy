import { describe, expect, it } from 'vitest';
import { G6_U06_SUBTOPICS, G6_U06_TEMPLATES } from '../src/practice/templates/g6-u06-mixed';
import { eachDraw, standardSuite } from './support/g6-harness';
import { evalExpr, expressionOf, parseValue, q, qEq } from './support/g6-eval';
import type { Q } from './support/g6-eval';

/**
 * Grade VI — Unit 6: fractions, decimals and rationals together.
 * Every printed operand (`3/4`, `0,35`, `2 1/4`, `−0,5`) is parsed back into an
 * exact fraction and every key is re-derived from the prompt.
 */

const id = (n: number) => `g6-u06-q${String(n).padStart(2, '0')}`;
const sub = (s: string) => G6_U06_TEMPLATES.filter((t) => t.subtopicId === s).map((t) => Number(t.id.slice(-2)));

standardSuite({
  unit: 'U06',
  topic: 'g6-fraction-decimal',
  subtopics: G6_U06_SUBTOPICS,
  templates: G6_U06_TEMPLATES,
  idPattern: /^g6-u06-q\d{2}$/,
});

const value = (text: string): Q => evalExpr(text);
const cmp = (a: Q, b: Q): number => a.n * b.d - b.n * a.d;
const decimalForm = /^−?\d+(?:,\d+)?$/;
const lowest = (a: Q): boolean => a.d >= 1;
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));

describe('G6 U06.5 / U06.6 — keys equal the printed expression', () => {
  for (const n of [...sub('u06-05'), ...sub('u06-06')]) {
    it(`${id(n)} agrees with its expression`, () => {
      eachDraw(id(n), (d) => {
        const expected = evalExpr(expressionOf(d.prompt));
        expect(qEq(value(d.answer), expected), `${d.prompt} → ${d.answer}`).toBe(true);
        for (const option of d.options.filter((o) => o !== d.answer)) {
          expect(qEq(value(option), expected), `${d.prompt}: ${option}`).toBe(false);
        }
        // a decimal key is printed as a decimal and every other option follows it
        const terminating = decimalForm.test(d.answer);
        for (const option of d.options) {
          if (terminating) expect(option, `${d.prompt}: ${option}`).toMatch(decimalForm);
          else expect(option, `${d.prompt}: ${option}`).not.toContain(',');
        }
      });
    });
  }
});

describe('G6 U06.1 / U06.3 — conversions', () => {
  it('fraction, mixed number or decimal to decimal', () => {
    for (const n of [...sub('u06-01').filter((_, i) => [0, 1, 4].includes(i)), ...sub('u06-03').filter((_, i) => [0, 2].includes(i))]) {
      eachDraw(id(n), (d) => {
        const given = /ჩაწერე (.+?) ათწილადის სახით\./.exec(d.prompt)![1]!;
        expect(qEq(value(d.answer), value(given)), d.prompt).toBe(true);
        expect(d.answer, d.prompt).toMatch(decimalForm);
      });
    }
  });
  it('decimal to a simplified fraction', () => {
    for (const n of [sub('u06-01')[2]!, sub('u06-01')[3]!, sub('u06-03')[3]!]) {
      eachDraw(id(n), (d) => {
        const x = value(/ჩაწერე (.+?) ჩვეულებრივი/.exec(d.prompt)![1]!);
        const key = parseValue(d.answer);
        expect(qEq(key, x), d.prompt).toBe(true);
        const [a, b] = d.answer.split('/').map(Number);
        expect(gcd(a!, b!), d.prompt).toBe(1);
        expect(lowest(key)).toBe(true);
      });
    }
  });
  it('decimal to a mixed number with a simplified fractional part', () => {
    for (const n of [sub('u06-01')[5]!, sub('u06-03')[1]!, sub('u06-03')[4]!]) {
      eachDraw(id(n), (d) => {
        const x = value(/ჩაწერე (.+?) შერეული/.exec(d.prompt)![1]!);
        expect(qEq(parseValue(d.answer), x), d.prompt).toBe(true);
        const m = /^(\d+) (\d+)\/(\d+)$/.exec(d.answer)!;
        expect(gcd(Number(m[2]), Number(m[3])), d.prompt).toBe(1);
      });
    }
  });
  it('improper fraction to a decimal and a mixed number', () => {
    eachDraw(id(sub('u06-03')[5]!), (d) => {
      const f = value(/ჩაწერე (.+?) ათწილადის/.exec(d.prompt)![1]!);
      const [decimal, mixed] = d.answer.split(' და ');
      expect(qEq(value(decimal!), f), d.prompt).toBe(true);
      expect(qEq(parseValue(mixed!), f), d.prompt).toBe(true);
      const m = /^(\d+) (\d+)\/(\d+)$/.exec(mixed!)!;
      expect(gcd(Number(m[2]), Number(m[3]))).toBe(1);
    });
  });
});

describe('G6 U06.2 — comparison', () => {
  it('signs are right', () => {
    for (const n of sub('u06-02').slice(0, 4)) {
      eachDraw(id(n), (d) => {
        const m = /შეადარე: (.+?) □ (.+?)\./.exec(d.prompt)!;
        const c = cmp(value(m[1]!), value(m[2]!));
        expect(d.answer, d.prompt).toBe(c < 0 ? '<' : c > 0 ? '>' : '=');
      });
    }
  });
});

describe('G6 U06.2 / U06.4 — ordering', () => {
  for (const n of [...sub('u06-02').slice(4), ...sub('u06-04')]) {
    it(`${id(n)} lists the numbers in the asked order`, () => {
      eachDraw(id(n), (d) => {
        const m = /დაალაგე (ზრდადობით|კლებადობით): (.+?)\. რომელია/.exec(d.prompt)!;
        const sign = m[1] === 'ზრდადობით' ? 1 : -1;
        const given = m[2]!.split('; ');
        const key = d.answer.split('; ');
        expect([...key].sort(), d.prompt).toEqual([...given].sort());
        for (let i = 1; i < key.length; i += 1) {
          expect(sign * cmp(value(key[i]!), value(key[i - 1]!)), `${d.prompt} → ${d.answer}`).toBeGreaterThan(0);
        }
        for (const option of d.options.filter((o) => o !== d.answer)) {
          const items = option.split('; ');
          let inOrder = true;
          for (let i = 1; i < items.length; i += 1) if (sign * cmp(value(items[i]!), value(items[i - 1]!)) <= 0) inOrder = false;
          expect(inOrder, `${d.prompt}: ${option}`).toBe(false);
        }
      });
    });
  }
});

void q;
