import { useState } from 'react';
import type { ExplainBlock, ExploreTool } from '../types';
import { CM_PER_M, px, readingAt, suitableUnit, toMetres, unitSymbol, unitsIn, type UnitChoice } from './MeasureGeometry';
import { AlignBoard, LengthObjectView, MetreStrip, OBJECT_NAME, RulerBoard, UnitBoard, UnitPickBoard, cmText } from './LengthBoard';
import { LENGTH_GROUPS } from './LengthAnswers';

/**
 * Explore tools and the explain demo for the length unit. These are places to play with the ideas: they show real
 * numbers and real pictures, and they never tell the student a length from how a drawing happens to look.
 */

type LengthLabTool = Extract<ExploreTool, { tool: 'length-lab' }>;
type SortLabTool = Extract<ExploreTool, { tool: 'length-sort-lab' }>;
type UnitsLabTool = Extract<ExploreTool, { tool: 'units-lab' }>;
type RulerLabTool = Extract<ExploreTool, { tool: 'ruler-lab' }>;
type MetreLabTool = Extract<ExploreTool, { tool: 'metre-lab' }>;

// ─────────────────────────── aligning two objects ───────────────────────────

export function LengthLab({ tool }: { tool: LengthLabTool }) {
  const [pairIndex, setPairIndex] = useState(0);
  const [starts, setStarts] = useState<[number, number]>([px(1), px(2)]);
  const pair = tool.pairs[Math.min(pairIndex, tool.pairs.length - 1)];
  const on = starts[0] === 0 && starts[1] === 0;
  const longer = pair.a.cm === pair.b.cm ? 'ორივე იგივე სიგრძისაა.' : pair.a.cm > pair.b.cm ? `${OBJECT_NAME(pair.a)} უფრო გრძელია.` : `${OBJECT_NAME(pair.b)} უფრო გრძელია.`;
  return (
    <div className="lab lab-length">
      <div className="lab-head">
        {tool.pairs.map((p, i) => (
          <button key={p.label + i} type="button" className={`btn btn-ghost btn-small ${i === pairIndex ? 'is-on' : ''}`} onClick={() => (setPairIndex(i), setStarts([px(1), px(2)]))}>
            {p.label}
          </button>
        ))}
      </div>
      <AlignBoard a={pair.a} b={pair.b} starts={starts} onStarts={setStarts} label={`${pair.a.cm} სმ და ${pair.b.cm} სმ`} />
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {on ? `${longer} ${cmText(pair.a.cm)} და ${cmText(pair.b.cm)}.` : 'საგნები ერთ ხაზზე არ იწყება — ვერ შევადარებთ. მიიტანე ორივე დასაწყისთან.'}
      </p>
      <button type="button" className="btn btn-ghost btn-small" onClick={() => setStarts([px(1), px(2)])}>
        ↻ თავიდან
      </button>
    </div>
  );
}

// ─────────────────────────── sorting by length ───────────────────────────

export function LengthSortLab({ tool }: { tool: SortLabTool }) {
  const [placed, setPlaced] = useState<string[]>(tool.items.map(() => ''));
  const [selected, setSelected] = useState<number | null>(null);
  const reference = tool.reference;
  const maxCm = Math.max(reference.cm, ...tool.items.map((o) => o.cm));
  const groupOf = (cm: number) => (cm > reference.cm ? 'l' : cm < reference.cm ? 's' : 'e');
  const place = (groupId: string) => {
    if (selected === null) return;
    const next = placed.map((g, i) => (i === selected ? groupId : g));
    setPlaced(next);
    const after = next.findIndex((g) => !g);
    setSelected(after >= 0 ? after : null);
  };
  const allPlaced = placed.every((g) => g);
  const right = allPlaced && placed.every((g, i) => g === groupOf(tool.items[i].cm));
  return (
    <div className="lab lab-sort">
      <div className="ln-reference">
        <span className="ln-reference-text">შესადარებელი სიგრძე ({reference.cm} სმ):</span>
        <LengthObjectView spec={reference} maxCm={maxCm} />
      </div>
      <p className="lab-note">შეეხე საგანს, მერე ჯგუფს. ჯგუფების შეცვლა ყოველთვის შეიძლება.</p>
      <div className="sort-tray">
        {tool.items.map((spec, i) =>
          placed[i] ? null : (
            <button key={i} type="button" className={`sort-card ln-card ${selected === i ? 'is-selected' : ''}`} aria-pressed={selected === i} onClick={() => setSelected(i)}>
              <LengthObjectView spec={spec} maxCm={maxCm} />
            </button>
          ),
        )}
      </div>
      <div className="sort-bins has-3">
        {LENGTH_GROUPS.map((g) => (
          <section key={g.id} className="sort-bin" aria-label={g.label}>
            <button type="button" className="sort-bin-btn" disabled={selected === null} onClick={() => place(g.id)}>
              <span aria-hidden="true">{g.icon}</span> {g.label}
            </button>
            <div className="sort-cards">
              {placed.map((p, i) =>
                p === g.id ? (
                  <button key={i} type="button" className="sort-card ln-card is-small" onClick={() => setSelected(i)}>
                    <LengthObjectView spec={tool.items[i]} maxCm={maxCm} />
                  </button>
                ) : null,
              )}
              {placed.every((p) => p !== g.id) && <span className="sort-empty">ცარიელია</span>}
            </div>
          </section>
        ))}
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {allPlaced ? (right ? '✓ სამივე ჯგუფი სწორია.' : 'ჯგუფები ჯერ არ ემთხვევა სიგრძეებს — შეადარე რიცხვებს.') : `${placed.filter(Boolean).length} / ${placed.length} დალაგებულია.`}
      </p>
      <button type="button" className="btn btn-ghost btn-small" onClick={() => (setPlaced(placed.map(() => '')), setSelected(null))}>
        ↻ თავიდან
      </button>
    </div>
  );
}

