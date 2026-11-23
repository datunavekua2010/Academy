// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { shownKey } from '../src/practice/identity';
import { TestMaker } from '../src/teacher/TestMaker';
import { generateSections, regenerateQuestion, SectionGenerationError, validateSections, type ExerciseSection } from '../src/teacher/testMakerData';

const mult: ExerciseSection = {id:'one',grade:3,topicId:'g3-gamravleba',unitId:'g3-gamravleba',subtopicId:'u04-full-table',templateId:'g2-times-table',quantity:2};
const divide: ExerciseSection = {id:'two',grade:3,topicId:'g3-gayofa',unitId:'g3-gayofa',subtopicId:'u05-division-within-10',templateId:'g3-divide-exact',quantity:2};
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it('generates every requested question in section order, uniquely, with stable answers and supports regeneration', async () => {
  let n=0; const rows=await generateSections([mult,divide],3,()=>++n);
  expect(rows).toHaveLength(4);
  expect(rows.map((r)=>r.question.templateId)).toEqual(['g2-times-table','g2-times-table','g3-divide-exact','g3-divide-exact']);
  expect(new Set(rows.map((r)=>shownKey(r.question))).size).toBe(4);
  expect(rows.every((r)=>r.points===3)).toBe(true);
  for(const {question:q} of rows) {
    if(q.templateId==='g2-times-table') expect(Number(q.answer)).toBe(Number(q.vars.a)*Number(q.vars.b));
    else expect(Number(q.answer)).toBe(Number(q.vars.a)/Number(q.vars.b));
  }
  const regenerated=await regenerateQuestion(rows[0],rows.slice(1),()=>++n);
  expect(regenerated.points).toBe(3); expect(shownKey(regenerated.question)).not.toBe(shownKey(rows[0].question));
  expect(rows.slice(1).map((x)=>shownKey(x.question))).not.toContain(shownKey(regenerated.question));
});
it('accepts the same template in multiple sections and refuses invalid or insufficient results', async () => {
  let n=0; const result=await generateSections([mult,{...mult,id:'other'}],1,()=>++n); expect(result).toHaveLength(4); expect(new Set(result.map((r)=>shownKey(r.question))).size).toBe(4);
  await expect(generateSections([{...mult,quantity:0}],1,()=>1)).rejects.toThrow('Invalid sections');
  await expect(generateSections([{...mult,quantity:1.5}],1,()=>1)).rejects.toThrow('Invalid sections');
  await expect(generateSections([{...mult,quantity:null}],1,()=>1)).rejects.toThrow('Invalid sections');
  await expect(generateSections([{...mult,quantity:100},{...divide,quantity:1}],1,()=>1)).rejects.toThrow('Invalid sections');
  await expect(generateSections([{...mult,templateId:''}],1,()=>1)).rejects.toThrow('Invalid sections');
  const error=await generateSections([mult],1,()=>1).then(()=>null,(e)=>e);
  expect(error).toBeInstanceOf(SectionGenerationError); expect(error.requested).toBe(2); expect(error.produced).toBe(1);
  expect(validateSections([{...mult,templateId:''}],false)).toBe(2);
});
function fillSection(fieldset: HTMLElement, data: ExerciseSection) {
  fireEvent.change(within(fieldset).getByLabelText('კლასი'),{target:{value:String(data.grade)}});
  fireEvent.change(within(fieldset).getByLabelText('თემა'),{target:{value:data.topicId}});
  fireEvent.change(within(fieldset).getByLabelText('თავი'),{target:{value:data.unitId}});
  fireEvent.change(within(fieldset).getByLabelText('ქვეთემა'),{target:{value:data.subtopicId}});
  fireEvent.change(within(fieldset).getByLabelText('სავარჯიშოს შაბლონი'),{target:{value:data.templateId}});
  fireEvent.change(within(fieldset).getByLabelText('რაოდენობა'),{target:{value:String(data.quantity)}});
}
it('edits independent sections, generates and saves one test, then restores frozen questions and section settings', async () => {
  let rows: any[]=[];
  const rpc = vi.fn((name:string,args:any) => {
    if (name==='teacher_tests_list') return { order() { return this; }, range:async()=>({data:structuredClone(rows),error:null}) };
    if (name==='teacher_test_save') { const row={id:'test-id',teacher_id:'teacher',revision:1,created_at:'2026-01-01',updated_at:'2026-01-01',content:structuredClone(args.p_content)}; rows=[row]; return Promise.resolve({data:[row],error:null}); }
    return Promise.resolve({data:true,error:null});
  });
  const client={rpc} as unknown as SupabaseClient;
  const rendered=render(<TestMaker client={client} teacherId="teacher" />);
  await waitFor(()=>expect(screen.queryByText('ტესტები იტვირთება…')).toBeNull());
  const add=screen.getByRole('button',{name:'+ სავარჯიშოს ტიპის დამატება'});
  fireEvent.click(add); fireEvent.click(add);
  let one=screen.getByRole('group',{name:'სავარჯიშოს ტიპი 1'}), two=screen.getByRole('group',{name:'სავარჯიშოს ტიპი 2'});
  fillSection(one,mult); fillSection(two,divide);
  expect((within(one).getByLabelText('სავარჯიშოს შაბლონი') as HTMLSelectElement).value).toBe(mult.templateId);
  expect((within(two).getByLabelText('სავარჯიშოს შაბლონი') as HTMLSelectElement).value).toBe(divide.templateId);
  expect(screen.getByText('4 დავალება · 2 სავარჯიშოს ტიპი')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('ნაგულისხმევი ქულა თითო დავალებაზე'),{target:{value:'3'}});
  fireEvent.click(screen.getByRole('button',{name:'ტესტის შექმნა'}));
  expect(await screen.findByText('შეიქმნა 4 განსხვავებული დავალება.')).toBeTruthy();
  expect(screen.getByText(/4 დავალება · 12 ქულა/)).toBeTruthy();
  let points=screen.getAllByLabelText('ქულა'); expect(points).toHaveLength(4);
  fireEvent.change(points[0],{target:{value:'4'}});
  fireEvent.click(screen.getAllByRole('button',{name:'ქვემოთ'})[0]);
  points=screen.getAllByLabelText('ქულა'); expect((points[1] as HTMLInputElement).value).toBe('4');
  fireEvent.click(screen.getAllByRole('button',{name:'ამოღება'})[0]);
  expect(screen.getByText(/3 დავალება · 10 ქულა/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'შენახვა'}));
  expect(await screen.findByText('ტესტი შენახულია.')).toBeTruthy();
  expect(rows[0].content.sections.map((s:ExerciseSection)=>[s.templateId,s.quantity])).toEqual([['g2-times-table',2],['g3-divide-exact',2]]);
  expect(rows[0].content.defaultPoints).toBe(3);
  const snapshot=structuredClone(rows[0].content.questions);
  rendered.unmount(); render(<TestMaker client={client} teacherId="teacher" />);
  await waitFor(()=>expect(screen.queryByText('ტესტები იტვირთება…')).toBeNull());
  fireEvent.click(screen.getByRole('button',{name:'შენახული ტესტები'})); fireEvent.click(screen.getByRole('button',{name:'გახსნა'}));
  one=screen.getByRole('group',{name:'სავარჯიშოს ტიპი 1'}); two=screen.getByRole('group',{name:'სავარჯიშოს ტიპი 2'});
  expect((within(one).getByLabelText('რაოდენობა') as HTMLInputElement).value).toBe('2');
  expect((within(two).getByLabelText('სავარჯიშოს შაბლონი') as HTMLSelectElement).value).toBe('g3-divide-exact');
  expect((screen.getByLabelText('ნაგულისხმევი ქულა თითო დავალებაზე') as HTMLInputElement).value).toBe('3');
  fireEvent.click(screen.getByRole('button',{name:'პარამეტრები და დალაგება'}));
  expect(screen.getAllByLabelText('ქულა').map((el)=>(el as HTMLInputElement).value)).toEqual(snapshot.map((v:any)=>String(v.points)));
  expect(screen.getByText(`1. ${snapshot[0].question.prompt}`)).toBeTruthy();
});
it('reports an insufficient template without replacing the previously generated test', async () => {
  vi.spyOn(crypto,'getRandomValues').mockImplementation((array) => { (array as Uint32Array)[0]=1; return array; });
  render(<TestMaker client={null} teacherId={null} />);
  fireEvent.click(screen.getByRole('button',{name:'+ სავარჯიშოს ტიპის დამატება'}));
  let section=screen.getByRole('group',{name:'სავარჯიშოს ტიპი 1'});
  fillSection(section,{...mult,quantity:1});
  fireEvent.click(screen.getByRole('button',{name:'ტესტის შექმნა'}));
  expect(await screen.findByText('შეიქმნა 1 განსხვავებული დავალება.')).toBeTruthy();
  const prior=screen.getByText(/^1\. 5 × 2 = \?/).textContent;
  fireEvent.click(screen.getByRole('button',{name:'სავარჯიშოს ტიპები'}));
  section=screen.getByRole('group',{name:'სავარჯიშოს ტიპი 1'});
  fireEvent.change(within(section).getByLabelText('რაოდენობა'),{target:{value:'2'}});
  fireEvent.click(screen.getByRole('button',{name:'ტესტის შექმნა'}));
  fireEvent.click(screen.getByRole('button',{name:'დიახ, შექმნა'}));
  expect((await screen.findByRole('alert')).textContent).toContain('ტესტი არ შეცვლილა');
  fireEvent.click(screen.getByRole('button',{name:'პარამეტრები და დალაგება'}));
  expect(screen.getByText(prior!)).toBeTruthy();
  expect(screen.getByText(/1 დავალება · 1 ქულა/)).toBeTruthy();
});
it('preserves invalid quantities without silently changing them and permits removing one section', () => {
  render(<TestMaker client={null} teacherId={null} />);
  const add=screen.getByRole('button',{name:'+ სავარჯიშოს ტიპის დამატება'});
  fireEvent.click(add); fireEvent.click(add);
  let first=screen.getByRole('group',{name:'სავარჯიშოს ტიპი 1'});
  fireEvent.change(within(first).getByLabelText('რაოდენობა'),{target:{value:'0'}});
  expect((within(first).getByLabelText('რაოდენობა') as HTMLInputElement).value).toBe('0');
  expect(screen.getByRole('alert').textContent).toContain('1-დან 100-მდე');
  fireEvent.click(within(first).getByRole('button',{name:'ტიპის ამოღება'}));
  first=screen.getByRole('group',{name:'სავარჯიშოს ტიპი 1'});
  expect((within(first).getByLabelText('რაოდენობა') as HTMLInputElement).value).toBe('1');
  expect(screen.getByText('1 დავალება · 1 სავარჯიშოს ტიპი')).toBeTruthy();
});
