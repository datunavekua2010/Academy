import type { PendingAttempt } from './supabaseStore';
import type { SessionState } from './session';
import type { Attempt } from './store';

/** Per-authenticated-user, in-memory state. Never browser storage or a durable outbox. */
export class ConnectedPracticeMemory {
  draft: SessionState | null = null;
  private pending: PendingAttempt[] = [];
  private recent = new Map<string, Attempt>();
  private running: Promise<boolean> | null = null;
  private paused = false;
  pause(): void { this.paused = true; }
  resume(): void { this.paused = false; }

  get size(): number { return this.pending.length; }
  enqueue(item: PendingAttempt): void {
    this.pending.push(item);
    this.recent.set(item.attempt.id, item.attempt);
  }

  /** Do not let a stale read hide a newly saved or still-pending attempt. */
  mergeFetched(fetched: Attempt[]): Attempt[] {
    const pendingIds = new Set(this.pending.map((item) => item.attempt.id));
    for (const item of fetched) {
      if (!pendingIds.has(item.id)) this.recent.delete(item.id);
    }
    const recent = this.recent;
    return [...fetched.filter((item) => !recent.has(item.id)), ...recent.values()];
  }

  /** A single worker per user; a remounted provider waits for the old worker. */
  async drain(send: (item: PendingAttempt) => Promise<void>, active: () => boolean): Promise<boolean> {
    while (this.running) {
      const ok = await this.running;
      if (!ok || !active() || this.paused) return ok;
    }
    if (!active() || this.paused || !this.pending.length) return true;
    const worker = (async () => {
      try {
        while (active() && !this.paused && this.pending.length) {
          const item = this.pending[0];
          await send(item);
          // Only remove the item actually acknowledged, not an item added later.
          if (this.pending[0] === item) this.pending.shift();
        }
        return true;
      } catch { return false; }
    })();
    this.running = worker;
    try { return await worker; }
    finally { if (this.running === worker) this.running = null; }
  }
}
