import type { AttemptState } from './attempt';
import type { Activity, Stage } from './types';

/**
 * Axi's predefined, context-aware lines (Georgian). There is no AI behind this:
 * every line is chosen by the lesson state, and none of them gives an answer.
 * Lesson data may override `intro` / `discovery` per activity.
 */

const INTRO: Record<Stage, string> = {
  challenge: 'ჯერ სცადე. პირველი მცდელობა გვეხმარება, რომ გავიგოთ, საიდან დავიწყოთ.',
  explore: 'აქ შენ თვითონ გამოიკვლევ. სცადე და დააკვირდი, რა იცვლება.',
  understand: 'ახლა დავალაგოთ ის, რაც გამოიკვლიე.',
  practice: 'ახლა შენი ჯერია. მინიშნება ყოველთვის ხელმისაწვდომია.',
  check: 'ეს ნაწილი დამოუკიდებლად გააკეთე. შენ შეგიძლია.',
};

const WRONG = [
  'ჯერ არ არის ზუსტი. დააკვირდი, რა შეიძლება გამოგრჩენოდა.',
  'შეცდომა გზის ნაწილია. წაიკითხე კომენტარი და სცადე ისევ.',
  'ისევ ახლოს ხარ ამ აზრთან. შეგიძლია მინიშნებაც გამოიყენო.',
];
const EXHAUSTED = 'არაუშავს. წაიკითხე ახსნა: შემდეგ ჯერზე ეს გამოგადგება.';
const NO_HINTS = 'მინიშნებები უკვე გამოიყენე. ბოლო ნაბიჯი შენზეა.';
const READING = 'ჩაიკითხე ნელა. როცა მზად იქნები, განაგრძე.';

export function introLine(activity: Activity): string {
  return activity.mascot?.intro ?? INTRO[activity.stage];
}

export function discoveryLine(activity: Activity): string | undefined {
  return activity.mascot?.discovery;
}

/** What Axi says after a wrong submission. Correct answers are confirmed by the feedback panel; Axi stays quiet. */
export function reactionLine(state: AttemptState): string | undefined {
  if (state.status === 'exhausted') return EXHAUSTED;
  if (state.last?.verdict === 'incorrect') return WRONG[(state.attempts - 1) % WRONG.length];
  return undefined;
}

/** Axi's line when tapped: the next predefined hint, or a neutral nudge when there is none. */
export function tapLine(activity: Activity, hints: readonly string[], hintsShown: number): { text: string; usedHint: boolean } {
  if (activity.kind === 'explain') return { text: READING, usedHint: false };
  if (hintsShown < hints.length) return { text: hints[hintsShown], usedHint: true };
  return { text: hints.length ? NO_HINTS : INTRO[activity.stage], usedHint: false };
}
