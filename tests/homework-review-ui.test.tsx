// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ConnectedHomework } from '../src/teacher/ConnectedHomework';
import { getGrade } from '../src/practice/curriculum';
import { hasTemplates } from '../src/practice/generator';
import type { TeacherData } from '../src/teacher/data';

beforeEach(() => sessionStorage.clear());
afterEach(() => { cleanup(); sessionStorage.clear(); vi.restoreAllMocks(); });
const data: TeacherData = { students: [{ id: 'student', name: 'Student', grade: 1 }], assignments: [{id:'homework',studentId:'student',grade:1,topicId:'t',subunitId:'s',assignedAt:'2026-01-01',dueAt:'2099-01-01',title:'Task',instructions:'Read',status:'published',revision:1}], attempts: [], invalidAttempts:0 };
it('retries an ambiguous create using the exact original request and never changes the form in between', async () => {
 const rpc = vi.fn().mockResolvedValueOnce({data:null,error:{message:'network'}}).mockResolvedValueOnce({data:['id'],error:null}); const refresh=vi.fn();
 render(<ConnectedHomework client={{rpc} as unknown as SupabaseClient} teacherId="teacher" data={data} onRefresh={refresh}/>);
 fireEvent.change(screen.getByLabelText('მოსწავლე'),{target:{value:'student'}});fireEvent.change(screen.getByLabelText('სათაური'),{target:{value:'Math'}});
 fireEvent.change(screen.getByLabelText('კლასი'),{target:{value:'1'}});
 const topic=getGrade(1).topics.find(t=>t.units.some(u=>u.subtopics.some(s=>hasTemplates({grade:1,topicId:t.id,subtopicId:s.id}))))!;
 const unit=topic.units.find(u=>u.subtopics.some(s=>hasTemplates({grade:1,topicId:topic.id,subtopicId:s.id})))!;
 const sub=unit.subtopics.find(s=>hasTemplates({grade:1,topicId:topic.id,subtopicId:s.id}))!;
 fireEvent.change(screen.getByLabelText('თემა'),{target:{value:topic.id}});fireEvent.change(screen.getByLabelText('ნაწილი'),{target:{value:unit.id}});fireEvent.click(within(screen.getByRole('group',{name:'ქვეთემები'})).getByRole('checkbox',{name:sub.title}));
 fireEvent.change(screen.getByLabelText('ვადა'),{target:{value:'2099-12-31T12:00'}});fireEvent.click(screen.getByRole('button',{name:'დავალების გაგზავნა'}));
 expect(await screen.findByRole('alert')).toBeTruthy();expect(screen.getByLabelText('სათაური').matches(':disabled')).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'ხელახლა ცდა'}));await vi.waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
 expect(rpc).toHaveBeenCalledTimes(2);expect(rpc.mock.calls[1]).toEqual(rpc.mock.calls[0]);expect(refresh).toHaveBeenCalledTimes(1);
});
it('retries cancellation and displays only explicitly unverified activity', async () => {
 const rpc=vi.fn().mockResolvedValueOnce({data:null,error:{message:'timeout'}}).mockResolvedValueOnce({data:true,error:null}); const refresh=vi.fn();
 render(<ConnectedHomework client={{rpc} as unknown as SupabaseClient} teacherId="teacher" data={data} onRefresh={refresh}/>);
 expect(screen.getByText(/მტკიცებულებას არ წარმოადგენს/)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'გაუქმება'}));await screen.findByRole('alert');fireEvent.click(screen.getByRole('button',{name:'ხელახლა ცდა'}));
 await vi.waitFor(()=>expect(refresh).toHaveBeenCalledTimes(1));expect(rpc.mock.calls[0]).toEqual(['teacher_homework_cancel',{p_id:'homework',p_revision:1}]);expect(rpc.mock.calls[1]).toEqual(rpc.mock.calls[0]);
});


