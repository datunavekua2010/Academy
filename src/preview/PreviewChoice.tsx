import { Link } from '../router';
import './preview.css';

/** Temporary navigation only: choosing a view never grants a real role. */
export function PreviewChoice() {
  return <main className="preview-choice">
    <header className="preview-choice-header"><a href="#home" className="preview-choice-brand"><span aria-hidden="true">✦</span> Axiom Academy</a><a href="#home" className="preview-site-link">ვებგვერდის ნახვა ↗</a></header>
    <div className="preview-choice-content">
      <p className="preview-choice-kicker"><span aria-hidden="true" /> Axiom Academy</p>
      <h1>რომელი სივრცის ნახვა გსურთ?</h1>
      <p className="preview-choice-intro">აირჩიეთ მოსწავლის ან მასწავლებლის გვერდი. ეს მხოლოდ დათვალიერებაა და ანგარიშით შესვლას არ ნიშნავს.</p>
      <div className="preview-choice-grid">
        <Link to="/student" className="preview-choice-card student-option">
          <span className="preview-choice-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11 16 5l12 6-12 6L4 11Z"/><path d="M9 14v7c4 4 10 4 14 0v-7M28 11v8"/></svg></span>
          <span className="preview-choice-name">მოსწავლე</span><span className="preview-choice-description">გაკვეთილები, სავარჯიშოები და მოსწავლის დაფა.</span><span className="preview-choice-action">მოსწავლის სივრცე <span aria-hidden="true">→</span></span>
        </Link>
        <Link to="/teacher" className="preview-choice-card teacher-option">
          <span className="preview-choice-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="24" height="16" rx="2"/><path d="M11 27h10M16 21v6M9 15l4-4 4 3 5-5"/></svg></span>
          <span className="preview-choice-name">მასწავლებელი</span><span className="preview-choice-description">მასწავლებლის სამუშაო სივრცის დათვალიერება.</span><span className="preview-choice-action">მასწავლებლის სივრცე <span aria-hidden="true">→</span></span>
        </Link>
      </div>
      <p className="preview-choice-note">მოსწავლის პროგრესი ინახება მხოლოდ ამ მოწყობილობაზე. მასწავლებლის სივრცეში რეალური მოსწავლეების მონაცემები არ ჩანს.</p>
    </div>
  </main>;
}
