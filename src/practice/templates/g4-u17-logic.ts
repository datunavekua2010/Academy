import { defineTemplate, type QuestionTemplate } from './types';

export function nearMisses(answer: number, count = 3, min = 0, step = 1): number[] {
  const result = new Set<number>();
  const deltas = [step, -step, 2 * step, -2 * step, 3 * step, -3 * step, 5, -5, 10, -10];
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
    fallback++;
  }
  return Array.from(result).slice(0, count);
}

export const G4_U17_SUBTOPICS = [
  'u17-thought-numbers',
  'u17-minimum-quantity',
  'u17-two-numbers-sum-difference',
  'u17-two-numbers-product-quotient',
  'u17-shape-puzzles',
  'u17-age-problems',
  'u17-time-quantity-problems',
  'u17-finding-differences',
  'u17-segment-problems',
  'u17-scale',
  'u17-graphs',
  'u17-number-ordering',
  'u17-condition-matching',
  'u17-elimination',
  'u17-digit-finding',
] as const;

export type G4U17SubtopicId = (typeof G4_U17_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G4U17SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 4 as const,
  topicId: 'g4-logika' as const,
  unitId: 'g4-logika' as const,
  ...options,
});

export const G4_U17_TEMPLATES: QuestionTemplate[] = [
  // g4-u17-01 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-01', subtopicId: 'u17-thought-numbers', difficulty: 1 }),
    prompt: 'ჩაფიქრებულ რიცხვს დაუმატეს {a} და მიიღეს {t}. რა რიცხვი ჩაიფიქრეს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|23|15", "12|27|15", "15|40|25", "9|36|27", "17|50|33", "6|19|13", "23|45|22", "14|38|24", "11|42|31", "7|25|18", "19|55|36", "13|44|31", "16|60|44", "5|31|26", "21|63|42", "25|70|45", "18|47|29", "10|52|42"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.t} − ${vars.a} = ${answer}.`,
  }),
  // g4-u17-02 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-02', subtopicId: 'u17-thought-numbers', difficulty: 1 }),
    prompt: 'რიცხვს გამოაკლეს {a} და მიიღეს {t}. იპოვე საწყისი რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["15|27|42", "9|34|43", "12|45|57", "20|38|58", "7|53|60", "18|26|44", "25|40|65", "11|49|60", "14|31|45", "8|62|70", "16|44|60", "23|37|60", "10|58|68", "13|29|42", "21|55|76", "6|47|53", "24|36|60", "17|68|85"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.t} + ${vars.a} = ${answer}.`,
  }),
  // g4-u17-03 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-03', subtopicId: 'u17-thought-numbers', difficulty: 2 }),
    prompt: 'ჩაფიქრებული რიცხვი გაამრავლეს {k}-ზე და მიიღეს {t}. რა რიცხვი იყო ჩაფიქრებული?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|36|9", "3|27|9", "5|45|9", "6|42|7", "7|56|8", "8|64|8", "9|63|7", "2|38|19", "4|48|12", "5|60|12", "6|72|12", "3|39|13", "7|84|12", "8|96|12", "9|81|9", "2|46|23", "4|52|13", "5|65|13"],
      },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.t} ÷ ${vars.k} = ${answer}.`,
  }),
  // g4-u17-04 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-04', subtopicId: 'u17-thought-numbers', difficulty: 2 }),
    prompt: 'რიცხვი {k}-ზე გაყვეს და მიიღეს {q}. იპოვე საწყისი რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|9|45", "4|12|48", "6|8|48", "3|14|42", "7|9|63", "8|6|48", "9|7|63", "2|25|50", "5|15|75", "4|18|72", "6|11|66", "3|21|63", "7|12|84", "8|9|72", "9|8|72", "2|32|64", "5|20|100", "4|24|96"],
      },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      q: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.q} × ${vars.k} = ${answer}.`,
  }),
  // g4-u17-05 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-05', subtopicId: 'u17-thought-numbers', difficulty: 3 }),
    prompt: 'ჩაფიქრებულ რიცხვს დაუმატეს {a}, შემდეგ გაამრავლეს 2-ზე და მიიღეს {t}. რა რიცხვი ჩაიფიქრეს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|2|40|8", "5|2|30|10", "8|2|36|10", "15|2|60|15", "7|2|26|6", "9|2|42|12", "11|2|54|16", "4|2|28|10", "13|2|46|10", "6|2|32|10", "14|2|58|15", "3|2|24|9", "17|2|66|16", "10|2|44|12", "18|2|70|17", "8|2|50|17", "12|2|62|19", "5|2|36|13"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[3]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.t} ÷ 2 = ${Number(vars.t) / 2}; ${Number(vars.t) / 2} − ${vars.a} = ${answer}.`,
  }),
  // g4-u17-06 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-06', subtopicId: 'u17-thought-numbers', difficulty: 3 }),
    prompt: 'რიცხვს გამოაკლეს {a}, შემდეგ მიღებული შედეგი გაამრავლეს 3-ზე და მიიღეს {t}. იპოვე საწყისი რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["7|30|17", "5|27|14", "9|36|21", "4|24|12", "8|42|22", "6|33|17", "12|45|27", "3|21|10", "10|51|27", "11|39|24", "5|48|21", "7|54|25", "9|60|29", "4|15|9", "13|57|32", "8|63|29", "6|45|21", "15|66|37"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.t} ÷ 3 = ${Number(vars.t) / 3}; ${Number(vars.t) / 3} + ${vars.a} = ${answer}.`,
  }),
  // g4-u17-07 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-07', subtopicId: 'u17-minimum-quantity', difficulty: 1 }),
    optionCount: 4,
    prompt: '{q}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["ყუთში 2 ფერის წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი წყვილი ერთი ფერის წინდისგან?|3|4|2|5", "ყუთში 3 ფერის წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი წყვილი ერთი ფერის წინდისგან?|4|5|3|6", "ყუთში 4 ფერის წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი წყვილი ერთი ფერის წინდისგან?|5|6|4|7", "ყუთში 5 ფერის წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი წყვილი ერთი ფერის წინდისგან?|6|7|5|8", "ყუთში 6 ფერის წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი წყვილი ერთი ფერის წინდისგან?|7|8|6|9", "ყუთში 7 ფერის წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი წყვილი ერთი ფერის წინდისგან?|8|9|7|10", "ყუთში 8 ფერის წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი წყვილი ერთი ფერის წინდისგან?|9|10|8|11", "ყუთში 9 ფერის წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი წყვილი ერთი ფერის წინდისგან?|10|11|9|12", "ყუთში 10 ფერის წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი წყვილი ერთი ფერის წინდისგან?|11|12|10|13", "ყუთში 11 ფერის წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი წყვილი ერთი ფერის წინდისგან?|12|13|11|14", "ყუთში 12 ფერის წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი წყვილი ერთი ფერის წინდისგან?|13|14|12|15", "ყუთში 13 ფერის წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი წყვილი ერთი ფერის წინდისგან?|14|15|13|16", "ყუთში 14 ფერის წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი წყვილი ერთი ფერის წინდისგან?|15|16|14|17", "ყუთში 15 ფერის წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი წყვილი ერთი ფერის წინდისგან?|16|17|15|18"],
      },
      q: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)],
    explanation: ({ answer }) => `უარეს შემთხვევაში პირველი წინდები სხვადასხვა ფერისაა; შემდეგი აუცილებლად გაიმეორებს ფერს — პასუხია ${answer}.`,
  }),
  // g4-u17-08 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-08', subtopicId: 'u17-minimum-quantity', difficulty: 1 }),
    prompt: 'ჩანთაში {r} წითელი და {b} ლურჯი ბურთია. რამდენი ბურთი უნდა ამოიღო მინიმუმ, რომ აუცილებლად ამოიღო წითელი ბურთი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|5|6", "3|7|8", "6|2|3", "5|4|5", "8|3|4", "2|9|10", "7|6|7", "9|1|2", "10|4|5", "12|3|4", "6|8|9", "4|11|12", "5|9|10", "3|12|13", "7|2|3", "8|6|7", "9|5|6", "11|2|3"],
      },
      r: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `უარეს შემთხვევაში ყველა ${vars.b} ლურჯს ამოვიღებთ და შემდეგი აუცილებლად წითელია: ${vars.b} + 1 = ${answer}.`,
  }),
  // g4-u17-09 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-09', subtopicId: 'u17-minimum-quantity', difficulty: 2 }),
    prompt: 'ყუთში {g} მწვანე, {y} ყვითელი და {r} წითელი ბურთია. რამდენი ბურთი უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი ყვითელი ბურთი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|4|2|6", "2|5|3|6", "4|3|1|6", "5|2|4|10", "1|6|3|5", "6|2|2|9", "3|3|5|9", "4|5|6|11", "2|7|1|4", "5|4|3|9", "7|2|5|13", "3|6|4|8", "8|3|2|11", "2|4|9|12", "6|5|3|10", "4|8|2|7", "1|9|4|6", "5|7|6|12"],
      },
      g: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      y: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      r: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[3]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `უარეს შემთხვევაში ყვითელის გარდა ყველას ამოვიღებთ: ${vars.g} + ${vars.r} = ${Number(vars.g) + Number(vars.r)}, შემდეგი კი აუცილებლად ყვითელია. პასუხია ${answer}.`,
  }),
  // g4-u17-10 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-10', subtopicId: 'u17-minimum-quantity', difficulty: 2 }),
    prompt: 'უჯრაში {a} შავი და {b} თეთრი წინდაა. რამდენი წინდა უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ერთი შავი და ერთი თეთრი წინდა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|5|6", "4|6|7", "7|3|8", "8|2|9", "6|4|7", "9|1|10", "5|7|8", "3|9|10", "10|2|11", "4|8|9", "7|6|8", "11|3|12", "5|12|13", "6|9|10", "8|7|9", "12|4|13", "9|6|10", "10|5|11"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `უარეს შემთხვევაში ჯერ მხოლოდ ერთი ფერის ყველა წინდას ამოვიღებთ (${Math.max(Number(vars.a), Number(vars.b))}) და შემდეგი მეორე ფერისაა: + 1 = ${answer}.`,
  }),
  // g4-u17-11 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-11', subtopicId: 'u17-minimum-quantity', difficulty: 3 }),
    prompt: 'ჩანთაში {r} წითელი, {b} ლურჯი და {g} მწვანე ბურთია. რამდენი ბურთი უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს ორი ერთი ფერის ბურთი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["6|3|4|4", "4|5|2|4", "7|2|3|4", "5|6|1|4", "3|4|8|4", "8|2|5|4", "2|7|4|4", "6|6|6|4", "9|1|3|4", "4|9|2|4", "5|3|7|4", "7|5|4|4", "10|2|3|4", "3|8|5|4", "6|4|9|4", "2|5|11|4", "8|7|2|4", "4|3|12|4"],
      },
      r: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      g: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[3]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 2, 1),
    explanation: () => `სამი ფერია, ამიტომ უარეს შემთხვევაში პირველი სამი სხვადასხვა ფერისაა; მეოთხე აუცილებლად ერთ-ერთს გაიმეორებს — პასუხია 4.`,
  }),
  // g4-u17-12 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-12', subtopicId: 'u17-minimum-quantity', difficulty: 3 }),
    prompt: 'ყუთში {f} ფერის ბურთია. რამდენი ბურთი უნდა ამოიღო მინიმუმ, რომ აუცილებლად გქონდეს სამი ერთი ფერის ბურთი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|5", "3|7", "4|9", "5|11", "6|13", "7|15", "8|17", "9|19", "10|21", "11|23", "12|25", "13|27"],
      },
      f: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[1]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.f} ფერია; უარეს შემთხვევაში თითოეული ფერიდან ორ-ორს ამოვიღებთ (${Number(vars.f) * 2}), შემდეგი კი მესამეს გვაძლევს: ${Number(vars.f) * 2} + 1 = ${answer}.`,
  }),
  // g4-u17-13 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-13', subtopicId: 'u17-two-numbers-sum-difference', difficulty: 1 }),
    prompt: 'ორი რიცხვის ჯამია {s}, სხვაობა კი {d}. იპოვე დიდი რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["20|4|12|8", "30|10|20|10", "42|8|25|17", "50|20|35|15", "64|12|38|26", "100|40|70|30", "26|6|16|10", "36|14|25|11", "48|16|32|16", "70|30|50|20", "80|20|50|30", "54|18|36|18", "90|10|50|40", "44|22|33|11", "56|4|30|26", "72|24|48|24", "38|12|25|13", "60|26|43|17"],
      },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `დიდი რიცხვი = (${vars.s} + ${vars.d}) ÷ 2 = ${answer}.`,
  }),
  // g4-u17-14 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-14', subtopicId: 'u17-two-numbers-sum-difference', difficulty: 1 }),
    prompt: 'ორი რიცხვის ჯამია {s}, სხვაობა კი {d}. იპოვე პატარა რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["20|4|12|8", "30|10|20|10", "42|8|25|17", "50|20|35|15", "64|12|38|26", "100|40|70|30", "26|6|16|10", "36|14|25|11", "48|16|32|16", "70|30|50|20", "80|20|50|30", "54|18|36|18", "90|10|50|40", "44|22|33|11", "56|4|30|26", "72|24|48|24", "38|12|25|13", "60|26|43|17"],
      },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[3]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `პატარა რიცხვი = (${vars.s} − ${vars.d}) ÷ 2 = ${answer}.`,
  }),
  // g4-u17-15 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-15', subtopicId: 'u17-two-numbers-sum-difference', difficulty: 2 }),
    prompt: 'ორი რიცხვის ჯამია {s}, სხვაობა კი {d}. რამდენია ამ ორი რიცხვის ნამრავლი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["20|4|96", "30|10|200", "42|8|425", "50|20|525", "26|6|160", "36|14|275", "48|16|512", "16|4|60", "24|8|128", "34|6|280", "40|12|364", "28|4|192", "22|2|120", "18|6|72", "46|10|504", "32|8|240", "52|14|627", "38|12|325"],
      },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `რიცხვებია ${(Number(vars.s) + Number(vars.d)) / 2} და ${(Number(vars.s) - Number(vars.d)) / 2}; ნამრავლი = ${answer}.`,
  }),
  // g4-u17-16 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-16', subtopicId: 'u17-two-numbers-sum-difference', difficulty: 2 }),
    prompt: 'ორი რიცხვის ჯამია {s}. დიდი რიცხვია {a}. იპოვე პატარა რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["50|32|18", "40|27|13", "60|41|19", "72|45|27", "100|63|37", "36|21|15", "48|30|18", "56|34|22", "64|52|12", "80|47|33", "90|61|29", "28|19|9", "44|26|18", "70|43|27", "96|58|38", "54|31|23", "38|24|14", "86|55|31"],
      },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.s} − ${vars.a} = ${answer}.`,
  }),
  // g4-u17-17 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-17', subtopicId: 'u17-two-numbers-sum-difference', difficulty: 3 }),
    prompt: 'ორი რიცხვის ჯამია {s}, სხვაობა კი {d}. რამდენჯერ მეტია დიდი რიცხვი პატარაზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["24|8|2", "30|18|4", "36|12|2", "48|24|3", "45|15|2", "54|18|2", "42|6|1", "56|16|1", "44|4|1", "66|22|2", "60|12|1", "27|9|2", "40|16|2", "50|20|2", "72|24|2", "33|11|2", "28|12|2", "80|32|2"],
      },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 2, 1),
    explanation: ({ vars, answer }) => `რიცხვებია ${(Number(vars.s) + Number(vars.d)) / 2} და ${(Number(vars.s) - Number(vars.d)) / 2}; ${(Number(vars.s) + Number(vars.d)) / 2} ÷ ${(Number(vars.s) - Number(vars.d)) / 2} = ${answer}-ჯერ.`,
  }),
  // g4-u17-18 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-18', subtopicId: 'u17-two-numbers-sum-difference', difficulty: 3 }),
    prompt: 'ორი რიცხვის ჯამია {s}, სხვაობა კი {d}. რამდენია ამ რიცხვების ჯამისა და სხვაობის ჯამი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["20|4|24", "30|10|40", "42|8|50", "50|20|70", "64|12|76", "26|6|32", "36|14|50", "48|16|64", "70|30|100", "16|4|20", "24|8|32", "34|6|40", "40|12|52", "28|4|32", "22|2|24", "18|6|24", "46|10|56", "32|8|40"],
      },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.s} + ${vars.d} = ${answer}.`,
  }),
  // g4-u17-19 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-19', subtopicId: 'u17-two-numbers-product-quotient', difficulty: 1 }),
    prompt: 'ორი რიცხვის ნამრავლია {p}, ერთი მათგანი კი {k}-ჯერ მეტია მეორეზე. იპოვე პატარა რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|3|2", "36|4|3", "20|5|2", "50|2|5", "72|8|3", "96|6|4", "48|3|4", "80|5|4", "28|7|2", "36|9|2", "100|4|5", "24|6|2", "162|2|9", "90|10|3", "180|5|6", "147|3|7", "32|8|2", "196|4|7"],
      },
      p: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 2, 1),
    explanation: ({ vars, answer }) => `ნამრავლი = პატარა × (პატარა × ${vars.k}), ანუ პატარა რიცხვის კვადრატი გამრავლებული ${vars.k}-ზე. ${answer} × ${answer} × ${vars.k} = ${vars.p}, ამიტომ პატარა რიცხვია ${answer}.`,
  }),
  // g4-u17-20 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-20', subtopicId: 'u17-two-numbers-product-quotient', difficulty: 2 }),
    prompt: 'ორი დადებითი მთელი რიცხვის ნამრავლია {p}, ხოლო დიდი რიცხვის პატარაზე გაყოფით მიიღება {k}. იპოვე დიდი რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|3|6", "36|4|12", "20|5|10", "50|2|10", "72|8|24", "96|6|24", "48|3|12", "80|5|20", "28|7|14", "36|9|18", "100|4|20", "24|6|12", "162|2|18", "90|10|30", "180|5|30", "147|3|21", "32|8|16", "196|4|28"],
      },
      p: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ნამრავლი ÷ განაყოფი = ${Number(vars.p) / Number(vars.k)}. ეს პატარა რიცხვის კვადრატია: ${Math.sqrt(Number(vars.p) / Number(vars.k))} × ${Math.sqrt(Number(vars.p) / Number(vars.k))}. დიდი რიცხვი = ${Math.sqrt(Number(vars.p) / Number(vars.k))} × ${vars.k} = ${answer}.`,
  }),
  // g4-u17-21 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-21', subtopicId: 'u17-two-numbers-product-quotient', difficulty: 2 }),
    prompt: 'ორი რიცხვის ნამრავლია {p}. ერთი მათგანია {a}. იპოვე მეორე.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["18|3|6", "20|4|5", "21|7|3", "32|8|4", "54|6|9", "35|5|7", "18|9|2", "36|12|3", "44|11|4", "60|10|6", "56|8|7", "45|9|5", "48|6|8", "63|7|9", "48|4|12", "55|5|11", "42|3|14", "34|2|17"],
      },
      p: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.p} ÷ ${vars.a} = ${answer}.`,
  }),
  // g4-u17-22 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-22', subtopicId: 'u17-two-numbers-product-quotient', difficulty: 3 }),
    prompt: 'ორი დადებითი მთელი რიცხვის ნამრავლია {p}, ხოლო დიდი რიცხვის პატარაზე გაყოფით მიიღება {k}. რამდენია ამ ორი რიცხვის ჯამი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|3|8", "36|4|15", "20|5|12", "50|2|15", "72|8|27", "96|6|28", "48|3|16", "80|5|24", "28|7|16", "36|9|20", "100|4|25", "24|6|14", "162|2|27", "90|10|33", "180|5|36", "147|3|28", "32|8|18", "196|4|35"],
      },
      p: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `ნამრავლი ÷ განაყოფი = ${Number(vars.p) / Number(vars.k)} — ეს პატარა რიცხვის კვადრატია, ამიტომ პატარა რიცხვია ${Math.sqrt(Number(vars.p) / Number(vars.k))}, დიდი კი ${Math.sqrt(Number(vars.p) / Number(vars.k)) * Number(vars.k)}. ჯამი = ${answer}.`,
  }),
  // g4-u17-23 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-23', subtopicId: 'u17-two-numbers-product-quotient', difficulty: 3 }),
    prompt: 'ორი რიცხვის ნამრავლია {p}, ხოლო მათი ჯამია {s}. იპოვე დიდი რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["18|9|6", "20|9|5", "21|10|7", "32|12|8", "54|15|9", "35|12|7", "18|11|9", "36|15|12", "44|15|11", "60|16|10", "56|15|8", "45|14|9", "48|14|8", "63|16|9", "48|16|12", "55|16|11", "42|17|14", "34|19|17"],
      },
      p: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ნამრავლი ${vars.p} და ჯამი ${vars.s} გვაძლევს ${answer}-სა და ${Number(vars.s) - Number(vars.answer)}-ს.`,
  }),
  // g4-u17-24 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-24', subtopicId: 'u17-two-numbers-product-quotient', difficulty: 1 }),
    prompt: 'ორი რიცხვის ნამრავლია {p}, განაყოფი კი {k}. რამდენჯერ მეტია დიდი რიცხვი პატარაზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|3|3", "36|4|4", "20|5|5", "50|2|2", "72|8|8", "96|6|6", "48|3|3", "80|5|5", "28|7|7", "36|9|9", "100|4|4", "24|6|6", "162|2|2", "90|10|10", "180|5|5", "147|3|3", "32|8|8", "196|4|4"],
      },
      p: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 2, 1),
    explanation: ({ answer }) => `განაყოფი სწორედ იმას გვიჩვენებს, რამდენჯერ მეტია დიდი რიცხვი — ${answer}-ჯერ.`,
  }),
  // g4-u17-25 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-25', subtopicId: 'u17-shape-puzzles', difficulty: 1 }),
    prompt: 'თუ ★ + ★ = {t}, რამდენია ★?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|4", "10|5", "14|7", "16|8", "18|9", "20|10", "22|11", "24|12", "26|13", "28|14", "30|15", "32|16", "34|17", "36|18", "40|20", "42|21", "44|22", "50|25"],
      },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[1]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.t} ÷ 2 = ${answer}.`,
  }),
  // g4-u17-26 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-26', subtopicId: 'u17-shape-puzzles', difficulty: 1 }),
    prompt: 'თუ ● + {a} = {t}, რამდენია ●?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|12|7", "7|15|8", "8|20|12", "6|17|11", "9|23|14", "4|14|10", "11|26|15", "3|19|16", "10|31|21", "12|27|15", "13|35|22", "2|21|19", "14|40|26", "15|33|18", "16|45|29", "17|38|21", "18|50|32", "19|42|23"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.t} − ${vars.a} = ${answer}.`,
  }),
  // g4-u17-27 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-27', subtopicId: 'u17-shape-puzzles', difficulty: 2 }),
    prompt: 'თუ ▲ + ▲ + {a} = {t}, რამდენია ▲?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["6|20|7", "4|18|7", "8|26|9", "10|30|10", "2|16|7", "12|34|11", "5|25|10", "7|31|12", "9|39|15", "3|21|9", "14|40|13", "11|35|12", "13|43|15", "16|48|16", "1|19|9", "15|45|15", "17|53|18", "18|56|19"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.t} − ${vars.a} = ${Number(vars.t) - Number(vars.a)}; ${Number(vars.t) - Number(vars.a)} ÷ 2 = ${answer}.`,
  }),
  // g4-u17-28 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-28', subtopicId: 'u17-shape-puzzles', difficulty: 2 }),
    prompt: 'თუ ■ × {k} = {t}, რამდენია ■?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|27|9", "4|32|8", "5|45|9", "6|54|9", "7|56|8", "8|72|9", "9|81|9", "2|38|19", "4|48|12", "6|66|11", "5|60|12", "3|39|13", "7|77|11", "8|88|11", "9|99|11", "2|46|23", "4|56|14", "5|65|13"],
      },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.t} ÷ ${vars.k} = ${answer}.`,
  }),
  // g4-u17-29 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-29', subtopicId: 'u17-shape-puzzles', difficulty: 2 }),
    prompt: 'თუ ★ + ● = {t} და ★ = {a}, რამდენია ●?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["9|15|6", "7|18|11", "12|20|8", "6|22|16", "11|25|14", "8|30|22", "14|26|12", "5|27|22", "13|32|19", "10|34|24", "15|40|25", "4|29|25", "16|38|22", "17|45|28", "3|31|28", "18|44|26", "19|50|31", "20|52|32"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.t} − ${vars.a} = ${answer}.`,
  }),
  // g4-u17-30 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-30', subtopicId: 'u17-shape-puzzles', difficulty: 3 }),
    prompt: 'თუ ▲ × {k} + {a} = {t}, რამდენია ▲?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|4|18|7", "3|6|24|6", "2|8|26|9", "4|2|26|6", "3|3|27|8", "2|10|30|10", "5|5|35|6", "3|9|36|9", "4|4|28|6", "2|6|22|8", "6|6|42|6", "3|12|45|11", "5|10|50|8", "2|14|40|13", "4|8|44|9", "3|5|32|9", "7|7|49|6", "2|12|36|12"],
      },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[3]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.t} − ${vars.a} = ${Number(vars.t) - Number(vars.a)}; ${Number(vars.t) - Number(vars.a)} ÷ ${vars.k} = ${answer}.`,
  }),
  // g4-u17-31 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-31', subtopicId: 'u17-age-problems', difficulty: 1 }),
    prompt: '{name} {a} წლისაა, მისი და კი {b} წლის. რამდენი წლით უფროსია და?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["ნიკა|8|12|4", "ანა|9|14|5", "ლუკა|7|11|4", "მარიამი|10|15|5", "გიორგი|6|13|7", "ნინო|11|16|5", "სანდრო|8|17|9", "თამარი|9|12|3", "დათო|7|14|7", "ლიზი|10|13|3", "ვანო|5|11|6", "სალომე|12|18|6", "ბექა|6|10|4", "ელენე|8|15|7", "ლევანი|9|17|8", "ნატა|7|12|5", "ზურა|10|16|6", "ქეთი|11|19|8"],
      },
      name: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[3]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.b} − ${vars.a} = ${answer} წლით.`,
  }),
  // g4-u17-32 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-32', subtopicId: 'u17-age-problems', difficulty: 1 }),
    prompt: 'ანა {a} წლისაა. მისი ძმა მასზე {d} წლით უფროსია. რამდენი წლისაა ძმა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["9|4|13", "8|3|11", "10|5|15", "7|6|13", "11|2|13", "12|4|16", "6|8|14", "13|3|16", "9|7|16", "14|2|16", "5|9|14", "10|6|16", "15|4|19", "8|5|13", "11|7|18", "12|6|18", "16|3|19", "7|8|15"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.d} = ${answer} წლის.`,
  }),
  // g4-u17-33 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-33', subtopicId: 'u17-age-problems', difficulty: 2 }),
    prompt: 'ანა {a} წლისაა. მისი ძმა მასზე {d} წლით უფროსია. რამდენი წლის იქნება ძმა {k} წლის შემდეგ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["9|4|3|16", "8|3|5|16", "10|5|2|17", "7|6|4|17", "11|2|6|19", "12|4|3|19", "6|8|2|16", "13|3|5|21", "9|7|4|20", "14|2|3|19", "5|9|6|20", "10|6|5|21", "15|4|2|21", "8|5|7|20", "11|7|3|21", "12|6|4|22", "16|3|2|21", "7|8|5|20"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[3]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `ძმა ახლა ${Number(vars.a) + Number(vars.d)} წლისაა; ${Number(vars.a) + Number(vars.d)} + ${vars.k} = ${answer} წლის იქნება.`,
  }),
  // g4-u17-34 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-34', subtopicId: 'u17-age-problems', difficulty: 2 }),
    prompt: 'ორი ბავშვის ასაკების ჯამია {s} წელი. ერთი ბავშვი {d} წლით უფროსია მეორეზე. რამდენი წლისაა უფროსი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["20|4|12", "24|6|15", "18|2|10", "30|10|20", "26|4|15", "22|8|15", "28|2|15", "34|6|20", "16|4|10", "36|12|24", "20|8|14", "32|4|18", "40|10|25", "25|5|15", "21|3|12", "27|9|18", "23|7|15", "29|11|20"],
      },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `უფროსი = (${vars.s} + ${vars.d}) ÷ 2 = ${answer} წლის.`,
  }),
  // g4-u17-35 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-35', subtopicId: 'u17-age-problems', difficulty: 3 }),
    prompt: 'დედა {m} წლისაა, შვილი კი {c} წლის. რამდენი წლის შემდეგ იქნება დედის ასაკი შვილის ასაკზე ორჯერ მეტი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["36|12|12", "40|14|12", "30|10|10", "45|15|15", "50|18|14", "42|16|10", "38|13|12", "48|17|14", "52|20|12", "44|15|14", "34|11|12", "56|22|12", "39|14|11", "46|18|10", "60|25|10", "37|12|13", "41|15|11", "54|21|12"],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `სხვაობა ${Number(vars.m) - Number(vars.c)} წელია და ის უცვლელი რჩება; დედის ასაკი ორჯერ მეტი რომ იყოს, შვილი სწორედ ამ სხვაობის ტოლი უნდა იყოს: ${answer} წლის შემდეგ.`,
  }),
  // g4-u17-36 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-36', subtopicId: 'u17-age-problems', difficulty: 3 }),
    prompt: 'ბაბუა {g} წლისაა, შვილიშვილი კი {c} წლის. რამდენი წლის შემდეგ იქნება ბაბუა შვილიშვილზე ოთხჯერ უფროსი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["72|12|8", "64|10|8", "75|15|5", "68|11|8", "56|8|8", "70|13|6", "66|9|10", "78|12|10", "80|14|8", "84|18|4", "58|10|6", "76|16|4", "90|18|6", "74|14|6", "86|20|2", "62|14|2", "92|20|4", "94|22|2"],
      },
      g: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${answer} წლის შემდეგ ბაბუა ${Number(vars.g) + Number(vars.answer)} წლის იქნება, შვილიშვილი კი ${Number(vars.c) + Number(vars.answer)} — სწორედ 4-ჯერ.`,
  }),
  // g4-u17-37 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-37', subtopicId: 'u17-age-problems', difficulty: 2 }),
    prompt: 'მამა {f} წლისაა, შვილი კი {s} წლის. ისინი ერთად რამდენი წლისანი არიან?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["40|10|50", "36|9|45", "45|12|57", "42|14|56", "50|15|65", "38|11|49", "44|13|57", "48|16|64", "35|8|43", "52|17|69", "46|12|58", "54|18|72", "39|10|49", "41|13|54", "50|12|62", "43|11|54", "47|14|61", "49|15|64"],
      },
      f: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.f} + ${vars.s} = ${answer} წლის.`,
  }),
  // g4-u17-38 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-38', subtopicId: 'u17-age-problems', difficulty: 3 }),
    prompt: 'დედა {m} წლისაა, შვილი კი {c} წლის. რამდენი წლის წინ იყო დედა შვილზე სამჯერ უფროსი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["36|14|3", "40|16|4", "30|12|3", "45|17|3", "50|20|5", "42|16|3", "38|14|2", "48|18|3", "52|20|4", "44|16|2", "34|12|1", "56|20|2", "39|15|3", "46|18|4", "60|24|6", "37|15|4", "41|17|5", "54|22|6"],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${answer} წლის წინ დედა ${Number(vars.m) - Number(vars.answer)} წლის იყო, შვილი ${Number(vars.c) - Number(vars.answer)} — სამჯერ უფროსი.`,
  }),
  // g4-u17-39 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-39', subtopicId: 'u17-time-quantity-problems', difficulty: 1 }),
    prompt: 'მანქანა საათში {v} კმ-ს გადის. რამდენ კილომეტრს გაივლის {t} საათში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["60|4|240", "50|3|150", "70|2|140", "80|5|400", "45|6|270", "90|3|270", "65|4|260", "55|7|385", "75|2|150", "85|3|255", "40|8|320", "95|2|190", "100|4|400", "120|3|360", "30|9|270", "110|2|220", "125|4|500", "150|2|300"],
      },
      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.v} × ${vars.t} = ${answer} კმ.`,
  }),
  // g4-u17-40 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-40', subtopicId: 'u17-time-quantity-problems', difficulty: 1 }),
    prompt: 'ონკანიდან წუთში {v} ლიტრი წყალი ჩაედინება ავზში. რამდენი ლიტრი ჩაედინება {t} წუთში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|8|40", "4|9|36", "6|7|42", "3|12|36", "7|6|42", "8|5|40", "9|4|36", "2|15|30", "10|6|60", "12|4|48", "15|3|45", "11|5|55", "13|4|52", "14|3|42", "16|2|32", "18|5|90", "20|4|80", "25|3|75"],
      },
      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.v} × ${vars.t} = ${answer} ლიტრი.`,
  }),
  // g4-u17-41 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-41', subtopicId: 'u17-time-quantity-problems', difficulty: 2 }),
    prompt: 'მუშა საათში {v} ნივთს ამზადებს. რამდენ ნივთს დაამზადებს {t} საათში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|5|60", "15|4|60", "10|7|70", "14|3|42", "9|8|72", "11|6|66", "13|5|65", "16|4|64", "18|3|54", "20|5|100", "8|9|72", "7|11|77", "17|4|68", "19|3|57", "21|2|42", "22|4|88", "24|3|72", "25|4|100"],
      },
      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.v} × ${vars.t} = ${answer} ნივთი.`,
  }),
  // g4-u17-42 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-42', subtopicId: 'u17-time-quantity-problems', difficulty: 2 }),
    prompt: 'ავტობუსი {t} საათში {d} კმ-ს გადის. რამდენ კილომეტრს გაივლის {t2} საათში, თუ სიჩქარე უცვლელია?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|180|5|300", "2|120|4|240", "4|200|6|300", "5|300|3|180", "2|90|7|315", "3|150|4|200", "4|240|5|300", "6|360|2|120", "2|140|5|350", "5|250|4|200", "3|210|6|420", "4|160|7|280", "2|100|8|400", "5|400|3|240", "6|420|4|280", "3|270|5|450", "4|320|3|240", "2|160|9|720"],
      },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      t2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[3]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `სიჩქარე = ${vars.d} ÷ ${vars.t} = ${Number(vars.d) / Number(vars.t)} კმ/სთ; ${Number(vars.d) / Number(vars.t)} × ${vars.t2} = ${answer} კმ.`,
  }),
  // g4-u17-43 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-43', subtopicId: 'u17-time-quantity-problems', difficulty: 3 }),
    prompt: 'პრინტერი წუთში {v} გვერდს ბეჭდავს. რამდენ წუთში დაბეჭდავს {p} გვერდს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["15|90|6", "12|60|5", "10|80|8", "20|100|5", "8|72|9", "9|63|7", "11|88|8", "14|70|5", "16|96|6", "18|90|5", "25|100|4", "6|54|9", "7|84|12", "13|78|6", "17|85|5", "19|76|4", "21|84|4", "24|96|4"],
      },
      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.p} ÷ ${vars.v} = ${answer} წუთი.`,
  }),
  // g4-u17-44 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-44', subtopicId: 'u17-time-quantity-problems', difficulty: 3 }),
    prompt: 'ბაღში {w} მუშა საათში {v} ხეს რწყავს. რამდენ ხეს მორწყავენ ისინი ერთად {t} საათში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|6|3|72", "3|5|4|60", "5|4|2|40", "2|7|5|70", "6|3|4|72", "4|8|2|64", "3|9|3|81", "5|6|2|60", "7|2|3|42", "2|10|4|80", "4|5|5|100", "6|4|3|72", "8|3|2|48", "3|7|4|84", "5|8|2|80", "9|2|5|90", "4|9|3|108", "2|12|4|96"],
      },
      w: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[3]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.w} × ${vars.v} × ${vars.t} = ${answer} ხე.`,
  }),
  // g4-u17-45 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-45', subtopicId: 'u17-finding-differences', difficulty: 1 }),
    prompt: 'იპოვე სხვაობა: {a} − {b}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["85|39|46", "72|28|44", "91|47|44", "64|27|37", "100|67|33", "83|55|28", "96|38|58", "74|49|25", "58|33|25", "120|84|36", "93|68|25", "77|26|51", "105|59|46", "88|41|47", "66|19|47", "112|75|37", "94|57|37", "81|36|45"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),
  // g4-u17-46 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-46', subtopicId: 'u17-finding-differences', difficulty: 1 }),
    prompt: 'იპოვე სხვაობა {a}-სა და {b}-ს შორის.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["100|67|33", "200|158|42", "150|96|54", "1000|475|525", "300|184|116", "250|137|113", "100|42|58", "500|365|135", "120|58|62", "180|93|87", "1000|620|380", "400|289|111", "160|77|83", "220|145|75", "350|268|82", "500|419|81", "100|23|77", "1000|856|144"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),
  // g4-u17-47 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-47', subtopicId: 'u17-finding-differences', difficulty: 1 }),
    prompt: 'ორი რიცხვის სხვაობაა {d}. დიდი რიცხვია {a}. იპოვე პატარა რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["52|17|35", "48|21|27", "73|28|45", "65|19|46", "90|24|66", "84|37|47", "57|13|44", "96|48|48", "71|26|45", "63|35|28", "100|42|58", "77|39|38", "88|51|37", "59|17|42", "94|46|48", "68|23|45", "81|34|47", "75|27|48"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.d} = ${answer}.`,
  }),
  // g4-u17-48 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-48', subtopicId: 'u17-finding-differences', difficulty: 2 }),
    prompt: 'ორი რიცხვის სხვაობაა {d}. პატარა რიცხვია {b}. იპოვე დიდი რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["16|28|44", "21|19|40", "34|27|61", "45|18|63", "13|36|49", "29|24|53", "52|17|69", "38|32|70", "47|25|72", "61|19|80", "28|34|62", "55|27|82", "72|18|90", "39|26|65", "44|31|75", "58|22|80", "69|17|86", "83|19|102"],
      },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.b} + ${vars.d} = ${answer}.`,
  }),
  // g4-u17-49 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-49', subtopicId: 'u17-finding-differences', difficulty: 2 }),
    prompt: 'ორი რიცხვის ჯამია {s}, სხვაობა კი {d}. რამდენია პატარა რიცხვი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["40|6|17", "52|8|22", "46|12|17", "64|10|27", "38|4|17", "56|16|20", "70|20|25", "48|14|17", "58|22|18", "36|6|15", "74|18|28", "62|24|19", "44|10|17", "66|26|20", "50|8|21", "42|12|15", "54|18|18", "68|14|27"],
      },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `პატარა რიცხვი = (${vars.s} − ${vars.d}) ÷ 2 = ${answer}.`,
  }),
  // g4-u17-50 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-50', subtopicId: 'u17-finding-differences', difficulty: 3 }),
    prompt: 'იპოვე სხვაობა {a}-სა და {b}-ს შორის, შემდეგ კი შედეგს {k} დაუმატე.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["85|39|10|56", "72|28|15|59", "91|47|6|50", "64|27|20|57", "100|67|7|40", "83|55|12|40", "96|38|9|67", "74|49|18|43", "58|33|25|50", "120|84|5|41", "93|68|11|36", "77|26|14|65", "105|59|8|54", "88|41|17|64", "66|19|21|68", "112|75|6|43", "94|57|13|50", "81|36|16|61"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[3]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `(${vars.a} − ${vars.b}) + ${vars.k} = ${Number(vars.a) - Number(vars.b)} + ${vars.k} = ${answer}.`,
  }),
  // g4-u17-51 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-51', subtopicId: 'u17-finding-differences', difficulty: 3 }),
    prompt: '{a}-სა და {b}-ს შორის სხვაობა {k}-ჯერ გავზარდეთ. რა მივიღეთ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["85|39|2|92", "72|28|3|132", "91|47|2|88", "64|27|4|148", "100|67|3|99", "83|55|2|56", "96|38|5|290", "74|49|2|50", "58|33|3|75", "120|84|4|144", "93|68|2|50", "77|26|3|153", "105|59|2|92", "88|41|2|94", "66|19|4|188", "112|75|2|74", "94|57|3|111", "81|36|2|90"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[3]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `(${vars.a} − ${vars.b}) × ${vars.k} = ${Number(vars.a) - Number(vars.b)} × ${vars.k} = ${answer}.`,
  }),
  // g4-u17-52 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-52', subtopicId: 'u17-segment-problems', difficulty: 1 }),
    prompt: 'გზის სიგრძეა {a} კმ. პირველი მონაკვეთი {b} კმ-ია. რამდენი კილომეტრია დარჩენილი მონაკვეთი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["20|8|12", "30|12|18", "45|18|27", "50|23|27", "25|9|16", "60|27|33", "38|15|23", "72|34|38", "64|28|36", "90|45|45", "55|21|34", "48|19|29", "100|63|37", "76|39|37", "82|47|35", "68|26|42", "58|33|25", "96|51|45"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} კმ.`,
  }),
  // g4-u17-53 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-53', subtopicId: 'u17-segment-problems', difficulty: 1 }),
    prompt: 'ლენტი {a} მ სიგრძისაა. მისგან {b} მ მოჭრეს. რამდენი მეტრი დარჩა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["15|6|9", "20|7|13", "18|5|13", "25|9|16", "30|12|18", "12|4|8", "22|8|14", "35|17|18", "28|11|17", "16|7|9", "40|24|16", "32|13|19", "24|6|18", "45|19|26", "26|10|16", "38|21|17", "14|5|9", "50|27|23"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} მ.`,
  }),
  // g4-u17-54 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-54', subtopicId: 'u17-segment-problems', difficulty: 2 }),
    prompt: 'მონაკვეთის სიგრძეა {a} სმ. ის ორ ნაწილადაა დაყოფილი; ერთი ნაწილია {b} სმ. რამდენია მეორე ნაწილი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["24|9|15", "30|13|17", "18|7|11", "36|15|21", "27|11|16", "42|19|23", "20|8|12", "33|14|19", "45|22|23", "39|17|22", "48|26|22", "21|6|15", "54|23|31", "60|31|29", "35|12|23", "28|9|19", "51|24|27", "44|18|26"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} სმ.`,
  }),
  // g4-u17-55 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-55', subtopicId: 'u17-segment-problems', difficulty: 2 }),
    prompt: 'გზის ერთი მონაკვეთი {a} კმ-ია, მეორე კი {b} კმ. რამდენი კილომეტრით გრძელია პირველი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["18|12|6", "25|14|11", "30|17|13", "22|9|13", "35|21|14", "40|26|14", "28|13|15", "32|18|14", "45|29|16", "24|16|8", "50|33|17", "38|24|14", "42|27|15", "55|36|19", "60|41|19", "34|19|15", "48|31|17", "26|17|9"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} კმ.`,
  }),
  // g4-u17-56 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-56', subtopicId: 'u17-segment-problems', difficulty: 3 }),
    prompt: '{a} სმ სიგრძის მონაკვეთი სამ ნაწილადაა დაყოფილი. პირველი {b} სმ-ია, მეორე {c} სმ. რამდენია მესამე ნაწილი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["30|8|10|12", "36|12|9|15", "24|7|6|11", "20|5|6|9", "45|14|12|19", "50|18|15|17", "28|9|8|11", "40|13|11|16", "33|10|9|14", "42|16|12|14", "60|21|18|21", "54|17|14|23", "26|8|7|11", "48|15|13|20", "38|11|9|18", "56|19|16|21", "64|23|17|24", "44|12|10|22"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[3]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} − ${vars.c} = ${answer} სმ.`,
  }),
  // g4-u17-57 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-57', subtopicId: 'u17-segment-problems', difficulty: 3 }),
    prompt: 'ორ ქალაქს შორის მანძილი {a} კმ-ია. მანქანამ გაიარა {b} კმ. რამდენი კილომეტრი დარჩა გასავლელი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["150|85|65", "200|120|80", "180|95|85", "240|138|102", "120|67|53", "300|174|126", "160|89|71", "220|131|89", "280|165|115", "100|42|58", "250|148|102", "190|103|87", "320|187|133", "140|76|64", "270|159|111", "210|124|86", "360|215|145", "170|93|77"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} კმ.`,
  }),
  // g4-u17-58 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-58', subtopicId: 'u17-segment-problems', difficulty: 3 }),
    prompt: 'მონაკვეთი {k} ტოლ ნაწილადაა დაყოფილი. მთელი სიგრძე {a} სმ-ია. რამდენია ერთი ნაწილის სიგრძე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["24|3|8", "30|5|6", "36|4|9", "45|9|5", "28|7|4", "40|8|5", "54|6|9", "63|9|7", "48|6|8", "56|7|8", "72|8|9", "64|8|8", "81|9|9", "35|5|7", "42|6|7", "60|10|6", "27|3|9", "90|9|10"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.k} = ${answer} სმ.`,
  }),
  // g4-u17-59 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-59', subtopicId: 'u17-scale', difficulty: 1 }),
    prompt: 'რუკაზე 1 სმ რეალურ მანძილზე {k} კმ-ს შეესაბამება. რას უდრის რეალური მანძილი, თუ რუკაზე მანძილი {d} სმ-ია?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|4|20", "10|7|70", "4|8|32", "6|5|30", "8|3|24", "2|9|18", "3|7|21", "12|4|48", "15|2|30", "20|3|60", "7|6|42", "9|5|45", "11|3|33", "25|4|100", "14|5|70", "16|2|32", "18|3|54", "30|2|60"],
      },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.d} × ${vars.k} = ${answer} კმ.`,
  }),
  // g4-u17-60 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-60', subtopicId: 'u17-scale', difficulty: 2 }),
    prompt: 'რუკის მასშტაბია 1 სმ = {k} კმ. რუკაზე ორ ქალაქს შორის მანძილია {d} სმ. რა მანძილია სინამდვილეში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10|7|70", "5|6|30", "4|9|36", "8|4|32", "6|7|42", "12|3|36", "15|5|75", "3|11|33", "20|2|40", "7|8|56", "9|6|54", "25|3|75", "14|4|56", "11|7|77", "13|5|65", "16|4|64", "18|2|36", "24|3|72"],
      },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.d} × ${vars.k} = ${answer} კმ.`,
  }),
  // g4-u17-61 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-61', subtopicId: 'u17-scale', difficulty: 2 }),
    prompt: 'რეალური მანძილია {r} კმ. თუ მასშტაბია 1 სმ = {k} კმ, რამდენი სანტიმეტრი იქნება ეს რუკაზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["30|5|6", "45|9|5", "24|4|6", "36|6|6", "60|10|6", "42|7|6", "48|8|6", "54|6|9", "80|8|10", "35|5|7", "50|10|5", "66|6|11", "72|9|8", "28|4|7", "96|8|12", "64|8|8", "81|9|9", "90|10|9"],
      },
      r: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.r} ÷ ${vars.k} = ${answer} სმ.`,
  }),
  // g4-u17-62 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-62', subtopicId: 'u17-scale', difficulty: 2 }),
    prompt: 'რუკაზე მანძილი {d} სმ-ია, მასშტაბი კი 1 სმ = {k} კმ. იპოვე რეალური მანძილი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|4|32", "5|7|35", "6|9|54", "9|3|27", "11|5|55", "4|12|48", "7|6|42", "3|14|42", "12|2|24", "10|8|80", "5|15|75", "6|11|66", "9|7|63", "13|3|39", "2|20|40", "8|9|72", "4|16|64", "7|12|84"],
      },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.d} × ${vars.k} = ${answer} კმ.`,
  }),
  // g4-u17-63 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-63', subtopicId: 'u17-scale', difficulty: 3 }),
    prompt: 'რეალური მანძილი {r} კმ-ია. მასშტაბია 1 სმ = {k} კმ. რამდენი სანტიმეტრი იქნება რუკაზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["45|9|5", "56|7|8", "72|8|9", "63|9|7", "50|5|10", "84|12|7", "96|8|12", "36|4|9", "60|6|10", "42|7|6", "90|10|9", "108|12|9", "77|11|7", "65|5|13", "135|9|15", "112|8|14", "144|12|12", "78|6|13"],
      },
      r: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.r} ÷ ${vars.k} = ${answer} სმ.`,
  }),
  // g4-u17-64 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-64', subtopicId: 'u17-scale', difficulty: 3 }),
    prompt: 'რუკაზე ორი სოფლის შორის მანძილი {d} სმ-ია. მასშტაბია 1 სმ = {k} კმ. რა მანძილია სოფლებამდე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["6|12|72", "7|15|105", "5|18|90", "8|11|88", "4|25|100", "9|13|117", "3|30|90", "11|6|66", "12|7|84", "2|40|80", "10|9|90", "13|4|52", "8|14|112", "6|21|126", "5|26|130", "7|18|126", "9|16|144", "4|32|128"],
      },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.d} × ${vars.k} = ${answer} კმ.`,
  }),
  // g4-u17-65 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-65', subtopicId: 'u17-graphs', difficulty: 1 }),
    prompt: 'ვაშლი — {a}, მსხალი — {b}, ბანანი — {c}, ფორთოხალი — {d}. რომელი ნაყოფია ყველაზე მეტად და რამდენია მისი რაოდენობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|8|15|10|15", "14|9|18|11|18", "10|6|13|8|13", "16|11|20|13|20", "11|7|17|9|17", "13|5|19|12|19", "15|10|21|14|21", "9|4|12|7|12", "18|13|24|16|24", "12|7|16|9|16", "17|12|22|15|22", "10|5|15|8|15", "14|8|19|11|19", "13|9|18|10|18", "16|7|23|12|23", "11|6|14|9|14", "19|14|25|17|25", "15|9|20|13|20"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[4]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ answer }) => `ოთხი რიცხვიდან უდიდესია ${answer}.`,
  }),
  // g4-u17-66 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-66', subtopicId: 'u17-graphs', difficulty: 1 }),
    prompt: 'დიაგრამაზე მსხალი — {b}, ვაშლი კი მსხალზე {k}-ით მეტია. რამდენი ვაშლია?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|4|12", "9|5|14", "6|7|13", "11|3|14", "7|8|15", "5|9|14", "10|6|16", "4|8|12", "13|5|18", "12|7|19", "9|9|18", "6|11|17", "14|4|18", "8|12|20", "7|10|17", "5|13|18", "15|6|21", "10|9|19"],
      },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.b} + ${vars.k} = ${answer}.`,
  }),
  // g4-u17-67 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-67', subtopicId: 'u17-graphs', difficulty: 2 }),
    prompt: 'ვაშლი — {a}, მსხალი — {b}, ბანანი — {c}, ფორთოხალი — {d}. რამდენით მეტია ბანანი მსხალზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|8|15|10|7", "14|9|18|11|9", "10|6|13|8|7", "16|11|20|13|9", "11|7|17|9|10", "13|5|19|12|14", "15|10|21|14|11", "9|4|12|7|8", "18|13|24|16|11", "12|7|16|9|9", "17|12|22|15|10", "10|5|15|8|10", "14|8|19|11|11", "13|9|18|10|9", "16|7|23|12|16", "11|6|14|9|8", "19|14|25|17|11", "15|9|20|13|11"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[4]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.c} − ${vars.b} = ${answer}.`,
  }),
  // g4-u17-68 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-68', subtopicId: 'u17-graphs', difficulty: 2 }),
    prompt: 'ვაშლი — {a}, მსხალი — {b}, ბანანი — {c}, ფორთოხალი — {d}. რამდენია ოთხივე ნაყოფის ჯამი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|8|15|10|45", "14|9|18|11|52", "10|6|13|8|37", "16|11|20|13|60", "11|7|17|9|44", "13|5|19|12|49", "15|10|21|14|60", "9|4|12|7|32", "18|13|24|16|71", "12|7|16|9|44", "17|12|22|15|66", "10|5|15|8|38", "14|8|19|11|52", "13|9|18|10|50", "16|7|23|12|58", "11|6|14|9|40", "19|14|25|17|75", "15|9|20|13|57"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[4]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} = ${answer}.`,
  }),
  // g4-u17-69 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-69', subtopicId: 'u17-graphs', difficulty: 2 }),
    prompt: 'ვაშლი — {a}, მსხალი — {b}, ბანანი — {c}, ფორთოხალი — {d}. სამი ყველაზე მრავალრიცხოვანი ნაყოფის ჯამი რამდენია?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|8|15|10|37", "14|9|18|11|43", "10|6|13|8|31", "16|11|20|13|49", "11|7|17|9|37", "13|5|19|12|44", "15|10|21|14|50", "9|4|12|7|28", "18|13|24|16|58", "12|7|16|9|37", "17|12|22|15|54", "10|5|15|8|33", "14|8|19|11|44", "13|9|18|10|41", "16|7|23|12|51", "11|6|14|9|34", "19|14|25|17|61", "15|9|20|13|48"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[4]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `სულ ${Number(vars.a) + Number(vars.b) + Number(vars.c) + Number(vars.d)} ნაყოფია; უმცირესს (${Math.min(Number(vars.a), Number(vars.b), Number(vars.c), Number(vars.d))}) რომ გამოვაკლოთ, დარჩენილი სამის ჯამია ${answer}.`,
  }),
  // g4-u17-70 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-70', subtopicId: 'u17-graphs', difficulty: 3 }),
    prompt: 'ვაშლი — {a}, მსხალი — {b}, ბანანი — {c}, ფორთოხალი — {d}. რამდენით ნაკლებია მსხალი ვაშლზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|8|15|10|4", "14|9|18|11|5", "10|6|13|8|4", "16|11|20|13|5", "11|7|17|9|4", "13|5|19|12|8", "15|10|21|14|5", "9|4|12|7|5", "18|13|24|16|5", "12|7|16|9|5", "17|12|22|15|5", "10|5|15|8|5", "14|8|19|11|6", "13|9|18|10|4", "16|7|23|12|9", "11|6|14|9|5", "19|14|25|17|5", "15|9|20|13|6"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[4]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),
  // g4-u17-71 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-71', subtopicId: 'u17-graphs', difficulty: 3 }),
    prompt: 'ვაშლი — {a}, მსხალი — {b}, ბანანი — {c}, ფორთოხალი — {d}. რამდენი ნაყოფი უნდა დავამატოთ, რომ სულ {t} გახდეს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|8|15|10|60|15", "14|9|18|11|60|8", "10|6|13|8|50|13", "16|11|20|13|70|10", "11|7|17|9|60|16", "13|5|19|12|60|11", "15|10|21|14|70|10", "9|4|12|7|40|8", "18|13|24|16|80|9", "12|7|16|9|50|6", "17|12|22|15|80|14", "10|5|15|8|50|12", "14|8|19|11|60|8", "13|9|18|10|60|10", "16|7|23|12|70|12", "11|6|14|9|50|10", "19|14|25|17|90|15", "15|9|20|13|70|13"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[5]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `ახლა სულ ${Number(vars.a) + Number(vars.b) + Number(vars.c) + Number(vars.d)} ნაყოფია; ${vars.t} − ${Number(vars.a) + Number(vars.b) + Number(vars.c) + Number(vars.d)} = ${answer}.`,
  }),
  // g4-u17-72 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-72', subtopicId: 'u17-number-ordering', difficulty: 1 }),
    prompt: '{instruction}',
    variables: {
      instruction: {
        kind: 'choice',
        values: ["დაალაგე რიცხვები ზრდადობით (უმცირესიდან უდიდესისკენ):", "ჩამოაწყე რიცხვები ზრდადობით — ჯერ უმცირესი:"],
      },
      items: {
        kind: 'list',
        pick: { values: [26, 36, 62, 63, 15, 51, 24, 42, 37, 73, 48, 84, 59, 95], length: 4, unique: true },
      },
    },
    shuffle: { source: 'items', direction: 'asc' },
    format: { kind: 'text' },
    answer: (_v, ctx) => {
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((a, b) => a - b);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    explanation: ({ vars }) => {
      const shown = [...(vars.items as number[])];
      const sorted = [...shown].sort((a, b) => a - b);
      return `ზრდადობით: ${sorted.join(' < ')}.`;
    },
  }),
  // g4-u17-73 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-73', subtopicId: 'u17-number-ordering', difficulty: 1 }),
    prompt: '{instruction}',
    variables: {
      instruction: {
        kind: 'choice',
        values: ["დაალაგე რიცხვები კლებადობით (უდიდესიდან უმცირესისკენ):", "ჩამოაწყე რიცხვები კლებადობით — ჯერ უდიდესი:"],
      },
      items: {
        kind: 'list',
        pick: { values: [26, 36, 62, 63, 15, 51, 24, 42, 37, 73, 48, 84, 59, 95], length: 4, unique: true },
      },
    },
    shuffle: { source: 'items', direction: 'desc' },
    format: { kind: 'text' },
    answer: (_v, ctx) => {
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((a, b) => b - a);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    explanation: ({ vars }) => {
      const shown = [...(vars.items as number[])];
      const sorted = [...shown].sort((a, b) => b - a);
      return `კლებადობით: ${sorted.join(' > ')}.`;
    },
  }),
  // g4-u17-74 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-74', subtopicId: 'u17-number-ordering', difficulty: 1 }),
    prompt: '{instruction}',
    variables: {
      instruction: {
        kind: 'choice',
        values: ["დაალაგე რიცხვები ზრდადობით:", "ჩამოაწყე რიცხვები ზრდადობით:"],
      },
      items: {
        kind: 'list',
        pick: { values: [8, 5, 12, 3, 9, 1, 10, 7], length: 3, unique: true },
      },
    },
    shuffle: { source: 'items', direction: 'asc' },
    format: { kind: 'text' },
    answer: (_v, ctx) => {
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((a, b) => a - b);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    explanation: ({ vars }) => {
      const shown = [...(vars.items as number[])];
      const sorted = [...shown].sort((a, b) => a - b);
      return `ზრდადობით: ${sorted.join(' < ')}.`;
    },
  }),
  // g4-u17-75 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-75', subtopicId: 'u17-number-ordering', difficulty: 2 }),
    prompt: '{instruction}',
    variables: {
      instruction: {
        kind: 'choice',
        values: ["დაალაგე ორნიშნა რიცხვები ზრდადობით:", "ჩამოაწყე ორნიშნა რიცხვები ზრდადობით:"],
      },
      items: {
        kind: 'list',
        pick: { values: [45, 54, 34, 43, 99, 19, 29, 92, 68, 86, 77, 57], length: 4, unique: true },
      },
    },
    shuffle: { source: 'items', direction: 'asc' },
    format: { kind: 'text' },
    answer: (_v, ctx) => {
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((a, b) => a - b);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    explanation: ({ vars }) => {
      const shown = [...(vars.items as number[])];
      const sorted = [...shown].sort((a, b) => a - b);
      return `ზრდადობით: ${sorted.join(' < ')}.`;
    },
  }),
  // g4-u17-76 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-76', subtopicId: 'u17-number-ordering', difficulty: 2 }),
    prompt: '{instruction}',
    variables: {
      instruction: {
        kind: 'choice',
        values: ["დაალაგე რიცხვები ზრდადობით:", "ჩამოაწყე რიცხვები ზრდადობით:"],
      },
      items: {
        kind: 'list',
        pick: { values: [105, 150, 501, 510, 95, 159, 190, 15, 51, 119], length: 4, unique: true },
      },
    },
    shuffle: { source: 'items', direction: 'asc' },
    format: { kind: 'text' },
    answer: (_v, ctx) => {
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((a, b) => a - b);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    explanation: ({ vars }) => {
      const shown = [...(vars.items as number[])];
      const sorted = [...shown].sort((a, b) => a - b);
      return `ზრდადობით: ${sorted.join(' < ')}.`;
    },
  }),
  // g4-u17-77 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-77', subtopicId: 'u17-number-ordering', difficulty: 2 }),
    prompt: '{instruction}',
    variables: {
      instruction: {
        kind: 'choice',
        values: ["დაალაგე რიცხვები კლებადობით:", "ჩამოაწყე რიცხვები კლებადობით:"],
      },
      items: {
        kind: 'list',
        pick: { values: [300, 30, 303, 33, 330, 333, 310, 103], length: 4, unique: true },
      },
    },
    shuffle: { source: 'items', direction: 'desc' },
    format: { kind: 'text' },
    answer: (_v, ctx) => {
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((a, b) => b - a);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    explanation: ({ vars }) => {
      const shown = [...(vars.items as number[])];
      const sorted = [...shown].sort((a, b) => b - a);
      return `კლებადობით: ${sorted.join(' > ')}.`;
    },
  }),
  // g4-u17-78 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-78', subtopicId: 'u17-number-ordering', difficulty: 3 }),
    prompt: '{instruction}',
    variables: {
      instruction: {
        kind: 'choice',
        values: ["დაალაგე რიცხვები ზრდადობით:", "ჩამოაწყე რიცხვები ზრდადობით:"],
      },
      items: {
        kind: 'list',
        pick: { values: [1000, 100, 10000, 10, 999, 1010, 1100, 111], length: 4, unique: true },
      },
    },
    shuffle: { source: 'items', direction: 'asc' },
    format: { kind: 'text' },
    answer: (_v, ctx) => {
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((a, b) => a - b);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    explanation: ({ vars }) => {
      const shown = [...(vars.items as number[])];
      const sorted = [...shown].sort((a, b) => a - b);
      return `ზრდადობით: ${sorted.join(' < ')}.`;
    },
  }),
  // g4-u17-79 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-79', subtopicId: 'u17-number-ordering', difficulty: 3 }),
    prompt: '{instruction}',
    variables: {
      instruction: {
        kind: 'choice',
        values: ["დაალაგე რიცხვები კლებადობით:", "ჩამოაწყე რიცხვები კლებადობით:"],
      },
      items: {
        kind: 'list',
        pick: { values: [250, 205, 520, 502, 25, 52, 2500, 2050], length: 4, unique: true },
      },
    },
    shuffle: { source: 'items', direction: 'desc' },
    format: { kind: 'text' },
    answer: (_v, ctx) => {
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((a, b) => b - a);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    explanation: ({ vars }) => {
      const shown = [...(vars.items as number[])];
      const sorted = [...shown].sort((a, b) => b - a);
      return `კლებადობით: ${sorted.join(' > ')}.`;
    },
  }),
  // g4-u17-80 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-80', subtopicId: 'u17-number-ordering', difficulty: 3 }),
    prompt: '{instruction}',
    variables: {
      instruction: {
        kind: 'choice',
        values: ["დაალაგე რიცხვები ზრდადობით:", "ჩამოაწყე რიცხვები ზრდადობით:"],
      },
      items: {
        kind: 'list',
        pick: { values: [7, 17, 70, 71, 107, 170, 700, 701, 117], length: 4, unique: true },
      },
    },
    shuffle: { source: 'items', direction: 'asc' },
    format: { kind: 'text' },
    answer: (_v, ctx) => {
      const shown = (ctx.order ?? []).map(Number);
      const sorted = [...shown].sort((a, b) => a - b);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    explanation: ({ vars }) => {
      const shown = [...(vars.items as number[])];
      const sorted = [...shown].sort((a, b) => a - b);
      return `ზრდადობით: ${sorted.join(' < ')}.`;
    },
  }),
  // g4-u17-81 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-81', subtopicId: 'u17-condition-matching', difficulty: 1 }),
    prompt: 'რიცხვი {n}-ზე მეტია {d}-ით. რა რიცხვია?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10|5|15", "14|6|20", "20|7|27", "8|9|17", "25|4|29", "30|12|42", "18|3|21", "40|15|55", "12|8|20", "22|11|33", "16|7|23", "35|9|44", "24|6|30", "17|13|30", "28|5|33", "45|8|53", "33|7|40", "19|14|33"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.n} + ${vars.d} = ${answer}.`,
  }),
  // g4-u17-82 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-82', subtopicId: 'u17-condition-matching', difficulty: 1 }),
    prompt: 'რიცხვი {n}-ზე ნაკლებია {d}-ით. რა რიცხვია?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["30|7|23", "45|9|36", "25|6|19", "50|13|37", "18|5|13", "60|24|36", "36|8|28", "42|15|27", "55|6|49", "28|11|17", "70|35|35", "48|19|29", "64|7|57", "39|14|25", "52|8|44", "75|26|49", "33|12|21", "58|21|37"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.n} − ${vars.d} = ${answer}.`,
  }),
  // g4-u17-83 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-83', subtopicId: 'u17-condition-matching', difficulty: 2 }),
    prompt: 'რიცხვი ლუწია და {a}-ზე მეტია, მაგრამ {b}-ზე ნაკლები. რა არის ყველაზე პატარა ასეთი რიცხვი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10|20|12", "14|25|16", "8|16|10", "21|30|22", "33|40|34", "17|24|18", "45|50|46", "12|19|14", "27|36|28", "7|14|8", "55|62|56", "19|28|20", "31|38|32", "23|32|24", "63|70|64", "9|18|10", "41|48|42", "15|22|16"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a}-ზე მეტი ყველაზე პატარა ლუწი რიცხვია ${answer}.`,
  }),
  // g4-u17-84 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-84', subtopicId: 'u17-condition-matching', difficulty: 2 }),
    prompt: 'რიცხვი კენტია და {a}-ზე მეტია, მაგრამ {b}-ზე ნაკლები. რა არის ყველაზე პატარა ასეთი რიცხვი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10|20|11", "14|25|15", "8|16|9", "21|30|23", "33|40|35", "17|24|19", "45|50|47", "12|19|13", "27|36|29", "7|14|9", "55|62|57", "19|28|21", "31|38|33", "23|32|25", "63|70|65", "9|18|11", "41|48|43", "15|22|17"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a}-ზე მეტი ყველაზე პატარა კენტი რიცხვია ${answer}.`,
  }),
  // g4-u17-85 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-85', subtopicId: 'u17-condition-matching', difficulty: 3 }),
    prompt: 'რიცხვი იყოფა {k}-ზე და {a}-ზე მეტია. რა არის ყველაზე პატარა ასეთი რიცხვი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10|3|12", "14|5|15", "20|6|24", "9|4|12", "25|7|28", "17|8|24", "31|9|36", "40|12|48", "13|5|15", "22|4|24", "35|6|36", "48|7|49", "11|2|12", "19|3|21", "27|8|32", "54|9|54", "16|5|20", "23|10|30"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a}-ზე მეტი და ${vars.k}-ის ჯერადი ყველაზე პატარა რიცხვია ${answer}.`,
  }),
  // g4-u17-86 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-86', subtopicId: 'u17-condition-matching', difficulty: 3 }),
    prompt: 'რიცხვი ორნიშნაა, იყოფა {k}-ზე და {a}-ზე მეტია. რა არის ყველაზე პატარა ასეთი რიცხვი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|7|10", "8|9|10", "3|6|10", "11|8|16", "6|5|10", "9|4|12", "2|12|12", "7|6|12", "4|9|10", "1|15|15", "10|3|12", "12|7|14", "13|4|16", "14|8|16", "15|6|18", "9|5|10", "11|12|12", "8|11|11"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.k}-ის ჯერადი ორნიშნა რიცხვებიდან ${vars.a}-ზე მეტი ყველაზე პატარაა ${answer}.`,
  }),
  // g4-u17-87 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-87', subtopicId: 'u17-condition-matching', difficulty: 3 }),
    prompt: '{a}-ზე მეტი და {b}-ზე ნაკლები მხოლოდ ერთი ლუწი რიცხვია — {c}. რამდენია {a} და {b} შორის სხვაობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10|14|12|4", "20|26|24|6", "15|21|18|6", "30|38|34|8", "40|46|42|6", "50|56|54|6", "60|70|64|10", "45|53|48|8", "25|33|28|8", "70|82|76|12", "80|92|86|12", "90|98|94|8", "35|39|36|4", "55|63|58|8", "65|75|70|10", "100|112|106|12", "110|122|116|12", "120|130|126|10"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[3]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.b} − ${vars.a} = ${answer}.`,
  }),
  // g4-u17-88 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-88', subtopicId: 'u17-condition-matching', difficulty: 2 }),
    prompt: 'სამნიშნა რიცხვი იწყება {d}-ით, მთავრდება {u}-ით, ხოლო ათეულებში 0 დგას. რა რიცხვია?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1|4|104", "2|7|207", "3|5|305", "4|9|409", "5|2|502", "6|8|608", "7|3|703", "8|6|806", "9|1|901", "1|8|108", "2|3|203", "3|9|309", "4|6|406", "5|1|501", "6|4|604", "7|8|708", "8|2|802", "9|5|905"],
      },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      u: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 10),
    explanation: ({ vars, answer }) => `${vars.d} ასეული, 0 ათეული, ${vars.u} ერთეული = ${answer}.`,
  }),
  // g4-u17-89 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-89', subtopicId: 'u17-condition-matching', difficulty: 3 }),
    prompt: 'ორნიშნა რიცხვი იწყება {d}-ით და მთავრდება {u}-ით. რამდენი უნდა დავუმატოთ, რომ ზუსტად 100 მივიღოთ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1|4|86", "2|7|73", "3|5|65", "4|9|51", "5|2|48", "6|8|32", "7|3|27", "8|6|14", "9|1|9", "1|8|82", "2|3|77", "3|9|61", "4|6|54", "5|1|49", "6|4|36", "7|8|22", "8|2|18", "9|5|5"],
      },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      u: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `რიცხვია ${Number(vars.d) * 10 + Number(vars.u)}; 100 − ${Number(vars.d) * 10 + Number(vars.u)} = ${answer}.`,
  }),
  // g4-u17-90 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-90', subtopicId: 'u17-condition-matching', difficulty: 3 }),
    prompt: 'ორი ზედიზედ მოსული ლუწი რიცხვის ჯამია {s}. იპოვე პატარა მათგანი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10|4", "14|6", "18|8", "22|10", "26|12", "30|14", "34|16", "38|18", "42|20", "46|22", "50|24", "54|26", "58|28", "62|30", "66|32", "70|34", "74|36", "78|38"],
      },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[1]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.s} ÷ 2 = ${Number(vars.s) / 2}; პატარა რიცხვია ${Number(vars.s) / 2} − 1 = ${answer}.`,
  }),
  // g4-u17-91 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-91', subtopicId: 'u17-elimination', difficulty: 1 }),
    optionCount: 4,
    prompt: '{q}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["მარიამი, ნიკა და თამარი აირჩიეს სხვადასხვა ფერი: წითელი, ლურჯი, მწვანე. მარიამი არ ირჩევს „წითელი“-ს, ნიკა კი ირჩევს „ლურჯი“-ს. რას ირჩევს მარიამი?|მწვანე|წითელი|ლურჯი|ვერ დავადგენთ", "ანა, ბექა და გიორგი აირჩიეს სხვადასხვა ფერი: თეთრი, შავი, ნარინჯისფერი. ანა არ ირჩევს „თეთრი“-ს, ბექა კი ირჩევს „შავი“-ს. რას ირჩევს ანა?|ნარინჯისფერი|თეთრი|შავი|ვერ დავადგენთ", "ლუკა, ნინო და დათო აირჩიეს სხვადასხვა ფერი: ვარდისფერი, იისფერი, ყავისფერი. ლუკა არ ირჩევს „ვარდისფერი“-ს, ნინო კი ირჩევს „იისფერი“-ს. რას ირჩევს ლუკა?|ყავისფერი|ვარდისფერი|იისფერი|ვერ დავადგენთ", "სანდრო, ლიზი და ვანო აირჩიეს სხვადასხვა ფერი: ცისფერი, ყვითელი, მოწითალო. სანდრო არ ირჩევს „ცისფერი“-ს, ლიზი კი ირჩევს „ყვითელი“-ს. რას ირჩევს სანდრო?|მოწითალო|ცისფერი|ყვითელი|ვერ დავადგენთ", "სალომე, გიგა და ნატა აირჩიეს სხვადასხვა ფერი: მწვანე, ვერცხლისფერი, ოქროსფერი. სალომე არ ირჩევს „მწვანე“-ს, გიგა კი ირჩევს „ვერცხლისფერი“-ს. რას ირჩევს სალომე?|ოქროსფერი|მწვანე|ვერცხლისფერი|ვერ დავადგენთ", "ზურა, ქეთი და ლევანი აირჩიეს სხვადასხვა ფერი: ლურჯი, წითელი, შავი. ზურა არ ირჩევს „ლურჯი“-ს, ქეთი კი ირჩევს „წითელი“-ს. რას ირჩევს ზურა?|შავი|ლურჯი|წითელი|ვერ დავადგენთ", "ეკა, თორნიკე და მაკა აირჩიეს სხვადასხვა ფერი: იისფერი, მწვანე, ყვითელი. ეკა არ ირჩევს „იისფერი“-ს, თორნიკე კი ირჩევს „მწვანე“-ს. რას ირჩევს ეკა?|ყვითელი|იისფერი|მწვანე|ვერ დავადგენთ", "ბექა, სოფო და გოგა აირჩიეს სხვადასხვა ფერი: თეთრი, ნარინჯისფერი, ვარდისფერი. ბექა არ ირჩევს „თეთრი“-ს, სოფო კი ირჩევს „ნარინჯისფერი“-ს. რას ირჩევს ბექა?|ვარდისფერი|თეთრი|ნარინჯისფერი|ვერ დავადგენთ", "ანი, დიმა და ნიკა აირჩიეს სხვადასხვა ფერი: შავი, ცისფერი, წითელი. ანი არ ირჩევს „შავი“-ს, დიმა კი ირჩევს „ცისფერი“-ს. რას ირჩევს ანი?|წითელი|შავი|ცისფერი|ვერ დავადგენთ", "ლაშა, მაია და ზურა აირჩიეს სხვადასხვა ფერი: ყავისფერი, ოქროსფერი, მოწითალო. ლაშა არ ირჩევს „ყავისფერი“-ს, მაია კი ირჩევს „ოქროსფერი“-ს. რას ირჩევს ლაშა?|მოწითალო|ყავისფერი|ოქროსფერი|ვერ დავადგენთ", "გოგა, ნატა და ვანო აირჩიეს სხვადასხვა ფერი: ცისფერი, ვერცხლისფერი, ლურჯი. გოგა არ ირჩევს „ცისფერი“-ს, ნატა კი ირჩევს „ვერცხლისფერი“-ს. რას ირჩევს გოგა?|ლურჯი|ცისფერი|ვერცხლისფერი|ვერ დავადგენთ", "ნიკა, სალომე და დათო აირჩიეს სხვადასხვა ფერი: ვარდისფერი, წითელი, თეთრი. ნიკა არ ირჩევს „ვარდისფერი“-ს, სალომე კი ირჩევს „წითელი“-ს. რას ირჩევს ნიკა?|თეთრი|ვარდისფერი|წითელი|ვერ დავადგენთ", "მაია, ლევანი და ანა აირჩიეს სხვადასხვა ფერი: ყვითელი, მწვანე, იისფერი. მაია არ ირჩევს „ყვითელი“-ს, ლევანი კი ირჩევს „მწვანე“-ს. რას ირჩევს მაია?|იისფერი|ყვითელი|მწვანე|ვერ დავადგენთ", "თამარი, ეკა და ბექა აირჩიეს სხვადასხვა ფერი: ოქროსფერი, ნარინჯისფერი, შავი. თამარი არ ირჩევს „ოქროსფერი“-ს, ეკა კი ირჩევს „ნარინჯისფერი“-ს. რას ირჩევს თამარი?|შავი|ოქროსფერი|ნარინჯისფერი|ვერ დავადგენთ", "ვანო, ანი და სანდრო აირჩიეს სხვადასხვა ფერი: მოწითალო, ყავისფერი, ცისფერი. ვანო არ ირჩევს „მოწითალო“-ს, ანი კი ირჩევს „ყავისფერი“-ს. რას ირჩევს ვანო?|ცისფერი|მოწითალო|ყავისფერი|ვერ დავადგენთ", "სოფო, ლაშა და მარიამი აირჩიეს სხვადასხვა ფერი: წითელი, ვერცხლისფერი, ლურჯი. სოფო არ ირჩევს „წითელი“-ს, ლაშა კი ირჩევს „ვერცხლისფერი“-ს. რას ირჩევს სოფო?|ლურჯი|წითელი|ვერცხლისფერი|ვერ დავადგენთ", "დიმა, გიგა და მაკა აირჩიეს სხვადასხვა ფერი: შავი, მწვანე, თეთრი. დიმა არ ირჩევს „შავი“-ს, გიგა კი ირჩევს „მწვანე“-ს. რას ირჩევს დიმა?|თეთრი|შავი|მწვანე|ვერ დავადგენთ", "ნატა, ზურა და ნინო აირჩიეს სხვადასხვა ფერი: იისფერი, ვარდისფერი, ყვითელი. ნატა არ ირჩევს „იისფერი“-ს, ზურა კი ირჩევს „ვარდისფერი“-ს. რას ირჩევს ნატა?|ყვითელი|იისფერი|ვარდისფერი|ვერ დავადგენთ"],
      },
      q: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)],
    explanation: ({ answer }) => `პირველი ბავშვი თავის ფერს არ ირჩევს, მეორე კი საკუთარს ირჩევს — გამორიცხვით რჩება ${answer}.`,
  }),
  // g4-u17-92 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-92', subtopicId: 'u17-elimination', difficulty: 1 }),
    optionCount: 4,
    prompt: '{q}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["გიორგი, თამარი და ნიკა აირჩიეს სხვადასხვა ხილი: ვაშლი, მსხალი, ბანანი. გიორგი არ ირჩევს „ვაშლი“-ს, თამარი კი ირჩევს „მსხალი“-ს. რას ირჩევს გიორგი?|ბანანი|ვაშლი|მსხალი|ვერ დავადგენთ", "ანა, ბექა და ლუკა აირჩიეს სხვადასხვა ხილი: ატამი, ალუბალი, ყურძენი. ანა არ ირჩევს „ატამი“-ს, ბექა კი ირჩევს „ალუბალი“-ს. რას ირჩევს ანა?|ყურძენი|ატამი|ალუბალი|ვერ დავადგენთ", "ნინო, დათო და სანდრო აირჩიეს სხვადასხვა ხილი: მარწყვი, ლიმონი, საზამთრო. ნინო არ ირჩევს „მარწყვი“-ს, დათო კი ირჩევს „ლიმონი“-ს. რას ირჩევს ნინო?|საზამთრო|მარწყვი|ლიმონი|ვერ დავადგენთ", "ლიზი, ვანო და სალომე აირჩიეს სხვადასხვა ხილი: ფორთოხალი, მანდარინი, კივი. ლიზი არ ირჩევს „ფორთოხალი“-ს, ვანო კი ირჩევს „მანდარინი“-ს. რას ირჩევს ლიზი?|კივი|ფორთოხალი|მანდარინი|ვერ დავადგენთ", "ქეთი, ზურა და ლევანი აირჩიეს სხვადასხვა ხილი: ბანანი, ვაშლი, მსხალი. ქეთი არ ირჩევს „ბანანი“-ს, ზურა კი ირჩევს „ვაშლი“-ს. რას ირჩევს ქეთი?|მსხალი|ბანანი|ვაშლი|ვერ დავადგენთ", "ეკა, გოგა და მაკა აირჩიეს სხვადასხვა ხილი: ყურძენი, ატამი, ალუბალი. ეკა არ ირჩევს „ყურძენი“-ს, გოგა კი ირჩევს „ატამი“-ს. რას ირჩევს ეკა?|ალუბალი|ყურძენი|ატამი|ვერ დავადგენთ", "ბექა, სოფო და გიგა აირჩიეს სხვადასხვა ხილი: საზამთრო, მარწყვი, ლიმონი. ბექა არ ირჩევს „საზამთრო“-ს, სოფო კი ირჩევს „მარწყვი“-ს. რას ირჩევს ბექა?|ლიმონი|საზამთრო|მარწყვი|ვერ დავადგენთ", "ანი, დიმა და ლაშა აირჩიეს სხვადასხვა ხილი: კივი, ფორთოხალი, მანდარინი. ანი არ ირჩევს „კივი“-ს, დიმა კი ირჩევს „ფორთოხალი“-ს. რას ირჩევს ანი?|მანდარინი|კივი|ფორთოხალი|ვერ დავადგენთ", "მაია, თორნიკე და ნატა აირჩიეს სხვადასხვა ხილი: ალუბალი, ყურძენი, ატამი. მაია არ ირჩევს „ალუბალი“-ს, თორნიკე კი ირჩევს „ყურძენი“-ს. რას ირჩევს მაია?|ატამი|ალუბალი|ყურძენი|ვერ დავადგენთ", "გიგა, ეკა და ვანო აირჩიეს სხვადასხვა ხილი: მსხალი, ბანანი, ვაშლი. გიგა არ ირჩევს „მსხალი“-ს, ეკა კი ირჩევს „ბანანი“-ს. რას ირჩევს გიგა?|ვაშლი|მსხალი|ბანანი|ვერ დავადგენთ", "თამარი, ნიკა და სოფო აირჩიეს სხვადასხვა ხილი: ლიმონი, კივი, მარწყვი. თამარი არ ირჩევს „ლიმონი“-ს, ნიკა კი ირჩევს „კივი“-ს. რას ირჩევს თამარი?|მარწყვი|ლიმონი|კივი|ვერ დავადგენთ", "დათო, ანა და ზურა აირჩიეს სხვადასხვა ხილი: ატამი, საზამთრო, ალუბალი. დათო არ ირჩევს „ატამი“-ს, ანა კი ირჩევს „საზამთრო“-ს. რას ირჩევს დათო?|ალუბალი|ატამი|საზამთრო|ვერ დავადგენთ", "სანდრო, მაია და ეკა აირჩიეს სხვადასხვა ხილი: ვაშლი, ფორთოხალი, მსხალი. სანდრო არ ირჩევს „ვაშლი“-ს, მაია კი ირჩევს „ფორთოხალი“-ს. რას ირჩევს სანდრო?|მსხალი|ვაშლი|ფორთოხალი|ვერ დავადგენთ", "ნატა, ბექა და ლიზი აირჩიეს სხვადასხვა ხილი: მანდარინი, ბანანი, კივი. ნატა არ ირჩევს „მანდარინი“-ს, ბექა კი ირჩევს „ბანანი“-ს. რას ირჩევს ნატა?|კივი|მანდარინი|ბანანი|ვერ დავადგენთ", "ლაშა, ქეთი და გიგა აირჩიეს სხვადასხვა ხილი: ყურძენი, მარწყვი, ატამი. ლაშა არ ირჩევს „ყურძენი“-ს, ქეთი კი ირჩევს „მარწყვი“-ს. რას ირჩევს ლაშა?|ატამი|ყურძენი|მარწყვი|ვერ დავადგენთ", "ვანო, ანი და ნინო აირჩიეს სხვადასხვა ხილი: საზამთრო, ალუბალი, ლიმონი. ვანო არ ირჩევს „საზამთრო“-ს, ანი კი ირჩევს „ალუბალი“-ს. რას ირჩევს ვანო?|ლიმონი|საზამთრო|ალუბალი|ვერ დავადგენთ", "მაკა, გიორგი და დიმა აირჩიეს სხვადასხვა ხილი: მსხალი, ვაშლი, ბანანი. მაკა არ ირჩევს „მსხალი“-ს, გიორგი კი ირჩევს „ვაშლი“-ს. რას ირჩევს მაკა?|ბანანი|მსხალი|ვაშლი|ვერ დავადგენთ", "ნიკა, სალომე და თამარი აირჩიეს სხვადასხვა ხილი: ფორთოხალი, კივი, მანდარინი. ნიკა არ ირჩევს „ფორთოხალი“-ს, სალომე კი ირჩევს „კივი“-ს. რას ირჩევს ნიკა?|მანდარინი|ფორთოხალი|კივი|ვერ დავადგენთ"],
      },
      q: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)],
    explanation: ({ answer }) => `ორი ვარიანტი გამოირიცხა, ამიტომ პასუხია ${answer}.`,
  }),
  // g4-u17-93 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-93', subtopicId: 'u17-elimination', difficulty: 2 }),
    prompt: 'სამ ადგილას რიცხვები {x}, {y} და {z} დგას. პირველ ადგილას {x} არ არის, მეორეზე {y} არ არის. რა რიცხვია პირველ ადგილას?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1|2|3|3", "2|3|4|4", "3|4|5|5", "4|5|6|6", "5|6|7|7", "6|7|8|8", "7|8|9|9", "9|1|2|2", "8|2|3|3", "2|5|7|7", "4|1|9|9", "6|3|1|1", "5|2|8|8", "7|4|2|2", "3|8|6|6", "1|9|4|4", "9|6|3|3", "2|8|1|1"],
      },
      x: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      y: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      z: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[3]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `პირველ ადგილას ${vars.x} არ არის, მეორეზე ${vars.y} არ არის — გამორიცხვით პირველზე რჩება ${answer}.`,
  }),
  // g4-u17-94 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-94', subtopicId: 'u17-elimination', difficulty: 2 }),
    prompt: 'ორი ნატურალური რიცხვის ჯამია {s}. რამდენი წყვილია შესაძლებელი, თუ პირველი რიცხვი {a}-ზე მეტია?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10|2|7", "12|3|8", "15|4|10", "20|5|14", "18|6|11", "25|7|17", "30|8|21", "14|5|8", "16|3|12", "22|9|12", "28|11|16", "24|4|19", "32|12|19", "26|6|19", "35|10|24", "40|15|24", "19|7|11", "21|8|12"],
      },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `პირველი რიცხვი შეიძლება იყოს ${Number(vars.a) + 1}-დან ${Number(vars.s) - 1}-მდე; ასეთი ${answer} რიცხვია.`,
  }),
  // g4-u17-95 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-95', subtopicId: 'u17-elimination', difficulty: 2 }),
    optionCount: 4,
    prompt: '{q}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["ანა, ბექა და გიორგი აირჩიეს სხვადასხვა სპორტი: ფეხბურთი, კალათბურთი, ჩოგბურთი. ანა არ ირჩევს „ფეხბურთი“-ს, ბექა კი ირჩევს „კალათბურთი“-ს. რას ირჩევს ანა?|ჩოგბურთი|ფეხბურთი|კალათბურთი|ვერ დავადგენთ", "ლუკა, ნინო და დათო აირჩიეს სხვადასხვა სპორტი: ცურვა, ჭიდაობა, ველოსიპედი. ლუკა არ ირჩევს „ცურვა“-ს, ნინო კი ირჩევს „ჭიდაობა“-ს. რას ირჩევს ლუკა?|ველოსიპედი|ცურვა|ჭიდაობა|ვერ დავადგენთ", "სანდრო, ლიზი და ვანო აირჩიეს სხვადასხვა სპორტი: ფრენბურთი, ჩოგბურთი, ფეხბურთი. სანდრო არ ირჩევს „ფრენბურთი“-ს, ლიზი კი ირჩევს „ჩოგბურთი“-ს. რას ირჩევს სანდრო?|ფეხბურთი|ფრენბურთი|ჩოგბურთი|ვერ დავადგენთ", "სალომე, გიგა და ნატა აირჩიეს სხვადასხვა სპორტი: ცურვა, კალათბურთი, ჭიდაობა. სალომე არ ირჩევს „ცურვა“-ს, გიგა კი ირჩევს „კალათბურთი“-ს. რას ირჩევს სალომე?|ჭიდაობა|ცურვა|კალათბურთი|ვერ დავადგენთ", "ზურა, ქეთი და ლევანი აირჩიეს სხვადასხვა სპორტი: ფეხბურთი, ფრენბურთი, ცურვა. ზურა არ ირჩევს „ფეხბურთი“-ს, ქეთი კი ირჩევს „ფრენბურთი“-ს. რას ირჩევს ზურა?|ცურვა|ფეხბურთი|ფრენბურთი|ვერ დავადგენთ", "ეკა, თორნიკე და მაკა აირჩიეს სხვადასხვა სპორტი: ველოსიპედი, ჩოგბურთი, ჭიდაობა. ეკა არ ირჩევს „ველოსიპედი“-ს, თორნიკე კი ირჩევს „ჩოგბურთი“-ს. რას ირჩევს ეკა?|ჭიდაობა|ველოსიპედი|ჩოგბურთი|ვერ დავადგენთ", "ბექა, სოფო და გოგა აირჩიეს სხვადასხვა სპორტი: კალათბურთი, ცურვა, ფეხბურთი. ბექა არ ირჩევს „კალათბურთი“-ს, სოფო კი ირჩევს „ცურვა“-ს. რას ირჩევს ბექა?|ფეხბურთი|კალათბურთი|ცურვა|ვერ დავადგენთ", "ანი, დიმა და ნიკა აირჩიეს სხვადასხვა სპორტი: ჭიდაობა, ველოსიპედი, ფრენბურთი. ანი არ ირჩევს „ჭიდაობა“-ს, დიმა კი ირჩევს „ველოსიპედი“-ს. რას ირჩევს ანი?|ფრენბურთი|ჭიდაობა|ველოსიპედი|ვერ დავადგენთ", "ლაშა, მაია და ზურა აირჩიეს სხვადასხვა სპორტი: ჩოგბურთი, ფეხბურთი, კალათბურთი. ლაშა არ ირჩევს „ჩოგბურთი“-ს, მაია კი ირჩევს „ფეხბურთი“-ს. რას ირჩევს ლაშა?|კალათბურთი|ჩოგბურთი|ფეხბურთი|ვერ დავადგენთ", "მაკა, გიორგი და სოფო აირჩიეს სხვადასხვა სპორტი: ცურვა, ფრენბურთი, ველოსიპედი. მაკა არ ირჩევს „ცურვა“-ს, გიორგი კი ირჩევს „ფრენბურთი“-ს. რას ირჩევს მაკა?|ველოსიპედი|ცურვა|ფრენბურთი|ვერ დავადგენთ", "ნიკა, ეკა და დათო აირჩიეს სხვადასხვა სპორტი: ჭიდაობა, ცურვა, ჩოგბურთი. ნიკა არ ირჩევს „ჭიდაობა“-ს, ეკა კი ირჩევს „ცურვა“-ს. რას ირჩევს ნიკა?|ჩოგბურთი|ჭიდაობა|ცურვა|ვერ დავადგენთ", "თამარი, სანდრო და ანა აირჩიეს სხვადასხვა სპორტი: კალათბურთი, ფეხბურთი, ფრენბურთი. თამარი არ ირჩევს „კალათბურთი“-ს, სანდრო კი ირჩევს „ფეხბურთი“-ს. რას ირჩევს თამარი?|ფრენბურთი|კალათბურთი|ფეხბურთი|ვერ დავადგენთ", "გიგა, ლიზი და ნინო აირჩიეს სხვადასხვა სპორტი: ველოსიპედი, ჭიდაობა, ცურვა. გიგა არ ირჩევს „ველოსიპედი“-ს, ლიზი კი ირჩევს „ჭიდაობა“-ს. რას ირჩევს გიგა?|ცურვა|ველოსიპედი|ჭიდაობა|ვერ დავადგენთ", "დიმა, ვანო და სალომე აირჩიეს სხვადასხვა სპორტი: ჩოგბურთი, კალათბურთი, ფეხბურთი. დიმა არ ირჩევს „ჩოგბურთი“-ს, ვანო კი ირჩევს „კალათბურთი“-ს. რას ირჩევს დიმა?|ფეხბურთი|ჩოგბურთი|კალათბურთი|ვერ დავადგენთ", "სოფო, ლაშა და ზურა აირჩიეს სხვადასხვა სპორტი: ფრენბურთი, ველოსიპედი, ცურვა. სოფო არ ირჩევს „ფრენბურთი“-ს, ლაშა კი ირჩევს „ველოსიპედი“-ს. რას ირჩევს სოფო?|ცურვა|ფრენბურთი|ველოსიპედი|ვერ დავადგენთ", "ნატა, გოგა და თორნიკე აირჩიეს სხვადასხვა სპორტი: ფეხბურთი, ჭიდაობა, ჩოგბურთი. ნატა არ ირჩევს „ფეხბურთი“-ს, გოგა კი ირჩევს „ჭიდაობა“-ს. რას ირჩევს ნატა?|ჩოგბურთი|ფეხბურთი|ჭიდაობა|ვერ დავადგენთ", "ქეთი, ანი და ლევანი აირჩიეს სხვადასხვა სპორტი: ცურვა, კალათბურთი, ველოსიპედი. ქეთი არ ირჩევს „ცურვა“-ს, ანი კი ირჩევს „კალათბურთი“-ს. რას ირჩევს ქეთი?|ველოსიპედი|ცურვა|კალათბურთი|ვერ დავადგენთ", "ლიზი, მაკა და ბექა აირჩიეს სხვადასხვა სპორტი: ჭიდაობა, ფრენბურთი, ფეხბურთი. ლიზი არ ირჩევს „ჭიდაობა“-ს, მაკა კი ირჩევს „ფრენბურთი“-ს. რას ირჩევს ლიზი?|ფეხბურთი|ჭიდაობა|ფრენბურთი|ვერ დავადგენთ"],
      },
      q: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)],
    explanation: ({ answer }) => `სამიდან ორი გამოირიცხა, ამიტომ რჩება ${answer}.`,
  }),
  // g4-u17-96 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-96', subtopicId: 'u17-elimination', difficulty: 3 }),
    prompt: 'სამ უჯრაში რიცხვები {x}, {y} და {z} დგას. პირველში {x} არ არის, მესამეში {z} არ არის. რა რიცხვია მეორე უჯრაში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|4|6|4", "3|6|9|6", "4|8|12|8", "5|10|15|10", "1|2|3|2", "6|12|18|12", "7|14|21|14", "8|16|24|16", "9|18|27|18", "2|6|10|6", "3|9|15|9", "4|12|20|12", "5|15|25|15", "10|20|30|20", "11|22|33|22", "12|24|36|24", "6|18|30|18", "8|24|40|24"],
      },
      x: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      y: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      z: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[3]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `პირველში ${vars.x} არ არის, მესამეში ${vars.z} არ არის — მეორე უჯრაში რჩება ${answer}.`,
  }),
  // g4-u17-97 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-97', subtopicId: 'u17-elimination', difficulty: 3 }),
    prompt: '{n} ბავშვიდან {k} ტორტს არ ჭამს. რამდენი ბავშვი ჭამს ტორტს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|1|4", "6|2|4", "7|3|4", "8|4|4", "9|5|4", "10|6|4", "12|4|8", "15|5|10", "20|8|12", "11|3|8", "13|6|7", "14|7|7", "16|9|7", "18|12|6", "24|10|14", "25|13|12", "30|17|13", "35|19|16"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.n} − ${vars.k} = ${answer} ბავშვი ჭამს ტორტს.`,
  }),
  // g4-u17-98 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-98', subtopicId: 'u17-digit-finding', difficulty: 1 }),
    prompt: 'ორნიშნა რიცხვის ათეულების ციფრია {t}, ერთეულებისა კი {u}. რა რიცხვია?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|4|34", "5|2|52", "7|1|71", "2|6|26", "8|3|83", "4|9|49", "6|5|65", "9|7|97", "1|8|18", "5|6|56", "3|2|32", "7|4|74", "2|9|29", "8|1|81", "4|3|43", "6|8|68", "9|2|92", "1|5|15"],
      },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      u: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.t} ათეული და ${vars.u} ერთეული = ${answer}.`,
  }),
  // g4-u17-99 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u17-99', subtopicId: 'u17-digit-finding', difficulty: 1 }),
    prompt: 'რიცხვის ციფრთა ჯამია {s}, ხოლო ათეულების ციფრია {t}. იპოვე ერთეულების ციფრი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|7|4", "5|9|4", "7|8|1", "2|6|4", "8|12|4", "4|11|7", "6|10|4", "9|14|5", "1|4|3", "5|13|8", "3|10|7", "7|15|8", "2|8|6", "8|15|7", "4|7|3", "6|13|7", "9|12|3", "1|9|8"],
      },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.s} − ${vars.t} = ${answer}.`,
  }),
  // g4-u17-100 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-100', subtopicId: 'u17-digit-finding', difficulty: 2 }),
    prompt: 'ორნიშნა რიცხვი იწერება ციფრებით {a} და {b}. რამდენია ამ რიცხვის ციფრთა ჯამი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|4|7", "5|2|7", "7|1|8", "2|6|8", "8|3|11", "4|9|13", "6|5|11", "9|7|16", "1|8|9", "5|6|11", "3|2|5", "7|4|11", "2|9|11", "8|1|9", "4|3|7", "6|8|14", "9|2|11", "1|5|6"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),
  // g4-u17-101 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-101', subtopicId: 'u17-digit-finding', difficulty: 2 }),
    prompt: 'ორნიშნა რიცხვის ციფრთა ჯამია {s}, ციფრთა სხვაობა კი {d}. იპოვე ათეულების ციფრი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|1|2", "4|2|3", "5|3|4", "6|4|5", "7|5|6", "8|6|7", "9|7|8", "10|8|9", "5|1|3", "6|2|4", "7|3|5", "8|4|6", "9|5|7", "10|6|8", "11|7|9", "7|1|4", "8|2|5", "9|3|6"],
      },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ათეულების ციფრი = (${vars.s} + ${vars.d}) ÷ 2 = ${answer}.`,
  }),
  // g4-u17-102 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u17-102', subtopicId: 'u17-digit-finding', difficulty: 2 }),
    prompt: 'ორნიშნა რიცხვის ციფრთა ჯამია {s}, ციფრთა სხვაობა კი {d}. იპოვე ერთეულების ციფრი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|1|1", "4|2|1", "5|3|1", "6|4|1", "7|5|1", "8|6|1", "9|7|1", "10|8|1", "5|1|2", "6|2|2", "7|3|2", "8|4|2", "9|5|2", "10|6|2", "11|7|2", "7|1|3", "8|2|3", "9|3|3"],
      },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ერთეულების ციფრი = (${vars.s} − ${vars.d}) ÷ 2 = ${answer}.`,
  }),
  // g4-u17-103 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-103', subtopicId: 'u17-digit-finding', difficulty: 3 }),
    prompt: 'ორნიშნა რიცხვი იწყება {t}-ით და მისი ციფრთა ჯამია {s}. რა არის ეს რიცხვი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|7|34", "5|9|54", "7|8|71", "2|6|24", "8|12|84", "4|11|47", "6|10|64", "9|14|95", "1|4|13", "5|13|58", "3|10|37", "7|15|78", "2|8|26", "8|15|87", "4|7|43", "6|13|67", "9|12|93", "1|9|18"],
      },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `ათეულების ციფრი ${vars.t}, ერთეულებისა ${Number(vars.s) - Number(vars.t)}; რიცხვია ${answer}.`,
  }),
  // g4-u17-104 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-104', subtopicId: 'u17-digit-finding', difficulty: 3 }),
    prompt: 'სამნიშნა რიცხვის ასეულებია {h}, ათეულები — {t}, ერთეულები — {u}. რა რიცხვია?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1|2|3|123", "2|3|4|234", "3|4|5|345", "4|5|6|456", "5|6|7|567", "6|7|8|678", "7|8|9|789", "9|1|2|912", "8|2|3|823", "2|5|7|257", "4|1|9|419", "6|3|1|631", "5|2|8|528", "7|4|2|742", "3|8|6|386", "1|9|4|194", "9|6|3|963", "2|8|1|281"],
      },
      h: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      u: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[3]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 10),
    explanation: ({ vars, answer }) => `${vars.h} ასეული, ${vars.t} ათეული, ${vars.u} ერთეული = ${answer}.`,
  }),
  // g4-u17-105 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u17-105', subtopicId: 'u17-digit-finding', difficulty: 3 }),
    prompt: 'ორნიშნა რიცხვის ციფრთა ჯამია {s}. ციფრების ადგილების შეცვლით მიღებული რიცხვი პირველზე {d}-ით მეტია. იპოვე საწყისი რიცხვის ციფრთა სხვაობა.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|9|1", "4|18|2", "5|27|3", "6|36|4", "7|45|5", "8|54|6", "9|63|7", "10|72|8", "5|9|1", "6|18|2", "7|27|3", "8|36|4", "9|45|5", "10|54|6", "11|63|7", "7|9|1", "8|18|2", "9|27|3", "10|36|4", "11|45|5"],
      },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(String(v.spec).split('|')[2]),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ციფრების გაცვლა რიცხვს ზრდის 9 × (ციფრთა სხვაობა)-ით, ამიტომ სხვაობაა ${vars.d} ÷ 9 = ${answer}.`,
  }),
];
