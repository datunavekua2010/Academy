import { describe, expect, it } from 'vitest';
import { U02_SUBTOPICS, U02_TEMPLATES } from '../src/practice/templates/u02-numbers';
import { generateBatch } from '../src/practice/generator';
import { generateVariations } from '../src/practice/templates/generate';
import { shownKey } from '../src/practice/identity';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';

/**
 * U02 — generated questions must be *correct*, not merely well-formed.
 *
 * Every assertion re-derives the answer from what the student can see: the
 * printed numbers and the drawn picture. That is the only way to catch the
 * failure this suite exists for — a question whose wording and answer key
 * quietly disagree, which no type checker can see and which a child
 * experiences as being marked wrong for being right.
 */

const SAMPLES = 60;

const generateMany = (templateId: string, count = SAMPLES) => {
  const template = U02_TEMPLATES.find((t) => t.id === templateId);
  if (!template) throw new Error(`no template ${templateId}`);
  for (let take = Math.min(count, SAMPLES); take >= 1; take = Math.floor(take / 2)) {
    try {
      return generateVariations(template, take, { seed: 20260202 });
    } catch {
      // too narrow for `take`; try a smaller batch
    }
  }
  throw new Error(`${templateId} could not produce even one variation`);
};

const numbersIn = (text: string): number[] => (text.match(/\d+/g) ?? []).map(Number);

const ref = (subtopicId: string) => ({ grade: 1 as const, topicId: 'ricxvebi20', subtopicId });

const ORDINALS = [
  'პირველი', 'მეორე', 'მესამე', 'მეოთხე', 'მეხუთე',
  'მეექვსე', 'მეშვიდე', 'მერვე', 'მეცხრე', 'მეათე',
];

describe('U02 template library', () => {
  it('covers every U02 subtopic at every level', () => {
    for (const subtopic of U02_SUBTOPICS) {
      const templates = U02_TEMPLATES.filter((t) => t.subtopicId === subtopic);
      // The spec is three types per subtopic, one per level. A level with no
      // template is a score band the student can reach and cannot be taught in;
      // the ordering subtopic has a fourth form because ascending and descending
      // are separate templates, which is more variation, not less.
      expect(templates.length, `${subtopic} has ${templates.length} template(s)`).toBeGreaterThanOrEqual(3);
      expect([...new Set(templates.map((t) => t.difficulty))].sort()).toEqual([1, 2, 3]);
    }
  });

  it('replaces the placeholder for each subtopic', () => {
    for (const subtopic of U02_SUBTOPICS) {
      const registered = TEMPLATE_REGISTRY.forSubtopic(ref(subtopic));
      expect(registered.length, `nothing playable for ${subtopic}`).toBeGreaterThan(0);
      const placeholders = registered.filter((t) => t.id === `g1-${subtopic}`);
      expect(placeholders, `placeholder still registered for ${subtopic}`).toEqual([]);
    }
  });

  it('gives every subtopic one prompt form per template', () => {
    for (const subtopic of U02_SUBTOPICS) {
      const templates = U02_TEMPLATES.filter((t) => t.subtopicId === subtopic);
      const forms = new Set(templates.map((t) => t.prompt));
      expect(forms.size, `${subtopic} repeats one prompt`).toBe(templates.length);
    }
  });

  /**
   * A perfect run needs 35 questions, and the level is chosen by score — so a
   * student who stays on one level must not run that level dry. This is the
   * failure that made U01.3 stop at 82 points: its level 3 could only make 30
   * distinct questions, and the session ended on a student who was answering
   * every question correctly.
   */
  it('can fill a perfect run at every level', () => {
    for (const subtopic of U02_SUBTOPICS) {
      for (const level of [1, 2, 3] as const) {
        const keys = new Set(generateBatch(ref(subtopic), 60, { level }).map(shownKey));
        expect(keys.size, `${subtopic} level ${level}: ${keys.size} distinct`).toBeGreaterThanOrEqual(35);
      }
    }
  });
});

