import { useState, type FormEvent } from 'react';
import { Link } from '../router';
import { useStudentSession } from './session';
import { RecoveryRequest } from '../account/PasswordRecovery';
import { recoveryClient } from '../lib/passwordRecovery';
import { signupClient } from '../lib/accountSignup';
import { googleAuthClient } from '../lib/googleAuth';
import { GoogleAuthButton } from '../account/GoogleAuth';
import { useTurnstileReview } from '../account/TurnstileReview';

export function StudentSignIn() {
  const { signInWithPassword, signOut, mode, status, error, signedIn } = useStudentSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [captchaError, setCaptchaError] = useState('');
  const captcha = useTurnstileReview();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true); setCaptchaError('');
    try { const token = await captcha.verify(); await signInWithPassword(email.trim(), password, token); }
    catch { setCaptchaError('უსაფრთხოების შემოწმება ვერ მოხერხდა. სცადეთ ხელახლა.'); }
    finally { captcha.reset(); setSubmitting(false); setPassword(''); }
  };
  return (
    <div className="student-container signin-wrap">
      <div className="signin-card">
        <span className="eyebrow"><span className="eyebrow-dot" /> მოსწავლის შესვლა</span>
        <h1>გამარჯობა! 👋</h1>
        {status === 'loading' ? <p role="status">იტვირთება…</p> : <>
          <p>შედი აკადემიის მიერ მოწოდებული ელფოსტითა და პაროლით.</p>
          {error && <p role="alert">{error}</p>}
          {!signedIn && <form onSubmit={submit} className="academy-signin-form">
            <label>ელფოსტა<input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label>პაროლი<input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            {captcha.widgets}{captchaError && <p role="alert">{captchaError}</p>}
            <button type="submit" className="btn btn-primary" disabled={submitting || !captcha.ready || mode !== 'connected'}>{submitting ? 'იტვირთება…' : 'შესვლა'}</button>
          </form>}
          {!signedIn && mode === 'connected' && <GoogleAuthButton client={googleAuthClient} />}
          {!signedIn && mode === 'connected' && <RecoveryRequest client={recoveryClient} />}
          {!signedIn && signupClient && <p><Link to="/account/register">ანგარიშის მოთხოვნა</Link></p>}
          {signedIn && (signupClient || googleAuthClient) && <p><Link to="/account/status">ანგარიშის ნომერი</Link></p>}
          {signedIn && <button type="button" className="btn btn-ghost" onClick={signOut}>ანგარიშიდან გასვლა</button>}
        </>}
        {status === 'ready' && !signedIn && mode !== 'invalid' && (
          <p className="guest-preview-links">ანგარიშის გარეშე შეგიძლია ნახო <Link to="/student/practice">სავარჯიშოები</Link> და <Link to="/student/lessons">გაკვეთილები</Link>.</p>
        )}
        <Link to="/" className="text-link"><span aria-hidden="true">←</span> მთავარ გვერდზე დაბრუნება</Link>
      </div>
    </div>
  );
}
