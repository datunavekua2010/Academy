import { useState } from 'react';
import type { ExploreTool, ExplainBlock } from '../types';
import { DemoButtons, useStepper } from './Visuals';
import { DotGroup, TableRow, TimesGrid, TimesGroups } from './TimesBoard';
import {
  cellKey,
  cellsFor,
  factText,
  onesRule,
  productOf,
  repeatText,
  skipText,
  tableRow,
} from './TimesGeometry';

/**
 * Exploration labs and step-by-step demonstrations for G2 U05. Every lab reads its numbers from the fact it is showing,
 * so the total, the skip-count and the row can never tell different stories.
 */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;
type Block<T extends ExplainBlock['type']> = Extract<ExplainBlock, { type: T }>;

// ─────────────────────────── pairs of two ───────────────────────────

/** Build pairs; each new pair adds two to the total and one landing to the skip-count. */
export function PairsLab({ tool }: { tool: ToolOf<'pairs-lab'> }) {
  const [pairs, setPairs] = useState(1);
  const max = Math.max(1, tool.maxGroups);
  const total = productOf(2, pairs);
  return (
    <div className="lab lab-pairs">
      <div className="tgrps-row">
        {Array.from({ length: pairs }, (_, i) => (
          <DotGroup key={i} count={2} index={i} glyph="apple" />
        ))}
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-primary" disabled={pairs >= max} onClick={() => setPairs((p) => p + 1)}>
          + ერთი წყვილი
        </button>
        <button type="button" className="btn btn-ghost" disabled={pairs <= 1} onClick={() => setPairs((p) => p - 1)}>
          − ერთი წყვილი
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setPairs(1)}>
          ↻ თავიდან
        </button>
      </div>
      <p className="rep-line" aria-label={`ორ-ორად თვლა: ${skipText(2, pairs)}`}>
        {tableRow(2, pairs).map((n, i) => (
          <span key={i} className="rep-term">
            {n}
            {i < pairs - 1 ? ', ' : ''}
          </span>
        ))}
      </p>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {`${pairs} წყვილი: ${factText(2, pairs)}, ანუ ${repeatText(2, pairs)}. ყოველი ახალი წყვილი 2-ს ამატებს.`}
      </p>
      <p className="lab-facts">
        <span>წყვილები: {pairs}</span>
        <span>სულ: {total}</span>
        <span>ორ-ორად: {skipText(2, pairs)}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── a table built fact by fact ───────────────────────────

/** Add one group at a time and watch the table row fill in. */
export function TimesTableLab({ tool }: { tool: ToolOf<'times-table-lab'> }) {
  const [factor, setFactor] = useState(1);
  const upTo = Math.max(1, tool.upTo);
  const filled = Math.min(factor, upTo);
  return (
    <div className="lab lab-times">
      <TableRow table={tool.table} upTo={upTo} filled={filled} />
      <div className="xt-row">
        <button type="button" className="btn btn-primary" disabled={factor >= upTo} onClick={() => setFactor((f) => f + 1)}>
          + ერთი ჯგუფი ({tool.table})
        </button>
        <button type="button" className="btn btn-ghost" disabled={factor <= 1} onClick={() => setFactor((f) => f - 1)}>
          − ერთი ჯგუფი
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setFactor(upTo)}>
          შეავსე ცხრილი
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setFactor(1)}>
          ↻ თავიდან
        </button>
      </div>
      <TimesGroups table={tool.table} factor={filled} glyph="star" />
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {`${filled} × ${tool.table} = ${productOf(tool.table, filled)}. ${repeatText(tool.table, filled)}.`}
      </p>
      <p className="lab-facts">
        <span>ცხრილი: {tool.table}</span>
        <span>შევსებულია: {filled} / {upTo}</span>
        <span>{onesRule(tool.table)}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── doubling twice ───────────────────────────

/** Double a group, then double it again: ×4 is two doublings. */
export function DoubleDoubleLab({ tool }: { tool: ToolOf<'double-double-lab'> }) {
  const [step, setStep] = useState(0);
  const upTo = Math.max(1, tool.upTo);
  const each = Math.max(1, tool.start);
  const stages = [each, each * 2, each * 4];
  const now = stages[Math.min(step, 2)];
  return (
    <div className="lab lab-double">
      <div className="dd-stages">
        {stages.map((n, i) => (
          <div key={i} className={`dd-stage ${i <= step ? 'is-on' : ''}`}>
            <b className="dd-num">{n}</b>
            <span className="dd-cap">{i === 0 ? 'თავიდან' : i === 1 ? 'გაორმაგებული' : 'კიდევ გაორმაგებული'}</span>
          </div>
        ))}
      </div>
      <TimesGroups table={now} factor={Math.max(1, upTo)} glyph="star" showFacts={false} />
      <div className="xt-row">
        <button type="button" className="btn btn-primary" disabled={step >= 2} onClick={() => setStep((s) => Math.min(2, s + 1))}>
          გააორმაგე
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {step === 0 && `${each}. ჯერ გავაორმაგოთ, მერე კიდევ ერთხელ — ეს არის ${4}-ის ცხრილი.`}
        {step === 1 && `${each} × 2 = ${each * 2}. კიდევ ერთი გაორმაგება მოგვცემს ${each * 4}-ს.`}
        {step === 2 && `${each} × 4 = ${each * 4}. ორჯერ გაორმაგება იგივეა, რაც 4-ზე გამრავლება: ${each} × 2 = ${each * 2}, ${each * 2} × 2 = ${each * 4}.`}
      </p>
      <p className="lab-facts">
        <span>4-ის ცხრილი: 4 × {each} = {each * 4}</span>
        <span>2-ის ცხრილი: 2 × {each * 2} = {each * 4}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── counting in fives ───────────────────────────

/** Groups of five, counting on: the ones digit alternates 5 and 0. */
export function CountByFiveLab({ tool }: { tool: ToolOf<'count-by-five-lab'> }) {
  const [groups, setGroups] = useState(1);
  const upTo = Math.max(1, tool.upTo);
  const total = productOf(5, groups);
  return (
    <div className="lab lab-fives">
      <div className="tgrps-row">
        {Array.from({ length: groups }, (_, i) => (
          <DotGroup key={i} count={5} index={i} glyph="ball" />
        ))}
      </div>
      <p className="rep-line" aria-label={`ხუთ-ხუთად თვლა: ${skipText(5, groups)}`}>
        {tableRow(5, groups).map((n, i) => (
          <span key={i} className="rep-term">
            {n}
            {i < groups - 1 ? ', ' : ''}
          </span>
        ))}
      </p>
      <div className="xt-row">
        <button type="button" className="btn btn-primary" disabled={groups >= upTo} onClick={() => setGroups((g) => g + 1)}>
          + ხუთი
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setGroups(1)}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {`${groups} × 5 = ${total}. ბოლო ციფრი: ${total % 10}. ${onesRule(5)}`}
      </p>
      <p className="lab-facts">
        <span>სულ: {total}</span>
        <span>ჯგუფები: {groups}</span>
        <span>ხუთ-ხუთად: {skipText(5, groups)}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── the grid ───────────────────────────

/** Highlight related facts on the whole grid, then work through challenges. */
export function TimesGridLab({ tool }: { tool: ToolOf<'times-grid-lab'> }) {
  const [target, setTarget] = useState(tool.tables[0] * tool.factors[0]);
  const [picked, setPicked] = useState<string[]>([]);
  const [which, setWhich] = useState(0);
  const wanted = cellsFor(target, tool.tables, tool.factors);
  const right = picked.length === wanted.length && picked.every((k) => wanted.includes(k));
  const highlight = wanted.map((k) => {
    const [table, factor] = k.split(',').map(Number);
    return { table, factor };
  });
  const pickTarget = (i: number) => {
    setWhich(i);
    setTarget(tool.tables[i % tool.tables.length] * tool.factors[i % tool.factors.length]);
    setPicked([]);
  };
  return (
    <div className="lab lab-grid">
      <div className="xt-modes" role="group" aria-label="გამოწვევა">
        {tool.tables.map((t, i) => (
          <button key={t} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => pickTarget(i)}>
            {t}-ის ცხრილი
          </button>
        ))}
      </div>
      <TimesGrid
        tables={tool.tables}
        factors={tool.factors}
        highlight={right ? highlight : []}
        chosen={picked}
        onCell={(table, factor) => {
          const key = cellKey(table, factor);
          setPicked((all) => (all.includes(key) ? all.filter((k) => k !== key) : [...all, key]));
        }}
        label="გამრავლების ცხრილი"
      />
      <div className="xt-row">
        <button type="button" className="btn btn-ghost" onClick={() => setPicked(highlight.map((h) => cellKey(h.table, h.factor)))}>
          მაჩვენე დაკავშირებული ფაქტები
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setPicked([])}>
          ↻ გასუფთავება
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {right
          ? `✓ სწორია: ${wanted.map((k) => k.split(',').reverse().join(' × ')).join(', ')} — ყველა ${target}-ს იძლევა.`
          : `მონიშნე ყველა უჯრა, სადაც ნამრავლი ${target}-ია. მონიშნულია ${picked.length} / ${wanted.length}.`}
      </p>
      <p className="lab-facts">
        <span>სამიზნე: {target}</span>
        <span>უჯრები: {wanted.length}</span>
        <span>{tool.tables.length} ცხრილი × {tool.factors.length} თანამამრავლი</span>
      </p>
    </div>
  );
}

// ─────────────────────────── demonstrations ───────────────────────────

/** The table walked one fact at a time, the row filling in as it goes. */
export function TableDemo({ block }: { block: Block<'table-demo'> }) {
  const upTo = Math.max(1, block.upTo);
  const { frame, done, replay, step } = useStepper(upTo);
  const filled = frame + 1;
  return (
    <figure className="demo demo-table">
      <span className="demo-badge">{block.table}-ის ცხრილი</span>
      <TableRow table={block.table} upTo={upTo} filled={filled} />
      <div className="demo-step" role="status" aria-live="polite">
        {block.steps[Math.min(frame, block.steps.length - 1)] ?? ''}
      </div>
      <p className="demo-rule">
        {factText(block.table, filled)} · {repeatText(block.table, filled)}
      </p>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** Double, then double again: the four times table out of the twos. */
export function DoubleDemo({ block }: { block: Block<'double-demo'> }) {
  const { frame, done, replay, step } = useStepper(3);
  const stages = [block.each, block.each * 2, block.each * 4];
  return (
    <figure className="demo demo-double">
      <span className="demo-badge">ორჯერ გაორმაგება</span>
      <div className="dd-stages">
        {stages.map((n, i) => (
          <div key={i} className={`dd-stage ${i <= frame ? 'is-on' : ''}`}>
            <b className="dd-num">{n}</b>
            <span className="dd-cap">{i === 0 ? `${block.each} × 1` : i === 1 ? `${block.each} × 2` : `${block.each} × 4`}</span>
          </div>
        ))}
      </div>
      <TimesGroups table={block.each} factor={block.factor} showFacts={false} />
      <div className="demo-step" role="status" aria-live="polite">
        {block.steps[Math.min(frame, block.steps.length - 1)] ?? ''}
      </div>
      <p className="demo-rule">
        {`${block.each} × 2 = ${stages[1]} · ${stages[1]} × 2 = ${stages[2]} · ${block.each} × 4 = ${stages[2]}`}
      </p>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** Count by a table, one landing at a time. */
export function CountByDemo({ block }: { block: Block<'count-by-demo'> }) {
  const total = Math.max(1, block.count);
  const { frame, done, replay, step } = useStepper(total);
  const shown = frame + 1;
  return (
    <figure className="demo demo-count">
      <span className="demo-badge">ვთვლი {block.table}-{block.table === 2 ? 'ად' : 'ით'}</span>
      <ol className="cb-landings" aria-label="ნაბიჯები">
        {tableRow(block.table, total).map((n, i) => (
          <li key={i} className={i <= frame ? 'is-on' : ''}>
            {n}
          </li>
        ))}
      </ol>
      <div className="demo-step" role="status" aria-live="polite">
        {block.steps[Math.min(frame, block.steps.length - 1)] ?? ''}
      </div>
      <p className="demo-rule">
        {`${shown} × ${block.table} = ${productOf(block.table, shown)} · ${skipText(block.table, shown)}`}
      </p>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** The table as a static picture, for an explanation. */
export function TablePicture({ table, upTo }: { table: number; upTo: number }) {
  return <TableRow table={table} upTo={upTo} />;
}
