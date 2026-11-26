import { lazy, Suspense, useEffect } from 'react';
import { TEST_ACCOUNT_MODE } from './student/accountMode';
import { isStudentPath, useHashRoute } from './router';
import { PreviewChoice } from './preview/PreviewChoice';
import { TEMPORARY_PUBLIC_BROWSING } from './preview/browseMode';
import './preview/base.css';
import { LoadingScreen } from './components/LoadingScreen';

const Shell = lazy(() => import('./Shell').then(module => ({ default: module.Shell })));
const Landing = lazy(() => import('./LandingEntry'));

/** Keep the public preview and marketing page independent of the heavier app. */
export function Entry() {
  const path = useHashRoute();
  const preview = ((TEST_ACCOUNT_MODE || TEMPORARY_PUBLIC_BROWSING) && path === '/') || path === '/spaces';
  const app = isStudentPath(path) || /^\/(teacher|parent|admin|account)(\/|$)/.test(path);
  useEffect(() => {
    if (!app) document.title = 'Axiom Academy — მათემატიკა და ლოგიკა';
  }, [app]);
  if (preview) return <PreviewChoice hideSignIn={TEMPORARY_PUBLIC_BROWSING} />;
  return <Suspense fallback={<LoadingScreen />}>
    {app ? <Shell /> : <Landing />}
  </Suspense>;
}
