import { useState, type FormEvent } from 'react';
import { Link } from '../router';
import { useStudentSession } from './session';

export function StudentSignIn() {
  const { signInWithPassword, signOut, mode, status, error, signedIn } = useStudentSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try { await signInWithPassword(email.trim(), password); } finally { setSubmitting(false); setPassword(''); }
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
            <button type="submit" className="btn btn-primary" disabled={submitting || mode !== 'connected'}>{submitting ? 'იტვირთება…' : 'შესვლა'}</button>
          </form>}
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
