/**
 * Coins: what they are worth, what a purse is worth, and the fewest coins that
 * can pay an amount.
 *
 * The runner renders a picture as **text**, exactly like the clock dial, so a
 * coin has to be text that is still a coin. It is drawn as a small round token
 * with its denomination inside:
 *
 *     ╭────╮ ╭────╮ ╭────╮
 *     │ 10 │ │ 5  │ │ 5  │
 *     ╰────╯ ╰────╯ ╰────╯
 *
 * Three characters wide is not enough for `50`, and centring a one-digit value
 * in a two-digit cell is the difference between a coin and a stack of digits,
 * so every token is the same six cells wide and the value is centred inside it.
 *
 * ## The one idea this module must not break
 *
 * **A purse is a list of denominations, and everything else is derived from it.**
 * `coinRow(values)` draws those values; `total(values)` adds them up; the answer
 * a template computes is `total` *over the same array the picture is drawn
 * from*. There is no second copy of the sum anywhere, so a picture cannot show
 * 30 tetri above a question whose answer is 25 — the failure the clock dial
 * needed `clockHands` to avoid, and the reason both files exist.
 *
 * ## Real money only
 *
 * The denominations are the coins Georgia actually mints: 1, 2, 5, 10, 20 and
 * 50 თეთრი. A hundred თეთრი is one ლარი, and the specification forbids decimals,
 * so every amount in U14 is a whole number of თეთრი and no template may reach
 * for a denomination that does not exist. `COINS` is the only source of coin
 * values in the unit; a template that wanted a 3-თეთრიანი coin would have to add
 * it here, where the tests can see it.
 *
 * ## Combinations are unordered
 *
 * `10 + 5` and `5 + 10` are one way to pay 15, not two. `combinationText` sorts
 * before it writes, so both render as „10 + 5“ and nothing downstream can count
 * them twice — that is the specification's rule made structural rather than
 * remembered.
 *
 * ## Fewest coins
 *
 * `minCoins` is greedy (largest coin first) because Georgian denominations are
 * *canonical*: every coin is at least twice the previous one except 2 against 1,
 * so taking the largest coin that fits can never use more coins than any other
 * way of paying. A test re-derives every amount up to 100 by exhaustive search
 * and checks greedy agrees, which is the only honest way to claim optimality
 * for a rule a six-year-old is going to apply by hand.
 */

/** The coins in circulation, smallest first. The only source of coin values. */
export const COINS: readonly number[] = [1, 2, 5, 10, 20, 50];

/** One hundred თეთრი is one ლარი; nothing in this unit goes above it. */
export const MAX_AMOUNT = 100;

/** Throws for anything that is not a real, whole, non-negative amount. */
function checkAmount(amount: number): number {
  if (!Number.isInteger(amount) || amount < 0 || amount > MAX_AMOUNT) {
    throw new Error(`${amount} is not an amount of თეთრი this unit can use (0…${MAX_AMOUNT}, whole)`);
  }
  return amount;
}

/** Throws for a denomination Georgia does not mint. */
function checkCoin(coin: number): number {
  if (!COINS.includes(coin)) throw new Error(`${coin} is not a Georgian coin`);
  return coin;
}

/** The value of a purse, in თეთრი. The single definition of „how much“. */
export function total(values: readonly number[]): number {
  return values.reduce((sum, coin) => sum + checkCoin(coin), 0);
}

/* ---------------------------------------------------------------- *\
 * Drawing
 * ---------------------------------------------------------------- */

/** Cells inside a token — wide enough for `50` with a space either side. */
const INNER = 4;
const TOP = `╭${'─'.repeat(INNER)}╮`;
const BOTTOM = `╰${'─'.repeat(INNER)}╯`;

/** Centres `text` in `width`, so `1` and `50` sit on the same axis. */
function centre(text: string, width: number): string {
  const slack = width - text.length;
  const left = Math.floor(slack / 2);
  return `${' '.repeat(left)}${text}${' '.repeat(slack - left)}`;
}

/** The three rows of one coin. */
function token(coin: number): [string, string, string] {
  return [TOP, `│${centre(String(checkCoin(coin)), INNER)}│`, BOTTOM];
}

/**
 * A purse, drawn. Up to `perLine` coins side by side, then a new row of tokens.
 *
 * Four to a line keeps the widest purse inside a phone screen: a token is six
 * cells, four of them plus gaps is 27, and `.question-visual-coins` gives the
 * block a fixed-width font and `overflow-x: auto` for the rare line that is
 * still too wide.
 */
export function coinRow(values: readonly number[], perLine = 4): string {
  if (values.length === 0) return '';
  const lines: string[] = [];
  for (let start = 0; start < values.length; start += perLine) {
    const cells = values.slice(start, start + perLine).map(token);
    for (let row = 0; row < 3; row += 1) {
      lines.push(cells.map((cell) => cell[row]).join(' '));
    }
  }
  return lines.join('\n');
}

/**
 * A labelled purse, for a question that shows more than one.
 *
 * The label is part of the picture, so whoever calls this must pass the *same*
 * name the prompt and the options use — „ანა“ above the coins and „ანა“ on the
 * button have to be the same person.
 */
function coinPurse(label: string, values: readonly number[]): string {
  return `${label}\n${coinRow(values)}`;
}

/** Two purses side by side, vertically, for a comparison. */
export function twoPurses(
  first: { label: string; coins: readonly number[] },
  second: { label: string; coins: readonly number[] },
): string {
  return `${coinPurse(first.label, first.coins)}\n\n${coinPurse(second.label, second.coins)}`;
}

