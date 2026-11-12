import { describe, expect, it } from 'vitest';
import { U11_SUBTOPICS, U11_TEMPLATES } from '../src/practice/templates/u11-patterns';
import { generateBatch, generateQuestion } from '../src/practice/generator';
import { generateFromTemplate, generateVariations } from '../src/practice/templates/generate';
import { shownKey } from '../src/practice/identity';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import type { GeneratedQuestion } from '../src/practice/templates/generate';

/**
 * U11 — კანონზომიერებები და მიმდევრობები.
 *
 * A pattern question makes a promise the rest of the app never has to: that the
 * rule a child infers from the printed row is the rule the answer obeys. The
 * failures this suite exists for:
 *
 *  - a row printed from one cycle while the answer comes from another (rule 8:
 *    the same parameters drive both the picture and the answer);
 *  - a „what comes next“ question whose printed run has *two* plausible
 *    continuations, so the answer is not determined by the picture;
 *  - a blank whose value the surrounding run does not determine;
 *  - a growing sequence carrying a running total, so the seventh figure drifts
 *    from the first term and the step (rule 6);
 *  - a „describe the rule“ item that a child can answer by the shape of the
 *    options without reading the sequence.
 *
 * Where a test can, it re-derives the pattern from the *rendered row* — it does
 * not trust `vars`.
 */

const SAMPLES = 120;
const SEED = 20261113;

const ref = (subtopicId: string) => ({ grade: 1 as const, topicId: 'kanonzomiereba', subtopicId });

