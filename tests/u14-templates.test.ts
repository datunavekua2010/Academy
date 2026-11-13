import { describe, expect, it } from 'vitest';
import { U14_SUBTOPICS, U14_TEMPLATES, GOODS } from '../src/practice/templates/u14-money';
import {
  COINS,
  MAX_AMOUNT,
  coinCombinations,
  coinPairs,
  coinRow,
  coinSetsFor,
  minCoinSet,
  total,
} from '../src/practice/templates/coins';
import { generateFromTemplate, generateVariations } from '../src/practice/templates/generate';
import { hasTemplates } from '../src/practice/generator';
import { startSession, submitAnswer } from '../src/practice/session';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import type { GeneratedQuestion } from '../src/practice/templates/generate';

/**
 * U14 — ფული.
 *
 * A money question promises that the coins on the screen are worth what the
 * answer says. So wherever a test can, it **reads the picture back into
 * numbers** and re-derives the answer from that — it does not trust the
 * template's own arithmetic, because a bug between the drawing and the answer
 * would agree with itself.
 *
 * The failures this suite exists for:
 *
 *  - a purse drawn with a coin Georgia does not mint, or with 3 or 25 on it;
 *  - a sum that disagrees with the coins beside it;
 *  - an amount above 100 თეთრი, or anything with a decimal — the specification
 *    forbids both, and „1.5 ლარი“ is a coin that cannot exist;
 *  - two ways to pay 15 counted as two when one is `5 + 10` and the other
 *    `10 + 5` (combinations are unordered);
 *  - a „mark every one that fits“ question with nothing to leave out, or whose
 *    answer names an option it did not offer;
 *  - a price in a prompt that contradicts the unit's own price list.
 */

const SAMPLES = 24;
const SEED = 20261105;

const ref = (subtopicId: string) => ({ grade: 1 as const, topicId: 'fasebi', subtopicId });

const templateFor = (id: string) => {
  const template = U14_TEMPLATES.find((candidate) => candidate.id === id);
  if (!template) throw new Error(`no template ${id}`);
  return template;
};

const generateMany = (templateId: string, count = SAMPLES): GeneratedQuestion[] => {
  const template = templateFor(templateId);
  for (let take = count; take >= 1; take = Math.floor(take / 2)) {
    try {
      return generateVariations(template, take, { seed: SEED });
    } catch {
      // too narrow for `take`; try a smaller batch
    }
  }
  throw new Error(`could not draw ${templateId}`);
};

/**
 * Reads a drawn purse back into the coin values a student sees.
 *
 * The picture is character tokens, one per coin: a `╭────╮ / │ NN │ / ╰────╯`
 * block whose middle row holds the denomination. This parses the middle rows
 * rather than the template's `vars`, which is the whole point — the numbers come
 * off the screen.
 */
function coinsFromVisual(visual: string): number[] {
  const out: number[] = [];
  for (const line of visual.split('\n')) {
    // A row holds up to four tokens side by side, so every box on the line has
    // to be read — matching only the first one made a two-coin purse look like
    // a one-coin purse and hid the sums it was there to check.
    for (const match of line.matchAll(/│\s*(\d+)\s*│/g)) out.push(Number(match[1]));
  }
  return out;
}

/** Every amount written in a string as „N თეთრი“. */
const amountsIn = (text: string): number[] =>
  [...text.matchAll(/(\d+)\s*თეთრი/g)].map((match) => Number(match[1]));

/** Every combination written as `a + b + …` in a string. */
const combinationsIn = (text: string): number[][] =>
  text
    .split(',')
    .map((part) => part.trim())
    .filter((part) => /^\d+(\s*\+\s*\d+)+$/.test(part))
    .map((part) => part.split('+').map((coin) => Number(coin.trim())));

