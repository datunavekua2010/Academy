import { defineTemplate } from './types';
import type { QuestionTemplate } from './types';

const addr = (base: {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
}) => ({
  grade: 2 as const,
  topicId: 'g2-dro',
  unitId: 'g2-dro',
  ...base,
});

export const G2_U13_SUBTOPICS = [
  'u13-analog-digital-clocks',
  'u13-comparing-clocks',
  'u13-days-of-week',
  'u13-seasons-and-months',
  'u13-days-in-each-month',
  'u13-calendar',
  'u13-comparing-times',
  'u13-time-spent',
  'u13-time-units-sequence',
  'u13-mixed-review',
] as const;

export const nearMisses = (
  target: number,
  count = 3,
  step = 1,
  minVal = 0,
): number[] => {
  const result = new Set<number>();
  for (const delta of [step, -step, step * 2, -step * 2, step * 3, -step * 3, step * 4]) {
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

const CHILDREN = [
  'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
  'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
];

export const G2_U13_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U13.1 — ანალოგური და ციფრული საათი (Q01–Q06)
  // =========================================================================

  // Q01 — ციფრული საათი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-01', subtopicId: 'u13-analog-digital-clocks', difficulty: 1 }),
    prompt: '{child}-ს ციფრულ საათზე წერია "{h}:00". რომელი დროა ნაჩვენები?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '4;ოთხი საათი;ოთხის ნახევარი;ხუთი საათი;ოთხის მეოთხედი',
          '2;ორი საათი;ორის ნახევარი;სამი საათი;ორის მეოთხედი',
          '3;სამი საათი;სამის ნახევარი;ოთხი საათი;სამის მეოთხედი',
          '5;ხუთი საათი;ხუთის ნახევარი;ექვსი საათი;ხუთის მეოთხედი',
          '6;ექვსი საათი;ექვსის ნახევარი;შვიდი საათი;ექვსის მეოთხედი',
          '7;შვიდი საათი;შვიდის ნახევარი;რვა საათი;შვიდის მეოთხედი',
          '8;რვა საათი;რვის ნახევარი;ცხრა საათი;რვის მეოთხედი',
          '9;ცხრა საათი;ცხრის ნახევარი;ათი საათი;ცხრის მეოთხედი',
        ],
      },
      h: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.h}:00 ნიშნავს ზუსტად ${answer}-ს.`,
  }),

  // Q02 — წუთების ამოცნობა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-02', subtopicId: 'u13-analog-digital-clocks', difficulty: 1 }),
    prompt: '{child}-ს საათი აჩვენებს "{h}:{m}". რამდენი წუთია გასული საათის დაწყებიდან?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      h: { kind: 'choice', values: ['4', '5', '6', '7', '8', '9'] },
      m: { kind: 'choice', values: ['15', '20', '30', '45'] },
    },
    answer: (v) => Number(v.m),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 5),
    explanation: ({ vars, answer }) =>
      `საათზე წერია ${vars.h}:${vars.m}, ანუ გასულია ${answer} წუთი.`,
  }),

  // Q03 — ანალოგური საათი — სრული საათი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-03', subtopicId: 'u13-analog-digital-clocks', difficulty: 2 }),
    prompt: '{child}-ს საათზე მოკლე ისარი დგას {h}-ზე, გრძელი ისარი — 12-ზე. რომელი დროა?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      h: { kind: 'choice', values: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] },
    },
    answer: (v) => `${v.h}:00`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const hNum = Number(vars.h);
      const nextH = hNum === 12 ? 1 : hNum + 1;
      return [`12:0${vars.h}`, `${vars.h}:30`, `${nextH}:00`];
    },
    explanation: ({ vars, answer }) =>
      `როცა გრძელი ისარი 12-ზეა, საათი აჩვენებს ზუსტ დროს: ${answer}.`,
  }),

  // Q04 — ანალოგური საათი — ნახევარი საათი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-04', subtopicId: 'u13-analog-digital-clocks', difficulty: 2 }),
    prompt:
      '{child}-ს საათზე მოკლე ისარი {h1}-სა და {h2}-ს შორისაა, გრძელი ისარი კი — 6-ზე. რომელი დროა?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '2;3;2:30;2:00;3:30;6:10',
          '3;4;3:30;3:00;4:30;6:15',
          '4;5;4:30;4:00;5:30;6:20',
          '5;6;5:30;5:00;6:30;6:25',
          '7;8;7:30;7:00;8:30;6:35',
          '8;9;8:30;8:00;9:30;6:40',
          '9;10;9:30;9:00;10:30;6:45',
          '10;11;10:30;10:00;11:30;6:50',
        ],
      },
      h1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      h2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `როცა გრძელი ისარი 6-ზეა, გასულია 30 წუთი, ანუ დროა ${answer}.`,
  }),

  // Q05 — დროის შესაბამისობა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-05', subtopicId: 'u13-analog-digital-clocks', difficulty: 3 }),
    prompt: '{child}-ს აინტერესებს: რომელი ანალოგური საათი აჩვენებს "{h}:00"-ს?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      h: { kind: 'choice', values: ['3', '4', '5', '6', '7', '8', '9', '10'] },
    },
    answer: (v) => `მოკლე ისარი ${v.h}-ზე, გრძელი — 12-ზე`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `მოკლე ისარი 12-ზე, გრძელი — ${vars.h}-ზე`,
      `ორივე ისარი ${vars.h}-ზე`,
      `მოკლე ისარი ${Number(vars.h) + 1}-ზე, გრძელი — 12-ზე`,
    ],
    explanation: ({ vars, answer }) =>
      `${vars.h}:00 დროს ${answer}.`,
  }),

  // Q06 — დროის ჩაწერა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-06', subtopicId: 'u13-analog-digital-clocks', difficulty: 3 }),
    prompt:
      '{child}-ს საათზე მოკლე ისარი {h1}-სა და {h2}-ს შორისაა, გრძელი ისარი — {hand}-ზე. რომელი დროა?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '8;9;3;8:15;8:03;9:15;8:30',
          '4;5;3;4:15;4:03;5:15;4:30',
          '7;8;3;7:15;7:03;8:15;7:30',
          '10;11;3;10:15;10:03;11:15;10:30',
          '2;3;9;2:45;2:09;3:45;2:15',
          '5;6;9;5:45;5:09;6:45;5:15',
          '6;7;9;6:45;6:09;7:45;6:15',
          '9;10;9;9:45;9:09;10:45;9:15',
        ],
      },
      h1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      h2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      hand: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `გრძელი ისარი ${vars.hand}-ზე ნიშნავს შესაბამის წუთებს. დროა ${answer}.`,
  }),

  // =========================================================================
  // U13.2 — საათების შედარება (Q07–Q12)
  // =========================================================================

  // Q07 — რომელი დროა უფრო გვიან? (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-07', subtopicId: 'u13-comparing-clocks', difficulty: 1 }),
    prompt: '{child} ადარებს საათებს: რომელი დროა უფრო გვიან?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '3:00;5:00;2:00;4:00;5:00',
          '1:00;4:00;2:00;3:00;4:00',
          '6:00;9:00;7:00;8:00;9:00',
          '5:00;8:00;6:00;7:00;8:00',
          '4:00;7:00;3:00;5:00;7:00',
          '7:00;10:00;8:00;9:00;10:00',
        ],
      },
      t1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      t2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      t3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      t4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) =>
      [String(vars.t1), String(vars.t2), String(vars.t3), String(vars.t4)].filter(
        (t) => t !== vars.correct,
      ),
    explanation: ({ answer }) =>
      `ჩამოთვლილთაგან ყველაზე გვიანაა ${answer}.`,
  }),

  // Q08 — რომელი დროა უფრო ადრე? (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-08', subtopicId: 'u13-comparing-clocks', difficulty: 1 }),
    prompt: '{child} ადარებს დროებს: რომელი დროა უფრო ადრე?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '6:30;6:15;6:45;7:00;6:15',
          '4:30;4:10;4:50;5:00;4:10',
          '8:30;8:20;8:40;9:00;8:20',
          '3:30;3:15;3:45;4:00;3:15',
          '5:30;5:05;5:25;6:00;5:05',
          '7:30;7:15;7:45;8:00;7:15',
        ],
      },
      t1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      t2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      t3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      t4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) =>
      [String(vars.t1), String(vars.t2), String(vars.t3), String(vars.t4)].filter(
        (t) => t !== vars.correct,
      ),
    explanation: ({ answer }) =>
      `ყველაზე ადრეა ${answer}.`,
  }),

  // Q09 — შეავსე გამოტოვებული ნიშანი (Level 1, MC, optionCount: 3)
  defineTemplate({
    ...addr({ id: 'g2-u13-09', subtopicId: 'u13-comparing-clocks', difficulty: 1 }),
    prompt: '{child} ამოწმებს: შეავსე გამოტოვებული ნიშანი "{t1} __ {t2}".',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '4:00;5:00;<',
          '7:00;6:00;>',
          '3:00;3:00;=',
          '8:00;9:00;<',
          '6:00;5:00;>',
          '2:00;2:00;=',
          '10:00;11:00;<',
          '9:00;7:00;>',
        ],
      },
      t1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      t2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    optionCount: 3,
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => ['>', '<', '='].filter((op) => op !== vars.correct),
    explanation: ({ vars, answer }) =>
      `${vars.t1} ${answer} ${vars.t2}.`,
  }),

  // Q10 — შეადარე წუთები (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-10', subtopicId: 'u13-comparing-clocks', difficulty: 2 }),
    prompt: '{child} ამოწმებს {h} საათის დროს: რომელი დროა უფრო გვიან?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '9;9:10;9:40;9:20;9:05;9:40',
          '4;4:15;4:45;4:30;4:10;4:45',
          '5;5:20;5:50;5:35;5:10;5:50',
          '8;8:15;8:40;8:25;8:05;8:40',
          '7;7:10;7:45;7:30;7:15;7:45',
          '6;6:05;6:55;6:30;6:20;6:55',
        ],
      },
      h: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      t1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      t2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      t3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      t4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) =>
      [String(vars.t1), String(vars.t2), String(vars.t3), String(vars.t4)].filter(
        (t) => t !== vars.correct,
      ),
    explanation: ({ answer }) =>
      `უფრო მეტი წუთია გასული, ამიტომ უფრო გვიანაა ${answer}.`,
  }),

  // Q11 — იპოვე თანაბარი დროები (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-11', subtopicId: 'u13-comparing-clocks', difficulty: 2 }),
    prompt: '{child}-ს აინტერესებს: რომელი წყვილი აღნიშნავს ერთსა და იმავე დროს?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '4:30 და ოთხის ნახევარი;2:00 და 3:00;5:15 და 5:30;7:00 და 8:00',
          '2:30 და ორის ნახევარი;1:00 და 2:00;4:15 და 4:30;6:00 და 7:00',
          '6:30 და ექვსის ნახევარი;3:00 და 4:00;7:15 და 7:30;9:00 და 10:00',
          '8:30 და რვის ნახევარი;5:00 და 6:00;9:15 და 9:30;11:00 და 12:00',
          '5:30 და ხუთის ნახევარი;2:00 და 4:00;6:15 და 6:30;8:00 და 9:00',
          '7:30 და შვიდის ნახევარი;4:00 და 5:00;8:15 და 8:30;10:00 და 11:00',
        ],
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `${answer} ერთსა და იმავე დროს აღნიშნავს.`,
  }),

  // Q12 — დაალაგე დროები (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-12', subtopicId: 'u13-comparing-clocks', difficulty: 3 }),
    prompt:
      '{child} ალაგებს დროებს: რომელია სწორად დალაგებული ზრდის (ადრიდან გვიანისკენ) მიხედვით?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '6:00, 7:00, 8:00;8:00, 6:00, 7:00;7:00, 6:00, 8:00;8:00, 7:00, 6:00',
          '2:00, 3:00, 4:00;4:00, 2:00, 3:00;3:00, 2:00, 4:00;4:00, 3:00, 2:00',
          '5:00, 6:00, 7:00;7:00, 5:00, 6:00;6:00, 5:00, 7:00;7:00, 6:00, 5:00',
          '8:00, 9:00, 10:00;10:00, 8:00, 9:00;9:00, 8:00, 10:00;10:00, 9:00, 8:00',
          '3:00, 4:00, 5:00;5:00, 3:00, 4:00;4:00, 3:00, 5:00;5:00, 4:00, 3:00',
          '4:00, 5:00, 6:00;6:00, 4:00, 5:00;5:00, 4:00, 6:00;6:00, 5:00, 4:00',
        ],
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `ზრდის მიხედვით სწორი თანმიმდევრობაა: ${answer}.`,
  }),

  // =========================================================================
  // U13.3 — კვირის დღეები (Q13–Q18)
  // =========================================================================

  // Q13 — კვირის მომდევნო დღე (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-13', subtopicId: 'u13-days-of-week', difficulty: 1 }),
    prompt:
      '{child}-ს აინტერესებს: კვირა იწყება ორშაბათით. რომელი დღე მოდის {day}-ის შემდეგ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'სამშაბათი;ოთხშაბათი;ორშაბათი;ხუთშაბათი;კვირა',
          'ორშაბათი;სამშაბათი;ოთხშაბათი;ხუთშაბათი;პარასკევი',
          'ოთხშაბათი;ხუთშაბათი;სამშაბათი;პარასკევი;შაბათი',
          'ხუთშაბათი;პარასკევი;ოთხშაბათი;შაბათი;კვირა',
          'პარასკევი;შაბათი;ხუთშაბათი;კვირა;ორშაბათი',
          'შაბათი;კვირა;პარასკევი;ორშაბათი;სამშაბათი',
        ],
      },
      day: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.day}-ის შემდეგ მოდის ${answer}.`,
  }),

  // Q14 — წინა დღე (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-14', subtopicId: 'u13-days-of-week', difficulty: 1 }),
    prompt: '{child} იხსენებს: რომელი დღე იყო {day}-მდე ერთი დღით ადრე?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'ხუთშაბათი;ოთხშაბათი;სამშაბათი;პარასკევი;შაბათი',
          'სამშაბათი;ორშაბათი;ოთხშაბათი;კვირა;პარასკევი',
          'ოთხშაბათი;სამშაბათი;ორშაბათი;ხუთშაბათი;შაბათი',
          'პარასკევი;ხუთშაბათი;ოთხშაბათი;შაბათი;კვირა',
          'შაბათი;პარასკევი;ხუთშაბათი;კვირა;ორშაბათი',
          'კვირა;შაბათი;პარასკევი;ორშაბათი;სამშაბათი',
        ],
      },
      day: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.day}-ის წინა დღეა ${answer}.`,
  }),

  // Q15 — ორი დღის შემდეგ (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-15', subtopicId: 'u13-days-of-week', difficulty: 2 }),
    prompt: 'დღეს {day}-ია. {child} ითვლის: რომელი დღე იქნება ორი დღის შემდეგ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'ორშაბათი;ოთხშაბათი;სამშაბათი;ხუთშაბათი;პარასკევი',
          'სამშაბათი;ხუთშაბათი;ოთხშაბათი;პარასკევი;შაბათი',
          'ოთხშაბათი;პარასკევი;ხუთშაბათი;შაბათი;კვირა',
          'ხუთშაბათი;შაბათი;პარასკევი;კვირა;ორშაბათი',
          'პარასკევი;კვირა;შაბათი;ორშაბათი;სამშაბათი',
          'შაბათი;ორშაბათი;კვირა;სამშაბათი;ოთხშაბათი',
        ],
      },
      day: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.day}-დან 2 დღის შემდეგ იქნება ${answer}.`,
  }),

  // Q16 — შაბათ-კვირა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-16', subtopicId: 'u13-days-of-week', difficulty: 2 }),
    prompt: '{child}-ს აინტერესებს: რომელი ორი დღეა შაბათ-კვირა (დასვენების დღეები)?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
    },
    answer: () => 'შაბათი და კვირა',
    format: { kind: 'text' },
    distractors: () => [
      'ორშაბათი და სამშაბათი',
      'ოთხშაბათი და ხუთშაბათი',
      'პარასკევი და ორშაბათი',
    ],
    explanation: () => 'დასვენების დღეებია შაბათი და კვირა.',
  }),

  // Q17 — დღეების რაოდენობა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-17', subtopicId: 'u13-days-of-week', difficulty: 3 }),
    prompt: '{child} ითვლის: რამდენი დღეა {w} კვირაში?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      w: { kind: 'choice', values: ['1', '2', '3', '4'] },
    },
    answer: (v) => Number(v.w) * 7,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `1 კვირაში 7 დღეა. ${vars.w} კვირაში არის ${vars.w} × 7 = ${answer} დღე.`,
  }),

  // Q18 — დღეების თანმიმდევრობა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-18', subtopicId: 'u13-days-of-week', difficulty: 3 }),
    prompt: '{child} ამოწმებს: რომელი დღე მოდის {day}-ის შემდეგ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'პარასკევი;შაბათი;ხუთშაბათი;კვირა;ორშაბათი',
          'კვირა;ორშაბათი;შაბათი;სამშაბათი;ოთხშაბათი',
          'სამშაბათი;ოთხშაბათი;ორშაბათი;ხუთშაბათი;პარასკევი',
          'ხუთშაბათი;პარასკევი;ოთხშაბათი;შაბათი;კვირა',
          'ორშაბათი;სამშაბათი;ოთხშაბათი;ხუთშაბათი;კვირა',
          'ოთხშაბათი;ხუთშაბათი;სამშაბათი;პარასკევი;შაბათი',
        ],
      },
      day: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.day}-ის შემდეგ მოდის ${answer}.`,
  }),

  // =========================================================================
  // U13.4 — წელიწადის დროები და თვეები (Q19–Q24)
  // =========================================================================

  // Q19 — გაზაფხულის თვე (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-19', subtopicId: 'u13-seasons-and-months', difficulty: 1 }),
    prompt: '{child}-ს აინტერესებს: რომელი თვეა გაზაფხულის თვე?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'აპრილი;იანვარი;აგვისტო;დეკემბერი',
          'მარტი;თებერვალი;ივლისი;ნოემბერი',
          'მაისი;ოქტომბერი;იანვარი;აგვისტო',
        ],
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `გაზაფხულის თვეებია: მარტი, აპრილი, მაისი. სწორია: ${answer}.`,
  }),

  // Q20 — ზამთრის თვე (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-20', subtopicId: 'u13-seasons-and-months', difficulty: 1 }),
    prompt: '{child} იხსენებს: რომელი თვეა ზამთრის თვე?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'იანვარი;ივლისი;მაისი;სექტემბერი',
          'დეკემბერი;ივნისი;აპრილი;აგვისტო',
          'თებერვალი;ოქტომბერი;მარტი;ივლისი',
        ],
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `ზამთრის თვეებია: დეკემბერი, იანვარი, თებერვალი. სწორია: ${answer}.`,
  }),

  // Q21 — სეზონის შემდეგ (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-21', subtopicId: 'u13-seasons-and-months', difficulty: 2 }),
    prompt: '{child}-ს აინტერესებს: რომელი სეზონი მოდის {season}-ის შემდეგ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'ზაფხული;შემოდგომა',
          'შემოდგომა;ზამთარი',
          'ზამთარი;გაზაფხული',
          'გაზაფხული;ზაფხული',
        ],
      },
      season: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ answer }) =>
      ['გაზაფხული', 'ზაფხული', 'შემოდგომა', 'ზამთარი'].filter((s) => s !== answer),
    explanation: ({ vars, answer }) =>
      `${vars.season}-ის შემდეგ მოდის ${answer}.`,
  }),

  // Q22 — თვეების რაოდენობა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-22', subtopicId: 'u13-seasons-and-months', difficulty: 2 }),
    prompt: '{child} ითვლის: რამდენი თვეა ერთ სრულ წელიწადში?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
    },
    answer: () => 12,
    format: { kind: 'integer', min: 1 },
    distractors: () => [10, 11, 13],
    explanation: () => 'ერთ წელიწადში 12 თვეა.',
  }),

  // Q23 — თვის შემდეგ (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-23', subtopicId: 'u13-seasons-and-months', difficulty: 3 }),
    prompt: '{child} ამოწმებს: რომელი თვე მოდის {month}-ის შემდეგ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'მაისი;ივნისი;აპრილი;ივლისი;მარტი',
          'ივნისი;ივლისი;მაისი;აგვისტო;სექტემბერი',
          'ივლისი;აგვისტო;ივნისი;სექტემბერი;ოქტომბერი',
          'აგვისტო;სექტემბერი;ივლისი;ოქტომბერი;ნოემბერი',
          'მარტი;აპრილი;თებერვალი;მაისი;ივნისი',
          'ოქტომბერი;ნოემბერი;სექტემბერი;დეკემბერი;იანვარი',
        ],
      },
      month: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.month}-ის შემდეგ მოდის ${answer}.`,
  }),

  // Q24 — წლის პირველი/ბოლო თვე (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-24', subtopicId: 'u13-seasons-and-months', difficulty: 3 }),
    prompt: '{child}-ს აინტერესებს: რომელია წლის {which} თვე?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'ბოლო;დეკემბერი;ოქტომბერი;ნოემბერი;იანვარი',
          'პირველი;იანვარი;თებერვალი;დეკემბერი;მარტი',
        ],
      },
      which: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `წლის ${vars.which} თვეა ${answer}.`,
  }),

  // =========================================================================
  // U13.5 — დღეები თითოეულ თვეში (Q25–Q30)
  // =========================================================================

  // Q25 — იანვარი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-25', subtopicId: 'u13-days-in-each-month', difficulty: 1 }),
    prompt: '{child} ითვლის: რამდენი დღეა {month}-ში?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      month: { kind: 'choice', values: ['იანვარი', 'მარტი', 'მაისი', 'ივლისი'] },
    },
    answer: () => 31,
    format: { kind: 'integer', min: 1 },
    distractors: () => [28, 29, 30],
    explanation: ({ vars }) => `${vars.month}-ში არის 31 დღე.`,
  }),

  // Q26 — აპრილი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-26', subtopicId: 'u13-days-in-each-month', difficulty: 1 }),
    prompt: '{child} ითვლის: რამდენი დღეა {month}-ში?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      month: { kind: 'choice', values: ['აპრილი', 'ივნისი', 'სექტემბერი', 'ნოემბერი'] },
    },
    answer: () => 30,
    format: { kind: 'integer', min: 1 },
    distractors: () => [28, 29, 31],
    explanation: ({ vars }) => `${vars.month}-ში არის 30 დღე.`,
  }),

  // Q27 — თებერვალი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-27', subtopicId: 'u13-days-in-each-month', difficulty: 2 }),
    prompt: '{child} ამოწმებს: ჩვეულებრივ (არანაკიან) წელიწადში რამდენი დღეა თებერვალში?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
    },
    answer: () => 28,
    format: { kind: 'integer', min: 1 },
    distractors: () => [27, 29, 30],
    explanation: () => 'ჩვეულებრივ წელიწადში თებერვალში 28 დღეა.',
  }),

  // Q28 — აგვისტო (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-28', subtopicId: 'u13-days-in-each-month', difficulty: 2 }),
    prompt: '{child} ითვლის: რამდენი დღეა {month}-ში?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      month: { kind: 'choice', values: ['აგვისტო', 'ოქტომბერი', 'დეკემბერი'] },
    },
    answer: () => 31,
    format: { kind: 'integer', min: 1 },
    distractors: () => [28, 29, 30],
    explanation: ({ vars }) => `${vars.month}-ში 31 დღეა.`,
  }),

  // Q29 — 30-დღიანი თვე (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-29', subtopicId: 'u13-days-in-each-month', difficulty: 3 }),
    prompt: '{child}-ს აინტერესებს: რომელ თვეშია ზუსტად 30 დღე?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'სექტემბერი;მარტი;ივლისი;დეკემბერი',
          'აპრილი;იანვარი;მაისი;აგვისტო',
          'ივნისი;მარტი;ოქტომბერი;იანვარი',
          'ნოემბერი;ივლისი;დეკემბერი;მაისი',
        ],
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `30-დღიანი თვეა ${answer}.`,
  }),

  // Q30 — 31-დღიანი თვე (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-30', subtopicId: 'u13-days-in-each-month', difficulty: 3 }),
    prompt: '{child}-ს აინტერესებს: რომელ თვეშია 31 დღე?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'ოქტომბერი;ივნისი;ნოემბერი;აპრილი',
          'იანვარი;აპრილი;სექტემბერი;ივნისი',
          'ივლისი;აპრილი;ნოემბერი;სექტემბერი',
          'დეკემბერი;ივნისი;სექტემბერი;აპრილი',
        ],
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `31 დღე არის თვეში: ${answer}.`,
  }),

  // =========================================================================
  // U13.6 — კალენდარი (Q31–Q36)
  // =========================================================================

  // Q31 — კალენდრის კითხვა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-31', subtopicId: 'u13-calendar', difficulty: 1 }),
    prompt:
      '{child} ათვალიერებს კალენდარს: თვის 1 რიცხვი {d1Day}-ია. კვირის რომელ დღეს იქნება {date} რიცხვი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'ორშაბათი;3;ოთხშაბათი;სამშაბათი;ხუთშაბათი;პარასკევი',
          'ორშაბათი;4;ხუთშაბათი;სამშაბათი;ოთხშაბათი;პარასკევი',
          'სამშაბათი;3;ხუთშაბათი;ოთხშაბათი;პარასკევი;შაბათი',
          'ოთხშაბათი;3;პარასკევი;ხუთშაბათი;შაბათი;კვირა',
          'პარასკევი;3;კვირა;შაბათი;ორშაბათი;სამშაბათი',
        ],
      },
      d1Day: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      date: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `1 რიცხვი ${vars.d1Day}-ია, ამიტომ ${vars.date} რიცხვი იქნება ${answer}.`,
  }),

  // Q32 — ერთი კვირის შემდეგ (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-32', subtopicId: 'u13-calendar', difficulty: 1 }),
    prompt:
      '{child} ითვლის: თვის {d1} რიცხვი {day}-ია. კვირის რომელი დღე იქნება {d2} რიცხვი (ზუსტად 7 დღის შემდეგ)?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '8;პარასკევი;15;ხუთშაბათი;შაბათი;კვირა',
          '5;სამშაბათი;12;ორშაბათი;ოთხშაბათი;ხუთშაბათი',
          '3;ორშაბათი;10;კვირა;სამშაბათი;ოთხშაბათი',
          '6;ოთხშაბათი;13;სამშაბათი;ხუთშაბათი;პარასკევი',
          '2;შაბათი;9;პარასკევი;კვირა;ორშაბათი',
        ],
      },
      d1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      day: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      d2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.day),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `7 დღის (1 კვირის) შემდეგ ისევ იგივე დღე — ${answer} იქნება.`,
  }),

  // Q33 — თვის შუა რიცხვები (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-33', subtopicId: 'u13-calendar', difficulty: 2 }),
    prompt:
      'დღეს თვის {d1} რიცხვია. {child} ითვლის: რამდენი დღეა დარჩენილი {d2} რიცხვამდე?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      d1: { kind: 'int', min: 2, max: 15 },
      diff: { kind: 'int', min: 3, max: 10 },
      d2: { kind: 'choice', values: (v) => [Number(v.d1) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.d2} − ${vars.d1} = ${answer} დღე.`,
  }),

  // Q34 — თვის დასაწყისი და 8 რიცხვი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-34', subtopicId: 'u13-calendar', difficulty: 2 }),
    prompt:
      'თუ თვის 1 რიცხვი {day}-ია, {child}-ს აინტერესებს: კვირის რომელი დღე იქნება 8 რიცხვი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      day: {
        kind: 'choice',
        values: [
          'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი',
          'პარასკევი', 'შაბათი', 'კვირა',
        ],
      },
    },
    answer: (v) => String(v.day),
    format: { kind: 'text' },
    distractors: ({ vars }) =>
      ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი', 'კვირა'].filter(
        (d) => d !== vars.day,
      ).slice(0, 3),
    explanation: ({ vars, answer }) =>
      `1 + 7 = 8, ანუ ზუსტად 1 კვირის შემდეგ ისევ ${answer} იქნება.`,
  }),

  // Q35 — თარიღის შემდეგი დღე (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-35', subtopicId: 'u13-calendar', difficulty: 3 }),
    prompt: 'დღეს არის {d} {month}. {child} ეკითხება: რომელი თარიღი იქნება ხვალ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '21;მაისი;22 მაისი;20 მაისი;23 მაისი;21 ივნისი',
          '15;აპრილი;16 აპრილი;14 აპრილი;17 აპრილი;15 მაისი',
          '10;ივნისი;11 ივნისი;9 ივნისი;12 ივნისი;10 ივლისი',
          '5;ოქტომბერი;6 ოქტომბერი;4 ოქტომბერი;7 ოქტომბერი;5 ნოემბერი',
          '18;მარტი;19 მარტი;17 მარტი;20 მარტი;18 აპრილი',
        ],
      },
      d: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      month: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `მომდევნო დღეა ${answer}.`,
  }),

  // Q36 — თარიღის წინა დღე (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-36', subtopicId: 'u13-calendar', difficulty: 3 }),
    prompt: 'დღეს არის 1 {currMonth}. {child} იხსენებს: რომელი თარიღი იყო გუშინ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'ივნისი;31 მაისი;30 მაისი;2 ივნისი;1 მაისი',
          'მაისი;30 აპრილი;31 აპრილი;2 მაისი;1 აპრილი',
          'აპრილი;31 მარტი;30 მარტი;2 აპრილი;1 მარტი',
          'ივლისი;30 ივნისი;31 ივნისი;2 ივლისი;1 ივნისი',
          'ოქტომბერი;30 სექტემბერი;31 სექტემბერი;2 ოქტომბერი;1 სექტემბერი',
        ],
      },
      currMonth: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `1 ${vars.currMonth}-ის წინა დღე იყო წინა თვის ბოლო რიცხვი: ${answer}.`,
  }),

  // =========================================================================
  // U13.7 — დროების შედარება (Q37–Q42)
  // =========================================================================

  // Q37 — რამდენი წუთია სხვაობა? (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-37', subtopicId: 'u13-comparing-times', difficulty: 1 }),
    prompt:
      '{child} ითვლის: რამდენი წუთია "{h}:00"-სა და "{h}:{m}"-ს შორის?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      h: { kind: 'choice', values: ['2', '3', '4', '5', '6', '7', '8'] },
      m: { kind: 'choice', values: ['15', '20', '30', '45'] },
    },
    answer: (v) => Number(v.m),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 5),
    explanation: ({ vars, answer }) =>
      `${vars.h}:00-დან ${vars.h}:${vars.m}-მდე გასულია ${answer} წუთი.`,
  }),

  // Q38 — საათის მეოთხედი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-38', subtopicId: 'u13-comparing-times', difficulty: 1 }),
    prompt: '{child}-ს აინტერესებს: რამდენი წუთია მეოთხედი საათი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
    },
    answer: () => 15,
    format: { kind: 'integer', min: 1 },
    distractors: () => [10, 20, 30],
    explanation: () => '1 საათი 60 წუთია. 60 : 4 = 15 წუთი (მეოთხედი საათი).',
  }),

  // Q39 — ნახევარი საათი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-39', subtopicId: 'u13-comparing-times', difficulty: 2 }),
    prompt: '{child} ითვლის: რამდენი წუთია ნახევარ საათში?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
    },
    answer: () => 30,
    format: { kind: 'integer', min: 1 },
    distractors: () => [15, 20, 45],
    explanation: () => 'ნახევარი საათი არის 30 წუთი (60 : 2 = 30).',
  }),

  // Q40 — საათებს შორის სხვაობა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-40', subtopicId: 'u13-comparing-times', difficulty: 2 }),
    prompt:
      '{child} ითვლის: რამდენი საათია "{h1}:00"-სა და "{h2}:00"-ს შორის?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      h1: { kind: 'int', min: 1, max: 7 },
      diff: { kind: 'int', min: 2, max: 5 },
      h2: { kind: 'choice', values: (v) => [Number(v.h1) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.h2} − ${vars.h1} = ${answer} საათი.`,
  }),

  // Q41 — რომელია უფრო ხანგრძლივი? (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-41', subtopicId: 'u13-comparing-times', difficulty: 3 }),
    prompt: '{child} ადარებს ხანგრძლივობას: რომელია უფრო ხანგრძლივი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '35 წუთი;20 წუთი;15 წუთი;30 წუთი',
          '40 წუთი;25 წუთი;30 წუთი;35 წუთი',
          '50 წუთი;45 წუთი;30 წუთი;20 წუთი',
          '45 წუთი;10 წუთი;30 წუთი;25 წუთი',
          '55 წუთი;50 წუთი;40 წუთი;35 წუთი',
        ],
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `ყველაზე ხანგრძლივია ${answer}.`,
  }),

  // Q42 — 1 საათი = __ წუთი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-42', subtopicId: 'u13-comparing-times', difficulty: 3 }),
    prompt: '{child}-ს აინტერესებს: რამდენი წუთია 1 საათში? (1 საათი = __ წუთი)',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
    },
    answer: () => 60,
    format: { kind: 'integer', min: 1 },
    distractors: () => [30, 45, 100],
    explanation: () => '1 საათი უდრის 60 წუთს.',
  }),

  // =========================================================================
  // U13.8 — დახარჯული დრო (Q43–Q48)
  // =========================================================================

  // Q43 — კითხვის დრო (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-43', subtopicId: 'u13-time-spent', difficulty: 1 }),
    prompt:
      '{child}-მ კითხვა დაიწყო {h}:00-ზე და დაასრულა {h}:{m}-ზე. რამდენი წუთი კითხულობდა?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      h: { kind: 'choice', values: ['2', '3', '4', '5', '6'] },
      m: { kind: 'choice', values: ['20', '30', '40', '45'] },
    },
    answer: (v) => Number(v.m),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 5),
    explanation: ({ vars, answer }) =>
      `${vars.h}:00-დან ${vars.h}:${vars.m}-მდე გასულია ${answer} წუთი.`,
  }),

  // Q44 — თამაშის ხანგრძლივობა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-44', subtopicId: 'u13-time-spent', difficulty: 1 }),
    prompt:
      '{child}-მ თამაში დაიწყო {h}:00-ზე და ითამაშა {dur} საათი. რომელ საათზე დაასრულა?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      h: { kind: 'int', min: 2, max: 7 },
      dur: { kind: 'choice', values: ['1', '2'] },
    },
    answer: (v) => `${Number(v.h) + Number(v.dur)}:00`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const start = Number(vars.h);
      const dur = Number(vars.dur);
      return [
        `${start + dur}:30`,
        `${start + dur + 1}:00`,
        `${start}:30`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${vars.h}:00 + ${vars.dur} საათი = ${answer}.`,
  }),

  // Q45 — გაკვეთილის დასრულება (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-45', subtopicId: 'u13-time-spent', difficulty: 2 }),
    prompt:
      'გაკვეთილი დაიწყო {h}:00-ზე და გაგრძელდა {m} წუთი. {child} ამოწმებს: რომელ საათზე დასრულდა?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      h: { kind: 'choice', values: ['9', '10', '11', '12', '1', '2'] },
      m: { kind: 'choice', values: ['30', '45'] },
    },
    answer: (v) => `${v.h}:${v.m}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const hNum = Number(vars.h);
      return [
        `${vars.h}:15`,
        `${hNum + 1}:00`,
        `${hNum + 1}:30`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${vars.h}:00-ს დაემატა ${vars.m} წუთი და დასრულდა ${answer}-ზე.`,
  }),

  // Q46 — გასეირნება (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-46', subtopicId: 'u13-time-spent', difficulty: 2 }),
    prompt:
      '{child} სასეირნოდ გავიდა {h1}:00-ზე და სახლში დაბრუნდა {h2}:00-ზე. რამდენ ხანს სეირნობდა?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      h1: { kind: 'int', min: 1, max: 6 },
      dur: { kind: 'choice', values: ['1', '2'] },
      h2: { kind: 'choice', values: (v) => [Number(v.h1) + Number(v.dur)] },
    },
    answer: (v) => `${v.dur} საათი`,
    format: { kind: 'text' },
    distractors: ({ vars }) =>
      vars.dur === '1'
        ? ['30 წუთი', '45 წუთი', '2 საათი']
        : ['1 საათი', '30 წუთი', '3 საათი'],
    explanation: ({ vars, answer }) =>
      `${vars.h2} − ${vars.h1} = ${answer}.`,
  }),

  // Q47 — დაწყების დროის პოვნა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-47', subtopicId: 'u13-time-spent', difficulty: 3 }),
    prompt:
      'ფილმი დასრულდა {end}:00-ზე და გაგრძელდა {dur} საათი. {child} ითვლის: რომელ საათზე დაიწყო?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      end: { kind: 'int', min: 5, max: 9 },
      dur: { kind: 'choice', values: ['1', '2'] },
    },
    answer: (v) => `${Number(v.end) - Number(v.dur)}:00`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const start = Number(vars.end) - Number(vars.dur);
      return [
        `${start - 1}:00`,
        `${start}:30`,
        `${Number(vars.end) + 1}:00`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${vars.end} − ${vars.dur} = ${answer}.`,
  }),

  // Q48 — ორი აქტივობა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-48', subtopicId: 'u13-time-spent', difficulty: 3 }),
    prompt:
      '{child}-მ {m1} წუთი დახარჯა ხატვაზე და {m2} წუთი კითხვაზე. სულ რამდენი წუთი დახარჯა?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      m1: { kind: 'choice', values: ['15', '20', '25', '30'] },
      m2: { kind: 'choice', values: ['10', '15', '20', '25'] },
    },
    answer: (v) => Number(v.m1) + Number(v.m2),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 5),
    explanation: ({ vars, answer }) =>
      `${vars.m1} + ${vars.m2} = ${answer} წუთი.`,
  }),

  // =========================================================================
  // U13.9 — დროის ერთეულები და თანმიმდევრობა (Q49–Q54)
  // =========================================================================

  // Q49 — დროის ერთეული (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-49', subtopicId: 'u13-time-units-sequence', difficulty: 1 }),
    prompt: '{child}-ს აინტერესებს: რომელი ერთეული გამოიყენება დროის გასაზომად?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      correct: { kind: 'choice', values: ['წუთი', 'საათი', 'წამი'] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: () => ['კილოგრამი', 'მეტრი', 'ლიტრი'],
    explanation: ({ answer }) =>
      `დროის საზომი ერთეულია ${answer}.`,
  }),

  // Q50 — საათები დღე-ღამეში (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-50', subtopicId: 'u13-time-units-sequence', difficulty: 1 }),
    prompt: '{child} ამოწმებს: რამდენი საათია ერთ სრულ დღე-ღამეში (ერთ დღეში)?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
    },
    answer: () => 24,
    format: { kind: 'integer', min: 1 },
    distractors: () => [12, 30, 60],
    explanation: () => 'ერთ დღე-ღამეში 24 საათია.',
  }),

  // Q51 — საათები წუთებში (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-51', subtopicId: 'u13-time-units-sequence', difficulty: 2 }),
    prompt: '{child} ითვლის: რამდენი წუთია {h} საათში?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      h: { kind: 'choice', values: ['2', '3'] },
    },
    answer: (v) => Number(v.h) * 60,
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars, answer }) =>
      vars.h === '2' ? [60, 90, 180] : [120, 150, 200],
    explanation: ({ vars, answer }) =>
      `1 საათი 60 წუთია. ${vars.h} საათი არის ${vars.h} × 60 = ${answer} წუთი.`,
  }),

  // Q52 — დროის ზრდა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-52', subtopicId: 'u13-time-units-sequence', difficulty: 2 }),
    prompt:
      '{child} ითვლის: რა დრო იქნება "{h}:00"-დან {plus} საათის შემდეგ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      h: { kind: 'int', min: 3, max: 8 },
      plus: { kind: 'choice', values: ['2', '3'] },
    },
    answer: (v) => `${Number(v.h) + Number(v.plus)}:00`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const correctH = Number(vars.h) + Number(vars.plus);
      return [
        `${correctH - 1}:00`,
        `${correctH + 1}:00`,
        `${correctH + 2}:00`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${vars.h} + ${vars.plus} = ${answer}.`,
  }),

  // Q53 — წუთების დამატება (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-53', subtopicId: 'u13-time-units-sequence', difficulty: 3 }),
    prompt:
      '{child} ითვლის: რა დრო იქნება "{h}:{m}"-დან {addM} წუთის შემდეგ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '8;15;15;8:30;8:20;8:45;9:15',
          '7;15;15;7:30;7:20;7:45;8:15',
          '4;10;20;4:30;4:20;4:40;5:00',
          '5;20;10;5:30;5:25;5:40;6:00',
          '6;15;30;6:45;6:30;7:00;6:20',
          '9;15;15;9:30;9:20;9:45;10:15',
        ],
      },
      h: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      m: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      addM: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.m} წუთს + ${vars.addM} წუთი = დროა ${answer}.`,
  }),

  // Q54 — დროის ერთეულების შედარება (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-54', subtopicId: 'u13-time-units-sequence', difficulty: 3 }),
    prompt: '{child} ადარებს დროის შუალედებს: რომელია უფრო ხანგრძლივი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '45 წუთი;ნახევარი საათი;20 წუთი;15 წუთი',
          '1 საათი;50 წუთი;ნახევარი საათი;40 წუთი',
          '40 წუთი;ნახევარი საათი;25 წუთი;10 წუთი',
          '50 წუთი;ნახევარი საათი;35 წუთი;20 წუთი',
        ],
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `ყველაზე ხანგრძლივია ${answer}.`,
  }),

  // =========================================================================
  // U13.10 — შერეული სავარჯიშოები (Q55–Q60)
  // =========================================================================

  // Q55 — დროის წაკითხვა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-55', subtopicId: 'u13-mixed-review', difficulty: 1 }),
    prompt: 'საათი აჩვენებს "{h}:30". {child}-ს აინტერესებს: რომელი პასუხია სწორი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '11;თერთმეტის ნახევარი;თერთმეტი საათი;თორმეტი საათი;თორმეტის ნახევარი',
          '2;ორის ნახევარი;ორი საათი;სამი საათი;სამის ნახევარი',
          '3;სამის ნახევარი;სამი საათი;ოთხი საათი;ოთხის ნახევარი',
          '5;ხუთის ნახევარი;ხუთი საათი;ექვსი საათი;ექვსის ნახევარი',
          '7;შვიდის ნახევარი;შვიდი საათი;რვა საათი;რვის ნახევარი',
          '9;ცხრის ნახევარი;ცხრა საათი;ათი საათი;ათის ნახევარი',
        ],
      },
      h: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.h}:30 ნიშნავს ${answer}-ს.`,
  }),

  // Q56 — დღეების დათვლა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-56', subtopicId: 'u13-mixed-review', difficulty: 1 }),
    prompt:
      'დღეს {day}-ია. {child} ითვლის: რომელი დღე იქნება {daysAhead} დღის შემდეგ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'ოთხშაბათი;3;შაბათი;პარასკევი;კვირა;ორშაბათი',
          'ორშაბათი;3;ხუთშაბათი;ოთხშაბათი;პარასკევი;შაბათი',
          'სამშაბათი;3;პარასკევი;ხუთშაბათი;შაბათი;კვირა',
          'ხუთშაბათი;3;კვირა;შაბათი;ორშაბათი;სამშაბათი',
          'პარასკევი;3;ორშაბათი;კვირა;სამშაბათი;ოთხშაბათი',
        ],
      },
      day: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      daysAhead: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.day}-დან ${vars.daysAhead} დღის შემდეგ იქნება ${answer}.`,
  }),

  // Q57 — დროის გამოთვლა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-57', subtopicId: 'u13-mixed-review', difficulty: 2 }),
    prompt:
      '{activity} დაიწყო {h}:30-ზე და დასრულდა {nextH}:00-ზე. {child} ითვლის: რამდენ ხანს გაგრძელდა?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      activity: { kind: 'choice', values: ['ვარჯიში', 'სპორტი', 'ცეკვა', 'ცურვა'] },
      h: { kind: 'int', min: 2, max: 7 },
      nextH: { kind: 'choice', values: (v) => [Number(v.h) + 1] },
    },
    answer: () => '30 წუთი',
    format: { kind: 'text' },
    distractors: () => ['15 წუთი', '45 წუთი', '60 წუთი'],
    explanation: ({ vars }) =>
      `${vars.h}:30-დან ${vars.nextH}:00-მდე ზუსტად 30 წუთია.`,
  }),

  // Q58 — თვეების თანმიმდევრობა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-58', subtopicId: 'u13-mixed-review', difficulty: 2 }),
    prompt: '{child} ამოწმებს: რომელი თვე მოდის {month}-ის შემდეგ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'სექტემბერი;ოქტომბერი;აგვისტო;ნოემბერი;დეკემბერი',
          'ოქტომბერი;ნოემბერი;სექტემბერი;დეკემბერი;იანვარი',
          'ნოემბერი;დეკემბერი;ოქტომბერი;იანვარი;თებერვალი',
          'თებერვალი;მარტი;იანვარი;აპრილი;მაისი',
          'აპრილი;მაისი;მარტი;ივნისი;ივლისი',
        ],
      },
      month: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.month}-ის შემდეგ მოდის ${answer}.`,
  }),

  // Q59 — დროის დამატება (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u13-59', subtopicId: 'u13-mixed-review', difficulty: 3 }),
    prompt:
      'ახლა არის {h}:45. {child} ითვლის: რა დრო იქნება 15 წუთის შემდეგ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      h: { kind: 'int', min: 2, max: 10 },
      nextH: { kind: 'choice', values: (v) => [Number(v.h) + 1] },
    },
    answer: (v) => `${v.nextH}:00`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.h}:50`,
      `${vars.nextH}:15`,
      `${vars.nextH}:30`,
    ],
    explanation: ({ vars, answer }) =>
      `45 წუთს + 15 წუთი = 60 წუთი (1 სრული საათი), ამიტომ დრო გახდება ${answer}.`,
  }),

  // Q60 — შერეული ამოცანა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u13-60', subtopicId: 'u13-mixed-review', difficulty: 3 }),
    prompt:
      '{child}-მ დავალებაზე იმუშავა {m1} წუთი, შემდეგ კი კიდევ {m2} წუთი იკითხა. რამდენი წუთი დახარჯა სულ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      m1: { kind: 'choice', values: ['20', '25', '30', '35'] },
      m2: { kind: 'choice', values: ['15', '20', '25'] },
    },
    answer: (v) => Number(v.m1) + Number(v.m2),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 5),
    explanation: ({ vars, answer }) =>
      `${vars.m1} + ${vars.m2} = ${answer} წუთი.`,
  }),
];