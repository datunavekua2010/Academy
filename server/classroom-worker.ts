/** REVIEW ONLY. This Worker is not referenced by the current wrangler.toml. */
import { createClient } from '@supabase/supabase-js';
import { createClassroomCodeGateway, databaseRateLimiter, verifiedSupabaseAuth, response } from './classroom-code-gateway';
import { codeDigest, createClassroomAdminGateway } from './classroom-code-admin';

type Environment = {
  ASSETS: {fetch(request:Request):Promise<Response>};
  SUPABASE_URL?:string;
  SUPABASE_SERVICE_ROLE_KEY?:string;
  CLASSROOM_RATE_KEY?:string;
  CLASSROOM_ALLOWED_ORIGIN?:string;
  CLASSROOM_CODES_ENABLED?:string;
};
// CF metadata is runtime-provided; the deployment must forbid Worker subrequests
// and independently verify ingress/header assumptions before enabling the route.
type EdgeRequest = Request & {cf?: unknown};
export async function handleClassroomWorker(request:EdgeRequest, env:Environment): Promise<Response> {
  const url=new URL(request.url);
  if (!url.pathname.startsWith('/api/classroom-code/')) return env.ASSETS.fetch(request);
  if (env.CLASSROOM_CODES_ENABLED !== 'true') return response(503,'Service unavailable');
  if (!env.CLASSROOM_ALLOWED_ORIGIN || url.origin !== env.CLASSROOM_ALLOWED_ORIGIN || request.headers.get('origin') !== env.CLASSROOM_ALLOWED_ORIGIN) return response(403,'Forbidden');
  if (!request.cf || request.headers.has('cf-worker') || request.headers.has('cf-ew-via')) return response(503,'Service unavailable');
  const network=request.headers.get('cf-connecting-ip');
  if (!network || !/^[0-9a-f:.]{2,45}$/i.test(network)) return response(503,'Service unavailable');
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.CLASSROOM_RATE_KEY) return response(503,'Service unavailable');
  let endpoint:URL;
  try { endpoint=new URL(env.SUPABASE_URL); } catch { return response(503,'Service unavailable'); }
  if (endpoint.protocol!=='https:' || !/^[a-z0-9-]+\.supabase\.co$/i.test(endpoint.hostname) || endpoint.username || endpoint.password || endpoint.port || endpoint.pathname !== '/' || endpoint.search || endpoint.hash) return response(503,'Service unavailable');
  const client=createClient(env.SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const common={rateKey:env.CLASSROOM_RATE_KEY,authenticate:verifiedSupabaseAuth(client),trustedNetwork:async()=>network,consumeRate:databaseRateLimiter(client)};
  const call=async(name:string, params:Record<string,unknown>)=>{const {data,error}=await client.rpc(name,params); if(error || typeof data!=='boolean') throw new Error('Backend unavailable'); return data;};
  if (url.pathname==='/api/classroom-code/join') return createClassroomCodeGateway({...common,redeem:async(actor,code)=>call('classroom_code_redeem',{p_actor:actor,p_code_digest:await codeDigest(code)})})(request);
  if (url.pathname==='/api/classroom-code/issue' || url.pathname==='/api/classroom-code/revoke') return createClassroomAdminGateway({...common,
    issue:async (x)=>call('classroom_code_issue',{p_actor:x.actor,p_classroom:x.classroomId,p_revision:x.revision,p_expiry_date:x.expiresOn,p_capacity:x.capacity,p_code_digest:x.digest}),
    revoke:async (actor,classroomId)=>call('classroom_code_revoke',{p_actor:actor,p_classroom:classroomId}),
  },url.pathname.endsWith('/issue')?'issue':'revoke')(request);
  return response(404,'Not found');
}
export default {fetch:handleClassroomWorker};
