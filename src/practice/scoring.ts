/**
 * Axiom Academy — the single 100-point scoring engine.
 *
 * There is exactly ONE scoring rule set in the whole product. Homework, free
 * practice and "needs work" retries all run through `scoreAnswer`, so a session
 * score can never be calculated in two different ways.
 *
 * Rules (the band is chosen from the score *before* the current answer):
 *
 *   score < 80          correct +4   wrong −2
 *   80 ≤ score < 90     correct +2   wrong −1
 *   90 ≤ score < 100    correct +1   wrong −1
 *
 * A session ends at exactly 100 and the score can never exceed 100. A score can
 * never drop below 0 either, which keeps very early mistakes from making the
 * session feel hopeless.
 */

export type ScoreBand = 'below-80' | '80-to-90' | '90-to-100';

export const MAX_SCORE = 100;
export const MIN_SCORE = 0;

export const SCORE_RULES: ReadonlyArray<{
  band: ScoreBand;
  range: string;
  correct: number;
  wrong: number;
}> = [
  { band: 'below-80', range: '80-ზე ნაკლები', correct: 4, wrong: -2 },
  { band: '80-to-90', range: '80 – 89', correct: 2, wrong: -1 },
  { band: '90-to-100', range: '90 – 99', correct: 1, wrong: -1 },
];

export function scoreBand(score: number): ScoreBand {
  if (score < 80) return 'below-80';
  if (score < 90) return '80-to-90';
  return '90-to-100';
}

export interface AnswerResult {
  /** Score before the answer was submitted. */
  previousScore: number;
  /** Score after the answer was applied. Always 0…100. */
  score: number;
  correct: boolean;
  /** Signed change that was applied, e.g. +4 or −2. */
  delta: number;
  band: ScoreBand;
  /** True when this answer brought the session to 100. */
  finished: boolean;
}

export function applyAnswer(score: number, correct: boolean): AnswerResult {
  const previousScore = clampScore(score);
  const band = scoreBand(previousScore);
  const rules = SCORE_RULES.find((rule) => rule.band === band)!;
  const scoreAfter = clampScore(previousScore + (correct ? rules.correct : rules.wrong));

  return {
    previousScore,
    score: scoreAfter,
    correct,
    delta: scoreAfter - previousScore,
    band,
    finished: scoreAfter >= MAX_SCORE,
  };
}

export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return MIN_SCORE;
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, Math.round(score)));
}

export function isComplete(score: number): boolean {
  return clampScore(score) >= MAX_SCORE;
}

export function percent(score: number): number {
  return clampScore(score);
}
