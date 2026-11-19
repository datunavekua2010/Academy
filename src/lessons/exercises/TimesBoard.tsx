import type { Glyph, Verdict } from '../types';
import { GLYPH_NAME, GlyphIcon } from './Objects';
import {
  cellKey,
  cellsFor,
  factText,
  maxProduct,
  onesDigit,
  onesRule,
  productOf,
  repeatText,
  skipText,
  tableRow,
} from './TimesGeometry';

/**
 * Pictures and answer controls for G2 U05 (the 2, 3, 4, 5 and 10 times tables).
 *
 * Every row, grid and dot field below is drawn from `(table, factor)`, and every product comes from the engine, so the
 * picture, the repeated addition and the multiplication are the same number written three ways. A claim about a pattern
 * (the ones digits of fives, the doubles inside the fours) is text, and it is true because of the arithmetic.
 */

const namer = (glyph: Glyph) => GLYPH_NAME[glyph];

// ─────────────────────────── a group of objects ───────────────────────────

/** One group of `count` objects with its number under it. */
export function DotGroup({ count, index, glyph = 'star', label }: { count: number; index?: number; glyph?: Glyph; label?: string }) {
  return (
    <div className="tgrp" aria-label={label ?? `ჯგუფი ${(index ?? 0) + 1}: ${count} ${namer(glyph)}`}>
      <div className="tgrp-dots" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className="tgrp-dot">
            <GlyphIcon glyph={glyph} />
          </span>
        ))}
      </div>
      <b className="tgrp-count">{count}</b>
    </div>
  );
}

/** `factor` groups of `table`, with the multiplication and the repeated addition underneath. */
export function TimesGroups({ table, factor, glyph = 'star', caption, showFacts = true }: { table: number; factor: number; glyph?: Glyph; caption?: string; showFacts?: boolean }) {
  return (
    <figure className="tgrps" aria-label={`${factor} ჯგუფი, თითოეულში ${table}`}>
      <div className="tgrps-row">
        {Array.from({ length: Math.max(1, factor) }, (_, i) => (
          <DotGroup key={i} count={table} index={i} glyph={glyph} />
        ))}
      </div>
      {showFacts && (
        <figcaption className="tgrps-note">
          {factText(table, factor)} · {repeatText(table, factor)}
        </figcaption>
      )}
      {caption && <figcaption className="tgrps-cap">{caption}</figcaption>}
    </figure>
  );
}

// ─────────────────────────── the table row ───────────────────────────

/** A row of the times table: one cell per fact, filled up to `filled` (counting from `1 × table`). */
export function TableRow({ table, upTo, filled = upTo, caption }: { table: number; upTo: number; filled?: number; caption?: string }) {
  const products = tableRow(table, upTo);
  return (
    <figure className="trow" aria-label={`${table}-ის ცხრილი: ${skipText(table, upTo)}`}>
      <div className="trow-cells">
        {products.map((p, i) => (
          <div key={i} className={`trow-cell ${i < filled ? 'is-on' : ''}`}>
            <span className="trow-fact">
              {i + 1} × {table}
            </span>
            <b className="trow-product">{i < filled ? p : '?'}</b>
          </div>
        ))}
      </div>
      <figcaption className="trow-skip">{skipText(table, filled)}</figcaption>
      <figcaption className="trow-rule">{onesRule(table)}</figcaption>
      {caption && <figcaption className="trow-cap">{caption}</figcaption>}
    </figure>
  );
}

// ─────────────────────────── the grid ───────────────────────────

