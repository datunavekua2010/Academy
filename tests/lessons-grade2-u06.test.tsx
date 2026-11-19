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
  allSame,
  dealOut,
  divisionHolds,
  divisionKind,
  divisionText,
  factFamily,
  fairShare,
  familyAnswer,
  groupInto,
  groupText,
  groupsExactly,
  groupsMade,
  inverseText,
  isFairShare,
  oddOnesOut,
  quotientOf,
  relatedMultiplication,
  sameFamily,
  shareText,
  sharesExactly,
  totalOfCounts,
} from '../src/lessons/exercises/ShareGeometry';
import {
  DivisionSentenceAnswer,
  FactFamilyAnswer,
  GroupIntoAnswer,
  GroupingPicture,
  GroupsBoardShare,
  ShareBoard,
  ShareFairAnswer,
  ShareGroupsAnswer,
} from '../src/lessons/exercises/ShareBoard';
import { DivisionLab, FamilyLab, GroupIntoLab, ShareDemo, ShareGroupsLab, ShareLab } from '../src/lessons/exercises/ShareTools';
import type { Activity, Lesson, QuestionActivity, ResponseSpec } from '../src/lessons/types';

/**
 * Grade 2 · Unit 6: "Fair Sharing & Introduction to Division".
 *
 * Sharing and grouping are the same arithmetic asked two ways. "Fair" is never a judgement about a row of counters — it
 * is every recipient holding the same number with nothing left over, computed from `(total, people)`.
 */

const U06 = ['g2-u06-l1', 'g2-u06-l2', 'g2-u06-l3', 'g2-u06-l4', 'g2-u06-l5'];
const lessons = U06.map((id) => LESSON_CONTENT[id]);
const questions = (l: Lesson) => l.activities.filter((a): a is QuestionActivity => a.kind === 'question');
const stageOf = (l: Lesson, stage: string) => questions(l).filter((q) => q.stage === stage);
const text = (sel: string) => document.querySelector(sel)?.textContent ?? '';
const toolOf = (l: Lesson) => (l.activities.find((a) => a.kind === 'explore') as Extract<Activity, { kind: 'explore' }>).tool;

// ─────────────────────────── catalog ───────────────────────────

describe('catalog: Grade 2 U06 is the fair-sharing unit', () => {
  it('has the approved titles, ids and codes', () => {
    const unit = getUnit('g2-u06');
    expect(unit?.title).toBe('Fair Sharing & Introduction to Division');
    expect(unit?.grade).toBe(2);
    expect(unit?.lessons.map((l) => l.id)).toEqual(U06);
    expect(unit?.lessons.map((l) => l.code)).toEqual(['U06.1', 'U06.2', 'U06.3', 'U06.4', 'U06.5']);
    expect(unit?.lessons.map((l) => l.title)).toEqual([
      'Understanding Fair Sharing',
      'Sharing Objects into Equal Groups',
      'Understanding Division as Equal Sharing',
      'Dividing by Grouping',
      'Connecting Multiplication and Division',
    ]);
  });

  it('has content for every one of the five lessons', () => {
    for (const id of U06) {
      expect(LESSON_CONTENT[id], id).toBeTruthy();
      expect(LESSON_CONTENT[id].id).toBe(id);
      expect(LESSON_CONTENT[id].status).toBe('placeholder');
    }
  });
});

// ─────────────────────────── the engine ───────────────────────────

describe('share: fairness is a fact about the counts', () => {
  it('shares what it can and reports what is left', () => {
    expect(fairShare(12, 3)).toEqual({ share: 4, leftover: 0 });
    expect(fairShare(14, 4)).toEqual({ share: 3, leftover: 2 });
    expect(fairShare(5, 0)).toEqual({ share: 0, leftover: 5 });
    expect(sharesExactly(12, 3)).toBe(true);
    expect(sharesExactly(14, 4)).toBe(false);
    expect(sharesExactly(12, 0)).toBe(false);
  });

  it('deals one object at a time, always to the next recipient', () => {
    expect(dealOut(12, 3)).toEqual([4, 4, 4]);
    expect(dealOut(7, 3)).toEqual([3, 2, 2]);
    expect(dealOut(0, 2)).toEqual([0, 0]);
    expect(dealOut(4, 0)).toEqual([]);
  });

  it('names the recipients who differ, instead of only calling the share wrong', () => {
    expect(allSame([4, 4, 4])).toBe(true);
    expect(allSame([4, 4, 5])).toBe(false);
    expect(allSame([])).toBe(false);
    expect(oddOnesOut([4, 4, 5])).toEqual([2]);
    expect(oddOnesOut([3, 4, 5])).toEqual([1, 2]);
    expect(oddOnesOut([4, 4])).toEqual([]);
    expect(totalOfCounts([4, 4, 4])).toBe(12);
  });

  it('a fair share needs equal counts and nothing left over', () => {
    expect(isFairShare([4, 4, 4], 12)).toBe(true);
    expect(isFairShare([4, 4, 4], 11)).toBe(false);
    expect(isFairShare([4, 4, 5], 13)).toBe(false);
    expect(shareText(12, 3)).toContain('4');
    expect(shareText(14, 4)).toContain('2');
  });
});

