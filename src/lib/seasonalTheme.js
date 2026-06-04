const BRASILIA_OFFSET_MS = -3 * 60 * 60 * 1000;

export const isJuneBrasilia = () => {
  const brasilia = new Date(Date.now() + BRASILIA_OFFSET_MS);
  return brasilia.getUTCMonth() === 5; // June (0-indexed)
};

export const FESTA_JUNINA_WORDS = [
  'MILHO', 'FESTA', 'ARROZ', 'PALHA', 'VIOLA',
  'NOIVA', 'BANDA', 'BREGA', 'BOMBA', 'JUNHO',
];

/** Retorna a lista temática se for junho em Brasília, ou null fora de época. */
export const getSeasonalWordList = () => {
  return isJuneBrasilia() ? FESTA_JUNINA_WORDS : null;
};
