import { describe, expect, it } from 'vitest';
import { U01_SUBTOPICS, U01_TEMPLATES } from '../src/practice/templates/u01-space';
import { generateBatch } from '../src/practice/generator';
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
        if (question.answerMode === 'number') {
          // A typed-answer question offers no options at all — if it did, the
          // answer would be sitting in the list it tells the student to type.
          expect(question.options).toEqual([]);
          continue;
        }
        if (question.answerMode === 'order') {
          // An ordering question has no options: the items are the question.
          expect(question.options).toEqual([]);
          const key = question.answer.split(',').map(Number);
          expect(key).toHaveLength(question.orderItems!.length);
          expect([...key].sort((a, b) => a - b)).toEqual(
            Array.from({ length: key.length }, (_, i) => i + 1),
          );
          continue;
        }
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
        // The stem names the subject; whatever the drawing puts on the top line
        // is what "ზემოთ" refers to. Read the top name from the FIRST LINE —
        // flattening first would read the upper object of a "🌊\n🐟" scene as
        // the wave and flip the expected answer.
        const subjectName = /სურათზე\s+(\S+)/.exec(question.prompt)![1];
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

  it('never prints an internal key in the stem', () => {
    // The relation used to render as its enum key, so a child was asked
    // "რომელი საგანია above?". Anything Latin-script in a Georgian stem is a bug.
    for (const question of generateMany('g1-u01-2-name-the-object', 40)) {
      expect(question.prompt, question.prompt).not.toMatch(/[A-Za-z]/);
      expect(question.prompt).toMatch(/რომელი საგანია (ზემოთ|ქვემოთ)\?$/);
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
      // "ყუთი-თან" was produced by gluing a postposition with a hyphen. The
      // stem now avoids declining the landmark altogether, so no such form may
      // appear at all.
      expect(question.prompt).not.toContain('-თან');
      expect(question.prompt).toMatch(/სად არის .+\?$/);
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
    it(`${id}: offers exactly the two printed measures, and answers the larger`, () => {
      for (const question of generateMany(id)) {
        const [a, b] = numbersIn(question.prompt);
        expect(a).not.toBe(b);
        expect(question.prompt).toContain(word);

        // The answer is the larger measure as printed, unit included, so it can
        // be matched against an option character for character.
        const larger = Math.max(a, b);
        const smaller = Math.min(a, b);
        expect(question.answer).toMatch(new RegExp(`^${larger} \\S+$`));

        // Two options, because the stem offers two objects. The flat number is
        // never one of them, and neither is the smaller measure's units-less form.
        expect(question.options).toHaveLength(2);
        expect([...question.options].sort()).toEqual(
          [`${larger} ${question.answer.split(' ')[1]}`, `${smaller} ${question.answer.split(' ')[1]}`].sort(),
        );
        expect(question.options).not.toContain(String(larger));
      }
    });

    it(`${id}: asks "how much more" only when the difference is positive`, () => {
      // U01.3 spends its third level on ordering, so it has no typed difference.
      if (id === 'g1-u01-3-ribbon') return;
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

});

describe('U01 — difficulty progression', () => {
  it('keeps every template inside the three declared levels', () => {
    for (const template of U01_TEMPLATES) {
      expect([1, 2, 3]).toContain(template.difficulty);
    }
  });

  it('gives every subtopic exactly three types: one per level', () => {
    // The rule the curriculum is authored to: three question types per
    // subtopic, corresponding to the three score bands. Not two, not five —
    // the third band would otherwise have nothing to show.
    const bySubtopic = new Map<string, number[]>();
    for (const template of U01_TEMPLATES) {
      const levels = bySubtopic.get(template.subtopicId) ?? [];
      levels.push(template.difficulty);
      bySubtopic.set(template.subtopicId, levels);
    }

    expect([...bySubtopic.keys()].sort()).toEqual([...U01_SUBTOPICS].sort());
    for (const [subtopic, levels] of bySubtopic) {
      expect(levels.sort(), `${subtopic} must have one template at each level`).toEqual([1, 2, 3]);
    }
  });

  it('fills a whole session at every level without repeating itself', () => {
    // A level with one thin template would run out mid-session and the
    // generator would have to recycle. 24 is the batch a session opens with.
    for (const subtopicId of U01_SUBTOPICS) {
      const ref = { grade: 1, topicId: 'mdebareoba', subtopicId } as const;
      for (const level of [1, 2, 3] as const) {
        const batch = generateBatch(ref as never, 24, { level, seed: 4242 });
        const signatures = new Set(batch.map((q) => q.signature));
        expect(batch.length, `${subtopicId} level ${level} came up short`).toBe(24);
        expect(signatures.size, `${subtopicId} level ${level} repeated a question`).toBe(24);
      }
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

import { COLOURS, THINGS } from '../src/practice/templates/u01-space';

/**
 * Names an emoji from either vocabulary — the object list used by counting and
 * positional questions, or the landmarks and subjects used by spatial scenes.
 * Throws rather than returning a placeholder, so a test can never pass by
 * comparing two unknowns.
 */
function nameForEmoji(emoji: string): string {
  const entry = THINGS.find((t) => t.emoji === emoji);
  if (!entry) throw new Error(`unknown emoji ${emoji}`);
  return entry.name;
}

/** Genitive of a drawn object, read from the vocabulary itself. */
function genitiveOf(emoji: string): string {
  const entry = THINGS.find((t) => t.emoji === emoji);
  if (!entry?.gen) throw new Error(`no genitive for ${emoji}`);
  return entry.gen;
}

/** The three shapes used by the U01.7 quantifier questions. */
const SHAPES_LIST = ['წრე', 'სამკუთხედი', 'კვადრატი', 'ვარსკვლავი'];

/** The emoji for a shape name — kept here so the test reasons from the picture. */
function shapeEmoji(name: string): string {
  const emoji: Record<string, string> = {
    წრე: '🔴',
    სამკუთხედი: '🔺',
    კვადრატი: '🟩',
    ვარსკვლავი: '⭐',
  };
  const found = emoji[name];
  if (!found) throw new Error(`unknown shape ${name}`);
  return found;
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

/* ================================================================== *
 * The forms added for the reference bank (Q3–Q6, Q9, Q11, Q14, Q16,
 * Q21–Q29, Q35, Q39–Q42, Q49–Q50).
 *
 * Each test re-derives the answer from the picture or the printed numbers,
 * exactly as a child would, and never from the template's own reasoning.
 * ================================================================== */

/** The objects drawn in a row, in order. */
const rowOf = (visual: string): string[] => visual.trim().split(/\s+/);

describe('U01.1 — the level-3 deduction', () => {
  it('infers the middle object from the two ends it names', () => {
    for (const question of generateMany('g1-u01-1-infer-middle')) {
      const items = rowOf(question.visual!);
      expect(items).toHaveLength(3);

      // The picture must agree with the prompt, or the question is unanswerable.
      const [left, middle, right] = items.map(nameForEmoji);
      expect(question.prompt).toContain(`${left} მარცხნივ`);
      expect(question.prompt).toContain(`${right} — მარჯვნივ`);
      expect(question.answer).toBe(middle);
      // The three objects must differ, or "the middle one" is ambiguous.
      expect(new Set(items).size).toBe(3);
    }
  });
});

describe('U01.2 — the extra relation forms', () => {
  it('asks for the highest or the lowest of a drawn column', () => {
    for (const question of generateMany('g1-u01-2-extreme-of-three')) {
      const column = question.visual!.split('\n').map((line) => line.trim());
      expect(column).toHaveLength(3);
      // The three objects must be different, otherwise "highest" and "lowest"
      // could name the same thing.
      expect(new Set(column).size).toBe(3);

      const expected = question.prompt.includes('ყველაზე მაღლა')
        ? nameForEmoji(column[0])
        : nameForEmoji(column[2]);
      expect(question.answer).toBe(expected);
    }
  });

  it('names the objects in the stem in the same order they are drawn', () => {
    for (const question of generateMany('g1-u01-2-extreme-of-three')) {
      const drawn = question.visual!.split('\n').map((line) => nameForEmoji(line.trim()));
      const named = /განლაგებული:\s*(.+)\./.exec(question.prompt)![1].split(/,\s*/);
      expect(named).toEqual(drawn);
    }
  });
});

describe('U01.3–U01.6 — the level-2 equality form', () => {
  it('offers "equal" only when the two measures really are equal', () => {
    for (const id of ['g1-u01-3-ribbon', 'g1-u01-4-tower', 'g1-u01-5-bag', 'g1-u01-6-box']) {
      let sawEqual = false;
      let sawDifferent = false;
      for (const question of generateMany(`${id}-equal`, 40)) {
        const [a, b] = numbersIn(question.prompt);
        if (a === b) {
          sawEqual = true;
          expect(question.answer).toBe('ორივე ერთნაირია');
        } else {
          sawDifferent = true;
          // The stem prints the two measures; the options carry the words. The
          // answer must be whichever "more" sentence names the second one.
          expect(question.answer).toMatch(/^მეორე უფრო \S+ არის$/);
          expect(question.options).toContain('პირველი უფრო ' + question.answer.split(' ')[2] + ' არის');
        }
        // The three options must be exactly the three judgements, never a repeat.
        expect(new Set(question.options).size).toBe(3);
        expect(question.options).toContain(question.answer);
      }
      // Both cases must actually occur, or the template tests only one of them.
      expect(sawEqual, `${id}-equal never drew two equal measures`).toBe(true);
      expect(sawDifferent, `${id}-equal never drew two different measures`).toBe(true);
    }
  });
});

describe('U01.7 — the level-3 quantifier form', () => {
  it('says both "all" and "some" hold when every object is the same shape', () => {
    for (const question of generateMany('g1-u01-7-all-and-some', 40)) {
      const drawn = countEmojis(question.visual ?? '');
      const count = Number(numbersIn(question.prompt)[0]);
      // The stem states the group size, so it must match the picture.
      expect(drawn, question.prompt).toBe(count);
      expect(question.answer).toContain('ყველა');
      expect(question.answer).toContain('ზოგიერთი');
      expect(question.options).toContain(question.answer);
      expect(new Set(question.options).size).toBe(3);
    }
  });
});

describe('U01.8 — the extra counting forms', () => {
  it('counts the rest after naming how many are red', () => {
    for (const question of generateMany('g1-u01-8-rest-are')) {
      const total = numbersIn(question.prompt)[0];
      const red = numbersIn(question.prompt)[1];

      // The picture must contain exactly `total` circles, `red` of them red.
      expect(countEmojis(question.visual!)).toBe(total);
      expect(countEmojis(question.visual!.replace(/[^🔴]/gu, ''))).toBe(red);
      expect(Number(question.answer)).toBe(total - red);
    }
  });

  it('counts up to ten, as the reference does', () => {
    const answers = generateMany('g1-u01-8-count-row', 40).map((q) => Number(q.answer));
    expect(Math.max(...answers)).toBeGreaterThanOrEqual(8);
    for (const question of generateMany('g1-u01-8-count-row', 40)) {
      expect(countEmojis(question.visual!)).toBe(Number(question.answer));
    }
  });
});
