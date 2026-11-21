import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ACHIEVEMENTS, CATEGORIES, TIER_LABELS, type Achievement, type AchievementCategory } from '../../achievements/catalog';
import { BadgeArt } from '../../achievements/BadgeArt';
import { PageIntro } from './PageIntro';
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
  const [category, setCategory] = useState<AchievementCategory | 'all'>('all');
  const [selected, setSelected] = useState<Achievement | null>(null);
  const visible = category === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter((item) => item.category === category);
  return <div className="student-page achievements-page">
    <PageIntro eyebrow="შენი კოლექცია" title="მიღწევები" description="ყოველი წინ გადადგმული ნაბიჯი აღნიშვნის ღირსია." />
    <section className="achievement-summary" aria-labelledby="achievement-summary-title">
      <div className="achievement-summary-icon" aria-hidden="true">✦</div>
      <div>
        <p className="achievement-overline">შენი კოლექცია</p>
        <h2 id="achievement-summary-title">28 სამახსოვრო ნიშანი</h2>
        <p>მიღებული ნიშნების რაოდენობა და პროგრესი ჯერ მიუწვდომელია.</p>
      </div>
      <span className="achievement-summary-count" aria-label="მიღებული ნიშნების რაოდენობა მიუწვდომელია 28 შესაძლო ნიშნიდან">— <small>/ 28</small></span>
    </section>
    <aside className="achievement-info" role="status">
      <svg className="achievement-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 10v6M12 7h.01" /></svg>
      <p><strong>მიღწევების დადასტურება ჯერ მზად არ არის.</strong> შეგიძლია დაათვალიერო ნიშნები და მათი პირობები. შენი მიღწევებისა და პროგრესის შემოწმება აქ მოგვიანებით გახდება შესაძლებელი.</p>
    </aside>
    <section aria-labelledby="achievement-gallery-title">
      <div className="achievement-gallery-heading"><div><p className="achievement-overline">გამოიკვლიე</p><h2 id="achievement-gallery-title">ყველა ნიშანი</h2></div><p aria-live="polite">{visible.length} ნიშანი</p></div>
      <div className="achievement-filters" role="group" aria-label="მიღწევების კატეგორია">
        {CATEGORIES.map((item) => <button key={item.id} type="button" aria-pressed={category === item.id} className={category === item.id ? 'is-active' : ''} onClick={() => setCategory(item.id)}>{item.label}</button>)}
      </div>
      <div className="achievement-grid">
        {visible.map((item) => <button type="button" key={item.id} className="achievement-card" onClick={() => setSelected(item)} aria-label={`${item.name}${item.tier ? ` · ${TIER_LABELS[item.tier]}` : ''} — იხილე პირობები`}>
          <div className="achievement-card-top"><span>{item.id}</span><span>↗</span></div>
          <BadgeArt achievement={item} />
          <span className="achievement-category">{categoryLabel(item.category)}{item.tier ? ` · ${TIER_LABELS[item.tier]}` : ''}</span>
          <strong>{item.name}</strong>
          <span className="achievement-description">{item.requirement.split('. ')[0]}</span>
          <span className="achievement-card-status"><span aria-hidden="true">◷</span> ჯერ ვერ მოწმდება</span>
        </button>)}
      </div>
    </section>
    {selected && <Detail item={selected} onClose={() => setSelected(null)} />}
  </div>;
}
