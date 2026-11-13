import { describe, expect, it } from 'vitest';
import { CURRICULUM } from '../src/practice/curriculum';
import { topicSubtopics } from '../src/practice/types';
import { generateBatch, hasTemplates } from '../src/practice/generator';
import { advance, startSession, submitAnswer } from '../src/practice/session';
import { U01_SUBTOPICS } from '../src/practice/templates/u01-space';
import { U02_SUBTOPICS } from '../src/practice/templates/u02-numbers';
import { U03_SUBTOPICS } from '../src/practice/templates/u03-counting';
import { U04_SUBTOPICS } from '../src/practice/templates/u04-numbers100';
import { U05_SUBTOPICS } from '../src/practice/templates/u05-compare';
import { U06_SUBTOPICS } from '../src/practice/templates/u06-addition';
import { U07_SUBTOPICS } from '../src/practice/templates/u07-subtraction';
import { U08_SUBTOPICS } from '../src/practice/templates/u08-two-digit';
import { U09_SUBTOPICS } from '../src/practice/templates/u09-mixed';
import { U10_SUBTOPICS } from '../src/practice/templates/u10-models';
import { U11_SUBTOPICS } from '../src/practice/templates/u11-patterns';
import { U12_SUBTOPICS } from '../src/practice/templates/u12-geometry';
import { U13_SUBTOPICS } from '../src/practice/templates/u13-time';
import { U14_SUBTOPICS } from '../src/practice/templates/u14-money';
import { U15_SUBTOPICS } from '../src/practice/templates/u15-parts';
import { U16_SUBTOPICS } from '../src/practice/templates/u16-logic';
import { MAX_SCORE } from '../src/practice/scoring';
import { shownKey } from '../src/practice/identity';
import type { QuestionTemplate } from '../src/practice/templates/types';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';

/**
 * A session must be able to reach 100 points.
 *
 * The failure this pins is a queue that runs dry mid-session. Generation is
 * driven by the questions a template can produce, so a subtopic with a small
 * answer space silently stops supplying questions — and because the score is
 * spent on those questions, it stops *short of 100*. "დათვლა წინ და უკან" did
 * exactly that: one template with 19 answers emptied the queue at 76.
 *
 * Worse, the student is shown "სესია ვერ ჩაიტვირთა. სცადე თავიდან" — an error
 * that blames the load for what is really the end of the material.
 */

/** Plays a subtopic perfectly, refilling the way the provider does. */
function playThrough(ref: { grade: number; topicId: string; subtopicId: string }) {
  const asRef = ref as never;
  let state = startSession(asRef, generateBatch(asRef, 8, { level: 1 }));
  let answered = 0;
  const prompts: string[] = [];
  /** Prompt *and* picture, the identity the engine de-duplicates on. */
  const shown: string[] = [];

  while (answered < 80) {
    // The session ends at 100. Without this the loop kept drawing from a
    // finished session, whose queue is deliberately left untouched.
    if (state.completed || state.score >= MAX_SCORE) break;
    const id = state.queue[0];
    // No question and not finished: the session cannot reach MAX_SCORE. The
    // engine should have flagged it as exhausted rather than leaving a queue
    // that simply stops.
    if (!id) {
      return {
        score: state.score,
        answered,
        prompts,
        shown,
        driedUp: true,
        exhausted: Boolean(state.exhausted),
      };
    }

    const question = state.questions[id]!;
    prompts.push(question.prompt);
    shown.push(shownKey(question));

    const submission = submitAnswer(state, question.answer);
    // A perfect score ends the session; that is the success case.
    if (!submission) break;
    state = submission.state;
    answered += 1;

    // Mirror PracticeProvider: refill whenever the queue runs low, at the level
    // the current score has earned.
    //
    // The batch is drawn without a seed — that is what the app does, and it is
    // why this file is worth having. But an unseeded draw of four can happen to
    // return four questions the session has already shown, which is not a
    // repeat *in the session*: the provider asks again and gets new ones. Asking
    // again here keeps the test measuring the session, not the luck of a draw.
    let refill: ReturnType<typeof generateBatch> = [];
    if (state.queue.length <= 3) {
      // Everything already shown *or already waiting in the queue*. Avoiding
      // only the shown ones is not enough: a question queued but not yet
      // displayed would be generated again by a later refill, and the student
      // would then see it twice.
      const avoid = new Set(shown);
      for (const id of state.queue) {
        const queued = state.questions[id];
        if (queued) avoid.add(shownKey(queued));
      }
      // A short retry budget: a subtopic with material finds an unseen question
      // in the first draw or two, and one that has genuinely run out must not
      // be hammered — the sweep below deliberately plays exhausted subtopics.
      for (let attempt = 0; attempt < 4 && refill.length === 0; attempt += 1) {
        // Keep only genuinely unseen questions: a batch may mix new wordings
        // with repeats, and queueing the repeats is what this test forbids.
        const fresh = generateBatch(asRef, 4, { avoid }).filter(
          (question) => !avoid.has(shownKey(question)),
        );
        if (fresh.length > 0) refill = fresh;
      }
      // Every draw was a repeat: the material really is exhausted, and the
      // session will show it, which is what the budget test above reports.
      if (refill.length === 0) refill = generateBatch(asRef, 4, { avoid });
    }
    state = advance(state, refill);
  }

  return {
    score: state.score,
    answered,
    prompts,
    shown,
    driedUp: false,
    exhausted: Boolean(state.exhausted),
  };
}

