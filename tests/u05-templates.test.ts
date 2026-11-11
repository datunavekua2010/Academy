import { describe, expect, it } from 'vitest';
import {
  U05_SUBTOPICS,
  U05_TEMPLATES,
  nearestTen,
  signOf,
} from '../src/practice/templates/u05-compare';
import { generateBatch, generateQuestion } from '../src/practice/generator';
import { generateFromTemplate, generateVariations } from '../src/practice/templates/generate';
import { shownKey } from '../src/practice/identity';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { advance, startSession, submitAnswer } from '../src/practice/session';
import { levelForScore } from '../src/practice/levels';
import type { GeneratedQuestion } from '../src/practice/templates/generate';

/**
 * U05 — the comparison questions must be *correct*, not merely well-formed.
 *
 * Three failures this suite exists for, none of which a type checker can see:
 *
 *  - a sign that does not match the two numbers printed beside it;
 *  - a "nearest ten" that uses a half-way rule other than the one the unit
 *    prescribes (five rounds up);
 *  - an ordering key that is a sequence of the *values* rather than of the
 *    positions the student actually taps.
 *
 * Every assertion re-derives the answer from what the student is shown.
 */

const SAMPLES = 120;
const SEED = 20260505;

const ref = (subtopicId: string) => ({ grade: 1 as const, topicId: 'Sedareba', subtopicId });