describe('the coin set', () => {
  it('is the money Georgia actually mints, and nothing else', () => {
    expect([...COINS]).toEqual([1, 2, 5, 10, 20, 50]);
  });

  it('refuses an amount that is not whole თეთრი under a lari', () => {
    expect(() => coinRow([3])).toThrow();
    expect(() => coinRow([0])).toThrow();
    expect(() => coinRow([100])).toThrow();
    expect(() => coinRow([1.5])).toThrow();
    expect(coinRow([50])).toContain('50');
  });

  it('draws the denomination, not a placeholder', () => {
    // The specification's hard rule: the picture carries the value. A token
    // whose interior is empty is an emoji with extra steps.
    for (const coin of COINS) {
      const picture = coinRow([coin]);
      expect(picture, `${coin}`).toContain(String(coin));
      // Three rows per coin: a complete box, or the coin does not read as one.
      expect(picture.split('\n')).toHaveLength(3);
      expect(picture).toContain('╭');
      expect(picture).toContain('╯');
    }
  });

  it('pads every token to the same width, so two-digit coins line up', () => {
    const narrow = coinRow([5]).split('\n')[1]!;
    const wide = coinRow([50]).split('\n')[1]!;
    expect(narrow).toHaveLength(wide.length);
    // `5` and `50` sit on the same axis: centring, not left-alignment.
    expect(narrow).toBe('│ 5  │');
    expect(wide).toBe('│ 50 │');
  });

  it('counts a combination once, whatever the order', () => {
    // The specification's rule, made structural: `10 + 5` and `5 + 10` are one
    // way to pay 15. If the walk produced both, „how many pairs“ would double.
    const pairs = coinPairs(15);
    expect(pairs).toEqual([[5, 10]]);
    expect(coinPairs(10)).toEqual([[5, 5]]);
    for (const amount of [7, 12, 21, 25, 30, 40, 52, 60]) {
      const seen = new Set(pairsKey(coinPairs(amount)));
      expect(seen.size, `${amount}`).toBe(coinPairs(amount).length);
    }
  });

  it('finds the fewest coins by search, and greedy agrees', () => {
    // Greedy is what a child does; search is what is true. They must agree for
    // every amount the unit can show, or the „fewest coins“ answer is a lie.
    for (let amount = 1; amount <= MAX_AMOUNT; amount += 1) {
      const fewest = coinCombinations(amount, 100).reduce(
        (best, set) => Math.min(best, set.length),
        Number.POSITIVE_INFINITY,
      );
      const greedy = coinSetsFor(amount)[0]!;
      expect(total(greedy), `${amount}: greedy total`).toBe(amount);
      expect(greedy.length, `${amount}: greedy is not the fewest`).toBe(fewest);
    }
  });
});

/** An order-free key for a list of coin pairs, used to catch double counting. */
function pairsKey(pairs: ReadonlyArray<readonly [number, number]>): string[] {
  return pairs.map(([a, b]) => `${Math.min(a, b)}+${Math.max(a, b)}`);
}

describe('U14 as a unit', () => {
  it('has fifty templates over the curriculum’s six subtopics', () => {
    expect(U14_TEMPLATES).toHaveLength(50);
    expect(new Set(U14_TEMPLATES.map((template) => template.id)).size).toBe(50);
    expect(U14_SUBTOPICS).toHaveLength(6);
    for (const subtopicId of U14_SUBTOPICS) {
      expect(
        U14_TEMPLATES.filter((template) => template.subtopicId === subtopicId).length,
        subtopicId,
      ).toBeGreaterThan(0);
    }
  });

  it('reaches all three levels in every subtopic', () => {
    // A level that falls back to the whole set is a difficulty that does not
    // exist, and the session ladder would silently skip it.
    for (const subtopicId of U14_SUBTOPICS) {
      const levels = new Set(
        U14_TEMPLATES.filter((template) => template.subtopicId === subtopicId).map(
          (template) => template.difficulty,
        ),
      );
      expect(levels, subtopicId).toEqual(new Set([1, 2, 3]));
    }
  });

  it('files every subtopic the curriculum gives „ფული“', () => {
    // The six subtopics of the topic, all covered by real templates — this is
    // what lets the placeholder file drop its U14 entries.
    expect(new Set(U14_SUBTOPICS)).toEqual(
      new Set([
        'monetebis-vertoba',
        'fulis-amocanebi',
        'tolzRvari-monetebi',
        'tanxaTa-Sedareba',
        'yvelaze-cota-monetebi',
        'sakmarisi-fuli',
      ]),
    );
  });

  it('is registered, and every subtopic is playable', () => {
    for (const subtopicId of U14_SUBTOPICS) {
      expect(hasTemplates(ref(subtopicId) as never), subtopicId).toBe(true);
      expect(TEMPLATE_REGISTRY.forSubtopic(ref(subtopicId) as never).length).toBeGreaterThan(0);
    }
  });

  it('uses all four answer types the specification names', () => {
    const modes = new Set<string>();
    for (const template of U14_TEMPLATES) {
      const question = generateFromTemplate(template, { seed: 1 });
      modes.add(question.answerMode ?? 'choice');
    }
    // single choice, typed number, coin ordering, multi-select.
    expect([...modes].sort()).toEqual(['choice', 'multi', 'number', 'order']);
  });
});

