// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { Mascot } from '../src/components/Mascot';

/**
 * The mascot artwork is an inlined SVG (components/FoxArt.tsx). These tests
 * guard the contract the CSS animates against: if a group id is renamed or
 * dropped, the blink/wag/tracking silently stop working — no other test
 * would notice, because nothing throws.
 */
afterEach(cleanup);

const renderMascot = () =>
  render(<Mascot thoughts={['გამარჯობა']} waveOnMount={false} />);

describe('fox artwork', () => {
  it('inlines an SVG rather than a background image', () => {
    const { container } = renderMascot();
    expect(container.querySelector('svg.fox-art')).toBeTruthy();
    // A background-image would render but nothing inside it could animate.
    expect(container.querySelector('[style*="background-image"]')).toBeNull();
  });

  it('keeps every group the animations target', () => {
    const { container } = renderMascot();
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
    const { container } = renderMascot();
    const shapes = container.querySelectorAll('svg.fox-art path, svg.fox-art ellipse, svg.fox-art circle');
    expect(shapes.length).toBeGreaterThanOrEqual(20);
  });

  it('namespaces its gradient ids so two mascots cannot collide', () => {
    const { container } = renderMascot();
    // Both the defs and the fills must agree; a mismatch renders the fox black.
    expect(container.querySelector('#axi-fox-fur')).toBeTruthy();
    expect(container.querySelector('#axi-fox-tail-fur')).toBeTruthy();
    const furUsers = container.querySelectorAll('[fill="url(#axi-fox-fur)"]');
    expect(furUsers.length).toBeGreaterThan(0);
    expect(container.innerHTML).not.toContain('url(#fur)');
    expect(container.innerHTML).not.toContain('url(#tailFur)');
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
    // The SVG is decorative; the wrapper carries the accessible name.
    const svg = container.querySelector('svg.fox-art');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('mascot containment', () => {
  /**
   * The drawn art and the tap target are position:absolute children of
   * .mascot-root. AxiNav's mobile layout sets the root to `position: static`,
   * which would hand their containing block to the nav stage instead: on tap
   * the stage grows as the bubbles open, the fox slides to the new bottom and
   * the invisible button stretches over every bubble. jsdom has no layout
   * engine, so this guards the declaration that prevents it rather than the
   * resulting geometry.
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
