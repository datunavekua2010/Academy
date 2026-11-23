import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Link } from '../router';
import { requestRecovery, updateRecoveryPassword, type RecoveryReady } from '../lib/passwordRecovery';
import './passwordRecovery.css';

export type RecoveryResult = { ready: RecoveryReady } | { error: true };
export function RecoveryRequest({ client }: { client: SupabaseClient | null }) {
  const [open, setOpen] = useState(false); const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const pending = useRef(false);
  if (!client) return null;
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (pending.current) return;
    pending.current = true; setBusy(true); setError(''); setMessage('');
    try { await requestRecovery(client, email, window.location.origin, window.location.pathname); setMessage('თუ ანგარიშს ეს ელფოსტა აქვს, აღდგენის ინსტრუქციას მიიღებთ. გახსენით ბოლო ბმული იმავე ბრაუზერსა და მოწყობილობაზე.'); }
    catch { setError('მოთხოვნის გაგზავნა ვერ დადასტურდა. შეამოწმეთ ელფოსტა ან სცადეთ მოგვიანებით.'); }
    finally { pending.current = false; setBusy(false); }
  };
  return <div className="recovery-request">
    <button type="button" className="recovery-link" onClick={() => setOpen(x=>!x)} aria-expanded={open}>პაროლი დაგავიწყდათ?</button>
    {open && <form onSubmit={submit} className="recovery-form">
      <label>ანგარიშის ელფოსტა<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} /></label>
      <button type="submit" disabled={busy}>{busy ? 'იტვირთება…' : 'აღდგენის მოთხოვნა'}</button>
      {message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}
    </form>}
  </div>;
}

export function PasswordRecovery({ client, result }: { client: SupabaseClient | null; result: Promise<RecoveryResult> | null }) {
  const [state, setState] = useState<'loading'|'ready'|'error'|'done'|'signout-failed'>(result && client ? 'loading' : 'error');
  const [ready, setReady] = useState<RecoveryReady | null>(null);
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const pending = useRef(false);
  useEffect(() => { let active = true; if (result && client) void result.then(value => { if (!active) return; if ('ready' in value) {setReady(value.ready); setState('ready');} else setState('error'); }); return () => {active = false;}; }, [result, client]);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (!client || !ready || pending.current) return;
    if (password.length < 10 || password.length > 128) {setError('პაროლი უნდა შეიცავდეს 10–128 სიმბოლოს.');return;}
    if (password !== confirm) {setError('პაროლები არ ემთხვევა.');return;}
    pending.current = true; setBusy(true); setError('');
    try { const status=await updateRecoveryPassword(client, ready, password); setState(status === 'signed-out' ? 'done' : 'signout-failed'); setReady(null); }
    catch {setError('პაროლის შეცვლა ვერ დადასტურდა. შესაძლოა ის უკვე შეიცვალა. სცადეთ ახალი პაროლით შესვლა ან მოითხოვეთ ახალი ბმული.');}
    finally {pending.current=false;setBusy(false);setPassword('');setConfirm('');}
  };
  return <main className="recovery-page"><section className="recovery-card"><h1>პაროლის აღდგენა</h1>
    {state === 'loading' && <p role="status">ბმული მოწმდება…</p>}
    {state === 'error' && <p role="alert">ბმულის დადასტურება ვერ მოხერხდა. მოითხოვეთ ახალი ბმული და გახსენით იმავე ბრაუზერსა და მოწყობილობაზე.</p>}
    {state === 'ready' && <form onSubmit={submit} className="recovery-form">
      <p>შეიყვანეთ ახალი პაროლი.</p>
      <label>ახალი პაროლი<input type="password" required minLength={10} maxLength={128} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
      <label>გაიმეორეთ პაროლი<input type="password" required minLength={10} maxLength={128} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} /></label>
      {error && <p role="alert">{error}</p>}<button type="submit" disabled={busy}>{busy ? 'იტვირთება…' : 'პაროლის შეცვლა'}</button>
    </form>}
    {state === 'done' && <p role="status">პაროლი შეიცვალა. ახლა შეგიძლიათ შეხვიდეთ ახალი პაროლით.</p>}
    {state === 'signout-failed' && <p role="alert">პაროლი შეიცვალა, მაგრამ აღდგენის სესიიდან გამოსვლა ვერ დადასტურდა. დახურეთ ბრაუზერის ეს ჩანართი.</p>}
    <p><Link to="/student">მოსწავლის შესვლა</Link> · <Link to="/teacher">მასწავლებლის შესვლა</Link></p>
  </section></main>;
}
