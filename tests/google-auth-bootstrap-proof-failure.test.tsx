// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Root } from 'react-dom/client';

const mock = vi.hoisted(() => ({
  finish: vi.fn(), startProof: vi.fn(), verifyProof: vi.fn(),
}));
vi.mock('../src/lib/googleAuth', () => ({
  finishGoogleAuth: mock.finish, googleAuthClient: { auth: {} },
}));
vi.mock('../src/lib/googleProof', () => ({
  startGoogleProof: mock.startProof, verifyGoogleProofStatus: mock.verifyProof,
}));
import { renderAuthCallback } from '../src/authBootstrap';

beforeEach(() => {
  vi.stubEnv('VITE_GOOGLE_PROOF_REVIEW', 'true');
  mock.finish.mockReset(); mock.startProof.mockReset(); mock.verifyProof.mockReset();
});
afterEach(() => { vi.unstubAllEnvs(); });
const root = () => {
  const render = vi.fn();
  return { render, value: { render } as unknown as Root };
};
const result = (render: ReturnType<typeof vi.fn>) => render.mock.calls[0]?.[0]?.props?.result;

it('distinguishes an unavailable proof from a successful Google session without granting a role', async () => {
  mock.finish.mockResolvedValue(undefined);
  mock.startProof.mockRejectedValue(new Error('Unavailable'));
  const target = root();
  renderAuthCallback(target.value, { kind: 'google', value: { code: 'synthetic' } });
  await vi.waitFor(() => expect(target.render).toHaveBeenCalledOnce());
  expect(result(target.render)).toBe('proof-unavailable');
  expect(mock.finish).toHaveBeenCalledOnce();
  expect(mock.startProof).toHaveBeenCalledOnce();
});
it('still reports a Google authentication failure when session exchange fails', async () => {
  mock.finish.mockRejectedValue(new Error('Unavailable'));
  const target = root();
  renderAuthCallback(target.value, { kind: 'google', value: { code: 'synthetic' } });
  await vi.waitFor(() => expect(target.render).toHaveBeenCalledOnce());
  expect(result(target.render)).toBe('error');
  expect(mock.startProof).not.toHaveBeenCalled();
});
it('does not show role choices for a forged or failed proof callback', async () => {
  mock.verifyProof.mockRejectedValue(new Error('Unavailable'));
  const target = root();
  renderAuthCallback(target.value, { kind: 'proof', value: 'ok' });
  await vi.waitFor(() => expect(target.render).toHaveBeenCalledOnce());
  expect(result(target.render)).toBe('proof-unavailable');
});
