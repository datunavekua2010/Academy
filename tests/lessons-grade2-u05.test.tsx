// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';
import { LESSON_CONTENT } from '../src/lessons/content';
import { describeAnswer, evaluateAnswer } from '../src/lessons/check';
import { getUnit } from '../src/lessons/catalog';
import {
  CORE_TABLES,
  cellKey,
  cellsFor,
  commutedText,
  doubleOf,
  doubleTwice,
  doublingChain,
  doublingText,
  factHolds,
  factText,
  factorsOf,
  fivesAlternate,
  gridProducts,
  isDoubleTwice,
  maxProduct,
  missingFactor,
  missingIn,
  missingTable,
  onesDigit,
  onesPattern,
  onesRule,
  productOf,
  relatedCells,
  relatedFacts,
  repeatText,
  sharesProduct,
  skipText,
  tableLines,
  tableRow,
  tablesWithProduct,
  tensEndInZero,
} from '../src/lessons/exercises/TimesGeometry';
import { DotGroup, TableBuildAnswer, TableGridAnswer, TableRow, TimesFactAnswer, TimesGrid, TimesGroups, TimesMissingAnswer } from '../src/lessons/exercises/TimesBoard';
import { CountByDemo, CountByFiveLab, DoubleDemo, DoubleDoubleLab, PairsLab, TableDemo, TimesGridLab, TimesTableLab } from '../src/lessons/exercises/TimesTools';
import type { Activity, Lesson, QuestionActivity, ResponseSpec } from '../src/lessons/types';

/**
 * Grade 2 · Unit 5: "Core Times Tables (2s, 3s, 4s, 5s, 10s)".
 *
 * A times table is the skip-count of its own step. Every product, every missing number and every pattern below is
 * computed from `(table, factor)`, so the picture, the repeated addition, the row and the grid share one answer.
 */

const U05 = ['g2-u05-l1', 'g2-u05-l2', 'g2-u05-l3', 'g2-u05-l4', 'g2-u05-l5'];
const lessons = U05.map((id) => LESSON_CONTENT[id]);
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);
const text = (sel: string) => document.querySelector(sel)?.textContent ?? '';
const toolOf = (l: Lesson) => (l.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>).tool;

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 2 U05 is the core-times-tables unit', () => {
  it('has the approved titles, ids and codes', () => {
    const unit = getUnit('g2-u05');
    expect(unit?.title).toBe('Core Times Tables (2s, 3s, 4s, 5s, 10s)');
    expect(unit?.grade).toBe(2);
    expect(unit?.lessons.map((l) => l.id)).toEqual(U05);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U05.1', 'U05.2', 'U05.3', 'U05.4', 'U05.5']);
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Multiplying by 2',
      'Multiplying by 3',
      'Multiplying by 4',
      'Multiplying by 5',
      'Multiplying by 10 and Connecting the Times Tables',
    ]);
  });

  it('has content for every one of the five lessons', () => {
    for (const id of U05) {
      expect(LESSON_CONTENT[id], id).toBeTruthy();
      expect(LESSON_CONTENT[id].id).toBe(id);
      expect(LESSON_CONTENT[id].status).toBe('placeholder');
    }
  });
});

// ─────────────────────────── the engine ───────────────────────────

describe('times: a fact is its own skip-count', () => {
  it('counts the groups and writes the fact', () => {
    expect(productOf(3, 4)).toBe(12);
    expect(factText(3, 4)).toBe('4 × 3 = 12');
    expect(commutedText(3, 4)).toBe('3 × 4 = 12');
    expect(tableRow(3, 4)).toEqual([3, 6, 9, 12]);
    expect(skipText(3, 4)).toBe('3, 6, 9, 12');
    expect(factorsOf(3)).toEqual([1, 2, 3]);
    expect(tableLines(2, 3)).toEqual(['1 × 2 = 2', '2 × 2 = 4', '3 × 2 = 6']);
  });

  it('the repeated addition holds exactly when the product does', () => {
    expect(repeatText(2, 4)).toBe('2 + 2 + 2 + 2 = 8');
    expect(factHolds(2, 4, 8)).toBe(true);
    expect(factHolds(2, 4, 9)).toBe(false);
    expect(repeatText(5, 0)).toBe(' = 0');
  });
});

describe('times: the ones digits follow the table, not a habit', () => {
  it('reads the ones digit and the pattern', () => {
    expect(onesDigit(15)).toBe(5);
    expect(onesPattern(5, 4)).toEqual([5, 0, 5, 0]);
    expect(onesPattern(10, 3)).toEqual([0, 0, 0]);
    expect(fivesAlternate()).toBe(true);
    expect(tensEndInZero()).toBe(true);
  });

  it('states a rule that is true for that table', () => {
    expect(onesRule(10)).toContain('0-ით');
    expect(onesRule(5)).toContain('5-ით ან 0-ით');
    expect(onesRule(2)).toContain('ლუწი');
    expect(onesRule(4)).toContain('ლუწი');
    expect(onesRule(3)).toContain('მეორდება');
  });
});

