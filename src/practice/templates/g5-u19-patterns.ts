import type { QuestionTemplate } from './types';
import { bank, fourOptions, rowNumbers } from './g5-helpers';

/**
 * Grade V — Unit 19: კანონზომიერებები და ლოგიკა (patterns and logic).
 *
 * Converted from the academy's `U19` bank (12 subtopics × 6 questions).
 *
 * ## The one idea this unit must not break
 *
 * **A pattern is a rule, not a list.** Every sequence, grid move and age puzzle
 * below is generated from an explicit rule — a step, a direction, a difference —
 * and the rule is what the explanation states. A template that printed a list
 * and a key written separately could disagree with itself; here the printed
 * terms and the answer are the same two numbers.
 *
 * Three consequences:
 *
 *  - **A sequence never leaves the integers.** „÷2“ is offered only from starts
 *    that are large enough to stay whole, because a Grade-V bank that ends at
 *    2,5 has taught division, not pattern-spotting.
 *  - **A moved point keeps its arithmetic.** Grid letters and numbers are
 *    shifted as numbers and spelled back, so „E-ს 2 ასო მარცხნივ“ is C, never
 *    a letter someone counted on their fingers.
 *  - **A trick is stated as a rule.** Where the bank's point is that a
 *    difference does not change (two people's ages), the explanation says the
 *    difference is constant — it does not merely report this year's numbers.
 */

export const G5_U19_SUBTOPICS = [
  'u19-01',
  'u19-02',
  'u19-03',
  'u19-04',
  'u19-05',
  'u19-06',
  'u19-07',
  'u19-08',
  'u19-09',
  'u19-10',
  'u19-11',
  'u19-12',
] as const;

export type G5U19SubtopicId = (typeof G5_U19_SUBTOPICS)[number];

const TOPIC = 'g5-patterns-logic';

const at = (row: unknown, index: number): number => rowNumbers(row)[index]!;

const words = (row: unknown, index: number): string => String(row).split('|')[index]!;

/** `3, 6, 12` — a list of terms as the prompt prints them. */
const list = (terms: number[]): string => terms.join(', ');

/** The first `count` terms of a `+step` / `−step` / `×step` / `÷step` sequence. */
const terms = (start: number, step: number, op: '+' | '-' | '×' | '÷', count: number): number[] => {
  const out = [start];
  for (let i = 1; i < count; i += 1) {
    const previous = out[i - 1]!;
    const next =
      op === '+' ? previous + step : op === '-' ? previous - step : op === '×' ? previous * step : previous / step;
    out.push(next);
  }
  return out;
};

/** `A1` → `{ letter: 0, digit: 0 }`, zero-based. */
const cellAt = (label: string): { letter: number; digit: number } => {
  const match = /^([A-F])([1-6])$/.exec(label.trim())!;
  return { letter: match[1]!.charCodeAt(0) - 65, digit: Number(match[2]) - 1 };
};

/** `{ letter, digit }` → `A1`, clamped inside the board. */
const cellText = (cell: { letter: number; digit: number }): string => {
  const letter = Math.min(5, Math.max(0, cell.letter));
  const digit = Math.min(5, Math.max(0, cell.digit));
  return `${String.fromCharCode(65 + letter)}${digit + 1}`;
};

