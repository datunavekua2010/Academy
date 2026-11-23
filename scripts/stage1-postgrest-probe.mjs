// Read-only real-session probe for the isolated staging project ONLY.
// Run from an operator-controlled network. Supply short-lived ordinary-user
// JWTs and the test publishable key via private process environment, never CLI
// arguments, logs, source or chat. No service/admin credentials are accepted.
import { pathToFileURL } from 'node:url';

const ORIGIN = 'https://wxxgwayrieasrzngpuul.supabase.co';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail = message => { throw new Error(message); };

export async function runStage1Probe(config, fetcher = fetch) {
  const { key, parentA, parentB, studentA, studentB, childA, childB } = config;
  if (!key?.startsWith('sb_publishable_') || ![parentA,parentB,studentA,studentB].every(x => typeof x === 'string' && x.length > 10) || !uuid.test(childA ?? '') || !uuid.test(childB ?? '') || childA.toLowerCase() === childB.toLowerCase()) fail('Invalid test configuration');
  const request = async (method, path, token, body) => {
    const headers = { apikey: key, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) };
    const response = await fetcher(ORIGIN + path, { method, headers, ...(body === undefined ? {} : {body:JSON.stringify(body)}), signal:AbortSignal.timeout(12000) });
    let data = null;
    try { data = await response.json(); } catch { /* errors and empty bodies need no parsing */ }
    return { status:response.status, ok:response.ok, data };
  };
  const checked = async (method,path,token,body) => {
    const result=await request(method,path,token,body);
    if (!result.ok) fail('Expected authorized test request failed');
    return result.data;
  };
  const denied = async (method,path,token,body) => {
    const result=await request(method,path,token,body);
    if (![400,401,403].includes(result.status)) fail('Expected denial did not occur');
  };
  // Refuse elevated or multi-role actors. Their independent permissions can
  // legitimately change results and invalidate a parent-only test.
  const verify = async (token,expectedRole) => {
    const user=await checked('GET','/auth/v1/user',token);
    if (!uuid.test(user?.id ?? '') || typeof user?.email_confirmed_at !== 'string' || !user.email_confirmed_at) fail('Invalid or unconfirmed test identity');
    const roles=await checked('GET','/rest/v1/user_roles?select=role&user_id=eq.'+encodeURIComponent(user.id),token);
    if (!Array.isArray(roles) || roles.length !== 1 || roles[0]?.role !== expectedRole) fail('Unexpected test roles');
    return user.id.toLowerCase();
  };
  const [pA,pB,sA,sB]=await Promise.all([verify(parentA,'parent'),verify(parentB,'parent'),verify(studentA,'student'),verify(studentB,'student')]);
  if (new Set([pA,pB,sA,sB]).size !== 4 || sA !== childA.toLowerCase() || sB !== childB.toLowerCase()) fail('Test identities do not match fixtures');
  await denied('GET','/rest/v1/exercise_attempts?select=attempt_id',undefined);
  await denied('GET','/rest/v1/exercise_attempts?select=attempt_id','not-a-valid-jwt');
  const children = async token => await checked('POST','/rest/v1/rpc/parent_review_children',token,{});
  const [listA,listB]=await Promise.all([children(parentA),children(parentB)]);
  const has=(list,id)=>Array.isArray(list) && list.some(row=>String(row?.student_id).toLowerCase()===id.toLowerCase());
  if (!has(listA,childA) || has(listA,childB) || !has(listB,childB) || has(listB,childA)) fail('Family listing is not isolated');
  const summary=async(token,id)=>await checked('POST','/rest/v1/rpc/parent_review_recent_attempts',token,{p_student:id});
  const [sumA,sumB]=await Promise.all([summary(parentA,childA),summary(parentB,childB)]);
  if (!Array.isArray(sumA) || !sumA.length || !Array.isArray(sumB) || !sumB.length) fail('Each child needs a synthetic saved attempt');
  await denied('POST','/rest/v1/rpc/parent_review_recent_attempts',parentA,{p_student:childB});
  await denied('POST','/rest/v1/rpc/parent_review_recent_attempts',parentB,{p_student:childA});
  await denied('POST','/rest/v1/rpc/parent_review_recent_attempts',parentA,{p_student:'not-a-uuid'});
  const raw=async(token,id)=>await checked('GET','/rest/v1/exercise_attempts?select=attempt_id&student_id=eq.'+encodeURIComponent(id),token);
  const [ownA,ownB,parentRawA,parentRawB,crossA,crossB]=await Promise.all([raw(studentA,childA),raw(studentB,childB),raw(parentA,childA),raw(parentB,childB),raw(studentA,childB),raw(studentB,childA)]);
  if (![ownA,ownB,parentRawA,parentRawB,crossA,crossB].every(Array.isArray) || !ownA.some(row=>row.attempt_id===sumA[0]?.attempt_id) || !ownB.some(row=>row.attempt_id===sumB[0]?.attempt_id)) fail('Positive attempt controls failed');
  if (parentRawA.length || parentRawB.length || crossA.length || crossB.length) fail('Protected attempt rows exposed');
  return 'Staging real-session parent and student read checks passed';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const env=process.env;
  const config={key:env.STAGE1_PUBLISHABLE_KEY,parentA:env.STAGE1_PARENT_A_JWT,parentB:env.STAGE1_PARENT_B_JWT,studentA:env.STAGE1_STUDENT_A_JWT,studentB:env.STAGE1_STUDENT_B_JWT,childA:env.STAGE1_CHILD_A_ID,childB:env.STAGE1_CHILD_B_ID};
  runStage1Probe(config).then(message=>console.log(message)).catch(()=>{console.error('Staging probe failed or could not run; check test setup and connectivity privately. No response or credentials were logged.');process.exitCode=1;});
}
