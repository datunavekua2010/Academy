import { describe, expect, it } from 'vitest';
import { selectAccountMode } from '../src/student/accountMode';

describe('account mode configuration', () => {
  it('preserves the local preview when not configured or explicitly selected', () => {
    expect(selectAccountMode(undefined)).toBe('preview');
    expect(selectAccountMode('')).toBe('preview');
    expect(selectAccountMode('preview')).toBe('preview');
  });
  it('fails closed if production mode is missing while allowing explicit preview or connected builds', () => {
    expect(selectAccountMode(undefined, true)).toBe('invalid');
    expect(selectAccountMode('', true)).toBe('invalid');
    expect(selectAccountMode('preview', true)).toBe('preview');
    expect(selectAccountMode('connected', true)).toBe('connected');
  });
  it('uses real accounts only when explicitly configured', () => {
    expect(selectAccountMode('connected')).toBe('connected');
  });
  it('fails closed on misspelled or unexpected modes instead of presenting a sample identity', () => {
    for (const value of ['production', 'CONNECTED', ' true ', 'false']) expect(selectAccountMode(value)).toBe('invalid');
  });
});
