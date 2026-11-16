import type { QuestionTemplate } from './types';
import { bank, fourOptions, rowNumbers } from './g5-helpers';

/**
 * Grade V — Unit 17: მონაცემები და ალბათობა (data and probability).
 *
 * Converted from the academy's `U17` bank (8 subtopics × 6 questions).
 *
 * Three rules shape this unit.
 *
 * **A table or chart is data, not decoration.** Every question here quotes the
 * figures it asks about inside its own wording, so a student can always answer
 * without a picture that might disagree with the numbers. Where the bank hands
 * over a pictogram or a frequency table, the template carries that table as the
 * variable pool and reads the same rows the answer is computed from.
 *
 * **A share is a number, not a fraction of prose.** „რა წილი“ keeps the answer
 * arithmetic („10 / 20“) so a distractor can be a real mistake — dividing by the
 * wrong total — instead of a different spelling of the same value.
 *
 * **A probability is a ratio in lowest terms.** `fracText` renders it the way
 * the rest of the app writes fractions, so „3/10“ never arrives as „0,3“ in one
 * place and „3/10“ in another.
 */

export const G5_U17_SUBTOPICS = [
  'u17-01',
  'u17-02',
  'u17-03',
  'u17-04',
  'u17-05',
  'u17-06',
  'u17-07',
  'u17-08',
] as const;

export type G5U17SubtopicId = (typeof G5_U17_SUBTOPICS)[number];

const TOPIC = 'g5-data-chance';

const at = (row: unknown, index: number): number => rowNumbers(row)[index]!;

/** `░░░` — n stars, for a pictogram the question quotes. */
const stars = (count: number): string => '★'.repeat(count);

/** The largest and smallest of a set, with the index of the winner. */
const extreme = (values: number[], direction: 'max' | 'min'): number => {
  const target = direction === 'max' ? Math.max(...values) : Math.min(...values);
  return values.indexOf(target);
};

/** `3/10` in lowest terms, as a Georgian fraction. */
const probabilityText = (favourable: number, total: number): string => {
  const divisor = gcdOf(favourable, total);
  const up = favourable / divisor;
  const down = total / divisor;
  return down === 1 ? String(up) : `${up}/${down}`;
};

const gcdOf = (a: number, b: number): number => (b === 0 ? a : gcdOf(b, a % b));

