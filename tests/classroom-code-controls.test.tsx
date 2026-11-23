// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StudentCodeControls, TeacherCodeControls } from '../src/classrooms/ClassroomCodeControls';
afterEach(() => cleanup());
it('does not pretend to create or join codes when the backend is not ready', () => {
  render(<><TeacherCodeControls classroomId="room" revision={1} service={null} /><StudentCodeControls service={null} /></>);
  expect(screen.getByRole('button',{name:'კოდის შექმნა'}).matches(':disabled')).toBe(true);
  expect(screen.getByRole('button',{name:'კლასში შესვლა'}).matches(':disabled')).toBe(true);
  expect(screen.queryByText('კლასს შეუერთდი.')).toBeNull();
});
it('passes tutor expiry and capacity only to the connected service, and handles creation and revocation', async () => {
  const service={status:vi.fn(async()=>({capacity:15,activeStudents:2,needsReview:false,expiresAt:null})),create:vi.fn(async()=>({code:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'})), revoke:vi.fn(async()=>{})};
  render(<TeacherCodeControls classroomId="class-id" revision={4} service={service} />);
  expect(await screen.findByText(/მოსწავლეები: 2/)).toBeTruthy();
  fireEvent.change(screen.getByLabelText('კოდის მოქმედების ბოლო თარიღი'),{target:{value:'2027-01-01'}});
  fireEvent.change(screen.getByLabelText('მოსწავლეების მაქსიმალური რაოდენობა'),{target:{value:'15'}});
  fireEvent.click(screen.getByRole('button',{name:'კოდის შექმნა'}));
  expect(await screen.findByText('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBeTruthy();
  expect(service.create).toHaveBeenCalledWith({classroomId:'class-id',revision:4,expiresOn:'2027-01-01',capacity:15});
  fireEvent.click(screen.getByRole('button',{name:'კოდის კოპირება'}));
  expect(await screen.findByText('მონიშნეთ კოდი და დააკოპირეთ ხელით.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'კოდის გაუქმება'}));
  expect(await screen.findByText('კოდი გაუქმებულია.')).toBeTruthy(); expect(screen.queryByText('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBeNull();
});
it('joins only after real service confirmation, normalizes code, and fails closed on errors', async () => {
  const join=vi.fn(async()=>{}); render(<StudentCodeControls service={{join}} />);
  fireEvent.change(screen.getByLabelText('კლასის კოდი'),{target:{value:'abcde-fghij-klmno-pqrst-uvwxyz'}});
  fireEvent.click(screen.getByRole('button',{name:'კლასში შესვლა'}));
  await waitFor(()=>expect(join).toHaveBeenCalledWith('ABCDEFGHIJKLMNOPQRSTUVWXYZ'));
  expect(await screen.findByText('კლასს შეუერთდი.')).toBeTruthy();
  join.mockRejectedValueOnce(new Error('denied'));
  fireEvent.change(screen.getByLabelText('კლასის კოდი'),{target:{value:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'}});
  fireEvent.click(screen.getByRole('button',{name:'კლასში შესვლა'}));
  expect(await screen.findByRole('alert')).toBeTruthy(); expect(screen.queryByText('კლასს შეუერთდი.')).toBeNull();
});
