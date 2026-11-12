import { describe, expect, it } from 'vitest';
import { U07_SUBTOPICS, U07_TEMPLATES } from '../src/practice/templates/u07-subtraction';
import { generateBatch, generateQuestion } from '../src/practice/generator';
import { generateFromTemplate, generateVariations } from '../src/practice/templates/generate';
import { shownKey } from '../src/practice/identity';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { advance, startSession, submitAnswer } from '../src/practice/session';
import { levelForScore } from '../src/practice/levels';
import type { GeneratedQuestion } from '../src/practice/templates/generate';

/**
 * U07 — every subtraction question must *subtract the numbers it prints*.
 *
 * The failures this suite exists for, none of which a type checker can see:
 *
 *  - a difference that does not come out of the two numbers printed beside it,
 *    which is how „which is greater, 45 or 67?“ once offered 67–70 as options;
 *  - a minus where the result would go negative (rule 3 of the spec);
 *  - a picture that draws a different count from the number it is drawn from
 *    (rule 4);
 *  - a „true or false“ equality that is never false, so the answer is a coin
 *    that always lands the same way (rule 6);
 *  - an ordering item whose key is always the same sequence, so a child can tap
 *    the same tiles every time without reading;
 *  - a name or a noun with a case ending bolted on by string concatenation.
 *
 * Every assertion re-derives the answer from what the student is shown.
 */

const SAMPLES = 120;
const SEED = 20260701;

const ref = (subtopicId: string) => ({ grade: 1 as const, topicId: 'Gamokleba', subtopicId });

