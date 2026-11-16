import { describe, expect, it } from 'vitest';
import { G7_U03_SUBTOPICS, G7_U03_TEMPLATES } from '../src/practice/templates/g7-u03-sets';
import { eachDraw, standardSuite } from './support/g6-harness';

/**
 * Grade VII — Unit 3: sets. The sets are read back from the printed prompt and
 * every operation is recomputed with plain array logic.
 */

const id = (n: number) => `g7-u03-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U03',
  topic: 'g7-sets',
  subtopics: G7_U03_SUBTOPICS,
  templates: G7_U03_TEMPLATES,
  idPattern: /^g7-u03-q\d{2}$/,
  grade: 7,
});

const setsIn = (text: string): string[][] => [...text.matchAll(/\{([^{}]*,[^{}]*)\}|∅/g)].map((m) => (m[1] === undefined ? [] : m[1].split(', ')));
const parseSet = (text: string): string[] => (text === '∅' ? [] : text.slice(1, -1).split(', '));
const key = (xs: string[]): string => [...xs].sort().join(',');
const subset = (a: string[], b: string[]): boolean => a.every((x) => b.includes(x));
const uni = (a: string[], b: string[]) => [...new Set([...a, ...b])];
const inter = (a: string[], b: string[]) => a.filter((x) => b.includes(x));
const diff = (a: string[], b: string[]) => a.filter((x) => !b.includes(x));
const nums = (text: string): number[] => (text.match(/\d+/g) ?? []).map(Number);

describe('G7 U03 — independent checks', () => {
  it('subsets (u03-01)', () => {
    eachDraw(id(1), (d) => {
      const [a] = setsIn(d.prompt) as [string[]];
      expect(subset(parseSet(d.answer), a), d.prompt).toBe(true);
      expect(d.options.filter((o) => subset(parseSet(o), a)), d.prompt).toHaveLength(1);
    });
    eachDraw(id(2), (d) => {
      const [b, c] = setsIn(d.prompt) as [string[], string[]];
      expect(d.answer, d.prompt).toBe(subset(c, b) ? 'დიახ' : 'არა');
    });
    eachDraw(id(3), (d) => {
      expect(Number(d.answer), d.prompt).toBe(setsIn(d.prompt)[0]!.length);
    });
    eachDraw(id(4), (d) => {
      const [dd, e] = setsIn(d.prompt) as [string[], string[]];
      expect(d.answer, d.prompt).toBe(subset(e, dd) ? 'დიახ' : 'არა');
    });
    eachDraw(id(5), (d) => {
      const [f] = setsIn(d.prompt) as [string[]];
      const lim = nums(d.prompt.split('ყველა')[1]!)[0]!;
      expect(key(parseSet(d.answer)), d.prompt).toBe(key(f.filter((x) => Number(x) < lim)));
    });
    eachDraw(id(6), (d) => {
      const [g] = setsIn(d.prompt) as [string[]];
      expect(d.options.filter((o) => !subset(parseSet(o), g)), d.prompt).toEqual([d.answer]);
    });
  });

  it('number of subsets (u03-02) is a power of two', () => {
    for (const n of [7, 8, 9]) eachDraw(id(n), (d) => expect(Number(d.answer), d.prompt).toBe(2 ** setsIn(d.prompt)[0]!.length));
    eachDraw(id(10), (d) => expect(Number(d.answer), d.prompt).toBe(2 ** nums(d.prompt.split('შეიცავს')[1]!)[0]!));
    eachDraw(id(11), (d) => {
      if (d.prompt.includes('ცარიელ სიმრავლეს')) return expect(d.answer).toBe('1');
      expect(Number(d.answer), d.prompt).toBe(2 ** nums(d.prompt.split('შეიცავს')[1]!)[0]! - 1);
    });
    eachDraw(id(12), (d) => expect(2 ** Number(d.answer), d.prompt).toBe(nums(d.prompt.replace(/^[^\s]+/, ''))[0]));
  });

  it('union, intersection, difference and symmetric difference (u03-03 … u03-05)', () => {
    for (let n = 13; n <= 30; n += 1) {
      eachDraw(id(n), (d) => {
        const [a, b] = setsIn(d.prompt) as [string[], string[]];
        const op = ['∪', '∩', '∖', '△'].find((o) => d.prompt.includes(` ${o} `))!;
        const result = op === '∪' ? uni(a, b) : op === '∩' ? inter(a, b) : op === '∖' ? diff(a, b) : [...diff(a, b), ...diff(b, a)];
        if (d.prompt.includes('რამდენი ელემენტია')) expect(Number(d.answer), d.prompt).toBe(result.length);
        else expect(key(parseSet(d.answer)), d.prompt).toBe(key(result));
      });
    }
  });

  it('cardinality (u03-06)', () => {
    eachDraw(id(31), (d) => expect(Number(d.answer), d.prompt).toBe(setsIn(d.prompt)[0]!.length));
    eachDraw(id(32), (d) => expect(Number(d.answer), d.prompt).toBe(setsIn(d.prompt)[0]!.length));
    eachDraw(id(33), (d) => {
      const [a, b] = setsIn(d.prompt) as [string[], string[]];
      expect(Number(d.answer), d.prompt).toBe(uni(a, b).length);
    });
    eachDraw(id(34), (d) => {
      const [a, b, c] = nums(d.prompt.replace(/ორი სპორტიდან.*/, '')) as [number, number, number];
      expect(Number(d.answer), d.prompt).toBe(a + b - c);
    });
    eachDraw(id(35), (d) => {
      const [n, a, b, c] = nums(d.prompt.replace(/ამ ენებიდან.*/, '')) as [number, number, number, number];
      expect(Number(d.answer), d.prompt).toBe(n - (a + b - c));
    });
    eachDraw(id(36), (d) => {
      const [a, b] = setsIn(d.prompt) as [string[], string[]];
      expect(d.answer, d.prompt).toBe(`n(A ∪ B) = ${uni(a, b).length}, n(A ∩ B) = ${inter(a, b).length}`);
    });
  });
});
