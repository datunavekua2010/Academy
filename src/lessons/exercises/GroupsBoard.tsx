import { useState } from 'react';
import type { Verdict } from '../types';
import {
  allEqual,
  arrayByCols,
  arrayByRows,
  arrayTotal,
  groupsText,
  multiplyText,
  repeatedText,
  rowCells,
  totalOf,
  turnArray,
  type ArraySpec,
} from './GroupsGeometry';

/**
 * Pictures for G2 U04 (equal groups, repeated addition, arrays).
 *
 * Everything is drawn from the two counts (`groups`, `each`), so the picture, the repeated addition and the
 * multiplication expression are the same number written three ways. Nothing is judged by how a group looks.
 */

// ─────────────────────────── equal groups ───────────────────────────

/** A group of `count` counters, drawn as a box with its number in it. */
export function GroupBox({ count, index, tone = 'plain', label }: { count: number; index?: number; tone?: 'plain' | 'same' | 'odd'; label?: string }) {
  return (
    <div className={`gbox is-${tone}`} aria-label={label ?? `ჯგუფი ${(index ?? 0) + 1}: ${count} საგანი`}>
      <div className="gbox-dots" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <b className="gbox-count">{count}</b>
    </div>
  );
}

/** Several groups side by side, each labelled with its count, and — when they are equal — the totals said in words. */
export function EqualGroups({ groups, each, caption }: { groups: number; each: number; caption?: string }) {
  const equal = allEqual(Array.from({ length: groups }, () => each));
  return (
    <figure className="grp" aria-label={groupsText(groups, each)}>
      <div className="grp-row">
        {Array.from({ length: groups }, (_, i) => (
          <GroupBox key={i} count={each} index={i} tone={equal ? 'same' : 'plain'} />
        ))}
      </div>
      <figcaption className="grp-note">
        {repeatedText(groups, each)} · {multiplyText(groups, each)}
      </figcaption>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** Groups that are deliberately NOT all equal, so the student can see what "equal" excludes. */
export function UnevenGroups({ sizes, caption }: { sizes: number[]; caption?: string }) {
  const equal = allEqual(sizes);
  return (
    <figure className="grp" aria-label={`ჯგუფები: ${sizes.join(', ')}`}>
      <div className="grp-row">
        {sizes.map((n, i) => (
          <GroupBox key={i} count={n} index={i} tone={equal ? 'same' : 'odd'} />
        ))}
      </div>
      <figcaption className="grp-note">{equal ? 'ყველა ჯგუფი ერთნაირია.' : 'ჯგუფები ერთნაირი არ არის: რაოდენობები განსხვავდება.'}</figcaption>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

// ─────────────────────────── arrays ───────────────────────────

/** An array of counters, `rows` rows of `cols`, with the rows and columns counted in words. */
export function ArrayBoard({ spec, caption, showCounts = true }: { spec: ArraySpec; caption?: string; showCounts?: boolean }) {
  const cells = rowCells(spec);
  return (
    <figure className="arr" aria-label={`მართკუთხედი: ${spec.rows} რიგი, თითოეულში ${spec.cols} საგანი, სულ ${arrayTotal(spec)}`}>
      <div className="arr-grid" style={{ gridTemplateColumns: `repeat(${spec.cols}, minmax(0, 1fr))` }} aria-hidden="true">
        {cells.flat().map((n) => (
          <i key={n} className="arr-dot" />
        ))}
      </div>
      {showCounts && (
        <figcaption className="arr-note">
          {spec.rows} რიგი × {spec.cols} = {arrayTotal(spec)} · {arrayByRows(spec)}
        </figcaption>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** The array and the same array turned: same objects, different shape. */
export function ArrayTurn({ spec, caption }: { spec: ArraySpec; caption?: string }) {
  const turned = turnArray(spec);
  return (
    <div className="arr-turn">
      <ArrayBoard spec={spec} caption={`${spec.rows} რიგი, ${spec.cols} სვეტი`} />
      <span className="arr-turn-arrow" aria-hidden="true">
        ⟳
      </span>
      <ArrayBoard spec={turned} caption={`${turned.rows} რიგი, ${turned.cols} სვეტი`} />
      <p className="arr-note arr-same">
        სულ იგივეა: {arrayTotal(spec)} = {arrayTotal(turned)} · {arrayByRows(spec)} = {arrayByCols(spec)}
      </p>
      {caption && <p className="arr-note">{caption}</p>}
    </div>
  );
}

// ─────────────────────────── answer controls ───────────────────────────

interface EqualProps {
  response: { groups: number; each: number; glyph?: 'star' | 'apple' | 'fish' | 'ball' | 'counter'; ask?: 'total' | 'equal' };
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}

/**
 * Make the groups equal: the student adds or removes a counter from a group, and the board says when every group holds
 * the same number. Stored as the counts of each group, so "equal" is decided by the numbers.
 */
export function MakeEqualAnswer({ response, value, onChange, disabled, label }: EqualProps) {
  const start = value === '' ? response.groups * response.each : null;
  const sizes = value === '' || !value.includes(',') ? null : value.split(',').map((n) => Number(n) || 0);
  void start;
  const shown = sizes ?? Array.from({ length: response.groups }, (_, i) => (i === 0 ? response.each : 0));
  const equal = allEqual(shown);
  const bump = (i: number, by: number) => {
    if (disabled) return;
    const next = shown.map((n, k) => (k === i ? Math.max(0, Math.min(response.each + 4, n + by)) : n));
    onChange(next.join(','));
  };
  return (
    <div className="gme">
      <div className="grp-row" role="group" aria-label={label}>
        {shown.map((count, i) => (
          <div key={i} className={`gbox ${allEqual([count, ...shown.filter((_, k) => k !== i)]) ? 'is-same' : 'is-odd'}`}>
            <div className="gbox-dots" aria-hidden="true">
              {Array.from({ length: count }, (_, k) => (
                <i key={k} />
              ))}
            </div>
            <div className="gbox-acts">
              <button type="button" className="btn btn-ghost btn-small" disabled={disabled || count === 0} onClick={() => bump(i, -1)} aria-label={`${i + 1}-ე ჯგუფიდან წაიღე ერთი`}>
                −
              </button>
              <b className="gbox-count">{count}</b>
              <button type="button" className="btn btn-ghost btn-small" disabled={disabled} onClick={() => bump(i, 1)} aria-label={`${i + 1}-ე ჯგუფს დაამატე ერთი`}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <output className="grp-note" aria-live="polite">
        {equal ? `✓ ყველა ჯგუფში ${shown[0]} საგანია — ჯგუფები ტოლია. სულ ${shown.reduce((n, s) => n + s, 0)}.` : 'ჯგუფები ჯერ არ არის ტოლი: შეადარე რაოდენობები.'}
      </output>
    </div>
  );
}

interface ArrayAnswerProps {
  response: { rows: number; cols: number; ask?: 'total' | 'multiply' };
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}

/**
 * Read an array: say how many objects there are, and which multiplication it shows. Stored as `"rows,cols,total"`.
 */
export function ArrayReadAnswer({ response, value, onChange, disabled, verdict, label }: ArrayAnswerProps) {
  const [r = '', c = ''] = value.split(',');
  const write = (which: 'rows' | 'cols', text: string) => {
    const clean = text.replace(/[^\d]/g, '');
    onChange(which === 'rows' ? `${clean},${c}` : `${r},${clean}`);
  };
  const rows = Number(r) || 0;
  const cols = Number(c) || 0;
  const total = rows * cols;
  return (
    <div className={`gar ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <ArrayBoard spec={{ rows: response.rows, cols: response.cols }} showCounts={false} />
      <div className="gar-inputs" role="group" aria-label={label}>
        <label className="gar-slot">
          <span>რიგები</span>
          <input type="text" inputMode="numeric" value={r} disabled={disabled} onChange={(e) => write('rows', e.target.value)} aria-label="რიგების რაოდენობა" />
        </label>
        <span className="gar-times" aria-hidden="true">
          ×
        </span>
        <label className="gar-slot">
          <span>თითო რიგში</span>
          <input type="text" inputMode="numeric" value={c} disabled={disabled} onChange={(e) => write('cols', e.target.value)} aria-label="თითო რიგში საგნების რაოდენობა" />
        </label>
        <span className="gar-times" aria-hidden="true">
          =
        </span>
        <output className="gar-total" aria-live="polite">
          {total > 0 ? total : '?'}
        </output>
      </div>
      <p className="arr-note">
        {rows > 0 && cols > 0
          ? `${rows} × ${cols} = ${total}. ${total === arrayTotal({ rows: response.rows, cols: response.cols }) ? 'ეს ემთხვევა მართკუთხედს.' : 'შეამოწმე რიგები და სვეტები.'}`
          : 'დათვალე რიგები და თითოეულ რიგში საგნები.'}
      </p>
    </div>
  );
}

/**
 * Build an array of a given total: the student chooses rows and columns, and the board says whether it holds exactly the
 * target — an arrangement of the same total is right however it is shaped.
 */
export function ArrayBuildAnswer({
  response,
  value,
  onChange,
  disabled,
  verdict,
  label,
}: {
  response: { total: number; ask?: 'any' };
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}) {
  const [rows = '', cols = ''] = value.split(',');
  const r = Math.max(1, Math.min(response.total, Number(rows) || 1));
  const c = Math.max(1, Math.min(response.total, Number(cols) || 1));
  const total = r * c;
  const onChangeSpec = (spec: ArraySpec) => onChange(`${spec.rows},${spec.cols}`);
  return (
    <div className={`gab ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <p className="gab-target">
        დაალაგე <strong>{response.total}</strong> საგანი მართკუთხედად: აირჩიე რიგები და სვეტები.
      </p>
      <ArrayBoard spec={{ rows: r, cols: c }} showCounts={false} />
      <div className="gab-sliders">
        {(['rows', 'cols'] as const).map((which) => (
          <label key={which} className="gab-slider">
            <span>{which === 'rows' ? 'რიგები' : 'სვეტები'}</span>
            <input
              type="range"
              min={1}
              max={Math.max(1, response.total)}
              value={which === 'rows' ? r : c}
              disabled={disabled}
              onChange={(e) => onChangeSpec(which === 'rows' ? { rows: Number(e.target.value), cols: c } : { rows: r, cols: Number(e.target.value) })}
              aria-label={which === 'rows' ? 'რიგების რაოდენობა' : 'სვეტების რაოდენობა'}
            />
            <b>{which === 'rows' ? r : c}</b>
          </label>
        ))}
      </div>
      <output className="arr-note" aria-live="polite">
        {`${r} × ${c} = ${total}`}
        {total === response.total ? ` ✓ ეს არის ${response.total}.` : total < response.total ? ` — კიდევ ${response.total - total} საგანი გვჭირდება.` : ` — ${total - response.total} ზედმეტია.`}
      </output>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * A groups story answered as a multiplication plus a total: the student writes `groups × each` and the answer.
 * Stored as `"groups,each,total"`.
 */
export function GroupStoryAnswer({
  response,
  value,
  onChange,
  disabled,
  label,
}: {
  response: { groups: number; each: number; text: string; unit: string; what: string };
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  label: string;
}) {
  const [g = '', e = '', t = ''] = value.split(',');
  const write = (which: 'groups' | 'each' | 'total', text: string) => {
    const clean = text.replace(/[^\d]/g, '');
    onChange(which === 'groups' ? `${clean},${e},${t}` : which === 'each' ? `${g},${clean},${t}` : `${g},${e},${clean}`);
  };
  return (
    <div className="gsa">
      <blockquote className="stb-story">{response.text}</blockquote>
      <EqualGroups groups={response.groups} each={response.each} />
      <div className="gar-inputs" role="group" aria-label={label}>
        <label className="gar-slot">
          <span>ჯგუფები</span>
          <input type="text" inputMode="numeric" value={g} disabled={disabled} onChange={(ev) => write('groups', ev.target.value)} aria-label="ჯგუფების რაოდენობა" />
        </label>
        <span className="gar-times" aria-hidden="true">
          ×
        </span>
        <label className="gar-slot">
          <span>თითოეულში</span>
          <input type="text" inputMode="numeric" value={e} disabled={disabled} onChange={(ev) => write('each', ev.target.value)} aria-label="თითოეულ ჯგუფში საგნების რაოდენობა" />
        </label>
        <span className="gar-times" aria-hidden="true">
          =
        </span>
        <label className="gar-slot">
          <span>სულ ({response.unit})</span>
          <input type="text" inputMode="numeric" value={t} disabled={disabled} onChange={(ev) => write('total', ev.target.value)} aria-label="სულ რაოდენობა" />
        </label>
      </div>
      <p className="arr-note">
        {g !== '' && e !== '' ? `${Number(g)} × ${Number(e)} = ${(Number(g) || 0) * (Number(e) || 0)}` : `დათვალე ჯგუფები და თითოეულში საგნები. ${response.what}-ზეა საუბარი.`}
      </p>
    </div>
  );
}

/** A picture of equal groups for a question, without any answer control. */
export function GroupsPicture({ groups, each }: { groups: number; each: number }) {
  return <EqualGroups groups={groups} each={each} />;
}

/** A picture of an array for a question. */
export function ArrayPicture({ rows, cols }: { rows: number; cols: number }) {
  return <ArrayBoard spec={{ rows, cols }} />;
}

/** The repeated addition of an array, for a static picture. */
export function RepeatedLine({ groups, each }: { groups: number; each: number }) {
  const terms = Array.from({ length: groups }, () => each);
  return (
    <p className="rep-line" aria-label={`განმეორებითი შეკრება: ${terms.join(' + ')} = ${totalOf(groups, each)}`}>
      {terms.map((t, i) => (
        <span key={i} className="rep-term">
          {t}
          {i < terms.length - 1 ? ' + ' : ''}
        </span>
      ))}
      <span className="rep-total"> = {totalOf(groups, each)}</span>
      <span className="rep-mult"> · {multiplyText(groups, each)}</span>
    </p>
  );
}

/** A toggle between "is this equal?" states, used by the equal-groups lab. */
export function EqualBadge({ sizes }: { sizes: number[] }) {
  const equal = allEqual(sizes);
  return (
    <span className={`eq-badge ${equal ? 'is-equal' : 'is-odd'}`} role="status">
      {equal ? '✓ ტოლი ჯგუფები' : '≠ არათანაბარი ჯგუფები'}
    </span>
  );
}

/** Small state hook shared by the labs: the array the student is currently building. */
export function useArrayState(start: ArraySpec): [ArraySpec, (next: ArraySpec) => void] {
  const [spec, setSpec] = useState(start);
  return [spec, setSpec];
}
