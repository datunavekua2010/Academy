import { useState } from 'react';
import type { ExploreTool, ExplainBlock, ShapeKind, ShapeSpec } from '../types';
import { DemoButtons, useStepper } from './Visuals';
import { ShapeBoard } from './ShapeBoard';
import { FractionPicture } from './FractionBoard';
import {
  HALF_CUTS,
  HALF_CUTS_DIAGONAL,
  HALF_CUTS_TURNED,
  QUARTER_CUTS,
  QUARTER_CUTS_STRIPES,
  UNEQUAL_THIRDS,
  denominatorOf,
  equalPartsSpec,
  fractionName,
  fractionOf,
  fractionText,
  hasEqualPieces,
  piecesOf,
} from './FractionGeometry';

/**
 * Exploration labs and demonstrations for G2 U07. Every picture is built from cuts the geometry then measures, so the
 * fraction shown is the fraction the pieces really make — an unequal cut can never be labelled "thirds".
 */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;
type Block<T extends ExplainBlock['type']> = Extract<ExplainBlock, { type: T }>;

// ─────────────────────────── the equal-parts lab ───────────────────────────

/** Cut a whole into `parts` equal pieces and pick them out one by one. */
export function EqualPartsLab({ tool }: { tool: ToolOf<'equal-parts-lab'> }) {
  const [shape, setShape] = useState<ShapeKind>(tool.shapes[0] ?? 'circle');
  const spec = equalPartsSpec(shape, tool.parts) ?? equalPartsSpec('square', tool.parts)!;
  const [picked, setPicked] = useState<number[]>([]);
  const den = denominatorOf(spec) ?? 0;
  const toggle = (n: number) => setPicked((all) => (all.includes(n) ? all.filter((k) => k !== n) : [...all, n]));
  return (
    <div className="lab lab-equalparts">
      <div className="xt-modes" role="group" aria-label="ფიგურა">
        {tool.shapes.map((s) => (
          <button key={s} type="button" className={`xt-mode ${s === shape ? 'is-on' : ''}`} aria-pressed={s === shape} onClick={() => { setShape(s); setPicked([]); }}>
            {s === 'circle' ? 'წრე' : s === 'square' ? 'კვადრატი' : 'მართკუთხედი'}
          </button>
        ))}
      </div>
      <ShapeBoard spec={spec} marks={Object.fromEntries(picked.map((n) => [n, 'sel' as const]))} pressed={picked} onPiece={toggle} label={`${den} ტოლი ნაწილი`} />
      <div className="xt-row">
        <button type="button" className="btn btn-ghost" onClick={() => setPicked(piecesOf(spec).slice(0, 1))}>
          აიღე ერთი ნაწილი
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setPicked(piecesOf(spec))}>
          აიღე ყველა
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setPicked([])}>
          ↻ გასუფთავება
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {`მთელი დაყოფილია ${den} ტოლ ნაწილად. ${picked.length === 0 ? 'მონიშნე ნაწილი — ზემოთ გამოჩნდება მრიცხველი.' : `აღებულია ${picked.length}: ეს არის ${picked.length}/${den} — ${fractionName({ numerator: picked.length, denominator: den })}.`}`}
      </p>
      <p className="lab-facts">
        <span>მნიშვნელი: {den}</span>
        <span>მრიცხველი: {picked.length}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── halves ───────────────────────────

