import { useState } from 'react';
import type { ExploreTool, ExplainBlock, Glyph } from '../types';
import { DemoButtons, useStepper } from './Visuals';
import { GroupsBoardShare, ShareBoard, ShareBox } from './ShareBoard';
import { dealOut, factFamily, groupInto, groupsMade, quotientOf, shareText, totalOfCounts } from './ShareGeometry';

/**
 * Exploration labs and demonstrations for G2 U06. Every lab computes its answer from `(total, people)` or
 * `(total, size)`, so "everyone has the same" is a statement about the numbers.
 */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;
type Block<T extends ExplainBlock['type']> = Extract<ExplainBlock, { type: T }>;

/** Objects dealt out one at a time to characters, with the share and the leftovers always shown. */
export function ShareLab({ tool }: { tool: ToolOf<'share-lab'> }) {
  const glyph: Glyph = tool.glyph ?? 'apple';
  const [given, setGiven] = useState(0);
  const counts = dealOut(given, tool.people);
  // nothing has been dealt yet is not a fair share, even though every child holds the same (zero)
  const fair = given > 0 && counts.length > 0 && counts.every((n) => n === counts[0]);
  const remaining = tool.total - given;
  return (
    <div className="lab lab-share">
      <div className="shb-row">
        {Array.from({ length: tool.people }, (_, i) => (
          <ShareBox key={i} count={counts[i] ?? 0} index={i} glyph={glyph} />
        ))}
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-primary" disabled={given >= tool.total} onClick={() => setGiven((g) => Math.min(tool.total, g + 1))}>
          + ერთი საგანი
        </button>
        <button type="button" className="btn btn-ghost" disabled={given >= tool.total} onClick={() => setGiven(tool.total)}>
          დარიგე ყველა
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setGiven(0)}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        დარჩა {Math.max(0, remaining)}. {fair ? `✓ ყველა ბავშვს ${counts[0]} აქვს — თანაბრად დარიგდა.` : 'ჯერ არ არის თანაბრად დარიგებული.'}
      </p>
      <p className="lab-facts">
        <span>დარიგებულია: {totalOfCounts(counts)}</span>
        <span>დარჩა: {Math.max(0, remaining)}</span>
      </p>
    </div>
  );
}

