// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Shell } from '../src/Shell';

beforeEach(() => { window.location.hash = ''; localStorage.clear(); window.scrollTo = vi.fn(); });
afterEach(() => { cleanup(); window.location.hash = ''; localStorage.clear(); });
function go(path: string) { window.location.hash = path; fireEvent(window, new HashChangeEvent('hashchange')); }
it('offers student, teacher and the original landing page at the root in test mode', () => {
  render(<Shell />);
  expect(screen.getByRole('heading', { name: 'რომელი სივრცის ნახვა გსურთ?' })).toBeTruthy();
  expect(screen.queryByText('სატესტო რეჟიმი')).toBeNull();
  expect(screen.getByText(/პროგრესი ინახება მხოლოდ ამ მოწყობილობაზე/)).toBeTruthy();
  expect(screen.getByRole('link', { name: /მოსწავლე/ }).getAttribute('href')).toBe('#/preview/student');
  expect(screen.getByRole('link', { name: /მასწავლებელი/ }).getAttribute('href')).toBe('#/preview/teacher');
  expect(screen.getByRole('link', { name: /ვებგვერდის ნახვა/ }).getAttribute('href')).toBe('#home');
});
it('lets users preview the isolated teacher navigation and return to the student dashboard', async () => {
  render(<Shell />);
  go('#/teacher');
  const nav = await screen.findByRole('navigation', { name: 'მასწავლებლის ნავიგაცია' });
  expect(within(nav).getAllByRole('link')).toHaveLength(5);
  expect(screen.getByText(/ეს არ არის ანგარიში/)).toBeTruthy();
  expect(screen.getByText(/დავალებები და შედეგები ინახება მხოლოდ ამ ბრაუზერში/)).toBeTruthy();
  expect(screen.queryByText(/მასწავლებლის სატესტო დათვალიერება/)).toBeNull();
  go('#/teacher/assignments');
  expect(await screen.findByText(/ადგილობრივი დავალების შექმნა/)).toBeTruthy();
  go('#/student');
  expect(await screen.findByRole('button', { name: 'Axi-ს ნავიგაციის დახურვა' })).toBeTruthy();
  expect(screen.queryByRole('navigation', { name: 'მასწავლებლის ნავიგაცია' })).toBeNull();
  go('#/');
  expect(await screen.findByRole('heading', { name: 'რომელი სივრცის ნახვა გსურთ?' })).toBeTruthy();
});
it('preserves the public landing page and student deep links', async () => {
  render(<Shell />);
  go('#home');
  await waitFor(() => expect(screen.getByRole('navigation', { name: 'მთავარი ნავიგაცია' })).toBeTruthy());
  go('#/student/streaks');
  expect(await screen.findByRole('heading', { name: 'სწავლის სერია', level: 1 })).toBeTruthy();
});
