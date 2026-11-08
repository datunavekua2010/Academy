import { CURRICULUM } from '../curriculum';
import type { GradeId, Question, SubtopicRef } from '../types';
import { subtopicKey } from '../types';
import { GRADE_1 } from './grade1';
import { GRADE_2 } from './grade2';
import { GRADE_3 } from './grade3';
import { GRADE_4 } from './grade4';
import { GRADE_5 } from './grade5';
import { GRADE_6 } from './grade6';
import { GRADE_7 } from './grade7';
import type { Seed } from './seed';

/**
 * THE question bank.
 *
 * One bank is shared by assigned homework and free practice — there is no
 * separate homework question set. Seeds are expanded against the curriculum so
 * every question carries its own grade, topic and subtopic ids.
 */
const SEEDS: Record<GradeId, Record<string, Seed[]>> = {
  1: GRADE_1,
  2: GRADE_2,
  3: GRADE_3,
  4: GRADE_4,
  5: GRADE_5,
  6: GRADE_6,
  7: GRADE_7,
};

function build(): Question[] {
  const questions: Question[] = [];

  for (const grade of CURRICULUM) {
    for (const topic of grade.topics) {
      for (const subtopic of topic.subtopics) {
        const bankKey = `${topic.id}/${subtopic.id}`;
        const seeds = SEEDS[grade.grade][bankKey];

        if (!seeds) {
          console.warn(`[practice] no questions for ${grade.grade}/${bankKey}`);
          continue;
        }

        seeds.forEach((seed, index) => {
          questions.push({
            id: `${grade.grade}-${topic.id}-${subtopic.id}-${index + 1}`,
            grade: grade.grade,
            topicId: topic.id,
            subtopicId: subtopic.id,
            prompt: seed.p,
            options: seed.o,
            answer: seed.o[seed.a],
            explanation: seed.e,
            difficulty: seed.d ?? 1,
          });
        });
      }
    }
  }

  return questions;
}

export const QUESTIONS: Question[] = build();

export function questionsForSubtopic(ref: SubtopicRef): Question[] {
  return QUESTIONS.filter(
    (question) =>
      question.grade === ref.grade &&
      question.topicId === ref.topicId &&
      question.subtopicId === ref.subtopicId,
  );
}

/** Questions for every subtopic of one topic — used for "whole topic" runs. */
export function questionsForTopic(grade: GradeId, topicId: string): Question[] {
  return QUESTIONS.filter((question) => question.grade === grade && question.topicId === topicId);
}

export function questionById(id: string): Question | undefined {
  return QUESTIONS.find((question) => question.id === id);
}

export function bankStats() {
  const bySubtopic = new Map<string, number>();
  for (const question of QUESTIONS) {
    const key = subtopicKey({
      grade: question.grade,
      topicId: question.topicId,
      subtopicId: question.subtopicId,
    });
    bySubtopic.set(key, (bySubtopic.get(key) ?? 0) + 1);
  }
  return {
    total: QUESTIONS.length,
    subtopics: bySubtopic.size,
    minPerSubtopic: Math.min(...bySubtopic.values()),
  };
}
