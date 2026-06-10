import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isChunkLoadError, reloadOnce, importWithRetry } from './chunkReload';

const chunkError = () => new Error('Failed to fetch dynamically imported module: /assets/x.js');

describe('isChunkLoadError', () => {
  it('detecta mensagens de falha de import dinâmico', () => {
    expect(isChunkLoadError(chunkError())).toBe(true);
    expect(isChunkLoadError(new Error('error loading dynamically imported module'))).toBe(true);
    expect(isChunkLoadError(new Error('Loading chunk 5 failed'))).toBe(true);
    expect(isChunkLoadError(new Error('Importing a module script failed.'))).toBe(true);
  });

  it('reconhece erro pelo name ChunkLoadError', () => {
    const err = new Error('boom');
    err.name = 'ChunkLoadError';
    expect(isChunkLoadError(err)).toBe(true);
  });

  it('ignora erros comuns e valores nulos', () => {
    expect(isChunkLoadError(new Error('TypeError qualquer'))).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
    expect(isChunkLoadError(undefined)).toBe(false);
  });
});

describe('reloadOnce', () => {
  let reloadSpy;

  beforeEach(() => {
    sessionStorage.clear();
    reloadSpy = vi.fn();
    // jsdom não permite reatribuir location.reload diretamente
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadSpy },
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('recarrega apenas uma vez por sessão', () => {
    expect(reloadOnce()).toBe(true);
    expect(reloadOnce()).toBe(false);
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });
});

describe('importWithRetry', () => {
  let reloadSpy;

  beforeEach(() => {
    sessionStorage.clear();
    reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadSpy },
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('retorna o módulo no primeiro sucesso sem recarregar', async () => {
    const mod = { default: 'ok' };
    const factory = vi.fn().mockResolvedValue(mod);
    await expect(importWithRetry(factory)).resolves.toBe(mod);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it('retenta após falha de chunk e sucede na segunda tentativa', async () => {
    const mod = { default: 'ok' };
    const factory = vi.fn()
      .mockRejectedValueOnce(chunkError())
      .mockResolvedValue(mod);
    await expect(importWithRetry(factory, { retries: 2, delay: 0 })).resolves.toBe(mod);
    expect(factory).toHaveBeenCalledTimes(2);
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it('recarrega a página após esgotar as tentativas com erro de chunk', async () => {
    const factory = vi.fn().mockRejectedValue(chunkError());
    await expect(importWithRetry(factory, { retries: 2, delay: 0 })).rejects.toThrow(/dynamically imported/);
    expect(factory).toHaveBeenCalledTimes(3); // 1 inicial + 2 retries
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  it('não retenta nem recarrega para erros que não são de chunk', async () => {
    const factory = vi.fn().mockRejectedValue(new Error('erro de lógica'));
    await expect(importWithRetry(factory, { retries: 2, delay: 0 })).rejects.toThrow('erro de lógica');
    expect(factory).toHaveBeenCalledTimes(1);
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it('limpa a trava de reload após carregamento bem-sucedido', async () => {
    sessionStorage.setItem('_chunk_reload', '1');
    await importWithRetry(vi.fn().mockResolvedValue({ default: 'ok' }));
    expect(sessionStorage.getItem('_chunk_reload')).toBeNull();
  });
});
