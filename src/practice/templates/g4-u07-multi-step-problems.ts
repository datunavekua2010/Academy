/**
 * Grade 4 — U07: მრავალსაფეხურიანი ამოცანები (Multi-Step Problems).
 *
 * Full curriculum implementation for Grade 4 Unit 7 from Google Drive document U07:
 * 72 templates (Q01–Q72) across 12 subtopics with complete Level 1, 2, and 3 coverage (6 questions per subtopic):
 *
 *   U07.1  u07-approximate-sums         (მიახლოებითი ჯამები მრავალსაფეხურიან ამოცანებში, Q01–Q06)
 *   U07.2  u07-addition-problems        (შეკრების ამოცანები, Q07–Q12)
 *   U07.3  u07-mixed-problems           (შერეული ამოცანები, Q13–Q18)
 *   U07.4  u07-operation-signs          (ბადეში მოქმედების ნიშნების ჩასმა, Q19–Q24)
 *   U07.5  u07-sufficient-conditions    (საკმარისი ან არასაკმარისი პირობის მქონე ამოცანები, Q25–Q30)
 *   U07.6  u07-guess-and-check          (ამოცანების ამოხსნა გამოცდისა და შემოწმების გზით, Q31–Q36)
 *   U07.7  u07-equations                (მრავალსაფეხურიანი განტოლებები, Q37–Q42)
 *   U07.8  u07-equalizing-quantities    (რაოდენობების გათანაბრება შეკრებით, Q43–Q48)
 *   U07.9  u07-multiplication-addition  (გამრავლებისა და შეკრების ამოცანები, Q49–Q54)
 *   U07.10 u07-time-intervals           (დროის ინტერვალებთან დაკავშირებული რაოდენობები, Q55–Q60)
 *   U07.11 u07-determine-compare        (რაოდენობების განსაზღვრა და შედარება, Q61–Q66)
 *   U07.12 u07-order-of-operations      (მოქმედებების დალაგება, Q67–Q72)
 */

import { defineTemplate } from './types';
import type { QuestionTemplate, DifficultyLevel } from './types';

const grade = 4 as const;
const topicId = 'g4-mravalsapexuriani-amocanebi' as const;
const unitId = 'g4-mravalsapexuriani-amocanebi' as const;

export const G4_U07_SUBTOPICS = [
  'u07-approximate-sums',
  'u07-addition-problems',
  'u07-mixed-problems',
  'u07-operation-signs',
  'u07-sufficient-conditions',
  'u07-guess-and-check',
  'u07-equations',
  'u07-equalizing-quantities',
  'u07-multiplication-addition',
  'u07-time-intervals',
  'u07-determine-compare',
  'u07-order-of-operations',
] as const;

export type G4U07SubtopicId = (typeof G4_U07_SUBTOPICS)[number];

