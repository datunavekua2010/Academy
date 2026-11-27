import { useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';

/**
 * Minimal hash router.
 *
 * Hash routing keeps deep links compatible with static hosts.
 * Hash URLs work without server-side route handling and
 * keep the existing landing-page anchors (#approach, #faq, ...) working.
 */

export function currentPath(): string {
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) return '/';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

/** Preview URLs are distinct from authenticated routes, including on reload. */
export function isLocalPreviewPath(path: string): boolean {
  return /^\/preview\/(student|teacher)(\/|$)/.test(path);
}

export function useRawHashRoute(): string {
  const [path, setPath] = useState<string>(() => currentPath());
  useEffect(() => {
    const onChange = () => setPath(currentPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}

/** Existing student/teacher pages share their routing logic with local previews. */
export function useHashRoute(): string {
  const path = useRawHashRoute();
  return isLocalPreviewPath(path) ? path.slice('/preview'.length) : path;
}

function routeTarget(to: string): string {
  const next = to.startsWith('/') ? to : `/${to}`;
  return isLocalPreviewPath(currentPath()) && /^\/(student|teacher)(\/|$)/.test(next) ? `/preview${next}` : next;
}

export function navigate(to: string): void {
  const next = routeTarget(to);
  if (currentPath() === next) return;
  window.location.hash = next;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  children: ReactNode;
};

/** Internal link that keeps hash routing and normal anchor semantics. */
export function Link({ to, children, ...rest }: LinkProps) {
  return (
    <a href={`#${routeTarget(to)}`} {...rest}>
      {children}
    </a>
  );
}

export function isStudentPath(path: string): boolean {
  return path === '/student' || path.startsWith('/student/');
}
