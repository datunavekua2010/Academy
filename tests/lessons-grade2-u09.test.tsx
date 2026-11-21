// @vitest-environment jsdom
import './helpers/signed-in-student';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';
import { LESSON_CONTENT } from '../src/lessons/content';
import { describeAnswer, evaluateAnswer } from '../src/lessons/check';
import { getUnit } from '../src/lessons/catalog';
import {
  ALL_VALUES,
  COINS_DESC,
  COIN_VALUES,
  NOTE_VALUES,
  TETRI_PER_LARI,
  canAfford,
  changeFrom,
  changePieces,
  changeText,
  checkAmount,
  coin,
  fewestPieces,
  isAWay,
  isFewest,
  minPieces,
  moneyText,
  note,
  organise,
  organisedText,
  pieceCount,
  pieceShort,
  pieceText,
  runningTotal,
  shortBy,
  splitAmount,
  totalOf,
  totalText,
  wayCount,
  waysToMake,
  worths,
} from '../src/lessons/exercises/MoneyGeometry';
import { FewestPicture, MoneyBuildAnswer, MoneyPiece, MoneyPurse, OrganiseAnswer, PricePicture, WaysPicture, asPieces, trayFor } from '../src/lessons/exercises/MoneyBoard';
import { MoneyCompareAnswer, MoneyTotalAnswer } from '../src/lessons/exercises/MoneyAnswers';
import { ChangeLab, MoneyLab, WayLab } from '../src/lessons/exercises/MoneyTools';
import type { Lesson, QuestionActivity, ResponseSpec } from '../src/lessons/types';

/**
 * Grade 2 · Unit 9: "Counting Coins, Bills, & Making Change".
 *
 * Every amount in these tests is in tetri — the unit the lessons work in — so 2 lari is 200, not "2". The pictures are
 * checked against the same arrays the totals are computed from: a purse may never show one amount and claim another.
 */

const U09 = ['g2-u09-l1', 'g2-u09-l2', 'g2-u09-l3', 'g2-u09-l4', 'g2-u09-l5'];
const lessons = U09.map((id) => LESSON_CONTENT[id]);
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);
const text = (sel: string) => document.querySelector(sel)?.textContent ?? '';

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 2 U09 is the money unit', () => {
  it('has the approved titles, ids and codes', () => {
    const unit = getUnit('g2-u09');
    expect(unit?.title).toBe('Counting Coins, Bills, & Making Change');
    expect(unit?.grade).toBe(2);
    expect(unit?.lessons.map((l) => l.id)).toEqual(U09);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U09.1', 'U09.2', 'U09.3', 'U09.4', 'U09.5']);
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Recognizing Coins and Banknotes',
      'Finding the Value of Collections of Money',
      'Counting Money in Different Combinations',
      'Finding Different Ways to Make the Same Amount',
      'Solving Simple Shopping and Change Problems',
    ]);
  });

  it('has content for every one of the five lessons', () => {
    for (const id of U09) {
      expect(LESSON_CONTENT[id], id).toBeTruthy();
      expect(LESSON_CONTENT[id].id).toBe(id);
      expect(LESSON_CONTENT[id].status).toBe('placeholder');
    }
  });
});

// ─────────────────────────── the pieces ───────────────────────────

