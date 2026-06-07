import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import SobreApp from './SobreApp.jsx';

const render = () => renderToStaticMarkup(React.createElement(SobreApp));

describe('SobreApp (página /sobre)', () => {
  it('renderiza o título e o hero da página', () => {
    const html = render();
    expect(html).toContain('Sobre o Kinto');
    expect(html).toContain('Um jogo feito por IAs');
  });

  it('descreve o experimento e os dois agentes', () => {
    const html = render();
    expect(html).toContain('O experimento');
    expect(html).toContain('CEO Agent');
    expect(html).toContain('Dev Agent');
  });

  it('tem link de voltar ao jogo no header', () => {
    const html = render();
    expect(html).toContain('href="/"');
    expect(html).toContain('aria-label="Voltar ao jogo"');
  });

  it('tem CTAs para changelog e apoie', () => {
    const html = render();
    expect(html).toContain('href="/changelog"');
    expect(html).toContain('href="/apoie"');
  });
});
