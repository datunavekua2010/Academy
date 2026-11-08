import { SCORE_RULES } from '../scoring';

/** The 100-point rules, rendered from the engine's own constants. */
export function ScoringRules({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rules-card ${compact ? 'is-compact' : ''}`}>
      <div className="rules-head">
        <h3>100-ქულიანი სისტემა</h3>
        <p>სესია მთავრდება ზუსტად 100 ქულაზე. წესი განისაზღვრება პასუხამდე არსებული ქულით.</p>
      </div>
      <table className="rules-table">
        <thead>
          <tr>
            <th scope="col">ქულა პასუხამდე</th>
            <th scope="col">სწორი</th>
            <th scope="col">არასწორი</th>
          </tr>
        </thead>
        <tbody>
          {SCORE_RULES.map((rule) => (
            <tr key={rule.band}>
              <th scope="row">{rule.range}</th>
              <td className="is-correct">+{rule.correct}</td>
              <td className="is-wrong">−{Math.abs(rule.wrong)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!compact && (
        <p className="rules-note">
          ერთი და იგივე ბანკი და ერთი და იგივე ძრავა მუშაობს საშინაო დავალებაზეც და ვარჯიშზეც —
          განსხვავება მხოლოდ იმაშია, რომ საშინაო დავალება მასწავლებლის მიერ არის მონიშნული.
        </p>
      )}
    </div>
  );
}