const templateFor = (id: string) => {
  const template = U05_TEMPLATES.find((candidate) => candidate.id === id);
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

const nums = (text: string): number[] => (text.match(/\d+/g) ?? []).map(Number);

/** The parsed ordering key: the answer as a list of one-based positions. */
const orderKey = (answer: string): number[] => answer.split(',').map((part) => Number(part.trim()));

describe('U05 rounding rule', () => {
  it('rounds a half up, as the unit prescribes', () => {
    // The one case that has to be decided once and never re-decided.
    expect(nearestTen(25)).toBe(30);
    expect(nearestTen(75)).toBe(80);
    expect(nearestTen(15)).toBe(20);
    expect(nearestTen(95)).toBe(100);
    expect(nearestTen(105)).toBe(110);
  });

  it('rounds below five down and above five up', () => {
    for (let n = 11; n <= 99; n += 1) {
      const units = n % 10;
      const expected = units >= 5 ? n - units + 10 : n - units;
      expect(nearestTen(n), `${n}`).toBe(expected);
    }
  });

  it('leaves a ten alone', () => {
    for (const n of [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) {
      expect(nearestTen(n), `${n}`).toBe(n);
    }
  });
});

describe('U05 sign helper', () => {
  it('takes the three values a comparison can have', () => {
    expect(signOf(4, 7)).toBe('<');
    expect(signOf(7, 4)).toBe('>');
    expect(signOf(5, 5)).toBe('=');
  });
});

describe('U05 template library', () => {
  it('covers every subtopic at every level', () => {
    expect(U05_TEMPLATES).toHaveLength(49);
    expect(new Set(U05_TEMPLATES.map((t) => t.id)).size).toBe(49);
    for (const subtopic of U05_SUBTOPICS) {
      const templates = U05_TEMPLATES.filter((t) => t.subtopicId === subtopic);
      expect(templates.length, `${subtopic}`).toBeGreaterThanOrEqual(6);
      expect(
        [...new Set(templates.map((t) => t.difficulty))].sort((a, b) => Number(a) - Number(b)),
        `${subtopic} is missing a level`,
      ).toEqual([1, 2, 3]);
    }
  });

  it('replaces the placeholders for every subtopic', () => {
    for (const subtopic of U05_SUBTOPICS) {
      const registered = TEMPLATE_REGISTRY.forSubtopic(ref(subtopic));
      expect(registered.length, `nothing playable for ${subtopic}`).toBeGreaterThan(0);
      expect(
        registered.filter((t) => t.id === `g1-${subtopic}`),
        `placeholder still registered for ${subtopic}`,
      ).toEqual([]);
    }
  });

  it('can fill a perfect run at every level', () => {
    for (const subtopic of U05_SUBTOPICS) {
      for (const level of [1, 2, 3] as const) {
        const keys = new Set(
          generateBatch(ref(subtopic), 160, { level, seed: SEED }).map(shownKey),
        );
        expect(
          keys.size,
          `${subtopic} level ${level}: only ${keys.size} distinct`,
        ).toBeGreaterThanOrEqual(35);
      }
    }
  });

  it('reaches 100 in 35 questions with the real ladder', () => {
    for (const subtopic of U05_SUBTOPICS) {
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

describe('U05 answers are computed from what is shown', () => {
  it('keys every comparison sign to the two numbers printed', () => {
    // The sign templates all print their pair; the answer has to be the
    // relation between exactly those two numbers, in that order.
    for (const id of ['g1-u05-1-sign', 'g1-u05-1-fill-sign', 'g1-u05-2-sign', 'g1-u05-3-equal']) {
      for (const question of generateMany(id, 60)) {
        const [a, b] = nums(question.prompt);
        expect(String(question.answer), `${id}: ${question.prompt}`).toBe(signOf(a, b));
      }
    }
  });

  it('keys the three-comparison question to all three pairs', () => {
    for (const question of generateMany('g1-u05-1-three-signs', 80)) {
      const [a1, b1, a2, b2, a3, b3] = nums(question.prompt);
      expect(question.answer, question.prompt).toBe(
        `${signOf(a1, b1)},${signOf(a2, b2)},${signOf(a3, b3)}`,
      );
    }
  });

  it('keys the reversed-digit comparison to the place values', () => {
    // 67 against 76 is decided by the tens digit, not by the digits themselves.
    for (const question of generateMany('g1-u05-3-reversed', 60)) {
      const [a, b] = nums(question.prompt);
      expect(question.answer, question.prompt).toBe(a > b ? '>' : '<');
      expect(question.answer, `${question.prompt}: equal signs are impossible here`).not.toBe('=');
    }
  });

  it('keys "larger" and "smaller" questions to the pair in the sentence', () => {
    for (const question of generateMany('g1-u05-2-larger', 60)) {
      const [a, b] = nums(question.prompt);
      expect(Number(question.answer), question.prompt).toBe(Math.max(a, b));
    }
    for (const question of generateMany('g1-u05-2-smaller', 60)) {
      const [a, b] = nums(question.prompt);
      expect(Number(question.answer), question.prompt).toBe(Math.min(a, b));
    }
  });

  it('keys "largest" and "smallest" of a set to that set', () => {
    for (const question of generateMany('g1-u05-2-largest-of-four', 60)) {
      const shown = nums(question.prompt);
      expect(Number(question.answer), question.prompt).toBe(Math.max(...shown));
    }
    for (const question of generateMany('g1-u05-3-smallest-of-three', 60)) {
      const shown = nums(question.prompt);
      expect(Number(question.answer), question.prompt).toBe(Math.min(...shown));
    }
  });

  it('keys "how many more" to a real subtraction of the printed quantities', () => {
    // The two quantities printed are the two operands and the answer is their
    // difference. It may coincide with the smaller count („10 და 5: რამდენით
    // მეტი?“ is 5) — that is a real question, not a giveaway — but it can never
    // equal the larger one, and the two counts can never be equal.
    for (const template of U05_TEMPLATES.filter((t) => t.subtopicId === 'ramdenit-meti')) {
      for (const question of generateMany(template.id, 40)) {
        const [first, second] = nums(question.prompt);
        const answer = Number(question.answer);
        expect(answer, `${template.id}: ${question.prompt}`).toBe(Math.abs(first - second));
        expect(answer, `${template.id}: ${question.prompt} has nothing to compare`).toBeGreaterThan(0);
        expect(answer, `${template.id}: answer equals the larger count`).not.toBe(
          Math.max(first, second),
        );
      }
    }
  });

  it('keys every rounding question to the printed number', () => {
    for (const id of ['g1-u05-5-nearest-ten', 'g1-u05-5-round-small', 'g1-u05-5-round-large', 'g1-u05-5-round-half']) {
      for (const question of generateMany(id, 60)) {
        const [n] = nums(question.prompt);
        expect(Number(question.answer), `${id}: ${question.prompt}`).toBe(nearestTen(n));
        // A number that is already a ten has no nearest ten to find.
        expect(n % 10, `${id} offered ${n}, which is already a ten`).not.toBe(0);
      }
    }
  });

  it('keys the three-number rounding row in the order printed', () => {
    for (const question of generateMany('g1-u05-5-round-three', 60)) {
      const shown = nums(question.prompt);
      expect(shown, question.prompt).toHaveLength(3);
      expect(question.answer, question.prompt).toBe(shown.map(nearestTen).join(', '));
    }
  });

  it('keys every ordering question to the positions the student taps', () => {
    // The answer is a sequence of *display positions*, so reading it back has to
    // reproduce the sorted items — not the sorted values, and not the draw order.
    for (const template of U05_TEMPLATES.filter((t) => t.shuffle)) {
      const direction = template.shuffle!.direction;
      for (const question of generateMany(template.id, 40)) {
        const items = (question.orderItems ?? []).map(Number);
        expect(items.length, `${template.id} has no items`).toBeGreaterThan(1);
        const positions = orderKey(question.answer);
        expect(positions.length, question.prompt).toBe(items.length);
        expect([...positions].sort((a, b) => a - b), 'each position exactly once').toEqual(
          items.map((_, index) => index + 1),
        );
        const arranged = positions.map((position) => items[position - 1]);
        const expected = [...items].sort((a, b) => (direction === 'asc' ? a - b : b - a));
        expect(arranged, `${template.id}: ${items.join(', ')}`).toEqual(expected);
        // A scramble already in order would print the answer on the page.
        expect(items, `${template.id} showed a sorted list`).not.toEqual(expected);
      }
    }
  });

  it('keys the balancing question to the gap between the two groups', () => {
    for (const question of generateMany('g1-u05-8-balance', 60)) {
      const [first, second] = nums(question.prompt);
      expect(Number(question.answer), question.prompt).toBe(first - second);
      expect(first).toBeGreaterThan(second);
    }
  });

  it('keys the three-box total to the sum of the printed counts', () => {
    for (const question of generateMany('g1-u05-8-three-boxes', 60)) {
      const shown = nums(question.prompt);
      expect(Number(question.answer), question.prompt).toBe(shown.reduce((a, b) => a + b, 0));
    }
  });

  it('keys the mixed-quantity total to the two printed counts', () => {
    for (const question of generateMany('g1-u05-8-altogether', 60)) {
      const [a, b] = nums(question.prompt);
      expect(Number(question.answer), question.prompt).toBe(a + b);
    }
  });
});

describe('U05 questions are answerable', () => {
  it('keys every question to an option it actually offers', () => {
    for (const template of U05_TEMPLATES) {
      for (const question of generateMany(template.id, 30)) {
        if (!question.options || question.options.length === 0) continue;
        expect(
          question.options.map(String),
          `${template.id}: answer ${question.answer} not among its options`,
        ).toContain(String(question.answer));
      }
    }
  });

  it('offers no duplicate options and no empty ones', () => {
    for (const template of U05_TEMPLATES) {
      for (const question of generateMany(template.id, 30)) {
        const options = (question.options ?? []).map(String);
        if (options.length === 0) continue;
        expect(options.length, `${template.id} offered one option`).toBeGreaterThan(1);
        expect(new Set(options).size, `${template.id}: ${options.join(' / ')}`).toBe(
          options.length,
        );
        for (const option of options) {
          expect(option.trim(), `${template.id} offered a blank option`).not.toBe('');
          expect(option, `${template.id} leaked a placeholder`).not.toMatch(/null|undefined|\{/);
        }
      }
    }
  });

  it('offers all three signs only when the question is a sign question', () => {
    // `>` `<` `=` is exactly the answer set of a comparison, so a sign question
    // must offer all three and a question that is not about a sign must not.
    const signs = new Set(['>', '<', '=']);
    for (const question of generateMany('g1-u05-1-sign', 40)) {
      expect(new Set(question.options ?? []), question.prompt).toEqual(signs);
    }
    for (const question of generateMany('g1-u05-2-larger', 40)) {
      expect(
        (question.options ?? []).some((option) => signs.has(String(option))),
        `${question.prompt} offered a sign instead of a number`,
      ).toBe(false);
    }
  });

  it('prints only real numbers and real Georgian', () => {
    for (const template of U05_TEMPLATES) {
      for (const question of generateMany(template.id, 6)) {
        // No unreplaced placeholder may survive into a prompt.
        expect(question.prompt, `${template.id}: ${question.prompt}`).not.toMatch(/\{\w+\}/);
        // Latin letters appear only as signs, never as words.
        const latin = question.prompt.match(/[A-Za-z]+/g) ?? [];
        expect(latin, `${template.id}: ${question.prompt}`).toEqual([]);
        expect(question.explanation, template.id).toBeTruthy();
        expect(question.explanation.length, `${template.id} explanation is empty`).toBeGreaterThan(5);
      }
    }
  });

  it('never prints a plural after a numeral', () => {
    // Georgian takes the singular after a number: „7 ვაშლი“, not „7 ვაშლები“.
    // Every counted noun in this unit is printed directly after its count, so a
    // plural here is a grammar fault a child would see on screen.
    const plurals = ['ვაშლები', 'ვარსკვლავები', 'ბუშტები', 'თევზები', 'ბურთები', 'წრეები', 'კვადრატები', 'მსხლები'];
    for (const template of U05_TEMPLATES) {
      for (const question of generateMany(template.id, 10)) {
        for (const plural of plurals) {
          expect(question.prompt, `${template.id} printed „${plural}“`).not.toContain(plural);
        }
      }
    }
  });

  it('says „empty“ rather than printing an empty group', () => {
    // A group of zero drawn as nothing reads as a missing picture.
    for (const question of generateMany('g1-u05-1-sign', 60)) {
      const visual = question.visual ?? '';
      for (const line of visual.split('\n')) {
        expect(line, `a blank group: ${JSON.stringify(visual)}`).not.toMatch(/:\s*$/);
      }
    }
  });
});

describe('U05 repeatability', () => {
  it('rebuilds the same question from the same seed', () => {
    for (const template of U05_TEMPLATES.slice(0, 12)) {
      const first = generateFromTemplate(template, { seed: 4242 });
      const second = generateFromTemplate(template, { seed: 4242 });
      expect(second.prompt).toBe(first.prompt);
      expect(second.answer).toBe(first.answer);
      expect(second.options).toEqual(first.options);
      expect(second.orderItems).toEqual(first.orderItems);
    }
  });

  it('generates a question through the registry for every subtopic', () => {
    for (const subtopic of U05_SUBTOPICS) {
      const question = generateQuestion(ref(subtopic), 99);
      expect(question, `${subtopic} generated nothing`).toBeTruthy();
    }
  });
});
