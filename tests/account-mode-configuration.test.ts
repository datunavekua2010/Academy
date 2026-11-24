import { describe, expect, it } from 'vitest';
import { selectAccountMode } from '../src/student/accountMode';

describe('account mode configuration', () => {
  it('preserves the local preview when not configured or explicitly selected', () => {
    expect(selectAccountMode(undefined)).toBe('preview');
    expect(selectAccountMode('')).toBe('preview');
    expect(selectAccountMode('preview')).toBe('preview');
  });
  it('defaults only configured production builds to connected login', () => {
    for (const mode of [undefined, '']) {
      expect(selectAccountMode(mode, true, true)).toBe('connected');
      expect(selectAccountMode(mode, true, false)).toBe('invalid');
      expect(selectAccountMode(mode, false, true)).toBe('preview');
    }
  });
  it('honors explicit settings even in a configured production build', () => {
    expect(selectAccountMode('preview', true, true)).toBe('preview');
    expect(selectAccountMode('connected', true, true)).toBe('connected');
    expect(selectAccountMode('conected', true, true)).toBe('invalid');
    expect(selectAccountMode('connected')).toBe('connected');
  });
  it('fails closed on misspelled or unexpected modes instead of presenting a sample identity', () => {
    for (const value of ['production', 'CONNECTED', ' true ', 'false']) expect(selectAccountMode(value)).toBe('invalid');
  });
});
