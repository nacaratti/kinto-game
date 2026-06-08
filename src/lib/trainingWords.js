// Modo Treino — sorteia uma palavra-solução aleatória.
//
// A lista de soluções (solucoes.txt) normalmente só é carregada no admin
// para não pesar o bundle principal. Aqui ela é importada sob demanda (lazy),
// apenas quando o jogador entra no Modo Treino — então o jogador casual que
// só joga a palavra do dia nunca baixa esse arquivo.

let cache5 = null;
let cache6 = null;

// Escolhe um item aleatório de uma lista. `rng` injetável para testes.
export const pickRandom = (list, rng = Math.random) => {
  if (!Array.isArray(list) || list.length === 0) return '';
  return list[Math.floor(rng() * list.length)];
};

// Retorna uma palavra-solução aleatória do tamanho pedido (5 ou 6 letras).
export const getRandomSolution = async (wordLength = 5) => {
  if (wordLength === 6) {
    if (!cache6) {
      const m = await import('@/data/solutionList6');
      cache6 = m.SOLUTION_WORDS_6;
    }
    return pickRandom(cache6);
  }
  if (!cache5) {
    const m = await import('@/data/solutionList');
    cache5 = m.SOLUTION_WORDS;
  }
  return pickRandom(cache5);
};
