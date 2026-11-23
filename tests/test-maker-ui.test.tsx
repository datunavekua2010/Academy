// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { TestMaker } from '../src/teacher/TestMaker';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { getTopic } from '../src/practice/curriculum';
import { drawTemplate } from '../src/teacher/testMakerData';
import type { GeneratedQuestion } from '../src/practice/generator';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it('filters the real curriculum, adds a question, saves and reopens frozen data', async () => {
  let q: GeneratedQuestion | undefined;
  for (const template of TEMPLATE_REGISTRY.all) { try { q=drawTemplate(template.id,1); break; } catch { /* unsupported */ } }
  if (!q) throw new Error('No paper-compatible question');
  const topic=getTopic(q.grade,q.topicId)!; const unit=topic.units.find((u)=>u.subtopics.some((s)=>s.id===q!.subtopicId))!;
  let rows: any[]=[];
  const rpc = vi.fn((name:string,args:any) => {
    if (name==='teacher_tests_list') return { order() { return this; }, range:async()=>({data:structuredClone(rows),error:null}) };
    if (name==='teacher_test_save') { const row={id:'test-id',teacher_id:'teacher',revision:1,created_at:'2026-01-01',updated_at:'2026-01-01',content:structuredClone(args.p_content)}; rows=[row]; return Promise.resolve({data:[row],error:null}); }
    return Promise.resolve({data:true,error:null});
  });
  const client={rpc} as unknown as SupabaseClient;
  const rendered=render(<TestMaker client={client} teacherId="teacher" />);
  await waitFor(()=>expect(screen.queryByText('ტესტები იტვირთება…')).toBeNull());
  fireEvent.click(screen.getByRole('button',{name:'დავალებების ბანკი'}));
  fireEvent.change(screen.getByLabelText('კლასი'),{target:{value:String(q.grade)}});
  fireEvent.change(screen.getByLabelText('თემა'),{target:{value:q.topicId}});
  fireEvent.change(screen.getByLabelText('თავი'),{target:{value:unit.id}});
  fireEvent.change(screen.getByLabelText('ქვეთემა'),{target:{value:q.subtopicId}});
  const preview=screen.getByText(q.prompt).closest('li')!;
  expect(within(preview).getByRole('button',{name:'ახალი ვარიანტი'})).toBeTruthy();
  fireEvent.click(within(preview).getByRole('button',{name:'დამატება'}));
  expect(screen.getByText(/1 დავალება · 1 ქულა/)).toBeTruthy();
  fireEvent.click(within(preview).getByRole('button',{name:'დამატება'}));
  expect(screen.getByText(/1 გამოტოვებულია/)).toBeTruthy();
  fireEvent.click(screen.getByLabelText('დუბლირების დაშვება'));
  fireEvent.click(within(preview).getByRole('button',{name:'დამატება'}));
  expect(screen.getByText(/2 დავალება · 2 ქულა/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'პარამეტრები და დალაგება'}));
  fireEvent.change(screen.getByLabelText('სათაური'),{target:{value:'მათემატიკის ტესტი'}});
  fireEvent.change(screen.getAllByLabelText('ქულა')[0],{target:{value:'5'}});
  expect(screen.getByText(/2 დავალება · 6 ქულა/)).toBeTruthy();
  fireEvent.click(screen.getAllByRole('button',{name:'ქვემოთ'})[0]);
  expect((screen.getAllByLabelText('ქულა')[1] as HTMLInputElement).value).toBe('5');
  fireEvent.click(screen.getAllByRole('button',{name:'ამოღება'})[0]);
  expect(screen.getByText(/1 დავალება · 5 ქულა/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'შენახვა'}));
  expect(await screen.findByText('ტესტი შენახულია.')).toBeTruthy();
  expect(rows[0].content.questions[0].question.answer).toBe(q.answer);
  rendered.unmount(); render(<TestMaker client={client} teacherId="teacher" />);
  await waitFor(()=>expect(screen.queryByText('ტესტები იტვირთება…')).toBeNull());
  fireEvent.click(screen.getByRole('button',{name:'შენახული ტესტები'}));
  fireEvent.click(screen.getByRole('button',{name:'გახსნა'}));
  fireEvent.click(screen.getByRole('button',{name:'პარამეტრები და დალაგება'}));
  expect((screen.getByLabelText('სათაური') as HTMLInputElement).value).toBe('მათემატიკის ტესტი');
  expect(screen.getByText(`1. ${q.prompt}`)).toBeTruthy();
  expect((screen.getByLabelText('ქულა') as HTMLInputElement).value).toBe('5');
});
