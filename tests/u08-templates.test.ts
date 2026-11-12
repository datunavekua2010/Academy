import { describe, expect, it } from 'vitest';
import { U08_SUBTOPICS, U08_TEMPLATES } from '../src/practice/templates/u08-two-digit';
import { generateBatch, generateQuestion } from '../src/practice/generator';
import { generateFromTemplate, generateVariations } from '../src/practice/templates/generate';
import { shownKey } from '../src/practice/identity';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { advance, startSession, submitAnswer } from '../src/practice/session';
import { levelForScore } from '../src/practice/levels';
import type { GeneratedQuestion } from '../src/practice/templates/generate';

/**
 * U08 — every question about a two-digit number must use the two-digit number.
 *
 * The failures this suite exists for, none of which a type checker can see:
 *
 *  - a prompt that prints the *tens count* instead of the number — „1 + 3 = __“
 *    whose answer is 40, which is exactly the defect the U08 first draft had on
 *    every template in U08.1, U08.2 and U08.7;
 *  - a „without regrouping“ question whose ones digits actually carry, or a
 *    „with regrouping“ question that does not (the two subtopics would then be
 *    indistinguishable);
 *  - a difference that goes negative, or a sum that passes one hundred;
 *  - a comparison decided by the shape of the expression rather than by
 *    evaluating both sides;
 *  - a puzzle with more than one number that would close it.
 *
 * Every assertion re-derives the answer from what the student is shown.
 */

const SAMPLES = 120;
const SEED = 20260801;

const ref = (subtopicId: string) => ({ grade: 1 as const, topicId: 'ateulebi-orcifra', subtopicId });

