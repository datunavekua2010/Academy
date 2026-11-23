import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

export const G3_U07_SUBTOPICS = [
  'u07-terms-missing-steps',
  'u07-multistep-brackets',
  'u07-comparing-sums-products',
  'u07-comparing-differences-quotients',
  'u07-scale-comparisons',
  'u07-distance-quantity',
  'u07-sorting-operations',
] as const;

const addr = (t: { id: string; subtopicId: string; difficulty: 1 | 2 | 3 }) => ({
  id: t.id,
  grade: 3 as const,
  topicId: 'g3-mravalmoqmedebiani',
  unitId: 'g3-mravalmoqmedebiani',
  subtopicId: t.subtopicId,
  difficulty: t.difficulty,
});

const nearMisses = (correct: number, count = 3, step = 1): number[] => {
  const result: number[] = [];
  const deltas = [step, -step, step * 2, -step * 2, step * 5, -step * 5, 10, -10, 1, -1];
  for (const d of deltas) {
    const val = correct + d;
    if (val >= 0 && val !== correct && !result.includes(val)) {
      result.push(val);
      if (result.length >= count) break;
    }
  }
  let extra = 1;
  while (result.length < count) {
    const val = correct + extra * 3;
    if (val >= 0 && val !== correct && !result.includes(val)) {
      result.push(val);
    }
    extra += 1;
  }
  return result.slice(0, count);
};

