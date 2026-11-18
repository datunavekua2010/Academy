import type { Glyph } from '../types';
import { NumberLine } from './NumberLine';
import { GlyphIcon, ObjectField } from './Objects';

/**
 * Two quantities side by side. Everything shown (pictures, pairs, number line,
 * words) is computed from `a` and `b`, so the comparison can never disagree
 * with the values.
 */

export type CompareView = 'objects' | 'numbers' | 'line' | 'pairs';

export const compareSign = (a: number, b: number): '<' | '>' | '=' => (a < b ? '<' : a > b ? '>' : '=');

/** One plain sentence about the comparison. */
export function compareWords(a: number, b: number): string {
  if (a === b) return `${a} და ${b} ტოლია.`;
  return a > b ? `${a} უფრო დიდია, ვიდრე ${b}.` : `${a} უფრო პატარაა, ვიდრე ${b}.`;
}

function Pairs({ a, b, glyph }: { a: number; b: number; glyph: Glyph }) {
  const common = Math.min(a, b);
  const extra = Math.abs(a - b);
  const columns = Math.max(a, b);
  return (
    <div className="pairs" role="img" aria-label={a === b ? `ყველა საგანი წყვილდება: ${a} და ${b}` : `${common} წყვილი, ზედმეტია ${extra} საგანი ${a > b ? 'ჯგუფ ა-ში' : 'ჯგუფ ბ-ში'}`}>
      {Array.from({ length: columns }, (_, i) => {
        const paired = i < common;
        return (
          <div key={i} className={`pair ${paired ? 'is-paired' : 'is-extra'}`} aria-hidden="true">
            <span className={`pair-cell ${i < a ? '' : 'is-empty'}`}>{i < a && <GlyphIcon glyph={glyph} />}</span>
            <span className="pair-link">{paired ? '↕' : ''}</span>
            <span className={`pair-cell ${i < b ? '' : 'is-empty'}`}>{i < b && <GlyphIcon glyph={glyph} />}</span>
            {!paired && <span className="pair-extra">+</span>}
          </div>
        );
      })}
    </div>
  );
}

interface Props {
  a: number;
  b: number;
  view: CompareView;
  glyph?: Glyph;
  /** Show each group's number in its heading (pictures-only views hide it by default). */
  showNumbers?: boolean;
}

export function CompareGroups({ a, b, view, glyph = 'star', showNumbers = false }: Props) {
  const max = 20;
  return (
    <div className={`cmp is-${view}`}>
      {view === 'objects' && (
        <div className="cmp-groups">
          {([['ა', a], ['ბ', b]] as const).map(([name, n]) => (
            <figure key={name} className="cmp-group">
              <figcaption>
                ჯგუფი {name}
                {showNumbers && <strong> · {n}</strong>}
              </figcaption>
              <ObjectField count={n} glyph={glyph} layout="rows" label={`ჯგუფი ${name}`} compact />
            </figure>
          ))}
        </div>
      )}
      {view === 'numbers' && (
        <div className="cmp-groups">
          {([['ა', a], ['ბ', b]] as const).map(([name, n]) => (
            <figure key={name} className="cmp-group">
              <figcaption>{name}</figcaption>
              <div className="cmp-number">{n}</div>
            </figure>
          ))}
        </div>
      )}
      {view === 'pairs' && <Pairs a={a} b={b} glyph={glyph} />}
      {view === 'line' && (
        <NumberLine
          min={0}
          max={max}
          pins={[
            { value: a, label: `ა ${a}` },
            { value: b, label: `ბ ${b}` },
          ]}
          labelled={[0, 5, 10, 15, 20]}
          ariaLabel={`რიცხვითი ღერძი: ა ${a}, ბ ${b}`}
        />
      )}
    </div>
  );
}
