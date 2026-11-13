/**
 * U14 — ფული (money).
 *
 * Fifty templates over the curriculum's six subtopics, following the
 * specification's four sections:
 *
 *   U14.1 `monetebis-vertoba`      Q1–Q10                 10  (1:1)
 *   U14.2 `fulis-amocanebi`        Q11–Q14, Q17–Q18,
 *                                  Q20–Q21, Q23–Q25       11  (1:1)
 *   U14.2 `sakmarisi-fuli`         Q15, Q16, Q19, Q22      4  (1:1)
 *   U14.3 `tolzRvari-monetebi`     Q26–Q40 (see below)    10
 *   U14.3 `yvelaze-cota-monetebi`  Q36 + 4 derived         5
 *   U14.4 `tanxaTa-Sedareba`       Q41–Q50                10  (1:1)
 *
 * The curriculum gives „ფული“ **six** subtopics while the specification describes
 * **four** sections, so the two cannot line up one-to-one. Rather than flatten
 * the extra two, each question is filed under the subtopic that *teaches* it:
 * „საკმარისია თუ არა?“ is its own skill and receives Q15, Q16, Q19 and Q22, and
 * „ყველაზე ცოტა მონეტა“ receives Q36 plus the four that teach *how* the greedy
 * walk gets there. The only folds are inside U14.3, where five reference
 * questions that all ask „how many of this coin make that coin“ are carried by
 * two templates.
 * `U14-MAPPING.md` records the mapping question by question, and every fold.
 *
 * ## The one idea this unit must not break
 *
 * **A purse is a list of coins, and every number in the question comes out of
 * that list.** `coins.ts` draws the tokens, adds them up and counts the ways to
 * pay an amount; a template never holds a second copy of the sum. The picture,
 * the prompt's amount and the answer therefore cannot disagree — the same rule
 * as U13's clock, for the same reason.
 *
 * Two consequences:
 *
 *  - **Real coins only.** `COINS` is `[1, 2, 5, 10, 20, 50]`, the coins Georgia
 *    mints, and it is the only source of coin values in the unit. A hundred
 *    თეთრი is one ლარი and the specification forbids decimals, so every amount
 *    stays inside 1–100 თეთრი.
 *  - **Combinations are unordered.** `10 + 5` and `5 + 10` are one way to pay 15;
 *    `combinationText` sorts before writing, so the two cannot appear as two
 *    options and `coinCombinations` cannot count them twice.
 *
 * ## Answer types
 *
 * All four the specification names are really here:
 *
 *  - **typed number** — a sum, a difference, a count (`format.entry`);
 *  - **coin ordering** — arranging amounts or coin rows (`shuffle`);
 *  - **multi-select** — „mark every item you can buy“ (`multi`). U14 is the first
 *    unit to need it, so the runner grew the mode rather than the question being
 *    recast into a single choice: „mark every one that fits“ and „pick one that
 *    fits“ are different questions, and the specification asks for the first;
 *  - **single choice** — everything worded („კი/არა“, a coin name, a coin row).
 *
 * Every amount is printed as „N თეთრი“ and every purse is drawn, so the unit's
 * own vocabulary is the only one a student meets. Prices are whole თეთრი, never
 * a ლარი with a decimal.
 */

import { defineTemplate } from './types';
import type { QuestionTemplate, VariableSpec, Vars } from './types';
import {
  COINS,
  coinCombinations,
  coinPairs,
  amountTag,
  amountTags,
  coinRow,
  coinText,
  combinationText,
  minCoinSet,
  minCoins,
  total,
  twoPurses,
} from './coins';

const grade = 1 as const;
const topicId = 'fasebi';
const unitId = 'fasebi';

/** The curriculum address every template in this unit shares. */
const address = (spec: { id: string; subtopicId: string; difficulty: 1 | 2 | 3 }) => ({
  id: spec.id,
  grade,
  topicId,
  unitId,
  subtopicId: spec.subtopicId,
  difficulty: spec.difficulty,
});

/* ================================================================== *\
 * Shared vocabulary
 * ================================================================== */

/**
 * What a six-year-old buys with a few dozen tetri.
 *
 * `nom` is for „X ღირს 10 თეთრი“ and `gen` for „X-ის ფასი“ — the two cases the
 * prompts need. Georgian nouns are not declined by a template, so both forms are
 * stored rather than built with string surgery: „ფანქრის“ is not „ფანქარი“ + „-ის“.
 */
export const GOODS = [
  { nom: 'ლურსმანი', gen: 'ლურსმნის', price: 2 },
  { nom: 'კალამი', gen: 'კალმის', price: 6 },
  { nom: 'საშლელი', gen: 'საშლელის', price: 8 },
  { nom: 'ფანქარი', gen: 'ფანქრის', price: 10 },
  { nom: 'სახაზავი', gen: 'სახაზავის', price: 12 },
  { nom: 'წებო', gen: 'წებოს', price: 15 },
  { nom: 'რვეული', gen: 'რვეულის', price: 20 },
  { nom: 'მარკერი', gen: 'მარკერის', price: 25 },
  { nom: 'სურათიანი წიგნი', gen: 'სურათიანი წიგნის', price: 40 },
  { nom: 'ბურთი', gen: 'ბურთის', price: 50 },
] as const;

type Good = (typeof GOODS)[number];

/** The price the unit's own shop charges for a good, by name. */
const priceOf = (nom: string): number => {
  const good = GOODS.find((entry) => entry.nom === nom);
  if (!good) throw new Error(`„${nom}“ is not in the shop, so it has no price`);
  return good.price;
};

/**
 * The goods a purse can (or cannot) afford, as a pool that is never empty.
 *
 * An empty choice pool hands `undefined` to every later variable, and the
 * failure surfaces as „cannot read properties of undefined“ three variables
 * later — so the fallback is the whole shop. It cannot make a question wrong:
 * the answer is computed from the drawn price, and `side` only steers which
 * goods are eligible, never what the answer is.
 */
const goodsWithin = (paid: number, side: string): string[] => {
  const pool = GOODS.filter((good) => (side === 'yes' ? good.price <= paid : good.price > paid));
  return (pool.length > 0 ? pool : GOODS).map((good) => good.nom);
};

/**
 * A list of distinct goods, drawn together.
 *
 * Used instead of drawing names and prices separately, because the two used to
 * disagree: a prompt saying „საშლელი ღირს 2 თეთრი“ when the shop charges 8 for a
 * საშლელი is a question that contradicts the price list the child is being
 * taught. Drawing the goods and reading their prices off `GOODS` makes the
 * contradiction impossible.
 */
const goodsSpec = (length: number) => ({
  kind: 'list' as const,
  pick: { values: GOODS.map((good) => good.nom as string), length, unique: true },
});

/** „N თეთრი“ for an amount the unit is allowed to show. */
const amountText = (value: number): string => coinText(value);

/**
 * The same purse always draws the same way: largest coin first.
 *
 * Without this, `[5, 10]` and `[10, 5]` are two different pictures — and, because
 * a question's picture is half its identity, the same purse asked twice would
 * look like a new question. Sorting also matches the specification's rule that a
 * combination is unordered.
 */
const canonical = (values: readonly number[]): number[] => [...values].sort((a, b) => b - a);

/** The coins that make an amount, drawn — a purse with no arrangement to read. */
const purseOf = (amount: number): number[] => canonical(minCoinSet(amount));

/**
 * Four amount options, the right one first, then plausible wrong ones.
 *
 * A distractor here is a *counting slip*, not noise: one coin counted twice, one
 * coin missed, or a coin swapped for its neighbour. Anything the unit could not
 * actually draw is dropped, so no option is a number no purse can hold.
 */
function amountOptions(correct: number, wrongs: readonly number[], count = 4): string[] {
  const out = [amountText(correct)];
  for (const wrong of wrongs) {
    if (out.length >= count) break;
    if (wrong <= 0 || wrong > 100 || wrong === correct) continue;
    const text = amountText(wrong);
    if (!out.includes(text)) out.push(text);
  }
  return out;
}

/* ================================================================== *\
 * U14.1 — მონეტების ღირებულება და დათვლა (Q1–Q10)
 * ================================================================== */

