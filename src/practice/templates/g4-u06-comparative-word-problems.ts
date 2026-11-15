/**
 * Grade 4 — U06: შედარებითი ტექსტური ამოცანები (Comparative Word Problems).
 *
 * Full curriculum implementation for Grade 4 Unit 6 from Google Drive document U06
 * (folder "WEBSITE GRADE 4"):
 * 30 templates (Q01–Q30) across 5 subtopics with complete Level 1, 2, and 3 coverage (6 questions per subtopic):
 *
 *   U06.1  u06-how-much-more           (რამდენით მეტია?, Q01–Q06)
 *   U06.2  u06-how-much-less           (რამდენით ნაკლებია?, Q07–Q12)
 *   U06.3  u06-how-many-times-more     (რამდენჯერ მეტია?, Q13–Q18)
 *   U06.4  u06-how-many-times-less     (რამდენჯერ ნაკლებია?, Q19–Q24)
 *   U06.5  u06-compare-quantities      (საგნების რაოდენობების შედარება, Q25–Q30)
 */

import { defineTemplate } from './types';
import type { QuestionTemplate, DifficultyLevel } from './types';

const grade = 4 as const;
const topicId = 'g4-shedarebiti-amocanebi' as const;
const unitId = 'g4-shedarebiti-amocanebi' as const;

export const G4_U06_SUBTOPICS = [
  'u06-how-much-more',
  'u06-how-much-less',
  'u06-how-many-times-more',
  'u06-how-many-times-less',
  'u06-compare-quantities',
] as const;

export type G4U06SubtopicId = (typeof G4_U06_SUBTOPICS)[number];

const addr = (spec: { id: string; subtopicId: G4U06SubtopicId; difficulty: DifficultyLevel }) => ({
  grade,
  topicId,
  unitId,
  id: spec.id,
  subtopicId: spec.subtopicId,
  difficulty: spec.difficulty,
});

function nearMisses(val: number, count = 3, step = 1, minVal = 0): number[] {
  const result: number[] = [];
  let d = 1;
  while (result.length < count) {
    const higher = val + d * step;
    const lower = val - d * step;
    if (higher !== val && !result.includes(higher) && higher >= minVal) {
      result.push(higher);
      if (result.length >= count) break;
    }
    if (lower !== val && !result.includes(lower) && lower >= minVal) {
      result.push(lower);
    }
    d += 1;
  }
  return result;
}

