import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

const addr = (base: {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
}) => ({
  grade: 3 as const,
  topicId: 'g3-wiladebi-shesavali',
  unitId: 'g3-wiladebi-shesavali',
  ...base,
});

export const G3_U15_SUBTOPICS = [
  'u15-parts-of-a-whole',
  'u15-equal-parts-halves',
  'u15-thirds-and-quarters',
] as const;

export const nearMisses = (
  target: number,
  count = 3,
  step = 1,
  minVal = 0,
): number[] => {
  const safeStep = Math.max(1, Math.abs(step));
  const result = new Set<number>();
  for (const delta of [safeStep, -safeStep, safeStep * 2, -safeStep * 2, safeStep * 3, -safeStep * 3, safeStep * 4, -safeStep * 4]) {
    const val = target + delta;
    if (val >= minVal && val !== target) {
      result.add(val);
      if (result.size >= count) break;
    }
  }
  let fallback = minVal;
  while (result.size < count) {
    if (fallback !== target) result.add(fallback);
    fallback += safeStep;
  }
  return Array.from(result).slice(0, count);
};

export const G3_U15_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // SUBTOPIC 1: u15-parts-of-a-whole (მთელის ნაწილები)
  // =========================================================================

  // Q01 — ერთი ტოლი ნაწილის ჩაწერა წილადით (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u15-01', subtopicId: 'u15-parts-of-a-whole', difficulty: 1 }),
    prompt: '{shape} გაყოფილია {parts} ტოლ ნაწილად. შეფერილია ერთი ნაწილი. რა წილადი შეესაბამება შეფერილ ნაწილს?',
    variables: {
      shape: { kind: 'choice', values: ['წრე', 'მართკუთხედი', 'კვადრატი', 'ზოლი'] },
      parts: { kind: 'choice', values: [2, 3, 4, 5, 6, 7, 8, 9, 10, 12] },
      pPlus: { kind: 'choice', values: (v: Vars) => [Number(v.parts) + 1] },
    },
    answer: (v: Vars) => `1/${v.parts}`,
    format: { kind: 'text' },
    options: (v: Vars) => [`1/${v.parts}`, `${v.parts}/1`, `1/${v.pPlus}`, `2/${v.parts}`],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `როდესაც მთელი გაყოფილია ${vars.parts} ტოლ ნაწილად, ერთი ნაწილი ჩაიწერება როგორც ${answer}.`,
  }),

  // Q02 — რამდენიმე ტოლი ნაწილის ჩაწერა წილადით (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u15-02', subtopicId: 'u15-parts-of-a-whole', difficulty: 1 }),
    prompt: '{item} გაჭრეს {n} ტოლ ნაჭრად. თეფშზე დარჩა {k} ნაჭერი. {item}-ის რა ნაწილი დარჩა?',
    variables: {
      item: { kind: 'choice', values: ['პიცა', 'ტორტი', 'ნამცხვარი', 'ღვეზელი'] },
      pair: {
        kind: 'choice',
        values: [
          '5_2', '5_3', '5_4',
          '6_2', '6_3', '6_4', '6_5',
          '7_2', '7_3', '7_4', '7_5',
          '8_3', '8_5', '8_7',
          '10_3', '10_7', '10_9',
        ],
      },
      n: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[0])] },
      k: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[1])] },
      rem: { kind: 'choice', values: (v: Vars) => [Number(v.n) - Number(v.k)] },
    },
    answer: (v: Vars) => `${v.k}/${v.n}`,
    format: { kind: 'text' },
    options: (v: Vars) => [`${v.k}/${v.n}`, `${v.n}/${v.k}`, `${v.rem}/${v.n}`, `1/${v.n}`],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.n} ტოლი ნაჭრიდან დარჩენილი ${vars.k} ნაჭერი აღინიშნება წილადით ${answer}.`,
  }),

  // Q03 — მნიშვნელის ამოცნობა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-03', subtopicId: 'u15-parts-of-a-whole', difficulty: 1 }),
    prompt: 'წილადში {k}/{n} {questionText}',
    variables: {
      pair: {
        kind: 'choice',
        values: [
          '2_5', '3_7', '4_9', '5_8', '1_6', '5_12',
          '7_10', '3_8', '4_7', '5_11', '7_12', '2_9',
          '3_10', '5_6', '8_15',
        ],
      },
      k: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[0])] },
      n: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[1])] },
      questionText: {
        kind: 'choice',
        values: [
          'რას უდრის მნიშვნელი?',
          'რომელია მნიშვნელი?',
          'იპოვე მნიშვნელი.',
        ],
      },
    },
    answer: (v: Vars) => Number(v.n),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars, answer }) => {
      const k = Number(vars.k);
      const n = Number(answer);
      const res = new Set<number>([k, n - k, n + 1, k + 1].filter((x) => x !== n && x > 0));
      return Array.from(res).slice(0, 3);
    },
    explanation: ({ vars: _vars, answer }) =>
      `წილადის ხაზის ქვემოთ წერია მნიშვნელი, რომელიც აჩვენებს, რამდენ ტოლ ნაწილადაა დაყოფილი მთელი. მნიშვნელია ${answer}.`,
  }),

  // Q04 — მრიცხველის ამოცნობა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-04', subtopicId: 'u15-parts-of-a-whole', difficulty: 2 }),
    prompt: 'წილადში {k}/{n} {questionText}',
    variables: {
      pair: {
        kind: 'choice',
        values: [
          '3_5', '2_7', '5_9', '3_8', '5_6', '7_12',
          '4_7', '6_11', '8_13', '2_9', '7_10', '9_14',
          '5_16', '7_15', '3_11',
        ],
      },
      k: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[0])] },
      n: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[1])] },
      questionText: {
        kind: 'choice',
        values: [
          'რას უდრის მრიცხველი?',
          'რომელია მრიცხველი?',
          'იპოვე მრიცხველი.',
        ],
      },
    },
    answer: (v: Vars) => Number(v.k),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars, answer }) => {
      const k = Number(answer);
      const n = Number(vars.n);
      const res = new Set<number>([n, n - k, k + 1, k - 1].filter((x) => x !== k && x > 0));
      return Array.from(res).slice(0, 3);
    },
    explanation: ({ vars: _vars, answer }) =>
      `წილადის ხაზის ზემოთ წერია მრიცხველი, რომელიც აჩვენებს, რამდენი ნაწილია აღებული. მრიცხველია ${answer}.`,
  }),

  // Q05 — დარჩენილი ნაწილის წილადი (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u15-05', subtopicId: 'u15-parts-of-a-whole', difficulty: 2 }),
    prompt: 'შოკოლადის ფილა დაყოფილია {n} ტოლ ნატეხად. {name}-მ შეჭამა {k} ნატეხი. შოკოლადის რა ნაწილი დარჩა შეუჭმელი?',
    variables: {
      name: { kind: 'choice', values: ['გიორგი', 'ნინო', 'საბა', 'მარიამი', 'ლუკა', 'ელენე', 'დათო', 'ანი'] },
      pair: {
        kind: 'choice',
        values: [
          '5_1', '5_2', '6_1', '6_2', '7_2', '7_3',
          '8_3', '8_5', '9_2', '9_4', '10_3', '10_7',
          '12_5', '12_7',
        ],
      },
      n: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[0])] },
      k: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[1])] },
      rem: { kind: 'choice', values: (v: Vars) => [Number(v.n) - Number(v.k)] },
    },
    answer: (v: Vars) => `${Number(v.n) - Number(v.k)}/${v.n}`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `${Number(v.n) - Number(v.k)}/${v.n}`,
      `${v.k}/${v.n}`,
      `1/${v.n}`,
      `${Number(v.n) - Number(v.k)}/${Number(v.n) + 1}`,
    ],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `სულ იყო ${vars.n} ნაწილი. ${vars.n} - ${vars.k} = ${vars.rem} ნაწილი დარჩა, რაც არის ${answer}.`,
  }),

  // Q06 — რამდენი წილადი ნაწილი ქმნის 1 მთელს? (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-06', subtopicId: 'u15-parts-of-a-whole', difficulty: 2 }),
    prompt: 'რამდენი {partName} {verb}?',
    variables: {
      item: {
        kind: 'choice',
        values: [
          'ნახევარი_2', 'მესამედი_3', 'მეოთხედი_4', 'მეხუთედი_5',
          'მეექვსედი_6', 'მეშვიდედი_7', 'მერვედი_8', 'მეცხრედი_9',
          'მეათედი_10', 'მეთორმეტედი_12', 'მეოცედი_20', 'მეასედი_100',
        ],
      },
      partName: { kind: 'choice', values: (v: Vars) => [String(v.item).split('_')[0]] },
      val: { kind: 'choice', values: (v: Vars) => [Number(String(v.item).split('_')[1])] },
      verb: {
        kind: 'choice',
        values: [
          'შეადგენს 1 მთელს',
          'ქმნის ერთ მთელს',
          'არის საჭირო 1 მთელის შესადგენად',
        ],
      },
    },
    answer: (v: Vars) => Number(v.val),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `1 მთელი უდრის ${answer}/${answer}-ს, ამიტომ საჭიროა ${answer} ცალი ${vars.partName}.`,
  }),

  // Q07 — სიმრავლის 1/n ნაწილი (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-07', subtopicId: 'u15-parts-of-a-whole', difficulty: 3 }),
    prompt: 'კალათაში სულ {total} {fruit}ა. მათი 1/{denom} ნაწილი {color}ია. რამდენი {color} {fruit}ა კალათაში?',
    variables: {
      fruit: { kind: 'choice', values: ['ვაშლი', 'მსხალი', 'ატამი', 'ქლიავი'] },
      color: { kind: 'choice', values: ['წითელი', 'ყვითელი', 'მწვანე'] },
      pair: {
        kind: 'choice',
        values: [
          '5_15', '5_20', '5_25', '5_30', '5_35',
          '6_18', '6_24', '6_30', '6_36', '6_42',
          '7_14', '7_21', '7_28', '7_35',
          '8_16', '8_24', '8_32', '8_40',
          '10_20', '10_30', '10_40', '10_50',
        ],
      },
      denom: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[0])] },
      total: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[1])] },
    },
    answer: (v: Vars) => Number(v.total) / Number(v.denom),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.total}-ის 1/${vars.denom} ნაწილის საპოვნელად მთლიანი რაოდენობა უნდა გავყოთ ${vars.denom}-ზე: ${vars.total} ÷ ${vars.denom} = ${answer}.`,
  }),

  // Q08 — ნაწილის გაცემის შემდეგ დარჩენილი რაოდენობა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-08', subtopicId: 'u15-parts-of-a-whole', difficulty: 3 }),
    prompt: 'ყუთში იყო {total} {item}. {name}-მ მეგობარს მისცა ამ {item}-ების 1/{denom} ნაწილი. რამდენი {item} დარჩა {name}-ს?',
    variables: {
      name: { kind: 'choice', values: ['დათო', 'ნინო', 'სანდრო', 'ელენე', 'გიორგი', 'ანი', 'ლუკა'] },
      item: { kind: 'choice', values: ['ფანქარი', 'ბუშტი', 'სტიკერი', 'მარკერი'] },
      pair: {
        kind: 'choice',
        values: [
          '4_20', '4_28', '4_32', '4_36',
          '5_25', '5_35', '5_40', '5_50',
          '6_24', '6_36', '6_48',
          '7_28', '7_35', '7_42',
          '8_24', '8_32', '8_48',
          '10_30', '10_40', '10_60',
        ],
      },
      denom: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[0])] },
      total: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[1])] },
    },
    answer: (v: Vars) => Number(v.total) - Number(v.total) / Number(v.denom),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) => {
      const given = Number(vars.total) / Number(vars.denom);
      return `მეგობარს მისცა: ${vars.total} ÷ ${vars.denom} = ${given}. დარჩა: ${vars.total} - ${given} = ${answer}.`;
    },
  }),

  // =========================================================================
  // SUBTOPIC 2: u15-equal-parts-halves (ტოლი ნაწილები და ნახევარი)
  // =========================================================================

  // Q09 — ლუწი რიცხვის ნახევრის პოვნა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-09', subtopicId: 'u15-equal-parts-halves', difficulty: 1 }),
    prompt: 'რამდენია {n}-ის ნახევარი? {variant}',
    variables: {
      n: { kind: 'int', min: 14, max: 98, step: 2 },
      variant: {
        kind: 'choice',
        values: [
          'გამოთვალე.',
          'იპოვე სწორი პასუხი.',
          'ჩაწერე შედეგი.',
        ],
      },
    },
    answer: (v: Vars) => Number(v.n) / 2,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.n}-ის ნახევარი არის: ${vars.n} ÷ 2 = ${answer}.`,
  }),

  // Q10 — მთელის პოვნა ნახევრიდან (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-10', subtopicId: 'u15-equal-parts-halves', difficulty: 1 }),
    prompt: 'თუ რიცხვის ნახევარია {half}, რა არის მთელი რიცხვი? {variant}',
    variables: {
      half: { kind: 'int', min: 7, max: 49 },
      variant: {
        kind: 'choice',
        values: [
          'გამოთვალე.',
          'იპოვე სწორი პასუხი.',
          'ჩაწერე შედეგი.',
        ],
      },
    },
    answer: (v: Vars) => Number(v.half) * 2,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) =>
      `თუ ნახევარია ${vars.half}, მაშინ მთელი რიცხვია: ${vars.half} × 2 = ${answer}.`,
  }),

  // Q11 — სიგრძის გაყოფა შუაზე (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-11', subtopicId: 'u15-equal-parts-halves', difficulty: 1 }),
    prompt: '{name}-ს ჰქონდა {length} სმ სიგრძის {item}. მან ის გაჭრა შუაზე (ორ ტოლ ნაწილად). რა სიგრძისაა თითოეული ნაჭერი (სმ)?',
    variables: {
      name: { kind: 'choice', values: ['მარიამ', 'ლუკა', 'საბა', 'ნინო', 'დათო', 'ელენე', 'ანი', 'გიორგი'] },
      item: { kind: 'choice', values: ['ლენტი', 'თოკი', 'მავთული', 'ზოლი'] },
      length: {
        kind: 'choice',
        values: [16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 90, 100],
      },
    },
    answer: (v: Vars) => Number(v.length) / 2,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) =>
      `შუაზე გაჭრა ნიშნავს ორ ტოლ ნაწილად გაყოფას: ${vars.length} ÷ 2 = ${answer} სმ.`,
  }),

  // Q12 — რაოდენობის განახევრება (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-12', subtopicId: 'u15-equal-parts-halves', difficulty: 2 }),
    prompt: '{name1}-ს ჰქონდა {total} {item}. მან ნახევარი მისცა {name2}-ს. რამდენი {item} დარჩა {name1}-ს?',
    variables: {
      name1: { kind: 'choice', values: ['დათო', 'გიორგი', 'ლუკა', 'ნიკო', 'საბა'] },
      name2: { kind: 'choice', values: ['ანას', 'მარიამს', 'ნინოს', 'ელენეს', 'თეკლას'] },
      item: { kind: 'choice', values: ['კანფეტი', 'კაკალი', 'სტიკერი', 'ბურთულა'] },
      total: {
        kind: 'choice',
        values: [18, 22, 26, 34, 38, 42, 46, 54, 58, 62, 66, 74, 82, 86, 94],
      },
    },
    answer: (v: Vars) => Number(v.total) / 2,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.total}-ის ნახევარია: ${vars.total} ÷ 2 = ${answer}.`,
  }),

  // Q13 — ორსვლიანი ამოცანა ნახევარზე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-13', subtopicId: 'u15-equal-parts-halves', difficulty: 2 }),
    prompt: '{name}-ს ჰქონდა {total} ლარი. მან ნახევარი გადაიხადა წიგნში, ხოლო {spent} ლარად იყიდა რვეული. რამდენი ლარი დარჩა მას?',
    variables: {
      name: { kind: 'choice', values: ['ნიკა', 'სალომე', 'თემო', 'საბა', 'ნინო', 'ირაკლი', 'მარიამი'] },
      pair: {
        kind: 'choice',
        values: [
          '24_4', '28_5', '32_6', '36_6', '40_5',
          '44_7', '48_8', '50_10', '60_12', '70_15',
          '80_15', '90_20', '100_25',
        ],
      },
      total: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[0])] },
      spent: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[1])] },
    },
    answer: (v: Vars) => Number(v.total) / 2 - Number(v.spent),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 0),
    explanation: ({ vars, answer }) => {
      const half = Number(vars.total) / 2;
      return `წიგნის შემდეგ დარჩა: ${vars.total} ÷ 2 = ${half} ლარი. რვეულის ყიდვის შემდეგ: ${half} - ${vars.spent} = ${answer} ლარი.`;
    },
  }),

  // Q14 — ორი რიცხვის ნახევრის შედარება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u15-14', subtopicId: 'u15-equal-parts-halves', difficulty: 2 }),
    prompt: 'რომელია მეტი: {a}-ის ნახევარი თუ {b}-ის ნახევარი? {variant}',
    variables: {
      pair: {
        kind: 'choice',
        values: [
          '40_60', '50_30', '70_90', '80_40', '24_36',
          '48_32', '64_56', '90_70', '100_80', '36_44',
          '52_68', '84_96', '72_60', '66_78',
        ],
      },
      a: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[0])] },
      b: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[1])] },
      variant: {
        kind: 'choice',
        values: [
          'აირჩიე სწორი პასუხი.',
          'მონიშნე სწორი ვარიანტი.',
          'რომელია სწორი?',
        ],
      },
    },
    answer: (v: Vars) => (Number(v.a) > Number(v.b) ? `${v.a}-ის ნახევარი` : `${v.b}-ის ნახევარი`),
    format: { kind: 'text' },
    options: (v: Vars) => [`${v.a}-ის ნახევარი`, `${v.b}-ის ნახევარი`, 'ტოლია'],
    optionCount: 3,
    explanation: ({ vars, answer }) => {
      const hA = Number(vars.a) / 2;
      const hB = Number(vars.b) / 2;
      return `${vars.a}-ის ნახევარია ${hA}, ხოლო ${vars.b}-ის ნახევარია ${hB}. მეტია ${answer}.`;
    },
  }),

  // Q15 — ნახევრის ნახევარი (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-15', subtopicId: 'u15-equal-parts-halves', difficulty: 3 }),
    prompt: 'რიცხვი {n} {wording}. რა რიცხვი მივიღეთ?',
    variables: {
      n: {
        kind: 'choice',
        values: [24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 80, 84, 88, 96, 100],
      },
      wording: {
        kind: 'choice',
        values: [
          'ჯერ გავანახევრეთ, შემდეგ მიღებული შედეგიც გავანახევრეთ',
          'ორჯერ მიყოლებით გავანახევრეთ',
          'გავყავით ორზე და მიღებული შედეგი ისევ გავყავით ორზე',
        ],
      },
    },
    answer: (v: Vars) => Number(v.n) / 4,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => {
      const first = Number(vars.n) / 2;
      return `პირველი განახევრება: ${vars.n} ÷ 2 = ${first}. მეორე განახევრება: ${first} ÷ 2 = ${answer}.`;
    },
  }),

  // Q16 — უკუგამოთვლის ამოცანა ნახევარზე (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-16', subtopicId: 'u15-equal-parts-halves', difficulty: 3 }),
    prompt: '{name}-მ ჩაიფიქრა რიცხვი, გაანახევრა ის და მიღებულ შედეგს {op} {val}. მიიღო {target}. რა რიცხვი ჩაიფიქრა {name}-მ?',
    variables: {
      name: { kind: 'choice', values: ['ანი', 'ლუკა', 'საბა', 'მარიამი', 'დათო', 'გიორგი', 'ელენე', 'ნიკო'] },
      pair: {
        kind: 'choice',
        values: [
          'მიუმატა_5_20', 'მიუმატა_6_21', 'მიუმატა_7_22', 'მიუმატა_8_25',
          'მიუმატა_10_30', 'მიუმატა_12_35', 'გამოაკლო_4_16', 'გამოაკლო_5_20',
          'გამოაკლო_6_19', 'გამოაკლო_8_22', 'გამოაკლო_10_25', 'მიუმატა_9_31',
          'გამოაკლო_7_23', 'მიუმატა_11_33',
        ],
      },
      op: { kind: 'choice', values: (v: Vars) => [String(v.pair).split('_')[0]] },
      val: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[1])] },
      target: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[2])] },
    },
    answer: (v: Vars) => {
      const half = v.op === 'მიუმატა'
        ? Number(v.target) - Number(v.val)
        : Number(v.target) + Number(v.val);
      return half * 2;
    },
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) => {
      const half = vars.op === 'მიუმატა'
        ? Number(vars.target) - Number(vars.val)
        : Number(vars.target) + Number(vars.val);
      const sign = vars.op === 'მიუმატა' ? '-' : '+';
      return `ჩაფიქრებული რიცხვის ნახევარია: ${vars.target} ${sign} ${vars.val} = ${half}. მთელი რიცხვია: ${half} × 2 = ${answer}.`;
    },
  }),

  // =========================================================================
  // SUBTOPIC 3: u15-thirds-and-quarters (მესამედი და მეოთხედი)
  // =========================================================================

  // Q17 — რიცხვის მესამედის პოვნა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-17', subtopicId: 'u15-thirds-and-quarters', difficulty: 1 }),
    prompt: 'რამდენია {n}-ის მესამედი? {variant}',
    variables: {
      n: {
        kind: 'choice',
        values: [12, 15, 18, 21, 24, 27, 30, 33, 36, 42, 45, 48, 51, 60, 75, 90],
      },
      variant: {
        kind: 'choice',
        values: [
          'გამოთვალე.',
          'იპოვე სწორი პასუხი.',
          'ჩაწერე შედეგი.',
        ],
      },
    },
    answer: (v: Vars) => Number(v.n) / 3,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.n}-ის მესამედია: ${vars.n} ÷ 3 = ${answer}.`,
  }),

  // Q18 — რიცხვის მეოთხედის პოვნა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-18', subtopicId: 'u15-thirds-and-quarters', difficulty: 1 }),
    prompt: 'რამდენია {n}-ის მეოთხედი? {variant}',
    variables: {
      n: {
        kind: 'choice',
        values: [12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 60, 68, 72, 80, 100],
      },
      variant: {
        kind: 'choice',
        values: [
          'გამოთვალე.',
          'იპოვე სწორი პასუხი.',
          'ჩაწერე შედეგი.',
        ],
      },
    },
    answer: (v: Vars) => Number(v.n) / 4,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.n}-ის მეოთხედია: ${vars.n} ÷ 4 = ${answer}.`,
  }),

  // Q19 — მთელის პოვნა მესამედიდან ან მეოთხედიდან (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-19', subtopicId: 'u15-thirds-and-quarters', difficulty: 2 }),
    prompt: 'თუ რიცხვის {fractionWord}ია {part}, რა არის მთელი რიცხვი?',
    variables: {
      item: {
        kind: 'choice',
        values: [
          'მესამედ_3_5', 'მესამედ_3_7', 'მესამედ_3_9', 'მესამედ_3_12',
          'მესამედ_3_15', 'მესამედ_3_18', 'მესამედ_3_20', 'მესამედ_3_25',
          'მეოთხედ_4_4', 'მეოთხედ_4_6', 'მეოთხედ_4_8', 'მეოთხედ_4_11',
          'მეოთხედ_4_14', 'მეოთხედ_4_16', 'მეოთხედ_4_20', 'მეოთხედ_4_25',
        ],
      },
      fractionWord: { kind: 'choice', values: (v: Vars) => [String(v.item).split('_')[0]] },
      factor: { kind: 'choice', values: (v: Vars) => [Number(String(v.item).split('_')[1])] },
      part: { kind: 'choice', values: (v: Vars) => [Number(String(v.item).split('_')[2])] },
    },
    answer: (v: Vars) => Number(v.part) * Number(v.factor),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) =>
      `თუ ${vars.fractionWord}ია ${vars.part}, მაშინ მთელი რიცხვია: ${vars.part} × ${vars.factor} = ${answer}.`,
  }),

  // Q20 — 2/3 ან 3/4 ნაწილის გამოთვლა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-20', subtopicId: 'u15-thirds-and-quarters', difficulty: 2 }),
    prompt: 'რამდენია {n}-ის {fractionExpr} ნაწილი?',
    variables: {
      item: {
        kind: 'choice',
        values: [
          '2/3_12_8', '2/3_15_10', '2/3_18_12', '2/3_21_14',
          '2/3_24_16', '2/3_27_18', '2/3_30_20', '2/3_36_24',
          '3/4_12_9', '3/4_16_12', '3/4_20_15', '3/4_24_18',
          '3/4_28_21', '3/4_32_24', '3/4_36_27', '3/4_40_30',
        ],
      },
      fractionExpr: { kind: 'choice', values: (v: Vars) => [String(v.item).split('_')[0]] },
      n: { kind: 'choice', values: (v: Vars) => [Number(String(v.item).split('_')[1])] },
      expected: { kind: 'choice', values: (v: Vars) => [Number(String(v.item).split('_')[2])] },
    },
    answer: (v: Vars) => Number(v.expected),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => {
      const denom = vars.fractionExpr === '2/3' ? 3 : 4;
      const num = vars.fractionExpr === '2/3' ? 2 : 3;
      const onePart = Number(vars.n) / denom;
      return `${vars.n} ÷ ${denom} = ${onePart}. ${onePart} × ${num} = ${answer}.`;
    },
  }),

  // Q21 — ერთეულოვანი წილადების შედარება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u15-21', subtopicId: 'u15-thirds-and-quarters', difficulty: 2 }),
    prompt: 'რომელი წილადია მეტი: 1/{d1} თუ 1/{d2}? {variant}',
    variables: {
      pair: {
        kind: 'choice',
        values: [
          '2_3', '3_4', '4_5', '5_6', '2_5',
          '3_6', '4_8', '2_8', '3_8', '5_10',
          '6_9', '7_10', '4_10', '2_4', '3_5',
        ],
      },
      d1: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[0])] },
      d2: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[1])] },
      variant: {
        kind: 'choice',
        values: [
          'აირჩიე სწორი პასუხი.',
          'მონიშნე სწორი ვარიანტი.',
          'რომელია სწორი?',
        ],
      },
    },
    answer: (v: Vars) => `1/${Math.min(Number(v.d1), Number(v.d2))}`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `1/${Math.min(Number(v.d1), Number(v.d2))}`,
      `1/${Math.max(Number(v.d1), Number(v.d2))}`,
      'ტოლია',
    ],
    optionCount: 3,
    explanation: ({ vars, answer }) => {
      const minD = Math.min(Number(vars.d1), Number(vars.d2));
      const maxD = Math.max(Number(vars.d1), Number(vars.d2));
      return `რაც უფრო ნაკლებ ტოლ ნაწილადაა დაყოფილი მთელი, მით უფრო დიდია თითოეული ნაწილი. 1/${minD} > 1/${maxD}, ამიტომ მეტია ${answer}.`;
    },
  }),

  // Q22 — ტექსტური ამოცანა წასაკითხ გვერდებზე (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-22', subtopicId: 'u15-thirds-and-quarters', difficulty: 3 }),
    prompt: 'წიგნში სულ {pages} გვერდია. {name}-მ წაიკითხა მთელი წიგნის {fracWord}ი. რამდენი გვერდი დარჩა მას წასაკითხი?',
    variables: {
      name: { kind: 'choice', values: ['მარიამ', 'ლუკა', 'სალომე', 'გიორგი', 'ნინო', 'საბა', 'ელენე'] },
      item: {
        kind: 'choice',
        values: [
          'მესამედ_3_36', 'მესამედ_3_45', 'მესამედ_3_54', 'მესამედ_3_60',
          'მესამედ_3_72', 'მესამედ_3_90', 'მეოთხედ_4_40', 'მეოთხედ_4_48',
          'მეოთხედ_4_56', 'მეოთხედ_4_64', 'მეოთხედ_4_76', 'მეოთხედ_4_84',
          'მეოთხედ_4_100',
        ],
      },
      fracWord: { kind: 'choice', values: (v: Vars) => [String(v.item).split('_')[0]] },
      denom: { kind: 'choice', values: (v: Vars) => [Number(String(v.item).split('_')[1])] },
      pages: { kind: 'choice', values: (v: Vars) => [Number(String(v.item).split('_')[2])] },
    },
    answer: (v: Vars) => Number(v.pages) - Number(v.pages) / Number(v.denom),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) => {
      const read = Number(vars.pages) / Number(vars.denom);
      return `წაიკითხა: ${vars.pages} ÷ ${vars.denom} = ${read} გვერდი. დარჩა წასაკითხი: ${vars.pages} - ${read} = ${answer} გვერდი.`;
    },
  }),

  // Q23 — ორსვლიანი განაწილების ამოცანა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-23', subtopicId: 'u15-thirds-and-quarters', difficulty: 3 }),
    prompt: '{place} სულ {total} ცხოველია. მათი ნახევარი არის ძროხა, ხოლო დარჩენილების {fracWord}ია ცხვარი. რამდენი ცხვარია {place}?',
    variables: {
      place: { kind: 'choice', values: ['ფერმაში', 'ნაკრძალში', 'სოფლის მეურნეობაში'] },
      item: {
        kind: 'choice',
        values: [
          'მესამედ_3_24', 'მესამედ_3_30', 'მესამედ_3_36', 'მესამედ_3_42',
          'მესამედ_3_48', 'მესამედ_3_54', 'მესამედ_3_60', 'მესამედ_3_72',
          'მეოთხედ_4_24', 'მეოთხედ_4_32', 'მეოთხედ_4_40', 'მეოთხედ_4_48',
          'მეოთხედ_4_56', 'მეოთხედ_4_64', 'მეოთხედ_4_80', 'მეოთხედ_4_96',
        ],
      },
      fracWord: { kind: 'choice', values: (v: Vars) => [String(v.item).split('_')[0]] },
      denom: { kind: 'choice', values: (v: Vars) => [Number(String(v.item).split('_')[1])] },
      total: { kind: 'choice', values: (v: Vars) => [Number(String(v.item).split('_')[2])] },
    },
    answer: (v: Vars) => (Number(v.total) / 2) / Number(v.denom),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => {
      const remaining = Number(vars.total) / 2;
      return `დარჩენილი ცხოველებია: ${vars.total} ÷ 2 = ${remaining}. ცხვარია: ${remaining} ÷ ${vars.denom} = ${answer}.`;
    },
  }),

  // Q24 — მესამედისა და მეოთხედის სხვაობა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u15-24', subtopicId: 'u15-thirds-and-quarters', difficulty: 3 }),
    prompt: 'რამდენით მეტია {n1}-ის მესამედი {n2}-ის მეოთხედზე? {variant}',
    variables: {
      pair: {
        kind: 'choice',
        values: [
          '30_20', '36_24', '45_28', '48_32', '60_36',
          '33_16', '42_40', '54_44', '27_12', '39_28',
          '51_48', '63_52', '72_60', '90_80',
        ],
      },
      n1: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[0])] },
      n2: { kind: 'choice', values: (v: Vars) => [Number(String(v.pair).split('_')[1])] },
      variant: {
        kind: 'choice',
        values: [
          'გამოთვალე.',
          'იპოვე სხვაობა.',
          'ჩაწერე შედეგი.',
        ],
      },
    },
    answer: (v: Vars) => Number(v.n1) / 3 - Number(v.n2) / 4,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => {
      const third = Number(vars.n1) / 3;
      const quarter = Number(vars.n2) / 4;
      return `${vars.n1}-ის მესამედია ${third}, ხოლო ${vars.n2}-ის მეოთხედია ${quarter}. სხვაობა: ${third} - ${quarter} = ${answer}.`;
    },
  }),
];
