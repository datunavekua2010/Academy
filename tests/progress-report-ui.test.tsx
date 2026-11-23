// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ProgressReports } from '../src/teacher/ProgressReports';
import { getGrade } from '../src/practice/curriculum';
import * as reportData from '../src/teacher/reportData';
import type { SupabaseClient } from '@supabase/supabase-js';

const topic = getGrade(1).topics[0];
const sub = topic.units[0].subtopics[0];
const writeText = vi.fn();
const students = [{ id: 'test-student', name: 'სატესტო მოსწავლე', grade: 1 }];
beforeEach(() => {
  localStorage.clear(); writeText.mockReset(); writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
});
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); Reflect.deleteProperty(document, 'execCommand'); });
function makeReport(start = '2026-01-02', end = '2026-01-03') {
  fireEvent.change(screen.getByLabelText('მოსწავლე'), { target: { value: 'test-student' } });
  fireEvent.change(screen.getByLabelText('დაწყების თარიღი'), { target: { value: start } });
  fireEvent.change(screen.getByLabelText('დასრულების თარიღი'), { target: { value: end } });
  fireEvent.click(screen.getByRole('button', { name: 'ანგარიშის შექმნა' }));
}
function setAttempts() {
  localStorage.setItem('axiom-academy.test.practice.v1', JSON.stringify({ version: 1, attempts: [{ id: 'one', ref: { grade: 1, topicId: topic.id, subtopicId: sub.id }, answers: [
    { questionId: 'q1', correct: true, choice: '3', at: '2026-01-02T13:00:00Z' },
    { questionId: 'q2', correct: false, choice: '3', at: '2026-01-02T13:01:00Z' },
  ] }] }));
}
describe('progress report editor and sharing', () => {
  it('shows accurate saved-data statistics and copies and shares the current edited message', async () => {
    setAttempts(); render(<ProgressReports students={students} client={null} teacherId={null} test />);
    makeReport();
    const preview = await screen.findByRole('region', { name: 'ანგარიშის გადახედვა' });
    expect(within(preview).getByText('50.0%')).toBeTruthy();
    expect(within(preview).getByText(/2 პასუხი · სწორი 1 · არასწორი 1/)).toBeTruthy();
    const editor = within(preview).getByLabelText('გასაზიარებელი ტექსტი') as HTMLTextAreaElement;
    expect(editor.value).toContain('ადგილობრივი პროგრესის ანგარიში');
    expect(editor.value).toContain('სწორი: 1; არასწორი: 1');
    const edited = 'დამუშავებული ტექსტი & # ტესტი';
    fireEvent.change(editor, { target: { value: edited } });
    expect(within(preview).getByText('50.0%')).toBeTruthy();
    const copyButton = within(preview).getByRole('button', { name: 'ტექსტის კოპირება' });
    expect(copyButton.closest('.teacher-message-field')?.contains(editor)).toBe(true);
    expect(copyButton.textContent).toBe('');
    fireEvent.change(editor, { target: { value: '  ' } });
    expect((copyButton as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(editor, { target: { value: edited } });
    fireEvent.click(copyButton);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(edited));
    expect(within(preview).getByText(/ტექსტი დაკოპირდა/)).toBeTruthy();
    const whatsapp = within(preview).getByRole('link', { name: 'WhatsApp' }) as HTMLAnchorElement;
    const viber = within(preview).getByRole('link', { name: 'Viber' }) as HTMLAnchorElement;
    expect(whatsapp.getAttribute('href')).toBe(`https://wa.me/?text=${encodeURIComponent(edited)}`);
    expect(viber.getAttribute('href')).toBe(`viber://forward?text=${encodeURIComponent(edited)}`);
    whatsapp.addEventListener('click', (event) => event.preventDefault(), { once: true });
    fireEvent.click(whatsapp);
    expect(within(preview).getByText(/თუ WhatsApp არ გაიხსნა/)).toBeTruthy();
    viber.addEventListener('click', (event) => event.preventDefault(), { once: true });
    fireEvent.click(viber);
    expect(within(preview).getByText(/თუ Viber არ გაიხსნა/)).toBeTruthy();
  });
  it('copies the selected edited message when the Clipboard API is blocked', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    const execCommand = vi.fn((command: string) => {
      const field = screen.getByLabelText('გასაზიარებელი ტექსტი') as HTMLTextAreaElement;
      expect(field.value.slice(field.selectionStart, field.selectionEnd)).toBe('ახლა შეცვლილი ტექსტი');
      return command === 'copy';
    });
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand });
    render(<ProgressReports students={students} client={null} teacherId={null} test />);
    makeReport();
    const editor = await screen.findByLabelText('გასაზიარებელი ტექსტი') as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: 'ახლა შეცვლილი ტექსტი' } });
    const button = screen.getByRole('button', { name: 'ტექსტის კოპირება' });
    button.focus();
    fireEvent.click(button);
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(screen.getByText(/ტექსტი დაკოპირდა/)).toBeTruthy();
    expect(document.activeElement).toBe(button);
  });
  it('uses the Clipboard API if the selection-based method fails', async () => {
    Object.defineProperty(document, 'execCommand', { configurable: true, value: () => { throw new Error('blocked'); } });
    render(<ProgressReports students={students} client={null} teacherId={null} test />);
    makeReport();
    const editor = await screen.findByLabelText('გასაზიარებელი ტექსტი') as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: 'უახლესი ტექსტი' } });
    fireEvent.click(screen.getByRole('button', { name: 'ტექსტის კოპირება' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('უახლესი ტექსტი'));
    expect(screen.getByText(/ტექსტი დაკოპირდა/)).toBeTruthy();
  });
  it('selects the whole message for manual copying if neither method works', async () => {
    Object.defineProperty(document, 'execCommand', { configurable: true, value: () => false });
    writeText.mockRejectedValue(new Error('denied'));
    render(<ProgressReports students={students} client={null} teacherId={null} test />);
    makeReport();
    const editor = await screen.findByLabelText('გასაზიარებელი ტექსტი') as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: 'მონიშნე ეს ტექსტი' } });
    fireEvent.click(screen.getByRole('button', { name: 'ტექსტის კოპირება' }));
    expect(await screen.findByText(/კოპირება ვერ მოხერხდა/)).toBeTruthy();
    expect(editor.selectionStart).toBe(0);
    expect(editor.selectionEnd).toBe(editor.value.length);
    expect(document.activeElement).toBe(editor);
    expect(screen.getByText(/Ctrl\+C/)).toBeTruthy();
  });
  it('prints only the selected report including edits and resets print mode after printing', async () => {
    setAttempts();
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<ProgressReports students={students} client={null} teacherId={null} test />);
    makeReport();
    const preview = await screen.findByRole('region', { name: 'ანგარიშის გადახედვა' });
    fireEvent.change(within(preview).getByLabelText('გასაზიარებელი ტექსტი'), { target: { value: 'შეცვლილი ტექსტი' } });
    const documentCard = document.body.querySelector('.teacher-print-document')!;
    expect(documentCard.textContent).toContain('შეცვლილი ტექსტი');
    expect(documentCard.textContent).toContain('50.0%');
    expect(documentCard.textContent).toContain('სერვერის მიერ არ არის დადასტურებული');
    fireEvent.click(within(preview).getByRole('button', { name: 'ბეჭდვა / PDF-ად შენახვა' }));
    expect(print).toHaveBeenCalledOnce();
    expect(document.body.classList.contains('axiom-report-printing')).toBe(true);
    fireEvent(window, new Event('afterprint'));
    expect(document.body.classList.contains('axiom-report-printing')).toBe(false);
  });
  it('reports print failures without losing the edited message', async () => {
    vi.spyOn(window, 'print').mockImplementation(() => { throw new Error('blocked'); });
    render(<ProgressReports students={students} client={null} teacherId={null} test />);
    makeReport();
    const preview = await screen.findByRole('region', { name: 'ანგარიშის გადახედვა' });
    fireEvent.click(within(preview).getByRole('button', { name: 'ბეჭდვა / PDF-ად შენახვა' }));
    expect(within(preview).getByText(/ბეჭდვის ფანჯარა ვერ გაიხსნა/)).toBeTruthy();
    expect(document.body.classList.contains('axiom-report-printing')).toBe(false);
    expect((within(preview).getByLabelText('გასაზიარებელი ტექსტი') as HTMLTextAreaElement).value).not.toBe('');
  });
  it('handles empty data, clipboard failure and clears the old report when the period changes', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    render(<ProgressReports students={students} client={null} teacherId={null} test />);
    makeReport();
    const preview = await screen.findByRole('region', { name: 'ანგარიშის გადახედვა' });
    expect(within(preview).getAllByText(/დასათვლელი შენახული პასუხები არ მოიძებნა/).length).toBeGreaterThan(0);
    expect(within(preview).getByText('მონაცემები არასაკმარისია')).toBeTruthy();
    fireEvent.click(within(preview).getByRole('button', { name: 'ტექსტის კოპირება' }));
    expect(await within(preview).findByText(/კოპირება ვერ მოხერხდა/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('დაწყების თარიღი'), { target: { value: '2026-01-04' } });
    expect(screen.queryByRole('region', { name: 'ანგარიშის გადახედვა' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'ანგარიშის შექმნა' }));
    expect(screen.getByRole('alert').textContent).toContain('სწორი პერიოდი');
  });
  it('discards an in-flight result when the selected period changes', async () => {
    let resolve!: (value: Awaited<ReturnType<typeof reportData.loadReportRows>>) => void;
    vi.spyOn(reportData, 'loadReportRows').mockReturnValue(new Promise((done) => { resolve = done; }));
    render(<ProgressReports students={students} client={{} as SupabaseClient} teacherId="tutor" test={false} />);
    makeReport();
    expect(screen.getByText('აქტივობა იტვირთება…')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('დაწყების თარიღი'), { target: { value: '2026-01-03' } });
    resolve([]);
    await waitFor(() => expect(screen.queryByText('აქტივობა იტვირთება…')).toBeNull());
    expect(screen.queryByRole('region', { name: 'ანგარიშის გადახედვა' })).toBeNull();
  });
  it('distinguishes broken local storage from an empty period', async () => {
    localStorage.setItem('axiom-academy.test.practice.v1', '{');
    render(<ProgressReports students={students} client={null} teacherId={null} test />);
    makeReport();
    expect((await screen.findByRole('alert')).textContent).toContain('ვერ ჩაიტვირთა');
    expect(screen.queryByRole('region', { name: 'ანგარიშის გადახედვა' })).toBeNull();
  });
});
