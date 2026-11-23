import { afterEach, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { classroomCodeServices } from '../src/classrooms/codeService';
afterEach(()=>vi.unstubAllGlobals());
const client={auth:{getSession:async()=>({data:{session:{access_token:'user-token'}},error:null})}} as unknown as SupabaseClient;
it('is disabled without an enabled connected client',()=>{
 expect(classroomCodeServices(null,true)).toBeNull(); expect(classroomCodeServices(client,false)).toBeNull();
});
it('sends the user token only to the same-origin API and requires explicit backend confirmation',async()=>{
 const fetcher=vi.fn(async()=>new Response(JSON.stringify({message:'Joined'}),{status:200,headers:{'content-type':'application/json'}}));vi.stubGlobal('fetch',fetcher);
 await classroomCodeServices(client,true)!.student.join('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
 expect(fetcher).toHaveBeenCalledWith('/api/classroom-code/join',expect.objectContaining({method:'POST',credentials:'omit',headers:expect.objectContaining({authorization:'Bearer user-token'})}));
 vi.stubGlobal('fetch',vi.fn(async()=>new Response('<html>SPA fallback</html>',{status:200,headers:{'content-type':'text/html'}})));
 await expect(classroomCodeServices(client,true)!.student.join('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).rejects.toThrow();
});
it('does not report success on malformed JSON, revoked session or denied request',async()=>{
 const service=classroomCodeServices(client,true)!;
 vi.stubGlobal('fetch',vi.fn(async()=>new Response('{}',{status:200,headers:{'content-type':'application/json'}})));
 await expect(service.teacher.revoke('id')).rejects.toThrow();
 await expect(service.teacher.create({classroomId:'id',revision:1,expiresOn:'2027-01-01',capacity:5})).rejects.toThrow();
 vi.stubGlobal('fetch',vi.fn(async()=>new Response('{}',{status:403,headers:{'content-type':'application/json'}})));
 await expect(service.student.join('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).rejects.toThrow();
 const signedOut={auth:{getSession:async()=>({data:{session:null},error:null})}} as unknown as SupabaseClient;
 await expect(classroomCodeServices(signedOut,true)!.student.join('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).rejects.toThrow();
});
it('reads only scoped code status and rejects malformed or unauthorized responses',async()=>{
 const rpc=vi.fn(async()=>({data:[{capacity:5,active_students:2,needs_membership_review:false,code_expires_at:'2027-01-02T00:00:00Z'}],error:null}));
 const connected={...client,rpc} as unknown as SupabaseClient;
 expect(await classroomCodeServices(connected,true)!.teacher.status('class-id')).toEqual({capacity:5,activeStudents:2,needsReview:false,expiresAt:'2027-01-02T00:00:00Z'});
 expect(rpc).toHaveBeenCalledWith('teacher_classroom_code_status',{p_classroom:'class-id'});
 rpc.mockResolvedValueOnce({data:[{capacity:5,active_students:-1,needs_membership_review:false,code_expires_at:null}],error:null});
 await expect(classroomCodeServices(connected,true)!.teacher.status('class-id')).rejects.toThrow();
});
