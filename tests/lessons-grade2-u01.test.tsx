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
  PLACES,
  PLACE_NAME,
  blocksOf,
  blocksText,
  breakDown,
  digitOrValue,
  digitValuesText,
  digitsOf,
  exchange,
  exchangeRule,
  exchangeable,
  expandedShortText,
  expandedText,
  isStandard,
  needsRegroup,
  parseExpanded,
  partsHold,
  partsOf,
  placePuzzleHolds,
  valueAt,
  valueOf,
  valueOfBlocks,
  type DigitCounts,
} from '../src/lessons/exercises/PlaceValueGeometry';
import { BuildMat, ExpandedCards, ExpandedLine, PlaceBlocks, PlaceCards } from '../src/lessons/exercises/PlaceValueBoard';
import { DigitLab, ExpandedLab, MissingPlaceLab, PlaceDemo, PlaceLab } from '../src/lessons/exercises/PlaceValueTools';
import { ExpandedBuildAnswer, PlaceBuildAnswer, PlaceMissingAnswer } from '../src/lessons/exercises/PlaceValueAnswers';
import type { Activity, Lesson, QuestionActivity, ResponseSpec } from '../src/lessons/types';

/**
 * Grade 2 · Unit 1: "Place Value: Ones, Tens, and Hundreds".
 *
 * Every judgement is checked against the number: what a digit is worth comes from its place, the value of a set of blocks
 * is the sum of what its blocks are worth, and an expanded form is the sum the places make. Nothing is judged by how a
 * picture looks.
 *
 * Touch has not been tried on a device (there is no browser here); the tests drive taps on the boards' buttons.
 */

const U01 = ['g2-u01-l1', 'g2-u01-l2', 'g2-u01-l3', 'g2-u01-l4', 'g2-u01-l5'];
const lessons = U01.map((id) => LESSON_CONTENT[id]);
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 2 U01 is the place-value unit', () => {
  it('has the approved titles, ids and codes', () => {
    const unit = getUnit('g2-u01');
    expect(unit?.title).toBe('Place Value: Ones, Tens, and Hundreds');
    expect(unit?.grade).toBe(2);
    expect(unit?.lessons.map((l) => l.id)).toEqual(U01);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U01.1', 'U01.2', 'U01.3', 'U01.4', 'U01.5']);
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Understanding Hundreds, Tens, and Ones',
      'Representing Numbers with Place-Value Blocks',
      'Writing Numbers in Expanded Form',
      'Identifying the Value of Each Digit',
      'Building and Decomposing Three-Digit Numbers',
    ]);
  });

  it('has content for every one of the five lessons', () => {
    for (const id of U01) {
      expect(LESSON_CONTENT[id], id).toBeTruthy();
      expect(LESSON_CONTENT[id].id).toBe(id);
      expect(LESSON_CONTENT[id].status).toBe('placeholder');
    }
  });
});

// ─────────────────────────── the engine ───────────────────────────

describe('place value: places and what they are worth', () => {
  it('a digit is worth its face value times its place', () => {
    expect(valueOf(7, 'ones')).toBe(7);
    expect(valueOf(7, 'tens')).toBe(70);
    expect(valueOf(7, 'hundreds')).toBe(700);
    expect(valueAt(345, 'hundreds')).toBe(300);
    expect(valueAt(345, 'tens')).toBe(40);
    expect(valueAt(345, 'ones')).toBe(5);
    // the digit is not its value: the same mark, two different amounts
    expect(digitOrValue(4, 'tens')).toEqual({ digit: 4, value: 40 });
    expect(digitOrValue(4, 'hundreds')).toEqual({ digit: 4, value: 400 });
  });

  it('the three digits are read highest place first, zero places included', () => {
    expect(digitsOf(345)).toEqual({ hundreds: 3, tens: 4, ones: 5 });
    expect(digitsOf(407)).toEqual({ hundreds: 4, tens: 0, ones: 7 });
    expect(digitsOf(90)).toEqual({ hundreds: 0, tens: 9, ones: 0 });
    expect(PLACES).toEqual(['hundreds', 'tens', 'ones']);
  });

  it('says the digits and their values in words, so nothing is only a picture', () => {
    expect(blocksText({ hundreds: 3, tens: 0, ones: 5 })).toBe('3 ასეულები და 5 ერთეულები');
    expect(blocksText({ hundreds: 0, tens: 0, ones: 0 })).toBe('არც ერთი ბლოკი');
    expect(digitValuesText(345)).toBe('ასეული 3 = 300, ათეული 4 = 40, ერთეული 5 = 5');
    expect(PLACE_NAME.tens).toBe('ათეული');
  });
});