describe('money: coins and banknotes are the pieces the lessons draw', () => {
  it('knows the coins and the notes, and that a lari is a hundred tetri', () => {
    expect(TETRI_PER_LARI).toBe(100);
    expect([...COIN_VALUES]).toEqual([1, 2, 5, 10, 20, 50]);
    expect([...NOTE_VALUES]).toEqual([1, 2, 5, 10, 20, 50]);
    expect(ALL_VALUES[0]).toBe(5000);
    expect(ALL_VALUES[ALL_VALUES.length - 1]).toBe(1);
    expect(ALL_VALUES.every((v, i) => i === 0 || ALL_VALUES[i - 1] > v)).toBe(true);
    expect([...COINS_DESC]).toEqual([50, 20, 10, 5, 2, 1]);
  });

  it('names a piece the way it is written on it', () => {
    expect(pieceText(50)).toBe('50 თეთრი');
    expect(pieceText(100)).toBe('1 ლარი');
    expect(pieceText(500)).toBe('5 ლარი');
    expect(pieceShort(50)).toBe('50თ');
    expect(pieceShort(500)).toBe('5ლ');
    // a piece is a single coin or note, so 250 is never "a piece" — it is an amount, and an amount reads in both units
    expect(moneyText(250)).toBe('2 ლარი და 50 თეთრი');
    expect(moneyText(80)).toBe('80 თეთრი');
    expect(moneyText(100)).toBe('1 ლარი');
    expect(moneyText(180)).toBe('1 ლარი და 80 თეთრი');
    expect(splitAmount(180)).toEqual({ lari: 1, tetri: 80 });
  });

  it('builds a note as tetri, so nothing mixes units', () => {
    expect(coin(20)).toEqual({ kind: 'coin', value: 20 });
    expect(note(2)).toEqual({ kind: 'note', value: 200 });
    expect(checkAmount(20)).toBe(20);
    // an amount that cannot exist is refused, not silently rounded
    expect(() => checkAmount(-1)).toThrow(RangeError);
    expect(() => checkAmount(2.5)).toThrow(RangeError);
    expect(() => checkAmount(999999)).toThrow(RangeError);
    expect(changeText(100, 60)).toBe('100 − 60 = 40');
  });
});

// ─────────────────────────── totals ───────────────────────────

describe('money: a collection is the sum of its pieces', () => {
  it('adds, counts and names the total', () => {
    expect(totalOf([20, 10, 5])).toBe(35);
    expect(totalOf([])).toBe(0);
    expect(totalText([20, 10, 5])).toBe('20 + 10 + 5 = 35 თეთრი');
    expect(pieceCount([20, 10, 5])).toBe(3);
    expect(runningTotal([20, 20, 5])).toEqual([20, 40, 45]);
    expect(worths([20, 10], 30)).toBe(true);
    expect(worths([20, 10], 35)).toBe(false);
  });

  it('organises a collection by value, biggest first', () => {
    expect(organise([5, 20, 5, 50, 20, 5])).toEqual([
      { value: 50, count: 1 },
      { value: 20, count: 2 },
      { value: 5, count: 3 },
    ]);
    expect(organisedText([5, 20, 5])).toBe('20 + 5 + 5 = 30');
    expect(organisedText([])).toBe('0');
  });

  it('uses the fewest pieces it can, and that is the fewest', () => {
    expect(fewestPieces(25)).toEqual([20, 5]);
    expect(fewestPieces(45)).toEqual([20, 20, 5]);
    expect(fewestPieces(30)).toEqual([20, 10]);
    expect(fewestPieces(50)).toEqual([50]);
    expect(fewestPieces(12)).toEqual([10, 2]);
    expect(fewestPieces(0)).toEqual([]);
    for (let amount = 0; amount <= 100; amount += 1) {
      const pieces = fewestPieces(amount);
      expect(totalOf(pieces), String(amount)).toBe(amount);
      expect(pieces.every((p) => COINS_DESC.includes(p))).toBe(true);
      expect(isFewest(pieces), String(amount)).toBe(true);
      // no piece can be replaced by a bigger one, and no two small pieces by one big one
      for (let i = 0; i < pieces.length - 1; i += 1) expect(pieces[i]).toBeGreaterThanOrEqual(pieces[i + 1]);
      expect(minPieces(amount)).toBe(pieces.length);
    }
  });
});

// ─────────────────────────── different ways ───────────────────────────

