import { useState, useEffect } from 'react';

const HC_KEY = '_hc';

/**
 * Modo de alto contraste (acessibilidade para daltonismo).
 * Troca as cores de acerto/posição por uma paleta azul/laranja, mais
 * distinguível que o verde/amarelo padrão. Persistido em localStorage e
 * aplicado via atributo data-contrast no <html> (CSS sobrescreve as vars).
 */
export function useHighContrast() {
  const [highContrast, setHighContrastState] = useState(() => {
    try { return localStorage.getItem(HC_KEY) === '1'; } catch { return false; }
  });

  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
  }, [highContrast]);

  const setHighContrast = (val) => {
    setHighContrastState(val);
    try { localStorage.setItem(HC_KEY, val ? '1' : '0'); } catch {}
  };

  return { highContrast, setHighContrast };
}
