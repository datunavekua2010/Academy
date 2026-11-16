import { describe, expect, it } from 'vitest';
import { G5_U18_SUBTOPICS, G5_U18_TEMPLATES } from '../src/practice/templates/g5-u18-time-money';
import { generateBatch, previewTemplate } from '../src/practice/generator';

/**
 * Grade V — Unit 18: time and money.
 *
 * Every check here re-derives the arithmetic from the rendered sentence in a
 * form written independently of the template's own. That is deliberate: the
 * characteristic bug of this unit is not a missing question but a key that
 * quietly added hours and minutes column-wise („3:50 + 0:40 → 3:90“) or that
 * treated a duration as a time of day.
 *
 * Three invariants carry the unit:
 *
 *  - **a time is minutes since midnight** — parsed back out of `HH:MM`;
 *  - **money is whole თეთრი** — „N ლარი M თეთრი“ parsed back to one number;
 *  - **a negative duration never prints** — the bank's subtraction rows all
 *    take a larger time from a smaller one.
 */

const TOPIC = 'g5-time-money';

/** `HH:MM` → minutes since midnight. */
const parseTime = (text: string): number => {
  const match = /(\d{1,2}):(\d{2})/.exec(text)!;
  return Number(match[1]) * 60 + Number(match[2]);
};

/** „X სთ Y წთ“ / „X წთ“ / „X დღე Y სთ“ → minutes (using 60-minute hours). */
const parseSpan = (text: string): number => {
  const days = /(\d+) დღე/.exec(text);
  const hours = /(\d+) სთ/.exec(text);
  const minutes = /(\d+) წთ/.exec(text);
  const seconds = /(\d+) წმ/.exec(text);
  if (seconds && !days) return (minutes ? Number(minutes[1]) * 60 : 0) + Number(seconds[1]);
  return (
    (days ? Number(days[1]) * 24 * 60 : 0) +
    (hours ? Number(hours[1]) * 60 : 0) +
    (minutes ? Number(minutes[1]) : 0)
  );
};

/** „N ლარი M თეთრი“ / „N ლარი“ / „M თეთრი“ / „N,MM“ → თეთრი. */
const parseMoney = (text: string): number => {
  const decimal = /^(\d+),(\d{2})$/.exec(text.trim());
  if (decimal) return Number(decimal[1]) * 100 + Number(decimal[2]);
  const lariPart = /(\d+) ლარი/.exec(text);
  const tetriPart = /(\d+) თეთრი/.exec(text);
  return (lariPart ? Number(lariPart[1]) * 100 : 0) + (tetriPart ? Number(tetriPart[1]) : 0);
};

