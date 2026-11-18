import { useState } from 'react';
import type { ExploreTool, ExplainBlock } from '../types';
import { CounterBoard, type Counts } from './CounterBoard';
import { FrameBoard, cellsFor, countCells, type Cell } from './FrameBoard';
import { NumberBond } from './NumberBond';
import { ObjectField } from './Objects';
import { DemoButtons, useStepper } from './Visuals';

/**
 * Explore tools and the animated demonstration for number bonds (Grade 1 · Unit 3). Nothing here is
 * graded. In every tool the numbers come from the same state as the pictures, so the number bond
 * can never disagree with the counters.
 */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;

// ─────────────── a whole splits into two parts and joins again ───────────────

const defaultSplit = (whole: number): number => Math.floor(whole / 2);

export function BondSplit({ spec }: { spec: ToolOf<'bond-split'> }) {
  const [min, max] = spec.wholes;
  const [whole, setWhole] = useState(spec.start.whole);
  const [a, setA] = useState(spec.start.a);
  const [together, setTogether] = useState(false);
  const b = whole - a;
  const counts: Counts = together ? [whole, 0, 0] : [0, a, b];

  const chooseWhole = (w: number) => {
    setWhole(w);
    setA(w === spec.start.whole ? spec.start.a : defaultSplit(w));
    setTogether(false);
  };
  const reset = () => {
    setA(whole === spec.start.whole ? spec.start.a : defaultSplit(whole));
    setTogether(false);
  };
  return (
    <div className="xt">
      <div className="xt-modes" role="group" aria-label="მთელის არჩევა">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((w) => (
          <button key={w} type="button" className={`xt-mode xt-num ${w === whole ? 'is-on' : ''}`} aria-pressed={w === whole} aria-label={`მთელი ${w}`} onClick={() => chooseWhole(w)}>
            {w}
          </button>
        ))}
      </div>
      <NumberBond whole={whole} a={a} b={b} highlight={together ? 'whole' : null} />
      <CounterBoard key={whole} counts={counts} onChange={(c) => setA(c[1])} disabled={together} dropZones={[1, 2]} labels={['მთელი', 'პირველი ნაწილი', 'მეორე ნაწილი']} ariaLabel={`${whole} კუბიკი: მთელი და ორი ნაწილი`} showTotal={false} />
      <div className="xt-row">
        <button type="button" className="btn btn-primary" onClick={() => setTogether(!together)}>
          {together ? 'ისევ გაყოფა' : 'ნაწილების გაერთიანება'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={reset}>
          ↻ თავიდან
        </button>
      </div>
      <p className="xt-note" role="status" aria-live="polite">
        {together ? `${a} და ${b} ერთად ისევ ${whole} არის. მთელი არ შეცვლილა.` : `${a} და ${b} ერთად ${whole} არის. გადაიტანე კუბიკი მეორე ნაწილში და ნახე, რა იცვლება.`}
      </p>
    </div>
  );
}

// ─────────────── pairs in a five- or ten-frame ───────────────

