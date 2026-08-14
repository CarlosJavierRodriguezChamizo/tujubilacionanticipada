#!/usr/bin/env node
/**
 * contar-enlaces-internos.mjs
 *
 * Mide, sobre el HTML ya generado en /dist (tras `npm run build`), cuántos
 * enlaces internos ENTRANTES recibe cada artículo del blog desde el CUERPO
 * de OTROS artículos. Solo cuenta los dos mecanismos que hoy generan
 * enlaces de artículo a artículo dentro del cuerpo:
 *
 *   1) Bloques "Lectura recomendada" — <aside class="inline-reco">, insertados
 *      en el cuerpo por rehypeInlineBlocks() (src/lib/rehype-plugins.mjs).
 *   2) Sección "Artículos relacionados" — <section class="border-t
 *      border-paper-300 bg-paper-100">, renderizada por
 *      src/components/RelatedArticles.astro (vía ArticleCard.astro).
 *
 * NO cuenta: breadcrumbs, el eyebrow de categoría, el menú, el footer, el
 * enlace "← Volver al blog", el enlace a la ficha del revisor ni el CTA de
 * asesoramiento (apunta a /asesoramiento, no a otro artículo).
 *
 * Nota sobre el recuento: cada tarjeta de "Artículos relacionados"
 * (ArticleCard.astro) genera DOS <a href="/blog/..."> al mismo destino (la
 * imagen decorativa y el título). Este script cuenta literalmente cada
 * aparición de href, tal y como pide el criterio de éxito de la tarea; por
 * tanto cada aparición en "Artículos relacionados" suma 2 al recuento del
 * destino, y cada bloque "Lectura recomendada" suma 1.
 *
 * Uso: node scripts/contar-enlaces-internos.mjs   (requiere haber ejecutado
 * antes `npm run build`, que genera /dist).
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST_BLOG = path.join(ROOT, 'dist', 'blog');

// Subcarpetas de /dist/blog que NO son páginas de artículo individual.
const NON_ARTICLE_DIRS = new Set(['categoria', 'page']);

function fail(msg) {
  console.error(`\nERROR: ${msg}\n`);
  process.exit(1);
}

if (!existsSync(DIST_BLOG)) {
  fail(
    `No existe ${path.relative(ROOT, DIST_BLOG)}. Ejecuta \`npm run build\` antes de este script.`
  );
}

/** Lista de slugs de artículo publicados, deducida de /dist/blog/<slug>/index.html. */
function getArticleSlugs() {
  const entries = readdirSync(DIST_BLOG, { withFileTypes: true });
  const slugs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (NON_ARTICLE_DIRS.has(entry.name)) continue;
    const indexPath = path.join(DIST_BLOG, entry.name, 'index.html');
    if (existsSync(indexPath) && statSync(indexPath).isFile()) {
      slugs.push(entry.name);
    }
  }
  return slugs.sort((a, b) => a.localeCompare(b));
}

/** Extrae del HTML de una página los bloques de cuerpo que pueden contener
 * enlaces entrantes a otros artículos: asides "Lectura recomendada" y la
 * sección "Artículos relacionados". Devuelve un array de fragmentos HTML. */
function extractBodyLinkBlocks(html) {
  const blocks = [];

  const recoRe = /<aside class="inline-reco">([\s\S]*?)<\/aside>/g;
  let m;
  while ((m = recoRe.exec(html))) {
    blocks.push(m[1]);
  }

  const relatedRe =
    /<section class="border-t border-paper-300 bg-paper-100">([\s\S]*?)<\/section>/g;
  while ((m = relatedRe.exec(html))) {
    // Solo cuenta si de verdad es el bloque "Artículos relacionados"
    // (defensivo: evita falsos positivos si esa clase se reutilizara).
    if (/Art[ií]culos relacionados/.test(m[1])) {
      blocks.push(m[1]);
    }
  }

  return blocks;
}

/** Extrae los slugs de artículo referenciados por <a href="/blog/<slug>"> en un fragmento. */
function extractLinkedSlugs(fragment) {
  const linkRe = /<a\s+href="\/blog\/([a-z0-9-]+)"/g;
  const found = [];
  let m;
  while ((m = linkRe.exec(fragment))) {
    found.push(m[1]);
  }
  return found;
}

function median(numbers) {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function main() {
  const slugs = getArticleSlugs();
  if (slugs.length === 0) {
    fail('No se ha encontrado ninguna página de artículo en /dist/blog.');
  }
  const slugSet = new Set(slugs);

  const incoming = new Map(slugs.map((s) => [s, 0]));

  for (const sourceSlug of slugs) {
    const htmlPath = path.join(DIST_BLOG, sourceSlug, 'index.html');
    const html = readFileSync(htmlPath, 'utf8');
    const blocks = extractBodyLinkBlocks(html);
    for (const block of blocks) {
      const targets = extractLinkedSlugs(block);
      for (const targetSlug of targets) {
        if (targetSlug === sourceSlug) continue; // defensivo: no autoenlaces
        if (!slugSet.has(targetSlug)) continue; // defensivo: solo artículos conocidos
        incoming.set(targetSlug, incoming.get(targetSlug) + 1);
      }
    }
  }

  const rows = slugs
    .map((slug) => ({ slug, url: `/blog/${slug}`, count: incoming.get(slug) }))
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));

  const counts = rows.map((r) => r.count);
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const med = median(counts);
  const zeroCount = counts.filter((c) => c === 0).length;
  const ge25Count = counts.filter((c) => c >= 25).length;

  const urlColWidth = Math.max(...rows.map((r) => r.url.length), 'URL'.length);
  console.log('\nEnlaces internos entrantes por artículo (cuerpo: "Lectura recomendada" + "Artículos relacionados")\n');
  console.log(`${'URL'.padEnd(urlColWidth)}  ENTRANTES`);
  console.log(`${'-'.repeat(urlColWidth)}  ---------`);
  for (const row of rows) {
    console.log(`${row.url.padEnd(urlColWidth)}  ${String(row.count).padStart(9)}`);
  }

  console.log('\nResumen');
  console.log('-------');
  console.log(`URLs de artículo analizadas: ${rows.length}`);
  console.log(`Mínimo:  ${min}`);
  console.log(`Máximo:  ${max}`);
  console.log(`Mediana: ${med}`);
  console.log(`URLs con 0 entrantes:   ${zeroCount}`);
  console.log(`URLs con >=25 entrantes: ${ge25Count}`);
  console.log('');
}

main();
