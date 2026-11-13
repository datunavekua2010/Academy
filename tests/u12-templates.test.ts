import { describe, expect, it } from 'vitest';
import { U12_SUBTOPICS, U12_TEMPLATES } from '../src/practice/templates/u12-geometry';
import {
  CLOSED_LINES,
  FLAT,
  LINES,
  OPEN_LINES,
  SHAPES,
  SOLID,
  STUFF_ALL,
  mirrorVertical,
} from '../src/practice/templates/geometry';
import { generateFromTemplate, generateVariations } from '../src/practice/templates/generate';
import { generateBatch, generateQuestion } from '../src/practice/generator';
import { shownKey } from '../src/practice/identity';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import type { GeneratedQuestion } from '../src/practice/templates/generate';

/**
 * U12 — გეომეტრია.
 *
 * The promise a geometry question makes is that the picture and the answer are
 * the same object seen twice. So wherever a test can, it reads the **rendered
 * picture** back into data and re-derives the answer from that — it does not
 * trust `vars`, which is where a bug between drawing and answering would hide.
 *
 * The specific failures this suite exists for:
 *
 *  - a shape drawn under a question whose answer names a different shape, or a
 *    side count that disagrees with the figure on the page (rule 2);
 *  - a symmetry question whose two halves do not mirror each other cell by cell
 *    (rule 5) — the first draft of this unit reflected a four-wide figure across
 *    a `width/2` axis, which put every mirrored cell outside the grid and left
 *    the answer empty;
 *  - an option list that collapses to two or three choices when the drawn pool
 *    is degenerate, making a hard question easy (rule 3);
 *  - an identification question whose options print the very name it asks for,
 *    so the answer can be read without looking at the picture;
 *  - the specification's own trap: „which shape can roll?“ has more than one
 *    honest answer, and „four sides and four right angles“ fits two figures.
 */

const SAMPLES = 24;
const SEED = 20261120;

const ref = (subtopicId: string) => ({ grade: 1 as const, topicId: 'geometria', subtopicId });

