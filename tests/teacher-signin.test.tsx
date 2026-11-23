// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
const fixture = vi.hoisted(() => ({ user: null as {id:string} | null, role: null as string | null, callback: null as (() => void) | null, signIn:vi.fn(), signOut:vi.fn(), load:vi.fn() }));
vi.mock('../src/account/TurnstileReview', () => ({ useTurnstileReview: () => ({widgets:null,ready:true,verify:async()=> 'test-captcha',reset:()=>{}}) }));
vi.mock('../src/student/accountMode', () => ({ TEST_ACCOUNT_MODE:false, ACCOUNT_MODE:'connected', TEST_ACCOUNT_ID:'test' }));
vi.mock('../src/teacher/data', () => ({ loadTeacherData:fixture.load }));
vi.mock('../src/lib/supabase', () => ({ supabaseConfiguration:{ mode:'connected', client:{
  auth:{getUser:async()=>({data:{user:fixture.user},error:null}),onAuthStateChange:(cb:()=>void)=>{fixture.callback=cb;return {data:{subscription:{unsubscribe(){fixture.callback=null;}}}}},signInWithPassword:fixture.signIn,signOut:fixture.signOut},
  from:(table:string)=>{const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({error:null,data:table==='user_roles'?(fixture.role==='teacher'?{role:'teacher'}:null):{display_name:'მასწავლებელი'}})};return q;}
} as unknown as SupabaseClient } }));
import { TeacherApp } from '../src/teacher/TeacherApp';
beforeEach(()=>{window.location.hash='#/teacher'; fixture.user=null;fixture.role=null;fixture.callback=null;fixture.signIn.mockReset();fixture.signOut.mockReset();fixture.load.mockReset().mockResolvedValue({students:[],assignments:[],attempts:[],invalidAttempts:0});});
afterEach(()=>{cleanup(); window.location.hash='';});
async function enter() {fireEvent.change(await screen.findByLabelText('ელფოსტა'),{target:{value:'teacher@example.test'}});fireEvent.change(screen.getByLabelText('პაროლი'),{target:{value:'my-password'}});fireEvent.click(screen.getByRole('button',{name:'შესვლა'}));}
it('submits credentials, clears the password on failure, and never exposes the backend error',async()=>{
 fixture.signIn.mockResolvedValue({error:new Error('secret internal details')}); render(<TeacherApp />);await enter();
 expect((await screen.findByRole('alert')).textContent).toContain('შესვლა ვერ მოხერხდა');
 expect(screen.queryByText(/secret internal details/)).toBeNull(); expect((screen.getByLabelText('პაროლი') as HTMLInputElement).value).toBe('');
 expect(fixture.signIn).toHaveBeenCalledWith({email:'teacher@example.test',password:'my-password',options:{captchaToken:'test-captcha'}});expect(fixture.load).not.toHaveBeenCalled();
});
it('rechecks roles after successful auth and lets a denied user sign out',async()=>{
 fixture.signIn.mockImplementation(async()=>{fixture.user={id:'student'};fixture.role='student';fixture.callback?.();return {error:null};});
 fixture.signOut.mockImplementation(async()=>{fixture.user=null;fixture.callback?.();return {error:null};});
 render(<TeacherApp />);await enter(); expect((await screen.findByRole('alert')).textContent).toContain('წვდომა არ აქვს');expect(fixture.load).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('button',{name:'ანგარიშიდან გასვლა'}));expect(await screen.findByLabelText('ელფოსტა')).toBeTruthy();
});
it('loads the verified teacher workspace and signs out without leaving student data on screen',async()=>{
 fixture.signIn.mockImplementation(async()=>{fixture.user={id:'teacher'};fixture.role='teacher';fixture.callback?.();return {error:null};});
 fixture.signOut.mockImplementation(async()=>{fixture.user=null;fixture.callback?.();return {error:null};});
 fixture.load.mockResolvedValue({students:[{id:'child',name:'პირადი სახელი',grade:3}],assignments:[],attempts:[],invalidAttempts:0});
 render(<TeacherApp />);await enter();expect(await screen.findByText('პირადი სახელი')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'ანგარიშიდან გასვლა'}));await waitFor(()=>expect(screen.queryByText('პირადი სახელი')).toBeNull());expect(await screen.findByLabelText('ელფოსტა')).toBeTruthy();
});
it('reports failed sign-out rather than claiming a successful logout',async()=>{
 fixture.user={id:'teacher'};fixture.role='teacher';fixture.signOut.mockResolvedValue({error:new Error('failed')});render(<TeacherApp />);
 fireEvent.click(await screen.findByRole('button',{name:'ანგარიშიდან გასვლა'}));expect((await screen.findByRole('alert')).textContent).toContain('გასვლა ვერ მოხერხდა');
});
