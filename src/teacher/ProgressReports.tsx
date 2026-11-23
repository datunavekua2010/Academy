import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { TeacherStudent } from './data';
import { accuracy, buildProgressReport, reportBounds, reportMessage, type ProgressReport } from './progressReport';
import { loadLocalReportRows, loadReportRows } from './reportData';

type Props = { students: TeacherStudent[]; client: SupabaseClient | null; teacherId: string | null; test: boolean; initialStudentId?: string | null };

export function ProgressReports({ students, client, teacherId, test, initialStudentId = null }: Props) {
  const messageId = useId();
  const messageField = useRef<HTMLTextAreaElement>(null);
  const [studentId, setStudentId] = useState(() => students.some((student) => student.id === initialStudentId) ? initialStudentId! : '');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [report, setReport] = useState<ProgressReport | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const request = useRef(0);
  useEffect(() => {
    const clearPrintMode = () => document.body.classList.remove('axiom-report-printing');
    window.addEventListener('afterprint', clearPrintMode);
    return () => { request.current++; clearPrintMode(); window.removeEventListener('afterprint', clearPrintMode); };
  }, []);
  const reset = () => { request.current++; setReport(null); setMessage(''); setLoading(false); setError(''); setFeedback(''); };
  const generate = async (event: FormEvent) => {
    event.preventDefault();
    reset();
    const student = students.find((item) => item.id === studentId);
    if (!student || (!test && (!client || !teacherId))) { setError('აირჩიეთ თქვენთან დაკავშირებული მოსწავლე.'); return; }
    try { reportBounds(start, end); } catch { setError('მიუთითეთ სწორი პერიოდი 2015 წლიდან; დაწყების თარიღი არ უნდა აღემატებოდეს დასრულების თარიღს.'); return; }
    const current = ++request.current;
    setLoading(true);
    try {
      const rows = test ? await Promise.resolve().then(() => loadLocalReportRows(studentId)) : await loadReportRows(client!, teacherId!, studentId);
      if (request.current !== current) return;
      const result = buildProgressReport(rows, studentId, student.name ?? '', start, end, test);
      setReport(result); setMessage(reportMessage(result));
    } catch { if (request.current === current) setError('მონაცემები ვერ ჩაიტვირთა ან მოსწავლეზე წვდომა აღარ გაქვთ. შეამოწმეთ კავშირი და სცადეთ თავიდან.'); }
    finally { if (request.current === current) setLoading(false); }
  };
  const print = () => {
    try {
      if (typeof window.print !== 'function') throw new Error('Print unavailable');
      document.body.classList.add('axiom-report-printing');
      setFeedback('ბეჭდვის ფანჯარაში აირჩიეთ PDF-ად შენახვა.');
      window.print();
    } catch {
      document.body.classList.remove('axiom-report-printing');
      setFeedback('ბეჭდვის ფანჯარა ვერ გაიხსნა. სცადეთ სხვა ბრაუზერი ან დააკოპირეთ ტექსტი.');
    }
  };
  const copy = async () => {
    const field = messageField.current;
    if (!field) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const selectionStart = field.selectionStart, selectionEnd = field.selectionEnd;
    let copied = false;
    // Try the synchronous selection-based method while the click's user gesture
    // is still active. It can work when an embedded preview blocks Clipboard API.
    try {
      field.focus({ preventScroll: true });
      field.select();
      copied = typeof document.execCommand === 'function' && document.execCommand('copy');
    } catch { /* Try the modern Clipboard API below. */ }
    if (!copied) {
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(field.value);
        copied = true;
      } catch { /* Keep the selected text ready for manual copying. */ }
    }
    if (!field.isConnected) return;
    if (copied) {
      field.setSelectionRange(selectionStart, selectionEnd);
      previousFocus?.focus({ preventScroll: true });
      setFeedback('ტექსტი დაკოპირდა. შეტყობინება არ გაგზავნილა.');
    } else {
      field.focus({ preventScroll: true });
      field.select();
      setFeedback('კოპირება ვერ მოხერხდა. ტექსტი მონიშნულია — დააჭირეთ Ctrl+C ან ⌘+C; ტელეფონზე აირჩიეთ „კოპირება“.');
    }
  };
  return <>
    <section className="teacher-panel teacher-report">
      <h2>პროგრესის ანგარიში</h2>
      <p>{test ? 'ანგარიში მხოლოდ ამ ბრაუზერში შენახულ სესიებს იყენებს (ინახება მაქსიმუმ 400 სესია).' : 'აირჩიეთ თქვენთან დაკავშირებული მოსწავლე და პერიოდი. ანგარიში იყენებს მხოლოდ შენახულ ვარჯიშის პასუხებს და მოწყობილობის მიერ ჩაწერილ დროს.'}</p>
      <p className="teacher-notice">პასუხები მოწმდება მოწყობილობაზე და სერვერის მიერ არ არის დადასტურებული. შეუნახავი სესიები არ ჩანს. ანგარიში არ ნიშნავს ცოდნის ათვისების დადასტურებას.</p>
      <form className="teacher-report-filters" onSubmit={generate}>
        <label>მოსწავლე<select required value={studentId} onChange={(e) => { reset(); setStudentId(e.target.value); }}><option value="">აირჩიეთ მოსწავლე</option>{students.map((s) => <option key={s.id} value={s.id}>{s.name?.trim() || 'მოსწავლე'}</option>)}</select></label>
        <label>დაწყების თარიღი<input required type="date" min="2015-01-01" max="9998-12-31" value={start} onChange={(e) => { reset(); setStart(e.target.value); }} /></label>
        <label>დასრულების თარიღი<input required type="date" min="2015-01-01" max="9998-12-31" value={end} onChange={(e) => { reset(); setEnd(e.target.value); }} /></label>
        <button className="teacher-button" type="submit" disabled={loading || !students.length}>ანგარიშის შექმნა</button>
      </form>
      {initialStudentId && !students.some((student) => student.id === initialStudentId) && <p role="alert">მოსწავლე ვერ მოიძებნა ან თქვენთან არ არის დაკავშირებული.</p>}
      {!students.length && <p className="teacher-empty">დაკავშირებული მოსწავლეები არ არიან.</p>}
      {loading && <p role="status">აქტივობა იტვირთება…</p>}
      {error && <p role="alert">{error}</p>}
    </section>
    {report && <section className="teacher-panel teacher-info-panel teacher-report-preview" aria-label="ანგარიშის გადახედვა">
      <p className="teacher-eyebrow">Axiom Academy {report.test ? '· ადგილობრივი' : ''}</p>
      <h2>პროგრესის ანგარიში</h2>
      <p><strong>{report.name}</strong> · {report.start} — {report.end} · თბილისის დრო</p>
      <p className="teacher-notice">ქვემოთ მოცემულია ავტომატურად დათვლილი, სერვერის მიერ დაუდასტურებელი შედეგები. ტექსტის რედაქტირება მათ არ ცვლის.</p>
      <div className="teacher-report-stats">
        <div><span>სწორი</span><strong>{report.correct}</strong></div><div><span>არასწორი</span><strong>{report.incorrect}</strong></div><div><span>სიზუსტე</span><strong>{accuracy(report.correct, report.incorrect)}</strong></div>
      </div>
      {report.correct + report.incorrect === 0 ? <p className="teacher-empty">არჩეულ პერიოდში დასათვლელი შენახული პასუხები არ მოიძებნა.</p> : <><h3>საკითხების მიხედვით</h3><ul className="teacher-list">{report.topics.map((topic) => <li key={topic.name}><div><strong>{topic.name}</strong><p>{topic.correct + topic.incorrect} პასუხი · სწორი {topic.correct} · არასწორი {topic.incorrect} · {accuracy(topic.correct, topic.incorrect)}</p></div></li>)}</ul></>}
      {report.excluded > 0 && <p className="teacher-notice">ზოგი ჩანაწერი არასრული ან ურთიერთსაწინააღმდეგოა და დათვლაში არ შედის.</p>}
      {report.topics.some((topic) => topic.metadataMissing) && <p className="teacher-notice">ზოგი პასუხის თემის ინფორმაცია მიუწვდომელია.</p>}
      <label htmlFor={messageId}>გასაზიარებელი ტექსტი</label>
      <div className="teacher-message-field">
        <textarea ref={messageField} id={messageId} rows={12} value={message} onChange={(e) => { setMessage(e.target.value); setFeedback(''); }} />
        <button className="teacher-copy-icon" type="button" onClick={copy} disabled={!message.trim()} aria-label="ტექსტის კოპირება" title="ტექსტის კოპირება">
          <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
        </button>
      </div>
      <p>გადაამოწმეთ ტექსტი და მიმღები. გაზიარება მხოლოდ თქვენი მოქმედებით იწყება; შეტყობინების გაგზავნას ან მიღებას ეს გვერდი ვერ ადასტურებს.</p>
      <div className="teacher-report-actions">
        <button className="teacher-button" type="button" onClick={print}>ბეჭდვა / PDF-ად შენახვა</button>
        {message.trim() && <><a className="teacher-button" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" onClick={() => setFeedback('თუ WhatsApp არ გაიხსნა, დააკოპირეთ ტექსტი და გაგზავნეთ ხელით.')}>WhatsApp</a><a className="teacher-button" href={`viber://forward?text=${encodeURIComponent(message)}`} onClick={() => setFeedback('თუ Viber არ გაიხსნა, დააკოპირეთ ტექსტი და გაგზავნეთ ხელით.')}>Viber</a></>}
      </div>
      <p className="teacher-notice">PDF-ის მისაღებად ბეჭდვის ფანჯარაში აირჩიეთ PDF-ად შენახვა. თუ აპი ან ბრაუზერი გაზიარებას არ უჭერს მხარს, გამოიყენეთ კოპირება. გარე აპს გადაეცემა ზემოთ მოცემული ტექსტი.</p>
      {feedback && <p role="status">{feedback}</p>}
    </section>}
    {report && createPortal(<article className="teacher-print-document" aria-hidden="true">
      <header><p className="teacher-print-brand">Axiom Academy {report.test ? '· ადგილობრივი' : ''}</p><h1>პროგრესის ანგარიში</h1><p><strong>{report.name}</strong> · {report.start} — {report.end} · თბილისის დრო</p></header>
      <p className="teacher-print-notice">{report.test ? 'ადგილობრივი ანგარიში. ' : ''}პასუხები და მათი დრო მოწყობილობაზეა ჩაწერილი და სერვერის მიერ არ არის დადასტურებული. შეუნახავი სესიები არ ჩანს.</p>
      <h2>შენახული პასუხები</h2>
      <div className="teacher-print-stats"><p>სწორი: <strong>{report.correct}</strong></p><p>არასწორი: <strong>{report.incorrect}</strong></p><p>სიზუსტე: <strong>{accuracy(report.correct, report.incorrect)}</strong></p></div>
      {report.correct + report.incorrect === 0 ? <p>არჩეულ პერიოდში დასათვლელი შენახული პასუხები არ მოიძებნა.</p> : <><h2>საკითხების მიხედვით</h2><ul>{report.topics.map((topic, index) => <li key={`${topic.name}-${index}`}><strong>{topic.name}</strong><br />{topic.correct + topic.incorrect} პასუხი · სწორი {topic.correct} · არასწორი {topic.incorrect} · {accuracy(topic.correct, topic.incorrect)}</li>)}</ul></>}
      {report.excluded > 0 && <p>ზოგი ჩანაწერი არასრული ან ურთიერთსაწინააღმდეგოა და დათვლაში არ შედის.</p>}
      {report.topics.some((topic) => topic.metadataMissing) && <p>ზოგი პასუხის თემის ინფორმაცია მიუწვდომელია.</p>}
      <h2>მასწავლებლის ტექსტი</h2><div className="teacher-print-message">{message || 'ტექსტი არ არის მითითებული.'}</div>
    </article>, document.body)}
  </>;
}
