/**
 * UNROUTED LOCAL REVIEW. Service-only adapter; not ready to deploy. Host must
 * verify Auth, origin/ingress and enforce a dedicated atomic distributed rate
 * limit. Trusted generator must run on the server, NOT accept browser question
 * or answer material. Questions are a pilot only, not achievement evidence.
 */
import type {Question} from '../src/practice/types';
import {keyedId,readBody,response} from './classroom-code-gateway';

type Issued = {id:string;prompt:string;options:string[]};
type Finished = {sessionId:string;answered:number;correct:number;finishedAt:string};
export interface PilotGatewayDeps {
 authenticate(authorization:string):Promise<{id:string}|null>;
 trustedNetwork(request:Request):Promise<string|null>;
 consumeRate(accountHash:string,networkHash:string):Promise<boolean>;
 rateKey:string;
 makeQuestion():Promise<Question>|Question;
 start(actor:string,requestId:string):Promise<string>;
 issue(actor:string,sessionId:string,requestId:string,material:{prompt:string;options:string[];answer:string}):Promise<Issued>;
 submit(actor:string,sessionId:string,questionId:string,choice:string):Promise<boolean>;
 finish(actor:string,sessionId:string):Promise<Finished>;
}
const uuid=(x:unknown):x is string=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
const bounded=(x:unknown,n:number):x is string=>typeof x==='string'&&x.trim().length>0&&x.length<=n;
const optionsValid=(x:unknown):x is string[]=>Array.isArray(x)&&x.length>=2&&x.length<=6&&x.every(v=>bounded(v,200))&&new Set(x).size===x.length;
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const exact=(x:Record<string,unknown>,keys:string[])=>Object.keys(x).length===keys.length&&keys.every(k=>Object.prototype.hasOwnProperty.call(x,k));
function json(body:unknown):Response{return new Response(JSON.stringify(body),{status:200,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'}});}
function safeQuestion(q:Question):{prompt:string;options:string[];answer:string}{
 if(!q || (q.answerMode&&q.answerMode!=='choice') || q.visual || q.hint || q.pictures?.length || q.interaction || q.clocks?.length || q.orderItems?.length || !bounded(q.prompt,500) || !optionsValid(q.options) || !bounded(q.answer,200) || !q.options.includes(q.answer))throw new Error('Unsupported question');
 return {prompt:q.prompt,options:[...q.options],answer:q.answer};
}
export function createEvidencePilotGateway(deps:PilotGatewayDeps){
 return async(request:Request):Promise<Response>=>{
  if(request.method!=='POST')return response(405,'Method not allowed');
  if(typeof deps.rateKey!=='string'||new TextEncoder().encode(deps.rateKey).length<32)return response(503,'Service unavailable');
  try{
   const authorization=request.headers.get('authorization')??'';
   if(!/^Bearer [^\s]+$/.test(authorization))return response(401,'Authentication required');
   const user=await deps.authenticate(authorization);if(!user||!uuid(user.id))return response(401,'Authentication required');
   const network=await deps.trustedNetwork(request);if(!bounded(network,128))return response(503,'Service unavailable');
   const [accountHash,networkHash]=await Promise.all([keyedId(deps.rateKey,'evidence-account',user.id.toLowerCase()),keyedId(deps.rateKey,'evidence-network',network)]);
   if(!await deps.consumeRate(accountHash,networkHash))return response(429,'Try again later');
   let body:unknown;try{body=JSON.parse(await readBody(request));}catch{return response(400,'Invalid request');}
   if(!object(body))return response(400,'Invalid request');
   if(body.op==='start'&&exact(body,['op','requestId'])&&uuid(body.requestId)){
    const sessionId=await deps.start(user.id,body.requestId);if(!uuid(sessionId))throw new Error('Invalid backend response');return json({sessionId});
   }
   if(body.op==='issue'&&exact(body,['op','sessionId','requestId'])&&uuid(body.sessionId)&&uuid(body.requestId)){
    const material=safeQuestion(await deps.makeQuestion());const row=await deps.issue(user.id,body.sessionId,body.requestId,material);
    if(!row||!uuid(row.id)||!bounded(row.prompt,500)||!optionsValid(row.options))throw new Error('Invalid backend response');
    return json({id:row.id,prompt:row.prompt,options:row.options,answerMode:'choice'});
   }
   if(body.op==='submit'&&exact(body,['op','sessionId','questionId','choice'])&&uuid(body.sessionId)&&uuid(body.questionId)&&bounded(body.choice,200)){
    const correct=await deps.submit(user.id,body.sessionId,body.questionId,body.choice);if(typeof correct!=='boolean')throw new Error('Invalid backend response');return json({correct});
   }
   if(body.op==='finish'&&exact(body,['op','sessionId'])&&uuid(body.sessionId)){
    const result=await deps.finish(user.id,body.sessionId);
    if(!result||result.sessionId!==body.sessionId||!Number.isInteger(result.answered)||result.answered<10||result.answered>20||!Number.isInteger(result.correct)||result.correct<0||result.correct>result.answered||!bounded(result.finishedAt,64)||!Number.isFinite(Date.parse(result.finishedAt)))throw new Error('Invalid backend response');
    return json({sessionId:result.sessionId,answered:result.answered,correct:result.correct,finishedAt:result.finishedAt});
   }
   return response(400,'Invalid request');
  }catch{return response(503,'Service unavailable');}
 };
}

/** Server-only database adapter. Never place its service client in browser code. */
export function pilotDatabase(client:{rpc(name:string,args:Record<string,unknown>):PromiseLike<{data:unknown;error:unknown}>}):Pick<PilotGatewayDeps,'start'|'issue'|'submit'|'finish'> {
 async function call(name:string,args:Record<string,unknown>):Promise<unknown>{const {data,error}=await client.rpc(name,args);if(error)throw new Error('Backend unavailable');return data;}
 return {
  async start(actor,requestId){const data=await call('evidence_pilot_start',{p_student:actor,p_request:requestId});if(!uuid(data))throw new Error('Backend unavailable');return data;},
  async issue(actor,sessionId,requestId,material){
   const data=await call('evidence_pilot_issue',{p_student:actor,p_session:sessionId,p_request:requestId,p_prompt:material.prompt,p_options:material.options,p_answer:material.answer});
   if(!Array.isArray(data)||data.length!==1||!object(data[0])||!uuid(data[0].question_id)||!bounded(data[0].prompt,500)||!optionsValid(data[0].options))throw new Error('Backend unavailable');
   return {id:data[0].question_id,prompt:data[0].prompt,options:data[0].options};
  },
  async submit(actor,sessionId,questionId,choice){const data=await call('evidence_pilot_submit',{p_student:actor,p_session:sessionId,p_question:questionId,p_choice:choice});if(typeof data!=='boolean')throw new Error('Backend unavailable');return data;},
  async finish(actor,sessionId){
   const data=await call('evidence_pilot_finish',{p_student:actor,p_session:sessionId});if(!Array.isArray(data)||data.length!==1||!object(data[0]))throw new Error('Backend unavailable');
   const r=data[0];const answered=typeof r.answered==='string'&&/^\d+$/.test(r.answered)?Number(r.answered):r.answered;const correct=typeof r.correct==='string'&&/^\d+$/.test(r.correct)?Number(r.correct):r.correct;
   if(!uuid(r.session_id)||r.session_id!==sessionId||typeof answered!=='number'||!Number.isInteger(answered)||answered<10||answered>20||typeof correct!=='number'||!Number.isInteger(correct)||correct<0||correct>answered||!bounded(r.finished_at,64)||!Number.isFinite(Date.parse(r.finished_at)))throw new Error('Backend unavailable');
   return {sessionId:r.session_id,answered,correct,finishedAt:r.finished_at};
  },
 };
}
