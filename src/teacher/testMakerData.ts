import type { SupabaseClient } from '@supabase/supabase-js';
import type { GeneratedQuestion } from '../practice/generator';
import { generateQuestion } from '../practice/generator';
import { describedPictures, pictorialize } from '../practice/pictures/parse';
import { TEMPLATE_REGISTRY } from '../practice/templates/catalog';
import { shownKey } from '../practice/identity';
import { getTopic } from '../practice/curriculum';
import { hasPdfCharacters } from './fontCharacters';

export type TestQuestion = { question: GeneratedQuestion; points: number };
export type ExerciseSection = { id: string; grade: number; topicId: string; unitId: string; subtopicId: string; templateId: string; quantity: number | null };
// sections is optional for drafts saved before this feature existed.
export type TestContent = { title: string; grade: number | null; instructions: string; nameField: boolean; dateField: boolean; branding: boolean; minutes: number | null; questions: TestQuestion[]; sections?: ExerciseSection[]; defaultPoints?: number };
export type SavedTest = { id: string; teacher_id: string; revision: number; created_at: string; updated_at: string; content: TestContent };
export const newTest = (): TestContent => ({ title: 'ახალი ტესტი', grade: null, instructions: '', nameField: true, dateField: true, branding: true, minutes: null, questions: [], sections: [], defaultPoints: 1 });

