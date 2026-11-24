import { Link } from '../router';
import { useStudentSession } from './session';
import { googleAuthClient } from '../lib/googleAuth';
import { GoogleAuthButton, GoogleProofButton } from '../account/GoogleAuth';
import { LoadingScreen } from '../components/LoadingScreen';

export function StudentSignIn() {
  const { signOut, mode, status, error, signedIn } = useStudentSession();
  const googleAvailable = mode === 'connected' && Boolean(googleAuthClient);
  return (
    <div className="student-container signin-wrap">
      <div className="signin-card">
        <span className="eyebrow"><span className="eyebrow-dot" /> მოსწავლის შესვლა</span>
        <h1>გამარჯობა! 👋</h1>
        {status === 'loading' ? <LoadingScreen compact /> : <>
          {signedIn ? (
            <p>უკვე შესული ხარ. მოსწავლის სივრცეზე წვდომა ჯერ ვერ დადასტურდა. დაუკავშირდი აკადემიას.</p>
          ) : googleAvailable ? (
            <p>მოსწავლის სივრცეში შესასვლელად გამოიყენე Google.</p>
          ) : (
            <p>Google-ით შესვლა ამ გარემოში ამჟამად მიუწვდომელია. დაუკავშირდი აკადემიას.</p>
          )}
          {error && <p role="alert">{error}</p>}
          {!signedIn && googleAvailable && <GoogleAuthButton client={googleAuthClient} />}
          {signedIn && <GoogleProofButton client={googleAvailable ? googleAuthClient : null} />}
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
