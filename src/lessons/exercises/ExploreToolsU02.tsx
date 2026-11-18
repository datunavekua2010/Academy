import { useState } from 'react';
import type { ExploreTool } from '../types';
import { CompareGroups, compareWords, type CompareView } from './Compare';
import { NumberLine } from './NumberLine';
import { ObjectField } from './Objects';
import { SplitBoard } from './SplitBoard';
import { Quantity, quantityText } from './Visuals';

/** Free-exploration tools for "Numbers to 20". Nothing here is graded. */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;

// ─────────────── count objects ───────────────

export function CountObjects({ spec }: { spec: ToolOf<'count-objects'> }) {
  const [sizeIdx, setSizeIdx] = useState(0);
  const [layoutIdx, setLayoutIdx] = useState(0);
  const [counted, setCounted] = useState<number[]>([]);
  const [note, setNote] = useState('');
  const count = spec.counts[sizeIdx];
  const layout = spec.layouts[layoutIdx];
  const done = counted.length === count;

  const tap = (i: number) => {
    if (counted.includes(i)) {
      setNote('ეს უკვე დათვლილია. თითოეულ საგანს ერთხელ ვთვლით.');
      return;
    }
    setCounted((all) => [...all, i]);
    setNote('');
  };
  const reset = () => {
    setCounted([]);
    setNote('');
  };
  return (
    <div className="xt">
      {spec.counts.length > 1 && (
        <div className="xt-modes" role="group" aria-label="ჯგუფის არჩევა">
          {spec.counts.map((n, i) => (
            <button key={n} type="button" className={`xt-mode ${i === sizeIdx ? 'is-on' : ''}`} aria-pressed={i === sizeIdx} onClick={() => { setSizeIdx(i); reset(); }}>
              {i === 0 ? 'პატარა ჯგუფი' : i === spec.counts.length - 1 ? 'დიდი ჯგუფი' : `ჯგუფი ${i + 1}`}
            </button>
          ))}
        </div>
      )}
      <ObjectField key={`${sizeIdx}-${layoutIdx}`} count={count} glyph={spec.glyph} layout={layout.layout} seed={layout.seed} counted={counted} onTap={tap} label="საგნები დასათვლელად" />
      <div className="objs-bar">
        <span className="objs-count" role="status" aria-live="polite">
          დათვლილია: <strong>{counted.length}</strong>
        </span>
        <button type="button" className="btn btn-ghost btn-small" onClick={reset}>
          ↻ თავიდან
        </button>
        {spec.layouts.length > 1 && (
          <button type="button" className="btn btn-ghost btn-small" onClick={() => { setLayoutIdx((layoutIdx + 1) % spec.layouts.length); reset(); }}>
            ⇄ სხვანაირად დალაგება
          </button>
        )}
      </div>
      <p className="xt-note" role="status" aria-live="polite">
        {note || (done ? `ყველა საგანი დავთვალეთ. ბოლო რიცხვი ${count} გვეუბნება, რამდენია სულ.` : counted.length === 0 ? 'შეეხე საგნებს ერთმანეთის მიყოლებით. დათვლილ საგანზე რიცხვი გამოჩნდება.' : 'განაგრძე: შეეხე შემდეგ საგანს, რომელიც ჯერ არ დაგითვლია.')}
      </p>
    </div>
  );
}

// ─────────────── number builder ───────────────

type Panel = 'numeral' | 'name' | 'quantity';

export function NumberBuilder({ spec }: { spec: ToolOf<'number-builder'> }) {
  const [n, setN] = useState(spec.start);
  const [panel, setPanel] = useState<Panel | null>(null);
  const name = spec.names[n] ?? '';
  const set = (next: number) => setN(Math.max(0, Math.min(spec.max, next)));
  return (
    <div className="xt">
      <div className="panels">
        <button type="button" className={`panel ${panel === 'numeral' ? 'is-picked' : ''}`} aria-pressed={panel === 'numeral'} onClick={() => setPanel('numeral')}>
          <small>ციფრებით</small>
          <span className="panel-numeral">{n}</span>
        </button>
        <button type="button" className={`panel ${panel === 'name' ? 'is-picked' : ''}`} aria-pressed={panel === 'name'} onClick={() => setPanel('name')}>
          <small>სიტყვით</small>
          <span className="panel-name">{name}</span>
        </button>
        <button type="button" className={`panel ${panel === 'quantity' ? 'is-picked' : ''}`} aria-pressed={panel === 'quantity'} onClick={() => setPanel('quantity')}>
          <small>ჯგუფებით</small>
          {n === 0 ? <span className="panel-empty">ცარიელია</span> : <Quantity tens={Math.floor(n / 10)} ones={n % 10} />}
        </button>
      </div>
      <div className="nl-controls" role="group" aria-label="საგნების ლანგარი">
        <button type="button" className="nl-step" onClick={() => set(n - 1)} disabled={n <= 0} aria-label="ერთი საგნის ამოღება">
          <span aria-hidden="true">−</span>
        </button>
        <output className="nl-readout" aria-live="polite">
          ლანგარზე: {n}
        </output>
        <button type="button" className="nl-step" onClick={() => set(n + 1)} disabled={n >= spec.max} aria-label="ერთი საგნის დამატება">
          <span aria-hidden="true">+</span>
        </button>
      </div>
      <p className="xt-note" role="status" aria-live="polite">
        {panel ? (
          <>
            ეს ერთი და იგივე რაოდენობაა: <strong>{n}</strong> = {name} = {n === 0 ? 'არაფერი' : quantityText(n)}.
          </>
        ) : (
          'დაამატე ან ამოიღე საგნები. შეეხე ბარათს და ნახე, როგორ ემთხვევა სამივე სახე.'
        )}
      </p>
    </div>
  );
}

