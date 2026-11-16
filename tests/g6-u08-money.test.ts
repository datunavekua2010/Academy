import { describe, expect, it } from 'vitest';
import { G6_U08_SUBTOPICS, G6_U08_TEMPLATES } from '../src/practice/templates/g6-u08-money';
import { eachDraw, standardSuite } from './support/g6-harness';

/**
 * Grade VI — Unit 8: money.
 * Amounts are parsed into tetri (hundredths of a lari) and every key is
 * recomputed in integers from the numbers printed in the prompt.
 */

const id = (n: number) => `g6-u08-q${String(n).padStart(2, '0')}`;
const sub = (s: string) => G6_U08_TEMPLATES.filter((t) => t.subtopicId === s).map((t) => Number(t.id.slice(-2)));

standardSuite({
  unit: 'U08',
  topic: 'g6-money',
  subtopics: G6_U08_SUBTOPICS,
  templates: G6_U08_TEMPLATES,
  idPattern: /^g6-u08-q\d{2}$/,
});

/** `1 234,50` → 123450 tetri. */
const tetri = (text: string): number => {
  const [whole = '0', rest = ''] = text.replace(/\s/g, '').split(',');
  return Number(whole) * 100 + Number((rest + '00').slice(0, 2));
};
const amounts = (prompt: string): number[] => [...prompt.matchAll(/(\d[\d ]*(?:,\d+)?) (?:ლარი|ლარად|ლარს|ლარიანი)/g)].map((m) => tetri(m[1]!));
const answerAmount = (answer: string): number => tetri(answer.replace(' ლარი', ''));
const verdictOf = (answer: string): { enough: boolean; amount: number } => {
  const m = /^(არ )?ეყოფა, (?:დარჩება|დააკლდება) (.+) ლარი$/.exec(answer)!;
  return { enough: !m[1], amount: tetri(m[2]!) };
};

describe('G6 U08.1 / U08.2 — sums, products and change', () => {
  const [a1, a2, a3, a4, a5, a6] = sub('u08-01') as [number, number, number, number, number, number];
  it('total of two prices, change from a sum, and change from a banknote', () => {
    eachDraw(id(a1), (d) => {
      const [x, y] = amounts(d.prompt);
      expect(answerAmount(d.answer), d.prompt).toBe(x! + y!);
    });
    eachDraw(id(a2), (d) => {
      const m = /ჰქონდა (\d+) ლარი.+წიგნი (.+?) ლარად/.exec(d.prompt)!;
      expect(answerAmount(d.answer), d.prompt).toBe(Number(m[1]) * 100 - tetri(m[2]!));
    });
    eachDraw(id(a6), (d) => {
      const m = /მაისური (.+?) ლარად და შარვალი (.+?) ლარად. მან მოლარეს (\d+) ლარი/.exec(d.prompt)!;
      expect(answerAmount(d.answer), d.prompt).toBe(Number(m[3]) * 100 - tetri(m[1]!) - tetri(m[2]!));
    });
  });
  it('unit price × count, shares of a total, weight × price', () => {
    eachDraw(id(a3), (d) => {
      const m = /ღირს (.+?) ლარი. რა ღირს (\d+) ასეთი/.exec(d.prompt)!;
      expect(answerAmount(d.answer), d.prompt).toBe(tetri(m[1]!) * Number(m[2]));
    });
    eachDraw(id(a4), (d) => {
      const m = /^(\d+) ერთნაირი რვეული ჯამში (.+?) ლარი/.exec(d.prompt)!;
      expect(answerAmount(d.answer) * Number(m[1]), d.prompt).toBe(tetri(m[2]!));
    });
    eachDraw(id(a5), (d) => {
      const m = /იყიდა (.+?) კგ ვაშლი, რომლის 1 კგ ღირს (.+?) ლარი/.exec(d.prompt)!;
      expect(answerAmount(d.answer) * 10, d.prompt).toBe(Math.round(Number(m[1]!.replace(',', '.')) * 10) * tetri(m[2]!));
    });
  });
  it('the bank-2 products, fractions and differences', () => {
    const [b1, b2, b3, b4, b5, b6] = sub('u08-02') as [number, number, number, number, number, number];
    for (const n of [b1, b4]) {
      eachDraw(id(n), (d) => {
        const nums = [...d.prompt.matchAll(/\d+/g)].map((x) => Number(x[0]));
        expect(answerAmount(d.answer), d.prompt).toBe(nums[0]! * nums[1]! * 100);
      });
    }
    eachDraw(id(b2), (d) => {
      const m = /ჰქონდა (\d+) ლარი.+ თანხის (\S+)\./.exec(d.prompt)!;
      const den = ({ მეოთხედი: 4, მესამედი: 3, მეხუთედი: 5, ნახევარი: 2, მეექვსედი: 6 } as Record<string, number>)[m[2]!]!;
      expect(answerAmount(d.answer) * den, d.prompt).toBe(Number(m[1]) * 100 * (den - 1));
    });
    eachDraw(id(b3), (d) => {
      const m = /(\d+) კგ ფორთოხალი იყიდეს, თითოეული კილოგრამი (.+?) ლარად/.exec(d.prompt)!;
      expect(answerAmount(d.answer), d.prompt).toBe(Number(m[1]) * tetri(m[2]!));
    });
    eachDraw(id(b5), (d) => {
      const [x, y] = amounts(d.prompt);
      expect(answerAmount(d.answer), d.prompt).toBe(x! - y!);
    });
    eachDraw(id(b6), (d) => {
      const m = /ღირს (.+?) ლარი. მყიდველმა გადაიხადა ფასის (\d+)\/(\d+)/.exec(d.prompt)!;
      const price = tetri(m[1]!);
      expect(answerAmount(d.answer) * Number(m[3]), d.prompt).toBe(price * (Number(m[3]) - Number(m[2])));
    });
  });
});