export function FramePairs({ spec }: { spec: ToolOf<'frame-pairs'> }) {
  const initial = () => cellsFor(spec.size, spec.start, spec.size - spec.start);
  const [cells, setCells] = useState<Cell[]>(initial);
  const [hideRest, setHideRest] = useState(Boolean(spec.startHidden));
  const [found, setFound] = useState<string[]>([]);
  const { a, b } = countCells(cells);

  const apply = (next: Cell[]) => {
    setCells(next);
    const c = countCells(next);
    const key = `${c.a}-${c.b}`;
    setFound((all) => (all.includes(key) ? all : [...all, key]));
  };
  const flip = (i: number) => {
    const next = [...cells];
    next[i] = next[i] === 'a' ? 'b' : 'a';
    apply(next);
  };
  const addToFirst = () => {
    const i = cells.indexOf('b');
    if (i >= 0) flip(i);
  };
  const takeFromFirst = () => {
    const i = cells.lastIndexOf('a');
    if (i >= 0) flip(i);
  };
  const untried = Array.from({ length: spec.size + 1 }, (_, i) => i).find((x) => !found.includes(`${x}-${spec.size - x}`));
  const canReveal = found.length >= (spec.revealAfter ?? 2) && untried !== undefined;
  const reveal = () => {
    if (untried !== undefined) apply(cellsFor(spec.size, untried, spec.size - untried));
  };
  const reset = () => {
    setCells(initial());
    setFound([]);
    setHideRest(Boolean(spec.startHidden));
  };

  return (
    <div className="xt">
      <NumberBond whole={spec.size} a={a} b={b} />
      <FrameBoard cells={cells} onCell={flip} hideSecond={hideRest} label={spec.size === 5 ? 'ხუთეულის ჩარჩო' : 'ათიანი ჩარჩო'} />
      <p className="xt-note" role="status" aria-live="polite">
        {hideRest ? `ჩარჩოში ${a} კუბიკია. ცარიელია ${b} ადგილი: ეს მეორე ნაწილია. ${a} და ${b} ერთად ${spec.size} არის.` : `${a} და ${b} ერთად ${spec.size} არის. შეეხე კუბიკს, რომ მეორე ჯგუფში გადავიდეს.`}
      </p>
      <div className="xt-row">
        {spec.hideRest && (
          <>
            <button type="button" className="btn btn-ghost" onClick={takeFromFirst} disabled={a === 0} aria-label="ერთი კუბიკის მოკლება პირველი ნაწილიდან">
              − პირველი ნაწილი
            </button>
            <button type="button" className="btn btn-ghost" onClick={addToFirst} disabled={b === 0} aria-label="ერთი კუბიკის დამატება პირველ ნაწილში">
              + პირველი ნაწილი
            </button>
            <button type="button" className={`btn btn-ghost ${hideRest ? 'is-on' : ''}`} aria-pressed={hideRest} onClick={() => setHideRest(!hideRest)}>
              {hideRest ? 'მეორე ნაწილის ჩვენება' : 'მეორე ნაწილის დამალვა'}
            </button>
          </>
        )}
        {spec.reveal && (
          <button type="button" className="btn btn-ghost" onClick={reveal} disabled={!canReveal}>
            {untried === undefined ? 'ყველა წყვილი ნახე' : 'სხვა წყვილის ჩვენება'}
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={reset}>
          ↻ თავიდან
        </button>
      </div>
      <div className="found" aria-label="ნაპოვნი წყვილები">
        <b>ნაპოვნი წყვილები: {found.length}</b>
        {found.length > 0 && (
          <ul>
            {found.map((key) => {
              const [x, y] = key.split('-');
              return <li key={key}>{x} და {y}</li>;
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─────────────── find the hidden part ───────────────

export function MissingPart({ spec }: { spec: ToolOf<'missing-part'> }) {
  const [index, setIndex] = useState(0);
  const example = spec.examples[index];
  const [picked, setPicked] = useState<number[]>([]);
  const [counted, setCounted] = useState<number[]>([]);
  const rest = example.whole - example.known;
  const choosing = picked.length < example.known;
  const done = !choosing && counted.length === rest;

  const choose = (i: number) => {
    setCounted([]);
    setPicked((all) => (all.includes(i) ? all.filter((x) => x !== i) : all.length < example.known ? [...all, i] : all));
  };
  const count = (i: number) => {
    if (picked.includes(i)) {
      choose(i);
      return;
    }
    setCounted((all) => (all.includes(i) ? all : [...all, i]));
  };
  const select = (i: number) => {
    setIndex(i);
    setPicked([]);
    setCounted([]);
  };
  const reset = () => {
    setPicked([]);
    setCounted([]);
  };
  return (
    <div className="xt">
      {spec.examples.length > 1 && (
        <div className="xt-modes" role="group" aria-label="მაგალითები">
          {spec.examples.map((_, i) => (
            <button key={i} type="button" className={`xt-mode ${i === index ? 'is-on' : ''}`} aria-pressed={i === index} onClick={() => select(i)}>
              მაგალითი {i + 1}
            </button>
          ))}
        </div>
      )}
      <NumberBond whole={example.whole} a={example.known} b={done ? rest : null} highlight={done ? 'b' : null} />
      <ObjectField
        key={`${index}`}
        count={example.whole}
        glyph={spec.glyph}
        layout="rows"
        seed={example.seed}
        picked={new Set(picked)}
        counted={counted}
        onTap={choosing ? choose : count}
        label={`${example.whole} საგანი`}
      />
      <p className="xt-note" role="status" aria-live="polite">
        {choosing
          ? `ცნობილი ნაწილია ${example.known}. შეეხე ${example.known} საგანს და მონიშნე ისინი (${picked.length} / ${example.known}).`
          : done
            ? `დარჩენილი საგნები ${rest}-ია. ${example.known} და ${rest} ერთად ${example.whole} არის: ეს არის დაკარგული ნაწილი.`
            : `ცნობილი ნაწილი მონიშნულია. ახლა შეეხე დარჩენილ საგნებს და დათვალე ისინი: ${counted.length}.`}
      </p>
      <div className="xt-row">
        <button type="button" className="btn btn-ghost" onClick={reset}>
          ↻ თავიდან
        </button>
      </div>
    </div>
  );
}

// ─────────────── stories ───────────────

export function StoryBond({ spec }: { spec: ToolOf<'story-bond'> }) {
  const [index, setIndex] = useState(0);
  const story = spec.stories[index];
  const total = story.a + story.b;
  const [counts, setCounts] = useState<Counts>([total, 0, 0]);
  const [joined, setJoined] = useState(false);
  const [saved, setSaved] = useState<Counts | null>(null);

  const select = (i: number) => {
    setIndex(i);
    setCounts([spec.stories[i].a + spec.stories[i].b, 0, 0]);
    setJoined(false);
    setSaved(null);
  };
  const reset = () => select(index);
  const board: Counts = joined ? [total, 0, 0] : counts;
  const shown = joined && saved ? saved : counts;
  const allPlaced = counts[0] === 0;
  const matches = allPlaced && ((counts[1] === story.a && counts[2] === story.b) || (counts[1] === story.b && counts[2] === story.a));

  const whole = story.kind === 'part' ? total : joined ? total : null;
  const partA = story.kind === 'part' ? story.a : shown[1];
  const partB = story.kind === 'part' ? (matches ? story.b : null) : shown[2];
  const combine = () => {
    if (joined) {
      setJoined(false);
      return;
    }
    setSaved(counts);
    setJoined(true);
  };

  let note: string;
  if (story.kind === 'whole') {
    note = joined
      ? `${shown[1]} და ${shown[2]} ერთად ${total} არის: ეს არის მთელი.`
      : !allPlaced
        ? `გადაიტანე საგნები ორ ჯგუფში ისე, როგორც ისტორიაშია. ჯერ ბოლომდე არ მოგიწყვია (${counts[0]} დარჩა).`
        : matches
          ? 'შენი ჯგუფები ისტორიას ემთხვევა. ახლა გააერთიანე ისინი და ნახე მთელი.'
          : `ისტორიაში ${story.a} და ${story.b}-ია, შენთან კი ${counts[1]} და ${counts[2]}. სცადე გადაადგილება.`;
  } else {
    note = matches
      ? `დარჩენილი ჯგუფი ${story.b}-ია. ${story.a} და ${story.b} ერთად ${total} არის.`
      : allPlaced
        ? `პირველ ჯგუფში ${story.a} საგანი უნდა იყოს, დანარჩენი მეორეში. შენთან ${counts[1]} და ${counts[2]}-ია.`
        : `მთელი ${total}-ია. გადაიტანე ${story.a} საგანი პირველ ჯგუფში, შემდეგ დანარჩენები მეორეში.`;
  }

  return (
    <div className="xt">
      {spec.stories.length > 1 && (
        <div className="xt-modes" role="group" aria-label="ამოცანები">
          {spec.stories.map((s, i) => (
            <button key={s.label} type="button" className={`xt-mode ${i === index ? 'is-on' : ''}`} aria-pressed={i === index} onClick={() => select(i)}>
              {s.label}
            </button>
          ))}
        </div>
      )}
      <p className="story">{story.text}</p>
      <NumberBond whole={whole} a={partA} b={partB} highlight={story.kind === 'part' && matches ? 'b' : joined ? 'whole' : null} />
      <CounterBoard
        key={`${index}`}
        counts={board}
        onChange={setCounts}
        disabled={joined}
        glyph={spec.glyph}
        labels={['ყველა საგანი', 'პირველი ჯგუფი', 'მეორე ჯგუფი']}
        ariaLabel={`${total} საგანი და ორი ჯგუფი`}
        showTotal={false}
      />
      <p className="xt-note" role="status" aria-live="polite">
        {note}
      </p>
      <div className="xt-row">
        {story.kind === 'whole' && (
          <button type="button" className="btn btn-primary" onClick={combine} disabled={!allPlaced && !joined}>
            {joined ? 'ისევ გაყოფა' : 'ჯგუფების გაერთიანება'}
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={reset}>
          ↻ თავიდან
        </button>
      </div>
    </div>
  );
}

// ─────────────── demonstration ───────────────

type Block<T extends ExplainBlock['type']> = Extract<ExplainBlock, { type: T }>;

export function BondDemo({ block }: { block: Block<'bond-demo'> }) {
  const [a, b] = block.parts;
  const join = block.mode === 'join';
  const { frame, done, replay, step } = useStepper(join ? 3 : 4, 1700);

  let counts: Counts;
  let emphasis: 0 | 1 | 2 | null = null;
  let status: string;
  let bond: { whole: number | null; a: number | null; b: number | null } | null = null;
  if (join) {
    counts = frame === 0 ? [0, a, b] : [block.whole, 0, 0];
    status = frame === 0 ? `ერთ ჯგუფში ${a} კუბიკია, მეორეში ${b}.` : frame === 1 ? `ორივე ჯგუფი გავაერთიანეთ: ახლა ${block.whole} კუბიკია.` : `${a} + ${b} = ${block.whole}. ნაწილები ერთად მთელს ქმნიან.`;
    if (frame === 2) bond = { whole: block.whole, a, b };
  } else {
    counts = frame === 0 ? [block.whole, 0, 0] : frame === 3 ? [0, a, b] : [block.whole - a, a, 0];
    emphasis = frame === 2 ? 0 : frame === 3 ? 2 : null;
    status =
      frame === 0
        ? `ეს არის მთელი: ${block.whole} კუბიკი.`
        : frame === 1
          ? `${a} კუბიკი გავიყვანეთ: ეს ცნობილი ნაწილია.`
          : frame === 2
            ? `დარჩენილი კუბიკები ის ნაწილია, რომელიც არ ვიცოდით.`
            : `დარჩა ${b}. ${a} და ${b} ერთად ${block.whole} არის.`;
    if (frame >= 1) bond = { whole: block.whole, a, b: frame === 3 ? b : null };
  }
  const labels: [string, string, string] = join
    ? [block.frame ? (block.frame === 5 ? 'ხუთეულის ჩარჩო' : 'ათიანი ჩარჩო') : 'მთელი', 'პირველი ჯგუფი', 'მეორე ჯგუფი']
    : ['მთელი', 'ცნობილი ნაწილი', 'დარჩენილი ნაწილი'];
  return (
    <figure className="demo">
      {block.story && <p className="story">{block.story}</p>}
      <CounterBoard counts={counts} onChange={() => undefined} disabled palette={block.palette} frame={join ? block.frame : undefined} emphasis={emphasis} labels={labels} ariaLabel={status} showTotal={false} />
      <div className="demo-status" role="status" aria-live="polite">
        {status}
      </div>
      {bond && (
        <div className="demo-bond">
          <NumberBond whole={bond.whole} a={bond.a} b={bond.b} highlight={!join && frame === 3 ? 'b' : null} />
        </div>
      )}
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}
