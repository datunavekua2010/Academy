import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

const addr = (base: {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
}) => ({
  grade: 3 as const,
  topicId: 'g3-dro-kalendari',
  unitId: 'g3-dro-kalendari',
  ...base,
});

export const G3_U13_SUBTOPICS = [
  'u13-time-sequences-comparisons',
  'u13-time-number-lines',
  'u13-calendar-unit-relations',
  'u13-elapsed-time-problems',
] as const;

export const nearMisses = (
  target: number,
  count = 3,
  step = 1,
  minVal = 0,
): number[] => {
  const result = new Set<number>();
  for (const delta of [step, -step, step * 2, -step * 2, step * 3, -step * 3, step * 4, -step * 4]) {
    const val = target + delta;
    if (val >= minVal && val !== target) {
      result.add(val);
      if (result.size >= count) break;
    }
  }
  let fallback = minVal;
  while (result.size < count) {
    if (fallback !== target) result.add(fallback);
    fallback += step;
  }
  return Array.from(result).slice(0, count);
};

export const G3_U13_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // SUBTOPIC 1: u13-time-sequences-comparisons (დროის მიმდევრობა და შედარება)
  // =========================================================================

  // Q01 — საათების წუთებში გადაყვანა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u13-01', subtopicId: 'u13-time-sequences-comparisons', difficulty: 1 }),
    prompt: 'რამდენი წუთია {h} საათში?',
    variables: {
      h: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => Number(v.h) * 60,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 30, 60),
    explanation: ({ vars, answer }) =>
      `1 საათი = 60 წუთი. ${vars.h} × 60 = ${answer} წუთი.`,
  }),

  // Q02 — წუთების წამებში გადაყვანა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u13-02', subtopicId: 'u13-time-sequences-comparisons', difficulty: 1 }),
    prompt: 'რამდენი წამია {m} წუთში?',
    variables: {
      m: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => Number(v.m) * 60,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 30, 60),
    explanation: ({ vars, answer }) =>
      `1 წუთი = 60 წამი. ${vars.m} × 60 = ${answer} წამი.`,
  }),

  // Q03 — საათი და წუთი ერთად წუთებში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u13-03', subtopicId: 'u13-time-sequences-comparisons', difficulty: 2 }),
    prompt: 'რამდენი წუთია {h} საათსა და {m} წუთში?',
    variables: {
      h: { kind: 'choice', values: [1, 2, 3, 4] },
      m: { kind: 'choice', values: [10, 15, 20, 25, 30, 35, 40, 45, 50] },
    },
    answer: (v: Vars) => Number(v.h) * 60 + Number(v.m),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 60),
    explanation: ({ vars, answer }) =>
      `${vars.h} სთ = ${Number(vars.h) * 60} წთ. ${Number(vars.h) * 60} + ${vars.m} = ${answer} წუთი.`,
  }),

  // Q04 — საათებისა და წუთების შედარება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u13-04', subtopicId: 'u13-time-sequences-comparisons', difficulty: 2 }),
    prompt: 'შეადარე ერთმანეთს: {h} საათი და {m} წუთი. რომელია მეტი?',
    variables: {
      h: { kind: 'choice', values: [2, 3, 4, 5] },
      diff: { kind: 'choice', values: [-25, -15, -10, 10, 15, 25] },
      m: { kind: 'choice', values: (v: Vars) => [Number(v.h) * 60 + Number(v.diff)] },
    },
    answer: (v: Vars) => {
      const hMin = Number(v.h) * 60;
      const mMin = Number(v.m);
      if (hMin > mMin) return `${v.h} საათი`;
      if (hMin < mMin) return `${v.m} წუთი`;
      return 'ტოლია';
    },
    format: { kind: 'text' },
    options: (v: Vars) => [`${v.h} საათი`, `${v.m} წუთი`, 'ტოლია', 'შეუძლებელია დადგენა'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.h} საათი = ${Number(vars.h) * 60} წუთი. შევადაროთ ${Number(vars.h) * 60} წთ და ${vars.m} წთ. მეტია: ${answer}.`,
  }),

  // Q05 — წუთების დაშლა საათებად და დარჩენილ წუთებად (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u13-05', subtopicId: 'u13-time-sequences-comparisons', difficulty: 3 }),
    prompt: '{child}-მ ივარჯიშა {totalMin} წუთი. ეს არის {h} საათი და კიდევ რამდენი წუთი?',
    variables: {
      child: { kind: 'choice', values: ['ნიკამ', 'ანამ', 'ლუკამ', 'გიორგიმ', 'მარიამმა', 'სანდრომ'] },
      h: { kind: 'choice', values: [1, 2, 3] },
      remMin: { kind: 'choice', values: [12, 18, 25, 35, 42, 48, 55] },
      totalMin: { kind: 'choice', values: (v: Vars) => [Number(v.h) * 60 + Number(v.remMin)] },
    },
    answer: (v: Vars) => Number(v.remMin),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 1),
    explanation: ({ vars, answer }) =>
      `${vars.h} საათი = ${Number(vars.h) * 60} წუთი. ${vars.totalMin} − ${Number(vars.h) * 60} = ${answer} წუთი.`,
  }),

  // Q06 — დროის მონაკვეთების შედარება და ყველაზე სწრაფის პოვნა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u13-06', subtopicId: 'u13-time-sequences-comparisons', difficulty: 3 }),
    prompt: '{c1}-მა დავალება შეასრულა {t1} წუთში, {c2}-მ — {h2} საათსა და {m2} წუთში, ხოლო {c3}-მ — {t3} წუთში. ვინ შეასრულა დავალება ყველაზე სწრაფად (ყველაზე ნაკლებ დროში)?',
    variables: {
      names: {
        kind: 'choice',
        values: [
          'ანი_ლუკა_გიორგი',
          'მარიამი_სანდრო_ნიკო',
          'ელენე_დავითი_თემო',
          'ნინო_ირაკლი_ზურა',
          'სალომე_ოთარი_ლაშა',
        ],
      },
      c1: { kind: 'choice', values: (v: Vars) => [String(v.names).split('_')[0]] },
      c2: { kind: 'choice', values: (v: Vars) => [String(v.names).split('_')[1]] },
      c3: { kind: 'choice', values: (v: Vars) => [String(v.names).split('_')[2]] },
      scenario: { kind: 'choice', values: [1, 2, 3] },
      t1: {
        kind: 'choice',
        values: (v: Vars) => {
          const s = Number(v.scenario);
          if (s === 1) return [45];
          if (s === 2) return [80];
          return [95];
        },
      },
      h2: { kind: 'choice', values: () => [1] },
      m2: {
        kind: 'choice',
        values: (v: Vars) => {
          const s = Number(v.scenario);
          if (s === 1) return [10]; // 70 min
          if (s === 2) return [5];  // 65 min
          return [40]; // 100 min
        },
      },
      t3: {
        kind: 'choice',
        values: (v: Vars) => {
          const s = Number(v.scenario);
          if (s === 1) return [75];
          if (s === 2) return [85];
          return [50];
        },
      },
    },
    answer: (v: Vars) => {
      const d1 = Number(v.t1);
      const d2 = Number(v.h2) * 60 + Number(v.m2);
      const d3 = Number(v.t3);
      const minD = Math.min(d1, d2, d3);
      if (minD === d1) return String(v.c1);
      if (minD === d2) return String(v.c2);
      return String(v.c3);
    },
    format: { kind: 'text' },
    options: (v: Vars) => [String(v.c1), String(v.c2), String(v.c3), 'ყველამ ერთსა და იმავე დროს'],
    optionCount: 4,
    explanation: ({ vars, answer }) => {
      const d1 = Number(vars.t1);
      const d2 = Number(vars.h2) * 60 + Number(vars.m2);
      const d3 = Number(vars.t3);
      return `${vars.c1}: ${d1} წთ, ${vars.c2}: ${d2} წთ, ${vars.c3}: ${d3} წთ. ყველაზე ნაკლები დრო დასჭირდა: ${answer}.`;
    },
  }),

  // =========================================================================
  // SUBTOPIC 2: u13-time-number-lines (დრო რიცხვით ღერძზე)
  // =========================================================================

  // Q07 — გადაადგილება დროის ღერძზე საათებით (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u13-07', subtopicId: 'u13-time-number-lines', difficulty: 1 }),
    prompt: 'დროის ღერძზე საწყისი წერტილია {start}:00. ყოველი დანაყოფი შეესაბამება {step} საათს. რა დრო იქნება {steps} დანაყოფით წინ (ჩაწერე საათი)?',
    variables: {
      start: { kind: 'choice', values: [8, 9, 10, 11, 12] },
      step: { kind: 'choice', values: [1, 2] },
      steps: { kind: 'choice', values: [2, 3, 4] },
    },
    answer: (v: Vars) => Number(v.start) + Number(v.step) * Number(v.steps),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.start} + (${vars.step} × ${vars.steps}) = ${vars.start} + ${Number(vars.step) * Number(vars.steps)} = ${answer}:00.`,
  }),

  // Q08 — დანაყოფის სიდიდის გამოთვლა დროის ღერძზე (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u13-08', subtopicId: 'u13-time-number-lines', difficulty: 1 }),
    prompt: 'დროის ღერძზე {start}:00-დან {end}:00-მდე მონაკვეთი დაყოფილია {parts} ტოლ ნაწილად. რამდენ საათს შეესაბამება თითოეული დანაყოფი?',
    variables: {
      parts: { kind: 'choice', values: [2, 3, 4, 5] },
      step: { kind: 'choice', values: [1, 2] },
      start: { kind: 'choice', values: [8, 9, 10, 11] },
      end: { kind: 'choice', values: (v: Vars) => [Number(v.start) + Number(v.parts) * Number(v.step)] },
    },
    answer: (v: Vars) => Number(v.step),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.end} − ${vars.start} = ${Number(vars.end) - Number(vars.start)} საათი. ${Number(vars.end) - Number(vars.start)} ÷ ${vars.parts} = ${answer} საათი.`,
  }),

  // Q09 — 1-საათიანი მონაკვეთის დაყოფა წუთებში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u13-09', subtopicId: 'u13-time-number-lines', difficulty: 2 }),
    prompt: 'დროის ღერძზე {start}:00-დან {end}:00-მდე 1-საათიანი მონაკვეთი დაყოფილია {n} ტოლ ნაწილად. რამდენ წუთს შეესაბამება ერთი დანაყოფი?',
    variables: {
      start: { kind: 'choice', values: [9, 10, 11, 12, 13, 14, 15] },
      end: { kind: 'choice', values: (v: Vars) => [Number(v.start) + 1] },
      n: { kind: 'choice', values: [2, 3, 4, 5, 6, 10, 12] },
    },
    answer: (v: Vars) => 60 / Number(v.n),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 2),
    explanation: ({ vars, answer }) =>
      `1 საათი = 60 წუთი. 60 ÷ ${vars.n} = ${answer} წუთი.`,
  }),

  // Q10 — შუა წერტილის დრო ღერძზე (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u13-10', subtopicId: 'u13-time-number-lines', difficulty: 2 }),
    prompt: 'დროის ღერძზე წერტილი A შეესაბამება {start}:00-ს, ხოლო წერტილი B — {end}:00-ს. რომელი დრო შეესაბამება მათ ზუსტად შუა წერტილს C-ს?',
    variables: {
      start: { kind: 'choice', values: [8, 9, 10, 11, 12, 13, 14] },
      diff: { kind: 'choice', values: [2, 4, 6] },
      end: { kind: 'choice', values: (v: Vars) => [Number(v.start) + Number(v.diff)] },
    },
    answer: (v: Vars) => {
      const mid = Number(v.start) + Number(v.diff) / 2;
      return `${mid}:00`;
    },
    format: { kind: 'text' },
    options: (v: Vars) => {
      const mid = Number(v.start) + Number(v.diff) / 2;
      return [
        `${mid}:00`,
        `${mid - 1}:00`,
        `${mid + 1}:00`,
        `${mid}:30`,
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) => {
      const diffVal = Number(vars.diff);
      return `მანძილი A-სა და B-ს შორის არის ${diffVal} საათი. ნახევარია ${diffVal / 2} საათი. ${vars.start}:00 + ${diffVal / 2} სთ = ${answer}.`;
    },
  }),

  // Q11 — მგზავრობის ხანგრძლივობა ღერძზე წუთებში (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u13-11', subtopicId: 'u13-time-number-lines', difficulty: 3 }),
    prompt: 'დროის ღერძზე მატარებელი გავიდა {h1}:{m1}-ზე და ჩავიდა {h2}:{m2}-ზე. სულ რამდენი წუთი გაგრძელდა მგზავრობა?',
    variables: {
      h1: { kind: 'choice', values: [10, 11, 12, 13] },
      m1: { kind: 'choice', values: [15, 30, 45] },
      durH: { kind: 'choice', values: [1, 2] },
      durM: { kind: 'choice', values: [10, 15, 20, 25] },
      h2: {
        kind: 'choice',
        values: (v: Vars) => {
          const tot = Number(v.m1) + Number(v.durM);
          const addH = Math.floor(tot / 60);
          return [Number(v.h1) + Number(v.durH) + addH];
        },
      },
      m2: {
        kind: 'choice',
        values: (v: Vars) => {
          const tot = (Number(v.m1) + Number(v.durM)) % 60;
          return [tot < 10 ? `0${tot}` : `${tot}`];
        },
      },
    },
    answer: (v: Vars) => Number(v.durH) * 60 + Number(v.durM),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 30),
    explanation: ({ vars, answer }) =>
      `${vars.durH} საათი და ${vars.durM} წუთი = ${vars.durH} × 60 + ${vars.durM} = ${answer} წუთი.`,
  }),

  // Q12 — ინტერვალების შედარება ღერძზე (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u13-12', subtopicId: 'u13-time-number-lines', difficulty: 3 }),
    prompt: 'დროის ღერძზე მოვლენა A მოხდა {tA}-ზე, B — {tB}-ზე, ხოლო C — {tC}-ზე. რომელი ინტერვალია უფრო ხანგრძლივი: A-დან B-მდე თუ B-დან C-მდე?',
    variables: {
      pattern: {
        kind: 'choice',
        values: [
          '09:00_10:30_11:15', // AB = 90m, BC = 45m => AB
          '10:00_10:45_12:00', // AB = 45m, BC = 75m => BC
          '12:00_13:15_14:00', // AB = 75m, BC = 45m => AB
          '14:00_14:30_15:45', // AB = 30m, BC = 75m => BC
          '15:00_16:30_17:30', // AB = 90m, BC = 60m => AB
          '16:00_16:40_18:00', // AB = 40m, BC = 80m => BC
          '11:00_12:10_13:00', // AB = 70m, BC = 50m => AB
          '13:00_13:30_14:40', // AB = 30m, BC = 70m => BC
          '08:00_09:20_10:00', // AB = 80m, BC = 40m => AB
          '08:30_09:00_10:15', // AB = 30m, BC = 75m => BC
          '10:30_11:50_12:30', // AB = 80m, BC = 40m => AB
          '11:30_12:00_13:15', // AB = 30m, BC = 75m => BC
          '13:30_15:00_15:45', // AB = 90m, BC = 45m => AB
          '14:30_15:10_16:30', // AB = 40m, BC = 80m => BC
          '17:00_18:25_19:10', // AB = 85m, BC = 45m => AB
          '17:30_18:00_19:20', // AB = 30m, BC = 80m => BC
        ],
      },
      tA: { kind: 'choice', values: (v: Vars) => [String(v.pattern).split('_')[0]] },
      tB: { kind: 'choice', values: (v: Vars) => [String(v.pattern).split('_')[1]] },
      tC: { kind: 'choice', values: (v: Vars) => [String(v.pattern).split('_')[2]] },
    },
    answer: (v: Vars) => {
      const p = String(v.pattern).split('_');
      const [hA, mA] = p[0].split(':').map(Number);
      const [hB, mB] = p[1].split(':').map(Number);
      const [hC, mC] = p[2].split(':').map(Number);
      const ab = (hB * 60 + mB) - (hA * 60 + mA);
      const bc = (hC * 60 + mC) - (hB * 60 + mB);
      if (ab > bc) return 'A-დან B-მდე';
      if (bc > ab) return 'B-დან C-მდე';
      return 'ორივე თანაბარია';
    },
    format: { kind: 'text' },
    options: () => ['A-დან B-მდე', 'B-დან C-მდე', 'ორივე თანაბარია', 'შეუძლებელია დადგენა'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.tA}-დან ${vars.tB}-მდე და ${vars.tB}-დან ${vars.tC}-მდე ინტერვალების შედარებით უფრო ხანგრძლივია ${answer}.`,
  }),

  // =========================================================================
  // SUBTOPIC 3: u13-calendar-unit-relations (კალენდარი და ერთეულთა კავშირი)
  // =========================================================================

  // Q13 — კვირების დღეებში გადაყვანა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u13-13', subtopicId: 'u13-calendar-unit-relations', difficulty: 1 }),
    prompt: 'რამდენი დღეა {weeks} კვირაში?',
    variables: {
      weeks: { kind: 'int', min: 2, max: 16 },
    },
    answer: (v: Vars) => Number(v.weeks) * 7,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 7, 7),
    explanation: ({ vars, answer }) =>
      `1 კვირა = 7 დღე. ${vars.weeks} × 7 = ${answer} დღე.`,
  }),

  // Q14 — წლების თვეებში გადაყვანა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u13-14', subtopicId: 'u13-calendar-unit-relations', difficulty: 1 }),
    prompt: 'რამდენი თვეა {years} წელიწადში?',
    variables: {
      years: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => Number(v.years) * 12,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 12, 12),
    explanation: ({ vars, answer }) =>
      `1 წელიწადი = 12 თვე. ${vars.years} × 12 = ${answer} თვე.`,
  }),

  // Q15 — კვირები და დღეები ერთად (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u13-15', subtopicId: 'u13-calendar-unit-relations', difficulty: 2 }),
    prompt: 'საზაფხულო ბანაკი გაგრძელდა {weeks} კვირა და {days} დღე. სულ რამდენი დღე გაგრძელდა ბანაკი?',
    variables: {
      weeks: { kind: 'choice', values: [2, 3, 4, 5, 6] },
      days: { kind: 'choice', values: [1, 2, 3, 4, 5, 6] },
    },
    answer: (v: Vars) => Number(v.weeks) * 7 + Number(v.days),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 7),
    explanation: ({ vars, answer }) =>
      `${vars.weeks} კვირა = ${Number(vars.weeks) * 7} დღე. ${Number(vars.weeks) * 7} + ${vars.days} = ${answer} დღე.`,
  }),

  // Q16 — თვეში დღეების რაოდენობა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u13-16', subtopicId: 'u13-calendar-unit-relations', difficulty: 2 }),
    prompt: '{prefix} ჩამოთვლილი თვეებიდან რომელშია ზუსტად {targetDays} დღე?',
    variables: {
      prefix: { kind: 'choice', values: ['კალენდარში', 'წლის განმავლობაში'] },
      type: { kind: 'choice', values: ['30_days', '31_days'] },
      targetDays: { kind: 'choice', values: (v: Vars) => [v.type === '30_days' ? 30 : 31] },
      correctMonth: {
        kind: 'choice',
        values: (v: Vars) =>
          v.type === '30_days'
            ? ['აპრილი', 'ივნისი', 'სექტემბერი', 'ნოემბერი']
            : ['იანვარი', 'მარტი', 'მაისი', 'ივლისი', 'აგვისტო', 'ოქტომბერი', 'დეკემბერი'],
      },
    },
    answer: (v: Vars) => String(v.correctMonth),
    format: { kind: 'text' },
    options: (v: Vars) => {
      const correct = String(v.correctMonth);
      if (v.type === '30_days') {
        const distractors = ['იანვარი', 'მარტი', 'მაისი', 'აგვისტო'];
        return [correct, ...distractors.slice(0, 3)];
      } else {
        const distractors = ['აპრილი', 'ივნისი', 'სექტემბერი', 'თებერვალი'];
        return [correct, ...distractors.slice(0, 3)];
      }
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${answer} არის თვე, რომელშიც ზუსტად ${vars.targetDays} დღეა.`,
  }),

  // Q17 — კალენდარში კვირის დღის გამოთვლა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u13-17', subtopicId: 'u13-calendar-unit-relations', difficulty: 3 }),
    prompt: 'თუ {month}-ის {d1} რიცხვი არის {day1}, კვირის რა დღე იქნება ამავე თვის {d2} რიცხვი?',
    variables: {
      month: { kind: 'choice', values: ['მაისის', 'ივნისის', 'ოქტომბრის', 'ნოემბრის'] },
      d1: { kind: 'choice', values: [3, 4, 5, 6] },
      day1Index: { kind: 'choice', values: [0, 1, 2, 3, 4, 5, 6] },
      day1: {
        kind: 'choice',
        values: (v: Vars) => {
          const days = ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი', 'კვირა'];
          return [days[Number(v.day1Index)]];
        },
      },
      offset: { kind: 'choice', values: [7, 8, 9, 14] },
      d2: { kind: 'choice', values: (v: Vars) => [Number(v.d1) + Number(v.offset)] },
    },
    answer: (v: Vars) => {
      const days = ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი', 'კვირა'];
      const targetIndex = (Number(v.day1Index) + (Number(v.offset) % 7)) % 7;
      return days[targetIndex];
    },
    format: { kind: 'text' },
    options: (v: Vars) => {
      const days = ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი', 'კვირა'];
      const targetIndex = (Number(v.day1Index) + (Number(v.offset) % 7)) % 7;
      const ans = days[targetIndex];
      const other = days.filter((d) => d !== ans);
      return [ans, other[0], other[1], other[2]];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.d2} − ${vars.d1} = ${vars.offset} დღე. ყოველი 7 დღის შემდეგ კვირის დღე მეორდება, ამიტომ ${vars.d2} რიცხვი იქნება ${answer}.`,
  }),

  // Q18 — კალენდარული პერიოდის ხანგრძლივობა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u13-18', subtopicId: 'u13-calendar-unit-relations', difficulty: 3 }),
    prompt: '{child}-მ წიგნის კითხვა დაიწყო {month}-ის {d1} რიცხვში და დაასრულა ამავე თვის {d2} რიცხვში (ორივე დღის ჩათვლით). სულ რამდენი დღე კითხულობდა ის წიგნს?',
    variables: {
      child: { kind: 'choice', values: ['თამარმა', 'ნიკამ', 'ანამ', 'ლუკამ', 'სალომემ'] },
      month: { kind: 'choice', values: ['მაისის', 'ივნისის', 'ივლისის', 'აგვისტოს', 'ოქტომბრის'] },
      d1: { kind: 'choice', values: [2, 4, 6, 8, 10] },
      dur: { kind: 'choice', values: [7, 9, 11, 13, 15, 17] },
      d2: { kind: 'choice', values: (v: Vars) => [Number(v.d1) + Number(v.dur) - 1] },
    },
    answer: (v: Vars) => Number(v.dur),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `ორივე დღის ჩათვლით: ${vars.d2} − ${vars.d1} + 1 = ${answer} დღე.`,
  }),

  // =========================================================================
  // SUBTOPIC 4: u13-elapsed-time-problems (გასული დროის ამოცანები)
  // =========================================================================

  // Q19 — ხანგრძლივობა სრულ საათებში (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u13-19', subtopicId: 'u13-elapsed-time-problems', difficulty: 1 }),
    prompt: 'საფეხბურთო ვარჯიში დაიწყო {start}:00-ზე და დასრულდა {end}:00-ზე. რამდენი საათი გაგრძელდა ვარჯიში?',
    variables: {
      start: { kind: 'int', min: 10, max: 15 },
      dur: { kind: 'int', min: 1, max: 4 },
      end: { kind: 'choice', values: (v: Vars) => [Number(v.start) + Number(v.dur)] },
    },
    answer: (v: Vars) => Number(v.dur),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.end} − ${vars.start} = ${answer} საათი.`,
  }),

  // Q20 — ხანგრძლივობა წუთებში იმავე საათში (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u13-20', subtopicId: 'u13-elapsed-time-problems', difficulty: 1 }),
    prompt: '{child}-მ ხატვა დაიწყო {h}:{m1}-ზე და დაასრულა {h}:{m2}-ზე. რამდენი წუთი ხატავდა {child}?',
    variables: {
      child: { kind: 'choice', values: ['ანი', 'მარიამი', 'ელენე', 'ნიკა', 'სანდრო'] },
      h: { kind: 'choice', values: [14, 15, 16, 17, 18] },
      m1: { kind: 'choice', values: ['05', '10', '15', '20'] },
      diff: { kind: 'choice', values: [20, 25, 30, 35, 40] },
      m2: {
        kind: 'choice',
        values: (v: Vars) => {
          const tot = Number(v.m1) + Number(v.diff);
          return [tot < 10 ? `0${tot}` : `${tot}`];
        },
      },
    },
    answer: (v: Vars) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 5),
    explanation: ({ vars, answer }) =>
      `${vars.m2} − ${vars.m1} = ${answer} წუთი.`,
  }),

  // Q21 — დასრულების დროის გამოთვლა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u13-21', subtopicId: 'u13-elapsed-time-problems', difficulty: 2 }),
    prompt: 'სპექტაკლი დაიწყო {h1}:{m1}-ზე და გაგრძელდა {durH} საათი და {durM} წუთი. რომელ საათზე დასრულდა სპექტაკლი?',
    variables: {
      h1: { kind: 'choice', values: [14, 15, 16, 17, 18] },
      m1: { kind: 'choice', values: ['00', '15', '30'] },
      durH: { kind: 'choice', values: [1, 2] },
      durM: { kind: 'choice', values: [15, 20, 30, 45] },
    },
    answer: (v: Vars) => {
      const totMin = Number(v.h1) * 60 + Number(v.m1) + Number(v.durH) * 60 + Number(v.durM);
      const endH = Math.floor(totMin / 60);
      const endM = totMin % 60;
      return `${endH}:${endM < 10 ? '0' : ''}${endM}`;
    },
    format: { kind: 'text' },
    options: (v: Vars) => {
      const totMin = Number(v.h1) * 60 + Number(v.m1) + Number(v.durH) * 60 + Number(v.durM);
      const endH = Math.floor(totMin / 60);
      const endM = totMin % 60;
      const correct = `${endH}:${endM < 10 ? '0' : ''}${endM}`;
      const o1 = `${endH + 1}:${endM < 10 ? '0' : ''}${endM}`;
      const o2 = `${endH}:${(endM + 15) % 60 < 10 ? '0' : ''}${(endM + 15) % 60}`;
      const o3 = `${endH - 1}:${endM < 10 ? '0' : ''}${endM}`;
      return [correct, o1, o2, o3];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.h1}:${vars.m1} + ${vars.durH} სთ ${vars.durM} წთ = ${answer}.`,
  }),

  // Q22 — დაწყების დროის გამოთვლა უკუსვლით (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u13-22', subtopicId: 'u13-elapsed-time-problems', difficulty: 2 }),
    prompt: 'ავტობუსი ჩავიდა დანიშნულების ადგილზე {h2}:{m2}-ზე. მგზავრობა გაგრძელდა {durMin} წუთი. რომელ საათზე გავიდა ავტობუსი?',
    variables: {
      h2: { kind: 'choice', values: [12, 13, 14, 15, 16, 17] },
      m2: { kind: 'choice', values: ['30', '40', '45', '50'] },
      durMin: { kind: 'choice', values: [20, 25, 30, 40] },
    },
    answer: (v: Vars) => {
      const totMin = Number(v.h2) * 60 + Number(v.m2) - Number(v.durMin);
      const startH = Math.floor(totMin / 60);
      const startM = totMin % 60;
      return `${startH}:${startM < 10 ? '0' : ''}${startM}`;
    },
    format: { kind: 'text' },
    options: (v: Vars) => {
      const totMin = Number(v.h2) * 60 + Number(v.m2) - Number(v.durMin);
      const startH = Math.floor(totMin / 60);
      const startM = totMin % 60;
      const correct = `${startH}:${startM < 10 ? '0' : ''}${startM}`;
      const o1 = `${startH}:${(startM + 10) % 60 < 10 ? '0' : ''}${(startM + 10) % 60}`;
      const o2 = `${startH - 1}:${startM < 10 ? '0' : ''}${startM}`;
      const o3 = `${startH + 1}:${startM < 10 ? '0' : ''}${startM}`;
      return [correct, o1, o2, o3];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.h2}:${vars.m2} − ${vars.durMin} წუთი = ${answer}.`,
  }),

  // Q23 — სამი აქტივობის ჯამური დრო (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u13-23', subtopicId: 'u13-elapsed-time-problems', difficulty: 3 }),
    prompt: '{child}-მ {t1} წუთი დაუთმო მათემატიკის მომზადებას, {t2} წუთი — კითხვას, ხოლო შემდეგ {t3} წუთი დაისვენა. სულ რამდენი წუთი გავიდა?',
    variables: {
      child: { kind: 'choice', values: ['ლუკამ', 'ნიკამ', 'ანამ', 'გიორგიმ', 'თამარმა', 'სანდრომ'] },
      t1: { kind: 'choice', values: [20, 25, 30, 35, 40] },
      t2: { kind: 'choice', values: [15, 20, 25, 30] },
      t3: { kind: 'choice', values: [10, 15, 20] },
    },
    answer: (v: Vars) => Number(v.t1) + Number(v.t2) + Number(v.t3),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 20),
    explanation: ({ vars, answer }) =>
      `${vars.t1} + ${vars.t2} + ${vars.t3} = ${answer} წუთი.`,
  }),

  // Q24 — ვინ დახარჯა მეტი დრო და რამდენით მეტი (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u13-24', subtopicId: 'u13-elapsed-time-problems', difficulty: 3 }),
    prompt: '{c1}-მა ივარჯიშა {h1} საათი და {m1} წუთი, ხოლო {c2}-მ — {tot2} წუთი. ვინ დაუთმო ვარჯიშს მეტი დრო და რამდენით მეტი?',
    variables: {
      pair: {
        kind: 'choice',
        values: [
          'გიორგი_ლუკა',
          'ანი_მარიამი',
          'ნიკა_სანდრო',
          'თამარი_ელენე',
          'დავითი_ოთარი',
        ],
      },
      c1: { kind: 'choice', values: (v: Vars) => [String(v.pair).split('_')[0]] },
      c2: { kind: 'choice', values: (v: Vars) => [String(v.pair).split('_')[1]] },
      h1: { kind: 'choice', values: [1, 2] },
      m1: { kind: 'choice', values: [10, 20, 30] },
      diff: { kind: 'choice', values: [15, 20, 25] },
      more: { kind: 'choice', values: ['c1', 'c2'] },
      tot2: {
        kind: 'choice',
        values: (v: Vars) => {
          const tot1 = Number(v.h1) * 60 + Number(v.m1);
          return [v.more === 'c1' ? tot1 - Number(v.diff) : tot1 + Number(v.diff)];
        },
      },
    },
    answer: (v: Vars) => {
      const winner = v.more === 'c1' ? v.c1 : v.c2;
      return `${winner}-მ, ${v.diff} წუთით მეტი`;
    },
    format: { kind: 'text' },
    options: (v: Vars) => {
      const winner = v.more === 'c1' ? v.c1 : v.c2;
      const loser = v.more === 'c1' ? v.c2 : v.c1;
      const diffVal = Number(v.diff);
      return [
        `${winner}-მ, ${diffVal} წუთით მეტი`,
        `${loser}-მ, ${diffVal} წუთით მეტი`,
        `${winner}-მ, ${diffVal + 10} წუთით მეტი`,
        'ორივემ თანაბარი დრო დაუთმო',
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) => {
      const tot1 = Number(vars.h1) * 60 + Number(vars.m1);
      return `${vars.c1}: ${vars.h1} სთ ${vars.m1} წთ = ${tot1} წთ. ${vars.c2}: ${vars.tot2} წთ. მეტი დრო დაუთმო: ${answer}.`;
    },
  }),
];
