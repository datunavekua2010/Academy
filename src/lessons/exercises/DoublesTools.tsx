import { useState, type CSSProperties } from 'react';
import type { ExplainBlock, ExploreTool } from '../types';
import { StepChain, type ChainCard } from './StepChain';
import { DemoButtons, useStepper } from './Visuals';

/**
 * Doubles and near doubles (Grade 1 · Unit 4). Two groups of counters are drawn one above the other, so
 * counter i of group ა sits directly above counter i of group ბ: equal groups pair off completely, and a
 * near double leaves exactly one counter without a partner. Group ა is solid, group ბ is a ring (never
 * colour alone), and the counter without a partner gets a dashed outline and a “+” mark.
 */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;
type Block<T extends ExplainBlock['type']> = Extract<ExplainBlock, { type: T }>;

export type PairView = 'none' | 'pairs' | 'extra' | 'joined';

// ───────────────────────── geometry (pure) ─────────────────────────

const BOARD_H = 50;
const ROW_A = 13;
const ROW_B = 35;

/** Where counter `i` of a group sits when the groups are paired in two rows. */
export function pairedSlot(side: 'a' | 'b', i: number, widest: number): { x: number; y: number; size: number } {
  const pitch = Math.min(13, 80 / Math.max(widest, 1));
  const first = 16 + (80 - widest * pitch) / 2 + pitch / 2;
  return { x: first + i * pitch, y: side === 'a' ? ROW_A : ROW_B, size: Math.min(10, pitch * 0.86) };
}

/** Where the counter with overall number `n` (group ა first, then ბ) sits once the groups are joined. */
export function joinedSlot(n: number): { x: number; y: number } {
  return { x: 50 + ((n % 5) - 2) * 13, y: 12 + Math.floor(n / 5) * 13 };
}

export const classify = (a: number, b: number): 'equal' | 'near' | 'far' => (a === b ? 'equal' : Math.abs(a - b) === 1 ? 'near' : 'far');

// ───────────────────────── picture ─────────────────────────

export function PairedGroups({ a, b, view = 'none', label }: { a: number; b: number; view?: PairView; label: string }) {
  const widest = Math.max(a, b, 1);
  const joined = view === 'joined';
  const common = Math.min(a, b);
  const pct = (units: number) => `${(units / BOARD_H) * 100}%`;
  const items = [
    ...Array.from({ length: a }, (_, i) => ({ side: 'a' as const, i, n: i })),
    ...Array.from({ length: b }, (_, i) => ({ side: 'b' as const, i, n: a + i })),
  ];
  return (
    <div className="dbl" style={{ aspectRatio: `100 / ${BOARD_H}` }} role="img" aria-label={`${label}: ჯგუფი ა ${a}, ჯგუფი ბ ${b}${joined ? ', გაერთიანებულია' : ''}`}>
      <span className={`dbl-tag ${joined ? 'is-hidden' : ''}`} style={{ top: pct(ROW_A) }} aria-hidden="true">
        ა
      </span>
      <span className={`dbl-tag ${joined ? 'is-hidden' : ''}`} style={{ top: pct(ROW_B) }} aria-hidden="true">
        ბ
      </span>
      {!joined &&
        (view === 'pairs' || view === 'extra') &&
        Array.from({ length: common }, (_, i) => {
          const top = pairedSlot('a', i, widest);
          return <span key={`link-${i}`} className="dbl-link" style={{ left: `${top.x}%`, top: pct(ROW_A + top.size / 2), height: pct(ROW_B - ROW_A - top.size) }} aria-hidden="true" />;
        })}
      {items.map(({ side, i, n }) => {
        const p = joined ? { ...joinedSlot(n), size: 10 } : pairedSlot(side, i, widest);
        const lone = i >= common && (side === 'a' ? a > b : b > a);
        const cls = `dbl-item is-${side} ${!joined && view === 'pairs' && !lone ? 'is-paired' : ''} ${view === 'extra' && lone ? 'is-extra' : ''}`;
        const style: CSSProperties = { left: `${p.x}%`, top: pct(p.y), width: `${p.size}%` };
        return (
          <span key={`${side}-${i}`} className={cls} style={style} aria-hidden="true">
            <span className={`cb-disc is-${side}`} />
            {view === 'extra' && lone && <b className="dbl-plus">+</b>}
          </span>
        );
      })}
    </div>
  );
}

// ───────────────────────── cards ─────────────────────────

