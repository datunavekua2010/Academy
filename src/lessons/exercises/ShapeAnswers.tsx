import { useMemo, useRef, useState, type PointerEvent } from 'react';
import type { DivisionRule, ShapeItem, ShapeKind, ShapeSpec, SkinId } from '../types';
import { ComparableBoard, PAD, ShapeBoard, ShapePicture, boardPoint, fillFor } from './ShapeBoard';
import { SIZE, divisionFromLines, divisionOf, fitsPlace, formatLines, hasEqualParts, parseLines, pathOf, pointIn, snapPoints, type Piece, type Pt } from './ShapeGeometry';

/**
 * Answer controls for the equal-parts lessons: sorting pictures into groups, tapping pieces,
 * putting pieces back into an outline and dividing a shape with dots. Nothing here decides
 * whether an answer is right (see `check.ts`); the geometry does.
 */

// ─────────────────────────── sorting ───────────────────────────

export interface SortGroup {
  id: string;
  label: string;
  icon: string;
}

export const RULE_GROUPS: Record<DivisionRule | 'wholeparts', SortGroup[]> = {
  equal: [
    { id: 'e', label: 'ტოლი ნაწილები', icon: '＝' },
    { id: 'u', label: 'არატოლი ნაწილები', icon: '≠' },
  ],
  halves: [
    { id: 'y', label: 'ნახევრებია', icon: '✓' },
    { id: 'n', label: 'ნახევრები არ არის', icon: '✗' },
  ],
  quarters: [
    { id: 'y', label: 'მეოთხედებია', icon: '✓' },
    { id: 'n', label: 'მეოთხედები არ არის', icon: '✗' },
  ],
  wholeparts: [
    { id: 'w', label: 'ერთი მთელი', icon: '◼' },
    { id: 'p', label: 'ერთი მთელის ნაწილები', icon: '◧' },
    { id: 'x', label: 'არ ერგება ერთმანეთს', icon: '✗' },
  ],
};

export const parseGroups = (value: string, count: number): string[] => Array.from({ length: count }, (_, i) => value.split(',')[i]?.trim() ?? '');

interface SortProps {
  items: ShapeItem[];
  rule: DivisionRule | 'wholeparts';
  groups: string[];
  onChange: (groups: string[]) => void;
  disabled?: boolean;
  /** Tell the student, picture by picture, whether it is in the right group (exploration only). */
  right?: (index: number) => boolean;
  label: string;
}

