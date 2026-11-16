import type { QuestionTemplate } from './types';
import { bank, fourOptions, rowNumbers } from './g5-helpers';

/**
 * Grade V — Unit 15: გეომეტრია (geometry).
 *
 * Converted from the academy's `U15` bank (15 subtopics × 6 questions). It is
 * the largest unit in the grade and the only one whose subject is *shapes*
 * rather than numbers, which changes what a template may do.
 *
 * **No arbitrary angle is ever drawn.** A text picture can only put a mark on a
 * row, a column or one of eight directions, so it cannot honestly show a 35°
 * angle (the same wall `clock.ts` runs into). Drawing one anyway would be a
 * picture that disagrees with its own answer. Angles therefore appear as
 * measurements — „35°-იანი კუთხე“ — and the questions about them are about the
 * *number*, which is what the bank actually asks. For the same reason the unit
 * draws no figures at all: every prompt states the dimensions it needs, so the
 * text can never contradict the picture.
 *
 * **A definition is not a question.** „რამდენი წახნაგი აქვს კუბს?“ has one
 * answer and can therefore be asked exactly once; a subtopic needs a dozen
 * different questions, and a session draws twelve without repeating. So the
 * definitional rows of the bank are converted into *computable families* that
 * carry the same knowledge and keep varying:
 *
 *   • „რამდენი წვერო აქვს n-კუთხა პრიზმას?“ → 2n
 *   • „რამდენი წახნაგი აქვს n-კუთხა პირამიდას?“ → n + 1
 *   • „დიაგონალების რაოდენობა“ → n(n − 3) ÷ 2
 *   • „ეილერის ფორმულა“ → წახნაგი + წვერო − 2
 *
 * A child who can answer those for every `n` knows the cube's six faces and the
 * cuboid's twelve edges as the special case they are — and every variation is
 * genuinely a different question.
 */

export const G5_U15_SUBTOPICS = [
  'u15-01',
  'u15-02',
  'u15-03',
  'u15-04',
  'u15-05',
  'u15-06',
  'u15-07',
  'u15-08',
  'u15-09',
  'u15-10',
  'u15-11',
  'u15-12',
  'u15-13',
  'u15-14',
  'u15-15',
] as const;

export type G5U15SubtopicId = (typeof G5_U15_SUBTOPICS)[number];

const TOPIC = 'g5-geometry';

/** One cell of a `spec` row, as a number. */
const at = (row: unknown, index: number): number => rowNumbers(row)[index]!;

/**
 * Exactly four distinct options, the answer first, padded with near misses.
 *
 * Geometry answers collide far more often than arithmetic ones — a 3 × 4 and a
 * 4 × 3 rectangle share a perimeter, and „გვერდები“ and „წვეროები“ are the same
 * number for every polygon — so a list built only from the drawn values can
 * fall short of three wrong options and make the generator reject the draw.
 * Filling the shortfall from `right ± d` keeps every draw usable without ever
 * inventing an option that happens to be correct.
 */
const numericOptions = (
  right: string | number,
  extras: Array<string | number>,
  fmt: (n: number) => string = String,
): string[] => {
  const out: string[] = [String(right)];
  const add = (candidate: string | number) => {
    const text = String(candidate);
    if (out.length < 4 && !out.includes(text) && !text.startsWith('-')) out.push(text);
  };
  for (const extra of extras) add(extra);
  const base = Number(String(right).replace(',', '.'));
  for (let d = 1; d <= 40 && out.length < 4; d += 1) {
    add(fmt(base + d));
    if (base - d > 0) add(fmt(base - d));
  }
  return out;
};

/** A degree figure as the bank writes it: `35°`. */
const deg = (n: number): string => `${n}°`;

/** The four angle classes, by size. */
const angleClass = (n: number): string => {
  if (n === 90) return 'მართი';
  if (n === 180) return 'გაშლილი';
  return n < 90 ? 'მახვილი' : 'ბლაგვი';
};

const ANGLE_OPTIONS = ['მახვილი', 'მართი', 'ბლაგვი', 'გაშლილი'];

/**
 * Faces, edges, vertices and net of the solids the grade works with.
 *
 * `geometry.ts` models a solid for the counting library — its glyph, whether it
 * stands or rolls — and deliberately carries no face/edge/vertex counts, because
 * nothing there counts them. These are this unit's own facts, kept in one table
 * so a question about the cuboid reads the same six faces its neighbour does.
 */
const SOLID_FACTS: Record<string, { faces: number; edges: number; vertices: number; net: string }> = {
  cube: { faces: 6, edges: 12, vertices: 8, net: '6 ტოლი კვადრატი' },
  cuboid: { faces: 6, edges: 12, vertices: 8, net: '6 მართკუთხედი' },
  prism: { faces: 5, edges: 9, vertices: 6, net: '2 სამკუთხედი და 3 მართკუთხედი' },
  pyramid: { faces: 5, edges: 8, vertices: 5, net: '1 კვადრატი და 4 სამკუთხედი' },
};

/** `n` sides written out, for a polygon whose name the question quotes. */
const POLYGON_SIDES: Record<string, number> = {
  სამკუთხედი: 3,
  ოთხკუთხედი: 4,
  ხუთკუთხედი: 5,
  ექვსკუთხედი: 6,
  შვიდკუთხედი: 7,
  რვაკუთხედი: 8,
  ცხრაკუთხედი: 9,
  ათკუთხედი: 10,
  თერთმეტკუთხედი: 11,
  თორმეტკუთხედი: 12,
  ცამეტკუთხედი: 13,
  თოთხმეტკუთხედი: 14,
  თხუთმეტკუთხედი: 15,
  თექვსმეტკუთხედი: 16,
  ჩვიდმეტკუთხედი: 17,
  თვრამეტკუთხედი: 18,
  ცხრამეტკუთხედი: 19,
  ოცკუთხედი: 20,
  ოცდაოთხკუთხედი: 24,
  ოცდაათკუთხედი: 30,
};

/** „პერიმეტრი = 2 × (a + b)“ worked through for one row. */
const perimeterText = (a: number, b: number): string => `2 × (${a} + ${b}) = 2 × ${a + b}`;