/** Containers that the student fills until they are equal. */
export function ShareGroupsLab({ tool }: { tool: ToolOf<'share-groups-lab'> }) {
  const glyph: Glyph = tool.glyph ?? 'apple';
  const [counts, setCounts] = useState<number[]>(() => Array.from({ length: tool.groups }, () => 0));
  const used = totalOfCounts(counts);
  const fair = counts.every((n) => n === counts[0]) && used === tool.total;
  const bump = (i: number, by: number) => setCounts((all) => all.map((n, k) => (k === i ? Math.max(0, n + by) : n)));
  return (
    <div className="lab lab-share-groups">
      <div className="shb-row">
        {counts.map((c, i) => (
          <div key={i} className={`shbox is-basket ${fair ? 'is-fair' : ''}`}>
            <div className="shbox-dots" aria-hidden="true">
              {Array.from({ length: c }, (_, k) => (
                <span key={k} className="shbox-dot">
                  <i className="shbox-bead" />
                </span>
              ))}
            </div>
            <div className="shbox-acts">
              <button type="button" className="btn btn-ghost btn-small" disabled={c === 0} onClick={() => bump(i, -1)} aria-label={`${i + 1}-ე ჯგუფიდან წაიღე ერთი`}>
                −
              </button>
              <b className="shbox-count">{c}</b>
              <button type="button" className="btn btn-ghost btn-small" disabled={used >= tool.total || fair} onClick={() => bump(i, 1)} aria-label={`${i + 1}-ე ჯგუფს დაამატე ერთი`}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-ghost" onClick={() => setCounts(Array.from({ length: tool.groups }, () => Math.floor(tool.total / tool.groups)))}>
          გაათანაბრე
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setCounts(Array.from({ length: tool.groups }, () => 0))}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {fair ? `✓ თითოეულში ${counts[0]}. ${tool.total} ÷ ${tool.groups} = ${counts[0]}.` : `დარჩა ${Math.max(0, tool.total - used)} საგანი. ჯგუფები: ${counts.join(', ')}.`}
      </p>
      <p className="lab-facts">
        <span>სულ: {tool.total}</span>
        <span>ჯგუფები: {tool.groups}</span>
        <span>{glyph === 'ball' ? 'ბურთები' : 'საგნები'}</span>
      </p>
    </div>
  );
}

/** A share written as a division sentence, filling in as objects are dealt. */
export function DivisionLab({ tool }: { tool: ToolOf<'division-lab'> }) {
  const glyph: Glyph = tool.glyph ?? 'apple';
  const [given, setGiven] = useState(0);
  const counts = dealOut(given, tool.people);
  const full = given === tool.total;
  return (
    <div className="lab lab-division">
      <div className="shb-row">
        {counts.map((c, i) => (
          <ShareBox key={i} count={c} index={i} glyph={glyph} />
        ))}
      </div>
      <p className="shd-live" aria-label="გაყოფის წინადადება">
        <span>{given}</span> ÷ <span>{tool.people}</span> = <b>{given > 0 && given % tool.people === 0 ? given / tool.people : '?'}</b>
      </p>
      <div className="xt-row">
        <button type="button" className="btn btn-primary" disabled={full} onClick={() => setGiven((g) => Math.min(tool.total, g + 1))}>
          + ერთი
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setGiven(tool.total)}>
          დარიგე ყველა
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setGiven(0)}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {full
          ? `✓ ${tool.total} ÷ ${tool.people} = ${quotientOf(tool.total, tool.people) ?? '?'}. ${shareText(tool.total, tool.people)}`
          : `დარიგებულია ${given} — სულ ${tool.total}. გაყოფა დაიწერება, როცა ყველა დარიგდება.`}
      </p>
      <p className="lab-facts">
        <span>სულ: {tool.total}</span>
        <span>ბავშვები: {tool.people}</span>
        <span>თითოეულს: {quotientOf(tool.total, tool.people) ?? '—'}</span>
      </p>
    </div>
  );
}

/** Fill containers of a fixed size and count the complete ones. */
export function GroupIntoLab({ tool }: { tool: ToolOf<'group-into-lab'> }) {
  const glyph: Glyph = tool.glyph ?? 'apple';
  const [filled, setFilled] = useState(0);
  const { groups, leftover } = groupInto(filled, tool.size);
  const complete = groupsMade(filled, tool.size);
  return (
    <div className="lab lab-groupinto">
      <div className="shb-row">
        {complete.map((_, i) => (
          <ShareBox key={i} count={tool.size} index={i} glyph={glyph} kind="basket" />
        ))}
        {leftover > 0 && (
          <div className="shbox is-open" aria-label={`ნაშთი: ${leftover}`}>
            <div className="shbox-dots" aria-hidden="true">
              {Array.from({ length: leftover }, (_, k) => (
                <span key={k} className="shbox-dot">
                  <i className="shbox-bead" />
                </span>
              ))}
            </div>
            <b className="shbox-count">{leftover}</b>
          </div>
        )}
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-primary" disabled={filled >= tool.total} onClick={() => setFilled((f) => Math.min(tool.total, f + 1))}>
          + ერთი საგანი
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setFilled(tool.total)}>
          ყველა
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setFilled(0)}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {`${filled} საგანი ${tool.size}-ად: ${groups} სრული ჯგუფი, ნაშთი ${leftover}.`}
      </p>
      <p className="lab-facts">
        <span>სრული ჯგუფი: {groups}</span>
        <span>ნაშთი: {leftover}</span>
        <span>სულ: {filled} / {tool.total}</span>
      </p>
    </div>
  );
}

