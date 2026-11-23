// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Shell } from '../src/Shell';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { getTopic } from '../src/practice/curriculum';
import { drawTemplate } from '../src/teacher/testMakerData';
import type { GeneratedQuestion } from '../src/practice/generator';

beforeEach(() => { localStorage.clear(); window.location.hash = '#/teacher/interventions'; window.scrollTo = vi.fn(); });
afterEach(() => { cleanup(); localStorage.clear(); window.location.hash = ''; });
it('shows the real exercise editor in the support tab without exposing fake save or storing a draft', async () => {
  let question: GeneratedQuestion | undefined;
  for (const template of TEMPLATE_REGISTRY.all) { try { question=drawTemplate(template.id,1); break; } catch { /* unsupported */ } }
  if (!question) throw new Error('No compatible real exercise');
  const topic=getTopic(question.grade,question.topicId)!;
  const unit=topic.units.find((item)=>item.subtopics.some((sub)=>sub.id===question!.subtopicId))!;
  const { unmount } = render(<Shell />);
  const editor = screen.getByRole('heading',{name:'ტესტის შემქმნელი'}).closest('section')!;
  expect(within(editor).getByText(/ტესტი არ ინახება/)).toBeTruthy();
  expect(within(editor).queryByRole('button',{name:'შენახვა'})).toBeNull();
  expect(within(editor).queryByRole('button',{name:'შენახული ტესტები'})).toBeNull();
  expect(screen.getByRole('heading',{name:'კლასების მართვა'})).toBeTruthy();
  fireEvent.click(within(editor).getByRole('button',{name:'დავალებების ბანკი'}));
  fireEvent.change(within(editor).getByLabelText('კლასი'),{target:{value:String(question.grade)}});
  fireEvent.change(within(editor).getByLabelText('თემა'),{target:{value:question.topicId}});
  fireEvent.change(within(editor).getByLabelText('თავი'),{target:{value:unit.id}});
  fireEvent.change(within(editor).getByLabelText('ქვეთემა'),{target:{value:question.subtopicId}});
  const item=within(editor).getByText(question.prompt).closest('li')!;
  fireEvent.click(within(item).getByRole('button',{name:'დამატება'}));
  expect(within(editor).getByText(/1 დავალება · 1 ქულა/)).toBeTruthy();
  fireEvent.click(within(editor).getByRole('button',{name:'პარამეტრები და დალაგება'}));
  expect(within(editor).getByRole('button',{name:'PDF-ების შექმნა'}).hasAttribute('disabled')).toBe(false);
  expect(JSON.stringify(localStorage)).not.toContain(question.prompt);
  unmount(); render(<Shell />);
  const fresh=screen.getByRole('heading',{name:'ტესტის შემქმნელი'}).closest('section')!;
  expect(within(fresh).getByText(/0 დავალება · 0 ქულა/)).toBeTruthy();
});