const u141: QuestionTemplate[] = [
  /** Q1 — read the denomination off the coin. Recognition, nothing to compute. */
  defineTemplate({
    ...address({ id: 'g1-u14-1-name-coin', subtopicId: 'monetebis-vertoba', difficulty: 1 }),
    prompt: 'რა ღირს სურათზე გამოსახული მონეტა?',
    variables: {
      coin: { kind: 'choice', values: [...COINS] },
    },
    answer: (v: Vars) => amountText(Number(v.coin)),
    options: (v: Vars) => COINS.map((coin) => amountText(coin)).filter((text) => text !== amountText(Number(v.coin))).concat(amountText(Number(v.coin))),
    format: { kind: 'text' },
    optionCount: 6,
    visual: (v: Vars) => coinRow([Number(v.coin)]),
    explanation: (context) => `მონეტაზე წერია ${context.vars.coin}, ამიტომ მისი ღირებულება ${context.answer}-ია.`,
  }),

  /** Q2 — two coins of one denomination: the first doubling in the unit. */
  defineTemplate({
    ...address({ id: 'g1-u14-1-two-same-coins', subtopicId: 'monetebis-vertoba', difficulty: 1 }),
    prompt: 'ორი ერთნაირი მონეტა გაქვს. რამდენი თეთრია სულ?',
    variables: {
      coin: { kind: 'choice', values: COINS.filter((coin) => coin <= 20) },
    },
    answer: (v: Vars) => Number(v.coin) * 2,
    format: { kind: 'integer', min: 2, max: 100, entry: true },
    visual: (v: Vars) => coinRow([Number(v.coin), Number(v.coin)]),
    explanation: (context) => `${context.vars.coin} + ${context.vars.coin} = ${context.answer} თეთრი.`,
  }),

  /** Q3 — three coins of one denomination, capped so the sum stays under a lari. */
  defineTemplate({
    ...address({ id: 'g1-u14-1-three-same-coins', subtopicId: 'monetebis-vertoba', difficulty: 1 }),
    prompt: 'სამი ერთნაირი მონეტა გაქვს. რამდენი თეთრია სულ?',
    variables: {
      coin: { kind: 'choice', values: [1, 2, 5, 10, 20] },
    },
    answer: (v: Vars) => Number(v.coin) * 3,
    format: { kind: 'integer', min: 3, max: 60, entry: true },
    visual: (v: Vars) => coinRow([Number(v.coin), Number(v.coin), Number(v.coin)]),
    explanation: (context) =>
      `${context.vars.coin} + ${context.vars.coin} + ${context.vars.coin} = ${context.answer} თეთრი.`,
  }),

  /** Q4 — which coin is worth the most, out of three that are drawn. */
  defineTemplate({
    ...address({ id: 'g1-u14-1-which-is-more', subtopicId: 'monetebis-vertoba', difficulty: 1 }),
    prompt: 'რომელი მონეტა ღირს ყველაზე მეტს?',
    variables: {
      coins: { kind: 'list', pick: { values: [...COINS], length: 3, unique: true } },
    },
    answer: (v: Vars) => amountText(Math.max(...(v.coins as number[]))),
    options: (v: Vars) => canonical(v.coins as number[]).map((coin) => amountText(coin)),
    format: { kind: 'text' },
    optionCount: 3,
    visual: (v: Vars) => coinRow(v.coins as number[]),
    explanation: (context) => {
      const sorted = canonical(context.vars.coins as number[]);
      return `${sorted.join(' > ')} — ყველაზე მეტს ღირს ${sorted[0]} თეთრი.`;
    },
  }),

  /** Q5 — two different coins, typed. Reading two denominations, not doubling one. */
  defineTemplate({
    ...address({ id: 'g1-u14-1-two-different-coins', subtopicId: 'monetebis-vertoba', difficulty: 2 }),
    prompt: 'რამდენი თეთრია ორი მონეტა ერთად?',
    variables: {
      coins: { kind: 'list', pick: { values: [...COINS], length: 2, unique: true } },
    },
    constraints: [{ test: (v: Vars) => total(v.coins as number[]) <= 70, note: 'two coins, small change' }],
    answer: (v: Vars) => total(v.coins as number[]),
    format: { kind: 'integer', min: 3, max: 70, entry: true },
    visual: (v: Vars) => coinRow(canonical(v.coins as number[])),
    explanation: (context) => {
      const [a, b] = canonical(context.vars.coins as number[]);
      return `${a} + ${b} = ${context.answer} თეთრი.`;
    },
  }),

  /** Q6 — three mixed coins, typed: the first three-term addition in the unit. */
  defineTemplate({
    ...address({ id: 'g1-u14-1-three-coins', subtopicId: 'monetebis-vertoba', difficulty: 2 }),
    prompt: 'რამდენი თეთრია სამი მონეტა ერთად?',
    variables: {
      coins: { kind: 'list', pick: { values: [...COINS], length: 3, unique: true } },
    },
    constraints: [{ test: (v: Vars) => total(v.coins as number[]) <= 90, note: 'three coins, under ninety' }],
    answer: (v: Vars) => total(v.coins as number[]),
    format: { kind: 'integer', min: 8, max: 90, entry: true },
    visual: (v: Vars) => coinRow(canonical(v.coins as number[])),
    explanation: (context) => {
      const [a, b, c] = canonical(context.vars.coins as number[]);
      return `${a} + ${b} + ${c} = ${context.answer} თეთრი.`;
    },
  }),

  /**
   * Q7 — **how many coins**, not how much.
   *
   * The complement of the counting question below, and the reason the
   * specification separates them: a child who adds the values answers a
   * different question, so the sum is offered as a distractor.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-1-count-coins', subtopicId: 'monetebis-vertoba', difficulty: 2 }),
    prompt: 'რამდენი მონეტაა სურათზე? დათვალე მონეტები, არა თეთრები.',
    variables: {
      coins: {
        kind: 'list',
        pick: { values: [...COINS], length: { min: 2, max: 6 }, unique: false },
      },
    },
    constraints: [{ test: (v: Vars) => total(v.coins as number[]) <= 100, note: 'small change' }],
    answer: (v: Vars) => (v.coins as number[]).length,
    options: (v: Vars) => {
      const count = (v.coins as number[]).length;
      const sum = total(v.coins as number[]);
      // The sum is the mistake being caught — „how many coins“ answered by adding
      // them — but only while it is small enough to be a believable count.
      const wrongs = [sum <= 12 ? sum : count + 1, count + 1, count - 1, count + 2];
      return [String(count), ...[...new Set(wrongs.map(String))].filter((text) => text !== String(count)).slice(0, 3)];
    },
    format: { kind: 'text' },
    visual: (v: Vars) => coinRow(canonical(v.coins as number[])),
    explanation: (context) =>
      `სურათზე ${context.answer} მონეტაა, მათი ჯამი კი ${total(context.vars.coins as number[])} თეთრია.`,
  }),

  /**
   * Q8 — a mixed purse, as a choice.
   *
   * The prompt is deliberately fixed: the whole content is the drawn purse, so
   * the picture is what makes one variation different from the next.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-1-count-purse', subtopicId: 'monetebis-vertoba', difficulty: 3 }),
    prompt: 'დათვალე, რამდენი თეთრია ყულაბაში.',
    variables: {
      coins: {
        kind: 'list',
        pick: { values: [...COINS], length: { min: 3, max: 6 }, unique: false },
      },
    },
    constraints: [
      { test: (v: Vars) => total(v.coins as number[]) <= 100, note: 'the purse stays under a lari' },
      { test: (v: Vars) => new Set(v.coins as number[]).size >= 2, note: 'a mixed purse, not one coin repeated' },
    ],
    answer: (v: Vars) => amountText(total(v.coins as number[])),
    options: (v: Vars) => {
      const coins = v.coins as number[];
      const sum = total(coins);
      return amountOptions(sum, [sum + 5, sum - 5, sum + 10, sum - 10, sum + 1, sum - 1]);
    },
    format: { kind: 'text' },
    visual: (v: Vars) => coinRow(canonical(v.coins as number[])),
    explanation: (context) => {
      const coins = canonical(context.vars.coins as number[]);
      return `${coins.join(' + ')} = ${context.answer}.`;
    },
  }),

  /**
   * Q9 — pay an amount with exactly two coins.
   *
   * The options are printed pairs, so the child compares sums rather than
   * hunting for coins; every pair is a real pair of real coins.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-1-make-amount-two', subtopicId: 'monetebis-vertoba', difficulty: 3 }),
    prompt: '{amount} თეთრის გადასახდელად რომელი ორი მონეტა გჭირდება?',
    variables: {
      amount: {
        kind: 'choice',
        values: [6, 7, 10, 11, 12, 15, 21, 25, 30, 40, 55, 60],
      },
    },
    answer: (v: Vars) => combinationText(coinPairs(Number(v.amount))[0]!),
    options: (v: Vars) => {
      const amount = Number(v.amount);
      const right = coinPairs(amount)[0]!;
      return [combinationText(right), ...wrongPairs(amount, right)];
    },
    format: { kind: 'text' },
    visual: (v: Vars) => amountTag(Number(v.amount)),
    explanation: (context) => `${context.answer} = ${context.vars.amount} თეთრი.`,
  }),

  /**
   * Q10 — „which row is worth the same“, the bridge into U14.3.
   *
   * Exactly one option totals the amount: a second row that also did would be a
   * second right answer, so every candidate is checked against the total.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-1-value-two-ways', subtopicId: 'monetebis-vertoba', difficulty: 3 }),
    prompt: 'რომელი რიგი ღირს იგივე, რაც {amount} თეთრი?',
    variables: {
      amount: { kind: 'choice', values: [10, 15, 20, 25, 30, 40, 50] },
    },
    answer: (v: Vars) => {
      const amount = Number(v.amount);
      const row = coinCombinations(amount).find((set) => set.length >= 2) ?? minCoinSet(amount);
      return combinationText(row);
    },
    options: (v: Vars) => {
      const amount = Number(v.amount);
      const right = coinCombinations(amount).find((set) => set.length >= 2) ?? minCoinSet(amount);
      const wrongs: string[] = [];
      for (const delta of [1, -1, 5, -5, 2]) {
        for (const set of coinCombinations(amount + delta)) {
          if (set.length < 2) continue;
          if (total(set) === amount) continue;
          const text = combinationText(set);
          if (!wrongs.includes(text)) wrongs.push(text);
        }
      }
      return [combinationText(right), ...wrongs.slice(0, 3)];
    },
    format: { kind: 'text' },
    visual: (v: Vars) => amountTag(Number(v.amount)),
    explanation: (context) => `${context.answer} = ${context.vars.amount} თეთრი.`,
  }),
];

/**
 * Three wrong coin pairs to sit beside the right one.
 *
 * Drawn from **every** pair of two different coins, ranked by how close their
 * total is to the amount — so the wrong options are the near-misses a child
 * produces (one coin swapped) rather than a distant combination. Enumerating
 * only the pairs of `amount ± 1 ± 2` was not enough: some amounts have one
 * neighbour and the question came out with two or three options.
 *
 * Pairs of *different* coins only, because the template asks „which two
 * different coins“; offering `5 + 5` would be a right-shaped answer to a
 * question that excludes it.
 */
function wrongPairs(target: number, right: readonly [number, number], count = 3): string[] {
  const all: Array<{ text: string; gap: number }> = [];
  for (let i = 0; i < COINS.length; i += 1) {
    for (let j = i + 1; j < COINS.length; j += 1) {
      const [a, b] = [COINS[i]!, COINS[j]!];
      if (a + b === target) continue;
      all.push({ text: combinationText([a, b]), gap: Math.abs(a + b - target) });
    }
  }
  all.sort((x, y) => x.gap - y.gap || x.text.localeCompare(y.text));
  const out: string[] = [];
  for (const entry of all) {
    if (out.length >= count) break;
    if (entry.text !== combinationText(right) && !out.includes(entry.text)) out.push(entry.text);
  }
  return out;
}

/** The two most expensive things the purse can afford, and two it cannot. */
function shopOptions(paid: number): string[] {
  const affordable = GOODS.filter((good) => good.price <= paid).slice(-2).map((good) => good.nom);
  const tooDear = GOODS.filter((good) => good.price > paid).slice(0, 2).map((good) => good.nom);
  return [...affordable, ...tooDear];
}

/* ================================================================== *\
 * U14.2 — ფულის ამოცანები (Q11–Q14, Q17–Q18, Q20–Q21, Q23–Q25)
 * ================================================================== */

/** A drawn price, and the good it belongs to. The two are always consistent. */
const drawnGood = (goods: readonly Good[]) => ({
  good: { kind: 'choice' as const, values: goods.map((good) => good.nom) },
  price: {
    kind: 'choice' as const,
    values: (vars: Vars) => [
      String(goods.find((good) => good.nom === vars.good)!.price),
    ],
  },
});

const u142: QuestionTemplate[] = [
  /** Q11 — one price, read. The price is printed; the question is recognition. */
  defineTemplate({
    ...address({ id: 'g1-u14-2-one-price', subtopicId: 'fulis-amocanebi', difficulty: 1 }),
    prompt: 'მაღაზიაში {good} ღირს {price} თეთრი. რა ღირს {good}?',
    variables: drawnGood(GOODS),
    answer: (v: Vars) => Number(v.price),
    format: { kind: 'integer', min: 1, max: 50, entry: true },
    explanation: (context) => `${context.vars.good} ღირს ${context.answer} თეთრი.`,
  }),

  /** Q12 — two prices: `a + b`, typed. */
  defineTemplate({
    ...address({ id: 'g1-u14-2-two-prices', subtopicId: 'fulis-amocanebi', difficulty: 1 }),
    prompt: '{first} ღირს {a} თეთრი, {second} კი — {b} თეთრი. რა ღირს ორივე ერთად?',
    variables: {
      items: goodsSpec(2),
      first: { kind: 'choice', values: (v: Vars) => [(v.items as string[])[0]!] },
      second: { kind: 'choice', values: (v: Vars) => [(v.items as string[])[1]!] },
      a: { kind: 'choice', values: (v: Vars) => [String(priceOf((v.items as string[])[0]!))] },
      b: { kind: 'choice', values: (v: Vars) => [String(priceOf((v.items as string[])[1]!))] },
    },
    constraints: [
      {
        test: (v: Vars) => priceOf((v.items as string[])[0]!) + priceOf((v.items as string[])[1]!) <= 60,
        note: 'a price a child can add',
      },
      {
        test: (v: Vars) => priceOf((v.items as string[])[0]!) !== priceOf((v.items as string[])[1]!),
        note: 'two different prices, or the question has no answer',
      },
    ],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 4, max: 60, entry: true },
    explanation: (context) => `${context.vars.a} + ${context.vars.b} = ${context.answer} თეთრი.`,
  }),

  /** Q13 — three prices: `a + b + c`. */
  defineTemplate({
    ...address({ id: 'g1-u14-2-three-prices', subtopicId: 'fulis-amocanebi', difficulty: 2 }),
    prompt: '{first} ღირს {a} თეთრი, {second} — {b} თეთრი, {third} — {c} თეთრი. რა ღირს სამივე ერთად?',
    variables: {
      items: goodsSpec(3),
      first: { kind: 'choice', values: (v: Vars) => [(v.items as string[])[0]!] },
      second: { kind: 'choice', values: (v: Vars) => [(v.items as string[])[1]!] },
      third: { kind: 'choice', values: (v: Vars) => [(v.items as string[])[2]!] },
      a: { kind: 'choice', values: (v: Vars) => [String(priceOf((v.items as string[])[0]!))] },
      b: { kind: 'choice', values: (v: Vars) => [String(priceOf((v.items as string[])[1]!))] },
      c: { kind: 'choice', values: (v: Vars) => [String(priceOf((v.items as string[])[2]!))] },
    },
    constraints: [
      {
        test: (v: Vars) => (v.items as string[]).reduce((sum, nom) => sum + priceOf(nom), 0) <= 30,
        note: 'three things, a total a six-year-old can add',
      },
    ],
    answer: (v: Vars) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 6, max: 30, entry: true },
    explanation: (context) =>
      `${context.vars.a} + ${context.vars.b} + ${context.vars.c} = ${context.answer} თეთრი.`,
  }),

  /** Q14 — change from one purchase: `m − p`, with `m > p` by construction. */
  defineTemplate({
    ...address({ id: 'g1-u14-2-change-one', subtopicId: 'fulis-amocanebi', difficulty: 2 }),
    prompt: '{good} ღირს {price} თეთრი. გაქვს {paid} თეთრი. რამდენი თეთრი დაგრჩება?',
    variables: {
      paid: { kind: 'choice', values: [20, 25, 30, 40, 50, 60, 70, 80, 90, 100] },
      price: {
        kind: 'choice',
        values: (v: Vars) => GOODS.filter((good) => good.price < Number(v.paid)).map((good) => good.price),
      },
      good: {
        kind: 'choice',
        values: (v: Vars) => [String(GOODS.find((good) => good.price === Number(v.price))!.nom)],
      },
    },
    answer: (v: Vars) => Number(v.paid) - Number(v.price),
    format: { kind: 'integer', min: 1, max: 99, entry: true },
    explanation: (context) => `${context.vars.paid} − ${context.vars.price} = ${context.answer} თეთრი.`,
  }),

  /** Q17 — how much is missing: `p − m`, with `m < p` by construction. */
  defineTemplate({
    ...address({ id: 'g1-u14-2-how-much-short', subtopicId: 'fulis-amocanebi', difficulty: 2 }),
    prompt: '{good} ღირს {price} თეთრი. გაქვს {paid} თეთრი. რამდენი თეთრი გაკლია?',
    variables: {
      // The price comes from the shop, never from a number of its own: a prompt
      // saying „რვეული ღირს 30 თეთრი“ when the unit's price list says 20 is a
      // question that tests nothing and contradicts the lesson.
      good: { kind: 'choice', values: GOODS.filter((good) => good.price >= 20).map((good) => good.nom) },
      price: { kind: 'choice', values: (v: Vars) => [String(priceOf(String(v.good)))] },
      paid: { kind: 'choice', values: [5, 10, 15] },
    },
    answer: (v: Vars) => Number(v.price) - Number(v.paid),
    format: { kind: 'integer', min: 1, max: 60, entry: true },
    explanation: (context) => `${context.vars.price} − ${context.vars.paid} = ${context.answer} თეთრი გაკლია.`,
  }),

  /** Q18 — change after two purchases: `m − a − b`. */
  defineTemplate({
    ...address({ id: 'g1-u14-2-change-after-two', subtopicId: 'fulis-amocanebi', difficulty: 3 }),
    prompt: '{first} ღირს {a} თეთრი, {second} — {b} თეთრი. ორივეს ყიდულობ და გაქვს {paid} თეთრი. რამდენი დაგრჩება?',
    variables: {
      items: goodsSpec(2),
      first: { kind: 'choice', values: (v: Vars) => [(v.items as string[])[0]!] },
      second: { kind: 'choice', values: (v: Vars) => [(v.items as string[])[1]!] },
      a: { kind: 'choice', values: (v: Vars) => [String(priceOf((v.items as string[])[0]!))] },
      b: { kind: 'choice', values: (v: Vars) => [String(priceOf((v.items as string[])[1]!))] },
      paid: {
        kind: 'choice',
        values: (v: Vars) => {
          const sum = Number(v.a) + Number(v.b);
          return [sum, sum + 5, sum + 10];
        },
      },
    },
    answer: (v: Vars) => Number(v.paid) - Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, max: 30, entry: true },
    explanation: (context) => {
      const sum = Number(context.vars.a) + Number(context.vars.b);
      return `ორივე ერთად ${sum} თეთრია, ამიტომ ${context.vars.paid} − ${sum} = ${context.answer} თეთრი.`;
    },
  }),

  /** Q21 — change after three purchases: `m − a − b − c`. */
  defineTemplate({
    ...address({ id: 'g1-u14-2-three-item-change', subtopicId: 'fulis-amocanebi', difficulty: 3 }),
    prompt: '{first} ღირს {a} თეთრი, {second} — {b} თეთრი, {third} — {c} თეთრი. გაქვს {paid} თეთრი. სამივეს იყიდი. რამდენი დაგრჩება?',
    variables: {
      items: goodsSpec(3),
      first: { kind: 'choice', values: (v: Vars) => [(v.items as string[])[0]!] },
      second: { kind: 'choice', values: (v: Vars) => [(v.items as string[])[1]!] },
      third: { kind: 'choice', values: (v: Vars) => [(v.items as string[])[2]!] },
      a: { kind: 'choice', values: (v: Vars) => [String(priceOf((v.items as string[])[0]!))] },
      b: { kind: 'choice', values: (v: Vars) => [String(priceOf((v.items as string[])[1]!))] },
      c: { kind: 'choice', values: (v: Vars) => [String(priceOf((v.items as string[])[2]!))] },
      paid: {
        kind: 'choice',
        values: (v: Vars) => {
          const sum = Number(v.a) + Number(v.b) + Number(v.c);
          return [sum, sum + 10];
        },
      },
    },
    answer: (v: Vars) => Number(v.paid) - Number(v.a) - Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 0, max: 20, entry: true },
    explanation: (context) => {
      const sum = Number(context.vars.a) + Number(context.vars.b) + Number(context.vars.c);
      return `სამივე ერთად ${sum} თეთრია, ამიტომ ${context.vars.paid} − ${sum} = ${context.answer} თეთრი.`;
    },
  }),

  /** Q20 — which of three things is the most expensive. */
  defineTemplate({
    ...address({ id: 'g1-u14-2-most-expensive', subtopicId: 'fulis-amocanebi', difficulty: 1 }),
    prompt: 'რომელი ნივთია ყველაზე ძვირი: {first}, {second} თუ {third}?',
    variables: {
      picks: {
        kind: 'list',
        pick: { values: GOODS.map((good) => good.nom), length: 3, unique: true },
      },
      first: { kind: 'choice', values: (v: Vars) => [(v.picks as string[])[0]!] },
      second: { kind: 'choice', values: (v: Vars) => [(v.picks as string[])[1]!] },
      third: { kind: 'choice', values: (v: Vars) => [(v.picks as string[])[2]!] },
    },
    constraints: [
      {
        test: (v: Vars) => {
          const prices = (v.picks as string[]).map((nom) => priceOf(nom));
          return new Set(prices).size === prices.length;
        },
        note: 'three different prices, so „the dearest“ is one thing',
      },
    ],
    answer: (v: Vars) => {
      const priced = (v.picks as string[])
        .map((nom) => GOODS.find((good) => good.nom === nom)!)
        .sort((a, b) => b.price - a.price);
      return priced[0]!.nom;
    },
    options: (v: Vars) => [...(v.picks as string[])],
    format: { kind: 'text' },
    optionCount: 3,
    explanation: (context) => {
      const priced = (context.vars.picks as string[])
        .map((nom) => GOODS.find((good) => good.nom === nom)!)
        .sort((a, b) => b.price - a.price);
      return `${priced.map((good) => `${good.nom} — ${good.price}`).join(', ')}. ყველაზე ძვირია ${context.answer}.`;
    },
  }),

  /** Q23 — top up to a price: `t − a`, how much more money is needed. */
  defineTemplate({
    ...address({ id: 'g1-u14-2-top-up', subtopicId: 'fulis-amocanebi', difficulty: 3 }),
    prompt: '{good} ღირს {price} თეთრი. ყულაბაში გაქვს {saved} თეთრი. რამდენი უნდა დაამატო, რომ იყიდო?',
    variables: {
      good: { kind: 'choice', values: GOODS.filter((good) => good.price >= 20).map((good) => good.nom) },
      price: { kind: 'choice', values: (v: Vars) => [String(priceOf(String(v.good)))] },
      saved: { kind: 'choice', values: (v: Vars) => [5, 10, 15].filter((value) => value < Number(v.price)) },
    },
    answer: (v: Vars) => Number(v.price) - Number(v.saved),
    format: { kind: 'integer', min: 1, max: 55, entry: true },
    explanation: (context) =>
      `${context.vars.price} − ${context.vars.saved} = ${context.answer} თეთრი უნდა დაამატო.`,
  }),

  /** Q24 — the difference between two prices: `a − b`, with `a > b`. */
  defineTemplate({
    ...address({ id: 'g1-u14-2-price-difference', subtopicId: 'fulis-amocanebi', difficulty: 2 }),
    prompt: '{dear} ღირს {a} თეთრი, {cheap} კი — {b} თეთრი. რამდენი თეთრით ძვირია {dear}?',
    variables: {
      items: goodsSpec(2),
      // Which of the two is dearer is a fact about the drawn pair, so it is
      // decided from their prices rather than assumed: „which is dearer“ must
      // never depend on which name came out of the draw first.
      dear: {
        kind: 'choice',
        values: (v: Vars) => {
          const [first, second] = v.items as string[];
          return [priceOf(first!) >= priceOf(second!) ? first! : second!];
        },
      },
      cheap: {
        kind: 'choice',
        values: (v: Vars) => {
          const [first, second] = v.items as string[];
          return [priceOf(first!) >= priceOf(second!) ? second! : first!];
        },
      },
      a: { kind: 'choice', values: (v: Vars) => [String(priceOf(String(v.dear)))] },
      b: { kind: 'choice', values: (v: Vars) => [String(priceOf(String(v.cheap)))] },
    },
    constraints: [
      { test: (v: Vars) => Number(v.a) > Number(v.b), note: 'the dear one really is dearer' },
      { test: (v: Vars) => Number(v.a) <= 60, note: 'price under sixty' },
    ],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 1, max: 55, entry: true },
    explanation: (context) => `${context.vars.a} − ${context.vars.b} = ${context.answer} თეთრით ძვირია.`,
  }),

  /** Q25 — split evenly between two children: `m ÷ 2`, `m` even by construction. */
  defineTemplate({
    ...address({ id: 'g1-u14-2-split-evenly', subtopicId: 'fulis-amocanebi', difficulty: 2 }),
    prompt: 'ანას და ლევანს სულ {money} თეთრი აქვთ. თანხას თანაბრად ინაწილებენ. რამდენი თეთრი ერგება თითოეულს?',
    variables: {
      money: { kind: 'choice', values: [10, 20, 30, 40, 50, 60, 70, 80] },
    },
    answer: (v: Vars) => Number(v.money) / 2,
    format: { kind: 'integer', min: 5, max: 40, entry: true },
    explanation: (context) => `${context.vars.money} ÷ 2 = ${context.answer} თეთრი ერგება თითოეულს.`,
  }),
];

