import {it,expect,vi} from 'vitest';
import {IDBFactory} from 'fake-indexeddb';
import {openReviewAttemptOutbox} from '../src/practice/reviewAttemptOutbox';
import {browserOutboxLock,ReviewOutboxCoordinator,type OutboxLock} from '../src/practice/reviewOutboxCoordinator';
import type {PendingAttempt} from '../src/practice/supabaseStore';
const owner='00000000-0000-4000-8000-000000000001';
const item:PendingAttempt={assignmentId:null,attempt:{id:'a',assignmentId:null,ref:{grade:2,topicId:'t',subtopicId:'s'},key:'key',score:4,correct:1,incorrect:0,startedAt:'2026-01-01T00:00:00Z',finishedAt:'2026-01-01T00:01:00Z',seconds:60,completed:false,answers:[]}};
function locks():OutboxLock {const held=new Map<string,Promise<unknown>>();return async (key,fn)=>{const before=held.get(key)??Promise.resolve();const result=before.catch(()=>{}).then(fn);held.set(key,result);try{return await result;}finally{if(held.get(key)===result)held.delete(key);}};}
it('requires consent for storage and fails closed without a lock facility or verified owner',async()=>{
 expect(()=>browserOutboxLock(undefined)).toThrow();const box=await openReviewAttemptOutbox(new IDBFactory(),'test');let valid=true;
 const c=new ReviewOutboxCoordinator(owner,box,locks(),async()=>valid,async()=>{});
 await expect(c.enqueue(item)).rejects.toThrow();await expect(c.enable(false)).rejects.toThrow();valid=false;await expect(c.enable(true)).rejects.toThrow();expect(await box.list(owner)).toEqual([]);box.close();
});
it('reopens durable records, sends once with two coordinated tabs, and acknowledges only confirmed payloads',async()=>{
 const f=new IDBFactory(),box=await openReviewAttemptOutbox(f,'test'),lock=locks(),send=vi.fn(async()=>{});
 const a=new ReviewOutboxCoordinator(owner,box,lock,async()=>true,send);await a.enable(true);await a.enqueue(item);box.close();
 const one=await openReviewAttemptOutbox(f,'test'),two=await openReviewAttemptOutbox(f,'test');const x=new ReviewOutboxCoordinator(owner,one,lock,async()=>true,send),y=new ReviewOutboxCoordinator(owner,two,lock,async()=>true,send);
 await x.enable(true);await y.enable(true);await Promise.all([x.drain(),y.drain()]);expect(send).toHaveBeenCalledTimes(1);expect(await one.list(owner)).toEqual([]);one.close();two.close();
});
it('keeps unconfirmed attempts after failure or authentication change, and allows verified discard without renewed consent',async()=>{
 const box=await openReviewAttemptOutbox(new IDBFactory(),'test');let valid=true,release!:()=>void,started!:()=>void;
 const startedPromise=new Promise<void>(resolve=>{started=resolve;});const wait=new Promise<void>(resolve=>{release=resolve;});
 const c=new ReviewOutboxCoordinator(owner,box,locks(),async()=>valid,async()=>{started();await wait;});await c.enable(true);await c.enqueue(item);
 const running=c.drain();await startedPromise;valid=false;c.cancel();release();await expect(running).rejects.toThrow('Owner unavailable');expect(await box.list(owner)).toEqual([item]);
 valid=true;await c.discard();expect(await box.list(owner)).toEqual([]);await expect(c.enqueue(item)).rejects.toThrow();box.close();
});
it('does not acknowledge a failed upload and retries the same record',async()=>{
 const box=await openReviewAttemptOutbox(new IDBFactory(),'test');const send=vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
 const c=new ReviewOutboxCoordinator(owner,box,locks(),async()=>true,send);await c.enable(true);await c.enqueue(item);await expect(c.drain()).rejects.toThrow('offline');expect(await box.list(owner)).toEqual([item]);await c.drain();expect(send).toHaveBeenCalledTimes(2);expect(await box.list(owner)).toEqual([]);box.close();
});
