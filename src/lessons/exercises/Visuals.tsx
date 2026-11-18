import { useEffect, useState } from 'react';
import { numberName } from '../numberNames';
import type { ExplainBlock, VisualSpec } from '../types';
import { NumberLine } from './NumberLine';

/**
 * Small, reusable pictures for the lessons: a number sequence with a hidden
 * number, groups of ten and ones, and the two animated demonstrations used on
 * the "understand" screens (a walking highlight and a hopping marker). Every
 * animation has Replay and Step buttons, and every picture has a text label.
 */

// ─────────────────────────── stepping ───────────────────────────

/** Plays through `length` frames on a timer; the student can also replay or step by hand. */
export function useStepper(length: number, intervalMs = 850) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return undefined;
    if (frame >= length - 1) {
      setPlaying(false);
      return undefined;
    }
    const id = window.setTimeout(() => setFrame((f) => f + 1), intervalMs);
    return () => window.clearTimeout(id);
  }, [playing, frame, length, intervalMs]);
  return {
    frame,
    done: frame >= length - 1,
    replay: () => {
      setFrame(0);
      setPlaying(true);
    },
    step: () => {
      setPlaying(false);
      setFrame((f) => Math.min(f + 1, length - 1));
    },
  };
}

// ─────────────────────────── sequence ───────────────────────────

export function SequenceRow({ items, arrows, activeIndex, reveal, onHole }: { items: Array<number | null>; arrows?: string; activeIndex?: number; reveal?: number; onHole?: () => void }) {
  const spoken = items.map((n) => (n === null ? 'გამოტოვებული რიცხვი' : String(n))).join(', ');
  return (
    <ol className="seq" role={onHole ? 'group' : 'img'} aria-label={`მიმდევრობა: ${spoken}`}>
      {items.map((n, i) => (
        <li key={i} className="seq-cell" aria-hidden={onHole ? undefined : true}>
          {i > 0 && (
            <span className={`seq-arrow ${arrows ? 'has-label' : ''}`} aria-hidden="true">
              {arrows ? <small>{arrows}</small> : null}
              <b>→</b>
            </span>
          )}
          {n === null && onHole ? (
            <button type="button" className="seq-tile is-hole is-button" onClick={onHole} aria-label="ცარიელი ადგილი: შეეხე და ნახე რიცხვი">
              ?
            </button>
          ) : (
            <span className={`seq-tile ${n === null ? 'is-hole' : ''} ${i === activeIndex ? 'is-active' : ''} ${reveal !== undefined && i === reveal ? 'is-new' : ''}`}>{n === null ? '?' : n}</span>
          )}
        </li>
      ))}
    </ol>
  );
}

// ─────────────────────────── quantity ───────────────────────────

