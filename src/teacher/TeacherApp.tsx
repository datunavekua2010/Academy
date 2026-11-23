import { useEffect, useState } from 'react';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { Link, navigate, useHashRoute } from '../router';
import { supabaseConfiguration } from '../lib/supabase';
import { TEST_ACCOUNT_MODE } from '../student/accountMode';
import { getGrade } from '../practice/curriculum';
import { hasTemplates } from '../practice/generator';
import { loadAttempts, progressForAssignment, assignmentStatus } from '../practice/store';
import { readTestAssignments, createTestAssignments, cancelTestAssignment, TEST_ASSIGNMENTS_KEY, type TestAssignment } from './testAssignments';
import { topicSubtopics, type GradeId, type SubtopicRef } from '../practice/types';
import { CONNECTED_HOMEWORK_REVIEW } from './homework';
import { ConnectedHomework } from './ConnectedHomework';
import { loadTeacherData, type TeacherData, type TeacherAttempt } from './data';
import { ProgressReports } from './ProgressReports';
import { LessonNotes } from './LessonNotes';
import { Classrooms } from './Classrooms';
import { TestMaker } from './TestMaker';
import { TeacherSignIn, TeacherSignOut } from './TeacherSignIn';
import { signupClient } from '../lib/accountSignup';
import './teacher.css';

const PREVIEW_CLASSROOM_STUDENTS = [{ id: 'test-student', name: 'სანიმუშო მოსწავლე', grade: null }];

type Access = { status: 'loading' | 'unavailable' | 'signed-out' | 'denied' | 'error' } | { status: 'ready'; user: User; name: string };
const NAV = [
  ['students', 'ჩემი მოსწავლეები', '♙'], ['assignments', 'დავალებები', '▤'],
  ['analytics', 'ანალიტიკა', '▥'], ['interventions', 'სასწავლო მხარდაჭერა', '◇'], ['settings', 'პარამეტრები', '⚙'],
] as const;

function useTeacherAccess(client: SupabaseClient | null): [Access, () => void] {
  const [access, setAccess] = useState<Access>({ status: client ? 'loading' : 'unavailable' });
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    if (!client) { setAccess({ status: 'unavailable' }); return; }
    let alive = true, revision = 0;
    const verify = async () => {
      const current = ++revision;
      setAccess({ status: 'loading' });
      try {
        const { data, error } = await client.auth.getUser();
        if (!alive || current !== revision) return;
        if (error) { setAccess({ status: error.name === 'AuthSessionMissingError' ? 'signed-out' : 'error' }); return; }
        if (!data.user) { setAccess({ status: 'signed-out' }); return; }
        const user = data.user;
        const [role, profile] = await Promise.all([
          client.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'teacher').maybeSingle(),
          client.from('profiles').select('display_name').eq('id', user.id).maybeSingle(),
        ]);
        if (!alive || current !== revision) return;
        if (role.error || profile.error) { setAccess({ status: 'error' }); return; }
        if (!role.data) { setAccess({ status: 'denied' }); return; }
        if (!profile.data || typeof profile.data.display_name !== 'string') { setAccess({ status: 'error' }); return; }
        setAccess({ status: 'ready', user, name: profile.data.display_name });
      } catch { if (alive && current === revision) setAccess({ status: 'error' }); }
    };
    // Do not await Supabase work inside the auth callback; this avoids SDK lock deadlocks.
    const { data: { subscription } } = client.auth.onAuthStateChange(() => { revision++; setAccess({ status: 'loading' }); window.setTimeout(() => { if (alive) void verify(); }, 0); });
    void verify();
    return () => { alive = false; revision++; subscription.unsubscribe(); };
  }, [client, generation]);
  return [access, () => setGeneration((x) => x + 1)];
}

function pathName(grade: number, topicId: string, subId: string): string {
  if (!Number.isInteger(grade) || grade < 1 || grade > 7) return 'უცნობი სასწავლო მასალა';
  const topic = getGrade(grade as GradeId).topics.find((t) => t.id === topicId);
  const sub = topic && topicSubtopics(topic).find((s) => s.id === subId);
  return topic && sub ? `${topic.title} / ${sub.title}` : 'სასწავლო მასალა მიუწვდომელია';
}
function accuracy(attempts: TeacherAttempt[]) {
  const correct = attempts.reduce((n, a) => n + a.correct, 0);
  const incorrect = attempts.reduce((n, a) => n + a.incorrect, 0);
  const total = correct + incorrect;
  return { correct, incorrect, total, percent: total >= 10 ? Math.round(correct / total * 100) : null };
}
function date(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'თარიღი მიუწვდომელია' : new Intl.DateTimeFormat('ka-GE', { dateStyle: 'medium', timeZone: 'Asia/Tbilisi' }).format(parsed);
}

