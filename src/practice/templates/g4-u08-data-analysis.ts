import { defineTemplate, QuestionTemplate } from './types';

/**
 * Grade 4 — Unit 8: მონაცემთა ანალიზი (Data Analysis)
 *
 * Covers 7 subtopics (42 templates total: Q01–Q42, 6 per subtopic):
 *   U08.1 — მონაცემების შეგროვება (u08-data-collection)
 *   U08.2 — მონაცემების შერჩევა (u08-data-selection)
 *   U08.3 — ცხრილების წაკითხვა (u08-reading-tables)
 *   U08.4 — დიაგრამების წაკითხვა (u08-reading-charts)
 *   U08.5 — პიქტოგრამები (u08-pictograms)
 *   U08.6 — სვეტოვანი დიაგრამები (u08-bar-charts)
 *   U08.7 — სიხშირეთა ცხრილები (u08-frequency-tables)
 */

export const G4_U08_SUBTOPICS = [
  'u08-data-collection',
  'u08-data-selection',
  'u08-reading-tables',
  'u08-reading-charts',
  'u08-pictograms',
  'u08-bar-charts',
  'u08-frequency-tables',
] as const;

export type G4U08SubtopicId = (typeof G4_U08_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G4U08SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 4 as const,
  topicId: 'g4-monacemta-analizi' as const,
  unitId: 'g4-monacemta-analizi' as const,
  ...options,
});

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

