import { describe, expect, it } from 'vitest';
import { runStage1Probe } from '../scripts/stage1-postgrest-probe.mjs';

const ids = [1,2,3,4].map(n => `12345678-1234-4234-8234-${String(n).padStart(12,'0')}`);
const config = { key:'sb_publishable_synthetic', parentA:'parent-token-a', parentB:'parent-token-b', studentA:'student-token-a', studentB:'student-token-b', childA:ids[2], childB:ids[3] };
const actors = { 'parent-token-a':[ids[0],'parent'], 'parent-token-b':[ids[1],'parent'], 'student-token-a':[ids[2],'student'], 'student-token-b':[ids[3],'student'] };
const response = (body,status=200) => new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
function fakeFetch({leakRaw=false,crossSummary=false,noStudentAttempts=false,multiRole=false}={}) {
  return async (url,init) => {
    const u=new URL(url), token=init.headers.Authorization?.replace('Bearer ','');
    if (!actors[token]) return response({},401);
    const [id,role]=actors[token];
    if (u.pathname==='/auth/v1/user') return response({id,email_confirmed_at:'2026-01-01T00:00:00Z'});
    if (u.pathname==='/rest/v1/user_roles') return response(multiRole&&token===config.parentA?[{role:'parent'},{role:'admin'}]:[{role}]);
    if (u.pathname==='/rest/v1/rpc/parent_review_children') return response([{student_id:token===config.parentA?ids[2]:ids[3]}]);
    if (u.pathname==='/rest/v1/rpc/parent_review_recent_attempts') {
      const child=JSON.parse(init.body).p_student, own=token===config.parentA?ids[2]:ids[3];
      if (child!==own && !crossSummary) return response({},400);
      return response([{attempt_id:child===ids[2]?'attempt-a':'attempt-b'}]);
    }
    if (u.pathname==='/rest/v1/exercise_attempts') {
      const child=u.searchParams.get('student_id')?.slice(3);
      if (role==='parent') return response(leakRaw?[{attempt_id:'leaked'}]:[]);
      if (id!==child || noStudentAttempts) return response([]);
      return response([{attempt_id:id===ids[2]?'attempt-a':'attempt-b'}]);
    }
    return response({},404);
  };
}
describe('read-only staging parent probe with synthetic HTTP responses',()=>{
  it('accepts scoped access and positive student-owned attempt controls',async()=>{
    expect(await runStage1Probe(config,fakeFetch())).toContain('passed');
  });
  it.each([{leakRaw:true},{crossSummary:true},{noStudentAttempts:true},{multiRole:true}])('fails closed for a violated control: %j',async scenario=>{
    await expect(runStage1Probe(config,fakeFetch(scenario))).rejects.toThrow();
  });
  it('rejects privileged-style keys before making any request',async()=>{
    let requests=0;
    await expect(runStage1Probe({...config,key:'sb_secret_never-use'},async()=>{requests++;return response({});})).rejects.toThrow('Invalid test configuration');
    expect(requests).toBe(0);
  });
});
