// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
vi.mock('../src/student/accountMode', () => ({ TEST_ACCOUNT_MODE: false, TEST_ACCOUNT_ID: 'axiom-test-preview-v1' }));
vi.mock('../src/lib/supabase', () => ({ supabaseConfiguration: { mode: 'unconfigured', client: null } }));
import { TeacherApp } from '../src/teacher/TeacherApp';
afterEach(cleanup);
it('fails closed when test mode is disabled and the real client is unavailable', () => {
  window.location.hash = '#/teacher'; render(<TeacherApp />);
  expect(screen.queryByRole('navigation', { name: 'მასწავლებლის ნავიგაცია' })).toBeNull();
  expect(screen.getByText(/მასწავლებლის ანგარიშით შესვლა ამ ეტაპზე მიუწვდომელია/)).toBeTruthy();
});
