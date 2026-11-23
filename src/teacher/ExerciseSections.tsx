import { useMemo } from 'react';
import { CURRICULUM, getTopic } from '../practice/curriculum';
import type { GradeId } from '../practice/types';
import { TEMPLATE_REGISTRY } from '../practice/templates/catalog';
import { drawTemplate, MAX_SECTIONS, validateSections, type ExerciseSection } from './testMakerData';

function SectionEditor({ section, index, onChange, onRemove }: { section: ExerciseSection; index: number; onChange: (section: ExerciseSection) => void; onRemove: () => void }) {
  const grade = CURRICULUM.find((item) => item.grade === section.grade);
  const topic = grade && getTopic(grade.grade, section.topicId);
  const unit = topic?.units.find((item) => item.id === section.unitId);
  const options = useMemo(() => {
    if (!section.topicId || !section.subtopicId) return [];
    return TEMPLATE_REGISTRY.forSubtopic({ grade:section.grade as GradeId, topicId:section.topicId, subtopicId:section.subtopicId }).flatMap((template) => {
      // A particular seed may be unsuitable even when other real variants print correctly.
      for (const seed of [1, 2, 3, 4, 5]) {
        try { const question = drawTemplate(template.id,seed); return [{ id:template.id, prompt:question.prompt }]; } catch { /* Try another example. */ }
      }
      return [];
    });
  }, [section.grade,section.topicId,section.subtopicId]);
  const selected = options.find((option) => option.id === section.templateId);
  return <fieldset className="test-maker-section"><legend>სავარჯიშოს ტიპი {index+1}</legend>
    <div className="test-maker-grid">
      <label>კლასი<select value={section.grade} onChange={(e) => onChange({...section,grade:Number(e.target.value),topicId:'',unitId:'',subtopicId:'',templateId:''})}>{CURRICULUM.map((item)=><option key={item.grade} value={item.grade}>{item.label}</option>)}</select></label>
      <label>თემა<select value={section.topicId} onChange={(e) => onChange({...section,topicId:e.target.value,unitId:'',subtopicId:'',templateId:''})}><option value="">აირჩიეთ თემა</option>{grade?.topics.map((item)=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
      <label>თავი<select value={section.unitId} onChange={(e) => onChange({...section,unitId:e.target.value,subtopicId:'',templateId:''})}><option value="">აირჩიეთ თავი</option>{topic?.units.map((item)=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
      <label>ქვეთემა<select value={section.subtopicId} onChange={(e) => onChange({...section,subtopicId:e.target.value,templateId:''})}><option value="">აირჩიეთ ქვეთემა</option>{unit?.subtopics.map((item)=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
      <label>სავარჯიშოს შაბლონი<select value={section.templateId} onChange={(e) => onChange({...section,templateId:e.target.value})}><option value="">აირჩიეთ შაბლონი</option>{section.templateId && !selected && <option value={section.templateId}>შენახული შაბლონი: {section.templateId}</option>}{options.map((item)=><option key={item.id} value={item.id}>{item.prompt} · {item.id}</option>)}</select></label>
      <label>რაოდენობა<input type="number" step="1" min="1" max="100" value={section.quantity ?? ''} onChange={(e) => onChange({...section,quantity:e.target.value === '' ? null : Number(e.target.value)})} /></label>
    </div>
    {section.subtopicId && !options.length && <p>ამ ქვეთემაში ქაღალდზე გამოსადეგი შაბლონი ვერ მოიძებნა.</p>}
    <p>{selected ? `შაბლონი: ${selected.prompt} · მოთხოვნილია ${section.quantity ?? '—'} დავალება` : 'აირჩიეთ ქვეთემა და შაბლონი.'}</p>
    <button type="button" className="teacher-cancel" onClick={onRemove}>ტიპის ამოღება</button>
  </fieldset>;
}

export function ExerciseSections({ sections, onChange, onGenerate }: { sections: ExerciseSection[]; onChange: (sections: ExerciseSection[]) => void; onGenerate: () => void }) {
  let total: number | null = null;
  try { total = validateSections(sections,false); } catch { /* Show invalid input explicitly without altering it. */ }
  return <div><h3>სავარჯიშოს ტიპები</h3>
    <p className="teacher-notice">თითოეულ ტიპს ცალკე აირჩიეთ შაბლონი და რაოდენობა. მხარდაჭერილია მხოლოდ ქაღალდზე გამოსატანი დავალებები; სურათიანი და ინტერაქტიული შაბლონები გამოტოვებულია.</p>
    {sections.map((section,index) => <SectionEditor key={section.id} section={section} index={index} onChange={(next) => onChange(sections.map((s) => s.id === next.id ? next : s))} onRemove={() => onChange(sections.filter((s) => s.id !== section.id))} />)}
    {!sections.length && <p>დაამატეთ სავარჯიშოს ტიპი.</p>}
    <div className="test-maker-actions"><button type="button" className="teacher-button" disabled={sections.length >= MAX_SECTIONS} onClick={() => onChange([...sections,{id:crypto.randomUUID(),grade:1,topicId:'',unitId:'',subtopicId:'',templateId:'',quantity:1}])}>+ სავარჯიშოს ტიპის დამატება</button><button type="button" className="teacher-button" onClick={onGenerate}>ტესტის შექმნა</button></div>
    {total === null ? <p role="alert">მიუთითეთ თითოეული რაოდენობა 1-დან 100-მდე მთელ რიცხვად; ჯამი არ უნდა აღემატებოდეს 100-ს.</p> : <p aria-live="polite"><strong>{total} დავალება · {sections.length} სავარჯიშოს ტიპი</strong></p>}
  </div>;
}
