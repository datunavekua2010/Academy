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

export function useHashRoute(): string {
  const [path, setPath] = useState<string>(() => currentPath());

  useEffect(() => {
    const onChange = () => setPath(currentPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}

export function navigate(to: string): void {
  const next = to.startsWith('/') ? to : `/${to}`;
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
    <a href={`#${to.startsWith('/') ? to : `/${to}`}`} {...rest}>
      {children}
    </a>
  );
}

export function isStudentPath(path: string): boolean {
  return path === '/student' || path.startsWith('/student/');
}
