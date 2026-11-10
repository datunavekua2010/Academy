import { describe, expect, it } from 'vitest';
import { U03_SUBTOPICS, U03_TEMPLATES } from '../src/practice/templates/u03-counting';
import { generateBatch } from '../src/practice/generator';
import { generateVariations } from '../src/practice/templates/generate';
import { shownKey } from '../src/practice/identity';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';

/**
 * U03 — generated counting questions must be *correct*, not merely well-formed.
 *
 * Every assertion here re-derives the answer from what the student can actually
 * see: the emoji drawn on the page, the numbers printed in the sentence. That is
 * the only way to catch the failure this suite exists for — a picture showing
 * seven stars with six as the key, or a row that reads "9, 8, __, 6" keyed to a
 * number that is not in it. A type checker cannot see either, and a child
 * experiences both as being marked wrong for being right.
 */

const SAMPLES = 60;

const generateMany = (templateId: string, count = SAMPLES) => {
  const template = U03_TEMPLATES.find((t) => t.id === templateId);
  if (!template) throw new Error(`no template ${templateId}`);
  for (let take = Math.min(count, SAMPLES); take >= 1; take = Math.floor(take / 2)) {
    try {
      return generateVariations(template, take, { seed: 20260303 });
    } catch {
      // too narrow for `take`; try a smaller batch
    }
  }
  throw new Error(`${templateId} could not produce even one variation`);
};

const numbersIn = (text: string): number[] => (text.match(/\d+/g) ?? []).map(Number);

const ref = (subtopicId: string) => ({ grade: 1 as const, topicId: 'datvla', subtopicId });

/** The run printed after the colon in "შეავსე ...: 4, 3, __, 1." */
const runIn = (prompt: string): string[] => {
  const tail = prompt.slice(prompt.indexOf(':') + 1).trim();
  return tail.replace(/\.$/, '').split(',').map((part) => part.trim());
};

/**
 * The step of a printed run, read from the first two printed numbers — the
 * second position can itself be a blank, so positions 0 and 1 are not enough.
 */
const stepOf = (parts: string[]): number => {
  const printed = parts.map((part, index) => ({ part, index })).filter(({ part }) => part !== '__');
  const [first, second] = printed;
  return second === undefined ? 0 : (Number(second.part) - Number(first.part)) / (second.index - first.index);
};

/** Every distinct emoji on the page, with how often it occurs. */
const drawn = (visual: string | undefined): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const symbol of [...(visual ?? '')]) {
    if (symbol.trim() === '') continue;
    counts.set(symbol, (counts.get(symbol) ?? 0) + 1);
  }
  return counts;
};

const TOY_NAMES = [
  'ვარსკვლავი', 'ვაშლი', 'ბუშტი', 'თევზი', 'ყვავილი',
  'ბურთი', 'ბანანი', 'ზარი', 'მსხალი', 'კექსი',
];

const SHAPE_PLURALS: Record<string, string> = {
  'სამკუთხედი': 'სამკუთხედები',
  'წრე': 'წრეები',
  'კვადრატი': 'კვადრატები',
  'რომბი': 'რომბები',
};

describe('U03 template library', () => {
  it('covers every U03 subtopic at every level', () => {
    for (const subtopic of U03_SUBTOPICS) {
      const templates = U03_TEMPLATES.filter((t) => t.subtopicId === subtopic);
      // Three types per subtopic, one per level. Two subtopics carry a fourth,
      // and only because the fourth answers a genuinely different shape: a
      // single number where the other asks for a pair (a walk that turns
      // around), and an ordering where the other asks for a number.
      expect(
        templates.length,
        `${subtopic} has ${templates.length} template(s)`,
      ).toBeGreaterThanOrEqual(3);
      expect([...new Set(templates.map((t) => t.difficulty))].sort()).toEqual([1, 2, 3]);
    }
  });

  it('replaces the placeholder for each subtopic', () => {
    for (const subtopic of U03_SUBTOPICS) {
      const registered = TEMPLATE_REGISTRY.forSubtopic(ref(subtopic));
      expect(registered.length, `nothing playable for ${subtopic}`).toBeGreaterThan(0);
      expect(
        registered.filter((t) => t.id === `g1-${subtopic}`),
        `placeholder still registered for ${subtopic}`,
      ).toEqual([]);
    }
  });

  it('can fill a perfect run at every level', () => {
    // A perfect session is 35 questions and the level is chosen by score, so a
    // student who keeps answering correctly must not run a level dry.
    for (const subtopic of U03_SUBTOPICS) {
      for (const level of [1, 2, 3] as const) {
        const keys = new Set(generateBatch(ref(subtopic), 60, { level }).map(shownKey));
        expect(
          keys.size,
          `${subtopic} level ${level}: only ${keys.size} distinct`,
        ).toBeGreaterThanOrEqual(35);
      }
    }
  });
});

