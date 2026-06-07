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

describe('buildGarland (dois drapeados ancorados)', () => {
  it('tem exatamente 2 drapeados e 4 pontos de fixação', () => {
    const g = buildGarland(1440);
    expect(g.swags).toHaveLength(2);
    expect(g.pins).toHaveLength(4);
    // dois subpaths (um Q por drapeado)
    expect((g.cordPath.match(/Q/g) || []).length).toBe(2);
  });

  it('tem festão horizontal sobre o tabuleiro (linha reta, y=topY)', () => {
    const g = buildGarland(1440);
    const half = 720;
    // bandeirinhas centrais ficam na linha horizontal (y pequeno, rente ao navbar)
    const centro = g.flags.filter((f) => Math.abs(f.x - half) < g.boardHalf - 1);
    expect(centro.length).toBeGreaterThan(0);
    // todas com ângulo 0 (penduradas retas, corda horizontal)
    centro.forEach((f) => expect(f.angle).toBe(0));
    // todas no topo (y = topY padrão = 8)
    centro.forEach((f) => expect(f.y).toBeLessThan(20));
  });

  it('âncoras internas ficam na margem do tabuleiro, sob o navbar (y alto)', () => {
    const g = buildGarland(1440);
    expect(g.innerL).toBeGreaterThan(0);
    expect(g.innerR).toBeLessThan(1440);
    // pinos internos no topo
    expect(g.pins[0].y).toBeLessThan(20);
    expect(g.pins[1].y).toBeLessThan(20);
  });

  it('no web os drapeados descem bem mais que as âncoras', () => {
    const g = buildGarland(1440);
    const maxY = Math.max(...g.flags.map((f) => f.y));
    expect(maxY).toBeGreaterThan(120);
  });

  it('é simétrico: lado esquerdo espelha o direito', () => {
    const g = buildGarland(1600);
    const half = 800;
    const ys = g.flags.map((f) => ({ d: Math.round(Math.abs(f.x - half)), y: Math.round(f.y) }));
    // para cada distância do centro à esquerda existe uma igual à direita com mesmo y
    const left = g.flags.filter((f) => f.x < half).map((f) => Math.round(f.y)).sort();
    const right = g.flags.filter((f) => f.x > half).map((f) => Math.round(f.y)).sort();
    expect(left).toEqual(right);
  });

  it('ocupa pouco espaço no fluxo (não empurra o jogo)', () => {
    const g = buildGarland(1440);
    expect(g.flowHeight).toBeLessThan(60);
  });

  it('no mobile (estreito) vira festão raso de largura total', () => {
    const g = buildGarland(375);
    expect(g.swags).toHaveLength(0); // sem drapeados laterais
    // bandeirinhas cobrem a largura toda
    const maxX = Math.max(...g.flags.map((f) => f.x));
    const minX = Math.min(...g.flags.map((f) => f.x));
    expect(maxX).toBeGreaterThan(300);
    expect(minX).toBeLessThan(40);
    // e é raso
    const ys = g.flags.map((f) => f.y);
    expect(Math.max(...ys) - Math.min(...ys)).toBeLessThan(30);
  });
});
