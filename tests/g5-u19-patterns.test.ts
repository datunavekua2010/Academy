import { describe, expect, it } from 'vitest';
import { G5_U19_SUBTOPICS, G5_U19_TEMPLATES } from '../src/practice/templates/g5-u19-patterns';
import { generateBatch, previewTemplate } from '../src/practice/generator';

/**
 * Grade V — Unit 19: patterns and logic.
 *
 * A pattern unit fails differently from the others. Nothing here is hard to
 * compute, so a slip in the key shows up as a *sentence that is not true*: an
 * odd-one-out row in which all four numbers share the property, a sequence that
 * breaks its own step, a grid move that walks off the board, an age puzzle whose
 * answer is negative.
 *
 * The tests therefore do not re-evaluate the template's formula. They re-check
 * the *invariant the question claims* against the printed prompt — which is the
 * only thing a student can see — and they check it on every row the variables
 * can produce, not only on a sample.
 */

const TOPIC = 'g5-patterns-logic';

/** The literal `spec` rows a template can draw from. */
const specRows = (id: string): string[] => {
  const template = G5_U19_TEMPLATES.find((entry) => entry.id === id);
  if (!template) throw new Error(`no template ${id}`);
  const literal = Object.values(template.variables).find(
    (variable) => typeof (variable as { values: unknown }).values !== 'function',
  ) as { values: string[] };
  return literal.values.map(String);
};

const parseCell = (label: string): { column: number; row: number } => ({
  column: label.charCodeAt(0) - 65,
  row: Number(label[1]) - 1,
});

const onBoard = (cell: { column: number; row: number }): boolean =>
  cell.column >= 0 && cell.column <= 5 && cell.row >= 0 && cell.row <= 5;