export const G4_U06_TEMPLATES: QuestionTemplate[] = [
  // ==================================================================
  // U06.1 — რამდენით მეტია? (u06-how-much-more)
  // ==================================================================

  // Q01 (Level 1): ნინოს 24 ფანქარი აქვს, ლუკას კი — 17. რამდენით მეტი ფანქარი აქვს ნინოს?
  defineTemplate({
    ...addr({ id: 'g4-u06-01', subtopicId: 'u06-how-much-more', difficulty: 1 }),
    prompt: '{name1}-ს {a} ფანქარი აქვს, {name2}-ს კი — {b}. რამდენით მეტი ფანქარი აქვს {name1}-ს?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'ნინოს|ლუკას|24|17', 'ანას|გიორგის|28|19', 'დავითს|მარიამს|32|25', 'ელენეს|საბას|35|24',
          'ირაკლის|თამარს|41|29', 'ნიკას|სალომეს|38|26', 'მათეს|სოფოს|45|33', 'ალექსანდრეს|ქეთის|48|36',
          'დემეტრეს|ლიზის|34|21', 'ანდრიას|ნატას|42|31', 'ლევანს|თინას|39|27', 'ბექას|ნუცას|46|32',
        ],
      },
      name1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      name2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} - ${vars.b} = ${answer}. ${vars.name1}-ს ${answer}-ით მეტი ფანქარი აქვს.`,
  }),

  // Q02 (Level 1): ერთ ბიბლიოთეკაში 345 წიგნია, მეორეში კი — 278. რამდენით მეტი წიგნია პირველ ბიბლიოთეკაში?
  defineTemplate({
    ...addr({ id: 'g4-u06-02', subtopicId: 'u06-how-much-more', difficulty: 1 }),
    prompt: 'ერთ ბიბლიოთეკაში {a} წიგნია, მეორეში კი — {b}. რამდენით მეტი წიგნია პირველ ბიბლიოთეკაში?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '345|278', '420|355', '482|394', '512|438',
          '365|289', '450|367', '380|295', '435|348',
          '490|412', '525|440', '395|318', '460|375',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} - ${vars.b} = ${answer}. პირველ ბიბლიოთეკაში ${answer}-ით მეტი წიგნია.`,
  }),

  // Q03 (Level 2): მაღაზიამ ორშაბათს 156 რვეული გაყიდა, სამშაბათს კი — 209. რამდენით მეტი რვეული გაიყიდა სამშაბათს?
  defineTemplate({
    ...addr({ id: 'g4-u06-03', subtopicId: 'u06-how-much-more', difficulty: 2 }),
    prompt: 'მაღაზიამ ორშაბათს {a} რვეული გაყიდა, სამშაბათს კი — {b}. რამდენით მეტი რვეული გაიყიდა სამშაბათს?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '156|209', '148|215', '162|230', '175|242',
          '180|256', '135|198', '168|225', '152|218',
          '170|235', '185|260', '142|205', '160|224',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.b) - Number(v.a),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 1),
    explanation: ({ vars, answer }) => `${vars.b} - ${vars.a} = ${answer}. სამშაბათს ${answer}-ით მეტი რვეული გაიყიდა.`,
  }),

  // Q04 (Level 2): ერთ ყუთში 425 გრამი კანფეტია, მეორეში კი — 350 გრამი. რამდენით მეტი კანფეტია პირველ ყუთში?
  defineTemplate({
    ...addr({ id: 'g4-u06-04', subtopicId: 'u06-how-much-more', difficulty: 2 }),
    prompt: 'ერთ ყუთში {a} გრამი კანფეტია, მეორეში კი — {b} გრამი. რამდენით მეტი კანფეტია პირველ ყუთში?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '425|350', '500|385', '450|360', '600|475',
          '550|420', '480|390', '520|415', '650|520',
          '580|460', '490|375', '620|485', '530|410',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} - ${vars.b} = ${answer} გრამი. პირველ ყუთში ${answer} გრამით მეტი კანფეტია.`,
  }),

  // Q05 (Level 3): პირველმა ქარხანამ 2 450 ნივთი გამოუშვა, მეორემ კი — 1 875. რამდენით მეტი ნივთი გამოუშვა პირველმა ქარხანამ?
  defineTemplate({
    ...addr({ id: 'g4-u06-05', subtopicId: 'u06-how-much-more', difficulty: 3 }),
    prompt: 'პირველმა ქარხანამ {a} ნივთი გამოუშვა, მეორემ კი — {b}. რამდენით მეტი ნივთი გამოუშვა პირველმა ქარხანამ?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '2450|1875', '3200|2640', '2800|2150', '3500|2850',
          '4100|3450', '2650|1980', '3350|2720', '2950|2380',
          '3800|3120', '4250|3680', '2750|2190', '3400|2760',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 25, 10),
    explanation: ({ vars, answer }) => `${vars.a} - ${vars.b} = ${answer}. პირველმა ქარხანამ ${answer}-ით მეტი ნივთი გამოუშვა.`,
  }),

  // Q06 (Level 3): ბაღში 368 ვაშლის ხეა და 294 მსხლის ხე. რამდენით მეტია ვაშლის ხეების რაოდენობა მსხლის ხეების რაოდენობაზე?
  defineTemplate({
    ...addr({ id: 'g4-u06-06', subtopicId: 'u06-how-much-more', difficulty: 3 }),
    prompt: 'ბაღში {a} ვაშლის ხეა და {b} მსხლის ხე. რამდენით მეტია ვაშლის ხეების რაოდენობა მსხლის ხეების რაოდენობაზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '368|294', '425|348', '480|395', '512|436',
          '390|315', '456|382', '520|445', '385|298',
          '475|392', '530|462', '410|335', '495|418',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} - ${vars.b} = ${answer}. ვაშლის ხეების რაოდენობა ${answer}-ით მეტია.`,
  }),

  // ==================================================================
  // U06.2 — რამდენით ნაკლებია? (u06-how-much-less)
  // ==================================================================

  // Q07 (Level 1): გიორგის 32 ბარათი აქვს, ანას კი — 25. რამდენით ნაკლები ბარათი აქვს ანას?
  defineTemplate({
    ...addr({ id: 'g4-u06-07', subtopicId: 'u06-how-much-less', difficulty: 1 }),
    prompt: '{name1}-ს {a} ბარათი აქვს, {name2}-ს კი — {b}. რამდენით ნაკლები ბარათი აქვს {name2}-ს?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'გიორგის|ანას|32|25', 'ლუკას|ნინოს|35|27', 'საბას|ელენეს|38|29', 'დავითს|მარიამს|40|31',
          'ნიკას|სალომეს|42|33', 'ირაკლის|თამარს|45|36', 'მათეს|სოფოს|48|39', 'ალექსანდრეს|ქეთის|50|41',
          'ლევანს|თინას|36|28', 'დემეტრეს|ლიზის|44|35', 'ანდრიას|ნატას|46|37', 'ბექას|ნუცას|49|38',
        ],
      },
      name1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      name2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} - ${vars.b} = ${answer}. ${vars.name2}-ს ${answer}-ით ნაკლები ბარათი აქვს.`,
  }),

  // Q08 (Level 1): პირველ თაროზე 148 წიგნია, მეორეზე კი — 96. რამდენით ნაკლები წიგნია მეორე თაროზე?
  defineTemplate({
    ...addr({ id: 'g4-u06-08', subtopicId: 'u06-how-much-less', difficulty: 1 }),
    prompt: 'პირველ თაროზე {a} წიგნია, მეორეზე კი — {b}. რამდენით ნაკლები წიგნია მეორე თაროზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '148|96', '165|88', '152|95', '170|92',
          '145|89', '180|94', '158|91', '162|85',
          '175|98', '150|86', '168|93', '182|97',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 1),
    explanation: ({ vars, answer }) => `${vars.a} - ${vars.b} = ${answer}. მეორე თაროზე ${answer}-ით ნაკლები წიგნია.`,
  }),

  // Q09 (Level 2): პარკში 275 ბავშვი იყო, მეზობელ პარკში კი — 189. რამდენით ნაკლები ბავშვი იყო მეორე პარკში?
  defineTemplate({
    ...addr({ id: 'g4-u06-09', subtopicId: 'u06-how-much-less', difficulty: 2 }),
    prompt: 'პარკში {a} ბავშვი იყო, მეზობელ პარკში კი — {b}. რამდენით ნაკლები ბავშვი იყო მეორე პარკში?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '275|189', '310|225', '290|198', '325|248',
          '280|195', '340|255', '305|218', '295|210',
          '330|242', '285|192', '315|230', '350|265',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} - ${vars.b} = ${answer}. მეორე პარკში ${answer}-ით ნაკლები ბავშვი იყო.`,
  }),

  // Q10 (Level 2): მაღაზიაში 560 კილოგრამი ფქვილი იყო. დღის ბოლოს 375 კილოგრამი დარჩა. რამდენით ნაკლები ფქვილი დარჩა, ვიდრე თავდაპირველად იყო?
  defineTemplate({
    ...addr({ id: 'g4-u06-10', subtopicId: 'u06-how-much-less', difficulty: 2 }),
    prompt: 'მაღაზიაში {a} კილოგრამი ფქვილი იყო. დღის ბოლოს {b} კილოგრამი დარჩა. რამდენით ნაკლები ფქვილი დარჩა, ვიდრე თავდაპირველად იყო?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '560|375', '620|445', '580|395', '650|480',
          '540|365', '700|525', '630|460', '590|415',
          '680|495', '550|380', '640|470', '720|535',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.a} - ${vars.b} = ${answer} კილოგრამი. ${answer} კგ-ით ნაკლები დარჩა.`,
  }),

  // Q11 (Level 3): ერთმა ფერმამ 1 240 კილოგრამი ყურძენი მოიწია, მეორემ კი — 985 კილოგრამი. რამდენით ნაკლები ყურძენი მოიწია მეორე ფერმამ?
  defineTemplate({
    ...addr({ id: 'g4-u06-11', subtopicId: 'u06-how-much-less', difficulty: 3 }),
    prompt: 'ერთმა ფერმამ {a} კილოგრამი ყურძენი მოიწია, მეორემ კი — {b} კილოგრამი. რამდენით ნაკლები ყურძენი მოიწია მეორე ფერმამ?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '1240|985', '1350|1080', '1420|1150', '1500|1235',
          '1280|1025', '1600|1340', '1380|1115', '1450|1180',
          '1550|1275', '1320|1060', '1480|1210', '1650|1390',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 20, 1),
    explanation: ({ vars, answer }) => `${vars.a} - ${vars.b} = ${answer} კილოგრამი. მეორე ფერმამ ${answer} კგ-ით ნაკლები ყურძენი მოიწია.`,
  }),

  // Q12 (Level 3): პირველმა ავტობუსმა 3 250 კილომეტრი გაიარა, მეორემ კი — 2 875 კილომეტრი. რამდენით ნაკლები მანძილი გაიარა მეორე ავტობუსმა?
  defineTemplate({
    ...addr({ id: 'g4-u06-12', subtopicId: 'u06-how-much-less', difficulty: 3 }),
    prompt: 'პირველმა ავტობუსმა {a} კილომეტრი გაიარა, მეორემ კი — {b} კილომეტრი. რამდენით ნაკლები მანძილი გაიარა მეორე ავტობუსმა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '3250|2875', '3400|2950', '3150|2780', '3500|3120',
          '3300|2890', '3600|3240', '3280|2840', '3450|3080',
          '3380|2960', '3550|3190', '3220|2810', '3650|3280',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 25, 10),
    explanation: ({ vars, answer }) => `${vars.a} - ${vars.b} = ${answer} კილომეტრი. მეორე ავტობუსმა ${answer} კმ-ით ნაკლები მანძილი გაიარა.`,
  }),

  // ==================================================================
  // U06.3 — რამდენჯერ მეტია? (u06-how-many-times-more)
  // ==================================================================

  // Q13 (Level 1): ლუკას 6 სათამაშო მანქანა აქვს, ნინოს კი — 18. რამდენჯერ მეტია ნინოს მანქანების რაოდენობა ლუკას მანქანების რაოდენობაზე?
  defineTemplate({
    ...addr({ id: 'g4-u06-13', subtopicId: 'u06-how-many-times-more', difficulty: 1 }),
    prompt: '{name1}-ს {b} სათამაშო მანქანა აქვს, {name2}-ს კი — {a}. რამდენჯერ მეტია {name2}-ს მანქანების რაოდენობა {name1}-ს მანქანების რაოდენობაზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'ლუკას|ნინოს|6|18', 'გიორგის|ანას|4|24', 'საბას|ელენეს|5|20', 'დავითს|მარიამს|7|28',
          'ნიკას|სალომეს|8|32', 'ირაკლის|თამარს|3|21', 'მათეს|სოფოს|6|30', 'ალექსანდრეს|ქეთის|4|28',
          'ლევანს|თინას|5|25', 'დემეტრეს|ლიზის|7|35', 'ანდრიას|ნატას|8|40', 'ბექას|ნუცას|9|36',
        ],
      },
      name1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      name2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}. ${vars.name2}-ს მანქანების რაოდენობა ${answer}-ჯერ მეტია.`,
  }),

  // Q14 (Level 1): ერთ კალათაში 8 ვაშლია, მეორეში კი — 40. რამდენჯერ მეტია ვაშლების რაოდენობა მეორე კალათაში?
  defineTemplate({
    ...addr({ id: 'g4-u06-14', subtopicId: 'u06-how-many-times-more', difficulty: 1 }),
    prompt: 'ერთ კალათაში {b} ვაშლია, მეორეში კი — {a}. რამდენჯერ მეტია ვაშლების რაოდენობა მეორე კალათაში?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '8|40', '6|36', '7|42', '9|45',
          '8|48', '6|42', '7|49', '9|54',
          '8|56', '6|48', '7|56', '9|63',
        ],
      },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}. მეორე კალათაში ${answer}-ჯერ მეტი ვაშლია.`,
  }),

  // Q15 (Level 2): პირველ თაროზე 24 წიგნია, მეორეზე კი — 72. რამდენჯერ მეტია წიგნების რაოდენობა მეორე თაროზე?
  defineTemplate({
    ...addr({ id: 'g4-u06-15', subtopicId: 'u06-how-many-times-more', difficulty: 2 }),
    prompt: 'პირველ თაროზე {b} წიგნია, მეორეზე კი — {a}. რამდენჯერ მეტია წიგნების რაოდენობა მეორე თაროზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '24|72', '15|60', '18|72', '20|80',
          '25|75', '16|64', '22|88', '14|56',
          '21|84', '18|90', '25|100', '16|80',
        ],
      },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}. მეორე თაროზე წიგნების რაოდენობა ${answer}-ჯერ მეტია.`,
  }),

  // Q16 (Level 2): ერთმა მოსწავლემ 12 ამოცანა ამოხსნა, მეორემ კი — 60. რამდენჯერ მეტი ამოცანა ამოხსნა მეორე მოსწავლემ?
  defineTemplate({
    ...addr({ id: 'g4-u06-16', subtopicId: 'u06-how-many-times-more', difficulty: 2 }),
    prompt: 'ერთმა მოსწავლემ {b} ამოცანა ამოხსნა, მეორემ კი — {a}. რამდენჯერ მეტი ამოცანა ამოხსნა მეორე მოსწავლემ?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '12|60', '15|45', '14|56', '16|64',
          '18|54', '11|55', '13|52', '15|75',
          '12|48', '14|70', '16|80', '18|72',
        ],
      },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}. მეორე მოსწავლემ ${answer}-ჯერ მეტი ამოცანა ამოხსნა.`,
  }),

  // Q17 (Level 3): პირველმა საწარმომ 125 ნივთი დაამზადა, მეორემ კი — 500. რამდენჯერ მეტი ნივთი დაამზადა მეორე საწარმომ?
  defineTemplate({
    ...addr({ id: 'g4-u06-17', subtopicId: 'u06-how-many-times-more', difficulty: 3 }),
    prompt: 'პირველმა საწარმომ {b} ნივთი დაამზადა, მეორემ კი — {a}. რამდენჯერ მეტი ნივთი დაამზადა მეორე საწარმომ?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '125|500', '150|600', '120|480', '140|560',
          '160|640', '125|750', '150|750', '110|440',
          '130|520', '140|700', '120|600', '150|900',
        ],
      },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}. მეორე საწარმომ ${answer}-ჯერ მეტი ნივთი დაამზადა.`,
  }),

  // Q18 (Level 3): ერთმა სატვირთო მანქანამ 240 კილოგრამი ტვირთი გადაიტანა, მეორემ კი — 1 200 კილოგრამი. რამდენჯერ მეტი ტვირთი გადაიტანა მეორე მანქანამ?
  defineTemplate({
    ...addr({ id: 'g4-u06-18', subtopicId: 'u06-how-many-times-more', difficulty: 3 }),
    prompt: 'ერთმა სატვირთო მანქანამ {b} კილოგრამი ტვირთი გადაიტანა, მეორემ კი — {a} კილოგრამი. რამდენჯერ მეტი ტვირთი გადაიტანა მეორე მანქანამ?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '240|1200', '250|1000', '200|1200', '300|1500',
          '220|1100', '250|1250', '280|1400', '200|1400',
          '320|1600', '240|1440', '250|1500', '300|1800',
        ],
      },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}. მეორე მანქანამ ${answer}-ჯერ მეტი ტვირთი გადაიტანა.`,
  }),

  // ==================================================================
  // U06.4 — რამდენჯერ ნაკლებია? (u06-how-many-times-less)
  // ==================================================================

  // Q19 (Level 1): ანას 4 ფანქარი აქვს, გიორგის კი — 20. რამდენჯერ ნაკლები ფანქარი აქვს ანას?
  defineTemplate({
    ...addr({ id: 'g4-u06-19', subtopicId: 'u06-how-many-times-less', difficulty: 1 }),
    prompt: '{name1}-ს {b} ფანქარი აქვს, {name2}-ს კი — {a}. რამდენჯერ ნაკლები ფანქარი აქვს {name1}-ს?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'ანას|გიორგის|4|20', 'ნინოს|ლუკას|5|25', 'ელენეს|საბას|6|24', 'მარიამს|დავითს|7|28',
          'სალომეს|ნიკას|3|21', 'თამარს|ირაკლის|4|28', 'სოფოს|მათეს|5|30', 'ქეთის|ალექსანდრეს|6|36',
          'თინას|ლევანს|7|35', 'ლიზის|დემეტრეს|8|32', 'ნატას|ანდრიას|9|36', 'ნუცას|ბექას|4|32',
        ],
      },
      name1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      name2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}. ${vars.name1}-ს ${answer}-ჯერ ნაკლები ფანქარი აქვს.`,
  }),

  // Q20 (Level 1): ერთ ყუთში 6 ბურთია, მეორეში კი — 42. რამდენჯერ ნაკლები ბურთია პირველ ყუთში?
  defineTemplate({
    ...addr({ id: 'g4-u06-20', subtopicId: 'u06-how-many-times-less', difficulty: 1 }),
    prompt: 'ერთ ყუთში {b} ბურთია, მეორეში კი — {a}. რამდენჯერ ნაკლები ბურთია პირველ ყუთში?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '6|42', '5|35', '7|42', '8|48',
          '9|54', '6|36', '5|40', '7|49',
          '8|56', '9|63', '6|48', '7|56',
        ],
      },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}. პირველ ყუთში ${answer}-ჯერ ნაკლები ბურთია.`,
  }),

  // Q21 (Level 2): პირველმა მოსწავლემ 9 ამოცანა ამოხსნა, მეორემ კი — 63. რამდენჯერ ნაკლები ამოცანა ამოხსნა პირველმა მოსწავლემ?
  defineTemplate({
    ...addr({ id: 'g4-u06-21', subtopicId: 'u06-how-many-times-less', difficulty: 2 }),
    prompt: 'პირველმა მოსწავლემ {b} ამოცანა ამოხსნა, მეორემ კი — {a}. რამდენჯერ ნაკლები ამოცანა ამოხსნა პირველმა მოსწავლემ?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '9|63', '8|56', '7|49', '6|48',
          '8|64', '9|72', '7|56', '6|54',
          '8|72', '9|81', '7|63', '8|48',
        ],
      },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}. პირველმა მოსწავლემ ${answer}-ჯერ ნაკლები ამოცანა ამოხსნა.`,
  }),

  // Q22 (Level 2): ერთ მაღაზიაში 35 კილოგრამი ბრინჯია, მეორეში კი — 245 კილოგრამი. რამდენჯერ ნაკლები ბრინჯია პირველ მაღაზიაში?
  defineTemplate({
    ...addr({ id: 'g4-u06-22', subtopicId: 'u06-how-many-times-less', difficulty: 2 }),
    prompt: 'ერთ მაღაზიაში {b} კილოგრამი ბრინჯია, მეორეში კი — {a} კილოგრამი. რამდენჯერ ნაკლები ბრინჯია პირველ მაღაზიაში?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '35|245', '25|175', '30|210', '40|280',
          '35|280', '25|200', '30|240', '45|315',
          '35|210', '25|225', '40|320', '30|270',
        ],
      },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}. პირველ მაღაზიაში ${answer}-ჯერ ნაკლები ბრინჯია.`,
  }),

  // Q23 (Level 3): პირველმა ქარხანამ 80 ნივთი გამოუშვა, მეორემ კი — 640. რამდენჯერ ნაკლები ნივთი გამოუშვა პირველმა ქარხანამ?
  defineTemplate({
    ...addr({ id: 'g4-u06-23', subtopicId: 'u06-how-many-times-less', difficulty: 3 }),
    prompt: 'პირველმა ქარხანამ {b} ნივთი გამოუშვა, მეორემ კი — {a}. რამდენჯერ ნაკლები ნივთი გამოუშვა პირველმა ქარხანამ?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '80|640', '70|490', '90|720', '60|480',
          '80|560', '70|560', '90|630', '60|540',
          '80|720', '70|630', '90|810', '60|420',
        ],
      },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}. პირველმა ქარხანამ ${answer}-ჯერ ნაკლები ნივთი გამოუშვა.`,
  }),

  // Q24 (Level 3): ერთმა სატვირთო მანქანამ 150 კილოგრამი ტვირთი გადაიტანა, მეორემ კი — 1 200 კილოგრამი. რამდენჯერ ნაკლები ტვირთი გადაიტანა პირველმა მანქანამ?
  defineTemplate({
    ...addr({ id: 'g4-u06-24', subtopicId: 'u06-how-many-times-less', difficulty: 3 }),
    prompt: 'ერთმა სატვირთო მანქანამ {b} კილოგრამი ტვირთი გადაიტანა, მეორემ კი — {a} კილოგრამი. რამდენჯერ ნაკლები ტვირთი გადაიტანა პირველმა მანქანამ?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '150|1200', '120|960', '140|1120', '160|1280',
          '125|1000', '150|1050', '130|1040', '140|980',
          '150|1350', '120|1080', '160|1120', '130|1170',
        ],
      },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}. პირველმა მანქანამ ${answer}-ჯერ ნაკლები ტვირთი გადაიტანა.`,
  }),

  // ==================================================================
  // U06.5 — საგნების რაოდენობების შედარება (u06-compare-quantities)
  // ==================================================================

  // Q25 (Level 1): ერთ კალათაში 18 მსხალია, მეორეში კი — 6-ჯერ ნაკლები. რამდენი მსხალია მეორე კალათაში?
  defineTemplate({
    ...addr({ id: 'g4-u06-25', subtopicId: 'u06-compare-quantities', difficulty: 1 }),
    prompt: 'ერთ კალათაში {a} მსხალია, მეორეში კი — {k}-ჯერ ნაკლები. რამდენი მსხალია მეორე კალათაში?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '18|6', '24|4', '28|7', '32|8',
          '35|5', '36|9', '42|6', '45|5',
          '48|8', '54|9', '56|7', '63|9',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) / Number(v.k),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.k} = ${answer}. მეორე კალათაში ${answer} მსხალია.`,
  }),

  // Q26 (Level 1): პირველ თაროზე 15 წიგნია, მეორეზე კი — 4-ჯერ მეტი. რამდენი წიგნია მეორე თაროზე?
  defineTemplate({
    ...addr({ id: 'g4-u06-26', subtopicId: 'u06-compare-quantities', difficulty: 1 }),
    prompt: 'პირველ თაროზე {a} წიგნია, მეორეზე კი — {k}-ჯერ მეტი. რამდენი წიგნია მეორე თაროზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '15|4', '12|5', '14|3', '16|4',
          '18|3', '20|4', '22|3', '25|3',
          '15|6', '12|7', '14|5', '16|5',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) * Number(v.k),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 1),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.k} = ${answer}. მეორე თაროზე ${answer} წიგნია.`,
  }),

  // Q27 (Level 2): ლაშას 56 სტიკერი აქვს, მარიამს კი — 8-ჯერ ნაკლები. რამდენი სტიკერი აქვს მარიამს?
  defineTemplate({
    ...addr({ id: 'g4-u06-27', subtopicId: 'u06-compare-quantities', difficulty: 2 }),
    prompt: '{name1}-ს {a} სტიკერი აქვს, {name2}-ს კი — {k}-ჯერ ნაკლები. რამდენი სტიკერი აქვს {name2}-ს?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'ლაშას|მარიამს|56|8', 'გიორგის|ანას|48|6', 'ლუკას|ნინოს|45|5', 'საბას|ელენეს|54|9',
          'დავითს|თამარს|63|7', 'ნიკას|სალომეს|42|6', 'ირაკლის|ქეთის|72|8', 'მათეს|სოფოს|64|8',
          'ალექსანდრეს|თინას|81|9', 'დემეტრეს|ლიზის|49|7', 'ანდრიას|ნატას|36|4', 'ბექას|ნუცას|35|5',
        ],
      },
      name1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      name2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.a) / Number(v.k),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.k} = ${answer}. ${vars.name2}-ს ${answer} სტიკერი აქვს.`,
  }),

  // Q28 (Level 2): ერთ ფერმაში 125 ქათამია, მეორეში კი — 3-ჯერ მეტი. რამდენი ქათამია მეორე ფერმაში?
  defineTemplate({
    ...addr({ id: 'g4-u06-28', subtopicId: 'u06-compare-quantities', difficulty: 2 }),
    prompt: 'ერთ ფერმაში {a} ქათამია, მეორეში კი — {k}-ჯერ მეტი. რამდენი ქათამია მეორე ფერმაში?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '125|3', '140|2', '150|3', '110|4',
          '130|3', '120|4', '160|2', '135|3',
          '145|2', '115|4', '125|4', '150|2',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) * Number(v.k),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 25, 10),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.k} = ${answer}. მეორე ფერმაში ${answer} ქათამია.`,
  }),

  // Q29 (Level 3): პირველმა გუნდმა 84 ქულა დააგროვა, მეორემ კი — 7-ჯერ ნაკლები. რამდენი ქულა დააგროვა მეორე გუნდმა?
  defineTemplate({
    ...addr({ id: 'g4-u06-29', subtopicId: 'u06-compare-quantities', difficulty: 3 }),
    prompt: 'პირველმა გუნდმა {a} ქულა დააგროვა, მეორემ კი — {k}-ჯერ ნაკლები. რამდენი ქულა დააგროვა მეორე გუნდმა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '84|7', '96|8', '72|6', '80|5',
          '91|7', '88|8', '78|6', '85|5',
          '92|4', '96|6', '84|4', '75|5',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) / Number(v.k),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.k} = ${answer}. მეორე გუნდმა ${answer} ქულა დააგროვა.`,
  }),

  // Q30 (Level 3): ერთ საწყობში 240 ყუთია, მეორეში კი — 5-ჯერ მეტი. რამდენი ყუთია ორივე საწყობში ერთად?
  defineTemplate({
    ...addr({ id: 'g4-u06-30', subtopicId: 'u06-compare-quantities', difficulty: 3 }),
    prompt: 'ერთ საწყობში {a} ყუთია, მეორეში კი — {k}-ჯერ მეტი. რამდენი ყუთია ორივე საწყობში ერთად?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '240|5', '150|4', '200|3', '180|4',
          '220|3', '250|2', '160|5', '140|4',
          '210|3', '190|4', '170|3', '230|2',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) + Number(v.a) * Number(v.k),
    format: { kind: 'integer' },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 50, 10),
    explanation: ({ vars, answer }) => {
      const b = Number(vars.a) * Number(vars.k);
      return `მეორე საწყობშია: ${vars.a} × ${vars.k} = ${b}. ორივეში ერთად: ${vars.a} + ${b} = ${answer} ყუთი.`;
    },
  }),
];
