import {describe,it,expect} from 'vitest';
import {IDBFactory} from 'fake-indexeddb';
import {openReviewAttemptOutbox} from '../src/practice/reviewAttemptOutbox';
import type {PendingAttempt} from '../src/practice/supabaseStore';
const a='00000000-0000-4000-8000-000000000001',b='00000000-0000-4000-8000-000000000002';
function item(id:string,score=4):PendingAttempt {return {assignmentId:null,attempt:{id,assignmentId:null,ref:{grade:2,topicId:'t',subtopicId:'s'},key:'key',score,correct:1,incorrect:0,startedAt:'2026-01-01T00:00:00Z',finishedAt:'2026-01-01T00:01:00Z',seconds:60,completed:false,answers:[]}};}
describe('review-only attempt outbox',()=>{
 it('survives reopen, isolates namespaces and acknowledges only an exact payload',async()=>{
  const factory=new IDBFactory(),box=await openReviewAttemptOutbox(factory,'test');await box.enqueue(a,item('one'));await box.enqueue(b,item('other'));box.close();
  const reopened=await openReviewAttemptOutbox(factory,'test');expect(await reopened.list(a)).toEqual([item('one')]);expect(await reopened.list(b)).toEqual([item('other')]);
  await expect(reopened.acknowledge(a,item('one',99))).rejects.toThrow('conflict');expect(await reopened.list(a)).toEqual([item('one')]);
  await reopened.acknowledge(a,item('one'));await reopened.acknowledge(a,item('one'));expect(await reopened.list(a)).toEqual([]);expect(await reopened.list(b)).toEqual([item('other')]);reopened.close();
 });
 it('serializes competing tabs and rejects conflicting retries without overwriting',async()=>{
  const factory=new IDBFactory(),one=await openReviewAttemptOutbox(factory,'test'),two=await openReviewAttemptOutbox(factory,'test');
  const results=await Promise.allSettled([one.enqueue(a,item('same')),two.enqueue(a,item('same',99))]);
  expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(results.filter(r=>r.status==='rejected')).toHaveLength(1);
  const rows=await one.list(a);expect(rows).toHaveLength(1);await two.enqueue(a,rows[0]);expect(await one.list(a)).toEqual(rows);one.close();two.close();
 });
 it('enforces quota atomically per student but allows an existing exact retry',async()=>{
  const factory=new IDBFactory(),one=await openReviewAttemptOutbox(factory,'test'),two=await openReviewAttemptOutbox(factory,'test');
  for(let i=0;i<49;i++)await one.enqueue(a,item(`attempt-${i}`));
  const results=await Promise.allSettled([one.enqueue(a,item('last-a')),two.enqueue(a,item('last-b'))]);
  expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(await one.list(a)).toHaveLength(50);
  await one.enqueue(a,item('attempt-0'));await expect(one.enqueue(a,item('overflow'))).rejects.toThrow('full');
  await one.enqueue(b,item('separate'));expect(await two.list(b)).toHaveLength(1);one.close();two.close();
 });
 it('explicitly discards one owner without deleting another owner',async()=>{
  const factory=new IDBFactory(),box=await openReviewAttemptOutbox(factory,'test');
  await box.enqueue(a,item('one'));await box.enqueue(a,item('two'));await box.enqueue(b,item('three'));
  await box.discardOwner(a);expect(await box.list(a)).toEqual([]);expect(await box.list(b)).toEqual([item('three')]);box.close();
 });
 it('fails closed on corrupted stored payloads until explicitly discarded',async()=>{
  const factory=new IDBFactory(),box=await openReviewAttemptOutbox(factory,'test');
  await box.enqueue(a,item('one'));box.close();
  const db=await new Promise<IDBDatabase>((resolve,reject)=>{const req=factory.open('test',1);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
  await new Promise<void>((resolve,reject)=>{const tx=db.transaction('attempts','readwrite');tx.objectStore('attempts').put({studentId:a,attemptId:'bad',payload:{bad:true},createdAt:1});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();
  const reopened=await openReviewAttemptOutbox(factory,'test');await expect(reopened.list(a)).rejects.toThrow('Invalid stored');await reopened.discardOwner(a);expect(await reopened.list(a)).toEqual([]);reopened.close();
 });
 it('does not silently discard invalid, oversized, or storage-failure data',async()=>{
  const factory=new IDBFactory(),box=await openReviewAttemptOutbox(factory,'test');
  await expect(box.enqueue('invalid',item('one'))).rejects.toThrow();
  const big=item('huge');big.attempt.key='x'.repeat(210000);await expect(box.enqueue(a,big)).rejects.toThrow('oversized');
  const inconsistent=item('bad');inconsistent.attempt.assignmentId='00000000-0000-4000-8000-000000000003';await expect(box.enqueue(a,inconsistent)).rejects.toThrow('Invalid');
  await box.enqueue(a,item('one'));box.close();await expect(box.list(a)).rejects.toThrow('unavailable');
  const again=await openReviewAttemptOutbox(factory,'test');expect(await again.list(a)).toEqual([item('one')]);again.close();
 });
});
