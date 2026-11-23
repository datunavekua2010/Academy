// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { PendingAttempt } from '../src/practice/supabaseStore';
import type { SessionState } from '../src/practice/session';

const mock = vi.hoisted(() => ({
  auth: null as null | ((event: string, session: unknown) => void),
  fail: false,
  send: vi.fn(),
  resolveSend: null as null | (() => void),
  block: false,
}));
vi.mock('../src/lib/supabase', () => ({ supabaseConfiguration: { mode: 'connected', client: {
  auth: { onAuthStateChange: (cb: typeof mock.auth) => { mock.auth = cb; return {data:{subscription:{unsubscribe(){}}}}; }, signOut: async()=>({error:null}) },
  from: (table: string) => { const q = {select:()=>q,eq:()=>q,maybeSingle: async()=>({error:null,data:table==='profiles'?{display_name:'Student',first_name:'Student'}:table==='user_roles'?{role:'student'}:{grade:2}})}; return q; },
} } }));
vi.mock('../src/practice/supabaseStore', () => ({
  loadStudentPractice: async () => ({attempts:[],assignments:[]}),
  saveStudentAttempt: async (_client: unknown, studentId: string, item: PendingAttempt) => {
    mock.send(studentId,item);
    if (mock.block) await new Promise<void>(resolve=>{mock.resolveSend=resolve;});
    if (mock.fail) throw new Error('offline');
  },
}));
import { AcademyStudentSessionProvider, useStudentSession } from '../src/student/session';
import { PracticeProvider, usePractice } from '../src/practice/PracticeProvider';
import { ConnectedPracticeMemory } from '../src/practice/connectedMemory';

function Controls() {
  const {session,startPractice,stop}=usePractice();
  return <><button onClick={()=>startPractice({grade:2,topicId:'g2-ricxvebi100',subtopicId:'u01-roman-numerals'})}>start</button><button onClick={stop}>stop</button><span data-testid="session">{session?.id ?? 'none'}</span></>;
}
function Boundary(){
  const {student,practiceMemory,practiceRevision}=useStudentSession();
  return student ? <PracticeProvider key={student.id} mode="connected" studentId={student.id} practiceMemory={practiceMemory} practiceRevision={practiceRevision} initialGrade={2}><Controls /></PracticeProvider> : <span>verifying</span>;
}
const session=(id:string)=>({user:{id}});
beforeEach(()=>{mock.auth=null;mock.fail=false;mock.block=false;mock.resolveSend=null;mock.send.mockReset();});
afterEach(cleanup);
it('preserves an in-progress session through a same-user auth recheck, not a different account', async()=>{
  render(<AcademyStudentSessionProvider><Boundary /></AcademyStudentSessionProvider>);
  act(()=>mock.auth?.('INITIAL_SESSION',session('student-a')));
  await screen.findByText('start');fireEvent.click(screen.getByText('start'));
  const id=screen.getByTestId('session').textContent;expect(id).not.toBe('none');
  act(()=>mock.auth?.('TOKEN_REFRESHED',session('student-a')));
  await screen.findByText('start');expect(screen.getByTestId('session').textContent).toBe(id);
  act(()=>mock.auth?.('SIGNED_IN',session('student-b')));
  await screen.findByText('start');expect(screen.getByTestId('session').textContent).toBe('none');
});
it('resumes an unsaved result after same-user verification and does not send it as a different user',async()=>{
  mock.fail=true;
  render(<AcademyStudentSessionProvider><Boundary /></AcademyStudentSessionProvider>);
  act(()=>mock.auth?.('INITIAL_SESSION',session('student-a')));await screen.findByText('start');
  fireEvent.click(screen.getByText('start'));fireEvent.click(screen.getByText('stop'));
  await waitFor(()=>expect(mock.send).toHaveBeenCalledTimes(1));
  await screen.findByText('ხელახლა შენახვა');
  act(()=>mock.auth?.('TOKEN_REFRESHED',session('student-a')));
  await waitFor(()=>expect(mock.send).toHaveBeenCalledTimes(2));
  expect(mock.send.mock.calls.every(([id])=>id==='student-a')).toBe(true);
  act(()=>mock.auth?.('SIGNED_IN',session('student-b')));await screen.findByText('start');
  expect(mock.send).toHaveBeenCalledTimes(2);
});
it('serializes competing workers, retains failures, and stops after unmount',async()=>{
  const memory=new ConnectedPracticeMemory();
  const item=(id:string)=>({attempt:{id} as PendingAttempt['attempt'],assignmentId:null});
  memory.enqueue(item('one'));memory.enqueue(item('two'));
  let release!:()=>void;let active=true;const sent:string[]=[];
  const first=memory.drain(async value=>{sent.push(value.attempt.id);await new Promise<void>(resolve=>{release=resolve;});},()=>active);
  const other=memory.drain(async value=>{sent.push(value.attempt.id);},()=>true);
  active=false;release();await first;await other;
  expect(sent).toEqual(['one','two']);expect(memory.size).toBe(0);
  memory.enqueue(item('three'));expect(await memory.drain(async()=>{throw new Error('offline');},()=>true)).toBe(false);
  expect(memory.size).toBe(1);expect(await memory.drain(async()=>{},()=>true)).toBe(true);expect(memory.size).toBe(0);
  memory.draft={id:'draft'} as SessionState;expect(memory.draft.id).toBe('draft');
});

