// @vitest-environment jsdom
import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync('index.html', 'utf8');
const doc = new DOMParser().parseFromString(html, 'text/html');
const meta = (selector: string) => doc.querySelector(selector)?.getAttribute('content');
const host = 'https://academy.datunavekua2010.workers.dev';
function jpegDimensions(data: Buffer): [number, number] {
  if (data.readUInt16BE(0) !== 0xffd8) throw new Error('Not a JPEG');
  let i = 2;
  while (i < data.length) {
    if (data[i++] !== 0xff) throw new Error('Invalid JPEG');
    let marker = data[i++];
    while (marker === 0xff) marker = data[i++];
    if (marker === 0xda || marker === 0xd9) break;
    const length = data.readUInt16BE(i);
    if ([0xc0, 0xc1, 0xc2].includes(marker)) return [data.readUInt16BE(i + 5), data.readUInt16BE(i + 3)];
    i += length;
  }
  throw new Error('JPEG dimensions unavailable');
}

describe('site metadata', () => {
  it('publishes crawl, icon, canonical and matching absolute social metadata', () => {
    expect(meta('meta[name="robots"]')).toBe('index,follow');
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${host}/`);
    expect(doc.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('/favicon.ico');
    expect(existsSync('public/favicon.ico')).toBe(true);
    expect(meta('meta[property="og:url"]')).toBe(`${host}/`);
    expect(meta('meta[property="og:image"]')).toBe(`${host}/og-image.jpg`);
    expect(meta('meta[name="twitter:image"]')).toBe(`${host}/og-image.jpg`);
    expect(meta('meta[name="twitter:card"]')).toBe('summary_large_image');
    expect(meta('meta[property="og:title"]')!.length).toBeGreaterThanOrEqual(40);
    expect(meta('meta[property="og:title"]')!.length).toBeLessThanOrEqual(70);
    expect(meta('meta[property="og:description"]')!.length).toBeGreaterThanOrEqual(110);
    expect(meta('meta[property="og:description"]')!.length).toBeLessThanOrEqual(160);
    const socialImage = readFileSync('public/og-image.jpg');
    expect(socialImage.length).toBeLessThan(5_000_000);
    expect(jpegDimensions(socialImage)).toEqual([1200, 630]);
  });
  it('includes valid structured data and manifest with existing image assets', () => {
    const schema = JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(schema).toMatchObject({ '@type': 'WebSite', name: 'Axiom Academy', url: `${host}/`, inLanguage: 'ka' });
    expect(doc.querySelector('link[rel="manifest"]')?.getAttribute('href')).toBe('/manifest.webmanifest');
    const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
    expect(manifest.start_url).toBe('/');
    for (const icon of manifest.icons) {
      const png = readFileSync(`public${icon.src}`);
      expect(png.subarray(1, 4).toString()).toBe('PNG');
      const [width, height] = icon.sizes.split('x').map(Number);
      expect(png.readUInt32BE(16)).toBe(width);
      expect(png.readUInt32BE(20)).toBe(height);
    }
    const apple = doc.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href');
    expect(apple && existsSync(`public${apple}`)).toBe(true);
  });
});
