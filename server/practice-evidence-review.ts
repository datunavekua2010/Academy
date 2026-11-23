/**
 * LOCAL REVIEW PROTOTYPE ONLY. Not routed, deployed or used for awards.
 * The caller must obtain `owner` from verified server-side auth, never request
 * JSON. In-memory state is NOT shared, durable, encrypted or safe for production.
 * Single-choice questions only; trusted issuance & atomic database persistence,
 * abuse controls, lifecycle, question leakage and curricula need review.
 */
import { randomUUID } from 'node:crypto';
import type { Question } from '../src/practice/types';

type Issued = { id: string; prompt: string; options: string[]; answerMode: 'choice' };
type Response = { correct: boolean };
type RecordItem = { issued: Issued; answer: string; selected?: string; response?: Response };
type Session = { owner: string; created: number; issued: Map<string, RecordItem>; requests: Map<string, string>; seen: Set<string>; finished: ReviewEvidence | null };
export type ReviewEvidence = { sessionId: string; owner: string; answered: number; correct: number; finishedAt: string; kind: 'review-only' };

const TTL = 15 * 60_000;
const MAX_QUESTIONS = 20;
const MIN_QUESTIONS = 10;
const MAX_SESSIONS = 200;
const MAX_OWNER_SESSIONS = 3;
const validKey = (value: string) => typeof value === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(value);

/** All methods are synchronous and atomic only within this single instance. */
export class PracticeEvidenceReview {
  private sessions = new Map<string, Session>();
  constructor(private makeQuestion: () => Question, private now: () => number = Date.now) {}

  start(owner: string): string {
    if (!validKey(owner)) throw new Error('Invalid owner');
    const now = this.now();
    // Expired sessions are removed rather than silently becoming evidence.
    for (const [id, session] of this.sessions) if (now - session.created >= TTL) this.sessions.delete(id);
    if (this.sessions.size >= MAX_SESSIONS || [...this.sessions.values()].filter(s => s.owner === owner && !s.finished).length >= MAX_OWNER_SESSIONS) throw new Error('Session limit');
    const id = randomUUID();
    this.sessions.set(id, { owner, created: now, issued: new Map(), requests: new Map(), seen: new Set(), finished: null });
    return id;
  }
  private get(owner: string, sessionId: string): Session {
    const session = this.sessions.get(sessionId);
    if (!session || !validKey(owner) || session.owner !== owner || this.now() - session.created >= TTL || this.now() < session.created) throw new Error('Session unavailable');
    return session;
  }
  issue(owner: string, sessionId: string, requestId: string): Issued {
    const session = this.get(owner, sessionId);
    if (!validKey(requestId)) throw new Error('Invalid request');
    const previous = session.requests.get(requestId);
    if (previous) return structuredClone(session.issued.get(previous)!.issued);
    if (session.finished || session.issued.size >= MAX_QUESTIONS || [...session.issued.values()].some(row => !row.response)) throw new Error('Question unavailable');
    for (let i = 0; i < 100; i++) {
      const q = this.makeQuestion();
      // Restrict this prototype to simple single choice: no picture, widget,
      // support text or hint with unreviewed answer-bearing payloads.
      if ((q.answerMode && q.answerMode !== 'choice') || q.visual || q.hint || q.pictures?.length || q.interaction || q.clocks?.length || q.orderItems?.length || typeof q.prompt !== 'string' || !q.prompt.trim() || q.prompt.length > 500 || !Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6 || q.options.some(o => typeof o !== 'string' || o.length > 200) || new Set(q.options).size !== q.options.length || !q.options.includes(q.answer) || session.seen.has(q.prompt)) continue;
      const issued: Issued = { id: randomUUID(), prompt: q.prompt, options: [...q.options], answerMode: 'choice' };
      session.seen.add(q.prompt);session.issued.set(issued.id, {issued, answer:q.answer});session.requests.set(requestId,issued.id);
      return structuredClone(issued);
    }
    throw new Error('Distinct supported question unavailable');
  }
  submit(owner: string, sessionId: string, questionId: string, choice: string): Response {
    const session = this.get(owner, sessionId);
    const item = session.issued.get(questionId);
    if (!item || typeof choice !== 'string' || !item.issued.options.includes(choice)) throw new Error('Invalid answer');
    if (item.response) {
      if (item.selected !== choice) throw new Error('Answer already submitted');
      return {...item.response};
    }
    if (session.finished) throw new Error('Session finished');
    item.selected = choice;item.response = {correct:choice === item.answer};
    return {...item.response};
  }
  finish(owner: string, sessionId: string): ReviewEvidence {
    const session = this.get(owner, sessionId);
    if (session.finished) return {...session.finished};
    const items = [...session.issued.values()];
    if (items.length < MIN_QUESTIONS || items.some(item=>!item.response)) throw new Error('Session incomplete');
    session.finished = {sessionId,owner,answered:items.length,correct:items.filter(item=>item.response?.correct).length,finishedAt:new Date(this.now()).toISOString(),kind:'review-only'};
    return {...session.finished};
  }
}