/**
 * A price tag — an amount to be paid, not a coin and not a purse.
 *
 * This exists because the alternative is a lie in one of two directions:
 * drawing `45 თეთრი` as a coin invents a denomination Georgia does not mint, and
 * drawing it as the fewest coins that make it *hands over the answer* to „which
 * combination equals 45“. A tag says „this is the amount“ and nothing else.
 *
 * Deliberately not boxed. A box has to be drawn to the width of the text inside
 * it, and Georgian letters in a monospace font fall back to a Georgian face
 * whose advance width is not the Latin one, so the borders would meet at the
 * corners only by luck.
 */
export function amountTag(amount: number): string {
  return `◆ ${coinText(amount)}`;
}

/**
 * A numbered column of amount tags, for an ordering question.
 *
 * The number is what an ordering answer refers to („tap #1 first“), so it is
 * part of the picture and not a decoration. It is also what makes two ordering
 * variations different questions at all: without a picture, every variation of
 * „arrange three amounts“ reads as the same sentence, and the session's de-dup
 * key treats them as one question.
 */
export function amountTags(amounts: readonly number[]): string {
  return amounts.map((amount, index) => `#${index + 1}  ${amountTag(amount)}`).join('\n');
}

/* ---------------------------------------------------------------- *\
 * Words
 * ---------------------------------------------------------------- */

/** „10 თეთრი“. The ლარი never appears: U14 works in whole თეთრი only. */
export const coinText = (value: number): string => `${checkAmount(value)} თეთრი`;

/**
 * „10 + 5“ — one combination, canonical.
 *
 * Descending, always. `10 + 5` and `5 + 10` are the same way to pay 15, and if
 * the text kept the drawn order they would be two different options, two
 * different keys and two different answers to one question.
 */
export function combinationText(values: readonly number[]): string {
  return [...values].sort((a, b) => b - a).join(' + ');
}

/* ---------------------------------------------------------------- *\
 * Fewest coins
 * ---------------------------------------------------------------- */

/**
 * The largest coins that fit, largest first — the fewest coins that pay `amount`.
 *
 * Greedy is optimal for a canonical denomination set. Georgian coins are
 * canonical: 2 ≤ 2×1, 5 ≤ 2×2 + 1, 10 = 2×5, 20 = 2×10, 50 ≤ 2×20 + 10. The
 * tests check it by search rather than trusting the argument, because the
 * argument is exactly the sort of thing that stops being true when someone adds
 * a 25-თეთრიანი coin.
 */
export function minCoinSet(amount: number, pool: readonly number[] = COINS): number[] {
  let left = checkAmount(amount);
  const out: number[] = [];
  for (const coin of [...pool].sort((a, b) => b - a)) {
    while (left >= coin) {
      out.push(coin);
      left -= coin;
    }
  }
  return out;
}

/** How many coins that is. */
export const minCoins = (amount: number): number => minCoinSet(amount).length;

/**
 * Every unordered way to pay `amount` with **two** coins.
 *
 * Pairs, not sequences: `[10, 5]` and `[5, 10]` are one way. Used by the
 * question that asks how many different pairs make an amount, which is the
 * grade-1 form of „the number of distinct combinations“.
 */
export function coinPairs(amount: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let i = 0; i < COINS.length; i += 1) {
    for (let j = i; j < COINS.length; j += 1) {
      if (COINS[i]! + COINS[j]! === amount) out.push([COINS[i]!, COINS[j]!]);
    }
  }
  return out;
}

/**
 * Every way to pay `amount` with **at most `maxCoins`** coins, unordered.
 *
 * Enumerated rather than hand-written, because „how many different ways“ and
 * „mark the two that fit“ both need a set that is *complete*: a hand-written
 * list quietly misses a way, and the question then has a second right answer
 * nobody notices. Coins are drawn in descending order and never ascend along a
 * branch, which is what makes `5 + 5 + 5` appear once instead of in six orders.
 *
 * The cap matters: without it 50 თეთრი is payable with fifty 1-თეთრიანი coins and
 * the list is useless. Five coins is the most a grade-1 purse should hold.
 */
export function coinCombinations(amount: number, maxCoins = 5): number[][] {
  checkAmount(amount);
  const out: number[][] = [];
  const walk = (left: number, from: number, built: number[]): void => {
    if (left === 0) {
      out.push([...built]);
      return;
    }
    if (built.length >= maxCoins) return;
    // Downwards: the next coin is never larger than the one just chosen, which
    // is what keeps a combination from being produced in several orders.
    for (let index = from; index >= 0; index -= 1) {
      const coin = COINS[index]!;
      if (coin > left) continue;
      built.push(coin);
      walk(left - coin, index, built);
      built.pop();
    }
  };
  walk(amount, COINS.length - 1, []);
  // Fewest coins first, then the bigger coins first within a length — the order
  // a child would try them in.
  return out.sort((a, b) => a.length - b.length || b.join(',').localeCompare(a.join(',')));
}

/**
 * The coin sets a „which row uses fewest“ question can offer: the greedy answer
 * plus deliberately wasteful ones, so the comparison is about the number of
 * coins rather than about which row is longer.
 */
export function coinSetsFor(amount: number): number[][] {
  const options = coinCombinations(amount, 5).filter((set) => set.length >= 2);
  const greedy = minCoinSet(amount);
  const all: number[][] = [greedy, ...options];
  const seen = new Set<string>();
  return all.filter((set) => {
    const key = [...set].sort((a, b) => b - a).join(',');
    if (seen.has(key) || set.length === 0) return false;
    seen.add(key);
    return total(set) === amount;
  });
}
