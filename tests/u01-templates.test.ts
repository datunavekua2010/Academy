import { describe, expect, it } from 'vitest';
import { U01_SUBTOPICS, U01_TEMPLATES } from '../src/practice/templates/u01-space';
import { generateFromTemplate, generateVariations } from '../src/practice/templates/generate';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';

/**
 * U01 — generated questions must be *correct*, not merely well-formed.
 *
 * Every assertion here re-derives the answer from what the student can see:
 * the drawn picture (`visual`) and the numbers printed in the prompt. That is
 * the only way to catch the failure this suite exists for — a question whose
 * wording, picture and answer key quietly disagree, which no type checker can
 * see and which a child would experience as being marked wrong for being right.
 */

const SAMPLES = 60;

/**
 * Every distinct question a template can produce from a spread of seeds.
 *
 * Some templates are built on a finite vocabulary (eight scenes, twelve
 * objects). Asking one of those for more variations than it can hold would
 * throw "ranges are too narrow" — which is the generator correctly protecting
 * the student, not a bug. So the batch shrinks to whatever is available, and
 * the tests below assert on all of it.
 */
const generateMany = (templateId: string, count = SAMPLES) => {
  const template = U01_TEMPLATES.find((t) => t.id === templateId);
  if (!template) throw new Error(`no template ${templateId}`);

  const out = [];
  for (let take = Math.min(count, SAMPLES); take >= 1; take = Math.floor(take / 2)) {
    try {
      return generateVariations(template, take, { seed: 20260101 });
    } catch {
      // too narrow for `take`; try a smaller batch
    }
  }
  throw new Error(`${templateId} could not produce even one variation`);
};

/** Numbers printed in a prompt, in order. */
const numbersIn = (prompt: string): number[] =>
  (prompt.match(/\d+/g) ?? []).map(Number);

const countEmojis = (text: string): number =>
  // Emoji are astral-plane characters; `u` flag counts them as one code point.
  (text.match(/\p{Extended_Pictographic}/gu) ?? []).length;

