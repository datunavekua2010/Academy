import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

const addr = (base: {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
}) => ({
  grade: 3 as const,
  topicId: 'g3-kanonzomiereba-logika',
  unitId: 'g3-kanonzomiereba-logika',
  ...base,
});

export const G3_U14_SUBTOPICS = [
  'u14-number-sequences-triangles',
  'u14-illustrated-patterns',
  'u14-thought-of-numbers-guessing',
  'u14-age-problems-word-coding',
  'u14-interval-problems-color-choices',
  'u14-elimination-logic-grids',
  'u14-balance-scale-reasoning',
  'u14-condition-matching-elimination',
  'u14-sorting-largest-smallest',
] as const;

export const nearMisses = (
  target: number,
  count = 3,
  step = 1,
  minVal = 0,
): number[] => {
  const result = new Set<number>();
  for (const delta of [step, -step, step * 2, -step * 2, step * 3, -step * 3, step * 4, -step * 4]) {
    const val = target + delta;
    if (val >= minVal && val !== target) {
      result.add(val);
      if (result.size >= count) break;
    }
  }
  let fallback = minVal;
  while (result.size < count) {
    if (fallback !== target) result.add(fallback);
    fallback += step;
  }
  return Array.from(result).slice(0, count);
};

export const G3_U14_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // SUBTOPIC 1: u14-number-sequences-triangles (რიცხვითი მიმდევრობები და სამკუთხედები)
  // =========================================================================

  // Q01 — ზრდადი არითმეტიკული მიმდევრობა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-01', subtopicId: 'u14-number-sequences-triangles', difficulty: 1 }),
    prompt: 'იპოვე შემდეგი რიცხვი მიმდევრობაში: {a}, {b}, {c}, ?',
    variables: {
      step: { kind: 'choice', values: [3, 4, 5, 6, 7, 8] },
      start: { kind: 'int', min: 10, max: 40 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.start)] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.start) + Number(v.step)] },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.start) + 2 * Number(v.step)] },
    },
    answer: (v: Vars) => Number(v.start) + 3 * Number(v.step),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) =>
      `მიმდევრობის ყოველი წევრი იზრდება ${vars.step}-ით. ${vars.c} + ${vars.step} = ${answer}.`,
  }),

  // Q02 — კლებადი არითმეტიკული მიმდევრობა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-02', subtopicId: 'u14-number-sequences-triangles', difficulty: 1 }),
    prompt: 'იპოვე შემდეგი რიცხვი კლებად მიმდევრობაში: {a}, {b}, {c}, ?',
    variables: {
      step: { kind: 'choice', values: [3, 4, 5, 6, 7] },
      start: { kind: 'int', min: 50, max: 90 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.start)] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.start) - Number(v.step)] },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.start) - 2 * Number(v.step)] },
    },
    answer: (v: Vars) => Number(v.start) - 3 * Number(v.step),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) =>
      `მიმდევრობის ყოველი წევრი მცირდება ${vars.step}-ით. ${vars.c} − ${vars.step} = ${answer}.`,
  }),

  // Q03 — გაორმაგების მიმდევრობა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-03', subtopicId: 'u14-number-sequences-triangles', difficulty: 2 }),
    prompt: 'დაადგინე კანონზომიერება და იპოვე შემდეგი რიცხვი: {a}, {b}, {c}, ?',
    variables: {
      start: { kind: 'choice', values: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
      factor: { kind: 'choice', values: [2, 3] },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.start)] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.start) * Number(v.factor)] },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.start) * Number(v.factor) * Number(v.factor)] },
    },
    answer: (v: Vars) => Number(v.start) * Math.pow(Number(v.factor), 3),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 4, 1),
    explanation: ({ vars, answer }) =>
      `ყოველი მომდევნო რიცხვი მიიღება წინა რიცხვის ${vars.factor}-ზე გამრავლებით. ${vars.c} × ${vars.factor} = ${answer}.`,
  }),

  // Q04 — რიცხვითი სამკუთხედი: ნამრავლი წვეროში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-04', subtopicId: 'u14-number-sequences-triangles', difficulty: 2 }),
    prompt: 'სამკუთხედის ორ ქვედა კუთხეში წერია {a} და {b}. ზედა წვეროში იწერება მათი ნამრავლი. რა რიცხვი უნდა ეწეროს ზედა წვეროში?',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      b: { kind: 'int', min: 4, max: 9 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // Q05 — მონაცვლეობითი მიმდევრობა (+a, -b) (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-05', subtopicId: 'u14-number-sequences-triangles', difficulty: 3 }),
    prompt: 'დაადგინე კანონზომიერება და იპოვე შემდეგი რიცხვი: {n1}, {n2}, {n3}, {n4}, ?',
    variables: {
      start: { kind: 'choice', values: [10, 12, 15, 18, 20, 25, 30] },
      add: { kind: 'choice', values: [4, 5, 6] },
      sub: { kind: 'choice', values: [1, 2] },
      n1: { kind: 'choice', values: (v: Vars) => [Number(v.start)] },
      n2: { kind: 'choice', values: (v: Vars) => [Number(v.start) + Number(v.add)] },
      n3: { kind: 'choice', values: (v: Vars) => [Number(v.start) + Number(v.add) - Number(v.sub)] },
      n4: { kind: 'choice', values: (v: Vars) => [Number(v.start) + 2 * Number(v.add) - Number(v.sub)] },
    },
    answer: (v: Vars) => Number(v.start) + 2 * Number(v.add) - 2 * Number(v.sub),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) =>
      `კანონზომიერებაა: +${vars.add}, −${vars.sub}, +${vars.add}, −${vars.sub}. ამიტომ ${vars.n4} − ${vars.sub} = ${answer}.`,
  }),

  // Q06 — რიცხვითი სამკუთხედი: უცნობი ქვედა კუთხე (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-06', subtopicId: 'u14-number-sequences-triangles', difficulty: 3 }),
    prompt: 'სამკუთხედის ზედა წვეროში წერია {top}, ხოლო ერთ ქვედა კუთხეში — {bottom1}. ზედა რიცხვი ქვედა ორი რიცხვის ნამრავლია. რა რიცხვი წერია მეორე ქვედა კუთხეში?',
    variables: {
      bottom1: { kind: 'choice', values: [3, 4, 5, 6, 7, 8] },
      bottom2: { kind: 'choice', values: [4, 5, 6, 7, 8, 9] },
      top: { kind: 'choice', values: (v: Vars) => [Number(v.bottom1) * Number(v.bottom2)] },
    },
    answer: (v: Vars) => Number(v.bottom2),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.top} ÷ ${vars.bottom1} = ${answer}.`,
  }),

  // =========================================================================
  // SUBTOPIC 2: u14-illustrated-patterns (ილუსტრირებული კანონზომიერებები)
  // =========================================================================

  // Q07 — 3-ელემენტიანი განმეორებადი მიმდევრობა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-07', subtopicId: 'u14-illustrated-patterns', difficulty: 1 }),
    prompt: 'ფიგურების მიმდევრობა მეორდება: {s1}, {s2}, {s3}, {s1}, {s2}, {s3}, {s1}, __. რომელი ფიგურა მოდის შემდეგ?',
    variables: {
      pattern: {
        kind: 'choice',
        values: [
          '🔴_🔷_⭐️',
          '🔺_🟢_🟨',
          '🟣_🔶_❤️',
          '🍏_🍌_🍇',
          '🚗_✈️_🚀',
          '⚽️_🏀_🎾',
          '🌸_🌼_🌻',
          '🐶_🐱_🐭',
          '🍎_🍐_🍊',
          '💎_💍_👑',
          '🌙_☀️_⭐️',
          '🎈_🎁_🎉',
          '🦋_🐝_🐞',
          '🚲_🛵_🏎️',
        ],
      },
      s1: { kind: 'choice', values: (v: Vars) => [String(v.pattern).split('_')[0]] },
      s2: { kind: 'choice', values: (v: Vars) => [String(v.pattern).split('_')[1]] },
      s3: { kind: 'choice', values: (v: Vars) => [String(v.pattern).split('_')[2]] },
      extra: { kind: 'choice', values: ['💎', '🌸', '☀️'] },
    },
    answer: (v: Vars) => String(v.s2),
    format: { kind: 'text' },
    options: (v: Vars) => [String(v.s2), String(v.s1), String(v.s3), String(v.extra)],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `მიმდევრობის ციკლია (${vars.s1}, ${vars.s2}, ${vars.s3}). ${vars.s1}-ის შემდეგ მოდის ${answer}.`,
  }),

  // Q08 — 4-ელემენტიანი მიმდევრობა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-08', subtopicId: 'u14-illustrated-patterns', difficulty: 1 }),
    prompt: 'მიმდევრობა მეორდება: {s1}, {s2}, {s3}, {s4}, {s1}, {s2}, {s3}, __. რა ფიგურა იქნება შემდეგი?',
    variables: {
      pattern: {
        kind: 'choice',
        values: [
          '🔴_🔵_🟢_🟡',
          '🔺_🔷_⭐️_💎',
          '🐱_🐶_🐰_🦊',
          '🍎_🍊_🍋_🍏',
          '☀️_🌙_☁️_⭐️',
          '🚗_🚕_🚙_🚌',
          '🌸_🌺_🌼_🌻',
          '⚽️_🏀_🏈_⚾️',
          '🟣_🔵_🟢_🟡',
          '🍇_🍓_🍒_🍑',
          '✈️_🚀_🛸_🚁',
          '🐶_🦁_🐯_🐻',
          '🎈_🎀_🎁_🎉',
        ],
      },
      s1: { kind: 'choice', values: (v: Vars) => [String(v.pattern).split('_')[0]] },
      s2: { kind: 'choice', values: (v: Vars) => [String(v.pattern).split('_')[1]] },
      s3: { kind: 'choice', values: (v: Vars) => [String(v.pattern).split('_')[2]] },
      s4: { kind: 'choice', values: (v: Vars) => [String(v.pattern).split('_')[3]] },
      decoy: { kind: 'choice', values: ['💜', '🌺', '🍀'] },
    },
    answer: (v: Vars) => String(v.s4),
    format: { kind: 'text' },
    options: (v: Vars) => [String(v.s4), String(v.s1), String(v.s2), String(v.decoy)],
    optionCount: 4,
    explanation: ({ vars: _vars, answer }) =>
      `ციკლის მეოთხე ელემენტია ${answer}.`,
  }),

  // Q09 — მზარდი გეომეტრიული ნიმუში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-09', subtopicId: 'u14-illustrated-patterns', difficulty: 2 }),
    prompt: 'ფიგურების პირველ რიგში არის {r1} ვარსკვლავი, მეორეში — {r2}, მესამეში — {r3}. რამდენი ვარსკვლავი იქნება მეოთხე რიგში?',
    variables: {
      start: { kind: 'int', min: 2, max: 8 },
      step: { kind: 'choice', values: [2, 3, 4, 5] },
      r1: { kind: 'choice', values: (v: Vars) => [Number(v.start)] },
      r2: { kind: 'choice', values: (v: Vars) => [Number(v.start) + Number(v.step)] },
      r3: { kind: 'choice', values: (v: Vars) => [Number(v.start) + 2 * Number(v.step)] },
    },
    answer: (v: Vars) => Number(v.start) + 3 * Number(v.step),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `ყოველ შემდეგ რიგში ემატება ${vars.step} ვარსკვლავი. ${vars.r3} + ${vars.step} = ${answer}.`,
  }),

  // Q10 — ისრების მობრუნების კანონზომიერება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-10', subtopicId: 'u14-illustrated-patterns', difficulty: 2 }),
    prompt: '{figureType} ბრუნავს {dir}: {seq}, __. საით იქნება მიმართული შემდეგი {figureSingle}?',
    variables: {
      type: { kind: 'choice', values: ['arrows', 'triangles'] },
      figureType: { kind: 'choice', values: (v: Vars) => [v.type === 'arrows' ? 'ისრები' : 'სამკუთხედები'] },
      figureSingle: { kind: 'choice', values: (v: Vars) => [v.type === 'arrows' ? 'ისარი' : 'ფიგურა'] },
      dir: {
        kind: 'choice',
        values: ['საათის ისრის მიმართულებით', 'საათის ისრის საწინააღმდეგოდ'],
      },
      startIndex: { kind: 'choice', values: [0, 1, 2, 3] },
      seq: {
        kind: 'choice',
        values: (v: Vars) => {
          const clockwise = v.type === 'arrows' ? ['⬆️', '➡️', '⬇️', '⬅️'] : ['🔺', '▶️', '🔻', '◀️'];
          const counter = v.type === 'arrows' ? ['⬆️', '⬅️', '⬇️', '➡️'] : ['🔺', '◀️', '🔻', '▶️'];
          const arr = v.dir === 'საათის ისრის მიმართულებით' ? clockwise : counter;
          const idx = Number(v.startIndex);
          return [`${arr[idx]}, ${arr[(idx + 1) % 4]}, ${arr[(idx + 2) % 4]}`];
        },
      },
    },
    answer: (v: Vars) => {
      const clockwise = v.type === 'arrows' ? ['⬆️', '➡️', '⬇️', '⬅️'] : ['🔺', '▶️', '🔻', '◀️'];
      const counter = v.type === 'arrows' ? ['⬆️', '⬅️', '⬇️', '➡️'] : ['🔺', '◀️', '🔻', '▶️'];
      const arr = v.dir === 'საათის ისრის მიმართულებით' ? clockwise : counter;
      const nextIdx = (Number(v.startIndex) + 3) % 4;
      return arr[nextIdx];
    },
    format: { kind: 'text' },
    options: (v: Vars) => (v.type === 'arrows' ? ['⬆️', '➡️', '⬇️', '⬅️'] : ['🔺', '▶️', '🔻', '◀️']),
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.dir} ბრუნვისას შემდეგი იქნება ${answer}.`,
  }),

  // Q11 — ჩხირებით კვადრატების შედგენა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-11', subtopicId: 'u14-illustrated-patterns', difficulty: 3 }),
    prompt: '1 კვადრატის ასაგებად საჭიროა 4 ჩხირი, 2 შეერთებული კვადრატისთვის — 7 ჩხირი, 3 შეერთებულისთვის — 10 ჩხირი (ყოველ ახალს 3 ჩხირი ემატება). რამდენი ჩხირი დასჭირდება {k} შეერთებული კვადრატის აგებას?',
    variables: {
      k: { kind: 'int', min: 4, max: 18 },
    },
    answer: (v: Vars) => 1 + 3 * Number(v.k),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 3, 4),
    explanation: ({ vars, answer }) =>
      `1 + 3 × ${vars.k} = ${answer} ჩხირი.`,
  }),

  // Q12 — განმეორებადი მიმდევრობის n-ური წევრი (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-12', subtopicId: 'u14-illustrated-patterns', difficulty: 3 }),
    prompt: 'მძივები აკინძულია წესით: {s1}, {s2}, {s3}, {s1}, {s2}, {s3}... რომელი მძივი იქნება რიგით {pos}-ე?',
    variables: {
      set: {
        kind: 'choice',
        values: [
          'წითელი_ლურჯი_მწვანე',
          'თეთრი_შავი_ყვითელი',
          'ოქროსფერი_ვერცხლისფერი_ბრინჯაოსფერი',
          'ვარდისფერი_იისფერი_ცისფერი',
        ],
      },
      s1: { kind: 'choice', values: (v: Vars) => [String(v.set).split('_')[0]] },
      s2: { kind: 'choice', values: (v: Vars) => [String(v.set).split('_')[1]] },
      s3: { kind: 'choice', values: (v: Vars) => [String(v.set).split('_')[2]] },
      pos: { kind: 'choice', values: [13, 14, 15, 16, 17, 18, 19, 20] },
    },
    answer: (v: Vars) => {
      const rem = Number(v.pos) % 3;
      if (rem === 1) return String(v.s1);
      if (rem === 2) return String(v.s2);
      return String(v.s3);
    },
    format: { kind: 'text' },
    options: (v: Vars) => [String(v.s1), String(v.s2), String(v.s3), 'ნარინჯისფერი'],
    optionCount: 4,
    explanation: ({ vars, answer }) => {
      const rem = Number(vars.pos) % 3;
      const place = rem === 0 ? 3 : rem;
      return `${vars.pos} ÷ 3 = ${Math.floor(Number(vars.pos) / 3)} (ნაშთი ${rem}). ნაშთი შეესაბამება ციკლის ${place}-ე ელემენტს, ამიტომ ეს არის ${answer}.`;
    },
  }),

  // =========================================================================
  // SUBTOPIC 3: u14-thought-of-numbers-guessing (ჩაფიქრებული რიცხვები და გამოცნობა)
  // =========================================================================

  // Q13 — შეკრებით ჩაფიქრებული რიცხვი (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-13', subtopicId: 'u14-thought-of-numbers-guessing', difficulty: 1 }),
    prompt: 'ჩავიფიქრე რიცხვი, მივუმატე {add} და მივიღე {sum}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      x: { kind: 'int', min: 10, max: 60 },
      add: { kind: 'int', min: 5, max: 35 },
      sum: { kind: 'choice', values: (v: Vars) => [Number(v.x) + Number(v.add)] },
    },
    answer: (v: Vars) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) =>
      `${vars.sum} − ${vars.add} = ${answer}.`,
  }),

  // Q14 — გამოკლებით ჩაფიქრებული რიცხვი (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-14', subtopicId: 'u14-thought-of-numbers-guessing', difficulty: 1 }),
    prompt: 'ჩავიფიქრე რიცხვი, გამოვაკელი {sub} და მივიღე {diff}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      x: { kind: 'int', min: 25, max: 80 },
      sub: { kind: 'int', min: 6, max: 24 },
      diff: { kind: 'choice', values: (v: Vars) => [Number(v.x) - Number(v.sub)] },
    },
    answer: (v: Vars) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) =>
      `${vars.diff} + ${vars.sub} = ${answer}.`,
  }),

  // Q15 — გამრავლებით ჩაფიქრებული რიცხვი (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-15', subtopicId: 'u14-thought-of-numbers-guessing', difficulty: 2 }),
    prompt: 'ჩავიფიქრე რიცხვი, გავამრავლე {mul}-ზე და მივიღე {prod}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      x: { kind: 'int', min: 3, max: 9 },
      mul: { kind: 'int', min: 3, max: 9 },
      prod: { kind: 'choice', values: (v: Vars) => [Number(v.x) * Number(v.mul)] },
    },
    answer: (v: Vars) => Number(v.x),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.prod} ÷ ${vars.mul} = ${answer}.`,
  }),

  // Q16 — გამრავლება და შეკრება (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-16', subtopicId: 'u14-thought-of-numbers-guessing', difficulty: 2 }),
    prompt: 'ჩავიფიქრე რიცხვი, გავამრავლე {mul}-ზე, შემდეგ მივუმატე {add} და მივიღე {res}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      x: { kind: 'int', min: 2, max: 9 },
      mul: { kind: 'choice', values: [2, 3, 4, 5] },
      add: { kind: 'choice', values: [3, 4, 5, 6, 7, 8] },
      res: { kind: 'choice', values: (v: Vars) => [Number(v.x) * Number(v.mul) + Number(v.add)] },
    },
    answer: (v: Vars) => Number(v.x),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `(${vars.res} − ${vars.add}) ÷ ${vars.mul} = ${Number(vars.res) - Number(vars.add)} ÷ ${vars.mul} = ${answer}.`,
  }),

  // Q17 — გამრავლება და გამოკლება (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-17', subtopicId: 'u14-thought-of-numbers-guessing', difficulty: 3 }),
    prompt: 'ჩავიფიქრე რიცხვი, გავამრავლე {mul}-ზე, შემდეგ გამოვაკელი {sub} და მივიღე {res}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      x: { kind: 'int', min: 3, max: 9 },
      mul: { kind: 'choice', values: [3, 4, 5, 6] },
      sub: { kind: 'choice', values: [4, 5, 6, 7, 8] },
      res: { kind: 'choice', values: (v: Vars) => [Number(v.x) * Number(v.mul) - Number(v.sub)] },
    },
    answer: (v: Vars) => Number(v.x),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `(${vars.res} + ${vars.sub}) ÷ ${vars.mul} = ${Number(vars.res) + Number(vars.sub)} ÷ ${vars.mul} = ${answer}.`,
  }),

  // Q18 — შეკრება და გაყოფა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-18', subtopicId: 'u14-thought-of-numbers-guessing', difficulty: 3 }),
    prompt: 'ჩავიფიქრე რიცხვი, მივუმატე {add}, მიღებული ჯამი გავყავი {div}-ზე და მივიღე {res}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      div: { kind: 'choice', values: [2, 3, 4, 5] },
      res: { kind: 'choice', values: [6, 7, 8, 9, 10, 11, 12] },
      add: { kind: 'choice', values: [2, 3, 4, 5, 6] },
      x: { kind: 'choice', values: (v: Vars) => [Number(v.res) * Number(v.div) - Number(v.add)] },
    },
    answer: (v: Vars) => Number(v.x),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) =>
      `(${vars.res} × ${vars.div}) − ${vars.add} = ${Number(vars.res) * Number(vars.div)} − ${vars.add} = ${answer}.`,
  }),

  // =========================================================================
  // SUBTOPIC 4: u14-age-problems-word-coding (ასაკის ამოცანები და სიტყვების კოდირება)
  // =========================================================================

  // Q19 — ასაკობრივი სხვაობა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-19', subtopicId: 'u14-age-problems-word-coding', difficulty: 1 }),
    prompt: '{c1} არის {age} წლის. მისი და {c2} მასზე {diff} წლით უმცროსია. რამდენი წლისაა {c2}?',
    variables: {
      names: {
        kind: 'choice',
        values: [
          'ანა_ნინო',
          'მარიამი_ელენე',
          'გიორგი_ლუკა',
          'ნიკო_სანდრო',
          'დავითი_ოთარი',
        ],
      },
      c1: { kind: 'choice', values: (v: Vars) => [String(v.names).split('_')[0]] },
      c2: { kind: 'choice', values: (v: Vars) => [String(v.names).split('_')[1]] },
      age: { kind: 'int', min: 9, max: 15 },
      diff: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v: Vars) => Number(v.age) - Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.age} − ${vars.diff} = ${answer} წლის.`,
  }),

  // Q20 — ასაკი მომავალში (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-20', subtopicId: 'u14-age-problems-word-coding', difficulty: 1 }),
    prompt: '{child} ახლა არის {age} წლის. რამდენი წლის იქნება ის {years} წლის შემდეგ?',
    variables: {
      child: { kind: 'choice', values: ['ლუკა', 'სანდრო', 'მარიამი', 'ანა', 'ნიკა', 'გიორგი'] },
      age: { kind: 'int', min: 7, max: 12 },
      years: { kind: 'int', min: 3, max: 8 },
    },
    answer: (v: Vars) => Number(v.age) + Number(v.years),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.age} + ${vars.years} = ${answer} წლის.`,
  }),

  // Q21 — ასაკობრივი სხვაობის მუდმივობა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-21', subtopicId: 'u14-age-problems-word-coding', difficulty: 2 }),
    prompt: '{c1} არის {age1} წლის, ხოლო მისი ძმა {c2} — {age2} წლის. რამდენი წლით იქნება {c1} ძმაზე უფროსი {later} წლის შემდეგ?',
    variables: {
      names: {
        kind: 'choice',
        values: [
          'გიორგი_ნიკა',
          'ლუკა_სანდრო',
          'დავითი_თემო',
          'ირაკლი_ოთარი',
          'ილია_საბა',
        ],
      },
      c1: { kind: 'choice', values: (v: Vars) => [String(v.names).split('_')[0]] },
      c2: { kind: 'choice', values: (v: Vars) => [String(v.names).split('_')[1]] },
      age2: { kind: 'int', min: 6, max: 10 },
      diff: { kind: 'choice', values: [3, 4, 5, 6, 7] },
      later: { kind: 'choice', values: [4, 5, 6, 8, 10] },
      age1: { kind: 'choice', values: (v: Vars) => [Number(v.age2) + Number(v.diff)] },
    },
    answer: (v: Vars) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `ასაკობრივი სხვაობა წლების გასვლასთან ერთად არ იცვლება: ${vars.age1} − ${vars.age2} = ${answer} წლით.`,
  }),

  // Q22 — სიტყვების კოდირება (შებრუნება) (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-22', subtopicId: 'u14-age-problems-word-coding', difficulty: 2 }),
    prompt: 'საიდუმლო ენაზე სიტყვა „{sample}“ ჩაიწერა როგორც „{codedSample}“ (ასოების უკუღმა დალაგებით). როგორ ჩაიწერება სიტყვა „{target}“?',
    variables: {
      pair: {
        kind: 'choice',
        values: [
          'მზე_ეზმ_მთვარე_ერავთმ',
          'წყალი_ილაყწ_ცეცხლი_ილხცეც',
          'წიგნი_ინგით_რვეული_ილუევრ',
          'ბაღი_იღაბ_სკოლა_ალოკს',
          'ვაშლი_ილშავ_მსხალი_ილახსმ',
          'ვარსკვლავი_ივალვკსრავ_ცა_აც',
          'მთა_ათმ_ბარი_ირაბ',
          'ზღვა_ავღზ_ტბა_აბტ',
          'ქარი_ირაქ_წვიმა_ამივწ',
          'დღე_ეღდ_ღამე_ემაღ',
          'გაზაფხული_ილუხფაზაგ_ზამთარი_ირათმაზ',
          'ტყე_ეყტ_ველი_ილევ',
          'კალამი_იმალაქ_ფანქარი_ირაქნაფ',
          'სახლი_ილხას_ქალაქი_იქალაქ',
        ],
      },
      sample: { kind: 'choice', values: (v: Vars) => [String(v.pair).split('_')[0]] },
      codedSample: { kind: 'choice', values: (v: Vars) => [String(v.pair).split('_')[1]] },
      target: { kind: 'choice', values: (v: Vars) => [String(v.pair).split('_')[2]] },
      codedTarget: { kind: 'choice', values: (v: Vars) => [String(v.pair).split('_')[3]] },
    },
    answer: (v: Vars) => String(v.codedTarget),
    format: { kind: 'text' },
    options: (v: Vars) => {
      const correct = String(v.codedTarget);
      const normal = String(v.target);
      const halfRev = normal.slice(1) + normal[0];
      const revHalf = normal[normal.length - 1] + normal.slice(0, -1);
      return [correct, normal, halfRev, revHalf];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `სიტყვა „${vars.target}“ ასოების შებრუნებით იკითხება როგორც „${answer}“.`,
  }),

  // Q23 — ჯერადი ასაკობრივი დამოკიდებულება (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-23', subtopicId: 'u14-age-problems-word-coding', difficulty: 3 }),
    prompt: 'მამა არის {fatherAge} წლის. შვილი მასზე {times}-ჯერ უმცროსია. რამდენი წლისაა შვილი?',
    variables: {
      childAge: { kind: 'choice', values: [7, 8, 9, 10, 11] },
      times: { kind: 'choice', values: [3, 4, 5] },
      fatherAge: { kind: 'choice', values: (v: Vars) => [Number(v.childAge) * Number(v.times)] },
    },
    answer: (v: Vars) => Number(v.childAge),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.fatherAge} ÷ ${vars.times} = ${answer} წლის.`,
  }),

  // Q24 — ასაკთა ჯამი მომავალში (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-24', subtopicId: 'u14-age-problems-word-coding', difficulty: 3 }),
    prompt: '{c1} არის {age1} წლის, ხოლო {c2} — {age2} წლის. რა იქნება მათი ასაკების ჯამი {years} წლის შემდეგ?',
    variables: {
      pair: {
        kind: 'choice',
        values: [
          'ანა_ნინო',
          'მარიამი_ლუკა',
          'გიორგი_სანდრო',
          'ნიკო_ელენე',
        ],
      },
      c1: { kind: 'choice', values: (v: Vars) => [String(v.pair).split('_')[0]] },
      c2: { kind: 'choice', values: (v: Vars) => [String(v.pair).split('_')[1]] },
      age1: { kind: 'choice', values: [8, 9, 10] },
      age2: { kind: 'choice', values: [6, 7, 8] },
      years: { kind: 'choice', values: [3, 4, 5] },
    },
    answer: (v: Vars) => Number(v.age1) + Number(v.age2) + 2 * Number(v.years),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) =>
      `თითოეულის ასაკი მოიმატებს ${vars.years} წლით: (${vars.age1} + ${vars.years}) + (${vars.age2} + ${vars.years}) = ${answer} წელი.`,
  }),

  // =========================================================================
  // SUBTOPIC 5: u14-interval-problems-color-choices (შუალედები და ფერის არჩევა)
  // =========================================================================

  // Q25 — ხეებს შორის შუალედების დათვლა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-25', subtopicId: 'u14-interval-problems-color-choices', difficulty: 1 }),
    prompt: 'სწორ ბილიკზე ერთ მწკრივად დარგულია {trees} ხე. რამდენი შუალედია (დაშორებაა) მეზობელ ხეებს შორის?',
    variables: {
      trees: { kind: 'int', min: 5, max: 20 },
    },
    answer: (v: Vars) => Number(v.trees) - 1,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `სწორ ხაზზე ${vars.trees} ხეს შორის არის ${vars.trees} − 1 = ${answer} შუალედი.`,
  }),

  // Q26 — გადაჭრით ნაწილების მიღება (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-26', subtopicId: 'u14-interval-problems-color-choices', difficulty: 1 }),
    prompt: 'თოკის ნაჭერი {cuts} ადგილას გადაჭრეს. სულ რამდენ ნაწილად დაიყო თოკი?',
    variables: {
      cuts: { kind: 'int', min: 3, max: 18 },
    },
    answer: (v: Vars) => Number(v.cuts) + 1,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.cuts} გადაჭრა იძლევა ${vars.cuts} + 1 = ${answer} ნაწილს.`,
  }),

  // Q27 — მანძილი პირველიდან ბოლო ხემდე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-27', subtopicId: 'u14-interval-problems-color-choices', difficulty: 2 }),
    prompt: 'სწორ ბილიკზე დარგულია {trees} ხე. მეზობელ ხეებს შორის მანძილია {dist} მეტრი. რა არის მანძილი პირველი ხიდან ბოლო ხემდე?',
    variables: {
      trees: { kind: 'choice', values: [5, 6, 7, 8, 9, 10] },
      dist: { kind: 'choice', values: [2, 3, 4, 5] },
    },
    answer: (v: Vars) => (Number(v.trees) - 1) * Number(v.dist),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) =>
      `სულ არის ${Number(vars.trees) - 1} შუალედი: (${vars.trees} − 1) × ${vars.dist} = ${answer} მეტრი.`,
  }),

  // Q28 — შუალედში მოთავსებული ჯერადი რიცხვი (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-28', subtopicId: 'u14-interval-problems-color-choices', difficulty: 2 }),
    prompt: 'რომელი რიცხვია მოთავსებული {low}-სა და {high}-ს შორის და ამავდროულად უნაშთოდ იყოფა {div}-ზე?',
    variables: {
      div: { kind: 'choice', values: [4, 5, 6, 7] },
      k: { kind: 'choice', values: [5, 6, 7, 8, 9] },
      target: { kind: 'choice', values: (v: Vars) => [Number(v.div) * Number(v.k)] },
      low: { kind: 'choice', values: (v: Vars) => [Number(v.target) - 2] },
      high: { kind: 'choice', values: (v: Vars) => [Number(v.target) + Number(v.div) - 1] },
    },
    answer: (v: Vars) => Number(v.target),
    format: { kind: 'text' },
    options: (v: Vars) => {
      const ans = Number(v.target);
      return [String(ans), String(ans - 3), String(ans + 3), String(ans - Number(v.div))];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${answer} მოთავსებულია ${vars.low}-სა და ${vars.high}-ს შორის და იყოფა ${vars.div}-ზე.`,
  }),

  // Q29 — წრიული შუალედები (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-29', subtopicId: 'u14-interval-problems-color-choices', difficulty: 3 }),
    prompt: 'წრიული მოედნის გარშემო ჩასმულია {posts} ბოძი. რამდენი შუალედია ბოძებს შორის?',
    variables: {
      posts: { kind: 'int', min: 6, max: 20 },
    },
    answer: (v: Vars) => Number(v.posts),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars: _vars, answer }) =>
      `წრიულ ხაზზე შუალედების რაოდენობა ბოძების რაოდენობის ტოლია: ${answer} შუალედი.`,
  }),

  // Q30 — დირიხლეს პრინციპი ფერების არჩევაში (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-30', subtopicId: 'u14-interval-problems-color-choices', difficulty: 3 }),
    prompt: '{container}-ში დევს {r} წითელი და {b} ლურჯი {item}. ყველაზე ცოტა რამდენი ცალი უნდა ამოვიღოთ დაუხედავად, რომ გარანტირებულად გვქონდეს ერთი და იმავე ფერის 2 {item}?',
    variables: {
      container: { kind: 'choice', values: ['ყუთში', 'პარკში', 'კალათაში', 'უჯრაში'] },
      item: { kind: 'choice', values: ['ფანქარი', 'ბურთი', 'წინდა', 'ბურთულა'] },
      r: { kind: 'choice', values: [5, 6, 7, 8] },
      b: { kind: 'choice', values: [5, 6, 7, 8] },
    },
    answer: () => '3 ცალი',
    format: { kind: 'text' },
    options: () => ['3 ცალი', '2 ცალი', '4 ცალი', '5 ცალი'],
    optionCount: 4,
    explanation: () =>
      'სულ 2 ფერია (წითელი და ლურჯი). ყველაზე ცუდ შემთხვევაში 2 ამოღებული სხვადასხვა ფერისაა, ამიტომ მე-3 აუცილებლად გაიმეორებს ერთ-ერთ ფერს. პასუხია 3 ცალი.',
  }),

  // =========================================================================
  // SUBTOPIC 6: u14-elimination-logic-grids (გამორიცხვის მეთოდები და ლოგიკური ბადეები)
  // =========================================================================

  // Q31 — ზედმეტი რიცხვი (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-31', subtopicId: 'u14-elimination-logic-grids', difficulty: 1 }),
    prompt: 'ჩამოთვლილთაგან რომელი რიცხვია ზედმეტი (არ შეესაბამება დანარჩენებს): {n1}, {n2}, {n3}, {n4}?',
    variables: {
      k: { kind: 'int', min: 5, max: 25 },
      odd: { kind: 'choice', values: (v: Vars) => [Number(v.k) * 2 + 1] },
      e1: { kind: 'choice', values: (v: Vars) => [Number(v.k) * 2] },
      e2: { kind: 'choice', values: (v: Vars) => [Number(v.k) * 2 + 2] },
      e3: { kind: 'choice', values: (v: Vars) => [Number(v.k) * 2 + 4] },
      n1: { kind: 'choice', values: (v: Vars) => [String(v.e1)] },
      n2: { kind: 'choice', values: (v: Vars) => [String(v.odd)] },
      n3: { kind: 'choice', values: (v: Vars) => [String(v.e2)] },
      n4: { kind: 'choice', values: (v: Vars) => [String(v.e3)] },
    },
    answer: (v: Vars) => Number(v.odd),
    format: { kind: 'text' },
    options: (v: Vars) => [String(v.odd), String(v.e1), String(v.e2), String(v.e3)],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${answer} არის კენტი, ხოლო დანარჩენი სამი რიცხვი (${vars.e1}, ${vars.e2}, ${vars.e3}) ლუწია.`,
  }),

  // Q32 — ზედმეტი ფიგურა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-32', subtopicId: 'u14-elimination-logic-grids', difficulty: 1 }),
    prompt: '{intro} ფიგურებს შორის ({list}) რომელია ზედმეტი?',
    variables: {
      intro: { kind: 'choice', values: ['მოცემულ', 'ჩამოთვლილ'] },
      group: {
        kind: 'choice',
        values: [
          'სამკუთხედი_კვადრატი_მართკუთხედი_რომბი_სამკუთხედი_3 გვერდი აქვს',
          'წრე_კვადრატი_სამკუთხედი_ხუთკუთხედი_წრე_არ აქვს კუთხეები',
          'ხუთკუთხედი_კვადრატი_მართკუთხედი_ტრაპეცია_ხუთკუთხედი_5 გვერდი აქვს',
          'სამკუთხედი_ტრაპეცია_რომბი_კვადრატი_სამკუთხედი_3 გვერდი აქვს',
          'წრე_რომბი_მართკუთხედი_ტრაპეცია_წრე_არ აქვს წვეროები',
          'ექვსკუთხედი_კვადრატი_მართკუთხედი_რომბი_ექვსკუთხედი_6 გვერდი აქვს',
          'სამკუთხედი_პარალელოგრამი_კვადრატი_მართკუთხედი_სამკუთხედი_3 გვერდი აქვს',
          'წრე_სამკუთხედი_მართკუთხედი_კვადრატი_წრე_მრგვალია და არ აქვს გვერდები',
        ],
      },
      list: {
        kind: 'choice',
        values: (v: Vars) => {
          const parts = String(v.group).split('_');
          return [`${parts[0]}, ${parts[1]}, ${parts[2]}, ${parts[3]}`];
        },
      },
      ans: { kind: 'choice', values: (v: Vars) => [String(v.group).split('_')[4]] },
      reason: { kind: 'choice', values: (v: Vars) => [String(v.group).split('_')[5]] },
    },
    answer: (v: Vars) => String(v.ans),
    format: { kind: 'text' },
    options: (v: Vars) => {
      const parts = String(v.group).split('_');
      return [parts[4], parts[1], parts[2], parts[3]];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${answer} არის ზედმეტი, რადგან ${vars.reason}.`,
  }),

  // Q33 — გამორიცხვა: მაისურის ფერი (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-33', subtopicId: 'u14-elimination-logic-grids', difficulty: 2 }),
    prompt: '{c1}-ს, {c2}-სა და {c3}-ს აცვიათ {col1}, {col2} და {col3} მაისურები. ცნობილია, რომ {c1}-ს არ აცვია არც {col1} და არც {col2}. რა ფერის მაისური აცვია {c1}-ს?',
    variables: {
      triad: {
        kind: 'choice',
        values: [
          'ანი_ნინო_მარიამი',
          'გიორგი_ლუკა_სანდრო',
          'ნიკო_დათო_თემო',
          'ელენე_სალომე_ლილე',
          'დავითი_ირაკლი_ზურა',
          'თამარი_ქეთი_ნატა',
        ],
      },
      c1: { kind: 'choice', values: (v: Vars) => [String(v.triad).split('_')[0]] },
      c2: { kind: 'choice', values: (v: Vars) => [String(v.triad).split('_')[1]] },
      c3: { kind: 'choice', values: (v: Vars) => [String(v.triad).split('_')[2]] },
      colorSet: {
        kind: 'choice',
        values: [
          'წითელი_მწვანე_ყვითელი',
          'ლურჯი_თეთრი_შავი',
          'ვარდისფერი_იისფერი_ნარინჯისფერი',
        ],
      },
      col1: { kind: 'choice', values: (v: Vars) => [String(v.colorSet).split('_')[0]] },
      col2: { kind: 'choice', values: (v: Vars) => [String(v.colorSet).split('_')[1]] },
      col3: { kind: 'choice', values: (v: Vars) => [String(v.colorSet).split('_')[2]] },
    },
    answer: (v: Vars) => String(v.col3),
    format: { kind: 'text' },
    options: (v: Vars) => [String(v.col3), String(v.col1), String(v.col2), 'ცისფერი'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `რადგან ${vars.c1}-ს არ აცვია ${vars.col1} და არც ${vars.col2}, მას აცვია ${answer} მაისური.`,
  }),

  // Q34 — 2x2 ბადე გამორიცხვით (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-34', subtopicId: 'u14-elimination-logic-grids', difficulty: 2 }),
    prompt: '{c1} და {c2} დაკავებული არიან {s1}-ითა და {s2}-ით. ცნობილია, რომ {c1} არ არის დაკავებული {s1}-ით. რომელი საქმიანობით არის დაკავებული {c1}?',
    variables: {
      pair: {
        kind: 'choice',
        values: [
          'ლუკა_გიორგი',
          'სანდრო_ნიკა',
          'ანი_მარიამი',
          'დავითი_თემო',
          'ნინო_ელენე',
          'ოთარი_ილია',
        ],
      },
      c1: { kind: 'choice', values: (v: Vars) => [String(v.pair).split('_')[0]] },
      c2: { kind: 'choice', values: (v: Vars) => [String(v.pair).split('_')[1]] },
      activities: {
        kind: 'choice',
        values: [
          'ცურვა_ჭადრაკი',
          'ფეხბურთი_კალათბურთი',
          'ხატვა_მუსიკა',
          'ცეკვა_ტანვარჯიში',
        ],
      },
      s1: { kind: 'choice', values: (v: Vars) => [String(v.activities).split('_')[0]] },
      s2: { kind: 'choice', values: (v: Vars) => [String(v.activities).split('_')[1]] },
    },
    answer: (v: Vars) => String(v.s2),
    format: { kind: 'text' },
    options: (v: Vars) => [String(v.s2), String(v.s1), 'ჩოგბურთი', 'სირბილი'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `გამორიცხვის მეთოდით: რადგან ${vars.c1} არ არის დაკავებული ${vars.s1}-ით, მისი საქმიანობაა ${answer}.`,
  }),

  // Q35 — 3-კაციანი ლოგიკური განაწილება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-35', subtopicId: 'u14-elimination-logic-grids', difficulty: 3 }),
    prompt: 'სამი მეგობარი — {c1}, {c2} და {c3} — სწავლობს სხვადასხვა {topic}: {item1}, {item2} და {item3}. {c1} არ სწავლობს {item1}-ს და არც {item2}-ს. {c2} არ სწავლობს {item1}-ს. რომელ საგანს სწავლობს {c2}?',
    variables: {
      triad: {
        kind: 'choice',
        values: [
          'ანა_ნინო_მარიამი',
          'გიორგი_ლუკა_სანდრო',
          'ნიკო_დავითი_ოთარი',
          'ელენე_თამარი_ლილე',
        ],
      },
      c1: { kind: 'choice', values: (v: Vars) => [String(v.triad).split('_')[0]] },
      c2: { kind: 'choice', values: (v: Vars) => [String(v.triad).split('_')[1]] },
      c3: { kind: 'choice', values: (v: Vars) => [String(v.triad).split('_')[2]] },
      domain: {
        kind: 'choice',
        values: [
          'ინსტრუმენტზე_ფორტეპიანო_ვიოლინო_გიტარა',
          'უცხო ენას_ინგლისური_გერმანული_ფრანგული',
          'სპორტულ წრეზე_ცურვა_ტანვარჯიში_კარატე',
          'თამაშს_ჭადრაკი_შაში_ნარდი',
        ],
      },
      topic: { kind: 'choice', values: (v: Vars) => [String(v.domain).split('_')[0]] },
      item1: { kind: 'choice', values: (v: Vars) => [String(v.domain).split('_')[1]] },
      item2: { kind: 'choice', values: (v: Vars) => [String(v.domain).split('_')[2]] },
      item3: { kind: 'choice', values: (v: Vars) => [String(v.domain).split('_')[3]] },
    },
    answer: (v: Vars) => String(v.item2),
    format: { kind: 'text' },
    options: (v: Vars) => [String(v.item2), String(v.item1), String(v.item3), 'ჩოგბურთი'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.c1} სწავლობს ${vars.item3}-ს. დარჩა ${vars.item1} და ${vars.item2}. რადგან ${vars.c2} არ სწავლობს ${vars.item1}-ს, ის სწავლობს ${answer}-ს.`,
  }),

  // Q36 — ცხოველების განაწილება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-36', subtopicId: 'u14-elimination-logic-grids', difficulty: 3 }),
    prompt: '{c1}-ს, {c2}-სა და {c3}-ს ჰყავთ {p1}, {p2} და {p3}. {c1}-ს არ ჰყავს {p3} და არც {p2}. {c2}-ს არ ჰყავს {p3}. ვინ ჰყავს {c3}-ს?',
    variables: {
      triad: {
        kind: 'choice',
        values: [
          'სანდრო_ლუკა_გიორგი',
          'ნიკა_დათო_ირაკლი',
          'მარიამი_ანი_ნინო',
          'თამარი_ელენე_სალომე',
        ],
      },
      c1: { kind: 'choice', values: (v: Vars) => [String(v.triad).split('_')[0]] },
      c2: { kind: 'choice', values: (v: Vars) => [String(v.triad).split('_')[1]] },
      c3: { kind: 'choice', values: (v: Vars) => [String(v.triad).split('_')[2]] },
      petSet: {
        kind: 'choice',
        values: [
          'ძაღლი_კატა_თუთიყუში',
          'ზაზუნა_კუ_კურდღელი',
          'თევზი_კატა_ზაზუნა',
        ],
      },
      p1: { kind: 'choice', values: (v: Vars) => [String(v.petSet).split('_')[0]] },
      p2: { kind: 'choice', values: (v: Vars) => [String(v.petSet).split('_')[1]] },
      p3: { kind: 'choice', values: (v: Vars) => [String(v.petSet).split('_')[2]] },
    },
    answer: (v: Vars) => String(v.p3),
    format: { kind: 'text' },
    options: (v: Vars) => [String(v.p3), String(v.p1), String(v.p2), 'ცხენი'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.c1}-ს ჰყავს ${vars.p1}. რადგან ${vars.c2}-ს არ ჰყავს ${vars.p3}, მას ჰყავს ${vars.p2}. მაშასადამე, ${vars.c3}-ს ჰყავს ${answer}.`,
  }),

  // =========================================================================
  // SUBTOPIC 7: u14-balance-scale-reasoning (სასწორის ლოგიკა)
  // =========================================================================

  // Q37 — არათანაბარი სასწორი (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-37', subtopicId: 'u14-balance-scale-reasoning', difficulty: 1 }),
    prompt: 'სასწორის მარცხენა თეფშზე დევს {w1} კგ, ხოლო მარჯვენაზე — {w2} კგ. რომელი თეფში დაიწევს ქვემოთ (უფრო მძიმეა)?',
    variables: {
      w1: { kind: 'choice', values: [12, 15, 18, 22, 25, 30] },
      diff: { kind: 'choice', values: [-5, -3, 3, 5, 7] },
      w2: { kind: 'choice', values: (v: Vars) => [Number(v.w1) + Number(v.diff)] },
    },
    answer: (v: Vars) => (Number(v.w1) > Number(v.w2) ? 'მარცხენა თეფში' : 'მარჯვენა თეფში'),
    format: { kind: 'text' },
    options: () => ['მარცხენა თეფში', 'მარჯვენა თეფში', 'სასწორი გაწონასწორებულია', 'შეუძლებელია დადგენა'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${Math.max(Number(vars.w1), Number(vars.w2))} კგ > ${Math.min(Number(vars.w1), Number(vars.w2))} კგ, ამიტომ ქვემოთ დაიწევს ${answer}.`,
  }),

  // Q38 — სასწორის გაწონასწორება (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-38', subtopicId: 'u14-balance-scale-reasoning', difficulty: 1 }),
    prompt: 'სასწორი გაწონასწორებულია. მარცხენა თეფშზე დევს {left} კგ ტვირთი, ხოლო მარჯვენაზე — {right} კგ და ერთი საწონი. რამდენი კგ-ია ეს საწონი?',
    variables: {
      right: { kind: 'int', min: 10, max: 40 },
      diff: { kind: 'int', min: 3, max: 15 },
      left: { kind: 'choice', values: (v: Vars) => [Number(v.right) + Number(v.diff)] },
    },
    answer: (v: Vars) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.left} − ${vars.right} = ${answer} კგ.`,
  }),

  // Q39 — რამდენიმე ერთნაირი საგანი სასწორზე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-39', subtopicId: 'u14-balance-scale-reasoning', difficulty: 2 }),
    prompt: 'სასწორი გაწონასწორებულია: მარცხენა თეფშზე დევს {n} ერთნაირი ვაშლი, მარჯვენაზე — {weight} გრამიანი საწონი. რამდენი გრამია 1 ვაშლი?',
    variables: {
      n: { kind: 'choice', values: [2, 3, 4, 5] },
      unitWeight: { kind: 'choice', values: [60, 70, 80, 90, 100] },
      weight: { kind: 'choice', values: (v: Vars) => [Number(v.n) * Number(v.unitWeight)] },
    },
    answer: (v: Vars) => Number(v.unitWeight),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) =>
      `${vars.weight} ÷ ${vars.n} = ${answer} გრამი.`,
  }),

  // Q40 — საგანი + საწონი (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-40', subtopicId: 'u14-balance-scale-reasoning', difficulty: 2 }),
    prompt: 'სასწორის ერთ თეფშზე დევს 1 საზამთრო და {w1} კგ საწონი, მეორე თეფშზე — {w2} კგ საწონი. სასწორი გაწონასწორებულია. რამდენი კგ-ია საზამთრო?',
    variables: {
      w1: { kind: 'int', min: 2, max: 6 },
      melon: { kind: 'int', min: 4, max: 12 },
      w2: { kind: 'choice', values: (v: Vars) => [Number(v.w1) + Number(v.melon)] },
    },
    answer: (v: Vars) => Number(v.melon),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.w2} − ${vars.w1} = ${answer} კგ.`,
  }),

  // Q41 — ტოლფასობის გადატანა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-41', subtopicId: 'u14-balance-scale-reasoning', difficulty: 3 }),
    prompt: '1 ნესვის წონა უდრის {n} ვაშლის წონას. 1 ვაშლი იწონის {w} გრამს. რამდენი გრამია 1 ნესვი?',
    variables: {
      n: { kind: 'choice', values: [3, 4, 5, 6] },
      w: { kind: 'choice', values: [80, 100, 120, 150] },
    },
    answer: (v: Vars) => Number(v.n) * Number(v.w),
    format: { kind: 'integer', min: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 50, 100),
    explanation: ({ vars, answer }) =>
      `${vars.n} × ${vars.w} = ${answer} გრამი.`,
  }),

  // Q42 — ორი ერთნაირი ყუთი სასწორზე (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-42', subtopicId: 'u14-balance-scale-reasoning', difficulty: 3 }),
    prompt: 'სასწორის მარცხენა მხარეს დევს 2 ერთნაირი ყუთი და {w1} კგ საწონი, ხოლო მარჯვენა მხარეს — {w2} კგ საწონი. სასწორი გაწონასწორებულია. რამდენი კგ-ია თითოეული ყუთი?',
    variables: {
      box: { kind: 'choice', values: [3, 4, 5, 6, 7, 8] },
      w1: { kind: 'choice', values: [2, 4, 6] },
      w2: { kind: 'choice', values: (v: Vars) => [2 * Number(v.box) + Number(v.w1)] },
    },
    answer: (v: Vars) => Number(v.box),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `2 ყუთის წონაა ${vars.w2} − ${vars.w1} = ${Number(vars.w2) - Number(vars.w1)} კგ. თითოეული ყუთია ${Number(vars.w2) - Number(vars.w1)} ÷ 2 = ${answer} კგ.`,
  }),

  // =========================================================================
  // SUBTOPIC 8: u14-condition-matching-elimination (პირობების შეხამება და რთული გამორიცხვა)
  // =========================================================================

  // Q43 — ციფრებით ორნიშნა რიცხვის ამოცნობა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-43', subtopicId: 'u14-condition-matching-elimination', difficulty: 1 }),
    prompt: 'რომელია ორნიშნა რიცხვი, რომლის ათეულების ციფრია {tens} და ერთეულების ციფრია {ones}?',
    variables: {
      tens: { kind: 'choice', values: [4, 5, 6, 7, 8] },
      ones: { kind: 'choice', values: [2, 3, 5, 7, 9] },
    },
    answer: (v: Vars) => `${v.tens}${v.ones}`,
    format: { kind: 'text' },
    options: (v: Vars) => [`${v.tens}${v.ones}`, `${v.ones}${v.tens}`, `${v.tens}0`, `${v.ones}0`],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.tens} ათეული და ${vars.ones} ერთეული შეადგენს რიცხვს ${answer}.`,
  }),

  // Q44 — ლუწი რიცხვი ზღვარზე მეტი (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-44', subtopicId: 'u14-condition-matching-elimination', difficulty: 1 }),
    prompt: 'ჩამოთვლილთაგან რომელი რიცხვია ლუწი და ამავდროულად მეტია {limit}-ზე?',
    variables: {
      limit: { kind: 'choice', values: [45, 55, 65, 75, 85] },
      diff: { kind: 'choice', values: [2, 4, 6] },
      ans: { kind: 'choice', values: (v: Vars) => [Number(v.limit) + Number(v.diff) + (Number(v.limit) % 2 === 0 ? 0 : 1)] },
    },
    answer: (v: Vars) => Number(v.ans),
    format: { kind: 'text' },
    options: (v: Vars) => {
      const correct = Number(v.ans);
      const optOddBig = correct + 1;
      const optEvenSmall = Number(v.limit) - 2;
      const optOddSmall = Number(v.limit) - 3;
      return [String(correct), String(optOddBig), String(optEvenSmall), String(optOddSmall)];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${answer} არის ლუწი და მეტია ${vars.limit}-ზე.`,
  }),

  // Q45 — კენტი რიცხვი შუალედში (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-45', subtopicId: 'u14-condition-matching-elimination', difficulty: 2 }),
    prompt: 'რომელია კენტი რიცხვი, რომელიც მოთავსებულია {low}-სა და {high}-ს შორის?',
    variables: {
      base: { kind: 'int', min: 20, max: 70 },
      target: { kind: 'choice', values: (v: Vars) => [Number(v.base) * 2 + 1] },
      low: { kind: 'choice', values: (v: Vars) => [Number(v.target) - 2] },
      high: { kind: 'choice', values: (v: Vars) => [Number(v.target) + 2] },
    },
    answer: (v: Vars) => Number(v.target),
    format: { kind: 'text' },
    options: (v: Vars) => {
      const ans = Number(v.target);
      return [String(ans), String(ans - 1), String(ans + 1), String(ans + 3)];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${answer} არის კენტი და მოთავსებულია ${vars.low}-სა და ${vars.high}-ს შორის.`,
  }),

  // Q46 — 5-ის ჯერადი და ლუწი (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-46', subtopicId: 'u14-condition-matching-elimination', difficulty: 2 }),
    prompt: '{limit}-ზე ნაკლები რომელი რიცხვი იყოფა 5-ზე და ამავე დროს არის ლუწი?',
    variables: {
      k: { kind: 'int', min: 2, max: 15 },
      target: { kind: 'choice', values: (v: Vars) => [Number(v.k) * 10] },
      limit: { kind: 'choice', values: (v: Vars) => [Number(v.target) + 5] },
    },
    answer: (v: Vars) => Number(v.target),
    format: { kind: 'text' },
    options: (v: Vars) => {
      const ans = Number(v.target);
      return [String(ans), String(ans + 5), String(ans + 2), String(ans - 3)];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${answer} ნაკლებია ${vars.limit}-ზე, იყოფა 5-ზე და ლუწია (ბოლოვდება 0-ით).`,
  }),

  // Q47 — ციფრთა ჯამით გამოცნობა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-47', subtopicId: 'u14-condition-matching-elimination', difficulty: 3 }),
    prompt: 'რომელია ორნიშნა რიცხვი, რომლის ციფრთა ჯამია {digitSum} და ათეულების ციფრია {tens}?',
    variables: {
      tens: { kind: 'choice', values: [3, 4, 5, 6, 7] },
      ones: { kind: 'choice', values: [2, 3, 4, 5, 6] },
      digitSum: { kind: 'choice', values: (v: Vars) => [Number(v.tens) + Number(v.ones)] },
    },
    answer: (v: Vars) => `${v.tens}${v.ones}`,
    format: { kind: 'text' },
    options: (v: Vars) => {
      const correct = `${v.tens}${v.ones}`;
      const rev = `${v.ones}${v.tens}`;
      const d1 = `${Number(v.tens) + 1}${Number(v.ones) - 1}`;
      const d2 = `${v.tens}${Number(v.ones) + 1}`;
      const set = new Set([correct, rev, d1, d2]);
      if (set.size < 4) set.add(`${Number(v.tens) - 1}${v.ones}`);
      return Array.from(set).slice(0, 4);
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `ათეულების ციფრია ${vars.tens}. ერთეულებია ${vars.digitSum} − ${vars.tens} = ${vars.ones}. რიცხვია ${answer}.`,
  }),

  // Q48 — მრავალპირობიანი ლოგიკური ამოცნობა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-48', subtopicId: 'u14-condition-matching-elimination', difficulty: 3 }),
    prompt: 'ჩავიფიქრე რიცხვი {low}-დან {high}-მდე. ის არის კენტი, მეტია {mid}-ზე და იყოფა 5-ზე. რომელია ეს რიცხვი?',
    variables: {
      k: { kind: 'choice', values: [3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25] },
      target: { kind: 'choice', values: (v: Vars) => [Number(v.k) * 5] },
      low: { kind: 'choice', values: (v: Vars) => [Number(v.target) - 8] },
      mid: { kind: 'choice', values: (v: Vars) => [Number(v.target) - 3] },
      high: { kind: 'choice', values: (v: Vars) => [Number(v.target) + 6] },
    },
    answer: (v: Vars) => Number(v.target),
    format: { kind: 'text' },
    options: (v: Vars) => {
      const ans = Number(v.target);
      return [String(ans), String(ans - 5), String(ans + 2), String(ans - 2)];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${answer} არის კენტი, მეტია ${vars.mid}-ზე და იყოფა 5-ზე.`,
  }),

  // =========================================================================
  // SUBTOPIC 9: u14-sorting-largest-smallest (უდიდესისა და უმცირესის დალაგება)
  // =========================================================================

  // Q49 — უდიდესი 4 რიცხვს შორის (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-49', subtopicId: 'u14-sorting-largest-smallest', difficulty: 1 }),
    prompt: 'ჩამოთვლილ რიცხვებს შორის რომელია უდიდესი: {a}, {b}, {c}, {d}?',
    variables: {
      base: { kind: 'int', min: 100, max: 800 },
      d1: { kind: 'choice', values: [12, 18, 24] },
      d2: { kind: 'choice', values: [35, 42, 50] },
      d3: { kind: 'choice', values: [65, 75, 85] },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.base)] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.base) + Number(v.d1)] },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.base) + Number(v.d2)] },
      d: { kind: 'choice', values: (v: Vars) => [Number(v.base) + Number(v.d3)] },
    },
    answer: (v: Vars) => Math.max(Number(v.a), Number(v.b), Number(v.c), Number(v.d)),
    format: { kind: 'integer', min: 100 },
    distractors: ({ vars, answer }) => [Number(vars.a), Number(vars.b), Number(vars.c)].filter((x) => x !== Number(answer)),
    explanation: ({ answer }) =>
      `უდიდესი რიცხვია ${answer}.`,
  }),

  // Q50 — უმცირესი 4 რიცხვს შორის (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u14-50', subtopicId: 'u14-sorting-largest-smallest', difficulty: 1 }),
    prompt: 'ჩამოთვლილ რიცხვებს შორის რომელია უმცირესი: {a}, {b}, {c}, {d}?',
    variables: {
      base: { kind: 'int', min: 100, max: 800 },
      d1: { kind: 'choice', values: [15, 25, 30] },
      d2: { kind: 'choice', values: [45, 55, 65] },
      d3: { kind: 'choice', values: [75, 85, 95] },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.base)] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.base) + Number(v.d1)] },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.base) + Number(v.d2)] },
      d: { kind: 'choice', values: (v: Vars) => [Number(v.base) + Number(v.d3)] },
    },
    answer: (v: Vars) => Math.min(Number(v.a), Number(v.b), Number(v.c), Number(v.d)),
    format: { kind: 'integer', min: 100 },
    distractors: ({ vars, answer }) => [Number(vars.b), Number(vars.c), Number(vars.d)].filter((x) => x !== Number(answer)),
    explanation: ({ answer }) =>
      `უმცირესი რიცხვია ${answer}.`,
  }),

  // Q51 — უდიდესი გამოსახულება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-51', subtopicId: 'u14-sorting-largest-smallest', difficulty: 2 }),
    prompt: 'ჩამოთვლილთაგან რომელი გამოსახულების მნიშვნელობაა ყველაზე დიდი (როცა რიცხვია {x})?',
    variables: {
      x: { kind: 'int', min: 10, max: 30 },
      e1: { kind: 'choice', values: (v: Vars) => [`${Number(v.x)} × 2`] },
      e2: { kind: 'choice', values: (v: Vars) => [`${Number(v.x)} + 10`] },
      e3: { kind: 'choice', values: (v: Vars) => [`${Number(v.x)} × 3`] },
      e4: { kind: 'choice', values: (v: Vars) => [`${Number(v.x)} + 5`] },
    },
    answer: (v: Vars) => `${Number(v.x)} × 3`,
    format: { kind: 'text' },
    options: (v: Vars) => [String(v.e3), String(v.e1), String(v.e2), String(v.e4)],
    optionCount: 4,
    explanation: ({ vars, answer: _answer }) =>
      `${vars.x} × 3 = ${Number(vars.x) * 3}, რაც ყველაზე დიდია.`,
  }),

  // Q52 — შედარების ლოგიკა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-52', subtopicId: 'u14-sorting-largest-smallest', difficulty: 2 }),
    prompt: '{c1} უფრო {attr}ა ვიდრე {c2}, ხოლო {c2} უფრო {attr}ა ვიდრე {c3}. ვინ არის ყველაზე {oppAttr}?',
    variables: {
      triad: {
        kind: 'choice',
        values: [
          'გიორგი_ლუკა_სანდრო',
          'ნიკა_დავითი_თემო',
          'ანა_მარიამი_ნინო',
          'ელენე_თამარი_სალომე',
          'საბა_ირაკლი_ოთარი',
          'ლილე_ქეთი_ნატა',
        ],
      },
      c1: { kind: 'choice', values: (v: Vars) => [String(v.triad).split('_')[0]] },
      c2: { kind: 'choice', values: (v: Vars) => [String(v.triad).split('_')[1]] },
      c3: { kind: 'choice', values: (v: Vars) => [String(v.triad).split('_')[2]] },
      pairAttr: {
        kind: 'choice',
        values: [
          'მაღალი_დაბალი',
          'სწრაფი_ნელი',
          'უფროსი_უმცროსი',
        ],
      },
      attr: { kind: 'choice', values: (v: Vars) => [String(v.pairAttr).split('_')[0]] },
      oppAttr: { kind: 'choice', values: (v: Vars) => [String(v.pairAttr).split('_')[1]] },
    },
    answer: (v: Vars) => String(v.c3),
    format: { kind: 'text' },
    options: (v: Vars) => [String(v.c3), String(v.c1), String(v.c2), 'ყველა ერთნაირია'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `შედარების მიხედვით: ${vars.c1} > ${vars.c2} > ${vars.c3}. ყველაზე ${vars.oppAttr} არის ${answer}.`,
  }),

  // Q53 — შეჯიბრის ადგილები (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-53', subtopicId: 'u14-sorting-largest-smallest', difficulty: 3 }),
    prompt: '{sport} {c1}-მა აჯობა {c2}-ს, {c2}-მა აჯობა {c3}-ს, ხოლო {c4}-მა აჯობა {c1}-ს. ვინ დაიკავა პირველი ადგილი?',
    variables: {
      names: {
        kind: 'choice',
        values: [
          'ლუკა_სანდრო_ნიკა_გიორგი',
          'დავითი_ოთარი_თემო_ილია',
          'ანა_ნინო_მარიამი_ელენე',
          'სალომე_თამარი_ლილე_მარი',
          'საბა_ირაკლი_ზურა_ვაჟა',
          'ქეთი_ნატა_მაია_თინა',
        ],
      },
      c1: { kind: 'choice', values: (v: Vars) => [String(v.names).split('_')[0]] },
      c2: { kind: 'choice', values: (v: Vars) => [String(v.names).split('_')[1]] },
      c3: { kind: 'choice', values: (v: Vars) => [String(v.names).split('_')[2]] },
      c4: { kind: 'choice', values: (v: Vars) => [String(v.names).split('_')[3]] },
      sport: { kind: 'choice', values: ['სირბილში', 'ცურვაში', 'შეჯიბრში', 'ხტომაში'] },
    },
    answer: (v: Vars) => String(v.c4),
    format: { kind: 'text' },
    options: (v: Vars) => [String(v.c4), String(v.c1), String(v.c2), String(v.c3)],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `შედეგების მიხედვით: ${vars.c4} > ${vars.c1} > ${vars.c2} > ${vars.c3}. პირველი ადგილი დაიკავა ${answer}-მა.`,
  }),

  // Q54 — წონების შედარების ჯაჭვი (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u14-54', subtopicId: 'u14-sorting-largest-smallest', difficulty: 3 }),
    prompt: '{item1} უფრო მძიმეა ვიდრე {item2}, მაგრამ უფრო მსუბუქია ვიდრე {item3}. რომელია ყველაზე მძიმე?',
    variables: {
      triplet: {
        kind: 'choice',
        values: [
          'საზამთრო_ნესვი_გოგრა',
          'ჩანთა_წიგნი_ყუთი',
          'დათვი_მგელი_სპილო',
          'ვაშლი_მარწყვი_ანანასი',
          'ავტობუსი_მანქანა_მატარებელი',
          'ტელეფონი_საათი_ლეპტოპი',
          'კარადა_სკამი_მაგიდა',
          'ცხენი_ცხვარი_ძროხა',
          'მელა_კურდღელი_დათვი',
          'კარტოფილი_სტაფილო_კომბოსტო',
          'ალუბალი_ჟოლო_საზამთრო',
          'თვითმფრინავი_ვერტმფრენი_რაკეტა',
        ],
      },
      item1: { kind: 'choice', values: (v: Vars) => [String(v.triplet).split('_')[0]] },
      item2: { kind: 'choice', values: (v: Vars) => [String(v.triplet).split('_')[1]] },
      item3: { kind: 'choice', values: (v: Vars) => [String(v.triplet).split('_')[2]] },
    },
    answer: (v: Vars) => String(v.item3),
    format: { kind: 'text' },
    options: (v: Vars) => [String(v.item3), String(v.item1), String(v.item2), 'ყველა თანაბარია'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `წონის მიხედვით: ${vars.item3} > ${vars.item1} > ${vars.item2}. ყველაზე მძიმეა ${answer}.`,
  }),
];