function Workspace({ client, user, name, section, studentId, reportStudentId, notesView }: { client: SupabaseClient | null; user: User | null; name: string; section: string; studentId: string | null; reportStudentId: string | null; notesView: boolean }) {
  const preview = !client && !user;
  const [state, setState] = useState<{ status: 'loading' | 'error' } | { status: 'ready'; data: TeacherData }>({ status: 'loading' });
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('all');
  useEffect(() => {
    if (!client || !user) return;
    let active = true;
    setState({ status: 'loading' });
    loadTeacherData(client, user.id).then((data) => { if (active) setState({ status: 'ready', data }); }).catch(() => { if (active) setState({ status: 'error' }); });
    return () => { active = false; };
  }, [client, user?.id, reload]);
  const title = NAV.find(([key]) => key === section)?.[1] ?? 'გვერდი ვერ მოიძებნა';
  return <div className="teacher-shell">
    <button type="button" className="teacher-skip" onClick={() => document.getElementById('teacher-content')?.focus()}>მთავარ შიგთავსზე გადასვლა</button>
    <aside className="teacher-sidebar"><Link to="/" className="teacher-brand"><span aria-hidden="true">✦</span> Axiom Academy</Link><p className="teacher-nav-label">მასწავლებლის სივრცე</p>
      <nav aria-label="მასწავლებლის ნავიგაცია">{NAV.map(([key, label, icon]) => <Link key={key} to={`/teacher/${key}`} className={section === key ? 'active' : ''} aria-current={section === key ? 'page' : undefined}><span aria-hidden="true">{icon}</span>{label}</Link>)}</nav>
      <Link to="/student" className="teacher-student-link">მოსწავლის გვერდი ↗</Link>
    </aside>
    <main id="teacher-content" className="teacher-main" tabIndex={-1}>
      <header className="teacher-top"><div><p>მასწავლებლის სივრცე</p><h1>{studentId ? 'მოსწავლის პროფილი' : title}</h1></div><div className="teacher-account"><span className="teacher-user">{name}</span>{client && <TeacherSignOut client={client} />}</div></header>
      {preview && <div className="teacher-preview-banner" role="status"><strong>მასწავლებლის სივრცე</strong> · ეს არ არის ანგარიში. დავალებები და შედეგები ინახება მხოლოდ ამ ბრაუზერში; რეალური მოსწავლეების მონაცემები არ ჩანს. <Link to="/">სივრცის შეცვლა →</Link></div>}
      {preview && <PreviewContent section={section} studentId={studentId} reportStudentId={reportStudentId} notesView={notesView} />}
      {!preview && state.status === 'loading' && <div className="teacher-panel" role="status">მონაცემები იტვირთება…</div>}
      {!preview && state.status === 'error' && <div className="teacher-panel" role="alert"><p>მონაცემები ვერ ჩაიტვირთა. სცადეთ ხელახლა.</p><button className="teacher-button" onClick={() => setReload((x) => x + 1)}>ხელახლა ცდა</button></div>}
      {!preview && state.status === 'ready' && <Content client={client!} teacherId={user!.id} notesView={notesView} reportStudentId={reportStudentId} data={state.data} onRefresh={() => setReload(x => x + 1)} section={section} studentId={studentId} search={search} setSearch={setSearch} grade={grade} setGrade={setGrade} name={name} />}
    </main>
  </div>;
}

