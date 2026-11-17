import { useMemo, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { CHAR_ICONS } from '../pictures/iconMap';
import { drawIcon } from '../pictures/icons';
import { COIN_STYLE, Icon, Rod, TallyMarks } from '../pictures/PictureView';
import type { InteractionSpec } from './types';
import './interactions.css';

/**
 * The widgets a student answers *with*.
 *
 * Every widget keeps its own working state and ends in one string, handed to
 * `onSubmit` when the student presses „შემოწმება“. The engine then compares that
 * string with the question's key exactly like a chosen option — nothing in here
 * knows whether the work is right, except `describeAnswer`, which only *shows*
 * the key after the question is over.
 */

export interface InteractionProps {
  spec: InteractionSpec;
  /** The key — used only to show the right solution once the question is answered. */
  answer: string;
  /** Answered? Then the widget is read-only. */
  done: boolean;
  /** What the student submitted, once answered. */
  chosen: string | null;
  onSubmit: (value: string) => void;
}

const pad = (n: number): string => String(n).padStart(2, '0');

const iconName = (key: string): string =>
  Object.values(CHAR_ICONS).find((info) => info.key === key)?.ka ?? key;

/* ---------------------------------------------------------------- *\
 * Shared
 * ---------------------------------------------------------------- */

function CheckButton({
  ready,
  done,
  onClick,
  label = 'შემოწმება',
}: {
  ready: boolean;
  done: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button type="button" className="btn btn-primary ix-check" disabled={done || !ready} onClick={onClick}>
      {label}
    </button>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max: number;
  step?: number;
  disabled?: boolean;
}) {
  return (
    <span className="ix-stepper">
      <button
        type="button"
        className="ix-step"
        aria-label={`${label}: ნაკლები`}
        disabled={disabled || value - step < min}
        onClick={() => onChange(value - step)}
      >
        −
      </button>
      <strong className="ix-step-value" aria-live="polite">
        {value}
      </strong>
      <button
        type="button"
        className="ix-step"
        aria-label={`${label}: მეტი`}
        disabled={disabled || value + step > max}
        onClick={() => onChange(value + step)}
      >
        +
      </button>
    </span>
  );
}

/* ---------------------------------------------------------------- *\
 * Number line, ruler, thermometer
 * ---------------------------------------------------------------- */

function LineWidget({ spec, answer, done, chosen, onSubmit }: InteractionProps & { spec: Extract<InteractionSpec, { kind: 'line' }> }) {
  const step = spec.step ?? 1;
  const [picked, setPicked] = useState<number | null>(null);
  const ticks: number[] = [];
  for (let v = spec.min; v <= spec.max; v += step) ticks.push(v);
  const labelEvery = spec.labelEvery ?? (ticks.length <= 21 ? 1 : ticks.length <= 41 ? 5 : 10);
  const span = spec.max - spec.min;
  const pct = (v: number) => ((v - spec.min) / span) * 100;
  const vertical = spec.style === 'thermo';
  const shown = done && chosen !== null ? Number(chosen) : picked;
  const stateOf = (v: number): string => {
    if (done) {
      if (v === Number(answer)) return 'is-correct';
      if (v === Number(chosen)) return 'is-wrong';
      return '';
    }
    return v === picked ? 'is-picked' : '';
  };
  const unit = spec.unit ? ` ${spec.unit}` : '';
  return (
    <div className="ix-widget ix-line-widget">
      <div
        className={`ix-line ix-line-${spec.style ?? 'line'}`}
        style={vertical ? { height: Math.max(260, ticks.length * 24) } : { minWidth: Math.max(0, ticks.length * 28) }}
        role="group"
        aria-label={vertical ? 'თერმომეტრი' : spec.style === 'ruler' ? 'სახაზავი' : 'რიცხვითი ღერძი'}
      >
        {spec.bar !== undefined && !vertical && (
          <div className="ix-ruler-object" style={{ width: `${pct(spec.bar)}%` }}>
            {spec.barIcon && <Icon name={spec.barIcon} size={28} />}
          </div>
        )}
        {vertical && spec.bar !== undefined && <div className="ix-mercury" style={{ height: `${pct(spec.bar)}%` }} />}
        <div className="ix-track" />
        {spec.start !== undefined && (
          <span
            className="ix-start"
            style={vertical ? { bottom: `${pct(spec.start)}%` } : { left: `${pct(spec.start)}%` }}
            aria-label={`საწყისი წერტილი: ${spec.start}`}
          />
        )}
        {ticks.map((v) => (
          <button
            key={v}
            type="button"
            className={`ix-tick ${stateOf(v)}`}
            style={vertical ? { bottom: `${pct(v)}%` } : { left: `${pct(v)}%` }}
            aria-label={`${v}${unit}`}
            aria-pressed={v === shown}
            disabled={done}
            onClick={() => setPicked(v)}
          >
            <span className="ix-tick-mark" />
            {(v - spec.min) % (labelEvery * step) === 0 && <span className="ix-tick-label">{v}</span>}
          </button>
        ))}
        {shown !== null && shown !== undefined && !Number.isNaN(shown) && (
          <span
            className="ix-marker"
            style={vertical ? { bottom: `${pct(shown)}%` } : { left: `${pct(shown)}%` }}
            aria-hidden="true"
          />
        )}
      </div>
      <p className="ix-readout" aria-live="polite">
        {done ? '' : picked === null ? 'შეეხე შესაბამის ადგილს.' : `არჩეულია: ${picked}${unit}`}
      </p>
      <CheckButton ready={picked !== null} done={done} onClick={() => picked !== null && onSubmit(String(picked))} />
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Hundred chart
 * ---------------------------------------------------------------- */

function ChartWidget({ spec, answer, done, chosen, onSubmit }: InteractionProps & { spec: Extract<InteractionSpec, { kind: 'chart' }> }) {
  const [picked, setPicked] = useState<number | null>(null);
  const numbers: number[] = [];
  for (let n = spec.from; n <= spec.to; n += 1) numbers.push(n);
  return (
    <div className="ix-widget">
      <div className="ix-chart" style={{ gridTemplateColumns: `repeat(${spec.cols}, minmax(0, 1fr))` }} role="group" aria-label="რიცხვების ცხრილი">
        {spec.heads?.map((head) => (
          <span key={head} className="ix-chart-head">
            {head}
          </span>
        ))}
        {Array.from({ length: spec.offset ?? 0 }, (_, i) => (
          <span key={`gap${i}`} aria-hidden="true" />
        ))}
        {numbers.map((n) => {
          const state = done ? (String(n) === answer ? 'is-correct' : String(n) === chosen ? 'is-wrong' : '') : n === picked ? 'is-picked' : '';
          return (
            <button key={n} type="button" className={`ix-chart-cell ${state}`} disabled={done} aria-pressed={n === picked} onClick={() => setPicked(n)}>
              {n}
            </button>
          );
        })}
      </div>
      <CheckButton ready={picked !== null} done={done} onClick={() => picked !== null && onSubmit(String(picked))} />
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Pick from a row
 * ---------------------------------------------------------------- */

function PickWidget({ spec, answer, done, onSubmit }: InteractionProps & { spec: Extract<InteractionSpec, { kind: 'pick' }> }) {
  const [picked, setPicked] = useState<number[]>([]);
  const key = answer.split(',').map(Number);
  const toggle = (position: number) => {
    if (done) return;
    setPicked((current) =>
      spec.mode === 'one'
        ? [position]
        : current.includes(position)
          ? current.filter((p) => p !== position)
          : [...current, position].sort((a, b) => a - b),
    );
  };
  return (
    <div className="ix-widget">
      <div className="ix-pick-row" role="group" aria-label="აირჩიე">
        {spec.items.map((item, i) => {
          const position = i + 1;
          const on = picked.includes(position);
          const state = done ? (key.includes(position) ? (on ? 'is-correct' : 'is-missing') : on ? 'is-wrong' : '') : on ? 'is-picked' : '';
          return (
            <button
              key={i}
              type="button"
              className={`ix-pick ${state}`}
              aria-pressed={on}
              aria-label={item.label ?? (item.icon ? iconName(item.icon) : String(position))}
              disabled={done}
              onClick={() => toggle(position)}
            >
              {item.icon && <Icon name={item.icon} size={44} />}
              {item.label && <span className="ix-pick-label">{item.label}</span>}
            </button>
          );
        })}
      </div>
      <p className="ix-readout" aria-live="polite">
        {done ? '' : spec.mode === 'many' ? `მონიშნულია: ${picked.length}` : picked.length ? '' : 'შეეხე სწორ ადგილს.'}
      </p>
      <CheckButton ready={picked.length > 0} done={done} onClick={() => onSubmit(picked.join(','))} />
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Clock with hands the student sets
 * ---------------------------------------------------------------- */

function ClockWidget({ spec, done, answer, chosen, onSubmit }: InteractionProps & { spec: Extract<InteractionSpec, { kind: 'clock' }> }) {
  const stepMinutes = spec.minuteStep ?? 5;
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [hand, setHand] = useState<'hour' | 'minute'>('hour');
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const shownHour = done && chosen ? Number(chosen.split(':')[0]) : hour;
  const shownMinute = done && chosen ? Number(chosen.split(':')[1]) : minute;
  const point = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: 100 + Math.sin(rad) * radius, y: 100 - Math.cos(rad) * radius };
  };
  const hourAngle = ((shownHour % 12) + shownMinute / 60) * 30;
  const hourEnd = point(hourAngle, 46);
  const minuteEnd = point(shownMinute * 6, 70);

  const setFromPointer = (clientX: number, clientY: number) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box || done) return;
    const x = clientX - (box.left + box.width / 2);
    const y = clientY - (box.top + box.height / 2);
    if (x === 0 && y === 0) return;
    const angle = ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360;
    if (hand === 'hour') {
      const h = Math.round(angle / 30) % 12;
      setHour(h === 0 ? 12 : h);
    } else {
      setMinute((Math.round(angle / (stepMinutes * 6)) * stepMinutes) % 60);
    }
  };

  const shown = `${shownHour}:${pad(shownMinute)}`;
  const correctShown = (() => {
    const [h, m] = answer.split(':').map(Number);
    return `${h}:${pad(m ?? 0)}`;
  })();

  return (
    <div className="ix-widget ix-clock">
      <div className="ix-hand-picker" role="radiogroup" aria-label="რომელ ისარს ამოძრავებ">
        <button type="button" role="radio" aria-checked={hand === 'hour'} className={`ix-chip ${hand === 'hour' ? 'is-on' : ''}`} onClick={() => setHand('hour')} disabled={done}>
          <span className="ix-swatch is-hour" aria-hidden="true" /> საათის ისარი
        </button>
        <button type="button" role="radio" aria-checked={hand === 'minute'} className={`ix-chip ${hand === 'minute' ? 'is-on' : ''}`} onClick={() => setHand('minute')} disabled={done}>
          <span className="ix-swatch is-minute" aria-hidden="true" /> წუთის ისარი
        </button>
      </div>
      <svg
        ref={svgRef}
        className="pic-clock ix-clock-face"
        viewBox="0 0 200 200"
        role="img"
        aria-label={`საათი: ${shown}`}
        onPointerDown={(event) => {
          dragging.current = true;
          (event.currentTarget as SVGSVGElement).setPointerCapture?.(event.pointerId);
          setFromPointer(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (dragging.current) setFromPointer(event.clientX, event.clientY);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
      >
        <circle cx="100" cy="100" r="94" fill="#fff" stroke="#33415c" strokeWidth="5" />
        {Array.from({ length: 60 }, (_, t) => {
          const long = t % 5 === 0;
          const a = point(t * 6, 88);
          const b = point(t * 6, long ? 79 : 84);
          return <line key={t} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#33415c" strokeWidth={long ? 2.4 : 1} />;
        })}
        {Array.from({ length: 12 }, (_, n) => {
          const p = point((n + 1) * 30, 64);
          return (
            <text key={n} x={p.x} y={p.y + 6} textAnchor="middle" fontSize="19" fontWeight="800" fill="#1d2a4a">
              {n + 1}
            </text>
          );
        })}
        <line x1="100" y1="100" x2={hourEnd.x} y2={hourEnd.y} stroke="#e8473f" strokeWidth={hand === 'hour' && !done ? 9 : 7} strokeLinecap="round" />
        <line x1="100" y1="100" x2={minuteEnd.x} y2={minuteEnd.y} stroke="#1d2a4a" strokeWidth={hand === 'minute' && !done ? 6.5 : 4.5} strokeLinecap="round" />
        <circle cx="100" cy="100" r="6" fill="#33415c" />
      </svg>
      <div className="ix-clock-controls">
        <span className="ix-clock-group">
          <span className="ix-clock-name">საათი</span>
          <Stepper label="საათი" value={hour} min={1} max={12} onChange={setHour} disabled={done} />
        </span>
        <span className="ix-clock-group">
          <span className="ix-clock-name">წუთი</span>
          <Stepper label="წუთი" value={minute} min={0} max={59} step={stepMinutes} onChange={setMinute} disabled={done} />
        </span>
      </div>
      <p className="ix-readout" aria-live="polite">
        {done ? `სწორი დრო: ${correctShown}` : `საათი აჩვენებს: ${shown}`}
      </p>
      <CheckButton ready done={done} onClick={() => onSubmit(`${pad(hour)}:${pad(minute)}`)} />
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Fill cells / parts
 * ---------------------------------------------------------------- */

function sector(index: number, total: number): string {
  const a0 = (index / total) * 2 * Math.PI - Math.PI / 2;
  const a1 = ((index + 1) / total) * 2 * Math.PI - Math.PI / 2;
  const p = (a: number) => `${50 + 44 * Math.cos(a)} ${50 + 44 * Math.sin(a)}`;
  return total === 1 ? 'M50 6a44 44 0 1 1 -0.01 0Z' : `M50 50L${p(a0)}A44 44 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)}Z`;
}

function FillWidget({ spec, answer, done, chosen, onSubmit }: InteractionProps & { spec: Extract<InteractionSpec, { kind: 'fill' }> }) {
  const [on, setOn] = useState<boolean[]>(() => Array.from({ length: spec.total }, (_, i) => i < (spec.start ?? 0)));
  const locked = spec.locked ?? 0;
  const filled = on.filter(Boolean).length;
  const count = spec.output === 'extra' ? filled - locked : spec.output === 'off' ? spec.total - filled : filled;
  const toggle = (index: number) => {
    if (done || index < locked) return;
    setOn((current) => current.map((v, i) => (i === index ? !v : v)));
  };
  const cols =
    spec.shape === 'frame10' ? 5 : spec.shape === 'frame20' ? 5 : spec.shape === 'grid' ? (spec.cols ?? 5) : spec.total;
  const noun = spec.noun ?? 'ცალი';
  const wrapClass = `ix-fill ix-fill-${spec.shape}`;

  const verdict = (index: number): string => {
    if (!done) return '';
    const toCells = (value: number) =>
      spec.output === 'extra' ? value + locked : spec.output === 'off' ? spec.total - value : value;
    const right = toCells(Number(answer));
    const chosenCount = toCells(Number(chosen));
    // The first `right` cells are the key; show where the student fell short or went over.
    const isOn = on[index] ?? false;
    if (isOn && index >= right) return 'is-wrong';
    if (!isOn && index < right && chosenCount < right) return 'is-missing';
    return isOn ? 'is-correct' : '';
  };

  let body: ReactElement;
  if (spec.shape === 'circle') {
    body = (
      <svg className="ix-pie" viewBox="0 0 100 100" role="group" aria-label="წრე ნაწილებად">
        {on.map((v, i) => (
          <path
            key={i}
            d={sector(i, spec.total)}
            className={`ix-pie-part ${v ? 'is-on' : ''} ${verdict(i)}`}
            role="button"
            tabIndex={done || i < locked ? -1 : 0}
            aria-label={`ნაწილი ${i + 1}`}
            aria-pressed={v}
            onClick={() => toggle(i)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggle(i);
              }
            }}
          />
        ))}
      </svg>
    );
  } else if (spec.shape === 'bar') {
    body = (
      <div className="ix-bar" role="group" aria-label="ზოლი ნაწილებად">
        {on.map((v, i) => (
          <button key={i} type="button" className={`ix-bar-part ${v ? 'is-on' : ''} ${verdict(i)}`} aria-label={`ნაწილი ${i + 1}`} aria-pressed={v} disabled={done || i < locked} onClick={() => toggle(i)} />
        ))}
      </div>
    );
  } else {
    const frames = spec.shape === 'frame20' ? 2 : 1;
    const perFrame = spec.shape === 'frame10' || spec.shape === 'frame20' ? 10 : spec.total;
    body = (
      <div className="ix-frames">
        {Array.from({ length: frames }, (_, f) => (
          <div
            key={f}
            className={`ix-cells ${spec.shape === 'row' ? 'is-row' : 'is-frame'}`}
            style={{ gridTemplateColumns: `repeat(${Math.min(cols, perFrame)}, 44px)` }}
            role="group"
            aria-label={spec.shape === 'frame10' || spec.shape === 'frame20' ? 'ათეულის ჩარჩო' : 'უჯრები'}
          >
            {on.slice(f * perFrame, (f + 1) * perFrame).map((v, k) => {
              const i = f * perFrame + k;
              return (
                <button key={i} type="button" className={`ix-cell ${v ? 'is-on' : ''} ${verdict(i)}`} aria-label={`უჯრა ${i + 1}`} aria-pressed={v} disabled={done || i < locked} onClick={() => toggle(i)}>
                  {spec.icon ? (
                    <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true" className={v ? '' : 'is-ghost'}>
                      {drawIcon(spec.icon)}
                    </svg>
                  ) : (
                    v && <span className="ix-dot" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="ix-widget">
      <div className={wrapClass}>{body}</div>
      <p className="ix-readout" aria-live="polite">
        {done ? `სწორი პასუხი: ${answer} ${noun}` : `${spec.shape === 'circle' || spec.shape === 'bar' ? 'გაფერადებულია' : 'მონიშნულია'}: ${count} ${spec.shape === 'circle' || spec.shape === 'bar' ? `/ ${spec.total}` : noun}`}
      </p>
      <CheckButton ready={!done} done={done} onClick={() => onSubmit(String(count))} />
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Base-ten builder
 * ---------------------------------------------------------------- */

function BuildWidget({ spec, answer, done, onSubmit }: InteractionProps & { spec: Extract<InteractionSpec, { kind: 'build' }> }) {
  const [tens, setTens] = useState(spec.startTens);
  const [ones, setOnes] = useState(spec.startOnes);
  const maxTens = spec.maxTens ?? 10;
  const value = tens * 10 + ones;
  return (
    <div className="ix-widget ix-build">
      <div className="ix-build-board">
        <div className="ix-build-col">
          <span className="ix-build-title">ათეულები</span>
          <div className="ix-build-pile ix-build-tens">
            {Array.from({ length: tens }, (_, i) => (
              <Rod key={i} color="blue" />
            ))}
          </div>
          <Stepper label="ათეული" value={tens} max={maxTens} onChange={setTens} disabled={done} />
        </div>
        <div className="ix-build-col">
          <span className="ix-build-title">ერთეულები</span>
          <div className="ix-build-pile ix-build-ones">
            {Array.from({ length: ones }, (_, i) => (
              <Icon key={i} name="unit" size={28} />
            ))}
          </div>
          <Stepper label="ერთეული" value={ones} max={30} onChange={setOnes} disabled={done} />
        </div>
      </div>
      <div className="ix-trade">
        <button type="button" className="ix-chip" disabled={done || ones < 10 || tens >= maxTens} onClick={() => { setOnes(ones - 10); setTens(tens + 1); }}>
          10 ერთეული → 1 ათეული
        </button>
        <button type="button" className="ix-chip" disabled={done || tens < 1} onClick={() => { setTens(tens - 1); setOnes(ones + 10); }}>
          1 ათეული → 10 ერთეული
        </button>
      </div>
      <p className="ix-readout" aria-live="polite">
        {done
          ? `სწორი პასუხი: ${spec.output === 'pair' ? answer.replace(',', ' ათეული და ') + ' ერთეული' : answer}`
          : `${tens} ათეული და ${ones} ერთეული${spec.output === 'number' ? ` = ${value}` : ''}`}
      </p>
      <CheckButton ready done={done} onClick={() => onSubmit(spec.output === 'pair' ? `${tens},${ones}` : String(value))} />
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Coin purse
 * ---------------------------------------------------------------- */

function CoinFace({ value }: { value: number }) {
  const style = COIN_STYLE[value] ?? COIN_STYLE[10]!;
  const size = style.r * 2 + 6;
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true" focusable="false">
      <circle cx="30" cy="30" r={style.r} fill={style.fill} stroke={style.ring} strokeWidth="3" />
      <circle cx="30" cy="30" r={style.r - 5} fill="none" stroke={style.ring} strokeOpacity=".5" strokeWidth="1.2" strokeDasharray="2 2.4" />
      <text x="30" y="36" textAnchor="middle" fontSize={value >= 10 ? 17 : 19} fontWeight="900" fill="#33415c">
        {value}
      </text>
    </svg>
  );
}

function PurseWidget({ spec, answer, done, onSubmit }: InteractionProps & { spec: Extract<InteractionSpec, { kind: 'purse' }> }) {
  const [picked, setPicked] = useState<number[]>([]);
  const total = picked.reduce((sum, v) => sum + v, 0);
  const key = spec.output === 'totalCount' ? `${total}/${picked.length}` : String(total);
  return (
    <div className="ix-widget ix-purse">
      <p className="ix-subtitle">მონეტები (შეეხე და ჩაიდე ყულაბაში)</p>
      <div className="ix-tray" role="group" aria-label="მონეტები">
        {spec.coins.map((value) => (
          <button key={value} type="button" className="ix-coin" aria-label={`${value} თეთრი — დამატება`} disabled={done || picked.length >= 16} onClick={() => setPicked((c) => [...c, value])}>
            <CoinFace value={value} />
          </button>
        ))}
      </div>
      <p className="ix-subtitle">ყულაბაში (შეეხე, რომ ამოიღო)</p>
      <div className="ix-tray ix-purse-box" role="group" aria-label="ყულაბა">
        {picked.length === 0 && <span className="ix-empty">ცარიელია</span>}
        {picked.map((value, i) => (
          <button key={`${i}-${value}`} type="button" className="ix-coin" aria-label={`${value} თეთრი — ამოღება`} disabled={done} onClick={() => setPicked((c) => c.filter((_, j) => j !== i))}>
            <CoinFace value={value} />
          </button>
        ))}
      </div>
      <p className="ix-readout" aria-live="polite">
        {done ? `სწორი პასუხი: ${answer.replace('/', ' თეთრი, მონეტა: ')}` : `ყულაბაში: ${total} თეთრი${picked.length ? ` (${picked.length} მონეტა)` : ''}`}
      </p>
      <CheckButton ready={picked.length > 0} done={done} onClick={() => onSubmit(key)} />
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Sorting bins
 * ---------------------------------------------------------------- */

function BinsWidget({ spec, answer, done, onSubmit }: InteractionProps & { spec: Extract<InteractionSpec, { kind: 'bins' }> }) {
  const [placed, setPlaced] = useState<Array<number | null>>(() => spec.items.map(() => null));
  const [held, setHeld] = useState<number | null>(null);
  const key = answer.split(',').map(Number);
  const put = (item: number, bin: number) => {
    if (done) return;
    setPlaced((current) => current.map((v, i) => (i === item ? bin : v)));
    setHeld(null);
  };
  const itemView = (item: { label?: string; icon?: string }) => (
    <>
      {item.icon && (
        <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
          {drawIcon(item.icon)}
        </svg>
      )}
      {item.label && <span className="ix-item-label">{item.label}</span>}
    </>
  );
  const unplaced = spec.items.map((_, i) => i).filter((i) => placed[i] === null);
  return (
    <div className="ix-widget ix-bins">
      <p className="ix-subtitle">
        {done ? '' : held === null ? 'აირჩიე ელემენტი, შემდეგ შეეხე ყუთს (ან გადაათრიე).' : 'ახლა შეეხე ყუთს, სადაც უნდა მოხვდეს.'}
      </p>
      <div className="ix-items" role="group" aria-label="დასალაგებელი ელემენტები">
        {unplaced.map((i) => (
          <button
            key={i}
            type="button"
            className={`ix-item ${held === i ? 'is-held' : ''}`}
            draggable={!done}
            onDragStart={(event) => event.dataTransfer?.setData('text/plain', String(i))}
            aria-pressed={held === i}
            disabled={done}
            onClick={() => setHeld(held === i ? null : i)}
          >
            {itemView(spec.items[i]!)}
          </button>
        ))}
        {unplaced.length === 0 && !done && <span className="ix-empty">ყველა ელემენტი დალაგებულია</span>}
      </div>
      <div className="ix-bin-row">
        {spec.bins.map((name, b) => (
          <div
            key={b}
            className={`ix-bin ${held !== null ? 'is-target' : ''}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const dropped = Number(event.dataTransfer?.getData('text/plain'));
              if (Number.isInteger(dropped)) put(dropped, b);
            }}
          >
            <button type="button" className="ix-bin-name" disabled={held === null || done} onClick={() => held !== null && put(held, b)}>
              {name}
            </button>
            <div className="ix-bin-items">
              {spec.items.map((item, i) =>
                placed[i] === b ? (
                  <button
                    key={i}
                    type="button"
                    className={`ix-item is-placed ${done ? (key[i] === b ? 'is-correct' : 'is-wrong') : ''}`}
                    disabled={done}
                    aria-label={`ამოღება: ${item.label ?? iconName(item.icon ?? '')}`}
                    onClick={() => setPlaced((current) => current.map((v, j) => (j === i ? null : v)))}
                  >
                    {itemView(item)}
                  </button>
                ) : null,
              )}
            </div>
          </div>
        ))}
      </div>
      {done && (
        <p className="ix-readout">
          სწორად:{' '}
          {spec.bins.map((name, b) => `${name} — ${spec.items.filter((_, i) => key[i] === b).map((it) => it.label ?? iconName(it.icon ?? '')).join(', ') || '—'}`).join('; ')}
        </p>
      )}
      <CheckButton ready={placed.every((v) => v !== null)} done={done} onClick={() => onSubmit(placed.join(','))} />
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Counters: bar chart, tally, pictogram
 * ---------------------------------------------------------------- */

function CountersWidget({ spec, answer, done, chosen, onSubmit }: InteractionProps & { spec: Extract<InteractionSpec, { kind: 'counters' }> }) {
  const [counts, setCounts] = useState<number[]>(() => spec.labels.map((_, i) => spec.start?.[i] ?? 0));
  const set = (index: number, value: number) => {
    if (done) return;
    setCounts((current) => current.map((v, i) => (i === index ? Math.max(0, Math.min(spec.max, value)) : v)));
  };
  const key = answer.split(',').map(Number);
  const mark = (i: number): string =>
    done ? (counts[i] === key[i] ? 'is-correct' : 'is-wrong') : '';
  const unit = spec.per ?? 1;
  const total = counts.reduce((a, b) => a + b, 0);
  void chosen;

  if (spec.style === 'bars') {
    return (
      <div className="ix-widget">
        <div className="ix-columns" style={{ gridTemplateColumns: `repeat(${spec.labels.length}, minmax(64px, 1fr))` }} role="group" aria-label="სვეტოვანი დიაგრამა">
          {spec.labels.map((label, i) => (
            <div key={i} className={`ix-column ${mark(i)}`}>
              <div className="ix-column-stack">
                {Array.from({ length: spec.max }, (_, k) => {
                  const level = spec.max - k;
                  return (
                    <button
                      key={level}
                      type="button"
                      className={`ix-column-cell ${counts[i]! >= level ? 'is-on' : ''}`}
                      aria-label={`${label}: ${level}`}
                      disabled={done}
                      onClick={() => set(i, counts[i] === level ? level - 1 : level)}
                    />
                  );
                })}
              </div>
              <span className="ix-column-label">{label}</span>
              <Stepper label={label} value={counts[i]!} max={spec.max} onChange={(v) => set(i, v)} disabled={done} />
            </div>
          ))}
        </div>
        {done && <p className="ix-readout">სწორი პასუხი: {spec.labels.map((l, i) => `${l} — ${key[i]}`).join(', ')}</p>}
        <CheckButton ready={total > 0} done={done} onClick={() => onSubmit(counts.join(','))} />
      </div>
    );
  }

  return (
    <div className="ix-widget">
      <div className="ix-counter-rows" role="group" aria-label={spec.style === 'tally' ? 'აღრიცხვის ნიშნები' : 'პიქტოგრამა'}>
        {spec.labels.map((label, i) => (
          <div key={i} className={`ix-counter-row ${mark(i)}`}>
            <span className="ix-counter-label">{label}</span>
            <span className="ix-counter-body">
              {spec.style === 'tally' ? (
                <TallyMarks count={counts[i]!} />
              ) : (
                Array.from({ length: counts[i]! }, (_, k) => <Icon key={k} name={spec.icon} size={30} />)
              )}
            </span>
            <Stepper label={label} value={counts[i]!} max={spec.max} onChange={(v) => set(i, v)} disabled={done} />
            {unit > 1 && <span className="ix-per">= {counts[i]! * unit}</span>}
          </div>
        ))}
      </div>
      {done && <p className="ix-readout">სწორი პასუხი: {spec.labels.map((l, i) => `${l} — ${key[i]}`).join(', ')}</p>}
      <CheckButton ready={total > 0} done={done} onClick={() => onSubmit(counts.join(','))} />
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Pattern continuation
 * ---------------------------------------------------------------- */

function SequenceWidget({ spec, answer, done, onSubmit }: InteractionProps & { spec: Extract<InteractionSpec, { kind: 'sequence' }> }) {
  const [added, setAdded] = useState<string[]>([]);
  const key = answer.split(',');
  return (
    <div className="ix-widget">
      <div className="ix-seq" role="group" aria-label="მიმდევრობა">
        {spec.shown.map((icon, i) => (
          <Icon key={`s${i}`} name={icon} size={40} />
        ))}
        {Array.from({ length: spec.length }, (_, i) => {
          const value = added[i];
          const state = done ? (value === key[i] ? 'is-correct' : 'is-wrong') : '';
          return (
            <span key={`a${i}`} className={`ix-seq-slot ${value ? 'is-filled' : ''} ${state}`}>
              {value && <Icon name={value} size={38} />}
            </span>
          );
        })}
      </div>
      <p className="ix-subtitle">{done ? '' : 'აირჩიე, რა გაგრძელდება:'}</p>
      <div className="ix-tray" role="group" aria-label="ფიგურები">
        {spec.palette.map((icon) => (
          <button key={icon} type="button" className="ix-pal" aria-label={iconName(icon)} disabled={done || added.length >= spec.length} onClick={() => setAdded((c) => [...c, icon])}>
            <Icon name={icon} size={40} />
          </button>
        ))}
        <button type="button" className="ix-chip" disabled={done || added.length === 0} onClick={() => setAdded((c) => c.slice(0, -1))}>
          ↶ უკან
        </button>
      </div>
      {done && <p className="ix-readout">სწორი გაგრძელება: {key.map(iconName).join(', ')}</p>}
      <CheckButton ready={added.length === spec.length} done={done} onClick={() => onSubmit(added.join(','))} />
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Mirror image
 * ---------------------------------------------------------------- */

function CellsWidget({ spec, answer, done, onSubmit }: InteractionProps & { spec: Extract<InteractionSpec, { kind: 'cells' }> }) {
  const width = spec.rows[0]?.length ?? 0;
  const [grid, setGrid] = useState<boolean[][]>(() => spec.rows.map(() => Array.from({ length: width }, () => false)));
  const key = answer.split('/');
  const toggle = (r: number, c: number) => {
    if (done) return;
    setGrid((g) => g.map((row, i) => (i === r ? row.map((v, j) => (j === c ? !v : v)) : row)));
  };
  const out = grid.map((row) => row.map((v) => (v ? '#' : '.')).join('')).join('/');
  return (
    <div className="ix-widget">
      <div className="ix-mirror">
        <div className="ix-mirror-half" aria-label="მოცემული ნახევარი" role="img">
          {spec.rows.map((row, r) => (
            <div className="ix-mirror-row" key={r}>
              {[...row].map((ch, c) => (
                <span key={c} className={`ix-mcell ${ch === '#' ? 'is-on' : ''}`} />
              ))}
            </div>
          ))}
        </div>
        <div className="ix-axis" aria-hidden="true" />
        <div className="ix-mirror-half" role="group" aria-label="შენი ნახევარი">
          {grid.map((row, r) => (
            <div className="ix-mirror-row" key={r}>
              {row.map((v, c) => {
                const right = key[r]?.[c] === '#';
                const state = done ? (v === right ? (v ? 'is-correct' : '') : v ? 'is-wrong' : 'is-missing') : '';
                return (
                  <button key={c} type="button" className={`ix-mcell ix-mcell-btn ${v ? 'is-on' : ''} ${state}`} aria-label={`რიგი ${r + 1}, უჯრა ${c + 1}`} aria-pressed={v} disabled={done} onClick={() => toggle(r, c)} />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <CheckButton ready={!done} done={done} onClick={() => onSubmit(out)} />
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Signs in an expression
 * ---------------------------------------------------------------- */

function SlotsWidget({ spec, answer, done, onSubmit }: InteractionProps & { spec: Extract<InteractionSpec, { kind: 'slots' }> }) {
  const slotCount = spec.tokens.filter((t) => t === '?').length;
  const [picked, setPicked] = useState<Array<string | null>>(() => Array.from({ length: slotCount }, () => null));
  const [open, setOpen] = useState<number | null>(null);
  const key = answer.split(',');
  let slot = -1;
  return (
    <div className="ix-widget">
      <div className="ix-expr" role="group" aria-label="გამოსახულება">
        {spec.tokens.map((token, t) => {
          if (token !== '?') return <span className="ix-expr-token" key={t}>{token}</span>;
          slot += 1;
          const s = slot;
          const state = done ? (picked[s] === key[s] ? 'is-correct' : 'is-wrong') : '';
          return (
            <span className="ix-slot-wrap" key={t}>
              <button type="button" className={`ix-slot ${picked[s] ? 'is-filled' : ''} ${state}`} aria-label={`ადგილი ${s + 1}`} disabled={done} onClick={() => setOpen(open === s ? null : s)}>
                {picked[s] ?? '?'}
              </button>
              {open === s && !done && (
                <span className="ix-slot-menu" role="menu">
                  {spec.options.map((option) => (
                    <button key={option} type="button" role="menuitem" className="ix-slot-option" onClick={() => { setPicked((c) => c.map((v, i) => (i === s ? option : v))); setOpen(null); }}>
                      {option}
                    </button>
                  ))}
                </span>
              )}
            </span>
          );
        })}
      </div>
      {done && <p className="ix-readout">სწორი პასუხი: {key.join('  ')}</p>}
      <CheckButton ready={picked.every((v) => v !== null)} done={done} onClick={() => onSubmit(picked.join(','))} />
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Entry point
 * ---------------------------------------------------------------- */

export function InteractionView(props: InteractionProps): ReactElement {
  const { spec } = props;
  // Work state belongs to one question; the parent remounts by `key` per question.
  const body = useMemo(() => spec, [spec]);
  switch (body.kind) {
    case 'line':
      return <LineWidget {...props} spec={body} />;
    case 'chart':
      return <ChartWidget {...props} spec={body} />;
    case 'pick':
      return <PickWidget {...props} spec={body} />;
    case 'clock':
      return <ClockWidget {...props} spec={body} />;
    case 'fill':
      return <FillWidget {...props} spec={body} />;
    case 'build':
      return <BuildWidget {...props} spec={body} />;
    case 'purse':
      return <PurseWidget {...props} spec={body} />;
    case 'bins':
      return <BinsWidget {...props} spec={body} />;
    case 'counters':
      return <CountersWidget {...props} spec={body} />;
    case 'sequence':
      return <SequenceWidget {...props} spec={body} />;
    case 'cells':
      return <CellsWidget {...props} spec={body} />;
    case 'slots':
      return <SlotsWidget {...props} spec={body} />;
  }
}
