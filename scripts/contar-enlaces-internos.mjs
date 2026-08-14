#!/usr/bin/env node
/**
 * Cuenta enlaces internos ENTRANTES a cada artículo del blog (/blog/<slug>)
 * originados en el CUERPO de otros artículos: los bloques "Lectura
 * recomendada" (rehypeInlineBlocks -> <aside class="inline-reco">) y el
 * componente "Artículos relacionados" (RelatedArticles.astro).
 *
 * Requiere haber ejecutado `npm run build` antes (lee dist/blog/<slug>/index.html).
 *
 * Uso:
 *   npm run build
 *   node scripts/contar-enlaces-internos.mjs
 *
 * Metodología de conteo: para cada artículo ORIGEN se calcula el conjunto
 * (sin duplicados) de slugs DESTINO enlazados desde sus bloques de
 * "Lectura recomendada" y "Artículos relacionados". Cada slug destino suma
 * +1 por cada artículo origen distinto que lo enlaza (in-degree = nº de
 * artículos que enlazan a él), no el nº bruto de etiquetas <a>. Esto evita
 * que un mismo artículo relacionado cuente doble solo porque la tarjeta
 * (ArticleCard) tiene dos <a> (imagen + título) apuntando a la misma URL.
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST_BLOG_DIR = join(process.cwd(), 'dist', 'blog');

if (!existsSync(DIST_BLOG_DIR)) {
  console.error(
    'No existe dist/blog. Ejecuta `npm run build` antes de correr este script.'
  );
  process.exit(1);
}

// Directorios de artículo real: excluye índices de listado (categoria, page).
const EXCLUDED_DIRS = new Set(['categoria', 'page']);

function articleSlugs() {
  return readdirSync(DIST_BLOG_DIR).filter((name) => {
    if (EXCLUDED_DIRS.has(name)) return false;
    const full = join(DIST_BLOG_DIR, name);
    if (!statSync(full).isDirectory()) return false;
    return existsSync(join(full, 'index.html'));
  });
}

function readArticleHtml(slug) {
  return readFileSync(join(DIST_BLOG_DIR, slug, 'index.html'), 'utf-8');
}

/** Extrae los slugs destino de los bloques "Lectura recomendada" (inline-reco). */
function extractRecoTargets(html) {
  const targets = [];
  const re = /<a href="\/blog\/([a-z0-9-]+)" class="inline-reco__link">/g;
  let m;
  while ((m = re.exec(html))) targets.push(m[1]);
  return targets;
}

/** Extrae los slugs destino de la sección "Artículos relacionados" (RelatedArticles). */
function extractRelatedTargets(html) {
  const start = html.indexOf(
    '<section class="border-t border-paper-300 bg-paper-100">'
  );
  if (start === -1) return [];
  const end = html.indexOf('</section>', start);
  if (end === -1) return [];
  const section = html.slice(start, end);
  const targets = [];
  const re = /href="\/blog\/([a-z0-9-]+)"/g;
  let m;
  while ((m = re.exec(section))) targets.push(m[1]);
  return targets;
}

function median(sortedNumbers) {
  const n = sortedNumbers.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 === 0
    ? (sortedNumbers[mid - 1] + sortedNumbers[mid]) / 2
    : sortedNumbers[mid];
}

function main() {
  const slugs = articleSlugs();
  const inbound = new Map(slugs.map((s) => [s, 0]));

  for (const sourceSlug of slugs) {
    const html = readArticleHtml(sourceSlug);
    const recoTargets = extractRecoTargets(html);
    const relatedTargets = extractRelatedTargets(html);
    const uniqueTargets = new Set([...recoTargets, ...relatedTargets]);
    uniqueTargets.delete(sourceSlug); // ignora autoenlaces si los hubiera
    for (const target of uniqueTargets) {
      if (inbound.has(target)) {
        inbound.set(target, inbound.get(target) + 1);
      } else {
        // Destino fuera del conjunto de artículos detectados (no debería
        // ocurrir salvo build parcial); se reporta igualmente.
        inbound.set(target, 1);
      }
    }
  }

  const rows = [...inbound.entries()].sort((a, b) => b[1] - a[1]);
  const counts = rows.map(([, c]) => c).sort((a, b) => a - b);

  const min = counts.length ? counts[0] : 0;
  const max = counts.length ? counts[counts.length - 1] : 0;
  const med = median(counts);
  const zeroCount = counts.filter((c) => c === 0).length;

  const urlWidth = Math.max(
    ...rows.map(([slug]) => `/blog/${slug}`.length),
    20
  );

  console.log(
    'Enlaces internos entrantes por artículo (cuerpo: "Lectura recomendada" + "Artículos relacionados")'
  );
  console.log(`Total artículos analizados: ${rows.length}\n`);
  console.log(`${'URL'.padEnd(urlWidth)}  ENTRANTES`);
  console.log('-'.repeat(urlWidth + 12));
  for (const [slug, count] of rows) {
    console.log(`${`/blog/${slug}`.padEnd(urlWidth)}  ${count}`);
  }

  console.log('\nResumen:');
  console.log(`  Mínimo:  ${min}`);
  console.log(`  Máximo:  ${max}`);
  console.log(`  Mediana: ${med}`);
  console.log(`  Artículos con 0 entrantes: ${zeroCount} de ${rows.length}`);
}

main();
