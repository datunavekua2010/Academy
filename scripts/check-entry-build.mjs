// Run after `npm run build`: guard against accidentally re-inlining the full app.
import { readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
const html = readFileSync('dist/index.html', 'utf8');
const entry = html.match(/<script type="module"[^>]*src="([^"]+)"/)?.[1];
if (!entry?.startsWith('/assets/')) throw new Error('Expected a separate hashed entry script');
const bytes = readFileSync(`dist${entry}`);
if (bytes.length > 300_000 || gzipSync(bytes).length > 100_000) throw new Error('Initial JS budget exceeded');
if (Buffer.byteLength(html) > 15_000 || /modulepreload[^>]*Shell/i.test(html)) throw new Error('Full app was eagerly included in HTML');
for (const path of ['favicon.ico', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'og-image.jpg', 'fonts/NotoSansGeorgian-Regular.ttf']) {
  if (!statSync(`dist/${path}`).isFile()) throw new Error(`Missing built asset: ${path}`);
}
console.log(`Initial HTML: ${Buffer.byteLength(html)} bytes; entry JS: ${bytes.length} bytes (${gzipSync(bytes).length} gzip).`);
