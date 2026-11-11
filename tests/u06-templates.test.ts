import { describe, expect, it } from 'vitest';
import { U06_SUBTOPICS, U06_TEMPLATES } from '../src/practice/templates/u06-addition';
import { generateBatch, generateQuestion } from '../src/practice/generator';
import { generateFromTemplate, generateVariations } from '../src/practice/templates/generate';
import { shownKey } from '../src/practice/identity';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { advance, startSession, submitAnswer } from '../src/practice/session';
import { levelForScore } from '../src/practice/levels';
import type { GeneratedQuestion } from '../src/practice/templates/generate';

/**
 * U06 — every addition question must *add the numbers it prints*.
 *
 * The failures this suite exists for, none of which a type checker can see:
 *
 *  - a sum that does not come out of the two counts printed beside it;
 *  - a picture that draws a different count from the number it is drawn from;
 *  - a „true or false“ equality that is never false, so the answer is a coin
 *    that always lands the same way;
 *  - a missing addend computed as something other than `total − known`.
 *
 * Every assertion re-derives the answer from what the student is shown.
 */

const SAMPLES = 120;
const SEED = 20260601;

const ref = (subtopicId: string) => ({ grade: 1 as const, topicId: 'Sekreba', subtopicId });

const templateFor = (id: string) => {
  const template = U06_TEMPLATES.find((candidate) => candidate.id === id);
  if (!template) throw new Error(`no template ${id}`);
  return template;
};

const generateMany = (templateId: string, count = SAMPLES): GeneratedQuestion[] => {
  const template = templateFor(templateId);
  for (let take = count; take >= 1; take = Math.floor(take / 2)) {
    try {
      return generateVariations(template, take, { seed: SEED });
    } catch {
      // too narrow for `take`; try a smaller batch
    }
  }
  throw new Error(`${templateId} could not produce even one variation`);
};

/** Every number printed in the prompt, in order. */
const nums = (text: string): number[] => (text.match(/\d+/g) ?? []).map(Number);

describe('U06 template library', () => {
  it('covers every subtopic at every level', () => {
    expect(U06_TEMPLATES.length).toBeGreaterThanOrEqual(50);
    expect(new Set(U06_TEMPLATES.map((t) => t.id)).size).toBe(U06_TEMPLATES.length);
    for (const subtopic of U06_SUBTOPICS) {
      const templates = U06_TEMPLATES.filter((t) => t.subtopicId === subtopic);
      expect(templates.length, `${subtopic}`).toBeGreaterThanOrEqual(3);
      expect(
        [...new Set(templates.map((t) => t.difficulty))].sort((a, b) => Number(a) - Number(b)),
        `${subtopic} is missing a level`,
      ).toEqual([1, 2, 3]);
    }
  });

  it('replaces the placeholders for every subtopic', () => {
    for (const subtopic of U06_SUBTOPICS) {
      const registered = TEMPLATE_REGISTRY.forSubtopic(ref(subtopic));
      expect(registered.length, `nothing playable for ${subtopic}`).toBeGreaterThan(0);
      expect(
        registered.filter((t) => t.id === `g1-${subtopic}`),
        `placeholder still registered for ${subtopic}`,
      ).toEqual([]);
    }
  });

  it('can fill a perfect run at every level', () => {
    // The app asks level-aware batches, so each level has to carry a session
    // by itself — not merely the subtopic as a whole.
    for (const subtopic of U06_SUBTOPICS) {
      for (const level of [1, 2, 3] as const) {
        const keys = new Set(
          generateBatch(ref(subtopic), 160, { level, seed: SEED }).map(shownKey),
        );
        expect(keys.size, `${subtopic} level ${level}: only ${keys.size} distinct`).toBeGreaterThanOrEqual(
          35,
        );
      }
    }
  });

  it('reaches 100 in 35 questions with the real ladder', () => {
    for (const subtopic of U06_SUBTOPICS) {
      const at = ref(subtopic);
      let state = startSession(at, generateBatch(at, 8, { level: 1, seed: SEED }));
      let answered = 0;
      while (answered < 60 && !state.completed && state.score < 100) {
        const id = state.queue[0];
        expect(id, `${subtopic} ran dry at ${state.score}`).toBeTruthy();
        const question = state.questions[id!]!;
        const submission = submitAnswer(state, question.answer);
        expect(submission, `${subtopic} refused a correct answer`).toBeTruthy();
        state = submission!.state;
        answered += 1;
        const refill =
          state.queue.length <= 3
            ? generateBatch(at, 4, {
                avoid: new Set(
                  state.answers.map((answer) =>
                    shownKey({
                      prompt: answer.prompt ?? '',
                      visual: answer.visual,
                      orderItems: answer.orderItems,
                    }),
                  ),
                ),
                level: levelForScore(state.score),
              })
            : [];
        state = advance(state, refill);
      }
      expect(state.score, `${subtopic} finished at ${state.score}`).toBe(100);
      expect(answered, `${subtopic} took ${answered} questions`).toBe(35);
    }
  });
});

