import { describe, expect, it } from 'vitest';
import { generateFromTemplate, generateVariations, TemplateError } from '../src/practice/templates/generate';
import { defineTemplate } from '../src/practice/templates/types';
import { SAMPLE_TEMPLATES } from '../src/practice/templates/samples';
import { createTemplateRegistry } from '../src/practice/templates/registry';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { generateBatch, regenerateFromId, previewTemplate } from '../src/practice/generator';

describe('template generator', () => {
  it('produces many different variations, never repeating a signature', () => {
    const template = SAMPLE_TEMPLATES.find((t) => t.id === 'g2-times-table')!;
    const variations = generateVariations(template, 30, { seed: 1234 });

    expect(variations).toHaveLength(30);
    const signatures = new Set(variations.map((v) => v.signature));
    expect(signatures.size).toBe(30);

    // The prompts are genuinely different, not just the option order.
    const prompts = new Set(variations.map((v) => v.prompt));
    expect(prompts.size).toBeGreaterThan(10);
  });

  it('recomputes the answer for every variation (never reuses the template answer)', () => {
    const template = SAMPLE_TEMPLATES.find((t) => t.id === 'g2-times-table')!;
    for (const v of generateVariations(template, 40, { seed: 99 })) {
      const a = Number(v.vars.a);
      const b = Number(v.vars.b);
      // The printed answer must be the product of the printed numbers.
      expect(Number(v.answer)).toBe(a * b);
      expect(v.options).toContain(v.answer);
    }
  });

  it('is deterministic: the same seed rebuilds the same question', () => {
    const template = SAMPLE_TEMPLATES.find((t) => t.id === 'g5-angle-sum')!;
    const first = generateFromTemplate(template, { seed: 777 });
    const again = generateFromTemplate(template, { seed: 777 });
    expect(again.signature).toBe(first.signature);
    expect(again.answer).toBe(first.answer);
    expect(again.options).toEqual(first.options);
  });

  it('regenerates a stored question from its id after a reload', () => {
    const original = previewTemplate('g7-linear-equation', 1)[0];
    const restored = regenerateFromId(original.id)!;
    expect(restored.id).toBe(original.id);
    expect(restored.prompt).toBe(original.prompt);
    expect(restored.answer).toBe(original.answer);
  });

  it('always offers distinct options including the answer', () => {
    for (const template of SAMPLE_TEMPLATES) {
      for (const v of previewTemplate(template.id, 40)) {
        expect(v.options.length).toBe(4);
        expect(new Set(v.options).size).toBe(4);
        expect(v.options).toContain(v.answer);
      }
    }
  });

  it('shuffles answer positions rather than always placing the answer first', () => {
    const template = SAMPLE_TEMPLATES.find((t) => t.id === 'g2-times-table')!;
    const positions = new Set(
      generateVariations(template, 40, { seed: 5 }).map((v) => v.options.indexOf(v.answer)),
    );
    expect(positions.size).toBeGreaterThan(1);
  });

  it('respects choice variables', () => {
    const template = SAMPLE_TEMPLATES.find((t) => t.id === 'g6-percent-of')!;
    for (const v of generateVariations(template, 40, { seed: 12 })) {
      expect([10, 20, 25, 50]).toContain(Number(v.vars.p));
    }
  });

  it('rejects templates whose answer cannot be valid, instead of shipping them', () => {
    const broken = defineTemplate({
      id: 'broken-negative',
      grade: 1,
      topicId: 'x',
      subtopicId: 'y',
      prompt: '{a} − {b} = ?',
      variables: {
        a: { kind: 'int', min: 1, max: 5 },
        b: { kind: 'int', min: 10, max: 20 },
      },
      answer: (v) => Number(v.a) - Number(v.b),
      format: { kind: 'integer', min: 0 }, // negatives forbidden
      explanation: () => 'x',
    });

    expect(() => generateFromTemplate(broken, { seed: 42 })).toThrow(TemplateError);
  });

  it('rejects a template that would produce a fraction when whole numbers are required', () => {
    const broken = defineTemplate({
      id: 'broken-fraction',
      grade: 3,
      topicId: 'x',
      subtopicId: 'y',
      prompt: '{a} ÷ {b}',
      variables: {
        a: { kind: 'int', min: 5, max: 9 },
        b: { kind: 'int', min: 2, max: 4 },
      },
      answer: (v) => Number(v.a) / Number(v.b),
      format: { kind: 'integer' }, // 5 ÷ 2 is not an integer
      explanation: () => 'x',
    });

    // Some draws are valid (6 ÷ 3); the invalid ones must never escape.
    for (let seed = 0; seed < 60; seed += 1) {
      try {
        const q = generateFromTemplate(broken, { seed });
        expect(Number.isInteger(Number(q.answer))).toBe(true);
      } catch (error) {
        expect(error).toBeInstanceOf(TemplateError);
      }
    }
  });

  it('needs enough distinct options', () => {
    const noDistractors = defineTemplate({
      id: 'no-distractors',
      grade: 1,
      topicId: 'x',
      subtopicId: 'y',
      prompt: 'x',
      variables: { a: { kind: 'int', min: 1, max: 1 } },
      answer: () => 1,
      distractors: () => [],
      explanation: () => 'x',
    });
    expect(() => generateFromTemplate(noDistractors, { seed: 1 })).toThrow(TemplateError);
  });
});

