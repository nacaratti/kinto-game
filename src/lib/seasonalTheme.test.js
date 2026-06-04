import { describe, it, expect, vi, afterEach } from 'vitest';
import { isJuneBrasilia, getSeasonalWordList, FESTA_JUNINA_WORDS } from './seasonalTheme';

afterEach(() => vi.useRealTimers());

describe('isJuneBrasilia', () => {
  it('returns true when it is June in Brasília (UTC-3)', () => {
    // June 15 00:00 UTC → June 14 21:00 Brasília (still June 14 — not June)
    // June 15 04:00 UTC → June 15 01:00 Brasília (June 15 in Brasília)
    const juneDate = new Date('2026-06-15T04:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(juneDate);
    expect(isJuneBrasilia()).toBe(true);
  });

  it('returns false in July', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-01T12:00:00Z'));
    expect(isJuneBrasilia()).toBe(false);
  });

  it('returns false in May', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-20T12:00:00Z'));
    expect(isJuneBrasilia()).toBe(false);
  });

  it('handles midnight edge: June 1 01:00 UTC → May 31 22:00 Brasília (not June)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T01:00:00Z')); // 22:00 Brasília on May 31
    expect(isJuneBrasilia()).toBe(false);
  });

  it('handles midnight edge: June 1 04:00 UTC → June 1 01:00 Brasília (June)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T04:00:00Z')); // 01:00 Brasília on June 1
    expect(isJuneBrasilia()).toBe(true);
  });
});

describe('getSeasonalWordList', () => {
  it('returns FESTA_JUNINA_WORDS in June', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));
    const list = getSeasonalWordList();
    expect(list).toBe(FESTA_JUNINA_WORDS);
    expect(list.length).toBeGreaterThan(0);
  });

  it('returns null outside June', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T12:00:00Z'));
    expect(getSeasonalWordList()).toBeNull();
  });

  it('all themed words are 5 uppercase letters', () => {
    for (const word of FESTA_JUNINA_WORDS) {
      expect(word).toMatch(/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÀÈÌÒÙÇ]{5}$/);
    }
  });
});
