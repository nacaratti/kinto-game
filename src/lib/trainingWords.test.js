import { describe, it, expect } from 'vitest';
import { pickRandom } from './trainingWords';

describe('pickRandom', () => {
  it('retorna um item da lista', () => {
    const list = ['AAAAA', 'BBBBB', 'CCCCC'];
    expect(list).toContain(pickRandom(list));
  });

  it('usa o rng injetado para escolher o índice', () => {
    const list = ['AAAAA', 'BBBBB', 'CCCCC'];
    expect(pickRandom(list, () => 0)).toBe('AAAAA');
    expect(pickRandom(list, () => 0.5)).toBe('BBBBB');
    expect(pickRandom(list, () => 0.99)).toBe('CCCCC');
  });

  it('retorna string vazia para lista vazia ou inválida', () => {
    expect(pickRandom([])).toBe('');
    expect(pickRandom(null)).toBe('');
    expect(pickRandom(undefined)).toBe('');
  });

  it('nunca estoura o índice quando rng se aproxima de 1', () => {
    const list = ['AAAAA', 'BBBBB'];
    expect(pickRandom(list, () => 0.9999999)).toBe('BBBBB');
  });
});
