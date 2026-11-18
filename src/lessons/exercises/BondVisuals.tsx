import type { CounterGlyph } from '../types';
import { GLYPH_NAME, GlyphIcon, TenFrame } from './Objects';
import { NumberBond } from './NumberBond';

/** Static pictures for number-bond questions: two groups in boxes, and a bond with optional counters. */

function Pile({ n, glyph, which }: { n: number; glyph: CounterGlyph; which: 'a' | 'b' }) {
  return (
    <span className="parts-pile" aria-hidden="true">
      {Array.from({ length: n }, (_, i) =>
        glyph === 'counter' ? (
          <span key={i} className={`cb-disc is-${which}`} />
        ) : (
          <span key={i} className="parts-glyph">
            <GlyphIcon glyph={glyph} />
          </span>
        ),
      )}
    </span>
  );
}

/** Two groups, each in its own box. The whole is never written here. */
export function PartsPicture({ a, b, glyph = 'counter', palette = 'plain', compact = false }: { a: number; b: number; glyph?: CounterGlyph; palette?: 'plain' | 'redblue'; compact?: boolean }) {
  const what = glyph === 'counter' ? 'კუბიკი' : GLYPH_NAME[glyph];
  return (
    <div className={`parts ${palette === 'redblue' ? 'is-redblue' : ''} ${compact ? 'is-compact' : ''}`} role="img" aria-label={`ორი ჯგუფი: პირველში ${a} ${what}, მეორეში ${b} ${what}`}>
      <div className="parts-box is-a">
        <Pile n={a} glyph={glyph} which="a" />
      </div>
      <span className="parts-plus" aria-hidden="true">
        +
      </span>
      <div className="parts-box is-b">
        <Pile n={b} glyph={glyph} which="b" />
      </div>
    </div>
  );
}

/** A number bond, with a frame of counters beside it when `counters` is set. */
export function BondPicture({ whole, a, b, counters, compact = false }: { whole: number | null; a: number | null; b: number | null; counters?: 'split' | 'plain'; compact?: boolean }) {
  const known = a ?? b;
  const size: 5 | 10 = whole !== null && whole <= 5 ? 5 : 10;
  return (
    <div className={`bondpic ${compact ? 'is-compact' : ''}`}>
      <NumberBond whole={whole} a={a} b={b} compact={compact} />
      {counters && whole !== null && (
        <div className="bondpic-frame">
          <TenFrame
            count={counters === 'split' && known !== null ? known : whole}
            second={counters === 'split' && known !== null ? whole - known : 0}
            size={size}
            label={counters === 'split' && known !== null ? `${known} და ${whole - known}` : `${whole}`}
          />
        </div>
      )}
    </div>
  );
}
