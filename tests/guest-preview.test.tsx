// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';

const auth = vi.hoisted(() => ({ callback: null as null | ((event: string, session: unknown) => void), profile: true, from: vi.fn(), passwordError: false, signIn: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({ supabaseConfiguration: { mode: 'connected', client: {
  auth: {
    onAuthStateChange: (callback: typeof auth.callback) => { auth.callback = callback; return { data: { subscription: { unsubscribe: vi.fn() } } }; },
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      auth.signIn(credentials);
      if (auth.passwordError) return { error: new Error('invalid credentials') };
      auth.callback?.('SIGNED_IN', { user: { id: 'student-1', email: credentials.email } });
      return { error: null };
    },
    signOut: async () => { auth.callback?.('SIGNED_OUT', null); return { error: null }; },
  },
  from: (table: string) => {
    auth.from(table);
    const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ error: null, data: table === 'profiles' ? (auth.profile ? { display_name: 'Test Student', first_name: 'Test' } : null) : table === 'user_roles' ? { role: 'student' } : { grade: 1 } }) };
    return query;
  },
} } }));
vi.mock('../src/practice/supabaseStore', () => ({ loadStudentPractice: vi.fn(async () => ({ attempts: [], assignments: [] })), saveStudentAttempt: vi.fn() }));
import { StudentApp } from '../src/student/StudentApp';

async function openGuest(hash: string) {
  window.location.hash = hash;
  render(<StudentApp />);
  act(() => auth.callback?.('INITIAL_SESSION', null));
  await waitFor(() => expect(screen.queryByRole('status', { name: 'იტვირთება…' })).toBeNull());
}

beforeEach(() => {
  window.localStorage.clear();
  resetProgressCache();
  auth.callback = null;
  auth.profile = true;
  auth.from.mockClear();
  auth.signIn.mockClear();
  auth.passwordError = false;
  window.scrollTo = vi.fn();
});
afterEach(() => { cleanup(); window.localStorage.clear(); resetProgressCache(); window.location.hash = ''; document.body.style.overflow = ''; });