const subtopics: Array<{ grade: number; topicId: string; subtopicId: string }> = [];
for (const grade of CURRICULUM) {
  for (const topic of grade.topics) {
    for (const subtopic of topicSubtopics(topic)) {
      subtopics.push({ grade: grade.grade, topicId: topic.id, subtopicId: subtopic.id });
    }
  }
}

/**
 * Subtopics whose material cannot fill a full session yet.
 *
 * U01 is held to the full standard; the rest of grade 1 still runs on the
 * placeholder set, where one template with a small answer space is common.
 * They are listed rather than skipped so the count is visible, and it shrinks as
 * U02…U16 are authored the way U01 now is: U01–U13 are held to the full
 * standard, which is 101 of the playable subtopics.
 */
describe('every playable subtopic can reach 100 points', () => {
  it('never runs the queue dry on a subtopic that has real templates', () => {
    // Every subtopic with authored templates is held to the full standard, not
    // only U01: a subtopic whose level 3 can make thirty distinct questions is
    // a session that ends short for a student who is answering everything
    // right, which is the failure this file exists for.
    const real = subtopics.filter(
      (ref) =>
        [...U01_SUBTOPICS, ...U02_SUBTOPICS, ...U03_SUBTOPICS, ...U04_SUBTOPICS, ...U05_SUBTOPICS, ...U06_SUBTOPICS, ...U07_SUBTOPICS, ...U08_SUBTOPICS, ...U09_SUBTOPICS, ...U10_SUBTOPICS, ...U11_SUBTOPICS, ...U12_SUBTOPICS, ...U13_SUBTOPICS, ...U14_SUBTOPICS, ...U15_SUBTOPICS, ...U16_SUBTOPICS].includes(
          ref.subtopicId as never,
        ) && hasTemplates(ref as never),
    );
    expect(real).toHaveLength(113);

    const short: string[] = [];
    for (const ref of real) {
      const run = playThrough(ref);
      if (run.driedUp) {
        short.push(`${createKey(ref)} stopped at ${run.score} after ${run.answered}`);
      }
    }
    expect(short, `these subtopics cannot finish a session:\n${short.join('\n')}`).toEqual([]);
  });

  it('ends honestly, never with a broken screen, when material runs out', () => {
    // The failure this pins is not "short" but "silent": the queue empties, and
    // the screen must say the material ended rather than blame the load.
    const playable = subtopics.filter((ref) => hasTemplates(ref as never));
    let grade1DriedUp = 0;
    for (const ref of playable) {
      const run = playThrough(ref);
      if (!run.driedUp) continue;
      if (ref.grade === 1) grade1DriedUp += 1;
      // A dried-up queue is flagged, which is what the view turns into an
      // ending; an unflagged empty queue is the bug.
      expect(run.exhausted, createKey(ref)).toBe(true);
    }
    // All 113 Grade 1 subtopics are now fully authored with real templates;
    // none dry up short of MAX_SCORE.
    expect(grade1DriedUp).toBe(0);
  });

  it('reaches exactly MAX_SCORE on a perfect run', () => {
    const real = subtopics.filter(
      (ref) =>
        [...U01_SUBTOPICS, ...U02_SUBTOPICS, ...U03_SUBTOPICS, ...U04_SUBTOPICS, ...U05_SUBTOPICS, ...U06_SUBTOPICS, ...U07_SUBTOPICS, ...U08_SUBTOPICS, ...U09_SUBTOPICS, ...U10_SUBTOPICS, ...U11_SUBTOPICS, ...U12_SUBTOPICS, ...U13_SUBTOPICS, ...U14_SUBTOPICS, ...U15_SUBTOPICS, ...U16_SUBTOPICS].includes(
          ref.subtopicId as never,
        ) && hasTemplates(ref as never),
    );
    for (const ref of real) {
      const run = playThrough(ref);
      expect(run.driedUp, createKey(ref)).toBe(false);
      expect(run.score, createKey(ref)).toBe(MAX_SCORE);
    }
  });

  it('never repeats a question it has already shown', () => {
    // Identity is prompt *and* picture, not the sentence alone: a counting
    // question says "how many objects are there?" over a different picture
    // every time, and that is a new question. The bug this pins asked the same
    // picture twice, whatever its sentence.
    const real = subtopics.filter(
      (ref) =>
        [...U01_SUBTOPICS, ...U02_SUBTOPICS, ...U03_SUBTOPICS, ...U04_SUBTOPICS, ...U05_SUBTOPICS, ...U06_SUBTOPICS, ...U07_SUBTOPICS, ...U08_SUBTOPICS, ...U09_SUBTOPICS, ...U10_SUBTOPICS, ...U11_SUBTOPICS, ...U12_SUBTOPICS, ...U13_SUBTOPICS, ...U14_SUBTOPICS, ...U15_SUBTOPICS, ...U16_SUBTOPICS].includes(
          ref.subtopicId as never,
        ) && hasTemplates(ref as never),
    );
    for (const ref of real) {
      const run = playThrough(ref);
      expect(new Set(run.shown).size, `${createKey(ref)} repeated a question`).toBe(
        run.shown.length,
      );
    }
  });
});

