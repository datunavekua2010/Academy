import { useEffect, useRef, useState, type Ref } from 'react';
import { FoxArt } from './FoxArt';

type Mode = 'idle' | 'thinking' | 'waving';

interface MascotProps {
  /** 1 = original prototype size (220 × 248) */
  scale?: number;
  /** Phrases Axi cycles through when clicked */
  thoughts: string[];
  /** Phrase shown first */
  initialThought?: string;
  /** Wave hello shortly after mounting */
  waveOnMount?: boolean;
  className?: string;
  /**
   * When provided, the mascot becomes a navigation trigger: clicking calls
   * this instead of cycling thoughts, and a short bounce confirms the tap.
   */
  onClick?: () => void;
  /** Accessible name for the mascot button. */
  buttonLabel?: string;
  /** Ref to the underlying button, so a menu can restore focus to Axi. */
  buttonRef?: Ref<HTMLButtonElement>;
  /** Set when the mascot controls an expandable panel. */
  ariaExpanded?: boolean;
  ariaControls?: string;
  /** Hide the speech bubble (used by the dashboard navigation). */
  showThoughtBubble?: boolean;
}

/**
 * Axi — the curious red fox.
 *
 * Eyes follow the cursor, click to make Axi think, waves hello on load.
 * The animation contract (eye tracking, blink, wave, bounce, thinking) is
 * independent of the anatomy, so the fox keeps every owl behaviour.
 */
export function Mascot({
  scale = 1,
  thoughts,
  initialThought,
  waveOnMount = true,
  className = '',
  onClick,
  buttonLabel,
  buttonRef,
  ariaExpanded,
  ariaControls,
  showThoughtBubble = true,
}: MascotProps) {
  const root = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('idle');
  const [idx, setIdx] = useState(-1);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [bouncing, setBouncing] = useState(false);
  const timer = useRef<number>(0);
  const bounceTimer = useRef<number>(0);

  const text = idx < 0 ? (initialThought ?? thoughts[0]) : thoughts[idx];

  // eyes follow pointer
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = root.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height * 0.35);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 160);
      setLook({ x: (dx / d) * 7 * k, y: (dy / d) * 5 * k });
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // friendly wave on load
  useEffect(() => {
    if (!waveOnMount) return;
    const t1 = window.setTimeout(() => setMode('waving'), 700);
    const t2 = window.setTimeout(() => setMode((m) => (m === 'waving' ? 'idle' : m)), 2700);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [waveOnMount]);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(bounceTimer.current);
    },
    [],
  );

  const poke = () => {
    setIdx((i) => (i + 1) % thoughts.length);
    setMode('thinking');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMode('idle'), 2600);
  };

  const handleClick = () => {
    if (!onClick) {
      poke();
      return;
    }
    setBouncing(false);
    // restart the animation on repeated taps
    window.requestAnimationFrame(() => setBouncing(true));
    window.clearTimeout(bounceTimer.current);
    bounceTimer.current = window.setTimeout(() => setBouncing(false), 560);
    onClick();
  };

  const pupil = mode === 'thinking' ? { x: 7, y: -5 } : look;
  const pupilStyle = { transform: `translate(${pupil.x}px, ${pupil.y}px)` };

  return (
    <div
      ref={root}
      className={`mascot-root ${className}`}
      style={{ width: 220 * scale, height: 248 * scale }}
    >
      {showThoughtBubble && text && (
        <div className="mascot-bubble" key={text}>
          {text}
        </div>
      )}

      <div className="mascot-scale" style={{ transform: `scale(${scale})` }}>
        <div className="ground-shadow" />
        <div
          className={`mascot ${mode === 'waving' ? 'waving' : ''} ${mode === 'thinking' ? 'thinking' : ''} ${
            bouncing ? 'is-bouncing' : ''
          }`}
          role="img"
          aria-label="Axi — მეგობრული წითელი მელა"
        >
          {/* Inlined so the eyes, tail and spark stay individually animatable. */}
          <FoxArt pupilStyle={pupilStyle} />
        </div>
      </div>

      <button
        ref={buttonRef}
        type="button"
        className="mascot-btn"
        onClick={handleClick}
        aria-label={buttonLabel ?? 'Axi-ს დაწკაპუნება — რას ფიქრობს?'}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
      />
    </div>
  );
}
