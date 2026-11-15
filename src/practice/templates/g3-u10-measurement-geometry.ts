import { defineTemplate, QuestionTemplate } from './types';

/**
 * Grade 3 — Unit 10: გაზომვა და გეომეტრია (Measurement & Geometry)
 *
 * Covers 10 subtopics (60 templates total: Q01–Q60, 6 per subtopic):
 *   U10.1 — თერმომეტრი და საზომი ერთეულები (u10-thermometers-units)
 *   U10.2 — სიგრძის, მასის და მოცულობის ერთეულების გარდაქმნა (u10-converting-units)
 *   U10.3 — სახაზავის გამოყენება (u10-ruler-applications)
 *   U10.4 — ბრტყელი და სივრცითი ფიგურები (u10-flat-solid-shapes)
 *   U10.5 — სამკუთხედებისა და ოთხკუთხედების კლასიფიკაცია (u10-triangle-quadrilateral-classification)
 *   U10.6 — გვერდები, წვეროები, წიბოები და წახნაგები (u10-sides-vertices-edges-faces)
 *   U10.7 — პერიმეტრის გამოთვლა (u10-perimeter-calculations)
 *   U10.8 — კუთხეების კლასიფიკაცია (u10-angle-classification)
 *   U10.9 — წრფე, მონაკვეთი, სხივი და ურთიერთმდებარეობა (u10-lines-segments-rays)
 *   U10.10 — მრავალკუთხედები და ფიგურების შევსება (u10-polygons-shape-filling)
 */

export const G3_U10_SUBTOPICS = [
  'u10-thermometers-units',
  'u10-converting-units',
  'u10-ruler-applications',
  'u10-flat-solid-shapes',
  'u10-triangle-quadrilateral-classification',
  'u10-sides-vertices-edges-faces',
  'u10-perimeter-calculations',
  'u10-angle-classification',
  'u10-lines-segments-rays',
  'u10-polygons-shape-filling',
] as const;

