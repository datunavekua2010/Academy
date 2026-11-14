import { defineTemplate, QuestionTemplate } from './types';

/**
 * Grade 2 — Unit 08: მრავალსაფეხურიანი ამოცანები (Multi-step Problems)
 *
 * Covers 12 subtopics (60 templates total: Q01–Q60, 5 per subtopic):
 *   U08.1 — ჯამებისა და სხვაობების გათანაბრება (u08-equalizing-sums-diffs)
 *   U08.2 — შეკრებისა და გამოკლების სხვადასხვა ხერხი (u08-ways-to-add-subtract)
 *   U08.3 — ჭეშმარიტი და მცდარი ტოლობები (u08-true-false-equalities)
 *   U08.4 — შეკრება და გამოკლება 100-ის ფარგლებში (u08-add-subtract-within-100)
 *   U08.5 — ცხრილის წესის პოვნა (u08-table-rules-100)
 *   U08.6 — შეკრებისა და გამოკლების ნიშნების ჩასმა (u08-placing-plus-minus)
 *   U08.7 — გამოსახულებების დალაგება (u08-which-in-order)
 *   U08.8 — ტექსტური და მრავალსაფეხურიანი ამოცანები (u08-word-problems-multistep)
 *   U08.9 — რაოდენობების გათანაბრება (u08-equalizing-quantities)
 *   U08.10 — მანძილის ამოცანები (u08-distance-problems)
 *   U08.11 — ფრჩხილები გამოსახულებებში (u08-brackets)
 *   U08.12 — შეკრებისა და გამოკლების დალაგება (u08-sorting-add-subtract)
 */

export const G2_U08_SUBTOPICS = [
  'u08-equalizing-sums-diffs',
  'u08-ways-to-add-subtract',
  'u08-true-false-equalities',
  'u08-add-subtract-within-100',
  'u08-table-rules-100',
  'u08-placing-plus-minus',
  'u08-which-in-order',
  'u08-word-problems-multistep',
  'u08-equalizing-quantities',
  'u08-distance-problems',
  'u08-brackets',
  'u08-sorting-add-subtract',
] as const;

export type G2U08SubtopicId = (typeof G2_U08_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G2U08SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 2 as const,
  topicId: 'g2-mravalnabijiani-amocanebi' as const,
  unitId: 'g2-mravalnabijiani-amocanebi' as const,
  ...options,
});

/** Helper to generate distinct integer distractors near an answer. */
export function nearMisses(answer: number, count = 3, min = 0, step = 1): number[] {
  const result = new Set<number>();
  const deltas = [step, -step, 2 * step, -2 * step, 3 * step, -3 * step, 10, -10, 5, -5];
  for (const delta of deltas) {
    const val = answer + delta;
    if (val >= min && val !== answer) {
      result.add(val);
      if (result.size >= count) break;
    }
  }
  let fallback = 1;
  while (result.size < count) {
    const val = answer + fallback * step;
    if (val >= min && val !== answer) {
      result.add(val);
    }
    fallback += 1;
  }
  return Array.from(result);
}