describe('U02.1 — numbers 1 to 10', () => {
  it('counts exactly what it drew', () => {
    for (const question of generateMany('g1-u02-1-quantity-to-number')) {
      const drawn = [...(question.visual ?? '')].length;
      if (!drawn) continue; // the word form draws nothing
      expect(Number(question.answer), question.prompt).toBe(drawn);
    }
  });

  it('builds the run before it asks which number is missing', () => {
    for (const question of generateMany('g1-u02-1-missing-in-run')) {
      const run = question.prompt.slice(question.prompt.lastIndexOf(':') + 1).replace(/\.$/, '');
      const parts = run.split(',').map((part) => part.trim());
      const blank = parts.indexOf('__');
      // Exactly one blank, and the answer continues the run from whichever
      // side of the blank has a number printed.
      expect(parts.filter((part) => part === '__')).toHaveLength(1);
      const want = blank > 0 ? Number(parts[blank - 1]) + 1 : Number(parts[1]) - 1;
      expect(Number(question.answer), question.prompt).toBe(want);
    }
  });

  it('offers a row with exactly the asked count', () => {
    for (const question of generateMany('g1-u02-1-pick-the-row')) {
      const asked = numbersIn(question.prompt)[0];
      // The options include the answer, so counting the answer twice would see
      // two rows of that length. Walk the options alone.
      const counts = question.options.map((row) => [...row].length);
      expect(counts.filter((count) => count === asked), question.prompt).toHaveLength(1);
      expect([...question.answer].length).toBe(asked);
      expect(question.options).toContain(question.answer);
    }
  });
});

describe('U02.2 — numbers 11 to 20', () => {
  it('names the number it asks for', () => {
    for (const question of generateMany('g1-u02-2-name-the-number')) {
      const asked = Number(question.answer);
      expect(asked).toBeGreaterThanOrEqual(11);
      expect(asked).toBeLessThanOrEqual(20);
      // A tens-and-units reading has to add up to the answer.
      const tensForm = question.prompt.match(/(\d+) სრული ათეული და (\d+) ერთეული/);
      if (tensForm) {
        expect(Number(tensForm[1]) * 10 + Number(tensForm[2])).toBe(asked);
      }
      const placeForm = question.prompt.match(/(\d+) ერთეული და ერთი ათეული/);
      if (placeForm) expect(Number(placeForm[1]) + 10).toBe(asked);
      const tenPlus = question.prompt.match(/ათი და კიდევ (\d+)/);
      if (tenPlus) expect(10 + Number(tenPlus[1])).toBe(asked);
    }
  });

  it.each([
    ['g1-u02-2-order-asc', 1],
    ['g1-u02-2-order-desc', -1],
  ])('%s arranges the numbers it shows', (id, direction) => {
    for (const question of generateMany(id)) {
      const items = (question.orderItems ?? []).map(Number);
      const key = question.answer.split(',').map(Number);
      // Following the key through the displayed items must put them in the
      // order the stem asked for.
      const picked = key.map((position) => items[position - 1]);
      const want = [...items].sort((a, b) => direction * (a - b));
      expect(picked, `${question.orderItems} → ${question.answer}`).toEqual(want);
      // And the scramble is never already in that order.
      expect(items).not.toEqual(want);
    }
  });
});

describe('U02.3 — ordinal numbers', () => {
  it('names the child who really stands in that place', () => {
    for (const question of generateMany('g1-u02-3-who-is-nth')) {
      const row = question.prompt.split(':')[1].split('.')[0].split(',').map((name) => name.trim());
      const place = ORDINALS.findIndex((ordinal) => question.prompt.includes(`ვინ დგას ${ordinal}`));
      expect(place, question.prompt).toBeGreaterThanOrEqual(0);
      expect(question.answer, question.prompt).toBe(row[place]);
    }
  });

  it('gives the place of the book it names', () => {
    for (const question of generateMany('g1-u02-3-which-position')) {
      const shelf = question.prompt.split(':')[1].split('.')[0].split(',').map((c) => c.trim());
      // "მარცხნიდან" appears twice: once describing the shelf order, once in
      // the question. Take the last occurrence, which is the one being asked.
      const asked = question.prompt
        .slice(question.prompt.lastIndexOf('მარცხნიდან'))
        .match(/მარცხნიდან (.+?) წიგნი/)?.[1];
      expect(asked, question.prompt).toBeTruthy();
      expect(question.answer, question.prompt).toBe(ORDINALS[shelf.indexOf(asked!)]);
    }
  });

  it('counts the children in front from the place that was given', () => {
    for (const question of generateMany('g1-u02-3-how-many-in-front')) {
      const place = ORDINALS.findIndex((ordinal) => question.prompt.includes(`რიგში ${ordinal} დგას`));
      expect(place, question.prompt).toBeGreaterThanOrEqual(0);
      expect(Number(question.answer), question.prompt).toBe(place);
    }
  });
});

