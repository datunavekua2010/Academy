import { describe, expect, it } from 'vitest';
import {
  G5_U16_SUBTOPICS,
  G5_U16_TEMPLATES,
} from '../src/practice/templates/g5-u16-algebra';
import { generateBatch, previewTemplate } from '../src/practice/generator';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';

/**
 * Grade V — Unit 16: algebra and powers.
 *
 * The unit's risk is the opposite of U15's. Almost everything here is
 * *computable*, so the danger is not a question that cannot vary but a key that
 * quietly disagrees with the sentence above it — an order-of-operations total
 * computed left-to-right, a power written one way and evaluated another.
 *
 * The tests therefore re-derive the arithmetic from the rendered prompt in an
 * implementation written independently of the template's own one, and compare.
 */

const TOPIC = 'g5-algebra-powers';

const ref = (subtopicId: string) => ({ grade: 5 as const, topicId: TOPIC, subtopicId });

describe('G5 U16 — library shape', () => {
  it('covers every subtopic of the unit', () => {
    expect(G5_U16_SUBTOPICS).toHaveLength(6);
    const templated = new Set(G5_U16_TEMPLATES.map((template) => template.subtopicId));
    for (const subtopicId of G5_U16_SUBTOPICS) {
      expect(templated.has(subtopicId), `${subtopicId} has no templates`).toBe(true);
    }
  });

  it('addresses the algebra topic only, under grade 5', () => {
    for (const template of G5_U16_TEMPLATES) {
      expect(template.grade, template.id).toBe(5);
      expect(template.topicId, template.id).toBe(TOPIC);
      expect(G5_U16_SUBTOPICS, template.id).toContain(template.subtopicId);
      expect(template.id, template.id).toMatch(/^g5-u16-q\d{2}$/);
    }
  });

  it('has unique ids that do not collide with the placeholder namespace', () => {
    const ids = G5_U16_TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).not.toMatch(/^g5-u16-\d+$/);
  });

  it('is registered, and its placeholders are retired', () => {
    for (const subtopicId of G5_U16_SUBTOPICS) {
      const ids = TEMPLATE_REGISTRY.forSubtopic(ref(subtopicId)).map((template) => template.id);
      expect(ids.length, subtopicId).toBeGreaterThan(0);
      expect(ids, subtopicId).not.toContain(`g5-${subtopicId}`);
    }
  });
});

describe('G5 U16 — every template is sound', () => {
  for (const template of G5_U16_TEMPLATES) {
    it(`${template.id} draws valid, distinct variations`, () => {
      const questions = previewTemplate(template.id, 12);
      expect(questions.length).toBe(12);

      for (const question of questions) {
        expect(question.prompt, template.id).not.toMatch(/\{\w+\}/);
        expect(question.prompt.trim().length, template.id).toBeGreaterThan(0);
        expect(question.explanation.trim().length, template.id).toBeGreaterThan(0);

        if (question.answerMode !== 'choice') continue;
        expect(question.options.length, template.id).toBeGreaterThanOrEqual(2);
        expect(new Set(question.options).size, `${template.id}: duplicate option`)
          .toBe(question.options.length);
        expect(question.options, `${template.id}: answer missing`).toContain(question.answer);
      }
    });
  }
});

describe('G5 U16 — a session can be filled without repeating', () => {
  for (const subtopicId of G5_U16_SUBTOPICS) {
    it(`${subtopicId} yields 12 distinct questions`, () => {
      const batch = generateBatch(ref(subtopicId), 12, { seed: 20260116 });
      expect(batch.length).toBe(12);
      expect(new Set(batch.map((question) => question.signature)).size).toBe(12);
    });
  }
});

