// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { TeacherData } from '../src/teacher/data';

const fixture = vi.hoisted(() => ({ role: null as string | null, user: null as { id: string } | null, callback: null as null | (() => void), load: vi.fn(), error: false }));
vi.mock('../src/teacher/data', () => ({ loadTeacherData: fixture.load }));
vi.mock('../src/lib/supabase', () => ({ supabaseConfiguration: { mode: 'connected', client: {
  auth: {
    getUser: async () => ({ data: { user: fixture.user }, error: fixture.error ? { name: 'AuthRetryableFetchError' } : null }),
    onAuthStateChange: (cb: () => void) => { fixture.callback = cb; return { data: { subscription: { unsubscribe() { fixture.callback = null; } } } }; },
  },
  from: (table: string) => { const chain = { select: () => chain, eq: () => chain, maybeSingle: async () => ({ data: table === 'user_roles' ? (fixture.role === 'teacher' ? { role: 'teacher' } : null) : { display_name: 'მასწავლებელი' }, error: null }) }; return chain; },
} as unknown as SupabaseClient } }));
import { TeacherApp } from '../src/teacher/TeacherApp';
const empty: TeacherData = { students: [], assignments: [], attempts: [], invalidAttempts: 0 };

beforeEach(() => { fixture.role = null; fixture.user = null; fixture.callback = null; fixture.error = false; fixture.load.mockReset(); fixture.load.mockResolvedValue(empty); window.location.hash = '#/teacher'; });
afterEach(() => { cleanup(); window.location.hash = ''; });
describe('teacher access', () => {
  it('rejects anonymous and student sessions without loading data', async () => {
    const rendered = render(<TeacherApp />);
    expect(await screen.findByText(/საჭიროა მასწავლებლის ავტორიზებული ანგარიში/)).toBeTruthy();
    expect(fixture.load).not.toHaveBeenCalled();
    rendered.unmount(); fixture.user = { id: 'student' }; fixture.role = 'student';
    render(<TeacherApp />);
    expect((await screen.findByRole('alert')).textContent).toMatch(/წვდომა არ აქვს/);
    expect(fixture.load).not.toHaveBeenCalled();
  });
  it('does not mistake a network error for a logged-out session', async () => {
    fixture.error = true; render(<TeacherApp />);
    expect((await screen.findByRole('alert')).textContent).toMatch(/შემოწმება ვერ მოხერხდა/);
    expect(fixture.load).not.toHaveBeenCalled();
  });
  it('loads data only after teacher role verification and preserves the unverified distinction', async () => {
    fixture.user = { id: 'teacher' }; fixture.role = 'teacher';
    fixture.load.mockResolvedValue({ ...empty, students: [{ id: 'child', name: 'მოსწავლე', grade: 5 }], attempts: [{ id: 'a', studentId: 'child', grade: 1, topicId: 'mdebareoba', subunitId: 'marcxena-marjvena', assignmentId: null, recordedAt: '2026-01-01T12:00:00Z', correct: 2, incorrect: 1 }] });
    window.location.hash = '#/teacher/analytics'; render(<TeacherApp />);
    expect(await screen.findByText('2 / 3')).toBeTruthy();
    expect(screen.queryByText('67%')).toBeNull();
    expect(screen.getByText(/მინიმუმ 10/)).toBeTruthy();
    expect(screen.getByText(/სერვერის მიერ დადასტურებული არ არის/)).toBeTruthy();
    expect(fixture.load).toHaveBeenCalledWith(expect.anything(), 'teacher');
    expect(screen.queryByText(/ათვისება: 67/)).toBeNull();
  });
  it('opens a report card for the linked roster within analytics', async () => {
    fixture.user = { id: 'teacher' }; fixture.role = 'teacher';
    fixture.load.mockResolvedValue({ ...empty, students: [{ id: 'child', name: 'მოსწავლე', grade: 5 }] });
    window.location.hash = '#/teacher/analytics'; render(<TeacherApp />);
    const button = await screen.findByRole('button', { name: 'ანგარიშის შექმნა' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    const select = screen.getByLabelText('მოსწავლე') as HTMLSelectElement;
    expect(Array.from(select.options).map((option) => option.value)).toEqual(['', 'child']);
    fireEvent.click(button);
    expect(screen.queryByLabelText('მოსწავლე')).toBeNull();
  });
  it('prepares unsent reports and clears the draft when changing student', async () => {
    fixture.user = { id: 'teacher' }; fixture.role = 'teacher';
    fixture.load.mockResolvedValue({ ...empty, students: [{ id: 'one', name: 'Child One', grade: 3 }, { id: 'two', name: 'Child Two', grade: 4 }] });
    window.location.hash = '#/teacher/reports'; render(<TeacherApp />);
    const selector = await screen.findByLabelText('მოსწავლე');
    fireEvent.change(selector, { target: { value: 'one' } });
    const input = screen.getByLabelText('განხილული თემები') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'პირადი დაკვირვება' } });
    expect(input.value).toBe('პირადი დაკვირვება');
    expect(screen.getByText(/არ არის შენახული ან გაგზავნილი/)).toBeTruthy();
    fireEvent.change(selector, { target: { value: 'two' } });
    expect((screen.getByLabelText('განხილული თემები') as HTMLTextAreaElement).value).toBe('');
  });
  it('opens the selected student report with a button on the student profile', async () => {
    fixture.user = { id: 'teacher' }; fixture.role = 'teacher';
    fixture.load.mockResolvedValue({ ...empty, students: [{ id: 'child', name: 'მოსწავლე', grade: 3 }] });
    window.location.hash = '#/teacher/students/child'; render(<TeacherApp />);
    const button = await screen.findByRole('button', { name: /პროგრესის ანგარიშის შექმნა/ });
    expect(button.classList.contains('teacher-button')).toBe(true);
    fireEvent.click(button);
    expect((await screen.findByLabelText('მოსწავლე') as HTMLSelectElement).value).toBe('child');
  });
  it('opens the selected linked student report and rejects an unknown student route', async () => {
    fixture.user = { id: 'teacher' }; fixture.role = 'teacher';
    fixture.load.mockResolvedValue({ ...empty, students: [{ id: 'child', name: 'მოსწავლე', grade: 3 }] });
    window.location.hash = '#/teacher/progress-reports/child';
    const rendered = render(<TeacherApp />);
    expect((await screen.findByLabelText('მოსწავლე') as HTMLSelectElement).value).toBe('child');
    rendered.unmount();
    window.location.hash = '#/teacher/progress-reports/other';
    render(<TeacherApp />);
    expect(await screen.findByText(/მოსწავლე ვერ მოიძებნა ან თქვენთან არ არის დაკავშირებული/)).toBeTruthy();
    expect((screen.getByLabelText('მოსწავლე') as HTMLSelectElement).value).toBe('');
  });
  it('rejects student or parent roles on a direct report route', async () => {
    for (const role of ['student', 'parent']) {
      fixture.user = { id: role }; fixture.role = role;
      window.location.hash = '#/teacher/progress-reports/child';
      const rendered = render(<TeacherApp />);
      expect((await screen.findByRole('alert')).textContent).toMatch(/წვდომა არ აქვს/);
      expect(fixture.load).not.toHaveBeenCalled();
      rendered.unmount();
    }
  });
  it('does not show a guessed student profile or stale data after sign-out', async () => {
    fixture.user = { id: 'teacher' }; fixture.role = 'teacher';
    window.location.hash = '#/teacher/students/other'; render(<TeacherApp />);
    expect(await screen.findByText(/მოსწავლე ვერ მოიძებნა/)).toBeTruthy();
    fixture.user = null; fixture.callback?.();
    await waitFor(() => expect(screen.getByText(/საჭიროა მასწავლებლის ავტორიზებული ანგარიში/)).toBeTruthy());
    expect(screen.queryByText(/მოსწავლე ვერ მოიძებნა/)).toBeNull();
  });
});
