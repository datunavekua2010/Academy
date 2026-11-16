import { describe, expect, it } from 'vitest';
import { G7_U07_SUBTOPICS, G7_U07_TEMPLATES } from '../src/practice/templates/g7-u07-equations';
import { eachDraw, standardSuite } from './support/g6-harness';
import { RANGE, answerHolds, compile, holds, solutionSet } from './support/g7-expr';

/**
 * Grade VII — Unit 7: equations and inequalities. The solution set is found by
 * brute force over −80…80: every integer is tried in the printed task and in
 * the printed key, and the two sets must be the same. Roots and bounds are
 * whole numbers, so strict and non-strict signs are told apart.
 */

const id = (n: number) => `g7-u07-q${String(n).padStart(2, '0')}`;

standardSuite({
  unit: 'U07',
  topic: 'g7-equations',
  subtopics: G7_U07_SUBTOPICS,
  templates: G7_U07_TEMPLATES,
  idPattern: /^g7-u07-q\d{2}$/,
  grade: 7,
});

const taskText = (prompt: string): string => prompt.replace(/^[^:]*: /, '').replace(/\.( რამდენი.*| ჩაწერე.*)?$/, '');
const variableOf = (answer: string): string => /[a-z]/.exec(answer)![0]!;
const rangeOf = (ids: number[], check: (n: number) => void): void => ids.forEach(check);

/** The integers of −80…80 that satisfy a printed task. */
const taskSet = (text: string, name: string): number[] => solutionSet((x) => holds(text, x, name));
/** The same for a printed key. */
const keySet = (answer: string, name: string): number[] => solutionSet((x) => answerHolds(answer, x, name));
/** `a და b` → both hold. */
const bothSet = (text: string, name: string): number[] => {
  const parts = text.split(' და ');
  return solutionSet((x) => parts.every((p) => holds(p, x, name)));
};

describe('G7 U07 — independent checks', () => {
  it('the solver reads the notation', () => {
    expect(taskSet('2x + 4 = 10', 'x')).toEqual([3]);
    expect(taskSet('|x − 2| ≤ 1', 'x')).toEqual([1, 2, 3]);
    expect(keySet('x ≤ −78 ან x ≥ 79', 'x').length).toBe(5);
    expect(keySet('x ∈ [−1; 1)', 'x')).toEqual([-1, 0]);
    expect(taskSet('1 < 2x + 1 ≤ 9', 'x')).toEqual([1, 2, 3, 4]);
  });

  it('linear and equivalent equations (u07-01, u07-02)', () => {
    rangeOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (n) => {
      eachDraw(id(n), (d) => {
        const text = n === 7 ? d.prompt.split(' გარდაქმენი')[0]!.replace(/^განტოლება /, '') : taskText(d.prompt);
        const name = variableOf(d.answer);
        expect(taskSet(text, name), d.prompt).toEqual(keySet(d.answer, name));
        expect(taskSet(text, name)).toHaveLength(1);
      });
    });
  });

  it('the number of solutions (u07-02)', () => {
    eachDraw(id(12), (d) => {
      const text = taskText(d.prompt);
      const name = /[a-z]/.exec(text)![0]!;
      const count = taskSet(text, name).length;
      const expected = count === RANGE.length ? 'უსასრულოდ ბევრი' : count === 0 ? 'არცერთი' : count === 1 ? 'ერთი' : 'ორი';
      expect(d.answer, d.prompt).toBe(expected);
    });
  });

  it('equations with a modulus (u07-03)', () => {
    rangeOf([13, 14, 15, 16, 17, 18], (n) => {
      eachDraw(id(n), (d) => {
        const name = variableOf(d.answer);
        expect(taskSet(taskText(d.prompt), name), d.prompt).toEqual(keySet(d.answer, name));
      });
    });
    eachDraw(id(18), (d) => expect(d.answer).not.toContain('ან'));
  });

  it('systems of two equations (u07-04, u07-05)', () => {
    rangeOf([19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30], (n) => {
      eachDraw(id(n), (d) => {
        const [first, second] = taskText(d.prompt).split(' და ') as [string, string];
        const [xs, ys] = d.answer.split(', ') as [string, string];
        const x = Number(xs.replace('x = ', '').replace('\u2212', '-'));
        const y = Number(ys.replace('y = ', '').replace('\u2212', '-'));
        const sides = (eq: string) => eq.split(' = ').map(compile) as [ReturnType<typeof compile>, ReturnType<typeof compile>];
        const [f1, f2] = [sides(first), sides(second)];
        const ok = (eqs: ReturnType<typeof sides>, px: number, py: number): boolean => eqs[0]({ x: px, y: py }) === eqs[1]({ x: px, y: py });
        expect(ok(f1, x, y) && ok(f2, x, y), d.prompt).toBe(true);
        // the solution is the only one on a grid
        let count = 0;
        for (let px = -50; px <= 50; px += 1) for (let py = -50; py <= 50; py += 1) if (ok(f1, px, py) && ok(f2, px, py)) count += 1;
        expect(count, d.prompt).toBe(1);
      });
    });
  });

  it('quadratic equations (u07-06)', () => {
    rangeOf([31, 32, 33, 34, 35, 36], (n) => {
      eachDraw(id(n), (d) => {
        const name = variableOf(d.answer);
        expect(taskSet(taskText(d.prompt), name), d.prompt).toEqual(keySet(d.answer, name));
      });
    });
  });

  it('linear inequalities (u07-07)', () => {
    rangeOf([37, 38, 39, 40, 41, 42], (n) => {
      eachDraw(id(n), (d) => {
        const name = variableOf(d.answer);
        const expected = taskSet(taskText(d.prompt), name);
        expect(expected.length).toBeGreaterThan(0);
        expect(expected, d.prompt).toEqual(keySet(d.answer, name));
      });
    });
  });

  it('inequalities with a modulus (u07-08)', () => {
    rangeOf([43, 44, 45, 46, 47, 48], (n) => {
      eachDraw(id(n), (d) => {
        const name = variableOf(d.answer);
        expect(taskSet(taskText(d.prompt), name), d.prompt).toEqual(keySet(d.answer, name));
      });
    });
  });

  it('systems of inequalities (u07-09)', () => {
    rangeOf([49, 50, 51, 52, 53, 54], (n) => {
      eachDraw(id(n), (d) => {
        const text = taskText(d.prompt);
        const name = /[a-z]/.exec(text)![0]!;
        expect(bothSet(text, name), d.prompt).toEqual(keySet(d.answer, name));
      });
    });
    eachDraw(id(51), (d) => expect(d.answer).toBe('ამონახსნი არ აქვს'));
  });

  it('double inequalities (u07-10)', () => {
    rangeOf([55, 56, 57, 58, 59, 60], (n) => {
      eachDraw(id(n), (d) => {
        const text = taskText(d.prompt);
        const name = /[a-z]/.exec(d.answer)![0]!;
        expect(taskSet(text, name), d.prompt).toEqual(keySet(d.answer, name));
      });
    });
  });
});
