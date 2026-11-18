import { useState } from 'react';
import {
  COLOUR_NAME,
  KIND_NAME,
  SIZE_NAME,
  VENN_REGION_NAME,
  cellKey,
  objectName,
  vennRegion,
  type Attr,
  type ChartSpec,
  type Clue,
  type Colour,
  type SortObj,
  type VennRegion,
} from './SortGeometry';

/**
 * Pictures for Unit 10. A group, a grid cell or a Venn region is always worked out from the object's own attributes
 * (`SortGeometry`), so a picture can never put a red triangle into the "blue" group and claim it belongs there.
 */

const COLOUR_INK: Record<Colour, { fill: string; edge: string; ink: string }> = {
  red: { fill: '#fecaca', edge: '#b91c1c', ink: '#7f1d1d' },
  blue: { fill: '#bfdbfe', edge: '#1d4ed8', ink: '#1e3a8a' },
  yellow: { fill: '#fef08a', edge: '#a16207', ink: '#713f12' },
};

/** One sortable object, drawn from its attributes. A shape is never only a colour: it is also named. */
export function SortChip({
  obj,
  size = 52,
  picked = false,
  disabled = false,
  ariaLabel,
  onClick,
}: {
  obj: SortObj;
  size?: number;
  picked?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  onClick?: () => void;
}) {
  const ink = COLOUR_INK[obj.colour];
  const w = size;
  const h = obj.size === 'large' ? size : Math.round(size * 0.72);
  const body = () => {
    switch (obj.kind) {
      case 'circle':
        return <circle cx={w / 2} cy={h / 2} r={h / 2 - 2} fill={ink.fill} stroke={ink.edge} strokeWidth={2} />;
      case 'square':
        return <rect x={2} y={2} width={w - 4} height={w - 4} rx={3} fill={ink.fill} stroke={ink.edge} strokeWidth={2} />;
      case 'rectangle':
        return <rect x={2} y={h / 2 - h / 4} width={w - 4} height={h / 2} rx={3} fill={ink.fill} stroke={ink.edge} strokeWidth={2} />;
      default:
        return <polygon points={`${w / 2},2 ${w - 2},${h - 3} 2,${h - 3}`} fill={ink.fill} stroke={ink.edge} strokeWidth={2} />;
    }
  };
  const name = objectName(obj);
  const content = (
    <svg className="sc-obj" width={w} height={obj.kind === 'square' ? w : h} viewBox={`0 0 ${w} ${obj.kind === 'square' ? w : h}`} role="img" aria-label={`${name}${picked ? ', არჩეულია' : ''}`}>
      {body()}
    </svg>
  );
  if (!onClick) return <span className="sc-obj-wrap">{content}</span>;
  return (
    <button type="button" className={`sc-obj-btn ${picked ? 'is-picked' : ''}`} disabled={disabled} aria-pressed={picked} aria-label={ariaLabel ?? `${name}, ${picked ? 'არჩეულია, შეეხე რომ მოხსნა' : 'შეეხე ასარჩევად'}`} onClick={onClick}>
      {content}
    </button>
  );
}

// ─────────────────────────── sorting into groups by one attribute ───────────────────────────

export interface SortGroup {
  value: string;
  label: string;
}

/** A label for a group value: colours, shapes and sizes have names; anything else is shown as written. */
export function valueLabel(attr: Attr, value: string): string {
  if (attr === 'colour') return COLOUR_NAME[value as Colour] ?? value;
  if (attr === 'kind') return KIND_NAME[value as never] ?? value;
  if (attr === 'size') return SIZE_NAME[value as never] ?? value;
  return value;
}

/**
 * Sort objects into the groups of one attribute. The student taps an object, then a group; every object must be
 * placed before the answer is checked, and an object goes only into the group its own attribute value names.
 */