describe('G5 U18 — library shape', () => {
  it('covers every subtopic of the unit', () => {
    expect(G5_U18_SUBTOPICS).toHaveLength(10);
    const templated = new Set(G5_U18_TEMPLATES.map((template) => template.subtopicId));
    for (const subtopicId of G5_U18_SUBTOPICS) {
      expect(templated.has(subtopicId), `${subtopicId} has no templates`).toBe(true);
    }
  });

  it('addresses the time-and-money topic only, under grade 5', () => {
    for (const template of G5_U18_TEMPLATES) {
      expect(template.grade, template.id).toBe(5);
      expect(template.topicId, template.id).toBe(TOPIC);
      expect(G5_U18_SUBTOPICS, template.id).toContain(template.subtopicId);
      expect(template.id, template.id).toMatch(/^g5-u18-q\d{2}$/);
    }
  });

  it('has unique ids', () => {
    const ids = G5_U18_TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('G5 U18 — every template renders a usable question', () => {
  for (const template of G5_U18_TEMPLATES) {
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
        // A dot decimal is never how this app writes a number.
        expect(draw.answer, `${template.id}: dot decimal`).not.toMatch(/\d\.\d/);
        for (const option of draw.options) {
          expect(option, `${template.id}: dot decimal option`).not.toMatch(/\d\.\d/);
        }
      }
    });
  }
});

describe('G5 U18 — a session can be filled without repeating', () => {
  for (const subtopicId of G5_U18_SUBTOPICS) {
    it(`${subtopicId} yields 12 distinct questions`, () => {
      const batch = generateBatch({ grade: 5, topicId: TOPIC, subtopicId }, 12, { seed: 20260118 });
      expect(batch.length).toBe(12);
      expect(new Set(batch.map((question) => question.signature)).size).toBe(12);
    });
  }
});

describe('G5 U18 — the printed arithmetic is the answer', () => {
  it('multiplies hours into minutes', () => {
    for (const draw of previewTemplate('g5-u18-q01', 20)) {
      const hours = Number(/(\d+) საათში/.exec(draw.prompt)![1]);
      expect(Number(draw.answer), draw.prompt).toBe(hours * 60);
    }
  });

  it('carries a part-hour total past the hour boundary', () => {
    for (const draw of previewTemplate('g5-u18-q05', 20)) {
      const [hours, minutes] = [Number(/(\d+) საათი/.exec(draw.prompt)![1]), Number(/(\d+) წუთი/.exec(draw.prompt)![1])];
      expect(Number(draw.answer), draw.prompt).toBe(hours * 60 + minutes);
      expect(Number(draw.answer) % 60).toBeLessThan(60);
    }
  });

  it('adds two spans without going over 59 minutes', () => {
    for (const draw of previewTemplate('g5-u18-q07', 20)) {
      const parts = [...draw.prompt.matchAll(/(\d+) სთ (\d+) წთ/g)].map((m) => Number(m[1]) * 60 + Number(m[2]));
      const total = parts[0]! + parts[1]!;
      expect(parseSpan(draw.answer), draw.prompt).toBe(total);
      expect(parseSpan(draw.answer) % 60, draw.answer).toBeLessThan(60);
    }
  });

  it('subtracts two spans and never prints a negative one', () => {
    for (const draw of previewTemplate('g5-u18-q08', 20)) {
      const parts = [...draw.prompt.matchAll(/(\d+) სთ (\d+) წთ/g)].map((m) => Number(m[1]) * 60 + Number(m[2]));
      const expected = parts[0]! - parts[1]!;
      expect(parseSpan(draw.answer), draw.prompt).toBe(expected);
      expect(expected, draw.prompt).toBeGreaterThan(0);
    }
  });

  it('measures a lesson as end minus start', () => {
    for (const draw of previewTemplate('g5-u18-q12', 20)) {
      const times = [...draw.prompt.matchAll(/\d{2}:\d{2}/g)].map((m) => parseTime(m[0]));
      expect(parseSpan(draw.answer), draw.prompt).toBe(times[1]! - times[0]!);
    }
  });

  it('deducts a break from the hours actually worked', () => {
    for (const draw of previewTemplate('g5-u18-q15', 20)) {
      const times = [...draw.prompt.matchAll(/\d{2}:\d{2}/g)].map((m) => parseTime(m[0]));
      const pause = Number(/(\d+) წუთი შესვენება/.exec(draw.prompt)![1]);
      expect(parseSpan(draw.answer), draw.prompt).toBe(times[1]! - times[0]! - pause);
    }
  });

  it('lands on a clock time that wraps correctly', () => {
    for (const draw of previewTemplate('g5-u18-q17', 20)) {
      const start = parseTime(/(\d{2}:\d{2})/.exec(draw.prompt)![1]!);
      const minutes = Number(/(\d+) წუთის შემდეგ/.exec(draw.prompt)![1]);
      expect(parseTime(draw.answer), draw.prompt).toBe((start + minutes) % (24 * 60));
    }
  });

  it('keeps a morning subtraction from going backwards', () => {
    for (const draw of previewTemplate('g5-u18-q18', 20)) {
      const start = parseTime(/(\d{2}:\d{2})/.exec(draw.prompt)![1]!);
      const minutes = Number(/(\d+) წუთით ადრე/.exec(draw.prompt)![1]);
      expect(start - minutes, draw.prompt).toBeGreaterThanOrEqual(0);
      expect(parseTime(draw.answer), draw.prompt).toBe(start - minutes);
    }
  });

  it('converts lari into tetri at 100', () => {
    for (const draw of previewTemplate('g5-u18-q22', 20)) {
      const lari = Number(/(\d+) ლარი/.exec(draw.prompt)![1]);
      expect(Number(draw.answer), draw.prompt).toBe(lari * 100);
    }
  });

  it('writes a tetri amount as lari and tetri, both parts correct', () => {
    for (const draw of previewTemplate('g5-u18-q24', 20)) {
      const tetri = Number(/(\d+) თეთრი რამდენი/.exec(draw.prompt)![1]);
      expect(parseMoney(draw.answer), draw.prompt).toBe(tetri);
      const rest = /(\d+) თეთრი$/.exec(draw.answer);
      if (rest) expect(Number(rest[1]), draw.answer).toBeLessThan(100);
    }
  });

  it('returns the right change for one item', () => {
    for (const draw of previewTemplate('g5-u18-q27', 20)) {
      const [price, paid] = [...draw.prompt.matchAll(/(\d+) თეთრი/g)].map((m) => Number(m[1]));
      expect(Number(draw.answer), draw.prompt).toBe(paid! - price!);
    }
  });

  it('returns the right change for two items', () => {
    for (const draw of previewTemplate('g5-u18-q28', 20)) {
      const amounts = [...draw.prompt.matchAll(/(\d+) თეთრი/g)].map((m) => Number(m[1]));
      expect(Number(draw.answer), draw.prompt).toBe(amounts[2]! - amounts[0]! - amounts[1]!);
    }
  });

  it('multiplies a unit price into a total', () => {
    for (const draw of previewTemplate('g5-u18-q34', 20)) {
      const count = Number(/^(\d+) ცალი/.exec(draw.prompt)![1]);
      const price = Number(/თითო (\d+) თეთრად/.exec(draw.prompt)![1]);
      expect(parseMoney(draw.answer), draw.prompt).toBe(count * price);
    }
  });

  it('divides a bill into equal shares', () => {
    for (const draw of previewTemplate('g5-u18-q35', 20)) {
      const total = Number(/^(\d+) თეთრი/.exec(draw.prompt)![1]);
      const people = Number(/(\d+) ადამიანზე/.exec(draw.prompt)![1]);
      expect(total % people, draw.prompt).toBe(0);
      expect(parseMoney(draw.answer), draw.prompt).toBe(total / people);
    }
  });

  it('answers the sufficiency question in the direction the money allows', () => {
    for (const draw of previewTemplate('g5-u18-q40', 20)) {
      // „ნინოს აქვს 400 თეთრი“ names the purse first, then „ღირს 215 და 180“.
      const have = Number(/აქვს (\d+) თეთრი/.exec(draw.prompt)![1]);
      const [a, b] = [...draw.prompt.matchAll(/ღირს (\d+) და (\d+)/g)].flatMap((m) => [Number(m[1]), Number(m[2])]);
      expect(draw.answer.startsWith('კი'), draw.prompt).toBe(have >= a + b);
    }
  });

  it('rounds to the nearest lari by the half-up rule', () => {
    for (const draw of previewTemplate('g5-u18-q50', 20)) {
      const price = Number(/^ფასი (\d+) თეთრია/.exec(draw.prompt)![1]);
      expect(Number(draw.answer), draw.prompt).toBe(Math.round(price / 100));
    }
  });

  it('rounds to the nearest ten tetri', () => {
    for (const draw of previewTemplate('g5-u18-q51', 20)) {
      const price = Number(/^ფასი (\d+) თეთრია/.exec(draw.prompt)![1]);
      expect(Number(draw.answer), draw.prompt).toBe(Math.round(price / 10) * 10);
    }
  });
});
