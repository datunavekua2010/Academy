import { defineTemplate, QuestionTemplate } from './types';

/**
 * Grade 2 — Unit 04: ორნიშნა რიცხვების შეკრება (Two-Digit Addition)
 *
 * Covers 10 subtopics:
 *   U04.1 — ათეულების შეკრება (Q01–Q06)
 *   U04.2 — ორნიშნა რიცხვების შეკრება გადაჯგუფების გარეშე (Q07–Q12)
 *   U04.3 — ორნიშნა რიცხვების შეკრება გადაჯგუფებით (Q13–Q18)
 *   U04.4 — შეკრების ცხრილი 100-ის ფარგლებში (Q19–Q24)
 *   U04.5 — რიცხვის სხვადასხვა შესაკრებად წარმოდგენა (Q25–Q30)
 *   U04.6 — სურათიდან გამოსახულებისა და ამოცანის შედგენა (Q31–Q36)
 *   U04.7 — გამოტოვებული შესაკრები (Q37–Q42)
 *   U04.8 — ჯამების შედარება (Q43–Q48)
 *   U04.9 — სამი ან მეტი რიცხვის შეკრება (Q49–Q54, Q61–Q64)
 *   U04.10 — გამოტოვებული ციფრები შეკრების ტოლობაში (Q55–Q60)
 */

export const G2_U04_SUBTOPICS = [
  'u04-adding-tens',
  'u04-without-regrouping',
  'u04-with-regrouping',
  'u04-addition-table-100',
  'u04-ways-to-make-number',
  'u04-word-problems-expressions',
  'u04-missing-addend',
  'u04-comparing-examples',
  'u04-adding-three-numbers',
  'u04-missing-digits',
] as const;

export type G2U04SubtopicId = (typeof G2_U04_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G2U04SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 2 as const,
  topicId: 'g2-ornishna-sekreba' as const,
  unitId: 'g2-ornishna-sekreba' as const,
  ...options,
});

