/**
 * LOCAL REVIEW ONLY. Not opened by the app. No data is stored until a host
 * supplies explicit consent and invokes enable/enqueue. The host must bind this
 * instance to one verified identity and call cancel synchronously on every auth
 * boundary. Device storage is not encrypted or private from same-origin code.
 *
 * All participating tabs must use the same exclusive lock namespace for every
 * enqueue, drain and discard. This does not coordinate old/nonparticipating
 * code. A submitted HTTP request or already-started IDB transaction cannot be
 * recalled on cancellation; failures can have uncertain outcomes.
 */
import type { PendingAttempt } from './supabaseStore';
import { ReviewAttemptOutbox } from './reviewAttemptOutbox';

export type OutboxLock = <T>(name: string, callback: () => Promise<T>) => Promise<T>;
export function browserOutboxLock(locks: LockManager | undefined): OutboxLock {
  if (!locks || typeof locks.request !== 'function') throw new Error('Device coordination unavailable');
  return async <T>(name: string, callback: () => Promise<T>): Promise<T> => await locks.request(name, {mode:'exclusive'}, callback);
}

export class ReviewOutboxCoordinator {
  private generation = 0;
  private enabled = false;
  constructor(
    private readonly owner: string,
    private readonly outbox: ReviewAttemptOutbox,
    private readonly lock: OutboxLock,
    private readonly verifyOwner: () => Promise<boolean>,
    /** Must only resolve after the server confirms the exact payload. */
    private readonly send: (item: PendingAttempt) => Promise<void>,
  ) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(owner)) throw new Error('Invalid owner');
    this.owner=owner.toLowerCase();
  }
  /** Call only after a user has expressly opted in for this device. */
  async enable(consent: boolean): Promise<void> {
    if (consent !== true) throw new Error('Consent required');
    const generation=++this.generation;this.enabled=false;
    const valid=await this.verifyOwner();
    if (!valid || generation!==this.generation) throw new Error('Owner unavailable');
    this.enabled=true;
  }
  /** Call on auth changes, opt-out, signout, or unmount. Not a deletion. */
  cancel(): void { this.generation++;this.enabled=false; }
  private async run<T>(operation: (check: () => Promise<void>) => Promise<T>, requireConsent = true): Promise<T> {
    const generation=this.generation;
    const check=async()=>{
      if((requireConsent && !this.enabled) || generation!==this.generation) throw new Error('Owner unavailable');
      const valid=await this.verifyOwner();
      if(!valid || (requireConsent && !this.enabled) || generation!==this.generation) throw new Error('Owner unavailable');
    };
    return this.lock(`axiom-review-attempts:${this.owner.toLowerCase()}`,async()=>{
      await check();return operation(check);
    });
  }
  /** Resolve only once the local transaction commits, before any upload. */
  async enqueue(item: PendingAttempt): Promise<void> {
    await this.run(async check=>{await this.outbox.enqueue(this.owner,item);await check();});
  }
  /** Serialized with other participating tabs; stop at the first error. */
  async drain(): Promise<void> {
    await this.run(async check=>{
      const items=await this.outbox.list(this.owner);
      for(const item of items){
        await check();await this.send(item);await check();await this.outbox.acknowledge(this.owner,item);
      }
    });
  }
  /** Explicit destructive operation; unsent work may be lost. */
  async discard(): Promise<void> {
    await this.run(async check=>{await this.outbox.discardOwner(this.owner);await check();},false);
  }
}