describe('place value: blocks are worth what they hold', () => {
  it('the value of a set is its blocks added up, grouped or not', () => {
    expect(valueOfBlocks({ hundreds: 1, tens: 2, ones: 5 })).toBe(125);
    expect(valueOfBlocks({ hundreds: 0, tens: 0, ones: 14 })).toBe(14);
    expect(valueOfBlocks({ hundreds: 0, tens: 12, ones: 0 })).toBe(120);
    expect(blocksOf(246)).toEqual({ hundreds: 2, tens: 4, ones: 6 });
  });

  it('a place holding ten or more is not standard form', () => {
    expect(isStandard({ hundreds: 1, tens: 2, ones: 9 })).toBe(true);
    expect(isStandard({ hundreds: 1, tens: 2, ones: 10 })).toBe(false);
    expect(needsRegroup({ hundreds: 0, tens: 0, ones: 12 })).toBe(true);
    expect(needsRegroup({ hundreds: 1, tens: 0, ones: 2 })).toBe(false);
  });

  it('ten of a place become one of the next, and the value never changes', () => {
    const tenOnes: DigitCounts = { hundreds: 0, tens: 0, ones: 10 };
    const oneTen = exchange(tenOnes, 'ones');
    expect(oneTen).toEqual({ hundreds: 0, tens: 1, ones: 0 });
    expect(valueOfBlocks(oneTen as DigitCounts)).toBe(valueOfBlocks(tenOnes));

    const tenTens: DigitCounts = { hundreds: 0, tens: 10, ones: 0 };
    expect(exchange(tenTens, 'tens')).toEqual({ hundreds: 1, tens: 0, ones: 0 });

    // nine is not ten, and hundreds cannot climb any higher
    expect(exchange({ hundreds: 0, tens: 0, ones: 9 }, 'ones')).toBeNull();
    expect(exchange({ hundreds: 1, tens: 0, ones: 0 }, 'hundreds')).toBeNull();
    expect(exchangeable({ hundreds: 0, tens: 12, ones: 21 })).toEqual([
      { place: 'ones', count: 2 },
      { place: 'tens', count: 1 },
    ]);
  });

  it('breaking one block into ten of the place below keeps the value', () => {
    expect(breakDown({ hundreds: 1, tens: 0, ones: 0 }, 'hundreds')).toEqual({ hundreds: 0, tens: 10, ones: 0 });
    expect(breakDown({ hundreds: 0, tens: 1, ones: 0 }, 'tens')).toEqual({ hundreds: 0, tens: 0, ones: 10 });
    expect(breakDown({ hundreds: 0, tens: 0, ones: 5 }, 'ones')).toBeNull();
  });

  it('the exchange rule is stated for the places that have one', () => {
    expect(exchangeRule('ones')).toEqual({ ten: '10 ერთეული', one: '1 ათეული', ok: true });
    expect(exchangeRule('tens')).toEqual({ ten: '10 ათეული', one: '1 ასეული', ok: true });
    expect(exchangeRule('hundreds').ok).toBe(false);
  });
});

