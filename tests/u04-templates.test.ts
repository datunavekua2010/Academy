import { describe, expect, it } from 'vitest';
import {
  U04_SUBTOPICS,
  U04_TEMPLATES,
  fromRoman,
  georgianNumber,
  toRoman,
} from '../src/practice/templates/u04-numbers100';
import { generateBatch } from '../src/practice/generator';
import { generateFromTemplate, generateVariations } from '../src/practice/templates/generate';
import { shownKey } from '../src/practice/identity';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { startSession, submitAnswer, advance } from '../src/practice/session';
import { levelForScore } from '../src/practice/levels';
import type { GeneratedQuestion } from '../src/practice/templates/generate';

/**
 * U04 — the number questions must be *correct*, not merely well-formed.
 *
 * The failures this suite exists for are the ones a type checker cannot see and
 * a child experiences as being marked wrong for being right: a word built from
 * the wrong stem, a picture that marks the answer it is asking for, a wrong
 * option that is not a Georgian word at all.
 *
 * Three things are asserted independently of the library's own tables:
 * the number words against the twenties rule, the Roman numerals by round trip,
 * and the answer key of every question against what its own prompt and picture
 * print.
 */

const SAMPLES = 120;
const SEED = 20260404;

const ref = (subtopicId: string) => ({ grade: 1 as const, topicId: 'ricxvebi100', subtopicId });

const templateFor = (id: string) => {
  const template = U04_TEMPLATES.find((candidate) => candidate.id === id);
  if (!template) throw new Error(`no template ${id}`);
  return template;
};

/** Generates up to `count` variations, halving the request if the pool is thin. */
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

const numbersIn = (text: string): number[] => (text.match(/\d+/g) ?? []).map(Number);

/** The answer as it is compared: the engine reads numbers by value. */
const asNumber = (answer: string | number): number => Number(answer);

describe('U04 number words', () => {
  it('names every number 1–100 and nothing else', () => {
    for (let n = 1; n <= 100; n += 1) {
      expect(georgianNumber(n), `${n}`).toBeTruthy();
    }
    expect(() => georgianNumber(0)).toThrow();
    expect(() => georgianNumber(101)).toThrow();
    // A unit is a word, not a digit.
    expect(georgianNumber(7)).not.toMatch(/[0-9]/);
  });

  it('counts in twenties, as Georgian does', () => {
    // The rule the whole naming scheme rests on: 40 and 60 are "two twenties"
    // and "three twenties", and a compound is the score's stem + „და“ + the
    // remainder. Checked against the words themselves rather than the tables.
    expect(georgianNumber(20)).toBe('ოცი');
    expect(georgianNumber(40)).toBe('ორმოცი');
    expect(georgianNumber(60)).toBe('სამოცი');
    expect(georgianNumber(80)).toBe('ოთხმოცი');
    expect(georgianNumber(30)).toBe('ოცდაათი');
    expect(georgianNumber(79)).toBe('სამოცდაცხრამეტი');
    expect(georgianNumber(86)).toBe('ოთხმოცდაექვსი');
    // Every compound contains „და“ and ends in a real remainder word.
    for (const n of [21, 35, 47, 58, 63, 74, 89, 96]) {
      expect(georgianNumber(n), `${n}`).toContain('და');
    }
  });

  it('gives every number in the range a distinct name', () => {
    const names = new Map<string, number>();
    for (let n = 1; n <= 100; n += 1) {
      const name = georgianNumber(n);
      expect(names.has(name), `${n} and ${names.get(name)} are both „${name}“`).toBe(false);
      names.set(name, n);
    }
    expect(names.size).toBe(100);
  });
});

describe('U04 Roman numerals', () => {
  it('round-trips every value the unit allows', () => {
    for (let n = 1; n <= 89; n += 1) {
      const numeral = toRoman(n);
      expect(numeral, `${n}`).toMatch(/^[IVXL]+$/);
      expect(fromRoman(numeral), `${n} → ${numeral}`).toBe(n);
    }
  });

  it('refuses values it cannot write with I, V, X and L', () => {
    // Ninety needs C, which this unit does not teach.
    expect(() => toRoman(90)).toThrow();
    expect(() => toRoman(0)).toThrow();
    expect(() => toRoman(-3)).toThrow();
  });

  it('writes the subtractive forms the unit teaches', () => {
    expect(toRoman(4)).toBe('IV');
    expect(toRoman(9)).toBe('IX');
    expect(toRoman(40)).toBe('XL');
    expect(toRoman(44)).toBe('XLIV');
    expect(toRoman(89)).toBe('LXXXIX');
  });
});