describe('G5 U16 — the printed arithmetic is the answer', () => {
  it('re-derives every order-of-operations total', () => {
    // Deliberately written as a second, independent parser: it re-reads the
    // rendered prompt and evaluates it, so a template that computed its key a
    // different way (for example strictly left to right) fails here.
    const evaluate = (text: string): number => {
      const tokens = text.match(/\d+|[+\-×÷()]/g) ?? [];
      let i = 0;
      const peek = () => tokens[i];
      const take = () => tokens[i++]!;
      const factor = (): number => {
        if (peek() === '(') {
          take();
          const value = expression();
          take();
          return value;
        }
        return Number(take());
      };
      const term = (): number => {
        let value = factor();
        while (peek() === '×' || peek() === '÷') {
          const op = take();
          const right = factor();
          value = op === '×' ? value * right : value / right;
        }
        return value;
      };
      const expression = (): number => {
        let value = term();
        while (peek() === '+' || peek() === '−') {
          const op = take();
          const right = term();
          value = op === '+' ? value + right : value - right;
        }
        return value;
      };
      return expression();
    };

    for (const question of generateBatch(ref('u16-01'), 12, { seed: 161601 })) {
      const template = G5_U16_TEMPLATES.find((item) => item.id === question.templateId)!;
      if (template.id !== 'g5-u16-q01') continue;
      const printed = question.prompt.replace('გამოთვალე: ', '').replace(/\.$/, '');
      expect(Number(question.answer), question.prompt).toBe(evaluate(printed));
    }
  });

  it('re-derives squares, cubes and higher powers', () => {
    const baseOf = (prompt: string): { base: number; exponent: number } => {
      const match = prompt.match(/(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/);
      expect(match, prompt).not.toBeNull();
      const exponent = match![2]!
        .split('')
        .map((digit) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(digit))
        .join('');
      return { base: Number(match![1]), exponent: Number(exponent) };
    };

    for (const id of ['g5-u16-q11', 'g5-u16-q15', 'g5-u16-q20']) {
      for (const question of previewTemplate(id, 10)) {
        const { base, exponent } = baseOf(question.prompt);
        expect(Number(question.answer), `${question.prompt} → ${question.answer}`)
          .toBe(base ** exponent);
      }
    }
  });

  it('never prints a caret or a LaTeX index where a power belongs', () => {
    for (const template of G5_U16_TEMPLATES) {
      for (const question of previewTemplate(template.id, 6)) {
        expect(question.prompt, template.id).not.toMatch(/\^/);
        expect(question.explanation, template.id).not.toMatch(/\^/);
      }
    }
  });

  it('solves each equation it prints', () => {
    for (const question of generateBatch(ref('u16-03'), 12, { seed: 163163 })) {
      if (question.templateId !== 'g5-u16-q07') continue;
      const equation = question.prompt.replace('ამოხსენი განტოლება: ', '').replace(/\.$/, '');
      const [left, right] = equation.split('=').map((part) => part.trim());
      const target = Number(right);
      const solution = Number(question.answer);
      // Substituting the answer back in must reproduce the printed right side.
      const linear = left!.match(/^(\d+)\s*[a-z]\s*\+\s*(\d+)$/);
      let substituted: number;
      if (linear) substituted = Number(linear[1]) * solution + Number(linear[2]);
      else if (/^[a-z]\s*\+\s*\d+$/.test(left!)) substituted = solution + Number(left!.replace(/[^0-9]/g, ''));
      else if (/^[a-z]\s*−\s*\d+$/.test(left!)) substituted = solution - Number(left!.replace(/[^0-9]/g, ''));
      else if (/^\d+\s*[a-z]$/.test(left!)) substituted = Number(left!.replace(/[^0-9]/g, '')) * solution;
      else substituted = solution / Number(left!.replace(/[^0-9]/g, ''));
      expect(substituted, `${equation} with answer ${solution}`).toBe(target);
    }
  });

  it('offers only bracketings of the expression it printed', () => {
    // A distractor has to be a wrong answer *to this question*. Padding a short
    // option list by bumping a digit invents `(25 − 6) × 3` for a prompt about
    // `24 − 6 × 3`, which is a different expression and no longer a question
    // about the order of operations.
    for (const question of previewTemplate('g5-u16-q03', 12)) {
      const printed = question.prompt.match(/გამოსახულებაში (.+?) ჩასვი/)?.[1] ?? '';
      const digits = new Set(printed.match(/\d+/g));
      for (const option of question.options) {
        for (const number of option.match(/\d+/g) ?? []) {
          expect(digits.has(number), `${question.prompt} offered "${option}"`).toBe(true);
        }
      }
    }
  });

  it('never states a non-positive length or count', () => {
    for (const template of G5_U16_TEMPLATES) {
      for (const question of previewTemplate(template.id, 6)) {
        const value = Number(question.answer);
        if (Number.isFinite(value) && /^\d+$/.test(question.answer)) {
          expect(value, `${template.id}: "${question.prompt}"`).toBeGreaterThan(0);
        }
      }
    }
  });
});
