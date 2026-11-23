import {describe,it,expect} from 'vitest';
import {PracticeEvidenceReview} from '../server/practice-evidence-review';
import type {Question} from '../src/practice/types';
import {generateBatch} from '../src/practice/generator';
const question=(n:number):Question=>({id:`secret-template~${n}`,grade:2,topicId:'t',subtopicId:'s',prompt:`Problem ${n}`,options:['yes','no'],answer:'yes',explanation:'yes is correct',difficulty:1});
function make(){let n=0;return new PracticeEvidenceReview(()=>question(++n));}
describe('review-only server-side question prototype',()=>{
 it('does not expose answers, seeds, internal IDs or explanations and isolates owners',()=>{
  const engine=make(),id=engine.start('student_a'),issued=engine.issue('student_a',id,'req1');
  expect(Object.keys(issued).sort()).toEqual(['answerMode','id','options','prompt']);
  expect(issued.id).not.toContain('secret');
  expect(()=>engine.issue('student_b',id,'req1')).toThrow();
  expect(()=>engine.submit('student_b',id,issued.id,'yes')).toThrow();
  expect(()=>engine.finish('student_b',id)).toThrow();
 });
 it('retries issuance and answers idempotently but cannot change an accepted answer',()=>{
  const engine=make(),id=engine.start('student'),q=engine.issue('student',id,'request');
  expect(engine.issue('student',id,'request')).toEqual(q);
  expect(()=>engine.issue('student',id,'other')).toThrow();
  expect(()=>engine.submit('student',id,q.id,'not an option')).toThrow();
  expect(engine.submit('student',id,q.id,'no')).toEqual({correct:false});
  expect(engine.submit('student',id,q.id,'no')).toEqual({correct:false});
  expect(()=>engine.submit('student',id,q.id,'yes')).toThrow();
 });
 it('only finishes ten distinct answered prompts, returns a stable local result and rejects late issuance',()=>{
  const engine=make(),id=engine.start('student');
  for(let i=0;i<10;i++){const q=engine.issue('student',id,`request_${i}`);engine.submit('student',id,q.id,i===0?'no':'yes');}
  const result=engine.finish('student',id);expect(result).toMatchObject({answered:10,correct:9,owner:'student',kind:'review-only'});
  expect(engine.finish('student',id)).toEqual(result);expect(()=>engine.issue('student',id,'new')).toThrow();
 });
 it('fails closed on duplicate or unsupported material, expiry, incomplete work and bounds',()=>{
  let time=0;const engine=new PracticeEvidenceReview(()=>question(1),()=>time),id=engine.start('student');
  const q=engine.issue('student',id,'a');engine.submit('student',id,q.id,'yes');
  expect(()=>engine.finish('student',id)).toThrow();expect(()=>engine.issue('student',id,'b')).toThrow();
  time=900_000;expect(()=>engine.finish('student',id)).toThrow();
  const unsafe=new PracticeEvidenceReview(()=>({...question(2),visual:'answer hint'}));expect(()=>unsafe.issue('student',unsafe.start('student'),'r')).toThrow();
  const other=make();other.start('student');other.start('student');other.start('student');expect(()=>other.start('student')).toThrow();
 });
 it('does not allow mutation of public values to change stored answers or evidence',()=>{
  const engine=make(),id=engine.start('student'),q=engine.issue('student',id,'a');q.options.push('forged');q.prompt='modified';
  expect(()=>engine.submit('student',id,q.id,'forged')).toThrow();expect(engine.issue('student',id,'a').prompt).not.toBe('modified');
 });
});

it('can evaluate supported real generated questions without returning generator metadata', ()=>{
  const ref={grade:2 as const,topicId:'g2-ricxvebi100',subtopicId:'u01-roman-numerals'};
  const candidates=generateBatch(ref,40,{seed:123}).filter(q=>(!q.answerMode||q.answerMode==='choice')&&!q.visual&&!q.hint&&!q.pictures?.length&&!q.interaction&&!q.clocks?.length&&!q.orderItems?.length);
  expect(candidates.length).toBeGreaterThanOrEqual(10);
  let index=0;const answers=new Map(candidates.map(q=>[q.prompt,q.answer]));
  const engine=new PracticeEvidenceReview(()=>candidates[index++ % candidates.length]);const id=engine.start('student');
  for(let i=0;i<10;i++){const q=engine.issue('student',id,`request_${i}`);expect(Object.keys(q).sort()).toEqual(['answerMode','id','options','prompt']);expect(engine.submit('student',id,q.id,answers.get(q.prompt)!)).toEqual({correct:true});}
  expect(engine.finish('student',id).correct).toBe(10);
});
