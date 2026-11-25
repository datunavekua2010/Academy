// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

const mocks=vi.hoisted(()=>({proof:vi.fn()}));
vi.mock('../src/lib/googleProof',()=>({verifyGoogleProofStatus:mocks.proof}));
import { StudentEnrollmentReview } from '../src/student/StudentEnrollmentReview';
import { ParentEnrollmentReview } from '../src/parent/ParentEnrollmentReview';

const id='00000000-0000-4000-8000-000000000001';
const other='00000000-0000-4000-8000-000000000002';
function clientFixture(){
 const getUser=vi.fn().mockResolvedValue({data:{user:{id}},error:null});
 const rpc=vi.fn().mockResolvedValue({data:'created',error:null});
 return {client:{auth:{getUser},rpc} as unknown as SupabaseClient,getUser,rpc};
}
beforeEach(()=>{mocks.proof.mockReset();mocks.proof.mockResolvedValue(undefined);});
afterEach(()=>cleanup());
it('submits a student nickname and grade for the verified current user',async()=>{
 const {client,rpc}=clientFixture(),done=vi.fn();render(<StudentEnrollmentReview client={client} onComplete={done}/>);
 fireEvent.change(screen.getByLabelText('სახელი ან მეტსახელი'),{target:{value:'  Axi  '}});
 fireEvent.change(screen.getByLabelText('კლასი'),{target:{value:'3'}});
 fireEvent.click(screen.getByRole('button',{name:'ანგარიშის შექმნა'}));
 await waitFor(()=>expect(done).toHaveBeenCalledOnce());
 expect(rpc).toHaveBeenCalledWith('review_student_self_enroll',{p_expected_user:id,p_display_name:'Axi',p_grade:3});
});
it('does not submit when proof fails or the current account changes',async()=>{
 const {client,getUser,rpc}=clientFixture(),done=vi.fn();getUser.mockResolvedValueOnce({data:{user:{id}},error:null}).mockResolvedValueOnce({data:{user:{id:other}},error:null});
 render(<StudentEnrollmentReview client={client} onComplete={done}/>);
 fireEvent.change(screen.getByLabelText('სახელი ან მეტსახელი'),{target:{value:'Axi'}});fireEvent.change(screen.getByLabelText('კლასი'),{target:{value:'1'}});
 fireEvent.click(screen.getByRole('button',{name:'ანგარიშის შექმნა'}));await screen.findByRole('alert');
 expect(rpc).not.toHaveBeenCalled();expect(done).not.toHaveBeenCalled();
});
it('requires parent attestation and creates only a parent enrollment request',async()=>{
 const {client,rpc}=clientFixture(),done=vi.fn();render(<ParentEnrollmentReview client={client} onComplete={done}/>);
 fireEvent.change(screen.getByLabelText('სახელი ან მეტსახელი'),{target:{value:'Parent'}});
 fireEvent.click(screen.getByRole('button',{name:'ანგარიშის შექმნა'}));expect(rpc).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole('checkbox'));fireEvent.click(screen.getByRole('button',{name:'ანგარიშის შექმნა'}));
 await waitFor(()=>expect(done).toHaveBeenCalledOnce());
 expect(rpc).toHaveBeenCalledWith('review_parent_self_enroll',{p_expected_user:id,p_display_name:'Parent'});
 expect(screen.getByText(/ანგარიშის შექმნა ავტომატურად არ აკავშირებს მოსწავლეს/)).toBeTruthy();
});