export type G3U10SubtopicId = (typeof G3_U10_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G3U10SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 3 as const,
  topicId: 'g3-gazomva-geometria' as const,
  unitId: 'g3-gazomva-geometria' as const,
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

export const G3_U10_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U10.1 — თერმომეტრი და საზომი ერთეულები (Q01–Q06)
  // =========================================================================

  // Q01 — ტემპერატურის მომატება (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-01', subtopicId: 'u10-thermometers-units', difficulty: 1 }),
    prompt: 'თერმომეტრი აჩვენებდა {t}°C-ს. დღის განმავლობაში ტემპერატურა გაიზარდა {inc}°C-ით. რამდენი გრადუსია ახლა?',
    variables: {
      t: { kind: 'int', min: 5, max: 25 },
      inc: { kind: 'int', min: 3, max: 14 },
    },
    answer: (v: Vars) => Number(v.t) + Number(v.inc),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 1),
    explanation: ({ vars, answer }) =>
      `${vars.t} + ${vars.inc} = ${answer}°C. ახლა ტემპერატურაა ${answer}°C.`,
  }),

  // Q02 — ტემპერატურის დაკლება (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-02', subtopicId: 'u10-thermometers-units', difficulty: 1 }),
    prompt: 'საღამოს ტემპერატურა იყო {t}°C, ღამით კი {dec}°C-ით დაიკლო. რამდენი გრადუსია ღამით?',
    variables: {
      t: { kind: 'int', min: 15, max: 32 },
      dec: { kind: 'int', min: 3, max: 12 },
    },
    answer: (v: Vars) => Number(v.t) - Number(v.dec),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 1),
    explanation: ({ vars, answer }) =>
      `${vars.t} − ${vars.dec} = ${answer}°C. ღამით ტემპერატურაა ${answer}°C.`,
  }),

  // Q03 — ფიზიკური სიდიდის საზომი ერთეული (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-03', subtopicId: 'u10-thermometers-units', difficulty: 2 }),
    prompt: 'რომელი საზომი ერთეულით იზომება {context}?',
    variables: {
      context: {
        kind: 'choice',
        values: [
          'ჰაერის ტემპერატურა',
          'ჩაის ტემპერატურა',
          'წყლის მოცულობა ვედროში',
          'წვენის მოცულობა ბოთლში',
          'სხეულის მასა',
          'ვაშლების მასა',
          'ოთახის სიგრძე',
          'საკლასო დაფის სიგრძე',
          'გაკვეთილის ხანგრძლივობა',
          'სირბილის დრო',
          'რძის მოცულობა',
          'სარბენი ბილიკის სიგრძე',
        ],
      },
    },
    answer: (v: Vars) => {
      const t = String(v.context);
      if (t.includes('ტემპერატურა')) return 'გრადუსი ცელსიუსი (°C)';
      if (t.includes('მოცულობა')) return 'ლიტრი (ლ)';
      if (t.includes('მასა')) return 'კილოგრამი (კგ)';
      if (t.includes('ხანგრძლივობა') || t.includes('დრო')) return 'წუთი (წთ)';
      return 'მეტრი (მ)';
    },
    format: { kind: 'text' },
    options: (v: Vars) => {
      const t = String(v.context);
      if (t.includes('ტემპერატურა')) {
        return ['გრადუსი ცელსიუსი (°C)', 'კილოგრამი (კგ)', 'მეტრი (მ)', 'ლიტრი (ლ)'];
      }
      if (t.includes('მოცულობა')) {
        return ['ლიტრი (ლ)', 'მეტრი (მ)', 'გრადუსი ცელსიუსი (°C)', 'გრამი (გ)'];
      }
      if (t.includes('მასა')) {
        return ['კილოგრამი (კგ)', 'ლიტრი (ლ)', 'მეტრი (მ)', 'საათი'];
      }
      if (t.includes('ხანგრძლივობა') || t.includes('დრო')) {
        return ['წუთი (წთ)', 'მეტრი (მ)', 'კილოგრამი (კგ)', 'ლიტრი (ლ)'];
      }
      return ['მეტრი (მ)', 'კილოგრამი (კგ)', 'ლიტრი (ლ)', 'გრადუსი ცელსიუსი (°C)'];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.context} იზომება ერთეულით: ${answer}.`,
  }),

  // Q04 — ტემპერატურათა სხვაობა ქალაქებში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-04', subtopicId: 'u10-thermometers-units', difficulty: 2 }),
    prompt: 'თბილისში არის {t1}°C, ხოლო ბათუმში — {t2}°C. რამდენ გრადუსით თბილა თბილისში, ვიდრე ბათუმში?',
    variables: {
      t1: { kind: 'int', min: 20, max: 32 },
      diff: { kind: 'int', min: 2, max: 9 },
      t2: { kind: 'choice', values: (v: Vars) => [Number(v.t1) - Number(v.diff)] },
    },
    answer: (v: Vars) => Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.t1} − ${vars.t2} = ${answer}°C-ით მეტია ტემპერატურა თბილისში.`,
  }),

  // Q05 — ნულს ქვემოთ ტემპერატურა (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-05', subtopicId: 'u10-thermometers-units', difficulty: 3 }),
    prompt: 'თერმომეტრის სვეტი 0 გრადუსიდან {step} გრადუსით ქვემოთ ჩამოვიდა (ყინვაა). რა ტემპერატურას აჩვენებს თერმომეტრი?',
    variables: {
      step: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => `−${v.step}°C`,
    format: { kind: 'text' },
    options: (v: Vars) => [
      `−${v.step}°C`,
      `+${v.step}°C`,
      `0°C`,
      `−${Number(v.step) + 5}°C`,
    ],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `ნულის ქვემოთ რიცხვები უარყოფითია, ამიტომ 0-დან ${vars.step} გრადუსით ქვემოთ არის ${answer}.`,
  }),

  // Q06 — ტემპერატურის ორნაბიჯიანი ცვლილება (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-06', subtopicId: 'u10-thermometers-units', difficulty: 3 }),
    prompt: 'დილით იყო {t}°C. შუადღისას ტემპერატურა გაიზარდა {inc}°C-ით, საღამოს კი დაიკლო {dec}°C-ით. რამდენი გრადუსია საღამოს?',
    variables: {
      t: { kind: 'int', min: 10, max: 22 },
      inc: { kind: 'int', min: 5, max: 10 },
      dec: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v: Vars) => Number(v.t) + Number(v.inc) - Number(v.dec),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 1),
    explanation: ({ vars, answer }) =>
      `${vars.t} + ${vars.inc} − ${vars.dec} = ${answer}°C.`,
  }),

  // =========================================================================
  // U10.2 — სიგრძის, მასის და მოცულობის ერთეულების გარდაქმნა (Q07–Q12)
  // =========================================================================

  // Q07 — მეტრების გარდაქმნა სანტიმეტრებში (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-07', subtopicId: 'u10-converting-units', difficulty: 1 }),
    prompt: 'რამდენი სანტიმეტრია {m} მეტრში?',
    variables: {
      m: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => Number(v.m) * 100,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 100),
    explanation: ({ vars, answer }) =>
      `რადგან 1 მეტრი = 100 სმ, ამიტომ ${vars.m} მ = ${vars.m} × 100 = ${answer} სმ.`,
  }),

  // Q08 — კილოგრამების გარდაქმნა გრამებში (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-08', subtopicId: 'u10-converting-units', difficulty: 1 }),
    prompt: 'რამდენი გრამია {kg} კილოგრამში?',
    variables: {
      kg: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => Number(v.kg) * 1000,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 1000),
    explanation: ({ vars, answer }) =>
      `რადგან 1 კგ = 1000 გ, ამიტომ ${vars.kg} კგ = ${vars.kg} × 1000 = ${answer} გ.`,
  }),

  // Q09 — შერეული ერთეულების გადაყვანა სანტიმეტრებში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-09', subtopicId: 'u10-converting-units', difficulty: 2 }),
    prompt: 'რამდენი სანტიმეტრია {m} მეტრსა და {cm} სანტიმეტრში ერთად?',
    variables: {
      m: { kind: 'int', min: 1, max: 7 },
      cm: { kind: 'choice', values: [15, 25, 40, 55, 70, 85] },
    },
    answer: (v: Vars) => Number(v.m) * 100 + Number(v.cm),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 10),
    explanation: ({ vars, answer }) =>
      `${vars.m} მ = ${Number(vars.m) * 100} სმ. ${Number(vars.m) * 100} + ${vars.cm} = ${answer} სმ.`,
  }),

  // Q10 — ლიტრების გარდაქმნა მილილიტრებში (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-10', subtopicId: 'u10-converting-units', difficulty: 2 }),
    prompt: 'რამდენი მილილიტრია {l} ლიტრში?',
    variables: {
      l: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => Number(v.l) * 1000,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 1000),
    explanation: ({ vars, answer }) =>
      `1 ლიტრი = 1000 მლ, ამიტომ ${vars.l} ლ = ${vars.l} × 1000 = ${answer} მლ.`,
  }),

  // Q11 — სხვადასხვა ერთეულების შედარება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-11', subtopicId: 'u10-converting-units', difficulty: 3 }),
    prompt: 'რომელია მეტი: {m} მ თუ {cm} სმ?',
    variables: {
      m: { kind: 'int', min: 2, max: 8 },
      diff: { kind: 'choice', values: [-50, -20, 20, 50] },
      cm: { kind: 'choice', values: (v: Vars) => [Number(v.m) * 100 + Number(v.diff)] },
    },
    answer: (v: Vars) => (Number(v.m) * 100 > Number(v.cm) ? `${v.m} მ` : `${v.cm} სმ`),
    format: { kind: 'text' },
    options: (v: Vars) => [
      `${v.m} მ`,
      `${v.cm} სმ`,
      'ორივე ტოლია',
      'შეუძლებელია შედარება',
    ],
    optionCount: 4,
    explanation: ({ vars, answer }) => {
      const mVal = Number(vars.m) * 100;
      return `${vars.m} მ = ${mVal} სმ. ${mVal} ${mVal > Number(vars.cm) ? '>' : '<'} ${vars.cm} სმ, ამიტომ მეტია ${answer}.`;
    },
  }),

  // Q12 — ტექსტური ამოცანა ერთეულების გარდაქმნაზე (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-12', subtopicId: 'u10-converting-units', difficulty: 3 }),
    prompt: 'თოკის სიგრძე იყო {m} მეტრი. მისგან მოჭრეს {cut} სმ. რამდენი სანტიმეტრი თოკი დარჩა?',
    variables: {
      m: { kind: 'int', min: 2, max: 6 },
      cut: { kind: 'choice', values: [30, 50, 70, 120, 150, 200] },
    },
    answer: (v: Vars) => Number(v.m) * 100 - Number(v.cut),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 50),
    explanation: ({ vars, answer }) => {
      const totalCm = Number(vars.m) * 100;
      return `${vars.m} მ = ${totalCm} სმ. ${totalCm} − ${vars.cut} = ${answer} სმ დარჩა.`;
    },
  }),

  // =========================================================================
  // U10.3 — სახაზავის გამოყენება (Q13–Q18)
  // =========================================================================

  // Q13 — მონაკვეთი ნულიდან სახაზავზე (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-13', subtopicId: 'u10-ruler-applications', difficulty: 1 }),
    prompt: 'სახაზავზე მონაკვეთის დასაწყისია 0 სმ ნიშნულზე, ხოლო დასასრულია {end} სმ ნიშნულზე. რა სიგრძისაა მონაკვეთი?',
    variables: {
      end: { kind: 'int', min: 5, max: 25 },
    },
    answer: (v: Vars) => Number(v.end),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `მონაკვეთი იწყება 0-ზე და მთავრდება ${vars.end}-ზე, მისი სიგრძეა ${answer} სმ.`,
  }),

  // Q14 — ორი მონაკვეთის საერთო სიგრძე (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-14', subtopicId: 'u10-ruler-applications', difficulty: 1 }),
    prompt: 'პირველი მონაკვეთის სიგრძეა {a} სმ, მეორესი კი — {b} სმ. რამდენია მათი საერთო სიგრძე?',
    variables: {
      a: { kind: 'int', min: 12, max: 40 },
      b: { kind: 'int', min: 10, max: 35 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer} სმ.`,
  }),

  // Q15 — მონაკვეთი არ იწყება ნულიდან (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-15', subtopicId: 'u10-ruler-applications', difficulty: 2 }),
    prompt: 'სახაზავზე მონაკვეთის ერთი ბოლოა {start} სმ-ის ნიშნულზე, მეორე კი — {end} სმ-ის ნიშნულზე. რა სიგრძისაა ეს მონაკვეთი?',
    variables: {
      start: { kind: 'int', min: 2, max: 10 },
      len: { kind: 'int', min: 4, max: 18 },
      end: { kind: 'choice', values: (v: Vars) => [Number(v.start) + Number(v.len)] },
    },
    answer: (v: Vars) => Number(v.len),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `მონაკვეთის სიგრძეა ბოლო ნიშნულს გამოკლებული საწყისი: ${vars.end} − ${vars.start} = ${answer} სმ.`,
  }),

  // Q16 — ორი მონაკვეთის შედარება სახაზავზე (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-16', subtopicId: 'u10-ruler-applications', difficulty: 2 }),
    prompt: 'სახაზავზე მონაკვეთი AB იწყება {s1} სმ-ზე და მთავრდება {e1} სმ-ზე ({l1} სმ), ხოლო მონაკვეთი CD იწყება {s2} სმ-ზე და მთავრდება {e2} სმ-ზე ({l2} სმ). რომელი მონაკვეთია უფრო გრძელი?',
    variables: {
      s1: { kind: 'int', min: 1, max: 5 },
      l1: { kind: 'choice', values: [6, 8, 10, 12] },
      e1: { kind: 'choice', values: (v: Vars) => [Number(v.s1) + Number(v.l1)] },
      s2: { kind: 'int', min: 1, max: 5 },
      l2: { kind: 'choice', values: [5, 7, 9, 11] },
      e2: { kind: 'choice', values: (v: Vars) => [Number(v.s2) + Number(v.l2)] },
    },
    answer: (v: Vars) => (Number(v.l1) > Number(v.l2) ? 'მონაკვეთი AB' : 'მონაკვეთი CD'),
    format: { kind: 'text' },
    options: () => ['მონაკვეთი AB', 'მონაკვეთი CD', 'ორივე ტოლი სიგრძისაა', 'შეუძლებელია დადგენა'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `AB = ${vars.l1} სმ, CD = ${vars.l2} სმ. უფრო გრძელია ${answer}.`,
  }),

  // Q17 — სანტიმეტრები და მილიმეტრები (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-17', subtopicId: 'u10-ruler-applications', difficulty: 3 }),
    prompt: 'მონაკვეთის სიგრძეა {cm} სმ და {mm} მმ. რამდენი მილიმეტრია მისი სიგრძე?',
    variables: {
      cm: { kind: 'int', min: 2, max: 9 },
      mm: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v: Vars) => Number(v.cm) * 10 + Number(v.mm),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) =>
      `1 სმ = 10 მმ, ამიტომ ${vars.cm} სმ = ${Number(vars.cm) * 10} მმ. ${Number(vars.cm) * 10} + ${vars.mm} = ${answer} მმ.`,
  }),

  // Q18 — მონაკვეთის გაყოფა ტოლ ნაწილებად (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-18', subtopicId: 'u10-ruler-applications', difficulty: 3 }),
    prompt: '{len} სმ სიგრძის მონაკვეთი დაყვეს {n} ტოლ ნაწილად. რამდენი სანტიმეტრია თითოეული ნაწილის სიგრძე?',
    variables: {
      n: { kind: 'choice', values: [2, 3, 4, 5] },
      part: { kind: 'int', min: 3, max: 12 },
      len: { kind: 'choice', values: (v: Vars) => [Number(v.n) * Number(v.part)] },
    },
    answer: (v: Vars) => Number(v.part),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.len} ÷ ${vars.n} = ${answer} სმ.`,
  }),

  // =========================================================================
  // U10.4 — ბრტყელი და სივრცითი ფიგურები (Q19–Q24)
  // =========================================================================

  // Q19 — სივრცითი თუ ბრტყელი ფიგურის ამოცნობა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-19', subtopicId: 'u10-flat-solid-shapes', difficulty: 1 }),
    prompt: 'ჩამოთვლილთაგან რომელია {type}?',
    variables: {
      type: { kind: 'choice', values: ['სივრცითი გეომეტრიული სხეული', 'ბრტყელი გეომეტრიული ფიგურა'] },
      idx: { kind: 'choice', values: [0, 1, 2, 3, 4, 5] },
    },
    answer: (v: Vars) => {
      const solids = ['კუბი', 'ბირთვი', 'ცილინდრი', 'კონუსი', 'პირამიდა', 'მართკუთხა პარალელეპიპედი'];
      const flats = ['კვადრატი', 'წრე', 'სამკუთხედი', 'მართკუთხედი', 'ხუთკუთხედი', 'რომბი'];
      const i = Number(v.idx);
      return String(v.type).includes('სივრცითი') ? solids[i] : flats[i];
    },
    format: { kind: 'text' },
    options: (v: Vars) => {
      const isSolid = String(v.type).includes('სივრცითი');
      const solids = ['კუბი', 'ბირთვი', 'ცილინდრი', 'კონუსი', 'პირამიდა', 'მართკუთხა პარალელეპიპედი'];
      const flats = ['კვადრატი', 'წრე', 'სამკუთხედი', 'მართკუთხედი', 'ხუთკუთხედი', 'რომბი'];
      const i = Number(v.idx);
      if (isSolid) {
        return [solids[i], flats[0], flats[1], flats[2]];
      }
      return [flats[i], solids[0], solids[1], solids[2]];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${answer} არის ${vars.type}.`,
  }),

  // Q20 — რეალური საგნის ფორმა (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-20', subtopicId: 'u10-flat-solid-shapes', difficulty: 1 }),
    prompt: '{item}-ს რომელი სივრცითი სხეულის ფორმა აქვს?',
    variables: {
      item: {
        kind: 'choice',
        values: [
          'სათამაშო კამათელი',
          'ფეხბურთის ბურთი',
          'კონსერვის ქილა',
          'ნაყინის ვაფლის ჭიქა',
          'სამშენებლო აგური',
          'ფორთოხალი',
          'საჩუქრის კუბური ყუთი',
          'საგზაო კონუსი',
          'მრგვალი მილი',
          'ჩაის ყუთი',
          'ჩოგბურთის ბურთი',
          'ხის კუბი',
          'საზამთრო',
          'საღებავის მრგვალი ქილა',
          'კალათბურთის ბურთი',
          'ასანთის კოლოფი',
        ],
      },
    },
    answer: (v: Vars) => {
      const it = String(v.item);
      if (it.includes('კამათელი') || it.includes('კუბური') || it.includes('კუბი')) return 'კუბი';
      if (it.includes('ბურთი') || it.includes('ფორთოხალი') || it.includes('საზამთრო')) return 'ბირთვი';
      if (it.includes('ქილა') || it.includes('მილი')) return 'ცილინდრი';
      if (it.includes('კონუსი') || it.includes('ვაფლის')) return 'კონუსი';
      return 'მართკუთხა პარალელეპიპედი';
    },
    format: { kind: 'text' },
    options: (v: Vars) => {
      const it = String(v.item);
      let ans = 'მართკუთხა პარალელეპიპედი';
      if (it.includes('კამათელი') || it.includes('კუბური') || it.includes('კუბი')) ans = 'კუბი';
      else if (it.includes('ბურთი') || it.includes('ფორთოხალი') || it.includes('საზამთრო')) ans = 'ბირთვი';
      else if (it.includes('ქილა') || it.includes('მილი')) ans = 'ცილინდრი';
      else if (it.includes('კონუსი') || it.includes('ვაფლის')) ans = 'კონუსი';

      const pool = ['კუბი', 'ბირთვი', 'ცილინდრი', 'კონუსი', 'მართკუთხა პარალელეპიპედი'];
      const rest = pool.filter((s) => s !== ans).slice(0, 3);
      return [ans, ...rest];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.item}-ს აქვს ${answer}-ის ფორმა.`,
  }),

  // Q21 — სივრცითი სხეულის ფუძის ან წახნაგის ფორმა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-21', subtopicId: 'u10-flat-solid-shapes', difficulty: 2 }),
    prompt: 'რა ფორმა აქვს {body}-ს?',
    variables: {
      body: {
        kind: 'choice',
        values: [
          'კუბის წახნაგს',
          'ცილინდრის ქვედა ფუძეს',
          'კონუსის ფუძეს',
          'კვადრატული პირამიდის ფუძეს',
          'კვადრატული პირამიდის გვერდით წახნაგს',
          'სამკუთხა პირამიდის წახნაგს',
          'მართკუთხა პარალელეპიპედის წახნაგს',
          'ცილინდრის ზედა ფუძეს',
          'კუბის ზედა წახნაგს',
          'სამკუთხა პრიზმის ფუძეს',
          'სამკუთხა პრიზმის გვერდით წახნაგს',
          'კუბის გვერდით წახნაგს',
        ],
      },
    },
    answer: (v: Vars) => {
      const b = String(v.body);
      if (b.includes('კუბის')) return 'კვადრატი';
      if (b.includes('ცილინდრის') || b.includes('კონუსის')) return 'წრე';
      if (b.includes('გვერდით') && b.includes('პირამიდის')) return 'სამკუთხედი';
      if (b.includes('სამკუთხა პირამიდის') || b.includes('სამკუთხა პრიზმის ფუძეს')) return 'სამკუთხედი';
      if (b.includes('კვადრატული პირამიდის ფუძეს')) return 'კვადრატი';
      return 'მართკუთხედი';
    },
    format: { kind: 'text' },
    options: () => ['კვადრატი', 'წრე', 'სამკუთხედი', 'მართკუთხედი'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.body} არის ${answer}.`,
  }),

  // Q22 — სხეულები წვეროების გარეშე (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-22', subtopicId: 'u10-flat-solid-shapes', difficulty: 2 }),
    prompt: 'ჩამოთვლილთაგან რომელ სივრცით სხეულს არ გააჩნია არცერთი წვერო? (ვარიანტი {idx})',
    variables: {
      idx: { kind: 'int', min: 1, max: 12 },
    },
    answer: () => 'ბირთვი (სფერო)',
    format: { kind: 'text' },
    options: () => ['ბირთვი (სფერო)', 'კუბი', 'პირამიდა', 'კონუსი'],
    optionCount: 4,
    explanation: () =>
      'ბირთვს (სფეროს) არ აქვს წვეროები და წიბოები.',
  }),

  // Q23 — კუბის წახნაგების რაოდენობა (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-23', subtopicId: 'u10-flat-solid-shapes', difficulty: 3 }),
    prompt: 'სულ რამდენი კვადრატული წახნაგისგან შედგება {solid}?',
    variables: {
      solid: { kind: 'choice', values: ['სათამაშო კუბი', 'კუბური ყუთი', 'კუბი A', 'კუბი B', 'კუბი C', 'ხის კუბი', 'პლასტმასის კუბი', 'დიდი კუბი', 'პატარა კუბი', 'სასაჩუქრე კუბი', 'სამშენებლო კუბი', 'ფერადი კუბი'] },
    },
    answer: () => 6,
    format: { kind: 'integer', min: 0 },
    distractors: () => [4, 8, 12],
    explanation: ({ vars, answer }) =>
      `${vars.solid}-ს აქვს ზუსტად ${answer} კვადრატული წახნაგი.`,
  }),

  // Q24 — სივრცითი სხეულის თვისება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-24', subtopicId: 'u10-flat-solid-shapes', difficulty: 3 }),
    prompt: 'რომელ სივრცით სხეულს აქვს ზუსტად 1 წვერო და 1 მრგვალი ფუძე? (კითხვა #{num})',
    variables: {
      num: { kind: 'int', min: 1, max: 15 },
    },
    answer: () => 'კონუსი',
    format: { kind: 'text' },
    options: () => ['კონუსი', 'ცილინდრი', 'ბირთვი', 'პირამიდა'],
    optionCount: 4,
    explanation: () =>
      'კონუსს აქვს 1 მრგვალი ფუძე და 1 წვერო.',
  }),

  // =========================================================================
  // U10.5 — სამკუთხედებისა და ოთხკუთხედების კლასიფიკაცია (Q25–Q30)
  // =========================================================================

  // Q25 — ტოლგვერდა სამკუთხედი (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-25', subtopicId: 'u10-triangle-quadrilateral-classification', difficulty: 1 }),
    prompt: 'სამკუთხედს, რომლის სამივე გვერდი ტოლია ({a} სმ, {a} სმ და {a} სმ), ეწოდება:',
    variables: {
      a: { kind: 'int', min: 3, max: 15 },
    },
    answer: () => 'ტოლგვერდა სამკუთხედი',
    format: { kind: 'text' },
    options: () => ['ტოლგვერდა სამკუთხედი', 'ტოლფერდა სამკუთხედი', 'სხვადასხვაგვერდა სამკუთხედი', 'მართკუთხა სამკუთხედი'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `თუ სამივე გვერდი ტოლია (${vars.a} სმ), ის არის ${answer}.`,
  }),

  // Q26 — ტოლფერდა სამკუთხედი (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-26', subtopicId: 'u10-triangle-quadrilateral-classification', difficulty: 1 }),
    prompt: 'სამკუთხედს, რომელსაც მხოლოდ ორი გვერდი აქვს ტოლი ({a} სმ, {a} სმ და {b} სმ), ეწოდება:',
    variables: {
      a: { kind: 'int', min: 4, max: 12 },
      diff: { kind: 'choice', values: [1, 2, 3] },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.a) + Number(v.diff)] },
    },
    answer: () => 'ტოლფერდა სამკუთხედი',
    format: { kind: 'text' },
    options: () => ['ტოლფერდა სამკუთხედი', 'ტოლგვერდა სამკუთხედი', 'სხვადასხვაგვერდა სამკუთხედი', 'ბლაგვკუთხა სამკუთხედი'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `თუ ორი გვერდი ტოლია (${vars.a} სმ), სამკუთხედს ეწოდება ${answer}.`,
  }),

  // Q27 — კვადრატის ცნობა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-27', subtopicId: 'u10-triangle-quadrilateral-classification', difficulty: 2 }),
    prompt: 'ოთხკუთხედს, რომლის ოთხივე კუთხე მართია და ოთხივე გვერდი ტოლია ({a} სმ), ეწოდება:',
    variables: {
      a: { kind: 'int', min: 3, max: 15 },
    },
    answer: () => 'კვადრატი',
    format: { kind: 'text' },
    options: () => ['კვადრატი', 'მართკუთხედი', 'რომბი', 'ტრაპეცია'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `ფიგურას, რომლის ოთხივე გვერდი ტოლია (${vars.a} სმ) და კუთხეები მართია, ეწოდება ${answer}.`,
  }),

  // Q28 — მართკუთხედის ცნობა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-28', subtopicId: 'u10-triangle-quadrilateral-classification', difficulty: 2 }),
    prompt: 'ოთხკუთხედს, რომლის მოპირდაპირე გვერდები ტოლია ({a} სმ და {b} სმ) და ოთხივე კუთხე მართია, ეწოდება:',
    variables: {
      a: { kind: 'int', min: 6, max: 14 },
      b: { kind: 'int', min: 2, max: 5 },
    },
    answer: () => 'მართკუთხედი',
    format: { kind: 'text' },
    options: () => ['მართკუთხედი', 'კვადრატი', 'რომბი', 'სამკუთხედი'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `გვერდებით ${vars.a} სმ და ${vars.b} სმ და მართი კუთხეებით ფიგურა არის ${answer}.`,
  }),

  // Q29 — სხვადასხვაგვერდა სამკუთხედი (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-29', subtopicId: 'u10-triangle-quadrilateral-classification', difficulty: 3 }),
    prompt: 'სამკუთხედს, რომლის სამივე გვერდი სხვადასხვა სიგრძისაა ({a} სმ, {b} სმ და {c} სმ), ეწოდება:',
    variables: {
      a: { kind: 'int', min: 3, max: 18 },
      b: { kind: 'choice', values: (v: Vars) => [Number(v.a) + 1] },
      c: { kind: 'choice', values: (v: Vars) => [Number(v.a) + 2] },
    },
    answer: () => 'სხვადასხვაგვერდა სამკუთხედი',
    format: { kind: 'text' },
    options: () => ['სხვადასხვაგვერდა სამკუთხედი', 'ტოლფერდა სამკუთხედი', 'ტოლგვერდა სამკუთხედი', 'მართკუთხა სამკუთხედი'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `გვერდებია ${vars.a}, ${vars.b}, ${vars.c} — სამივე განსხვავებულია, ამიტომ ეს არის ${answer}.`,
  }),

  // Q30 — ტოლგვერდა სამკუთხედის გვერდის პოვნა პერიმეტრით (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-30', subtopicId: 'u10-triangle-quadrilateral-classification', difficulty: 3 }),
    prompt: 'ტოლგვერდა სამკუთხედის პერიმეტრია {p} სმ. რას უდრის მისი თითოეული გვერდის სიგრძე?',
    variables: {
      side: { kind: 'int', min: 3, max: 16 },
      p: { kind: 'choice', values: (v: Vars) => [Number(v.side) * 3] },
    },
    answer: (v: Vars) => Number(v.side),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `ტოლგვერდა სამკუთხედს აქვს 3 ტოლი გვერდი: ${vars.p} ÷ 3 = ${answer} სმ.`,
  }),

  // =========================================================================
  // U10.6 — გვერდები, წვეროები, წიბოები და წახნაგები (Q31–Q36)
  // =========================================================================

  // Q31 — მრავალკუთხედის წვეროების რაოდენობა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-31', subtopicId: 'u10-sides-vertices-edges-faces', difficulty: 1 }),
    prompt: 'რამდენი წვერო აქვს {n}-კუთხედს?',
    variables: {
      n: { kind: 'int', min: 3, max: 15 },
    },
    answer: (v: Vars) => Number(v.n),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.n}-კუთხედს აქვს ზუსტად ${answer} წვერო.`,
  }),

  // Q32 — მრავალკუთხედის გვერდების რაოდენობა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-32', subtopicId: 'u10-sides-vertices-edges-faces', difficulty: 1 }),
    prompt: 'რამდენი გვერდი აქვს {n}-კუთხედს?',
    variables: {
      n: { kind: 'int', min: 3, max: 15 },
    },
    answer: (v: Vars) => Number(v.n),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.n}-კუთხედს აქვს ${answer} გვერდი.`,
  }),

  // Q33 — კუბის წიბოების რაოდენობა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-33', subtopicId: 'u10-sides-vertices-edges-faces', difficulty: 2 }),
    prompt: 'რამდენი წიბო აქვს {solid}-ს?',
    variables: {
      solid: { kind: 'choice', values: ['კუბს', 'მართკუთხა პარალელეპიპედს', 'ხის კუბს', 'ყუთს', 'სასაჩუქრე კუბს', 'პარალელეპიპედს', 'დიდ კუბს', 'პატარა კუბს', 'აგურს', 'სათამაშო კამათელს', 'საკლასო ყუთს', 'ფერად კუბს'] },
    },
    answer: () => 12,
    format: { kind: 'integer', min: 0 },
    distractors: () => [8, 6, 10],
    explanation: ({ vars, answer }) =>
      `${vars.solid} აქვს ზუსტად ${answer} წიბო.`,
  }),

  // Q34 — კუბის წვეროების რაოდენობა (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-34', subtopicId: 'u10-sides-vertices-edges-faces', difficulty: 2 }),
    prompt: 'რამდენი წვერო აქვს {solid}-ს?',
    variables: {
      solid: { kind: 'choice', values: ['კუბს', 'მართკუთხა პარალელეპიპედს', 'ხის კუბს', 'ყუთს', 'სასაჩუქრე კუბს', 'აგურს', 'სათამაშო კამათელს', 'დიდ კუბს', 'პატარა კუბს', 'საკლასო ყუთს', 'პარალელეპიპედს', 'ფერად კუბს'] },
    },
    answer: () => 8,
    format: { kind: 'integer', min: 0 },
    distractors: () => [6, 12, 4],
    explanation: ({ vars, answer }) =>
      `${vars.solid} აქვს ${answer} წვერო (4 ზედა და 4 ქვედა).`,
  }),

  // Q35 — ოთხკუთხა პირამიდის წახნაგები და წვეროები (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-35', subtopicId: 'u10-sides-vertices-edges-faces', difficulty: 3 }),
    prompt: 'რამდენი წახნაგი აქვს ოთხკუთხა პირამიდას? (შეკითხვა #{num})',
    variables: {
      num: { kind: 'int', min: 1, max: 14 },
    },
    answer: () => 5,
    format: { kind: 'integer', min: 0 },
    distractors: () => [4, 6, 8],
    explanation: () =>
      'ოთხკუთხა პირამიდას აქვს 1 ფუძე და 4 გვერდითი წახნაგი, სულ 5 წახნაგი.',
  }),

  // Q36 — კუბის ელემენტების ჯამი (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-36', subtopicId: 'u10-sides-vertices-edges-faces', difficulty: 3 }),
    prompt: 'რამდენია {solid}-ის წვეროებისა (8) და წახნაგების (6) რაოდენობის ჯამი?',
    variables: {
      solid: { kind: 'choice', values: ['კუბის', 'მართკუთხა პარალელეპიპედის', 'ხის კუბის', 'აგურის', 'სასაჩუქრე ყუთის', 'სათამაშო კამათლის', 'დიდი კუბის', 'პატარა ყუთის', 'კუბური ბლოკის', 'ფერადი ყუთის', 'სამშენებლო ბლოკის', 'საკლასო კუბის'] },
    },
    answer: () => 14,
    format: { kind: 'integer', min: 0 },
    distractors: () => [12, 16, 20],
    explanation: ({ answer }) =>
      `8 წვერო + 6 წახნაგი = ${answer}.`,
  }),

  // =========================================================================
  // U10.7 — პერიმეტრის გამოთვლა (Q37–Q42)
  // =========================================================================

  // Q37 — კვადრატის პერიმეტრი (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-37', subtopicId: 'u10-perimeter-calculations', difficulty: 1 }),
    prompt: 'კვადრატის გვერდის სიგრძეა {a} სმ. რას უდრის მისი პერიმეტრი?',
    variables: {
      a: { kind: 'int', min: 3, max: 25 },
    },
    answer: (v: Vars) => 4 * Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 4),
    explanation: ({ vars, answer }) =>
      `P = 4 × ${vars.a} = ${answer} სმ.`,
  }),

  // Q38 — მართკუთხედის პერიმეტრი (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-38', subtopicId: 'u10-perimeter-calculations', difficulty: 1 }),
    prompt: 'მართკუთხედის სიგრძეა {a} სმ, ხოლო სიგანე — {b} სმ. რას უდრის მისი პერიმეტრი?',
    variables: {
      a: { kind: 'int', min: 5, max: 20 },
      b: { kind: 'int', min: 2, max: 10 },
    },
    answer: (v: Vars) => 2 * (Number(v.a) + Number(v.b)),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 2),
    explanation: ({ vars, answer }) =>
      `P = 2 × (${vars.a} + ${vars.b}) = 2 × ${Number(vars.a) + Number(vars.b)} = ${answer} სმ.`,
  }),

  // Q39 — სამკუთხედის პერიმეტრი სამი გვერდით (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-39', subtopicId: 'u10-perimeter-calculations', difficulty: 2 }),
    prompt: 'სამკუთხედის გვერდების სიგრძეებია {a} სმ, {b} სმ და {c} სმ. იპოვე სამკუთხედის პერიმეტრი:',
    variables: {
      a: { kind: 'int', min: 5, max: 12 },
      b: { kind: 'int', min: 5, max: 12 },
      c: { kind: 'int', min: 5, max: 12 },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 2),
    explanation: ({ vars, answer }) =>
      `P = ${vars.a} + ${vars.b} + ${vars.c} = ${answer} სმ.`,
  }),

  // Q40 — კვადრატის გვერდის პოვნა პერიმეტრით (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-40', subtopicId: 'u10-perimeter-calculations', difficulty: 2 }),
    prompt: 'კვადრატის პერიმეტრია {p} სმ. რა სიგრძისაა მისი გვერდი?',
    variables: {
      a: { kind: 'int', min: 3, max: 20 },
      p: { kind: 'choice', values: (v: Vars) => [4 * Number(v.a)] },
    },
    answer: (v: Vars) => Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `კვადრატს აქვს 4 ტოლი გვერდი: ${vars.p} ÷ 4 = ${answer} სმ.`,
  }),

  // Q41 — მართკუთხედის უცნობი გვერდი პერიმეტრის მიხედვით (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-41', subtopicId: 'u10-perimeter-calculations', difficulty: 3 }),
    prompt: 'მართკუთხედის პერიმეტრია {p} სმ, ხოლო მისი სიგრძეა {a} სმ. რას უდრის მისი სიგანე?',
    variables: {
      a: { kind: 'int', min: 7, max: 20 },
      b: { kind: 'int', min: 2, max: 6 },
      p: { kind: 'choice', values: (v: Vars) => [2 * (Number(v.a) + Number(v.b))] },
    },
    answer: (v: Vars) => Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => {
      const semi = Number(vars.p) / 2;
      return `ნახევარპერიმეტრია ${vars.p} ÷ 2 = ${semi} სმ. სიგანეა ${semi} − ${vars.a} = ${answer} სმ.`;
    },
  }),

  // Q42 — ტოლგვერდა მრავალკუთხედის პერიმეტრი (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-42', subtopicId: 'u10-perimeter-calculations', difficulty: 3 }),
    prompt: 'წესიერი {n}-კუთხედის თითოეული გვერდი არის {a} სმ. რას უდრის მისი პერიმეტრი?',
    variables: {
      n: { kind: 'choice', values: [5, 6, 8] },
      a: { kind: 'int', min: 3, max: 12 },
    },
    answer: (v: Vars) => Number(v.n) * Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 5),
    explanation: ({ vars, answer }) =>
      `P = ${vars.n} × ${vars.a} = ${answer} სმ.`,
  }),

  // =========================================================================
  // U10.8 — კუთხეების კლასიფიკაცია (Q43–Q48)
  // =========================================================================

  // Q43 — კუთხის ტიპის განსაზღვრა გრადუსით (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-43', subtopicId: 'u10-angle-classification', difficulty: 1 }),
    prompt: '{deg} გრადუსის მქონე კუთხე არის:',
    variables: {
      deg: { kind: 'choice', values: [20, 35, 45, 60, 75, 90, 100, 115, 120, 135, 150, 160] },
    },
    answer: (v: Vars) => {
      const d = Number(v.deg);
      if (d === 90) return 'მართი კუთხე';
      if (d < 90) return 'მახვილი კუთხე';
      return 'ბლაგვი კუთხე';
    },
    format: { kind: 'text' },
    options: () => ['მართი კუთხე', 'მახვილი კუთხე', 'ბლაგვი კუთხე', 'გაშლილი კუთხე'],
    optionCount: 4,
    explanation: ({ vars, answer }) => {
      const d = Number(vars.deg);
      const reason = d === 90 ? '= 90°' : d < 90 ? '< 90°' : '> 90° და < 180°';
      return `${vars.deg}° არის ${reason}, ამიტომ ის არის ${answer}.`;
    },
  }),

  // Q44 — მახვილი კუთხის განსაზღვრება (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-44', subtopicId: 'u10-angle-classification', difficulty: 1 }),
    prompt: 'კუთხეს, რომელიც მართ კუთხეზე (90°-ზე) ნაკლებია (მაგალითად, {deg}°), ეწოდება:',
    variables: {
      deg: { kind: 'choice', values: [15, 25, 30, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85] },
    },
    answer: () => 'მახვილი კუთხე',
    format: { kind: 'text' },
    options: () => ['მახვილი კუთხე', 'მართი კუთხე', 'ბლაგვი კუთხე', 'გაშლილი კუთხე'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `რადგან ${vars.deg}° < 90°, ეს არის ${answer}.`,
  }),

  // Q45 — ბლაგვი კუთხის განსაზღვრება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-45', subtopicId: 'u10-angle-classification', difficulty: 2 }),
    prompt: 'კუთხეს, რომელიც მართ კუთხეზე (90°-ზე) მეტია და 180°-ზე ნაკლებია (მაგალითად, {deg}°), ეწოდება:',
    variables: {
      deg: { kind: 'choice', values: [95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 150, 160] },
    },
    answer: () => 'ბლაგვი კუთხე',
    format: { kind: 'text' },
    options: () => ['ბლაგვი კუთხე', 'მახვილი კუთხე', 'მართი კუთხე', 'გაშლილი კუთხე'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `რადგან ${vars.deg}° > 90°, ეს არის ${answer}.`,
  }),

  // Q46 — საათის ისრების კუთხე (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-46', subtopicId: 'u10-angle-classification', difficulty: 2 }),
    prompt: 'რა სახის კუთხეს ქმნის საათის ისრები ზუსტად {hour}:00 საათზე {variant}?',
    variables: {
      hour: { kind: 'choice', values: [1, 2, 3, 4, 5, 7, 8, 9, 10, 11] },
      variant: { kind: 'choice', values: ['(უმცირეს კუთხეს)', '(მცირე რკალზე)'] },
    },
    answer: (v: Vars) => {
      const h = Number(v.hour);
      if (h === 3 || h === 9) return 'მართი კუთხე';
      if (h === 1 || h === 2 || h === 10 || h === 11) return 'მახვილი კუთხე';
      return 'ბლაგვი კუთხე';
    },
    format: { kind: 'text' },
    options: () => ['მართი კუთხე', 'მახვილი კუთხე', 'ბლაგვი კუთხე', 'გაშლილი კუთხე'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.hour}:00 საათზე ისრებს შორის კუთხე არის ${answer}.`,
  }),

  // Q47 — კვადრატისა და მართკუთხედის კუთხეები (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-47', subtopicId: 'u10-angle-classification', difficulty: 3 }),
    prompt: '{shape}-ს ოთხივე კუთხე არის:',
    variables: {
      shape: { kind: 'choice', values: ['კვადრატს', 'მართკუთხედს', 'საკლასო ოთახის იატაკს', 'რვეულის ფურცელს', 'წიგნის ყდას', 'კარადის კარს', 'ფანჯრის ჩარჩოს', 'ტელევიზორის ეკრანს', 'საკლასო დაფას', 'მაგიდის ზედაპირს', 'სურათის ჩარჩოს', 'კედლის კალენდარს'] },
    },
    answer: () => 'მართი კუთხე',
    format: { kind: 'text' },
    options: () => ['მართი კუთხე', 'მახვილი კუთხე', 'ბლაგვი კუთხე', 'სხვადასხვა ზომის კუთხეები'],
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.shape} ოთხივე კუთხე არის 90 გრადუსიანი, ანუ ${answer}.`,
  }),

  // Q48 — მართი კუთხეების რაოდენობა ფიგურაში (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-48', subtopicId: 'u10-angle-classification', difficulty: 3 }),
    prompt: 'სულ რამდენი მართი კუთხე აქვს {shape}-ს?',
    variables: {
      shape: { kind: 'choice', values: ['მართკუთხედს', 'კვადრატს', 'ოთხკუთხა ჩარჩოს', 'რვეულის ყდას', 'საკლასო დაფას', 'კედლის სარკეს', 'მართკუთხა მაგიდას', 'მართკუთხა ფანჯარას', 'კვადრატულ ფილას', 'მართკუთხა ხალიჩას', 'კვადრატულ ბალიშს', 'მართკუთხა ბლოკნოტს'] },
    },
    answer: () => 4,
    format: { kind: 'integer', min: 0 },
    distractors: () => [2, 3, 5],
    explanation: ({ vars, answer }) =>
      `${vars.shape} აქვს ზუსტად ${answer} მართი კუთხე.`,
  }),

  // =========================================================================
  // U10.9 — წრფე, მონაკვეთი, სხივი და ურთიერთმდებარეობა (Q49–Q54)
  // =========================================================================

  // Q49 — მონაკვეთის განსაზღვრება (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-49', subtopicId: 'u10-lines-segments-rays', difficulty: 1 }),
    prompt: 'ხაზს, რომელსაც აქვს დასაწყისი წერტილიც და დასასრული წერტილიც (მაგალითად, {p1}{p2}), ეწოდება:',
    variables: {
      p1: { kind: 'choice', values: ['A', 'C', 'K', 'M'] },
      p2: { kind: 'choice', values: ['B', 'D', 'L', 'N'] },
    },
    answer: () => 'მონაკვეთი',
    format: { kind: 'text' },
    options: () => ['მონაკვეთი', 'სხივი', 'წრფე', 'ტეხილი'],
    optionCount: 4,
    explanation: ({ answer }) =>
      `ხაზს, რომელსაც ორივე ბოლო წერტილი აქვს, ეწოდება ${answer}.`,
  }),

  // Q50 — სხივის განსაზღვრება (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-50', subtopicId: 'u10-lines-segments-rays', difficulty: 1 }),
    prompt: 'ხაზს, რომელსაც აქვს სათავე ({start}), გადის {label} წერტილზე და უსასრულოდ გრძელდება ({start}{label}), ეწოდება:',
    variables: {
      start: { kind: 'choice', values: ['O', 'A', 'B', 'M', 'P', 'K'] },
      label: { kind: 'choice', values: ['X', 'Y', 'Z', 'C'] },
    },
    answer: () => 'სხივი',
    format: { kind: 'text' },
    options: () => ['სხივი', 'მონაკვეთი', 'წრფე', 'კუთხე'],
    optionCount: 4,
    explanation: ({ answer }) =>
      `ხაზს, რომელსაც აქვს ერთი საწყისი წერტილი და უსასრულოდ გრძელდება, ეწოდება ${answer}.`,
  }),

  // Q51 — წრფის განსაზღვრება (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-51', subtopicId: 'u10-lines-segments-rays', difficulty: 2 }),
    prompt: 'ხაზს, რომელსაც არც დასაწყისი აქვს და არც დასასრული (ორივე მხარეს უსასრულოდ გრძელდება წრფე {name}), ეწოდება:',
    variables: {
      name: { kind: 'choice', values: ['a', 'b', 'c', 'd', 'k', 'm', 'l', 'p', 's', 't', 'r', 'x'] },
    },
    answer: () => 'წრფე',
    format: { kind: 'text' },
    options: () => ['წრფე', 'სხივი', 'მონაკვეთი', 'ტეხილი'],
    optionCount: 4,
    explanation: ({ answer }) =>
      `უსასრულო სწორ ხაზს ორივე მიმართულებით ეწოდება ${answer}.`,
  }),

  // Q52 — პარალელური წრფეები (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-52', subtopicId: 'u10-lines-segments-rays', difficulty: 2 }),
    prompt: 'სიბრტყეზე მდებარე ორ წრფეს ({l1} და {l2}), რომლებიც არასდროს იკვეთება, ეწოდება:',
    variables: {
      l1: { kind: 'choice', values: ['a', 'k', 'm', 'p'] },
      l2: { kind: 'choice', values: ['b', 'n', 'l', 'q'] },
    },
    answer: () => 'პარალელური წრფეები',
    format: { kind: 'text' },
    options: () => ['პარალელური წრფეები', 'მართობული წრფეები', 'გადამკვეთი წრფეები', 'ტეხილი წრფეები'],
    optionCount: 4,
    explanation: ({ answer }) =>
      `წრფეებს, რომლებიც ერთ სიბრტყეზე არ იკვეთება, ეწოდება ${answer}.`,
  }),

  // Q53 — მართობული წრფეები (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-53', subtopicId: 'u10-lines-segments-rays', difficulty: 3 }),
    prompt: 'ორ გადამკვეთ წრფეს ({l1} და {l2}), რომლებიც გადაკვეთისას ქმნიან მართ (90°) კუთხეს, ეწოდება:',
    variables: {
      l1: { kind: 'choice', values: ['a', 'm', 'c', 'x'] },
      l2: { kind: 'choice', values: ['b', 'n', 'd', 'y'] },
    },
    answer: () => 'მართობული წრფეები',
    format: { kind: 'text' },
    options: () => ['მართობული წრფეები', 'პარალელური წრფეები', 'თანხვედრილი წრფეები', 'ირიბი წრფეები'],
    optionCount: 4,
    explanation: ({ answer }) =>
      `მართი კუთხით გადამკვეთ წრფეებს ეწოდება ${answer}.`,
  }),

  // Q54 — მონაკვეთზე მონიშნული წერტილები (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-54', subtopicId: 'u10-lines-segments-rays', difficulty: 3 }),
    prompt: 'მონაკვეთზე მონიშნეს {k} წერტილი (ბოლოების გარდა). რამდენ პატარა მონაკვეთად დაიყო ეს მონაკვეთი?',
    variables: {
      k: { kind: 'int', min: 2, max: 15 },
    },
    answer: (v: Vars) => Number(v.k) + 1,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.k} შიდა წერტილი მონაკვეთს ყოფს ${vars.k} + 1 = ${answer} ნაწილად.`,
  }),

  // =========================================================================
  // U10.10 — მრავალკუთხედები და ფიგურების შევსება (Q55–Q60)
  // =========================================================================

  // Q55 — მრავალკუთხედის სახელი გვერდების მიხედვით (Level 1, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-55', subtopicId: 'u10-polygons-shape-filling', difficulty: 1 }),
    prompt: 'გეომეტრიულ ფიგურას, რომელსაც აქვს {n} გვერდი და {n} კუთხე, ეწოდება {hint}:',
    variables: {
      n: { kind: 'choice', values: [3, 4, 5, 6, 7, 8, 9, 10] },
      hint: { kind: 'choice', values: ['(აირჩიე სწორი დასახელება)', '(მონიშნე სწორი ვარიანტი)'] },
    },
    answer: (v: Vars) => {
      const names: Record<number, string> = {
        3: 'სამკუთხედი',
        4: 'ოთხკუთხედი',
        5: 'ხუთკუთხედი',
        6: 'ექვსკუთხედი',
        7: 'შვიდკუთხედი',
        8: 'რვაკუთხედი',
        9: 'ცხრაკუთხედი',
        10: 'ათკუთხედი',
      };
      return names[Number(v.n)];
    },
    format: { kind: 'text' },
    options: (v: Vars) => {
      const n = Number(v.n);
      const names: Record<number, string> = {
        3: 'სამკუთხედი',
        4: 'ოთხკუთხედი',
        5: 'ხუთკუთხედი',
        6: 'ექვსკუთხედი',
        7: 'შვიდკუთხედი',
        8: 'რვაკუთხედი',
        9: 'ცხრაკუთხედი',
        10: 'ათკუთხედი',
      };
      const correct = names[n];
      const others = Object.values(names).filter((x) => x !== correct);
      return [correct, others[0], others[1], others[2]];
    },
    optionCount: 4,
    explanation: ({ vars, answer }) =>
      `${vars.n} გვერდის მქონე მრავალკუთხედს ეწოდება ${answer}.`,
  }),

  // Q56 — მრავალკუთხედის კუთხეების დათვლა (Level 1, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-56', subtopicId: 'u10-polygons-shape-filling', difficulty: 1 }),
    prompt: 'სულ რამდენი კუთხე აქვს {n}-კუთხედს?',
    variables: {
      n: { kind: 'int', min: 3, max: 15 },
    },
    answer: (v: Vars) => Number(v.n),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.n}-კუთხედს აქვს ზუსტად ${answer} კუთხე.`,
  }),

  // Q57 — ორი კვადრატის შეერთებით მიღებული მართკუთხედის პერიმეტრი (Level 2, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-57', subtopicId: 'u10-polygons-shape-filling', difficulty: 2 }),
    prompt: 'ორი ერთნაირი კვადრატი ({a} სმ გვერდით) გვერდიგვერდ შეაერთეს და მიიღეს მართკუთხედი. რას უდრის მიღებული მართკუთხედის პერიმეტრი?',
    variables: {
      a: { kind: 'int', min: 3, max: 15 },
    },
    answer: (v: Vars) => 6 * Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0, 6),
    explanation: ({ vars, answer }) => {
      const a = Number(vars.a);
      return `მიღებული მართკუთხედის სიგანეა ${a} სმ, სიგრძე — ${2 * a} სმ. P = 2 × (${a} + ${2 * a}) = ${answer} სმ.`;
    },
  }),

  // Q58 — ფიგურის დაყოფა (Level 2, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-58', subtopicId: 'u10-polygons-shape-filling', difficulty: 2 }),
    prompt: 'თუ კვადრატს ({size}) გავჭრით დიაგონალზე წვეროდან მოპირდაპირე წვერომდე, მივიღებთ ორ ერთნაირ:',
    variables: {
      size: { kind: 'choice', values: ['3×3 სმ', '4×4 სმ', '5×5 სმ', '6×6 სმ', '7×7 სმ', '8×8 სმ', '9×9 სმ', '10×10 სმ', '12×12 სმ', '15×15 სმ', '20×20 სმ', 'ნებისმიერი ზომის'] },
    },
    answer: () => 'მართკუთხა ტოლფერდა სამკუთხედს',
    format: { kind: 'text' },
    options: () => ['მართკუთხა ტოლფერდა სამკუთხედს', 'ტოლგვერდა სამკუთხედს', 'მართკუთხედს', 'ტრაპეციას'],
    optionCount: 4,
    explanation: () =>
      'კვადრატის დიაგონალი მას ყოფს ორ მართკუთხა ტოლფერდა სამკუთხედად.',
  }),

  // Q59 — მართკუთხედის შევსება პატარა კვადრატებით (Level 3, Integer)
  defineTemplate({
    ...addr({ id: 'g3-u10-59', subtopicId: 'u10-polygons-shape-filling', difficulty: 3 }),
    prompt: '{w} სმ სიგანისა და {h} სმ სიგრძის მართკუთხედი დაფარეს {s} სმ გვერდის მქონე კვადრატებით. სულ რამდენი ასეთი კვადრატი დაეტია?',
    variables: {
      s: { kind: 'choice', values: [2, 3] },
      k1: { kind: 'int', min: 2, max: 5 },
      k2: { kind: 'int', min: 2, max: 5 },
      w: { kind: 'choice', values: (v: Vars) => [Number(v.s) * Number(v.k1)] },
      h: { kind: 'choice', values: (v: Vars) => [Number(v.s) * Number(v.k2)] },
    },
    answer: (v: Vars) => Number(v.k1) * Number(v.k2),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) => {
      const k1 = Number(vars.k1);
      const k2 = Number(vars.k2);
      return `სიგანეზე ეტევა ${vars.w} ÷ ${vars.s} = ${k1} კვადრატი, სიგრძეზე — ${vars.h} ÷ ${vars.s} = ${k2} კვადრატი. სულ: ${k1} × ${k2} = ${answer} კვადრატი.`;
    },
  }),

  // Q60 — წესიერი მრავალკუთხედის ცნება (Level 3, Choice)
  defineTemplate({
    ...addr({ id: 'g3-u10-60', subtopicId: 'u10-polygons-shape-filling', difficulty: 3 }),
    prompt: 'მრავალკუთხედს, რომლის ყველა გვერდი და ყველა კუთხე ტოლია (მაგალითად, {shape}), ეწოდება:',
    variables: {
      shape: { kind: 'choice', values: ['ტოლგვერდა სამკუთხედი', 'კვადრატი', 'წესიერი ხუთკუთხედი', 'წესიერი ექვსკუთხედი', 'წესიერი რვაკუთხედი', 'წესიერი ათკუთხედი', 'ტოლგვერდა 3-კუთხედი', 'ტოლგვერდა 4-კუთხედი (კვადრატი)', 'ტოლგვერდა 5-კუთხედი', 'ტოლგვერდა 6-კუთხედი', 'ტოლგვერდა 7-კუთხედი', 'ტოლგვერდა 8-კუთხედი'] },
    },
    answer: () => 'წესიერი მრავალკუთხედი',
    format: { kind: 'text' },
    options: () => ['წესიერი მრავალკუთხედი', 'არაწესიერი მრავალკუთხედი', 'ბრტყელი ოთხკუთხედი', 'ამოზნექილი ტეხილი'],
    optionCount: 4,
    explanation: ({ answer }) =>
      `თუ მრავალკუთხედს ყველა გვერდი და კუთხე ტოლი აქვს, ის არის ${answer}.`,
  }),
];