function nearCards(a: number, b: number, shown: number, active: number): ChainCard[] {
  const m = Math.min(a, b);
  const texts = [`${a} + ${b}`, `${m} + ${m} = ${2 * m}`, `${2 * m} + 1`, String(a + b)];
  const labels = ['ამოცანა', 'ორმაგი', 'კიდევ ერთი', 'ჯამი'];
  return texts.map((text, i) => ({ label: labels[i], text: i < shown ? text : null, active: i === active }));
}

// ───────────────────────── explore ─────────────────────────

export function DoublesLab({ spec }: { spec: ToolOf<'doubles-lab'> }) {
  const [mode, setMode] = useState<'double' | 'near'>('double');
  // activity A
  const [n, setN] = useState(spec.doubles[0]);
  const [mine, setMine] = useState(0);
  const [joined, setJoined] = useState(false);
  // activity B
  const [s, setS] = useState(spec.near[0]);
  const [other, setOther] = useState(spec.near[0] + 1);
  const [view, setView] = useState<PairView>('none');

  const equal = mine === n;
  const kind = classify(s, other);
  const m = Math.min(s, other);

  const chooseN = (v: number) => {
    setN(v);
    setMine(0);
    setJoined(false);
  };
  const addMine = (d: number) => {
    setMine((x) => Math.min(spec.max, Math.max(0, x + d)));
    setJoined(false);
  };
  const chooseS = (v: number) => {
    setS(v);
    setOther(v + 1);
    setView('none');
  };
  const addOther = (d: number) => {
    setOther((x) => Math.min(spec.max + 1, Math.max(0, x + d)));
    setView('none');
  };

  return (
    <div className="xt dl">
      <div className="xt-modes" role="group" aria-label="აქტივობის არჩევა">
        <button type="button" className={`xt-mode ${mode === 'double' ? 'is-on' : ''}`} aria-pressed={mode === 'double'} onClick={() => setMode('double')}>
          ა · ორმაგები
        </button>
        <button type="button" className={`xt-mode ${mode === 'near' ? 'is-on' : ''}`} aria-pressed={mode === 'near'} onClick={() => setMode('near')}>
          ბ · თითქმის ორმაგები
        </button>
      </div>

      {mode === 'double' ? (
        <>
          <div className="xt-modes" role="group" aria-label="პირველი ჯგუფის არჩევა">
            {spec.doubles.map((v) => (
              <button key={v} type="button" className={`xt-mode xt-num ${v === n ? 'is-on' : ''}`} aria-pressed={v === n} aria-label={`პირველ ჯგუფში ${v}`} onClick={() => chooseN(v)}>
                {v}
              </button>
            ))}
          </div>
          <PairedGroups a={n} b={mine} view={joined ? 'joined' : equal ? 'pairs' : 'none'} label="ორი ჯგუფი" />
          <div className="xt-row">
            <button type="button" className="btn btn-ghost" onClick={() => addMine(-1)} disabled={mine === 0} aria-label="ბ ჯგუფიდან ერთის ამოღება">
              − ერთი
            </button>
            <button type="button" className="btn btn-primary" onClick={() => addMine(1)} disabled={mine >= spec.max} aria-label="ბ ჯგუფში ერთის დამატება">
              + ერთი
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setJoined(!joined)} disabled={!equal}>
              {joined ? 'ისევ გაყოფა' : 'გაერთიანება'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => chooseN(n)}>
              ↻ თავიდან
            </button>
          </div>
          <p className="xt-note" role="status" aria-live="polite">
            {mine === 0
              ? `ა ჯგუფში ${n} კუბიკია. დაამატე ბ ჯგუფში კუბიკები, რომ ორივე ჯგუფი ტოლი გახდეს.`
              : !equal
                ? mine < n
                  ? 'ბ ჯგუფი ჯერ პატარაა: ზოგ კუბიკს წყვილი არ აქვს.'
                  : 'ბ ჯგუფი უკვე უფრო დიდია: ზოგ კუბიკს წყვილი არ აქვს.'
                : joined
                  ? `ორი ტოლი ჯგუფი ერთად: ${n} + ${n} = ${2 * n}.`
                  : `ჯგუფები ტოლია: ყველა კუბიკს წყვილი ჰყავს. ორმაგი ფაქტია ${n} + ${n} = ${2 * n}.`}
          </p>
        </>
      ) : (
        <>
          <div className="xt-modes" role="group" aria-label="პატარა ჯგუფის არჩევა">
            {spec.near.map((v) => (
              <button key={v} type="button" className={`xt-mode xt-num ${v === s ? 'is-on' : ''}`} aria-pressed={v === s} aria-label={`პირველ ჯგუფში ${v}`} onClick={() => chooseS(v)}>
                {v}
              </button>
            ))}
          </div>
          <PairedGroups a={s} b={other} view={view} label="ორი ჯგუფი" />
          <div className="xt-row">
            <button type="button" className="btn btn-ghost" onClick={() => addOther(-1)} disabled={other === 0} aria-label="ბ ჯგუფიდან ერთის ამოღება">
              − ერთი
            </button>
            <button type="button" className="btn btn-primary" onClick={() => addOther(1)} disabled={other >= spec.max + 1} aria-label="ბ ჯგუფში ერთის დამატება">
              + ერთი
            </button>
            <span className="xt-total" role="status" aria-live="polite">
              {s} + {other} = {s + other}
            </span>
          </div>
          {kind === 'near' && (
            <>
              <div className="xt-modes" role="group" aria-label="ნაბიჯები">
                <button type="button" className={`xt-mode ${view === 'pairs' ? 'is-on' : ''}`} aria-pressed={view === 'pairs'} onClick={() => setView('pairs')}>
                  1 · ტოლი ჯგუფები
                </button>
                <button type="button" className={`xt-mode ${view === 'extra' ? 'is-on' : ''}`} aria-pressed={view === 'extra'} onClick={() => setView('extra')}>
                  2 · დამატებითი კუბიკი
                </button>
                <button type="button" className={`xt-mode ${view === 'joined' ? 'is-on' : ''}`} aria-pressed={view === 'joined'} onClick={() => setView('joined')}>
                  3 · გაერთიანება
                </button>
              </div>
              <StepChain cards={nearCards(s, other, view === 'none' ? 1 : view === 'pairs' ? 2 : view === 'extra' ? 3 : 4, view === 'none' ? 0 : view === 'pairs' ? 1 : view === 'extra' ? 2 : 3)} ariaLabel="თითქმის ორმაგის ნაბიჯები" />
            </>
          )}
          <p className="xt-note" role="status" aria-live="polite">
            {kind === 'equal'
              ? `ჯგუფები ტოლია: ეს ორმაგია, ${s} + ${s} = ${2 * s}.`
              : kind === 'near'
                ? `ჯგუფები ერთით განსხვავდება: ეს თითქმის ორმაგია. ${m} + ${m} ორმაგი ფაქტია, ერთი კუბიკი კი დამატებულია.`
                : 'ჯგუფები ერთზე მეტით განსხვავდება. აქ ორმაგი ფაქტი ისე მარტივად ვერ დაგვეხმარება: სხვა ხერხიც გამოიყენე.'}
          </p>
        </>
      )}
    </div>
  );
}

