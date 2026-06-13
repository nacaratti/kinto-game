import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock do Supabase: cada .from() devolve um objeto cujo .select() resolve
// com um count configurável por tabela.
const { counts, mockFrom } = vi.hoisted(() => {
  const counts = { daily_results: 0, daily_results_6: 0 };
  const mockFrom = vi.fn((table) => ({
    select: vi.fn().mockResolvedValue({ count: counts[table] ?? 0, error: null }),
  }));
  return { counts, mockFrom };
});

vi.mock('@/lib/supabase', () => ({ supabase: { from: mockFrom } }));

import { getTotalGamesPlayed } from './stats';

beforeEach(() => {
  mockFrom.mockClear();
  counts.daily_results = 0;
  counts.daily_results_6 = 0;
});

describe('getTotalGamesPlayed (com Supabase)', () => {
  it('soma os counts das duas tabelas de resultados', async () => {
    counts.daily_results = 1200;
    counts.daily_results_6 = 345;
    await expect(getTotalGamesPlayed()).resolves.toBe(1545);
  });

  it('trata count nulo como 0 em cada tabela', async () => {
    counts.daily_results = null;
    counts.daily_results_6 = 50;
    await expect(getTotalGamesPlayed()).resolves.toBe(50);
  });

  it('usa head: true para não trazer linhas (query barata)', async () => {
    await getTotalGamesPlayed();
    expect(mockFrom).toHaveBeenCalledWith('daily_results');
    expect(mockFrom).toHaveBeenCalledWith('daily_results_6');
    const selectArgs = mockFrom.mock.results[0].value.select.mock.calls[0];
    expect(selectArgs[1]).toMatchObject({ count: 'exact', head: true });
  });
});