// ─────────────────────────── non-standard units ───────────────────────────

export function UnitsLab({ tool }: { tool: UnitsLabTool }) {
  const [objectIndex, setObjectIndex] = useState(0);
  const [unitIndex, setUnitIndex] = useState(0);
  const object = tool.objects[Math.min(objectIndex, tool.objects.length - 1)].object;
  const unit = tool.units[Math.min(unitIndex, tool.units.length - 1)];
  const [placed, setPlaced] = useState(0);
  const reset = () => setPlaced(0);
  const pickObject = (i: number) => {
    setObjectIndex(i);
    setPlaced(0);
  };
  const pickUnit = (i: number) => {
    setUnitIndex(i);
    setPlaced(0);
  };
  const count = unitsIn(object.cm, unit.cm);
  const fits = count * unit.cm === object.cm;
  return (
    <div className="lab lab-units">
      <div className="lab-head">
        {tool.objects.map((o, i) => (
          <button key={o.label + i} type="button" className={`btn btn-ghost btn-small ${i === objectIndex ? 'is-on' : ''}`} onClick={() => pickObject(i)}>
            {o.label}
          </button>
        ))}
      </div>
      <div className="lab-head">
        {tool.units.map((u, i) => (
          <button key={u.name + i} type="button" className={`btn btn-ghost btn-small ${i === unitIndex ? 'is-on' : ''}`} onClick={() => pickUnit(i)}>
            {u.name} ({u.cm} სმ)
          </button>
        ))}
      </div>
      <UnitBoard object={object} unitCm={unit.cm} unitName={unit.name} placed={placed} onChange={setPlaced} disabled={false} label={`${object.cm} სმ საგანი, ${unit.name} ${unit.cm} სმ`} />
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {placed === 0
          ? 'დაამატე ერთეულები და დაითვალე.'
          : placed === count
            ? `თავსდება ზუსტად ${count} ${unit.name}: ${count} × ${unit.cm} სმ = ${object.cm} სმ.`
            : placed > count
              ? 'მეტი ერთეული აღარ ეტევა — ისინი ერთმანეთს გადაფარავს.'
              : `${placed} ${unit.name} = ${placed * unit.cm} სმ. კიდევ სჭირდება.`}
        {!fits && placed === count ? ' (ბოლომდე ზუსტად არ ეტევა.)' : ''}
      </p>
      <button type="button" className="btn btn-ghost btn-small" onClick={reset}>
        ↻ თავიდან
      </button>
    </div>
  );
}

// ─────────────────────────── the ruler ───────────────────────────

export function RulerLab({ tool }: { tool: RulerLabTool }) {
  const [index, setIndex] = useState(0);
  const [zero, setZero] = useState(0);
  const object = tool.objects[Math.min(index, tool.objects.length - 1)].object;
  const pick = (i: number) => {
    setIndex(i);
    setZero(0);
  };
  const reading = readingAt(px(object.cm), px(zero));
  const ok = reading === object.cm;
  return (
    <div className="lab lab-ruler">
      <div className="lab-head">
        {tool.objects.map((o, i) => (
          <button key={o.label + i} type="button" className={`btn btn-ghost btn-small ${i === index ? 'is-on' : ''}`} onClick={() => pick(i)}>
            {o.label}
          </button>
        ))}
      </div>
      <RulerBoard object={object} zeroAt={zero} onZero={setZero} label={`${OBJECT_NAME(object)}, ${object.cm} სმ`} />
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {ok ? `ნული დასაწყისთანაა: ${object.cm} სმ.` : `ნული ${zero} სმ-ზეა, ამიტომ კითხვა ${reading} სმ არის — ეს საგნის სიგრძე არ არის.`}
      </p>
      <button type="button" className="btn btn-ghost btn-small" onClick={() => setZero(0)}>
        ⇤ ნული დასაწყისთან
      </button>
    </div>
  );
}

