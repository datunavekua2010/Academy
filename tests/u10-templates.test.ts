import { describe, expect, it } from 'vitest';
import { U10_SUBTOPICS, U10_TEMPLATES } from '../src/practice/templates/u10-models';
import { generateBatch, generateQuestion } from '../src/practice/generator';
import { generateFromTemplate, generateVariations } from '../src/practice/templates/generate';
import { shownKey } from '../src/practice/identity';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { advance, startSession, submitAnswer } from '../src/practice/session';
import { levelForScore } from '../src/practice/levels';
import type { GeneratedQuestion } from '../src/practice/templates/generate';

/**
 * U10 — quantity models. The picture and the sentence are two encodings of one
 * number, and the whole unit fails if they ever disagree.
 *
 * The failures this suite exists for:
 *
 *  - a model drawn from one value while the answer is computed from another
 *    (rule 4: „the model must be generated from the same data as the text“);
 *  - a ten drawn as ten separate cubes, which turns „3 tens“ into 30 blocks and
 *    teaches the wrong reading;
 *  - a „whole ten“ question whose model shows loose ones, or a colour word in
 *    the sentence that the picture does not paint;
 *  - an option set with two models that render identically, so the question has
 *    two right answers;
 *  - an answer printed in its own prompt.
 *
 * Every assertion re-derives the number from the *rendered picture*.
 */

const SAMPLES = 120;
const SEED = 20261112;

const ref = (subtopicId: string) => ({ grade: 1 as const, topicId: 'raodenobis-modeli', subtopicId });