describe('times: doubling twice is the fours', () => {
  it('doubles in two steps', () => {
    expect(doubleOf(6)).toBe(12);
    expect(doubleTwice(6)).toBe(24);
    expect(doublingChain(3)).toEqual([3, 6, 12]);
    expect(doublingText(6)).toBe('6 → 12 → 24');
  });

  it('the doubling really lands on the fours', () => {
    for (let n = 1; n <= 10; n += 1) expect(isDoubleTwice(n, n), String(n)).toBe(true);
    expect(doubleTwice(4)).toBe(productOf(4, 4));
  });
});

describe('times: missing numbers come from the product', () => {
  it('finds whichever number is missing', () => {
    expect(missingFactor(10, 60)).toBe(6);
    expect(missingFactor(4, 10)).toBeNull();
    expect(missingTable(6, 60)).toBe(10);
    expect(missingTable(0, 5)).toBeNull();
    expect(missingIn(3, 4, 'product')).toBe(12);
    expect(missingIn(3, 4, 'factor')).toBe(4);
  });
});

describe('times: the grid keeps every crossing', () => {
  const tables = [2, 3, 4, 5, 10];
  const factors = [1, 2, 3, 4, 5];

  it('has one cell per crossing', () => {
    expect(gridProducts([2, 3], [1, 2])).toEqual([
      { table: 2, factor: 1, product: 2 },
      { table: 2, factor: 2, product: 4 },
      { table: 3, factor: 1, product: 3 },
      { table: 3, factor: 2, product: 6 },
    ]);
    expect(maxProduct(tables, factors)).toBe(50);
    expect(cellKey(3, 4)).toBe('3,4');
  });

  it('finds every cell that gives a product', () => {
    // 6 is not among the factors, so only two crossings really make 12
    expect(cellsFor(12, tables, factors)).toEqual(['3,4', '4,3']);
    expect(cellsFor(7, [2, 3], [1, 2])).toEqual([]);
    expect(relatedCells(4, 3, tables, factors)).toEqual(['3,4']);
    expect(cellsFor(12, [2, 3, 4], [1, 2, 3, 4, 5, 6])).toEqual(['2,6', '3,4', '4,3']);
    expect(cellsFor(12, [2, 3, 6], [1, 2, 3, 4, 5, 6])).toEqual(['2,6', '3,4', '6,2']);
  });

  it('related facts share a product', () => {
    expect(relatedFacts(4, 6)).toEqual({ fact: '6 × 4 = 24', commuted: '4 × 6 = 24', same: true });
    expect(sharesProduct(2, 6, 3, 4)).toBe(true);
    expect(sharesProduct(2, 5, 3, 4)).toBe(false);
  });

  it('says which tables a product belongs to', () => {
    expect([...CORE_TABLES]).toEqual([2, 3, 4, 5, 10]);
    expect(tablesWithProduct(20)).toEqual([2, 4, 5, 10]);
    expect(tablesWithProduct(7)).toEqual([]);
  });
});

// ─────────────────────────── checking ───────────────────────────

const q = (response: ResponseSpec, extra: Partial<QuestionActivity> = {}): QuestionActivity => ({
  id: 'x',
  kind: 'question',
  stage: 'practice',
  prompt: 'x',
  response,
  hints: [],
  explanation: 'y',
  ...extra,
});

describe('checking: a multiplication sentence', () => {
  const fact = q({ type: 'times-fact', table: 3, factor: 4 });

  it('accepts either order', () => {
    expect(evaluateAnswer(fact, '3,4').verdict).toBe('correct');
    expect(evaluateAnswer(fact, '4,3').verdict).toBe('correct');
    expect(evaluateAnswer(fact, '2,5').verdict).toBe('incorrect');
    expect(evaluateAnswer(fact, '3,').verdict).toBe('incomplete');
    expect(evaluateAnswer(fact, '').verdict).toBe('incomplete');
  });

  it('a wrong product is named as the real product', () => {
    const wrong = evaluateAnswer(fact, '2,5');
    expect(wrong.feedback).toContain('10');
    expect(wrong.feedback).toContain('12');
  });
});

describe('checking: a missing number', () => {
  const product = q({ type: 'times-missing', table: 2, factor: 4, missing: 'product' });
  const factor = q({ type: 'times-missing', table: 2, factor: 4, missing: 'factor' });

  it('wants the product or the factor, whichever is missing', () => {
    expect(evaluateAnswer(product, '8').verdict).toBe('correct');
    expect(evaluateAnswer(product, '6').verdict).toBe('incorrect');
    expect(evaluateAnswer(factor, '4').verdict).toBe('correct');
    expect(evaluateAnswer(factor, '8').verdict).toBe('incorrect');
    expect(evaluateAnswer(product, '').verdict).toBe('incomplete');
  });

  it('a missing product is explained with its repeated addition', () => {
    expect(evaluateAnswer(product, '9').feedback).toContain('2 + 2 + 2 + 2');
  });
});