export function SortBoard({ items, rule, groups, onChange, disabled = false, right, label }: SortProps) {
  const options = RULE_GROUPS[rule];
  const [selected, setSelected] = useState<number | null>(null);
  const open = groups.map((g, i) => (g ? -1 : i)).filter((i) => i >= 0);
  const place = (groupId: string) => {
    if (disabled || selected === null) return;
    const next = groups.map((g, i) => (i === selected ? groupId : g));
    onChange(next);
    const after = next.findIndex((g) => !g);
    setSelected(after >= 0 ? after : null);
  };
  const pick = (i: number) => {
    if (disabled) return;
    setSelected((now) => (now === i ? null : i));
  };
  const card = (i: number) => {
    const placed = groups[i];
    const verdict = right && placed ? (right(i) ? 'ok' : 'no') : undefined;
    return (
      <button key={i} type="button" className={`sort-card ${selected === i ? 'is-selected' : ''} ${verdict ? `is-${verdict}` : ''}`} aria-pressed={selected === i} aria-label={`ნახატი ${i + 1}${selected === i ? ', არჩეულია' : ''}`} disabled={disabled} onClick={() => pick(i)}>
        <span className="sort-no">{i + 1}</span>
        <ShapePicture item={items[i]} compact />
        {verdict && <span className="sort-mark">{verdict === 'ok' ? '✓ სწორია' : '✗ სხვა ჯგუფი'}</span>}
      </button>
    );
  };
  return (
    <div className="sort" role="group" aria-label={label}>
      <p className="sort-hint" role="status" aria-live="polite">
        {selected !== null ? `ნახატი ${selected + 1} არჩეულია. შეეხე ჯგუფს, სადაც უნდა ჩადო.` : open.length > 0 ? 'შეეხე ნახატს, მერე ჯგუფს.' : 'ყველა ნახატი დალაგებულია. თუ გადაიფიქრე, შეეხე ნახატს და სხვა ჯგუფს.'}
      </p>
      {open.length > 0 && <div className="sort-tray">{open.map(card)}</div>}
      <div className={`sort-bins has-${options.length}`}>
        {options.map((g) => {
          const inside = groups.map((x, i) => (x === g.id ? i : -1)).filter((i) => i >= 0);
          return (
            <section key={g.id} className="sort-bin" aria-label={g.label}>
              <button type="button" className="sort-bin-btn" disabled={disabled || selected === null} onClick={() => place(g.id)}>
                <span aria-hidden="true">{g.icon}</span> {g.label}
              </button>
              <div className="sort-cards">{inside.length === 0 ? <span className="sort-empty">ცარიელია</span> : inside.map(card)}</div>
            </section>
          );
        })}
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled || groups.every((g) => !g)} onClick={() => (onChange(groups.map(() => '')), setSelected(0))}>
          ↻ თავიდან
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────── tapping pieces ───────────────────────────

export function SelectBoard({ spec, need, picked, onChange, disabled, label, noun = 'ნაწილი' }: { spec: ShapeSpec; need: number; picked: number[]; onChange: (picked: number[]) => void; disabled: boolean; label: string; noun?: string }) {
  const toggle = (n: number) => onChange(picked.includes(n) ? picked.filter((x) => x !== n) : [...picked, n].sort((a, b) => a - b));
  return (
    <div className="sel">
      <ShapeBoard spec={spec} onPiece={disabled ? undefined : toggle} pressed={picked} marks={Object.fromEntries(picked.map((n) => [n, 'sel' as const]))} badges={false} label={label} />
      <div className="xt-row">
        <output className="objs-count" aria-live="polite">
          არჩეულია: <strong>{picked.length}</strong> {noun}
          {need > 1 ? ` (საჭიროა ${need})` : ''}
        </output>
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled || picked.length === 0} onClick={() => onChange([])}>
          ↻ გასუფთავება
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────── putting pieces back ───────────────────────────

interface TrayItem {
  piece: Piece;
  fill: string;
  decoy: boolean;
}

export function trayItems(shape: ShapeSpec, decoys: Array<{ spec: ShapeSpec; piece: number }> = []): TrayItem[] {
  const main = divisionOf(shape).pieces.map((piece, i) => ({ piece, fill: fillFor(shape, i, false), decoy: false }));
  const other = decoys.map((d, i) => ({ piece: divisionOf(d.spec).pieces[d.piece - 1], fill: fillFor(d.spec, i + 1, false), decoy: true }));
  return [...main, ...other];
}

const bbox = (piece: Piece) => {
  const xs = piece.poly.map((p) => p[0]);
  const ys = piece.poly.map((p) => p[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
};

/** Where each tray item waits (its top left corner), packed in rows under the outline. */
export function trayLayout(items: TrayItem[], width: number): { spots: Pt[]; height: number } {
  const order = items.map((_, i) => i).reverse();
  if (order.length > 1) order.push(order.shift() as number);
  const gap = 8;
  const rows: Array<{ ids: number[]; width: number; height: number }> = [];
  for (const id of order) {
    const b = bbox(items[id].piece);
    const row = rows[rows.length - 1];
    if (row && row.width + gap + b.w <= width) {
      row.ids.push(id);
      row.width += gap + b.w;
      row.height = Math.max(row.height, b.h);
    } else rows.push({ ids: [id], width: b.w, height: b.h });
  }
  const spots: Pt[] = items.map(() => [0, 0]);
  let y = 0;
  for (const row of rows) {
    let x = (width - row.width) / 2;
    for (const id of row.ids) {
      spots[id] = [x, y];
      x += bbox(items[id].piece).w + gap;
    }
    y += row.height + gap;
  }
  return { spots, height: Math.max(0, y - gap) };
}

export const parsePlaces = (value: string, count: number): Array<number | null> => Array.from({ length: count }, (_, i) => {
  const cell = value.split(',')[i];
  // an empty cell means "still in the tray": Number('') is 0, which would look like place 1
  if (cell === undefined || cell.trim() === '' || cell.trim() === '-') return null;
  const n = Number(cell);
  return Number.isInteger(n) && n >= 0 ? n : null;
});

export function ReassembleBoard({ shape, decoys, value, onChange, disabled, label }: { shape: ShapeSpec; decoys?: Array<{ spec: ShapeSpec; piece: number }>; value: string; onChange: (value: string) => void; disabled: boolean; label: string }) {
  const division = divisionOf(shape);
  const [w, h] = SIZE[shape.shape];
  const items = useMemo(() => trayItems(shape, decoys), [shape, decoys]);
  const slots = division.pieces;
  const places = parsePlaces(value, items.length);
  const full = w + 2 * PAD - 8;
  const tray = useMemo(() => trayLayout(items, full), [items, full]);
  const trayTop = h + 26;
  const height = trayTop + tray.height + PAD + 6;
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState('შეეხე ნაწილს, მერე ადგილს ხაზებში. ან გადაათრიე ნაწილი.');
  const [drag, setDrag] = useState<{ id: number; dx: number; dy: number } | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const start = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const placedCount = places.filter((p) => p !== null).length;
  const real = slots.length;

  const emit = (next: Array<number | null>) => onChange(next.map((p) => (p === null ? '-' : String(p))).join(','));

  const attempt = (id: number, slot: number) => {
    if (disabled) return;
    if (places.includes(slot)) {
      setMessage('ეს ადგილი უკვე დაკავებულია. შეეხე იქ მდგარ ნაწილს, რომ უკან გადავიდეს.');
      return;
    }
    if (items[id].decoy) {
      setMessage('ეს ნაწილი სხვა ფიგურას ეკუთვნის: ის აქ არ ჯდება.');
      return;
    }
    if (!fitsPlace(items[id].piece, slots[slot])) {
      setMessage('ეს ნაწილი აქ ზუსტად არ ჯდება. სცადე სხვა ადგილი.');
      return;
    }
    const next = [...places];
    next[id] = slot;
    emit(next);
    setSelected(null);
    setMessage(placedCount + 1 === real ? 'ყველა ნაწილი თავის ადგილზეა. ფიგურა მთელია!' : 'ჯდება! გააგრძელე.');
  };
  const send = (id: number) => {
    if (disabled) return;
    const next = [...places];
    next[id] = null;
    emit(next);
    setMessage('ნაწილი ისევ ქვემოთაა.');
  };
  const tapItem = (id: number) => {
    if (disabled) return;
    if (places[id] !== null) send(id);
    else setSelected((now) => (now === id ? null : id));
  };
  const tapSlot = (slot: number) => {
    if (disabled) return;
    if (selected === null) {
      setMessage('ჯერ შეეხე ნაწილს ქვემოთ.');
      return;
    }
    attempt(selected, slot);
  };

  const down = (e: PointerEvent<SVGGElement>, id: number) => {
    if (disabled || places[id] !== null) return;
    start.current = { id, x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const move = (e: PointerEvent<SVGGElement>) => {
    const s = start.current;
    if (!s || !svg.current) return;
    if (Math.abs(e.clientX - s.x) + Math.abs(e.clientY - s.y) > 6) s.moved = true;
    if (!s.moved) return;
    const a = boardPoint(svg.current, s.x, s.y);
    const b = boardPoint(svg.current, e.clientX, e.clientY);
    setDrag({ id: s.id, dx: b[0] - a[0], dy: b[1] - a[1] });
  };
  const up = (e: PointerEvent<SVGGElement>) => {
    const s = start.current;
    start.current = null;
    setDrag(null);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (!s || !s.moved || !svg.current) return; // a tap: the click handler takes it
    const at = boardPoint(svg.current, e.clientX, e.clientY);
    const slot = slots.findIndex((sl) => pointIn(at, sl.poly));
    if (slot >= 0) attempt(s.id, slot);
    else setMessage('ნაწილი ადგილზე არ დადე. გადაათრიე ხაზებით შემოხაზულ ადგილზე.');
    // browsers send a click after a drag: ignore it
    suppress.current = true;
  };
  const suppress = useRef(false);
  const click = (id: number) => {
    if (suppress.current) {
      suppress.current = false;
      return;
    }
    tapItem(id);
  };

  return (
    <div className="rs">
      <svg ref={svg} className="sh rs-board" viewBox={`${-PAD} ${-PAD} ${w + 2 * PAD} ${r1(height + PAD)}`} style={{ maxWidth: `${Math.round(((w + 2 * PAD) / 132) * 280)}px` }} role="group" aria-label={label}>
        {slots.map((slot, j) => (
          <path key={`slot${j}`} className={`rs-slot ${places.includes(j) ? 'is-filled' : ''}`} d={pathOf(slot.poly)} role="button" tabIndex={disabled ? -1 : 0} aria-label={`ადგილი ${j + 1}${places.includes(j) ? ', დაკავებულია' : ''}`} onClick={() => tapSlot(j)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), tapSlot(j))} />
        ))}
        <rect className="rs-tray" x={-PAD + 2} y={trayTop - 8} width={w + 2 * PAD - 4} height={tray.height + 16} rx={10} />
        {items.map((item, id) => {
          const place = places[id];
          const b = bbox(item.piece);
          const base: Pt = place !== null ? [slots[place].cx - item.piece.cx, slots[place].cy - item.piece.cy] : [tray.spots[id][0] - b.x, trayTop + tray.spots[id][1] - b.y];
          const dragging = drag?.id === id;
          const at: Pt = dragging ? [base[0] + drag.dx, base[1] + drag.dy] : base;
          const isSel = selected === id;
          return (
            <g
              key={id}
              className={`rs-piece ${place !== null ? 'is-placed' : ''} ${isSel ? 'is-selected' : ''} ${dragging ? 'is-dragging' : ''}`}
              style={{ transform: `translate(${r1(at[0])}px, ${r1(at[1])}px)` }}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-pressed={isSel}
              aria-label={place !== null ? `ნაწილი ${id + 1}, ადგილზეა` : `ნაწილი ${id + 1}${isSel ? ', არჩეულია' : ''}`}
              onClick={() => click(id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), tapItem(id))}
              onPointerDown={(e) => down(e, id)}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={() => ((start.current = null), setDrag(null))}
            >
              <path className="sh-poly" d={pathOf(item.piece.poly)} style={{ ['--fill' as string]: item.fill, ['--edge' as string]: '#1e3a8a' }} />
              {isSel && <path className="sh-ring" d={pathOf(item.piece.poly)} />}
              {isSel && (
                <g className="sh-badge" transform={`translate(${r1(item.piece.cx)} ${r1(item.piece.cy)})`} aria-hidden="true">
                  <circle r={7.6} />
                  <text y={3.4} textAnchor="middle">
                    ✓
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div className="xt-row">
        <output className="objs-count" aria-live="polite">
          ადგილზეა: <strong>{placedCount}</strong> / {real}
        </output>
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled || placedCount === 0} onClick={() => (emit(items.map(() => null)), setSelected(null), setMessage('ყველა ნაწილი ისევ ქვემოთაა.'))}>
          ↻ თავიდან
        </button>
      </div>
      <p className="xt-note" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}

const r1 = (n: number) => Math.round(n * 10) / 10;

// ─────────────────────────── dividing with dots ───────────────────────────

export interface CutBoardProps {
  shape: ShapeKind;
  parts: number;
  maxCuts: number;
  skin?: SkinId;
  /** Tapping two pieces lays one on the other. */
  compare: boolean;
  /** `verdict`: say whether the pieces are equal. `count`: only how many pieces there are. */
  tell: 'verdict' | 'count';
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  label: string;
}

export function CutBoard({ shape, parts, maxCuts, skin, compare, tell, value, onChange, disabled, label }: CutBoardProps) {
  const lines = parseLines(value);
  const dots = snapPoints(shape);
  const [first, setFirst] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const division = divisionFromLines(shape, lines);
  const spec: ShapeSpec = { shape, cuts: lines.map(([a, b]) => [dots[a][0] / SIZE[shape][0], dots[a][1] / SIZE[shape][1], dots[b][0] / SIZE[shape][0], dots[b][1] / SIZE[shape][1]]), skin, tone: 'varied' };
  const n = division.pieces.length;

  const tap = (k: number) => {
    if (disabled) return;
    if (first === null) {
      setFirst(k);
      setMessage(`წერტილი ${k + 1} არჩეულია. შეეხე მეორე წერტილს, რომ ხაზი გაივლოს.`);
      return;
    }
    if (first === k) {
      setFirst(null);
      setMessage('არჩევანი გაუქმდა.');
      return;
    }
    const line: [number, number] = first < k ? [first, k] : [k, first];
    setFirst(null);
    if (lines.some(([a, b]) => a === line[0] && b === line[1])) {
      setMessage('ეს ხაზი უკვე გავლებულია.');
      return;
    }
    if (lines.length >= maxCuts) {
      setMessage(`მაქსიმუმ ${maxCuts} ხაზის გავლება შეიძლება. გააუქმე ბოლო ხაზი ან დაიწყე თავიდან.`);
      return;
    }
    const after = divisionFromLines(shape, [...lines, line]);
    if (after.pieces.length === n) {
      setMessage('ეს ხაზი ფიგურას არ ყოფს: ის კიდეზე გადის. სცადე სხვა წერტილები.');
      return;
    }
    onChange(formatLines([...lines, line]));
    setMessage('');
  };
  const undo = () => {
    onChange(formatLines(lines.slice(0, -1)));
    setFirst(null);
    setMessage('');
  };
  const reset = () => {
    onChange('');
    setFirst(null);
    setMessage('');
  };
  const status = n === 1 ? 'ფიგურა ჯერ მთელია. აირჩიე ორი წერტილი ხაზის გასავლებად.' : tell === 'verdict' ? (hasEqualParts(division) ? `✓ ${n} ნაწილია და ისინი ტოლია.` : `✗ ${n} ნაწილია, მაგრამ ისინი ტოლი არ არის. შეადარე ნაწილები.`) : `ახლა ${n} ნაწილია.`;

  return (
    <div className="cut">
      <ComparableBoard
        spec={spec}
        merged={n === 1}
        label={`${label}. ${n === 1 ? 'მთელი ფიგურა' : `${n} ნაწილი`}`}
        compare={compare && n > 1}
        explain={tell === 'verdict'}
        lines={n > 1 ? 1 : 0}
        badges={n > 1}
        resetKey={value}
        overlay={dots.map(([x, y], k) => (
          <g
            key={k}
            className={`cd ${first === k ? 'is-first' : ''}`}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={`წერტილი ${k + 1}${first === k ? ', არჩეულია' : ''}`}
            aria-pressed={first === k}
            onClick={() => tap(k)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), tap(k))}
          >
            <circle className="cd-hit" cx={x} cy={y} r={9} />
            <circle className="cd-dot" cx={x} cy={y} r={first === k ? 5.2 : 3.6} />
          </g>
        ))}
      />
      <div className="xt-row">
        <button type="button" className="btn btn-ghost btn-small" onClick={undo} disabled={disabled || lines.length === 0}>
          ↶ ბოლო ხაზის გაუქმება
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={reset} disabled={disabled || lines.length === 0}>
          ↻ თავიდან
        </button>
        <output className="objs-count" aria-live="polite">
          ხაზები: <strong>{lines.length}</strong> / {maxCuts} · ნაწილები: <strong>{n}</strong>
        </output>
      </div>
      <p className="xt-note" role="status" aria-live="polite">
        {message || status}
      </p>
      {parts > 0 && <span className="cut-target">მიზანი: {parts} ტოლი ნაწილი</span>}
    </div>
  );
}
