import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getGrade } from '../practice/curriculum';
import { hasTemplates } from '../practice/generator';
import type { GradeId, SubtopicRef } from '../practice/types';
import type { TeacherData } from './data';
import { cancelHomework, createHomework, resolveHomeworkRequest, readHomeworkMarker, rememberHomeworkMarker, clearHomeworkMarker, type HomeworkRequest } from './homework';

type Operation = { kind: 'create'; input: HomeworkRequest } | { kind: 'cancel'; id: string; revision: number };
/** Review-only UI: an uncertain response must be retried with the exact same operation. */
export function ConnectedHomework({ client, teacherId, data, onRefresh }: { client: SupabaseClient; teacherId: string; data: TeacherData; onRefresh: () => void }) {
  const [student, setStudent] = useState('');
  const [title, setTitle] = useState(''); const [instructions, setInstructions] = useState(''); const [deadline, setDeadline] = useState('');
  const [grade, setGrade] = useState<GradeId>(5); const [topicId, setTopicId] = useState(''); const [unitId, setUnitId] = useState('');
  const [selected, setSelected] = useState<SubtopicRef[]>([]);
  const [pending, setPending] = useState<Operation | null>(null); const [busy, setBusy] = useState(false); const running = useRef(false);
  const [error, setError] = useState('');
  const [marker] = useState(() => { try { return { id: readHomeworkMarker(sessionStorage, teacherId), failed: false }; } catch { return { id: null, failed: true }; } });
  const [recoveredId, setRecoveredId] = useState(marker.id);
  const [storageError, setStorageError] = useState(marker.failed);
  const [resolved, setResolved] = useState<'published' | 'abandoned' | null>(null);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const blocked = !!pending || !!recoveredId || busy || storageError || !!resolved;

  useEffect(() => {
    if (!pending && !recoveredId) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [pending, recoveredId]);
  const topic = getGrade(grade).topics.find(t => t.id === topicId); const unit = topic?.units.find(u => u.id === unitId);
  const run = async (operation: Operation) => {
    if (running.current) return;
    running.current = true; setPending(operation); setBusy(true); setError('');
    try {
      if (operation.kind === 'create') {
        await createHomework(client, operation.input);
        if (!mounted.current) return;
        clearHomeworkMarker(sessionStorage, teacherId, operation.input.requestId);
      } else await cancelHomework(client, operation.id, operation.revision);
      if (mounted.current) { setPending(null); onRefresh(); }
    } catch { if (mounted.current) setError('პასუხი ვერ დადასტურდა. ოპერაცია შესაძლოა უკვე შესრულდა. ხელახლა სცადეთ ან შეამოწმეთ მდგომარეობა; ლიმიტის შემთხვევაში დაელოდეთ და საჭიროებისას დაუკავშირდით მხარდაჭერას.'); }
    finally { running.current = false; if (mounted.current) setBusy(false); }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault(); if (blocked || running.current) return;
    const due = new Date(deadline);
    if (!data.students.some(s => s.id === student) || !title.trim() || !selected.length || selected.length > 50 || !Number.isFinite(due.getTime()) || due.getTime() <= Date.now()) { setError('აირჩიეთ მოსწავლე და 1–50 ქვეთემა, შეავსეთ სათაური და მომავალი ვადა.'); return; }
    try {
      const requestId = crypto.randomUUID();
      rememberHomeworkMarker(sessionStorage, teacherId, requestId);
      void run({ kind: 'create', input: { requestId, studentId: student, title: title.trim(), instructions: instructions.trim(), dueAt: due.toISOString(), subtopics: selected } });
    } catch { setStorageError(true); setError('მოთხოვნის უსაფრთხოდ შენახვა ვერ მოხერხდა. ახალი დავალება არ გაგზავნილა; შეამოწმეთ ბრაუზერის საცავი და არსებული დავალებები.'); }
  };
  const reconcile = async () => {
    const requestId = recoveredId ?? (pending?.kind === 'create' ? pending.input.requestId : null);
    if (!requestId || running.current) return;
    running.current = true; setBusy(true); setError('');
    try {
      const outcome = await resolveHomeworkRequest(client, requestId);
      if (!mounted.current) return;
      clearHomeworkMarker(sessionStorage, teacherId, requestId);
      setPending(null); setRecoveredId(null); setResolved(outcome);
    } catch { if (mounted.current) setError('მდგომარეობა ვერ დადასტურდა. ხელახლა სცადეთ; ლიმიტის შემთხვევაში დაელოდეთ და საჭიროებისას დაუკავშირდით მხარდაჭერას. მანამდე ახალ მოთხოვნას ნუ გაგზავნით.'); }
    finally { running.current = false; if (mounted.current) setBusy(false); }
  };
  return <>
    <section className="teacher-panel"><h2>დავალების შექმნა</h2><p>თითოეული ქვეთემა ცალკე დავალებად გამოჩნდება. ვადა მითითებულია თქვენი მოწყობილობის დროით.</p>
      <form className="teacher-assignment-form" onSubmit={submit}><fieldset disabled={blocked}>
        <label>მოსწავლე<select required value={student} onChange={e => setStudent(e.target.value)}><option value="">აირჩიეთ მოსწავლე</option>{data.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label>სათაური<input required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} /></label>
        <label>მითითება<textarea maxLength={1000} value={instructions} onChange={e => setInstructions(e.target.value)} /></label>
        <label>კლასი<select value={grade} onChange={e => { setGrade(Number(e.target.value) as GradeId); setTopicId(''); setUnitId(''); }}>{[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} კლასი</option>)}</select></label>
        <label>თემა<select value={topicId} onChange={e => { setTopicId(e.target.value); setUnitId(''); }}><option value="">აირჩიეთ თემა</option>{getGrade(grade).topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
        <label>ნაწილი<select value={unitId} onChange={e => setUnitId(e.target.value)}><option value="">აირჩიეთ ნაწილი</option>{topic?.units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}</select></label>
        <fieldset className="teacher-subtopics"><legend>ქვეთემები</legend>{unit?.subtopics.filter(sub => hasTemplates({ grade, topicId, subtopicId: sub.id })).map(sub => <label key={sub.id}><input type="checkbox" checked={selected.some(r => r.grade === grade && r.topicId === topicId && r.subtopicId === sub.id)} onChange={e => { const checked = e.target.checked; setSelected(old => checked ? [...old, { grade, topicId, subtopicId: sub.id }] : old.filter(r => !(r.grade === grade && r.topicId === topicId && r.subtopicId === sub.id))); }} />{sub.title}</label>)}</fieldset>
        <p>არჩეულია: {selected.length} / 50</p><ul>{selected.map(r => <li key={`${r.grade}/${r.topicId}/${r.subtopicId}`}>{r.grade} · {getGrade(r.grade).topics.find(t => t.id === r.topicId)?.title} / {r.subtopicId} <button type="button" onClick={() => setSelected(old => old.filter(x => x !== r))}>წაშლა</button></li>)}</ul>
        <label>ვადა<input required type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} /></label><button className="teacher-button" type="submit">დავალების გაგზავნა</button>
      </fieldset></form>
      {storageError && !error && <p role="alert">მოთხოვნის ჩანაწერი ვერ იკითხება. ახალი დავალების გაგზავნამდე შეამოწმეთ ბრაუზერის საცავი და დაუკავშირდით მხარდაჭერას.</p>}
      {error && <p role="alert">{error}</p>}
      {pending && <><p>შეგიძლიათ იგივე მოთხოვნა გაიმეოროთ.</p><button className="teacher-button" type="button" disabled={busy} onClick={() => void run(pending)}>ხელახლა ცდა</button></>}
      {(recoveredId || pending?.kind === 'create') && <><p>შეამოწმეთ წინა მოთხოვნა. თუ ის არ შესრულდა, შემოწმება მის დაგვიანებულ გაგზავნასაც შეაჩერებს. მხოლოდ შემთხვევითი იდენტიფიკატორი ინახება ამ ჩანართში.</p><button className="teacher-button" type="button" disabled={busy} onClick={() => void reconcile()}>მოთხოვნის შემოწმება</button></>}
      {resolved && <div role="status"><p>{resolved === 'published' ? 'წინა მოთხოვნა შესრულდა. განაახლეთ სია ახალი მოთხოვნის გაგზავნამდე.' : 'წინა მოთხოვნა არ შესრულდა და ვეღარ შესრულდება. განაახლეთ სია ახალი მოთხოვნის გაგზავნამდე.'}</p><button className="teacher-button" type="button" onClick={onRefresh}>სიის განახლება და გაგრძელება</button></div>}
    </section>
    <section className="teacher-panel"><h2>თქვენი დავალებები</h2><p className="teacher-notice">სესიები და პასუხები მოსწავლის მოწყობილობაზე ფასდება; ისინი სერვერის მიერ დადასტურებული არ არის და შესრულების მტკიცებულებას არ წარმოადგენს. გაუქმების შემდეგ ძველი სესიები ინახება.</p>
      <button className="teacher-button" type="button" disabled={blocked} onClick={onRefresh}>სიის განახლება</button>
      {data.assignments.length ? <ul className="teacher-list">{data.assignments.map(a => <li key={a.id}><div><strong>{a.title}</strong><p>{data.students.find(s => s.id === a.studentId)?.name} · {a.grade} კლასი · {a.subunitId}</p>{a.instructions && <p>{a.instructions}</p>}<small>ვადა: {new Date(a.dueAt).toLocaleString()} · {a.status === 'cancelled' ? 'გაუქმებული' : 'აქტიური'} · {data.attempts.filter(at => at.assignmentId === a.id && at.studentId === a.studentId).length} დაუდასტურებელი სესია</small></div>{a.status === 'published' && Number.isSafeInteger(a.revision) && <button type="button" className="teacher-cancel" disabled={blocked} onClick={() => void run({kind:'cancel',id:a.id,revision:a.revision!})}>გაუქმება</button>}</li>)}</ul> : <p>დავალებები ვერ მოიძებნა.</p>}
    </section>
  </>;
}
