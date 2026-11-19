// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';
import { LESSON_CONTENT } from '../src/lessons/content';
import { describeAnswer, evaluateAnswer, evaluateResponse } from '../src/lessons/check';
import { getUnit } from '../src/lessons/catalog';
import {
  blockText,
  followsRule,
  holeValues,
  isForward,
  landings,
  nextTerm,
  onesDigitStory,
  onesDigits,
  repeatBlock,
  ruleText,
  sequenceOf,
  stepOf,
  stepSign,
  stepWords,
  stepsBetween,
  termAt,
  withHoles,
} from '../src/lessons/exercises/PatternGeometry';
import { GroupCount, SequenceFillBoard, SequencePicture, SequenceRuleBoard, SkipBoard, SkipLine } from '../src/lessons/exercises/PatternBoard';
import { HundredLab, PatternLab, SkipDemo, SkipLab, TenGroupsLab } from '../src/lessons/exercises/PatternTools';
import type { Activity, Lesson, QuestionActivity, ResponseSpec } from '../src/lessons/types';

/**
 * Grade 2 · Unit 2: "Skip-Counting & Number Patterns (by 2s, 5s, 10s, 100s)".
 *
 * Every number is checked against the rule it claims to follow: a sequence is `start + i·step`, a missing number is the
 * number that belongs to that position, and counting backwards is the same rule with a negative step. Nothing is judged
 * by looking at the picture.
 *
 * Touch has not been tried on a device (there is no browser here); the tests drive taps on the line's ticks.
 */

const U02 = ['g2-u02-l1', 'g2-u02-l2', 'g2-u02-l3', 'g2-u02-l4', 'g2-u02-l5'];
const lessons = U02.map((id) => LESSON_CONTENT[id]);
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);
const text = (sel: string) => document.querySelector(sel)?.textContent ?? '';

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 2 U02 is the patterns unit', () => {
  it('has the approved titles, ids and codes', () => {
    const unit = getUnit('g2-u02');
    expect(unit?.title).toBe('Skip-Counting & Number Patterns (by 2s, 5s, 10s, 100s)');
    expect(unit?.grade).toBe(2);
    expect(unit?.lessons.map((l) => l.id)).toEqual(U02);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U02.1', 'U02.2', 'U02.3', 'U02.4', 'U02.5']);
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Skip-Counting Forwards and Backwards by 2s',
      'Skip-Counting Forwards and Backwards by 5s',
      'Skip-Counting Forwards and Backwards by 10s',
      'Counting by 100s',
      'Finding Rules and Missing Numbers in Number Patterns',
    ]);
  });

  it('has content for every one of the five lessons', () => {
    for (const id of U02) {
      expect(LESSON_CONTENT[id], id).toBeTruthy();
      expect(LESSON_CONTENT[id].id).toBe(id);
      expect(LESSON_CONTENT[id].status).toBe('placeholder');
    }
  });
});

// ─────────────────────────── the engine ───────────────────────────

describe('patterns: a sequence is a start and a step', () => {
  it('builds the sequence from the pair, forwards and backwards', () => {
    expect(sequenceOf(2, 2, 5)).toEqual([2, 4, 6, 8, 10]);
    expect(sequenceOf(5, 5, 4)).toEqual([5, 10, 15, 20]);
    expect(sequenceOf(30, 10, 3)).toEqual([30, 40, 50]);
    expect(sequenceOf(400, 100, 3)).toEqual([400, 500, 600]);
    // backwards is the same rule with a negative step — one code path, not two
    expect(sequenceOf(20, -2, 4)).toEqual([20, 18, 16, 14]);
    expect(sequenceOf(50, -10, 3)).toEqual([50, 40, 30]);
  });

  it('refuses a step of zero, which would not be a sequence', () => {
    expect(() => sequenceOf(5, 0, 4)).toThrow(RangeError);
    expect(() => sequenceOf(5, 2, 0)).toThrow(RangeError);
  });

  it('the number at a position is computed, not copied from a neighbour', () => {
    expect(termAt(7, 3, 0)).toBe(7);
    expect(termAt(7, 3, 4)).toBe(19);
    expect(termAt(100, -10, 3)).toBe(70);
  });

  it('a hole is a place, and its value comes from the same numbers', () => {
    const numbers = sequenceOf(4, 5, 6);
    expect(numbers).toEqual([4, 9, 14, 19, 24, 29]);
    expect(withHoles(numbers, [2, 5])).toEqual([4, 9, null, 19, 24, null]);
    expect(holeValues(numbers, [2, 5])).toEqual([14, 29]);
  });
});

