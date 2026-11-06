// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from '../src/App';
import { StudentApp } from '../src/student/StudentApp';

const BUBBLES = [
  'ჩემი გაკვეთილები',
  'საშინაო დავალება',
  'ვარჯიში',
  'ჩემი პროგრესი',
  'განრიგი',
  'ჩემი პროფილი',
];

function openAxi() {
  fireEvent.click(screen.getByRole('button', { name: 'Axi-ს ნავიგაციის გახსნა' }));
  return screen.getByRole('navigation', { name: 'მოსწავლის სექციები' });
}

beforeEach(() => {
  window.location.hash = '#/student';
  window.scrollTo = vi.fn();
});

afterEach(() => {
  cleanup();
  window.location.hash = '';
});

describe('Axi student navigation', () => {
  it('opens all six destinations and closes when Axi is clicked again', () => {
    render(<StudentApp />);

    const panel = openAxi();
    for (const label of BUBBLES) {
      expect(within(panel).getByRole('link', { name: new RegExp(label) })).toBeTruthy();
    }

    fireEvent.click(screen.getByRole('button', { name: 'Axi-ს ნავიგაციის დახურვა' }));
    expect(screen.queryByRole('navigation', { name: 'მოსწავლის სექციები' })).toBeNull();
  });

  it('closes on Escape', () => {
    render(<StudentApp />);
    openAxi();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('navigation', { name: 'მოსწავლის სექციები' })).toBeNull();
  });

  it('navigates to a real student page and closes the menu', async () => {
    render(<StudentApp />);
    const panel = openAxi();

    const practiceLink = within(panel).getByRole('link', { name: /ვარჯიში/ });
    expect(practiceLink.getAttribute('href')).toBe('#/student/practice');

    fireEvent.click(practiceLink);
    // jsdom does not perform same-document anchor navigation; emulate the
    // browser updating the hash after the link is activated.
    window.location.hash = '#/student/practice';

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'სავარჯიშოები და ამოცანები' }),
      ).toBeTruthy();
    });
    expect(screen.queryByRole('navigation', { name: 'მოსწავლის სექციები' })).toBeNull();
  });

  it('keeps the student area behind the session gate', () => {
    render(<StudentApp />);

    fireEvent.click(screen.getByRole('button', { name: 'მოსწავლის ანგარიშიდან გასვლა' }));
    expect(screen.getByRole('button', { name: 'შესვლა დემო მოსწავლედ' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'შესვლა დემო მოსწავლედ' }));
    expect(screen.getByRole('heading', { level: 1, name: /გამარჯობა, ნინო/ })).toBeTruthy();
  });
});

describe('student pages', () => {
  it('marks homework complete', () => {
    window.location.hash = '#/student/homework';
    render(<StudentApp />);

    const checkbox = screen.getByRole('checkbox', {
      name: /წილადების ამოცანები/,
    }) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it('answers the practice question', () => {
    window.location.hash = '#/student/practice';
    render(<StudentApp />);

    fireEvent.click(screen.getByRole('button', { name: '1' }));
    expect(screen.getByText(/სწორია/)).toBeTruthy();
  });
});


describe('public landing page', () => {
  it('keeps its conventional navigation and links to the student area', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: /მათემატიკა, რომელიც/ }),
    ).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'მთავარი ნავიგაცია' })).toBeTruthy();

    const studentLinks = screen.getAllByRole('link', { name: 'მოსწავლის შესვლა' });
    expect(studentLinks.length).toBeGreaterThan(0);
    for (const link of studentLinks) {
      expect(link.getAttribute('href')).toBe('#/student');
    }
  });
});
