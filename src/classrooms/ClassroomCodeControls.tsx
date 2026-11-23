import { useEffect, useState, type FormEvent } from 'react';

/** Requests must be confirmed by the authenticated server; no local enrollment. */
export interface CodeStatus { capacity:number | null; activeStudents:number; needsReview:boolean; expiresAt:string | null }
export interface TeacherCodeService {
  status(classroomId:string): Promise<CodeStatus>;
  create(input: { classroomId: string; revision: number; expiresOn: string; capacity: number }): Promise<{ code: string }>;
  revoke(classroomId: string): Promise<void>;
}
export interface StudentCodeService { join(code: string): Promise<void> }

export function TeacherCodeControls({ classroomId, revision, service, onChanged }: { classroomId: string; revision: number; service: TeacherCodeService | null; onChanged?: () => void }) {
  const [date, setDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [issuedCode, setIssuedCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<CodeStatus | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [statusRevision, setStatusRevision] = useState(0);
  useEffect(() => {
    let active = true; setStatus(null); setStatusError(false);
    if (service) void service.status(classroomId).then(value => { if (active) setStatus(value); }).catch(() => { if (active) setStatusError(true); });
    return () => { active = false; };
  }, [service, classroomId, statusRevision]);
  const generate = async (event: FormEvent) => {
    event.preventDefault();
    if (!service || busy) return;
    const count = Number(capacity);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^[1-9]\d*$/.test(capacity) || !Number.isSafeInteger(count) || count > 2147483647) { setError('მიუთითეთ ვადა და მოსწავლეების სწორი რაოდენობა.'); return; }
    setBusy(true); setError(''); setMessage(''); setIssuedCode(''); setCopyMessage('');
    try {
      const result = await service.create({ classroomId, revision, expiresOn:date, capacity:count });
      if (!result || !/^[A-Z2-7]{26}$/.test(result.code)) throw new Error('Invalid response');
      setIssuedCode(result.code); setStatusRevision(x=>x+1); onChanged?.(); setMessage('კოდი შექმნილია. შეინახეთ ახლა; ხელახლა სანახავად ახალი კოდის შექმნა იქნება საჭირო.');
    } catch { setError('კოდის შექმნის შედეგი ვერ დადასტურდა. განაახლეთ გვერდი და გადაამოწმეთ მდგომარეობა.'); }
    finally { setBusy(false); }
  };
  const revoke = async () => {
    if (!service || busy) return;
    setBusy(true); setError(''); setMessage(''); setIssuedCode(''); setCopyMessage('');
    try { await service.revoke(classroomId); setStatusRevision(x=>x+1); onChanged?.(); setMessage('კოდი გაუქმებულია.'); }
    catch { setError('კოდის გაუქმების შედეგი ვერ დადასტურდა. გადაამოწმეთ მდგომარეობა.'); }
    finally { setBusy(false); }
  };
  return <section className="class-code-panel" aria-labelledby="class-code-title">
    <h3 id="class-code-title">კლასის კოდი</h3>
    <p>კოდით შესვლა შეუძლიათ მხოლოდ ამ მასწავლებელთან უკვე დაკავშირებულ მოსწავლეებს. ლიმიტი აღნიშნავს კლასში მყოფი მოსწავლეების რაოდენობას.</p>
    {!service && <p role="status">კოდის შექმნასა და გამოყენებას სჭირდება ავტორიზებული სერვისი.</p>}
    {service && statusError && <p role="alert">კოდის მდგომარეობა ვერ ჩაიტვირთა.</p>}
    {status && <p>მოსწავლეები: {status.activeStudents}{status.capacity === null ? ' · ლიმიტი მითითებული არ არის' : ` / ${status.capacity}`} · {status.expiresAt ? `კოდის ვადა: ${new Intl.DateTimeFormat('ka-GE',{dateStyle:'long',timeStyle:'short',timeZone:'Asia/Tbilisi'}).format(new Date(status.expiresAt))} (თბილისის დრო)` : 'აქტიური კოდი არ არის'}</p>}
    {status?.needsReview && <p role="alert">კლასის წევრობის გადამოწმებაა საჭირო.</p>}
    <form onSubmit={generate}>
      <fieldset disabled={!service || busy}>
        <label>კოდის მოქმედების ბოლო თარიღი<input type="date" required value={date} onChange={e => setDate(e.target.value)} /></label>
        <label>მოსწავლეების მაქსიმალური რაოდენობა<input type="number" required min="1" max="2147483647" step="1" value={capacity} onChange={e => setCapacity(e.target.value)} /></label>
        <p>ვადა გამოითვლება თბილისის დროით, მითითებული დღის დასრულებამდე. ახალი კოდი ძველს გააუქმებს.</p>
        <button className="teacher-button" type="submit">კოდის შექმნა</button>{' '}
        <button className="teacher-cancel" type="button" onClick={revoke}>კოდის გაუქმება</button>
      </fieldset>
    </form>
    {issuedCode && <div><p>კოდი: <strong className="class-code-value">{issuedCode}</strong></p>
      <button type="button" className="teacher-cancel" onClick={() => { void (async () => { try { if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText(issuedCode); setCopyMessage('კოდი დაკოპირდა.'); } catch { setCopyMessage('მონიშნეთ კოდი და დააკოპირეთ ხელით.'); } })(); }}>კოდის კოპირება</button>
      {copyMessage && <p role="status">{copyMessage}</p>}
    </div>}
    {message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}
  </section>;
}

export function StudentCodeControls({ service }: { service: StudentCodeService | null }) {
  const [code, setCode] = useState(''); const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (!service || busy) return;
    const normalized = code.replace(/[ -]/g, '').toUpperCase();
    if (!/^[A-Z2-7]{26}$/.test(normalized)) { setError('შეამოწმე კლასის კოდი.'); return; }
    setBusy(true); setError(''); setMessage('');
    try { await service.join(normalized); setCode(''); setMessage('კლასს შეუერთდი.'); }
    catch { setError('კლასში შესვლა ვერ დადასტურდა. შეამოწმე კოდი ან დაუკავშირდი მასწავლებელს.'); }
    finally { setBusy(false); }
  };
  return <section className="student-card class-code-panel" aria-labelledby="student-class-code-title">
    <h3 id="student-class-code-title">კლასში გაწევრიანება</h3>
    <p>შეიყვანე შენი მასწავლებლის მიერ გაზიარებული კოდი. მასწავლებელთან კავშირი წინასწარ უნდა არსებობდეს.</p>
    {!service && <p role="status">კლასში შესვლას სჭირდება ავტორიზებული სერვისი.</p>}
    <form onSubmit={submit}><fieldset disabled={!service || busy}>
      <label>კლასის კოდი<input value={code} onChange={e=>setCode(e.target.value)} maxLength={40} autoComplete="off" spellCheck={false} /></label>
      <button type="submit" className="btn btn-primary">კლასში შესვლა</button>
    </fieldset></form>
    {message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}
  </section>;
}
