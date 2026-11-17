import { describe, expect, it } from 'vitest';
import { LESSON_CATALOG } from '../src/lessons/catalogData';
import { allLessonEntries, allUnits, getLessonEntry, getUnit, nextLessonInUnit } from '../src/lessons/catalog';
import { LESSON_CONTENT } from '../src/lessons/content';
import { evaluateAnswer } from '../src/lessons/check';
import { initialAttempt, showNextHint, submitAnswer, clearFeedback } from '../src/lessons/attempt';
import { parseLessonsRoute } from '../src/lessons/routes';
import type { AnswerInput, Question, ResponseSpec } from '../src/lessons/types';

describe('lesson catalog (approved hierarchy)', () => {
  it('has 7 grades, 110 units and 550 lessons, five lessons per unit', () => {
    expect(LESSON_CATALOG.map((g) => g.grade)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(allUnits()).toHaveLength(110);
    expect(allLessonEntries()).toHaveLength(550);
    for (const unit of allUnits()) expect(unit.lessons).toHaveLength(5);
  });

  it('matches the approved unit counts per grade', () => {
    const counts = Object.fromEntries(LESSON_CATALOG.map((g) => [g.grade, g.topics.reduce((n, t) => n + t.units.length, 0)]));
    expect(counts).toEqual({ 1: 10, 2: 12, 3: 14, 4: 17, 5: 19, 6: 20, 7: 18 });
  });

  it('keeps ids unique across grades even though unit numbers restart', () => {
    const ids = allLessonEntries().map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(getLessonEntry('g6-u10-l3')?.code).toBe('U10.3');
    expect(getLessonEntry('g7-u10-l3')?.grade).toBe(7);
  });

  it('has the approved titles for the demo lesson', () => {
    const entry = getLessonEntry('g6-u10-l3');
    expect(entry?.title).toBe('Combining Like Terms Using Addition');
    expect(entry?.unitTitle).toBe('Combining Like Terms');
    expect(entry?.topicNumber).toBe(8);
    expect(entry?.topicTitle).toBe('Algebraic Expressions');
    expect(getUnit('g6-u10')?.lessons.map((l) => l.number)).toEqual([1, 2, 3, 4, 5]);
    expect(nextLessonInUnit('g6-u10-l3')?.title).toBe('Combining Like Terms Using Subtraction');
    expect(nextLessonInUnit('g6-u10-l5')).toBeUndefined();
  });

  it('numbers units 1..n within each grade, in order', () => {
    for (const g of LESSON_CATALOG) {
      const nums = g.topics.flatMap((t) => t.units.map((u) => u.number));
      expect(nums).toEqual(nums.map((_, i) => i + 1));
    }
  });
});

describe('lesson content registry', () => {
  it('only attaches content to lessons that exist in the catalog', () => {
    for (const [id, lesson] of Object.entries(LESSON_CONTENT)) {
      expect(lesson.id).toBe(id);
      expect(getLessonEntry(id)).toBeTruthy();
    }
  });

  it('does not mass-produce lessons: only the one demo lesson, marked placeholder', () => {
    expect(Object.keys(LESSON_CONTENT)).toEqual(['g6-u10-l3']);
    expect(LESSON_CONTENT['g6-u10-l3'].status).toBe('placeholder');
  });
});

describe('route parsing', () => {
  it('maps sub-paths of "lessons"', () => {
    expect(parseLessonsRoute('')).toEqual({ page: 'library' });
    expect(parseLessonsRoute('g6-u10')).toEqual({ page: 'unit', unitId: 'g6-u10' });
    expect(parseLessonsRoute('g6-u10-l3/')).toEqual({ page: 'lesson', lessonId: 'g6-u10-l3' });
    expect(parseLessonsRoute('g9-u10')).toEqual({ page: 'unknown' });
    expect(parseLessonsRoute('g6-u10-l6')).toEqual({ page: 'unknown' });
  });
});

function correctInput(response: ResponseSpec): AnswerInput {
  switch (response.type) {
    case 'choice':
      return response.answer;
    case 'numeric':
      return String(response.answer);
    case 'expression':
      return response.answer;
    case 'blanks':
      return response.answers.map(String);
  }
}

const q = (response: ResponseSpec, extra: Partial<Question> = {}): Question => ({ response, hints: ['h1', 'h2'], explanation: 'e', ...extra });

describe('answer checking', () => {
  const expr = q({ type: 'expression', answer: '5x' }, {
    misconceptions: [{ id: 'sq', answers: ['5x^2'], feedback: 'same variable' }],
    fallbackFeedback: 'fallback',
  });

  it('accepts equivalent spellings of an expression', () => {
    for (const ok of ['5x', '5 x', 'x*5', '5·x', '+5x']) expect(evaluateAnswer(expr, ok).verdict).toBe('correct');
  });

  it('gives the same-variable explanation for 5x² however it is typed', () => {
    for (const wrong of ['5x²', '5x^2', '5 x ^ 2', '5*x*x']) {
      const r = evaluateAnswer(expr, wrong);
      expect(r.verdict).toBe('incorrect');
      expect(r.misconceptionId).toBe('sq');
      expect(r.feedback).toBe('same variable');
    }
  });

  it('falls back when no misconception matches', () => {
    expect(evaluateAnswer(expr, '7x')).toMatchObject({ verdict: 'incorrect', feedback: 'fallback' });
  });

  it('does not accept a value that is right but unsimplified', () => {
    for (const text of ['3x+2x', '(3+2)x', '2x + 3x']) {
      const r = evaluateAnswer(expr, text);
      expect(r.verdict).toBe('incorrect');
      expect(r.notSimplified).toBe(true);
    }
  });

  it('treats empty or unreadable input as incomplete (no attempt used)', () => {
    for (const text of ['', '   ', '5x+', '((', '$$']) expect(evaluateAnswer(expr, text).verdict).toBe('incomplete');
    expect(evaluateAnswer(q({ type: 'numeric', answer: 5 }), 'abc').verdict).toBe('incomplete');
    expect(evaluateAnswer(q({ type: 'choice', options: [], answer: 'a' }), '').verdict).toBe('incomplete');
    expect(evaluateAnswer(q({ type: 'blanks', template: '{1}', answers: [5] }), ['']).verdict).toBe('incomplete');
  });

  it('checks numbers (comma decimals, unicode minus) and blanks', () => {
    expect(evaluateAnswer(q({ type: 'numeric', answer: 2.5 }), '2,5').verdict).toBe('correct');
    expect(evaluateAnswer(q({ type: 'numeric', answer: -4 }), '−4').verdict).toBe('correct');
    const numeric = q({ type: 'numeric', answer: 5 }, { misconceptions: [{ id: 'six', answers: [6], feedback: 'f6' }] });
    expect(evaluateAnswer(numeric, '6').misconceptionId).toBe('six');
    const blanks = q({ type: 'blanks', template: '{1} + {2}', answers: [2, 3] }, { misconceptions: [{ id: 'swap', answers: ['3,2'], feedback: 'swapped' }] });
    expect(evaluateAnswer(blanks, ['2', '3']).verdict).toBe('correct');
    expect(evaluateAnswer(blanks, ['3', '2']).misconceptionId).toBe('swap');
  });

  it('keeps expression algebra honest', () => {
    const e = (answer: string, input: string) => evaluateAnswer(q({ type: 'expression', answer }), input).verdict;
    expect(e('10m', '10m')).toBe('correct');
    expect(e('10m', '9m')).toBe('incorrect');
    expect(e('x^2', 'x*x')).toBe('correct');
    expect(e('x^2', '2x')).toBe('incorrect');
    expect(e('2x+3', '3+2x')).toBe('correct');
    expect(e('x-3', 'x−3')).toBe('correct');
  });
});

describe('attempt state machine', () => {
  const question = q({ type: 'numeric', answer: 5 }, { hints: ['one', 'two'] });

  it('allows retries, then closes the question and never hands out a free pass', () => {
    let s = initialAttempt();
    s = submitAnswer(s, question, 'practice', '');
    expect(s.attempts).toBe(0);
    s = submitAnswer(s, question, 'practice', '4');
    expect(s).toMatchObject({ status: 'answering', attempts: 1 });
    s = clearFeedback(s);
    s = submitAnswer(s, question, 'practice', '3');
    s = submitAnswer(s, question, 'practice', '2');
    expect(s.status).toBe('exhausted');
    expect(submitAnswer(s, question, 'practice', '5').status).toBe('exhausted');
  });

  it('counts first-try only without hints', () => {
    expect(submitAnswer(initialAttempt(), question, 'check', '5')).toMatchObject({ status: 'correct', firstTry: true });
    const hinted = showNextHint(initialAttempt(), question);
    expect(submitAnswer(hinted, question, 'check', '5').firstTry).toBe(false);
    expect(submitAnswer(submitAnswer(initialAttempt(), question, 'check', '4'), question, 'check', '5').firstTry).toBe(false);
  });

  it('serves hints one at a time and stops at the last', () => {
    let s = initialAttempt();
    s = showNextHint(s, question);
    s = showNextHint(s, question);
    s = showNextHint(s, question);
    expect(s.hintsShown).toBe(2);
  });

  it('independent-check questions allow two attempts', () => {
    let s = initialAttempt();
    s = submitAnswer(s, question, 'check', '1');
    s = submitAnswer(clearFeedback(s), question, 'check', '2');
    expect(s.status).toBe('exhausted');
  });
});

describe('demo lesson data integrity', () => {
  const lesson = LESSON_CONTENT['g6-u10-l3'];
  const questions = lesson.activities.filter((a) => a.kind === 'question' || a.kind === 'tiles');

  it('follows the five-stage flow', () => {
    expect([...new Set(lesson.activities.map((a) => a.stage))]).toEqual(['challenge', 'explore', 'understand', 'practice', 'check']);
    expect(lesson.activities[1].kind).toBe('tiles');
    expect(lesson.activities.filter((a) => a.stage === 'check').length).toBeGreaterThanOrEqual(3);
  });

  it('has unique activity ids and at least one hint on every guided question', () => {
    const ids = lesson.activities.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of questions) if (a.stage === 'practice' || a.stage === 'check' || a.stage === 'challenge') expect(a.hints.length).toBeGreaterThan(0);
  });

  it('accepts the stored answer of every question', () => {
    for (const a of questions) expect(evaluateAnswer(a, correctInput(a.response)).verdict).toBe('correct');
  });

  it('routes every stored misconception answer to its own feedback — and never to "correct"', () => {
    for (const a of questions) {
      for (const m of a.misconceptions ?? []) {
        for (const wrong of m.answers) {
          const input: AnswerInput = a.response.type === 'blanks' ? String(wrong).split(',') : String(wrong);
          const r = evaluateAnswer(a, input);
          expect(r.verdict, `${a.id}:${wrong}`).toBe('incorrect');
          expect(r.misconceptionId, `${a.id}:${wrong}`).toBe(m.id);
        }
      }
    }
  });

  it('never leaks the answer in hints or intro lines', () => {
    for (const a of questions) {
      if (a.response.type !== 'expression') continue;
      const answer = a.response.answer.replace(/\s/g, '');
      for (const hint of a.hints) expect(hint.replace(/[\s$]/g, '')).not.toContain(answer);
      expect((a.mascot?.intro ?? '').replace(/[\s$]/g, '')).not.toContain(answer);
    }
  });

  it('has an accurate worked-out maths core', () => {
    const answers = Object.fromEntries(questions.map((a) => [a.id, a.response.type === 'expression' ? a.response.answer : a.response.type === 'numeric' ? a.response.answer : undefined]));
    expect(answers['challenge']).toBe('5x');
    expect(answers['explore-tiles']).toBe(5);
    expect(answers['practice-1']).toBe('8y');
    expect(answers['practice-3']).toBe('10m');
    expect(answers['check-1']).toBe('13k');
    expect(answers['check-3']).toBe('10n');
  });

  it('has at least one conceptual check question', () => {
    const conceptual = lesson.activities.find((a) => a.id === 'check-2');
    expect(conceptual?.kind === 'question' && conceptual.response.type).toBe('choice');
  });
});
