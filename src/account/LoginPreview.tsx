import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfiguration } from '../lib/supabase';
import { chooseEmailRole, type SelfServiceRole } from '../lib/chooseEmailRole';
import { EmailSignIn } from './EmailSignIn';
import { navigate } from '../router';
import { LoadingScreen } from '../components/LoadingScreen';
import journeyIllustration from '../assets/account-journey.jpg';
import './loginPreview.css';

type AuthState = 'loading' | 'signed-out' | 'signed-in' | 'unavailable';

function StudentIcon() {
  return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M4.5 15 20 7l15.5 8L20 23 4.5 15Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M11 19v7c4.6 4.5 13.4 4.5 18 0v-7M35.5 15v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M34 28h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}
function ParentIcon() {
  return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 30.5s-11-6.7-11-14a5.8 5.8 0 0 1 11-2.5 5.8 5.8 0 0 1 11 2.5c0 7.3-11 14-11 14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M4 30c2.5-2.8 5.3-4 8.5-3.5M36 30c-2.5-2.8-5.3-4-8.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}

export function RoleChoices({ includeTeacher = true, enrollmentClient = null }: { includeTeacher?: boolean; enrollmentClient?: SupabaseClient | null }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const select = async (role: SelfServiceRole) => {
    if (!enrollmentClient || pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { await chooseEmailRole(enrollmentClient, role); navigate(`/${role}`); }
    catch { setError('ანგარიშის შექმნა ან წვდომის დადასტურება ვერ მოხერხდა. სცადეთ ხელახლა ან დაუკავშირდით აკადემიას.'); }
    finally { pending.current = false; setBusy(false); }
  };
  return <>
    <nav aria-label="აკადემიის სივრცეები" className="role-choice-grid" aria-busy={busy}>
      <a href="#/student" className="role-choice-card role-choice-student" aria-label="მოსწავლე" aria-disabled={busy || undefined}
        onClick={enrollmentClient ? event => { event.preventDefault(); void select('student'); } : undefined}>
        <span className="role-choice-icon"><StudentIcon /></span>
        <span className="role-choice-copy"><strong>მოსწავლე</strong><span>ვისწავლოთ და აღმოვაჩინოთ ერთად</span></span>
        <span className="role-choice-arrow" aria-hidden="true">↗</span>
      </a>
      <a href="#/parent" className="role-choice-card role-choice-parent" aria-label="მშობელი" aria-disabled={busy || undefined}
        onClick={enrollmentClient ? event => { event.preventDefault(); void select('parent'); } : undefined}>
        <span className="role-choice-icon"><ParentIcon /></span>
        <span className="role-choice-copy"><strong>მშობელი</strong><span>თვალი ადევნეთ შვილის პროგრესს</span></span>
        <span className="role-choice-arrow" aria-hidden="true">↗</span>
      </a>
    </nav>
    {error && <p role="alert">{error}</p>}
    {includeTeacher && <p className="role-choice-teacher">მასწავლებელი ხართ? <a href="#/teacher">მასწავლებლის შესვლა <span aria-hidden="true">↗</span></a></p>}
  </>;
}

/** A shared session proves identity only. Destinations check their own roles. */
export function LoginForm({ client }: { client: SupabaseClient | null }) {
  const [state, setState] = useState<AuthState>(client ? 'loading' : 'unavailable');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  useEffect(() => {
    if (!client) { setState('unavailable'); return; }
    let active = true;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (active) setState(session?.user ? 'signed-in' : 'signed-out');
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [client]);
  const signOut = async () => {
    if (!client || pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { const result = await client.auth.signOut(); if (result.error) throw result.error; }
    catch { setError('ანგარიშიდან გასვლა ვერ მოხერხდა. სცადეთ ხელახლა.'); }
    finally { pending.current = false; setBusy(false); }
  };
  if (state === 'loading') return <LoadingScreen compact message="ანგარიში მოწმდება…" />;
  return <>
    {state === 'signed-in' ? <p className="role-choice-intro" role="status">ანგარიშში შესული ხართ. აირჩიეთ თქვენი სივრცე.</p> : <p className="role-choice-intro">აირჩიეთ, რომელი სივრცით გსურთ სარგებლობა.</p>}
    {state === 'unavailable' && <p className="login-preview-notice" role="status">ანგარიშით შესვლა ამ გარემოში ჯერ არ არის ხელმისაწვდომი.</p>}
    {state === 'signed-in' && <RoleChoices enrollmentClient={client} />}
    {state === 'signed-out' && client && <><EmailSignIn client={client} /><p className="role-choice-teacher"><a href="#/teacher">მასწავლებლის შესვლა</a></p></>}
    {state === 'signed-in' ? <div className="login-session-actions">
      <p>აირჩიეთ მოსწავლის ან მშობლის სივრცე.</p>
      <a href="#/account/status">ანგარიშის ნომერი</a>
      <button type="button" disabled={busy} onClick={() => void signOut()}>{busy ? 'იტვირთება…' : 'ანგარიშიდან გასვლა'}</button>
    </div> : null}
    {error && <p role="alert" className="login-error">{error}</p>}
  </>;
}

export function LoginLayout({ children }: { children: ReactNode }) {
  return <div className="login-preview">
    <header className="login-preview-header">
      <a className="login-preview-brand" href="#home" aria-label="Axiom Academy — მთავარი"><span className="login-preview-brand-mark" aria-hidden="true">✦</span><span>Axiom <strong>Academy</strong></span></a>
      <a className="login-preview-back" href="#home"><span aria-hidden="true">←</span> მთავარ გვერდზე</a>
    </header>
    <main className="login-preview-main">
      <section className="login-preview-card" aria-labelledby="login-preview-title">
        <div className="login-preview-intro">
          <div className="login-preview-intro-text"><p className="login-preview-kicker"><span aria-hidden="true">✳</span> პატარა ნაბიჯები, დიდი აღმოჩენები</p><h1 id="login-preview-title">სწავლა უფრო<br /><em>ლამაზია ერთად.</em></h1><p>ადგილი ცნობისმოყვარეობისთვის, აღმოჩენებისთვის და ყოველდღიური პროგრესისთვის.</p></div>
          <img className="login-preview-illustration" src={journeyIllustration} alt="" />
          <div className="login-preview-intro-footer"><span>შენი სასწავლო თავგადასავალი</span><span aria-hidden="true">✦ &nbsp; ✦ &nbsp; ✦</span></div>
        </div>
        <div className="login-preview-form-panel">
          <div className="role-choice-kicker"><span aria-hidden="true" /> კეთილი იყოს თქვენი მობრძანება</div>
          <h2>ვისთვის არის სივრცე?</h2>
          {children}
          <div className="login-preview-divider" />
          <a className="login-preview-explore" href="#home"><span aria-hidden="true">←</span> პლატფორმის ნახვა</a>
        </div>
      </section>
      <p className="login-preview-footer">Axiom Academy <span aria-hidden="true">✳</span> ვისწავლოთ ერთად</p>
    </main>
  </div>;
}

export function LoginPreview() {
  useEffect(() => { document.title = 'ანგარიშში შესვლა — Axiom Academy'; }, []);
  return <LoginLayout><LoginForm client={supabaseConfiguration.client} /></LoginLayout>;
}