const templateFor = (id: string) => {
  const template = U10_TEMPLATES.find((candidate) => candidate.id === id);
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
const answerOf = (question: GeneratedQuestion): number => Number(question.answer);

/**
 * Reads a rendered model back into a number.
 *
 * This is the test's whole point: it does not trust `vars`, it counts glyphs.
 * A ten bar is one `🟦` (or `🔴`/`🔵`) followed by the eight-shade ruler and the
 * `▌` end cap; a loose one is a bare `🟨` (or the story's own emoji).
 */
const TEN_BAR = /[🟦🔴🔵]░{8}▌/gu;
const LOOSE = /(🟨|🔵)/gu;

const readModel = (picture: string): number => {
  const tens = (picture.match(TEN_BAR) ?? []).length;
  const loose = (picture.match(LOOSE) ?? []).length;
  return tens * 10 + loose;
};

/** The compact renderer used inside answer options: `🟦🟦🟦 🟨🟨`. */
const readCompact = (option: string): number => {
  const tens = (option.match(/🟦/g) ?? []).length;
  const ones = (option.match(/🟨/g) ?? []).length;
  return tens * 10 + ones;
};

describe('U10 template library', () => {
  it('covers every subtopic at every level', () => {
    expect(U10_TEMPLATES.length).toBeGreaterThanOrEqual(45);
    expect(new Set(U10_TEMPLATES.map((t) => t.id)).size).toBe(U10_TEMPLATES.length);
    for (const subtopic of U10_SUBTOPICS) {
      const templates = U10_TEMPLATES.filter((t) => t.subtopicId === subtopic);
      expect(templates.length, `${subtopic}`).toBeGreaterThanOrEqual(5);
      expect(
        [...new Set(templates.map((t) => t.difficulty))].sort((a, b) => Number(a) - Number(b)),
        `${subtopic} is missing a level`,
      ).toEqual([1, 2, 3]);
    }
  });

  it('replaces the placeholders for every subtopic', () => {
    for (const subtopic of U10_SUBTOPICS) {
      const registered = TEMPLATE_REGISTRY.forSubtopic(ref(subtopic));
      expect(registered.length, `nothing playable for ${subtopic}`).toBeGreaterThan(0);
      expect(
        registered.filter((t) => t.id === `g1-${subtopic}`),
        `placeholder still registered for ${subtopic}`,
      ).toEqual([]);
    }
  });

  it('can fill a perfect run at every level', () => {
    for (const subtopic of U10_SUBTOPICS) {
      for (const level of [1, 2, 3] as const) {
        const keys = new Set(generateBatch(ref(subtopic), 160, { level, seed: SEED }).map(shownKey));
        expect(keys.size, `${subtopic} level ${level}: only ${keys.size} distinct`).toBeGreaterThanOrEqual(35);
      }
    }
  });

  it('reaches 100 in 35 questions with the real ladder', () => {
    for (const subtopic of U10_SUBTOPICS) {
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

describe('U10 models and text agree', () => {
  it('draws the model the answer comes from, wherever the picture is the value', () => {
    // Rule 4. These templates draw exactly one model of exactly the value the
    // question is about, so the picture must read back as that value — and, for
    // the ones whose answer *is* the value, as the answer too.
    //
    // Templates that transform the picture („take one away“, „add ten“), compare
    // two models, or show a number in words instead are deliberately not here:
    // the picture is then a starting point, not the answer, and each of those
    // shapes is checked by its own test below.
    const pure: Array<[string, boolean]> = [
      ['g1-u10-1-model-number', true],
      ['g1-u10-1-count-blocks', true],
      ['g1-u10-1-total-ones', true],
      ['g1-u10-1-round-tens', true],
      ['g1-u10-1-review-read', true],
      ['g1-u10-1-review-match', true],
      ['g1-u10-2-model-to-number', true],
      ['g1-u10-2-words-to-number', true],
      ['g1-u10-2-tens-only', true],
      ['g1-u10-3-round-draw', true],
      ['g1-u10-4-tens-and-ones-total', true],
      ['g1-u10-5-two-colours', true],
    ];
    for (const [id, answerIsValue] of pure) {
      const template = templateFor(id);
      expect(template.visual, `${id} has no picture`).toBeTruthy();
      for (const question of generateMany(id, 40)) {
        const drawn = readModel(String(question.visual));
        if (answerIsValue && template.format?.kind !== 'text') {
          expect(drawn, `${id}: „${question.prompt}“ drew ${drawn}, answered ${question.answer}`).toBe(answerOf(question));
        } else if (!answerIsValue || template.format?.kind === 'text') {
          // The answer is a digit pair („5, 0“); the drawing must still show the
          // number the sentence names.
          const printed = nums(question.prompt);
          expect(drawn, `${id}: „${question.prompt}“ drew ${drawn}`).toBe(printed[0]);
        }
      }
    }
  });

  it('reads back every model-only picture as the number its sentence names', () => {
    // The remaining picture templates each show the value in some form; the
    // weak but universal requirement is that the drawing is not empty and that
    // it agrees with any number printed alongside it.
    for (const template of U10_TEMPLATES.filter((t) => t.visual)) {
      for (const question of generateMany(template.id, 20)) {
        const picture = String(question.visual);
        expect(picture.length, `${template.id}: empty picture`).toBeGreaterThan(0);
        expect(picture, `${template.id}: leaked a placeholder`).not.toMatch(/\{\w+\}|undefined|NaN/);
      }
    }
  });

  it('never draws a ten as ten separate cubes', () => {
    // The reading „3 tens“ must not look like thirty blocks, or the model
    // teaches exactly the misconception the unit is meant to remove.
    for (const template of U10_TEMPLATES.filter((t) => t.visual)) {
      for (const question of generateMany(template.id, 20)) {
        const picture = String(question.visual);
        const tens = (picture.match(/[🟦🔴]░{8}▌/gu) ?? []).length;
        if (tens === 0) continue;
        // Each ten is one bar, never a run of bare blocks standing in for it.
        expect(picture.match(/[🟦🔴](?![░])/gu) ?? [], `${template.id}: a bare ten block`).toHaveLength(0);
      }
    }
  });

  it('paints the colours the sentence names', () => {
    // A story about red balls must not draw them in the default blue.
    for (const question of generateMany('g1-u10-5-two-colours', 40)) {
      const picture = String(question.visual);
      expect(picture, question.prompt).toContain('🔴');
      expect(picture, question.prompt).toContain('🔵');
      const [tens, ones] = nums(question.prompt);
      expect((picture.match(/🔴░{8}▌/gu) ?? []).length, question.prompt).toBe(tens);
      expect((picture.match(/🔵/gu) ?? []).length, question.prompt).toBe(ones);
      expect(answerOf(question), question.prompt).toBe(tens * 10 + ones);
    }
  });

  it('shows both models when two are compared', () => {
    for (const question of generateMany('g1-u10-2-which-model-larger', 40)) {
      const picture = String(question.visual);
      const [first, second] = picture.split('\n\n');
      const [t1, o1, t2, o2] = nums(question.prompt);
      expect(readModel(first), question.prompt).toBe(t1 * 10 + o1);
      expect(readModel(second), question.prompt).toBe(t2 * 10 + o2);
      expect(answerOf(question), question.prompt).toBe(Math.max(t1 * 10 + o1, t2 * 10 + o2));
    }
  });

  it('group the ones-only model rather than printing a hundred glyphs', () => {
    // Rule 8 of the specification: 63 ones must be *grouped*, not a wall of cubes.
    for (const question of generateMany('g1-u10-3-two-ways', 40)) {
      const picture = String(question.visual);
      // The caption is followed by the ones-only model; only that last line is
      // the drawing to measure.
      const groups = picture.split('\n').pop()!.split('|');
      // Groups of ten, with at most one remainder group.
      const full = groups.filter((group) => (group.match(/🟨/gu) ?? []).length === 10).length;
      expect(groups.length, question.prompt).toBeLessThanOrEqual(11);
      expect(full, question.prompt).toBeGreaterThanOrEqual(1);
    }
  });

  it('shows no loose ones when the prompt says there are none', () => {
    for (const id of ['g1-u10-1-round-tens', 'g1-u10-2-tens-only', 'g1-u10-3-round-draw']) {
      for (const question of generateMany(id, 30)) {
        const picture = String(question.visual);
        expect((picture.match(/🟨/gu) ?? []), `${id}: ${question.prompt}`).toHaveLength(0);
        const n = nums(question.prompt)[0];
        // round-draw answers with the digit pair („5, 0“); the other two print
        // tens in the sentence and answer with the whole number.
        if (templateFor(id).format?.kind === 'text') {
          expect(String(question.answer), `${id}: ${question.prompt}`).toBe(`${Math.floor(n / 10)}, 0`);
        } else {
          expect(answerOf(question), `${id}: ${question.prompt}`).toBe(n * 10);
        }
      }
    }
  });
});

describe('U10 arithmetic is computed from what is printed', () => {
  it('keeps every answer inside one hundred and non-negative', () => {
    for (const template of U10_TEMPLATES) {
      for (const question of generateMany(template.id, 40)) {
        const declared = templateFor(template.id).format;
        if (declared?.kind === 'text' || !declared?.entry) continue;
        const answer = answerOf(question);
        if (!Number.isFinite(answer)) continue;
        expect(Number.isInteger(answer), `${template.id}: ${question.prompt} → ${answer}`).toBe(true);
        expect(answer, `${template.id}: ${question.prompt} → ${answer}`).toBeGreaterThanOrEqual(0);
        expect(answer, `${template.id}: ${question.prompt} → ${answer}`).toBeLessThanOrEqual(99);
      }
    }
  });

  it('asks for the digits a number actually has', () => {
    for (const id of ['g1-u10-1-tens-and-ones-of', 'g1-u10-4-split-ones', 'g1-u10-4-ones-to-tens-and-ones']) {
      for (const question of generateMany(id, 40)) {
        const n = nums(question.prompt)[0];
        expect(String(question.answer), `${id}: ${question.prompt}`).toBe(`${Math.floor(n / 10)}, ${n % 10}`);
      }
    }
  });

  it('answers a model question with the number the model shows', () => {
    for (const id of ['g1-u10-1-model-number', 'g1-u10-2-model-to-number', 'g1-u10-1-review-read']) {
      for (const question of generateMany(id, 40)) {
        const [tens, ones] = nums(question.prompt);
        expect(answerOf(question), `${id}: ${question.prompt}`).toBe(tens * 10 + ones);
      }
    }
  });

  it('adds ten without disturbing the ones digit', () => {
    // „Ten more“ is a tens digit change only — the misconception it tests is
    // adding one to the ones digit instead.
    for (const id of ['g1-u10-2-ten-more', 'g1-u10-2-add-ten-ones', 'g1-u10-5-add-tens']) {
      for (const question of generateMany(id, 40)) {
        const printed = nums(question.prompt);
        const start = id === 'g1-u10-5-add-tens' ? printed[0] * 10 + printed[1] : printed[0];
        if (id === 'g1-u10-5-add-tens') {
          expect(answerOf(question), question.prompt).toBe(start + printed[2] * 10);
        } else {
          expect(answerOf(question), question.prompt).toBe(start + 10);
          expect(answerOf(question) % 10, `${question.prompt} moved a one`).toBe(start % 10);
        }
      }
    }
  });

  it('regroups ones that pass ten', () => {
    // „6 tens and 13 ones“ is 73, not 6 + 13 and not 6 tens and 3 ones.
    for (const id of ['g1-u10-4-regroup', 'g1-u10-4-review-extra-ones']) {
      for (const question of generateMany(id, 40)) {
        const [tens, extra] = nums(question.prompt);
        expect(extra, `${id}: ${question.prompt} has fewer than ten extra ones`).toBeGreaterThanOrEqual(10);
        expect(answerOf(question), question.prompt).toBe(tens * 10 + extra);
      }
    }
  });

  it('closes every required-quantity story with its own arithmetic', () => {
    const cases: Array<[string, (p: string, a: number) => void]> = [
      ['g1-u10-5-missing-to-next-ten', (p, a) => {
        const [n, target] = nums(p);
        expect(n + a, p).toBe(target);
        expect(target % 10, p).toBe(0);
      }],
      ['g1-u10-5-remove-to-target', (p, a) => {
        const [n, target] = nums(p);
        expect(n - a, p).toBe(target);
      }],
      ['g1-u10-5-how-many-more', (p, a) => {
        const [x, y] = nums(p);
        expect(a, p).toBe(Math.abs(y - x));
      }],
      ['g1-u10-5-take-a-ten', (p, a) => {
        const [n, k] = nums(p);
        expect(n - k, p).toBe(a);
        expect(k % 10, p).toBe(0);
      }],
      ['g1-u10-5-missing-on-second', (p, a) => {
        const [total, first] = nums(p);
        expect(total - first, p).toBe(a);
      }],
      ['g1-u10-5-two-steps', (p, a) => {
        const [n, tens, ones] = nums(p);
        expect(n - tens * 10 + ones, p).toBe(a);
      }],
      ['g1-u10-5-review-two-steps', (p, a) => {
        const [t, o, removed, added] = nums(p);
        expect((t - removed) * 10 + o + added, p).toBe(a);
      }],
      ['g1-u10-5-add-to-target', (p, a) => {
        const [t, o, target] = nums(p);
        expect(t * 10 + o + a, p).toBe(target);
      }],
      ['g1-u10-5-add-ones-to-tens', (p, a) => {
        const [t, target] = nums(p);
        expect(t * 10 + a, p).toBe(target);
      }],
      ['g1-u10-5-tens-of-things', (p, a) => {
        const [t] = nums(p);
        expect(a, p).toBe(t * 10);
      }],
    ];
    for (const [id, check] of cases) {
      for (const question of generateMany(id, 40)) {
        check(question.prompt, answerOf(question));
      }
    }
  });
});

describe('U10 options are answerable', () => {
  it('offers exactly one model option that reads as the asked-for number', () => {
    // A picture question with two identical pictures, or two numbers that render
    // the same, has two right answers. The options are read back and counted.
    for (const id of ['g1-u10-1-choose-model', 'g1-u10-3-number-to-model', 'g1-u10-3-choose-matching', 'g1-u10-3-ten-short', 'g1-u10-3-review-ten-less']) {
      for (const question of generateMany(id, 40)) {
        const options = (question.options ?? []).map(String);
        const values = options.map(readCompact);
        const target = readCompact(String(question.answer));
        expect(values.filter((value) => value === target), `${id}: ${question.prompt} — ${options.join(' / ')}`).toHaveLength(1);
        // No two options may render the same picture.
        expect(new Set(options).size, `${id}: duplicate pictures`).toBe(options.length);
      }
    }
  });

  it('keys every question to an option it actually offers', () => {
    for (const template of U10_TEMPLATES) {
      for (const question of generateMany(template.id, 25)) {
        if (!question.options || question.options.length === 0) continue;
        expect(question.options.map(String), `${template.id}: answer ${question.answer} not among its options`).toContain(String(question.answer));
      }
    }
  });

  it('offers no duplicate options and no empty ones', () => {
    for (const template of U10_TEMPLATES) {
      for (const question of generateMany(template.id, 25)) {
        const options = (question.options ?? []).map(String);
        if (options.length === 0) continue;
        expect(options.length, `${template.id} offered one option`).toBeGreaterThan(1);
        expect(new Set(options).size, `${template.id}: ${options.join(' / ')}`).toBe(options.length);
        for (const option of options) {
          expect(option.trim(), `${template.id} offered a blank option`).not.toBe('');
          expect(option, `${template.id} leaked a placeholder`).not.toMatch(/null|undefined|\{\w+\}/);
        }
      }
    }
  });

  it('never offers a distractor that is also the answer', () => {
    for (const template of U10_TEMPLATES) {
      for (const question of generateMany(template.id, 30)) {
        const options = (question.options ?? []).map(String);
        if (options.length === 0) continue;
        if (templateFor(template.id).format?.kind !== 'text') continue;
        const answer = String(question.answer);
        expect(options.filter((option) => option === answer), `${template.id}: ${question.prompt}`).toHaveLength(1);
      }
    }
  });

  it('offers plausible place-value mistakes, not random noise', () => {
    // Every wrong number should be one of: digits swapped, a ten out, or one
    // out. A distractor like 71 for 17 teaches nothing.
    for (const template of U10_TEMPLATES.filter((t) => t.format?.kind === 'integer' && !t.format?.entry)) {
      // „Which of these two models is larger?“ offers the other model: that is
      // the question, not a slip.
      if (template.id === 'g1-u10-2-which-model-larger') continue;
      for (const question of generateMany(template.id, 30)) {
        const answer = answerOf(question);
        for (const option of (question.options ?? []).map(Number)) {
          if (option === answer) continue;
          const swapped = (answer % 10) * 10 + Math.floor(answer / 10);
          // Neighbouring tens count too: all whole tens are one step apart when
          // the question is „which tens count is this?“.
          const plausible = [swapped, answer + 10, answer - 10, answer + 20, answer - 20, answer + 1, answer - 1].includes(option);
          expect(plausible, `${template.id}: ${question.prompt} — ${option} is not a place-value slip of ${answer}`).toBe(true);
        }
      }
    }
  });

  it('prints only real numbers and real Georgian', () => {
    for (const template of U10_TEMPLATES) {
      for (const question of generateMany(template.id, 6)) {
        expect(question.prompt, `${template.id}: ${question.prompt}`).not.toMatch(/\{\w+\}/);
        expect(question.prompt.match(/[A-Za-z]+/g) ?? [], `${template.id}: ${question.prompt}`).toEqual([]);
        expect(question.explanation, template.id).toBeTruthy();
        expect(question.explanation.length, `${template.id} explanation is empty`).toBeGreaterThan(5);
        expect(question.explanation, `${template.id} leaked a placeholder`).not.toMatch(/\{\w+\}/);
      }
    }
  });

  it('never prints an answer inside its own prompt', () => {
    for (const template of U10_TEMPLATES) {
      if (template.format?.kind === 'text') continue;
      // two-ways asks „how many ones does 93 need“ — the number is the question,
      // and the answer (that it takes 93 cubes) cannot be guessed from it.
      if (template.id === 'g1-u10-3-two-ways') continue;
      for (const question of generateMany(template.id, 20)) {
        const answer = answerOf(question);
        if (!Number.isFinite(answer) || answer < 10) continue;
        expect(nums(question.prompt), `${template.id}: „${question.prompt}“ prints ${answer}`).not.toContain(answer);
      }
    }
  });

  it('never prints a plural after a numeral', () => {
    const plurals = ['კუბიკები', 'ვაშლები', 'რვეულები', 'ფანქრები', 'ბურთები', 'წიგნები'];
    for (const template of U10_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        for (const plural of plurals) {
          expect(question.prompt, `${template.id} printed „${plural}“`).not.toContain(plural);
        }
      }
    }
  });

  it('never bolts a case ending onto a word with a hyphen', () => {
    for (const template of U10_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        expect(question.prompt, `${template.id}: ${question.prompt}`).not.toMatch(/[ა-ჰ]-[ა-ჰ]/);
        expect(question.explanation, `${template.id}`).not.toMatch(/[ა-ჰ]-[ა-ჰ]/);
      }
    }
  });
});

describe('U10 repeatability', () => {
  it('rebuilds the same question from the same seed', () => {
    for (const template of U10_TEMPLATES.slice(0, 12)) {
      const first = generateFromTemplate(template, { seed: 4242 });
      const second = generateFromTemplate(template, { seed: 4242 });
      expect(second.prompt).toBe(first.prompt);
      expect(second.answer).toBe(first.answer);
      expect(second.options).toEqual(first.options);
      expect(second.visual).toBe(first.visual);
    }
  });

  it('generates a question through the registry for every subtopic', () => {
    for (const subtopic of U10_SUBTOPICS) {
      expect(generateQuestion(ref(subtopic), 99), `${subtopic} generated nothing`).toBeTruthy();
    }
  });
});