describe('U06 answers are computed from what is shown', () => {
  /** The templates that print their addends and ask for the sum. */
  const SUM_TEMPLATES = [
    'g1-u06-1-two-plates',
    'g1-u06-1-two-colours',
    'g1-u06-1-fill-sum',
    'g1-u06-1-two-groups',
    'g1-u06-2-animals',
    'g1-u06-2-two-colours',
    'g1-u06-2-stars',
    'g1-u06-2-fill-sum',
    'g1-u06-2-three-groups',
    'g1-u06-3-pencils',
    'g1-u06-3-birds',
    'g1-u06-3-shop',
    'g1-u06-3-shelves',
    'g1-u06-3-stickers',
    'g1-u06-3-bus',
    'g1-u06-10-three-small',
    'g1-u06-10-three-mid',
    'g1-u06-10-four-addends',
  ];

  it.each(SUM_TEMPLATES)('%s adds exactly the numbers it prints', (templateId) => {
    for (const question of generateMany(templateId, 60)) {
      const printed = nums(question.prompt);
      expect(printed.length, `${templateId}: ${question.prompt}`).toBeGreaterThan(1);
      expect(Number(question.answer), `${templateId}: ${question.prompt}`).toBe(
        printed.reduce((a, b) => a + b, 0),
      );
    }
  });

  it('keeps U06.2 inside ten', () => {
    // The unit's rule for this subtopic, and the reason its sums are small.
    for (const template of U06_TEMPLATES.filter((t) => t.subtopicId === 'SuratiT-10')) {
      if (template.id === 'g1-u06-2-to-ten') continue;
      for (const question of generateMany(template.id, 60)) {
        const printed = nums(question.prompt);
        if (printed.length < 2) continue;
        expect(
          printed.reduce((a, b) => a + b, 0),
          `${template.id} exceeds ten: ${question.prompt}`,
        ).toBeLessThanOrEqual(10);
      }
    }
  });

  it('keeps U06.6 inside twenty', () => {
    for (const template of U06_TEMPLATES.filter((t) => t.subtopicId === 'cxrili-20')) {
      for (const question of generateMany(template.id, 60)) {
        expect(Number(question.answer), `${template.id}: ${question.prompt}`).toBeLessThanOrEqual(20);
      }
    }
  });

  it.each([
    'g1-u06-4-walk-small',
    'g1-u06-4-walk-small-two',
    'g1-u06-4-walk-teen',
    'g1-u06-4-walk-twenties',
    'g1-u06-4-walk-large',
  ])('%s lands where the walk ends', (templateId) => {
    for (const question of generateMany(templateId, 60)) {
      const [start, steps] = nums(question.prompt);
      expect(Number(question.answer), `${templateId}: ${question.prompt}`).toBe(start + steps);
      // The line is drawn from the start for just long enough to reach the end.
      const visual = question.visual ?? '';
      expect(visual, `${templateId} has no line`).toContain(String(start));
      expect(visual, `${templateId}: the line runs past the destination?`).toContain(
        String(start + steps),
      );
    }
  });

  it('answers the backwards walk with the start, not the end', () => {
    for (const question of generateMany('g1-u06-4-walk-back', 60)) {
      const [end, steps] = nums(question.prompt);
      expect(Number(question.answer), question.prompt).toBe(end - steps);
    }
  });

  it('doubles by adding the number to itself', () => {
    for (const id of [
      'g1-u06-5-double-small',
      'g1-u06-5-double-mid',
      'g1-u06-5-double-large',
      'g1-u06-5-which-double',
      'g1-u06-12-table-diagonal',
    ]) {
      for (const question of generateMany(id, 60)) {
        const [n] = nums(question.prompt);
        expect(Number(question.answer), `${id}: ${question.prompt}`).toBe(n * 2);
      }
    }
  });

  it('adds nothing when the addend is zero', () => {
    for (const id of ['g1-u06-5-plus-zero', 'g1-u06-5-zero-to-large']) {
      for (const question of generateMany(id, 60)) {
        const [n] = nums(question.prompt);
        expect(Number(question.answer), `${id}: ${question.prompt}`).toBe(n);
      }
    }
  });

  it('halves the total for two equal addends', () => {
    for (const question of generateMany('g1-u06-5-equal-addends', 60)) {
      const [total] = nums(question.prompt);
      expect(Number(question.answer) * 2, question.prompt).toBe(total);
    }
  });

  it('computes every missing addend as total − known', () => {
    // The unit's stated rule, applied to every template whose answer is a gap.
    const gapTemplates = U06_TEMPLATES.filter(
      (t) =>
        t.subtopicId === 'uknobi-SeSveTi' ||
        t.subtopicId === 'raodenobis-gzebi' ||
        t.id === 'g1-u06-6-missing' ||
        t.id === 'g1-u06-2-to-ten',
    );
    expect(gapTemplates.length).toBeGreaterThan(5);
    for (const template of gapTemplates) {
      for (const question of generateMany(template.id, 40)) {
        const printed = nums(question.prompt);
        const answer = Number(question.answer);
        expect(Number.isFinite(answer), `${template.id}: ${question.prompt}`).toBe(true);
        // The answer completes the printed equation: known + answer = total, in
        // whichever order the sentence printed them.
        const completes = printed.some((known) => known + answer === printed[0] || known + answer === printed[1]);
        expect(completes, `${template.id}: ${question.prompt} => ${answer}`).toBe(true);
      }
    }
  });

  it('decides true/false by evaluating the equality', () => {
    for (const template of U06_TEMPLATES.filter((t) => t.subtopicId === 'martalia-tu-ara')) {
      for (const question of generateMany(template.id, 60)) {
        const [a, b, c] = nums(question.prompt);
        const expected = a + b === c ? 'მართალია' : 'მცდარია';
        expect(question.answer, `${template.id}: ${question.prompt}`).toBe(expected);
      }
    }
  });

  it('makes true/false questions genuinely both ways', () => {
    // If the claim is always true the question tests nothing but the child's
    // faith that the book is right.
    for (const template of U06_TEMPLATES.filter((t) => t.subtopicId === 'martalia-tu-ara')) {
      const answers = new Set(generateMany(template.id, 80).map((q) => String(q.answer)));
      expect([...answers].sort(), `${template.id} is always ${[...answers].join('/')}`).toEqual([
        'მართალია',
        'მცდარია',
      ]);
    }
  });

  it('shows the expression that matches the union, not its value', () => {
    for (const id of ['g1-u06-1-which-expression', 'g1-u06-1-which-expression-large']) {
      for (const question of generateMany(id, 60)) {
        const [a, b] = nums(question.prompt);
        expect(question.answer, `${id}: ${question.prompt}`).toBe(`${a} + ${b}`);
        expect(
          (question.options ?? []).map(String),
          `${id}: the answer is not among its options`,
        ).toContain(String(question.answer));
        // Wrong options must be expressions too, not bare numbers.
        for (const option of question.options ?? []) {
          expect(String(option), `${id} offered „${option}“`).toMatch(/^\d+ [+−] \d+$/);
        }
      }
    }
  });

  it('orders the addends of the sum it prints', () => {
    for (const template of U06_TEMPLATES.filter((t) => t.subtopicId === 'SeSveTebis-arCevani')) {
      for (const question of generateMany(template.id, 40)) {
        const [total] = nums(question.prompt);
        const items = (question.orderItems ?? []).map(Number);
        expect(items.length, question.prompt).toBeGreaterThan(1);
        expect(
          items.reduce((a, b) => a + b, 0),
          `${template.id}: the addends do not make the printed total ${total}`,
        ).toBe(total);
        // The key is a permutation of the positions, and reading it back sorts
        // the items ascending.
        const key = String(question.answer).split(',').map(Number);
        expect([...key].sort((a, b) => a - b)).toEqual(items.map((_, i) => i + 1));
        expect(key.map((p) => items[p - 1])).toEqual([...items].sort((a, b) => a - b));
      }
    }
  });
});

