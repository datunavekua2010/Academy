import { useEffect, useRef } from 'react';
import './index.css';
import App from './App';
import { StudentApp } from './student/StudentApp';
import { TeacherApp } from './teacher/TeacherApp';
import { ParentApp } from './parent/ParentApp';
import { AdminApp } from './admin/AdminApp';
import { isLocalPreviewPath, isStudentPath, useRawHashRoute } from './router';
import { PreviewChoice } from './preview/PreviewChoice';
import { PasswordRecovery, type RecoveryResult } from './account/PasswordRecovery';
import { recoveryClient } from './lib/passwordRecovery';
import { SignupPage,SignupConfirmation,type SignupResult } from './account/Signup';
import { AccountStatus } from './account/AccountStatus';
import { LoginPreview } from './account/LoginPreview';

export function Shell({ recovery = null, signup = null }: { recovery?: Promise<RecoveryResult> | null; signup?: Promise<SignupResult> | null }) {
  const rawPath = useRawHashRoute();
  const localPreview = isLocalPreviewPath(rawPath);
  const path = localPreview ? rawPath.slice('/preview'.length) : rawPath;
  const studentArea = isStudentPath(path);
  const teacherArea = path === '/teacher' || path.startsWith('/teacher/');
  const parentArea = path === '/parent' || path.startsWith('/parent/');
  const adminArea = path === '/admin' || path.startsWith('/admin/');
  const previous = useRef(studentArea);
  useEffect(() => {
    if (previous.current !== studentArea) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      previous.current = studentArea;
    }
  }, [studentArea]);
  useEffect(() => {
    if (!studentArea && !teacherArea && !parentArea && !adminArea) document.title = 'Axiom Academy — მათემატიკა და ლოგიკა';
  }, [studentArea, teacherArea, parentArea, adminArea]);
  if (path === '/spaces') return <PreviewChoice />;
  if (path === '/account/login' || path === '/account/google') return <LoginPreview />;
  if (path === '/account/status') return <AccountStatus />;
  if (path === '/account/register') return <SignupPage />;
  if (path === '/account/confirmed') return <SignupConfirmation result={signup} />;
  if (path === '/account/recovery') return <PasswordRecovery client={recoveryClient} result={recovery} />;
  if (studentArea) return <StudentApp key={localPreview ? 'student-preview' : 'student-account'} previewOnly={localPreview} />;
  if (teacherArea) return <TeacherApp key={localPreview ? 'teacher-preview' : 'teacher-account'} previewOnly={localPreview} />;
  if (parentArea) return <ParentApp />;
  if (adminArea) return <AdminApp />;
  if (path === '/') return <PreviewChoice />;
  return <App />;
}
