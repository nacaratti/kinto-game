// ============================================================
// Otimizador de PNG lossless — sem dependências externas.
//
// Reduz o tamanho dos PNGs estáticos em public/ sem perda de
// qualidade visual: descomprime os dados de imagem (IDAT),
// recomprime com deflate no nível máximo e remove fragmentação
// de múltiplos chunks IDAT. As linhas de pixel (scanlines) ficam
// byte a byte idênticas — só a compressão zlib melhora.
//
// Uso:  node scripts/optimize-images.mjs          (aplica)
//       node scripts/optimize-images.mjs --check   (só relata)
// ============================================================
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

// Chunks puramente de metadados — seguros de remover sem afetar
// a renderização da imagem em navegadores.
const STRIP_CHUNKS = new Set(['tEXt', 'zTXt', 'iTXt', 'tIME', 'pHYs']);

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}

function readChunks(buf) {
  if (!buf.subarray(0, 8).equals(PNG_SIG)) throw new Error('não é um PNG válido');
  const chunks = [];
  let o = 8;
  while (o < buf.length) {
    const len = buf.readUInt32BE(o);
    const type = buf.toString('ascii', o + 4, o + 8);
    chunks.push({ type, data: buf.subarray(o + 8, o + 8 + len) });
    o += 12 + len;
    if (type === 'IEND') break;
  }
  return chunks;
}

function writeChunks(chunks) {
  const parts = [PNG_SIG];
  for (const ch of chunks) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(ch.data.length);
    const type = Buffer.from(ch.type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([type, ch.data])));
    parts.push(len, type, ch.data, crc);
  }
  return Buffer.concat(parts);
}

// Recomprime os scanlines mantendo-os byte a byte idênticos.
// Testa duas estratégias de deflate e fica com a menor.
function recompress(raw) {
  const a = zlib.deflateSync(raw, { level: 9, memLevel: 9, strategy: zlib.constants.Z_DEFAULT_STRATEGY });
  const b = zlib.deflateSync(raw, { level: 9, memLevel: 9, strategy: zlib.constants.Z_FILTERED });
  return b.length < a.length ? b : a;
}

export function optimizePng(buf) {
  const chunks = readChunks(buf);
  const idat = Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data));
  const raw = zlib.inflateSync(idat);
  const recompressed = recompress(raw);

  const out = [];
  let idatWritten = false;
  for (const c of chunks) {
    if (c.type === 'IDAT') {
      if (!idatWritten) {
        out.push({ type: 'IDAT', data: recompressed });
        idatWritten = true;
      }
      continue;
    }
    if (STRIP_CHUNKS.has(c.type)) continue;
    out.push(c);
  }
  const result = writeChunks(out);

  // Garantia de losslessness: os scanlines decodificados precisam ser idênticos.
  const check = Buffer.concat(readChunks(result).filter((c) => c.type === 'IDAT').map((c) => c.data));
  if (Buffer.compare(zlib.inflateSync(check), raw) !== 0) {
    throw new Error('verificação lossless falhou — abortando');
  }
  return result;
}

function main() {
  const root = path.resolve(fileURLToPath(import.meta.url), '../../public');
  const checkOnly = process.argv.includes('--check');
  const targets = ['og-image.png', 'icon-512.png', 'icon-192.png', 'favicon.png'];

  let totalBefore = 0;
  let totalAfter = 0;
  for (const name of targets) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) continue;
    const before = fs.readFileSync(file);
    const after = optimizePng(before);
    totalBefore += before.length;
    totalAfter += after.length;
    const pct = before.length ? ((1 - after.length / before.length) * 100).toFixed(1) : '0.0';
    const action = after.length < before.length ? (checkOnly ? 'reduziria' : 'otimizado') : 'sem ganho';
    console.log(`  ${name.padEnd(16)} ${before.length} → ${after.length} bytes (${pct}% menor) — ${action}`);
    if (!checkOnly && after.length < before.length) fs.writeFileSync(file, after);
  }
  const totalPct = totalBefore ? ((1 - totalAfter / totalBefore) * 100).toFixed(1) : '0.0';
  console.log(`  total: ${totalBefore} → ${totalAfter} bytes (${totalPct}% menor)`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main();