export const G3_U07_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U07.1 — მოქმედებათა წევრები და გამოტოვებული ბიჯები (Terms & missing steps)
  // =========================================================================

  // Q01 — პირველი მოქმედების განსაზღვრა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-01', subtopicId: 'u07-terms-missing-steps', difficulty: 1 }),
    prompt: 'გამოსახულებაში {a} + {b} × {c} რომელი მოქმედება უნდა შესრულდეს პირველად?',
    variables: {
      a: { kind: 'int', min: 10, max: 50 },
      b: { kind: 'int', min: 2, max: 9 },
      c: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v: Vars) => `${v.b} × ${v.c} (გამრავლება)`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `${v.b} × ${v.c} (გამრავლება)`,
      `${v.a} + ${v.b} (შეკრება)`,
      `${v.a} × ${v.c} (გამრავლება)`,
      `${v.b} + ${v.c} (შეკრება)`,
    ],
    optionCount: 4,
    explanation: ({ vars: _vars, answer }) =>
      `მოქმედებათა რიგის წესის თანახმად, გამრავლება სრულდება შეკრებამდე. ამიტომ პირველად სრულდება ${answer}.`,
  }),

  // Q02 — ორსაფეხურიანი გამოთვლა გამრავლებითა და შეკრებით (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-02', subtopicId: 'u07-terms-missing-steps', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b} × {c} = ?',
    variables: {
      a: { kind: 'int', min: 5, max: 40 },
      b: { kind: 'int', min: 2, max: 8 },
      c: { kind: 'int', min: 2, max: 8 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b) * Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const prod = Number(vars.b) * Number(vars.c);
      return `ჯერ ვამრავლებთ: ${vars.b} × ${vars.c} = ${prod}, შემდეგ ვუმატებთ ${vars.a}-ს: ${vars.a} + ${prod} = ${answer}.`;
    },
  }),

  // Q03 — გამოტოვებული მოქმედების ნიშანი (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-03', subtopicId: 'u07-terms-missing-steps', difficulty: 2 }),
    prompt: 'ჩასვი გამოტოვებული მოქმედების ნიშანი (+, −, ×): {a} □ {b} + {c} = {res}',
    variables: {
      a: { kind: 'choice', values: [3, 4, 5, 6, 7] },
      b: { kind: 'choice', values: [2, 3, 4, 5] },
      c: { kind: 'int', min: 6, max: 25 },
      res: { kind: 'choice', values: (v: Vars) => [Number(v.a) * Number(v.b) + Number(v.c)] },
    },
    answer: () => '×',
    format: { kind: 'text' },
    options: () => ['×', '+', '−'],
    optionCount: 3,
    explanation: ({ vars, answer }) =>
      `თუ ჩავსვამთ '${answer}'-ს, მივიღებთ: ${vars.a} × ${vars.b} + ${vars.c} = ${Number(vars.a) * Number(vars.b)} + ${vars.c} = ${vars.res}.`,
  }),

  // Q04 — გამოკლება და გაყოფა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-04', subtopicId: 'u07-terms-missing-steps', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} − {b} ÷ {c} = ?',
    variables: {
      a: { kind: 'int', min: 20, max: 80 },
      c: { kind: 'choice', values: [2, 3, 4, 5, 6] },
      q: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.c) * Number(v.q)] },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.q),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const q = Number(vars.b) / Number(vars.c);
      return `ჯერ სრულდება გაყოფა: ${vars.b} ÷ ${vars.c} = ${q}, შემდეგ გამოკლება: ${vars.a} − ${q} = ${answer}.`;
    },
  }),

  // Q05 — მოქმედების წევრის დასახელება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-05', subtopicId: 'u07-terms-missing-steps', difficulty: 3 }),
    prompt: 'გამოსახულებაში ({a} + {b}) × {c} = {res}, რა ეწოდება ({a} + {b})-ს გამრავლების მოქმედებაში?',
    variables: {
      a: { kind: 'int', min: 3, max: 12 },
      b: { kind: 'int', min: 2, max: 10 },
      c: { kind: 'int', min: 2, max: 6 },
      res: { kind: 'choice', values: (v: Vars) => [(Number(v.a) + Number(v.b)) * Number(v.c)] },
    },
    answer: () => 'პირველი თანამამრავლი',
    format: { kind: 'text' },
    options: () => [
      'პირველი თანამამრავლი',
      'პირველი შესაკრები',
      'განაყოფი',
      'ნამრავლი',
    ],
    optionCount: 4,
    explanation: () =>
      'გამრავლების მოქმედებაში კომპონენტებია თანამამრავლები და ნამრავლი. ამიტომ ფრჩხილებში მოცემული ჯამი არის პირველი თანამამრავლი.',
  }),

  // Q06 — სამსაფეხურიანი გამოთვლა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-06', subtopicId: 'u07-terms-missing-steps', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} × {b} + {c} × {d} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      b: { kind: 'int', min: 3, max: 7 },
      c: { kind: 'int', min: 2, max: 6 },
      d: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b) + Number(v.c) * Number(v.d),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const p1 = Number(vars.a) * Number(vars.b);
      const p2 = Number(vars.c) * Number(vars.d);
      return `პირველი ნამრავლია ${vars.a} × ${vars.b} = ${p1}, მეორე ნამრავლია ${vars.c} × ${vars.d} = ${p2}. მათი ჯამია: ${p1} + ${p2} = ${answer}.`;
    },
  }),

  // =========================================================================
  // U07.2 — მრავალსაფეხურიანი გამოსახულებები და ფრჩხილები (Multi-step & brackets)
  // =========================================================================

  // Q07 — ფრჩხილებიანი გამოსახულების გამოთვლა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-07', subtopicId: 'u07-multistep-brackets', difficulty: 1 }),
    prompt: 'გამოთვალე: ({a} + {b}) × {c} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 8 },
      b: { kind: 'int', min: 2, max: 7 },
      c: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v: Vars) => (Number(v.a) + Number(v.b)) * Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const sum = Number(vars.a) + Number(vars.b);
      return `ჯერ სრულდება მოქმედება ფრჩხილებში: ${vars.a} + ${vars.b} = ${sum}, შემდეგ ნამრავლი: ${sum} × ${vars.c} = ${answer}.`;
    },
  }),

  // Q08 — ფრჩხილებით და ფრჩხილების გარეშე შედარება (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-08', subtopicId: 'u07-multistep-brackets', difficulty: 1 }),
    prompt: 'ჩასვი შესაბამისი ნიშანი: ({a} + {b}) × {c} □ {a} + {b} × {c}',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      b: { kind: 'int', min: 2, max: 6 },
      c: { kind: 'int', min: 2, max: 5 },
    },
    answer: () => '>',
    format: { kind: 'text' },
    options: () => ['>', '<', '='],
    optionCount: 3,
    explanation: ({ vars }) => {
      const left = (Number(vars.a) + Number(vars.b)) * Number(vars.c);
      const right = Number(vars.a) + Number(vars.b) * Number(vars.c);
      return `მარცხენა მხარეა (${vars.a} + ${vars.b}) × ${vars.c} = ${left}, ხოლო მარჯვენა მხარეა ${vars.a} + ${vars.b} × ${vars.c} = ${right}. რადგან ${left} > ${right}, სწორი ნიშანია '>'.`;
    },
  }),

  // Q09 — გაყოფა ფრჩხილებით (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-09', subtopicId: 'u07-multistep-brackets', difficulty: 2 }),
    prompt: 'გამოთვალე: ({a} − {b}) ÷ {c} = ?',
    variables: {
      c: { kind: 'choice', values: [2, 3, 4, 5] },
      q: { kind: 'int', min: 2, max: 8 },
      b: { kind: 'int', min: 5, max: 25 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.c) * Number(v.q)] },
    },
    answer: (v: Vars) => Number(v.q),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const diff = Number(vars.a) - Number(vars.b);
      return `ჯერ ვასრულებთ ფრჩხილებში: ${vars.a} − ${vars.b} = ${diff}. შემდეგ ვყოფთ: ${diff} ÷ ${vars.c} = ${answer}.`;
    },
  }),

  // Q10 — ფრჩხილების სწორად დასმა მიზნობრივი შედეგისთვის (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-10', subtopicId: 'u07-multistep-brackets', difficulty: 2 }),
    prompt: 'რომელი ჩანაწერია სწორი, თუ გვინდა მივიღოთ {target} გამოსახულებით {a} + {b} × {c}?',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      b: { kind: 'int', min: 2, max: 5 },
      c: { kind: 'int', min: 2, max: 4 },
      target: { kind: 'choice', values: (v: Vars) => [(Number(v.a) + Number(v.b)) * Number(v.c)] },
    },
    answer: (v: Vars) => `(${v.a} + ${v.b}) × ${v.c}`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `(${v.a} + ${v.b}) × ${v.c}`,
      `${v.a} + (${v.b} × ${v.c})`,
      `(${v.a} × ${v.c}) + ${v.b}`,
      `${v.a} + ${v.b} × ${v.c}`,
    ],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `(${vars.a} + ${vars.b}) × ${vars.c} = ${Number(vars.a) + Number(vars.b)} × ${vars.c} = ${vars.target}, ამიტომ სწორია ${answer}.`,
  }),

  // Q11 — ორი ფრჩხილის ნამრავლი (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-11', subtopicId: 'u07-multistep-brackets', difficulty: 3 }),
    prompt: 'გამოთვალე: ({a} + {b}) × ({c} − {d}) = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 8 },
      b: { kind: 'int', min: 2, max: 7 },
      d: { kind: 'int', min: 1, max: 4 },
      diff: { kind: 'int', min: 2, max: 5 },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.d) + Number(v.diff)] },
    },
    answer: (v: Vars) => (Number(v.a) + Number(v.b)) * Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const sum = Number(vars.a) + Number(vars.b);
      const diff = Number(vars.c) - Number(vars.d);
      return `პირველი ფრჩხილია ${vars.a} + ${vars.b} = ${sum}, მეორე ფრჩხილია ${vars.c} − ${vars.d} = ${diff}. მათი ნამრავლია: ${sum} × ${diff} = ${answer}.`;
    },
  }),

  // Q12 — ფრჩხილების გახსნის წესი (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-12', subtopicId: 'u07-multistep-brackets', difficulty: 3 }),
    prompt: 'რომელი გამოსახულებაა ({a} + {b}) × {c}-ის ტოლი ფრჩხილების გახსნის შემდეგ?',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      b: { kind: 'int', min: 2, max: 8 },
      c: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v: Vars) => `${v.a} × ${v.c} + ${v.b} × ${v.c}`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `${v.a} × ${v.c} + ${v.b} × ${v.c}`,
      `${v.a} + ${v.b} × ${v.c}`,
      `${v.a} × ${v.b} + ${v.c}`,
      `(${v.a} + ${v.b}) + ${v.c}`,
    ],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `განრიგებადობის კანონით თითოეული შესაკრები მრავლდება ${vars.c}-ზე: (${vars.a} + ${vars.b}) × ${vars.c} = ${answer}.`,
  }),

  // =========================================================================
  // U07.3 — ჯამისა და ნამრავლის შედარება (Comparing sums & products)
  // =========================================================================

  // Q13 — შედარება ნამრავლსა და ჯამს შორის (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-13', subtopicId: 'u07-comparing-sums-products', difficulty: 1 }),
    prompt: 'ჩასვი შესაბამისი ნიშანი: {a} × {b} □ {c} + {d}',
    variables: {
      a: { kind: 'int', min: 3, max: 8 },
      b: { kind: 'int', min: 3, max: 8 },
      c: { kind: 'int', min: 10, max: 30 },
      d: { kind: 'int', min: 5, max: 25 },
    },
    answer: (v: Vars) => {
      const prod = Number(v.a) * Number(v.b);
      const sum = Number(v.c) + Number(v.d);
      if (prod > sum) return '>';
      if (prod < sum) return '<';
      return '=';
    },
    format: { kind: 'text' },
    options: () => ['>', '<', '='],
    optionCount: 3,
    explanation: ({ vars, answer }) => {
      const prod = Number(vars.a) * Number(vars.b);
      const sum = Number(vars.c) + Number(vars.d);
      return `${vars.a} × ${vars.b} = ${prod}, ხოლო ${vars.c} + ${vars.d} = ${sum}. რადგან ${prod} ${answer} ${sum}, სწორი ნიშანია '${answer}'.`;
    },
  }),

  // Q14 — რამდენით მეტია ნამრავლი ჯამზე (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-14', subtopicId: 'u07-comparing-sums-products', difficulty: 1 }),
    prompt: 'რამდენით მეტია ნამრავლი {a} × {b} ჯამზე {c} + {d}?',
    variables: {
      a: { kind: 'int', min: 4, max: 8 },
      b: { kind: 'int', min: 5, max: 9 },
      c: { kind: 'int', min: 5, max: 15 },
      d: { kind: 'int', min: 5, max: 15 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b) - (Number(v.c) + Number(v.d)),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const prod = Number(vars.a) * Number(vars.b);
      const sum = Number(vars.c) + Number(vars.d);
      return `ნამრავლია ${vars.a} × ${vars.b} = ${prod}, ჯამია ${vars.c} + ${vars.d} = ${sum}. სხვაობაა: ${prod} − ${sum} = ${answer}.`;
    },
  }),

  // Q15 — განმეორებითი შეკრება და ნამრავლი (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-15', subtopicId: 'u07-comparing-sums-products', difficulty: 2 }),
    prompt: 'ჩასვი შესაბამისი ნიშანი: {a} + {a} + {a} + {a} □ {a} × 5',
    variables: {
      a: { kind: 'int', min: 2, max: 15 },
    },
    answer: () => '<',
    format: { kind: 'text' },
    options: () => ['<', '>', '='],
    optionCount: 3,
    explanation: ({ vars }) =>
      `მარცხნივ არის ${vars.a} აღებული 4-ჯერ (${vars.a} × 4), მარჯვნივ კი ${vars.a} × 5. რადგან 4 < 5, სწორი ნიშანია '<'.`,
  }),

  // Q16 — ყუთებისა და ცალკეული საგნების ჯამი (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-16', subtopicId: 'u07-comparing-sums-products', difficulty: 2 }),
    prompt: 'მაღაზიაში არის {boxes} ყუთი ფანქარი, თითოეულში {perBox} ცალი, და კიდევ {loose} ცალკეული ფანქარი. სულ რამდენი ფანქარია?',
    variables: {
      boxes: { kind: 'int', min: 2, max: 6 },
      perBox: { kind: 'choice', values: [6, 8, 10, 12] },
      loose: { kind: 'int', min: 3, max: 15 },
    },
    answer: (v: Vars) => Number(v.boxes) * Number(v.perBox) + Number(v.loose),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const boxTotal = Number(vars.boxes) * Number(vars.perBox);
      return `ყუთებში სულ არის: ${vars.boxes} × ${vars.perBox} = ${boxTotal} ფანქარი. ცალკეულებთან ერთად: ${boxTotal} + ${vars.loose} = ${answer} ფანქარი.`;
    },
  }),

  // Q17 — ნამრავლის შედარება მომდევნო მამრავლთან (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-17', subtopicId: 'u07-comparing-sums-products', difficulty: 3 }),
    prompt: 'ჩასვი შესაბამისი ნიშანი: {a} × ({b} + 1) □ {a} × {b} + {a}',
    variables: {
      a: { kind: 'int', min: 2, max: 12 },
      b: { kind: 'int', min: 2, max: 9 },
    },
    answer: () => '=',
    format: { kind: 'text' },
    options: () => ['=', '>', '<'],
    optionCount: 3,
    explanation: ({ vars }) =>
      `განრიგებადობის წესით: ${vars.a} × (${vars.b} + 1) = ${vars.a} × ${vars.b} + ${vars.a} × 1 = ${vars.a} × ${vars.b} + ${vars.a}. ორივე მხარე ტოლია, ამიტომ ნიშანია '='.`,
  }),

  // Q18 — გამოტოვებული შესაკრები ტოლობის მისაღწევად (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-18', subtopicId: 'u07-comparing-sums-products', difficulty: 3 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: {a} × {b} = {c} + □',
    variables: {
      a: { kind: 'int', min: 4, max: 8 },
      b: { kind: 'int', min: 4, max: 8 },
      c: { kind: 'int', min: 5, max: 20 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const prod = Number(vars.a) * Number(vars.b);
      return `მარცხენა მხარეა ${vars.a} × ${vars.b} = ${prod}. გამოტოვებული რიცხვია: ${prod} − ${vars.c} = ${answer}.`;
    },
  }),

  // =========================================================================
  // U07.4 — სხვაობისა და განაყოფის შედარება (Comparing differences & quotients)
  // =========================================================================

  // Q19 — სხვაობისა და განაყოფის შედარება (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-19', subtopicId: 'u07-comparing-differences-quotients', difficulty: 1 }),
    prompt: 'ჩასვი შესაბამისი ნიშანი: {a} − {b} □ {c} ÷ {d}',
    variables: {
      a: { kind: 'int', min: 15, max: 40 },
      b: { kind: 'int', min: 5, max: 15 },
      d: { kind: 'choice', values: [2, 3, 4, 5] },
      q: { kind: 'int', min: 2, max: 9 },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.d) * Number(v.q)] },
    },
    answer: (v: Vars) => {
      const diff = Number(v.a) - Number(v.b);
      const quot = Number(v.q);
      if (diff > quot) return '>';
      if (diff < quot) return '<';
      return '=';
    },
    format: { kind: 'text' },
    options: () => ['>', '<', '='],
    optionCount: 3,
    explanation: ({ vars, answer }) => {
      const diff = Number(vars.a) - Number(vars.b);
      const quot = Number(vars.c) / Number(vars.d);
      return `${vars.a} − ${vars.b} = ${diff}, ხოლო ${vars.c} ÷ ${vars.d} = ${quot}. რადგან ${diff} ${answer} ${quot}, სწორი ნიშანია '${answer}'.`;
    },
  }),

  // Q20 — სხვაობისა და განაყოფის სხვაობა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-20', subtopicId: 'u07-comparing-differences-quotients', difficulty: 1 }),
    prompt: 'გამოთვალე: ({a} − {b}) − ({c} ÷ {d}) = ?',
    variables: {
      a: { kind: 'int', min: 20, max: 50 },
      b: { kind: 'int', min: 5, max: 15 },
      d: { kind: 'choice', values: [2, 3, 4, 5] },
      q: { kind: 'int', min: 2, max: 6 },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.d) * Number(v.q)] },
    },
    answer: (v: Vars) => (Number(v.a) - Number(v.b)) - Number(v.q),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const diff = Number(vars.a) - Number(vars.b);
      const quot = Number(vars.c) / Number(vars.d);
      return `სხვაობაა ${vars.a} − ${vars.b} = ${diff}, განაყოფია ${vars.c} ÷ ${vars.d} = ${quot}. პასუხია: ${diff} − ${quot} = ${answer}.`;
    },
  }),

  // Q21 — რომელია ნაკლები (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-21', subtopicId: 'u07-comparing-differences-quotients', difficulty: 2 }),
    prompt: 'რომელი გამოსახულების მნიშვნელობაა ნაკლები: {a} − {b} თუ {c} ÷ {d}?',
    variables: {
      a: { kind: 'int', min: 20, max: 40 },
      b: { kind: 'int', min: 5, max: 15 },
      d: { kind: 'choice', values: [2, 3, 4, 5] },
      q: { kind: 'int', min: 2, max: 8 },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.d) * Number(v.q)] },
    },
    answer: (v: Vars) => `${v.c} ÷ ${v.d}`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `${v.c} ÷ ${v.d}`,
      `${v.a} − ${v.b}`,
      'ტოლია',
    ],
    optionCount: 3,
    explanation: ({ vars, answer }) => {
      const diff = Number(vars.a) - Number(vars.b);
      const quot = Number(vars.c) / Number(vars.d);
      return `${vars.a} − ${vars.b} = ${diff}, ხოლო ${vars.c} ÷ ${vars.d} = ${quot}. რადგან ${quot} < ${diff}, ნაკლებია ${answer}.`;
    },
  }),

  // Q22 — რამდენჯერ მეტია სხვაობა განაყოფზე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-22', subtopicId: 'u07-comparing-differences-quotients', difficulty: 2 }),
    prompt: 'რამდენჯერ მეტია სხვაობა ({a} − {b}) განაყოფზე ({c} ÷ {d})?',
    variables: {
      d: { kind: 'choice', values: [2, 3, 4, 5] },
      quot: { kind: 'int', min: 2, max: 6 },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.d) * Number(v.quot)] },
      mult: { kind: 'choice', values: [2, 3, 4, 5] },
      b: { kind: 'int', min: 5, max: 15 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.quot) * Number(v.mult)] },
    },
    answer: (v: Vars) => Number(v.mult),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const diff = Number(vars.a) - Number(vars.b);
      const quot = Number(vars.c) / Number(vars.d);
      return `სხვაობაა ${vars.a} − ${vars.b} = ${diff}, განაყოფია ${vars.c} ÷ ${vars.d} = ${quot}. შეფარდებაა: ${diff} ÷ ${quot} = ${answer}-ჯერ მეტი.`;
    },
  }),

  // Q23 — ნულისა და ერთის მიღება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-23', subtopicId: 'u07-comparing-differences-quotients', difficulty: 3 }),
    prompt: 'ნებისმიერი არანულოვანი რიცხვი n-ისთვის, ჩასვი შესაბამისი ნიშანი: {n} − {n} □ {n} ÷ {n}',
    variables: {
      n: { kind: 'int', min: 2, max: 20 },
    },
    answer: () => '<',
    format: { kind: 'text' },
    options: () => ['<', '>', '='],
    optionCount: 3,
    explanation: ({ vars }) =>
      `${vars.n} − ${vars.n} = 0, ხოლო ${vars.n} ÷ ${vars.n} = 1. რადგან 0 < 1, სწორი ნიშანია '<'.`,
  }),

  // Q24 — ფასდაკლებისა და ნაწილის შედარება (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-24', subtopicId: 'u07-comparing-differences-quotients', difficulty: 3 }),
    prompt: 'წიგნი ღირდა {price} ლარი და გაიაფდა {disc} ლარით. რვეული ღირს {nbTotal} ლარი {nbCount} ცალი. რამდენით ძვირია ახლა წიგნი 1 რვეულზე?',
    variables: {
      disc: { kind: 'choice', values: [3, 4, 5, 6] },
      price: { kind: 'int', min: 15, max: 30 },
      nbCount: { kind: 'choice', values: [2, 3, 4] },
      nbEach: { kind: 'choice', values: [2, 3, 4] },
      nbTotal: { kind: 'choice', values: (v: Vars) => [Number(v.nbCount) * Number(v.nbEach)] },
    },
    answer: (v: Vars) => (Number(v.price) - Number(v.disc)) - Number(v.nbEach),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const bookNew = Number(vars.price) - Number(vars.disc);
      const nbPrice = Number(vars.nbTotal) / Number(vars.nbCount);
      return `წიგნის ახალი ფასია: ${vars.price} − ${vars.disc} = ${bookNew} ლარი. ერთი რვეულის ფასია: ${vars.nbTotal} ÷ ${vars.nbCount} = ${nbPrice} ლარი. სხვაობაა: ${bookNew} − ${nbPrice} = ${answer} ლარი.`;
    },
  }),

  // =========================================================================
  // U07.5 — ჯერადი შედარება (Scale comparisons)
  // =========================================================================

  // Q25 — რამდენჯერ მეტია (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-25', subtopicId: 'u07-scale-comparisons', difficulty: 1 }),
    prompt: '{big} რამდენჯერ მეტია {small}-ზე?',
    variables: {
      small: { kind: 'int', min: 2, max: 9 },
      times: { kind: 'int', min: 2, max: 9 },
      big: { kind: 'choice', values: (v: Vars) => [Number(v.small) * Number(v.times)] },
    },
    answer: (v: Vars) => Number(v.times),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `იმის გასაგებად, თუ რამდენჯერ მეტია ერთი რიცხვი მეორეზე, დიდი უნდა გავყოთ პატარაზე: ${vars.big} ÷ ${vars.small} = ${answer}-ჯერ მეტია.`,
  }),

  // Q26 — რამდენჯერ მეტია და რამდენით მეტია გარჩევა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-26', subtopicId: 'u07-scale-comparisons', difficulty: 1 }),
    prompt: 'რიცხვი {big} რიცხვ {small}-ზე რამდენჯერ მეტია?',
    variables: {
      small: { kind: 'choice', values: [3, 4, 5, 6] },
      mult: { kind: 'choice', values: [3, 4, 5] },
      big: { kind: 'choice', values: (v: Vars) => [Number(v.small) * Number(v.mult)] },
    },
    answer: (v: Vars) => `${v.mult}-ჯერ მეტია`,
    format: { kind: 'text' },
    options: (v: Vars) => {
      const mult = Number(v.mult);
      const diff = Number(v.big) - Number(v.small);
      return [
        `${mult}-ჯერ მეტია`,
        `${diff}-ით მეტია`,
        `${mult + 1}-ჯერ მეტია`,
        `${diff + 2}-ით მეტია`,
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `რამდენჯერ მეტობის გასაგებად ვყოფთ: ${vars.big} ÷ ${vars.small} = ${vars.mult}, ამიტომ სწორი პასუხია '${answer}'.`,
  }),

  // Q27 — ჯერადობა და ჯამი (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-27', subtopicId: 'u07-scale-comparisons', difficulty: 2 }),
    prompt: 'ნიკას აქვს {small} რვეული, ხოლო დათოს — {times}-ჯერ მეტი. სულ რამდენი რვეული აქვთ ორივეს ერთად?',
    variables: {
      small: { kind: 'int', min: 3, max: 8 },
      times: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v: Vars) => Number(v.small) + Number(v.small) * Number(v.times),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const dato = Number(vars.small) * Number(vars.times);
      return `დათოს აქვს: ${vars.small} × ${vars.times} = ${dato} რვეული. ერთად აქვთ: ${vars.small} + ${dato} = ${answer} რვეული.`;
    },
  }),

  // Q28 — რამდენით მეტია ჯერადი რაოდენობა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-28', subtopicId: 'u07-scale-comparisons', difficulty: 2 }),
    prompt: 'პირველ კალათში არის {a} ვაშლი, მეორეში კი — {k}-ჯერ მეტი. რამდენით მეტი ვაშლია მეორე კალათში პირველზე?',
    variables: {
      a: { kind: 'int', min: 4, max: 10 },
      k: { kind: 'choice', values: [2, 3, 4] },
    },
    answer: (v: Vars) => {
      const diff = Number(v.a) * Number(v.k) - Number(v.a);
      return `${diff}-ით მეტი`;
    },
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const diff = Number(vars.a) * Number(vars.k) - Number(vars.a);
      return [
        `${diff + Number(vars.a)}-ით მეტი`,
        `${Number(vars.k)}-ით მეტი`,
        `${diff - 2}-ით მეტი`,
      ];
    },
    explanation: ({ vars, answer }) => {
      const b = Number(vars.a) * Number(vars.k);
      const diff = b - Number(vars.a);
      return `მეორე კალათშია: ${vars.a} × ${vars.k} = ${b} ვაშლი. სხვაობაა: ${b} − ${vars.a} = ${diff} ვაშლი, ანუ ${answer}.`;
    },
  }),

  // Q29 — სხვაობისა და ჯერადობის მიხედვით უმცირესის პოვნა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-29', subtopicId: 'u07-scale-comparisons', difficulty: 3 }),
    prompt: 'სანდრო მარიამზე {k}-ჯერ მეტ მარკას ფლობს. სანდროს {diff}-ით მეტი მარკა აქვს, ვიდრე მარიამს. რამდენი მარკა აქვს მარიამს?',
    variables: {
      k: { kind: 'choice', values: [2, 3, 4] },
      mariam: { kind: 'int', min: 4, max: 15 },
      diff: { kind: 'choice', values: (v: Vars) => [Number(v.mariam) * (Number(v.k) - 1)] },
    },
    answer: (v: Vars) => Number(v.mariam),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const parts = Number(vars.k) - 1;
      return `სხვაობა შეადგენს ${vars.k} − 1 = ${parts} ნაწილს. ერთი ნაწილი (მარიამის მარკები) არის: ${vars.diff} ÷ ${parts} = ${answer}.`;
    },
  }),

  // Q30 — რთული ჯერადი შედარება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-30', subtopicId: 'u07-scale-comparisons', difficulty: 3 }),
    prompt: 'A რიცხვი B-ზე {m1}-ჯერ მეტია, ხოლო B რიცხვი C-ზე {m2}-ჯერ მეტია. რამდენჯერ მეტია A რიცხვი C-ზე?',
    variables: {
      m1: { kind: 'choice', values: [2, 3, 4, 5, 6] },
      m2: { kind: 'choice', values: [2, 3, 4, 5] },
    },
    answer: (v: Vars) => `${Number(v.m1) * Number(v.m2)}-ჯერ`,
    format: { kind: 'text' },
    options: (v: Vars) => {
      const prod = Number(v.m1) * Number(v.m2);
      const sum = Number(v.m1) + Number(v.m2);
      const opts = new Set<string>();
      opts.add(`${prod}-ჯერ`);
      if (sum !== prod) opts.add(`${sum}-ჯერ`);
      opts.add(`${prod + 2}-ჯერ`);
      opts.add(`${prod + 4}-ჯერ`);
      if (prod > 2) opts.add(`${prod - 1}-ჯერ`);
      return Array.from(opts).slice(0, 4);
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `A = ${vars.m1} × B = ${vars.m1} × (${vars.m2} × C) = (${vars.m1} × ${vars.m2}) × C = ${Number(vars.m1) * Number(vars.m2)} × C. ამიტომ A C-ზე ${answer} მეტია.`,
  }),

  // =========================================================================
  // U07.6 — მანძილისა და რაოდენობის გამოთვლები (Distance & quantity)
  // =========================================================================

  // Q31 — მანძილის გამოთვლა სიჩქარითა და დროით (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-31', subtopicId: 'u07-distance-quantity', difficulty: 1 }),
    prompt: 'ავტომობილი მოძრაობს {speed} კმ/სთ სიჩქარით. რა მანძილს გაივლის იგი {time} საათში?',
    variables: {
      speed: { kind: 'choice', values: [40, 50, 60, 70, 80] },
      time: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v: Vars) => Number(v.speed) * Number(v.time),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10),
    explanation: ({ vars, answer }) =>
      `მანძილი = სიჩქარე × დრო = ${vars.speed} × ${vars.time} = ${answer} კმ.`,
  }),

  // Q32 — ორეტაპიანი მგზავრობა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-32', subtopicId: 'u07-distance-quantity', difficulty: 1 }),
    prompt: 'ტურისტმა {walk} კმ გაიარა ფეხით, ხოლო შემდეგ {busHours} საათი იმგზავრა ავტობუსით, რომელიც {busSpeed} კმ/სთ სიჩქარით მოძრაობდა. სულ რა მანძილი გაიარა ტურისტმა?',
    variables: {
      walk: { kind: 'int', min: 3, max: 10 },
      busHours: { kind: 'choice', values: [2, 3, 4] },
      busSpeed: { kind: 'choice', values: [30, 40, 50] },
    },
    answer: (v: Vars) => {
      const tot = Number(v.walk) + Number(v.busHours) * Number(v.busSpeed);
      return `${tot} კმ`;
    },
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const bus = Number(vars.busHours) * Number(vars.busSpeed);
      const tot = Number(vars.walk) + bus;
      return [
        `${bus} კმ`,
        `${tot + 10} კმ`,
        `${tot - 5} კმ`,
      ];
    },
    explanation: ({ vars, answer }) => {
      const bus = Number(vars.busHours) * Number(vars.busSpeed);
      return `ავტობუსით გაიარა: ${vars.busHours} × ${vars.busSpeed} = ${bus} კმ. სულ მანძილია: ${vars.walk} + ${bus} = ${answer}.`;
    },
  }),

  // Q33 — ორმხრივი გზა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-33', subtopicId: 'u07-distance-quantity', difficulty: 2 }),
    prompt: 'ქალაქიდან სოფლამდე მანძილი {dist} კმ-ია. მძღოლი ჩავიდა სოფელში და იმავე გზით დაბრუნდა უკან. სულ რა მანძილი გაიარა მძღოლმა?',
    variables: {
      dist: { kind: 'int', min: 25, max: 80 },
    },
    answer: (v: Vars) => 2 * Number(v.dist),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10),
    explanation: ({ vars, answer }) =>
      `ორმხრივი გზაა: ${vars.dist} × 2 = ${answer} კმ.`,
  }),

  // Q34 — შეძენილი ნივთების საერთო ღირებულება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-34', subtopicId: 'u07-distance-quantity', difficulty: 2 }),
    prompt: 'გიორგიმ იყიდა {count} რვეული, თითოეული {price} ლარად, და ერთი სახაზავი {ruler} ლარად. სულ რამდენი ლარი გადაიხადა გიორგიმ?',
    variables: {
      count: { kind: 'int', min: 3, max: 8 },
      price: { kind: 'choice', values: [2, 3, 4] },
      ruler: { kind: 'choice', values: [3, 4, 5] },
    },
    answer: (v: Vars) => {
      const tot = Number(v.count) * Number(v.price) + Number(v.ruler);
      return `${tot} ლარი`;
    },
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const tot = Number(vars.count) * Number(vars.price) + Number(vars.ruler);
      return [
        `${Number(vars.count) * Number(vars.price)} ლარი`,
        `${tot + 2} ლარი`,
        `${tot - 3} ლარი`,
      ];
    },
    explanation: ({ vars, answer }) => {
      const nb = Number(vars.count) * Number(vars.price);
      return `რვეულებში გადაიხადა: ${vars.count} × ${vars.price} = ${nb} ლარი. სულ: ${nb} + ${vars.ruler} = ${answer}.`;
    },
  }),

  // Q35 — დარჩენილი მანძილის გამოთვლა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-35', subtopicId: 'u07-distance-quantity', difficulty: 3 }),
    prompt: 'ორ ქალაქს შორის მანძილი {totalDist} კმ-ია. მატარებელმა {hours} საათი იარა {speed} კმ/სთ სიჩქარით. კიდევ რამდენი კილომეტრი დარჩა გასავლელი?',
    variables: {
      hours: { kind: 'choice', values: [2, 3] },
      speed: { kind: 'choice', values: [50, 60, 70] },
      rem: { kind: 'int', min: 20, max: 60 },
      totalDist: { kind: 'choice', values: (v: Vars) => [Number(v.hours) * Number(v.speed) + Number(v.rem)] },
    },
    answer: (v: Vars) => Number(v.rem),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10),
    explanation: ({ vars, answer }) => {
      const passed = Number(vars.hours) * Number(vars.speed);
      return `მატარებელმა გაიარა: ${vars.hours} × ${vars.speed} = ${passed} კმ. დარჩა: ${vars.totalDist} − ${passed} = ${answer} კმ.`;
    },
  }),

  // Q36 — ხურდის გამოთვლა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-36', subtopicId: 'u07-distance-quantity', difficulty: 3 }),
    prompt: 'ანა მოლარეს აძლევს {bill}-ლარიან კუპიურას {k} ცალი ნაყინის შესაძენად, რომელთაგან თითოეული {cost} ლარი ღირს. რა თანხა უნდა დაუბრუნოს მოლარემ ხურდად?',
    variables: {
      k: { kind: 'choice', values: [3, 4, 5] },
      cost: { kind: 'choice', values: [2, 3, 4] },
      bill: { kind: 'choice', values: [20, 50] },
    },
    answer: (v: Vars) => {
      const change = Number(v.bill) - Number(v.k) * Number(v.cost);
      return `${change} ლარი`;
    },
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const ice = Number(vars.k) * Number(vars.cost);
      const change = Number(vars.bill) - ice;
      return [
        `${ice} ლარი`,
        `${change + 4} ლარი`,
        `${change - 2} ლარი`,
      ];
    },
    explanation: ({ vars, answer }) => {
      const ice = Number(vars.k) * Number(vars.cost);
      return `ნაყინის ღირებულებაა: ${vars.k} × ${vars.cost} = ${ice} ლარი. ხურდაა: ${vars.bill} − ${ice} = ${answer}.`;
    },
  }),

  // =========================================================================
  // U07.7 — მოქმედებების დალაგება (Sorting operations)
  // =========================================================================

  // Q37 — უდიდესი მნიშვნელობის მქონე გამოსახულება (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-37', subtopicId: 'u07-sorting-operations', difficulty: 1 }),
    prompt: 'რომელ გამოსახულებას აქვს უდიდესი მნიშვნელობა, როდესაც n = {n}?',
    variables: {
      n: { kind: 'int', min: 2, max: 20 },
    },
    answer: (v: Vars) => `4 × ${v.n} + 15`,
    format: { kind: 'text' },
    options: (v: Vars) => {
      const n = Number(v.n);
      return [
        `4 × ${n} + 15`,
        `2 × ${n} + 10`,
        `3 × ${n} + 5`,
        `1 × ${n} + 12`,
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) => {
      const n = Number(vars.n);
      const v1 = 4 * n + 15;
      const v2 = 2 * n + 10;
      const v3 = 3 * n + 5;
      const v4 = n + 12;
      return `მნიშვნელობებია: 4×${n}+15 = ${v1}, 2×${n}+10 = ${v2}, 3×${n}+5 = ${v3}, ${n}+12 = ${v4}. უდიდესია ${answer} (${v1}).`;
    },
  }),

  // Q38 — უმცირესი მნიშვნელობის მქონე გამოსახულება (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-38', subtopicId: 'u07-sorting-operations', difficulty: 1 }),
    prompt: 'რომელ გამოსახულებას აქვს უმცირესი მნიშვნელობა, როდესაც x = {x}?',
    variables: {
      x: { kind: 'int', min: 3, max: 20 },
    },
    answer: (v: Vars) => `2 × ${v.x} − 2`,
    format: { kind: 'text' },
    options: (v: Vars) => {
      const x = Number(v.x);
      return [
        `2 × ${x} − 2`,
        `2 × ${x} + 5`,
        `3 × ${x} + 2`,
        `4 × ${x} − 1`,
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) => {
      const x = Number(vars.x);
      const v1 = 2 * x - 2;
      const v2 = 2 * x + 5;
      const v3 = 3 * x + 2;
      const v4 = 4 * x - 1;
      return `მნიშვნელობებია: 2×${x}−2 = ${v1}, 2×${x}+5 = ${v2}, 3×${x}+2 = ${v3}, 4×${x}−1 = ${v4}. უმცირესია ${answer} (${v1}).`;
    },
  }),

  // Q39 — დალაგება ზრდის მიხედვით (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-39', subtopicId: 'u07-sorting-operations', difficulty: 2 }),
    prompt: 'დაალაგე გამოსახულებები ზრდის მიხედვით (უმცირესიდან უდიდესისკენ): A = 2 × {k}, B = {k} + {add}, C = 3 × {k}',
    variables: {
      k: { kind: 'choice', values: [2, 3, 4, 5, 6, 7] },
      add: { kind: 'choice', values: [20, 25, 30] },
    },
    answer: () => 'A < C < B',
    format: { kind: 'text' },
    options: () => [
      'A < C < B',
      'B < A < C',
      'C < B < A',
      'A < B < C',
    ],
    optionCount: 4,
    explanation: ({ vars }) => {
      const k = Number(vars.k);
      const add = Number(vars.add);
      const a = 2 * k;
      const b = k + add;
      const c = 3 * k;
      return `A = 2 × ${k} = ${a}, B = ${k} + ${add} = ${b}, C = 3 × ${k} = ${c}. რადგან ${a} < ${c} < ${b}, სწორი რიგია A < C < B.`;
    },
  }),

  // Q40 — დალაგება კლების მიხედვით (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-40', subtopicId: 'u07-sorting-operations', difficulty: 2 }),
    prompt: 'დაალაგე გამოსახულებები კლების მიხედვით (უდიდესიდან უმცირესისკენ): A = {base} − {m}, B = 2 × {m} + 10, C = {m} + 5',
    variables: {
      m: { kind: 'choice', values: [3, 4, 5, 6, 7] },
      base: { kind: 'choice', values: [40, 50, 60] },
    },
    answer: () => 'A > B > C',
    format: { kind: 'text' },
    options: () => [
      'A > B > C',
      'B > C > A',
      'C > A > B',
      'A > C > B',
    ],
    optionCount: 4,
    explanation: ({ vars }) => {
      const m = Number(vars.m);
      const base = Number(vars.base);
      const a = base - m;
      const b = 2 * m + 10;
      const c = m + 5;
      return `A = ${base} − ${m} = ${a}, B = 2 × ${m} + 10 = ${b}, C = ${m} + 5 = ${c}. რადგან ${a} > ${b} > ${c}, სწორი რიგია A > B > C.`;
    },
  }),

  // Q41 — უტოლობის სისწორის დადგენა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u07-41', subtopicId: 'u07-sorting-operations', difficulty: 3 }),
    prompt: 'რიცხვ {a}-ისთვის, რომელი უტოლობაა ჭეშმარიტი?',
    variables: {
      a: { kind: 'int', min: 2, max: 20 },
    },
    answer: (v: Vars) => `2 × ${v.a} < 3 × ${v.a} < 4 × ${v.a}`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `2 × ${v.a} < 3 × ${v.a} < 4 × ${v.a}`,
      `4 × ${v.a} < 3 × ${v.a} < 2 × ${v.a}`,
      `3 × ${v.a} < 2 × ${v.a} < 4 × ${v.a}`,
      `2 × ${v.a} > 3 × ${v.a} > 4 × ${v.a}`,
    ],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `დადებითი რიცხვისთვის ${vars.a}, მამრავლის გაზრდით ნამრავლიც იზრდება: 2 × ${vars.a} < 3 × ${vars.a} < 4 × ${vars.a}. ამიტომ ჭეშმარიტია ${answer}.`,
  }),

  // Q42 — უდიდესსა და უმცირესს შორის სხვაობა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u07-42', subtopicId: 'u07-sorting-operations', difficulty: 3 }),
    prompt: 'მოცემულია გამოსახულებები: A = 4 × {n} + 10, B = 2 × {n} + 5, C = 3 × {n} + 8. გამოთვალე სხვაობა უდიდესსა და უმცირეს მნიშვნელობებს შორის (A − B).',
    variables: {
      n: { kind: 'int', min: 3, max: 15 },
    },
    answer: (v: Vars) => 2 * Number(v.n) + 5,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const n = Number(vars.n);
      const a = 4 * n + 10;
      const b = 2 * n + 5;
      return `A = 4 × ${n} + 10 = ${a}, B = 2 × ${n} + 5 = ${b}. სხვაობაა: ${a} − ${b} = ${answer}.`;
    },
  }),
];
