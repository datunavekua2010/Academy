import { keyedId, readBody, response } from './classroom-code-gateway';

export interface AdminDeps {
  rateKey: string;
  authenticate(authorization: string): Promise<{id:string} | null>;
  trustedNetwork(request: Request): Promise<string | null>;
  consumeRate(accountHash: string, networkHash: string): Promise<boolean>;
  issue(input: {actor:string; classroomId:string; revision:number; expiresOn:string; capacity:number; digest:string}): Promise<boolean>;
  revoke(actor:string, classroomId:string): Promise<boolean>;
}
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function randomCode(): string {
  const bytes=crypto.getRandomValues(new Uint8Array(26));
  return Array.from(bytes, byte => alphabet[byte & 31]).join('');
}
export async function codeDigest(code:string): Promise<string> {
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code));
  return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function createClassroomAdminGateway(deps:AdminDeps, action:'issue'|'revoke') {
  return async (request:Request): Promise<Response> => {
    if (request.method !== 'POST') return response(405,'Method not allowed');
    if (typeof deps.rateKey !== 'string' || new TextEncoder().encode(deps.rateKey).length < 32) return response(503,'Service unavailable');
    try {
      const auth=request.headers.get('authorization') ?? '';
      if (!/^Bearer [^\s]+$/.test(auth)) return response(401,'Authentication required');
      const user=await deps.authenticate(auth);
      if (!user || !uuid.test(user.id)) return response(401,'Authentication required');
      const network=await deps.trustedNetwork(request);
      if (!network || network.length > 128) return response(503,'Service unavailable');
      const [accountHash,networkHash]=await Promise.all([keyedId(deps.rateKey,'account',user.id),keyedId(deps.rateKey,'network',network)]);
      if (!await deps.consumeRate(accountHash,networkHash)) return response(429,'Try again later');
      let body:unknown;
      try { body=JSON.parse(await readBody(request)); } catch { return response(400,'Unable to update classroom'); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) return response(400,'Unable to update classroom');
      const b=body as Record<string,unknown>;
      if (typeof b.classroomId !== 'string' || !uuid.test(b.classroomId)) return response(400,'Unable to update classroom');
      if (action==='revoke') {
        if (!await deps.revoke(user.id,b.classroomId)) return response(400,'Unable to update classroom');
        return Response.json({ok:true},{headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
      }
      if (!Number.isSafeInteger(b.revision) || (b.revision as number) < 1 || !Number.isSafeInteger(b.capacity) || (b.capacity as number) < 1 || (b.capacity as number) > 2147483647 || typeof b.expiresOn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(b.expiresOn)) return response(400,'Unable to update classroom');
      const code=randomCode(); const digest=await codeDigest(code);
      if (!await deps.issue({actor:user.id,classroomId:b.classroomId,revision:b.revision as number,expiresOn:b.expiresOn,capacity:b.capacity as number,digest})) return response(400,'Unable to update classroom');
      return Response.json({code},{headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
    } catch { return response(503,'Service unavailable'); }
  };
}