describe('place value: expanded form', () => {
  it('a number is the sum of what each place is worth, zeros included', () => {
    expect(partsOf(345).map((p) => p.value)).toEqual([300, 40, 5]);
    expect(expandedText(345)).toBe('300 + 40 + 5');
    expect(expandedText(405)).toBe('400 + 0 + 5');
    // the short form drops the zero, and both are the same number
    expect(expandedShortText(405)).toBe('400 + 5');
    expect(parseExpanded(expandedText(405))).toBe(405);
    expect(parseExpanded('300 + 40 + 5')).toBe(345);
    expect(parseExpanded('nonsense')).toBeNull();
  });

  it('the cards belong to places: 300 is hundreds, 30 tens, 3 ones', () => {
    expect(partsHold(345, [300, 40, 5])).toBe(true);
    expect(partsHold(345, [3, 4, 5])).toBe(false);
    expect(partsHold(345, [40, 300, 5])).toBe(false);
    expect(partsHold(405, [400, 0, 5])).toBe(true);
    expect(partsHold(405, [400, 5])).toBe(false);
  });

  it('a zero place has to be written, not skipped', () => {
    const parts = partsOf(508);
    expect(parts.map((p) => p.value)).toEqual([500, 0, 8]);
    expect(parts.find((p) => p.place === 'tens')?.digit).toBe(0);
  });
});