export const G5_U19_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U19.1 — რომელი არ ერგება ნიმუშს ═════════
  bank({
    id: 'g5-u19-q01',
    subtopicId: 'u19-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ოთხი რიცხვიდან სამი ერთ წესს ექვემდებარება, ერთი — არა: {numbers}. რომელი არ ერგება?',
    variables: {
      spec: {
        kind: 'choice',
        values: [
          '3|6|9|10|3-ის ჯერადი',
          '4|8|12|18|4-ის ჯერადი',
          '5|10|15|22|5-ის ჯერადი',
          '2|4|8|9|ლუწი',
          '7|14|21|25|7-ის ჯერადი',
          '6|12|18|32|6-ის ჯერადი',
          '11|22|33|40|11-ის ჯერადი',
          '9|18|27|35|9-ის ჯერადი',
          '10|20|30|45|10-ის ჯერადი',
          '8|16|24|36|8-ის ჯერადი',
        ],
      },
      numbers: {
        kind: 'choice',
        values: (v) => {
          const row = String(v.spec).split('|');
          return [`${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}`];
        },
      },
      odd: {
        kind: 'choice',
        values: (v) => {
          const row = String(v.spec).split('|');
          const step = Number(row[0]);
          const values = [Number(row[0]), Number(row[1]), Number(row[2]), Number(row[3])];
          return [String(values.find((n) => n % step !== 0) ?? values[3])];
        },
      },
      rule: { kind: 'choice', values: (v) => [words(v.spec, 4)] },
    },
    answer: (v) => String(v.odd),
    format: { kind: 'text' },
    options: (v) => {
      const row = String(v.spec).split('|');
      return [row[0]!, row[1]!, row[2]!, row[3]!].map(String);
    },
    explain: ({ vars, answer }) =>
      `სამი რიცხვი ${vars.rule} არის, ხოლო ${answer} — არა. ამიტომ ნიმუშს ${answer} არ ერგება.`,
  }),
  bank({
    id: 'g5-u19-q02',
    subtopicId: 'u19-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ოთხი რიცხვიდან სამი კენტია, ერთი — ლუწი: {numbers}. რომელი არ ერგება?',
    variables: {
      spec: { kind: 'choice', values: ['3|5|7|8', '9|11|13|16', '1|15|17|20', '21|23|25|28', '5|7|9|12', '11|13|19|22', '31|33|35|40', '7|9|17|24'] },
      numbers: {
        kind: 'choice',
        values: (v) => [String(v.spec).split('|').slice(0, 4).join(', ')],
      },
      even: {
        kind: 'choice',
        values: (v) => {
          const row = String(v.spec).split('|').map(Number);
          return [String(row.find((n) => n % 2 === 0))];
        },
      },
    },
    answer: (v) => String(v.even),
    format: { kind: 'text' },
    options: (v) => String(v.spec).split('|').slice(0, 4).map(String),
    explain: ({ answer }) => `სამი რიცხვი კენტია, ხოლო ${answer} ლუწია — ამიტომ ის არ ერგება ნიმუშს.`,
  }),
  bank({
    id: 'g5-u19-q03',
    subtopicId: 'u19-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მიმდევრობაა: {sequence}. სამი რიცხვი ერთი წესით იზრდება, ერთი — არა. რომელი არ ერგება?',
    variables: {
      spec: { kind: 'choice', values: ['2|5|8|12', '3|7|11|16', '10|20|30|42', '5|9|13|18', '1|4|7|11', '6|12|18|25', '4|8|12|17', '7|14|21|29'] },
      sequence: {
        kind: 'choice',
        values: (v) => [String(v.spec).split('|').slice(0, 4).join(', ')],
      },
      step: {
        kind: 'choice',
        values: (v) => [at(v.spec, 1) - at(v.spec, 0)],
      },
      odd: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]!] },
      firstThree: {
        kind: 'choice',
        values: (v) => [String(v.spec).split('|').slice(0, 3).join(', ')],
      },
    },
    answer: (v) => String(v.odd),
    format: { kind: 'text' },
    options: (v) => String(v.spec).split('|').slice(0, 4).map(String),
    explain: ({ vars, answer }) =>
      `${vars.firstThree} ყოველ ჯერზე ${vars.step}-ით იზრდება; ${answer} კი ამ ნაბიჯს არ ემორჩილება.`,
  }),
  bank({
    id: 'g5-u19-q04',
    subtopicId: 'u19-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ოთხი რიცხვიდან სამი ერთსა და იმავე ციფრს შეიცავს, ერთი — არა: {numbers}. რომელი არ ერგება?',
    variables: {
      spec: {
        kind: 'choice',
        values: ['4|14|24|34|51', '2|12|32|52|63', '5|15|25|45|61', '1|21|31|41|58',
          '6|16|36|56|72', '8|18|28|48|93', '3|13|23|53|71', '7|17|27|47|63'],
      },
      numbers: { kind: 'choice', values: (v) => [String(v.spec).split('|').slice(1, 5).join(', ')] },
      digit: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      odd: {
        kind: 'choice',
        values: (v) => {
          const row = String(v.spec).split('|');
          const digit = row[0]!;
          const values = row.slice(1, 5);
          return [values.find((n) => !n.includes(digit)) ?? values[3]!];
        },
      },
    },
    answer: (v) => String(v.odd),
    format: { kind: 'text' },
    options: (v) => String(v.spec).split('|').slice(1, 5).map(String),
    explain: ({ vars, answer }) =>
      `სამი რიცხვი ციფრ ${vars.digit}-ს შეიცავს, ხოლო ${answer} — არა.`,
  }),
  bank({
    id: 'g5-u19-q05',
    subtopicId: 'u19-01',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ოთხი რიცხვიდან სამი იგივე ნაშთს იძლევა {divisor}-ზე გაყოფისას, ერთი — არა: {numbers}. რომელი არ ერგება?',
    variables: {
      spec: { kind: 'choice', values: ['4|5|9|13|18', '3|7|10|16|23', '5|6|11|16|23', '4|6|10|14|21', '7|8|15|22|30'] },
      divisor: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      numbers: {
        kind: 'choice',
        values: (v) => {
          const row = String(v.spec).split('|').map(Number);
          return [`${row[1]}, ${row[2]}, ${row[3]}, ${row[4]}`];
        },
      },
      odd: {
        kind: 'choice',
        values: (v) => {
          const row = String(v.spec).split('|').map(Number);
          const d = row[0]!;
          const values = [row[1]!, row[2]!, row[3]!, row[4]!];
          const counts = new Map<number, number>();
          for (const n of values) counts.set(n % d, (counts.get(n % d) ?? 0) + 1);
          const common = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
          return [String(values.find((n) => n % d !== common) ?? values[3])];
        },
      },
    },
    answer: (v) => String(v.odd),
    format: { kind: 'text' },
    options: (v) => String(v.spec).split('|').slice(1, 5).map(String),
    explain: ({ vars, answer }) =>
      `${vars.divisor}-ზე გაყოფისას სამი რიცხვი ერთსა და იმავე ნაშთს იძლევა, ხოლო ${answer} — სხვა ნაშთს.`,
  }),

  // ═════════ U19.2 — მიმდევრობები შეკრებითა და გამრავლებით ═════════
  bank({
    id: 'g5-u19-q06',
    subtopicId: 'u19-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გააგრძელე მიმდევრობა: {shown} … ჩაწერე შემდეგი ორი რიცხვი.',
    hint: 'იპოვე, რამდენით იზრდება ყოველი შემდეგი რიცხვი.',
    variables: {
      spec: { kind: 'choice', values: ['7|5', '12|5', '9|4', '15|6', '20|7', '11|8', '6|9', '25|4', '13|6', '18|5'] },
      start: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      step: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      shown: { kind: 'choice', values: (v) => [list(terms(at(v.spec, 0), at(v.spec, 1), '+', 4))] },
      nextTwo: {
        kind: 'choice',
        values: (v) => {
          const seq = terms(at(v.spec, 0), at(v.spec, 1), '+', 6);
          return [`${seq[4]} და ${seq[5]}`];
        },
      },
    },
    answer: (v) => String(v.nextTwo),
    format: { kind: 'text' },
    options: (v) => {
      const seq = terms(Number(v.start), Number(v.step), '+', 6);
      return fourOptions(String(v.nextTwo), [
        `${seq[4]! + 1} და ${seq[5]! + 1}`,
        `${seq[4]! - 1} და ${seq[5]! - 1}`,
        `${seq[3]} და ${seq[4]}`,
      ]);
    },
    explain: ({ vars, answer }) =>
      `ყოველი რიცხვი ${vars.step}-ით იზრდება, ამიტომ შემდეგი ორია ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q07',
    subtopicId: 'u19-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გააგრძელე მიმდევრობა: {shown} … ჩაწერე შემდეგი ორი რიცხვი.',
    hint: 'შეადარე მეზობელი რიცხვები: ერთი და იგივე რიცხვზე მრავლდება?',
    variables: {
      spec: { kind: 'choice', values: ['3|2', '2|3', '5|2', '4|3', '1|4', '6|2', '2|4', '3|3', '7|2', '5|3'] },
      start: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      step: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      shown: { kind: 'choice', values: (v) => [list(terms(at(v.spec, 0), at(v.spec, 1), '×', 4))] },
      nextTwo: {
        kind: 'choice',
        values: (v) => {
          const seq = terms(at(v.spec, 0), at(v.spec, 1), '×', 6);
          return [`${seq[4]} და ${seq[5]}`];
        },
      },
    },
    answer: (v) => String(v.nextTwo),
    format: { kind: 'text' },
    options: (v) => {
      const seq = terms(Number(v.start), Number(v.step), '×', 6);
      return fourOptions(String(v.nextTwo), [
        `${seq[4]! + Number(v.step)} და ${seq[5]! + Number(v.step)}`,
        `${seq[4]! - 1} და ${seq[5]! - 1}`,
        `${seq[3]} და ${seq[4]}`,
      ]);
    },
    explain: ({ vars, answer }) =>
      `ყოველი რიცხვი ${vars.step}-ზე მრავლდება, ამიტომ შემდეგი ორია ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q08',
    subtopicId: 'u19-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მიმდევრობა კლებადია: {shown} … ჩაწერე შემდეგი ორი რიცხვი.',
    variables: {
      spec: { kind: 'choice', values: ['100|10', '80|10', '95|5', '64|8', '120|8', '150|10', '90|15', '200|10'] },
      start: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      step: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      shown: { kind: 'choice', values: (v) => [list(terms(at(v.spec, 0), at(v.spec, 1), '-', 4))] },
      nextTwo: {
        kind: 'choice',
        values: (v) => {
          const seq = terms(at(v.spec, 0), at(v.spec, 1), '-', 6);
          return [`${seq[4]} და ${seq[5]}`];
        },
      },
    },
    answer: (v) => String(v.nextTwo),
    format: { kind: 'text' },
    options: (v) => {
      const seq = terms(Number(v.start), Number(v.step), '-', 6);
      return fourOptions(String(v.nextTwo), [
        `${seq[4]! + 5} და ${seq[5]! + 5}`,
        `${seq[4]! - 1} და ${seq[5]! - 1}`,
        `${seq[3]} და ${seq[4]}`,
      ]);
    },
    explain: ({ vars, answer }) => `ყოველი რიცხვი ${vars.step}-ით მცირდება, ამიტომ შემდეგი ორია ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q09',
    subtopicId: 'u19-02',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'მიმდევრობა ნახევარდება: {shown} … ჩაწერე შემდეგი ორი რიცხვი.',
    hint: 'ყოველი შემდეგი რიცხვი წინაზე ორჯერ ნაკლებია.',
    variables: {
      spec: { kind: 'choice', values: ['160|2', '128|2', '96|2', '320|2', '64|2', '256|2', '192|2', '224|2'] },
      start: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      step: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      shown: { kind: 'choice', values: (v) => [list(terms(at(v.spec, 0), at(v.spec, 1), '÷', 4))] },
      nextTwo: {
        kind: 'choice',
        values: (v) => {
          const seq = terms(at(v.spec, 0), at(v.spec, 1), '÷', 6);
          return [`${seq[4]} და ${seq[5]}`];
        },
      },
    },
    answer: (v) => String(v.nextTwo),
    format: { kind: 'text' },
    options: (v) => {
      const seq = terms(Number(v.start), Number(v.step), '÷', 6);
      return fourOptions(String(v.nextTwo), [
        `${seq[4]! + 1} და ${seq[5]! + 1}`,
        `${seq[4]! + 2} და ${seq[5]! + 1}`,
        `${seq[3]} და ${seq[4]}`,
      ]);
    },
    explain: ({ answer }) => `ყოველი რიცხვი ორზე იყოფა, ამიტომ შემდეგი ორია ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q10',
    subtopicId: 'u19-02',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'მიმდევრობა მონაცვლეობით იცვლება: {shown} … ჩაწერე შემდეგი ორი რიცხვი.',
    hint: 'ჯერ +{add}, შემდეგ ×{times}, ისევ +{add} და ასე შემდეგ.',
    variables: {
      spec: { kind: 'choice', values: ['2|3|2', '1|2|3', '3|4|2', '2|5|2', '4|3|3', '1|3|2', '2|4|3', '5|2|2'] },
      add: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      times: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      shown: {
        kind: 'choice',
        values: (v) => {
          const [start, add, times] = [at(v.spec, 0), at(v.spec, 1), at(v.spec, 2)];
          const a = start;
          const b = a + add;
          const c = b * times;
          const d = c + add;
          return [list([a, b, c, d])];
        },
      },
      nextTwo: {
        kind: 'choice',
        values: (v) => {
          const [start, add, times] = [at(v.spec, 0), at(v.spec, 1), at(v.spec, 2)];
          const a = start;
          const b = a + add;
          const c = b * times;
          const d = c + add;
          const e = d * times;
          const f = e + add;
          return [`${e} და ${f}`];
        },
      },
    },
    answer: (v) => String(v.nextTwo),
    format: { kind: 'text' },
    options: (v) => {
      const [start, add, times] = [at(v.spec, 0), at(v.spec, 1), at(v.spec, 2)];
      const a = start;
      const b = a + add;
      const c = b * times;
      const d = c + add;
      const e = d * times;
      const f = e + add;
      return fourOptions(String(v.nextTwo), [
        `${e + add} და ${f + add}`,
        `${e * times} და ${f * times}`,
        `${d} და ${e}`,
      ]);
    },
    explain: ({ vars, answer }) =>
      `წესია: +${vars.add}, შემდეგ ×${vars.times}, და ისევ თავიდან. ამიტომ შემდეგი ორია ${answer}.`,
  }),

  // ═════════ U19.3 — მნიშვნელობების პოვნა ═════════
  bank({
    id: 'g5-u19-q11',
    subtopicId: 'u19-03',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'რიცხვს დაემატა {add} და მიიღეს {result}. რა რიცხვი იყო თავდაპირველად?',
    variables: {
      spec: { kind: 'choice', values: ['18|35', '24|56', '37|70', '15|48', '42|85', '29|64', '53|91', '11|40', '36|72', '27|58'] },
      add: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      result: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.result) - Number(v.add),
    format: { kind: 'integer', min: 0 },
    options: (v) => {
      const right = Number(v.result) - Number(v.add);
      return fourOptions(String(right), [String(Number(v.result) + Number(v.add)), String(right + 5), String(right - 3)]);
    },
    explain: ({ vars, answer }) =>
      `საპირისპირო მოქმედება გამოკლებაა: ${vars.result} − ${vars.add} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q12',
    subtopicId: 'u19-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რიცხვი გამრავლდა {times}-ზე და მიიღეს {result}. რა რიცხვი იყო თავდაპირველად?',
    variables: {
      spec: { kind: 'choice', values: ['4|28', '6|54', '7|63', '5|45', '8|72', '9|81', '3|39', '12|96', '5|85', '7|91'] },
      times: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      result: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.result) / Number(v.times),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.result) / Number(v.times);
      return fourOptions(String(right), [String(Number(v.result) - Number(v.times)), String(right + 2), String(right - 1)]);
    },
    explain: ({ vars, answer }) =>
      `საპირისპირო მოქმედება გაყოფაა: ${vars.result} ÷ ${vars.times} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q13',
    subtopicId: 'u19-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რიცხვს გამოაკლეს {sub} და მიიღეს {result}. რა რიცხვი იყო თავდაპირველად?',
    variables: {
      spec: { kind: 'choice', values: ['23|45', '38|62', '17|54', '46|80', '29|73', '55|91', '14|60', '31|48'] },
      sub: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      result: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.sub) + Number(v.result),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.sub) + Number(v.result);
      return fourOptions(String(right), [String(Number(v.result) - Number(v.sub)), String(right + 4), String(right - 6)]);
    },
    explain: ({ vars, answer }) =>
      `საპირისპირო მოქმედება შეკრებაა: ${vars.sub} + ${vars.result} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q14',
    subtopicId: 'u19-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'რიცხვი გაიყო {divisor}-ზე და მიიღეს {result}. რა რიცხვი იყო თავდაპირველად?',
    variables: {
      spec: { kind: 'choice', values: ['4|12', '5|14', '6|11', '7|13', '8|12', '9|15', '3|24', '4|31'] },
      divisor: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      result: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.divisor) * Number(v.result),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.divisor) * Number(v.result);
      return fourOptions(String(right), [String(Number(v.divisor) + Number(v.result)), String(right + Number(v.divisor)), String(right - Number(v.divisor))]);
    },
    explain: ({ vars, answer }) =>
      `საპირისპირო მოქმედება გამრავლებაა: ${vars.divisor} × ${vars.result} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q15',
    subtopicId: 'u19-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'რიცხვს დაემატა {add}, შემდეგ შედეგი გამრავლდა {times}-ზე და მიიღეს {result}. რა რიცხვი იყო თავდაპირველად?',
    hint: 'უკან იარე საპირისპირო რიგით: ჯერ გაყავი, შემდეგ გამოაკელი.',
    variables: {
      spec: { kind: 'choice', values: ['5|3|36', '4|6|54', '7|2|30', '6|5|55', '3|8|56', '9|4|52', '2|7|49', '8|3|39'] },
      add: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      times: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      result: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      start: {
        kind: 'choice',
        values: (v) => [at(v.spec, 2) / at(v.spec, 1) - at(v.spec, 0)],
      },
    },
    answer: (v) => String(v.start),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const start = Number(v.start);
      return fourOptions(String(start), [String(start + Number(v.add)), String(Number(v.result) - Number(v.add)), String(start + 2)]);
    },
    explain: ({ vars, answer }) =>
      `უკან: ${vars.result} ÷ ${vars.times} = ${Number(vars.result) / Number(vars.times)}, შემდეგ − ${vars.add} = ${answer}.`,
  }),

  // ═════════ U19.4 — შედარების ამოცანები ═════════
  bank({
    id: 'g5-u19-q16',
    subtopicId: 'u19-04',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'პირველ ყუთში {countA} ბურთია, მეორეში — {times}-ჯერ მეტი. რამდენი ბურთია მეორე ყუთში?',
    variables: {
      spec: { kind: 'choice', values: ['6|4', '7|5', '8|6', '5|7', '9|3', '4|8', '12|4', '6|9', '11|5', '7|8'] },
      countA: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      times: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.countA) * Number(v.times),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.countA) * Number(v.times);
      return fourOptions(String(right), [String(Number(v.countA) + Number(v.times)), String(right + Number(v.countA)), String(right - Number(v.countA))]);
    },
    explain: ({ vars, answer }) =>
      `${vars.countA} × ${vars.times} = ${answer} ბურთი მეორე ყუთში.`,
  }),
  bank({
    id: 'g5-u19-q17',
    subtopicId: 'u19-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მეორე ყუთში {countB} ბურთია, რაც {times}-ჯერ მეტია პირველზე. რამდენი ბურთია პირველ ყუთში?',
    variables: {
      spec: { kind: 'choice', values: ['24|4', '35|5', '42|6', '48|8', '36|9', '54|6', '63|7', '72|8'] },
      countB: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      times: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.countB) / Number(v.times),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.countB) / Number(v.times);
      return fourOptions(String(right), [String(Number(v.countB) - Number(v.times)), String(right + 2), String(right - 2)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.countB} ÷ ${vars.times} = ${answer} ბურთი პირველ ყუთში.`,
  }),
  bank({
    id: 'g5-u19-q18',
    subtopicId: 'u19-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'პირველ ყუთში {countA} ბურთია, მეორეში — {more}-ით მეტი. რამდენი ბურთია ორივე ყუთში ერთად?',
    variables: {
      spec: { kind: 'choice', values: ['12|7', '15|9', '18|6', '11|8', '20|5', '14|12', '9|13', '16|7', '13|9', '10|15'] },
      countA: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      more: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      total: {
        kind: 'choice',
        values: (v) => [at(v.spec, 0) + at(v.spec, 0) + at(v.spec, 1)],
      },
    },
    answer: (v) => String(v.total),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const total = Number(v.total);
      return fourOptions(String(total), [String(Number(v.countA) + Number(v.more)), String(total + 3), String(total - 4)]);
    },
    explain: ({ vars, answer }) =>
      `მეორე ყუთი: ${vars.countA} + ${vars.more} = ${Number(vars.countA) + Number(vars.more)}; სულ ${vars.countA} + ${Number(vars.countA) + Number(vars.more)} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q19',
    subtopicId: 'u19-04',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'სამ ყუთში სულ {total} ბურთია. პირველში {first} ბურთია, მეორეში — {more}-ით მეტი. რამდენია მესამეში?',
    variables: {
      spec: { kind: 'choice', values: ['40|11|6', '55|15|9', '62|18|7', '48|13|10', '70|20|12', '36|9|8', '81|24|11', '57|16|5'] },
      total: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      first: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      more: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      third: {
        kind: 'choice',
        values: (v) => [at(v.spec, 0) - at(v.spec, 1) - (at(v.spec, 1) + at(v.spec, 2))],
      },
    },
    answer: (v) => String(v.third),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const third = Number(v.third);
      return fourOptions(String(third), [String(Number(v.first) + Number(v.more)), String(third + 4), String(third - 5)]);
    },
    explain: ({ vars, answer }) =>
      `მეორეში ${vars.first} + ${vars.more} = ${Number(vars.first) + Number(vars.more)}; მესამეში ${vars.total} − ${Number(vars.first) + Number(vars.more) + Number(vars.first)} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q20',
    subtopicId: 'u19-04',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ორი რიცხვის ჯამი {sum}-ია, სხვაობა — {diff}. რა არის უფრო დიდი რიცხვი?',
    hint: 'დიდი რიცხვი = (ჯამი + სხვაობა) ÷ 2.',
    variables: {
      spec: { kind: 'choice', values: ['30|6', '44|8', '50|12', '36|10', '64|16', '28|4', '72|18', '40|14', '56|20', '18|2'] },
      sum: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      diff: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      big: { kind: 'choice', values: (v) => [(at(v.spec, 0) + at(v.spec, 1)) / 2] },
      small: { kind: 'choice', values: (v) => [(at(v.spec, 0) - at(v.spec, 1)) / 2] },
    },
    answer: (v) => String(v.big),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const big = Number(v.big);
      return fourOptions(String(big), [String(v.small), String(big + 2), String(Number(v.sum) - Number(v.diff))]);
    },
    explain: ({ vars, answer }) =>
      `დიდი = (${vars.sum} + ${vars.diff}) ÷ 2 = ${answer}; პატარა = (${vars.sum} − ${vars.diff}) ÷ 2 = ${vars.small}.`,
  }),

  // ═════════ U19.5 — ასაკის ამოცანები ═════════
  bank({
    id: 'g5-u19-q21',
    subtopicId: 'u19-05',
    topicId: TOPIC,
    difficulty: 1,
    prompt: '{older} {ageOlder} წლისაა, {younger} — {ageYounger} წლის. რამდენი წლით უფროსია {older}?',
    variables: {
      spec: { kind: 'choice', values: ['12|8', '15|9', '11|6', '14|7', '16|10', '13|5', '18|12', '10|4', '17|9', '15|8'] },
      older: { kind: 'choice', values: () => ['ნიკა'] },
      younger: { kind: 'choice', values: () => ['ანა'] },
      ageOlder: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      ageYounger: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.ageOlder) - Number(v.ageYounger),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.ageOlder) - Number(v.ageYounger);
      return fourOptions(String(right), [String(Number(v.ageOlder) + Number(v.ageYounger)), String(right + 2), String(right - 2)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.ageOlder} − ${vars.ageYounger} = ${answer} წელი, ამიტომ ${vars.older} ${answer} წლით უფროსია.`,
  }),
  bank({
    id: 'g5-u19-q22',
    subtopicId: 'u19-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{older} ახლა {ageOlder} წლისაა, {younger} — {ageYounger} წლის. {years} წლის შემდეგ რამდენი წლით უფროსი იქნება {older}?',
    hint: 'ორივე ორივეზე ერთსა და იმავე რაოდენობას მატულობს — სხვაობა არ იცვლება.',
    variables: {
      spec: { kind: 'choice', values: ['12|8|5', '15|9|3', '11|6|7', '14|7|10', '16|10|4', '13|5|6', '18|12|2', '10|4|9'] },
      older: { kind: 'choice', values: () => ['ნიკა'] },
      younger: { kind: 'choice', values: () => ['ანა'] },
      ageOlder: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      ageYounger: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      years: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      gap: { kind: 'choice', values: (v) => [at(v.spec, 0) - at(v.spec, 1)] },
    },
    answer: (v) => String(v.gap),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const gap = Number(v.gap);
      return fourOptions(String(gap), [String(gap + Number(v.years)), String(gap - 1 > 0 ? gap - 1 : gap + 2), String(Number(v.years))]);
    },
    explain: ({ vars, answer }) =>
      `ახლა სხვაობაა ${vars.ageOlder} − ${vars.ageYounger} = ${answer}. ${vars.years} წლის შემდეგ ორივე ${vars.years} წლით გაიზრდება, ამიტომ სხვაობა ისევ ${answer} წელია.`,
  }),
  bank({
    id: 'g5-u19-q23',
    subtopicId: 'u19-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{child} ახლა {ageChild} წლისაა, დედა — {ageMother} წლის. {years} წლის შემდეგ რამდენი წლის იქნება დედა?',
    variables: {
      spec: { kind: 'choice', values: ['8|32|6', '10|35|4', '7|29|9', '12|38|3', '9|31|7', '6|28|10', '11|36|5'] },
      child: { kind: 'choice', values: () => ['გიორგი'] },
      ageChild: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      ageMother: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      years: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => Number(v.ageMother) + Number(v.years),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.ageMother) + Number(v.years);
      return fourOptions(String(right), [String(Number(v.ageMother)), String(right + 2), String(right - 3)]);
    },
    explain: ({ vars, answer }) => `${vars.ageMother} + ${vars.years} = ${answer} წელი.`,
  }),
  bank({
    id: 'g5-u19-q24',
    subtopicId: 'u19-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'მამა {ageFather} წლისაა, ვაჟი — {ageSon} წლის. რამდენი წლის წინ იყო მამა ვაჟზე ზუსტად {times}-ჯერ უფროსი?',
    hint: 'სხვაობა ყოველთვის {gap} წელია. იპოვე ასაკი, როცა სხვაობა = (times − 1) × ვაჟის ასაკი.',
    variables: {
      spec: { kind: 'choice', values: ['30|16|2', '40|25|2', '26|15|2', '40|20|3', '42|24|3', '40|16|4', '36|18|3', '34|20|2'] },
      ageFather: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      ageSon: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      times: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      gap: { kind: 'choice', values: (v) => [at(v.spec, 0) - at(v.spec, 1)] },
      ago: {
        kind: 'choice',
        values: (v) => {
          const [father, son, times] = [at(v.spec, 0), at(v.spec, 1), at(v.spec, 2)];
          const gap = father - son;
          // The son was gap/(times-1) old then.
          return [son - gap / (times - 1)];
        },
      },
    },
    answer: (v) => String(v.ago),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const ago = Number(v.ago);
      return fourOptions(String(ago), [String(ago + 1), String(ago + 2), String(Math.max(1, ago - 1))]);
    },
    explain: ({ vars, answer }) =>
      `სხვაობა ყოველთვის ${vars.gap} წელია. როცა მამა ${vars.times}-ჯერ უფროსი იყო, ვაჟი ${Number(vars.gap) / (Number(vars.times) - 1)} წლის იყო — ანუ ${answer} წლის წინ.`,
  }),
  bank({
    id: 'g5-u19-q25',
    subtopicId: 'u19-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'დედა {ageMother} წლისაა, ქალიშვილი — {ageDaughter} წლის. რამდენი წლის შემდეგ იქნება დედა ქალიშვილზე ზუსტად {times}-ჯერ უფროსი?',
    variables: {
      spec: { kind: 'choice', values: ['30|8|2', '35|11|3', '60|12|4', '45|15|2', '50|10|3', '33|7|2', '39|9|4'] },
      ageMother: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      ageDaughter: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      times: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      ahead: {
        kind: 'choice',
        values: (v) => {
          const [mother, daughter, times] = [at(v.spec, 0), at(v.spec, 1), at(v.spec, 2)];
          // mother + y = times * (daughter + y)  →  y = (mother - times*daughter)/(times - 1)
          return [(mother - times * daughter) / (times - 1)];
        },
      },
    },
    answer: (v) => String(v.ahead),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const ahead = Number(v.ahead);
      return fourOptions(String(ahead), [String(ahead + 1), String(ahead + 2), String(ahead - 1 > 0 ? ahead - 1 : ahead + 3)]);
    },
    explain: ({ vars, answer }) =>
      `სხვაობა ${Number(vars.ageMother) - Number(vars.ageDaughter)} წელია და ის არ იცვლება. როცა დედა ${vars.times}-ჯერ უფროსი იქნება, ქალიშვილი ${(Number(vars.ageMother) - Number(vars.ageDaughter)) / (Number(vars.times) - 1)} წლის იქნება, ანუ ${answer} წლის შემდეგ.`,
  }),

  // ═════════ U19.6 — პროპორცია ═════════
  bank({
    id: 'g5-u19-q26',
    subtopicId: 'u19-06',
    topicId: TOPIC,
    difficulty: 1,
    prompt: '{count} რვეული {price} ლარი ღირს. რამდენი ღირს {more} რვეული?',
    variables: {
      spec: { kind: 'choice', values: ['3|12|5', '4|20|7', '5|15|8', '2|14|6', '6|30|9', '7|21|4', '3|18|8', '5|25|6'] },
      count: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      price: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      more: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      total: {
        kind: 'choice',
        values: (v) => [(at(v.spec, 1) / at(v.spec, 0)) * at(v.spec, 2)],
      },
    },
    answer: (v) => `${v.total} ლარი`,
    format: { kind: 'text' },
    options: (v) => {
      const total = Number(v.total);
      return fourOptions(`${total} ლარი`, [`${total + 3} ლარი`, `${total - 2} ლარი`, `${Number(v.price)} ლარი`]);
    },
    explain: ({ vars, answer }) =>
      `ერთი რვეული ${Number(vars.price) / Number(vars.count)} ლარია; ${Number(vars.price) / Number(vars.count)} × ${vars.more} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q27',
    subtopicId: 'u19-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{workers} მუშა {days} დღეში {done} მეტრს აშენებს. რამდენ მეტრს ააშენებს იგივე რაოდენობის მუშა {moreDays} დღეში?',
    variables: {
      spec: { kind: 'choice', values: ['2|3|12|5', '3|4|24|6', '4|5|40|8', '2|6|18|9', '5|3|30|7', '3|5|45|4'] },
      workers: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      days: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      done: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      moreDays: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      total: { kind: 'choice', values: (v) => [(at(v.spec, 2) / at(v.spec, 1)) * at(v.spec, 3)] },
    },
    answer: (v) => `${v.total} მეტრი`,
    format: { kind: 'text' },
    options: (v) => {
      const total = Number(v.total);
      return fourOptions(`${total} მეტრი`, [`${total + 6} მეტრი`, `${total - 4} მეტრი`, `${Number(v.done)} მეტრი`]);
    },
    explain: ({ vars, answer }) =>
      `დღეში აშენებს ${Number(vars.done) / Number(vars.days)} მეტრს; × ${vars.moreDays} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q28',
    subtopicId: 'u19-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{count} კგ {fruit} ღირს {price} ლარი. რამდენი კილოგრამი {fruit} შეიძლება იყიდოს {budget} ლარად?',
    variables: {
      spec: { kind: 'choice', values: ['2|10|25', '3|15|35', '4|24|42', '5|20|44', '2|14|49', '3|27|54', '6|36|48'] },
      count: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      fruit: { kind: 'choice', values: () => ['ვაშლი'] },
      price: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      budget: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      kg: { kind: 'choice', values: (v) => [(at(v.spec, 2) / at(v.spec, 1)) * at(v.spec, 0)] },
    },
    answer: (v) => `${v.kg} კგ`,
    format: { kind: 'text' },
    options: (v) => {
      const kg = Number(v.kg);
      return fourOptions(`${kg} კგ`, [`${kg + 1} კგ`, `${kg - 1} კგ`, `${Number(v.count)} კგ`]);
    },
    explain: ({ vars, answer }) =>
      `1 კგ ღირს ${Number(vars.price) / Number(vars.count)} ლარი; ${vars.budget} ÷ ${Number(vars.price) / Number(vars.count)} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q29',
    subtopicId: 'u19-06',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ავტომობილი {hours} საათში {km} კილომეტრს გადის. რამდენ კილომეტრს გაივლის იგივე სისწრაფით {moreHours} საათში?',
    variables: {
      spec: { kind: 'choice', values: ['2|120|5', '3|210|7', '4|280|9', '2|150|6', '5|300|8', '3|180|4'] },
      hours: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      km: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      moreHours: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      total: { kind: 'choice', values: (v) => [(at(v.spec, 1) / at(v.spec, 0)) * at(v.spec, 2)] },
    },
    answer: (v) => `${v.total} კმ`,
    format: { kind: 'text' },
    options: (v) => {
      const total = Number(v.total);
      return fourOptions(`${total} კმ`, [`${total + 60} კმ`, `${total - 30} კმ`, `${Number(v.km)} კმ`]);
    },
    explain: ({ vars, answer }) =>
      `სისწრაფე ${Number(vars.km) / Number(vars.hours)} კმ/სთ; × ${vars.moreHours} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q30',
    subtopicId: 'u19-06',
    topicId: TOPIC,
    difficulty: 3,
    prompt: '{workers} მუშა სამუშაოს {days} დღეში ასრულებს. რამდენ დღეში შეასრულებს იგივე სამუშაოს {moreWorkers} მუშა, თუ ყველა ერთნაირად მუშაობს?',
    hint: 'მეტი მუშა — ნაკლები დღე: ეს უკუპროპორციაა.',
    variables: {
      spec: { kind: 'choice', values: ['3|12|6', '4|15|5', '2|18|3', '6|8|4', '5|12|3', '8|9|6', '4|21|7'] },
      workers: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      days: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      moreWorkers: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      needed: { kind: 'choice', values: (v) => [(at(v.spec, 0) * at(v.spec, 1)) / at(v.spec, 2)] },
    },
    answer: (v) => `${v.needed} დღე`,
    format: { kind: 'text' },
    options: (v) => {
      const needed = Number(v.needed);
      return fourOptions(`${needed} დღე`, [`${needed + 2} დღე`, `${needed - 1} დღე`, `${Number(v.days)} დღე`]);
    },
    explain: ({ vars, answer }) =>
      `სულ შრომა ${vars.workers} × ${vars.days} = ${Number(vars.workers) * Number(vars.days)} „მუშა-დღეა“; ÷ ${vars.moreWorkers} = ${answer}.`,
  }),

  // ═════════ U19.7 — ფიგურების შედგენა ═════════
  bank({
    id: 'g5-u19-q31',
    subtopicId: 'u19-07',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'მართკუთხედის გვერდებია {a} სმ და {b} სმ. რამდენია მისი პერიმეტრი?',
    variables: {
      spec: { kind: 'choice', values: ['3|5', '4|7', '6|2', '8|3', '5|9', '10|4', '7|6', '12|5'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => `${2 * (Number(v.a) + Number(v.b))} სმ`,
    format: { kind: 'text' },
    options: (v) => {
      const right = 2 * (Number(v.a) + Number(v.b));
      return fourOptions(`${right} სმ`, [`${Number(v.a) + Number(v.b)} სმ`, `${right + 2} სმ`, `${Number(v.a) * Number(v.b)} სმ`]);
    },
    explain: ({ vars, answer }) =>
      `პერიმეტრი = (${vars.a} + ${vars.b}) × 2 = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q32',
    subtopicId: 'u19-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მართკუთხედის პერიმეტრი {p} სმ-ია, ერთი გვერდი — {a} სმ. რამდენია მეორე გვერდი?',
    variables: {
      spec: { kind: 'choice', values: ['16|3', '22|7', '30|9', '18|4', '26|5', '40|12', '20|6', '34|11'] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 0) / 2 - at(v.spec, 1)] },
    },
    answer: (v) => `${v.b} სმ`,
    format: { kind: 'text' },
    options: (v) => {
      const b = Number(v.b);
      return fourOptions(`${b} სმ`, [`${b + 1} სმ`, `${Number(v.p) - Number(v.a)} სმ`, `${b - 1} სმ`]);
    },
    explain: ({ vars, answer }) =>
      `ნახევარი პერიმეტრი ${Number(vars.p) / 2} სმ-ია; ${Number(vars.p) / 2} − ${vars.a} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q33',
    subtopicId: 'u19-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'კვადრატის გვერდი {a} სმ-ია. რამდენია მისი ფართობი?',
    variables: {
      side: { kind: 'choice', values: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      a: { kind: 'choice', values: (v) => [Number(v.side)] },
    },
    answer: (v) => `${Number(v.a) * Number(v.a)} სმ²`,
    format: { kind: 'text' },
    options: (v) => {
      const area = Number(v.a) * Number(v.a);
      return fourOptions(`${area} სმ²`, [`${Number(v.a) * 4} სმ²`, `${area + Number(v.a)} სმ²`, `${area - Number(v.a)} სმ²`]);
    },
    explain: ({ vars, answer }) => `ფართობი = ${vars.a} × ${vars.a} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q34',
    subtopicId: 'u19-07',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'მართკუთხედი დაყოფილია ორ ნაწილად: {a} სმ × {b} სმ და {c} სმ × {d} სმ. რამდენია მთელი ფიგურის ფართობი?',
    variables: {
      spec: { kind: 'choice', values: ['5|3|4|3', '6|2|5|4', '8|3|2|7', '4|5|6|2', '9|2|3|4', '7|4|2|5'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      first: { kind: 'choice', values: (v) => [at(v.spec, 0) * at(v.spec, 1)] },
      second: { kind: 'choice', values: (v) => [at(v.spec, 2) * at(v.spec, 3)] },
    },
    answer: (v) => `${Number(v.first) + Number(v.second)} სმ²`,
    format: { kind: 'text' },
    options: (v) => {
      const total = Number(v.first) + Number(v.second);
      return fourOptions(`${total} სმ²`, [`${Number(v.first)} სმ²`, `${Number(v.second)} სმ²`, `${Number(v.first) + Number(v.second) + 2} სმ²`]);
    },
    explain: ({ vars, answer }) =>
      `პირველი ნაწილი ${vars.a} × ${vars.b} = ${vars.first}; მეორე ${vars.c} × ${vars.d} = ${vars.second}; სულ ${vars.first} + ${vars.second} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q35',
    subtopicId: 'u19-07',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'მართკუთხედს ჩამოაჭრეს კუთხე: მისი ზომებია {w} სმ და {h} სმ, ხოლო ჩამოჭრილი კვადრატის გვერდი — {cut} სმ. რამდენია დარჩენილი ფიგურის ფართობი?',
    variables: {
      spec: { kind: 'choice', values: ['6|4|2', '8|5|3', '10|6|4', '7|5|2', '9|8|3', '12|7|5'] },
      w: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      h: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      cut: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      whole: { kind: 'choice', values: (v) => [at(v.spec, 0) * at(v.spec, 1)] },
      removed: { kind: 'choice', values: (v) => [at(v.spec, 2) * at(v.spec, 2)] },
    },
    answer: (v) => `${Number(v.whole) - Number(v.removed)} სმ²`,
    format: { kind: 'text' },
    options: (v) => {
      const left = Number(v.whole) - Number(v.removed);
      return fourOptions(`${left} სმ²`, [`${Number(v.whole)} სმ²`, `${left + Number(v.removed)} სმ²`, `${left - 2} სმ²`]);
    },
    explain: ({ vars, answer }) =>
      `მთელი ${vars.w} × ${vars.h} = ${vars.whole} სმ²; ჩამოჭრილი ${vars.cut} × ${vars.cut} = ${vars.removed} სმ²; დარჩა ${answer}.`,
  }),

  // ═════════ U19.8 — გზის პოვნა (გადათრევა და ჩასმა) ═════════
  bank({
    id: 'g5-u19-q36',
    subtopicId: 'u19-08',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'დაფაზე სვეტები აღინიშნება ასოებით A–F, სტრიქონები — რიცხვებით 1–6. მონიშნულია უჯრა {from}. გადაადგილდი {steps} უჯრით მარჯვნივ. რომელ უჯრაში მოხვდები?',
    variables: {
      spec: { kind: 'choice', values: ['A1|2', 'B2|3', 'C1|2', 'A3|4', 'D2|2', 'B4|1', 'A5|1', 'C3|2'] },
      from: { kind: 'choice', values: (v) => [words(v.spec, 0)] },
      steps: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      to: {
        kind: 'choice',
        values: (v) => {
          const cell = cellAt(words(v.spec, 0));
          return [cellText({ letter: cell.letter + at(v.spec, 1), digit: cell.digit })];
        },
      },
    },
    answer: (v) => String(v.to),
    format: { kind: 'text' },
    options: (v) => {
      const cell = cellAt(String(v.from));
      const target = cell.letter + Number(v.steps);
      return fourOptions(String(v.to), [
        cellText({ letter: target - 1, digit: cell.digit }),
        cellText({ letter: target, digit: cell.digit + 1 }),
        cellText({ letter: target + 1, digit: cell.digit }),
      ]);
    },
    explain: ({ vars, answer }) =>
      `${vars.from}-ის სვეტი ${String(vars.from).charAt(0)}-ია; ${vars.steps} ასო მარჯვნივ → ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q37',
    subtopicId: 'u19-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'დაფაზე სვეტები აღინიშნება ასოებით A–F, სტრიქონები — რიცხვებით 1–6. მონიშნულია უჯრა {from}. გადაადგილდი {steps} უჯრით ზემოთ. რომელ უჯრაში მოხვდები?',
    variables: {
      spec: { kind: 'choice', values: ['B4|2', 'C3|3', 'A2|4', 'D3|2', 'E1|4', 'B3|1', 'F2|3', 'C4|2'] },
      from: { kind: 'choice', values: (v) => [words(v.spec, 0)] },
      steps: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      to: {
        kind: 'choice',
        values: (v) => {
          const cell = cellAt(words(v.spec, 0));
          return [cellText({ letter: cell.letter, digit: cell.digit + at(v.spec, 1) })];
        },
      },
    },
    answer: (v) => String(v.to),
    format: { kind: 'text' },
    options: (v) => {
      const cell = cellAt(String(v.from));
      const target = cell.digit + Number(v.steps);
      return fourOptions(String(v.to), [
        cellText({ letter: cell.letter, digit: target - 1 }),
        cellText({ letter: cell.letter + 1, digit: target }),
        cellText({ letter: cell.letter - 1, digit: target }),
      ]);
    },
    explain: ({ vars, answer }) =>
      `${vars.from}-ის სტრიქონი ${String(vars.from).charAt(1)}-ია; ${vars.steps} ზემოთ → ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q38',
    subtopicId: 'u19-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'დაფაზე სვეტები აღინიშნება ასოებით A–F, სტრიქონები — რიცხვებით 1–6. მონიშნულია უჯრა {from}. გადაადგილდი {left} უჯრით მარცხნივ და {down} უჯრით ქვემოთ. რომელ უჯრაში მოხვდები?',
    variables: {
      spec: { kind: 'choice', values: ['D5|2|1', 'E4|1|2', 'F5|3|2', 'C6|2|3', 'E5|3|1', 'F6|4|1', 'D3|1|2'] },
      from: { kind: 'choice', values: (v) => [words(v.spec, 0)] },
      left: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      down: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      to: {
        kind: 'choice',
        values: (v) => {
          const cell = cellAt(words(v.spec, 0));
          return [cellText({ letter: cell.letter - at(v.spec, 1), digit: cell.digit - at(v.spec, 2) })];
        },
      },
    },
    answer: (v) => String(v.to),
    format: { kind: 'text' },
    options: (v) => {
      const cell = cellAt(String(v.from));
      const target = { letter: cell.letter - Number(v.left), digit: cell.digit - Number(v.down) };
      return fourOptions(String(v.to), [
        cellText({ letter: target.letter + Number(v.left), digit: target.digit + Number(v.down) }),
        cellText({ letter: target.letter, digit: target.digit + 1 }),
        cellText({ letter: target.letter + 1, digit: target.digit }),
      ]);
    },
    explain: ({ vars, answer }) =>
      `სვეტი ${String(vars.from).charAt(0)} → ${vars.left} მარცხნივ; სტრიქონი ${String(vars.from).charAt(1)} → ${vars.down} ქვემოთ. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q39',
    subtopicId: 'u19-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'დაფაზე სვეტები აღინიშნება ასოებით A–F, სტრიქონები — რიცხვებით 1–6. სვლა იწყება {from}-დან: {right} მარჯვნივ, {up} ზემოთ, {left} მარცხნივ. რომელ უჯრაში დასრულდება სვლა?',
    variables: {
      spec: { kind: 'choice', values: ['A1|2|1|1', 'B1|3|2|1', 'C1|2|1|1', 'A1|3|4|2', 'D1|1|2|1', 'A1|4|4|3'] },
      from: { kind: 'choice', values: (v) => [words(v.spec, 0)] },
      right: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      up: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      left: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      to: {
        kind: 'choice',
        values: (v) => {
          const cell = cellAt(words(v.spec, 0));
          return [cellText({ letter: cell.letter + at(v.spec, 1) - at(v.spec, 3), digit: cell.digit + at(v.spec, 2) })];
        },
      },
    },
    answer: (v) => String(v.to),
    format: { kind: 'text' },
    options: (v) => {
      const cell = cellAt(String(v.from));
      const target = { letter: cell.letter + Number(v.right) - Number(v.left), digit: cell.digit + Number(v.up) };
      return fourOptions(String(v.to), [
        cellText({ letter: target.letter, digit: cell.digit }),
        cellText({ letter: target.letter + 1, digit: target.digit }),
        cellText({ letter: target.letter, digit: target.digit - 1 }),
      ]);
    },
    explain: ({ vars, answer }) =>
      `სვეტი: ${Number(vars.right) - Number(vars.left) >= 0 ? '+' : ''}${Number(vars.right) - Number(vars.left)}; სტრიქონი: +${vars.up}. ${vars.from}-დან → ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q40',
    subtopicId: 'u19-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'დაფაზე სვეტები აღინიშნება ასოებით A–F, სტრიქონები — რიცხვებით 1–6. {from}-დან {to}-მდე მისასვლელად რამდენი უჯრით უნდა გადაადგილდე მარჯვნივ?',
    variables: {
      spec: { kind: 'choice', values: ['A1|D1', 'B2|F2', 'A3|C3', 'C1|F1', 'B4|E4', 'A2|D2'] },
      from: { kind: 'choice', values: (v) => [words(v.spec, 0)] },
      to: { kind: 'choice', values: (v) => [words(v.spec, 1)] },
      steps: {
        kind: 'choice',
        values: (v) => [cellAt(words(v.spec, 1)).letter - cellAt(words(v.spec, 0)).letter],
      },
    },
    answer: (v) => String(v.steps),
    format: { kind: 'integer', min: 0 },
    options: (v) => {
      const steps = Number(v.steps);
      return fourOptions(String(steps), [String(steps + 1), String(steps + 2), String(Math.max(0, steps - 1))]);
    },
    explain: ({ vars, answer }) =>
      `სვეტი ${String(vars.from).charAt(0)} → ${String(vars.to).charAt(0)}: ${answer} ნაბიჯი მარჯვნივ.`,
  }),

  // ═════════ U19.9 — ჩაფიქრებული რიცხვი და ციფრები ═════════
  bank({
    id: 'g5-u19-q41',
    subtopicId: 'u19-09',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ჩავიფიქრე რიცხვი. მას დავუმატე {add} და მივიღე {result}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      spec: { kind: 'choice', values: ['14|29', '23|47', '18|36', '31|58', '12|45', '27|64', '16|53', '35|72', '19|41', '24|50'] },
      add: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      result: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => Number(v.result) - Number(v.add),
    format: { kind: 'integer', min: 0 },
    options: (v) => {
      const right = Number(v.result) - Number(v.add);
      return fourOptions(String(right), [String(Number(v.result) + Number(v.add)), String(right + 2), String(right - 3)]);
    },
    explain: ({ vars, answer }) => `${vars.result} − ${vars.add} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q42',
    subtopicId: 'u19-09',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩავიფიქრე რიცხვი, გავამრავლე {times}-ზე, შემდეგ დავუმატე {add} და მივიღე {result}. რა რიცხვი ჩავიფიქრე?',
    hint: 'უკან იარე: ჯერ გამოაკელი, შემდეგ გაყავი.',
    variables: {
      spec: { kind: 'choice', values: ['3|4|25', '5|2|27', '4|6|38', '6|3|45', '2|7|23', '7|5|47', '8|2|34'] },
      times: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      add: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      result: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      start: { kind: 'choice', values: (v) => [(at(v.spec, 2) - at(v.spec, 1)) / at(v.spec, 0)] },
    },
    answer: (v) => String(v.start),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const start = Number(v.start);
      return fourOptions(String(start), [String(start + 1), String(start + 2), String(Math.max(1, start - 1))]);
    },
    explain: ({ vars, answer }) =>
      `უკან: ${vars.result} − ${vars.add} = ${Number(vars.result) - Number(vars.add)}, შემდეგ ÷ ${vars.times} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q43',
    subtopicId: 'u19-09',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ორნიშნა რიცხვის ციფრთა ჯამი {sum}-ია. ათეულის ციფრი {tens}-ია. რა რიცხვია?',
    variables: {
      spec: { kind: 'choice', values: ['3|9', '4|7', '5|11', '6|10', '2|8', '7|13', '8|15', '9|12', '3|11', '4|12'] },
      tens: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      sum: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      number: { kind: 'choice', values: (v) => [at(v.spec, 0) * 10 + (at(v.spec, 1) - at(v.spec, 0))] },
      units: { kind: 'choice', values: (v) => [at(v.spec, 1) - at(v.spec, 0)] },
    },
    answer: (v) => String(v.number),
    format: { kind: 'integer', min: 10 },
    options: (v) => {
      const right = Number(v.number);
      return fourOptions(String(right), [String(right + 9), String(right - 9), String(Number(v.tens) * 10 + Number(v.sum))]);
    },
    explain: ({ vars, answer }) =>
      `ერთეულის ციფრი = ${vars.sum} − ${vars.tens} = ${vars.units}; რიცხვია ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q44',
    subtopicId: 'u19-09',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ორნიშნა რიცხვია. ციფრთა ჯამი {sum}-ია, ხოლო ციფრთა სხვაობა — {diff}. ათეულის ციფრი მეტია. რა რიცხვია?',
    hint: 'ათეულის ციფრი = (ჯამი + სხვაობა) ÷ 2.',
    variables: {
      spec: { kind: 'choice', values: ['10|2', '12|4', '9|3', '11|5', '8|2', '12|6', '7|1', '7|3'] },
      sum: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      diff: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      number: { kind: 'choice', values: (v) => [((at(v.spec, 0) + at(v.spec, 1)) / 2) * 10 + (at(v.spec, 0) - at(v.spec, 1)) / 2] },
    },
    answer: (v) => String(v.number),
    format: { kind: 'integer', min: 10 },
    options: (v) => {
      // Swapping the digits is the classic wrong answer here.
      const right = Number(v.number);
      const swapped = (right % 10) * 10 + Math.floor(right / 10);
      return fourOptions(String(right), [String(swapped), String(right + 9), String(right - 9)]);
    },
    explain: ({ vars, answer }) =>
      `ათეულის ციფრი = (${vars.sum} + ${vars.diff}) ÷ 2 = ${(Number(vars.sum) + Number(vars.diff)) / 2}; ერთეულის = (${vars.sum} − ${vars.diff}) ÷ 2 = ${(Number(vars.sum) - Number(vars.diff)) / 2}. რიცხვია ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q45',
    subtopicId: 'u19-09',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'სამნიშნა რიცხვის ციფრთა ჯამი {sum}-ია. ასეულის ციფრი {hundreds}-ია, ათეულის — {tens}-ი. რა რიცხვია?',
    variables: {
      spec: { kind: 'choice', values: ['1|3|9', '2|4|13', '3|2|11', '1|5|12', '4|3|14', '2|6|15', '5|1|13'] },
      hundreds: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      tens: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      sum: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      units: { kind: 'choice', values: (v) => [at(v.spec, 2) - at(v.spec, 0) - at(v.spec, 1)] },
      number: {
        kind: 'choice',
        values: (v) => [at(v.spec, 0) * 100 + at(v.spec, 1) * 10 + (at(v.spec, 2) - at(v.spec, 0) - at(v.spec, 1))],
      },
    },
    answer: (v) => String(v.number),
    format: { kind: 'integer', min: 100 },
    options: (v) => {
      const right = Number(v.number);
      return fourOptions(String(right), [String(right + 10), String(right - 10), String(right + 1)]);
    },
    explain: ({ vars, answer }) =>
      `ერთეულის ციფრი = ${vars.sum} − ${vars.hundreds} − ${vars.tens} = ${vars.units}; რიცხვია ${answer}.`,
  }),

  // ═════════ U19.10 — მუშაობა და დრო ═════════
  bank({
    id: 'g5-u19-q46',
    subtopicId: 'u19-10',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'მუშა დღეში {daily}-ს ასრულებს. {total}-ს რამდენ დღეში დაასრულებს?',
    variables: {
      spec: { kind: 'choice', values: ['12|36', '15|45', '8|40', '10|60', '20|80', '6|42', '25|100', '9|54'] },
      daily: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      total: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => `${Number(v.total) / Number(v.daily)} დღე`,
    format: { kind: 'text' },
    options: (v) => {
      const days = Number(v.total) / Number(v.daily);
      return fourOptions(`${days} დღე`, [`${days + 1} დღე`, `${days - 1} დღე`, `${Number(v.total) - Number(v.daily)} დღე`]);
    },
    explain: ({ vars, answer }) => `${vars.total} ÷ ${vars.daily} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q47',
    subtopicId: 'u19-10',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{workers} მუშა ერთად {days} დღეში ასრულებს სამუშაოს. რამდენ „მუშა-დღეს“ მოითხოვს ეს სამუშაო?',
    hint: 'მუშა-დღე = მუშების რაოდენობა × დღეების რაოდენობა.',
    variables: {
      spec: { kind: 'choice', values: ['5|8', '6|7', '4|10', '3|12', '8|5', '7|6', '9|4', '2|15'] },
      workers: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      days: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => `${Number(v.workers) * Number(v.days)} მუშა-დღე`,
    format: { kind: 'text' },
    options: (v) => {
      const right = Number(v.workers) * Number(v.days);
      return fourOptions(`${right} მუშა-დღე`, [
        `${Number(v.workers) + Number(v.days)} მუშა-დღე`,
        `${right + Number(v.workers)} მუშა-დღე`,
        `${right - Number(v.workers)} მუშა-დღე`,
      ]);
    },
    explain: ({ vars, answer }) => `${vars.workers} × ${vars.days} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q48',
    subtopicId: 'u19-10',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'სამუშაოს {workers} მუშა {days} დღეში ასრულებს. რამდენ დღეში დაასრულებს იმავე სამუშაოს {fewer} მუშა?',
    hint: 'მუშა-დღეები უცვლელია: ნაკლები მუშა — მეტი დღე.',
    variables: {
      spec: { kind: 'choice', values: ['6|4|3', '8|3|4', '5|6|3', '9|2|6', '12|3|4', '10|4|5', '6|10|5'] },
      workers: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      days: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      fewer: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      needed: { kind: 'choice', values: (v) => [(at(v.spec, 0) * at(v.spec, 1)) / at(v.spec, 2)] },
    },
    answer: (v) => `${v.needed} დღე`,
    format: { kind: 'text' },
    options: (v) => {
      const needed = Number(v.needed);
      return fourOptions(`${needed} დღე`, [`${Number(v.days)} დღე`, `${needed + 2} დღე`, `${needed - 2} დღე`]);
    },
    explain: ({ vars, answer }) =>
      `სულ ${vars.workers} × ${vars.days} = ${Number(vars.workers) * Number(vars.days)} მუშა-დღე; ÷ ${vars.fewer} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q49',
    subtopicId: 'u19-10',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ორი მილის მეშვეობით აუზი ივსება {first} და {second} საათში (თითოეული ცალკე). ორივე ერთად რამდენ საათში აავსებს აუზს?',
    hint: 'ერთ საათში ერთი ავსებს 1/{first}, მეორე — 1/{second}.',
    variables: {
      spec: { kind: 'choice', values: ['6|3|2', '4|4|2', '12|6|4', '10|15|6', '8|8|4', '20|5|4', '3|6|2'] },
      first: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      second: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      both: { kind: 'choice', values: (v) => [(at(v.spec, 0) * at(v.spec, 1)) / (at(v.spec, 0) + at(v.spec, 1))] },
    },
    answer: (v) => `${v.both} სთ`,
    format: { kind: 'text' },
    options: (v) => {
      const both = Number(v.both);
      return fourOptions(`${both} სთ`, [`${both + 1} სთ`, `${both - 1} სთ`, `${(Number(v.first) + Number(v.second)) / 2} სთ`]);
    },
    explain: ({ vars, answer }) =>
      `ერთ საათში ივსება 1/${vars.first} + 1/${vars.second}; შესაბამისად სრულად — ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q50',
    subtopicId: 'u19-10',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'მუშა {hours} საათში ამზადებს {made} დეტალს. რამდენ დეტალს დაამზადებს ის {moreHours} საათში?',
    variables: {
      spec: { kind: 'choice', values: ['4|20|7', '3|18|8', '5|30|9', '2|14|6', '6|24|5', '8|32|3'] },
      hours: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      made: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      moreHours: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      total: { kind: 'choice', values: (v) => [(at(v.spec, 1) / at(v.spec, 0)) * at(v.spec, 2)] },
    },
    answer: (v) => `${v.total} დეტალი`,
    format: { kind: 'text' },
    options: (v) => {
      const total = Number(v.total);
      return fourOptions(`${total} დეტალი`, [`${total + 5} დეტალი`, `${total - 2} დეტალი`, `${Number(v.made)} დეტალი`]);
    },
    explain: ({ vars, answer }) =>
      `საათში ${Number(vars.made) / Number(vars.hours)} დეტალს ამზადებს; × ${vars.moreHours} = ${answer}.`,
  }),

  // ═════════ U19.11 — მიმართულება და მანძილი ═════════
  bank({
    id: 'g5-u19-q51',
    subtopicId: 'u19-11',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ბავშვი სოფლიდან ჩრდილოეთით {north} მეტრს გაიარა. სოფლიდან რა მანძილზე და რა მიმართულებით აღმოჩნდა ის?',
    variables: {
      north: { kind: 'choice', values: [100, 150, 200, 250, 300, 400, 500, 350, 450, 600] },
    },
    answer: (v) => `${v.north} მ ჩრდილოეთით`,
    format: { kind: 'text' },
    options: (v) => {
      const n = Number(v.north);
      return fourOptions(`${n} მ ჩრდილოეთით`, [`${n} მ სამხრეთით`, `${n} მ აღმოსავლეთით`, `${n * 2} მ ჩრდილოეთით`]);
    },
    explain: ({ vars, answer }) => `მარტო ჩრდილოეთით ${vars.north} მ — პასუხი ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q52',
    subtopicId: 'u19-11',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ბავშვი ჩრდილოეთით გაიარა {north} მ, შემდეგ სამხრეთით — {south} მ. სოფლიდან რა მანძილზე აღმოჩნდა ის?',
    hint: 'საპირისპირო მიმართულებები ერთმანეთს აკლდება.',
    variables: {
      spec: { kind: 'choice', values: ['300|200', '500|300', '450|250', '600|500', '350|150', '800|700', '400|400', '250|100'] },
      north: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      south: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      net: { kind: 'choice', values: (v) => [Math.abs(at(v.spec, 0) - at(v.spec, 1))] },
    },
    answer: (v) => (Number(v.net) === 0 ? 'სოფელში, 0 მ' : `${v.net} მ ჩრდილოეთით`),
    format: { kind: 'text' },
    options: (v) => {
      const net = Number(v.net);
      const right = net === 0 ? 'სოფელში, 0 მ' : `${net} მ ჩრდილოეთით`;
      return fourOptions(right, [
        `${Number(v.north) + Number(v.south)} მ ჩრდილოეთით`,
        `${net} მ სამხრეთით`,
        `${Math.max(1, net - 50)} მ ჩრდილოეთით`,
      ]);
    },
    explain: ({ vars, answer }) =>
      `${vars.north} − ${vars.south} = ${vars.net}; პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q53',
    subtopicId: 'u19-11',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ბავშვი აღმოსავლეთით გაიარა {east} მ, შემდეგ დასავლეთით — {west} მ. სოფლიდან რა მანძილზე აღმოჩნდა ის?',
    variables: {
      spec: { kind: 'choice', values: ['400|150', '600|250', '500|500', '350|200', '700|300', '900|450', '250|250', '800|350'] },
      east: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      west: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      net: { kind: 'choice', values: (v) => [at(v.spec, 0) - at(v.spec, 1)] },
    },
    answer: (v) => (Number(v.net) === 0 ? 'სოფელში, 0 მ' : `${v.net} მ აღმოსავლეთით`),
    format: { kind: 'text' },
    options: (v) => {
      const net = Number(v.net);
      const right = net === 0 ? 'სოფელში, 0 მ' : `${net} მ აღმოსავლეთით`;
      return fourOptions(right, [
        `${Number(v.east) + Number(v.west)} მ აღმოსავლეთით`,
        `${Math.abs(net)} მ დასავლეთით`,
        `${Math.max(1, net - 100)} მ აღმოსავლეთით`,
      ]);
    },
    explain: ({ vars, answer }) => `${vars.east} − ${vars.west} = ${vars.net}; პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q54',
    subtopicId: 'u19-11',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ბავშვი ჩრდილოეთით გაიარა {a} მ, შემდეგ სამხრეთით — {b} მ, შემდეგ ისევ ჩრდილოეთით — {c} მ. სოფლიდან რა მანძილზე აღმოჩნდა ის?',
    variables: {
      spec: { kind: 'choice', values: ['300|100|250', '500|300|150', '400|250|100', '600|200|300', '350|150|250', '700|400|200'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      net: { kind: 'choice', values: (v) => [at(v.spec, 0) - at(v.spec, 1) + at(v.spec, 2)] },
    },
    answer: (v) => `${v.net} მ ჩრდილოეთით`,
    format: { kind: 'text' },
    options: (v) => {
      const net = Number(v.net);
      return fourOptions(`${net} მ ჩრდილოეთით`, [
        `${Number(v.a) + Number(v.b) + Number(v.c)} მ ჩრდილოეთით`,
        `${net} მ სამხრეთით`,
        `${net + 50} მ ჩრდილოეთით`,
      ]);
    },
    explain: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} + ${vars.c} = ${vars.net}; პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q55',
    subtopicId: 'u19-11',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ბავშვი სოფლიდან აღმოსავლეთით {a} მ-ს გაიარა, შემდეგ ჩრდილოეთით — {b} მ. სოფლიდან რა არის მისი სულ გავლილი მანძილი?',
    hint: 'ეს კითხვა ითხოვს გავლილ გზას, არა პირდაპირ მანძილს სოფლიდან.',
    variables: {
      spec: { kind: 'choice', values: ['300|400', '600|800', '500|1200', '200|1500', '900|1200', '700|2400', '150|200'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => `${Number(v.a) + Number(v.b)} მ`,
    format: { kind: 'text' },
    options: (v) => {
      const walked = Number(v.a) + Number(v.b);
      return fourOptions(`${walked} მ`, [
        `${Math.abs(Number(v.a) - Number(v.b))} მ`,
        `${walked + 100} მ`,
        `${Math.max(Number(v.a), Number(v.b))} მ`,
      ]);
    },
    explain: ({ vars, answer }) =>
      `სულ გავლილი გზა = ${vars.a} + ${vars.b} = ${answer}. (პირდაპირი მანძილი სოფლიდან სხვა რიცხვია — ამ კითხვაში გზას ითხოვენ.)`,
  }),

  // ═════════ U19.12 — ორი მოქმედების კავშირი ═════════
  bank({
    id: 'g5-u19-q56',
    subtopicId: 'u19-12',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'თუ {a} × 4 = {product}, მაშინ {product} ÷ 4 = ?',
    variables: {
      a: { kind: 'choice', values: [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 20] },
      product: { kind: 'choice', values: (v) => [Number(v.a) * 4] },
    },
    answer: (v) => String(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => fourOptions(String(v.a), [String(Number(v.a) + 1), String(Number(v.a) - 1), String(Number(v.product))]),
    explain: ({ vars, answer }) =>
      `გაყოფა გამრავლების საპირისპირო მოქმედებაა: ${vars.product} ÷ 4 = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q57',
    subtopicId: 'u19-12',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{sum} + {b} = {total}. რას უდრის {total} − {b}?',
    variables: {
      spec: { kind: 'choice', values: ['45|28', '63|37', '82|49', '57|24', '96|58', '128|75', '204|96', '71|36'] },
      sum: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      total: { kind: 'choice', values: (v) => [at(v.spec, 0) + at(v.spec, 1)] },
    },
    answer: (v) => String(v.sum),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.sum);
      return fourOptions(String(right), [String(Number(v.b)), String(Number(v.total)), String(right + 2)]);
    },
    explain: ({ vars, answer }) =>
      `შეკრება და გამოკლება ურთიერთსაპირისპიროა: ${vars.total} − ${vars.b} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q58',
    subtopicId: 'u19-12',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'თუ {a} × {b} = {product}, მაშინ {product} ÷ {b} = ?',
    variables: {
      spec: { kind: 'choice', values: ['7|6', '8|9', '12|4', '15|3', '11|7', '14|5', '9|8', '13|6', '25|4', '18|7'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      product: { kind: 'choice', values: (v) => [at(v.spec, 0) * at(v.spec, 1)] },
    },
    answer: (v) => String(v.a),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.a);
      return fourOptions(String(right), [String(Number(v.b)), String(Number(v.product)), String(right + 1)]);
    },
    explain: ({ vars, answer }) => `${vars.product} ÷ ${vars.b} = ${answer}, რადგან ${vars.a} × ${vars.b} = ${vars.product}.`,
  }),
  bank({
    id: 'g5-u19-q59',
    subtopicId: 'u19-12',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'თუ {a} + {b} = {sum}, მაშინ ({sum} − {a}) × {c} = ?',
    variables: {
      spec: { kind: 'choice', values: ['14|9|4', '23|17|3', '35|28|5', '41|26|6', '52|37|2', '68|54|7', '19|12|8', '84|69|3'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      sum: { kind: 'choice', values: (v) => [at(v.spec, 0) + at(v.spec, 1)] },
    },
    answer: (v) => String(Number(v.b) * Number(v.c)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.b) * Number(v.c);
      return fourOptions(String(right), [String(Number(v.sum) * Number(v.c)), String(right + Number(v.c)), String(right - Number(v.b))]);
    },
    explain: ({ vars, answer }) =>
      `(${vars.sum} − ${vars.a}) = ${vars.b}; ${vars.b} × ${vars.c} = ${answer}.`,
  }),
  bank({
    id: 'g5-u19-q60',
    subtopicId: 'u19-12',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'თუ {product} ÷ {b} = {a}, მაშინ {a} × {b} + {extra} = ?',
    variables: {
      spec: { kind: 'choice', values: ['48|6|11', '72|8|15', '105|7|23', '96|12|34', '150|10|7', '84|4|19', '63|9|48'] },
      product: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0) / at(v.spec, 1)] },
      extra: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => String(Number(v.product) + Number(v.extra)),
    format: { kind: 'integer', min: 1 },
    options: (v) => {
      const right = Number(v.product) + Number(v.extra);
      return fourOptions(String(right), [String(Number(v.a) + Number(v.extra)), String(right + 10), String(right - 5)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.a} × ${vars.b} = ${vars.product}; + ${vars.extra} = ${answer}.`,
  }),
];
