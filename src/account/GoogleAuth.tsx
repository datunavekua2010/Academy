import { useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Link } from '../router';
import { startGoogleAuth } from '../lib/googleAuth';
import { startGoogleProof } from '../lib/googleProof';
import { LoginLayout, RoleChoices } from './LoginPreview';
import './passwordRecovery.css';

export function GoogleAuthButton({ client, allowed = true }: { client: SupabaseClient | null; allowed?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  if (!client) return null;
  const start = async () => {
    if (pending.current) return;
    if (!allowed) { setError('ჯერ დაადასტურეთ, რომ სრულწლოვანი ხართ და ანგარიშის მოთხოვნის უფლება გაქვთ.'); return; }
    pending.current = true; setBusy(true); setError('');
    try { await startGoogleAuth(client, window.location.origin, window.location.pathname, window.sessionStorage); }
    catch { setError('Google-ით შესვლა ვერ დაიწყო. თუ უკვე შესული ხართ, ჯერ გამოდით ანგარიშიდან და სცადეთ ხელახლა.'); pending.current = false; setBusy(false); }
  };
  return <div><button type="button" disabled={busy} onClick={() => void start()}>{busy ? 'იტვირთება…' : 'Google-ით გაგრძელება'}</button>
    <p>Google-ით პირველად გაგრძელებამ შეიძლება შექმნას ანგარიში. აკადემიის როლი და კავშირები ცალკე დადასტურებას საჭიროებს.</p>{error && <p role="alert">{error}</p>}</div>;
}

/** Retry an expired/missing proof for the existing OAuth session, never grant a role. */
export function GoogleProofButton({ client }: { client: SupabaseClient | null }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  if (!client || import.meta.env.VITE_GOOGLE_PROOF_REVIEW !== 'true') return null;
  const start = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { window.location.assign(await startGoogleProof(client)); }
    catch { setError('Google-ით დადასტურება ვერ დაიწყო. საჭიროების შემთხვევაში გამოდით და Google-ით კვლავ შედით.'); pending.current = false; setBusy(false); }
  };
  return <div><button type="button" disabled={busy} onClick={() => void start()}>{busy ? 'იტვირთება…' : 'Google-ით ხელახლა დადასტურება'}</button>{error && <p role="alert">{error}</p>}</div>;
}

export function GoogleCallback({ result }: { result: 'ok' | 'error' }) {
  if (result === 'ok') return <LoginLayout>
    <p role="status" className="role-choice-intro">Google ანგარიში დადასტურდა. აირჩიეთ თქვენი სივრცე.</p>
    <RoleChoices includeTeacher={false} />
    <div className="login-session-actions"><p>აკადემიის როლი და კავშირები ცალკე დადასტურებას საჭიროებს.</p><Link to="/account/status">ანგარიშის ნომერი / ანგარიშიდან გასვლა</Link></div>
  </LoginLayout>;
  return <main className="recovery-page"><section className="recovery-card"><h1>Google-ით შესვლა</h1>
    <p role="alert">Google-ით შესვლა ვერ დადასტურდა. დაუკავშირდით აკადემიას ან სცადეთ ხელახლა იმავე ბრაუზერში.</p>
    <p><Link to="/account/status">ანგარიშის ნომერი</Link> · <Link to="/parent">მშობლის შესვლა</Link> · <Link to="/student">მოსწავლის შესვლა</Link></p>
  </section></main>;
}
