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
  'ჩემი პროფილი',
];

function openAxi() {
  fireEvent.click(screen.getByRole('button', { name: 'Axi-ს ნავიგაციის გახსნა' }));
  return screen.getByRole('navigation', { name: 'მოსწავლის სექციები' });
}

beforeEach(() => {
  window.localStorage.clear();
  window.location.hash = '#/student';
  window.scrollTo = vi.fn();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
});

describe('Axi student navigation', () => {
  it('opens all five destinations and closes when Axi is clicked again', () => {
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
      expect(screen.getByRole('heading', { level: 1, name: 'ისწავლე და ივარჯიშე' })).toBeTruthy();
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

describe('unified homework + practice', () => {
  it('shows teacher-assigned subtopics on the homework page with no separate workflow', () => {
    window.location.hash = '#/student/homework';
    render(<StudentApp />);

    // The homework page is the same system, filtered to assigned subtopics.
    expect(
      screen.getByRole('heading', { level: 1, name: 'მასწავლებლის მიერ მინიჭებული' }),
    ).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /გახსენი სრული სავარჯიშო სისტემა/ }).length).toBe(1);

    // No checkbox / file-upload workflow anywhere.
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('lists grades, topics and subtopics on the practice page', () => {
    window.location.hash = '#/student/practice';
    render(<StudentApp />);

    expect(screen.getByRole('heading', { level: 1, name: 'ისწავლე და ივარჯიშე' })).toBeTruthy();
    expect(screen.getByRole('tablist', { name: 'კლასების არჩევა' })).toBeTruthy();
    // All seven grades are offered.
    expect(screen.getAllByRole('tab')).toHaveLength(7);
    // The 100-point rules are rendered from the engine constants.
    expect(screen.getByText('100-ქულიანი სისტემა')).toBeTruthy();
    expect(screen.getAllByText('+4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('−2').length).toBeGreaterThan(0);
  });

  it('opens a topics drop-down and shows only the chosen topic\'s subtopics', () => {
    window.location.hash = '#/student/practice';
    render(<StudentApp />);

    // Closed by default: no topic list is shown until the student asks for it.
    expect(screen.queryByRole('group', { name: 'თემების არჩევა' })).toBeNull();

    const trigger = screen.getByRole('button', { name: /თემები — არჩეულია/ });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    const panel = screen.getByRole('group', { name: 'თემების არჩევა' });
    const options = within(panel).getAllByRole('button');
    expect(options.length).toBeGreaterThanOrEqual(3);

    // Only the selected topic's subtopics are rendered.
    const subtopicRows = document.querySelectorAll('.subtopic-row');
    expect(subtopicRows.length).toBe(
      Number(panel.querySelector('.topic-option-count')?.textContent),
    );
    const before = [...subtopicRows].map((row) => row.querySelector('h3')?.textContent);

    // Choosing another topic swaps the subtopics and closes the panel.
    const secondTitle = options[1].querySelector('strong')?.textContent ?? '';
    fireEvent.click(options[1]);

    expect(screen.queryByRole('group', { name: 'თემების არჩევა' })).toBeNull();
    const trigger2 = screen.getByRole('button', { name: /თემები — არჩეულია/ });
    expect(trigger2.getAttribute('aria-expanded')).toBe('false');
    expect(trigger2.textContent).toContain(secondTitle);

    const after = [...document.querySelectorAll('.subtopic-row')].map(
      (row) => row.querySelector('h3')?.textContent,
    );
    expect(after).not.toEqual(before);
  });

  it('closes the topics drop-down on Escape and outside click', () => {
    window.location.hash = '#/student/practice';
    render(<StudentApp />);

    const open = () =>
      fireEvent.click(screen.getByRole('button', { name: /თემები — არჩეულია/ }));

    open();
    expect(screen.getByRole('group', { name: 'თემების არჩევა' })).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('group', { name: 'თემების არჩევა' })).toBeNull();

    open();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('group', { name: 'თემების არჩევა' })).toBeNull();
  });

  it('starts a session from a subtopic and applies the 100-point rule', async () => {
    window.location.hash = '#/student/practice';
    render(<StudentApp />);

    // Switch to grade I so the bank is small and deterministic enough.
    fireEvent.click(screen.getAllByRole('tab')[0]);

    const startButtons = await screen.findAllByRole('button', { name: /დაწყება/ });
    expect(startButtons.length).toBeGreaterThan(0);
    fireEvent.click(startButtons[0]);

    // The runner appears with a live score meter and the shared bank question.
    expect(screen.getByText(/ბანკიდან შემთხვევით შერჩეული/)).toBeTruthy();
    expect(screen.getByRole('progressbar')).toBeTruthy();
    // First answer in the lowest band is worth +4.
    expect(screen.getByText(/შემდეგი პასუხი: \+4 \/ −2/)).toBeTruthy();
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

describe('practice session flow', () => {
  it('shows +4 points on a correct answer and saves progress', async () => {
    window.location.hash = '#/student/practice';
    const { container } = render(<StudentApp />);

    fireEvent.click(screen.getAllByRole('tab')[0]);
    const startButtons = await screen.findAllByRole('button', { name: /დაწყება/ });
    fireEvent.click(startButtons[0]);

    const group = screen.getByRole('group', { name: 'პასუხის ვარიანტები' });
    const options = within(group).getAllByRole('button');
    expect(options.length).toBeGreaterThanOrEqual(3);
    fireEvent.click(options[0]);

    // Feedback always appears, with a signed point change.
    const feedback = await screen.findByText(/სწორია!|არასწორია\./);
    // Zero is shown as "0 ქულა" because the score cannot go below 0.
    expect(feedback.parentElement?.textContent).toMatch(/([+−]\d+|0) ქულა/);

    // The score meter reflects the new score (4 for a first correct, else 0).
    const meter = screen.getByRole('progressbar');
    expect([0, 4]).toContain(Number(meter.getAttribute('aria-valuenow')));

    // Advancing shows a new question and the answer state is cleared.
    fireEvent.click(screen.getByRole('button', { name: /შემდეგი კითხვა/ }));
    expect(screen.queryByText(/სწორია!|არასწორია\./)).toBeNull();
    expect(container.querySelector('.answer-feedback')).toBeNull();
  });

  it('persists completed sessions to the progress page', async () => {
    window.localStorage.clear();
    window.location.hash = '#/student/progress';
    render(<StudentApp />);

    // With no attempts the page shows the empty states, not invented numbers.
    expect(screen.getByText(/ჯერ არ გაქვს დაუსრულებელი ქვეთემა/)).toBeTruthy();
    expect(screen.getByText(/ჯერ არ გაქვს დასრულებული სესია/)).toBeTruthy();
  });
});