describe('G6 U08.3 — sharing and rounding', () => {
  it('exact shares', () => {
    for (const n of [...sub('u08-03').filter((_, i) => [0, 1, 2, 4].includes(i))]) {
      eachDraw(id(n), (d) => {
        const m = /^(.+?) ლარი თანაბრად .+? (\d+) /.exec(d.prompt)!;
        expect(answerAmount(d.answer) * Number(m[2]), d.prompt).toBe(tetri(m[1]!));
      });
    }
  });
  it('shares rounded to the nearest tetri', () => {
    for (const n of [sub('u08-03')[3]!, sub('u08-03')[5]!]) {
      eachDraw(id(n), (d) => {
        const m = /^(.+?) ლარი თანაბრად .+? (\d+) /.exec(d.prompt)!;
        const total = tetri(m[1]!);
        const k = Number(m[2]);
        expect(Math.abs(answerAmount(d.answer) * k - total), d.prompt).toBeLessThanOrEqual(k / 2);
        expect(Math.abs(answerAmount(d.answer) * k - total) * 2 < k, d.prompt).toBe(true);
      });
    }
  });
});

describe('G6 U08.4 — is the money enough?', () => {
  const wanted = (p: string): number[] => amounts(p.replace(/აქვს \d+ ლარი/, ''));
  const need: Array<(prompt: string) => number> = [
    (p) => { const a = wanted(p); return a[0]! + a[1]!; },
    (p) => { const a = wanted(p); return a[0]! + a[1]!; },
    (p) => { const m = /იყიდოს (\d+) რვეული, თითოეული (.+?) ლარად/.exec(p)!; return Number(m[1]) * tetri(m[2]!); },
    (p) => { const a = wanted(p); return a[0]! + a[1]!; },
    (p) => { const m = /(\d+) წიგნი, თითოეული (.+?) ლარად, და ჩანთა (.+?) ლარად/.exec(p)!; return Number(m[1]) * tetri(m[2]!) + tetri(m[3]!); },
    (p) => { const a = wanted(p); return 2 * (a[0]! + a[1]! + a[2]!); },
  ];
  sub('u08-04').forEach((n, i) => {
    it(`${id(n)} states the verdict and the amount`, () => {
      eachDraw(id(n), (d) => {
        const have = Number(/(?:აქვს|აქვს) (\d+) ლარი/.exec(d.prompt)![1]) * 100;
        const diff = have - need[i]!(d.prompt);
        const verdict = verdictOf(d.answer);
        expect(verdict.enough, d.prompt).toBe(diff >= 0);
        expect(verdict.amount, d.prompt).toBe(Math.abs(diff));
      });
    });
  });
});

describe('G6 U08.5 — fines', () => {
  const [f1, f2, f3, f4, f5, f6] = sub('u08-05') as [number, number, number, number, number, number];
  it('part payment, added percent, sums, and half paid', () => {
    eachDraw(id(f1), (d) => {
      const m = /დაუწესეს (\d+) ლარიანი.+გადაიხადა (\d+) ლარი/.exec(d.prompt)!;
      expect(answerAmount(d.answer), d.prompt).toBe((Number(m[1]) - Number(m[2])) * 100);
    });
    eachDraw(id(f2), (d) => {
      const m = /შეადგენს (\d+) ლარს.+ (\d+)% დამატებით/.exec(d.prompt)!;
      expect(answerAmount(d.answer), d.prompt).toBe(Number(m[1]) * (100 + Number(m[2])));
    });
    eachDraw(id(f3), (d) => {
      const m = /ჯარიმა: (\d+) ლარი და (\d+) ლარი/.exec(d.prompt)!;
      expect(answerAmount(d.answer), d.prompt).toBe((Number(m[1]) + Number(m[2])) * 100);
    });
    eachDraw(id(f4), (d) => {
      const m = /იყო (\d+) ლარი. მისი (\d+)%/.exec(d.prompt)!;
      expect(answerAmount(d.answer), d.prompt).toBe(Number(m[1]) * (100 - Number(m[2])));
    });
    eachDraw(id(f5), (d) => {
      const m = /თანხა (\d+) ლარია.+დაემატა (\d+) ლარი/.exec(d.prompt)!;
      expect(answerAmount(d.answer), d.prompt).toBe((Number(m[1]) + Number(m[2])) * 100);
    });
    eachDraw(id(f6), (d) => {
      const m = /ჯარიმა: (\d+) ლარი, (\d+) ლარი და (\d+) ლარი/.exec(d.prompt)!;
      expect(answerAmount(d.answer) * 2, d.prompt).toBe((Number(m[1]) + Number(m[2]) + Number(m[3])) * 100);
    });
  });
});

it('prices print with two places when they have tetri', () => {
  for (const n of [sub('u08-01')[0]!, sub('u08-03')[2]!]) {
    eachDraw(id(n), (d) => expect(d.prompt, d.prompt).not.toMatch(/\d,\d ლარ/));
  }
});
