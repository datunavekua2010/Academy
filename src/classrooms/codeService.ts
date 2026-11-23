import type { SupabaseClient } from '@supabase/supabase-js';
import type { StudentCodeService, TeacherCodeService } from './ClassroomCodeControls';

/** Browser receives only its own user access token; the server holds privileged secrets. */
export function classroomCodeServices(client: SupabaseClient | null, enabled: boolean): {teacher:TeacherCodeService; student:StudentCodeService} | null {
  if (!client || !enabled) return null;
  const call=async (action:'issue'|'revoke'|'join', body:Record<string,unknown>):Promise<Record<string,unknown>> => {
    const { data, error } = await client.auth.getSession();
    const token=data.session?.access_token;
    if (error || !token) throw new Error('Authentication required');
    const result=await fetch(`/api/classroom-code/${action}`,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${token}`},body:JSON.stringify(body),credentials:'omit',cache:'no-store'});
    if (!result.ok || !result.headers.get('content-type')?.toLowerCase().includes('application/json')) throw new Error('Operation failed');
    const value:unknown=await result.json();
    if (!value || typeof value!=='object' || Array.isArray(value)) throw new Error('Invalid response');
    return value as Record<string,unknown>;
  };
  return {
    teacher: {
      status:async classroomId => {
        const {data,error}=await client.rpc('teacher_classroom_code_status',{p_classroom:classroomId});
        if (error || !Array.isArray(data) || data.length!==1) throw new Error('Status unavailable');
        const x=data[0] as Record<string,unknown>;
        if (!(x.capacity===null || (Number.isSafeInteger(x.capacity) && (x.capacity as number)>0)) || !Number.isSafeInteger(x.active_students) || (x.active_students as number)<0 || typeof x.needs_membership_review !== 'boolean' || !(x.code_expires_at===null || (typeof x.code_expires_at==='string' && Number.isFinite(Date.parse(x.code_expires_at))))) throw new Error('Invalid status');
        return {capacity:x.capacity as number | null,activeStudents:x.active_students as number,needsReview:x.needs_membership_review as boolean,expiresAt:x.code_expires_at as string | null};
      },
      create:async input => { const result=await call('issue',input); if(typeof result.code!=='string' || !/^[A-Z2-7]{26}$/.test(result.code)) throw new Error('Invalid response'); return {code:result.code}; },
      revoke:async classroomId => {const result=await call('revoke',{classroomId}); if(result.ok!==true) throw new Error('Invalid response');},
    },
    student: {join:async code => {const result=await call('join',{code}); if(result.message!=='Joined') throw new Error('Invalid response');}},
  };
}