it('recovers after same-tab navigation and fences an in-flight create without storing homework content', async () => {
 let finish!: (value: unknown) => void;
 const rpc=vi.fn().mockImplementationOnce(() => new Promise(resolve => { finish=resolve; })).mockResolvedValueOnce({data:'abandoned',error:null});
 const client={rpc} as unknown as SupabaseClient;const refresh=vi.fn();
 const view=render(<ConnectedHomework client={client} teacherId="teacher" data={data} onRefresh={refresh}/>);
 fireEvent.change(screen.getByLabelText('მოსწავლე'),{target:{value:'student'}});fireEvent.change(screen.getByLabelText('სათაური'),{target:{value:'Private title'}});fireEvent.change(screen.getByLabelText('მითითება'),{target:{value:'Private instruction'}});fireEvent.change(screen.getByLabelText('კლასი'),{target:{value:'1'}});
 const topic=getGrade(1).topics.find(t=>t.units.some(u=>u.subtopics.some(s=>hasTemplates({grade:1,topicId:t.id,subtopicId:s.id}))))!;
 const unit=topic.units.find(u=>u.subtopics.some(s=>hasTemplates({grade:1,topicId:topic.id,subtopicId:s.id})))!;const sub=unit.subtopics.find(s=>hasTemplates({grade:1,topicId:topic.id,subtopicId:s.id}))!;
 fireEvent.change(screen.getByLabelText('თემა'),{target:{value:topic.id}});fireEvent.change(screen.getByLabelText('ნაწილი'),{target:{value:unit.id}});fireEvent.click(within(screen.getByRole('group',{name:'ქვეთემები'})).getByRole('checkbox',{name:sub.title}));fireEvent.change(screen.getByLabelText('ვადა'),{target:{value:'2099-12-31T12:00'}});fireEvent.click(screen.getByRole('button',{name:'დავალების გაგზავნა'}));
 const marker=sessionStorage.getItem('axiom.homework.pending.v1:teacher')!;expect(marker).toMatch(/^[0-9a-f-]{36}$/);expect(JSON.stringify(sessionStorage)).not.toContain('Private');expect(rpc).toHaveBeenCalledTimes(1);
 view.unmount();render(<ConnectedHomework client={client} teacherId="teacher" data={data} onRefresh={refresh}/>);
 expect(screen.getByLabelText('სათაური').matches(':disabled')).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'მოთხოვნის შემოწმება'}));
 expect(await screen.findByText(/წინა მოთხოვნა არ შესრულდა/)).toBeTruthy();expect(rpc.mock.calls[1]).toEqual(['teacher_homework_resolve',{p_request:marker}]);expect(sessionStorage.length).toBe(0);
 // The abandoned old request may finish later; the unmounted component must not change current UI/storage.
 finish({data:null,error:{message:'fenced'}});await Promise.resolve();expect(refresh).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:'სიის განახლება და გაგრძელება'}));expect(refresh).toHaveBeenCalledTimes(1);
});

it('keeps recovery blocked on ambiguous resolution and scopes the marker to the teacher', async () => {
 const id='10000000-0000-4000-8000-000000000001';sessionStorage.setItem('axiom.homework.pending.v1:teacher',id);
 const rpc=vi.fn().mockResolvedValueOnce({data:null,error:{message:'timeout'}}).mockResolvedValueOnce({data:'published',error:null});
 const client={rpc} as unknown as SupabaseClient;render(<ConnectedHomework client={client} teacherId="teacher" data={data} onRefresh={vi.fn()}/>);
 fireEvent.click(screen.getByRole('button',{name:'მოთხოვნის შემოწმება'}));expect(await screen.findByRole('alert')).toBeTruthy();expect(sessionStorage.getItem('axiom.homework.pending.v1:teacher')).toBe(id);expect(screen.getByLabelText('სათაური').matches(':disabled')).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'მოთხოვნის შემოწმება'}));expect(await screen.findByText(/წინა მოთხოვნა შესრულდა/)).toBeTruthy();expect(rpc.mock.calls[0]).toEqual(rpc.mock.calls[1]);expect(sessionStorage.length).toBe(0);
});

it('fails closed when the marker is invalid or storage cannot be read', () => {
 sessionStorage.setItem('axiom.homework.pending.v1:teacher','invalid');const rpc=vi.fn();const client={rpc} as unknown as SupabaseClient;
 const view=render(<ConnectedHomework client={client} teacherId="teacher" data={data} onRefresh={vi.fn()}/>);
 expect(screen.getByRole('alert')).toBeTruthy();expect(screen.getByLabelText('სათაური').matches(':disabled')).toBe(true);expect(rpc).not.toHaveBeenCalled();view.unmount();
 vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('unavailable')});render(<ConnectedHomework client={client} teacherId="other" data={data} onRefresh={vi.fn()}/>);expect(screen.getByRole('alert')).toBeTruthy();expect(screen.getByLabelText('სათაური').matches(':disabled')).toBe(true);
});


it('does not send a create when the browser cannot persist its request marker', async () => {
 const rpc=vi.fn();const client={rpc} as unknown as SupabaseClient;
 render(<ConnectedHomework client={client} teacherId="teacher" data={data} onRefresh={vi.fn()}/>);
 fireEvent.change(screen.getByLabelText('მოსწავლე'),{target:{value:'student'}});fireEvent.change(screen.getByLabelText('სათაური'),{target:{value:'Math'}});fireEvent.change(screen.getByLabelText('კლასი'),{target:{value:'1'}});
 const topic=getGrade(1).topics.find(t=>t.units.some(u=>u.subtopics.some(s=>hasTemplates({grade:1,topicId:t.id,subtopicId:s.id}))))!;const unit=topic.units.find(u=>u.subtopics.some(s=>hasTemplates({grade:1,topicId:topic.id,subtopicId:s.id})))!;const sub=unit.subtopics.find(s=>hasTemplates({grade:1,topicId:topic.id,subtopicId:s.id}))!;
 fireEvent.change(screen.getByLabelText('თემა'),{target:{value:topic.id}});fireEvent.change(screen.getByLabelText('ნაწილი'),{target:{value:unit.id}});fireEvent.click(within(screen.getByRole('group',{name:'ქვეთემები'})).getByRole('checkbox',{name:sub.title}));fireEvent.change(screen.getByLabelText('ვადა'),{target:{value:'2099-12-31T12:00'}});
 vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota')});fireEvent.click(screen.getByRole('button',{name:'დავალების გაგზავნა'}));
 expect(screen.getByRole('alert')).toBeTruthy();expect(screen.getByLabelText('სათაური').matches(':disabled')).toBe(true);expect(rpc).not.toHaveBeenCalled();
});
