#!/usr/bin/env node
/**
 * contar-enlaces-internos.mjs
 *
 * Cuenta, tras un `npm run build`, cuántos enlaces internos entrantes recibe
 * cada URL /blog/<slug> desde el CUERPO de otros artículos en /dist.
 *
 * Solo cuentan los enlaces generados por los dos mecanismos de enlazado
 * interno automático dentro del cuerpo del artículo:
 *
 *   1. Bloques "Lectura recomendada" (rehypeInlineBlocks -> recoNode en
 *      src/lib/rehype-plugins.mjs), identificables por
 *      `class="inline-reco__link"`.
 *   2. El componente RelatedArticles ("Artículos relacionados" al final del
 *      artículo), que renderiza ArticleCard. ArticleCard genera DOS <a> por
 *      tarjeta (una imagen decorativa con aria-hidden="true"/tabindex="-1" y
 *      el título). Solo se cuenta el enlace del título, identificado por
 *      `class="text-ink no-underline after:absolute after:inset-0
 *      hover:text-clay-700"`, para no duplicar el conteo por tarjeta.
 *
 * Deliberadamente NO cuenta: navegación/menú, breadcrumbs, footer, enlaces
 * manuales sueltos escritos a mano en el Markdown del artículo, ni enlaces
 * desde páginas que no son artículos (home, /blog, silos de categoría).
 *
 * Uso:
 *   npm run build
 *   node scripts/contar-enlaces-internos.mjs
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST_BLOG_DIR = join(__dirname, '..', 'dist', 'blog');

// Marcadores exactos de los dos bloques de enlazado interno del cuerpo.
const RECO_LINK_RE = /<a\s+href="\/blog\/([a-z0-9-]+)"\s+class="inline-reco__link"/g;
const RELATED_CARD_LINK_RE =
  /<a\s+href="\/blog\/([a-z0-9-]+)"\s+class="text-ink no-underline after:absolute after:inset-0 hover:text-clay-700"/g;

// Marcador único del wrapper que envuelve el <slot/> del cuerpo del
// artículo en src/layouts/BlogPost.astro. Sirve para distinguir páginas de
// artículo real de otras rutas bajo /blog/<algo>/ (paginación, silos de
// categoría, etc.) sin necesidad de listar exclusiones por nombre.
const ARTICLE_BODY_MARKER = 'class="prose prose-lg mx-auto mt-8 prose-a:font-medium"';

function findArticleSlugs() {
  if (!existsSync(DIST_BLOG_DIR)) {
    console.error(
      'No existe dist/blog. Ejecuta `npm run build` antes de correr este script.'
    );
    process.exit(1);
  }
  return readdirSync(DIST_BLOG_DIR)
    .filter((name) => {
      const dir = join(DIST_BLOG_DIR, name);
      const indexPath = join(dir, 'index.html');
      if (!statSync(dir).isDirectory() || !existsSync(indexPath)) return false;
      const html = readFileSync(indexPath, 'utf8');
      return html.includes(ARTICLE_BODY_MARKER);
    })
    .sort();
}

function countInboundLinks(slugs) {
  const counts = new Map(slugs.map((slug) => [slug, 0]));
  const details = new Map(slugs.map((slug) => [slug, { reco: 0, related: 0 }]));

  for (const sourceSlug of slugs) {
    const html = readFileSync(
      join(DIST_BLOG_DIR, sourceSlug, 'index.html'),
      'utf8'
    );

    for (const re of [RECO_LINK_RE, RELATED_CARD_LINK_RE]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(html)) !== null) {
        const targetSlug = m[1];
        // Solo contamos enlaces ENTRANTES desde OTROS artículos.
        if (targetSlug === sourceSlug) continue;
        if (!counts.has(targetSlug)) continue; // enlace a URL fuera del set de artículos actuales
        counts.set(targetSlug, counts.get(targetSlug) + 1);
        const d = details.get(targetSlug);
        if (re === RECO_LINK_RE) d.reco++;
        else d.related++;
      }
    }
  }

  return { counts, details };
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
  const slugs = findArticleSlugs();
  const { counts, details } = countInboundLinks(slugs);

  const rows = slugs
    .map((slug) => ({
      url: `/blog/${slug}`,
      total: counts.get(slug),
      reco: details.get(slug).reco,
      related: details.get(slug).related,
    }))
    .sort((a, b) => b.total - a.total || a.url.localeCompare(b.url));

  const totals = rows.map((r) => r.total);
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  const med = median(totals);
  const zeroCount = totals.filter((t) => t === 0).length;

  const urlWidth = Math.max(...rows.map((r) => r.url.length), 'URL'.length);
  const header = `${'URL'.padEnd(urlWidth)}  TOTAL  reco  related`;
  console.log(header);
  console.log('-'.repeat(header.length));
  for (const r of rows) {
    console.log(
      `${r.url.padEnd(urlWidth)}  ${String(r.total).padStart(5)}  ${String(
        r.reco
      ).padStart(4)}  ${String(r.related).padStart(7)}`
    );
  }

  console.log('');
  console.log(`Artículos analizados: ${rows.length}`);
  console.log(`Mínimo de entrantes:  ${min}`);
  console.log(`Máximo de entrantes:  ${max}`);
  console.log(`Mediana de entrantes: ${med}`);
  console.log(`URLs con 0 entrantes: ${zeroCount}`);
}

main();