export const G5_U15_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U15.1 — კუთხეების კლასიფიკაცია ═════════
  bank({
    id: 'g5-u15-q01',
    subtopicId: 'u15-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'რა ტიპის კუთხეა {a}°-იანი კუთხე?',
    variables: {
      spec: {
        kind: 'choice',
        values: '15|25|35|45|55|65|75|85|90|100|110|125|135|145|160|170|180'.split('|'),
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => angleClass(Number(v.a)),
    format: { kind: 'text' },
    options: () => [...ANGLE_OPTIONS],
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const why =
        a === 90
          ? 'ზუსტად 90°-ია'
          : a === 180
            ? 'ზუსტად 180°-ია'
            : a < 90
              ? 'ნაკლებია 90°-ზე'
              : 'მეტია 90°-ზე და ნაკლებია 180°-ზე';
      return `${deg(a)} ${why}, ამიტომ კუთხე ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u15-q02',
    subtopicId: 'u15-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'რომელი კუთხეა უფრო დიდი: {a}°-იანი თუ {b}°-იანი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['65|85', '30|55', '120|95', '45|70', '150|135', '20|40', '110|160', '75|60', '170|150', '35|25', '15|95', '100|175'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => deg(Math.max(Number(v.a), Number(v.b))),
    format: { kind: 'text' },
    options: (v) => {
      const bigger = Math.max(Number(v.a), Number(v.b));
      const smaller = Math.min(Number(v.a), Number(v.b));
      return fourOptions(deg(bigger), [deg(smaller), '180°', '90°']);
    },
    explain: ({ vars, answer }) => {
      const bigger = Math.max(Number(vars.a), Number(vars.b));
      const smaller = Math.min(Number(vars.a), Number(vars.b));
      return `${deg(bigger)} > ${deg(smaller)}, ამიტომ უფრო დიდია ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u15-q03',
    subtopicId: 'u15-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩამოთვლილ კუთხეებს შორის რომელია {kind} კუთხე: {a}°, {b}°, {c}° თუ {d}°?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'ბლაგვი|45|90|110|180',
          'მახვილი|125|90|40|180',
          'მართი|45|90|110|180',
          'გაშლილი|45|90|110|180',
          'ბლაგვი|30|80|135|180',
          'მახვილი|95|100|25|175',
          'მართი|35|100|90|150',
          'გაშლილი|20|90|160|180',
          'ბლაგვი|60|85|100|90',
          'მახვილი|100|120|70|150',
          'გაშლილი|45|135|90|180',
          'მართი|80|170|90|95',
        ],
      },
      kind: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
    },
    answer: (v) => {
      const kind = String(v.kind);
      const options = [Number(v.a), Number(v.b), Number(v.c), Number(v.d)];
      return deg(options.find((option) => angleClass(option) === kind) ?? options[0]!);
    },
    format: { kind: 'text' },
    options: (v) => [deg(Number(v.a)), deg(Number(v.b)), deg(Number(v.c)), deg(Number(v.d))],
    explain: ({ vars, answer }) =>
      `${answer} — ოთხიდან მხოლოდ ეს კუთხეა ${vars.kind}: დანარჩენები სხვა ტიპისანი არიან.`,
  }),
  bank({
    id: 'g5-u15-q04',
    subtopicId: 'u15-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი გრადუსით აღემატება {a}°-იანი კუთხე მართ კუთხეს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['95|5', '110|20', '125|35', '135|45', '150|60', '165|75', '100|10', '172|82', '140|50', '105|15', '178|88', '155|65'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.a) - 90,
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.a) - 90, [180 - Number(v.a), Number(v.a) - 180, 90]),
    explain: ({ vars, answer }) => `მართი კუთხე 90°-ია: ${vars.a}° − 90° = ${answer}°.`,
  }),
  bank({
    id: 'g5-u15-q05',
    subtopicId: 'u15-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი გრადუსი აკლია {a}°-იან კუთხეს გაშლილ კუთხემდე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['155', '170', '145', '160', '125', '175', '130', '165', '140', '150', '135', '120'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => 180 - Number(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(180 - Number(v.a), [Number(v.a), 90 - (180 - Number(v.a)), 180 - Number(v.a) + 10]),
    explain: ({ vars, answer }) => `გაშლილი კუთხე 180°-ია: 180° − ${vars.a}° = ${answer}°.`,
  }),

  // ═════════ U15.2 — კუთხის გაზომვა ტრანსპორტირით ═════════
  bank({
    id: 'g5-u15-q06',
    subtopicId: 'u15-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'მართი კუთხე ტრანსპორტირით ორ ნაწილად გავყავით. ერთი ნაწილია {a}°. რამდენი გრადუსია მეორე ნაწილი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['35|55', '40|50', '25|65', '30|60', '20|70', '45|45', '15|75', '50|40', '60|30', '10|80', '65|25', '70|20'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => 90 - Number(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(90 - Number(v.a), [Number(v.a), 180 - Number(v.a), 90 + Number(v.a)]),
    explain: ({ vars, answer }) => `მართი კუთხე 90°-ია: 90° − ${vars.a}° = ${answer}°.`,
  }),
  bank({
    id: 'g5-u15-q07',
    subtopicId: 'u15-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გაშლილი კუთხე ორ ნაწილად გავყავით. ერთი ნაწილია {a}°. რამდენი გრადუსია მეორე ნაწილი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['125|55', '110|70', '140|40', '95|85', '150|30', '160|20', '100|80', '135|45', '120|60', '105|75', '170|10', '155|25'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => 180 - Number(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(180 - Number(v.a), [Number(v.a) - 90, Number(v.a), 90 - (180 - Number(v.a))]),
    explain: ({ vars, answer }) => `გაშლილი კუთხე 180°-ია: 180° − ${vars.a}° = ${answer}°.`,
  }),
  bank({
    id: 'g5-u15-q08',
    subtopicId: 'u15-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ტრანსპორტირით გაზომვისას კუთხის ზომა აღმოჩნდა {a}°. მახვილია ეს კუთხე თუ ბლაგვი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['20', '35', '48', '62', '75', '88', '95', '105', '120', '140', '155', '172', '15', '170'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => (Number(v.a) < 90 ? 'მახვილი' : 'ბლაგვი'),
    format: { kind: 'text' },
    options: () => ['მახვილი', 'ბლაგვი'],
    optionCount: 2,
    explain: ({ vars, answer }) =>
      `${vars.a}° ${Number(vars.a) < 90 ? 'ნაკლებია 90°-ზე' : 'მეტია 90°-ზე, მაგრამ ნაკლებია 180°-ზე'}, ამიტომ კუთხე ${answer}.`,
  }),
  bank({
    id: 'g5-u15-q09',
    subtopicId: 'u15-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'კუთხის ზომაა {a}°. რამდენი გრადუსით აღემატება იგი მართ კუთხეს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['95|5', '100|10', '105|15', '112|22', '118|28', '125|35', '130|40', '140|50', '148|58', '156|66', '165|75', '172|82'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.a) - 90,
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.a) - 90, [180 - Number(v.a), Number(v.a) - 180, 90]),
    explain: ({ vars, answer }) => `${vars.a}° − 90° = ${answer}°.`,
  }),

  // ═════════ U15.3 — უცნობი კუთხეები ═════════
  bank({
    id: 'g5-u15-q10',
    subtopicId: 'u15-03',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ორი კუთხის ჯამია 90°. ერთი კუთხეა {a}°. იპოვე მეორე კუთხე.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['30|60', '25|65', '40|50', '15|75', '35|55', '10|80', '45|45', '20|70', '50|40', '5|85', '60|30', '70|20'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => 90 - Number(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(90 - Number(v.a), [Number(v.a), 180 - Number(v.a), 90 + Number(v.a)]),
    explain: ({ vars, answer }) => `90° − ${vars.a}° = ${answer}°.`,
  }),
  bank({
    id: 'g5-u15-q11',
    subtopicId: 'u15-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ორი კუთხის ჯამია 180°. ერთი კუთხეა {a}°. იპოვე მეორე კუთხე.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['65|115', '75|105', '90|90', '100|80', '115|65', '125|55', '45|135', '60|120', '140|40', '35|145', '150|30', '85|95'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => 180 - Number(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(180 - Number(v.a), [Number(v.a), 90 - (180 - Number(v.a)), Number(v.a) + 90]),
    explain: ({ vars, answer }) => `180° − ${vars.a}° = ${answer}°.`,
  }),
  bank({
    id: 'g5-u15-q12',
    subtopicId: 'u15-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'სამკუთხედის ორი კუთხეა {a}° და {b}°. იპოვე მესამე კუთხე.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['50|60', '45|65', '70|40', '30|80', '55|75', '35|45', '60|70', '40|50', '80|65', '25|95', '100|45', '90|35', '20|100', '75|55'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => 180 - Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = 180 - Number(v.a) - Number(v.b);
      return numericOptions(right, [180 - Number(v.a), 360 - Number(v.a) - Number(v.b), Number(v.a) + Number(v.b)]);
    },
    explain: ({ vars, answer }) =>
      `სამკუთხედის კუთხეების ჯამი 180°-ია: 180° − ${vars.a}° − ${vars.b}° = ${answer}°.`,
  }),
  bank({
    id: 'g5-u15-q13',
    subtopicId: 'u15-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ორი მომიჯნავე კუთხის ჯამია 180°. ერთი კუთხე მეორეზე {d}°-ით მეტია. იპოვე უფრო პატარა კუთხე.',
    hint: 'ჯამს გამოაკელი სხვაობა და შედეგი გაყავი ორზე.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['20|80', '30|75', '40|70', '50|65', '60|60', '10|85', '70|55', '80|50', '90|45', '100|40', '110|35', '120|30'],
      },
      d: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => (180 - Number(v.d)) / 2,
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const smaller = (180 - Number(v.d)) / 2;
      return numericOptions(smaller, [smaller + Number(v.d), 180 - Number(v.d), smaller + 2]);
    },
    explain: ({ vars, answer }) =>
      `(180° − ${vars.d}°) ÷ 2 = ${answer}°; მეორე კუთხე ${answer}° + ${vars.d}° = ${Number(answer) + Number(vars.d)}°.`,
  }),
  bank({
    id: 'g5-u15-q14',
    subtopicId: 'u15-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ორი წრფის გადაკვეთისას წარმოიქმნა ოთხი კუთხე. ერთი მათგანია {a}°. რამდენია ამ კუთხის ვერტიკალური (მოპირდაპირე) კუთხე?',
    hint: 'ვერტიკალური კუთხეები ტოლია.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['30', '45', '60', '75', '85', '95', '110', '125', '135', '150', '25', '40'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.a), [180 - Number(v.a), 180 - 2 * Number(v.a), 90]),
    explain: ({ vars, answer }) =>
      `გადაკვეთისას მოპირდაპირე კუთხეები ვერტიკალურია და ტოლია, ამიტომ ისიც ${answer}°. (მომიჯნავე კუთხე ${180 - Number(vars.a)}°-ია.)`,
  }),

  // ═════════ U15.4 — სამკუთხედები ═════════
  bank({
    id: 'g5-u15-q15',
    subtopicId: 'u15-04',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'სამკუთხედის გვერდებია {a} სმ, {b} სმ და {c} სმ. იპოვე მისი პერიმეტრი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['4|6|7', '5|7|8', '6|8|9', '3|5|6', '7|9|10', '5|5|8', '8|8|9', '6|6|6', '4|8|10', '9|10|11', '5|6|7', '2|7|8', '3|9|11', '12|13|14'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [a, b, c] = [Number(v.a), Number(v.b), Number(v.c)];
      return numericOptions(a + b + c, [a * b, a + b, b + c]);
    },
    explain: ({ vars, answer }) => `პერიმეტრი = ${vars.a} + ${vars.b} + ${vars.c} = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u15-q16',
    subtopicId: 'u15-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'სამკუთხედის გვერდებია {a} სმ, {b} სმ და {c} სმ. როგორი სამკუთხედია გვერდების მიხედვით?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '5|5|8', '4|6|7', '6|6|6', '7|7|9', '3|8|9', '10|10|10',
          '9|6|6', '5|7|11', '8|8|8', '12|7|7', '6|8|10', '4|4|4',
          '5|5|5', '9|9|12', '3|3|3',
        ],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => {
      const [a, b, c] = [Number(v.a), Number(v.b), Number(v.c)];
      if (a === b && b === c) return 'ტოლგვერდა';
      if (a === b || b === c || a === c) return 'ტოლფერდა';
      return 'სხვადასხვაგვერდა';
    },
    format: { kind: 'text' },
    options: () => ['ტოლგვერდა', 'ტოლფერდა', 'სხვადასხვაგვერდა'],
    optionCount: 3,
    explain: ({ vars, answer }) =>
      `${vars.a}, ${vars.b}, ${vars.c} სმ — ${
        answer === 'ტოლგვერდა'
          ? 'სამივე გვერდი ტოლია'
          : answer === 'ტოლფერდა'
            ? 'ორი გვერდი ტოლია, მესამე არა'
            : 'სამივე გვერდი სხვადასხვაა'
      }, ამიტომ სამკუთხედი ${answer}.`,
  }),
  bank({
    id: 'g5-u15-q17',
    subtopicId: 'u15-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მართკუთხა სამკუთხედის ერთი მახვილი კუთხეა {a}°. იპოვე მეორე მახვილი კუთხე.',
    hint: 'მართკუთხა სამკუთხედის ორი მახვილი კუთხის ჯამი 90°-ია.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['35|55', '25|65', '40|50', '15|75', '30|60', '20|70', '45|45', '10|80', '50|40', '5|85', '60|30', '70|20'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => 90 - Number(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(90 - Number(v.a), [Number(v.a), 180 - Number(v.a), 90]),
    explain: ({ vars, answer }) => `მართი კუთხე 90°-ია, ამიტომ მეორე მახვილი = 90° − ${vars.a}° = ${answer}°.`,
  }),
  bank({
    id: 'g5-u15-q18',
    subtopicId: 'u15-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'სამკუთხედის ორი კუთხეა {a}° და {b}°. იპოვე მესამე კუთხე და დაადგინე, როგორი სამკუთხედია კუთხეების მიხედვით.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '90|35|მართკუთხა', '90|45|მართკუთხა', '90|60|მართკუთხა',
          '60|60|მახვილკუთხა', '70|50|მახვილკუთხა', '80|40|მახვილკუთხა',
          '30|40|ბლაგვკუთხა', '20|50|ბლაგვკუთხა', '25|35|ბლაგვკუთხა',
          '120|30|მახვილკუთხა', '100|40|მახვილკუთხა', '110|25|მახვილკუთხა',
        ],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      kind: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
    },
    answer: (v) => String(v.kind),
    format: { kind: 'text' },
    options: () => ['მართკუთხა', 'მახვილკუთხა', 'ბლაგვკუთხა'],
    optionCount: 3,
    explain: ({ vars, answer }) => {
      const third = 180 - Number(vars.a) - Number(vars.b);
      return `მესამე კუთხე = 180° − ${vars.a}° − ${vars.b}° = ${third}°, ამიტომ სამკუთხედი ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u15-q19',
    subtopicId: 'u15-04',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'შეიძლება არსებობდეს სამკუთხედი გვერდებით {a} სმ, {b} სმ და {c} სმ?',
    hint: 'სამკუთხედი არსებობს მხოლოდ მაშინ, როცა ორი პატარა გვერდის ჯამი მესამეზე მეტია.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['3|4|5', '2|3|6', '5|5|8', '3|4|8', '6|7|9', '1|2|5', '4|6|8', '4|4|9', '7|9|13', '2|5|7', '6|8|12', '6|3|2'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => {
      const [a, b, c] = [Number(v.a), Number(v.b), Number(v.c)].sort((x, y) => x - y);
      return a + b > c ? 'კი' : 'არა';
    },
    format: { kind: 'text' },
    options: () => ['კი', 'არა'],
    optionCount: 2,
    explain: ({ vars, answer }) => {
      const [x, y, z] = [Number(vars.a), Number(vars.b), Number(vars.c)].sort((a, b) => a - b);
      return answer === 'კი'
        ? `კი — ${x} + ${y} = ${x + y} > ${z}, ამიტომ ასეთი სამკუთხედი არსებობს.`
        : `არა — ${x} + ${y} = ${x + y}, რაც არ არის ${z}-ზე მეტი, ამიტომ ასეთი სამკუთხედი ვერ არსებობს.`;
    },
  }),

  // ═════════ U15.5 — ოთხკუთხედები ═════════
  bank({
    id: 'g5-u15-q20',
    subtopicId: 'u15-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ოთხკუთხედის სამი კუთხეა {a}°, {b}° და {c}°. რამდენია მეოთხე კუთხე?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '90|90|90', '80|100|95', '70|110|80', '100|120|60', '75|105|90',
          '85|95|110', '60|120|90', '115|65|100', '95|85|105', '130|50|90',
          '40|140|100', '110|70|100', '125|55|90', '105|75|95',
        ],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => 360 - Number(v.a) - Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = 360 - Number(v.a) - Number(v.b) - Number(v.c);
      return numericOptions(right, [180 - Number(v.a) - Number(v.b), 360 - Number(v.a) - Number(v.b), Number(v.a) + Number(v.b) + Number(v.c)]);
    },
    explain: ({ vars, answer }) =>
      `ოთხკუთხედის კუთხეების ჯამი 360°-ია: 360° − ${vars.a}° − ${vars.b}° − ${vars.c}° = ${answer}°.`,
  }),
  bank({
    id: 'g5-u15-q21',
    subtopicId: 'u15-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მართკუთხედის პერიმეტრია {p} სმ, სიგრძე — {a} სმ. იპოვე სიგანე.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['30|9', '24|8', '36|12', '28|10', '40|14', '22|7', '34|11', '26|9', '32|10', '20|6', '44|15', '38|12'],
      },
      p: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.p) / 2 - Number(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.p) / 2 - Number(v.a), [Number(v.p) - Number(v.a), Number(v.p) / 2, Number(v.a)]),
    explain: ({ vars, answer }) =>
      `პერიმეტრი = 2 × (სიგრძე + სიგანე), ამიტომ სიგანე = ${vars.p} ÷ 2 − ${vars.a} = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u15-q22',
    subtopicId: 'u15-05',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'კვადრატის პერიმეტრია {p} სმ. იპოვე მისი გვერდის სიგრძე.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['48', '36', '24', '40', '28', '32', '20', '44', '16', '52', '60', '64'],
      },
      p: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.p) / 4,
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.p) / 4, [Number(v.p) / 2, Number(v.p) / 2 - 2, Number(v.p) - 4]),
    explain: ({ vars, answer }) => `კვადრატის გვერდი = პერიმეტრი ÷ 4 = ${vars.p} ÷ 4 = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u15-q23',
    subtopicId: 'u15-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'პარალელოგრამის ერთი კუთხეა {a}°. რამდენია მისი მოპირდაპირე კუთხე?',
    hint: 'პარალელოგრამის მოპირდაპირე კუთხეები ტოლია.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['50', '65', '80', '95', '110', '125', '40', '70', '100', '135', '60', '75'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.a), [180 - Number(v.a), 90, 180 - 2 * Number(v.a)]),
    explain: ({ vars, answer }) =>
      `პარალელოგრამის მოპირდაპირე კუთხეები ტოლია, ამიტომ ისიც ${answer}°. (მეზობელი კუთხე ${180 - Number(vars.a)}°-ია.)`,
  }),

  // ═════════ U15.6 — მრავალკუთხედები ═════════
  bank({
    id: 'g5-u15-q24',
    subtopicId: 'u15-06',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'რამდენი გვერდი აქვს {name}-ს?',
    variables: {
      spec: { kind: 'choice', values: Object.keys(POLYGON_SIDES) },
      name: { kind: 'choice', values: (v) => [String(v.spec)] },
    },
    answer: (v) => POLYGON_SIDES[String(v.name)]!,
    format: { kind: 'integer', min: 3 },
    options: (v) => numericOptions(POLYGON_SIDES[String(v.name)]!, [POLYGON_SIDES[String(v.name)]! + 1, POLYGON_SIDES[String(v.name)]! - 1, POLYGON_SIDES[String(v.name)]! + 2]),
    explain: ({ vars, answer }) => `${vars.name}-ს ${answer} გვერდი აქვს.`,
  }),
  bank({
    id: 'g5-u15-q25',
    subtopicId: 'u15-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მრავალკუთხედს {v} წვერო აქვს. რამდენი გვერდი აქვს მას?',
    hint: 'მრავალკუთხედში გვერდების რაოდენობა წვეროების რაოდენობის ტოლია.',
    variables: {
      spec: { kind: 'choice', values: ['3', '4', '5', '6', '7', '8', '9', '10', '12', '15', '20', '24'] },
      v: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.v),
    format: { kind: 'integer', min: 3 },
    options: (v) => numericOptions(Number(v.v), [Number(v.v) + 1, Number(v.v) - 1, Number(v.v) * 2]),
    explain: ({ vars, answer }) =>
      `მრავალკუთხედს გვერდების რაოდენობა წვეროების რაოდენობის ტოლი აქვს, ამიტომ ${vars.v} წვეროს ${answer} გვერდი შეესაბამება.`,
  }),
  bank({
    id: 'g5-u15-q26',
    subtopicId: 'u15-06',
    topicId: TOPIC,
    difficulty: 3,
    prompt: '{name}-ს რამდენი დიაგონალი აქვს?',
    hint: 'დიაგონალების რაოდენობა = n × (n − 3) ÷ 2, სადაც n გვერდების რაოდენობაა.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'ოთხკუთხედი|4', 'ხუთკუთხედი|5', 'ექვსკუთხედი|6', 'შვიდკუთხედი|7',
          'რვაკუთხედი|8', 'ცხრაკუთხედი|9', 'ათკუთხედი|10', 'თერთმეტკუთხედი|11',
          'თორმეტკუთხედი|12', 'ცამეტკუთხედი|13', 'თოთხმეტკუთხედი|14', 'თხუთმეტკუთხედი|15',
          'თექვსმეტკუთხედი|16', 'ჩვიდმეტკუთხედი|17', 'თვრამეტკუთხედი|18', 'ოცკუთხედი|20',
        ],
      },
      name: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => (Number(v.n) * (Number(v.n) - 3)) / 2,
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [n] = [Number(v.n)];
      return numericOptions((n * (n - 3)) / 2, [n * (n - 3), n, n - 3]);
    },
    explain: ({ vars, answer }) => `${vars.name}: ${vars.n} × (${vars.n} − 3) ÷ 2 = ${answer} დიაგონალი.`,
  }),
  bank({
    id: 'g5-u15-q27',
    subtopicId: 'u15-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'წესიერი {n}-კუთხედის თითოეული გვერდია {a} სმ. იპოვე მისი პერიმეტრი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['3|4', '4|5', '5|6', '6|3', '7|2', '8|5', '9|4', '10|3', '12|2', '5|8', '6|7', '3|12'],
      },
      n: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.n) * Number(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.n) * Number(v.a), [Number(v.n) + Number(v.a), Number(v.n) * Number(v.a) - Number(v.a), Number(v.a) * 4]),
    explain: ({ vars, answer }) =>
      `წესიერ კუთხედს ყველა გვერდი ტოლი აქვს, ამიტომ პერიმეტრი = ${vars.n} × ${vars.a} = ${answer} სმ.`,
  }),

  // ═════════ U15.7 — სივრცული ფიგურები ═════════
  bank({
    id: 'g5-u15-q28',
    subtopicId: 'u15-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{n}-კუთხა პრიზმას რამდენი წვერო აქვს?',
    hint: 'პრიზმის ორივე ფუძე ერთნაირი მრავალკუთხედია.',
    variables: {
      spec: { kind: 'choice', values: ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '15', '16', '20', '24'] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => 2 * Number(v.n),
    format: { kind: 'integer', min: 6 },
    options: (v) => numericOptions(2 * Number(v.n), [Number(v.n), 3 * Number(v.n), 2 * Number(v.n) + 2]),
    explain: ({ vars, answer }) =>
      `ორი ფუძე თითო ${vars.n} წვეროს იძლევა: 2 × ${vars.n} = ${answer} წვერო.`,
  }),
  bank({
    id: 'g5-u15-q29',
    subtopicId: 'u15-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{n}-კუთხა პრიზმას რამდენი წიბო აქვს?',
    variables: {
      spec: { kind: 'choice', values: ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '15', '16', '20', '24'] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => 3 * Number(v.n),
    format: { kind: 'integer', min: 9 },
    options: (v) => numericOptions(3 * Number(v.n), [2 * Number(v.n), Number(v.n) + 2, 4 * Number(v.n)]),
    explain: ({ vars, answer }) =>
      `ზედა ფუძეზე ${vars.n} წიბო, ქვედაზე — კიდევ ${vars.n}, და ${vars.n} ვერტიკალური: 3 × ${vars.n} = ${answer}.`,
  }),
  bank({
    id: 'g5-u15-q30',
    subtopicId: 'u15-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{n}-კუთხა პირამიდას რამდენი წახნაგი აქვს?',
    hint: 'პირამიდას ერთი ფუძე და გვერდითი სამკუთხედები აქვს.',
    variables: {
      spec: { kind: 'choice', values: ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '15', '16', '20', '24'] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.n) + 1,
    format: { kind: 'integer', min: 4 },
    options: (v) => numericOptions(Number(v.n) + 1, [Number(v.n), 2 * Number(v.n), Number(v.n) + 2]),
    explain: ({ vars, answer }) =>
      `ერთი ფუძე და ${vars.n} გვერდითი წახნაგი: ${vars.n} + 1 = ${answer}.`,
  }),
  bank({
    id: 'g5-u15-q31',
    subtopicId: 'u15-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი წახნაგი, წვერო და წიბო აქვს {name}?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'კუბს|cube', 'მართკუთხა პარალელეპიპედს|cuboid',
          'სამკუთხა პრიზმას|prism', 'კვადრატულ პირამიდას|pyramid',
          'ექვსახნაგა კუბს|cube', 'მაღალ პარალელეპიპედს|cuboid',
          'დახრილ სამკუთხა პრიზმას|prism', 'სამკუთხა პირამიდას|pyramid',
          'ბრტყელ პარალელეპიპედს|cuboid', 'გრძელ პარალელეპიპედს|cuboid',
          'თეთრ კუბს|cube', 'ხის კუბს|cube',
        ],
      },
      name: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      key: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
    },
    answer: (v) => {
      const facts = SOLID_FACTS[String(v.key)]!;
      return `${facts.faces} წახნაგი, ${facts.vertices} წვერო, ${facts.edges} წიბო`;
    },
    format: { kind: 'text' },
    options: (v) => {
      const facts = SOLID_FACTS[String(v.key)]!;
      const right = `${facts.faces} წახნაგი, ${facts.vertices} წვერო, ${facts.edges} წიბო`;
      return fourOptions(right, [
        `${facts.faces} წახნაგი, ${facts.edges} წვერო, ${facts.vertices} წიბო`,
        `${facts.edges} წახნაგი, ${facts.vertices} წვერო, ${facts.faces} წიბო`,
        `${facts.faces} წახნაგი, ${facts.vertices} წვერო, ${facts.vertices} წიბო`,
      ]);
    },
    explain: ({ vars, answer }) => `${vars.name} ${answer} აქვს.`,
  }),
  bank({
    id: 'g5-u15-q32',
    subtopicId: 'u15-07',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'სივრცულ ფიგურას {f} წახნაგი და {v} წვერო აქვს. ეილერის ფორმულით იპოვე წიბოების რაოდენობა.',
    hint: 'ეილერის ფორმულა: წახნაგი + წვერო − წიბო = 2.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['8|6', '6|8', '4|4', '5|6', '20|12', '12|20', '6|6', '5|5', '10|7', '9|9', '14|9', '16|10', '7|10', '18|12', '11|8', '24|14'],
      },
      f: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      v: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.f) + Number(v.v) - 2,
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.f) + Number(v.v) - 2, [Number(v.f) + Number(v.v), Number(v.f), Number(v.v)]),
    explain: ({ vars, answer }) => `წიბო = წახნაგი + წვერო − 2 = ${vars.f} + ${vars.v} − 2 = ${answer}.`,
  }),

  // ═════════ U15.8 — წრფეები, სხივები, მონაკვეთები ═════════
  bank({
    id: 'g5-u15-q33',
    subtopicId: 'u15-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მონაკვეთის სიგრძეა {n} სმ. თუ მას შუაზე გავყოფთ, რამდენი სანტიმეტრი იქნება თითოეული ნაწილი?',
    variables: {
      spec: { kind: 'choice', values: ['18', '20', '14', '16', '22', '10', '12', '26', '24', '30', '8', '28'] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.n) / 2,
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.n) / 2, [Number(v.n), Number(v.n) / 2 + 1, Number(v.n) * 2]),
    explain: ({ vars, answer }) => `${vars.n} ÷ 2 = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u15-q34',
    subtopicId: 'u15-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მონაკვეთის AB სიგრძეა {a} სმ, ხოლო AC — {b} სმ. C წერტილი A-სა და B-ს შორისაა. რამდენია CB მონაკვეთის სიგრძე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['12|5', '15|6', '18|7', '20|8', '14|5', '16|9', '22|10', '25|12', '30|14', '11|4', '13|6', '17|8'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.a) - Number(v.b), [Number(v.a) + Number(v.b), Number(v.b), Number(v.a)]),
    explain: ({ vars, answer }) => `CB = AB − AC = ${vars.a} − ${vars.b} = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u15-q35',
    subtopicId: 'u15-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'წრფეზე {n} წერტილია მონიშნული. რამდენი განსხვავებული მონაკვეთის გავლება შეიძლება მათ შორის?',
    hint: 'თითოეული მონაკვეთი ორი წერტილით განისაზღვრება.',
    variables: {
      spec: { kind: 'choice', values: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', '15'] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => (Number(v.n) * (Number(v.n) - 1)) / 2,
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions((Number(v.n) * (Number(v.n) - 1)) / 2, [Number(v.n) * (Number(v.n) - 1), Number(v.n), Number(v.n) - 1]),
    explain: ({ vars, answer }) =>
      `წერტილების წყვილების რაოდენობა = ${vars.n} × (${vars.n} − 1) ÷ 2 = ${answer} მონაკვეთი.`,
  }),
  bank({
    id: 'g5-u15-q36',
    subtopicId: 'u15-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'A, B და C წერტილები ერთ წრფეზეა, B — A-სა და C-ს შორის. AB = {a} სმ, BC = {b} სმ. რამდენია AC?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['5|3', '7|4', '9|6', '4|8', '12|5', '6|7', '10|2', '15|6', '8|9', '11|4', '13|7', '3|5'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.a) + Number(v.b), [Math.abs(Number(v.a) - Number(v.b)), Number(v.a) * Number(v.b), Number(v.a) + Number(v.b) + 2]),
    explain: ({ vars, answer }) => `AC = AB + BC = ${vars.a} + ${vars.b} = ${answer} სმ.`,
  }),

  // ═════════ U15.9 — პარალელური და მართობული წრფეები ═════════
  bank({
    id: 'g5-u15-q37',
    subtopicId: 'u15-09',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ორი წრფე იკვეთება და ერთი კუთხეა {a}°. რამდენია ამ კუთხის მომიჯნავე კუთხე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['60', '45', '30', '75', '20', '50', '80', '65', '35', '70', '25', '55'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => 180 - Number(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(180 - Number(v.a), [Number(v.a), 90 - (180 - Number(v.a)), 180 + Number(v.a)]),
    explain: ({ vars, answer }) =>
      `მომიჯნავე კუთხეების ჯამი 180°-ია, ამიტომ 180° − ${vars.a}° = ${answer}°.`,
  }),
  bank({
    id: 'g5-u15-q38',
    subtopicId: 'u15-09',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ორი წრფე იკვეთება {a}°-იანი კუთხით. მართობულია ეს წრფეები?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['90', '45', '60', '30', '120', '135', '80', '100', '50', '90', '70', '110', '25', '90', '150', '65'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => (Number(v.a) === 90 ? 'კი' : 'არა'),
    format: { kind: 'text' },
    options: () => ['კი', 'არა'],
    optionCount: 2,
    explain: ({ vars, answer }) =>
      answer === 'კი'
        ? `კი — ისინი 90°-ით იკვეთება, ამიტომ მართობული არიან.`
        : `არა — მართობული წრფეები 90°-ით იკვეთება, ეს კუთხე კი ${vars.a}°-ია.`,
  }),
  bank({
    id: 'g5-u15-q39',
    subtopicId: 'u15-09',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ორი პარალელური წრფე გადამკვეთი წრფით იკვეთება. ერთი შესაბამისი კუთხეა {a}°. რამდენია მეორე შესაბამისი კუთხე?',
    hint: 'პარალელური წრფეების შემთხვევაში შესაბამისი კუთხეები ტოლია.',
    variables: {
      spec: { kind: 'choice', values: ['35', '45', '55', '65', '75', '85', '95', '105', '115', '125', '135', '145'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.a), [180 - Number(v.a), 90, Number(v.a) + 10]),
    explain: ({ vars, answer }) =>
      `პარალელური წრფეები გადამკვეთ წრფესთან შესაბამის კუთხეებს ტოლად ქმნიან, ამიტომ ისიც ${answer}°. (მომიჯნავე კუთხე ${180 - Number(vars.a)}°-ია.)`,
  }),
  bank({
    id: 'g5-u15-q40',
    subtopicId: 'u15-09',
    topicId: TOPIC,
    difficulty: 3,
    prompt: '{desc} როგორ ეწოდება ამ წრფეებს?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'ერთ სიბრტყეში მდებარეობს და ერთმანეთს არასდროს კვეთს.|პარალელური',
          'იკვეთება მართი კუთხით.|მართობული',
          'იკვეთება და ოთხ მართ კუთხეს ქმნის.|მართობული',
          'იკვეთება ერთ წერტილში, მაგრამ არა 90°-ით.|გადამკვეთი',
          'გადის ერთსა და იმავე წერტილზე და ქმნის ორ მახვილ კუთხეს.|გადამკვეთი',
          'მთელ სიგრძეზე ერთნაირი მანძილითაა ერთმანეთისგან.|პარალელური',
          'სარკისებურად ირეკლება ერთმანეთს და არ იკვეთება.|პარალელური',
          'იკვეთება ისე, რომ ორივე კუთხე 90°-ია.|მართობული',
          'ორივე მხრივ უსასრულოდ გრძელდება და ერთმანეთს არ ეხება.|პარალელური',
          'ერთი საერთო წერტილი აქვთ და ის კუთხე მახვილია.|გადამკვეთი',
          'ჭრის ერთმანეთს ისე, რომ მომიჯნავე კუთხეები ტოლია.|მართობული',
          'ორი განსხვავებული მიმართულებით მიდის და ერთ წერტილში იკვეთება.|გადამკვეთი',
          'ავტობუსის ლიანდაგივით გვერდიგვერდ მიდის და არ იკვეთება.|პარალელური',
          'სწორი კუთხით იკვეთება — მაგალითად, კვადრატის მეზობელი გვერდები.|მართობული',
        ],
      },
      desc: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      right: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
    },
    answer: (v) => String(v.right),
    format: { kind: 'text' },
    options: () => ['პარალელური', 'მართობული', 'გადამკვეთი'],
    optionCount: 3,
    explain: ({ answer }) =>
      answer === 'პარალელური'
        ? 'ერთ სიბრტყეში მდებარე წრფეებს, რომლებიც არ იკვეთება, პარალელური ეწოდება.'
        : answer === 'მართობული'
          ? 'წრფეებს, რომლებიც მართი კუთხით — 90°-ით — იკვეთება, მართობული ეწოდება.'
          : 'წრფეებს, რომლებსაც ერთი საერთო წერტილი აქვთ და 90°-ით არ იკვეთება, გადამკვეთი ეწოდება.',
  }),

  // ═════════ U15.10 — წრეწირისა და წრის ნაწილები ═════════
  bank({
    id: 'g5-u15-q41',
    subtopicId: 'u15-10',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'წრის რადიუსია {r} სმ. რამდენია მისი დიამეტრი?',
    variables: {
      spec: { kind: 'choice', values: ['5', '4', '6', '7', '3', '8', '9', '10', '2', '12', '1', '15'] },
      r: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.r) * 2,
    format: { kind: 'integer', min: 2 },
    options: (v) => numericOptions(Number(v.r) * 2, [Number(v.r), Number(v.r) * 4, Number(v.r) / 2]),
    explain: ({ vars, answer }) => `დიამეტრი რადიუსზე ორჯერ დიდია: ${vars.r} × 2 = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u15-q42',
    subtopicId: 'u15-10',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'წრის დიამეტრია {d} სმ. რამდენია მისი რადიუსი?',
    variables: {
      spec: { kind: 'choice', values: ['14', '10', '16', '20', '8', '12', '18', '24', '6', '30', '26', '22'] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.d) / 2,
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.d) / 2, [Number(v.d), Number(v.d) * 2, Number(v.d) / 2 + 1]),
    explain: ({ vars, answer }) => `რადიუსი დიამეტრის ნახევარია: ${vars.d} ÷ 2 = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u15-q43',
    subtopicId: 'u15-10',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ორი წრის რადიუსებია {r1} სმ და {r2} სმ. რამდენი სანტიმეტრით აღემატება პირველის დიამეტრი მეორის რადიუსს?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '4|3', '5|4', '6|5', '8|6', '7|3', '9|5', '10|7', '12|9', '3|2', '6|2', '11|8', '15|10',
        ],
      },
      r1: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      r2: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => 2 * Number(v.r1) - Number(v.r2),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(2 * Number(v.r1) - Number(v.r2), [Number(v.r1) - Number(v.r2), 2 * Number(v.r1) + Number(v.r2), Number(v.r1) + Number(v.r2)]),
    explain: ({ vars, answer }) =>
      `პირველის დიამეტრი = 2 × ${vars.r1} = ${2 * Number(vars.r1)} სმ. სხვაობა: ${2 * Number(vars.r1)} − ${vars.r2} = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u15-q44',
    subtopicId: 'u15-10',
    topicId: TOPIC,
    difficulty: 3,
    prompt: '{desc} როგორ ეწოდება ამ ელემენტს?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'მონაკვეთი, რომელიც წრის ცენტრს წრეწირის წერტილთან აერთებს.|რადიუსი',
          'მონაკვეთი, რომელიც წრეწირის ორ წერტილს აერთებს და ცენტრზე გადის.|დიამეტრი',
          'მონაკვეთი, რომელიც წრეწირის ორ წერტილს აერთებს, მაგრამ ცენტრზე არ გადის.|ქორდა',
          'წრეწირის ის ნაწილი, რომელიც ორ წერტილს შორისაა.|რკალი',
          'წრის საზღვარი.|წრეწირი',
          'წერტილი, რომლიდანაც ყველა წერტილამდე მანძილი ტოლია.|ცენტრი',
          'მონაკვეთი, რომლის სიგრძე დიამეტრის ნახევარია.|რადიუსი',
          'ყველაზე გრძელი ქორდა წრეში.|დიამეტრი',
          'მონაკვეთი ცენტრიდან წრეწირამდე.|რადიუსი',
          'მონაკვეთი, რომელიც წრეს ორ ტოლ ნაწილად ყოფს.|დიამეტრი',
          'ხაზი, რომელიც წრეს გარედან შემოფარგლავს.|წრეწირი',
          'მრუდი ხაზის მონაკვეთი წრეწირზე.|რკალი',
          'მონაკვეთი, რომელიც ცენტრსა და წრეწირის წერტილს შორისაა და 5 სმ-ია.|რადიუსი',
          'ქორდა, რომელიც ცენტრზე გადის და 14 სმ-ია.|დიამეტრი',
        ],
      },
      desc: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      right: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
    },
    answer: (v) => String(v.right),
    format: { kind: 'text' },
    // Four parts, the right one included. They rotate with the answer, so two
    // rows that share a correct part still read as different questions.
    options: (v) => {
      const right = String(v.right);
      const parts = ['რადიუსი', 'დიამეტრი', 'ქორდა', 'რკალი', 'წრეწირი', 'ცენტრი'];
      const start = parts.indexOf(right);
      const out: string[] = [right];
      for (let step = 1; step < parts.length && out.length < 4; step += 1) {
        const candidate = parts[(start + step) % parts.length]!;
        if (!out.includes(candidate)) out.push(candidate);
      }
      return out;
    },
    explain: ({ answer }) => {
      const why: Record<string, string> = {
        რადიუსი: 'ცენტრისა და წრეწირის წერტილის შემაერთებელი მონაკვეთი რადიუსია.',
        დიამეტრი: 'ცენტრზე გამავალი ქორდა დიამეტრია — ის წრეს ორ ტოლ ნაწილად ყოფს.',
        ქორდა: 'წრეწირის ორ წერტილის შემაერთებელი მონაკვეთი ქორდაა.',
        რკალი: 'წრეწირის ორ წერტილს შორის მდებარე ნაწილს რკალი ეწოდება.',
        წრეწირი: 'წრის საზღვარს წრეწირი ეწოდება.',
        ცენტრი: 'წრის ცენტრი ის წერტილია, რომლიდანაც წრეწირის ყველა წერტილამდე მანძილი ტოლია.',
      };
      return why[answer]!;
    },
  }),

  // ═════════ U15.11 — სიმეტრია ═════════
  bank({
    id: 'g5-u15-q45',
    subtopicId: 'u15-11',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'წესიერი {n}-კუთხედს რამდენი სიმეტრიის ღერძი აქვს?',
    hint: 'წესიერ მრავალკუთხედს სიმეტრიის ღერძები გვერდების რაოდენობის ტოლია.',
    variables: {
      spec: { kind: 'choice', values: ['3', '4', '5', '6', '7', '8', '9', '10', '12', '14', '15', '16', '18', '20'] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 3 },
    options: (v) => numericOptions(Number(v.n), [Number(v.n) + 1, Number(v.n) - 1, Number(v.n) * 2]),
    explain: ({ vars, answer }) =>
      `წესიერ ${vars.n}-კუთხედს ${answer} სიმეტრიის ღერძი აქვს — ყოველი ღერძი ან წვეროზე, ან გვერდის შუაზე გადის.`,
  }),
  bank({
    id: 'g5-u15-q46',
    subtopicId: 'u15-11',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'რომელ ფიგურას აქვს ზუსტად {k} სიმეტრიის ღერძი: {one}, {two} თუ {three}?',
    hint: 'დაითვალე ღერძები: კვადრატს 4, მართკუთხედს 2, ტოლგვერდა სამკუთხედს 3, რომბს 2, წესიერ ხუთკუთხედს 5.',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '4|კვადრატს|მართკუთხედს|რომბს',
          '2|მართკუთხედს|კვადრატს|წესიერ ხუთკუთხედს',
          '3|ტოლგვერდა სამკუთხედს|მართკუთხედს|რომბს',
          '5|წესიერ ხუთკუთხედს|კვადრატს|ტოლგვერდა სამკუთხედს',
          '6|წესიერ ექვსკუთხედს|რომბს|მართკუთხედს',
          '8|წესიერ რვაკუთხედს|კვადრატს|წესიერ ხუთკუთხედს',
          '4|კვადრატს|ტოლგვერდა სამკუთხედს|წესიერ ექვსკუთხედს',
          '2|რომბს|კვადრატს|წესიერ რვაკუთხედს',
          '3|ტოლგვერდა სამკუთხედს|კვადრატს|წესიერ ექვსკუთხედს',
          '5|წესიერ ხუთკუთხედს|რომბს|წესიერ რვაკუთხედს',
          '6|წესიერ ექვსკუთხედს|მართკუთხედს|კვადრატს',
          '8|წესიერ რვაკუთხედს|რომბს|კვადრატს',
        ],
      },
      k: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      one: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      two: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      three: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]!] },
      right: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
    },
    answer: (v) => String(v.right),
    format: { kind: 'text' },
    options: (v) => [String(v.one), String(v.two), String(v.three)],
    optionCount: 3,
    explain: ({ vars, answer }) =>
      `${answer} აქვს ზუსტად ${vars.k} სიმეტრიის ღერძი; დანარჩენ ორს სხვა რაოდენობა აქვს.`,
  }),
  bank({
    id: 'g5-u15-q47',
    subtopicId: 'u15-11',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ფიგურა სიმეტრიულია ვერტიკალური ღერძის მიმართ. მარცხენა წერტილი ღერძიდან {d} სმ-ითაა დაშორებული. რა მანძილზე იქნება შესაბამისი წერტილი ღერძის მარჯვენა მხარეს?',
    variables: {
      spec: { kind: 'choice', values: ['3', '4', '5', '6', '7', '8', '2', '9', '10', '12', '1', '15'] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.d),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.d), [Number(v.d) * 2, Number(v.d) + 1, Number(v.d) < 3 ? Number(v.d) + 3 : Number(v.d) - 1]),
    explain: ({ vars, answer }) =>
      `სიმეტრიის ღერძი მანძილს ინახავს, ამიტომ მარჯვენა წერტილიც ღერძიდან ${answer} სმ-ითაა დაშორებული (ორივე ერთად — ${Number(vars.d) * 2} სმ).`,
  }),
  bank({
    id: 'g5-u15-q48',
    subtopicId: 'u15-11',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ორი წერტილი სიმეტრიულია ღერძის მიმართ. თითოეული მათგანი ღერძიდან {d} სმ-ითაა დაშორებული. რამდენია მათ შორის მანძილი?',
    variables: {
      spec: { kind: 'choice', values: ['3', '4', '5', '6', '7', '8', '2', '9', '10', '12', '1', '15'] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.d) * 2,
    format: { kind: 'integer', min: 2 },
    options: (v) => numericOptions(Number(v.d) * 2, [Number(v.d), Number(v.d) * 2 + 1, Number(v.d) * 4]),
    explain: ({ vars, answer }) =>
      `ღერძი წერტილებს შუაზე ყოფს, ამიტომ მანძილი = ${vars.d} + ${vars.d} = ${answer} სმ.`,
  }),

  // ═════════ U15.12 — პერიმეტრი ═════════
  bank({
    id: 'g5-u15-q49',
    subtopicId: 'u15-12',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'კვადრატის გვერდია {a} სმ. იპოვე მისი პერიმეტრი.',
    variables: {
      spec: { kind: 'choice', values: ['6', '5', '7', '9', '8', '4', '10', '12', '3', '11', '15', '2'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.a) * 4,
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.a) * 4, [Number(v.a) ** 2, Number(v.a) * 2, Number(v.a) + 4]),
    explain: ({ vars, answer }) => `პერიმეტრი = 4 × გვერდი = 4 × ${vars.a} = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u15-q50',
    subtopicId: 'u15-12',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'მართკუთხედის სიგრძეა {a} სმ, სიგანე — {b} სმ. იპოვე პერიმეტრი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['9|4', '8|3', '10|5', '7|6', '12|4', '11|5', '6|3', '15|8', '14|6', '20|10', '13|7', '16|9'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => 2 * (Number(v.a) + Number(v.b)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [a, b] = [Number(v.a), Number(v.b)];
      return numericOptions(2 * (a + b), [a * b, a + b, 2 * a + b]);
    },
    explain: ({ vars, answer }) =>
      `პერიმეტრი = 2 × (სიგრძე + სიგანე) = ${perimeterText(Number(vars.a), Number(vars.b))} = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u15-q51',
    subtopicId: 'u15-12',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ხუთკუთხედის ყველა გვერდი ტოლია და თითოეული {a} სმ-ია. იპოვე პერიმეტრი.',
    variables: {
      spec: { kind: 'choice', values: ['4', '5', '3', '6', '7', '8', '2', '9', '10', '12', '11', '1'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.a) * 5,
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.a) * 5, [Number(v.a) * 4, Number(v.a) * 6, Number(v.a)]),
    explain: ({ vars, answer }) => `ხუთკუთხედს ხუთი ტოლი გვერდი აქვს: 5 × ${vars.a} = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u15-q52',
    subtopicId: 'u15-12',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მართკუთხედის პერიმეტრია {p} სმ, სიგრძე — {a} სმ. იპოვე სიგანე.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['30|9', '22|7', '26|9', '34|11', '20|6', '28|10', '36|12', '24|8', '40|14', '32|10', '18|5', '44|15'],
      },
      p: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.p) / 2 - Number(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.p) / 2 - Number(v.a), [Number(v.p) - Number(v.a), Number(v.p) / 2 + Number(v.a), Number(v.a)]),
    explain: ({ vars, answer }) =>
      `სიგრძე + სიგანე = ${vars.p} ÷ 2 = ${Number(vars.p) / 2} სმ, ამიტომ სიგანე = ${Number(vars.p) / 2} − ${vars.a} = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u15-q53',
    subtopicId: 'u15-12',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'კვადრატის პერიმეტრია {p} სმ. იპოვე მისი ფართობი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['48|12', '36|9', '24|6', '40|10', '32|8', '20|5', '44|11', '16|4', '60|15', '28|7', '52|13', '64|16'],
      },
      p: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => (Number(v.p) / 4) ** 2,
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions((Number(v.p) / 4) ** 2, [Number(v.p), Number(v.p) / 4, (Number(v.p) / 4) * 2]),
    explain: ({ vars, answer }) =>
      `გვერდი = ${vars.p} ÷ 4 = ${vars.a} სმ; ფართობი = ${vars.a} × ${vars.a} = ${answer} სმ².`,
  }),

  // ═════════ U15.13 — მართკუთხედისა და კვადრატის ფართობი ═════════
  bank({
    id: 'g5-u15-q54',
    subtopicId: 'u15-13',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'მართკუთხედის სიგრძეა {a} სმ, სიგანე — {b} სმ. იპოვე ფართობი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['8|5', '7|4', '9|6', '10|3', '12|5', '6|4', '11|7', '15|4', '9|8', '13|6', '14|5', '7|5'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [a, b] = [Number(v.a), Number(v.b)];
      return numericOptions(a * b, [2 * (a + b), a + b, a * b + a]);
    },
    explain: ({ vars, answer }) => `ფართობი = სიგრძე × სიგანე = ${vars.a} × ${vars.b} = ${answer} სმ².`,
  }),
  bank({
    id: 'g5-u15-q55',
    subtopicId: 'u15-13',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'კვადრატის გვერდია {a} სმ. იპოვე ფართობი.',
    variables: {
      spec: { kind: 'choice', values: ['7', '9', '8', '6', '5', '10', '12', '11', '4', '13', '15', '14'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.a) ** 2,
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.a) ** 2, [Number(v.a) * 4, Number(v.a) * 2, Number(v.a) ** 2 + Number(v.a)]),
    explain: ({ vars, answer }) => `ფართობი = ${vars.a} × ${vars.a} = ${answer} სმ².`,
  }),
  bank({
    id: 'g5-u15-q56',
    subtopicId: 'u15-13',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მართკუთხედის ფართობია {s} სმ², სიგრძე — {a} სმ. იპოვე სიგანე.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['54|9', '56|8', '72|12', '45|9', '63|9', '48|8', '42|7', '64|8', '81|9', '36|6', '90|10', '66|11'],
      },
      s: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.s) / Number(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.s) / Number(v.a), [Number(v.s) - Number(v.a), Number(v.s) + Number(v.a), Number(v.a)]),
    explain: ({ vars, answer }) =>
      `სიგანე = ფართობი ÷ სიგრძე = ${vars.s} ÷ ${vars.a} = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u15-q57',
    subtopicId: 'u15-13',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'კვადრატის ფართობია {s} სმ². იპოვე მისი გვერდი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['64', '81', '49', '36', '100', '25', '144', '121', '169', '16', '225', '196', '4', '9'],
      },
      s: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Math.sqrt(Number(v.s)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const root = Math.sqrt(Number(v.s));
      return numericOptions(root, [root * 2, root + 1, Number(v.s) / 4]);
    },
    explain: ({ vars, answer }) =>
      `${answer} × ${answer} = ${vars.s}, ამიტომ კვადრატის გვერდი ${answer} სმ-ია.`,
  }),
  bank({
    id: 'g5-u15-q58',
    subtopicId: 'u15-13',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'მართკუთხედის პერიმეტრია {p} სმ, სიგრძე — {a} სმ. იპოვე ფართობი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['30|9', '26|8', '34|11', '28|10', '36|12', '22|7', '40|14', '32|11', '24|8', '38|12', '42|13', '46|15'],
      },
      p: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.a) * (Number(v.p) / 2 - Number(v.a)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.a) * (Number(v.p) / 2 - Number(v.a));
      return numericOptions(right, [Number(v.p), Number(v.p) / 2, Number(v.a) * Number(v.p)]);
    },
    explain: ({ vars, answer }) => {
      const width = Number(vars.p) / 2 - Number(vars.a);
      return `სიგანე = ${vars.p} ÷ 2 − ${vars.a} = ${width} სმ; ფართობი = ${vars.a} × ${width} = ${answer} სმ².`;
    },
  }),

  // ═════════ U15.14 — მართკუთხა სამკუთხედის ფართობი ═════════
  bank({
    id: 'g5-u15-q59',
    subtopicId: 'u15-14',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მართკუთხა სამკუთხედის კათეტებია {a} სმ და {b} სმ. იპოვე ფართობი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['6|4', '8|5', '10|4', '12|6', '14|5', '9|6', '16|8', '20|10', '7|4', '18|6', '22|10', '24|8'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => (Number(v.a) * Number(v.b)) / 2,
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [a, b] = [Number(v.a), Number(v.b)];
      return numericOptions((a * b) / 2, [a * b, a + b, (a + b) / 2]);
    },
    explain: ({ vars, answer }) =>
      `მართკუთხა სამკუთხედის ფართობი = (კათეტი × კათეტი) ÷ 2 = (${vars.a} × ${vars.b}) ÷ 2 = ${answer} სმ².`,
  }),
  bank({
    id: 'g5-u15-q60',
    subtopicId: 'u15-14',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'მართკუთხედი, რომლის გვერდებია {a} სმ და {b} სმ, დიაგონალით ორ ტოლ სამკუთხედად გაიყო. რა არის თითოეული მათგანის ფართობი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['8|6', '10|4', '12|5', '7|6', '14|8', '9|4', '16|10', '15|6', '11|8', '20|12', '13|4', '18|5'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => (Number(v.a) * Number(v.b)) / 2,
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [a, b] = [Number(v.a), Number(v.b)];
      return numericOptions((a * b) / 2, [a * b, 2 * (a + b), a + b]);
    },
    explain: ({ vars, answer }) =>
      `მართკუთხედის ფართობი ${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)} სმ²; დიაგონალი ორ ტოლ ნაწილად ყოფს, ამიტომ ${answer} სმ².`,
  }),
  bank({
    id: 'g5-u15-q61',
    subtopicId: 'u15-14',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'მართკუთხა სამკუთხედის ფართობია {s} სმ², ერთი კათეტი — {a} სმ. იპოვე მეორე კათეტი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['12|6', '20|8', '36|12', '15|5', '24|8', '30|10', '45|9', '18|4', '28|7', '40|10', '21|6', '32|8'],
      },
      s: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => (2 * Number(v.s)) / Number(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions((2 * Number(v.s)) / Number(v.a), [Number(v.s) / Number(v.a), Number(v.s), Number(v.a)]),
    explain: ({ vars, answer }) =>
      `ფართობი = (a × b) ÷ 2, ამიტომ b = 2 × ${vars.s} ÷ ${vars.a} = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u15-q62',
    subtopicId: 'u15-14',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'კვადრატი გვერდით {a} სმ დიაგონალით ორ ტოლ სამკუთხედად გაიყო. რა არის თითოეული სამკუთხედის ფართობი?',
    variables: {
      spec: { kind: 'choice', values: ['4', '6', '8', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => Number(v.a) ** 2 / 2,
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.a) ** 2 / 2, [Number(v.a) ** 2, Number(v.a) * 4, Number(v.a) ** 2 / 4]),
    explain: ({ vars, answer }) =>
      `კვადრატის ფართობი ${vars.a} × ${vars.a} = ${Number(vars.a) ** 2} სმ²; დიაგონალი ორ ტოლ ნაწილად ყოფს, ამიტომ ${answer} სმ².`,
  }),

  // ═════════ U15.15 — შედგენილი ფიგურები ═════════
  bank({
    id: 'g5-u15-q63',
    subtopicId: 'u15-15',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ფიგურა შედგება ორი მართკუთხედისგან: {a}×{b} სმ და {c}×{d} სმ. რა არის მთლიანი ფართობი?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '6|5|4|3', '8|4|3|2', '7|6|5|2', '9|3|4|5', '10|2|6|3', '5|4|8|2',
          '12|3|5|4', '6|6|3|3', '11|4|7|3', '9|6|8|2', '13|3|6|5', '8|7|4|6',
          '15|2|5|4', '10|5|7|3', '12|6|9|2', '14|4|8|3',
        ],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => Number(v.a) * Number(v.b) + Number(v.c) * Number(v.d),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [a, b, c, d] = [Number(v.a), Number(v.b), Number(v.c), Number(v.d)];
      return numericOptions(a * b + c * d, [a * b * c * d, 2 * (a + b + c + d), (a + c) * (b + d)]);
    },
    explain: ({ vars, answer }) =>
      `ფართობი = ${vars.a} × ${vars.b} + ${vars.c} × ${vars.d} = ${Number(vars.a) * Number(vars.b)} + ${Number(vars.c) * Number(vars.d)} = ${answer} სმ².`,
  }),
  bank({
    id: 'g5-u15-q64',
    subtopicId: 'u15-15',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'მართკუთხედს, რომლის ზომებია {w} სმ და {h} სმ, გამოაკვეთეს კვადრატი გვერდით {s} სმ. რა არის დარჩენილი ფიგურის ფართობი?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '10|6|3', '12|8|4', '9|7|2', '15|10|5', '8|6|3', '14|9|4', '11|7|5', '20|12|6',
          '13|8|4', '16|9|5', '18|7|4', '12|10|3', '17|6|5', '22|10|6', '25|8|4', '19|9|6',
        ],
      },
      w: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      h: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      s: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => Number(v.w) * Number(v.h) - Number(v.s) ** 2,
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [w, h, s] = [Number(v.w), Number(v.h), Number(v.s)];
      return numericOptions(w * h - s * s, [w * h + s * s, w * h, 2 * (w + h) - 4 * s]);
    },
    explain: ({ vars, answer }) =>
      `დარჩენილი ფართობი = ${vars.w} × ${vars.h} − ${vars.s} × ${vars.s} = ${Number(vars.w) * Number(vars.h)} − ${Number(vars.s) ** 2} = ${answer} სმ².`,
  }),
  bank({
    id: 'g5-u15-q65',
    subtopicId: 'u15-15',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ორი კვადრატი გვერდებით {a} სმ და {b} სმ გვერდიგვერდ დააწესეს. რამდენია მიღებული ფიგურის პერიმეტრი?',
    hint: 'დაწესებისას ერთი გვერდი შიგნით რჩება და პერიმეტრში აღარ ითვლება.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['5|3', '6|4', '7|5', '8|6', '9|7', '10|8', '4|2', '12|10', '3|2', '5|4', '6|5', '7|3', '8|7', '9|4', '11|5', '13|6'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => 4 * Number(v.a) + 2 * Number(v.b),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [a, b] = [Number(v.a), Number(v.b)];
      return numericOptions(4 * a + 2 * b, [4 * (a + b), 2 * (a + b), 4 * a]);
    },
    explain: ({ vars, answer }) =>
      `თითო კვადრატის პერიმეტრი 4a და 4b-ია; დაწესებისას ${vars.b} სმ-იანი გვერდი შიგნით რჩება (ორჯერ), ამიტომ პერიმეტრი = 4 × ${vars.a} + 2 × ${vars.b} = ${answer} სმ.`,
  }),
  bank({
    id: 'g5-u15-q66',
    subtopicId: 'u15-15',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ფიგურა შედგება სამი კვადრატისგან, თითოეულის გვერდია {a} სმ. ისინი ერთ ხაზად, გვერდიგვერდაა მიწყობილი. რამდენია მიღებული მართკუთხედის ფართობი?',
    variables: {
      spec: { kind: 'choice', values: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
    },
    answer: (v) => 3 * Number(v.a) ** 2,
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(3 * Number(v.a) ** 2, [Number(v.a) ** 2, 4 * Number(v.a), 3 * Number(v.a)]),
    explain: ({ vars, answer }) =>
      `თითო კვადრატის ფართობი ${vars.a} × ${vars.a} = ${Number(vars.a) ** 2} სმ²; სამი კვადრატი — ${answer} სმ².`,
  }),
];
