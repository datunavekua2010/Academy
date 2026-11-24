// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
const fixture=vi.hoisted(()=>({rpc:vi.fn(),load:vi.fn()}));
vi.mock('../src/student/accountMode',()=>({TEST_ACCOUNT_MODE:false,ACCOUNT_MODE:'connected',TEST_ACCOUNT_ID:'test'}));
vi.mock('../src/teacher/data',()=>({loadTeacherData:fixture.load}));
vi.mock('../src/lib/supabase',()=>({supabaseConfiguration:{mode:'connected',client:{
  auth:{getUser:async()=>({data:{user:{id:'multi-role'}},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>({error:null})},
  rpc:fixture.rpc,
  from:(table:string)=>{const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({data:table==='user_roles'?{role:'teacher'}:{display_name:'Test'},error:null})};return q;},
} as unknown as SupabaseClient}}));
import {TeacherApp} from '../src/teacher/TeacherApp';
beforeEach(()=>{vi.stubEnv('VITE_GOOGLE_PROOF_REVIEW','true');window.location.hash='#/teacher';fixture.rpc.mockReset();fixture.load.mockReset().mockResolvedValue({students:[],assignments:[],attempts:[],invalidAttempts:0});});
afterEach(()=>{cleanup();vi.unstubAllEnvs();window.location.hash='';});
it('does not open the teacher workspace merely because a Google session sees the teacher role row',async()=>{
  fixture.rpc.mockResolvedValue({data:false,error:null});render(<TeacherApp/>);
  expect((await screen.findByRole('alert')).textContent).toContain('ელფოსტა და პაროლი');
  expect(fixture.rpc).toHaveBeenCalledWith('review_teacher_session_status');
  expect(fixture.load).not.toHaveBeenCalled();
});
it('loads teacher data only after the server confirms effective access',async()=>{
  fixture.rpc.mockResolvedValue({data:true,error:null});render(<TeacherApp/>);
  await waitFor(()=>expect(fixture.load).toHaveBeenCalled());
});
it('fails closed when the status RPC is unavailable',async()=>{
  fixture.rpc.mockResolvedValue({data:null,error:{message:'internal'}});render(<TeacherApp/>);
  expect((await screen.findByRole('alert')).textContent).toContain('ანგარიშის შემოწმება ვერ მოხერხდა');
  expect(fixture.load).not.toHaveBeenCalled();
});
