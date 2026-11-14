import { defineTemplate } from './types';
import type { QuestionTemplate } from './types';

export const G2_U11_SUBTOPICS = [
  'u11-meters-and-centimeters',
  'u11-units-of-length',
  'u11-units-of-weight',
  'u11-thermometer',
  'u11-flat-and-solid-shapes',
  'u11-perimeter',
  'u11-counting-sides',
  'u11-counting-angles',
  'u11-grouping-by-sides',
  'u11-inside-and-outside',
  'u11-equal-shapes',
  'u11-symmetry',
  'u11-mixed-review',
] as const;

export type G2U11Subtopic = (typeof G2_U11_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G2U11Subtopic; difficulty: 1 | 2 | 3 }) => ({
  grade: 2 as const,
  topicId: 'g2-gazomva-geometria',
  unitId: 'g2-gazomva-geometria',
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

export const G2_U11_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U11.1 — მეტრი და სანტიმეტრი (Q01–Q06)
  // =========================================================================

  // Q01 — რამდენი სანტიმეტრია 1 მეტრში (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-01', subtopicId: 'u11-meters-and-centimeters', difficulty: 1 }),
    prompt: '{item} 1 მეტრი სიგრძისაა. რამდენი სანტიმეტრია ეს?',
    variables: {
      item: {
        kind: 'choice',
        values: [
          'ლენტი',
          'თოკი',
          'სახაზავი',
          'ქსოვილი',
          'ხის ჯოხი',
          'მავთული',
          'ზონარი',
          'შპალერი',
          'ძაფი',
          'ფიცარი',
          'მუყაო',
          'ქაღალდის ზოლი',
        ],
      },
    },
    answer: () => 100,
    format: { kind: 'integer', min: 1 },
    distractors: () => [10, 1000, 50],
    explanation: () => '1 მეტრი ზუსტად 100 სანტიმეტრია (1 მ = 100 სმ).',
  }),

  // Q02 — რამდენი სანტიმეტრია რამდენიმე მეტრში (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-02', subtopicId: 'u11-meters-and-centimeters', difficulty: 1 }),
    prompt: '{item} {m} მეტრი სიგრძისაა. რამდენი სანტიმეტრია ეს?',
    variables: {
      m: { kind: 'int', min: 2, max: 9 },
      item: { kind: 'choice', values: ['ლენტი', 'თოკი', 'მავთული', 'ქსოვილი'] },
    },
    answer: (v) => Number(v.m) * 100,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 100),
    explanation: ({ vars, answer }) =>
      `1 მ = 100 სმ, ამიტომ ${vars.m} მ = ${vars.m} × 100 = ${answer} სმ.`,
  }),

  // Q03 — მეტრისა და სანტიმეტრის გადაყვანა სანტიმეტრებში (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-03', subtopicId: 'u11-meters-and-centimeters', difficulty: 2 }),
    prompt: '{m} მეტრი და {cm} სანტიმეტრი რამდენი სანტიმეტრია?',
    variables: {
      m: { kind: 'int', min: 1, max: 4 },
      cm: { kind: 'choice', values: ['10', '15', '20', '25', '30', '40', '50', '60', '75', '80'] },
    },
    answer: (v) => Number(v.m) * 100 + Number(v.cm),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) =>
      `${vars.m} მ = ${Number(vars.m) * 100} სმ. ${Number(vars.m) * 100} + ${vars.cm} = ${answer} სმ.`,
  }),

  // Q04 — სანტიმეტრების დაშლა მეტრებად და სანტიმეტრებად (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-04', subtopicId: 'u11-meters-and-centimeters', difficulty: 2 }),
    prompt: '{total} სანტიმეტრი რამდენი მეტრი და სანტიმეტრია?',
    variables: {
      m: { kind: 'int', min: 1, max: 4 },
      cm: { kind: 'choice', values: ['15', '20', '35', '40', '50', '65', '80'] },
      total: { kind: 'choice', values: (v) => [Number(v.m) * 100 + Number(v.cm)] },
      correct: {
        kind: 'choice',
        values: (v) => [`${v.m} მეტრი და ${v.cm} სანტიმეტრი`],
      },
      w1: {
        kind: 'choice',
        values: (v) => [`${Number(v.m) + 1} მეტრი და ${v.cm} სანტიმეტრი`],
      },
      w2: {
        kind: 'choice',
        values: (v) => [`${v.m} მეტრი და ${Number(v.cm) + 10} სანტიმეტრი`],
      },
      w3: {
        kind: 'choice',
        values: (v) => [`${v.m} მეტრი და ${Number(v.cm) > 10 ? Number(v.cm) - 10 : 90} სანტიმეტრი`],
      },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.total} სმ = ${answer}.`,
  }),

  // Q05 — 1 მეტრამდე დარჩენილი სიგრძე (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-05', subtopicId: 'u11-meters-and-centimeters', difficulty: 3 }),
    prompt: '{item} {len} სმ სიგრძისაა. რამდენი სანტიმეტრი აკლია მას 1 მეტრამდე?',
    variables: {
      item: { kind: 'choice', values: ['ლენტი', 'თოკი', 'მავთული'] },
      len: {
        kind: 'choice',
        values: [
          '55', '60', '65', '70', '75', '80', '85', '90', '92', '95',
        ],
      },
    },
    answer: (v) => 100 - Number(v.len),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `1 მ = 100 სმ. 100 − ${vars.len} = ${answer} სმ.`,
  }),

  // Q06 — უდიდესი სიგრძის არჩევა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-06', subtopicId: 'u11-meters-and-centimeters', difficulty: 3 }),
    prompt: '{item}-ს სიგრძეებიდან რომელია ყველაზე დიდი?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          'ლენტები;1 მ;95 სმ;80 სმ;75 სმ',
          'თოკები;1 მ;90 სმ;85 სმ;70 სმ',
          'მავთულები;1 მ და 10 სმ;1 მ;95 სმ;80 სმ',
          'ქსოვილები;120 სმ;1 მ;90 სმ;80 სმ',
          'ზონრები;2 მ;150 სმ;180 სმ;190 სმ',
          'ჯოხები;1 მ და 20 სმ;100 სმ;95 სმ;110 სმ',
          'ბაწრები;1 მ და 30 სმ;1 მ და 15 სმ;120 სმ;105 სმ',
          'შპალერები;1 მ და 50 სმ;140 სმ;130 სმ;1 მ',
          'სადენები;2 მ და 10 სმ;2 მ;190 სმ;180 სმ',
          'ფიცრები;160 სმ;1 მ და 40 სმ;1 მ და 20 სმ;1 მ',
          'ქაღალდის ზოლები;1 მ და 5 სმ;100 სმ;98 სმ;90 სმ',
          'ლითონის ღეროები;180 სმ;1 მ და 70 სმ;150 სმ;140 სმ',
        ],
      },
      item: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `ჩამოთვლილთაგან უდიდესი სიგრძეა ${answer}.`,
  }),

  // =========================================================================
  // U11.2 — სიგრძის საზომი ერთეულები (Q07–Q12)
  // =========================================================================

  // Q07 — მცირე საგნისთვის ერთეულის არჩევა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-07', subtopicId: 'u11-units-of-length', difficulty: 1 }),
    prompt: 'რომელი ერთეულია უფრო შესაფერისი {itemGen} სიგრძის გასაზომად?',
    variables: {
      itemGen: {
        kind: 'choice',
        values: [
          'ფანქრის',
          'საშლელის',
          'კალმის',
          'რვეულის',
          'ტელეფონის',
          'კოვზის',
          'საკრედიტო ბარათის',
          'ასანთის კოლოფის',
          'ფუნჯის',
          'მაკრატლის',
          'გასაღების',
          'სანიშნის',
        ],
      },
    },
    answer: () => 'სანტიმეტრი',
    format: { kind: 'text' },
    distractors: () => ['მეტრი', 'კილოგრამი', 'ლიტრი'],
    explanation: ({ vars }) =>
      `${vars.itemGen} სიგრძე მცირეა, ამიტომ მისი გასაზომად მოსახერხებელია სანტიმეტრი.`,
  }),

  // Q08 — დიდი ობიექტისთვის ერთეულის არჩევა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-08', subtopicId: 'u11-units-of-length', difficulty: 1 }),
    prompt: 'რომელი ერთეულია უფრო შესაფერისი {placeGen} სიგრძის გასაზომად?',
    variables: {
      placeGen: {
        kind: 'choice',
        values: [
          'ოთახის',
          'საკლასო ოთახის',
          'დერეფნის',
          'სპორტდარბაზის',
          'ეზოს',
          'საფეხბურთო მოედნის',
          'ბაღის ბილიკის',
          'საკონცერტო დარბაზის',
          'ქუჩის მონაკვეთის',
          'სასკოლო ეზოს',
          'საცურაო აუზის',
          'სტადიონის',
        ],
      },
    },
    answer: () => 'მეტრი',
    format: { kind: 'text' },
    distractors: () => ['სანტიმეტრი', 'გრამი', 'წუთი'],
    explanation: ({ vars }) =>
      `${vars.placeGen} სიგრძე დიდია, ამიტომ მისი გასაზომად გამოიყენება მეტრი.`,
  }),

  // Q09 — თოკის ან ლენტის მეტრების გადაყვანა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-09', subtopicId: 'u11-units-of-length', difficulty: 2 }),
    prompt: '{itemGen} სიგრძეა {m} მ. რამდენი სანტიმეტრია ეს?',
    variables: {
      itemGen: { kind: 'choice', values: ['თოკის', 'ლენტის', 'მავთულის', 'ქსოვილის'] },
      m: { kind: 'int', min: 2, max: 8 },
    },
    answer: (v) => Number(v.m) * 100,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 100),
    explanation: ({ vars, answer }) =>
      `${vars.m} მ = ${vars.m} × 100 = ${answer} სმ.`,
  }),

  // Q10 — სიგრძეების შედარება (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-10', subtopicId: 'u11-units-of-length', difficulty: 2 }),
    prompt:
      '{itemA}-ს სიგრძეა {lenA} სმ, ხოლო {itemB}-ს სიგრძე — {lenB} სმ. რამდენი სანტიმეტრით გრძელია {itemA}?',
    variables: {
      pair: {
        kind: 'choice',
        values: [
          'მაგიდა;სკამი',
          'დაფა;მაგიდა',
          'კარადა;თარო',
          'დივანი;სავარძელი',
        ],
      },
      lenA: { kind: 'int', min: 110, max: 140 },
      lenB: { kind: 'int', min: 60, max: 90 },
      itemA: { kind: 'choice', values: (v) => [String(v.pair).split(';')[0]] },
      itemB: { kind: 'choice', values: (v) => [String(v.pair).split(';')[1]] },
    },
    answer: (v) => Number(v.lenA) - Number(v.lenB),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 10),
    explanation: ({ vars, answer }) =>
      `${vars.lenA} − ${vars.lenB} = ${answer} სმ.`,
  }),

  // Q11 — ორი ლენტის საერთო სიგრძე (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-11', subtopicId: 'u11-units-of-length', difficulty: 3 }),
    prompt:
      'პირველი ლენტი {a} სმ სიგრძისაა, მეორე ლენტი კი {b} სმ. რამდენია მათი საერთო სიგრძე?',
    variables: {
      a: { kind: 'int', min: 65, max: 95 },
      b: { kind: 'int', min: 60, max: 95 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 10),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer} სმ.`,
  }),

  // Q12 — კარების ან ობიექტის სიმაღლე (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-12', subtopicId: 'u11-units-of-length', difficulty: 3 }),
    prompt:
      '{objectGen} სიმაღლე დაახლოებით {m} მეტრია. რამდენი სანტიმეტრია {m} მეტრი?',
    variables: {
      objectGen: {
        kind: 'choice',
        values: [
          'სახლის კარების',
          'ოთახის კარების',
          'მაღალი კარადის',
          'ჭიშკრის',
        ],
      },
      m: { kind: 'int', min: 2, max: 7 },
    },
    answer: (v) => Number(v.m) * 100,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 100),
    explanation: ({ vars, answer }) =>
      `${vars.m} მეტრი არის ${vars.m} × 100 = ${answer} სანტიმეტრი.`,
  }),

  // =========================================================================
  // U11.3 — წონის საზომი ერთეულები (Q13–Q18)
  // =========================================================================

  // Q13 — ხილის ან მცირე ნივთის წონის ერთეული (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-13', subtopicId: 'u11-units-of-weight', difficulty: 1 }),
    prompt: 'რომელი ერთეული გამოიყენება {itemGen} წონის გასაზომად?',
    variables: {
      itemGen: {
        kind: 'choice',
        values: [
          'ვაშლის',
          'მსხლის',
          'ატმის',
          'ფორთოხლის',
          'კანფეტის',
          'ფანქრის',
          'საშლელის',
          'კაკლის',
          'ლიმონის',
          'კივის',
          'ბანანის',
          'შოკოლადის ფილის',
        ],
      },
    },
    answer: () => 'გრამი',
    format: { kind: 'text' },
    distractors: () => ['მეტრი', 'სანტიმეტრი', 'საათი'],
    explanation: () =>
      'მცირე მასის საგნების წონა იზომება გრამებში.',
  }),

  // Q14 — 1 კილოგრამში გრამების რაოდენობა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-14', subtopicId: 'u11-units-of-weight', difficulty: 1 }),
    prompt: '1 კილოგრამ {pack}-ში რამდენი გრამია?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          'შაქარ',
          'ფქვილ',
          'ბრინჯ',
          'ყავა',
          'მარილ',
          'ხორბალ',
          'წიწიბურა',
          'მანანის ბურღულ',
          'შვრია',
          'თაფლ',
          'კარაქ',
          'ყველ',
        ],
      },
    },
    answer: () => 1000,
    format: { kind: 'integer', min: 1 },
    distractors: () => [100, 10, 500],
    explanation: () => '1 კილოგრამი ზუსტად 1000 გრამია (1 კგ = 1000 გ).',
  }),

  // Q15 — რამდენიმე ჩანთის საერთო წონა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-15', subtopicId: 'u11-units-of-weight', difficulty: 2 }),
    prompt:
      '{item} {w} კგ-ს იწონის. რამდენი კილოგრამია {count} ასეთი {itemGen} საერთო წონა?',
    variables: {
      itemPair: {
        kind: 'choice',
        values: [
          'ჩანთა;ჩანთის',
          'ყუთი;ყუთის',
          'ტომარა;ტომრის',
          'პაკეტი;პაკეტის',
        ],
      },
      w: { kind: 'int', min: 2, max: 5 },
      count: { kind: 'choice', values: ['2', '3', '4'] },
      item: { kind: 'choice', values: (v) => [String(v.itemPair).split(';')[0]] },
      itemGen: { kind: 'choice', values: (v) => [String(v.itemPair).split(';')[1]] },
    },
    answer: (v) => Number(v.w) * Number(v.count),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.count} × ${vars.w} = ${answer} კგ.`,
  }),

  // Q16 — წონების შედარება კილოგრამებში (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-16', subtopicId: 'u11-units-of-weight', difficulty: 2 }),
    prompt:
      '{itemA} {wA} კგ-ს იწონის, {itemB} კი {wB} კგ-ს. რამდენი კილოგრამით მძიმეა {itemA}?',
    variables: {
      pair: {
        kind: 'choice',
        values: [
          'საზამთრო;ნესვი',
          'გოგრა;ნესვი',
          'ტომარა;ყუთი',
          'ჩანთა;პაკეტი',
        ],
      },
      wA: { kind: 'int', min: 5, max: 12 },
      wB: { kind: 'int', min: 2, max: 4 },
      itemA: { kind: 'choice', values: (v) => [String(v.pair).split(';')[0]] },
      itemB: { kind: 'choice', values: (v) => [String(v.pair).split(';')[1]] },
    },
    answer: (v) => Number(v.wA) - Number(v.wB),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.wA} − ${vars.wB} = ${answer} კილოგრამით.`,
  }),

  // Q17 — გრამების შეკრება (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-17', subtopicId: 'u11-units-of-weight', difficulty: 3 }),
    prompt:
      'ერთი პაკეტი {wA} გრამს იწონის, მეორე — {wB} გრამს. რამდენია მათი საერთო წონა?',
    variables: {
      wA: { kind: 'choice', values: ['200', '250', '300', '350', '400', '450', '500'] },
      wB: { kind: 'choice', values: ['150', '200', '250', '300', '350', '400'] },
    },
    answer: (v) => Number(v.wA) + Number(v.wB),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 50, 50),
    explanation: ({ vars, answer }) =>
      `${vars.wA} + ${vars.wB} = ${answer} გრამი.`,
  }),

  // Q18 — უფრო მძიმეს პოვნა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-18', subtopicId: 'u11-units-of-weight', difficulty: 3 }),
    prompt: '{item}-ს წონებიდან რომელია ყველაზე მძიმე?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          'პაკეტები;1 კგ;900 გ;750 გ;850 გ',
          'ჩანთები;1 კგ;800 გ;650 გ;950 გ',
          'ყუთები;1 კგ და 200 გ;1 კგ;900 გ;800 გ',
          'ტომრები;1500 გ;1 კგ;900 გ;1200 გ',
          'საზამთროები;2 კგ;1800 გ;1500 გ;1900 გ',
          'ნესვები;1 კგ;500 გ;700 გ;800 გ',
          'გოგრები;2 კგ და 100 გ;2 კგ;1800 გ;1900 გ',
          'კალათები;1300 გ;1 კგ;850 გ;950 გ',
          'ფქვილის ტომრები;1400 გ;1200 გ;1 კგ;900 გ',
          'შაქრის პაკეტები;1100 გ;1 კგ;800 გ;900 გ',
          'ბურღულის ყუთები;1600 გ;1500 გ;1 კგ;1200 გ',
          'ვაშლის კალათები;2500 გ;2 კგ;1800 გ;1900 გ',
        ],
      },
      item: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `ჩამოთვლილთაგან ყველაზე მძიმეა ${answer}.`,
  }),

  // =========================================================================
  // U11.4 — თერმომეტრი და ტემპერატურა (Q19–Q24)
  // =========================================================================

  // Q19 — ტემპერატურის მომატება (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-19', subtopicId: 'u11-thermometer', difficulty: 1 }),
    prompt:
      'დილით ტემპერატურა {t1}°C იყო, შუადღეს კი {t2}°C გახდა. რამდენი გრადუსით მოიმატა ტემპერატურამ?',
    variables: {
      t1: { kind: 'int', min: 8, max: 15 },
      diff: { kind: 'int', min: 4, max: 10 },
      t2: { kind: 'choice', values: (v) => [Number(v.t1) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.t2} − ${vars.t1} = ${answer} გრადუსით.`,
  }),

  // Q20 — ნულზე დაბალი ტემპერატურა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-20', subtopicId: 'u11-thermometer', difficulty: 1 }),
    prompt:
      'თერმომეტრი აჩვენებს −{below}°C-ს. ეს ტემპერატურა ნულზე რამდენი გრადუსით დაბალია?',
    variables: {
      below: { kind: 'int', min: 1, max: 12 },
    },
    answer: (v) => Number(v.below),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `−${vars.below}°C ნულზე ${answer} გრადუსით დაბალია.`,
  }),

  // Q21 — ტემპერატურის დაკლება (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-21', subtopicId: 'u11-thermometer', difficulty: 2 }),
    prompt:
      'დილით {t1}°C იყო, საღამოს კი {t2}°C. რამდენი გრადუსით დაიკლო ტემპერატურამ?',
    variables: {
      t1: { kind: 'int', min: 12, max: 22 },
      drop: { kind: 'int', min: 3, max: 9 },
      t2: { kind: 'choice', values: (v) => [Number(v.t1) - Number(v.drop)] },
    },
    answer: (v) => Number(v.drop),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.t1} − ${vars.t2} = ${answer} გრადუსით.`,
  }),

  // Q22 — ყველაზე მაღალი ტემპერატურა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-22', subtopicId: 'u11-thermometer', difficulty: 2 }),
    prompt: '{city}-ში გაზომილ ტემპერატურათაგან რომელია ყველაზე მაღალი?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          'თბილის;14°C;6°C;9°C;11°C',
          'ბათუმ;19°C;12°C;15°C;8°C',
          'ქუთაის;22°C;17°C;19°C;14°C',
          'რუსთავ;16°C;5°C;10°C;13°C',
          'თელავ;25°C;18°C;21°C;16°C',
          'გორ;18°C;7°C;11°C;14°C',
          'ზუგდიდ;20°C;11°C;14°C;16°C',
          'ფოთ;21°C;13°C;15°C;17°C',
          'ახალციხ;17°C;8°C;12°C;10°C',
          'ოზურგეთ;23°C;15°C;18°C;19°C',
          'მცხეთ;15°C;6°C;9°C;12°C',
          'სიღნაღ;24°C;16°C;19°C;20°C',
        ],
      },
      city: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `ყველაზე მაღალი ტემპერატურაა ${answer}.`,
  }),

  // Q23 — ტემპერატურის დაცემა და ახალი მაჩვენებელი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-23', subtopicId: 'u11-thermometer', difficulty: 3 }),
    prompt:
      'თერმომეტრი აჩვენებს {t}°C-ს. ტემპერატურა {drop} გრადუსით დაეცა. რა ტემპერატურაა ახლა?',
    variables: {
      t: { kind: 'int', min: 14, max: 24 },
      drop: { kind: 'int', min: 4, max: 9 },
    },
    answer: (v) => Number(v.t) - Number(v.drop),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0),
    explanation: ({ vars, answer }) =>
      `${vars.t} − ${vars.drop} = ${answer}°C.`,
  }),

  // Q24 — უარყოფითიდან დადებითამდე მომატება (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-24', subtopicId: 'u11-thermometer', difficulty: 3 }),
    prompt:
      'ტემპერატურა −{below}°C-დან {above}°C-მდე გაიზარდა. რამდენი გრადუსით მოიმატა?',
    variables: {
      below: { kind: 'int', min: 1, max: 6 },
      above: { kind: 'int', min: 2, max: 8 },
    },
    answer: (v) => Number(v.below) + Number(v.above),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `ნულამდე მოიმატა ${vars.below}°C, ნულიდან ზემოთ კი კიდევ ${vars.above}°C. ${vars.below} + ${vars.above} = ${answer} გრადუსით.`,
  }),

  // =========================================================================
  // U11.5 — ბრტყელი და სივრცული ფიგურები (Q25–Q30)
  // =========================================================================

  // Q25 — სამკუთხედის გვერდები (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-25', subtopicId: 'u11-flat-and-solid-shapes', difficulty: 1 }),
    prompt: '{child}-მ რვეულში სამკუთხედი დახაზა. რამდენი გვერდი აქვს ამ სამკუთხედს?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => 3,
    format: { kind: 'integer', min: 1 },
    distractors: () => [4, 5, 2],
    explanation: () => 'სამკუთხედს ზუსტად 3 გვერდი აქვს.',
  }),

  // Q26 — სივრცული ფიგურის ამოცნობა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-26', subtopicId: 'u11-flat-and-solid-shapes', difficulty: 1 }),
    prompt: '{child}-ს აინტერესებს, რომელი ფიგურაა სივრცული?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
      solid: { kind: 'choice', values: ['კუბი', 'სფერო', 'ცილინდრი', 'პირამიდა'] },
    },
    answer: (v) => String(v.solid),
    format: { kind: 'text' },
    distractors: () => ['კვადრატი', 'სამკუთხედი', 'წრე'],
    explanation: ({ answer }) =>
      `${answer} არის სივრცითი (მოცულობითი) ფიგურა, ხოლო კვადრატი, სამკუთხედი და წრე — ბრტყელი ფიგურებია.`,
  }),

  // Q27 — კუბის წახნაგები (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-27', subtopicId: 'u11-flat-and-solid-shapes', difficulty: 2 }),
    prompt: 'რამდენი წახნაგი აქვს {item}?',
    variables: {
      item: {
        kind: 'choice',
        values: [
          'კუბს',
          'სათამაშო კამათელს',
          'კუბის ფორმის ყუთს',
          'კუბის ფორმის აკვარიუმს',
          'ხის კუბს',
          'პლასტმასის კუბს',
          'კუბურ კონტეინერს',
          'რუბიკის კუბს',
          'შაქრის კუბს',
          'კუბის ფორმის ოთახს',
          'ყინულის კუბს',
          'კუბის ფორმის საჩუქარს',
        ],
      },
    },
    answer: () => 6,
    format: { kind: 'integer', min: 1 },
    distractors: () => [8, 12, 4],
    explanation: () => 'კუბს აქვს 6 კვადრატული წახნაგი.',
  }),

  // Q28 — მართკუთხედის გვერდები (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-28', subtopicId: 'u11-flat-and-solid-shapes', difficulty: 2 }),
    prompt: 'რამდენი გვერდი აქვს {shapeName}?',
    variables: {
      shapeName: {
        kind: 'choice',
        values: [
          'მართკუთხედს',
          'კვადრატს',
          'რომბს',
          'ტრაპეციას',
          'ოთხკუთხედს',
          'მართკუთხა დაფას',
          'კვადრატულ ფილას',
          'რომბისებურ ფიგურას',
          'ტრაპეციის ფორმის მაგიდას',
          'მართკუთხა ფურცელს',
          'კვადრატულ სარკეს',
          'ოთხკუთხა ხალიჩას',
        ],
      },
    },
    answer: () => 4,
    format: { kind: 'integer', min: 1 },
    distractors: () => [3, 5, 6],
    explanation: ({ vars }) => `${vars.shapeName} აქვს 4 გვერდი.`,
  }),

  // Q29 — რეალური საგნის ფორმის დაკავშირება ფიგურასთან (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-29', subtopicId: 'u11-flat-and-solid-shapes', difficulty: 3 }),
    prompt: 'რომელი საგანი ჰგავს ყველაზე მეტად {shapeName}-ს?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          'სფეროს;ბურთი;წიგნი;აგური;ყუთი',
          'კუბს;კამათელი;ფანქარი;თეფში;მმართველი',
          'ცილინდრს;კონსერვის ქილა;ბურთი;პირამიდა;ფურცელი',
          'სფეროს;ფორთოხალი;წიგნი;კარადის კარი;ყუთი',
          'კუბს;რუბიკის კუბი;ბურთი;სახაზავი;ფირფიტა',
          'ცილინდრს;მილაკი;წიგნი;აგური;სამკუთხედი',
          'სფეროს;გლობუსი;კარადა;რვეული;დაფა',
          'კუბს;ყუთი;საათის ციფერბლატი;თეფში;მავთული',
          'ცილინდრს;ჭიქა;ფურცელი;სარკე;სამკუთხედი',
          'სფეროს;საზამთრო;აგური;წიგნი;ტელეფონი',
          'კუბს;ყინულის კუბი;თეფში;ბურთი;სახაზავი',
          'ცილინდრს;ბატარეა;ფანჯარა;კარი;წიგნი',
        ],
      },
      shapeName: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${answer} ფორმით ყველაზე მეტად ჰგავს ${vars.shapeName}.`,
  }),

  // Q30 — კუბის წვეროები (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-30', subtopicId: 'u11-flat-and-solid-shapes', difficulty: 3 }),
    prompt: 'რამდენი წვერო აქვს {item}?',
    variables: {
      item: {
        kind: 'choice',
        values: [
          'კუბს',
          'სათამაშო კამათელს',
          'კუბის ფორმის ოთახს',
          'ხის კუბს',
          'პლასტმასის კუბს',
          'კუბის ფორმის ყუთს',
          'რუბიკის კუბს',
          'კუბურ აკვარიუმს',
          'კუბურ კონტეინერს',
          'კუბის ფორმის საჩუქარს',
          'კუბის ფორმის ჩარჩოს',
          'ყინულის კუბს',
        ],
      },
    },
    answer: () => 8,
    format: { kind: 'integer', min: 1 },
    distractors: () => [6, 12, 4],
    explanation: () => 'კუბს აქვს 8 წვერო (4 ზემოთ და 4 ქვემოთ).',
  }),

  // =========================================================================
  // U11.6 — პერიმეტრი (Q31–Q36)
  // =========================================================================

  // Q31 — კვადრატის პერიმეტრი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-31', subtopicId: 'u11-perimeter', difficulty: 1 }),
    prompt: 'კვადრატის თითოეული გვერდი {a} სმ-ია. იპოვე პერიმეტრი.',
    variables: {
      a: { kind: 'int', min: 3, max: 18 },
    },
    answer: (v) => Number(v.a) * 4,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `კვადრატს 4 ტოლი გვერდი აქვს: 4 × ${vars.a} = ${answer} სმ.`,
  }),

  // Q32 — მართკუთხედის პერიმეტრი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-32', subtopicId: 'u11-perimeter', difficulty: 1 }),
    prompt:
      'მართკუთხედის სიგრძეა {a} სმ, სიგანე — {b} სმ. იპოვე პერიმეტრი.',
    variables: {
      a: { kind: 'int', min: 4, max: 12 },
      b: { kind: 'int', min: 2, max: 7 },
    },
    answer: (v) => 2 * (Number(v.a) + Number(v.b)),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `P = 2 × (${vars.a} + ${vars.b}) = 2 × ${Number(vars.a) + Number(vars.b)} = ${answer} სმ.`,
  }),

  // Q33 — სამკუთხედის პერიმეტრი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-33', subtopicId: 'u11-perimeter', difficulty: 2 }),
    prompt:
      'სამკუთხედის გვერდებია {a} სმ, {b} სმ და {c} სმ. იპოვე პერიმეტრი.',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      b: { kind: 'int', min: 4, max: 9 },
      c: { kind: 'int', min: 4, max: 10 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} = ${answer} სმ.`,
  }),

  // Q34 — კვადრატის გვერდი პერიმეტრის მიხედვით (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-34', subtopicId: 'u11-perimeter', difficulty: 2 }),
    prompt: 'კვადრატის პერიმეტრია {p} სმ. რამდენია ერთი გვერდის სიგრძე?',
    variables: {
      side: { kind: 'int', min: 3, max: 18 },
      p: { kind: 'choice', values: (v) => [Number(v.side) * 4] },
    },
    answer: (v) => Number(v.side),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.p} : 4 = ${answer} სმ.`,
  }),

  // Q35 — მართკუთხედის პერიმეტრი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-35', subtopicId: 'u11-perimeter', difficulty: 3 }),
    prompt:
      'მართკუთხედის სიგრძეა {a} სმ, სიგანე — {b} სმ. რამდენია პერიმეტრი?',
    variables: {
      a: { kind: 'int', min: 7, max: 16 },
      b: { kind: 'int', min: 2, max: 8 },
    },
    answer: (v) => 2 * (Number(v.a) + Number(v.b)),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `2 × (${vars.a} + ${vars.b}) = ${answer} სმ.`,
  }),

  // Q36 — ოთხკუთხედის პერიმეტრი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-36', subtopicId: 'u11-perimeter', difficulty: 3 }),
    prompt:
      'ფიგურის გვერდებია {a} სმ, {b} სმ, {c} სმ და {d} სმ. იპოვე პერიმეტრი.',
    variables: {
      a: { kind: 'int', min: 3, max: 8 },
      b: { kind: 'int', min: 3, max: 8 },
      c: { kind: 'int', min: 3, max: 8 },
      d: { kind: 'int', min: 3, max: 8 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} = ${answer} სმ.`,
  }),

  // =========================================================================
  // U11.7 — გვერდების დათვლა (Q37–Q42)
  // =========================================================================

  // Q37 — ხუთკუთხედის გვერდები (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-37', subtopicId: 'u11-counting-sides', difficulty: 1 }),
    prompt: '{child}-მ დაფაზე ხუთკუთხედი დახაზა. რამდენი გვერდი აქვს ამ ფიგურას?',
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
    distractors: () => [4, 6, 7],
    explanation: () => 'ხუთკუთხედს ზუსტად 5 გვერდი აქვს.',
  }),

  // Q38 — ექვსკუთხედის გვერდები (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-38', subtopicId: 'u11-counting-sides', difficulty: 1 }),
    prompt: '{child}-მ ფურცელზე ექვსკუთხედი დახაზა. რამდენი გვერდი აქვს ამ ფიგურას?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => 6,
    format: { kind: 'integer', min: 1 },
    distractors: () => [5, 7, 8],
    explanation: () => 'ექვსკუთხედს ზუსტად 6 გვერდი აქვს.',
  }),

  // Q39 — რომელი ფიგურაა ოთხკუთხედი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-39', subtopicId: 'u11-counting-sides', difficulty: 2 }),
    prompt: '{child} ეძებს ოთხკუთხედს. ჩამოთვლილთაგან რომელი ფიგურაა ოთხკუთხედი?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
      correctQuad: {
        kind: 'choice',
        values: ['კვადრატი', 'მართკუთხედი', 'რომბი', 'ტრაპეცია'],
      },
    },
    answer: (v) => String(v.correctQuad),
    format: { kind: 'text' },
    distractors: () => ['სამკუთხედი', 'ხუთკუთხედი', 'ექვსკუთხედი'],
    explanation: ({ answer }) =>
      `${answer} არის ოთხკუთხედი, რადგან მას აქვს 4 გვერდი.`,
  }),

  // Q40 — გვერდების სხვაობა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-40', subtopicId: 'u11-counting-sides', difficulty: 2 }),
    prompt:
      'სამკუთხედს 3 გვერდი აქვს. რამდენი გვერდით მეტი აქვს {shapeName}-ს?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          'ხუთკუთხედ;5;2',
          'ექვსკუთხედ;6;3',
          'რვაკუთხედ;8;5',
          'შვიდკუთხედ;7;4',
          'ცხრაკუთხედ;9;6',
          'ათკუთხედ;10;7',
          'თერთმეტკუთხედ;11;8',
          'თორმეტკუთხედ;12;9',
          'ხუთკუთხა ვარსკვლავურ ფიგურას;5;2',
          'ექვსკუთხა ფიგურას;6;3',
          'რვაკუთხა ნიშანს;8;5',
          'შვიდკუთხა ორნამენტს;7;4',
        ],
      },
      shapeName: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      sides: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.sides} − 3 = ${answer} გვერდით მეტი.`,
  }),

  // Q41 — რვაკუთხედის ან მრავალკუთხედის გვერდები (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-41', subtopicId: 'u11-counting-sides', difficulty: 3 }),
    prompt: 'რამდენი გვერდი აქვს {polyName}-ს?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          'რვაკუთხედ;8',
          'შვიდკუთხედ;7',
          'ცხრაკუთხედ;9',
          'ათკუთხედ;10',
          'თერთმეტკუთხედ;11',
          'თორმეტკუთხედ;12',
          'ხუთკუთხედ;5',
          'ექვსკუთხედ;6',
          'რვაკუთხა საგზაო ნიშან;8',
          'ათკუთხა ვარსკვლავ;10',
          'შვიდკუთხა მონეტა;7',
          'ცხრაკუთხა ფიგურა;9',
        ],
      },
      polyName: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      sides: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
    },
    answer: (v) => Number(v.sides),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.polyName}-ს აქვს ${answer} გვერდი.`,
  }),

  // Q42 — უდიდესი გვერდების მქონე ფიგურა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-42', subtopicId: 'u11-counting-sides', difficulty: 3 }),
    prompt: '{child}-ს აინტერესებს: რომელი ფიგურის გვერდების რაოდენობაა ყველაზე დიდი?',
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
          'ექვსკუთხედი;სამკუთხედი;ოთხკუთხედი;ხუთკუთხედი',
          'რვაკუთხედი;ხუთკუთხედი;ექვსკუთხედი;ოთხკუთხედი',
          'ათკუთხედი;ექვსკუთხედი;შვიდკუთხედი;რვაკუთხედი',
          'შვიდკუთხედი;სამკუთხედი;ხუთკუთხედი;ექვსკუთხედი',
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
      `ყველაზე მეტი გვერდი აქვს ${answer}-ს.`,
  }),

  // =========================================================================
  // U11.8 — კუთხეების დათვლა (Q43–Q48)
  // =========================================================================

  // Q43 — სამკუთხედის კუთხეები (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-43', subtopicId: 'u11-counting-angles', difficulty: 1 }),
    prompt: '{child} დააკვირდა სამკუთხედს. რამდენი კუთხე აქვს მას?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => 3,
    format: { kind: 'integer', min: 1 },
    distractors: () => [4, 5, 2],
    explanation: () => 'სამკუთხედს აქვს 3 კუთხე.',
  }),

  // Q44 — კვადრატის კუთხეები (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-44', subtopicId: 'u11-counting-angles', difficulty: 1 }),
    prompt: '{child} დააკვირდა {shape}-ს. რამდენი კუთხე აქვს მას?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
        ],
      },
      shape: { kind: 'choice', values: ['კვადრატ', 'მართკუთხედ'] },
    },
    answer: () => 4,
    format: { kind: 'integer', min: 1 },
    distractors: () => [3, 5, 6],
    explanation: ({ vars }) => `${vars.shape}-ს აქვს 4 კუთხე.`,
  }),

  // Q45 — ხუთკუთხედის კუთხეები (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-45', subtopicId: 'u11-counting-angles', difficulty: 2 }),
    prompt: '{child} დააკვირდა ხუთკუთხედს. რამდენი კუთხე აქვს მას?',
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
    distractors: () => [4, 6, 7],
    explanation: () => 'ხუთკუთხედს აქვს 5 კუთხე.',
  }),

  // Q46 — კუთხეების სხვაობა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-46', subtopicId: 'u11-counting-angles', difficulty: 2 }),
    prompt:
      'მართკუთხედს 4 კუთხე აქვს. რამდენი კუთხით მეტი აქვს {shapeName}-ს?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          'ექვსკუთხედ;6;2',
          'ხუთკუთხედ;5;1',
          'რვაკუთხედ;8;4',
          'შვიდკუთხედ;7;3',
          'ცხრაკუთხედ;9;5',
          'ათკუთხედ;10;6',
          'თერთმეტკუთხედ;11;7',
          'თორმეტკუთხედ;12;8',
          'ექვსკუთხა ფიგურას;6;2',
          'ხუთკუთხა ვარსკვლავს;5;1',
          'რვაკუთხა ნიშანს;8;4',
          'შვიდკუთხა ფორმას;7;3',
        ],
      },
      shapeName: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      angles: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      diff: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.angles} − 4 = ${answer} კუთხით მეტი.`,
  }),

  // Q47 — კონკრეტული რაოდენობის კუთხის მქონე ფიგურა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-47', subtopicId: 'u11-counting-angles', difficulty: 3 }),
    prompt: 'რომელი ფიგურაა {k} კუთხის მქონე?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '3;სამკუთხედი;კვადრატი;ხუთკუთხედი;ექვსკუთხედი',
          '4;კვადრატი;სამკუთხედი;ხუთკუთხედი;ექვსკუთხედი',
          '5;ხუთკუთხედი;სამკუთხედი;კვადრატი;ექვსკუთხედი',
          '6;ექვსკუთხედი;სამკუთხედი;კვადრატი;ხუთკუთხედი',
          '3;ტოლგვერდა სამკუთხედი;რომბი;ხუთკუთხედი;ექვსკუთხედი',
          '4;მართკუთხედი;სამკუთხედი;ხუთკუთხედი;ექვსკუთხედი',
          '5;წესიერი ხუთკუთხედი;სამკუთხედი;კვადრატი;ექვსკუთხედი',
          '6;წესიერი ექვსკუთხედი;სამკუთხედი;კვადრატი;ხუთკუთხედი',
          '4;რომბი;სამკუთხედი;ხუთკუთხედი;ექვსკუთხედი',
          '4;ტრაპეცია;სამკუთხედი;ხუთკუთხედი;ექვსკუთხედი',
          '3;მართკუთხა სამკუთხედი;კვადრატი;ხუთკუთხედი;ექვსკუთხედი',
          '5;ხუთკუთხა ფიგურა;სამკუთხედი;კვადრატი;ექვსკუთხედი',
        ],
      },
      k: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.k} კუთხე აქვს ${answer}-ს.`,
  }),

  // Q48 — გვერდებისა და კუთხეების ტოლობა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-48', subtopicId: 'u11-counting-angles', difficulty: 3 }),
    prompt:
      'ფიგურას {k} გვერდი და {k} კუთხე აქვს. რამდენი კუთხე აქვს მას?',
    variables: {
      k: { kind: 'int', min: 3, max: 14 },
    },
    answer: (v) => Number(v.k),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ answer }) =>
      `პირობის თანახმად, ფიგურას აქვს ${answer} კუთხე.`,
  }),

  // =========================================================================
  // U11.9 — ფიგურების დაჯგუფება გვერდების მიხედვით (Q49–Q54)
  // =========================================================================

  // Q49 — 3 გვერდის მქონე ჯგუფი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-49', subtopicId: 'u11-grouping-by-sides', difficulty: 1 }),
    prompt: '{child} ფიგურებს ახარისხებს. რომელი ფიგურა უნდა მოხვდეს ჯგუფში „3 გვერდი“?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => 'სამკუთხედი',
    format: { kind: 'text' },
    distractors: () => ['კვადრატი', 'ხუთკუთხედი', 'მართკუთხედი'],
    explanation: () =>
      'სამკუთხედს 3 გვერდი აქვს, ამიტომ ის ხვდება ჯგუფში „3 გვერდი“.',
  }),

  // Q50 — ოთხკუთხედების ჯგუფი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-50', subtopicId: 'u11-grouping-by-sides', difficulty: 1 }),
    prompt: '{child}-მ უნდა აარჩიოს ფიგურა ოთხკუთხედების ჯგუფისთვის. რომელი ფიგურა ეკუთვნის ამ ჯგუფს?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
        ],
      },
      quad: { kind: 'choice', values: ['კვადრატი', 'მართკუთხედი', 'რომბი', 'ტრაპეცია'] },
    },
    answer: (v) => String(v.quad),
    format: { kind: 'text' },
    distractors: () => ['სამკუთხედი', 'ხუთკუთხედი', 'წრე'],
    explanation: ({ answer }) =>
      `${answer} არის ოთხკუთხედი და ეკუთვნის ამ ჯგუფს.`,
  }),

  // Q51 — 6 გვერდის მქონე ფიგურის ჯგუფი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-51', subtopicId: 'u11-grouping-by-sides', difficulty: 2 }),
    prompt: '{child}-მ დახაზა ფიგურა, რომელსაც {k} გვერდი აქვს. რომელ ჯგუფში უნდა მოხვდეს?',
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
          '6;ექვსკუთხედები;სამკუთხედები;ოთხკუთხედები;ხუთკუთხედები',
          '5;ხუთკუთხედები;სამკუთხედები;ოთხკუთხედები;ექვსკუთხედები',
          '4;ოთხკუთხედები;სამკუთხედები;ხუთკუთხედები;ექვსკუთხედები',
          '3;სამკუთხედები;ოთხკუთხედები;ხუთკუთხედები;ექვსკუთხედები',
          '7;შვიდკუთხედები;სამკუთხედები;ოთხკუთხედები;ხუთკუთხედები',
          '8;რვაკუთხედები;სამკუთხედები;ოთხკუთხედები;ექვსკუთხედები',
        ],
      },
      k: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.k} გვერდის მქონე ფიგურა ხვდება ჯგუფში „${answer}“.`,
  }),

  // Q52 — ჯგუფის წევრის გვერდების რაოდენობა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-52', subtopicId: 'u11-grouping-by-sides', difficulty: 2 }),
    prompt:
      '{child}-ს აინტერესებს: რამდენი გვერდი აქვს ფიგურას, რომელიც {groupName}-ის ჯგუფშია?',
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
          'ოთხკუთხედებ;4;3;5;6',
          'ხუთკუთხედებ;5;3;4;6',
          'ექვსკუთხედებ;6;4;5;7',
          'სამკუთხედებ;3;4;5;6',
          'შვიდკუთხედებ;7;5;6;8',
          'რვაკუთხედებ;8;6;7;9',
          'ცხრაკუთხედებ;9;7;8;10',
          'ათკუთხედებ;10;8;9;11',
        ],
      },
      groupName: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 1 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.groupName}ის ჯგუფში მყოფ ფიგურას აქვს ${answer} გვერდი.`,
  }),

  // Q53 — რომელი ფიგურა არ ეკუთვნის ჯგუფს (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-53', subtopicId: 'u11-grouping-by-sides', difficulty: 3 }),
    prompt: 'რომელი ფიგურა არ ეკუთვნის {groupName}-ის ჯგუფს?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          'ოთხკუთხედებ;სამკუთხედი;კვადრატი;მართკუთხედი;რომბი',
          'სამკუთხედებ;კვადრატი;ტოლგვერდა სამკუთხედი;ტოლფერდა სამკუთხედი;მართკუთხა სამკუთხედი',
          'ოთხკუთხედებ;ხუთკუთხედი;კვადრატი;მართკუთხედი;ტრაპეცია',
          'ხუთკუთხედებ;ექვსკუთხედი;ხუთკუთხედი;ხუთქიმიანი ფიგურა;ხუთგვერდიანი მრავალკუთხედი',
          'სამკუთხედებ;რომბი;სამკუთხედი;ტოლგვერდა სამკუთხედი;მართკუთხა სამკუთხედი',
          'ოთხკუთხედებ;წრე;კვადრატი;მართკუთხედი;რომბი',
          'ხუთკუთხედებ;სამკუთხედი;ხუთკუთხედი;ხუთქიმიანი ფიგურა;ხუთგვერდიანი მრავალკუთხედი',
          'ექვსკუთხედებ;კვადრატი;ექვსკუთხედი;ექვსგვერდიანი ფიგურა;წესიერი ექვსკუთხედი',
          'ოთხკუთხედებ;ექვსკუთხედი;კვადრატი;რომბი;ტრაპეცია',
          'სამკუთხედებ;ტრაპეცია;სამკუთხედი;ტოლფერდა სამკუთხედი;მართკუთხა სამკუთხედი',
          'ხუთკუთხედებ;კვადრატი;ხუთკუთხედი;ხუთქიმიანი ფიგურა;ხუთგვერდიანი მრავალკუთხედი',
          'ექვსკუთხედებ;სამკუთხედი;ექვსკუთხედი;ექვსგვერდიანი ფიგურა;წესიერი ექვსკუთხედი',
        ],
      },
      groupName: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${answer} არ ეკუთვნის ${vars.groupName}ის ჯგუფს.`,
  }),

  // Q54 — ჯგუფებს შორის ფიგურების რაოდენობის შედარება (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-54', subtopicId: 'u11-grouping-by-sides', difficulty: 3 }),
    prompt:
      'სამკუთხედების ჯგუფში {a} ფიგურაა, ოთხკუთხედების ჯგუფში კი {b}. რამდენი ფიგურით მეტია ოთხკუთხედების ჯგუფში?',
    variables: {
      a: { kind: 'int', min: 3, max: 8 },
      diff: { kind: 'int', min: 2, max: 8 },
      b: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.b} − ${vars.a} = ${answer} ფიგურით მეტი.`,
  }),

  // =========================================================================
  // U11.10 — შიგნით და გარეთ (Q55–Q60)
  // =========================================================================

  // Q55 — შიგნით და გარეთ არსებული საგნების საერთო რაოდენობა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-55', subtopicId: 'u11-inside-and-outside', difficulty: 1 }),
    prompt:
      '{shape}-ს შიგნით {a} {item}ა, გარეთ კი {b}. რამდენი {item}ა სულ?',
    variables: {
      shape: { kind: 'choice', values: ['წრის', 'კვადრატის', 'სამკუთხედის', 'მართკუთხედის'] },
      item: { kind: 'choice', values: ['ვარსკვლავი', 'წერტილი', 'წრე', 'ყვავილი'] },
      a: { kind: 'int', min: 3, max: 8 },
      b: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q56 — გარედან დამატებული საგნები (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-56', subtopicId: 'u11-inside-and-outside', difficulty: 1 }),
    prompt:
      '{shape}-ს შიგნით {a} {item}ა. გარეთ {b} {item} დაამატეს. რამდენი {item}ა {shape}-ს გარეთ?',
    variables: {
      shape: { kind: 'choice', values: ['კვადრატის', 'წრის', 'მართკუთხედის'] },
      item: { kind: 'choice', values: ['წრე', 'წერტილი', 'ვარსკვლავი', 'ფიგურა'] },
      a: { kind: 'int', min: 3, max: 8 },
      b: { kind: 'int', min: 2, max: 7 },
    },
    answer: (v) => Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `გარეთ დაამატეს ${answer} ${vars.item}, ამიტომ გარეთ არის ${answer}.`,
  }),

  // Q57 — შიგნით არსებული საგნების რაოდენობა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-57', subtopicId: 'u11-inside-and-outside', difficulty: 2 }),
    prompt:
      '{shape}-ს შიგნით {a} {item}ა, გარეთ — {b}. რამდენი {item}ა {shape}-ს შიგნით?',
    variables: {
      shape: { kind: 'choice', values: ['სამკუთხედის', 'წრის', 'კვადრატის', 'მართკუთხედის'] },
      item: { kind: 'choice', values: ['წერტილი', 'ვარსკვლავი', 'ბურთი', 'ფიგურა'] },
      a: { kind: 'int', min: 3, max: 9 },
      b: { kind: 'int', min: 2, max: 8 },
    },
    answer: (v) => Number(v.a),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `პირობის თანახმად, ${vars.shape} შიგნით არის ${answer} ${vars.item}.`,
  }),

  // Q58 — შიდა და გარე რაოდენობების სხვაობა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-58', subtopicId: 'u11-inside-and-outside', difficulty: 2 }),
    prompt:
      '{shape}-ს შიგნით {a} {item}ა, გარეთ კი {b}. რამდენით მეტია შიგნით არსებული რაოდენობა?',
    variables: {
      shape: { kind: 'choice', values: ['მართკუთხედის', 'წრის', 'კვადრატის'] },
      item: { kind: 'choice', values: ['ვარსკვლავი', 'წერტილი', 'ბურთი', 'ფიგურა'] },
      b: { kind: 'int', min: 2, max: 5 },
      diff: { kind: 'int', min: 3, max: 8 },
      a: { kind: 'choice', values: (v) => [Number(v.b) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer}-ით მეტი.`,
  }),

  // Q59 — გარედან შიგნით გადატანა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-59', subtopicId: 'u11-inside-and-outside', difficulty: 3 }),
    prompt:
      '{shape}-ს გარეთ {total} {item}ა. {moved} {item} {shape}-ს შიგნით გადაიტანეს. რამდენი {item} დარჩა გარეთ?',
    variables: {
      shape: { kind: 'choice', values: ['წრის', 'კვადრატის', 'მართკუთხედის'] },
      item: { kind: 'choice', values: ['სამკუთხედი', 'წერტილი', 'ვარსკვლავი', 'ფიგურა'] },
      total: { kind: 'int', min: 7, max: 15 },
      moved: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v) => Number(v.total) - Number(v.moved),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.total} − ${vars.moved} = ${answer} დარჩა გარეთ.`,
  }),

  // Q60 — ჯამური დათვლა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-60', subtopicId: 'u11-inside-and-outside', difficulty: 3 }),
    prompt:
      '{shape}-ს შიგნით {a} {item}ა და გარეთ {b}. რამდენი {item}ა სულ?',
    variables: {
      shape: { kind: 'choice', values: ['კვადრატის', 'წრის', 'სამკუთხედის'] },
      item: { kind: 'choice', values: ['წრე', 'წერტილი', 'ვარსკვლავი'] },
      a: { kind: 'int', min: 4, max: 10 },
      b: { kind: 'int', min: 5, max: 12 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // =========================================================================
  // U11.11 — ტოლი ფიგურები (Q61–Q66)
  // =========================================================================

  // Q61 — ორი ტოლი კვადრატი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-61', subtopicId: 'u11-equal-shapes', difficulty: 1 }),
    prompt:
      'ორი კვადრატის გვერდების სიგრძეებია {a} სმ და {a} სმ. აქვთ თუ არა მათ ტოლი ზომები?',
    variables: {
      a: { kind: 'int', min: 3, max: 16 },
    },
    optionCount: 2,
    answer: () => 'დიახ',
    format: { kind: 'text' },
    distractors: () => ['არა'],
    explanation: ({ vars }) =>
      `ორივე კვადრატის გვერდი ${vars.a} სმ-ია, ამიტომ ისინი ტოლი ზომისაა.`,
  }),

  // Q62 — ორი ტოლი მართკუთხედი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-62', subtopicId: 'u11-equal-shapes', difficulty: 1 }),
    prompt:
      'ერთ მართკუთხედს სიგრძე {a} სმ და სიგანე {b} სმ აქვს. მეორესაც სიგრძე {a} სმ და სიგანე {b} სმ აქვს. ტოლი ზომისაა ისინი?',
    variables: {
      a: { kind: 'int', min: 5, max: 12 },
      b: { kind: 'int', min: 2, max: 4 },
    },
    optionCount: 2,
    answer: () => 'დიახ',
    format: { kind: 'text' },
    distractors: () => ['არა'],
    explanation: () =>
      'ორივე მართკუთხედის შესაბამისი გვერდები ტოლია, ამიტომ ისინი ტოლი ზომისაა.',
  }),

  // Q63 — ორი არატოლი კვადრატი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-63', subtopicId: 'u11-equal-shapes', difficulty: 2 }),
    prompt:
      'ორი კვადრატის გვერდებია {a} სმ და {b} სმ. აქვთ თუ არა მათ ტოლი ზომები?',
    variables: {
      a: { kind: 'int', min: 3, max: 10 },
      diff: { kind: 'int', min: 1, max: 4 },
      b: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.diff)] },
    },
    optionCount: 2,
    answer: () => 'არა',
    format: { kind: 'text' },
    distractors: () => ['დიახ'],
    explanation: ({ vars }) =>
      `გვერდების სიგრძეები განსხვავებულია (${vars.a} სმ და ${vars.b} სმ), ამიტომ ისინი ტოლი ზომის არ არიან.`,
  }),

  // Q64 — მობრუნებული მართკუთხედები (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-64', subtopicId: 'u11-equal-shapes', difficulty: 2 }),
    prompt:
      'პირველ მართკუთხედს ზომები აქვს {a} სმ × {b} სმ, მეორეს — {b} სმ × {a} სმ. აქვთ თუ არა მათ ერთნაირი ფორმა და ზომა, თუ ფიგურის მობრუნება შეიძლება?',
    variables: {
      a: { kind: 'int', min: 4, max: 12 },
      b: { kind: 'int', min: 2, max: 4 },
    },
    optionCount: 2,
    answer: () => 'დიახ',
    format: { kind: 'text' },
    distractors: () => ['არა'],
    explanation: () =>
      'მობრუნებისას ფიგურის ზომა და ფორმა არ იცვლება, ამიტომ ისინი ტოლია.',
  }),

  // Q65 — ორი ტოლი სამკუთხედი (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-65', subtopicId: 'u11-equal-shapes', difficulty: 3 }),
    prompt:
      'ორი სამკუთხედის გვერდების სიგრძეებია {a}, {b}, {c} სმ და {a}, {b}, {c} სმ. აქვთ თუ არა მათ ტოლი ზომები?',
    variables: {
      a: { kind: 'int', min: 3, max: 7 },
      b: { kind: 'int', min: 4, max: 8 },
      c: { kind: 'int', min: 5, max: 9 },
    },
    optionCount: 2,
    answer: () => 'დიახ',
    format: { kind: 'text' },
    distractors: () => ['არა'],
    explanation: () =>
      'ორივე სამკუთხედს ერთნაირი გვერდები აქვს, ამიტომ მათი ზომები ტოლია.',
  }),

  // Q66 — სხვადასხვა ზომის კვადრატები (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-66', subtopicId: 'u11-equal-shapes', difficulty: 3 }),
    prompt:
      'პირველ კვადრატს გვერდი {a} სმ აქვს, მეორეს — {b} სმ. აქვთ თუ არა მათ ტოლი ზომები?',
    variables: {
      a: { kind: 'int', min: 3, max: 8 },
      diff: { kind: 'int', min: 2, max: 5 },
      b: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.diff)] },
    },
    optionCount: 2,
    answer: () => 'არა',
    format: { kind: 'text' },
    distractors: () => ['დიახ'],
    explanation: ({ vars }) =>
      `გვერდები განსხვავებულია (${vars.a} ≠ ${vars.b}), ამიტომ ზომები ტოლი არ არის.`,
  }),

  // =========================================================================
  // U11.12 — სიმეტრია (Q67–Q72)
  // =========================================================================

  // Q67 — კვადრატის სიმეტრიის ღერძები (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-67', subtopicId: 'u11-symmetry', difficulty: 1 }),
    prompt: '{child} კვადრატის სიმეტრიის ღერძებს ითვლის. რამდენი სიმეტრიის ღერძი აქვს კვადრატს?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => 4,
    format: { kind: 'integer', min: 1 },
    distractors: () => [2, 1, 8],
    explanation: () =>
      'კვადრატს აქვს 4 სიმეტრიის ღერძი (2 დიაგონალური და 2 შუახაზოვანი).',
  }),

  // Q68 — მართკუთხედის სიმეტრიის ღერძები (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-68', subtopicId: 'u11-symmetry', difficulty: 1 }),
    prompt: '{child} მართკუთხედის სიმეტრიის ღერძებს ითვლის. რამდენი სიმეტრიის ღერძი აქვს მართკუთხედს, თუ ის კვადრატი არ არის?',
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
    distractors: () => [4, 1, 0],
    explanation: () =>
      'მართკუთხედს (რომელიც კვადრატი არ არის) აქვს ზუსტად 2 სიმეტრიის ღერძი.',
  }),

  // Q69 — ვერტიკალურად სიმეტრიული ლათინური ასო (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-69', subtopicId: 'u11-symmetry', difficulty: 2 }),
    prompt:
      '{child}-ს აინტერესებს: რომელი ასოა სიმეტრიული ვერტიკალური ღერძის მიმართ, თუ ვიყენებთ ლათინურ დიდ ასოებს?',
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
          'A;F;G;R',
          'M;L;P;J',
          'T;F;G;Q',
          'V;B;P;R',
          'W;N;Z;S',
          'Y;K;L;F',
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
      `ასო ${answer} ვერტიკალური ღერძის მიმართ სიმეტრიულია.`,
  }),

  // Q70 — წრის სიმეტრიის ღერძები (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-70', subtopicId: 'u11-symmetry', difficulty: 2 }),
    prompt: '{child} წრის სიმეტრიის ღერძებს იკვლევს. რამდენი სიმეტრიის ღერძი აქვს წრეს?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
          'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
        ],
      },
    },
    answer: () => 'უსასრულოდ ბევრი',
    format: { kind: 'text' },
    distractors: () => ['0', '1', '2'],
    explanation: () =>
      'წრის ცენტრზე გამავალი ნებისმიერი წრფე მისი სიმეტრიის ღერძია, ამიტომ წრეს უსასრულოდ ბევრი სიმეტრიის ღერძი აქვს.',
  }),

  // Q71 — სარკისებური ერთნაირობა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-71', subtopicId: 'u11-symmetry', difficulty: 3 }),
    prompt: '{shape} მარცხენა და მარჯვენა მხარეებზე სარკისებურად ერთნაირია. აქვს თუ არა მას ვერტიკალური სიმეტრიის ღერძი?',
    variables: {
      shape: {
        kind: 'choice',
        values: [
          'ფიგურა',
          'ნახატი',
          'გამოსახულება',
          'ორნამენტი',
          'პეპლის ნახატი',
          'ფოთლის ნახაზი',
          'სახლის ფასადი',
          'გულის ფორმა',
          'ვარსკვლავის ნახატი',
          'ყვავილის გვირგვინი',
          'ხის ფოთოლი',
          'გეომეტრიული ნიმუში',
        ],
      },
    },
    optionCount: 2,
    answer: () => 'დიახ',
    format: { kind: 'text' },
    distractors: () => ['არა'],
    explanation: () =>
      'სარკისებური ერთნაირობა ნიშნავს, რომ მათ გამყოფი ხაზი სიმეტრიის ღერძია.',
  }),

  // Q72 — ცენტრზე გამავალი ხაზების მიმართ სიმეტრიული ფიგურა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-72', subtopicId: 'u11-symmetry', difficulty: 3 }),
    prompt:
      '{child}-მ უნდა ამოიცნოს: რომელი ფიგურაა სიმეტრიული თავისი ცენტრის გავლით გამავალი ვერტიკალური და ჰორიზონტალური ხაზების მიმართ?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
        ],
      },
      correctShape: { kind: 'choice', values: ['კვადრატი', 'წრე', 'მართკუთხედი', 'რომბი'] },
    },
    answer: (v) => String(v.correctShape),
    format: { kind: 'text' },
    distractors: () => [
      'არასწორი სამკუთხედი',
      'მხოლოდ ერთი გვერდის მქონე ფიგურა',
      'შემთხვევითი ხაზი',
    ],
    explanation: ({ answer }) =>
      `${answer} სიმეტრიულია როგორც ვერტიკალური, ისე ჰორიზონტალური ღერძის მიმართ.`,
  }),

  // =========================================================================
  // U11.13 — შერეული გამეორება (Q73–Q78)
  // =========================================================================

  // Q73 — მეტრი და სანტიმეტრი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-73', subtopicId: 'u11-mixed-review', difficulty: 1 }),
    prompt: '{m} მეტრი და {cm} სანტიმეტრი რამდენი სანტიმეტრია?',
    variables: {
      m: { kind: 'int', min: 2, max: 5 },
      cm: { kind: 'choice', values: ['10', '15', '20', '25', '30', '35', '40', '45', '50', '60', '70', '75', '80', '85'] },
    },
    answer: (v) => Number(v.m) * 100 + Number(v.cm),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) =>
      `${vars.m} მ = ${Number(vars.m) * 100} სმ. ${Number(vars.m) * 100} + ${vars.cm} = ${answer} სმ.`,
  }),

  // Q74 — კვადრატის პერიმეტრი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-74', subtopicId: 'u11-mixed-review', difficulty: 1 }),
    prompt: 'კვადრატის გვერდია {a} სმ. რამდენია მისი პერიმეტრი?',
    variables: {
      a: { kind: 'int', min: 4, max: 18 },
    },
    answer: (v) => Number(v.a) * 4,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `4 × ${vars.a} = ${answer} სმ.`,
  }),

  // Q75 — სივრცული ფიგურა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-75', subtopicId: 'u11-mixed-review', difficulty: 2 }),
    prompt: '{child} ეძებს სივრცულ ფიგურას. ჩამოთვლილთაგან რომელი ფიგურაა სივრცული?',
    variables: {
      child: {
        kind: 'choice',
        values: [
          'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
        ],
      },
      solid: { kind: 'choice', values: ['კუბი', 'სფერო', 'პირამიდა', 'ცილინდრი'] },
    },
    answer: (v) => String(v.solid),
    format: { kind: 'text' },
    distractors: () => ['წრე', 'სამკუთხედი', 'კვადრატი'],
    explanation: ({ answer }) =>
      `${answer} სივრცითი ფიგურაა, დანარჩენები — ბრტყელი.`,
  }),

  // Q76 — ტემპერატურის სხვაობა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-76', subtopicId: 'u11-mixed-review', difficulty: 2 }),
    prompt:
      'დილით ტემპერატურა {t1}°C იყო, შუადღეს — {t2}°C. რამდენი გრადუსით მოიმატა?',
    variables: {
      t1: { kind: 'int', min: 5, max: 14 },
      diff: { kind: 'int', min: 4, max: 12 },
      t2: { kind: 'choice', values: (v) => [Number(v.t1) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.t2} − ${vars.t1} = ${answer} გრადუსით.`,
  }),

  // Q77 — გვერდების დამატება სასურველ ფიგურამდე (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u11-77', subtopicId: 'u11-mixed-review', difficulty: 3 }),
    prompt:
      'ფიგურას {curr} გვერდი აქვს. რამდენი გვერდი უნდა დაემატოს, რომ {target}-გვერდიანი ფიგურა მივიღოთ?',
    variables: {
      curr: { kind: 'int', min: 3, max: 7 },
      add: { kind: 'int', min: 2, max: 5 },
      target: { kind: 'choice', values: (v) => [Number(v.curr) + Number(v.add)] },
    },
    answer: (v) => Number(v.add),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.target} − ${vars.curr} = ${answer} გვერდი.`,
  }),

  // Q78 — სანტიმეტრების გადაყვანა მეტრსა და სანტიმეტრში (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u11-78', subtopicId: 'u11-mixed-review', difficulty: 3 }),
    prompt: 'ლენტი {total} სმ სიგრძისაა. რამდენი მეტრი და სანტიმეტრია ეს?',
    variables: {
      m: { kind: 'int', min: 1, max: 4 },
      cm: { kind: 'choice', values: ['15', '20', '30', '40', '50', '60', '70', '80'] },
      total: { kind: 'choice', values: (v) => [Number(v.m) * 100 + Number(v.cm)] },
      correct: {
        kind: 'choice',
        values: (v) => [`${v.m} მეტრი და ${v.cm} სანტიმეტრი`],
      },
      w1: {
        kind: 'choice',
        values: (v) => [`${Number(v.m) + 1} მეტრი და ${v.cm} სანტიმეტრი`],
      },
      w2: {
        kind: 'choice',
        values: (v) => [`${v.m} მეტრი და ${Number(v.cm) + 10} სანტიმეტრი`],
      },
      w3: {
        kind: 'choice',
        values: (v) => [`${v.m} მეტრი და ${Number(v.cm) > 10 ? Number(v.cm) - 10 : 90} სანტიმეტრი`],
      },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.total} სმ = ${answer}.`,
  }),
];
