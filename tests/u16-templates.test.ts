import { describe, expect, it } from 'vitest';
import { U16_SUBTOPICS, U16_TEMPLATES } from '../src/practice/templates/u16-logic';
import {
  COLOR_KEYS,
  colorByKey,
  colorSequenceVisual,
  parseColorSequenceVisual,
  ELIMINATION_SETS,
  createBalanceScale,
  drawBalanceScale,
  parseBalanceScaleVisual,
} from '../src/practice/templates/logic';
import { generateVariations } from '../src/practice/templates/generate';
import { hasTemplates } from '../src/practice/generator';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import type { GeneratedQuestion } from '../src/practice/templates/generate';

const SAMPLES = 12;
const SEED = 20261105;

const templateFor = (id: string) => {
  const template = U16_TEMPLATES.find((candidate) => candidate.id === id);
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
  throw new Error(`could not draw ${templateId}`);
};

describe('U16 subtopics and catalog registration', () => {
  it('covers all 4 subtopics of logical reasoning', () => {
    expect(U16_SUBTOPICS).toEqual([
      'ferebi-wesis-mixedviT',
      'gamoricxva',
      'sascori',
      'Cafiqrebuli-ricxvi',
    ]);
  });

  it('all 4 subtopics are playable in Grade 1', () => {
    for (const subtopicId of U16_SUBTOPICS) {
      const ref = { grade: 1, topicId: 'logikuri-azrovneba', subtopicId };
      expect(hasTemplates(ref as never), subtopicId).toBe(true);
    }
  });

  it('every subtopic has authored templates for levels 1, 2, and 3', () => {
    for (const subtopicId of U16_SUBTOPICS) {
      const templates = U16_TEMPLATES.filter((t) => t.subtopicId === subtopicId);
      const levels = new Set(templates.map((t) => t.difficulty));
      expect(levels.has(1), `${subtopicId} level 1`).toBe(true);
      expect(levels.has(2), `${subtopicId} level 2`).toBe(true);
      expect(levels.has(3), `${subtopicId} level 3`).toBe(true);
    }
  });

  it('every template is registered in the global TEMPLATE_REGISTRY', () => {
    const allRegistered = new Set(TEMPLATE_REGISTRY.all.map((t) => t.id));
    for (const template of U16_TEMPLATES) {
      expect(allRegistered.has(template.id), template.id).toBe(true);
    }
  });
});

describe('U16.1: color sequences and pattern rules', () => {
  it('defines colorful items with Georgian grammar and emojis', () => {
    expect(COLOR_KEYS.length).toBeGreaterThanOrEqual(6);
    const red = colorByKey('red');
    expect(red.name).toBe('წითელი');
    expect(red.emoji).toBe('🔴');

    const blue = colorByKey('blue');
    expect(blue.name).toBe('ლურჯი');
    expect(blue.emoji).toBe('🔵');
  });

  it('draws and parses color sequence diagrams', () => {
    const red = colorByKey('red');
    const blue = colorByKey('blue');
    const visual = colorSequenceVisual([red, blue, red, blue, red], 4);
    expect(visual).toContain('❓');
    const parsed = parseColorSequenceVisual(visual);
    expect(parsed.targetIndex).toBe(4);
    expect(parsed.totalCount).toBe(5);
    expect(parsed.emojis[0]).toBe('🔴');
    expect(parsed.emojis[1]).toBe('🔵');
  });

  it('handles middle blank position correctly', () => {
    const red = colorByKey('red');
    const blue = colorByKey('blue');
    const visual = colorSequenceVisual([blue, red, blue, red, blue, red], 3);
    const parsed = parseColorSequenceVisual(visual);
    expect(parsed.targetIndex).toBe(3);
    expect(parsed.emojis[3]).toBe('❓');
  });
});

