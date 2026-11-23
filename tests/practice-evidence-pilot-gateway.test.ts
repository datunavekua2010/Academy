import {it,expect,vi} from 'vitest';
import {createEvidencePilotGateway,type PilotGatewayDeps} from '../server/practice-evidence-pilot-gateway';
import type {Question} from '../src/practice/types';
const actor='00000000-0000-4000-8000-000000000001',session='00000000-0000-4000-8000-000000000002',requestId='00000000-0000-4000-8000-000000000003',questionId='00000000-0000-4000-8000-000000000004';
const question:Question={id:'secret-seed',grade:2,topicId:'t',subtopicId:'s',prompt:'Two plus two?',options:['3','4'],answer:'4',explanation:'private',difficulty:1};
function setup(){
 const deps:PilotGatewayDeps={rateKey:'x'.repeat(40),authenticate:vi.fn(async()=>({id:actor})),trustedNetwork:vi.fn(async()=>'trusted'),consumeRate:vi.fn(async()=>true),makeQuestion:vi.fn(()=>question),start:vi.fn(async()=>session),issue:vi.fn(async()=>({id:questionId,prompt:question.prompt,options:question.options,answer:'LEAK'})),submit:vi.fn(async()=>true),finish:vi.fn(async()=>({sessionId:session,answered:10,correct:8,finishedAt:'2026-01-01T00:00:00Z',secret:'LEAK'}))};
 const send=(body:unknown,headers:Record<string,string>={authorization:'Bearer valid'})=>createEvidencePilotGateway(deps)(new Request('https://example.test/api/pilot',{method:'POST',headers,body:typeof body==='string'?body:JSON.stringify(body)}));return{deps,send};
}
it('uses verified identity and server-generated material, returning only the public question',async()=>{
 const {deps,send}=setup();const res=await send({op:'issue',sessionId:session,requestId});expect(res.status).toBe(200);expect(res.headers.get('cache-control')).toBe('no-store');expect(await res.json()).toEqual({id:questionId,prompt:question.prompt,options:question.options,answerMode:'choice'});
 expect(deps.issue).toHaveBeenCalledWith(actor,session,requestId,{prompt:question.prompt,options:question.options,answer:'4'});
 expect(deps.consumeRate).toHaveBeenCalledWith(expect.stringMatching(/^[a-f0-9]{64}$/),expect.stringMatching(/^[a-f0-9]{64}$/));
});
it('rejects caller-supplied identity and question material and charges malformed requests',async()=>{
 const {deps,send}=setup();expect((await send({op:'issue',sessionId:session,requestId,actor:'other',answer:'4'})).status).toBe(400);expect((await send('x'.repeat(1025))).status).toBe(400);expect((await send('bad')).status).toBe(400);expect(deps.consumeRate).toHaveBeenCalledTimes(3);expect(deps.issue).not.toHaveBeenCalled();expect(deps.makeQuestion).not.toHaveBeenCalled();
});
it('fails closed for auth, network, rate, generator and backend failures',async()=>{
 const {deps,send}=setup();const body={op:'issue',sessionId:session,requestId};expect((await send(body,{})).status).toBe(401);
 vi.mocked(deps.authenticate).mockResolvedValueOnce(null);expect((await send(body)).status).toBe(401);
 vi.mocked(deps.trustedNetwork).mockResolvedValueOnce(null);expect((await send(body)).status).toBe(503);
 vi.mocked(deps.consumeRate).mockResolvedValueOnce(false);expect((await send(body)).status).toBe(429);
 vi.mocked(deps.makeQuestion).mockReturnValueOnce({...question,hint:'4'});expect((await send(body)).status).toBe(503);expect(deps.issue).not.toHaveBeenCalled();
 vi.mocked(deps.issue).mockRejectedValueOnce(new Error('SECRET'));const failed=await send(body);expect(failed.status).toBe(503);expect(await failed.text()).not.toContain('SECRET');
});
it('validates and narrows start, answer, and completion responses',async()=>{
 const {deps,send}=setup();expect(await (await send({op:'start',requestId})).json()).toEqual({sessionId:session});
 expect(await (await send({op:'submit',sessionId:session,questionId,choice:'4'})).json()).toEqual({correct:true});expect(deps.submit).toHaveBeenCalledWith(actor,session,questionId,'4');
 expect(await (await send({op:'finish',sessionId:session})).json()).toEqual({sessionId:session,answered:10,correct:8,finishedAt:'2026-01-01T00:00:00Z'});
 vi.mocked(deps.finish).mockResolvedValueOnce({sessionId:session,answered:10,correct:11,finishedAt:'2026-01-01'});expect((await send({op:'finish',sessionId:session})).status).toBe(503);
});

it('adapts only validated service RPC results and passes the server identity',async()=>{
 const {pilotDatabase}=await import('../server/practice-evidence-pilot-gateway');
 const rpc=vi.fn(async(name:string,_args:Record<string,unknown>):Promise<{data:unknown;error:unknown}>=>({error:null,data:name==='evidence_pilot_start'?session:name==='evidence_pilot_issue'?[{question_id:questionId,prompt:'P',options:['A','B'],correct_answer:'A'}]:name==='evidence_pilot_submit'?false:[{session_id:session,answered:'10',correct:'9',finished_at:'2026-01-01T00:00:00Z'}]}));
 const db=pilotDatabase({rpc});expect(await db.start(actor,requestId)).toBe(session);
 expect(await db.issue(actor,session,requestId,{prompt:'P',options:['A','B'],answer:'A'})).toEqual({id:questionId,prompt:'P',options:['A','B']});
 expect(rpc).toHaveBeenCalledWith('evidence_pilot_issue',{p_student:actor,p_session:session,p_request:requestId,p_prompt:'P',p_options:['A','B'],p_answer:'A'});
 expect(await db.submit(actor,session,questionId,'B')).toBe(false);expect(await db.finish(actor,session)).toEqual({sessionId:session,answered:10,correct:9,finishedAt:'2026-01-01T00:00:00Z'});
 rpc.mockResolvedValueOnce({data:'true',error:null});await expect(db.submit(actor,session,questionId,'B')).rejects.toThrow();
 rpc.mockResolvedValueOnce({data:null,error:'secret'});await expect(db.start(actor,requestId)).rejects.toThrow('Backend unavailable');
});