// ─────────────── compare ───────────────

const VIEW_LABEL: Record<Exclude<CompareView, 'numbers'>, string> = { objects: 'საგნები', pairs: 'წყვილები', line: 'რიცხვითი ღერძი' };

export function CompareExplore({ spec }: { spec: ToolOf<'compare'> }) {
  const [[a, b], setValues] = useState<[number, number]>(spec.start);
  const [view, setView] = useState<Exclude<CompareView, 'numbers'>>('objects');
  const adjust = (which: 0 | 1, delta: number) =>
    setValues(([x, y]) => (which === 0 ? [Math.max(0, Math.min(spec.max, x + delta)), y] : [x, Math.max(0, Math.min(spec.max, y + delta))]));
  const extra = Math.abs(a - b);
  return (
    <div className="xt">
      <div className="xt-modes" role="group" aria-label="ჩვენების არჩევა">
        {(Object.keys(VIEW_LABEL) as Array<keyof typeof VIEW_LABEL>).map((v) => (
          <button key={v} type="button" className={`xt-mode ${view === v ? 'is-on' : ''}`} aria-pressed={view === v} onClick={() => setView(v)}>
            {VIEW_LABEL[v]}
          </button>
        ))}
      </div>
      <div className="cmp-controls">
        {([['ა', a, 0], ['ბ', b, 1]] as const).map(([name, value, which]) => (
          <div key={name} className="cmp-ctl" role="group" aria-label={`ჯგუფი ${name}`}>
            <button type="button" className="nl-step" onClick={() => adjust(which, -1)} disabled={value <= 0} aria-label={`ჯგუფი ${name}: ერთის ამოღება`}>
              <span aria-hidden="true">−</span>
            </button>
            <output aria-live="polite">
              {name}: <strong>{value}</strong>
            </output>
            <button type="button" className="nl-step" onClick={() => adjust(which, 1)} disabled={value >= spec.max} aria-label={`ჯგუფი ${name}: ერთის დამატება`}>
              <span aria-hidden="true">+</span>
            </button>
          </div>
        ))}
      </div>
      <CompareGroups a={a} b={b} view={view} glyph={spec.glyph} showNumbers />
      <p className="xt-note" role="status" aria-live="polite">
        {compareWords(a, b)}{' '}
        {view === 'pairs' && (extra === 0 ? 'ყველა საგანს წყვილი ჰყავს.' : `${a > b ? 'ა' : 'ბ'} ჯგუფში ${extra} საგანი ზედმეტია.`)}
        {view === 'line' && a !== b && <>რიცხვითი ღერძის მარჯვენა მხარეს დგას უფრო დიდი რიცხვი.</>}
      </p>
    </div>
  );
}

// ─────────────── order on a number line ───────────────

