/**
 * Grade 2 — U03: მოქმედებები ერთნიშნა რიცხვებზე (Single-Digit Addition and Subtraction).
 *
 * Full curriculum implementation for Grade 2 Unit 3:
 * 60 question templates (Q01–Q60) across 10 subtopics with complete Level 1, 2, and 3 coverage:
 *
 *   U03.1 `u03-single-digit-add-sub`          (ერთნიშნა რიცხვების შეკრება და გამოკლება, Q01–Q06)    6 templates
 *   U03.2 `u03-doubling-and-halving`          (გაორმაგება და განახევრება, Q07–Q12)                   6 templates
 *   U03.3 `u03-adding-to-20-pictures`         (შეკრება 20-ის ფარგლებში სურათებითა და ცხრილებით, Q13–Q18) 6 templates
 *   U03.4 `u03-subtracting-to-20-pictures`    (გამოკლება 20-ის ფარგლებში სურათებითა და ცხრილებით, Q19–Q24) 6 templates
 *   U03.5 `u03-adding-subtracting-zero`       (ნულის დამატება და გამოკლება, Q25–Q30)                 6 templates
 *   U03.6 `u03-missing-digit`                 (გამოტოვებული რიცხვი ტოლობაში, Q31–Q36)                6 templates
 *   U03.7 `u03-true-or-false`                 (ჭეშმარიტი და მცდარი ტოლობები, Q37–Q42)                6 templates
 *   U03.8 `u03-adding-three-digits`           (რამდენიმე ერთნიშნა რიცხვის შეკრება, Q43–Q48)         6 templates
 *   U03.9 `u03-adding-four-or-more`           (ოთხი ან მეტი ერთნიშნა რიცხვის შეკრება, Q49–Q54)     6 templates
 *   U03.10 `u03-mixed-review`                 (ნაწილი B — შერეული გამეორება, Q55–Q60)               6 templates
 */

import { defineTemplate } from './types';
import type { QuestionTemplate } from './types';

export const G2_U03_SUBTOPICS = [
  'u03-single-digit-add-sub',
  'u03-doubling-and-halving',
  'u03-adding-to-20-pictures',
  'u03-subtracting-to-20-pictures',
  'u03-adding-subtracting-zero',
  'u03-missing-digit',
  'u03-true-or-false',
  'u03-adding-three-digits',
  'u03-adding-four-or-more',
  'u03-mixed-review',
] as const;

export type G2U03SubtopicId = (typeof G2_U03_SUBTOPICS)[number];

const grade = 2 as const;
const topicId = 'g2-ertnishna-moqmedebebi' as const;
const unitId = 'g2-ertnishna-moqmedebebi' as const;

const addr = (spec: { id: string; subtopicId: G2U03SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  id: spec.id,
  grade,
  topicId,
  unitId,
  subtopicId: spec.subtopicId,
  difficulty: spec.difficulty,
});

/** Repeated emoji helper */
export function repeatEmoji(emoji: string, count: number): string {
  if (count <= 0) return '';
  return Array(count).fill(emoji).join(' ');
}

/** Near misses for numeric questions */
export function nearMisses(n: number, count = 3, min = 0): number[] {
  const set = new Set<number>();
  const deltas = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5];
  for (const d of deltas) {
    const cand = n + d;
    if (cand >= min && cand !== n) {
      set.add(cand);
      if (set.size === count) break;
    }
  }
  return Array.from(set);
}

