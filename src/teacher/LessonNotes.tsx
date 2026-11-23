import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { connectedLessonNotes, previewLessonNotes, type LessonNote, type NoteVisibility } from './lessonNotes';

function displayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'თარიღი მიუწვდომელია' : new Intl.DateTimeFormat('ka-GE', { dateStyle: 'medium', timeZone: 'Asia/Tbilisi' }).format(date);
}

export function LessonNotes({ client, teacherId, studentId, authorName, test }: { client: SupabaseClient | null; teacherId: string | null; studentId: string; authorName: string; test: boolean }) {
  const store = useMemo(() => test ? previewLessonNotes() : client && teacherId ? connectedLessonNotes(client, studentId, teacherId) : null, [test, client, studentId, teacherId]);
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  const [message, setMessage] = useState('');
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<NoteVisibility>('tutor');
  const [editing, setEditing] = useState<LessonNote | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setLoadFailed(false);
    if (!store) { setLoading(false); setLoadFailed(true); setError('ჩანაწერები ამ ეტაპზე მიუწვდომელია.'); return () => { active = false; }; }
    store.list().then((rows) => { if (active) setNotes(rows); }).catch(() => { if (active) { setLoadFailed(true); setError('ჩანაწერები ვერ ჩაიტვირთა. შეამოწმეთ წვდომა და სცადეთ ხელახლა.'); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [store, reload]);
  const run = async (action: () => Promise<void>) => {
    if (busyRef.current || loading || !store) return;
    busyRef.current = true; setBusy(true); setError(''); setMessage('');
    try { await action(); } catch { setError('მოქმედება ვერ შესრულდა. შესაძლოა წვდომა შეიცვალა ან ჩანაწერი სხვა ფანჯარაში განახლდა. გადატვირთეთ სია და სცადეთ ხელახლა.'); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const updateRow = (row: LessonNote) => setNotes((current) => [row, ...current.filter((item) => item.id !== row.id)].sort((a, b) => b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id)));
  const resetForm = () => { setEditing(null); setText(''); setVisibility('tutor'); };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 2000 || (visibility !== 'tutor' && visibility !== 'parent')) { setMessage(''); setError('შეიყვანეთ ჩანაწერი (მაქსიმუმ 2000 სიმბოლო) და აირჩიეთ ხილვადობა.'); return; }
    void run(async () => { const row = await store!.save({ text: trimmed, visibility }, editing); updateRow(row); resetForm(); setMessage('ჩანაწერი შენახულია როგორც მონახაზი.'); });
  };
  return <section className="teacher-panel teacher-info-panel teacher-notes" aria-label="გაკვეთილის ჩანაწერები">
    <h2>გაკვეთილის ჩანაწერები</h2>
    {test ? <p className="teacher-notice">ჩანაწერები არ არის პირადი, არ ინახება და გვერდიდან გასვლისას იშლება. არ შეიყვანოთ ნამდვილი პირადი ინფორმაცია. მშობელს არაფერი ეგზავნება.</p> : <p className="teacher-notice">თქვენ ხედავთ მხოლოდ თქვენს ჩანაწერებს. მშობლისთვის განკუთვნილი მონახაზი ხილული გახდება მხოლოდ გამოქვეყნების შემდეგ. გამოქვეყნებული ჩანაწერის შეცვლა მას ხელახლა მონახაზად აქცევს. მშობლის გვერდი ჯერ არ არის ხელმისაწვდომი.</p>}
    {loading && <p role="status">ჩანაწერები იტვირთება…</p>}
    {error && <div role="alert"><p>{error}</p><button type="button" className="teacher-cancel" onClick={() => { resetForm(); setReload((value) => value + 1); }} disabled={busy}>სიის ხელახლა ჩატვირთვა</button></div>}
    {message && <p role="status">{message}</p>}
    {!loading && !loadFailed && <>
      <form className="teacher-note-form" onSubmit={submit}>
        <h3>{editing ? 'ჩანაწერის შეცვლა' : 'ახალი ჩანაწერი'}</h3>
        {editing?.published_at && <p className="teacher-notice">შენახვისას გამოქვეყნებული ჩანაწერი მშობლისთვის დაიმალება, სანამ ხელახლა არ გამოაქვეყნებთ.</p>}
        <label>დაკვირვება<textarea rows={3} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} disabled={busy} /></label>
        <label>ხილვადობა<select value={visibility} onChange={(e) => setVisibility(e.target.value as NoteVisibility)} disabled={busy}><option value="tutor">მხოლოდ მასწავლებლისთვის</option><option value="parent">მშობლისთვის</option></select></label>
        <div className="teacher-note-actions"><button className="teacher-button" type="submit" disabled={busy}>მონახაზის შენახვა</button>{editing && <button className="teacher-cancel" type="button" onClick={resetForm} disabled={busy}>შეცვლის გაუქმება</button>}</div>
      </form>
      {!notes.length ? <p className="teacher-empty">ჩანაწერი ჯერ არ არის.</p> : <ul className="teacher-note-list">{notes.map((note) => <li key={note.id}>
        <p className="teacher-note-text">{note.note_text}</p><small>{displayDate(note.created_at)} · {authorName || 'მასწავლებელი'} · {note.visibility === 'tutor' ? 'მხოლოდ მასწავლებლისთვის' : note.published_at ? test ? 'ადგილობრივად გამოქვეყნებული' : 'გამოქვეყნებული' : 'მშობლისთვის · მონახაზი'}</small>
        <div className="teacher-note-actions">
          <button className="teacher-cancel" type="button" disabled={busy} onClick={() => { setEditing(note); setText(note.note_text); setVisibility(note.visibility); setDeleting(null); setMessage(''); }}>შეცვლა</button>
          {note.visibility === 'parent' && <button className="teacher-cancel" type="button" disabled={busy} onClick={() => void run(async () => { updateRow(await store!.setPublication(note, !note.published_at)); setMessage(note.published_at ? 'გამოქვეყნება გაუქმებულია.' : test ? 'ადგილობრივად გამოქვეყნდა; მშობელს არაფერი ეგზავნება.' : 'ჩანაწერი გამოქვეყნებულია.'); })}>{note.published_at ? 'გამოქვეყნების გაუქმება' : 'გამოქვეყნება'}</button>}
          {deleting === note.id ? <><span>ნამდვილად წავშალოთ?</span><button className="teacher-cancel" type="button" disabled={busy} onClick={() => void run(async () => { await store!.delete(note); setNotes((rows) => rows.filter((row) => row.id !== note.id)); if (editing?.id === note.id) resetForm(); setDeleting(null); setMessage('ჩანაწერი წაიშალა.'); })}>დიახ, წაშლა</button><button className="teacher-cancel" type="button" disabled={busy} onClick={() => setDeleting(null)}>არა</button></> : <button className="teacher-cancel" type="button" disabled={busy} onClick={() => setDeleting(note.id)}>წაშლა</button>}
        </div>
      </li>)}</ul>}
    </>}
  </section>;
}
