import { useState } from 'react';
import type { ChartSpecData, ResponseSpec, SortAttr, SortObjSpec } from '../types';
import { chartMost, chartLeast, chartCount, type ChartSpec, type SortObj } from './SortGeometry';
import { GridBoard, PictureChart, SortIntoGroups, VennBoard, valueLabel } from './SortBoard';

/**
 * Answer controls for Unit 10 (sorting, Venn diagrams, picture charts). Presentation only — `check.ts` decides what
 * is right, from each object's own attributes and from the symbols actually in a chart.
 */

type SortGroupsResponse = Extract<ResponseSpec, { type: 'sort-groups' }>;
type SortGridResponse = Extract<ResponseSpec, { type: 'sort-grid' }>;
type VennSortResponse = Extract<ResponseSpec, { type: 'venn-sort' }>;
type ChartReadResponse = Extract<ResponseSpec, { type: 'chart-read' }>;
type ChartBuildResponse = Extract<ResponseSpec, { type: 'chart-build' }>;

/** A stored sort object is already the object the geometry uses; this keeps the cast in one place. */
export const sortObjects = (objects: SortObjSpec[]): SortObj[] => objects as SortObj[];

/** The groups a `sort-groups` question offers, in a stable order. */
export function groupsOf(objects: SortObjSpec[], attr: SortAttr): string[] {
  const seen: string[] = [];
  for (const obj of objects) {
    const v = obj[attr];
    if (!seen.includes(v)) seen.push(v);
  }
  return seen;
}