describe('U03.1 — counting objects', () => {
  it('draws exactly as many objects as it keys', () => {
    for (const question of generateMany('g1-u03-1-count-row')) {
      const counts = drawn(question.visual);
      expect(counts.size, `no objects drawn: ${question.prompt}`).toBe(1);
      expect(Number(question.answer), question.prompt).toBe([...counts.values()][0]);
    }
  });

  it('keys the asked kind, not the other one', () => {
    for (const question of generateMany('g1-u03-1-count-one-kind')) {
      const counts = drawn(question.visual);
      expect(counts.size, question.prompt).toBe(2);
      const asked = question.prompt.match(/რამდენი (\S+) არის/)![1];
      // The emoji for the asked noun is the one the answer has to count.
      const emoji = [...counts.keys()].find((symbol) => {
        const name = {
          '⭐': 'ვარსკვლავი', '🍎': 'ვაშლი', '🎈': 'ბუშტი', '🐟': 'თევზი', '🌼': 'ყვავილი',
          '⚽': 'ბურთი', '🍌': 'ბანანი', '🔔': 'ზარი', '🍐': 'მსხალი', '🧁': 'კექსი',
        }[symbol];
        return name === asked;
      });
      expect(emoji, `no drawn group for "${asked}": ${question.prompt}`).toBeDefined();
      expect(Number(question.answer), question.prompt).toBe(counts.get(emoji!));
    }
  });

  it('adds up every group on the page, however many there are', () => {
    const seen = new Set<number>();
    for (const question of generateMany('g1-u03-1-add-groups', 120)) {
      const counts = drawn(question.visual);
      expect([2, 3], question.prompt).toContain(counts.size);
      seen.add(counts.size);
      const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
      expect(Number(question.answer), question.prompt).toBe(total);
      expect(total).toBeGreaterThanOrEqual(5);
      expect(total).toBeLessThanOrEqual(20);
      // The prompt has to name every kind on the page and no other: a group
      // that is counted but not named is an unanswerable question.
      const named = question.prompt.match(/სურათზე ([^.]*)\./)![1];
      const mentioned = TOY_NAMES.filter((name) => named.includes(name));
      expect(mentioned.length, question.prompt).toBe(counts.size);
    }
    // Both amounts of work have to be reachable, or the drawing is not drawn.
    expect([...seen].sort()).toEqual([2, 3]);
  });
});