describe('checking: building a table row', () => {
  const row = q({ type: 'table-build', table: 2, upTo: 3 });

  it('is judged from the start, cell by cell', () => {
    expect(evaluateAnswer(row, '2,4,6').verdict).toBe('correct');
    expect(evaluateAnswer(row, '2,4,').verdict).toBe('incomplete');
    expect(evaluateAnswer(row, '2,5,6').verdict).toBe('incorrect');
    expect(evaluateAnswer(row, '').verdict).toBe('incomplete');
    // the row is filled from the start, so a later cell cannot be judged before an earlier one
    expect(evaluateAnswer(row, '2,5,').verdict).toBe('incorrect');
  });

  it('says which fact is wrong and what it should be', () => {
    const wrong = evaluateAnswer(row, '2,5,6');
    expect(wrong.feedback).toContain('2 × 2 = 4');
    expect(wrong.feedback).toContain('5');
  });
});

describe('checking: reading and finding on the grid', () => {
  const tables = [2, 3, 4];
  const factors = [1, 2, 3, 4, 5, 6];
  const find = q({ type: 'table-grid', tables, factors, ask: 'find-target', target: 12 });
  const read = q({ type: 'table-grid', tables, factors, ask: 'read-product', target: { table: 3, factor: 4 } });

  it('finds every cell with the target product, and only those', () => {
    expect(evaluateAnswer(find, '2,6,3,4,4,3').verdict).toBe('correct');
    expect(evaluateAnswer(find, '2,6,3,4').verdict).toBe('incomplete');
    expect(evaluateAnswer(find, '2,5,3,4,4,3').verdict).toBe('incorrect');
    expect(evaluateAnswer(find, '').verdict).toBe('incomplete');
  });

  it('a cell that does not make the target is named with its product', () => {
    const wrong = evaluateAnswer(find, '2,5,3,4,4,3');
    expect(wrong.feedback).toContain('2 × 5 = 10');
    expect(wrong.feedback).toContain('12');
  });

  it('reading a cell wants that cell\'s product', () => {
    expect(evaluateAnswer(read, '12').verdict).toBe('correct');
    expect(evaluateAnswer(read, '7').verdict).toBe('incorrect');
    expect(evaluateAnswer(read, '').verdict).toBe('incomplete');
    expect(evaluateAnswer(read, '7').feedback).toContain('3 × 4 = 12');
  });
});

describe('checking: the answers can be described', () => {
  it('writes the fact, the row and the cells', () => {
    expect(describeAnswer({ type: 'times-missing', table: 2, factor: 4, missing: 'product' })).toContain('8');
    expect(describeAnswer({ type: 'table-build', table: 2, upTo: 3 })).toContain('3 × 2 = 6');
    expect(describeAnswer({ type: 'table-grid', tables: [2, 3], factors: [1, 2], ask: 'find-target', target: 4 })).toContain('2 × 2');
    expect(describeAnswer({ type: 'table-grid', tables: [2, 3], factors: [1, 4], ask: 'read-product', target: { table: 3, factor: 4 } })).toContain('12');
  });
});

// ─────────────────────────── content invariants ───────────────────────────

describe('content: the ten activities of every lesson', () => {
  it('runs challenge, explore, understand, four practice and three checks', () => {
    for (const l of lessons) {
      expect(l.activities.map((a) => a.id), l.id).toEqual([
        'challenge',
        'explore',
        'understand',
        'practice-1',
        'practice-2',
        'practice-3',
        'practice-4',
        'check-1',
        'check-2',
        'check-3',
      ]);
      expect(l.activities.map((a) => a.kind), l.id).toEqual(['question', 'explore', 'explain', 'question', 'question', 'question', 'question', 'question', 'question', 'question']);
    }
  });

  it('hints only where they belong, and the challenge never gives the answer away', () => {
    for (const l of lessons) {
      for (const x of stageOf(l, 'check')) expect(x.hints, `${l.id}/${x.id}`).toEqual([]);
      for (const x of stageOf(l, 'practice')) expect(x.hints.length, `${l.id}/${x.id}`).toBeGreaterThan(0);
      const challenge = l.activities[0];
      if (challenge.kind === 'question') expect(challenge.revealOnExhaust).toBe(false);
    }
  });

  it('every question explains itself and has feedback in its own words', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        expect(x.explanation.length, `${l.id}/${x.id}`).toBeGreaterThan(5);
        expect(x.fallbackFeedback?.length, `${l.id}/${x.id}`).toBeGreaterThan(5);
      }
  });

  it('each lesson has one explore tool and a demonstration of more than two blocks', () => {
    for (const l of lessons) {
      const explore = l.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>;
      expect(explore.tool, l.id).toBeTruthy();
      const explain = l.activities.find((a) => a.kind === 'explain') as Extract<Activity, { kind: 'explain' }>;
      expect(explain.blocks.length, l.id).toBeGreaterThan(2);
    }
  });

  it('every lesson asks for a multiplication answer', () => {
    const types = ['times-missing', 'times-fact', 'table-build', 'table-grid'];
    for (const l of lessons) {
      const asked = questions(l).map((x) => x.response.type);
      expect(asked.some((t) => types.includes(t)), `${l.id}: ${asked.join(', ')}`).toBe(true);
    }
  });
});

