import { useState } from 'react';
import type { ExploreTool } from '../types';

/** A story unfolds only when both the operation and the intermediate result are correct. */
export function MissionLab({ tool }: { tool: Extract<ExploreTool, { tool: 'mission-lab' }> }) {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [op, setOp] = useState('');
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const mission = tool.missions[index];
  const results = mission.steps.reduce<number[]>((all, part) => [...all, part.op === '+' ? all[all.length - 1] + part.amount : all[all.length - 1] - part.amount], [mission.start]);
  const current = mission.steps[step];
  const reset = (i: number) => { setIndex(i); setStep(0); setOp(''); setInput(''); setFeedback(''); };
  const check = () => {
    if (!op || !input.trim()) { setFeedback('აირჩიე მოქმედება და ჩაწერე შედეგი.'); return; }
    if (op !== current.op || Number(input) !== results[step + 1]) { setFeedback('ჯერ არ არის სწორი. დაფიქრდი, რაოდენობა იზრდება თუ მცირდება, და შეამოწმე გამოთვლა.'); return; }
    setStep(step + 1); setOp(''); setInput(''); setFeedback('სწორია!');
  };
  return <section className="mission-lab" aria-label="მათემატიკური მისია">
    <div className="xt-modes">{tool.missions.map((m, i) => <button type="button" className="xt-mode" aria-pressed={index === i} key={i} onClick={() => reset(i)}>{m.title}</button>)}</div>
    <p>{mission.story}</p><p>დასაწყისი: {mission.start}</p>
    <ol>{mission.steps.map((s, i) => <li key={i}>{s.description}{i < step ? `: ${results[i]} ${s.op} ${s.amount} = ${results[i + 1]}` : ''}</li>)}</ol>
    {current && <><p>ნაბიჯი {step + 1}: {current.description}. ახლა გვაქვს {results[step]}; ცვლილებაა {current.amount}.</p>
      <div role="group" aria-label="მოქმედება">{['+', '−'].map(symbol => <button type="button" key={symbol} aria-pressed={op === symbol} onClick={() => setOp(symbol)}>{symbol}</button>)}</div>
      <label>ნაბიჯის შედეგი <input inputMode="numeric" value={input} onChange={e => setInput(e.target.value)} /></label>
      <button type="button" onClick={check}>ნაბიჯის შემოწმება</button></>}
    <p role="status">{feedback}</p>
    {!current && <p>მთლიანი გზა: {mission.steps.map((s, i) => `${results[i]} ${s.op} ${s.amount} = ${results[i + 1]}`).join('; ')}.</p>}
  </section>;
}
