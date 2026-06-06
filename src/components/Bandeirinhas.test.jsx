import { describe, it, expect, vi, beforeEach } from 'vitest';

let Bandeirinhas;
let setJune;

beforeEach(async () => {
  vi.resetModules();
  let june = true;
  setJune = (v) => { june = v; };
  vi.doMock('@/lib/seasonalTheme', () => ({
    isJuneBrasilia: () => june,
  }));
  Bandeirinhas = (await import('./Bandeirinhas.jsx')).default;
});

describe('Bandeirinhas', () => {
  it('não renderiza nada fora de junho', () => {
    setJune(false);
    expect(Bandeirinhas({})).toBeNull();
  });

  it('renderiza a faixa em junho', () => {
    setJune(true);
    const el = Bandeirinhas({});
    expect(el).not.toBeNull();
    expect(el.props.className).toBe('bandeirinhas');
    expect(el.props['aria-hidden']).toBe('true');
  });

  it('gera a quantidade de bandeirinhas pedida', () => {
    setJune(true);
    const el = Bandeirinhas({ count: 12 });
    expect(el.props.children).toHaveLength(12);
  });

  it('é decorativa: não captura cliques (sem onClick)', () => {
    setJune(true);
    const el = Bandeirinhas({});
    expect(el.props.onClick).toBeUndefined();
  });
});
