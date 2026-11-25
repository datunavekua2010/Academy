// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
const mocks=vi.hoisted(()=>({proof:vi.fn(),admin:vi.fn()}));
vi.mock('../src/lib/googleProof',()=>({verifyGoogleProofStatus:mocks.proof}));
vi.mock('../src/admin/data',()=>({verifyAdmin:mocks.admin}));
import { ParentLinkApplications } from '../src/parent/ParentLinkApplications';
import { ParentApplicationsReview } from '../src/admin/ParentApplicationsReview';
const parent='00000000-0000-4000-8000-000000000001',student='00000000-0000-4000-8000-000000000002',request='00000000-0000-4000-8000-000000000003',admin='00000000-0000-4000-8000-000000000004';
beforeEach(()=>{mocks.proof.mockReset().mockResolvedValue(undefined);mocks.admin.mockReset().mockResolvedValue(undefined);});afterEach(()=>cleanup());
it('submits only a request and retries uncertain outcomes using the same id',async()=>{
 const rpc=vi.fn(async(name:string)=>name==='review_parent_link_my_requests'?{data:[],error:null}:{data:null,error:{message:'network'}});
 const client={auth:{getUser:vi.fn().mockResolvedValue({data:{user:{id:parent}},error:null})},rpc} as unknown as SupabaseClient;
 render(<ParentLinkApplications client={client} parentId={parent} onChanged={()=>{}}/>);
 await waitFor(()=>expect(rpc).toHaveBeenCalledWith('review_parent_link_my_requests'));
 fireEvent.change(screen.getByLabelText('მოსწავლის ანგარიშის ნომერი'),{target:{value:student}});fireEvent.click(screen.getByRole('button',{name:'მოთხოვნის გაგზავნა'}));
 await screen.findByText(/შედეგი ვერ დადასტურდა/);
 const first=rpc.mock.calls.filter(([name])=>name==='review_parent_link_request')[0];
 fireEvent.click(screen.getByRole('button',{name:'იგივე მოთხოვნის გამეორება'}));
 await waitFor(()=>expect(rpc.mock.calls.filter(([name])=>name==='review_parent_link_request')).toHaveLength(2));
 expect(rpc.mock.calls.filter(([name])=>name==='review_parent_link_request')[1]).toEqual(first);
});
it('requires a selected request, independent review acknowledgement and reference for an admin decision',async()=>{
 const rpc=vi.fn(async(name:string)=>name==='review_admin_parent_link_applications'?{data:[{id:request,parent_id:parent,student_id:student,created_at:'2026-01-01T00:00:00Z'}],error:null}:{data:'approved',error:null});
 const client={rpc} as unknown as SupabaseClient;render(<ParentApplicationsReview client={client} actor={admin}/>);
 await screen.findByText(new RegExp(`მოთხოვნა: ${request}`));
 fireEvent.change(screen.getByLabelText('მოთხოვნა'),{target:{value:request}});fireEvent.change(screen.getByLabelText('შიდა ავტორიზაციის ნომერი'),{target:{value:'AUTH-123'}});
 fireEvent.click(screen.getByRole('button',{name:'გადაწყვეტილების შენახვა'}));expect(rpc.mock.calls.filter(([name])=>name==='review_admin_parent_link_decide')).toHaveLength(0);
 fireEvent.click(screen.getByRole('checkbox'));fireEvent.click(screen.getByRole('button',{name:'გადაწყვეტილების შენახვა'}));
 await waitFor(()=>expect(rpc).toHaveBeenCalledWith('review_admin_parent_link_decide',{p_expected_admin:admin,p_request:request,p_decision:'approve',p_reference:'AUTH-123'}));
});
