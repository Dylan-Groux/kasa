import { describe, expect, it } from 'vitest';
import { extractErrorMessage } from '../extractErrorMessage';

describe('extractErrorMessage', () => {
  it('returns the error field when present', () => {
    expect(extractErrorMessage({ error: 'Email déjà pris' }, 'fallback')).toBe('Email déjà pris');
  });

  it('coerces a non-string error field to string', () => {
    expect(extractErrorMessage({ error: 42 }, 'fallback')).toBe('42');
  });

  it('falls back when the body has no error field', () => {
    expect(extractErrorMessage({ ok: true }, 'fallback')).toBe('fallback');
  });

  it('falls back when the body is null', () => {
    expect(extractErrorMessage(null, 'fallback')).toBe('fallback');
  });

  it('falls back when the body is not an object', () => {
    expect(extractErrorMessage('oops', 'fallback')).toBe('fallback');
  });
});