describe('G5 U19 — library shape', () => {
  it('covers every subtopic of the unit', () => {
    expect(G5_U19_SUBTOPICS).toHaveLength(12);
    const templated = new Set(G5_U19_TEMPLATES.map((template) => template.subtopicId));
    for (const subtopicId of G5_U19_SUBTOPICS) {
      expect(templated.has(subtopicId), `${subtopicId} has no templates`).toBe(true);
    }
  });

  it('addresses the patterns topic only, under grade 5', () => {
    for (const template of G5_U19_TEMPLATES) {
      expect(template.grade, template.id).toBe(5);
      expect(template.topicId, template.id).toBe(TOPIC);
      expect(G5_U19_SUBTOPICS, template.id).toContain(template.subtopicId);
      expect(template.id, template.id).toMatch(/^g5-u19-q\d{2}$/);
    }
  });

  it('has unique ids', () => {
    const ids = G5_U19_TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('G5 U19 — every template renders a usable question', () => {
  for (const template of G5_U19_TEMPLATES) {
    it(`${template.id} keeps its promises`, () => {
      const draws = previewTemplate(template.id, 25);
      expect(draws.length, `${template.id}: too few usable draws`).toBeGreaterThan(0);
      const optionCount = template.optionCount ?? 4;

      for (const draw of draws) {
        expect(draw.options.length, `${template.id}: option count`).toBe(optionCount);
        expect(new Set(draw.options).size, `${template.id}: duplicate option`).toBe(draw.options.length);
        expect(draw.options, `${template.id}: answer missing`).toContain(draw.answer);
        expect(draw.explanation, `${template.id}: explanation omits its answer`).toContain(draw.answer);
        expect(draw.prompt, `${template.id}: unresolved placeholder`).not.toMatch(/\{\w+\}/);
        // A dot decimal would mean a fraction escaped into a Grade-V answer.
        expect(draw.answer, `${template.id}: dot decimal`).not.toMatch(/\d\.\d/);
      }
    });
  }
});

describe('G5 U19 — a session can be filled without repeating', () => {
  for (const subtopicId of G5_U19_SUBTOPICS) {
    it(`${subtopicId} yields 12 distinct questions`, () => {
      const batch = generateBatch({ grade: 5, topicId: TOPIC, subtopicId }, 12, { seed: 20260119 });
      expect(batch.length).toBe(12);
      expect(new Set(batch.map((question) => question.signature)).size).toBe(12);
    });
  }
});

describe('G5 U19 — every odd-one-out row really has exactly one odd number', () => {
  it('splits a multiples row three-to-one', () => {
    for (const row of specRows('g5-u19-q01')) {
      const fields = row.split('|');
      const step = Number(fields[0]);
      const numbers = fields.slice(1, 4).map(Number);
      const outliers = numbers.filter((n) => n % step !== 0);
      expect(outliers.length, `${row}: ${outliers.length} outliers`).toBe(1);
    }
  });

  it('splits an odd/even row three-to-one', () => {
    for (const row of specRows('g5-u19-q02')) {
      const numbers = row.split('|').map(Number);
      expect(numbers, row).toHaveLength(4);
      expect(numbers.filter((n) => n % 2 === 0).length, row).toBe(1);
    }
  });

  it('keeps the first three on one step and the fourth off it', () => {
    for (const row of specRows('g5-u19-q03')) {
      const [a, b, c, d] = row.split('|').map(Number);
      const step = b! - a!;
      expect(step, row).toBeGreaterThan(0);
      expect(b! - a!, row).toBe(step);
      expect(c! - b!, row).toBe(step);
      expect(d! - c!, row).not.toBe(step);
    }
  });

  it('splits a shared-digit row three-to-one', () => {
    for (const row of specRows('g5-u19-q04')) {
      const [digit, ...numbers] = row.split('|');
      expect(numbers, row).toHaveLength(4);
      expect(numbers.filter((n) => n!.includes(digit!)).length, row).toBe(3);
    }
  });

  it('splits a shared-remainder row three-to-one', () => {
    for (const row of specRows('g5-u19-q05')) {
      const [divisor, ...numbers] = row.split('|').map(Number);
      const counts = new Map<number, number>();
      for (const n of numbers) counts.set(n! % divisor!, (counts.get(n! % divisor!) ?? 0) + 1);
      const frequencies = [...counts.values()].sort((a, b) => b - a);
      expect(frequencies, row).toEqual([3, 1]);
    }
  });
});

describe('G5 U19 — a sequence keeps its own rule', () => {
  it('adds a constant step', () => {
    for (const row of specRows('g5-u19-q06')) {
      const [start, step] = row.split('|').map(Number);
      expect(step, row).toBeGreaterThan(0);
      expect(start, row).toBeGreaterThanOrEqual(0);
    }
  });

  it('never leaves the integers when halving', () => {
    for (const row of specRows('g5-u19-q09')) {
      const [start] = row.split('|').map(Number);
      // Four terms are shown and two more are asked for, so the *last* printed
      // term is start/8 and both answers (start/16, start/32) must be whole.
      expect(start! % 8, row).toBe(0);
      expect(start! / 8, row).toBe(Math.floor(start! / 8));
      expect(start! % 32, `${row}: the tail leaves the integers`).toBe(0);
    }
  });

  it('never produces a negative term when subtracting', () => {
    for (const row of specRows('g5-u19-q08')) {
      const [start, step] = row.split('|').map(Number);
      expect(start! - step! * 5, row).toBeGreaterThan(0);
    }
  });

  it('prints the step it claims in the explanation', () => {
    for (const draw of previewTemplate('g5-u19-q06', 15)) {
      const shown = [...draw.prompt.matchAll(/\d+/g)].map((m) => Number(m[0])).slice(0, 4);
      const step = shown[1]! - shown[0]!;
      expect(shown[2]! - shown[1]!, draw.prompt).toBe(step);
      const [first, second] = draw.answer.split(' და ').map(Number);
      expect(first! - shown[3]!, draw.prompt).toBe(step);
      expect(second! - first!, draw.prompt).toBe(step);
    }
  });

  it('doubles every term of a halving sequence backwards', () => {
    for (const draw of previewTemplate('g5-u19-q09', 15)) {
      const shown = [...draw.prompt.matchAll(/\d+/g)].map((m) => Number(m[0])).slice(0, 4);
      expect(shown[0]! / 2, draw.prompt).toBe(shown[1]);
      const [first, second] = draw.answer.split(' და ').map(Number);
      expect(shown[3]! / 2, draw.prompt).toBe(first);
      expect(first! / 2, draw.prompt).toBe(second);
    }
  });
});

describe('G5 U19 — a grid move stays on the board', () => {
  it('walks right without leaving the columns', () => {
    for (const row of specRows('g5-u19-q36')) {
      const [from, steps] = row.split('|');
      const cell = parseCell(from!);
      expect(onBoard({ column: cell.column + Number(steps), row: cell.row }), row).toBe(true);
    }
  });

  it('walks up without leaving the rows', () => {
    for (const row of specRows('g5-u19-q37')) {
      const [from, steps] = row.split('|');
      const cell = parseCell(from!);
      expect(onBoard({ column: cell.column, row: cell.row + Number(steps) }), row).toBe(true);
    }
  });

  it('walks left and down without leaving the board', () => {
    for (const row of specRows('g5-u19-q38')) {
      const [from, left, down] = row.split('|');
      const cell = parseCell(from!);
      expect(onBoard({ column: cell.column - Number(left), row: cell.row - Number(down) }), row).toBe(true);
    }
  });

  it('cancels the sideways legs of a three-leg walk', () => {
    for (const row of specRows('g5-u19-q39')) {
      const [from, right, up, left] = row.split('|');
      const cell = parseCell(from!);
      const end = { column: cell.column + Number(right) - Number(left), row: cell.row + Number(up) };
      expect(onBoard(end), row).toBe(true);
      expect(end.row, row).not.toBe(cell.row);
    }
  });

  it('columns count left to right and rows bottom to top', () => {
    for (const row of specRows('g5-u19-q40')) {
      const [from, to] = row.split('|');
      const start = parseCell(from!);
      const end = parseCell(to!);
      expect(start.row, row).toBe(end.row);
      expect(end.column, row).toBeGreaterThan(start.column);
    }
  });

  it('counts the columns between the two printed cells', () => {
    for (const draw of previewTemplate('g5-u19-q40', 15)) {
      const [from, to] = [...draw.prompt.matchAll(/[A-F][1-6]/g)].map((m) => m[0]);
      const expected = parseCell(to!)!.column - parseCell(from!)!.column;
      expect(Number(draw.answer), draw.prompt).toBe(expected);
    }
  });
});

describe('G5 U19 — a word problem asks for a quantity that exists', () => {
  it('never asks how many years ago for a difference that has not happened', () => {
    for (const id of ['g5-u19-q24']) {
      for (const draw of previewTemplate(id, 15)) {
        expect(Number(draw.answer), draw.prompt).toBeGreaterThan(0);
        const [young] = [...draw.prompt.matchAll(/(\d+) წლის/g)].map((m) => Number(m[1]));
        expect(Number(draw.answer), draw.prompt).toBeLessThan(young!);
      }
    }
  });

  it('never asks how many years ahead past the answer already being true', () => {
    for (const draw of previewTemplate('g5-u19-q25', 15)) {
      expect(Number(draw.answer), draw.prompt).toBeGreaterThan(0);
    }
  });

  it('keeps a two-digit digit puzzle in two digits', () => {
    for (const draw of previewTemplate('g5-u19-q43', 15)) {
      expect(Number(draw.answer), draw.prompt).toBeGreaterThanOrEqual(10);
      expect(Number(draw.answer), draw.prompt).toBeLessThan(100);
      const tens = Number(/ათეულის ციფრი (\d+)-ია/.exec(draw.prompt)![1]);
      const sum = Number(/ციფრთა ჯამი (\d+)-ია/.exec(draw.prompt)![1]);
      expect(Number(draw.answer), draw.prompt).toBe(tens * 10 + (sum - tens));
    }
  });

  it('keeps a digit-difference puzzle in two digits', () => {
    for (const draw of previewTemplate('g5-u19-q44', 15)) {
      const answer = Number(draw.answer);
      expect(answer, draw.prompt).toBeGreaterThanOrEqual(10);
      expect(answer, draw.prompt).toBeLessThan(100);
      const digits = [Math.floor(answer / 10), answer % 10];
      const sum = Number(/ციფრთა ჯამი (\d+)-ია/.exec(draw.prompt)![1]);
      const difference = Number(/ციფრთა სხვაობა — (\d+)/.exec(draw.prompt)![1]);
      expect(digits[0]! + digits[1]!, draw.prompt).toBe(sum);
      expect(digits[0]! - digits[1]!, draw.prompt).toBe(difference);
    }
  });

  it('keeps a three-digit puzzle in three digits and its digit sum right', () => {
    for (const draw of previewTemplate('g5-u19-q45', 15)) {
      const answer = Number(draw.answer);
      expect(answer, draw.prompt).toBeGreaterThanOrEqual(100);
      expect(answer, draw.prompt).toBeLessThan(1000);
      const sum = Number(/ციფრთა ჯამი (\d+)-ია/.exec(draw.prompt)![1]);
      const digits = String(answer).split('').map(Number);
      expect(digits.reduce((total, d) => total + d, 0), draw.prompt).toBe(sum);
    }
  });

  it('fills the pool faster than either pipe alone', () => {
    for (const draw of previewTemplate('g5-u19-q49', 15)) {
      const pipes = [...draw.prompt.matchAll(/(\d+) და (\d+) საათში/g)].flatMap((m) => [Number(m[1]), Number(m[2])]);
      const together = Number(/(\d+) სთ/.exec(draw.answer)![1]);
      expect(pipes, draw.prompt).toHaveLength(2);
      expect(together, draw.prompt).toBeGreaterThan(0);
      expect(together, draw.prompt).toBeLessThan(Math.min(...pipes));
    }
  });

  it('adds the two legs of a walk rather than subtracting them', () => {
    for (const draw of previewTemplate('g5-u19-q55', 15)) {
      const legs = [...draw.prompt.matchAll(/(\d+) მ/g)].map((m) => Number(m[1]));
      expect(Number(/(\d+) მ/.exec(draw.answer)![1]), draw.prompt).toBe(legs[0]! + legs[1]!);
    }
  });

  it('nets opposite directions instead of adding them', () => {
    for (const draw of previewTemplate('g5-u19-q52', 15)) {
      const legs = [...draw.prompt.matchAll(/(\d+) მ/g)].map((m) => Number(m[1]));
      const net = Math.abs(legs[0]! - legs[1]!);
      const answered = /(\d+) მ/.exec(draw.answer);
      expect(answered ? Number(answered[1]) : 0, draw.prompt).toBe(net);
    }
  });

  it('treats a work-rate problem as inverse proportion', () => {
    for (const draw of previewTemplate('g5-u19-q30', 15)) {
      const workers = Number(/^(\d+) მუშა/.exec(draw.prompt)![1]);
      const days = Number(/სამუშაოს (\d+) დღეში/.exec(draw.prompt)![1]);
      const more = Number(/(\d+) მუშა, თუ/.exec(draw.prompt)![1]);
      const answered = Number(/(\d+) დღე/.exec(draw.answer)![1]);
      expect(answered, draw.prompt).toBe((workers * days) / more);
      // Fewer workers take longer; more workers take less. Either way the
      // worker-days are unchanged.
      expect(answered * more, draw.prompt).toBe(workers * days);
      expect(more < workers ? answered > days : answered < days, draw.prompt).toBe(true);
    }
  });
});
