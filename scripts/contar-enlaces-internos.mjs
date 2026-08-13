#!/usr/bin/env node
/**
 * scripts/contar-enlaces-internos.mjs
 *
 * Mide, sobre el HTML ya generado en /dist, cuántos enlaces internos
 * ENTRANTES recibe cada artículo del blog (/blog/<slug>) desde el CUERPO de
 * otros artículos: exclusivamente los bloques "Lectura recomendada"
 * (<aside class="inline-reco">, insertados por rehypeInlineBlocks en
 * src/lib/rehype-plugins.mjs) y "Artículos relacionados" (componente
 * RelatedArticles.astro / ArticleCard.astro).
 *
 * NO cuenta enlaces de navegación, migas de pan, footer, CTA de
 * asesoramiento ni el enlace "← Volver al blog": solo los dos bloques
 * anteriores, que son los que decide el algoritmo de enlazado interno que
 * se quiere auditar (línea base para seo-011).
 *
 * Uso:
 *   npm run build
 *   node scripts/contar-enlaces-internos.mjs
 *
 * Sin dependencias externas: parseo con expresiones regulares ad-hoc sobre
 * los patrones fijos que producen los componentes citados arriba.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST_BLOG_DIR = join(process.cwd(), 'dist', 'blog');

// Directorios de /dist/blog que no son artículos individuales.
const NON_ARTICLE_DIRS = new Set(['categoria', 'page']);

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (!existsSync(DIST_BLOG_DIR)) {
  fail(
    'No existe dist/blog. Ejecuta primero "npm run build" y vuelve a lanzar este script.'
  );
}

/** Lista de slugs de artículo publicados, según lo que build generó en /dist. */
function getArticleSlugs() {
  return readdirSync(DIST_BLOG_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !NON_ARTICLE_DIRS.has(entry.name))
    .map((entry) => entry.name)
    .sort();
}

/** Extrae del HTML completo únicamente los fragmentos correspondientes a los
 * bloques de "Lectura recomendada" (<aside class="inline-reco">...</aside>)
 * y a la sección "Artículos relacionados" (RelatedArticles.astro). */
function extractInternalLinkBlocks(html) {
  const blocks = [];

  // 1) Bloques "Lectura recomendada" (uno o varios por artículo).
  const recoRe = /<aside class="inline-reco">[\s\S]*?<\/aside>/g;
  for (const match of html.matchAll(recoRe)) {
    blocks.push(match[0]);
  }

  // 2) Sección "Artículos relacionados" (como mucho una por artículo). Se
  //    localiza el <section> que contiene el h2 correspondiente y se toma
  //    todo su contenido hasta el </section> siguiente (RelatedArticles no
  //    anida más <section>).
  const relatedMarker = 'Artículos relacionados</h2>';
  const markerIdx = html.indexOf(relatedMarker);
  if (markerIdx !== -1) {
    const sectionStart = html.lastIndexOf('<section', markerIdx);
    const sectionEnd = html.indexOf('</section>', markerIdx);
    if (sectionStart !== -1 && sectionEnd !== -1) {
      blocks.push(html.slice(sectionStart, sectionEnd + '</section>'.length));
    }
  }

  return blocks;
}

/** De un fragmento de HTML, extrae los slugs enlazados vía href="/blog/<slug>". */
function extractLinkedSlugs(fragmentHtml) {
  const hrefRe = /href="\/blog\/([a-z0-9-]+)"/g;
  const slugs = [];
  for (const match of fragmentHtml.matchAll(hrefRe)) {
    slugs.push(match[1]);
  }
  return slugs;
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function main() {
  const slugs = getArticleSlugs();
  if (slugs.length === 0) {
    fail('No se ha encontrado ningún artículo en dist/blog.');
  }

  const inbound = new Map(slugs.map((slug) => [slug, 0]));

  for (const sourceSlug of slugs) {
    const htmlPath = join(DIST_BLOG_DIR, sourceSlug, 'index.html');
    if (!statSync(htmlPath, { throwIfNoEntry: false })) continue;
    const html = readFileSync(htmlPath, 'utf8');

    const blocks = extractInternalLinkBlocks(html);
    for (const block of blocks) {
      for (const targetSlug of extractLinkedSlugs(block)) {
        if (targetSlug === sourceSlug) continue; // defensivo: nunca se autoenlaza
        if (!inbound.has(targetSlug)) {
          // Enlace a un slug que no está en dist/blog (no debería ocurrir).
          inbound.set(targetSlug, 0);
        }
        inbound.set(targetSlug, inbound.get(targetSlug) + 1);
      }
    }
  }

  const rows = [...inbound.entries()]
    .map(([slug, count]) => ({ url: `/blog/${slug}`, entrantes: count }))
    .sort((a, b) => b.entrantes - a.entrantes || a.url.localeCompare(b.url));

  const counts = rows.map((r) => r.entrantes);
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const med = median(counts);
  const ceros = counts.filter((c) => c === 0).length;

  const urlWidth = Math.max(...rows.map((r) => r.url.length), 'URL'.length);
  console.log('\nEnlaces internos entrantes por artículo (cuerpo: "Lectura recomendada" + "Artículos relacionados")\n');
  console.log(`${'URL'.padEnd(urlWidth)}  ENTRANTES`);
  console.log(`${'-'.repeat(urlWidth)}  ---------`);
  for (const row of rows) {
    console.log(`${row.url.padEnd(urlWidth)}  ${String(row.entrantes).padStart(9)}`);
  }

  console.log('\nResumen');
  console.log('-------');
  console.log(`Artículos analizados : ${rows.length}`);
  console.log(`Mínimo entrantes     : ${min}`);
  console.log(`Máximo entrantes     : ${max}`);
  console.log(`Mediana entrantes    : ${med}`);
  console.log(`Artículos con 0      : ${ceros}`);
  console.log('');
}

main();