/** A number as groups of ten (one bar each) and single dots. Never more than ten bars, so it stays small. */
export function Quantity({ tens, ones }: { tens: number; ones: number }) {
  const label = `${tens > 0 ? `${tens} ათიანი` : ''}${tens > 0 && ones > 0 ? ' და ' : ''}${ones > 0 || tens === 0 ? `${ones} ცალი` : ''}`;
  return (
    <div className="qty" role="img" aria-label={label}>
      {Array.from({ length: tens }, (_, i) => (
        <span key={`t${i}`} className="qty-ten" aria-hidden="true">
          {Array.from({ length: 10 }, (_, k) => (
            <i key={k} />
          ))}
        </span>
      ))}
      {ones > 0 && (
        <span className="qty-ones" aria-hidden="true">
          {Array.from({ length: ones }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      )}
    </div>
  );
}

export const quantityText = (n: number): string => {
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  if (tens === 0) return `${ones} ცალი`;
  return ones === 0 ? `${tens} ათიანი` : `${tens} ათიანი და ${ones} ცალი`;
};

// ─────────────────────────── question visual ───────────────────────────

export function VisualView({ spec }: { spec: VisualSpec }) {
  switch (spec.type) {
    case 'sequence':
      return (
        <div className="lp-visual">
          <SequenceRow items={spec.items} arrows={spec.arrows} />
        </div>
      );
    case 'quantity':
      return (
        <div className="lp-visual">
          <Quantity tens={spec.tens} ones={spec.ones} />
        </div>
      );
    case 'line':
      return (
        <div className="lp-visual">
          <NumberLine min={spec.min} max={spec.max} value={spec.marker ?? null} labelled={spec.labelled} hops={spec.hops} ariaLabel={`რიცხვითი ღერძი ${spec.min}-დან ${spec.max}-მდე`} />
        </div>
      );
  }
}

// ─────────────────────────── animated demonstrations ───────────────────────────

function DemoButtons({ done, replay, step }: { done: boolean; replay: () => void; step: () => void }) {
  return (
    <div className="demo-buttons">
      <button type="button" className="btn btn-ghost btn-small" onClick={replay}>
        ↻ ხელახლა
      </button>
      <button type="button" className="btn btn-ghost btn-small" onClick={step} disabled={done}>
        შემდეგი ნაბიჯი
      </button>
    </div>
  );
}

const DIRECTION_BADGE = { forward: 'წინ თვლა ▶', backward: '◀ უკან თვლა', steps: 'ტოლი ნაბიჯები' } as const;

type Block<T extends ExplainBlock['type']> = Extract<ExplainBlock, { type: T }>;

export function ChainDemo({ block }: { block: Block<'chain'> }) {
  const { frame, done, replay, step } = useStepper(block.numbers.length);
  return (
    <figure className="demo">
      <span className={`demo-badge is-${block.direction}`}>{DIRECTION_BADGE[block.direction]}</span>
      <ol className="chain" aria-label={`${block.numbers.join(', ')}`}>
        {block.numbers.map((n, i) => (
          <li key={i} className="chain-cell">
            {i > 0 && (
              <span className={`chain-arrow ${i <= frame ? 'is-on' : ''}`} aria-hidden="true">
                <small>{block.label}</small>
                <b>→</b>
              </span>
            )}
            <span className={`chain-num ${i === frame ? 'is-active' : ''} ${i < frame ? 'is-seen' : ''}`}>{n}</span>
          </li>
        ))}
      </ol>
      <div className="demo-status" role="status" aria-live="polite">
        {done ? `ბოლო რიცხვი: ${block.numbers[block.numbers.length - 1]}` : `ახლა: ${block.numbers[frame]}`}
      </div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

export function HopDemo({ block }: { block: Block<'hops'> }) {
  const step = block.step ?? 1;
  const dir = block.to >= block.from ? 1 : -1;
  const path: number[] = [];
  for (let v = block.from; dir > 0 ? v <= block.to : v >= block.to; v += dir * step) path.push(v);
  const { frame, done, replay, step: advance } = useStepper(path.length);
  const hops = frame;
  return (
    <figure className="demo">
      <NumberLine min={block.min} max={block.max} value={path[frame]} start={block.from} destination={block.to} hops={path.slice(0, frame + 1)} ariaLabel={`მარკერი გადადის ${block.from}-დან ${block.to}-მდე`} />
      <div className="demo-status" role="status" aria-live="polite">
        {done ? `მივედით ${block.to}-ზე ${path.length - 1} ნაბიჯით ${dir > 0 ? 'მარჯვნივ' : 'მარცხნივ'}` : `ახლა: ${path[frame]} · ნაბიჯი ${hops}`}
      </div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={advance} />
    </figure>
  );
}

export function QuantitiesBlock({ block }: { block: Block<'quantities'> }) {
  return (
    <div className="reps">
      {block.numbers.map((n) => (
        <figure key={n} className="rep">
          <div className="rep-numeral">{n}</div>
          <div className="rep-name">{numberName(n)}</div>
          <Quantity tens={Math.floor(n / 10)} ones={n % 10} />
        </figure>
      ))}
    </div>
  );
}
