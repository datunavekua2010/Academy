/**
 * A number-bond diagram: the whole in a big circle on top, joined to two smaller circles (the
 * parts). `null` is a hidden number: it is drawn as a dashed circle with a "?", so the missing
 * part is never signalled by colour alone. `highlight` makes one circle pulse.
 */

export type BondPlace = 'whole' | 'a' | 'b';

interface Props {
  whole: number | null;
  a: number | null;
  b: number | null;
  highlight?: BondPlace | null;
  /** A smaller diagram, for answer options. */
  compact?: boolean;
}

export const bondLabel = (whole: number | null, a: number | null, b: number | null): string => {
  const w = whole === null ? 'მთელი უცნობია' : `მთელი ${whole}`;
  const part = (n: number | null, name: string) => (n === null ? `${name} ნაწილი უცნობია` : `${name} ნაწილი ${n}`);
  return `რიცხვთა კავშირი: ${w}; ${part(a, 'პირველი')}; ${part(b, 'მეორე')}`;
};

function Circle({ place, value, cx, cy, r, highlight }: { place: BondPlace; value: number | null; cx: number; cy: number; r: number; highlight: boolean }) {
  return (
    <g className={`nb-node is-${place} ${value === null ? 'is-hidden' : ''} ${highlight ? 'is-hi' : ''}`}>
      <circle cx={cx} cy={cy} r={r} />
      <text x={cx} y={cy} className="nb-num" key={String(value)} textAnchor="middle" dominantBaseline="central">
        {value === null ? '?' : value}
      </text>
    </g>
  );
}

export function NumberBond({ whole, a, b, highlight = null, compact = false }: Props) {
  return (
    <svg className={`nb ${compact ? 'is-compact' : ''}`} viewBox="0 0 200 160" role="img" aria-label={bondLabel(whole, a, b)}>
      <line className="nb-link" x1="100" y1="60" x2="52" y2="104" />
      <line className="nb-link" x1="100" y1="60" x2="148" y2="104" />
      <Circle place="whole" value={whole} cx={100} cy={36} r={28} highlight={highlight === 'whole'} />
      <Circle place="a" value={a} cx={50} cy={116} r={25} highlight={highlight === 'a'} />
      <Circle place="b" value={b} cx={150} cy={116} r={25} highlight={highlight === 'b'} />
      {!compact && (
        <>
          <text x="136" y="34" className="nb-cap">
            მთელი
          </text>
          <text x="50" y="154" className="nb-cap" textAnchor="middle">
            ნაწილი
          </text>
          <text x="150" y="154" className="nb-cap" textAnchor="middle">
            ნაწილი
          </text>
        </>
      )}
    </svg>
  );
}
