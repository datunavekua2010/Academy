import { describe, expect, it } from 'vitest';
import {
  COVERAGE_TEMPLATES,
  GRADE1_PLACEHOLDERS,
  SAMPLE_TEMPLATES,
  U01_TEMPLATES,
  U02_TEMPLATES,
  U03_TEMPLATES,
  U04_TEMPLATES,
  U05_TEMPLATES,
} from '../src/practice/templates/catalog';
import { generateFromTemplate } from '../src/practice/templates/generate';

/**
 * A "which of these two is more?" question must offer **both** quantities.
 *
 * The bug this file exists for: „რომელი რიცხვია მეტი: 15 თუ 2?“ shipped with
 * options 14, 15, 16, 17. Only one of the two printed numbers appeared, so the
 * option that matched the sentence was always the greater one — the child could
 * answer without comparing anything, and was always right. The near-misses made
 * it look like a real multiple-choice question while being a one-item giveaway.
 *
 * The rule: when a question prints two quantities and asks the student to pick
 * one of them, both must be on offer. The choice then genuinely requires the
 * comparison, and the wrong option is the other real quantity rather than an
 * invented neighbour.
 */

const ALL_TEMPLATES = [
  ...SAMPLE_TEMPLATES,
  ...COVERAGE_TEMPLATES,
  ...GRADE1_PLACEHOLDERS,
  ...U01_TEMPLATES,
  ...U02_TEMPLATES,
  ...U03_TEMPLATES,
  ...U04_TEMPLATES,
  ...U05_TEMPLATES,
];

/**
 * Templates that ask the student to compare two printed quantities.
 *
 * Written as an explicit list rather than inferred: a regex over Georgian
 * question words catches arithmetic and true/false prompts that legitimately
 * print numbers without offering them („7 + 2 = ?“), and would have to be
 * loosened until it stopped catching anything. The list is also the record of
 * which questions this rule has been checked against.
 */
const PAIR_COMPARISONS = [
  // grade 1, unit „მდებარეობა და შედარება“
  'g1-grZeli-mokle',
  'g1-mZime-msubuqi',
  'g1-gansieri-vicki',
  // grade 1, „უდიდესი და უმცირესი“
  'g1-udidesi-umciresti',
  // grade 1, „თანხების შედარება“
  'g1-tanxaTa-Sedareba',
  // grade 1, U05 „შედარება და დალაგება“
  'g1-u05-2-larger',
  'g1-u05-2-smaller',
  'g1-u05-3-larger',
  'g1-u05-3-larger-close',
];

/** „ვინ არის უფრო მაღალი: ნინო თუ გიორგი?“ — names instead of quantities. */
const NAMED_COMPARISONS = ['g1-magle-dabali'];

const sample = (templateId: string, count = 40) => {
  const template = ALL_TEMPLATES.find((candidate) => candidate.id === templateId);
  if (!template) throw new Error(`no template ${templateId}`);
  const questions = [];
  for (let seed = 1; seed <= count; seed += 1) {
    questions.push(generateFromTemplate(template, { seed }));
  }
  return questions;
};

describe('comparison questions offer both quantities', () => {
  it.each(PAIR_COMPARISONS)('%s offers both printed numbers', (templateId) => {
    for (const question of sample(templateId)) {
      const options = (question.options ?? []).map(String);
      const shown = (question.prompt.match(/-?\d+/g) ?? []).map(String);
      expect(shown.length, `${question.prompt} printed fewer than two numbers`).toBeGreaterThan(1);

      expect(options, `${templateId}: ${question.prompt} offered no options`).not.toEqual([]);
      for (const quantity of shown) {
        expect(options, `${templateId}: „${quantity}“ is printed but not offered`).toContain(
          quantity,
        );
      }
    }
  });

  it.each(PAIR_COMPARISONS)('%s offers exactly the two quantities', (templateId) => {
    // Both, and nothing else: a third invented neighbour would let a child
    // narrow the choice without comparing.
    for (const question of sample(templateId)) {
      const options = (question.options ?? []).map(String);
      const shown = (question.prompt.match(/-?\d+/g) ?? []).map(String);
      expect(options.slice().sort(), `${templateId}: ${question.prompt}`).toEqual(shown.slice().sort());
    }
  });

  it.each(PAIR_COMPARISONS)('%s keys the answer to the comparison, not the position', (templateId) => {
    // Whichever quantity the question asks for has to be the answer, and the
    // answer must appear in either slot — so a child cannot learn "always pick
    // the first" or "always the second".
    const wantsSmaller = templateId.includes('smaller');
    const expected = (...shown: number[]) => (wantsSmaller ? Math.min(...shown) : Math.max(...shown));

    const slots = new Set<number>();
    for (const question of sample(templateId)) {
      const shown = (question.prompt.match(/-?\d+/g) ?? []).map(Number);
      const options = (question.options ?? []).map(String);
      expect(Number(question.answer), `${templateId}: ${question.prompt}`).toBe(expected(...shown));
      slots.add(options.indexOf(String(question.answer)));
    }
    expect([...slots].sort(), `${templateId}: the answer never moved between slots`).toHaveLength(2);
  });
});

describe('named comparisons answer the question that was asked', () => {
  it.each(NAMED_COMPARISONS)('%s answers with the person, not a number', (templateId) => {
    // „ვინ არის უფრო მაღალი?“ cannot be answered with „88“ — the question asks
    // who, and the heights are already printed.
    for (const question of sample(templateId)) {
      const options = (question.options ?? []).map(String);
      expect(options, `${templateId} offered no options`).not.toEqual([]);
      for (const option of options) {
        expect(option, `${templateId} offered the number ${option} to a “who” question`).not.toMatch(
          /^\d+$/,
        );
      }
      const shown = (question.prompt.match(/-?\d+/g) ?? []).map(Number);
      const taller = shown[0] > shown[1] ? 'ნინო' : 'გიორგი';
      expect(question.answer, `${templateId}: ${question.prompt}`).toBe(taller);
      expect(options).toContain(String(question.answer));
    }
  });
});
