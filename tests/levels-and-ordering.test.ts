import { describe, expect, it } from 'vitest';
import { LEVEL_BANDS, levelForScore, usesLevelBands } from '../src/practice/levels';
import { startSession, submitAnswer } from '../src/practice/session';
import { generateBatch, templatesAtLevel } from '../src/practice/generator';
import { U01_TEMPLATES } from '../src/practice/templates/u01-space';
import type { Question } from '../src/practice/types';

/**
 * U01 is authored in three levels per subtopic, and a session walks up them as
 * the score rises: level 1 until 30 points, level 2 until 60, level 3 after.
 *
 * These tests pin the thresholds, and — the part that actually matters — check
 * that every U01 subtopic can supply questions at every level. A level with no
 * templates would silently empty a session at exactly the moment a student
 * earned the harder questions.
 */

describe('U01 difficulty levels', () => {
  it('changes level at 30 and 60 points, and nowhere else', () => {
    expect(levelForScore(0)).toBe(1);
    expect(levelForScore(29)).toBe(1);
    expect(levelForScore(30)).toBe(2);
    expect(levelForScore(59)).toBe(2);
    expect(levelForScore(60)).toBe(3);
    expect(levelForScore(100)).toBe(3);
  });

  it('steps back DOWN when the score falls, not only up', () => {
    // A student who slips from 62 to 58 goes back to level 2, and from 31 to 27
    // back to level 1. The ladder reads the score on every refill, so it moves
    // in both directions; holding the highest level reached would leave a
    // struggling student stuck on questions they have just failed.
    expect(levelForScore(62)).toBe(3);
    expect(levelForScore(58)).toBe(2);
    expect(levelForScore(31)).toBe(2);
    expect(levelForScore(27)).toBe(1);
  });

  it('treats a nonsense score as the beginning of the session', () => {
    expect(levelForScore(-5)).toBe(1);
    expect(levelForScore(Number.NaN)).toBe(1);
  });

  it('declares bands that tile the score range without gaps', () => {
    expect(LEVEL_BANDS.map((band) => [band.level, band.from, band.to])).toEqual([
      [1, 0, 29],
      [2, 30, 59],
      [3, 60, null],
    ]);
  });

  it('applies the ladder to grade 1 only, for now', () => {
    expect(usesLevelBands(1)).toBe(true);
    // Other grades still have one undifferentiated pool; gating them would
    // empty their sessions, so they stay flat until they are authored.
    for (const grade of [2, 3, 4, 5, 6, 7]) expect(usesLevelBands(grade)).toBe(false);
  });

  it('every U01 subtopic has questions at all three levels', () => {
    const subtopics = [...new Set(U01_TEMPLATES.map((t) => t.subtopicId))];
    expect(subtopics).toHaveLength(8);

    for (const subtopic of subtopics) {
      const templates = U01_TEMPLATES.filter((t) => t.subtopicId === subtopic);
      for (const level of [1, 2, 3] as const) {
        const atLevel = templatesAtLevel(templates, level);
        const exact = templates.filter((t) => (t.difficulty ?? 1) === level);
        expect(exact.length, `${subtopic} has no level-${level} question`).toBeGreaterThan(0);
        expect(atLevel.length).toBe(exact.length);
      }
    }
  });

  it('generates only the requested level', () => {
    for (const level of [1, 2, 3] as const) {
      const batch = generateBatch(
        { grade: 1, topicId: 'mdebareoba', subtopicId: 'grZeli-mokle' },
        6,
        { level, seed: 4242 },
      );
      expect(batch.length).toBeGreaterThan(0);
      for (const question of batch) expect(question.difficulty).toBe(level);
    }
  });

  it('falls back to the whole set rather than emptying a session', () => {
    // No U01 template is level 4; a request for a level nothing has must not
    // return nothing, because an empty batch means "cannot start".
    const templates = U01_TEMPLATES.filter((t) => t.subtopicId === 'yvela-rame');
    expect(templatesAtLevel(templates, 3).length).toBeGreaterThan(0);
    expect(templatesAtLevel(templates)).toHaveLength(templates.length);
  });
});

describe('ordering questions', () => {
  const ordering = U01_TEMPLATES.filter((t) => t.shuffle);
  const question = (templateId: string, seed: number) => {
    const batch = generateBatch(
      { grade: 1, topicId: 'mdebareoba', subtopicId: 'grZeli-mokle' },
      1,
      { templateId, seed },
    );
    return batch[0];
  };

  it('is the level-3 type of U01.3, the subtopic that asks for it', () => {
    // Ordering is the level-3 form of length comparison only: U01.4-U01.6 use
    // it nowhere, so their level 3 is a typed difference instead.
    expect(ordering.map((t) => t.id)).toEqual(['g1-u01-3-ribbon-order']);
    expect(ordering.every((t) => t.difficulty === 3)).toBe(true);
  });

  it('shows the items scrambled, never already sorted', () => {
    for (const template of ordering) {
      for (let seed = 1; seed <= 40; seed += 1) {
        const q = question(template.id, seed);
        if (!q) continue;
        const items = q.orderItems!.map(Number);
        const sorted = [...items].sort((a, b) => a - b);
        expect(items, `${template.id} seed ${seed}`).not.toEqual(sorted);
      }
    }
  });

  it('keys the answer to the scrambled order the student sees', () => {
    for (const template of ordering) {
      for (let seed = 1; seed <= 40; seed += 1) {
        const q = question(template.id, seed);
        if (!q) continue;
        const items = q.orderItems!.map(Number);
        const key = q.answer.split(',').map(Number);

        // Following the key through the displayed items must produce them in
        // ascending order — that is what "arrange smallest first" means.
        const picked = key.map((position) => items[position - 1]);
        expect(picked, `${template.id} seed ${seed}: ${q.orderItems} → ${q.answer}`).toEqual(
          [...items].sort((a, b) => a - b),
        );
      }
    }
  });

  it('grades a sequence by position, not by spelling', () => {
    const q = question('g1-u01-3-ribbon-order', 3) as Question;
    const base = startSession(
      { grade: 1, topicId: 'mdebareoba', subtopicId: 'grZeli-mokle' },
      [q],
    );

    expect(submitAnswer(base, q.answer)!.result.correct).toBe(true);
    // Spaces in a typed sequence must not matter.
    expect(submitAnswer(base, q.answer.split(',').join(', '))!.result.correct).toBe(true);

    // The same positions in the wrong order is wrong.
    const reversed = q.answer.split(',').reverse().join(',');
    expect(submitAnswer(base, reversed)!.result.correct).toBe(false);
  });
});