describe('money: the same amount has several ways', () => {
  it('finds every way to make an amount', () => {
    expect(waysToMake(10)).toEqual([
      [10],
      [5, 5],
      [5, 2, 2, 1],
      [5, 2, 1, 1, 1],
      [2, 2, 2, 2, 2],
      [5, 1, 1, 1, 1, 1],
      [2, 2, 2, 2, 1, 1],
      [2, 2, 2, 1, 1, 1, 1],
      [2, 2, 1, 1, 1, 1, 1, 1],
      [2, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]);
    expect(waysToMake(5)).toEqual([[5], [2, 2, 1], [2, 1, 1, 1], [1, 1, 1, 1, 1]]);
    expect(wayCount(10)).toBe(11);
    expect(wayCount(5)).toBe(4);
    expect(wayCount(0)).toBe(1);
    expect(waysToMake(1)).toEqual([[1]]);
  });

  it('every way really is the amount, and none is repeated', () => {
    for (const amount of [1, 2, 5, 10, 12, 20, 25, 45]) {
      const ways = waysToMake(amount);
      const seen = new Set<string>();
      for (const way of ways) {
        expect(totalOf(way), `${amount}: ${way.join('+')}`).toBe(amount);
        expect(isAWay(way, amount)).toBe(true);
        const key = [...way].sort((a, b) => b - a).join(',');
        expect(seen.has(key), `duplicate ${key}`).toBe(false);
        seen.add(key);
      }
      // fewest first, and the first way is the fewest there is
      expect(ways[0]).toEqual(fewestPieces(amount));
    }
    expect(isAWay([20, 20, 10], 45)).toBe(false);
    expect(isAWay([20, 10, 10, 5], 45)).toBe(true);
  });
});

// ─────────────────────────── shopping ───────────────────────────

describe('money: shopping is enough, then change', () => {
  it('pays only what can be afforded', () => {
    expect(canAfford(100, 60)).toBe(true);
    expect(canAfford(90, 90)).toBe(true);
    expect(canAfford(80, 90)).toBe(false);
    expect(shortBy(50, 80)).toBe(30);
    expect(shortBy(100, 60)).toBe(0);
    expect(changeFrom(100, 60)).toBe(40);
    expect(changeFrom(90, 90)).toBe(0);
    expect(changePieces(100, 60)).toEqual([20, 20]);
    expect(changePieces(200, 150)).toEqual([50]);
  });

  it('never asks for change that cannot be paid from the pieces that exist', () => {
    for (let paid = 0; paid <= 500; paid += 5)
      for (const cost of [0, 5, 60, 90, 150, 175, 250]) {
        if (!canAfford(paid, cost)) continue;
        expect(totalOf(changePieces(paid, cost))).toBe(changeFrom(paid, cost));
      }
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

describe('checking: totals, change and building amounts', () => {
  it('wants a total in tetri', () => {
    const tot = q({ type: 'money-total', pieces: [20, 10, 5] });
    expect(evaluateAnswer(tot, '35').verdict).toBe('correct');
    expect(evaluateAnswer(tot, '30').verdict).toBe('incorrect');
    expect(evaluateAnswer(tot, '').verdict).toBe('incomplete');
    expect(evaluateAnswer(tot, ' 35 ').verdict).toBe('correct');
    expect(describeAnswer({ type: 'money-total', pieces: [20, 10, 5] })).toBe('35 თეთრი');
  });

  it('puts the real sum in the feedback, not just "wrong"', () => {
    const wrong = evaluateAnswer(q({ type: 'money-total', pieces: [50, 20, 10] }, { fallbackFeedback: 'ჯერ არ არის ზუსტი.' }), '70');
    expect(wrong.feedback).toContain('ჯერ არ არის ზუსტი');
    expect(wrong.feedback).toContain('50 + 20 + 10 = 80');
  });

  it('asks enough and change together, because change needs enough', () => {
    const enough = q({ type: 'money-compare', money: 100, cost: 60 });
    expect(evaluateAnswer(enough, '1,40').verdict).toBe('correct');
    expect(evaluateAnswer(enough, '1,60').verdict).toBe('incorrect');
    expect(evaluateAnswer(enough, '0,40').verdict).toBe('incorrect');
    expect(evaluateAnswer(enough, '1,').verdict).toBe('incomplete');
    expect(evaluateAnswer(enough, ',').verdict).toBe('incomplete');

    const short = q({ type: 'money-compare', money: 50, cost: 80 });
    expect(evaluateAnswer(short, '0,0').verdict).toBe('correct');
    expect(evaluateAnswer(short, '1,0').verdict).toBe('incorrect');
    // short money leaves no change, and saying so is what the engine asks for
    expect(evaluateAnswer(short, '0,30').verdict).toBe('incorrect');
  });

  it('says which side of "enough" the student got wrong', () => {
    const not = evaluateAnswer(q({ type: 'money-compare', money: 50, cost: 80 }, { fallbackFeedback: 'ჯერ არ არის ზუსტი.' }), '1,30');
    expect(not.feedback).toContain('აკლია');
    const yes = evaluateAnswer(q({ type: 'money-compare', money: 200, cost: 150 }, { fallbackFeedback: 'ჯერ არ არის ზუსტი.' }), '0,0');
    expect(yes.feedback).toContain('საკმარისია');
    expect(describeAnswer({ type: 'money-compare', money: 200, cost: 150 })).toContain('50');
  });

  it('accepts any real way to build the amount, and only a real one', () => {
    const build = q({ type: 'money-build', target: 30, tray: [10, 5, 2, 1] });
    expect(evaluateAnswer(build, '10,10,10').verdict).toBe('correct');
    expect(evaluateAnswer(build, '20,5,5').verdict).toBe('incorrect');
    expect(evaluateAnswer(build, '10,10,5').verdict).toBe('incorrect');
    expect(evaluateAnswer(build, '').verdict).toBe('incomplete');
    expect(describeAnswer({ type: 'money-build', target: 30, tray: [10, 5, 2, 1] })).toBe('30 თეთრი: 20 თეთრი + 10 თეთრი');
  });

  it('when the fewest pieces are asked for, an equal sum is not enough', () => {
    const fewest = q({ type: 'money-build', target: 30, tray: [20, 10, 5, 2, 1], fewest: true });
    expect(evaluateAnswer(fewest, '20,10').verdict).toBe('correct');
    const many = evaluateAnswer(fewest, '10,10,5,5'), manyOne = evaluateAnswer(fewest, '10,10,10');
    expect(manyOne.verdict).toBe('incorrect');
    expect(manyOne.feedback).toContain('20 თეთრი + 10 თეთრი');
    expect(many.verdict).toBe('incorrect');
  });

  it('ignores pieces that are not on the tray instead of counting them', () => {
    const build = q({ type: 'money-build', target: 30, tray: [10, 5] });
    // 50 is not on this tray, so it cannot make the purse worth more
    expect(evaluateAnswer(build, '10,10,10').verdict).toBe('correct');
    expect(evaluateAnswer(build, '50').verdict).toBe('incomplete');
  });
});

// ─────────────────────────── content invariants ───────────────────────────

describe('content: the ten activities of every lesson', () => {
  it('runs challenge, explore, understand, four practice and three checks', () => {
    for (const l of lessons) {
      expect(l.activities.map((a) => a.id), l.id).toEqual(['challenge', 'explore', 'understand', 'practice-1', 'practice-2', 'practice-3', 'practice-4', 'check-1', 'check-2', 'check-3']);
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
      const explore = l.activities.find((a) => a.kind === 'explore') as Extract<Lesson['activities'][number], { kind: 'explore' }>;
      expect(explore.tool, l.id).toBeTruthy();
      const explain = l.activities.find((a) => a.kind === 'explain') as Extract<Lesson['activities'][number], { kind: 'explain' }>;
      expect(explain.blocks.length, l.id).toBeGreaterThan(2);
    }
  });

  it('each lesson uses the tool the unit says it uses', () => {
    const tool = (id: string) => (LESSON_CONTENT[id].activities.find((a) => a.kind === 'explore') as Extract<Lesson['activities'][number], { kind: 'explore' }>).tool.tool;
    expect(tool('g2-u09-l1')).toBe('money-lab');
    expect(tool('g2-u09-l2')).toBe('money-lab');
    expect(tool('g2-u09-l3')).toBe('money-lab');
    expect(tool('g2-u09-l4')).toBe('way-lab');
    expect(tool('g2-u09-l5')).toBe('change-lab');
  });
});

/** The pieces a student must tap to be right: the fewest when asked, otherwise any way the tray can pay. */
function payableFor(r: Extract<ResponseSpec, { type: 'money-build' }>): number[] {
  if (r.fewest) return fewestPieces(r.target);
  const way = waysToMake(r.target).find((w) => w.every((v) => r.tray.includes(v)));
  expect(way, `a payable way to ${r.target} from ${r.tray.join(',')}`).toBeTruthy();
  return way!;
}

/** The answer a question expects, computed from the pieces and prices it ships. */
function correctAnswer(r: ResponseSpec): string {
  switch (r.type) {
    case 'choice':
      return r.answer;
    case 'numeric':
      return String(r.answer);
    case 'money-total':
      return String(totalOf(r.pieces));
    case 'money-compare': {
      const enough = canAfford(r.money, r.cost);
      return `${enough ? 1 : 0},${enough ? changeFrom(r.money, r.cost) : 0}`;
    }
    case 'money-build':
      return payableFor(r).join(',');
    default:
      throw new Error(`no answer for ${r.type}`);
  }
}

describe('content: every question is answerable from its own money', () => {
  it('the engine agrees with the content, question by question', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        expect(evaluateAnswer(x, correctAnswer(x.response)).verdict, `${l.id}/${x.id} (${x.response.type})`).toBe('correct');
      }
  });

  it('only builds from pieces that exist and that the tray offers', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'money-build') continue;
        expect(r.tray.length, `${l.id}/${x.id}`).toBeGreaterThan(0);
        for (const v of r.tray) expect(ALL_VALUES, `${l.id}/${x.id}: ${v}`).toContain(v);
        // the tray can pay the target somehow, and it holds no piece bigger than the target
        expect(waysToMake(r.target).some((way) => way.every((v) => r.tray.includes(v))), `${l.id}/${x.id}`).toBe(true);
        expect(Math.max(...r.tray), `${l.id}/${x.id}`).toBeLessThanOrEqual(r.target);
        if (r.fewest) for (const v of fewestPieces(r.target)) expect(r.tray, `${l.id}/${x.id}`).toContain(v);
      }
  });

  it('prices are amounts a purse of the lessons’ pieces can afford', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'money-compare') continue;
        expect(r.cost, `${l.id}/${x.id}`).toBeGreaterThan(0);
        expect(r.money, `${l.id}/${x.id}`).toBeGreaterThan(0);
        if (canAfford(r.money, r.cost)) expect(totalOf(changePieces(r.money, r.cost))).toBe(changeFrom(r.money, r.cost));
        else expect(() => changePieces(r.money, r.cost)).toThrow(RangeError);
      }
  });

  it('asks for fewest pieces only where one way really is fewest', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'money-build' || !r.fewest) continue;
        expect(wayCount(r.target), `${l.id}/${x.id}`).toBeGreaterThan(1);
        expect(fewestPieces(r.target).length, `${l.id}/${x.id}`).toBeLessThan(waysToMake(r.target)[waysToMake(r.target).length - 1].length);
      }
  });
});

