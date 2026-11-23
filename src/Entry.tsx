import { lazy, Suspense, useEffect } from 'react';
import { TEST_ACCOUNT_MODE } from './student/accountMode';
import { isStudentPath, useHashRoute } from './router';
import { PreviewChoice } from './preview/PreviewChoice';
import './preview/base.css';

const Shell = lazy(() => import('./Shell').then(module => ({ default: module.Shell })));
const Landing = lazy(() => import('./LandingEntry'));

/** Keep the public preview and marketing page independent of the heavier app. */
export function Entry() {
  const path = useHashRoute();
  const preview = TEST_ACCOUNT_MODE && path === '/';
  const app = isStudentPath(path) || /^\/(teacher|parent|admin|account)(\/|$)/.test(path);
  useEffect(() => {
    if (!app) document.title = 'Axiom Academy — მათემატიკა და ლოგიკა';
  }, [app]);
  if (preview) return <PreviewChoice />;
  return <Suspense fallback={<main role="status" className="entry-loading">იტვირთება…</main>}>
    {app ? <Shell /> : <Landing />}
  </Suspense>;
}
