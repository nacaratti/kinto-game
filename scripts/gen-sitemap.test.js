import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// gen-sitemap.mjs roda no build (prebuild). Se a env VITE_PUBLIC_URL não
// estiver definida, o fallback precisa ser o domínio de produção — um
// placeholder commitado por engano quebraria a indexação.
const src = readFileSync(
  resolve(process.cwd(), 'scripts/gen-sitemap.mjs'),
  'utf-8'
);

describe('gen-sitemap — fallback de domínio', () => {
  it('usa https://kinto.fun como fallback', () => {
    expect(src).toContain("return 'https://kinto.fun'");
  });

  it('não usa example.com como fallback', () => {
    expect(src).not.toContain('example.com');
  });
});
