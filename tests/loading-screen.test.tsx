// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { LoadingScreen } from '../src/components/LoadingScreen';
afterEach(cleanup);
it('announces loading without inventing progress', () => {
  const {container} = render(<LoadingScreen />);
  expect(screen.getByRole('main')).toBeTruthy();
  expect(screen.getByRole('status').textContent).toContain('იტვირთება…');
  expect(container.querySelector('[role="progressbar"]')).toBeNull();
});
it('supports compact authenticated loading inside another page', () => {
  render(<LoadingScreen compact message="ანგარიში მოწმდება…" />);
  expect(screen.queryByRole('main')).toBeNull();
  expect(screen.getByRole('status').textContent).toContain('ანგარიში მოწმდება…');
});
