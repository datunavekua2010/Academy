// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { TestMaker } from '../src/teacher/TestMaker';
import { createTestPdf } from '../src/teacher/testMakerPdf';

vi.mock('../src/teacher/testMakerPdf', () => ({ createTestPdf: vi.fn(async () => new Uint8Array([37,80,68,70])) }));
const createUrl = vi.fn();
const revokeUrl = vi.fn();
beforeEach(() => { createUrl.mockReset().mockReturnValueOnce('blob:student').mockReturnValueOnce('blob:key'); revokeUrl.mockReset(); vi.stubGlobal('URL', Object.assign(class extends URL {}, {createObjectURL:createUrl, revokeObjectURL:revokeUrl})); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

it('prepares two direct downloads after the generated test and invalidates them on edits', async () => {
  render(<TestMaker client={null} teacherId={null} />);
  fireEvent.click(screen.getByRole('button',{name:'+ სავარჯიშოს ტიპის დამატება'}));
  const section=screen.getByRole('group',{name:'სავარჯიშოს ტიპი 1'});
  for (const [label,value] of [['კლასი','3'],['თემა','g3-gamravleba'],['თავი','g3-gamravleba'],['ქვეთემა','u04-full-table'],['სავარჯიშოს შაბლონი','g2-times-table']]) fireEvent.change(within(section).getByLabelText(label),{target:{value}});
  fireEvent.click(screen.getByRole('button',{name:'ტესტის შექმნა'}));
  await screen.findByText('შეიქმნა 1 განსხვავებული დავალება.');
  const button=screen.getByRole('button',{name:'PDF-ების შექმნა'});
  const question=screen.getByRole('button',{name:'ამოღება'});
  expect(question.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(document.querySelector('iframe')).toBeNull();
  fireEvent.click(button);
  const student=await screen.findByRole('link',{name:'მოსწავლის PDF ჩამოტვირთვა'});
  const key=screen.getByRole('link',{name:'პასუხების PDF ჩამოტვირთვა'});
  expect(student.getAttribute('href')).toBe('blob:student'); expect(student.getAttribute('download')).toBe('axiom-test.pdf');
  expect(key.getAttribute('href')).toBe('blob:key'); expect(key.getAttribute('download')).toBe('axiom-answer-key.pdf');
  expect(vi.mocked(createTestPdf).mock.calls.map(([,answerKey])=>answerKey)).toEqual([false,true]);
  fireEvent.change(screen.getByLabelText('ქულა'),{target:{value:'2'}});
  expect(screen.queryByRole('link',{name:'მოსწავლის PDF ჩამოტვირთვა'})).toBeNull();
  expect(revokeUrl.mock.calls.map(([url])=>url)).toEqual(['blob:student','blob:key']);
});