// ─────────────────────────── boards ───────────────────────────

describe('board: money is drawn, not just numbered', () => {
  it('draws a coin differently from a banknote, and says which it is', () => {
    render(<MoneyPiece value={50} />);
    expect(document.querySelector('.mny-piece')?.className).toContain('is-coin');
    expect(screen.getByRole('img', { name: '50 თეთრი' })).toBeTruthy();
    cleanup();
    render(<MoneyPiece value={200} />);
    expect(document.querySelector('.mny-piece')?.className).toContain('is-note');
    expect(screen.getByRole('img', { name: '2 ლარი' })).toBeTruthy();
  });

  it('a purse shows exactly the pieces it was given, and their real total', () => {
    render(<MoneyPurse pieces={[20, 10, 5]} showTotal />);
    expect(document.querySelectorAll('.mny-row .mny-piece')).toHaveLength(3);
    expect(text('.mny-total')).toBe('35 თეთრი');
    expect(screen.getByLabelText('ფული: 20 თეთრი, 10 თეთრი, 5 თეთრი')).toBeTruthy();
  });

  it('a running purse adds each piece up in order', () => {
    render(<MoneyPurse pieces={[10, 10, 10, 5]} running />);
    expect(text('.mny-note')).toBe('10 + 10 + 10 + 5 = 35');
    expect(Array.from(document.querySelectorAll('.mny-run')).map((n) => n.textContent)).toEqual(['10', '20', '30', '35']);
    // with mixed pieces the running total follows the order shown, not the order given
    cleanup();
    render(<MoneyPurse pieces={[5, 20, 10]} running />);
    expect(Array.from(document.querySelectorAll('.mny-run')).map((n) => n.textContent)).toEqual(['20', '30', '35']);
  });

  it('a price tag says whether the money covers it, and by how much', () => {
    render(<PricePicture cost={60} money={100} />);
    expect(text('.mny-tag')).toBe('60 თეთრი');
    expect(text('.mny-note')).toContain('ხურდა 40 თეთრი');
    cleanup();
    render(<PricePicture cost={80} money={50} />);
    expect(text('.mny-note')).toContain('არ არის საკმარისი');
    expect(text('.mny-note')).toContain('30 თეთრი აკლია');
  });

  it('the ways board lists real ways, fewest first', () => {
    render(<WaysPicture ways={waysToMake(10)} />);
    expect(document.querySelectorAll('.mny-way')).toHaveLength(11);
    expect(text('.mny-way .mny-way-pieces')).toBe('10თ');
    expect(text('.mny-way-list')).toContain('5თ + 5თ');
  });

  it('the fewest-pieces picture reads as money, not numbers', () => {
    render(<FewestPicture amount={45} />);
    expect(document.querySelectorAll('.mny-row .mny-piece')).toHaveLength(3);
    expect(text('.mny-total')).toBe('45 თეთრი = 20 თეთრი + 20 თეთრი + 5 თეთრი');
  });

  it('organising a collection groups the same piece together', () => {
    render(<OrganiseAnswer pieces={[5, 20, 5, 20, 5]} label="დაალაგე" />);
    expect(document.querySelectorAll('.mny-org-row')).toHaveLength(2);
    expect(text('.mny-org-row')).toContain('× 2');
    expect(text('.mny-note')).toBe('სულ 55 თეთრი');
  });

  it('the tray helpers keep a tray honest', () => {
    expect(trayFor([1, 100, 20, 20, 5])).toEqual([100, 20, 5, 1]);
    expect(asPieces([100, 20]).map((p) => p.kind)).toEqual(['note', 'coin']);
  });
});