const templateFor = (id: string) => {
  const template = U08_TEMPLATES.find((candidate) => candidate.id === id);
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

/** The tens digit and the ones digit, the two numbers this unit is about. */
const tens = (n: number): number => Math.floor(n / 10);
const ones = (n: number): number => n % 10;

describe('U08 template library', () => {
  it('covers every subtopic at every level', () => {
    expect(U08_TEMPLATES.length).toBeGreaterThanOrEqual(45);
    expect(new Set(U08_TEMPLATES.map((t) => t.id)).size).toBe(U08_TEMPLATES.length);
    for (const subtopic of U08_SUBTOPICS) {
      const templates = U08_TEMPLATES.filter((t) => t.subtopicId === subtopic);
      expect(templates.length, `${subtopic}`).toBeGreaterThanOrEqual(3);
      expect(
        [...new Set(templates.map((t) => t.difficulty))].sort((a, b) => Number(a) - Number(b)),
        `${subtopic} is missing a level`,
      ).toEqual([1, 2, 3]);
    }
  });

  it('replaces the placeholders for every subtopic', () => {
    for (const subtopic of U08_SUBTOPICS) {
      const registered = TEMPLATE_REGISTRY.forSubtopic(ref(subtopic));
      expect(registered.length, `nothing playable for ${subtopic}`).toBeGreaterThan(0);
      expect(
        registered.filter((t) => t.id === `g1-${subtopic}`),
        `placeholder still registered for ${subtopic}`,
      ).toEqual([]);
    }
  });

  it('can fill a perfect run at every level', () => {
    for (const subtopic of U08_SUBTOPICS) {
      for (const level of [1, 2, 3] as const) {
        const keys = new Set(generateBatch(ref(subtopic), 160, { level, seed: SEED }).map(shownKey));
        expect(keys.size, `${subtopic} level ${level}: only ${keys.size} distinct`).toBeGreaterThanOrEqual(
          35,
        );
      }
    }
  });

  it('reaches 100 in 35 questions with the real ladder', () => {
    for (const subtopic of U08_SUBTOPICS) {
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

describe('U08 arithmetic is computed from what is printed', () => {
  it.each([
    'g1-u08-1-tens-small',
    'g1-u08-1-tens-mid',
    'g1-u08-3-add-small',
    'g1-u08-3-add-mid',
    'g1-u08-3-add-large',
    'g1-u08-4-carry-small',
    'g1-u08-4-carry-mid',
    'g1-u08-4-carry-near-ten',
    'g1-u08-4-carry-large',
    'g1-u08-7-plus-ten',
    'g1-u08-7-plus-twenty',
  ])('%s adds exactly the two numbers it prints', (templateId) => {
    for (const question of generateMany(templateId, 60)) {
      const printed = nums(question.prompt);
      expect(printed.length, `${templateId}: ${question.prompt}`).toBe(2);
      expect(answerOf(question), `${templateId}: ${question.prompt}`).toBe(printed[0] + printed[1]);
    }
  });

  it.each([
    'g1-u08-2-tens-small',
    'g1-u08-2-tens-mid',
    'g1-u08-5-within-ten',
    'g1-u08-5-break-ten',
    'g1-u08-5-break-ten-mid',
    'g1-u08-5-columns',
    'g1-u08-6-to-ten',
    'g1-u08-6-mid',
    'g1-u08-6-mid-large',
    'g1-u08-6-from-ten',
    'g1-u08-7-minus-ten',
    'g1-u08-7-minus-thirty',
  ])('%s subtracts exactly the two numbers it prints', (templateId) => {
    for (const question of generateMany(templateId, 60)) {
      const printed = nums(question.prompt);
      expect(printed.length, `${templateId}: ${question.prompt}`).toBe(2);
      expect(answerOf(question), `${templateId}: ${question.prompt}`).toBe(printed[0] - printed[1]);
    }
  });

  it('never prints a tens count where a number belongs', () => {
    // The first draft printed „1 + 3 = __“ for 10 + 30, and every answer was ten
    // times the arithmetic the sentence showed. A prompt whose printed numbers
    // are two-digit (or whose answer is) must not be an equation between single
    // digits unless the answer really is that single-digit sum.
    for (const template of U08_TEMPLATES) {
      if (template.shuffle) continue;
      for (const question of generateMany(template.id, 40)) {
        if (question.format?.kind === 'text') continue;
        const printed = nums(question.prompt);
        const answer = answerOf(question);
        if (printed.length !== 2 || !Number.isFinite(answer)) continue;
        if (/\b\d+ − \d+\b/.test(question.prompt) && /და 10/.test(question.prompt)) continue;
        if (printed[0] < 10 && printed[1] < 10 && answer > 18 && !/ათეული/.test(question.prompt)) {
          expect.fail(`${template.id}: „${question.prompt}“ prints single digits but answers ${answer}`);
        }
      }
    }
  });

  it('keeps every answer non-negative and at most one hundred', () => {
    for (const template of U08_TEMPLATES) {
      for (const question of generateMany(template.id, 40)) {
        if (question.format?.kind === 'text') continue;
        const answer = answerOf(question);
        if (!Number.isFinite(answer)) continue;
        expect(Number.isInteger(answer), `${template.id}: ${question.prompt} → ${answer}`).toBe(true);
        expect(answer, `${template.id}: ${question.prompt} → ${answer}`).toBeGreaterThanOrEqual(0);
        expect(answer, `${template.id}: ${question.prompt} → ${answer}`).toBeLessThanOrEqual(100);
      }
    }
  });

  it('solves a missing number by the direction the blank sits in', () => {
    // „a + __ = c“ is c − a; „__ − b = c“ is b + c. The direction is read off the
    // equation, not stored.
    for (const question of generateMany('g1-u08-1-missing-addend', 50)) {
      const [a, total] = nums(question.prompt);
      expect(answerOf(question), question.prompt).toBe(total - a);
    }
    for (const question of generateMany('g1-u08-2-missing-subtrahend', 50)) {
      const [total, diff] = nums(question.prompt);
      expect(answerOf(question), question.prompt).toBe(total - diff);
    }
    for (const question of generateMany('g1-u08-3-missing-ones', 50)) {
      const [a, total] = nums(question.prompt);
      expect(answerOf(question), question.prompt).toBe(total - a);
    }
    for (const question of generateMany('g1-u08-6-missing-minuend', 50)) {
      const [b, c] = nums(question.prompt);
      expect(answerOf(question), question.prompt).toBe(b + c);
    }
  });

  it('takes nothing away when the subtrahend is zero', () => {
    for (const question of generateMany('g1-u08-6-zero', 50)) {
      const [a] = nums(question.prompt);
      expect(answerOf(question), question.prompt).toBe(a);
    }
  });

  it('chains two operations in the order the sentence prints them', () => {
    for (const id of ['g1-u08-1-three-tens', 'g1-u08-2-two-subtractions', 'g1-u08-7-two-steps']) {
      for (const question of generateMany(id, 50)) {
        const [a, b, c] = nums(question.prompt);
        const want = id === 'g1-u08-1-three-tens' ? a + b + c : id === 'g1-u08-2-two-subtractions' ? a - b - c : a + b - c;
        expect(answerOf(question), `${id}: ${question.prompt}`).toBe(want);
      }
    }
  });

  it('recomputes every story problem from its own sentence', () => {
    const cases: Array<[string, RegExp, (m: RegExpMatchArray) => number]> = [
      ['g1-u08-1-boxes', /ყუთში არის (\d+) .*? და (\d+) .*? კიდევ (\d+) .*? დაამატეს/, (m) => Number(m[1]) + Number(m[2]) + Number(m[3])],
      ['g1-u08-2-library', /ბიბლიოთეკაში იყო (\d+) .*? (\d+) .*? შემდეგ კი კიდევ (\d+)/, (m) => Number(m[1]) - Number(m[2]) - Number(m[3])],
      ['g1-u08-3-box', /ყუთში არის (\d+) .*? მას კიდევ (\d+) .*? დაამატეს/, (m) => Number(m[1]) + Number(m[2])],
      ['g1-u08-4-stickers', /აქვს (\d+) სტიკერი\. მეგობარმა კიდევ (\d+) აჩუქა/, (m) => Number(m[1]) + Number(m[2])],
      ['g1-u08-5-box', /ყუთში იყო (\d+) .*? (\d+) .*? აიღეს/, (m) => Number(m[1]) - Number(m[2])],
      ['g1-u08-7-shop', /მაღაზიაში იყო (\d+) .*?გაიყიდა (\d+), შემდეგ კი კიდევ (\d+)/, (m) => Number(m[1]) - Number(m[2]) - Number(m[3])],
      ['g1-u08-9-box', /ყუთში არის (\d+) .*? რომ (\d+) გახდეს/, (m) => Number(m[2]) - Number(m[1])],
    ];
    for (const [id, pattern, compute] of cases) {
      for (const question of generateMany(id, 50)) {
        const match = question.prompt.match(pattern);
        expect(match, `${id}: the sentence did not parse — ${question.prompt}`).not.toBeNull();
        expect(answerOf(question), `${id}: ${question.prompt}`).toBe(compute(match!));
      }
    }
  });
});

describe('U08 respects each subtopic’s own rule', () => {
  it('never carries in the regrouping-free subtopic', () => {
    // U08.3's definition: the ones digits of the two addends must sum to less
    // than ten. In `a + __ = total` the second addend is the answer, so the
    // check has to take the addends from wherever the shape puts them.
    for (const template of U08_TEMPLATES.filter((t) => t.subtopicId === 'orcifra-ertcifra')) {
      for (const question of generateMany(template.id, 60)) {
        const printed = nums(question.prompt);
        // Two shapes live here: „a + b = __“ (addend is printed) and
        // „a + __ = total“ (addend is the answer). Read the shape, not the
        // second number, or the check compares the total with itself.
        // „__“ appears in both shapes — it is the answer blank in „a + b = __“
        // too — so the discriminator has to be the blank *between the operands*.
        const isGap = /\+ __/.test(question.prompt);
        const a = printed[0];
        const addendB = isGap ? answerOf(question) : printed[1];
        const total = isGap ? printed[1] : answerOf(question);
        expect(ones(a) + addendB, `${template.id}: ${question.prompt} carries`).toBeLessThan(10);
        expect(total, `${template.id}: ${question.prompt}`).toBe(a + addendB);
        // The tens digit never moves: that is what "no regrouping" means.
        expect(tens(total), `${template.id}: ${question.prompt} moved a ten`).toBe(tens(a));
      }
    }
  });

  it('always carries in the regrouping subtopic', () => {
    // U08.4's definition: the ones digits sum to ten or more, and the total
    // stays inside one hundred.
    for (const template of U08_TEMPLATES.filter((t) => t.subtopicId === 'gadajgufebiT')) {
      for (const question of generateMany(template.id, 60)) {
        const [a, b] = nums(question.prompt);
        expect(ones(a) + b, `${template.id}: ${question.prompt} does not carry`).toBeGreaterThanOrEqual(10);
        expect(answerOf(question), `${template.id}: ${question.prompt}`).toBe(a + b);
        expect(answerOf(question), `${template.id}: ${question.prompt} passes one hundred`).toBeLessThanOrEqual(100);
        // A carry means the tens digit really moved: that is the arithmetic the
        // picture is there to show.
        expect(tens(answerOf(question)), `${template.id}: ${question.prompt}`).toBe(tens(a) + 1);
      }
    }
  });

  it('uses only whole tens in U08.1 and U08.2', () => {
    for (const template of U08_TEMPLATES.filter(
      (t) => t.subtopicId === 'ateulebi-ateulebi' || t.subtopicId === 'ateulebis-gamokleba',
    )) {
      for (const question of generateMany(template.id, 50)) {
        for (const value of nums(question.prompt)) {
          expect(value % 10, `${template.id}: ${question.prompt} has a non-ten ${value}`).toBe(0);
        }
        expect(answerOf(question) % 10, `${template.id}: ${question.prompt} → ${answerOf(question)}`).toBe(0);
      }
    }
  });

  it('keeps a zero-to-nine subtrahend in U08.6', () => {
    for (const template of U08_TEMPLATES.filter((t) => t.subtopicId === 'nulidan-9-mde')) {
      for (const question of generateMany(template.id, 50)) {
        const printed = nums(question.prompt);
        // In „__ − b = c“ the subtrahend is the first printed number, not the
        // second — every number the sentence prints must still be a 0…9 one.
        if (question.prompt.includes('__ −')) {
          expect(printed[0], `${template.id}: ${question.prompt}`).toBeLessThanOrEqual(9);
        } else {
          expect(printed[1], `${template.id}: ${question.prompt}`).toBeLessThanOrEqual(9);
        }
        expect(answerOf(question), `${template.id}: ${question.prompt}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('stays inside one hundred in U08.7', () => {
    for (const template of U08_TEMPLATES.filter((t) => t.subtopicId === 'aszeulSi')) {
      for (const question of generateMany(template.id, 50)) {
        expect(answerOf(question), `${template.id}: ${question.prompt}`).toBeGreaterThan(0);
        expect(answerOf(question), `${template.id}: ${question.prompt}`).toBeLessThanOrEqual(100);
        // Adding or taking a whole ten never changes the ones digit.
        const printed = nums(question.prompt);
        const a = printed[0];
        if (template.id === 'g1-u08-7-plus-ten' || template.id === 'g1-u08-7-plus-twenty') {
          expect(ones(answerOf(question)), `${template.id}: ${question.prompt}`).toBe(ones(a));
        }
        if (template.id === 'g1-u08-7-minus-ten' || template.id === 'g1-u08-7-minus-thirty') {
          expect(ones(answerOf(question)), `${template.id}: ${question.prompt}`).toBe(ones(a));
        }
      }
    }
  });

  it('compares by evaluating both sides, never by shape', () => {
    for (const template of U08_TEMPLATES.filter((t) => t.subtopicId === 'Sedareba-10Tan')) {
      for (const question of generateMany(template.id, 60)) {
        const printed = nums(question.prompt);
        if (/და 10/.test(question.prompt)) {
          // „a + b < 10“ or „a − b > 10“ — the value decides which.
          const isSum = question.prompt.includes('+');
          const value = isSum ? printed[0] + printed[1] : printed[0] - printed[1];
          const want = value < 10 ? '<' : value > 10 ? '>' : '=';
          expect(String(question.answer), `${template.id}: ${question.prompt}`).toContain(` ${want} 10`);
        } else {
          const left = printed[0] + printed[1];
          const right = printed[2] - printed[3];
          const want = left < right ? '<' : left > right ? '>' : '=';
          expect(String(question.answer), `${template.id}: ${question.prompt}`).toBe(want);
        }
      }
    }
  });

  it('offers all three comparison signs, and every one of them occurs', () => {
    // A child answering „greater“ every time would otherwise be right about
    // seven times in ten; drawing the sign is what makes the answer even.
    const seen = new Set<string>();
    for (const question of generateMany('g1-u08-8-two-sides', 200)) seen.add(String(question.answer));
    expect([...seen].sort()).toEqual(['<', '=', '>']);
  });

  it('builds every puzzle so exactly one number closes it', () => {
    // Rule 9: the blank's value is drawn first, so no second number works.
    for (const template of U08_TEMPLATES.filter((t) => t.subtopicId === 'ricxviTi-gamocanebi')) {
      for (const question of generateMany(template.id, 60)) {
        const answer = answerOf(question);
        expect(Number.isInteger(answer), `${template.id}: ${question.prompt}`).toBe(true);
        expect(answer, `${template.id}: ${question.prompt}`).toBeGreaterThan(0);
        // Substituting the answer back into the sentence must make it true.
        const printed = nums(question.prompt);
        if (template.id === 'g1-u08-9-drag-tens') {
          expect(printed[0] + answer, `${template.id}: ${question.prompt}`).toBe(printed[1]);
        } else if (template.id === 'g1-u08-9-drag-minuend') {
          expect(answer + printed[0], `${template.id}: ${question.prompt}`).toBe(printed[1]);
        } else if (template.id === 'g1-u08-9-drag-two-steps') {
          expect(printed[0] + answer - printed[1], `${template.id}: ${question.prompt}`).toBe(printed[2]);
        } else if (template.id === 'g1-u08-9-box') {
          expect(printed[0] + answer, `${template.id}: ${question.prompt}`).toBe(printed[1]);
        }
      }
    }
  });
});

describe('U08 questions are answerable', () => {
  it('keys every question to an option it actually offers', () => {
    for (const template of U08_TEMPLATES) {
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
    for (const template of U08_TEMPLATES) {
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

  it('never offers a wrong option that is also right', () => {
    // A distractor equal to the answer by value is a second correct answer.
    for (const template of U08_TEMPLATES) {
      for (const question of generateMany(template.id, 30)) {
        const options = (question.options ?? []).map(String);
        if (options.length === 0) continue;
        const answer = String(question.answer);
        const others = options.filter((option) => option !== answer);
        expect(others, `${template.id}: ${question.prompt}`).not.toContain(answer);
      }
    }
  });

  it('prints only real numbers and real Georgian', () => {
    for (const template of U08_TEMPLATES) {
      for (const question of generateMany(template.id, 6)) {
        expect(question.prompt, `${template.id}: ${question.prompt}`).not.toMatch(/\{\w+\}/);
        // Latin letters would only appear if a placeholder failed to render.
        expect(question.prompt.match(/[A-Za-z]+/g) ?? [], `${template.id}: ${question.prompt}`).toEqual([]);
        expect(question.explanation, template.id).toBeTruthy();
        expect(question.explanation.length, `${template.id} explanation is empty`).toBeGreaterThan(5);
        expect(question.explanation, `${template.id} leaked a placeholder`).not.toMatch(/\{\w+\}/);
      }
    }
  });

  it('never prints a plural after a numeral', () => {
    // Georgian takes the singular after a count: „30 კუბიკი“, not „30 კუბიკები“.
    const plurals = ['კუბიკები', 'ვაშლები', 'რვეულები', 'ფანქრები', 'ბურთები', 'ვარსკვლავები', 'წიგნები'];
    for (const template of U08_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        for (const plural of plurals) {
          expect(question.prompt, `${template.id} printed „${plural}“`).not.toContain(plural);
        }
      }
    }
  });

  it('declines every name before „აქვს“ with the dative', () => {
    const DATIVE = ['ნინოს', 'ლუკას', 'ანას', 'გიორგის', 'მარიამს', 'დავითს', 'სოფოს', 'ბექას'];
    let seen = 0;
    for (const template of U08_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        for (const match of question.prompt.matchAll(/(?:^|, )([ა-ჰ]+) აქვს/g)) {
          expect(DATIVE, `„${match[1]} აქვს“ is not a stored dative`).toContain(match[1]);
          seen += 1;
        }
      }
    }
    expect(seen, 'no template printed a name before „აქვს“').toBeGreaterThan(0);
  });

  it('never bolts a case ending onto a name with a hyphen', () => {
    for (const template of U08_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        expect(question.prompt, `${template.id}: ${question.prompt}`).not.toMatch(/[ა-ჰ]-[ა-ჰ]/);
      }
    }
  });
});

describe('U08 repeatability', () => {
  it('rebuilds the same question from the same seed', () => {
    for (const template of U08_TEMPLATES.slice(0, 12)) {
      const first = generateFromTemplate(template, { seed: 4242 });
      const second = generateFromTemplate(template, { seed: 4242 });
      expect(second.prompt).toBe(first.prompt);
      expect(second.answer).toBe(first.answer);
      expect(second.options).toEqual(first.options);
      expect(second.visual).toBe(first.visual);
    }
  });

  it('generates a question through the registry for every subtopic', () => {
    for (const subtopic of U08_SUBTOPICS) {
      expect(generateQuestion(ref(subtopic), 99), `${subtopic} generated nothing`).toBeTruthy();
    }
  });
});