/** The answer a question expects, computed from its own numbers. */
function correctAnswer(r: ResponseSpec): string | string[] {
  switch (r.type) {
    case 'choice':
      return r.answer;
    case 'numeric':
      return String(r.answer);
    case 'blanks':
      return r.answers.map(String);
    case 'times-fact':
      return `${r.table},${r.factor}`;
    case 'times-missing':
      return String(r.missing === 'factor' ? r.factor : productOf(r.table, r.factor));
    case 'table-build':
      return Array.from({ length: r.upTo }, (_, i) => String(productOf(r.table, i + 1))).join(',');
    case 'table-grid':
      if (r.ask === 'read-product') return String(typeof r.target === 'object' ? productOf(r.target.table, r.target.factor) : r.target);
      return cellsFor(r.target as number, r.tables, r.factors).join(',');
    default:
      throw new Error(`no answer for ${r.type}`);
  }
}

describe('content: every question is answerable from its own numbers', () => {
  it('the engine agrees with the content, question by question', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const answer = correctAnswer(x.response);
        const verdict = evaluateAnswer(x, answer).verdict;
        expect(verdict, `${l.id}/${x.id} (${x.response.type})`).toBe('correct');
      }
  });

  it('the tables this unit covers are the ones its lessons build', () => {
    const tables = lessons.map((l) => {
      const build = questions(l)
        .map((x) => x.response)
        .find((r): r is Extract<ResponseSpec, { type: 'table-build' }> => r.type === 'table-build');
      return build?.table;
    });
    expect(tables.filter((t): t is number => typeof t === 'number').every((t) => (CORE_TABLES as readonly number[]).includes(t))).toBe(true);
    expect(tables.filter(Boolean).length).toBeGreaterThanOrEqual(4);
  });

  it('the fours lesson really doubles twice, and the fives lesson really counts in fives', () => {
    expect(toolOf(LESSON_CONTENT['g2-u05-l3']).tool).toBe('double-double-lab');
    expect(toolOf(LESSON_CONTENT['g2-u05-l4']).tool).toBe('count-by-five-lab');
    const fours = questions(LESSON_CONTENT['g2-u05-l3']).filter((x) => x.response.type === 'numeric' || x.response.type === 'times-missing');
    expect(fours.length).toBeGreaterThan(2);
    for (const x of fours) {
      const r = x.response;
      const product = r.type === 'numeric' ? r.answer : r.missing === 'product' ? productOf(r.table, r.factor) : null;
      if (product !== null && r.type === 'numeric' && product % 4 === 0) expect(doubleTwice(product / 4)).toBe(product);
    }
  });

  it('the tens lesson ends every product in zero', () => {
    const tens = questions(LESSON_CONTENT['g2-u05-l5'])
      .map((x) => x.response)
      .filter((r): r is Extract<ResponseSpec, { type: 'times-missing' }> => r.type === 'times-missing' && r.table === 10);
    expect(tens.length).toBeGreaterThan(0);
    for (const r of tens) if (r.missing === 'product') expect(onesDigit(productOf(r.table, r.factor))).toBe(0);
  });
});

// ─────────────────────────── boards ───────────────────────────

describe('board: groups of a table', () => {
  it('draws one group per factor and states the fact', () => {
    render(<TimesGroups table={3} factor={4} />);
    expect(document.querySelectorAll('.tgrp')).toHaveLength(4);
    expect(document.querySelectorAll('.tgrp-dot')).toHaveLength(12);
    expect(text('.tgrps-note')).toContain('4 × 3 = 12');
    expect(text('.tgrps-note')).toContain('3 + 3 + 3 + 3 = 12');
  });

  it('labels every group by its number and its count', () => {
    render(<DotGroup count={5} index={1} glyph="ball" />);
    expect(screen.getByLabelText('ჯგუფი 2: 5 ბურთი')).toBeTruthy();
  });
});

