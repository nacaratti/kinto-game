import React from 'react';
import { isJuneBrasilia } from '@/lib/seasonalTheme';

// Cores clássicas de bandeirinha de festa junina (vermelho, amarelo,
// verde, azul), alternadas como na referência.
const CORES = ['#e23b2e', '#f4c020', '#3aa64a', '#2a7de1'];

// Geometria de um "drapeado" (uma barriga da corda): a corda é uma
// curva de Bézier quadrática que cai no meio e volta, de modo que o
// padrão possa ser repetido lado a lado (tile) sem emendas visíveis.
// Cada bandeirinha é pendurada num ponto da curva e inclinada conforme
// a tangente — como se estivesse amarrada à corda.
export function buildBunting({ count = 8, width = 320, top = 8, sag = 56 }) {
  const P0 = { x: 0, y: top };
  const P1 = { x: width / 2, y: top + sag };
  const P2 = { x: width, y: top };

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
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const p = at(t);
    flags.push({ x: p.x, y: p.y, angle: tangentDeg(t), color: CORES[i % CORES.length] });
  }

  const cordPath = `M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`;
  return { cordPath, flags, width, P0, P2 };
}

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

const TILE_W = 320;
const TILE_H = 74;

// Monta o SVG de um único drapeado como string, para ser usado como
// background-image que se repete horizontalmente (repeat-x). Assim o
// festão preenche qualquer largura mantendo tamanho e curva constantes.
function buildTileSvg() {
  const { cordPath, flags } = buildBunting({ count: 8, width: TILE_W });
  const flagsMarkup = flags
    .map(
      (f) =>
        `<g transform="translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) rotate(${f.angle.toFixed(1)})">` +
        `<circle cx="0" cy="0" r="2" fill="rgba(255,255,255,0.5)"/>` +
        `<polygon points="${FLAG_POINTS}" fill="${f.color}"/>` +
        `<polygon points="${FLAG_POINTS}" fill="url(#s)"/>` +
        `</g>`
    )
    .join('');

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_W}" height="${TILE_H}" viewBox="0 0 ${TILE_W} ${TILE_H}">` +
    `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0%" stop-color="rgba(255,255,255,0.18)"/>` +
    `<stop offset="55%" stop-color="rgba(0,0,0,0)"/>` +
    `<stop offset="100%" stop-color="rgba(0,0,0,0.22)"/>` +
    `</linearGradient></defs>` +
    `<path d="${cordPath}" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2" stroke-linecap="round"/>` +
    flagsMarkup +
    `</svg>`
  );
}

const TILE_DATA_URI = `url("data:image/svg+xml,${encodeURIComponent(buildTileSvg())}")`;

// Festão decorativo de bandeirinhas de festa junina. Puramente visual:
// pointer-events none, user-select none e aria-hidden, então nunca
// atrapalha a jogabilidade. Estático (sem animação). Só em junho.
const Bandeirinhas = () => {
  if (!isJuneBrasilia()) return null;

  return (
    <div
      className="bandeirinhas"
      aria-hidden="true"
      style={{
        height: `${TILE_H}px`,
        backgroundImage: TILE_DATA_URI,
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'center top',
        backgroundSize: `${TILE_W}px ${TILE_H}px`,
      }}
    />
  );
};

export default Bandeirinhas;
