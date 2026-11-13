/**
 * U12 — გეომეტრია (grade 1).
 *
 * Fifty templates over the specification's nine subtopics: 8/7/6/6/5/5/5/4/4.
 *
 * The rule that shapes the whole file: **a question is computed from the same
 * data as its picture.** A shape is a `Shape` carrying its side and corner
 * counts, so „how many sides“ and its drawing read the same numbers; a symmetric
 * grid is built by calling `mirrorVertical`, so a symmetry answer is correct by
 * construction rather than by careful drawing.
 *
 * Three things the runner cannot do, and what became of them:
 *
 *  - **drag-and-drop → „which row pairs them all correctly“.** One option is the
 *    whole true pairing; every other option is that same pairing with exactly
 *    one pair broken, so the task is still to check the entire assignment.
 *  - **multi-select → „choose the complete list“.** One option names every member
 *    that fits; the others each miss one, add one, or swap one.
 *  - **half a grid, side by side →** a half is drawn four wide and its mirror is
 *    cut out as a two-wide block, because the runner renders one `visual` and no
 *    side-by-side layout. The half's own width is enough to work the mirror out.
 *
 * What keeps the recasts honest is that the wrong options are *nearly* right, so
 * a student has to check every member — which is what the original task
 * measured. Each template hands over its whole option list through `options`,
 * and the generator refuses any list where the answer is not present exactly
 * once, so a collapse to two or three options is a build error rather than a
 * quietly easier question.
 *
 * Two wording rules run through the file, both of them from experience:
 *
 *  - **An identification question never prints the name it is asking for.**
 *    „Which of these is the square?“ has glyph options; „what is this shape
 *    called?“ has the glyph as its picture and names as its options.
 *  - **No object question with more than one honest answer.** „Which shape can
 *    roll?“ is the specification's own warning: a sphere rolls, but so do a can
 *    and a cone. Rolling is therefore only ever asked of the shape that *only*
 *    rolls, and standing-and-rolling — where two shapes qualify — is a list
 *    question, so both are expected rather than one being wrong.
 */

import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';
import {
  CLOSED_NAMED,
  FLAT,
  OPEN_NAMED,
  SOLID,
  at,
  bare,
  copies,
  dative,
  drawn,
  flat,
  grid,
  gridInline,
  lineAt,
  lineRow,
  mirrorHorizontal,
  mirrorVertical,
  objectRow,
  shift,
  solid,
  solidBare,
  solidRow,
  stuff,
  withOneCellAdded,
  withOneCellRemoved,
} from './geometry';
import type { Cells, Shape } from './geometry';

const grade = 1 as const;
const topicId = 'geometria';
const unitId = 'geometria';

/** The curriculum address every template in this unit shares. */
const address = (spec: { id: string; subtopicId: string; difficulty: 1 | 2 | 3 }) => ({
  id: spec.id,
  grade,
  topicId,
  unitId,
  subtopicId: spec.subtopicId,
  difficulty: spec.difficulty,
});

/* ================================================================== *\
 * Shared option builders
 * ================================================================== */

/**
 * A set question's option text: the shapes named in a fixed order.
 *
 * The order is by side count and then by name, and it is fixed so the same set
 * always reads the same way. Two options differing only in order would look like
 * two different answers to a child while being the same answer.
 */
const setText = (its: Shape[]): string =>
  [...its]
    .sort((a, b) => a.sides - b.sides || a.name.localeCompare(b.name))
    .map((item) => item.name)
    .join(', ');

/** The same for plain names. */
const listText = (its: string[]): string => [...its].sort((a, b) => a.localeCompare(b)).join(', ');

/** Georgian numerals for the counts that can appear in a picture. */
const numeral = (count: number): string => ['ნული', 'ერთი', 'ორი', 'სამი', 'ოთხი', 'ხუთი', 'ექვსი'][count] ?? String(count);

/**
 * A „which list is complete“ question.
 *
 * `right` is the full set. Each wrong set is a mistake a child makes: a member
 * left out, a member added that does not fit, or one exchanged for a neighbour.
 * Duplicates and any wrong set that happens to equal the right one are dropped.
 */
