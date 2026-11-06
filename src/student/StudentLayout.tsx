import { useEffect, type ReactNode } from 'react';
import { Link } from '../router';
import { STUDENT_NAV } from './navItems';
import { useStudentSession } from './session';

const BrandMark = () => (
  <span className="brand-mark" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8 8h.01M16 8h.01M8 16h.01M16 16h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  </span>
);

export function StudentLayout({ children }: { children: ReactNode }) {
  const { student, signOut } = useStudentSession();

  // The landing page can leave `overflow: hidden` behind when navigating
  // straight from its mobile menu into the student area.
  useEffect(() => {
    document.body.style.overflow = '';
  }, []);

  return (
    <div className="student-shell">
      <button
        type="button"
        className="skip-link"
        onClick={() => document.getElementById('student-main')?.focus()}
      >
        მთავარ შიგთავსზე გადასვლა
      </button>

      <header className="student-header">
        <div className="student-container student-header-inner">
          <Link to="/student" className="brand student-brand" aria-label="მოსწავლის დაფა">
            <BrandMark />
            <span>
              <span className="brand-name">Axiom Academy</span>
              <span className="brand-sub">მოსწავლის გარემო</span>
            </span>
          </Link>

          <div className="student-header-actions">
            <Link to="/" className="student-site-link">
              მთავარი გვერდი
            </Link>

            {student && (
              <div className="student-chip" aria-label={`მოსწავლე: ${student.name}, ${student.grade}`}>
                <span className="student-avatar" aria-hidden="true">
                  {student.initials}
                </span>
                <span className="student-chip-text">
                  <span className="student-chip-name">{student.name}</span>
                  <span className="student-chip-grade">{student.grade}</span>
                </span>
              </div>
            )}

            {student && (
              <button
                type="button"
                className="student-signout"
                onClick={signOut}
                aria-label="მოსწავლის ანგარიშიდან გასვლა"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="m16 17 5-5-5-5M21 12H9" />
                </svg>
                <span className="signout-label">გასვლა</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="student-main" className="student-main" tabIndex={-1}>
        {children}
      </main>

      <footer className="student-footer">
        <div className="student-container student-footer-inner">
          <span>© {new Date().getFullYear()} Axiom Academy • მოსწავლის დემო გარემო</span>
          {/*
            Always-visible fallback navigation. If the bubble animation fails or
            a user prefers a plain list, every student section stays reachable.
          */}
          <nav className="student-footer-nav" aria-label="სწრაფი ნავიგაცია">
            {STUDENT_NAV.map((item) => (
              <Link key={item.key} to={item.to}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
