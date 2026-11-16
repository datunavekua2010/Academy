import { describe, expect, it } from 'vitest';
import { G6_U15_SUBTOPICS, G6_U15_TEMPLATES } from '../src/practice/templates/g6-u15-statistics';
import { eachDraw, standardSuite } from './support/g6-harness';

/**
 * Grade VI — Unit 15: statistics. Every data set is read back from the prompt
 * and the mean, median, mode and range are recomputed independently.
 */

const id = (n: number) => `g6-u15-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U15',
  topic: 'g6-statistics',
  subtopics: G6_U15_SUBTOPICS,
  templates: G6_U15_TEMPLATES,
  idPattern: /^g6-u15-q\d{2}$/,
});

const ungroup = (text: string): string => text.replace(/(\d)[\u2009\u00a0\u202f ](?=\d{3}(?!\d))/g, '$1');
const ints = (text: string): number[] => (ungroup(text).match(/\d+/g) ?? []).map(Number);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const mean = (xs: number[]) => sum(xs) / xs.length;
const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);
const median = (xs: number[]) => {
  const s = sorted(xs);
  const m = s.length >> 1;
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};
const modes = (xs: number[]): number[] => {
  const counts = new Map<number, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  const top = Math.max(...counts.values());
  return [...counts].filter(([, c]) => c === top).map(([x]) => x);
};
/** The data after "…: " up to the full stop or the next sentence. */
const dataOf = (prompt: string): number[] => {
  const m = ungroup(prompt).match(/:\s*((?:\d+(?:°C)?(?:, | და )?)+)/)!;
  return ints(m[1]!);
};
/** Parses `მედიანა 5; მოდა 3` into numbers by label. */
const partsOf = (answer: string): Record<string, number> =>
  Object.fromEntries(answer.split('; ').map((p) => [p.replace(/\s+\d+$/, ''), Number(p.match(/(\d+)$/)![1])]));
const val = (answer: string): number => Number(ungroup(answer).replace(/\D.*$/, ''));

describe('G6 U15 — largest, smallest, mean', () => {
  it('largest, smallest and spread', () => {
    eachDraw(id(1), (d) => expect(val(d.answer), d.prompt).toBe(Math.max(...dataOf(d.prompt))));
    eachDraw(id(2), (d) => expect(val(d.answer), d.prompt).toBe(Math.min(...dataOf(d.prompt))));
    eachDraw(id(5), (d) => expect(val(d.answer), d.prompt).toBe(Math.max(...dataOf(d.prompt)) - Math.min(...dataOf(d.prompt))));
  });
  it('arithmetic means', () => {
    for (const n of [3, 4, 6]) {
      eachDraw(id(n), (d) => {
        const xs = dataOf(d.prompt);
        expect(Number.isInteger(mean(xs)), d.prompt).toBe(true);
        expect(val(d.answer), d.prompt).toBe(mean(xs));
      });
    }
    eachDraw(id(6), (d) => expect(d.answer).toMatch(/°C$/));
  });
});

describe('G6 U15 — a missing value', () => {
  /** The stated mean first, then the known numbers (words such as "სამი" carry no digits). */
  const missing = (prompt: string, count: number): { m: number; known: number[] } => {
    const nums = ints(prompt);
    return { m: nums[0]!, known: nums.slice(1, 1 + count) };
  };
  it('three, four, five numbers with a stated mean', () => {
    eachDraw(id(7), (d) => {
      const { m, known } = missing(d.prompt, 2);
      expect(val(d.answer), d.prompt).toBe(3 * m - sum(known));
    });
    eachDraw(id(8), (d) => {
      const { m, known } = missing(d.prompt, 3);
      expect(val(d.answer), d.prompt).toBe(4 * m - sum(known));
    });
    eachDraw(id(9), (d) => {
      const { m, known } = missing(d.prompt, 4);
      expect(val(d.answer), d.prompt).toBe(5 * m - sum(known));
    });
  });
  it('a mean with a half', () => {
    eachDraw(id(10), (d) => {
      const m = Number(d.prompt.match(/(\d+),5/)![1]);
      const known = ints(d.prompt.replace(/\d+,5/, '')).slice(0, 3);
      expect(known).toHaveLength(3);
      expect(val(d.answer), d.prompt).toBe(4 * m + 2 - sum(known));
    });
  });
  it('six days of sales and the later mean', () => {
    eachDraw(id(11), (d) => {
      const [m, ...days] = ints(d.prompt);
      expect(val(d.answer), d.prompt).toBe(6 * m! - sum(days.slice(0, 5)));
    });
    eachDraw(id(12), (d) => {
      const [m, n] = ints(d.prompt) as [number, number];
      expect(val(d.answer), d.prompt).toBe(4 * n - 3 * m);
    });
  });
});

describe('G6 U15 — median and mode', () => {
  it('median', () => {
    for (const n of [13, 14]) eachDraw(id(n), (d) => expect(val(d.answer), d.prompt).toBe(median(dataOf(d.prompt))));
  });
  it('mode', () => {
    for (const n of [15, 16]) {
      eachDraw(id(n), (d) => {
        const m = modes(dataOf(d.prompt));
        expect(m, d.prompt).toHaveLength(1);
        expect(val(d.answer), d.prompt).toBe(m[0]);
      });
    }
  });
  it('median and mode together', () => {
    for (const n of [17, 18]) {
      eachDraw(id(n), (d) => {
        const xs = dataOf(d.prompt);
        const got = partsOf(d.answer);
        expect(got['მედიანა'], d.prompt).toBe(median(xs));
        expect(modes(xs), d.prompt).toEqual([got['მოდა']]);
      });
    }
  });
});

describe('G6 U15 — summary measures', () => {
  it('range', () => eachDraw(id(19), (d) => {
    const xs = dataOf(d.prompt);
    expect(val(d.answer), d.prompt).toBe(Math.max(...xs) - Math.min(...xs));
  }));
  it('mean and median; mode and range; mean, median, mode', () => {
    for (const n of [20, 22]) {
      eachDraw(id(n), (d) => {
        const xs = dataOf(d.prompt);
        const got = partsOf(d.answer);
        expect(Number.isInteger(mean(xs))).toBe(true);
        expect(got['საშუალო'], d.prompt).toBe(mean(xs));
        expect(got['მედიანა'], d.prompt).toBe(median(xs));
      });
    }
    eachDraw(id(21), (d) => {
      const xs = dataOf(d.prompt);
      const got = partsOf(d.answer);
      expect(modes(xs)).toEqual([got['მოდა']]);
      expect(got['დიაპაზონი'], d.prompt).toBe(Math.max(...xs) - Math.min(...xs));
    });
    eachDraw(id(23), (d) => {
      const xs = dataOf(d.prompt);
      const got = partsOf(d.answer);
      expect(got['უდიდესი']).toBe(Math.max(...xs));
      expect(got['უმცირესი']).toBe(Math.min(...xs));
      expect(got['დიაპაზონი']).toBe(Math.max(...xs) - Math.min(...xs));
    });
    eachDraw(id(24), (d) => {
      const xs = dataOf(d.prompt);
      const got = partsOf(d.answer);
      expect(got['საშუალო'], d.prompt).toBe(mean(xs));
      expect(got['მედიანა'], d.prompt).toBe(median(xs));
      expect(modes(xs)).toEqual([got['მოდა']]);
    });
  });
});

describe('G6 U15 — charts', () => {
  it('the tallest bar', () => {
    eachDraw(id(25), (d) => {
      const pairs = [...d.prompt.matchAll(/(\S+) — (\d+)/g)].map((m) => [m[1]!, Number(m[2])] as const);
      expect(pairs).toHaveLength(3);
      expect(d.answer, d.prompt).toBe([...pairs].sort((a, b) => b[1] - a[1])[0]![0]);
    });
  });
  it('totals', () => {
    eachDraw(id(26), (d) => expect(val(d.answer), d.prompt).toBe(sum(ints(d.prompt).slice(0, 4))));
    eachDraw(id(27), (d) => {
      const nums = [...d.prompt.matchAll(/— (\d+)/g)].map((m) => Number(m[1]));
      expect(nums).toHaveLength(4);
      expect(val(d.answer), d.prompt).toBe(sum(nums));
    });
  });
  it('the rest of a pie chart', () => {
    eachDraw(id(28), (d) => {
      const [a, b, c] = ints(d.prompt) as [number, number, number];
      expect(d.answer, d.prompt).toBe(`${100 - a - b - c}%`);
    });
  });
  it('the biggest rise', () => {
    eachDraw(id(29), (d) => {
      const t = [...d.prompt.matchAll(/(\d+)°C/g)].map((m) => Number(m[1]));
      expect(t).toHaveLength(4);
      const rises = [t[1]! - t[0]!, t[2]! - t[1]!, t[3]! - t[2]!];
      const names = ['ორშაბათსა და სამშაბათს', 'სამშაბათსა და ოთხშაბათს', 'ოთხშაბათსა და ხუთშაბათს'];
      expect(d.answer, d.prompt).toBe(`${names[rises.indexOf(Math.max(...rises))]} შორის`);
    });
  });
  it('books per pupil', () => {
    eachDraw(id(30), (d) => {
      const nums = [...d.prompt.matchAll(/— (\d+)/g)].map((m) => Number(m[1]));
      expect(nums).toHaveLength(5);
      expect(Number.isInteger(mean(nums))).toBe(true);
      expect(val(d.answer), d.prompt).toBe(mean(nums));
    });
  });
});
