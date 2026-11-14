import { defineTemplate } from './types';
import type { QuestionTemplate } from './types';

export const G2_U10_SUBTOPICS = [
  'u10-choosing-tables-charts',
  'u10-tally-marks',
  'u10-collecting-data',
  'u10-pictograms',
  'u10-bar-charts',
  'u10-dot-plots',
  'u10-more-less-equally-likely',
  'u10-possible-impossible',
  'u10-changing-chances',
] as const;

export type G2U10Subtopic = (typeof G2_U10_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G2U10Subtopic; difficulty: 1 | 2 | 3 }) => ({
  grade: 2 as const,
  topicId: 'g2-monacemebi-albatoba',
  unitId: 'g2-monacemebi-albatoba',
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

export const G2_U10_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U10.1 — ცხრილებისა და დიაგრამების არჩევა (Q01–Q06)
  // =========================================================================

  // Q01 — საყვარელი კატეგორიის შესადარებლად მეთოდის არჩევა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-01', subtopicId: 'u10-choosing-tables-charts', difficulty: 1 }),
    prompt:
      '{who} საყვარელი {item} აირჩიეს. რომელი მეთოდია მოსახერხებელი თითოეული {itemGen} არჩევის რაოდენობის შესადარებლად?',
    variables: {
      who: { kind: 'choice', values: ['მოსწავლეებმა', 'ბავშვებმა', 'კლასის წევრებმა'] },
      itemPair: {
        kind: 'choice',
        values: [
          'ხილი;ხილის',
          'ფერი;ფერის',
          'სპორტის სახეობა;სპორტის',
          'ცხოველი;ცხოველის',
          'წიგნის ჟანრი;ჟანრის',
        ],
      },
      item: { kind: 'choice', values: (v) => [String(v.itemPair).split(';')[0]] },
      itemGen: { kind: 'choice', values: (v) => [String(v.itemPair).split(';')[1]] },
    },
    answer: () => 'სიხშირეების ცხრილი',
    format: { kind: 'text' },
    distractors: () => ['საათის ციფერბლატი', 'კალენდარი', 'გეომეტრიული ფიგურების სია'],
    explanation: () =>
      'სიხშირეების ცხრილი გვიჩვენებს, რამდენჯერ განმეორდა თითოეული არჩევანი და მოსახერხებელია შესადარებლად.',
  }),

  // Q02 — მონაცემების შესანახად შესაფერისი ცხრილის არჩევა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-02', subtopicId: 'u10-choosing-tables-charts', difficulty: 1 }),
    prompt:
      'კლასში {n} მოსწავლეს ჰკითხეს საყვარელი {topic}. მონაცემების შესანახად რომელი ცხრილია შესაფერისი?',
    variables: {
      n: { kind: 'int', min: 10, max: 25 },
      topicPair: {
        kind: 'choice',
        values: [
          'ფერი;ფერი და მოსწავლეთა რაოდენობა',
          'ხილი;ხილი და მოსწავლეთა რაოდენობა',
          'საგანი;საგანი და მოსწავლეთა რაოდენობა',
          'სპორტი;სპორტი და მოსწავლეთა რაოდენობა',
        ],
      },
      topic: { kind: 'choice', values: (v) => [String(v.topicPair).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.topicPair).split(';')[1]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: () => [
      'მოსწავლეთა სიმაღლე და დრო',
      'კვირის დღეები და ტემპერატურა',
      'წიგნის გვერდები და ფასი',
    ],
    explanation: ({ vars, answer }) =>
      `${vars.topic}-ის გამოკითხვის მონაცემების ჩასაწერად გვჭირდება ცხრილი სვეტებით: ${answer}.`,
  }),

  // Q03 — მონაწილეთა შესადარებლად გამოსახულების არჩევა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-03', subtopicId: 'u10-choosing-tables-charts', difficulty: 2 }),
    prompt: '{promptText}',
    variables: {
      circle: {
        kind: 'choice',
        values: [
          'სპორტის წრეების',
          'მუსიკალური ანსამბლების',
          'სასკოლო კლუბების',
          'ხელოვნების წრეების',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B', 'C'] },
      promptText: {
        kind: 'choice',
        values: (v) => {
          if (v.style === 'A') {
            return [`${v.circle} მონაწილეთა რაოდენობა უნდა შევადაროთ. რომელი გამოსახულება დაგვეხმარება ყველაზე მეტად?`];
          }
          if (v.style === 'B') {
            return [`${v.circle} მონაწილეების რაოდენობის შესადარებლად რომელი გამოსახულებაა ყველაზე მოსახერხებელი?`];
          }
          return [`გვინდა შევადაროთ ${v.circle} მონაწილეთა რაოდენობა. რომელი მეთოდი გამოგვადგება ყველაზე მეტად?`];
        },
      },
    },
    answer: () => 'სვეტოვანი დიაგრამა',
    format: { kind: 'text' },
    distractors: () => ['საათი', 'რიცხვების შემთხვევითი სია', 'კალენდარი'],
    explanation: () =>
      'სვეტოვანი დიაგრამა თვალსაჩინოდ აჩვენებს და ადარებს სხვადასხვა ჯგუფის რაოდენობებს.',
  }),

  // Q04 — საჭირო ინფორმაციის განსაზღვრა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-04', subtopicId: 'u10-choosing-tables-charts', difficulty: 2 }),
    prompt: '{promptText}',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          'წიგნი;თითოეულ დღეს მოტანილი წიგნების რაოდენობა;თითოეული წიგნის სათაურის სიგრძე',
          'ნახატი;თითოეულ დღეს მოტანილი ნახატების რაოდენობა;თითოეული ნახატის ზომა',
          'რვეული;თითოეულ დღეს მოტანილი რვეულების რაოდენობა;თითოეული რვეულის სისქე',
          'ხილი;თითოეულ დღეს მოტანილი ხილის რაოდენობა;თითოეული ხილის წონა',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B', 'C'] },
      items: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      promptText: {
        kind: 'choice',
        values: (v) => {
          const item = String(v.items);
          if (v.style === 'A') {
            return [`მასწავლებელს უნდა გაიგოს, კვირის რომელ დღეს მოიტანეს მოსწავლეებმა ყველაზე მეტი ${item}. რომელი ინფორმაციაა საჭირო?`];
          }
          if (v.style === 'B') {
            return [`რომ გავიგოთ, კვირის რომელ დღეს მოიტანეს ყველაზე მეტი ${item}, რომელი მონაცემია აუცილებელი?`];
          }
          return [`რომელ დღეს მოიტანეს ყველაზე მეტი ${item} — ამის გასაგებად რომელი ინფორმაცია გვჭირდება?`];
        },
      },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      String(vars.w1),
      'მოსწავლეთა ფეხსაცმლის ზომა',
      'კლასის ოთახის სიგანე',
    ],
    explanation: ({ answer }) =>
      `დღეების მიხედვით შედარებისთვის აუცილებელია ${answer}.`,
  }),

  // Q05 — სახეობების რაოდენობის შესადარებლად მეთოდი (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-05', subtopicId: 'u10-choosing-tables-charts', difficulty: 3 }),
    prompt: '{promptText}',
    variables: {
      itemCategory: {
        kind: 'choice',
        values: ['ყვავილის', 'ხის ნერგის', 'ფრინველის', 'ბურთის'],
      },
      style: { kind: 'choice', values: ['A', 'B', 'C'] },
      promptText: {
        kind: 'choice',
        values: (v) => {
          if (v.style === 'A') {
            return [`ოთხი სახეობის ${v.itemCategory}-ს რაოდენობის შესადარებლად რომელი მეთოდია შესაფერისი?`];
          }
          if (v.style === 'B') {
            return [`რომელი გამოსახულებაა მოსახერხებელი ოთხი სახეობის ${v.itemCategory}-ს რაოდენობათა შესადარებლად?`];
          }
          return [`ოთხი სხვადასხვა სახეობის ${v.itemCategory}-ს რაოდენობის წარმოსადგენად რომელი გზაა საუკეთესო?`];
        },
      },
    },
    answer: () => 'სვეტოვანი დიაგრამა',
    format: { kind: 'text' },
    distractors: () => ['კვირის განრიგი', 'საათის ციფერბლატი', 'გეომეტრიული ფიგურების ნახაზი'],
    explanation: () =>
      'სვეტოვანი დიაგრამა საუკეთესო გზაა რამდენიმე კატეგორიის რაოდენობების თვალსაჩინოდ შესადარებლად.',
  }),

  // Q06 — ცხრილის სვეტების სათაურების განსაზღვრა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-06', subtopicId: 'u10-choosing-tables-charts', difficulty: 3 }),
    prompt: '{promptText}',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          'ცხოველების;ცხოველი;ცხოველი და არჩევის რაოდენობა',
          'ფრინველების;ფრინველი;ფრინველი და არჩევის რაოდენობა',
          'სპორტის სახეობების;სპორტი;სპორტის სახეობა და არჩევის რაოდენობა',
          'სასკოლო საგნების;საგანი;საგანი და არჩევის რაოდენობა',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B', 'C'] },
      category: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      single: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      promptText: {
        kind: 'choice',
        values: (v) => {
          if (v.style === 'A') {
            return [`ცხრილში მოცემულია საყვარელი ${v.category}-ს ხმები — რამდენმა მოსწავლემ აირჩია თითოეული ${v.single}. რა უნდა ეწეროს ცხრილის სვეტების სათაურებში?`];
          }
          if (v.style === 'B') {
            return [`მოსწავლეთა გამოკითხვის ცხრილში საყვარელი ${v.category} წერია. რა სათაურები უნდა ჰქონდეს ცხრილის სვეტებს?`];
          }
          return [`საყვარელი ${v.category}-ს გამოკითხვის შედეგების ცხრილში რა უნდა ეწეროს სვეტების სათაურებად?`];
        },
      },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: () => ['სახელი და დაბადების თარიღი', 'დღე და საათი', 'ფერი და სიგრძე'],
    explanation: ({ answer }) =>
      `ცხრილის სვეტების სათაურებში უნდა ეწეროს: ${answer}.`,
  }),

  // =========================================================================
  // U10.2 — აღრიცხვის ნიშნები (Q07–Q12)
  // =========================================================================

  // Q07 — ერთი ხუთეული და ხაზები (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-07', subtopicId: 'u10-tally-marks', difficulty: 1 }),
    prompt: '{promptText}',
    variables: {
      singles: { kind: 'int', min: 1, max: 4 },
      style: { kind: 'choice', values: ['A', 'B', 'C'] },
      promptText: {
        kind: 'choice',
        values: (v) => {
          const s = v.singles;
          if (v.style === 'A') {
            return [`აღრიცხვის ნიშნები აჩვენებს ერთ ხუთეულს და კიდევ ${s} ხაზს. რამდენია სულ?`];
          }
          if (v.style === 'B') {
            return [`აღრიცხვის ნიშნებით ჩაწერილია 1 სრული ხუთეული და ${s} ცალკეული ხაზი. რამდენია სულ?`];
          }
          return [`რამდენს აღნიშნავს 1 ხუთეული და კიდევ ${s} ხაზი?`];
        },
      },
    },
    answer: (v) => 5 + Number(v.singles),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `1 ხუთეული არის 5. 5 + ${vars.singles} = ${answer}.`,
  }),

  // Q08 — რამდენიმე ხუთეული და ხაზები (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-08', subtopicId: 'u10-tally-marks', difficulty: 1 }),
    prompt:
      'აღრიცხვის ნიშნები აჩვენებს {bundles} სრულ ხუთეულს და კიდევ {singles} ხაზს. რამდენია სულ?',
    variables: {
      bundles: { kind: 'int', min: 2, max: 4 },
      singles: { kind: 'int', min: 1, max: 4 },
    },
    answer: (v) => Number(v.bundles) * 5 + Number(v.singles),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) => {
      const b = Number(vars.bundles);
      const s = Number(vars.singles);
      return `${b} ხუთეული არის ${b * 5}. ${b * 5} + ${s} = ${answer}.`;
    },
  }),

  // Q09 — ხმების დაშლა ხუთეულებად და ცალკეულ ხმებად (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-09', subtopicId: 'u10-tally-marks', difficulty: 2 }),
    prompt:
      'აღრიცხვის ნიშნებით დათვლილია {total} ხმა. რამდენი სრული ხუთეულია და რამდენი ცალკეული ხმა რჩება?',
    variables: {
      total: {
        kind: 'choice',
        values: [
          '11', '12', '13', '14',
          '16', '17', '18', '19',
          '21', '22', '23', '24',
          '26', '27', '28', '29',
        ],
      },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.total);
          const full = Math.floor(t / 5);
          const rem = t % 5;
          const correct = `${full} სრული ხუთეული და ${rem} ცალკეული ხმა`;
          const w1 = `${full - 1} სრული ხუთეული და ${rem + 5} ცალკეული ხმა`;
          const altRem = rem === 1 ? 2 : rem - 1;
          const w2 = `${full} სრული ხუთეული და ${altRem} ცალკეული ხმა`;
          const w3 = `${full + 1} სრული ხუთეული და ${rem} ცალკეული ხმა`;
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
    explanation: ({ vars, answer }) => {
      const t = Number(vars.total);
      const full = Math.floor(t / 5);
      const rem = t % 5;
      return `${t} = ${full} × 5 + ${rem}, ანუ ${answer}.`;
    },
  }),

  // Q10 — ნივთების დაშლა ხუთეულებად და ცალკეულ ნიშნებად (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-10', subtopicId: 'u10-tally-marks', difficulty: 2 }),
    prompt:
      'აღრიცხვის ნიშნებით დათვლილია {total} {items}. რამდენი სრული ხუთეული და რამდენი ცალკეული ნიშანია?',
    variables: {
      items: { kind: 'choice', values: ['წიგნი', 'რვეული', 'ფანქარი', 'ბურთი'] },
      total: {
        kind: 'choice',
        values: [
          '12', '13', '14', '16', '17', '18', '19',
          '21', '22', '23', '24', '26', '27', '28', '29',
        ],
      },
      pack: {
        kind: 'choice',
        values: (v) => {
          const t = Number(v.total);
          const full = Math.floor(t / 5);
          const rem = t % 5;
          const correct = `${full} სრული ხუთეული და ${rem} ცალკეული ნიშანი`;
          const w1 = `${full - 1} სრული ხუთეული და ${rem + 5} ცალკეული ნიშანი`;
          const altRem = rem === 4 ? 3 : rem + 1;
          const w2 = `${full} სრული ხუთეული და ${altRem} ცალკეული ნიშანი`;
          const w3 = `${full + 1} სრული ხუთეული და ${rem} ცალკეული ნიშანი`;
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
    explanation: ({ vars, answer }) => {
      const t = Number(vars.total);
      const full = Math.floor(t / 5);
      const rem = t % 5;
      return `${t} = ${full} × 5 + ${rem}, ანუ ${answer}.`;
    },
  }),

  // Q11 — ჯგუფების ხმების შეკრება (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-11', subtopicId: 'u10-tally-marks', difficulty: 3 }),
    prompt:
      'პირველმა ჯგუფმა მიიღო {a} ხმა, მეორემ — {b}. რამდენი ხმა მიიღეს სულ?',
    variables: {
      a: { kind: 'int', min: 6, max: 19 },
      b: { kind: 'int', min: 5, max: 18 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer} ხმა.`,
  }),

  // Q12 — დიდი რაოდენობის ხუთეულები და ხაზები (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-12', subtopicId: 'u10-tally-marks', difficulty: 3 }),
    prompt:
      'აღრიცხვის ნიშნები აჩვენებს {bundles} სრულ ხუთეულს და კიდევ {singles} ხაზს. რამდენი ხმაა სულ?',
    variables: {
      bundles: { kind: 'int', min: 3, max: 7 },
      singles: { kind: 'int', min: 1, max: 4 },
    },
    answer: (v) => Number(v.bundles) * 5 + Number(v.singles),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) => {
      const b = Number(vars.bundles);
      const s = Number(vars.singles);
      return `${b} × 5 = ${b * 5}. ${b * 5} + ${s} = ${answer}.`;
    },
  }),

  // =========================================================================
  // U10.3 — მონაცემების შეგროვება (Q13–Q18)
  // =========================================================================

  // Q13 — სამი არჩევანის საერთო რაოდენობა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-13', subtopicId: 'u10-collecting-data', difficulty: 1 }),
    prompt:
      'კლასში {a} მოსწავლემ აირჩია {f1}, {b}-მ — {f2} და {c}-მ — {f3}. რამდენმა მოსწავლემ მიიღო მონაწილეობა?',
    variables: {
      fruitSet: {
        kind: 'choice',
        values: [
          'ვაშლი;მსხალი;ბანანი',
          'მარწყვი;ატამი;ქლიავი',
          'ფორთოხალი;კივი;ალუბალი',
        ],
      },
      a: { kind: 'int', min: 4, max: 12 },
      b: { kind: 'int', min: 4, max: 11 },
      c: { kind: 'int', min: 3, max: 9 },
      f1: { kind: 'choice', values: (v) => [String(v.fruitSet).split(';')[0]] },
      f2: { kind: 'choice', values: (v) => [String(v.fruitSet).split(';')[1]] },
      f3: { kind: 'choice', values: (v) => [String(v.fruitSet).split(';')[2]] },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} = ${answer} მოსწავლე.`,
  }),

  // Q14 — მესამე კატეგორიის პოვნა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-14', subtopicId: 'u10-collecting-data', difficulty: 1 }),
    prompt:
      'გამოკითხვაში {total} მოსწავლე მონაწილეობდა. {a}-მ აირჩია {s1}, {b}-მ — {s2}. დანარჩენებმა {s3} აირჩიეს. რამდენმა აირჩია {s3}?',
    variables: {
      sportSet: {
        kind: 'choice',
        values: [
          'ფეხბურთი;კალათბურთი;ცურვა',
          'ჩოგბურთი;ძიუდო;ტანვარჯიში',
          'ჭადრაკი;ცეკვა;მძლეოსნობა',
        ],
      },
      a: { kind: 'int', min: 5, max: 10 },
      b: { kind: 'int', min: 4, max: 9 },
      rem: { kind: 'int', min: 3, max: 8 },
      total: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b) + Number(v.rem)] },
      s1: { kind: 'choice', values: (v) => [String(v.sportSet).split(';')[0]] },
      s2: { kind: 'choice', values: (v) => [String(v.sportSet).split(';')[1]] },
      s3: { kind: 'choice', values: (v) => [String(v.sportSet).split(';')[2]] },
    },
    answer: (v) => Number(v.rem),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.total} − ${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q15 — ერთხელ ჩაწერის წესი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-15', subtopicId: 'u10-collecting-data', difficulty: 2 }),
    prompt:
      'მონაცემების შეგროვებისას თითოეული მოსწავლის საყვარელი {topic} ერთხელ უნდა ჩაიწეროს. თუ {n} მოსწავლეა, რამდენი პასუხი უნდა ჩაიწეროს?',
    variables: {
      topic: { kind: 'choice', values: ['ფერი', 'ხილი', 'ცხოველი', 'წიგნი', 'სპორტი'] },
      n: { kind: 'int', min: 8, max: 28 },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `თითოეული მოსწავლის პასუხი ერთხელ იწერება, ამიტომ ${vars.n} მოსწავლისგან ჩაიწერება ${answer} პასუხი.`,
  }),

  // Q16 — ოთხი დღის ჯამი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-16', subtopicId: 'u10-collecting-data', difficulty: 2 }),
    prompt:
      'ოთხი დღის განმავლობაში {place}-ში მოსული ბავშვების რაოდენობა იყო {a}, {b}, {c} და {d}. რამდენი ბავშვი მოვიდა სულ?',
    variables: {
      place: {
        kind: 'choice',
        values: [
          'ბიბლიოთეკაში',
          'სამკითხველო დარბაზში',
          'სასკოლო მუზეუმში',
          'სპორტდარბაზში',
        ],
      },
      a: { kind: 'int', min: 8, max: 18 },
      b: { kind: 'int', min: 8, max: 18 },
      c: { kind: 'int', min: 7, max: 16 },
      d: { kind: 'int', min: 9, max: 19 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} = ${answer} ბავშვი.`,
  }),

  // Q17 — ფერების გამოკითხვა და ნაშთი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-17', subtopicId: 'u10-collecting-data', difficulty: 3 }),
    prompt:
      'გამოკითხვაში {total} მოსწავლე მონაწილეობდა. {a}-მ აირჩია {c1} ფერი, {b}-მ — {c2}. დანარჩენებმა {c3} აირჩიეს. რამდენმა აირჩია {c3}?',
    variables: {
      colorSet: {
        kind: 'choice',
        values: [
          'წითელი;ლურჯი;მწვანე',
          'ყვითელი;იასამნისფერი;ნარინჯისფერი',
          'თეთრი;ვარდისფერი;ცისფერი',
        ],
      },
      a: { kind: 'int', min: 9, max: 16 },
      b: { kind: 'int', min: 5, max: 12 },
      rem: { kind: 'int', min: 2, max: 9 },
      total: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b) + Number(v.rem)] },
      c1: { kind: 'choice', values: (v) => [String(v.colorSet).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.colorSet).split(';')[1]] },
      c3: { kind: 'choice', values: (v) => [String(v.colorSet).split(';')[2]] },
    },
    answer: (v) => Number(v.rem),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.total} − ${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q18 — ოთხი კატეგორიის საერთო რაოდენობა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-18', subtopicId: 'u10-collecting-data', difficulty: 3 }),
    prompt:
      'მონაცემებში ოთხი კატეგორიის რაოდენობებია {a}, {b}, {c} და {d}. რამდენია ყველა კატეგორიის საერთო რაოდენობა?',
    variables: {
      a: { kind: 'int', min: 5, max: 15 },
      b: { kind: 'int', min: 6, max: 16 },
      c: { kind: 'int', min: 5, max: 14 },
      d: { kind: 'int', min: 6, max: 15 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} = ${answer}.`,
  }),

  // =========================================================================
  // U10.4 — პიქტოგრამები (Q19–Q24)
  // =========================================================================

  // Q19 — ერთი სიმბოლო ნიშნავს რამდენიმე ერთეულს (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-19', subtopicId: 'u10-pictograms', difficulty: 1 }),
    prompt:
      'პიქტოგრამაში ერთი {sym} ნიშნავს {scale} {unit}. თუ ბიბლიოთეკის კატეგორიასთან {count} {symName}-ია, რამდენ {unit}-ს აღნიშნავს ეს?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '⭐;2;წიგნს;ვარსკვლავი',
          '⭐;3;ქულას;ვარსკვლავი',
          '🌟;4;რვეულს;ვარსკვლავი',
          '🍎;2;ვაშლს;ვაშლი',
        ],
      },
      count: { kind: 'int', min: 3, max: 8 },
      sym: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      scale: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      unit: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      symName: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => Number(v.count) * Number(v.scale),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.count} × ${vars.scale} = ${answer} ${vars.unit}.`,
  }),

  // Q20 — ხილის პიქტოგრამა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-20', subtopicId: 'u10-pictograms', difficulty: 1 }),
    prompt:
      'ერთი {sym} ნიშნავს {scale} {unitSing}. პიქტოგრამაზე {count} {symName}-ის სიმბოლოა. რამდენი {unitPlur} არის სულ?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '🍎;3;ვაშლს;ვაშლის;ვაშლი',
          '🍌;4;ბანანს;ბანანის;ბანანი',
          '🍐;2;მსხალს;მსხლის;მსხალი',
          '🍊;5;ფორთოხალს;ფორთოხლის;ფორთოხალი',
        ],
      },
      count: { kind: 'int', min: 3, max: 8 },
      sym: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      scale: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      unitSing: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      symName: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      unitPlur: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.count) * Number(v.scale),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.count} × ${vars.scale} = ${answer} ${vars.unitPlur}.`,
  }),

  // Q21 — პიქტოგრამაზე სხვაობის პოვნა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-21', subtopicId: 'u10-pictograms', difficulty: 2 }),
    prompt:
      'ერთი {sym} ნიშნავს {scale} {unit}. {groupA} ჯგუფს შეესაბამება {countA} ბურთის სიმბოლო, {groupB} ჯგუფს — {countB}. რამდენით მეტია {groupA} ჯგუფის რაოდენობა {groupB}-ზე?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '⚽;4;ბურთს;ფეხბურთის;კალათბურთის',
          '🎾;3;ბურთს;ჩოგბურთის;ბადმინტონის',
          '🏐;2;ბურთს;ფრენბურთის;ხელბურთის',
        ],
      },
      countB: { kind: 'int', min: 2, max: 5 },
      diffCount: { kind: 'int', min: 1, max: 4 },
      countA: { kind: 'choice', values: (v) => [Number(v.countB) + Number(v.diffCount)] },
      sym: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      scale: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      unit: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      groupA: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      groupB: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.diffCount) * Number(v.scale),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `სიმბოლოების სხვაობაა ${vars.countA} − ${vars.countB} = ${vars.diffCount}. ${vars.diffCount} × ${vars.scale} = ${answer} ${vars.unit}.`,
  }),

  // Q22 — წიგნების ან ნივთების პიქტოგრამა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-22', subtopicId: 'u10-pictograms', difficulty: 2 }),
    prompt:
      'ერთი {sym} ნიშნავს {scale} {unit}. თუ პიქტოგრამაზე {count} სიმბოლოა, რამდენ {unit}-ს აღნიშნავს იგი?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '📚;5;წიგნს',
          '✏️;5;ფანქარს',
          '🎈;10;ბუშტს',
          '⭐;10;ქულას',
        ],
      },
      count: { kind: 'int', min: 4, max: 9 },
      sym: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      scale: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      unit: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.count) * Number(v.scale),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.count} × ${vars.scale} = ${answer} ${vars.unit}.`,
  }),

  // Q23 — ორი კატეგორიის ჯამი პიქტოგრამაზე (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-23', subtopicId: 'u10-pictograms', difficulty: 3 }),
    prompt:
      'ერთი {sym} ნიშნავს {scale} {unit}. პიქტოგრამაზე {t1}-ის {countA} სიმბოლოა, {t2}-ის კი {countB}. რამდენი {unit} არის სულ?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '🌼;2;ყვავილს;წითელი ყვავილების;ყვითლების',
          '🌳;3;ხეს;ნაძვის;მუხის',
          '🐟;2;თევზს;ოქროს თევზების;ვერცხლისფრების',
        ],
      },
      countA: { kind: 'int', min: 4, max: 8 },
      countB: { kind: 'int', min: 3, max: 7 },
      sym: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      scale: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      unit: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      t1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      t2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => (Number(v.countA) + Number(v.countB)) * Number(v.scale),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) => {
      const tot = Number(vars.countA) + Number(vars.countB);
      return `სულ არის ${vars.countA} + ${vars.countB} = ${tot} სიმბოლო. ${tot} × ${vars.scale} = ${answer} ${vars.unit}.`;
    },
  }),

  // Q24 — დამატებითი სიმბოლოების რაოდენობის პოვნა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-24', subtopicId: 'u10-pictograms', difficulty: 3 }),
    prompt:
      'ერთი {sym} ნიშნავს {scale} {unit}. პიქტოგრამაზე {curr} სიმბოლოა. რამდენი დამატებითი {symName}-ის სიმბოლო უნდა დაემატოს, რომ რაოდენობა {target} {unit}-ს აღნიშნავდეს?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '🐟;3;თევზს;თევზის',
          '🍎;2;ვაშლს;ვაშლის',
          '⭐;4;ქულას;ვარსკვლავის',
          '📚;5;წიგნს;წიგნის',
        ],
      },
      curr: { kind: 'int', min: 3, max: 6 },
      add: { kind: 'int', min: 2, max: 5 },
      sym: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      scale: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      unit: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      symName: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      target: {
        kind: 'choice',
        values: (v) => [(Number(v.curr) + Number(v.add)) * Number(v.scale)],
      },
    },
    answer: (v) => Number(v.add),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) => {
      const tot = Number(vars.curr) + Number(vars.add);
      return `${vars.target} ${vars.unit}-ს სჭირდება ${vars.target} : ${vars.scale} = ${tot} სიმბოლო. უკვე არის ${vars.curr}, ამიტომ უნდა დაემატოს ${tot} − ${vars.curr} = ${answer} სიმბოლო.`;
    },
  }),

  // =========================================================================
  // U10.5 — სვეტოვანი დიაგრამები (Q25–Q30)
  // =========================================================================

  // Q25 — ყველაზე მეტი არჩევანი დიაგრამაზე (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-25', subtopicId: 'u10-bar-charts', difficulty: 1 }),
    prompt:
      'სვეტოვანი დიაგრამის მონაცემებია: {n1} — {v1}, {n2} — {v2}, {n3} — {v3}. რომელი {category} აირჩიეს ყველაზე მეტმა მოსწავლემ?',
    variables: {
      catSet: {
        kind: 'choice',
        values: [
          'ხილი;ვაშლი;მსხალი;ბანანი',
          'ფერი;წითელი;ლურჯი;მწვანე',
          'სპორტი;ფეხბურთი;კალათბურთი;ცურვა',
          'ცხოველი;ძაღლი;კატა;ზაზუნა',
        ],
      },
      v1: { kind: 'int', min: 10, max: 15 },
      v2: { kind: 'int', min: 3, max: 6 },
      v3: { kind: 'int', min: 7, max: 9 },
      category: { kind: 'choice', values: (v) => [String(v.catSet).split(';')[0]] },
      n1: { kind: 'choice', values: (v) => [String(v.catSet).split(';')[1]] },
      n2: { kind: 'choice', values: (v) => [String(v.catSet).split(';')[2]] },
      n3: { kind: 'choice', values: (v) => [String(v.catSet).split(';')[3]] },
    },
    optionCount: 3,
    answer: (v) => String(v.n1),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.n2), String(vars.n3)],
    explanation: ({ vars, answer }) =>
      `ყველაზე მაღალი მაჩვენებელი აქვს ${answer}-ს (${vars.v1}).`,
  }),

  // Q26 — გუნდების ქულების სხვაობა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-26', subtopicId: 'u10-bar-charts', difficulty: 1 }),
    prompt:
      'დიაგრამაზე ოთხი გუნდის ქულებია: A — {a}, B — {b}, C — {c}, D — {d}. რამდენი ქულით უსწრებს C გუნდი D გუნდს?',
    variables: {
      c: { kind: 'int', min: 13, max: 22 },
      d: { kind: 'int', min: 4, max: 10 },
      a: { kind: 'int', min: 8, max: 17 },
      b: { kind: 'int', min: 7, max: 16 },
    },
    answer: (v) => Number(v.c) - Number(v.d),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.c} − ${vars.d} = ${answer} ქულით.`,
  }),

  // Q27 — ყველაზე მცირე მაჩვენებლის დღე (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-27', subtopicId: 'u10-bar-charts', difficulty: 2 }),
    prompt:
      'წიგნების რაოდენობებია: {d1} — {v1}, {d2} — {v2}, {d3} — {v3}. რომელ დღეს იყო რაოდენობა ყველაზე მცირე?',
    variables: {
      dayGroup: {
        kind: 'choice',
        values: [
          'ორშაბათი;სამშაბათი;ოთხშაბათი',
          'სამშაბათი;ოთხშაბათი;ხუთშაბათი',
          'ხუთშაბათი;პარასკევი;შაბათი',
          'პარასკევი;შაბათი;კვირა',
        ],
      },
      v1: { kind: 'int', min: 10, max: 14 },
      v2: { kind: 'int', min: 15, max: 20 },
      v3: { kind: 'int', min: 4, max: 8 },
      d1: { kind: 'choice', values: (v) => [String(v.dayGroup).split(';')[0]] },
      d2: { kind: 'choice', values: (v) => [String(v.dayGroup).split(';')[1]] },
      d3: { kind: 'choice', values: (v) => [String(v.dayGroup).split(';')[2]] },
    },
    optionCount: 3,
    answer: (v) => String(v.d3),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.d1), String(vars.d2)],
    explanation: ({ vars, answer }) =>
      `ყველაზე მცირე რაოდენობა იყო ${answer}-ს (${vars.v3}).`,
  }),

  // Q28 — უდიდესსა და უმცირესს შორის სხვაობა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-28', subtopicId: 'u10-bar-charts', difficulty: 2 }),
    prompt:
      'ოთხი კლასის მოსწავლეთა რაოდენობებია {a}, {b}, {c} და {d}. რამდენი მოსწავლით მეტია ყველაზე დიდი კლასი ყველაზე პატარაზე?',
    variables: {
      a: { kind: 'int', min: 19, max: 22 },
      b: { kind: 'int', min: 15, max: 18 },
      c: { kind: 'int', min: 23, max: 26 },
      d: { kind: 'int', min: 11, max: 14 },
    },
    answer: (v) => {
      const arr = [Number(v.a), Number(v.b), Number(v.c), Number(v.d)];
      return Math.max(...arr) - Math.min(...arr);
    },
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) => {
      const arr = [Number(vars.a), Number(vars.b), Number(vars.c), Number(vars.d)];
      const maxVal = Math.max(...arr);
      const minVal = Math.min(...arr);
      return `ყველაზე დიდია ${maxVal}, ყველაზე პატარა — ${minVal}. ${maxVal} − ${minVal} = ${answer}.`;
    },
  }),

  // Q29 — ორი სვეტის მონაცემების შეკრება (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-29', subtopicId: 'u10-bar-charts', difficulty: 3 }),
    prompt:
      'სვეტოვანი დიაგრამის მონაცემებია: {c1} — {v1}, {c2} — {v2}, {c3} — {v3}. რამდენია {c2}-ისა და {c3}-ს რაოდენობათა ჯამი?',
    variables: {
      colorGroup: {
        kind: 'choice',
        values: [
          'წითელი;ლურჯი;მწვანე',
          'თეთრი;ყვითელი;შავი',
          'ნარინჯისფერი;ცისფერი;იასამნისფერი',
        ],
      },
      v1: { kind: 'int', min: 5, max: 15 },
      v2: { kind: 'int', min: 8, max: 18 },
      v3: { kind: 'int', min: 6, max: 16 },
      c1: { kind: 'choice', values: (v) => [String(v.colorGroup).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.colorGroup).split(';')[1]] },
      c3: { kind: 'choice', values: (v) => [String(v.colorGroup).split(';')[2]] },
    },
    answer: (v) => Number(v.v2) + Number(v.v3),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.v2} + ${vars.v3} = ${answer}.`,
  }),

  // Q30 — სამი სვეტის საერთო ჯამი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-30', subtopicId: 'u10-bar-charts', difficulty: 3 }),
    prompt:
      'დიაგრამაზე {act}-ს მონაწილეთა რაოდენობებია: {s1} — {v1}, {s2} — {v2}, {s3} — {v3}. რამდენი მონაწილეა სულ?',
    variables: {
      actPack: {
        kind: 'choice',
        values: [
          'სპორტის წრეების;ფეხბურთი;ცურვა;ცეკვა',
          'სასკოლო კლუბების;ჭადრაკი;რობოტოტექნიკა;თეატრი',
          'მუსიკის წრეების;ფორტეპიანო;ვიოლინო;გიტარა',
        ],
      },
      v1: { kind: 'int', min: 12, max: 20 },
      v2: { kind: 'int', min: 9, max: 16 },
      v3: { kind: 'int', min: 8, max: 15 },
      act: { kind: 'choice', values: (v) => [String(v.actPack).split(';')[0]] },
      s1: { kind: 'choice', values: (v) => [String(v.actPack).split(';')[1]] },
      s2: { kind: 'choice', values: (v) => [String(v.actPack).split(';')[2]] },
      s3: { kind: 'choice', values: (v) => [String(v.actPack).split(';')[3]] },
    },
    answer: (v) => Number(v.v1) + Number(v.v2) + Number(v.v3),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.v1} + ${vars.v2} + ${vars.v3} = ${answer} მონაწილე.`,
  }),

  // =========================================================================
  // U10.6 — წერტილოვანი დიაგრამები (Q31–Q36)
  // =========================================================================

  // Q31 — წერტილოვანი დიაგრამის მნიშვნელობის ამოკითხვა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-31', subtopicId: 'u10-dot-plots', difficulty: 1 }),
    prompt:
      'წერტილოვანი დიაგრამის მონაცემებია: 1 ქულა — {a} მოსწავლე, 2 ქულა — {b} მოსწავლე, 3 ქულა — {c} მოსწავლე. რამდენმა მოსწავლემ მიიღო 2 ქულა?',
    variables: {
      a: { kind: 'int', min: 2, max: 8 },
      b: { kind: 'int', min: 2, max: 8 },
      c: { kind: 'int', min: 2, max: 8 },
    },
    answer: (v) => Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ answer }) =>
      `2 ქულის სვეტში წერია ${answer} მოსწავლე.`,
  }),

  // Q32 — ყველაზე ხშირად განმეორებული რიცხვი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-32', subtopicId: 'u10-dot-plots', difficulty: 1 }),
    prompt:
      'წერტილოვან დიაგრამაზე მონაცემებია: {list}. რომელი რიცხვი გვხვდება ყველაზე ხშირად?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '4, 4, 5, 6, 6, 6, 7;6;4;5;7',
          '2, 3, 3, 3, 4, 5, 5;3;2;4;5',
          '1, 2, 2, 4, 4, 4, 4;4;1;2;3',
          '5, 6, 7, 7, 7, 8, 8;7;5;6;8',
          '3, 4, 4, 5, 5, 5, 6;5;3;4;6',
          '6, 7, 8, 8, 8, 8, 9;8;6;7;9',
          '1, 1, 1, 2, 3, 3, 4;1;2;3;4',
          '2, 2, 3, 4, 4, 4, 5;4;2;3;5',
          '7, 8, 8, 9, 9, 9, 10;9;7;8;10',
          '3, 5, 5, 5, 6, 7, 7;5;3;6;7',
          '1, 2, 3, 3, 3, 4, 5;3;1;2;4',
          '5, 5, 6, 6, 6, 7, 8;6;5;7;8',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B'] },
      list: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.w1), Number(vars.w2), Number(vars.w3)],
    explanation: ({ answer }) =>
      `რიცხვი ${answer} სიაში ყველაზე მეტჯერ მეორდება.`,
  }),

  // Q33 — კონკრეტული რიცხვის სიხშირე (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-33', subtopicId: 'u10-dot-plots', difficulty: 2 }),
    prompt:
      'მონაცემებია: {list}. რამდენი წერტილი უნდა განთავსდეს რიცხვ {target}-ის ზემოთ?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '2, 3, 3, 4, 4, 4, 5;3;2',
          '1, 2, 2, 2, 3, 4, 5;2;3',
          '3, 4, 5, 5, 5, 5, 6;5;4',
          '2, 2, 3, 4, 4, 5, 6;2;2',
          '4, 5, 6, 6, 6, 7, 8;6;3',
          '1, 3, 3, 3, 3, 4, 5;3;4',
          '5, 6, 7, 7, 8, 8, 9;7;2',
          '2, 3, 4, 4, 4, 5, 6;4;3',
          '1, 1, 2, 3, 3, 3, 4;3;3',
          '6, 7, 8, 8, 8, 8, 9;8;4',
          '3, 3, 4, 5, 5, 6, 7;3;2',
          '4, 4, 4, 5, 6, 7, 8;4;3',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B'] },
      list: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      target: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      count: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.count),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `რიცხვი ${vars.target} სიაში გვხვდება ${answer}-ჯერ, ამიტომ მის ზემოთ დაისმება ${answer} წერტილი.`,
  }),

  // Q34 — წერტილების საერთო რაოდენობა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-34', subtopicId: 'u10-dot-plots', difficulty: 2 }),
    prompt:
      'წერტილოვანი დიაგრამის მონაცემებია: 1 — {a} წერტილი, 2 — {b} წერტილი, 3 — {c} წერტილი. რამდენი წერტილია სულ?',
    variables: {
      a: { kind: 'int', min: 2, max: 7 },
      b: { kind: 'int', min: 2, max: 7 },
      c: { kind: 'int', min: 2, max: 7 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} = ${answer} წერტილი.`,
  }),

  // Q35 — კონკრეტული მონაცემის ტოლი რაოდენობა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-35', subtopicId: 'u10-dot-plots', difficulty: 3 }),
    prompt:
      'მონაცემებია: {list}. რამდენი მონაცემია {target}-ის ტოლი?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '5, 6, 6, 7, 8, 8, 8, 9;8;3',
          '4, 5, 5, 6, 6, 6, 7, 8;6;3',
          '3, 3, 3, 3, 4, 5, 6, 7;3;4',
          '2, 4, 4, 5, 5, 7, 7, 7;7;3',
          '6, 7, 7, 8, 9, 9, 9, 9;9;4',
          '1, 2, 2, 2, 3, 4, 4, 5;2;3',
          '2, 3, 3, 4, 5, 5, 5, 6;5;3',
          '5, 6, 7, 7, 7, 8, 9, 9;7;3',
          '1, 3, 4, 4, 4, 4, 5, 6;4;4',
          '3, 4, 5, 6, 6, 7, 7, 7;7;3',
          '2, 2, 2, 3, 4, 5, 6, 7;2;3',
          '6, 7, 8, 8, 9, 9, 9, 10;9;3',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B'] },
      list: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      target: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      count: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => Number(v.count),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `${vars.target}-ის ტოლია ${answer} მონაცემი.`,
  }),

  // Q36 — ზღვარზე მეტი წერტილების დათვლა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u10-36', subtopicId: 'u10-dot-plots', difficulty: 3 }),
    prompt:
      'წერტილოვან დიაგრამაზე 2-ის ზემოთ {a} წერტილია, 3-ის ზემოთ — {b}, ხოლო 4-ის ზემოთ — {c}. რამდენი მონაცემია 3-ზე მეტი?',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      b: { kind: 'int', min: 2, max: 7 },
      c: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v) => Number(v.c),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1),
    explanation: ({ vars, answer }) =>
      `3-ზე მეტი არის მხოლოდ 4-იანი, რომლის ზემოთაც არის ${vars.c} წერტილი. ამიტომ პასუხია ${answer}.`,
  }),

  // =========================================================================
  // U10.7 — უფრო მეტად, ნაკლებად ან თანაბრად მოსალოდნელი (Q37–Q42)
  // =========================================================================

  // Q37 — უფრო მოსალოდნელი ფერი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-37', subtopicId: 'u10-more-less-equally-likely', difficulty: 1 }),
    prompt:
      'ჩანთაში არის {a} წითელი და {b} ლურჯი ბურთი. თვალდახუჭული ერთი ბურთის ამოღებისას რომელი ფერის ამოღებაა უფრო მოსალოდნელი?',
    variables: {
      b: { kind: 'int', min: 2, max: 6 },
      diff: { kind: 'int', min: 2, max: 6 },
      a: { kind: 'choice', values: (v) => [Number(v.b) + Number(v.diff)] },
    },
    optionCount: 3,
    answer: () => 'წითელი',
    format: { kind: 'text' },
    distractors: () => ['ლურჯი', 'ორივე თანაბრად მოსალოდნელია'],
    explanation: ({ vars }) =>
      `წითელი ბურთი მეტია (${vars.a} > ${vars.b}), ამიტომ მისი ამოღება უფრო მოსალოდნელია.`,
  }),

  // Q38 — თანაბრად მოსალოდნელი ორი ფერი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-38', subtopicId: 'u10-more-less-equally-likely', difficulty: 1 }),
    prompt:
      'ყუთში {a} {c1} და {a} {c2} ბურთია. რომელი ფერის ამოღებაა უფრო მოსალოდნელი?',
    variables: {
      a: { kind: 'int', min: 3, max: 8 },
      colorPair: {
        kind: 'choice',
        values: [
          'მწვანე;ყვითელი',
          'ლურჯი;წითელი',
          'თეთრი;შავი',
          'ნარინჯისფერი;იასამნისფერი',
        ],
      },
      c1: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[1]] },
    },
    optionCount: 3,
    answer: () => 'ორივე თანაბრად მოსალოდნელია',
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.c1), String(vars.c2)],
    explanation: ({ vars }) =>
      `ორივე ფერის ბურთების რაოდენობა თანაბარია (${vars.a} = ${vars.a}), ამიტომ ორივე თანაბრად მოსალოდნელია.`,
  }),

  // Q39 — ნაკლებად მოსალოდნელი ფერი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-39', subtopicId: 'u10-more-less-equally-likely', difficulty: 2 }),
    prompt:
      'ჩანთაში {a} {c1} და {b} {c2} ბურთია. რომელი ფერის ამოღებაა ნაკლებად მოსალოდნელი?',
    variables: {
      b: { kind: 'int', min: 1, max: 4 },
      diff: { kind: 'int', min: 3, max: 7 },
      a: { kind: 'choice', values: (v) => [Number(v.b) + Number(v.diff)] },
      colorPair: {
        kind: 'choice',
        values: [
          'თეთრი;შავი',
          'წითელი;ყვითელი',
          'ლურჯი;მწვანე',
          'ვარდისფერი;ნარინჯისფერი',
        ],
      },
      c1: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[1]] },
    },
    optionCount: 3,
    answer: (v) => String(v.c2),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.c1), 'ორივე თანაბრად მოსალოდნელია'],
    explanation: ({ vars, answer }) =>
      `${answer} ბურთი ნაკლებია (${vars.b} < ${vars.a}), ამიტომ მისი ამოღება ნაკლებად მოსალოდნელია.`,
  }),

  // Q40 — სამი თანაბარი ფერი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-40', subtopicId: 'u10-more-less-equally-likely', difficulty: 2 }),
    prompt:
      'ყუთში {a} {c1}, {a} {c2} და {a} {c3} ბურთია. რომელი ფერის ამოღებაა უფრო მოსალოდნელი?',
    variables: {
      a: { kind: 'int', min: 2, max: 7 },
      colors: {
        kind: 'choice',
        values: [
          'წითელი;ლურჯი;მწვანე',
          'ყვითელი;თეთრი;შავი',
          'ნარინჯისფერი;ცისფერი;ვარდისფერი',
        ],
      },
      c1: { kind: 'choice', values: (v) => [String(v.colors).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.colors).split(';')[1]] },
      c3: { kind: 'choice', values: (v) => [String(v.colors).split(';')[2]] },
    },
    answer: () => 'ყველა თანაბრად მოსალოდნელია',
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.c1), String(vars.c2), String(vars.c3)],
    explanation: ({ vars }) =>
      `სამივე ფერის ბურთების რაოდენობა თანაბარია (${vars.a}), ამიტომ ყველა თანაბრად მოსალოდნელია.`,
  }),

  // Q41 — მეტი შანსის მქონე ფერი (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-41', subtopicId: 'u10-more-less-equally-likely', difficulty: 3 }),
    prompt:
      'ყუთში {a} {c1} და {b} {c2} ბურთია. რომელი ფერის ამოღების შანსია მეტი?',
    variables: {
      b: { kind: 'int', min: 2, max: 5 },
      diff: { kind: 'int', min: 2, max: 6 },
      a: { kind: 'choice', values: (v) => [Number(v.b) + Number(v.diff)] },
      colorPair: {
        kind: 'choice',
        values: [
          'ყვითელი;მწვანე',
          'წითელი;ლურჯი',
          'თეთრი;შავი',
          'ნარინჯისფერი;იასამნისფერი',
        ],
      },
      c1: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[1]] },
    },
    optionCount: 3,
    answer: (v) => String(v.c1),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.c2), 'თანაბარია'],
    explanation: ({ vars, answer }) =>
      `${answer} ბურთი მეტია (${vars.a} > ${vars.b}), ამიტომ მისი ამოღების შანსი მეტია.`,
  }),

  // Q42 — ალბათობების შედარების დასკვნა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-42', subtopicId: 'u10-more-less-equally-likely', difficulty: 3 }),
    prompt:
      'ჩანთაში {a} {c1} და {a} {c2} ბურთია. რა შეიძლება ითქვას ერთი ბურთის ამოღებაზე?',
    variables: {
      a: { kind: 'int', min: 4, max: 10 },
      colorPair: {
        kind: 'choice',
        values: [
          'ლურჯი;წითელი',
          'მწვანე;ყვითელი',
          'შავი;თეთრი',
          'ნარინჯისფერი;ცისფერი',
        ],
      },
      c1: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[1]] },
    },
    optionCount: 3,
    answer: () => 'ორივე თანაბრად მოსალოდნელია',
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.c1}-ის ამოღება უფრო მოსალოდნელია`,
      `${vars.c2}-ის ამოღება უფრო მოსალოდნელია`,
    ],
    explanation: ({ vars }) =>
      `რადგან ორივე ფერის ბურთების რაოდენობა ტოლია (${vars.a} და ${vars.a}), ორივე თანაბრად მოსალოდნელია.`,
  }),

  // =========================================================================
  // U10.8 — შესაძლებელი და შეუძლებელი მოვლენები (Q43–Q48)
  // =========================================================================

  // Q43 — კამათელზე არსებული რიცხვი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-43', subtopicId: 'u10-possible-impossible', difficulty: 1 }),
    prompt: '{promptText}',
    variables: {
      k: { kind: 'int', min: 1, max: 6 },
      style: { kind: 'choice', values: ['A', 'B'] },
      promptText: {
        kind: 'choice',
        values: (v) => {
          if (v.style === 'A') {
            return [`ჩვეულებრივ ექვსწახნაგა კამათელზე რიცხვებია 1-დან 6-მდე. შესაძლებელია თუ არა ${v.k}-ის დაგდება?`];
          }
          return [`ექვსწახნაგა კამათლის გაგორებისას შესაძლებელია თუ არა ${v.k}-ის მიღება?`];
        },
      },
    },
    optionCount: 2,
    answer: () => 'შესაძლებელია',
    format: { kind: 'text' },
    distractors: () => ['შეუძლებელია'],
    explanation: ({ vars }) =>
      `კამათელზე არის რიცხვი ${vars.k}, ამიტომ მისი დაგდება შესაძლებელია.`,
  }),

  // Q44 — კამათელზე არარსებული რიცხვი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-44', subtopicId: 'u10-possible-impossible', difficulty: 1 }),
    prompt: '{promptText}',
    variables: {
      k: { kind: 'choice', values: ['7', '8', '9', '10', '0', '11', '12'] },
      style: { kind: 'choice', values: ['A', 'B'] },
      promptText: {
        kind: 'choice',
        values: (v) => {
          if (v.style === 'A') {
            return [`ჩვეულებრივ ექვსწახნაგა კამათელზე რიცხვებია 1-დან 6-მდე. შესაძლებელია თუ არა ${v.k}-ის დაგდება?`];
          }
          return [`ექვსწახნაგა კამათლის გაგორებისას შესაძლებელია თუ არა ${v.k}-ის მიღება?`];
        },
      },
    },
    optionCount: 2,
    answer: () => 'შეუძლებელია',
    format: { kind: 'text' },
    distractors: () => ['შესაძლებელია'],
    explanation: ({ vars }) =>
      `კამათელზე მხოლოდ 1-დან 6-მდე რიცხვებია, ამიტომ ${vars.k}-ის დაგდება შეუძლებელია.`,
  }),

  // Q45 — არარსებული ფერის ამოღება (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-45', subtopicId: 'u10-possible-impossible', difficulty: 2 }),
    prompt: '{promptText}',
    variables: {
      colorPair: {
        kind: 'choice',
        values: [
          'წითელი;ლურჯი',
          'მწვანე;ყვითელი',
          'თეთრი;შავი',
          'ლურჯი;წითელი',
          'ყვითელი;მწვანე',
          'შავი;თეთრი',
          'ნარინჯისფერი;ცისფერი',
          'ვარდისფერი;იასამნისფერი',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B'] },
      c1: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[1]] },
      promptText: {
        kind: 'choice',
        values: (v) => {
          if (v.style === 'A') {
            return [`ჩანთაში მხოლოდ ${v.c1} ბურთებია. შესაძლებელია თუ არა ${v.c2} ბურთის ამოღება, თუ ბურთები არ დაემატება?`];
          }
          return [`ყუთში მხოლოდ ${v.c1} ფერის ბურთები აწყვია. შესაძლებელია თუ არა იქიდან ${v.c2} ბურთის ამოღება?`];
        },
      },
    },
    optionCount: 2,
    answer: () => 'შეუძლებელია',
    format: { kind: 'text' },
    distractors: () => ['შესაძლებელია'],
    explanation: ({ vars }) =>
      `ჩანთაში მხოლოდ ${vars.c1} ბურთებია, ამიტომ ${vars.c2} ბურთის ამოღება შეუძლებელია.`,
  }),

  // Q46 — არსებული ფერებიდან ერთ-ერთის ამოღება (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-46', subtopicId: 'u10-possible-impossible', difficulty: 2 }),
    prompt: '{promptText}',
    variables: {
      colorPair: {
        kind: 'choice',
        values: [
          'წითელი;მწვანე',
          'ლურჯი;ყვითელი',
          'თეთრი;შავი',
          'ვარდისფერი;ცისფერი',
          'ნარინჯისფერი;იასამნისფერი',
          'ყავისფერი;მწვანე',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B'] },
      c1: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[1]] },
      promptText: {
        kind: 'choice',
        values: (v) => {
          if (v.style === 'A') {
            return [`ყუთში არის ${v.c1} და ${v.c2} ბარათები. შესაძლებელია თუ არა რომელიმე ამ ორი ფერის ბარათის ამოღება?`];
          }
          return [`ჩანთაში დევს ${v.c1} და ${v.c2} ფერის ბარათები. შესაძლებელია თუ არა ერთ-ერთი მათგანის ამოღება?`];
        },
      },
    },
    optionCount: 2,
    answer: () => 'შესაძლებელია',
    format: { kind: 'text' },
    distractors: () => ['შეუძლებელია'],
    explanation: () =>
      'ყუთში ორივე ფერის ბარათია, ამიტომ მათი ამოღება შესაძლებელია.',
  }),

  // Q47 — კვირის მომდევნო დღის მოვლენა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-47', subtopicId: 'u10-possible-impossible', difficulty: 3 }),
    prompt: '{promptText}',
    variables: {
      dayPair: {
        kind: 'choice',
        values: [
          'კვირა;ორშაბათი',
          'ორშაბათი;სამშაბათი',
          'სამშაბათი;ოთხშაბათი',
          'ოთხშაბათი;ხუთშაბათი',
          'ხუთშაბათი;პარასკევი',
          'პარასკევი;შაბათი',
          'შაბათი;კვირა',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B'] },
      currDay: { kind: 'choice', values: (v) => [String(v.dayPair).split(';')[0]] },
      nextDay: { kind: 'choice', values: (v) => [String(v.dayPair).split(';')[1]] },
      promptText: {
        kind: 'choice',
        values: (v) => {
          if (v.style === 'A') {
            return [`ჩვეულებრივ კალენდარში კვირის დღეებია ორშაბათიდან კვირამდე. შესაძლებელია თუ არა, რომ მომდევნო დღე იყოს ${v.nextDay}, თუ დღეს ${v.currDay}-ა?`];
          }
          return [`თუ დღეს არის ${v.currDay}, შესაძლებელია თუ არა, რომ ხვალ იყოს ${v.nextDay}?`];
        },
      },
    },
    optionCount: 2,
    answer: () => 'შესაძლებელია',
    format: { kind: 'text' },
    distractors: () => ['შეუძლებელია'],
    explanation: ({ vars }) =>
      `${vars.currDay}-ს ყოველთვის მოსდევს ${vars.nextDay}, ამიტომ ეს მოვლენა შესაძლებელია (უეჭველია).`,
  }),

  // Q48 — მხოლოდ ლუწი ბარათებიდან კენტის ამოღება (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-48', subtopicId: 'u10-possible-impossible', difficulty: 3 }),
    prompt: '{promptText}',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '2, 4 და 6;5',
          '2, 4 და 8;7',
          '4, 6 და 8;3',
          '2, 6 და 10;9',
          '6, 8 და 10;5',
          '2, 4, 6 და 8;1',
          '10, 12 და 14;7',
        ],
      },
      style: { kind: 'choice', values: ['A', 'B'] },
      listEven: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      oddNumber: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      promptText: {
        kind: 'choice',
        values: (v) => {
          if (v.style === 'A') {
            return [`ჩანთაში მხოლოდ ${v.listEven} რიცხვიანი ბარათებია. შესაძლებელია თუ არა ${v.oddNumber}-იანი ბარათის ამოღება, თუ ბარათები არ დაემატება?`];
          }
          return [`ყუთში მხოლოდ ${v.listEven} ნომრიანი ბარათები დევს. შესაძლებელია თუ არა ${v.oddNumber}-იანი ბარათის ამოღება?`];
        },
      },
    },
    optionCount: 2,
    answer: () => 'შეუძლებელია',
    format: { kind: 'text' },
    distractors: () => ['შესაძლებელია'],
    explanation: ({ vars }) =>
      `ჩანთაში ${vars.oddNumber}-იანი ბარათი საერთოდ არ დევს, ამიტომ მისი ამოღება შეუძლებელია.`,
  }),

  // =========================================================================
  // U10.9 — ალბათობის ცვლილება (Q49–Q54)
  // =========================================================================

  // Q49 — ბურთების დამატებისას შანსის გაზრდა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-49', subtopicId: 'u10-changing-chances', difficulty: 1 }),
    prompt:
      'ყუთში არის {a} {c1} და {b} {c2} ბურთი. თუ კიდევ {add} {c1} ბურთს დავამატებთ, რომელი ფერის ამოღების შანსი გაიზრდება?',
    variables: {
      a: { kind: 'int', min: 2, max: 5 },
      b: { kind: 'int', min: 4, max: 8 },
      add: { kind: 'int', min: 2, max: 5 },
      colorPair: {
        kind: 'choice',
        values: [
          'წითელი;ლურჯი',
          'მწვანე;ყვითელი',
          'თეთრი;შავი',
          'ნარინჯისფერი;ცისფერი',
        ],
      },
      c1: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[1]] },
    },
    optionCount: 3,
    answer: (v) => String(v.c1),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.c2), 'ორივე ერთნაირად შეიცვლება'],
    explanation: ({ vars, answer }) =>
      `${vars.c1} ბურთების დამატებით იზრდება სწორედ ${answer} ბურთის ამოღების შანსი.`,
  }),

  // Q50 — ერთი ბურთის დამატებით უფრო მოსალოდნელი გახდომა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-50', subtopicId: 'u10-changing-chances', difficulty: 1 }),
    prompt:
      'ჩანთაში {a} {c1} და {b} {c2} ბურთია. თუ ერთ {c2} ბურთს დავამატებთ, {c2} ბურთის ამოღება უფრო მოსალოდნელი გახდება?',
    variables: {
      a: { kind: 'int', min: 4, max: 9 },
      b: { kind: 'int', min: 1, max: 4 },
      colorPair: {
        kind: 'choice',
        values: [
          'მწვანე;ყვითელი',
          'წითელი;ლურჯი',
          'თეთრი;შავი',
          'ნარინჯისფერი;ცისფერი',
        ],
      },
      c1: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[1]] },
    },
    optionCount: 2,
    answer: () => 'დიახ',
    format: { kind: 'text' },
    distractors: () => ['არა'],
    explanation: ({ vars }) =>
      `${vars.c2} ბურთის დამატების შემდეგ მისი წილი იზრდება, ამიტომ მისი ამოღება უფრო მოსალოდნელი ხდება.`,
  }),

  // Q51 — ბურთების ამოღებით მეორე ფერის უპირატესობა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-51', subtopicId: 'u10-changing-chances', difficulty: 2 }),
    prompt:
      'ყუთში {a} {c1} და {a} {c2} ბურთია. თუ {rem} {c2} ბურთს ამოვიღებთ, რომელი ფერის ამოღება გახდება უფრო მოსალოდნელი?',
    variables: {
      a: { kind: 'int', min: 4, max: 8 },
      rem: { kind: 'int', min: 1, max: 3 },
      colorPair: {
        kind: 'choice',
        values: [
          'წითელი;ლურჯი',
          'მწვანე;ყვითელი',
          'შავი;თეთრი',
          'ნარინჯისფერი;ცისფერი',
        ],
      },
      c1: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[1]] },
    },
    optionCount: 3,
    answer: (v) => String(v.c1),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.c2), 'ორივე თანაბრად მოსალოდნელი'],
    explanation: ({ vars, answer }) => {
      const remaining = Number(vars.a) - Number(vars.rem);
      return `${vars.c2} ბურთების ამოღების შემდეგ ყუთში ${vars.c1} ბურთები მეტი დარჩება (${vars.a} > ${remaining}), ამიტომ ${answer}-ის ამოღება გახდება უფრო მოსალოდნელი.`;
    },
  }),

  // Q52 — მეორე ფერის დამატების ეფექტი პირველ ფერზე (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-52', subtopicId: 'u10-changing-chances', difficulty: 2 }),
    prompt:
      'ჩანთაში {a} {c1} და {b} {c2} ბურთია. თუ კიდევ {add} {c2} ბურთს დავამატებთ, {c1} ბურთის ამოღება უფრო მოსალოდნელი გახდება, ნაკლებად მოსალოდნელი თუ შანსი უცვლელი დარჩება?',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      b: { kind: 'int', min: 4, max: 8 },
      add: { kind: 'int', min: 2, max: 4 },
      colorPair: {
        kind: 'choice',
        values: [
          'ყვითელი;მწვანე',
          'წითელი;ლურჯი',
          'თეთრი;შავი',
          'ვარდისფერი;იასამნისფერი',
        ],
      },
      c1: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[1]] },
    },
    optionCount: 3,
    answer: () => 'ნაკლებად მოსალოდნელი',
    format: { kind: 'text' },
    distractors: () => ['უფრო მოსალოდნელი', 'შანსი უცვლელია'],
    explanation: ({ vars }) =>
      `მეორე ფერის (${vars.c2}) დამატების გამო ${vars.c1}-ის წილი მცირდება, ამიტომ ${vars.c1}-ის ამოღება ნაკლებად მოსალოდნელი ხდება.`,
  }),

  // Q53 — პირველი ფერის ამოღებით მეორის შანსის ზრდა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-53', subtopicId: 'u10-changing-chances', difficulty: 3 }),
    prompt:
      'ყუთში {a} {c1} და {b} {c2} ბურთია. თუ {rem} {c1} ბურთს ამოვიღებთ, რომელი ფერის ამოღების შანსი გაიზრდება?',
    variables: {
      a: { kind: 'int', min: 5, max: 9 },
      b: { kind: 'int', min: 2, max: 5 },
      rem: { kind: 'int', min: 2, max: 4 },
      colorPair: {
        kind: 'choice',
        values: [
          'წითელი;ლურჯი',
          'მწვანე;ყვითელი',
          'შავი;თეთრი',
          'ნარინჯისფერი;ცისფერი',
        ],
      },
      c1: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[1]] },
    },
    optionCount: 3,
    answer: (v) => String(v.c2),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.c1), 'ორივე თანაბრად შეიცვლება'],
    explanation: ({ vars, answer }) =>
      `${vars.c1} ბურთების შემცირების გამო მთლიან რაოდენობაში ${vars.c2}-ის წილი იზრდება, ამიტომ ${answer}-ის ამოღების შანსი იზრდება.`,
  }),

  // Q54 — თანაბარიდან დამატება (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u10-54', subtopicId: 'u10-changing-chances', difficulty: 3 }),
    prompt:
      'ჩანთაში {a} {c1} და {a} {c2} ბურთია. თუ კიდევ {add} {c1} ბურთს დავამატებთ, რომელი ფერის ამოღება გახდება უფრო მოსალოდნელი?',
    variables: {
      a: { kind: 'int', min: 3, max: 8 },
      add: { kind: 'int', min: 2, max: 5 },
      colorPair: {
        kind: 'choice',
        values: [
          'წითელი;ლურჯი',
          'მწვანე;ყვითელი',
          'თეთრი;შავი',
          'ნარინჯისფერი;ცისფერი',
        ],
      },
      c1: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.colorPair).split(';')[1]] },
    },
    optionCount: 3,
    answer: (v) => String(v.c1),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.c2), 'ორივე თანაბრად მოსალოდნელი'],
    explanation: ({ vars, answer }) => {
      const tot = Number(vars.a) + Number(vars.add);
      return `${vars.c1} ბურთების რაოდენობა გახდება ${tot}, რაც აღემატება ${vars.c2}-ს (${vars.a}), ამიტომ ${answer}-ის ამოღება უფრო მოსალოდნელია.`;
    },
  }),
];