describe('board: building an amount from a tray', () => {
  it('tapping a piece adds it and the purse says what it now holds', () => {
    const onChange = vi.fn();
    render(<MoneyBuildAnswer tray={[10, 5, 2, 1]} target={30} value="" onChange={onChange} disabled={false} label="შეადგინე" />);
    expect(text('.mnyb-ask')).toContain('კიდევ 30 თეთრი გჭირდება');
    fireEvent.click(screen.getByRole('button', { name: 'აიღე 10 თეთრი' }));
    expect(onChange).toHaveBeenLastCalledWith('10');
    cleanup();
    render(<MoneyBuildAnswer tray={[10, 5, 2, 1]} target={30} value="10,10,5" onChange={onChange} disabled={false} label="შეადგინე" />);
    expect(document.querySelectorAll('.mnyb-slot')).toHaveLength(3);
    expect(text('.mnyb-ask')).toContain('25 თეთრი');
    expect(text('.mnyb-ask')).toContain('კიდევ 5 თეთრი გჭირდება');
    cleanup();
    render(<MoneyBuildAnswer tray={[10, 5, 2, 1]} target={30} value="10,10,10,5" onChange={onChange} disabled={false} label="შეადგინე" />);
    expect(text('.mnyb-ask')).toContain('5 თეთრი ზედმეტია');
  });

  it('a piece in the purse can be taken back', () => {
    const onChange = vi.fn();
    render(<MoneyBuildAnswer tray={[10, 5, 2, 1]} target={30} value="10,10,5" onChange={onChange} disabled={false} label="შეადგინე" />);
    fireEvent.click(screen.getAllByRole('button', { name: /პარკუჭში: 10 თეთრი/ })[0]);
    expect(onChange).toHaveBeenLastCalledWith('10,5');
  });

  it('the fewest-pieces hint is only offered when the question wants it', () => {
    render(<MoneyBuildAnswer tray={[20, 10, 5, 2, 1]} target={25} value="" onChange={() => {}} disabled={false} showFewestHint label="შეადგინე" />);
    expect(screen.getByRole('button', { name: 'ყველაზე ცოტა ნაჭრით' })).toBeTruthy();
    cleanup();
    render(<MoneyBuildAnswer tray={[20, 10, 5, 2, 1]} target={25} value="" onChange={() => {}} disabled={false} label="შეადგინე" />);
    expect(screen.queryByRole('button', { name: 'ყველაზე ცოტა ნაჭრით' })).toBeNull();
  });

  it('records the running sum of what was tapped', () => {
    render(<MoneyBuildAnswer tray={[10, 5, 2, 1]} target={30} value="10,10,5" onChange={() => {}} disabled={false} label="შეადგინე" />);
    expect(text('.mnyb-fact')).toBe('10 + 10 + 5 = 25 თეთრი');
  });
});

