import { useEffect, useRef, useState, type CSSProperties, type Ref } from 'react';
import raccoonArt from '../assets/raccoon-mascot.png';

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
 * Axi — the curious raccoon. Click to make Axi think, or use the
 * mascot as a navigation trigger. The whole illustration can wave and bounce.
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
  const [mode, setMode] = useState<Mode>('idle');
  const [idx, setIdx] = useState(-1);
  const [bouncing, setBouncing] = useState(false);
  const timer = useRef<number>(0);
  const bounceTimer = useRef<number>(0);

  const text = idx < 0 ? (initialThought ?? thoughts[0]) : thoughts[idx];

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

  return (
    <div
      className={`mascot-root ${className}`}
      /* The `scale` prop seeds --mascot-propscale, which CSS consumes as the
         fallback for --mascot-scale. Seeding --mascot-scale directly would not
         work: it is an inline style, and inline styles beat every selector, so
         a placement could never override it. */
      style={{ '--mascot-propscale': scale } as CSSProperties}
    >
      {showThoughtBubble && text && (
        <div className="mascot-bubble" key={text}>
          {text}
        </div>
      )}

      <div className="mascot-scale">
        <div className="ground-shadow" />
        <div
          className={`mascot ${mode === 'waving' ? 'waving' : ''} ${mode === 'thinking' ? 'thinking' : ''} ${
            bouncing ? 'is-bouncing' : ''
          }`}
          role="img"
          aria-label="Axi — მეგობრული ენოტი"
        >
          <img className="mascot-art" src={raccoonArt} alt="" draggable={false} />
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
