import { describe, expect, it } from 'vitest';
import { G7_U10_SUBTOPICS, G7_U10_TEMPLATES } from '../src/practice/templates/g7-u10-number-line';
import { eachDraw, standardSuite, type Draw } from './support/g6-harness';

/**
 * Grade VII — Unit 10: the number line and the coordinate plane. Intervals and
 * points are parsed out of the printed task and every key is rebuilt: interval
 * answers are compared as sets on a half-integer grid, point answers by plain
 * arithmetic on the printed coordinates.
 */

const id = (n: number) => `g7-u10-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U10',
  topic: 'g7-number-line',
  subtopics: G7_U10_SUBTOPICS,
  templates: G7_U10_TEMPLATES,
  idPattern: /^g7-u10-q\d{2}$/,
  grade: 7,
});

// ───────────────────────────── parsing ─────────────────────────────
const num = (s: string): number => {
  const text = s.replace('−', '-').replace('+', '');
  return text === '-∞' ? -Infinity : text === '∞' ? Infinity : Number(text);
};
const END = '(−?\\d+|[+−]?∞)';
type Iv = { lo: number; hi: number; lc: boolean; rc: boolean };
const intervalsIn = (text: string): Iv[] =>
  [...text.matchAll(new RegExp(`([\\[(])${END}; ${END}([\\])])`, 'g'))].map((m) => ({ lo: num(m[2]!), hi: num(m[3]!), lc: m[1] === '[', rc: m[4] === ']' }));
const inIv = (i: Iv, x: number): boolean => (x > i.lo || (i.lc && x === i.lo)) && (x < i.hi || (i.rc && x === i.hi));
const GRID = Array.from({ length: 121 }, (_, k) => (k - 60) / 2);
/** A set from a key text: intervals joined by ∪, ∅ or a one-point set. */
const setOf = (text: string): ((x: number) => boolean) => {
  if (text === '∅') return () => false;
  const point = /^\{(−?\d+)\}$/.exec(text);
  if (point) return (x) => x === num(point[1]!);
  const ivs = intervalsIn(text);
  expect(ivs.length, text).toBeGreaterThan(0);
  return (x) => ivs.some((i) => inIv(i, x));
};
const sameSet = (a: (x: number) => boolean, b: (x: number) => boolean, label: string): void => {
  for (const x of GRID) expect(a(x), `${label} at ${x}`).toBe(b(x));
};
const ints = (text: string): number[] => (text.match(/−?\d+/g) ?? []).map(num);
const pts = (text: string): Array<[number, number]> => [...text.matchAll(/[A-Z]′?\((−?\d+); (−?\d+)\)/g)].map((m) => [num(m[1]!), num(m[2]!)]);
const ptKey = (text: string): [number, number] => {
  const m = /^\((−?\d+); (−?\d+)\)$/.exec(text)!;
  return [num(m[1]!), num(m[2]!)];
};
const each = (n: number, check: (d: Draw) => void): void => eachDraw(id(n), check);

/** Draws a set of values out of a relation `a op x op b`. */
const inequalitySet = (lo: number, op1: string, op2: string, hi: number): ((x: number) => boolean) => (x) => (op1 === '≤' ? x >= lo : x > lo) && (op2 === '≤' ? x <= hi : x < hi);

describe('G7 U10 — intervals', () => {
  it('u10-01', () => {
    each(1, (d) => {
      const m = /(−?\d+) (<|≤) \S (<|≤) (−?\d+)/.exec(d.prompt)!;
      sameSet(setOf(d.answer), inequalitySet(num(m[1]!), m[2]!, m[3]!, num(m[4]!)), d.prompt);
      expect(new Set(d.options.map((o) => intervalsIn(o)[0]!.lc + '' + intervalsIn(o)[0]!.rc)).size).toBe(4);
    });
    each(2, (d) => {
      const [i] = intervalsIn(d.prompt);
      const m = /^(−?\d+) (<|≤) x (<|≤) (−?\d+)$/.exec(d.answer)!;
      sameSet(inequalitySet(num(m[1]!), m[2]!, m[3]!, num(m[4]!)), (x) => inIv(i!, x), d.prompt);
    });
    each(3, (d) => {
      const [i] = intervalsIn(d.prompt);
      const x = num(/რიცხვი (−?\d+) /.exec(d.prompt)![1]!);
      expect(d.answer, d.prompt).toBe(inIv(i!, x) ? 'დიახ' : 'არა');
    });
    each(4, (d) => {
      const [i] = intervalsIn(d.prompt);
      const inside = d.options.filter((o) => inIv(i!, num(o)));
      expect(inside, d.prompt).toEqual([d.answer]);
    });
    each(5, (d) => {
      const m = /(\S) (>|≥|<|≤) (−?\d+)\.$/.exec(d.prompt)!;
      const a = num(m[3]!);
      const test: Record<string, (x: number) => boolean> = { '>': (x) => x > a, '≥': (x) => x >= a, '<': (x) => x < a, '≤': (x) => x <= a };
      sameSet(setOf(d.answer), test[m[2]!]!, d.prompt);
      for (const o of d.options.filter((o) => o !== d.answer)) expect(GRID.some((x) => setOf(o)(x) !== test[m[2]!]!(x)), o).toBe(true);
    });
    each(6, (d) => {
      const [i] = intervalsIn(d.prompt);
      const expected = Array.from({ length: 41 }, (_, k) => k - 20).filter((x) => inIv(i!, x));
      expect(ints(d.answer), d.prompt).toEqual(expected);
    });
  });

  it('u10-02 — intersections and unions', () => {
    const both = (d: Draw, op: 'and' | 'or'): void => {
      const [p, q] = intervalsIn(d.prompt);
      const expected = (x: number): boolean => (op === 'and' ? inIv(p!, x) && inIv(q!, x) : inIv(p!, x) || inIv(q!, x));
      sameSet(setOf(d.answer), expected, d.prompt);
      for (const o of d.options.filter((o) => o !== d.answer)) {
        let differs = false;
        try {
          differs = GRID.some((x) => setOf(o)(x) !== expected(x));
        } catch {
          differs = true;
        }
        expect(differs, `${d.prompt} → ${o}`).toBe(true);
      }
    };
    for (const n of [7, 8, 10, 12]) each(n, (d) => both(d, 'and'));
    for (const n of [9, 11]) each(n, (d) => both(d, 'or'));
  });
});

describe('G7 U10 — the plane', () => {
  it('quadrants and axes (u10-03)', () => {
    const quads: Record<string, string> = { '++': 'I', '-+': 'II', '--': 'III', '+-': 'IV' };
    for (const n of [13, 14, 15, 16]) {
      each(n, (d) => {
        const [[x, y]] = pts(d.prompt) as [[number, number]];
        expect(d.answer, d.prompt).toBe(`${quads[`${x > 0 ? '+' : '-'}${y > 0 ? '+' : '-'}`]} მეოთხედში`);
      });
    }
    each(17, (d) => {
      const [[x, y]] = pts(d.prompt) as [[number, number]];
      expect(x).toBe(0);
      expect(y).not.toBe(0);
      expect(d.answer).toBe('y-ღერძზე');
    });
    each(18, (d) => {
      const [[x, y]] = pts(d.prompt) as [[number, number]];
      expect(y).toBe(0);
      expect(x).not.toBe(0);
      expect(d.answer).toBe('x-ღერძზე');
    });
  });

  it('coordinates (u10-04)', () => {
    each(19, (d) => {
      const [x, y] = ints(/აბსცისაა (−?\d+), ხოლო ორდინატა — (−?\d+)/.exec(d.prompt)!.slice(1).join(' '));
      expect(ptKey(d.answer)).toEqual([x, y]);
    });
    each(20, (d) => expect(num(d.answer), d.prompt).toBe(pts(d.prompt)[0]![0]));
    each(21, (d) => expect(num(d.answer), d.prompt).toBe(pts(d.prompt)[0]![1]));
    each(22, (d) => expect(ptKey(d.answer), d.prompt).toEqual([ints(d.prompt)[0], 0]));
    each(23, (d) => expect(ptKey(d.answer), d.prompt).toEqual([0, ints(d.prompt)[0]]));
    each(24, (d) => {
      const m = /\((.+); (.+)\) მდებარეობს (x|y)-ღერძზე/.exec(d.prompt)!;
      const expr = m[3] === 'x' ? m[2]! : m[1]!;
      // the coordinate on the axis is `k + a`, `k − a` or `k`; the key makes it zero
      const e = /^k(?: ([+−]) (\d+))?$/.exec(expr)!;
      const a = e[1] ? (e[1] === '+' ? 1 : -1) * Number(e[2]) : 0;
      expect(d.answer, d.prompt).toBe(`k = ${a === 0 ? '0' : a > 0 ? `−${a}` : String(-a)}`);
    });
  });

  it('distances (u10-05)', () => {
    each(25, (d) => expect(num(d.answer), d.prompt).toBe(Math.abs(ints(d.prompt.replace(/[A-Z]\(/g, '('))[1]! - ints(d.prompt.replace(/[A-Z]\(/g, '('))[0]!)));
    each(26, (d) => {
      const [a, b] = ints(d.prompt.replace(/[A-Z]\(/g, '('));
      expect(num(d.answer), d.prompt).toBe(Math.abs(b! - a!));
    });
    each(27, (d) => {
      const [[x1, y1], [x2, y2]] = pts(d.prompt) as [[number, number], [number, number]];
      expect(y1).toBe(y2);
      expect(num(d.answer), d.prompt).toBe(Math.abs(x2 - x1));
    });
    each(28, (d) => {
      const [[x1, y1], [x2, y2]] = pts(d.prompt) as [[number, number], [number, number]];
      expect(x1).toBe(x2);
      expect(num(d.answer), d.prompt).toBe(Math.abs(y2 - y1));
    });
    for (const n of [29, 30]) {
      each(n, (d) => {
        const [[x1, y1], [x2, y2]] = pts(d.prompt) as [[number, number], [number, number]];
        const sq = (x2 - x1) ** 2 + (y2 - y1) ** 2;
        expect(num(d.answer) ** 2, d.prompt).toBe(sq);
      });
    }
  });

  it('midpoints (u10-06)', () => {
    for (const n of [31, 35]) {
      each(n, (d) => {
        const [a, b] = ints(d.prompt.replace(/[A-Z]\(/g, '('));
        expect(Math.abs(a! + b!) % 2).toBe(0);
        expect(num(d.answer), d.prompt).toBe((a! + b!) / 2);
      });
    }
    for (const n of [32, 33, 36]) {
      each(n, (d) => {
        const [[x1, y1], [x2, y2]] = pts(d.prompt) as [[number, number], [number, number]];
        expect(ptKey(d.answer), d.prompt).toEqual([(x1 + x2) / 2, (y1 + y2) / 2]);
      });
    }
    each(34, (d) => {
      const [[mx, my], [ax, ay]] = pts(d.prompt) as [[number, number], [number, number]];
      const [bx, by] = ptKey(d.answer);
      expect([(ax + bx) / 2, (ay + by) / 2], d.prompt).toEqual([mx, my]);
    });
  });

  it('symmetry (u10-07)', () => {
    each(37, (d) => { const [[x, y]] = pts(d.prompt) as [[number, number]]; expect(ptKey(d.answer)).toEqual([-x, -y]); });
    each(38, (d) => { const [[x, y]] = pts(d.prompt) as [[number, number]]; expect(ptKey(d.answer)).toEqual([-x, y]); });
    each(39, (d) => { const [[x, y]] = pts(d.prompt) as [[number, number]]; expect(ptKey(d.answer)).toEqual([x, -y]); });
    each(40, (d) => {
      const [[x, y]] = pts(d.prompt) as [[number, number]];
      expect(ptKey(d.answer), d.prompt).toEqual(/ x-ღერძის მიმართ/.test(d.prompt) ? [x, -y] : [-x, y]);
    });
    each(41, (d) => { const [[x, y]] = pts(d.prompt) as [[number, number]]; expect(ptKey(d.answer)).toEqual([-x, -y]); });
    each(42, (d) => {
      const [[x, y]] = pts(d.prompt) as [[number, number]];
      const viaX = / x-ღერძის მიმართ/.test(d.prompt);
      const [nx, ny] = viaX ? [x, -y] : [-x, y];
      expect(num(d.answer), d.prompt).toBe(/ორდინატა\.$/.test(d.prompt) ? ny : nx);
    });
  });

  it('translation (u10-08)', () => {
    const word = (text: string, a: string, b: string): number => (text.includes(a) ? 1 : text.includes(b) ? -1 : 0);
    for (const n of [43, 44, 48]) {
      each(n, (d) => {
        const [[x, y]] = pts(d.prompt) as [[number, number]];
        const [a, b] = ints(d.prompt.replace(/[A-Z]\(.*?\)/, ''));
        const sx = word(d.prompt, 'მარჯვნივ', 'მარცხნივ');
        const sy = word(d.prompt, 'ზემოთ', 'ქვემოთ');
        expect(ptKey(d.answer), d.prompt).toEqual([x + sx * a!, y + sy * b!]);
      });
    }
    for (const n of [45, 46]) {
      each(n, (d) => {
        const [[x, y], [vx, vy]] = pts(d.prompt.replace('ვექტორით ', 'K')) as [[number, number], [number, number]];
        expect(ptKey(d.answer), d.prompt).toEqual([x + vx, y + vy]);
      });
    }
    each(47, (d) => {
      const [[x, y], [x2, y2]] = pts(d.prompt) as [[number, number], [number, number]];
      const [a, b] = ints(d.answer);
      expect([x + (d.answer.includes('მარჯვნივ') ? a! : -a!), y + (d.answer.includes('ზემოთ') ? b! : -b!)], d.prompt).toEqual([x2, y2]);
    });
  });
});

// keep the unused-helper guard honest
it('helpers behave', () => {
  expect(num('−3')).toBe(-3);
  expect(intervalsIn('(−∞; −8]')[0]).toEqual({ lo: -Infinity, hi: -8, lc: false, rc: true });
});