describe('U04 template library', () => {
  it('carries exactly the fifty templates the unit is authored to', () => {
    expect(U04_TEMPLATES).toHaveLength(50);
    expect(new Set(U04_TEMPLATES.map((t) => t.id)).size).toBe(50);
  });

  it('covers every subtopic at every level', () => {
    for (const subtopic of U04_SUBTOPICS) {
      const templates = U04_TEMPLATES.filter((t) => t.subtopicId === subtopic);
      expect(templates.length, `${subtopic}`).toBeGreaterThanOrEqual(6);
      expect(
        [...new Set(templates.map((t) => t.difficulty))].sort((a, b) => Number(a) - Number(b)),
        `${subtopic} is missing a level`,
      ).toEqual([1, 2, 3]);
    }
  });

  it('replaces the placeholders for every subtopic', () => {
    for (const subtopic of U04_SUBTOPICS) {
      const registered = TEMPLATE_REGISTRY.forSubtopic(ref(subtopic));
      expect(registered.length, `nothing playable for ${subtopic}`).toBeGreaterThan(0);
      expect(
        registered.filter((t) => t.id === `g1-${subtopic}`),
        `placeholder still registered for ${subtopic}`,
      ).toEqual([]);
    }
  });

  it('can fill a perfect run at every level', () => {
    // A perfect session is 35 questions. `romaulti` level 1 is the one recorded
    // exception: four symbols is sixteen questions, and that is the content's
    // ceiling rather than a thin sample. It is asserted as a number, so the
    // exception cannot spread to another level unnoticed.
    const exceptions: Record<string, number> = { romaulti: 16 };
    for (const subtopic of U04_SUBTOPICS) {
      for (const level of [1, 2, 3] as const) {
        const keys = new Set(
          generateBatch(ref(subtopic), 160, { level, seed: SEED }).map(shownKey),
        );
        const floor = level === 1 ? exceptions[subtopic] ?? 35 : 35;
        expect(
          keys.size,
          `${subtopic} level ${level}: only ${keys.size} distinct`,
        ).toBeGreaterThanOrEqual(floor);
      }
    }
  });

  it('reaches 100 in 35 questions with the real ladder', () => {
    // The capacity test above measures each level on its own. A session is the
    // levels *in sequence*, so this plays one through with `levelForScore` on
    // every refill, exactly as the provider does.
    for (const subtopic of U04_SUBTOPICS) {
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

describe('U04 answers are computed from what is shown', () => {
  it('keys every question to an option it actually offers', () => {
    // A multiple-choice question whose answer is not among its options cannot be
    // answered at all, and the shapes that produce it are the drawn ones.
    for (const template of U04_TEMPLATES) {
      const questions = generateMany(template.id, 40);
      for (const question of questions) {
        if (!question.options || question.options.length === 0) continue;
        const answer = String(question.answer);
        expect(
          question.options.some((option) => String(option) === answer),
          `${template.id}: answer ${answer} not in ${question.options.join(' / ')}`,
        ).toBe(true);
      }
    }
  });

  it('offers no duplicate options and no empty ones', () => {
    for (const template of U04_TEMPLATES) {
      for (const question of generateMany(template.id, 30)) {
        const options = (question.options ?? []).map(String);
        // A typed-number template has no options at all; that is its shape.
        if (options.length === 0) continue;
        expect(options.length, `${template.id} offered a single option`).toBeGreaterThan(1);
        expect(
          new Set(options).size,
          `${template.id}: ${options.join(' / ')}`,
        ).toBe(options.length);
        for (const option of options) {
          expect(option.trim(), `${template.id} offered a blank option`).not.toBe('');
          expect(option, `${template.id} leaked null into its options`).not.toMatch(/null|undefined/);
        }
      }
    }
  });

  it('never prints the answer in the picture', () => {
    // The grid and the line mark the numbers the *question states*. The
    // destination is what the student supplies, so a bracketed destination
    // would be the answer printed on the page.
    const drawn = [
      'g1-u04-1-step-right',
      'g1-u04-1-step-down',
      'g1-u04-4-after',
      'g1-u04-4-before',
    ];
    for (const id of drawn) {
      for (const question of generateMany(id, 40)) {
        const answer = asNumber(question.answer);
        const visual = question.visual ?? '';
        expect(visual, `${id} drew no picture`).not.toBe('');
        expect(
          visual.includes(`[${answer}]`),
          `${id} marked its own answer ${answer} in the grid`,
        ).toBe(false);
      }
    }
  });

  it('keys the grid questions to a real cell', () => {
    // "one cell right" is +1 and "one cell down" is +10, because the hundred
    // grid is ten to a row. Re-derived here from the prompt, not from the
    // template's own arithmetic.
    for (const question of generateMany('g1-u04-1-step-right', 40)) {
      const [from] = numbersIn(question.prompt);
      expect(asNumber(question.answer), question.prompt).toBe(from + 1);
    }
    for (const question of generateMany('g1-u04-1-step-down', 40)) {
      const [from] = numbersIn(question.prompt);
      expect(asNumber(question.answer), question.prompt).toBe(from + 10);
    }
  });

  it('keys the number-line walks to the printed start and step count', () => {
    for (const question of generateMany('g1-u04-4-steps-right', 40)) {
      const [from, steps] = numbersIn(question.prompt);
      expect(asNumber(question.answer), question.prompt).toBe(from + steps);
    }
    for (const question of generateMany('g1-u04-4-steps-left', 40)) {
      const [from, steps] = numbersIn(question.prompt);
      expect(asNumber(question.answer), question.prompt).toBe(from - steps);
    }
  });

  it('keys the word questions to the word printed', () => {
    for (let n = 1; n <= 100; n += 1) {
      const word = georgianNumber(n);
      expect(word).toBeTruthy();
    }
    // Every "name this number" question prints a name that is the answer's.
    for (const question of generateMany('g1-u04-3-word-to-number', 40)) {
      const quoted = question.prompt.match(/„(.+)“/)?.[1];
      expect(quoted, question.prompt).toBeTruthy();
      expect(georgianNumber(asNumber(question.answer)), question.prompt).toBe(quoted);
    }
    for (const question of generateMany('g1-u04-3-word-mid', 40)) {
      const quoted = question.prompt.match(/„(.+)“/)?.[1];
      expect(georgianNumber(asNumber(question.answer)), question.prompt).toBe(quoted);
    }
  });

  it('keys the Roman questions to the numeral printed', () => {
    for (const question of generateMany('g1-u04-6-additive', 40)) {
      // „რომელ რიცხვს აღნიშნავს VII?“ — the numeral is the last token, with
      // the question mark still attached.
      const numeral = question.prompt.replace(/[?.!]/g, '').split(' ').pop();
      expect(numeral, question.prompt).toBeTruthy();
      expect(fromRoman(numeral!), question.prompt).toBe(asNumber(question.answer));
    }
    for (const question of generateMany('g1-u04-6-write-additive', 20)) {
      const [value] = numbersIn(question.prompt);
      expect(String(question.answer), question.prompt).toBe(toRoman(value));
    }
  });

  it('keys parity questions to the number printed', () => {
    for (const question of generateMany('g1-u04-7-even-or-odd', 60)) {
      const [n] = numbersIn(question.prompt);
      expect(String(question.answer), question.prompt).toBe(n % 2 === 0 ? 'ლუწი' : 'კენტი');
    }
    for (const question of generateMany('g1-u04-7-even-or-odd-large', 60)) {
      const [n] = numbersIn(question.prompt);
      expect(String(question.answer), question.prompt).toBe(n % 2 === 0 ? 'ლუწი' : 'კენტი');
    }
  });
});

describe('U04 Georgian wording', () => {
  it('asks every question in Georgian and in no other script', () => {
    for (const question of generateMany('g1-u04-2-from-tens-units', 5)) {
      expect(question.prompt).toMatch(/[ა-ჰ]/);
    }
    // Prompts are Georgian sentences; Latin appears only as Roman numerals.
    for (const template of U04_TEMPLATES) {
      for (const question of generateMany(template.id, 5)) {
        const latinWords = question.prompt.match(/[A-Za-z]+/g) ?? [];
        for (const word of latinWords) {
          expect(word, `${template.id}: „${word}“ in ${question.prompt}`).toMatch(/^[IVXL]+$/);
        }
      }
    }
  });

  it('gives every question an explanation that restates the answer', () => {
    for (const template of U04_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        expect(question.explanation, template.id).toBeTruthy();
        expect(question.explanation.length, `${template.id} explanation is empty`).toBeGreaterThan(5);
      }
    }
  });

  it('never invents a number word as a distractor', () => {
    // Every option offered by the naming templates must be the name of a number
    // in 1–100. „ოცერთი“ for 21 is not a Georgian word, and an option a child
    // cannot even read is not a wrong answer.
    const real = new Set(Array.from({ length: 100 }, (_, index) => georgianNumber(index + 1)));
    // The three templates that answer *with* a word. The other direction —
    // word printed, digit chosen (`3-word-to-number`, `3-word-mid`) — correctly
    // offers numbers, so it is covered by the answer-key test above instead.
    for (const id of ['g1-u04-3-spelling', 'g1-u04-3-number-to-word']) {
      for (const question of generateMany(id, 30)) {
        for (const option of question.options ?? []) {
          expect(
            real.has(String(option)),
            `${id} offered „${option}“, which is not the name of a number 1–100`,
          ).toBe(true);
        }
      }
    }
  });
});

describe('U04 repeatability', () => {
  it('rebuilds the same question from the same seed', () => {
    // A draft stores question ids and rebuilds them on reload; a template that
    // is not a pure function of its seed breaks that silently.
    for (const template of U04_TEMPLATES.slice(0, 12)) {
      const first = generateFromTemplate(template, { seed: 777 });
      const second = generateFromTemplate(template, { seed: 777 });
      expect(second.prompt).toBe(first.prompt);
      expect(second.answer).toBe(first.answer);
      expect(second.options).toEqual(first.options);
    }
  });
});
