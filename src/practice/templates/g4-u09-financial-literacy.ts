import { defineTemplate, QuestionTemplate } from './types';

/**
 * Grade 4 — Unit 9: ფინანსური წიგნიერება და ფული (Financial Literacy & Money)
 *
 * Covers 10 subtopics (60 templates total: Q01–Q60, 6 per subtopic):
 *   U09.1 — მონეტებით თანხის დათვლა (u09-counting-coins)
 *   U09.2 — თანხის დათვლა ბანკნოტებით (u09-counting-banknotes)
 *   U09.3 — ფულის შეკრება (u09-money-addition)
 *   U09.4 — ფულადი ერთეულების შედარება (u09-comparing-money)
 *   U09.5 — ერთეულის ფასი (u09-unit-price)
 *   U09.6 — საერთო თანხის გამოთვლა (u09-total-cost)
 *   U09.7 — საკმარისი თანხა (u09-sufficient-money)
 *   U09.8 — ვალუტის კონვერტაცია (u09-currency-conversion)
 *   U09.9 — მრავალსაფეხურიანი ფულადი ამოცანები (u09-multi-step-money)
 *   U09.10 — ფულის გამოკლება (u09-money-subtraction)
 */

export const G4_U09_SUBTOPICS = [
  'u09-counting-coins',
  'u09-counting-banknotes',
  'u09-money-addition',
  'u09-comparing-money',
  'u09-unit-price',
  'u09-total-cost',
  'u09-sufficient-money',
  'u09-currency-conversion',
  'u09-multi-step-money',
  'u09-money-subtraction',
] as const;