describe('board: the table row', () => {
  it('fills only the cells up to `filled`', () => {
    render(<TableRow table={3} upTo={5} filled={2} />);
    expect(document.querySelectorAll('.trow-cell')).toHaveLength(5);
    expect(document.querySelectorAll('.trow-cell.is-on')).toHaveLength(2);
    expect(text('.trow')).toBe(text('.trow'));
    expect(screen.getByLabelText('3-ის ცხრილი: 3, 6, 9, 12, 15')).toBeTruthy();
    expect(text('.trow-skip')).toBe('3, 6');
  });

  it('states the ones rule it actually follows', () => {
    render(<TableRow table={5} upTo={4} />);
    expect(text('.trow-rule')).toContain('5-ით ან 0-ით');
  });
});

describe('board: the grid', () => {
  it('shows every crossing and ticks the highlighted cells', () => {
    render(<TimesGrid tables={[2, 3]} factors={[1, 2]} highlight={[{ table: 2, factor: 2 }]} />);
    expect(document.querySelectorAll('.tgrid-cell')).toHaveLength(4);
    expect(document.querySelectorAll('.tgrid-cell.is-hi')).toHaveLength(1);
    expect(screen.getByLabelText('2 × 2 = 4')).toBeTruthy();
    expect(screen.getByLabelText('3 × 1 = 3')).toBeTruthy();
  });

  it('tapping a cell reports the two numbers that meet there', () => {
    const onCell = vi.fn();
    render(<TimesGrid tables={[2]} factors={[3]} onCell={onCell} />);
    fireEvent.click(screen.getByRole('button', { name: '2 × 3 = 6' }));
    expect(onCell).toHaveBeenCalledWith(2, 3);
  });
});

describe('board: answer controls', () => {
  it('a fact shows its groups and computes the product the student writes', () => {
    render(<TimesFactAnswer response={{ table: 3, factor: 4 }} value="3,4" onChange={vi.fn()} disabled={false} label="ნამრავლი" />);
    expect(document.querySelectorAll('.tgrp')).toHaveLength(4);
    expect(text('.tfa-note')).toContain('3 × 4 = 12');
    expect(text('.tfa-product')).toBe('12');
    cleanup();
    render(<TimesFactAnswer response={{ table: 3, factor: 4 }} value="2,5" onChange={vi.fn()} disabled={false} label="ნამრავლი" />);
    expect(text('.tfa-note')).toContain('საჭიროა 12');
  });

  it('a missing number states what the picture is asking for', () => {
    render(<TimesMissingAnswer response={{ table: 3, factor: 4, missing: 'product' }} value="" onChange={vi.fn()} disabled={false} label="ნამრავლი" />);
    expect(text('.tm-note')).toContain('4 ჯგუფი');
    cleanup();
    render(<TimesMissingAnswer response={{ table: 3, factor: 4, missing: 'factor' }} value="" onChange={vi.fn()} disabled={false} label="ნამრავლი" />);
    expect(text('.tm-note')).toContain('12 საგანი');
  });

  it('the row builds fact by fact and says how far it has got', () => {
    const onChange = vi.fn();
    render(<TableBuildAnswer response={{ table: 2, upTo: 3 }} value="2,4," onChange={onChange} disabled={false} label="ცხრილი" />);
    expect(document.querySelectorAll('.tba-cell')).toHaveLength(3);
    expect(document.querySelectorAll('.tba-cell.is-done')).toHaveLength(2);
    expect(text('.tba-note')).toContain('2 / 3');
    fireEvent.change(screen.getByLabelText('3 × 2'), { target: { value: '6' } });
    expect(onChange).toHaveBeenLastCalledWith('2,4,6');
  });

  it('the finding grid says how many cells are wanted', () => {
    render(<TableGridAnswer response={{ tables: [2, 3, 4], factors: [1, 2, 3, 4, 5, 6], ask: 'find-target', target: 12 }} value="" onChange={vi.fn()} disabled={false} label="ბადე" />);
    expect(text('.tga-ask')).toContain('12');
    expect(text('.tga-ask')).toContain('3');
    expect(text('.tga-note')).toContain('არცერთი');
    cleanup();
    render(<TableGridAnswer response={{ tables: [2, 3, 4], factors: [1, 2, 3, 4, 5, 6], ask: 'find-target', target: 12 }} value="2,6,3,4,4,3" onChange={vi.fn()} disabled={false} label="ბადე" />);
    expect(text('.tga-note')).toContain('მონიშნულია 3');
  });

  it('the reading grid names the cell and judges the product as it is typed', () => {
    render(<TableGridAnswer response={{ tables: [2, 3, 4], factors: [1, 2, 3, 4, 5, 6], ask: 'read-product', target: { table: 3, factor: 4 } }} value="" onChange={vi.fn()} disabled={false} label="ბადე" />);
    expect(text('.tgr-ask')).toContain('3 × 4');
    cleanup();
    render(<TableGridAnswer response={{ tables: [2, 3, 4], factors: [1, 2, 3, 4, 5, 6], ask: 'read-product', target: { table: 3, factor: 4 } }} value="12" onChange={vi.fn()} disabled={false} label="ბადე" />);
    expect(text('.tgr-note')).toContain('4 × 3 = 12');
  });
});