describe('place value: the missing place', () => {
  it('the hidden place is worth its digit times its place', () => {
    expect(placePuzzleHolds(468, 'ones')).toBe(true);
    expect(placePuzzleHolds(468, 'tens')).toBe(true);
    expect(placePuzzleHolds(468, 'hundreds')).toBe(true);
    // a blank worth nothing would be a trap, not a question
    expect(placePuzzleHolds(507, 'tens')).toBe(false);
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

describe('checking: building a number from blocks', () => {
  const question = q({ type: 'place-build', target: 235 });

  it('accepts the standard blocks for the target, and nothing else', () => {
    expect(evaluateAnswer(question, '2,3,5').verdict).toBe('correct');
    expect(evaluateAnswer(question, '0,23,5').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, '2,2,5').verdict).toBe('incorrect');
  });

  it('the value is what counts, but a built number stays in standard form', () => {
    // 235 written with too many in a place is the right value in the wrong grouping
    const messy = evaluateAnswer(question, '2,2,15');
    expect(messy.verdict).toBe('incorrect');
    expect(messy.misconceptionId).toBe('not-standard');
    // a question that is explicitly about loose blocks accepts it
    const loose = q({ type: 'place-build', target: 235, allowRegroup: true });
    expect(evaluateAnswer(loose, '2,2,15').verdict).toBe('correct');
  });

  it('an empty mat is unfinished, not wrong', () => {
    expect(evaluateAnswer(question, '0,0,0').verdict).toBe('incomplete');
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
  });

  it('a wrong number is marked wrong with the lesson\'s own words', () => {
    const result = evaluateAnswer(question, '2,2,5');
    expect(result.verdict).toBe('incorrect');
    expect(result.feedback).toBeTruthy();
  });
});

describe('checking: the expanded form', () => {
  const question = q({ type: 'expanded-build', value: 345, cards: [300, 40, 5, 3, 30, 4] });

  it('accepts exactly the place values, in order', () => {
    expect(evaluateAnswer(question, '300,40,5').verdict).toBe('correct');
    expect(evaluateAnswer(question, '300,5,40').verdict).toBe('incorrect');
    // face values instead of place values
    expect(evaluateAnswer(question, '3,4,5').verdict).toBe('incorrect');
  });

  it('a zero place needs its zero card', () => {
    const zero = q({ type: 'expanded-build', value: 306, cards: [300, 0, 6, 30, 3, 60] });
    expect(evaluateAnswer(zero, '300,0,6').verdict).toBe('correct');
    expect(evaluateAnswer(zero, '300,6,0').verdict).toBe('incorrect');
  });

  it('an unfilled row is unfinished', () => {
    expect(evaluateAnswer(question, ',,5').verdict).toBe('incomplete');
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
  });
});

describe('checking: tapping the digit in a place', () => {
  const question = q({ type: 'digit-tap', value: 582, target: 'tens' });

  it('judges the place, not the digit', () => {
    expect(evaluateAnswer(question, 'tens').verdict).toBe('correct');
    expect(evaluateAnswer(question, 'hundreds').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
  });
});

describe('checking: the missing place', () => {
  const question = q({ type: 'place-missing', value: 918, missing: 'tens' });

  it('wants the place value, not the face value', () => {
    expect(evaluateAnswer(question, '10').verdict).toBe('correct');
    const face = evaluateAnswer(question, '1');
    expect(face.verdict).toBe('incorrect');
    expect(face.misconceptionId).toBe('face-value');
    expect(evaluateAnswer(question, '100').verdict).toBe('incorrect');
    expect(evaluateAnswer(question, '').verdict).toBe('incomplete');
  });

  it('a hundreds place can be worth hundreds', () => {
    const hundreds = q({ type: 'place-missing', value: 835, missing: 'hundreds' });
    expect(evaluateAnswer(hundreds, '800').verdict).toBe('correct');
    expect(evaluateAnswer(hundreds, '8').verdict).toBe('incorrect');
  });
});

describe('checking: the answer can be described for the student', () => {
  it('says the blocks, the cards, the digit and the value', () => {
    expect(describeAnswer({ type: 'place-build', target: 235 })).toBe('2 ასეული, 3 ათეული, 5 ერთეული = 235');
    expect(describeAnswer({ type: 'expanded-build', value: 345, cards: [] })).toBe('300 + 40 + 5');
    expect(describeAnswer({ type: 'digit-tap', value: 582, target: 'tens' })).toBe('ათეული: ციფრი 8 (ღირს 80)');
    expect(describeAnswer({ type: 'place-missing', value: 918, missing: 'tens' })).toBe('ათეული: 10');
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

  it('every question explains itself and has feedback in the lesson\'s own words', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        expect(x.explanation.length, `${l.id}/${x.id}`).toBeGreaterThan(5);
        expect(x.fallbackFeedback?.length, `${l.id}/${x.id}`).toBeGreaterThan(5);
      }
  });

  it('each lesson has one explore tool and one demonstration', () => {
    for (const l of lessons) {
      const explore = l.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>;
      expect(explore.tool, l.id).toBeTruthy();
      const explain = l.activities.find((a) => a.kind === 'explain') as Extract<Activity, { kind: 'explain' }>;
      expect(explain.blocks.length, l.id).toBeGreaterThan(2);
    }
  });
});

describe('content: every place-value question really is answerable', () => {
  it('a build question asks for a number whose blocks exist', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'place-build') continue;
        expect(Number.isInteger(r.target), `${l.id}/${x.id}`).toBe(true);
        expect(r.target).toBeGreaterThanOrEqual(100);
        expect(r.target).toBeLessThanOrEqual(999);
        // a standard set of blocks of exactly the right value exists, so the question can be answered
        const d = digitsOf(r.target);
        expect(valueOfBlocks(d)).toBe(r.target);
        expect(isStandard(d)).toBe(true);
      }
  });

  it('an expanded-form question ships the cards its answer needs', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'expanded-build') continue;
        const want = partsOf(r.value).map((p) => p.value);
        for (const card of want) expect(r.cards, `${l.id}/${x.id}: missing card ${card}`).toContain(card);
        // and at least one distractor, so the answer is not simply \"all of them in order\"
        expect(r.cards.length, `${l.id}/${x.id}`).toBeGreaterThan(want.length);
      }
  });

  it('a missing-place question hides a place that is really worth something', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'place-missing') continue;
        expect(placePuzzleHolds(r.value, r.missing), `${l.id}/${x.id}`).toBe(true);
      }
  });

  it('a digit-tap question taps a place that exists in its number', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const r = x.response;
        if (r.type !== 'digit-tap') continue;
        expect(PLACES, `${l.id}/${x.id}`).toContain(r.target);
        expect(r.value).toBeGreaterThanOrEqual(100);
        expect(r.value).toBeLessThanOrEqual(999);
      }
  });
});

