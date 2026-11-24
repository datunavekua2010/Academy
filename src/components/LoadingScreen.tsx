import './loadingScreen.css';

type LoadingScreenProps = { compact?: boolean; message?: string };

/** Used only while real work is pending; it never introduces an artificial delay. */
export function LoadingScreen({ compact = false, message = 'იტვირთება…' }: LoadingScreenProps) {
  const content = <div className="axiom-loading-content" role="status" aria-live="polite">
    <div className="axiom-loading-art" aria-hidden="true"><span className="axiom-loading-orbit" /><span className="axiom-loading-spark spark-one">✦</span><span className="axiom-loading-spark spark-two">✳</span><span className="axiom-loading-mark">✦</span></div>
    {!compact && <p className="axiom-loading-brand">Axiom <strong>Academy</strong></p>}
    <p className="axiom-loading-message">{message}</p>
    <p className="axiom-loading-hint">ცოტაც და მზად იქნება</p>
    <div className="axiom-loading-dots" aria-hidden="true"><span /><span /><span /></div>
  </div>;
  return compact ? <div className="axiom-loading axiom-loading-compact">{content}</div> : <main className="axiom-loading axiom-loading-full">{content}</main>;
}
