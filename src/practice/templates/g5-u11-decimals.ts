import type { QuestionTemplate } from './types';
import { RELATION_OPTIONS, bank, fourOptions, relation, rowNumbers } from './g5-helpers';

/**
 * Grade V — Unit 11: ათწილადები (decimals).
 *
 * Converted from the academy's `U11` bank (8 subtopics × 6 questions). Georgian
 * decimal notation uses a comma — `0,35`, not `0.35` — so every literal below
 * is built by `dec()` from integer thousandths. That also keeps the arithmetic
 * exact: 0.1 + 0.2 must print as 0,3, never 0,30000000000000004.
 */

export const G5_U11_SUBTOPICS = [
  'u11-01',
  'u11-02',
  'u11-03',
  'u11-04',
  'u11-05',
  'u11-06',
  'u11-07',
  'u11-08',
] as const;

export type G5U11SubtopicId = (typeof G5_U11_SUBTOPICS)[number];

const TOPIC = 'g5-decimals';

/** Integer thousandths → Georgian decimal string, trailing zeros trimmed. */
const dec = (thousandths: number): string => {
  const sign = thousandths < 0 ? '−' : '';
  const abs = Math.abs(Math.round(thousandths));
  const whole = Math.floor(abs / 1000);
  const frac = abs % 1000;
  if (frac === 0) return `${sign}${whole}`;
  const padded = String(frac).padStart(3, '0').replace(/0+$/, '');
  return `${sign}${whole},${padded}`;
};

/** Read a `a|b` row of thousandths. */
const th = (row: unknown, index: number): number => rowNumbers(row)[index]!;

const pool = (build: (add: (row: string) => void) => void): string[] => {
  const rows: string[] = [];
  build((row) => {
    if (!rows.includes(row)) rows.push(row);
  });
  return rows;
};

/** A table of hundredth pairs for addition, stored as thousandths of a unit. */
const addPairs = pool((add) => {
  for (let a = 15; a <= 950; a += 25) for (let b = 15; b <= 900; b += 25) add(`${a}|${b}`);
});

const subPairs = pool((add) => {
  for (let a = 200; a <= 2000; a += 25) for (let b = 15; b < a; b += 25) add(`${a}|${b}`);
});

const mulPairs = pool((add) => {
  for (const a of [12, 15, 20, 24, 25, 35, 40, 45, 60, 75, 125, 230, 408, 350]) {
    for (const b of [2, 3, 4, 5, 6, 8, 12, 15, 25]) add(`${a}|${b}`);
  }
});

const divPairs = pool((add) => {
  for (const b of [2, 3, 4, 5, 6, 8]) {
    for (let q = 12; q <= 250; q += 12) add(`${q * b}|${b}|${q}`);
  }
});

