// @vitest-environment jsdom
import {act,cleanup,fireEvent,render,screen,waitFor,within} from '@testing-library/react';import {afterEach,beforeEach,expect,it,vi} from 'vitest';import type {SupabaseClient} from '@supabase/supabase-js';
import {AdminApp,AdminReviewApp} from '../src/admin/AdminApp';import {provisionProfile,changeParentLink,resolveProfile,resolveParentLink,type ProfileRequest} from '../src/admin/data';
const admin='00000000-0000-4000-8000-000000000001',parent='00000000-0000-4000-8000-000000000002',student='00000000-0000-4000-8000-000000000003',request='10000000-0000-4000-8000-000000000001';
let current:string|null,role:boolean,callback:((event:string,session:unknown)=>void)|null;
const rpc=vi.fn(async(name:string,_args:Record<string,unknown>)=>{if(name==='admin_provision_academy_profile')return {data:null,error:'network'};if(name==='admin_resolve_profile_provision')return {data:[{state:'abandoned',target_id:null}],error:null};if(name==='admin_parent_link_change')return {data:true,error:null};if(name==='admin_parent_link_resolve')return {data:[{state:'committed',parent_id:parent,student_id:student,action:'establish',changed:true}],error:null};return {data:null,error:'unknown'};});
const client={auth:{getUser:async()=>({data:{user:current?{id:current}:null},error:null}),onAuthStateChange:(cb:typeof callback)=>{callback=cb;return {data:{subscription:{unsubscribe:()=>{}}}};},signOut:async()=>{current=null;callback?.('SIGNED_OUT',null);return {error:null};},signInWithPassword:async()=>({error:null})},from:()=>{const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({data:role?{role:'admin'}:null,error:null})};return q;},rpc} as unknown as SupabaseClient;
beforeEach(()=>{current=admin;role=true;callback=null;rpc.mockClear();});afterEach(cleanup);
it('is unavailable by default',()=>{render(<AdminApp/>);expect(screen.getByText('ამჟამად მიუწვდომელია.')).toBeTruthy();});
it('requires verified identity and role, validates inputs and narrows RPC resolutions',async()=>{
 const payload:ProfileRequest={requestId:request,targetId:student,role:'student',displayName:'  Child  ',firstName:' Child ',grade:2,reference:'AUTH-1'};
 role=false;await expect(provisionProfile(client,admin,payload)).rejects.toThrow();expect(rpc).not.toHaveBeenCalled();role=true;current=parent;await expect(provisionProfile(client,admin,payload)).rejects.toThrow();expect(rpc).not.toHaveBeenCalled();current=admin;
 await expect(provisionProfile(client,admin,{...payload,grade:9})).rejects.toThrow();expect(rpc).not.toHaveBeenCalled();await expect(provisionProfile(client,admin,payload)).rejects.toThrow('Uncertain');expect(rpc).toHaveBeenCalledWith('admin_provision_academy_profile',{p_request:request,p_target:student,p_role:'student',p_display_name:'Child',p_first_name:'Child',p_grade:2,p_reference:'AUTH-1'});
 expect(await resolveProfile(client,admin,request)).toEqual({state:'abandoned',targetId:null});expect(await changeParentLink(client,admin,{requestId:request,parentId:parent,studentId:student,action:'establish',reference:'AUTH-1'})).toBe(true);
 expect(await resolveParentLink(client,admin,request)).toEqual({state:'committed',parentId:parent,studentId:student,action:'establish',changed:true});
});
it('holds an uncertain profile request fixed until it is resolved or an exact retry succeeds',async()=>{
 render(<AdminReviewApp client={client}/>);act(()=>callback?.('INITIAL_SESSION',{user:{id:admin}}));const section=(await screen.findByText('არსებული Auth ანგარიშის პროფილი')).closest('section')!;const form=within(section);
 fireEvent.change(form.getByLabelText('მოთხოვნის ID'),{target:{value:request}});fireEvent.change(form.getByLabelText('Auth მომხმარებლის ID'),{target:{value:parent}});fireEvent.change(form.getByLabelText('სრული სახელი'),{target:{value:'Parent'}});fireEvent.change(form.getByLabelText('სახელი'),{target:{value:'Parent'}});fireEvent.change(form.getByLabelText('ავტორიზაციის შიდა ნომერი (პირადი მონაცემების გარეშე)'),{target:{value:'AUTH'}});fireEvent.click(form.getByLabelText('დამოუკიდებლად გადავამოწმე პიროვნება და უფლებამოსილება'));fireEvent.click(form.getByText('პროფილის შექმნა'));
 await form.findByText(/შედეგი გაურკვეველია/);expect((form.getByText('ახალი მოთხოვნა') as HTMLButtonElement).disabled).toBe(true);expect(form.getByLabelText('Auth მომხმარებლის ID').matches(':disabled')).toBe(true);
 fireEvent.click(form.getByText('იგივე მოთხოვნის გამეორება'));await waitFor(()=>expect(rpc.mock.calls.filter(([name])=>name==='admin_provision_academy_profile')).toHaveLength(2));const calls=rpc.mock.calls.filter(([name])=>name==='admin_provision_academy_profile');expect(calls[0][1]).toEqual(calls[1][1]);
 fireEvent.click(form.getByText('შედეგის შემოწმება'));await form.findByText(/მოთხოვნა დაიბლოკა/);expect((form.getByText('ახალი მოთხოვნა') as HTMLButtonElement).disabled).toBe(false);fireEvent.click(form.getByText('ახალი მოთხოვნა'));expect((form.getByLabelText('Auth მომხმარებლის ID') as HTMLInputElement).value).toBe('');
});
it('clears privileged forms on signout and rejects removed admin role',async()=>{
 render(<AdminReviewApp client={client}/>);act(()=>callback?.('INITIAL_SESSION',{user:{id:admin}}));await screen.findByText('არსებული Auth ანგარიშის პროფილი');act(()=>{role=false;callback?.('TOKEN_REFRESHED',{user:{id:admin}});});await screen.findByRole('alert');expect(screen.queryByText('არსებული Auth ანგარიშის პროფილი')).toBeNull();
});
it('ignores rapid duplicate sign-in submissions and clears the password on failure',async()=>{
 let release!:()=>void;const waiting=new Promise<void>(resolve=>{release=resolve;});
 const signIn=vi.fn(async()=>{await waiting;return {error:new Error('private error')};});
 const signingClient={...client,auth:{...client.auth,signInWithPassword:signIn}} as unknown as SupabaseClient;
 render(<AdminReviewApp client={signingClient}/>);act(()=>callback?.('INITIAL_SESSION',null));
 fireEvent.change(screen.getByLabelText('ელფოსტა'),{target:{value:'admin@example.test'}});
 fireEvent.change(screen.getByLabelText('პაროლი'),{target:{value:'test-password'}});
 const form=screen.getByLabelText('პაროლი').closest('form')!;
 act(()=>{fireEvent.submit(form);fireEvent.submit(form);});
 await waitFor(()=>expect(signIn).toHaveBeenCalledTimes(1));
 await act(async()=>{release();await waiting;});
 expect((screen.getByLabelText('პაროლი') as HTMLInputElement).value).toBe('');
 expect(screen.getByRole('alert').textContent).not.toContain('private error');
});