describe('group: the other reading of division', () => {
  it('counts the complete groups and the leftover', () => {
    expect(groupInto(14, 4)).toEqual({ groups: 3, leftover: 2 });
    expect(groupInto(12, 4)).toEqual({ groups: 3, leftover: 0 });
    expect(groupInto(5, 0)).toEqual({ groups: 0, leftover: 5 });
    expect(groupsExactly(12, 4)).toBe(true);
    expect(groupsExactly(14, 4)).toBe(false);
    expect(groupText(14, 4)).toContain('3');
    expect(groupsMade(14, 4)).toHaveLength(3);
    expect(groupsMade(12, 4)).toHaveLength(3);
  });

  it('the leftover is always smaller than the group', () => {
    for (let total = 1; total <= 40; total += 1) {
      for (let size = 2; size <= 6; size += 1) expect(groupInto(total, size).leftover, `${total}/${size}`).toBeLessThan(size);
    }
  });
});

describe('division: the sentence and its check', () => {
  it('reads as a division fact only when it divides exactly', () => {
    expect(quotientOf(12, 3)).toBe(4);
    expect(quotientOf(14, 4)).toBeNull();
    expect(quotientOf(12, 0)).toBeNull();
    expect(divisionText(12, 3)).toBe('12 ÷ 3 = 4');
    expect(inverseText(12, 3)).toBe('3 × 4 = 12');
    expect(divisionHolds(12, 3, 4)).toBe(true);
    expect(divisionHolds(12, 3, 5)).toBe(false);
    expect(divisionHolds(12, 0, 5)).toBe(false);
  });

  it('names the two readings of the same arithmetic', () => {
    expect(divisionKind('share')).toContain('ტოლ წილებად');
    expect(divisionKind('group')).toContain('ვაჯგუფებთ');
  });
});

