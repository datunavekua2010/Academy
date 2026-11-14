import { defineTemplate } from './types';
import type { QuestionTemplate } from './types';

export const G2_U15_SUBTOPICS = [
  'u15-parts-of-a-whole',
  'u15-halves',
  'u15-thirds',
  'u15-quarters',
] as const;

export type G2U15Subtopic = (typeof G2_U15_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G2U15Subtopic; difficulty: 1 | 2 | 3 }) => ({
  grade: 2 as const,
  topicId: 'g2-wiladebi',
  unitId: 'g2-wiladebi',
  ...options,
});

export function nearMisses(answer: number, count = 3, min = 0, step = 1): number[] {
  const result = new Set<number>();
  const deltas = [step, -step, 2 * step, -2 * step, 3 * step, -3 * step, 4 * step, -4 * step, 5, -5];
  for (const delta of deltas) {
    const val = answer + delta;
    if (val >= min && val !== answer) {
      result.add(val);
      if (result.size >= count) break;
    }
  }
  let fallback = min;
  while (result.size < count) {
    if (fallback !== answer) result.add(fallback);
    fallback += step;
  }
  return Array.from(result).slice(0, count);
}

const CHILDREN = [
  'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
  'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
];

export const G2_U15_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U15.1 — მთელის ნაწილები (Q01–Q06)
  // =========================================================================

  // Q01 — თანაბარი ნაწილები (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u15-01', subtopicId: 'u15-parts-of-a-whole', difficulty: 1 }),
    prompt:
      '{child}-მ {food} გაყო {parts} თანაბარ ნაწილად. ერთი ნაწილი შეჭამეს. მთელის რა ნაწილი შეჭამეს?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      food: { kind: 'choice', values: ['პიცა', 'ვაშლი', 'ტორტი', 'ნამცხვარი'] },
      pack: {
        kind: 'choice',
        values: [
          '2;ნახევარი;მესამედი;მეოთხედი;მთელი',
          '3;მესამედი;ნახევარი;მეოთხედი;მთელი',
          '4;მეოთხედი;ნახევარი;მესამედი;მთელი',
        ],
      },
      parts: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.parts} თანაბარი ნაწილიდან ერთი ნაწილი არის ${answer}.`,
  }),

  // Q02 — ნაწილების დათვლა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u15-02', subtopicId: 'u15-parts-of-a-whole', difficulty: 1 }),
    prompt:
      '{child}-მ {shape} დაყო {parts} თანაბარ ნაწილად. რამდენი ნაწილია სულ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      shape: { kind: 'choice', values: ['წრე', 'კვადრატი', 'მართკუთხედი', 'ზოლი'] },
      parts: { kind: 'choice', values: ['2', '3', '4', '5', '6'] },
    },
    answer: (v) => Number(v.parts),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `ფიგურა დაყოფილია ${vars.parts} თანაბარ ნაწილად, ამიტომ სულ არის ${answer} ნაწილი.`,
  }),

  // Q03 — შეფერილი ნაწილები (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u15-03', subtopicId: 'u15-parts-of-a-whole', difficulty: 2 }),
    prompt:
      '{child}-მ {shape} დაყო {parts} თანაბარ ნაწილად და ერთი ნაწილი გააფერადა. რა ნაწილია გაფერადებული?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      shape: { kind: 'choice', values: ['მართკუთხედი', 'წრე', 'კვადრატი', 'ფიგურა'] },
      pack: {
        kind: 'choice',
        values: [
          '3;მესამედი;ნახევარი;მეოთხედი;მთელი',
          '4;მეოთხედი;ნახევარი;მესამედი;მთელი',
          '2;ნახევარი;მესამედი;მეოთხედი;მთელი',
        ],
      },
      parts: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.parts} თანაბარი ნაწილიდან ერთი გაფერადებული ნაწილია ${answer}.`,
  }),

  // Q04 — მთელის ამოცნობა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u15-04', subtopicId: 'u15-parts-of-a-whole', difficulty: 2 }),
    prompt: '{child} ამოწმებს: რომელი აღწერს მთელს?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '4;ყველა 4 ნაწილი ერთად;4 თანაბარი ნაწილიდან 1 ნაწილი;4 თანაბარი ნაწილიდან 2 ნაწილი;4 თანაბარი ნაწილიდან 3 ნაწილი',
          '3;ყველა 3 ნაწილი ერთად;3 თანაბარი ნაწილიდან 1 ნაწილი;3 თანაბარი ნაწილიდან 2 ნაწილი;3 თანაბარი ნაწილიდან 0 ნაწილი',
          '2;ყველა 2 ნაწილი ერთად;2 თანაბარი ნაწილიდან 1 ნაწილი;2 თანაბარი ნაწილიდან 0 ნაწილი;ნახევარი ნაწილი',
        ],
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `მთელი შედგება ყველა ნაწილისგან: ${answer}.`,
  }),

  // Q05 — ნაწილების რაოდენობა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u15-05', subtopicId: 'u15-parts-of-a-whole', difficulty: 3 }),
    prompt:
      '{child}-ს {item} დაყოფილი აქვს {total} თანაბარ ნაწილად. მან {eaten} ნაწილი შეჭამა. რამდენი ნაწილი დარჩა?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      item: { kind: 'choice', values: ['შოკოლადი', 'ვაფლი', 'პიცა', 'ნამცხვარი'] },
      total: { kind: 'int', min: 4, max: 8 },
      eaten: { kind: 'int', min: 1, max: 3 },
    },
    answer: (v) => Number(v.total) - Number(v.eaten),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.total} − ${vars.eaten} = ${answer} ნაწილი დარჩა.`,
  }),

  // Q06 — წილადის შესაბამისობა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u15-06', subtopicId: 'u15-parts-of-a-whole', difficulty: 3 }),
    prompt:
      '{child} წერს წილადს: რომელი წილადი აღნიშნავს {n} თანაბარი ნაწილიდან ერთ ნაწილს?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '3;1/3;1/2;1/4;3/3',
          '2;1/2;1/3;1/4;2/2',
          '4;1/4;1/2;1/3;4/4',
          '5;1/5;1/2;1/3;1/4',
          '6;1/6;1/2;1/3;1/4',
        ],
      },
      n: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.n} ტოლი ნაწილიდან ერთი ნაწილი იწერება როგორც ${answer}.`,
  }),

  // =========================================================================
  // U15.2 — ნახევრები (Q07–Q12)
  // =========================================================================

  // Q07 — ნახევრის ამოცნობა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u15-07', subtopicId: 'u15-halves', difficulty: 1 }),
    prompt:
      '{child}-მ ერთი {fruit} ორ თანაბარ ნაწილად გაჭრა. ერთი ნაწილი მთელის რა ნაწილია?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      fruit: { kind: 'choice', values: ['ვაშლი', 'ფორთოხალი', 'ატამი', 'მსხალი', 'ნესვი'] },
    },
    answer: () => 'ნახევარი',
    format: { kind: 'text' },
    distractors: () => ['მესამედი', 'მეოთხედი', 'მთელი'],
    explanation: () => 'ორის ტოლი ნაწილიდან თითოეული არის ნახევარი.',
  }),

  // Q08 — იპოვე ნახევარი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u15-08', subtopicId: 'u15-halves', difficulty: 1 }),
    prompt: '{child} ითვლის: რამდენია {n}-ის ნახევარი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      half: { kind: 'int', min: 2, max: 10 },
      n: { kind: 'choice', values: (v) => [Number(v.half) * 2] },
    },
    answer: (v) => Number(v.half),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.n} : 2 = ${answer}.`,
  }),

  // Q09 — საგნების ნახევარი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u15-09', subtopicId: 'u15-halves', difficulty: 2 }),
    prompt:
      '{place}-ში სულ {total} {item}ა. მათი ნახევარი {color}ა. რამდენი {color} {item}ა?',
    variables: {
      place: { kind: 'choice', values: ['კალათაში', 'ყუთში', 'თაროზე', 'პაკეტში'] },
      item: { kind: 'choice', values: ['ბურთი', 'ფანქარი', 'ვაშლი', 'კუბიკი'] },
      color: { kind: 'choice', values: ['წითელი', 'ლურჯი', 'მწვანე', 'ყვითელი'] },
      half: { kind: 'int', min: 3, max: 10 },
      total: { kind: 'choice', values: (v) => [Number(v.half) * 2] },
    },
    answer: (v) => Number(v.half),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.total} : 2 = ${answer}.`,
  }),

  // Q10 — ნახევრების შედარება (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u15-10', subtopicId: 'u15-halves', difficulty: 2 }),
    prompt:
      '{child} ადარებს ერთი და იმავე მთელის ნაწილებს: რომელია მეტი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'მეოთხედი;ერთი მთელის ნახევარი;ერთი მთელის მეოთხედი',
          'მესამედი;ერთი მთელის ნახევარი;ერთი მთელის მესამედი',
          'მეხუთედი;ერთი მთელის ნახევარი;ერთი მთელის მეხუთედი',
        ],
      },
      compareWith: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      other: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      String(vars.other),
      'ორივე ყოველთვის თანაბარია',
      'პასუხის განსაზღვრა შეუძლებელია',
    ],
    explanation: ({ answer }) =>
      `რაც უფრო ნაკლებ ნაწილად იყოფა მთელი, მით უფრო დიდია თითოეული ნაწილი. მეტია ${answer}.`,
  }),

  // Q11 — გამოტოვებული რიცხვი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u15-11', subtopicId: 'u15-halves', difficulty: 3 }),
    prompt:
      '{child} გვეკითხება: „რიცხვის ნახევარია {half}. რა რიცხვია ეს?“',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      half: { kind: 'int', min: 4, max: 10 },
    },
    answer: (v) => Number(v.half) * 2,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 2),
    explanation: ({ vars, answer }) =>
      `${vars.half} × 2 = ${answer}.`,
  }),

  // Q12 — ნახევრების რაოდენობა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u15-12', subtopicId: 'u15-halves', difficulty: 3 }),
    prompt:
      '{child} ითვლის: ერთი მთელის რამდენი ნახევარია საჭირო მთელის შესადგენად?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      item: { kind: 'choice', values: ['ვაშლის', 'პიცის', 'ტორტის', 'ფორთოხლის'] },
    },
    answer: () => 2,
    format: { kind: 'integer', min: 1 },
    distractors: () => [1, 3, 4],
    explanation: () => 'ერთი მთელი შედგება 2 ნახევრისგან.',
  }),

  // =========================================================================
  // U15.3 — მესამედები (Q13–Q18)
  // =========================================================================

  // Q13 — მესამედის ამოცნობა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u15-13', subtopicId: 'u15-thirds', difficulty: 1 }),
    prompt:
      '{child}-მ {food} დაყო 3 თანაბარ ნაწილად. ერთი ნაწილი მთელის რა ნაწილია?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      food: { kind: 'choice', values: ['ტორტი', 'პიცა', 'ნესვი', 'შოკოლადი'] },
    },
    answer: () => 'მესამედი',
    format: { kind: 'text' },
    distractors: () => ['ნახევარი', 'მეოთხედი', 'მთელი'],
    explanation: () => 'სამი ტოლი ნაწილიდან თითოეული არის მესამედი.',
  }),

  // Q14 — იპოვე მესამედი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u15-14', subtopicId: 'u15-thirds', difficulty: 1 }),
    prompt: '{child} ითვლის: რამდენია {n}-ის მესამედი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      third: { kind: 'int', min: 2, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.third) * 3] },
    },
    answer: (v) => Number(v.third),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.n} : 3 = ${answer}.`,
  }),

  // Q15 — საგნების მესამედი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u15-15', subtopicId: 'u15-thirds', difficulty: 2 }),
    prompt:
      '{place}-ში {total} {item}ა. მათი მესამედი {color}ა. რამდენი {color} {item}ა?',
    variables: {
      place: { kind: 'choice', values: ['ყუთში', 'კალათაში', 'ოთახში', 'პენალში'] },
      item: { kind: 'choice', values: ['ფანქარი', 'ბურთი', 'რვეული', 'სათამაშო'] },
      color: { kind: 'choice', values: ['ლურჯი', 'წითელი', 'მწვანე', 'ყვითელი'] },
      third: { kind: 'int', min: 2, max: 8 },
      total: { kind: 'choice', values: (v) => [Number(v.third) * 3] },
    },
    answer: (v) => Number(v.third),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.total} : 3 = ${answer}.`,
  }),

  // Q16 — რამდენი მესამედია? (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u15-16', subtopicId: 'u15-thirds', difficulty: 2 }),
    prompt:
      '{child} ითვლის: ერთი მთელის რამდენი მესამედია საჭირო მთელის შესადგენად?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      shape: { kind: 'choice', values: ['ფიგურის', 'ტორტის', 'წრის', 'ზოლის'] },
    },
    answer: () => 3,
    format: { kind: 'integer', min: 1 },
    distractors: () => [2, 4, 5],
    explanation: () => 'ერთი მთელი შედგება 3 მესამედისგან.',
  }),

  // Q17 — გამოტოვებული რიცხვი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u15-17', subtopicId: 'u15-thirds', difficulty: 3 }),
    prompt:
      '{child} გვეკითხება: „რიცხვის მესამედია {third}. რა რიცხვია ეს?“',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      third: { kind: 'int', min: 3, max: 8 },
    },
    answer: (v) => Number(v.third) * 3,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 3, 3),
    explanation: ({ vars, answer }) =>
      `${vars.third} × 3 = ${answer}.`,
  }),

  // Q18 — ნაწილების დათვლა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u15-18', subtopicId: 'u15-thirds', difficulty: 3 }),
    prompt:
      '{food} დაყოფილია 3 თანაბარ ნაწილად. {child}-მ აიღო {takeCount} ნაწილი. მთელის რამდენი მესამედია აღებული?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      food: { kind: 'choice', values: ['საზამთრო', 'ნესვი', 'ტორტი', 'პიცა'] },
      pack: {
        kind: 'choice',
        values: [
          '2;ორი მესამედი;ერთი მესამედი;სამი მესამედი;ოთხი მესამედი',
          '1;ერთი მესამედი;ორი მესამედი;სამი მესამედი;ნახევარი',
        ],
      },
      takeCount: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `აღებულია ${answer}.`,
  }),

  // =========================================================================
  // U15.4 — მეოთხედები (Q19–Q24)
  // =========================================================================

  // Q19 — მეოთხედის ამოცნობა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u15-19', subtopicId: 'u15-quarters', difficulty: 1 }),
    prompt:
      '{child}-მ {shape} დაყო 4 თანაბარ ნაწილად. ერთი ნაწილი მთელის რა ნაწილია?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      shape: { kind: 'choice', values: ['წრე', 'კვადრატი', 'პიცა', 'მართკუთხედი'] },
    },
    answer: () => 'მეოთხედი',
    format: { kind: 'text' },
    distractors: () => ['ნახევარი', 'მესამედი', 'მთელი'],
    explanation: () => 'ოთხი ტოლი ნაწილიდან თითოეული არის მეოთხედი.',
  }),

  // Q20 — იპოვე მეოთხედი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u15-20', subtopicId: 'u15-quarters', difficulty: 1 }),
    prompt: '{child} ითვლის: რამდენია {n}-ის მეოთხედი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      quarter: { kind: 'int', min: 2, max: 10 },
      n: { kind: 'choice', values: (v) => [Number(v.quarter) * 4] },
    },
    answer: (v) => Number(v.quarter),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.n} : 4 = ${answer}.`,
  }),

  // Q21 — საგნების მეოთხედი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u15-21', subtopicId: 'u15-quarters', difficulty: 2 }),
    prompt:
      '{place}-ში {total} {item}ია. მათი მეოთხედი {color}ია. რამდენი {color} {item}ია?',
    variables: {
      place: { kind: 'choice', values: ['კალათაში', 'ყუთში', 'ბაღში', 'მაგიდაზე'] },
      item: { kind: 'choice', values: ['მსხალ', 'ვაშლ', 'ბურთ', 'კუბიკ'] },
      color: { kind: 'choice', values: ['მწვანე', 'წითელ', 'ყვითელ', 'ლურჯ'] },
      quarter: { kind: 'int', min: 2, max: 8 },
      total: { kind: 'choice', values: (v) => [Number(v.quarter) * 4] },
    },
    answer: (v) => Number(v.quarter),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.total} : 4 = ${answer}.`,
  }),

  // Q22 — რამდენი მეოთხედია? (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u15-22', subtopicId: 'u15-quarters', difficulty: 2 }),
    prompt:
      '{child} ითვლის: ერთი მთელის რამდენი მეოთხედია საჭირო მთელის შესადგენად?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      item: { kind: 'choice', values: ['წრის', 'კვადრატის', 'პიცის', 'ფიგურის'] },
    },
    answer: () => 4,
    format: { kind: 'integer', min: 1 },
    distractors: () => [2, 3, 5],
    explanation: () => 'ერთი მთელი შედგება 4 მეოთხედისგან.',
  }),

  // Q23 — გამოტოვებული რიცხვი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u15-23', subtopicId: 'u15-quarters', difficulty: 3 }),
    prompt:
      '{child} გვეკითხება: „რიცხვის მეოთხედია {quarter}. რა რიცხვია ეს?“',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      quarter: { kind: 'int', min: 2, max: 8 },
    },
    answer: (v) => Number(v.quarter) * 4,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 4, 4),
    explanation: ({ vars, answer }) =>
      `${vars.quarter} × 4 = ${answer}.`,
  }),

  // Q24 — წილადების შედარება (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u15-24', subtopicId: 'u15-quarters', difficulty: 3 }),
    prompt:
      '{child} ადარებს: ერთი და იმავე ზომის მთელში რომელი ნაწილია უფრო დიდი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      item: { kind: 'choice', values: ['პიცაში', 'ტორტში', 'შოკოლადში', 'წრეში'] },
    },
    answer: () => 'ერთი ნახევარი',
    format: { kind: 'text' },
    distractors: () => ['ერთი მესამედი', 'ერთი მეოთხედი', 'სამივე თანაბარია'],
    explanation: () =>
      'ნახევარი (1/2) უფრო დიდია, ვიდრე მესამედი (1/3) და მეოთხედი (1/4).',
  }),
];