const addr = (spec: { id: string; subtopicId: G4U07SubtopicId; difficulty: DifficultyLevel }) => ({
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

export const G4_U07_TEMPLATES: QuestionTemplate[] = [

  // g4-u07-01 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-01', subtopicId: 'u07-approximate-sums', difficulty: 1 }),
    prompt: 'ბიბლიოთეკაში {a} საბავშვო წიგნი და {b} სასწავლო წიგნია. დაამრგვალე თითოეული რიცხვი უახლოეს ათასეულამდე და მიახლოებით იპოვე წიგნების საერთო რაოდენობა.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1985|3120", "2150|3890", "1240|2850", "3410|1920", "2890|4150", "1120|3780", "4210|2950", "1850|2140", "2950|3050", "3120|1890", "2450|3670", "1780|4230"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Math.round(Number(v.a) / 1000) * 1000 + Math.round(Number(v.b) / 1000) * 1000,
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => `${vars.a} მრგვალდება ${Math.round(Number(vars.a) / 1000) * 1000}-მდე, ხოლო ${vars.b} — ${Math.round(Number(vars.b) / 1000) * 1000}-მდე. მიახლოებითი ჯამია: ${answer}.`,
  }),

  // g4-u07-02 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-02', subtopicId: 'u07-approximate-sums', difficulty: 1 }),
    prompt: 'ერთმა მაღაზიამ გაყიდა {a} რვეული, მეორემ კი — {b}. დაამრგვალე ორივე რიცხვი უახლოეს ათასეულამდე და იპოვე გაყიდული რვეულების მიახლოებითი რაოდენობა.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2460|3540", "1890|4120", "3210|2890", "2750|1450", "1150|3820", "4320|2680", "3650|1750", "2190|4850", "1480|3120", "3890|2450", "2950|1850", "4120|3210"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Math.round(Number(v.a) / 1000) * 1000 + Math.round(Number(v.b) / 1000) * 1000,
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => `${vars.a} ≈ ${Math.round(Number(vars.a) / 1000) * 1000}, ${vars.b} ≈ ${Math.round(Number(vars.b) / 1000) * 1000}. მიახლოებითი ჯამია: ${answer}.`,
  }),

  // g4-u07-03 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-03', subtopicId: 'u07-approximate-sums', difficulty: 2 }),
    prompt: 'პირველმა ფერმამ მოიწია {a} კილოგრამი ვაშლი, მეორემ კი — {b} კილოგრამი. დაამრგვალე რიცხვები უახლოეს ასეულამდე და მიახლოებით იპოვე მოსავლის საერთო მასა.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4780|2230", "3140|1890", "2650|3420", "5120|2780", "1890|4250", "3460|2830", "4210|1980", "2750|3120", "3820|2470", "1940|3860", "4560|2190", "3280|4120"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => `${Math.round(Number(v.a) / 100) * 100 + Math.round(Number(v.b) / 100) * 100} კგ`,
    distractors: (ctx) => nearMisses(parseInt(String(ctx.answer), 10), 3, 100, 100).map(n => `${n} კგ`),
    explanation: ({ vars, answer }) => `${vars.a} ≈ ${Math.round(Number(vars.a) / 100) * 100}, ${vars.b} ≈ ${Math.round(Number(vars.b) / 100) * 100}. მიახლოებითი საერთო მასაა: ${answer}.`,
  }),

  // g4-u07-04 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-04', subtopicId: 'u07-approximate-sums', difficulty: 2 }),
    prompt: 'მუზეუმს ერთ კვირაში {a}, ხოლო მომდევნო კვირაში {b} ადამიანი ეწვია. დაამრგვალე რიცხვები უახლოეს ასეულამდე და მიახლოებით იპოვე დამთვალიერებლების საერთო რაოდენობა.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1875|2140", "2340|1820", "1650|2480", "3120|1450", "2780|2150", "1920|2840", "2450|1760", "1580|3210", "2890|1640", "3410|2120", "1740|2950", "2260|1890"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Math.round(Number(v.a) / 100) * 100 + Math.round(Number(v.b) / 100) * 100,
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.a} ≈ ${Math.round(Number(vars.a) / 100) * 100}, ${vars.b} ≈ ${Math.round(Number(vars.b) / 100) * 100}. საერთო რაოდენობაა: ${answer}.`,
  }),

  // g4-u07-05 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u07-05', subtopicId: 'u07-approximate-sums', difficulty: 3 }),
    prompt: 'პირველმა ქარხანამ დაამზადა {a} ნივთი, მეორემ კი — {b}. დაამრგვალე რიცხვები უახლოეს ათასეულამდე და მიახლოებით იპოვე წარმოებული ნივთების საერთო რაოდენობა.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12450|8620", "15800|7210", "11200|9450", "14600|6890", "18250|5740", "13780|8120", "16400|9850", "10890|7420", "17120|8900", "14250|9350", "12900|8450", "15400|6780"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Math.round(Number(v.a) / 1000) * 1000 + Math.round(Number(v.b) / 1000) * 1000,
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1000, 1000),
    explanation: ({ vars, answer }) => `${vars.a} ≈ ${Math.round(Number(vars.a) / 1000) * 1000}, ${vars.b} ≈ ${Math.round(Number(vars.b) / 1000) * 1000}. საერთო რაოდენობაა: ${answer}.`,
  }),

  // g4-u07-06 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u07-06', subtopicId: 'u07-approximate-sums', difficulty: 3 }),
    prompt: 'ქალაქის ორ სკოლაში სულ {a} და {b} მოსწავლეა. დაამრგვალე რიცხვები უახლოეს ასეულამდე და მიახლოებით იპოვე მოსწავლეების საერთო რაოდენობა.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2785|3240", "1850|2420", "3120|2680", "2450|3720", "1980|2840", "3410|1890", "2260|3150", "2890|2340", "3650|1780", "2140|2950", "3280|2460", "1790|3420"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Math.round(Number(v.a) / 100) * 100 + Math.round(Number(v.b) / 100) * 100,
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 100, 100),
    explanation: ({ vars, answer }) => `${vars.a} ≈ ${Math.round(Number(vars.a) / 100) * 100}, ${vars.b} ≈ ${Math.round(Number(vars.b) / 100) * 100}. მოსწავლეთა საერთო რაოდენობაა: ${answer}.`,
  }),

  // g4-u07-07 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-07', subtopicId: 'u07-addition-problems', difficulty: 1 }),
    prompt: 'მაღაზიაში დილით {a} პური შეიტანეს, შუადღისას კი — კიდევ {b}. რამდენი პური შეიტანეს სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["245|178", "312|189", "265|147", "198|234", "345|168", "224|186", "289|153", "176|248", "315|195", "274|168", "238|192", "356|148"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `სულ შეიტანეს: ${vars.a} + ${vars.b} = ${answer} პური.`,
  }),

  // g4-u07-08 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-08', subtopicId: 'u07-addition-problems', difficulty: 1 }),
    prompt: 'ბიბლიოთეკას {a} წიგნი ჰქონდა. მას {b} ახალი წიგნი აჩუქეს. რამდენი წიგნი აქვს ახლა ბიბლიოთეკას?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1250|375", "1420|280", "1180|450", "1340|390", "1560|270", "1290|420", "1650|350", "1120|480", "1480|360", "1390|410", "1220|390", "1540|320"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 50, 1),
    explanation: ({ vars, answer }) => `ახლა ბიბლიოთეკას აქვს: ${vars.a} + ${vars.b} = ${answer} წიგნი.`,
  }),

  // g4-u07-09 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-09', subtopicId: 'u07-addition-problems', difficulty: 2 }),
    prompt: 'პირველ დღეს მძღოლმა {a} კილომეტრი გაიარა, მეორე დღეს — {b} კილომეტრი, მესამე დღეს კი — {c} კილომეტრი. რამდენი კილომეტრი გაიარა მან სამ დღეში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["235|318|192", "185|290|245", "240|325|180", "215|285|210", "275|310|165", "195|340|220", "260|295|185", "225|315|205", "250|280|230", "180|335|215", "290|270|190", "210|320|225"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => `${Number(v.a) + Number(v.b) + Number(v.c)} კმ`,
    distractors: (ctx) => nearMisses(parseInt(String(ctx.answer), 10), 3, 20, 1).map(n => `${n} კმ`),
    explanation: ({ vars, answer }) => `სამ დღეში გაიარა: ${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // g4-u07-10 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-10', subtopicId: 'u07-addition-problems', difficulty: 2 }),
    prompt: 'საწყობში {a} კილოგრამი კარტოფილი და {b} კილოგრამი ხახვი შეიტანეს. რამდენი კილოგრამი ბოსტნეული შეიტანეს სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2450|1875", "3120|1650", "2890|1420", "2250|1950", "3400|1780", "2680|1540", "2950|1830", "2180|2120", "3250|1470", "2740|1890", "3150|1620", "2380|1940"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => `${Number(v.a) + Number(v.b)} კგ`,
    distractors: (ctx) => nearMisses(parseInt(String(ctx.answer), 10), 3, 100, 1).map(n => `${n} კგ`),
    explanation: ({ vars, answer }) => `სულ შეიტანეს: ${vars.a} + ${vars.b} = ${answer} ბოსტნეული.`,
  }),

  // g4-u07-11 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-11', subtopicId: 'u07-addition-problems', difficulty: 2 }),
    prompt: 'სკოლამ პირველ კლასებში {a} მოსწავლე მიიღო, მეორე კლასებში — {b}, ხოლო მესამე კლასებში — {c}. რამდენი მოსწავლე მიიღეს ამ სამ ჯგუფში ერთად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["128|136|142", "115|124|135", "140|132|148", "122|128|134", "135|142|129", "118|126|132", "145|138|152", "125|130|140", "130|135|145", "112|120|128", "138|144|136", "124|132|141"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `სამ ჯგუფში ერთად მიიღეს: ${vars.a} + ${vars.b} + ${vars.c} = ${answer} მოსწავლე.`,
  }),

  // g4-u07-12 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u07-12', subtopicId: 'u07-addition-problems', difficulty: 3 }),
    prompt: 'ფერმერმა {a} კილოგრამი ვაშლი, {b} კილოგრამი მსხალი და {c} კილოგრამი ატამი მოიწია. რამდენი კილოგრამი ხილი მოიწია სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1245|2360|1875", "1420|2150|1680", "1180|2450|1920", "1350|2280|1740", "1520|2190|1850", "1290|2340|1670", "1460|2520|1810", "1150|2410|1950", "1380|2240|1780", "1540|2180|1890", "1220|2390|1650", "1480|2460|1720"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => `${Number(v.a) + Number(v.b) + Number(v.c)} კგ`,
    distractors: (ctx) => nearMisses(parseInt(String(ctx.answer), 10), 3, 100, 1).map(n => `${n} კგ`),
    explanation: ({ vars, answer }) => `სულ მოიწია: ${vars.a} + ${vars.b} + ${vars.c} = ${answer} ხილი.`,
  }),

  // g4-u07-13 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-13', subtopicId: 'u07-mixed-problems', difficulty: 1 }),
    prompt: 'მაღაზიაში {a} რვეული იყო. დილით {b} გაყიდეს, საღამოს კი {c} ახალი რვეული შეიტანეს. რამდენი რვეულია ახლა მაღაზიაში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["450|125|80", "380|110|95", "520|145|70", "410|135|85", "490|160|110", "360|95|75", "440|120|90", "510|155|65", "430|140|100", "390|115|85", "470|130|75", "530|170|120"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.a) - Number(v.b) + Number(v.c),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `მაღაზიაში დარჩა: ${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}, შემდეგ დაემატა ${vars.c}: ${Number(vars.a) - Number(vars.b)} + ${vars.c} = ${answer} რვეული.`,
  }),

  // g4-u07-14 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-14', subtopicId: 'u07-mixed-problems', difficulty: 2 }),
    prompt: 'ბიბლიოთეკაში {a} წიგნი იყო. {b} წიგნი გაიტანეს, შემდეგ კი {c} ახალი წიგნი შეიტანეს. რამდენი წიგნია ახლა ბიბლიოთეკაში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1200|245|180", "1400|310|220", "1150|195|160", "1350|280|190", "1500|350|240", "1250|220|170", "1450|290|210", "1100|180|150", "1300|260|200", "1600|380|250", "1280|230|175", "1380|275|195"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.a) - Number(v.b) + Number(v.c),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 20, 1),
    explanation: ({ vars, answer }) => `წიგნების რაოდენობაა: ${vars.a} − ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // g4-u07-15 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-15', subtopicId: 'u07-mixed-problems', difficulty: 2 }),
    prompt: 'ავტობუსში {a} მგზავრი იყო. პირველ გაჩერებაზე {b} ჩავიდა, ხოლო {c} ავიდა. რამდენი მგზავრია ავტობუსში ახლა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["48|17|12", "52|19|15", "45|14|11", "56|22|18", "42|15|13", "50|18|14", "46|16|10", "54|21|17", "40|13|16", "58|24|19", "44|15|12", "49|18|15"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.a) - Number(v.b) + Number(v.c),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) => `გაჩერების შემდეგ: ${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}, შემდეგ ავიდა ${vars.c}: ${Number(vars.a) - Number(vars.b)} + ${vars.c} = ${answer} მგზავრი.`,
  }),

  // g4-u07-16 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-16', subtopicId: 'u07-mixed-problems', difficulty: 2 }),
    prompt: 'ფერმერმა {a} კილოგრამი ვაშლი გაყიდა, ხოლო {b} კილოგრამი დარჩა. რამდენი კილოგრამი ვაშლი ჰქონდა ფერმერს თავდაპირველად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["325|480", "280|510", "340|460", "295|525", "360|440", "310|495", "270|530", "350|470", "330|485", "285|515", "375|425", "305|500"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => `${Number(v.a) + Number(v.b)} კგ`,
    distractors: (ctx) => nearMisses(parseInt(String(ctx.answer), 10), 3, 25, 1).map(n => `${n} კგ`),
    explanation: ({ vars, answer }) => `თავდაპირველად ჰქონდა: ${vars.a} + ${vars.b} = ${answer} ვაშლი.`,
  }),

  // g4-u07-17 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-17', subtopicId: 'u07-mixed-problems', difficulty: 2 }),
    prompt: 'მაღაზიამ {a} სათამაშო მიიღო. პირველ დღეს {b} გაყიდა, მეორე დღეს კი — {c}. რამდენი სათამაშო დარჩა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["240|85|67", "260|92|74", "220|78|65", "250|88|71", "280|105|82", "210|72|59", "235|81|69", "270|98|76", "225|75|63", "255|90|73", "245|84|68", "265|95|77"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.a) - Number(v.b) - Number(v.c),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `ორივე დღეს გაიყიდა: ${vars.b} + ${vars.c} = ${Number(vars.b) + Number(vars.c)}. დარჩა: ${vars.a} − ${Number(vars.b) + Number(vars.c)} = ${answer} სათამაშო.`,
  }),

  // g4-u07-18 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u07-18', subtopicId: 'u07-mixed-problems', difficulty: 3 }),
    prompt: 'საწყობში {a} კილოგრამი ფქვილი იყო. {b} კილოგრამი გაყიდეს და შემდეგ კიდევ {c} კილოგრამი შეიტანეს. რამდენი კილოგრამი ფქვილია ახლა საწყობში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2500|750|1200", "2800|850|1100", "2400|680|1350", "3100|920|1400", "2200|640|1250", "2700|820|1150", "2900|890|1300", "2300|710|1450", "3200|950|1200", "2600|780|1380", "2450|720|1220", "2750|840|1180"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => `${Number(v.a) - Number(v.b) + Number(v.c)} კგ`,
    distractors: (ctx) => nearMisses(parseInt(String(ctx.answer), 10), 3, 100, 1).map(n => `${n} კგ`),
    explanation: ({ vars, answer }) => `საწყობში დარჩა: ${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)} კგ, ხოლო შეტანის შემდეგ გახდა: ${Number(vars.a) - Number(vars.b)} + ${vars.c} = ${answer}.`,
  }),

  // g4-u07-19 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-19', subtopicId: 'u07-operation-signs', difficulty: 1 }),
    prompt: 'ჩასვი „+“ ან „−“: {a} □ {b} = {c}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["18|7|25", "24|9|33", "35|12|47", "42|16|58", "15|18|33", "27|14|41", "38|15|53", "46|17|63", "19|23|42", "28|19|47", "33|24|57", "45|18|63"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: () => '+',
    options: () => ['+', '−', '×', '÷'],
    explanation: ({ vars }) => `რადგან ${vars.a} + ${vars.b} = ${vars.c}, სწორი ნიშანია „+“.`,
  }),

  // g4-u07-20 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-20', subtopicId: 'u07-operation-signs', difficulty: 1 }),
    prompt: 'ჩასვი „+“ ან „−“: {a} □ {b} = {c}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["42|15|27", "35|18|17", "54|26|28", "63|25|38", "48|19|29", "51|24|27", "38|14|24", "57|28|29", "45|17|28", "62|27|35", "55|29|26", "44|18|26"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: () => '−',
    options: () => ['−', '+', '×', '÷'],
    explanation: ({ vars }) => `რადგან ${vars.a} − ${vars.b} = ${vars.c}, სწორი ნიშანია „−“.`,
  }),

  // g4-u07-21 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-21', subtopicId: 'u07-operation-signs', difficulty: 2 }),
    prompt: 'ჩასვი „×“ ან „÷“: {a} □ {b} = {c}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|6|48", "7|9|63", "6|7|42", "9|8|72", "5|8|40", "4|9|36", "7|7|49", "8|8|64", "6|9|54", "9|5|45", "8|4|32", "7|8|56"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: () => '×',
    options: () => ['×', '÷', '+', '−'],
    explanation: ({ vars }) => `რადგან ${vars.a} × ${vars.b} = ${vars.c}, სწორი ნიშანია „×“.`,
  }),

  // g4-u07-22 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-22', subtopicId: 'u07-operation-signs', difficulty: 2 }),
    prompt: 'ჩასვი „×“ ან „÷“: {a} □ {b} = {c}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["72|9|8", "56|8|7", "48|6|8", "63|7|9", "54|9|6", "42|6|7", "81|9|9", "64|8|8", "45|5|9", "40|8|5", "36|4|9", "49|7|7"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: () => '÷',
    options: () => ['÷', '×', '+', '−'],
    explanation: ({ vars }) => `რადგან ${vars.a} ÷ ${vars.b} = ${vars.c}, სწორი ნიშანია „÷“.`,
  }),

  // g4-u07-23 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-23', subtopicId: 'u07-operation-signs', difficulty: 2 }),
    prompt: 'ჩასვი მოქმედების ნიშანი: {a} □ {b} = {c}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["25|5|30|+", "36|6|30|−", "7|6|42|×", "40|8|5|÷", "18|6|24|+", "50|15|35|−", "8|7|56|×", "63|9|7|÷", "28|7|35|+", "44|12|32|−", "9|6|54|×", "48|8|6|÷"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      op: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.op),
    options: () => ['+', '−', '×', '÷'],
    explanation: ({ vars }) => `რადგან ${vars.a} ${vars.op} ${vars.b} = ${vars.c}, სწორი ნიშანია „${vars.op}“.`,
  }),

  // g4-u07-24 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u07-24', subtopicId: 'u07-operation-signs', difficulty: 3 }),
    prompt: 'ჩასვი მოქმედების ნიშანი: {a} □ {b} = {c}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["56|7|8|÷", "9|7|63|×", "74|26|100|+", "85|35|50|−", "72|8|9|÷", "8|9|72|×", "48|22|70|+", "90|42|48|−", "54|6|9|÷", "7|8|56|×", "65|35|100|+", "78|28|50|−"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      op: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.op),
    options: () => ['+', '−', '×', '÷'],
    explanation: ({ vars }) => `რადგან ${vars.a} ${vars.op} ${vars.b} = ${vars.c}, სწორი ნიშანია „${vars.op}“.`,
  }),

  // g4-u07-25 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-25', subtopicId: 'u07-sufficient-conditions', difficulty: 1 }),
    prompt: 'კალათაში {a} ვაშლი და {b} მსხალია. საკმარისია თუ არა ეს ინფორმაცია ხილის საერთო რაოდენობის საპოვნელად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["24|18", "30|15", "22|19", "28|14", "35|20", "16|25", "27|13", "32|18", "21|24", "26|17", "33|12", "29|16"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => `დიახ, საკმარისია (${v.a} + ${v.b} = ${Number(v.a) + Number(v.b)})`,
    options: (v) => [
      `დიახ, საკმარისია (${v.a} + ${v.b} = ${Number(v.a) + Number(v.b)})`,
      'არა, არასაკმარისია',
      'მხოლოდ ვაშლებისთვისაა საკმარისი',
      'საჭიროა კალათის წონის ცოდნა',
    ],
    explanation: ({ vars, answer }) => `მოცემულია ორივე სახეობის ხილის რაოდენობა (${vars.a} და ${vars.b}), ამიტომ მათი შეკრებით საერთო რაოდენობა იპოვება: ${answer}.`,
  }),

  // g4-u07-26 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-26', subtopicId: 'u07-sufficient-conditions', difficulty: 1 }),
    prompt: 'მაღაზიაში {a} ბურთი იყო. რამდენი ბურთი დარჩა გაყიდვის შემდეგ? მოცემული ინფორმაცია საკმარისია თუ არა პასუხის გასაცემად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["45", "52", "38", "60", "42", "55", "48", "65", "35", "58", "40", "50"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
    },
    answer: () => 'არა, არ არის საკმარისი (უცნობია გაყიდული ბურთების რაოდენობა)',
    options: (v) => [
      'არა, არ არის საკმარისი (უცნობია გაყიდული ბურთების რაოდენობა)',
      'დიახ, საკმარისია',
      `დიახ, დარჩა ${Number(v.a) - 10} ბურთი`,
      'დიახ, დარჩა 0 ბურთი',
    ],
    explanation: () => 'იმის გასაგებად, თუ რამდენი ბურთი დარჩა, აუცილებელია ვიცოდეთ რამდენი ბურთი გაიყიდა. ეს მონაცემი პირობაში არ არის, ამიტომ ინფორმაცია არასაკმარისია.',
  }),

  // g4-u07-27 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-27', subtopicId: 'u07-sufficient-conditions', difficulty: 2 }),
    prompt: 'ავტობუსში {a} მგზავრი იყო, შემდეგ კი {b} მგზავრი ავიდა. რამდენი მგზავრია ახლა ავტობუსში? საკმარისია თუ არა მოცემული ინფორმაცია?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["32|8", "28|7", "35|9", "40|6", "25|11", "34|8", "30|12", "27|9", "36|7", "31|10", "29|8", "33|11"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => `დიახ, საკმარისია (${v.a} + ${v.b} = ${Number(v.a) + Number(v.b)})`,
    options: (v) => [
      `დიახ, საკმარისია (${v.a} + ${v.b} = ${Number(v.a) + Number(v.b)})`,
      'არა, არასაკმარისია',
      'საჭიროა მძღოლის ასაკი',
      'საჭიროა ბილეთის ფასის ცოდნა',
    ],
    explanation: ({ vars }) => `საწყის რაოდენობას (${vars.a}) ემატება ასული მგზავრები (${vars.b}): ${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}. ინფორმაცია სრულად საკმარისია.`,
  }),

  // g4-u07-28 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-28', subtopicId: 'u07-sufficient-conditions', difficulty: 2 }),
    prompt: 'მართკუთხედის სიგრძეა {l} სმ. შეიძლება თუ არა მხოლოდ ამ მონაცემით მისი ფართობის პოვნა? რა მონაცემი აკლია?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12", "15", "18", "14", "16", "20", "10", "22", "25", "11", "13", "17"],
      },
      l: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
    },
    answer: () => 'არა, აკლია სიგანე',
    options: (v) => [
      'არა, აკლია სიგანე',
      `დიახ, ფართობია ${Number(v.l) * Number(v.l)} სმ²`,
      'არა, აკლია პერიმეტრი',
      'დიახ, შესაძლებელია',
    ],
    explanation: () => 'მართკუთხედის ფართობი ტოლია სიგრძის ნამრავლის სიგანეზე (S = a × b). მხოლოდ სიგრძით ფართობის გამოთვლა შეუძლებელია — აკლია სიგანე.',
  }),

  // g4-u07-29 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-29', subtopicId: 'u07-sufficient-conditions', difficulty: 2 }),
    prompt: 'ნინომ {k} რვეული იყიდა, თითოეული {p} ლარი ღირდა. საკმარისია თუ არა ინფორმაცია საერთო ღირებულების საპოვნელად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|3", "6|2", "4|4", "7|3", "8|2", "3|5", "5|4", "6|3", "4|5", "7|2", "9|2", "3|6"],
      },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => `დიახ, საკმარისია (${v.k} × ${v.p} = ${Number(v.k) * Number(v.p)} ლარი)`,
    options: (v) => [
      `დიახ, საკმარისია (${v.k} × ${v.p} = ${Number(v.k) * Number(v.p)} ლარი)`,
      'არა, არასაკმარისია',
      'არა, აკლია რვეულში ფურცლების რაოდენობა',
      'მხოლოდ ერთი რვეულის ფასია ცნობილი',
    ],
    explanation: ({ answer }) => `საერთო ღირებულება გამოითვლება რაოდენობის ფასზე გამრავლებით: ${answer}. ინფორმაცია სავსებით საკმარისია.`,
  }),

  // g4-u07-30 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u07-30', subtopicId: 'u07-sufficient-conditions', difficulty: 3 }),
    prompt: 'ბაღში სულ {t} ხეა (მხოლოდ ვაშლი და მსხალი). ვაშლის ხეები მსხლის ხეებზე {d}-ით მეტია. შეიძლება თუ არა მხოლოდ ამ მონაცემებით მათი რაოდენობების ცალ-ცალკე პოვნა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["120|20", "100|30", "80|20", "140|40", "90|10", "110|30", "130|50", "150|30", "160|40", "70|10", "84|16", "126|26"],
      },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => `დიახ, შესაძლებელია (მსხალი: ${(Number(v.t) - Number(v.d)) / 2}, ვაშლი: ${(Number(v.t) - Number(v.d)) / 2 + Number(v.d)})`,
    options: (v) => [
      `დიახ, შესაძლებელია (მსხალი: ${(Number(v.t) - Number(v.d)) / 2}, ვაშლი: ${(Number(v.t) - Number(v.d)) / 2 + Number(v.d)})`,
      'არა, შეუძლებელია',
      'მხოლოდ ვაშლის ხეების პოვნაა შესაძლებელი',
      'მხოლოდ მსხლის ხეების პოვნაა შესაძლებელი',
    ],
    explanation: ({ vars }) => `მსხლის ხეებია: (${vars.t} − ${vars.d}) ÷ 2 = ${(Number(vars.t) - Number(vars.d)) / 2}, ხოლო ვაშლის ხეებია: ${(Number(vars.t) - Number(vars.d)) / 2} + ${vars.d} = ${(Number(vars.t) - Number(vars.d)) / 2 + Number(vars.d)}. მონაცემები სრულიად საკმარისია.`,
  }),

  // g4-u07-31 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-31', subtopicId: 'u07-guess-and-check', difficulty: 1 }),
    prompt: 'იპოვე რიცხვი {min}-სა და {max}-ს შორის, რომელიც {div}-ზე გაყოფისას ნაშთად {rem}-ს გვაძლევს.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["20|40|6|2|26", "20|35|5|3|28", "15|30|4|1|21", "25|45|7|4|32", "30|50|8|3|35", "20|35|6|5|29", "10|25|4|3|19", "20|40|7|2|23", "30|45|5|2|32", "15|35|8|5|21", "25|40|6|4|34", "20|35|7|6|27"],
      },
      min: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      max: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      div: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      rem: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
    },
    answer: (v) => Number(v.ans),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${answer} მოთავსებულია ${vars.min}-სა და ${vars.max}-ს შორის: ${answer} = ${vars.div} × ${Math.floor(Number(answer) / Number(vars.div))} + ${vars.rem}, ე.ი. ${vars.div}-ზე გაყოფისას ნაშთია ${vars.rem}.`,
  }),

  // g4-u07-32 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-32', subtopicId: 'u07-guess-and-check', difficulty: 1 }),
    prompt: 'იპოვე ორნიშნა რიცხვი, რომელიც {div}-ზე იყოფა და {min}-ზე მეტია, მაგრამ {max}-ზე ნაკლები.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["30|40|5|35", "20|30|7|28", "40|50|6|42", "50|60|8|56", "20|30|9|27", "60|70|7|63", "30|40|8|32", "40|50|9|45", "70|80|8|72", "20|30|6|24", "50|60|7|56", "30|40|9|36"],
      },
      min: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      max: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      div: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.ans),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) => `${answer} მეტია ${vars.min}-ზე და ნაკლებია ${vars.max}-ზე (${vars.min} < ${answer} < ${vars.max}) და იყოფა ${vars.div}-ზე: ${answer} ÷ ${vars.div} = ${Number(answer) / Number(vars.div)}.`,
  }),

  // g4-u07-33 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-33', subtopicId: 'u07-guess-and-check', difficulty: 2 }),
    prompt: 'იპოვე რიცხვი, რომელიც {k}-ზე გამრავლებისას {pMin}-სა და {pMax}-ს შორის არსებულ რიცხვს გვაძლევს და თვითონ 10-ზე ნაკლებია.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|30|35|8", "5|32|38|7", "6|45|50|8", "7|38|45|6", "8|50|60|7", "9|65|75|8", "4|25|30|7", "6|50|56|9", "7|58|66|9", "8|65|75|9", "5|41|48|9", "3|22|26|8"],
      },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      pMin: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      pMax: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.ans),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${answer} < 10 და ${answer} × ${vars.k} = ${Number(answer) * Number(vars.k)}, რაც მოთავსებულია ${vars.pMin}-სა და ${vars.pMax}-ს შორის.`,
  }),

  // g4-u07-34 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-34', subtopicId: 'u07-guess-and-check', difficulty: 2 }),
    prompt: 'იპოვე რიცხვი {min}-სა და {max}-ს შორის, რომელიც {div}-ზე გაყოფისას ნაშთად {rem}-ს გვაძლევს.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10|30|7|3|17", "15|35|6|4|22", "20|40|8|5|29", "25|45|9|2|29", "10|25|5|2|17", "15|30|7|5|19", "20|35|6|3|27", "25|40|8|2|26", "12|28|5|3|23", "18|32|7|4|25", "22|38|6|2|26", "15|30|8|7|23"],
      },
      min: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      max: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      div: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      rem: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
    },
    answer: (v) => Number(v.ans),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${answer} მოთავსებულია ${vars.min}-სა და ${vars.max}-ს შორის და ${answer} ÷ ${vars.div} = ${Math.floor(Number(answer) / Number(vars.div))} (ნაშთი ${vars.rem}).`,
  }),

  // g4-u07-35 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-35', subtopicId: 'u07-guess-and-check', difficulty: 2 }),
    prompt: 'იპოვე ისეთი რიცხვი, რომ მასზე {add}-ის დამატებით მივიღოთ {min}-ზე მეტი, მაგრამ {max}-ზე ნაკლები რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|25|27|18", "7|20|22|14", "9|30|32|22", "6|23|25|18", "8|28|30|21", "10|35|37|26", "5|18|20|14", "7|25|27|19", "9|27|29|19", "8|32|34|25", "6|27|29|22", "7|31|33|25"],
      },
      add: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      min: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      max: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.ans),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${answer} + ${vars.add} = ${Number(answer) + Number(vars.add)}, რაც მოთავსებულია ${vars.min}-სა და ${vars.max}-ს შორის.`,
  }),

  // g4-u07-36 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u07-36', subtopicId: 'u07-guess-and-check', difficulty: 3 }),
    prompt: 'იპოვე ორნიშნა რიცხვი, რომელიც {a}-ზე და {b}-ზე იყოფა უნაშთოდ და {min}-ზე მეტია, მაგრამ {max}-ზე ნაკლები.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|4|20|30|24", "3|4|30|40|36", "2|5|25|35|30", "3|5|20|35|30", "4|6|30|40|36", "3|7|35|45|42", "2|7|20|30|28", "3|8|40|55|48", "4|5|35|45|40", "2|9|30|40|36", "3|5|40|50|45", "4|7|20|35|28"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      min: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      max: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
    },
    answer: (v) => Number(v.ans),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) => `${answer} მოთავსებულია ${vars.min}-სა და ${vars.max}-ს შორის და იყოფა ორივე რიცხვზე: ${answer} ÷ ${vars.a} = ${Number(answer) / Number(vars.a)}, ${answer} ÷ ${vars.b} = ${Number(answer) / Number(vars.b)}.`,
  }),

  // g4-u07-37 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-37', subtopicId: 'u07-equations', difficulty: 1 }),
    prompt: 'იპოვე x: x + {a} = {b}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["18|45", "24|61", "15|52", "27|43", "32|70", "19|48", "26|55", "14|39", "35|62", "22|51", "17|44", "28|63"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.b) - Number(v.a),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `x = ${vars.b} − ${vars.a} = ${answer}.`,
  }),

  // g4-u07-38 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-38', subtopicId: 'u07-equations', difficulty: 1 }),
    prompt: 'იპოვე x: x − {a} = {b}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["27|36", "19|45", "24|38", "32|29", "15|48", "28|35", "22|43", "17|51", "26|37", "34|28", "18|46", "23|39"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.b) + Number(v.a),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `x = ${vars.b} + ${vars.a} = ${answer}.`,
  }),

  // g4-u07-39 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-39', subtopicId: 'u07-equations', difficulty: 2 }),
    prompt: 'იპოვე x: {a}x = {b}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|48", "5|65", "6|72", "3|51", "7|84", "4|64", "8|96", "5|75", "6|84", "3|42", "7|91", "4|56"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.b) / Number(v.a),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `x = ${vars.b} ÷ ${vars.a} = ${answer}.`,
  }),

  // g4-u07-40 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-40', subtopicId: 'u07-equations', difficulty: 2 }),
    prompt: 'იპოვე x: x ÷ {a} = {b}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["6|9", "7|8", "8|7", "9|6", "5|12", "4|15", "6|11", "7|9", "8|8", "9|7", "5|14", "4|16"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) => `x = ${vars.b} × ${vars.a} = ${answer}.`,
  }),

  // g4-u07-41 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u07-41', subtopicId: 'u07-equations', difficulty: 3 }),
    prompt: 'იპოვე x: {a}x + {b} = {c}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|7|31", "4|9|45", "5|6|41", "2|11|27", "6|8|50", "3|14|38", "4|15|47", "5|12|52", "2|17|35", "6|5|47", "3|8|32", "4|7|39"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => (Number(v.c) - Number(v.b)) / Number(v.a),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a}x = ${vars.c} − ${vars.b} = ${Number(vars.c) - Number(vars.b)}, ე.ი. x = ${Number(vars.c) - Number(vars.b)} ÷ ${vars.a} = ${answer}.`,
  }),

  // g4-u07-42 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u07-42', subtopicId: 'u07-equations', difficulty: 3 }),
    prompt: 'იპოვე x: {a}x − {b} = {c}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|12|38", "4|15|29", "3|11|25", "6|14|40", "2|9|25", "5|16|34", "4|8|36", "3|14|28", "6|10|38", "2|15|27", "5|7|43", "4|11|33"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => (Number(v.c) + Number(v.b)) / Number(v.a),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.a}x = ${vars.c} + ${vars.b} = ${Number(vars.c) + Number(vars.b)}, ე.ი. x = ${Number(vars.c) + Number(vars.b)} ÷ ${vars.a} = ${answer}.`,
  }),

  // g4-u07-43 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-43', subtopicId: 'u07-equalizing-quantities', difficulty: 1 }),
    prompt: 'პირველ ყუთში {a} ბურთია, მეორეში კი — {b}. რამდენი ბურთი უნდა დაამატონ მეორე ყუთს, რომ ორივეში თანაბარი რაოდენობა იყოს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["18|11", "24|15", "32|19", "27|18", "35|22", "21|14", "29|17", "33|24", "26|16", "38|25", "22|13", "31|20"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `რაოდენობების გასათანაბრებლად მეორე ყუთს უნდა დაემატოს: ${vars.a} − ${vars.b} = ${answer} ბურთი.`,
  }),

  // g4-u07-44 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-44', subtopicId: 'u07-equalizing-quantities', difficulty: 1 }),
    prompt: 'ნინოს {a} სტიკერი აქვს, ლუკას კი — {b}. რამდენი სტიკერი უნდა მიიღოს ლუკამ, რომ მათ თანაბარი რაოდენობა ჰქონდეთ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["35|22", "42|28", "38|24", "45|29", "31|18", "48|32", "36|21", "44|27", "39|25", "41|26", "33|19", "47|30"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ლუკამ უნდა მიიღოს: ${vars.a} − ${vars.b} = ${answer} სტიკერი.`,
  }),

  // g4-u07-45 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-45', subtopicId: 'u07-equalizing-quantities', difficulty: 2 }),
    prompt: 'პირველ თაროზე {a} წიგნია, მეორეზე კი — {b}. რამდენი წიგნი უნდა დაამატონ მეორე თაროს, რომ რაოდენობები გათანაბრდეს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["125|98", "140|112", "115|86", "135|95", "150|118", "120|94", "145|108", "110|82", "130|99", "155|122", "128|92", "138|105"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) => `მეორე თაროს უნდა დაემატოს: ${vars.a} − ${vars.b} = ${answer} წიგნი.`,
  }),

  // g4-u07-46 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-46', subtopicId: 'u07-equalizing-quantities', difficulty: 2 }),
    prompt: 'ერთ საწყობში {a} კილოგრამი ფქვილია, მეორეში კი — {b} კილოგრამი. რამდენი კილოგრამი უნდა დაამატონ მეორე საწყობს, რომ ორივეში თანაბარი რაოდენობა იყოს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["450|375", "520|430", "480|390", "550|460", "410|335", "580|490", "460|385", "540|445", "430|355", "510|425", "470|380", "560|475"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => `${Number(v.a) - Number(v.b)} კგ`,
    distractors: (ctx) => nearMisses(parseInt(String(ctx.answer), 10), 3, 5, 1).map(n => `${n} კგ`),
    explanation: ({ vars, answer }) => `მეორე საწყობს უნდა დაემატოს: ${vars.a} − ${vars.b} = ${answer} ფქვილი.`,
  }),

  // g4-u07-47 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-47', subtopicId: 'u07-equalizing-quantities', difficulty: 2 }),
    prompt: 'პირველ კლასში {a} მოსწავლეა, მეორეში კი — {b}. რამდენი მოსწავლე უნდა დაემატოს მეორე კლასს, რომ ორივე კლასში თანაბარი რაოდენობა იყოს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["28|24", "30|25", "27|22", "31|26", "29|23", "32|27", "26|21", "30|24", "28|22", "33|28", "25|20", "31|25"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `მეორე კლასს უნდა დაემატოს: ${vars.a} − ${vars.b} = ${answer} მოსწავლე.`,
  }),

  // g4-u07-48 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u07-48', subtopicId: 'u07-equalizing-quantities', difficulty: 3 }),
    prompt: 'პირველ ფერმაში {a} ქათამია, მეორეში კი — {b}. რამდენი ქათამი უნდა დაემატოს მეორე ფერმას, რომ ორივე ფერმაში თანაბარი რაოდენობა იყოს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1250|975", "1400|1120", "1180|890", "1350|1040", "1520|1180", "1220|950", "1450|1160", "1100|840", "1300|980", "1550|1210", "1280|990", "1380|1070"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 20, 1),
    explanation: ({ vars, answer }) => `მეორე ფერმას უნდა დაემატოს: ${vars.a} − ${vars.b} = ${answer} ქათამი.`,
  }),

  // g4-u07-49 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-49', subtopicId: 'u07-multiplication-addition', difficulty: 1 }),
    prompt: 'ერთ ყუთში {a} ფანქარია. რამდენი ფანქარია {k} ასეთ ყუთში და კიდევ {m} ცალკე ფანქარში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|5|7", "6|6|5", "10|4|8", "12|3|9", "7|7|6", "9|4|11", "8|6|5", "6|8|7", "10|5|4", "12|4|6", "7|5|8", "9|5|7"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.k) * Number(v.a) + Number(v.m),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) => `${vars.k} ყუთშია: ${vars.k} × ${vars.a} = ${Number(vars.k) * Number(vars.a)} ფანქარი. სულ არის: ${Number(vars.k) * Number(vars.a)} + ${vars.m} = ${answer} ფანქარი.`,
  }),

  // g4-u07-50 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-50', subtopicId: 'u07-multiplication-addition', difficulty: 1 }),
    prompt: 'ერთ ავტობუსში {a} მგზავრია. რამდენი მგზავრი იქნება {k} ასეთ ავტობუსში და კიდევ {m} მგზავრი მიკროავტობუსში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["36|4|12", "30|5|15", "40|3|14", "32|4|16", "35|3|18", "28|5|11", "34|4|10", "38|3|15", "30|4|17", "42|3|13", "25|6|14", "36|3|19"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.k) * Number(v.a) + Number(v.m),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 1),
    explanation: ({ vars, answer }) => `${vars.k} ავტობუსშია: ${vars.k} × ${vars.a} = ${Number(vars.k) * Number(vars.a)} მგზავრი. სულ არის: ${Number(vars.k) * Number(vars.a)} + ${vars.m} = ${answer} მგზავრი.`,
  }),

  // g4-u07-51 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-51', subtopicId: 'u07-multiplication-addition', difficulty: 2 }),
    prompt: 'ერთ ყუთში {a} რვეულია. სკოლამ {k} ასეთი ყუთი მიიღო და დამატებით {m} რვეული. რამდენი რვეული მიიღო სკოლამ სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["24|6|35", "20|7|42", "25|5|28", "30|4|45", "18|8|32", "22|6|38", "28|5|24", "26|4|36", "25|6|30", "32|4|25", "20|8|40", "24|5|48"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.k) * Number(v.a) + Number(v.m),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.k} ყუთშია: ${vars.k} × ${vars.a} = ${Number(vars.k) * Number(vars.a)} რვეული. სულ მიიღო: ${Number(vars.k) * Number(vars.a)} + ${vars.m} = ${answer} რვეული.`,
  }),

  // g4-u07-52 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-52', subtopicId: 'u07-multiplication-addition', difficulty: 2 }),
    prompt: 'ბაღში {r} რიგია, თითოეულ რიგში {n} ხეა. მოგვიანებით კიდევ {m} ხე დარგეს. რამდენი ხეა ახლა ბაღში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|25|40", "6|30|35", "7|24|48", "9|20|50", "5|35|25", "8|22|44", "6|28|32", "7|25|45", "9|22|38", "8|24|52", "5|40|30", "6|32|28"],
      },
      r: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.r) * Number(v.n) + Number(v.m),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `${vars.r} რიგში იყო: ${vars.r} × ${vars.n} = ${Number(vars.r) * Number(vars.n)} ხე. სულ გახდა: ${Number(vars.r) * Number(vars.n)} + ${vars.m} = ${answer} ხე.`,
  }),

  // g4-u07-53 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-53', subtopicId: 'u07-multiplication-addition', difficulty: 2 }),
    prompt: 'მაღაზიამ {k} ყუთი სათამაშო მიიღო, თითოეულში {n} სათამაშო იყო. შემდეგ კიდევ {m} სათამაშო შეიტანეს. რამდენი სათამაშოა სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["7|18|26", "6|22|34", "8|15|28", "5|24|30", "9|14|24", "6|20|32", "7|16|38", "8|18|22", "5|26|25", "7|20|28", "6|25|35", "8|16|30"],
      },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.k) * Number(v.n) + Number(v.m),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 1),
    explanation: ({ vars, answer }) => `ყუთებში იყო: ${vars.k} × ${vars.n} = ${Number(vars.k) * Number(vars.n)} სათამაშო. სულ არის: ${Number(vars.k) * Number(vars.n)} + ${vars.m} = ${answer} სათამაშო.`,
  }),

  // g4-u07-54 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u07-54', subtopicId: 'u07-multiplication-addition', difficulty: 3 }),
    prompt: 'ფერმერმა {k} კალათაში {w}-{w} კილოგრამი ვაშლი მოათავსა და დამატებით {m} კილოგრამი მსხალი მოიწია. რამდენი კილოგრამი ხილი აქვს სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["9|32|125", "8|35|140", "7|40|110", "6|45|130", "8|30|150", "9|28|135", "7|36|120", "8|34|128", "6|42|145", "9|30|115", "7|38|134", "8|32|142"],
      },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      w: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => `${Number(v.k) * Number(v.w) + Number(v.m)} კგ`,
    distractors: (ctx) => nearMisses(parseInt(String(ctx.answer), 10), 3, 15, 1).map(n => `${n} კგ`),
    explanation: ({ vars, answer }) => `ვაშლის მასაა: ${vars.k} × ${vars.w} = ${Number(vars.k) * Number(vars.w)} კგ. სულ ხილია: ${Number(vars.k) * Number(vars.w)} + ${vars.m} = ${answer}.`,
  }),

  // g4-u07-55 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-55', subtopicId: 'u07-time-intervals', difficulty: 1 }),
    prompt: 'გაკვეთილი {h}:00 საათზე დაიწყო და {m} წუთს გაგრძელდა. რომელ საათზე დასრულდა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["9|45", "10|40", "11|45", "8|50", "12|45", "13|40", "14|45", "15|35", "9|50", "10|45", "11|40", "12|35"],
      },
      h: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => `${v.h}:${Number(v.m) < 10 ? '0' + v.m : v.m}`,
    options: (v) => [
      `${v.h}:${Number(v.m) < 10 ? '0' + v.m : v.m}`,
      `${v.h}:${Number(v.m) - 5}`,
      `${Number(v.h) + 1}:${Number(v.m) < 10 ? '0' + v.m : v.m}`,
      `${v.h}:${Number(v.m) + 5 >= 60 ? '00' : Number(v.m) + 5}`,
    ],
    explanation: ({ vars, answer }) => `${vars.h}:00 საათს დამატებული ${vars.m} წუთი არის ${answer}.`,
  }),

  // g4-u07-56 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-56', subtopicId: 'u07-time-intervals', difficulty: 1 }),
    prompt: 'ფილმი {startH}:{startMStr} საათზე დაიწყო და {dh} საათი და {dm} წუთი გაგრძელდა. რომელ საათზე დასრულდა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["14|20|1|30", "15|15|1|45", "16|10|2|10", "13|25|1|35", "17|20|1|40", "12|30|2|15", "18|15|1|30", "14|40|1|20", "15|30|2|0", "16|25|1|35", "13|15|2|10", "17|10|1|50"],
      },
      startH: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      startM: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      dh: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      dm: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      startMStr: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1]) < 10 ? '0' + String(v.spec).split('|')[1] : String(v.spec).split('|')[1]] },
    },
    answer: (v) => {
      const tot = Number(v.startH) * 60 + Number(v.startM) + Number(v.dh) * 60 + Number(v.dm);
      const eh = Math.floor(tot / 60);
      const em = tot % 60;
      return `${eh}:${em < 10 ? '0' + em : em}`;
    },
    options: (v) => {
      const tot = Number(v.startH) * 60 + Number(v.startM) + Number(v.dh) * 60 + Number(v.dm);
      const eh = Math.floor(tot / 60);
      const em = tot % 60;
      const ans = `${eh}:${em < 10 ? '0' + em : em}`;
      return [
        ans,
        `${eh - 1}:${em < 10 ? '0' + em : em}`,
        `${eh}:${(em + 15) % 60 < 10 ? '0' + ((em + 15) % 60) : (em + 15) % 60}`,
        `${eh + 1}:${em < 10 ? '0' + em : em}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.startH}:${vars.startMStr} საათს დამატებული ${vars.dh} საათი და ${vars.dm} წუთი არის ${answer}.`,
  }),

  // g4-u07-57 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-57', subtopicId: 'u07-time-intervals', difficulty: 2 }),
    prompt: 'მოსწავლემ ორშაბათს {m1} წუთი იმეცადინა, სამშაბათს — {m2} წუთი, ოთხშაბათს კი — {m3} წუთი. რამდენი წუთი იმეცადინა მან სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["35|45|50", "30|40|45", "40|35|55", "25|45|50", "35|50|40", "45|40|35", "30|50|45", "40|45|50", "35|35|45", "25|55|40", "45|35|50", "30|45|40"],
      },
      m1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      m2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      m3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => `${Number(v.m1) + Number(v.m2) + Number(v.m3)} წუთი`,
    distractors: (ctx) => nearMisses(parseInt(String(ctx.answer), 10), 3, 10, 1).map(n => `${n} წუთი`),
    explanation: ({ vars, answer }) => `სულ იმეცადინა: ${vars.m1} + ${vars.m2} + ${vars.m3} = ${answer}.`,
  }),

  // g4-u07-58 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-58', subtopicId: 'u07-time-intervals', difficulty: 2 }),
    prompt: 'მატარებელი {t1Str} საათზე გავიდა და დანიშნულების ადგილზე {t2Str} საათზე მივიდა. რამდენ ხანს გაგრძელდა მგზავრობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10|15|13|5", "9|20|12|40", "8|30|11|15", "11|10|14|50", "12|45|15|25", "7|40|10|30", "13|15|16|5", "10|30|13|45", "9|45|12|30", "8|15|11|50", "11|20|14|10", "12|10|15|40"],
      },
      h1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      m1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      h2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      m2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      t1Str: { kind: 'choice', values: (v) => [`${String(v.spec).split('|')[0]}:${Number(String(v.spec).split('|')[1]) < 10 ? '0' + String(v.spec).split('|')[1] : String(v.spec).split('|')[1]}`] },
      t2Str: { kind: 'choice', values: (v) => [`${String(v.spec).split('|')[2]}:${Number(String(v.spec).split('|')[3]) < 10 ? '0' + String(v.spec).split('|')[3] : String(v.spec).split('|')[3]}`] },
    },
    answer: (v) => {
      const diff = (Number(v.h2) * 60 + Number(v.m2)) - (Number(v.h1) * 60 + Number(v.m1));
      return `${Math.floor(diff / 60)} სთ და ${diff % 60} წთ`;
    },
    options: (v) => {
      const diff = (Number(v.h2) * 60 + Number(v.m2)) - (Number(v.h1) * 60 + Number(v.m1));
      const dh = Math.floor(diff / 60);
      const dm = diff % 60;
      const ans = `${dh} სთ და ${dm} წთ`;
      return [
        ans,
        `${dh + 1} სთ და ${dm} წთ`,
        `${dh} სთ და ${(dm + 10) % 60} წთ`,
        `${dh - 1 > 0 ? dh - 1 : dh + 2} სთ და ${dm} წთ`,
      ];
    },
    explanation: ({ vars, answer }) => `მგზავრობის ხანგრძლივობაა: ${vars.t2Str}-ს გამოკლებული ${vars.t1Str}, რაც შეადგენს ${answer}-ს.`,
  }),

  // g4-u07-59 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-59', subtopicId: 'u07-time-intervals', difficulty: 2 }),
    prompt: 'სპორტული ვარჯიში {startStr} საათზე დაიწყო და {dh} საათი და {dm} წუთი გაგრძელდა. რომელ საათზე დასრულდა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["16|30|1|20", "15|15|1|30", "17|20|1|15", "14|40|1|25", "18|10|1|20", "16|15|1|35", "15|45|1|15", "17|30|1|10", "14|20|1|40", "16|40|1|15", "18|25|1|20", "15|30|1|25"],
      },
      startH: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      startM: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      dh: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      dm: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      startStr: { kind: 'choice', values: (v) => [`${String(v.spec).split('|')[0]}:${Number(String(v.spec).split('|')[1]) < 10 ? '0' + String(v.spec).split('|')[1] : String(v.spec).split('|')[1]}`] },
    },
    answer: (v) => {
      const tot = Number(v.startH) * 60 + Number(v.startM) + Number(v.dh) * 60 + Number(v.dm);
      const eh = Math.floor(tot / 60);
      const em = tot % 60;
      return `${eh}:${em < 10 ? '0' + em : em}`;
    },
    options: (v) => {
      const tot = Number(v.startH) * 60 + Number(v.startM) + Number(v.dh) * 60 + Number(v.dm);
      const eh = Math.floor(tot / 60);
      const em = tot % 60;
      const ans = `${eh}:${em < 10 ? '0' + em : em}`;
      return [
        ans,
        `${eh - 1}:${em < 10 ? '0' + em : em}`,
        `${eh}:${(em + 10) % 60 < 10 ? '0' + ((em + 10) % 60) : (em + 10) % 60}`,
        `${eh + 1}:${em < 10 ? '0' + em : em}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.startStr}-ს დამატებული ${vars.dh} საათი და ${vars.dm} წუთი არის ${answer}.`,
  }),

  // g4-u07-60 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u07-60', subtopicId: 'u07-time-intervals', difficulty: 3 }),
    prompt: 'მოსწავლემ {d} დღის განმავლობაში ყოველდღე {m} წუთი იკითხა. რამდენი წუთი დაუთმო კითხვას {d} დღეში?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|40", "4|35", "5|30", "3|45", "4|40", "5|25", "6|30", "3|50", "4|45", "5|35", "3|35", "4|30"],
      },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => `${Number(v.d) * Number(v.m)} წუთი`,
    distractors: (ctx) => nearMisses(parseInt(String(ctx.answer), 10), 3, 15, 1).map(n => `${n} წუთი`),
    explanation: ({ vars, answer }) => `სულ დაუთმო: ${vars.d} × ${vars.m} = ${answer}.`,
  }),

  // g4-u07-61 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-61', subtopicId: 'u07-determine-compare', difficulty: 1 }),
    prompt: 'პირველ ყუთში {a} ბურთია, მეორეში კი — {k}-ჯერ ნაკლები. რამდენით მეტი ბურთია პირველ ყუთში მეორეზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["36|4", "40|5", "48|6", "32|4", "45|5", "42|6", "56|7", "54|6", "35|5", "28|4", "63|7", "48|8"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) - Number(v.a) / Number(v.k),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) => `მეორე ყუთშია: ${vars.a} ÷ ${vars.k} = ${Number(vars.a) / Number(vars.k)} ბურთი. სხვაობაა: ${vars.a} − ${Number(vars.a) / Number(vars.k)} = ${answer} ბურთი.`,
  }),

  // g4-u07-62 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-62', subtopicId: 'u07-determine-compare', difficulty: 1 }),
    prompt: 'ერთ მაღაზიაში {a} რვეულია, მეორეში კი — {k}-ჯერ მეტი. რამდენით მეტი რვეულია მეორე მაღაზიაში პირველზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["125|3", "110|4", "150|3", "120|4", "130|3", "140|3", "105|4", "115|3", "135|3", "125|4", "145|3", "100|5"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) * Number(v.k) - Number(v.a),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 25, 1),
    explanation: ({ vars, answer }) => `მეორე მაღაზიაშია: ${vars.a} × ${vars.k} = ${Number(vars.a) * Number(vars.k)} რვეული. სხვაობაა: ${Number(vars.a) * Number(vars.k)} − ${vars.a} = ${answer} რვეული.`,
  }),

  // g4-u07-63 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-63', subtopicId: 'u07-determine-compare', difficulty: 2 }),
    prompt: 'პირველმა ფერმამ {a} კილოგრამი ვაშლი მოიწია, მეორემ კი — {d} კილოგრამით მეტი. რამდენი კილოგრამი ვაშლი მოიწიეს ორივე ფერმამ ერთად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["240|180", "280|150", "220|190", "260|170", "310|140", "250|160", "290|130", "230|185", "270|175", "300|150", "210|195", "320|145"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => `${Number(v.a) + (Number(v.a) + Number(v.d))} კგ`,
    distractors: (ctx) => nearMisses(parseInt(String(ctx.answer), 10), 3, 20, 1).map(n => `${n} კგ`),
    explanation: ({ vars, answer }) => `მეორე ფერმამ მოიწია: ${vars.a} + ${vars.d} = ${Number(vars.a) + Number(vars.d)} კგ. ერთად მოიწიეს: ${vars.a} + ${Number(vars.a) + Number(vars.d)} = ${answer}.`,
  }),

  // g4-u07-64 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-64', subtopicId: 'u07-determine-compare', difficulty: 2 }),
    prompt: 'ნინოს {a} ბარათი აქვს, ლუკას კი — {k}-ჯერ ნაკლები. რამდენი ბარათი აქვთ მათ ერთად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["48|6", "42|7", "45|5", "54|6", "40|8", "36|4", "56|7", "48|8", "63|7", "35|5", "32|4", "54|9"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.a) + Number(v.a) / Number(v.k),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) => `ლუკას აქვს: ${vars.a} ÷ ${vars.k} = ${Number(vars.a) / Number(vars.k)} ბარათი. ერთად აქვთ: ${vars.a} + ${Number(vars.a) / Number(vars.k)} = ${answer} ბარათი.`,
  }),

  // g4-u07-65 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-65', subtopicId: 'u07-determine-compare', difficulty: 2 }),
    prompt: 'პირველ საწყობში {a} კილოგრამი ფქვილია, მეორეში კი — {d} კილოგრამით მეტი. რამდენი კილოგრამი ფქვილია ორივე საწყობში ერთად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1250|950", "1400|850", "1150|920", "1350|780", "1500|820", "1200|980", "1450|750", "1100|890", "1300|940", "1550|790", "1280|870", "1380|830"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => `${Number(v.a) + (Number(v.a) + Number(v.d))} კგ`,
    distractors: (ctx) => nearMisses(parseInt(String(ctx.answer), 10), 3, 100, 1).map(n => `${n} კგ`),
    explanation: ({ vars, answer }) => `მეორე საწყობშია: ${vars.a} + ${vars.d} = ${Number(vars.a) + Number(vars.d)} კგ. ერთად არის: ${vars.a} + ${Number(vars.a) + Number(vars.d)} = ${answer}.`,
  }),

  // g4-u07-66 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u07-66', subtopicId: 'u07-determine-compare', difficulty: 3 }),
    prompt: 'ერთმა ავტობუსმა {a} კილომეტრი გაიარა, მეორემ კი — ამ მანძილის ნახევარი. რამდენია გავლილი მანძილების ჯამი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["360", "420", "280", "340", "480", "320", "440", "260", "380", "400", "300", "460"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec))] },
    },
    answer: (v) => `${Number(v.a) + Number(v.a) / 2} კმ`,
    distractors: (ctx) => nearMisses(parseInt(String(ctx.answer), 10), 3, 20, 1).map(n => `${n} კმ`),
    explanation: ({ vars, answer }) => `მეორე ავტობუსმა გაიარა: ${vars.a} ÷ 2 = ${Number(vars.a) / 2} კმ. ჯამური მანძილია: ${vars.a} + ${Number(vars.a) / 2} = ${answer}.`,
  }),

  // g4-u07-67 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-67', subtopicId: 'u07-order-of-operations', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b} × {c}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|4|3", "12|5|4", "15|3|6", "9|6|3", "14|4|5", "7|7|2", "11|3|8", "16|4|4", "10|5|5", "13|6|2", "18|2|9", "6|8|3"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.a) + Number(v.b) * Number(v.c),
    distractors: (ctx) => {
      const ans = Number(ctx.answer);
      const wrong = (Number(ctx.vars.a) + Number(ctx.vars.b)) * Number(ctx.vars.c);
      return [wrong !== ans ? wrong : ans + 5, ans + 2, ans - 2];
    },
    explanation: ({ vars, answer }) => `პირველად სრულდება გამრავლება: ${vars.b} × ${vars.c} = ${Number(vars.b) * Number(vars.c)}, შემდეგ შეკრება: ${vars.a} + ${Number(vars.b) * Number(vars.c)} = ${answer}.`,
  }),

  // g4-u07-68 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u07-68', subtopicId: 'u07-order-of-operations', difficulty: 1 }),
    prompt: 'გამოთვალე: ({a} + {b}) × {c}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|4|3", "5|3|4", "7|5|3", "6|4|5", "9|3|2", "4|6|4", "7|3|6", "5|4|5", "8|2|7", "6|5|3", "7|4|4", "9|2|5"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => (Number(v.a) + Number(v.b)) * Number(v.c),
    distractors: (ctx) => {
      const ans = Number(ctx.answer);
      const wrong = Number(ctx.vars.a) + Number(ctx.vars.b) * Number(ctx.vars.c);
      return [wrong !== ans ? wrong : ans + 5, ans + 3, ans - 3];
    },
    explanation: ({ vars, answer }) => `ჯერ სრულდება მოქმედება ფრჩხილებში: ${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, შემდეგ გამრავლება: ${Number(vars.a) + Number(vars.b)} × ${vars.c} = ${answer}.`,
  }),

  // g4-u07-69 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-69', subtopicId: 'u07-order-of-operations', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} ÷ {b} + {c}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["36|6|7", "48|8|9", "42|7|8", "54|9|6", "35|5|11", "40|8|12", "63|7|5", "56|8|7", "72|9|4", "45|5|8", "32|4|13", "49|7|9"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.a) / Number(v.b) + Number(v.c),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ჯერ სრულდება გაყოფა: ${vars.a} ÷ ${vars.b} = ${Number(vars.a) / Number(vars.b)}, შემდეგ შეკრება: ${Number(vars.a) / Number(vars.b)} + ${vars.c} = ${answer}.`,
  }),

  // g4-u07-70 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-70', subtopicId: 'u07-order-of-operations', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} − {b} ÷ {c}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["20|12|3", "25|16|4", "30|18|6", "24|15|5", "28|20|4", "35|24|6", "22|14|7", "26|21|7", "32|24|8", "27|18|9", "23|12|4", "29|16|8"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.a) - Number(v.b) / Number(v.c),
    distractors: (ctx) => {
      const ans = Number(ctx.answer);
      const wrong = Math.floor((Number(ctx.vars.a) - Number(ctx.vars.b)) / Number(ctx.vars.c));
      return [wrong !== ans ? wrong : ans + 4, ans + 2, ans - 2];
    },
    explanation: ({ vars, answer }) => `ჯერ სრულდება გაყოფა: ${vars.b} ÷ ${vars.c} = ${Number(vars.b) / Number(vars.c)}, შემდეგ გამოკლება: ${vars.a} − ${Number(vars.b) / Number(vars.c)} = ${answer}.`,
  }),

  // g4-u07-71 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u07-71', subtopicId: 'u07-order-of-operations', difficulty: 2 }),
    prompt: 'გამოთვალე: ({a} − {b}) × {c}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["15|7|4", "18|9|3", "16|8|5", "20|11|4", "17|9|6", "14|6|5", "19|12|3", "22|13|4", "13|5|7", "21|14|5", "18|10|6", "15|8|4"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => (Number(v.a) - Number(v.b)) * Number(v.c),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 4, 1),
    explanation: ({ vars, answer }) => `ჯერ სრულდება მოქმედება ფრჩხილებში: ${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}, შემდეგ გამრავლება: ${Number(vars.a) - Number(vars.b)} × ${vars.c} = ${answer}.`,
  }),

  // g4-u07-72 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u07-72', subtopicId: 'u07-order-of-operations', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} ÷ {b} × {c}',
    variables: {
      spec: {
        kind: 'choice',
        values: ["48|8|3", "36|6|4", "42|7|5", "54|9|3", "40|5|4", "56|8|2", "63|7|4", "72|9|3", "45|5|6", "32|4|5", "49|7|3", "64|8|4"],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => (Number(v.a) / Number(v.b)) * Number(v.c),
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 1),
    explanation: ({ vars, answer }) => `მოქმედებები სრულდება მარცხნიდან მარჯვნივ: ჯერ გაყოფა ${vars.a} ÷ ${vars.b} = ${Number(vars.a) / Number(vars.b)}, შემდეგ გამრავლება: ${Number(vars.a) / Number(vars.b)} × ${vars.c} = ${answer}.`,
  }),

];
