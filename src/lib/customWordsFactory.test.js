import { describe, it, expect, beforeEach } from 'vitest';
import { createCustomWords } from './customWordsFactory';

const VALID_WORDS = new Set(['COMER', 'BANCO', 'GRACA', 'PEGAR']);

let cw;

beforeEach(() => {
  localStorage.clear();
  cw = createCustomWords('_cw_test', '_bl_test', 5, VALID_WORDS);
});

// ─── getCustomWords ────────────────────────────────────────────────────────────

describe('getCustomWords', () => {
  it('returns empty array when nothing stored', () => {
    expect(cw.getCustomWords()).toEqual([]);
  });

  it('returns all added words', () => {
    cw.addCustomWord('KINTO');
    cw.addCustomWord('TERMO');
    expect(cw.getCustomWords()).toEqual(expect.arrayContaining(['KINTO', 'TERMO']));
    expect(cw.getCustomWords()).toHaveLength(2);
  });
});

// ─── addCustomWord ─────────────────────────────────────────────────────────────

describe('addCustomWord', () => {
  it('adds a valid word and returns ok', () => {
    const result = cw.addCustomWord('KINTO');
    expect(result.ok).toBe(true);
    expect(cw.getCustomWords()).toContain('KINTO');
  });

  it('normalizes to uppercase before storing', () => {
    cw.addCustomWord('kinto');
    expect(cw.getCustomWords()).toContain('KINTO');
  });

  it('trims whitespace', () => {
    const result = cw.addCustomWord('KINTO');
    expect(result.ok).toBe(true);
  });

  it('rejects words shorter than wordLength', () => {
    const result = cw.addCustomWord('AB');
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/5 letras/i);
  });

  it('rejects words longer than wordLength', () => {
    const result = cw.addCustomWord('TERMOO');
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/5 letras/i);
  });

  it('rejects words with accented characters', () => {
    const result = cw.addCustomWord('GRAÇA');
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/acentos/i);
  });

  it('rejects words already in validWordsSet', () => {
    const result = cw.addCustomWord('COMER');
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/banco de dados/i);
  });

  it('rejects duplicate custom words', () => {
    cw.addCustomWord('KINTO');
    const result = cw.addCustomWord('KINTO');
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/adicionada/i);
  });
});

// ─── removeCustomWord ──────────────────────────────────────────────────────────

describe('removeCustomWord', () => {
  it('removes an existing word', () => {
    cw.addCustomWord('KINTO');
    cw.removeCustomWord('KINTO');
    expect(cw.getCustomWords()).not.toContain('KINTO');
  });

  it('is idempotent when word does not exist', () => {
    cw.addCustomWord('KINTO');
    cw.removeCustomWord('NAOHA');
    expect(cw.getCustomWords()).toHaveLength(1);
  });

  it('removes only the specified word', () => {
    cw.addCustomWord('KINTO');
    cw.addCustomWord('TESTE');
    cw.removeCustomWord('KINTO');
    expect(cw.getCustomWords()).not.toContain('KINTO');
    expect(cw.getCustomWords()).toContain('TESTE');
  });
});

// ─── blacklist ─────────────────────────────────────────────────────────────────

describe('getBlacklist', () => {
  it('returns empty array when nothing stored', () => {
    expect(cw.getBlacklist()).toEqual([]);
  });

  it('returns added words', () => {
    cw.addToBlacklist('BANCO');
    expect(cw.getBlacklist()).toContain('BANCO');
  });
});

describe('addToBlacklist', () => {
  it('adds a word to the blacklist', () => {
    cw.addToBlacklist('BANCO');
    expect(cw.getBlacklist()).toContain('BANCO');
  });

  it('normalizes accented words when adding', () => {
    cw.addToBlacklist('GRAÇA');
    const bl = cw.getBlacklist();
    expect(bl).toContain('GRACA');
  });

  it('does not add duplicates', () => {
    cw.addToBlacklist('BANCO');
    cw.addToBlacklist('BANCO');
    expect(cw.getBlacklist()).toHaveLength(1);
  });
});

describe('removeFromBlacklist', () => {
  it('removes a word from the blacklist', () => {
    cw.addToBlacklist('BANCO');
    cw.removeFromBlacklist('BANCO');
    expect(cw.getBlacklist()).not.toContain('BANCO');
  });

  it('is idempotent when word is not in blacklist', () => {
    cw.addToBlacklist('BANCO');
    cw.removeFromBlacklist('NAOHA');
    expect(cw.getBlacklist()).toHaveLength(1);
  });
});

// ─── isValidGuess ──────────────────────────────────────────────────────────────

describe('isValidGuess', () => {
  it('accepts words in validWordsSet', () => {
    expect(cw.isValidGuess('COMER')).toBe(true);
    expect(cw.isValidGuess('BANCO')).toBe(true);
  });

  it('accepts custom words added at runtime', () => {
    cw.addCustomWord('KINTO');
    expect(cw.isValidGuess('KINTO')).toBe(true);
  });

  it('rejects words not in either set', () => {
    expect(cw.isValidGuess('ZZZZZ')).toBe(false);
  });

  it('rejects blacklisted words even if in validWordsSet', () => {
    cw.addToBlacklist('BANCO');
    expect(cw.isValidGuess('BANCO')).toBe(false);
  });

  it('rejects custom words after they are removed', () => {
    cw.addCustomWord('KINTO');
    cw.removeCustomWord('KINTO');
    expect(cw.isValidGuess('KINTO')).toBe(false);
  });
});

// ─── wordLength parameterization ──────────────────────────────────────────────

describe('wordLength parameterization', () => {
  it('enforces the configured word length', () => {
    const cw6 = createCustomWords('_cw6_test', '_bl6_test', 6, new Set(['BANANA']));
    const short = cw6.addCustomWord('KINTO'); // 5 letters, invalid for length 6
    expect(short.ok).toBe(false);
    expect(short.reason).toMatch(/6 letras/i);

    const ok = cw6.addCustomWord('SAFADO'); // 6 letters
    expect(ok.ok).toBe(true);
  });

  it('uses separate localStorage keys for different instances', () => {
    const cwA = createCustomWords('_cwA', '_blA', 5, VALID_WORDS);
    const cwB = createCustomWords('_cwB', '_blB', 5, VALID_WORDS);
    cwA.addCustomWord('KINTO');
    expect(cwB.getCustomWords()).not.toContain('KINTO');
  });
});
