import { describe, expect, it } from 'vitest';
import { G6_U18_SUBTOPICS, G6_U18_TEMPLATES } from '../src/practice/templates/g6-u18-area-volume';
import { eachDraw, standardSuite } from './support/g6-harness';

/**
 * Grade VI — Unit 18: perimeter, area and volume. Every key is recomputed from the
 * numbers in the prompt with an independent formula.
 */

const id = (n: number) => `g6-u18-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U18',
  topic: 'g6-area-volume',
  subtopics: G6_U18_SUBTOPICS,
  templates: G6_U18_TEMPLATES,
  idPattern: /^g6-u18-q\d{2}$/,
});

const ungroup = (text: string): string => text.replace(/(\d)[\u2009\u00a0\u202f ](?=\d{3}(?!\d))/g, '$1');
/** Whole numbers in the prompt, before any "(π = 3,14)" note. */
const ints = (prompt: string): number[] => (ungroup(prompt.split('(π')[0]!).match(/\d+/g) ?? []).map(Number);
const val = (answer: string): number => Number(ungroup(answer).replace(',', '.').replace(/[^\d.].*$/, ''));
const near = (a: number, b: number): boolean => Math.abs(a - b) < 1e-6;
const check = (n: number, expected: (x: number[], prompt: string) => number) =>
  eachDraw(id(n), (d) => expect(val(d.answer), d.prompt).toBeCloseTo(expected(ints(d.prompt), d.prompt), 6));

const POLY: Record<string, number> = { ხუთკუთხედის: 5, ექვსკუთხედის: 6, შვიდკუთხედის: 7, რვაკუთხედის: 8, ათკუთხედის: 10 };
const REG: Record<string, number> = { ტოლგვერდა: 3, კვადრატის: 4, 'რეგულარული ხუთკუთხედის': 5, 'რეგულარული ექვსკუთხედის': 6 };
const nameIn = (prompt: string, table: Record<string, number>): number => table[Object.keys(table).find((k) => prompt.includes(k))!]!;

describe('G6 U18 — perimeter', () => {
  it('shapes', () => {
    check(1, ([a]) => 4 * a!);
    check(2, ([a, b]) => 2 * (a! + b!));
    check(3, ([a, b, c]) => a! + b! + c!);
    check(4, ([a], p) => nameIn(p, POLY) * a!);
    eachDraw(id(3), (d) => {
      const [a, b, c] = ints(d.prompt) as [number, number, number];
      expect(a + b > c && a + c > b && b + c > a, d.prompt).toBe(true);
    });
  });
  it('missing sides', () => {
    check(5, ([p, a]) => p! / 2 - a!);
    check(6, ([p], prompt) => p! / nameIn(prompt, REG));
  });
});

describe('G6 U18 — rectangle area', () => {
  it('areas and sides', () => {
    check(7, ([a, b]) => a! * b!);
    check(8, ([a]) => a! * a!);
    check(9, ([s, a]) => s! / a!);
    check(10, ([a, b]) => a! * b!);
    check(11, ([b, e]) => b! * (b! + e!));
    check(12, ([s]) => Math.sqrt(s!));
    eachDraw(id(10), (d) => expect(d.answer).toMatch(/ მ²$/));
  });
});

describe('G6 U18 — composite figures', () => {
  it('sums and cut-outs', () => {
    check(13, ([a, b]) => a! + b!);
    check(14, ([a, b, c, d]) => a! * b! + c! * d!);
    check(15, ([a, b, c, d]) => a! * b! - c! * d!);
    check(16, ([h, a, b]) => (a! + b!) * h!);
    check(17, ([a, b, c, d]) => a! * b! - c! * d!);
    check(18, ([s, a, b]) => s! * s! + a! * b!);
    eachDraw(id(15), (d) => {
      const [a, b, c, e] = ints(d.prompt) as [number, number, number, number];
      expect(c < a && e < b, d.prompt).toBe(true);
    });
  });
});

describe('G6 U18 — shaded figures', () => {
  it('whole minus hole', () => {
    check(19, ([a, c, d]) => a! * a! - c! * d!);
    check(20, ([a, b, c, d]) => a! * b! - c! * d!);
    check(21, ([a, c]) => a! * a! - c! * c!);
    check(24, ([a, b, w]) => a! * b! - (a! - 2 * w!) * (b! - 2 * w!));
  });
  it('fractions of a rectangle', () => {
    check(22, ([a, b, p, k]) => (a! * b! * p!) / k!);
    check(23, ([s, p, k]) => (s! / k!) * (k! - p!));
    for (const n of [22, 23]) {
      eachDraw(id(n), (d) => {
        const m = d.prompt.match(/(\d+)\/(\d+)/)!;
        expect(Number(m[1])).toBeLessThan(Number(m[2]));
      });
    }
    eachDraw(id(22), (d) => expect(near((ints(d.prompt)[0]! * ints(d.prompt)[1]!) % ints(d.prompt)[3]!, 0), d.prompt).toBe(true));
  });
});

describe('G6 U18 — polygons and circles', () => {
  it('areas', () => {
    check(25, ([b, h]) => (b! * h!) / 2);
    check(26, ([b, h]) => b! * h!);
    check(27, ([a, b, h]) => ((a! + b!) * h!) / 2);
    check(28, ([a, b]) => (a! * b!) / 2);
    check(29, ([s, b]) => (2 * s!) / b!);
    check(30, ([r]) => 3.14 * r! * r!);
  });
  it('trapezoid bases are ordered and the circle has two decimals at most', () => {
    eachDraw(id(27), (d) => {
      const [a, b] = ints(d.prompt) as [number, number];
      expect(a).toBeLessThan(b);
    });
    eachDraw(id(30), (d) => expect(d.answer, d.prompt).toMatch(/^\d+(,\d{1,2})? სმ²$/));
  });
});

describe('G6 U18 — equal-area figures', () => {
  it('each key reproduces the stated area', () => {
    eachDraw(id(31), (d) => {
      const [a, b] = ints(d.prompt) as [number, number];
      expect(val(d.answer) ** 2, d.prompt).toBe(a * b);
    });
    eachDraw(id(32), (d) => {
      const [b, h, l] = ints(d.prompt) as [number, number, number];
      expect(val(d.answer) * l, d.prompt).toBe((b * h) / 2);
    });
    eachDraw(id(33), (d) => {
      const [a, c] = ints(d.prompt) as [number, number];
      expect(val(d.answer) * c, d.prompt).toBe(a * a);
    });
    eachDraw(id(34), (d) => {
      const [b, h, hh] = ints(d.prompt) as [number, number, number];
      expect((val(d.answer) * hh) / 2, d.prompt).toBe(b * h);
    });
    eachDraw(id(35), (d) => {
      const [s, b] = ints(d.prompt) as [number, number];
      expect(val(d.answer) * b, d.prompt).toBe(s);
    });
    eachDraw(id(36), (d) => {
      const [a, b, h, w] = ints(d.prompt) as [number, number, number, number];
      expect(a).toBeLessThan(b);
      expect(val(d.answer) * w, d.prompt).toBe(((a + b) * h) / 2);
    });
  });
});

describe('G6 U18 — solids and nets', () => {
  const COUNTS: Array<[string, number, number, number]> = [
    ['ოთხკუთხა პრიზმ', 6, 12, 8], ['სამკუთხა პრიზმ', 5, 9, 6], ['ხუთკუთხა პრიზმ', 7, 15, 10], ['ექვსკუთხა პრიზმ', 8, 18, 12],
    ['მართკუთხა პარალელეპიპედ', 6, 12, 8], ['კუბ', 6, 12, 8],
  ];
  const row = (prompt: string) => COUNTS.find(([name]) => prompt.includes(name))!;
  it('faces, edges, vertices', () => {
    eachDraw(id(37), (d) => expect(Number(d.answer), d.prompt).toBe(row(d.prompt)[1]));
    eachDraw(id(38), (d) => expect(Number(d.answer), d.prompt).toBe(row(d.prompt)[2]));
    eachDraw(id(39), (d) => expect(Number(d.answer), d.prompt).toBe(row(d.prompt)[3]));
    eachDraw(id(42), (d) => expect(Number(d.answer), d.prompt).toBe(row(d.prompt)[1]));
  });
  it('a face of a cube and a cuboid', () => {
    check(40, ([a]) => a! * a!);
    const counts: Record<string, number> = { წახნაგი: 6, წიბო: 12, წვერო: 8 };
    eachDraw(id(41), (d) => expect(Number(d.answer), d.prompt).toBe(counts[d.prompt.match(/რამდენი (\S+) აქვს/)![1]!]));
  });
});

describe('G6 U18 — cuboid and cube', () => {
  it('volume and surface', () => {
    check(43, ([a, b, c]) => a! * b! * c!);
    check(44, ([a]) => a! ** 3);
    check(45, ([a, b, c]) => 2 * (a! * b! + b! * c! + a! * c!));
    check(46, ([a]) => 6 * a! * a!);
    check(47, ([a, b, c]) => a! * b! * c!);
    check(48, ([a, b, c]) => 2 * (a! * b! + b! * c! + a! * c!));
    eachDraw(id(45), (d) => expect(d.answer).toMatch(/ სმ²$/));
    eachDraw(id(43), (d) => expect(d.answer).toMatch(/ სმ³$/));
  });
});

describe('G6 U18 — prism volume', () => {
  it('volumes and missing factors', () => {
    check(49, ([s, h]) => s! * h!);
    check(50, ([s, h]) => s! * h!);
    check(51, ([v, s]) => v! / s!);
    check(52, ([b, m, h]) => (b! * m! * h!) / 2);
    check(53, ([v, h]) => v! / h!);
    check(54, ([a, b, h]) => a! * b! * h!);
  });
});

describe('G6 U18 — prism surface', () => {
  it('surface areas', () => {
    check(55, ([a]) => 6 * a! * a!);
    check(56, ([a, b, c]) => 2 * (a! * b! + b! * c! + a! * c!));
    check(57, ([p, s, h]) => 2 * s! + p! * h!);
    check(58, ([p, s, h]) => 2 * s! + p! * h!);
    check(59, ([s]) => Math.sqrt(s! / 6));
    check(60, ([a, b, h]) => 2 * a! * b! + 2 * (a! + b!) * h!);
  });
});

describe('G6 U18 — pyramid and cone', () => {
  const BASE: Record<string, number> = { სამკუთხა: 3, ოთხკუთხა: 4, ხუთკუთხა: 5, ექვსკუთხა: 6, შვიდკუთხა: 7, რვაკუთხა: 8 };
  it('counts', () => {
    for (const n of [61, 62]) eachDraw(id(n), (d) => expect(Number(d.answer), d.prompt).toBe(nameIn(d.prompt, BASE) + 1));
    eachDraw(id(63), (d) => {
      const question = d.prompt.split('. ').pop()!;
      const solid = d.prompt.includes('კონუს') ? 'cone' : 'cylinder';
      const expected = question.includes('ფუძე') ? (solid === 'cone' ? 1 : 2) : solid === 'cone' ? 1 : 0;
      expect(Number(d.answer), d.prompt).toBe(expected);
    });
  });
  it('volumes', () => {
    check(64, ([s, h]) => (s! * h!) / 3);
    check(65, ([r, h]) => (3.14 * r! * r! * h!) / 3);
    check(66, ([a, h]) => (a! * a! * h!) / 3);
    eachDraw(id(65), (d) => {
      const [, h] = ints(d.prompt) as [number, number];
      expect(h % 3).toBe(0);
    });
  });
});

describe('G6 U18 — other solids', () => {
  it('volumes', () => {
    check(67, ([a]) => a! ** 3);
    check(68, ([a, b, c]) => a! * b! * c!);
    check(69, ([r, h]) => 3.14 * r! * r! * h!);
    check(70, ([s, h]) => (s! * h!) / 3);
    check(71, ([a, b, c]) => a! * b! * c!);
    check(72, ([v, a, b]) => v! / (a! * b!));
  });
  it('the aquarium and the cylinder print sensibly', () => {
    eachDraw(id(71), (d) => expect(d.answer).toMatch(/^\d{1,3}( \d{3})? სმ³$|^\d+ სმ³$/));
    eachDraw(id(69), (d) => expect(d.answer).toMatch(/^[\d ]+(,\d{1,2})? სმ³$/));
  });
});