describe('U06 pictures match the numbers', () => {
  it('counts the objects it draws', () => {
    // The picture is built from the same value the answer is computed from, so
    // a row that does not match its count is a printing bug a child would see.
    const drawn = [
      ['g1-u06-1-two-plates', /: (.*)$/g],
      ['g1-u06-2-animals', /: (.*)$/g],
      ['g1-u06-2-two-colours', /: (.*)$/g],
      ['g1-u06-2-stars', /: (.*)$/g],
    ] as const;

    for (const [id, pattern] of drawn) {
      for (const question of generateMany(id, 40)) {
        const printed = nums(question.prompt);
        const rows = (question.visual ?? '')
          .split('\n')
          .map((line) => {
            const match = [...line.matchAll(pattern)][0];
            return match ? match[1].trim().split(/\s+/).filter(Boolean).length : null;
          })
          .filter((count): count is number => count !== null && count > 0);
        expect(rows.length, `${id} drew no rows`).toBeGreaterThan(0);
        // Two counts printed, two rows drawn, each row's length equal to one of
        // the printed counts.
        const shown = [...printed].sort((a, b) => a - b);
        expect(rows.slice().sort((a, b) => a - b), `${id}: ${question.prompt}`).toEqual(
          shown.slice(0, rows.length).sort((a, b) => a - b),
        );
      }
    }
  });

  it('labelled a row with the animal it actually drew', () => {
    // A row of crows drawn with a cat emoji is a false picture, even though the
    // count is right.
    const allowed: Record<string, string> = {
      კატა: '🐈',
      ძაღლი: '🐕',
      ყვავი: '🐦',
      თაგვი: '🐁',
    };
    for (const question of generateMany('g1-u06-2-animals', 40)) {
      for (const line of (question.visual ?? '').split('\n')) {
        const [label, objects] = line.split(':');
        const expected = allowed[label?.trim() ?? ''];
        if (!expected) continue;
        for (const object of (objects ?? '').trim().split(/\s+/).filter(Boolean)) {
          expect(object, `„${label}“ was drawn with ${object}`).toBe(expected);
        }
      }
    }
  });
});

