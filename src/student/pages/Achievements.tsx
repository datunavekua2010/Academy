import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ACHIEVEMENTS, CATEGORIES, TIER_LABELS, type Achievement, type AchievementCategory } from '../../achievements/catalog';
import { BadgeArt } from '../../achievements/BadgeArt';
import { Link } from '../../router';
import { useStudentSession } from '../session';
import './achievements.css';

function categoryLabel(category: AchievementCategory): string {
  return CATEGORIES.find((item) => item.id === category)?.label ?? '';
}

function Detail({ item, onClose }: { item: Achievement; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    close.current?.focus();
    return () => previous?.focus();
  }, []);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])') ?? []);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  return <div className="achievement-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="achievement-modal" ref={panel} role="dialog" aria-modal="true" aria-labelledby="achievement-detail-title" aria-describedby="achievement-detail-requirement" onKeyDown={onKeyDown}>
      <button ref={close} type="button" className="achievement-modal-close" aria-label="დახურვა" onClick={onClose}>×</button>
      <BadgeArt achievement={item} />
      <p className="achievement-overline">{categoryLabel(item.category)}{item.tier ? ` · ${TIER_LABELS[item.tier]}` : ''}</p>
      <h2 id="achievement-detail-title">{item.name}{item.tier ? ` · ${TIER_LABELS[item.tier]}` : ''}</h2>
      <p>{item.description}</p>
      <h3>როგორ მიიღებ</h3>
      <p id="achievement-detail-requirement">{item.requirement}</p>
      <p className="achievement-status"><span aria-hidden="true">◷</span> დადასტურება ჯერ მიუწვდომელია</p>
      <button type="button" className="btn btn-primary" onClick={onClose}>გასაგებია</button>
    </div>
  </div>;
}

/** No verified server-side evaluator exists yet: unknown is not zero or locked. */
export function Achievements() {
  const { student, mode } = useStudentSession();
  const [category, setCategory] = useState<AchievementCategory | 'all'>('all');
  const [selected, setSelected] = useState<Achievement | null>(null);
  const visible = category === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter((item) => item.category === category);
  return <div className="student-page achievements-page">
    <Link to="/student" className="back-link achievement-back"><span aria-hidden="true">←</span> დაფაზე დაბრუნება</Link>
    <div className="achievement-dashboard">
      <aside className="achievement-sidebar" aria-label="მოსწავლის მიმოხილვა">
        <section className="achievement-profile">
          <div className="achievement-profile-cover" aria-hidden="true"><span /><i /><b /></div>
          <div className="achievement-profile-body">
            <span className="achievement-profile-avatar" aria-hidden="true">{student?.initials || '✦'}</span>
            <p className="achievement-overline">მოსწავლის გვერდი</p>
            <h2>{student?.name || 'მოსწავლე'}</h2>
            <p className="achievement-profile-grade">{student?.grade || 'კლასი არ არის მითითებული'}{mode === 'test' ? ' · სატესტო ანგარიში' : ''}</p>
            <Link to="/student/profile" className="achievement-profile-link">პროფილის ნახვა <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
        <section className="achievement-summary" aria-labelledby="achievement-summary-title">
          <div className="achievement-summary-heading"><h2 id="achievement-summary-title">ჩემი კოლექცია</h2><span aria-hidden="true">✦</span></div>
          <p className="achievement-summary-count" aria-label="მიღებული ნიშნების რაოდენობა მიუწვდომელია 28 შესაძლო ნიშნიდან">— <small>/ 28</small></p>
          <p className="achievement-summary-subtitle">28 სამახსოვრო ნიშანი</p>
          <div className="achievement-progress-track is-unavailable" aria-hidden="true" />
          <p className="achievement-summary-note">მიღებული ნიშნების რაოდენობა და პროგრესი ჯერ მიუწვდომელია.</p>
        </section>
      </aside>
      <div className="achievement-content">
        <header className="achievement-page-heading">
          <p className="achievement-overline">შენი კოლექცია</p>
          <h1>მიღწევები</h1>
          <p>ყოველი წინ გადადგმული ნაბიჯი აღნიშვნის ღირსია.</p>
        </header>
        <section className="achievement-next" aria-labelledby="achievement-next-title">
          <div className="achievement-next-icon" aria-hidden="true">↗</div>
          <div className="achievement-next-content">
            <p className="achievement-overline">შემდეგი ნაბიჯი</p>
            <h2 id="achievement-next-title">რომელ მიღწევასთან ხარ ყველაზე ახლოს?</h2>
            <p>ამის გასარკვევად დადასტურებული პროგრესია საჭირო. ის ჯერ მიუწვდომელია.</p>
            <div className="achievement-next-progress"><span>შემდეგი მიღწევის პროგრესი</span><strong aria-label="პროგრესი მიუწვდომელია">—</strong></div>
            <div className="achievement-progress-track is-unavailable" aria-hidden="true" />
          </div>
        </section>
        <aside className="achievement-info" role="status">
          <svg className="achievement-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 10v6M12 7h.01" /></svg>
          <p><strong>მიღწევების დადასტურება ჯერ მზად არ არის.</strong> შეგიძლია დაათვალიერო ნიშნები და მათი პირობები. შენი მიღწევებისა და პროგრესის შემოწმება აქ მოგვიანებით გახდება შესაძლებელი.</p>
        </aside>
        <section aria-labelledby="achievement-gallery-title">
          <div className="achievement-gallery-heading"><h2 id="achievement-gallery-title">ყველა ნიშანი</h2><p aria-live="polite">{visible.length} ნიშანი</p></div>
          <div className="achievement-filters" role="group" aria-label="მიღწევების კატეგორია">
            {CATEGORIES.map((item) => <button key={item.id} type="button" aria-pressed={category === item.id} className={category === item.id ? 'is-active' : ''} onClick={() => setCategory(item.id)}>{item.label}</button>)}
          </div>
          <div className="achievement-grid">
            {visible.map((item) => <button type="button" key={item.id} className="achievement-card" onClick={() => setSelected(item)} aria-label={`${item.name}${item.tier ? ` · ${TIER_LABELS[item.tier]}` : ''} — პროგრესი მიუწვდომელია, იხილე პირობები`}>
              <span className="achievement-card-top">{item.id}</span>
              <BadgeArt achievement={item} />
              <strong>{item.name}</strong>
              <span className="achievement-category">{categoryLabel(item.category)}{item.tier ? ` · ${TIER_LABELS[item.tier]}` : ''}</span>
              <span className="achievement-description">{item.requirement.split('. ')[0]}</span>
              <span className="achievement-card-progress"><span className="achievement-card-progress-label"><span>პროგრესი</span><strong>—</strong></span><span className="achievement-progress-track is-unavailable" aria-hidden="true" /></span>
              <span className="achievement-card-status"><span aria-hidden="true">◷</span> ჯერ ვერ მოწმდება</span>
            </button>)}
          </div>
        </section>
      </div>
    </div>
    {selected && <Detail item={selected} onClose={() => setSelected(null)} />}
  </div>;
}
