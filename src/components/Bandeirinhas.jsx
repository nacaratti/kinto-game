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

// Constrói a geometria do festão para uma dada largura (em px; 1 unidade
// SVG = 1 px, então nada distorce). A corda é uma linha ondulada
// (escalopes) cuja profundidade varia conforme a posição:
//  - no centro (onde fica o jogo) os drapeados são RASOS e altos, para
//    não atrapalhar a jogabilidade;
//  - em direção às laterais os drapeados ficam MAIORES e a corda desce,
//    como se estivesse presa nas bordas laterais da página.
export function buildGarland(width, opts = {}) {
  const {
    topY = 6,
    segW = 160,      // largura de cada escalope
    spacing = 30,    // distância horizontal entre bandeirinhas
    gameHalf = 290,  // meia-largura da zona "protegida" do jogo
    minSag = 14,     // profundidade do drapeado no centro
    maxSag = 56,     // profundidade máxima nas laterais
    maxDrop = 240,   // o quanto a corda desce nas laterais
  } = opts;

  const W = Math.max(1, width);
  const half = W / 2;
  const sideSpace = Math.max(0, half - gameHalf);
  const sideDrop = Math.min(sideSpace * 0.55, maxDrop);

  // 0 na zona do jogo → 1 nas bordas (com leve aceleração)
  const ramp = (x) => {
    if (sideSpace <= 1) return 0;
    const d = Math.abs(x - half);
    const r = Math.min(1, Math.max(0, (d - gameHalf) / sideSpace));
    return Math.pow(r, 1.3);
  };
  const peak = (x) => topY + sideDrop * ramp(x);
  const amp = (x) => minSag + (maxSag - minSag) * ramp(x);
  // escalope: 0 no centro (pico sobre o jogo) e a cada segW
  const scallop = (x) => Math.sin((Math.PI * (x - half)) / segW) ** 2;
  const f = (x) => peak(x) + amp(x) * scallop(x);

  // bandeirinhas distribuídas simetricamente a partir do centro
  const xs = [half];
  for (let x = half + spacing; x <= W; x += spacing) xs.push(x);
  for (let x = half - spacing; x >= 0; x -= spacing) xs.unshift(x);

  const D = 2;
  const flags = xs.map((x, i) => {
    const cx = Math.min(W, Math.max(0, x));
    const y = f(cx);
    const angle =
      (Math.atan2(f(Math.min(W, cx + D)) - f(Math.max(0, cx - D)), 2 * D) * 180) / Math.PI;
    return { x: cx, y, angle, color: CORES[i % CORES.length] };
  });

  // caminho da corda (amostrado finamente)
  let cordPath = '';
  let maxY = 0;
  for (let x = 0; x <= W; x += 6) {
    const y = f(x);
    if (y > maxY) maxY = y;
    cordPath += (x === 0 ? 'M' : ' L') + ` ${x} ${y.toFixed(1)}`;
  }

  const height = Math.ceil(maxY + FLAG_H + 8);
  // altura que o componente ocupa no fluxo: só o necessário para o
  // drapeado raso do centro; as laterais fundas "transbordam" para baixo
  // sem empurrar o conteúdo.
  const flowHeight = Math.ceil(topY + minSag + FLAG_H + 8);

  return { flags, cordPath, height, flowHeight, width: W };
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
        <path d={cordPath} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" />
        {flags.map((fl, i) => (
          <g key={i} transform={`translate(${fl.x.toFixed(1)} ${fl.y.toFixed(1)}) rotate(${fl.angle.toFixed(1)})`}>
            <circle cx="0" cy="0" r="2" fill="rgba(255,255,255,0.5)" />
            <polygon points={FLAG_POINTS} fill={fl.color} />
            <polygon points={FLAG_POINTS} fill="url(#bandeiraSombra)" />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default Bandeirinhas;