export function SortIntoGroups({
  objects,
  attr,
  groups,
  placement,
  onChange,
  disabled = false,
  label,
}: {
  objects: SortObj[];
  attr: Attr;
  groups: string[];
  placement: string[];
  onChange: (placement: string[]) => void;
  disabled?: boolean;
  label: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const placedOf = (i: number) => placement[i] ?? '';
  const put = (value: string) => {
    if (disabled) return;
    const index = active ?? objects.findIndex((_, i) => !placedOf(i));
    if (index < 0) return;
    const next = objects.map((_, i) => (i === index ? value : placedOf(i)));
    onChange(next);
    const after = next.findIndex((v) => !v);
    setActive(after >= 0 ? after : null);
  };
  const tray = objects.map((_, i) => i).filter((i) => !placedOf(i));
  return (
    <div className="srt" role="group" aria-label={label}>
      <p className="srt-hint" role="status" aria-live="polite">
        {active === null ? 'შეეხე საგანს, მერე ჯგუფს.' : `საგანი ${active + 1} არჩეულია. შეეხე ჯგუფს.`}
      </p>
      <div className="srt-tray" aria-label="დასალაგებელი საგნები">
        {tray.length === 0 ? <span className="srt-empty">ყველა საგანი დალაგებულია</span> : tray.map((i) => (
          <SortChip
            key={objects[i].id}
            obj={objects[i]}
            picked={active === i}
            disabled={disabled}
            onClick={() => setActive(active === i ? null : i)}
          />
        ))}
      </div>
      <div className="srt-groups">
        {groups.map((value) => {
          const inside = objects.map((_, i) => i).filter((i) => placedOf(i) === value);
          return (
            <section key={value} className={`srt-group ${active !== null ? 'is-open' : ''}`} aria-label={valueLabel(attr, value)}>
              <button type="button" className="srt-group-btn" disabled={disabled || active === null} onClick={() => put(value)}>
                {valueLabel(attr, value)} <small>({inside.length})</small>
              </button>
              <div className="srt-group-items">
                {inside.length === 0 ? (
                  <span className="srt-empty">ცარიელია</span>
                ) : (
                  inside.map((i) => (
                    <button
                      key={objects[i].id}
                      type="button"
                      className="sc-obj-btn is-picked"
                      disabled={disabled}
                      aria-label={`${objectName(objects[i])}, ჯგუფშია, შეეხე რომ გამოიღო`}
                      onClick={() => onChange(objects.map((_, k) => (k === i ? '' : placedOf(k))))}
                    >
                      <SortChip obj={objects[i]} size={44} />
                    </button>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled || placement.every((p) => !p)} onClick={() => (onChange(objects.map(() => '')), setActive(0))}>
          ↻ თავიდან
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────── the two-way grid ───────────────────────────

/**
 * A two-way grid: rows are one attribute, columns the other. The cell is the pair of attributes, so "red triangles"
 * is a single cell and nothing else can land in it.
 */
export function GridBoard({
  objects,
  rowAttr,
  colAttr,
  rowValues,
  colValues,
  placement,
  onChange,
  disabled = false,
  label,
}: {
  objects: SortObj[];
  rowAttr: Attr;
  colAttr: Attr;
  rowValues: string[];
  colValues: string[];
  placement: string[];
  onChange: (placement: string[]) => void;
  disabled?: boolean;
  label: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const placedOf = (i: number) => placement[i] ?? '';
  const place = (key: string) => {
    if (disabled) return;
    const index = active ?? objects.findIndex((_, i) => !placedOf(i));
    if (index < 0) return;
    const next = objects.map((_, i) => (i === index ? key : placedOf(i)));
    onChange(next);
    const after = next.findIndex((v) => !v);
    setActive(after >= 0 ? after : null);
  };
  const tray = objects.map((_, i) => i).filter((i) => !placedOf(i));
  return (
    <div className="gd" role="group" aria-label={label}>
      <p className="gd-hint" role="status" aria-live="polite">
        {active === null ? 'შეეხე საგანს, მერე იმ უჯრას, სადაც ორივე პირობა ემთხვევა.' : `საგანი ${active + 1} არჩეულია. იპოვე უჯრა: ${valueLabel(rowAttr, '')}${''}`}
      </p>
      <div className="gd-tray" aria-label="დასალაგებელი საგნები">
        {tray.length === 0 ? <span className="gd-empty">ყველა საგანი დალაგებულია</span> : tray.map((i) => (
          <SortChip key={objects[i].id} obj={objects[i]} picked={active === i} disabled={disabled} onClick={() => setActive(active === i ? null : i)} />
        ))}
      </div>
      <div className="gd-scroll">
        <table className="gd-table">
          <thead>
            <tr>
              <th scope="col" className="gd-corner">
                {valueLabel(colAttr, '')}
              </th>
              {colValues.map((col) => (
                <th key={col} scope="col">
                  {valueLabel(colAttr, col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowValues.map((row) => (
              <tr key={row}>
                <th scope="row">{valueLabel(rowAttr, row)}</th>
                {colValues.map((col) => {
                  const key = `${row}|${col}`;
                  const inside = objects.map((_, i) => i).filter((i) => placedOf(i) === key);
                  return (
                    <td key={col} data-cell={key}>
                      <button
                        type="button"
                        className={`gd-cell ${active !== null ? 'is-open' : ''}`}
                        disabled={disabled || active === null}
                        aria-label={`უჯრა: ${valueLabel(rowAttr, row)} და ${valueLabel(colAttr, col)}, ${inside.length} საგანი`}
                        onClick={() => place(key)}
                      >
                        <span className="gd-cell-word">
                          {valueLabel(rowAttr, row)} + {valueLabel(colAttr, col)}
                        </span>
                        <span className="gd-cell-items">
                          {inside.map((i) => (
                            <SortChip key={objects[i].id} obj={objects[i]} size={38} />
                          ))}
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────── Venn diagram ───────────────────────────

/**
 * Two overlapping circles. The four regions are real places an object can be put, including the outside — objects
 * that belong to neither group still belong somewhere in the picture.
 */
export function VennBoard({
  objects,
  leftLabel,
  rightLabel,
  placement,
  onChange,
  disabled = false,
  label,
}: {
  objects: SortObj[];
  leftLabel: string;
  rightLabel: string;
  placement: string[];
  onChange: (placement: string[]) => void;
  disabled?: boolean;
  label: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const placedOf = (i: number) => placement[i] ?? '';
  const place = (region: VennRegion) => {
    if (disabled) return;
    const index = active ?? objects.findIndex((_, i) => !placedOf(i));
    if (index < 0) return;
    const next = objects.map((_, i) => (i === index ? region : placedOf(i)));
    onChange(next);
    const after = next.findIndex((v) => !v);
    setActive(after >= 0 ? after : null);
  };
  const tray = objects.map((_, i) => i).filter((i) => !placedOf(i));
  const region = (key: VennRegion) => objects.map((_, i) => i).filter((i) => placedOf(i) === key);
  const items = (key: VennRegion) => (
    <div className={`vn-items is-${key}`}>
      {region(key).map((i) => (
        <SortChip key={objects[i].id} obj={objects[i]} size={34} />
      ))}
    </div>
  );
  const zone = (key: VennRegion) => (
    <button
      type="button"
      className={`vn-zone is-${key} ${active !== null ? 'is-open' : ''}`}
      disabled={disabled || active === null}
      aria-label={`${VENN_REGION_NAME[key]}: ${region(key).length} საგანი`}
      onClick={() => place(key)}
    >
      <span className="vn-zone-word">{VENN_REGION_NAME[key]}</span>
      {items(key)}
    </button>
  );
  return (
    <div className="vn" role="group" aria-label={label}>
      <p className="vn-hint" role="status" aria-live="polite">
        {active === null ? 'შეეხე საგანს, მერე იმ ადგილს, სადაც ის ეკუთვნის.' : `საგანი ${active + 1} არჩეულია. იფიქრე: ეკუთვნის პირველ წრეს? მეორეს? ორივეს?`}
      </p>
      <div className="vn-tray" aria-label="დასალაგებელი საგნები">
        {tray.length === 0 ? <span className="vn-empty">ყველა საგანი დალაგებულია</span> : tray.map((i) => (
          <SortChip key={objects[i].id} obj={objects[i]} picked={active === i} disabled={disabled} onClick={() => setActive(active === i ? null : i)} />
        ))}
      </div>
      <div className="vn-stage">
        <svg className="vn-circles" viewBox="0 0 340 200" aria-hidden="true">
          <circle className="vn-outside" cx={170} cy={100} r={96} />
          <circle className="vn-circle is-left" cx={126} cy={100} r={70} />
          <circle className="vn-circle is-right" cx={214} cy={100} r={70} />
        </svg>
        <div className="vn-zones">
          <div className="vn-row">
            {zone('left')}
            {zone('both')}
            {zone('right')}
          </div>
          {zone('none')}
        </div>
        <div className="vn-labels" aria-hidden="true">
          <span className="vn-label is-left">{leftLabel}</span>
          <span className="vn-label is-right">{rightLabel}</span>
        </div>
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled || placement.every((p) => !p)} onClick={() => (onChange(objects.map(() => '')), setActive(0))}>
          ↻ თავიდან
        </button>
      </div>
    </div>
  );
}

/** The words for a region, for feedback. */
export const regionName = (region: VennRegion): string => VENN_REGION_NAME[region];

// ─────────────────────────── picture chart ───────────────────────────

const GLYPH: Record<string, string> = { star: '★', apple: '●', fish: '◆', ball: '●', circle: '●' };

/**
 * A picture chart: one row per category and one symbol per thing counted. `add`/`remove` let the student build the
 * chart; the number beside each row is always the number of symbols actually in it.
 */
export function PictureChart({
  chart,
  onAdd,
  onRemove,
  disabled = false,
  label,
  showCounts = true,
}: {
  chart: ChartSpec;
  onAdd?: (label: string) => void;
  onRemove?: (label: string) => void;
  disabled?: boolean;
  label: string;
  showCounts?: boolean;
}) {
  const max = Math.max(1, ...chart.rows.map((r) => r.count));
  return (
    <div className="pc" role="group" aria-label={label}>
      {chart.rows.map((row) => (
        <div key={row.label} className="pc-row">
          <span className="pc-label">{row.label}</span>
          <span className="pc-symbols" aria-label={`${row.count} საგანი`}>
            {Array.from({ length: row.count }, (_, i) => (
              <span key={i} className="pc-sym" aria-hidden="true">
                {GLYPH[chart.glyph] ?? '●'}
              </span>
            ))}
            {row.count === 0 && <span className="pc-none">ცარიელია</span>}
          </span>
          {showCounts && <span className="pc-count">{row.count}</span>}
          <span className="pc-bar" aria-hidden="true">
            <i style={{ width: `${Math.round((row.count / max) * 100)}%` }} />
          </span>
          {onAdd && onRemove && (
            <span className="pc-btns">
              <button type="button" className="btn btn-ghost btn-small" disabled={disabled} aria-label={`${row.label}: დაამატე ერთი`} onClick={() => onAdd(row.label)}>
                + 1
              </button>
              <button type="button" className="btn btn-ghost btn-small" disabled={disabled || row.count === 0} aria-label={`${row.label}: წაიღე ერთი`} onClick={() => onRemove(row.label)}>
                − 1
              </button>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/** One row of a chart, as data, from the student's own taps. */
export const chartRows = (labels: string[], counts: number[]): ChartSpec['rows'] => labels.map((label, i) => ({ label, count: counts[i] ?? 0 }));

// ─────────────────────────── clue puzzles ───────────────────────────

/**
 * Pick every object that satisfies all the clues. The clues are shown as words *and* symbols, and each object is
 * named, so the decision never rests on colour alone.
 */
export function ClueBoard({
  objects,
  clues,
  picked,
  onChange,
  disabled = false,
  label,
}: {
  objects: SortObj[];
  clues: Clue[];
  picked: string[];
  onChange: (picked: string[]) => void;
  disabled?: boolean;
  label: string;
}) {
  const toggle = (id: string) => {
    if (disabled) return;
    onChange(picked.includes(id) ? picked.filter((p) => p !== id) : [...picked, id]);
  };
  const clueWord = (clue: Clue): string => {
    const name = clue.attr === 'colour' ? COLOUR_NAME[clue.value as Colour] : clue.attr === 'kind' ? KIND_NAME[clue.value as never] : SIZE_NAME[clue.value as never];
    return `${clue.attr === 'colour' ? 'ფერი' : clue.attr === 'kind' ? 'ფორმა' : 'ზომა'} ${clue.negate ? 'არ არის' : 'არის'} ${name}`;
  };
  return (
    <div className="clue" role="group" aria-label={label}>
      <ul className="clue-list">
        {clues.map((clue, i) => (
          <li key={i}>
            <span aria-hidden="true">{clue.negate ? '✗' : '✓'} </span>
            {clueWord(clue)}
          </li>
        ))}
      </ul>
      <div className="clue-grid">
        {objects.map((obj) => {
          const on = picked.includes(obj.id);
          return (
            <button
              key={obj.id}
              type="button"
              className={`clue-item ${on ? 'is-picked' : ''}`}
              aria-pressed={on}
              disabled={disabled}
              aria-label={`${objectName(obj)}${on ? ', არჩეულია' : ''}`}
              onClick={() => toggle(obj.id)}
            >
              <SortChip obj={obj} size={54} />
              <span className="clue-name">
                {on && <span aria-hidden="true">✓ </span>}
                {objectName(obj)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The cell an object really belongs in, said in words — for an explanation, never for the answer. */
export const cellWord = (obj: SortObj, rowAttr: Attr, colAttr: Attr): string => `${valueLabel(rowAttr, obj[rowAttr])} + ${valueLabel(colAttr, obj[colAttr])}`;

/** Re-exported so a tool can read a cell key without importing the geometry twice. */
export { cellKey, vennRegion };