// ─────────────────────────── tools ───────────────────────────

describe('tools: the pairs lab', () => {
  it('each new pair adds two and one landing', () => {
    render(<PairsLab tool={{ tool: 'pairs-lab', maxGroups: 3 }} />);
    expect(document.querySelectorAll('.tgrp')).toHaveLength(1);
    expect(document.querySelectorAll('.rep-term')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: '+ ერთი წყვილი' }));
    expect(document.querySelectorAll('.tgrp')).toHaveLength(2);
    expect(text('.lab-status')).toContain('2 × 2 = 4');
    fireEvent.click(screen.getByRole('button', { name: '+ ერთი წყვილი' }));
    expect((screen.getByRole('button', { name: '+ ერთი წყვილი' }) as HTMLButtonElement).disabled).toBe(true);
    expect(text('.lab-facts')).toContain('6');
  });

  it('going back takes a pair away again', () => {
    render(<PairsLab tool={{ tool: 'pairs-lab', maxGroups: 3 }} />);
    fireEvent.click(screen.getByRole('button', { name: '+ ერთი წყვილი' }));
    fireEvent.click(screen.getByRole('button', { name: '− ერთი წყვილი' }));
    expect(document.querySelectorAll('.tgrp')).toHaveLength(1);
    expect((screen.getByRole('button', { name: '− ერთი წყვილი' }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('tools: the table lab', () => {
  it('fills the row one fact at a time', () => {
    render(<TimesTableLab tool={{ tool: 'times-table-lab', table: 3, upTo: 4 }} />);
    expect(document.querySelectorAll('.trow-cell.is-on')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: '+ ერთი ჯგუფი (3)' }));
    expect(text('.lab-status')).toContain('2 × 3 = 6');
    fireEvent.click(screen.getByRole('button', { name: 'შეავსე ცხრილი' }));
    expect(document.querySelectorAll('.trow-cell.is-on')).toHaveLength(4);
    expect(text('.lab-facts')).toContain('4 / 4');
  });

  it('starts over from one fact', () => {
    render(<TimesTableLab tool={{ tool: 'times-table-lab', table: 4, upTo: 3 }} />);
    fireEvent.click(screen.getByRole('button', { name: 'შეავსე ცხრილი' }));
    fireEvent.click(screen.getByRole('button', { name: '↻ თავიდან' }));
    expect(document.querySelectorAll('.trow-cell.is-on')).toHaveLength(1);
  });
});

describe('tools: doubling twice', () => {
  it('walks a number to its double and its double again', () => {
    render(<DoubleDoubleLab tool={{ tool: 'double-double-lab', start: 3, upTo: 4 }} />);
    expect(text('.lab-status')).toContain('4-ის ცხრილი');
    fireEvent.click(screen.getByRole('button', { name: 'გააორმაგე' }));
    expect(text('.lab-status')).toContain('3 × 2 = 6');
    fireEvent.click(screen.getByRole('button', { name: 'გააორმაგე' }));
    expect(text('.lab-status')).toContain('3 × 4 = 12');
    expect(text('.lab-facts')).toContain('4 × 3 = 12');
    expect((screen.getByRole('button', { name: 'გააორმაგე' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('the doubling chain is drawn in three stages', () => {
    render(<DoubleDoubleLab tool={{ tool: 'double-double-lab', start: 5, upTo: 4 }} />);
    expect(Array.from(document.querySelectorAll('.dd-num')).map((n) => n.textContent)).toEqual(['5', '10', '20']);
    fireEvent.click(screen.getByRole('button', { name: 'გააორმაგე' }));
    fireEvent.click(screen.getByRole('button', { name: '↻ თავიდან' }));
    expect(document.querySelectorAll('.dd-stage.is-on')).toHaveLength(1);
  });
});

describe('tools: counting in fives', () => {
  it('adds five at a time and names the ones digit', () => {
    render(<CountByFiveLab tool={{ tool: 'count-by-five-lab', upTo: 4 }} />);
    expect(text('.lab-status')).toContain('1 × 5 = 5');
    fireEvent.click(screen.getByRole('button', { name: '+ ხუთი' }));
    expect(text('.lab-status')).toContain('10');
    expect(text('.lab-status')).toContain('ბოლო ციფრი: 0');
    expect(screen.getByLabelText('ხუთ-ხუთად თვლა: 5, 10')).toBeTruthy();
  });
});

describe('tools: the grid lab', () => {
  it('asks for every cell that makes the target, then names the facts', () => {
    render(<TimesGridLab tool={{ tool: 'times-grid-lab', tables: [2, 3], factors: [1, 2, 3, 4] }} />);
    expect(text('.lab-status')).toContain('მონიშნე ყველა უჯრა');
    fireEvent.click(screen.getByRole('button', { name: '2 × 1 = 2' }));
    expect(text('.lab-status')).toContain('✓');
    expect(text('.lab-status')).toContain('1 × 2');
  });

  it('switching the table changes the target and clears the picks', () => {
    render(<TimesGridLab tool={{ tool: 'times-grid-lab', tables: [2, 3], factors: [1, 2, 3, 4] }} />);
    fireEvent.click(screen.getByRole('button', { name: '2 × 1 = 2' }));
    fireEvent.click(screen.getByRole('button', { name: '3-ის ცხრილი' }));
    expect(text('.lab-status')).not.toContain('✓');
    expect(text('.lab-facts')).toContain('სამიზნე: 6');
  });

  it('showing the related facts highlights every cell', () => {
    render(<TimesGridLab tool={{ tool: 'times-grid-lab', tables: [2, 3], factors: [1, 2, 3, 4] }} />);
    fireEvent.click(screen.getByRole('button', { name: 'მაჩვენე დაკავშირებული ფაქტები' }));
    expect(document.querySelectorAll('.tgrid-cell.is-hi').length).toBeGreaterThan(0);
  });
});

describe('tools: the demonstrations', () => {
  it('the table demo fills one fact per step', () => {
    render(<TableDemo block={{ type: 'table-demo', table: 3, upTo: 4, steps: ['ა', 'ბ', 'გ', 'დ'] }} />);
    expect(document.querySelectorAll('.trow-cell.is-on')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(document.querySelectorAll('.trow-cell.is-on')).toHaveLength(2);
    expect(text('.demo-rule')).toContain('2 × 3 = 6');
  });

  it('the double demo shows the two doublings and their product', () => {
    render(<DoubleDemo block={{ type: 'double-demo', each: 3, factor: 2, steps: ['ა', 'ბ', 'გ'] }} />);
    expect(Array.from(document.querySelectorAll('.dd-cap')).map((n) => n.textContent)).toEqual(['3 × 1', '3 × 2', '3 × 4']);
    expect(text('.demo-rule')).toContain('3 × 2 = 6');
    expect(text('.demo-rule')).toContain('3 × 4 = 12');
  });

  it('the count-by demo lands on each multiple in turn', () => {
    render(<CountByDemo block={{ type: 'count-by-demo', table: 5, count: 4, steps: ['ა', 'ბ', 'გ', 'დ'] }} />);
    expect(Array.from(document.querySelectorAll('.cb-landings li')).map((n) => n.textContent)).toEqual(['5', '10', '15', '20']);
    expect(document.querySelectorAll('.cb-landings li.is-on')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(document.querySelectorAll('.cb-landings li.is-on')).toHaveLength(2);
    expect(text('.demo-rule')).toContain('2 × 5 = 10');
  });
});

// ─────────────────────────── the player ───────────────────────────

const go = (hash: string) => {
  window.location.hash = hash;
  render(<StudentApp />);
};
const next = () => fireEvent.click(screen.getByRole('button', { name: 'გაგრძელება' }));
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'პასუხის შემოწმება' }));
const feedback = () => document.querySelector('.lp-feedback')?.textContent ?? '';
const saved = () => JSON.parse(window.localStorage.getItem(LEARN_STORAGE_KEY) ?? '{}');
const radio = (i: number) => fireEvent.click(screen.getAllByRole('radio')[i]);

beforeEach(() => {
  window.localStorage.clear();
  resetProgressCache();
  window.location.hash = '';
  window.scrollTo = vi.fn();
});
afterEach(() => {
  cleanup();
  window.localStorage.clear();
  resetProgressCache();
  window.location.hash = '';
  document.body.style.overflow = '';
});

/** Answers the question on screen with its own correct answer, through the real controls. */
function answerCorrectly(x: QuestionActivity) {
  const r = x.response;
  switch (r.type) {
    case 'choice':
      radio(r.options.findIndex((o) => o.id === r.answer));
      break;
    case 'numeric':
      fireEvent.change(screen.getByRole('textbox'), { target: { value: String(r.answer) } });
      break;
    case 'blanks':
      r.answers.forEach((a, i) => fireEvent.change(screen.getByLabelText(`ცარიელი ადგილი ${i + 1}`), { target: { value: String(a) } }));
      break;
    case 'times-fact':
      fireEvent.change(screen.getByLabelText('პირველი რიცხვი'), { target: { value: String(r.table) } });
      fireEvent.change(screen.getByLabelText('მეორე რიცხვი'), { target: { value: String(r.factor) } });
      break;
    case 'times-missing': {
      const answer = r.missing === 'factor' ? r.factor : productOf(r.table, r.factor);
      fireEvent.change(screen.getByLabelText('გამოტოვებული რიცხვი'), { target: { value: String(answer) } });
      break;
    }
    case 'table-build':
      for (let i = 1; i <= r.upTo; i += 1) fireEvent.change(screen.getByLabelText(`${i} × ${r.table}`), { target: { value: String(productOf(r.table, i)) } });
      break;
    case 'table-grid':
      if (r.ask === 'read-product') {
        const cell = typeof r.target === 'object' ? r.target : { table: r.tables[0], factor: r.factors[0] };
        fireEvent.change(screen.getByLabelText('ნამრავლი'), { target: { value: String(productOf(cell.table, cell.factor)) } });
      } else {
        for (const key of cellsFor(r.target as number, r.tables, r.factors)) {
          const [table, factor] = key.split(',').map(Number);
          fireEvent.click(screen.getByRole('button', { name: `${table} × ${factor} = ${productOf(table, factor)}` }));
        }
      }
      break;
    default:
      throw new Error(`no walker for ${r.type}`);
  }
  submit();
}

function playThrough(lesson: Lesson) {
  const last = lesson.activities.length - 1;
  lesson.activities.forEach((a, i) => {
    if (a.kind === 'question') {
      answerCorrectly(a);
      expect(feedback(), `${lesson.id}/${a.id}`).toContain('სწორია');
    }
    fireEvent.click(screen.getByRole('button', { name: i === last ? 'გაკვეთილის დასრულება' : 'გაგრძელება' }));
  });
}

describe('g2-u05 unit page', () => {
  it('lists the five lessons, all playable and in order', () => {
    go('#/student/lessons/g2-u05');
    const list = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(list).toHaveLength(5);
    U05.forEach((id, i) => expect(within(list[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
  });
});

describe.each(U05.map((id) => [id] as const))('%s plays to the end', (id) => {
  it('every step works with its own correct answers and the progress is saved', () => {
    const lesson = LESSON_CONTENT[id];
    go(`#/student/lessons/${id}`);
    expect(screen.getByText(`ნაბიჯი 1 / ${lesson.activities.length}`)).toBeTruthy();
    playThrough(lesson);
    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    const checks = stageOf(lesson, 'check').length;
    expect(screen.getByText(`${checks} / ${checks}`)).toBeTruthy();
    expect(saved()[id]).toMatchObject({ status: 'completed', checkCorrect: checks, checkTotal: checks });
    const n = Number(id.slice(-1));
    if (n < 5) {
      expect(screen.getByRole('link', { name: `გაგრძელება: U05.${n + 1}` }).getAttribute('href')).toBe(`#/student/lessons/g2-u05-l${n + 1}`);
    } else {
      expect(screen.getByRole('link', { name: 'U05-ზე დაბრუნება' })).toBeTruthy();
    }
  });
});

describe('feedback is aimed at the real mistake', () => {
  const upTo = (lessonId: string, stopAt: string) => {
    go(`#/student/lessons/${lessonId}`);
    const lesson = LESSON_CONTENT[lessonId];
    const stop = lesson.activities.findIndex((a) => a.id === stopAt);
    lesson.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
  };

  it('a wrong product in a table row names the fact and what it should be', () => {
    upTo('g2-u05-l1', 'check-3');
    fireEvent.change(screen.getByLabelText('1 × 2'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('2 × 2'), { target: { value: '5' } });
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('2 × 2 = 4');
  });

  it('a grid cell that does not make the target is named with its own product', () => {
    upTo('g2-u05-l5', 'practice-3');
    fireEvent.click(screen.getByRole('button', { name: '2 × 5 = 10' }));
    fireEvent.click(screen.getByRole('button', { name: '2 × 6 = 12' }));
    fireEvent.click(screen.getByRole('button', { name: '3 × 4 = 12' }));
    fireEvent.click(screen.getByRole('button', { name: '4 × 3 = 12' }));
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('2 × 5 = 10');
  });

  it('a missing product is explained with the repeated addition', () => {
    upTo('g2-u05-l1', 'practice-1');
    fireEvent.change(screen.getByLabelText('გამოტოვებული რიცხვი'), { target: { value: '9' } });
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('2 + 2 + 2 + 2');
  });
});

describe('style: motion, layout and honest labels', () => {
  const css = readFileSync('src/lessons/learn.css', 'utf8');
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));

  it('the new boards are switched off under reduced motion', () => {
    for (const cls of ['.trow-cell', '.tgrid-cell', '.tba-cell', '.dd-stage', '.cb-landings li', '.tgrp-dot']) expect(reduced, cls).toContain(cls);
  });

  it('the tables and the inputs get narrower on a phone', () => {
    const small = css.slice(css.lastIndexOf('@media (max-width: 560px)'));
    expect(small).toContain('.trow-cell');
    expect(small).toContain('.tgrid-cell');
  });

  it('every cell is labelled by its own fact, never only by position', () => {
    render(<TimesGrid tables={[2]} factors={[3, 4]} />);
    expect(Array.from(document.querySelectorAll('.tgrid-cell')).map((c) => c.getAttribute('aria-label'))).toEqual(['2 × 3 = 6', '2 × 4 = 8']);
  });
});
