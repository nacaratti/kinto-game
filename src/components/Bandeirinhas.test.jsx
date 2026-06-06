import { describe, it, expect, vi, beforeEach } from 'vitest';

let Bandeirinhas;
let buildBunting;
let setJune;

beforeEach(async () => {
  vi.resetModules();
  let june = true;
  setJune = (v) => { june = v; };
  vi.doMock('@/lib/seasonalTheme', () => ({
    isJuneBrasilia: () => june,
  }));
  const mod = await import('./Bandeirinhas.jsx');
  Bandeirinhas = mod.default;
  buildBunting = mod.buildBunting;
});

describe('Bandeirinhas (componente)', () => {
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

  it('é decorativa: não captura cliques (sem onClick)', () => {
    setJune(true);
    const el = Bandeirinhas({});
    expect(el.props.onClick).toBeUndefined();
  });
});

describe('buildBunting (geometria do festão)', () => {
  it('gera a quantidade de bandeirinhas pedida', () => {
    const { flags } = buildBunting({ count: 12, width: 1000 });
    expect(flags).toHaveLength(12);
  });

  it('a corda cai no meio (catenária): centro mais baixo que as pontas', () => {
    const { flags } = buildBunting({ count: 9, width: 1000, top: 12, sag: 70 });
    const meio = flags[Math.floor(flags.length / 2)];
    expect(meio.y).toBeGreaterThan(flags[0].y);
    expect(meio.y).toBeGreaterThan(flags[flags.length - 1].y);
  });

  it('é simétrica: pontas inclinam para lados opostos, centro reto', () => {
    const { flags } = buildBunting({ count: 9, width: 1000 });
    const primeira = flags[0];
    const ultima = flags[flags.length - 1];
    // tangentes opostas nas pontas
    expect(Math.sign(primeira.angle)).toBe(-Math.sign(ultima.angle));
    // bandeirinha central praticamente sem inclinação
    expect(Math.abs(flags[Math.floor(flags.length / 2)].angle)).toBeLessThan(1);
  });

  it('produz um path SVG de curva quadrática (Q)', () => {
    const { cordPath } = buildBunting({ count: 4, width: 1000 });
    expect(cordPath).toMatch(/^M .+ Q .+/);
  });
});