describe('family: one pair of factors, four facts', () => {
  it('writes all four sentences', () => {
    expect(factFamily(3, 4)).toEqual({ multiply: '3 × 4 = 12', commuted: '4 × 3 = 12', divideA: '12 ÷ 3 = 4', divideB: '12 ÷ 4 = 3', product: 12 });
    expect(familyAnswer(3, 4, 'a')).toBe(3);
    expect(familyAnswer(3, 4, 'b')).toBe(4);
    expect(familyAnswer(3, 4, 'product')).toBe(12);
    expect(relatedMultiplication(12, 3)).toEqual(['3 × 4 = 12', '4 × 3 = 12']);
    expect(relatedMultiplication(14, 4)).toEqual([]);
  });

  it('knows which division facts belong to a multiplication', () => {
    expect(sameFamily(3, 4, 12, 3)).toBe(true);
    expect(sameFamily(3, 4, 12, 4)).toBe(true);
    expect(sameFamily(3, 4, 12, 6)).toBe(false);
    expect(sameFamily(3, 4, 13, 3)).toBe(false);
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

describe('checking: a fair share', () => {
  const even = q({ type: 'share-fair', total: 12, people: 3 });
  const odd = q({ type: 'share-fair', total: 14, people: 4 });

  it('wants the share and the leftover, both', () => {
    expect(evaluateAnswer(even, '4,0').verdict).toBe('correct');
    expect(evaluateAnswer(even, '4,1').verdict).toBe('incorrect');
    expect(evaluateAnswer(even, '3,0').verdict).toBe('incorrect');
    expect(evaluateAnswer(even, '').verdict).toBe('incomplete');
    expect(evaluateAnswer(even, ',').verdict).toBe('incomplete');
  });

  it('a share that does not divide exactly still has a right answer', () => {
    expect(evaluateAnswer(odd, '3,2').verdict).toBe('correct');
    expect(evaluateAnswer(odd, '3,0').verdict).toBe('incorrect');
    expect(evaluateAnswer(odd, '4,0').verdict).toBe('incorrect');
  });

  it('counts what is still left over when the share is too small', () => {
    const wrong = evaluateAnswer(even, '3,0');
    expect(wrong.verdict).toBe('incorrect');
    expect(wrong.feedback).toContain('3');
    expect(wrong.feedback).toContain('12');
  });
});

describe('checking: equal groups', () => {
  const groups = q({ type: 'share-groups', total: 12, groups: 3 });

  it('wants every group to hold the same number, and all of them used', () => {
    expect(evaluateAnswer(groups, '4,4,4').verdict).toBe('correct');
    expect(evaluateAnswer(groups, '4,4,5').verdict).toBe('incorrect');
    expect(evaluateAnswer(groups, '3,3,3').verdict).toBe('incorrect');
    expect(evaluateAnswer(groups, '0,0,0').verdict).toBe('incomplete');
    expect(evaluateAnswer(groups, '4,4').verdict).toBe('incomplete');
  });

  it('names the group that differs instead of only saying wrong', () => {
    const wrong = evaluateAnswer(groups, '4,4,5');
    expect(wrong.feedback).toContain('3-ე ჯგუფში 5');
  });

  it('a share that leaves some behind says how many', () => {
    const wrong = evaluateAnswer(groups, '3,3,3');
    expect(wrong.feedback).toContain('3');
  });
});

describe('checking: dividing by grouping', () => {
  const into = q({ type: 'group-into', total: 14, size: 4 });

  it('wants the complete groups and the leftover', () => {
    expect(evaluateAnswer(into, '3,2').verdict).toBe('correct');
    expect(evaluateAnswer(into, '3,1').verdict).toBe('incorrect');
    expect(evaluateAnswer(into, '3,0').verdict).toBe('incorrect');
    expect(evaluateAnswer(into, '3,').verdict).toBe('incorrect');
    expect(evaluateAnswer(into, '').verdict).toBe('incomplete');
  });

  it('a wrong count is checked against the total it would make', () => {
    const wrong = evaluateAnswer(into, '4,1');
    expect(wrong.verdict).toBe('incorrect');
    expect(wrong.feedback).toContain('17');
  });
});

describe('checking: a division sentence', () => {
  const sentence = q({ type: 'division-sentence', total: 16, by: 4 });

  it('wants the total first and the divisor second', () => {
    expect(evaluateAnswer(sentence, '16,4').verdict).toBe('correct');
    expect(evaluateAnswer(sentence, '16,5').verdict).toBe('incorrect');
    expect(evaluateAnswer(sentence, '12,4').verdict).toBe('incorrect');
    expect(evaluateAnswer(sentence, '16,').verdict).toBe('incomplete');
    expect(evaluateAnswer(sentence, '').verdict).toBe('incomplete');
  });

  it('a wrong divisor is named as the divisor', () => {
    const wrong = evaluateAnswer(sentence, '16,5');
    expect(wrong.verdict).toBe('incorrect');
    expect(wrong.feedback).toContain('16 ÷ 4 = 4');
  });
});

describe('checking: one missing number of a family', () => {
  it('wants whichever number is missing', () => {
    expect(evaluateAnswer(q({ type: 'fact-family', a: 3, b: 4, missing: 'a' }), '3').verdict).toBe('correct');
    expect(evaluateAnswer(q({ type: 'fact-family', a: 3, b: 4, missing: 'b' }), '4').verdict).toBe('correct');
    expect(evaluateAnswer(q({ type: 'fact-family', a: 3, b: 4, missing: 'product' }), '12').verdict).toBe('correct');
    expect(evaluateAnswer(q({ type: 'fact-family', a: 3, b: 4, missing: 'a' }), '4').verdict).toBe('incorrect');
    expect(evaluateAnswer(q({ type: 'fact-family', a: 3, b: 4, missing: 'a' }), '').verdict).toBe('incomplete');
  });
});

describe('checking: the answers can be described', () => {
  it('writes the share, the groups, the grouping and the sentence', () => {
    expect(describeAnswer({ type: 'share-fair', total: 12, people: 3 })).toContain('4');
    expect(describeAnswer({ type: 'share-groups', total: 12, groups: 3 })).toContain('4');
    expect(describeAnswer({ type: 'group-into', total: 14, size: 4 })).toContain('3');
    expect(describeAnswer({ type: 'division-sentence', total: 16, by: 4 })).toBe('16 ÷ 4 = 4');
    expect(describeAnswer({ type: 'fact-family', a: 3, b: 4, missing: 'a' })).toBe('3');
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

  it('every lesson asks for a division answer of some kind', () => {
    const types = ['share-fair', 'share-groups', 'group-into', 'division-sentence', 'fact-family'];
    for (const l of lessons) {
      const asked = questions(l).map((x) => x.response.type);
      expect(asked.some((t) => types.includes(t) || t === 'numeric'), `${l.id}: ${asked.join(', ')}`).toBe(true);
    }
  });
});

/** The answer a question expects, computed from its own numbers. */
function correctAnswer(r: ResponseSpec): string {
  switch (r.type) {
    case 'choice':
      return r.answer;
    case 'numeric':
      return String(r.answer);
    case 'share-fair': {
      const { share, leftover } = fairShare(r.total, r.people);
      return `${share},${leftover}`;
    }
    case 'share-groups':
      return Array.from({ length: r.groups }, () => String(quotientOf(r.total, r.groups) ?? 0)).join(',');
    case 'group-into': {
      const { groups, leftover } = groupInto(r.total, r.size);
      return `${groups},${leftover}`;
    }
    case 'division-sentence':
      return `${r.total},${r.by}`;
    case 'fact-family':
      return String(familyAnswer(r.a, r.b, r.missing));
    case 'times-missing':
      return String(r.missing === 'factor' ? r.factor : r.table * r.factor);
    default:
      throw new Error(`no answer for ${r.type}`);
  }
}

describe('content: every question is answerable from its own numbers', () => {
  it('the engine agrees with the content, question by question', () => {
    for (const l of lessons)
      for (const x of questions(l)) {
        const verdict = evaluateAnswer(x, correctAnswer(x.response)).verdict;
        expect(verdict, `${l.id}/${x.id} (${x.response.type})`).toBe('correct');
      }
  });

  it('every fair-share question really does divide exactly, or names its leftover', () => {
    const shares = lessons.flatMap((l) => questions(l).filter((x) => x.response.type === 'share-fair').map((x) => ({ l, r: x.response as Extract<ResponseSpec, { type: 'share-fair' }> })));
    expect(shares.length).toBeGreaterThanOrEqual(3);
    for (const { l, r } of shares) {
      expect(r.people, l.id).toBeGreaterThan(1);
      expect(r.total, l.id).toBeGreaterThanOrEqual(r.people);
      const { share, leftover } = fairShare(r.total, r.people);
      expect(share * r.people + leftover, l.id).toBe(r.total);
    }
  });

  it('every equal-groups question divides exactly, and its counts add up', () => {
    const groups = lessons.flatMap((l) => questions(l).filter((x) => x.response.type === 'share-groups').map((x) => ({ l, r: x.response as Extract<ResponseSpec, { type: 'share-groups' }> })));
    expect(groups.length).toBeGreaterThan(2);
    for (const { l, r } of groups) {
      expect(sharesExactly(r.total, r.groups), `${l.id} ${r.total}/${r.groups}`).toBe(true);
    }
  });

  it('grouping questions have a leftover smaller than the group', () => {
    const items = lessons.flatMap((l) => questions(l).filter((x) => x.response.type === 'group-into').map((x) => ({ l, r: x.response as Extract<ResponseSpec, { type: 'group-into' }> })));
    expect(items.length).toBeGreaterThan(2);
    for (const { l, r } of items) {
      const { groups, leftover } = groupInto(r.total, r.size);
      expect(groups, l.id).toBeGreaterThanOrEqual(1);
      expect(leftover, l.id).toBeLessThan(r.size);
    }
  });

  it('division sentences have a whole quotient, and the family lesson really reverses them', () => {
    const sentences = lessons.flatMap((l) => questions(l).filter((x) => x.response.type === 'division-sentence').map((x) => x.response as Extract<ResponseSpec, { type: 'division-sentence' }>));
    expect(sentences.length).toBeGreaterThan(2);
    for (const r of sentences) expect(quotientOf(r.total, r.by)).not.toBeNull();

    const lab = toolOf(LESSON_CONTENT['g2-u06-l5']);
    expect(lab.tool).toBe('family-lab');
    if (lab.tool === 'family-lab') {
      const family = factFamily(lab.a, lab.b);
      expect(family.product).toBe(lab.a * lab.b);
      expect(divisionHolds(family.product, lab.a, lab.b)).toBe(true);
    }
  });

  it('the division-lesson explore tool is the one that writes the sentence', () => {
    expect(toolOf(LESSON_CONTENT['g2-u06-l3']).tool).toBe('division-lab');
    expect(toolOf(LESSON_CONTENT['g2-u06-l4']).tool).toBe('group-into-lab');
    expect(toolOf(LESSON_CONTENT['g2-u06-l1']).tool).toBe('share-lab');
    expect(toolOf(LESSON_CONTENT['g2-u06-l2']).tool).toBe('share-groups-lab');
  });
});

// ─────────────────────────── boards ───────────────────────────

describe('board: a fair share', () => {
  it('gives every child the same and writes the sentence', () => {
    render(<ShareBoard total={12} people={3} />);
    expect(document.querySelectorAll('.shbox')).toHaveLength(3);
    expect(document.querySelectorAll('.shbox-dot')).toHaveLength(12);
    expect(text('.shb-note')).toContain('12 ÷ 3 = 4');
    expect(screen.getByLabelText(shareText(12, 3))).toBeTruthy();
  });

  it('labels each child by number and by count', () => {
    render(<ShareBoard total={8} people={4} glyph="ball" />);
    expect(screen.getByLabelText('1-ე ბავშვს 2 ბურთი')).toBeTruthy();
    expect(document.querySelectorAll('.shbox.is-child')).toHaveLength(4);
  });

  it('containers of a fixed size multiply back to the total', () => {
    render(<GroupsBoardShare groups={3} size={4} />);
    expect(document.querySelectorAll('.shbox.is-basket')).toHaveLength(3);
    expect(text('.shb-note')).toBe('3 × 4 = 12');
  });

  it('a grouping picture states its leftover', () => {
    render(<GroupingPicture total={14} size={4} />);
    expect(document.querySelectorAll('.shbox.is-basket')).toHaveLength(3);
    expect(text('.shb-note')).toContain('ნაშთი 2');
    cleanup();
    render(<GroupingPicture total={12} size={4} />);
    expect(text('.shb-note')).toContain('ნაშთი არ არის');
  });
});

describe('board: answer controls', () => {
  it('sharing shows what is still in the pile and how many are unshared', () => {
    const onChange = vi.fn();
    render(<ShareFairAnswer response={{ total: 12, people: 3 }} value="" onChange={onChange} disabled={false} label="გაყოფა" />);
    expect(text('.shpile')).toContain('12');
    fireEvent.change(screen.getByLabelText('თითოეულს რამდენი'), { target: { value: '4' } });
    expect(onChange).toHaveBeenLastCalledWith('4,');
    cleanup();
    render(<ShareFairAnswer response={{ total: 12, people: 3 }} value="4,0" onChange={vi.fn()} disabled={false} label="გაყოფა" />);
    expect(text('.shpile')).toContain('ყველა საგანი დარიგებულია');
    expect(text('.shf-note')).toContain('3 × 4 = 12');
  });

  it('equal groups says when the counts are already fair, and when not', () => {
    render(<ShareGroupsAnswer response={{ total: 12, groups: 3 }} value="4,4,4" onChange={vi.fn()} disabled={false} label="ჯგუფები" />);
    expect(text('.shg-note')).toContain('✓');
    expect(text('.shg-note')).toContain('12 ÷ 3 = 4');
    cleanup();
    render(<ShareGroupsAnswer response={{ total: 12, groups: 3 }} value="4,4,3" onChange={vi.fn()} disabled={false} label="ჯგუფები" />);
    expect(text('.shg-note')).toContain('ჯერ არ არის თანაბრად');
  });

  it('the plus and minus buttons move one object into a group', () => {
    const onChange = vi.fn();
    render(<ShareGroupsAnswer response={{ total: 12, groups: 3 }} value="4,4,3" onChange={onChange} disabled={false} label="ჯგუფები" />);
    fireEvent.click(screen.getByLabelText('3-ე ჯგუფს დაამატე ერთი'));
    expect(onChange).toHaveBeenLastCalledWith('4,4,4');
    fireEvent.click(screen.getByLabelText('1-ე ჯგუფიდან წაიღე ერთი'));
    expect(onChange).toHaveBeenLastCalledWith('3,4,3');
  });

  it('grouping asks for the complete boxes and the leftover', () => {
    const onChange = vi.fn();
    render(<GroupIntoAnswer response={{ total: 14, size: 4 }} value="" onChange={onChange} disabled={false} label="ყუთები" />);
    fireEvent.change(screen.getByLabelText('სრული ჯგუფების რაოდენობა'), { target: { value: '3' } });
    expect(onChange).toHaveBeenLastCalledWith('3,');
    cleanup();
    render(<GroupIntoAnswer response={{ total: 14, size: 4 }} value="3,2" onChange={vi.fn()} disabled={false} label="ყუთები" />);
    expect(text('.shgi-note')).toContain('4 × 3 = 12');
    expect(text('.shgi-note')).toContain('2');
  });

  it('the division sentence computes its own quotient and checks it', () => {
    const onChange = vi.fn();
    render(<DivisionSentenceAnswer response={{ total: 16, by: 4 }} value="" onChange={onChange} disabled={false} label="წინადადება" />);
    expect(text('.shd-quotient')).toBe('?');
    fireEvent.change(screen.getByLabelText('საერთო რაოდენობა'), { target: { value: '16' } });
    expect(onChange).toHaveBeenLastCalledWith('16,');
    cleanup();
    render(<DivisionSentenceAnswer response={{ total: 16, by: 4 }} value="16,4" onChange={vi.fn()} disabled={false} label="წინადადება" />);
    expect(text('.shd-quotient')).toBe('4');
    expect(text('.shd-note')).toContain('16 ÷ 4 = 4');
    expect(text('.shd-note')).toContain('4 × 4 = 16');
  });

  it('a family shows the missing number in both sentences', () => {
    render(<FactFamilyAnswer response={{ a: 3, b: 4, missing: 'a' }} value="" onChange={vi.fn()} disabled={false} label="ოჯახი" />);
    expect(Array.from(document.querySelectorAll('.shfam-line')).map((n) => n.textContent)).toEqual(['▢ × 4 = 12', '12 ÷ ▢ = 4']);
    expect(text('.shfam-note')).toContain('3 × 4 = 12');
  });
});

// ─────────────────────────── tools ───────────────────────────

describe('tools: the share lab', () => {
  it('deals one object at a time until everyone has the same', () => {
    render(<ShareLab tool={{ tool: 'share-lab', total: 12, people: 3 }} />);
    expect(text('.lab-status')).toContain('დარჩა 12');
    expect(text('.lab-status')).not.toContain('✓');
    fireEvent.click(screen.getByRole('button', { name: 'დარიგე ყველა' }));
    expect(text('.lab-status')).toContain('✓');
    expect(document.querySelectorAll('.shbox')).toHaveLength(3);
    expect(document.querySelectorAll('.shbox-dot')).toHaveLength(12);
  });

  it('one object can be added, and the deal can start again', () => {
    render(<ShareLab tool={{ tool: 'share-lab', total: 6, people: 3 }} />);
    fireEvent.click(screen.getByRole('button', { name: '+ ერთი საგანი' }));
    expect(text('.lab-facts')).toContain('დარიგებულია: 1');
    fireEvent.click(screen.getByRole('button', { name: '↻ თავიდან' }));
    expect(text('.lab-facts')).toContain('დარიგებულია: 0');
  });
});

describe('tools: the equal-groups lab', () => {
  it('starts empty, can be levelled, and then reports the division', () => {
    render(<ShareGroupsLab tool={{ tool: 'share-groups-lab', total: 12, groups: 3 }} />);
    expect(text('.lab-status')).toContain('დარჩა 12');
    fireEvent.click(screen.getByRole('button', { name: 'გაათანაბრე' }));
    expect(text('.lab-status')).toContain('✓');
    expect(text('.lab-status')).toContain('12 ÷ 3 = 4');
    expect(document.querySelectorAll('.shbox.is-fair')).toHaveLength(3);
  });

  it('objects can be moved one by one', () => {
    render(<ShareGroupsLab tool={{ tool: 'share-groups-lab', total: 4, groups: 2 }} />);
    fireEvent.click(screen.getByLabelText('1-ე ჯგუფს დაამატე ერთი'));
    expect(text('.lab-status')).toContain('1, 0');
    fireEvent.click(screen.getByLabelText('2-ე ჯგუფს დაამატე ერთი'));
    fireEvent.click(screen.getByLabelText('1-ე ჯგუფს დაამატე ერთი'));
    fireEvent.click(screen.getByLabelText('2-ე ჯგუფს დაამატე ერთი'));
    expect(text('.lab-status')).toContain('✓');
  });
});

describe('tools: the division lab', () => {
  it('writes the sentence only once everything has been shared', () => {
    render(<DivisionLab tool={{ tool: 'division-lab', total: 12, people: 4 }} />);
    expect(text('.shd-live')).toContain('?');
    expect(text('.lab-status')).toContain('დარიგებულია 0');
    fireEvent.click(screen.getByRole('button', { name: 'დარიგე ყველა' }));
    expect(text('.shd-live')).toContain('12');
    expect(text('.lab-status')).toContain('12 ÷ 4 = 3');
    expect(text('.lab-facts')).toContain('თითოეულს: 3');
  });

  it('counts one at a time, and the quotient waits for a full round', () => {
    render(<DivisionLab tool={{ tool: 'division-lab', total: 8, people: 2 }} />);
    fireEvent.click(screen.getByRole('button', { name: '+ ერთი' }));
    expect(text('.shd-live')).toContain('?');
    fireEvent.click(screen.getByRole('button', { name: '+ ერთი' }));
    expect(text('.shd-live')).toContain('1');
  });
});

describe('tools: the grouping lab', () => {
  it('counts complete groups and keeps the leftover apart', () => {
    render(<GroupIntoLab tool={{ tool: 'group-into-lab', total: 10, size: 4 }} />);
    for (let i = 0; i < 6; i += 1) fireEvent.click(screen.getByRole('button', { name: '+ ერთი საგანი' }));
    expect(text('.lab-status')).toContain('1 სრული ჯგუფი, ნაშთი 2');
    expect(document.querySelectorAll('.shbox.is-open')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'ყველა' }));
    expect(text('.lab-status')).toContain('2 სრული ჯგუფი, ნაშთი 2');
  });

  it('going back to the start empties the boxes', () => {
    render(<GroupIntoLab tool={{ tool: 'group-into-lab', total: 8, size: 4 }} />);
    fireEvent.click(screen.getByRole('button', { name: 'ყველა' }));
    expect(document.querySelectorAll('.shbox.is-basket')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: '↻ თავიდან' }));
    expect(document.querySelectorAll('.shbox.is-basket')).toHaveLength(0);
    expect(text('.lab-status')).toContain('0 სრული ჯგუფი');
  });
});

describe('tools: the family lab', () => {
  it('turns the same groups round into a division', () => {
    render(<FamilyLab tool={{ tool: 'family-lab', a: 3, b: 4 }} />);
    expect(text('.lab-status')).toContain('3 × 4 = 12');
    expect(document.querySelectorAll('.shbox.is-basket')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'გაყოფა' }));
    expect(text('.lab-status')).toContain('12 საგანი 3 ჯგუფად');
    expect(document.querySelectorAll('.shbox.is-child')).toHaveLength(3);
  });

  it('lists all four facts of the family', () => {
    render(<FamilyLab tool={{ tool: 'family-lab', a: 4, b: 5 }} />);
    expect(Array.from(document.querySelectorAll('.shfam-line')).map((n) => n.textContent)).toEqual(['4 × 5 = 20', '20 ÷ 4 = 5', '5 × 4 = 20', '20 ÷ 5 = 4']);
  });
});