const templateFor = (id: string) => {
  const template = U12_TEMPLATES.find((candidate) => candidate.id === id);
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

/** Every question from every template, once. */
function* everyQuestion(count = 8): Generator<GeneratedQuestion> {
  for (const template of U12_TEMPLATES) {
    for (const question of generateMany(template.id, count)) yield question;
  }
}

/**
 * Every glyph the unit can draw.
 *
 * Read from the data rather than guessed from Unicode ranges: an earlier
 * attempt used a pictograph range and silently skipped `⊐`, a *logical* operator
 * that is not pictographic and not in the geometric-shapes block, so a counting
 * test saw one fewer open line than the page held.
 */
const KNOWN_GLYPHS = new Set<string>([...FLAT.map((item) => item.glyph), ...SOLID.map((item) => item.glyph), ...LINES.map((line) => line.glyph)]);

/** The glyphs in a rendered row, in order. Words and spaces are dropped. */
const glyphs = (text: string): string[] => [...text].filter((char) => KNOWN_GLYPHS.has(char));

/** The shapes drawn in a row, by glyph — the picture read back as data. */
const shapesIn = (text: string): string[] =>
  glyphs(text).map((glyph) => {
    const found = FLAT.find((item) => item.glyph === glyph);
    if (!found) throw new Error(`unknown flat glyph ${glyph} in ${JSON.stringify(text)}`);
    return found.key;
  });

/** The solids drawn in a row, by glyph. */
const solidsIn = (text: string): string[] =>
  glyphs(text).map((glyph) => {
    const found = SOLID.find((item) => item.glyph === glyph);
    if (!found) throw new Error(`unknown solid glyph ${glyph}`);
    return found.key;
  });

/** Reads a `■`/`·` grid back into `"col,row"` cells. */
const cellsOf = (picture: string): string[] => {
  const out: string[] = [];
  picture.split('\n').forEach((line, row) => {
    [...line].forEach((mark, col) => {
      if (mark === '■') out.push(`${col},${row}`);
    });
  });
  return out;
};

/** The width of a drawn grid, measured from the picture itself. */
const widthOf = (picture: string): number => picture.split('\n')[0]!.length;

/** Is this drawn picture symmetric about its middle vertical line? */
const isSymmetric = (picture: string): boolean => {
  const cells = cellsOf(picture);
  const width = widthOf(picture);
  const set = new Set(cells);
  return cells.every((name) => {
    const [col, row] = name.split(',').map(Number) as [number, number];
    return set.has(`${width - 1 - col},${row}`);
  });
};

/** The lettered candidates inside a question's picture, letter → grid. */
const decodeLetters = (picture: string): Map<string, string> => {
  const out = new Map<string, string>();
  const chunks = picture.split('\n\n');
  expect(chunks.length, `expected four lettered pictures in ${JSON.stringify(picture)}`).toBe(4);
  for (const chunk of chunks) {
    const [head, ...rest] = chunk.split('\n');
    out.set(head!.trim(), rest.join('\n'));
  }
  return out;
};

/** Is this drawn picture symmetric about its middle horizontal line? */
const isSymmetricH = (picture: string): boolean => {
  const rows = picture.split('\n');
  const height = rows.length;
  const cells = new Set(cellsOf(picture));
  return cellsOf(picture).every((name) => {
    const [col, row] = name.split(',').map(Number) as [number, number];
    return cells.has(`${col},${height - 1 - row}`);
  });
};

/** Counts of each token in a list, for „same set of members“ comparisons. */
const tally = (its: string[]): string => [...its].sort((a, b) => a.localeCompare(b)).join('|');

describe('U12 template library', () => {
  it('has exactly fifty templates with unique ids', () => {
    expect(U12_TEMPLATES).toHaveLength(50);
    expect(new Set(U12_TEMPLATES.map((template) => template.id)).size).toBe(50);
    expect(new Set(U12_TEMPLATES.map((template) => template.id)).size).toBe(U12_TEMPLATES.length);
  });

  it('splits the fifty across the nine subtopics as the specification numbers them', () => {
    // The ranges Q1–Q8, Q9–Q15, … Q47–Q50 fix each subtopic's count.
    expect(U12_TEMPLATES.filter((t) => t.subtopicId === 'brtyeli-formebi')).toHaveLength(8);
    expect(U12_TEMPLATES.filter((t) => t.subtopicId === 'moculobiti-formebi')).toHaveLength(7);
    expect(U12_TEMPLATES.filter((t) => t.subtopicId === 'gverdebi-kutxebi')).toHaveLength(6);
    expect(U12_TEMPLATES.filter((t) => t.subtopicId === 'gverdebis-datvla')).toHaveLength(6);
    expect(U12_TEMPLATES.filter((t) => t.subtopicId === 'gaRia-daxuruli')).toHaveLength(5);
    expect(U12_TEMPLATES.filter((t) => t.subtopicId === 'msgavsi-formebi')).toHaveLength(5);
    expect(U12_TEMPLATES.filter((t) => t.subtopicId === 'formebi-cxovrebaSi')).toHaveLength(5);
    expect(U12_TEMPLATES.filter((t) => t.subtopicId === 'formebiT-agwera')).toHaveLength(4);
    expect(U12_TEMPLATES.filter((t) => t.subtopicId === 'simetria')).toHaveLength(4);
  });

  it('covers every subtopic at every level', () => {
    for (const subtopic of U12_SUBTOPICS) {
      const templates = U12_TEMPLATES.filter((t) => t.subtopicId === subtopic);
      expect(templates.length, `${subtopic}`).toBeGreaterThanOrEqual(4);
      expect([...new Set(templates.map((t) => t.difficulty))].sort((a, b) => Number(a) - Number(b)), `${subtopic} is missing a level`).toEqual([1, 2, 3]);
    }
  });

  it('is wired into the catalog for every subtopic', () => {
    for (const subtopic of U12_SUBTOPICS) {
      const registered = TEMPLATE_REGISTRY.forSubtopic(ref(subtopic));
      expect(registered.length, `nothing playable for ${subtopic}`).toBeGreaterThan(0);
      expect(registered.filter((t) => t.id === `g1-${subtopic}`), `placeholder still registered for ${subtopic}`).toEqual([]);
    }
  });

  // Symmetry draws and re-reads grids, so 4 320 generated questions take longer
  // than the default 5 s; the assertion is about variety, not speed.
  it('can fill a perfect run at every level', () => {
    for (const subtopic of U12_SUBTOPICS) {
      for (const level of [1, 2, 3] as const) {
        const keys = new Set(generateBatch(ref(subtopic), 160, { level, seed: SEED }).map(shownKey));
        // The floor is what the templates at that level can vary into, not a
        // per-subtopic total: `gverdebis-datvla` level 1 holds two templates that
        // each ask one counting question about one figure, which is eight
        // wordings — a real limit of the question, not of the generator.
        expect(keys.size, `${subtopic} level ${level}: only ${keys.size} distinct`).toBeGreaterThanOrEqual(8);
      }
    }
  }, 60_000);

  it('generates a question through the registry for every subtopic', () => {
    for (const subtopic of U12_SUBTOPICS) {
      expect(generateQuestion(ref(subtopic), 99), `${subtopic} generated nothing`).toBeTruthy();
    }
  });

  it('stays inside the grade-1 range: nothing negative, nothing above forty', () => {
    for (const template of U12_TEMPLATES.filter((t) => t.format?.kind === 'integer')) {
      expect(template.format?.max, `${template.id} allows answers above forty`).toBeLessThanOrEqual(40);
      expect(template.format?.min ?? 0, `${template.id} allows negative answers`).toBeGreaterThanOrEqual(0);
    }
  });

  it('offers no duplicate options, no blank ones, and at least three', () => {
    for (const template of U12_TEMPLATES) {
      for (const question of generateMany(template.id)) {
        const options = (question.options ?? []).map(String);
        if (options.length === 0) continue;
        expect(options.length, `${template.id} offered only ${options.length} options`).toBeGreaterThanOrEqual(2);
        expect(new Set(options).size, `${template.id}: ${options.join(' / ')}`).toBe(options.length);
        for (const option of options) {
          expect(option.trim(), `${template.id} offered a blank option`).not.toBe('');
          expect(option, `${template.id} leaked a placeholder`).not.toMatch(/null|undefined|\{\w+\}/);
        }
      }
    }
  });

  it('offers four options on every question that is a genuine choice', () => {
    // Two-option questions (true/false, „A or B“) declare `optionCount: 2`; every
    // other choice question must offer a full set, because a list that collapses
    // to three is a question that got easier by accident.
    for (const template of U12_TEMPLATES.filter((t) => t.format?.kind === 'text' && t.optionCount !== 2)) {
      for (const question of generateMany(template.id)) {
        expect((question.options ?? []).length, `${template.id} collapsed to ${(question.options ?? []).length}: ${question.prompt}`).toBe(4);
      }
    }
  });

  it('never offers a wrong option that is also the answer', () => {
    for (const template of U12_TEMPLATES) {
      for (const question of generateMany(template.id)) {
        const options = (question.options ?? []).map(String);
        if (options.length === 0) continue;
        expect(options.filter((option) => option === String(question.answer)), `${template.id}: ${question.prompt}`).toHaveLength(1);
      }
    }
  });

  it('rebuilds the same question from the same seed', () => {
    for (const template of U12_TEMPLATES) {
      const first = generateFromTemplate(template, { seed: 4242 });
      const second = generateFromTemplate(template, { seed: 4242 });
      expect(second.prompt).toBe(first.prompt);
      expect(second.answer).toBe(first.answer);
      expect(second.options).toEqual(first.options);
      expect(second.visual).toBe(first.visual);
    }
  });

  it('prints no hyphenated Georgian case ending', () => {
    // „მართკუთხედი-ს“ is what a suffix pasted onto a nominative looks like. Every
    // prompt takes the dative form of the noun instead.
    for (const question of everyQuestion()) {
      expect(question.prompt, `${question.prompt}`).not.toMatch(/[ა-ჰ]-ს/);
      expect(question.explanation ?? '', `${question.explanation}`).not.toMatch(/[ა-ჰ]-ს/);
      for (const option of question.options ?? []) {
        expect(String(option), `${String(option)}`).not.toMatch(/[ა-ჰ]-ს/);
      }
    }
  });
});

describe('U12 the picture and the answer agree', () => {
  it('draws the shape its side-count question is about', () => {
    // Rule 2. Re-derive the count from the drawn glyph, never from `vars`.
    for (const template of U12_TEMPLATES.filter((t) => /გვერდი აქვს ამ ფიგურას|კუთხე აქვს ამ ფიგურას/.test(t.prompt))) {
      for (const question of generateMany(template.id)) {
        const drawn = shapesIn(question.visual ?? '');
        expect(drawn, `${template.id} drew ${drawn.length} shapes`).toHaveLength(1);
        const shape = SHAPES[drawn[0]!]!;
        const expected = template.prompt.includes('გვერდი') ? shape.sides : shape.corners;
        expect(question.answer, `${template.id}: ${question.visual}`).toBe(String(expected));
      }
    }
  });

  it('asks for a shape that is actually on the page', () => {
    for (const template of U12_TEMPLATES.filter((t) => /ნახატზე რომელი ფიგურაა/.test(t.prompt))) {
      for (const question of generateMany(template.id)) {
        const drawn = shapesIn(question.visual ?? '');
        const named = FLAT.find((item) => question.prompt.includes(item.name));
        expect(named, `${template.id}: prompt names no known shape — ${question.prompt}`).toBeTruthy();
        expect(drawn, `${template.id}: ${named!.name} is not drawn in ${question.visual}`).toContain(named!.key);
        expect(String(question.answer), `${template.id} answered with a glyph that is not drawn`).toBe(named!.glyph);
        expect(
          [...(question.options ?? []).map(String)].sort(),
          `${template.id} offered a glyph that is not drawn`,
        ).toEqual([...drawn.map((key) => SHAPES[key]!.glyph)].sort());
      }
    }
  });

  it('counts the corners the drawn row really holds', () => {
    for (const template of U12_TEMPLATES.filter((t) => /რამდენი კუთხეა სულ/.test(t.prompt))) {
      for (const question of generateMany(template.id)) {
        const total = shapesIn(question.visual ?? '').reduce((sum, key) => sum + SHAPES[key]!.corners, 0);
        expect(question.answer, `${template.id}: ${question.visual}`).toBe(String(total));
      }
    }
  });

  it('counts the sides the drawn row really holds', () => {
    for (const template of U12_TEMPLATES.filter((t) => /რამდენი გვერდია სულ/.test(t.prompt))) {
      for (const question of generateMany(template.id)) {
        const total = shapesIn(question.visual ?? '').reduce((sum, key) => sum + SHAPES[key]!.sides, 0);
        expect(question.answer, `${template.id}: ${question.visual}`).toBe(String(total));
      }
    }
  });

  it('counts the triangles the drawn row really holds', () => {
    for (const template of U12_TEMPLATES.filter((t) => t.id === 'g1-u12-1-count-triangles')) {
      for (const question of generateMany(template.id)) {
        const triangles = shapesIn(question.visual ?? '').filter((key) => key === 'triangle').length;
        expect(question.answer, `${template.id}: ${question.visual}`).toBe(String(triangles));
      }
    }
  });

  it('counts the open lines the drawn row really holds', () => {
    const OPEN = OPEN_LINES.map((line) => line.glyph);
    for (const template of U12_TEMPLATES.filter((t) => t.id === 'g1-u12-5-count-open')) {
      for (const question of generateMany(template.id)) {
        const open = glyphs(question.visual ?? '').filter((glyph) => OPEN.includes(glyph)).length;
        expect(question.answer, `${template.id}: ${question.visual}`).toBe(String(open));
      }
    }
  });

  it('shows a closed picture exactly when the sentence says the ends meet', () => {
    for (const template of U12_TEMPLATES.filter((t) => t.id === 'g1-u12-5-ends-meet')) {
      for (const question of generateMany(template.id)) {
        const drawn = glyphs(question.visual ?? '');
        expect(drawn, `${template.id} drew ${drawn.length} glyphs`).toHaveLength(1);
        const closed = CLOSED_LINES.some((line) => line.glyph === drawn[0]);
        const saysClosed = question.prompt.includes('უერთდება.') && !question.prompt.includes('არ უერთდება');
        expect(closed, `${template.id}: „${question.prompt}“ beside ${question.visual}`).toBe(saysClosed);
        expect(String(question.answer), `${template.id}: ${question.visual}`).toBe(closed ? 'დახურული' : 'ღია');
      }
    }
  });

  it('marks the symmetric picture only when its cells mirror, cell for cell', () => {
    // Rule 5. Every symmetry verdict is recomputed from the *rendered* picture.
    for (const template of U12_TEMPLATES.filter((t) => t.subtopicId === 'simetria')) {
      for (const question of generateMany(template.id)) {
        if (template.id === 'g1-u12-9-is-axis') {
          const shown = isSymmetric(question.visual ?? '');
          expect(String(question.answer), `${template.id}: ${JSON.stringify(question.visual)}`).toBe(shown ? 'ჭეშმარიტი' : 'მცდარი');
          continue;
        }
        if (template.id === 'g1-u12-9-which-symmetric' || template.id === 'g1-u12-9-horizontal') {
          const axis = template.id === 'g1-u12-9-which-symmetric' ? isSymmetric : isSymmetricH;
          const letters = decodeLetters(question.visual ?? '');
          expect(letters.size, `${template.id}: expected four lettered pictures`).toBe(4);
          for (const [letter, picture] of letters) {
            expect(axis(picture), `${template.id}: „${letter}“ is marked ${String(question.answer)}`).toBe(letter === String(question.answer));
          }
        }
      }
    }
  });

  it('keeps the one symmetric picture apart from three that are one cell off', () => {
    for (const template of U12_TEMPLATES.filter((t) => t.id === 'g1-u12-9-which-symmetric' || t.id === 'g1-u12-9-horizontal')) {
      for (const question of generateMany(template.id)) {
        const axis = template.id === 'g1-u12-9-which-symmetric' ? isSymmetric : isSymmetricH;
        const letters = decodeLetters(question.visual ?? '');
        const good = [...letters].filter(([, picture]) => axis(picture));
        expect(good.length, `${template.id}: ${good.length} symmetric pictures in ${question.visual}`).toBe(1);
        const [right, ...wrong] = [...letters].filter(([, picture]) => !axis(picture));
        expect(right).toBeTruthy();
        for (const [, picture] of wrong) {
          // „One cell off“ — the same picture with a single cell gone.
          const far = Math.abs(cellsOf(picture).length - cellsOf([...letters.values()][0]!).length);
          expect(far, `${template.id}: a wrong picture is not one cell from the right one`).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('answers „complete the half“ with the mirror of the left half', () => {
    const toBlock = (cells: string[]) => cells.join('|');
    for (const template of U12_TEMPLATES.filter((t) => t.id === 'g1-u12-9-complete-half')) {
      for (const question of generateMany(template.id)) {
        const half = cellsOf(question.visual ?? '');
        // The left half is the left two columns; the right block is that half
        // folded across its own two-column width.
        const expected = toBlock(mirrorVertical(half.filter((name) => Number(name.split(',')[0]) < 2), 2));
        const blocks = (question.options ?? []).map((option) => toBlock(cellsOf(String(option).split(' / ').join('\n'))));
        expect(blocks, `${template.id}: the true half is not among the options`).toContain(expected);
        expect(String(question.answer), `${template.id}: the answer is not the true half`).toBe(
          (question.options ?? [])[blocks.indexOf(expected)] as string,
        );
      }
    }
  });
});

describe('U12 questions ask one thing and ask it honestly', () => {
  it('never prints, in an identification question, the name it asks the child to find', () => {
    // „Which of these is the square?“ whose options read „□ კვადრატი“ can be
    // answered without looking at the picture at all.
    for (const template of U12_TEMPLATES.filter((t) => /^(ნახატზე რომელი ფიგურაა|რომელია )/.test(t.prompt))) {
      for (const question of generateMany(template.id)) {
        for (const option of question.options ?? []) {
          const named = FLAT.find((shape) => question.prompt.includes(shape.name) && String(option).includes(shape.name));
          expect(named, `${template.id}: option „${option}“ hands over „${named?.name}“ from the prompt`).toBeUndefined();
          const solidNamed = SOLID.find((item) => question.prompt.includes(item.name) && String(option).includes(item.name));
          expect(solidNamed, `${template.id}: option „${option}“ hands over „${solidNamed?.name}“`).toBeUndefined();
        }
      }
    }
  });

  it('offers a set question options that are sets — each a different full answer', () => {
    for (const template of U12_TEMPLATES.filter((t) => /აირჩიე სრული (სია|პასუხი)/.test(t.prompt))) {
      for (const question of generateMany(template.id)) {
        const options = (question.options ?? []).map(String);
        expect(options.length, `${template.id} collapsed to ${options.length}`).toBe(4);
        const members = options.map((option) => tally(option.split(', ')));
        // Every option must name a different set, not the same set reordered.
        expect(new Set(members).size, `${template.id}: two options are the same set`).toBe(options.length);
      }
    }
  });

  it('never asks which shape rolls, which has more than one honest answer', () => {
    for (const template of U12_TEMPLATES) {
      for (const question of generateMany(template.id, 4)) {
        if (/რომელი[^.]*გორდება/.test(question.prompt)) {
          // Only allowed when the condition is pinned to „only rolls“.
          expect(question.prompt, `${template.id}: „${question.prompt}“ has several answers`).toMatch(/მხოლოდ გორვით|დგებიან/);
        }
      }
    }
  });

  it('accepts both four-sided figures for the specification’s ambiguous description', () => {
    const question = generateFromTemplate(templateFor('g1-u12-8-description'), { seed: 7 });
    expect(String(question.answer)).toBe('კვადრატი, მართკუთხედი');
    expect(question.options?.map(String)).toContain('კვადრატი, მართკუთხედი');
  });

  it('names the solid that does NOT roll with each of the properties it lacks', () => {
    // The cube stands and does not roll; the sphere rolls and does not stand.
    const cube = SOLID.find((item) => item.key === 'cube')!;
    const sphere = SOLID.find((item) => item.key === 'sphere')!;
    expect(cube.stands).toBe(true);
    expect(cube.rolls).toBe(false);
    expect(sphere.stands).toBe(false);
    expect(sphere.rolls).toBe(true);
  });

  it('answers the standing-and-rolling list with exactly the two solids that do both', () => {
    const expected = SOLID.filter((item) => item.stands && item.rolls).map((item) => item.name);
    expect(expected.sort()).toEqual(['ცილინდრი', 'კონუსი'].sort());
    for (const question of generateMany('g1-u12-2-stands-and-rolls')) {
      expect(String(question.answer)).toBe([...expected].sort((a, b) => a.localeCompare(b)).join(', '));
    }
  });

  it('uses an everyday object only for the shape it actually resembles', () => {
    const byKey = Object.fromEntries(STUFF_ALL.map((item) => [item.name, item]));
    for (const question of everyQuestion(4)) {
      for (const solid of SOLID) {
        if (!question.prompt.includes(solid.object)) continue;
        const object = byKey[solid.object]!;
        expect(object.like, `${solid.object} is mapped to ${object.like}, not ${solid.key}`).toBe(solid.key);
      }
    }
  });

  it('keeps the „only rolls“ answer the sphere, never a shape that also stands', () => {
    for (const question of generateMany('g1-u12-2-rolls-only')) {
      expect(String(question.answer)).toBe(SOLID.find((item) => item.key === 'sphere')!.glyph);
    }
  });

  it('keeps its options in the same order for the same seed but shuffles across seeds', () => {
    const template = templateFor('g1-u12-1-which-shape');
    const first = new Set<string>();
    for (let seed = 1; seed <= 12; seed += 1) {
      const question = generateFromTemplate(template, { seed });
      first.add((question.options ?? []).map(String).join('|'));
    }
    expect(first.size, 'the correct option is always in the same place').toBeGreaterThan(1);
  });
});