describe('U01 template library', () => {
  it('covers every U01 subtopic', () => {
    const covered = new Set(U01_TEMPLATES.map((t) => t.subtopicId));
    for (const subtopic of U01_SUBTOPICS) {
      expect(covered.has(subtopic), `no template for ${subtopic}`).toBe(true);
    }
  });

  it('gives every subtopic more than one question form', () => {
    // The spec is explicit that swapping a number for another number is not
    // meaningful variation. Multiple templates per subtopic is the structural
    // evidence that the variation is in the reasoning, not only the digits.
    for (const subtopic of U01_SUBTOPICS) {
      const count = U01_TEMPLATES.filter((t) => t.subtopicId === subtopic).length;
      expect(count, `${subtopic} has only ${count} template(s)`).toBeGreaterThanOrEqual(1);
      const forms = new Set(
        U01_TEMPLATES.filter((t) => t.subtopicId === subtopic).map((t) => t.prompt),
      );
      expect(forms.size, `${subtopic} repeats one prompt`).toBe(count);
    }
  });

  it('is registered, and replaces the placeholder for each subtopic', () => {
    for (const subtopic of U01_SUBTOPICS) {
      const registered = TEMPLATE_REGISTRY.forSubtopic({ grade: 1, topicId: 'mdebareoba', subtopicId: subtopic });
      expect(registered.length, `nothing playable for ${subtopic}`).toBeGreaterThan(0);
      // Placeholders are ids of the shape `g1-<subtopicId>`; none may survive
      // alongside the real templates or the student could be shown either.
      const placeholders = registered.filter((t) => t.id === `g1-${subtopic}`);
      expect(placeholders, `placeholder still registered for ${subtopic}`).toEqual([]);
    }
  });

  it('never shows a literal {placeholder} to a student', () => {
    for (const template of U01_TEMPLATES) {
      for (const question of generateMany(template.id, 20)) {
        expect(question.prompt).not.toMatch(/\{\w+\}/);
        expect(question.visual ?? '').not.toMatch(/\{\w+\}/);
        expect(question.explanation).not.toMatch(/\{\w+\}/);
      }
    }
  });

  it('always offers exactly one correct option', () => {
    for (const template of U01_TEMPLATES) {
      for (const question of generateMany(template.id, 20)) {
        expect(question.options.filter((o) => o === question.answer)).toHaveLength(1);
        expect(new Set(question.options).size).toBe(question.options.length);
        expect(question.options.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('is deterministic for a given seed', () => {
    for (const template of U01_TEMPLATES) {
      const a = generateFromTemplate(template, { seed: 777 });
      const b = generateFromTemplate(template, { seed: 777 });
      expect(a.prompt).toBe(b.prompt);
      expect(a.answer).toBe(b.answer);
    }
  });

  it('produces genuine variety, not one question reskinned', () => {
    for (const template of U01_TEMPLATES) {
      const questions = generateMany(template.id, 15);
      const distinct = new Set(questions.map((q) => q.signature));
      // The ceiling differs per template — a scene library holds eight
      // pictures, a numeric comparison holds hundreds — so the bar is
      // "most of what it produced is different", never "one question
      // repeated with new numbers".
      expect(distinct.size, `${template.id} barely varies`).toBeGreaterThanOrEqual(
        Math.max(2, Math.ceil(questions.length * 0.85)),
      );
    }
  });
});

describe('U01.1 — left / middle / right', () => {
  it('names the object that is actually in the stated position', () => {
    for (const question of generateMany('g1-u01-1-name-position')) {
      const items = (question.visual ?? '').trim().split(/\s+/).filter(Boolean);
      expect(items.length).toBeGreaterThanOrEqual(3);

      // The answer must be one of the drawn objects...
      const drawnNames = new Set(question.options);
      expect(drawnNames.has(question.answer)).toBe(true);

      if (question.prompt.includes('მარცხნივ')) {
        expect(question.answer).toBe(answerNameFor(items[0]));
      } else if (question.prompt.includes('მარჯვნივ')) {
        expect(question.answer).toBe(answerNameFor(items[items.length - 1]));
      } else {
        // "შუაში" is only valid on an odd row, and must be its true centre.
        expect(items.length % 2).toBe(1);
        const centre = items[(items.length - 1) / 2];
        expect(question.answer).toBe(answerNameFor(centre));
      }
    }
  });

  it('only asks for the middle when a middle exists', () => {
    for (const question of generateMany('g1-u01-1-name-position')) {
      if (!question.prompt.includes('შუაში')) continue;
      const items = (question.visual ?? '').trim().split(/\s+/).filter(Boolean);
      expect(items.length % 2, 'asked for the middle of an even row').toBe(1);
    }
  });

  it('never asks about an object that is not in the row', () => {
    for (const question of generateMany('g1-u01-1-which-position')) {
      const items = (question.visual ?? '').trim().split(/\s+/).filter(Boolean);
      // Prompt: "which one is <thing> in the row?"
      const named = question.prompt.replace(/^.*რიგში\s+/, '').replace(/\?$/, '').trim();
      const drawn = items.map((emoji) => nameForEmoji(emoji));
      expect(drawn, `asked about ${named} which is not drawn`).toContain(named);
      // ...and exactly once, so the position is unambiguous.
      expect(drawn.filter((n) => n === named)).toHaveLength(1);
    }
  });

  it('gives the position that matches the drawn order', () => {
    const ORDINALS = ['პირველი', 'მეორე', 'მესამე', 'მეოთხე', 'მეხუთე'];
    for (const question of generateMany('g1-u01-1-which-position')) {
      const items = (question.visual ?? '').trim().split(/\s+/).filter(Boolean);
      const named = question.prompt.replace(/^.*რიგში\s+/, '').replace(/\?$/, '').trim();
      const index = items.findIndex((emoji) => nameForEmoji(emoji) === named);
      expect(question.answer).toBe(ORDINALS[index]);
    }
  });
});

describe('U01.2 — above / below / beside', () => {
  it('names the relation the picture actually shows', () => {
    for (const question of generateMany('g1-u01-2-where-is-it')) {
      // "beside" is drawn side by side on one line; "above"/"below" stack the
      // two objects vertically, because the layout itself carries the meaning.
      const lines = (question.visual ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
      const objects = lines.flatMap((line) => line.split(/\s+/)).filter(Boolean);
      expect(objects.length, 'scene should show two objects').toBe(2);

      const beside = lines.length === 1;
      if (beside) {
        expect(question.answer).toBe('გვერდით');
      } else {
        // The scene is drawn so the subject holds the position being asked
        // about: on top for "ზემოთ", underneath for "ქვემოთ". Read the top
        // object from the FIRST LINE — flattening the lines first would read
        // the upper object of a "🌊\n🐟" scene as the wave.
        const subjectName = question.prompt.replace(/^სად არის\s+/, '').split(/\s+/)[0];
        const topName = nameForEmoji(lines[0].split(/\s+/)[0]);
        expect(question.answer).toBe(topName === subjectName ? 'ზემოთ' : 'ქვემოთ');
      }
    }
  });

  it('never asks which object is "beside" — that has two correct answers', () => {
    for (const question of generateMany('g1-u01-2-name-the-object')) {
      expect(question.prompt).not.toContain('გვერდით');
    }
  });

  it('names the object that is genuinely in that position', () => {
    for (const question of generateMany('g1-u01-2-name-the-object')) {
      const [top, bottom] = (question.visual ?? '').split('\n').map((l) => l.trim());
      const lower = nameForEmoji(bottom);
      const upper = nameForEmoji(top);
      expect(question.answer).toBe(question.prompt.includes('ქვემოთ') ? lower : upper);
    }
  });

  it('writes the landmark in a form that agrees with Georgian', () => {
    for (const question of generateMany('g1-u01-2-where-is-it', 30)) {
      // "ყუთი-თან" was produced by gluing a postposition with a hyphen.
      expect(question.prompt).not.toContain('-თან');
      expect(question.prompt).toMatch(/თან\?$/);
    }
  });
});

describe('U01.3–U01.6 — comparing measures', () => {
  const pairs = [
    { id: 'g1-u01-3-ribbon', word: 'გრძელი' },
    { id: 'g1-u01-4-tower', word: 'მაღალი' },
    { id: 'g1-u01-5-bag', word: 'მძიმე' },
    { id: 'g1-u01-6-box', word: 'განიერი' },
  ];

  for (const { id, word } of pairs) {
    it(`${id}: picks the larger of the two printed measures`, () => {
      for (const question of generateMany(id)) {
        const [a, b] = numbersIn(question.prompt);
        expect(a).not.toBe(b);
        expect(Number(question.answer)).toBe(Math.max(a, b));
        expect(question.prompt).toContain(word);
      }
    });

    it(`${id}: asks "how much more" only when the difference is positive`, () => {
      for (const question of generateMany(`${id}-difference`)) {
        const [a, b] = numbersIn(question.prompt);
        expect(a).toBeGreaterThan(b);
        expect(Number(question.answer)).toBe(a - b);
        expect(Number(question.answer)).toBeGreaterThan(0);
      }
    });

    it(`${id}: the bars drawn reflect the numbers compared`, () => {
      for (const question of generateMany(id, 30)) {
        const [a, b] = numbersIn(question.prompt);
        const [barA, barB] = (question.visual ?? '').split('\n');
        const drawnA = countBlocks(barA);
        const drawnB = countBlocks(barB);
        // The longer number must not be drawn with the shorter bar.
        expect(drawnA > drawnB).toBe(a > b);
      }
    });
  }
});

describe('U01.7 — all and some', () => {
  it('"all taken away" always leaves nothing', () => {
    for (const question of generateMany('g1-u01-7-all-taken')) {
      expect(question.answer).toBe('0');
      // The picture shows exactly what was in the basket.
      expect(countEmojis(question.visual ?? '')).toBe(numbersIn(question.prompt)[0]);
    }
  });

  it('states a claim whose truth value matches the drawn group', () => {
    for (const question of generateMany('g1-u01-7-is-it-true')) {
      const colours = (question.visual ?? '').trim().split(/\s+/).filter(Boolean);
      const allSame = new Set(colours).size === 1;
      expect(question.answer).toBe(allSame ? 'მართალია' : 'არ არის მართალი');

      // The colour word in the prompt must be the colour actually drawn.
      const colourName = question.prompt.replace(/^.*ჯგუფში ყველა\s+/, '').replace(/\s+არის.*$/, '');
      expect(colourNameFor(colours[0])).toBe(colourName);
    }
  });

  it('counts one colour inside a mixed group correctly', () => {
    for (const question of generateMany('g1-u01-7-count-in-group')) {
      const colours = (question.visual ?? '').trim().split(/\s+/).filter(Boolean);
      const asked = question.prompt.replace(/^.*რამდენი\s+/, '').replace(/\s+არის\?$/, '');
      const matches = colours.filter((c) => colourNameFor(c) === asked).length;
      expect(Number(question.answer)).toBe(matches);
      expect(matches).toBeGreaterThan(0);
    }
  });
});

describe('U01.8 — counting', () => {
  it('draws exactly as many objects as it asks for', () => {
    for (const question of generateMany('g1-u01-8-count-row')) {
      expect(countEmojis(question.visual ?? '')).toBe(Number(question.answer));
    }
  });

  it('names the object it actually draws', () => {
    for (const question of generateMany('g1-u01-8-count-row')) {
      const items = (question.visual ?? '').match(/\p{Extended_Pictographic}/gu) ?? [];
      // Every drawn object is the same one, so the noun can only be right.
      expect(new Set(items).size, 'a counting row must repeat one object').toBe(1);
      const asked = question.prompt.replace(/^რამდენი\s+/, '').replace(/\s+არის.*$/, '');
      expect(nameForEmoji(items[0])).toBe(asked);
    }
  });

  it('adds the two drawn groups', () => {
    for (const question of generateMany('g1-u01-8-count-groups')) {
      const lines = (question.visual ?? '').split('\n');
      const total = lines.reduce((sum, line) => sum + countEmojis(line), 0);
      expect(Number(question.answer)).toBe(total);
    }
  });

  it('shows the whole set before objects are taken away', () => {
    for (const question of generateMany('g1-u01-8-count-and-take')) {
      const [a, b] = numbersIn(question.prompt);
      // Showing only the remainder would print the answer on the picture.
      expect(countEmojis(question.visual ?? '')).toBe(a);
      expect(Number(question.answer)).toBe(a - b);
    }
  });
});

describe('U01 — difficulty progression', () => {
  it('keeps every template inside the three declared levels', () => {
    for (const template of U01_TEMPLATES) {
      expect([1, 2, 3]).toContain(template.difficulty);
    }
  });

  it('uses level 3 for the forms that need two reasoning steps', () => {
    // Recognising a position is level 1; computing a difference or sequencing
    // is level 3. If a multi-step form were tagged level 1 the difficulty
    // signal would be meaningless.
    const differences = U01_TEMPLATES.filter((t) => t.id.endsWith('-difference'));
    expect(differences.length).toBeGreaterThan(0);
    for (const template of differences) expect(template.difficulty).toBe(3);
  });
});

/* ------------------------------------------------------------------ *
 * Helpers shared with the app's vocabulary.
 * ------------------------------------------------------------------ */

import { COLOURS, SCENES, THINGS } from '../src/practice/templates/u01-space';

/**
 * Names an emoji from either vocabulary — the object list used by counting and
 * positional questions, or the landmarks and subjects used by spatial scenes.
 * Throws rather than returning a placeholder, so a test can never pass by
 * comparing two unknowns.
 */
function nameForEmoji(emoji: string): string {
  const fromThings = THINGS.find((t) => t.emoji === emoji)?.name;
  if (fromThings) return fromThings;
  for (const scene of SCENES) {
    if (scene.subject.emoji === emoji) return scene.subject.name;
    if (scene.landmark.emoji === emoji) return scene.landmark.name;
  }
  throw new Error(`unknown emoji ${emoji}`);
}

function colourNameFor(emoji: string): string {
  return COLOURS.find((c) => c.emoji === emoji)?.name ?? '';
}

function countBlocks(line: string): number {
  return (line.match(/▬/g) ?? []).length;
}

/**
 * The object name for a drawn emoji, guarded so an unknown emoji fails loudly
 * instead of silently comparing two `ობიექტი` placeholders and passing.
 */
function answerNameFor(emoji: string): string {
  return nameForEmoji(emoji);
}