/** Two equal parts, three ways — the half is always one of two equal pieces. */
export function HalvesLab({ tool }: { tool: ToolOf<'halves-lab'> }) {
  const shape = tool.shapes[0] ?? 'square';
  const options: Array<{ key: string; cuts: ShapeSpec['cuts']; label: string }> = [
    { key: 'flat', cuts: HALF_CUTS[shape], label: 'ჰორიზონტალურად' },
    { key: 'turn', cuts: HALF_CUTS_TURNED[shape], label: 'ვერტიკალურად' },
    { key: 'diag', cuts: HALF_CUTS_DIAGONAL[shape], label: 'დიაგონალურად' },
  ];
  const [which, setWhich] = useState(0);
  const [take, setTake] = useState<number[]>([]);
  const spec: ShapeSpec = { shape, cuts: options[which].cuts };
  const halves = hasEqualPieces(spec) && denominatorOf(spec) === 2;
  const f = fractionOf(spec, take);
  return (
    <div className="lab lab-halves">
      <div className="xt-modes" role="group" aria-label="დაყოფის გზა">
        {options.map((o, i) => (
          <button key={o.key} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => { setWhich(i); setTake([]); }}>
            {o.label}
          </button>
        ))}
      </div>
      <ShapeBoard spec={spec} marks={Object.fromEntries(take.map((n) => [n, 'sel' as const]))} pressed={take} onPiece={(n) => setTake((all) => (all.includes(n) ? all.filter((k) => k !== n) : [...all, n]))} label={halves ? 'ორი ტოლი ნაწილი' : 'ორი არატოლი ნაწილი'} />
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {halves
          ? `ორი ტოლი ნაწილი. ${f && f.numerator > 0 ? `აღებულია ${fractionText(f)} — ${fractionName(f)}.` : 'აიღე ერთი ნაწილი — ეს იქნება 1/2.'}`
          : 'ეს დაყოფა ტოლ ნაწილებად არ იყოფა.'}
      </p>
      <p className="lab-facts">
        <span>ნაწილები: {denominatorOf(spec) ?? '—'}</span>
        <span>აღებული: {take.length}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── quarters ───────────────────────────

/** Four equal parts, two ways to cut them. */
export function QuartersLab({ tool }: { tool: ToolOf<'quarters-lab'> }) {
  const shape = tool.shapes[0] ?? 'square';
  const options = [
    { key: 'cross', cuts: QUARTER_CUTS[shape], label: 'ჯვარედინად' },
    { key: 'stripes', cuts: QUARTER_CUTS_STRIPES[shape], label: 'ზოლებად' },
  ];
  const [which, setWhich] = useState(0);
  const [take, setTake] = useState<number[]>([]);
  const spec: ShapeSpec = { shape, cuts: options[which].cuts };
  const quarters = denominatorOf(spec) === 4;
  const f = fractionOf(spec, take);
  return (
    <div className="lab lab-quarters">
      <div className="xt-modes" role="group" aria-label="დაყოფის გზა">
        {options.map((o, i) => (
          <button key={o.key} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => { setWhich(i); setTake([]); }}>
            {o.label}
          </button>
        ))}
      </div>
      <ShapeBoard spec={spec} marks={Object.fromEntries(take.map((n) => [n, 'sel' as const]))} pressed={take} onPiece={(n) => setTake((all) => (all.includes(n) ? all.filter((k) => k !== n) : [...all, n]))} label={quarters ? 'ოთხი ტოლი ნაწილი' : 'ოთხი არატოლი ნაწილი'} />
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {quarters
          ? `ოთხი ტოლი ნაწილი. ${take.length > 0 ? `აღებულია ${fractionText(f!)} — ${fractionName(f!)}.` : 'აიღე ერთი ნაწილი — ეს იქნება 1/4.'}`
          : 'ეს დაყოფა ოთხ ტოლ ნაწილად არ იყოფა.'}
      </p>
      <p className="lab-facts">
        <span>ნაწილები: {denominatorOf(spec) ?? '—'}</span>
        <span>აღებული: {take.length}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── thirds ───────────────────────────

/** Three equal parts beside three unequal ones — so "thirds" always means equal thirds. */
export function ThirdsLab({ tool }: { tool: ToolOf<'thirds-lab'> }) {
  const shape = tool.shapes[0] ?? 'square';
  const equal = equalPartsSpec(shape, 3) ?? equalPartsSpec('square', 3)!;
  const unequal: ShapeSpec = { shape, cuts: UNEQUAL_THIRDS[shape] };
  const [take, setTake] = useState<number[]>([]);
  const thirds = denominatorOf(equal) === 3;
  const notThirds = !hasEqualPieces(unequal);
  const f = fractionOf(equal, take);
  return (
    <div className="lab lab-thirds">
      <div className="lbt-pair">
        <ShapeBoard spec={equal} marks={Object.fromEntries(take.map((n) => [n, 'sel' as const]))} pressed={take} onPiece={(n) => setTake((all) => (all.includes(n) ? all.filter((k) => k !== n) : [...all, n]))} label="სამი ტოლი ნაწილი" />
        <ShapeBoard spec={unequal} label="სამი არატოლი ნაწილი" />
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {`მარცხენა: ${thirds ? 'სამი ტოლი ნაწილი — ეს მესამედებია.' : 'ნაწილები ტოლი არ არის.'} მარჯვენა: ${notThirds ? 'სამი ნაწილი, მაგრამ ტოლი არ არის — ეს მესამედები არ არის.' : 'ტოლი ნაწილები.'} ${take.length > 0 ? `აღებულია ${fractionText(f!)} — ${fractionName(f!)}.` : ''}`}
      </p>
      <p className="lab-facts">
        <span>მარცხენა: {denominatorOf(equal) ?? '—'} ტოლი</span>
        <span>მარჯვენა: ტოლი არ არის</span>
        <span>აღებული: {take.length}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── the fraction lab ───────────────────────────

/** Pick parts and watch the numerator and denominator change. */
export function NumeratorLab({ tool }: { tool: ToolOf<'fraction-lab2'> }) {
  const [which, setWhich] = useState(0);
  const [take, setTake] = useState<number[]>([]);
  const entry = tool.shapes[which] ?? tool.shapes[0];
  const spec = equalPartsSpec(entry.shape, entry.parts);
  if (!spec) return null;
  const den = denominatorOf(spec) ?? entry.parts;
  const f = fractionOf(spec, take);
  const toggle = (n: number) => setTake((all) => (all.includes(n) ? all.filter((k) => k !== n) : [...all, n]));
  return (
    <div className="lab lab-fraction">
      <div className="xt-modes" role="group" aria-label="ფიგურა">
        {tool.shapes.map((s, i) => (
          <button key={`${s.shape}-${s.parts}`} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => { setWhich(i); setTake([]); }}>
            {`${s.parts} ნაწილი`}
          </button>
        ))}
      </div>
      <ShapeBoard spec={spec} marks={Object.fromEntries(take.map((n) => [n, 'sel' as const]))} pressed={take} onPiece={toggle} label={`${den} ტოლი ნაწილი`} />
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {f && f.numerator > 0
          ? `აღებულია ${f.numerator}, სულ ${f.denominator} — ${fractionText(f)} (${fractionName(f)}). მნიშვნელი ამბობს, რამდენ ტოლ ნაწილად არის გაყოფილი მთელი, მრიცხველი — რამდენია აღებული.`
          : `ეს მთელი დაყოფილია ${den} ტოლ ნაწილად. მონიშნე ერთი ან მეტი.`}
      </p>
      <p className="lab-facts">
        <span>მრიცხველი: {take.length}</span>
        <span>მნიშვნელი: {den}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── demonstrations ───────────────────────────

/** The whole cut into equal parts in front of the student. */
export function FractionDemo({ block }: { block: Block<'fraction-demo'> }) {
  const { frame, done, replay, step } = useStepper(3);
  const spec = equalPartsSpec(block.shape, block.parts);
  const take = spec ? piecesOf(spec).slice(0, Math.min(block.take, frame >= 2 ? block.take : frame + 1)) : [];
  return (
    <figure className="demo demo-fraction">
      <span className="demo-badge">ტოლი ნაწილები</span>
      {spec ? <FractionPicture spec={spec} take={take} /> : <p>ეს ფიგურა ტოლ ნაწილებად არ იყოფა.</p>}
      <div className="demo-step" role="status" aria-live="polite">
        {block.steps[Math.min(frame, block.steps.length - 1)] ?? ''}
      </div>
      <p className="demo-rule">
        {spec ? `მთელი დაყოფილია ${block.parts} ტოლ ნაწილად · აღებულია ${block.take} · ${block.take}/${block.parts}` : ''}
      </p>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** A static fraction picture, for a visual. */
export function ShapePartsPicture({ spec, take, caption }: { spec: ShapeSpec; take?: number[]; caption?: string }) {
  return <FractionPicture spec={spec} take={take ?? []} caption={caption} />;
}

/** The fraction as a caption, for a board. */
export const fractionCaption = (spec: ShapeSpec, take: number[]): string => {
  const f = fractionOf(spec, take);
  return f ? `${fractionText(f)} — ${fractionName(f)}` : 'ნაწილები ტოლი არ არის';
};
