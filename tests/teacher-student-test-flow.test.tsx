// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Shell } from '../src/Shell';
import { getGrade } from '../src/practice/curriculum';
import { generateBatch, hasTemplates } from '../src/practice/generator';
import { createTestAssignment, createTestAssignments, readTestAssignments } from '../src/teacher/testAssignments';
import { startSession } from '../src/practice/session';
import type { SubtopicRef } from '../src/practice/types';
import { assignmentStatus, progressForAssignment, recordAttempt, saveDraft, type Attempt } from '../src/practice/store';

beforeEach(() => { localStorage.clear(); window.location.hash = '#/teacher/assignments'; window.scrollTo = vi.fn(); });
afterEach(() => { cleanup(); localStorage.clear(); window.location.hash = ''; });
function go(path: string) { window.location.hash = path; fireEvent(window, new HashChangeEvent('hashchange')); }
// The real generator is randomized and also includes interactive question types;
// choose a deterministic seed yielding a standard input for these flow tests.
function startAnswerable(ref: SubtopicRef, button: HTMLElement) {
  const seed = Array.from({ length: 500 }, (_, i) => i).find((n) => {
    const q = generateBatch(ref, 8, { level: 1, seed: n })[0];
    return q && (!q.answerMode || q.answerMode === 'choice' || q.answerMode === 'number');
  });
  expect(seed).toBeDefined();
  const random = vi.spyOn(Math, 'random').mockReturnValue(seed! / 2 ** 31);
  try { fireEvent.click(button); } finally { random.mockRestore(); }
}
it('creates local homework, opens the real practice runner, and shows the linked result to the test teacher', async () => {
  const grade = getGrade(1);
  const topic = grade.topics.find((t) => t.id === 'Sekreba')!;
  const unit = topic.units.find((u) => u.subtopics.some((s) => s.id === 'SuratiT-10'))!;
  expect(hasTemplates({ grade: 1, topicId: topic.id, subtopicId: 'SuratiT-10' })).toBe(true);
  render(<Shell />);
  fireEvent.change(screen.getByLabelText('დავალების სათაური'), { target: { value: 'სატესტო შეკრება' } });
  fireEvent.change(screen.getByLabelText('მითითება (არასავალდებულო)'), { target: { value: 'ივარჯიშე შეკრებაში' } });
  fireEvent.change(screen.getByLabelText('კლასი'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('თემა'), { target: { value: topic.id } });
  fireEvent.change(screen.getByLabelText('ნაწილი'), { target: { value: unit.id } });
  const subtopic = unit.subtopics.find((s) => s.id === 'SuratiT-10')!;
  fireEvent.click(within(screen.getByRole('group', { name: 'ქვეთემები' })).getByRole('checkbox', { name: subtopic.title }));
  fireEvent.change(screen.getByLabelText('ვადა'), { target: { value: '2099-12-31T12:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'ადგილობრივი დავალების დამატება' }));
  expect(await screen.findByText(/დავალება დაემატა/)).toBeTruthy();
  const id = readTestAssignments()[0].id;
  go('#/student/homework/grade/1');
  const title = await screen.findByText('სატესტო შეკრება');
  const assignment = title.closest('li')!;
  expect(within(assignment).getByText('ივარჯიშე შეკრებაში')).toBeTruthy();
  startAnswerable({ grade: 1, topicId: topic.id, subtopicId: subtopic.id }, within(assignment).getByRole('button', { name: /დაწყება/ }));
  await screen.findByRole('button', { name: /სესიიდან გასვლა/ });
  const numberInput = screen.queryByLabelText('ჩაწერე პასუხი');
  if (numberInput) {
    fireEvent.change(numberInput, { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'შემოწმება' }));
  } else {
    const options = screen.getByRole('group', { name: 'პასუხის ვარიანტები' });
    fireEvent.click(within(options).getAllByRole('button')[0]);
    const check = screen.queryByRole('button', { name: 'შემოწმება' });
    if (check) fireEvent.click(check);
  }
  fireEvent.click(screen.getByRole('button', { name: /სესიიდან გასვლა/ }));
  await waitFor(() => {
    const saved = JSON.parse(localStorage.getItem('axiom-academy.test.practice.v1')!);
    expect(saved.attempts).toHaveLength(1);
    expect(saved.attempts[0].assignmentId).toBe(id);
    expect(saved.attempts[0].answers).toHaveLength(1);
  });
  go('#/teacher/students/test-student');
  const result = await screen.findByText('სატესტო შეკრება');
  expect(result.closest('li')!.textContent).toContain('1 სესია');
  expect(result.closest('li')!.textContent).toContain('მიმდინარე');
  const reportButton = screen.getByRole('button', { name: /პროგრესის ანგარიშის შექმნა/ });
  expect(reportButton.classList.contains('teacher-button')).toBe(true);
  fireEvent.click(reportButton);
  expect((await screen.findByLabelText('მოსწავლე') as HTMLSelectElement).value).toBe('test-student');
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tbilisi', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  fireEvent.change(screen.getByLabelText('დაწყების თარიღი'), { target: { value: today } });
  fireEvent.change(screen.getByLabelText('დასრულების თარიღი'), { target: { value: today } });
  fireEvent.click(screen.getByRole('button', { name: 'ანგარიშის შექმნა' }));
  const message = await screen.findByLabelText('გასაზიარებელი ტექსტი') as HTMLTextAreaElement;
  expect(message.value).toContain('შენახული პასუხები: 1');
  expect(message.value).toContain('მონაცემები მხოლოდ ამ ბრაუზერშია');
  go('#/teacher/assignments');
  const row = (await screen.findByText('სატესტო შეკრება')).closest('li')!;
  fireEvent.click(within(row).getByRole('button', { name: 'გაუქმება' }));
  expect(readTestAssignments()[0].cancelled).toBe(true);
  expect(JSON.parse(localStorage.getItem('axiom-academy.test.practice.v1')!).attempts).toHaveLength(1);
  go('#/student/homework/grade/1');
  await waitFor(() => expect(screen.queryByText('სატესტო შეკრება')).toBeNull());
});

it('does not count a different assignment or free practice as this assignment’s completion', () => {
  const ref = { grade: 1 as const, topicId: 'Sekreba', subtopicId: 'SuratiT-10' };
  const base = { key: '1/Sekreba/SuratiT-10', ref, assignedAt: '2026-01-01T00:00:00Z', dueAt: '2099-01-01T00:00:00Z', assignedBy: 'test', tracking: 'assignment' as const };
  const a = { ...base, id: 'a' }, b = { ...base, id: 'b' };
  const result: Attempt = { id: 'one', assignmentId: 'a', key: base.key, ref, score: 100, correct: 35, incorrect: 0, startedAt: base.assignedAt, finishedAt: base.assignedAt, seconds: 60, completed: true, answers: [] };
  const attempts = recordAttempt(recordAttempt([], result), result);
  expect(attempts).toHaveLength(1);
  expect(assignmentStatus(progressForAssignment(attempts, a))).toBe('completed');
  expect(assignmentStatus(progressForAssignment(attempts, b))).toBe('not-started');
  expect(assignmentStatus(progressForAssignment([{ ...result, assignmentId: null }], a))).toBe('not-started');
});

it('restores an assignment draft and records a completed result against that assignment', async () => {
  const ref = { grade: 1 as const, topicId: 'Sekreba', subtopicId: 'SuratiT-10' };
  createTestAssignment({ title: 'ბოლო პასუხი', instructions: '', ...ref, dueAt: '2099-01-01T12:00' });
  const id = readTestAssignments()[0].id;
  const question = generateBatch(ref, 24, { seed: 7 }).find((q) => q.answerMode === 'number');
  expect(question).toBeTruthy();
  const session = { ...startSession(ref, [question!]), score: 99, correct: 34, assignmentId: id };
  saveDraft(session, localStorage, 'axiom-academy.test.practice.draft.v1');
  window.location.hash = '#/student/homework/grade/1';
  render(<Shell />);
  const input = await screen.findByLabelText('ჩაწერე პასუხი');
  fireEvent.change(input, { target: { value: question!.answer } });
  fireEvent.click(screen.getByRole('button', { name: 'შემოწმება' }));
  await waitFor(() => {
    const saved = JSON.parse(localStorage.getItem('axiom-academy.test.practice.v1')!);
    expect(saved.attempts[0]).toMatchObject({ assignmentId: id, score: 100, completed: true });
  });
  go('#/teacher/students/test-student');
  const result = await screen.findByText('ბოლო პასუხი');
  expect(result.closest('li')!.textContent).toContain('ადგილობრივად დასრულებული');
});

it('selects subtopics across units, removes a selection, and creates independently tracked homework together', async () => {
  const grade = getGrade(1);
  const choices = grade.topics.flatMap((topic) => topic.units.flatMap((unit) => unit.subtopics.filter((sub) => hasTemplates({ grade: 1, topicId: topic.id, subtopicId: sub.id })).map((sub) => ({ topic, unit, sub }))));
  const first = choices[0];
  const second = choices.find((choice) => choice.topic.id !== first.topic.id || choice.unit.id !== first.unit.id)!;
  expect(second).toBeTruthy();
  render(<Shell />);
  fireEvent.change(screen.getByLabelText('დავალების სათაური'), { target: { value: 'რამდენიმე სავარჯიშო' } });
  fireEvent.change(screen.getByLabelText('კლასი'), { target: { value: '1' } });
  const choose = (item: typeof first) => {
    fireEvent.change(screen.getByLabelText('თემა'), { target: { value: item.topic.id } });
    fireEvent.change(screen.getByLabelText('ნაწილი'), { target: { value: item.unit.id } });
    fireEvent.click(within(screen.getByRole('group', { name: 'ქვეთემები' })).getByRole('checkbox', { name: item.sub.title }));
  };
  choose(first);
  choose(second);
  expect(screen.getByText('არჩეული ქვეთემები: 2')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: `${first.topic.title} / ${first.sub.title} წაშლა` }));
  expect(screen.getByText('არჩეული ქვეთემები: 1')).toBeTruthy();
  choose(first);
  fireEvent.change(screen.getByLabelText('ვადა'), { target: { value: '2099-12-31T12:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'ადგილობრივი დავალების დამატება' }));
  expect(await screen.findByText(/დავალება დაემატა/)).toBeTruthy();
  const assignments = readTestAssignments();
  expect(assignments).toHaveLength(2);
  expect(new Set(assignments.map((a) => a.id)).size).toBe(2);
  expect(assignments.map((a) => a.ref.subtopicId)).toEqual([second.sub.id, first.sub.id]);
  expect(screen.getByText('არჩეული ქვეთემები: 0')).toBeTruthy();
  go('#/student/homework/grade/1');
  const cards = await screen.findAllByText('რამდენიმე სავარჯიშო');
  expect(cards).toHaveLength(2);
  const firstCard = cards.map((card) => card.closest('li')!).find((card) => card.textContent?.includes(first.sub.title))!;
  expect(firstCard).toBeTruthy();
  startAnswerable({ grade: 1, topicId: first.topic.id, subtopicId: first.sub.id }, within(firstCard).getByRole('button', { name: /დაწყება/ }));
  await screen.findByRole('button', { name: /სესიიდან გასვლა/ });
  const numberInput = screen.queryByLabelText('ჩაწერე პასუხი');
  if (numberInput) {
    fireEvent.change(numberInput, { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'შემოწმება' }));
  } else {
    const options = screen.getByRole('group', { name: 'პასუხის ვარიანტები' });
    fireEvent.click(within(options).getAllByRole('button')[0]);
    const check = screen.queryByRole('button', { name: 'შემოწმება' });
    if (check) fireEvent.click(check);
  }
  fireEvent.click(screen.getByRole('button', { name: /სესიიდან გასვლა/ }));
  await waitFor(() => {
    const attempts = JSON.parse(localStorage.getItem('axiom-academy.test.practice.v1')!).attempts;
    expect(attempts[0].assignmentId).toBe(assignments[1].id);
    expect(progressForAssignment(attempts, assignments[0]).attempts).toBe(0);
    expect(progressForAssignment(attempts, assignments[1]).attempts).toBe(1);
  });
  go('#/teacher/assignments');
  const rows = await screen.findAllByText('რამდენიმე სავარჯიშო');
  const row = rows.map((item) => item.closest('li')!).find((item) => item.textContent?.includes(first.sub.title))!;
  fireEvent.click(within(row).getByRole('button', { name: 'გაუქმება' }));
  expect(readTestAssignments().map((a) => a.cancelled)).toEqual([false, true]);
  go('#/student/homework/grade/1');
  await waitFor(() => expect(screen.getAllByText('რამდენიმე სავარჯიშო')).toHaveLength(1));
});

it('rejects empty, duplicate or invalid batches without saving any partial assignments', () => {
  const valid = { grade: 1 as const, topicId: 'Sekreba', subtopicId: 'SuratiT-10' };
  const details = { title: 'Test', instructions: '', dueAt: '2099-01-01T12:00' };
  for (const subtopics of [[], [valid, valid], [valid, { ...valid, subtopicId: 'missing' }]]) {
    expect(() => createTestAssignments({ ...details, subtopics })).toThrow();
    expect(readTestAssignments()).toEqual([]);
  }
});


it('allows multiple checkboxes in the same unit and keeps selections when changing grade', () => {
  const grade = getGrade(1);
  const group = grade.topics.flatMap((topic) => topic.units.map((unit) => ({ topic, unit, subs: unit.subtopics.filter((sub) => hasTemplates({ grade: 1, topicId: topic.id, subtopicId: sub.id })) }))).find(({ subs }) => subs.length >= 2 && subs[0].title !== subs[1].title)!;
  expect(group).toBeTruthy();
  render(<Shell />);
  fireEvent.change(screen.getByLabelText('კლასი'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('თემა'), { target: { value: group.topic.id } });
  fireEvent.change(screen.getByLabelText('ნაწილი'), { target: { value: group.unit.id } });
  for (const sub of group.subs.slice(0, 2)) fireEvent.click(within(screen.getByRole('group', { name: 'ქვეთემები' })).getByRole('checkbox', { name: sub.title }));
  expect(screen.getByText('არჩეული ქვეთემები: 2')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('კლასი'), { target: { value: '2' } });
  expect(screen.getByText('არჩეული ქვეთემები: 2')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('კლასი'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('თემა'), { target: { value: group.topic.id } });
  fireEvent.change(screen.getByLabelText('ნაწილი'), { target: { value: group.unit.id } });
  for (const sub of group.subs.slice(0, 2)) expect((within(screen.getByRole('group', { name: 'ქვეთემები' })).getByRole('checkbox', { name: sub.title }) as HTMLInputElement).checked).toBe(true);
});
