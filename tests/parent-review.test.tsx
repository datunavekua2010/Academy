// @vitest-environment jsdom
import {act, cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import type {SupabaseClient} from '@supabase/supabase-js';
import {ParentApp, ParentReviewApp} from '../src/parent/ParentApp';
import {loadParentChild, loadParentChildren} from '../src/parent/data';
const parent='00000000-0000-4000-8000-000000000001';
const student='00000000-0000-4000-8000-000000000002';
const other='00000000-0000-4000-8000-000000000003';
let callback: ((event:string,session:unknown)=>void)|null;
let user: string|null, role: boolean, linked: boolean, attemptWait: Promise<void>|null;
let unsub: ReturnType<typeof vi.fn>;
const rpc=vi.fn(async (name:string, args?:Record<string,unknown>)=>{
  if(name==='parent_review_children') return {data:linked?[{student_id:student,display_name:'Child',grade:3}]:[],error:null};
  if(args?.p_student===other||args?.p_student_id===other)return {data:null,error:new Error('denied')};
  if(name==='parent_review_recent_attempts') {if(attemptWait)await attemptWait;return {data:[{attempt_id:'a',created_at:'2026-01-01',grade:3,topic_id:'math',subunit_id:'sub',score:25}],error:null};}
  if(name==='parent_published_lesson_notes') return {data:[{note_text:'Published',created_at:'2026-01-01',author_name:'Tutor'}],error:null};
  return {data:null,error:new Error('unknown')};
});
const client={auth:{getUser:async()=>({data:{user:user?{id:user}:null},error:null}),onAuthStateChange:(cb:typeof callback)=>{callback=cb;return {data:{subscription:{unsubscribe:unsub}}};},signOut:async()=>{user=null;callback?.('SIGNED_OUT',null);return {error:null};},signInWithPassword:async()=>({error:new Error('bad')})},from:()=>{const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({data:role?{role:'parent'}:null,error:null})};return q;},rpc} as unknown as SupabaseClient;
beforeEach(()=>{callback=null;user=parent;role=true;linked=true;attemptWait=null;unsub=vi.fn();rpc.mockClear();});
afterEach(cleanup);
it('is disabled by default even if a route is opened',()=>{render(<ParentApp/>);expect(screen.getByText('მშობლის ანგარიში ამჟამად ხელმისაწვდომი არ არის.')).toBeTruthy();});
it('loads only linked children and reduced summaries, and rejects other or lost links',async()=>{
  expect(await loadParentChildren(client,parent)).toEqual([{studentId:student,name:'Child',grade:3}]);
  expect((await loadParentChild(client,parent,student)).attempts[0].score).toBe(25);
  await expect(loadParentChild(client,parent,other)).rejects.toThrow('Unavailable');
  role=false;await expect(loadParentChildren(client,parent)).rejects.toThrow('Unavailable');
  role=true;user=other;await expect(loadParentChildren(client,parent)).rejects.toThrow('Unavailable');
  user=parent;linked=false;await expect(loadParentChild(client,parent,student)).rejects.toThrow('Unavailable');
});
it('shows unverified results and published notes, and clears on signout',async()=>{
  render(<ParentReviewApp client={client}/>);act(()=>callback?.('INITIAL_SESSION',{user:{id:parent}}));
  fireEvent.click(await screen.findByText('Child · 3 კლასი'));
  expect(await screen.findByText('Published')).toBeTruthy();expect(screen.getByText(/სერვერის მიერ დადასტურებული არ არის/)).toBeTruthy();
  fireEvent.click(screen.getByText('ანგარიშიდან გასვლა'));
  await waitFor(()=>expect(screen.queryByText('Published')).toBeNull());expect(screen.queryByText('Child · 3 კლასი')).toBeNull();
});
it('discards stale detail responses on signout and fails closed after role loss',async()=>{
  let release!:()=>void;attemptWait=new Promise<void>(resolve=>{release=resolve;});
  render(<ParentReviewApp client={client}/>);act(()=>callback?.('INITIAL_SESSION',{user:{id:parent}}));
  fireEvent.click(await screen.findByText('Child · 3 კლასი'));
  await waitFor(()=>expect(rpc).toHaveBeenCalledWith('parent_review_recent_attempts',{p_student:student}));
  act(()=>{user=null;callback?.('SIGNED_OUT',null);});await act(async()=>{release();await Promise.resolve();});expect(screen.queryByText('Published')).toBeNull();
  user=parent;role=false;act(()=>callback?.('TOKEN_REFRESHED',{user:{id:parent}}));await screen.findByRole('alert');expect(screen.queryByText('Child · 3 კლასი')).toBeNull();
});
it('does not offer password fallback when Google is unavailable',()=>{
  render(<ParentReviewApp client={client}/>);
  act(()=>callback?.('INITIAL_SESSION',null));
  expect(screen.getByText(/Google-ით შესვლა ამ გარემოში ამჟამად მიუწვდომელია/)).toBeTruthy();
  expect(screen.queryByLabelText('პაროლი')).toBeNull();
});
it('refreshes linked children and clears previously displayed details after revocation',async()=>{
  render(<ParentReviewApp client={client}/>);act(()=>callback?.('INITIAL_SESSION',{user:{id:parent}}));
  fireEvent.click(await screen.findByText('Child · 3 კლასი'));
  expect(await screen.findByText('Published')).toBeTruthy();
  linked=false;
  fireEvent.click(screen.getByRole('button',{name:'მონაცემების განახლება'}));
  expect(screen.queryByText('Published')).toBeNull();
  expect(await screen.findByText('დაკავშირებული მოსწავლე არ მოიძებნა.')).toBeTruthy();
  expect(screen.queryByText('Child · 3 კლასი')).toBeNull();
});