export type G4U09SubtopicId = (typeof G4_U09_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G4U09SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 4 as const,
  topicId: 'g4-finansuri-tsigniereba-fuli' as const,
  unitId: 'g4-finansuri-tsigniereba-fuli' as const,
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

export const G4_U09_TEMPLATES: QuestionTemplate[] = [
  // g4-u09-01 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-01', subtopicId: 'u09-counting-coins', difficulty: 1 }),
    prompt: 'გიორგის აქვს {n} მონეტა, თითოეული {denom} თეთრიანი. რამდენი თეთრი აქვს გიორგის სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|50|150", "4|50|200", "5|50|250", "6|50|300", "7|50|350", "8|50|400", "2|50|100", "9|50|450", "10|50|500", "12|50|600", "14|50|700", "16|50|800"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      denom: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.n) * Number(v.denom),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 50, 50),
    explanation: ({ vars, answer }) => `სულ არის: ${vars.n} × ${vars.denom} = ${answer} თეთრი.`,
  }),

  // g4-u09-02 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-02', subtopicId: 'u09-counting-coins', difficulty: 1 }),
    prompt: 'ნინოს აქვს {n1} ცალი {d1}-თეთრიანი და {n2} ცალი {d2}-თეთრიანი მონეტა. რამდენი თეთრი აქვს ნინოს სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|20|3|10", "5|20|2|10", "3|20|4|10", "6|20|3|10", "4|20|5|10", "5|20|4|10", "7|20|2|10", "3|20|6|10", "8|20|3|10", "6|20|5|10", "5|20|6|10", "7|20|4|10"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      d2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.n1) * Number(v.d1) + Number(v.n2) * Number(v.d2),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `სულ არის: ${vars.n1} × ${vars.d1} + ${vars.n2} × ${vars.d2} = ${Number(vars.n1) * Number(vars.d1)} + ${Number(vars.n2) * Number(vars.d2)} = ${answer} თეთრი.`,
  }),

  // g4-u09-03 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-03', subtopicId: 'u09-counting-coins', difficulty: 2 }),
    prompt: 'ლუკას აქვს {n1} ცალი 1-ლარიანი მონეტა და {n2} ცალი 50-თეთრიანი მონეტა. რამდენი ლარი და თეთრი აქვს მას?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|3|3|50", "3|2|4|0", "4|3|5|50", "2|5|4|50", "3|4|5|0", "5|3|6|50", "4|5|6|50", "3|5|5|50", "5|4|7|0", "6|3|7|50", "4|6|7|0", "5|5|7|50"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      totL: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      totT: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => `${v.totL} ლარი და ${v.totT} თეთრი`,
    options: (v) => {
      const l = Number(v.totL);
      const t = Number(v.totT);
      const ans = `${l} ლარი და ${t} თეთრი`;
      return [
        ans,
        `${l - 1} ლარი და ${t} თეთრი`,
        `${l + 1} ლარი და ${t} თეთრი`,
        `${l} ლარი და ${t === 50 ? 0 : 50} თეთრი`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.n1} ცალი 1 ლარი არის ${vars.n1} ლარი, ხოლო ${vars.n2} ცალი 50 თეთრი არის ${Number(vars.n2) * 50} თეთრი. სულ: ${answer}.`,
  }),

  // g4-u09-04 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-04', subtopicId: 'u09-counting-coins', difficulty: 2 }),
    prompt: 'ანას აქვს {n1} ცალი 20-თეთრიანი და {n2} ცალი 5-თეთრიანი მონეტა. რამდენი თეთრი აქვს ანას სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|4|120", "6|4|140", "4|6|110", "7|4|160", "5|6|130", "8|4|180", "6|6|150", "5|8|140", "7|6|170", "8|6|190", "6|8|160", "9|4|200"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.n1) * 20 + Number(v.n2) * 5,
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `სულ არის: ${vars.n1} × 20 + ${vars.n2} × 5 = ${Number(vars.n1) * 20} + ${Number(vars.n2) * 5} = ${answer} თეთრი.`,
  }),

  // g4-u09-05 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-05', subtopicId: 'u09-counting-coins', difficulty: 3 }),
    prompt: 'შეადგინე {targetL} ლარი და {targetT} თეთრი 1-ლარიანი და 50-თეთრიანი მონეტებით. რამდენი მონეტა დაგჭირდება სულ, თუ გამოიყენებ {n1} ცალ 1-ლარიანს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|50|2|3", "3|50|3|4", "4|50|4|5", "5|50|5|6", "3|100|2|4", "4|100|3|5", "5|100|4|6", "6|50|6|7", "2|150|1|4", "3|150|2|5", "4|150|3|6", "5|150|4|7"],
      },
      targetL: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      targetT: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `საერთო თანხის მისაღებად საჭიროა სულ ${answer} მონეტა.`,
  }),

  // g4-u09-06 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-06', subtopicId: 'u09-counting-coins', difficulty: 3 }),
    prompt: 'მყიდველმა გადაიხადა {n1} ცალი 1-ლარიანი და {n2} ცალი 50-თეთრიანი მონეტა. რამდენი თეთრი გადაიხადა მან სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|4|400", "3|3|450", "2|5|450", "3|4|500", "4|3|550", "4|4|600", "3|5|550", "5|2|600", "4|5|650", "5|4|700", "5|5|750", "6|3|750"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.n1) * 100 + Number(v.n2) * 50,
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 50, 50),
    explanation: ({ vars, answer }) => `თითო ლარი 100 თეთრია: ${vars.n1} × 100 + ${vars.n2} × 50 = ${Number(vars.n1) * 100} + ${Number(vars.n2) * 50} = ${answer} თეთრი.`,
  }),

  // g4-u09-07 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-07', subtopicId: 'u09-counting-banknotes', difficulty: 1 }),
    prompt: 'გიორგის აქვს {n} ცალი 5-ლარიანი ბანკნოტი. რამდენი ლარი აქვს მას?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|10", "3|15", "4|20", "5|25", "6|30", "7|35", "8|40", "9|45", "10|50", "12|60", "14|70", "15|75"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
    },
    answer: (v) => Number(v.n) * 5,
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 5, 5),
    explanation: ({ vars, answer }) => `სულ აქვს: ${vars.n} × 5 = ${answer} ლარი.`,
  }),

  // g4-u09-08 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-08', subtopicId: 'u09-counting-banknotes', difficulty: 1 }),
    prompt: 'ნინოს აქვს {n1} ცალი 10-ლარიანი და {n2} ცალი 20-ლარიანი ბანკნოტი. რამდენი ლარი აქვს ნინოს სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|1", "4|1", "2|2", "3|2", "4|2", "5|1", "3|3", "5|2", "2|3", "4|3", "6|1", "5|3"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.n1) * 10 + Number(v.n2) * 20,
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `სულ აქვს: ${vars.n1} × 10 + ${vars.n2} × 20 = ${Number(vars.n1) * 10} + ${Number(vars.n2) * 20} = ${answer} ლარი.`,
  }),

  // g4-u09-09 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-09', subtopicId: 'u09-counting-banknotes', difficulty: 2 }),
    prompt: 'ლუკას აქვს {n1} ცალი 5-ლარიანი და {n2} ცალი 20-ლარიანი ბანკნოტი. რამდენია მისი თანხა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|2", "6|2", "4|3", "5|3", "6|3", "3|4", "5|4", "4|4", "6|4", "8|2", "7|3", "8|3"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.n1) * 5 + Number(v.n2) * 20,
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 5),
    explanation: ({ vars, answer }) => `თანხაა: ${vars.n1} × 5 + ${vars.n2} × 20 = ${Number(vars.n1) * 5} + ${Number(vars.n2) * 20} = ${answer} ლარი.`,
  }),

  // g4-u09-10 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-10', subtopicId: 'u09-counting-banknotes', difficulty: 2 }),
    prompt: 'ანას აქვს {n1} ცალი 50-ლარიანი და {n2} ცალი 10-ლარიანი ბანკნოტი. რამდენი ლარი აქვს ანას?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1|3", "2|2", "1|4", "2|3", "1|5", "2|4", "3|2", "3|3", "2|5", "3|4", "1|6", "2|6"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.n1) * 50 + Number(v.n2) * 10,
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `სულ არის: ${vars.n1} × 50 + ${vars.n2} × 10 = ${Number(vars.n1) * 50} + ${Number(vars.n2) * 10} = ${answer} ლარი.`,
  }),

  // g4-u09-11 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-11', subtopicId: 'u09-counting-banknotes', difficulty: 3 }),
    prompt: 'მარიამს აქვს {n1} ცალი 20-ლარიანი, {n2} ცალი 50-ლარიანი და {n3} ცალი 5-ლარიანი ბანკნოტი. რამდენი ლარი აქვს მას სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|1|3", "3|1|4", "2|2|2", "1|2|3", "4|1|2", "2|2|4", "3|2|2", "2|1|6", "4|2|2", "1|3|3", "3|2|4", "2|3|2"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      n3: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.n1) * 20 + Number(v.n2) * 50 + Number(v.n3) * 5,
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 5),
    explanation: ({ vars, answer }) => `სულ არის: ${vars.n1} × 20 + ${vars.n2} × 50 + ${vars.n3} × 5 = ${Number(vars.n1) * 20} + ${Number(vars.n2) * 50} + ${Number(vars.n3) * 5} = ${answer} ლარი.`,
  }),

  // g4-u09-12 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-12', subtopicId: 'u09-counting-banknotes', difficulty: 3 }),
    prompt: 'მაღაზიაში მყიდველმა გადაიხადა {n1} ცალი 50-ლარიანი და {n2} ცალი 20-ლარიანი ბანკნოტით. რამდენი ლარი გადაიხადა მან?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|3", "3|2", "2|4", "4|2", "3|3", "2|5", "3|4", "4|3", "5|2", "3|5", "4|4", "5|3"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.n1) * 50 + Number(v.n2) * 20,
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 20, 10),
    explanation: ({ vars, answer }) => `გადახდილი თანხაა: ${vars.n1} × 50 + ${vars.n2} × 20 = ${Number(vars.n1) * 50} + ${Number(vars.n2) * 20} = ${answer} ლარი.`,
  }),

  // g4-u09-03-add (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-03-add', subtopicId: 'u09-money-addition', difficulty: 1 }),
    prompt: 'გამოთვალე: {l1} ლარი {t1} თეთრი + {l2} ლარი {t2} თეთრი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|50|2|20", "4|30|3|40", "5|20|2|50", "6|40|1|30", "7|10|2|60", "4|25|3|50", "5|35|4|20", "8|20|1|40", "6|15|3|60", "7|30|2|40", "4|50|3|30", "5|40|4|40"],
      },
      l1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      l2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      t2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => `${Number(v.l1) + Number(v.l2)} ლარი ${Number(v.t1) + Number(v.t2)} თეთრი`,
    options: (v) => {
      const l = Number(v.l1) + Number(v.l2);
      const t = Number(v.t1) + Number(v.t2);
      const ans = `${l} ლარი ${t} თეთრი`;
      return [
        ans,
        `${l + 1} ლარი ${t} თეთრი`,
        `${l - 1} ლარი ${t} თეთრი`,
        `${l} ლარი ${(t + 10) % 100} თეთრი`,
      ];
    },
    explanation: ({ vars, answer }) => `ლარების ჯამია ${vars.l1} + ${vars.l2} = ${Number(vars.l1) + Number(vars.l2)} ლარი, თეთრების — ${vars.t1} + ${vars.t2} = ${Number(vars.t1) + Number(vars.t2)} თეთრი. სულ: ${answer}.`,
  }),

  // g4-u09-14 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-14', subtopicId: 'u09-money-addition', difficulty: 1 }),
    prompt: 'გამოთვალე: {l1} ლარი {t1} თეთრი + {l2} ლარი {t2} თეთრი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["7|80|4|60", "6|70|5|50", "8|90|3|40", "5|85|4|35", "7|75|2|50", "9|60|4|80", "8|70|6|50", "5|90|7|40", "6|80|8|60", "7|65|5|55", "4|85|6|75", "8|50|7|80"],
      },
      l1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      l2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      t2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => {
      const totT = Number(v.t1) + Number(v.t2);
      const addL = Math.floor(totT / 100);
      const remT = totT % 100;
      return `${Number(v.l1) + Number(v.l2) + addL} ლარი ${remT} თეთრი`;
    },
    options: (v) => {
      const totT = Number(v.t1) + Number(v.t2);
      const addL = Math.floor(totT / 100);
      const remT = totT % 100;
      const l = Number(v.l1) + Number(v.l2) + addL;
      const ans = `${l} ლარი ${remT} თეთრი`;
      return [
        ans,
        `${l - 1} ლარი ${remT} თეთრი`,
        `${l + 1} ლარი ${remT} თეთრი`,
        `${l} ლარი ${(remT + 20) % 100} თეთრი`,
      ];
    },
    explanation: ({ vars, answer }) => `თეთრების ჯამია ${vars.t1} + ${vars.t2} = ${Number(vars.t1) + Number(vars.t2)} თეთრი (რაც 1 ლარსა და ${ (Number(vars.t1) + Number(vars.t2)) % 100 } თეთრს უდრის). საერთო ჯამია: ${answer}.`,
  }),

  // g4-u09-15 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-15', subtopicId: 'u09-money-addition', difficulty: 2 }),
    prompt: 'ნინომ იყიდა რვეული {l1} ლარად და კალამი {l2} ლარად და {t2} თეთრად. რამდენი გადაიხადა სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|1|50", "3|2|40", "4|1|60", "3|2|50", "5|1|80", "4|3|20", "6|2|50", "5|3|40", "7|1|50", "4|2|80", "6|3|50", "5|4|30"],
      },
      l1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      l2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      t2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => `${Number(v.l1) + Number(v.l2)} ლარი და ${v.t2} თეთრი`,
    options: (v) => {
      const l = Number(v.l1) + Number(v.l2);
      const t = Number(v.t2);
      const ans = `${l} ლარი და ${t} თეთრი`;
      return [
        ans,
        `${l - 1} ლარი და ${t} თეთრი`,
        `${l + 1} ლარი და ${t} თეთრი`,
        `${l} ლარი და ${(t + 20) % 100} თეთრი`,
      ];
    },
    explanation: ({ vars, answer }) => `სულ გადაიხადა: ${vars.l1} + ${vars.l2} ლარი და ${vars.t2} თეთრი = ${answer}.`,
  }),

  // g4-u09-16 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-16', subtopicId: 'u09-money-addition', difficulty: 2 }),
    prompt: 'პური ღირს {l1} ლარი და {t1} თეთრი, ხოლო რძე — {l2} ლარი და {t2} თეთრი. რამდენი ღირს ორივე ერთად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1|20|3|40", "1|50|3|20", "2|10|4|30", "1|80|2|60", "2|40|3|50", "1|60|4|20", "2|30|3|80", "1|70|4|50", "2|50|3|30", "1|90|4|40", "2|20|4|60", "1|40|3|70"],
      },
      l1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      l2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      t2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => {
      const totT = Number(v.t1) + Number(v.t2);
      const addL = Math.floor(totT / 100);
      const remT = totT % 100;
      return `${Number(v.l1) + Number(v.l2) + addL} ლარი და ${remT} თეთრი`;
    },
    options: (v) => {
      const totT = Number(v.t1) + Number(v.t2);
      const addL = Math.floor(totT / 100);
      const remT = totT % 100;
      const l = Number(v.l1) + Number(v.l2) + addL;
      const ans = `${l} ლარი და ${remT} თეთრი`;
      return [
        ans,
        `${l - 1} ლარი და ${remT} თეთრი`,
        `${l + 1} ლარი და ${remT} თეთრი`,
        `${l} ლარი და ${(remT + 10) % 100} თეთრი`,
      ];
    },
    explanation: ({ vars, answer }) => `ორივე ერთად ღირს: ${answer}.`,
  }),

  // g4-u09-17 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-17', subtopicId: 'u09-money-addition', difficulty: 3 }),
    prompt: 'გიორგიმ წიგნში {l1} ლარი და {t1} თეთრი, ხოლო რვეულებში {l2} ლარი და {t2} თეთრი გადაიხადა. რამდენი დახარჯა სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|75|4|50", "15|60|5|80", "14|80|6|40", "16|50|7|75", "18|40|4|90", "13|70|8|50", "20|50|6|80", "17|60|5|90", "19|80|4|70", "15|90|7|60", "22|50|5|80", "16|85|6|45"],
      },
      l1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      l2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      t2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => {
      const totT = Number(v.t1) + Number(v.t2);
      const addL = Math.floor(totT / 100);
      const remT = totT % 100;
      return `${Number(v.l1) + Number(v.l2) + addL} ლარი და ${remT} თეთრი`;
    },
    options: (v) => {
      const totT = Number(v.t1) + Number(v.t2);
      const addL = Math.floor(totT / 100);
      const remT = totT % 100;
      const l = Number(v.l1) + Number(v.l2) + addL;
      const ans = `${l} ლარი და ${remT} თეთრი`;
      return [
        ans,
        `${l - 1} ლარი და ${remT} თეთრი`,
        `${l + 1} ლარი და ${remT} თეთრი`,
        `${l} ლარი და ${(remT + 15) % 100} თეთრი`,
      ];
    },
    explanation: ({ vars, answer }) => `სულ დახარჯა: ${answer}.`,
  }),

  // g4-u09-18 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-18', subtopicId: 'u09-money-addition', difficulty: 3 }),
    prompt: 'მაღაზიამ დილით {l1} ლარის, ხოლო საღამოს {l2} ლარის საქონელი გაყიდა. რამდენი ლარის საქონელი გაიყიდა სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["125|238", "140|215", "165|220", "180|245", "150|260", "135|255", "190|230", "175|285", "210|240", "160|290", "225|195", "185|275"],
      },
      l1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      l2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.l1) + Number(v.l2),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `სულ გაიყიდა: ${vars.l1} + ${vars.l2} = ${answer} ლარის საქონელი.`,
  }),

  // g4-u09-19 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-19', subtopicId: 'u09-comparing-money', difficulty: 1 }),
    prompt: 'რომელი მეტია: {t} თეთრი თუ {l} ლარი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["150|1|150 თეთრი", "80|1|1 ლარი", "220|2|220 თეთრი", "190|2|2 ლარი", "310|3|310 თეთრი", "270|3|3 ლარი", "450|4|450 თეთრი", "380|4|4 ლარი", "520|5|520 თეთრი", "490|5|5 ლარი", "610|6|610 თეთრი", "580|6|6 ლარი"],
      },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      l: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [
      String(v.ans),
      String(v.ans) === `${v.t} თეთრი` ? `${v.l} ლარი` : `${v.t} თეთრი`,
      'ტოლია',
      'შეუძლებელია შედარება',
    ],
    explanation: ({ vars, answer }) => `რადგან ${vars.l} ლარი = ${Number(vars.l) * 100} თეთრს, მეტია ${answer}.`,
  }),

  // g4-u09-20 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-20', subtopicId: 'u09-comparing-money', difficulty: 1 }),
    optionCount: 3,
    prompt: 'შეადარე: {l} ლარი {t} თეთრი □ {totalT} თეთრი. ჩასვი სწორი ნიშანი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|50|350|=", "4|20|400|>", "2|80|300|<", "5|10|510|=", "6|50|620|>", "3|40|360|<", "7|0|700|=", "4|80|500|<", "8|30|810|>", "2|90|290|=", "5|40|520|>", "6|70|700|<"],
      },
      l: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      totalT: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      sign: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.sign),
    options: () => ['=', '>', '<'],
    explanation: ({ vars, answer }) => `${vars.l} ლარი და ${vars.t} თეთრი არის ${Number(vars.l) * 100 + Number(vars.t)} თეთრი, ამიტომ სწორი ნიშანია „${answer}“.`,
  }),

  // g4-u09-21 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-21', subtopicId: 'u09-comparing-money', difficulty: 2 }),
    prompt: 'რომელი თანხაა მეტი: {l} ლარი {t} თეთრი თუ {x} თეთრი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|20|410|4 ლარი 20 თეთრი", "3|50|380|380 თეთრი", "5|30|510|5 ლარი 30 თეთრი", "6|20|650|650 თეთრი", "7|40|720|7 ლარი 40 თეთრი", "4|70|490|490 თეთრი", "8|10|800|8 ლარი 10 თეთრი", "2|90|310|310 თეთრი", "9|50|930|9 ლარი 50 თეთრი", "5|80|600|600 თეთრი", "6|60|640|6 ლარი 60 თეთრი", "3|70|390|390 თეთრი"],
      },
      l: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      x: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [
      String(v.ans),
      String(v.ans) === `${v.l} ლარი ${v.t} თეთრი` ? `${v.x} თეთრი` : `${v.l} ლარი ${v.t} თეთრი`,
      'ტოლია',
      'შეუძლებელია შედარება',
    ],
    explanation: ({ answer }) => `შედარების შედეგად მეტია: ${answer}.`,
  }),

  // g4-u09-22 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-22', subtopicId: 'u09-comparing-money', difficulty: 2 }),
    optionCount: 3,
    prompt: 'შეადარე: {x} თეთრი □ {l} ლარი {t} თეთრი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["725|7|50|<", "850|8|20|>", "640|6|40|=", "510|5|30|<", "920|8|90|>", "430|4|30|=", "380|4|0|<", "770|7|50|>", "650|6|50|=", "820|8|40|<", "950|9|10|>", "580|5|80|="],
      },
      x: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      l: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      sign: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.sign),
    options: () => ['<', '>', '='],
    explanation: ({ vars, answer }) => `${vars.l} ლარი და ${vars.t} თეთრი არის ${Number(vars.l) * 100 + Number(vars.t)} თეთრი, ამიტომ სწორი ნიშანია „${answer}“.`,
  }),

  // g4-u09-23 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-23', subtopicId: 'u09-comparing-money', difficulty: 3 }),
    prompt: 'რომელი თანხაა ნაკლები: {l} ლარი {t} თეთრი თუ {x} თეთრი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|80|1290|12 ლარი 80 თეთრი", "15|40|1520|1520 თეთრი", "14|20|1450|14 ლარი 20 თეთრი", "18|50|1830|1830 თეთრი", "11|90|1210|11 ლარი 90 თეთრი", "16|70|1640|1640 თეთრი", "13|60|1380|13 ლარი 60 თეთრი", "20|30|2010|2010 თეთრი", "17|80|1800|17 ლარი 80 თეთრი", "22|50|2220|2220 თეთრი", "19|40|1960|19 ლარი 40 თეთრი", "25|20|2500|2500 თეთრი"],
      },
      l: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      x: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [
      String(v.ans),
      String(v.ans) === `${v.l} ლარი ${v.t} თეთრი` ? `${v.x} თეთრი` : `${v.l} ლარი ${v.t} თეთრი`,
      'ტოლია',
      'შეუძლებელია შედარება',
    ],
    explanation: ({ answer }) => `ნაკლები თანხაა: ${answer}.`,
  }),

  // g4-u09-24 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-24', subtopicId: 'u09-comparing-money', difficulty: 3 }),
    prompt: 'ჩამოთვლილთაგან რომელი მიმდევრობაა დალაგებული ზრდადობით (შეკითხვა #{num})?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["180 თეთრი, 250 თეთრი, 3 ლარი, 4 ლარი 20 თეთრი|1", "150 თეთრი, 2 ლარი, 280 თეთრი, 3 ლარი 50 თეთრი|2", "120 თეთრი, 190 თეთრი, 2 ლარი, 3 ლარი 10 თეთრი|3", "200 თეთრი, 240 თეთრი, 3 ლარი, 3 ლარი 80 თეთრი|4", "110 თეთრი, 160 თეთრი, 2 ლარი, 2 ლარი 50 თეთრი|5", "220 თეთრი, 280 თეთრი, 3 ლარი, 4 ლარი|6", "140 თეთრი, 2 ლარი, 260 თეთრი, 3 ლარი 20 თეთრი|7", "170 თეთრი, 210 თეთრი, 3 ლარი, 3 ლარი 50 თეთრი|8", "130 თეთრი, 180 თეთრი, 2 ლარი, 2 ლარი 90 თეთრი|9", "250 თეთრი, 3 ლარი, 340 თეთრი, 4 ლარი 10 თეთრი|10", "160 თეთრი, 2 ლარი, 270 თეთრი, 3 ლარი 60 თეთრი|11", "190 თეთრი, 230 თეთრი, 3 ლარი, 4 ლარი 50 თეთრი|12"],
      },
      correct: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      num: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => String(v.correct),
    options: (v) => {
      const c = String(v.correct);
      const parts = c.split(', ');
      const w1 = `${parts[1]}, ${parts[0]}, ${parts[2]}, ${parts[3]}`;
      const w2 = `${parts[3]}, ${parts[2]}, ${parts[1]}, ${parts[0]}`;
      const w3 = `${parts[0]}, ${parts[2]}, ${parts[1]}, ${parts[3]}`;
      return [c, w1, w2, w3];
    },
    explanation: ({ answer }) => `თეთრებში გადაყვანით ყველა თანხა იზრდება, ამიტომ სწორი ზრდადი რიგია: ${answer}.`,
  }),

  // g4-u09-25 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-25', subtopicId: 'u09-unit-price', difficulty: 1 }),
    prompt: 'ერთი ფანქარი {p} ლარი ღირს. რა ღირს {n} ასეთი ფანქარი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|5", "3|4", "2|6", "3|5", "4|3", "2|7", "3|6", "4|4", "2|8", "3|7", "4|5", "5|4"],
      },
      p: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.p) * Number(v.n),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ღირებულებაა: ${vars.n} × ${vars.p} = ${answer} ლარი.`,
  }),

  // g4-u09-26 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-26', subtopicId: 'u09-unit-price', difficulty: 1 }),
    prompt: 'ერთი რვეული {p} ლარი ღირს. რა ღირს {n} ასეთი რვეული?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|4", "4|3", "3|5", "4|4", "5|3", "3|6", "4|5", "5|4", "6|3", "4|6", "5|5", "6|4"],
      },
      p: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.p) * Number(v.n),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ღირებულებაა: ${vars.n} × ${vars.p} = ${answer} ლარი.`,
  }),

  // g4-u09-27 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-27', subtopicId: 'u09-unit-price', difficulty: 2 }),
    prompt: 'ერთი წიგნი {p} ლარი ღირს. რამდენი უნდა გადაიხადო {n} ასეთი წიგნისთვის?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|3", "15|2", "14|3", "16|2", "18|2", "12|4", "15|3", "20|2", "14|4", "16|3", "22|2", "18|3"],
      },
      p: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.p) * Number(v.n),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 5),
    explanation: ({ vars, answer }) => `წიგნების ღირებულებაა: ${vars.n} × ${vars.p} = ${answer} ლარი.`,
  }),

  // g4-u09-28 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-28', subtopicId: 'u09-unit-price', difficulty: 2 }),
    prompt: 'ერთი კილოგრამი ვაშლი {p} ლარი ღირს. რა ღირს {n} კილოგრამი ვაშლი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|6", "3|8", "5|5", "4|7", "3|9", "5|6", "4|8", "6|5", "5|7", "6|6", "4|9", "5|8"],
      },
      p: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.p) * Number(v.n),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `ვაშლის ღირებულებაა: ${vars.n} × ${vars.p} = ${answer} ლარი.`,
  }),

  // g4-u09-29 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-29', subtopicId: 'u09-unit-price', difficulty: 3 }),
    prompt: 'ერთი ბურთი {p} ლარი ღირს. რამდენი ღირს {n} ასეთი ბურთი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["15|7", "18|5", "20|6", "16|6", "25|4", "14|8", "22|5", "18|6", "24|4", "15|8", "30|4", "16|7"],
      },
      p: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.p) * Number(v.n),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 5),
    explanation: ({ vars, answer }) => `ბურთების ღირებულებაა: ${vars.n} × ${vars.p} = ${answer} ლარი.`,
  }),

  // g4-u09-30 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-30', subtopicId: 'u09-unit-price', difficulty: 3 }),
    prompt: '{n} ერთნაირი კალამი {t} ლარი ღირს. რა ღირს ერთი კალამი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|24", "6|30", "7|35", "9|36", "5|40", "8|48", "6|42", "7|49", "8|56", "9|54", "6|48", "7|56"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.t) / Number(v.n),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ერთის ფასია: ${vars.t} ÷ ${vars.n} = ${answer} ლარი.`,
  }),

  // g4-u09-31 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-31', subtopicId: 'u09-total-cost', difficulty: 1 }),
    prompt: 'ნინომ იყიდა {n} რვეული, თითოეული {p} ლარი ღირდა, და ერთი კალამი {k} ლარად. რამდენი გადაიხადა სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|2|3", "4|2|5", "5|2|4", "3|3|4", "4|3|5", "5|3|6", "3|4|5", "4|4|6", "2|5|4", "3|5|7", "4|5|8", "5|4|6"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.n) * Number(v.p) + Number(v.k),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `სულ გადაიხადა: ${vars.n} × ${vars.p} + ${vars.k} = ${Number(vars.n) * Number(vars.p)} + ${vars.k} = ${answer} ლარი.`,
  }),

  // g4-u09-32 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-32', subtopicId: 'u09-total-cost', difficulty: 1 }),
    prompt: 'მაღაზიამ გაყიდა {n1} წიგნი, თითოეული {p1} ლარი ღირდა, და {n2} რვეული, თითოეული {p2} ლარი. რამდენი ლარის საქონელი გაიყიდა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|8|4|2", "4|9|5|3", "6|7|4|3", "5|10|6|2", "3|12|5|4", "4|8|6|3", "5|7|5|4", "6|8|4|4", "4|10|5|3", "3|15|4|5", "5|9|3|4", "4|12|5|2"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      p2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.n1) * Number(v.p1) + Number(v.n2) * Number(v.p2),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 5, 5),
    explanation: ({ vars, answer }) => `სულ გაიყიდა: ${vars.n1} × ${vars.p1} + ${vars.n2} × ${vars.p2} = ${Number(vars.n1) * Number(vars.p1)} + ${Number(vars.n2) * Number(vars.p2)} = ${answer} ლარის საქონელი.`,
  }),

  // g4-u09-33 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-33', subtopicId: 'u09-total-cost', difficulty: 2 }),
    prompt: 'გიორგიმ იყიდა {n1} კგ ვაშლი (კილოგრამი {p1} ლარი) და {n2} კგ მსხალი (კილოგრამი {p2} ლარი). რამდენი გადაიხადა სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|4|3|5", "3|4|2|6", "4|3|3|5", "3|5|4|4", "2|6|5|4", "4|4|3|6", "5|3|2|7", "3|6|4|5", "4|5|3|7", "5|4|4|5", "2|7|5|5", "3|7|4|6"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      p2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.n1) * Number(v.p1) + Number(v.n2) * Number(v.p2),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `სულ გადაიხადა: ${vars.n1} × ${vars.p1} + ${vars.n2} × ${vars.p2} = ${Number(vars.n1) * Number(vars.p1)} + ${Number(vars.n2) * Number(vars.p2)} = ${answer} ლარი.`,
  }),

  // g4-u09-34 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-34', subtopicId: 'u09-total-cost', difficulty: 2 }),
    prompt: 'ერთი სათამაშო {p1} ლარი ღირს, ხოლო ერთი ბურთი — {p2} ლარი. რამდენი ღირს {n1} სათამაშო და {n2} ბურთი ერთად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|12|2|8", "4|10|3|9", "2|15|4|8", "3|14|2|10", "4|12|3|7", "5|10|2|12", "3|15|4|6", "2|18|3|9", "4|14|2|11", "3|16|3|8", "5|12|2|10", "4|15|3|8"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      p2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.n1) * Number(v.p1) + Number(v.n2) * Number(v.p2),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 5, 5),
    explanation: ({ vars, answer }) => `სულ ღირს: ${vars.n1} × ${vars.p1} + ${vars.n2} × ${vars.p2} = ${Number(vars.n1) * Number(vars.p1)} + ${Number(vars.n2) * Number(vars.p2)} = ${answer} ლარი.`,
  }),

  // g4-u09-35 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-35', subtopicId: 'u09-total-cost', difficulty: 3 }),
    prompt: 'ოჯახმა იყიდა {n} ბილეთი, თითოეული {p} ლარი ღირდა, და საკვებში {k} ლარი გადაიხადა. რამდენი დახარჯა სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|15|28", "3|20|35", "5|12|30", "4|18|25", "6|10|45", "3|25|40", "4|20|32", "5|15|38", "3|30|25", "4|22|30", "5|18|42", "6|15|35"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.n) * Number(v.p) + Number(v.k),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 5),
    explanation: ({ vars, answer }) => `სულ დახარჯა: ${vars.n} × ${vars.p} + ${vars.k} = ${Number(vars.n) * Number(vars.p)} + ${vars.k} = ${answer} ლარი.`,
  }),

  // g4-u09-36 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-36', subtopicId: 'u09-total-cost', difficulty: 3 }),
    prompt: 'მაღაზიამ გაყიდა {n1} ჩანთა, თითოეული {p1} ლარი ღირდა, და {n2} ქუდი, თითოეული {p2} ლარი. რამდენი ლარის საქონელი გაიყიდა სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["6|35|4|12", "5|40|6|15", "4|45|5|14", "7|30|4|16", "5|35|6|12", "6|30|5|15", "8|25|4|18", "5|45|4|20", "6|40|5|12", "7|35|3|20", "4|50|6|15", "5|50|5|18"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      p2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.n1) * Number(v.p1) + Number(v.n2) * Number(v.p2),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 20, 10),
    explanation: ({ vars, answer }) => `სულ გაიყიდა: ${vars.n1} × ${vars.p1} + ${vars.n2} × ${vars.p2} = ${Number(vars.n1) * Number(vars.p1)} + ${Number(vars.n2) * Number(vars.p2)} = ${answer} ლარი.`,
  }),

  // g4-u09-37 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-37', subtopicId: 'u09-sufficient-money', difficulty: 1 }),
    optionCount: 2,
    prompt: 'ნინოს აქვს {m} ლარი. შეუძლია თუ არა იყიდოს {p1}-ლარიანი წიგნი და {p2}-ლარიანი რვეული?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10|7|2|დიახ", "10|8|3|არა", "15|9|5|დიახ", "12|8|5|არა", "20|12|7|დიახ", "18|11|8|არა", "25|15|8|დიახ", "14|10|5|არა", "30|18|11|დიახ", "22|15|8|არა", "16|9|6|დიახ", "20|14|7|არა"],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      p2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    options: () => ['დიახ', 'არა'],
    explanation: ({ vars, answer }) => `ნივთების საერთო ფასია ${vars.p1} + ${vars.p2} = ${Number(vars.p1) + Number(vars.p2)} ლარი, რაც ${Number(vars.m) >= Number(vars.p1) + Number(vars.p2) ? 'არ აღემატება' : 'აღემატება'} ${vars.m} ლარს. პასუხია: ${answer}.`,
  }),

  // g4-u09-38 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-38', subtopicId: 'u09-sufficient-money', difficulty: 1 }),
    optionCount: 2,
    prompt: 'გიორგის აქვს {m} ლარი. მას სურს იყიდოს {p1}-ლარიანი ბურთი და {p2}-ლარიანი სათამაშო. ეყოფა თუ არა თანხა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["15|9|8|არა, არ ეყოფა", "15|8|6|დიახ, ეყოფა", "20|12|9|არა, არ ეყოფა", "20|11|8|დიახ, ეყოფა", "25|14|12|არა, არ ეყოფა", "25|13|11|დიახ, ეყოფა", "18|10|9|არა, არ ეყოფა", "18|9|8|დიახ, ეყოფა", "30|17|14|არა, არ ეყოფა", "30|16|13|დიახ, ეყოფა", "22|13|10|არა, არ ეყოფა", "22|12|9|დიახ, ეყოფა"],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      p2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    options: () => ['დიახ, ეყოფა', 'არა, არ ეყოფა'],
    explanation: ({ vars, answer }) => `ნივთების ღირებულებაა ${vars.p1} + ${vars.p2} = ${Number(vars.p1) + Number(vars.p2)} ლარი. პასუხია: ${answer}.`,
  }),

  // g4-u09-39 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-39', subtopicId: 'u09-sufficient-money', difficulty: 2 }),
    optionCount: 2,
    prompt: 'კალამი {p1} ლარი ღირს, რვეული კი — {p2} ლარი. ლუკას აქვს {m} ლარი. ეყოფა თუ არა თანხა {n1} კალმისა და {n2} რვეულის საყიდლად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|3|2|3|2|არა, არ ეყოფა", "15|3|2|3|2|დიახ, ეყოფა", "16|4|2|2|4|დიახ, ეყოფა", "14|4|3|2|3|არა, არ ეყოფა", "20|5|2|2|4|დიახ, ეყოფა", "18|5|3|2|3|არა, არ ეყოფა", "22|4|3|3|3|დიახ, ეყოფა", "19|4|3|3|3|არა, არ ეყოფა", "25|6|2|2|5|დიახ, ეყოფა", "20|5|4|2|3|არა, არ ეყოფა", "24|5|3|3|3|დიახ, ეყოფა", "21|6|3|2|4|არა, არ ეყოფა"],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      p2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[5]] },
    },
    answer: (v) => String(v.ans),
    options: () => ['დიახ, ეყოფა', 'არა, არ ეყოფა'],
    explanation: ({ vars, answer }) => `საერთო ფასია: ${vars.n1} × ${vars.p1} + ${vars.n2} × ${vars.p2} = ${Number(vars.n1) * Number(vars.p1) + Number(vars.n2) * Number(vars.p2)} ლარი. პასუხია: ${answer}.`,
  }),

  // g4-u09-40 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-40', subtopicId: 'u09-sufficient-money', difficulty: 2 }),
    prompt: 'ანას აქვს {m} ლარი. მას სურს იყიდოს {p1}-ლარიანი წიგნი და {p2}-ლარიანი თამაში. რამდენი ლარი აკლდება?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["25|18|9|2", "30|22|12|4", "20|14|8|2", "35|25|13|3", "28|19|14|5", "40|28|16|4", "24|17|10|3", "32|24|11|3", "26|18|12|4", "36|27|14|5", "22|15|9|2", "38|26|15|3"],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      p2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.p1) + Number(v.p2) - Number(v.m),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ნივთების საერთო ფასია ${vars.p1} + ${vars.p2} = ${Number(vars.p1) + Number(vars.p2)} ლარი. აკლდება: ${Number(vars.p1) + Number(vars.p2)} − ${vars.m} = ${answer} ლარი.`,
  }),

  // g4-u09-41 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-41', subtopicId: 'u09-sufficient-money', difficulty: 3 }),
    prompt: 'მარიამს აქვს {m} ლარი. მან იყიდა {p1}-ლარიანი ჩანთა და {p2}-ლარიანი წიგნი. რამდენი ლარი დარჩა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["50|23|14|13", "60|28|17|15", "55|24|16|15", "70|32|21|17", "45|22|11|12", "65|30|18|17", "50|26|12|12", "75|35|22|18", "80|38|24|18", "60|25|19|16", "70|34|16|20", "85|42|23|20"],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      p2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.m) - Number(v.p1) - Number(v.p2),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `დარჩა: ${vars.m} − (${vars.p1} + ${vars.p2}) = ${vars.m} − ${Number(vars.p1) + Number(vars.p2)} = ${answer} ლარი.`,
  }),

  // g4-u09-42 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-42', subtopicId: 'u09-sufficient-money', difficulty: 3 }),
    optionCount: 2,
    prompt: 'მაღაზიაში სათამაშო {p1} ლარი ღირს. მყიდველს აქვს {m} ლარი და სურს კიდევ {p2}-ლარიანი რვეულის ყიდვა. ეყოფა თუ არა თანხა ორივე ნივთისთვის?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["17|5|20|არა, არ ეყოფა", "16|4|20|დიახ, ეყოფა", "22|6|25|არა, არ ეყოფა", "18|7|25|დიახ, ეყოფა", "28|8|35|არა, არ ეყოფა", "26|8|35|დიახ, ეყოფა", "34|9|40|არა, არ ეყოფა", "31|8|40|დიახ, ეყოფა", "42|10|50|არა, არ ეყოფა", "38|11|50|დიახ, ეყოფა", "23|8|30|არა, არ ეყოფა", "21|8|30|დიახ, ეყოფა"],
      },
      p1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    options: () => ['დიახ, ეყოფა', 'არა, არ ეყოფა'],
    explanation: ({ vars, answer }) => `საერთო ფასია ${vars.p1} + ${vars.p2} = ${Number(vars.p1) + Number(vars.p2)} ლარი, რაც ${Number(vars.m) >= Number(vars.p1) + Number(vars.p2) ? 'არ აღემატება' : 'აღემატება'} ${vars.m} ლარს. პასუხია: ${answer}.`,
  }),

  // g4-u09-43 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-43', subtopicId: 'u09-currency-conversion', difficulty: 1 }),
    prompt: 'პირობითად, 1 ევრო უდრის {r} ლარს. რამდენი ლარია {n} ევრო?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|5", "3|6", "3|7", "3|8", "3|9", "3|10", "4|4", "4|5", "4|6", "4|7", "4|8", "3|12"],
      },
      r: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.n) * Number(v.r),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `თანხაა: ${vars.n} × ${vars.r} = ${answer} ლარი.`,
  }),

  // g4-u09-44 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-44', subtopicId: 'u09-currency-conversion', difficulty: 1 }),
    prompt: 'პირობითად, 1 დოლარი უდრის 2 ლარს და {t} თეთრს. რამდენი ლარია 10 დოლარი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10|21", "20|22", "30|23", "40|24", "50|25", "60|26", "70|27", "80|28", "90|29", "0|20", "100|30", "150|35"],
      },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `1 დოლარი არის 2 ლარი და ${vars.t} თეთრი. 10 დოლარია: ${answer} ლარი.`,
  }),

  // g4-u09-45 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-45', subtopicId: 'u09-currency-conversion', difficulty: 2 }),
    prompt: 'პირობითად, 1 ევრო უდრის {r} ლარს. რამდენი ევროა {t} ლარი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|21", "3|24", "3|27", "3|30", "3|36", "3|42", "4|24", "4|28", "4|32", "4|36", "4|44", "4|48"],
      },
      r: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.t) / Number(v.r),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ევროების რაოდენობაა: ${vars.t} ÷ ${vars.r} = ${answer} ევრო.`,
  }),

  // g4-u09-46 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-46', subtopicId: 'u09-currency-conversion', difficulty: 2 }),
    prompt: 'პირობითად, 1 დოლარი უდრის 2 ლარს და 50 თეთრს. რამდენი დოლარია {t} ლარი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["20|8", "25|10", "30|12", "35|14", "40|16", "50|20", "15|6", "45|18", "60|24", "70|28", "80|32", "100|40"],
      },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `რადგან ყოველი 5 ლარი არის 2 დოლარი: ${vars.t} ÷ 2.5 = ${answer} დოლარი.`,
  }),

  // g4-u09-47 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-47', subtopicId: 'u09-currency-conversion', difficulty: 3 }),
    prompt: 'პირობითად, 1 ფუნტი უდრის 3 ლარს და 50 თეთრს. რამდენი ლარია {n} ფუნტი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|28", "4|14", "6|21", "10|35", "12|42", "14|49", "16|56", "18|63", "20|70", "22|77", "24|84", "26|91"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 7, 7),
    explanation: ({ vars, answer }) => `თანხაა: ${vars.n} × 3.5 = ${answer} ლარი.`,
  }),

  // g4-u09-48 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-48', subtopicId: 'u09-currency-conversion', difficulty: 3 }),
    prompt: 'პირობითად, 1 ევრო უდრის {r} ლარს. რამდენი ლარია {n1} ევრო და {n2} ევრო ერთად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|12|50", "3|15|45", "3|20|40", "3|14|36", "4|10|25", "4|12|30", "3|18|32", "3|22|38", "4|15|20", "4|14|26", "3|25|35", "4|16|24"],
      },
      r: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => (Number(v.n1) + Number(v.n2)) * Number(v.r),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 10, 10),
    explanation: ({ vars, answer }) => `სულ არის ${vars.n1} + ${vars.n2} = ${Number(vars.n1) + Number(vars.n2)} ევრო. ლარებში: ${Number(vars.n1) + Number(vars.n2)} × ${vars.r} = ${answer} ლარი.`,
  }),

  // g4-u09-49 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-49', subtopicId: 'u09-multi-step-money', difficulty: 1 }),
    prompt: 'ნინოს ჰქონდა {m} ლარი. მან იყიდა {p1}-ლარიანი წიგნი და {p2}-ლარიანი რვეული. რამდენი ლარი დარჩა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["30|8|5", "25|7|4", "35|10|6", "28|9|5", "40|12|8", "32|11|6", "36|13|7", "45|15|9", "38|12|7", "50|16|10", "42|14|8", "48|15|11"],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      p2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.m) - Number(v.p1) - Number(v.p2),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `დარჩა: ${vars.m} − (${vars.p1} + ${vars.p2}) = ${vars.m} − ${Number(vars.p1) + Number(vars.p2)} = ${answer} ლარი.`,
  }),

  // g4-u09-50 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-50', subtopicId: 'u09-multi-step-money', difficulty: 1 }),
    prompt: 'გიორგიმ იყიდა {n1} კალამი (თითო {p1} ლარი) და {n2} რვეული (თითო {p2} ლარი). თუ მან {m} ლარი გადაიხადა, რამდენი ლარი უნდა დაუბრუნონ ხურდა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|2|2|3|20", "4|2|3|2|25", "2|3|4|2|20", "3|3|2|4|30", "4|3|3|2|30", "5|2|2|4|25", "3|4|2|3|25", "4|2|4|3|30", "2|5|3|3|25", "3|3|4|3|30", "4|3|2|5|30", "5|2|3|4|30"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      p2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
    },
    answer: (v) => Number(v.m) - (Number(v.n1) * Number(v.p1) + Number(v.n2) * Number(v.p2)),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ნივთების ფასია: ${vars.n1} × ${vars.p1} + ${vars.n2} × ${vars.p2} = ${Number(vars.n1) * Number(vars.p1) + Number(vars.n2) * Number(vars.p2)} ლარი. ხურდაა: ${vars.m} − ${Number(vars.n1) * Number(vars.p1) + Number(vars.n2) * Number(vars.p2)} = ${answer} ლარი.`,
  }),

  // g4-u09-51 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-51', subtopicId: 'u09-multi-step-money', difficulty: 2 }),
    prompt: 'ოჯახმა იყიდა {n1} კგ ვაშლი (კილოგრამი {p1} ლარი) და {n2} კგ მსხალი (კილოგრამი {p2} ლარი). რამდენი გადაიხადა ოჯახმა სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|3|2|5", "5|3|3|4", "4|4|2|6", "3|5|4|3", "5|4|3|5", "6|3|2|7", "4|5|3|6", "5|3|4|4", "3|6|2|8", "4|4|4|5", "6|4|2|6", "5|5|3|4"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      p1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      p2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.n1) * Number(v.p1) + Number(v.n2) * Number(v.p2),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `სულ გადაიხადეს: ${vars.n1} × ${vars.p1} + ${vars.n2} × ${vars.p2} = ${answer} ლარი.`,
  }),

  // g4-u09-52 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-52', subtopicId: 'u09-multi-step-money', difficulty: 2 }),
    prompt: 'მარიამს ჰქონდა {m} ლარი. მან იყიდა {n} წიგნი (თითოეული {p} ლარი) და ჩანთა {k} ლარად. რამდენი ლარი დარჩა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["50|2|12|18", "60|2|14|16", "55|2|15|12", "70|3|12|20", "65|2|16|18", "75|3|14|22", "80|3|15|24", "60|3|11|15", "70|2|18|20", "85|3|16|25", "75|2|20|22", "90|3|18|24"],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      p: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      k: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.m) - (Number(v.n) * Number(v.p) + Number(v.k)),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `დანახარჯია ${vars.n} × ${vars.p} + ${vars.k} = ${Number(vars.n) * Number(vars.p) + Number(vars.k)} ლარი. დარჩა: ${vars.m} − ${Number(vars.n) * Number(vars.p) + Number(vars.k)} = ${answer} ლარი.`,
  }),

  // g4-u09-53 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-53', subtopicId: 'u09-multi-step-money', difficulty: 3 }),
    prompt: 'მაღაზიამ დილით {m} ლარის საქონელი გაყიდა, ხოლო საღამოს — {e} ლარის. თუ დღის დასაწყისში სალაროში {s} ლარი იყო, რამდენი ლარი იქნება სალაროში დღის ბოლოს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["100|240|175", "120|210|185", "150|200|190", "100|260|180", "140|230|170", "110|250|195", "130|220|180", "150|240|210", "125|235|175", "160|215|185", "100|280|190", "140|260|200"],
      },
      s: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      e: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.s) + Number(v.m) + Number(v.e),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 50, 10),
    explanation: ({ vars, answer }) => `სალაროში იქნება: ${vars.s} + ${vars.m} + ${vars.e} = ${answer} ლარი.`,
  }),

  // g4-u09-54 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-54', subtopicId: 'u09-multi-step-money', difficulty: 3 }),
    prompt: 'ლუკას ჰქონდა {m} ლარი. მან იყიდა {n1} მაისური (თითო {p1} ლარი) და {n2} ქუდი (თითო {p2} ლარი). რამდენი ლარი დარჩა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["80|3|15|2|8", "90|3|18|2|10", "100|4|15|3|8", "85|3|16|2|9", "95|4|14|2|12", "110|4|16|3|10", "90|4|12|2|14", "105|3|20|3|9", "100|3|18|3|11", "120|4|18|2|15", "115|4|17|3|10", "95|3|19|2|12"],
      },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      p1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      p2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
    },
    answer: (v) => Number(v.m) - (Number(v.n1) * Number(v.p1) + Number(v.n2) * Number(v.p2)),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 2),
    explanation: ({ vars, answer }) => `დანახარჯია: ${vars.n1} × ${vars.p1} + ${vars.n2} × ${vars.p2} = ${Number(vars.n1) * Number(vars.p1) + Number(vars.n2) * Number(vars.p2)} ლარი. დარჩა: ${vars.m} − ${Number(vars.n1) * Number(vars.p1) + Number(vars.n2) * Number(vars.p2)} = ${answer} ლარი.`,
  }),

  // g4-u09-55 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-55', subtopicId: 'u09-money-subtraction', difficulty: 1 }),
    prompt: 'გამოთვალე: {l1} ლარი − {l2} ლარი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|3", "10|4", "12|5", "15|7", "14|6", "16|8", "18|9", "20|8", "22|7", "25|11", "17|6", "19|8"],
      },
      l1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      l2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.l1) - Number(v.l2),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `სხვაობაა: ${vars.l1} − ${vars.l2} = ${answer} ლარი.`,
  }),

  // g4-u09-56 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u09-56', subtopicId: 'u09-money-subtraction', difficulty: 1 }),
    prompt: 'გამოთვალე: {l1} ლარი − {l2} ლარი {t2} თეთრი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10|4|50", "12|5|50", "15|6|50", "14|7|50", "20|8|50", "18|9|50", "16|6|50", "22|11|50", "25|12|50", "30|14|50", "17|8|50", "24|10|50"],
      },
      l1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      l2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      t2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => `${Number(v.l1) - Number(v.l2) - 1} ლარი 50 თეთრი`,
    options: (v) => {
      const l = Number(v.l1) - Number(v.l2) - 1;
      const ans = `${l} ლარი 50 თეთრი`;
      return [
        ans,
        `${l + 1} ლარი 50 თეთრი`,
        `${l} ლარი 0 თეთრი`,
        `${l - 1} ლარი 50 თეთრი`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.l1} ლარს გამოკლებული ${vars.l2} ლარი და ${vars.t2} თეთრი არის: ${answer}.`,
  }),

  // g4-u09-57 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-57', subtopicId: 'u09-money-subtraction', difficulty: 2 }),
    prompt: 'გამოთვალე: {l1} ლარი {t1} თეთრი − {l2} ლარი {t2} თეთრი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["15|20|7|80", "16|30|8|70", "14|10|6|50", "18|40|9|80", "20|25|11|60", "17|15|8|50", "22|30|12|70", "19|20|10|60", "21|10|9|50", "25|40|13|80", "18|25|9|75", "24|35|11|85"],
      },
      l1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      l2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      t2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => {
      const diffT = (Number(v.l1) * 100 + Number(v.t1)) - (Number(v.l2) * 100 + Number(v.t2));
      return `${Math.floor(diffT / 100)} ლარი ${diffT % 100} თეთრი`;
    },
    options: (v) => {
      const diffT = (Number(v.l1) * 100 + Number(v.t1)) - (Number(v.l2) * 100 + Number(v.t2));
      const l = Math.floor(diffT / 100);
      const t = diffT % 100;
      const ans = `${l} ლარი ${t} თეთრი`;
      return [
        ans,
        `${l - 1} ლარი ${t} თეთრი`,
        `${l + 1} ლარი ${t} თეთრი`,
        `${l} ლარი ${(t + 20) % 100} თეთრი`,
      ];
    },
    explanation: ({ answer }) => `სხვაობაა: ${answer}.`,
  }),

  // g4-u09-58 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u09-58', subtopicId: 'u09-money-subtraction', difficulty: 2 }),
    prompt: 'ნინოს ჰქონდა {l1} ლარი. მან {l2} ლარი და {t2} თეთრი დახარჯა. რამდენი დარჩა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["25|13|50", "30|16|50", "28|14|50", "35|18|50", "40|21|50", "32|17|50", "45|22|50", "36|19|50", "50|24|50", "42|23|50", "38|16|50", "48|26|50"],
      },
      l1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      l2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      t2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => `${Number(v.l1) - Number(v.l2) - 1} ლარი და 50 თეთრი`,
    options: (v) => {
      const l = Number(v.l1) - Number(v.l2) - 1;
      const ans = `${l} ლარი და 50 თეთრი`;
      return [
        ans,
        `${l + 1} ლარი და 50 თეთრი`,
        `${l} ლარი და 0 თეთრი`,
        `${l - 1} ლარი და 50 თეთრი`,
      ];
    },
    explanation: ({ vars, answer }) => `დარჩა: ${vars.l1} ლარს − ${vars.l2} ლარი ${vars.t2} თეთრი = ${answer}.`,
  }),

  // g4-u09-59 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-59', subtopicId: 'u09-money-subtraction', difficulty: 3 }),
    prompt: 'მაღაზიაში ნივთი {l1} ლარი და {t1} თეთრი ღირდა. მყიდველმა {l2} ლარი გადაიხადა. რამდენი ხურდა უნდა დაუბრუნონ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["18|75|20", "16|50|20", "17|25|20", "26|40|30", "24|80|30", "28|50|30", "35|60|40", "37|20|40", "42|75|50", "45|50|50", "44|30|50", "46|80|50"],
      },
      l1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      l2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => {
      const diffT = Number(v.l2) * 100 - (Number(v.l1) * 100 + Number(v.t1));
      return `${Math.floor(diffT / 100)} ლარი და ${diffT % 100} თეთრი`;
    },
    options: (v) => {
      const diffT = Number(v.l2) * 100 - (Number(v.l1) * 100 + Number(v.t1));
      const l = Math.floor(diffT / 100);
      const t = diffT % 100;
      const ans = `${l} ლარი და ${t} თეთრი`;
      return [
        ans,
        `${l + 1} ლარი და ${t} თეთრი`,
        `${l} ლარი და ${(t + 25) % 100} თეთრი`,
        `${l - 1 >= 0 ? l - 1 : l + 2} ლარი და ${t} თეთრი`,
      ];
    },
    explanation: ({ vars, answer }) => `ხურდაა: ${vars.l2} ლარს გამოკლებული ${vars.l1} ლარი ${vars.t1} თეთრი = ${answer}.`,
  }),

  // g4-u09-60 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u09-60', subtopicId: 'u09-money-subtraction', difficulty: 3 }),
    prompt: 'გიორგის ჰქონდა 100 ლარი. მან იყიდა წიგნი {l1} ლარად და {t1} თეთრად და თამაში {l2} ლარად და {t2} თეთრად. რამდენი ლარი და თეთრი დარჩა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["27|50|36|80", "25|40|34|60", "32|70|28|50", "26|30|41|20", "30|60|35|40", "28|80|33|70", "34|20|29|50", "29|50|38|40", "31|60|32|80", "24|70|42|50", "35|40|31|60", "27|80|39|20"],
      },
      l1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      l2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      t2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => {
      const spent = (Number(v.l1) * 100 + Number(v.t1)) + (Number(v.l2) * 100 + Number(v.t2));
      const rem = 10000 - spent;
      return `${Math.floor(rem / 100)} ლარი და ${rem % 100} თეთრი`;
    },
    options: (v) => {
      const spent = (Number(v.l1) * 100 + Number(v.t1)) + (Number(v.l2) * 100 + Number(v.t2));
      const rem = 10000 - spent;
      const l = Math.floor(rem / 100);
      const t = rem % 100;
      const ans = `${l} ლარი და ${t} თეთრი`;
      return [
        ans,
        `${l - 1} ლარი და ${t} თეთრი`,
        `${l + 1} ლარი და ${t} თეთრი`,
        `${l} ლარი და ${(t + 10) % 100} თეთრი`,
      ];
    },
    explanation: ({ answer }) => `საერთო დანახარჯის გამოკლების შემდეგ დარჩა: ${answer}.`,
  }),
];