// ───────────────────────── demonstration ─────────────────────────

export function DoublesDemo({ block }: { block: Block<'doubles-demo'> }) {
  const near = classify(block.a, block.b) === 'near';
  const views: PairView[] = near ? ['none', 'pairs', 'extra', 'joined'] : ['none', 'pairs', 'joined'];
  const { frame, done, replay, step } = useStepper(views.length, 1500);
  const m = Math.min(block.a, block.b);
  const cards: ChainCard[] = near
    ? nearCards(block.a, block.b, frame + 1, frame)
    : [
        { label: 'ამოცანა', text: `${block.a} + ${block.b}`, active: frame === 0 },
        { label: 'ორმაგი', text: frame >= 1 ? `${m} + ${m} = ${2 * m}` : null, active: frame === 1 },
        { label: 'ჯამი', text: frame >= 2 ? String(block.a + block.b) : null, active: frame === 2 },
      ];
  return (
    <figure className="demo jd">
      <PairedGroups a={block.a} b={block.b} view={views[frame]} label={`${block.a} და ${block.b}`} />
      <StepChain cards={cards} ariaLabel="ნაბიჯები" />
      <ol className="jd-steps">
        {block.steps.map((text, i) => (
          <li key={i} className={`${i === frame ? 'is-active' : ''} ${i < frame ? 'is-done' : ''}`} aria-current={i === frame ? 'step' : undefined}>
            {text}
          </li>
        ))}
      </ol>
      <div className="demo-status" role="status" aria-live="polite">
        {block.steps[frame]}
      </div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}
