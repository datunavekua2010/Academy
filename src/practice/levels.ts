/**
 * Axiom Academy — difficulty levels inside one session.
 *
 * U01 is authored in three levels per subtopic, and the academy's rule is that
 * a session *walks through* them in order rather than mixing them:
 *
 *   score   0–29   only level 1 (გაგება — recognition)
 *   score  30–59   only level 2 (გამოყენება — applying it)
 *   score  60–100  only level 3 (გამოწვევა — reasoning)
 *
 * The thresholds are on the score the student has already earned, so they are
 * not a difficulty setting the student can pick: they earn the harder questions
 * by answering the easier ones. The level is re-read from the score on every
 * refill, which means it steps *down* again if the score falls — a student who
 * slips from 62 to 58 goes back to level 2 rather than being held at a level
 * they have just failed.
 *
 * Every subtopic carries exactly three templates, one per level, because that is
 * the shape the curriculum is authored to: three question types per subtopic,
 * one for each score band. A test pins both halves of that.
 *
 * This is deliberately *not* wired to the 4/2/1 scoring bands. Those bands make
 * the last stretch of a session granular (+1 per answer); these levels decide
 * which questions are asked. Conflating them would mean a student who is doing
 * well gets harder questions *and* fewer points for them, which is two
 * penalties for one success.
 */

export type SessionLevel = 1 | 2 | 3;

export interface LevelBand {
  level: SessionLevel;
  /** Inclusive lower bound on the score. */
  from: number;
  /** Inclusive upper bound, or null for "to the end". */
  to: number | null;
  /** Georgian label, as the academy's document names the levels. */
  label: string;
}

export const LEVEL_BANDS: ReadonlyArray<LevelBand> = [
  { level: 1, from: 0, to: 29, label: 'გაგება' },
  { level: 2, from: 30, to: 59, label: 'გამოყენება' },
  { level: 3, from: 60, to: null, label: 'გამოწვევა' },
];

/** The level a student at `score` should be asked next. */
export function levelForScore(score: number): SessionLevel {
  if (!Number.isFinite(score) || score < 30) return 1;
  if (score < 60) return 2;
  return 3;
}

/** The band a level belongs to, for display. */
export function bandForLevel(level: SessionLevel): LevelBand {
  return LEVEL_BANDS.find((band) => band.level === level)!;
}

/**
 * Whether a session should follow the level ladder.
 *
 * Only grade 1 is authored level-by-level so far: every U01 subtopic has
 * questions at all three levels, while the other grades still have a single
 * undifferentiated pool. Turning the ladder on for a topic that cannot supply
 * level 1 questions would empty the session, so it is opt-in per grade until
 * those topics are authored the same way.
 */
export function usesLevelBands(grade: number): boolean {
  return grade === 1;
}
