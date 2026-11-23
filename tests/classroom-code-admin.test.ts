import { expect, it, vi } from 'vitest';
import { codeDigest, createClassroomAdminGateway, type AdminDeps } from '../server/classroom-code-admin';
import { handleClassroomWorker } from '../server/classroom-worker';
const actor='00000000-0000-4000-8000-000000000001';
const classroom='00000000-0000-4000-8000-000000000002';
function setup() {
 const deps:AdminDeps={rateKey:'k'.repeat(40),authenticate:vi.fn(async()=>({id:actor})),trustedNetwork:vi.fn(async()=> 'verified'),consumeRate:vi.fn(async()=>true),issue:vi.fn(async()=>true),revoke:vi.fn(async()=>true)};
 const send=(action:'issue'|'revoke',body:unknown)=>createClassroomAdminGateway(deps,action)(new Request('https://example.test/api',{method:'POST',headers:{authorization:'Bearer token'},body:JSON.stringify(body)}));
 return {deps,send};
}
it('issues a 130-bit server-generated code, saves only its digest, and uses the verified actor',async()=>{
 const {deps,send}=setup();const res=await send('issue',{classroomId:classroom,revision:2,capacity:15,expiresOn:'2027-01-01',actor:'forged'});
 expect(res.status).toBe(200);expect(res.headers.get('cache-control')).toBe('no-store');
 const {code}=await res.json() as {code:string}; expect(code).toMatch(/^[A-Z2-7]{26}$/);
 expect(deps.issue).toHaveBeenCalledWith({actor,classroomId:classroom,revision:2,capacity:15,expiresOn:'2027-01-01',digest:await codeDigest(code)});
 expect(JSON.stringify(vi.mocked(deps.issue).mock.calls)).not.toContain(code);
});
it('charges invalid actions, rejects failures and revokes only for the verified actor',async()=>{
 const {deps,send}=setup();expect((await send('issue',{classroomId:classroom,capacity:0})).status).toBe(400);
 expect(deps.consumeRate).toHaveBeenCalledTimes(1);expect(deps.issue).not.toHaveBeenCalled();
 vi.mocked(deps.consumeRate).mockResolvedValueOnce(false);expect((await send('revoke',{classroomId:classroom})).status).toBe(429);expect(deps.revoke).not.toHaveBeenCalled();
 expect((await send('revoke',{classroomId:classroom,actor:'other'})).status).toBe(200);expect(deps.revoke).toHaveBeenCalledWith(actor,classroom);
 vi.mocked(deps.issue).mockRejectedValueOnce(new Error('failed'));const fail=await send('issue',{classroomId:classroom,revision:1,capacity:1,expiresOn:'2027-01-01'});expect(fail.status).toBe(503); expect(await fail.text()).not.toContain('code');
});
it('review worker fails closed without activation, trusted ingress, allowed origin or secrets',async()=>{
 const assets={fetch:vi.fn(async()=>new Response('assets'))};
 const req=new Request('https://example.test/api/classroom-code/join',{method:'POST',headers:{origin:'https://example.test'},body:'{}'});
 expect((await handleClassroomWorker(req,{ASSETS:assets})).status).toBe(503);
 expect((await handleClassroomWorker(req,{ASSETS:assets,CLASSROOM_CODES_ENABLED:'true',CLASSROOM_ALLOWED_ORIGIN:'https://other.test'})).status).toBe(403);
 expect((await handleClassroomWorker(req,{ASSETS:assets,CLASSROOM_CODES_ENABLED:'true',CLASSROOM_ALLOWED_ORIGIN:'https://example.test'})).status).toBe(503);
 expect(await (await handleClassroomWorker(new Request('https://example.test/'),{ASSETS:assets})).text()).toBe('assets');
});
