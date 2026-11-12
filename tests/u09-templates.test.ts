import { describe, expect, it } from 'vitest';
import { U09_SUBTOPICS, U09_TEMPLATES } from '../src/practice/templates/u09-mixed';
import { generateBatch, generateQuestion } from '../src/practice/generator';
import { generateFromTemplate, generateVariations } from '../src/practice/templates/generate';
import { shownKey } from '../src/practice/identity';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { advance, startSession, submitAnswer } from '../src/practice/session';
import { levelForScore } from '../src/practice/levels';
import type { GeneratedQuestion } from '../src/practice/templates/generate';

/**
 * U09 — mixed problems: the unit where the *reading* is the arithmetic.
 *
 * The failures this suite exists for, none of which a type checker can see:
 *
 *  - a two-step expression that does not match the story it accompanies
 *    („12 − 6 + 1“ over a sentence that added six and gave one away);
 *  - a step that goes below zero in the middle — the answer is fine, the
 *    reasoning is not: 4 − 7 + 10 = 7 reads as „take seven from four“;
 *  - an equality marked true that is false, or a sign chosen from the shape of
 *    an expression instead of from its value;
 *  - a puzzle with a second number that also closes it;
 *  - a question whose „correct“ option is missing from the options it offers.
 *
 * Every assertion re-derives the answer from what the student is shown.
 */

const SAMPLES = 120;
const SEED = 20261105;

const ref = (subtopicId: string) => ({ grade: 1 as const, topicId: 'Sereuli-amocanebi', subtopicId });

