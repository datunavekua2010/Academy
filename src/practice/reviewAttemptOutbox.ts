/**
 * REVIEW-ONLY IndexedDB outbox. Not wired into the app and never opens storage
 * by itself. Same-origin scripts/devices can read these records; account IDs are
 * a namespace, NOT access control or encryption. Do not enable before privacy,
 * retention, shared-device and real-browser review.
 */
import type { PendingAttempt } from './supabaseStore';

const MAX_PENDING = 50;
const MAX_BYTES = 200_000; // Conservative local bound, not Postgres' binary JSON size.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Row = { studentId: string; attemptId: string; payload: PendingAttempt; createdAt: number };
const ownerOk = (id: string) => typeof id === 'string' && UUID.test(id);

function sameJson(a: unknown,b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value,i)=>sameJson(value,b[i]));
  const x=a as Record<string,unknown>,y=b as Record<string,unknown>,keys=Object.keys(x).sort(),other=Object.keys(y).sort();
  return keys.length===other.length && keys.every((key,i)=>key===other[i] && sameJson(x[key],y[key]));
}
function wire(pending: PendingAttempt): PendingAttempt {
  const json=JSON.stringify(pending);
  if (typeof json !== 'string' || new TextEncoder().encode(json).byteLength > MAX_BYTES) throw new Error('Invalid or oversized attempt');
  const result=JSON.parse(json) as PendingAttempt;
  const a=result?.attempt;
  if (!a || typeof a.id !== 'string' || !a.id.length || a.id.length>100 || !a.ref || !Number.isInteger(a.ref.grade) || a.ref.grade<1 || a.ref.grade>7 || typeof a.ref.topicId !== 'string' || typeof a.ref.subtopicId !== 'string' || !Array.isArray(a.answers) || !Number.isFinite(a.score) || a.score<0 || a.score>100 || !Number.isFinite(a.correct) || !Number.isFinite(a.incorrect) || typeof a.finishedAt !== 'string' || typeof a.startedAt !== 'string' || (result.assignmentId !== null && (typeof result.assignmentId !== 'string' || !UUID.test(result.assignmentId))) || (a.assignmentId ?? null) !== result.assignmentId) throw new Error('Invalid attempt');
  return result;
}
function validated(row: Row, studentId: string): Row {
  if (!row || row.studentId!==studentId || typeof row.attemptId!=='string' || !Number.isFinite(row.createdAt)) throw new Error('Invalid stored attempt');
  const payload=wire(row.payload);
  if (payload.attempt.id!==row.attemptId) throw new Error('Invalid stored attempt');
  return {...row,payload};
}

export class ReviewAttemptOutbox {
  constructor(private db: IDBDatabase) {}
  close(): void { this.db.close(); }
  private transaction<T>(operation: (store: IDBObjectStore, set: (v:T)=>void, fail:(error:Error)=>void)=>void): Promise<T> {
    return new Promise((resolve,reject)=>{
      let tx: IDBTransaction;
      try { tx=this.db.transaction('attempts','readwrite'); } catch { reject(new Error('Outbox unavailable'));return; }
      let value: T;let error: Error | undefined;
      const fail=(err:Error)=>{error=err;try{tx.abort();}catch{/* Already aborted. */}};
      tx.oncomplete=()=>resolve(value);
      tx.onabort=()=>reject(error ?? new Error('Outbox transaction failed'));
      tx.onerror=()=>{}; // onabort carries the failure once, without exposing stored data.
      try { operation(tx.objectStore('attempts'),v=>{value=v;},fail); }
      catch { fail(new Error('Outbox transaction failed')); }
    });
  }
  /** Atomic per-entry insert; same-ID different payload is never overwritten. */
  async enqueue(studentId: string, pending: PendingAttempt): Promise<void> {
    if(!ownerOk(studentId))throw new Error('Invalid owner');
    const payload=wire(pending),attemptId=payload.attempt.id;
    return this.transaction<void>((store,set,fail)=>{
      const get=store.get([studentId,attemptId]);
      get.onsuccess=()=>{
        try {
          if(get.result!==undefined){const prior=validated(get.result as Row,studentId);if(!sameJson(prior.payload,payload))throw new Error('Attempt ID conflict');set(undefined);return;}
          const count=store.index('studentId').count(studentId);
          count.onsuccess=()=>{try{if(count.result>=MAX_PENDING){fail(new Error('Outbox full'));return;}store.add({studentId,attemptId,payload,createdAt:Date.now()} satisfies Row);set(undefined);}catch{fail(new Error('Outbox unavailable'));}};
        }catch(error){fail(error instanceof Error ? error : new Error('Outbox unavailable'));}
      };
    });
  }
  /** Data for one namespace only; caller must first verify the current user. */
  async list(studentId: string): Promise<PendingAttempt[]> {
    if(!ownerOk(studentId))throw new Error('Invalid owner');
    return this.transaction<PendingAttempt[]>((store,set,fail)=>{
      const get=store.index('studentId').getAll(studentId);
      get.onsuccess=()=>{try{set((get.result as Row[]).map(row=>validated(row,studentId)).sort((a,b)=>a.createdAt-b.createdAt || a.attemptId.localeCompare(b.attemptId)).map(row=>row.payload));}catch{fail(new Error('Invalid stored attempt'));}};
    });
  }
  /** Explicit destructive operation. Must not race any active upload worker. */
  async discardOwner(studentId: string): Promise<void> {
    if(!ownerOk(studentId))throw new Error('Invalid owner');
    return this.transaction<void>((store,set)=>{
      const cursor=store.index('studentId').openCursor(studentId);
      cursor.onsuccess=()=>{const row=cursor.result;if(row){row.delete();row.continue();}else set(undefined);};
    });
  }
  /** Call ONLY after the server acknowledges the exact same row. */
  async acknowledge(studentId: string, pending: PendingAttempt): Promise<void> {
    if(!ownerOk(studentId))throw new Error('Invalid owner');
    const payload=wire(pending),attemptId=payload.attempt.id;
    return this.transaction<void>((store,set,fail)=>{
      const get=store.get([studentId,attemptId]);
      get.onsuccess=()=>{try{if(get.result!==undefined){const row=validated(get.result as Row,studentId);if(!sameJson(row.payload,payload))throw new Error('Attempt ID conflict');store.delete([studentId,attemptId]);}set(undefined);}catch(error){fail(error instanceof Error ? error : new Error('Outbox unavailable'));}};
    });
  }
}

/** Explicit opt-in only. Opening an obsolete schema fails instead of erasing it. */
export function openReviewAttemptOutbox(factory: IDBFactory, name: string): Promise<ReviewAttemptOutbox> {
  if(!name || name.length>120) return Promise.reject(new Error('Invalid database name'));
  return new Promise((resolve,reject)=>{
    let settled=false;const fail=()=>{if(!settled){settled=true;reject(new Error('Outbox unavailable'));}};
    let request: IDBOpenDBRequest;
    try{request=factory.open(name,1);}catch{fail();return;}
    request.onupgradeneeded=()=>{const store=request.result.createObjectStore('attempts',{keyPath:['studentId','attemptId']});store.createIndex('studentId','studentId');};
    request.onerror=fail;request.onblocked=fail;
    request.onsuccess=()=>{if(settled){request.result.close();return;}settled=true;request.result.onversionchange=()=>request.result.close();resolve(new ReviewAttemptOutbox(request.result));};
  });
}
