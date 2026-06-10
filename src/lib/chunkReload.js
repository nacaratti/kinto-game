// Utilitários para lidar com falhas de import() dinâmico.
//
// Em conexões lentas ou após um novo deploy (quando o jogador ainda tem o
// index.html antigo em cache mas os chunks com hash mudaram), um import()
// dinâmico pode falhar com "Failed to fetch dynamically imported module".
// Quando isso acontece dentro de um import() direto (sem Suspense/ErrorBoundary),
// a promise rejeita sem tratamento e vira um "Unhandled rejection" no monitor.
//
// Estratégia: tentar novamente algumas vezes (resolve falhas transitórias de
// rede) e, se ainda assim falhar com erro de chunk, recarregar a página uma
// única vez para buscar os assets atualizados do novo deploy.

const RELOAD_GUARD_KEY = '_chunk_reload';

export function isChunkLoadError(error) {
  const msg = error?.message || '';
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('Loading chunk') ||
    msg.includes('Importing a module script failed') ||
    error?.name === 'ChunkLoadError'
  );
}

// Recarrega a página no máximo uma vez por sessão para evitar loop de reload
// quando o problema não é um deploy desatualizado (ex.: jogador offline).
// Retorna true se disparou o reload.
export function reloadOnce() {
  try {
    if (sessionStorage.getItem(RELOAD_GUARD_KEY)) return false;
    sessionStorage.setItem(RELOAD_GUARD_KEY, '1');
  } catch {
    // sessionStorage indisponível (modo privado/iframe): recarrega mesmo assim.
  }
  window.location.reload();
  return true;
}

// Limpa a trava de reload após um carregamento bem-sucedido, re-armando o
// mecanismo para um eventual próximo deploy na mesma sessão.
function clearReloadGuard() {
  try {
    sessionStorage.removeItem(RELOAD_GUARD_KEY);
  } catch {
    // ignore
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Envolve um factory de import() dinâmico com retentativa automática.
// Em caso de falha de chunk após todas as tentativas, recarrega a página
// uma vez (fallback amigável). A promise ainda rejeita para quem quiser tratar.
export async function importWithRetry(factory, { retries = 2, delay = 350 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const mod = await factory();
      clearReloadGuard();
      return mod;
    } catch (error) {
      lastError = error;
      if (!isChunkLoadError(error)) throw error;
      if (attempt < retries) {
        await wait(delay * (attempt + 1));
      }
    }
  }
  // Esgotou as tentativas e ainda é erro de chunk: provável deploy novo.
  reloadOnce();
  throw lastError;
}