describe('U02.4 — before and after', () => {
  it.each(['g1-u02-4-neighbour-choice', 'g1-u02-4-neighbour-entry'])(
    '%s moves one step in the direction it names',
    (id) => {
      for (const question of generateMany(id)) {
        const n = numbersIn(question.prompt)[0];
        const after = question.prompt.includes('შემდეგ');
        expect(Number(question.answer), question.prompt).toBe(after ? n + 1 : n - 1);
        // Choosing the neighbour in the *other* direction is the mistake this
        // subtopic exists to catch, so it is always on offer.
        if (question.options.length) {
          expect(question.options).toContain(question.answer);
          expect(question.options).toContain(String(after ? n - 1 : n + 1));
        }
      }
    },
  );

  it('reads the two missing numbers out of the run it printed', () => {
    for (const question of generateMany('g1-u02-4-two-gaps')) {
      const printedRun = question.prompt.slice(question.prompt.lastIndexOf('?') + 1).trim();
      const parts = printedRun.replace(/\.$/, '').split(',').map((part) => part.trim());
      // The stated pair continues the run one step at each blank.
      const missing = question.answer.split(' და ').map(Number);
      expect(missing).toHaveLength(2);
      expect(parts.filter((part) => part === '__')).toHaveLength(2);

      // Fill the blanks back in and the row must run one step at a time from
      // wherever it starts — that is the only reading the stem supports.
      const printed = parts.filter((part) => part !== '__').map(Number);
      const start = printed[0] - parts.indexOf(String(printed[0]));
      const filled = [...parts];
      missing.forEach((value) => {
        filled[filled.indexOf('__')] = String(value);
      });
      const run = filled.map(Number);
      expect(run[0], question.prompt).toBe(start);
      for (let i = 1; i < run.length; i += 1) expect(run[i], question.prompt).toBe(run[i - 1] + 1);
    }
  });
});

describe('U02.5 — largest and smallest', () => {
  it('picks the extreme of the numbers it printed', () => {
    for (const question of generateMany('g1-u02-5-pick-extreme')) {
      const printed = numbersIn(question.prompt);
      const want = question.prompt.includes('უდიდესი')
        ? Math.max(...printed)
        : Math.min(...printed);
      expect(Number(question.answer), question.prompt).toBe(want);
      // The options are exactly the three numbers the stem printed.
      expect([...question.options].sort()).toEqual(printed.map(String).sort());
    }
  });

  it('measures the gap between the two extremes', () => {
    for (const question of generateMany('g1-u02-5-range')) {
      const printed = numbersIn(question.prompt);
      expect(Number(question.answer), question.prompt).toBe(
        Math.max(...printed) - Math.min(...printed),
      );
    }
  });
});

describe('U02.6 — the number line', () => {
  it('marks a number that really is on the line it drew', () => {
    for (const question of generateMany('g1-u02-6-read-the-line')) {
      const line = (question.visual ?? '').split(' ');
      expect(line, question.prompt).toContain(`[${question.answer}]`);
      // The marked number is on the line, and the line runs without gaps.
      const values = line.map((cell) => Number(cell.replace(/[[\]]/g, '')));
      for (let i = 1; i < values.length; i += 1) expect(values[i]).toBe(values[i - 1] + 1);
    }
  });

  it.each(['g1-u02-6-one-move', 'g1-u02-6-plan-a-journey'])(
    '%s lands where the moves say',
    (id) => {
      for (const question of generateMany(id)) {
        const single = question.prompt.match(
          /დაიწყე (\d+)-დან და რიცხვით ღერძზე გადადი (\d+) ნაბიჯით (მარჯვნივ|მარცხნივ)/,
        );
        const double = question.prompt.match(
          /დაიწყე (\d+)-დან\. გადადი (\d+) ნაბიჯით მარჯვნივ, შემდეგ — (\d+) ნაბიჯით მარცხნივ/,
        );
        if (single) {
          const [, from, steps, direction] = single;
          const want = direction === 'მარჯვნივ' ? Number(from) + Number(steps) : Number(from) - Number(steps);
          expect(Number(question.answer), question.prompt).toBe(want);
        } else if (double) {
          const [, from, right, left] = double;
          expect(Number(question.answer), question.prompt).toBe(
            Number(from) + Number(right) - Number(left),
          );
        }
        // Whatever the journey, it stays on the line.
        expect(Number(question.answer)).toBeGreaterThanOrEqual(1);
        expect(Number(question.answer)).toBeLessThanOrEqual(20);
      }
    },
  );
});

