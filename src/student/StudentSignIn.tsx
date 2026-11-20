import { useState, type FormEvent } from 'react';
import { Link } from '../router';
import { useStudentSession } from './session';

export function StudentSignIn() {
  const { signIn, signInWithPassword, signOut, mode, status, error, signedIn } = useStudentSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const handleDemoSignIn = () => {
    signIn();
    window.requestAnimationFrame(() => document.getElementById('student-main')?.focus({ preventScroll: true }));
  };
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
        {mode === 'demo' ? <>
          <p>ეს არის მოსწავლის დაფის დემო გარემო. რეალურ სისტემაში აქ მოხდება აკადემიის ანგარიშით ავტორიზაცია — ნავიგაცია მას არ ცვლის.</p>
          <button type="button" className="btn btn-primary" onClick={handleDemoSignIn} autoFocus>შესვლა დემო მოსწავლედ</button>
          <p className="demo-note">დემო რეჟიმი: მონაცემები არ გაიგზავნება სერვერზე.</p>
        </> : status === 'loading' ? <p role="status">იტვირთება…</p> : <>
          <p>შედი აკადემიის მიერ შექმნილი ანგარიშით.</p>
          {error && <p role="alert">{error}</p>}
          {mode === 'connected' && !signedIn && <form onSubmit={submit} className="academy-signin-form">
            <label>ელფოსტა<input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label>პაროლი<input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'იტვირთება…' : 'შესვლა'}</button>
          </form>}
          {signedIn && <button type="button" className="btn btn-ghost" onClick={signOut}>ანგარიშიდან გასვლა</button>}
        </>}
        <Link to="/" className="text-link"><span aria-hidden="true">←</span> მთავარ გვერდზე დაბრუნება</Link>
      </div>
    </div>
  );
}
