import { defineTemplate } from './types';
import type { QuestionTemplate } from './types';

export const G2_U12_SUBTOPICS = [
  'u12-counting-tetri',
  'u12-counting-money',
  'u12-minimum-coins',
  'u12-equivalent-amounts',
  'u12-money-addition-subtraction',
  'u12-comparing-money',
  'u12-sufficient-funds',
  'u12-making-one-lari',
  'u12-estimating-money',
  'u12-mixed-review',
] as const;

export type G2U12Subtopic = (typeof G2_U12_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G2U12Subtopic; difficulty: 1 | 2 | 3 }) => ({
  grade: 2 as const,
  topicId: 'g2-fuli',
  unitId: 'g2-fuli',
  ...options,
});

/** Helper to generate distinct integer distractors near an answer. */
export function nearMisses(answer: number, count = 3, min = 0, step = 1): number[] {
  const result = new Set<number>();
  const deltas = [step, -step, 2 * step, -2 * step, 3 * step, -3 * step, 4 * step, -4 * step, 5, -5, 10, -10];
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
    fallback += 1;
  }
  return Array.from(result).slice(0, count);
}

export const G2_U12_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U12.1 — თეთრების დათვლა (Q01–Q06)
  // =========================================================================

  // Q01 — ორი ათეული თეთრის შეკრება (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-01', subtopicId: 'u12-counting-tetri', difficulty: 1 }),
    prompt: 'რამდენი თეთრია {a} თეთრი + {b} თეთრი?',
    variables: {
      a: { kind: 'choice', values: ['10', '20', '30', '40'] },
      b: { kind: 'choice', values: ['10', '20', '30', '40', '50'] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 10),
    explanation: ({ vars, answer }) =>
      `${vars.a} თეთრი + ${vars.b} თეთრი = ${answer} თეთრი.`,
  }),

  // Q02 — 50 თეთრზე ათეული თეთრების დამატება (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-02', subtopicId: 'u12-counting-tetri', difficulty: 1 }),
    prompt: '{child} ითვლის: რამდენი თეთრია {a} თეთრი + {b} თეთრი?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
      a: { kind: 'choice', values: ['50', '60'] },
      b: { kind: 'choice', values: ['10', '20', '30', '40'] },
      style: { kind: 'choice', values: ['A', 'B'] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer} თეთრი.`,
  }),

  // Q03 — 10-თეთრიანი მონეტების დათვლა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-03', subtopicId: 'u12-counting-tetri', difficulty: 2 }),
    prompt:
      '{child}-ს აქვს {n} მონეტა, თითოეული 10 თეთრი ღირს. რამდენი თეთრი აქვს სულ?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
      n: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v) => Number(v.n) * 10,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) =>
      `${vars.n} × 10 = ${answer} თეთრი.`,
  }),

  // Q04 — ორი სხვადასხვა მონეტის ჯამი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-04', subtopicId: 'u12-counting-tetri', difficulty: 2 }),
    prompt: 'რამდენია {a}-თეთრიანი და {b}-თეთრიანი მონეტების ჯამი?',
    variables: {
      pair: {
        kind: 'choice',
        values: [
          '20;5', '50;5', '10;5', '50;10', '50;20', '20;10',
          '10;2', '20;2', '5;2', '50;2', '20;1', '10;1',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.pair).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pair).split(';')[1]] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 5),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer} თეთრი.`,
  }),

  // Q05 — 5-თეთრიანი მონეტების დათვლა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-05', subtopicId: 'u12-counting-tetri', difficulty: 3 }),
    prompt:
      '{child}-ს აქვს {n} მონეტა, თითოეული 5 თეთრი ღირს. რამდენი თეთრი აქვს?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
      n: { kind: 'choice', values: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '12'] },
    },
    answer: (v) => Number(v.n) * 5,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 5),
    explanation: ({ vars, answer }) =>
      `${vars.n} × 5 = ${answer} თეთრი.`,
  }),

  // Q06 — სამი მონეტის შეკრება (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-06', subtopicId: 'u12-counting-tetri', difficulty: 3 }),
    prompt: 'რამდენია {a} თეთრი + {b} თეთრი + {c} თეთრი?',
    variables: {
      triple: {
        kind: 'choice',
        values: [
          '50;10;5', '50;20;5', '50;20;10', '20;20;10', '20;20;5', '20;10;5',
          '50;20;20', '50;10;10', '20;10;2', '50;20;2', '50;5;2', '20;5;2',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.triple).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.triple).split(';')[1]] },
      c: { kind: 'choice', values: (v) => [String(v.triple).split(';')[2]] },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 5),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} = ${answer} თეთრი.`,
  }),

  // =========================================================================
  // U12.2 — თანხის დათვლა (Q07–Q12)
  // =========================================================================

  // Q07 — 1 ლარი და თეთრები (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-07', subtopicId: 'u12-counting-money', difficulty: 1 }),
    prompt: 'რამდენია 1 ლარი და {t} თეთრი თეთრებში?',
    variables: {
      t: {
        kind: 'choice',
        values: ['10', '15', '20', '25', '30', '40', '50', '60', '70', '75', '80', '85'],
      },
    },
    answer: (v) => 100 + Number(v.t),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) =>
      `1 ლარი = 100 თეთრი. 100 + ${vars.t} = ${answer} თეთრი.`,
  }),

  // Q08 — რამდენიმე ლარი და თეთრები (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-08', subtopicId: 'u12-counting-money', difficulty: 1 }),
    prompt: 'რამდენია {lari} ლარი და {t} თეთრი თეთრებში?',
    variables: {
      lari: { kind: 'int', min: 2, max: 5 },
      t: { kind: 'choice', values: ['20', '30', '40', '50', '60', '70', '80'] },
    },
    answer: (v) => Number(v.lari) * 100 + Number(v.t),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) =>
      `${vars.lari} ლარი = ${Number(vars.lari) * 100} თეთრი. ${Number(vars.lari) * 100} + ${vars.t} = ${answer} თეთრი.`,
  }),

  // Q09 — ლარიანი და თეთრიანი მონეტების ჯამი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-09', subtopicId: 'u12-counting-money', difficulty: 2 }),
    prompt:
      '{child}-ს აქვს 1-ლარიანი მონეტა და {count} ცალი {coin}-თეთრიანი მონეტა. რამდენი აქვს სულ?',
    variables: {
      child: {
        kind: 'choice',
        values: ['ნინო', 'ლუკა', 'გიორგი', 'მარიამი'],
      },
      pack: {
        kind: 'choice',
        values: [
          'ორი;20;1 ლარი და 40 თეთრი;1 ლარი და 20 თეთრი;1 ლარი და 50 თეთრი;140 ლარი',
          'სამი;20;1 ლარი და 60 თეთრი;1 ლარი და 40 თეთრი;1 ლარი და 70 თეთრი;160 ლარი',
          'ოთხი;20;1 ლარი და 80 თეთრი;1 ლარი და 60 თეთრი;1 ლარი და 90 თეთრი;180 ლარი',
          'ორი;10;1 ლარი და 20 თეთრი;1 ლარი და 10 თეთრი;1 ლარი და 30 თეთრი;120 ლარი',
          'სამი;10;1 ლარი და 30 თეთრი;1 ლარი და 20 თეთრი;1 ლარი და 40 თეთრი;130 ლარი',
          'ოთხი;10;1 ლარი და 40 თეთრი;1 ლარი და 30 თეთრი;1 ლარი და 50 თეთრი;140 ლარი',
        ],
      },
      count: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      coin: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `1-ლარიანს ემატება ${vars.count} ცალი ${vars.coin}-თეთრიანი, რაც სულ შეადგენს: ${answer}.`,
  }),

  // Q10 — ლარების შეკრება (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-10', subtopicId: 'u12-counting-money', difficulty: 2 }),
    prompt: 'რამდენია {a} ლარი + {b} ლარი?',
    variables: {
      a: { kind: 'int', min: 2, max: 7 },
      b: { kind: 'int', min: 1, max: 5 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} ლარი + ${vars.b} ლარი = ${answer} ლარი.`,
  }),

  // Q11 — ლარისა და თეთრის გადაყვანა თეთრში (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-11', subtopicId: 'u12-counting-money', difficulty: 3 }),
    prompt:
      '{child}-ს აქვს {lari} ლარი და {t} თეთრი. რამდენი თეთრი აქვს სულ?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
        ],
      },
      lari: { kind: 'int', min: 2, max: 4 },
      t: { kind: 'choice', values: ['15', '25', '30', '35', '45', '65', '75', '85'] },
    },
    answer: (v) => Number(v.lari) * 100 + Number(v.t),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) =>
      `${vars.lari} ლარი = ${Number(vars.lari) * 100} თეთრი. ${Number(vars.lari) * 100} + ${vars.t} = ${answer} თეთრი.`,
  }),

  // Q12 — 1 ლარი + ორი მონეტა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-12', subtopicId: 'u12-counting-money', difficulty: 3 }),
    prompt: '{child} ითვლის: რამდენია 1 ლარი + {t1} თეთრი + {t2} თეთრი?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
      pack: {
        kind: 'choice',
        values: [
          '50;20;1 ლარი და 70 თეთრი;1 ლარი და 50 თეთრი;1 ლარი და 80 თეთრი;170 ლარი',
          '50;10;1 ლარი და 60 თეთრი;1 ლარი და 50 თეთრი;1 ლარი და 70 თეთრი;160 ლარი',
          '20;20;1 ლარი და 40 თეთრი;1 ლარი და 30 თეთრი;1 ლარი და 50 თეთრი;140 ლარი',
          '50;30;1 ლარი და 80 თეთრი;1 ლარი და 70 თეთრი;1 ლარი და 90 თეთრი;180 ლარი',
          '20;10;1 ლარი და 30 თეთრი;1 ლარი და 20 თეთრი;1 ლარი და 40 თეთრი;130 ლარი',
          '50;40;1 ლარი და 90 თეთრი;1 ლარი და 80 თეთრი;2 ლარი;190 ლარი',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B'] },
      t1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      t2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `1 ლარი + ${vars.t1} თეთრი + ${vars.t2} თეთრი = ${answer}.`,
  }),

  // =========================================================================
  // U12.3 — თანხის შედგენა მონეტების მინიმალური რაოდენობით (Q13–Q18)
  // =========================================================================

  // Q13 — 30 თეთრის შედგენა მინიმალური მონეტებით (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-13', subtopicId: 'u12-minimum-coins', difficulty: 1 }),
    prompt: '{child}-ს აინტერესებს: რომელი ვარიანტი შეადგენს 30 თეთრს ყველაზე ცოტა მონეტით?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => '20+10',
    format: { kind: 'text' },
    distractors: () => ['10+10+10', '5+5+5+5+5+5', '10+5+5+5+5'],
    explanation: () =>
      '20+10 არის მხოლოდ 2 მონეტა, რაც ყველაზე მცირე რაოდენობაა.',
  }),

  // Q14 — 50 თეთრის შედგენა მინიმალური მონეტებით (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-14', subtopicId: 'u12-minimum-coins', difficulty: 1 }),
    prompt:
      '{child}-მ უნდა შეადგინოს 50 თეთრი 20-, 10- და 5-თეთრიანებით. რომელი ვარიანტია ყველაზე ცოტა მონეტით?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => '20+20+10',
    format: { kind: 'text' },
    distractors: () => [
      '10+10+10+10+10',
      '20+10+10+10',
      '5+5+5+5+5+5+5+5+5+5',
    ],
    explanation: () =>
      '20+20+10 არის 3 მონეტა და შეადგენს 50 თეთრს მინიმალური რაოდენობით.',
  }),

  // Q15 — 40 თეთრის შედგენა (Level 2, MC, optionCount: 3)
  defineTemplate({
    ...addr({ id: 'g2-u12-15', subtopicId: 'u12-minimum-coins', difficulty: 2 }),
    prompt:
      '{child} ადგენს 40 თეთრს 20-თეთრიანი და 10-თეთრიანი მონეტებით. რომელია მონეტების მინიმალური რაოდენობა?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    optionCount: 3,
    answer: () => '20+20',
    format: { kind: 'text' },
    distractors: () => ['20+10+10', '10+10+10+10'],
    explanation: () =>
      '20+20 არის მხოლოდ 2 მონეტა (40 თეთრი).',
  }),

  // Q16 — 70 თეთრის შედგენა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-16', subtopicId: 'u12-minimum-coins', difficulty: 2 }),
    prompt:
      '{child}-ს სურს შეადგინოს 70 თეთრი. რომელი ვარიანტი შეიცავს ყველაზე ცოტა მონეტას?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => '50+20',
    format: { kind: 'text' },
    distractors: () => ['20+20+20+10', '50+10+10', '10+10+10+10+10+10+10'],
    explanation: () =>
      '50+20 არის მხოლოდ 2 მონეტა (სულ 70 თეთრი).',
  }),

  // Q17 — 1 ლარის შედგენა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-17', subtopicId: 'u12-minimum-coins', difficulty: 3 }),
    prompt:
      '{child}-ს აქვს 50-, 20- და 10-თეთრიანი მონეტები. რომელი ვარიანტი შეადგენს 1 ლარს ყველაზე ცოტა მონეტით?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => '50+50',
    format: { kind: 'text' },
    distractors: () => [
      '20+20+20+20+20',
      '50+20+20+10',
      '10+10+10+10+10+10+10+10+10+10',
    ],
    explanation: () =>
      '50+50 არის 2 მონეტა (100 თეთრი = 1 ლარი).',
  }),

  // Q18 — 90 თეთრის შედგენა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-18', subtopicId: 'u12-minimum-coins', difficulty: 3 }),
    prompt:
      '{child}-ს სურს შეადგინოს 90 თეთრი. რომელი ვარიანტი შედგება ყველაზე ცოტა მონეტისგან?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => '50+20+20',
    format: { kind: 'text' },
    distractors: () => [
      '20+20+20+20+10',
      '50+10+10+10+10',
      '10+10+10+10+10+10+10+10+10',
    ],
    explanation: () =>
      '50+20+20 არის 3 მონეტა (სულ 90 თეთრი).',
  }),

  // =========================================================================
  // U12.4 — თანაბარი ღირებულების თანხები (Q19–Q24)
  // =========================================================================

  // Q19 — 10-თეთრიანები 50 თეთრში (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-19', subtopicId: 'u12-equivalent-amounts', difficulty: 1 }),
    prompt:
      '{child}-ს აინტერესებს: რამდენი 10-თეთრიანი მონეტა უდრის ერთ 50-თეთრიან მონეტას?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => 5,
    format: { kind: 'integer', min: 1 },
    distractors: () => [4, 6, 10],
    explanation: () => '5 × 10 = 50 თეთრი, ამიტომ საჭიროა 5 ცალი 10-თეთრიანი.',
  }),

  // Q20 — 20-თეთრიანები 1 ლარში (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-20', subtopicId: 'u12-equivalent-amounts', difficulty: 1 }),
    prompt:
      '{child}-ს აინტერესებს: რამდენი 20-თეთრიანი მონეტა უდრის 1 ლარს?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => 5,
    format: { kind: 'integer', min: 1 },
    distractors: () => [4, 10, 2],
    explanation: () => '1 ლარი = 100 თეთრი. 5 × 20 = 100 თეთრი (5 მონეტა).',
  }),

  // Q21 — 5-თეთრიანები მოცემულ თანხაში (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-21', subtopicId: 'u12-equivalent-amounts', difficulty: 2 }),
    prompt: '{child}-ს აინტერესებს: {target} თეთრი რამდენი 5-თეთრიანი მონეტის ტოლია?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
      target: { kind: 'choice', values: ['20', '30', '40', '50', '60', '25', '35', '45'] },
      style: { kind: 'choice', values: ['A', 'B'] },
    },
    answer: (v) => Number(v.target) / 5,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.target} : 5 = ${answer} მონეტა.`,
  }),

  // Q22 — 1 ლარის ტოლი თანხა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-22', subtopicId: 'u12-equivalent-amounts', difficulty: 2 }),
    prompt: '{child}-ს აინტერესებს: რომელი თანხა უდრის 1 ლარს?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => '50+50',
    format: { kind: 'text' },
    distractors: () => ['50+20+20', '20+20+20+10', '50+10+10+10'],
    explanation: () =>
      '50 + 50 = 100 თეთრი = 1 ლარი.',
  }),

  // Q23 — 50-თეთრიანები ლარებში (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-23', subtopicId: 'u12-equivalent-amounts', difficulty: 3 }),
    prompt: '{child}-ს აინტერესებს: რამდენი 50-თეთრიანი მონეტა უდრის {lari} ლარს?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
      lari: { kind: 'choice', values: ['1', '2', '3', '4', '5'] },
    },
    answer: (v) => Number(v.lari) * 2,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `1 ლარში 2 ცალი 50-თეთრიანია, ამიტომ ${vars.lari} ლარში არის ${vars.lari} × 2 = ${answer} ცალი.`,
  }),

  // Q24 — 80 თეთრის ტოლი თანხა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-24', subtopicId: 'u12-equivalent-amounts', difficulty: 3 }),
    prompt: '{child}-ს აინტერესებს: რომელი თანხა უდრის 80 თეთრს?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => '50+20+10',
    format: { kind: 'text' },
    distractors: () => ['20+20+20', '50+10+10', '20+10+10+10'],
    explanation: () =>
      '50 + 20 + 10 = 80 თეთრი.',
  }),

  // =========================================================================
  // U12.5 — თანხების შეკრება და გამოკლება (Q25–Q30)
  // =========================================================================

  // Q25 — მთელი ლარიდან თეთრების გამოკლება (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-25', subtopicId: 'u12-money-addition-subtraction', difficulty: 1 }),
    prompt:
      '{child}-ს აქვს {startLari} ლარი. მან {spentTetri} თეთრი დახარჯა. რამდენი დარჩა?',
    variables: {
      child: { kind: 'choice', values: ['ნინო', 'ლუკა', 'ანი', 'გიორგი'] },
      pack: {
        kind: 'choice',
        values: [
          '2;70;1 ლარი და 30 თეთრი;1 ლარი და 40 თეთრი;1 ლარი და 20 თეთრი;130 ლარი',
          '2;80;1 ლარი და 20 თეთრი;1 ლარი და 30 თეთრი;1 ლარი და 10 თეთრი;120 ლარი',
          '2;60;1 ლარი და 40 თეთრი;1 ლარი და 50 თეთრი;1 ლარი და 30 თეთრი;140 ლარი',
          '3;50;2 ლარი და 50 თეთრი;2 ლარი და 40 თეთრი;2 ლარი და 60 თეთრი;250 ლარი',
        ],
      },
      startLari: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      spentTetri: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.startLari} ლარს გამოკლებული ${vars.spentTetri} თეთრი არის ${answer}.`,
  }),

  // Q26 — ლარების შეკრება (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-26', subtopicId: 'u12-money-addition-subtraction', difficulty: 1 }),
    prompt:
      '{itemA} ღირს {pA} ლარი, {itemB} კი — {pB} ლარი. რა ღირს ორივე ერთად?',
    variables: {
      items: {
        kind: 'choice',
        values: [
          'წიგნი;რვეული', 'კალამი;ფანქარი', 'ალბომი;საღებავები', 'ჩანთა;პენალი',
        ],
      },
      pA: { kind: 'int', min: 2, max: 7 },
      pB: { kind: 'int', min: 1, max: 5 },
      itemA: { kind: 'choice', values: (v) => [String(v.items).split(';')[0]] },
      itemB: { kind: 'choice', values: (v) => [String(v.items).split(';')[1]] },
    },
    answer: (v) => Number(v.pA) + Number(v.pB),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.pA} + ${vars.pB} = ${answer} ლარი.`,
  }),

  // Q27 — ლარებიდან ლარისა და თეთრის გამოკლება (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-27', subtopicId: 'u12-money-addition-subtraction', difficulty: 2 }),
    prompt:
      '{child}-ს აქვს 5 ლარი. მან {spentLari} ლარი და {spentTetri} თეთრი დახარჯა. რამდენი დარჩა?',
    variables: {
      child: { kind: 'choice', values: ['ლუკა', 'ნიკო', 'მარიამი', 'გიორგი'] },
      pack: {
        kind: 'choice',
        values: [
          '2;40;2 ლარი და 60 თეთრი;2 ლარი და 40 თეთრი;3 ლარი და 60 თეთრი;260 ლარი',
          '1;50;3 ლარი და 50 თეთრი;3 ლარი და 40 თეთრი;2 ლარი და 50 თეთრი;350 ლარი',
          '3;20;1 ლარი და 80 თეთრი;1 ლარი და 70 თეთრი;2 ლარი და 80 თეთრი;180 ლარი',
          '2;70;2 ლარი და 30 თეთრი;2 ლარი და 40 თეთრი;3 ლარი და 30 თეთრი;230 ლარი',
        ],
      },
      spentLari: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      spentTetri: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `5 ლარი − ${vars.spentLari} ლარი და ${vars.spentTetri} თეთრი = ${answer}.`,
  }),

  // Q28 — თეთრების შეკრება 1 ლარზე გადასვლით (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-28', subtopicId: 'u12-money-addition-subtraction', difficulty: 2 }),
    prompt:
      'ერთი {item} ღირს {p1} თეთრი, მეორე — {p2} თეთრი. რამდენი ღირს ორივე ერთად?',
    variables: {
      item: { kind: 'choice', values: ['ფანქარი', 'საშლელი', 'კალამი', 'რვეული'] },
      pack: {
        kind: 'choice',
        values: [
          '80;60;1 ლარი და 40 თეთრი;1 ლარი და 20 თეთრი;1 ლარი და 50 თეთრი;140 ლარი',
          '70;50;1 ლარი და 20 თეთრი;1 ლარი და 10 თეთრი;1 ლარი და 30 თეთრი;120 ლარი',
          '90;40;1 ლარი და 30 თეთრი;1 ლარი და 20 თეთრი;1 ლარი და 40 თეთრი;130 ლარი',
          '80;70;1 ლარი და 50 თეთრი;1 ლარი და 40 თეთრი;1 ლარი და 60 თეთრი;150 ლარი',
        ],
      },
      p1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      p2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.p1} + ${vars.p2} = ${Number(vars.p1) + Number(vars.p2)} თეთრი = ${answer}.`,
  }),

  // Q29 — ლარისა და თეთრის გამოკლება (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-29', subtopicId: 'u12-money-addition-subtraction', difficulty: 3 }),
    prompt:
      '{child}-ს აქვს {l1} ლარი და {t1} თეთრი. მან {l2} ლარი და {t2} თეთრი დახარჯა. რამდენი დარჩა?',
    variables: {
      child: { kind: 'choice', values: ['ნინო', 'მარიამი', 'ელენე', 'სალომე'] },
      pack: {
        kind: 'choice',
        values: [
          '4;50;1;20;3 ლარი და 30 თეთრი;3 ლარი და 20 თეთრი;3 ლარი და 40 თეთრი;330 ლარი',
          '5;60;2;30;3 ლარი და 30 თეთრი;3 ლარი და 20 თეთრი;3 ლარი და 40 თეთრი;330 ლარი',
          '6;70;3;40;3 ლარი და 30 თეთრი;3 ლარი და 20 თეთრი;3 ლარი და 40 თეთრი;330 ლარი',
          '4;80;2;30;2 ლარი და 50 თეთრი;2 ლარი და 40 თეთრი;2 ლარი და 60 თეთრი;250 ლარი',
        ],
      },
      l1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      t1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      l2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      t2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.l1} ლარი ${vars.t1} თეთრი − ${vars.l2} ლარი ${vars.t2} თეთრი = ${answer}.`,
  }),

  // Q30 — ხურდის გამოთვლა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-30', subtopicId: 'u12-money-addition-subtraction', difficulty: 3 }),
    prompt:
      '{item} ღირს {price} ლარი. მყიდველმა გადაიხადა {paid} ლარი. რამდენი ლარი უნდა დაუბრუნონ ხურდა?',
    variables: {
      item: { kind: 'choice', values: ['სათამაშო', 'წიგნი', 'ბურთი', 'კონსტრუქტორი'] },
      paid: { kind: 'choice', values: ['10', '20'] },
      price: { kind: 'int', min: 4, max: 9 },
    },
    answer: (v) => Number(v.paid) - Number(v.price),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.paid} − ${vars.price} = ${answer} ლარი.`,
  }),

  // =========================================================================
  // U12.6 — თანხების შედარება (Q31–Q36)
  // =========================================================================

  // Q31 — ლარი vs თეთრები (Level 1, MC, optionCount: 3)
  defineTemplate({
    ...addr({ id: 'g2-u12-31', subtopicId: 'u12-comparing-money', difficulty: 1 }),
    prompt: '{child} ამოწმებს: რომელია მეტი — {optA} თუ {optB}?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
      pack: {
        kind: 'choice',
        values: [
          '2 ლარი;180 თეთრი;2 ლარი;180 თეთრი;თანაბარია',
          '3 ლარი;280 თეთრი;3 ლარი;280 თეთრი;თანაბარია',
          '1 ლარი;90 თეთრი;1 ლარი;90 თეთრი;თანაბარია',
          '2 ლარი;150 თეთრი;2 ლარი;150 თეთრი;თანაბარია',
          '4 ლარი;350 თეთრი;4 ლარი;350 თეთრი;თანაბარია',
          '5 ლარი;450 თეთრი;5 ლარი;450 თეთრი;თანაბარია',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B'] },
      optA: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      optB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    optionCount: 3,
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2)],
    explanation: ({ answer }) =>
      `მეტია ${answer}.`,
  }),

  // Q32 — ნაკლების პოვნა (Level 1, MC, optionCount: 3)
  defineTemplate({
    ...addr({ id: 'g2-u12-32', subtopicId: 'u12-comparing-money', difficulty: 1 }),
    prompt: '{child} ამოწმებს: რომელია ნაკლები — {optA} თუ {optB}?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
      pack: {
        kind: 'choice',
        values: [
          '350 თეთრი;4 ლარი;350 თეთრი;4 ლარი;თანაბარია',
          '250 თეთრი;3 ლარი;250 თეთრი;3 ლარი;თანაბარია',
          '150 თეთრი;2 ლარი;150 თეთრი;2 ლარი;თანაბარია',
          '450 თეთრი;5 ლარი;450 თეთრი;5 ლარი;თანაბარია',
          '180 თეთრი;2 ლარი;180 თეთრი;2 ლარი;თანაბარია',
          '280 თეთრი;3 ლარი;280 თეთრი;3 ლარი;თანაბარია',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B'] },
      optA: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      optB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    optionCount: 3,
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2)],
    explanation: ({ answer }) =>
      `ნაკლებია ${answer}.`,
  }),

  // Q33 — ტოლობის შედარება (Level 2, MC, optionCount: 3)
  defineTemplate({
    ...addr({ id: 'g2-u12-33', subtopicId: 'u12-comparing-money', difficulty: 2 }),
    prompt: '{child} ამოწმებს: შეადარე {optA} და {optB}.',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
      pack: {
        kind: 'choice',
        values: [
          '2 ლარი და 75 თეთრი;275 თეთრი',
          '1 ლარი და 50 თეთრი;150 თეთრი',
          '3 ლარი და 20 თეთრი;320 თეთრი',
          '4 ლარი და 80 თეთრი;480 თეთრი',
          '2 ლარი და 30 თეთრი;230 თეთრი',
          '3 ლარი და 50 თეთრი;350 თეთრი',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B'] },
      optA: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      optB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    optionCount: 3,
    answer: () => 'თანაბარია',
    format: { kind: 'text' },
    distractors: () => ['პირველი მეტია', 'მეორე მეტია'],
    explanation: ({ vars }) =>
      `${vars.optA} ზუსტად უდრის ${vars.optB}-ს, ამიტომ ისინი თანაბარია.`,
  }),

  // Q34 — ორ პირს შორის შედარება და სხვაობა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-34', subtopicId: 'u12-comparing-money', difficulty: 2 }),
    prompt:
      '{child1}-ს აქვს {l1} ლარი და {t1} თეთრი, {child2}-ს კი — {l2} ლარი და {t2} თეთრი. ვის აქვს მეტი და რამდენით?',
    variables: {
      child1: { kind: 'choice', values: ['ნინოს', 'ანის', 'მარიამს'] },
      child2: { kind: 'choice', values: ['ლუკას', 'ნიკოს', 'დათოს'] },
      pack: {
        kind: 'choice',
        values: [
          '3;20;2;90;30 თეთრით;20 თეთრით;40 თეთრით;50 თეთრით',
          '2;50;2;10;40 თეთრით;30 თეთრით;50 თეთრით;20 თეთრით',
          '4;20;3;80;40 თეთრით;30 თეთრით;50 თეთრით;60 თეთრით',
          '3;40;2;80;60 თეთრით;50 თეთრით;70 თეთრით;40 თეთრით',
        ],
      },
      l1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      t1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      l2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      t2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w1Diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w2Diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w3Diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
      correct: { kind: 'choice', values: (v) => [`${v.child1}, ${v.diff}`] },
      w1: { kind: 'choice', values: (v) => [`${v.child1}, ${v.w1Diff}`] },
      w2: { kind: 'choice', values: (v) => [`${v.child2}, ${v.diff}`] },
      w3: { kind: 'choice', values: (v) => [`${v.child2}, ${v.w2Diff}`] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `მეტი აქვს: ${answer}.`,
  }),

  // Q35 — შედარება (Level 3, MC, optionCount: 3)
  defineTemplate({
    ...addr({ id: 'g2-u12-35', subtopicId: 'u12-comparing-money', difficulty: 3 }),
    prompt: '{child} ამოწმებს: შეადარე {optA} და {optB}.',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
      pack: {
        kind: 'choice',
        values: [
          '5 ლარი და 40 თეთრი;540 თეთრი',
          '6 ლარი და 20 თეთრი;620 თეთრი',
          '4 ლარი და 50 თეთრი;450 თეთრი',
          '7 ლარი და 30 თეთრი;730 თეთრი',
          '8 ლარი და 10 თეთრი;810 თეთრი',
          '3 ლარი და 90 თეთრი;390 თეთრი',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B'] },
      optA: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      optB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    optionCount: 3,
    answer: () => 'თანაბარია',
    format: { kind: 'text' },
    distractors: () => ['პირველი მეტია', 'მეორე მეტია'],
    explanation: ({ vars }) =>
      `${vars.optA} და ${vars.optB} ტოლია.`,
  }),

  // Q36 — იაფის პოვნა (Level 3, MC, optionCount: 3)
  defineTemplate({
    ...addr({ id: 'g2-u12-36', subtopicId: 'u12-comparing-money', difficulty: 3 }),
    prompt:
      'ერთი {item} ღირს {p1}, მეორე — {p2}. რომელია უფრო იაფი?',
    variables: {
      item: { kind: 'choice', values: ['სათამაშო', 'წიგნი', 'ბურთი', 'ზურგჩანთა'] },
      pack: {
        kind: 'choice',
        values: [
          '7 ლარი;650 თეთრი;მეორე',
          '5 ლარი;420 თეთრი;მეორე',
          '4 ლარი;450 თეთრი;პირველი',
          '8 ლარი;750 თეთრი;მეორე',
          '6 ლარი;630 თეთრი;პირველი',
          '9 ლარი;840 თეთრი;მეორე',
        ],
      },
      p1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      p2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    optionCount: 3,
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ answer }) =>
      answer === 'პირველი' ? ['მეორე', 'ორივე ერთნაირი ფასისაა'] : ['პირველი', 'ორივე ერთნაირი ფასისაა'],
    explanation: ({ vars, answer }) =>
      `უფრო იაფია ${answer} (${answer === 'პირველი' ? vars.p1 : vars.p2}).`,
  }),

  // =========================================================================
  // U12.7 — საკმარისი თანხა (Q37–Q42)
  // =========================================================================

  // Q37 — ჰყოფნის თუ არა ფული (Level 1, MC, optionCount: 2)
  defineTemplate({
    ...addr({ id: 'g2-u12-37', subtopicId: 'u12-sufficient-funds', difficulty: 1 }),
    prompt:
      '{child}-ს აქვს {have} ლარი. {item} ღირს {cost} ლარი. ჰყოფნის თუ არა ფული?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
        ],
      },
      item: { kind: 'choice', values: ['წიგნი', 'ალბომი', 'სათამაშო'] },
      cost: { kind: 'int', min: 2, max: 6 },
      have: { kind: 'choice', values: (v) => [Number(v.cost) + 1, Number(v.cost) + 2] },
    },
    optionCount: 2,
    answer: () => 'დიახ',
    format: { kind: 'text' },
    distractors: () => ['არა'],
    explanation: ({ vars }) =>
      `${vars.have} ლარი მეტია ${vars.cost} ლარზე, ამიტომ ფული ჰყოფნის.`,
  }),

  // Q38 — არ ჰყოფნის ფული (Level 1, MC, optionCount: 2)
  defineTemplate({
    ...addr({ id: 'g2-u12-38', subtopicId: 'u12-sufficient-funds', difficulty: 1 }),
    prompt:
      '{child}-ს აქვს {haveLari} ლარი და 50 თეთრი. {item} ღირს {costLari} ლარი. ჰყოფნის თუ არა ფული?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
        ],
      },
      item: { kind: 'choice', values: ['სათამაშო', 'წიგნი', 'ბურთი'] },
      haveLari: { kind: 'int', min: 2, max: 5 },
      costLari: { kind: 'choice', values: (v) => [Number(v.haveLari) + 1] },
    },
    optionCount: 2,
    answer: () => 'არა',
    format: { kind: 'text' },
    distractors: () => ['დიახ'],
    explanation: ({ vars }) =>
      `${vars.haveLari} ლარი და 50 თეთრი ნაკლებია ${vars.costLari} ლარზე, ამიტომ ფული არ ჰყოფნის.`,
  }),

  // Q39 — ნაშთის გამოთვლა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-39', subtopicId: 'u12-sufficient-funds', difficulty: 2 }),
    prompt:
      '{child}-ს აქვს 6 ლარი. მას უნდა იყიდოს ნივთი, რომელიც {costLari} ლარი და {costTetri} თეთრი ღირს. რამდენი დარჩება?',
    variables: {
      child: { kind: 'choice', values: ['ანა', 'ნიკო', 'მარიამი', 'გიორგი'] },
      pack: {
        kind: 'choice',
        values: [
          '4;80;1 ლარი და 20 თეთრი;1 ლარი და 30 თეთრი;2 ლარი და 20 თეთრი;120 ლარი',
          '3;50;2 ლარი და 50 თეთრი;2 ლარი და 40 თეთრი;3 ლარი და 50 თეთრი;250 ლარი',
          '2;70;3 ლარი და 30 თეთრი;3 ლარი და 20 თეთრი;2 ლარი და 30 თეთრი;330 ლარი',
          '4;40;1 ლარი და 60 თეთრი;1 ლარი და 50 თეთრი;2 ლარი და 60 თეთრი;160 ლარი',
        ],
      },
      costLari: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      costTetri: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `6 ლარი − ${vars.costLari} ლარი და ${vars.costTetri} თეთრი = ${answer}.`,
  }),

  // Q40 — შეუძლია ყიდვა და რამდენი დარჩება (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-40', subtopicId: 'u12-sufficient-funds', difficulty: 2 }),
    prompt:
      '{child}-ს აქვს 3 ლარი და 20 თეთრი. {item} ღირს 1 ლარი და 50 თეთრი. შეუძლია თუ არა {item}-ის ყიდვა და რამდენი დარჩება?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'გიორგი', 'ლუკა', 'ნიკო', 'დათო', 'საბა', 'ირაკლი',
          'ანი', 'მარიამი', 'ელენე', 'ნინო', 'სალომე', 'თემო',
        ],
      },
      item: { kind: 'choice', values: ['რვეულ', 'კალმ'] },
    },
    answer: () => 'დიახ, დარჩება 1 ლარი და 70 თეთრი',
    format: { kind: 'text' },
    distractors: () => [
      'დიახ, დარჩება 1 ლარი და 50 თეთრი',
      'არა, აკლია 30 თეთრი',
      'დიახ, დარჩება 2 ლარი',
    ],
    explanation: () =>
      '3 ლარი და 20 თეთრი − 1 ლარი და 50 თეთრი = 1 ლარი და 70 თეთრი (ყიდვა შეუძლია).',
  }),

  // Q41 — ორი ნივთის ყიდვა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-41', subtopicId: 'u12-sufficient-funds', difficulty: 3 }),
    prompt:
      '{child}-ს აქვს 8 ლარი. მას უნდა იყიდოს წიგნი 5 ლარად და კალამი 2 ლარად. ჰყოფნის თუ არა ფული და რამდენი დარჩება?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ნინო', 'ანი', 'მარიამი', 'ელენე', 'სალომე', 'თამარი',
          'ლუკა', 'ნიკო', 'გიორგი', 'დათო', 'საბა', 'ირაკლი',
        ],
      },
    },
    answer: () => 'დიახ, დარჩება 1 ლარი',
    format: { kind: 'text' },
    distractors: () => [
      'დიახ, დარჩება 2 ლარი',
      'არა, აკლია 1 ლარი',
      'დიახ, დარჩება 3 ლარი',
    ],
    explanation: () =>
      '5 + 2 = 7 ლარი. 8 − 7 = 1 ლარი დარჩება (ფული ჰყოფნის).',
  }),

  // Q42 — რამდენი აკლია (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-42', subtopicId: 'u12-sufficient-funds', difficulty: 3 }),
    prompt:
      '{child}-ს აქვს {haveLari} ლარი და {haveTetri} თეთრი. {item} ღირს {haveLari} ლარი და {costTetri} თეთრი. რამდენი თეთრი აკლია?',
    variables: {
      child: {
        kind: 'choice',
        values: ['ლუკა', 'ნიკო', 'გიორგი', 'დათო'],
      },
      item: { kind: 'choice', values: ['სათამაშო', 'წიგნი', 'ბურთი'] },
      haveLari: { kind: 'int', min: 2, max: 6 },
      haveTetri: { kind: 'choice', values: ['30', '40', '50'] },
      diff: { kind: 'choice', values: ['20', '30', '40'] },
      costTetri: { kind: 'choice', values: (v) => [Number(v.haveTetri) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 5),
    explanation: ({ vars, answer }) =>
      `${vars.costTetri} − ${vars.haveTetri} = ${answer} თეთრი აკლია.`,
  }),

  // =========================================================================
  // U12.8 — 1 ლარის შედგენა (Q43–Q48)
  // =========================================================================

  // Q43 — 20-თეთრიანებით 1 ლარი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-43', subtopicId: 'u12-making-one-lari', difficulty: 1 }),
    prompt:
      '{child}-ს აინტერესებს: რამდენი 20-თეთრიანი მონეტაა საჭირო 1 ლარის შესადგენად?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => 5,
    format: { kind: 'integer', min: 1 },
    distractors: () => [4, 10, 2],
    explanation: () => '1 ლარი = 100 თეთრი. 5 × 20 = 100 თეთრი.',
  }),

  // Q44 — ორი 20-თეთრიანის შევსება 1 ლარამდე (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-44', subtopicId: 'u12-making-one-lari', difficulty: 1 }),
    prompt:
      '{child} ადგენს 1 ლარს {coinsText} და სხვა მონეტებით. რამდენი თეთრი უნდა შეავსოს დარჩენილმა თანხამ?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
      pack: {
        kind: 'choice',
        values: [
          'ორი 20-თეთრიანი მონეტით;60',
          'სამი 20-თეთრიანი მონეტით;40',
          'ერთი 50-თეთრიანი და ერთი 20-თეთრიანი მონეტით;30',
          'ოთხი 20-თეთრიანი მონეტით;20',
          'ერთი 50-თეთრიანი და ერთი 10-თეთრიანი მონეტით;40',
          'შვიდი 10-თეთრიანი მონეტით;30',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B'] },
      coinsText: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      needed: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.needed),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 10),
    explanation: ({ vars, answer }) =>
      `1 ლარამდე (100 თეთრამდე) დარჩენილმა თანხამ უნდა შეავსოს ${answer} თეთრი.`,
  }),

  // Q45 — 50 თეთრიდან 1 ლარამდე (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-45', subtopicId: 'u12-making-one-lari', difficulty: 2 }),
    prompt:
      '{child}-ს აქვს ერთი {coin}-თეთრიანი მონეტა. კიდევ რამდენი თეთრი სჭირდება 1 ლარამდე?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
      coin: { kind: 'choice', values: ['50', '20', '10', '70'] },
    },
    answer: (v) => 100 - Number(v.coin),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 10),
    explanation: ({ vars, answer }) =>
      `100 − ${vars.coin} = ${answer} თეთრი.`,
  }),

  // Q46 — მონეტების ნაკრები რომელიც შეადგენს 1 ლარს (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-46', subtopicId: 'u12-making-one-lari', difficulty: 2 }),
    prompt:
      '{child}-ს აინტერესებს: რომელი მონეტების ნაკრები შეადგენს ზუსტად 1 ლარს?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => '50+20+20+10',
    format: { kind: 'text' },
    distractors: () => ['50+20+10', '20+20+20+20', '50+50+10'],
    explanation: () =>
      '50 + 20 + 20 + 10 = 100 თეთრი = 1 ლარი.',
  }),

  // Q47 — სამი 10-თეთრიანიდან 1 ლარამდე (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-47', subtopicId: 'u12-making-one-lari', difficulty: 3 }),
    prompt:
      'გაქვს {count} ცალი {coin}-თეთრიანი მონეტა. რამდენი თეთრი გაკლია 1 ლარამდე?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '3;10;70', '4;10;60', '2;10;80', '6;10;40', '7;10;30', '8;10;20',
          '3;20;40', '4;20;20', '2;20;60', '1;50;50', '5;10;50', '1;20;80',
        ],
      },
      count: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      coin: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      needed: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.needed),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 10),
    explanation: ({ vars, answer }) =>
      `${vars.count} × ${vars.coin} = ${Number(vars.count) * Number(vars.coin)} თეთრი. 100 − ${Number(vars.count) * Number(vars.coin)} = ${answer} თეთრი.`,
  }),

  // Q48 — 50-თეთრიანები 1 ლარში (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-48', subtopicId: 'u12-making-one-lari', difficulty: 3 }),
    prompt:
      '{child}-ს აინტერესებს: რამდენი 50-თეთრიანი მონეტა გჭირდება 1 ლარის შესადგენად?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => 2,
    format: { kind: 'integer', min: 1 },
    distractors: () => [3, 4, 1],
    explanation: () => '2 × 50 თეთრი = 100 თეთრი = 1 ლარი.',
  }),

  // =========================================================================
  // U12.9 — თანხის მიახლოებითი შეფასება (Q49–Q54)
  // =========================================================================

  // Q49 — დამრგვალება ზემოთ (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-49', subtopicId: 'u12-estimating-money', difficulty: 1 }),
    prompt:
      '{item} ღირს {lari} ლარი და {tetri} თეთრი. დაახლოებით რამდენი ლარია ეს უახლოეს მთელ ლარამდე?',
    variables: {
      item: { kind: 'choice', values: ['წიგნი', 'სათამაშო', 'ალბომი', 'ბურთი'] },
      lari: { kind: 'int', min: 2, max: 7 },
      tetri: { kind: 'choice', values: ['80', '85', '90', '95'] },
    },
    answer: (v) => Number(v.lari) + 1,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.tetri} თეთრი 50-ზე მეტია, ამიტომ მრგვალდება ზემოთ: ${answer} ლარი.`,
  }),

  // Q50 — დამრგვალება ქვემოთ (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-50', subtopicId: 'u12-estimating-money', difficulty: 1 }),
    prompt:
      '{item} ღირს {lari} ლარი და {tetri} თეთრი. დაახლოებით რამდენი ლარია ეს უახლოეს მთელ ლარამდე?',
    variables: {
      item: { kind: 'choice', values: ['ფანქარი', 'კალამი', 'რვეული', 'სანიშნი'] },
      lari: { kind: 'int', min: 2, max: 7 },
      tetri: { kind: 'choice', values: ['05', '10', '15', '20'] },
    },
    answer: (v) => Number(v.lari),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.tetri} თეთრი 50-ზე ნაკლებია, ამიტომ მრგვალდება ქვემოთ: ${answer} ლარი.`,
  }),

  // Q51 — სამი მთელი ლარის ჯამი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-51', subtopicId: 'u12-estimating-money', difficulty: 2 }),
    prompt:
      'სამი ნივთი ღირს {p1} ლარი, {p2} ლარი და {p3} ლარი. დაახლოებით რამდენია მათი საერთო ფასი?',
    variables: {
      p1: { kind: 'int', min: 2, max: 5 },
      p2: { kind: 'int', min: 2, max: 5 },
      p3: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v) => Number(v.p1) + Number(v.p2) + Number(v.p3),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.p1} + ${vars.p2} + ${vars.p3} = ${answer} ლარი.`,
  }),

  // Q52 — ორი ნივთის დამრგვალება და შეკრება (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-52', subtopicId: 'u12-estimating-money', difficulty: 2 }),
    prompt:
      'ერთი სათამაშო ღირს {l1} ლარი და 80 თეთრი, მეორე — {l2} ლარი და 20 თეთრი. უახლოეს მთელ ლარამდე დამრგვალების შემდეგ რამდენია მათი საერთო ფასი?',
    variables: {
      l1: { kind: 'int', min: 3, max: 7 },
      l2: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v) => Number(v.l1) + 1 + Number(v.l2),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.l1} ლ და 80 თ $\approx$ ${Number(vars.l1) + 1} ლარი; ${vars.l2} ლ და 20 თ $\approx$ ${vars.l2} ლარი. ჯამში: ${answer} ლარი.`,
  }),

  // Q53 — დამრგვალება ზემოთ (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-53', subtopicId: 'u12-estimating-money', difficulty: 3 }),
    prompt:
      'ნივთი ღირს {lari} ლარი და {tetri} თეთრი. უახლოეს მთელ ლარამდე დამრგვალებით რამდენი ლარია?',
    variables: {
      lari: { kind: 'int', min: 4, max: 9 },
      tetri: { kind: 'choice', values: ['60', '70', '75', '80'] },
    },
    answer: (v) => Number(v.lari) + 1,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.tetri} თეთრი $\ge 50$ თეთრი, ამიტომ მრგვალდება ზემოთ: ${answer} ლარი.`,
  }),

  // Q54 — დამრგვალება ქვემოთ (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-54', subtopicId: 'u12-estimating-money', difficulty: 3 }),
    prompt:
      'ნივთი ღირს {lari} ლარი და {tetri} თეთრი. უახლოეს მთელ ლარამდე დამრგვალებით რამდენი ლარია?',
    variables: {
      lari: { kind: 'int', min: 3, max: 9 },
      tetri: { kind: 'choice', values: ['25', '30', '35', '40'] },
    },
    answer: (v) => Number(v.lari),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.tetri} თეთრი $< 50$ თეთრი, ამიტომ მრგვალდება ქვემოთ: ${answer} ლარი.`,
  }),

  // =========================================================================
  // U12.10 — შერეული გამეორება (Q55–Q60)
  // =========================================================================

  // Q55 — ლარი და თეთრიდან თეთრების გამოკლება (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-55', subtopicId: 'u12-mixed-review', difficulty: 1 }),
    prompt:
      '{child}-ს აქვს 2 ლარი და 50 თეთრი. მან {spent} თეთრი დახარჯა. რამდენი დარჩა?',
    variables: {
      child: { kind: 'choice', values: ['ნინო', 'ლუკა', 'ანი', 'მარიამი'] },
      pack: {
        kind: 'choice',
        values: [
          '80;1 ლარი და 70 თეთრი;1 ლარი და 60 თეთრი;1 ლარი და 80 თეთრი;170 ლარი',
          '70;1 ლარი და 80 თეთრი;1 ლარი და 70 თეთრი;1 ლარი და 90 თეთრი;180 ლარი',
          '90;1 ლარი და 60 თეთრი;1 ლარი და 50 თეთრი;1 ლარი და 70 თეთრი;160 ლარი',
          '60;1 ლარი და 90 თეთრი;1 ლარი და 80 თეთრი;2 ლარი;190 ლარი',
        ],
      },
      spent: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `2 ლარი და 50 თეთრი − ${vars.spent} თეთრი = ${answer}.`,
  }),

  // Q56 — სამი ერთნაირი ნივთის ჯამური ფასი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-56', subtopicId: 'u12-mixed-review', difficulty: 1 }),
    prompt:
      'სამი {item} თითო {price} თეთრი ღირს. რამდენი ღირს სამივე ერთად?',
    variables: {
      item: { kind: 'choice', values: ['ფანქარი', 'კალამი', 'რვეული', 'სახაზავი'] },
      pack: {
        kind: 'choice',
        values: [
          '70;2 ლარი და 10 თეთრი;2 ლარი და 20 თეთრი;2 ლარი;210 ლარი',
          '60;1 ლარი და 80 თეთრი;1 ლარი და 70 თეთრი;1 ლარი და 90 თეთრი;180 ლარი',
          '80;2 ლარი და 40 თეთრი;2 ლარი და 30 თეთრი;2 ლარი და 50 თეთრი;240 ლარი',
          '50;1 ლარი და 50 თეთრი;1 ლარი და 40 თეთრი;1 ლარი და 60 თეთრი;150 ლარი',
        ],
      },
      price: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `3 × ${vars.price} თეთრი = ${Number(vars.price) * 3} თეთრი = ${answer}.`,
  }),

  // Q57 — ორი ნივთის ყიდვის შემდეგ ნაშთი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-57', subtopicId: 'u12-mixed-review', difficulty: 2 }),
    prompt:
      '{child}-ს აქვს 5 ლარი. მას სურს იყიდოს ნივთები, რომლებიც ღირს {p1Text} და {p2Text}. რამდენი დარჩება?',
    variables: {
      child: { kind: 'choice', values: ['ლუკა', 'ნიკო', 'მარიამი', 'დათო'] },
      pack: {
        kind: 'choice',
        values: [
          '1 ლარი და 50 თეთრი;2 ლარი და 20 თეთრი;1 ლარი და 30 თეთრი;1 ლარი და 20 თეთრი;1 ლარი და 40 თეთრი;130 ლარი',
          '1 ლარი და 40 თეთრი;2 ლარი და 10 თეთრი;1 ლარი და 50 თეთრი;1 ლარი და 40 თეთრი;1 ლარი და 60 თეთრი;150 ლარი',
          '2 ლარი და 20 თეთრი;1 ლარი და 60 თეთრი;1 ლარი და 20 თეთრი;1 ლარი და 10 თეთრი;1 ლარი და 30 თეთრი;120 ლარი',
          '1 ლარი და 80 თეთრი;1 ლარი და 50 თეთრი;1 ლარი და 70 თეთრი;1 ლარი და 60 თეთრი;1 ლარი და 80 თეთრი;170 ლარი',
        ],
      },
      p1Text: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      p2Text: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `დარჩება: ${answer}.`,
  }),

  // Q58 — მონეტების ჯამი vs ლარი და თეთრი (Level 2, MC, optionCount: 3)
  defineTemplate({
    ...addr({ id: 'g2-u12-58', subtopicId: 'u12-mixed-review', difficulty: 2 }),
    prompt: '{child} ამოწმებს: რომელია მეტი — {optA} თუ {optB}?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
      pack: {
        kind: 'choice',
        values: [
          'სამი 50-თეთრიანი მონეტა;1 ლარი და 40 თეთრი;სამი 50-თეთრიანი მონეტა;1 ლარი და 40 თეთრი;თანაბარია',
          'ოთხი 50-თეთრიანი მონეტა;2 ლარი და 10 თეთრი;2 ლარი და 10 თეთრი;ოთხი 50-თეთრიანი მონეტა;თანაბარია',
          'ხუთი 20-თეთრიანი მონეტა;90 თეთრი;ხუთი 20-თეთრიანი მონეტა;90 თეთრი;თანაბარია',
          'ორი 50-თეთრიანი მონეტა;1 ლარი;თანაბარია;ორი 50-თეთრიანი მონეტა;1 ლარი',
          'სამი 20-თეთრიანი მონეტა;70 თეთრი;70 თეთრი;სამი 20-თეთრიანი მონეტა;თანაბარია',
          'ორი 1-ლარიანი მონეტა;190 თეთრი;ორი 1-ლარიანი მონეტა;190 თეთრი;თანაბარია',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B'] },
      optA: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      optB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    optionCount: 3,
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2)],
    explanation: ({ answer }) =>
      `სწორი პასუხია: ${answer}.`,
  }),

  // Q59 — 10 ლარიდან ორი ნივთის ყიდვა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u12-59', subtopicId: 'u12-mixed-review', difficulty: 3 }),
    prompt:
      '{child}-ს აქვს 10 ლარი. მან იყიდა წიგნი {p1} ლარად და სათამაშო {p2} ლარად. რამდენი დარჩა?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანა', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
        ],
      },
      p1: { kind: 'choice', values: ['2', '3', '4'] },
      p2: { kind: 'choice', values: ['3', '4', '5'] },
    },
    answer: (v) => 10 - Number(v.p1) - Number(v.p2),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `10 − (${vars.p1} + ${vars.p2}) = 10 − ${Number(vars.p1) + Number(vars.p2)} = ${answer} ლარი.`,
  }),

  // Q60 — ყუთში მონეტების საერთო თანხა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u12-60', subtopicId: 'u12-mixed-review', difficulty: 3 }),
    prompt:
      '{place}-შია ორი 1-ლარიანი მონეტა, ერთი 50-თეთრიანი და {count20} 20-თეთრიანი მონეტა. რამდენია თანხა სულ?',
    variables: {
      place: { kind: 'choice', values: ['ყუთ', 'საფულე', 'ყულაბა', 'ჯიბე'] },
      pack: {
        kind: 'choice',
        values: [
          'ორი;2 ლარი და 90 თეთრი;2 ლარი და 80 თეთრი;3 ლარი;290 ლარი',
          'ერთი;2 ლარი და 70 თეთრი;2 ლარი და 60 თეთრი;2 ლარი და 80 თეთრი;270 ლარი',
          'სამი;3 ლარი და 10 თეთრი;3 ლარი;3 ლარი და 20 თეთრი;310 ლარი',
        ],
      },
      count20: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `სულ არის: ${answer}.`,
  }),
];
