/**
 * Curriculum model shared by the question bank, the practice engine and the
 * progress store.
 *
 * Content is always addressed Grade → Topic → Subtopic → Questions.
 */

export type GradeId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Answer = string;

export interface Question {
  id: string;
  grade: GradeId;
  topicId: string;
  subtopicId: string;
  /** Georgian prompt. May contain simple `x`, `÷` and fraction text. */
  prompt: string;
  /** Optional supporting line (a number line hint, a diagram description…). */
  hint?: string;
  options: Answer[];
  answer: Answer;
  explanation: string;
  difficulty: 1 | 2 | 3;
}

export interface Subtopic {
  id: string;
  title: string;
  /** One short line that tells the student what they will practise. */
  summary: string;
}

export interface Topic {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  subtopics: Subtopic[];
  tone: 'blue' | 'teal' | 'yellow' | 'pink' | 'violet' | 'green';
}

export interface GradeCurriculum {
  grade: GradeId;
  /** Roman numeral used in the UI (I–VII). */
  roman: string;
  label: string;
  ageHint: string;
  topics: Topic[];
}

export interface SubtopicRef {
  grade: GradeId;
  topicId: string;
  subtopicId: string;
}

export function subtopicKey(ref: SubtopicRef): string {
  return `${ref.grade}/${ref.topicId}/${ref.subtopicId}`;
}
