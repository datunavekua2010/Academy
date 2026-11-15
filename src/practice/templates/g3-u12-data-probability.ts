import { defineTemplate, QuestionTemplate } from './types';

/**
 * Grade 3 — Unit 12: მონაცემები და ალბათობა (Data & Probability)
 *
 * Covers 6 subtopics (36 templates total: Q01–Q36, 6 per subtopic):
 *   U12.1 — მონაცემთა შეგროვება და დაჯგუფება (u12-gathering-grouping-data)
 *   U12.2 — დიაგრამები, პიქტოგრამები და წერტილოვანი დიაგრამები (u12-diagrams-pictograms-dotplots)
 *   U12.3 — ზედმეტი მონაცემები და ვენის დიაგრამები (u12-venn-diagrams-redundant-data)
 *   U12.4 — მონაცემთა შედარება ცხრილებში (u12-table-data-comparison)
 *   U12.5 — აუცილებელი, შესაძლებელი და შეუძლებელი ხდომილებები (u12-event-types)
 *   U12.6 — კომბინაციები და ალბათობის ცვლილება (u12-combinations-likelihood)
 */

export const G3_U12_SUBTOPICS = [
  'u12-gathering-grouping-data',
  'u12-diagrams-pictograms-dotplots',
  'u12-venn-diagrams-redundant-data',
  'u12-table-data-comparison',
  'u12-event-types',
  'u12-combinations-likelihood',
] as const;

export type G3U12SubtopicId = (typeof G3_U12_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G3U12SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 3 as const,
  topicId: 'g3-monacemebi-albatoba' as const,
  unitId: 'g3-monacemebi-albatoba' as const,
  ...options,
});

type Vars = Record<string, string | number>;

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
    fallback += 1;
  }
  return Array.from(result);
}

