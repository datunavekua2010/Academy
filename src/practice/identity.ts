/**
 * What makes two questions different.
 *
 * A question is shown to the student as three things: the sentence, the picture
 * above it (text `visual`, or drawn `pictures` / an interactive widget), and — for ordering questions — the items to arrange. Two questions
 * that agree on all three are the same question, whatever their ids say.
 *
 * This has to be ONE definition. It was previously spelled out separately in
 * the generator, in `advance` and in the provider, and each of them built the
 * key from the prompt alone or from prompt and picture. An ordering question
 * varies only in its items, so every one of them looked like a repeat of the
 * first: the generator refused to draw another, and a subtopic whose level 3 is
 * ordering ran itself out of questions at 82 points.
 */
import type { Question } from './types';

/** The part of a question that decides whether the student has seen it before. */
export type Shown = Pick<Question, 'prompt'> & Partial<Pick<Question, 'visual' | 'orderItems' | 'pictures' | 'interaction'>>;

export function shownKey(question: Shown): string {
  const items = question.orderItems?.join(',') ?? '';
  // Drawn pictures and interactive widgets are part of what is shown: „რამდენი
  // ვაშლია?“ over 4 apples and over 7 apples are two different questions.
  const drawn = question.pictures?.length || question.interaction ? JSON.stringify([question.pictures, question.interaction]) : '';
  return `${question.prompt}|${question.visual ?? ''}|${items}${drawn ? `|${drawn}` : ''}`;
}
