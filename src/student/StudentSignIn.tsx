import { Link } from '../router';
import { useStudentSession } from './session';

/**
 * Demo sign-in gate. The student area is never rendered without a session;
 * in the real product this is where the school's auth provider would redirect.
 */
export function StudentSignIn() {
  const { signIn } = useStudentSession();

  const handleSignIn = () => {
    signIn();
    // The gate is replaced by the dashboard; move focus into the new content.
    window.requestAnimationFrame(() => {
      document.getElementById('student-main')?.focus({ preventScroll: true });
    });
  };

  return (
    <div className="student-container signin-wrap">
      <div className="signin-card">
        <span className="eyebrow">
          <span className="eyebrow-dot" /> მოსწავლის შესვლა
        </span>
        <h1>გამარჯობა! 👋</h1>
        <p>
          ეს არის მოსწავლის დაფის დემო გარემო. რეალურ სისტემაში აქ მოხდება
          აკადემიის ანგარიშით ავტორიზაცია — ნავიგაცია მას არ ცვლის.
        </p>
        <button type="button" className="btn btn-primary" onClick={handleSignIn} autoFocus>
          შესვლა დემო მოსწავლედ
        </button>
        <p className="demo-note">
          დემო რეჟიმი: მონაცემები არ ინახება და არ გაიგზავნება სერვერზე.
        </p>
        <Link to="/" className="text-link">
          <span aria-hidden="true">←</span> მთავარ გვერდზე დაბრუნება
        </Link>
      </div>
    </div>
  );
}