describe('U02.7 — even and odd', () => {
  it('offers exactly one number of the parity it asks for', () => {
    for (const question of generateMany('g1-u02-7-pick-one')) {
      const wantsOdd = question.prompt.includes('კენტი');
      const matching = question.options.filter((option) => Number(option) % 2 === 1) === undefined
        ? []
        : question.options.filter((option) => (Number(option) % 2 === 1) === wantsOdd);
      expect(matching, `${question.prompt} → ${question.options}`).toHaveLength(1);
      expect(matching[0]).toBe(question.answer);
      expect(question.options).toHaveLength(3);
    }
  });

  it('states a sentence that is true of the group it printed', () => {
    for (const question of generateMany('g1-u02-7-pick-the-group')) {
      const group = numbersIn(question.prompt);
      const odds = group.filter((n) => n % 2 === 1).length;
      const expected =
        odds === 3
          ? 'სამივე კენტია'
          : odds === 0
            ? 'სამივე ლუწია'
            : odds === 1
              ? 'ერთი კენტია, ორი ლუწი'
              : 'ორი კენტია, ერთი ლუწი';
      expect(group, question.prompt).toHaveLength(3);
      expect(question.answer, question.prompt).toBe(expected);
      // No digit in the options: beside a row of numbers "2 კენტია" reads as
      // "2 is odd", not "two of them are odd".
      for (const option of question.options) expect(option).not.toMatch(/\d/);
    }
  });

  it('finds the one number whose parity differs from the rest', () => {
    for (const question of generateMany('g1-u02-7-odd-one-out')) {
      const group = numbersIn(question.prompt);
      expect(group, question.prompt).toHaveLength(5);
      const answer = Number(question.answer);
      expect(group).toContain(answer);
      const others = group.filter((n) => n !== answer);
      expect(new Set(others.map((n) => n % 2)).size, question.prompt).toBe(1);
      expect(others[0] % 2).not.toBe(answer % 2);
      // Every option is one of the five numbers on screen.
      for (const option of question.options) expect(group).toContain(Number(option));
    }
  });
});

describe('U02 as a whole', () => {
  it('never prints a placeholder or a broken number', () => {
    for (const subtopic of U02_SUBTOPICS) {
      for (const level of [1, 2, 3] as const) {
        for (const question of generateBatch(ref(subtopic), 20, { level })) {
          const shown = `${question.prompt} ${question.visual ?? ''} ${question.options.join(' ')}`;
          expect(shown, question.id).not.toMatch(/\{\w+\}/);
          expect(shown, question.id).not.toMatch(/undefined|NaN/);
        }
      }
    }
  });

  it('ships options only where the student is choosing', () => {
    for (const subtopic of U02_SUBTOPICS) {
      for (const level of [1, 2, 3] as const) {
        for (const question of generateBatch(ref(subtopic), 20, { level })) {
          if (question.answerMode === 'choice') {
            expect(question.options.length, question.id).toBeGreaterThanOrEqual(2);
            expect(question.options, question.id).toContain(question.answer);
            expect(new Set(question.options).size, question.id).toBe(question.options.length);
          } else {
            expect(question.options, question.id).toEqual([]);
          }
        }
      }
    }
  });

  it('never shows the same question twice in a session', () => {
    for (const subtopic of U02_SUBTOPICS) {
      const shown = new Set<string>();
      for (const level of [1, 2, 3] as const) {
        for (const question of generateBatch(ref(subtopic), 40, { level })) {
          const key = shownKey(question);
          expect(shown.has(key), `${subtopic} repeated ${question.prompt}`).toBe(false);
          shown.add(key);
        }
      }
    }
  });
});
