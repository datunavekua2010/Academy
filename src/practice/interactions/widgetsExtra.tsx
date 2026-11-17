import { useState } from 'react';
import type { InteractionProps } from './InteractionView';
import type { InteractionSpec } from './types';
import { CheckButton, Stepper } from './shared';

/**
 * Widgets added for Grades III–IV: building arrays (multiplication, area,
 * perimeter), opening an angle, writing a number digit by digit, and placing
 * number cards. Like all widgets they end in one canonical string.
 */

type Spec<K extends InteractionSpec['kind']> = Extract<InteractionSpec, { kind: K }>;

/* ---------------------------------------------------------------- *\
 * Array of squares
 * ---------------------------------------------------------------- */

export function ArrayWidget({ spec, answer, done, onSubmit }: InteractionProps & { spec: Spec<'array'> }) {
  const [rows, setRows] = useState(spec.fixedRows ?? spec.startRows ?? 1);
  const [cols, setCols] = useState(spec.fixedCols ?? spec.startCols ?? 1);
  const unit = spec.unit ? ` ${spec.unit}` : '';
  const measure = spec.output === 'perimeter' ? ` · პერიმეტრი: ${2 * (rows + cols)}` : '';
  return (
    <div className="ix-widget ix-array">
      <div className="ix-array-grid" style={{ gridTemplateColumns: `repeat(${cols}, 26px)` }} role="img" aria-label={`${rows} რიგი, ${cols} სვეტი`}>
        {Array.from({ length: rows * cols }, (_, i) => (
          <span key={i} className="ix-array-cell" />
        ))}
      </div>
      <div className="ix-array-controls">
        {spec.fixedRows === undefined && (
          <label>
            <span className="ix-build-title">რიგები</span>
            <Stepper label="რიგი" value={rows} min={1} max={spec.maxRows} onChange={setRows} disabled={done} />
          </label>
        )}
        {spec.fixedCols === undefined && (
          <label>
            <span className="ix-build-title">სვეტები</span>
            <Stepper label="სვეტი" value={cols} min={1} max={spec.maxCols} onChange={setCols} disabled={done} />
          </label>
        )}
      </div>
      <p className="ix-readout" aria-live="polite">
        {done ? `სწორი პასუხი: ${answer}${spec.output === 'dims' ? '' : unit}` : `${rows} × ${cols} = ${rows * cols}${measure}${unit}`}
      </p>
      <CheckButton
        ready
        done={done}
        onClick={() => onSubmit(spec.output === 'dims' ? `${rows},${cols}` : spec.output === 'perimeter' ? String(2 * (rows + cols)) : String(rows * cols))}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Angle
 * ---------------------------------------------------------------- */

const VX = 40;
const VY = 150;

export function AngleWidget({ spec, answer, done, onSubmit }: InteractionProps & { spec: Spec<'angle'> }) {
  const max = spec.max ?? 180;
  const step = spec.step ?? 5;
  const [angle, setAngle] = useState(spec.start ?? 0);
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const at = (deg: number, r: number) => ({ x: VX + Math.cos(rad(deg)) * r, y: VY - Math.sin(rad(deg)) * r });
  const tip = at(angle, 170);
  const arcEnd = at(angle, 46);
  const deltas = [...new Set([-30, -10, -step, step, 10, 30])].filter((d) => Math.abs(d) >= step).sort((a, b) => a - b);
  const shown = done ? Number(answer) : angle;
  return (
    <div className="ix-widget ix-angle">
      <svg viewBox="0 0 230 165" className="ix-angle-svg" role="img" aria-label={`კუთხე: ${angle} გრადუსი`}>
        {Array.from({ length: 19 }, (_, i) => i * 10).map((d) => {
          const a = at(d, 120);
          const b = at(d, d % 30 === 0 ? 106 : 112);
          return <line key={d} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#9aa6c0" strokeWidth={d % 30 === 0 ? 2 : 1} />;
        })}
        <path d={`M ${at(0, 120).x} ${at(0, 120).y} A 120 120 0 0 0 ${at(180, 120).x} ${at(180, 120).y}`} fill="none" stroke="#c9d3ee" strokeWidth="2" />
        <line x1={VX} y1={VY} x2={at(0, 170).x} y2={VY} stroke="#33415c" strokeWidth="4" strokeLinecap="round" />
        <path d={`M ${at(0, 46).x} ${VY} A 46 46 0 ${angle > 180 ? 1 : 0} 0 ${arcEnd.x} ${arcEnd.y}`} fill="rgba(232,71,63,0.12)" stroke="#e8473f" strokeWidth="3" />
        <line x1={VX} y1={VY} x2={tip.x} y2={tip.y} stroke="#e8473f" strokeWidth="4" strokeLinecap="round" />
        <circle cx={VX} cy={VY} r="5" fill="#33415c" />
        {[0, 90, 180].map((d) => {
          const p = at(d, 134);
          return (
            <text key={d} x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#5b6b8c">
              {d}°
            </text>
          );
        })}
      </svg>
      <div className="ix-angle-buttons" role="group" aria-label="კუთხის ზომა">
        {deltas.map((d) => (
          <button
            key={d}
            type="button"
            className="ix-chip"
            disabled={done || angle + d < 0 || angle + d > max}
            onClick={() => setAngle(angle + d)}
            aria-label={`${d > 0 ? 'გაზრდა' : 'შემცირება'} ${Math.abs(d)} გრადუსით`}
          >
            {d > 0 ? `+${d}` : d}°
          </button>
        ))}
      </div>
      <p className="ix-readout" aria-live="polite">
        {done ? `სწორი პასუხი: ${shown}°` : `კუთხე: ${angle}°`}
      </p>
      <CheckButton ready done={done} onClick={() => onSubmit(String(angle))} />
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Place value
 * ---------------------------------------------------------------- */

const PLACE_NAMES = ['ერთეულები', 'ათეულები', 'ასეულები', 'ათასეულები', 'ათი ათასეულები', 'ასი ათასეულები', 'მილიონები'];

export function PlaceWidget({ spec, answer, done, onSubmit }: InteractionProps & { spec: Spec<'place'> }) {
  const initial = String(spec.start ?? 0).padStart(spec.digits, '0').split('').map(Number);
  const [digits, setDigits] = useState<number[]>(initial);
  const value = Number(digits.join(''));
  return (
    <div className="ix-widget ix-place">
      <div className="ix-place-cols">
        {digits.map((d, i) => {
          const name = PLACE_NAMES[digits.length - 1 - i]!;
          return (
            <div className="ix-place-col" key={i}>
              <span className="ix-build-title">{name}</span>
              <Stepper
                label={name}
                value={d}
                max={9}
                disabled={done}
                onChange={(next) => setDigits(digits.map((x, j) => (j === i ? next : x)))}
              />
            </div>
          );
        })}
      </div>
      <p className="ix-readout ix-place-number" aria-live="polite">
        {done ? `სწორი პასუხი: ${answer}` : `რიცხვი: ${value}`}
      </p>
      <CheckButton ready done={done} onClick={() => onSubmit(String(value))} />
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Number cards
 * ---------------------------------------------------------------- */

export function TilesWidget({ spec, answer, done, onSubmit }: InteractionProps & { spec: Spec<'tiles'> }) {
  const frame = spec.frame ?? Array.from({ length: spec.slots ?? spec.cards.length }, () => '?');
  const slotCount = frame.filter((t) => t === '?').length;
  const [placed, setPlaced] = useState<Array<number | null>>(Array.from({ length: slotCount }, () => null));
  const used = new Set(placed.filter((x): x is number => x !== null));
  const place = (card: number) => {
    const free = placed.indexOf(null);
    if (free < 0 || used.has(card)) return;
    setPlaced(placed.map((x, i) => (i === free ? card : x)));
  };
  const take = (slot: number) => setPlaced(placed.map((x, i) => (i === slot ? null : x)));
  const full = placed.every((x) => x !== null);
  const key = placed.map((c) => (c === null ? '' : spec.cards[c]!)).join(spec.joiner ?? '');
  let slot = -1;
  return (
    <div className="ix-widget ix-tiles">
      <div className="ix-tiles-frame" role="group" aria-label="ადგილები">
        {frame.map((token, i) => {
          if (token !== '?') return <span className="ix-tiles-fixed" key={i}>{token}</span>;
          slot += 1;
          const mine = slot;
          const card = placed[mine];
          return (
            <button
              key={i}
              type="button"
              className={`ix-tiles-slot ${card !== null ? 'is-filled' : ''}`}
              aria-label={card !== null && card !== undefined ? `ადგილი ${mine + 1}: ${spec.cards[card]}` : `ადგილი ${mine + 1}: ცარიელი`}
              disabled={done || card === null}
              onClick={() => take(mine)}
            >
              {card !== null && card !== undefined ? spec.cards[card] : ''}
            </button>
          );
        })}
      </div>
      <div className="ix-tiles-cards" role="group" aria-label="ბარათები">
        {spec.cards.map((card, i) => (
          <button key={i} type="button" className="ix-tiles-card" disabled={done || used.has(i)} onClick={() => place(i)}>
            {card}
          </button>
        ))}
      </div>
      <p className="ix-readout" aria-live="polite">
        {done ? `სწორი პასუხი: ${answer}` : full ? `ჩაწერილია: ${key}` : 'შეეხე ბარათებს ადგილის შესავსებად.'}
      </p>
      <CheckButton ready={full} done={done} onClick={() => onSubmit(key)} />
    </div>
  );
}
