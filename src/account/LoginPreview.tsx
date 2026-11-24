import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfiguration } from '../lib/supabase';
import { googleAuthClient, startGoogleAuth } from '../lib/googleAuth';
import { recoveryClient } from '../lib/passwordRecovery';
import { signupClient } from '../lib/accountSignup';
import { RecoveryRequest } from './PasswordRecovery';
import { useTurnstileReview } from './TurnstileReview';
import './loginPreview.css';

type AuthState = 'loading' | 'signed-out' | 'signed-in';

/** Authentication proves identity only. Each destination enforces its own role. */
export function LoginForm({ client, googleClient }: { client: SupabaseClient; googleClient: SupabaseClient | null }) {
  const [state, setState] = useState<AuthState>('loading');
  const stateRef = useRef<AuthState>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const captcha = useTurnstileReview();

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const next = session?.user ? 'signed-in' : 'signed-out';
      stateRef.current = next;
      setState(next);
      if (next === 'signed-in') setPassword('');
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [client]);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (pending.current || stateRef.current !== 'signed-out' || !captcha.ready) return;
    pending.current = true; setBusy(true); setError('');
    try {
      const token = await captcha.verify();
      // Do not replace a session that appeared in another tab while verifying.
      const current = await client.auth.getSession();
      if (current.error || current.data.session || stateRef.current !== 'signed-out') throw new Error('Session changed');
      const result = await client.auth.signInWithPassword({ email: email.trim(), password, ...(token ? { options: { captchaToken: token } } : {}) });
      if (result.error || !result.data.session) throw new Error('Sign in failed');
    } catch {
      setError('შესვლა ვერ მოხერხდა. შეამოწმეთ მონაცემები და უსაფრთხოების შემოწმება, ან სცადეთ მოგვიანებით.');
    } finally {
      captcha.reset(); setPassword(''); pending.current = false; setBusy(false);
    }
  };
  const google = async () => {
    if (!googleClient || pending.current || stateRef.current !== 'signed-out') return;
    pending.current = true; setBusy(true); setError('');
    try { await startGoogleAuth(googleClient, window.location.origin, window.location.pathname, window.sessionStorage); }
    catch { setError('Google-ით შესვლა ვერ დაიწყო. სცადეთ მოგვიანებით.'); pending.current = false; setBusy(false); }
  };
  const signOut = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { const result = await client.auth.signOut(); if (result.error) throw result.error; }
    catch { setError('ანგარიშიდან გასვლა ვერ მოხერხდა. სცადეთ ხელახლა.'); }
    finally { pending.current = false; setBusy(false); }
  };

  return <>
    {state === 'loading' && <p role="status">ანგარიში მოწმდება…</p>}
    {state === 'signed-out' && <>
      <p className="login-preview-subtitle">შედით თქვენი ელფოსტითა და პაროლით.</p>
      <form aria-label="ანგარიშში შესვლის ფორმა" onSubmit={event => void signIn(event)}>
        <fieldset disabled={busy}>
          <label htmlFor="login-preview-email">ელფოსტა</label>
          <input id="login-preview-email" type="email" placeholder="name@example.com" autoComplete="username" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} />
          <label htmlFor="login-preview-password">პაროლი</label>
          <input id="login-preview-password" type="password" placeholder="შეიყვანე პაროლი" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} />
          {captcha.widgets}
          <button type="submit" disabled={!captcha.ready}>{busy ? 'იტვირთება…' : 'შესვლა'} <span aria-hidden="true">→</span></button>
        </fieldset>
      </form>
      {googleClient ? <><div className="login-preview-divider" /><button type="button" className="login-google" disabled={busy} onClick={() => void google()}>Google-ით გაგრძელება</button><p className="login-preview-help">Google-ით პირველად გაგრძელებამ შეიძლება შექმნას ანგარიში. აკადემიის როლი და კავშირები ცალკე დადასტურებას საჭიროებს.</p></> : <p className="login-preview-help">Google-ით შესვლა ამ გარემოში ხელმისაწვდომი არ არის.</p>}
      <RecoveryRequest client={recoveryClient} />
      {signupClient && <p className="login-preview-help"><a href="#/account/register">ანგარიშის მოთხოვნა</a></p>}
    </>}
    {state === 'signed-in' && <div className="login-signed-in">
      <p role="status">ანგარიშში შესული ხართ. აირჩიეთ თქვენი სივრცე.</p>
      <p className="login-preview-help">ანგარიშში შესვლა ავტომატურად არ ანიჭებს აკადემიის როლს ან წვდომას.</p>
      <nav aria-label="აკადემიის სივრცეები"><a href="#/student">მოსწავლე</a><a href="#/parent">მშობელი</a><a href="#/teacher">მასწავლებელი</a><a href="#/account/status">ანგარიშის ნომერი</a></nav>
      <button type="button" disabled={busy} onClick={() => void signOut()}>ანგარიშიდან გასვლა</button>
    </div>}
    {error && <p role="alert" className="login-error">{error}</p>}
  </>;
}

export function LoginPreview() {
  useEffect(() => { document.title = 'ანგარიშში შესვლა — Axiom Academy'; }, []);
  return <div className="login-preview">
    <header className="login-preview-header">
      <a className="login-preview-brand" href="#home" aria-label="Axiom Academy — მთავარი">
        <span className="login-preview-brand-mark" aria-hidden="true">✦</span>
        <span>Axiom <strong>Academy</strong></span>
      </a>
      <a className="login-preview-back" href="#home"><span aria-hidden="true">←</span> მთავარ გვერდზე</a>
    </header>
    <main className="login-preview-main">
      <section className="login-preview-card" aria-labelledby="login-preview-title">
        <div className="login-preview-intro">
          <div className="login-preview-art" aria-hidden="true"><span>✦</span><i>+</i><b>∑</b><em>×</em></div>
          <p className="login-preview-kicker">AXIOM ACADEMY</p>
          <h1 id="login-preview-title">კეთილი იყოს<br />შენი დაბრუნება<span>.</span></h1>
          <p>სწავლა პატარა ნაბიჯებით, დიდი აღმოჩენებით და შენი საკუთარი ტემპით.</p>
          <div className="login-preview-quote"><span aria-hidden="true">✳</span><p>ყოველი ახალი ნაბიჯი<br /><strong>მეტი შესაძლებლობაა.</strong></p></div>
        </div>
        <div className="login-preview-form-panel">
          <p className="login-preview-eyebrow">შენი სასწავლო სივრცე</p>
          <h2>ანგარიშში შესვლა</h2>
          {supabaseConfiguration.client ? <LoginForm client={supabaseConfiguration.client} googleClient={googleAuthClient} /> : <p className="login-preview-notice" role="status">ანგარიშით შესვლა ამ გარემოში ჯერ არ არის ხელმისაწვდომი.</p>}
          <div className="login-preview-divider" />
          <a className="login-preview-explore" href="#home">პლატფორმის ნახვა <span aria-hidden="true">↗</span></a>
        </div>
      </section>
      <p className="login-preview-footer">Axiom Academy <span aria-hidden="true">·</span> ვისწავლოთ ერთად</p>
    </main>
  </div>;
}
