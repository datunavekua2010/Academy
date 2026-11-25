import { Link } from '../router';
import { useStudentSession } from './session';
import { LoadingScreen } from '../components/LoadingScreen';

export function StudentSignIn() {
  const { signOut, mode, status, error, signedIn } = useStudentSession();
  return (
    <div className="student-container signin-wrap">
      <div className="signin-card">
        <span className="eyebrow"><span className="eyebrow-dot" /> მოსწავლის შესვლა</span>
        <h1>გამარჯობა! 👋</h1>
        {status === 'loading' ? <LoadingScreen compact /> : <>
          {signedIn ? <p>მოსწავლის სივრცეზე წვდომა ვერ დადასტურდა. აირჩიე მოსწავლის სივრცე ანგარიშის გვერდზე.</p> : <p>შედი ელფოსტითა და პაროლით.</p>}
          {error && <p role="alert">{error}</p>}
          <p><Link to="/account/login">ანგარიშში შესვლა ან სივრცის არჩევა</Link></p>
          {signedIn && <p><Link to="/account/status">ანგარიშის ნომერი</Link></p>}
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
