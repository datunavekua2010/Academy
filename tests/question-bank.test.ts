import { describe, expect, it } from 'vitest';
import { QUESTIONS, bankStats, questionsForSubtopic } from '../src/practice/bank';
import { CURRICULUM, allSubtopics } from '../src/practice/curriculum';

describe('question bank', () => {
  it('covers every grade, topic and subtopic in the curriculum', () => {
    for (const { grade, topic, subtopic } of allSubtopics()) {
      const questions = questionsForSubtopic({
        grade,
        topicId: topic.id,
        subtopicId: subtopic.id,
      });
      expect(
        questions.length,
        `missing questions for ${grade}/${topic.id}/${subtopic.id}`,
      ).toBeGreaterThanOrEqual(5);
    }
  });

  it('has grades I–VII with several topics each', () => {
    expect(CURRICULUM.map((grade) => grade.grade)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (const grade of CURRICULUM) {
      expect(grade.topics.length).toBeGreaterThanOrEqual(3);
      for (const topic of grade.topics) {
        expect(topic.subtopics.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('gives every question a valid, unique id and a correct option', () => {
    const ids = new Set<string>();
    for (const question of QUESTIONS) {
      expect(ids.has(question.id), `duplicate id ${question.id}`).toBe(false);
      ids.add(question.id);

      expect(question.prompt.length).toBeGreaterThan(3);
      expect(question.options.length).toBeGreaterThanOrEqual(3);
      expect(question.options).toContain(question.answer);
      expect(new Set(question.options).size, `duplicate options in ${question.id}`).toBe(
        question.options.length,
      );
      expect(question.explanation.length).toBeGreaterThan(5);
    }
  });

  it('tags every question with the grade/topic/subtopic it lives under', () => {
    for (const question of QUESTIONS) {
      const grade = CURRICULUM.find((item) => item.grade === question.grade);
      expect(grade, `unknown grade on ${question.id}`).toBeTruthy();
      const topic = grade!.topics.find((item) => item.id === question.topicId);
      expect(topic, `unknown topic on ${question.id}`).toBeTruthy();
      expect(topic!.subtopics.some((item) => item.id === question.subtopicId)).toBe(true);
    }
  });

  it('reports a usable bank size', () => {
    const stats = bankStats();
    expect(stats.total).toBeGreaterThan(150);
    expect(stats.subtopics).toBe(allSubtopics().length);
    expect(stats.minPerSubtopic).toBeGreaterThanOrEqual(5);
  });
});
