import { describe, expect, it } from 'vitest';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { previewTemplate } from '../src/practice/generator';
import { asClock } from '../src/practice/templates/generate';
import type { InteractionSpec } from '../src/practice/interactions/types';

/**
 * Every interactive question must be answerable *by the widget it shows*: the
 * key has to be a state the student can actually reach, in the format the
 * widget submits. A key outside that set would be a question nobody can get right.
 */
const interactive = TEMPLATE_REGISTRY.all.filter((template) => template.interaction);

/** Can `coins` (at most 16 of them) sum to `total` using exactly `count` coins (any count when null)? */
function reachable(coins: number[], total: number, count: number | null): boolean {
  const seen = new Set<string>();
  const walk = (left: number, used: number): boolean => {
    if (left === 0) return count === null || used === count;
    if (used >= 16 || (count !== null && used >= count)) return false;
    const key = `${left}/${used}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return coins.some((coin) => coin <= left && walk(left - coin, used + 1));
  };
  return walk(total, 0);
}

/** Evaluates an expression of plain numbers and + − × ÷ (with the usual precedence). */
function evaluate(expression: string): number {
  const text = expression.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/');
  if (!/^[\d+\-*/().\s]+$/.test(text)) throw new Error(`cannot evaluate ${expression}`);
  return Function(`"use strict"; return (${text});`)() as number;
}

function check(spec: InteractionSpec, answer: string): void {
  switch (spec.kind) {
    case 'line': {
      const value = Number(answer);
      const step = spec.step ?? 1;
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(spec.min);
      expect(value).toBeLessThanOrEqual(spec.max);
      expect((value - spec.min) % step).toBe(0);
      if (spec.start !== undefined) {
        expect(spec.start).toBeGreaterThanOrEqual(spec.min);
        expect(spec.start).toBeLessThanOrEqual(spec.max);
      }
      if (spec.bar !== undefined) expect(spec.bar).toBe(value);
      return;
    }
    case 'chart': {
      const value = Number(answer);
      expect(value).toBeGreaterThanOrEqual(spec.from);
      expect(value).toBeLessThanOrEqual(spec.to);
      return;
    }
    case 'pick': {
      const positions = answer.split(',').map(Number);
      expect(positions.length).toBeGreaterThan(0);
      if (spec.mode === 'one') expect(positions).toHaveLength(1);
      for (const position of positions) {
        expect(position).toBeGreaterThanOrEqual(1);
        expect(position).toBeLessThanOrEqual(spec.items.length);
      }
      // A question with the same item twice offers two "right" taps; labels must be unique.
      const labels = spec.items.map((item) => item.label ?? item.icon);
      if (spec.mode === 'one') {
        const picked = labels[positions[0]! - 1];
        const duplicates = labels.filter((label) => label === picked).length;
        const looksLikeOddOneOut = new Set(labels).size <= 2;
        if (!looksLikeOddOneOut) expect(duplicates).toBe(1);
        else expect(duplicates).toBe(1);
      }
      return;
    }
    case 'clock': {
      const clock = asClock(answer);
      expect(clock).toBeTruthy();
      const [hour, minute] = clock!.split(':').map(Number);
      expect(hour).toBeGreaterThanOrEqual(1);
      expect(hour).toBeLessThanOrEqual(12);
      expect(minute! % (spec.minuteStep ?? 5)).toBe(0);
      return;
    }
    case 'fill': {
      const value = Number(answer);
      const locked = spec.locked ?? 0;
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      if ((spec.output ?? 'all') === 'all') {
        expect(value).toBeGreaterThanOrEqual(locked);
        expect(value).toBeLessThanOrEqual(spec.total);
      } else {
        expect(value).toBeLessThanOrEqual(spec.total - locked);
      }
      expect(spec.start ?? 0).toBeLessThanOrEqual(spec.total);
      expect(locked).toBeLessThanOrEqual(spec.start ?? 0);
      return;
    }
    case 'build': {
      const maxTens = spec.maxTens ?? 10;
      if (spec.output === 'number') {
        const value = Number(answer);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(maxTens * 10);
      } else {
        const [tens, ones] = answer.split(',').map(Number);
        expect(tens).toBeLessThanOrEqual(maxTens);
        expect(ones).toBeLessThanOrEqual(30);
        expect(tens! * 10 + ones!).toBeGreaterThan(0);
      }
      return;
    }
    case 'purse': {
      if (spec.output === 'total') {
        expect(reachable(spec.coins, Number(answer), null)).toBe(true);
      } else {
        const [total, count] = answer.split('/').map(Number);
        expect(reachable(spec.coins, total!, count!)).toBe(true);
      }
      return;
    }
    case 'bins': {
      const bins = answer.split(',').map(Number);
      expect(bins).toHaveLength(spec.items.length);
      for (const bin of bins) {
        expect(bin).toBeGreaterThanOrEqual(0);
        expect(bin).toBeLessThan(spec.bins.length);
      }
      // A bin nobody belongs to is fine, but a single-bin answer would make the sort trivial.
      expect(new Set(bins).size).toBeGreaterThanOrEqual(2);
      return;
    }
    case 'counters': {
      const counts = answer.split(',').map(Number);
      expect(counts).toHaveLength(spec.labels.length);
      for (const count of counts) {
        expect(count).toBeGreaterThanOrEqual(0);
        expect(count).toBeLessThanOrEqual(spec.max);
      }
      return;
    }
    case 'sequence': {
      const keys = answer.split(',');
      expect(keys).toHaveLength(spec.length);
      for (const key of keys) expect(spec.palette).toContain(key);
      return;
    }
    case 'cells': {
      const rows = answer.split('/');
      expect(rows).toHaveLength(spec.rows.length);
      rows.forEach((row, i) => expect(row).toHaveLength(spec.rows[i]!.length));
      // The answer is the exact mirror of the shown half.
      rows.forEach((row, i) => expect(row).toBe([...spec.rows[i]!].reverse().join('')));
      return;
    }
    case 'array': {
      if (spec.output === 'dims') {
        const [r, c] = answer.split(',').map(Number);
        expect(r).toBeGreaterThanOrEqual(1);
        expect(r).toBeLessThanOrEqual(spec.maxRows);
        expect(c).toBeGreaterThanOrEqual(1);
        expect(c).toBeLessThanOrEqual(spec.maxCols);
        return;
      }
      // One side is fixed: the other side is whatever makes the key true, and it must fit the grid.
      const value = Number(answer);
      const rows = spec.fixedRows;
      const cols = spec.fixedCols;
      expect(rows !== undefined || cols !== undefined).toBe(true);
      const fixed = (rows ?? cols)!;
      const free = spec.output === 'count' ? value / fixed : value / 2 - fixed;
      expect(Number.isInteger(free)).toBe(true);
      expect(free).toBeGreaterThanOrEqual(1);
      expect(free).toBeLessThanOrEqual(rows !== undefined ? spec.maxCols : spec.maxRows);
      if (rows !== undefined) expect(rows).toBeLessThanOrEqual(spec.maxRows);
      if (cols !== undefined) expect(cols).toBeLessThanOrEqual(spec.maxCols);
      return;
    }
    case 'angle': {
      const degrees = Number(answer);
      const step = spec.step ?? 5;
      expect(degrees % step).toBe(0);
      expect(degrees).toBeGreaterThanOrEqual(0);
      expect(degrees).toBeLessThanOrEqual(spec.max ?? 180);
      return;
    }
    case 'place': {
      expect(answer).toMatch(/^\d+$/);
      expect(answer.length).toBeLessThanOrEqual(spec.digits);
      return;
    }
    case 'tiles': {
      const slotCount = (spec.frame ?? Array.from({ length: spec.slots ?? spec.cards.length }, () => '?')).filter((t) => t === '?').length;
      const joiner = spec.joiner ?? '';
      const pool = [...spec.cards];
      const parts = joiner ? answer.split(joiner) : spec.cards.length === slotCount ? [...answer] : [];
      expect(parts).toHaveLength(slotCount);
      for (const part of parts) {
        const at = pool.indexOf(part);
        expect(at).toBeGreaterThanOrEqual(0);
        pool.splice(at, 1);
      }
      return;
    }
    case 'slots': {
      const symbols = answer.split(',');
      expect(symbols).toHaveLength(spec.tokens.filter((token) => token === '?').length);
      for (const symbol of symbols) expect(spec.options).toContain(symbol);
      // When the tokens are arithmetic, the equation must be TRUE with the key filled in.
      if (!spec.tokens.some((token) => /[ა-ჰ]/.test(token))) {
        let index = 0;
        const filled = spec.tokens.map((token) => (token === '?' ? symbols[index++]! : token));
        const relation = filled.findIndex((token) => ['<', '>', '='].includes(token));
        if (relation >= 0) {
          const left = evaluate(filled.slice(0, relation).join(' '));
          const right = evaluate(filled.slice(relation + 1).join(' '));
          const sign = filled[relation];
          expect(sign === '<' ? left < right : sign === '>' ? left > right : left === right).toBe(true);
        } else if (filled.includes('=')) {
          const at = filled.indexOf('=');
          expect(evaluate(filled.slice(0, at).join(' '))).toBe(evaluate(filled.slice(at + 1).join(' ')));
        } else {
          // `a ? b = c`: the slot sits between the numbers and the sign is the equals relation
          const at = filled.indexOf('=');
          expect(at).toBeGreaterThan(0);
        }
      }
      return;
    }
  }
}

describe('interactive templates', () => {
  it('there are interactive templates in both grades', () => {
    expect(interactive.filter((t) => t.grade === 1).length).toBeGreaterThan(40);
    expect(interactive.filter((t) => t.grade === 2).length).toBeGreaterThan(50);
    expect(interactive.filter((t) => t.grade === 3).length).toBeGreaterThan(50);
  });

  for (const template of interactive) {
    it(`${template.id}: the key is a state its widget can reach`, () => {
      const questions = previewTemplate(template.id, 25);
      expect(questions.length).toBeGreaterThan(2);
      for (const question of questions) {
        expect(question.answerMode).toBe('interactive');
        expect(question.options).toEqual([]);
        check(question.interaction!, question.answer);
      }
    });
  }
});
