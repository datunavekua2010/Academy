/** Lightweight parsers run before importing the Auth SDK or loading app views. */
type Callback = { code: string | null };
function consume(href: string, history: Pick<History, 'replaceState'>, marker: string, route: string, rejectError = false): Callback | null {
  const url = new URL(href);
  if (url.searchParams.get(marker) !== '1') return null;
  const codes = url.searchParams.getAll('code');
  const code = codes.length === 1 && codes[0].length > 0 && codes[0].length <= 2048 && !(rejectError && url.searchParams.has('error')) ? codes[0] : null;
  history.replaceState(null, '', `${url.pathname}#${route}`);
  return { code };
}
export const consumeGoogleCallback = (href: string, history: Pick<History, 'replaceState'>) => consume(href, history, 'google_auth', '/account/google', true);
export const consumeRecoveryCallback = (href: string, history: Pick<History, 'replaceState'>) => consume(href, history, 'recovery', '/account/recovery');
export const consumeSignupCallback = (href: string, history: Pick<History, 'replaceState'>) => consume(href, history, 'signup', '/account/confirmed');