describe('public guest previews', () => {
  it('offers browsing from sign-in while keeping profile and progress private', async () => {
    await openGuest('#/student');
    expect(screen.getByRole('link', { name: 'სავარჯიშოები' }).getAttribute('href')).toBe('#/student/practice');
    expect(screen.getByRole('link', { name: 'გაკვეთილები' }).getAttribute('href')).toBe('#/student/lessons');
    cleanup();
    await openGuest('#/student/progress');
    expect(screen.getByLabelText('ელფოსტა')).toBeTruthy();
    expect(screen.queryByText('ჩემი პროგრესი', { selector: 'h1' })).toBeNull();
    expect(auth.from).not.toHaveBeenCalled();
  });

  it('opens exercises, blocks choices, and browses another question without saving', async () => {
    const oldDemo = JSON.stringify({ version: 1, attempts: [{ id: 'old-demo' }] });
    window.localStorage.setItem('axiom-academy.practice.v1', oldDemo);
    const oldDraft = '{"old":"draft"}';
    window.localStorage.setItem('axiom-academy.practice.draft.v1', oldDraft);
    await openGuest('#/student/practice');
    expect(screen.getByText(/სტუმრის რეჟიმი: დაათვალიერე სავარჯიშოები/)).toBeTruthy();
    expect(screen.queryByText('📌 მასწავლებლის მიერ მინიჭებული')).toBeNull();
    const start = await screen.findAllByRole('button', { name: /ვარჯიშის დაწყება/ });
    fireEvent.click(start[0]);
    const group = await screen.findByRole('group', { name: 'პასუხის ვარიანტები' });
    const option = within(group).getAllByRole('button')[0];
    fireEvent.click(option);
    expect(screen.getByRole('status').textContent).toContain('ანგარიშში არ ხარ შესული');
    expect(option.getAttribute('aria-pressed')).toBe('false');
    expect(document.querySelector('.answer-feedback')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /შემდეგი სავარჯიშო/ }));
    expect(screen.queryByText(/ანგარიშში არ ხარ შესული/)).toBeNull();
    expect(screen.getByText('კითხვა #2')).toBeTruthy();
    expect(window.localStorage.getItem('axiom-academy.practice.v1')).toBe(oldDemo);
    expect(window.localStorage.getItem('axiom-academy.practice.draft.v1')).toBe(oldDraft);
    expect(auth.from).not.toHaveBeenCalled();
  });

  it('previews every lesson step, blocks typing and tiles, and does not write progress', async () => {
    await openGuest('#/student/lessons/g6-u10-l3');
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.readOnly).toBe(true);
    fireEvent.click(input);
    fireEvent.change(input, { target: { value: '5x' } });
    expect(input.value).toBe('');
    expect(screen.getByText(/ანგარიშში არ ხარ შესული/)).toBeTruthy();
    expect(screen.queryByText('სწორია')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    expect(screen.getByText('გადატანილია 0 / 5')).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: /გადაიტანე საერთო ჯგუფში/ })[0]);
    expect(screen.getByText('გადატანილია 0 / 5')).toBeTruthy();
    expect(screen.getByText(/ანგარიშში არ ხარ შესული/)).toBeTruthy();
    for (let i = 0; i < 7; i += 1) fireEvent.click(screen.getByRole('button', { name: 'შემდეგი ნაბიჯი' }));
    fireEvent.click(screen.getByRole('button', { name: 'ნახვის დასრულება' }));
    expect(screen.getByText('გაკვეთილის ნახვა დასრულდა')).toBeTruthy();
    expect(window.localStorage.getItem(LEARN_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(`${LEARN_STORAGE_KEY}:student-1`)).toBeNull();
  });


  it('waits for authentication and changes a signed-in lesson to guest mode on sign-out', async () => {
    window.location.hash = '#/student/lessons/g6-u10-l3';
    render(<StudentApp />);
    expect(screen.queryByText(/სტუმრის რეჟიმი/)).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
    act(() => auth.callback?.('INITIAL_SESSION', { user: { id: 'student-1' } }));
    await screen.findByRole('button', { name: 'მოსწავლის ანგარიშიდან გასვლა' });
    expect((await screen.findByRole('textbox') as HTMLInputElement).readOnly).toBe(false);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '5x' } });
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('5x');
    fireEvent.click(screen.getByRole('button', { name: 'მოსწავლის ანგარიშიდან გასვლა' }));
    await screen.findByText(/სტუმრის რეჟიმი: შეგიძლია/);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('');
    expect((screen.getByRole('textbox') as HTMLInputElement).readOnly).toBe(true);
  });

  it('opens grade-specific exercises without exposing student assignments', async () => {
    await openGuest('#/student/homework/grade/3');
    expect(await screen.findByText(/სტუმრის რეჟიმი: დაათვალიერე სავარჯიშოები/)).toBeTruthy();
    expect(screen.queryByText('📌 მასწავლებლის მიერ მინიჭებული')).toBeNull();
    expect(auth.from).not.toHaveBeenCalled();
  });


  it('uses academy email and password, rejects a wrong password and opens the real profile after sign-in', async () => {
    await openGuest('#/student');
    auth.passwordError = true;
    fireEvent.change(screen.getByLabelText('ელფოსტა'), { target: { value: 'student@example.test' } });
    fireEvent.change(screen.getByLabelText('პაროლი'), { target: { value: 'incorrect' } });
    fireEvent.click(screen.getByRole('button', { name: 'შესვლა' }));
    expect((await screen.findByRole('alert')).textContent).toContain('შესვლა ვერ მოხერხდა');
    expect(auth.signIn).toHaveBeenCalledWith({ email: 'student@example.test', password: 'incorrect' });
    expect((screen.getByLabelText('პაროლი') as HTMLInputElement).value).toBe('');
    expect(screen.queryByText(/გამარჯობა, ნინო/)).toBeNull();
    auth.passwordError = false;
    fireEvent.change(screen.getByLabelText('პაროლი'), { target: { value: 'academy-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'შესვლა' }));
    expect(await screen.findByRole('heading', { name: /გამარჯობა, Test/ })).toBeTruthy();
    expect(auth.signIn).toHaveBeenLastCalledWith({ email: 'student@example.test', password: 'academy-password' });
  });

  it('does not turn a signed-in user with an invalid profile into a guest', async () => {
    auth.profile = false;
    window.location.hash = '#/student/practice';
    render(<StudentApp />);
    act(() => auth.callback?.('SIGNED_IN', { user: { id: 'student-1' } }));
    expect(await screen.findByText(/მოსწავლის პროფილი ვერ ჩაიტვირთა/)).toBeTruthy();
    expect(screen.queryByText(/სტუმრის რეჟიმი/)).toBeNull();
  });
});