describe('patterns: the rule is read from the numbers', () => {
  it('finds the step only when every neighbour moves the same way', () => {
    expect(stepOf([3, 6, 9, 12])).toBe(3);
    expect(stepOf([20, 15, 10, 5])).toBe(-5);
    expect(stepOf([4, 9, 14, 19, 24])).toBe(5);
    // doubling is not one step: 4−2=2, 8−4=4, 16−8=8
    expect(stepOf([2, 4, 8, 16])).toBeNull();
    // a step of zero is not a rule either
    expect(stepOf([5, 5, 5])).toBeNull();
    expect(stepOf([7])).toBeNull();
  });

  it('ignores the holes when reading the rule', () => {
    expect(stepOf([4, null, 14, null, 24])).toBe(5);
    expect(stepOf([5, null, 15, 20])).toBe(5);
    expect(followsRule([5, null, 15, 20], 5)).toBe(true);
    expect(followsRule([5, null, 15, 20], 10)).toBe(false);
    // a blank is a position, so the step is measured per place, not between the two numbers that happen to be shown
    expect(stepOf([10, null, null, null, 18])).toBe(2);
  });

  it('names the rule in words and in signs', () => {
    expect(stepSign(2)).toBe('+2');
    expect(stepSign(-10)).toBe('−10');
    expect(stepWords(5)).toBe('ემატება 5');
    expect(stepWords(-5)).toBe('აკლდება 5');
    expect(ruleText(100)).toBe('ყოველ ნაბიჯზე ემატება 100');
    expect(isForward(-2)).toBe(false);
  });

  it('knows what the next number is without being told the count', () => {
    expect(nextTerm([7, 12, 17], 5)).toBe(22);
    expect(nextTerm([60, 55, 50], -5)).toBe(45);
    expect(nextTerm([null, null], 2)).toBeNull();
  });
});

describe('patterns: what the digits do', () => {
  it('counting by fives only ever lands on 0 or 5 in the ones place', () => {
    const fives = sequenceOf(5, 5, 8);
    expect(onesDigits(fives)).toEqual([5, 0, 5, 0, 5, 0, 5, 0]);
    expect(new Set(onesDigits(fives))).toEqual(new Set([0, 5]));
    expect(onesDigitStory(5)).toContain('0, 5, 0, 5');
  });

  it('counting by tens leaves the ones digit exactly where it was', () => {
    const tens = sequenceOf(43, 10, 4);
    expect(tens).toEqual([43, 53, 63, 73]);
    expect(new Set(onesDigits(tens))).toEqual(new Set([3]));
    expect(onesDigitStory(10)).toContain('ათეულების ციფრი იცვლება');
  });

  it('counting by hundreds leaves tens and ones where they were', () => {
    const hundreds = sequenceOf(342, 100, 4);
    expect(hundreds).toEqual([342, 442, 542, 642]);
    expect(hundreds.map((n) => n % 100)).toEqual([42, 42, 42, 42]);
    expect(onesDigitStory(100)).toContain('ასეულების ციფრი');
  });
});

