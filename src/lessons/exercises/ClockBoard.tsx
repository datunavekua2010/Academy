import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  DEG_PER_HOUR,
  HOUR_HAND_LENGTH,
  MINUTE_HAND_LENGTH,
  angleAt,
  digitalPad,
  digitalText,
  faceNumbers,
  hourAngle,
  hourFromAngle,
  isHalfPast,
  isOClock,
  minuteAngle,
  minuteFromAngle,
  minuteHandNumber,
  pointAt,
  snapMinute,
  spokenTime,
  ticksPerFace,
  type ClockTime,
} from './ClockGeometry';

/**
 * Clock pictures for Unit 7. Every hand position is computed from the time (see `ClockGeometry`), so a clock drawn
 * here can never disagree with the time it claims to show, and the hour hand really does creep between the
 * numbers as the minutes pass.
 */

const r1 = (n: number): string => String(Math.round(n * 100) / 100);

const FACE_R = 62;
const SIZE = 140;
const CX = SIZE / 2;
const CY = SIZE / 2;

export type HandKind = 'hour' | 'minute';

/** Re-exported so answer controls can talk about a time in words without importing the geometry again. */
export { spokenTime };

/** "3 საათი და ნახევარი" plus digits, for prompts and accessible labels. */
export const clockName = (time: ClockTime): string => spokenTime(time);

/** The digital form, padded the way a real display shows it. */
export const clockDigital = (time: ClockTime): string => digitalPad(time);

/**
 * A clock face. `interactive` lets the student drag either hand; the app then reports the whole time back, so the
 * board never keeps a time of its own that could drift from the answer.
 */