function createKey(ref: { grade: number; topicId: string; subtopicId: string }): string {
  return `${ref.grade}/${ref.topicId}/${ref.subtopicId}`;
}

describe('the drawing order of a template', () => {
  it('can be reversed, so the hardest answers are not the ones left over', () => {
    // "which number is missing" has one answer per N. Drawn forward, a session
    // that has to stop early ends clustered at the bottom of the range.
    const win = TEMPLATE_REGISTRY.forSubtopic({
      grade: 1,
      topicId: 'datvla',
      subtopicId: 'win-ukan',
    } as never);
    expect(win.length).toBeGreaterThanOrEqual(2);
    const reversed = (win as QuestionTemplate[]).filter((template) => {
      const n = template.variables.n as { reverse?: boolean } | undefined;
      return n?.reverse === true;
    });
    // At least the one that has a range to draw from; a walk of a given number
    // of steps from a given start has no single answer range to reverse.
    expect(reversed.length, 'no U03.2 template draws from the top down').toBeGreaterThanOrEqual(1);
  });

  it('draws both directions of counting, as the subtopic is named', () => {
    const win = TEMPLATE_REGISTRY.forSubtopic({
      grade: 1,
      topicId: 'datvla',
      subtopicId: 'win-ukan',
    } as never);
    const prompts = win.map((t) => t.prompt).join(' ');
    // "წინ და უკან" is counting forwards and backwards — both must be asked,
    // and the direction has to be drawn rather than fixed in the wording.
    expect(prompts).toMatch(/\{direction\}/);
    expect(prompts).toMatch(/უკან/);
    // The reverse row is printed from the drawn direction, not described in it.
    const drawnBackwards = (win as QuestionTemplate[]).filter((template) =>
      template.explanation({ vars: { start: 9, gap: 2, mode: 'back', n: 8 }, answer: '8' }),
    );
    expect(drawnBackwards.length).toBeGreaterThan(0);
  });
});