export const G4_U08_TEMPLATES: QuestionTemplate[] = [
  // g4-u08-01 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u08-01', subtopicId: 'u08-data-collection', difficulty: 1 }),
    prompt: 'კლასში {a} მოსწავლეს უყვარს ფეხბურთი, {b}-ს — კალათბურთი, ხოლო {c}-ს — ცურვა. რამდენმა მოსწავლემ დაასახელა საყვარელი სპორტის სახეობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|8|5", "14|9|6", "10|7|8", "15|10|5", "11|9|7", "13|8|6", "16|7|4", "12|10|6", "14|8|7", "11|11|5", "15|9|6", "13|10|4"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `სულ საყვარელი სპორტი დაასახელა: ${vars.a} + ${vars.b} + ${vars.c} = ${answer} მოსწავლემ.`,
  }),

  // g4-u08-02 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u08-02', subtopicId: 'u08-data-collection', difficulty: 1 }),
    prompt: 'მოსწავლეებმა ჩაიწერეს კვირის ტემპერატურა (ორშაბათიდან კვირამდე): {temps}. რომელ დღეს დაფიქსირდა ყველაზე მაღალი ტემპერატურა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["18, 20, 19, 21, 25, 20, 17|პარასკევი|25", "20, 24, 21, 19, 22, 21, 18|სამშაბათი|24", "17, 19, 23, 20, 22, 18, 16|ოთხშაბათი|23", "19, 21, 20, 26, 22, 23, 18|ხუთშაბათი|26", "16, 18, 20, 21, 22, 27, 21|შაბათი|27", "21, 22, 20, 19, 23, 22, 28|კვირა|28", "25, 20, 22, 21, 19, 18, 17|ორშაბათი|25", "19, 22, 26, 21, 20, 19, 18|ოთხშაბათი|26", "18, 21, 20, 25, 22, 19, 17|ხუთშაბათი|25", "17, 20, 21, 22, 27, 23, 19|პარასკევი|27", "19, 21, 22, 20, 23, 28, 22|შაბათი|28", "20, 23, 21, 22, 24, 22, 29|კვირა|29"],
      },
      temps: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      day: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      maxT: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.day),
    options: (v) => {
      const allDays = ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი', 'კვირა'];
      const correct = String(v.day);
      const rest = allDays.filter(d => d !== correct).slice(0, 3);
      return [correct, ...rest];
    },
    explanation: ({ vars, answer }) => `ყველაზე მაღალი ტემპერატურა იყო ${vars.maxT}°C და ის დაფიქსირდა დღეს: ${answer}.`,
  }),

  // g4-u08-03 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u08-03', subtopicId: 'u08-data-collection', difficulty: 2 }),
    prompt: 'მოსწავლეებს ჰკითხეს საყვარელი ხილის შესახებ: {c1}-მა დაასახელა {f1}, {c2}-მა — {f2}, ხოლო {c3}-მა — {f3}. რომელი ხილი დაასახელეს ყველაზე ხშირად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["7|ვაშლი|3|ბანანი|2|მანდარინი|ვაშლი", "3|ვაშლი|8|ბანანი|4|მანდარინი|ბანანი", "4|ვაშლი|2|ბანანი|9|მანდარინი|მანდარინი", "9|ვაშლი|5|ბანანი|3|მანდარინი|ვაშლი", "2|ვაშლი|10|ბანანი|4|მანდარინი|ბანანი", "5|ვაშლი|3|ბანანი|8|მანდარინი|მანდარინი", "8|ვაშლი|4|ბანანი|3|მანდარინი|ვაშლი", "3|ვაშლი|7|ბანანი|2|მანდარინი|ბანანი", "2|ვაშლი|4|ბანანი|8|მანდარინი|მანდარინი", "10|ვაშლი|4|ბანანი|3|მანდარინი|ვაშლი", "4|ვაშლი|9|ბანანი|3|მანდარინი|ბანანი", "3|ვაშლი|2|ბანანი|9|მანდარინი|მანდარინი"],
      },
      c1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      c2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      f2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      c3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
      f3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[5]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[6]] },
    },
    answer: (v) => String(v.ans),
    options: () => ['ვაშლი', 'ბანანი', 'მანდარინი', 'მსხალი'],
    explanation: ({ answer }) => `ყველაზე მეტმა მოსწავლემ დაასახელა: ${answer}.`,
  }),

  // g4-u08-04 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u08-04', subtopicId: 'u08-data-collection', difficulty: 2 }),
    prompt: 'სკოლის ეზოში დაითვალეს ხეები: {a} ფიჭვი, {b} ნაძვი და {c} ნეკერჩხალი. რამდენი ხე დაითვალეს სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["15|12|8", "18|14|9", "20|15|10", "16|13|7", "14|11|9", "22|16|8", "17|15|11", "19|13|8", "21|14|12", "16|12|10", "25|15|9", "18|17|10"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `სულ დაითვალეს: ${vars.a} + ${vars.b} + ${vars.c} = ${answer} ხე.`,
  }),

  // g4-u08-05 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u08-05', subtopicId: 'u08-data-collection', difficulty: 3 }),
    prompt: 'ხუთი დღის განმავლობაში მაღაზიამ გაყიდა {d1}, {d2}, {d3}, {d4} და {d5} პური. რამდენი პური გაიყიდა ამ ხუთ დღეში სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["24|30|28|35|33", "20|25|30|22|28", "32|28|35|30|25", "26|34|29|31|30", "25|35|20|40|30", "27|33|28|32|30", "31|29|34|28|33", "22|28|35|33|32", "30|32|29|36|28", "24|28|32|36|30", "35|25|30|32|28", "28|30|32|34|26"],
      },
      d1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      d4: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      d5: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
    },
    answer: (v) => Number(v.d1) + Number(v.d2) + Number(v.d3) + Number(v.d4) + Number(v.d5),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 5),
    explanation: ({ vars, answer }) => `ხუთი დღის ჯამია: ${vars.d1} + ${vars.d2} + ${vars.d3} + ${vars.d4} + ${vars.d5} = ${answer} პური.`,
  }),

  // g4-u08-06 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u08-06', subtopicId: 'u08-data-collection', difficulty: 3 }),
    prompt: 'მოსწავლეთა მიერ თვეში წაკითხული წიგნების რაოდენობაა: {listStr}. რამდენმა მოსწავლემ წაიკითხა ზუსტად {target} წიგნი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2, 3, 1, 4, 3, 2, 5, 3|3|3", "1, 2, 4, 2, 2, 3, 5, 2|2|4", "3, 4, 1, 4, 2, 4, 4, 5|4|4", "2, 1, 1, 3, 1, 4, 2, 1|1|4", "4, 5, 2, 5, 3, 5, 1, 5|5|4", "3, 2, 3, 4, 3, 1, 3, 5|3|4", "2, 4, 2, 3, 2, 5, 2, 1|2|4", "1, 3, 4, 3, 2, 3, 5, 3|3|4", "4, 1, 4, 2, 4, 3, 5, 4|4|4", "5, 2, 5, 3, 5, 1, 4, 5|5|4", "1, 2, 1, 4, 1, 3, 5, 1|1|4", "3, 5, 3, 2, 3, 4, 1, 3|3|4"],
      },
      listStr: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      target: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 0, 1),
    explanation: ({ vars, answer }) => `ჩამონათვალში რიცხვი ${vars.target} გვხვდება ზუსტად ${answer}-ჯერ.`,
  }),

  // g4-u08-07 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u08-07', subtopicId: 'u08-data-selection', difficulty: 1 }),
    prompt: 'მოცემულია რიცხვები: {listStr}. რამდენი რიცხვია {bound}-ზე მეტი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12, 7, 18, 5, 14, 9|10|3", "8, 15, 6, 21, 11, 4|10|3", "13, 19, 4, 8, 16, 11|10|4", "5, 9, 14, 17, 8, 12|10|3", "11, 15, 18, 7, 3, 14|10|4", "6, 12, 8, 16, 20, 9|10|3", "14, 5, 19, 22, 7, 11|10|4", "7, 13, 8, 17, 9, 15|10|3", "15, 18, 12, 6, 9, 21|10|4", "4, 8, 16, 13, 7, 19|10|3", "12, 17, 11, 14, 8, 5|10|4", "9, 16, 7, 18, 13, 6|10|3"],
      },
      listStr: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      bound: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 0, 1),
    explanation: ({ vars, answer }) => `მონაცემებიდან ${vars.bound}-ზე მეტია ზუსტად ${answer} რიცხვი.`,
  }),

  // g4-u08-08 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u08-08', subtopicId: 'u08-data-selection', difficulty: 1 }),
    prompt: 'მოცემულია ტემპერატურები: {listStr}. რამდენი ტემპერატურაა {bound}°C-ზე მაღალი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["16°C, 21°C, 19°C, 24°C, 18°C|20|2", "22°C, 18°C, 25°C, 23°C, 19°C|20|3", "17°C, 23°C, 26°C, 18°C, 21°C|20|3", "19°C, 24°C, 18°C, 22°C, 17°C|20|2", "25°C, 21°C, 26°C, 19°C, 22°C|20|4", "18°C, 20°C, 23°C, 27°C, 19°C|20|2", "21°C, 22°C, 19°C, 25°C, 18°C|20|3", "16°C, 19°C, 24°C, 22°C, 18°C|20|2", "23°C, 25°C, 21°C, 26°C, 19°C|20|4", "18°C, 22°C, 20°C, 24°C, 17°C|20|2", "21°C, 24°C, 22°C, 18°C, 25°C|20|4", "19°C, 23°C, 25°C, 18°C, 21°C|20|3"],
      },
      listStr: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      bound: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 0, 1),
    explanation: ({ vars, answer }) => `${vars.bound}°C-ზე მაღალია სულ ${answer} ტემპერატურა.`,
  }),

  // g4-u08-09 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u08-09', subtopicId: 'u08-data-selection', difficulty: 2 }),
    prompt: 'მაღაზიაში გაყიდული ნივთების რაოდენობებია: {listStr}. რამდენი რაოდენობაა {bound}-ზე მეტი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["15, 28, 32, 19, 40, 25|25|3", "26, 18, 35, 42, 24, 30|25|4", "14, 29, 31, 20, 25, 38|25|3", "33, 27, 45, 19, 22, 36|25|4", "18, 26, 25, 34, 41, 15|25|3", "28, 32, 40, 50, 22, 19|25|4", "20, 30, 24, 35, 28, 17|25|3", "27, 36, 19, 42, 31, 23|25|4", "16, 29, 22, 38, 25, 45|25|3", "34, 28, 26, 40, 18, 30|25|5", "15, 33, 28, 21, 37, 24|25|3", "29, 41, 35, 22, 28, 19|25|4"],
      },
      listStr: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      bound: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 0, 1),
    explanation: ({ vars, answer }) => `${vars.bound}-ზე მეტია სულ ${answer} მონაცემი (25-ის ტოლი არ ითვლება).`,
  }),

  // g4-u08-10 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u08-10', subtopicId: 'u08-data-selection', difficulty: 2 }),
    prompt: 'მოსწავლეთა ასაკებია: {listStr}. რამდენი მოსწავლეა {target} წლის?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["9, 10, 10, 11, 9, 10, 11, 12|10|3", "10, 9, 9, 10, 9, 11, 9, 10|9|4", "10, 11, 11, 10, 12, 11, 11, 9|11|4", "9, 10, 10, 10, 11, 10, 12, 9|10|4", "11, 9, 9, 10, 9, 11, 9, 12|9|4", "10, 11, 12, 11, 10, 11, 11, 9|11|4", "9, 10, 10, 11, 10, 10, 12, 9|10|4", "11, 9, 10, 9, 9, 12, 9, 10|9|4", "10, 11, 11, 12, 11, 10, 11, 9|11|4", "9, 10, 10, 10, 9, 10, 11, 10|10|5", "11, 9, 9, 9, 10, 9, 12, 9|9|5", "10, 11, 11, 11, 12, 11, 10, 11|11|5"],
      },
      listStr: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      target: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 0, 1),
    explanation: ({ vars, answer }) => `სიაში ${vars.target} გვხვდება ზუსტად ${answer}-ჯერ.`,
  }),

  // g4-u08-11 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u08-11', subtopicId: 'u08-data-selection', difficulty: 3 }),
    prompt: 'მოცემულია რიცხვები: {listStr}. რამდენი ლუწი რიცხვია ამ ჩამონათვალში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["24, 36, 45, 52, 63, 70|4", "15, 28, 33, 46, 50, 67|3", "12, 18, 24, 35, 42, 55|4", "21, 34, 47, 56, 68, 79|3", "14, 22, 38, 44, 51, 60|5", "25, 37, 48, 59, 62, 74|3", "16, 26, 32, 45, 54, 66|5", "23, 35, 42, 57, 64, 78|3", "18, 30, 44, 52, 68, 71|5", "27, 36, 49, 58, 65, 72|3", "20, 34, 46, 58, 62, 70|6", "29, 41, 52, 63, 74, 85|2"],
      },
      listStr: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 0, 1),
    explanation: ({ answer }) => `ლუწია ის რიცხვები, რომლებიც 0, 2, 4, 6 ან 8-ით ბოლოვდება. სულ ასეთი ${answer} რიცხვია.`,
  }),

  // g4-u08-12 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u08-12', subtopicId: 'u08-data-selection', difficulty: 3 }),
    prompt: 'წიგნების რაოდენობა თაროებზეა: {listStr}. რამდენ თაროზეა {bound}-ზე მეტი წიგნი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["48, 52, 37, 64, 29, 80|50|3", "55, 62, 45, 71, 38, 51|50|4", "42, 58, 66, 39, 74, 49|50|3", "53, 67, 72, 85, 41, 59|50|5", "36, 51, 60, 44, 75, 48|50|3", "54, 65, 70, 48, 52, 81|50|5", "46, 57, 63, 35, 78, 41|50|3", "56, 68, 77, 82, 51, 47|50|5", "39, 53, 61, 45, 76, 43|50|3", "58, 64, 73, 52, 69, 85|50|6", "47, 54, 62, 33, 79, 46|50|3", "51, 63, 75, 80, 55, 42|50|5"],
      },
      listStr: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      bound: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 0, 1),
    explanation: ({ vars, answer }) => `${vars.bound}-ზე მეტი წიგნი არის ზუსტად ${answer} თაროზე.`,
  }),

  // g4-u08-13 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u08-13', subtopicId: 'u08-reading-tables', difficulty: 1 }),
    prompt: 'ცხრილში მოცემულია მონაცემები: ვაშლი — {c1}, ბანანი — {c2}, მსხალი — {c3}, ატამი — {c4}. რომელი ხილია ყველაზე პოპულარული?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|5|6|4|ვაშლი", "5|9|6|4|ბანანი", "6|5|10|4|მსხალი", "4|5|6|11|ატამი", "9|6|7|5|ვაშლი", "5|10|7|4|ბანანი", "6|7|11|5|მსხალი", "5|6|7|12|ატამი", "12|7|8|6|ვაშლი", "6|13|7|5|ბანანი", "7|8|14|6|მსხალი", "6|7|8|15|ატამი"],
      },
      c1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      c2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      c4: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => String(v.ans),
    options: () => ['ვაშლი', 'ბანანი', 'მსხალი', 'ატამი'],
    explanation: ({ answer }) => `ცხრილის მიხედვით ყველაზე მეტმა მოსწავლემ აირჩია: ${answer}.`,
  }),

  // g4-u08-14 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u08-14', subtopicId: 'u08-reading-tables', difficulty: 1 }),
    prompt: 'ცხრილის მიხედვით: ვაშლი — {c1}, ბანანი — {c2}, მსხალი — {c3}, ატამი — {c4}. რამდენმა მოსწავლემ დაასახელა ბანანი ან მსხალი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|5|6|4", "7|6|8|5", "9|7|5|6", "10|8|7|4", "8|6|9|5", "11|9|6|4", "6|8|7|5", "9|6|10|4", "7|9|8|6", "10|7|9|5", "8|10|7|4", "12|8|9|6"],
      },
      c1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      c2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      c4: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.c2) + Number(v.c3),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ბანანისა (${vars.c2}) და მსხლის (${vars.c3}) არჩევანთა ჯამია: ${vars.c2} + ${vars.c3} = ${answer}.`,
  }),

  // g4-u08-15 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u08-15', subtopicId: 'u08-reading-tables', difficulty: 2 }),
    prompt: 'მაღაზიაში გაყიდული რვეულებია: ორშაბათი — {c1}, სამშაბათი — {c2}, ოთხშაბათი — {c3}, ხუთშაბათი — {c4}. რომელ დღეს გაიყიდა ყველაზე მეტი რვეული?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["25|32|28|35|ხუთშაბათი", "38|30|25|32|ორშაბათი", "26|40|31|28|სამშაბათი", "24|29|42|35|ოთხშაბათი", "28|33|29|36|ხუთშაბათი", "45|32|28|30|ორშაბათი", "27|48|34|31|სამშაბათი", "25|30|50|38|ოთხშაბათი", "30|35|32|52|ხუთშაბათი", "55|38|30|34|ორშაბათი", "29|56|36|33|სამშაბათი", "28|34|58|40|ოთხშაბათი"],
      },
      c1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      c2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      c4: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => String(v.ans),
    options: () => ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი'],
    explanation: ({ answer }) => `ყველაზე მეტი რვეული გაიყიდა: ${answer}.`,
  }),

  // g4-u08-16 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u08-16', subtopicId: 'u08-reading-tables', difficulty: 2 }),
    prompt: 'მაღაზიაში გაყიდული რვეულებია: ორშაბათი — {c1}, სამშაბათი — {c2}, ოთხშაბათი — {c3}, ხუთშაბათი — {c4}. რამდენი რვეული გაიყიდა ოთხივე დღეს სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["25|32|28|35", "20|30|25|35", "30|28|32|30", "22|34|26|38", "25|35|30|40", "28|32|34|36", "31|29|35|25", "24|36|28|32", "35|25|30|30", "26|32|38|34", "30|35|25|40", "27|33|35|35"],
      },
      c1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      c2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      c4: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.c1) + Number(v.c2) + Number(v.c3) + Number(v.c4),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 5),
    explanation: ({ vars, answer }) => `ოთხივე დღის ჯამია: ${vars.c1} + ${vars.c2} + ${vars.c3} + ${vars.c4} = ${answer} რვეული.`,
  }),

  // g4-u08-17 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u08-17', subtopicId: 'u08-reading-tables', difficulty: 3 }),
    prompt: 'სპორტულ წრეშია: ფეხბურთი — {c1}, კალათბურთი — {c2}, ცურვა — {c3}, ჩოგბურთი — {c4}. რამდენით მეტი მოსწავლე დადის ფეხბურთზე, ვიდრე ჩოგბურთზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["18|12|9|6", "20|14|10|7", "22|15|11|8", "24|16|12|9", "19|13|10|5", "21|14|9|6", "25|18|12|10", "23|15|10|7", "26|17|13|8", "20|12|8|5", "27|18|14|9", "22|16|11|6"],
      },
      c1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      c2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      c4: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.c1) - Number(v.c4),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `სხვაობაა: ${vars.c1} − ${vars.c4} = ${answer} მოსწავლე.`,
  }),

  // g4-u08-18 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u08-18', subtopicId: 'u08-reading-tables', difficulty: 3 }),
    prompt: 'ბიბლიოთეკაშია: ზღაპრები — {c1}, მეცნიერება — {c2}, ისტორია — {c3}, ხელოვნება — {c4}. რამდენი წიგნია ზღაპრებისა და მეცნიერების განყოფილებებში ერთად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["125|90|75|60", "140|85|80|55", "110|95|70|65", "135|100|85|50", "150|80|90|60", "120|105|75|70", "130|95|80|65", "145|90|85|55", "160|100|90|70", "115|85|70|60", "155|95|80|65", "125|110|85|75"],
      },
      c1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      c2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      c4: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.c1) + Number(v.c2),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `ზღაპრებისა და მეცნიერების წიგნების ჯამია: ${vars.c1} + ${vars.c2} = ${answer}.`,
  }),

  // g4-u08-19 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u08-19', subtopicId: 'u08-reading-charts', difficulty: 1 }),
    prompt: 'დიაგრამაზე მოცემულია გაყიდული ნაყინის რაოდენობა: ორშაბათი — {v1}, სამშაბათი — {v2}, ოთხშაბათი — {v3}, ხუთშაბათი — {v4}. რომელ დღეს გაიყიდა ყველაზე მეტი ნაყინი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|18|15|20|ხუთშაბათი", "22|15|18|14|ორშაბათი", "14|25|19|16|სამშაბათი", "15|18|26|20|ოთხშაბათი", "16|20|18|28|ხუთშაბათი", "30|22|19|24|ორშაბათი", "18|32|25|21|სამშაბათი", "19|22|35|26|ოთხშაბათი", "20|24|22|36|ხუთშაბათი", "38|25|28|30|ორშაბათი", "21|40|29|25|სამშაბათი", "22|26|42|30|ოთხშაბათი"],
      },
      v1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      v2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      v3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      v4: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => String(v.ans),
    options: () => ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი'],
    explanation: ({ answer }) => `დიაგრამის მიხედვით ყველაზე მაღალი სვეტია: ${answer}.`,
  }),

  // g4-u08-20 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u08-20', subtopicId: 'u08-reading-charts', difficulty: 1 }),
    prompt: 'დიაგრამის მიხედვით გაიყიდა: სამშაბათს — {v2}, ოთხშაბათს — {v3}. რამდენი ნაყინი გაიყიდა ამ ორ დღეს ერთად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["18|15", "20|16", "22|18", "25|19", "19|17", "21|14", "24|20", "26|18", "23|17", "27|21", "25|22", "28|20"],
      },
      v2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      v3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.v2) + Number(v.v3),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `სამშაბათისა და ოთხშაბათის ჯამია: ${vars.v2} + ${vars.v3} = ${answer}.`,
  }),

  // g4-u08-21 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u08-21', subtopicId: 'u08-reading-charts', difficulty: 2 }),
    prompt: 'დიაგრამაზე ნაჩვენებია მოსწავლეთა რაოდენობა: IVა — {c1}, IVბ — {c2}, IVგ — {c3}, IVდ — {c4}. რომელ კლასშია ყველაზე ცოტა მოსწავლე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["24|27|22|25|IVგ", "21|26|28|24|IVა", "25|20|27|29|IVბ", "26|28|25|19|IVდ", "25|28|23|26|IVგ", "20|27|29|25|IVა", "26|21|28|30|IVბ", "27|29|26|22|IVდ", "27|30|24|28|IVგ", "22|28|30|26|IVა", "28|23|29|31|IVბ", "29|31|28|23|IVდ"],
      },
      c1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      c2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      c4: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => String(v.ans),
    options: () => ['IVა', 'IVბ', 'IVგ', 'IVდ'],
    explanation: ({ answer }) => `ყველაზე დაბალი მაჩვენებელი აქვს: ${answer} კლასს.`,
  }),

  // g4-u08-22 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u08-22', subtopicId: 'u08-reading-charts', difficulty: 2 }),
    prompt: 'დიაგრამის მიხედვით: IVბ კლასში არის {c2} მოსწავლე, ხოლო IVგ კლასში — {c3} მოსწავლე. რამდენით მეტი მოსწავლეა IVბ-ში, ვიდრე IVგ-ში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["27|22", "28|21", "30|23", "29|24", "26|20", "31|25", "28|22", "32|26", "29|21", "30|22", "27|20", "33|25"],
      },
      c2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      c3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.c2) - Number(v.c3),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `სხვაობაა: ${vars.c2} − ${vars.c3} = ${answer} მოსწავლე.`,
  }),

  // g4-u08-23 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u08-23', subtopicId: 'u08-reading-charts', difficulty: 3 }),
    prompt: 'დიაგრამაზე ნაჩვენებია ხუთ დღეში წაკითხული გვერდების რაოდენობა: {p1}, {p2}, {p3}, {p4}, {p5}. სულ რამდენი გვერდი წაიკითხეს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["20|25|30|15|35", "18|22|28|16|32", "25|30|35|20|40", "22|26|32|18|36", "15|25|35|20|30", "24|28|30|22|34", "19|23|29|17|31", "26|30|34|24|38", "20|30|25|35|40", "21|25|31|19|33", "28|32|36|22|42", "17|27|33|21|35"],
      },
      p1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      p3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      p4: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      p5: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
    },
    answer: (v) => Number(v.p1) + Number(v.p2) + Number(v.p3) + Number(v.p4) + Number(v.p5),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 5),
    explanation: ({ vars, answer }) => `ხუთი დღის ჯამია: ${vars.p1} + ${vars.p2} + ${vars.p3} + ${vars.p4} + ${vars.p5} = ${answer} გვერდი.`,
  }),

  // g4-u08-24 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u08-24', subtopicId: 'u08-reading-charts', difficulty: 3 }),
    prompt: 'დიაგრამაზე ნაჩვენებია ხილის რაოდენობა: ვაშლი — {f1}, მსხალი — {f2}, ბანანი — {f3}, ატამი — {f4}. რამდენით მეტია ბანანის რაოდენობა ატმის რაოდენობაზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["16|12|20|8", "18|14|24|10", "15|11|22|9", "20|16|26|12", "17|13|23|11", "19|15|25|10", "21|16|28|12", "18|12|27|9", "22|17|30|14", "16|10|24|8", "23|18|32|15", "20|14|29|11"],
      },
      f1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      f2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      f3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      f4: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.f3) - Number(v.f4),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `სხვაობაა: ${vars.f3} − ${vars.f4} = ${answer}.`,
  }),

  // g4-u08-25 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u08-25', subtopicId: 'u08-pictograms', difficulty: 1 }),
    prompt: 'პიქტოგრამაზე ერთი ვარსკვლავი (★) აღნიშნავს {per} წიგნს. თუ გამოსახულია {icons} ({n} სიმბოლო), რამდენი წიგნია სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|★★★★|4", "5|★★★★★|5", "5|★★★|3", "5|★★★★★★|6", "4|★★★★|4", "4|★★★★★|5", "4|★★★★★★|6", "4|★★★|3", "6|★★★|3", "6|★★★★|4", "6|★★★★★|5", "6|★★★★★★|6"],
      },
      per: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      icons: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.per) * Number(v.n),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 5),
    explanation: ({ vars, answer }) => `თითო სიმბოლო აღნიშნავს ${vars.per}-ს: ${vars.n} × ${vars.per} = ${answer} წიგნი.`,
  }),

  // g4-u08-26 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u08-26', subtopicId: 'u08-pictograms', difficulty: 1 }),
    prompt: 'პიქტოგრამაზე ერთი სიმბოლო (🍎) აღნიშნავს {per} ვაშლს. თუ გამოსახულია {icons} ({n} სიმბოლო), რამდენი ვაშლია სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|🍎🍎🍎🍎🍎|5", "4|🍎🍎🍎🍎|4", "4|🍎🍎🍎🍎🍎🍎|6", "4|🍎🍎🍎|3", "3|🍎🍎🍎🍎|4", "3|🍎🍎🍎🍎🍎|5", "3|🍎🍎🍎🍎🍎🍎|6", "3|🍎🍎🍎|3", "5|🍎🍎🍎|3", "5|🍎🍎🍎🍎|4", "5|🍎🍎🍎🍎🍎|5", "5|🍎🍎🍎🍎🍎🍎|6"],
      },
      per: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      icons: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.per) * Number(v.n),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 4),
    explanation: ({ vars, answer }) => `სულ არის: ${vars.n} × ${vars.per} = ${answer} ვაშლი.`,
  }),

  // g4-u08-27 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u08-27', subtopicId: 'u08-pictograms', difficulty: 2 }),
    prompt: 'პიქტოგრამაზე ერთი სიმბოლო (⚽) აღნიშნავს {per} ბურთს. თუ გუნდს აქვს {icons} ({n} სიმბოლო), რამდენ ბურთს აღნიშნავს ეს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|⚽⚽⚽⚽|4", "3|⚽⚽⚽⚽⚽|5", "3|⚽⚽⚽⚽⚽⚽|6", "3|⚽⚽⚽|3", "4|⚽⚽⚽|3", "4|⚽⚽⚽⚽|4", "4|⚽⚽⚽⚽⚽|5", "4|⚽⚽⚽⚽⚽⚽|6", "5|⚽⚽⚽|3", "5|⚽⚽⚽⚽|4", "5|⚽⚽⚽⚽⚽|5", "5|⚽⚽⚽⚽⚽⚽|6"],
      },
      per: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      icons: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.per) * Number(v.n),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 3),
    explanation: ({ vars, answer }) => `ბურთების რაოდენობაა: ${vars.n} × ${vars.per} = ${answer}.`,
  }),

  // g4-u08-28 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u08-28', subtopicId: 'u08-pictograms', difficulty: 2 }),
    prompt: 'პიქტოგრამაზე ერთი სიმბოლო (🌼) აღნიშნავს {per} ყვავილს. პირველ ნაკვეთს აქვს {n1} სიმბოლო, ხოლო მეორეს — {n2} სიმბოლო. რამდენით მეტი ყვავილია პირველ ნაკვეთზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|6|4", "2|7|3", "2|8|5", "3|5|3", "3|6|4", "3|7|4", "4|6|3", "4|5|2", "4|7|4", "5|5|3", "5|6|4", "5|7|4"],
      },
      per: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => (Number(v.n1) - Number(v.n2)) * Number(v.per),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `სიმბოლოების სხვაობაა ${vars.n1} − ${vars.n2} = ${Number(vars.n1) - Number(vars.n2)}. რადგან 1 სიმბოლო = ${vars.per} ყვავილს, სხვაობაა: ${Number(vars.n1) - Number(vars.n2)} × ${vars.per} = ${answer} ყვავილი.`,
  }),

  // g4-u08-29 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u08-29', subtopicId: 'u08-pictograms', difficulty: 3 }),
    prompt: 'პიქტოგრამაზე ერთი სიმბოლო (📘) აღნიშნავს {per} წიგნს. თუ ბიბლიოთეკის პიქტოგრამაზე გამოსახულია {n} სიმბოლო, სულ რამდენ წიგნს აღნიშნავს ისინი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10|7", "10|8", "10|6", "10|9", "10|5", "10|10", "20|4", "20|5", "20|6", "20|7", "25|4", "25|5"],
      },
      per: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.per) * Number(v.n),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `სულ არის: ${vars.n} × ${vars.per} = ${answer} წიგნი.`,
  }),

  // g4-u08-30 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u08-30', subtopicId: 'u08-pictograms', difficulty: 3 }),
    prompt: 'პიქტოგრამაზე ერთი ვარსკვლავი (★) აღნიშნავს {per} ქულას. ანას აქვს {n1} ვარსკვლავი, ხოლო ლუკას — {n2} ვარსკვლავი. რამდენით მეტი ქულა აქვს ანას?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|5|3", "4|6|3", "4|7|4", "5|6|3", "5|7|4", "5|8|5", "6|5|2", "6|6|3", "6|7|4", "10|6|4", "10|7|3", "10|8|5"],
      },
      per: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => (Number(v.n1) - Number(v.n2)) * Number(v.per),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 4),
    explanation: ({ vars, answer }) => `ანას აქვს ${vars.n1} − ${vars.n2} = ${Number(vars.n1) - Number(vars.n2)} ვარსკვლავით მეტი. ქულებში ეს არის: ${Number(vars.n1) - Number(vars.n2)} × ${vars.per} = ${answer} ქულა.`,
  }),

  // g4-u08-31 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u08-31', subtopicId: 'u08-bar-charts', difficulty: 1 }),
    prompt: 'სვეტოვან დიაგრამაზე მოცემულია გაყიდული პურის რაოდენობა: ორშაბათი — {v1}, სამშაბათი — {v2}, ოთხშაბათი — {v3}, ხუთშაბათი — {v4}. რამდენი პური გაიყიდა {targetDay}ს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["30|45|35|50|ხუთშაბათ|50", "30|45|35|50|სამშაბათ|45", "30|45|35|50|ორშაბათ|30", "30|45|35|50|ოთხშაბათ|35", "25|40|30|55|ხუთშაბათ|55", "25|40|30|55|სამშაბათ|40", "35|50|40|60|ხუთშაბათ|60", "35|50|40|60|ორშაბათ|35", "28|42|38|52|სამშაბათ|42", "28|42|38|52|ოთხშაბათ|38", "32|48|36|54|ხუთშაბათ|54", "32|48|36|54|ორშაბათ|32"],
      },
      v1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      v2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      v3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      v4: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      targetDay: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[5])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 5, 5),
    explanation: ({ vars, answer }) => `დიაგრამის შესაბამისი სვეტის მიხედვით გაიყიდა ${answer} პური.`,
  }),

  // g4-u08-32 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u08-32', subtopicId: 'u08-bar-charts', difficulty: 1 }),
    prompt: 'სვეტოვანი დიაგრამის მიხედვით გაიყიდა: ხუთშაბათს — {v4} პური, ორშაბათს — {v1} პური. რამდენი პურით მეტი გაიყიდა ხუთშაბათს, ვიდრე ორშაბათს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["50|30", "55|25", "60|35", "52|28", "54|32", "48|26", "58|34", "62|36", "46|24", "56|30", "65|35", "53|27"],
      },
      v4: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      v1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.v4) - Number(v.v1),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 5),
    explanation: ({ vars, answer }) => `სხვაობაა: ${vars.v4} − ${vars.v1} = ${answer} პური.`,
  }),

  // g4-u08-33 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u08-33', subtopicId: 'u08-bar-charts', difficulty: 2 }),
    prompt: 'სვეტოვან დიაგრამაზე მოცემულია წაკითხული წიგნები: ანა — {v1}, ნინო — {v2}, ლუკა — {v3}, გიორგი — {v4}. ვინ წაიკითხა ყველაზე მეტი წიგნი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["6|9|4|7|ნინო", "10|8|5|7|ანა", "5|7|11|6|ლუკა", "6|8|7|12|გიორგი", "7|10|5|8|ნინო", "12|9|6|8|ანა", "6|8|13|7|ლუკა", "7|9|8|14|გიორგი", "8|11|6|9|ნინო", "14|10|7|9|ანა", "7|9|15|8|ლუკა", "8|10|9|16|გიორგი"],
      },
      v1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      v2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      v3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      v4: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
    },
    answer: (v) => String(v.ans),
    options: () => ['ანა', 'ნინო', 'ლუკა', 'გიორგი'],
    explanation: ({ answer }) => `ყველაზე მაღალი სვეტი ეკუთვნის: ${answer}-ს.`,
  }),

  // g4-u08-34 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u08-34', subtopicId: 'u08-bar-charts', difficulty: 2 }),
    prompt: 'სვეტოვანი დიაგრამის მონაცემებით: ანამ წაიკითხა {v1}, ნინომ — {v2}, ლუკამ — {v3}, გიორგიმ — {v4} წიგნი. რამდენი წიგნი წაიკითხეს ბავშვებმა სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["6|9|4|7", "8|10|5|7", "7|8|6|9", "10|9|6|8", "5|11|7|6", "9|7|8|10", "8|12|6|7", "7|10|8|9", "11|8|5|9", "6|13|7|8", "9|10|8|7", "8|11|9|10"],
      },
      v1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      v2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      v3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      v4: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.v1) + Number(v.v2) + Number(v.v3) + Number(v.v4),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 5, 2),
    explanation: ({ vars, answer }) => `სულ წაიკითხეს: ${vars.v1} + ${vars.v2} + ${vars.v3} + ${vars.v4} = ${answer} წიგნი.`,
  }),

  // g4-u08-35 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u08-35', subtopicId: 'u08-bar-charts', difficulty: 3 }),
    prompt: 'დიაგრამაზე მოცემულია სკოლების მოსწავლეთა რაოდენობა: სკოლა A — {v1}, სკოლა B — {v2}, სკოლა C — {v3}, სკოლა D — {v4}. რამდენი მოსწავლით მეტია სკოლა D-ში, ვიდრე სკოლა A-ში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["240|320|280|360", "220|300|260|350", "250|310|290|370", "230|330|270|380", "200|290|250|340", "260|340|300|390", "210|310|280|360", "240|350|290|400", "270|330|310|410", "220|320|270|370", "250|360|300|420", "230|340|280|390"],
      },
      v1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      v2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      v3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      v4: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.v4) - Number(v.v1),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `სხვაობაა: ${vars.v4} − ${vars.v1} = ${answer} მოსწავლე.`,
  }),

  // g4-u08-36 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u08-36', subtopicId: 'u08-bar-charts', difficulty: 3 }),
    prompt: 'დიაგრამის მიხედვით სკოლა B-ში არის {v2} მოსწავლე, ხოლო სკოლა C-ში — {v3} მოსწავლე. სულ რამდენი მოსწავლეა სკოლა B-სა და სკოლა C-ში ერთად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["320|280", "300|260", "310|290", "330|270", "290|250", "340|300", "310|280", "350|290", "330|310", "320|270", "360|300", "340|280"],
      },
      v2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      v3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.v2) + Number(v.v3),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 100, 20),
    explanation: ({ vars, answer }) => `სკოლა B-სა და C-ში ერთად არის: ${vars.v2} + ${vars.v3} = ${answer} მოსწავლე.`,
  }),

  // g4-u08-37 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u08-37', subtopicId: 'u08-frequency-tables', difficulty: 1 }),
    prompt: 'მოსწავლეთა საყვარელი ფერების სიაა: {listStr}. რამდენჯერ გვხვდება {color} ფერი ამ სიაში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["წითელი, ლურჯი, წითელი, მწვანე, ლურჯი, წითელი, ყვითელი, ლურჯი|წითელი|3", "ლურჯი, მწვანე, ლურჯი, ყვითელი, ლურჯი, წითელი, ლურჯი, მწვანე|ლურჯი|4", "მწვანე, წითელი, მწვანე, ყვითელი, მწვანე, ლურჯი, მწვანე, წითელი|მწვანე|4", "ყვითელი, წითელი, ყვითელი, ლურჯი, ყვითელი, მწვანე, წითელი, ყვითელი|ყვითელი|4", "წითელი, მწვანე, წითელი, ლურჯი, წითელი, ყვითელი, წითელი, მწვანე|წითელი|4", "ლურჯი, წითელი, ლურჯი, მწვანე, ყვითელი, ლურჯი, მწვანე, წითელი|ლურჯი|3", "მწვანე, ყვითელი, მწვანე, წითელი, მწვანე, ლურჯი, ყვითელი, მწვანე|მწვანე|4", "ყვითელი, ლურჯი, ყვითელი, წითელი, ყვითელი, მწვანე, ლურჯი, ყვითელი|ყვითელი|4", "წითელი, ლურჯი, წითელი, წითელი, მწვანე, ლურჯი, ყვითელი, წითელი|წითელი|5", "ლურჯი, ყვითელი, ლურჯი, ლურჯი, მწვანე, წითელი, ლურჯი, ყვითელი|ლურჯი|5", "მწვანე, წითელი, მწვანე, მწვანე, ლურჯი, ყვითელი, მწვანე, წითელი|მწვანე|5", "ყვითელი, მწვანე, ყვითელი, ყვითელი, წითელი, ლურჯი, ყვითელი, მწვანე|ყვითელი|5"],
      },
      listStr: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      color: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 0, 1),
    explanation: ({ vars, answer }) => `სიაში ფერი „${vars.color}“ გვხვდება ზუსტად ${answer}-ჯერ.`,
  }),

  // g4-u08-38 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u08-38', subtopicId: 'u08-frequency-tables', difficulty: 1 }),
    prompt: 'მოცემულია მონაცემთა რიგი: {listStr}. რა არის რიცხვ {target}-ის სიხშირე (რამდენჯერ გვხვდება)?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2, 3, 2, 4, 3, 2, 5, 3|2|3", "2, 3, 2, 4, 3, 2, 5, 3|3|3", "2, 3, 2, 4, 3, 2, 5, 3|4|1", "2, 3, 2, 4, 3, 2, 5, 3|5|1", "3, 4, 3, 5, 4, 3, 6, 4|3|3", "3, 4, 3, 5, 4, 3, 6, 4|4|3", "1, 2, 1, 3, 2, 1, 4, 2|1|3", "1, 2, 1, 3, 2, 1, 4, 2|2|3", "4, 5, 4, 6, 5, 4, 7, 5|4|3", "4, 5, 4, 6, 5, 4, 7, 5|5|3", "2, 4, 2, 5, 4, 2, 6, 2|2|4", "3, 5, 3, 6, 5, 3, 7, 3|3|4"],
      },
      listStr: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      target: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 0, 1),
    explanation: ({ vars, answer }) => `რიცხვი ${vars.target} მოცემულ მონაცემებში მეორდება ${answer}-ჯერ, ანუ მისი სიხშირეა ${answer}.`,
  }),

  // g4-u08-39 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u08-39', subtopicId: 'u08-frequency-tables', difficulty: 2 }),
    prompt: 'მოსწავლეთა მიერ მიღებული ქულებია: {listStr}. რამდენჯერ მიიღეს {target} ქულა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8, 7, 9, 8, 10, 7, 8, 9, 8|8|4", "7, 8, 7, 9, 10, 7, 8, 7, 9|7|4", "9, 8, 9, 10, 7, 9, 8, 9, 10|9|4", "10, 8, 10, 9, 7, 10, 8, 10, 9|10|4", "8, 9, 8, 7, 10, 8, 9, 8, 8|8|5", "7, 9, 7, 8, 10, 7, 9, 7, 7|7|5", "9, 10, 9, 8, 7, 9, 10, 9, 9|9|5", "10, 9, 10, 8, 7, 10, 9, 10, 10|10|5", "8, 7, 8, 9, 10, 8, 7, 8, 6|8|4", "7, 6, 7, 8, 9, 7, 8, 7, 10|7|4", "9, 8, 9, 7, 10, 9, 8, 9, 6|9|4", "10, 9, 10, 8, 7, 10, 9, 10, 6|10|4"],
      },
      listStr: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      target: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 0, 1),
    explanation: ({ vars, answer }) => `ქულა ${vars.target} დაფიქსირდა ${answer}-ჯერ.`,
  }),

  // g4-u08-40 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u08-40', subtopicId: 'u08-frequency-tables', difficulty: 2 }),
    prompt: 'სიხშირეთა ცხრილში მოცემულია: {q1} ნაყინი გაიყიდა {d1} დღეს, {q2} ნაყინი — {d2} დღეს, ხოლო {q3} ნაყინი — {d3} დღეს. რამდენ დღეს გაიყიდა {q2} ნაყინი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10|2|15|3|20|2", "12|3|16|4|22|2", "14|2|18|5|24|3", "10|4|15|2|20|3", "8|3|12|4|16|2", "15|3|20|4|25|2", "10|2|20|5|30|3", "12|4|18|3|24|2", "14|3|21|4|28|2", "16|2|20|4|24|3", "15|4|25|3|35|2", "18|3|24|5|30|2"],
      },
      q1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      q2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      d2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      q3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
      d3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[5])] },
    },
    answer: (v) => Number(v.d2),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ცხრილის მიხედვით ${vars.q2} ნაყინი გაიყიდა ${answer} დღეს.`,
  }),

  // g4-u08-41 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u08-41', subtopicId: 'u08-frequency-tables', difficulty: 3 }),
    prompt: 'მოცემულია მონაცემები: {listStr}. რა არის რიცხვ {target}-ის სიხშირე სიხშირეთა ცხრილში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4, 4, 5, 6, 5, 4, 7, 6, 5, 4|4|4", "4, 4, 5, 6, 5, 4, 7, 6, 5, 4|5|3", "4, 4, 5, 6, 5, 4, 7, 6, 5, 4|6|2", "4, 4, 5, 6, 5, 4, 7, 6, 5, 4|7|1", "3, 3, 4, 5, 4, 3, 6, 5, 4, 3|3|4", "3, 3, 4, 5, 4, 3, 6, 5, 4, 3|4|3", "3, 3, 4, 5, 4, 3, 6, 5, 4, 3|5|2", "2, 2, 3, 4, 3, 2, 5, 4, 3, 2|2|4", "2, 2, 3, 4, 3, 2, 5, 4, 3, 2|3|3", "5, 5, 6, 7, 6, 5, 8, 7, 6, 5|5|4", "5, 5, 6, 7, 6, 5, 8, 7, 6, 5|6|3", "5, 5, 6, 7, 6, 5, 8, 7, 6, 5|7|2"],
      },
      listStr: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      target: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 0, 1),
    explanation: ({ vars, answer }) => `მონაცემებში რიცხვი ${vars.target} გვხვდება ზუსტად ${answer}-ჯერ.`,
  }),

  // g4-u08-42 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u08-42', subtopicId: 'u08-frequency-tables', difficulty: 3 }),
    prompt: 'მოსწავლეთა მიერ წაკითხული წიგნების რაოდენობაა: {listStr}. რამდენმა მოსწავლემ წაიკითხა {target} წიგნი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1, 2, 3, 2, 4, 3, 2, 1, 3, 2|2|4", "1, 2, 3, 2, 4, 3, 2, 1, 3, 2|3|3", "1, 2, 3, 2, 4, 3, 2, 1, 3, 2|1|2", "1, 2, 3, 2, 4, 3, 2, 1, 3, 2|4|1", "2, 3, 4, 3, 5, 4, 3, 2, 4, 3|3|4", "2, 3, 4, 3, 5, 4, 3, 2, 4, 3|4|3", "2, 3, 4, 3, 5, 4, 3, 2, 4, 3|2|2", "3, 4, 5, 4, 6, 5, 4, 3, 5, 4|4|4", "3, 4, 5, 4, 6, 5, 4, 3, 5, 4|5|3", "1, 1, 2, 3, 2, 1, 4, 2, 1, 2|1|4", "1, 1, 2, 3, 2, 1, 4, 2, 1, 2|2|4", "2, 2, 3, 4, 3, 2, 5, 3, 2, 3|2|4"],
      },
      listStr: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      target: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 0, 1),
    explanation: ({ vars, answer }) => `ზუსტად ${vars.target} წიგნი წაიკითხა ${answer} მოსწავლემ.`,
  }),
];