/** Helper to generate distinct integer distractors near an answer. */
export function nearMisses(answer: number, count = 3, min = 0, step = 1): number[] {
  const result = new Set<number>();
  const deltas = [step, -step, 2 * step, -2 * step, 3 * step, -3 * step, 10, -10, 5, -5];
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

/** Helper to repeat an emoji count times. */
export function repeatEmoji(emoji: string, count: number): string {
  if (count <= 0) return '';
  return Array.from({ length: count }, () => emoji).join(' ');
}

export const G2_U04_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U04.1 — ათეულების შეკრება (u04-adding-tens)
  // =========================================================================

  // Q01: დონე 1 | ორი ათეულის შეკრება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-01', subtopicId: 'u04-adding-tens', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b} = ?',
    variables: {
      tensA: { kind: 'int', min: 1, max: 7 },
      tensB: { kind: 'int', min: 1, max: (v) => 9 - Number(v.tensA) },
      a: { kind: 'choice', values: (v) => [Number(v.tensA) * 10] },
      b: { kind: 'choice', values: (v) => [Number(v.tensB) * 10] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) =>
      `${vars.a} არის ${Number(vars.a) / 10} ათეული, ${vars.b} არის ${Number(vars.b) / 10} ათეული. სულ არის ${Number(answer) / 10} ათეული, ანუ ${answer}.`,
  }),

  // Q02: დონე 1 | ათეულების შეკრება (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-02', subtopicId: 'u04-adding-tens', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b}',
    variables: {
      tensA: { kind: 'int', min: 1, max: 8 },
      tensB: { kind: 'int', min: 1, max: (v) => 10 - Number(v.tensA) },
      a: { kind: 'choice', values: (v) => [Number(v.tensA) * 10] },
      b: { kind: 'choice', values: (v) => [Number(v.tensB) * 10] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q03: დონე 2 | ათეულების მოდელი (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-03', subtopicId: 'u04-adding-tens', difficulty: 2 }),
    prompt: 'სურათზე ნაჩვენებია {tensA} ათეული და {tensB} ათეული:\nპირველი ჯგუფი: {visA}\nმეორე ჯგუფი: {visB}\nრამდენია სულ?',
    variables: {
      tensA: { kind: 'int', min: 1, max: 5 },
      tensB: { kind: 'int', min: 1, max: 4 },
      visA: { kind: 'choice', values: (v) => [repeatEmoji('📦', Number(v.tensA))] },
      visB: { kind: 'choice', values: (v) => [repeatEmoji('📦', Number(v.tensB))] },
    },
    answer: (v) => (Number(v.tensA) + Number(v.tensB)) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) =>
      `თითოეული შეკვრა 📦 აღნიშნავს 10-ს. ${vars.tensA} ათეული და ${vars.tensB} ათეული ერთად არის ${Number(vars.tensA) + Number(vars.tensB)} ათეული = ${answer}.`,
  }),

  // Q04: დონე 2 | გამოტოვებული ათეული (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-04', subtopicId: 'u04-adding-tens', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {a} + ___ = {s}',
    variables: {
      tensA: { kind: 'int', min: 1, max: 6 },
      tensDiff: { kind: 'int', min: 1, max: (v) => 9 - Number(v.tensA) },
      a: { kind: 'choice', values: (v) => [Number(v.tensA) * 10] },
      diff: { kind: 'choice', values: (v) => [Number(v.tensDiff) * 10] },
      s: { kind: 'choice', values: (v) => [(Number(v.tensA) + Number(v.tensDiff)) * 10] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) =>
      `გამოტოვებული შესაკრებია: ${vars.s} − ${vars.a} = ${answer}.`,
  }),

  // Q05: დონე 3 | ათეულების ჯამის შედარება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-05', subtopicId: 'u04-adding-tens', difficulty: 3 }),
    prompt: 'რომელი ჯამია მეტი: {sumA_label} თუ {sumB_label}?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '20 + 30;10 + 50;50;60;10 + 50',
          '40 + 20;30 + 40;60;70;30 + 40',
          '50 + 20;30 + 30;70;60;50 + 20',
          '60 + 20;40 + 30;80;70;60 + 20',
          '30 + 20;20 + 40;50;60;20 + 40',
          '70 + 10;50 + 40;80;90;50 + 40',
          '40 + 40;20 + 50;80;70;40 + 40',
          '10 + 70;30 + 60;80;90;30 + 60',
          '50 + 30;40 + 50;80;90;40 + 50',
          '30 + 50;20 + 50;80;70;30 + 50',
          '60 + 30;50 + 30;90;80;60 + 30',
          '20 + 70;40 + 40;90;80;20 + 70',
          '10 + 40;20 + 20;50;40;10 + 40',
          '50 + 10;30 + 40;60;70;30 + 40',
        ],
      },
      sumA_label: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      sumB_label: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      valA: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      valB: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[3])] },
      greater: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.greater),
    format: { kind: 'text' },
    optionCount: 3,
    options: (vars) => [String(vars.sumA_label), String(vars.sumB_label), 'ტოლია'],
    explanation: ({ vars, answer }) =>
      `${vars.sumA_label} = ${vars.valA}, ხოლო ${vars.sumB_label} = ${vars.valB}. აქედან მეტია: ${answer}.`,
  }),

  // Q06: დონე 3 | ათეულების შეკრება ცხრილში (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-06', subtopicId: 'u04-adding-tens', difficulty: 3 }),
    prompt: 'ცხრილში მოცემულია {tensA} ათეული და {tensB} ათეული. ჩაწერე მათი ჯამი ერთეულებით.',
    variables: {
      tensA: { kind: 'int', min: 2, max: 6 },
      tensB: { kind: 'int', min: 2, max: (v) => 9 - Number(v.tensA) },
    },
    answer: (v) => (Number(v.tensA) + Number(v.tensB)) * 10,
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 10, 10),
    explanation: ({ vars, answer }) =>
      `${vars.tensA} ათეული = ${Number(vars.tensA) * 10}, ${vars.tensB} ათეული = ${Number(vars.tensB) * 10}. ჯამია: ${Number(vars.tensA) * 10} + ${Number(vars.tensB) * 10} = ${answer}.`,
  }),

  // =========================================================================
  // U04.2 — ორნიშნა რიცხვების შეკრება გადაჯგუფების გარეშე (u04-without-regrouping)
  // =========================================================================

  // Q07: დონე 1 | მარტივი შეკრება (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-07', subtopicId: 'u04-without-regrouping', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b} = ?',
    variables: {
      tensA: { kind: 'int', min: 1, max: 5 },
      onesA: { kind: 'int', min: 1, max: 4 },
      tensB: { kind: 'int', min: 1, max: 4 },
      onesB: { kind: 'int', min: 1, max: (v) => 9 - Number(v.onesA) },
      a: { kind: 'choice', values: (v) => [Number(v.tensA) * 10 + Number(v.onesA)] },
      b: { kind: 'choice', values: (v) => [Number(v.tensB) * 10 + Number(v.onesB)] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `ათეულები: ${vars.tensA} + ${vars.tensB} = ${Number(vars.tensA) + Number(vars.tensB)} ათეული (${(Number(vars.tensA) + Number(vars.tensB)) * 10}). ერთეულები: ${vars.onesA} + ${vars.onesB} = ${Number(vars.onesA) + Number(vars.onesB)}. სულ: ${answer}.`,
  }),

  // Q08: დონე 1 | ათეულებისა და ერთეულების შეკრება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-08', subtopicId: 'u04-without-regrouping', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b}',
    variables: {
      tensA: { kind: 'int', min: 1, max: 5 },
      onesA: { kind: 'int', min: 1, max: 4 },
      tensB: { kind: 'int', min: 1, max: 4 },
      onesB: { kind: 'int', min: 1, max: (v) => 9 - Number(v.onesA) },
      a: { kind: 'choice', values: (v) => [Number(v.tensA) * 10 + Number(v.onesA)] },
      b: { kind: 'choice', values: (v) => [Number(v.tensB) * 10 + Number(v.onesB)] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q09: დონე 2 | შეკრება მოდელით (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-09', subtopicId: 'u04-without-regrouping', difficulty: 2 }),
    prompt: 'სურათზე პირველი რიცხვია {a} ({visA}), მას ემატება {b} ({visB}). რამდენია ჯამი?',
    variables: {
      tensA: { kind: 'int', min: 1, max: 4 },
      onesA: { kind: 'int', min: 1, max: 4 },
      tensB: { kind: 'int', min: 1, max: 4 },
      onesB: { kind: 'int', min: 1, max: (v) => 9 - Number(v.onesA) },
      a: { kind: 'choice', values: (v) => [Number(v.tensA) * 10 + Number(v.onesA)] },
      b: { kind: 'choice', values: (v) => [Number(v.tensB) * 10 + Number(v.onesB)] },
      visA: { kind: 'choice', values: (v) => [`${v.tensA} ათ. და ${v.onesA} ერთ.`] },
      visB: { kind: 'choice', values: (v) => [`${v.tensB} ათ. და ${v.onesB} ერთ.`] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `ჯამში გვაქვს ${Number(vars.tensA) + Number(vars.tensB)} ათეული და ${Number(vars.onesA) + Number(vars.onesB)} ერთეული, რაც შეადგენს ${answer}-ს.`,
  }),

  // Q10: დონე 2 | გამოტოვებული შესაკრები (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-10', subtopicId: 'u04-without-regrouping', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {a} + ___ = {s}',
    variables: {
      tensA: { kind: 'int', min: 1, max: 4 },
      onesA: { kind: 'int', min: 1, max: 4 },
      tensX: { kind: 'int', min: 1, max: 4 },
      onesX: { kind: 'int', min: 1, max: (v) => 9 - Number(v.onesA) },
      a: { kind: 'choice', values: (v) => [Number(v.tensA) * 10 + Number(v.onesA)] },
      x: { kind: 'choice', values: (v) => [Number(v.tensX) * 10 + Number(v.onesX)] },
      s: { kind: 'choice', values: (v) => [(Number(v.tensA) + Number(v.tensX)) * 10 + Number(v.onesA) + Number(v.onesX)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `გამოტოვებული შესაკრებია: ${vars.s} − ${vars.a} = ${answer}.`,
  }),

  // Q11: დონე 3 | შეცდომის აღმოჩენა (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-11', subtopicId: 'u04-without-regrouping', difficulty: 3 }),
    prompt: 'მოსწავლემ გამოთვალა: {a} + {b} = {wrong}. რომელია სწორი პასუხი?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '41;26;77;67',
          '32;24;66;56',
          '53;14;77;67',
          '25;32;47;57',
          '44;23;77;67',
          '35;12;57;47',
          '21;45;76;66',
          '52;34;96;86',
          '63;25;98;88',
          '42;36;88;78',
          '31;54;95;85',
          '24;43;77;67',
          '16;52;78;68',
          '33;25;68;58',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[1])] },
      wrong: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      correct: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[3])] },
    },
    answer: (v) => Number(v.correct),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars, answer }) => [
      Number(vars.wrong),
      Number(answer) + 1,
      Number(answer) - 1,
    ],
    explanation: ({ vars, answer }) =>
      `სწორი ჯამია ${vars.a} + ${vars.b} = ${answer}. მოსწავლემ შეცდომით გამოთვალა ${vars.wrong}.`,
  }),

  // Q12: დონე 3 | ორი ჯამის შედარება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-12', subtopicId: 'u04-without-regrouping', difficulty: 3 }),
    prompt: 'შეადარე: {sumA_label} და {sumB_label}. რომელი შედეგია მეტი?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '23 + 14;21 + 18;37;39;21 + 18',
          '32 + 25;41 + 14;57;55;32 + 25',
          '42 + 13;31 + 26;55;57;31 + 26',
          '51 + 23;42 + 34;74;76;42 + 34',
          '34 + 21;25 + 32;55;57;25 + 32',
          '62 + 15;53 + 23;77;76;62 + 15',
          '24 + 31;13 + 41;55;54;24 + 31',
          '45 + 22;33 + 35;67;68;33 + 35',
          '52 + 16;41 + 28;68;69;41 + 28',
          '36 + 21;42 + 14;57;56;36 + 21',
          '27 + 31;15 + 44;58;59;15 + 44',
          '43 + 24;32 + 36;67;68;32 + 36',
          '54 + 23;61 + 17;77;78;61 + 17',
          '31 + 25;22 + 33;56;55;31 + 25',
        ],
      },
      sumA_label: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      sumB_label: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      valA: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      valB: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[3])] },
      greater: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.greater),
    format: { kind: 'text' },
    optionCount: 3,
    options: (vars) => [String(vars.sumA_label), String(vars.sumB_label), 'ტოლია'],
    explanation: ({ vars, answer }) =>
      `${vars.sumA_label} = ${vars.valA}, ხოლო ${vars.sumB_label} = ${vars.valB}. აქედან მეტია: ${answer}.`,
  }),

  // =========================================================================
  // U04.3 — ორნიშნა რიცხვების შეკრება გადაჯგუფებით (u04-with-regrouping)
  // =========================================================================

  // Q13: დონე 1 | შეკრება გადაჯგუფებით (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-13', subtopicId: 'u04-with-regrouping', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b} = ?',
    variables: {
      tensA: { kind: 'int', min: 1, max: 4 },
      onesA: { kind: 'int', min: 5, max: 9 },
      tensB: { kind: 'int', min: 1, max: 4 },
      onesB: { kind: 'int', min: (v) => 10 - Number(v.onesA), max: 9 },
      a: { kind: 'choice', values: (v) => [Number(v.tensA) * 10 + Number(v.onesA)] },
      b: { kind: 'choice', values: (v) => [Number(v.tensB) * 10 + Number(v.onesB)] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `ერთეულები: ${vars.onesA} + ${vars.onesB} = ${Number(vars.onesA) + Number(vars.onesB)} (1 ათეული და ${(Number(vars.onesA) + Number(vars.onesB)) % 10} ერთეული). ათეულები: ${vars.tensA} + ${vars.tensB} + 1 = ${Number(vars.tensA) + Number(vars.tensB) + 1} ათეული. ჯამია: ${answer}.`,
  }),

  // Q14: დონე 1 | ერთეულების გადაჯგუფება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-14', subtopicId: 'u04-with-regrouping', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b}',
    variables: {
      tensA: { kind: 'int', min: 1, max: 4 },
      onesA: { kind: 'int', min: 6, max: 9 },
      tensB: { kind: 'int', min: 1, max: 4 },
      onesB: { kind: 'int', min: (v) => 10 - Number(v.onesA), max: 9 },
      a: { kind: 'choice', values: (v) => [Number(v.tensA) * 10 + Number(v.onesA)] },
      b: { kind: 'choice', values: (v) => [Number(v.tensB) * 10 + Number(v.onesB)] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => [
      Number(answer) - 10,
      Number(answer) + 1,
      Number(answer) - 1,
    ],
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q15: დონე 2 | შეკრება ათეულებისა და ერთეულების მიხედვით (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-15', subtopicId: 'u04-with-regrouping', difficulty: 2 }),
    prompt: '{a} + {b}-ის გამოთვლისას ერთეულების ჯამია {sumOnes}. რამდენი ათეული გადადის ათეულების სვეტში?',
    variables: {
      onesA: { kind: 'int', min: 5, max: 9 },
      onesB: { kind: 'int', min: (v) => 10 - Number(v.onesA), max: 9 },
      tensA: { kind: 'int', min: 1, max: 4 },
      tensB: { kind: 'int', min: 1, max: 4 },
      a: { kind: 'choice', values: (v) => [Number(v.tensA) * 10 + Number(v.onesA)] },
      b: { kind: 'choice', values: (v) => [Number(v.tensB) * 10 + Number(v.onesB)] },
      sumOnes: { kind: 'choice', values: (v) => [Number(v.onesA) + Number(v.onesB)] },
    },
    answer: () => '1 ათეული',
    format: { kind: 'text' },
    distractors: () => ['0 ათეული', '2 ათეული', '10 ათეული'],
    explanation: ({ vars }) =>
      `ერთეულების ჯამია ${vars.sumOnes}, რაც არის 1 ათეული და ${Number(vars.sumOnes) - 10} ერთეული. ამიტომ ათეულების სვეტში გადადის 1 ათეული.`,
  }),

  // Q16: დონე 2 | გამოტოვებული შესაკრები (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-16', subtopicId: 'u04-with-regrouping', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {a} + ___ = {s}',
    variables: {
      tensA: { kind: 'int', min: 1, max: 4 },
      onesA: { kind: 'int', min: 5, max: 9 },
      tensX: { kind: 'int', min: 1, max: 3 },
      onesX: { kind: 'int', min: (v) => 10 - Number(v.onesA), max: 9 },
      a: { kind: 'choice', values: (v) => [Number(v.tensA) * 10 + Number(v.onesA)] },
      x: { kind: 'choice', values: (v) => [Number(v.tensX) * 10 + Number(v.onesX)] },
      s: { kind: 'choice', values: (v) => [(Number(v.tensA) + Number(v.tensX) + 1) * 10 + ((Number(v.onesA) + Number(v.onesX)) % 10)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `გამოტოვებული შესაკრებია: ${vars.s} − ${vars.a} = ${answer}.`,
  }),

  // Q17: დონე 3 | სურათიდან შეკრება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-17', subtopicId: 'u04-with-regrouping', difficulty: 3 }),
    prompt: 'სურათზე მოცემულია ორი რიცხვი:\nპირველი: {a} ({tensA} ათ. და {onesA} ერთ.)\nმეორე: {b} ({tensB} ათ. და {onesB} ერთ.)\nრამდენია მათი ჯამი გადაჯგუფებით?',
    variables: {
      tensA: { kind: 'int', min: 1, max: 4 },
      onesA: { kind: 'int', min: 6, max: 9 },
      tensB: { kind: 'int', min: 1, max: 4 },
      onesB: { kind: 'int', min: (v) => 10 - Number(v.onesA), max: 9 },
      a: { kind: 'choice', values: (v) => [Number(v.tensA) * 10 + Number(v.onesA)] },
      b: { kind: 'choice', values: (v) => [Number(v.tensB) * 10 + Number(v.onesB)] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.onesA} + ${vars.onesB} = ${Number(vars.onesA) + Number(vars.onesB)} ერთეული, რაც 1 ათეულს უმატებს ათეულებს. სულ: ${answer}.`,
  }),

  // Q18: დონე 3 | გადაჯგუფების შემოწმება (ჭეშმარიტი/მცდარი)
  defineTemplate({
    ...addr({ id: 'g2-u04-18', subtopicId: 'u04-with-regrouping', difficulty: 3 }),
    prompt: 'სწორია თუ მცდარი ტოლობა: {a} + {b} = {shown}?',
    variables: {
      tensA: { kind: 'int', min: 1, max: 4 },
      onesA: { kind: 'int', min: 6, max: 9 },
      tensB: { kind: 'int', min: 1, max: 4 },
      onesB: { kind: 'int', min: (v) => 10 - Number(v.onesA), max: 9 },
      delta: { kind: 'choice', values: [0, 10, -10, 1] },
      a: { kind: 'choice', values: (v) => [Number(v.tensA) * 10 + Number(v.onesA)] },
      b: { kind: 'choice', values: (v) => [Number(v.tensB) * 10 + Number(v.onesB)] },
      shown: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b) + Number(v.delta)] },
    },
    answer: (v) => (Number(v.delta) === 0 ? 'სწორია' : 'მცდარია'),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => (answer === 'სწორია' ? ['მცდარია'] : ['სწორია']),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, ამიტომ მოცემული ტოლობა ${answer}.`,
  }),

  // =========================================================================
  // U04.4 — შეკრების ცხრილი 100-ის ფარგლებში (u04-addition-table-100)
  // =========================================================================

  // Q19: დონე 1 | ცხრილის უჯრის პოვნა (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-19', subtopicId: 'u04-addition-table-100', difficulty: 1 }),
    prompt: 'შეკრების ცხრილში სტრიქონის სათაურია {r}, სვეტის სათაურია {c}. იპოვე მათი გადაკვეთის უჯრის ჯამი.',
    variables: {
      r: { kind: 'int', min: 10, max: 50 },
      c: { kind: 'int', min: 10, max: 40 },
    },
    answer: (v) => Number(v.r) + Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `გადაკვეთის უჯრაში იწერება სტრიქონისა და სვეტის ჯამი: ${vars.r} + ${vars.c} = ${answer}.`,
  }),

  // Q20: დონე 1 | გამოტოვებული უჯრა (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-20', subtopicId: 'u04-addition-table-100', difficulty: 1 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი შეკრების ცხრილში:\n+ | {c1} | {c2}\n{r1} | {sum11} | {sum12}\n{r2} | {sum21} | ___',
    variables: {
      r1: { kind: 'choice', values: [20, 30, 40] },
      r2: { kind: 'choice', values: [30, 40, 50] },
      c1: { kind: 'choice', values: [10, 20] },
      c2: { kind: 'choice', values: [20, 30] },
      sum11: { kind: 'choice', values: (v) => [Number(v.r1) + Number(v.c1)] },
      sum12: { kind: 'choice', values: (v) => [Number(v.r1) + Number(v.c2)] },
      sum21: { kind: 'choice', values: (v) => [Number(v.r2) + Number(v.c1)] },
    },
    constraints: [{ test: (v) => Number(v.r1) !== Number(v.r2), note: 'different rows' }],
    answer: (v) => Number(v.r2) + Number(v.c2),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `გამოტოვებული უჯრა შეესაბამება სტრიქონს ${vars.r2} და სვეტს ${vars.c2}. ჯამია: ${vars.r2} + ${vars.c2} = ${answer}.`,
  }),

  // Q21: დონე 2 | ცხრილის გამოყენება (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-21', subtopicId: 'u04-addition-table-100', difficulty: 2 }),
    prompt: 'შეკრების ცხრილის მიხედვით, გამოთვალე: {a} + {b}',
    variables: {
      a: { kind: 'int', min: 15, max: 55 },
      b: { kind: 'int', min: 10, max: 40 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q22: დონე 2 | ცხრილის წესის ამოცნობა (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-22', subtopicId: 'u04-addition-table-100', difficulty: 2 }),
    prompt: 'შეკრების ცხრილში, თუ სვეტის სათაური {step}-ით იზრდება, როგორ იცვლება იმავე მწკრივის ჯამი?',
    variables: {
      step: { kind: 'choice', values: [10, 20, 5] },
    },
    answer: (v) => `${v.step}-ით იზრდება`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.step}-ით მცირდება`,
      'არ იცვლება',
      `${Number(vars.step) * 2}-ით იზრდება`,
    ],
    explanation: ({ vars }) =>
      `რადგან ჯამი შესაკრებებისგან შედგება, ერთ-ერთი შესაკრების ${vars.step}-ით გაზრდა ჯამსაც ზუსტად ${vars.step}-ით გაზრდის.`,
  }),

  // Q23: დონე 3 | გამოტოვებული სათაური (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-23', subtopicId: 'u04-addition-table-100', difficulty: 3 }),
    prompt: 'შეკრების ცხრილში მწკრივის სათაურია {a}, ხოლო უჯრაში წერია ჯამი {s}. რა არის გამოტოვებული სვეტის სათაური?',
    variables: {
      a: { kind: 'int', min: 15, max: 55 },
      col: { kind: 'int', min: 10, max: 40 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.col)] },
    },
    answer: (v) => Number(v.col),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `სვეტის სათაური გამოითვლება ჯამს გამოკლებული მწკრივი: ${vars.s} − ${vars.a} = ${answer}.`,
  }),

  // Q24: დონე 3 | ცხრილში ჯამების შედარება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-24', subtopicId: 'u04-addition-table-100', difficulty: 3 }),
    prompt: 'შეკრების ცხრილის მიხედვით, რომელი ჯამია მეტი: {sumA_label} თუ {sumB_label}?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '25 + 30;20 + 40;55;60;20 + 40',
          '35 + 20;30 + 30;55;60;30 + 30',
          '45 + 15;40 + 25;60;65;40 + 25',
          '50 + 25;45 + 35;75;80;45 + 35',
          '30 + 45;40 + 30;75;70;30 + 45',
          '25 + 50;35 + 35;75;70;25 + 50',
          '15 + 60;20 + 50;75;70;15 + 60',
          '35 + 40;25 + 45;75;70;35 + 40',
          '40 + 45;50 + 40;85;90;50 + 40',
          '55 + 20;45 + 35;75;80;45 + 35',
          '60 + 25;50 + 40;85;90;50 + 40',
          '35 + 35;20 + 45;70;65;35 + 35',
        ],
      },
      sumA_label: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      sumB_label: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      valA: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      valB: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[3])] },
      greater: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.greater),
    format: { kind: 'text' },
    optionCount: 3,
    options: (vars) => [String(vars.sumA_label), String(vars.sumB_label), 'ტოლია'],
    explanation: ({ vars, answer }) =>
      `${vars.sumA_label} = ${vars.valA}, ხოლო ${vars.sumB_label} = ${vars.valB}. აქედან მეტია: ${answer}.`,
  }),

  // =========================================================================
  // U04.5 — რიცხვის სხვადასხვა შესაკრებად წარმოდგენა (u04-ways-to-make-number)
  // =========================================================================

  // Q25: დონე 1 | რიცხვის დაშლა ორ შესაკრებად (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-25', subtopicId: 'u04-ways-to-make-number', difficulty: 1 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {n} = {a} + ___',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      ones: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.tens) * 10 + Number(v.ones)] },
      a: { kind: 'choice', values: (v) => [Number(v.tens) * 10] },
    },
    answer: (v) => Number(v.ones),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.n} შედგება ${vars.a}-ისა და ${answer}-ისგან: ${vars.n} = ${vars.a} + ${answer}.`,
  }),

  // Q26: დონე 1 | ათეულებისა და ერთეულების სახით (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-26', subtopicId: 'u04-ways-to-make-number', difficulty: 1 }),
    prompt: 'რომელი გამოსახულება უდრის {n}-ს?',
    variables: {
      tens: { kind: 'int', min: 2, max: 8 },
      ones: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.tens) * 10 + Number(v.ones)] },
      tensPart: { kind: 'choice', values: (v) => [Number(v.tens) * 10] },
    },
    answer: (v) => `${v.tensPart} + ${v.ones}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${Number(vars.tensPart) + 10} + ${vars.ones}`,
      `${Number(vars.tensPart) - 10} + ${vars.ones}`,
      `${vars.tensPart} + ${Number(vars.ones) + 1}`,
    ],
    explanation: ({ vars, answer }) =>
      `${vars.n} იშლება როგორც ${vars.tens} ათეული (${vars.tensPart}) და ${vars.ones} ერთეული: ${answer}.`,
  }),

  // Q27: დონე 2 | რამდენიმე დაშლა (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-27', subtopicId: 'u04-ways-to-make-number', difficulty: 2 }),
    prompt: 'ჩამოთვლილთაგან რომელი გამოსახულების ჯამია {n}?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '45;20 + 25;20 + 20;30 + 10;15 + 20',
          '56;30 + 26;30 + 20;25 + 25;40 + 10',
          '64;40 + 24;30 + 24;50 + 10;40 + 20',
          '72;50 + 22;40 + 22;50 + 20;60 + 10',
          '38;20 + 18;10 + 18;20 + 15;30 + 5',
          '49;30 + 19;20 + 19;30 + 15;40 + 5',
          '58;35 + 23;30 + 23;40 + 15;35 + 20',
          '67;40 + 27;30 + 27;50 + 12;40 + 20',
          '75;50 + 25;40 + 25;50 + 20;60 + 12',
          '83;60 + 23;50 + 23;60 + 20;70 + 10',
          '92;70 + 22;60 + 22;70 + 20;80 + 10',
          '36;18 + 18;15 + 18;20 + 14;25 + 10',
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
    explanation: ({ vars, answer }) => `${answer} = ${vars.n}.`,
  }),

  // Q28: დონე 2 | გამოტოვებული შესაკრები (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-28', subtopicId: 'u04-ways-to-make-number', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული შესაკრები: {n} = {a} + ___',
    variables: {
      n: { kind: 'int', min: 30, max: 90 },
      a: { kind: 'int', min: 11, max: (v) => Number(v.n) - 5 },
    },
    answer: (v) => Number(v.n) - Number(v.a),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `გამოტოვებული შესაკრებია: ${vars.n} − ${vars.a} = ${answer}.`,
  }),

  // Q29: დონე 3 | ორი განსხვავებული გზა (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-29', subtopicId: 'u04-ways-to-make-number', difficulty: 3 }),
    prompt: 'რომელი წყვილი წარმოადგენს {n}-ს ორ განსხვავებულ სწორ დაშლად?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '50;30 + 20 და 40 + 10;30 + 20 და 30 + 10;20 + 20 და 40 + 10;30 + 15 და 40 + 5',
          '60;40 + 20 და 50 + 10;40 + 20 და 40 + 10;30 + 20 და 50 + 10;40 + 15 და 50 + 5',
          '70;50 + 20 და 40 + 30;50 + 20 და 40 + 20;30 + 30 და 40 + 30;50 + 15 და 40 + 25',
          '80;60 + 20 და 50 + 30;60 + 20 და 50 + 20;40 + 30 და 50 + 30;60 + 15 და 50 + 25',
          '45;25 + 20 და 30 + 15;25 + 20 და 30 + 10;20 + 20 და 30 + 15;25 + 15 და 30 + 10',
          '55;35 + 20 და 40 + 15;35 + 20 და 40 + 10;30 + 20 და 40 + 15;35 + 15 და 40 + 10',
          '65;45 + 20 და 50 + 15;45 + 20 და 50 + 10;40 + 20 და 50 + 15;45 + 15 და 50 + 10',
          '75;55 + 20 და 60 + 15;55 + 20 და 60 + 10;50 + 20 და 60 + 15;55 + 15 და 60 + 10',
          '85;65 + 20 და 70 + 15;65 + 20 და 70 + 10;60 + 20 და 70 + 15;65 + 15 და 70 + 10',
          '40;25 + 15 და 30 + 10;25 + 15 და 30 + 5;20 + 15 და 30 + 10;25 + 10 და 30 + 5',
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
    explanation: ({ vars, answer }) =>
      `ორივე გამოსახულება ჯამში იძლევა ${vars.n}-ს: ${answer}.`,
  }),

  // Q30: დონე 3 | პირობის მიხედვით დაშლა (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-30', subtopicId: 'u04-ways-to-make-number', difficulty: 3 }),
    prompt: 'წარმოადგინე {n} ორი შესაკრების ჯამად, რომელთაგან ერთი არის {a}. რა არის მეორე შესაკრები?',
    variables: {
      n: { kind: 'int', min: 40, max: 95 },
      a: { kind: 'int', min: 15, max: (v) => Number(v.n) - 10 },
    },
    answer: (v) => Number(v.n) - Number(v.a),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `მეორე შესაკრებია: ${vars.n} − ${vars.a} = ${answer}.`,
  }),

  // =========================================================================
  // U04.6 — სურათიდან გამოსახულებისა და ამოცანის შედგენა (u04-word-problems-expressions)
  // =========================================================================

  // Q31: დონე 1 | ორი ჯგუფის შეკრება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-31', subtopicId: 'u04-word-problems-expressions', difficulty: 1 }),
    prompt: 'ბაღში არის {a} წითელი ყვავილი 🌹 და {b} ყვითელი ყვავილი 🌼. რომელი გამოსახულება აჩვენებს ყვავილების საერთო რაოდენობას?',
    variables: {
      a: { kind: 'int', min: 12, max: 45 },
      b: { kind: 'int', min: 11, max: 40 },
    },
    answer: (v) => `${v.a} + ${v.b}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.a} − ${vars.b}`,
      `${Number(vars.a) + Number(vars.b)} − ${vars.a}`,
      `${vars.a} + ${Number(vars.b) + 5}`,
    ],
    explanation: ({ answer }) =>
      `ყვავილების საერთო რაოდენობის საპოვნელად საჭიროა მათი შეკრება: ${answer}.`,
  }),

  // Q32: დონე 1 | სურათის მიხედვით ჯამის პოვნა (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-32', subtopicId: 'u04-word-problems-expressions', difficulty: 1 }),
    prompt: 'ერთ კალათაში არის {a} ვაშლი 🍎, მეორეში კი — {b} ვაშლი 🍏. რამდენი ვაშლია სულ?',
    variables: {
      a: { kind: 'int', min: 15, max: 45 },
      b: { kind: 'int', min: 12, max: 40 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `სულ ვაშლია: ${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q33: დონე 2 | გამოსახულების არჩევა (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-33', subtopicId: 'u04-word-problems-expressions', difficulty: 2 }),
    prompt: 'მოედანზე იყო {a} ბურთი ⚽. ბავშვებმა მოიტანეს კიდევ {b} ბურთი. რომელი გამოსახულება შეესაბამება ამ ვითარებას?',
    variables: {
      a: { kind: 'int', min: 14, max: 48 },
      b: { kind: 'int', min: 11, max: 35 },
    },
    answer: (v) => `${v.a} + ${v.b}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.a} − ${vars.b}`,
      `${Number(vars.a) + Number(vars.b)} − ${vars.b}`,
      `${vars.a} + 10`,
    ],
    explanation: ({ answer }) =>
      `ბურთების დამატება ნიშნავს შეკრებას: ${answer}.`,
  }),

  // Q34: დონე 2 | სურათის მიხედვით გამოტოვებული რაოდენობა (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-34', subtopicId: 'u04-word-problems-expressions', difficulty: 2 }),
    prompt: 'სულ {s} სათამაშოა 🧸. აქედან {a} წითელია, დანარჩენი კი — ლურჯი. რამდენი ლურჯი სათამაშოა?',
    variables: {
      a: { kind: 'int', min: 15, max: 45 },
      blue: { kind: 'int', min: 12, max: 40 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.blue)] },
    },
    answer: (v) => Number(v.blue),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `ლურჯი სათამაშოების რაოდენობაა: ${vars.s} − ${vars.a} = ${answer}.`,
  }),

  // Q35: დონე 3 | სურათიდან ორნაბიჯიანი ამოცანა (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-35', subtopicId: 'u04-word-problems-expressions', difficulty: 3 }),
    prompt: 'ყუთში იყო {a} კუბიკი 🧱. ჩაამატეს {b} კუბიკი, შემდეგ კი კიდევ {c} კუბიკი. რამდენი კუბიკია ახლა ყუთში?',
    variables: {
      a: { kind: 'int', min: 12, max: 35 },
      b: { kind: 'int', min: 10, max: 30 },
      c: { kind: 'int', min: 5, max: 25 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `სულ კუბიკია: ${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // Q36: დონე 3 | გამოსახულების შეცდომის პოვნა (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-36', subtopicId: 'u04-word-problems-expressions', difficulty: 3 }),
    prompt: 'კალათში {a} წითელი და {b} მწვანე ბურთულაა. მოსწავლემ ჯამად შეცდომით დაწერა {wrong}. რა არის სინამდვილეში სწორი ჯამი?',
    variables: {
      a: { kind: 'int', min: 18, max: 48 },
      b: { kind: 'int', min: 15, max: 42 },
      diff: { kind: 'choice', values: [10, -10, 2, -2] },
      wrong: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b) + Number(v.diff)] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars, answer }) => [
      Number(vars.wrong),
      Number(answer) + 1,
      Number(answer) - 1,
    ],
    explanation: ({ vars, answer }) =>
      `სწორი ჯამია: ${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // =========================================================================
  // U04.7 — გამოტოვებული შესაკრები (u04-missing-addend)
  // =========================================================================

  // Q37: დონე 1 | უცნობი შესაკრები (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-37', subtopicId: 'u04-missing-addend', difficulty: 1 }),
    prompt: 'გამოთვალე გამოტოვებული შესაკრები: {a} + ___ = {s}',
    variables: {
      a: { kind: 'int', min: 15, max: 55 },
      x: { kind: 'int', min: 10, max: 40 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.x)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `გამოტოვებული შესაკრებია: ${vars.s} − ${vars.a} = ${answer}.`,
  }),

  // Q38: დონე 1 | უცნობი პირველი შესაკრები (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-38', subtopicId: 'u04-missing-addend', difficulty: 1 }),
    prompt: 'გამოთვალე გამოტოვებული შესაკრები: ___ + {b} = {s}',
    variables: {
      b: { kind: 'int', min: 15, max: 55 },
      x: { kind: 'int', min: 10, max: 40 },
      s: { kind: 'choice', values: (v) => [Number(v.b) + Number(v.x)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `გამოტოვებული შესაკრებია: ${vars.s} − ${vars.b} = ${answer}.`,
  }),

  // Q39: დონე 2 | გამოტოვებული რიცხვი 100-ის ფარგლებში (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-39', subtopicId: 'u04-missing-addend', difficulty: 2 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: {a} + ___ = {s}',
    variables: {
      a: { kind: 'int', min: 25, max: 65 },
      x: { kind: 'int', min: 15, max: 30 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.x)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.s} − ${vars.a} = ${answer}.`,
  }),

  // Q40: დონე 2 | უცნობი შესაკრები სურათით (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-40', subtopicId: 'u04-missing-addend', difficulty: 2 }),
    prompt: 'მაგიდაზე სულ {s} ფანქარი უნდა იყოს. ჩანს {a} ფანქარი ✏️, დანარჩენი კი ყუთშია დაფარული. რამდენი ფანქარია ყუთში?',
    variables: {
      a: { kind: 'int', min: 18, max: 52 },
      x: { kind: 'int', min: 12, max: 40 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.x)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `დაფარული ფანქრების რაოდენობაა: ${vars.s} − ${vars.a} = ${answer}.`,
  }),

  // Q41: დონე 3 | ორი გამოტოვებული შესაკრები (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-41', subtopicId: 'u04-missing-addend', difficulty: 3 }),
    prompt: '{a} + ___ + ___ = {s}. ცნობილია, რომ პირველი გამოტოვებული რიცხვი მეორეზე {diff}-ით მეტია. რომელია ეს ორი რიცხვი?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '20;70;10;30 და 20;35 და 15;25 და 25;40 და 10',
          '30;80;10;30 და 20;35 და 15;25 და 25;40 და 10',
          '25;75;10;30 და 20;35 და 15;25 და 25;40 და 10',
          '15;85;10;40 და 30;45 და 25;35 და 35;50 და 20',
          '40;90;10;30 და 20;35 და 15;25 და 25;40 და 10',
          '35;85;10;30 და 20;35 და 15;25 და 25;40 და 10',
          '20;80;20;40 და 20;45 და 15;30 და 30;50 და 10',
          '10;90;20;50 და 30;55 და 25;40 და 40;60 და 20',
          '30;90;20;40 და 20;45 და 15;30 და 30;50 და 10',
          '25;85;20;40 და 20;45 და 15;30 და 30;50 და 10',
          '15;75;20;40 და 20;45 და 15;30 და 30;50 და 10',
          '20;60;10;25 და 15;30 და 10;20 და 20;35 და 5',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[0])] },
      s: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[1])] },
      diff: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `გამოტოვებული რიცხვების ჯამია ${Number(vars.s) - Number(vars.a)}. მათი სხვაობაა ${vars.diff}. ეს რიცხვებია: ${answer}.`,
  }),

  // Q42: დონე 3 | გამოტოვებული შესაკრების შემოწმება (ჭეშმარიტი/მცდარი)
  defineTemplate({
    ...addr({ id: 'g2-u04-42', subtopicId: 'u04-missing-addend', difficulty: 3 }),
    prompt: '{a} + {x} = {s}. სწორია თუ არა, რომ გამოტოვებული შესაკრები არის {x}?',
    variables: {
      a: { kind: 'int', min: 20, max: 60 },
      trueX: { kind: 'int', min: 15, max: 35 },
      delta: { kind: 'choice', values: [0, 10, -5, 5] },
      x: { kind: 'choice', values: (v) => [Number(v.trueX) + Number(v.delta)] },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.trueX)] },
    },
    answer: (v) => (Number(v.delta) === 0 ? 'სწორია' : 'მცდარია'),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => (answer === 'სწორია' ? ['მცდარია'] : ['სწორია']),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.x} = ${Number(vars.a) + Number(vars.x)}, ხოლო ჯამი უნდა იყოს ${vars.s}. ამიტომ დებულება ${answer}.`,
  }),

  // =========================================================================
  // U04.8 — ჯამების შედარება (u04-comparing-examples)
  // =========================================================================

  // Q43: დონე 1 | მარტივი ჯამების შედარება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-43', subtopicId: 'u04-comparing-examples', difficulty: 1 }),
    prompt: 'რომელი ჯამია მეტი: {sumA_label} თუ {sumB_label}?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '20 + 10;20 + 20;30;40;20 + 20',
          '30 + 15;30 + 25;45;55;30 + 25',
          '40 + 20;40 + 10;60;50;40 + 20',
          '25 + 20;25 + 30;45;55;25 + 30',
          '50 + 10;50 + 20;60;70;50 + 20',
          '35 + 20;35 + 10;55;45;35 + 20',
          '45 + 15;45 + 25;60;70;45 + 25',
          '15 + 30;15 + 20;45;35;15 + 30',
          '60 + 10;60 + 20;70;80;60 + 20',
          '22 + 20;22 + 30;42;52;22 + 30',
          '33 + 10;33 + 20;43;53;33 + 20',
          '41 + 20;41 + 10;61;51;41 + 20',
        ],
      },
      sumA_label: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      sumB_label: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      valA: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      valB: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[3])] },
      greater: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.greater),
    format: { kind: 'text' },
    optionCount: 3,
    options: (vars) => [String(vars.sumA_label), String(vars.sumB_label), 'ტოლია'],
    explanation: ({ vars, answer }) =>
      `${vars.sumA_label} = ${vars.valA}, ხოლო ${vars.sumB_label} = ${vars.valB}. მეტია: ${answer}.`,
  }),

  // Q44: დონე 1 | ჯამების გამოთვლა და შედარება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-44', subtopicId: 'u04-comparing-examples', difficulty: 1 }),
    prompt: 'შეადარე: {sumA_label} და {sumB_label}. რომელი შედეგია მეტი?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '32 + 15;24 + 21;47;45;32 + 15',
          '41 + 16;35 + 24;57;59;35 + 24',
          '52 + 13;44 + 23;65;67;44 + 23',
          '26 + 31;33 + 22;57;55;26 + 31',
          '43 + 25;51 + 18;68;69;51 + 18',
          '34 + 23;25 + 34;57;59;25 + 34',
          '61 + 14;52 + 25;75;77;52 + 25',
          '45 + 32;53 + 21;77;74;45 + 32',
          '27 + 41;36 + 31;68;67;27 + 41',
          '38 + 21;29 + 32;59;61;29 + 32',
          '54 + 22;43 + 35;76;78;43 + 35',
          '62 + 23;71 + 15;85;86;71 + 15',
        ],
      },
      sumA_label: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      sumB_label: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      valA: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      valB: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[3])] },
      greater: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.greater),
    format: { kind: 'text' },
    optionCount: 3,
    options: (vars) => [String(vars.sumA_label), String(vars.sumB_label), 'ტოლია'],
    explanation: ({ vars, answer }) =>
      `${vars.sumA_label} = ${vars.valA}, ${vars.sumB_label} = ${vars.valB}. აქედან მეტია: ${answer}.`,
  }),

  // Q45: დონე 2 | ტოლობის შემოწმება (ჭეშმარიტი/მცდარი)
  defineTemplate({
    ...addr({ id: 'g2-u04-45', subtopicId: 'u04-comparing-examples', difficulty: 2 }),
    prompt: 'სწორია თუ მცდარი ტოლობა: {a} + {b} = {c} + {d}?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '20;30;25;25;სწორია;50;50',
          '30;40;35;35;სწორია;70;70',
          '15;25;20;20;სწორია;40;40',
          '40;20;30;30;სწორია;60;60',
          '25;35;30;30;სწორია;60;60',
          '20;30;25;20;მცდარია;50;45',
          '30;40;35;40;მცდარია;70;75',
          '15;25;20;25;მცდარია;40;45',
          '40;20;30;25;მცდარია;60;55',
          '50;20;40;40;მცდარია;70;80',
          '35;25;30;25;მცდარია;60;55',
          '45;15;30;35;მცდარია;60;65',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[3])] },
      isTrue: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      leftSum: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[5])] },
      rightSum: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[6])] },
    },
    answer: (v) => String(v.isTrue),
    format: { kind: 'text' },
    optionCount: 2,
    distractors: ({ answer }) => (answer === 'სწორია' ? ['მცდარია'] : ['სწორია']),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${vars.leftSum}, ხოლო ${vars.c} + ${vars.d} = ${vars.rightSum}. ამიტომ ტოლობა ${answer}.`,
  }),

  // Q46: დონე 2 | რომელი ჯამი აკმაყოფილებს პირობას? (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-46', subtopicId: 'u04-comparing-examples', difficulty: 2 }),
    prompt: 'ჩამოთვლილთაგან რომელი ჯამია {limit}-ზე მეტი?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '70;45 + 30;30 + 35;25 + 40;20 + 45;75',
          '60;35 + 30;20 + 35;25 + 30;15 + 40;65',
          '80;55 + 30;40 + 35;35 + 40;50 + 25;85',
          '50;32 + 25;20 + 25;15 + 30;22 + 25;57',
          '75;42 + 35;30 + 40;35 + 35;25 + 45;77',
          '65;41 + 27;30 + 32;25 + 35;20 + 40;68',
          '85;50 + 38;40 + 40;45 + 35;50 + 30;88',
          '55;34 + 25;20 + 30;22 + 30;15 + 35;59',
        ],
      },
      limit: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[0])] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      correctVal: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[5])] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${answer} = ${vars.correctVal}, რაც მეტია ${vars.limit}-ზე.`,
  }),

  // Q47: დონე 3 | ჯამების დალაგება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-47', subtopicId: 'u04-comparing-examples', difficulty: 3 }),
    prompt: '{intro} რომელ ვარიანტშია ჯამები დალაგებული უმცირესიდან უდიდესამდე?',
    variables: {
      intro: {
        kind: 'choice',
        values: ['მოცემულთაგან', 'ჩამოთვლილთაგან', 'ქვემოთ მოცემულთაგან', 'ვარიანტებიდან'],
      },
      pack: {
        kind: 'choice',
        values: [
          '10 + 10 < 20 + 10 < 20 + 20 < 30 + 20;20 + 10 < 10 + 10 < 20 + 20 < 30 + 20;10 + 10 < 20 + 20 < 20 + 10 < 30 + 20;30 + 20 < 20 + 20 < 20 + 10 < 10 + 10',
          '15 + 10 < 20 + 15 < 30 + 15 < 40 + 15;20 + 15 < 15 + 10 < 30 + 15 < 40 + 15;15 + 10 < 30 + 15 < 20 + 15 < 40 + 15;40 + 15 < 30 + 15 < 20 + 15 < 15 + 10',
          '20 + 5 < 25 + 10 < 30 + 15 < 40 + 20;25 + 10 < 20 + 5 < 30 + 15 < 40 + 20;20 + 5 < 30 + 15 < 25 + 10 < 40 + 20;40 + 20 < 30 + 15 < 25 + 10 < 20 + 5',
          '12 + 10 < 15 + 12 < 20 + 15 < 25 + 20;15 + 12 < 12 + 10 < 20 + 15 < 25 + 20;12 + 10 < 20 + 15 < 15 + 12 < 25 + 20;25 + 20 < 20 + 15 < 15 + 12 < 12 + 10',
          '10 + 15 < 15 + 20 < 20 + 25 < 30 + 30;15 + 20 < 10 + 15 < 20 + 25 < 30 + 30;10 + 15 < 20 + 25 < 15 + 20 < 30 + 30;30 + 30 < 20 + 25 < 15 + 20 < 10 + 15',
          '20 + 20 < 25 + 20 < 30 + 25 < 40 + 30;25 + 20 < 20 + 20 < 30 + 25 < 40 + 30;20 + 20 < 30 + 25 < 25 + 20 < 40 + 30;40 + 30 < 30 + 25 < 25 + 20 < 20 + 20',
          '11 + 11 < 22 + 11 < 33 + 11 < 44 + 11;22 + 11 < 11 + 11 < 33 + 11 < 44 + 11;11 + 11 < 33 + 11 < 22 + 11 < 44 + 11;44 + 11 < 33 + 11 < 22 + 11 < 11 + 11',
          '14 + 10 < 20 + 14 < 30 + 14 < 40 + 14;20 + 14 < 14 + 10 < 30 + 14 < 40 + 14;14 + 10 < 30 + 14 < 20 + 14 < 40 + 14;40 + 14 < 30 + 14 < 20 + 14 < 14 + 10',
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
      `სწორი ზრდადი მიმდევრობაა: ${answer}.`,
  }),

  // Q48: დონე 3 | უცნობი რიცხვი შედარებაში (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-48', subtopicId: 'u04-comparing-examples', difficulty: 3 }),
    prompt: '{a} + {b} = {c} + ___. იპოვე გამოტოვებული შესაკრები.',
    variables: {
      a: { kind: 'int', min: 20, max: 45 },
      b: { kind: 'int', min: 20, max: 45 },
      c: { kind: 'int', min: 10, max: (v) => Number(v.a) + Number(v.b) - 5 },
    },
    answer: (v) => Number(v.a) + Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const sum = Number(vars.a) + Number(vars.b);
      return `მარცხენა მხარეა: ${vars.a} + ${vars.b} = ${sum}. გამოტოვებული შესაკრებია: ${sum} − ${vars.c} = ${answer}.`;
    },
  }),

  // =========================================================================
  // U04.9 — სამი ან მეტი რიცხვის შეკრება (u04-adding-three-numbers)
  // =========================================================================

  // Q49: დონე 1 | სამი რიცხვის შეკრება (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-49', subtopicId: 'u04-adding-three-numbers', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b} + {c} = ?',
    variables: {
      a: { kind: 'int', min: 10, max: 30 },
      b: { kind: 'int', min: 10, max: 30 },
      c: { kind: 'int', min: 10, max: 30 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}; ${Number(vars.a) + Number(vars.b)} + ${vars.c} = ${answer}.`,
  }),

  // Q50: დონე 1 | ოთხი რიცხვის შეკრება (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-50', subtopicId: 'u04-adding-three-numbers', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b} + {c} + {d} = ?',
    variables: {
      a: { kind: 'int', min: 10, max: 25 },
      b: { kind: 'int', min: 10, max: 25 },
      c: { kind: 'int', min: 10, max: 25 },
      d: { kind: 'int', min: 5, max: 20 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} = ${answer}.`,
  }),

  // Q51: დონე 2 | სამი რიცხვის შეკრება გადაჯგუფებით (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-51', subtopicId: 'u04-adding-three-numbers', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} + {b} + {c}',
    variables: {
      a: { kind: 'int', min: 15, max: 35 },
      b: { kind: 'int', min: 16, max: 35 },
      c: { kind: 'int', min: 12, max: 25 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // Q52: დონე 2 | ჯამის პოვნა სურათიდან (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-52', subtopicId: 'u04-adding-three-numbers', difficulty: 2 }),
    prompt: 'სამ ყუთში დევს სათამაშოები 🧸: პირველში — {a}, მეორეში — {b}, მესამეში — {c}. რამდენი სათამაშოა სულ?',
    variables: {
      a: { kind: 'int', min: 12, max: 30 },
      b: { kind: 'int', min: 11, max: 30 },
      c: { kind: 'int', min: 10, max: 25 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `სათამაშოების საერთო რაოდენობაა: ${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // Q53: დონე 3 | გამოტოვებული შესაკრები მრავალწევრიან ჯამში (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-53', subtopicId: 'u04-adding-three-numbers', difficulty: 3 }),
    prompt: '{a} + {b} + ___ + {d} = {s}. იპოვე გამოტოვებული შესაკრები.',
    variables: {
      a: { kind: 'int', min: 10, max: 25 },
      b: { kind: 'int', min: 10, max: 25 },
      d: { kind: 'int', min: 10, max: 25 },
      x: { kind: 'int', min: 5, max: 20 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b) + Number(v.d) + Number(v.x)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const known = Number(vars.a) + Number(vars.b) + Number(vars.d);
      return `ცნობილი შესაკრებების ჯამია ${vars.a} + ${vars.b} + ${vars.d} = ${known}. გამოტოვებული შესაკრებია: ${vars.s} − ${known} = ${answer}.`;
    },
  }),

  // Q54: დონე 3 | რამდენიმე ჯამის შედარება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-54', subtopicId: 'u04-adding-three-numbers', difficulty: 3 }),
    prompt: '{intro} რომელი გამოსახულება იძლევა უდიდეს ჯამს?',
    variables: {
      intro: {
        kind: 'choice',
        values: ['მოცემულთაგან', 'ჩამოთვლილთაგან', 'ქვემოთ მოცემულთაგან', 'ვარიანტებიდან'],
      },
      pack: {
        kind: 'choice',
        values: [
          '20 + 30 + 15;15 + 25 + 20;10 + 20 + 30;20 + 20 + 20;20 + 30 + 15',
          '30 + 25 + 20;20 + 30 + 20;15 + 25 + 30;10 + 30 + 30;30 + 25 + 20',
          '25 + 35 + 15;20 + 30 + 20;15 + 25 + 25;30 + 20 + 20;25 + 35 + 15',
          '40 + 20 + 15;30 + 25 + 15;20 + 30 + 20;25 + 25 + 20;40 + 20 + 15',
          '35 + 25 + 20;30 + 20 + 25;25 + 25 + 20;20 + 30 + 20;35 + 25 + 20',
          '45 + 15 + 20;35 + 20 + 20;25 + 30 + 15;20 + 25 + 25;45 + 15 + 20',
          '50 + 20 + 10;40 + 20 + 15;30 + 25 + 20;35 + 20 + 20;50 + 20 + 10',
          '32 + 24 + 18;25 + 25 + 20;20 + 30 + 22;18 + 22 + 30;32 + 24 + 18',
        ],
      },
      e1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      e2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      e3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      e4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      winner: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.winner),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.e2), String(vars.e3), String(vars.e4)],
    explanation: ({ answer }) => `უდიდეს შედეგს იძლევა გამოსახულება: ${answer}.`,
  }),

  // Q61 (ნაწილი B): დონე 2 | ხუთი შესაკრების შეკრება (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-61', subtopicId: 'u04-adding-three-numbers', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} + {b} + {c} + {d} + {e} = ?',
    variables: {
      a: { kind: 'int', min: 10, max: 20 },
      b: { kind: 'int', min: 10, max: 20 },
      c: { kind: 'int', min: 10, max: 20 },
      d: { kind: 'int', min: 5, max: 15 },
      e: { kind: 'int', min: 5, max: 15 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d) + Number(v.e),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} + ${vars.e} = ${answer}.`,
  }),

  // Q62 (ნაწილი B): დონე 3 | ექვსი შესაკრების შეკრება (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-62', subtopicId: 'u04-adding-three-numbers', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} + {b} + {c} + {d} + {e} + {f} = ?',
    variables: {
      a: { kind: 'int', min: 5, max: 15 },
      b: { kind: 'int', min: 5, max: 15 },
      c: { kind: 'int', min: 5, max: 15 },
      d: { kind: 'int', min: 5, max: 15 },
      e: { kind: 'int', min: 5, max: 15 },
      f: { kind: 'int', min: 5, max: 15 },
    },
    answer: (v) =>
      Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d) + Number(v.e) + Number(v.f),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} + ${vars.e} + ${vars.f} = ${answer}.`,
  }),

  // Q63 (ნაწილი B): დონე 3 | შეკრების მოხერხებული დაჯგუფება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-63', subtopicId: 'u04-adding-three-numbers', difficulty: 3 }),
    prompt: 'რომელი წყვილის შეკრებაა მოსახერხებელი პირველ რიგში, რათა {a} + {b} + {c} + {d} უფრო მარტივად გამოთვალო?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '17;25;13;20;17 და 13;17 + 13 = 30',
          '28;15;12;20;28 და 12;28 + 12 = 40',
          '36;14;14;20;36 და 14;36 + 14 = 50',
          '19;24;11;20;19 და 11;19 + 11 = 30',
          '25;18;15;20;25 და 15;25 + 15 = 40',
          '34;12;16;20;34 და 16;34 + 16 = 50',
          '23;19;17;20;23 და 17;23 + 17 = 40',
          '32;15;18;20;32 და 18;32 + 18 = 50',
          '21;26;19;20;21 და 19;21 + 19 = 40',
          '27;14;13;20;27 და 13;27 + 13 = 40',
        ],
      },
      a: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[1])] },
      c: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[3])] },
      best: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      why: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.best),
    format: { kind: 'text' },
    optionCount: 3,
    options: (vars) => [`${vars.a} და ${vars.c}`, `${vars.a} და ${vars.b}`, `${vars.b} და ${vars.d}`],
    explanation: ({ vars, answer }) =>
      `მოსახერხებელია ${answer}-ის შეკრება, რადგან ${vars.why}, რაც ამარტივებს დანარჩენ გამოთვლას.`,
  }),

  // Q64 (ნაწილი B): დონე 3 | მრავალშესაკრებიანი ჯამის გამოტოვებული წევრი (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-64', subtopicId: 'u04-adding-three-numbers', difficulty: 3 }),
    prompt: '{a} + {b} + {c} + ___ + {e} = {s}. იპოვე გამოტოვებული რიცხვი.',
    variables: {
      a: { kind: 'int', min: 10, max: 20 },
      b: { kind: 'int', min: 10, max: 20 },
      c: { kind: 'int', min: 10, max: 20 },
      e: { kind: 'int', min: 10, max: 20 },
      x: { kind: 'int', min: 1, max: 9 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b) + Number(v.c) + Number(v.e) + Number(v.x)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => {
      const known = Number(vars.a) + Number(vars.b) + Number(vars.c) + Number(vars.e);
      return `ცნობილი რიცხვების ჯამია ${known}. გამოტოვებული რიცხვია: ${vars.s} − ${known} = ${answer}.`;
    },
  }),

  // =========================================================================
  // U04.10 — გამოტოვებული ციფრები შეკრების ტოლობაში (u04-missing-digits)
  // =========================================================================

  // Q55: დონე 1 | გამოტოვებული ერთეული (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-55', subtopicId: 'u04-missing-digits', difficulty: 1 }),
    prompt: '{a} + {tensB}_ = {s}. რომელი ციფრი აკლია ქვედა ხაზის ადგილას?',
    variables: {
      tensA: { kind: 'int', min: 1, max: 4 },
      onesA: { kind: 'int', min: 1, max: 4 },
      tensB: { kind: 'int', min: 1, max: 4 },
      onesB: { kind: 'int', min: 1, max: (v) => 9 - Number(v.onesA) },
      a: { kind: 'choice', values: (v) => [Number(v.tensA) * 10 + Number(v.onesA)] },
      s: { kind: 'choice', values: (v) => [(Number(v.tensA) + Number(v.tensB)) * 10 + Number(v.onesA) + Number(v.onesB)] },
    },
    answer: (v) => Number(v.onesB),
    format: { kind: 'integer', min: 0, max: 9, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${Number(vars.tensB) * 10 + Number(answer)} = ${vars.s}. გამოტოვებული ერთეულია ${answer}.`,
  }),

  // Q56: დონე 1 | გამოტოვებული ათეული (რიცხვის შეყვანა)
  defineTemplate({
    ...addr({ id: 'g2-u04-56', subtopicId: 'u04-missing-digits', difficulty: 1 }),
    prompt: '{tensA}_ + {b} = {s}. იპოვე გამოტოვებული ერთეულის ციფრი.',
    variables: {
      tensA: { kind: 'int', min: 1, max: 4 },
      onesA: { kind: 'int', min: 1, max: 8 },
      tensB: { kind: 'int', min: 1, max: 3 },
      onesB: { kind: 'int', min: 1, max: (v) => 9 - Number(v.onesA) },
      b: { kind: 'choice', values: (v) => [Number(v.tensB) * 10 + Number(v.onesB)] },
      s: { kind: 'choice', values: (v) => [(Number(v.tensA) + Number(v.tensB)) * 10 + Number(v.onesA) + Number(v.onesB)] },
    },
    answer: (v) => Number(v.onesA),
    format: { kind: 'integer', min: 0, max: 9, entry: true },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0),
    explanation: ({ vars, answer }) =>
      `${Number(vars.tensA) * 10 + Number(answer)} + ${vars.b} = ${vars.s}. გამოტოვებული ციფრია ${answer}.`,
  }),

  // Q57: დონე 2 | ორი ციფრის პოვნა (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-57', subtopicId: 'u04-missing-digits', difficulty: 2 }),
    prompt: '{tensA}_ + {tensB}_ = {s}. რომელი ციფრთა წყვილი ავსებს ტოლობას სწორად?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '4;2;68;5 და 3;4 და 4;6 და 2;3 და 4',
          '3;2;57;4 და 3;5 და 2;3 და 3;4 და 2',
          '5;1;69;6 და 3;5 და 4;7 და 2;4 და 3',
          '2;3;56;2 და 4;3 და 3;1 და 5;2 და 3',
          '4;3;78;5 და 3;6 და 2;4 და 4;3 და 4',
          '3;4;79;6 და 3;5 და 4;7 და 2;4 და 4',
          '2;4;67;4 და 3;5 და 2;3 და 4;2 და 4',
          '5;2;78;5 და 3;4 და 4;6 და 2;3 და 4',
          '3;3;66;4 და 2;5 და 1;3 და 3;2 და 3',
          '1;5;68;5 და 3;4 და 4;6 და 2;3 და 4',
        ],
      },
      tensA: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[0])] },
      tensB: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[1])] },
      s: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => {
      const parts = String(answer).split(' და ');
      const numA = Number(vars.tensA) * 10 + Number(parts[0]);
      const numB = Number(vars.tensB) * 10 + Number(parts[1]);
      return `${numA} + ${numB} = ${vars.s}. სწორი წყვილია: ${answer}.`;
    },
  }),

  // Q58: დონე 2 | გადაჯგუფების გამოყენება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-58', subtopicId: 'u04-missing-digits', difficulty: 2 }),
    prompt: '{tensA}_ + {b} = {s}. რომელი ციფრი აკლია?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '3;18;55;7',
          '2;19;46;7',
          '4;17;65;8',
          '3;28;64;6',
          '5;16;72;6',
          '4;29;75;6',
          '2;38;65;7',
          '3;19;57;8',
          '4;18;67;9',
          '2;27;54;7',
          '3;26;63;7',
          '5;17;74;7',
        ],
      },
      tensA: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[0])] },
      b: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[1])] },
      s: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      digit: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[3])] },
    },
    answer: (v) => Number(v.digit),
    format: { kind: 'integer', min: 0, max: 9 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 0),
    explanation: ({ vars, answer }) =>
      `${Number(vars.tensA) * 10 + Number(answer)} + ${vars.b} = ${vars.s}. გამოტოვებული ციფრია ${answer}.`,
  }),

  // Q59: დონე 3 | რამდენიმე პირობის მქონე ტოლობა (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-59', subtopicId: 'u04-missing-digits', difficulty: 3 }),
    prompt: '_{onesA} + {tensB}_ = {s}. იპოვე გამოტოვებული ციფრები.',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '7;2;64;3 და 7',
          '8;3;75;3 და 7',
          '6;4;83;3 და 7',
          '9;2;55;2 და 6',
          '8;2;63;3 და 5',
          '7;3;72;3 და 5',
          '6;2;54;2 და 8',
          '8;4;82;3 და 4',
          '9;3;74;3 და 5',
          '7;4;82;3 და 5',
          '5;3;61;2 და 6',
          '8;1;52;3 და 4',
        ],
      },
      onesA: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[0])] },
      tensB: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[1])] },
      s: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: () => ['2 და 5', '4 და 6', '3 და 8'],
    explanation: ({ vars, answer }) => {
      const parts = String(answer).split(' და ');
      const numA = Number(parts[0]) * 10 + Number(vars.onesA);
      const numB = Number(vars.tensB) * 10 + Number(parts[1]);
      return `${numA} + ${numB} = ${vars.s}. გამოტოვებული ციფრებია: ${answer}.`;
    },
  }),

  // Q60: დონე 3 | გამოტოვებული ციფრების შემოწმება (არჩევითი)
  defineTemplate({
    ...addr({ id: 'g2-u04-60', subtopicId: 'u04-missing-digits', difficulty: 3 }),
    prompt: 'მოსწავლემ შეავსო ტოლობა {tensA}_ + {tensB}_ = {s}. რომელი შევსებაა სწორი?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '5;2;73;1 და 2;2 და 2;1 და 3;0 და 2',
          '4;3;75;2 და 3;3 და 3;2 და 4;1 და 3',
          '3;4;76;3 და 3;2 და 3;3 და 4;4 და 3',
          '5;1;64;2 და 2;1 და 2;2 და 3;3 და 2',
          '2;5;78;4 და 4;3 და 4;4 და 5;5 et 4',
          '4;2;67;4 და 3;3 და 3;4 და 4;5 და 3',
          '3;3;68;5 და 3;4 და 3;5 და 4;6 და 3',
          '5;3;89;5 და 4;4 და 4;5 და 5;6 და 4',
          '2;4;65;3 და 2;2 და 2;3 და 3;4 და 2',
          '4;4;86;3 და 3;2 და 3;3 და 4;4 და 3',
        ],
      },
      tensA: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[0])] },
      tensB: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[1])] },
      s: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => {
      const parts = String(answer).split(' და ');
      const numA = Number(vars.tensA) * 10 + Number(parts[0]);
      const numB = Number(vars.tensB) * 10 + Number(parts[1]);
      return `${numA} + ${numB} = ${vars.s}. სწორი შევსებაა: ${answer}.`;
    },
  }),
];