describe('generated answers are mathematically correct', () => {
  it('grade I placeholder addition answers the printed sum', () => {
    // Grade I now has one placeholder per curriculum subtopic; each must still
    // print a sum whose answer is correct.
    for (const v of previewTemplate('g1-ra-aris-Sekreba', 60)) {
      expect(Number(v.answer)).toBe(Number(v.vars.a) + Number(v.vars.b));
    }
  });

  it('grade II multiplication and metres', () => {
    for (const v of previewTemplate('g2-times-table', 150)) {
      expect(Number(v.answer)).toBe(Number(v.vars.a) * Number(v.vars.b));
    }
    for (const v of previewTemplate('g2-meter-cm', 100)) {
      expect(Number(v.answer)).toBe(Number(v.vars.m) * 100 + Number(v.vars.cm));
    }
  });

  it('grade III division is always exact and perimeter is right', () => {
    for (const v of previewTemplate('g3-divide-exact', 150)) {
      expect(Number(v.answer)).toBe(Number(v.vars.a) / Number(v.vars.b));
      expect(Number.isInteger(Number(v.answer))).toBe(true);
      expect(Number(v.vars.b)).not.toBe(0); // never divide by zero
      expect(Number(v.answer) * Number(v.vars.b)).toBe(Number(v.vars.a));
    }
    for (const v of previewTemplate('g3-perimeter-rect', 150)) {
      expect(Number(v.answer)).toBe(2 * (Number(v.vars.w) + Number(v.vars.h)));
    }
  });

  it('grade IV rounding and fractions of a number', () => {
    for (const v of previewTemplate('g4-round-ten', 150)) {
      expect(Number(v.answer)).toBe(Math.round(Number(v.vars.n) / 10) * 10);
      expect(Number(v.answer) % 10).toBe(0);
    }
    for (const v of previewTemplate('g4-fraction-of', 150)) {
      expect(Number(v.answer)).toBe(Number(v.vars.n) / Number(v.vars.d));
      expect(Number.isInteger(Number(v.answer))).toBe(true);
    }
  });

  it('grade V fractions and triangle angles', () => {
    for (const v of previewTemplate('g5-add-fractions-same-denominator', 150)) {
      const d = Number(v.vars.d);
      const expected = (Number(v.vars.a) + Number(v.vars.b)) / d;
      const answer = v.answer.includes('/')
        ? v.answer.split('/').map(Number).reduce((a, b) => a / b)
        : Number(v.answer);
      expect(answer).toBeCloseTo(expected, 10);
    }
    for (const v of previewTemplate('g5-angle-sum', 150)) {
      expect(v.answer).toBe(`${180 - Number(v.vars.a) - Number(v.vars.b)}°`);
      expect(Number(v.answer.replace('°', ''))).toBeGreaterThan(0);
    }
  });

  it('grade VI percentages and negative numbers', () => {
    for (const v of previewTemplate('g6-percent-of', 150)) {
      expect(Number(v.answer)).toBe((Number(v.vars.n) * Number(v.vars.p)) / 100);
    }
    for (const v of previewTemplate('g6-negative-add', 150)) {
      expect(Number(v.answer)).toBe(Number(v.vars.a) + Number(v.vars.b));
      expect(Number(v.vars.a)).toBeLessThan(0);
    }
  });

  it('grade VII linear equations and triangle area', () => {
    for (const v of previewTemplate('g7-linear-equation', 150)) {
      // The generated x must satisfy the equation it is printed with.
      const { a, b, c } = v.vars;
      expect(Number(a) * Number(v.answer) + Number(b)).toBe(Number(c));
    }
    for (const v of previewTemplate('g7-area-triangle', 150)) {
      const expected = 0.5 * Number(v.vars.b) * Number(v.vars.h);
      expect(Number(v.answer.replace(' სმ²', ''))).toBe(expected);
    }
  });
});

describe('registry', () => {
  it('finds templates by grade/topic/subtopic and rejects duplicate ids', () => {
    const registry = TEMPLATE_REGISTRY;
    // Authored subtopics have several templates (one per level, and often more
    // than one per level); the point here is that the registry finds them.
    expect(
      registry.forSubtopic({ grade: 1, topicId: 'Sekreba', subtopicId: 'SuratiT-10' }).length,
    ).toBeGreaterThan(1);
    expect(registry.forSubtopic({ grade: 7, topicId: 'geometria', subtopicId: 'fartobi' })).toHaveLength(1);
    // An address with nothing behind it must report empty rather than throw.
    expect(
      registry.forSubtopic({ grade: 3, topicId: 'meoreklasebi', subtopicId: 'araarsebobs' }),
    ).toEqual([]);

    expect(() => createTemplateRegistry([SAMPLE_TEMPLATES[0], SAMPLE_TEMPLATES[0]])).toThrow(
      /Duplicate template id/,
    );
  });

  it('generates a batch without repeats', () => {
    const ref = { grade: 1 as const, topicId: 'Sekreba', subtopicId: 'SuratiT-10' };
    const batch = generateBatch(ref, 10, { seed: 3 });
    expect(batch).toHaveLength(10);
    expect(new Set(batch.map((q) => q.signature)).size).toBe(10);
    expect(new Set(batch.map((q) => q.id)).size).toBe(10);
  });

  it('returns nothing for a subtopic with no template instead of throwing', () => {
    // A subtopic that exists in the curriculum but has no template behind it.
    const empty = createTemplateRegistry([]);
    const ref = { grade: 2 as const, topicId: 'gazomva', subtopicId: 'dro' };
    expect(generateBatch(ref, 5, { registry: empty })).toHaveLength(0);
  });
});
