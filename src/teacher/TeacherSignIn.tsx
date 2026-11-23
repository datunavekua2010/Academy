import { useRef, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { RecoveryRequest } from '../account/PasswordRecovery';
import { recoveryClient } from '../lib/passwordRecovery';
import { signupClient } from '../lib/accountSignup';
import { googleAuthClient } from '../lib/googleAuth';
import { GoogleAuthButton } from '../account/GoogleAuth';
import { Link } from '../router';

/** Authentication is only offered for accounts already provisioned by the academy. */
export function TeacherSignIn({ client, onSignedIn }: { client: SupabaseClient; onSignedIn: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try {
      const result = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      // The workspace independently verifies the user, profile and role. A successful
      // password alone never grants access; onAuthStateChange also triggers rechecking.
      onSignedIn();
    } catch { setError('შესვლა ვერ მოხერხდა. შეამოწმეთ მონაცემები ან დაუკავშირდით აკადემიას.'); }
    finally { pending.current = false; setBusy(false); setPassword(''); }
  };
  return <>
    <p>ამ გვერდისთვის საჭიროა მასწავლებლის ავტორიზებული ანგარიში. შედით აკადემიის მიერ მოწოდებული მონაცემებით.</p>
    {error && <p role="alert">{error}</p>}
    <form className="teacher-signin" onSubmit={submit}>
      <label>ელფოსტა<input type="email" required autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} /></label>
      <label>პაროლი<input type="password" required autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} /></label>
      <button type="submit" className="teacher-button" disabled={busy}>{busy ? 'იტვირთება…' : 'შესვლა'}</button>
    </form>
    <GoogleAuthButton client={googleAuthClient === client ? client : null} />
    {signupClient && <p><Link to="/account/register">ანგარიშის მოთხოვნა</Link></p>}
    {recoveryClient ? <RecoveryRequest client={recoveryClient} /> : <p>პაროლის აღსადგენად დაუკავშირდით აკადემიას.</p>}
  </>;
}

/** Do not claim sign-out succeeded when the Auth service reports an error. */
export function TeacherSignOut({ client }: { client: SupabaseClient }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const signOut = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { const result = await client.auth.signOut(); if (result.error) throw result.error; }
    catch { setError('გასვლა ვერ მოხერხდა. სცადეთ ხელახლა.'); }
    finally { pending.current = false; setBusy(false); }
  };
  return <div className="teacher-signout"><button type="button" className="teacher-cancel" onClick={() => void signOut()} disabled={busy}>ანგარიშიდან გასვლა</button>{error && <p role="alert">{error}</p>}</div>;
}
