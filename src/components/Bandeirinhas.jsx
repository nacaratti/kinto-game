import React from 'react';
import { isJuneBrasilia } from '@/lib/seasonalTheme';

// Cores clássicas de bandeirinha de festa junina, alternadas.
const CORES = ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#fb8c00', '#ec407a'];

// Strip decorativa de bandeirinhas no topo da página. Puramente visual:
// não recebe cliques nem foco, então nunca atrapalha a jogabilidade.
// Aparece apenas em junho (horário de Brasília).
const Bandeirinhas = ({ count = 60 }) => {
  if (!isJuneBrasilia()) return null;

  return (
    <div className="bandeirinhas" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="bandeirinha"
          style={{ '--cor': CORES[i % CORES.length], '--i': i % 6 }}
        />
      ))}
    </div>
  );
};

export default Bandeirinhas;