/** Public preview uses only the browser-local test student, never authenticated account data. */
function PreviewContent({ section, studentId, reportStudentId, notesView }: { section: string; studentId: string | null; reportStudentId: string | null; notesView: boolean }) {
  if (studentId && studentId !== 'test-student') return <section className="teacher-panel"><h2>მოსწავლის პროფილი</h2><p>სანიმუშო მოსწავლე ვერ მოიძებნა.</p><Link to="/teacher/students">მოსწავლეების სია →</Link></section>;
  if (section === 'assignments' || section === 'students' || studentId) return <TestTeacherArea section={section} studentId={studentId} notesView={notesView} />;
  if (section === 'progress-reports') return <ProgressReports key={reportStudentId ?? 'all'} initialStudentId={reportStudentId} students={[{ id: 'test-student', name: 'სანიმუშო მოსწავლე', grade: null }]} client={null} teacherId={null} test />;
  if (section === 'interventions') return <><TestMaker client={null} teacherId={null} /><Classrooms client={null} assigned={PREVIEW_CLASSROOM_STUDENTS} test /></>;
  if (section === 'analytics') return <><AnalyticsReportCard students={[{ id: 'test-student', name: 'სანიმუშო მოსწავლე', grade: null }]} client={null} teacherId={null} test /><section className="teacher-panel teacher-info-panel"><h2>ანალიტიკა</h2><p>რეალური მოსწავლეების მონაცემები აქ არ იტვირთება.</p></section></>;
  if (section === 'overview') return <>
    <div className="teacher-welcome"><div><p className="teacher-eyebrow">სამუშაო სივრცე</p><h2>მასწავლებლის დაფა</h2><p>გაეცანით მასწავლებლის სამუშაო სივრცის განლაგებას.</p></div><Link to="/teacher/students" className="teacher-button">მოსწავლეების ნახვა →</Link></div>
    <div className="teacher-metrics">{[['ჩემი მოსწავლეები', '/teacher/students'], ['ჩემი დავალებები', '/teacher/assignments'], ['ვარჯიშის სესიები', '/teacher/analytics']].map(([label, path]) => <Link className="teacher-panel" to={path} key={path}><span>{label}</span><strong aria-label="მონაცემები მიუწვდომელია">—</strong><small>მონაცემები მიუწვდომელია</small></Link>)}</div>
    <div className="teacher-overview-grid"><section className="teacher-panel"><div className="teacher-section-head"><h2>ჩემი მოსწავლეები</h2><Link to="/teacher/students">სიის ნახვა →</Link></div><p className="teacher-empty">ამ ბრაუზერში ერთი სანიმუშო მოსწავლის ნახვა შეგიძლიათ.</p></section><section className="teacher-panel"><div className="teacher-section-head"><h2>სასწავლო აქტივობა</h2><Link to="/teacher/analytics">ანალიტიკა →</Link></div><p className="teacher-empty">აქტივობის მონაცემები ამ რეჟიმში მიუწვდომელია.</p></section></div>
    <section className="teacher-panel teacher-info-panel"><h2>ადგილობრივი მონაცემები</h2><p>დავალებები ინახება ამ ბრაუზერში და არ იგზავნება რეალურ ანგარიშზე.</p></section>
  </>;
  const details: Record<string, [string, string]> = {
    students: ['ჩემი მოსწავლეები', 'ადგილობრივი სივრცე არ აჩვენებს რეალურ მოსწავლეებს ან მათ პროგრესს.'],
    assignments: ['დავალებები', 'დავალებების შექმნა და მართვა ჯერ არ არის ხელმისაწვდომი.'],
    analytics: ['ანალიტიკა', 'ადგილობრივ სივრცეში მონაცემები არ იტვირთება.'],
    interventions: ['სასწავლო მხარდაჭერა', 'რეკომენდაციები და მათი ისტორია ჯერ არ არის ხელმისაწვდომი.'],
    reports: ['მშობლისთვის განახლება', 'რეალური მოსწავლის მონაცემები, ანგარიშის შენახვა და გაგზავნა ამ რეჟიმში მიუწვდომელია.'],
    settings: ['პარამეტრები', 'ეს არ არის რეალური ანგარიში; ანგარიშის პარამეტრები მიუწვდომელია.'],
  };
  const detail = details[section];
  return <section className="teacher-panel"><h2>{detail?.[0] ?? 'გვერდი ვერ მოიძებნა'}</h2><p>{detail?.[1] ?? 'აირჩიეთ სექცია მასწავლებლის ნავიგაციიდან.'}</p><Link to="/teacher">მიმოხილვაზე დაბრუნება →</Link></section>;
}

