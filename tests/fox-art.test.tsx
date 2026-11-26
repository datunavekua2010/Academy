// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { Mascot } from '../src/components/Mascot';
import { FoxArt } from '../src/components/FoxArt';

/**
 * The standalone FoxArt remains an SVG used by grade selection, while Mascot
 * uses the supplied raster artwork and animates the whole character. Test each
 * component's actual contract rather than expecting the SVG inside Mascot.
 */
afterEach(cleanup);

const renderMascot = () =>
  render(<Mascot thoughts={['გამარჯობა']} waveOnMount={false} />);
const renderFoxArt = () => render(<FoxArt pupilStyle={{}} />);

describe('standalone fox artwork', () => {
  it('inlines an SVG rather than a background image', () => {
    const { container } = renderFoxArt();
    expect(container.querySelector('svg.fox-art')).toBeTruthy();
    // A background-image would render but nothing inside it could animate.
    expect(container.querySelector('[style*="background-image"]')).toBeNull();
  });

  it('keeps every group the animations target', () => {
    const { container } = renderFoxArt();
    for (const id of [
      'axi-tail',
      'axi-body',
      'axi-head',
      'axi-ear-inner',
      'axi-eye-left',
      'axi-eye-right',
      'axi-pupil-left',
      'axi-pupil-right',
      'axi-muzzle',
      'axi-spark',
    ]) {
      expect(container.querySelector(`#${id}`), `missing #${id}`).toBeTruthy();
    }
  });

  it('draws the fox from real geometry, not an empty shell', () => {
    const { container } = renderFoxArt();
    const shapes = container.querySelectorAll('svg.fox-art path, svg.fox-art ellipse, svg.fox-art circle');
    expect(shapes.length).toBeGreaterThanOrEqual(20);
  });

  it('prefixes the gradient references used by the SVG', () => {
    const { container } = renderFoxArt();
    // Both the defs and the fills must agree; a mismatch renders the fox black.
    expect(container.querySelector('#axi-fox-fur')).toBeTruthy();
    expect(container.querySelector('#axi-fox-tail-fur')).toBeTruthy();
    const furUsers = container.querySelectorAll('[fill="url(#axi-fox-fur)"]');
    expect(furUsers.length).toBeGreaterThan(0);
    expect(container.innerHTML).not.toContain('url(#fur)');
    expect(container.innerHTML).not.toContain('url(#tailFur)');
  });

});

describe('raster mascot', () => {
  it('renders the supplied image rather than a background image', () => {
    const { container } = renderMascot();
    const image = container.querySelector<HTMLImageElement>('img.mascot-art');
    expect(image?.getAttribute('src')).toMatch(/raccoon-mascot\.png/);
    expect(container.querySelector('[style*="background-image"]')).toBeNull();
  });

  it('lets a placement override its size from CSS', () => {
    const { container } = renderMascot();
    const root = container.querySelector('.mascot-root') as HTMLElement;
    // The prop must seed a *different* variable than the one CSS reads.
    // If the component wrote --mascot-scale inline, it would beat every
    // selector and .hero-mascot/.axi-nav-mascot could never resize the fox.
    expect(root.style.getPropertyValue('--mascot-propscale')).not.toBe('');
    expect(root.style.getPropertyValue('--mascot-scale')).toBe('');
  });

  it('exposes the mascot to assistive tech exactly once', () => {
    const { container } = renderMascot();
    // The raster image is decorative; the wrapper carries the accessible name.
    const image = container.querySelector('img.mascot-art');
    const wrapper = container.querySelector('[role="img"]');
    expect(image?.getAttribute('alt')).toBe('');
    expect(wrapper?.getAttribute('aria-label')).toBe('Axi — მეგობრული ენოტი');
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(1);
  });
});

describe('dashboard mascot positioning', () => {
  it('keeps mobile positioning and scale independent of stylesheet load order', () => {
    const css = readFileSync('src/student/student.css', 'utf8');
    const rules = [...css.matchAll(/\.mascot-root\.axi-nav-mascot\s*\{([^}]*)\}/g)].map(match => match[1]);
    expect(rules).toHaveLength(2);
    expect(rules[0]).toMatch(/position:\s*absolute/);
    expect(rules[0]).toMatch(/--mascot-scale:\s*1\.25/);
    expect(rules[1]).toMatch(/position:\s*relative/);
    expect(rules[1]).toMatch(/left:\s*auto/);
    expect(rules[1]).toMatch(/top:\s*auto/);
    expect(rules[1]).toMatch(/--mascot-scale:\s*\.95/);
  });
});

describe('mascot containment', () => {
  /**
   * The drawn art and the tap target are position:absolute children of
   * .mascot-root. Static placements need their own containing block too, so
   * the art and button do not escape into a surrounding stage. jsdom has no
   * layout engine, so this guards the declaration rather than the geometry.
   */
  it('keeps its own containing block when a placement makes it static', () => {
    // jsdom's import.meta.url is not a file URL, so resolve from the cwd.
    const css = readFileSync('src/mascot.css', 'utf8');
    const rootRule = css.slice(css.indexOf('.mascot-root {'), css.indexOf('}', css.indexOf('.mascot-root {')));
    expect(rootRule).toMatch(/will-change:\s*transform/);
    // isolation alone is not enough: it creates a stacking context but not a
    // containing block, which was verified in a real browser.
    expect(rootRule).not.toMatch(/^\s*isolation:/m);
  });
});