describe('U03.2 — counting forwards and backwards', () => {
  it('fills the one blank with the number that keeps the run going', () => {
    for (const question of generateMany('g1-u03-2-fill-one')) {
      const parts = runIn(question.prompt);
      const blank = parts.indexOf('__');
      expect(parts.filter((part) => part === '__'), question.prompt).toHaveLength(1);
      expect(blank, question.prompt).toBeGreaterThan(0);
      // The direction comes from the printed numbers: the step is ±1.
      const step = stepOf(parts);
      expect(Math.abs(step), question.prompt).toBe(1);
      // Every printed number sits on the run, and the blank is the one that
      // completes it.
      parts.forEach((part, index) => {
        if (part === '__') return;
        expect(Number(part), question.prompt).toBe(Number(parts[0]) + step * index);
      });
      expect(Number(question.answer), question.prompt).toBe(Number(parts[0]) + step * blank);
    }
  });

  it('walks the number of steps it states', () => {
    for (const question of generateMany('g1-u03-2-take-steps')) {
      const [from, steps] = numbersIn(question.prompt);
      const forward = question.prompt.includes('ნაბიჯი წინ');
      expect(Number(question.answer), question.prompt).toBe(from + (forward ? steps : -steps));
      expect(Number(question.answer)).toBeGreaterThanOrEqual(1);
      expect(Number(question.answer)).toBeLessThanOrEqual(20);
    }
  });

  it('fills both blanks of a run in the right places', () => {
    for (const question of generateMany('g1-u03-2-two-gaps')) {
      const parts = runIn(question.prompt);
      const blanks = parts.map((part, index) => (part === '__' ? index : -1)).filter((i) => i >= 0);
      expect(blanks, question.prompt).toHaveLength(2);
      const step = stepOf(parts);
      expect(Math.abs(step), question.prompt).toBe(1);
      const expected = blanks.map((index) => Number(parts[0]) + step * index);
      const [a, b] = String(question.answer).split(',').map((part) => Number(part.trim()));
      expect(a, question.prompt).toBe(expected[0]);
      expect(b, question.prompt).toBe(expected[1]);
      expect(question.options).toContain(question.answer);
      expect(new Set(question.options).size, question.prompt).toBe(question.options.length);
    }
  });

  it('turns around inside the twenty', () => {
    for (const question of generateMany('g1-u03-2-turn-around')) {
      const [from, forward, back] = numbersIn(question.prompt);
      expect(Number(question.answer), question.prompt).toBe(from + forward - back);
      expect(Number(question.answer)).toBeGreaterThanOrEqual(1);
      expect(Number(question.answer)).toBeLessThanOrEqual(20);
    }
  });
});

describe('U03.3 — counting to 100', () => {
  it('names the neighbour in the direction it asks for', () => {
    for (const question of generateMany('g1-u03-3-neighbour')) {
      const n = numbersIn(question.prompt)[0];
      const after = question.prompt.includes('შემდეგ');
      expect(Number(question.answer), question.prompt).toBe(after ? n + 1 : n - 1);
      expect(Number(question.answer)).toBeGreaterThanOrEqual(1);
      expect(Number(question.answer)).toBeLessThanOrEqual(100);
      // The other direction is on offer, because that is the real mistake.
      const other = after ? n - 1 : n + 1;
      expect(question.options, question.prompt).toContain(String(other));
    }
  });

  it('fills a blank inside a run under a hundred', () => {
    for (const question of generateMany('g1-u03-3-fill-one')) {
      const parts = runIn(question.prompt);
      const blank = parts.indexOf('__');
      expect(blank, question.prompt).toBeGreaterThan(0);
      expect(Number(question.answer), question.prompt).toBe(Number(parts[blank - 1]) + 1);
    }
  });

  it('moves in tens only', () => {
    for (const question of generateMany('g1-u03-3-ten-more-less')) {
      const n = numbersIn(question.prompt)[0];
      const more = question.prompt.includes('მეტია');
      expect(Number(question.answer), question.prompt).toBe(more ? n + 10 : n - 10);
      expect(Number(question.answer)).toBeGreaterThanOrEqual(0);
      expect(Number(question.answer)).toBeLessThanOrEqual(100);
      // The units digit is untouched — that is the point of the question.
      expect(Math.abs(n % 10), question.prompt).toBe(Math.abs(Number(question.answer) % 10));
    }
  });

  it('orders its four numbers ascending', () => {
    for (const question of generateMany('g1-u03-3-order')) {
      const items = (question.orderItems ?? []).map(Number);
      expect(items.length, question.prompt).toBe(4);
      expect(new Set(items).size).toBe(4);
      const key = String(question.answer).split(',').map(Number);
      const chosen = key.map((position) => items[position - 1]);
      expect(chosen, `${question.prompt} ${items}`).toEqual([...items].sort((a, b) => a - b));
      // And the scramble is not already sorted, or there is nothing to do.
      expect(items).not.toEqual([...items].sort((a, b) => a - b));
    }
  });
});

