import { describe, expect, it } from 'vitest';
import { G6_U07_SUBTOPICS, G6_U07_TEMPLATES } from '../src/practice/templates/g6-u07-percent';
import { eachDraw, standardSuite } from './support/g6-harness';
import { parseDecimal, parseValue, q, qAdd, qDiv, qEq, qMul, qSub } from './support/g6-eval';
import type { Q } from './support/g6-eval';

/**
 * Grade VI — Unit 7: percent.
 * Each prompt is parsed back into its numbers and the key is recomputed with
 * exact rationals (a percentage is `p/100`, so nothing is rounded).
 */

const id = (n: number) => `g6-u07-q${String(n).padStart(2, '0')}`;
const sub = (s: string) => G6_U07_TEMPLATES.filter((t) => t.subtopicId === s).map((t) => Number(t.id.slice(-2)));

standardSuite({
  unit: 'U07',
  topic: 'g6-percent',
  subtopics: G6_U07_SUBTOPICS,
  templates: G6_U07_TEMPLATES,
  idPattern: /^g6-u07-q\d{2}$/,
});

const NUM = '(\\d[\\d ]*(?:,\\d+)?)';
const dec = (s: string): Q => parseDecimal(s);
const money = (s: string): Q => dec(s.replace(' ლარი', ''));
const pct = (s: string): Q => qDiv(dec(s.replace('%', '')), q(100));
const hundred = q(100);
const one = q(1);

describe('G6 U07.1 — a percentage of a number', () => {
  for (const n of sub('u07-01')) {
    it(`${id(n)} = number × p / 100`, () => {
      eachDraw(id(n), (d) => {
        const m = new RegExp(`${NUM}% რიცხვიდან ${NUM}`).exec(d.prompt)!;
        expect(qEq(dec(d.answer), qMul(dec(m[2]!), pct(m[1]! + '%'))), d.prompt).toBe(true);
      });
    });
  }
});

describe('G6 U07.2 — discounts', () => {
  const read = (prompt: string) => ({
    price: dec(new RegExp(`ღირს ${NUM} ლარი`).exec(prompt)![1]!),
    p: [...prompt.matchAll(/(\d+(?:,\d+)?)%/g)].map((x) => pct(x[0])),
  });
  const [s1, s2, s3, s4, s5, s6] = sub('u07-02') as [number, number, number, number, number, number];
  it('saving, new price, and the two-step discount', () => {
    eachDraw(id(s1), (d) => {
      const { price, p } = read(d.prompt);
      expect(qEq(money(d.answer), qMul(price, p[0]!)), d.prompt).toBe(true);
    });
    for (const n of [s2, s3, s4, s5]) {
      eachDraw(id(n), (d) => {
        const { price, p } = read(d.prompt);
        expect(qEq(money(d.answer), qMul(price, qSub(one, p[0]!))), d.prompt).toBe(true);
      });
    }
    eachDraw(id(s6), (d) => {
      const { price, p } = read(d.prompt);
      expect(qEq(money(d.answer), qMul(qMul(price, qSub(one, p[0]!)), qSub(one, p[1]!))), d.prompt).toBe(true);
      const sum = qMul(price, qSub(one, qAdd(p[0]!, p[1]!)));
      expect(d.options.some((o) => qEq(money(o), sum))).toBe(true);
    });
  });
});

describe('G6 U07.3 / U07.4 — fractions, decimals and percent', () => {
  it('fraction to percent', () => {
    const all = [...sub('u07-03').slice(0, 3), sub('u07-03')[5]!];
    for (const n of all) {
      eachDraw(id(n), (d) => {
        const f = /(\d+\/\d+)/.exec(d.prompt)![1]!;
        expect(qEq(pct(d.answer), parseValue(f)), d.prompt).toBe(true);
        expect(d.answer).toMatch(/%$/);
      });
    }
  });
  it('percent to a reduced fraction', () => {
    for (const n of sub('u07-03').slice(3, 5)) {
      eachDraw(id(n), (d) => {
        const p = /ჩაწერე (\d+)%/.exec(d.prompt)![1]!;
        expect(qEq(parseValue(d.answer), q(Number(p), 100)), d.prompt).toBe(true);
        const [a, b] = d.answer.split('/').map(Number);
        const g = (x: number, y: number): number => (y ? g(y, x % y) : x);
        if (b) expect(g(a!, b)).toBe(1);
      });
    }
  });
  it('decimal to percent and back', () => {
    for (const n of [sub('u07-04')[0]!, sub('u07-04')[1]!, sub('u07-04')[2]!, sub('u07-04')[5]!]) {
      eachDraw(id(n), (d) => {
        const x = new RegExp(`(?:ჩაწერე|პროცენტია) ${NUM}`).exec(d.prompt)![1]!;
        expect(qEq(pct(d.answer), dec(x)), d.prompt).toBe(true);
      });
    }
    for (const n of [sub('u07-04')[3]!, sub('u07-04')[4]!]) {
      eachDraw(id(n), (d) => {
        const p = /ჩაწერე (\d+(?:,\d+)?)%/.exec(d.prompt)![1]!;
        expect(qEq(dec(d.answer), pct(p + '%')), d.prompt).toBe(true);
      });
    }
  });
});

describe('G6 U07.5 — shaded part as percent', () => {
  it('part ÷ whole × 100', () => {
    for (const n of sub('u07-05')) {
      eachDraw(id(n), (d) => {
        const nums = [...d.prompt.matchAll(/\d+/g)].map((x) => Number(x[0]));
        const [total, k] = [nums[0]!, nums[1]!];
        expect(qEq(pct(d.answer), q(k, total)), d.prompt).toBe(true);
      });
    }
  });
});

describe('G6 U07.6 — tax', () => {
  const [t1, t2, t3, t4, t5, t6] = sub('u07-06') as [number, number, number, number, number, number];
  const price = (prompt: string): Q => dec(new RegExp(`(?:ღირს|არის|ფასი გადასახადამდე) ${NUM} ლარი`).exec(prompt)![1]!);
  it('the tax amount', () => {
    for (const n of [t1, t2]) {
      eachDraw(id(n), (d) => {
        const p = dec(/(\d+)%/.exec(d.prompt)![1]!);
        expect(qEq(money(d.answer), qMul(price(d.prompt), qDiv(p, hundred))), d.prompt).toBe(true);
      });
    }
  });
  it('the price with tax, the base price from the total, and the combined change', () => {
    for (const n of [t3, t4]) {
      eachDraw(id(n), (d) => {
        const p = dec(/(\d+)%/.exec(d.prompt)![1]!);
        expect(qEq(money(d.answer), qMul(price(d.prompt), qAdd(one, qDiv(p, hundred)))), d.prompt).toBe(true);
      });
    }
    eachDraw(id(t5), (d) => {
      const total = dec(new RegExp(`არის ${NUM} ლარი`).exec(d.prompt)![1]!);
      const p = dec(/(\d+)%/.exec(d.prompt)![1]!);
      expect(qEq(qMul(money(d.answer), qAdd(one, qDiv(p, hundred))), total), d.prompt).toBe(true);
    });
    eachDraw(id(t6), (d) => {
      const [p1, p2] = [...d.prompt.matchAll(/(\d+)%/g)].map((x) => dec(x[1]!));
      const base = dec(new RegExp(`ღირს ${NUM} ლარი`).exec(d.prompt)![1]!);
      const expected = qMul(qMul(base, qAdd(one, qDiv(p1!, hundred))), qSub(one, qDiv(p2!, hundred)));
      expect(qEq(money(d.answer), expected), d.prompt).toBe(true);
    });
  });
});
