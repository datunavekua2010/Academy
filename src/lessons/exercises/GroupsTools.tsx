import { useState } from 'react';
import type { ExploreTool, ExplainBlock } from '../types';
import { ArrayBoard, EqualBadge, GroupBox, EqualGroups, RepeatedLine } from './GroupsBoard';
import {
  allEqual,
  arrayByCols,
  arrayByRows,
  arrayTotal,
  arraysFor,
  groupsText,
  multiplyText,
  repeatedText,
  rowCells,
  runningTotals,
  sumOfGroupSizes,
  totalOf,
  turnArray,
  type ArraySpec,
} from './GroupsGeometry';
import { DemoButtons, useStepper } from './Visuals';

/**
 * Exploration labs and step-by-step demonstrations for G2 U04. The picture, the repeated addition and the multiplication
 * are always computed from the same two counts, so they can never tell three different stories.
 */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;
type Block<T extends ExplainBlock['type']> = Extract<ExplainBlock, { type: T }>;

// ─────────────────────────── the equal-groups lab ───────────────────────────

/** Move objects between groups until every group holds the same number. */
export function EqualGroupsLab({ tool }: { tool: ToolOf<'groups-equal-lab'> }) {
  const target = Math.max(1, tool.each);
  const [sizes, setSizes] = useState<number[]>(() => tool.sizes && tool.sizes.length > 0 ? tool.sizes : [target, target - 1, target + 1]);
  const equal = allEqual(sizes);
  const bump = (i: number, by: number) => setSizes((all) => all.map((n, k) => (k === i ? Math.max(0, Math.min(target + 4, n + by)) : n)));
  return (
    <div className="lab lab-equal">
      <div className="grp-row" role="group" aria-label="ჯგუფები">
        {sizes.map((count, i) => (
          <div key={i} className={`gbox ${count === sizes[0] && equal ? 'is-same' : 'is-odd'}`}>
            <div className="gbox-dots" aria-hidden="true">
              {Array.from({ length: count }, (_, k) => (
                <i key={k} />
              ))}
            </div>
            <div className="gbox-acts">
              <button type="button" className="btn btn-ghost btn-small" disabled={count === 0} onClick={() => bump(i, -1)} aria-label={`${i + 1}-ე ჯგუფიდან წაიღე ერთი`}>
                −
              </button>
              <b className="gbox-count">{count}</b>
              <button type="button" className="btn btn-ghost btn-small" onClick={() => bump(i, 1)} aria-label={`${i + 1}-ე ჯგუფს დაამატე ერთი`}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-ghost" onClick={() => setSizes(Array.from({ length: sizes.length }, () => target))}>
          გაათანაბრე
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setSizes((all) => [...all, target])}>
          + კიდევ ერთი ჯგუფი
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setSizes(tool.sizes && tool.sizes.length > 0 ? tool.sizes : [target, target - 1, target + 1])}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-facts">
        <EqualBadge sizes={sizes} />
        <span>სულ: {sumOfGroupSizes(sizes)}</span>
        <span>ჯგუფები: {sizes.length}</span>
      </p>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {equal
          ? `✓ ყველა ჯგუფში ${sizes[0]} საგანია. სულ ${sumOfGroupSizes(sizes)} — ეს არის ${multiplyText(sizes.length, sizes[0])}.`
          : `ჯგუფები არ არის ტოლი: ${sizes.join(', ')}. სულ ${sumOfGroupSizes(sizes)}, მაგრამ ტოლი ჯგუფებისთვის თითოეულში ერთი და იგივე რაოდენობა უნდა იყოს.`}
      </p>
    </div>
  );
}

// ─────────────────────────── the repeated-addition lab ───────────────────────────

/** Add one group at a time and watch the repeated addition grow. */
export function RepeatLab({ tool }: { tool: ToolOf<'repeat-lab'> }) {
  const [groups, setGroups] = useState(1);
  const each = Math.max(1, tool.each);
  const max = Math.max(1, tool.maxGroups);
  const totals = runningTotals(groups, each);
  return (
    <div className="lab lab-repeat">
      <div className="grp-row">
        {Array.from({ length: groups }, (_, i) => (
          <GroupBox key={i} count={each} index={i} tone="same" />
        ))}
      </div>
      <p className="rep-line" aria-label={`განმეორებითი შეკრება: ${repeatedText(groups, each)}`}>
        {Array.from({ length: groups }, (_, i) => (
          <span key={i} className="rep-term">
            {each}
            {i < groups - 1 ? ' + ' : ''}
          </span>
        ))}
        <span className="rep-total"> = {totalOf(groups, each)}</span>
      </p>
      <div className="xt-row">
        <button type="button" className="btn btn-primary" disabled={groups >= max} onClick={() => setGroups((g) => g + 1)}>
          + ერთი ჯგუფი ({each})
        </button>
        <button type="button" className="btn btn-ghost" disabled={groups <= 1} onClick={() => setGroups((g) => g - 1)}>
          − ერთი ჯგუფი
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setGroups(1)}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {`${groupsText(groups, each)}: ${repeatedText(groups, each)}. განმეორებითი შეკრება იგივეა, რაც ${multiplyText(groups, each)}.`}
      </p>
      <p className="lab-facts">
        <span>ჯგუფები: {groups}</span>
        <span>თითოეულში: {each}</span>
        <span>სულ: {totals[totals.length - 1] ?? 0}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── the multiplication lab ───────────────────────────

/** Change the number of groups and what is in each; four ways of writing the same number update together. */
export function MultiplyLab({ tool }: { tool: ToolOf<'multiply-lab'> }) {
  const [groups, setGroups] = useState(Math.max(1, Math.min(tool.maxGroups, tool.start.groups)));
  const [each, setEach] = useState(Math.max(1, Math.min(tool.maxEach, tool.start.each)));
  const total = totalOf(groups, each);
  return (
    <div className="lab lab-mult">
      <div className="lab-sliders">
        <label className="gab-slider">
          <span>ჯგუფები</span>
          <input type="range" min={1} max={tool.maxGroups} value={groups} onChange={(e) => setGroups(Number(e.target.value))} aria-label="ჯგუფების რაოდენობა" />
          <b>{groups}</b>
        </label>
        <label className="gab-slider">
          <span>თითოეულში</span>
          <input type="range" min={1} max={tool.maxEach} value={each} onChange={(e) => setEach(Number(e.target.value))} aria-label="თითოეულ ჯგუფში საგნების რაოდენობა" />
          <b>{each}</b>
        </label>
      </div>
      <EqualGroups groups={groups} each={each} />
      <p className="lab-facts">
        <span>{repeatedText(groups, each)}</span>
        <span>{multiplyText(groups, each)}</span>
        <span>სულ: {total}</span>
      </p>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {`${groups} ჯგუფი, თითოეულში ${each} → ${groups} × ${each} = ${total}. ${each} × ${groups} = ${totalOf(each, groups)} — იგივე რიცხვია.`}
      </p>
    </div>
  );
}

// ─────────────────────────── the array lab ───────────────────────────

/** Arrange counters into rows and columns, then turn the array and watch the total stay the same. */
export function ArrayLab({ tool }: { tool: ToolOf<'array-lab'> }) {
  const [spec, setSpec] = useState<ArraySpec>({ rows: tool.start.rows, cols: tool.start.cols });
  const [turned, setTurned] = useState(false);
  const shown = turned ? turnArray(spec) : spec;
  const total = arrayTotal(shown);
  const facts = arraysFor(total);
  return (
    <div className="lab lab-array">
      <div className="lab-sliders">
        <label className="gab-slider">
          <span>რიგები</span>
          <input type="range" min={1} max={tool.max} value={spec.rows} onChange={(e) => { setSpec({ rows: Number(e.target.value), cols: spec.cols }); setTurned(false); }} aria-label="რიგების რაოდენობა" />
          <b>{spec.rows}</b>
        </label>
        <label className="gab-slider">
          <span>სვეტები</span>
          <input type="range" min={1} max={tool.max} value={spec.cols} onChange={(e) => { setSpec({ rows: spec.rows, cols: Number(e.target.value) }); setTurned(false); }} aria-label="სვეტების რაოდენობა" />
          <b>{spec.cols}</b>
        </label>
      </div>
      <ArrayBoard spec={shown} />
      <div className="xt-row">
        <button type="button" className={turned ? 'btn btn-ghost' : 'btn btn-primary'} onClick={() => setTurned((t) => !t)} aria-pressed={turned}>
          ⟳ მართკუთხედის მოტრიალება
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => { setSpec({ rows: tool.start.rows, cols: tool.start.cols }); setTurned(false); }}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {turned
          ? `მოტრიალების შემდეგ ${shown.rows} რიგი და ${shown.cols} სვეტია. სულ ისევ ${total}: ${arrayByRows(shown)} — ოდენობა არ შეცვლილა.`
          : `${spec.rows} რიგი × ${spec.cols} = ${total}. ${arrayByRows(shown)} = ${arrayByCols(shown)}.`}
      </p>
      <p className="lab-facts">
        <span>სულ: {total}</span>
        <span>მართკუთხედები: {facts.slice(0, 4).map((f) => `${f.rows}×${f.cols}`).join(', ')}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── the checking with groups lab ───────────────────────────

/** Solve illustrated group/array problems, choosing a model and calculating the total. */
export function GroupStoryLab({ tool }: { tool: ToolOf<'group-story-lab'> }) {
  const [which, setWhich] = useState(0);
  const [answer, setAnswer] = useState('');
  const [model, setModel] = useState<'groups' | 'array' | null>(null);
  const story = tool.stories[which] ?? tool.stories[0];
  const total = totalOf(story.groups, story.each);
  const right = Number(answer) === total;
  const reset = (i: number) => {
    setWhich(i);
    setAnswer('');
    setModel(null);
  };
  return (
    <div className="lab lab-gstory">
      <div className="xt-modes" role="group" aria-label="ამოცანის არჩევა">
        {tool.stories.map((s, i) => (
          <button key={s.text} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => reset(i)}>
            {`ამოცანა ${i + 1}`}
          </button>
        ))}
      </div>
      <blockquote className="stb-story">{story.text}</blockquote>
      <div className="stb-pick" role="radiogroup" aria-label="როგორ გამოვსახოთ?">
        {(['groups', 'array'] as const).map((m) => (
          <label key={m} className={`lp-choice ${model === m ? 'is-selected' : ''}`}>
            <input type="radio" name="lab-model" value={m} checked={model === m} onChange={() => setModel(m)} />
            <span className="lp-choice-dot" aria-hidden="true" />
            <span className="lp-choice-text">{m === 'groups' ? 'ტოლი ჯგუფები' : 'მართკუთხედი (რიგები და სვეტები)'}</span>
          </label>
        ))}
      </div>
      {model === 'groups' && <EqualGroups groups={story.groups} each={story.each} />}
      {model === 'array' && <ArrayBoard spec={{ rows: story.groups, cols: story.each }} />}
      <label className="stb-slot">
        <span>სულ ({story.unit})</span>
        <input type="text" inputMode="numeric" value={answer} onChange={(e) => setAnswer(e.target.value.replace(/[^\d]/g, ''))} aria-label="სულ რაოდენობა" />
      </label>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {right
          ? `✓ სწორია: ${story.groups} × ${story.each} = ${total} ${story.unit}. ${repeatedText(story.groups, story.each)}.`
          : answer === ''
            ? 'აირჩიე მოდელი და ჩაწერე სულ რაოდენობა.'
            : `${story.groups} × ${story.each} = ${total}. ჯერ დაითვალე ჯგუფები და თითოეულში საგნები.`}
      </p>
    </div>
  );
}

// ─────────────────────────── demonstrations ───────────────────────────

/** Groups appear one at a time, and the repeated addition grows with them. */
export function GroupsDemo({ block }: { block: Block<'groups-demo'> }) {
  const { frame, done, replay, step } = useStepper(block.groups + 1);
  const shown = Math.min(block.groups, frame);
  const totals = runningTotals(shown, block.each);
  return (
    <figure className="demo demo-groups">
      <span className="demo-badge">{block.equal ? 'ტოლი ჯგუფები' : 'ჯგუფები'}</span>
      <EqualGroups groups={Math.max(1, shown)} each={block.each} />
      <ol className="demo-bars" aria-label="ნაბიჯები">
        {block.steps.map((text, i) => (
          <li key={text} className={i === Math.min(frame, block.steps.length - 1) ? 'is-on' : ''}>
            {text}
          </li>
        ))}
      </ol>
      <p className="demo-rule">
        {shown > 0 ? `${repeatedText(shown, block.each)} · ${multiplyText(shown, block.each)}` : `${block.each} საგანი თითოეულ ჯგუფში`}
        {totals.length > 0 ? ` · სულ ${totals[totals.length - 1]}` : ''}
      </p>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** An array is read by rows, then by columns, then turned — and the total never moves. */
export function ArrayDemo({ block }: { block: Block<'array-demo'> }) {
  const spec: ArraySpec = { rows: block.rows, cols: block.cols };
  const { frame, done, replay, step } = useStepper(4);
  const turned = frame >= 2;
  const shown = turned ? turnArray(spec) : spec;
  return (
    <figure className="demo demo-array">
      <span className="demo-badge">{turned ? 'მოტრიალებული' : 'მართკუთხედი'}</span>
      <ArrayBoard spec={shown} />
      {frame >= 1 && (
        <p className="demo-rule">
          {turned ? `${arrayByRows(shown)} = ${arrayByCols(shown)} · სულ ${arrayTotal(shown)}` : `${spec.rows} × ${spec.cols} = ${arrayTotal(spec)} · ${arrayByRows(spec)}`}
        </p>
      )}
      <div className="demo-step" role="status" aria-live="polite">
        {block.steps[Math.min(frame, block.steps.length - 1)] ?? ''}
      </div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** The four ways of writing the same number, shown together. */
export function FourWaysDemo({ block }: { block: Block<'four-ways'> }) {
  const { frame, done, replay, step } = useStepper(4);
  const total = totalOf(block.groups, block.each);
  return (
    <figure className="demo demo-four">
      <span className="demo-badge">ოთხი გზა</span>
      <EqualGroups groups={block.groups} each={block.each} />
      <ol className="demo-bars" aria-label="ოთხი გზა">
        {[`სურათი: ${groupsText(block.groups, block.each)}`, `განმეორებითი შეკრება: ${repeatedText(block.groups, block.each)}`, `გამრავლება: ${multiplyText(block.groups, block.each)}`, `სულ: ${total}`].map((text, i) => (
          <li key={text} className={i === frame ? 'is-on' : i < frame ? 'is-done' : ''}>
            {text}
          </li>
        ))}
      </ol>
      <p className="demo-rule">{`${multiplyText(block.groups, block.each)} · ${multiplyText(block.each, block.groups)} — ორივე ${total}-ია.`}</p>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** A static repeated addition with its multiplication, for an explanation. */
export function RepeatedPicture({ groups, each }: { groups: number; each: number }) {
  return <RepeatedLine groups={groups} each={each} />;
}

/** The cells of an array, so a test (or a board) can count objects without reading the picture. */
export const arrayCells = rowCells;

/** A quick sentence for a lab: what the numbers say right now. */
export const groupsSentence = (groups: number, each: number): string => `${groupsText(groups, each)}: ${repeatedText(groups, each)}.`;

/** The rows × columns sentence, for a caption. */
export const arraySentence = (spec: ArraySpec): string => `${spec.rows} რიგი × ${spec.cols} = ${arrayTotal(spec)}`;

/** Group boxes for a static picture, exported so a test can drive them. */
export const groupBox = GroupBox;