/** Sort a collection into the groups of one attribute. */
export function SortGroupsAnswer({ response, value, onChange, disabled, label }: { response: SortGroupsResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const objects = sortObjects(response.objects);
  const placement = objects.map((_, i) => (value ? value.split(',')[i] ?? '' : ''));
  return (
    <div className="sga">
      <p className="sga-task">
        დაალაგე საგნები <strong>{response.attr === 'colour' ? 'ფერის' : response.attr === 'kind' ? 'ფორმის' : 'ზომის'}</strong> მიხედვით.
      </p>
      <SortIntoGroups
        objects={objects}
        attr={response.attr}
        groups={groupsOf(response.objects, response.attr)}
        placement={placement}
        onChange={(next) => onChange(next.join(','))}
        disabled={disabled}
        label={label}
      />
    </div>
  );
}

/** Sort a collection into a two-way grid. */
export function SortGridAnswer({ response, value, onChange, disabled, label }: { response: SortGridResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const objects = sortObjects(response.objects);
  const placement = objects.map((_, i) => (value ? value.split(',')[i] ?? '' : ''));
  return (
    <div className="gda">
      <p className="gda-task">
        დაალაგე საგნები ორმხრივ ცხრილში: <strong>{valueLabel(response.rowAttr, '')}</strong> და{' '}
        <strong>{valueLabel(response.colAttr, '')}</strong>.
      </p>
      <GridBoard
        objects={objects}
        rowAttr={response.rowAttr}
        colAttr={response.colAttr}
        rowValues={response.rows}
        colValues={response.cols}
        placement={placement}
        onChange={(next) => onChange(next.join(','))}
        disabled={disabled}
        label={label}
      />
    </div>
  );
}

/** Sort a collection into two overlapping circles. */
export function VennSortAnswer({ response, value, onChange, disabled, label }: { response: VennSortResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const objects = sortObjects(response.objects);
  const placement = objects.map((_, i) => (value ? value.split(',')[i] ?? '' : ''));
  return (
    <div className="vna">
      <p className="vna-task">
        ჩადე საგნები ორ გადამკვეთ წრეში: <strong>{valueLabel(response.leftAttr, response.leftValue)}</strong> და{' '}
        <strong>{valueLabel(response.rightAttr, response.rightValue)}</strong>.
      </p>
      <VennBoard
        objects={objects}
        leftLabel={valueLabel(response.leftAttr, response.leftValue)}
        rightLabel={valueLabel(response.rightAttr, response.rightValue)}
        placement={placement}
        onChange={(next) => onChange(next.join(','))}
        disabled={disabled}
        label={label}
      />
    </div>
  );
}

/** Read a picture chart and answer the question about it. */
export function ChartReadAnswer({ response, value, onChange, disabled, label }: { response: ChartReadResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const chart: ChartSpec = { glyph: response.chart.glyph, rows: response.chart.rows };
  const askWord =
    response.ask === 'most'
      ? 'რომელ კატეგორიაშია ყველაზე მეტი?'
      : response.ask === 'least'
        ? 'რომელ კატეგორიაშია ყველაზე ნაკლები?'
        : response.ask === 'same'
          ? 'რომელ კატეგორიას აქვს იგივე რაოდენობა, რაც სხვას?'
          : response.ask === 'more'
            ? `რომელ კატეგორიაშია მეტი, ვიდრე ${response.compareWith}?`
            : `რომელ კატეგორიაშია ნაკლები, ვიდრე ${response.compareWith}?`;
  return (
    <div className="cra" role="group" aria-label={label}>
      <p className="cra-task">{askWord}</p>
      <PictureChart chart={chart} label="ნახატი დიაგრამა" />
      <div className="lp-choices cra-choices" role="radiogroup" aria-label="პასუხის ვარიანტები">
        {response.chart.rows.map((row) => {
          const on = value === row.label;
          return (
            <label key={row.label} className={`lp-choice ${on ? 'is-selected' : ''} ${disabled ? 'is-locked' : ''}`}>
              <input type="radio" name={label} value={row.label} checked={on} disabled={disabled} onChange={() => onChange(row.label)} />
              <span className="lp-choice-dot" aria-hidden="true" />
              <span className="lp-choice-text">
                {row.label} <span className="cra-count">({row.count})</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/** Build a picture chart until each row matches what was asked. */
export function ChartBuildAnswer({ response, value, onChange, disabled, label }: { response: ChartBuildResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const counts = response.labels.map((_, i) => (value ? Number(value.split(',')[i] ?? 0) || 0 : 0));
  const chart: ChartSpec = { glyph: response.glyph, rows: response.labels.map((l, i) => ({ label: l, count: counts[i] })) };
  const set = (i: number, n: number) => onChange(counts.map((c, k) => (k === i ? Math.max(0, n) : c)).join(','));
  return (
    <div className="cba">
      <p className="cba-task">
        შეავსე დიაგრამა ისე, რომ თითოეულ რიგში იყოს სწორედ ის რაოდენობა, რაც მოცემულია.
      </p>
      <ul className="cba-targets">
        {response.labels.map((l, i) => (
          <li key={l}>
            <strong>{l}</strong>: {response.target[i]} {'●'.repeat(Math.min(response.target[i], 10))}
            {response.target[i] > 10 ? '…' : ''}
          </li>
        ))}
      </ul>
      <PictureChart
        chart={chart}
        label={label}
        onAdd={(l) => set(response.labels.indexOf(l), (counts[response.labels.indexOf(l)] ?? 0) + 1)}
        onRemove={(l) => set(response.labels.indexOf(l), (counts[response.labels.indexOf(l)] ?? 0) - 1)}
        disabled={disabled}
      />
    </div>
  );
}

// ─────────────────────────── words ───────────────────────────

/** The answer to a chart question, worked out from the symbols: used by feedback and by tests. */
export function chartAnswer(response: { chart: ChartSpecData; ask: string; compareWith?: string }): string[] {
  const chart: ChartSpec = { glyph: response.chart.glyph, rows: response.chart.rows };
  if (response.ask === 'most') return chartMost(chart);
  if (response.ask === 'least') return chartLeast(chart);
  const other = response.compareWith ?? '';
  const oc = chartCount(chart, other);
  if (response.ask === 'more') return chart.rows.filter((r) => r.count > oc).map((r) => r.label);
  return chart.rows.filter((r) => r.count < oc).map((r) => r.label);
}

/** A chart row said in words: "ვაშლი: 4". */
export const rowWords = (label: string, count: number): string => `${label}: ${count}`;

/** The count of a row, for a prompt. */
export const countOf = (chart: ChartSpecData, label: string): number => chart.rows.find((r) => r.label === label)?.count ?? 0;

/** Re-exported so lessons and tests reach one board module. */
export { GridBoard, PictureChart, VennBoard, SortIntoGroups };

/** A tiny state helper for a board that needs to keep its own selection out of the answer string. */
export function useCounts(labels: string[], initial: number[] = []): [number[], (next: number[]) => void] {
  const [counts, setCounts] = useState<number[]>(labels.map((_, i) => initial[i] ?? 0));
  return [counts, setCounts];
}