describe('board: answer controls for money', () => {
  it('shows the pieces above the box that asks for their total', () => {
    const onChange = vi.fn();
    render(<MoneyTotalAnswer pieces={[20, 10, 5]} value="" onChange={onChange} disabled={false} label="სულ" />);
    expect(document.querySelectorAll('.mny-piece')).toHaveLength(3);
    expect(text('.mnytot-note')).toContain('3 ნაჭერი');
    fireEvent.change(screen.getByLabelText('სულ'), { target: { value: '35' } });
    expect(onChange).toHaveBeenLastCalledWith('35');
  });

  it('asks enough and change as one answer', () => {
    const onChange = vi.fn();
    render(<MoneyCompareAnswer money={100} cost={60} value="" onChange={onChange} disabled={false} label="ყიდვა" />);
    expect(text('.mnytot-note')).toBe('1 ლარი და 60 თეთრი: საკმარისია?');
    fireEvent.click(screen.getByRole('button', { name: /საკმარისია/ }));
    expect(onChange).toHaveBeenLastCalledWith('1,');
  });

  it('when the money is short it says so and asks for zero change', () => {
    render(<MoneyCompareAnswer money={50} cost={80} value="0,0" onChange={() => {}} disabled={false} label="ყიდვა" />);
    expect(text('.mnytot-note')).toContain('ნაკლებია');
    expect(text('.mnytot-note')).toContain('ხურდა 0-ია');
    expect(screen.getByRole('button', { name: /არ არის საკმარისი/ }).getAttribute('aria-pressed')).toBe('true');
  });
});

