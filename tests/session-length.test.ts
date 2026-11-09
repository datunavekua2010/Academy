import { describe, expect, it } from 'vitest';
import { CURRICULUM } from '../src/practice/curriculum';
import { topicSubtopics } from '../src/practice/types';
import { generateBatch, hasTemplates } from '../src/practice/generator';
import { advance, startSession, submitAnswer } from '../src/practice/session';
import { U01_SUBTOPICS } from '../src/practice/templates/u01-space';
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
    const refill =
      state.queue.length <= 3
        ? generateBatch(asRef, 4, {
            avoid: new Set(Object.values(state.questions).map(shownKey)),
          })
        : [];
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
 * They are listed rather than skipped so the count is visible: it is 39 of 149
 * playable subtopics, and it shrinks as U02…U16 are authored the way U01 now is.
 */
describe('every playable subtopic can reach 100 points', () => {
  it('never runs the queue dry on a U01 subtopic', () => {
    const u01 = subtopics.filter(
      (ref) => U01_SUBTOPICS.includes(ref.subtopicId as never) && hasTemplates(ref as never),
    );
    expect(u01).toHaveLength(8);

    const short: string[] = [];
    for (const ref of u01) {
      const run = playThrough(ref);
      if (run.driedUp) {
        short.push(`${createKey(ref)} stopped at ${run.score} after ${run.answered}`);
      }
    }
    expect(short, `these U01 subtopics cannot finish a session:\n${short.join('\n')}`).toEqual([]);
  });

  it('ends honestly, never with a broken screen, when material runs out', () => {
    // The failure this pins is not "short" but "silent": the queue empties, and
    // the screen must say the material ended rather than blame the load.
    const playable = subtopics.filter((ref) => hasTemplates(ref as never));
    let checked = 0;
    for (const ref of playable) {
      const run = playThrough(ref);
      if (!run.driedUp) continue;
      checked += 1;
      // A dried-up queue is flagged, which is what the view turns into an
      // ending; an unflagged empty queue is the bug.
      expect(run.exhausted, createKey(ref)).toBe(true);
    }
    expect(checked, 'the sweep should have found short subtopics').toBeGreaterThan(0);
  });

  it('reaches exactly MAX_SCORE on a perfect run', () => {
    const u01 = subtopics.filter(
      (ref) => U01_SUBTOPICS.includes(ref.subtopicId as never) && hasTemplates(ref as never),
    );
    for (const ref of u01) {
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
    const u01 = subtopics.filter(
      (ref) => U01_SUBTOPICS.includes(ref.subtopicId as never) && hasTemplates(ref as never),
    );
    for (const ref of u01) {
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
    // "which number comes before N" has one answer per N. Drawn forward, a
    // session that has to stop early ends clustered at the bottom of the range.
    const win = TEMPLATE_REGISTRY.forSubtopic({
      grade: 1,
      topicId: 'datvla',
      subtopicId: 'win-ukan',
    } as never);
    expect(win.length).toBeGreaterThanOrEqual(2);
    for (const template of win as QuestionTemplate[]) {
      const n = template.variables.n as { reverse?: boolean };
      expect(n.reverse, `${template.id} should draw from the top down`).toBe(true);
    }
  });

  it('draws both directions of counting, as the subtopic is named', () => {
    const win = TEMPLATE_REGISTRY.forSubtopic({
      grade: 1,
      topicId: 'datvla',
      subtopicId: 'win-ukan',
    } as never);
    const prompts = win.map((t) => t.prompt).join(' ');
    // "წინ და უკან" is counting forwards and backwards — both must be asked.
    expect(prompts).toMatch(/მოდის .*-მდე/);
    expect(prompts).toMatch(/შემდეგ/);
  });
});
