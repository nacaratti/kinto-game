import React, { useRef, useState, useEffect } from 'react';
import { isJuneBrasilia } from '@/lib/seasonalTheme';

// Cores clássicas de bandeirinha de festa junina.
const CORES = ['#e23b2e', '#f4c020', '#3aa64a', '#2a7de1'];

// Flâmula tipo "rabo de andorinha" pendurada do ponto (0,0).
const FLAG_W = 30;
const FLAG_H = 30;
const NOTCH = 9;
const FLAG_POINTS = [
  [-FLAG_W / 2, 0],
  [FLAG_W / 2, 0],
  [FLAG_W / 2, FLAG_H],
  [0, FLAG_H - NOTCH],
  [-FLAG_W / 2, FLAG_H],
].map((p) => p.join(',')).join(' ');

const qPoint = (P0, P1, P2, t) => {
  const mt = 1 - t;
  return {
    x: mt * mt * P0.x + 2 * mt * t * P1.x + t * t * P2.x,
    y: mt * mt * P0.y + 2 * mt * t * P1.y + t * t * P2.y,
  };
};
const qAngle = (P0, P1, P2, t) => {
  const dx = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
  const dy = 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

// Festão raso de largura total (mobile/estreito): escalopes pequenos e
// altos, ancorados nos dois cantos sob o navbar.
function buildShallow(W, { topY = 8, spacing = 48 } = {}) {
  const flags = [];
  let i = 0;
  for (let x = spacing / 2; x <= W; x += spacing) {
    flags.push({ x: Math.min(W, x), y: topY, angle: 0, color: CORES[i++ % CORES.length] });
  }
  return {
    swags: [],
    flags,
    pins: [{ x: 0, y: topY }, { x: W, y: topY }],
    cordPath: `M 0 ${topY} L ${W} ${topY}`,
    height: Math.ceil(topY + FLAG_H + 8),
    flowHeight: Math.ceil(topY + FLAG_H + 6),
    width: W,
    innerL: 0,
    innerR: W,
    boardHalf: 0,
  };
}

// Constrói a geometria do festão. Apenas DOIS drapeados, um de cada
// lado do tabuleiro: cada um é "preso" logo abaixo do navbar (na margem
// do tabuleiro) e termina preso na lateral da página. O centro, sobre o
// tabuleiro, fica livre para não atrapalhar a jogabilidade.
export function buildGarland(width, opts = {}) {
  const {
    topY = 8,
    boardMargin = 250, // meia-largura da coluna do jogo (~max-w-lg)
    spacing = 48,
  } = opts;

  const W = Math.max(1, width);
  const half = W / 2;
  // âncoras internas na margem do tabuleiro (recuam em telas estreitas)
  const boardHalf = Math.min(boardMargin, Math.max(36, half - 36));
  const innerL = half - boardHalf;
  const innerR = half + boardHalf;

  // Sem espaço lateral suficiente (mobile/estreito) → festão raso de
  // largura total, mantendo o topo sobre o jogo sem atrapalhar.
  if (innerL < 120) {
    return buildShallow(W, { topY, spacing });
  }

  // comprimento horizontal de cada drapeado (da margem do tabuleiro até a borda)
  const span = Math.max(1, innerL);
  // o quanto a ponta lateral desce e o quanto a barriga do drapeado afunda
  const sideY = Math.min(Math.max(span * 0.3, 28), 140);
  const sag = Math.min(Math.max(span * 0.62, 48), 250);

  let colorIdx = 0;
  const makeSwag = (P0, P2) => {
    const P1 = { x: (P0.x + P2.x) / 2, y: (P0.y + P2.y) / 2 + sag };
    const count = Math.max(2, Math.round(Math.abs(P2.x - P0.x) / spacing));
    const flags = [];
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const p = qPoint(P0, P1, P2, t);
      const rawAngle = qAngle(P0, P1, P2, t);
      // Normaliza para que as bandeiras sempre pendurem para baixo (gravidade).
      // Tangentes que apontam para a esquerda (|ângulo| > 90°) seriam rotacionadas
      // de cabeça para baixo sem essa correção.
      const angle = rawAngle > 90 ? rawAngle - 180 : rawAngle < -90 ? rawAngle + 180 : rawAngle;
      flags.push({ x: p.x, y: p.y, angle, color: CORES[colorIdx++ % CORES.length] });
    }
    const path = `M ${P0.x.toFixed(1)} ${P0.y.toFixed(1)} Q ${P1.x.toFixed(1)} ${P1.y.toFixed(1)} ${P2.x.toFixed(1)} ${P2.y.toFixed(1)}`;
    return { P0, P1, P2, flags, path };
  };

  // esquerda: da margem esquerda do tabuleiro até a borda esquerda da página
  const left = makeSwag({ x: innerL, y: topY }, { x: 0, y: sideY });
  // direita: da margem direita do tabuleiro até a borda direita da página
  const right = makeSwag({ x: innerR, y: topY }, { x: W, y: sideY });

  // Festão horizontal sobre o tabuleiro, ligando os dois pontos de fixação
  // em linha reta rente ao navbar.
  const centerCount = Math.max(2, Math.round((innerR - innerL) / spacing));
  const centerFlags = [];
  for (let i = 0; i < centerCount; i++) {
    const t = (i + 0.5) / centerCount;
    const x = innerL + t * (innerR - innerL);
    centerFlags.push({ x, y: topY, angle: 0, color: CORES[colorIdx++ % CORES.length] });
  }
  const centerPath = `M ${innerL.toFixed(1)} ${topY.toFixed(1)} L ${innerR.toFixed(1)} ${topY.toFixed(1)}`;

  const swags = [left, right];
  const flags = [...left.flags, ...right.flags, ...centerFlags];
  // pontos de fixação (nós): margens do tabuleiro (sob o navbar) e laterais
  const pins = [
    { x: innerL, y: topY },
    { x: innerR, y: topY },
    { x: 0, y: sideY },
    { x: W, y: sideY },
  ];
  const cordPath = `${left.path} ${right.path} ${centerPath}`;

  const maxY = flags.reduce((m, f) => Math.max(m, f.y), 0);
  const height = Math.ceil(maxY + FLAG_H + 8);
  // só o necessário para a parte alta (perto das âncoras do tabuleiro); as
  // barrigas fundas das laterais transbordam para baixo sem empurrar o jogo.
  const flowHeight = Math.ceil(topY + FLAG_H + 6);

  return { swags, flags, pins, cordPath, height, flowHeight, width: W, innerL, innerR, boardHalf };
}