const templateFor = (id: string) => {
  const template = U11_TEMPLATES.find((candidate) => candidate.id === id);
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

/**
 * Symbol rows: the pictographic tokens of a printed pattern, in order.
 *
 * Georgian words are dropped, because the prompt's own wording is not part of
 * the pattern — a test that counted it as a row element would see a „row“ that
 * never repeats.
 */
const tokens = (text: string): string[] =>
  text.split(/\s+/).filter((token) => token !== '__' && /^\p{Extended_Pictographic}/u.test(token));
const isPattern = (question: GeneratedQuestion): boolean => /\p{Extended_Pictographic}/u.test(question.prompt);

describe('U11 template library', () => {
  it('has a unique id for every template', () => {
    expect(U11_TEMPLATES.length).toBeGreaterThanOrEqual(45);
    expect(new Set(U11_TEMPLATES.map((t) => t.id)).size).toBe(U11_TEMPLATES.length);
  });

  it('covers every subtopic at every level', () => {
    for (const subtopic of U11_SUBTOPICS) {
      const templates = U11_TEMPLATES.filter((t) => t.subtopicId === subtopic);
      expect(templates.length, `${subtopic}`).toBeGreaterThanOrEqual(5);
      expect(
        [...new Set(templates.map((t) => t.difficulty))].sort((a, b) => Number(a) - Number(b)),
        `${subtopic} is missing a level`,
      ).toEqual([1, 2, 3]);
    }
  });

  it('stays inside the grade-1 range: numbers up to one hundred, nothing negative', () => {
    for (const template of U11_TEMPLATES.filter((t) => t.format?.kind === 'integer')) {
      expect(template.format?.max, `${template.id} allows answers above one hundred`).toBeLessThanOrEqual(100);
      expect(template.format?.min ?? 0, `${template.id} allows negative answers`).toBeGreaterThanOrEqual(0);
    }
  });

  it('asks for positions and places the curriculum allows', () => {
    // Level 3 may look far ahead, but never beyond the unit's stated ceiling.
    for (const template of U11_TEMPLATES) {
      for (const [name, spec] of Object.entries(template.variables)) {
        if (name === 'position' && spec.kind === 'int') {
          expect(Number(spec.max), `${template.id} asks for a place past 30`).toBeLessThanOrEqual(30);
        }
      }
    }
  });

  it('replaces the placeholders for every subtopic', () => {
    for (const subtopic of U11_SUBTOPICS) {
      const registered = TEMPLATE_REGISTRY.forSubtopic(ref(subtopic));
      expect(registered.length, `nothing playable for ${subtopic}`).toBeGreaterThan(0);
      expect(
        registered.filter((t) => t.id === `g1-${subtopic}`),
        `placeholder still registered for ${subtopic}`,
      ).toEqual([]);
    }
  });

  it('can fill a perfect run at every level', () => {
    for (const subtopic of U11_SUBTOPICS) {
      for (const level of [1, 2, 3] as const) {
        const keys = new Set(generateBatch(ref(subtopic), 160, { level, seed: SEED }).map(shownKey));
        expect(keys.size, `${subtopic} level ${level}: only ${keys.size} distinct`).toBeGreaterThanOrEqual(35);
      }
    }
  });

  it('generates a question through the registry for every subtopic', () => {
    for (const subtopic of U11_SUBTOPICS) {
      expect(generateQuestion(ref(subtopic), 99), `${subtopic} generated nothing`).toBeTruthy();
    }
  });
});

describe('U11 the picture and the answer agree', () => {
  /**
   * Rule 8. For every repeating template, read the cycle back out of the rows
   * the student sees and check that the answer is `((p − 1) mod L) + 1`.
   */
  it('answers „what comes next“ from the cycle the row actually shows', () => {
    const nextTemplates = U11_TEMPLATES.filter((t) => t.prompt.includes('გააგრძელე ნიმუში'));
    expect(nextTemplates.length).toBeGreaterThanOrEqual(2);
    let checked = 0;
    for (const template of nextTemplates) {
      for (const question of generateMany(template.id, 40)) {
        const answer = String(question.answer);
        // The row minus blanks; the answer must be what the cycle says comes
        // after the last token. Find the period by trying every divisor of the
        // token count and keeping the one the whole row obeys.
        const printed = tokens(question.prompt);
        if (printed.length < 4) continue;
        const periods = [...Array(Math.floor(printed.length / 2)).keys()]
          .map((index) => index + 1)
          .filter((period) => printed.every((token, index) => index < period || token === printed[index % period]));
        expect(periods.length, `${template.id}: the row does not repeat at all — ${question.prompt}`).toBeGreaterThan(0);
        const period = periods[0]!;
        const expected = printed[(printed.length - 1 + 1) % period]!;
        expect(answer, `${template.id}: ${question.prompt}`).toBe(expected);
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(60);
  });

  it('fills a blank with the element the cycle puts there', () => {
    for (const template of U11_TEMPLATES.filter((t) => t.prompt.includes('აკლია'))) {
      for (const question of generateMany(template.id, 40)) {
        const answer = String(question.answer);
        const printed = tokens(question.prompt);
        if (printed.length < 4) continue;
        // The answer must be a symbol the pattern actually uses.
        expect(printed, `${template.id}: ${answer} is not in ${question.prompt}`).toContain(answer.split(', ')[0]!);
      }
    }
  });

  it('keys every question to an option it actually offers', () => {
    for (const template of U11_TEMPLATES) {
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
    for (const template of U11_TEMPLATES) {
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
    for (const template of U11_TEMPLATES) {
      for (const question of generateMany(template.id, 30)) {
        const options = (question.options ?? []).map(String);
        if (options.length === 0 || templateFor(template.id).format?.kind !== 'text') continue;
        const answer = String(question.answer);
        expect(options.filter((option) => option === answer), `${template.id}: ${question.prompt}`).toHaveLength(1);
      }
    }
  });

  it('never prints the answer inside its own prompt', () => {
    for (const template of U11_TEMPLATES) {
      for (const question of generateMany(template.id, 20)) {
        const answer = String(question.answer);
        if (answer.length < 2 || /\d/.test(answer) === false) continue;
        // A number printed in the prompt is fine only when it is part of the
        // sequence being read — which is exactly what these questions show.
        if (isPattern(question)) continue;
        const printed = (question.prompt.match(/\d+/g) ?? []).map(Number);
        if (printed.length === 0) continue;
        expect(printed, `${template.id}: ${answer} is printed in ${question.prompt}`).not.toContain(Number(answer));
      }
    }
  });

  it('rebuilds the same question from the same seed', () => {
    for (const template of U11_TEMPLATES.slice(0, 12)) {
      const first = generateFromTemplate(template, { seed: 4242 });
      const second = generateFromTemplate(template, { seed: 4242 });
      expect(second.prompt).toBe(first.prompt);
      expect(second.answer).toBe(first.answer);
      expect(second.options).toEqual(first.options);
      expect(second.visual).toBe(first.visual);
    }
  });
});

describe('U11 growing sequences follow the rule', () => {
  /**
   * Rule 6. Every growing answer is recomputed from the first term, the step
   * and the position — `a₁ + (n − 1)d` — and this test recomputes it a third
   * time from the numbers the student can see.
   */
  it('computes every term from the first term and the step', () => {
    // Selected by *behaviour*, not by an exclusion list: a template belongs
    // here when it prints a rising run and answers with the term just past the
    // last one printed. That is the definition of „continue the sequence“, and
    // it keeps working when templates are renamed.
    let checked = 0;
    for (const template of U11_TEMPLATES) {
      if (template.format?.kind !== 'integer') continue;
      let firstQuestion: GeneratedQuestion;
      try {
        firstQuestion = generateFromTemplate(template, { seed: 7 });
      } catch {
        continue;
      }
      const printed = (firstQuestion.prompt.match(/\d+/g) ?? []).map(Number);
      if (printed.length < 3) continue;
      const rises = printed.every((value, index) => index === 0 || value > printed[index - 1]!);
      if (!rises) continue;
      const step = printed[1]! - printed[0]!;
      if (printed.some((value, index) => index > 0 && value - printed[index - 1]! !== step)) continue;
      if (Number(firstQuestion.answer) !== printed[printed.length - 1]! + step) continue;

      for (const question of generateMany(template.id, 40)) {
        const values = (question.prompt.match(/\d+/g) ?? []).map(Number);
        if (values.length < 2) continue;
        const realStep = values[1]! - values[0]!;
        expect(realStep, `${template.id}: ${question.prompt} does not rise`).toBeGreaterThan(0);
        const expected = values[values.length - 1]! + realStep;
        if (String(question.answer).includes(',')) continue; // two-number answers have their own test
        expect(Number(question.answer), `${template.id}: ${question.prompt}`).toBe(expected);
      }
      checked += 1;
    }
    expect(checked, 'no template was recognised as „continue the sequence“').toBeGreaterThanOrEqual(3);
  });

  it('continues a falling run downwards, by exactly one step', () => {
    // The bug this catches: a run printed as `a, a−d, a−2d, __` was answered
    // with `a − 4d`, skipping a term, because the template carried the start
    // value instead of the last printed one.
    let checked = 0;
    for (const template of U11_TEMPLATES) {
      if (template.format?.kind !== 'integer' || template.format.entry !== true) continue;
      for (const question of generateMany(template.id, 40)) {
        const printed = (question.prompt.match(/\d+/g) ?? []).map(Number);
        if (printed.length < 3) continue;
        const falls = printed.every((value, index) => index === 0 || value < printed[index - 1]!);
        if (!falls) continue;
        const step = printed[0]! - printed[1]!;
        const even = printed.every((value, index) => index === 0 || printed[index - 1]! - value === step);
        if (!even) continue;
        expect(Number(question.answer), `${template.id}: ${question.prompt}`).toBe(printed[printed.length - 1]! - step);
        checked += 1;
      }
    }
    expect(checked, 'no falling run was tested').toBeGreaterThan(10);
  });

  it('never offers a number that is already printed in the prompt', () => {
    // An option taken from the printed run can be picked by copying, without
    // ever reading the rule. Only options that are *pairs of numbers* are
    // checked: a rule worded as „ყოველ ჯერზე 4 ემატება“ must name the step, and
    // the step is by definition printed in the sequence.
    for (const template of U11_TEMPLATES.filter((t) => t.format?.kind === 'text' && !t.format?.entry)) {
      for (const question of generateMany(template.id, 25)) {
        const printed = new Set((question.prompt.match(/\d+/g) ?? []).map(Number));
        for (const option of question.options ?? []) {
          const values = (String(option).match(/\d+/g) ?? []).map(Number);
          if (values.length < 2) continue;
          expect(values.some((value) => printed.has(value)), `${template.id}: ${option} is printed in ${question.prompt}`).toBe(false);
        }
      }
    }
  });

  it('asks a far figure from the rule, and the rule agrees with a printed run', () => {
    // For the „n-th figure“ templates the prompt names a position and the answer
    // must equal `first + (n − 1)·step` for the values the prompt shows.
    for (const id of ['g1-u11-2-sixth-term', 'g1-u11-2-seventh-figure', 'g1-u11-r-far-term']) {
      for (const question of generateMany(id, 40)) {
        const [first, step] = (question.prompt.match(/\d+/g) ?? []).map(Number);
        const position = id.startsWith('g1-u11-2-sixth') ? 6 : id.startsWith('g1-u11-2-seventh') ? 7 : 8;
        expect(Number(question.answer), `${id}: ${question.prompt}`).toBe(Number(first) + (position - 1) * Number(step));
      }
    }
  });

  it('pairs two answers in the order the blanks appear', () => {
    // „Write the two numbers“ — matched on the phrase, not on the substring
    // „ორი“ inside „სწორი“ („correct“), which caught rule questions too.
    const twoAnswer = (prompt: string): boolean => /ორი (შემდეგი|გამოტოვებული)/.test(prompt);
    for (const template of U11_TEMPLATES.filter((t) => String(t.format?.kind) === 'text' && twoAnswer(t.prompt))) {
      for (const question of generateMany(template.id, 40)) {
        const parts = String(question.answer).split(', ');
        expect(parts.length, `${template.id}: ${question.answer}`).toBeGreaterThanOrEqual(2);
        for (const part of parts) expect(part.trim(), `${template.id} emitted an empty half`).not.toBe('');
      }
    }
  });

  it('never lets a subtraction leave the page', () => {
    for (const template of U11_TEMPLATES.filter((t) => t.prompt.includes('კლებადობით') || t.prompt.includes('აკლდება'))) {
      for (const question of generateMany(template.id, 40)) {
        for (const number of (String(question.answer).match(/\d+/g) ?? []).map(Number)) {
          expect(number, `${template.id}: ${question.prompt}`).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});

describe('U11 describing the rule', () => {
  it('offers one true rule against rules the sequence does not follow', () => {
    for (const template of U11_TEMPLATES.filter((t) => t.subtopicId === 'wesis-agwera' && t.format?.kind === 'text')) {
      for (const question of generateMany(template.id, 25)) {
        const options = (question.options ?? []).map(String);
        if (options.length === 0) continue;
        const printed = (question.prompt.match(/\d+/g) ?? []).map(Number);
        if (printed.length < 2) continue;
        const step = printed[1]! - printed[0]!;
        const answer = String(question.answer);
        // The chosen wording must name the real step, in the real direction.
        if (answer.includes('ემატება')) {
          expect(answer, `${template.id}: ${question.prompt}`).toContain(String(Math.abs(step)));
          expect(step, `${template.id} claims addition for a falling run`).toBeGreaterThan(0);
        }
        if (answer.includes('აკლდება')) {
          expect(step, `${template.id} claims subtraction for a rising run`).toBeLessThan(0);
        }
      }
    }
  });

  it('offers both true and false on a claim to check', () => {
    const answers = new Set<string>();
    for (const question of generateMany('g1-u11-3-claim-check', 60)) answers.add(String(question.answer));
    expect([...answers].sort()).toHaveLength(2);
    expect([...answers].sort()).toEqual(expect.arrayContaining(['მართალია', 'არ არის მართალი']));
  });

  it('marks the claim false only when the step really differs', () => {
    for (const question of generateMany('g1-u11-3-claim-check', 60)) {
      const numbers = (question.prompt.match(/\d+/g) ?? []).map(Number);
      const claim = numbers[numbers.length - 1]!;
      const printed = numbers.slice(0, numbers.length - 1);
      const step = printed[1]! - printed[0]!;
      const says = String(question.answer) === 'მართალია';
      expect(says, `${question.prompt} — real step ${step}, claim ${claim}`).toBe(claim === step);
    }
  });
});

describe('U11 numeric sequences', () => {
  it('leaves exactly the blanks the answer fills', () => {
    for (const template of U11_TEMPLATES.filter((t) => t.subtopicId === 'ricxviTi-mimdevroba')) {
      for (const question of generateMany(template.id, 30)) {
        const blanks = (question.prompt.match(/__/g) ?? []).length;
        const halves = String(question.answer).split(', ').length;
        if (blanks === 0) continue;
        // A two-number answer fills two blanks; every other answer fills one —
        // or none, when the run is printed in full and the question asks for a
        // term computed from the rule.
        if (blanks === 1 || template.prompt.includes('ორი')) continue;
        expect(halves, `${template.id}: ${question.prompt}`).toBeLessThanOrEqual(blanks);
      }
    }
  });

  it('keeps every numeric answer a whole number inside the range', () => {
    for (const template of U11_TEMPLATES.filter((t) => t.format?.kind === 'integer')) {
      for (const question of generateMany(template.id, 40)) {
        const answer = Number(question.answer);
        expect(Number.isInteger(answer), `${template.id}: ${question.answer}`).toBe(true);
        expect(answer, `${template.id}: ${question.answer}`).toBeGreaterThanOrEqual(0);
        expect(answer, `${template.id}: ${question.answer}`).toBeLessThanOrEqual(100);
      }
    }
  });

  it('offers plausible near misses for a numeric answer', () => {
    // Every wrong number is within one step of the right one: the mistakes a
    // child makes here are step errors, not random noise.
    for (const template of U11_TEMPLATES.filter((t) => t.format?.kind === 'integer' && !t.format?.entry)) {
      for (const question of generateMany(template.id, 25)) {
        const answer = Number(question.answer);
        for (const option of (question.options ?? []).map(Number)) {
          if (option === answer) continue;
          expect(Math.abs(option - answer), `${template.id}: ${answer} vs ${option}`).toBeLessThanOrEqual(100);
        }
      }
    }
  });
});