describe('U16.2: elimination (odd one out)', () => {
  it('provides distinct semantic categories with multiple Georgian words', () => {
    expect(ELIMINATION_SETS.length).toBeGreaterThanOrEqual(7);
    for (const group of ELIMINATION_SETS) {
      expect(group.category.length).toBeGreaterThan(0);
      expect(group.items.length).toBeGreaterThanOrEqual(4);
      expect(group.distractor.name.length).toBeGreaterThan(0);
    }
  });

  it('generates category elimination questions with unambiguous options', () => {
    const questions = generateMany('g1-u16-2-category-elimination', 10);
    for (const q of questions) {
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(String(q.answer));
      const unique = new Set(q.options);
      expect(unique.size).toBe(4);
    }
  });

  it('correctly eliminates numbers by parity (odd or even)', () => {
    const oddEven = generateMany('g1-u16-2-parity-even-odd', 4);
    for (const q of oddEven) {
      const ans = Number(q.answer);
      expect(ans % 2).toBe(1); // odd among evens
    }

    const evenOdd = generateMany('g1-u16-2-parity-odd-even', 4);
    for (const q of evenOdd) {
      const ans = Number(q.answer);
      expect(ans % 2).toBe(0); // even among odds
    }
  });

  it('eliminates non-multiples of 5', () => {
    const multQuestions = generateMany('g1-u16-2-multiples-of-five', 4);
    for (const q of multQuestions) {
      const ans = Number(q.answer);
      expect(ans % 5).not.toBe(0);
    }
  });

  it('eliminates two-digit numbers among single digits', () => {
    const questions = generateMany('g1-u16-2-single-vs-two-digit', 4);
    for (const q of questions) {
      const ans = Number(q.answer);
      expect(ans).toBeGreaterThanOrEqual(10);
    }
  });
});

describe('U16.3: balance scales logic and ASCII visuals', () => {
  it('computes equilibrium correctly', () => {
    const balanced = createBalanceScale(3, 3, 'ვაშლი', '🍎');
    expect(balanced.balanced).toBe(true);
    expect(balanced.heavierSide).toBe('equal');
    expect(balanced.difference).toBe(0);

    const leftHeavier = createBalanceScale(4, 2, 'ვაშლი', '🍎');
    expect(leftHeavier.balanced).toBe(false);
    expect(leftHeavier.heavierSide).toBe('left');
    expect(leftHeavier.difference).toBe(2);

    const rightHeavier = createBalanceScale(1, 4, 'ბურთი', '⚽');
    expect(rightHeavier.balanced).toBe(false);
    expect(rightHeavier.heavierSide).toBe('right');
    expect(rightHeavier.difference).toBe(3);
  });

  it('draws and parses balance scale ASCII art', () => {
    const scale = createBalanceScale(3, 1, 'კუბიკი', '🧊');
    const visual = drawBalanceScale(scale);
    expect(visual).toContain('▲');
    const parsed = parseBalanceScaleVisual(visual);
    expect(parsed.leftCount).toBe(3);
    expect(parsed.rightCount).toBe(1);
    expect(parsed.balanced).toBe(false);
  });

  it('generates difference and equalization questions consistently', () => {
    const questions = generateMany('g1-u16-3-difference-between-sides', 8);
    for (const q of questions) {
      const diff = Number(q.answer);
      expect(diff).toBeGreaterThanOrEqual(0);
      expect(q.prompt).toContain('რამდენით მეტი');
    }
  });

  it('solves balance equivalence questions', () => {
    const questions = generateMany('g1-u16-3-equivalence-balance', 4);
    for (const q of questions) {
      expect(['დიახ', 'არა']).toContain(q.answer);
    }

    const twoStepQuestions = generateMany('g1-u16-3-two-step-balance-scale', 4);
    for (const q of twoStepQuestions) {
      const ans = Number(q.answer);
      expect(ans).toBeGreaterThan(0);
      expect(Number.isInteger(ans)).toBe(true);
    }
  });
});