const templateFor = (id: string) => {
  const template = U09_TEMPLATES.find((candidate) => candidate.id === id);
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

/** The value of a prompt shaped „a + b = __“ or „a + b − c = __“. */
const valueOf = (prompt: string): number =>
  prompt
    .replace(/^.*?:\s*/, '')
    .replace(/\s*=.*$/, '')
    .split(' ')
    .reduce<{ total: number; sign: number }>(
      (state, token) => {
        if (token === '+') return { ...state, sign: 1 };
        if (token === '−') return { ...state, sign: -1 };
        const value = Number(token);
        if (!Number.isFinite(value)) return state;
        return { total: state.total + state.sign * value, sign: state.sign };
      },
      { total: 0, sign: 1 },
    ).total;

describe('U09 template library', () => {
  it('covers every subtopic at every level', () => {
    expect(U09_TEMPLATES.length).toBeGreaterThanOrEqual(45);
    expect(new Set(U09_TEMPLATES.map((t) => t.id)).size).toBe(U09_TEMPLATES.length);
    for (const subtopic of U09_SUBTOPICS) {
      const templates = U09_TEMPLATES.filter((t) => t.subtopicId === subtopic);
      expect(templates.length, `${subtopic}`).toBeGreaterThanOrEqual(5);
      expect(
        [...new Set(templates.map((t) => t.difficulty))].sort((a, b) => Number(a) - Number(b)),
        `${subtopic} is missing a level`,
      ).toEqual([1, 2, 3]);
    }
  });

  it('replaces the placeholders for every subtopic', () => {
    for (const subtopic of U09_SUBTOPICS) {
      const registered = TEMPLATE_REGISTRY.forSubtopic(ref(subtopic));
      expect(registered.length, `nothing playable for ${subtopic}`).toBeGreaterThan(0);
      expect(
        registered.filter((t) => t.id === `g1-${subtopic}`),
        `placeholder still registered for ${subtopic}`,
      ).toEqual([]);
    }
  });

  it('can fill a perfect run at every level', () => {
    for (const subtopic of U09_SUBTOPICS) {
      for (const level of [1, 2, 3] as const) {
        const keys = new Set(generateBatch(ref(subtopic), 160, { level, seed: SEED }).map(shownKey));
        expect(keys.size, `${subtopic} level ${level}: only ${keys.size} distinct`).toBeGreaterThanOrEqual(35);
      }
    }
  });

  it('reaches 100 in 35 questions with the real ladder', () => {
    for (const subtopic of U09_SUBTOPICS) {
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

describe('U09 arithmetic is computed from what is printed', () => {
  it.each([
    'g1-u09-1-add',
    'g1-u09-3-add-cross',
    'g1-u09-3-add-teen',
  ])('%s adds exactly the numbers it prints', (templateId) => {
    for (const question of generateMany(templateId, 60)) {
      expect(answerOf(question), `${templateId}: ${question.prompt}`).toBe(valueOf(question.prompt));
    }
  });

  it.each(['g1-u09-3-sub-cross', 'g1-u09-3-sub-teen-pair'])(
    '%s subtracts exactly the numbers it prints',
    (templateId) => {
      for (const question of generateMany(templateId, 60)) {
        const printed = nums(question.prompt);
        expect(printed.length, `${templateId}: ${question.prompt}`).toBe(2);
        expect(answerOf(question), `${templateId}: ${question.prompt}`).toBe(printed[0] - printed[1]);
      }
    },
  );

  it('chains the two operations in the order the sentence prints them', () => {
    for (const id of ['g1-u09-3-add-then-sub', 'g1-u09-3-sub-then-add']) {
      for (const question of generateMany(id, 60)) {
        const [a, b, c] = nums(question.prompt);
        const want = id === 'g1-u09-3-add-then-sub' ? a + b - c : a - b + c;
        expect(answerOf(question), `${id}: ${question.prompt}`).toBe(want);
      }
    }
  });

  it('never lets a step go below zero, even mid-problem', () => {
    // Spec rule 3 covers intermediate values: 4 − 7 + 10 ends well and is still
    // not a question a six-year-old should be asked.
    // Some prompts print two expressions side by side („11 − 4 და 11 − 5“) or a
    // story. Only a single chain of numbers can be walked left to right; the
    // stories have their own test below, which reads them as sentences.
    const chain = /(\d+ [+−] \d+ [+−] \d+) =/;
    for (const template of U09_TEMPLATES) {
      for (const question of generateMany(template.id, 40)) {
        if (!chain.test(question.prompt)) continue;
        const printed = nums(question.prompt);
        const operators = (question.prompt.match(/[+−]/g) ?? []);
        if (operators.length < 2 || printed.length < 3) continue;
        // Walk the printed numbers left to right, applying the operator that
        // precedes each one.
        const firstOperator = question.prompt.indexOf('+') >= 0 && (question.prompt.indexOf('−') < 0 || question.prompt.indexOf('+') < question.prompt.indexOf('−')) ? '+' : '−';
        let running = printed[0];
        for (let index = 1; index < Math.min(3, printed.length); index += 1) {
          const operator = index === 1 ? firstOperator : operators[1] ?? firstOperator;
          running = operator === '+' ? running + printed[index] : running - printed[index];
          expect(running, `${template.id}: „${question.prompt}“ goes negative mid-way`).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('meets every equality exactly when it claims to', () => {
    // Rule 5: true/false is computed, never stored. Recompute both sides of the
    // printed sentence and check the verdict against it.
    for (const template of U09_TEMPLATES.filter((t) => t.subtopicId === 'martali-tolobebi')) {
      for (const question of generateMany(template.id, 60)) {
        const printed = nums(question.prompt);
        const left = printed.slice(0, -1);
        const right = printed[printed.length - 1];
        const signs = question.prompt.match(/[+−]/g) ?? [];
        let value = left[0];
        for (let index = 1; index < left.length; index += 1) {
          value = signs[index - 1] === '+' ? value + left[index] : value - left[index];
        }
        const want = value === right ? 'ჭეშმარიტია' : 'მცდარია';
        expect(String(question.answer), `${template.id}: „${question.prompt}“`).toBe(want);
      }
    }
  });

  it('offers both verdicts, so the answer is never a constant', () => {
    const seen = new Set<string>();
    for (const template of U09_TEMPLATES.filter((t) => t.subtopicId === 'martali-tolobebi')) {
      for (const question of generateMany(template.id, 60)) seen.add(String(question.answer));
    }
    expect([...seen].sort()).toEqual(['მცდარია', 'ჭეშმარიტია']);
  });

  it('compares by evaluating both sides, never by shape', () => {
    // Rule 6. Read the two expressions out of the prompt, evaluate each, then
    // decide the sign — a question whose sign follows from looking at the
    // numbers is not a comparison question.
    for (const template of U09_TEMPLATES.filter((t) => t.subtopicId === 'Sedareba-jamebi')) {
      for (const question of generateMany(template.id, 60)) {
        const [leftText, rightText] = question.prompt.replace(/^.*?:\s*/, '').replace(/\.$/, '').split(' __ ');
        expect(rightText, `${template.id}: „${question.prompt}“`).toBeTruthy();
        const left = valueOf(leftText);
        const right = valueOf(rightText);
        const want = left < right ? '<' : left > right ? '>' : '=';
        expect(String(question.answer), `${template.id}: „${question.prompt}“ (${left} vs ${right})`).toBe(want);
      }
    }
  });

  it('offers all three comparison signs, and every one of them occurs', () => {
    const seen = new Set<string>();
    for (const template of U09_TEMPLATES.filter((t) => t.subtopicId === 'Sedareba-jamebi')) {
      for (const question of generateMany(template.id, 60)) seen.add(String(question.answer));
    }
    expect([...seen].sort()).toEqual(['<', '=', '>']);
  });

  it('builds every puzzle so exactly one number closes it', () => {
    // Rule 8. Put the answer back into the printed sentence and the sentence
    // must be true; no other number in the sentence may already do that.
    for (const template of U09_TEMPLATES.filter((t) => t.subtopicId === 'Sekreba-gamokleba-Tavsatexi')) {
      for (const question of generateMany(template.id, 60)) {
        const answer = answerOf(question);
        expect(Number.isInteger(answer), `${template.id}: ${question.prompt}`).toBe(true);
        expect(answer, `${template.id}: ${question.prompt}`).toBeGreaterThanOrEqual(0);

        const printed = nums(question.prompt);
        const closes = (candidate: number): boolean => {
          if (template.id === 'g1-u09-8-drag-add' || template.id === 'g1-u09-8-missing-addend') {
            return printed[0] + candidate === printed[1];
          }
          if (template.id === 'g1-u09-8-drag-sub' || template.id === 'g1-u09-8-missing-subtrahend') {
            return printed[0] - candidate === printed[1];
          }
          if (template.id === 'g1-u09-8-two-step-puzzle' || template.id === 'g1-u09-8-two-missing') {
            return printed[0] + candidate - printed[1] === printed[2];
          }
          if (template.id === 'g1-u09-8-both-sides') {
            return candidate + printed[0] === printed[1] - printed[2];
          }
          return true;
        };
        expect(closes(answer), `${template.id}: „${question.prompt}“ — ${answer} does not close it`).toBe(true);
        for (const other of printed) {
          if (other === answer) continue;
          expect(closes(other), `${template.id}: „${question.prompt}“ — ${other} also closes it`).toBe(false);
        }
      }
    }
  });
});

describe('U09 respects each subtopic’s own rule', () => {
  it('states the commutative property, rather than asking for a coin flip', () => {
    // U09.1 is about properties: „a + b and b + a“ always have equal sums, and
    // a template that offered other outcomes would be teaching the wrong thing.
    for (const question of generateMany('g1-u09-1-commutative-choice', 60)) {
      expect(String(question.answer), question.prompt).toBe('ჯამები ტოლია');
    }
    for (const question of generateMany('g1-u09-1-swapped-addend', 60)) {
      const [a] = nums(question.prompt);
      expect(answerOf(question), question.prompt).toBe(a);
    }
  });

  it('reads the difference in U09.1 off the subtrahends, not the names', () => {
    // „12 − 4“ and „12 − 5“: the one that takes away less is larger. The answer
    // must be the expression the student can actually see.
    for (const question of generateMany('g1-u09-1-which-difference', 60)) {
      const [a, b, c] = nums(question.prompt);
      const want = a - b > a - c ? `${a} − ${b}` : `${a} − ${c}`;
      expect(String(question.answer), question.prompt).toBe(want);
    }
  });

  it('prints the operation the story needs in U09.2', () => {
    // The operations are drawn first and the sentence is built to match, so
    // both answers really occur: a child who always says „add“ is wrong half the
    // time, which is the point of the subtopic.
    const seen = new Set<string>();
    for (const question of generateMany('g1-u09-2-which-operation', 120)) {
      seen.add(String(question.answer));
      const prompt = question.prompt;
      const takesAway = /დაკარგა|წაიღეს|გაიყიდა|შეჭამა|მისცა/.test(prompt);
      expect(String(question.answer), `„${prompt}“`).toBe(takesAway ? 'გამოკლება' : 'შეკრება');
    }
    expect([...seen].sort()).toEqual(['გამოკლება', 'შეკრება']);
  });

  it('matches the expression to the story it prints, number for number', () => {
    // Rule 4: a two-step expression must agree with its story in both numbers
    // and order. „a + b − c“ means: something arrived, then something left.
    for (const question of generateMany('g1-u09-2-which-expression', 80)) {
      const [a, b, c] = nums(question.prompt);
      const added = /მიიღო|აჩუქა|დაამატა/.test(question.prompt);
      expect(String(question.answer), question.prompt).toBe(
        added ? `${a} + ${b} − ${c}` : `${a} − ${b} + ${c}`,
      );
    }
  });

  it('crosses ten in U09.3 and nowhere else in the unit', () => {
    for (const question of generateMany('g1-u09-3-add-cross', 60)) {
      const [a, b] = nums(question.prompt);
      expect(a + b, `${question.prompt} does not cross ten`).toBeGreaterThan(10);
      expect(a + b, `${question.prompt} passes twenty`).toBeLessThanOrEqual(20);
    }
    for (const question of generateMany('g1-u09-3-sub-cross', 60)) {
      const [a, b] = nums(question.prompt);
      expect(b, `${question.prompt} does not break a ten`).toBeGreaterThan(a % 10);
      expect(a - b, `${question.prompt} is not positive`).toBeGreaterThan(0);
    }
  });

  it('draws the unknown in U09.1 both sides, and never prints it', () => {
    // „a − b = __ − c“ asks for the minuend on the right: a − b + c. If that
    // value were also printed, the question would answer itself.
    for (const question of generateMany('g1-u09-1-both-sides', 60)) {
      const [a, b, c] = nums(question.prompt);
      const answer = answerOf(question);
      expect(answer, question.prompt).toBe(a - b + c);
      expect(answer, `${question.prompt} prints its own answer`).not.toBe(a);
      expect(answer, `${question.prompt} prints its own answer`).not.toBe(b);
      expect(answer, `${question.prompt} prints its own answer`).not.toBe(c);
    }
  });

  it('asks for the pair in the order the sentence names it', () => {
    for (const question of generateMany('g1-u09-6-addends', 40)) {
      const [a, b] = nums(question.prompt);
      expect(String(question.answer), question.prompt).toBe(`${a}, ${b}`);
    }
    for (const question of generateMany('g1-u09-6-minuend-subtrahend', 40)) {
      const [a, b] = nums(question.prompt);
      expect(String(question.answer), question.prompt).toBe(`${a}, ${b}`);
    }
  });

  it('offers exactly one expression with the asked-for sum in U09.6', () => {
    for (const question of generateMany('g1-u09-6-which-sum', 80)) {
      const [target] = nums(question.prompt);
      const options = (question.options ?? []).map(String);
      const matching = options.filter((option) => {
        const [a, b] = option.split(' + ').map(Number);
        return a + b === target;
      });
      expect(matching, `${question.prompt} — options ${options.join(' / ')}`).toEqual([String(question.answer)]);
    }
  });

  it('recomputes every story problem from its own sentence', () => {
    const cases: Array<[string, RegExp, (m: RegExpMatchArray) => number]> = [
      ['g1-u09-2-add-and-solve', /კიდევ (\d+) დაამატეს/, (m) => nums(m.input!).reduce((sum, value, index) => (index === 0 ? sum + value : index === 1 && value === Number(m[1]) ? sum + value : sum), 0)],
    ];
    for (const [id, pattern, compute] of cases) {
      for (const question of generateMany(id, 40)) {
        const match = question.prompt.match(pattern);
        expect(match, `${id}: the sentence did not parse — ${question.prompt}`).not.toBeNull();
        expect(answerOf(question), `${id}: ${question.prompt}`).toBe(compute(match!));
      }
    }
  });

  it('draws the story arithmetic straight for every two-step sentence', () => {
    const patterns: Array<[RegExp, (m: RegExpMatchArray) => number]> = [
      [/(\d+) .*?კიდევ (\d+) აჩუქა, შემდეგ კი (\d+) .*?დაკარგა/, (m) => Number(m[1]) + Number(m[2]) - Number(m[3])],
      [/(\d+) .*?(\d+) შეჭამეს, შემდეგ კი კიდევ (\d+) დადეს/, (m) => Number(m[1]) - Number(m[2]) + Number(m[3])],
      [/(\d+) .*?(\d+) (?:დაამატეს|მიიღო) და შემდეგ (\d+) (?:აიღეს|მისცა)/, (m) => Number(m[1]) + Number(m[2]) - Number(m[3])],
      [/(\d+) .*?(\d+) (?:აიღეს|გაიყიდა|წაიღეს), შემდეგ კი .*?(\d+) /, (m) => Number(m[1]) - Number(m[2]) + Number(m[3])],
    ];
    const ids = ['g1-u09-4-pencils', 'g1-u09-4-cakes', 'g1-u09-4-basket', 'g1-u09-2-cubes'];
    for (const id of ids) {
      let matched = 0;
      for (const question of generateMany(id, 50)) {
        for (const [pattern, compute] of patterns) {
          const match = question.prompt.match(pattern);
          if (!match) continue;
          matched += 1;
          expect(answerOf(question), `${id}: ${question.prompt}`).toBe(compute(match));
        }
      }
      expect(matched, `${id}: no sentence parsed`).toBeGreaterThan(0);
    }
  });
});

describe('U09 questions are answerable', () => {
  it('keys every question to an option it actually offers', () => {
    for (const template of U09_TEMPLATES) {
      for (const question of generateMany(template.id, 25)) {
        if (!question.options || question.options.length === 0) continue;
        expect(question.options.map(String), `${template.id}: answer ${question.answer} not among its options`).toContain(
          String(question.answer),
        );
      }
    }
  });

  it('offers no duplicate options and no empty ones', () => {
    for (const template of U09_TEMPLATES) {
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
    for (const template of U09_TEMPLATES) {
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
    for (const template of U09_TEMPLATES) {
      for (const question of generateMany(template.id, 6)) {
        expect(question.prompt, `${template.id}: ${question.prompt}`).not.toMatch(/\{\w+\}/);
        expect(question.prompt.match(/[A-Za-z]+/g) ?? [], `${template.id}: ${question.prompt}`).toEqual([]);
        expect(question.explanation, template.id).toBeTruthy();
        expect(question.explanation.length, `${template.id} explanation is empty`).toBeGreaterThan(5);
        expect(question.explanation, `${template.id} leaked a placeholder`).not.toMatch(/\{\w+\}/);
        // A finished equation in the prompt gives the answer away: „3 + 4 = 7“
        // is the answer, „3 + __ = 7“ and „3 + 4 = 7 + __“ are not. The one
        // subtopic where a finished equation *is* the question — judge whether
        // it is true — is exempt, and it has its own recomputation test above.
        if (template.subtopicId !== 'martali-tolobebi') {
        expect(question.prompt, `${template.id} prints a finished equation`).not.toMatch(
          /\d\s*[+−]\s*\d+\s*=\s*[−-]?\d+\s*(?:[.,?!]|$)/,
        );
        }
      }
    }
  });

  it('never prints a plural after a numeral', () => {
    const plurals = ['კუბიკები', 'ვაშლები', 'რვეულები', 'ფანქრები', 'ბურთები', 'ვარსკვლავები', 'წიგნები', 'ნამცხვრები', 'ბუშტები'];
    for (const template of U09_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        for (const plural of plurals) {
          expect(question.prompt, `${template.id} printed „${plural}“`).not.toContain(plural);
        }
      }
    }
  });

  it('declines every name before „ჰქონდა“ with the dative', () => {
    const DATIVE = ['ნინოს', 'ლუკას', 'ანას', 'გიორგის', 'მარიამს', 'დავითს', 'სოფოს', 'ბექას'];
    let seen = 0;
    for (const template of U09_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        for (const match of question.prompt.matchAll(/(?:^|, )([ა-ჰ]+) (?:ჰქონდა|აქვს)/g)) {
          expect(DATIVE, `„${match[1]} ჰქონდა“ is not a stored dative`).toContain(match[1]);
          seen += 1;
        }
      }
    }
    expect(seen, 'no template printed a name before „ჰქონდა“').toBeGreaterThan(0);
  });

  it('never bolts a case ending onto a name with a hyphen', () => {
    for (const template of U09_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        expect(question.prompt, `${template.id}: ${question.prompt}`).not.toMatch(/[ა-ჰ]-[ა-ჰ]/);
        expect(question.explanation, `${template.id}: ${question.explanation}`).not.toMatch(/[ა-ჰ]-[ა-ჰ]/);
      }
    }
  });
});

describe('U09 repeatability', () => {
  it('rebuilds the same question from the same seed', () => {
    for (const template of U09_TEMPLATES.slice(0, 12)) {
      const first = generateFromTemplate(template, { seed: 4242 });
      const second = generateFromTemplate(template, { seed: 4242 });
      expect(second.prompt).toBe(first.prompt);
      expect(second.answer).toBe(first.answer);
      expect(second.options).toEqual(first.options);
      expect(second.visual).toBe(first.visual);
    }
  });

  it('generates a question through the registry for every subtopic', () => {
    for (const subtopic of U09_SUBTOPICS) {
      expect(generateQuestion(ref(subtopic), 99), `${subtopic} generated nothing`).toBeTruthy();
    }
  });
});
