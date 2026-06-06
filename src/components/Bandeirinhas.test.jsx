import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

let Bandeirinhas;
let buildGarland;
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
  buildGarland = mod.buildGarland;
});

describe('Bandeirinhas (componente)', () => {
  it('não renderiza nada fora de junho', () => {
    setJune(false);
    expect(renderToStaticMarkup(React.createElement(Bandeirinhas))).toBe('');
  });

  it('renderiza o festão em junho (svg + bandeirinhas + aria-hidden)', () => {
    setJune(true);
    const html = renderToStaticMarkup(React.createElement(Bandeirinhas));
    expect(html).toContain('class="bandeirinhas"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('<svg');
    expect(html).toContain('<polygon');
  });

  it('é decorativo: não captura cliques (sem onclick)', () => {
    setJune(true);
    const html = renderToStaticMarkup(React.createElement(Bandeirinhas));
    expect(html.toLowerCase()).not.toContain('onclick');
  });
});

describe('buildGarland (geometria do festão)', () => {
  it('gera bandeirinhas e um path de corda', () => {
    const g = buildGarland(1200);
    expect(g.flags.length).toBeGreaterThan(0);
    expect(g.cordPath.startsWith('M')).toBe(true);
  });

  it('é simétrico em torno do centro', () => {
    const g = buildGarland(1600);
    const half = 800;
    const left = g.flags.find((f) => Math.abs(f.x - (half - 300)) < 16);
    const right = g.flags.find((f) => Math.abs(f.x - (half + 300)) < 16);
    expect(left && right).toBeTruthy();
    expect(Math.abs(left.y - right.y)).toBeLessThan(2);
  });

  it('no web: laterais descem bem mais que o centro', () => {
    const g = buildGarland(1600);
    const half = 800;
    const centro = g.flags.find((f) => Math.abs(f.x - half) < 16);
    const borda = g.flags.reduce((a, b) => (b.x < a.x ? b : a)); // mais à esquerda
    expect(borda.y).toBeGreaterThan(centro.y + 80);
  });

  it('zona central do jogo permanece rasa (independente da largura)', () => {
    const wide = buildGarland(1600);
    const narrow = buildGarland(520);
    // profundidade do centro deve ser parecida (rasa) em ambos
    const centroWide = wide.flags.find((f) => Math.abs(f.x - 800) < 16).y;
    const centroNarrow = narrow.flags.find((f) => Math.abs(f.x - 260) < 16).y;
    expect(Math.abs(centroWide - centroNarrow)).toBeLessThan(20);
    // o fluxo ocupado (altura reservada) é raso em ambos
    expect(wide.flowHeight).toBeLessThan(70);
    expect(narrow.flowHeight).toBeLessThan(70);
  });

  it('no mobile (estreito) não há queda lateral', () => {
    const g = buildGarland(400);
    const ys = g.flags.map((f) => f.y);
    const max = Math.max(...ys);
    const min = Math.min(...ys);
    expect(max - min).toBeLessThan(40); // raso e uniforme
  });
});
