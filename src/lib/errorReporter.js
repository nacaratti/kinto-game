// ============================================================
// Reporter de erros de runtime do navegador.
// Captura window.onerror e unhandledrejection e grava em
// client_errors (Supabase, anon key — só INSERT permitido).
//
// Throttle: máximo MAX_PER_SESSION erros por carregamento de
// página, com dedupe por mensagem, para não inundar o banco.
//
// NÃO confundir com o handler de erro em vite.config.js, que é
// só para o overlay de desenvolvimento — esse aqui é produção.
// ============================================================
import { supabase } from '@/lib/supabase';

const MAX_PER_SESSION = 5;
const STACK_LIMIT = 2000;
const APP_VERSION = import.meta.env.VITE_APP_VERSION || 'dev';

// Erros benignos do runtime do browser/libs que não representam bug
// da aplicação e não devem gerar alertas nem cards.
const IGNORED_PATTERNS = [
  // Supabase usa Web Locks API para sincronizar sessão entre abas;
  // quando outra aba assume o lock, este erro é lançado — é esperado.
  'lock was stolen',
  'lock request aborted',
  // Erro cross-origin mascarado: scripts de terceiros sem CORS
  // chegam ao window.onerror apenas como "Script error." sem stack
  // útil. Não é bug da aplicação e não há o que investigar.
  'script error.',
];

export function isBenign(message) {
  const lower = String(message).toLowerCase();
  return IGNORED_PATTERNS.some(p => lower.includes(p));
}

// URLs de extensões de navegador (e userscripts). Erros originados
// em content scripts injetados na página — ex.: "hasSeenWelcome is
// not defined" — não são bugs do Kinto, mas chegam ao listener
// global de erro e poluíam o monitoramento gerando cards falsos.
// Mesma estratégia do `denyUrls` do Sentry.
const EXTENSION_URL_PATTERNS = [
  'chrome-extension://',
  'moz-extension://',
  'safari-web-extension://',
  'safari-extension://',
  'webkit-masked-url://',
  'ms-browser-extension://',
];

export function isExtensionError(source, stack) {
  const haystack = `${source || ''} ${stack || ''}`.toLowerCase();
  return EXTENSION_URL_PATTERNS.some(p => haystack.includes(p));
}

let sentCount = 0;
const seenMessages = new Set();

async function report(message, stack, source) {
  if (!supabase) return;
  if (!message) return;
  if (isBenign(message)) return;
  if (isExtensionError(source, stack)) return;
  if (sentCount >= MAX_PER_SESSION) return;

  // Dedupe: mesma mensagem só é enviada uma vez por sessão
  const key = String(message).slice(0, 200);
  if (seenMessages.has(key)) return;
  seenMessages.add(key);
  sentCount += 1;

  try {
    await supabase.from('client_errors').insert({
      message: String(message).slice(0, 500),
      stack: stack ? String(stack).slice(0, STACK_LIMIT) : null,
      url: typeof window !== 'undefined' ? window.location.pathname : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      app_version: APP_VERSION,
    });
  } catch {
    // Falha ao reportar erro nunca deve quebrar a aplicação — silencioso.
  }
}

let installed = false;

/** Instala os listeners globais de erro. Idempotente. */
export function initErrorReporter() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('error', (event) => {
    // event.error tem stack; event.message é o texto;
    // event.filename indica o arquivo de origem (ex.: extensão).
    report(event.message || event.error?.message, event.error?.stack, event.filename);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason?.message || String(reason);
    report(`Unhandled rejection: ${message}`, reason?.stack);
  });
}