// ─────────────────────────── tools ───────────────────────────

describe('tools: the money lab', () => {
  it('builds a purse one piece at a time and totals it', () => {
    render(<MoneyLab tool={{ tool: 'money-lab', tray: [50, 20, 10, 5, 2, 1], target: 87 }} />);
    expect(text('.lab-status')).toBe('პარკუჭი ცარიელია. დააჭირე ფულს.');
    fireEvent.click(screen.getByRole('button', { name: 'დაამატე 50 თეთრი' }));
    fireEvent.click(screen.getByRole('button', { name: 'დაამატე 20 თეთრი' }));
    expect(text('.lab-status')).toContain('50 + 20 = 70 თეთრი');
    expect(text('.lab-facts')).toContain('ნაჭრები: 2');
  });

  it('says when the target is hit exactly', () => {
    render(<MoneyLab tool={{ tool: 'money-lab', tray: [50, 20, 10, 5], target: 100 }} />);
    fireEvent.click(screen.getByRole('button', { name: 'ყველაზე ცოტა ნაჭრით' }));
    expect(text('.lab-status')).toContain('ზუსტად 1 ლარი');
  });

  it('takes a piece back and clears', () => {
    render(<MoneyLab tool={{ tool: 'money-lab', tray: [50, 20], target: 100 }} />);
    fireEvent.click(screen.getByRole('button', { name: 'დაამატე 50 თეთრი' }));
    fireEvent.click(screen.getByRole('button', { name: 'აიღე ბოლო ნაჭერი' }));
    expect(text('.lab-status')).toBe('პარკუჭი ცარიელია. დააჭირე ფულს.');
  });
});

describe('tools: the ways lab', () => {
  it('lists every way and moves between amounts', () => {
    render(<WayLab tool={{ tool: 'way-lab', amounts: [10, 15, 20] }} />);
    expect(text('.lab-facts')).toContain('გზები: 11');
    fireEvent.click(screen.getByRole('button', { name: '15 თეთრი' }));
    expect(text('.lab-facts')).toContain(`გზები: ${waysToMake(15).length}`);
    expect(text('.lab-status')).toContain(`${waysToMake(15).length} გზით`);
  });
});