/** A conservative paper subset: questions dependent on any picture or widget are not silently flattened. */
export function paperSupport(q: GeneratedQuestion): boolean {
  if (!q || typeof q.prompt !== 'string' || !q.prompt.trim() || typeof q.answer !== 'string' || !q.answer.trim() || !Array.isArray(q.options) || !q.options.every((v) => typeof v === 'string') || ![q.prompt, q.answer, ...q.options].every(hasPdfCharacters)) return false;
  if (q.interaction || q.visual || q.clocks?.length || q.pictures?.length || q.orderItems?.length || q.answerMode === 'interactive' || q.answerMode === 'order') return false;
  // Wording may refer to an external table or illustration even without image data.
  if (/(ცხრილში|ცხრილზე|ცხრილს|სურათ|ნახატ|დიაგრამ|გრაფიკ|ფიგურ|სქემა|ღერძ|ქვემოთ|ზემოთ|მოცემულზე)/i.test(q.prompt)) return false;
  if (pictorialize(q.prompt, { isVisual: false }).some((s) => s.type === 'picture') || describedPictures(q.prompt).length) return false;
  if (!['choice', 'number', 'time', 'multi', undefined].includes(q.answerMode)) return false;
  return true;
}
export function drawTemplate(templateId: string, seed: number): GeneratedQuestion {
  const t = TEMPLATE_REGISTRY.byId(templateId);
  if (!t || !getTopic(t.grade, t.topicId)?.units.some((unit) => unit.subtopics.some((s) => s.id === t.subtopicId))) throw new Error('Unknown template');
  const q = generateQuestion({ grade:t.grade, topicId:t.topicId, subtopicId:t.subtopicId }, seed, { templateId });
  if (!q || !paperSupport(q)) throw new Error('Unsupported question');
  return q;
}
export function validateContent(value: TestContent, requireQuestions = false): void {
  if (!value || typeof value.title !== 'string' || !value.title.trim() || value.title.length > 150 || typeof value.instructions !== 'string' || value.instructions.length > 2000 || !(value.grade === null || (Number.isInteger(value.grade) && value.grade >= 1 && value.grade <= 7)) || !(value.minutes === null || (Number.isInteger(value.minutes) && value.minutes >= 1 && value.minutes <= 600)) || typeof value.nameField !== 'boolean' || typeof value.dateField !== 'boolean' || typeof value.branding !== 'boolean' || !Array.isArray(value.questions) || value.questions.length > 100 || (requireQuestions && !value.questions.length)) throw new Error('Invalid test');
  if (value.defaultPoints !== undefined && (!Number.isInteger(value.defaultPoints) || value.defaultPoints < 1 || value.defaultPoints > 100)) throw new Error('Invalid points');
  validateSections(value.sections ?? [], false);
  for (const item of value.questions) {
    if (!item || !Number.isInteger(item.points) || item.points < 1 || item.points > 100 || !item.question || !paperSupport(item.question)) throw new Error('Invalid question');
    const q = item.question, template = TEMPLATE_REGISTRY.byId(q.templateId);
    if (!template || q.grade !== template.grade || q.topicId !== template.topicId || q.subtopicId !== template.subtopicId || !Number.isSafeInteger(q.seed) || q.seed < 0 || q.id !== `${q.templateId}~${q.seed}` || q.prompt.length > 3000 || q.answer.length > 1000 || q.options.some((o) => o.length > 1000)) throw new Error('Invalid exercise');
  }
}
export const MAX_TEST_QUESTIONS = 100;
export const MAX_SECTIONS = 100;
export function validateSections(sections: ExerciseSection[], requireSelected: boolean): number {
  if (!Array.isArray(sections) || sections.length > MAX_SECTIONS || (requireSelected && sections.length === 0)) throw new Error('Invalid sections');
  const seen = new Set<string>(); let total = 0;
  for (const section of sections) {
    if (!section || typeof section.id !== 'string' || !section.id || section.id.length > 100 || seen.has(section.id) || !Number.isInteger(section.grade) || section.grade < 1 || section.grade > 7 || !Number.isInteger(section.quantity) || section.quantity === null || section.quantity < 1 || section.quantity > MAX_TEST_QUESTIONS || !['topicId','unitId','subtopicId','templateId'].every((key) => typeof section[key as keyof ExerciseSection] === 'string' && (section[key as keyof ExerciseSection] as string).length <= 200)) throw new Error('Invalid sections');
    seen.add(section.id); total += section.quantity;
    const topic = section.topicId ? getTopic(section.grade as 1|2|3|4|5|6|7, section.topicId) : undefined;
    if (section.topicId && !topic) throw new Error('Invalid sections');
    const unit = section.unitId ? topic?.units.find((item) => item.id === section.unitId) : undefined;
    if (section.unitId && !unit) throw new Error('Invalid sections');
    if (section.subtopicId && !unit?.subtopics.some((item) => item.id === section.subtopicId)) throw new Error('Invalid sections');
    if (section.templateId) {
      const template = TEMPLATE_REGISTRY.byId(section.templateId);
      if (!template || template.grade !== section.grade || template.topicId !== section.topicId || template.subtopicId !== section.subtopicId || !unit) throw new Error('Invalid sections');
    } else if (requireSelected) throw new Error('Invalid sections');
  }
  if (total > MAX_TEST_QUESTIONS) throw new Error('Invalid sections');
  return total;
}
export class SectionGenerationError extends Error {
  constructor(public sectionIndex: number, public requested: number, public produced: number) { super('Insufficient distinct questions'); }
}
/** Atomic generation: the caller applies the result only if every section succeeds. */
export async function generateSections(sections: ExerciseSection[], points: number, nextSeed: () => number): Promise<TestQuestion[]> {
  validateSections(sections, true);
  if (!Number.isInteger(points) || points < 1 || points > 100) throw new Error('Invalid points');
  const results: TestQuestion[] = []; const seen = new Set<string>();
  for (const [index, section] of sections.entries()) {
    const wanted = section.quantity!; let made = 0, attempts = 0;
    const limit = Math.max(200, wanted * 150);
    while (made < wanted && attempts < limit) {
      attempts++;
      try {
        const q = drawTemplate(section.templateId, nextSeed()); const key = shownKey(q);
        if (!seen.has(key)) { seen.add(key); results.push({ question: q, points }); made++; }
      } catch { /* Unsuitable draw, try a fresh seed. */ }
      if (attempts % 50 === 0) await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
    if (made !== wanted) throw new SectionGenerationError(index, wanted, made);
  }
  return results;
}
export async function regenerateQuestion(item: TestQuestion, others: TestQuestion[], nextSeed: () => number): Promise<TestQuestion> {
  const seen = new Set([shownKey(item.question), ...others.map((other) => shownKey(other.question))]);
  for (let attempt=0; attempt<250; attempt++) {
    try { const q = drawTemplate(item.question.templateId, nextSeed()); if (!seen.has(shownKey(q))) return { ...item, question:q }; } catch { /* Try a new valid variation. */ }
    if (attempt % 50 === 49) await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  throw new Error('No distinct variant');
}
export function isDuplicate(content: TestContent, q: GeneratedQuestion) { return content.questions.some((item) => shownKey(item.question) === shownKey(q)); }
export const totalPoints = (content: TestContent) => content.questions.reduce((total, item) => total + item.points, 0);

export function testStore(client: SupabaseClient, teacherId: string) {
  const checked = (data: unknown): SavedTest[] => {
    if (!Array.isArray(data)) throw new Error('Invalid response');
    return data.map((value) => { const row = value as SavedTest; if (!row || row.teacher_id !== teacherId || typeof row.id !== 'string' || !Number.isSafeInteger(row.revision) || row.revision < 1 || typeof row.created_at !== 'string' || typeof row.updated_at !== 'string') throw new Error('Invalid test'); validateContent(row.content); return row; });
  };
  return {
    list: async (): Promise<SavedTest[]> => {
      const all: SavedTest[] = [];
      for (let i = 0; ; i += 200) {
        const { data, error } = await client.rpc('teacher_tests_list').order('updated_at', { ascending:false }).order('id').range(i, i + 199);
        if (error) throw error; const rows = checked(data); all.push(...rows); if (rows.length < 200) return all;
      }
    },
    save: async (content: TestContent, row: SavedTest | null): Promise<SavedTest> => {
      validateContent(content);
      const { data, error } = await client.rpc('teacher_test_save', { p_id:row?.id ?? null, p_revision:row?.revision ?? null, p_content:content });
      if (error) throw error; const rows = checked(data); if (rows.length !== 1) throw new Error('Invalid save response'); return rows[0];
    },
    delete: async (row: SavedTest): Promise<void> => { const { data, error } = await client.rpc('teacher_test_delete', { p_id:row.id, p_revision:row.revision }); if (error || data !== true) throw new Error('Delete failed'); },
  };
}