export const G5_U11_TEMPLATES: QuestionTemplate[] = [
  // ───────────── U11.1 — ათწილადის ნაწილები ─────────────
  bank({
    id: 'g5-u11-q01',
    subtopicId: 'u11-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ჩაწერე ათწილადის სახით: {a}/10',
    variables: {
      a: { kind: 'int', min: 1, max: 99 },
      sa: { kind: 'choice', values: (v) => [String(v.a)] },
    },
    answer: (v) => `0,${v.sa}`,
    format: { kind: 'text' },
    options: (v) => fourOptions(`0,${v.sa}`, [`${v.sa},0`, `0,0${v.sa}`, `${v.sa}0`, `0,${Number(v.sa) + 1}`]),
    explain: ({ vars, answer }) => `მეათედი — ეს ერთი ციფრია მძიმის შემდეგ: ${vars.a}/10 = ${answer}.`,
  }),
  bank({
    id: 'g5-u11-q02',
    subtopicId: 'u11-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ჩაწერე ათწილადის სახით: {a}/100',
    variables: {
      a: { kind: 'int', min: 1, max: 99 },
      sa: { kind: 'choice', values: (v) => [String(v.a)] },
    },
    answer: (v) => dec(Number(v.a) * 10),
    format: { kind: 'text' },
    options: (v) => {
      const right = dec(Number(v.a) * 10);
      return fourOptions(right, [`0,${v.sa}`, `${v.sa},0`, `0,O${v.sa}`, dec(Number(v.a) * 100)]);
    },
    explain: ({ vars, answer }) => `მეასედი — ორი ციფრი მძიმის შემდეგ: ${vars.a}/100 = ${answer}.`,
  }),
  bank({
    id: 'g5-u11-q03',
    subtopicId: 'u11-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩაწერე ჩვეულებრივი წილადების სახით: {d}',
    variables: {
      spec: { kind: 'choice', values: ['0,6|6|10', '0,35|35|100', '2,4|24|10', '0,08|8|100', '5,7|57|10', '1,25|125|100', '0,4|4|10', '3,09|309|100', '0,9|9|10', '1,4|14|10', '0,75|75|100', '2,06|206|100', '7,3|73|10', '0,12|12|100', '4,5|45|10', '6,08|608|100'] },
      d: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1]!)] },
      den: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2]!)] },
    },
    answer: (v) => `${v.n}/${v.den}`,
    format: { kind: 'text' },
    options: (v) => fourOptions(`${v.n}/${v.den}`, [
      `${v.n}/${Number(v.den) * 10}`,
      `${Number(v.n) * 10}/${v.den}`,
      `${v.den}/${v.n}`,
    ]),
    explain: ({ vars, answer }) =>
      `${vars.d} — მძიმის შემდეგ ${String(vars.den).length - 1} ციფრია, ამიტომ მნიშვნელი ${vars.den}-ია. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u11-q04',
    subtopicId: 'u11-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რიცხვში {d} რამდენი მეათედი და რამდენი მეასედია?',
    variables: {
      spec: { kind: 'choice', values: ['4,72|47|2', '3,58|35|8', '1,09|10|9', '7,46|74|6', '2,83|28|3', '9,15|91|5', '6,27|62|7', '5,94|59|4', '2,31|23|1', '8,63|86|3', '1,47|14|7', '5,28|52|8', '3,96|39|6', '7,05|70|5', '9,82|98|2', '4,16|41|6'] },
      d: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1]!)] },
      h: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2]!)] },
    },
    answer: (v) => `${v.t} მეათედი და ${v.h} მეასედი`,
    format: { kind: 'text' },
    options: (v) => fourOptions(`${v.t} მეათედი და ${v.h} მეასედი`, [
      `${v.h} მეათედი და ${v.t} მეასედი`,
      `${Number(v.t) * 10} მეათედი და ${v.h} მეასედი`,
      `${Number(v.t) + 1} მეათედი და ${v.h} მეასედი`,
    ]),
    explain: ({ vars, answer }) => `${vars.d} = ${vars.t} მეათედი და ${vars.h} მეასედი: ${answer}.`,
  }),

  // ───────────── U11.2 — შედარება ─────────────
  bank({
    id: 'g5-u11-q05',
    subtopicId: 'u11-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'შეადარე: {a} ___ {b}',
    variables: {
      spec: { kind: 'choice', values: ['0,7|0,5', '0,36|0,4', '2,08|2,8', '1,5|1,50', '0,09|0,1', '3,45|3,5', '0,6|0,60', '7,2|7,02', '0,25|0,3', '4,8|4,75', '1,03|1,3', '2,7|2,70', '0,11|0,2', '5,6|5,06', '3,9|3,88', '6,4|6,40'] },
      a: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      b: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
      av: { kind: 'choice', values: (v) => [Math.round(Number(String(v.a).replace(',', '.')) * 1000)] },
      bv: { kind: 'choice', values: (v) => [Math.round(Number(String(v.b).replace(',', '.')) * 1000)] },
    },
    answer: (v) => relation(Number(v.av), Number(v.bv)),
    optionCount: 3,
    options: () => RELATION_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) =>
      `ვასწორებთ ციფრთა რაოდენობას მძიმის შემდეგ და ვადარებთ: ${vars.a} ${answer} ${vars.b}.`,
  }),
  bank({
    id: 'g5-u11-q06',
    subtopicId: 'u11-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'დაალაგე ზრდადობით: {l}',
    variables: {
      spec: { kind: 'choice', values: ['0,9|0,09|0,99|0,19', '3,45|3,54|3,05|3,5', '1,07|1,7|1,17|1,71', '2,4|2,04|2,44|2,14', '0,5|0,05|0,55|0,15', '4,2|4,02|4,22|4,12', '0,8|0,18|0,88|0,08', '5,3|5,03|5,33|5,13', '1,6|1,06|1,66|1,16', '2,9|2,19|2,99|2,09', '6,1|6,01|6,11|6,10', '0,3|0,13|0,33|0,23'] },
      l: { kind: 'choice', values: (v) => [String(v.spec).split('|').join(', ')] },
    },
    answer: (v) => {
      const items = String(v.spec).split('|').map((s) => s.replace(',', '.'));
      return items
        .map((s) => ({ s, v: Number(s) }))
        .sort((x, y) => x.v - y.v)
        .map((x) => x.s.replace('.', ','))
        .join(', ');
    },
    format: { kind: 'text' },
    options: (v) => {
      const items = String(v.spec).split('|');
      const sorted = [...items].map((s) => ({ s, v: Number(s.replace(',', '.')) })).sort((x, y) => x.v - y.v);
      const right = sorted.map((x) => x.s).join(', ');
      const wrongs = [
        [...sorted].reverse().map((x) => x.s).join(', '),
        items.join(', '),
        [sorted[1]!, sorted[0]!, sorted[3]!, sorted[2]!].map((x) => x.s).join(', '),
      ];
      return fourOptions(right, wrongs);
    },
    explain: ({ answer }) =>
      `თითოეულ რიცხვს მძიმის შემდეგ ერთნაირი რაოდენობის ციფრი დავუმატეთ, შემდეგ კი როგორც მთელი რიცხვები შევადარეთ: ${answer}.`,
  }),
  bank({
    id: 'g5-u11-q07',
    subtopicId: 'u11-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'იპოვე უდიდესი რიცხვი: {l}',
    variables: {
      spec: { kind: 'choice', values: ['1,07|1,7|1,17|1,71', '0,3|0,31|0,13|0,03', '4,5|4,05|4,55|4,15', '2,9|2,09|2,99|2,19', '6,1|6,01|6,11|6,0', '3,2|3,02|3,22|3,12', '0,6|0,66|0,16|0,06', '5,8|5,08|5,88|5,18', '1,4|1,04|1,44|1,14', '7,5|7,05|7,55|7,15', '2,3|2,03|2,33|2,13', '8,4|8,04|8,44|8,14', '0,7|0,07|0,77|0,17', '3,6|3,06|3,66|3,16', '9,2|9,02|9,22|9,12', '4,4|4,04|4,44|4,14', '6,5|6,05|6,55|6,15'] },
      l: { kind: 'choice', values: (v) => [String(v.spec).split('|').join(', ')] },
    },
    answer: (v) => {
      const items = String(v.spec).split('|');
      return [...items].sort((x, y) => Number(y.replace(',', '.')) - Number(x.replace(',', '.')))[0]!;
    },
    format: { kind: 'text' },
    options: (v) => {
      const items = String(v.spec).split('|');
      const right = [...items].sort((x, y) => Number(y.replace(',', '.')) - Number(x.replace(',', '.')))[0]!;
      return fourOptions(right, items.filter((x) => x !== right).concat(['5,00']));
    },
    explain: ({ answer }) =>
      `მძიმის შემდეგ ციფრები სათითაოდ შევადარეთ — ყველაზე დიდია ${answer}.`,
  }),

  // ───────────── U11.3 — გადაქცევა ─────────────
  bank({
    id: 'g5-u11-q08',
    subtopicId: 'u11-03',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ჩაწერე ათწილადის სახით: {a}/{d}',
    variables: {
      spec: { kind: 'choice', values: ['7|10', '23|100', '8|10', '45|100', '9|10', '12|100', '3|10', '76|100', '1|10', '67|100', '4|10', '89|100', '5|10', '34|100', '6|10', '58|100'] },
      a: { kind: 'choice', values: (v) => [th(v.spec, 0)] },
      d: { kind: 'choice', values: (v) => [th(v.spec, 1)] },
    },
    answer: (v) => dec((Number(v.a) * 1000) / Number(v.d)),
    format: { kind: 'text' },
    options: (v) => {
      const right = dec((Number(v.a) * 1000) / Number(v.d));
      return fourOptions(right, [`0,${v.a}`, `${v.a},0`, dec((Number(v.a) * 1000) / Number(v.d) + 10)]);
    },
    explain: ({ vars, answer }) => `${vars.a}/${vars.d} = ${answer}.`,
  }),
  bank({
    id: 'g5-u11-q09',
    subtopicId: 'u11-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩაწერე ათწილადის სახით: {w} {a}/{d}',
    variables: {
      spec: { kind: 'choice', values: ['2|3|10', '3|8|10', '1|25|100', '4|5|10', '2|75|100', '5|4|10', '1|7|10', '6|2|10', '3|45|100', '7|1|10', '4|9|10', '2|55|100', '5|6|10', '8|3|10'] },
      w: { kind: 'choice', values: (v) => [th(v.spec, 0)] },
      a: { kind: 'choice', values: (v) => [th(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [th(v.spec, 2)] },
    },
    answer: (v) => dec(Number(v.w) * 1000 + (Number(v.a) * 1000) / Number(v.d)),
    format: { kind: 'text' },
    options: (v) => {
      const right = dec(Number(v.w) * 1000 + (Number(v.a) * 1000) / Number(v.d));
      return fourOptions(right, [`${v.w}${v.a}`, `${v.a},${v.w}`, dec(Number(v.w) * 1000 + Number(v.a) * 10)]);
    },
    explain: ({ vars, answer }) => `${vars.w} ${vars.a}/${vars.d} = ${answer}.`,
  }),
  bank({
    id: 'g5-u11-q10',
    subtopicId: 'u11-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩაწერე ათწილადის სახით: {w} + {a}/10 + {b}/100',
    variables: {
      spec: { kind: 'choice', values: ['3|5|8', '2|4|7', '5|9|3', '1|6|2', '4|1|5', '7|3|9', '6|2|1', '8|4|6', '2|7|5', '9|1|4', '3|8|2', '5|2|6'] },
      w: { kind: 'choice', values: (v) => [th(v.spec, 0)] },
      a: { kind: 'choice', values: (v) => [th(v.spec, 1)] },
      b: { kind: 'choice', values: (v) => [th(v.spec, 2)] },
    },
    answer: (v) => dec(Number(v.w) * 1000 + Number(v.a) * 100 + Number(v.b) * 10),
    format: { kind: 'text' },
    options: (v) => {
      const right = dec(Number(v.w) * 1000 + Number(v.a) * 100 + Number(v.b) * 10);
      return fourOptions(right, [`${v.w},${v.b}${v.a}`, `${v.w},0${v.a}${v.b}`, `${v.w}${v.a},${v.b}`]);
    },
    explain: ({ vars, answer }) =>
      `მეათედი მძიმის შემდეგ პირველი ციფრია, მეასედი — მეორე: ${vars.w} + ${vars.a}/10 + ${vars.b}/100 = ${answer}.`,
  }),

  // ───────────── U11.4 — შეკრება ─────────────
  bank({
    id: 'g5-u11-q11',
    subtopicId: 'u11-04',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {a} + {b}',
    variables: {
      spec: { kind: 'choice', values: addPairs },
      a: { kind: 'choice', values: (v) => [dec(th(v.spec, 0))] },
      b: { kind: 'choice', values: (v) => [dec(th(v.spec, 1))] },
      av: { kind: 'choice', values: (v) => [th(v.spec, 0)] },
      bv: { kind: 'choice', values: (v) => [th(v.spec, 1)] },
    },
    answer: (v) => dec(Number(v.av) + Number(v.bv)),
    format: { kind: 'text' },
    options: (v) => fourOptions(dec(Number(v.av) + Number(v.bv)), [
      dec(Number(v.av) + Number(v.bv) + 10),
      dec(Number(v.av) - Number(v.bv) > 0 ? Number(v.av) - Number(v.bv) : Number(v.av) + 100),
      dec(Number(v.av) + Number(v.bv) + 100),
    ]),
    explain: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer} (მძიმე მძიმის ქვეშ).`,
  }),
  bank({
    id: 'g5-u11-q12',
    subtopicId: 'u11-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a} + {b}',
    variables: {
      spec: { kind: 'choice', values: addPairs },
      a: { kind: 'choice', values: (v) => [dec(th(v.spec, 0))] },
      b: { kind: 'choice', values: (v) => [dec(th(v.spec, 1))] },
      av: { kind: 'choice', values: (v) => [th(v.spec, 0)] },
      bv: { kind: 'choice', values: (v) => [th(v.spec, 1)] },
    },
    answer: (v) => dec(Number(v.av) + Number(v.bv)),
    format: { kind: 'text' },
    options: (v) => fourOptions(dec(Number(v.av) + Number(v.bv)), [
      dec(Number(v.av) + Number(v.bv) + 50),
      dec(Number(v.av) + Number(v.bv) - 50),
      dec(Number(v.av) * 2),
    ]),
    explain: ({ vars, answer }) => `ვაწყობთ სვეტად და ვკრებთ: ${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // ───────────── U11.5 — გამოკლება ─────────────
  bank({
    id: 'g5-u11-q13',
    subtopicId: 'u11-05',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {a} − {b}',
    variables: {
      spec: { kind: 'choice', values: subPairs },
      a: { kind: 'choice', values: (v) => [dec(th(v.spec, 0))] },
      b: { kind: 'choice', values: (v) => [dec(th(v.spec, 1))] },
      av: { kind: 'choice', values: (v) => [th(v.spec, 0)] },
      bv: { kind: 'choice', values: (v) => [th(v.spec, 1)] },
    },
    answer: (v) => dec(Number(v.av) - Number(v.bv)),
    format: { kind: 'text' },
    options: (v) => fourOptions(dec(Number(v.av) - Number(v.bv)), [
      dec(Number(v.av) - Number(v.bv) + 10),
      dec(Number(v.av) + Number(v.bv)),
      dec(Number(v.av) - Number(v.bv) + 100),
    ]),
    explain: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  }),
  bank({
    id: 'g5-u11-q14',
    subtopicId: 'u11-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a} − {b}',
    variables: {
      spec: { kind: 'choice', values: subPairs },
      a: { kind: 'choice', values: (v) => [dec(th(v.spec, 0))] },
      b: { kind: 'choice', values: (v) => [dec(th(v.spec, 1))] },
      av: { kind: 'choice', values: (v) => [th(v.spec, 0)] },
      bv: { kind: 'choice', values: (v) => [th(v.spec, 1)] },
    },
    answer: (v) => dec(Number(v.av) - Number(v.bv)),
    format: { kind: 'text' },
    options: (v) => fourOptions(dec(Number(v.av) - Number(v.bv)), [
      dec(Number(v.av) - Number(v.bv) - 10 > 0 ? Number(v.av) - Number(v.bv) - 10 : Number(v.av) - Number(v.bv) + 20),
      dec(Number(v.av) + Number(v.bv)),
      dec(Number(v.av) - Number(v.bv) + 5),
    ]),
    explain: ({ vars, answer }) =>
      `ათწილადების გამოკლებისას მძიმეები ერთმანეთის ქვეშ უნდა იდგეს: ${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // ───────────── U11.6 — გამრავლება ─────────────
  bank({
    id: 'g5-u11-q15',
    subtopicId: 'u11-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a} × {b}',
    variables: {
      spec: { kind: 'choice', values: mulPairs },
      a: { kind: 'choice', values: (v) => [dec(th(v.spec, 0) * 10)] },
      b: { kind: 'choice', values: (v) => [String(th(v.spec, 1))] },
      av: { kind: 'choice', values: (v) => [th(v.spec, 0) * 10] },
      bv: { kind: 'choice', values: (v) => [th(v.spec, 1)] },
    },
    answer: (v) => dec((Number(v.av) * Number(v.bv)) / 1),
    format: { kind: 'text' },
    options: (v) => fourOptions(dec(Number(v.av) * Number(v.bv)), [
      dec(Number(v.av) * Number(v.bv) * 10),
      dec(Number(v.av) * Number(v.bv) / 10),
      dec(Number(v.av) + Number(v.bv)),
    ]),
    explain: ({ vars, answer }) =>
      `მძიმის გარეშე ვამრავლებთ, შემდეგ მძიმის შემდეგ ციფრების რაოდენობას ვითვლით: ${vars.a} × ${vars.b} = ${answer}.`,
  }),
  bank({
    id: 'g5-u11-q16',
    subtopicId: 'u11-06',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {a} × {b}',
    variables: {
      spec: { kind: 'choice', values: ['24|300|3', '125|400|4', '6|500|5', '23|1200|12', '408|2500|25', '35|400|4', '15|800|8', '45|600|6', '18|700|7', '32|600|6', '55|400|4', '12|900|9', '75|800|8', '28|500|5', '64|300|3', '16|1500|15'] },
      a: { kind: 'choice', values: (v) => [dec(th(v.spec, 0) * 10)] },
      b: { kind: 'choice', values: (v) => [dec(th(v.spec, 1) * 10)] },
      av: { kind: 'choice', values: (v) => [th(v.spec, 0) * 10] },
      bv: { kind: 'choice', values: (v) => [th(v.spec, 1) * 10] },
    },
    answer: (v) => dec((Number(v.av) * Number(v.bv)) / 1000),
    format: { kind: 'text' },
    options: (v) => {
      const right = dec((Number(v.av) * Number(v.bv)) / 1000);
      return fourOptions(right, [
        dec((Number(v.av) * Number(v.bv)) / 100),
        dec((Number(v.av) * Number(v.bv)) / 10000),
        dec(Number(v.av) + Number(v.bv)),
      ]);
    },
    explain: ({ vars, answer }) =>
      `${vars.a} × ${vars.b}: ორივეს მძიმის შემდეგ თითო ციფრია, ამიტომ შედეგში ორი ციფრია: ${answer}.`,
  }),

  // ───────────── U11.7 — გაყოფა ─────────────
  bank({
    id: 'g5-u11-q17',
    subtopicId: 'u11-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a} ÷ {b}',
    variables: {
      spec: { kind: 'choice', values: divPairs },
      a: { kind: 'choice', values: (v) => [dec(th(v.spec, 0) * 10)] },
      b: { kind: 'choice', values: (v) => [String(th(v.spec, 1))] },
      av: { kind: 'choice', values: (v) => [th(v.spec, 0) * 10] },
      bv: { kind: 'choice', values: (v) => [th(v.spec, 1)] },
    },
    answer: (v) => dec(Number(v.av) / Number(v.bv)),
    format: { kind: 'text' },
    options: (v) => fourOptions(dec(Number(v.av) / Number(v.bv)), [
      dec(Number(v.av) / Number(v.bv) * 10),
      dec(Number(v.av) / Number(v.bv) / 10),
      dec(Number(v.av) / Number(v.bv) + 1),
    ]),
    explain: ({ vars, answer }) =>
      `${vars.a} ÷ ${vars.b}: მთელ ნაწილს ვყოფთ, ნაშთს მეათედებად ვწერთ და ვაგრძელებთ. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u11-q18',
    subtopicId: 'u11-07',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {a} ÷ {b}',
    variables: {
      spec: { kind: 'choice', values: ['48|2000|2', '75|2500|25', '36|600|6', '84|1200|12', '126|300|3', '525|2500|25', '64|800|8', '96|1200|12', '42|1400|14', '90|1500|15', '56|800|8', '72|2400|24'] },
      a: { kind: 'choice', values: (v) => [dec(th(v.spec, 0) * 10)] },
      b: { kind: 'choice', values: (v) => [dec(th(v.spec, 1) * 10)] },
      av: { kind: 'choice', values: (v) => [th(v.spec, 0) * 10] },
      bv: { kind: 'choice', values: (v) => [th(v.spec, 1) * 10] },
    },
    answer: (v) => dec((Number(v.av) / Number(v.bv)) * 1000),
    format: { kind: 'text' },
    options: (v) => {
      const right = dec((Number(v.av) / Number(v.bv)) * 1000);
      return fourOptions(right, [
        dec(((Number(v.av) / Number(v.bv)) * 1000) / 10),
        dec(((Number(v.av) / Number(v.bv)) * 1000) * 10),
        dec(((Number(v.av) / Number(v.bv)) * 1000) + 1),
      ]);
    },
    explain: ({ vars, answer }) =>
      `გამყოფში მძიმეს ვასწორებთ: ${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  // ───────────── U11.8 — ამოცანები ─────────────
  bank({
    id: 'g5-u11-q19',
    subtopicId: 'u11-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ერთი რვეული ღირს {a} ლარი. რა ღირს {k} ასეთი რვეული?',
    variables: {
      spec: { kind: 'choice', values: mulPairs },
      a: { kind: 'choice', values: (v) => [dec(th(v.spec, 0) * 10)] },
      k: { kind: 'choice', values: (v) => [String(th(v.spec, 1))] },
      av: { kind: 'choice', values: (v) => [th(v.spec, 0) * 10] },
      kv: { kind: 'choice', values: (v) => [th(v.spec, 1)] },
    },
    answer: (v) => dec(Number(v.av) * Number(v.kv)),
    format: { kind: 'text' },
    options: (v) => fourOptions(dec(Number(v.av) * Number(v.kv)), [
      dec(Number(v.av) * Number(v.kv) * 10),
      dec(Number(v.av) * Number(v.kv) / 10),
      dec(Number(v.av) + Number(v.kv)),
    ]),
    explain: ({ vars, answer }) => `${vars.k} × ${vars.a} ლ = ${answer} ლარი.`,
  }),
  bank({
    id: 'g5-u11-q20',
    subtopicId: 'u11-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ნინოს {a} ლარი ჰქონდა. მან იყიდა წიგნი {b} ლარად. რამდენი ლარი დარჩა?',
    variables: {
      spec: { kind: 'choice', values: subPairs },
      a: { kind: 'choice', values: (v) => [dec(th(v.spec, 0))] },
      b: { kind: 'choice', values: (v) => [dec(th(v.spec, 1))] },
      av: { kind: 'choice', values: (v) => [th(v.spec, 0)] },
      bv: { kind: 'choice', values: (v) => [th(v.spec, 1)] },
    },
    answer: (v) => dec(Number(v.av) - Number(v.bv)),
    format: { kind: 'text' },
    options: (v) => fourOptions(dec(Number(v.av) - Number(v.bv)), [
      dec(Number(v.av) + Number(v.bv)),
      dec(Number(v.av) - Number(v.bv) + 10),
      dec(Number(v.av) - Number(v.bv) - 10 > 0 ? Number(v.av) - Number(v.bv) - 10 : Number(v.av) - Number(v.bv) + 20),
    ]),
    explain: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer} ლარი.`,
  }),
  bank({
    id: 'g5-u11-q21',
    subtopicId: 'u11-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: '{a} კგ ვაშლი ღირს {b} ლარი. რა ღირს 1 კგ ვაშლი?',
    variables: {
      spec: { kind: 'choice', values: divPairs },
      a: { kind: 'choice', values: (v) => [String(th(v.spec, 1))] },
      b: { kind: 'choice', values: (v) => [dec(th(v.spec, 0) * 10)] },
      av: { kind: 'choice', values: (v) => [th(v.spec, 1)] },
      bv: { kind: 'choice', values: (v) => [th(v.spec, 0) * 10] },
    },
    answer: (v) => dec(Number(v.bv) / Number(v.av)),
    format: { kind: 'text' },
    options: (v) => fourOptions(dec(Number(v.bv) / Number(v.av)), [
      dec(Number(v.bv) / Number(v.av) * 10),
      dec(Number(v.bv) * Number(v.av)),
      dec(Number(v.bv) / Number(v.av) + 1),
    ]),
    explain: ({ vars, answer }) => `${vars.b} ლ ÷ ${vars.a} კგ = ${answer} ლარი ერთ კილოგრამზე.`,
  }),
  bank({
    id: 'g5-u11-q22',
    subtopicId: 'u11-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ჭურჭელში {a} ლ წყალი იყო. გამოიყენეს {b} ლ, შემდეგ დაამატეს {c} ლ. რამდენი ლიტრია ახლა?',
    variables: {
      spec: { kind: 'choice', values: ['500|175|80', '300|125|60', '700|250|90', '450|175|55', '600|240|85', '800|325|70', '250|125|90', '900|425|65', '350|150|75', '650|275|45', '550|225|85', '400|175|95', '750|325|60', '500|225|70', '850|375|55'] },
      a: { kind: 'choice', values: (v) => [dec(th(v.spec, 0) * 10)] },
      b: { kind: 'choice', values: (v) => [dec(th(v.spec, 1) * 10)] },
      c: { kind: 'choice', values: (v) => [dec(th(v.spec, 2) * 10)] },
      av: { kind: 'choice', values: (v) => [th(v.spec, 0) * 10] },
      bv: { kind: 'choice', values: (v) => [th(v.spec, 1) * 10] },
      cv: { kind: 'choice', values: (v) => [th(v.spec, 2) * 10] },
    },
    answer: (v) => dec(Number(v.av) - Number(v.bv) + Number(v.cv)),
    format: { kind: 'text' },
    options: (v) => {
      const right = dec(Number(v.av) - Number(v.bv) + Number(v.cv));
      return fourOptions(right, [
        dec(Number(v.av) + Number(v.bv) + Number(v.cv)),
        dec(Number(v.av) - Number(v.bv)),
        dec(Number(v.av) - Number(v.bv) - Number(v.cv)),
      ]);
    },
    explain: ({ vars, answer }) => `${vars.a} − ${vars.b} + ${vars.c} = ${answer} ლ.`,
  }),
];