describe('every generated question', () => {
  it('keeps every prompt and explanation in Georgian, fully rendered', () => {
    for (const template of U14_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        expect(question.prompt, template.id).not.toMatch(/\{\w+\}/);
        expect(question.prompt, template.id).not.toMatch(/[A-Za-z]/);
        expect(question.explanation, template.id).not.toMatch(/[A-Za-z]/);
        expect(question.explanation.trim().length, template.id).toBeGreaterThan(0);
        expect(`${question.prompt}${question.explanation}`, template.id).not.toContain('NaN');
        expect(`${question.prompt}${question.explanation}`, template.id).not.toContain('undefined');
      }
    }
  }, 60_000);

  it('never shows an amount that is not whole თეთრი under a lari', () => {
    // No decimals and no ლარი: the specification's own rule, checked on every
    // number the student can read.
    for (const template of U14_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        // An ordering answer is a list of display positions — `2,1,3` — so the
        // answer field is a comma-separated list by definition and is checked
        // separately from the amounts. Everything the student reads as money is
        // prompt, picture and explanation.
        const money = `${question.prompt} ${question.visual ?? ''} ${question.explanation}`;
        const text = `${money} ${question.answer}`;
        // No decimals anywhere: the specification allows whole თეთრი only.
        expect(money, template.id).not.toMatch(/\d+[.,]\d+/);
        if (question.answerMode !== 'order') {
          expect(String(question.answer), template.id).not.toMatch(/\d+[.,]\d+/);
        }
        expect(text, template.id).not.toMatch(/ლარი/);
        for (const amount of amountsIn(text)) {
          // Zero is real: „you paid exactly, so you get 0 back“. A *price* of
          // zero would not be, and no template prints one — every price comes
          // from `GOODS`, whose cheapest item is 2 თეთრი.
          expect(amount, `${template.id}: ${amount} თეთრი is out of range`).toBeGreaterThanOrEqual(0);
          expect(amount, `${template.id}: ${amount} თეთრი is out of range`).toBeLessThanOrEqual(MAX_AMOUNT);
        }
      }
    }
  }, 60_000);

  it('draws only real coins', () => {
    for (const template of U14_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        if (!question.visual?.includes('╭')) continue;
        const drawn = coinsFromVisual(question.visual);
        expect(drawn.length, `${template.id}: a purse with no readable coin`).toBeGreaterThan(0);
        for (const coin of drawn) {
          expect(COINS, `${template.id}: ${coin} is not a Georgian coin`).toContain(coin);
        }
      }
    }
  }, 60_000);

  it('offers exactly one right answer, and never the same option twice', () => {
    for (const template of U14_TEMPLATES) {
      for (const question of generateMany(template.id, 16)) {
        if (question.answerMode === 'number' || question.answerMode === 'order') {
          expect(question.options, template.id).toEqual([]);
          continue;
        }
        if (question.answerMode === 'multi') continue; // checked below
        const options = question.options.map(String);
        expect(new Set(options).size, `${template.id}: ${options.join(' | ')}`).toBe(options.length);
        expect(
          options.filter((option) => option === String(question.answer)),
          template.id,
        ).toHaveLength(1);
        expect(options, template.id).toHaveLength(template.optionCount ?? 4);
      }
    }
  }, 60_000);

  it('asks a multi-select question whose answer is a real, proper subset', () => {
    for (const template of U14_TEMPLATES) {
      for (const question of generateMany(template.id, 12)) {
        if (question.answerMode !== 'multi') continue;
        const marked = String(question.answer).split(',').map((part) => part.trim());
        const options = question.options.map(String);
        // The answer searches the option it names — a multi-select that marks
        // something it never offered can never be answered.
        for (const option of marked) expect(options, template.id).toContain(option);
        expect(new Set(options).size, template.id).toBe(options.length);
        // All right or all wrong is not a question.
        expect(marked.length, template.id).toBeGreaterThan(0);
        expect(marked.length, template.id).toBeLessThan(options.length);
        // …and it must be possible to get it wrong by marking one extra.
        expect(options.filter((option) => !marked.includes(option)).length, template.id).toBeGreaterThan(0);
      }
    }
  }, 60_000);

  it('marks a multi-select right only when the whole set matches', () => {
    // The runner's own rule, exercised through the real session engine: a
    // subset is wrong, a superset is wrong, the set is right, and the order the
    // student tapped in does not matter.
    const template = templateFor('g1-u14-2-what-can-i-buy');
    const [question] = generateVariations(template, 1, { seed: SEED });
    const marked = String(question!.answer).split(',').map((part) => part.trim());
    const unmarked = question!.options.map(String).filter((option) => !marked.includes(option));
    expect(unmarked.length).toBeGreaterThan(0);

    const attempt = (choice: string) => {
      const session = startSession(ref('sakmarisi-fuli') as never, [question!]);
      return submitAnswer(session, choice)!.result.correct;
    };

    expect(attempt(question!.answer), 'the right set must be accepted').toBe(true);
    expect(attempt([...marked].reverse().join(', ')), 'tap order must not matter').toBe(true);
    expect(attempt([marked[0]!].join(', ')), 'one short must be wrong').toBe(false);
    expect(attempt([...marked, unmarked[0]!].join(', ')), 'one extra must be wrong').toBe(false);
  });

  it('varies what it draws, so the same question is not asked twice', () => {
    for (const template of U14_TEMPLATES) {
      const keys = new Set(
        generateMany(template.id, 4).map((question) => `${question.prompt}|${question.visual ?? ''}`),
      );
      expect(keys.size, template.id).toBe(4);
    }
  }, 60_000);

  it('persists the template id, the parameters and both answers', () => {
    for (const template of U14_TEMPLATES) {
      const [question] = generateMany(template.id, 1);
      expect(question!.templateId).toBe(template.id);
      expect(question!.subtopicId).toBe(template.subtopicId);
      expect(question!.difficulty).toBe(template.difficulty);
      expect(question!.vars).toBeTypeOf('object');
      expect(question!.answer).toBeDefined();
    }
  }, 60_000);
});

