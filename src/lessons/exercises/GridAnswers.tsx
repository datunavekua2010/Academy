import type { ResponseSpec } from '../types';
import { itemAt, itemText, SHAPE_GLYPH, cellKey, holes, routeText, gridText } from './GridGeometry';
import { PatternItemView, PatternRow } from './GridBoard';

type GridResponse = Extract<ResponseSpec, { type: 'pattern-next' | 'pattern-fix' | 'pattern-fill' | 'grid-route' | 'grid-end' | 'grid-fill' | 'clue-select' | 'clue-pick2' }>;

type Props = { response: GridResponse; value: string; onChange: (value: string) => void; disabled: boolean; label: string };

/** Accessible selection controls; the checker, not these controls, judges the response. */
export function GridAnswer({ response, value, onChange, disabled, label }: Props) {
  switch (response.type) {
    case 'pattern-next':
      return <div role="group" aria-label={label}>
        <PatternRow pattern={response.pattern} length={response.shown} />
        <div className="lp-choices">{response.options.map((item, i) => <label className="lp-choice" key={i}>
          <input type="radio" name={label} checked={value === String(i)} disabled={disabled} onChange={() => onChange(String(i))} />
          <PatternItemView item={item} />
        </label>)}</div>
      </div>;
    case 'pattern-fix':
      return <div role="radiogroup" aria-label={label} className="lp-choices">{response.items.map((item, i) => <label className="lp-choice" key={i}>
        <input type="radio" name={label} checked={value === String(i + 1)} disabled={disabled} onChange={() => onChange(String(i + 1))} />
        <span>{i + 1}.</span> <PatternItemView item={item} />
      </label>)}</div>;
    case 'pattern-fill': {
      // Hole positions in the response are zero-based, matching itemAt and the checker.
      const selected = value.split(',');
      return <div role="group" aria-label={label}>
        <ol className="gp-row">{Array.from({ length: response.length }, (_, i) => {
          const slot = response.holes.indexOf(i);
          return <li className="gp-slot" key={i}><span>{i + 1}</span>{slot < 0 ? <PatternItemView item={itemAt(response.pattern, i)} /> :
            <select aria-label={`${i + 1}-ე ადგილი`} disabled={disabled} value={selected[slot] ?? ''} onChange={(e) => {
              const next = response.holes.map((_, n) => selected[n] ?? ''); next[slot] = e.target.value; onChange(next.join(','));
            }}><option value="">აირჩიე</option>{response.options.map((item, n) => <option key={n} value={n}>{itemText(item)}</option>)}</select>}
          </li>;
        })}</ol>
      </div>;
    }
    case 'grid-route':
    case 'grid-end': {
      const pairs = value ? value.split(',') : [];
      const visited: string[] = [];
      for (let i = 0; i + 1 < pairs.length; i += 2) visited.push(`${pairs[i]},${pairs[i + 1]}`);
      return <div role="group" aria-label={label}>
        <p>საწყისი: {cellKey(response.start)}. {routeText(response.moves)}</p>
        {response.type === 'grid-route' && <p>მონიშნე გავლილი უჯრები თანმიმდევრობით, საწყისი უჯრის ჩათვლით.</p>}
        <table className="gp-grid"><tbody>{Array.from({ length: response.rows }, (_, r) => <tr key={r}>{Array.from({ length: response.cols }, (_, c) => {
          const key = `${r + 1},${c + 1}`; const selected = visited.includes(key);
          return <td key={c}><button type="button" disabled={disabled} aria-label={`მწკრივი ${r + 1}, სვეტი ${c + 1}`} aria-pressed={selected} onClick={() => onChange(response.type === 'grid-end' ? key : [...visited, key].join(','))}>{selected ? '✓' : key === cellKey(response.start) ? '●' : '·'}</button></td>;
        })}</tr>)}</tbody></table>
        {response.type === 'grid-route' && <button type="button" disabled={disabled} onClick={() => onChange('')}>თავიდან</button>}
      </div>;
    }
    case 'grid-fill': {
      const empty = holes(response.grid);
      const values = Object.fromEntries(value.split(';').filter(Boolean).map((pair) => pair.split('=')));
      return <div role="group" aria-label={label}>
        <p>ყოველ მწკრივსა და სვეტში თითოეული ფიგურა ერთხელ უნდა იყოს.</p>
        <p>{gridText(response.grid).join(' / ')}</p>
        {empty.map((cell) => {
          const key = cellKey(cell);
          return <label key={key}>მწკრივი {cell.row}, სვეტი {cell.col}: <select disabled={disabled} value={values[key] ?? ''} onChange={(e) => {
            const next = { ...values, [key]: e.target.value }; onChange(empty.map(cellKey).filter((k) => next[k] !== undefined && next[k] !== '').map((k) => `${k}=${next[k]}`).join(';'));
          }}><option value="">აირჩიე</option>{response.options.map((item, i) => <option key={i} value={i}>{SHAPE_GLYPH[item.shape] ?? ''} {itemText(item)}</option>)}</select></label>;
        })}
      </div>;
    }
    case 'clue-select': {
      const selected = value.split(',').filter(Boolean);
      return <div role="group" aria-label={label}><ul>{response.clues.map((clue, i) => <li key={i}>{clue.attr}: {clue.negate ? 'არა ' : ''}{clue.value}</li>)}</ul>
        {response.candidates.map((candidate) => <label key={candidate.id}><input type="checkbox" disabled={disabled} checked={selected.includes(candidate.id)} onChange={() => onChange((selected.includes(candidate.id) ? selected.filter((id) => id !== candidate.id) : [...selected, candidate.id]).join(','))} /> {candidate.label}</label>)}
      </div>;
    }
    case 'clue-pick2':
      return <div role="radiogroup" aria-label={label}><p>{response.candidates.find((c) => c.id === response.candidate)?.label}</p>{response.clues.map((clue, i) => <label key={i}><input type="radio" name={label} checked={value === String(i)} disabled={disabled} onChange={() => onChange(String(i))} /> {clue.attr}: {clue.negate ? 'არა ' : ''}{clue.value}</label>)}</div>;
  }
}
