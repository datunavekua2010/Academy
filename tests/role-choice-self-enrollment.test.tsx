// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
const mocks = vi.hoisted(() => ({ proof: vi.fn() }));
vi.mock('../src/lib/googleProof', () => ({ verifyGoogleProofStatus: mocks.proof }));
import { RoleChoices } from '../src/account/LoginPreview';

const user = '00000000-0000-4000-8000-000000000001';
const other = '00000000-0000-4000-8000-000000000002';
function fixture() {
  const getUser = vi.fn().mockResolvedValue({ data: { user: { id: user } }, error: null });
  const rpc = vi.fn().mockResolvedValue({ data: 'created', error: null });
  return { getUser, rpc, client: { auth: { getUser }, rpc } as unknown as SupabaseClient };
}
beforeEach(() => { mocks.proof.mockReset(); mocks.proof.mockResolvedValue(undefined); window.location.hash = '#/account/google'; });
afterEach(() => { cleanup(); window.location.hash = ''; });
for (const [label, role] of [['მოსწავლე', 'student'], ['მშობელი', 'parent']] as const) {
  it(`creates the selected ${role} role before navigating`, async () => {
    const f = fixture();
    render(<RoleChoices enrollmentClient={f.client} includeTeacher={false} />);
    fireEvent.click(screen.getByRole('link', { name: label }));
    await waitFor(() => expect(window.location.hash).toBe(`#/${role}`));
    expect(f.rpc).toHaveBeenCalledExactlyOnceWith('review_choose_google_role', { p_expected_user: user, p_role: role });
    expect(mocks.proof).toHaveBeenCalledOnce();
    expect(screen.queryByRole('link', { name: /მასწავლებლის შესვლა/ })).toBeNull();
  });
}
it('fails closed without proof and never navigates or writes a role', async () => {
  mocks.proof.mockRejectedValue(new Error('private diagnostic'));
  const f = fixture(); render(<RoleChoices enrollmentClient={f.client} />);
  fireEvent.click(screen.getByRole('link', { name: 'მოსწავლე' }));
  expect((await screen.findByRole('alert')).textContent).not.toContain('private diagnostic');
  expect(f.rpc).not.toHaveBeenCalled();
  expect(window.location.hash).toBe('#/account/google');
});
it('does not submit for a different current account', async () => {
  const f = fixture();
  f.getUser.mockResolvedValueOnce({ data: { user: { id: user } }, error: null })
    .mockResolvedValueOnce({ data: { user: { id: other } }, error: null });
  render(<RoleChoices enrollmentClient={f.client} />);
  fireEvent.click(screen.getByRole('link', { name: 'მშობელი' }));
  await screen.findByRole('alert'); expect(f.rpc).not.toHaveBeenCalled();
});
it('does not navigate if the role RPC fails or the account changes afterward', async () => {
  const f = fixture(); f.rpc.mockResolvedValue({ data: null, error: { message: 'private' } });
  const view = render(<RoleChoices enrollmentClient={f.client} />);
  fireEvent.click(screen.getByRole('link', { name: 'მოსწავლე' }));
  await screen.findByRole('alert'); expect(window.location.hash).toBe('#/account/google');
  view.unmount();
  const next = fixture(); next.getUser.mockResolvedValueOnce({data:{user:{id:user}},error:null})
    .mockResolvedValueOnce({data:{user:{id:user}},error:null})
    .mockResolvedValueOnce({data:{user:{id:other}},error:null});
  render(<RoleChoices enrollmentClient={next.client} />);
  fireEvent.click(screen.getByRole('link', { name: 'მშობელი' }));
  await screen.findByRole('alert'); expect(window.location.hash).toBe('#/account/google');
});
it('serializes repeated selections while an enrollment is pending', async () => {
  const f = fixture();
  let resolve!: (value: {data:string; error:null}) => void;
  f.rpc.mockImplementation(() => new Promise(r => { resolve = r; }));
  render(<RoleChoices enrollmentClient={f.client} />);
  fireEvent.click(screen.getByRole('link', { name: 'მოსწავლე' }));
  await waitFor(() => expect(f.rpc).toHaveBeenCalledOnce());
  fireEvent.click(screen.getByRole('link', { name: 'მშობელი' }));
  expect(f.rpc).toHaveBeenCalledOnce();
  resolve({ data: 'created', error: null });
  await waitFor(() => expect(window.location.hash).toBe('#/student'));
});
