import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('retorna string vazia sem argumentos', () => {
    expect(cn()).toBe('');
  });

  it('retorna classe única sem modificações', () => {
    expect(cn('text-white')).toBe('text-white');
  });

  it('concatena múltiplas classes com espaço', () => {
    expect(cn('flex', 'items-center', 'gap-2')).toBe('flex items-center gap-2');
  });

  it('ignora valores falsy (null, undefined, false, 0)', () => {
    expect(cn('flex', null, undefined, false, 0, 'gap-2')).toBe('flex gap-2');
  });

  it('aceita objeto — inclui chaves com valor truthy', () => {
    expect(cn({ flex: true, hidden: false, 'text-white': true })).toBe('flex text-white');
  });

  it('aceita array de classes', () => {
    expect(cn(['flex', 'items-center'])).toBe('flex items-center');
  });

  it('mescla entradas mistas (string, objeto, array)', () => {
    expect(cn('flex', { 'items-center': true, hidden: false }, ['gap-2'])).toBe(
      'flex items-center gap-2'
    );
  });

  it('resolve conflitos Tailwind — última classe vence (twMerge)', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-zinc-800', 'bg-zinc-900')).toBe('bg-zinc-900');
  });

  it('preserva classes não conflitantes junto com as mescladas', () => {
    expect(cn('flex', 'p-4', 'text-white', 'p-2')).toBe('flex text-white p-2');
  });

  it('resolve conflitos em classes responsivas', () => {
    expect(cn('md:p-4', 'md:p-8')).toBe('md:p-8');
  });
});
