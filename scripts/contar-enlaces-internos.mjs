#!/usr/bin/env node
/**
 * Cuenta los enlaces internos ENTRANTES que recibe cada artículo del blog
 * (/blog/<slug>) desde el CUERPO de otros artículos ya construidos en /dist.
 *
 * Fuentes de enlaces que se cuentan (solo contenido, nunca navegación/UI):
 *  1. Bloques "Lectura recomendada" insertados por rehypeInlineBlocks()
 *     (src/lib/rehype-plugins.mjs) dentro del <div class="prose ...">.
 *     Se identifican por la clase `inline-reco__link`.
 *  2. El bloque "Artículos relacionados" (componente RelatedArticles.astro,
 *     que renderiza ArticleCard.astro) — se acota a la sección
 *     `<section class="border-t border-paper-300 bg-paper-100">...</section>`
 *     que Astro emite justo después de cada `<article>` de post.
 *
 * Deliberadamente NO se cuentan enlaces de: <nav> de migas de pan, <header>,
 * la caja "Revisado por", el enlace "← Volver al blog", el footer/nav global
 * ni la tarjeta de asesoramiento (AsesoramientoCard), porque no son enlaces
 * de contenido editorial entre artículos.
 *
 * Uso:
 *   npm run build
 *   node scripts/contar-enlaces-internos.mjs
 *
 * Requiere que exista dist/blog/<slug>/index.html (salida de `astro build`).
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST_BLOG = path.join(ROOT, 'dist', 'blog');

// Carpetas dentro de dist/blog que NO son artículos individuales.
const NON_ARTICLE_DIRS = new Set(['categoria', 'page']);

async function listArticleSlugs() {
  let entries;
  try {
    entries = await readdir(DIST_BLOG, { withFileTypes: true });
  } catch {
    throw new Error(
      `No existe ${path.relative(ROOT, DIST_BLOG)}. Ejecuta "npm run build" antes de este script.`
    );
  }
  const slugs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (NON_ARTICLE_DIRS.has(entry.name)) continue;
    const indexPath = path.join(DIST_BLOG, entry.name, 'index.html');
    try {
      const s = await stat(indexPath);
      if (s.isFile()) slugs.push(entry.name);
    } catch {
      // Carpeta sin index.html (p. ej. subcarpetas de imágenes futuras): ignorar.
    }
  }
  return slugs.sort();
}

/** Extrae todos los slugs enlazados en bloques "Lectura recomendada". */
function extractRecoLinks(html) {
  const found = [];
  const anchorRe = /<a\b[^>]*>/gi;
  let m;
  while ((m = anchorRe.exec(html))) {
    const tag = m[0];
    if (!/class="[^"]*\binline-reco__link\b[^"]*"/.test(tag)) continue;
    const hrefMatch = tag.match(/href="\/blog\/([a-z0-9-]+)"/i);
    if (hrefMatch) found.push(hrefMatch[1]);
  }
  return found;
}

/** Extrae todos los slugs enlazados desde el bloque "Artículos relacionados". */
function extractRelatedArticlesLinks(html) {
  const startMarker = '<section class="border-t border-paper-300 bg-paper-100">';
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) return [];
  const endIdx = html.indexOf('</section>', startIdx);
  if (endIdx === -1) return [];
  const chunk = html.slice(startIdx, endIdx);
  const found = [];
  const hrefRe = /<a\b[^>]*\bhref="\/blog\/([a-z0-9-]+)"/gi;
  let m;
  while ((m = hrefRe.exec(chunk))) {
    found.push(m[1]);
  }
  return found;
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

async function main() {
  const slugs = await listArticleSlugs();
  const validSlugs = new Set(slugs);
  const counts = new Map(slugs.map((s) => [s, 0]));

  for (const slug of slugs) {
    const filePath = path.join(DIST_BLOG, slug, 'index.html');
    const html = await readFile(filePath, 'utf8');

    const linked = [
      ...extractRecoLinks(html),
      ...extractRelatedArticlesLinks(html),
    ];

    for (const targetSlug of linked) {
      if (targetSlug === slug) continue; // no contar autoenlaces
      if (!validSlugs.has(targetSlug)) continue; // enlace a algo que no es artículo publicado
      counts.set(targetSlug, (counts.get(targetSlug) ?? 0) + 1);
    }
  }

  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const values = rows.map((r) => r[1]);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const med = median(values);
  const total = values.reduce((a, b) => a + b, 0);
  const zeroCount = values.filter((v) => v === 0).length;

  const urlWidth = Math.max(...rows.map((r) => `/blog/${r[0]}`.length), 'URL'.length) + 2;

  console.log('Enlaces internos ENTRANTES por artículo (cuerpo: "Lectura recomendada" + "Artículos relacionados")\n');
  console.log('URL'.padEnd(urlWidth) + 'Entrantes');
  console.log('-'.repeat(urlWidth + 'Entrantes'.length));
  for (const [slug, count] of rows) {
    console.log(`/blog/${slug}`.padEnd(urlWidth) + String(count));
  }

  console.log('\n--- Resumen ---');
  console.log(`Artículos analizados: ${rows.length}`);
  console.log(`Total de enlaces internos contados: ${total}`);
  console.log(`Mínimo de entrantes: ${min}`);
  console.log(`Máximo de entrantes: ${max}`);
  console.log(`Mediana de entrantes: ${med}`);
  console.log(`Artículos con 0 entrantes: ${zeroCount}`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