describe('U03.4 — counting in tens and other steps', () => {
  it('continues a stepped sequence by its own step', () => {
    for (const question of generateMany('g1-u03-4-continue')) {
      const parts = runIn(question.prompt);
      expect(parts.filter((part) => part === '__')).toHaveLength(1);
      const step = Number(parts[1]) - Number(parts[0]);
      expect(step, question.prompt).toBeGreaterThan(1);
      // Every printed number is on that step, and the answer follows it.
      for (let i = 1; i < parts.length - 1; i += 1) {
        expect(Number(parts[i]) - Number(parts[i - 1]), question.prompt).toBe(step);
      }
      expect(Number(question.answer), question.prompt).toBe(Number(parts[parts.length - 2]) + step);
      expect(Number(question.answer)).toBeLessThanOrEqual(100);
    }
  });

  it('finds the gap in the middle of a stepped sequence', () => {
    for (const question of generateMany('g1-u03-4-step-gap')) {
      const parts = runIn(question.prompt);
      const blank = parts.indexOf('__');
      expect(blank, question.prompt).toBeGreaterThan(0);
      expect(blank).toBeLessThan(parts.length - 1);
      const step = parts[blank + 1] !== undefined
        ? (Number(parts[blank + 1]) - Number(parts[blank - 1])) / 2
        : Number(parts[blank - 1]) - Number(parts[blank - 2]);
      expect(Number(question.answer), question.prompt).toBe(Number(parts[blank - 1]) + step);
    }
  });

  it('takes exactly three steps for the third number', () => {
    for (const question of generateMany('g1-u03-4-third-step')) {
      const [start, step] = numbersIn(question.prompt);
      expect(Number(question.answer), question.prompt).toBe(start + 3 * step);
      // One step and two steps are both on offer: those are where a child lands
      // who stopped counting too early.
      expect(question.options, question.prompt).toContain(String(start + step));
      expect(Number(question.answer)).toBeLessThanOrEqual(100);
    }
  });
});

describe('U03.5 — building a target number', () => {
  it('asks only for what is missing from the target', () => {
    for (const question of generateMany('g1-u03-5-how-many-more')) {
      const have = question.prompt.match(/(\d+) \S+ არის/) ? numbersIn(question.prompt)[0] : 0;
      const target = numbersIn(question.prompt)[numbersIn(question.prompt).length - 1];
      expect(Number(question.answer), question.prompt).toBe(target - have);
      expect(Number(question.answer)).toBeGreaterThanOrEqual(1);
    }
  });

  it('fills the second group so the two reach the target', () => {
    for (const question of generateMany('g1-u03-5-second-group')) {
      const [target, first] = numbersIn(question.prompt);
      expect(Number(question.answer), question.prompt).toBe(target - first);
      expect(Number(question.answer)).toBeGreaterThanOrEqual(1);
      expect(Number(question.answer)).toBeLessThanOrEqual(20);
    }
  });

  it('leaves a third group that completes the target', () => {
    for (const question of generateMany('g1-u03-5-third-group')) {
      const [target, first, second] = numbersIn(question.prompt);
      const answer = Number(question.answer);
      expect(answer, question.prompt).toBe(target - first - second);
      expect(first + second + answer).toBe(target);
      expect(answer).toBeGreaterThanOrEqual(1);
      expect(answer).toBeLessThanOrEqual(9);
    }
  });
});

