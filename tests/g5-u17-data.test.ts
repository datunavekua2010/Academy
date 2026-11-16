import { describe, expect, it } from 'vitest';
import { G5_U17_SUBTOPICS, G5_U17_TEMPLATES } from '../src/practice/templates/g5-u17-data';
import { previewTemplate } from '../src/practice/generator';

/**
 * Grade V — Unit 17: data and probability.
 *
 * This unit is the one place in Grade V where the answer is often *not* a
 * number the prompt computed. „რომელია ყველაზე მეტი?“ answers with a label, a
 * probability answers with a fraction in lowest terms, and a frequency table
 * asks the reader to find a row again. Tests here therefore re-read the printed
 * prompt rather than trusting the template: the figures quoted in the sentence
 * are parsed out and compared with the key.
 *
 * Two invariants matter most, and each has its own describe block:
 *
 *  - **every subtopic can fill a 12-question session** without a repeat;
 *  - **a probability is in lowest terms** — 6/10 must be printed 3/5, because a
 *    key that says 6/10 teaches a different normal form from every other unit.
 */

const TOPIC = 'g5-data-chance';

/** „a — 3, b — 5, c — 2“ → the three numbers, in order. */
const quotedNumbers = (prompt: string): number[] =>
  [...prompt.matchAll(/—\s*(\d+)/g)].map((match) => Number(match[1]));

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