export function OrderLine({ spec }: { spec: ToolOf<'order-line'> }) {
  const [placed, setPlaced] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');
  const [guide, setGuide] = useState(false);
  const [note, setNote] = useState('');
  const waiting = spec.tiles.filter((t) => !placed.includes(t));
  const row = [...placed].sort((x, y) => (direction === 'asc' ? x - y : y - x));

  const choose = (t: number) => {
    setSelected(selected === t ? null : t);
    setNote(selected === t ? '' : `აიღე ${t}. ახლა ღერძზე იპოვე ${t} და შეეხე.`);
  };
  const place = (v: number) => {
    if (selected === null) {
      setNote('ჯერ აირჩიე ფილა.');
      return;
    }
    if (v !== selected) {
      setNote(`აქ ${v} დგას. შენი ფილა ${selected} არის: ცოტა მარცხნივ ან მარჯვნივ გადაადგილდი.`);
      return;
    }
    setPlaced((all) => [...all, selected]);
    setNote(`${selected} ღერძზე თავის ადგილას დადგა.`);
    setSelected(null);
  };
  return (
    <div className="xt">
      <NumberLine
        min={spec.min}
        max={spec.max}
        value={null}
        onChange={place}
        labelled={guide && selected !== null ? [spec.min, selected, spec.max] : [spec.min, spec.max]}
        pins={placed.map((v) => ({ value: v, label: String(v) }))}
        ariaLabel={`რიცხვითი ღერძი ${spec.min}-დან ${spec.max}-მდე`}
      />
      <div className="ord-tray" role="group" aria-label="ფილები">
        {waiting.length === 0 ? <span className="ord-hint">ყველა ფილა დადგა.</span> : null}
        {waiting.map((t) => (
          <button key={t} type="button" className={`ord-tile is-tray ${selected === t ? 'is-held' : ''}`} aria-pressed={selected === t} onClick={() => choose(t)}>
            {t}
            {selected === t && <span className="ord-mark" aria-hidden="true">▲</span>}
          </button>
        ))}
      </div>
      <div className="xt-modes" role="group" aria-label="დალაგების მიმართულება">
        <button type="button" className={`xt-mode ${direction === 'asc' ? 'is-on' : ''}`} aria-pressed={direction === 'asc'} onClick={() => setDirection('asc')}>
          პატარიდან დიდისკენ
        </button>
        <button type="button" className={`xt-mode ${direction === 'desc' ? 'is-on' : ''}`} aria-pressed={direction === 'desc'} onClick={() => setDirection('desc')}>
          დიდიდან პატარისკენ
        </button>
      </div>
      <div className="ord-result" aria-label="დალაგებული ფილები">
        {row.length === 0 ? <span className="ord-hint">დადებული ფილები აქ ჩამწკრივდება.</span> : row.map((v) => <span key={`${direction}-${v}`} className="ord-tile is-result">{v}</span>)}
      </div>
      <div className="xt-row">
        <button type="button" className={`btn btn-ghost ${guide ? 'is-on' : ''}`} aria-pressed={guide} onClick={() => setGuide(!guide)}>
          {guide ? '✓ ' : ''}ნიშნულის მინიშნება
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => { setPlaced([]); setSelected(null); setNote(''); }}>
          ↻ თავიდან
        </button>
      </div>
      <p className="xt-note" role="status" aria-live="polite">
        {note || 'აირჩიე ფილა და შეეხე ღერძზე იმავე რიცხვს.'}
      </p>
    </div>
  );
}

// ─────────────── split into two parts ───────────────

export function SplitExplore({ spec }: { spec: ToolOf<'split'> }) {
  const [targetIdx, setTargetIdx] = useState(0);
  const total = spec.targets[targetIdx];
  const [left, setLeft] = useState(total);
  const [found, setFound] = useState<Record<number, string[]>>({});
  const [frame, setFrame] = useState(Boolean(spec.frame));
  const mine = found[total] ?? [];

  const change = (next: number) => {
    setLeft(next);
    if (next > 0 && next < total) {
      const key = `${Math.min(next, total - next)} და ${Math.max(next, total - next)}`;
      setFound((all) => ((all[total] ?? []).includes(key) ? all : { ...all, [total]: [...(all[total] ?? []), key] }));
    }
  };
  const target = (i: number) => {
    setTargetIdx(i);
    setLeft(spec.targets[i]);
  };
  return (
    <div className="xt">
      {spec.targets.length > 1 && (
        <div className="xt-modes" role="group" aria-label="რიცხვის არჩევა">
          {spec.targets.map((t, i) => (
            <button key={t} type="button" className={`xt-mode ${i === targetIdx ? 'is-on' : ''}`} aria-pressed={i === targetIdx} onClick={() => target(i)}>
              {t}
            </button>
          ))}
        </div>
      )}
      <p className="spl-target">
        ვაწყობთ რიცხვს: <strong>{total}</strong>
      </p>
      <SplitBoard total={total} left={left} onChange={change} frame={frame} ariaLabel={`${total} კუბიკი ორ ყუთში`} />
      <div className="xt-row">
        <button type="button" className={`btn btn-ghost ${frame ? 'is-on' : ''}`} aria-pressed={frame} onClick={() => setFrame(!frame)}>
          {frame ? '✓ ' : ''}ათიანი ჩარჩო
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setLeft(total)}>
          ↻ თავიდან
        </button>
      </div>
      <p className="xt-note" role="status" aria-live="polite">
        {left === total || left === 0 ? 'გადაიტანე კუბიკები მეორე ყუთში და ნახე, რა ნაწილები მიიღე.' : `${left} და ${total - left} ერთად ${total} არის.`}
      </p>
      <div className="found" aria-label="ნაპოვნი გზები">
        <b>ნაპოვნი გზები: {mine.length}</b>
        {mine.length > 0 && (
          <ul>
            {mine.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