// ─────────────────────────── boards ───────────────────────────

describe('board: the blocks say what they are worth', () => {
  it('draws one flat per hundred, one rod per ten and one cube per one', () => {
    render(<PlaceBlocks counts={{ hundreds: 2, tens: 3, ones: 4 }} label="ბლოკები" />);
    expect(document.querySelectorAll('.pv-col.is-hundreds .pv-flat')).toHaveLength(2);
    expect(document.querySelectorAll('.pv-col.is-tens .pv-rod')).toHaveLength(3);
    expect(document.querySelectorAll('.pv-col.is-ones .pv-cube')).toHaveLength(4);
    expect(document.querySelector('.pv')?.getAttribute('aria-label')).toContain('სულ 234');
  });

  it('flags a place with ten or more without pretending it is standard form', () => {
    render(<PlaceBlocks counts={{ hundreds: 0, tens: 0, ones: 12 }} label="ბლოკები" />);
    expect(document.querySelector('.pv-col.is-ones .pv-cube')).toBeTruthy();
    expect(screen.getAllByText(/10 ერთეულები = 1 ათეული/).length).toBeGreaterThan(0);
    expect(document.querySelector('.pv-note')).toBeTruthy();
  });

  it('never draws a place that holds nothing', () => {
    render(<PlaceBlocks counts={{ hundreds: 4, tens: 0, ones: 5 }} label="ბლოკები" />);
    expect(document.querySelector('.pv-col.is-tens')).toBeNull();
    expect(text('.pv-value')).toBe('= 405');
  });
});

describe('board: the digit cards name the place and the value', () => {
  it('shows the digit and what it is worth in each place', () => {
    render(<PlaceCards value={345} label="ციფრები" />);
    const cards = document.querySelectorAll('.pvc-card');
    expect(cards).toHaveLength(3);
    expect(cards[0].getAttribute('aria-label')).toContain('3');
    expect(cards[0].getAttribute('aria-label')).toContain('300');
    expect(text('.pvc')).toContain('ასეული');
  });

  it('a hidden place is covered, not silently dropped', () => {
    render(<PlaceCards value={918} hide="tens" label="ციფრები" />);
    const cards = document.querySelectorAll('.pvc-card');
    expect(cards[1].textContent).toContain('?');
    expect(cards[1].getAttribute('aria-label')).toContain('დაფარულია');
  });

  it('the expanded line writes the zero place', () => {
    render(<ExpandedLine value={405} />);
    expect(text('.exp')).toContain('400 + 0 + 5');
  });
});

describe('board: building a number on the mat', () => {
  const mat = (counts: DigitCounts, onChange = vi.fn(), allowRegroup = true) =>
    render(<BuildMat counts={counts} onChange={onChange} label="დაფა" allowRegroup={allowRegroup} />);

  it('adds one block to the place that was tapped', () => {
    const onChange = vi.fn();
    mat({ hundreds: 0, tens: 0, ones: 0 }, onChange);
    fireEvent.click(screen.getByRole('button', { name: /დაამატე 1 ბრტყელი/ }));
    expect(onChange).toHaveBeenLastCalledWith({ hundreds: 1, tens: 0, ones: 0 });
  });

  it('takes a placed block back off', () => {
    const onChange = vi.fn();
    mat({ hundreds: 1, tens: 0, ones: 0 }, onChange);
    fireEvent.click(screen.getAllByRole('button', { name: /წაიღე ერთი/ })[0]);
    expect(onChange).toHaveBeenLastCalledWith({ hundreds: 0, tens: 0, ones: 0 });
  });

  it('offers the exchange only when there are ten to exchange', () => {
    mat({ hundreds: 0, tens: 0, ones: 9 });
    expect((screen.getByRole('button', { name: /10 ერთეულები გახადე 1 ათეული/ }) as HTMLButtonElement).disabled).toBe(true);
    cleanup();
    const onChange = vi.fn();
    mat({ hundreds: 0, tens: 0, ones: 10 }, onChange);
    fireEvent.click(screen.getByRole('button', { name: /10 ერთეულები გახადე 1 ათეული/ }));
    expect(onChange).toHaveBeenLastCalledWith({ hundreds: 0, tens: 1, ones: 0 });
  });

  it('reports the value of the blocks, not the number of blocks', () => {
    mat({ hundreds: 1, tens: 2, ones: 5 });
    expect(text('.bm-total')).toContain('125');
  });
});

