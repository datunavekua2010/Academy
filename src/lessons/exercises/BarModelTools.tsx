import { useState } from 'react';
import type { ExplainBlock, ExploreTool } from '../types';
import { DemoButtons, useStepper } from './Visuals';

type BarCase = { story: string; a: number; b: number; missing: 'a' | 'b' | 'whole' };
const solution = (x: BarCase) => ({ a: x.a, b: x.b, whole: x.a + x.b });

/** Label slots and calculate the hidden part or whole; keyboard-friendly selects complement drag-like placement. */
export function BarModelLab({ tool }: { tool: Extract<ExploreTool, { tool: 'bar-model-lab' }> }) {
  const [index, setIndex] = useState(0);
  const [slots, setSlots] = useState({ a: '', b: '', whole: '' });
  const [built, setBuilt] = useState(false);
  const [operation, setOperation] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [hintStage, setHintStage] = useState(0);
  const [segments, setSegments] = useState(tool.buildSegments ? 0 : 2);
  const example = tool.examples[index];
  const data = solution(example);
  const expected = { ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])), [example.missing]: '?' } as Record<'a' | 'b' | 'whole', string>;
  const options = [...new Set(Object.values(expected))];
  const reset = (i: number) => { setIndex(i); setSlots({ a: '', b: '', whole: '' }); setBuilt(false); setOperation(''); setAnswer(''); setFeedback(''); setHintStage(0); setSegments(tool.buildSegments ? 0 : 2); };
  const build = () => {
    if (Object.values(slots).some(v => !v)) { setFeedback('ყველა იარლიყი მოათავსე.'); return; }
    if ((Object.keys(slots) as Array<keyof typeof slots>).some(key => slots[key] !== expected[key])) { setFeedback('ჯერ არ არის სწორი. მთლიანი რაოდენობა ზედა იარლიყზეა; თითოეული ნაწილი თავის სეგმენტზე.'); return; }
    setBuilt(true); setFeedback('მოდელი სწორია. ახლა იპოვე უცნობი.');
  };
  const check = () => {
    const op = example.missing === 'whole' ? '+' : '−';
    if (!operation || !answer.trim()) { setFeedback('აირჩიე მოქმედება და ჩაწერე რიცხვი.'); return; }
    if (operation !== op || Number(answer) !== data[example.missing]) { setFeedback('სცადე ისევ: თუ მთელია უცნობი, ნაწილები შეკრიბე; თუ ნაწილია უცნობი, მთელს ცნობილი ნაწილი გამოაკელი.'); return; }
    setFeedback(`სწორია! ${example.a} + ${example.b} = ${data.whole}.`);
  };
  const slot = (key: 'a' | 'b' | 'whole', label: string) => <label onDragOver={e => { if (!built) e.preventDefault(); }} onDrop={e => { e.preventDefault(); const value = e.dataTransfer.getData('text/plain'); if (!built && options.includes(value)) setSlots(prev => ({ ...prev, [key]: value })); }}>{label} <select disabled={built} value={slots[key]} onChange={e => setSlots({ ...slots, [key]: e.target.value })}><option value="">აირჩიე</option>{options.map(x => <option key={x} value={x}>{x}</option>)}</select></label>;
  return <section className="bar-lab" aria-label="ნაწილებისა და მთელის მოდელი">
    <div className="xt-modes">{tool.examples.map((_, i) => <button type="button" key={i} className="xt-mode" aria-pressed={index === i} onClick={() => reset(i)}>ამბავი {i + 1}</button>)}</div>
    <p>{example.story}</p>
    {tool.buildSegments && segments < 2 && <div className="bar-construction" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.getData('text/plain') === 'bar-segment') setSegments(n => Math.min(2, n + 1)); }}>
      <p>ცარიელი მოდელი: დამატებული სეგმენტები {segments} / 2</p>
      <span className="bar-card" draggable onDragStart={e => e.dataTransfer.setData('text/plain', 'bar-segment')}>სეგმენტი ↗</span>
      <button type="button" onClick={() => setSegments(n => Math.min(2, n + 1))}>დაამატე სეგმენტი</button>
    </div>}
    {segments === 2 && <><p>გადაათრიე იარლიყი ადგილზე ან აირჩიე სიიდან.</p>
    <div className="bar-cards" aria-label="იარლიყები">{options.map(value => <span key={value} className="bar-card" draggable={!built} onDragStart={e => e.dataTransfer.setData('text/plain', value)}>{value}</span>)}</div>
    <div className="bar-model">{slot('whole', 'მთელი')}
      <div className="bar-segments"><div style={{ flex: example.a }} >{slot('a', 'პირველი ნაწილი')}</div><div style={{ flex: example.b }}>{slot('b', 'მეორე ნაწილი')}</div></div>
    </div>
    {!built && <><button type="button" onClick={build}>მოდელის შემოწმება</button><button type="button" onClick={() => setHintStage(stage => Math.min(stage + 1, 2))}>მინიშნება</button>{hintStage > 0 && <p>მთელი ზედა იარლიყზეა, ნაწილები ქვემოთაა.</p>}{hintStage > 1 && <p>კითხვის ნიშანი იმ რაოდენობას ეკუთვნის, რომელსაც ამბავი გეკითხება.</p>}</>}
    {built && <><div role="group" aria-label="მოქმედება">{['+', '−'].map(op => <button type="button" key={op} aria-pressed={operation === op} onClick={() => setOperation(op)}>{op}</button>)}</div><label>უცნობი <input inputMode="numeric" value={answer} onChange={e => setAnswer(e.target.value)} /></label><button type="button" onClick={check}>გამოთვლის შემოწმება</button></>}
    </>}
    <p role="status">{feedback}</p>
  </section>;
}

export function BarModelDemo({ block }: { block: Extract<ExplainBlock, { type: 'bar-model-demo' }> }) {
  const { frame, done, replay, step } = useStepper(4);
  return <figure className="bar-demo"><div className="bar-model"><div>მთელი: {frame >= 3 ? block.a + block.b : '?'}</div><div className="bar-segments"><div style={{ flex: block.a }}>{block.a}</div><div style={{ flex: block.b }}>{frame >= 1 ? block.b : '?'}</div></div></div><figcaption>{['მთელი ორ ნაწილად არის დაყოფილი.', `პირველი ნაწილი: ${block.a}; მეორე: ${block.b}.`, `${block.a} + ${block.b} = ${block.a + block.b}.`, `მთელი ${block.a + block.b}-ია; ნაწილები ერთად მთელს ქმნის.`][frame]}</figcaption><DemoButtons done={done} replay={replay} step={step} /></figure>;
}
