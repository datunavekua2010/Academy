import { useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { CHAR_ICONS } from './iconMap';
import { drawIcon } from './icons';
import { describePicture } from './parse';
import type { NumberCell, PicToken, Picture } from './types';
import './pictures.css';

/**
 * Draws a `Picture`.
 *
 * The same component serves two jobs. Shown on its own it is the question's
 * illustration; given a `pick` it also becomes the answer control — the student
 * taps the number, coin, day or shape the question asks for, and the tap is
 * submitted exactly as a typed or chosen answer would be. So every tap is checked
 * by the engine the same way and nothing here knows what is right.
 */

/** What a tap on the picture means to the question. */
export interface PickProps {
  /** May the student tap right now (false once the question is answered)? */
  enabled: boolean;
  /** The value of the tapped target, as the question's answer is written. */
  onPick: (value: string) => void;
  /** After answering: how a target should be marked. */
  stateOf: (value: string) => 'correct' | 'wrong' | undefined;
}

/* ---------------------------------------------------------------- *\
 * What can be tapped
 * ---------------------------------------------------------------- */

const SHAPE_NAMES = new Set(
  Object.values(CHAR_ICONS)
    .filter((info) => info.key.startsWith('shape-') && !info.key.includes('line'))
    .map((info) => info.ka),
);

const iconName = (key: string): string | undefined =>
  Object.values(CHAR_ICONS).find((info) => info.key === key)?.ka;

/** Every value a tap on this picture could submit. */
export function pictureTargets(picture: Picture): string[] {
  switch (picture.kind) {
    case 'strip':
      return picture.cells.filter((c) => !c.mark && !c.pointer && !c.unknown).map((c) => c.text);
    case 'chart':
      return picture.rows.flat().filter((c) => !c.mark && !c.pointer && !c.unknown).map((c) => c.text);
    case 'chips':
      return picture.items.filter((c) => !c.mark).map((c) => c.text);
    case 'coins':
      return picture.coins.flatMap((c) => [`${c}`, `${c} თეთრი`]);
    case 'rows':
      return picture.rows.flatMap((row) =>
        row.tokens.flatMap((token) => {
          if (token.t !== 'icon') return [];
          const name = iconName(token.icon);
          return name && SHAPE_NAMES.has(name) ? [name] : [];
        }),
      );
    default:
      return [];
  }
}

/* ---------------------------------------------------------------- *\
 * Pieces
 * ---------------------------------------------------------------- */

export function Icon({ name, state, size }: { name: string; state?: 'crossed' | 'faded'; size?: number }) {
  return (
    <svg
      className={`pic-icon ${state ? `is-${state}` : ''}`}
      viewBox="0 0 40 40"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      {drawIcon(name)}
      {state === 'crossed' && drawIcon('cross')}
    </svg>
  );
}

export function Rod({ color }: { color: string }) {
  const fill = { blue: '#3f8be8', red: '#e8473f', green: '#4cae5a', yellow: '#f6d643', purple: '#8b5fd1', orange: '#f7a233' }[color] ?? '#3f8be8';
  return (
    <svg className="pic-rod" viewBox="0 0 16 48" aria-hidden="true" focusable="false">
      <rect x="2" y="1" width="12" height="46" rx="2.5" fill={fill} stroke="#33415c" strokeWidth="1.5" />
      {[10, 19, 28, 37].map((y) => (
        <path key={y} d={`M2 ${y}h12`} stroke="#fff" strokeOpacity=".55" strokeWidth="1" />
      ))}
    </svg>
  );
}

interface CountState {
  order: number[];
  toggle: (id: number) => void;
}

function Tokens({
  tokens,
  counting,
  idBase,
  pick,
  spaced,
}: {
  tokens: PicToken[];
  counting?: CountState;
  idBase: number;
  pick?: PickProps;
  spaced?: boolean;
}) {
  let running = idBase;
  let plainIcons = 0;
  const nodes: ReactNode[] = [];
  tokens.forEach((token, index) => {
    const id = running;
    switch (token.t) {
      case 'icon': {
        running += 1;
        plainIcons += 1;
        const name = iconName(token.icon);
        const shaped = name && SHAPE_NAMES.has(name);
        const tappable = Boolean(pick?.enabled && shaped);
        const stateMark = shaped && name ? pick?.stateOf(name) : undefined;
        const place = counting ? counting.order.indexOf(id) : -1;
        const countable = Boolean(counting && token.state !== 'crossed' && token.icon !== 'cross');
        const gap = spaced && plainIcons % 5 === 0 && index < tokens.length - 1;
        const body = <Icon name={token.icon} state={token.state} />;
        if (tappable && name) {
          nodes.push(
            <button
              key={index}
              type="button"
              className={`pic-token pic-pick ${stateMark ? `is-${stateMark}` : ''} ${gap ? 'pic-gap5' : ''}`}
              onClick={() => pick?.onPick(name)}
              aria-label={name}
            >
              {body}
              {stateMark && <span className="pic-badge" aria-hidden="true">{stateMark === 'correct' ? '✓' : '✗'}</span>}
            </button>,
          );
        } else if (countable) {
          nodes.push(
            <button
              key={index}
              type="button"
              className={`pic-token pic-count ${place >= 0 ? 'is-counted' : ''} ${gap ? 'pic-gap5' : ''}`}
              onClick={() => counting?.toggle(id)}
              aria-pressed={place >= 0}
              aria-label={place >= 0 ? `დათვლილია: ${place + 1}` : 'დასათვლელი'}
            >
              {body}
              {place >= 0 && <span className="pic-badge pic-count-badge" aria-hidden="true">{place + 1}</span>}
            </button>,
          );
        } else {
          nodes.push(
            <span key={index} className={`pic-token ${gap ? 'pic-gap5' : ''}`}>
              {body}
            </span>,
          );
        }
        break;
      }
      case 'rod':
        running += 1;
        nodes.push(
          <span key={index} className="pic-token">
            <Rod color={token.color} />
          </span>,
        );
        break;
      case 'unknown':
        nodes.push(
          <span key={index} className="pic-unknown" aria-hidden="true">
            ?
          </span>,
        );
        break;
      case 'pointer':
        nodes.push(
          <span key={index} className="pic-pointer" aria-hidden="true">
            ☝
          </span>,
        );
        break;
      case 'text':
        nodes.push(
          <span key={index} className="pic-text">
            {token.text}
          </span>,
        );
        break;
      case 'sep':
        nodes.push(
          <span key={index} className={`pic-sep is-${token.style}`} aria-hidden="true">
            {token.style === 'arrow' ? '➔' : ''}
          </span>,
        );
        break;
      case 'group': {
        const inner = token.tokens;
        const innerIcons = inner.filter((t) => t.t === 'icon' || t.t === 'rod').length;
        nodes.push(
          <span key={index} className="pic-group">
            <Tokens tokens={inner} idBase={running} pick={pick} />
          </span>,
        );
        running += innerIcons;
        break;
      }
    }
  });
  return <>{nodes}</>;
}

/* ---------------------------------------------------------------- *\
 * Each picture
 * ---------------------------------------------------------------- */

function RowsPicture({ picture, pick }: { picture: Extract<Picture, { kind: 'rows' }>; pick?: PickProps }) {
  const [order, setOrder] = useState<number[]>([]);
  const toggle = (id: number) =>
    setOrder((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  // Counting by tapping is offered on rows of plain objects, never on shapes the
  // student is meant to *name* and never on a row that has been struck through.
  const countable = picture.rows.some(
    (row) => row.tokens.filter((t) => t.t === 'icon' && !iconName(t.icon)?.includes('წრე') ).length >= 3,
  );
  const hasShapes = picture.rows.some((row) =>
    row.tokens.some((t) => t.t === 'icon' && SHAPE_NAMES.has(iconName(t.icon) ?? '')),
  );
  const counting: CountState | undefined = countable && !hasShapes ? { order, toggle } : undefined;
  let base = 0;
  return (
    <div className="pic-rows">
      {picture.rows.map((row, r) => {
        const start = base;
        base += row.tokens.length + 50;
        const plain = row.tokens.every((t) => t.t === 'icon');
        return (
          <div className="pic-row" key={r}>
            {row.label && <span className="pic-label">{row.label}</span>}
            <span className="pic-flow">
              <Tokens
                tokens={row.tokens}
                idBase={start}
                counting={counting}
                pick={pick}
                spaced={plain && row.tokens.length >= 6}
              />
            </span>
          </div>
        );
      })}
      {counting && (
        <p className="pic-count-hint" aria-live="polite">
          {order.length > 0 ? `დათვლილია: ${order.length}` : 'შეგიძლია შეეხო საგნებს და ისე დათვალო.'}
        </p>
      )}
    </div>
  );
}

function CellButton({
  cell,
  pick,
  className = '',
}: {
  cell: NumberCell;
  pick?: PickProps;
  className?: string;
}) {
  const targetable = Boolean(pick?.enabled && !cell.mark && !cell.pointer && !cell.unknown);
  const mark = pick && !cell.mark && !cell.pointer ? pick.stateOf(cell.text) : undefined;
  const classes = `pic-cell ${cell.mark ? 'is-mark' : ''} ${cell.unknown ? 'is-unknown' : ''} ${mark ? `is-${mark}` : ''} ${className}`;
  const content = (
    <>
      {cell.pointer && <span className="pic-cell-ptr" aria-hidden="true">▼</span>}
      <span className="pic-cell-text">{cell.text}</span>
      {cell.unknown && cell.text !== '?' && <span className="pic-cell-q" aria-hidden="true">?</span>}
      {mark && <span className="pic-badge" aria-hidden="true">{mark === 'correct' ? '✓' : '✗'}</span>}
    </>
  );
  if (targetable) {
    return (
      <button type="button" className={`${classes} is-tappable`} onClick={() => pick?.onPick(cell.text)}>
        {content}
      </button>
    );
  }
  return <span className={classes}>{content}</span>;
}

function StripPicture({ picture, pick }: { picture: Extract<Picture, { kind: 'strip' }>; pick?: PickProps }) {
  return (
    <div className="pic-strip" role="group" aria-label="რიცხვითი ხაზი">
      {picture.cells.map((cell, i) => (
        <div className="pic-strip-step" key={i}>
          <CellButton cell={cell} pick={pick} />
          <span className="pic-strip-tick" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}

function ChartPicture({ picture, pick }: { picture: Extract<Picture, { kind: 'chart' }>; pick?: PickProps }) {
  const width = Math.max(...picture.rows.map((row) => row.length));
  return (
    <div className="pic-chart" style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }} role="group" aria-label="რიცხვების ცხრილი">
      {picture.rows.flatMap((row, r) =>
        row.map((cell, c) => <CellButton key={`${r}-${c}`} cell={cell} pick={pick} />),
      )}
    </div>
  );
}

function ClockPicture({ minutes }: { minutes: number }) {
  const hour = Math.floor(minutes / 60) % 12;
  const minute = minutes % 60;
  const hourAngle = (hour + minute / 60) * 30;
  const minuteAngle = minute * 6;
  const point = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: 100 + Math.sin(rad) * radius, y: 100 - Math.cos(rad) * radius };
  };
  const hourEnd = point(hourAngle, 46);
  const minuteEnd = point(minuteAngle, 70);
  return (
    <svg className="pic-clock" viewBox="0 0 200 200" role="img" aria-label="ანალოგური საათი ისრებით">
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
      <line x1="100" y1="100" x2={hourEnd.x} y2={hourEnd.y} stroke="#e8473f" strokeWidth="7" strokeLinecap="round" />
      <line x1="100" y1="100" x2={minuteEnd.x} y2={minuteEnd.y} stroke="#1d2a4a" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="100" cy="100" r="6" fill="#33415c" />
    </svg>
  );
}

export const COIN_STYLE: Record<number, { fill: string; ring: string; r: number }> = {
  1: { fill: '#c98a4a', ring: '#8c5a28', r: 19 },
  2: { fill: '#c98a4a', ring: '#8c5a28', r: 22 },
  5: { fill: '#d9b24a', ring: '#9a7a1c', r: 24 },
  10: { fill: '#d9b24a', ring: '#9a7a1c', r: 26 },
  20: { fill: '#e3c35a', ring: '#9a7a1c', r: 28 },
  50: { fill: '#cfd6e4', ring: '#6b7a99', r: 30 },
};

function CoinsPicture({ picture, pick }: { picture: Extract<Picture, { kind: 'coins' }>; pick?: PickProps }) {
  const [summed, setSummed] = useState<number[]>([]);
  const toggle = (index: number) =>
    setSummed((current) => (current.includes(index) ? current.filter((x) => x !== index) : [...current, index]));
  const adding = !pick?.enabled || pictureTargets(picture).length === 0;
  const total = summed.reduce((sum, i) => sum + (picture.coins[i] ?? 0), 0);
  return (
    <div className="pic-coins">
      {picture.label && <span className="pic-label">{picture.label}</span>}
      <div className="pic-coin-row">
        {picture.coins.map((value, index) => {
          const style = COIN_STYLE[value] ?? COIN_STYLE[10]!;
          const size = style.r * 2 + 6;
          const marked = summed.includes(index);
          const mark = pick?.stateOf(`${value} თეთრი`) ?? pick?.stateOf(`${value}`);
          const face = (
            <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true" focusable="false">
              <circle cx="30" cy="30" r={style.r} fill={style.fill} stroke={style.ring} strokeWidth="3" />
              <circle cx="30" cy="30" r={style.r - 5} fill="none" stroke={style.ring} strokeOpacity=".5" strokeWidth="1.2" strokeDasharray="2 2.4" />
              <text x="30" y="36" textAnchor="middle" fontSize={value >= 10 ? 17 : 19} fontWeight="900" fill="#33415c">
                {value}
              </text>
            </svg>
          );
          if (pick?.enabled && !adding) {
            return (
              <button
                key={index}
                type="button"
                className={`pic-token pic-pick ${mark ? `is-${mark}` : ''}`}
                aria-label={`${value} თეთრი`}
                onClick={() => pick.onPick(String(value))}
              >
                {face}
              </button>
            );
          }
          return (
            <button
              key={index}
              type="button"
              className={`pic-token pic-count ${marked ? 'is-counted' : ''}`}
              aria-pressed={marked}
              aria-label={`${value} თეთრი`}
              onClick={() => toggle(index)}
            >
              {face}
            </button>
          );
        })}
      </div>
      {adding && picture.coins.length > 1 && (
        <p className="pic-count-hint" aria-live="polite">
          {summed.length > 0 ? `მონეტების ჯამი: ${total} თეთრი` : 'შეეხე მონეტებს და დაითვალე, რამდენია სულ.'}
        </p>
      )}
    </div>
  );
}

function TagsPicture({ picture }: { picture: Extract<Picture, { kind: 'tags' }> }) {
  return (
    <div className="pic-tags">
      {picture.items.map((item, i) => (
        <span className="pic-tag" key={i}>
          {item.label && <span className="pic-tag-no">{item.label}</span>}
          <span className="pic-tag-body">{item.amount} თეთრი</span>
        </span>
      ))}
    </div>
  );
}

function BarsPicture({ picture }: { picture: Extract<Picture, { kind: 'bars' }> }) {
  const max = Math.max(...picture.items.map((b) => b.size), 1);
  return (
    <div className="pic-bars">
      {picture.items.map((bar, i) => (
        <div className="pic-bar-row" key={i}>
          {bar.label && <span className="pic-label">{bar.label}</span>}
          <span className="pic-bar" style={{ width: `${Math.max(14, (bar.size / max) * 100)}%` }} />
          {bar.caption && <span className="pic-bar-caption">{bar.caption}</span>}
        </div>
      ))}
    </div>
  );
}

function ColumnPicture({ picture }: { picture: Extract<Picture, { kind: 'column' }> }) {
  return (
    <div className="pic-column" role="img" aria-label={describePicture(picture)}>
      {picture.heading && <span className="pic-label">{picture.heading}</span>}
      <div className="pic-column-sheet">
        <div className="pic-column-head" aria-hidden="true">
          <span>ათ.</span>
          <span>ერთ.</span>
        </div>
        <div className="pic-column-line">
          <span className="pic-column-digits">{picture.top}</span>
        </div>
        <div className="pic-column-line is-rule">
          <span className="pic-column-sign">{picture.sign}</span>
          <span className="pic-column-digits">{picture.bottom}</span>
        </div>
        {picture.result !== undefined && (
          <div className="pic-column-line">
            <span className="pic-column-digits">{picture.result}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CellsPicture({ picture }: { picture: Extract<Picture, { kind: 'cells' }> }) {
  const rows = picture.rows;
  const widths = rows.map((r) => Array.from(r).length);
  const cols = Math.max(...widths);
  const size = 26;
  return (
    <figure className="pic-cells">
      {picture.label && <figcaption className="pic-label">{picture.label}</figcaption>}
      <svg viewBox={`0 0 ${cols * size + 6} ${rows.length * size + 6}`} width={cols * size + 6} height={rows.length * size + 6} role="img" aria-label={describePicture(picture)}>
        {rows.map((row, r) =>
          Array.from(row).map((ch, c) => {
            if (ch === '│') {
              return <line key={`${r}-${c}`} x1={3 + c * size + size / 2} x2={3 + c * size + size / 2} y1={3 + r * size - 2} y2={3 + (r + 1) * size + 2} stroke="#e8473f" strokeWidth="3" strokeDasharray="5 3" />;
            }
            if (ch === ' ') return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={3 + c * size + 1}
                y={3 + r * size + 1}
                width={size - 2}
                height={size - 2}
                rx="4"
                fill={ch === '■' ? '#3f8be8' : '#f4f7fd'}
                stroke={ch === '■' ? '#33415c' : '#d6e0f2'}
                strokeWidth="1.4"
              />
            );
          }),
        )}
      </svg>
    </figure>
  );
}

function flatIcons(tokens: PicToken[]): Array<{ icon: string; state?: 'crossed' | 'faded' }> {
  return tokens.flatMap((t) => (t.t === 'icon' ? [{ icon: t.icon, state: t.state }] : t.t === 'group' ? flatIcons(t.tokens) : []));
}

function BalancePicture({ picture }: { picture: Extract<Picture, { kind: 'balance' }> }) {
  const angle = picture.tilt === 'level' ? 0 : picture.tilt === 'left' ? -9 : 9;
  const rad = (angle * Math.PI) / 180;
  const reach = 100;
  const leftEnd = { x: 160 - reach * Math.cos(rad), y: 44 - reach * Math.sin(rad) };
  const rightEnd = { x: 160 + reach * Math.cos(rad), y: 44 + reach * Math.sin(rad) };
  const left = flatIcons(picture.left);
  const right = flatIcons(picture.right);
  const caps = (tokens: PicToken[]): string =>
    tokens
      .flatMap((t) => (t.t === 'group' ? t.tokens : [t]))
      .filter((t): t is { t: 'text'; text: string } => t.t === 'text')
      .map((t) => t.text.replace(/[()]/g, ''))
      .join(' ');
  const pan = (icons: ReturnType<typeof flatIcons>, end: { x: number; y: number }) => {
    const per = 4;
    const size = 30;
    const top = end.y + 70;
    const rows = Math.max(1, Math.ceil(icons.length / per));
    return (
      <g>
        <path d={`M${end.x - 3} ${end.y}L${end.x - 48} ${top}M${end.x + 3} ${end.y}L${end.x + 48} ${top}`} stroke="#33415c" strokeWidth="1.4" fill="none" />
        {icons.map((icon, index) => {
          const row = Math.floor(index / per);
          const inRow = Math.min(per, icons.length - row * per);
          const x = end.x - (inRow * size) / 2 + (index % per) * size;
          const y = top - (rows - row) * size + 4;
          return (
            <svg key={index} x={x} y={y} width={size} height={size} viewBox="0 0 40 40">
              {drawIcon(icon.icon)}
              {icon.state === 'crossed' && drawIcon('cross')}
            </svg>
          );
        })}
        <path d={`M${end.x - 54} ${top}h108c0 9-12 15-54 15s-54-6-54-15z`} fill="#dbe6f8" stroke="#33415c" strokeWidth="2.4" />
      </g>
    );
  };
  const leftCaption = caps(picture.left);
  const rightCaption = caps(picture.right);
  return (
    <figure className="pic-balance">
      <svg viewBox="0 0 320 180" role="img" aria-label={describePicture(picture)}>
        <path d="M160 44v118M126 168h68" stroke="#33415c" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d={`M${leftEnd.x} ${leftEnd.y}L${rightEnd.x} ${rightEnd.y}`} stroke="#33415c" strokeWidth="7" strokeLinecap="round" />
        <circle cx="160" cy="44" r="8" fill="#e8473f" stroke="#33415c" strokeWidth="2" />
        {pan(left, leftEnd)}
        {pan(right, rightEnd)}
      </svg>
      {(leftCaption || rightCaption) && (
        <figcaption className="pic-balance-caption">
          <span>{leftCaption}</span>
          <span>{rightCaption}</span>
        </figcaption>
      )}
    </figure>
  );
}

function ChipsPicture({ picture, pick }: { picture: Extract<Picture, { kind: 'chips' }>; pick?: PickProps }) {
  return (
    <div className="pic-chips" role="group" aria-label="თანმიმდევრობა">
      {picture.items.map((item, i) => {
        const mark = pick && !item.mark ? pick.stateOf(item.text) : undefined;
        const classes = `pic-chip ${item.mark ? 'is-mark' : ''} ${mark ? `is-${mark}` : ''}`;
        const targetable = Boolean(pick?.enabled && !item.mark);
        return (
          <span className="pic-chip-wrap" key={i}>
            {i > 0 && (
              <span className="pic-chip-link" aria-hidden="true">
                {picture.arrows ? '➔' : '·'}
              </span>
            )}
            {targetable ? (
              <button type="button" className={`${classes} is-tappable`} onClick={() => pick?.onPick(item.text)}>
                {item.text}
              </button>
            ) : (
              <span className={classes}>
                {item.text}
                {mark && <span className="pic-badge" aria-hidden="true">{mark === 'correct' ? '✓' : '✗'}</span>}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function BlocksPicture({ picture }: { picture: Extract<Picture, { kind: 'blocks' }> }) {
  return (
    <div className="pic-blocks" role="img" aria-label={describePicture(picture)}>
      <span className="pic-blocks-tens">
        {Array.from({ length: picture.tens }, (_, i) => (
          <Rod key={i} color="blue" />
        ))}
      </span>
      <span className="pic-blocks-ones">
        {Array.from({ length: picture.ones }, (_, i) => (
          <Icon key={i} name="unit" size={26} />
        ))}
      </span>
    </div>
  );
}

function PartsPicture({ picture }: { picture: Extract<Picture, { kind: 'parts' }> }) {
  return (
    <div className="pic-parts" role="img" aria-label={describePicture(picture)}>
      {picture.label && <span className="pic-label">{picture.label}</span>}
      {picture.bars.map((bar, b) => (
        <span className="pic-parts-bar" key={b}>
          {bar.map((part, p) => (
            <span
              key={p}
              className={`pic-part ${part.shaded ? 'is-shaded' : ''}`}
              style={{ flexGrow: part.size }}
            />
          ))}
        </span>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- *\
 * Entry point
 * ---------------------------------------------------------------- */

export function PictureView({ picture, pick }: { picture: Picture; pick?: PickProps }): ReactElement {
  const body = (() => {
    switch (picture.kind) {
      case 'rows':
        return <RowsPicture picture={picture} pick={pick} />;
      case 'strip':
        return <StripPicture picture={picture} pick={pick} />;
      case 'chart':
        return <ChartPicture picture={picture} pick={pick} />;
      case 'clock':
        return <ClockPicture minutes={picture.minutes} />;
      case 'coins':
        return <CoinsPicture picture={picture} pick={pick} />;
      case 'tags':
        return <TagsPicture picture={picture} />;
      case 'bars':
        return <BarsPicture picture={picture} />;
      case 'column':
        return <ColumnPicture picture={picture} />;
      case 'cells':
        return <CellsPicture picture={picture} />;
      case 'balance':
        return <BalancePicture picture={picture} />;
      case 'chips':
        return <ChipsPicture picture={picture} pick={pick} />;
      case 'blocks':
        return <BlocksPicture picture={picture} />;
      case 'parts':
        return <PartsPicture picture={picture} />;
    }
  })();
  return (
    <div className={`pic-card pic-${picture.kind}-card`} data-picture={picture.kind}>
      {body}
      <p className="visually-hidden">{describePicture(picture)}</p>
    </div>
  );
}
