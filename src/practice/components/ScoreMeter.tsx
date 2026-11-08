import { MAX_SCORE, scoreBand } from '../scoring';

interface ScoreMeterProps {
  score: number;
  /** Show the 80 / 90 band markers. */
  markers?: boolean;
  label?: string;
}

const BAND_LABEL: Record<string, string> = {
  'below-80': '+4 / −2',
  '80-to-90': '+2 / −1',
  '90-to-100': '+1 / −1',
};

/** The one visual representation of a 0–100 session score. */
export function ScoreMeter({ score, markers = true, label = 'ქულა' }: ScoreMeterProps) {
  const band = scoreBand(score);
  const clamped = Math.min(MAX_SCORE, Math.max(0, score));

  return (
    <div className={`score-meter band-${band} ${clamped >= MAX_SCORE ? 'is-complete' : ''}`}>
      <div className="score-meter-head">
        <span className="score-meter-label">{label}</span>
        <span className="score-meter-value">
          <strong>{Math.round(clamped)}</strong>
          <span aria-hidden="true">/</span>
          <span className="score-meter-max">{MAX_SCORE}</span>
        </span>
      </div>
      <div
        className="score-meter-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={MAX_SCORE}
        aria-valuenow={Math.round(clamped)}
        aria-label={`${label}: ${Math.round(clamped)} ${MAX_SCORE}-დან`}
      >
        <div className="score-meter-fill" style={{ width: `${clamped}%` }} />
        {markers && (
          <>
            <span className="score-meter-mark mark-80" aria-hidden="true" />
            <span className="score-meter-mark mark-90" aria-hidden="true" />
          </>
        )}
      </div>
      <div className="score-meter-foot">
        <span className="score-meter-band">შემდეგი პასუხი: {BAND_LABEL[band]}</span>
        {markers && <span className="score-meter-legend">80 · 90</span>}
      </div>
    </div>
  );
}