// Festão decorativo de bandeirinhas de festa junina. Puramente visual:
// pointer-events none, user-select none e aria-hidden, então nunca
// atrapalha a jogabilidade. Estático (sem animação). Só em junho.
const Bandeirinhas = () => {
  const ref = useRef(null);
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof ResizeObserver === 'undefined') {
      const onResize = () => setWidth(el.clientWidth || window.innerWidth);
      onResize();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(e.contentRect.width);
    });
    ro.observe(el);
    setWidth(el.clientWidth || window.innerWidth);
    return () => ro.disconnect();
  }, []);

  if (!isJuneBrasilia()) return null;

  const { flags, cordPath, height, flowHeight, width: W } = buildGarland(width);

  return (
    <div ref={ref} className="bandeirinhas" aria-hidden="true" style={{ height: `${flowHeight}px` }}>
      <svg
        className="bandeirinhas-svg"
        width={W}
        height={height}
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="xMinYMin meet"
      >
        <defs>
          <linearGradient id="bandeiraSombra" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="55%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
          </linearGradient>
        </defs>
        <path d={cordPath} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
        {flags.map((fl, i) => (
          <g key={i} transform={`translate(${fl.x.toFixed(1)} ${fl.y.toFixed(1)}) rotate(${fl.angle.toFixed(1)})`}>
            <polygon points={FLAG_POINTS} fill={fl.color} />
            <polygon points={FLAG_POINTS} fill="url(#bandeiraSombra)" />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default Bandeirinhas;
