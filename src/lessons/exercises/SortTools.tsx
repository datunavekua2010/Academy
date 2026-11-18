import { useState } from 'react';
import type { ExplainBlock, ExploreTool } from '../types';
import {
  ATTR_BY,
  ATTR_NAME,
  chartCount,
  chartCompareText,
  chartLeast,
  chartMost,
  groupsBy,
  type Attr,
  type ChartSpec,
  type SortObj,
} from './SortGeometry';
import { ClueBoard, GridBoard, PictureChart, SortChip, SortIntoGroups, VennBoard, valueLabel } from './SortBoard';
import { sortObjects } from './SortAnswers';

/**
 * Explore tools and explain demos for Unit 10. Every group, cell and region is computed from the objects' own
 * attributes (`SortGeometry`), so what a student sees is always what the sorting rule says.
 */

type SortLabTool = Extract<ExploreTool, { tool: 'sort-lab' }>;
type GridLabTool = Extract<ExploreTool, { tool: 'grid-lab' }>;
type VennLabTool = Extract<ExploreTool, { tool: 'venn-lab' }>;
type ChartLabTool = Extract<ExploreTool, { tool: 'chart-lab' }>;

/** Sort the same collection by different attributes, one at a time. */
export function SortLab({ tool }: { tool: SortLabTool }) {
  const [attr, setAttr] = useState<Attr>(tool.attrs[0] ?? 'colour');
  const objects = sortObjects(tool.objects);
  const groups = groupsBy(objects, attr);
  return (
    <div className="lab lab-sort">
      <div className="lab-head" role="radiogroup" aria-label="რა ნიშნით დავალაგო">
        {tool.attrs.map((a) => (
          <label key={a} className={`twopan-side ${attr === a ? 'is-on' : ''}`}>
            <input type="radio" name="sort-lab-attr" value={a} checked={attr === a} onChange={() => setAttr(a)} />
            {ATTR_NAME[a]}
          </label>
        ))}
      </div>
      <div className="lab-sort-groups">
        {groups.map((g) => (
          <section key={g.value} className="lab-sort-group" aria-label={valueLabel(attr, g.value)}>
            <h4>{valueLabel(attr, g.value)} <small>({g.objects.length})</small></h4>
            <div className="lab-sort-items">
              {g.objects.map((o) => (
                <SortChip key={o.id} obj={o} size={46} />
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        ვახარისხებ {ATTR_BY[attr]}: {groups.map((g) => `${valueLabel(attr, g.value)} — ${g.objects.length}`).join(', ')}.
      </p>
    </div>
  );
}

/** Fill a two-way grid and watch each cell hold exactly one pair of attributes. */
export function GridLab({ tool }: { tool: GridLabTool }) {
  const objects = sortObjects(tool.objects);
  const [placement, setPlacement] = useState<string[]>(objects.map(() => ''));
  const filled = placement.every((p) => p);
  const open = placement.filter((p) => !p).length;
  return (
    <div className="lab lab-grid">
      <GridBoard
        objects={objects}
        rowAttr={tool.rowAttr}
        colAttr={tool.colAttr}
        rowValues={tool.rows}
        colValues={tool.cols}
        placement={placement}
        onChange={setPlacement}
        label="ორმხრივი ცხრილი"
      />
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {open > 0 ? `დარჩა ${open} საგანი. თითოეულ უჯრაში მხოლოდ ის საგნებია, რომლებსაც ორივე ნიშანი ემთხვევა.` : 'ყველა საგანი უჯრაშია. შეამოწმე, რომ ყველა უჯრაში მხოლოდ შესაბამისი საგნებია.'}
      </p>
      {!filled && (
        <button type="button" className="btn btn-ghost btn-small" disabled={placement.every((p) => !p)} onClick={() => setPlacement(objects.map(() => ''))}>
          ↻ თავიდან
        </button>
      )}
    </div>
  );
}

/** Sort into two overlapping circles; the pair of groups can be switched. */
export function VennLab({ tool }: { tool: VennLabTool }) {
  const [pair, setPair] = useState(0);
  const objects = sortObjects(tool.objects);
  const [placement, setPlacement] = useState<string[]>(objects.map(() => ''));
  const current = tool.pairs[Math.min(pair, tool.pairs.length - 1)];
  const fill = () => {
    const next = objects.map((o) => {
      const inLeft = o[current.leftAttr] === current.leftValue;
      const inRight = o[current.rightAttr] === current.rightValue;
      return inLeft && inRight ? 'both' : inLeft ? 'left' : inRight ? 'right' : 'none';
    });
    setPlacement(next);
  };
  return (
    <div className="lab lab-venn">
      <div className="lab-head">
        {tool.pairs.map((p, i) => (
          <button
            key={i}
            type="button"
            className={`btn btn-ghost btn-small ${i === pair ? 'is-on' : ''}`}
            onClick={() => {
              setPair(i);
              setPlacement(objects.map(() => ''));
            }}
          >
            {valueLabel(p.leftAttr, p.leftValue)} / {valueLabel(p.rightAttr, p.rightValue)}
          </button>
        ))}
      </div>
      <VennBoard
        objects={objects}
        leftLabel={valueLabel(current.leftAttr, current.leftValue)}
        rightLabel={valueLabel(current.rightAttr, current.rightValue)}
        placement={placement}
        onChange={setPlacement}
        label="ვენის დიაგრამა"
      />
      <button type="button" className="btn btn-ghost btn-small" onClick={fill}>
        აჩვენე სწორი განლაგება
      </button>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        ორივე წრეში ერთდროულად ხვდება ის საგანი, რომელსაც ორივე ნიშანი აქვს. არც ერთში — ის, რომელსაც არც ერთი არ აქვს.
      </p>
    </div>
  );
}

/** Build a chart symbol by symbol and read the counts back. */
export function ChartLab({ tool }: { tool: ChartLabTool }) {
  const [counts, setCounts] = useState<number[]>(tool.labels.map(() => 0));
  const chart: ChartSpec = { glyph: tool.glyph, rows: tool.labels.map((label, i) => ({ label, count: counts[i] ?? 0 })) };
  const total = counts.reduce((a, b) => a + b, 0);
  return (
    <div className="lab lab-chart">
      <PictureChart
        chart={chart}
        label="ნახატი დიაგრამა"
        onAdd={(label) => setCounts(tool.labels.map((l, i) => (l === label ? (counts[i] ?? 0) + 1 : counts[i] ?? 0)))}
        onRemove={(label) => setCounts(tool.labels.map((l, i) => (l === label ? Math.max(0, (counts[i] ?? 0) - 1) : counts[i] ?? 0)))}
      />
      <div className="lab-head">
        {tool.target && (
          <button type="button" className="btn btn-ghost btn-small" onClick={() => setCounts(tool.target ?? [])}>
            ↻ შეავსე მოცემული რაოდენობით
          </button>
        )}
        <button type="button" className="btn btn-ghost btn-small" disabled={total === 0} onClick={() => setCounts(tool.labels.map(() => 0))}>
          ↻ გასუფთავება
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {total === 0
          ? 'დაამატე სიმბოლოები. თითო სიმბოლო — ერთი საგანი.'
          : `სულ ${total} საგანი. ყველაზე მეტი: ${chartMost(chart).join(', ')}. ყველაზე ნაკლები: ${chartLeast(chart).join(', ')}.`}
      </p>
    </div>
  );
}

// ═══════════════════════════ explain demos ═══════════════════════════

/** The sorting story: one attribute, then two, then overlapping circles. */
export function SortDemo({ block }: { block: Extract<ExplainBlock, { type: 'sort-demo' }> }) {
  const [step, setStep] = useState(0);
  const shown = Math.min(step, block.steps.length - 1);
  const objects = sortObjects(block.objects);
  const groups = groupsBy(objects, block.attr);
  return (
    <div className="srt-demo">
      {block.mode === 'one' && (
        <div className="lab-sort-groups">
          {groups.map((g) => (
            <section key={g.value} className="lab-sort-group" aria-label={valueLabel(block.attr, g.value)}>
              <h4>{valueLabel(block.attr, g.value)}</h4>
              <div className="lab-sort-items">
                {(shown >= 1 ? g.objects : []).map((o) => (
                  <SortChip key={o.id} obj={o} size={44} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      {block.mode === 'two' && block.second && (
        <div className="srt-demo-grid">
          {groups.map((g) => (
            <div key={g.value} className="srt-demo-row">
              <h4>{valueLabel(block.attr, g.value)}</h4>
              <div className="lab-sort-items">
                {(shown >= 1 ? g.objects : []).map((o) => (
                  <span key={o.id} className="srt-demo-pair">
                    <SortChip obj={o} size={40} />
                    {shown >= 2 && <small>{valueLabel(block.second as Attr, o[block.second as Attr])}</small>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {block.mode === 'venn' && (
        <VennBoard
          objects={objects}
          leftLabel={valueLabel(block.attr, block.leftValue ?? '')}
          rightLabel={valueLabel(block.second ?? 'kind', block.rightValue ?? '')}
          placement={shown < 1 ? objects.map(() => '') : objects.map((o) => {
            const inLeft = o[block.attr] === block.leftValue;
            const inRight = o[block.second ?? 'kind'] === block.rightValue;
            return inLeft && inRight ? 'both' : inLeft ? 'left' : inRight ? 'right' : 'none';
          })}
          onChange={() => undefined}
          disabled
          label="ვენის დიაგრამა"
        />
      )}
      <ol className="ms-steps">
        {block.steps.map((text, i) => (
          <li key={text} className={i === shown ? 'is-on' : i < shown ? 'is-past' : ''}>
            {i === shown && <span aria-hidden="true">▸ </span>}
            {text}
          </li>
        ))}
      </ol>
      <div className="demo-buttons">
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={shown === 0}>
          ← უკან
        </button>
        <button type="button" className="btn btn-primary btn-small" onClick={() => setStep((s) => Math.min(s + 1, block.steps.length - 1))} disabled={shown >= block.steps.length - 1}>
          შემდეგ →
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setStep(0)} disabled={shown === 0}>
          ↻ თავიდან
        </button>
      </div>
      {block.caption && <p className="ms-caption">{block.caption}</p>}
    </div>
  );
}

/** The picture-chart story: symbols appear, then the chart is read back. */
export function ChartDemo({ block }: { block: Extract<ExplainBlock, { type: 'chart-demo' }> }) {
  const [step, setStep] = useState(0);
  const shown = Math.min(step, block.steps.length - 1);
  // each step reveals one more symbol per row, in reading order
  const perRow = shown;
  const chart: ChartSpec = { glyph: block.glyph, rows: block.rows.map((r) => ({ label: r.label, count: Math.min(r.count, perRow) })) };
  return (
    <div className="pc-demo">
      <PictureChart chart={chart} label="ნახატი დიაგრამა" />
      <ol className="ms-steps">
        {block.steps.map((text, i) => (
          <li key={text} className={i === shown ? 'is-on' : i < shown ? 'is-past' : ''}>
            {i === shown && <span aria-hidden="true">▸ </span>}
            {text}
          </li>
        ))}
      </ol>
      {shown >= (block.steps.length - 1) && (
        <p className="ms-caption">{block.rows.map((r) => `${r.label}: ${chartCount({ glyph: block.glyph, rows: block.rows }, r.label)}`).join(' · ')}</p>
      )}
      <div className="demo-buttons">
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={shown === 0}>
          ← უკან
        </button>
        <button type="button" className="btn btn-primary btn-small" onClick={() => setStep((s) => Math.min(s + 1, block.steps.length - 1))} disabled={shown >= block.steps.length - 1}>
          შემდეგ →
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setStep(0)} disabled={shown === 0}>
          ↻ თავიდან
        </button>
      </div>
      {block.caption && <p className="ms-caption">{block.caption}</p>}
    </div>
  );
}

// ═══════════════════════════ the router ═══════════════════════════

export function ExploreToolViewSort({ tool }: { tool: ExploreTool }) {
  switch (tool.tool) {
    case 'sort-lab':
      return <SortLab tool={tool} />;
    case 'grid-lab':
      return <GridLab tool={tool} />;
    case 'venn-lab':
      return <VennLab tool={tool} />;
    case 'chart-lab':
      return <ChartLab tool={tool} />;
    default:
      return null;
  }
}

// ═══════════════════════════ small helpers ═══════════════════════════

/** A comparison in words, for a caption. */
export const compareWords = (chart: ChartSpec, a: string, b: string): string => chartCompareText(chart, a, b);

/** The objects a group holds, said in words. */
export const groupWords = (objects: SortObj[], attr: Attr): string => groupsBy(objects, attr).map((g) => `${valueLabel(attr, g.value)}: ${g.objects.length}`).join(' · ');

/** Re-exported so a lesson can show a sorting board without importing the board twice. */
export { SortIntoGroups, GridBoard, ClueBoard };