export const G2_U03_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U03.1 — ერთნიშნა რიცხვების შეკრება და გამოკლება (u03-single-digit-add-sub)
  // =========================================================================

  // Q01: დონე 1 | შეკრება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-01', subtopicId: 'u03-single-digit-add-sub', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b} = ?',
    variables: {
      a: { kind: 'int', min: 1, max: 9 },
      b: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a}-ს რომ მივუმატოთ ${vars.b}, მივიღებთ ${answer}-ს.`,
  }),

  // Q02: დონე 1 | გამოკლება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-02', subtopicId: 'u03-single-digit-add-sub', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} − {b} = ?',
    variables: {
      b: { kind: 'int', min: 0, max: 9 },
      diff: { kind: 'int', min: 0, max: 9 },
      a: { kind: 'choice', values: (v) => [Number(v.b) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a}-ს რომ გამოვაკლოთ ${vars.b}, დარჩება ${answer}.`,
  }),

  // Q03: დონე 2 | შეკრება სურათით (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-03', subtopicId: 'u03-single-digit-add-sub', difficulty: 2 }),
    prompt: 'სურათზე არის {a} ვარსკვლავი:\n{starsA}\nდა ემატება კიდევ {b} ვარსკვლავი:\n{starsB}\nრამდენი ვარსკვლავია სულ?',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 1, max: 9 },
      starsA: { kind: 'choice', values: (v) => [repeatEmoji('⭐', Number(v.a))] },
      starsB: { kind: 'choice', values: (v) => [repeatEmoji('⭐', Number(v.b))] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer} ვარსკვლავი.`,
  }),

  // Q04: დონე 2 | გამოკლება სურათით (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-04', subtopicId: 'u03-single-digit-add-sub', difficulty: 2 }),
    prompt: 'კალათაში იყო {a} ვაშლი:\n{apples}\nმათგან {b} ვაშლი აიღეს. რამდენი ვაშლი დარჩა კალათაში?',
    variables: {
      rem: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 1, max: 8 },
      a: { kind: 'choice', values: (v) => [Number(v.rem) + Number(v.b)] },
      apples: { kind: 'choice', values: (v) => [repeatEmoji('🍎', Number(v.rem) + Number(v.b))] },
    },
    answer: (v) => Number(v.rem),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} ვაშლი დარჩა.`,
  }),

  // Q05: დონე 3 | უცნობი მოქმედება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-05', subtopicId: 'u03-single-digit-add-sub', difficulty: 3 }),
    prompt: 'რომელი მოქმედება იძლევა {n}-ს?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '7;4 + 3;5 + 3;9 − 3;2 + 4',
          '8;5 + 3;6 + 3;10 − 3;4 + 5',
          '9;6 + 3;7 + 3;11 − 3;5 + 5',
          '10;7 + 3;8 + 3;12 − 3;6 + 5',
          '6;9 − 3;8 − 3;4 + 3;10 − 3',
          '5;8 − 3;7 − 3;4 + 2;9 − 3',
          '11;7 + 4;6 + 4;12 − 2;8 + 4',
          '12;8 + 4;7 + 4;14 − 3;9 + 4',
          '13;9 + 4;8 + 4;15 − 3;10 + 4',
          '14;8 + 6;9 + 6;16 − 3;7 + 6',
          '15;9 + 6;8 + 6;17 − 3;9 + 5',
          '4;9 − 5;8 − 5;3 + 2;10 − 5',
          '3;8 − 5;9 − 5;2 + 2;7 − 5',
          '16;9 + 7;8 + 7;18 − 3;9 + 6',
          '17;9 + 8;8 + 8;19 − 3;9 + 7',
          '2;7 − 5;8 − 5;1 + 2;6 − 5',
        ],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[0])] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${answer} = ${vars.n}, დანარჩენი გამოსახულებების შედეგი განსხვავებულია.`,
  }),

  // Q06: დონე 3 | მოქმედებების ჯაჭვი (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-06', subtopicId: 'u03-single-digit-add-sub', difficulty: 3 }),
    prompt: 'გამოთვალე მოქმედებების ჯაჭვი: {a} + {b} − {c} = ?',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      b: { kind: 'int', min: 2, max: 9 },
      c: { kind: 'int', min: 1, max: 5 },
    },
    answer: (v) => Number(v.a) + Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `ჯერ შევკრიბოთ: ${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}; შემდეგ გამოვაკლოთ ${vars.c}: ${Number(vars.a) + Number(vars.b)} − ${vars.c} = ${answer}.`,
  }),

  // =========================================================================
  // U03.2 — გაორმაგება და განახევრება (u03-doubling-and-halving)
  // =========================================================================

  // Q07: დონე 1 | რიცხვის გაორმაგება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-07', subtopicId: 'u03-doubling-and-halving', difficulty: 1 }),
    prompt: 'რა არის {n}-ის ორმაგი?',
    variables: {
      n: { kind: 'int', min: 1, max: 10 },
    },
    answer: (v) => Number(v.n) * 2,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n}-ის ორმაგი ნიშნავს ${vars.n} + ${vars.n} = ${answer}.`,
  }),

  // Q08: დონე 1 | რიცხვის განახევრება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-08', subtopicId: 'u03-doubling-and-halving', difficulty: 1 }),
    prompt: 'რა არის {n}-ის ნახევარი?',
    variables: {
      half: { kind: 'int', min: 1, max: 10 },
      n: { kind: 'choice', values: (v) => [Number(v.half) * 2] },
    },
    answer: (v) => Number(v.half),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} გაყოფილი 2-ზე (ნახევარი) არის ${answer}, რადგან ${answer} + ${answer} = ${vars.n}.`,
  }),

  // Q09: დონე 2 | ორმაგი სურათით (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-09', subtopicId: 'u03-doubling-and-halving', difficulty: 2 }),
    prompt: 'ერთ თეფშზე არის {n} მარწყვი:\n{berries}\nმეორე თეფშზე იმდენივე მარწყვია. რამდენი მარწყვია ორსავე თეფშზე ერთად?',
    variables: {
      n: { kind: 'int', min: 2, max: 9 },
      berries: { kind: 'choice', values: (v) => [repeatEmoji('🍓', Number(v.n))] },
    },
    answer: (v) => Number(v.n) * 2,
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `თითო თეფშზე ${vars.n} მარწყვია, სულ: ${vars.n} + ${vars.n} = ${answer} მარწყვი.`,
  }),

  // Q10: დონე 2 | განახევრება თანაბარ ჯგუფებად (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-10', subtopicId: 'u03-doubling-and-halving', difficulty: 2 }),
    prompt: '{n} კუბიკი თანაბრად გაანაწილეს ორ ჯგუფში:\n{cubes}\nრამდენი კუბიკი იქნება თითოეულ ჯგუფში?',
    variables: {
      half: { kind: 'int', min: 2, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.half) * 2] },
      cubes: { kind: 'choice', values: (v) => [repeatEmoji('🟦', Number(v.half) * 2)] },
    },
    answer: (v) => Number(v.half),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} კუბიკის ორ ტოლ ნაწილად გაყოფით თითოეულში იქნება ${answer} კუბიკი.`,
  }),

  // Q11: დონე 3 | ორმაგის პოვნა — შებრუნებული (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-11', subtopicId: 'u03-doubling-and-halving', difficulty: 3 }),
    prompt: 'ჩაფიქრებული რიცხვის ორმაგია {m}. რა არის საწყისი რიცხვი?',
    variables: {
      orig: { kind: 'int', min: 2, max: 10 },
      m: { kind: 'choice', values: (v) => [Number(v.orig) * 2] },
    },
    answer: (v) => Number(v.orig),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `თუ რიცხვის ორმაგია ${vars.m}, თავად რიცხვი მისი ნახევარია: ${vars.m} ÷ 2 = ${answer}.`,
  }),

  // Q12: დონე 3 | ორმაგისა და ნახევრის შედარება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-12', subtopicId: 'u03-doubling-and-halving', difficulty: 3 }),
    prompt: 'რომელია მეტი: {a}-ს ორმაგი (უდრის {valA}-ს) თუ {b}-ის ნახევარი (უდრის {valB}-ს)?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '5;12;10;6;5-ის ორმაგი',
          '3;16;6;8;16-ის ნახევარი',
          '4;10;8;5;4-ის ორმაგი',
          '2;14;4;7;14-ის ნახევარი',
          '6;18;12;9;6-ის ორმაგი',
          '3;14;6;7;14-ის ნახევარი',
          '7;20;14;10;7-ის ორმაგი',
          '4;18;8;9;18-ის ნახევარი',
          '8;16;16;8;8-ის ორმაგი',
          '2;12;4;6;12-ის ნახევარი',
          '5;14;10;7;5-ის ორმაგი',
          '3;12;6;6;ტოლია',
          '6;16;12;8;6-ის ორმაგი',
          '1;10;2;5;10-ის ნახევარი',
          '7;16;14;8;7-ის ორმაგი',
          '2;16;4;8;16-ის ნახევარი',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[1])] },
      valA: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      valB: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[3])] },
      win: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.win),
    format: { kind: 'text' },
    optionCount: 3,
    options: (vars) => [`${vars.a}-ის ორმაგი`, `${vars.b}-ის ნახევარი`, 'ტოლია'],
    explanation: ({ vars, answer }) => `${vars.a}-ის ორმაგია ${vars.valA}, ხოლო ${vars.b}-ის ნახევარია ${vars.valB}. აქედან მეტია: ${answer}.`,
  }),

  // =========================================================================
  // U03.3 — შეკრება 20-ის ფარგლებში სურათებითა და ცხრილებით (u03-adding-to-20-pictures)
  // =========================================================================

  // Q13: დონე 1 | შეკრება სურათებით (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-13', subtopicId: 'u03-adding-to-20-pictures', difficulty: 1 }),
    prompt: 'სურათზე არის {a} ლურჯი და {b} წითელი ბურთი:\n{ballsA}   {ballsB}\nრამდენი ბურთია სულ?',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 2, max: 9 },
      ballsA: { kind: 'choice', values: (v) => [repeatEmoji('🔵', Number(v.a))] },
      ballsB: { kind: 'choice', values: (v) => [repeatEmoji('🔴', Number(v.b))] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer} ბურთი.`,
  }),

  // Q14: დონე 1 | შეკრება 10-მდე (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-14', subtopicId: 'u03-adding-to-20-pictures', difficulty: 1 }),
    prompt: 'გამოთვალე 10-მდე: {a} + {b} = ?',
    variables: {
      a: { kind: 'int', min: 1, max: 7 },
      b: { kind: 'int', min: 1, max: 3 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q15: დონე 2 | შეკრება 20-მდე (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-15', subtopicId: 'u03-adding-to-20-pictures', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} + {b} = ?',
    variables: {
      a: { kind: 'int', min: 6, max: 9 },
      b: { kind: 'int', min: 5, max: 9 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q16: დონე 2 | გამოტოვებული შესაკრები (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-16', subtopicId: 'u03-adding-to-20-pictures', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული შესაკრები: {a} + ___ = {s}',
    variables: {
      a: { kind: 'int', min: 4, max: 12 },
      diff: { kind: 'int', min: 2, max: 8 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `გამოტოვებული შესაკრებია: ${vars.s} − ${vars.a} = ${answer}.`,
  }),

  // Q17: დონე 3 | ცხრილში შეკრება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-17', subtopicId: 'u03-adding-to-20-pictures', difficulty: 3 }),
    prompt: 'შეკრების ცხრილის მიხედვით (სტრიქონი + სვეტი):\n+ | {c1} | {c2}\n--+----+----\n{r1}| ?  | {v12}\n{r2}| {v21} | {v22}\n\nიპოვე კითხვის ნიშნის (?) მნიშვნელობა ({r1} + {c1}):',
    variables: {
      r1: { kind: 'int', min: 3, max: 8 },
      r2: { kind: 'int', min: 4, max: 9 },
      c1: { kind: 'int', min: 2, max: 7 },
      c2: { kind: 'int', min: 3, max: 8 },
      v12: { kind: 'choice', values: (v) => [Number(v.r1) + Number(v.c2)] },
      v21: { kind: 'choice', values: (v) => [Number(v.r2) + Number(v.c1)] },
      v22: { kind: 'choice', values: (v) => [Number(v.r2) + Number(v.c2)] },
    },
    answer: (v) => Number(v.r1) + Number(v.c1),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `სტრიქონის ${vars.r1}-ისა და სვეტის ${vars.c1}-ის გადაკვეთაზე ჯამია: ${vars.r1} + ${vars.c1} = ${answer}.`,
  }),

  // Q18: დონე 3 | ორი პირობის მიხედვით შეკრება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-18', subtopicId: 'u03-adding-to-20-pictures', difficulty: 3 }),
    prompt: 'რომელი ორი რიცხვის ჯამია {s}, თუ პირველი რიცხვი {minA}-ზე მეტია, ხოლო მეორე — {maxB}-ზე ნაკლები?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '15;8;7;9 და 6;8 და 7;7 და 8;10 და 5',
          '14;7;7;9 და 5;7 და 7;6 და 8;10 და 4',
          '13;7;6;8 და 5;7 და 6;6 და 7;9 და 4',
          '12;6;6;8 და 4;6 და 6;5 და 7;9 და 3',
          '16;8;8;10 და 6;8 და 8;7 და 9;9 და 7',
          '11;6;5;8 და 3;6 და 5;5 და 6;7 და 4',
          '15;9;6;11 და 4;9 და 6;8 და 7;10 და 5',
          '17;9;8;11 და 6;9 და 8;8 და 9;10 და 7',
          '14;8;6;10 და 4;8 და 6;7 და 7;9 და 5',
          '13;8;5;10 და 3;8 და 5;7 და 6;9 და 4',
          '16;9;7;11 და 5;9 და 7;8 და 8;10 და 6',
          '12;7;5;9 და 3;7 და 5;6 და 6;8 და 4',
          '15;7;8;8 და 7;6 და 9;5 და 10;7 და 8',
          '18;9;9;11 და 7;9 და 9;8 და 10;10 და 8',
          '13;6;7;7 და 6;5 და 8;4 და 9;6 და 7',
          '17;8;9;9 და 8;7 და 10;6 და 11;8 და 9',
        ],
      },
      s: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[0])] },
      minA: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[1])] },
      maxB: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `მხოლოდ წყვილი „${answer}“ აკმაყოფილებს ორივე პირობას: პირველი რიცხვი მეტია ${vars.minA}-ზე, მეორე ნაკლებია ${vars.maxB}-ზე და მათი ჯამია ${vars.s}.`,
  }),

  // =========================================================================
  // U03.4 — გამოკლება 20-ის ფარგლებში სურათებითა და ცხრილებით (u03-subtracting-to-20-pictures)
  // =========================================================================

  // Q19: დონე 1 | გამოკლება სურათით (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-19', subtopicId: 'u03-subtracting-to-20-pictures', difficulty: 1 }),
    prompt: 'სურათზე სულ იყო {a} ბუშტი:\n{balloons}\nმათგან {b} ბუშტი გაფრინდა. რამდენი ბუშტი დარჩა?',
    variables: {
      rem: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 1, max: 7 },
      a: { kind: 'choice', values: (v) => [Number(v.rem) + Number(v.b)] },
      balloons: { kind: 'choice', values: (v) => [repeatEmoji('🎈', Number(v.rem) + Number(v.b))] },
    },
    answer: (v) => Number(v.rem),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} ბუშტი.`,
  }),

  // Q20: დონე 1 | გამოკლება 10-ის ფარგლებში (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-20', subtopicId: 'u03-subtracting-to-20-pictures', difficulty: 1 }),
    prompt: 'გამოთვალე 10-ის ფარგლებში: {a} − {b} = ?',
    variables: {
      diff: { kind: 'int', min: 1, max: 8 },
      b: { kind: 'int', min: 1, max: 5 },
      a: { kind: 'choice', values: (v) => [Number(v.diff) + Number(v.b)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q21: დონე 2 | გამოკლება 20-ის ფარგლებში (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-21', subtopicId: 'u03-subtracting-to-20-pictures', difficulty: 2 }),
    prompt: 'გამოთვალე 20-ის ფარგლებში: {a} − {b} = ?',
    variables: {
      diff: { kind: 'int', min: 5, max: 11 },
      b: { kind: 'int', min: 4, max: 9 },
      a: { kind: 'choice', values: (v) => [Number(v.diff) + Number(v.b)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q22: დონე 2 | გამოკლების გამოტოვებული რიცხვი (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-22', subtopicId: 'u03-subtracting-to-20-pictures', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული მაკლები: {a} − ___ = {d}',
    variables: {
      d: { kind: 'int', min: 3, max: 12 },
      b: { kind: 'int', min: 2, max: 8 },
      a: { kind: 'choice', values: (v) => [Number(v.d) + Number(v.b)] },
    },
    answer: (v) => Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `მაკლების საპოვნელად საკლებს გამოვაკლოთ სხვაობა: ${vars.a} − ${vars.d} = ${answer}.`,
  }),

  // Q23: დონე 3 | ცხრილში გამოკლება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-23', subtopicId: 'u03-subtracting-to-20-pictures', difficulty: 3 }),
    prompt: 'გამოკლების ცხრილის მიხედვით (სტრიქონის რიცხვს აკლდება სვეტის რიცხვი):\n− | {c1} | {c2}\n--+----+----\n{r1}| ?  | {v12}\n{r2}| {v21} | {v22}\n\nიპოვე კითხვის ნიშნის (?) მნიშვნელობა ({r1} − {c1}):',
    variables: {
      r1: { kind: 'int', min: 11, max: 17 },
      r2: { kind: 'int', min: 12, max: 18 },
      c1: { kind: 'int', min: 3, max: 7 },
      c2: { kind: 'int', min: 4, max: 8 },
      v12: { kind: 'choice', values: (v) => [Number(v.r1) - Number(v.c2)] },
      v21: { kind: 'choice', values: (v) => [Number(v.r2) - Number(v.c1)] },
      v22: { kind: 'choice', values: (v) => [Number(v.r2) - Number(v.c2)] },
    },
    answer: (v) => Number(v.r1) - Number(v.c1),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.r1} − ${vars.c1} = ${answer}.`,
  }),

  // Q24: დონე 3 | შეკრება თუ გამოკლება? (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-24', subtopicId: 'u03-subtracting-to-20-pictures', difficulty: 3 }),
    prompt: 'ყუთში {a} სათამაშო იყო. შემდეგ {b} სათამაშო აიღეს. რომელი გამოსახულება აჩვენებს დარჩენილ რაოდენობას?',
    variables: {
      a: { kind: 'int', min: 8, max: 18 },
      b: { kind: 'int', min: 2, max: 7 },
    },
    answer: (v) => `${v.a} − ${v.b}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.a} + ${vars.b}`,
      `${vars.b} − ${vars.a}`,
      `${vars.a} − 0`,
    ],
    explanation: ({ answer }) => `რადგან სათამაშოები აიღეს (შემცირდა), დარჩენილი რაოდენობა გამოითვლება გამოკლებით: ${answer}.`,
  }),

  // =========================================================================
  // U03.5 — ნულის დამატება და გამოკლება (u03-adding-subtracting-zero)
  // =========================================================================

  // Q25: დონე 1 | ნულის დამატება (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-25', subtopicId: 'u03-adding-subtracting-zero', difficulty: 1 }),
    prompt: 'შეავსე: {n} + 0 = ___',
    variables: {
      n: { kind: 'int', min: 1, max: 20 },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `ნულის მიმატებით რიცხვი არ იცვლება: ${vars.n} + 0 = ${answer}.`,
  }),

  // Q26: დონე 1 | ნულის გამოკლება (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-26', subtopicId: 'u03-adding-subtracting-zero', difficulty: 1 }),
    prompt: 'შეავსე: {n} − 0 = ___',
    variables: {
      n: { kind: 'int', min: 1, max: 20 },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `ნულის გამოკლებით რიცხვი არ იცვლება: ${vars.n} − 0 = ${answer}.`,
  }),

  // Q27: დონე 2 | რიცხვის თავისგან გამოკლება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-27', subtopicId: 'u03-adding-subtracting-zero', difficulty: 2 }),
    prompt: 'გამოთვალე: {n} − {n} = ?',
    variables: {
      n: { kind: 'int', min: 2, max: 20 },
    },
    answer: () => 0,
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [1, Number(vars.n), Number(vars.n) - 1],
    explanation: ({ vars }) => `ნებისმიერ რიცხვს რომ თავისი თავი გამოვაკლოთ, მივიღებთ 0-ს: ${vars.n} − ${vars.n} = 0.`,
  }),

  // Q28: დონე 2 | ნულის მქონე ტოლობის არჩევა (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-28', subtopicId: 'u03-adding-subtracting-zero', difficulty: 2 }),
    prompt: '{intro} რომელი ტოლობაა სწორი?',
    variables: {
      intro: {
        kind: 'choice',
        values: ['მოცემულთაგან', 'ჩამოთვლილთაგან', 'ქვემოთ მოცემულთაგან', 'ვარიანტებიდან'],
      },
      n: { kind: 'int', min: 3, max: 18 },
    },
    answer: (v) => `${v.n} + 0 = ${v.n}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.n} + 0 = 0`,
      `${vars.n} − 0 = 0`,
      `${vars.n} − ${vars.n} = ${vars.n}`,
    ],
    explanation: ({ vars }) => `სწორია ${vars.n} + 0 = ${vars.n}, რადგან ნულის დამატება რიცხვს არ ცვლის.`,
  }),

  // Q29: დონე 3 | უცნობი რიცხვი ნულთან (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-29', subtopicId: 'u03-adding-subtracting-zero', difficulty: 3 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: ___ + 0 = {n}',
    variables: {
      n: { kind: 'int', min: 2, max: 25 },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ answer }) => `რადგან ნულის მიმატებით რიცხვი არ იცვლება, გამოტოვებული რიცხვია ${answer}.`,
  }),

  // Q30: დონე 3 | ნულის მოქმედებების ჯაჭვი (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-30', subtopicId: 'u03-adding-subtracting-zero', difficulty: 3 }),
    prompt: 'გამოთვალე: {n} + 0 − 0 = ___',
    variables: {
      n: { kind: 'int', min: 2, max: 25 },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `ნულის მიმატებითა და გამოკლებით რიცხვი უცვლელი რჩება: ${vars.n} + 0 − 0 = ${answer}.`,
  }),

  // =========================================================================
  // U03.6 — გამოტოვებული რიცხვი ტოლობაში (u03-missing-digit)
  // =========================================================================

  // Q31: დონე 1 | გამოტოვებული შესაკრები (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-31', subtopicId: 'u03-missing-digit', difficulty: 1 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: {a} + ___ = {s}',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      x: { kind: 'int', min: 1, max: 9 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.x)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `უცნობი შესაკრები = ${vars.s} − ${vars.a} = ${answer}.`,
  }),

  // Q32: დონე 1 | უცნობი რიცხვი შეკრების დასაწყისში (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-32', subtopicId: 'u03-missing-digit', difficulty: 1 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: ___ + {b} = {s}',
    variables: {
      x: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 2, max: 9 },
      s: { kind: 'choice', values: (v) => [Number(v.x) + Number(v.b)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `პირველი შესაკრები = ${vars.s} − ${vars.b} = ${answer}.`,
  }),

  // Q33: დონე 2 | უცნობი გამოკლებული რიცხვი (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-33', subtopicId: 'u03-missing-digit', difficulty: 2 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: {a} − ___ = {d}',
    variables: {
      d: { kind: 'int', min: 3, max: 11 },
      x: { kind: 'int', min: 2, max: 8 },
      a: { kind: 'choice', values: (v) => [Number(v.d) + Number(v.x)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `მაკლები = ${vars.a} − ${vars.d} = ${answer}.`,
  }),

  // Q34: დონე 2 | უცნობი საწყისი რიცხვი (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-34', subtopicId: 'u03-missing-digit', difficulty: 2 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: ___ − {b} = {d}',
    variables: {
      d: { kind: 'int', min: 3, max: 11 },
      b: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v) => Number(v.d) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `საკლები = ${vars.d} + ${vars.b} = ${answer}.`,
  }),

  // Q35: დონე 3 | გამოტოვებული რიცხვი სურათში (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-35', subtopicId: 'u03-missing-digit', difficulty: 3 }),
    prompt: 'სურათზე სულ {s} ფიგურაა:\n{shapes}\nმათგან {a} წითელია, ხოლო დანარჩენი — ლურჯი. რამდენი ლურჯი ფიგურაა?',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      diff: { kind: 'int', min: 3, max: 8 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.diff)] },
      shapes: {
        kind: 'choice',
        values: (v) => [repeatEmoji('🔴', Number(v.a)) + '   ' + repeatEmoji('🔵', Number(v.diff))],
      },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `ლურჯი ფიგურების რაოდენობაა: ${vars.s} − ${vars.a} = ${answer}.`,
  }),

  // Q36: დონე 3 | ორი მოქმედების ტოლობა (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-36', subtopicId: 'u03-missing-digit', difficulty: 3 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: {a} + ___ = {s} − {b}',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      x: { kind: 'int', min: 2, max: 7 },
      b: { kind: 'int', min: 1, max: 5 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.x) + Number(v.b)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const rhs = Number(vars.s) - Number(vars.b);
      return `მარჯვენა მხარე: ${vars.s} − ${vars.b} = ${rhs}; შესაბამისად, გამოტოვებული რიცხვია: ${rhs} − ${vars.a} = ${answer}.`;
    },
  }),

  // =========================================================================
  // U03.7 — ჭეშმარიტი და მცდარი ტოლობები (u03-true-or-false)
  // =========================================================================

  // Q37: დონე 1 | მარტივი ჭეშმარიტი ტოლობა (ჭეშმარიტი/მცდარი)
  defineTemplate({
    ...addr({ id: 'g2-u03-37', subtopicId: 'u03-true-or-false', difficulty: 1 }),
    prompt: 'სწორია თუ არა ტოლობა: {a} + {b} = {sum}?',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 2, max: 9 },
      sum: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b)] },
    },
    optionCount: 2,
    answer: () => 'ჭეშმარიტი',
    format: { kind: 'text' },
    distractors: () => ['მცდარი'],
    explanation: ({ vars }) => `${vars.a} + ${vars.b} მართლაც უდრის ${vars.sum}-ს, ამიტომ ტოლობა ჭეშმარიტია.`,
  }),

  // Q38: დონე 1 | მცდარი ტოლობა გამოკლებით (ჭეშმარიტი/მცდარი)
  defineTemplate({
    ...addr({ id: 'g2-u03-38', subtopicId: 'u03-true-or-false', difficulty: 1 }),
    prompt: 'სწორია თუ არა ტოლობა: {a} − {b} = {wrongDiff}?',
    variables: {
      b: { kind: 'int', min: 2, max: 8 },
      realDiff: { kind: 'int', min: 2, max: 8 },
      a: { kind: 'choice', values: (v) => [Number(v.realDiff) + Number(v.b)] },
      wrongDiff: { kind: 'choice', values: (v) => [Number(v.realDiff) + 1] },
    },
    optionCount: 2,
    answer: () => 'მცდარი',
    format: { kind: 'text' },
    distractors: () => ['ჭეშმარიტი'],
    explanation: ({ vars }) => `${vars.a} − ${vars.b} = ${vars.realDiff}, და არა ${vars.wrongDiff}, ამიტომ ტოლობა მცდარია.`,
  }),

  // Q39: დონე 2 | ტოლობის შემოწმება (ჭეშმარიტი/მცდარი)
  defineTemplate({
    ...addr({ id: 'g2-u03-39', subtopicId: 'u03-true-or-false', difficulty: 2 }),
    prompt: 'სწორია თუ არა ტოლობა: {a} + {b} = {c}?',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      b: { kind: 'int', min: 3, max: 9 },
      delta: { kind: 'choice', values: [0, 1] },
      c: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b) + Number(v.delta)] },
    },
    optionCount: 2,
    answer: (v) => (Number(v.delta) === 0 ? 'ჭეშმარიტი' : 'მცდარი'),
    format: { kind: 'text' },
    distractors: ({ answer }) => (answer === 'ჭეშმარიტი' ? ['მცდარი'] : ['ჭეშმარიტი']),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, ამიტომ ტოლობა ${answer}ა.`,
  }),

  // Q40: დონე 2 | ორი გამოსახულების შედარება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-40', subtopicId: 'u03-true-or-false', difficulty: 2 }),
    prompt: 'სწორია თუ არა ტოლობა: {a} + {b} = {c} + {d}?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '6;4;7;3;ჭეშმარიტი;10;10',
          '5;5;6;4;ჭეშმარიტი;10;10',
          '7;5;8;4;ჭეშმარიტი;12;12',
          '8;3;7;4;ჭეშმარიტი;11;11',
          '9;4;8;5;ჭეშმარიტი;13;13',
          '6;5;7;3;მცდარი;11;10',
          '8;4;7;4;მცდარი;12;11',
          '9;3;8;5;მცდარი;12;13',
          '7;6;9;5;მცდარი;13;14',
          '4;8;6;7;მცდარი;12;13',
          '9;6;8;7;ჭეშმარიტი;15;15',
          '8;8;9;7;ჭეშმარიტი;16;16',
          '7;7;8;6;ჭეშმარიტი;14;14',
          '5;8;6;8;მცდარი;13;14',
          '9;5;7;6;მცდარი;14;13',
          '6;7;8;5;ჭეშმარიტი;13;13',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[3])] },
      ans: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      sumA: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[5])] },
      sumB: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[6])] },
    },
    optionCount: 2,
    answer: (v) => String(v.ans),
    format: { kind: 'text' },
    distractors: ({ answer }) => (answer === 'ჭეშმარიტი' ? ['მცდარი'] : ['ჭეშმარიტი']),
    explanation: ({ vars, answer }) => `მარცხენა მხარე: ${vars.a} + ${vars.b} = ${vars.sumA}; მარჯვენა მხარე: ${vars.c} + ${vars.d} = ${vars.sumB}. შესაბამისად, ტოლობა ${answer}ა.`,
  }),

  // Q41: დონე 3 | ტოლობის გასწორება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-41', subtopicId: 'u03-true-or-false', difficulty: 3 }),
    prompt: 'რომელი რიცხვი უნდა ჩაისვას, რომ ტოლობა სწორი გახდეს: {a} + ___ = {s}?',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      diff: { kind: 'int', min: 2, max: 9 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${answer} = ${vars.s}.`,
  }),

  // Q42: დონე 3 | შეცდომის პოვნა (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-42', subtopicId: 'u03-true-or-false', difficulty: 3 }),
    prompt: 'მოსწავლემ დაწერა: {a} + {b} = {wrongSum}. რა უნდა იყოს სწორი პასუხი?',
    variables: {
      a: { kind: 'int', min: 4, max: 9 },
      b: { kind: 'int', min: 4, max: 9 },
      delta: { kind: 'choice', values: [-2, -1, 1, 2] },
      wrongSum: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b) + Number(v.delta)] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}. მოსწავლის მიერ დაწერილი ${vars.wrongSum} არასწორი იყო.`,
  }),

  // =========================================================================
  // U03.8 — რამდენიმე ერთნიშნა რიცხვის შეკრება (u03-adding-three-digits)
  // =========================================================================

  // Q43: დონე 1 | სამი რიცხვის შეკრება (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-43', subtopicId: 'u03-adding-three-digits', difficulty: 1 }),
    prompt: 'გამოთვალე სამი რიცხვის ჯამი: {a} + {b} + {c} = ?',
    variables: {
      a: { kind: 'int', min: 1, max: 6 },
      b: { kind: 'int', min: 1, max: 6 },
      c: { kind: 'int', min: 1, max: 6 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // Q44: დონე 1 | სამი რიცხვის შეკრება სურათით (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-44', subtopicId: 'u03-adding-three-digits', difficulty: 1 }),
    prompt: 'სურათზე არის {a} წითელი, {b} ლურჯი და {c} მწვანე ბურთი:\n{visual}\nრამდენი ბურთია სულ?',
    variables: {
      a: { kind: 'int', min: 1, max: 5 },
      b: { kind: 'int', min: 1, max: 5 },
      c: { kind: 'int', min: 1, max: 5 },
      visual: {
        kind: 'choice',
        values: (v) => [
          repeatEmoji('🔴', Number(v.a)) + '  ' + repeatEmoji('🔵', Number(v.b)) + '  ' + repeatEmoji('🟢', Number(v.c)),
        ],
      },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} = ${answer} ბურთი.`,
  }),

  // Q45: დონე 2 | ოთხი რიცხვის შეკრება (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-45', subtopicId: 'u03-adding-three-digits', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} + {b} + {c} + {d} = ?',
    variables: {
      a: { kind: 'int', min: 1, max: 6 },
      b: { kind: 'int', min: 1, max: 6 },
      c: { kind: 'int', min: 1, max: 6 },
      d: { kind: 'int', min: 1, max: 6 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} = ${answer}.`,
  }),

  // Q46: დონე 2 | ჯამი 10-მდე (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-46', subtopicId: 'u03-adding-three-digits', difficulty: 2 }),
    prompt: '{intro} რომელი სამი რიცხვის ჯამია 10?',
    variables: {
      intro: {
        kind: 'choice',
        values: ['მოცემულთაგან', 'ჩამოთვლილთაგან', 'ქვემოთ მოცემულთაგან', 'ვარიანტებიდან'],
      },
      pack: {
        kind: 'choice',
        values: [
          '2, 3 და 5;2, 4 და 5;1, 3 და 5;3, 3 და 5',
          '1, 4 და 5;1, 5 და 5;2, 4 და 5;1, 3 და 5',
          '2, 2 და 6;2, 3 და 6;1, 2 და 6;3, 3 და 6',
          '1, 2 და 7;1, 3 და 7;2, 2 და 7;2, 3 და 7',
          '3, 3 და 4;3, 4 და 4;2, 3 და 4;3, 3 და 5',
          '1, 1 და 8;1, 2 და 8;2, 2 და 8;1, 1 და 7',
          '4, 4 და 2;4, 4 და 3;3, 4 და 2;4, 5 და 2',
          '1, 3 და 6;1, 4 და 6;2, 3 და 6;1, 2 და 6',
          '2, 4 და 4;2, 5 და 4;3, 4 და 4;2, 3 და 4',
          '1, 6 და 3;2, 6 და 3;1, 5 და 3;1, 7 და 3',
          '5, 3 და 2;5, 4 და 2;4, 3 და 2;5, 2 და 2',
          '2, 1 და 7;2, 2 და 7;3, 1 და 7;1, 1 და 7',
          '3, 4 და 3;4, 4 და 3;2, 4 და 3;3, 5 და 3',
          '4, 1 და 5;4, 2 და 5;3, 1 და 5;4, 1 და 6',
          '6, 2 და 2;6, 3 და 2;5, 2 და 2;7, 2 და 2',
          '7, 2 და 1;7, 3 და 1;6, 2 და 1;7, 2 და 2',
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
    explanation: ({ answer }) => `${answer} შეკრებით გვაძლევს ზუსტად 10-ს.`,
  }),

  // Q47: დონე 3 | მოხერხებული დაჯგუფება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-47', subtopicId: 'u03-adding-three-digits', difficulty: 3 }),
    prompt: 'რომელი ორი რიცხვის შეკრებაა მოსახერხებელი ჯერ, რათა მარტივად გამოთვალო {a} + {b} + {c}?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '7;5;3;7 და 3;7 + 3 = 10',
          '8;4;2;8 და 2;8 + 2 = 10',
          '6;9;4;6 და 4;6 + 4 = 10',
          '9;3;1;9 და 1;9 + 1 = 10',
          '5;8;5;5 და 5;5 + 5 = 10',
          '2;7;8;2 და 8;2 + 8 = 10',
          '3;6;7;3 და 7;3 + 7 = 10',
          '4;9;6;4 და 6;4 + 6 = 10',
          '1;8;9;1 და 9;1 + 9 = 10',
          '7;2;3;7 და 3;7 + 3 = 10',
          '8;6;2;8 და 2;8 + 2 = 10',
          '6;5;4;6 და 4;6 + 4 = 10',
          '9;7;1;9 და 1;9 + 1 = 10',
          '3;8;7;3 და 7;3 + 7 = 10',
          '4;7;6;4 და 6;4 + 6 = 10',
          '2;5;8;2 და 8;2 + 8 = 10',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      best: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      why: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.best),
    format: { kind: 'text' },
    optionCount: 3,
    options: (vars) => [`${vars.a} და ${vars.b}`, `${vars.b} და ${vars.c}`, `${vars.a} და ${vars.c}`],
    explanation: ({ vars, answer }) => `მოსახერხებელია ${answer}-ის შეკრება, რადგან ${vars.why}, ხოლო 10-სთვის მესამე რიცხვის მიმატება უმარტივესია.`,
  }),

  // Q48: დონე 3 | გამოტოვებული შესაკრები მრავალწევრიან ჯამში (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-48', subtopicId: 'u03-adding-three-digits', difficulty: 3 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {a} + {b} + ___ = {s}',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      b: { kind: 'int', min: 2, max: 6 },
      diff: { kind: 'int', min: 1, max: 8 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}; გამოტოვებული რიცხვია: ${vars.s} − ${Number(vars.a) + Number(vars.b)} = ${answer}.`,
  }),

  // =========================================================================
  // U03.9 — ოთხი ან მეტი ერთნიშნა რიცხვის შეკრება (u03-adding-four-or-more)
  // =========================================================================

  // Q49: დონე 1 | ოთხი შესაკრების შეკრება (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-49', subtopicId: 'u03-adding-four-or-more', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b} + {c} + {d} = ?',
    variables: {
      a: { kind: 'int', min: 1, max: 5 },
      b: { kind: 'int', min: 1, max: 5 },
      c: { kind: 'int', min: 1, max: 5 },
      d: { kind: 'int', min: 1, max: 5 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} = ${answer}.`,
  }),

  // Q50: დონე 1 | ხუთი შესაკრების შეკრება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-50', subtopicId: 'u03-adding-four-or-more', difficulty: 1 }),
    prompt: 'გამოთვალე ხუთი რიცხვის ჯამი: {a} + {b} + {c} + {d} + {e} = ?',
    variables: {
      a: { kind: 'int', min: 1, max: 6 },
      b: { kind: 'int', min: 1, max: 6 },
      c: { kind: 'int', min: 1, max: 6 },
      d: { kind: 'int', min: 1, max: 6 },
      e: { kind: 'int', min: 1, max: 6 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d) + Number(v.e),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} + ${vars.e} = ${answer}.`,
  }),

  // Q51: დონე 2 | შეკრება სურათების ჯგუფებით (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-51', subtopicId: 'u03-adding-four-or-more', difficulty: 2 }),
    prompt: 'ხუთ ჯგუფში არის შესაბამისად {a}, {b}, {c}, {d} და {e} ვარსკვლავი:\n{visual}\nრამდენი ვარსკვლავია სულ?',
    variables: {
      a: { kind: 'int', min: 1, max: 4 },
      b: { kind: 'int', min: 1, max: 4 },
      c: { kind: 'int', min: 1, max: 4 },
      d: { kind: 'int', min: 1, max: 4 },
      e: { kind: 'int', min: 1, max: 4 },
      visual: {
        kind: 'choice',
        values: (v) => [
          `[${repeatEmoji('⭐', Number(v.a))}] [${repeatEmoji('⭐', Number(v.b))}] [${repeatEmoji('⭐', Number(v.c))}] [${repeatEmoji('⭐', Number(v.d))}] [${repeatEmoji('⭐', Number(v.e))}]`,
        ],
      },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d) + Number(v.e),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} + ${vars.e} = ${answer} ვარსკვლავი.`,
  }),

  // Q52: დონე 2 | ჯამის შემოწმება (ჭეშმარიტი/მცდარი)
  defineTemplate({
    ...addr({ id: 'g2-u03-52', subtopicId: 'u03-adding-four-or-more', difficulty: 2 }),
    prompt: 'სწორია თუ არა ტოლობა: {a} + {b} + {c} + {d} = {s}?',
    variables: {
      a: { kind: 'int', min: 2, max: 5 },
      b: { kind: 'int', min: 2, max: 5 },
      c: { kind: 'int', min: 2, max: 5 },
      d: { kind: 'int', min: 2, max: 5 },
      delta: { kind: 'choice', values: [0, 1] },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d) + Number(v.delta)] },
    },
    optionCount: 2,
    answer: (v) => (Number(v.delta) === 0 ? 'ჭეშმარიტი' : 'მცდარი'),
    format: { kind: 'text' },
    distractors: ({ answer }) => (answer === 'ჭეშმარიტი' ? ['მცდარი'] : ['ჭეშმარიტი']),
    explanation: ({ vars, answer }) => {
      const real = Number(vars.a) + Number(vars.b) + Number(vars.c) + Number(vars.d);
      return `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} = ${real}, ამიტომ ტოლობა ${answer}ა.`;
    },
  }),

  // Q53: დონე 3 | გამოტოვებული შესაკრები (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-53', subtopicId: 'u03-adding-four-or-more', difficulty: 3 }),
    prompt: 'შეავსე გამოტოვებული შესაკრები: {a} + {b} + {c} + ___ = {s}',
    variables: {
      a: { kind: 'int', min: 2, max: 5 },
      b: { kind: 'int', min: 2, max: 5 },
      c: { kind: 'int', min: 2, max: 5 },
      diff: { kind: 'int', min: 1, max: 7 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b) + Number(v.c) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const partial = Number(vars.a) + Number(vars.b) + Number(vars.c);
      return `${vars.a} + ${vars.b} + ${vars.c} = ${partial}; გამოტოვებული რიცხვია: ${vars.s} − ${partial} = ${answer}.`;
    },
  }),

  // Q54: დონე 3 | ორი ჯამის შედარება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-54', subtopicId: 'u03-adding-four-or-more', difficulty: 3 }),
    prompt: 'რომელი ჯამია მეტი: {sumA_label} თუ {sumB_label}?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '4 + 5 + 3;3 + 4 + 6;12;13;3 + 4 + 6',
          '6 + 2 + 5;5 + 3 + 4;13;12;6 + 2 + 5',
          '5 + 4 + 4;6 + 3 + 5;13;14;6 + 3 + 5',
          '7 + 3 + 4;6 + 4 + 3;14;13;7 + 3 + 4',
          '8 + 2 + 5;7 + 4 + 5;15;16;7 + 4 + 5',
          '9 + 2 + 4;8 + 3 + 3;15;14;9 + 2 + 4',
          '6 + 5 + 4;7 + 5 + 4;15;16;7 + 5 + 4',
          '8 + 3 + 6;7 + 4 + 5;17;16;8 + 3 + 6',
          '3 + 6 + 5;4 + 5 + 6;14;15;4 + 5 + 6',
          '7 + 2 + 6;6 + 3 + 5;15;14;7 + 2 + 6',
          '5 + 5 + 4;6 + 4 + 5;14;15;6 + 4 + 5',
          '8 + 4 + 3;7 + 3 + 4;15;14;8 + 4 + 3',
          '4 + 6 + 7;5 + 5 + 8;17;18;5 + 5 + 8',
          '9 + 3 + 5;8 + 4 + 4;17;16;9 + 3 + 5',
          '2 + 7 + 4;3 + 6 + 5;13;14;3 + 6 + 5',
          '8 + 5 + 2;7 + 4 + 3;15;14;8 + 5 + 2',
        ],
      },
      sumA_label: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      sumB_label: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      sumA: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      sumB: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[3])] },
      greater: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.greater),
    format: { kind: 'text' },
    optionCount: 3,
    options: (vars) => [String(vars.sumA_label), String(vars.sumB_label), 'ტოლია'],
    explanation: ({ vars, answer }) => `${vars.sumA_label} = ${vars.sumA}, ხოლო ${vars.sumB_label} = ${vars.sumB}. აქედან მეტია: ${answer}.`,
  }),

  // =========================================================================
  // ნაწილი B — შერეული გამეორება (u03-mixed-review)
  // =========================================================================

  // Q55: დონე 1 | შეკრება და ნული (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-55', subtopicId: 'u03-mixed-review', difficulty: 1 }),
    prompt: 'გამოთვალე: {n} + 0 = ?',
    variables: {
      n: { kind: 'int', min: 2, max: 18 },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `ნულის მიმატებით რიცხვი უცვლელია: ${vars.n} + 0 = ${answer}.`,
  }),

  // Q56: დონე 1 | განახევრება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-56', subtopicId: 'u03-mixed-review', difficulty: 1 }),
    prompt: 'რა არის {n}-ის ნახევარი?',
    variables: {
      half: { kind: 'int', min: 2, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.half) * 2] },
    },
    answer: (v) => Number(v.half),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n}-ის ნახევარი არის ${answer}, რადგან ${answer} + ${answer} = ${vars.n}.`,
  }),

  // Q57: დონე 2 | უცნობი შესაკრები (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-57', subtopicId: 'u03-mixed-review', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: ___ + {b} = {s}',
    variables: {
      b: { kind: 'int', min: 3, max: 9 },
      diff: { kind: 'int', min: 3, max: 9 },
      s: { kind: 'choice', values: (v) => [Number(v.b) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `პირველი შესაკრებია: ${vars.s} − ${vars.b} = ${answer}.`,
  }),

  // Q58: დონე 2 | სურათით გამოკლება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-58', subtopicId: 'u03-mixed-review', difficulty: 2 }),
    prompt: 'სურათზე {a} ბურთია:\n{balls}\nაქედან {b} ბურთი მოაშორეს. რამდენი ბურთი დარჩა?',
    variables: {
      rem: { kind: 'int', min: 4, max: 10 },
      b: { kind: 'int', min: 2, max: 7 },
      a: { kind: 'choice', values: (v) => [Number(v.rem) + Number(v.b)] },
      balls: { kind: 'choice', values: (v) => [repeatEmoji('⚽', Number(v.rem) + Number(v.b))] },
    },
    answer: (v) => Number(v.rem),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} ბურთი.`,
  }),

  // Q59: დონე 3 | რამდენიმე რიცხვის შეკრება (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u03-59', subtopicId: 'u03-mixed-review', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} + {b} + {c} + {d} + {e} = ?',
    variables: {
      a: { kind: 'int', min: 1, max: 6 },
      b: { kind: 'int', min: 1, max: 6 },
      c: { kind: 'int', min: 1, max: 6 },
      d: { kind: 'int', min: 1, max: 6 },
      e: { kind: 'int', min: 1, max: 6 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d) + Number(v.e),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} + ${vars.e} = ${answer}.`,
  }),

  // Q60: დონე 3 | შერეული მოქმედებები (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u03-60', subtopicId: 'u03-mixed-review', difficulty: 3 }),
    prompt: 'გამოთვალე: ({a} + {b}) − {c} + {d} = ?',
    variables: {
      a: { kind: 'int', min: 3, max: 8 },
      b: { kind: 'int', min: 3, max: 8 },
      c: { kind: 'int', min: 1, max: 4 },
      d: { kind: 'int', min: 1, max: 5 },
    },
    answer: (v) => Number(v.a) + Number(v.b) - Number(v.c) + Number(v.d),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const step1 = Number(vars.a) + Number(vars.b);
      const step2 = step1 - Number(vars.c);
      return `პირველ რიგში ფრჩხილები: ${vars.a} + ${vars.b} = ${step1}; შემდეგ გამოკლება: ${step1} − ${vars.c} = ${step2}; ბოლოს შეკრება: ${step2} + ${vars.d} = ${answer}.`;
    },
  }),
];