describe('U03.6 — choose and count', () => {
  it('counts the named shape out of the mixture', () => {
    for (const question of generateMany('g1-u03-6-count-a-shape')) {
      const counts = drawn(question.visual);
      expect(counts.size, question.prompt).toBe(2);
      const asked = question.prompt.match(/რამდენი (\S+) არის/)![1];
      const plural = SHAPE_PLURALS[asked];
      const emoji = { 'სამკუთხედი': '▲', 'წრე': '●', 'კვადრატი': '■', 'რომბი': '◆' }[asked];
      expect(plural, `unknown shape ${asked}`).toBeDefined();
      expect(Number(question.answer), question.prompt).toBe(counts.get(emoji));
    }
  });

  it('counts the colour it names', () => {
    const choices = generateMany('g1-u03-6-count-a-category', 120);
    for (const question of choices) {
      if (!question.prompt.includes('ბურთია')) continue;
      const counts = drawn(question.visual);
      expect(counts.size, question.prompt).toBe(2);
      const colour = question.prompt.match(/რამდენი (\S+) ბურთია/)![1];
      const emoji = { 'წითელი': '🔴', 'ლურჯი': '🔵', 'ყვითელი': '🟡', 'მწვანე': '🟢' }[colour];
      expect(emoji, `unknown colour ${colour}`).toBeDefined();
      expect(Number(question.answer), question.prompt).toBe(counts.get(emoji));
    }
  });

  it('adds both kinds of animal, not just one', () => {
    const choices = generateMany('g1-u03-6-count-a-category', 120);
    let seen = 0;
    for (const question of choices) {
      if (!question.prompt.includes('ცხოველია')) continue;
      seen += 1;
      const counts = drawn(question.visual);
      // Two kinds of animal and one kind of thing — three groups, and the
      // answer is the two animal groups together.
      expect(counts.size, question.prompt).toBe(3);
      const animalEmoji = ['🐱', '🐶', '🐦', '🐟'];
      const animals = [...counts.entries()]
        .filter(([emoji]) => animalEmoji.includes(emoji))
        .reduce((sum, [, count]) => sum + count, 0);
      expect(animals, question.prompt).toBe(Number(question.answer));
      // A single animal kind would be a smaller number that is also wrong.
      expect(Number(question.answer)).toBeGreaterThan(
        Math.max(...[...counts.entries()]
          .filter(([emoji]) => animalEmoji.includes(emoji))
          .map(([, count]) => count)),
      );
    }
    // The animal reading has to appear at all, or the test above proves nothing.
    expect(seen, 'no animal question generated').toBeGreaterThan(0);
  });

  it('adds exactly the two kinds it names', () => {
    for (const question of generateMany('g1-u03-6-add-two-kinds')) {
      const counts = drawn(question.visual);
      expect(counts.size, question.prompt).toBe(3);
      const named = question.prompt.match(/დაითვალე (\S+) და (\S+)\./)!;
      const emojiOf = (name: string) =>
        Object.entries(SHAPE_PLURALS).find(([, plural]) => plural === name)?.[0];
      const first = emojiOf(named[1]);
      const second = emojiOf(named[2]);
      expect(first, `unknown shape \"${named[1]}\"`).toBeDefined();
      expect(second, `unknown shape \"${named[2]}\"`).toBeDefined();
      const emojiFor = { 'სამკუთხედი': '▲', 'წრე': '●', 'კვადრატი': '■', 'რომბი': '◆' };
      const answer =
        counts.get(emojiFor[first!])! + counts.get(emojiFor[second!])!;
      expect(Number(question.answer), question.prompt).toBe(answer);
      // Counting the whole page is the mistake this level is built to catch,
      // so it has to be on offer and has to be different from the answer.
      const whole = [...counts.values()].reduce((sum, count) => sum + count, 0);
      expect(whole, question.prompt).toBeGreaterThan(Number(question.answer));
      expect(question.options, question.prompt).toContain(String(whole));
      expect(question.options, question.prompt).toContain(String(Number(question.answer)));
      expect(new Set(question.options).size, question.prompt).toBe(question.options.length);
    }
  });
});

describe('U03 rendering', () => {
  it('never prints a placeholder, NaN or undefined', () => {
    for (const subtopic of U03_SUBTOPICS) {
      for (const level of [1, 2, 3] as const) {
        for (const question of generateBatch(ref(subtopic), 40, { level })) {
          const text = [question.prompt, question.visual ?? '', ...(question.options ?? [])].join(' ');
          expect(text, question.templateId).not.toMatch(/\{[a-zA-Z]+\}/);
          expect(text, question.templateId).not.toMatch(/NaN|undefined|Infinity/);
          expect(question.prompt.trim().length, question.templateId).toBeGreaterThan(0);
        }
      }
    }
  });

  it('keeps every count inside the range its subtopic states', () => {
    for (const question of generateMany('g1-u03-1-count-row', 120)) {
      const answer = Number(question.answer);
      expect(answer).toBeGreaterThanOrEqual(1);
      expect(answer).toBeLessThanOrEqual(10);
    }
    for (const question of generateMany('g1-u03-1-add-groups', 120)) {
      const answer = Number(question.answer);
      expect(answer).toBeGreaterThanOrEqual(5);
      expect(answer).toBeLessThanOrEqual(20);
    }
  });
});
