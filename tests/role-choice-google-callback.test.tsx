// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { GoogleCallback } from '../src/account/GoogleAuth';
afterEach(cleanup);
it('shows student and parent choices after Google identity verification without granting a role', () => {
  render(<GoogleCallback result="ok" />);
  expect(screen.getByRole('status').textContent).toContain('Google ანგარიში დადასტურდა');
  expect(screen.getByRole('link',{name:'მოსწავლე'}).getAttribute('href')).toBe('#/student');
  expect(screen.getByRole('link',{name:'მშობელი'}).getAttribute('href')).toBe('#/parent');
  expect(screen.queryByRole('link',{name:'მასწავლებლის შესვლა'})).toBeNull();
  expect(screen.getByText(/როლი და კავშირები ცალკე დადასტურებას საჭიროებს/)).toBeTruthy();
  expect(screen.getByRole('link',{name:/ანგარიშიდან გასვლა/}).getAttribute('href')).toBe('#/account/status');
});
it('does not offer role choices on a failed callback', () => {
  render(<GoogleCallback result="error" />);
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(screen.queryByRole('link',{name:'მოსწავლე'})).toBeNull();
});
