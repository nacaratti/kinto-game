import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockInsert, mockFrom } = vi.hoisted(() => {
  const mockInsert = vi.fn().mockResolvedValue({ error: null });
  const mockFrom = vi.fn(() => ({ insert: mockInsert }));
  return { mockInsert, mockFrom };
});

vi.mock('@/lib/supabase', () => ({
  supabase: { from: mockFrom },
}));

import { isBenign, isExtensionError, initErrorReporter } from './errorReporter';

beforeEach(() => {
  mockInsert.mockClear();
  mockFrom.mockClear();
});

// ─── isBenign ────────────────────────────────────────────────────────────────

describe('isBenign', () => {
  it('detects Supabase lock stolen error (mixed case)', () => {
    expect(isBenign('Lock was stolen by another request')).toBe(true);
  });

  it('detects lock stolen error in lowercase', () => {
    expect(isBenign('lock was stolen')).toBe(true);
  });

  it('detects lock request aborted error', () => {
    expect(isBenign('Lock request aborted')).toBe(true);
  });

  it('returns false for real application errors', () => {
    expect(isBenign('Cannot read properties of undefined')).toBe(false);
    expect(isBenign('TypeError: x is not a function')).toBe(false);
    expect(isBenign('Network Error')).toBe(false);
  });

  it('detects cross-origin masked "Script error."', () => {
    expect(isBenign('Script error.')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isBenign('')).toBe(false);
  });
});

// ─── isExtensionError ────────────────────────────────────────────────────────

describe('isExtensionError', () => {
  it('detects errors originating from a Chrome extension (by source)', () => {
    expect(isExtensionError('chrome-extension://abcdef/inject.js', null)).toBe(true);
  });

  it('detects errors originating from a Firefox extension (by stack)', () => {
    const stack = 'ReferenceError: hasSeenWelcome is not defined\n  at moz-extension://xyz/content.js:1:1';
    expect(isExtensionError('', stack)).toBe(true);
  });

  it('detects Safari and webkit masked extension URLs', () => {
    expect(isExtensionError('safari-web-extension://uuid/script.js', null)).toBe(true);
    expect(isExtensionError(null, 'at webkit-masked-url://hidden/foo.js:1:1')).toBe(true);
  });

  it('returns false for errors from the application itself', () => {
    expect(isExtensionError('https://kinto.fun/assets/index-abc.js', 'at https://kinto.fun/assets/index-abc.js:1:1')).toBe(false);
  });

  it('returns false when source and stack are empty', () => {
    expect(isExtensionError(null, null)).toBe(false);
    expect(isExtensionError('', '')).toBe(false);
  });
});

// ─── initErrorReporter — filtro de erros benignos ────────────────────────────

describe('initErrorReporter (unhandledrejection filter)', () => {
  it('does not report Supabase lock stolen errors to the database', async () => {
    initErrorReporter();

    const event = new Event('unhandledrejection');
    event.reason = new Error('Lock was stolen by another request');
    window.dispatchEvent(event);

    await new Promise(r => setTimeout(r, 10));

    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('does not report lock request aborted errors to the database', async () => {
    initErrorReporter();

    const event = new Event('unhandledrejection');
    event.reason = new Error('Lock request aborted');
    window.dispatchEvent(event);

    await new Promise(r => setTimeout(r, 10));

    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('does not report browser-extension errors (e.g. hasSeenWelcome)', async () => {
    initErrorReporter();

    const event = new ErrorEvent('error', {
      message: 'Uncaught ReferenceError: hasSeenWelcome is not defined',
      filename: 'chrome-extension://abcdefghijklmnop/content.js',
      error: new Error('hasSeenWelcome is not defined'),
    });
    window.dispatchEvent(event);

    await new Promise(r => setTimeout(r, 10));

    expect(mockInsert).not.toHaveBeenCalled();
  });
});
