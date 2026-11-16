import { describe, expect, it } from 'vitest';
import { G6_U12_SUBTOPICS, G6_U12_TEMPLATES } from '../src/practice/templates/g6-u12-coordinates';
import { eachDraw, standardSuite } from './support/g6-harness';

/**
 * Grade VI — Unit 12: the coordinate plane and symmetry.
 * Points are read back from the printed prompt — `A(−3;4)` — and every
 * transformation is recomputed from the coordinates.
 */

const id = (n: number) => `g6-u12-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U12',
  topic: 'g6-coordinates',
  subtopics: G6_U12_SUBTOPICS,
  templates: G6_U12_TEMPLATES,
  idPattern: /^g6-u12-q\d{2}$/,
});

type P = [number, number];
const int = (text: string): number => Number(text.replace('−', '-'));
/** Every `X(a;b)` or bare `(a;b)` in a text. */
const points = (text: string): P[] => [...text.matchAll(/(?:[A-Z]′?)?\((−?\d+);(−?\d+)\)/g)].map((m) => [int(m[1]!), int(m[2]!)]);
const pointOf = (answer: string): P => points(answer)[0]!;
const same = (a: P, b: P): boolean => a[0] === b[0] && a[1] === b[1];
const quadrant = ([x, y]: P): string => (x > 0 && y > 0 ? 'I' : x < 0 && y > 0 ? 'II' : x < 0 && y < 0 ? 'III' : 'IV');
const axis = ([x, y]: P): string => (x === 0 && y === 0 ? 'სათავეში' : x === 0 ? 'y-ღერძზე' : y === 0 ? 'x-ღერძზე' : 'არც ერთ ღერძზე');

describe('G6 U12.1 — the plane', () => {
  it('coordinates and axes', () => {
    eachDraw(id(1), (d) => expect(int(d.answer), d.prompt).toBe(points(d.prompt)[0]![0]));
    eachDraw(id(2), (d) => expect(int(d.answer), d.prompt).toBe(points(d.prompt)[0]![1]));
    for (const n of [3, 4]) eachDraw(id(n), (d) => expect(d.answer, d.prompt).toBe(axis(points(d.prompt)[0]!)));
  });
  it('distances along a grid line', () => {
    eachDraw(id(5), (d) => {
      const [a, b] = points(d.prompt) as [P, P];
      expect(a[0], d.prompt).toBe(b[0]);
      expect(int(d.answer), d.prompt).toBe(Math.abs(b[1] - a[1]));
    });
    eachDraw(id(6), (d) => {
      const [a, b] = points(d.prompt) as [P, P];
      expect(a[1], d.prompt).toBe(b[1]);
      expect(int(d.answer), d.prompt).toBe(Math.abs(b[0] - a[0]));
    });
  });
});

describe('G6 U12.2 — quadrants and axes', () => {
  it('the quadrant of a point', () => {
    eachDraw(id(7), (d) => expect(d.answer, d.prompt).toBe(`${quadrant(points(d.prompt)[0]!)} მეოთხედში`));
    eachDraw(id(9), (d) => {
      const [x, y] = (d.prompt.match(/−?\d+/g) as string[]).map(int) as number[];
      expect(d.answer, d.prompt).toBe(`${quadrant([x!, y!])} მეოთხედში`);
    });
  });
  it('the point in a given quadrant', () => {
    eachDraw(id(8), (d) => {
      const q = /მდებარეობს (I{1,3}|IV|II|III|I) მეოთხედში/.exec(d.prompt)![1]!;
      expect(quadrant(pointOf(d.answer)), d.prompt).toBe(q);
      const others = d.options.filter((o) => o !== d.answer).map((o) => quadrant(pointOf(o)));
      expect(others).not.toContain(q);
      expect(new Set(others).size).toBe(3);
    });
  });
  it('signs spelled in words', () => {
    eachDraw(id(10), (d) => {
      const [sx, sy] = [/x-კოორდინატი (\S+),/.exec(d.prompt)![1]!, /y-კოორდინატი კი (\S+)\./.exec(d.prompt)![1]!].map((w) => (w.startsWith('დადებით') ? 1 : -1)) as [number, number];
      expect(d.answer, d.prompt).toBe(`${quadrant([sx, sy])} მეოთხედში`);
    });
  });
  it('axes', () => {
    eachDraw(id(11), (d) => expect(d.answer, d.prompt).toBe(axis(points(d.prompt)[0]!)));
    eachDraw(id(12), (d) => {
      const on = /მდებარეობს ([xy])-ღერძზე/.exec(d.prompt)![1]!;
      expect(axis(pointOf(d.answer)), d.prompt).toBe(`${on}-ღერძზე`);
      const others = d.options.filter((o) => o !== d.answer).map((o) => axis(pointOf(o)));
      expect(others).not.toContain(`${on}-ღერძზე`);
    });
  });
});

describe('G6 U12.3 / U12.4 — moving a point', () => {
  const STEP: Array<[string, number, number]> = [['მარჯვნივ', 1, 0], ['მარცხნივ', -1, 0], ['ზემოთ', 0, 1], ['ქვემოთ', 0, -1]];
  const move = (prompt: string): P => {
    const [x, y] = points(prompt)[0]!;
    // Everything after the point's name is "k ერთეულით <direction>" pairs.
    const tail = prompt.slice(prompt.indexOf(')') + 1);
    let dx = 0;
    let dy = 0;
    for (const m of tail.matchAll(/(\d+) ერთეულით (მარჯვნივ|მარცხნივ|ზემოთ|ქვემოთ)/g)) {
      const [, sx, sy] = STEP.find(([w]) => w === m[2])!;
      dx += sx! * Number(m[1]);
      dy += sy! * Number(m[1]);
    }
    return [x + dx, y + dy];
  };
  it('from the origin', () => {
    eachDraw(id(13), (d) => {
      let x = 0;
      let y = 0;
      for (const m of d.prompt.matchAll(/(\d+) ერთეულით (მარჯვნივ|მარცხნივ|ზემოთ|ქვემოთ)/g)) {
        const [, sx, sy] = STEP.find(([w]) => w === m[2])!;
        x += sx! * Number(m[1]);
        y += sy! * Number(m[1]);
      }
      expect(pointOf(d.answer), d.prompt).toEqual([x, y]);
    });
  });
  it('one and two steps', () => {
    for (const n of [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]) {
      eachDraw(id(n), (d) => {
        expect(pointOf(d.answer), d.prompt).toEqual(move(d.prompt));
        const wrong = d.options.filter((o) => o !== d.answer).map(pointOf);
        for (const w of wrong) expect(same(w, pointOf(d.answer))).toBe(false);
      });
    }
  });
});

describe('G6 U12.5 — axial symmetry', () => {
  it('mirror images', () => {
    for (const n of [25, 26]) eachDraw(id(n), (d) => expect(pointOf(d.answer), d.prompt).toEqual([-points(d.prompt)[0]![0], points(d.prompt)[0]![1]]));
    for (const n of [27, 28]) eachDraw(id(n), (d) => expect(pointOf(d.answer), d.prompt).toEqual([points(d.prompt)[0]![0], -points(d.prompt)[0]![1]]));
    eachDraw(id(29), (d) => expect(pointOf(d.answer), d.prompt).toEqual([-points(d.prompt)[0]![0], -points(d.prompt)[0]![1]]));
    eachDraw(id(30), (d) => expect(pointOf(d.answer), d.prompt).toEqual([points(d.prompt)[0]![1], points(d.prompt)[0]![0]]));
  });
});

describe('G6 U12.6 — central symmetry', () => {
  it('about the origin', () => {
    for (const n of [31, 32, 33]) eachDraw(id(n), (d) => expect(pointOf(d.answer), d.prompt).toEqual([-points(d.prompt)[0]![0], -points(d.prompt)[0]![1]]));
  });
  it('the distance between a point and its image', () => {
    eachDraw(id(34), (d) => {
      const [x, y] = points(d.prompt)[0]!;
      expect(int(d.answer.split(' ')[0]!), d.prompt).toBeCloseTo(2 * Math.hypot(x, y), 9);
    });
  });
  it('about another centre, and the midpoint form', () => {
    for (const n of [35, 36]) {
      eachDraw(id(n), (d) => {
        const [p, o] = points(d.prompt) as [P, P];
        expect(pointOf(d.answer), d.prompt).toEqual([2 * o[0] - p[0], 2 * o[1] - p[1]]);
        // the centre is the midpoint of the point and its image
        const r = pointOf(d.answer);
        expect([(p[0] + r[0]) / 2, (p[1] + r[1]) / 2]).toEqual(o);
      });
    }
  });
});