describe('U16.4: thought-of number inverse operations', () => {
  it('solves x + a = b -> x = b - a', () => {
    const questions = generateMany('g1-u16-4-thought-add-single', 10);
    for (const q of questions) {
      const ans = Number(q.answer);
      expect(ans).toBeGreaterThan(0);
      expect(Number.isInteger(ans)).toBe(true);
    }
  });

  it('solves x - a = b -> x = b + a', () => {
    const questions = generateMany('g1-u16-4-thought-sub-single', 10);
    for (const q of questions) {
      const ans = Number(q.answer);
      expect(ans).toBeGreaterThan(0);
      expect(Number.isInteger(ans)).toBe(true);
    }
  });

  it('solves mystery box equations: [ ? ] + a = b and [ ? ] - a = b', () => {
    const boxQuestions = generateMany('g1-u16-4-mystery-box', 6);
    for (const q of boxQuestions) {
      expect(q.prompt).toContain('[ ? ]');
      expect(Number(q.answer)).toBeGreaterThan(0);
    }
  });

  it('solves doubling inverse (x + x = sum)', () => {
    const doubling = generateMany('g1-u16-4-thought-double', 6);
    for (const q of doubling) {
      const ans = Number(q.answer);
      expect(ans * 2).toBeLessThanOrEqual(20);
      expect(Number.isInteger(ans)).toBe(true);
    }
  });

  it('solves two-step thought-of number operations', () => {
    const twoStep = generateMany('g1-u16-4-thought-two-step', 8);
    for (const q of twoStep) {
      const ans = Number(q.answer);
      expect(ans).toBeGreaterThan(0);
      expect(Number.isInteger(ans)).toBe(true);
    }
  });
});