describe('U06 questions are answerable', () => {
  it('keys every question to an option it actually offers', () => {
    for (const template of U06_TEMPLATES) {
      for (const question of generateMany(template.id, 25)) {
        if (!question.options || question.options.length === 0) continue;
        expect(
          question.options.map(String),
          `${template.id}: answer ${question.answer} not among its options`,
        ).toContain(String(question.answer));
      }
    }
  });

  it('offers no duplicate options and no empty ones', () => {
    for (const template of U06_TEMPLATES) {
      for (const question of generateMany(template.id, 25)) {
        const options = (question.options ?? []).map(String);
        if (options.length === 0) continue;
        expect(options.length, `${template.id} offered one option`).toBeGreaterThan(1);
        expect(new Set(options).size, `${template.id}: ${options.join(' / ')}`).toBe(options.length);
        for (const option of options) {
          expect(option.trim(), `${template.id} offered a blank option`).not.toBe('');
          expect(option, `${template.id} leaked a placeholder`).not.toMatch(/null|undefined|\{/);
        }
      }
    }
  });

  it('prints only real numbers and real Georgian', () => {
    for (const template of U06_TEMPLATES) {
      for (const question of generateMany(template.id, 6)) {
        expect(question.prompt, `${template.id}: ${question.prompt}`).not.toMatch(/\{\w+\}/);
        // Latin letters would only appear if a placeholder failed to render.
        expect(question.prompt.match(/[A-Za-z]+/g) ?? [], `${template.id}: ${question.prompt}`).toEqual([]);
        expect(question.explanation, template.id).toBeTruthy();
        expect(question.explanation.length, `${template.id} explanation is empty`).toBeGreaterThan(5);
      }
    }
  });

  it('never prints a plural after a numeral', () => {
    // Georgian takes the singular after a count: „5 ვაშლი“, not „5 ვაშლები“.
    const plurals = ['ვაშლები', 'ვარსკვლავები', 'ბურთები', 'ბუშტები', 'თევზები', 'მსხლები', 'ბანანები'];
    for (const template of U06_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        for (const plural of plurals) {
          expect(question.prompt, `${template.id} printed „${plural}“`).not.toContain(plural);
        }
      }
    }
  });

  it('declines a name before „აქვს“ with the dative, never the genitive', () => {
    // „დავითს აქვს“, not „დავითის აქვს“: the possessor of „has“ takes the dative.
    // The genitive is the possessive form and would be right in „დავითის
    // ფანქარი“, which this unit does not print.
    const genitive = ['დავითის', 'მარიამის', 'ანას', 'ნინოს', 'ლუკას', 'გიორგის', 'სოფოს', 'ბექას'];
    for (const template of U06_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        const before = question.prompt.match(/([ა-ჰ]+)\s+აქვს/g) ?? [];
        for (const phrase of before) {
          const name = phrase.replace(/\s+აქვს$/, '');
          // A name that ends in -ს here is fine if it is the dative (ანას is
          // both); the failure is a *genitive-only* form appearing before აქვს.
          expect(genitive.includes(name) && name === 'დავითის', `„${phrase}“ uses the genitive`).toBe(
            false,
          );
          expect(genitive.includes(name) && name === 'მარიამის', `„${phrase}“ uses the genitive`).toBe(
            false,
          );
        }
      }
    }
  });
});

describe('U06 repeatability', () => {
  it('rebuilds the same question from the same seed', () => {
    for (const template of U06_TEMPLATES.slice(0, 12)) {
      const first = generateFromTemplate(template, { seed: 4242 });
      const second = generateFromTemplate(template, { seed: 4242 });
      expect(second.prompt).toBe(first.prompt);
      expect(second.answer).toBe(first.answer);
      expect(second.options).toEqual(first.options);
      expect(second.visual).toBe(first.visual);
    }
  });

  it('generates a question through the registry for every subtopic', () => {
    for (const subtopic of U06_SUBTOPICS) {
      expect(generateQuestion(ref(subtopic), 99), `${subtopic} generated nothing`).toBeTruthy();
    }
  });
});
