/**
 * Gera o texto de compartilhamento do resultado do jogo.
 * Função pura — sem efeitos colaterais, fácil de testar.
 */
export const buildChallengeText = ({
  currentAttempt,
  maxGuesses,
  submittedGuessesInfo,
  currentMode,
}) => {
  const attempt = currentAttempt + 1;
  const rows = (submittedGuessesInfo || [])
    .filter(Boolean)
    .map(row =>
      row.map(({ status }) =>
        status === 'correct' ? '🟢' : status === 'present' ? '🟡' : '⚫'
      ).join('')
    )
    .join('\n');
  const gameUrl = `https://kinto.fun${currentMode.path === '/' ? '' : currentMode.path}`;
  return `Acertei o Kinto em ${attempt}/${maxGuesses}! Você consegue bater? 🎯\n\n${rows}\n\n${gameUrl}`;
};

export const buildShareText = ({
  isGameWon,
  currentAttempt,
  maxGuesses,
  submittedGuessesInfo,
  currentMode,
  hardMode,
  today,
  streak,
}) => {
  const attempt = isGameWon ? currentAttempt + 1 : maxGuesses;
  const result = isGameWon ? `${attempt}/${maxGuesses}` : `X/${maxGuesses}`;
  const rows = (submittedGuessesInfo || [])
    .filter(Boolean)
    .map(row =>
      row.map(({ status }) =>
        status === 'correct' ? '🟢' : status === 'present' ? '🟡' : '⚫'
      ).join('')
    )
    .join('\n');
  const modeLabel = currentMode.id === 'classic' ? '' : ` (${currentMode.label})`;
  const hardSuffix = hardMode ? ' *' : '';
  const streakSuffix = streak >= 2 ? ` 🔥${streak}` : '';
  const gameUrl = `https://kinto.fun${currentMode.path === '/' ? '' : currentMode.path}`;
  return `Kinto${modeLabel}${hardSuffix} ${today} ${result}${streakSuffix}\n\n${rows}\n\n${gameUrl}`;
};