export const G3_U12_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U12.1 — მონაცემთა შეგროვება და დაჯგუფება (Q01–Q06)
  // =========================================================================

  // Q01 — ორი ჯგუფის შეკრება (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-01', subtopicId: 'u12-gathering-grouping-data', difficulty: 1 }),
    prompt: 'კლასში არის {b} ბიჭი და {g} გოგო. სულ რამდენი მოსწავლეა კლასში?',
    variables: {
      b: { kind: 'int', min: 10, max: 18 },
      g: { kind: 'int', min: 10, max: 18 },
    },
    answer: (v: Vars) => Number(v.b) + Number(v.g),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 2),
    explanation: ({ vars, answer }) =>
      `${vars.b} + ${vars.g} = ${answer} მოსწავლეა კლასში.`,
  }),

  // Q02 — ჯგუფებს შორის სხვაობა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-02', subtopicId: 'u12-gathering-grouping-data', difficulty: 1 }),
    prompt: 'კალათაში არის {a} ვაშლი და {p} მსხალი. რამდენით მეტია ვაშლი მსხალზე?',
    variables: {
      p: { kind: 'int', min: 8, max: 18 },
      diff: { kind: 'int', min: 3, max: 12 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.p) + Number(v.diff)] },
    },
    answer: (v: Vars) => Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.p} = ${answer}-ით მეტია ვაშლი.`,
  }),

  // Q03 — სამი მონაცემის შეკრება (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-03', subtopicId: 'u12-gathering-grouping-data', difficulty: 2 }),
    prompt: 'ბიბლიოთეკიდან ორშაბათს გაიტანეს {m} წიგნი, სამშაბათს — {t} წიგნი, ხოლო ოთხშაბათს — {w} წიგნი. სულ რამდენი წიგნი გაიტანეს ამ სამ დღეში?',
    variables: {
      m: { kind: 'int', min: 10, max: 25 },
      t: { kind: 'int', min: 10, max: 25 },
      w: { kind: 'int', min: 10, max: 25 },
    },
    answer: (v: Vars) => Number(v.m) + Number(v.t) + Number(v.w),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) =>
      `${vars.m} + ${vars.t} + ${vars.w} = ${answer} წიგნი გაიტანეს სულ.`,
  }),

  // Q04 — ყველაზე პოპულარული კატეგორიის პოვნა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-04', subtopicId: 'u12-gathering-grouping-data', difficulty: 2 }),
    prompt: 'გამოკითხვაში ბავშვებმა აირჩიეს საყვარელი წვენი: ვაშლის — {v1}, ფორთოხლის — {v2}, ალუბლის — {v3}. რომელი წვენია ყველაზე პოპულარული?',
    variables: {
      maxType: { kind: 'choice', values: ['ვაშლის', 'ფორთოხლის', 'ალუბლის'] },
      low1: { kind: 'int', min: 8, max: 14 },
      low2: { kind: 'int', min: 15, max: 20 },
      high: { kind: 'int', min: 25, max: 35 },
      v1: { kind: 'choice', values: (v: Vars) => [v.maxType === 'ვაშლის' ? v.high : v.low1] },
      v2: { kind: 'choice', values: (v: Vars) => [v.maxType === 'ფორთოხლის' ? v.high : v.low2] },
      v3: { kind: 'choice', values: (v: Vars) => [v.maxType === 'ალუბლის' ? v.high : (v.maxType === 'ვაშლის' ? v.low2 : v.low1)] },
    },
    answer: (v: Vars) => String(v.maxType),
    format: { kind: 'text' },
    options: () => ['ვაშლის', 'ფორთოხლის', 'ალუბლის', 'ყველა თანაბარია'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `ყველაზე მეტი ხმა აქვს ${answer} წვენს, ამიტომ ის არის ყველაზე პოპულარული.`,
  }),

  // Q05 — უცნობი კატეგორია საერთო ჯამიდან (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-05', subtopicId: 'u12-gathering-grouping-data', difficulty: 3 }),
    prompt: 'სულ გამოკითხეს {total} მოსწავლე. {c1}-მა აირჩია ფეხბურთი, {c2}-მა — კალათბურთი, ხოლო დანარჩენებმა — ცურვა. რამდენმა მოსწავლემ აირჩია ცურვა?',
    variables: {
      c1: { kind: 'int', min: 12, max: 25 },
      c2: { kind: 'int', min: 12, max: 25 },
      sw: { kind: 'int', min: 8, max: 20 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.c1) + Number(v.c2) + Number(v.sw)] },
    },
    answer: (v: Vars) => Number(v.sw),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => {
      const sumKnown = Number(vars.c1) + Number(vars.c2);
      return `ფეხბურთი და კალათბურთი: ${vars.c1} + ${vars.c2} = ${sumKnown}. ცურვა: ${vars.total} − ${sumKnown} = ${answer}.`;
    },
  }),

  // Q06 — ხაზოვანი აღრიცხვის (თვლა ხუთეულებით) ინტერპრეტაცია (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-06', subtopicId: 'u12-gathering-grouping-data', difficulty: 3 }),
    prompt: 'მონაცემები ჩაწერილია ხაზოვანი აღრიცხვით: {groups} სრული ხუთეული და კიდევ {singles} ცალი ხაზი. სულ რა რიცხვს შეესაბამება ეს ჩანაწერი?',
    variables: {
      groups: { kind: 'int', min: 2, max: 8 },
      singles: { kind: 'int', min: 1, max: 4 },
    },
    answer: (v: Vars) => `${Number(v.groups) * 5 + Number(v.singles)}`,
    format: { kind: 'text' },
    options: (v: Vars) => {
      const correct = Number(v.groups) * 5 + Number(v.singles);
      return [
        `${correct}`,
        `${correct - 2}`,
        `${correct + 3}`,
        `${correct + 5}`,
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.groups} × 5 = ${Number(vars.groups) * 5}. ${Number(vars.groups) * 5} + ${vars.singles} = ${answer}.`,
  }),

  // =========================================================================
  // U12.2 — დიაგრამები, პიქტოგრამები და წერტილოვანი დიაგრამები (Q07–Q12)
  // =========================================================================

  // Q07 — პიქტოგრამის გასაღები (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-07', subtopicId: 'u12-diagrams-pictograms-dotplots', difficulty: 1 }),
    prompt: 'პიქტოგრამაზე ერთი სიმბოლო (⭐) აღნიშნავს {per} წიგნს. რამდენი წიგნია სულ {count} ასეთ სიმბოლოში?',
    variables: {
      per: { kind: 'choice', values: [2, 3, 4, 5, 10] },
      count: { kind: 'int', min: 3, max: 9 },
    },
    answer: (v: Vars) => Number(v.per) * Number(v.count),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) =>
      `${vars.count} × ${vars.per} = ${answer} წიგნი.`,
  }),

  // Q08 — პიქტოგრამაზე სიმბოლოების რაოდენობა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-08', subtopicId: 'u12-diagrams-pictograms-dotplots', difficulty: 1 }),
    prompt: 'პიქტოგრამაზე თითო სიმბოლო აღნიშნავს {per} ხეს. სულ დაირგო {total} ხე. რამდენი სიმბოლო უნდა დაიხატოს პიქტოგრამაზე?',
    variables: {
      per: { kind: 'choice', values: [2, 3, 4, 5, 10] },
      icons: { kind: 'int', min: 3, max: 9 },
      total: { kind: 'choice', values: (v: Vars) => [Number(v.per) * Number(v.icons)] },
    },
    answer: (v: Vars) => Number(v.icons),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.per} = ${answer} სიმბოლო.`,
  }),

  // Q09 — სვეტოვანი დიაგრამის სხვაობა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-09', subtopicId: 'u12-diagrams-pictograms-dotplots', difficulty: 2 }),
    prompt: 'სვეტოვან დიაგრამაზე სპორტსმენ A-ს სვეტის სიმაღლეა {h1} ქულა, ხოლო სპორტსმენ B-ს სვეტის — {h2} ქულა. რამდენით მეტი ქულა აქვს A-ს, ვიდრე B-ს?',
    variables: {
      h2: { kind: 'int', min: 15, max: 35 },
      diff: { kind: 'int', min: 5, max: 20 },
      h1: { kind: 'choice', values: (v: Vars) => [Number(v.h2) + Number(v.diff)] },
    },
    answer: (v: Vars) => Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.h1} − ${vars.h2} = ${answer} ქულით მეტი.`,
  }),

  // Q10 — წერტილოვანი დიაგრამის წაკითხვა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-10', subtopicId: 'u12-diagrams-pictograms-dotplots', difficulty: 2 }),
    prompt: 'წერტილოვან დიაგრამაზე რიცხვ {val}-ის თავზე დასმულია {dots} წერტილი. თითო წერტილი 1 მოსწავლეს აღნიშნავს. რამდენმა მოსწავლემ მიიღო შეფასება {val}?',
    variables: {
      val: { kind: 'choice', values: [7, 8, 9, 10] },
      dots: { kind: 'int', min: 3, max: 14 },
    },
    answer: (v: Vars) => Number(v.dots),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `წერტილების რაოდენობაა ${vars.dots}, ამიტომ პასუხია ${answer}.`,
  }),

  // Q11 — ნახევარი სიმბოლო პიქტოგრამაზე (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-11', subtopicId: 'u12-diagrams-pictograms-dotplots', difficulty: 3 }),
    prompt: 'პიქტოგრამაზე 1 მთლიანი სიმბოლო აღნიშნავს {per} მანქანას, ხოლო ნახევარი სიმბოლო — {half} მანქანას. რამდენ მანქანას აღნიშნავს {full} მთლიანი და 1 ნახევარი სიმბოლო ერთად?',
    variables: {
      per: { kind: 'choice', values: [10, 20, 30] },
      half: { kind: 'choice', values: (v: Vars) => [Number(v.per) / 2] },
      full: { kind: 'int', min: 2, max: 8 },
    },
    answer: (v: Vars) => Number(v.full) * Number(v.per) + Number(v.half),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) => {
      const fullCount = Number(vars.full) * Number(vars.per);
      return `${vars.full} მთლიანი: ${fullCount} მანქანა. ${fullCount} + ${vars.half} = ${answer} მანქანა.`;
    },
  }),

  // Q12 — სამი სვეტის ჯამი დიაგრამაზე (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-12', subtopicId: 'u12-diagrams-pictograms-dotplots', difficulty: 3 }),
    prompt: 'სვეტოვან დიაგრამაზე გამოსახულია ხეების რაოდენობა: მუხა — {c1}, ფიჭვი — {c2}, ნაძვი — {c3}. სულ რამდენი ხეა პარკში?',
    variables: {
      c1: { kind: 'int', min: 10, max: 30 },
      c2: { kind: 'int', min: 10, max: 30 },
      c3: { kind: 'int', min: 10, max: 30 },
    },
    answer: (v: Vars) => `${Number(v.c1) + Number(v.c2) + Number(v.c3)} ხე`,
    format: { kind: 'text' },
    options: (v: Vars) => {
      const total = Number(v.c1) + Number(v.c2) + Number(v.c3);
      return [
        `${total} ხე`,
        `${total - 5} ხე`,
        `${total + 10} ხე`,
        `${total + 15} ხე`,
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.c1} + ${vars.c2} + ${vars.c3} = ${answer}.`,
  }),

  // =========================================================================
  // U12.3 — ზედმეტი მონაცემები და ვენის დიაგრამები (Q13–Q18)
  // =========================================================================

  // Q13 — ვენის დიაგრამის გადაკვეთა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-13', subtopicId: 'u12-venn-diagrams-redundant-data', difficulty: 1 }),
    prompt: 'ვენის დიაგრამაზე ერთ წრეშია ლუწი რიცხვები, მეორეში — {div}-ის ჯერადები. ჩამოთვლილთაგან რომელი რიცხვი მოხვდება მათ გადაკვეთაში (საერთო ნაწილში)?',
    variables: {
      div: { kind: 'choice', values: [3, 5] },
      k: { kind: 'int', min: 2, max: 8 },
      correct: { kind: 'choice', values: (v: Vars) => [Number(v.k) * 2 * Number(v.div)] },
    },
    answer: (v: Vars) => String(v.correct),
    format: { kind: 'text' },
    options: (v: Vars) => {
      const c = Number(v.correct);
      return [
        String(c),
        String(c + 1),
        String(c + 3),
        String(c + 5),
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${answer} არის როგორც ლუწი, ასევე ${vars.div}-ის ჯერადი, ამიტომ მოხვდება გადაკვეთის არეში.`,
  }),

  // Q14 — ჩართვა-გამორიცხვის წესი ორ ჯგუფში (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-14', subtopicId: 'u12-venn-diagrams-redundant-data', difficulty: 1 }),
    prompt: 'კლასში {a} მოსწავლე დადის მუსიკაზე, {b} — სპორტზე, ხოლო {both} — ორივეზე. სულ რამდენი მოსწავლე დადის მუსიკაზე ან სპორტზე?',
    variables: {
      both: { kind: 'int', min: 3, max: 8 },
      a: { kind: 'int', min: 10, max: 18 },
      b: { kind: 'int', min: 10, max: 18 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b) - Number(v.both),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 2),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} − ${vars.both} = ${answer} მოსწავლე.`,
  }),

  // Q15 — მხოლოდ ერთ ჯგუფში მყოფი ელემენტები (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-15', subtopicId: 'u12-venn-diagrams-redundant-data', difficulty: 2 }),
    prompt: 'სულ {a} ბავშვი უკრავს გიტარაზე. მათგან {both} უკრავს ფორტეპიანოზეც. რამდენი ბავშვი უკრავს მხოლოდ გიტარაზე?',
    variables: {
      both: { kind: 'int', min: 3, max: 9 },
      diff: { kind: 'int', min: 5, max: 15 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.both) + Number(v.diff)] },
    },
    answer: (v: Vars) => Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.both} = ${answer} ბავშვი უკრავს მხოლოდ გიტარაზე.`,
  }),

  // Q16 — ზედმეტი მონაცემის ამოცნობა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-16', subtopicId: 'u12-venn-diagrams-redundant-data', difficulty: 2 }),
    prompt: 'ამოცანა: „{person}-მ იყიდა {count} რვეული თითო {price} ლარად. ის არის {age} წლის. რამდენი ლარი გადაიხადა რვეულებში?“ რომელი მონაცემია ზედმეტი ამოცანის ამოსახსნელად?',
    variables: {
      person: { kind: 'choice', values: ['ნიკა', 'მარიამი', 'სანდრო', 'თაკო'] },
      age: { kind: 'int', min: 8, max: 12 },
      count: { kind: 'int', min: 3, max: 6 },
      price: { kind: 'int', min: 2, max: 4 },
    },
    answer: (v: Vars) => `ასაკი (${v.age} წლის)`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `ასაკი (${v.age} წლის)`,
      `რვეულების რაოდენობა (${v.count})`,
      `თითო რვეულის ფასი (${v.price} ლარი)`,
      'არცერთი მონაცემი არაა ზედმეტი',
    ],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `თანხის გამოსათვლელად საჭიროა მხოლოდ რაოდენობა და ფასი. ${answer} ზედმეტი მონაცემია.`,
  }),

  // Q17 — ვენის დიაგრამის სამივე არის ჯამი (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-17', subtopicId: 'u12-venn-diagrams-redundant-data', difficulty: 3 }),
    prompt: 'ვენის დიაგრამაზე წრე A-ში მხოლოდ {onlyA} ელემენტია, წრე B-ში მხოლოდ {onlyB} ელემენტია, ხოლო საერთო გადაკვეთაში — {both} ელემენტი. სულ რამდენი ელემენტია გაერთიანებაში?',
    variables: {
      onlyA: { kind: 'int', min: 5, max: 15 },
      onlyB: { kind: 'int', min: 5, max: 15 },
      both: { kind: 'int', min: 2, max: 8 },
    },
    answer: (v: Vars) => Number(v.onlyA) + Number(v.onlyB) + Number(v.both),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 3),
    explanation: ({ vars, answer }) =>
      `${vars.onlyA} + ${vars.both} + ${vars.onlyB} = ${answer} ელემენტი.`,
  }),

  // Q18 — წრის გარეთ მყოფი ობიექტების მნიშვნელობა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-18', subtopicId: 'u12-venn-diagrams-redundant-data', difficulty: 3 }),
    prompt: 'ვენის დიაგრამაზე ორი წრის გარეთ დარჩენილი რიცხვები (მაგალითად, {num}) აღნიშნავს იმ ობიექტებს, რომლებიც:',
    variables: {
      num: { kind: 'choice', values: [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53] },
    },
    answer: () => 'არცერთ მოცემულ სიმრავლეს არ ეკუთვნის',
    format: { kind: 'text' },
    options: () => [
      'არცერთ მოცემულ სიმრავლეს არ ეკუთვნის',
      'ორივე სიმრავლეს ეკუთვნის ერთდროულად',
      'მხოლოდ პირველ სიმრავლეს ეკუთვნის',
      'მხოლოდ მეორე სიმრავლეს ეკუთვნის',
    ],
    optionCount: 4,
    explanation: () =>
      'წრეების გარეთ მოთავსებული ელემენტები არცერთ მოცემულ ჯგუფს არ მიეკუთვნება.',
  }),

  // =========================================================================
  // U12.4 — მონაცემთა შედარება ცხრილებში (Q19–Q24)
  // =========================================================================

  // Q19 — ცხრილის სტრიქონის შეკრება (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-19', subtopicId: 'u12-table-data-comparison', difficulty: 1 }),
    prompt: 'ცხრილის მიხედვით, მაღაზიამ გაყიდა {mon} ნაყინი ორშაბათს და {tue} ნაყინი სამშაბათს. სულ რამდენი ნაყინი გაიყიდა ამ ორ დღეში?',
    variables: {
      mon: { kind: 'int', min: 20, max: 50 },
      tue: { kind: 'int', min: 20, max: 50 },
    },
    answer: (v: Vars) => Number(v.mon) + Number(v.tue),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) =>
      `${vars.mon} + ${vars.tue} = ${answer} ნაყინი.`,
  }),

  // Q20 — ცხრილის მონაცემთა სხვაობა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-20', subtopicId: 'u12-table-data-comparison', difficulty: 1 }),
    prompt: 'ცხრილში მოცემულია წიგნების რაოდენობა: III-A კლასში — {c1}, III-B კლასში — {c2}. რამდენით მეტი წიგნია III-A კლასში, ვიდრე III-B-ში?',
    variables: {
      c2: { kind: 'int', min: 20, max: 45 },
      diff: { kind: 'int', min: 4, max: 16 },
      c1: { kind: 'choice', values: (v: Vars) => [Number(v.c2) + Number(v.diff)] },
    },
    answer: (v: Vars) => Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.c1} − ${vars.c2} = ${answer}-ით მეტი წიგნია.`,
  }),

  // Q21 — მაქსიმალური მაჩვენებლის მქონე დღე (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-21', subtopicId: 'u12-table-data-comparison', difficulty: 2 }),
    prompt: 'ცხრილის მიხედვით, სპორტსმენმა მიიღო ქულები: ორშაბათს — {d1}, სამშაბათს — {d2}, ოთხშაბათს — {d3}, ხუთშაბათს — {d4}. რომელ დღეს მიიღო მან ყველაზე მეტი ქულა?',
    variables: {
      bestDay: { kind: 'choice', values: ['ორშაბათს', 'სამშაბათს', 'ოთხშაბათს', 'ხუთშაბათს'] },
      low1: { kind: 'int', min: 15, max: 20 },
      low2: { kind: 'int', min: 21, max: 25 },
      low3: { kind: 'int', min: 26, max: 30 },
      high: { kind: 'int', min: 35, max: 45 },
      d1: { kind: 'choice', values: (v: Vars) => [v.bestDay === 'ორშაბათს' ? v.high : v.low1] },
      d2: { kind: 'choice', values: (v: Vars) => [v.bestDay === 'სამშაბათს' ? v.high : v.low2] },
      d3: { kind: 'choice', values: (v: Vars) => [v.bestDay === 'ოთხშაბათს' ? v.high : v.low3] },
      d4: { kind: 'choice', values: (v: Vars) => [v.bestDay === 'ხუთშაბათს' ? v.high : v.low1] },
    },
    answer: (v: Vars) => String(v.bestDay),
    format: { kind: 'text' },
    options: () => ['ორშაბათს', 'სამშაბათს', 'ოთხშაბათს', 'ხუთშაბათს'],
    optionCount: 4,
    explanation: ({ answer }) =>
      `ყველაზე მაღალი ქულა დაფიქსირდა ${answer}.`,
  }),

  // Q22 — ორი სემესტრის ჯამი ცხრილში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-22', subtopicId: 'u12-table-data-comparison', difficulty: 2 }),
    prompt: 'ცხრილის მიხედვით, გიორგიმ I სემესტრში დააგროვა {s1} ქულა, ხოლო II სემესტრში — {s2} ქულა. სულ რამდენი ქულა დააგროვა მან წლიურად?',
    variables: {
      s1: { kind: 'int', min: 35, max: 65 },
      s2: { kind: 'int', min: 35, max: 65 },
    },
    answer: (v: Vars) => Number(v.s1) + Number(v.s2),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) =>
      `${vars.s1} + ${vars.s2} = ${answer} ქულა.`,
  }),

  // Q23 — ორმაგი ცხრილის გამოთვლა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-23', subtopicId: 'u12-table-data-comparison', difficulty: 3 }),
    prompt: 'ცხრილში მოცემულია ფასები: საბავშვო ბილეთი ღირს {child} ლარი, უფროსის — {adult} ლარი. რა ეღირება 2 საბავშვო და 1 უფროსის ბილეთი ერთად?',
    variables: {
      child: { kind: 'int', min: 4, max: 10 },
      adult: { kind: 'int', min: 8, max: 18 },
    },
    answer: (v: Vars) => 2 * Number(v.child) + Number(v.adult),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 2),
    explanation: ({ vars, answer }) => {
      const chSum = 2 * Number(vars.child);
      return `2 საბავშვო: 2 × ${vars.child} = ${chSum} ლარი. სულ: ${chSum} + ${vars.adult} = ${answer} ლარი.`;
    },
  }),

  // Q24 — ჭეშმარიტი შედარება ცხრილის მიხედვით (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-24', subtopicId: 'u12-table-data-comparison', difficulty: 3 }),
    prompt: 'ცხრილის მონაცემებით: გუნდ A-ს აქვს {a} ქულა, გუნდ B-ს — {b} ქულა. ჩამოთვლილთაგან რომელი დებულებაა ჭეშმარიტი?',
    variables: {
      b: { kind: 'int', min: 30, max: 60 },
      diff: { kind: 'int', min: 5, max: 15 },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.diff)] },
    },
    answer: (v: Vars) => `გუნდ A-ს ${v.diff} ქულით მეტი აქვს, ვიდრე B-ს`,
    format: { kind: 'text' },
    options: (v: Vars) => {
      const d = Number(v.diff);
      return [
        `გუნდ A-ს ${d} ქულით მეტი აქვს, ვიდრე B-ს`,
        `გუნდ B-ს ${d} ქულით მეტი აქვს, ვიდრე A-ს`,
        `ორივე გუნდს თანაბარი ქულა აქვს`,
        `გუნდ A-ს ${d + 10} ქულით მეტი აქვს, ვიდრე B-ს`,
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${vars.diff}, ამიტომ სწორია: ${answer}.`,
  }),

  // =========================================================================
  // U12.5 — აუცილებელი, შესაძლებელი და შეუძლებელი ხდომილებები (Q25–Q30)
  // =========================================================================

  // Q25 — აუცილებელი ხდომილება (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-25', subtopicId: 'u12-event-types', difficulty: 1 }),
    prompt: 'მოვლენა: „{event}“ — როგორი ხდომილებაა?',
    variables: {
      event: {
        kind: 'choice',
        values: [
          'შაბათის შემდეგ კვირა მოვა',
          'ზაფხულის შემდეგ შემოდგომა დადგება',
          'მზე ამოვა აღმოსავლეთიდან',
          '1 საათში 60 წუთია',
          'კვირაში 7 დღეა',
          'წელიწადში 12 თვეა',
          'ზამთრის შემდეგ გაზაფხული დადგება',
          '1 მეტრში 100 სანტიმეტრია',
          'ოთხშაბათის შემდეგ ხუთშაბათი მოვა',
          '1 ლარში 100 თეთრია',
          '1 კილოგრამში 1000 გრამია',
          'დღის შემდეგ ღამე დადგება',
        ],
      },
    },
    answer: () => 'აუცილებელი',
    format: { kind: 'text' },
    options: () => ['აუცილებელი', 'შეუძლებელი', 'შესაძლებელი (შემთხვევითი)', 'არარეალური'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `„${vars.event}“ აუცილებლად მოხდება, ამიტომ ეს არის ${answer} ხდომილება.`,
  }),

  // Q26 — შეუძლებელი ხდომილება (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-26', subtopicId: 'u12-event-types', difficulty: 1 }),
    prompt: 'მოვლენა: „{event}“ — როგორი ხდომილებაა?',
    variables: {
      event: {
        kind: 'choice',
        values: [
          'კამათლის ერთხელ გაგორებისას მოვა 8-იანი',
          'თებერვალში იქნება 35 დღე',
          'კვირაში იქნება 9 დღე',
          '1 საათში იქნება 100 წუთი',
          'ქუჩაში შეგხვდება ცოცხალი დინოზავრი',
          'მხოლოდ წითელი ბურთებიანი ყუთიდან ამოვა ლურჯი ბურთი',
          'კამათლის გაგორებისას მოვა 0',
          '1 მეტრში იქნება 20 სანტიმეტრი',
          'სამკუთხედს ექნება 5 გვერდი',
          'კვადრატს ექნება 3 კუთხე',
          'თევზი იფრენს ცაში ჩიტივით',
          'ადამიანი გაიზრდება 10 მეტრამდე',
        ],
      },
    },
    answer: () => 'შეუძლებელი',
    format: { kind: 'text' },
    options: () => ['შეუძლებელი', 'აუცილებელი', 'შესაძლებელი (შემთხვევითი)', 'სავარაუდო'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `„${vars.event}“ არასდროს მოხდება, ამიტომ ეს არის ${answer} ხდომილება.`,
  }),

  // Q27 — შესაძლებელი (შემთხვევითი) ხდომილება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-27', subtopicId: 'u12-event-types', difficulty: 2 }),
    prompt: 'მოვლენა: „{event}“ — როგორი ხდომილებაა?',
    variables: {
      event: {
        kind: 'choice',
        values: [
          'ხვალ იწვიმებს',
          'მონეტის აგდებისას მოვა საფასური (გერბი)',
          'კამათლის გაგორებისას მოვა 6-იანი',
          'ქუჩაში შეგხვდება მეგობარი',
          'ავტობუსი მოვა ზუსტად 5 წუთში',
          'ლატარიის ბილეთი მოიგებს პრიზს',
          'ხვალ იქნება მზიანი ამინდი',
          'კალათში ბურთის ჩაგდება პირველივე ცდაზე',
          'მონეტის აგდებისას მოვა საფასური',
          'მაღაზიაში შენი საყვარელი ნაყინი იქნება',
          'კამათლის გაგორებისას მოვა კენტი რიცხვი',
          'შემდეგი გამვლელი იქნება გოგონა',
        ],
      },
    },
    answer: () => 'შესაძლებელი (შემთხვევითი)',
    format: { kind: 'text' },
    options: () => ['შესაძლებელი (შემთხვევითი)', 'აუცილებელი', 'შეუძლებელი', 'გამორიცხული'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `„${vars.event}“ შეიძლება მოხდეს ან არ მოხდეს, ამიტომ ეს არის ${answer} ხდომილება.`,
  }),

  // Q28 — კამათლის შედეგების კლასიფიკაცია (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-28', subtopicId: 'u12-event-types', difficulty: 2 }),
    prompt: 'სტანდარტული კამათლის (1-დან 6-მდე) გაგორებისას {outcome}-ის მოსვლა არის:',
    variables: {
      outcome: {
        kind: 'choice',
        values: [
          '7-ზე ნაკლები რიცხვის',
          '0-ზე მეტი რიცხვის',
          '8-იანის',
          '0-იანის',
          'ლუწი რიცხვის',
          'კენტი რიცხვის',
          'რიცხვი 4-ის',
          '10-იანის',
          '1-დან 6-მდე რიცხვის',
          'რიცხვი 3-ის',
          'უარყოფითი რიცხვის',
          'რიცხვი 5-ის',
        ],
      },
    },
    answer: (v: Vars) => {
      const t = String(v.outcome);
      if (t.includes('7-ზე ნაკლები') || t.includes('0-ზე მეტი') || t.includes('1-დან 6-მდე')) return 'აუცილებელი';
      if (t.includes('8-იანის') || t.includes('0-იანის') || t.includes('10-იანის') || t.includes('უარყოფითი')) return 'შეუძლებელი';
      return 'შესაძლებელი (შემთხვევითი)';
    },
    format: { kind: 'text' },
    options: () => ['აუცილებელი', 'შეუძლებელი', 'შესაძლებელი (შემთხვევითი)', 'დაუჯერებელი'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `კამათელზე ციფრებია 1, 2, 3, 4, 5, 6. ${vars.outcome} მოსვლა არის ${answer} ხდომილება.`,
  }),

  // Q29 — ფერადი ბურთებიანი ყუთი (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-29', subtopicId: 'u12-event-types', difficulty: 3 }),
    prompt: 'ყუთში დევს მხოლოდ {r} წითელი და {b} მწვანე ბურთი. დაუხედავად 1 ბურთის ამოღებისას: {event} — როგორი ხდომილებაა?',
    variables: {
      r: { kind: 'int', min: 3, max: 8 },
      b: { kind: 'int', min: 3, max: 8 },
      event: {
        kind: 'choice',
        values: [
          'ყვითელი ბურთის ამოღება',
          'ლურჯი ბურთის ამოღება',
          'წითელი ან მწვანე ბურთის ამოღება',
          'წითელი ბურთის ამოღება',
          'მწვანე ბურთის ამოღება',
          'ფერადი ბურთის ამოღება',
          'შავი ბურთის ამოღება',
          'მრგვალი ბურთის ამოღება',
          'თეთრი ბურთის ამოღება',
          'კუბის ამოღება',
          'ნებისმიერი ბურთის ამოღება',
          'ვარდისფერი ბურთის ამოღება',
        ],
      },
    },
    answer: (v: Vars) => {
      const ev = String(v.event);
      if (ev.includes('ყვითელი') || ev.includes('ლურჯი') || ev.includes('შავი') || ev.includes('თეთრი') || ev.includes('კუბის') || ev.includes('ვარდისფერი')) {
        return 'შეუძლებელი';
      }
      if (ev.includes('წითელი ან მწვანე') || ev.includes('ფერადი') || ev.includes('მრგვალი') || ev.includes('ნებისმიერი')) {
        return 'აუცილებელი';
      }
      return 'შესაძლებელი (შემთხვევითი)';
    },
    format: { kind: 'text' },
    options: () => ['აუცილებელი', 'შეუძლებელი', 'შესაძლებელი (შემთხვევითი)', 'გამორიცხული'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `ყუთში მხოლოდ წითელი და მწვანე ბურთებია, ამიტომ „${vars.event}“ არის ${answer}.`,
  }),

  // Q30 — ხდომილების ტიპის ამოცნობა შეკითხვით (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-30', subtopicId: 'u12-event-types', difficulty: 3 }),
    prompt: 'ჩამოთვლილთაგან რომელია {targetType} ხდომილება? (შეკითხვა #{num})',
    variables: {
      targetType: { kind: 'choice', values: ['შეუძლებელი', 'აუცილებელი'] },
      num: { kind: 'int', min: 1, max: 12 },
    },
    answer: (v: Vars) =>
      v.targetType === 'შეუძლებელი' ? 'კამათლის გაგორებისას 9-იანის მოსვლა' : 'კვირის შემდეგ ორშაბათის დადგომა',
    format: { kind: 'text' },
    options: (v: Vars) => {
      if (v.targetType === 'შეუძლებელი') {
        return [
          'კამათლის გაგორებისას 9-იანის მოსვლა',
          'კვირის შემდეგ ორშაბათის დადგომა',
          'ხვალ წვიმის მოსვლა',
          'მონეტის აგდებისას საფასურის მოსვლა',
        ];
      }
      return [
        'კვირის შემდეგ ორშაბათის დადგომა',
        'კამათლის გაგორებისას 9-იანის მოსვლა',
        'ხვალ თოვლის მოსვლა',
        'კამათლის გაგორებისას 6-იანის მოსვლა',
      ];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${answer} არის ${vars.targetType} ხდომილება.`,
  }),

  // =========================================================================
  // U12.6 — კომბინაციები და ალბათობის ცვლილება (Q31–Q36)
  // =========================================================================

  // Q31 — უფრო სავარაუდო შედეგი (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-31', subtopicId: 'u12-combinations-likelihood', difficulty: 1 }),
    prompt: 'ყუთში დევს {red} წითელი და {blue} ლურჯი ბურთი. დაუხედავად 1 ბურთის ამოღებისას რომელი ფერის ბურთის ამოღებაა უფრო სავარაუდო?',
    variables: {
      red: { kind: 'choice', values: [8, 10, 12, 15] },
      blue: { kind: 'choice', values: [3, 4, 5, 6] },
    },
    answer: () => 'წითელი ბურთის',
    format: { kind: 'text' },
    options: () => ['წითელი ბურთის', 'ლურჯი ბურთის', 'ორივესი თანაბრად სავარაუდოა', 'შეუძლებელია დადგენა'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `წითელი ბურთი (${vars.red}) მეტია ლურჯზე (${vars.blue}), ამიტომ ${answer} ამოღება უფრო სავარაუდოა.`,
  }),

  // Q32 — თანაბრად სავარაუდო შედეგი (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-32', subtopicId: 'u12-combinations-likelihood', difficulty: 1 }),
    prompt: 'ყუთში დევს {n} თეთრი და {n} შავი ბურთი. რომელი ფერის ბურთის ამოღებაა უფრო მოსალოდნელი?',
    variables: {
      n: { kind: 'int', min: 3, max: 15 },
    },
    answer: () => 'ორივესი თანაბრად სავარაუდოა',
    format: { kind: 'text' },
    options: () => ['ორივესი თანაბრად სავარაუდოა', 'თეთრი ბურთის', 'შავი ბურთის', 'შეუძლებელია დადგენა'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `თეთრი და შავი ბურთების რაოდენობა ტოლია (${vars.n}), ამიტომ ${answer}.`,
  }),

  // Q33 — ჩაცმულობის კომბინაციები (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-33', subtopicId: 'u12-combinations-likelihood', difficulty: 2 }),
    prompt: 'გიორგის აქვს {shirts} სხვადასხვა მაისური და {pants} სხვადასხვა შარვალი. სულ რამდენი განსხვავებული ჩაცმულობის (კომბინაციის) შედგენა შეუძლია მას?',
    variables: {
      shirts: { kind: 'int', min: 2, max: 5 },
      pants: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v: Vars) => Number(v.shirts) * Number(v.pants),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.shirts} × ${vars.pants} = ${answer} განსხვავებული ჩაცმულობა.`,
  }),

  // Q34 — მენიუს კომბინაციები (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-34', subtopicId: 'u12-combinations-likelihood', difficulty: 2 }),
    prompt: 'კაფეში არის {meals} სახის კერძი და {drinks} სახის სასმელი. რამდენნაირი სადილის (1 კერძი + 1 სასმელი) არჩევაა შესაძლებელი?',
    variables: {
      meals: { kind: 'int', min: 3, max: 6 },
      drinks: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v: Vars) => Number(v.meals) * Number(v.drinks),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.meals} × ${vars.drinks} = ${answer} შესაძლო ვარიანტი.`,
  }),

  // Q35 — ალბათობის ცვლილება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u12-35', subtopicId: 'u12-combinations-likelihood', difficulty: 3 }),
    prompt: 'ყუთში იყო {r} წითელი და {b} მწვანე ბურთი. ყუთიდან ამოიღეს {rem} წითელი ბურთი. ახლა რომელი ფერის ბურთის ამოღებაა უფრო სავარაუდო?',
    variables: {
      rem: { kind: 'choice', values: [2, 3, 4, 5] },
      b: { kind: 'choice', values: [6, 7, 8, 9] },
      diff: { kind: 'choice', values: [1, 2, 3] },
      r: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.rem) - Number(v.diff)] },
    },
    answer: () => 'მწვანე ბურთის',
    format: { kind: 'text' },
    options: () => ['მწვანე ბურთის', 'წითელი ბურთის', 'ორივესი თანაბრად სავარაუდოა', 'შეუძლებელია დადგენა'],
    optionCount: 4,
    explanation: ({ vars, answer }) => {
      const newR = Number(vars.r) - Number(vars.rem);
      return `დარჩა ${newR} წითელი და ${vars.b} მწვანე ბურთი. რადგან ${vars.b} > ${newR}, უფრო სავარაუდოა ${answer} ამოღება.`;
    },
  }),

  // Q36 — სამი ელემენტის კომბინაცია (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u12-36', subtopicId: 'u12-combinations-likelihood', difficulty: 3 }),
    prompt: 'ნაყინის მაღაზიაში არის {c} სახის ჭიქა, {f} სახის ნაყინი და {t} სახის მოსაყრელი. სულ რამდენნაირი განსხვავებული ნაყინის შედგენა შეიძლება (1 ჭიქა + 1 ნაყინი + 1 მოსაყრელი)?',
    variables: {
      c: { kind: 'choice', values: [2, 3, 4] },
      f: { kind: 'choice', values: [2, 3, 4, 5] },
      t: { kind: 'choice', values: [2, 3, 4] },
    },
    answer: (v: Vars) => Number(v.c) * Number(v.f) * Number(v.t),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 2),
    explanation: ({ vars, answer }) =>
      `${vars.c} × ${vars.f} × ${vars.t} = ${answer} კომბინაცია.`,
  }),
];
