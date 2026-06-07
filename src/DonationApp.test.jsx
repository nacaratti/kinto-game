import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

// Mock da camada de dados para isolar o componente do Supabase.
vi.mock('@/lib/supporters', () => ({
  hasSubmittedSupporter: () => false,
  getApprovedSupporters: () => Promise.resolve([]),
  submitSupporter: () => Promise.resolve({ ok: true }),
}));

import DonationApp from './DonationApp.jsx';

const render = () => renderToStaticMarkup(React.createElement(DonationApp));

describe('DonationApp (página /apoie)', () => {
  it('renderiza o título e o hero da página', () => {
    const html = render();
    expect(html).toContain('Apoie o Kinto');
    expect(html).toContain('Me pague um cafezinho?');
  });

  it('exibe a seção de Pix Copia e Cola', () => {
    const html = render();
    expect(html).toContain('Pix Copia e Cola');
    expect(html).toContain('Copiar');
  });

  it('exibe o QR Code do Pix', () => {
    const html = render();
    expect(html).toContain('alt="QR Code Pix"');
  });

  it('tem link de voltar ao jogo no header', () => {
    const html = render();
    expect(html).toContain('href="/"');
    expect(html).toContain('aria-label="Voltar ao jogo"');
  });

  it('mostra o estado vazio do mural quando não há apoiadores', () => {
    const html = render();
    expect(html).toContain('Seja o primeiro a apoiar o Kinto!');
  });
});
