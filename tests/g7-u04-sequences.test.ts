import { describe, expect, it } from 'vitest';
import { G7_U04_SUBTOPICS, G7_U04_TEMPLATES } from '../src/practice/templates/g7-u04-sequences';
import { eachDraw, standardSuite } from './support/g6-harness';

/**
 * Grade VII — Unit 4: sequences and progressions. Progressions are read back from
 * the printed terms; keys are rebuilt by extending the pattern term by term.
 */

const id = (n: number) => `g7-u04-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U04',
  topic: 'g7-sequences',
  subtopics: G7_U04_SUBTOPICS,
  templates: G7_U04_TEMPLATES,
  idPattern: /^g7-u04-q\d{2}$/,
  grade: 7,
});

const ORD: Record<string, number> = { პირველი: 1, მეორე: 2, მესამე: 3, მეოთხე: 4, მეხუთე: 5, მეექვსე: 6, მეშვიდე: 7, მერვე: 8, მეცხრე: 9, მეათე: 10 };
const ordinal = (word: string): number => ORD[word] ?? Number(word.replace('მე-', ''));
const ORD_RE = /(პირველი|მეორე|მესამე|მეოთხე|მეხუთე|მეექვსე|მეშვიდე|მერვე|მეცხრე|მეათე|მე-\d+)/g;
const ordinals = (text: string): number[] => (text.match(ORD_RE) ?? []).map(ordinal);
/** Signed whole numbers, `−` as minus, thin-space groups removed. */
const ns = (text: string): number[] => (text.replace(/(\d)[\u2009\u00a0\u202f ](?=\d{3}(?!\d))/g, '$1').match(/\u2212?\d+/g) ?? []).map((x) => Number(x.replace('\u2212', '-')));
const num = (text: string): number => Number(text.replace(/\s/g, '').replace('\u2212', '-'));
const list = (text: string): number[] => text.split(', ').map(num);
const shownTerms = (prompt: string): number[] => list(/: ([^…]+), …/.exec(prompt)![1]!.replace(/, $/, ''));
const SUBS = '₀₁₂₃₄₅₆₇₈₉';
const subNumber = (text: string): number => Number([...text].map((c) => SUBS.indexOf(c)).filter((d) => d >= 0).join(''));

const apN = (a: number, d: number, n: number) => a + (n - 1) * d;
const gpN = (b: number, q: number, n: number) => b * q ** (n - 1);
const apS = (a: number, d: number, n: number) => (n * (2 * a + (n - 1) * d)) / 2;
const gpS = (b: number, q: number, n: number) => Array.from({ length: n }, (_, i) => gpN(b, q, i + 1)).reduce((x, y) => x + y, 0);
const nextByDifferences = (xs: number[]): number => {
  const rows: number[][] = [xs];
  while (rows[rows.length - 1]!.some((x) => x !== rows[rows.length - 1]![0]) && rows.length < xs.length) {
    const last = rows[rows.length - 1]!;
    rows.push(last.slice(1).map((x, i) => x - last[i]!));
  }
  return rows.reduce((sum, row) => sum + row[row.length - 1]!, 0);
};
const ratio = (xs: number[]): number | null => (xs.every((x, i) => i === 0 || x * xs[0]! === xs[i - 1]! * xs[1]!) ? xs[1]! / xs[0]! : null);

describe('G7 U04 — independent checks', () => {
  it('number patterns (u04-01)', () => {
    eachDraw(id(1), (d) => {
      const t = shownTerms(d.prompt);
      const step = t[1]! - t[0]!;
      expect(d.answer, d.prompt).toBe(`${t[3]! + step}, ${t[3]! + 2 * step}`);
    });
    eachDraw(id(2), (d) => expect(num(d.answer), d.prompt).toBe(nextByDifferences(shownTerms(d.prompt))));
    eachDraw(id(3), (d) => {
      const parts = d.prompt.replace(/^[^:]*: /, '').replace(/\.$/, '').split(', ');
      const gap = parts.indexOf('□');
      const known = parts.map((x, i) => (i === gap ? NaN : num(x)));
      const step = gap >= 2 ? known[1]! - known[0]! : known[4]! - known[3]!;
      const step2 = (known[4]! - known[gap === 0 ? 1 : 0]!) / (4 - (gap === 0 ? 1 : 0));
      expect(step, d.prompt).toBe(step2);
      expect(num(d.answer), d.prompt).toBe(known[gap - 1]! + step);
    });
    eachDraw(id(4), (d) => {
      const t = shownTerms(d.prompt);
      const r = ratio(t);
      expect(num(d.answer), d.prompt).toBe(r ? t[4]! * r : nextByDifferences(t));
    });
    eachDraw(id(5), (d) => {
      const [a, step] = ns(d.prompt) as [number, number];
      expect(num(d.answer), d.prompt).toBe(apN(a, step, ordinals(d.prompt.split('იპოვე')[1]!)[0]!));
    });
    eachDraw(id(6), (d) => {
      const t = shownTerms(d.prompt);
      const q = t[0]! / t[1]!;
      expect(d.answer, d.prompt).toBe(`${t[3]! / q}, ${t[3]! / q / q}`);
    });
  });

  it('periodic sequences (u04-02)', () => {
    const nth = (period: string[], n: number): string => period[(n - 1) % period.length]!;
    for (const [n, len] of [[7, 3], [9, 3], [10, 3]] as const) {
      eachDraw(id(n), (d) => {
        const period = n === 10 ? /\(([^)]+)\)/.exec(d.prompt)![1]!.split(', ') : shownTerms(d.prompt).slice(0, len).map(String);
        const asked = ordinals(d.prompt).pop()!;
        expect(d.answer, d.prompt).toBe(nth(period, asked));
      });
    }
    eachDraw(id(8), (d) => {
      const period = /: ([^…]+), …/.exec(d.prompt)![1]!.split(', ');
      const half = period.slice(0, period.length / 2);
      expect(d.answer, d.prompt).toBe(nth(half, ordinals(d.prompt).pop()!));
    });
    eachDraw(id(11), (d) => {
      const period = shownTerms(d.prompt.replace(/\. რამდენჯერ.*/, '. ')).slice(0, 3);
      const [x, n] = d.prompt.replace(/^[^.]*\./, '').match(/\d+/g)!.map(Number) as [number, number];
      let count = 0;
      for (let i = 1; i <= n; i += 1) if (period[(i - 1) % 3] === x) count += 1;
      expect(Number(d.answer), d.prompt).toBe(count);
    });
    eachDraw(id(12), (d) => {
      const period = /\(([^)]+)\)/.exec(d.prompt)![1]!.split(', ');
      expect(d.answer, d.prompt).toBe(nth(period, ordinals(d.prompt).pop()!));
    });
  });

  it('arithmetic progressions (u04-03, u04-04)', () => {
    eachDraw(id(13), (d) => {
      const t = shownTerms(d.prompt);
      expect(num(d.answer), d.prompt).toBe(t[1]! - t[0]!);
      expect(t[3]! - t[2]!).toBe(t[1]! - t[0]!);
    });
    eachDraw(id(14), (d) => {
      const [a, step] = ns(d.prompt) as [number, number];
      expect(d.answer, d.prompt).toBe(Array.from({ length: 5 }, (_, i) => apN(a, step, i + 1)).map((x) => (x < 0 ? `\u2212${-x}` : String(x))).join(', '));
    });
    for (const n of [15, 18, 19, 20, 23]) {
      eachDraw(id(n), (d) => {
        const [a, step] = ns(d.prompt) as [number, number];
        expect(num(d.answer), d.prompt).toBe(apN(a, step, ordinals(d.prompt.split('იპოვე')[1]!)[0]!));
      });
    }
    for (const n of [16, 22]) {
      eachDraw(id(n), (d) => {
        const t = shownTerms(d.prompt);
        expect(num(d.answer), d.prompt).toBe(apN(t[0]!, t[1]! - t[0]!, ordinals(d.prompt.split('იპოვე')[1]!)[0]!));
      });
    }
    eachDraw(id(17), (d) => {
      const [k, k1] = ordinals(d.prompt.split('იპოვე')[0]!);
      const [x, y] = ns(d.prompt.split('იპოვე')[0]!) as [number, number];
      expect(k1).toBe(k! + 1);
      expect(num(d.answer), d.prompt).toBe(x - (k! - 1) * (y - x));
    });
    eachDraw(id(21), (d) => {
      const [p, q] = ns(d.prompt.split('n.')[0]!) as [number, number];
      expect(num(d.answer), d.prompt).toBe(p * subNumber(d.prompt) + q);
    });
    eachDraw(id(24), (d) => {
      const [q, p] = ns(d.prompt.split('n.')[0]!.replace('aₙ', '')) as [number, number];
      expect(num(d.answer), d.prompt).toBe(q - p * subNumber(d.prompt));
    });
  });

  it('arithmetic sums (u04-05)', () => {
    eachDraw(id(25), (d) => {
      const n = ns(d.prompt)[0]!;
      const total = d.prompt.includes('ნატურალური') ? (n * (n + 1)) / 2 : d.prompt.includes('ლუწი') ? n * (n + 1) : n * n;
      expect(num(d.answer), d.prompt).toBe(total);
      // check by brute force
      let sum = 0;
      for (let i = 1; i <= n; i += 1) sum += d.prompt.includes('ნატურალური') ? i : d.prompt.includes('ლუწი') ? 2 * i : 2 * i - 1;
      expect(num(d.answer), d.prompt).toBe(sum);
    });
    for (const n of [26, 30]) {
      eachDraw(id(n), (d) => {
        const [head, tail] = d.prompt.split('წევრი —') as [string, string];
        const a = ns(head)[0]!;
        const last = ns(tail.split('.')[0]!)[0]!;
        const m = ns(d.prompt.split('იპოვე')[1]!)[0]!;
        expect(ordinals(head.replace('პირველი წევრია', '')).pop()!).toBe(m);
        expect(num(d.answer), d.prompt).toBe((m * (a + last)) / 2);
      });
    }
    eachDraw(id(27), (d) => {
      const n = ns(d.prompt.split(':')[0]!)[0]!;
      const t = shownTerms(d.prompt);
      expect(num(d.answer), d.prompt).toBe(apS(t[0]!, t[1]! - t[0]!, n));
    });
    for (const n of [28, 29]) {
      eachDraw(id(n), (d) => {
        const nums = ns(d.prompt);
        const [a, step, cnt] = n === 28 ? [nums[0]!, nums[1]!, nums[2]!] : [nums[1]!, nums[2]!, nums[0]!];
        expect(num(d.answer), d.prompt).toBe(apS(a, step, cnt));
      });
    }
  });

  it('geometric progressions (u04-06, u04-07)', () => {
    eachDraw(id(31), (d) => {
      const t = shownTerms(d.prompt);
      expect(num(d.answer), d.prompt).toBe(t[1]! / t[0]!);
    });
    eachDraw(id(32), (d) => {
      const [b, q, n] = ns(d.prompt) as [number, number, number];
      expect(list(d.answer), d.prompt).toEqual(Array.from({ length: n }, (_, i) => gpN(b, q, i + 1)));
    });
    eachDraw(id(33), (d) => {
      const [b, , p] = ns(d.prompt.replace(/\d+\/\d+/, (m) => m.replace('/', ' '))) as [number, number, number];
      const n = ordinals(d.prompt.split('იპოვე')[1]!)[0]!;
      expect(num(d.answer), d.prompt).toBe(b / p ** (n - 1));
    });
    for (const n of [34]) {
      eachDraw(id(n), (d) => {
        const t = shownTerms(d.prompt);
        expect(num(d.answer), d.prompt).toBe(gpN(t[0]!, t[1]! / t[0]!, ordinals(d.prompt.split('იპოვე')[1]!)[0]!));
      });
    }
    eachDraw(id(35), (d) => {
      const [b, q] = ns(d.prompt) as [number, number];
      expect(num(d.answer), d.prompt).toBe(gpN(b, q, ordinals(d.prompt.split('იპოვე')[1]!)[0]!));
    });
    eachDraw(id(36), (d) => {
      const [c, p] = ns(d.prompt.split('=')[1]!.split('ⁿ')[0]!) as [number, number];
      expect(num(d.answer), d.prompt).toBe(c * p ** (subNumber(d.prompt.split('იპოვე')[1]!) - 1));
    });
    for (const n of [37, 39, 41]) {
      eachDraw(id(n), (d) => {
        const t = shownTerms(d.prompt.replace(/\.$/, ', …'));
        const count = ns(d.prompt.split(':')[0]!)[0]!;
        expect(t.length).toBe(count);
        expect(num(d.answer), d.prompt).toBe(t.reduce((x, y) => x + y, 0));
      });
    }
    for (const n of [38, 40]) {
      eachDraw(id(n), (d) => {
        const [b, q, cnt] = ns(d.prompt) as [number, number, number];
        expect(num(d.answer), d.prompt).toBe(gpS(b, q, cnt));
      });
    }
    eachDraw(id(42), (d) => {
      const [b, , p, cnt] = ns(d.prompt.replace(/(\d+)\/(\d+)/, '$1 $2')) as [number, number, number, number];
      let sum = 0;
      for (let i = 0; i < cnt; i += 1) sum += b / p ** i;
      expect(num(d.answer), d.prompt).toBe(sum);
    });
  });
});
