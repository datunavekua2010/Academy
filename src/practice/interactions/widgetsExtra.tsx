import { useState } from 'react';
import type { InteractionProps } from './InteractionView';
import type { InteractionSpec } from './types';
import { CheckButton, Stepper } from './shared';
import { DrawItems } from '../pictures/Diagram';
import { planeItems, planeSize, planeX, planeY } from '../pictures/draw';

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
const DECIMAL_NAMES = ['მეათედები', 'მეასედები', 'მეათასედები', 'მეათიათასედები'];

/** A number the way the keys write it: a decimal comma, no trailing zeros. */
export const decimalText = (intPart: number, fraction: number[]): string => {
  const f = fraction.join('').replace(/0+$/, '');
  return f ? `${intPart},${f}` : String(intPart);
};

export function PlaceWidget({ spec, answer, done, onSubmit }: InteractionProps & { spec: Spec<'place'> }) {
  const decimals = spec.decimals ?? 0;
  const start = spec.start ?? 0;
  const startInt = Math.floor(start + 1e-9);
  const startFrac = String(Math.round((start - startInt) * 10 ** decimals)).padStart(decimals, '0').slice(0, decimals);
  const [digits, setDigits] = useState<number[]>(String(startInt).padStart(spec.digits, '0').split('').map(Number));
  const [fraction, setFraction] = useState<number[]>(decimals ? startFrac.split('').map(Number) : []);
  const text = decimalText(Number(digits.join('')), fraction);
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
        {decimals > 0 && <span className="ix-place-comma" aria-hidden="true">,</span>}
        {fraction.map((d, i) => {
          const name = DECIMAL_NAMES[i]!;
          return (
            <div className="ix-place-col is-decimal" key={`f${i}`}>
              <span className="ix-build-title">{name}</span>
              <Stepper
                label={name}
                value={d}
                max={9}
                disabled={done}
                onChange={(next) => setFraction(fraction.map((x, j) => (j === i ? next : x)))}
              />
            </div>
          );
        })}
      </div>
      <p className="ix-readout ix-place-number" aria-live="polite">
        {done ? `სწორი პასუხი: ${answer}` : `რიცხვი: ${text}`}
      </p>
      <CheckButton ready done={done} onClick={() => onSubmit(text)} />
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Coordinate plane
\* ---------------------------------------------------------------- */

export function PlaneWidget({ spec, answer, done, chosen, onSubmit }: InteractionProps & { spec: Spec<'plane'> }) {
  const many = spec.count !== undefined;
  const box = { xmin: spec.xmin, xmax: spec.xmax, ymin: spec.ymin, ymax: spec.ymax, cell: spec.cell ?? 30 };
  const { w, h } = planeSize(box);
  const [picked, setPicked] = useState<Array<[number, number]>>([]);
  const key = (p: Array<[number, number]>): string => [...p].sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(([x, y]) => `${x},${y}`).join(';');
  const base = planeItems({ ...box, points: spec.points, segments: spec.segments, polygon: spec.polygon });
  const toggle = (x: number, y: number) => {
    if (done) return;
    const has = picked.some((p) => p[0] === x && p[1] === y);
    if (many) setPicked(has ? picked.filter((p) => !(p[0] === x && p[1] === y)) : picked.length < spec.count! ? [...picked, [x, y]] : picked);
    else setPicked([[x, y]]);
  };
  const keyed = new Set(answer.split(';'));
  const chosenSet = new Set((chosen ?? '').split(';'));
  const state = (x: number, y: number): string => {
    const id = `${x},${y}`;
    if (done) return keyed.has(id) ? 'is-correct' : chosenSet.has(id) ? 'is-wrong' : '';
    return picked.some((p) => p[0] === x && p[1] === y) ? 'is-picked' : '';
  };
  const spots: Array<[number, number]> = [];
  for (let y = spec.ymax; y >= spec.ymin; y -= 1) for (let x = spec.xmin; x <= spec.xmax; x += 1) spots.push([x, y]);
  const ready = many ? picked.length === spec.count : picked.length === 1;
  return (
    <div className="ix-widget ix-plane">
      <svg className="ix-plane-svg" viewBox={`0 0 ${w + 18} ${h + 6}`} style={{ maxWidth: (w + 18) * 1.4 }} role="group" aria-label="საკოორდინატო სიბრტყე">
        <defs>
          <marker id="diagram-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#33415c" />
          </marker>
        </defs>
        <DrawItems items={base} />
        {spots.map(([x, y]) => (
          <circle
            key={`${x},${y}`}
            className={`ix-plane-spot ${state(x, y)}`}
            cx={planeX(box, x)}
            cy={planeY(box, y)}
            r={Math.max(7, box.cell * 0.34)}
            role="button"
            tabIndex={done ? -1 : 0}
            aria-label={`(${x}; ${y})`}
            aria-pressed={picked.some((p) => p[0] === x && p[1] === y)}
            onClick={() => toggle(x, y)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle(x, y);
              }
            }}
          />
        ))}
      </svg>
      <p className="ix-readout" aria-live="polite">
        {done
          ? `სწორი პასუხი: ${answer.split(';').map((p) => `(${p.replace(',', '; ')})`).join(' ')}`
          : picked.length === 0
            ? many ? `შეეხე ${spec.count} წერტილს.` : 'შეეხე შესაბამის წერტილს.'
            : `არჩეულია: ${picked.map(([x, y]) => `(${x}; ${y})`).join(' ')}`}
      </p>
      <CheckButton ready={ready} done={done} onClick={() => onSubmit(key(picked))} />
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