describe('patterns: groups of a step', () => {
  it('lands only on the numbers the rule produces', () => {
    expect(landings(2, 2, 12)).toEqual([2, 4, 6, 8, 10, 12]);
    expect(landings(10, 5, 25)).toEqual([10, 15, 20, 25]);
    expect(landings(20, -5, 5)).toEqual([20, 15, 10, 5]);
    expect(stepsBetween(10, 20, 5)).toBe(2);
  });

  it('recognises a pattern built from a repeating block', () => {
    expect(repeatBlock([3, 6, 9, 12])).toEqual([3]);
    expect(repeatBlock([2, 4, 9, 11, 16])).toEqual([2, 5]);
    expect(blockText([2, 5])).toBe('+2, +5');
    expect(repeatBlock([2, 4, 8, 16])).toBeNull();
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

describe('checking: hopping the line', () => {
  const question = q({ type: 'skip-line', start: 10, step: 2, count: 5 });

  it('accepts the landing that is the last one', () => {
    expect(evaluateAnswer(question, '4').verdict).toBe('correct');
  });

  it('a short count is wrong, and says where the character really stands', () => {
    const short = evaluateAnswer(question, '2');
    expect(short.verdict).toBe('incorrect');
    expect(short.misconceptionId).toBe('short');
    expect(short.feedback).toContain('14');
  });

  it('an untouched line is unfinished, not wrong', () => {
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
  });

  it('counts backwards with the same rule', () => {
    const back = q({ type: 'skip-line', start: 20, step: -2, count: 4 });
    expect(evaluateAnswer(back, '3').verdict).toBe('correct');
    expect(evaluateAnswer(back, '2').verdict).toBe('incorrect');
  });
});

describe('checking: filling the holes', () => {
  const question = q({ type: 'sequence-fill', start: 6, step: 2, count: 5, holes: [2, 4] });

  it('wants the numbers that belong to those positions', () => {
    expect(evaluateAnswer(question, '10,14').verdict).toBe('correct');
    expect(evaluateAnswer(question, '12,14').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, '10,16').verdict).toBe('incorrect');
  });

  it('a blank copied from its neighbour is named as that slip', () => {
    const copied = evaluateAnswer(question, '8,14');
    expect(copied.verdict).toBe('incorrect');
    expect(copied.misconceptionId).toBe('copied');
  });

  it('a partly filled sequence is unfinished', () => {
    expect(evaluateAnswer(question, '10,').verdict).toBe('incomplete');
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
  });

  it('holes are answered in position order, whatever order they are declared in', () => {
    const messy = q({ type: 'sequence-fill', start: 13, step: 2, count: 5, holes: [4, 0] });
    expect(evaluateAnswer(messy, '13,21').verdict).toBe('correct');
  });
});

describe('checking: picking the rule', () => {
  const question = q({ type: 'sequence-rule', start: 3, step: 3, count: 4, options: [3, 2, 4] });

  it('judges the step, nothing else', () => {
    expect(evaluateAnswer(question, '3').verdict).toBe('correct');
    expect(evaluateAnswer(question, '2').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
  });

  it('a wrong rule is told what the numbers really do', () => {
    const wrong = evaluateAnswer(question, '4');
    expect(wrong.verdict).toBe('incorrect');
    expect(wrong.feedback).toContain('3');
  });
});

describe('checking: the answer can be described', () => {
  it('says the landings, the missing numbers and the rule', () => {
    expect(describeAnswer({ type: 'skip-line', start: 10, step: 2, count: 5 })).toBe('10 → 12 → 14 → 16 → 18');
    expect(describeAnswer({ type: 'sequence-fill', start: 6, step: 2, count: 5, holes: [2, 4] })).toBe('10, 14');
    expect(describeAnswer({ type: 'sequence-rule', start: 3, step: 3, count: 4, options: [3] })).toContain('ემატება 3');
  });

  it('a backwards rule is described as subtracting', () => {
    expect(describeAnswer({ type: 'sequence-rule', start: 60, step: -5, count: 4, options: [-5] })).toContain('აკლდება 5');
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

  it('each lesson has one explore tool and a demonstration of more than two pictures', () => {
    for (const l of lessons) {
      const explore = l.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>;
      expect(explore.tool, l.id).toBeTruthy();
      const explain = l.activities.find((a) => a.kind === 'explain') as Extract<Activity, { kind: 'explain' }>;
      expect(explain.blocks.length, l.id).toBeGreaterThan(2);
    }
  });
});

describe('content: every sequence really is answerable from its rule', () => {
  const seqQuestions = () => lessons.flatMap((l) => questions(l).map((x) => ({ l, x })));

  it('a fill question has holes that exist, and its answers follow the step', () => {
    const fills = seqQuestions().filter(({ x }) => x.response.type === 'sequence-fill');
    expect(fills.length).toBeGreaterThan(4);
    for (const { l, x } of fills) {
      const r = x.response as Extract<ResponseSpec, { type: 'sequence-fill' }>;
      expect(Math.abs(r.step), `${l.id}/${x.id}`).toBeGreaterThan(0);
      for (const hole of r.holes) {
        expect(hole, `${l.id}/${x.id}`).toBeGreaterThanOrEqual(0);
        expect(hole).toBeLessThan(r.count);
      }
      const numbers = sequenceOf(r.start, r.step, r.count);
      expect(new Set(r.holes).size, `${l.id}/${x.id}`).toBe(r.holes.length);
      // the numbers really do follow one step, so the question has a single clear rule
      expect(stepOf(numbers), `${l.id}/${x.id}`).toBe(r.step);
      expect(holeValues(numbers, [...r.holes].sort((a, b) => a - b)).every((n) => Number.isFinite(n))).toBe(true);
    }
  });

  it('a rule question offers its real rule, and no duplicate options', () => {
    const rules = seqQuestions().filter(({ x }) => x.response.type === 'sequence-rule');
    expect(rules.length).toBeGreaterThan(1);
    for (const { l, x } of rules) {
      const r = x.response as Extract<ResponseSpec, { type: 'sequence-rule' }>;
      expect(r.options, l.id).toContain(r.step);
      expect(new Set(r.options).size, l.id).toBe(r.options.length);
      expect(r.options.length, l.id).toBeGreaterThan(1);
    }
  });

  it('a hop question asks for landings the rule really reaches', () => {
    const skips = seqQuestions().filter(({ x }) => x.response.type === 'skip-line');
    expect(skips.length).toBeGreaterThan(0);
    for (const { l, x } of skips) {
      const r = x.response as Extract<ResponseSpec, { type: 'skip-line' }>;
      expect(r.count, l.id).toBeGreaterThan(1);
      const landingsOfRule = sequenceOf(r.start, r.step, r.count);
      expect(landingsOfRule[landingsOfRule.length - 1], l.id).toBe(termAt(r.start, r.step, r.count - 1));
      // every landing stays a real number a Grade 2 student can read
      expect(Math.min(...landingsOfRule), l.id).toBeGreaterThanOrEqual(0);
      expect(Math.max(...landingsOfRule), l.id).toBeLessThanOrEqual(1000);
    }
  });

  it('each unit lesson uses the step its title promises', () => {
    const expected: Record<string, number[]> = {
      'g2-u02-l1': [2, -2],
      'g2-u02-l2': [5, -5],
      'g2-u02-l3': [10, -10],
      'g2-u02-l4': [100, -100],
    };
    for (const [id, steps] of Object.entries(expected)) {
      const used = questions(LESSON_CONTENT[id])
        .map((x) => x.response)
        .flatMap((r) => ('step' in r && typeof r.step === 'number' ? [r.step] : []))
        .concat(
          stageOf(LESSON_CONTENT[id], 'practice').flatMap((x) => (x.response.type === 'choice' || x.response.type === 'numeric' ? [] : [])),
        );
      expect(used.length, id).toBeGreaterThan(0);
      for (const step of used) expect(steps, `${id} uses ${step}`).toContain(step);
    }
  });
});

// ─────────────────────────── boards ───────────────────────────

describe('board: the skip-count line', () => {
  it('draws every landing the rule reaches and names the rule', () => {
    render(<SkipLine spec={{ start: 2, step: 2, count: 5, walker: 'rabbit' }} />);
    expect(document.querySelectorAll('.nl-tick')).toHaveLength(9);
    expect(text('.skl-rule')).toContain('ემატება 2');
    expect(text('.skl-rule')).toContain('2 → 4 → 6 → 8 → 10');
    expect(document.querySelector('.nl-marker')).toBeTruthy();
  });

  it('can hide the landings so the student counts the jumps', () => {
    render(<SkipLine spec={{ start: 5, step: 5, count: 4, hideLandings: true }} />);
    expect(text('.skl-rule')).toContain('?');
    expect(document.querySelectorAll('.nl-tick-label').length).toBeLessThan(4);
  });

  it('every landing is a real number inside the line', () => {
    render(<SkipLine spec={{ start: 30, step: -5, count: 5 }} />);
    const labels = Array.from(document.querySelectorAll('.nl-tick-label')).map((el) => Number(el.textContent));
    expect(labels.every((n) => Number.isFinite(n))).toBe(true);
    expect(Math.min(...labels)).toBeGreaterThanOrEqual(10);
    expect(Math.max(...labels)).toBeLessThanOrEqual(30);
  });
});

describe('board: hopping to the answer', () => {
  const board = (value = '0', onChange = vi.fn()) =>
    render(<SkipBoard response={{ start: 10, step: 2, count: 5 }} value={value} onChange={onChange} disabled={false} label="ნახტომები" />);

  it('one tap moves exactly one landing', () => {
    const onChange = vi.fn();
    board('0', onChange);
    fireEvent.click(screen.getByRole('button', { name: 'რიცხვი 12' }));
    expect(onChange).toHaveBeenLastCalledWith('1');
  });

  it('the hop button adds one hop and the undo takes it back', () => {
    const onChange = vi.fn();
    board('2', onChange);
    fireEvent.click(screen.getByRole('button', { name: /ნახტომი \+2/ }));
    expect(onChange).toHaveBeenLastCalledWith('3');
    fireEvent.click(screen.getByRole('button', { name: 'ბოლო ნახტომის გაუქმება' }));
    expect(onChange).toHaveBeenLastCalledWith('1');
  });

  it('stops at the last landing, so a hop cannot run past it', () => {
    board('4');
    expect((screen.getByRole('button', { name: /ნახტომი \+2/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(text('output')).toContain('18');
  });

  it('counts backwards from where it starts', () => {
    const onChange = vi.fn();
    render(<SkipBoard response={{ start: 20, step: -2, count: 4 }} value="1" onChange={onChange} disabled={false} label="უკან" />);
    fireEvent.click(screen.getByRole('button', { name: /ნახტომი −2/ }));
    expect(onChange).toHaveBeenLastCalledWith('2');
    expect(text('output')).toContain('18');
  });
});

describe('board: filling the holes', () => {
  it('the number goes into the place it belongs to', () => {
    const onChange = vi.fn();
    render(<SequenceFillBoard response={{ start: 6, step: 2, count: 5, holes: [2, 4] }} value="" onChange={onChange} disabled={false} label="შეავსე" />);
    fireEvent.change(screen.getByLabelText('3-ე ადგილის რიცხვი'), { target: { value: '10' } });
    expect(onChange).toHaveBeenLastCalledWith('10,');
  });

  it('the sequence on screen shows the holes as holes', () => {
    render(<SequenceFillBoard response={{ start: 6, step: 2, count: 5, holes: [1] }} value="" onChange={vi.fn()} disabled={false} label="შეავსე" />);
    const row = screen.getByRole('img', { name: /მიმდევრობა/ });
    expect(row.textContent).toContain('?');
    expect(text('.sfb-slot-name')).toBe('2-ე ადგილი');
  });

  it('only digits can be typed into a blank', () => {
    const onChange = vi.fn();
    render(<SequenceFillBoard response={{ start: 5, step: 5, count: 4, holes: [0] }} value="" onChange={onChange} disabled={false} label="შეავსე" />);
    fireEvent.change(screen.getByLabelText('1-ე ადგილის რიცხვი'), { target: { value: '1a0' } });
    expect(onChange).toHaveBeenLastCalledWith('10');
  });
});

describe('board: picking the rule', () => {
  it('offers each candidate step once and reports the choice', () => {
    const onChange = vi.fn();
    render(<SequenceRuleBoard response={{ start: 3, step: 3, count: 4, options: [3, 2, 4] }} value="" onChange={onChange} disabled={false} label="წესი" />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    fireEvent.click(screen.getAllByRole('radio')[0]);
    expect(onChange).toHaveBeenLastCalledWith('3');
  });

  it('names each rule in words, not only as a sign', () => {
    render(<SequenceRuleBoard response={{ start: 60, step: -5, count: 4, options: [-5, 5] }} value="" onChange={vi.fn()} disabled={false} label="წესი" />);
    expect(screen.getByText(/აკლდება 5/)).toBeTruthy();
    expect(screen.getByText(/ემატება 5/)).toBeTruthy();
  });
});

describe('board: pictures that carry their numbers', () => {
  it('groups are drawn with a running total beside each', () => {
    render(<GroupCount size={5} groups={4} noun="საგანი" />);
    const totals = Array.from(document.querySelectorAll('.gcnt-group b')).map((el) => el.textContent);
    expect(totals).toEqual(['5', '10', '15', '20']);
  });

  it('a sequence picture keeps its holes and says the step', () => {
    render(<SequencePicture start={20} step={-2} count={4} holes={[1]} />);
    const row = screen.getByRole('img', { name: /მიმდევრობა/ });
    expect(row.getAttribute('aria-label')).toContain('გამოტოვებული');
    expect(row.textContent).toContain('−2');
  });
});

// ─────────────────────────── tools ───────────────────────────

const toolOf = (l: Lesson) => (l.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>).tool;

describe('tools: the skip-count lab', () => {
  it('hops by the chosen step and reports where it stands', () => {
    render(<SkipLab tool={{ tool: 'skip-lab', start: 2, steps: [2, -2], landings: 6 }} />);
    expect(text('.lab-status')).toContain('დასაწყისი: 2');
    fireEvent.click(screen.getByRole('button', { name: /ნახტომი \+2/ }));
    expect(text('.lab-status')).toContain('4');
    expect(text('.lab-facts')).toContain('ნახტომები: 1');
  });

  it('switching the step sends the character back to the start', () => {
    render(<SkipLab tool={{ tool: 'skip-lab', start: 2, steps: [2, -2], landings: 6 }} />);
    fireEvent.click(screen.getByRole('button', { name: /ნახტომი \+2/ }));
    fireEvent.click(screen.getByRole('button', { name: /−2 ნაბიჯი/ }));
    expect(text('.lab-status')).toContain('დასაწყისი: 2');
    expect(text('.lab-status')).toContain('−2');
    expect(text('.lab-status')).toMatch(/(-2|−2)-ობით/);
  });
});

describe('tools: groups of ten and hundreds', () => {
  it('each group of ten moves the tens digit and leaves the ones alone', () => {
    render(<TenGroupsLab tool={{ tool: 'ten-groups-lab', start: 40, groups: 8, step: 10 }} />);
    expect(text('.lab-status')).toContain('= 70');
    fireEvent.click(screen.getByRole('button', { name: '+10 ჯგუფი' }));
    expect(text('.lab-status')).toContain('= 80');
    expect(text('.lab-status')).toContain('ერთეულების ციფრი არ შეიცვალა');
  });

  it('the hundreds lab adds one hundred at a time and keeps the rest', () => {
    render(<HundredLab tool={{ tool: 'hundred-lab', start: 100, groups: 8 }} />);
    expect(text('.lab-status')).toContain('200');
    fireEvent.click(screen.getByRole('button', { name: /\+100/ }));
    expect(text('.lab-status')).toContain('300');
    expect(text('.lab-facts')).toContain('ასეულები: 3');
  });
});

describe('tools: the pattern lab', () => {
  it('reveals the rule when asked, and then the whole sequence', () => {
    render(<PatternLab tool={{ tool: 'pattern-lab', patterns: [{ start: 5, step: 3, count: 6, holes: [3, 5] }] }} />);
    expect(text('.lab-status')).toContain('შეავსე');
    fireEvent.click(screen.getByRole('button', { name: 'ნახე წესი' }));
    expect(text('.lab-status')).toContain('ემატება 3');
    expect(text('.lab-status')).toContain('5, 8, 11, 14, 17, 20');
  });

  it('checks the blanks against the numbers, not against a guess', () => {
    render(<PatternLab tool={{ tool: 'pattern-lab', patterns: [{ start: 5, step: 3, count: 6, holes: [3, 5] }] }} />);
    fireEvent.change(screen.getByLabelText('4-ე ადგილის რიცხვი'), { target: { value: '14' } });
    fireEvent.change(screen.getByLabelText('6-ე ადგილის რიცხვი'), { target: { value: '20' } });
    expect(text('.lab-status')).toContain('✓');
  });
});

describe('tools: the step-by-step story', () => {
  it('walks the forward story one landing at a time and names the rule', () => {
    render(<SkipDemo block={{ type: 'skip-demo', mode: 'forward', start: 2, step: 2, count: 4, walker: 'rabbit', steps: ['ერთი', 'ორი', 'სამი', 'ოთხი'] }} />);
    // the stepper plays by itself; stepping by hand is what the tests control
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(text('.demo-step').length).toBeGreaterThan(0);
    expect(text('.demo-rule')).toContain('+2');
    expect(text('.demo-rule')).toContain('ემატება 2');
  });

  it('the backwards story shows the same numbers in reverse', () => {
    render(<SkipDemo block={{ type: 'skip-demo', mode: 'backward', start: 12, step: -2, count: 4, steps: ['a', 'b', 'c', 'd'] }} />);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(text('.demo-rule')).toContain('აკლდება 2');
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
    case 'skip-line':
      for (let n = 0; n < r.count - 1; n += 1) {
        const button = screen.queryByRole('button', { name: /ნახტომი [+−]/ });
        if (button) fireEvent.click(button);
      }
      break;
    case 'sequence-fill': {
      const numbers = sequenceOf(r.start, r.step, r.count);
      const holes = [...r.holes].sort((a, b) => a - b);
      holes.forEach((pos, i) => {
        fireEvent.change(screen.getByLabelText(`${pos + 1}-ე ადგილის რიცხვი`), { target: { value: String(numbers[pos]) } });
      });
      break;
    }
    case 'sequence-rule':
      fireEvent.click(screen.getAllByRole('radio')[r.options.indexOf(r.step)]);
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

describe('g2-u02 unit page', () => {
  it('lists the five lessons, all playable and in order', () => {
    go('#/student/lessons/g2-u02');
    const list = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(list).toHaveLength(5);
    U02.forEach((id, i) => expect(within(list[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
  });
});

describe.each(U02.map((id) => [id] as const))('%s plays to the end', (id) => {
  it('every step works with its own correct answers and the progress is saved', () => {
    const lesson = LESSON_CONTENT[id];
    go(`#/student/lessons/${id}`);
    expect(screen.getByText(`ნაბიჯი 1 / ${lesson.activities.length}`)).toBeTruthy();
    playThrough(lesson);
    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    const checks = stageOf(lesson, 'check').length;
    expect(screen.getByText(`${checks} / ${checks}`)).toBeTruthy();
    expect(saved()[id]).toMatchObject({ status: 'completed', checkCorrect: checks, checkTotal: checks });
    if (id !== 'g2-u02-l5') {
      expect(screen.getByRole('link', { name: 'გაგრძელება: U02.' + (Number(id.slice(-1)) + 1) }).getAttribute('href')).toBe(
        `#/student/lessons/g2-u02-l${Number(id.slice(-1)) + 1}`,
      );
    } else {
      expect(screen.getByRole('link', { name: 'U02-ზე დაბრუნება' })).toBeTruthy();
    }
  });
});

describe('feedback is aimed at the real mistake', () => {
  it('a blank copied from its neighbour is told apart from a wrong rule', () => {
    go('#/student/lessons/g2-u02-l1');
    const lesson = LESSON_CONTENT['g2-u02-l1'];
    const stop = lesson.activities.findIndex((a) => a.id === 'practice-1');
    lesson.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    // 6, 8, ?, 12, ? — writing 8 for the middle blank repeats the neighbour instead of adding the step
    fireEvent.change(screen.getByLabelText('3-ე ადგილის რიცხვი'), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText('5-ე ადგილის რიცხვი'), { target: { value: '14' } });
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('მეზობლის');
  });

  it('stopping the character early says how many jumps are left', () => {
    go('#/student/lessons/g2-u02-l1');
    const lesson = LESSON_CONTENT['g2-u02-l1'];
    const stop = lesson.activities.findIndex((a) => a.id === 'practice-2');
    lesson.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    // 10 + 2 + 2 = 14: two jumps instead of four
    fireEvent.click(screen.getByRole('button', { name: /ნახტომი \+2/ }));
    fireEvent.click(screen.getByRole('button', { name: /ნახტომი \+2/ }));
    submit();
    expect(feedback()).toContain('14');
    expect(feedback()).toContain('კიდევ 2');
  });

  it('an untouched line is unfinished, not wrong', () => {
    go('#/student/lessons/g2-u02-l1');
    const lesson = LESSON_CONTENT['g2-u02-l1'];
    const stop = lesson.activities.findIndex((a) => a.id === 'practice-2');
    lesson.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    submit();
    expect(feedback()).toContain('ნახტომები');
  });
});

describe('style: motion, layout and honest labels', () => {
  const css = readFileSync('src/lessons/learn.css', 'utf8');
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));

  it('the hopping character is switched off under reduced motion', () => {
    for (const cls of ['.skl-walker-char', '.skb-stop', '.ods-cell']) expect(reduced, cls).toContain(cls);
  });

  it('the blanks stack on a phone', () => {
    const small = css.slice(css.indexOf('@media (max-width: 560px)'));
    expect(small).toContain('.sfb-inputs');
    expect(small).toContain('flex-direction: column');
  });

  it('the rule is always written as words, not only as a hidden colour', () => {
    render(<SkipLine spec={{ start: 5, step: 5, count: 3 }} />);
    expect(text('.skl-rule')).toContain('ემატება 5');
    cleanup();
    render(<GroupCount size={5} groups={3} />);
    expect(Array.from(document.querySelectorAll('.gcnt-group b')).map((b) => b.textContent)).toEqual(['5', '10', '15']);
  });

  it('the answer controls can be reached by their labels', () => {
    render(<SequenceFillBoard response={{ start: 2, step: 2, count: 4, holes: [3] }} value="" onChange={vi.fn()} disabled={false} label="შეავსე" />);
    expect(screen.getByLabelText('4-ე ადგილის რიცხვი')).toBeTruthy();
  });
});