describe('G5 U17 — library shape', () => {
  it('covers every subtopic of the unit', () => {
    expect(G5_U17_SUBTOPICS).toHaveLength(8);
    const templated = new Set(G5_U17_TEMPLATES.map((template) => template.subtopicId));
    for (const subtopicId of G5_U17_SUBTOPICS) {
      expect(templated.has(subtopicId), `${subtopicId} has no templates`).toBe(true);
    }
  });

  it('addresses the data topic only, under grade 5', () => {
    for (const template of G5_U17_TEMPLATES) {
      expect(template.grade, template.id).toBe(5);
      expect(template.topicId, template.id).toBe(TOPIC);
      expect(G5_U17_SUBTOPICS, template.id).toContain(template.subtopicId);
      expect(template.id, template.id).toMatch(/^g5-u17-q\d{2}$/);
    }
  });

  it('has unique ids', () => {
    const ids = G5_U17_TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('G5 U17 — every template renders a usable question', () => {
  for (const template of G5_U17_TEMPLATES) {
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
      }
    });
  }
});

describe('G5 U17 — a session can be filled without repeating', () => {
  for (const subtopicId of G5_U17_SUBTOPICS) {
    it(`${subtopicId} yields 12 distinct questions`, async () => {
      const { generateBatch } = await import('../src/practice/generator');
      const batch = generateBatch(
        { grade: 5 as const, topicId: TOPIC, subtopicId },
        12,
        { seed: 20260117 },
      );
      expect(batch.length).toBe(12);
      expect(new Set(batch.map((question) => question.signature)).size).toBe(12);
    });
  }
});

describe('G5 U17 — the printed data is what the key answers', () => {
  it('adds the three totals the prompt quotes', () => {
    for (const draw of previewTemplate('g5-u17-q01', 20)) {
      const figures = quotedNumbers(draw.prompt);
      expect(figures, 'three figures expected').toHaveLength(3);
      expect(Number(draw.answer), draw.prompt).toBe(figures.reduce((sum, n) => sum + n, 0));
    }
  });

  it('names the largest quantity, not a fixed label', () => {
    for (const draw of previewTemplate('g5-u17-q02', 20)) {
      const figures = quotedNumbers(draw.prompt);
      const labels = [...draw.prompt.matchAll(/(\S+)\s—\s*\d+/g)].map((match) => match[1]!);
      const largest = Math.max(...figures);
      const winner = labels[figures.indexOf(largest)];
      expect(draw.answer, draw.prompt).toBe(winner);
    }
  });

  it('subtracts the smaller from the larger', () => {
    for (const draw of previewTemplate('g5-u17-q03', 20)) {
      const [first, second] = quotedNumbers(draw.prompt);
      expect(Number(draw.answer), draw.prompt).toBe(Math.abs(second! - first!));
    }
  });

  it('reads a frequency back out of its own table', () => {
    for (const draw of previewTemplate('g5-u17-q08', 20)) {
      const asked = Number(/წაიკითხა (\d+) წიგნი/.exec(draw.prompt)![1]);
      const table = [...draw.prompt.matchAll(/(\d+) → (\d+)/g)].map((match) => [Number(match[1]), Number(match[2])]);
      const row = table.find(([books]) => books === asked)!;
      expect(Number(draw.answer), draw.prompt).toBe(row[1]);
    }
  });

  it('sums a frequency table to the number of students', () => {
    for (const draw of previewTemplate('g5-u17-q09', 20)) {
      const frequencies = [...draw.prompt.matchAll(/\d+ → (\d+)/g)].map((match) => Number(match[1]));
      expect(Number(draw.answer), draw.prompt).toBe(frequencies.reduce((sum, n) => sum + n, 0));
    }
  });

  it('counts the students who read at least three books', () => {
    for (const draw of previewTemplate('g5-u17-q10', 20)) {
      const table = [...draw.prompt.matchAll(/(\d+) → (\d+)/g)].map((match) => [Number(match[1]), Number(match[2])]);
      const atLeastThree = table.filter(([books]) => books >= 3).reduce((sum, [, count]) => sum + count, 0);
      expect(Number(draw.answer), draw.prompt).toBe(atLeastThree);
    }
  });

  it('names the row with the largest frequency', () => {
    for (const draw of previewTemplate('g5-u17-q11', 20)) {
      const table = [...draw.prompt.matchAll(/(\d+) → (\d+)/g)].map((match) => [Number(match[1]), Number(match[2])]);
      let best = table[0]!;
      for (const row of table) if (row[1]! > best[1]!) best = row;
      expect(Number(draw.answer), draw.prompt).toBe(best[0]);
    }
  });

  it('sums a five-day bar chart', () => {
    for (const draw of previewTemplate('g5-u17-q16', 20)) {
      const figures = quotedNumbers(draw.prompt);
      expect(figures).toHaveLength(5);
      expect(Number(draw.answer), draw.prompt).toBe(figures.reduce((sum, n) => sum + n, 0));
    }
  });

  it('scales a pictogram by its key', () => {
    for (const draw of previewTemplate('g5-u17-q05', 20)) {
      const unit = Number(/აღნიშნავს (\d+) ერთეულს/.exec(draw.prompt)![1]);
      // Count only the stars in the row that follows the sport name.
      const row = /: (★+)\./.exec(draw.prompt)![1] ?? '';
      expect(Number(draw.answer), draw.prompt).toBe(unit * row.length);
    }
  });

  it('subtracts the two pictogram rows', () => {
    for (const draw of previewTemplate('g5-u17-q07', 20)) {
      const unit = Number(/ერთი ★ = (\d+) ერთეული/.exec(draw.prompt)![1]);
      const stars = (/(★+);/.exec(draw.prompt)![1] ?? '').length;
      const circles = (/(○+)\./.exec(draw.prompt)![1] ?? '').length;
      expect(Number(draw.answer), draw.prompt).toBe(unit * (stars - circles));
    }
  });

  it('reports a probability in lowest terms', () => {
    for (const id of ['g5-u17-q30', 'g5-u17-q31', 'g5-u17-q32', 'g5-u17-q33']) {
      for (const draw of previewTemplate(id, 20)) {
        const match = /^(\d+)\/(\d+)$/.exec(draw.answer);
        expect(match, `${id}: ${draw.answer} is not a fraction`).not.toBeNull();
        const [up, down] = [Number(match![1]), Number(match![2])];
        expect(gcd(up, down), `${id}: ${draw.answer} is not reduced`).toBe(1);
      }
    }
  });

  it('gives the dice question the six equally likely outcomes', () => {
    for (const draw of previewTemplate('g5-u17-q31', 20)) {
      // favourable/6 in lowest terms ⇒ 6 ÷ denominator is a whole number.
      const [, down] = (draw.answer.includes('/') ? draw.answer : `${draw.answer}/1`).split('/').map(Number);
      expect(6 % down!, `${draw.prompt} → ${draw.answer}`).toBe(0);
    }
  });

  it('answers a probability with a value between 0 and 1', () => {
    for (const id of ['g5-u17-q30', 'g5-u17-q32', 'g5-u17-q33']) {
      for (const draw of previewTemplate(id, 20)) {
        const [up, down] = draw.answer.split('/').map(Number);
        const value = down === undefined ? up! : up! / down!;
        expect(value, `${id}: ${draw.answer}`).toBeGreaterThan(0);
        expect(value, `${id}: ${draw.answer}`).toBeLessThan(1);
      }
    }
  });

  it('classifies an event the way the box allows', () => {
    for (const draw of previewTemplate('g5-u17-q27', 20)) {
      expect(['აუცილებელი', 'შესაძლებელი', 'შეუძლებელი'], draw.prompt).toContain(draw.answer);
    }
  });
});
