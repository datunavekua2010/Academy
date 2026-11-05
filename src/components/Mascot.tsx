import { useEffect, useRef, useState } from 'react';

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
}

/**
 * Axi — the curious owl (ported from the mascot prototype).
 * Eyes follow the cursor, click to make Axi think, waves hello on load.
 */
export function Mascot({ scale = 1, thoughts, initialThought, waveOnMount = true, className = '' }: MascotProps) {
  const root = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('idle');
  const [idx, setIdx] = useState(-1);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const timer = useRef<number>(0);

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

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const poke = () => {
    setIdx((i) => (i + 1) % thoughts.length);
    setMode('thinking');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMode('idle'), 2600);
  };

  const pupil = mode === 'thinking' ? { x: 7, y: -5 } : look;
  const pupilStyle = { transform: `translate(${pupil.x}px, ${pupil.y}px)` };

  return (
    <div
      ref={root}
      className={`mascot-root ${className}`}
      style={{ width: 220 * scale, height: 248 * scale }}
    >
      <div className="mascot-bubble" key={text}>
        {text}
      </div>

      <div className="mascot-scale" style={{ transform: `scale(${scale})` }}>
        <div className="ground-shadow" />
        <div className={`mascot ${mode === 'waving' ? 'waving' : ''} ${mode === 'thinking' ? 'thinking' : ''}`} role="img" aria-label="Axi — მეგობრული ლურჯი ბუ">
          <div className="wing wing-left" />
          <div className="wing wing-right" />
          <div className="ear ear-left" />
          <div className="ear ear-right" />
          <div className="m-body">
            <div className="belly">
              <div className="feather feather-one" />
              <div className="feather feather-two" />
              <div className="feather feather-three" />
            </div>
            <div className="eye eye-left">
              <div className="pupil" style={pupilStyle} />
              <div className="shine" style={pupilStyle} />
            </div>
            <div className="eye eye-right">
              <div className="pupil" style={pupilStyle} />
              <div className="shine" style={pupilStyle} />
            </div>
            <div className="beak" />
            <div className="cheek cheek-left" />
            <div className="cheek cheek-right" />
            <div className="feet">
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>

      <button type="button" className="mascot-btn" onClick={poke} aria-label="Axi-ს დაწკაპუნება — რას ფიქრობს?" />
    </div>
  );
}