it('does not hide a newly acknowledged attempt when an older read finishes afterward', async()=>{
  const memory = new ConnectedPracticeMemory();
  const attempt = {id:'new',score:4} as PendingAttempt['attempt'];
  memory.enqueue({attempt,assignmentId:null});
  await memory.drain(async()=>{},()=>true);
  expect(memory.size).toBe(0);
  expect(memory.mergeFetched([])).toEqual([attempt]);
  expect(memory.mergeFetched([attempt])).toEqual([attempt]);
  expect(memory.mergeFetched([])).toEqual([]);
});

it('keeps the pending version visible if a fetched row has a conflicting id',()=>{
  const memory=new ConnectedPracticeMemory();
  const attempt={id:'same',score:4} as PendingAttempt['attempt'];
  memory.enqueue({attempt,assignmentId:null});
  expect(memory.mergeFetched([{id:'same',score:99} as PendingAttempt['attempt']])).toEqual([attempt]);
});

it('does not duplicate an in-flight save when verification remounts the provider',async()=>{
  mock.block=true;
  render(<AcademyStudentSessionProvider><Boundary /></AcademyStudentSessionProvider>);
  act(()=>mock.auth?.('INITIAL_SESSION',session('student-a')));await screen.findByText('start');
  fireEvent.click(screen.getByText('start'));fireEvent.click(screen.getByText('stop'));
  await waitFor(()=>expect(mock.resolveSend).not.toBeNull());
  act(()=>mock.auth?.('TOKEN_REFRESHED',session('student-a')));await screen.findByText('start');
  await act(async()=>{mock.resolveSend?.();await Promise.resolve();});
  expect(mock.send).toHaveBeenCalledTimes(1);
});
it('drops in-memory work on sign-out, including when the same user signs back in',async()=>{
  render(<AcademyStudentSessionProvider><Boundary /></AcademyStudentSessionProvider>);
  act(()=>mock.auth?.('INITIAL_SESSION',session('student-a')));await screen.findByText('start');
  fireEvent.click(screen.getByText('start'));expect(screen.getByTestId('session').textContent).not.toBe('none');
  act(()=>mock.auth?.('SIGNED_OUT',null));
  act(()=>mock.auth?.('SIGNED_IN',session('student-a')));await screen.findByText('start');
  expect(screen.getByTestId('session').textContent).toBe('none');
});

it('does not carry work across batched sign-out and same-user sign-in',async()=>{
  render(<AcademyStudentSessionProvider><Boundary /></AcademyStudentSessionProvider>);
  act(()=>mock.auth?.('INITIAL_SESSION',session('student-a')));await screen.findByText('start');
  fireEvent.click(screen.getByText('start'));expect(screen.getByTestId('session').textContent).not.toBe('none');
  act(()=>{mock.auth?.('SIGNED_OUT',null);mock.auth?.('SIGNED_IN',session('student-a'));});
  await screen.findByText('start');expect(screen.getByTestId('session').textContent).toBe('none');
});

it('pauses the queue immediately at an auth boundary, including an in-flight request',async()=>{
  const memory=new ConnectedPracticeMemory();
  for(const id of ['one','two'])memory.enqueue({attempt:{id} as PendingAttempt['attempt'],assignmentId:null});
  let release!:()=>void;const send=vi.fn(async()=>{await new Promise<void>(resolve=>{release=resolve;});});
  const work=memory.drain(send,()=>true);memory.pause();release();await work;
  expect(send).toHaveBeenCalledTimes(1);expect(memory.size).toBe(1);
  await memory.drain(send,()=>true);expect(send).toHaveBeenCalledTimes(1);
  memory.resume();await memory.drain(async()=>{},()=>true);expect(memory.size).toBe(0);
});
