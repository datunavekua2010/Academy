import { useState } from 'react';
import type { ExplainBlock, ExploreTool } from '../types';
import { DemoButtons, useStepper } from './Visuals';

type Digits = { hundreds: number; tens: number; ones: number };
const digits = (n: number): Digits => ({ hundreds: Math.floor(n / 100), tens: Math.floor(n / 10) % 10, ones: n % 10 });
const total = (x: Digits) => x.hundreds * 100 + x.tens * 10 + x.ones;
const places: Array<keyof Digits> = ['hundreds', 'tens', 'ones'];
const labels = { hundreds: 'ასეულები', tens: 'ათეულები', ones: 'ერთეულები' };

/** An exchange changes the representation, not the quantity. */
export function ThreeDigitLab({ tool }: { tool: Extract<ExploreTool, { tool: 'three-digit-lab' }> }) {
  const [index, setIndex] = useState(0);
  const [blocks, setBlocks] = useState<Digits>(() => digits(tool.examples[0].a));
  const [acted, setActed] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const ex = tool.examples[index];
  const other = digits(ex.b);
  const reset = (i: number) => { setIndex(i); setBlocks(digits(tool.examples[i].a)); setActed(false); setAnswer(''); setFeedback(''); };
  const canRemove = places.every(p => blocks[p] >= other[p]);
  const apply = () => { setBlocks(prev => ({ hundreds: prev.hundreds + (tool.op === 'add' ? other.hundreds : -other.hundreds), tens: prev.tens + (tool.op === 'add' ? other.tens : -other.tens), ones: prev.ones + (tool.op === 'add' ? other.ones : -other.ones) })); setActed(true); };
  const exchange = (from: keyof Digits, to: keyof Digits, count: number) => setBlocks(prev => ({ ...prev, [from]: prev[from] - 1, [to]: prev[to] + count }));
  const bundle = (from: keyof Digits, to: keyof Digits) => setBlocks(prev => ({ ...prev, [from]: prev[from] - 10, [to]: prev[to] + 1 }));
  return <section className="three-lab" aria-label="თანრიგების დაფა">
    <div className="xt-modes">{tool.examples.map((item, i) => <button type="button" className="xt-mode" key={i} aria-pressed={i === index} onClick={() => reset(i)}>{item.a} {tool.op === 'add' ? '+' : '−'} {item.b}</button>)}</div>
    <table className="three-table"><thead><tr>{places.map(p => <th key={p}>{labels[p]}</th>)}</tr></thead><tbody><tr>{places.map(p => <td key={p}><strong>{blocks[p]}</strong><div aria-hidden="true">{Array.from({ length: blocks[p] }, (_, i) => <span className={`three-block ${p}`} key={i}>■</span>)}</div></td>)}</tr></tbody></table>
    <p aria-live="polite">დაფაზე სულ: {total(blocks)}. {acted ? 'მოქმედება შესრულდა.' : tool.op === 'add' ? `შეაერთე ${ex.b}-ის ბლოკები.` : `მოამზადე ${ex.b}-ის წასაღებად.`}</p>
    <div className="xt-row">
      <button type="button" disabled={acted || (tool.op === 'subtract' && !canRemove)} onClick={apply}>{tool.op === 'add' ? 'მეორე რიცხვის დამატება' : 'ბლოკების წაღება'}</button>
      <button type="button" disabled={blocks.hundreds < 1 || acted} onClick={() => exchange('hundreds', 'tens', 10)}>1 ასეული → 10 ათეული</button>
      <button type="button" disabled={blocks.tens < 1 || acted} onClick={() => exchange('tens', 'ones', 10)}>1 ათეული → 10 ერთეული</button>
      <button type="button" disabled={blocks.ones < 10} onClick={() => bundle('ones', 'tens')}>10 ერთეული → 1 ათეული</button>
      <button type="button" disabled={blocks.tens < 10} onClick={() => bundle('tens', 'hundreds')}>10 ათეული → 1 ასეული</button>
      <button type="button" onClick={() => reset(index)}>თავიდან</button>
    </div>
    {acted && <><p>{blocks.ones >= 10 || blocks.tens >= 10 ? 'შეკარი ათი ბლოკი შემდეგ თანრიგში.' : 'შეამოწმე თითოეული თანრიგი.'}</p><label>პასუხი <input inputMode="numeric" value={answer} onChange={e => setAnswer(e.target.value)} /></label><button type="button" onClick={() => setFeedback(!answer.trim() ? 'ჩაწერე შედეგი.' : Number(answer) === total(blocks) && blocks.ones < 10 && blocks.tens < 10 ? `სწორია: ${ex.a} ${tool.op === 'add' ? '+' : '−'} ${ex.b} = ${total(blocks)}.` : 'შეამოწმე ბლოკები და საჭირო გადაჯგუფება.')}>შედეგის შემოწმება</button><p role="status">{feedback}</p></>}
  </section>;
}

export function ThreeDigitDemo({ block }: { block: Extract<ExplainBlock, { type: 'three-digit-demo' }> }) {
  const { frame, done, replay, step } = useStepper(block.steps.length);
  const a = String(block.a).padStart(3, '0'), b = String(block.b).padStart(3, '0');
  return <figure className="three-demo"><table className="three-table"><thead><tr><th>ას.</th><th>ათ.</th><th>ერთ.</th></tr></thead><tbody><tr>{[...a].map((x, i) => <td key={i}>{x}</td>)}</tr><tr>{[...b].map((x, i) => <td key={i}>{i === 0 ? `${block.op} ` : ''}{x}</td>)}</tr></tbody></table><figcaption>{block.steps[Math.min(frame, block.steps.length - 1)]}</figcaption><DemoButtons done={done} replay={replay} step={step} /></figure>;
}