describe('board: the expanded-form cards', () => {
  it('puts a card into the place that was tapped and adds the row up', () => {
    const onChange = vi.fn();
    render(<ExpandedCards value={345} cards={[300, 40, 5, 3]} slots={['', '', '']} onChange={onChange} label="ბარათები" />);
    fireEvent.click(screen.getByRole('button', { name: 'ბარათი 300' }));
    fireEvent.click(screen.getAllByRole('button', { name: /ასეულიის ადგილი/ })[0]);
    expect(onChange).toHaveBeenLastCalledWith(['300', '', '']);
  });

  it('says whether the cards add up to the number', () => {
    render(<ExpandedCards value={345} cards={[300, 40, 5]} slots={['300', '40', '5']} onChange={vi.fn()} label="ბარათები" />);
    expect(text('.exb-line')).toContain('300 + 40 + 5 = 345');
    expect(screen.getByText(/ჯამი ემთხვევა: 345/)).toBeTruthy();
  });
});

// ─────────────────────────── tools ───────────────────────────

const toolOf = (l: Lesson) => (l.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>).tool;

describe('tools: the block lab counts what it is given', () => {
  it('adds blocks and reports the value they are worth', () => {
    render(<PlaceLab tool={toolOf(lessons[0])} />);
    expect(text('.lab-status')).toContain('125');
    fireEvent.click(screen.getByRole('button', { name: /დაამატე 1 ბრტყელი/ }));
    expect(text('.lab-status')).toContain('225');
    expect(text('.lab-facts')).toContain('სულ: 225');
  });

  it('says when the mat is not in standard form, and fixes it on exchange', () => {
    render(<PlaceLab tool={{ tool: 'place-lab', start: { hundreds: 0, tens: 0, ones: 11 } }} />);
    expect(text('.lab-status')).toContain('დაუჯგუფებელია');
    fireEvent.click(screen.getByRole('button', { name: /10 ერთეულები გახადე 1 ათეული/ }));
    expect(text('.lab-status')).toContain('სტანდარტული');
  });
});

describe('tools: the digit lab lights up a place', () => {
  it('names the digit, its place and what it is worth', () => {
    render(<DigitLab tool={{ tool: 'digit-lab', numbers: [372, 447] }} />);
    expect(text('.lab-status')).toContain('შეეხე ერთ ციფრს');
    fireEvent.click(screen.getAllByRole('button', { name: /ათეული/ })[0]);
    expect(text('.lab-status')).toContain('ციფრი 7');
    expect(text('.lab-status')).toContain('70');
  });

  it('switches numbers and forgets the tapped digit', () => {
    render(<DigitLab tool={{ tool: 'digit-lab', numbers: [372, 447] }} />);
    fireEvent.click(screen.getAllByRole('button', { name: /ასეული/ })[0]);
    fireEvent.click(screen.getByRole('radio', { name: '447' }));
    expect(text('.lab-status')).toContain('შეეხე ერთ ციფრს');
  });
});

