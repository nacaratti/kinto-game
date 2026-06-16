import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Garante que os metadados de SEO em index.html (JSON-LD e meta description)
// permaneçam válidos — uma regressão silenciosa aqui prejudica o tráfego orgânico.
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf-8');

describe('SEO — index.html', () => {
  it('tem uma meta description em PT-BR não vazia e dentro do limite recomendado', () => {
    const match = html.match(/<meta name="description" content="([^"]+)"/);
    expect(match).toBeTruthy();
    const desc = match[1];
    expect(desc.length).toBeGreaterThan(50);
    expect(desc.length).toBeLessThanOrEqual(160);
  });

  it('tem um bloco JSON-LD válido', () => {
    const match = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
    );
    expect(match).toBeTruthy();
    expect(() => JSON.parse(match[1])).not.toThrow();
  });

  it('declara os tipos schema.org WebSite e VideoGame com nome, descrição e URL', () => {
    const match = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
    );
    const data = JSON.parse(match[1]);
    const nodes = data['@graph'] ?? [data];
    const byType = (t) => nodes.find((n) => n['@type'] === t);

    const site = byType('WebSite');
    const game = byType('VideoGame');
    expect(site).toBeTruthy();
    expect(game).toBeTruthy();

    for (const node of [site, game]) {
      expect(node.name).toBeTruthy();
      expect(node.description).toBeTruthy();
      expect(node.url).toMatch(/^https:\/\//);
      expect(node.inLanguage).toBe('pt-BR');
    }
  });
});