export const G2_U08_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U08.1 — ჯამებისა და სხვაობების გათანაბრება (Q01–Q05)
  // =========================================================================

  // Q01 — ყუთების გათანაბრება დამატებით (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-01', subtopicId: 'u08-equalizing-sums-diffs', difficulty: 1 }),
    prompt:
      'ერთ ყუთში {a} {item}ია, მეორეში — {b}.\n\n' +
      'რამდენი {item} უნდა დაამატო მეორე ყუთს, რომ ორივეში თანაბარი რაოდენობა იყოს?',
    variables: {
      b: { kind: 'int', min: 14, max: 35 },
      diff: { kind: 'int', min: 4, max: 18 },
      item: { kind: 'choice', values: ['ფანქარ', 'კალამ', 'ფლომასტერ'] },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.b) + Number(v.diff))],
      },
      a: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer} ${vars.item}ი.`,
  }),

  // Q02 — კალათების გათანაბრება გადატანით (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-02', subtopicId: 'u08-equalizing-sums-diffs', difficulty: 2 }),
    prompt:
      'პირველ კალათაში {a} {item}ია, მეორეში — {b}.\n\n' +
      'რამდენი {item} უნდა გადაიტანო პირველიდან მეორეში, რომ ორივე კალათაში თანაბარი რაოდენობა დარჩეს?',
    variables: {
      b: { kind: 'int', min: 16, max: 40 },
      transfer: { kind: 'int', min: 2, max: 9 },
      item: { kind: 'choice', values: ['ვაშლ', 'მსხალ', 'ატამ'] },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.b) + 2 * Number(v.transfer))],
      },
      a: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.transfer),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => {
      const half = Number(vars.b) + Number(vars.transfer);
      return `${vars.a} − ${answer} = ${vars.b} + ${answer} = ${half}. უნდა გადავიტანოთ ${answer} ${vars.item}ი.`;
    },
  }),

  // Q03 — ტოლი ჯამების პოვნა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-03', subtopicId: 'u08-equalizing-sums-diffs', difficulty: 2 }),
    prompt:
      'ერთ რიცხვს ემატება {add1}, მეორეს — {add2}. პირველი ჯამია {sum}.\n\n' +
      'რა უნდა იყოს მეორე რიცხვი, რომ მეორე ჯამიც {sum} გამოვიდეს?',
    variables: {
      sum: { kind: 'int', min: 38, max: 80 },
      add1: { kind: 'int', min: 12, max: 25 },
      diff: { kind: 'int', min: 2, max: 10 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const s = Number(v.sum);
          const a1 = Number(v.add1);
          const d = Number(v.diff);
          const a2 = a1 - d;
          const ans = s - a2;
          return [`${a2};${ans}`];
        },
      },
      add2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `მეორე ჯამიც უნდა იყოს ${vars.sum}. მეორე რიცხვია ${vars.sum} − ${vars.add2} = ${answer}.`,
  }),

  // Q04 — ქულების გათანაბრება (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-04', subtopicId: 'u08-equalizing-sums-diffs', difficulty: 1 }),
    prompt:
      '{name1}-ს {a} ქულა აქვს, {name2}-ს — {b}.\n\n' +
      'რამდენი ქულა უნდა მოემატოს {name2}-ს, რომ {name1}-ის ქულებს გაუტოლდეს?',
    variables: {
      b: { kind: 'int', min: 22, max: 55 },
      diff: { kind: 'int', min: 6, max: 20 },
      pair: {
        kind: 'choice',
        values: ['ნიკა;ლუკა', 'ანა;მარიამ', 'გიორგი;დათო', 'საბა;ლევან'],
      },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.b) + Number(v.diff);
          const [n1, n2] = String(v.pair).split(';');
          return [`${a};${n1};${n2}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      name1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      name2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer} ქულა.`,
  }),

  // Q05 — სხვაობის ცვლილება დაკლებით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u08-05', subtopicId: 'u08-equalizing-sums-diffs', difficulty: 3 }),
    prompt:
      'ორი რიცხვის სხვაობაა {diff}. თუ დიდ რიცხვს {k}-ით შევამცირებთ, ხოლო პატარას არ შევცვლით, რა იქნება ახალი სხვაობა?',
    variables: {
      diff: { kind: 'int', min: 12, max: 25 },
      k: { kind: 'int', min: 3, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const d = Number(v.diff);
          const k = Number(v.k);
          const correct = d - k;
          const w1 = d;
          const w2 = d + k;
          const w3 = k;
          return [`${correct};${w1};${w2};${w3}`];
        },
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `დიდი რიცხვის ${vars.k}-ით შემცირებით სხვაობაც ${vars.k}-ით შემცირდება: ${vars.diff} − ${vars.k} = ${answer}.`,
  }),

  // =========================================================================
  // U08.2 — შეკრებისა და გამოკლების სხვადასხვა ხერხი (Q06–Q10)
  // =========================================================================

  // Q06 — შეკრება გადაჯგუფებით (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-06', subtopicId: 'u08-ways-to-add-subtract', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b}.',
    variables: {
      t1: { kind: 'int', min: 2, max: 5 },
      t2: { kind: 'int', min: 1, max: 4 },
      o1: { kind: 'int', min: 4, max: 9 },
      o2: { kind: 'int', min: 4, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.t1) * 10 + Number(v.o1);
          const b = Number(v.t2) * 10 + Number(v.o2);
          const sum = a + b;
          return [`${a};${b};${sum}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      sum: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.sum),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q07 — შეკრება მოხერხებული ხერხით (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-07', subtopicId: 'u08-ways-to-add-subtract', difficulty: 2 }),
    prompt:
      'გამოთვალე მოხერხებული ხერხით:\n\n' +
      '{a} + {b}\n\n' +
      '(მითითება: დაამრგვალე {b} უახლოეს ათეულამდე და გამოაკელი სხვაობა)',
    variables: {
      a: { kind: 'int', min: 25, max: 55 },
      bOption: { kind: 'choice', values: ['19', '29', '39', '18', '28'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const b = Number(v.bOption);
          const sum = a + b;
          const rounded = b % 10 === 9 ? b + 1 : b + 2;
          const diff = rounded - b;
          return [`${sum};${rounded};${diff}`];
        },
      },
      sum: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      rounded: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      b: { kind: 'choice', values: (v) => [String(v.bOption)] },
    },
    answer: (v) => Number(v.sum),
    format: { kind: 'integer', min: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 20, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${vars.a} + ${vars.rounded} − ${vars.diff} = ${answer}.`,
  }),

  // Q08 — გამოკლება გადაჯგუფებით (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-08', subtopicId: 'u08-ways-to-add-subtract', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} − {b}.',
    variables: {
      t1: { kind: 'int', min: 4, max: 8 },
      t2: { kind: 'int', min: 1, max: 3 },
      o1: { kind: 'int', min: 1, max: 4 },
      o2: { kind: 'int', min: 5, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.t1) * 10 + Number(v.o1);
          const b = Number(v.t2) * 10 + Number(v.o2);
          const diff = a - b;
          return [`${a};${b};${diff}`];
        },
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q09 — რიცხვის ეტაპობრივი გამოკლება (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u08-09', subtopicId: 'u08-ways-to-add-subtract', difficulty: 2 }),
    prompt: 'რომელი გამოსახულებაა {a} − {b}-ის ტოლი?',
    variables: {
      a: { kind: 'choice', values: ['40', '50', '60', '70', '80'] },
      tens: { kind: 'choice', values: ['1', '2', '3'] },
      ones: { kind: 'choice', values: ['4', '5', '6', '7', '8'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const t = Number(v.tens);
          const o = Number(v.ones);
          const b = t * 10 + o;
          const correct = `${a} − ${t * 10} − ${o}`;
          const w1 = `${a} − ${t * 10} + ${o}`;
          const w2 = `${a} − ${(t + 1) * 10} − ${o}`;
          const w3 = `${a} − ${b} + 10`;
          return [`${b};${correct};${w1};${w2};${w3}`];
        },
      },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.b} დაიშლება როგორც ათეული და ერთეული, ამიტომ: ${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q10 — სამნაბიჯიანი გამოთვლა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-10', subtopicId: 'u08-ways-to-add-subtract', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} + {b} − {c}.',
    variables: {
      a: { kind: 'int', min: 20, max: 45 },
      b: { kind: 'int', min: 14, max: 30 },
      c: { kind: 'int', min: 10, max: 25 },
    },
    answer: (v) => Number(v.a) + Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}; შემდეგ ${Number(vars.a) + Number(vars.b)} − ${vars.c} = ${answer}.`,
  }),

  // =========================================================================
  // U08.3 — ჭეშმარიტი და მცდარი ტოლობები (Q11–Q15)
  // =========================================================================

  // Q11 — შეკრების ტოლობა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g2-u08-11', subtopicId: 'u08-true-false-equalities', difficulty: 1 }),
    prompt: 'სწორია თუ არა ტოლობა: {a} + {b} = {rhs}?',
    variables: {
      a: { kind: 'int', min: 18, max: 48 },
      b: { kind: 'int', min: 12, max: 38 },
      isTrue: { kind: 'choice', values: ['yes', 'no'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const sum = Number(v.a) + Number(v.b);
          const rhs = v.isTrue === 'yes' ? sum : sum + 4;
          const ans = v.isTrue === 'yes' ? 'ჭეშმარიტი' : 'მცდარი';
          return [`${rhs};${ans};${sum}`];
        },
      },
      rhs: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      sum: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    optionCount: 2,
    options: () => ['ჭეშმარიტი', 'მცდარი'],
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${vars.sum}, ამიტომ ტოლობა არის ${answer}.`,
  }),

  // Q12 — გამოკლების ტოლობა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g2-u08-12', subtopicId: 'u08-true-false-equalities', difficulty: 1 }),
    prompt: 'სწორია თუ არა ტოლობა: {a} − {b} = {rhs}?',
    variables: {
      a: { kind: 'int', min: 45, max: 85 },
      b: { kind: 'int', min: 15, max: 38 },
      isTrue: { kind: 'choice', values: ['yes', 'no'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const diff = Number(v.a) - Number(v.b);
          const rhs = v.isTrue === 'yes' ? diff : diff + 10;
          const ans = v.isTrue === 'yes' ? 'ჭეშმარიტი' : 'მცდარი';
          return [`${rhs};${ans};${diff}`];
        },
      },
      rhs: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    optionCount: 2,
    options: () => ['ჭეშმარიტი', 'მცდარი'],
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${vars.diff}, ამიტომ ტოლობა არის ${answer}.`,
  }),

  // Q13 — შერეული ტოლობა შეკრება/გამოკლებით (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g2-u08-13', subtopicId: 'u08-true-false-equalities', difficulty: 2 }),
    prompt: 'სწორია თუ არა ტოლობა: {a} + {b} − {c} = {rhs}?',
    variables: {
      a: { kind: 'int', min: 15, max: 35 },
      b: { kind: 'int', min: 15, max: 35 },
      c: { kind: 'int', min: 10, max: 20 },
      isTrue: { kind: 'choice', values: ['yes', 'no'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const res = Number(v.a) + Number(v.b) - Number(v.c);
          const rhs = v.isTrue === 'yes' ? res : res - 5;
          const ans = v.isTrue === 'yes' ? 'ჭეშმარიტი' : 'მცდარი';
          return [`${rhs};${ans};${res}`];
        },
      },
      rhs: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      res: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    optionCount: 2,
    options: () => ['ჭეშმარიტი', 'მცდარი'],
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} − ${vars.c} = ${vars.res}, ამიტომ ტოლობა არის ${answer}.`,
  }),

  // Q14 — შერეული ტოლობა გამოკლება/შეკრებით (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g2-u08-14', subtopicId: 'u08-true-false-equalities', difficulty: 2 }),
    prompt: 'სწორია თუ არა ტოლობა: {a} − {b} + {c} = {rhs}?',
    variables: {
      a: { kind: 'int', min: 45, max: 80 },
      b: { kind: 'int', min: 15, max: 30 },
      c: { kind: 'int', min: 5, max: 15 },
      isTrue: { kind: 'choice', values: ['yes', 'no'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const res = Number(v.a) - Number(v.b) + Number(v.c);
          const rhs = v.isTrue === 'yes' ? res : res + 10;
          const ans = v.isTrue === 'yes' ? 'ჭეშმარიტი' : 'მცდარი';
          return [`${rhs};${ans};${res}`];
        },
      },
      rhs: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      res: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    optionCount: 2,
    options: () => ['ჭეშმარიტი', 'მცდარი'],
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} + ${vars.c} = ${vars.res}, ამიტომ ტოლობა არის ${answer}.`,
  }),

  // Q15 — მრავალნაბიჯიანი ტოლობის შემოწმება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g2-u08-15', subtopicId: 'u08-true-false-equalities', difficulty: 3 }),
    prompt: 'სწორია თუ არა ტოლობა: {a} + {b} − {c} = {rhs}?',
    variables: {
      a: { kind: 'int', min: 25, max: 45 },
      b: { kind: 'int', min: 25, max: 45 },
      c: { kind: 'int', min: 15, max: 25 },
      isTrue: { kind: 'choice', values: ['yes', 'no'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const res = Number(v.a) + Number(v.b) - Number(v.c);
          const rhs = v.isTrue === 'yes' ? res : res + 4;
          const ans = v.isTrue === 'yes' ? 'ჭეშმარიტი' : 'მცდარი';
          return [`${rhs};${ans};${res}`];
        },
      },
      rhs: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      res: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    optionCount: 2,
    options: () => ['ჭეშმარიტი', 'მცდარი'],
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} − ${vars.c} = ${vars.res}, ამიტომ ტოლობა არის ${answer}.`,
  }),

  // =========================================================================
  // U08.4 — შეკრება და გამოკლება 100-ის ფარგლებში (Q16–Q20)
  // =========================================================================

  // Q16 — შეკრება და გამოკლება (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-16', subtopicId: 'u08-add-subtract-within-100', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b} − {c}.',
    variables: {
      a: { kind: 'int', min: 30, max: 55 },
      b: { kind: 'int', min: 20, max: 42 },
      c: { kind: 'int', min: 12, max: 28 },
    },
    answer: (v) => Number(v.a) + Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}; შემდეგ ${Number(vars.a) + Number(vars.b)} − ${vars.c} = ${answer}.`,
  }),

  // Q17 — გამოკლება და შეკრება (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-17', subtopicId: 'u08-add-subtract-within-100', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} − {b} + {c}.',
    variables: {
      a: { kind: 'int', min: 65, max: 95 },
      b: { kind: 'int', min: 25, max: 45 },
      c: { kind: 'int', min: 10, max: 25 },
    },
    answer: (v) => Number(v.a) - Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}; შემდეგ ${Number(vars.a) - Number(vars.b)} + ${vars.c} = ${answer}.`,
  }),

  // Q18 — სამი რიცხვის შეკრება (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-18', subtopicId: 'u08-add-subtract-within-100', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} + {b} + {c}.',
    variables: {
      a: { kind: 'int', min: 16, max: 35 },
      b: { kind: 'int', min: 14, max: 30 },
      c: { kind: 'int', min: 15, max: 28 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 20, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // Q19 — თანმიმდევრული გამოკლება (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-19', subtopicId: 'u08-add-subtract-within-100', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} − {b} − {c}.',
    variables: {
      a: { kind: 'int', min: 70, max: 95 },
      b: { kind: 'int', min: 18, max: 35 },
      c: { kind: 'int', min: 12, max: 25 },
    },
    answer: (v) => Number(v.a) - Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}; შემდეგ ${Number(vars.a) - Number(vars.b)} − ${vars.c} = ${answer}.`,
  }),

  // Q20 — შეკრება და გამოკლება დიდ რიცხვებში (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-20', subtopicId: 'u08-add-subtract-within-100', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} + {b} − {c}.',
    variables: {
      a: { kind: 'int', min: 45, max: 68 },
      b: { kind: 'int', min: 24, max: 38 },
      c: { kind: 'int', min: 28, max: 45 },
    },
    answer: (v) => Number(v.a) + Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}; შემდეგ ${Number(vars.a) + Number(vars.b)} − ${vars.c} = ${answer}.`,
  }),

  // =========================================================================
  // U08.5 — ცხრილის წესის პოვნა (Q21–Q25)
  // =========================================================================

  // Q21 — ცხრილში რიცხვს ემატება მუდმივი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-21', subtopicId: 'u08-table-rules-100', difficulty: 1 }),
    prompt:
      'ცხრილში რიცხვს ემატება {k}.\n\n' +
      'შესავალი | გამოსავალი\n' +
      '{x1} | {y1}\n' +
      '{x2} | {y2}\n' +
      '{x3} | ?\n\n' +
      'რა რიცხვი უნდა ეწეროს კითხვის ნიშნის ნაცვლად?',
    variables: {
      k: { kind: 'int', min: 4, max: 9 },
      x1: { kind: 'int', min: 10, max: 18 },
      x2: { kind: 'int', min: 22, max: 32 },
      x3: { kind: 'int', min: 38, max: 55 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const k = Number(v.k);
          const y1 = Number(v.x1) + k;
          const y2 = Number(v.x2) + k;
          const y3 = Number(v.x3) + k;
          return [`${y1};${y2};${y3}`];
        },
      },
      y1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      y2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      y3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.y3),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `წესია: რიცხვს დაუმატე ${vars.k}. ${vars.x3} + ${vars.k} = ${answer}.`,
  }),

  // Q22 — ცხრილში რიცხვს აკლდება მუდმივი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-22', subtopicId: 'u08-table-rules-100', difficulty: 1 }),
    prompt:
      'ცხრილში რიცხვს აკლდება {k}.\n\n' +
      'შესავალი | გამოსავალი\n' +
      '{x1} | {y1}\n' +
      '{x2} | {y2}\n' +
      '{x3} | ?\n\n' +
      'რა რიცხვი უნდა ეწეროს კითხვის ნიშნის ნაცვლად?',
    variables: {
      k: { kind: 'int', min: 5, max: 12 },
      x1: { kind: 'int', min: 25, max: 35 },
      x2: { kind: 'int', min: 42, max: 55 },
      x3: { kind: 'int', min: 62, max: 80 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const k = Number(v.k);
          const y1 = Number(v.x1) - k;
          const y2 = Number(v.x2) - k;
          const y3 = Number(v.x3) - k;
          return [`${y1};${y2};${y3}`];
        },
      },
      y1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      y2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      y3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.y3),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `წესია: რიცხვს გამოაკელი ${vars.k}. ${vars.x3} − ${vars.k} = ${answer}.`,
  }),

  // Q23 — ორნაბიჯიანი ცხრილის წესი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-23', subtopicId: 'u08-table-rules-100', difficulty: 2 }),
    prompt:
      'ცხრილის წესი ასეთია: ჯერ დაუმატე {add}, შემდეგ გამოაკელი {sub}.\n\n' +
      'რა რიცხვი გამოვა, თუ შესავალია {start}?',
    variables: {
      start: { kind: 'int', min: 18, max: 45 },
      add: { kind: 'int', min: 8, max: 15 },
      sub: { kind: 'int', min: 2, max: 7 },
    },
    answer: (v) => Number(v.start) + Number(v.add) - Number(v.sub),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.start} + ${vars.add} = ${Number(vars.start) + Number(vars.add)}; შემდეგ ${Number(vars.start) + Number(vars.add)} − ${vars.sub} = ${answer}.`,
  }),

  // Q24 — რიცხვის გაორმაგება (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-24', subtopicId: 'u08-table-rules-100', difficulty: 2 }),
    prompt:
      'ცხრილში რიცხვი ორჯერ იზრდება (ორმაგდება):\n\n' +
      'შესავალი | გამოსავალი\n' +
      '{x1} | {y1}\n' +
      '{x2} | {y2}\n' +
      '{x3} | ?\n\n' +
      'რა რიცხვი მიიღება?',
    variables: {
      x1: { kind: 'int', min: 6, max: 10 },
      x2: { kind: 'int', min: 11, max: 16 },
      x3: { kind: 'int', min: 17, max: 25 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const y1 = Number(v.x1) * 2;
          const y2 = Number(v.x2) * 2;
          const y3 = Number(v.x3) * 2;
          return [`${y1};${y2};${y3}`];
        },
      },
      y1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      y2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      y3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.y3),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.x3} × 2 = ${answer}.`,
  }),

  // Q25 — ორმაგი დამატების წესი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-25', subtopicId: 'u08-table-rules-100', difficulty: 3 }),
    prompt:
      'ცხრილის წესი ასეთია: დაუმატე {add1}, შემდეგ დაუმატე {add2}.\n\n' +
      'რა გამოსავალი მიიღება, თუ შესავალია {start}?',
    variables: {
      start: { kind: 'int', min: 20, max: 50 },
      add1: { kind: 'int', min: 5, max: 12 },
      add2: { kind: 'int', min: 4, max: 11 },
    },
    answer: (v) => Number(v.start) + Number(v.add1) + Number(v.add2),
    format: { kind: 'integer', min: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 20, 1),
    explanation: ({ vars, answer }) =>
      `${vars.start} + ${vars.add1} + ${vars.add2} = ${answer}.`,
  }),

  // =========================================================================
  // U08.6 — შეკრებისა და გამოკლების ნიშნების ჩასმა (Q26–Q30)
  // =========================================================================

  // Q26 — ჩასვი + ნიშანი (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g2-u08-26', subtopicId: 'u08-placing-plus-minus', difficulty: 1 }),
    prompt:
      'ჩასვი „+“ ან „−“, რომ ტოლობა სწორი იყოს:\n\n' +
      '{a} ❓ {b} = {c}',
    variables: {
      a: { kind: 'int', min: 15, max: 50 },
      b: { kind: 'int', min: 6, max: 20 },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.a) + Number(v.b))],
      },
      c: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    optionCount: 2,
    options: () => ['+', '−'],
    answer: () => '+',
    format: { kind: 'text' },
    explanation: ({ vars }) => `${vars.a} + ${vars.b} = ${vars.c}.`,
  }),

  // Q27 — ჩასვი − ნიშანი (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g2-u08-27', subtopicId: 'u08-placing-plus-minus', difficulty: 1 }),
    prompt:
      'ჩასვი „+“ ან „−“:\n\n' +
      '{a} ❓ {b} = {c}',
    variables: {
      a: { kind: 'int', min: 25, max: 60 },
      b: { kind: 'int', min: 8, max: 22 },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.a) - Number(v.b))],
      },
      c: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    optionCount: 2,
    options: () => ['+', '−'],
    answer: () => '−',
    format: { kind: 'text' },
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${vars.c}.`,
  }),

  // Q28 — ჩასვი ნიშნები (გამოკლება, შეკრება) (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u08-28', subtopicId: 'u08-placing-plus-minus', difficulty: 2 }),
    prompt: 'ჩასვი ნიშნები: {a} __ {b} __ {c} = {res}.',
    variables: {
      a: { kind: 'int', min: 18, max: 35 },
      b: { kind: 'int', min: 6, max: 14 },
      c: { kind: 'int', min: 3, max: 10 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const b = Number(v.b);
          const c = Number(v.c);
          const res = a - b + c;
          const correct = `${a} − ${b} + ${c}`;
          const w1 = `${a} + ${b} − ${c}`;
          const w2 = `${a} + ${b} + ${c}`;
          const w3 = `${a} − ${b} − ${c}`;
          return [`${res};${correct};${w1};${w2};${w3}`];
        },
      },
      res: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${answer} = ${vars.res}.`,
  }),

  // Q29 — ჩასვი ნიშნები (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u08-29', subtopicId: 'u08-placing-plus-minus', difficulty: 2 }),
    prompt: 'ჩასვი ნიშნები: {a} __ {b} __ {c} = {res}.',
    variables: {
      a: { kind: 'int', min: 28, max: 45 },
      b: { kind: 'int', min: 10, max: 18 },
      c: { kind: 'int', min: 5, max: 12 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const b = Number(v.b);
          const c = Number(v.c);
          const res = a - b + c;
          const correct = `${a} − ${b} + ${c}`;
          const w1 = `${a} + ${b} − ${c}`;
          const w2 = `${a} + ${b} + ${c}`;
          const w3 = `${a} − ${b} − ${c}`;
          return [`${res};${correct};${w1};${w2};${w3}`];
        },
      },
      res: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${answer} = ${vars.res}.`,
  }),

  // Q30 — ჩასვი ნიშნები (შეკრება, გამოკლება) (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u08-30', subtopicId: 'u08-placing-plus-minus', difficulty: 3 }),
    prompt: 'ჩასვი ნიშნები: {a} __ {b} __ {c} = {res}.',
    variables: {
      a: { kind: 'int', min: 14, max: 30 },
      b: { kind: 'int', min: 8, max: 18 },
      c: { kind: 'int', min: 4, max: 12 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const b = Number(v.b);
          const c = Number(v.c);
          const res = a + b - c;
          const correct = `${a} + ${b} − ${c}`;
          const w1 = `${a} − ${b} + ${c}`;
          const w2 = `${a} + ${b} + ${c}`;
          const w3 = `${a} − ${b} − ${c}`;
          return [`${res};${correct};${w1};${w2};${w3}`];
        },
      },
      res: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${answer} = ${vars.res}.`,
  }),

  // =========================================================================
  // U08.7 — გამოსახულებების დალაგება (Q31–Q35)
  // =========================================================================

  // Q31 — დაალაგე გამოსახულებები ზრდადობით (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u08-31', subtopicId: 'u08-which-in-order', difficulty: 2 }),
    prompt:
      'მოცემულია გამოსახულებები:\n\n' +
      '{e1};  {e2};  {e3};  {e4}\n\n' +
      'დაალაგე ისინი შედეგის ზრდადობით (პატარიდან დიდისკენ):',
    variables: {
      base: { kind: 'int', min: 20, max: 40 },
      step: { kind: 'int', min: 4, max: 8 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const s = Number(v.step);
          const v1 = b;
          const v2 = b + s;
          const v3 = b + 2 * s;
          const v4 = b + 3 * s;
          const e1 = `${v1 - 3} + 3`;
          const e2 = `${v2 + 4} − 4`;
          const e3 = `${v3 - 5} + 5`;
          const e4 = `${v4 + 6} − 6`;
          const correct = `${e1}; ${e2}; ${e3}; ${e4}`;
          const w1 = `${e2}; ${e1}; ${e4}; ${e3}`;
          const w2 = `${e4}; ${e3}; ${e2}; ${e1}`;
          const w3 = `${e1}; ${e3}; ${e2}; ${e4}`;
          return [`${e1};${e2};${e3};${e4};${correct};${w1};${w2};${w3}`];
        },
      },
      e1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      e2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      e3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      e4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `სწორი მიმდევრობაა: ${answer}.`,
  }),

  // Q32 — დაალაგე გამოსახულებები კლებადობით (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u08-32', subtopicId: 'u08-which-in-order', difficulty: 2 }),
    prompt:
      'მოცემულია გამოსახულებები:\n\n' +
      '{e1};  {e2};  {e3};  {e4}\n\n' +
      'დაალაგე ისინი შედეგის კლებადობით (დიდიდან პატარისკენ):',
    variables: {
      base: { kind: 'int', min: 25, max: 45 },
      step: { kind: 'int', min: 4, max: 8 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const s = Number(v.step);
          const v4 = b;
          const v3 = b + s;
          const v2 = b + 2 * s;
          const v1 = b + 3 * s;
          const e1 = `${v1 - 2} + 2`;
          const e2 = `${v2 + 3} − 3`;
          const e3 = `${v3 - 4} + 4`;
          const e4 = `${v4 + 5} − 5`;
          const correct = `${e1}; ${e2}; ${e3}; ${e4}`;
          const w1 = `${e4}; ${e3}; ${e2}; ${e1}`;
          const w2 = `${e1}; ${e3}; ${e2}; ${e4}`;
          const w3 = `${e2}; ${e1}; ${e3}; ${e4}`;
          return [`${e1};${e2};${e3};${e4};${correct};${w1};${w2};${w3}`];
        },
      },
      e1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      e2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      e3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      e4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `სწორი მიმდევრობა კლებადობით: ${answer}.`,
  }),

  // Q33 — დაალაგე შედეგის ზრდის მიხედვით (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u08-33', subtopicId: 'u08-which-in-order', difficulty: 1 }),
    prompt:
      'მოცემულია გამოსახულებები:\n\n' +
      '{e1};  {e2};  {e3}\n\n' +
      'დაალაგე ისინი შედეგის ზრდის მიხედვით:',
    variables: {
      base: { kind: 'int', min: 15, max: 35 },
      step: { kind: 'int', min: 5, max: 10 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const s = Number(v.step);
          const e1 = `${b - 2} + 2`;
          const e2 = `${b + s - 3} + 3`;
          const e3 = `${b + 2 * s - 4} + 4`;
          const correct = `${e1}; ${e2}; ${e3}`;
          const w1 = `${e3}; ${e2}; ${e1}`;
          const w2 = `${e2}; ${e1}; ${e3}`;
          return [`${e1};${e2};${e3};${correct};${w1};${w2}`];
        },
      },
      e1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      e2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      e3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    optionCount: 3,
    options: (v) => [String(v.correct), String(v.w1), String(v.w2)],
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    explanation: ({ answer }) => `სწორი მიმდევრობაა: ${answer}.`,
  }),

  // Q34 — დაალაგე შედეგის კლების მიხედვით (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u08-34', subtopicId: 'u08-which-in-order', difficulty: 2 }),
    prompt:
      'მოცემულია გამოსახულებები:\n\n' +
      '{e1};  {e2};  {e3}\n\n' +
      'დაალაგე ისინი შედეგის კლების მიხედვით:',
    variables: {
      base: { kind: 'int', min: 20, max: 40 },
      step: { kind: 'int', min: 6, max: 12 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const s = Number(v.step);
          const e1 = `${b + 2 * s - 2} + 2`;
          const e2 = `${b + s - 3} + 3`;
          const e3 = `${b - 4} + 4`;
          const correct = `${e1}; ${e2}; ${e3}`;
          const w1 = `${e3}; ${e2}; ${e1}`;
          const w2 = `${e2}; ${e1}; ${e3}`;
          return [`${e1};${e2};${e3};${correct};${w1};${w2}`];
        },
      },
      e1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      e2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      e3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    optionCount: 3,
    options: (v) => [String(v.correct), String(v.w1), String(v.w2)],
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    explanation: ({ answer }) => `სწორი მიმდევრობაა: ${answer}.`,
  }),

  // Q35 — დაალაგე 4 გამოსახულება ზრდადობით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u08-35', subtopicId: 'u08-which-in-order', difficulty: 3 }),
    prompt:
      'მოცემულია გამოსახულებები:\n\n' +
      '{e1};  {e2};  {e3};  {e4}\n\n' +
      'დაალაგე ისინი შედეგის ზრდადობით:',
    variables: {
      base: { kind: 'int', min: 22, max: 42 },
      step: { kind: 'int', min: 5, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const s = Number(v.step);
          const v1 = b;
          const v2 = b + s;
          const v3 = b + 2 * s;
          const v4 = b + 3 * s;
          const e1 = `${v1 + 5} − 5`;
          const e2 = `${v2 - 4} + 4`;
          const e3 = `${v3 + 6} − 6`;
          const e4 = `${v4 - 7} + 7`;
          const correct = `${e1}; ${e2}; ${e3}; ${e4}`;
          const w1 = `${e2}; ${e1}; ${e4}; ${e3}`;
          const w2 = `${e4}; ${e3}; ${e2}; ${e1}`;
          const w3 = `${e1}; ${e3}; ${e2}; ${e4}`;
          return [`${e1};${e2};${e3};${e4};${correct};${w1};${w2};${w3}`];
        },
      },
      e1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      e2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      e3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      e4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `სწორი მიმდევრობაა: ${answer}.`,
  }),

  // =========================================================================
  // U08.8 — ტექსტური და მრავალსაფეხურიანი ამოცანები (Q36–Q40)
  // =========================================================================

  // Q36 — მაღაზიის ნივთების ამოცანა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-36', subtopicId: 'u08-word-problems-multistep', difficulty: 1 }),
    prompt:
      'მაღაზიაში {a} {item} იყო. დილით {b} გაყიდეს, შემდეგ კი {c} ახალი {item} დაამატეს.\n\n' +
      'რამდენი {item}ია ახლა მაღაზიაში?',
    variables: {
      a: { kind: 'int', min: 25, max: 50 },
      b: { kind: 'int', min: 8, max: 20 },
      c: { kind: 'int', min: 10, max: 25 },
      item: { kind: 'choice', values: ['რვეულ', 'სახაზავ', 'კალამ', 'ფანქარ'] },
    },
    answer: (v) => Number(v.a) - Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} + ${vars.c} = ${answer} ${vars.item}ი.`,
  }),

  // Q37 — ბიბლიოთეკის წიგნები (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-37', subtopicId: 'u08-word-problems-multistep', difficulty: 1 }),
    prompt:
      'ბიბლიოთეკაში {a} წიგნი იყო. მოსწავლეებმა {b} წიგნი აიღეს და მოგვიანებით {c} დააბრუნეს.\n\n' +
      'რამდენი წიგნია ახლა ბიბლიოთეკაში?',
    variables: {
      a: { kind: 'int', min: 45, max: 80 },
      b: { kind: 'int', min: 12, max: 25 },
      c: { kind: 'int', min: 5, max: 15 },
    },
    answer: (v) => Number(v.a) - Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} + ${vars.c} = ${answer} წიგნი.`,
  }),

  // Q38 — სტიკერების შეკრება ორ ნაბიჯში (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-38', subtopicId: 'u08-word-problems-multistep', difficulty: 2 }),
    prompt:
      'ანას {a} სტიკერი აქვს, ხოლო გიორგის — {diff}-ით მეტი.\n\n' +
      'რამდენი სტიკერი აქვთ მათ ერთად?',
    variables: {
      a: { kind: 'int', min: 18, max: 35 },
      diff: { kind: 'int', min: 8, max: 20 },
    },
    answer: (v) => 2 * Number(v.a) + Number(v.diff),
    format: { kind: 'integer', min: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 20, 1),
    explanation: ({ vars, answer }) => {
      const g = Number(vars.a) + Number(vars.diff);
      return `გიორგის აქვს ${vars.a} + ${vars.diff} = ${g}. ერთად აქვთ ${vars.a} + ${g} = ${answer} სტიკერი.`;
    },
  }),

  // Q39 — ავტობუსის მგზავრები (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-39', subtopicId: 'u08-word-problems-multistep', difficulty: 2 }),
    prompt:
      'ავტობუსში {a} მგზავრი იყო. პირველ გაჩერებაზე {b} ჩამოვიდა, მეორეზე კი {c} ავიდა.\n\n' +
      'რამდენი მგზავრია ახლა ავტობუსში?',
    variables: {
      a: { kind: 'int', min: 32, max: 60 },
      b: { kind: 'int', min: 10, max: 22 },
      c: { kind: 'int', min: 6, max: 18 },
    },
    answer: (v) => Number(v.a) - Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} + ${vars.c} = ${answer} მგზავრი.`,
  }),

  // Q40 — დარჩენილი ბურთები (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-40', subtopicId: 'u08-word-problems-multistep', difficulty: 3 }),
    prompt:
      'ყუთში {a} ბურთი იყო. {b} წითელი და {c} ლურჯი ბურთი ამოიღეს.\n\n' +
      'რამდენი ბურთი დარჩა ყუთში?',
    variables: {
      a: { kind: 'int', min: 60, max: 90 },
      b: { kind: 'int', min: 15, max: 30 },
      c: { kind: 'int', min: 12, max: 25 },
    },
    answer: (v) => Number(v.a) - Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `ამოიღეს ${vars.b} + ${vars.c} = ${Number(vars.b) + Number(vars.c)} ბურთი. დარჩა ${vars.a} − ${Number(vars.b) + Number(vars.c)} = ${answer} ბურთი.`,
  }),

  // =========================================================================
  // U08.9 — რაოდენობების გათანაბრება (Q41–Q45)
  // =========================================================================

  // Q41 — თაროების გათანაბრება წიგნების გადატანით (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-41', subtopicId: 'u08-equalizing-quantities', difficulty: 1 }),
    prompt:
      'ერთ თაროზე {a} წიგნია, მეორეზე — {b}.\n\n' +
      'რამდენი წიგნი უნდა გადაიტანო მეორე თაროდან პირველზე, რომ ორივეზე თანაბარი რაოდენობა იყოს?',
    variables: {
      a: { kind: 'int', min: 20, max: 40 },
      move: { kind: 'int', min: 3, max: 9 },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.a) + 2 * Number(v.move))],
      },
      b: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.move),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `სხვაობაა ${vars.b} − ${vars.a} = ${Number(vars.b) - Number(vars.a)}. ნახევარი უნდა გადავიტანოთ: ${Number(vars.b) - Number(vars.a)} : 2 = ${answer} წიგნი.`,
  }),

  // Q42 — ქულების სხვაობა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-42', subtopicId: 'u08-equalizing-quantities', difficulty: 1 }),
    prompt:
      'ლევანმა {a} ქულა დააგროვა, მარიამმა — {b}.\n\n' +
      'რამდენი ქულა უნდა მოემატოს მარიამს, რომ ლევანის ქულებს გაუტოლდეს?',
    variables: {
      b: { kind: 'int', min: 22, max: 50 },
      diff: { kind: 'int', min: 5, max: 18 },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.b) + Number(v.diff))],
      },
      a: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer} ქულა.`,
  }),

  // Q43 — კანფეტების გათანაბრება (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-43', subtopicId: 'u08-equalizing-quantities', difficulty: 2 }),
    prompt:
      'პირველ ჩანთაში {a} კანფეტია, მეორეში — {b}.\n\n' +
      'რამდენი კანფეტი უნდა დაემატოს მეორე ჩანთას, რომ რაოდენობები გათანაბრდეს?',
    variables: {
      b: { kind: 'int', min: 30, max: 65 },
      diff: { kind: 'int', min: 6, max: 20 },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.b) + Number(v.diff))],
      },
      a: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer} კანფეტი.`,
  }),

  // Q44 — კალათაში ვაშლების დამატება მიზნობრივ სხვაობამდე (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-44', subtopicId: 'u08-equalizing-quantities', difficulty: 3 }),
    prompt:
      'ორ კალათაში სულ {tot} ვაშლია. პირველ კალათაში არის {a} ვაშლი, დანარჩენი — მეორეში.\n\n' +
      'რამდენი ვაშლი უნდა დაემატოს პირველ კალათას (თუ მეორეში რაოდენობა არ იცვლება), რომ პირველში მეორეზე {d}-ით მეტი იყოს?',
    variables: {
      b: { kind: 'int', min: 18, max: 32 },
      d: { kind: 'int', min: 4, max: 10 },
      extraToAdd: { kind: 'int', min: 6, max: 14 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.b);
          const d = Number(v.d);
          const extra = Number(v.extraToAdd);
          const targetA = b + d;
          const a = targetA - extra;
          const tot = a + b;
          return [`${tot};${a};${b};${targetA}`];
        },
      },
      tot: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      bVal: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      targetA: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.extraToAdd),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `მეორე კალათაშია ${vars.tot} − ${vars.a} = ${vars.bVal} ვაშლი. პირველში გვინდა იყოს ${vars.bVal} + ${vars.d} = ${vars.targetA}. დასამატებელია ${vars.targetA} − ${vars.a} = ${answer} ვაშლი.`,
  }),

  // Q45 — ბარათების გათანაბრება გაცვლით (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-45', subtopicId: 'u08-equalizing-quantities', difficulty: 2 }),
    prompt:
      'ნინოს {a} ბარათი აქვს, საბას — {b}.\n\n' +
      'რამდენი ბარათი უნდა გადასცეს ნინომ საბას, რომ ორივეს თანაბარი რაოდენობა ჰქონდეს?',
    variables: {
      b: { kind: 'int', min: 20, max: 50 },
      transfer: { kind: 'int', min: 3, max: 10 },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.b) + 2 * Number(v.transfer))],
      },
      a: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.transfer),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => {
      const half = Number(vars.b) + Number(vars.transfer);
      return `${vars.a} − ${answer} = ${vars.b} + ${answer} = ${half}. ნინომ უნდა გადასცეს ${answer} ბარათი.`;
    },
  }),

  // =========================================================================
  // U08.10 — მანძილის ამოცანები (Q46–Q50)
  // =========================================================================

  // Q46 — მანძილის გაზრდა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-46', subtopicId: 'u08-distance-problems', difficulty: 1 }),
    prompt:
      'ბავშვმა დილით {a} მეტრი გაიარა, საღამოს კი {diff} მეტრით მეტი.\n\n' +
      'რამდენი მეტრი გაიარა საღამოს?',
    variables: {
      a: { kind: 'int', min: 20, max: 45 },
      diff: { kind: 'int', min: 12, max: 25 },
    },
    answer: (v) => Number(v.a) + Number(v.diff),
    format: { kind: 'integer', min: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 20, 1),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.diff} = ${answer} მეტრი.`,
  }),

  // Q47 — ჯამური მანძილი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-47', subtopicId: 'u08-distance-problems', difficulty: 1 }),
    prompt:
      'სახლიდან პარკამდე {a} მეტრია, პარკიდან მაღაზიამდე — {b} მეტრი.\n\n' +
      'რამდენი მეტრია სახლიდან მაღაზიამდე, თუ გზას პარკის გავლით გადიხარ?',
    variables: {
      a: { kind: 'int', min: 22, max: 50 },
      b: { kind: 'int', min: 18, max: 40 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 30 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 30, 1),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer} მეტრი.`,
  }),

  // Q48 — დარჩენილი მანძილი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-48', subtopicId: 'u08-distance-problems', difficulty: 2 }),
    prompt:
      '{name}-მ {tot} მეტრი უნდა გაიაროს. მან უკვე {done} მეტრი გაიარა.\n\n' +
      'რამდენი მეტრი დარჩა გასავლელი?',
    variables: {
      done: { kind: 'int', min: 25, max: 55 },
      remain: { kind: 'int', min: 15, max: 35 },
      name: { kind: 'choice', values: ['მარიამ', 'გიორგი', 'ნიკა', 'ანა'] },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.done) + Number(v.remain))],
      },
      tot: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.remain),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.tot} − ${vars.done} = ${answer} მეტრი.`,
  }),

  // Q49 — წინ და უკან სიარული (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-49', subtopicId: 'u08-distance-problems', difficulty: 2 }),
    prompt:
      'ლუკამ {a} მეტრი გაიარა, შემდეგ კიდევ {b} მეტრი და ბოლოს {c} მეტრი უკან დაბრუნდა.\n\n' +
      'რამდენი მეტრით არის დაშორებული საწყისი ადგილიდან?',
    variables: {
      a: { kind: 'int', min: 18, max: 35 },
      b: { kind: 'int', min: 14, max: 28 },
      c: { kind: 'int', min: 8, max: 20 },
    },
    answer: (v) => Number(v.a) + Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}; შემდეგ ${Number(vars.a) + Number(vars.b)} − ${vars.c} = ${answer} მეტრი.`,
  }),

  // Q50 — ორ სახლს შორის მანძილი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-50', subtopicId: 'u08-distance-problems', difficulty: 3 }),
    prompt:
      'ორ სახლს შორის მანძილი {tot} მეტრია. ნიკამ ერთი სახლიდან მეორისკენ {a} მეტრი გაიარა, შემდეგ კი კიდევ {b} მეტრი.\n\n' +
      'რამდენი მეტრი დარჩა გასავლელი მეორე სახლამდე?',
    variables: {
      a: { kind: 'int', min: 22, max: 40 },
      b: { kind: 'int', min: 18, max: 35 },
      remain: { kind: 'int', min: 15, max: 30 },
      pack: {
        kind: 'choice',
        values: (v) => [String(Number(v.a) + Number(v.b) + Number(v.remain))],
      },
      tot: { kind: 'choice', values: (v) => [String(v.pack)] },
    },
    answer: (v) => Number(v.remain),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `გაიარა ${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)} მეტრი. დარჩა ${vars.tot} − ${Number(vars.a) + Number(vars.b)} = ${answer} მეტრი.`,
  }),

  // =========================================================================
  // U08.11 — ფრჩხილები გამოსახულებებში (Q51–Q55)
  // =========================================================================

  // Q51 — ფრჩხილებში შეკრება, შემდეგ გამოკლება (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-51', subtopicId: 'u08-brackets', difficulty: 1 }),
    prompt: 'გამოთვალე: ({a} + {b}) − {c}.',
    variables: {
      a: { kind: 'int', min: 15, max: 35 },
      b: { kind: 'int', min: 10, max: 25 },
      c: { kind: 'int', min: 5, max: 15 },
    },
    answer: (v) => Number(v.a) + Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `ჯერ ფრჩხილებში: ${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}; შემდეგ ${Number(vars.a) + Number(vars.b)} − ${vars.c} = ${answer}.`,
  }),

  // Q52 — გამოკლება ფრჩხილების ჯამზე (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-52', subtopicId: 'u08-brackets', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} − ({b} + {c}).',
    variables: {
      a: { kind: 'int', min: 45, max: 80 },
      b: { kind: 'int', min: 10, max: 22 },
      c: { kind: 'int', min: 8, max: 18 },
    },
    answer: (v) => Number(v.a) - (Number(v.b) + Number(v.c)),
    format: { kind: 'integer', min: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) =>
      `ჯერ ფრჩხილებში: ${vars.b} + ${vars.c} = ${Number(vars.b) + Number(vars.c)}; შემდეგ ${vars.a} − ${Number(vars.b) + Number(vars.c)} = ${answer}.`,
  }),

  // Q53 — ფრჩხილებში სხვაობა, შემდეგ შეკრება (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-53', subtopicId: 'u08-brackets', difficulty: 2 }),
    prompt: 'გამოთვალე: ({a} − {b}) + {c}.',
    variables: {
      a: { kind: 'int', min: 35, max: 65 },
      b: { kind: 'int', min: 12, max: 25 },
      c: { kind: 'int', min: 10, max: 25 },
    },
    answer: (v) => Number(v.a) - Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 15 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 15, 1),
    explanation: ({ vars, answer }) =>
      `ჯერ ფრჩხილებში: ${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}; შემდეგ ${Number(vars.a) - Number(vars.b)} + ${vars.c} = ${answer}.`,
  }),

  // Q54 — რომელი გამოსახულების მნიშვნელობაა მოცემული რიცხვი (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u08-54', subtopicId: 'u08-brackets', difficulty: 3 }),
    prompt: 'რომელი გამოსახულების მნიშვნელობაა {target}?',
    variables: {
      a: { kind: 'choice', values: ['45', '50', '55', '60'] },
      b: { kind: 'int', min: 11, max: 18 },
      c: { kind: 'int', min: 5, max: 10 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const b = Number(v.b);
          const c = Number(v.c);
          const target = a - (b + c);
          const correct = `${a} − (${b} + ${c})`;
          const w1 = `${a} + (${b} − ${c})`;
          const w2 = `(${a} − ${b}) + ${c}`;
          const w3 = `(${a} + ${b}) − ${c}`;
          return [`${target};${correct};${w1};${w2};${w3}`];
        },
      },
      target: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${answer} = ${vars.target}.`,
  }),

  // Q55 — რთული ფრჩხილებიანი გამოსახულება (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u08-55', subtopicId: 'u08-brackets', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} − ({b} + {c}) + {d}.',
    variables: {
      a: { kind: 'int', min: 60, max: 90 },
      b: { kind: 'int', min: 15, max: 30 },
      c: { kind: 'int', min: 10, max: 20 },
      d: { kind: 'int', min: 5, max: 15 },
    },
    answer: (v) => Number(v.a) - (Number(v.b) + Number(v.c)) + Number(v.d),
    format: { kind: 'integer', min: 15 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 15, 1),
    explanation: ({ vars, answer }) => {
      const sumBC = Number(vars.b) + Number(vars.c);
      const step1 = Number(vars.a) - sumBC;
      return `ჯერ ფრჩხილებში: ${vars.b} + ${vars.c} = ${sumBC}; შემდეგ ${vars.a} − ${sumBC} = ${step1}; ბოლოს ${step1} + ${vars.d} = ${answer}.`;
    },
  }),

  // =========================================================================
  // U08.12 — შეკრებისა და გამოკლების დალაგება (Q56–Q60)
  // =========================================================================

  // Q56 — ბარათების დაჯგუფება შეკრება/გამოკლებით (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u08-56', subtopicId: 'u08-sorting-add-subtract', difficulty: 1 }),
    prompt:
      'მოცემულია ბარათები:\n\n' +
      '{p1};  {m1};  {p2};  {m2}\n\n' +
      'რომელ ვარიანტშია ისინი სწორად დაჯგუფებული შეკრებისა და გამოკლების მიხედვით?',
    variables: {
      a1: { kind: 'int', min: 12, max: 28 },
      a2: { kind: 'int', min: 20, max: 35 },
      s1: { kind: 'int', min: 35, max: 55 },
      s2: { kind: 'int', min: 45, max: 70 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const p1 = `${v.a1} + 7`;
          const p2 = `${v.a2} + 14`;
          const m1 = `${v.s1} − 15`;
          const m2 = `${v.s2} − 22`;
          const correct = `შეკრება: ${p1}, ${p2} | გამოკლება: ${m1}, ${m2}`;
          const w1 = `შეკრება: ${p1}, ${m1} | გამოკლება: ${p2}, ${m2}`;
          const w2 = `შეკრება: ${m1}, ${m2} | გამოკლება: ${p1}, ${p2}`;
          const w3 = `შეკრება: ${p2}, ${m2} | გამოკლება: ${p1}, ${m1}`;
          return [`${p1};${m1};${p2};${m2};${correct};${w1};${w2};${w3}`];
        },
      },
      p1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      m1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      p2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      m2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `სწორი დაჯგუფებაა: ${answer}.`,
  }),

  // Q57 — აირჩიე გამოსახულება, რომლის შედეგიც ნაკლებია (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u08-57', subtopicId: 'u08-sorting-add-subtract', difficulty: 2 }),
    prompt: 'რომელი გამოსახულების შედეგია {bound}-ზე ნაკლები?',
    variables: {
      bound: { kind: 'int', min: 38, max: 52 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.bound);
          const correct = `${b - 12} + 5`;
          const w1 = `${b} + 8`;
          const w2 = `${b + 15} − 5`;
          const w3 = `${b + 20} − 10`;
          return [`${correct};${w1};${w2};${w3}`];
        },
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${answer} ნაკლებია ${vars.bound}-ზე.`,
  }),

  // Q58 — რომელი გამოსახულების შედეგია მეტი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u08-58', subtopicId: 'u08-sorting-add-subtract', difficulty: 2 }),
    prompt: 'რომელი გამოსახულების შედეგია {bound}-ზე მეტი?',
    variables: {
      bound: { kind: 'int', min: 45, max: 65 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.bound);
          const correct = `${b - 10} + 18`;
          const w1 = `${b - 8} − 4`;
          const w2 = `${b - 20} + 12`;
          const w3 = `${b} − 6`;
          return [`${correct};${w1};${w2};${w3}`];
        },
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${answer} მეტია ${vars.bound}-ზე.`,
  }),

  // Q59 — დაალაგე შედეგები ზრდადობით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u08-59', subtopicId: 'u08-sorting-add-subtract', difficulty: 3 }),
    prompt:
      'მოცემულია გამოსახულებები:\n\n' +
      '{e1};  {e2};  {e3};  {e4}\n\n' +
      'დაალაგე მათი შედეგები ზრდადობით:',
    variables: {
      base: { kind: 'int', min: 18, max: 35 },
      pack: {
        kind: 'choice',
        values: (v) => {
          const b = Number(v.base);
          const v1 = b;
          const v2 = b + 5;
          const v3 = b + 10;
          const v4 = b + 15;
          const e1 = `${v1 + 8} − 8`;
          const e2 = `${v2 - 4} + 4`;
          const e3 = `${v3 + 6} − 6`;
          const e4 = `${v4 - 3} + 3`;
          const correct = `${e1}; ${e2}; ${e3}; ${e4}`;
          const w1 = `${e4}; ${e3}; ${e2}; ${e1}`;
          const w2 = `${e1}; ${e3}; ${e2}; ${e4}`;
          const w3 = `${e2}; ${e1}; ${e4}; ${e3}`;
          return [`${e1};${e2};${e3};${e4};${correct};${w1};${w2};${w3}`];
        },
      },
      e1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      e2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      e3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      e4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) => `სწორი მიმდევრობაა: ${answer}.`,
  }),

  // Q60 — ქულების ცვლილების გამოსახულება (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u08-60', subtopicId: 'u08-sorting-add-subtract', difficulty: 3 }),
    prompt:
      '{name}-ს ჰქონდა {a} ქულა. მან ჯერ {b} ქულა მოიგო, შემდეგ კი {c} ქულა დაკარგა.\n\n' +
      'რომელი გამოსახულება აღწერს მის საბოლოო ქულას?',
    variables: {
      a: { kind: 'int', min: 30, max: 60 },
      b: { kind: 'int', min: 10, max: 25 },
      c: { kind: 'int', min: 8, max: 22 },
      name: { kind: 'choice', values: ['ლუკა', 'ნიკა', 'დათო', 'გიორგი'] },
      pack: {
        kind: 'choice',
        values: (v) => {
          const a = Number(v.a);
          const b = Number(v.b);
          const c = Number(v.c);
          const finalScore = a + b - c;
          const correct = `${a} + ${b} − ${c}`;
          const w1 = `${a} − ${b} + ${c}`;
          const w2 = `${a} + ${b} + ${c}`;
          const w3 = `${a} − ${b} − ${c}`;
          return [`${finalScore};${correct};${w1};${w2};${w3}`];
        },
      },
      finalScore: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `თავდაპირველ ქულას ჯერ მიემატა ${vars.b}, შემდეგ გამოაკლდა ${vars.c}: ${answer} = ${vars.finalScore}.`,
  }),
];
