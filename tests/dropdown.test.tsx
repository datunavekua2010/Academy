// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';

describe('grade switch resets the topics dropdown', () => {
  it('closes the panel and shows the new grade curriculum', () => {
    window.localStorage.clear();
    window.location.hash = '#/student/practice';
    window.scrollTo = vi.fn();
    render(<StudentApp />);

    fireEvent.click(screen.getByRole('button', { name: /თემები — არჩეულია/ }));
    const panel = screen.getByRole('group', { name: 'თემების არჩევა' });
    expect(within(panel).getAllByRole('button').length).toBe(3);

    // Switch to grade VII while the panel is open.
    fireEvent.click(screen.getAllByRole('tab')[6]);

    expect(screen.queryByRole('group', { name: 'თემების არჩევა' })).toBeNull();
    const trigger = screen.getByRole('button', { name: /თემები — არჩეულია/ });
    // Grade VII topic is "ხაზოვანი განტოლებები".
    expect(trigger.textContent).toContain('ხაზოვანი განტოლებები');

    fireEvent.click(trigger);
    const newPanel = screen.getByRole('group', { name: 'თემების არჩევა' });
    const topics = within(newPanel).getAllByRole('button').map((b) => b.querySelector('strong')?.textContent);
    console.log('GRADE VII TOPICS:', JSON.stringify(topics));
    expect(topics).toContain('გეომეტრია');
  });
});
