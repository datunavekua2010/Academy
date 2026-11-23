import { expect, it } from 'vitest';
import { generateBatch } from '../src/practice/generator';
import { shownKey } from '../src/practice/identity';
import { refillAvoid } from '../src/practice/refill';
import { startSession, submitAnswer } from '../src/practice/session';

it('avoids both queued and answered visible questions, even with fresh IDs', () => {
 const ref={grade:2 as const,topicId:'g2-ricxvebi100',subtopicId:'u01-roman-numerals'};
 const initial=generateBatch(ref,8,{seed:42});expect(initial.length).toBeGreaterThan(1);
 let state=startSession(ref,initial);const current=state.questions[state.queue[0]];
 state=submitAnswer(state,current.answer)!.state;
 const avoid=refillAvoid(state);
 for(const question of Object.values(state.questions)){expect(avoid.has(question.id)).toBe(true);expect(avoid.has(shownKey(question))).toBe(true);}
 expect(avoid.has(shownKey({prompt:state.answers[0].prompt!,visual:state.answers[0].visual,orderItems:state.answers[0].orderItems}))).toBe(true);
 const batch=generateBatch(ref,4,{seed:20261105,avoid});
 for(const question of batch)expect(avoid.has(shownKey(question))).toBe(false);
});
