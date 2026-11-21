import { Link } from '../router';
import { Flame } from './Flame';
import './streaks.css';

/** No local activity or test-account data is promoted to verified streak data. */
export function StreakCard() {
  return <section className="streak-dashboard-card" aria-labelledby="dashboard-streak-title">
    <span className="streak-dashboard-flame"><Flame /></span>
    <div className="streak-dashboard-copy">
      <p className="streak-eyebrow">ერთი სასწავლო დღე ნაბიჯ-ნაბიჯ</p>
      <h2 id="dashboard-streak-title">სწავლის სერია</h2>
      <p>სერიის მონაცემები ჯერ მიუწვდომელია.</p>
      <dl className="streak-dashboard-stats">
        <div><dt>მიმდინარე</dt><dd>—</dd></div>
        <div><dt>რეკორდი</dt><dd>—</dd></div>
        <div><dt>დღეს</dt><dd>უცნობია</dd></div>
        <div><dt>დაცვა</dt><dd>უცნობია</dd></div>
      </dl>
    </div>
    <div className="streak-dashboard-actions"><Link className="btn btn-primary btn-small" to="/student/streaks">სერიის ნახვა <span aria-hidden="true">→</span></Link><Link className="streak-text-link" to="/student/lessons">გააგრძელე სწავლა</Link></div>
  </section>;
}
