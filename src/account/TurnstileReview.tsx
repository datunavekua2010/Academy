import { useRef, useState } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { TEST_ACCOUNT_MODE } from '../student/accountMode';

/** Review-only: two independent single-use tokens, one for the Worker and one for Supabase Auth.
 * The Worker precheck is NOT an auth boundary: enforce CAPTCHA in Supabase too. */
export function useTurnstileReview() {
  const enabled = !TEST_ACCOUNT_MODE || import.meta.env.VITE_TURNSTILE_REVIEW === 'true';
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? '';
  const worker = useRef<TurnstileInstance>(null), auth = useRef<TurnstileInstance>(null);
  const [workerToken, setWorkerToken] = useState(''), [authToken, setAuthToken] = useState('');
  const pending = useRef(false);
  const reset = () => { setWorkerToken(''); setAuthToken(''); worker.current?.reset(); auth.current?.reset(); };
  const verify = async (): Promise<string | undefined> => {
    if (!enabled) return undefined;
    if (!siteKey || !workerToken || !authToken || pending.current || workerToken === authToken) throw new Error('Verification unavailable');
    pending.current = true;
    try {
      const response = await fetch('/api/auth/turnstile-verify', { method:'POST', credentials:'same-origin', headers:{'content-type':'application/json'}, body:JSON.stringify({token:workerToken}) });
      // A static SPA fallback can return 200 HTML for an unrouted API path.
      // Only the verifier's explicit success status is accepted.
      if (response.status !== 204) throw new Error('Verification unavailable');
      return authToken;
    } finally { pending.current = false; }
  };
  const widgets = !enabled ? null : !siteKey ? <p role="alert">უსაფრთხოების შემოწმება მიუწვდომელია.</p> : <div className="turnstile-review">
    <p>გაიარეთ უსაფრთხოების ორივე შემოწმება.</p>
    <Turnstile ref={worker} siteKey={siteKey} options={{ action:'academy_auth' }} onSuccess={setWorkerToken} onExpire={() => setWorkerToken('')} onError={() => setWorkerToken('')} />
    <Turnstile ref={auth} siteKey={siteKey} options={{ action:'supabase_auth' }} onSuccess={setAuthToken} onExpire={() => setAuthToken('')} onError={() => setAuthToken('')} />
  </div>;
  return { widgets, ready: !enabled || Boolean(siteKey && workerToken && authToken && workerToken !== authToken), verify, reset };
}