export const G5_U17_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U17.1 — მონაცემებისთვის შესაბამისი ცხრილის შერჩევა ═════════
  bank({
    id: 'g5-u17-q01',
    subtopicId: 'u17-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'სამი კატეგორიის რაოდენობებია: {name1} — {n1}, {name2} — {n2}, {name3} — {n3}. რამდენია სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'ფეხბურთი|12|კალათბურთი|8|ცურვა|5',
          'ვაშლი|15|მსხალი|20|ატამი|12',
          'ქაღალდი|18|პლასტმასი|12|მინა|10',
          'წითელი|6|ლურჯი|9|მწვანე|4',
          'ორშაბათი|24|სამშაბათი|18|ოთხშაბათი|30',
          'A|25|B|32|C|28',
          'კატა|9|ძაღლი|14|თევზი|7',
          'მათემატიკა|16|ქართული|20|ბუნება|11',
          'ტყე|22|მინდორი|17|მთა|9',
        ],
      },
      name1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      n1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      name2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      name3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]!] },
      n3: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) => Number(v.n1) + Number(v.n2) + Number(v.n3),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [a, b, c] = [Number(v.n1), Number(v.n2), Number(v.n3)];
      return numericOptions(a + b + c, [a + b, b + c, Math.max(a, b, c)]);
    },
    explain: ({ vars, answer }) =>
      `სულ = ${vars.n1} + ${vars.n2} + ${vars.n3} = ${answer}.`,
  }),
  bank({
    id: 'g5-u17-q02',
    subtopicId: 'u17-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: '{label1} — {n1}, {label2} — {n2}, {label3} — {n3}. რომელია ყველაზე მეტი?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'ორშაბათი|15|სამშაბათი|20|ოთხშაბათი|12',
          'წითელი|6|ლურჯი|9|მწვანე|4',
          'A|25|B|32|C|28',
          'ფეხბურთი|12|კალათბურთი|8|ცურვა|5',
          'იანვარი|30|თებერვალი|45|მარტი|38',
          'ნიკა|14|ლუკა|19|ანა|11',
          'ვაშლი|7|ატამი|12|მსხალი|9',
          'მათემატიკა|18|ქართული|22|ბუნება|15',
        ],
      },
      label1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      n1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      label2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      label3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]!] },
      n3: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) => {
      const values = [Number(v.n1), Number(v.n2), Number(v.n3)];
      const labels = [String(v.label1), String(v.label2), String(v.label3)];
      return labels[extreme(values, 'max')]!;
    },
    format: { kind: 'text' },
    options: (v) => [String(v.label1), String(v.label2), String(v.label3)],
    optionCount: 3,
    explain: ({ vars, answer }) => {
      const values = [Number(vars.n1), Number(vars.n2), Number(vars.n3)];
      return `${vars.label1} — ${vars.n1}, ${vars.label2} — ${vars.n2}, ${vars.label3} — ${vars.n3}; ყველაზე მეტია ${answer} (${Math.max(...values)}).`;
    },
  }),
  bank({
    id: 'g5-u17-q03',
    subtopicId: 'u17-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{label1} — {n1}, {label2} — {n2}. რამდენით მეტია {label2}, ვიდრე {label1}?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'A|25|B|32', 'ორშაბათი|12|პარასკევი|24', 'წითელი|9|ლურჯი|17',
          'ნიკა|36|ლუკა|48', 'ვაშლი|18|მსხალი|31', 'იანვარი|45|მარტი|62',
          'ქართული|22|მათემატიკა|35', 'კატა|14|ძაღლი|23', 'ტყე|40|მთა|57',
        ],
      },
      label1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      n1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      label2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => Number(v.n2) - Number(v.n1),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [a, b] = [Number(v.n1), Number(v.n2)];
      return numericOptions(b - a, [b + a, a, Math.abs(b - a) + 2]);
    },
    explain: ({ vars, answer }) => `${vars.label2} − ${vars.label1} = ${vars.n2} − ${vars.n1} = ${answer}.`,
  }),
  bank({
    id: 'g5-u17-q04',
    subtopicId: 'u17-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{label1} — {n1}, {label2} — {n2}, {label3} — {n3}. რომელია ყველაზე ცოტა?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'ორშაბათი|15|სამშაბათი|20|ოთხშაბათი|12',
          'წითელი|6|ლურჯი|9|მწვანე|4',
          'A|25|B|32|C|28',
          'ფეხბურთი|12|კალათბურთი|8|ცურვა|5',
          'იანვარი|30|თებერვალი|45|მარტი|38',
          'ნიკა|14|ლუკა|19|ანა|11',
          'ვაშლი|7|ატამი|12|მსხალი|9',
          'მათემატიკა|18|ქართული|22|ბუნება|15',
        ],
      },
      label1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      n1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      label2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      label3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]!] },
      n3: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) => {
      const values = [Number(v.n1), Number(v.n2), Number(v.n3)];
      const labels = [String(v.label1), String(v.label2), String(v.label3)];
      return labels[extreme(values, 'min')]!;
    },
    format: { kind: 'text' },
    options: (v) => [String(v.label1), String(v.label2), String(v.label3)],
    optionCount: 3,
    explain: ({ vars, answer }) => {
      const values = [Number(vars.n1), Number(vars.n2), Number(vars.n3)];
      return `${vars.label1} — ${vars.n1}, ${vars.label2} — ${vars.n2}, ${vars.label3} — ${vars.n3}; ყველაზე ცოტაა ${answer} (${Math.min(...values)}).`;
    },
  }),

  // ═════════ U17.2 — პიქტოგრამები ═════════
  bank({
    id: 'g5-u17-q05',
    subtopicId: 'u17-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'პიქტოგრამაზე ერთი ★ აღნიშნავს {unit} ერთეულს. {label}: {row}. რამდენი ერთეულია {label}?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['2|ფეხბურთი|4', '2|კალათბურთი|3', '2|ცურვა|2', '3|ფეხბურთი|5', '3|კალათბურთი|4',
          '4|ცურვა|3', '5|ფეხბურთი|6', '2|ჩოგბურთი|7', '3|ცურვა|8', '4|ფეხბურთი|5',
          '5|კალათბურთი|4', '2|ცურვა|9', '3|ჩოგბურთი|6', '4|ცურვა|7'],
      },
      unit: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      label: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      row: { kind: 'choice', values: (v) => [stars(at(v.spec, 2))] },
      count: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => Number(v.unit) * Number(v.count),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [unit, count] = [Number(v.unit), Number(v.count)];
      return numericOptions(unit * count, [unit + count, count, unit * count + unit]);
    },
    explain: ({ vars, answer }) =>
      `${vars.row} — ${vars.count} ვარსკვლავი, თითოეული ${vars.unit} ერთეულია, ამიტომ ${vars.count} × ${vars.unit} = ${answer}.`,
  }),
  bank({
    id: 'g5-u17-q06',
    subtopicId: 'u17-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'პიქტოგრამაზე ★ აღნიშნავს {unit} ერთეულს: {label1} — {row1}, {label2} — {row2}. რამდენი ერთეულია სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['2|4|3', '2|5|2', '3|3|2', '3|4|4', '4|2|3', '2|6|3', '5|2|2', '3|5|3', '4|3|2', '2|7|1'],
      },
      unit: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      label1: { kind: 'choice', values: (v) => [stars(at(v.spec, 1))] },
      row1: { kind: 'choice', values: (v) => [stars(at(v.spec, 1))] },
      label2: { kind: 'choice', values: (v) => [stars(at(v.spec, 2))] },
      row2: { kind: 'choice', values: (v) => [stars(at(v.spec, 2))] },
      count1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      count2: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => Number(v.unit) * (Number(v.count1) + Number(v.count2)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [unit, a, b] = [Number(v.unit), Number(v.count1), Number(v.count2)];
      return numericOptions(unit * (a + b), [a + b, unit * a, unit * b]);
    },
    explain: ({ vars, answer }) =>
      `ვარსკვლავების რაოდენობა ${vars.count1} + ${vars.count2} = ${Number(vars.count1) + Number(vars.count2)}; თითოეული ${vars.unit} ერთეულია, ამიტომ ${answer}.`,
  }),
  bank({
    id: 'g5-u17-q07',
    subtopicId: 'u17-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ერთი ★ = {unit} ერთეული. {label1}: {row1}; {label2}: {row2}. რამდენი ერთეულით მეტია {label1}, ვიდრე {label2}?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['2|4|2', '3|5|3', '2|6|4', '4|4|3', '3|6|2', '2|5|3', '5|3|2', '3|7|4', '4|5|2', '2|8|5'],
      },
      unit: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      label1: { kind: 'choice', values: () => ['ვარსკვლავები'] },
      label2: { kind: 'choice', values: () => ['წრეები'] },
      row1: { kind: 'choice', values: (v) => [stars(at(v.spec, 1))] },
      row2: { kind: 'choice', values: (v) => ['○'.repeat(at(v.spec, 2))] },
      count1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      count2: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => Number(v.unit) * (Number(v.count1) - Number(v.count2)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [unit, a, b] = [Number(v.unit), Number(v.count1), Number(v.count2)];
      return numericOptions(unit * (a - b), [a - b, unit * a, unit * (a + b)]);
    },
    explain: ({ vars, answer }) =>
      `სხვაობა ${vars.count1} − ${vars.count2} = ${Number(vars.count1) - Number(vars.count2)} ნიშანია; თითოეული ${vars.unit} ერთეულია, ამიტომ ${answer}.`,
  }),

  // ═════════ U17.3 — სიხშირეთა ცხრილები ═════════
  bank({
    id: 'g5-u17-q08',
    subtopicId: 'u17-03',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'სიხშირეთა ცხრილი: {table}. რამდენმა მოსწავლემ წაიკითხა {books} წიგნი?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '0|2|1|5|2|7|3|4|4|2|2',
          '0|1|1|3|2|6|3|5|4|4|3',
          '0|3|1|4|2|5|3|6|4|1|2',
          '0|2|1|6|2|4|3|3|4|5|4',
          '0|4|1|2|2|8|3|3|4|2|1',
          '0|2|1|7|2|5|3|4|4|3|3',
          '0|5|1|2|2|6|3|3|4|4|0',
          '0|1|1|4|2|2|3|6|4|5|4',
          '0|3|1|3|2|9|3|2|4|1|2',
        ],
      },
      table: {
        kind: 'choice',
        values: (v) => {
          const row = String(v.spec).split('|').map(Number);
          return [[0, 1, 2, 3, 4].map((k) => `${k} → ${row[k * 2 + 1]}`).join(' · ')];
        },
      },
      books: { kind: 'choice', values: (v) => [at(v.spec, 10)] },
      shown: {
        kind: 'choice',
        values: (v) => {
          const row = String(v.spec).split('|').map(Number);
          return [row[Number(v.books) * 2 + 1]!];
        },
      },
    },
    answer: (v) => Number(v.shown),
    format: { kind: 'integer', min: 0 },
    options: (v) => {
      const row = String(v.spec).split('|').map(Number);
      const frequencies = [0, 1, 2, 3, 4].map((k) => row[k * 2 + 1]!);
      return numericOptions(Number(v.shown), frequencies);
    },
    explain: ({ vars, answer }) => `${vars.table} — ${vars.books} წიგნი წაიკითხა ${answer} მოსწავლემ.`,
  }),
  bank({
    id: 'g5-u17-q09',
    subtopicId: 'u17-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'სიხშირეთა ცხრილი: {table}. რამდენი მოსწავლეა ცხრილში სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '0|2|1|5|2|7|3|4|4|2',
          '0|1|1|3|2|6|3|5|4|4',
          '0|3|1|4|2|5|3|6|4|1',
          '0|2|1|6|2|4|3|3|4|5',
          '0|4|1|2|2|8|3|3|4|2',
          '0|1|1|2|2|3|3|4|4|5',
          '0|5|1|5|2|5|3|5|4|5',
          '0|2|1|8|2|3|3|6|4|1',
        ],
      },
      table: {
        kind: 'choice',
        values: (v) => {
          const row = String(v.spec).split('|').map(Number);
          return [[0, 1, 2, 3, 4].map((k) => `${k} → ${row[k * 2 + 1]}`).join(' · ')];
        },
      },
      total: {
        kind: 'choice',
        values: (v) => {
          const row = String(v.spec).split('|').map(Number);
          return [[0, 1, 2, 3, 4].reduce((sum, k) => sum + row[k * 2 + 1]!, 0)];
        },
      },
    },
    answer: (v) => Number(v.total),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.total), [Number(v.total) - 2, Number(v.total) + 3, Number(v.total) - 5]),
    explain: ({ vars, answer }) => `${vars.table} — ყველა სიხშირის ჯამი ${answer}.`,
  }),
  bank({
    id: 'g5-u17-q10',
    subtopicId: 'u17-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'სიხშირეთა ცხრილი: {table}. რამდენმა მოსწავლემ წაიკითხა სულ მცირე 3 წიგნი?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '0|2|1|5|2|7|3|4|4|2',
          '0|1|1|3|2|6|3|5|4|4',
          '0|3|1|4|2|5|3|6|4|1',
          '0|2|1|6|2|4|3|3|4|5',
          '0|4|1|2|2|8|3|3|4|2',
          '0|1|1|2|2|3|3|4|4|5',
          '0|5|1|5|2|5|3|5|4|5',
        ],
      },
      table: {
        kind: 'choice',
        values: (v) => {
          const row = String(v.spec).split('|').map(Number);
          return [[0, 1, 2, 3, 4].map((k) => `${k} → ${row[k * 2 + 1]}`).join(' · ')];
        },
      },
      atLeastThree: {
        kind: 'choice',
        values: (v) => {
          const row = String(v.spec).split('|').map(Number);
          return [row[7]! + row[9]!];
        },
      },
    },
    answer: (v) => Number(v.atLeastThree),
    format: { kind: 'integer', min: 1 },
    options: (v) => numericOptions(Number(v.atLeastThree), [Number(v.atLeastThree) + 2, Number(v.atLeastThree) - 2, Number(v.atLeastThree) + 4]),
    explain: ({ vars, answer }) => `${vars.table} — „სულ მცირე 3“ ნიშნავს 3-სა და 4-ს: ${answer} მოსწავლე.`,
  }),
  bank({
    id: 'g5-u17-q11',
    subtopicId: 'u17-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'სიხშირეთა ცხრილი: {table}. რომელი რაოდენობის წიგნი წაიკითხა ყველაზე მეტმა მოსწავლემ?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '0|2|1|5|2|7|3|4|4|2',
          '0|1|1|3|2|6|3|5|4|4',
          '0|3|1|4|2|5|3|6|4|1',
          '0|2|1|6|2|4|3|3|4|5',
          '0|4|1|2|2|8|3|3|4|2',
        ],
      },
      table: {
        kind: 'choice',
        values: (v) => {
          const row = String(v.spec).split('|').map(Number);
          return [[0, 1, 2, 3, 4].map((k) => `${k} → ${row[k * 2 + 1]}`).join(' · ')];
        },
      },
      mode: {
        kind: 'choice',
        values: (v) => {
          const row = String(v.spec).split('|').map(Number);
          const frequencies = [0, 1, 2, 3, 4].map((k) => row[k * 2 + 1]!);
          return [String(frequencies.indexOf(Math.max(...frequencies)))];
        },
      },
    },
    answer: (v) => Number(v.mode),
    format: { kind: 'integer', min: 0 },
    options: (v) => {
      const row = String(v.spec).split('|').map(Number);
      const frequencies = [0, 1, 2, 3, 4].map((k) => row[k * 2 + 1]!);
      const mode = frequencies.indexOf(Math.max(...frequencies));
      const others = [0, 1, 2, 3, 4].filter((k) => k !== mode);
      return [String(mode), ...others.slice(0, 3).map(String)];
    },
    explain: ({ vars, answer }) =>
      `${vars.table} — ყველაზე დიდი სიხშირე ${answer} წიგნს აქვს, ამიტომ ის გვხვდება ყველაზე ხშირად.`,
  }),

  // ═════════ U17.4 — წრიული დიაგრამები ═════════
  bank({
    id: 'g5-u17-q12',
    subtopicId: 'u17-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'კლასში {total} მოსწავლეა. საყვარელი სპორტის სახეობები: {parts}. მოსწავლეების რა წილი ირჩევს {sport}-ს?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '20|ფეხბურთი|10|კალათბურთი|5|ცურვა|3|ჩოგბურთი|2',
          '24|ფეხბურთი|12|კალათბურთი|6|ცურვა|4|ჩოგბურთი|2',
          '16|ფეხბურთი|8|კალათბურთი|4|ცურვა|3|ჩოგბურთი|1',
          '20|ფეხბურთი|8|კალათბურთი|6|ცურვა|4|ჩოგბურთი|2',
          '25|ფეხბურთი|10|კალათბურთი|8|ცურვა|4|ჩოგბურთი|3',
          '20|ფეხბურთი|6|კალათბურთი|5|ცურვა|5|ჩოგბურთი|4',
        ],
      },
      total: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      sport: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      chosen: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      parts: {
        kind: 'choice',
        values: (v) => {
          const [, s1, n1, s2, n2, s3, n3, s4, n4] = String(v.spec).split('|');
          return [`${s1} — ${n1}, ${s2} — ${n2}, ${s3} — ${n3}, ${s4} — ${n4}`];
        },
      },
    },
    answer: (v) => probabilityText(Number(v.chosen), Number(v.total)),
    format: { kind: 'text' },
    options: (v) => {
      const [total, chosen] = [Number(v.total), Number(v.chosen)];
      return fourOptions(probabilityText(chosen, total), [
        probabilityText(chosen, total + 4),
        probabilityText(chosen * 2, total),
        probabilityText(total - chosen, total),
      ]);
    },
    explain: ({ vars, answer }) =>
      `${vars.parts} — სულ ${vars.total}. ${vars.sport}: ${vars.chosen}/${vars.total} = ${answer}.`,
  }),
  bank({
    id: 'g5-u17-q13',
    subtopicId: 'u17-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'კლასში {total} მოსწავლეა: {parts}. მოსწავლეების რამდენი პროცენტი ირჩევს {sport}-ს?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '20|ფეხბურთი|10|5|3|2',
          '20|კალათბურთი|5|10|3|2',
          '25|ფეხბურთი|10|8|4|3',
          '20|ჩოგბურთი|2|10|5|3',
          '50|ფეხბურთი|25|15|6|4',
          '20|ცურვა|4|10|4|2',
          '25|ცურვა|5|10|8|2',
          '40|ფეხბურთი|20|10|6|4',
        ],
      },
      total: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      sport: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      chosen: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      parts: {
        kind: 'choice',
        values: (v) => {
          const row = String(v.spec).split('|');
          return [`${row[1]} — ${row[2]}, სხვა სპორტი — ${row[3]}, ${row[4]} და ${row[5]}`];
        },
      },
    },
    answer: (v) => (Number(v.chosen) / Number(v.total)) * 100,
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [total, chosen] = [Number(v.total), Number(v.chosen)];
      const right = (chosen / total) * 100;
      return numericOptions(right, [right + 10, right - 5, 100 - right]);
    },
    explain: ({ vars, answer }) =>
      `${vars.sport}: ${vars.chosen} ÷ ${vars.total} × 100% = ${answer}%.`,
  }),
  bank({
    id: 'g5-u17-q14',
    subtopicId: 'u17-04',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'წრიულ დიაგრამაზე {total} მოსწავლეა. {sport}-ს ირჩევს {chosen} მოსწავლე. რამდენი გრადუსით უნდა იყოს წარმოდგენილი ეს სექტორი?',
    hint: 'მთელი წრე 360°-ია, ამიტომ სექტორი = (წილი) × 360°.',
    variables: {
      spec: {
        kind: 'choice',
        values: ['20|10', '20|5', '20|4', '25|10', '50|25', '40|10', '24|6', '20|2', '25|5', '36|9', '15|3', '30|6'],
      },
      total: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      chosen: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      sport: { kind: 'choice', values: () => ['ფეხბურთი'] },
    },
    answer: (v) => (Number(v.chosen) / Number(v.total)) * 360,
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [total, chosen] = [Number(v.total), Number(v.chosen)];
      const right = (chosen / total) * 360;
      return numericOptions(right, [right + 36, right - 18, (chosen / total) * 100]);
    },
    explain: ({ vars, answer }) =>
      `წილი = ${vars.chosen}/${vars.total}; სექტორი = ${vars.chosen} ÷ ${vars.total} × 360° = ${answer}°.`,
  }),
  bank({
    id: 'g5-u17-q15',
    subtopicId: 'u17-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'კლასში {total} მოსწავლეა: {parts}. რომელ სპორტს ირჩევს ყველაზე ცოტა მოსწავლე?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '20|ფეხბურთი|10|კალათბურთი|5|ცურვა|3|ჩოგბურთი|2',
          '20|ფეხბურთი|8|კალათბურთი|6|ცურვა|4|ჩოგბურთი|2',
          '25|ფეხბურთი|10|კალათბურთი|8|ცურვა|4|ჩოგბურთი|3',
          '24|ფეხბურთი|12|კალათბურთი|6|ცურვა|4|ჩოგბურთი|2',
          '16|ფეხბურთი|8|კალათბურთი|4|ცურვა|3|ჩოგბურთი|1',
        ],
      },
      total: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      parts: {
        kind: 'choice',
        values: (v) => {
          const [, s1, n1, s2, n2, s3, n3, s4, n4] = String(v.spec).split('|');
          return [`${s1} — ${n1}, ${s2} — ${n2}, ${s3} — ${n3}, ${s4} — ${n4}`];
        },
      },
      least: {
        kind: 'choice',
        values: (v) => {
          const row = String(v.spec).split('|');
          const pairs: Array<[string, number]> = [
            [row[1]!, Number(row[2])],
            [row[3]!, Number(row[4])],
            [row[5]!, Number(row[6])],
            [row[7]!, Number(row[8])],
          ];
          pairs.sort((a, b) => a[1] - b[1]);
          return [pairs[0]![0]];
        },
      },
    },
    answer: (v) => String(v.least),
    format: { kind: 'text' },
    options: (v) => {
      const row = String(v.spec).split('|');
      return [row[1]!, row[3]!, row[5]!, row[7]!].map(String);
    },
    explain: ({ vars, answer }) => `${vars.parts} — ყველაზე ცოტა მოსწავლე ${answer}-ს ირჩევს.`,
  }),

  // ═════════ U17.5 — სვეტოვანი დიაგრამები ═════════
  bank({
    id: 'g5-u17-q16',
    subtopicId: 'u17-05',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'კვირის განმავლობაში გაყიდული ნაყინი: ორშაბათი — {mon}, სამშაბათი — {tue}, ოთხშაბათი — {wed}, ხუთშაბათი — {thu}, პარასკევი — {fri}. რამდენი ნაყინი გაიყიდა ხუთივე დღეს სულ?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '12|18|15|21|24', '10|14|16|20|22', '15|12|18|23|19',
          '20|16|14|18|25', '8|12|10|14|16', '22|20|18|24|26',
          '9|13|11|15|17', '25|21|19|23|27',
        ],
      },
      mon: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      tue: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      wed: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      thu: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      fri: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
    },
    answer: (v) => Number(v.mon) + Number(v.tue) + Number(v.wed) + Number(v.thu) + Number(v.fri),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const values = [Number(v.mon), Number(v.tue), Number(v.wed), Number(v.thu), Number(v.fri)];
      const total = values.reduce((sum, n) => sum + n, 0);
      return numericOptions(total, [total - 5, total + 4, Math.max(...values)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.mon} + ${vars.tue} + ${vars.wed} + ${vars.thu} + ${vars.fri} = ${answer} ნაყინი.`,
  }),
  bank({
    id: 'g5-u17-q17',
    subtopicId: 'u17-05',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გაყიდული ნაყინი: ორშაბათი — {mon}, სამშაბათი — {tue}, ოთხშაბათი — {wed}, ხუთშაბათი — {thu}, პარასკევი — {fri}. რომელ დღეს გაიყიდა ყველაზე მეტი ნაყინი?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '12|18|15|21|24', '10|14|16|20|22', '15|12|18|23|19',
          '20|16|14|18|25', '8|12|10|14|16', '22|20|18|24|26',
          '9|13|11|15|17', '25|21|19|23|27',
        ],
      },
      mon: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      tue: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      wed: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      thu: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      fri: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      busiest: {
        kind: 'choice',
        values: (v) => {
          const names = ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი'];
          const values = [at(v.spec, 0), at(v.spec, 1), at(v.spec, 2), at(v.spec, 3), at(v.spec, 4)];
          let best = 0;
          for (let i = 1; i < values.length; i += 1) if (values[i]! > values[best]!) best = i;
          return [names[best]!];
        },
      },
    },
    answer: (v) => String(v.busiest),
    format: { kind: 'text' },
    options: (v) => {
      const names = ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი'];
      const best = names.indexOf(String(v.busiest));
      return [names[best]!, ...names.filter((_, i) => i !== best).slice(0, 3)];
    },
    optionCount: 4,
    explain: ({ vars, answer }) =>
      `${vars.mon}, ${vars.tue}, ${vars.wed}, ${vars.thu}, ${vars.fri} — ყველაზე მეტი ნაყინი ${answer}-ს გაიყიდა.`,
  }),
  bank({
    id: 'g5-u17-q18',
    subtopicId: 'u17-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გაყიდული ნაყინი: ორშაბათი — {mon}, სამშაბათი — {tue}, ოთხშაბათი — {wed}, ხუთშაბათი — {thu}, პარასკევი — {fri}. რამდენი ნაყინი გაიყიდა სამშაბათსა და ოთხშაბათს ერთად?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '12|18|15|21|24', '10|14|16|20|22', '15|12|18|23|19',
          '20|16|14|18|25', '8|12|10|14|16', '22|20|18|24|26',
          '9|13|11|15|17', '25|21|19|23|27',
        ],
      },
      mon: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      tue: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      wed: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      thu: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      fri: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
    },
    answer: (v) => Number(v.tue) + Number(v.wed),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [tue, wed] = [Number(v.tue), Number(v.wed)];
      return numericOptions(tue + wed, [Math.abs(tue - wed), tue + wed + 6, tue]);
    },
    explain: ({ vars, answer }) => `სამშაბათი + ოთხშაბათი = ${vars.tue} + ${vars.wed} = ${answer}.`,
  }),
  bank({
    id: 'g5-u17-q19',
    subtopicId: 'u17-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გაყიდული ნაყინი: ორშაბათი — {mon}, პარასკევი — {fri}. რამდენით მეტია პარასკევს გაყიდული ნაყინი ორშაბათისაზე?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['12|24', '10|22', '15|19', '20|25', '8|16', '22|26', '9|17', '25|27', '14|21', '11|18'],
      },
      mon: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      fri: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.fri) - Number(v.mon),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [mon, fri] = [Number(v.mon), Number(v.fri)];
      return numericOptions(fri - mon, [fri + mon, mon, fri]);
    },
    explain: ({ vars, answer }) => `პარასკევი − ორშაბათი = ${vars.fri} − ${vars.mon} = ${answer}.`,
  }),
  bank({
    id: 'g5-u17-q20',
    subtopicId: 'u17-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'სვეტოვან დიაგრამაზე თითოეული დანაყოფი {unit} ნაყინს აღნიშნავს. ხუთშაბათს გაიყიდა {thu} ნაყინი. რამდენი დანაყოფით უნდა იყოს წარმოდგენილი ხუთშაბათი?',
    variables: {
      spec: { kind: 'choice', values: ['3|21', '3|24', '4|20', '5|25', '2|16', '3|18', '4|24', '5|30', '2|12', '6|18', '4|36', '3|27'] },
      unit: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      thu: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.thu) / Number(v.unit),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const [unit, thu] = [Number(v.unit), Number(v.thu)];
      return numericOptions(thu / unit, [thu - unit, thu / unit + 1, thu / unit + 2]);
    },
    explain: ({ vars, answer }) =>
      `დანაყოფების რაოდენობა = ${vars.thu} ÷ ${vars.unit} = ${answer}.`,
  }),

  // ═════════ U17.6 — ჰიპოთეზა ═════════
  bank({
    id: 'g5-u17-q21',
    subtopicId: 'u17-06',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ყუთში არის {red} წითელი და {blue} ლურჯი ბურთი. რომელი ფერის ბურთის ამოღებაა უფრო მოსალოდნელი?',
    variables: {
      spec: { kind: 'choice', values: ['8|2', '9|1', '6|3', '7|4', '10|2', '5|2', '9|4', '8|1', '7|2', '6|1', '12|3', '11|2'] },
      red: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      blue: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => (Number(v.red) > Number(v.blue) ? 'წითელი' : 'ლურჯი'),
    format: { kind: 'text' },
    options: () => ['წითელი', 'ლურჯი'],
    optionCount: 2,
    explain: ({ vars, answer }) =>
      `${vars.red} > ${vars.blue}, ამიტომ უფრო მოსალოდნელია ${answer} ბურთი.`,
  }),
  bank({
    id: 'g5-u17-q22',
    subtopicId: 'u17-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ყუთში არის {a} მწვანე და {b} ყვითელი ბურთი. რომელი ფერის ბურთის ამოღებაა უფრო მოსალოდნელი?',
    variables: {
      spec: { kind: 'choice', values: ['5|5', '4|4', '7|7', '6|6', '3|3', '10|10', '8|8', '12|12'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: () => 'თანაბრად მოსალოდნელია',
    format: { kind: 'text' },
    options: () => ['მწვანე', 'ყვითელი', 'თანაბრად მოსალოდნელია'],
    optionCount: 3,
    explain: ({ vars }) =>
      `მწვანე და ყვითელი ბურთების რაოდენობა ტოლია (${vars.a} = ${vars.b}), ამიტომ ამოღება თანაბრად მოსალოდნელია.`,
  }),
  bank({
    id: 'g5-u17-q23',
    subtopicId: 'u17-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ყუთში არის {white} თეთრი და {black} შავი ბურთი. ბურთს ბევრჯერ ამოიღებენ დაბრუნებით. რომელი ფერი ამოვა უფრო ხშირად?',
    variables: {
      spec: { kind: 'choice', values: ['9|1', '8|2', '7|3', '10|2', '12|1', '6|2', '11|3', '15|5', '9|2', '13|2'] },
      white: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      black: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: () => 'თეთრი',
    format: { kind: 'text' },
    options: () => ['თეთრი', 'შავი'],
    optionCount: 2,
    explain: ({ vars }) =>
      `თეთრი ბურთები მეტია (${vars.white} > ${vars.black}), ამიტომ უფრო ხშირად თეთრი ამოვა.`,
  }),
  bank({
    id: 'g5-u17-q24',
    subtopicId: 'u17-06',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ყუთში არის {r} წითელი, {b} ლურჯი და {g} მწვანე ბურთი. რომელი ფერის ბურთის ამოღებაა ყველაზე მოსალოდნელი?',
    variables: {
      spec: { kind: 'choice', values: ['3|4|5', '5|3|4', '4|6|2', '2|3|7', '6|4|3', '1|5|4', '4|2|6', '3|7|2'] },
      r: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      g: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => {
      const entries: Array<[string, number]> = [
        ['წითელი', Number(v.r)],
        ['ლურჯი', Number(v.b)],
        ['მწვანე', Number(v.g)],
      ];
      entries.sort((x, y) => y[1] - x[1]);
      return entries[0]![0];
    },
    format: { kind: 'text' },
    options: () => ['წითელი', 'ლურჯი', 'მწვანე'],
    optionCount: 3,
    explain: ({ vars, answer }) =>
      `წითელი ${vars.r}, ლურჯი ${vars.b}, მწვანე ${vars.g} — ყველაზე მეტია ${answer}, ამიტომ ის ყველაზე მოსალოდნელია.`,
  }),
  bank({
    id: 'g5-u17-q25',
    subtopicId: 'u17-06',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'მონეტა {tosses}-ჯერ ააგდეს და {count}-ჯერ ამოვიდა გერბი. შეიძლება თუ არა დავასკვნათ, რომ შემდეგ აგდებაზეც აუცილებლად გერბი ამოვა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['10|7', '12|8', '8|5', '15|9', '20|12', '6|4', '10|3', '14|9'],
      },
      tosses: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      count: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: () => 'არა',
    format: { kind: 'text' },
    options: () => ['კი', 'არა'],
    optionCount: 2,
    explain: ({ vars }) =>
      `არა. წინა ${vars.tosses} აგდების შედეგი არ ცვლის შემდეგ აგდებას: გერბისა და რიცხვის ალბათობა ისევ თანაბარია — 1/2.`,
  }),
  bank({
    id: 'g5-u17-q26',
    subtopicId: 'u17-06',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'კამათელი {rolls}-ჯერ გააგორეს და ექვსიანი {sixes}-ჯერ ამოვიდა. ნიშნავს თუ არა ეს, რომ შემდეგ გაგორებაზე ექვსიანი აუცილებლად ამოვა?',
    variables: {
      spec: { kind: 'choice', values: ['12|4', '10|3', '18|5', '15|4', '20|6', '9|3', '24|7', '30|8'] },
      rolls: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      sixes: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: () => 'არა',
    format: { kind: 'text' },
    options: () => ['კი', 'არა'],
    optionCount: 2,
    explain: ({ vars }) =>
      `არა. ${vars.rolls} გაგორება უკვე დასრულდა; შემდეგ გაგორებაზე ექვსიანის ალბათობა ისევ 1/6-ია, მიუხედავად იმისა, რამდენჯერ ამოვიდა მანამდე.`,
  }),

  // ═════════ U17.7 — აუცილებელი, შესაძლებელი, შეუძლებელი ═════════
  bank({
    id: 'g5-u17-q27',
    subtopicId: 'u17-07',
    topicId: TOPIC,
    difficulty: 1,
    prompt: '{event} ეს მოვლენა არის აუცილებელი, შესაძლებელი თუ შეუძლებელი?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          'ჩვეულებრივი ექვსწახნაგა კამათლის გაგორებისას ამოვა 3.|შესაძლებელი',
          'ჩვეულებრივი ექვსწახნაგა კამათლის გაგორებისას ამოვა 7.|შეუძლებელი',
          'ჩვეულებრივი ექვსწახნაგა კამათლის გაგორებისას ამოვა 1-დან 6-მდე რომელიმე რიცხვი.|აუცილებელი',
          'ჩვეულებრივი მონეტის აგდებისას ამოვა გერბი.|შესაძლებელი',
          'ჩვეულებრივი მონეტის აგდებისას ამოვა 7.|შეუძლებელი',
          'მზე ამოვა დილით.|აუცილებელი',
          'ყუთში მხოლოდ მწვანე ბურთებია და ამოვიღებთ წითელს.|შეუძლებელი',
          'ყუთში მხოლოდ მწვანე ბურთებია და ამოვიღებთ მწვანეს.|აუცილებელი',
          'კვირას მოჰყვება ორშაბათი.|აუცილებელი',
          'კვირას მოჰყვება სამშაბათი.|შეუძლებელი',
          'ექვსწახნაგა კამათლის გაგორებისას ამოვა ლუწი რიცხვი.|შესაძლებელი',
          'ექვსწახნაგა კამათლის გაგორებისას ამოვა 0.|შეუძლებელი',
        ],
      },
      event: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      kind: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
    },
    answer: (v) => String(v.kind),
    format: { kind: 'text' },
    options: () => ['აუცილებელი', 'შესაძლებელი', 'შეუძლებელი'],
    optionCount: 3,
    explain: ({ vars, answer }) => `${vars.event} ამიტომ მოვლენა ${answer}-ია.`,
  }),
  bank({
    id: 'g5-u17-q28',
    subtopicId: 'u17-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ყუთში მხოლოდ {colour} ბურთებია. რა ალბათობით ამოვიღებთ წითელ ბურთს?',
    variables: {
      spec: { kind: 'choice', values: ['მწვანე', 'ლურჯი', 'ყვითელი', 'შავი', 'თეთრი', 'ნარინჯისფერი'] },
      colour: { kind: 'choice', values: (v) => [String(v.spec)] },
    },
    answer: () => '0',
    format: { kind: 'text' },
    options: () => ['0', '1', '1/2', 'შეუძლებელია განსაზღვრა'],
    optionCount: 4,
    explain: ({ vars }) =>
      `ყუთში მხოლოდ ${vars.colour} ბურთებია, წითელი საერთოდ არ არის — ამიტომ ამ მოვლენის ალბათობა 0-ია (შეუძლებელი მოვლენა).`,
  }),
  bank({
    id: 'g5-u17-q29',
    subtopicId: 'u17-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩანთაში არის {r} წითელი და {b} ლურჯი ბურთი. {colour} ბურთის ამოღება უფრო მოსალოდნელია თუ {other}?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['9|1|წითელი|ლურჯი', '8|2|წითელი|ლურჯი', '2|9|ლურჯი|წითელი', '7|3|წითელი|ლურჯი', '1|8|ლურჯი|წითელი'],
      },
      r: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      colour: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      other: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]!] },
    },
    answer: (v) => String(v.colour),
    format: { kind: 'text' },
    options: (v) => [String(v.colour), String(v.other)],
    optionCount: 2,
    explain: ({ vars, answer }) =>
      `წითელი ${vars.r}, ლურჯი ${vars.b} — მეტია ${answer}, ამიტომ ${answer} ბურთის ამოღება უფრო მოსალოდნელია.`,
  }),

  // ═════════ U17.8 — ალბათობის გამოთვლა ═════════
  bank({
    id: 'g5-u17-q30',
    subtopicId: 'u17-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ყუთში არის {favourable} {colour} და {other} {otherColour} ბურთი. რა არის {colour} ბურთის ამოღების ალბათობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['3|7|წითელი|ლურჯი', '4|6|მწვანე|ყვითელი', '5|5|წითელი|ლურჯი', '2|8|თეთრი|შავი',
          '6|4|ყვითელი|მწვანე', '7|3|წითელი|ლურჯი', '1|9|ლურჯი|წითელი', '4|5|წითელი|მწვანე',
          '8|2|მწვანე|ყვითელი', '3|6|ლურჯი|წითელი', '5|15|წითელი|ლურჯი'],
      },
      favourable: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      other: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      colour: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]!] },
      otherColour: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]!] },
    },
    answer: (v) => probabilityText(Number(v.favourable), Number(v.favourable) + Number(v.other)),
    format: { kind: 'text' },
    options: (v) => {
      const [fav, other] = [Number(v.favourable), Number(v.other)];
      const total = fav + other;
      return fourOptions(probabilityText(fav, total), [
        probabilityText(other, total),
        probabilityText(fav, other),
        probabilityText(1, total),
      ]);
    },
    explain: ({ vars, answer }) =>
      `სულ ${Number(vars.favourable) + Number(vars.other)} ბურთია, საიდანაც ${vars.favourable} ${vars.colour}-ია: ${vars.favourable}/${Number(vars.favourable) + Number(vars.other)} = ${answer}.`,
  }),
  bank({
    id: 'g5-u17-q31',
    subtopicId: 'u17-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩვეულებრივ ექვსწახნაგა კამათელს აგორებენ. რა არის {target} ამოსვლის ალბათობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['ლუწი რიცხვის|3', '5-ზე დიდი რიცხვის|1', 'კენტი რიცხვის|3', '6-ის|1',
          '3-ზე ნაკლები რიცხვის|2', '4-ის|1', '2-ზე მეტი რიცხვის|4', '5-ის ან 3-ის|2'],
      },
      target: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      favourable: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => probabilityText(Number(v.favourable), 6),
    format: { kind: 'text' },
    options: (v) => fourOptions(probabilityText(Number(v.favourable), 6), [
      probabilityText(6 - Number(v.favourable), 6),
      probabilityText(1, 6),
      probabilityText(Number(v.favourable), 12),
    ]),
    explain: ({ vars, answer }) =>
      `ექვსწახნაგა კამათელს 6 შესაძლო შედეგი აქვს, საიდანაც ${vars.favourable} ხელსაყრელია „${vars.target}“: ${answer}.`,
  }),
  bank({
    id: 'g5-u17-q32',
    subtopicId: 'u17-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ბარათებზე წერია რიცხვები 1-დან 10-ის ჩათვლით. შემთხვევით იღებენ ერთ ბარათს. რა არის {multiple}-ის ჯერადი რიცხვის ამოღების ალბათობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['3|3', '2|5', '5|2', '4|2', '6|1', '7|1', '8|1', '9|1'],
      },
      multiple: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      favourable: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => probabilityText(Number(v.favourable), 10),
    format: { kind: 'text' },
    options: (v) => fourOptions(probabilityText(Number(v.favourable), 10), [
      probabilityText(Number(v.favourable), 9),
      probabilityText(10 - Number(v.favourable), 10),
      probabilityText(1, 10),
    ]),
    explain: ({ vars, answer }) =>
      `1-დან 10-მდე ${vars.multiple}-ის ჯერადი ${vars.favourable} რიცხვია, ამიტომ ალბათობა ${answer}-ია.`,
  }),
  bank({
    id: 'g5-u17-q33',
    subtopicId: 'u17-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ჩანთაში არის {a} წითელი, {b} ლურჯი და {c} მწვანე ბურთი. რა არის {colour} ბურთის ამოღების ალბათობა?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['5|3|2|ლურჯი', '4|2|4|წითელი', '3|5|2|მწვანე', '6|2|2|ლურჯი', '2|3|5|წითელი', '1|4|5|მწვანე'],
      },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      colour: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]!] },
      favourable: {
        kind: 'choice',
        values: (v) => {
          const [a, b, c] = [at(v.spec, 0), at(v.spec, 1), at(v.spec, 2)];
          const colour = String(v.spec).split('|')[3];
          return [colour === 'წითელი' ? a : colour === 'ლურჯი' ? b : c];
        },
      },
      total: {
        kind: 'choice',
        values: (v) => {
          const [a, b, c] = [at(v.spec, 0), at(v.spec, 1), at(v.spec, 2)];
          return [a + b + c];
        },
      },
    },
    answer: (v) => probabilityText(Number(v.favourable), Number(v.total)),
    format: { kind: 'text' },
    options: (v) => fourOptions(probabilityText(Number(v.favourable), Number(v.total)), [
      probabilityText(Number(v.favourable), Number(v.total) - 1 >= 1 ? Number(v.total) - 1 : Number(v.total) + 1),
      probabilityText(Number(v.total), Number(v.favourable)),
      probabilityText(1, Number(v.total)),
    ]),
    explain: ({ vars, answer }) =>
      `სულ ${vars.total} ბურთია, საიდანაც ${vars.favourable} ${vars.colour}-ია, ამიტომ ალბათობა ${answer}-ია.`,
  }),
];

/**
 * Exactly four distinct options, the answer first, padded with near misses.
 *
 * Two probability answers can share a spelling (`1/2` for two different boxes),
 * and an option list short of three wrong answers makes the generator reject the
 * draw. Filling from `right ± d` keeps every draw usable without ever inventing
 * an option that is actually correct.
 */
function numericOptions(
  right: string | number,
  extras: Array<string | number | number[]>,
  fmt: (n: number) => string = String,
): string[] {
  const out: string[] = [String(right)];
  const add = (candidate: string | number) => {
    const text = String(candidate);
    if (out.length < 4 && !out.includes(text) && !text.startsWith('-')) out.push(text);
  };
  for (const extra of extras) {
    if (Array.isArray(extra)) for (const item of extra) add(item);
    else add(extra);
  }
  const base = Number(String(right).replace(',', '.'));
  if (Number.isFinite(base)) {
    for (let d = 1; d <= 60 && out.length < 4; d += 1) {
      add(fmt(base + d));
      if (base - d > 0) add(fmt(base - d));
    }
  }
  return out;
}