/* ================================================================== *\
 * U14.2 — საკმარისია თუ არა? (Q15, Q16, Q19, Q22)
 * ================================================================== */

const u142b: QuestionTemplate[] = [
  /**
   * Q15 — is the purse enough for one thing? Yes/no.
   *
   * Both outcomes occur by construction (`side`), so a child who always answers
   * „კი“ scores about half — the question cannot be beaten by guessing in one
   * direction.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-2-enough-for-one', subtopicId: 'sakmarisi-fuli', difficulty: 1 }),
    prompt: 'გაქვს {paid} თეთრი. {good} ღირს {price} თეთრი. საკმარისია ეს თანხა?',
    variables: {
      side: { kind: 'choice', values: ['yes', 'no'] },
      // Capped at 30 so that „no“ always has a dearer good to draw: the shop's
      // most expensive item is 50, and a purse of 60 would leave nothing to be
      // short of.
      paid: { kind: 'choice', values: [5, 10, 15, 20, 25, 30] },
      // The good is drawn first and its price read off the shop's list, so the
      // two can never disagree. `side` decides which goods are eligible, which
      // is what keeps „yes“ and „no“ equally common.
      good: { kind: 'choice', values: (v: Vars) => goodsWithin(Number(v.paid), String(v.side)) },
      price: { kind: 'choice', values: (v: Vars) => [String(priceOf(String(v.good)))] },
    },
    answer: (v: Vars) => (Number(v.paid) >= Number(v.price) ? 'კი' : 'არა'),
    options: (v: Vars) =>
      Number(v.paid) >= Number(v.price) ? ['კი', 'არა'] : ['არა', 'კი'],
    format: { kind: 'text' },
    optionCount: 2,
    visual: (v: Vars) => coinRow(purseOf(Number(v.paid))),
    explanation: (context) =>
      `${context.vars.paid} ${Number(context.vars.paid) >= Number(context.vars.price) ? '≥' : '<'} ${context.vars.price}, ამიტომ პასუხია „${context.answer}“.`,
  }),

  /**
   * Q16 — is the purse enough for **two** things together?
   *
   * The addition has to happen before the comparison, which is what raises this
   * above Q15.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-2-enough-for-two', subtopicId: 'sakmarisi-fuli', difficulty: 3 }),
    prompt: '{first} ღირს {a} თეთრი, {second} — {b} თეთრი. გაქვს {paid} თეთრი. საკმარისია ორივესთვის?',
    variables: {
      side: { kind: 'choice', values: ['yes', 'no'] },
      a: { kind: 'choice', values: [5, 10, 12, 15] },
      b: { kind: 'choice', values: [5, 10, 12, 15] },
      paid: {
        kind: 'choice',
        values: (v: Vars) => {
          const sum = Number(v.a) + Number(v.b);
          return v.side === 'yes' ? [sum, sum + 5, sum + 10] : [sum - 5, sum - 2, sum - 10].filter((value) => value > 0);
        },
      },
      first: { kind: 'choice', values: ['ფანქარი', 'საშლელი'] },
      second: { kind: 'choice', values: ['რვეული', 'სახაზავი'] },
    },
    answer: (v: Vars) => (Number(v.paid) >= Number(v.a) + Number(v.b) ? 'კი' : 'არა'),
    options: (v: Vars) => {
      const enough = Number(v.paid) >= Number(v.a) + Number(v.b);
      return enough ? ['კი', 'არა'] : ['არა', 'კი'];
    },
    format: { kind: 'text' },
    optionCount: 2,
    visual: (v: Vars) => coinRow(purseOf(Number(v.paid))),
    explanation: (context) => {
      const sum = Number(context.vars.a) + Number(context.vars.b);
      return `ორივე ერთად ${sum} თეთრია, ${context.vars.paid} ${Number(context.vars.paid) >= sum ? '≥' : '<'} ${sum}, ამიტომ პასუხია „${context.answer}“.`;
    },
  }),

  /**
   * Q19 — **mark every item you can buy.** Multi-select, as specified.
   *
   * Exactly two of the four offered items are affordable, so one right mark is
   * never the whole answer; the set is.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-2-what-can-i-buy', subtopicId: 'sakmarisi-fuli', difficulty: 3 }),
    prompt: 'გაქვს {paid} თეთრი. აირჩიე ყველა ის ნივთი, რომლის ყიდვაც შეგიძლია.',
    variables: {
      paid: { kind: 'choice', values: [10, 15, 20, 25] },
    },
    answer: (v: Vars) => shopOptions(Number(v.paid)).slice(0, 2).join(', '),
    options: (v: Vars) => shopOptions(Number(v.paid)),
    multi: {},
    format: { kind: 'text' },
    visual: (v: Vars) => coinRow(purseOf(Number(v.paid))),
    explanation: (context) => {
      const paid = Number(context.vars.paid);
      const list = shopOptions(paid)
        .slice(0, 2)
        .map((nom) => `${nom} (${GOODS.find((good) => good.nom === nom)!.price})`)
        .join(', ');
      return `${context.vars.paid} თეთრით იყიდი: ${list}. დანარჩენი ნივთები უფრო ძვირია.`;
    },
  }),

  /**
   * Q22 — **which pairs of things can you buy together?** Multi-select over
   * pairs, which is what „two items affordable“ means when both must fit in one
   * purse.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-2-two-affordable', subtopicId: 'sakmarisi-fuli', difficulty: 2 }),
    prompt: 'გაქვს {paid} თეთრი. აირჩიე ყველა წყვილი, რომლის ყიდვაც ერთად შეგიძლია.',
    variables: {
      paid: { kind: 'choice', values: [15, 20, 25, 30, 35, 40] },
      offset: { kind: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
    },
    answer: (v: Vars) => {
      const paid = Number(v.paid);
      const offset = Number(v.offset);
      const pairs = pairOptions(paid, offset);
      return pairs
        .filter((pair) => pair.sum <= paid)
        .map((pair) => pair.text)
        .join(', ');
    },
    options: (v: Vars) =>
      pairOptions(Number(v.paid), Number(v.offset)).map((pair) => pair.text),
    constraints: [
      {
        // A purse that could afford everything (or nothing) has no two fitting
        // and two that do not, so those draws are rejected before `options` is
        // ever called — `options` may not throw and may not return an empty set.
        test: (v: Vars) => pairOptions(Number(v.paid), Number(v.offset)).length === 4,
        note: 'two pairs that fit and two that do not',
      },
    ],
    multi: {},
    format: { kind: 'text' },
    // The picture carries the purse *and a price list*. The purse alone is not
    // enough: „which pairs can I afford together?“ is unanswerable without the
    // prices, and the options list only the goods, never what they cost. The
    // price list also separates two variations that share a purse — without it
    // the session's de-dup key sees one question and the queue runs dry.
    visual: (v: Vars) => {
      const paid = Number(v.paid);
      const goods = new Set<string>();
      for (const pair of pairOptions(paid, Number(v.offset))) {
        for (const name of pair.text.split(' და ')) goods.add(name);
      }
      const lines = GOODS.filter((good) => goods.has(good.nom))
        .sort((a, b) => a.price - b.price)
        .map((good) => `${good.nom} — ${good.price}`);
      return `${coinRow(purseOf(paid))}\n\n${lines.join('\n')}`;
    },
    explanation: (context) => {
      const paid = Number(context.vars.paid);
      const pairs = pairOptions(paid, Number(context.vars.offset)).filter((pair) => pair.sum <= paid);
      return `ერთად ეტევა: ${pairs.map((pair) => `${pair.text} — ${pair.sum}`).join(', ')}.`;
    },
  }),
];

/**
 * Four pairs of goods for the „which pairs fit“ question, two of which fit.
 *
 * Built from the drawn purse so the two fitting pairs are cheap enough and the
 * two that do not fit are dear enough — the question then has exactly one right
 * *set*, and the offset makes several different screens from one purse.
 */
function pairOptions(paid: number, offset: number): Array<{ text: string; sum: number }> {
  const pair = (first: Good, second: Good) => ({
    text: `${first.nom} და ${second.nom}`,
    sum: first.price + second.price,
  });

  // Every *frugal* pair — 2 + 6, not 2 + 50 — because a question whose fitting
  // pairs are all „ლურსმანი და …“ teaches nothing; the child marks by price, and
  // the pairs have to differ in price and in kind.
  const all: Array<{ text: string; sum: number }> = [];
  for (let i = 0; i < GOODS.length; i += 1) {
    for (let j = i + 1; j < GOODS.length; j += 1) {
      if (GOODS[i]!.price + GOODS[j]!.price > 45) continue;
      all.push(pair(GOODS[i]!, GOODS[j]!));
    }
  }
  all.sort((a, b) => a.sum - b.sum || a.text.localeCompare(b.text));

  // Two that fit, two that do not, chosen by a sliding window over each side.
  // `offset` is the window's start, so one purse yields many different screens —
  // this template is one of only four in its subtopic, and a single fixed set of
  // four options gave the level six distinct questions in total.
  const fit = all.filter((entry) => entry.sum <= paid);
  const miss = all.filter((entry) => entry.sum > paid);
  if (fit.length < 2 || miss.length < 2) return [];
  const window = (pool: Array<{ text: string; sum: number }>) => {
    const start = offset % (pool.length - 1);
    return [pool[start]!, pool[start + 1]!];
  };
  return [...window(fit), ...window(miss)];
}

/* ================================================================== *\
 * U14.3 — ტოლღირებული მონეტები (Q26–Q35, Q37–Q40 minus Q36)
 * ================================================================== */

const u143: QuestionTemplate[] = [
  /**
   * Q26, Q28, Q32 — „how many of this coin make that coin?“.
   *
   * The general form, drawn from a coin and a multiplier rather than from two
   * independent values: `target = coin × count` is always exact, so the answer is
   * a whole number without a rejection loop.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-3-how-many-fit', subtopicId: 'tolzRvari-monetebi', difficulty: 1 }),
    prompt: '{target} თეთრი რამდენ {coin}-თეთრიან მონეტას უდრის?',
    variables: {
      coin: { kind: 'choice', values: [2, 5, 10] },
      count: { kind: 'choice', values: [2, 3, 4, 5] },
      target: { kind: 'choice', values: (v: Vars) => [Number(v.coin) * Number(v.count)] },
    },
    answer: (v: Vars) => Number(v.target) / Number(v.coin),
    format: { kind: 'integer', min: 2, max: 5, entry: true },
    visual: (v: Vars) => amountTag(Number(v.target)),
    explanation: (context) => `${context.vars.target} ÷ ${context.vars.coin} = ${context.answer} მონეტა.`,
  }),

  /** Q29 — tens inside a round amount: `t ÷ 10`. */
  defineTemplate({
    ...address({ id: 'g1-u14-3-tens-in-target', subtopicId: 'tolzRvari-monetebi', difficulty: 1 }),
    prompt: '{target} თეთრი რამდენ 10-თეთრიან მონეტას უდრის?',
    variables: {
      target: { kind: 'choice', values: [20, 30, 40, 50, 60, 70, 80, 90, 100] },
    },
    answer: (v: Vars) => Number(v.target) / 10,
    format: { kind: 'integer', min: 2, max: 10, entry: true },
    visual: (v: Vars) => amountTag(Number(v.target)),
    explanation: (context) => `${context.vars.target} ÷ 10 = ${context.answer}.`,
  }),

  /** Q31 — make an amount from two **different** coins. */
  defineTemplate({
    ...address({ id: 'g1-u14-3-two-different-coins', subtopicId: 'tolzRvari-monetebi', difficulty: 2 }),
    prompt: 'რომელი ორი სხვადასხვა მონეტა იძლევა {amount} თეთრს?',
    variables: {
      amount: { kind: 'choice', values: [7, 11, 12, 15, 21, 25, 30, 40, 52, 60] },
    },
    answer: (v: Vars) => {
      const pair = coinPairs(Number(v.amount)).find(([a, b]) => a !== b)!;
      return combinationText(pair);
    },
    options: (v: Vars) => {
      const amount = Number(v.amount);
      const right = coinPairs(amount).find(([a, b]) => a !== b)!;
      return [combinationText(right), ...wrongPairs(amount, right)];
    },
    format: { kind: 'text' },
    visual: (v: Vars) => amountTag(Number(v.amount)),
    explanation: (context) => {
      const [a, b] = coinPairs(Number(context.vars.amount)).find(([x, y]) => x !== y)!;
      return `${a} + ${b} = ${context.vars.amount} თეთრი.`;
    },
  }),

  /**
   * Q37 — pay with a bigger coin and get change: `big − price`.
   *
   * This is where „equivalent coins“ becomes a payment: the child has a
   * 50-თეთრიანი and the thing costs 35, so the answer is `50 − 35`, not a
   * division.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-3-change-from-big-coin', subtopicId: 'tolzRvari-monetebi', difficulty: 2 }),
    prompt: '{good} ღირს {price} თეთრი. გადაიხადე {big}-თეთრიანი მონეტით. რამდენს დაგიბრუნებენ?',
    variables: {
      big: { kind: 'choice', values: [20, 50] },
      // The good comes first and its price is read off the shop's list, so the
      // prompt cannot claim a სახაზავი costs 5 when the shop charges 12.
      good: {
        kind: 'choice',
        values: (v: Vars) => GOODS.filter((good) => good.price < Number(v.big)).map((good) => good.nom),
      },
      price: { kind: 'choice', values: (v: Vars) => [String(priceOf(String(v.good)))] },
    },
    answer: (v: Vars) => Number(v.big) - Number(v.price),
    format: { kind: 'integer', min: 5, max: 45, entry: true },
    visual: (v: Vars) => coinRow([Number(v.big)]),
    explanation: (context) => `${context.vars.big} − ${context.vars.price} = ${context.answer} თეთრი დაგიბრუნებენ.`,
  }),

  /**
   * Q26 — one big coin against a row of small ones: „which row is worth the
   * same as this coin?“
   *
   * The heart of the subtopic, and deliberately separate from „how many Ns make
   * this coin“: that asks for a count, this offers *different combinations* —
   * 50 is 20 + 20 + 10 and also 10 + 10 + 10 + 10 + 10 — so the child compares
   * totals rather than repeating one coin.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-3-one-coin-many', subtopicId: 'tolzRvari-monetebi', difficulty: 2 }),
    prompt: 'რომელი რიგი ღირს იგივე, რაც ეს მონეტა?',
    variables: {
      coin: { kind: 'choice', values: [5, 10, 20, 50] },
    },
    answer: (v: Vars) => {
      const coin = Number(v.coin);
      // A row of at least two coins, so the answer is never the coin itself.
      const row = coinCombinations(coin).find((set) => set.length >= 2) ?? minCoinSet(coin);
      return combinationText(row);
    },
    options: (v: Vars) => {
      const coin = Number(v.coin);
      const right = coinCombinations(coin).find((set) => set.length >= 2) ?? minCoinSet(coin);
      const wrongs: string[] = [];
      for (const delta of [1, -1, 5, -5]) {
        for (const set of coinCombinations(coin + delta)) {
          if (set.length < 2 || total(set) === coin) continue;
          const text = combinationText(set);
          if (!wrongs.includes(text)) wrongs.push(text);
        }
      }
      return [combinationText(right), ...wrongs.slice(0, 3)];
    },
    format: { kind: 'text' },
    visual: (v: Vars) => coinRow([Number(v.coin)]),
    explanation: (context) => `${context.answer} = ${context.vars.coin} თეთრი.`,
  }),

  /**
   * Q33 — which combination equals a target.
   *
   * The wrong rows are real amounts one coin away, so the question cannot be
   * answered by counting coins — only by adding them.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-3-which-combination', subtopicId: 'tolzRvari-monetebi', difficulty: 3 }),
    prompt: 'რომელი კომბინაცია უდრის {target} თეთრს?',
    variables: {
      target: { kind: 'choice', values: [15, 20, 25, 30, 35, 40, 45, 50, 60, 70] },
    },
    answer: (v: Vars) => combinationText(minCoinSet(Number(v.target))),
    options: (v: Vars) => {
      const target = Number(v.target);
      const right = minCoinSet(target);
      const wrongs: string[] = [];
      for (const delta of [5, -5, 10, -10, 1, -1]) {
        const amount = target + delta;
        if (amount <= 0 || amount > 100) continue;
        const set = minCoinSet(amount);
        if (total(set) === target) continue;
        const text = combinationText(set);
        if (!wrongs.includes(text)) wrongs.push(text);
      }
      return [combinationText(right), ...wrongs.slice(0, 3)];
    },
    format: { kind: 'text' },
    visual: (v: Vars) => amountTag(Number(v.target)),
    explanation: (context) => `${context.answer} = ${context.vars.target} თეთრი.`,
  }),

  /**
   * Q35 — **mark both ways** to pay an amount. Multi-select: two rows are
   * correct, two are one coin off.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-3-two-ways', subtopicId: 'tolzRvari-monetebi', difficulty: 3 }),
    prompt: '{amount} თეთრი ორი სხვადასხვა გზით შეიძლება გადაიხადო. აირჩიე ორივე სწორი რიგი.',
    variables: {
      amount: { kind: 'choice', values: [10, 15, 20, 25, 30, 40, 50] },
    },
    answer: (v: Vars) => {
      const amount = Number(v.amount);
      return coinCombinations(amount)
        .filter((set) => set.length >= 1)
        .slice(0, 2)
        .map(combinationText)
        .join(', ');
    },
    options: (v: Vars) => {
      const amount = Number(v.amount);
      const right = coinCombinations(amount)
        .filter((set) => set.length >= 1)
        .slice(0, 2)
        .map(combinationText);
      const wrongs: string[] = [];
      for (const delta of [1, -1, 5, -5]) {
        for (const set of coinCombinations(amount + delta)) {
          if (total(set) === amount) continue;
          const text = combinationText(set);
          if (!right.includes(text) && !wrongs.includes(text)) wrongs.push(text);
        }
      }
      return [...right, ...wrongs.slice(0, 2)];
    },
    multi: {},
    format: { kind: 'text' },
    visual: (v: Vars) => amountTag(Number(v.amount)),
    explanation: (context) => `${context.answer} — ორივე ერთად ${context.vars.amount} თეთრია.`,
  }),

  /**
   * Q38 — compare two coin rows: which is worth more?
   *
   * Both amounts are real, so the child has to add each row and compare, not
   * count the coins.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-3-compare-combinations', subtopicId: 'tolzRvari-monetebi', difficulty: 3 }),
    prompt: 'რომელი რიგია უფრო ძვირი?',
    variables: {
      a: { kind: 'list', pick: { values: [...COINS], length: 2, unique: false } },
      b: { kind: 'list', pick: { values: [...COINS], length: 2, unique: false } },
    },
    constraints: [
      { test: (v: Vars) => total(v.a as number[]) !== total(v.b as number[]), note: 'not a tie' },
      { test: (v: Vars) => total(v.a as number[]) <= 100 && total(v.b as number[]) <= 100, note: 'small change' },
    ],
    answer: (v: Vars) => {
      const first = total(v.a as number[]);
      const second = total(v.b as number[]);
      return combinationText(first >= second ? (v.a as number[]) : (v.b as number[]));
    },
    options: (v: Vars) => [combinationText(canonical(v.a as number[])), combinationText(canonical(v.b as number[]))],
    format: { kind: 'text' },
    optionCount: 2,
    visual: (v: Vars) =>
      twoPurses({ label: '①', coins: canonical(v.a as number[]) }, { label: '②', coins: canonical(v.b as number[]) }),
    explanation: (context) => {
      const first = total(context.vars.a as number[]);
      const second = total(context.vars.b as number[]);
      return `① ${first} თეთრი, ② ${second} თეთრი, ამიტომ უფრო ძვირია ${context.answer}.`;
    },
  }),

  /**
   * Q39 — order three coin rows by value. Coin ordering: the items are rows,
   * so the child must add each before arranging them.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-3-order-rows', subtopicId: 'tolzRvari-monetebi', difficulty: 3 }),
    prompt: 'დაალაგე სამი რიგი ზრდადობით: ჯერ ყველაზე იაფი, ბოლოს — ყველაზე ძვირი.',
    variables: {
      items: {
        kind: 'list',
        pick: {
          values: ['1 თეთრი', '2 თეთრი', '5 თეთრი', '10 თეთრი', '20 თეთრი', '50 თეთრი'],
          length: 3,
          unique: true,
        },
      },
    },
    answer: (_v: Vars, ctx) => {
      const shown = (ctx.order ?? []).map((item) => Number.parseInt(item, 10));
      const sorted = [...shown].sort((a, b) => a - b);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    shuffle: { source: 'items', direction: 'asc' },
    format: { kind: 'text' },
    visual: (v: Vars) =>
      (v.items as string[])
        .map((item, index) => `#${index + 1}\n${coinRow([Number.parseInt(item, 10)])}`)
        .join('\n\n'),
    explanation: (context) => {
      const values = (context.vars.items as string[]).map((item) => Number.parseInt(item, 10)).sort((a, b) => a - b);
      return `უმცირესიდან: ${values.map((value) => `${value} თეთრი`).join(' < ')}.`;
    },
  }),

  /**
   * Q40 — how many different ways, counting order-free.
   *
   * `coinCombinations` enumerates combinations, so `10 + 5` and `5 + 10` are one
   * way by construction rather than by a rule somebody has to remember.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-3-number-of-ways', subtopicId: 'tolzRvari-monetebi', difficulty: 3 }),
    prompt: 'რამდენი განსხვავებული წყვილი მონეტა იძლევა {amount} თეთრს? რიგს მნიშვნელობა არ აქვს.',
    variables: {
      amount: { kind: 'choice', values: [3, 6, 7, 10, 12, 15, 21, 25, 30, 40, 52, 60] },
    },
    answer: (v: Vars) => coinPairs(Number(v.amount)).length,
    options: (v: Vars) => {
      const right = coinPairs(Number(v.amount)).length;
      const wrongs = [right + 1, right + 2, right - 1, right + 3].filter((value) => value > 0 && value !== right);
      return [String(right), ...[...new Set(wrongs.map(String))].slice(0, 3)];
    },
    format: { kind: 'text' },
    explanation: (context) => {
      const pairs = coinPairs(Number(context.vars.amount)).map(([a, b]) => `${a} + ${b}`);
      return `${context.vars.amount} თეთრს იძლევა ${pairs.join(', ')} — სულ ${context.answer} წყვილი.`;
    },
  }),
];

/* ================================================================== *\
 * U14.3 — ყველაზე ცოტა მონეტა (Q36 + two that compare coin rows)
 * ================================================================== */

const u143b: QuestionTemplate[] = [
  /**
   * „Which row pays this amount with the fewest coins?“
   *
   * Every option totals the amount exactly, so the only difference is how many
   * coins it takes — the question is about choosing, not about adding.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-3-fewest-row', subtopicId: 'yvelaze-cota-monetebi', difficulty: 1 }),
    prompt: '{amount} თეთრს რომელი რიგი გადაიხდის ყველაზე ცოტა მონეტით?',
    variables: {
      amount: { kind: 'choice', values: [10, 15, 20, 25, 30, 40, 50, 60, 70, 80] },
    },
    answer: (v: Vars) => combinationText(minCoinSet(Number(v.amount))),
    options: (v: Vars) => {
      const amount = Number(v.amount);
      const sets = coinCombinations(amount, 6).filter((set) => set.length >= 2);
      // One row of each length, so the shortest is unique.
      const byLength = new Map<number, number[]>();
      for (const set of sets) {
        if (!byLength.has(set.length)) byLength.set(set.length, set);
      }
      const rows = [...byLength.values()]
        .sort((a, b) => a.length - b.length)
        .slice(0, 4)
        .map(combinationText);
      return rows.includes(combinationText(minCoinSet(amount)))
        ? rows
        : [...rows.slice(0, 3), combinationText(minCoinSet(amount))];
    },
    format: { kind: 'text' },
    visual: (v: Vars) => amountTag(Number(v.amount)),
    explanation: (context) =>
      `${context.answer} — მხოლოდ ${minCoins(Number(context.vars.amount))} მონეტა. მეტი მონეტა ნიშნავს, რომ პატარა მონეტებით იხდი.`,
  }),

  /**
   * The greedy reasoning itself, as a question: „which coin should you take
   * first?“
   *
   * „Fewest coins“ is a rule a child has to *apply*, not just a number to
   * produce — and the rule is „take the biggest coin that still fits“. Asking
   * for the first coin, and then for the remainder, is the step that makes the
   * rule visible; a question that only ever asks for the final count hides it.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-3-biggest-coin-first', subtopicId: 'yvelaze-cota-monetebi', difficulty: 1 }),
    prompt: '{amount} თეთრის გადასახდელად რომელია ყველაზე დიდი მონეტა, რომელიც შეგიძლია აიღო?',
    variables: {
      amount: { kind: 'choice', values: [6, 7, 8, 9, 12, 13, 14, 16, 17, 18, 21, 22, 23, 24, 26, 27, 28, 29, 31, 32, 33, 34, 36, 37, 38, 39, 41, 44, 47, 48] },
    },
    answer: (v: Vars) => amountText(minCoinSet(Number(v.amount))[0]!),
    options: (v: Vars) => {
      const amount = Number(v.amount);
      const biggest = minCoinSet(amount)[0]!;
      // Every option is a real coin, and the biggest that fits is unique — a
      // second coin of the same value cannot exist in a set of six.
      const wrongs = COINS.filter((coin) => coin !== biggest)
        .sort((a, b) => Math.abs(a - amount) - Math.abs(b - amount))
        .map((coin) => amountText(coin));
      return [amountText(biggest), ...wrongs.slice(0, 3)];
    },
    format: { kind: 'text' },
    visual: (v: Vars) => amountTag(Number(v.amount)),
    explanation: (context) => {
      const amount = Number(context.vars.amount);
      const set = minCoinSet(amount);
      return `ყველაზე დიდი მონეტა, რომელიც ${amount} თეთრში ეტევა, არის ${set[0]} თეთრი. მთელი რიგი: ${set.join(' + ')}.`;
    },
  }),

  /**
   * The remainder after the biggest coin — the second step of the same rule.
   * „You paid 50, 15 is left over“ is what the greedy walk actually computes.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-3-remainder-after-big', subtopicId: 'yvelaze-cota-monetebi', difficulty: 2 }),
    prompt: '{amount} თეთრს ჯერ ყველაზე დიდი მონეტით იხდი — {big}-თეთრიანით. რამდენი თეთრი რჩება გადასახდელი?',
    variables: {
      amount: { kind: 'choice', values: [22, 24, 26, 27, 28, 29, 32, 34, 36, 37, 38, 39, 42, 44, 46, 47, 48] },
      big: { kind: 'choice', values: (v: Vars) => [String(minCoinSet(Number(v.amount))[0])] },
    },
    answer: (v: Vars) => Number(v.amount) - Number(v.big),
    format: { kind: 'integer', min: 1, max: 30, entry: true },
    visual: (v: Vars) => amountTag(Number(v.amount)),
    explanation: (context) => `${context.vars.amount} − ${context.vars.big} = ${context.answer} თეთრი რჩება.`,
  }),

  /**
   * Q36 — how many coins that is, typed. The complement of the question above:
   * the row is chosen there, counted here.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-3-min-coins-count', subtopicId: 'yvelaze-cota-monetebi', difficulty: 2 }),
    prompt: '{amount} თეთრის გადასახდელად ყველაზე ცოტა რამდენი მონეტა გჭირდება?',
    variables: {
      amount: { kind: 'choice', values: [6, 8, 12, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100] },
    },
    answer: (v: Vars) => minCoins(Number(v.amount)),
    format: { kind: 'integer', min: 1, max: 8, entry: true },
    visual: (v: Vars) => amountTag(Number(v.amount)),
    explanation: (context) =>
      `უმცირესი რაოდენობაა ${minCoinSet(Number(context.vars.amount)).join(' + ')} — სულ ${context.answer} მონეტა.`,
  }),

  /**
   * Can the amount be paid with **exactly** this many coins? Yes/no, and both
   * outcomes occur by construction.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-3-exactly-n-coins', subtopicId: 'yvelaze-cota-monetebi', difficulty: 3 }),
    prompt: '{amount} თეთრი შეიძლება ზუსტად {count} მონეტით გადაიხადო?',
    variables: {
      amount: { kind: 'choice', values: [7, 11, 12, 15, 17, 23, 25, 31, 40, 55] },
      count: {
        kind: 'choice',
        values: (v: Vars) => {
          const amount = Number(v.amount);
          const possible = new Set(coinCombinations(amount, 6).map((set) => set.length));
          const length = [...possible].sort((a, b) => a - b);
          // One count that works and one that does not, so the answer is not a
          // coin toss in one direction.
          return [length[0]!, length[length.length - 1]! + 1];
        },
      },
    },
    answer: (v: Vars) =>
      coinCombinations(Number(v.amount), 6).some((set) => set.length === Number(v.count)) ? 'კი' : 'არა',
    options: (v: Vars) =>
      coinCombinations(Number(v.amount), 6).some((set) => set.length === Number(v.count))
        ? ['კი', 'არა']
        : ['არა', 'კი'],
    format: { kind: 'text' },
    optionCount: 2,
    visual: (v: Vars) => amountTag(Number(v.amount)),
    explanation: (context) => {
      const ways = coinCombinations(Number(context.vars.amount), 6).filter(
        (set) => set.length === Number(context.vars.count),
      );
      return ways.length > 0
        ? `შეიძლება: ${ways.map(combinationText).join(', ')} — სულ ${context.vars.count} მონეტა.`
        : `${context.vars.amount} თეთრს ${context.vars.count} მონეტით ვერ გადაიხდი.`;
    },
  }),
];

/* ================================================================== *\
 * U14.4 — თანხების შედარება (Q41–Q50)
 * ================================================================== */

/** Two purses that are never equal, so „which is more“ always has one answer. */
const twoDifferentPurses = (): Record<string, VariableSpec> => ({
  a: { kind: 'list', pick: { values: [1, 2, 5, 10, 20], length: 2, unique: false } },
  b: { kind: 'list', pick: { values: [1, 2, 5, 10, 20], length: 2, unique: false } },
});

const DIFFERENT_PURSES = [
  { test: (v: Vars) => total(v.a as number[]) !== total(v.b as number[]), note: 'not a tie' },
  { test: (v: Vars) => total(v.a as number[]) <= 40 && total(v.b as number[]) <= 40, note: 'small change' },
];

const u144: QuestionTemplate[] = [
  /**
   * Q41 — which of two purses is worth more. The answer is the *amount*, not a
   * label, so both purses have to be added before anything can be chosen.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-4-which-larger', subtopicId: 'tanxaTa-Sedareba', difficulty: 1 }),
    prompt: 'რომელი თანხაა მეტი?',
    variables: twoDifferentPurses(),
    constraints: DIFFERENT_PURSES,
    answer: (v: Vars) => amountText(Math.max(total(v.a as number[]), total(v.b as number[]))),
    options: (v: Vars) => [amountText(total(v.a as number[])), amountText(total(v.b as number[]))],
    format: { kind: 'text' },
    optionCount: 2,
    visual: (v: Vars) =>
      twoPurses({ label: '①', coins: canonical(v.a as number[]) }, { label: '②', coins: canonical(v.b as number[]) }),
    explanation: (context) => {
      const first = total(context.vars.a as number[]);
      const second = total(context.vars.b as number[]);
      return `① ${first} თეთრი, ② ${second} თეთრი, ამიტომ მეტია ${context.answer}.`;
    },
  }),

  /**
   * Q42 — order three amounts ascending. Coin ordering over amounts, not
   * purses: the items are printed values need not be added, so the level is
   * lower than Q46's four-row descending.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-4-order-ascending', subtopicId: 'tanxaTa-Sedareba', difficulty: 2 }),
    prompt: 'დაალაგე სამი თანხა ზრდადობით: ჯერ ყველაზე პატარა, ბოლოს — ყველაზე დიდი.',
    variables: {
      items: {
        kind: 'list',
        pick: {
          values: ['3 თეთრი', '4 თეთრი', '6 თეთრი', '7 თეთრი', '8 თეთრი', '9 თეთრი', '11 თეთრი', '12 თეთრი', '14 თეთრი', '16 თეთრი', '18 თეთრი', '21 თეთრი', '23 თეთრი'],
          length: 3,
          unique: true,
        },
      },
    },
    answer: (_v: Vars, ctx) => {
      const shown = (ctx.order ?? []).map((item) => Number.parseInt(item, 10));
      const sorted = [...shown].sort((a, b) => a - b);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    shuffle: { source: 'items', direction: 'asc' },
    format: { kind: 'text' },
    // The amounts are drawn, numbered, in the order the student sees them. A
    // coin row would be wrong — 23 თეთრი is an amount, not a coin — and no
    // picture at all would make every variation the same question.
    visual: (v: Vars) => amountTags((v.items as string[]).map((item) => Number.parseInt(item, 10))),
    explanation: (context) => {
      const values = (context.vars.items as string[]).map((item) => Number.parseInt(item, 10)).sort((a, b) => a - b);
      return `უმცირესიდან: ${values.map((value) => `${value} თეთრი`).join(' < ')}.`;
    },
  }),

  /** Q43 — whose purse is heavier, named children. */
  defineTemplate({
    ...address({ id: 'g1-u14-4-two-purses', subtopicId: 'tanxaTa-Sedareba', difficulty: 2 }),
    prompt: 'ანას და ლევანს ფული აქვთ. ვის აქვს მეტი?',
    variables: twoDifferentPurses(),
    constraints: DIFFERENT_PURSES,
    answer: (v: Vars) => (total(v.a as number[]) > total(v.b as number[]) ? 'ანა' : 'ლევანი'),
    options: (v: Vars) => (total(v.a as number[]) > total(v.b as number[]) ? ['ანა', 'ლევანი'] : ['ლევანი', 'ანა']),
    format: { kind: 'text' },
    optionCount: 2,
    visual: (v: Vars) =>
      twoPurses({ label: 'ანა', coins: canonical(v.a as number[]) }, { label: 'ლევანი', coins: canonical(v.b as number[]) }),
    explanation: (context) => {
      const anna = total(context.vars.a as number[]);
      const levan = total(context.vars.b as number[]);
      return `ანას ${anna} თეთრი აქვს, ლევანს — ${levan}. მეტი აქვს ${context.answer === 'ანა' ? 'ანას' : 'ლევანს'}.`;
    },
  }),

  /** Q44 — how much **more**: `a − b`, `a > b` by construction. */
  defineTemplate({
    ...address({ id: 'g1-u14-4-how-much-more', subtopicId: 'tanxaTa-Sedareba', difficulty: 2 }),
    prompt: 'ანას {a} თეთრი აქვს, ლევანს — {b} თეთრი. რამდენი თეთრით მეტი აქვს ანას?',
    variables: {
      b: { kind: 'choice', values: [5, 10, 15, 20, 25, 30] },
      a: {
        kind: 'choice',
        values: (v: Vars) => [Number(v.b) + 5, Number(v.b) + 10, Number(v.b) + 15, Number(v.b) + 20],
      },
    },
    constraints: [{ test: (v: Vars) => Number(v.a) <= 100, note: 'under a lari' }],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 5, max: 20, entry: true },
    explanation: (context) => `${context.vars.a} − ${context.vars.b} = ${context.answer} თეთრით მეტი.`,
  }),

  /**
   * Q45 — how much **less**: the mirror of Q44, `b − a`.
   *
   * A template of its own rather than a parameter, because subtracting the wrong
   * way round is *the* mistake this question exists to catch, and a mirrored
   * prompt is what catches it.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-4-how-much-less', subtopicId: 'tanxaTa-Sedareba', difficulty: 2 }),
    prompt: 'ანას {a} თეთრი აქვს, ლევანს — {b} თეთრი. რამდენი თეთრით ნაკლები აქვს ანას?',
    variables: {
      a: { kind: 'choice', values: [5, 10, 15, 20, 25, 30] },
      b: {
        kind: 'choice',
        values: (v: Vars) => [Number(v.a) + 5, Number(v.a) + 10, Number(v.a) + 15, Number(v.a) + 20],
      },
    },
    constraints: [{ test: (v: Vars) => Number(v.b) <= 100, note: 'under a lari' }],
    answer: (v: Vars) => Number(v.b) - Number(v.a),
    format: { kind: 'integer', min: 5, max: 20, entry: true },
    explanation: (context) => `${context.vars.b} − ${context.vars.a} = ${context.answer} თეთრით ნაკლები.`,
  }),

  /**
   * Q46 — order four amounts descending: largest first, one more item to hold,
   * and the mirror of „ascending“ so the child has to reverse the rule rather
   * than recall one direction.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-4-order-descending', subtopicId: 'tanxaTa-Sedareba', difficulty: 3 }),
    prompt: 'დაალაგე ოთხი თანხა კლებადობით: ჯერ ყველაზე დიდი, ბოლოს — ყველაზე პატარა.',
    variables: {
      items: {
        kind: 'list',
        pick: {
          values: ['2 თეთრი', '3 თეთრი', '5 თეთრი', '6 თეთრი', '8 თეთრი', '9 თეთრი', '11 თეთრი', '14 თეთრი', '16 თეთრი', '17 თეთრი', '21 თეთრი', '23 თეთრი', '24 თეთრი'],
          length: 4,
          unique: true,
        },
      },
    },
    answer: (_v: Vars, ctx) => {
      const shown = (ctx.order ?? []).map((item) => Number.parseInt(item, 10));
      const sorted = [...shown].sort((a, b) => b - a);
      return sorted.map((value) => shown.indexOf(value) + 1).join(',');
    },
    shuffle: { source: 'items', direction: 'desc' },
    format: { kind: 'text' },
    visual: (v: Vars) => amountTags((v.items as string[]).map((item) => Number.parseInt(item, 10))),
    explanation: (context) => {
      const values = (context.vars.items as string[]).map((item) => Number.parseInt(item, 10)).sort((a, b) => b - a);
      return `უდიდესიდან: ${values.map((value) => `${value} თეთრი`).join(' > ')}.`;
    },
  }),

  /** Q47 — the two purses combined: `a + b`. */
  defineTemplate({
    ...address({ id: 'g1-u14-4-combined-purses', subtopicId: 'tanxaTa-Sedareba', difficulty: 2 }),
    prompt: 'ანას {a} თეთრი აქვს, ლევანს — {b} თეთრი. რამდენი თეთრი აქვთ სულ?',
    variables: {
      a: { kind: 'choice', values: [10, 15, 20, 25, 30, 35, 40] },
      b: { kind: 'choice', values: [5, 10, 15, 20, 25, 30] },
    },
    constraints: [{ test: (v: Vars) => Number(v.a) + Number(v.b) <= 100, note: 'under a lari' }],
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 15, max: 70, entry: true },
    explanation: (context) => `${context.vars.a} + ${context.vars.b} = ${context.answer} თეთრი.`,
  }),

  /** Q48 — after a transfer: `a − x`, and what the other child then has. */
  defineTemplate({
    ...address({ id: 'g1-u14-4-transfer', subtopicId: 'tanxaTa-Sedareba', difficulty: 3 }),
    prompt: 'ანას {a} თეთრი აქვს, ლევანს — {b}. ანა ლევანს {x} თეთრს აძლევს. რამდენი თეთრი დარჩება ანას?',
    variables: {
      a: { kind: 'choice', values: [20, 25, 30, 35, 40, 45, 50] },
      b: { kind: 'choice', values: [5, 10, 15, 20] },
      x: { kind: 'choice', values: (v: Vars) => [5, 10, 15].filter((value) => value <= Number(v.a) - 5) },
    },
    answer: (v: Vars) => Number(v.a) - Number(v.x),
    format: { kind: 'integer', min: 5, max: 45, entry: true },
    explanation: (context) =>
      `${context.vars.a} − ${context.vars.x} = ${context.answer} თეთრი დარჩება ანას. ლევანს კი ${Number(context.vars.b) + Number(context.vars.x)} ექნება.`,
  }),

  /**
   * Q49 — equalise: `|a − b| ÷ 2`.
   *
   * The gap is drawn even by construction, so the answer is always a whole
   * number of თეთრი — a fractional tetri does not exist, and a template that
   * could produce one would be producing an impossible coin.
   */
  defineTemplate({
    ...address({ id: 'g1-u14-4-equalise', subtopicId: 'tanxaTa-Sedareba', difficulty: 3 }),
    prompt: 'ანას {a} თეთრი აქვს, ლევანს — {b}. რამდენი თეთრი უნდა მისცეს ანამ ლევანს, რომ ორივეს თანაბრად ჰქონდეს?',
    variables: {
      b: { kind: 'choice', values: [10, 20, 30, 40] },
      half: { kind: 'choice', values: [5, 10, 15] },
      a: { kind: 'choice', values: (v: Vars) => [Number(v.b) + Number(v.half) * 2] },
    },
    constraints: [{ test: (v: Vars) => Number(v.a) <= 100, note: 'under a lari' }],
    answer: (v: Vars) => Number(v.half),
    format: { kind: 'integer', min: 5, max: 15, entry: true },
    explanation: (context) =>
      `სხვაობაა ${Number(context.vars.a) - Number(context.vars.b)} თეთრი, ნახევარი კი ${context.answer} თეთრია — აი, რამდენიც უნდა გადასცეს.`,
  }),

  /** Q50 — the multi-step purse: `m − a − b + r`. */
  defineTemplate({
    ...address({ id: 'g1-u14-4-multi-step', subtopicId: 'tanxaTa-Sedareba', difficulty: 3 }),
    prompt: '{first} ღირს {a} თეთრი, {second} — {b} თეთრი. გაქვს {m} თეთრი. ორივეს ყიდულობ და დედა კიდევ {r} თეთრს გაძლევს. რამდენი თეთრი დაგრჩება?',
    variables: {
      a: { kind: 'choice', values: [5, 10, 15, 20] },
      b: { kind: 'choice', values: [5, 10, 15, 20] },
      m: {
        kind: 'choice',
        values: (v: Vars) => [
          Number(v.a) + Number(v.b),
          Number(v.a) + Number(v.b) + 10,
          Number(v.a) + Number(v.b) + 20,
        ],
      },
      r: { kind: 'choice', values: [5, 10, 15, 20] },
      first: { kind: 'choice', values: ['ფანქარი', 'საშლელი'] },
      second: { kind: 'choice', values: ['რვეული', 'სახაზავი'] },
    },
    constraints: [
      { test: (v: Vars) => Number(v.m) - Number(v.a) - Number(v.b) + Number(v.r) <= 100, note: 'under a lari' },
    ],
    answer: (v: Vars) => Number(v.m) - Number(v.a) - Number(v.b) + Number(v.r),
    format: { kind: 'integer', min: 5, max: 50, entry: true },
    explanation: (context) =>
      `${context.vars.m} − ${context.vars.a} − ${context.vars.b} + ${context.vars.r} = ${context.answer} თეთრი.`,
  }),
];

/* ================================================================== *\
 * Exports
 * ================================================================== */

/** Every U14 template, in curriculum order. */
export const U14_TEMPLATES: QuestionTemplate[] = [...u141, ...u142, ...u142b, ...u143, ...u143b, ...u144];

/** Subtopic ids this library is responsible for, in curriculum order. */
export const U14_SUBTOPICS = [
  'monetebis-vertoba',
  'fulis-amocanebi',
  'tolzRvari-monetebi',
  'tanxaTa-Sedareba',
  'yvelaze-cota-monetebi',
  'sakmarisi-fuli',
];
