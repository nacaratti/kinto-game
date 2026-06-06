import React from 'react';
import { isJuneBrasilia } from '@/lib/seasonalTheme';

// Cores clássicas de bandeirinha de festa junina (vermelho, amarelo,
// verde, azul), alternadas como na referência.
const CORES = ['#e23b2e', '#f4c020', '#3aa64a', '#2a7de1'];

// Geometria do festão: a corda é uma curva de Bézier quadrática que
// "cai" no meio (catenária aproximada). Cada bandeirinha é pendurada
// num ponto da curva e inclinada conforme a tangente — como se
// estivesse de fato amarrada à corda.
export function buildBunting({ count = 16, width = 1000, top = 12, sag = 70 }) {
  const P0 = { x: 12, y: top };
  const P1 = { x: width / 2, y: top + sag }; // ponto de controle (puxa pra baixo)
  const P2 = { x: width - 12, y: top };

  const at = (t) => {
    const mt = 1 - t;
    return {
      x: mt * mt * P0.x + 2 * mt * t * P1.x + t * t * P2.x,
      y: mt * mt * P0.y + 2 * mt * t * P1.y + t * t * P2.y,
    };
  };
  const tangentDeg = (t) => {
    const dx = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
    const dy = 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  const flags = [];
  // distribui as bandeirinhas entre as extremidades, com margem nas pontas
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const p = at(t);
    flags.push({ x: p.x, y: p.y, angle: tangentDeg(t), color: CORES[i % CORES.length] });
  }

  const cordPath = `M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`;
  return { cordPath, flags, width, P0, P2 };
}

// Flâmula tipo "rabo de andorinha" pendurada do ponto (0,0).
const FLAG_W = 42;
const FLAG_H = 46;
const NOTCH = 13;
const FLAG_POINTS = [
  [-FLAG_W / 2, 0],
  [FLAG_W / 2, 0],
  [FLAG_W / 2, FLAG_H],
  [0, FLAG_H - NOTCH],
  [-FLAG_W / 2, FLAG_H],
].map((p) => p.join(',')).join(' ');

// Festão decorativo de bandeirinhas de festa junina. Puramente visual:
// pointer-events none, user-select none e aria-hidden, então nunca
// atrapalha a jogabilidade. Estático (sem animação). Só em junho.
const Bandeirinhas = ({ count = 16 }) => {
  if (!isJuneBrasilia()) return null;

  const VIEW_W = 1000;
  const VIEW_H = 150;
  const { cordPath, flags } = buildBunting({ count, width: VIEW_W });

  return (
    <div className="bandeirinhas" aria-hidden="true">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        className="bandeirinhas-svg"
      >
        {/* corda */}
        <path d={cordPath} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" />
        {/* bandeirinhas */}
        {flags.map((f, i) => (
          <g key={i} transform={`translate(${f.x} ${f.y}) rotate(${f.angle})`}>
            {/* nó na corda */}
            <circle cx="0" cy="0" r="2.2" fill="rgba(255,255,255,0.5)" />
            <polygon points={FLAG_POINTS} fill={f.color} />
            {/* leve sombra na parte de baixo para dar volume de tecido */}
            <polygon points={FLAG_POINTS} fill="url(#bandeiraSombra)" />
          </g>
        ))}
        <defs>
          <linearGradient id="bandeiraSombra" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="55%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Bandeirinhas;
