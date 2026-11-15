import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

export const G3_U08_SUBTOPICS = [
  'u08-unknown-addends',
  'u08-unknown-minuends-subtrahends',
  'u08-unknown-factors',
  'u08-unknown-dividends-divisors',
] as const;

const addr = (t: { id: string; subtopicId: string; difficulty: 1 | 2 | 3 }) => ({
  id: t.id,
  grade: 3 as const,
  topicId: 'g3-gantolebebi',
  unitId: 'g3-gantolebebi',
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

export const G3_U08_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U08.1 — განტოლება უცნობი შესაკრებით (Unknown addends)
  // =========================================================================

  // Q01 — უცნობი პირველი შესაკრები (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u08-01', subtopicId: 'u08-unknown-addends', difficulty: 1 }),
    prompt: 'ამოხსენი განტოლება: x + {a} = {b}. რას უდრის x?',
    variables: {
      x: { kind: 'int', min: 5, max: 45 },
      a: { kind: 'int', min: 10, max: 50 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.x) + Number(v.a)] },
    },
    answer: (v: Vars) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `უცნობი შესაკრების საპოვნელად ჯამს უნდა გამოვაკლოთ ცნობილი შესაკრები: x = ${vars.b} − ${vars.a} = ${answer}.`,
  }),

  // Q02 — უცნობი მეორე შესაკრები (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u08-02', subtopicId: 'u08-unknown-addends', difficulty: 1 }),
    prompt: 'რომელი მოქმედებით ვიპოვით უცნობ x-ს განტოლებაში: {a} + x = {b}?',
    variables: {
      a: { kind: 'int', min: 12, max: 40 },
      diff: { kind: 'int', min: 10, max: 35 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.a) + Number(v.diff)] },
    },
    answer: (v: Vars) => `x = ${v.b} − ${v.a}`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `x = ${v.b} − ${v.a}`,
      `x = ${v.b} + ${v.a}`,
      `x = ${v.a} − ${v.b}`,
      `x = ${v.b} × ${v.a}`,
    ],
    optionCount: 4,
    explanation: ({ answer }) =>
      `უცნობი შესაკრების მოსაძებნად ჯამს ვაკლებთ ცნობილ შესაკრებს: ${answer}.`,
  }),

  // Q03 — უცნობი შესაკრები სამნიშნა რიცხვებში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u08-03', subtopicId: 'u08-unknown-addends', difficulty: 2 }),
    prompt: 'ამოხსენი განტოლება: {a} + x = {b}. რას უდრის x?',
    variables: {
      a: { kind: 'int', min: 120, max: 350 },
      x: { kind: 'int', min: 30, max: 150 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.a) + Number(v.x)] },
    },
    answer: (v: Vars) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10),
    explanation: ({ vars, answer }) =>
      `x = ${vars.b} − ${vars.a} = ${answer}.`,
  }),

  // Q04 — ტექსტური ამოცანის განტოლება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u08-04', subtopicId: 'u08-unknown-addends', difficulty: 2 }),
    prompt: 'გიორგის ჰქონდა x წიგნი. მან იყიდა კიდევ {bought} წიგნი და სულ გაუხდა {total}. რომელი განტოლება შეესაბამება ამოცანას?',
    variables: {
      bought: { kind: 'int', min: 5, max: 20 },
      initial: { kind: 'int', min: 10, max: 40 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.initial) + Number(v.bought)] },
    },
    answer: (v: Vars) => `x + ${v.bought} = ${v.total}`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `x + ${v.bought} = ${v.total}`,
      `x − ${v.bought} = ${v.total}`,
      `x × ${v.bought} = ${v.total}`,
      `${v.bought} − x = ${v.total}`,
    ],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `საწყის x წიგნს დაემატა ${vars.bought} და მივიღეთ ${vars.total}. სწორი განტოლებაა: ${answer}.`,
  }),

  // Q05 — მარჯვენა მხარეს ჯამიანი განტოლება (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u08-05', subtopicId: 'u08-unknown-addends', difficulty: 3 }),
    prompt: 'ამოხსენი განტოლება: x + {a} = {c} + {d}. რას უდრის x?',
    variables: {
      a: { kind: 'int', min: 15, max: 40 },
      c: { kind: 'int', min: 25, max: 50 },
      d: { kind: 'int', min: 10, max: 40 },
      x: { kind: 'choice', values: (v: Vars) => [Number(v.c) + Number(v.d) - Number(v.a)] },
    },
    answer: (v: Vars) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const sum = Number(vars.c) + Number(vars.d);
      return `მარჯვენა მხარეა: ${vars.c} + ${vars.d} = ${sum}. განტოლება მიიღებს სახეს: x + ${vars.a} = ${sum}, საიდანაც x = ${sum} − ${vars.a} = ${answer}.`;
    },
  }),

  // Q06 — განტოლების ფესვის შემოწმება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u08-06', subtopicId: 'u08-unknown-addends', difficulty: 3 }),
    prompt: 'ჩამოთვლილთაგან რომელი რიცხვია განტოლების ფესვი: x + {a} = {b}?',
    variables: {
      a: { kind: 'int', min: 24, max: 65 },
      x: { kind: 'int', min: 15, max: 55 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.x) + Number(v.a)] },
    },
    answer: (v: Vars) => `${v.x}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const x = Number(vars.x);
      return [`${x + 5}`, `${x - 3}`, `${x + 10}`];
    },
    explanation: ({ vars, answer }) =>
      `თუ x-ის ნაცვლად ჩავსვამთ ${answer}-ს, მივიღებთ: ${answer} + ${vars.a} = ${vars.b}, რაც ჭეშმარიტი ტოლობაა.`,
  }),

  // =========================================================================
  // U08.2 — განტოლება უცნობი საკლებით და მაკლებით (Minuends & subtrahends)
  // =========================================================================

  // Q07 — უცნობი საკლები (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u08-07', subtopicId: 'u08-unknown-minuends-subtrahends', difficulty: 1 }),
    prompt: 'ამოხსენი განტოლება: x − {a} = {b}. რას უდრის x?',
    variables: {
      a: { kind: 'int', min: 10, max: 50 },
      b: { kind: 'int', min: 15, max: 60 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `უცნობი საკლების საპოვნელად სხვაობას უნდა მივუმატოთ მაკლები: x = ${vars.b} + ${vars.a} = ${answer}.`,
  }),

  // Q08 — უცნობი მაკლები წესით (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u08-08', subtopicId: 'u08-unknown-minuends-subtrahends', difficulty: 1 }),
    prompt: 'რომელი წესით ვიპოვით x-ს განტოლებაში: {a} − x = {b}?',
    variables: {
      b: { kind: 'int', min: 15, max: 50 },
      diff: { kind: 'int', min: 10, max: 40 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.diff)] },
    },
    answer: (v: Vars) => `x = ${v.a} − ${v.b}`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `x = ${v.a} − ${v.b}`,
      `x = ${v.a} + ${v.b}`,
      `x = ${v.b} − ${v.a}`,
      `x = ${v.a} × ${v.b}`,
    ],
    optionCount: 4,
    explanation: ({ answer }) =>
      `უცნობი მაკლების საპოვნელად საკლებს უნდა გამოვაკლოთ სხვაობა: ${answer}.`,
  }),

  // Q09 — უცნობი მაკლების გამოთვლა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u08-09', subtopicId: 'u08-unknown-minuends-subtrahends', difficulty: 2 }),
    prompt: 'ამოხსენი განტოლება: {a} − x = {b}. რას უდრის x?',
    variables: {
      b: { kind: 'int', min: 15, max: 65 },
      x: { kind: 'int', min: 10, max: 45 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.x)] },
    },
    answer: (v: Vars) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `x = ${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q10 — გამოკლების ტექსტური ამოცანის განტოლება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u08-10', subtopicId: 'u08-unknown-minuends-subtrahends', difficulty: 2 }),
    prompt: 'ყუთში იყო {total} კანფეტი. ნინომ აიღო x კანფეტი და დარჩა {rem}. რომელი განტოლება გამოსახავს ამ პირობას?',
    variables: {
      rem: { kind: 'int', min: 12, max: 40 },
      taken: { kind: 'int', min: 8, max: 25 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.rem) + Number(v.taken)] },
    },
    answer: (v: Vars) => `${v.total} − x = ${v.rem}`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `${v.total} − x = ${v.rem}`,
      `x − ${v.total} = ${v.rem}`,
      `${v.total} + x = ${v.rem}`,
      `x + ${v.rem} = ${v.taken}`,
    ],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `საერთო რაოდენობას (${vars.total}) გამოაკლდა აღებული x კანფეტი და დარჩა ${vars.rem}. სწორი განტოლებაა: ${answer}.`,
  }),

  // Q11 — მარჯვენა მხარეს სხვაობით განტოლება (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u08-11', subtopicId: 'u08-unknown-minuends-subtrahends', difficulty: 3 }),
    prompt: 'ამოხსენი განტოლება: x − {a} = {c} − {d}. რას უდრის x?',
    variables: {
      a: { kind: 'int', min: 20, max: 50 },
      d: { kind: 'int', min: 10, max: 30 },
      diff: { kind: 'int', min: 15, max: 45 },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.d) + Number(v.diff)] },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const diff = Number(vars.c) - Number(vars.d);
      return `მარჯვენა მხარეა: ${vars.c} − ${vars.d} = ${diff}. განტოლებაა: x − ${vars.a} = ${diff}, საიდანაც x = ${diff} + ${vars.a} = ${answer}.`;
    },
  }),

  // Q12 — ფესვის შესაბამისი გამოკლების განტოლება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u08-12', subtopicId: 'u08-unknown-minuends-subtrahends', difficulty: 3 }),
    prompt: 'რომელი განტოლების ფესვია x = {k}?',
    variables: {
      k: { kind: 'int', min: 12, max: 40 },
      c: { kind: 'int', min: 15, max: 45 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.k) + Number(v.c)] },
    },
    answer: (v: Vars) => `${v.a} − x = ${v.c}`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `${v.a} − x = ${v.c}`,
      `${v.a} + x = ${v.c}`,
      `x − ${v.c} = ${Number(v.k) + 5}`,
      `${v.c} − x = ${v.a}`,
    ],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.k} = ${vars.c}, ამიტომ x = ${vars.k} არის განტოლების (${answer}) ფესვი.`,
  }),

  // =========================================================================
  // U08.3 — განტოლება უცნობი თანამამრავლით (Unknown factors)
  // =========================================================================

  // Q13 — უცნობი პირველი თანამამრავლი (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u08-13', subtopicId: 'u08-unknown-factors', difficulty: 1 }),
    prompt: 'ამოხსენი განტოლება: x × {a} = {b}. რას უდრის x?',
    variables: {
      a: { kind: 'choice', values: [2, 3, 4, 5, 6, 7, 8, 9] },
      x: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.x) * Number(v.a)] },
    },
    answer: (v: Vars) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `უცნობი თანამამრავლის საპოვნელად ნამრავლი უნდა გავყოთ ცნობილ თანამამრავლზე: x = ${vars.b} ÷ ${vars.a} = ${answer}.`,
  }),

  // Q14 — უცნობი მეორე თანამამრავლი (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u08-14', subtopicId: 'u08-unknown-factors', difficulty: 1 }),
    prompt: 'რომელი მოქმედებით ვიპოვით x-ს განტოლებაში: {a} × x = {b}?',
    variables: {
      a: { kind: 'choice', values: [3, 4, 5, 6, 7, 8] },
      x: { kind: 'int', min: 3, max: 9 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.a) * Number(v.x)] },
    },
    answer: (v: Vars) => `x = ${v.b} ÷ ${v.a}`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `x = ${v.b} ÷ ${v.a}`,
      `x = ${v.b} × ${v.a}`,
      `x = ${v.b} − ${v.a}`,
      `x = ${v.b} + ${v.a}`,
    ],
    optionCount: 4,
    explanation: ({ answer }) =>
      `თანამამრავლის საპოვნელად ნამრავლი იყოფა ცნობილ თანამამრავლზე: ${answer}.`,
  }),

  // Q15 — გამრავლება ათეულებზე (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u08-15', subtopicId: 'u08-unknown-factors', difficulty: 2 }),
    prompt: 'ამოხსენი განტოლება: {a} × x = {b}. რას უდრის x?',
    variables: {
      a: { kind: 'choice', values: [10, 20, 30] },
      x: { kind: 'choice', values: [2, 3, 4, 5, 6, 7, 8, 9] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.a) * Number(v.x)] },
    },
    answer: (v: Vars) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `x = ${vars.b} ÷ ${vars.a} = ${answer}.`,
  }),

  // Q16 — ფასისა და რაოდენობის განტოლება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u08-16', subtopicId: 'u08-unknown-factors', difficulty: 2 }),
    prompt: '{count} ცალი ერთნაირი რვეული სულ {total} ლარი ღირს. თითოეული რვეული ღირს x ლარი. რომელი განტოლებით განისაზღვრება x?',
    variables: {
      count: { kind: 'choice', values: [3, 4, 5, 6, 7] },
      price: { kind: 'choice', values: [2, 3, 4, 5] },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.count) * Number(v.price)] },
    },
    answer: (v: Vars) => `${v.count} × x = ${v.total}`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `${v.count} × x = ${v.total}`,
      `${v.count} + x = ${v.total}`,
      `x ÷ ${v.count} = ${v.total}`,
      `${v.total} × x = ${v.count}`,
    ],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `რვეულების რაოდენობისა (${vars.count}) და ერთი რვეულის ფასის (x) ნამრავლი უდრის საერთო ღირებულებას (${vars.total}). ამიტომ ${answer}.`,
  }),

  // Q17 — მარჯვენა მხარეს ჯამით გამრავლების განტოლება (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u08-17', subtopicId: 'u08-unknown-factors', difficulty: 3 }),
    prompt: 'ამოხსენი განტოლება: {a} × x = {c} + {d}. რას უდრის x?',
    variables: {
      a: { kind: 'choice', values: [3, 4, 5, 6] },
      x: { kind: 'int', min: 3, max: 9 },
      p: { kind: 'choice', values: (v: Vars) => [Number(v.a) * Number(v.x)] },
      c: { kind: 'choice', values: (v: Vars) => [Math.floor(Number(v.p) / 2)] },
      d: { kind: 'choice', values: (v: Vars) => [Number(v.p) - Number(v.c)] },
    },
    answer: (v: Vars) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const sum = Number(vars.c) + Number(vars.d);
      return `მარჯვენა მხარეა: ${vars.c} + ${vars.d} = ${sum}. განტოლებაა: ${vars.a} × x = ${sum}, საიდანაც x = ${sum} ÷ ${vars.a} = ${answer}.`;
    },
  }),

  // Q18 — ფესვის შესაბამისი გამრავლების განტოლება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u08-18', subtopicId: 'u08-unknown-factors', difficulty: 3 }),
    prompt: 'რომელი განტოლების ფესვია x = {k}?',
    variables: {
      k: { kind: 'int', min: 3, max: 9 },
      a: { kind: 'choice', values: [2, 3, 4, 5, 6, 7] },
      prod: { kind: 'choice', values: (v: Vars) => [Number(v.k) * Number(v.a)] },
    },
    answer: (v: Vars) => `${v.a} × x = ${v.prod}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const prod = Number(vars.prod);
      return [
        `${a} × x = ${prod + a}`,
        `${a} + x = ${prod}`,
        `x ÷ ${a} = ${prod}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `${vars.a} × ${vars.k} = ${vars.prod}, ამიტომ x = ${vars.k} არის განტოლების (${answer}) ფესვი.`,
  }),

  // =========================================================================
  // U08.4 — განტოლება უცნობი გასაყოფით და გამყოფით (Dividends & divisors)
  // =========================================================================

  // Q19 — უცნობი გასაყოფი (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u08-19', subtopicId: 'u08-unknown-dividends-divisors', difficulty: 1 }),
    prompt: 'ამოხსენი განტოლება: x ÷ {a} = {b}. რას უდრის x?',
    variables: {
      a: { kind: 'choice', values: [2, 3, 4, 5, 6, 7] },
      b: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `უცნობი გასაყოფის საპოვნელად განაყოფი უნდა გავამრავლოთ გამყოფზე: x = ${vars.b} × ${vars.a} = ${answer}.`,
  }),

  // Q20 — უცნობი გამყოფი წესით (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u08-20', subtopicId: 'u08-unknown-dividends-divisors', difficulty: 1 }),
    prompt: 'რომელი მოქმედებით ვიპოვით x-ს განტოლებაში: {a} ÷ x = {b}?',
    variables: {
      b: { kind: 'choice', values: [2, 3, 4, 5, 6] },
      x: { kind: 'int', min: 2, max: 8 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) * Number(v.x)] },
    },
    answer: (v: Vars) => `x = ${v.a} ÷ ${v.b}`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `x = ${v.a} ÷ ${v.b}`,
      `x = ${v.a} × ${v.b}`,
      `x = ${v.a} − ${v.b}`,
      `x = ${v.a} + ${v.b}`,
    ],
    optionCount: 4,
    explanation: ({ answer }) =>
      `უცნობი გამყოფის მოსაძებნად გასაყოფი იყოფა განაყოფზე: ${answer}.`,
  }),

  // Q21 — უცნობი გამყოფის გამოთვლა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u08-21', subtopicId: 'u08-unknown-dividends-divisors', difficulty: 2 }),
    prompt: 'ამოხსენი განტოლება: {a} ÷ x = {b}. რას უდრის x?',
    variables: {
      x: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'choice', values: [2, 3, 4, 5, 6, 7] },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.x) * Number(v.b)] },
    },
    answer: (v: Vars) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `x = ${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // Q22 — განაწილების ტექსტური ამოცანის განტოლება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u08-22', subtopicId: 'u08-unknown-dividends-divisors', difficulty: 2 }),
    prompt: '{total} კანფეტი თანაბრად გაუნაწილეს x ბავშვს და თითოეულს ერგო {each} კანფეტი. რამდენი ბავშვი იყო?',
    variables: {
      each: { kind: 'choice', values: [2, 3, 4, 5] },
      children: { kind: 'int', min: 3, max: 9 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.each) * Number(v.children)] },
    },
    answer: (v: Vars) => `${v.children} ბავშვი`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const ch = Number(vars.children);
      return [
        `${ch + 1} ბავშვი`,
        `${ch - 1} ბავშვი`,
        `${ch + 2} ბავშვი`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `განტოლებაა ${vars.total} ÷ x = ${vars.each}, საიდანაც x = ${vars.total} ÷ ${vars.each} = ${answer}.`,
  }),

  // Q23 — მარჯვენა მხარეს სხვაობით გაყოფის განტოლება (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u08-23', subtopicId: 'u08-unknown-dividends-divisors', difficulty: 3 }),
    prompt: 'ამოხსენი განტოლება: x ÷ {a} = {c} − {d}. რას უდრის x?',
    variables: {
      a: { kind: 'choice', values: [2, 3, 4, 5] },
      d: { kind: 'int', min: 1, max: 5 },
      diff: { kind: 'int', min: 2, max: 8 },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.d) + Number(v.diff)] },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const diff = Number(vars.c) - Number(vars.d);
      return `მარჯვენა მხარეა: ${vars.c} − ${vars.d} = ${diff}. განტოლებაა: x ÷ ${vars.a} = ${diff}, საიდანაც x = ${diff} × ${vars.a} = ${answer}.`;
    },
  }),

  // Q24 — ფესვის შესაბამისი გაყოფის განტოლება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u08-24', subtopicId: 'u08-unknown-dividends-divisors', difficulty: 3 }),
    prompt: 'რომელი განტოლების ფესვია x = {k}?',
    variables: {
      k: { kind: 'choice', values: [2, 3, 4, 5, 6, 7, 8, 9] },
      d: { kind: 'choice', values: [2, 3, 4, 5, 6] },
      tot: { kind: 'choice', values: (v: Vars) => [Number(v.k) * Number(v.d)] },
    },
    answer: (v: Vars) => `${v.tot} ÷ x = ${v.d}`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `${v.tot} ÷ x = ${v.d}`,
      `x ÷ ${v.d} = ${Number(v.tot) + 2}`,
      `${v.tot} × x = ${v.d}`,
      `x + ${v.d} = ${v.tot}`,
    ],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.tot} ÷ ${vars.k} = ${vars.d}, ამიტომ x = ${vars.k} არის განტოლების (${answer}) ფესვი.`,
  }),
];