describe('the picture and the answer agree', () => {
  /** Templates whose whole question is „add the purse you see“. */
  const PURSE_SUMS = [
    'g1-u14-1-two-different-coins',
    'g1-u14-1-three-coins',
    'g1-u14-1-two-same-coins',
    'g1-u14-1-three-same-coins',
    'g1-u14-1-count-purse',
  ];

  it('adds the coins it drew, not some other coins', () => {
    // Re-derived from the picture for every template that asks for a purse's
    // value: this is the failure a type checker cannot see, and the reason
    // `coins.ts` is the only place a sum is computed.
    for (const id of PURSE_SUMS) {
      for (const question of generateMany(id, 12)) {
        const drawn = coinsFromVisual(question.visual ?? '');
        const drawnTotal = total(drawn);
        expect(drawn.length, `${id}: a purse with no readable coins`).toBeGreaterThan(1);
        if (question.answerMode === 'number') {
          expect(Number(question.answer), `${id}: drew ${drawn.join('+')}=${drawnTotal}`).toBe(drawnTotal);
        } else {
          // A choice answer spells the amount, so the amount is read back out.
          expect(amountsIn(String(question.answer))[0], `${id}: ${question.answer}`).toBe(drawnTotal);
        }
      }
    }
  }, 60_000);

  it('draws the coin the sum question names', () => {
    // „ორი 10-თეთრიანი“ must draw two coins with 10 on them.
    for (const id of ['g1-u14-1-two-same-coins', 'g1-u14-1-three-same-coins']) {
      for (const question of generateMany(id, 12)) {
        const drawn = coinsFromVisual(question.visual ?? '');
        const coin = Number(question.vars.coin);
        expect(drawn.length, id).toBeGreaterThanOrEqual(2);
        for (const value of drawn) expect(value, id).toBe(coin);
        expect(total(drawn)).toBe(Number(question.answer));
      }
    }
  });

  it('draws the purse the yes/no question is about', () => {
    // „გაქვს 20 თეთრი“ must show exactly 20 თეთრი in coins.
    for (const id of ['g1-u14-2-enough-for-one', 'g1-u14-2-enough-for-two', 'g1-u14-2-what-can-i-buy']) {
      for (const question of generateMany(id, 10)) {
        const drawn = coinsFromVisual(question.visual ?? '');
        const stated = Number(question.vars.paid);
        expect(total(drawn), `${id}: drew ${drawn.join('+')}, stated ${stated}`).toBe(stated);
      }
    }
  });

  it('draws the change question’s coin, and answers with its change', () => {
    // The picture is the coin handed over; the answer is what comes back, so the
    // two are related by the price rather than being equal — which is exactly
    // the trap a careless template falls into.
    for (const question of generateMany('g1-u14-3-change-from-big-coin', 12)) {
      const drawn = coinsFromVisual(question.visual ?? '');
      const big = Number(question.vars.big);
      const price = Number(question.vars.price);
      expect(drawn, 'the picture is the single coin being spent').toEqual([big]);
      expect(Number(question.answer)).toBe(big - price);
      expect(Number(question.answer)).toBeGreaterThan(0);
    }
  });

  it('answers „which coin is worth most“ with one of the drawn coins', () => {
    // Not the purse's total: the question asks which *coin*, so the answer has
    // to be one of the coins on screen — and the dearest of them.
    for (const question of generateMany('g1-u14-1-which-is-more', 12)) {
      const drawn = coinsFromVisual(question.visual ?? '');
      const answered = amountsIn(String(question.answer))[0];
      expect(drawn, question.prompt).toContain(answered);
      expect(answered).toBe(Math.max(...drawn));
    }
  });

  it('draws the fewest coins that make the amount it asks about', () => {
    for (const question of generateMany('g1-u14-3-min-coins-count', 12)) {
      // This one shows a price tag, not a purse: the amount is what must be
      // paid, so drawing it as coins would hand over the answer.
      expect(question.visual ?? '').not.toContain('╭');
      expect(question.visual ?? '').toContain(`${question.vars.amount} თეთრი`);
      expect(Number(question.answer)).toBe(minCoinSet(Number(question.vars.amount)).length);
    }
  });
});