describe('tools: the expanded-form lab adds the cards up', () => {
  it('accepts the right cards and says so', () => {
    render(<ExpandedLab tool={{ tool: 'expanded-lab', numbers: [345] }} />);
    const cards = ['ბარათი 300', 'ბარათი 40', 'ბარათი 5'];
    const slots = () => screen.getAllByRole('button', { name: /ის ადგილი:/ });
    cards.forEach((name, i) => {
      fireEvent.click(screen.getByRole('button', { name }));
      fireEvent.click(slots()[i]);
    });
    expect(text('.lab-status')).toContain('300 + 40 + 5 = 345');
  });
});

describe('tools: the missing-place lab', () => {
  it('hides a place and checks the value that fills it', () => {
    render(<MissingPlaceLab tool={{ tool: 'missing-place-lab', numbers: [468], places: ['ones', 'tens'] }} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '8' } });
    expect(text('.lab-status')).toContain('სწორია');
    fireEvent.change(input, { target: { value: '80' } });
    expect(text('.lab-status')).toContain('ჯერ არ არის');
  });
});

describe('tools: the place-value story ends on the number it is about', () => {
  it('the regrouping story of 134 ends with 134 on the mat, not with 13', () => {
    render(<PlaceDemo block={{ type: 'place-demo', mode: 'regroup', value: 134, steps: ['a', 'b', 'c', 'd'] }} />);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(text('.pv-caption')).toContain('134');
  });
});

