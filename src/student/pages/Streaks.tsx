import { Link } from '../../router';
import { STREAK_BADGES } from '../../streaks/catalog';
import { Flame } from '../../streaks/Flame';
import '../../streaks/streaks.css';

const WEEKDAYS = ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'];

/** The verified backend does not exist yet: every student-specific value is unknown. */
export function Streaks() {
  return <div className="student-page streak-page">
    <Link to="/student" className="back-link"><span aria-hidden="true">←</span> დაფაზე დაბრუნება</Link>
    <header className="streak-page-header"><p className="streak-eyebrow">ერთი სასწავლო დღე ნაბიჯ-ნაბიჯ</p><h1>სწავლის სერია</h1><p>შენი სასწავლო დღეები ერთ ადგილას.</p></header>
    <div className="streak-unavailable" role="status"><strong>სერიის შემოწმება ჯერ მზად არ არის.</strong> დადასტურებული სასწავლო დღეები, სერიის მონაცემები და ნიშნები აქ მოგვიანებით გამოჩნდება.</div>
    <div className="streak-layout">
      <div className="streak-main-column">
        <section className="streak-hero streak-panel" aria-labelledby="streak-current-title">
          <span className="streak-hero-flame"><Flame /></span>
          <p className="streak-hero-number" aria-label="მიმდინარე სერია უცნობია">—</p>
          <h2 id="streak-current-title">მიმდინარე სერია</h2>
          <p>სერიის მონაცემები ჯერ მიუწვდომელია.</p>
          <Link to="/student/lessons" className="btn btn-primary">გააგრძელე სწავლა <span aria-hidden="true">→</span></Link>
        </section>
        <section className="streak-panel streak-calendar" aria-labelledby="streak-calendar-title">
          <div className="streak-section-heading"><div><p className="streak-eyebrow">სასწავლო დღეები</p><h2 id="streak-calendar-title">კვირის კალენდარი</h2></div><span className="streak-zone">თბილისის დრო</span></div>
          <div className="streak-week" aria-label="კვირის დღეები; მონაცემები მიუწვდომელია">
            {WEEKDAYS.map((day) => <div key={day} className="streak-week-day"><span>{day}</span><span className="streak-day-unknown" aria-hidden="true">—</span></div>)}
          </div>
          <p className="streak-small-note">კალენდარი და თარიღები გამოჩნდება, როცა დადასტურებული მონაცემები ხელმისაწვდომი იქნება.</p>
        </section>
        <section className="streak-panel streak-badges" aria-labelledby="streak-badges-title">
          <p className="streak-eyebrow">საკუთარი ტემპით</p><h2 id="streak-badges-title">სერიის ნიშნები</h2><p>ნიშნის სტატუსი ჯერ ვერ მოწმდება.</p>
          <div className="streak-badge-grid">{STREAK_BADGES.map((badge) => <article key={badge.id} className="streak-badge">
            <span className="streak-badge-icon"><Flame /></span><h3>{badge.name}</h3><p>{badge.days} სასწავლო დღის სერია</p><span className="streak-badge-status">სტატუსი მიუწვდომელია</span>
          </article>)}</div>
        </section>
      </div>
      <aside className="streak-side-column" aria-label="სერიის ინფორმაცია">
        <section className="streak-panel streak-record"><p className="streak-eyebrow">შენი რეკორდი</p><h2>ყველაზე გრძელი სერია</h2><p className="streak-record-number" aria-label="რეკორდი უცნობია">—</p><p>მონაცემები ჯერ მიუწვდომელია.</p></section>
        <section className="streak-panel streak-freeze"><p className="streak-eyebrow">სერიის დაცვა</p><h2><span aria-hidden="true">❄</span> ავტომატური დაცვა</h2><p>დაცვის ხელმისაწვდომობა ჯერ უცნობია.</p><p>ხელმისაწვდომ დაცვას შეუძლია სერიის შენარჩუნება ერთი გამოტოვებული დღის გადაბმისას. დაცული დღე სასწავლო დღედ არ ითვლება.</p></section>
        <section className="streak-panel streak-explanation"><h2>როგორ მუშაობს?</h2><p>სასწავლო დღედ ჩაითვლება დასრულებული გაკვეთილი ან ერთ ვალიდურ სავარჯიშო სესიაში 10 განსხვავებულ კითხვაზე მიღებული პასუხი, როცა მათი დადასტურება შესაძლებელი გახდება.</p><p>ყველა დღე განისაზღვრება თბილისის დროით.</p></section>
      </aside>
    </div>
  </div>;
}