/** A grid of products: `tables` down the side, `factors` across. Highlighted cells are picked out by a tick. */
export function TimesGrid({
  tables,
  factors,
  highlight = [],
  label,
  onCell,
  disabled = false,
  chosen = [],
}: {
  tables: number[];
  factors: number[];
  highlight?: Array<{ table: number; factor: number }>;
  label?: string;
  onCell?: (table: number, factor: number) => void;
  disabled?: boolean;
  chosen?: string[];
}) {
  const marked = new Set(highlight.map((h) => cellKey(h.table, h.factor)));
  const picked = new Set(chosen);
  return (
    <table className="tgrid" aria-label={label ?? 'გამრავლების ცხრილი'}>
      <thead>
        <tr>
          <th scope="col">×</th>
          {factors.map((f) => (
            <th key={f} scope="col">
              {f}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tables.map((t) => (
          <tr key={t}>
            <th scope="row">{t}</th>
            {factors.map((f) => {
              const key = cellKey(t, f);
              const on = marked.has(key);
              const isPicked = picked.has(key);
              const cls = `tgrid-cell ${on ? 'is-hi' : ''} ${isPicked ? 'is-picked' : ''}`.trim();
              return (
                <td key={f}>
                  {onCell ? (
                    <button type="button" className={cls} disabled={disabled} aria-pressed={isPicked} aria-label={`${t} × ${f} = ${productOf(t, f)}`} onClick={() => onCell(t, f)}>
                      {productOf(t, f)}
                      {on && <span className="tgrid-tick" aria-hidden="true">✓</span>}
                    </button>
                  ) : (
                    <span className={cls} aria-label={`${t} × ${f} = ${productOf(t, f)}`}>
                      {productOf(t, f)}
                      {on && <span className="tgrid-tick" aria-hidden="true">✓</span>}
                    </span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** The read-product grid: the student types the product of a named cell. */
export function TimesGridRead({ table, factor, value, onChange, disabled, verdict, label }: { table: number; factor: number; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  return (
    <div className={`tgr ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <p className="tgr-ask">
        წაიკითხე უჯრა: <strong>{table}</strong> × <strong>{factor}</strong> = ?
      </p>
      <label className="tgr-slot">
        <span>ნამრავლი</span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))}
          aria-label="ნამრავლი"
        />
      </label>
      <span className="sr-only">{label}</span>
      <output className="tgr-note" aria-live="polite">
        {value === '' ? 'იპოვე ეს უჯრა ცხრილში და დათვალე.' : Number(value) === productOf(table, factor) ? `✓ ${factText(table, factor)}` : `ჯერ არა: ${repeatText(table, factor)}.`}
      </output>
    </div>
  );
}

// ─────────────────────────── answer controls ───────────────────────────

/** A fact answered as its two factors: the product is computed, so order never matters. Stored as `"table,factor"`. */
export function TimesFactAnswer({
  response,
  value,
  onChange,
  disabled,
  verdict,
  label,
}: {
  response: { table: number; factor: number; max?: number };
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}) {
  const [a = '', b = ''] = value.split(',');
  const write = (which: 'a' | 'b', text: string) => {
    const clean = text.replace(/[^\d]/g, '');
    onChange(which === 'a' ? `${clean},${b}` : `${a},${clean}`);
  };
  const product = Number(a) * Number(b);
  return (
    <div className={`tfa ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <TimesGroups table={response.table} factor={response.factor} showFacts={false} caption={`${response.factor} ჯგუფი, თითოეულში ${response.table}.`} />
      <div className="tfa-inputs" role="group" aria-label={label}>
        <label className="tfa-slot">
          <span>პირველი</span>
          <input type="text" inputMode="numeric" value={a} disabled={disabled} onChange={(e) => write('a', e.target.value)} aria-label="პირველი რიცხვი" />
        </label>
        <span className="tfa-sign" aria-hidden="true">×</span>
        <label className="tfa-slot">
          <span>მეორე</span>
          <input type="text" inputMode="numeric" value={b} disabled={disabled} onChange={(e) => write('b', e.target.value)} aria-label="მეორე რიცხვი" />
        </label>
        <span className="tfa-sign" aria-hidden="true">=</span>
        <output className="tfa-product" aria-live="polite">
          {a !== '' && b !== '' ? product : '?'}
        </output>
      </div>
      <p className="tfa-note">
        {a !== '' && b !== '' ? `${a} × ${b} = ${product}. ${product === productOf(response.table, response.factor) ? 'ეს არის სწორი ნამრავლი.' : `საჭიროა ${productOf(response.table, response.factor)}.`}` : 'ორივე რიცხვი ჩაწერე — ნამრავლი თვითონ გამოითვლება.'}
      </p>
    </div>
  );
}

/** A missing number in a multiplication sentence. Stored as the number written. */
export function TimesMissingAnswer({
  response,
  value,
  onChange,
  disabled,
  verdict,
  label,
}: {
  response: { table: number; factor: number; missing: 'factor' | 'product'; max?: number };
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}) {
  const missingProduct = response.missing === 'product';
  const blank = missingProduct ? '?' : '▢';
  return (
    <div className={`tm ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <div className="tm-sentence" aria-label={label}>
        <span className="tm-side">{response.factor} × {response.table}</span>
        <span className="tm-sign">=</span>
        {missingProduct ? (
          <label className="tm-slot">
            <span>ნამრავლი</span>
            <input type="text" inputMode="numeric" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))} aria-label="გამოტოვებული რიცხვი" placeholder={blank} />
          </label>
        ) : (
          <span className="tm-blank" aria-label={`გამოტოვებულია ერთი თანამამრავლი: ${blank}`}>
            {blank}
          </span>
        )}
      </div>
      {!missingProduct && (
        <label className="tm-slot">
          <span>გამოტოვებული რიცხვი</span>
          <input type="text" inputMode="numeric" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))} aria-label="გამოტოვებული რიცხვი" />
        </label>
      )}
      <TimesGroups table={response.table} factor={response.factor} showFacts={false} />
      <p className="tm-note">
        {missingProduct
          ? `${response.factor} ჯგუფი, თითოეულში ${response.table}: დათვალე სულ.`
          : `${productOf(response.table, response.factor)} საგანი ${response.table}-ად დაჯგუფებულია — რამდენი ჯგუფია?`}
      </p>
    </div>
  );
}

/** Fill a table row fact by fact; each filled fact turns green. Stored as the products written, in order. */
export function TableBuildAnswer({
  response,
  value,
  onChange,
  disabled,
  verdict,
  label,
}: {
  response: { table: number; upTo: number };
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}) {
  const cells = value === '' ? [] : value.split(',');
  const facts = Array.from({ length: response.upTo }, (_, i) => i + 1);
  const filled = cells.filter((c) => c !== '').length;
  return (
    <div className={`tba ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <p className="tba-ask">
        შეავსე {response.table}-ის ცხრილი: ყოველ ნაბიჯზე {response.table} ემატება.
      </p>
      <ol className="tba-cells" aria-label={label}>
        {facts.map((f, i) => (
          <li key={f} className={`tba-cell ${i < filled ? 'is-done' : i === filled ? 'is-next' : ''}`}>
            <span className="tba-fact">
              {f} × {response.table}
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={cells[i] ?? ''}
              disabled={disabled}
              onChange={(e) => {
                const next = facts.map((_, k) => cells[k] ?? '');
                next[i] = e.target.value.replace(/[^\d]/g, '');
                onChange(next.join(','));
              }}
              aria-label={`${f} × ${response.table}`}
            />
          </li>
        ))}
      </ol>
      <p className="tba-note">
        {filled === 0 ? `დაიწყე ${1} × ${response.table}-ით.` : `შევსებულია ${filled} / ${response.upTo}. ბოლო ნამრავლი: ${cells[filled - 1] || '?'}.`}
      </p>
    </div>
  );
}

/** Tap the cells of a grid whose product is the target. Stored as comma-separated cell keys. */
export function TableGridAnswer({
  response,
  value,
  onChange,
  disabled,
  verdict,
  label,
}: {
  response: { tables: number[]; factors: number[]; ask: 'find-target' | 'read-product'; target: number | { table: number; factor: number } };
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}) {
  const target = typeof response.target === 'object' ? response.target.table * response.target.factor : response.target;
  // the picker stores a list of `"table,factor"` keys, so the counts below are read in pairs
  const flat = value === '' ? [] : value.split(',');
  const chosen: string[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) chosen.push(`${flat[i]},${flat[i + 1]}`);
  if (response.ask === 'read-product') {
    const cell = typeof response.target === 'object' ? response.target : { table: response.tables[0], factor: response.factors[0] };
    return <TimesGridRead table={cell.table} factor={cell.factor} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
  }
  const wanted = cellsFor(target, response.tables, response.factors);
  return (
    <div className={`tga ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <p className="tga-ask">
        მონიშნე ყველა უჯრა, სადაც ნამრავლია <strong>{target}</strong>. იპოვე {wanted.length}.
      </p>
      <TimesGrid
        tables={response.tables}
        factors={response.factors}
        chosen={chosen}
        disabled={disabled}
        label={label}
        onCell={(table, factor) => {
          const key = cellKey(table, factor);
          onChange(chosen.includes(key) ? chosen.filter((k) => k !== key).join(',') : [...chosen, key].join(','));
        }}
      />
      <output className="tga-note" aria-live="polite">
        {chosen.length === 0 ? 'ჯერ არცერთი უჯრა არ არის მონიშნული.' : `მონიშნულია ${chosen.length}. სულ საჭიროა ${wanted.length}.`}
      </output>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** A static picture of one fact, for a question's visual. */
export function TimesPicture({ table, factor, glyph = 'star' }: { table: number; factor: number; glyph?: Glyph }) {
  return <TimesGroups table={table} factor={factor} glyph={glyph} />;
}

/** The biggest cell in a grid, so a caption can name it. */
export const biggestProduct = maxProduct;

/** The ones digits of a table, for a pattern caption. */
export const onesLine = (table: number, upTo: number): string => tableRow(table, upTo).map((n) => `${n} (${onesDigit(n)})`).join(', ');
