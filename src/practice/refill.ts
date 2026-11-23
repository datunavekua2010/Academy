import { shownKey } from './identity';
import type { SessionState } from './session';

/** Avoid queued and answered IDs AND displayed content when requesting a refill. */
export function refillAvoid(state: SessionState): Set<string> {
  const avoid = new Set(Object.keys(state.questions));
  for (const question of Object.values(state.questions)) avoid.add(shownKey(question));
  for (const answer of state.answers) {
    if (!answer.prompt) { avoid.add(answer.questionId); continue; }
    const question = state.questions[answer.questionId];
    avoid.add(shownKey({ prompt: answer.prompt, visual: answer.visual, orderItems: answer.orderItems ?? question?.orderItems }));
  }
  return avoid;
}