const templateFor = (id: string) => {
  const template = U07_TEMPLATES.find((candidate) => candidate.id === id);
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

describe('U07 template library', () => {
  it('covers every subtopic at every level', () => {
    expect(U07_TEMPLATES.length).toBeGreaterThanOrEqual(50);
    expect(new Set(U07_TEMPLATES.map((t) => t.id)).size).toBe(U07_TEMPLATES.length);
    for (const subtopic of U07_SUBTOPICS) {
      const templates = U07_TEMPLATES.filter((t) => t.subtopicId === subtopic);
      expect(templates.length, `${subtopic}`).toBeGreaterThanOrEqual(3);
      expect(
        [...new Set(templates.map((t) => t.difficulty))].sort((a, b) => Number(a) - Number(b)),
        `${subtopic} is missing a level`,
      ).toEqual([1, 2, 3]);
    }
  });

  it('replaces the placeholders for every subtopic', () => {
    for (const subtopic of U07_SUBTOPICS) {
      const registered = TEMPLATE_REGISTRY.forSubtopic(ref(subtopic));
      expect(registered.length, `nothing playable for ${subtopic}`).toBeGreaterThan(0);
      expect(
        registered.filter((t) => t.id === `g1-${subtopic}`),
        `placeholder still registered for ${subtopic}`,
      ).toEqual([]);
    }
  });

  it('can fill a perfect run at every level', () => {
    // The app asks level-aware batches, so each level has to carry a session by
    // itself — not merely the subtopic as a whole.
    for (const subtopic of U07_SUBTOPICS) {
      for (const level of [1, 2, 3] as const) {
        const keys = new Set(generateBatch(ref(subtopic), 160, { level, seed: SEED }).map(shownKey));
        expect(
          keys.size,
          `${subtopic} level ${level}: only ${keys.size} distinct`,
        ).toBeGreaterThanOrEqual(35);
      }
    }
  });

  it('reaches 100 in 35 questions with the real ladder', () => {
    for (const subtopic of U07_SUBTOPICS) {
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

describe('U07 answers are computed from what is shown', () => {
  /** „a − b = ?“ — the two printed numbers are the subtraction itself. */
  const PLAIN_DIFFERENCE = [
    'g1-u07-1-basket',
    'g1-u07-6-small',
    'g1-u07-6-across-ten',
    'g1-u07-6-large-subtrahend',
    'g1-u07-6-from-twenty',
  ];

  it.each(PLAIN_DIFFERENCE)('%s subtracts exactly the numbers it prints', (templateId) => {
    for (const question of generateMany(templateId, 60)) {
      const printed = nums(question.prompt);
      expect(printed.length, `${templateId}: ${question.prompt}`).toBe(2);
      expect(answerOf(question), `${templateId}: ${question.prompt}`).toBe(printed[0] - printed[1]);
    }
  });

  it.each([
    'g1-u07-2-balls',
    'g1-u07-2-birds',
    'g1-u07-2-stars',
    'g1-u07-2-cubes',
    'g1-u07-3-pencils',
    'g1-u07-3-cakes',
    'g1-u07-3-shop',
    'g1-u07-3-books',
    'g1-u07-3-stickers',
    'g1-u07-3-bus',
    'g1-u07-10-plates',
    'g1-u07-10-boxes',
  ])('%s takes the second count from the first', (templateId) => {
    for (const question of generateMany(templateId, 60)) {
      const printed = nums(question.prompt);
      expect(printed.length, `${templateId}: ${question.prompt}`).toBe(2);
      expect(answerOf(question), `${templateId}: ${question.prompt}`).toBe(printed[0] - printed[1]);
      expect(answerOf(question), `${templateId} went negative`).toBeGreaterThanOrEqual(0);
    }
  });

  it('never lets a result go negative (rule 3)', () => {
    // The one rule that must hold for every item in the unit: 7 − 9 is not a
    // grade-1 question, it is a typo.
    for (const template of U07_TEMPLATES) {
      if (template.shuffle) continue; // answers there are positions, not values
      for (const question of generateMany(template.id, 40)) {
        if (question.format?.kind === 'text' || question.format?.kind === undefined) {
          if (!Number.isFinite(answerOf(question))) continue;
        }
        const answer = answerOf(question);
        if (!Number.isFinite(answer)) continue;
        expect(answer, `${template.id}: ${question.prompt} answered ${answer}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('computes every missing part as the difference of the printed numbers', () => {
    for (const id of [
      'g1-u07-2-hidden',
      'g1-u07-2-remove-to',
      'g1-u07-6-missing-subtrahend',
      'g1-u07-6-table',
    ]) {
      for (const question of generateMany(id, 50)) {
        const printed = nums(question.prompt);
        expect(printed.length, `${id}: ${question.prompt}`).toBeGreaterThan(1);
        expect(answerOf(question), `${id}: ${question.prompt}`).toBe(printed[0] - printed[1]);
      }
    }
  });

  it.each([
    'g1-u07-4-walk-small',
    'g1-u07-4-walk-small-two',
    'g1-u07-4-walk-teen',
    'g1-u07-4-walk-twenties',
    'g1-u07-4-walk-large',
  ])('%s lands where the leftward walk ends', (templateId) => {
    for (const question of generateMany(templateId, 60)) {
      const [start, steps] = nums(question.prompt);
      expect(answerOf(question), `${templateId}: ${question.prompt}`).toBe(start - steps);
      // Rule 3: the line never runs past zero.
      expect(answerOf(question), `${templateId} walked past zero`).toBeGreaterThanOrEqual(0);
    }
  });

  it('answers the backwards walk with the start, not the end', () => {
    for (const question of generateMany('g1-u07-4-walk-back', 60)) {
      const [steps, end] = nums(question.prompt);
      expect(answerOf(question), question.prompt).toBe(steps + end);
      // The line is drawn so the destination is the leftmost tick and never
      // marks the answer.
      const visual = question.visual ?? '';
      expect(visual, 'the line does not reach the destination').toContain(String(end));
    }
  });

  it('solves „__ − 6 = 9“ by adding 6 and 9', () => {
    for (const question of generateMany('g1-u07-7-missing-whole', 60)) {
      const [b, c] = nums(question.prompt);
      expect(answerOf(question), question.prompt).toBe(b + c);
    }
  });

  it('solves „a − __ = c“ by subtracting c from a', () => {
    for (const id of [
      'g1-u07-6-missing-subtrahend',
      'g1-u07-7-missing-small',
      'g1-u07-7-missing-mid',
      'g1-u07-9-missing',
    ]) {
      for (const question of generateMany(id, 50)) {
        const [a, c] = nums(question.prompt);
        expect(answerOf(question), `${id}: ${question.prompt}`).toBe(a - c);
      }
    }
  });

  it('finds the subtrahend from the minuend and the difference', () => {
    for (const question of generateMany('g1-u07-7-missing-word', 60)) {
      const [diff, a] = nums(question.prompt);
      expect(answerOf(question), question.prompt).toBe(a - diff);
    }
  });

  it('subtracts nothing when zero is taken away', () => {
    for (const id of ['g1-u07-5-minus-zero', 'g1-u07-5-zero-large']) {
      for (const question of generateMany(id, 50)) {
        const [a] = nums(question.prompt);
        expect(answerOf(question), `${id}: ${question.prompt}`).toBe(a);
      }
    }
  });

  it('leaves zero when everything is taken away', () => {
    // „a − a = __“ and „__ − b = 0“ are the same fact read from the two ends:
    // one prints the repeated number, the other prints the answer.
    for (const question of generateMany('g1-u07-5-minus-itself', 50)) {
      const [a, b] = nums(question.prompt);
      expect(answerOf(question), question.prompt).toBe(0);
      expect(a, `${question.prompt}: the pair is not equal`).toBe(b);
    }
    for (const question of generateMany('g1-u07-5-zero-result', 50)) {
      const [b] = nums(question.prompt);
      expect(answerOf(question), `${question.prompt}: the minuend is the subtrahend`).toBe(b);
    }
  });

  it('shares a total between two children equally', () => {
    for (const question of generateMany('g1-u07-5-share', 50)) {
      const [total] = nums(question.prompt);
      expect(total % 2, `${question.prompt}: the total does not split`).toBe(0);
      expect(answerOf(question) * 2, question.prompt).toBe(total);
    }
  });

  it('halves what it says it halves', () => {
    for (const question of generateMany('g1-u07-5-halve', 60)) {
      const [n] = nums(question.prompt);
      expect(answerOf(question) * 2, question.prompt).toBe(n);
    }
  });

  it('decides true/false by evaluating the equality', () => {
    for (const template of U07_TEMPLATES.filter((t) => t.subtopicId === 'martalia-tu-ara-gamokleba')) {
      for (const question of generateMany(template.id, 60)) {
        const [a, b, c] = nums(question.prompt);
        const expected = a - b === c ? 'მართალია' : 'მცდარია';
        expect(question.answer, `${template.id}: ${question.prompt}`).toBe(expected);
      }
    }
  });

  it('makes true/false questions genuinely both ways', () => {
    // If the claim is always true the question tests nothing but the child's
    // faith that the book is right.
    for (const template of U07_TEMPLATES.filter((t) => t.subtopicId === 'martalia-tu-ara-gamokleba')) {
      const answers = new Set(generateMany(template.id, 80).map((q) => String(q.answer)));
      expect([...answers].sort(), `${template.id} is always ${[...answers].join('/')}`).toEqual([
        'მართალია',
        'მცდარია',
      ]);
    }
  });
});

describe('U07 expression and ordering items', () => {
  it('shows the expression that matches the difference, not its value', () => {
    for (const id of ['g1-u07-9-which-expression', 'g1-u07-9-which-expression-large']) {
      for (const question of generateMany(id, 60)) {
        const [a, b] = nums(question.prompt);
        const target = a - b;
        expect(String(question.answer), `${id}: ${question.prompt}`).toMatch(/^\d+ − \d+$/);
        const [x, y] = nums(String(question.answer));
        expect(x - y, `${id}: „${question.answer}“ is not ${target}`).toBe(target);
        // Wrong options must be expressions that really are wrong, not bare
        // numbers and not a second way of writing the target.
        for (const option of question.options ?? []) {
          const candidate = String(option);
          expect(candidate, `${id} offered „${candidate}“`).toMatch(/^\d+ [+−] \d+$/);
          if (candidate === question.answer) continue;
          const [x, y] = nums(candidate);
          const alsoRight = candidate.includes('−') && x - y === target;
          expect(alsoRight, `${id} offered a second right answer „${candidate}“`).toBe(false);
        }
      }
    }
  });

  it('picks the operation that matches what was taken away', () => {
    for (const question of generateMany('g1-u07-1-which-operation', 60)) {
      const [a, b] = nums(question.prompt);
      expect(String(question.answer), question.prompt).toBe(`${a} − ${b}`);
    }
  });

  it('orders the three terms by size, and the key varies', () => {
    // A key that is always „2,1“ is a key a child taps without reading — the
    // same defect as an option list that cannot contain the smaller number.
    for (const template of U07_TEMPLATES.filter((t) => t.subtopicId === 'Cevrebi-arCevani')) {
      if (!template.shuffle) continue;
      const keys = new Set<string>();
      for (const question of generateMany(template.id, 40)) {
        const items = (question.orderItems ?? []).map(Number);
        expect(items.length, `${template.id}: ${question.prompt}`).toBeGreaterThan(2);
        const key = String(question.answer).split(',').map(Number);
        expect([...key].sort((a, b) => a - b)).toEqual(items.map((_, i) => i + 1));
        // The requested order is largest first: minuend, subtrahend, difference.
        expect(key.map((p) => items[p - 1]), `${template.id}: key does not sort ${items}`).toEqual(
          [...items].sort((a, b) => b - a),
        );
        // The three tiles are distinct, or the order would not be unique.
        expect(new Set(items).size, `${template.id}: repeated tile in ${items}`).toBe(items.length);
        keys.add(String(question.answer));
      }
      expect(keys.size, `${template.id} always answers ${[...keys].join('/')}`).toBeGreaterThan(2);
    }
  });

  it('asks for a subtrahend that really is the subtrahend', () => {
    for (const question of generateMany('g1-u07-11-which-subtrahend', 60)) {
      const [a, c] = nums(question.prompt);
      const answer = answerOf(question);
      expect(a - answer, question.prompt).toBe(c);
      expect(answer, `${question.prompt}: the answer is a printed number`).not.toBe(a);
      expect(answer, `${question.prompt}: the answer is a printed number`).not.toBe(c);
    }
  });

  it('names the term it was asked for', () => {
    // „which number is the minuend“ must name the first number, „the
    // difference“ the third — the terms are printed in one fixed order.
    const cases: Array<[string, 'first' | 'third']> = [
      ['g1-u07-1-name-minuend', 'first'],
      ['g1-u07-1-name-difference', 'third'],
    ];
    for (const [id, which] of cases) {
      for (const question of generateMany(id, 60)) {
        const printed = nums(question.prompt);
        expect(answerOf(question), `${id}: ${question.prompt}`).toBe(
          which === 'first' ? printed[0] : printed[2],
        );
      }
    }
  });

  it('names all three terms in the order they are asked for', () => {
    for (const question of generateMany('g1-u07-1-name-all-terms', 60)) {
      const [a, b, c] = nums(question.prompt);
      expect(String(question.answer), question.prompt).toBe(`${a}, ${b}, ${c}`);
    }
  });
});

describe('U07 pictures match the numbers', () => {
  const emojiCount = (text: string): number =>
    (text.match(/\p{Extended_Pictographic}/gu) ?? []).length;

  it('draws exactly the number of objects it names', () => {
    // Rule 4 of the spec: the picture is the question, so a row of five under
    // „4 ბურთი“ makes the question unanswerable.
    for (const id of ['g1-u07-2-balls', 'g1-u07-2-stars', 'g1-u07-2-cubes', 'g1-u07-2-remove-to']) {
      for (const question of generateMany(id, 40)) {
        const [total] = nums(question.prompt);
        const drawn = emojiCount(question.visual ?? '');
        expect(drawn, `${id}: draws ${drawn} for „${question.prompt}“`).toBe(total);
      }
    }
  });

  it('draws the visible ones and hides the rest', () => {
    for (const question of generateMany('g1-u07-2-hidden', 40)) {
      const [, visible] = nums(question.prompt);
      expect(emojiCount(question.visual ?? ''), question.prompt).toBe(visible);
      expect(question.visual ?? '', question.prompt).toContain('?');
    }
  });

  it('never prints the answer in the picture', () => {
    // The number line's destination was drawn with a „?“ on the very tick that
    // had to be worked out, so the picture was the answer. On a line the only
    // content is the ticks, so the answer must not appear as a bare tick.
    for (const id of [
      'g1-u07-4-walk-small',
      'g1-u07-4-walk-small-two',
      'g1-u07-4-walk-teen',
      'g1-u07-4-walk-twenties',
      'g1-u07-4-walk-large',
      'g1-u07-4-walk-back',
    ]) {
      for (const question of generateMany(id, 40)) {
        const ticks = (question.visual ?? '').split(' — ').map((tick) => tick.trim());
        expect(ticks.length, `${id} drew no line`).toBeGreaterThan(1);
        expect(ticks, `${id}: ${question.prompt} draws the answer as a tick`).not.toContain(
          String(question.answer),
        );
      }
    }
  });

  it('pictures the table cell without writing the equation out', () => {
    // „11 − 5 = ?“ above the question gives the arithmetic away — the point of
    // the table is that the child reads row and column.
    for (const id of ['g1-u07-12-table-cell', 'g1-u07-12-table-missing-col', 'g1-u07-12-table-diagonal']) {
      for (const question of generateMany(id, 30)) {
        const visual = question.visual ?? '';
        expect(visual, `${id} drew no table`).toContain('│');
        expect(visual, `${id} drew the equation: ${visual}`).not.toMatch(/\d\s*[−+]\s*\d\s*=/);
      }
    }
  });

  it('strikes out the ones it takes away', () => {
    for (const question of generateMany('g1-u07-2-balls', 40)) {
      const [, removed] = nums(question.prompt);
      const struck = (question.visual ?? '').match(/~~[^~]+~~/g) ?? [];
      expect(struck.length, `${question.prompt}: ${question.visual}`).toBe(removed);
    }
  });
});

describe('U07 questions are answerable', () => {
  it('keys every question to an option it actually offers', () => {
    for (const template of U07_TEMPLATES) {
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
    // Two options with the same text are one option: „12 − 6 | 12 − 6 | 12 − 7“
    // is a two-choice question wearing a three-choice coat.
    for (const template of U07_TEMPLATES) {
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
    for (const template of U07_TEMPLATES) {
      for (const question of generateMany(template.id, 6)) {
        expect(question.prompt, `${template.id}: ${question.prompt}`).not.toMatch(/\{\w+\}/);
        // Latin letters would only appear if a placeholder failed to render.
        expect(question.prompt.match(/[A-Za-z]+/g) ?? [], `${template.id}: ${question.prompt}`).toEqual(
          [],
        );
        expect(question.explanation, template.id).toBeTruthy();
        expect(question.explanation.length, `${template.id} explanation is empty`).toBeGreaterThan(5);
      }
    }
  });

  it('never prints a plural after a numeral', () => {
    // Georgian takes the singular after a count: „5 ვაშლი“, not „5 ვაშლები“.
    const plurals = ['ვაშლები', 'ვარსკვლავები', 'ბურთები', 'ბუშტები', 'ფანქრები', 'მსხლები', 'ნამცხვრები'];
    for (const template of U07_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        for (const plural of plurals) {
          expect(question.prompt, `${template.id} printed „${plural}“`).not.toContain(plural);
        }
      }
    }
  });

  it('declines every name before „აქვს“ with the dative', () => {
    // „დავითს აქვს“, never „დავითის აქვს“ and never „დავითი აქვს“. The stored
    // dative table is the only source of names, so the check is that every name
    // printed before „აქვს“ is one of those forms.
    const DATIVE = ['ნინოს', 'ლუკას', 'ანას', 'გიორგის', 'მარიამს', 'დავითს', 'სოფოს', 'ბექას'];
    // „გიორგის“ is a dative here (გიორგი → გიორგის); an -ის shape is not
    // evidence of the genitive on its own, which is why the table is the check.
    let seen = 0;
    for (const template of U07_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        // The subject sits at the start of a clause; „სტიკერი აქვს“ mid-sentence
        // is a noun, not a name.
        for (const match of question.prompt.matchAll(/(?:^|, )([ა-ჰ]+) აქვს/g)) {
          expect(DATIVE, `„${match[1]} აქვს“ is not a stored dative`).toContain(match[1]);
          seen += 1;
        }
      }
    }
    expect(seen, 'no template printed a name before „აქვს“').toBeGreaterThan(0);
  });

  it('never bolts a case ending onto a name with a hyphen', () => {
    // „დავითს-ს“ is what string concatenation does to a name that already
    // carries its ending.
    for (const template of U07_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        expect(question.prompt, `${template.id}: ${question.prompt}`).not.toMatch(/[ა-ჰ]-[ა-ჰ]/);
      }
    }
  });
});

describe('U07 repeatability', () => {
  it('rebuilds the same question from the same seed', () => {
    for (const template of U07_TEMPLATES.slice(0, 12)) {
      const first = generateFromTemplate(template, { seed: 4242 });
      const second = generateFromTemplate(template, { seed: 4242 });
      expect(second.prompt).toBe(first.prompt);
      expect(second.answer).toBe(first.answer);
      expect(second.options).toEqual(first.options);
      expect(second.visual).toBe(first.visual);
    }
  });

  it('generates a question through the registry for every subtopic', () => {
    for (const subtopic of U07_SUBTOPICS) {
      expect(generateQuestion(ref(subtopic), 99), `${subtopic} generated nothing`).toBeTruthy();
    }
  });
});