describe('U16 spec direct reference questions', () => {
  it('reproduces spec U16.1 questions faithfully', () => {
    // Q1: Red, Blue, Red, Blue, ? -> Red
    const tQ1 = templateFor('g1-u16-1-ab-color-sequence');
    const q1Ans = tQ1.answer({ c1Key: 'red', c2Key: 'blue', c1Name: 'წითელი', c2Name: 'ლურჯი', seqWords: 'წითელი, ლურჯი' });
    expect(q1Ans).toBe('წითელი');

    // Q3: Red, Red, Blue, Red, Red, ? -> Blue
    const tQ3 = templateFor('g1-u16-1-aab-color-sequence');
    const q3Ans = tQ3.answer({ c1Key: 'red', c2Key: 'blue', c1Name: 'წითელი', c2Name: 'ლურჯი', seqWords: 'წითელი, წითელი, ლურჯი' });
    expect(q3Ans).toBe('ლურჯი');

    // Q4: Green, Blue, Blue, Green, Blue, Blue, ? -> Green
    const tQ4 = templateFor('g1-u16-1-abb-color-sequence');
    const q4Ans = tQ4.answer({ c1Key: 'green', c2Key: 'blue', c1Name: 'მწვანე', c2Name: 'ლურჯი', seqWords: 'მწვანე, ლურჯი, ლურჯი' });
    expect(q4Ans).toBe('მწვანე');

    // Q5: Red, Yellow, Blue, Red, Yellow, ? -> Blue
    const tQ5 = templateFor('g1-u16-1-abc-color-sequence');
    const q5Ans = tQ5.answer({
      c1Key: 'red',
      c2Key: 'yellow',
      c3Key: 'blue',
      c1Name: 'წითელი',
      c2Name: 'ყვითელი',
      c3Name: 'ლურჯი',
      seqWords: 'წითელი, ყვითელი, ლურჯი',
    });
    expect(q5Ans).toBe('ლურჯი');

    // Q10: White, Black, White, Black... 10th item -> Black
    const tQ10 = templateFor('g1-u16-1-position-color');
    const q10Ans = tQ10.answer({ pos: 10, c1Name: 'თეთრი', c2Name: 'შავი' });
    expect(q10Ans).toBe('შავი');
  });

  it('reproduces spec U16.2 elimination questions faithfully', () => {
    // Q5: 2, 4, 6, 7 -> 7 is odd
    const tQ5 = templateFor('g1-u16-2-parity-even-odd');
    const q5Ans = tQ5.answer({ oddNum: 7, numList: '2, 4, 6, 7' });
    expect(q5Ans).toBe(7);

    // Q6: 1, 3, 5, 8 -> 8 is even
    const tQ6 = templateFor('g1-u16-2-parity-odd-even');
    const q6Ans = tQ6.answer({ evenNum: 8, numList: '1, 3, 5, 8' });
    expect(q6Ans).toBe(8);

    // Q7: Triangle, Square, Rectangle, Circle -> Circle
    const tQ7 = templateFor('g1-u16-2-polygons-vs-circle');
    const q7Ans = tQ7.answer({ setIdx: 0, promptList: 'სამკუთხედი, კვადრატი, მართკუთხედი, წრე' });
    expect(q7Ans).toBe('წრე');

    // Q9: 5, 10, 15, 17 -> 17 is not multiple of 5
    const tQ9 = templateFor('g1-u16-2-multiples-of-five');
    const q9Ans = tQ9.answer({ nonMultiple: 17, numList: '5, 10, 15, 17' });
    expect(q9Ans).toBe(17);
  });

  it('reproduces spec U16.3 balance scales questions faithfully', () => {
    // Q1: 2 apples on left, 2 apples on right -> balanced (დიახ)
    const tQ1 = templateFor('g1-u16-3-is-scale-balanced');
    const q1Ans = tQ1.answer({ left: 2, right: 2, diff: 0, item: 'ვაშლი' });
    expect(q1Ans).toBe('დიახ');

    // Q2: 3 apples on left, 1 apple on right -> 3 apples side is lower
    const tQ2 = templateFor('g1-u16-3-which-side-lower');
    const q2Ans = tQ2.answer({ left: 3, right: 1, item: 'ვაშლი' });
    expect(q2Ans).toBe('3 ვაშლი-ის მხარეს');

    // Q3: 3 cubes on left, 3 cubes on right -> equal
    const tQ3 = templateFor('g1-u16-3-which-side-heavier');
    const q3Ans = tQ3.answer({ count: 3, item: 'კუბიკი' });
    expect(q3Ans).toBe('არცერთი, ორივე მხარე თანაბარია');

    // Q5: 4 apples on left, 2 apples on right -> difference is 2
    const tQ5 = templateFor('g1-u16-3-difference-between-sides');
    const q5Ans = tQ5.answer({ left: 4, right: 2, diff: 2, item: 'ვაშლი' });
    expect(q5Ans).toBe(2);

    // Q7: 1 melon = 2 melons ratio -> 2 watermelons = 4 melons
    const tQ7 = templateFor('g1-u16-3-two-step-balance-scale');
    const q7Ans = tQ7.answer({ ratio: 2 });
    expect(q7Ans).toBe(4);
  });

  it('reproduces spec U16.4 thought-of number questions faithfully', () => {
    // Q1: thought of x, + 3 = 7 -> 4
    const tQ1 = templateFor('g1-u16-4-thought-add-single');
    const q1Ans = tQ1.answer({ thought: 4, a: 3, b: 7 });
    expect(q1Ans).toBe(4);

    // Q2: thought of x, + 5 = 10 -> 5
    const q2Ans = tQ1.answer({ thought: 5, a: 5, b: 10 });
    expect(q2Ans).toBe(5);

    // Q3: thought of x, - 2 = 6 -> 8
    const tQ3 = templateFor('g1-u16-4-thought-sub-single');
    const q3Ans = tQ3.answer({ thought: 8, a: 2, b: 6 });
    expect(q3Ans).toBe(8);

    // Q5: [ ? ] + 6 = 10 -> 4
    const tQ5 = templateFor('g1-u16-4-mystery-box');
    const q5Ans = tQ5.answer({ thought: 4, a: 6, b: 10 });
    expect(q5Ans).toBe(4);

    // Q9: x + x = 8 -> 4
    const tQ9 = templateFor('g1-u16-4-thought-double');
    const q9Ans = tQ9.answer({ thought: 4, doubled: 8 });
    expect(q9Ans).toBe(4);

    // Q10: (x + 2) - 3 = 5 -> 6
    const tQ10 = templateFor('g1-u16-4-thought-two-step');
    const q10Ans = tQ10.answer({ thought: 6, a: 2, b: 3, final: 5 });
    expect(q10Ans).toBe(6);
  });
});