// ─────────────────────────── metres ───────────────────────────

export function MetreLab({ tool }: { tool: MetreLabTool }) {
  const [pick, setPick] = useState<string[]>(tool.items.map(() => ''));
  const [demoCm, setDemoCm] = useState(tool.demoCm[0] ?? 100);
  return (
    <div className="lab lab-metre">
      <MetreStrip cm={CM_PER_M} label={`1 მეტრი = ${CM_PER_M} სანტიმეტრი`} />
      <p className="lab-note">1 მეტრი ზუსტად {CM_PER_M} სანტიმეტრია. ქვემოთ აირჩიე სიგრძე და ნახე, რამდენი მეტრია.</p>
      <div className="lab-head">
        {tool.demoCm.map((cm) => (
          <button key={cm} type="button" className={`btn btn-ghost btn-small ${cm === demoCm ? 'is-on' : ''}`} onClick={() => setDemoCm(cm)}>
            {cmText(cm)}
          </button>
        ))}
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {demoCm >= CM_PER_M
          ? `${cmText(demoCm)} = ${toMetres(demoCm)} მ. ამიტომ უფრო მოხერხებულია მეტრი.`
          : `${cmText(demoCm)} მეტრზე ნაკლებია, ამიტომ უფრო მოხერხებულია სანტიმეტრი (${toMetres(demoCm)} მ).`}
      </p>
      <UnitPickBoard items={tool.items} picks={pick} onChange={setPick} disabled={false} label="აირჩიე ერთეული" />
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {pick.every((p) => !p)
          ? 'აირჩიე ერთეული თითოეული საგნისთვის.'
          : pick.every((p, i) => p === suitableUnit(tool.items[i].cm))
            ? '✓ ყველა ერთეული შეესაბამება სიგრძეს.'
            : `ჯერ არა: ${pick.filter((p, i) => p && p !== suitableUnit(tool.items[i].cm)).length} არჩევანი ერთეულს არ ემთხვევა.`}
      </p>
    </div>
  );
}

// ─────────────────────────── the explain demo ───────────────────────────

export function MeasureDemo({ block }: { block: Extract<ExplainBlock, { type: 'measure-demo' }> }) {
  const [step, setStep] = useState(0);
  const steps = block.steps;
  const shown = Math.min(step, steps.length - 1);
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const reset = () => setStep(0);
  const unitCm = block.unitCm ?? 10;

  return (
    <div className="ms-demo">
      {block.mode === 'align' && <AlignBoard a={block.a} b={block.b} starts={[shown >= 1 ? 0 : px(1), shown >= 2 ? 0 : px(2)]} onStarts={() => undefined} disabled label="ორი საგანი" />}
      {block.mode === 'units' && <UnitBoard object={block.a} unitCm={unitCm} unitName="კუბიკი" placed={shown === 0 ? 0 : unitsIn(block.a.cm, unitCm)} onChange={() => undefined} disabled label="კუბიკებით გაზომვა" />}
      {block.mode === 'ruler' && <RulerBoard object={block.a} zeroAt={shown === 0 ? 2 : 0} label="სახაზავი" readOnly />}
      {block.mode === 'metre' && (
        <div className="ms-demo-metre">
          <MetreStrip />
          <p className="lab-note">
            {block.a.cm >= CM_PER_M ? `${cmText(block.a.cm)} = ${toMetres(block.a.cm)} მ` : `${cmText(block.a.cm)} — სანტიმეტრებში`} · {unitSymbol(suitableUnit(block.a.cm) as UnitChoice)}
          </p>
        </div>
      )}
      <ol className="ms-steps">
        {steps.map((text, i) => (
          <li key={text} className={i === shown ? 'is-on' : i < shown ? 'is-past' : ''}>
            {i === shown && <span aria-hidden="true">▸ </span>}
            {text}
          </li>
        ))}
      </ol>
      <div className="demo-buttons">
        <button type="button" className="btn btn-ghost btn-small" onClick={back} disabled={shown === 0}>
          ← უკან
        </button>
        <button type="button" className="btn btn-primary btn-small" onClick={next} disabled={shown >= steps.length - 1}>
          შემდეგ →
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={reset} disabled={shown === 0}>
          ↻ თავიდან
        </button>
      </div>
      {block.caption && <p className="ms-caption">{block.caption}</p>}
    </div>
  );
}

// ─────────────────────────── the router the player uses ───────────────────────────

export function ExploreToolViewMeasure({ tool }: { tool: ExploreTool }) {
  switch (tool.tool) {
    case 'length-lab':
      return <LengthLab tool={tool} />;
    case 'length-sort-lab':
      return <LengthSortLab tool={tool} />;
    case 'units-lab':
      return <UnitsLab tool={tool} />;
    case 'ruler-lab':
      return <RulerLab tool={tool} />;
    case 'metre-lab':
      return <MetreLab tool={tool} />;
    default:
      return null;
  }
}