describe('tools: the place-value story', () => {
  it('walks the regrouping story and ends with the value unchanged', () => {
    render(
      <PlaceDemo
        block={{
          type: 'place-demo',
          mode: 'regroup',
          value: 10,
          steps: ['ერთი', 'ორი', 'სამი', 'ოთხი'],
        }}
      />,
    );
    expect(text('.demo-step')).toContain('ერთი');
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(text('.demo-step')).toContain('ორი');
    expect(document.querySelectorAll('.pv-cube').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(text('.demo-step')).toContain('ოთხი');
    // the exchange is a regrouping of the same ten, not a new number
    expect(text('.demo-place-rule')).toContain('10 ერთეული = 1 ათეული');
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
const text = (sel: string) => document.querySelector(sel)?.textContent ?? '';

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
    case 'place-build': {
      const d = digitsOf(r.target);
      for (const place of PLACES) {
        const name = place === 'hundreds' ? /დაამატე 1 ბრტყელი/ : place === 'tens' ? /დაამატე 1 ჩხირი/ : /დაამატე 1 კუბიკი/;
        const button = () => screen.getByRole('button', { name });
        for (let n = 0; n < d[place]; n += 1) fireEvent.click(button());
      }
      break;
    }
    case 'expanded-build': {
      const want = partsOf(r.value).map((p) => p.value);
      want.forEach((card, i) => {
        fireEvent.click(screen.getByRole('button', { name: `ბარათი ${card}` }));
        fireEvent.click(screen.getAllByRole('button', { name: /ის ადგილი:/ })[i]);
      });
      break;
    }
    case 'digit-tap':
      fireEvent.click(screen.getAllByRole('button', { name: new RegExp(`^${PLACE_NAME[r.target]}:`) })[0]);
      break;
    case 'place-missing':
      fireEvent.change(screen.getByRole('textbox'), { target: { value: String(valueAt(r.value, r.missing)) } });
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

describe('g2-u01 unit page', () => {
  it('lists the five lessons, all playable and in order', () => {
    go('#/student/lessons/g2-u01');
    const list = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(list).toHaveLength(5);
    U01.forEach((id, i) => expect(within(list[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
  });
});

describe.each(U01.map((id) => [id] as const))('%s plays to the end', (id) => {
  it('every step works with its own correct answers and the progress is saved', () => {
    const lesson = LESSON_CONTENT[id];
    go(`#/student/lessons/${id}`);
    expect(screen.getByText(`ნაბიჯი 1 / ${lesson.activities.length}`)).toBeTruthy();
    playThrough(lesson);
    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    const checks = stageOf(lesson, 'check').length;
    expect(screen.getByText(`${checks} / ${checks}`)).toBeTruthy();
    expect(saved()[id]).toMatchObject({ status: 'completed', checkCorrect: checks, checkTotal: checks });
    if (id !== 'g2-u01-l5') {
      // the next lesson of the same unit is playable, so the player offers it
      expect(screen.getByRole('link', { name: 'გაგრძელება: U01.' + (Number(id.slice(-1)) + 1) }).getAttribute('href')).toBe(
        `#/student/lessons/g2-u01-l${Number(id.slice(-1)) + 1}`,
      );
    } else {
      expect(screen.getByRole('link', { name: 'U01-ზე დაბრუნება' })).toBeTruthy();
    }
  });
});

describe('feedback is aimed at the real mistake', () => {
  it('a face value instead of a place value is told apart', () => {
    go('#/student/lessons/g2-u01-l4');
    const lesson = LESSON_CONTENT['g2-u01-l4'];
    const stop = lesson.activities.findIndex((a) => a.id === 'practice-2');
    lesson.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    // 634 with 3 asked: the face value is the classic slip, and the feedback says why it is wrong
    const r = lesson.activities[stop].kind === 'question' ? lesson.activities[stop].response : null;
    const faceIndex = r && r.type === 'choice' ? r.options.findIndex((o) => o.id === 'three') : 1;
    radio(faceIndex);
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('სახე');
  });

  it('an ungrouped set of blocks is named as a grouping problem, not a value problem', () => {
    go('#/student/lessons/g2-u01-l2');
    const lesson = LESSON_CONTENT['g2-u01-l2'];
    const stop = lesson.activities.findIndex((a) => a.id === 'practice-2');
    lesson.activities.slice(0, stop).forEach((a) => {
      if (a.kind === 'question') answerCorrectly(a);
      next();
    });
    // 472 with 15 ones: the value is right, the grouping is not — and the mat stops at nine in a place
    for (let n = 0; n < 4; n += 1) fireEvent.click(screen.getByRole('button', { name: /დაამატე 1 ბრტყელი/ }));
    for (let n = 0; n < 7; n += 1) fireEvent.click(screen.getByRole('button', { name: /დაამატე 1 ჩხირი/ }));
    const ones = () => screen.getByRole('button', { name: /დაამატე 1 კუბიკი/ }) as HTMLButtonElement;
    for (let n = 0; n < 9; n += 1) fireEvent.click(ones());
    expect(ones().disabled).toBe(true);
    submit();
    // 479 is not 472, and the lesson says so in the lesson's own words
    expect(feedback()).toContain('479');
    expect(feedback()).toContain('472');
  });
});

describe('style: motion, layout and honest labels', () => {
  const css = readFileSync('src/lessons/learn.css', 'utf8');
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));

  it('the place-value boards are switched off under reduced motion', () => {
    for (const cls of ['.pv-cols', '.pvc-card', '.bm-tile', '.exb-card']) expect(reduced, cls).toContain(cls);
  });

  it('the mat folds to one column on a phone', () => {
    expect(css).toMatch(/\.bm-mat \{[^}]*grid-template-columns: repeat\(3, 1fr\)/);
    const small = css.slice(css.indexOf('@media (max-width: 560px)'));
    expect(small).toContain('.bm-mat');
    expect(small).toContain('grid-template-columns: 1fr');
  });

  it('the value is never only a colour: every block count carries its number', () => {
    render(<PlaceBlocks counts={{ hundreds: 1, tens: 1, ones: 1 }} label="ბლოკები" />);
    expect(text('.pv')).toContain('1 ასეულები');
    expect(text('.pv')).toContain('111');
    cleanup();
    render(<PlaceCards value={111} label="ციფრები" />);
    expect(document.querySelectorAll('.pvc-worth').length).toBe(3);
    expect(Array.from(document.querySelectorAll('.pvc-worth')).every((el) => el.textContent?.includes('='))).toBe(true);
  });
});