export function ClockFace({
  time,
  showHands = true,
  highlight,
  onTime,
  onDragHand,
  disabled = false,
  size = SIZE,
  label,
  showNumbers = true,
  showFiveLabels = false,
  step = 5,
}: {
  time: ClockTime;
  showHands?: boolean;
  /** Both hands, or just one (used by the lesson that introduces them). */
  highlight?: HandKind | 'both' | 'none';
  onTime?: (time: ClockTime) => void;
  /** Fired when a hand starts being dragged, so the lesson can name it. */
  onDragHand?: (hand: HandKind) => void;
  disabled?: boolean;
  size?: number;
  label: string;
  showNumbers?: boolean;
  /** Show the five-minute counts (5, 10, 15 …) near the minute ticks. */
  showFiveLabels?: boolean;
  /** The step a dragged minute hand snaps to. */
  step?: 1 | 5;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<HandKind | null>(null);
  const scale = size / SIZE;
  const hourDeg = hourAngle(time);
  const minuteDeg = minuteAngle(time.m);
  const numbers = faceNumbers(FACE_R - 11, CX, CY);
  const ticks = ticksPerFace();

  const localAngle = (clientX: number, clientY: number): number | null => {
    if (!svg.current) return null;
    const rect = svg.current.getBoundingClientRect();
    const w = rect.width || size;
    const h = rect.height || size;
    const x = ((clientX - rect.left) / w) * SIZE;
    const y = ((clientY - rect.top) / h) * SIZE;
    return angleAt(x, y, CX, CY);
  };

  const applyAngle = (hand: HandKind, angle: number) => {
    if (!onTime) return;
    if (hand === 'minute') onTime({ h: time.h, m: minuteFromAngle(angle, step) });
    else onTime({ h: hourFromAngle(angle, time.m), m: time.m });
  };

  const start = (hand: HandKind) => (e: PointerEvent<SVGGElement>) => {
    if (disabled || !onTime) return;
    setDrag(hand);
    onDragHand?.(hand);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const move = (hand: HandKind) => (e: PointerEvent<SVGGElement>) => {
    if (drag !== hand || disabled) return;
    const angle = localAngle(e.clientX, e.clientY);
    if (angle !== null) applyAngle(hand, angle);
  };
  const stop = (e: PointerEvent<SVGGElement>) => {
    setDrag(null);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const hand = (kind: HandKind) => {
    const deg = kind === 'hour' ? hourDeg : minuteDeg;
    const len = kind === 'hour' ? HOUR_HAND_LENGTH : MINUTE_HAND_LENGTH;
    const tip = pointAt(deg, len, CX, CY);
    const lit = highlight === kind || highlight === 'both';
    const dim = highlight === 'hour' ? kind === 'minute' : highlight === 'minute' ? kind === 'hour' : false;
    return (
      <g
        key={kind}
        className={`ck-hand is-${kind} ${lit ? 'is-lit' : ''} ${dim ? 'is-dim' : ''} ${drag === kind ? 'is-dragging' : ''}`}
        role={onTime && !disabled ? 'button' : undefined}
        tabIndex={onTime && !disabled ? 0 : undefined}
        aria-label={kind === 'hour' ? 'საათის ისარი (მოკლე)' : 'წუთის ისარი (გრძელი)'}
        onPointerDown={start(kind)}
        onPointerMove={move(kind)}
        onPointerUp={stop}
        onPointerCancel={stop}
        onKeyDown={(e: KeyboardEvent<SVGGElement>) => {
          if (!onTime || disabled) return;
          const dir = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
          if (!dir) return;
          e.preventDefault();
          // the minute hand moves in its step; the hour hand moves one number at a time
          if (kind === 'minute') onTime({ h: time.h, m: (time.m + dir * step + 60) % 60 });
          else onTime({ h: ((time.h - 1 + dir + 12) % 12) + 1, m: time.m });
        }}
      >
        {/* a wide, invisible handle makes the hand easy to grab on a phone */}
        <line className="ck-hand-hit" x1={CX} y1={CY} x2={r1(tip.x)} y2={r1(tip.y)} />
        <line className="ck-hand-line" x1={CX} y1={CY} x2={r1(tip.x)} y2={r1(tip.y)} />
        {onTime && !disabled && <circle className="ck-hand-grip" cx={r1(tip.x)} cy={r1(tip.y)} r={7} />}
      </g>
    );
  };

  return (
    <svg
      ref={svg}
      className="ck"
      style={{ width: `${Math.round(size * scale * 100) / 100}px`, maxWidth: '100%' }}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="group"
      aria-label={label}
    >
      <circle className="ck-rim" cx={CX} cy={CY} r={FACE_R + 5} />
      <circle className="ck-face" cx={CX} cy={CY} r={FACE_R} />
      {ticks.map((t) => {
        const outer = pointAt(t.angle, FACE_R - 2, CX, CY);
        const inner = pointAt(t.angle, FACE_R - (t.hour ? 12 : 7), CX, CY);
        return <line key={t.angle} className={`ck-tick ${t.hour ? 'is-hour' : ''}`} x1={r1(inner.x)} y1={r1(inner.y)} x2={r1(outer.x)} y2={r1(outer.y)} />;
      })}
      {showNumbers &&
        numbers.map((n) => (
          <text key={n.n} className="ck-num" x={r1(n.x)} y={r1(n.y)} textAnchor="middle" dominantBaseline="central">
            {n.n}
          </text>
        ))}
      {showFiveLabels &&
        ticks
          .filter((t) => t.hour)
          .map((t) => {
            const p = pointAt(t.angle, FACE_R - 22, CX, CY);
            const minutes = (t.angle / 6) % 60;
            return (
              <text key={`f${t.angle}`} className="ck-five" x={r1(p.x)} y={r1(p.y)} textAnchor="middle" dominantBaseline="central">
                {minutes === 0 ? '00' : minutes}
              </text>
            );
          })}
      {showHands && (
        <>
          {hand('hour')}
          {hand('minute')}
        </>
      )}
      <circle className="ck-pin" cx={CX} cy={CY} r={3.2} />
    </svg>
  );
}

/** What the clock shows, in words and digits. A time is never a bare pair of numbers. */
export function ClockReadout({ time, extra }: { time: ClockTime; extra?: string }) {
  return (
    <p className="ck-readout" role="status" aria-live="polite">
      <span className="ck-readout-words">{spokenTime(time)}</span>
      <span className="ck-readout-digital">{digitalText(time)}</span>
      {extra && <span className="ck-readout-extra">{extra}</span>}
    </p>
  );
}

/** A digital display, drawn like a seven-segment clock. */
export function DigitalDisplay({ time, label }: { time: ClockTime; label?: string }) {
  return (
    <span className="dg" role="img" aria-label={label ?? `ციფრული საათი: ${digitalText(time)}`}>
      {digitalPad(time)}
    </span>
  );
}

// ─────────────────────────── the setting board ───────────────────────────

/**
 * Set the clock. The minute hand snaps to `step`, and the hour hand follows the minutes automatically — dragging
 * the minute hand to 6 at half past three really does move the hour hand halfway between 3 and 4.
 */
export function SetClockBoard({
  time,
  onChange,
  step = 5,
  disabled = false,
  label,
  highlight,
}: {
  time: ClockTime;
  onChange: (time: ClockTime) => void;
  step?: 1 | 5;
  disabled?: boolean;
  label: string;
  highlight?: HandKind | 'both' | 'none';
}) {
  const [touched, setTouched] = useState<HandKind | null>(null);
  return (
    <div className="ck-set">
      <ClockFace time={time} onTime={onChange} onDragHand={setTouched} step={step} disabled={disabled} label={label} highlight={highlight} />
      <ClockReadout time={time} extra={touched === 'hour' ? 'საათის ისარი' : touched === 'minute' ? 'წუთის ისარი' : undefined} />
      <div className="ck-controls">
        <button
          type="button"
          className="btn btn-ghost btn-small"
          disabled={disabled}
          aria-label={step === 1 ? '1 წუთი წინ' : `${step} წუთი წინ`}
          onClick={() => onChange({ h: time.h, m: (time.m + step) % 60 })}
        >
          <span aria-hidden="true">＋</span> {step === 1 ? '1 წუთი' : `${step} წუთი`}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          disabled={disabled}
          aria-label={step === 1 ? '1 წუთი უკან' : `${step} წუთი უკან`}
          onClick={() => onChange({ h: time.h, m: (time.m - step + 60) % 60 })}
        >
          <span aria-hidden="true">−</span> {step === 1 ? '1 წუთი' : `${step} წუთი`}
        </button>
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled} onClick={() => onChange({ h: (time.h % 12) + 1, m: time.m })}>
          საათი +1
        </button>
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled} onClick={() => onChange({ h: 12, m: 0 })}>
          ↻ 12:00
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────── reading practice ───────────────────────────

/** The three faces of a reading question, side by side; `compact` fits them in a phone row. */
export function ClockRow({ times, compact = false, showFive = false }: { times: ClockTime[]; compact?: boolean; showFive?: boolean }) {
  return (
    <div className={`ck-row ${compact ? 'is-compact' : ''}`}>
      {times.map((time, i) => (
        <ClockFace key={i} time={time} size={compact ? 92 : 108} label={spokenTime(time)} showFiveLabels={showFive} />
      ))}
    </div>
  );
}

// ─────────────────────────── matching ───────────────────────────

/**
 * Analog faces on the left, digital displays on the right. Tapping a face and then a display pairs them; a pair is
 * shown with its own line and number so the match is always readable without colour.
 */
export function MatchBoard({
  faces,
  displays,
  mapping,
  onChange,
  disabled = false,
  label,
}: {
  faces: ClockTime[];
  displays: string[];
  mapping: string[];
  onChange: (mapping: string[]) => void;
  disabled?: boolean;
  label: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const placed = faces.map((_, i) => (mapping[i] === '' || mapping[i] === undefined ? -1 : Number(mapping[i])));
  const pairOf = (displayIndex: number) => mapping.findIndex((m) => m !== '' && Number(m) === displayIndex);
  const pickFace = (i: number) => {
    if (disabled) return;
    setActive(i);
  };
  const pickDisplay = (index: number) => {
    if (disabled || active === null) return;
    // a display belongs to one face: taking it away from another face is explicit, not silent
    const next = faces.map((_, i) => (i === active ? String(index) : mapping[i] === String(index) ? '' : (mapping[i] ?? '')));
    onChange(next);
    const after = next.findIndex((m) => !m);
    setActive(after >= 0 ? after : null);
  };
  return (
    <div className="mt" role="group" aria-label={label}>
      <p className="mt-hint" role="status" aria-live="polite">
        {active === null ? 'შეეხე საათს, მერე ციფრულ დროს, რომელიც იგივე დროს აჩვენებს.' : `საათი ${active + 1} არჩეულია. შეეხე მის ციფრულ დროს.`}
      </p>
      <div className="mt-cols">
        <div className="mt-col" aria-label="ანალოგური საათები">
          {faces.map((time, i) => (
            <button
              key={i}
              type="button"
              className={`mt-card ${active === i ? 'is-active' : ''} ${placed[i] >= 0 ? 'is-matched' : ''}`}
              aria-pressed={active === i}
              aria-label={`ანალოგური საათი ${i + 1}${placed[i] >= 0 ? `, შეუსაბამებია ${placed[i] + 1}-ს` : ''}`}
              disabled={disabled}
              onClick={() => pickFace(i)}
            >
              <ClockFace time={time} size={86} label={spokenTime(time)} />
              {placed[i] >= 0 && <span className="mt-badge">{placed[i] + 1}</span>}
            </button>
          ))}
        </div>
        <div className="mt-col" aria-label="ციფრული დრო">
          {displays.map((text, index) => {
            const owner = pairOf(index);
            return (
              <button
                key={index}
                type="button"
                className={`mt-card mt-digital ${owner >= 0 ? 'is-matched' : ''}`}
                aria-label={`ციფრული დრო ${index + 1}: ${text}${owner >= 0 ? `, შეუსაბამებია ${owner + 1}-ს` : ''}`}
                disabled={disabled || active === null}
                onClick={() => pickDisplay(index)}
              >
                <span className="mt-time">{text}</span>
                {owner >= 0 && <span className="mt-badge">{owner + 1}</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled || mapping.every((m) => !m)} onClick={() => (onChange(faces.map(() => '')), setActive(0))}>
          ↻ თავიდან
        </button>
      </div>
      <output className="mt-count">
        {placed.filter((p) => p >= 0).length} / {faces.length} შეუსაბამებია
      </output>
    </div>
  );
}

// ─────────────────────────── five-minute counting ───────────────────────────

/** The minutes round the face, counted by fives from 12; `upTo` lights the ones the student has passed. */
export function FiveMinuteRing({ upTo, label }: { upTo: ClockTime; label?: string }) {
  const top = Math.floor(upTo.m / 5) * 5;
  return (
    <div className="fm" role="group" aria-label={label ?? 'წუთები ხუთეულებით'}>
      {Array.from({ length: 12 }, (_, i) => {
        const minutes = i * 5;
        const passed = minutes !== 0 && minutes <= top;
        return (
          <span key={i} className={`fm-chip ${passed ? 'is-passed' : ''} ${minutes === top ? 'is-now' : ''}`}>
            <span className="fm-num">{i === 0 ? 12 : i}</span>
            <span className="fm-min">{minutes === 0 ? '0' : minutes}</span>
            {passed && <span className="fm-mark" aria-hidden="true">✓</span>}
          </span>
        );
      })}
      <p className="fm-note" role="status" aria-live="polite">
        {top === 0 ? 'წუთის ისარი 12-ზეა: 0 წუთი.' : `${top} წუთი — ეს არის ${top / 5} ხუთეული.`}
      </p>
    </div>
  );
}

// ─────────────────────────── small helpers ───────────────────────────

/** The hour hand is short, the minute hand is long: said in words, so it is never only a picture. */
export const handWords = (kind: HandKind): string => (kind === 'hour' ? 'მოკლე ისარი — საათები' : 'გრძელი ისარი — წუთები');

/** "3:00" — for the option labels of a reading question. */
export const timeOptionLabel = (time: ClockTime): string => digitalText(time);

/** "ნახევარი" / "ზუსტად" / the minutes, for feedback that names the kind of time. */
export const timeKindWord = (time: ClockTime): string => (isOClock(time) ? 'ზუსტად' : isHalfPast(time) ? 'ნახევარი' : `${time.m} წუთი`);

/** The number the minute hand points at, in words: "6-ზე" at half past. */
export const minuteNumberWord = (time: ClockTime): string => `${minuteHandNumber(time)}-ზე`;

/** A step helper for the tools: which numbers the hour hand is between. */
export function hourBetweenWord(time: ClockTime): string {
  if (snapMinute(time.m, 30) === 0) return 'საათის ისარი ზუსტად ციფრზეა';
  const h = time.h;
  return `საათის ისარი ${h}-სა და ${(h % 12) + 1}-ს შორისაა`;
}

/** Degrees are used by the demo steps; exposing them keeps the captions honest. */
export const handDegrees = (time: ClockTime): { hour: number; minute: number } => ({
  hour: Math.round(hourAngle(time) * 10) / 10,
  minute: Math.round(minuteAngle(time.m) * 10) / 10,
});

/** Used by the demo to step the minute hand one five-minute mark at a time. */
export const nextFive = (time: ClockTime): ClockTime => ({ h: time.h, m: (time.m + 5) % 60 });

/** 30° per number, 6° per minute: the two facts the unit builds on. */
export const DEGREES = { perHour: DEG_PER_HOUR, perMinute: 6 };