describe('the specification’s own questions', () => {
  it('keeps every printed price the price the shop charges', () => {
    // A prompt that says „საშლელი ღირს 2 თეთრი“ while the shop charges 8 is a
    // question that contradicts the list the child is being taught.
    const priced = U14_TEMPLATES.filter((template) => template.prompt.includes('{price}'));
    expect(priced.length).toBeGreaterThan(3);
    for (const template of priced) {
      for (const question of generateMany(template.id, 10)) {
        const good = GOODS.find((entry) => entry.nom === String(question.vars.good));
        expect(good, `${template.id}: ${question.vars.good} is not in the shop`).toBeDefined();
        expect(Number(question.vars.price), `${template.id}: ${good!.nom}`).toBe(good!.price);
        expect(question.prompt, template.id).toContain(`${good!.price} თეთრი`);
      }
    }
  }, 60_000);

  it('guarantees a purse is really short when it asks „how much is missing“', () => {
    for (const question of generateMany('g1-u14-2-how-much-short', 20)) {
      const price = Number(question.vars.price);
      const paid = Number(question.vars.paid);
      expect(paid, 'a „short“ question must be short').toBeLessThan(price);
      expect(Number(question.answer)).toBe(price - paid);
    }
  });

  it('guarantees a purse really has change when it asks for change', () => {
    for (const question of generateMany('g1-u14-2-change-one', 20)) {
      const price = Number(question.vars.price);
      const paid = Number(question.vars.paid);
      expect(paid).toBeGreaterThan(price);
      expect(Number(question.answer)).toBe(paid - price);
    }
  });

  it('asks „enough?“ with both outcomes reachable', () => {
    // A yes/no question whose answer is always „კი“ can be scored 100 without
    // reading it. Both sides must actually be drawn.
    const sides = new Set(
      generateMany('g1-u14-2-enough-for-one', 24).map((question) => String(question.answer)),
    );
    expect([...sides].sort()).toEqual(['არა', 'კი']);
  });

  it('splits an amount into equal halves, never a fraction of a tetri', () => {
    for (const question of generateMany('g1-u14-2-split-evenly', 20)) {
      const money = Number(question.vars.money);
      expect(money % 2, 'an odd amount cannot be split into whole tetri').toBe(0);
      expect(Number(question.answer)).toBe(money / 2);
    }
  });

  it('equalises two purses by half the gap, and the gap is even', () => {
    for (const question of generateMany('g1-u14-4-equalise', 20)) {
      const a = Number(question.vars.a);
      const b = Number(question.vars.b);
      const gap = Math.abs(a - b);
      expect(gap % 2, 'half a tetri does not exist').toBe(0);
      expect(Number(question.answer)).toBe(gap / 2);
      // After the transfer both sides really are equal.
      expect(a - Number(question.answer)).toBe(b + Number(question.answer));
    }
  });

  it('adds a transfer on top of a purchase in the multi-step question', () => {
    for (const question of generateMany('g1-u14-4-multi-step', 20)) {
      const { a, b, m, r } = question.vars;
      expect(Number(m), 'you cannot spend more than you have').toBeGreaterThanOrEqual(
        Number(a) + Number(b),
      );
      expect(Number(question.answer)).toBe(Number(m) - Number(a) - Number(b) + Number(r));
    }
  });

  it('orders amounts ascending and descending correctly, as display positions', () => {
    for (const [id, direction] of [
      ['g1-u14-4-order-ascending', 'asc'],
      ['g1-u14-4-order-descending', 'desc'],
    ] as const) {
      for (const question of generateMany(id, 16)) {
        const items = (question.orderItems ?? []).map((item) => Number.parseInt(item, 10));
        const key = String(question.answer).split(',').map(Number);
        // The key is display positions, 1-based, and a real permutation.
        expect([...key].sort((x, y) => x - y)).toEqual(items.map((_, index) => index + 1));
        const arranged = key.map((position) => items[position - 1]!);
        const sorted = [...arranged].sort((x, y) => (direction === 'asc' ? x - y : y - x));
        expect(arranged, id).toEqual(sorted);
        // The scramble must not arrive already sorted, or there is nothing to do.
        expect(items, id).not.toEqual(sorted);
      }
    }
  }, 60_000);

  it('counts the ways to pay an amount order-free', () => {
    // „რამდენი წყვილი“ — `10 + 5` and `5 + 10` are one way, so the count is the
    // number of combinations and not of sequences.
    for (const question of generateMany('g1-u14-3-number-of-ways', 20)) {
      const amount = Number(question.vars.amount);
      const pairs = coinPairs(amount);
      expect(Number(question.answer)).toBe(pairs.length);
      // Every pair really pays the amount, and the pairs are distinct as sets.
      const keys = new Set<string>();
      for (const [a, b] of pairs) {
        expect(a + b).toBe(amount);
        keys.add(`${Math.min(a, b)}+${Math.max(a, b)}`);
      }
      expect(keys.size).toBe(pairs.length);
    }
  });

  it('offers only rows that really pay the amount, in the fewest-coins question', () => {
    for (const question of generateMany('g1-u14-3-fewest-row', 20)) {
      const amount = Number(question.vars.amount);
      const rows = question.options.map(String).map((row) =>
        row.split('+').map((coin) => Number(coin.trim())),
      );
      // Every option is a way to pay the amount exactly…
      for (const row of rows) expect(total(row), row.join('+')).toBe(amount);
      // …and the answer is the one with the fewest coins, uniquely.
      const counts = rows.map((row) => row.length);
      const fewest = Math.min(...counts);
      expect(counts.filter((count) => count === fewest)).toHaveLength(1);
      expect(String(question.answer).split('+').length).toBe(fewest);
    }
  });
});

describe('money combinations the specification calls unordered', () => {
  it('never writes the same combination in two orders', () => {
    for (const template of U14_TEMPLATES) {
      for (const question of generateMany(template.id, 12)) {
        const texts = question.answerMode === 'choice' || question.answerMode === 'multi'
          ? question.options.map(String)
          : [];
        for (const text of texts) {
          for (const combination of combinationsIn(text)) {
            // Descending, always: `10 + 5`, never `5 + 10`.
            const descending = [...combination].sort((a, b) => b - a);
            expect(combination, `${template.id}: ${text}`).toEqual(descending);
            // Every coin in a written combination is a real coin.
            for (const coin of combination) expect(COINS, template.id).toContain(coin);
          }
        }
      }
    }
  }, 60_000);
});