/** Test-only assignment workflow; never used for authenticated students. */
function TestTeacherArea({ section, studentId, notesView }: { section: string; studentId: string | null; notesView: boolean }) {
  const [rows, setRows] = useState<TestAssignment[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [grade, setGrade] = useState<GradeId>(5);
  const [topicId, setTopicId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [selected, setSelected] = useState<SubtopicRef[]>([]);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [deadline, setDeadline] = useState('');
  const [attempts, setAttempts] = useState(() => loadAttempts(undefined, 'axiom-academy.test.practice.v1'));
  const refresh = () => { try { setRows(readTestAssignments()); setAttempts(loadAttempts(undefined, 'axiom-academy.test.practice.v1')); setError(''); } catch { setError('ადგილობრივი მონაცემები ვერ ჩაიტვირთა. შეამოწმეთ ბრაუზერის საცავი.'); } };
  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => { if (e.key === TEST_ASSIGNMENTS_KEY || e.key === 'axiom-academy.test.practice.v1' || !e.key) refresh(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const topic = getGrade(grade).topics.find((item) => item.id === topicId);
  const unit = topic?.units.find((item) => item.id === unitId);
  const playable = unit?.subtopics.filter((sub) => hasTemplates({ grade, topicId, subtopicId: sub.id })) ?? [];
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try { createTestAssignments({ title, instructions, subtopics: selected, dueAt: deadline }); setTitle(''); setInstructions(''); setDeadline(''); setSelected([]); refresh(); setMessage('ადგილობრივი დავალება დაემატა ამ ბრაუზერის მოსწავლეს. თითოეული ქვეთემა ცალკე სავარჯიშოდ ჩანს.'); }
    catch { setError('დავალება ვერ შეინახა. შეავსეთ ყველა აუცილებელი ველი, აირჩიეთ სავარჯიშო და მომავალი ვადა; შეამოწმეთ ბრაუზერის საცავი.'); }
  };
  const cancel = (id: string) => { try { cancelTestAssignment(id); refresh(); setMessage('ადგილობრივი დავალება გაუქმებულია. წინა მცდელობები შენარჩუნებულია.'); } catch { setError('დავალება ვერ გაუქმდა.'); } };
  if (section === 'students' && !studentId) return <section className="teacher-panel"><h2>სანიმუშო მოსწავლე</h2><p>ეს ერთი საერთო სანიმუშო პროფილია ამ ბრაუზერში და არ არის რეალური ანგარიში.</p><div className="teacher-student-actions"><Link to="/teacher/students/test-student">სანიმუშო პროფილის ნახვა →</Link><Link className="teacher-button" to="/teacher/students/test-student/notes">გაკვეთილის ჩანაწერები</Link></div></section>;
  const list = <><p className="teacher-notice">ადგილობრივი შედეგები მოწმდება ბრაუზერში და სერვერით არ დასტურდება.</p>{rows.length ? <ul className="teacher-list">{rows.map((row) => {
    const progress = progressForAssignment(attempts, row); const status = assignmentStatus(progress);
    return <li key={row.id}><div><strong>{row.title}</strong><p>{pathName(row.ref.grade, row.ref.topicId, row.ref.subtopicId)}</p><small>ვადა: {date(row.dueAt)} · {row.cancelled ? 'გაუქმებული' : status === 'completed' ? 'ადგილობრივად დასრულებული' : status === 'in-progress' ? 'მიმდინარე' : 'დასაწყები'} · {progress.attempts} სესია · საუკეთესო ქულა {progress.bestScore}/100</small></div>{section === 'assignments' && !row.cancelled && <button className="teacher-cancel" type="button" onClick={() => cancel(row.id)}>გაუქმება</button>}</li>;
  })}</ul> : <p className="teacher-empty">ადგილობრივი დავალება ჯერ არ არის შექმნილი.</p>}</>;
  if (studentId && notesView) return <><Link className="teacher-back" to="/teacher/students/test-student">← სანიმუშო პროფილი</Link><LessonNotes key="test-student" client={null} teacherId={null} studentId="test-student" authorName="მასწავლებელი" test /></>;
  if (studentId) return <section className="teacher-panel"><Link to="/teacher/students">← მოსწავლეების სია</Link><h2>სანიმუშო მოსწავლე</h2><p>ამ ბრაუზერის ადგილობრივი დავალებები და შედეგები.</p><button type="button" className="teacher-button" onClick={() => navigate('/teacher/progress-reports/test-student')}>პროგრესის ანგარიშის შექმნა →</button> <Link className="teacher-button" to="/teacher/students/test-student/notes">გაკვეთილის ჩანაწერები</Link>{error && <p role="alert">{error}</p>}{list}</section>;
  return <><section className="teacher-panel"><h2>ადგილობრივი დავალების შექმნა</h2><p>მიმღები: სანიმუშო მოსწავლე. მხოლოდ ამ ბრაუზერში; რეალურ ანგარიშზე არაფერი იგზავნება.</p>
    <form className="teacher-assignment-form" onSubmit={submit}>
      <label>დავალების სათაური<input required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label>მითითება (არასავალდებულო)<textarea maxLength={1000} rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} /></label>
      <label>კლასი<select value={grade} onChange={(e) => { setGrade(Number(e.target.value) as GradeId); setTopicId(''); setUnitId(''); }}>{[1,2,3,4,5,6,7].map((n) => <option key={n} value={n}>{n} კლასი</option>)}</select></label>
      <label>თემა<select value={topicId} onChange={(e) => { setTopicId(e.target.value); setUnitId(''); }}><option value="">აირჩიეთ თემა</option>{getGrade(grade).topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
      <label>ნაწილი<select value={unitId} disabled={!topic} onChange={(e) => { setUnitId(e.target.value); }}><option value="">აირჩიეთ ნაწილი</option>{topic?.units.map((u) => <option key={u.id} value={u.id}>{u.code} · {u.title}</option>)}</select></label>
      <fieldset className="teacher-subtopics" disabled={!unit}>
        <legend>ქვეთემები</legend>
        {!unit ? <p>ჯერ აირჩიეთ თემა და ნაწილი.</p> : playable.length === 0 ? <p>ამ ნაწილში ხელმისაწვდომი სავარჯიშო არ არის.</p> : playable.map((sub) => {
          const checked = selected.some((ref) => ref.grade === grade && ref.topicId === topicId && ref.subtopicId === sub.id);
          return <label key={sub.id} className="teacher-subtopic-option"><input type="checkbox" checked={checked} onChange={(e) => {
            if (e.target.checked) setSelected((current) => [...current, { grade, topicId, subtopicId: sub.id }]);
            else setSelected((current) => current.filter((ref) => !(ref.grade === grade && ref.topicId === topicId && ref.subtopicId === sub.id)));
          }} /><span>{sub.title}</span></label>;
        })}
      </fieldset>
      <div className="teacher-selected-subtopics" aria-live="polite"><strong>არჩეული ქვეთემები: {selected.length}</strong><p>შეგიძლიათ სხვა ნაწილიდან, თემიდან ან კლასიდანაც დაამატოთ. თითოეული ქვეთემა ცალკე სავარჯიშოდ გამოჩნდება და ცალკე გაუქმდება.</p>
        {selected.length > 0 && <ul>{selected.map((ref) => <li key={`${ref.grade}/${ref.topicId}/${ref.subtopicId}`}><span>{ref.grade} კლასი · {pathName(ref.grade, ref.topicId, ref.subtopicId)}</span><button type="button" className="teacher-cancel" aria-label={`${pathName(ref.grade, ref.topicId, ref.subtopicId)} წაშლა`} onClick={() => setSelected((current) => current.filter((item) => !(item.grade === ref.grade && item.topicId === ref.topicId && item.subtopicId === ref.subtopicId)))}>წაშლა</button></li>)}</ul>}
      </div>
      <label>ვადა<input required type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></label>
      <button className="teacher-button" type="submit">ადგილობრივი დავალების დამატება</button>
    </form>{error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
  </section><section className="teacher-panel teacher-info-panel"><h2>ადგილობრივი დავალებები და შედეგები</h2>{list}</section></>;
}

function AnalyticsReportCard({ students, client, teacherId, test }: { students: TeacherData['students']; client: SupabaseClient | null; teacherId: string | null; test: boolean }) {
  const [open, setOpen] = useState(false);
  return <section className="teacher-panel teacher-analytics-report">
    <div className="teacher-section-head"><div><h2>პროგრესის ანგარიში</h2><p>აირჩიეთ მოსწავლე და პერიოდი, გადახედეთ ანგარიშს და შეინახეთ PDF-ად.</p></div>
      <button className="teacher-button" type="button" aria-expanded={open} aria-controls="analytics-report-card" onClick={() => setOpen((value) => !value)}>{open ? 'დახურვა' : 'ანგარიშის შექმნა'}</button>
    </div>
    <div id="analytics-report-card" className="teacher-analytics-report-content" hidden={!open}>{open && <ProgressReports students={students} client={client} teacherId={teacherId} test={test} />}</div>
  </section>;
}

function Content({ client, teacherId, notesView, reportStudentId, data, onRefresh, section, studentId, search, setSearch, grade, setGrade, name }: { client: SupabaseClient; teacherId: string; notesView: boolean; reportStudentId: string | null; data: TeacherData; onRefresh: () => void; section: string; studentId: string | null; search: string; setSearch: (s: string) => void; grade: string; setGrade: (s: string) => void; name: string }) {
  const studentMap = new Map(data.students.map((s) => [s.id, s]));
  const student = studentId ? studentMap.get(studentId) : null;
  const students = data.students.filter((s) => s.name.toLocaleLowerCase('ka').includes(search.trim().toLocaleLowerCase('ka')) && (grade === 'all' || String(s.grade) === grade));
  const stats = accuracy(data.attempts);
  const unverified = <p className="teacher-notice">ვარჯიშის შედეგები მოსწავლის მოწყობილობაზე მოწმდება და სერვერის მიერ დადასტურებული არ არის. ეს მონაცემები არ წარმოადგენს ცოდნის ან დავალების დასრულების დადასტურებას.</p>;
  if (studentId && !student) return <section className="teacher-panel"><p>მოსწავლე ვერ მოიძებნა ან თქვენთან არ არის დაკავშირებული.</p><Link to="/teacher/students">მოსწავლეების სია</Link></section>;
  if (student && notesView) return <><Link className="teacher-back" to={`/teacher/students/${student.id}`}>← მოსწავლის პროფილი</Link><section className="teacher-panel"><h2>{student.name}</h2></section><LessonNotes key={student.id} client={client} teacherId={teacherId} studentId={student.id} authorName={name} test={false} /></>;
  if (student) {
    const attempts = data.attempts.filter((a) => a.studentId === student.id);
    const assignments = data.assignments.filter((a) => a.studentId === student.id);
    const stat = accuracy(attempts);
    return <><Link className="teacher-back" to="/teacher/students">← მოსწავლეების სია</Link><section className="teacher-panel"><h2>{student.name}</h2><p>{student.grade ? `${student.grade} კლასი` : 'კლასი მითითებული არ არის'}</p><p>თქვენი დავალებები: <strong>{assignments.length}</strong> · სრული პასუხების მქონე სესიები: <strong>{attempts.length}</strong></p>{unverified}<button type="button" className="teacher-button" onClick={() => navigate(`/teacher/progress-reports/${student.id}`)}>პროგრესის ანგარიშის შექმნა →</button> <Link className="teacher-button" to={`/teacher/students/${student.id}/notes`}>გაკვეთილის ჩანაწერები</Link><p>{stat.total ? `სწორი პასუხი: ${stat.correct} / ${stat.total}${stat.percent === null ? ' · სიზუსტისთვის საჭიროა მინიმუმ 10 პასუხი' : ` (${stat.percent}%)`}` : 'პასუხების მონაცემები არ არის საკმარისი.'}</p></section><AttemptList attempts={attempts} names={studentMap} /></>;
  }
  if (section === 'overview') return <>
    <div className="teacher-welcome"><div><p className="teacher-eyebrow">ყოველდღიური მიმოხილვა</p><h2>გამარჯობა, {name}!</h2><p>მოსწავლეები და სასწავლო აქტივობა ერთ სივრცეში.</p></div><Link to="/teacher/students" className="teacher-button">მოსწავლეების ნახვა →</Link></div>
    <div className="teacher-metrics"><Link className="teacher-panel" to="/teacher/students"><span>ჩემი მოსწავლეები</span><strong>{data.students.length}</strong><small>დაკავშირებული მოსწავლე</small></Link><Link className="teacher-panel" to="/teacher/assignments"><span>ჩემი დავალებები</span><strong>{data.assignments.length}</strong><small>შენახული დავალება</small></Link><Link className="teacher-panel" to="/teacher/analytics"><span>ვარჯიშის სესიები</span><strong>{data.attempts.length + data.invalidAttempts}</strong><small>დაუდასტურებელი ჩანაწერი</small></Link></div>
    {unverified}{data.invalidAttempts > 0 && <p className="teacher-notice">{data.invalidAttempts} ჩანაწერს პასუხების მონაცემები აკლია და აქტივობის სიაში არ ჩანს.</p>}<div className="teacher-overview-grid"><section className="teacher-panel"><div className="teacher-section-head"><h2>ჩემი მოსწავლეები</h2><Link to="/teacher/students">ყველას ნახვა →</Link></div><StudentList students={data.students.slice(0, 5)} /></section><section className="teacher-panel"><div className="teacher-section-head"><h2>სასწავლო აქტივობა</h2><Link to="/teacher/analytics">ყველას ნახვა →</Link></div><AttemptList attempts={data.attempts} names={studentMap} limit={5} embedded /></section></div>
    <section className="teacher-panel teacher-info-panel"><h2>რა არის ჯერ მიუწვდომელი?</h2><p>დადასტურებული დასრულება, ათვისება, ჩარევების ისტორია და მშობლისთვის ანგარიშის გაგზავნა ჯერ არ არის მხარდაჭერილი.</p></section>
  </>;
  if (section === 'students') return <section className="teacher-panel"><div className="teacher-section-head"><div><h2>მოსწავლეები</h2><p>მხოლოდ თქვენთან დაკავშირებული ანგარიშები.</p></div><span className="teacher-count">{students.length}</span></div><div className="teacher-filters"><label>ძიება სახელით<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="მოსწავლის სახელი" /></label><label>კლასი<select value={grade} onChange={(e) => setGrade(e.target.value)}><option value="all">ყველა კლასი</option>{[1,2,3,4,5,6,7].map((n) => <option key={n} value={n}>{n} კლასი</option>)}</select></label></div><StudentList students={students} /></section>;
  if (section === 'assignments' && CONNECTED_HOMEWORK_REVIEW) return <ConnectedHomework client={client} teacherId={teacherId} data={data} onRefresh={onRefresh} />;
  if (section === 'assignments') return <section className="teacher-panel"><div className="teacher-section-head"><div><h2>თქვენი დავალებები</h2><p>აქ ჩანს თქვენს მიერ შექმნილი დავალებები დაკავშირებული მოსწავლეებისთვის.</p></div><span className="teacher-count">{data.assignments.length}</span></div><p className="teacher-notice">ახალი დავალების შექმნა და ცვლილება ჯერ მიუწვდომელია; დასრულების სტატუსი ვერ დასტურდება.</p>{data.assignments.length ? <ul className="teacher-list">{data.assignments.map((a) => <li key={a.id}><div><strong>{studentMap.get(a.studentId)?.name ?? 'მოსწავლე'}</strong><p>{pathName(a.grade, a.topicId, a.subunitId)}</p><small>ვადა: {date(a.dueAt)} · სტატუსი უცნობია</small></div><Link to={`/teacher/students/${a.studentId}`}>პროფილი →</Link></li>)}</ul> : <p className="teacher-empty">თქვენი დავალებები ვერ მოიძებნა.</p>}</section>;
  if (section === 'analytics') return <><AnalyticsReportCard students={data.students} client={client} teacherId={teacherId} test={false} />{unverified}<div className="teacher-metrics"><div className="teacher-panel"><span>სწორი პასუხები</span><strong>{stats.total ? `${stats.correct} / ${stats.total}` : '—'}</strong><small>პასუხების რაოდენობა</small></div><div className="teacher-panel"><span>სიზუსტე</span><strong>{stats.percent === null ? '—' : `${stats.percent}%`}</strong><small>სწორი / ყველა პასუხი · მინიმუმ 10</small></div><div className="teacher-panel"><span>შენახული სესიები</span><strong>{data.attempts.length}</strong><small>სრული მონაცემებით</small></div></div>{data.invalidAttempts > 0 && <p className="teacher-notice">{data.invalidAttempts} ჩანაწერს პასუხების მონაცემები აკლია და არ შედის ანალიზში.</p>}<AttemptList attempts={data.attempts} names={studentMap} /></>;
  if (section === 'interventions') return <><TestMaker client={client} teacherId={teacherId} /><Classrooms client={client} assigned={data.students} test={false} /></>;
  if (section === 'progress-reports') return <ProgressReports key={reportStudentId ?? 'all'} initialStudentId={reportStudentId} students={data.students} client={client} teacherId={teacherId} test={false} />;
  if (section === 'reports') return <ReportPreparation students={data.students} />;
  if (section === 'settings') return <section className="teacher-panel"><h2>ანგარიში</h2><p>სახელი: {name}</p><p>პროფილისა და ანგარიშის პარამეტრების შეცვლა ჯერ მიუწვდომელია.</p></section>;
  return <section className="teacher-panel">გვერდი ვერ მოიძებნა. <Link to="/teacher">მიმოხილვაზე დაბრუნება</Link></section>;
}

/** Deliberately ephemeral and unsent: no private teacher notes or inferred claims. */
function ReportPreparation({ students }: { students: TeacherData['students'] }) {
  const [selected, setSelected] = useState('');
  return <section className="teacher-panel teacher-report"><h2>მშობლისთვის განახლების მომზადება</h2>
    <p>მოამზადეთ ტექსტი ხელით. ის მხოლოდ ამ გვერდზე რჩება, არ ინახება და მშობელს არ ეგზავნება.</p>
    <label>მოსწავლე<select value={selected} onChange={(e) => setSelected(e.target.value)}><option value="">აირჩიეთ მოსწავლე</option>{students.map((s) => <option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
    {selected && students.some((s) => s.id === selected) && <ReportFields key={selected} />}
    {!students.length && <p className="teacher-empty">დაკავშირებული მოსწავლეები არ არიან.</p>}
  </section>;
}
function ReportFields() {
  const fields = ['განხილული თემები', 'დავალებების შესახებ დაკვირვება', 'ძლიერი მხარეები', 'დამატებითი პრაქტიკის მიმართულებები', 'შემდეგი ნაბიჯები'];
  return <div className="teacher-report-fields">{fields.map((field, index) => <label key={field} htmlFor={`report-field-${index}`}>{field}<textarea id={`report-field-${index}`} maxLength={2000} rows={3} placeholder="შეიყვანეთ თქვენი დაკვირვება" /></label>)}<p className="teacher-notice">ტექსტი არ არის შენახული ან გაგზავნილი. სხვა მოსწავლის არჩევისას ან გვერდიდან გასვლისას ის წაიშლება.</p></div>;
}

function StudentList({ students }: { students: TeacherData['students'] }) {
  return students.length ? <ul className="teacher-list">{students.map((s) => <li key={s.id}><div className="teacher-person"><span className="teacher-avatar" aria-hidden="true">{s.name.slice(0, 1).toUpperCase()}</span><div><strong>{s.name}</strong><p>{s.grade ? `${s.grade} კლასი` : 'კლასი მითითებული არ არის'}</p></div></div><div className="teacher-student-actions"><Link to={`/teacher/students/${s.id}`}>ნახვა →</Link><Link className="teacher-button" to={`/teacher/students/${s.id}/notes`}>ჩანაწერები</Link></div></li>)}</ul> : <p className="teacher-empty">მოსწავლეები ვერ მოიძებნა.</p>;
}
function AttemptList({ attempts, names, limit, embedded = false }: { attempts: TeacherAttempt[]; names: Map<string, TeacherData['students'][number]>; limit?: number; embedded?: boolean }) {
  const sorted = [...attempts].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  const content = sorted.length ? <ul className="teacher-list">{sorted.slice(0, limit).map((a) => <li key={`${a.studentId}:${a.id}`}><div><strong>{names.get(a.studentId)?.name ?? 'მოსწავლე'}</strong><p>{pathName(a.grade, a.topicId, a.subunitId)}</p><small>{date(a.recordedAt)} · {a.correct}/{a.correct + a.incorrect} სწორი · დაუდასტურებელი</small></div><Link to={`/teacher/students/${a.studentId}`}>პროფილი →</Link></li>)}</ul> : <p className="teacher-empty">პასუხების სრული მონაცემების მქონე აქტივობა არ მოიძებნა.</p>;
  return embedded ? content : <section className="teacher-panel"><h2>ვარჯიშის ისტორია</h2>{content}</section>;
}

export function TeacherApp() {
  const path = useHashRoute();
  const client = supabaseConfiguration.client;
  const [access, retry] = useTeacherAccess(client);
  const parts = path.replace(/^\/teacher\/?/, '').replace(/\/+$/, '').split('/').filter(Boolean);
  const section = parts[0] || 'students';
  const notesView = section === 'students' && parts.length === 3 && parts[2] === 'notes';
  const studentId = section === 'students' && (parts.length === 2 || notesView) ? parts[1] : null;
  const reportStudentId = section === 'progress-reports' && parts.length === 2 ? parts[1] : null;
  const valid = parts.length <= 1 || !!studentId || !!reportStudentId;
  useEffect(() => { document.title = 'მასწავლებლის სივრცე — Axiom Academy'; }, []);
  if (TEST_ACCOUNT_MODE && !client && supabaseConfiguration.mode === 'unconfigured') return <Workspace key="test-preview" client={null} user={null} name="ადგილობრივი სივრცე" section={valid ? section : 'not-found'} studentId={valid ? studentId : null} reportStudentId={valid ? reportStudentId : null} notesView={valid && notesView} />;
  if (access.status !== 'ready' || !client) return <main className="teacher-gate"><div className="teacher-panel"><Link to="/" className="teacher-brand">✦ Axiom Academy</Link><h1>მასწავლებლის სივრცე</h1>{access.status === 'loading' ? <p role="status">ანგარიში მოწმდება…</p> : access.status === 'unavailable' ? <p>მასწავლებლის ანგარიშით შესვლა ამ ეტაპზე მიუწვდომელია. სატესტო მოსწავლის ანგარიში ამ სივრცეზე წვდომას არ იძლევა.</p> : access.status === 'signed-out' && client ? <TeacherSignIn client={client} onSignedIn={retry} /> : access.status === 'denied' && client ? <><p role="alert">ამ ანგარიშს მასწავლებლის სივრცეზე წვდომა არ აქვს.</p>{signupClient&&<p><Link to="/account/status">ჩემი ანგარიშის ნომერი</Link></p>}<TeacherSignOut client={client} /></> : <div role="alert"><p>ანგარიშის შემოწმება ვერ მოხერხდა.</p><button className="teacher-button" onClick={retry}>ხელახლა ცდა</button></div>}<Link to="/student">მოსწავლის გვერდზე დაბრუნება →</Link></div></main>;
  return <Workspace key={access.user.id} client={client} user={access.user} name={access.name} section={valid ? section : 'not-found'} studentId={valid ? studentId : null} reportStudentId={valid ? reportStudentId : null} notesView={valid && notesView} />;
}