describe('tools: the demonstrations', () => {
  it('a share demo deals objects out one at a time', () => {
    render(<ShareDemo block={{ type: 'share-demo', mode: 'share', total: 6, people: 3, steps: ['ა', 'ბ', 'გ', 'დ', 'ე', 'ვ'] }} />);
    expect(text('.demo-badge')).toContain('თანაბრად');
    expect(text('.demo-rule')).toContain('1 ÷ 3');
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(text('.demo-rule')).toContain('3 ÷ 3 = 1');
  });

  it('a grouping demo keeps only complete groups', () => {
    render(<ShareDemo block={{ type: 'share-demo', mode: 'group', total: 9, people: 4, steps: ['ა', 'ბ', 'გ'] }} />);
    expect(text('.demo-badge')).toContain('ვაჯგუფებ 4-ად');
    fireEvent.click(screen.getByRole('button', { name: '↻ ხელახლა' }));
    expect(text('.demo-rule')).toContain('1 საგანი 4-ად: 0 ჯგუფი, ნაშთი 1');
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
    case 'share-fair': {
      const { share, leftover } = fairShare(r.total, r.people);
      fireEvent.change(screen.getByLabelText('თითოეულს რამდენი'), { target: { value: String(share) } });
      fireEvent.change(screen.getByLabelText('დარჩენილი რაოდენობა'), { target: { value: String(leftover) } });
      break;
    }
    case 'share-groups': {
      const each = quotientOf(r.total, r.groups) ?? 0;
      for (let i = 0; i < r.groups; i += 1) {
        for (let k = 0; k < each; k += 1) fireEvent.click(screen.getByLabelText(`${i + 1}-ე ჯგუფს დაამატე ერთი`));
      }
      break;
    }
    case 'group-into': {
      const { groups, leftover } = groupInto(r.total, r.size);
      fireEvent.change(screen.getByLabelText('სრული ჯგუფების რაოდენობა'), { target: { value: String(groups) } });
      fireEvent.change(screen.getByLabelText('ნაშთი'), { target: { value: String(leftover) } });
      break;
    }
    case 'division-sentence':
      fireEvent.change(screen.getByLabelText('საერთო რაოდენობა'), { target: { value: String(r.total) } });
      fireEvent.change(screen.getByLabelText('ჯგუფების რაოდენობა'), { target: { value: String(r.by) } });
      break;
    case 'fact-family':
      fireEvent.change(screen.getByLabelText('გამოტოვებული რიცხვი'), { target: { value: String(familyAnswer(r.a, r.b, r.missing)) } });
      break;
    case 'times-missing':
      fireEvent.change(screen.getByLabelText('გამოტოვებული რიცხვი'), { target: { value: String(r.missing === 'factor' ? r.factor : r.table * r.factor) } });
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

describe('g2-u06 unit page', () => {
  it('lists the five lessons, all playable and in order', () => {
    go('#/student/lessons/g2-u06');
    const list = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(list).toHaveLength(5);
    U06.forEach((id, i) => expect(within(list[i]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe(`#/student/lessons/${id}`));
  });
});

describe.each(U06.map((id) => [id] as const))('%s plays to the end', (id) => {
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
      expect(screen.getByRole('link', { name: `გაგრძელება: U06.${n + 1}` }).getAttribute('href')).toBe(`#/student/lessons/g2-u06-l${n + 1}`);
    } else {
      expect(screen.getByRole('link', { name: 'U06-ზე დაბრუნება' })).toBeTruthy();
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

  it('groups that are not equal are told which group differs', () => {
    upTo('g2-u06-l2', 'check-2');
    for (let i = 0; i < 3; i += 1) fireEvent.click(screen.getByLabelText('1-ე ჯგუფს დაამატე ერთი'));
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('2-ე ჯგუფში 0');
  });

  it('a share that leaves objects behind says how many are left', () => {
    upTo('g2-u06-l1', 'practice-1');
    fireEvent.change(screen.getByLabelText('თითოეულს რამდენი'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('დარჩენილი რაოდენობა'), { target: { value: '0' } });
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('3');
  });

  it('a wrong divisor in a division sentence is named as the divisor', () => {
    upTo('g2-u06-l3', 'check-2');
    fireEvent.change(screen.getByLabelText('საერთო რაოდენობა'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('ჯგუფების რაოდენობა'), { target: { value: '6' } });
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('5');
  });

  it('a grouping whose counts do not add up is checked against the total', () => {
    upTo('g2-u06-l4', 'check-2');
    fireEvent.change(screen.getByLabelText('სრული ჯგუფების რაოდენობა'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('ნაშთი'), { target: { value: '3' } });
    submit();
    expect(feedback()).not.toContain('სწორია');
    expect(feedback()).toContain('17');
  });
});

describe('style: motion, layout and honest labels', () => {
  const css = readFileSync('src/lessons/learn.css', 'utf8');
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));

  it('the new boards are switched off under reduced motion', () => {
    for (const cls of ['.shbox', '.shbox-dot']) expect(reduced, cls).toContain(cls);
  });

  it('the rows and the inputs get narrower on a phone', () => {
    const small = css.slice(css.lastIndexOf('@media (max-width: 560px)'));
    expect(small).toContain('.shb-row');
    expect(small).toContain('.shf-field input');
  });

  it('every child is labelled by number and by count, never only by position', () => {
    render(<ShareBoard total={6} people={3} />);
    expect(Array.from(document.querySelectorAll('.shbox')).map((b) => b.getAttribute('aria-label'))).toEqual(['1-ე ბავშვს 2 ვაშლი', '2-ე ბავშვს 2 ვაშლი', '3-ე ბავშვს 2 ვაშლი']);
  });
});
