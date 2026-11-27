import { lazy, Suspense, useEffect } from 'react';
import { isLocalPreviewPath, isStudentPath, useRawHashRoute } from './router';
import { PreviewChoice } from './preview/PreviewChoice';
import './preview/base.css';
import { LoadingScreen } from './components/LoadingScreen';

const Shell = lazy(() => import('./Shell').then(module => ({ default: module.Shell })));
const Landing = lazy(() => import('./LandingEntry'));

/** Keep the public preview and marketing page independent of the heavier app. */
export function Entry() {
  const path = useRawHashRoute();
  const preview = path === '/' || path === '/spaces';
  const app = isLocalPreviewPath(path) || isStudentPath(path) || /^\/(teacher|parent|admin|account)(\/|$)/.test(path);
  useEffect(() => {
    if (!app) document.title = 'Axiom Academy — მათემატიკა და ლოგიკა';
  }, [app]);
  if (preview) return <PreviewChoice />;
  return <Suspense fallback={<LoadingScreen />}>
    {app ? <Shell /> : <Landing />}
  </Suspense>;
}