const setOptions = (right: Shape[], wrongs: Shape[][]): string[] => {
  const answer = setText(right);
  const seen = new Set<string>([answer]);
  const out = [answer];
  for (const wrong of wrongs) {
    if (wrong.length === 0) continue;
    const text = setText(wrong);
    if (seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  return out;
};

/**
 * A whole matching, as one line: each shape followed by the name it is paired
 * with.
 *
 * `slip` rotates the names one place along. Every option is therefore a
 * permutation — each name appears exactly once, so no option reads as
 * „□ წრე · ○ წრე“ — and only the unrotated row gives every shape its own name.
 */
const pairing = (its: Shape[], slip = 0): string =>
  its.map((item, index) => `${bare(item)} ${its[(index + slip) % its.length]!.name}`).join(' · ');

/**
 * The wrong matchings for a pool, built so that no option is the true one in
 * another order.
 *
 * Rotating the names along the list would do, except that a pool drawn in
 * geometric order — square, rectangle, pentagon, hexagon — is *nearly* fixed by
 * „next name along“: the square would get the rectangle's name, which happens to
 * be right for the two shapes that share a side count. So the rotation is
 * composed with a reversal: the answer no longer survives a shift.
 */
const pairingWrongs = (its: Shape[], count = 3): string[] => {
  const answer = pairing(its);
  const reversed = [...its].reverse();
  const out: string[] = [];
  for (const slip of [1, 2, 3]) {
    for (const source of [its, reversed]) {
      if (out.length >= count) break;
      const text = pairing(source, slip);
      if (text !== answer && !out.includes(text)) out.push(text);
    }
  }
  return out;
};

const pairingOptions = (its: Shape[]): string[] => [pairing(its), ...pairingWrongs(its)];

/** An everyday object matched to a solid shape, with the same rotation. */
const objectPairing = (objects: Array<{ glyph: string; solid: string }>, slip = 0): string =>
  objects.map((item, index) => `${item.glyph} ${solid(objects[(index + slip) % objects.length]!.solid).name}`).join(' · ');

/**
 * The options for an object-matching question.
 *
 * Several objects are the same shape (a ball and a globe are both spheres), so a
 * rotation can hand an object the shape it already has and leave the „wrong“ row
 * right. Any rotation that keeps a pair intact is dropped, and the fallbacks are
 * built by labelling one object with a shape from the pool that is not its own.
 */
const objectPairingOptions = (objects: Array<{ glyph: string; solid: string }>): string[] => {
  const answer = objectPairing(objects);
  const out = [answer];

  for (let slip = 1; slip < objects.length && out.length < 4; slip += 1) {
    const text = objectPairing(objects, slip);
    if (!out.includes(text)) out.push(text);
  }

  // Fallback: swap one object's shape for another solid in the pool.
  for (let index = 0; index < objects.length && out.length < 4; index += 1) {
    const own = solid(objects[index]!.solid).name;
    for (const replacement of SOLID) {
      if (out.length >= 4) break;
      if (replacement.name === own) continue;
      const text = objects
        .map((item, at) => `${item.glyph} ${at === index ? replacement.name : solid(item.solid).name}`)
        .join(' · ');
      if (!out.includes(text)) out.push(text);
    }
  }
  return out;
};

/** The names of the shapes in a drawn pool that satisfy a test. */
const poolWhere = (v: Vars, key: string, test: (item: Shape) => boolean): Shape[] =>
  (v[key] as string[]).map(flat).filter(test);

/** The shapes in a drawn pool that do not. */
const poolWhereNot = (v: Vars, key: string, test: (item: Shape) => boolean): Shape[] =>
  (v[key] as string[]).map(flat).filter((item) => !test(item));

/* ================================================================== *\
 * U12.1 — ბრტყელი ფიგურები (Q1–Q8), 8 templates
 * ================================================================== */

const u121: QuestionTemplate[] = [
  /**
   * Q1 — which of these is the named shape.
   *
   * The asked shape is always drawn, and the options are the drawn glyphs, so
   * answering means finding the shape in the picture. The option set is exactly
   * the pool that was drawn: no option points at a shape that is not there.
   */
  defineTemplate({
    ...address({ id: 'g1-u12-1-which-shape', subtopicId: 'brtyeli-formebi', difficulty: 1 }),
    prompt: 'ნახატზე რომელი ფიგურაა {askedName}?',
    variables: {
      pool: {
        kind: 'list',
        pick: { values: ['circle', 'triangle', 'square', 'rectangle', 'pentagon', 'hexagon'], length: 4, unique: true },
      },
      asked: { kind: 'choice', values: (v: Vars) => [String((v.pool as string[])[0])] },
      askedName: { kind: 'choice', values: (v: Vars) => [flat(String(v.asked)).name] },
    },
    answer: (v: Vars) => bare(flat(String(v.asked))),
    options: (v: Vars) => (v.pool as string[]).map((key) => bare(flat(key))),
    format: { kind: 'text' },
    visual: (v: Vars) => (v.pool as string[]).map((key) => bare(flat(key))).join('   '),
    explanation: (context) => `${flat(String(context.vars.asked)).name} — ${flat(String(context.vars.asked)).glyph}.`,
  }),

  /** Q2 — how many sides does the shape on the page have? (typed) */
  defineTemplate({
    ...address({ id: 'g1-u12-1-how-many-sides', subtopicId: 'brtyeli-formebi', difficulty: 1 }),
    prompt: 'რამდენი გვერდი აქვს ამ ფიგურას?',
    variables: {
      which: { kind: 'choice', values: ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon'] },
    },
    answer: (v: Vars) => flat(String(v.which)).sides,
    format: { kind: 'integer', min: 0, max: 8, entry: true },
    distractors: ({ vars, answer }) => {
      const sides = flat(String(vars.which)).sides;
      return [sides - 1, sides + 1, sides + 2].filter((n) => n > 0 && n !== Number(answer)).map(String);
    },
    visual: (v: Vars) => bare(flat(String(v.which))),
    explanation: ({ vars, answer }) => `${flat(String(vars.which)).name} — ${answer} გვერდი.`,
  }),

  /** Q3 — the round shape with no corners at all. */
  defineTemplate({
    ...address({ id: 'g1-u12-1-round-one', subtopicId: 'brtyeli-formebi', difficulty: 1 }),
    prompt: 'რომელი ფიგურაა მრგვალი და არც ერთი კუთხე არ აქვს?',
    variables: {
      pool: {
        kind: 'list',
        pick: { values: ['circle', 'triangle', 'square', 'pentagon', 'hexagon'], length: 4, unique: true },
      },
    },
    constraints: [{ note: 'the circle is on the page, so the question has an answer', test: (v: Vars) => (v.pool as string[]).includes('circle') }],
    answer: () => bare(flat('circle')),
    options: (v: Vars) => (v.pool as string[]).map((key) => bare(flat(key))),
    format: { kind: 'text' },
    visual: (v: Vars) => (v.pool as string[]).map((key) => bare(flat(key))).join('   '),
    explanation: () => 'წრე მრგვალია და კუთხე არ აქვს.',
  }),

  /** Q4 — matching shapes to names, recast. */
  defineTemplate({
    ...address({ id: 'g1-u12-1-match-names', subtopicId: 'brtyeli-formebi', difficulty: 1 }),
    prompt: 'რომელი რიგი შეაერთებს ყველა ფიგურას თავის სახელთან სწორად?',
    variables: {
      order: { kind: 'list', pick: { values: ['circle', 'triangle', 'square', 'rectangle'], length: 4, unique: true } },
    },
    answer: (v: Vars) => pairing((v.order as string[]).map(flat)),
    options: (v: Vars) => pairingOptions((v.order as string[]).map(flat)),
    format: { kind: 'text' },
    visual: (v: Vars) => (v.order as string[]).map((key) => bare(flat(key))).join('   '),
    explanation: (context) => `სწორი შეერთებაა: ${context.answer}`,
  }),

  /** Q5 — how many corners? (typed) */
  defineTemplate({
    ...address({ id: 'g1-u12-1-how-many-corners', subtopicId: 'brtyeli-formebi', difficulty: 2 }),
    prompt: 'რამდენი კუთხე აქვს ამ ფიგურას?',
    variables: {
      which: { kind: 'choice', values: ['triangle', 'square', 'pentagon', 'hexagon'] },
    },
    answer: (v: Vars) => flat(String(v.which)).corners,
    format: { kind: 'integer', min: 0, max: 8, entry: true },
    distractors: ({ vars, answer }) => {
      const corners = flat(String(vars.which)).corners;
      return [corners - 1, corners + 1, corners + 2].filter((n) => n > 0 && n !== Number(answer)).map(String);
    },
    visual: (v: Vars) => bare(flat(String(v.which))),
    explanation: ({ vars, answer }) => `${flat(String(vars.which)).name} — ${answer} გვერდი და ${answer} კუთხე.`,
  }),

  /**
   * Q6 — the multi-select, recast: every shape on the page with four sides.
   *
   * Both the square and the rectangle qualify, which is the whole point of the
   * question; the wrong lists each lose one of them or take in a pentagon.
   */
  defineTemplate({
    ...address({ id: 'g1-u12-1-four-sides', subtopicId: 'brtyeli-formebi', difficulty: 2 }),
    prompt: 'ნახატზე რომელ ფიგურებს აქვს ოთხი გვერდი? აირჩიე სრული სია.',
    variables: {
      pool: {
        kind: 'list',
        pick: { values: ['circle', 'triangle', 'square', 'rectangle', 'pentagon'], length: 5, unique: true },
      },
    },
    constraints: [{ note: 'both four-sided shapes are on the page', test: (v: Vars) => (v.pool as string[]).includes('square') && (v.pool as string[]).includes('rectangle') }],
    answer: (v: Vars) => setText(poolWhere(v, 'pool', (item) => item.sides === 4)),
    options: (v: Vars) => {
      const right = poolWhere(v, 'pool', (item) => item.sides === 4);
      const other = poolWhereNot(v, 'pool', (item) => item.sides === 4)[0]!;
      return setOptions(right, [[right[0]!], [...right, other], [right[0]!, other]]);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => (v.pool as string[]).map((key) => bare(flat(key))).join('   '),
    explanation: (context) =>
      `${poolWhere(context.vars, 'pool', (item) => item.sides === 4)
        .map((item) => item.name)
        .join(' და ')} — ორივეს ოთხი გვერდი აქვს.`,
  }),

  /** Q7 — the square told apart from its neighbours by equal sides. */
  defineTemplate({
    ...address({ id: 'g1-u12-1-square-among-rectangles', subtopicId: 'brtyeli-formebi', difficulty: 3 }),
    prompt: 'ამ ოთხიდან მხოლოდ ერთს აქვს ოთხივე გვერდი ტოლი. რომელია?',
    variables: {
      pool: { kind: 'list', pick: { values: ['square', 'rectangle', 'pentagon', 'triangle', 'hexagon'], length: 4, unique: true } },
    },
    constraints: [{ note: 'the square is on the page', test: (v: Vars) => (v.pool as string[]).includes('square') }],
    answer: () => bare(flat('square')),
    options: (v: Vars) => (v.pool as string[]).map((key) => bare(flat(key))),
    format: { kind: 'text' },
    visual: (v: Vars) => (v.pool as string[]).map((key) => bare(flat(key))).join('   '),
    explanation: () => 'კვადრატს ოთხივე გვერდი ტოლი აქვს, მართკუთხედს — არა.',
  }),

  /** Q8 — count the triangles in a mixed row. (typed) */
  defineTemplate({
    ...address({ id: 'g1-u12-1-count-triangles', subtopicId: 'brtyeli-formebi', difficulty: 3 }),
    prompt: 'ნახატზე რამდენი სამკუთხედია?',
    variables: {
      triangles: { kind: 'int', min: 1, max: 3 },
      others: { kind: 'list', pick: { values: ['circle', 'square', 'rectangle', 'pentagon'], length: 3, unique: true } },
    },
    answer: (v: Vars) => Number(v.triangles),
    format: { kind: 'integer', min: 0, max: 9, entry: true },
    distractors: ({ answer }) => [Number(answer) + 1, Number(answer) - 1, Number(answer) + 2].filter((n) => n > 0 && n !== Number(answer)).map(String),
    visual: (v: Vars) => [...Array.from({ length: Number(v.triangles) }, () => bare(flat('triangle'))), ...(v.others as string[]).map((key) => bare(flat(key)))].join('   '),
    explanation: ({ answer }) => `${answer} სამკუთხედი — დანარჩენი ფიგურები სხვა ფორმისაა.`,
  }),
];

/* ================================================================== *\
 * U12.2 — სივრცული ფიგურები (Q9–Q15), 7 templates
 * ================================================================== */

const SOLID_KEYS = ['sphere', 'cube', 'cylinder', 'cone'];

const u122: QuestionTemplate[] = [
  /** Q9 — which of these is the named solid. */
  defineTemplate({
    ...address({ id: 'g1-u12-2-which-solid', subtopicId: 'moculobiti-formebi', difficulty: 1 }),
    prompt: 'რომელია {askedName}?',
    variables: {
      pool: { kind: 'list', pick: { values: SOLID_KEYS, length: 4, unique: true } },
      asked: { kind: 'choice', values: (v: Vars) => [String((v.pool as string[])[0])] },
      askedName: { kind: 'choice', values: (v: Vars) => [solid(String(v.asked)).name] },
    },
    answer: (v: Vars) => solidBare(solid(String(v.asked))),
    options: (v: Vars) => (v.pool as string[]).map((key) => solidBare(solid(key))),
    format: { kind: 'text' },
    visual: (v: Vars) => solidRow((v.pool as string[]).map(solid)),
    explanation: (context) => `${solid(String(context.vars.asked)).name}.`,
  }),

  /** Q10, Q11 — which solid does this everyday object resemble? */
  defineTemplate({
    ...address({ id: 'g1-u12-2-object-shape', subtopicId: 'moculobiti-formebi', difficulty: 1 }),
    prompt: '{objectName} რომელ სივრცულ ფიგურას ჰგავს?',
    variables: {
      which: { kind: 'choice', values: ['dice', 'can', 'cone', 'ball', 'box'] },
      objectName: { kind: 'choice', values: (v: Vars) => [stuff(String(v.which)).name] },
    },
    answer: (v: Vars) => solid(stuff(String(v.which)).like).name,
    options: (v: Vars) => {
      const out = [solid(stuff(String(v.which)).like).name];
      for (const item of SOLID) if (!out.includes(item.name) && out.length < 4) out.push(item.name);
      return out;
    },
    format: { kind: 'text' },
    visual: (v: Vars) => stuff(String(v.which)).glyph,
    explanation: (context) => `${stuff(String(context.vars.which)).name} — ${stuff(String(context.vars.which)).note}.`,
  }),

  /** Q12 — matching objects to solids, recast. */
  defineTemplate({
    ...address({ id: 'g1-u12-2-match-objects', subtopicId: 'moculobiti-formebi', difficulty: 2 }),
    prompt: 'რომელი რიგი შეაერთებს საგნებს იმ ფიგურებთან, რომლებსაც ისინი ჰგავს?',
    variables: {
      order: { kind: 'list', pick: { values: ['ball', 'dice', 'can', 'cone'], length: 4, unique: true } },
    },
    answer: (v: Vars) => objectPairing((v.order as string[]).map((key) => ({ glyph: stuff(key).glyph, solid: stuff(key).like }))),
    options: (v: Vars) => objectPairingOptions((v.order as string[]).map((key) => ({ glyph: stuff(key).glyph, solid: stuff(key).like }))),
    format: { kind: 'text' },
    visual: (v: Vars) => objectRow((v.order as string[]).map(stuff)),
    explanation: (context) => `სწორი შეერთებაა: ${context.answer}`,
  }),

  /**
   * Q13 — the sphere, and only the sphere, rolls without ever standing.
   *
   * Not „which shape can roll“: a can and a cone roll too. The question pins the
   * condition — no flat face at all — so exactly one solid fits.
   */
  defineTemplate({
    ...address({ id: 'g1-u12-2-rolls-only', subtopicId: 'moculobiti-formebi', difficulty: 2 }),
    prompt: 'რომელი ფიგურა მხოლოდ გორვით მოძრაობს და ბრტყელი ზედაპირი საერთოდ არ აქვს?',
    variables: {
      order: { kind: 'list', pick: { values: SOLID_KEYS, length: 4, unique: true } },
    },
    answer: () => solidBare(solid('sphere')),
    options: (v: Vars) => (v.order as string[]).map((key) => solidBare(solid(key))),
    format: { kind: 'text' },
    visual: (v: Vars) => solidRow((v.order as string[]).map(solid)),
    explanation: () => 'სფეროს ბრტყელი ზედაპირი არ აქვს, ამიტომ მხოლოდ გორვით მოძრაობს.',
  }),

  /**
   * Q15 — the multi-select, recast.
   *
   * „Which shapes both stand and roll?“ is computed from the two surface flags,
   * so the answer is the cylinder and the cone: not the sphere, which has no
   * flat face, and not the cube, which has no curved one. The wrong lists each
   * keep one member, add one, or lose one.
   */
  defineTemplate({
    ...address({ id: 'g1-u12-2-stands-and-rolls', subtopicId: 'moculobiti-formebi', difficulty: 3 }),
    prompt: 'რომელი ფიგურები დგებიან ბრტყელ ზედაპირზე და ამავე დროს გორდებიან? აირჩიე სრული სია.',
    variables: {
      order: { kind: 'list', pick: { values: SOLID_KEYS, length: 4, unique: true } },
    },
    answer: () => listText(SOLID.filter((item) => item.stands && item.rolls).map((item) => item.name)),
    options: () => {
      const both = listText(SOLID.filter((item) => item.stands && item.rolls).map((item) => item.name));
      const [first, second] = SOLID.filter((item) => item.stands && item.rolls).map((item) => item.name);
      return [
        both,
        listText([first!]),
        listText([first!, second!, solid('sphere').name]),
        listText([solid('cube').name, second!]),
      ].filter((option, index, all) => all.indexOf(option) === index);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => solidRow((v.order as string[]).map(solid)),
    explanation: () => 'ცილინდრსაც და კონუსსაც ბრტყელი ძირი და მრუდე ზედაპირი აქვთ.',
  }),

  /** Q14 — the cone, from its parts. */
  defineTemplate({
    ...address({ id: 'g1-u12-2-cone-parts', subtopicId: 'moculobiti-formebi', difficulty: 2 }),
    prompt: 'რომელ ფიგურას აქვს ერთი ბრტყელი წრიული ძირი და წვერო?',
    variables: {
      order: { kind: 'list', pick: { values: SOLID_KEYS, length: 4, unique: true } },
    },
    answer: () => solidBare(solid('cone')),
    options: (v: Vars) => (v.order as string[]).map((key) => solidBare(solid(key))),
    format: { kind: 'text' },
    visual: (v: Vars) => solidRow((v.order as string[]).map(solid)),
    explanation: () => 'კონუსს ერთი ბრტყელი წრიული ძირი და ერთი წვერო აქვს.',
  }),

  /** A solid named from its picture (typed by naming, level 2). */
  defineTemplate({
    ...address({ id: 'g1-u12-2-name-solid', subtopicId: 'moculobiti-formebi', difficulty: 2 }),
    prompt: 'რა ჰქვია ამ სივრცულ ფიგურას?',
    variables: {
      which: { kind: 'choice', values: SOLID_KEYS },
    },
    answer: (v: Vars) => solid(String(v.which)).name,
    options: () => SOLID.map((item) => item.name),
    format: { kind: 'text' },
    visual: (v: Vars) => solidBare(solid(String(v.which))),
    explanation: (context) => `${solid(String(context.vars.which)).name}.`,
  }),
];

/* ================================================================== *\
 * U12.3 — გვერდებისა და კუთხეების შედარება (Q16–Q21), 6 templates
 * ================================================================== */

const u123: QuestionTemplate[] = [
  /** Q16 — which of the two has more sides? */
  defineTemplate({
    ...address({ id: 'g1-u12-3-more-sides', subtopicId: 'gverdebi-kutxebi', difficulty: 1 }),
    prompt: 'რომელ ფიგურას აქვს მეტი გვერდი: {firstName} თუ {secondName}?',
    variables: {
      first: { kind: 'choice', values: ['triangle', 'square', 'rectangle', 'pentagon'] },
      second: { kind: 'choice', values: ['triangle', 'square', 'rectangle', 'hexagon'] },
      firstName: { kind: 'choice', values: (v: Vars) => [dative(flat(String(v.first)).name)] },
      secondName: { kind: 'choice', values: (v: Vars) => [dative(flat(String(v.second)).name)] },
    },
    constraints: [
      {
        note: 'the two shapes differ in side count, so the question has an answer',
        test: (v: Vars) => flat(String(v.first)).sides !== flat(String(v.second)).sides,
      },
    ],
    answer: (v: Vars) =>
      flat(String(v.first)).sides > flat(String(v.second)).sides ? flat(String(v.first)).name : flat(String(v.second)).name,
    options: (v: Vars) => [flat(String(v.first)).name, flat(String(v.second)).name],
    format: { kind: 'text' },
    optionCount: 2,
    visual: (v: Vars) => `${bare(flat(String(v.first)))}   ${bare(flat(String(v.second)))}`,
    explanation: (context) => {
      const first = flat(String(context.vars.first));
      const second = flat(String(context.vars.second));
      return `${first.name} — ${first.sides} გვერდი, ${second.name} — ${second.sides} გვერდი.`;
    },
  }),

  /** Q17 — how many corners does the named figure have? (typed) */
  defineTemplate({
    ...address({ id: 'g1-u12-3-corners-count', subtopicId: 'gverdebi-kutxebi', difficulty: 1 }),
    prompt: 'რამდენი კუთხე აქვს {shapeName}?',
    variables: {
      which: { kind: 'choice', values: ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon'] },
      shapeName: { kind: 'choice', values: (v: Vars) => [dative(flat(String(v.which)).name)] },
    },
    answer: (v: Vars) => flat(String(v.which)).corners,
    format: { kind: 'integer', min: 0, max: 8, entry: true },
    distractors: ({ vars, answer }) => {
      const corners = flat(String(vars.which)).corners;
      return [corners - 1, corners + 1, corners + 2].filter((n) => n > 0 && n !== Number(answer)).map(String);
    },
    visual: (v: Vars) => bare(flat(String(v.which))),
    explanation: ({ vars, answer }) => `${flat(String(vars.which)).name} — ${answer} კუთხე.`,
  }),

  /** Q18 — matching shapes to side counts, recast. */
  defineTemplate({
    ...address({ id: 'g1-u12-3-match-sides', subtopicId: 'gverdebi-kutxebi', difficulty: 2 }),
    prompt: 'რომელი რიგი შეაერთებს ფიგურებს მათი გვერდების რაოდენობასთან სწორად?',
    variables: {
      order: { kind: 'list', pick: { values: ['triangle', 'square', 'rectangle', 'pentagon'], length: 4, unique: true } },
    },
    answer: (v: Vars) => (v.order as string[]).map((key) => `${bare(flat(key))} ${flat(key).sides}`).join(' · '),
    options: (v: Vars) => {
      const keys = v.order as string[];
      // Each wrong row takes its count from the next shape along: the slip a
      // child makes when they count from memory instead of from the picture.
      const row = (slip: number) => keys.map((key, index) => `${bare(flat(key))} ${flat(keys[(index + slip) % keys.length]!).sides}`).join(' · ');
      const out = [row(0)];
      for (const slip of [1, 2, 3]) if (!out.includes(row(slip))) out.push(row(slip));
      return out;
    },
    format: { kind: 'text' },
    visual: (v: Vars) => (v.order as string[]).map((key) => bare(flat(key))).join('   '),
    explanation: (context) => `სწორი შეერთებაა: ${context.answer}`,
  }),

  /** Q19 — which two figures have the same number of corners? */
  defineTemplate({
    ...address({ id: 'g1-u12-3-same-corners', subtopicId: 'gverdebi-kutxebi', difficulty: 2 }),
    prompt: 'რომელ ორ ფიგურას აქვს ერთნაირი რაოდენობის კუთხე?',
    variables: {
      order: { kind: 'list', pick: { values: ['square', 'rectangle', 'triangle', 'circle'], length: 4, unique: true } },
    },
    constraints: [
      {
        note: 'the square and the rectangle are both on the page, so the answer exists',
        test: (v: Vars) => (v.order as string[]).includes('square') && (v.order as string[]).includes('rectangle'),
      },
    ],
    answer: () => `${flat('square').name} და ${flat('rectangle').name}`,
    options: () => [
      `${flat('square').name} და ${flat('rectangle').name}`,
      `${flat('square').name} და ${flat('triangle').name}`,
      `${flat('rectangle').name} და ${flat('circle').name}`,
      `${flat('triangle').name} და ${flat('circle').name}`,
    ],
    format: { kind: 'text' },
    visual: (v: Vars) => (v.order as string[]).map((key) => bare(flat(key))).join('   '),
    explanation: () => 'კვადრატსაც და მართკუთხედსაც ოთხი კუთხე აქვს.',
  }),

  /** Q20 — how many more corners does the second figure have? (typed) */
  defineTemplate({
    ...address({ id: 'g1-u12-3-how-many-more', subtopicId: 'gverdebi-kutxebi', difficulty: 3 }),
    prompt: '{firstName} {firstCorners} კუთხე აქვს, {secondName} კი {secondCorners}. რამდენით მეტი კუთხე აქვს {secondName}?',
    variables: {
      first: { kind: 'choice', values: ['triangle', 'square', 'rectangle'] },
      second: { kind: 'choice', values: ['pentagon', 'hexagon'] },
      firstName: { kind: 'choice', values: (v: Vars) => [dative(flat(String(v.first)).name)] },
      secondName: { kind: 'choice', values: (v: Vars) => [dative(flat(String(v.second)).name)] },
      firstCorners: { kind: 'choice', values: (v: Vars) => [String(flat(String(v.first)).corners)] },
      secondCorners: { kind: 'choice', values: (v: Vars) => [String(flat(String(v.second)).corners)] },
    },
    answer: (v: Vars) => flat(String(v.second)).corners - flat(String(v.first)).corners,
    format: { kind: 'integer', min: 0, max: 8, entry: true },
    distractors: ({ answer }) => [Number(answer) + 1, Number(answer) - 1, Number(answer) + 2].filter((n) => n > 0 && n !== Number(answer)).map(String),
    visual: (v: Vars) => `${bare(flat(String(v.first)))}   ${bare(flat(String(v.second)))}`,
    explanation: ({ vars, answer }) => `${flat(String(vars.second)).corners} − ${flat(String(vars.first)).corners} = ${answer}.`,
  }),

  /** Q21 — the multi-select, recast: four sides *and* four corners. */
  defineTemplate({
    ...address({ id: 'g1-u12-3-four-and-four', subtopicId: 'gverdebi-kutxebi', difficulty: 3 }),
    prompt: 'რომელ ფიგურებს აქვს ზუსტად ოთხი გვერდი და ოთხი კუთხე? აირჩიე სრული სია.',
    variables: {
      order: { kind: 'list', pick: { values: ['square', 'rectangle', 'triangle', 'circle', 'pentagon'], length: 5, unique: true } },
    },
    constraints: [
      {
        note: 'both four-sided shapes are on the page, so the full list exists',
        test: (v: Vars) => (v.order as string[]).includes('square') && (v.order as string[]).includes('rectangle'),
      },
    ],
    answer: (v: Vars) => setText(poolWhere(v, 'order', (item) => item.sides === 4 && item.corners === 4)),
    options: (v: Vars) => {
      const right = poolWhere(v, 'order', (item) => item.sides === 4 && item.corners === 4);
      const other = poolWhereNot(v, 'order', (item) => item.sides === 4 && item.corners === 4)[0]!;
      return setOptions(right, [[right[0]!], [...right, other], [right[0]!, other]]);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => (v.order as string[]).map((key) => bare(flat(key))).join('   '),
    explanation: () => 'ოთხი გვერდი და ოთხი კუთხე კვადრატსაც და მართკუთხედსაც აქვს.',
  }),
];

/* ================================================================== *\
 * U12.4 — გვერდებისა და კუთხეების დათვლა (Q22–Q27), 6 templates
 * ================================================================== */

/** A mixed row of triangles and quadrilaterals, drawn as one picture. */
const mixedRow = (triangles: number, quads: number, quadKind: string): string =>
  [
    ...Array.from({ length: triangles }, () => bare(flat('triangle'))),
    ...Array.from({ length: quads }, () => bare(flat(quadKind))),
  ].join('   ');

const u124: QuestionTemplate[] = [
  /** Q22 — count the corners on one figure. (typed) */
  defineTemplate({
    ...address({ id: 'g1-u12-4-corners', subtopicId: 'gverdebis-datvla', difficulty: 1 }),
    prompt: 'რამდენი კუთხე აქვს {shapeName}?',
    variables: {
      which: { kind: 'choice', values: ['triangle', 'square', 'pentagon', 'hexagon'] },
      shapeName: { kind: 'choice', values: (v: Vars) => [dative(flat(String(v.which)).name)] },
    },
    answer: (v: Vars) => flat(String(v.which)).corners,
    format: { kind: 'integer', min: 0, max: 8, entry: true },
    distractors: ({ vars, answer }) => {
      const corners = flat(String(vars.which)).corners;
      return [corners - 1, corners + 1, corners + 2].filter((n) => n > 0 && n !== Number(answer)).map(String);
    },
    visual: (v: Vars) => bare(flat(String(v.which))),
    explanation: ({ vars, answer }) => `${flat(String(vars.which)).name} — ${answer} კუთხე.`,
  }),

  /** Q23 — count the sides on one figure. (typed) */
  defineTemplate({
    ...address({ id: 'g1-u12-4-sides', subtopicId: 'gverdebis-datvla', difficulty: 1 }),
    prompt: 'რამდენი გვერდი აქვს {shapeName}?',
    variables: {
      which: { kind: 'choice', values: ['triangle', 'square', 'pentagon', 'hexagon'] },
      shapeName: { kind: 'choice', values: (v: Vars) => [dative(flat(String(v.which)).name)] },
    },
    answer: (v: Vars) => flat(String(v.which)).sides,
    format: { kind: 'integer', min: 0, max: 8, entry: true },
    distractors: ({ vars, answer }) => {
      const sides = flat(String(vars.which)).sides;
      return [sides - 1, sides + 1, sides - 2].filter((n) => n > 0 && n !== Number(answer)).map(String);
    },
    visual: (v: Vars) => bare(flat(String(v.which))),
    explanation: ({ vars, answer }) => `${flat(String(vars.which)).name} — ${answer} გვერდი.`,
  }),

  /** Q24 — four corners on each square, counted across the row. (typed) */
  defineTemplate({
    ...address({ id: 'g1-u12-4-square-corners', subtopicId: 'gverdebis-datvla', difficulty: 3 }),
    prompt: 'ნახატზე {count} კვადრატია. რამდენი კუთხეა სულ?',
    variables: {
      count: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v: Vars) => Number(v.count) * flat('square').corners,
    format: { kind: 'integer', min: 0, max: 40, entry: true },
    distractors: ({ vars, answer }) => {
      const total = Number(vars.count) * 4;
      return [total - 4, total + 4, total + 1].filter((n) => n > 0 && n !== Number(answer)).map(String);
    },
    visual: (v: Vars) => copies(flat('square'), Number(v.count)),
    explanation: ({ vars, answer }) => `${vars.count} × 4 = ${answer} კუთხე.`,
  }),

  /** Q26 — matching shapes to their corner counts, recast. */
  defineTemplate({
    ...address({ id: 'g1-u12-4-match-corners', subtopicId: 'gverdebis-datvla', difficulty: 2 }),
    prompt: 'რომელი რიგი შეაერთებს ფიგურებს მათი კუთხეების რაოდენობასთან სწორად?',
    variables: {
      order: { kind: 'list', pick: { values: ['triangle', 'square', 'pentagon', 'hexagon'], length: 4, unique: true } },
    },
    answer: (v: Vars) => (v.order as string[]).map((key) => `${bare(flat(key))} ${flat(key).corners}`).join(' · '),
    options: (v: Vars) => {
      const keys = v.order as string[];
      const row = (slip: number) => keys.map((key, index) => `${bare(flat(key))} ${flat(keys[(index + slip) % keys.length]!).corners}`).join(' · ');
      const out = [row(0)];
      for (const slip of [1, 2, 3]) if (!out.includes(row(slip))) out.push(row(slip));
      return out;
    },
    format: { kind: 'text' },
    visual: (v: Vars) => (v.order as string[]).map((key) => bare(flat(key))).join('   '),
    explanation: (context) => `სწორი შეერთებაა: ${context.answer}`,
  }),

  /** Q25 — triangles and quadrilaterals together, corners added up. (typed) */
  defineTemplate({
    ...address({ id: 'g1-u12-4-mixed-corners', subtopicId: 'gverdebis-datvla', difficulty: 3 }),
    prompt: 'ნახატზე {triangles} სამკუთხედი და {quads} ოთხკუთხედია. რამდენი კუთხეა სულ?',
    variables: {
      triangles: { kind: 'int', min: 1, max: 3 },
      quads: { kind: 'int', min: 1, max: 3 },
      quadKind: { kind: 'choice', values: ['square', 'rectangle'] },
    },
    answer: (v: Vars) => Number(v.triangles) * flat('triangle').corners + Number(v.quads) * flat('square').corners,
    format: { kind: 'integer', min: 0, max: 30, entry: true },
    distractors: ({ answer }) => [Number(answer) + 1, Number(answer) - 1, Number(answer) + 4].filter((n) => n > 0 && n !== Number(answer)).map(String),
    visual: (v: Vars) => mixedRow(Number(v.triangles), Number(v.quads), String(v.quadKind)),
    explanation: ({ vars, answer }) => `${vars.triangles} × 3 + ${vars.quads} × 4 = ${answer} კუთხე.`,
  }),

  /** Q27 — total sides across two kinds of figure. (typed) */
  defineTemplate({
    ...address({ id: 'g1-u12-4-mixed-sides', subtopicId: 'gverdebis-datvla', difficulty: 3 }),
    prompt: 'ნახატზე {triangles} სამკუთხედი და {quads} კვადრატია. რამდენი გვერდია სულ?',
    variables: {
      triangles: { kind: 'int', min: 1, max: 4 },
      quads: { kind: 'int', min: 1, max: 4 },
    },
    answer: (v: Vars) => Number(v.triangles) * flat('triangle').sides + Number(v.quads) * flat('square').sides,
    format: { kind: 'integer', min: 0, max: 40, entry: true },
    distractors: ({ answer }) => [Number(answer) + 1, Number(answer) - 1, Number(answer) + 3].filter((n) => n > 0 && n !== Number(answer)).map(String),
    visual: (v: Vars) => mixedRow(Number(v.triangles), Number(v.quads), 'square'),
    explanation: ({ vars, answer }) => `${vars.triangles} × 3 + ${vars.quads} × 4 = ${answer} გვერდი.`,
  }),
];

/* ================================================================== *\
 * U12.5 — ღია და დახურული ფიგურები (Q28–Q32), 5 templates
 * ================================================================== */

const u125: QuestionTemplate[] = [
  /** Q28 — pick the closed line. */
  defineTemplate({
    ...address({ id: 'g1-u12-5-closed-line', subtopicId: 'gaRia-daxuruli', difficulty: 1 }),
    prompt: 'რომელი ხაზია დახურული?',
    variables: {
      closed: { kind: 'choice', values: CLOSED_NAMED.map((line) => line.glyph) },
      open: { kind: 'list', pick: { values: OPEN_NAMED.map((line) => line.glyph), length: 3, unique: true } },
    },
    answer: (v: Vars) => lineAt(String(v.closed)).name,
    options: (v: Vars) => [lineAt(String(v.closed)), ...(v.open as string[]).map(lineAt)].map((line) => line.name),
    format: { kind: 'text' },
    visual: (v: Vars) => lineRow([lineAt(String(v.closed)), ...(v.open as string[]).map(lineAt)]),
    explanation: () => 'დახურული ხაზის ბოლოები ერთმანეთს უერთდება.',
  }),

  /** Q29 — pick the open line. */
  defineTemplate({
    ...address({ id: 'g1-u12-5-open-line', subtopicId: 'gaRia-daxuruli', difficulty: 1 }),
    prompt: 'რომელი ხაზია ღია?',
    variables: {
      open: { kind: 'choice', values: OPEN_NAMED.map((line) => line.glyph) },
      closed: { kind: 'list', pick: { values: CLOSED_NAMED.map((line) => line.glyph), length: 3, unique: true } },
    },
    answer: (v: Vars) => lineAt(String(v.open)).name,
    options: (v: Vars) => [lineAt(String(v.open)), ...(v.closed as string[]).map(lineAt)].map((line) => line.name),
    format: { kind: 'text' },
    visual: (v: Vars) => lineRow([lineAt(String(v.open)), ...(v.closed as string[]).map(lineAt)]),
    explanation: () => 'ღია ხაზის ბოლოები ერთმანეთს არ უერთდება.',
  }),

  /** Q30 — the multi-select, recast: every closed line on the page. */
  defineTemplate({
    ...address({ id: 'g1-u12-5-all-closed', subtopicId: 'gaRia-daxuruli', difficulty: 3 }),
    prompt: 'რომელი ხაზებია დახურული? აირჩიე სრული სია.',
    variables: {
      closed: { kind: 'list', pick: { values: CLOSED_NAMED.map((line) => line.glyph), length: 2, unique: true } },
      open: { kind: 'list', pick: { values: OPEN_NAMED.map((line) => line.glyph), length: 2, unique: true } },
    },
    answer: (v: Vars) => listText((v.closed as string[]).map((glyph) => lineAt(glyph).name)),
    options: (v: Vars) => {
      const right = (v.closed as string[]).map((glyph) => lineAt(glyph).name);
      const wrong = (v.open as string[]).map((glyph) => lineAt(glyph).name);
      return [
        listText(right),
        listText([right[0]!]),
        listText([...right, wrong[0]!]),
        listText(wrong),
      ].filter((option, index, all) => option !== '' && all.indexOf(option) === index);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => lineRow([...(v.closed as string[]), ...(v.open as string[])].map(lineAt)),
    explanation: (context) => `დახურულია: ${context.answer}.`,
  }),

  /**
   * Q31 — the verbal form: the ends meet, so is the line open or closed?
   *
   * The picture is drawn from the answer, not beside it: a closed glyph when the
   * sentence says the ends meet, an open one when it says they do not. The
   * earlier draft drew an independent glyph and the picture contradicted the
   * sentence it was illustrating.
   */
  defineTemplate({
    ...address({ id: 'g1-u12-5-ends-meet', subtopicId: 'gaRia-daxuruli', difficulty: 2 }),
    prompt: '{opening} ეს ხაზი ღიაა თუ დახურული?',
    variables: {
      which: { kind: 'choice', values: ['closed', 'open'] },
      opening: {
        kind: 'choice',
        values: (v: Vars) => [v.which === 'closed' ? 'ხაზის ორი ბოლო ერთმანეთს უერთდება.' : 'ხაზის ორი ბოლო ერთმანეთს არ უერთდება.'],
      },
      glyph: {
        kind: 'choice',
        values: (v: Vars) => (v.which === 'closed' ? CLOSED_NAMED.map((line) => line.glyph) : OPEN_NAMED.map((line) => line.glyph)),
      },
    },
    answer: (v: Vars) => (v.which === 'closed' ? 'დახურული' : 'ღია'),
    options: () => ['დახურული', 'ღია'],
    format: { kind: 'text' },
    optionCount: 2,
    visual: (v: Vars) => drawn(lineAt(String(v.glyph))),
    explanation: (context) =>
      context.vars.which === 'closed'
        ? 'ბოლოები ერთმანეთს უერთდება, ამიტომ ხაზი დახურულია.'
        : 'ბოლოები ერთმანეთს არ უერთდება, ამიტომ ხაზი ღიაა.',
  }),

  /** Q32 — how many of the lines on the page are open? (typed) */
  defineTemplate({
    ...address({ id: 'g1-u12-5-count-open', subtopicId: 'gaRia-daxuruli', difficulty: 3 }),
    prompt: 'ნახატზე რამდენი ღია ხაზია?',
    variables: {
      closed: { kind: 'list', pick: { values: CLOSED_NAMED.map((line) => line.glyph), length: { min: 1, max: 3 }, unique: false } },
      open: { kind: 'list', pick: { values: OPEN_NAMED.map((line) => line.glyph), length: { min: 1, max: 3 }, unique: false } },
    },
    answer: (v: Vars) => (v.open as string[]).length,
    format: { kind: 'integer', min: 0, max: 10, entry: true },
    distractors: ({ vars, answer }) => {
      const open = (vars.open as string[]).length;
      return [open - 1, open + 1, open + 2].filter((n) => n > 0 && n !== Number(answer)).map(String);
    },
    visual: (v: Vars) => [...(v.closed as string[]), ...(v.open as string[])].join('   '),
    explanation: ({ vars, answer }) => `სულ ${(vars.closed as string[]).length + (vars.open as string[]).length} ხაზია, მათგან ${answer} ღიაა.`,
  }),
];

/* ================================================================== *\
 * U12.6 — მსგავსი ფიგურები (Q33–Q37), 5 templates
 * ================================================================== */

/** A row in which one shape appears twice — the twin. */
const twinRow = (twin: Shape, others: Shape[]): string => [bare(twin), ...others.map(bare), bare(twin)].join('   ');

const u126: QuestionTemplate[] = [
  /** Q33 — which shape appears twice? */
  defineTemplate({
    ...address({ id: 'g1-u12-6-two-the-same', subtopicId: 'msgavsi-formebi', difficulty: 1 }),
    prompt: 'ნახატზე ორი ერთნაირი ფიგურაა. რომელი ფიგურა მეორდება?',
    variables: {
      twin: { kind: 'choice', values: ['triangle', 'square', 'rectangle', 'circle', 'pentagon'] },
      others: {
        kind: 'list',
        pick: { values: ['circle', 'triangle', 'square', 'rectangle', 'pentagon', 'hexagon'], length: 3, unique: true },
      },
    },
    constraints: [
      {
        note: 'the twins stand apart, so the repeated shape is the only repeat',
        test: (v: Vars) => !(v.others as string[]).includes(String(v.twin)),
      },
    ],
    answer: (v: Vars) => flat(String(v.twin)).name,
    options: (v: Vars) => {
      const out = [flat(String(v.twin)).name];
      for (const key of v.others as string[]) {
        const name = flat(key).name;
        if (!out.includes(name) && out.length < 4) out.push(name);
      }
      return out;
    },
    format: { kind: 'text' },
    visual: (v: Vars) => twinRow(flat(String(v.twin)), (v.others as string[]).map(flat)),
    explanation: (context) => `${flat(String(context.vars.twin)).name} ორჯერ არის ნახატზე.`,
  }),

  /** Q34 — which two shapes are of one family? */
  defineTemplate({
    ...address({ id: 'g1-u12-6-same-form', subtopicId: 'msgavsi-formebi', difficulty: 2 }),
    prompt: 'რომელი ორი ფიგურაა ერთი ოჯახის — ორივეს ოთხი გვერდი და ოთხი კუთხე აქვს?',
    variables: {
      order: { kind: 'list', pick: { values: ['square', 'rectangle', 'triangle', 'circle'], length: 4, unique: true } },
    },
    constraints: [
      {
        note: 'both four-sided shapes are on the page',
        test: (v: Vars) => (v.order as string[]).includes('square') && (v.order as string[]).includes('rectangle'),
      },
    ],
    answer: () => `${flat('square').name} და ${flat('rectangle').name}`,
    options: () => [
      `${flat('square').name} და ${flat('rectangle').name}`,
      `${flat('square').name} და ${flat('triangle').name}`,
      `${flat('rectangle').name} და ${flat('circle').name}`,
      `${flat('triangle').name} და ${flat('circle').name}`,
    ],
    format: { kind: 'text' },
    visual: (v: Vars) => (v.order as string[]).map((key) => bare(flat(key))).join('   '),
    explanation: () => 'კვადრატსაც და მართკუთხედსაც ოთხი გვერდი და ოთხი კუთხე აქვს.',
  }),

  /** Q35 — the same shape at two sizes, named in the picture. */
  defineTemplate({
    ...address({ id: 'g1-u12-6-different-sizes', subtopicId: 'msgavsi-formebi', difficulty: 2 }),
    prompt: 'ნახატზე ერთი ფორმა ორჯერ ჩანს — პატარა და დიდი. რომელი წყვილია ერთი და იმავე ფორმის?',
    variables: {
      tag: { kind: 'choice', values: ['square', 'circle', 'triangle', 'pentagon'] },
    },
    answer: (v: Vars) => `პატარა ${flat(String(v.tag)).name} და დიდი ${flat(String(v.tag)).name}`,
    options: (v: Vars) => {
      const name = flat(String(v.tag)).name;
      const other = flat(String(v.tag) === 'square' ? 'circle' : 'square').name;
      return [
        `პატარა ${name} და დიდი ${name}`,
        `პატარა ${name} და დიდი ${other}`,
        `დიდი ${name} და პატარა ${other}`,
        `პატარა ${other} და დიდი ${other}`,
      ];
    },
    format: { kind: 'text' },
    visual: (v: Vars) => `${bare(flat(String(v.tag)))} (პატარა)   ${bare(flat(String(v.tag)))} (დიდი)`,
    explanation: (context) => `ორივე ${flat(String(context.vars.tag)).name}ა — მხოლოდ ზომით განსხვავდებიან.`,
  }),

  /** Q36 — matching equal shapes, recast. */
  defineTemplate({
    ...address({ id: 'g1-u12-6-match-same', subtopicId: 'msgavsi-formebi', difficulty: 3 }),
    prompt: 'რომელი რიგი შეაერთებს ერთნაირ ფიგურებს ერთმანეთთან?',
    variables: {
      order: { kind: 'list', pick: { values: ['triangle', 'square', 'circle', 'pentagon'], length: 4, unique: true } },
    },
    answer: (v: Vars) => (v.order as string[]).map((key) => `${bare(flat(key))} ↔ ${bare(flat(key))}`).join(' · '),
    options: (v: Vars) => {
      const keys = v.order as string[];
      const row = (slip: number) =>
        keys
          .map((key, index) => {
            const partner = keys[(index + slip) % keys.length]!;
            return `${bare(flat(key))} ↔ ${bare(flat(partner))}`;
          })
          .join(' · ');
      const out = [row(0)];
      for (const slip of [1, 2, 3]) if (!out.includes(row(slip))) out.push(row(slip));
      return out;
    },
    format: { kind: 'text' },
    visual: (v: Vars) => (v.order as string[]).map((key) => `${bare(flat(key))} ${bare(flat(key))}`).join('   '),
    explanation: (context) => `სწორი შეერთებაა: ${context.answer}`,
  }),

  /**
   * Q37 — the multi-select, recast: every triangle on the page.
   *
   * Naming the shape once per copy gave „სამკუთხედი, სამკუთხედი, სამკუთხედი“,
   * which reads as a stutter. The numeral carries the count instead: the answer
   * names how many triangles there are, and every wrong option either miscounts
   * them or counts a shape that is not a triangle.
   */
  defineTemplate({
    ...address({ id: 'g1-u12-6-all-triangles', subtopicId: 'msgavsi-formebi', difficulty: 3 }),
    prompt: 'ნახატზე რომელი ფიგურებია სამკუთხედის ფორმის? აირჩიე სრული პასუხი.',
    variables: {
      triangles: { kind: 'int', min: 2, max: 3 },
      others: { kind: 'list', pick: { values: ['circle', 'square', 'rectangle', 'pentagon'], length: 2, unique: true } },
    },
    answer: (v: Vars) => `${numeral(Number(v.triangles))} სამკუთხედი`,
    options: (v: Vars) => {
      const count = Number(v.triangles);
      const others = (v.others as string[]).map((key) => flat(key).name);
      return [
        `${numeral(count)} სამკუთხედი`,
        `${numeral(count + 1)} სამკუთხედი`,
        `${numeral(count)} სამკუთხედი და ერთი ${others[0]!}`,
        `${numeral(count - 1)} სამკუთხედი და ერთი ${others[1] ?? others[0]!}`,
      ].filter((option, index, all) => all.indexOf(option) === index);
    },
    format: { kind: 'text' },
    visual: (v: Vars) =>
      [...Array.from({ length: Number(v.triangles) }, () => bare(flat('triangle'))), ...(v.others as string[]).map((key) => bare(flat(key)))].join('   '),
    explanation: (context) => `ნახატზე ${context.answer} — ესენი სამკუთხედის ფორმისაა.`,
  }),
];

/* ================================================================== *\
 * U12.7 — ფიგურები ყოველდღიურ ცხოვრებაში (Q38–Q42), 5 templates
 * ================================================================== */

const u127: QuestionTemplate[] = [
  /** Q38, Q41 — what shape is this everyday object? */
  defineTemplate({
    ...address({ id: 'g1-u12-7-object-shape', subtopicId: 'formebi-cxovrebaSi', difficulty: 1 }),
    prompt: 'რა ფორმისაა {objectName}?',
    variables: {
      which: { kind: 'choice', values: ['ball', 'dice', 'can', 'cone'] },
      objectName: { kind: 'choice', values: (v: Vars) => [stuff(String(v.which)).name] },
    },
    answer: (v: Vars) => solid(stuff(String(v.which)).like).name,
    options: (v: Vars) => {
      const out = [solid(stuff(String(v.which)).like).name];
      for (const item of SOLID) if (!out.includes(item.name) && out.length < 4) out.push(item.name);
      return out;
    },
    format: { kind: 'text' },
    visual: (v: Vars) => stuff(String(v.which)).glyph,
    explanation: (context) => `${stuff(String(context.vars.which)).name} — ${stuff(String(context.vars.which)).note}.`,
  }),

  /** A flat shape behind a familiar object. */
  defineTemplate({
    ...address({ id: 'g1-u12-7-flat-behind-object', subtopicId: 'formebi-cxovrebaSi', difficulty: 1 }),
    prompt: '{objectName} რომელ ბრტყელ ფიგურას ჰგავს?',
    variables: {
      which: { kind: 'choice', values: ['book', 'window', 'napkin', 'sign'] },
      objectName: { kind: 'choice', values: (v: Vars) => [stuff(String(v.which)).name] },
    },
    answer: (v: Vars) => flat(stuff(String(v.which)).like).name,
    options: (v: Vars) => {
      const out = [flat(stuff(String(v.which)).like).name];
      for (const item of FLAT) if (!out.includes(item.name) && out.length < 4) out.push(item.name);
      return out;
    },
    format: { kind: 'text' },
    visual: (v: Vars) => stuff(String(v.which)).glyph,
    explanation: (context) => `${stuff(String(context.vars.which)).name} — ${stuff(String(context.vars.which)).note}.`,
  }),

  /** Which of these objects could be the named solid? */
  defineTemplate({
    ...address({ id: 'g1-u12-7-which-object', subtopicId: 'formebi-cxovrebaSi', difficulty: 2 }),
    prompt: 'რომელი საგანი შეიძლება ჰგავდეს {solidName}?',
    variables: {
      which: { kind: 'choice', values: ['cylinder', 'cube', 'cone', 'sphere'] },
      solidName: { kind: 'choice', values: (v: Vars) => [dative(solid(String(v.which)).name)] },
      pool: { kind: 'list', pick: { values: ['ball', 'dice', 'can', 'cone', 'book'], length: 4, unique: true } },
    },
    constraints: [
      {
        note: 'exactly one object on the page is that shape',
        test: (v: Vars) => (v.pool as string[]).filter((key) => stuff(key).like === String(v.which)).length === 1,
      },
    ],
    answer: (v: Vars) => stuff((v.pool as string[]).find((key) => stuff(key).like === String(v.which))!).name,
    options: (v: Vars) => (v.pool as string[]).map((key) => stuff(key).name),
    format: { kind: 'text' },
    visual: (v: Vars) => objectRow((v.pool as string[]).map(stuff)),
    explanation: (context) => {
      const key = (context.vars.pool as string[]).find((item) => stuff(item).like === String(context.vars.which))!;
      return `${stuff(key).name} — ${stuff(key).note}.`;
    },
  }),

  /** Q40 — matching objects to solids, recast. */
  defineTemplate({
    ...address({ id: 'g1-u12-7-match-daily', subtopicId: 'formebi-cxovrebaSi', difficulty: 2 }),
    prompt: 'რომელი რიგი შეაერთებს საგნებს იმ ფიგურებთან, რომლებსაც ისინი ჰგავს?',
    variables: {
      order: { kind: 'list', pick: { values: ['ball', 'dice', 'can', 'cone'], length: 4, unique: true } },
    },
    answer: (v: Vars) => objectPairing((v.order as string[]).map((key) => ({ glyph: stuff(key).glyph, solid: stuff(key).like }))),
    options: (v: Vars) => objectPairingOptions((v.order as string[]).map((key) => ({ glyph: stuff(key).glyph, solid: stuff(key).like }))),
    format: { kind: 'text' },
    visual: (v: Vars) => objectRow((v.order as string[]).map(stuff)),
    explanation: (context) => `სწორი შეერთებაა: ${context.answer}`,
  }),

  /** Q42 — the multi-select, recast: every object shaped like a cube. */
  defineTemplate({
    ...address({ id: 'g1-u12-7-all-cubes', subtopicId: 'formebi-cxovrebaSi', difficulty: 3 }),
    prompt: 'ნახატზე რომელი საგნები ჰგავს კუბს? აირჩიე სრული სია.',
    variables: {
      pool: { kind: 'list', pick: { values: ['ball', 'dice', 'can', 'cone', 'book', 'box'], length: 4, unique: true } },
    },
    constraints: [
      {
        note: 'one cube-shaped object and at least two that are not, so four different lists exist',
        test: (v: Vars) =>
          (v.pool as string[]).filter((key) => stuff(key).like === 'cube').length === 1 &&
          (v.pool as string[]).filter((key) => stuff(key).like !== 'cube').length >= 2,
      },
    ],
    answer: (v: Vars) => listText((v.pool as string[]).filter((key) => stuff(key).like === 'cube').map((key) => stuff(key).name)),
    options: (v: Vars) => {
      const cubes = (v.pool as string[]).filter((key) => stuff(key).like === 'cube').map((key) => stuff(key).name);
      const others = (v.pool as string[]).filter((key) => stuff(key).like !== 'cube').map((key) => stuff(key).name);
      return [listText(cubes), listText([...cubes, others[0]!]), listText([others[0]!]), listText([others[0]!, others[1]!])];
    },
    format: { kind: 'text' },
    visual: (v: Vars) => objectRow((v.pool as string[]).map(stuff)),
    explanation: (context) => `კუბის ფორმისაა: ${context.answer}.`,
  }),
];

/* ================================================================== *\
 * U12.8 — საგნების აღწერა (Q43–Q46), 4 templates
 * ================================================================== */

const u128: QuestionTemplate[] = [
  /** Q43 — the object with a three-cornered flat shape. */
  defineTemplate({
    ...address({ id: 'g1-u12-8-triangle-object', subtopicId: 'formebiT-agwera', difficulty: 1 }),
    prompt: 'რომელ საგანს აქვს სამი კუთხის მქონე ბრტყელი ფორმა?',
    variables: {
      pool: { kind: 'list', pick: { values: ['sign', 'book', 'napkin', 'window'], length: 4, unique: true } },
    },
    constraints: [{ note: 'the triangular sign is on the page', test: (v: Vars) => (v.pool as string[]).includes('sign') }],
    answer: () => stuff('sign').name,
    options: (v: Vars) => (v.pool as string[]).map((key) => stuff(key).name),
    format: { kind: 'text' },
    visual: (v: Vars) => objectRow((v.pool as string[]).map(stuff)),
    explanation: () => 'სამკუთხა ნიშანს სამი გვერდი და სამი კუთხე აქვს.',
  }),

  /**
   * Q45 — read a description, name every figure it fits.
   *
   * The specification flags this one itself: „four sides and four right angles“
   * fits both the square and the rectangle, so either the description must be
   * tightened or both answers accepted. Both answers are accepted here, and the
   * description is not otherwise constrained.
   */
  defineTemplate({
    ...address({ id: 'g1-u12-8-description', subtopicId: 'formebiT-agwera', difficulty: 2 }),
    prompt: 'აღწერილობაა: „ოთხი გვერდი აქვს და ოთხივე კუთხე მართია“. რომელი ფიგურები ესმება ამ აღწერას? აირჩიე სრული სია.',
    variables: {
      order: { kind: 'list', pick: { values: ['square', 'rectangle', 'triangle', 'circle'], length: 4, unique: true } },
    },
    constraints: [{ note: 'both figures the description fits are on the page', test: (v: Vars) => (v.order as string[]).includes('square') && (v.order as string[]).includes('rectangle') }],
    answer: () => setText([flat('square'), flat('rectangle')]),
    options: () => [
      setText([flat('square'), flat('rectangle')]),
      setText([flat('square')]),
      setText([flat('rectangle'), flat('triangle')]),
      setText([flat('triangle'), flat('circle')]),
    ],
    format: { kind: 'text' },
    visual: (v: Vars) => (v.order as string[]).map((key) => bare(flat(key))).join('   '),
    explanation: () => 'ოთხი გვერდი და ოთხი მართი კუთხე კვადრატსაც აქვს და მართკუთხედსაც.',
  }),

  /** Q46 — the solid described by its two flat faces and curved side. */
  defineTemplate({
    ...address({ id: 'g1-u12-8-cylinder-object', subtopicId: 'formebiT-agwera', difficulty: 2 }),
    prompt: 'რომელ საგანს აქვს ორი ბრტყელი წრიული ზედაპირი და მრუდე გვერდი?',
    variables: {
      pool: { kind: 'list', pick: { values: ['can', 'ball', 'dice', 'cone'], length: 4, unique: true } },
    },
    constraints: [{ note: 'the can is on the page', test: (v: Vars) => (v.pool as string[]).includes('can') }],
    answer: () => stuff('can').name,
    options: (v: Vars) => (v.pool as string[]).map((key) => stuff(key).name),
    format: { kind: 'text' },
    visual: (v: Vars) => objectRow((v.pool as string[]).map(stuff)),
    explanation: () => 'ქილას ზემოდან და ქვემოდან ბრტყელი წრე აქვს, გვერდი კი მრუდეა.',
  }),

  /** Q44 — a description built from two properties, where one is not enough. */
  defineTemplate({
    ...address({ id: 'g1-u12-8-two-part', subtopicId: 'formebiT-agwera', difficulty: 3 }),
    prompt: 'აღწერილობაა: „მრგვალია, კუთხე არ აქვს და ერთი დახურული ხაზით შემოიხაზება“. რომელი ფიგურაა ეს?',
    variables: {
      order: { kind: 'list', pick: { values: ['circle', 'triangle', 'square', 'hexagon'], length: 4, unique: true } },
    },
    answer: () => flat('circle').name,
    options: (v: Vars) => (v.order as string[]).map((key) => flat(key).name),
    format: { kind: 'text' },
    visual: (v: Vars) => (v.order as string[]).map((key) => bare(flat(key))).join('   '),
    explanation: () => 'წრეს კუთხე არ აქვს და ერთი დახურული ხაზია.',
  }),
];

/* ================================================================== *\
 * U12.9 — სიმეტრია (Q47–Q50), 4 templates
 * ================================================================== */

/**
 * Left halves of a symmetric picture, two columns wide.
 *
 * The finished picture is the half in columns 0–1 and its mirror in columns 2–3.
 * The mirror is therefore `shift(mirrorVertical(half, 2), 2)` — folded across the
 * half's *own* two-column width and then moved right. Folding across the whole
 * four-wide picture instead reads the half as already sitting at the left edge,
 * and every mirrored cell lands one column out: that was this unit's first bug,
 * and it left every symmetry answer empty. Every verdict below is computed from
 * the same calls that draw the picture, so picture and answer cannot drift apart.
 *
 * Each half is also asymmetric under a fold of its own block, so „reflect it the
 * short way“ is a distractor rather than a second right answer.
 */
const HALVES: Cells[] = [
  [at(0, 0), at(1, 1), at(1, 2)],
  [at(1, 0), at(0, 1), at(0, 2)],
  [at(0, 0), at(1, 0), at(0, 1)],
  [at(1, 0), at(0, 1), at(1, 2)],
];

/** The right-hand block that completes a left half. */
const otherHalf = (half: Cells): Cells => shift(mirrorVertical(half, 2), 2);

/** The finished, symmetric picture. */
const symmetricPicture = (half: Cells): Cells => [...half, ...otherHalf(half)];

/** The right-hand block on its own, two columns wide. */
const rightBlock = (half: Cells): Cells => mirrorVertical(half, 2);

/** Is every filled cell of a grid mirrored about its middle vertical line? */
const symmetricCells = (cells: Cells): boolean => {
  const set = new Set(cells);
  return cells.every((name) => set.has(mirrorVertical([name], 4)[0]!));
};

/** Is every filled cell of a three-wide grid mirrored about its middle horizontal line? */
const symmetricCellsH = (cells: Cells): boolean => {
  const set = new Set(cells);
  return cells.every((name) => set.has(mirrorHorizontal([name], 3)[0]!));
};

/**
 * Four lettered candidates, exactly one of them symmetric.
 *
 * A question that offers whole pictures has a problem the runner makes worse:
 * its content is in the *options*, so the prompt and the picture are identical
 * on every draw, the generator sees the same question again, and it gives up —
 * it threw „cannot produce 8 distinct variations“ after eight seeds. So the
 * candidates are drawn in the **picture**, each with a letter, and the options
 * are the letters. That names the same question, makes the answer impossible to
 * read off by comparing option text, and — because the picture now differs per
 * draw — gives the generator something to key a new question on.
 */
const LETTERS = ['[ა]', '[ბ]', '[გ]', '[დ]'] as const;

/** The lettered picture: one candidate per letter, four cells across. */
const lettered = (pictures: string[]): string => pictures.map((picture, index) => `${LETTERS[index]}\n${picture}`).join('\n\n');

/** The one symmetric picture of a set, three near-misses beside it. */
const verticalCandidates = (half: Cells): string[] => {
  const right = symmetricPicture(half);
  const wrongs: Cells[] = [];
  for (let which = 0; which < right.length && wrongs.length < 3; which += 1) {
    const candidate = withOneCellRemoved(right, which);
    if (symmetricCells(candidate)) continue;
    if (wrongs.some((kept) => kept.join('|') === candidate.join('|'))) continue;
    wrongs.push(candidate);
  }
  return [right, ...wrongs].map((cells) => grid(cells, 4, 3));
};

/** The same, mirrored top to bottom on a three-wide grid. */
const horizontalCandidates = (top: Cells): string[] => {
  const right = [...top, ...mirrorHorizontal(top, 3)];
  const wrongs: Cells[] = [];
  for (let which = 0; which < right.length && wrongs.length < 3; which += 1) {
    const candidate = withOneCellRemoved(right, which);
    if (symmetricCellsH(candidate)) continue;
    if (wrongs.some((kept) => kept.join('|') === candidate.join('|'))) continue;
    wrongs.push(candidate);
  }
  return [right, ...wrongs].map((cells) => grid(cells, 3, 3));
};

/** Places the correct picture at `spot`, the near-misses filling the rest. */
const letterOrder = (candidates: string[], spot: number): string[] => {
  const [right, ...wrongs] = candidates;
  const out = [...wrongs];
  out.splice(spot, 0, right!);
  return out;
};

/**
 * Wrong right-hand halves for a given left half.
 *
 * Each is a different mistake — dropping a cell, sliding the true block a column,
 * adding a cell — and each is checked against the picture it would make, so a
 * distractor that happened to complete the symmetry is never offered.
 */
const wrongHalves = (half: Cells): Cells[] => {
  const trueBlock = rightBlock(half);
  const candidates: Cells[] = [
    withOneCellRemoved(trueBlock, 0),
    withOneCellRemoved(trueBlock, 1),
    shift(trueBlock, 1).filter((name) => Number(name.split(',')[0]) < 2),
    shift(trueBlock, -1),
    withOneCellAdded(trueBlock, 2, 3),
  ];
  const out: Cells[] = [];
  for (const candidate of candidates) {
    if (candidate.length === 0) continue;
    if (candidate.join('|') === trueBlock.join('|')) continue;
    if (symmetricCells([...half, ...shift(candidate, 2)])) continue;
    if (out.some((kept) => kept.join('|') === candidate.join('|'))) continue;
    out.push(candidate);
  }
  return out;
};

const u129: QuestionTemplate[] = [
  /**
   * Q47 — which picture is symmetric about the middle vertical line?
   *
   * The four candidates are drawn and lettered; the options are the letters. The
   * right candidate is a half plus its computed mirror, and each wrong one is
   * that picture with one cell taken away, so checking the answer means checking
   * every cell — which is what rule 5 asks for.
   */
  defineTemplate({
    ...address({ id: 'g1-u12-9-which-symmetric', subtopicId: 'simetria', difficulty: 1 }),
    prompt: 'ოთხი ნახატი მოცემულია. რომელია სიმეტრიული შუა ვერტიკალური ხაზის მიმართ?',
    variables: {
      half: { kind: 'choice', values: [0, 1, 2, 3] },
      spot: { kind: 'int', min: 0, max: 3 },
    },
    answer: (v: Vars) => LETTERS[Number(v.spot)]!,
    options: () => [...LETTERS],
    format: { kind: 'text' },
    visual: (v: Vars) => lettered(letterOrder(verticalCandidates(HALVES[Number(v.half)]!), Number(v.spot))),
    explanation: (context) => `სწორია ${context.answer}: ყოველ უჯრას შუა ხაზის მეორე მხარეს სარკისებური წყვილი აქვს.`,
  }),

  /**
   * Q48 — true or false: is the drawn line an axis of symmetry?
   *
   * The verdict is computed from the very cells the picture is drawn from, so the
   * picture and the answer cannot disagree; both answers occur across seeds. This
   * is the specification's one true/false item.
   */
  defineTemplate({
    ...address({ id: 'g1-u12-9-is-axis', subtopicId: 'simetria', difficulty: 2 }),
    prompt: 'ნახატზე ფიგურა შუაზე ვერტიკალური ხაზითაა გაყოფილი. არის ეს ხაზი სიმეტრიის ღერძი?',
    variables: {
      half: { kind: 'choice', values: [0, 1, 2, 3] },
      truth: { kind: 'choice', values: ['დიახ', 'არა'] },
      omission: { kind: 'int', min: 0, max: 2 },
    },
    answer: (v: Vars) => (v.truth === 'დიახ' ? 'ჭეშმარიტი' : 'მცდარი'),
    options: () => ['ჭეშმარიტი', 'მცდარი'],
    format: { kind: 'text' },
    optionCount: 2,
    visual: (v: Vars) => {
      const picture = symmetricPicture(HALVES[Number(v.half)]!);
      return grid(v.truth === 'დიახ' ? picture : withOneCellRemoved(picture, Number(v.omission)), 4, 3);
    },
    explanation: (context) =>
      context.vars.truth === 'დიახ'
        ? 'ყოველ უჯრას მეორე მხარეს სარკისებური წყვილი ჰყავს — ეს ღერძია.'
        : 'ერთ უჯრას მეორე მხარეს სარკისებური წყვილი არ ჰყავს — ეს ღერძი არ არის.',
  }),

  /**
   * Q50 — complete the other half.
   *
   * The specification asks for drag-and-drop on a grid and the runner has no such
   * mode, so the same task is asked as a choice between right-hand halves, exactly
   * one of which is the mirror of the left. The left half is drawn on its own
   * four-wide grid with the axis on its right edge, so which cells mirror which is
   * unambiguous; each option is the two-wide block that would sit on the other
   * side.
   */
  defineTemplate({
    ...address({ id: 'g1-u12-9-complete-half', subtopicId: 'simetria', difficulty: 3 }),
    prompt: 'მარცხენა ნახევარი მოცემულია, ხაზი კი მისი მარჯვენა კიდეა. რომელი მარჯვენა ნახევარი გახდის ფიგურას სიმეტრიულს?',
    variables: {
      half: { kind: 'choice', values: [0, 1, 2, 3] },
    },
    answer: (v: Vars) => gridInline(rightBlock(HALVES[Number(v.half)]!), 2, 3),
    options: (v: Vars) => {
      const out = [gridInline(rightBlock(HALVES[Number(v.half)]!), 2, 3)];
      for (const candidate of wrongHalves(HALVES[Number(v.half)]!)) {
        if (out.length >= 4) break;
        const block = gridInline(candidate, 2, 3);
        if (!out.includes(block)) out.push(block);
      }
      return out;
    },
    format: { kind: 'text' },
    // The axis is drawn against the half's right edge, so the block the options
    // compete to fill is visibly the empty side of the line.
    visual: (v: Vars) => grid(HALVES[Number(v.half)]!, 4, 3).split('\n').map((line) => `${line}│`).join('\n'),
    explanation: () => 'მარჯვენა ნახევარი მარცხენას სარკისებური ანარეკლია: რაც მარცხნივ კიდესთანაა, მარჯვნივაც კიდესთანაა.',
  }),

  /**
   * Q49 — the same check across the other axis, so „symmetric“ is not learned as
   * „symmetric left to right“.
   *
   * The picture is a top half plus its mirror downwards; each wrong picture loses
   * one cell, breaking one vertical pair. Lettered for the same two reasons Q47
   * is.
   */
  defineTemplate({
    ...address({ id: 'g1-u12-9-horizontal', subtopicId: 'simetria', difficulty: 3 }),
    prompt: 'ოთხი ნახატი მოცემულია. რომელია სიმეტრიული შუა ჰორიზონტალური ხაზის მიმართ?',
    variables: {
      top: { kind: 'list', pick: { values: [at(0, 0), at(1, 0), at(2, 0)], length: 2, unique: true } },
      spot: { kind: 'int', min: 0, max: 3 },
    },
    answer: (v: Vars) => LETTERS[Number(v.spot)]!,
    options: () => [...LETTERS],
    format: { kind: 'text' },
    visual: (v: Vars) => lettered(letterOrder(horizontalCandidates(v.top as Cells), Number(v.spot))),
    explanation: (context) => `სწორია ${context.answer}: ზედა უჯრას შუა ხაზის ქვემოთ სარკისებური წყვილი აქვს.`,
  }),
];

/* ================================================================== *\
 * Exports
 * ================================================================== */

/**
 * Every U12 template, in curriculum order.
 *
 * The nine subtopics are the specification's nine, one array each, and the
 * counts follow its question ranges: 8/7/6/6/5/5/5/4/4 = 50.
 */
export const U12_TEMPLATES: QuestionTemplate[] = [...u121, ...u122, ...u123, ...u124, ...u125, ...u126, ...u127, ...u128, ...u129];

/** Subtopic ids this library is responsible for. */
export const U12_SUBTOPICS = [
  'brtyeli-formebi',
  'moculobiti-formebi',
  'gverdebi-kutxebi',
  'gverdebis-datvla',
  'gaRia-daxuruli',
  'msgavsi-formebi',
  'formebi-cxovrebaSi',
  'formebiT-agwera',
  'simetria',
];
