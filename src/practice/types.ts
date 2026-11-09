/**
 * Curriculum model shared by the question bank, the practice engine and the
 * progress store.
 *
 * Content is always addressed Grade → Topic → Unit → Subtopic → Questions.
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
  /** Optional support line drawn above the prompt (object row, groups, …). */
  visual?: string;
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

/**
 * A unit groups subtopics inside a topic (U1, U2, …). Units are a grouping
 * only — questions and progress are still stored per subtopic, so no stored
 * data changes when the curriculum is reshaped into units.
 */
export interface Unit {
  id: string;
  /** Short label shown in the accordion, e.g. "U1". */
  code: string;
  title: string;
  subtopics: Subtopic[];
}

export interface Topic {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  units: Unit[];
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

/** Every subtopic of a topic, in curriculum (unit) order. */
export function topicSubtopics(topic: Topic): Subtopic[] {
  return topic.units.flatMap((unit) => unit.subtopics);
}

/** The unit a subtopic belongs to, if any. */
export function unitOf(topic: Topic, subtopicId: string): Unit | undefined {
  return topic.units.find((unit) => unit.subtopics.some((item) => item.id === subtopicId));
}

export function subtopicKey(ref: SubtopicRef): string {
  return `${ref.grade}/${ref.topicId}/${ref.subtopicId}`;
}
