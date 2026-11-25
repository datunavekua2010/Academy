// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
const state=vi.hoisted(()=>({student:{id:'student-a',grade:'',name:'Student'},mode:'connected',status:'ready',signedIn:true}));
vi.mock('../src/student/session',()=>({useStudentSession:()=>state,StudentSessionProvider:({children}:{children:React.ReactNode})=>children}));
vi.mock('../src/practice/PracticeProvider',()=>({PracticeProvider:({children,initialGrade}:{children:React.ReactNode;initialGrade:number})=><div>grade:{initialGrade}{children}</div>,usePractice:()=>({})}));
import { RequireStudent } from '../src/student/StudentApp';
afterEach(()=>{cleanup();state.student={id:'student-a',grade:'',name:'Student'};});
it('asks the student for a learning level instead of inventing an actual grade',()=>{
 const view=render(<RequireStudent publicPreview={false}><p>workspace</p></RequireStudent>);
 expect(screen.getByRole('heading',{name:'აირჩიე სასწავლო კლასი'})).toBeTruthy();expect(screen.queryByText('workspace')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'3 კლასი'}));expect(screen.getByText('grade:3')).toBeTruthy();expect(screen.getByText('workspace')).toBeTruthy();
 state.student={id:'student-b',grade:'',name:'Student'};view.rerender(<RequireStudent publicPreview={false}><p>workspace</p></RequireStudent>);
 expect(screen.getByRole('heading',{name:'აირჩიე სასწავლო კლასი'})).toBeTruthy();
});
it('uses an already assigned student grade without prompting',()=>{
 state.student.grade='4 კლასი';render(<RequireStudent publicPreview={false}><p>workspace</p></RequireStudent>);
 expect(screen.getByText('grade:4')).toBeTruthy();expect(screen.queryByRole('heading',{name:'აირჩიე სასწავლო კლასი'})).toBeNull();
});
