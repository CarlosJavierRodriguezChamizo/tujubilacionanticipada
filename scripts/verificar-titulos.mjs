#!/usr/bin/env node
/**
 * Comprueba la longitud del <title> de cada página construida.
 *
 * Un <title> por encima de 60 caracteres se trunca en el resultado de búsqueda
 * y Google tiende a reescribirlo por su cuenta, que es exactamente lo que
 * reportó la auditoría de Ahrefs (60 URLs indexables afectadas, 8 de ellas con
 * el title ya reescrito por Google). Se mide sobre `/dist`, no sobre el
 * frontmatter, porque el título final se compone en `BaseHead.astro`.
 *
 * Uso:  node scripts/verificar-titulos.mjs [--max 60]
 * Sale con código 1 si alguna página se pasa.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const argMax = process.argv.indexOf('--max');
const MAX = argMax !== -1 ? Number(process.argv[argMax + 1]) : 60;

function paginas(dir) {
  const out = [];
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) out.push(...paginas(ruta));
    else if (entrada === 'index.html') out.push(ruta);
  }
  return out;
}

const ficheros = paginas(DIST);
const largos = [];

for (const f of ficheros) {
  const html = readFileSync(f, 'utf8');
  const m = /<title>([\s\S]*?)<\/title>/.exec(html);
  if (!m) continue;
  // Entidades HTML básicas: cuentan como un carácter en el SERP.
  const titulo = m[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
  if (titulo.length > MAX) {
    largos.push({ url: `/${relative(DIST, f).replace(/index\.html$/, '')}`, len: titulo.length, titulo });
  }
}

console.log(`Títulos — ${ficheros.length} páginas construidas, máximo ${MAX} caracteres\n`);

if (largos.length === 0) {
  console.log('Ninguna página supera el límite.');
  process.exit(0);
}

largos.sort((a, b) => b.len - a.len);
for (const l of largos) console.log(`  ${l.len}  ${l.url}\n       ${l.titulo}`);
console.error(`\n${largos.length} página(s) por encima de ${MAX} caracteres.`);
process.exit(1);
