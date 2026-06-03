import { getTodayDateStr } from '@/lib/wordOfDay';

const DAILY_KEY_5 = '_s2z';
const DAILY_KEY_6 = '_s2z6';
const BEST_STREAK_KEY = '_bsk';

export { DAILY_KEY_5, DAILY_KEY_6 };

const readDaily = (key) => {
  try { return JSON.parse(atob(localStorage.getItem(key) || '')); } catch { return {}; }
};

const dateMinusOne = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d - 1));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
};

export const getBestStreak = () => {
  try { return Number(localStorage.getItem(BEST_STREAK_KEY) || 0); } catch { return 0; }
};

/**
 * Retorna o histórico pessoal dos últimos `days` dias para o modo especificado.
 * Lê apenas o localStorage — sem chamadas ao Supabase.
 * @returns Array<{date: string, status: 'won'|'lost'|null}>
 */
export const getPersonalHistory = (days = 30, modeKey = DAILY_KEY_5) => {
  const data = readDaily(modeKey);

  // Agrega por data: se houve ao menos uma vitória no dia, marca como 'won'
  const dateMap = {};
  for (const [k, entries] of Object.entries(data)) {
    const date = k.split('|')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const hasWon = Array.isArray(entries) && entries.some(e => e.won);
    if (!dateMap[date] || hasWon) dateMap[date] = hasWon ? 'won' : 'lost';
  }

  const today = getTodayDateStr();
  const [ty, tm, td] = today.split('-').map(Number);
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(Date.UTC(ty, tm - 1, td - i));
    const dateStr = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
    result.push({ date: dateStr, status: dateMap[dateStr] ?? null });
  }
  return result; // oldest → newest
};

export const getStreak = () => {
  const d5 = readDaily(DAILY_KEY_5);
  const d6 = readDaily(DAILY_KEY_6);

  const dates = new Set();
  for (const key of [...Object.keys(d5), ...Object.keys(d6)]) {
    const date = key.split('|')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) dates.add(date);
  }

  let streak = 0;
  let check = getTodayDateStr();

  while (dates.has(check)) {
    streak++;
    check = dateMinusOne(check);
  }

  // Persist best streak
  const best = getBestStreak();
  if (streak > best) {
    try { localStorage.setItem(BEST_STREAK_KEY, streak); } catch {}
  }

  return streak;
};