describe('tools: the change lab', () => {
  it('pays for a thing and shows the change in real pieces', () => {
    render(<ChangeLab tool={{ tool: 'change-lab', pairs: [{ paid: 100, cost: 60 }, { paid: 50, cost: 80 }] }} />);
    expect(text('.lab-status')).toBe('100 − 60 = 40 თეთრი — ხურდა 40 თეთრი.');
    expect(document.querySelectorAll('.mny-row .mny-piece')).toHaveLength(2);
    expect(text('.lab-facts')).toContain('საკმარისია: კი');
  });

  it('when the money is short it names what is missing', () => {
    render(<ChangeLab tool={{ tool: 'change-lab', pairs: [{ paid: 50, cost: 80 }] }} />);
    expect(text('.lab-status')).toBe('80 − 50 = 30 თეთრი აკლია.');
    expect(text('.lab-facts')).toContain('საკმარისია: არა');
    expect(document.querySelectorAll('.mny-row .mny-piece')).toHaveLength(0);
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
    case 'money-total':
      fireEvent.change(screen.getByLabelText(x.prompt), { target: { value: String(totalOf(r.pieces)) } });
      break;
    case 'money-compare': {
      const enough = canAfford(r.money, r.cost);
      fireEvent.click(screen.getByRole('button', { name: enough ? /✓ საკმარისია/ : /✗ არ არის საკმარისი/ }));
      fireEvent.change(screen.getByLabelText('ხურდა თეთრებში'), { target: { value: String(enough ? changeFrom(r.money, r.cost) : 0) } });
      break;
    }
    case 'money-build':
      for (const piece of payableFor(r)) fireEvent.click(screen.getByRole('button', { name: `აიღე ${pieceText(piece)}` }));
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

describe('g2-u09 unit page', () => {
  it('lists the five lessons, all playable and in order', () => {
    go('#/student/lessons/g2-u09');
    const list = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(list).toHaveLength(5);
    U09.forEach((id, i) => expect(within(list[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
  });
});

describe.each(U09.map((id) => [id] as const))('%s plays to the end', (id) => {
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
    if (n < 5) expect(screen.getByRole('link', { name: `გაგრძელება: U09.${n + 1}` }).getAttribute('href')).toBe(`#/student/lessons/g2-u09-l${n + 1}`);
    else expect(screen.getByRole('link', { name: 'U09-ზე დაბრუნება' })).toBeTruthy();
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

  it('a miscounted purse is told the real sum', () => {
    upTo('g2-u09-l2', 'check-1');
    fireEvent.change(screen.getByLabelText(LESSON_CONTENT['g2-u09-l2'].activities.find((a) => a.id === 'check-1')!.kind === 'question' ? (LESSON_CONTENT['g2-u09-l2'].activities.find((a) => a.id === 'check-1') as QuestionActivity).prompt : ''), { target: { value: '1' } });
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toMatch(/\d+ \+ /);
  });

  it('not enough money is answered by how much is missing', () => {
    upTo('g2-u09-l5', 'check-1');
    fireEvent.click(screen.getByRole('button', { name: /✓ საკმარისია/ }));
    fireEvent.change(screen.getByLabelText('ხურდა თეთრებში'), { target: { value: '20' } });
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('აკლია');
    expect(feedback()).toContain('20 თეთრი');
  });

  it('an over-built purse is told how much is spare', () => {
    upTo('g2-u09-l4', 'check-2');
    for (const piece of fewestPieces(12)) fireEvent.click(screen.getByRole('button', { name: `აიღე ${pieceText(piece)}` }));
    // 12 + an extra 10 is more than the target
    fireEvent.click(screen.getByRole('button', { name: 'აიღე 10 თეთრი' }));
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('ზედმეტია');
  });
});

describe('style: money has its own look, and a phone width', () => {
  const css = readFileSync('src/lessons/learn.css', 'utf8');
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));

  it('a coin is round and a banknote is not', () => {
    expect(css).toContain('.mny-piece.is-coin');
    expect(css).toContain('.mny-piece.is-note');
  });

  it('the money boards have their own layout and a phone width', () => {
    expect(css).toContain('.mny-row');
    expect(css).toContain('.mnyb-purse');
    expect(css).toContain('.mnytot-row');
    const small = css.slice(css.lastIndexOf('@media (max-width: 560px)'));
    expect(small).toContain('.mny-piece.is-note');
    expect(small).toContain('.mnytot-slot input');
  });

  it('the purse is switched off under reduced motion', () => {
    expect(reduced).toContain('.mnyb-purse');
  });
});