/** Build equal groups, then turn the same model round into a division fact. */
export function FamilyLab({ tool }: { tool: ToolOf<'family-lab'> }) {
  const [flipped, setFlipped] = useState(false);
  const family = factFamily(tool.a, tool.b);
  return (
    <div className="lab lab-family">
      <div className="xt-row">
        <button type="button" className={flipped ? 'btn btn-ghost' : 'btn btn-primary'} aria-pressed={!flipped} onClick={() => setFlipped(false)}>
          გამრავლება
        </button>
        <button type="button" className={flipped ? 'btn btn-primary' : 'btn btn-ghost'} aria-pressed={flipped} onClick={() => setFlipped(true)}>
          გაყოფა
        </button>
      </div>
      {flipped ? <ShareBoard total={family.product} people={tool.a} glyph="apple" /> : <GroupsBoardShare groups={tool.a} size={tool.b} glyph="apple" />}
      <p className="shfam-grid">
        <span className="shfam-line">{family.multiply}</span>
        <span className="shfam-line is-divide">{family.divideA}</span>
        <span className="shfam-line">{family.commuted}</span>
        <span className="shfam-line is-divide">{family.divideB}</span>
      </p>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {flipped
          ? `გაყოფა იკითხება: ${family.product} საგანი ${tool.a} ჯგუფად — თითოეულში ${tool.b}. ანუ ${family.divideA}.`
          : `გამრავლება იკითხება: ${tool.a} ჯგუფი, თითოეულში ${tool.b} — სულ ${family.product}. ანუ ${family.multiply}.`}
      </p>
      <p className="lab-facts">
        <span>{family.multiply}</span>
        <span>{family.divideA}</span>
        <span>{family.divideB}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── demonstrations ───────────────────────────

/** A fair share walked one object at a time, or a grouping. */
export function ShareDemo({ block }: { block: Block<'share-demo'> }) {
  const { frame, done, replay, step } = useStepper(block.total);
  const given = frame + 1;
  if (block.mode === 'group') {
    const { groups, leftover } = groupInto(given, block.people);
    return (
      <figure className="demo demo-share">
        <span className="demo-badge">ვაჯგუფებ {block.people}-ად</span>
        <div className="shb-row">
          {groupsMade(given, block.people).map((_, i) => (
            <ShareBox key={i} count={block.people} index={i} kind="basket" />
          ))}
        </div>
        <div className="demo-step" role="status" aria-live="polite">
          {block.steps[Math.min(frame, block.steps.length - 1)] ?? ''}
        </div>
        <p className="demo-rule">
          {`${given} საგანი ${block.people}-ად: ${groups} ჯგუფი, ნაშთი ${leftover}`}
        </p>
        {block.caption && <figcaption>{block.caption}</figcaption>}
        <DemoButtons done={done} replay={replay} step={step} />
      </figure>
    );
  }
  const counts = dealOut(given, block.people);
  return (
    <figure className="demo demo-share">
      <span className="demo-badge">ვანაწილებ თანაბრად</span>
      <div className="shb-row">
        {counts.map((c, i) => (
          <ShareBox key={i} count={c} index={i} />
        ))}
      </div>
      <div className="demo-step" role="status" aria-live="polite">
        {block.steps[Math.min(frame, block.steps.length - 1)] ?? ''}
      </div>
      <p className="demo-rule">
        {given % block.people === 0 ? `${given} ÷ ${block.people} = ${given / block.people}` : `${given} ÷ ${block.people} = ${Math.floor(given / block.people)}, ნაშთი ${given % block.people}`}
      </p>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** A share written out, for an explanation. */
export function SharePicture({ total, people, glyph }: { total: number; people: number; glyph?: Glyph }) {
  return <ShareBoard total={total} people={people} glyph={glyph ?? 'apple'} caption={shareText(total, people)} />;
}

/** The division fact that matches a share, for a caption. */
export const divisionLine = (total: number, people: number): string => `${total} ÷ ${people} = ${quotientOf(total, people) ?? '?'}`;
