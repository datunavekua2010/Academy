import type {SupabaseClient} from '@supabase/supabase-js';
export const ADMIN_REVIEW_ENABLED=false;
const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const reference=(v:string)=>/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(v);
export type ProfileRequest={requestId:string;targetId:string;role:'parent'|'student'|'teacher';displayName:string;firstName:string;grade:number|null;reference:string};
export type LinkRequest={requestId:string;parentId:string;studentId:string;action:'establish'|'revoke';reference:string};
export type ProfileResolution={state:'abandoned';targetId:null}|{state:'committed';targetId:string};
export type LinkResolution={state:'abandoned'}|{state:'committed';parentId:string;studentId:string;action:'establish'|'revoke';changed:boolean};
export async function verifyAdmin(client:SupabaseClient,actor:string):Promise<void>{
 if(!uuid(actor))throw new Error('Unavailable');const {data,error}=await client.auth.getUser();if(error||data.user?.id!==actor)throw new Error('Unavailable');
 const role=await client.from('user_roles').select('role').eq('user_id',actor).eq('role','admin').maybeSingle();if(role.error||role.data?.role!=='admin')throw new Error('Unavailable');
}
export function validProfileRequest(actor:string,r:ProfileRequest):boolean{return !(!uuid(r.requestId)||!uuid(r.targetId)||r.targetId.toLowerCase()===actor.toLowerCase()||!['parent','student','teacher'].includes(r.role)||!r.displayName.trim()||r.displayName.trim().length>200||!r.firstName.trim()||r.firstName.trim().length>100||!reference(r.reference)||(r.role==='student'?(!Number.isInteger(r.grade)||Number(r.grade)<1||Number(r.grade)>7):r.grade!==null));}
export async function provisionProfile(client:SupabaseClient,actor:string,r:ProfileRequest):Promise<void>{
 if(!validProfileRequest(actor,r))throw new Error('Unavailable');
 await verifyAdmin(client,actor);
 const {data,error}=await client.rpc('admin_provision_academy_profile',{p_request:r.requestId,p_target:r.targetId,p_role:r.role,p_display_name:r.displayName.trim(),p_first_name:r.firstName.trim(),p_grade:r.grade,p_reference:r.reference});
 if(error||data!==r.targetId)throw new Error('Uncertain');await verifyAdmin(client,actor);
}
export function validLinkRequest(r:LinkRequest):boolean{return uuid(r.requestId)&&uuid(r.parentId)&&uuid(r.studentId)&&r.parentId.toLowerCase()!==r.studentId.toLowerCase()&&['establish','revoke'].includes(r.action)&&reference(r.reference);}
export async function changeParentLink(client:SupabaseClient,actor:string,r:LinkRequest):Promise<boolean>{
 if(!validLinkRequest(r))throw new Error('Unavailable');
 await verifyAdmin(client,actor);const {data,error}=await client.rpc('admin_parent_link_change',{p_request:r.requestId,p_parent:r.parentId,p_student:r.studentId,p_action:r.action,p_reference:r.reference});
 if(error||typeof data!=='boolean')throw new Error('Uncertain');await verifyAdmin(client,actor);return data;
}
export async function resolveProfile(client:SupabaseClient,actor:string,requestId:string):Promise<ProfileResolution>{
 if(!uuid(requestId))throw new Error('Unavailable');await verifyAdmin(client,actor);const {data,error}=await client.rpc('admin_resolve_profile_provision',{p_request:requestId});
 if(error||!Array.isArray(data)||data.length!==1)throw new Error('Uncertain');const row=data[0];await verifyAdmin(client,actor);
 if(row.state==='abandoned'&&row.target_id===null)return {state:'abandoned',targetId:null};if(row.state==='committed'&&uuid(row.target_id))return {state:'committed',targetId:row.target_id};throw new Error('Uncertain');
}
export async function resolveParentLink(client:SupabaseClient,actor:string,requestId:string):Promise<LinkResolution>{
 if(!uuid(requestId))throw new Error('Unavailable');await verifyAdmin(client,actor);const {data,error}=await client.rpc('admin_parent_link_resolve',{p_request:requestId});
 if(error||!Array.isArray(data)||data.length!==1)throw new Error('Uncertain');const row=data[0];await verifyAdmin(client,actor);
 if(row.state==='abandoned'&&row.parent_id===null&&row.student_id===null&&row.action===null&&row.changed===null)return {state:'abandoned'};
 if(row.state==='committed'&&uuid(row.parent_id)&&uuid(row.student_id)&&(row.action==='establish'||row.action==='revoke')&&typeof row.changed==='boolean')return {state:'committed',parentId:row.parent_id,studentId:row.student_id,action:row.action,changed:row.changed};throw new Error('Uncertain');
}
