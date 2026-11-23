import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { createPortal, flushSync } from 'react-dom';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { TeacherStudent } from './data';
import { connectedClassrooms, previewClassrooms, type Classroom, type ClassStudent } from './classroomData';
import { TeacherCodeControls } from '../classrooms/ClassroomCodeControls';
import { classroomCodeServices } from '../classrooms/codeService';

function Cards({ students, classroom, test }: { students: ClassStudent[]; classroom: string; test: boolean }) {
  return <div className="classroom-cards">{students.map((student) => <article className="classroom-login-card" key={student.id}>
    <strong>Axiom Academy {test ? '· ნიმუში' : ''}</strong><h3>{student.name}</h3><p>კლასი: {classroom}</p>
    <p><b>ანგარიშის სტატუსი უცნობია.</b> შესვლის მონაცემებისა და ოფიციალური მისამართის მისაღებად მიმართე აკადემიის ადმინისტრატორს.</p>
    <p>პაროლი და სხვა საიდუმლო მონაცემები ბარათზე არ იბეჭდება.</p>
  </article>)}</div>;
}

export function Classrooms({ client, assigned, test }: { client: SupabaseClient | null; assigned: TeacherStudent[]; test: boolean }) {
  const store = useMemo(() => test ? previewClassrooms(assigned) : client ? connectedClassrooms(client) : null, [client, test, assigned]);
  const codeService = useMemo(() => classroomCodeServices(client, !test && import.meta.env.VITE_CLASSROOM_CODES_ENABLED === 'true')?.teacher ?? null, [client, test]);
  const [rooms, setRooms] = useState<Classroom[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [members, setMembers] = useState<ClassStudent[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [description, setDescription] = useState('');
  const [editing, setEditing] = useState<Classroom | null>(null);
  const [adding, setAdding] = useState('');
  const [confirm, setConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [failure, setFailure] = useState('');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);
  const [cards, setCards] = useState<ClassStudent[] | null>(null);
  const [printReady, setPrintReady] = useState(false);
  const selected = rooms.find((r) => r.id === selectedId) ?? null;
  useEffect(() => {
    let active = true; setLoading(true); setFailure('');
    if (!store) { setFailure('კლასები მიუწვდომელია.'); setLoading(false); return () => { active = false; }; }
    store.list().then((list) => { if (active) setRooms(list); }).catch(() => { if (active) setFailure('კლასები ვერ ჩაიტვირთა. შეამოწმეთ წვდომა და სცადეთ ხელახლა.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [store, reload]);
  useEffect(() => {
    let active = true; setMembers([]); setChecked([]); setCards(null); setConfirm(null); setAdding('');
    if (!store || !selectedId) { setMembersLoading(false); return () => { active = false; }; }
    setMembersLoading(true);
    store.students(selectedId).then((list) => { if (active) setMembers(list); }).catch(() => { if (active) setFailure('მოსწავლეების სია ვერ ჩაიტვირთა.'); }).finally(() => { if (active) setMembersLoading(false); });
    return () => { active = false; };
  }, [store, selectedId, reload]);
  useEffect(() => {
    const clear = () => { document.body.classList.remove('axiom-cards-printing'); setPrintReady(false); };
    window.addEventListener('afterprint', clear);
    return () => { document.body.classList.remove('axiom-cards-printing'); window.removeEventListener('afterprint', clear); };
  }, []);
  const act = async (work: () => Promise<void>, success: string) => {
    if (!store || busyRef.current || loading || membersLoading) return;
    busyRef.current = true; setBusy(true); setFailure(''); setNotice('');
    try { await work(); setNotice(success); } catch { setFailure('მოქმედების შედეგი ვერ დადასტურდა. შესაძლოა ცვლილება უკვე შენახულია, ან წვდომა და მონაცემები შეიცვალა. ხელახლა ცდამდე განაახლეთ სია.'); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const refresh = async () => { setRooms(await store!.list()); if (selectedId) setMembers(await store!.students(selectedId)); };
  const clearForm = () => { setEditing(null); setName(''); setGrade(''); setDescription(''); };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const clean = name.trim(); const g = grade === '' ? null : Number(grade);
    if (!clean || clean.length > 100 || description.length > 500 || (g !== null && (!Number.isInteger(g) || g < 1 || g > 7))) { setFailure('შეიყვანეთ კლასის სახელი და სწორი მონაცემები.'); return; }
    void act(async () => { await store!.save({ name: clean, grade: g, description: description.trim() }, editing); await refresh(); clearForm(); }, test ? 'ცვლილება შესრულდა ამ გვერდზე.' : 'კლასი შენახულია.');
  };
  const prepareCards = () => void act(async () => {
    if (!selected || !checked.length) throw new Error('No students');
    const latest = await store!.students(selected.id);
    const chosen = latest.filter((s) => checked.includes(s.id));
    if (chosen.length !== checked.length) throw new Error('Roster changed');
    setCards(chosen);
  }, 'ბარათები მზადაა გადასახედად.');
  // Revalidate ownership and selected students immediately before printing.
  const print = () => void act(async () => {
    if (!cards?.length || !selected) throw new Error('No cards');
    const latestRooms = await store!.list();
    const latestRoom = latestRooms.find((room) => room.id === selected.id && room.revision === selected.revision && room.name === selected.name);
    if (!latestRoom) throw new Error('Classroom changed');
    const latestMembers = await store!.students(selected.id);
    const chosen = latestMembers.filter((student) => cards.some((card) => card.id === student.id));
    if (chosen.length !== cards.length) throw new Error('Roster changed');
    if (typeof window.print !== 'function') throw new Error('Print unavailable');
    flushSync(() => { setCards(chosen); setPrintReady(true); });
    document.body.classList.add('axiom-cards-printing');
    try { window.print(); } catch (error) { document.body.classList.remove('axiom-cards-printing'); setPrintReady(false); throw error; }
  }, 'ბეჭდვის ფანჯარა გაიხსნა.');
  const available = assigned.filter((s) => !members.some((m) => m.id === s.id));
  return <div className="classroom-workspace">
    <section className="teacher-panel"><h2>კლასების მართვა</h2>
      <p className="teacher-notice">{test ? 'კლასები მხოლოდ ამ გვერდზე არსებობს და გასვლისას იშლება. არ შეიყვანოთ რეალური მონაცემები.' : 'კლასში მხოლოდ თქვენთან უკვე დაკავშირებული მოსწავლეების დამატებაა შესაძლებელი.'}</p>
      {!codeService && <p>მოწვევის კოდი და კოდით გაწევრიანება ჯერ არ არის ხელმისაწვდომი. კოდი არ არის შესვლის პაროლი.</p>}
      {failure && <div role="alert"><p>{failure}</p><button className="teacher-cancel" type="button" disabled={busy} onClick={() => { setFailure(''); setReload((v) => v + 1); }}>სიის განახლება</button></div>}
      {notice && <p role="status">{notice}</p>}
      {loading ? <p role="status">კლასები იტვირთება…</p> : <>
        <form className="classroom-form" onSubmit={submit}><h3>{editing ? 'კლასის შეცვლა' : 'ახალი კლასი'}</h3>
          <label>კლასის სახელი<input maxLength={100} value={name} onChange={(e) => setName(e.target.value)} disabled={busy} /></label>
          <label>საფეხური (არასავალდებულო)<select value={grade} onChange={(e) => setGrade(e.target.value)} disabled={busy}><option value="">არ არის მითითებული</option>{[1,2,3,4,5,6,7].map((n) => <option key={n} value={n}>{n} კლასი</option>)}</select></label>
          <label>აღწერა (არასავალდებულო)<textarea maxLength={500} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} disabled={busy} /></label>
          <div className="classroom-actions"><button className="teacher-button" disabled={busy} type="submit">{editing ? 'ცვლილების შენახვა' : 'კლასის შექმნა'}</button>{editing && <button className="teacher-cancel" disabled={busy} type="button" onClick={clearForm}>გაუქმება</button>}</div>
        </form>
        {!rooms.length ? <p className="teacher-empty">კლასები ჯერ არ არის.</p> : <ul className="classroom-list">{rooms.map((room) => <li key={room.id}>
          <div><strong>{room.name}</strong><p>{room.grade ? `${room.grade} კლასი · ` : ''}{room.student_count} მოსწავლე{room.archived_at ? ' · დაარქივებული' : ''}</p>{room.description && <p>{room.description}</p>}</div>
          <div className="classroom-actions"><button className="teacher-cancel" type="button" disabled={busy} onClick={() => setSelectedId(room.id)}>გახსნა</button>{!room.archived_at && <><button className="teacher-cancel" type="button" disabled={busy} onClick={() => { setEditing(room); setName(room.name); setGrade(room.grade?.toString() ?? ''); setDescription(room.description); }}>შეცვლა</button>{confirm === `archive:${room.id}` ? <><span>კლასი დავარქივოთ? ანგარიშები და ისტორია შენარჩუნდება.</span><button className="teacher-cancel" type="button" disabled={busy} onClick={() => void act(async () => { await store!.archive(room); await refresh(); setConfirm(null); if (editing?.id === room.id) clearForm(); setCards(null); }, 'კლასი დაარქივებულია.')}>დიახ, დაარქივება</button><button className="teacher-cancel" type="button" onClick={() => setConfirm(null)}>არა</button></> : <button className="teacher-cancel" type="button" disabled={busy} onClick={() => setConfirm(`archive:${room.id}`)}>არქივში გადატანა</button>}</>}</div>
        </li>)}</ul>}
      </>}
    </section>
    {selected && <section className="teacher-panel"><div className="teacher-section-head"><h2>{selected.name} · მოსწავლეები</h2><button className="teacher-cancel" type="button" disabled={busy} onClick={() => setSelectedId(null)}>დახურვა</button></div>
      {selected.archived_at && <p className="teacher-notice">დაარქივებული კლასი მხოლოდ სანახავია.</p>}
      {!selected.archived_at && <TeacherCodeControls key={selected.id} classroomId={selected.id} revision={selected.revision} service={codeService} onChanged={() => { if (store) void store.list().then(setRooms).catch(() => setFailure('კლასების სია ვერ განახლდა.')); }} />}
      {membersLoading ? <p role="status">მოსწავლეები იტვირთება…</p> : <>
        {!selected.archived_at && <div className="classroom-add"><label>დაკავშირებული მოსწავლის დამატება<select value={adding} disabled={busy} onChange={(e) => setAdding(e.target.value)}><option value="">აირჩიეთ მოსწავლე</option>{available.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label><button className="teacher-button" type="button" disabled={busy || !adding} onClick={() => { const student = available.find((s) => s.id === adding); if (student) void act(async () => { await store!.add(selected, student); await refresh(); setAdding(''); }, test ? 'მოსწავლე დაემატა ამ გვერდზე.' : 'მოსწავლე დაემატა.'); }}>დამატება</button></div>}
        {!members.length ? <p className="teacher-empty">კლასში მოსწავლეები არ არიან.</p> : <><div className="classroom-actions"><button type="button" className="teacher-cancel" onClick={() => { setChecked(members.map((s) => s.id)); setCards(null); }}>ყველას არჩევა</button><button type="button" className="teacher-cancel" onClick={() => { setChecked([]); setCards(null); }}>არჩევის გაუქმება</button><button type="button" className="teacher-button" disabled={busy || !checked.length} onClick={prepareCards}>ბარათების გადახედვა</button></div>
          <ul className="classroom-list">{members.map((s) => <li key={s.id}><label className="classroom-check"><input type="checkbox" checked={checked.includes(s.id)} onChange={(e) => { setChecked((current) => e.target.checked ? [...current, s.id] : current.filter((id) => id !== s.id)); setCards(null); }} />{s.name}</label>{!selected.archived_at && <div className="classroom-actions">{confirm === `remove:${s.id}` ? <><span>მოსწავლე ამ კლასიდან წავშალოთ?</span><button className="teacher-cancel" type="button" disabled={busy} onClick={() => void act(async () => { await store!.remove(selected, s); await refresh(); setChecked((v) => v.filter((id) => id !== s.id)); setCards(null); setConfirm(null); }, 'მოსწავლე კლასიდან ამოღებულია; ანგარიში შენარჩუნებულია.')}>დიახ, ამოღება</button><button className="teacher-cancel" type="button" onClick={() => setConfirm(null)}>არა</button></> : <button className="teacher-cancel" type="button" disabled={busy} onClick={() => setConfirm(`remove:${s.id}`)}>კლასიდან ამოღება</button>}</div>}</li>)}</ul></>}
      </>}
      {cards && <div className="classroom-preview"><h3>ბარათების წინასწარი ნახვა</h3><p>ანგარიშის სტატუსი და შესვლის მონაცემები ვერ მოწმდება. ადმინისტრატორმა უნდა დაასრულოს ან გადაამოწმოს ანგარიშის დაყენება. PDF-ისთვის აირჩიეთ შენახვა ბეჭდვის ფანჯარაში.</p><Cards students={cards} classroom={selected.name} test={test} /><button className="teacher-button" type="button" disabled={busy} onClick={print}>ბეჭდვა / PDF-ად შენახვა</button></div>}
      {cards && createPortal(<div className="classroom-print-document" aria-hidden={!printReady}><Cards students={cards} classroom={selected.name} test={test} /></div>, document.body)}
    </section>}
  </div>;
}
