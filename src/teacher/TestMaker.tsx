import { useEffect, useMemo, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CURRICULUM } from '../practice/curriculum';
import type { GeneratedQuestion } from '../practice/generator';
import { TEMPLATE_REGISTRY } from '../practice/templates/catalog';
import { createTestPdf } from './testMakerPdf';
import { ExerciseSections } from './ExerciseSections';
import { drawTemplate, generateSections, regenerateQuestion, SectionGenerationError, isDuplicate, newTest, testStore, totalPoints, validateContent, type SavedTest, type TestContent } from './testMakerData';

const seed = () => crypto.getRandomValues(new Uint32Array(1))[0] & 0x7fffffff;
function questionPreview(id: string, value: number): GeneratedQuestion | null { try { return drawTemplate(id,value); } catch { return null; } }

export function TestMaker({ client, teacherId }: { client: SupabaseClient | null; teacherId: string | null }) {
  const store = useMemo(() => client && teacherId ? testStore(client,teacherId) : null, [client,teacherId]);
  const [saved, setSaved] = useState<SavedTest[]>([]);
  const [current, setCurrent] = useState<SavedTest | null>(null);
  const [doc, setDoc] = useState<TestContent>(newTest);
  const [tab, setTab] = useState<'sections'|'bank'|'settings'|'drafts'>('sections');
  const [grade, setGrade] = useState('1'); const [topic, setTopic] = useState(''); const [unit, setUnit] = useState(''); const [sub, setSub] = useState('');
  const [difficulty, setDifficulty] = useState(''); const [kind, setKind] = useState(''); const [search, setSearch] = useState('');
  const [seeds, setSeeds] = useState<Record<string, number>>({}); const [quantity, setQuantity] = useState<Record<string, number>>({});
  const defaultPoints = doc.defaultPoints ?? 1; const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [dirty, setDirty] = useState(false); const [confirm, setConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const busyRef = useRef(false);
  const [error, setError] = useState(''); const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<{ student:string; key:string } | null>(null);
  const urls = useRef<string[]>([]);
  const clearPreview = () => { urls.current.forEach(URL.revokeObjectURL); urls.current=[]; setPreview(null); };
  useEffect(() => () => { urls.current.forEach(URL.revokeObjectURL); }, []);
  useEffect(() => { let active = true; if (!store) { setLoading(false); return () => { active = false; }; } setLoading(true); store.list().then((rows) => { if (active) setSaved(rows); }).catch(() => { if (active) setError('შენახული ტესტები ვერ ჩაიტვირთა. შეამოწმეთ წვდომა და კავშირი.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [store]);
  const run = async (work: () => Promise<void>) => { if (busyRef.current) return; busyRef.current=true; setBusy(true); setError(''); setMessage(''); try { await work(); } catch (e) { const detail = e instanceof Error ? e.message : ''; setError(e instanceof SectionGenerationError ? `ტიპი ${e.sectionIndex + 1}: მოთხოვნილი ${e.requested} განსხვავებული დავალებიდან მოიძებნა ${e.produced}. შეამცირეთ რაოდენობა ან აირჩიეთ სხვა შაბლონი; ტესტი არ შეცვლილა.` : detail === 'Invalid sections' ? 'შეამოწმეთ ტიპების შაბლონები და რაოდენობები. თითოეული რაოდენობა უნდა იყოს 1–100, ხოლო ჯამი მაქსიმუმ 100.' : detail === 'Invalid points' ? 'ნაგულისხმევი ქულა უნდა იყოს 1–100 მთელი რიცხვი.' : detail === 'No distinct variant' ? 'ამ დავალებისთვის განსხვავებული ვარიანტი ვერ მოიძებნა. არსებული დავალება შენარჩუნებულია.' : detail.startsWith('Unsupported character') ? 'PDF ვერ შეიქმნა: არჩეულ ტექსტში შრიფტს არ აქვს საჭირო სიმბოლო. შეცვალეთ ტექსტი ან ამოიღეთ შესაბამისი დავალება.' : detail === 'Question too long for one page' ? 'PDF ვერ შეიქმნა: დავალება ერთ გვერდზე არ ეტევა. ამოიღეთ ან შეცვალეთ იგი.' : 'მოქმედების შედეგი ვერ დადასტურდა. შეამოწმეთ კავშირი, მონაცემები და წვდომა. შესაძლოა ჩანაწერი სხვა ფანჯარაში შეიცვალა.'); } finally { busyRef.current=false; setBusy(false); } };
  const change = (next: TestContent) => { setDoc(next); setDirty(true); setConfirm(null); setMessage(''); setError(''); clearPreview(); };
  const selectedGrade = CURRICULUM.find((item) => item.grade === Number(grade));
  const selectedTopic = selectedGrade?.topics.find((item) => item.id === topic);
  const selectedUnit = selectedTopic?.units.find((item) => item.id === unit);
  const templates = useMemo(() => sub && selectedGrade && selectedTopic ? TEMPLATE_REGISTRY.forSubtopic({ grade:selectedGrade.grade, topicId:selectedTopic.id, subtopicId:sub }) : [], [sub,selectedGrade,selectedTopic]);
  // Stable generated instances: a new seed is chosen only by the tutor.
  const examples = useMemo(() => templates.map((template) => ({ template, question: questionPreview(template.id,seeds[template.id] ?? 1) })), [templates,seeds]);
  const visible = examples.filter(({ template, question }) => question && (!difficulty || (template.difficulty ?? 1) === Number(difficulty)) && (!kind || (question.answerMode ?? 'choice') === kind) && (!search.trim() || question.prompt.toLocaleLowerCase('ka').includes(search.trim().toLocaleLowerCase('ka'))));
  const add = (question: GeneratedQuestion, count: number) => {
    if (!Number.isInteger(count) || count < 1 || count > 20 || !Number.isInteger(defaultPoints) || defaultPoints < 1 || defaultPoints > 100) { setError('რაოდენობა უნდა იყოს 1–20, ქულა კი 1–100.'); return; }
    const next = [...doc.questions]; let skipped = 0;
    for (let i=0;i<count;i++) {
      let q: GeneratedQuestion | null = i === 0 ? question : null;
      for (let attempt=0; !q && attempt<30; attempt++) { const candidate = questionPreview(question.templateId,seed()); if (candidate && (allowDuplicates || !isDuplicate({...doc,questions:next},candidate))) q=candidate; }
      if (!q || (!allowDuplicates && isDuplicate({...doc,questions:next},q))) { skipped++; continue; }
      if (next.length >= 100) { skipped += count-i; break; }
      next.push({ question:q, points:defaultPoints });
    }
    if (next.length !== doc.questions.length) change({ ...doc, questions:next });
    setMessage(skipped ? `${count-skipped} დაემატა; ${skipped} გამოტოვებულია დუბლირების ან ლიმიტის გამო.` : `${count} დავალება დაემატა.`);
  };
  const save = () => { if (!store) return; void run(async () => { validateContent(doc); const result = await store.save(doc,current); setCurrent(result); setDoc(result.content); setDirty(false); setSaved(await store.list()); setMessage('ტესტი შენახულია.'); }); };
  const open = (row: SavedTest | null) => { setCurrent(row); setDoc(row ? structuredClone(row.content) : newTest()); setDirty(false); setConfirm(null); setTab('sections'); clearPreview(); };
  const requestOpen = (row: SavedTest | null) => { if (dirty) { setConfirm(row ? `open:${row.id}` : 'new'); return; } open(row); };
  const createCombined = () => void run(async () => {
    const generated = await generateSections(doc.sections ?? [], defaultPoints, seed);
    change({ ...doc, questions:generated }); setTab('settings'); setMessage(`შეიქმნა ${generated.length} განსხვავებული დავალება.`);
  });
  const requestCombined = () => { if (doc.questions.length) setConfirm('generate'); else createCombined(); };
  const reroll = (index: number) => void run(async () => {
    const replacement = await regenerateQuestion(doc.questions[index], doc.questions.filter((_, i) => i !== index), seed);
    change({ ...doc, questions:doc.questions.map((item, i) => i === index ? replacement : item) }); setMessage('დავალების ახალი ვარიანტი შეიქმნა.');
  });
  const preparePdfs = () => void run(async () => {
    validateContent(doc,true);
    const [studentBytes,keyBytes] = await Promise.all([createTestPdf(doc,false),createTestPdf(doc,true)]);
    clearPreview(); const student=URL.createObjectURL(new Blob([new Uint8Array(studentBytes)],{type:'application/pdf'})); const key=URL.createObjectURL(new Blob([new Uint8Array(keyBytes)],{type:'application/pdf'})); urls.current=[student,key]; setPreview({student,key});
  });
  return <section className="teacher-panel test-maker"><h2>ტესტის შემქმნელი</h2><fieldset className="test-maker-fields" disabled={busy}>
    {loading && <p role="status">ტესტები იტვირთება…</p>}{error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    {!store && <p className="teacher-notice">შეგიძლიათ შექმნათ ტესტი და ჩამოტვირთოთ ორივე PDF. ტესტი არ ინახება: გვერდიდან გასვლისას ან განახლებისას ცვლილებები დაიკარგება. მონახაზების შესანახად საჭიროა მასწავლებლის ანგარიში და შესაბამისი მონაცემთა ბაზა.</p>}
    <div className="test-maker-actions"><button type="button" className="teacher-cancel" onClick={() => requestOpen(null)} disabled={busy}>ახალი ტესტი</button>{store && <><button type="button" className="teacher-cancel" onClick={() => setTab('drafts')} disabled={busy}>შენახული ტესტები</button><button type="button" className="teacher-button" onClick={save} disabled={busy || loading}>შენახვა</button></>}<span>{dirty ? 'შეუნახავი ცვლილებები' : current ? 'შენახულია' : 'ახალი ტესტი'}</span></div>
    <div className="test-maker-actions"><button type="button" className="teacher-cancel" onClick={() => setTab('sections')}>სავარჯიშოს ტიპები</button><button type="button" className="teacher-cancel" onClick={() => setTab('bank')}>დავალებების ბანკი</button><button type="button" className="teacher-cancel" onClick={() => setTab('settings')}>პარამეტრები და დალაგება</button><span>{doc.questions.length} დავალება · {totalPoints(doc)} ქულა</span></div>
    {confirm && (confirm === 'new' || confirm.startsWith('open:')) && <div className="teacher-notice">შეუნახავი ცვლილებები დაიკარგება. გავაგრძელოთ? <button className="teacher-cancel" type="button" onClick={() => open(confirm === 'new' ? null : saved.find((r) => r.id === confirm.slice(5)) ?? null)}>დიახ</button> <button className="teacher-cancel" type="button" onClick={() => setConfirm(null)}>არა</button></div>}
    {tab === 'drafts' && store && <div><h3>შენახული ტესტები</h3>{!saved.length ? <p>შენახული ტესტები არ არის.</p> : <ul className="teacher-list">{saved.map((row) => <li key={row.id}><strong>{row.content.title}</strong><div className="test-maker-actions"><button type="button" className="teacher-cancel" onClick={() => requestOpen(row)} disabled={busy}>გახსნა</button><button type="button" className="teacher-cancel" disabled={busy} onClick={() => void run(async () => { const copy=await store.save({...row.content,title:`${row.content.title.slice(0,140)} (ასლი)`},null); setSaved(await store.list()); setMessage(`შეიქმნა ასლი: ${copy.content.title}`); })}>ასლის შექმნა</button>{confirm === `delete:${row.id}` ? <><span>წავშალოთ?</span><button className="teacher-cancel" type="button" disabled={busy} onClick={() => void run(async () => { await store.delete(row); setSaved(await store.list()); if (current?.id === row.id) open(null); setConfirm(null); setMessage('ტესტი წაიშალა.'); })}>დიახ, წაშლა</button><button className="teacher-cancel" type="button" onClick={() => setConfirm(null)}>არა</button></> : <button type="button" className="teacher-cancel" disabled={busy} onClick={() => setConfirm(`delete:${row.id}`)}>წაშლა</button>}</div></li>)}</ul>}</div>}
    {tab === 'sections' && <div>
      <ExerciseSections sections={doc.sections ?? []} onChange={(sections) => change({...doc,sections})} onGenerate={requestCombined} />
      <label className="test-maker-section-points">ნაგულისხმევი ქულა თითო დავალებაზე<input type="number" min={1} max={100} step={1} value={defaultPoints} onChange={(e)=>change({...doc,defaultPoints:Number(e.target.value)})} /></label>
      {doc.questions.length > 0 && <p>ტიპების შეცვლა არსებულ დავალებებს არ ცვლის, სანამ ხელახლა არ შექმნით ტესტს.</p>}
      {confirm === 'generate' && <div className="teacher-notice">ახალი ტესტი ჩაანაცვლებს არსებულ დავალებებს და მათ ცვლილებებს. გავაგრძელოთ? <button type="button" className="teacher-cancel" onClick={createCombined}>დიახ, შექმნა</button> <button type="button" className="teacher-cancel" onClick={() => setConfirm(null)}>არა</button></div>}
    </div>}
    {tab === 'bank' && <div><p className="teacher-notice">ქაღალდზე მხარდაჭერილია ტექსტური, ასარჩევი და შესაყვანი დავალებები. სურათებზე და ინტერაქტიულ ელემენტებზე დამოკიდებული დავალებები ამ სიაში არ შედის.</p>
      <div className="test-maker-grid"><label>კლასი<select value={grade} onChange={(e) => { setGrade(e.target.value); setTopic(''); setUnit(''); setSub(''); }}>{CURRICULUM.map((g) => <option key={g.grade} value={g.grade}>{g.label}</option>)}</select></label>
      <label>თემა<select value={topic} onChange={(e) => { setTopic(e.target.value); setUnit(''); setSub(''); }}><option value="">აირჩიეთ თემა</option>{selectedGrade?.topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
      <label>თავი<select value={unit} onChange={(e) => { setUnit(e.target.value); setSub(''); }}><option value="">აირჩიეთ თავი</option>{selectedTopic?.units.map((u) => <option key={u.id} value={u.id}>{u.title}</option>)}</select></label>
      <label>ქვეთემა<select value={sub} onChange={(e) => setSub(e.target.value)}><option value="">აირჩიეთ ქვეთემა</option>{selectedUnit?.subtopics.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
      <label>სირთულე<select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option value="">ყველა</option>{[1,2,3].map((n)=><option value={n} key={n}>{n}</option>)}</select></label>
      <label>პასუხის ტიპი<select value={kind} onChange={(e) => setKind(e.target.value)}><option value="">ყველა</option><option value="choice">არჩევა</option><option value="number">ჩასაწერი</option><option value="multi">რამდენიმე პასუხი</option><option value="time">დრო</option></select></label>
      <label>ძიება<input value={search} onChange={(e)=>setSearch(e.target.value)} /></label><label>ნაგულისხმევი ქულა<input type="number" min={1} max={100} value={defaultPoints} onChange={(e)=>change({...doc,defaultPoints:Number(e.target.value)})}/></label></div>
      <label className="test-maker-check"><input type="checkbox" checked={allowDuplicates} onChange={(e)=>setAllowDuplicates(e.target.checked)} />დუბლირების დაშვება</label>
      {!sub ? <p>აირჩიეთ კლასი, თემა, თავი და ქვეთემა.</p> : !visible.length ? <p>ამ ფილტრებით ქაღალდისთვის გამოსადეგი დავალება ვერ მოიძებნა.</p> : <ul className="test-maker-bank">{visible.map(({template,question}) => question && <li key={template.id}><p>{question.prompt}</p>{question.options.length>0 && <ol type="A">{question.options.map((o,i)=><li key={i}>{o}</li>)}</ol>}<div className="test-maker-actions"><button type="button" className="teacher-cancel" onClick={() => setSeeds((v)=>({...v,[template.id]:seed()}))}>ახალი ვარიანტი</button><label>რაოდენობა<input type="number" min={1} max={20} value={quantity[template.id] ?? 1} onChange={(e)=>setQuantity((v)=>({...v,[template.id]:Number(e.target.value)}))} /></label><button type="button" className="teacher-button" onClick={()=>add(question,quantity[template.id] ?? 1)}>დამატება</button>{isDuplicate(doc,question) && <span>უკვე დამატებულია</span>}</div></li>)}</ul>}
      {sub && examples.some((v)=>!v.question) && <p>ზოგი დავალება ქაღალდის ფორმატში არ არის ხელმისაწვდომი ან ვარიანტის შექმნა ვერ მოხერხდა.</p>}
    </div>}
    {tab === 'settings' && <div><h3>ტესტის პარამეტრები</h3><div className="test-maker-grid">
      <label>სათაური<input value={doc.title} maxLength={150} onChange={(e)=>change({...doc,title:e.target.value})}/></label><label>საფეხური<select value={doc.grade ?? ''} onChange={(e)=>change({...doc,grade:e.target.value ? Number(e.target.value) : null})}><option value="">არ არის მითითებული</option>{[1,2,3,4,5,6,7].map((g)=><option value={g} key={g}>{g}</option>)}</select></label>
      <label>დრო წუთებში (არასავალდებულო)<input type="number" min={1} max={600} value={doc.minutes ?? ''} onChange={(e)=>change({...doc,minutes:e.target.value ? Number(e.target.value) : null})}/></label><label>ინსტრუქცია<textarea maxLength={2000} value={doc.instructions} onChange={(e)=>change({...doc,instructions:e.target.value})}/></label></div>
      {([['nameField','სახელის ველი'],['dateField','თარიღის ველი'],['branding','Axiom Academy']] as const).map(([field,label])=><label key={field} className="test-maker-check"><input type="checkbox" checked={doc[field]} onChange={(e)=>change({...doc,[field]:e.target.checked})}/>{label}</label>)}
      <h3>დავალებების რიგი</h3>{!doc.questions.length && <p>დავალებები ჯერ არ არის.</p>}<ol className="test-maker-bank">{doc.questions.map((item,index)=><li key={`${item.question.id}-${index}`}><p>{index + 1}. {item.question.prompt}</p>{item.question.options.length > 0 && <ol type="A">{item.question.options.map((option, i) => <li key={i}>{option}</li>)}</ol>}<div className="test-maker-actions"><button type="button" className="teacher-cancel" onClick={() => reroll(index)}>ახალი ვარიანტი</button><label>ქულა<input type="number" min={1} max={100} value={item.points} onChange={(e)=>change({...doc,questions:doc.questions.map((v,i)=>i===index?{...v,points:Number(e.target.value)}:v)})}/></label><button type="button" className="teacher-cancel" disabled={index===0} onClick={()=>{const list=[...doc.questions]; [list[index-1],list[index]]=[list[index],list[index-1]]; change({...doc,questions:list});}}>ზემოთ</button><button type="button" className="teacher-cancel" disabled={index===doc.questions.length-1} onClick={()=>{const list=[...doc.questions]; [list[index+1],list[index]]=[list[index],list[index+1]]; change({...doc,questions:list});}}>ქვემოთ</button><button type="button" className="teacher-cancel" onClick={()=>change({...doc,questions:doc.questions.filter((_,i)=>i!==index)})}>ამოღება</button></div></li>)}</ol>
      <div className="test-maker-export"><h3>PDF ფაილები</h3><p>შექმენით ფაილები და შემდეგ ჩამოტვირთეთ თითოეული ცალ-ცალკე.</p>
        <button type="button" className="teacher-button" onClick={preparePdfs} disabled={busy || !doc.questions.length}>{busy ? 'PDF-ები მზადდება…' : 'PDF-ების შექმნა'}</button>
        {preview && <div><div className="test-maker-actions"><a className="teacher-button" href={preview.student} download="axiom-test.pdf">მოსწავლის PDF ჩამოტვირთვა</a><a className="teacher-button" href={preview.key} download="axiom-answer-key.pdf">პასუხების PDF ჩამოტვირთვა</a></div><p>თუ ჩაშენებულ ფანჯარაში ჩამოტვირთვა იბლოკება, გახსენით საიტი ბრაუზერის ცალკე ჩანართში და ხელახლა შექმენით PDF.</p></div>}
      </div>
    </div>}
  </fieldset></section>;
}
