import { defineTemplate, type QuestionTemplate } from './types';

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

export const G4_U15_SUBTOPICS = [
  'u15-parts-of-whole',
  'u15-numerator-denominator',
  'u15-fractions-number-line',
  'u15-reciprocal-fractions',
  'u15-fraction-division',
  'u15-equivalent-fractions-problems',
  'u15-fraction-addition-same-denom',
  'u15-fraction-subtraction-same-denom',
  'u15-fraction-word-problems',
  'u15-fraction-multiplication-problems',
  'u15-simplifying-fractions',
  'u15-fraction-multiplication',
  'u15-equivalent-fractions',
  'u15-equivalent-fractions-visual',
] as const;

export type G4U15SubtopicId = (typeof G4_U15_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G4U15SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 4 as const,
  topicId: 'g4-tsiladebi' as const,
  unitId: 'g4-tsiladebi' as const,
  ...options,
});

export const G4_U15_TEMPLATES: QuestionTemplate[] = [
  // g4-u15-01 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-01', subtopicId: 'u15-parts-of-whole', difficulty: 1 }),
    prompt: 'პიცა {tot} ტოლ ნაწილად დაყვეს. ნინომ {ate} ნაწილი შეჭამა. პიცის რა ნაწილი შეჭამა ნინომ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|1|1/4", "3|1|1/3", "5|1|1/5", "6|1|1/6", "8|1|1/8", "2|1|1/2", "7|1|1/7", "9|1|1/9", "10|1|1/10", "12|1|1/12", "4|2|2/4", "6|2|2/6", "8|2|2/8", "5|2|2/5", "10|3|3/10", "12|5|5/12", "7|3|3/7", "9|4|4/9"],
      },
      tot: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ate: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.ate) + 1}/${ctx.vars.tot}`,
      `${ctx.vars.ate}/${Number(ctx.vars.tot) + 1}`,
      `${ctx.vars.tot}/${ctx.vars.ate}`,
    ],
    explanation: ({ vars, answer }) => `მთელი დაყოფილია ${vars.tot} ნაწილად და აღებულია ${vars.ate}, ანუ ${answer}.`,
  }),

  // g4-u15-02 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-02', subtopicId: 'u15-parts-of-whole', difficulty: 1 }),
    prompt: 'მართკუთხედი {tot} ტოლ ნაწილადაა დაყოფილი. მისი {sh} ნაწილი გაფერადებულია. წილადის სახით ჩაწერე გაფერადებული ნაწილი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["6|2|2/6", "4|1|1/4", "8|3|3/8", "5|2|2/5", "10|4|4/10", "7|3|3/7", "6|3|3/6", "8|5|5/8", "9|4|4/9", "12|7|7/12", "5|3|3/5", "10|6|6/10", "7|4|4/7", "8|2|2/8", "6|4|4/6", "9|5|5/9", "12|5|5/12", "10|7|7/10"],
      },
      tot: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      sh: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.sh) + 1}/${ctx.vars.tot}`,
      `${ctx.vars.sh}/${Number(ctx.vars.tot) + 1}`,
      `${ctx.vars.tot}/${ctx.vars.sh}`,
    ],
    explanation: ({ vars, answer }) => `გაფერადებული ნაწილია ${answer}.`,
  }),

  // g4-u15-03 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-03', subtopicId: 'u15-parts-of-whole', difficulty: 2 }),
    prompt: 'ტორტი {tot} ტოლ ნაჭრად დაჭრეს. სტუმრებმა {ate} ნაჭერი შეჭამეს. ტორტის რა ნაწილი შეჭამეს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|3|3/8", "6|2|2/6", "10|4|4/10", "12|5|5/12", "8|5|5/8", "6|3|3/6", "7|2|2/7", "9|4|4/9", "10|7|7/10", "12|7|7/12", "8|1|1/8", "6|4|4/6", "5|2|2/5", "7|3|3/7", "9|5|5/9", "10|3|3/10", "8|4|4/8", "12|8|8/12"],
      },
      tot: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ate: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.ate) + 1}/${ctx.vars.tot}`,
      `${ctx.vars.ate}/${Number(ctx.vars.tot) + 1}`,
      `${Number(ctx.vars.tot) - Number(ctx.vars.ate)}/${ctx.vars.tot}`,
    ],
    explanation: ({ vars, answer }) => `შეჭამეს ${answer} ნაწილი.`,
  }),

  // g4-u15-04 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-04', subtopicId: 'u15-parts-of-whole', difficulty: 2 }),
    prompt: 'წრე {tot} ტოლ ნაწილადაა დაყოფილი. მისი {sh} ნაწილი გაფერადებულია. ჩაწერე შესაბამისი წილადი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|4|4/5", "4|3|3/4", "6|5|5/6", "8|7|7/8", "10|9|9/10", "3|2|2/3", "5|3|3/5", "6|4|4/6", "8|5|5/8", "7|4|4/7", "9|7|7/9", "12|11|11/12", "4|2|2/4", "7|5|5/7", "8|3|3/8", "10|7|7/10", "6|2|2/6", "9|5|5/9"],
      },
      tot: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      sh: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Math.max(1, Number(ctx.vars.sh) - 1)}/${ctx.vars.tot}`,
      `${ctx.vars.sh}/${Number(ctx.vars.tot) + 1}`,
      `${ctx.vars.tot}/${ctx.vars.sh}`,
    ],
    explanation: ({ vars, answer }) => `შესაბამისი წილადია ${answer}.`,
  }),

  // g4-u15-05 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-05', subtopicId: 'u15-parts-of-whole', difficulty: 3 }),
    prompt: 'შოკოლადი {tot} ტოლ ნაწილადაა დაყოფილი. ბავშვმა {ate} ნაწილი შეჭამა. შოკოლადის რა ნაწილი შეჭამა ბავშვმა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10|7|7/10", "12|5|5/12", "8|3|3/8", "15|8|8/15", "16|9|9/16", "14|5|5/14", "10|4|4/10", "12|7|7/12", "8|5|5/8", "15|11|11/15", "16|7|7/16", "10|9|9/10", "12|11|11/12", "14|9|9/14", "8|7|7/8", "15|7|7/15", "10|3|3/10", "16|11|11/16"],
      },
      tot: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ate: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.ate) + 1}/${ctx.vars.tot}`,
      `${ctx.vars.ate}/${Number(ctx.vars.tot) + 1}`,
      `${Number(ctx.vars.tot) - Number(ctx.vars.ate)}/${ctx.vars.tot}`,
    ],
    explanation: ({ vars, answer }) => `ბავშვმა შეჭამა ${answer} ნაწილი.`,
  }),

  // g4-u15-06 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-06', subtopicId: 'u15-parts-of-whole', difficulty: 3 }),
    prompt: 'კალათა შეიცავს {tot} ერთნაირ ვაშლს. მათგან {red} წითელია. ვაშლების რა ნაწილია წითელი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["12|5|5/12", "15|7|7/15", "10|3|3/10", "16|9|9/16", "14|5|5/14", "18|7|7/18", "12|7|7/12", "15|8|8/15", "10|7|7/10", "16|11|11/16", "14|9|9/14", "20|9|9/20", "12|11|11/12", "15|4|4/15", "18|11|11/18", "20|13|13/20", "10|9|9/10", "16|7|7/16"],
      },
      tot: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      red: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.red) + 1}/${ctx.vars.tot}`,
      `${ctx.vars.red}/${Number(ctx.vars.tot) + 1}`,
      `${Number(ctx.vars.tot) - Number(ctx.vars.red)}/${ctx.vars.tot}`,
    ],
    explanation: ({ vars, answer }) => `წითელია ვაშლების ${answer} ნაწილი.`,
  }),

  // g4-u15-07 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-07', subtopicId: 'u15-numerator-denominator', difficulty: 1 }),
    prompt: 'წილადში {n}/{d} რომელია მრიცხველი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|7|3", "4|9|4", "5|8|5", "2|6|2", "7|10|7", "1|5|1", "6|11|6", "8|15|8", "9|14|9", "5|12|5", "3|8|3", "7|13|7", "4|7|4", "2|9|2", "8|11|8", "6|13|6", "11|16|11", "5|14|5"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ზედა რიცხვი არის მრიცხველი: ${answer}.`,
  }),

  // g4-u15-08 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-08', subtopicId: 'u15-numerator-denominator', difficulty: 1 }),
    prompt: 'წილადში {n}/{d} რომელია მნიშვნელი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|9|9", "3|7|7", "5|8|8", "2|6|6", "7|10|10", "1|5|5", "6|11|11", "8|15|15", "9|14|14", "5|12|12", "3|8|8", "7|13|13", "4|7|7", "2|9|9", "8|11|11", "6|13|13", "11|16|16", "5|14|14"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `ქვედა რიცხვი არის მნიშვნელი: ${answer}.`,
  }),

  // g4-u15-09 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-09', subtopicId: 'u15-numerator-denominator', difficulty: 2 }),
    prompt: 'წილადში {n}/{d} რას გვიჩვენებს რიცხვი {n}?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|8|რამდენ ტოლ ნაწილს ვიღებთ მთელიდან|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|მთელის საერთო რაოდენობას|მნიშვნელის სიდიდეს", "3|7|რამდენ ტოლ ნაწილს ვიღებთ მთელიდან|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|მთელის საერთო რაოდენობას|მნიშვნელის სიდიდეს", "4|9|რამდენ ტოლ ნაწილს ვიღებთ მთელიდან|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|მთელის საერთო რაოდენობას|მნიშვნელის სიდიდეს", "2|5|რამდენ ტოლ ნაწილს ვიღებთ მთელიდან|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|მთელის საერთო რაოდენობას|მნიშვნელის სიდიდეს", "6|11|რამდენ ტოლ ნაწილს ვიღებთ მთელიდან|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|მთელის საერთო რაოდენობას|მნიშვნელის სიდიდეს", "7|10|რამდენ ტოლ ნაწილს ვიღებთ მთელიდან|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|მთელის საერთო რაოდენობას|მნიშვნელის სიდიდეს", "1|6|რამდენ ტოლ ნაწილს ვიღებთ მთელიდან|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|მთელის საერთო რაოდენობას|მნიშვნელის სიდიდეს", "8|15|რამდენ ტოლ ნაწილს ვიღებთ მთელიდან|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|მთელის საერთო რაოდენობას|მნიშვნელის სიდიდეს", "3|10|რამდენ ტოლ ნაწილს ვიღებთ მთელიდან|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|მთელის საერთო რაოდენობას|მნიშვნელის სიდიდეს", "5|12|რამდენ ტოლ ნაწილს ვიღებთ მთელიდან|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|მთელის საერთო რაოდენობას|მნიშვნელის სიდიდეს", "7|12|რამდენ ტოლ ნაწილს ვიღებთ მთელიდან|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|მთელის საერთო რაოდენობას|მნიშვნელის სიდიდეს", "2|7|რამდენ ტოლ ნაწილს ვიღებთ მთელიდან|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|მთელის საერთო რაოდენობას|მნიშვნელის სიდიდეს", "4|15|რამდენ ტოლ ნაწილს ვიღებთ მთელიდან|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|მთელის საერთო რაოდენობას|მნიშვნელის სიდიდეს", "9|16|რამდენ ტოლ ნაწილს ვიღებთ მთელიდან|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|მთელის საერთო რაოდენობას|მნიშვნელის სიდიდეს", "5|14|რამდენ ტოლ ნაწილს ვიღებთ მთელიდან|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|მთელის საერთო რაოდენობას|მნიშვნელის სიდიდეს", "3|16|რამდენ ტოლ ნაწილს ვიღებთ მთელიდან|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|მთელის საერთო რაოდენობას|მნიშვნელის სიდიდეს"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[5]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)],
    explanation: ({ vars, answer }) => `მრიცხველი გვიჩვენებს: ${answer}.`,
  }),

  // g4-u15-10 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-10', subtopicId: 'u15-numerator-denominator', difficulty: 2 }),
    prompt: 'წილადში {n}/{d} რას გვიჩვენებს რიცხვი {d}?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|6|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|რამდენ ნაწილს ვიღებთ მთელიდან|აღებულ ნაწილთა რაოდენობას|მრიცხველის სიდიდეს", "3|8|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|რამდენ ნაწილს ვიღებთ მთელიდან|აღებულ ნაწილთა რაოდენობას|მრიცხველის სიდიდეს", "5|9|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|რამდენ ნაწილს ვიღებთ მთელიდან|აღებულ ნაწილთა რაოდენობას|მრიცხველის სიდიდეს", "4|7|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|რამდენ ნაწილს ვიღებთ მთელიდან|აღებულ ნაწილთა რაოდენობას|მრიცხველის სიდიდეს", "7|12|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|რამდენ ნაწილს ვიღებთ მთელიდან|აღებულ ნაწილთა რაოდენობას|მრიცხველის სიდიდეს", "1|10|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|რამდენ ნაწილს ვიღებთ მთელიდან|აღებულ ნაწილთა რაოდენობას|მრიცხველის სიდიდეს", "6|15|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|რამდენ ნაწილს ვიღებთ მთელიდან|აღებულ ნაწილთა რაოდენობას|მრიცხველის სიდიდეს", "8|11|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|რამდენ ნაწილს ვიღებთ მთელიდან|აღებულ ნაწილთა რაოდენობას|მრიცხველის სიდიდეს", "3|14|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|რამდენ ნაწილს ვიღებთ მთელიდან|აღებულ ნაწილთა რაოდენობას|მრიცხველის სიდიდეს", "9|16|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|რამდენ ნაწილს ვიღებთ მთელიდან|აღებულ ნაწილთა რაოდენობას|მრიცხველის სიდიდეს", "5|13|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|რამდენ ნაწილს ვიღებთ მთელიდან|აღებულ ნაწილთა რაოდენობას|მრიცხველის სიდიდეს", "2|9|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|რამდენ ნაწილს ვიღებთ მთელიდან|აღებულ ნაწილთა რაოდენობას|მრიცხველის სიდიდეს", "4|11|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|რამდენ ნაწილს ვიღებთ მთელიდან|აღებულ ნაწილთა რაოდენობას|მრიცხველის სიდიდეს", "7|15|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|რამდენ ნაწილს ვიღებთ მთელიდან|აღებულ ნაწილთა რაოდენობას|მრიცხველის სიდიდეს", "8|17|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|რამდენ ნაწილს ვიღებთ მთელიდან|აღებულ ნაწილთა რაოდენობას|მრიცხველის სიდიდეს", "6|19|რამდენ ტოლ ნაწილადაა დაყოფილი მთელი|რამდენ ნაწილს ვიღებთ მთელიდან|აღებულ ნაწილთა რაოდენობას|მრიცხველის სიდიდეს"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[5]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)],
    explanation: ({ vars, answer }) => `მნიშვნელი გვიჩვენებს: ${answer}.`,
  }),

  // g4-u15-11 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-11', subtopicId: 'u15-numerator-denominator', difficulty: 3 }),
    prompt: 'ჩაწერე წილადი, რომლის მრიცხველია {n}, ხოლო მნიშვნელი — {d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|10|3/10", "4|7|4/7", "5|12|5/12", "2|9|2/9", "6|11|6/11", "7|8|7/8", "1|6|1/6", "8|15|8/15", "9|13|9/13", "3|14|3/14", "5|16|5/16", "7|12|7/12", "4|15|4/15", "2|11|2/11", "8|17|8/17", "6|13|6/13", "9|20|9/20", "1|8|1/8"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${ctx.vars.d}/${ctx.vars.n}`,
      `${Number(ctx.vars.n) + 1}/${ctx.vars.d}`,
      `${ctx.vars.n}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `მრიცხველი იწერება ზემოთ, მნიშვნელი ქვემოთ: ${answer}.`,
  }),

  // g4-u15-12 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-12', subtopicId: 'u15-numerator-denominator', difficulty: 3 }),
    prompt: 'ჩაწერე წილადი, რომლის მრიცხველია {n}, ხოლო მნიშვნელი — {d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["7|12|7/12", "5|14|5/14", "8|15|8/15", "3|16|3/16", "9|14|9/14", "4|13|4/13", "6|17|6/17", "7|16|7/16", "11|18|11/18", "5|19|5/19", "8|21|8/21", "9|20|9/20", "2|15|2/15", "7|18|7/18", "6|19|6/19", "11|20|11/20", "3|17|3/17", "10|21|10/21"],
      },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${ctx.vars.d}/${ctx.vars.n}`,
      `${Number(ctx.vars.n) + 1}/${ctx.vars.d}`,
      `${ctx.vars.n}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `სწორი წილადია ${answer}.`,
  }),

  // g4-u15-13 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-13', subtopicId: 'u15-fractions-number-line', difficulty: 1 }),
    prompt: 'მონაკვეთი 0-დან 1-მდე {tot} ტოლ ნაწილადაა დაყოფილი. რა წილადს შეესაბამება {tick} დანაყოფი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|პირველი|1/2", "3|პირველი|1/3", "4|პირველი|1/4", "5|პირველი|1/5", "6|პირველი|1/6", "7|პირველი|1/7", "8|პირველი|1/8", "9|პირველი|1/9", "10|პირველი|1/10", "11|პირველი|1/11", "12|პირველი|1/12", "13|პირველი|1/13", "14|პირველი|1/14", "15|პირველი|1/15", "16|პირველი|1/16", "17|პირველი|1/17", "18|პირველი|1/18", "20|პირველი|1/20"],
      },
      tot: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      tick: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `2/${ctx.vars.tot}`,
      `1/${Number(ctx.vars.tot) + 1}`,
      `${ctx.vars.tot}/1`,
    ],
    explanation: ({ vars, answer }) => `პირველი დანაყოფი შეესაბამება წილადს ${answer}.`,
  }),

  // g4-u15-14 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-14', subtopicId: 'u15-fractions-number-line', difficulty: 1 }),
    prompt: 'მონაკვეთი 0-დან 1-მდე {tot} ტოლ ნაწილადაა დაყოფილი. რა წილადს შეესაბამება {tick} დანაყოფი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|მეორე|2/3", "4|მეორე|2/4", "5|მეორე|2/5", "6|მეორე|2/6", "7|მეორე|2/7", "8|მეორე|2/8", "9|მეორე|2/9", "10|მეორე|2/10", "11|მეორე|2/11", "12|მეორე|2/12", "13|მეორე|2/13", "14|მეორე|2/14", "15|მეორე|2/15", "16|მეორე|2/16", "17|მეორე|2/17", "18|მეორე|2/18", "19|მეორე|2/19", "20|მეორე|2/20"],
      },
      tot: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      tick: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `1/${ctx.vars.tot}`,
      `3/${ctx.vars.tot}`,
      `2/${Number(ctx.vars.tot) + 1}`,
    ],
    explanation: ({ vars, answer }) => `მეორე დანაყოფი შეესაბამება წილადს ${answer}.`,
  }),

  // g4-u15-15 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-15', subtopicId: 'u15-fractions-number-line', difficulty: 2 }),
    prompt: 'მონაკვეთი 0-დან 1-მდე {tot} ტოლ ნაწილადაა დაყოფილი. რა წილადს შეესაბამება {tick} დანაყოფი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|მესამე|3/4", "5|მესამე|3/5", "6|მესამე|3/6", "7|მესამე|3/7", "8|მესამე|3/8", "9|მესამე|3/9", "10|მესამე|3/10", "11|მესამე|3/11", "12|მესამე|3/12", "13|მესამე|3/13", "14|მესამე|3/14", "15|მესამე|3/15", "16|მესამე|3/16", "17|მესამე|3/17", "18|მესამე|3/18", "19|მესამე|3/19", "20|მესამე|3/20", "21|მესამე|3/21"],
      },
      tot: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      tick: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `2/${ctx.vars.tot}`,
      `4/${ctx.vars.tot}`,
      `3/${Number(ctx.vars.tot) + 1}`,
    ],
    explanation: ({ vars, answer }) => `მესამე დანაყოფი შეესაბამება წილადს ${answer}.`,
  }),

  // g4-u15-16 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-16', subtopicId: 'u15-fractions-number-line', difficulty: 2 }),
    prompt: 'მონაკვეთი 0-დან 1-მდე {tot} ტოლ ნაწილადაა დაყოფილი. რა წილადს შეესაბამება {tick} დანაყოფი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["6|მეხუთე|5/6", "7|მეხუთე|5/7", "8|მეხუთე|5/8", "9|მეხუთე|5/9", "10|მეხუთე|5/10", "11|მეხუთე|5/11", "12|მეხუთე|5/12", "13|მეხუთე|5/13", "14|მეხუთე|5/14", "15|მეხუთე|5/15", "16|მეხუთე|5/16", "17|მეხუთე|5/17", "18|მეხუთე|5/18", "19|მეხუთე|5/19", "20|მეხუთე|5/20", "21|მეხუთე|5/21", "22|მეხუთე|5/22", "24|მეხუთე|5/24"],
      },
      tot: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      tick: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `4/${ctx.vars.tot}`,
      `6/${ctx.vars.tot}`,
      `5/${Number(ctx.vars.tot) + 1}`,
    ],
    explanation: ({ vars, answer }) => `მეხუთე დანაყოფი შეესაბამება წილადს ${answer}.`,
  }),

  // g4-u15-17 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-17', subtopicId: 'u15-fractions-number-line', difficulty: 3 }),
    prompt: 'რიცხვით ღერძზე 0-დან 1-მდე მონაკვეთი {tot} ტოლ ნაწილადაა დაყოფილი. რა წილადია {tick} დანაყოფზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|მე-7|7/8", "9|მე-7|7/9", "10|მე-7|7/10", "11|მე-7|7/11", "12|მე-7|7/12", "13|მე-7|7/13", "14|მე-7|7/14", "15|მე-7|7/15", "16|მე-7|7/16", "17|მე-7|7/17", "18|მე-7|7/18", "19|მე-7|7/19", "20|მე-7|7/20", "21|მე-7|7/21", "22|მე-7|7/22", "23|მე-7|7/23", "24|მე-7|7/24", "25|მე-7|7/25"],
      },
      tot: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      tick: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `6/${ctx.vars.tot}`,
      `8/${ctx.vars.tot}`,
      `7/${Number(ctx.vars.tot) + 1}`,
    ],
    explanation: ({ vars, answer }) => `{tick} დანაყოფზე არის წილადი ${answer}.`,
  }),

  // g4-u15-18 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-18', subtopicId: 'u15-fractions-number-line', difficulty: 3 }),
    prompt: 'რიცხვით ღერძზე მონაკვეთი 0-დან 1-მდე {tot} ტოლ ნაწილადაა დაყოფილი. რა წილადს შეესაბამება ბოლო დანაყოფი?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|2/2", "3|3/3", "4|4/4", "5|5/5", "6|6/6", "7|7/7", "8|8/8", "9|9/9", "10|10/10", "11|11/11", "12|12/12", "13|13/13", "14|14/14", "15|15/15", "16|16/16", "17|17/17", "18|18/18", "20|20/20"],
      },
      tot: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.tot) - 1}/${ctx.vars.tot}`,
      `1/${ctx.vars.tot}`,
      `${Number(ctx.vars.tot) + 1}/${ctx.vars.tot}`,
    ],
    explanation: ({ vars, answer }) => `ბოლო დანაყოფი შეესაბამება მთელს: ${answer} = 1.`,
  }),

  // g4-u15-19 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-19', subtopicId: 'u15-reciprocal-fractions', difficulty: 1 }),
    prompt: 'იპოვე {frac}-ის შებრუნებული წილადი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2/3|3/2", "4/7|7/4", "5/9|9/5", "3/8|8/3", "7/10|10/7", "1/6|6", "3/5|5/3", "2/7|7/2", "4/9|9/4", "5/8|8/5", "6/11|11/6", "1/4|4", "2/5|5/2", "3/10|10/3", "5/7|7/5", "7/12|12/7", "8/13|13/8", "1/8|8"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.frac.includes('/') ? ctx.vars.frac.split('/') : [ctx.vars.frac, '1'];
      return [
        `${parts[0]}/${Number(parts[1]) + 1}`,
        `${Number(parts[1]) - 1}/${parts[0]}`,
        `${parts[0]}/${parts[1]}`,
      ];
    },
    explanation: ({ vars, answer }) => `შებრუნებული წილადის მისაღებად მრიცხველი და მნიშვნელი ადგილებს ცვლიან: ${answer}.`,
  }),

  // g4-u15-20 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-20', subtopicId: 'u15-reciprocal-fractions', difficulty: 1 }),
    prompt: 'იპოვე {frac}-ის შებრუნებული წილადი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4/7|7/4", "3/8|8/3", "5/11|11/5", "2/9|9/2", "6/7|7/6", "7/9|9/7", "3/11|11/3", "4/5|5/4", "8/9|9/8", "5/12|12/5", "7/13|13/7", "6/13|13/6", "4/11|11/4", "9/14|14/9", "8/15|15/8", "3/14|14/3", "5/16|16/5", "7/15|15/7"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.frac.split('/');
      return [
        `${parts[0]}/${parts[1]}`,
        `${Number(parts[1]) + 1}/${parts[0]}`,
        `${parts[0]}/${Number(parts[1]) + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `შებრუნებული წილადია ${answer}.`,
  }),

  // g4-u15-21 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-21', subtopicId: 'u15-reciprocal-fractions', difficulty: 2 }),
    prompt: 'იპოვე {frac}-ის შებრუნებული წილადი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5/9|9/5", "6/11|11/6", "7/10|10/7", "8/15|15/8", "3/7|7/3", "4/9|9/4", "2/5|5/2", "9/11|11/9", "5/8|8/5", "7/12|12/7", "4/13|13/4", "6/17|17/6", "5/14|14/5", "8/17|17/8", "9/16|16/9", "7/18|18/7", "6/19|19/6", "5/13|13/5"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.frac.split('/');
      return [
        `${parts[0]}/${parts[1]}`,
        `${Number(parts[1]) + 1}/${parts[0]}`,
        `${parts[0]}/${Number(parts[1]) + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `შებრუნებული წილადია ${answer}.`,
  }),

  // g4-u15-22 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-22', subtopicId: 'u15-reciprocal-fractions', difficulty: 2 }),
    prompt: 'იპოვე {frac}-ის შებრუნებული წილადი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3/8|8/3", "4/9|9/4", "5/12|12/5", "7/11|11/7", "2/7|7/2", "6/13|13/6", "8/15|15/8", "9/17|17/9", "5/14|14/5", "3/13|13/3", "4/15|15/4", "7/16|16/7", "6/17|17/6", "8/19|19/8", "9/20|20/9", "5/18|18/5", "3/19|19/3", "4/17|17/4"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.frac.split('/');
      return [
        `${parts[0]}/${parts[1]}`,
        `${Number(parts[1]) + 1}/${parts[0]}`,
        `${parts[0]}/${Number(parts[1]) + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `შებრუნებული წილადია ${answer}.`,
  }),

  // g4-u15-23 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-23', subtopicId: 'u15-reciprocal-fractions', difficulty: 3 }),
    prompt: 'იპოვე {frac}-ის შებრუნებული წილადი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["7/10|10/7", "9/10|10/9", "3/10|10/3", "1/10|10", "5/10|10/5", "4/10|10/4", "7/100|100/7", "9/100|100/9", "13/10|10/13", "17/10|10/17", "11/10|10/11", "19/10|10/19", "23/10|10/23", "27/10|10/27", "31/10|10/31", "3/100|100/3", "21/10|10/21", "29/10|10/29"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.frac.split('/');
      return [
        `${parts[0]}/${parts[1]}`,
        `${Number(parts[1]) + 1}/${parts[0]}`,
        `${parts[0]}/${Number(parts[1]) + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `შებრუნებული წილადია ${answer}.`,
  }),

  // g4-u15-24 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-24', subtopicId: 'u15-reciprocal-fractions', difficulty: 3 }),
    prompt: 'იპოვე {frac}-ის შებრუნებული რიცხვი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1/6|6", "1/4|4", "1/5|5", "1/3|3", "1/2|2", "1/7|7", "1/8|8", "1/9|9", "1/10|10", "1/12|12", "1/15|15", "1/20|20", "1/11|11", "1/14|14", "1/16|16", "1/18|18", "1/25|25", "1/30|30"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `1/n-ის შებრუნებულია n, ამიტომ პასუხია ${answer}.`,
  }),

  // g4-u15-25 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-25', subtopicId: 'u15-fraction-division', difficulty: 1 }),
    prompt: 'გამოთვალე: {frac} ÷ {div}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1/2|2|1/4", "1/3|2|1/6", "1/4|2|1/8", "1/5|2|1/10", "1/6|2|1/12", "1/7|2|1/14", "1/8|2|1/16", "1/9|2|1/18", "1/10|2|1/20", "1/2|3|1/6", "1/3|3|1/9", "1/4|3|1/12", "1/5|3|1/15", "1/2|4|1/8", "1/3|4|1/12", "1/2|5|1/10", "1/4|4|1/16", "1/3|5|1/15"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      div: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `1/${Number(parts[1]) - 1}`,
        `1/${Number(parts[1]) + 2}`,
        `2/${parts[1]}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.frac} ÷ ${vars.div} = ${answer}.`,
  }),

  // g4-u15-26 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-26', subtopicId: 'u15-fraction-division', difficulty: 1 }),
    prompt: 'გამოთვალე: {frac} ÷ {div}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1/3|2|1/6", "1/5|2|1/10", "1/4|3|1/12", "1/6|2|1/12", "1/7|3|1/21", "1/8|2|1/16", "1/3|4|1/12", "1/5|3|1/15", "1/4|4|1/16", "1/6|3|1/18", "1/2|6|1/12", "1/3|5|1/15", "1/5|4|1/20", "1/4|5|1/20", "1/2|7|1/14", "1/3|6|1/18", "1/7|2|1/14", "1/8|3|1/24"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      div: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `1/${Number(parts[1]) - 2}`,
        `1/${Number(parts[1]) + 2}`,
        `2/${parts[1]}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.frac} ÷ ${vars.div} = ${answer}.`,
  }),

  // g4-u15-27 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-27', subtopicId: 'u15-fraction-division', difficulty: 2 }),
    prompt: 'გამოთვალე: {frac} ÷ {div}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1/4|2|1/8", "1/5|3|1/15", "1/6|4|1/24", "1/7|2|1/14", "1/8|3|1/24", "1/9|2|1/18", "1/4|5|1/20", "1/5|5|1/25", "1/6|5|1/30", "1/7|4|1/28", "1/8|4|1/32", "1/9|3|1/27", "1/4|6|1/24", "1/5|6|1/30", "1/6|6|1/36", "1/10|3|1/30", "1/10|4|1/40", "1/10|5|1/50"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      div: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `1/${Number(parts[1]) - 2}`,
        `1/${Number(parts[1]) + 2}`,
        `2/${parts[1]}`,
      ];
    },
    explanation: ({ vars, answer }) => `მნიშვნელი მრავლდება მთელ რიცხვზე: ${answer}.`,
  }),

  // g4-u15-28 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-28', subtopicId: 'u15-fraction-division', difficulty: 2 }),
    prompt: 'გამოთვალე: {frac} ÷ {div}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2/3|2|1/3", "4/5|2|2/5", "6/7|2|3/7", "8/9|2|4/9", "4/7|2|2/7", "6/11|2|3/11", "2/5|2|1/5", "4/9|2|2/9", "8/11|2|4/11", "10/13|2|5/13", "6/13|2|3/13", "2/7|2|1/7", "4/11|2|2/11", "8/15|2|4/15", "10/17|2|5/17", "6/17|2|3/17", "2/9|2|1/9", "12/17|2|6/17"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      div: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `${Number(parts[0]) + 1}/${parts[1]}`,
        `${Math.max(1, Number(parts[0]) - 1)}/${parts[1]}`,
        `${parts[0]}/${Number(parts[1]) + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.frac} ÷ ${vars.div} = ${answer}.`,
  }),

  // g4-u15-29 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-29', subtopicId: 'u15-fraction-division', difficulty: 3 }),
    prompt: 'გამოთვალე: {frac} ÷ {div}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3/4|3|1/4", "3/5|3|1/5", "6/7|3|2/7", "9/10|3|3/10", "6/11|3|2/11", "3/8|3|1/8", "3/7|3|1/7", "6/13|3|2/13", "9/14|3|3/14", "12/17|3|4/17", "3/10|3|1/10", "6/17|3|2/17", "9/19|3|3/19", "12/19|3|4/19", "3/11|3|1/11", "6/19|3|2/19", "9/22|3|3/22", "3/14|3|1/14"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      div: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `${Number(parts[0]) + 1}/${parts[1]}`,
        `${parts[0]}/${Number(parts[1]) - 1}`,
        `${parts[0]}/${Number(parts[1]) + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `მრიცხველი იყოფა ${vars.div}-ზე: ${answer}.`,
  }),

  // g4-u15-30 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-30', subtopicId: 'u15-fraction-division', difficulty: 3 }),
    prompt: 'გამოთვალე: {frac} ÷ {div}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4/5|2|2/5", "6/7|2|3/7", "8/9|2|4/9", "6/11|2|3/11", "4/9|2|2/9", "8/13|2|4/13", "10/11|2|5/11", "4/7|2|2/7", "6/13|2|3/13", "8/17|2|4/17", "10/19|2|5/19", "4/13|2|2/13", "6/17|2|3/17", "8/15|2|4/15", "10/21|2|5/21", "4/15|2|2/15", "6/19|2|3/19", "8/21|2|4/21"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      div: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `${Number(parts[0]) + 1}/${parts[1]}`,
        `${Math.max(1, Number(parts[0]) - 1)}/${parts[1]}`,
        `${parts[0]}/${Number(parts[1]) + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.frac} ÷ ${vars.div} = ${answer}.`,
  }),

  // g4-u15-31 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-31', subtopicId: 'u15-equivalent-fractions-problems', difficulty: 1 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {f1} = □/{d2}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1/2|4|2", "1/3|6|2", "1/4|8|2", "1/5|10|2", "1/6|12|2", "1/2|6|3", "1/3|9|3", "1/4|12|3", "1/5|15|3", "1/2|8|4", "1/3|12|4", "1/4|16|4", "1/2|10|5", "1/3|15|5", "1/2|12|6", "1/3|18|6", "1/4|20|5", "1/5|20|4"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      d2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `გამოტოვებული რიცხვია ${answer}.`,
  }),

  // g4-u15-32 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-32', subtopicId: 'u15-equivalent-fractions-problems', difficulty: 1 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {f1} = {n2}/□.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2/3|4|6", "3/4|6|8", "2/5|4|10", "3/5|6|10", "4/5|8|10", "2/7|4|14", "3/7|6|14", "2/3|6|9", "3/4|9|12", "2/5|6|15", "4/7|8|14", "5/6|10|12", "3/8|6|16", "5/8|10|16", "2/9|4|18", "4/9|8|18", "3/10|6|20", "7/10|14|20"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 2, 2),
    explanation: ({ vars, answer }) => `გამოტოვებული რიცხვია ${answer}.`,
  }),

  // g4-u15-33 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-33', subtopicId: 'u15-equivalent-fractions-problems', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {f1} = {n2}/□.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3/5|6|10", "2/5|6|15", "4/5|12|15", "3/7|9|21", "2/7|6|21", "4/7|12|21", "3/8|9|24", "5/8|15|24", "2/9|6|27", "4/9|12|27", "5/9|15|27", "3/10|9|30", "7/10|21|30", "2/11|6|33", "3/11|9|33", "4/11|12|33", "5/12|15|36", "7/12|21|36"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 2, 2),
    explanation: ({ vars, answer }) => `გამოტოვებული რიცხვია ${answer}.`,
  }),

  // g4-u15-34 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-34', subtopicId: 'u15-equivalent-fractions-problems', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {f1} = □/{d2}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1/4|8|2", "1/3|12|4", "1/5|15|3", "1/6|18|3", "1/7|14|2", "1/8|24|3", "1/9|27|3", "1/10|30|3", "1/4|16|4", "1/5|25|5", "1/6|24|4", "1/7|21|3", "1/8|32|4", "1/9|18|2", "1/10|40|4", "1/4|24|6", "1/5|35|7", "1/6|36|6"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      d2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `გამოტოვებული რიცხვია ${answer}.`,
  }),

  // g4-u15-35 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-35', subtopicId: 'u15-equivalent-fractions-problems', difficulty: 3 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {f1} = {n2}/□.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2/7|6|21", "3/8|12|32", "4/9|16|36", "5/7|20|28", "2/9|8|36", "3/10|12|40", "7/10|28|40", "2/11|8|44", "3/11|12|44", "4/11|16|44", "5/12|20|48", "7/12|28|48", "2/13|8|52", "3/13|12|52", "4/13|16|52", "5/14|20|56", "3/14|15|70", "2/15|8|60"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 2, 2),
    explanation: ({ vars, answer }) => `გამოტოვებული რიცხვია ${answer}.`,
  }),

  // g4-u15-36 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-36', subtopicId: 'u15-equivalent-fractions-problems', difficulty: 3 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {f1} = □/{d2}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4/9|18|8", "3/7|21|9", "5/8|24|15", "2/7|28|8", "3/10|30|9", "7/10|40|28", "5/12|24|10", "7/12|36|21", "4/11|22|8", "5/11|33|15", "2/9|36|8", "5/9|45|25", "3/8|32|12", "7/8|40|35", "4/7|35|20", "6/11|44|24", "3/14|28|6", "5/14|42|15"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      d2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `გამოტოვებული რიცხვია ${answer}.`,
  }),

  // g4-u15-37 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-37', subtopicId: 'u15-fraction-addition-same-denom', difficulty: 1 }),
    prompt: 'გამოთვალე: {n1}/{d} + {n2}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1|2|5|3/5", "2|1|4|3/4", "1|3|6|4/6", "2|3|7|5/7", "3|2|8|5/8", "4|3|9|7/9", "2|5|10|7/10", "1|4|7|5/7", "3|4|9|7/9", "2|4|8|6/8", "1|5|8|6/8", "3|3|8|6/8", "2|2|5|4/5", "1|2|6|3/6", "4|2|7|6/7", "3|5|10|8/10", "1|6|9|7/9", "2|6|11|8/11"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) + Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `${vars.n1}/${vars.d} + ${vars.n2}/${vars.d} = ${answer}.`,
  }),

  // g4-u15-38 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-38', subtopicId: 'u15-fraction-addition-same-denom', difficulty: 1 }),
    prompt: 'გამოთვალე: {n1}/{d} + {n2}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|2|8|5/8", "4|3|10|7/10", "2|4|9|6/9", "5|2|11|7/11", "3|4|12|7/12", "1|6|8|7/8", "4|4|9|8/9", "2|6|10|8/10", "5|3|12|8/12", "3|5|11|8/11", "4|5|13|9/13", "2|7|11|9/11", "6|2|9|8/9", "3|6|12|9/12", "4|5|10|9/10", "5|4|11|9/11", "1|7|10|8/10", "2|5|9|7/9"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) + Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `${vars.n1}/${vars.d} + ${vars.n2}/${vars.d} = ${answer}.`,
  }),

  // g4-u15-39 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-39', subtopicId: 'u15-fraction-addition-same-denom', difficulty: 2 }),
    prompt: 'გამოთვალე: {n1}/{d} + {n2}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|4|7|6/7", "3|4|8|7/8", "5|3|9|8/9", "4|5|11|9/11", "6|3|10|9/10", "2|7|12|9/12", "3|7|13|10/13", "5|4|12|9/12", "4|6|13|10/13", "2|8|13|10/13", "6|4|11|10/11", "3|6|11|9/11", "5|5|13|10/13", "4|7|14|11/14", "2|9|14|11/14", "6|5|14|11/14", "3|8|14|11/14", "7|4|15|11/15"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) + Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `${vars.n1}/${vars.d} + ${vars.n2}/${vars.d} = ${answer}.`,
  }),

  // g4-u15-40 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-40', subtopicId: 'u15-fraction-addition-same-denom', difficulty: 2 }),
    prompt: 'გამოთვალე: {n1}/{d} + {n2}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3|5|10|8/10", "4|3|10|7/10", "2|7|10|9/10", "1|8|10|9/10", "5|4|10|9/10", "2|5|10|7/10", "6|3|10|9/10", "3|4|10|7/10", "1|6|10|7/10", "4|4|10|8/10", "2|6|10|8/10", "5|3|10|8/10", "7|2|10|9/10", "1|7|10|8/10", "3|3|10|6/10", "2|4|10|6/10", "4|2|10|6/10", "1|5|10|6/10"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) + Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `${vars.n1}/${vars.d} + ${vars.n2}/${vars.d} = ${answer}.`,
  }),

  // g4-u15-41 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-41', subtopicId: 'u15-fraction-addition-same-denom', difficulty: 3 }),
    prompt: 'გამოთვალე: {n1}/{d} + {n2}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|2|9|6/9", "5|2|9|7/9", "3|4|9|7/9", "6|2|9|8/9", "1|7|9|8/9", "2|5|9|7/9", "4|3|9|7/9", "5|3|9|8/9", "2|6|9|8/9", "3|5|9|8/9", "1|5|9|6/9", "2|4|9|6/9", "3|3|9|6/9", "4|4|9|8/9", "1|6|9|7/9", "2|3|9|5/9", "1|4|9|5/9", "3|2|9|5/9"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) + Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `${vars.n1}/${vars.d} + ${vars.n2}/${vars.d} = ${answer}.`,
  }),

  // g4-u15-42 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-42', subtopicId: 'u15-fraction-addition-same-denom', difficulty: 3 }),
    prompt: 'გამოთვალე: {n1}/{d} + {n2}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|3|12|8/12", "4|5|12|9/12", "6|4|12|10/12", "7|3|12|10/12", "2|9|12|11/12", "5|6|12|11/12", "4|7|12|11/12", "3|8|12|11/12", "6|3|12|9/12", "7|4|12|11/12", "8|2|12|10/12", "5|4|12|9/12", "3|6|12|9/12", "2|7|12|9/12", "4|4|12|8/12", "3|5|12|8/12", "6|2|12|8/12", "7|2|12|9/12"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) + Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `${vars.n1}/${vars.d} + ${vars.n2}/${vars.d} = ${answer}.`,
  }),

  // g4-u15-43 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-43', subtopicId: 'u15-fraction-subtraction-same-denom', difficulty: 1 }),
    prompt: 'გამოთვალე: {n1}/{d} − {n2}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|2|5|2/5", "3|1|4|2/4", "5|2|6|3/6", "6|3|7|3/7", "7|4|8|3/8", "8|5|9|3/9", "9|4|10|5/10", "5|1|7|4/7", "6|2|8|4/8", "7|3|9|4/9", "8|2|10|6/10", "4|1|5|3/5", "5|3|7|2/7", "6|4|8|2/8", "7|5|9|2/9", "8|6|10|2/10", "9|6|10|3/10", "5|4|6|1/6"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) - Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) - Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) - Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `${vars.n1}/${vars.d} − ${vars.n2}/${vars.d} = ${answer}.`,
  }),

  // g4-u15-44 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-44', subtopicId: 'u15-fraction-subtraction-same-denom', difficulty: 1 }),
    prompt: 'გამოთვალე: {n1}/{d} − {n2}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["7|3|8|4/8", "6|2|8|4/8", "5|2|8|3/8", "7|4|8|3/8", "6|3|8|3/8", "5|1|8|4/8", "7|2|8|5/8", "7|5|8|2/8", "6|1|8|5/8", "5|3|8|2/8", "7|1|8|6/8", "6|4|8|2/8", "8|3|9|5/9", "7|2|9|5/9", "8|4|9|4/9", "7|3|9|4/9", "6|2|9|4/9", "8|5|9|3/9"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) - Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) - Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) - Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `${vars.n1}/${vars.d} − ${vars.n2}/${vars.d} = ${answer}.`,
  }),

  // g4-u15-45 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-45', subtopicId: 'u15-fraction-subtraction-same-denom', difficulty: 2 }),
    prompt: 'გამოთვალე: {n1}/{d} − {n2}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["6|2|7|4/7", "5|2|7|3/7", "6|3|7|3/7", "6|4|7|2/7", "5|3|7|2/7", "4|1|7|3/7", "5|1|7|4/7", "6|1|7|5/7", "4|2|7|2/7", "6|5|7|1/7", "5|4|7|1/7", "4|3|7|1/7", "7|3|10|4/10", "8|4|10|4/10", "9|5|10|4/10", "6|2|10|4/10", "7|2|10|5/10", "8|3|10|5/10"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) - Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) - Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) - Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `${vars.n1}/${vars.d} − ${vars.n2}/${vars.d} = ${answer}.`,
  }),

  // g4-u15-46 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-46', subtopicId: 'u15-fraction-subtraction-same-denom', difficulty: 2 }),
    prompt: 'გამოთვალე: {n1}/{d} − {n2}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["9|4|10|5/10", "8|3|10|5/10", "7|2|10|5/10", "9|3|10|6/10", "8|2|10|6/10", "7|3|10|4/10", "9|5|10|4/10", "8|4|10|4/10", "6|2|10|4/10", "9|2|10|7/10", "8|5|10|3/10", "7|4|10|3/10", "9|6|10|3/10", "6|3|10|3/10", "9|7|10|2/10", "8|6|10|2/10", "7|5|10|2/10", "9|1|10|8/10"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) - Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) - Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) - Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `${vars.n1}/${vars.d} − ${vars.n2}/${vars.d} = ${answer}.`,
  }),

  // g4-u15-47 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-47', subtopicId: 'u15-fraction-subtraction-same-denom', difficulty: 3 }),
    prompt: 'გამოთვალე: {n1}/{d} − {n2}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|5|9|3/9", "7|4|9|3/9", "6|3|9|3/9", "5|2|9|3/9", "8|4|9|4/9", "7|3|9|4/9", "6|2|9|4/9", "5|1|9|4/9", "8|3|9|5/9", "7|2|9|5/9", "6|1|9|5/9", "8|6|9|2/9", "7|5|9|2/9", "6|4|9|2/9", "5|3|9|2/9", "8|2|9|6/9", "7|1|9|6/9", "8|1|9|7/9"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) - Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) - Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) - Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `${vars.n1}/${vars.d} − ${vars.n2}/${vars.d} = ${answer}.`,
  }),

  // g4-u15-48 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-48', subtopicId: 'u15-fraction-subtraction-same-denom', difficulty: 3 }),
    prompt: 'გამოთვალე: {n1}/{d} − {n2}/{d}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["11|7|12|4/12", "10|6|12|4/12", "9|5|12|4/12", "8|4|12|4/12", "7|3|12|4/12", "11|6|12|5/12", "10|5|12|5/12", "9|4|12|5/12", "8|3|12|5/12", "7|2|12|5/12", "11|8|12|3/12", "10|7|12|3/12", "9|6|12|3/12", "8|5|12|3/12", "11|5|12|6/12", "10|4|12|6/12", "9|3|12|6/12", "11|9|12|2/12"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) - Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) - Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) - Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `${vars.n1}/${vars.d} − ${vars.n2}/${vars.d} = ${answer}.`,
  }),

  // g4-u15-49 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-49', subtopicId: 'u15-fraction-word-problems', difficulty: 1 }),
    prompt: 'ნინომ ტორტის {n1}/{d} შეჭამა, ხოლო მისმა ძმამ — {n2}/{d}. ტორტის რა ნაწილი შეჭამეს ერთად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|3|8|5/8", "1|4|8|5/8", "3|3|8|6/8", "2|4|8|6/8", "1|5|8|6/8", "2|5|8|7/8", "3|4|8|7/8", "1|6|8|7/8", "2|2|8|4/8", "1|3|8|4/8", "3|1|8|4/8", "4|2|8|6/8", "2|1|8|3/8", "1|2|8|3/8", "4|3|8|7/8", "5|1|8|6/8", "3|2|8|5/8", "1|1|8|2/8"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) + Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `ერთად შეჭამეს ${vars.n1}/${vars.d} + ${vars.n2}/${vars.d} = ${answer}.`,
  }),

  // g4-u15-50 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-50', subtopicId: 'u15-fraction-word-problems', difficulty: 1 }),
    prompt: 'ბოთლში წყლის {n1}/{d} იყო. ბავშვმა {n2}/{d} დალია. წყლის რა ნაწილი დარჩა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["7|3|10|4/10", "8|3|10|5/10", "9|4|10|5/10", "6|2|10|4/10", "8|4|10|4/10", "7|2|10|5/10", "9|3|10|6/10", "8|2|10|6/10", "7|4|10|3/10", "6|3|10|3/10", "9|5|10|4/10", "8|5|10|3/10", "7|5|10|2/10", "9|2|10|7/10", "6|4|10|2/10", "8|6|10|2/10", "9|6|10|3/10", "7|1|10|6/10"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) - Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) - Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) - Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `დარჩა: ${vars.n1}/${vars.d} − ${vars.n2}/${vars.d} = ${answer}.`,
  }),

  // g4-u15-51 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-51', subtopicId: 'u15-fraction-word-problems', difficulty: 2 }),
    prompt: 'ბაღის {n1}/{d} ნაწილი ყვავილებით დარგეს, ხოლო {n2}/{d} ნაწილი — ბოსტნეულით. ბაღის რა ნაწილი გამოიყენეს ამ ორი მიზნით?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|4|9|6/9", "3|3|9|6/9", "1|5|9|6/9", "2|5|9|7/9", "3|4|9|7/9", "4|3|9|7/9", "1|6|9|7/9", "2|6|9|8/9", "3|5|9|8/9", "4|4|9|8/9", "1|7|9|8/9", "5|2|9|7/9", "2|3|9|5/9", "1|4|9|5/9", "3|2|9|5/9", "4|2|9|6/9", "5|1|9|6/9", "2|2|9|4/9"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) + Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `სულ გამოიყენეს: ${answer}.`,
  }),

  // g4-u15-52 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-52', subtopicId: 'u15-fraction-word-problems', difficulty: 2 }),
    prompt: 'ლუკამ წიგნის {n1}/{d} წაიკითხა, მეორე დღეს კი კიდევ {n2}/{d}. წიგნის რა ნაწილი წაიკითხა სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5|3|12|8/12", "4|5|12|9/12", "6|3|12|9/12", "3|6|12|9/12", "2|7|12|9/12", "4|6|12|10/12", "5|5|12|10/12", "7|3|12|10/12", "2|8|12|10/12", "3|7|12|10/12", "4|7|12|11/12", "5|6|12|11/12", "6|5|12|11/12", "3|8|12|11/12", "2|9|12|11/12", "4|4|12|8/12", "3|5|12|8/12", "6|2|12|8/12"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) + Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `ლუკამ სულ წაიკითხა: ${answer}.`,
  }),

  // g4-u15-53 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-53', subtopicId: 'u15-fraction-word-problems', difficulty: 3 }),
    prompt: 'ლენტიდან გამოიყენეს {n1}/{d}, შემდეგ კი კიდევ {n2}/{d}. ლენტის რა ნაწილი გამოიყენეს სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["6|1|8|7/8", "5|2|8|7/8", "4|3|8|7/8", "3|4|8|7/8", "2|5|8|7/8", "1|6|8|7/8", "4|2|8|6/8", "3|3|8|6/8", "5|1|8|6/8", "2|4|8|6/8", "3|2|8|5/8", "2|3|8|5/8", "4|1|8|5/8", "1|4|8|5/8", "2|2|8|4/8", "3|1|8|4/8", "1|3|8|4/8", "5|2|9|7/9"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) + Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) + Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `სულ გამოიყენეს: ${answer}.`,
  }),

  // g4-u15-54 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-54', subtopicId: 'u15-fraction-word-problems', difficulty: 3 }),
    prompt: 'წყლის ავზი სავსე იყო {n1}/{d}-ით. მისგან {n2}/{d} წყალი გამოიყენეს. ავზის რა ნაწილი დარჩა სავსე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["9|4|10|5/10", "8|3|10|5/10", "7|2|10|5/10", "9|3|10|6/10", "8|2|10|6/10", "7|3|10|4/10", "9|5|10|4/10", "8|4|10|4/10", "6|2|10|4/10", "9|2|10|7/10", "8|5|10|3/10", "7|4|10|3/10", "9|6|10|3/10", "6|3|10|3/10", "9|7|10|2/10", "8|6|10|2/10", "7|5|10|2/10", "9|1|10|8/10"],
      },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => [
      `${Number(ctx.vars.n1) - Number(ctx.vars.n2) + 1}/${ctx.vars.d}`,
      `${Math.max(1, Number(ctx.vars.n1) - Number(ctx.vars.n2) - 1)}/${ctx.vars.d}`,
      `${Number(ctx.vars.n1) - Number(ctx.vars.n2)}/${Number(ctx.vars.d) + 1}`,
    ],
    explanation: ({ vars, answer }) => `ავზში დარჩა: ${answer}.`,
  }),

  // g4-u15-55 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-55', subtopicId: 'u15-fraction-multiplication-problems', difficulty: 1 }),
    prompt: 'ტორტის {f}-ის ნახევარი რა ნაწილია მთელი ტორტის?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1/2|1/4", "1/3|1/6", "1/4|1/8", "1/5|1/10", "1/6|1/12", "1/7|1/14", "1/8|1/16", "1/9|1/18", "1/10|1/20", "2/3|2/6", "3/4|3/8", "2/5|2/10", "4/5|4/10", "3/5|3/10", "5/6|5/12", "3/8|3/16", "5/8|5/16", "7/8|7/16"],
      },
      f: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `${parts[0]}/${Number(parts[1]) - 2}`,
        `${parts[0]}/${Number(parts[1]) + 2}`,
        `${Number(parts[0]) + 1}/${parts[1]}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.f}-ის ნახევარი არის: ${vars.f} × 1/2 = ${answer}.`,
  }),

  // g4-u15-56 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-56', subtopicId: 'u15-fraction-multiplication-problems', difficulty: 1 }),
    prompt: 'იპოვე {f1}-ის {f2}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1/3|1/2|1/6", "1/4|1/2|1/8", "1/5|1/2|1/10", "1/6|1/2|1/12", "1/2|1/3|1/6", "1/2|1/4|1/8", "1/3|1/3|1/9", "1/4|1/3|1/12", "1/5|1/3|1/15", "1/3|1/4|1/12", "1/2|1/5|1/10", "1/4|1/4|1/16", "1/5|1/4|1/20", "1/2|1/6|1/12", "1/3|1/5|1/15", "1/6|1/3|1/18", "1/2|1/7|1/14", "1/7|1/2|1/14"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      f2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `1/${Number(parts[1]) - 2}`,
        `1/${Number(parts[1]) + 2}`,
        `2/${parts[1]}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.f1} × ${vars.f2} = ${answer}.`,
  }),

  // g4-u15-57 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-57', subtopicId: 'u15-fraction-multiplication-problems', difficulty: 2 }),
    prompt: 'მართკუთხედის {f1} ნაწილი გაფერადებულია. ამ ნაწილის {f2} ნაწილი რამდენია მთელი მართკუთხედის მიმართ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2/3|1/2|2/6", "4/5|1/2|4/10", "6/7|1/2|6/14", "3/4|1/2|3/8", "2/5|1/2|2/10", "4/7|1/2|4/14", "3/5|1/2|3/10", "5/6|1/2|5/12", "2/7|1/2|2/14", "4/9|1/2|4/18", "6/11|1/2|6/22", "3/8|1/2|3/16", "5/8|1/2|5/16", "7/8|1/2|7/16", "2/9|1/2|2/18", "8/9|1/2|8/18", "5/7|1/2|5/14", "3/7|1/2|3/14"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      f2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `${parts[0]}/${Number(parts[1]) - 2}`,
        `${parts[0]}/${Number(parts[1]) + 2}`,
        `${Number(parts[0]) + 1}/${parts[1]}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.f1} × ${vars.f2} = ${answer}.`,
  }),

  // g4-u15-58 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-58', subtopicId: 'u15-fraction-multiplication-problems', difficulty: 2 }),
    prompt: 'გამოთვალე: {frac} × {mult}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1/4|2|2/4", "1/5|2|2/5", "1/6|2|2/6", "1/7|2|2/7", "1/8|2|2/8", "1/9|2|2/9", "1/6|3|3/6", "1/7|3|3/7", "1/8|3|3/8", "1/9|3|3/9", "1/10|3|3/10", "1/8|4|4/8", "1/9|4|4/9", "1/10|4|4/10", "1/10|5|5/10", "1/12|5|5/12", "1/12|4|4/12", "1/12|3|3/12"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      mult: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `${parts[0]}/${Number(parts[1]) * Number(ctx.vars.mult)}`,
        `${Number(parts[0]) + 1}/${parts[1]}`,
        `${parts[0]}/${Number(parts[1]) + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.frac} × ${vars.mult} = ${answer}.`,
  }),

  // g4-u15-59 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-59', subtopicId: 'u15-fraction-multiplication-problems', difficulty: 3 }),
    prompt: 'გამოთვალე: {frac} × {mult}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2/5|3|6/5", "3/7|2|6/7", "2/7|3|6/7", "4/9|2|8/9", "3/8|2|6/8", "2/9|4|8/9", "3/10|3|9/10", "2/11|4|8/11", "3/11|3|9/11", "4/11|2|8/11", "2/13|5|10/13", "3/13|3|9/13", "2/15|4|8/15", "3/14|3|9/14", "4/15|2|8/15", "2/7|2|4/7", "3/8|3|9/8", "2/5|2|4/5"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      mult: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `${Number(parts[0]) + 1}/${parts[1]}`,
        `${Math.max(1, Number(parts[0]) - 1)}/${parts[1]}`,
        `${parts[0]}/${Number(parts[1]) + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.frac} × ${vars.mult} = ${answer}.`,
  }),

  // g4-u15-60 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-60', subtopicId: 'u15-fraction-multiplication-problems', difficulty: 3 }),
    prompt: 'გამოთვალე: {frac} × {mult}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3/8|2|6/8", "2/9|3|6/9", "4/11|2|8/11", "5/12|2|10/12", "3/10|3|9/10", "2/7|3|6/7", "4/13|2|8/13", "3/14|3|9/14", "5/14|2|10/14", "2/15|4|8/15", "3/16|3|9/16", "4/15|2|8/15", "5/16|2|10/16", "3/17|3|9/17", "2/17|4|8/17", "4/17|2|8/17", "3/19|3|9/19", "5/18|2|10/18"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      mult: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `${Number(parts[0]) + 1}/${parts[1]}`,
        `${Math.max(1, Number(parts[0]) - 1)}/${parts[1]}`,
        `${parts[0]}/${Number(parts[1]) + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.frac} × ${vars.mult} = ${answer}.`,
  }),

  // g4-u15-61 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-61', subtopicId: 'u15-simplifying-fractions', difficulty: 1 }),
    prompt: 'გაამარტივე წილადი: {frac}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2/4|1/2", "4/8|1/2", "6/12|1/2", "8/16|1/2", "5/10|1/2", "3/6|1/2", "7/14|1/2", "9/18|1/2", "10/20|1/2", "12/24|1/2", "2/6|1/3", "4/12|1/3", "6/18|1/3", "2/8|1/4", "4/16|1/4", "3/12|1/4", "5/20|1/4", "2/10|1/5"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `${Number(parts[0]) + 1}/${parts[1]}`,
        `${parts[0]}/${Number(parts[1]) + 1}`,
        `1/${Number(parts[1]) + 2}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.frac} = ${answer}.`,
  }),

  // g4-u15-62 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-62', subtopicId: 'u15-simplifying-fractions', difficulty: 1 }),
    prompt: 'გაამარტივე წილადი: {frac}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3/9|1/3", "6/18|1/3", "9/27|1/3", "4/12|1/3", "5/15|1/3", "7/21|1/3", "8/24|1/3", "10/30|1/3", "2/6|1/3", "3/12|1/4", "4/16|1/4", "5/20|1/4", "6/24|1/4", "7/28|1/4", "3/15|1/5", "4/20|1/5", "5/25|1/5", "6/30|1/5"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `${Number(parts[0]) + 1}/${parts[1]}`,
        `${parts[0]}/${Number(parts[1]) + 1}`,
        `1/${Number(parts[1]) - 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.frac} = ${answer}.`,
  }),

  // g4-u15-63 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-63', subtopicId: 'u15-simplifying-fractions', difficulty: 2 }),
    prompt: 'გაამარტივე წილადი: {frac}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4/8|1/2", "6/8|3/4", "2/8|1/4", "6/10|3/5", "8/10|4/5", "2/10|1/5", "4/10|2/5", "3/9|1/3", "6/9|2/3", "4/12|1/3", "8/12|2/3", "6/12|1/2", "9/12|3/4", "3/12|1/4", "10/12|5/6", "2/12|1/6", "4/14|2/7", "6/14|3/7"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      const n = Number(parts[0]);
      const d = Number(parts[1]);
      return [
        `${n + 1}/${d}`,
        `${n}/${d + 1}`,
        `${n + 1}/${d + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.frac} = ${answer}.`,
  }),

  // g4-u15-64 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-64', subtopicId: 'u15-simplifying-fractions', difficulty: 2 }),
    prompt: 'გაამარტივე წილადი: {frac}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["6/10|3/5", "8/10|4/5", "4/10|2/5", "2/10|1/5", "6/14|3/7", "8/14|4/7", "10/14|5/7", "4/14|2/7", "6/16|3/8", "10/16|5/8", "14/16|7/8", "2/16|1/8", "6/18|1/3", "8/18|4/9", "10/18|5/9", "12/18|2/3", "14/18|7/9", "4/18|2/9"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      const n = Number(parts[0]);
      const d = Number(parts[1]);
      return [
        `${n + 1}/${d}`,
        `${n}/${d + 1}`,
        `${n + 1}/${d + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.frac} = ${answer}.`,
  }),

  // g4-u15-65 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-65', subtopicId: 'u15-simplifying-fractions', difficulty: 3 }),
    prompt: 'გაამარტივე წილადი: {frac}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8/12|2/3", "4/12|1/3", "9/12|3/4", "3/12|1/4", "6/12|1/2", "10/12|5/6", "2/12|1/6", "9/15|3/5", "12/15|4/5", "6/15|2/5", "3/15|1/5", "10/15|2/3", "5/15|1/3", "8/16|1/2", "12/16|3/4", "4/16|1/4", "14/16|7/8", "6/16|3/8"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      const n = Number(parts[0]);
      const d = Number(parts[1]);
      return [
        `${n + 1}/${d}`,
        `${n}/${d + 1}`,
        `${n + 1}/${d + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.frac} = ${answer}.`,
  }),

  // g4-u15-66 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-66', subtopicId: 'u15-simplifying-fractions', difficulty: 3 }),
    prompt: 'გაამარტივე წილადი: {frac}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["10/15|2/3", "5/15|1/3", "6/15|2/5", "9/15|3/5", "12/15|4/5", "3/15|1/5", "10/20|1/2", "15/20|3/4", "5/20|1/4", "8/20|2/5", "12/20|3/5", "16/20|4/5", "14/21|2/3", "7/21|1/3", "6/21|2/7", "9/21|3/7", "12/21|4/7", "15/21|5/7"],
      },
      frac: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      const n = Number(parts[0]);
      const d = Number(parts[1]);
      return [
        `${n + 1}/${d}`,
        `${n}/${d + 1}`,
        `${n + 1}/${d + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.frac} = ${answer}.`,
  }),

  // g4-u15-67 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-67', subtopicId: 'u15-fraction-multiplication', difficulty: 1 }),
    prompt: 'გამოთვალე: {f1} × {f2}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1/2|1/3|1/6", "1/2|1/4|1/8", "1/3|1/4|1/12", "1/2|1/5|1/10", "1/3|1/5|1/15", "1/4|1/5|1/20", "1/2|1/6|1/12", "1/3|1/3|1/9", "1/4|1/4|1/16", "1/5|1/5|1/25", "1/2|1/7|1/14", "1/3|1/6|1/18", "1/4|1/6|1/24", "1/2|1/8|1/16", "1/3|1/7|1/21", "1/5|1/6|1/30", "1/2|1/9|1/18", "1/4|1/7|1/28"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      f2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `1/${Number(parts[1]) - 2}`,
        `1/${Number(parts[1]) + 2}`,
        `2/${parts[1]}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.f1} × ${vars.f2} = ${answer}.`,
  }),

  // g4-u15-68 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-68', subtopicId: 'u15-fraction-multiplication', difficulty: 1 }),
    prompt: 'გამოთვალე: {f1} × {f2}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2/3|1/4|2/12", "3/4|1/2|3/8", "2/5|1/3|2/15", "3/5|1/2|3/10", "4/5|1/3|4/15", "2/7|1/2|2/14", "3/7|1/2|3/14", "2/3|1/5|2/15", "3/4|1/5|3/20", "2/5|1/4|2/20", "4/7|1/3|4/21", "5/6|1/2|5/12", "2/7|1/3|2/21", "3/8|1/2|3/16", "5/8|1/2|5/16", "2/9|1/2|2/18", "4/9|1/2|4/18", "5/7|1/3|5/21"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      f2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `${Number(parts[0]) + 1}/${parts[1]}`,
        `${Math.max(1, Number(parts[0]) - 1)}/${parts[1]}`,
        `${parts[0]}/${Number(parts[1]) + 2}`,
      ];
    },
    explanation: ({ vars, answer }) => `მრიცხველები მრავლდება მრიცხველზე, მნიშვნელები მნიშვნელზე: ${answer}.`,
  }),

  // g4-u15-69 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-69', subtopicId: 'u15-fraction-multiplication', difficulty: 2 }),
    prompt: 'გამოთვალე: {f1} × {f2}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3/5|2/3|6/15", "2/5|3/4|6/20", "3/4|2/5|6/20", "4/7|2/3|8/21", "3/7|2/5|6/35", "2/7|3/4|6/28", "3/8|2/3|6/24", "5/8|2/3|10/24", "2/9|4/5|8/45", "4/9|2/3|8/27", "3/10|3/4|9/40", "7/10|2/3|14/30", "2/5|4/7|8/35", "3/5|4/7|12/35", "4/5|2/7|8/35", "5/6|2/3|10/18", "3/8|3/4|9/32", "5/7|2/3|10/21"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      f2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `${Number(parts[0]) + 1}/${parts[1]}`,
        `${Math.max(1, Number(parts[0]) - 1)}/${parts[1]}`,
        `${parts[0]}/${Number(parts[1]) + 2}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.f1} × ${vars.f2} = ${answer}.`,
  }),

  // g4-u15-70 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-70', subtopicId: 'u15-fraction-multiplication', difficulty: 2 }),
    prompt: 'გამოთვალე: {f1} × {f2}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4/7|1/2|4/14", "6/7|1/2|6/14", "2/9|1/2|2/18", "4/9|1/2|4/18", "8/9|1/2|8/18", "3/8|1/2|3/16", "5/8|1/2|5/16", "7/8|1/2|7/16", "4/11|1/2|4/22", "6/11|1/2|6/22", "8/11|1/2|8/22", "3/10|1/2|3/20", "7/10|1/2|7/20", "9/10|1/2|9/20", "4/13|1/2|4/26", "6/13|1/2|6/26", "8/13|1/2|8/26", "5/12|1/2|5/24"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      f2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `${Number(parts[0]) + 1}/${parts[1]}`,
        `${Math.max(1, Number(parts[0]) - 1)}/${parts[1]}`,
        `${parts[0]}/${Number(parts[1]) + 2}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.f1} × ${vars.f2} = ${answer}.`,
  }),

  // g4-u15-71 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-71', subtopicId: 'u15-fraction-multiplication', difficulty: 3 }),
    prompt: 'გამოთვალე: {f1} × {f2}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2/5|3/4|6/20", "3/5|2/7|6/35", "4/5|2/3|8/15", "3/7|3/4|9/28", "2/7|4/5|8/35", "5/7|2/3|10/21", "3/8|3/5|9/40", "5/8|3/4|15/32", "2/9|5/6|10/54", "4/9|3/5|12/45", "7/10|3/4|21/40", "3/10|7/8|21/80", "2/11|4/5|8/55", "3/11|2/3|6/33", "5/11|3/4|15/44", "4/13|2/3|8/39", "6/13|2/5|12/65", "3/14|3/5|9/70"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      f2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `${Number(parts[0]) + 1}/${parts[1]}`,
        `${Math.max(1, Number(parts[0]) - 1)}/${parts[1]}`,
        `${parts[0]}/${Number(parts[1]) + 2}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.f1} × ${vars.f2} = ${answer}.`,
  }),

  // g4-u15-72 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-72', subtopicId: 'u15-fraction-multiplication', difficulty: 3 }),
    prompt: 'გამოთვალე: {f1} × {f2}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["5/6|2/5|10/30", "4/5|3/4|12/20", "3/4|2/3|6/12", "6/7|3/5|18/35", "5/8|4/5|20/40", "7/8|2/3|14/24", "4/9|5/6|20/54", "5/9|3/4|15/36", "7/10|4/5|28/50", "9/10|2/3|18/30", "5/11|3/5|15/55", "6/11|4/5|24/55", "7/12|3/4|21/48", "5/12|4/5|20/60", "8/13|3/4|24/52", "6/13|5/6|30/78", "7/15|2/3|14/45", "8/15|3/4|24/60"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      f2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      return [
        `${Number(parts[0]) + 1}/${parts[1]}`,
        `${Math.max(1, Number(parts[0]) - 1)}/${parts[1]}`,
        `${parts[0]}/${Number(parts[1]) + 2}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.f1} × ${vars.f2} = ${answer}.`,
  }),

  // g4-u15-73 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-73', subtopicId: 'u15-equivalent-fractions', difficulty: 1 }),
    optionCount: 3,
    prompt: 'შეარჩიე {base}-ის ტოლი წილადი (შეკითხვა #{num}):',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1/2|2/4|2/3|3/5|1", "1/3|2/6|2/5|3/7|2", "1/4|2/8|2/6|3/8|3", "1/5|2/10|2/8|3/10|4", "1/2|3/6|2/5|3/7|5", "1/3|3/9|2/7|4/9|6", "1/4|3/12|2/7|4/12|7", "1/5|3/15|2/9|4/15|8", "1/2|4/8|3/7|4/9|9", "1/3|4/12|3/8|5/12|10", "1/4|4/16|3/10|5/16|11", "1/2|5/10|4/9|6/11|12", "1/3|5/15|4/11|6/15|13", "1/4|5/20|4/15|6/20|14", "1/2|6/12|5/11|7/13|15", "1/5|4/20|3/14|5/20|16"],
      },
      base: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      num: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [String(v.ans), String(v.w1), String(v.w2)],
    explanation: ({ vars, answer }) => `${vars.base}-ის ტოლი წილადია ${answer}.`,
  }),

  // g4-u15-74 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-74', subtopicId: 'u15-equivalent-fractions', difficulty: 1 }),
    optionCount: 3,
    prompt: 'შეარჩიე {base}-ის ტოლი წილადი:',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2/3|4/6|3/5|2/5", "3/4|6/8|4/6|3/6", "2/5|4/10|3/8|2/8", "3/5|6/10|4/8|3/8", "4/5|8/10|5/8|4/8", "2/7|4/14|3/10|2/10", "3/7|6/14|4/10|3/10", "2/3|6/9|4/7|5/8", "3/4|9/12|5/8|6/10", "2/5|6/15|4/11|5/12", "3/5|9/15|5/11|6/13", "4/5|12/15|7/10|8/13", "5/6|10/12|6/10|7/11", "3/8|6/16|4/11|5/12", "5/8|10/16|6/11|7/13", "4/9|8/18|5/12|6/15", "2/3|8/12|5/9|6/11", "3/4|12/16|7/11|8/13"],
      },
      base: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
    },
    answer: (v) => String(v.ans),
    options: (v) => [String(v.ans), String(v.w1), String(v.w2)],
    explanation: ({ vars, answer }) => `${vars.base}-ის ტოლი წილადია ${answer}.`,
  }),

  // g4-u15-75 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-75', subtopicId: 'u15-equivalent-fractions', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {f1} = {n2}/□.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3/4|6|8", "2/3|4|6", "2/5|4|10", "3/5|6|10", "4/5|8|10", "2/7|4|14", "3/7|6|14", "5/6|10|12", "3/8|6|16", "5/8|10|16", "2/9|4|18", "4/9|8|18", "3/10|6|20", "7/10|14|20", "2/3|6|9", "3/4|9|12", "2/5|6|15", "3/5|9|15"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      n2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 2, 2),
    explanation: ({ vars, answer }) => `გამოტოვებული რიცხვია ${answer}.`,
  }),

  // g4-u15-76 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-76', subtopicId: 'u15-equivalent-fractions', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი: {f1} = □/{d2}.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2/5|10|4", "3/5|10|6", "4/5|10|8", "1/5|10|2", "1/4|8|2", "3/4|8|6", "1/3|6|2", "2/3|6|4", "1/2|8|4", "1/2|10|5", "1/2|12|6", "2/7|14|4", "3/7|14|6", "4/7|14|8", "5/7|14|10", "3/8|16|6", "5/8|16|10", "7/8|16|14"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      d2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `გამოტოვებული რიცხვია ${answer}.`,
  }),

  // g4-u15-77 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-77', subtopicId: 'u15-equivalent-fractions', difficulty: 3 }),
    optionCount: 2,
    prompt: 'არის თუ არა {pair} ტოლი წილადები?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4/8 და 1/2|დიახ", "3/6 და 1/2|დიახ", "2/4 და 1/2|დიახ", "5/10 და 1/2|დიახ", "2/6 და 1/3|დიახ", "3/9 და 1/3|დიახ", "4/12 და 1/3|დიახ", "2/8 და 1/4|დიახ", "3/12 და 1/4|დიახ", "4/16 და 1/4|დიახ", "2/10 და 1/5|დიახ", "3/15 და 1/5|დიახ", "3/8 და 1/2|არა", "2/5 და 1/2|არა", "4/9 და 1/2|არა", "2/7 და 1/3|არა", "3/8 და 1/3|არა", "2/9 და 1/4|არა"],
      },
      pair: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    options: () => ['დიახ', 'არა'],
    explanation: ({ vars, answer }) => `${vars.pair}: პასუხია „${answer}“.`,
  }),

  // g4-u15-78 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-78', subtopicId: 'u15-equivalent-fractions', difficulty: 3 }),
    optionCount: 2,
    prompt: 'არის თუ არა {pair} ტოლი წილადები?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3/6 და 2/4|დიახ", "4/8 და 3/6|დიახ", "5/10 და 4/8|დიახ", "2/6 და 3/9|დიახ", "4/12 და 3/9|დიახ", "2/8 და 3/12|დიახ", "4/16 და 2/8|დიახ", "2/10 და 3/15|დიახ", "4/6 და 6/9|დიახ", "6/8 და 9/12|დიახ", "4/10 და 6/15|დიახ", "6/10 და 9/15|დიახ", "3/6 და 2/5|არა", "4/8 და 3/7|არა", "2/6 და 3/8|არა", "4/10 და 3/8|არა", "6/8 და 4/6|არა", "5/10 და 3/5|არა"],
      },
      pair: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
    },
    answer: (v) => String(v.ans),
    options: () => ['დიახ', 'არა'],
    explanation: ({ vars, answer }) => `${vars.pair}: პასუხია „${answer}“.`,
  }),

  // g4-u15-79 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-79', subtopicId: 'u15-equivalent-fractions-visual', difficulty: 1 }),
    prompt: 'წარმოიდგინე კვადრატი, რომელიც {d1} ტოლ ნაწილადაა დაყოფილი და {n1} ნაწილი გაფერადებულია. იმავე ზომის მეორე კვადრატი {d2} ტოლ ნაწილადაა დაყოფილი. რამდენი ნაწილი უნდა გაფერადდეს მეორე კვადრატში, რომ გაფერადებული ფართობები ტოლი იყოს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2|1|4|2", "3|1|6|2", "4|1|8|2", "5|1|10|2", "2|1|6|3", "3|1|9|3", "4|1|12|3", "2|1|8|4", "3|1|12|4", "2|1|10|5", "5|1|15|3", "4|1|16|4", "2|1|12|6", "3|1|15|5", "2|1|14|7", "4|1|20|5", "5|1|20|4", "3|1|18|6"],
      },
      d1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      d2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `${vars.n1}/${vars.d1} = ${answer}/${vars.d2}, ამიტომ უნდა გაფერადდეს ${answer} ნაწილი.`,
  }),

  // g4-u15-80 (Level 1)
  defineTemplate({
    ...addr({ id: 'g4-u15-80', subtopicId: 'u15-equivalent-fractions-visual', difficulty: 1 }),
    prompt: 'მართკუთხედის {f1} ნაწილია გაფერადებული. თუ იმავე მართკუთხედს {d2} ტოლ ნაწილად დავყოფთ, რამდენი ნაწილი უნდა გავაფერადოთ იმავე ფართობის მისაღებად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["1/3|6|2", "1/2|6|3", "1/4|8|2", "1/5|10|2", "1/2|8|4", "1/3|9|3", "1/4|12|3", "1/5|15|3", "1/2|10|5", "1/3|12|4", "1/4|16|4", "1/2|12|6", "1/6|12|2", "1/3|15|5", "1/5|20|4", "1/2|14|7", "1/4|20|5", "1/6|18|3"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      d2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `უნდა გავაფერადოთ ${answer} ნაწილი.`,
  }),

  // g4-u15-81 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-81', subtopicId: 'u15-equivalent-fractions-visual', difficulty: 2 }),
    prompt: 'წრე {tot} ტოლ ნაწილადაა დაყოფილი და {sh} ნაწილი გაფერადებულია. ჩაწერე გაფერადებული ნაწილის გამარტივებული წილადი.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["4|2|1/2", "6|3|1/2", "8|4|1/2", "10|5|1/2", "6|2|1/3", "9|3|1/3", "12|4|1/3", "8|2|1/4", "12|3|1/4", "16|4|1/4", "10|2|1/5", "15|3|1/5", "6|4|2/3", "8|6|3/4", "10|4|2/5", "10|6|3/5", "10|8|4/5", "12|8|2/3"],
      },
      tot: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      sh: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      const n = Number(parts[0]);
      const d = Number(parts[1]);
      return [
        `${n + 1}/${d}`,
        `${n}/${d + 1}`,
        `${n + 1}/${d + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `${vars.sh}/${vars.tot} გამარტივებით არის ${answer}.`,
  }),

  // g4-u15-82 (Level 2)
  defineTemplate({
    ...addr({ id: 'g4-u15-82', subtopicId: 'u15-equivalent-fractions-visual', difficulty: 2 }),
    prompt: 'მართკუთხედი {tot} ტოლ ნაწილადაა დაყოფილი, საიდანაც {sh} გაფერადებულია. იპოვე მისი ტოლი წილადი უმცირესი მნიშვნელით.',
    variables: {
      spec: {
        kind: 'choice',
        values: ["8|4|1/2", "6|2|1/3", "8|2|1/4", "10|2|1/5", "6|3|1/2", "10|5|1/2", "9|3|1/3", "12|3|1/4", "12|4|1/3", "15|3|1/5", "8|6|3/4", "6|4|2/3", "10|4|2/5", "10|6|3/5", "10|8|4/5", "12|8|2/3", "12|9|3/4", "16|4|1/4"],
      },
      tot: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      sh: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
    },
    answer: (v) => String(v.ans),
    distractors: (ctx) => {
      const parts = ctx.vars.ans.split('/');
      const n = Number(parts[0]);
      const d = Number(parts[1]);
      return [
        `${n + 1}/${d}`,
        `${n}/${d + 1}`,
        `${n + 1}/${d + 1}`,
      ];
    },
    explanation: ({ vars, answer }) => `ტოლი წილადი უმცირესი მნიშვნელით არის ${answer}.`,
  }),

  // g4-u15-83 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-83', subtopicId: 'u15-equivalent-fractions-visual', difficulty: 3 }),
    prompt: 'ერთი ფიგურის {f1} ნაწილია გაფერადებული. მეორე, იმავე ზომის ფიგურა {d2} ტოლ ნაწილადაა დაყოფილი. რამდენი ნაწილი უნდა გაფერადდეს, რომ ფართობები ტოლი იყოს?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["2/5|10|4", "3/5|10|6", "4/5|10|8", "1/5|10|2", "3/4|8|6", "1/4|8|2", "2/3|6|4", "1/3|6|2", "1/2|8|4", "1/2|10|5", "2/3|9|6", "1/3|9|3", "3/4|12|9", "1/4|12|3", "2/5|15|6", "3/5|15|9", "4/5|15|12", "5/6|12|10"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      d2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `უნდა გაფერადდეს ${answer} ნაწილი.`,
  }),

  // g4-u15-84 (Level 3)
  defineTemplate({
    ...addr({ id: 'g4-u15-84', subtopicId: 'u15-equivalent-fractions-visual', difficulty: 3 }),
    prompt: 'კვადრატის {f1} ნაწილია გაფერადებული. თუ კვადრატი {d2} ტოლ ნაწილად დაიყოფა, რამდენი ნაწილი უნდა გაფერადდეს იმავე ფართობის მისაღებად?',
    variables: {
      spec: {
        kind: 'choice',
        values: ["3/4|8|6", "1/4|8|2", "2/3|6|4", "1/3|6|2", "2/5|10|4", "3/5|10|6", "4/5|10|8", "1/2|8|4", "1/2|10|5", "2/3|9|6", "1/3|9|3", "3/4|12|9", "1/4|12|3", "2/5|15|6", "3/5|15|9", "4/5|15|12", "5/6|12|10", "1/6|12|2"],
      },
      f1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      d2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
    },
    answer: (v) => Number(v.ans),
    distractors: (ctx) => nearMisses(Number(ctx.answer), 3, 1, 1),
    explanation: ({ vars, answer }) => `უნდა გაფერადდეს ${answer} ნაწილი.`,
  }),
];
