#!/usr/bin/env node
/**
 * Audita el "conjunto money" (las URLs que concentran el volumen de búsqueda
 * declarado del proyecto) sobre /dist, sin depender de Search Console.
 *
 * Requiere haber ejecutado `npm run build` antes.
 *
 * Uso:
 *   npm run build
 *   node scripts/auditar-money-set.mjs
 *
 * Definición operativa del conjunto money (ver scripts/ESTRATEGIA.md,
 * "Objetivo del ciclo"): `/simulador` más los artículos publicados cuya
 * `keyword` en scripts/calendario.json declara >= 5.000 búsq./mes. Se lee
 * SIEMPRE en modo solo lectura: este script nunca escribe en calendario.json
 * ni en ningún artículo. El conjunto se recalcula solo, no se mantiene a mano.
 *
 * Para cada URL del conjunto money se imprime:
 *   - palabras en <main> (incluye el texto visible más los `placeholder`
 *     de los campos vacíos del formulario, porque eso es lo que ve un
 *     usuario real con JavaScript desactivado o antes de rellenar el form).
 *   - enlaces internos entrantes: nº de páginas DISTINTAS de todo /dist que
 *     contienen un <a href="URL"> hacia ella (incluye nav/footer y cuerpo).
 *   - canonical declarado.
 *   - tipos de JSON-LD de nivel superior presentes en la página (uno o más
 *     <script type="application/ld+json"> por Base.astro).
 *   - si otra URL indexable del sitemap declara su misma keyword exacta.
 *
 * Además se recorre TODO el sitemap para localizar pares de URLs que
 * compiten por la misma keyword ("canibalización"), con dos reglas:
 *   1) Entre artículos de blog publicados: coincidencia EXACTA (normalizada)
 *      del campo `keyword` de scripts/calendario.json.
 *   2) Entre una página estática (no artículo, ej. /simulador) y un
 *      artículo publicado: se considera que la estática "declara" la
 *      keyword del artículo cuando (a) todas las palabras significativas
 *      de esa keyword están presentes en el <title> de la estática, Y
 *      (b) alguna palabra del propio slug de la URL estática aparece
 *      dentro de esa keyword. La doble condición evita falsos positivos
 *      con keywords genéricas (ej. "jubilacion anticipada") que aparecen
 *      como subcadena en decenas de títulos sin que compitan de verdad.
 *
 * Código de salida 1 si alguna URL del conjunto money tiene menos de 1.200
 * palabras en <main>, o si comparte keyword con otra URL indexable del
 * sitemap. Código de salida 0 en caso contrario.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const DIST_DIR = join(ROOT, 'dist');
const CALENDARIO_PATH = join(ROOT, 'scripts', 'calendario.json');
const DATOS_DIR = join(ROOT, 'scripts', 'datos');

const VOLUMEN_MINIMO_MONEY = 5000;
const PALABRAS_MINIMAS = 1200;

// ---------------------------------------------------------------------------
// Utilidades de normalización de texto (acentos, minúsculas, stopwords).
// ---------------------------------------------------------------------------

const STOPWORDS = new Set([
  'de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'y', 'o', 'que', 'para', 'con', 'en', 'a', 'al', 'tu', 'su', 'es',
  'como', 'cómo', 'qué',
]);

function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function normalizeText(s) {
  return stripAccents(s).toLowerCase().trim().replace(/\s+/g, ' ');
}

function wordSet(s) {
  return new Set(
    normalizeText(s)
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .filter((w) => !STOPWORDS.has(w))
  );
}

// ---------------------------------------------------------------------------
// Comprobaciones previas.
// ---------------------------------------------------------------------------

if (!existsSync(DIST_DIR)) {
  console.error(
    'No existe dist/. Ejecuta `npm run build` antes de correr este script.'
  );
  process.exit(1);
}

if (!existsSync(CALENDARIO_PATH)) {
  console.error('No existe scripts/calendario.json.');
  process.exit(1);
}

const calendario = JSON.parse(readFileSync(CALENDARIO_PATH, 'utf-8'));
const articulos = calendario.articulos ?? [];

// ---------------------------------------------------------------------------
// Sitemap: lista de URLs indexables (fuente de verdad de "qué está vivo").
// ---------------------------------------------------------------------------

function readAllLocsFromSitemapFile(file) {
  const xml = readFileSync(file, 'utf-8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function loadSitemapUrlPaths() {
  const indexFile = join(DIST_DIR, 'sitemap-index.xml');
  if (!existsSync(indexFile)) {
    console.error(
      'No existe dist/sitemap-index.xml (¿está activo @astrojs/sitemap?).'
    );
    process.exit(1);
  }
  const subSitemaps = readAllLocsFromSitemapFile(indexFile);
  const locs = [];
  for (const url of subSitemaps) {
    const fileName = url.split('/').pop();
    const subFile = join(DIST_DIR, fileName);
    if (existsSync(subFile)) {
      locs.push(...readAllLocsFromSitemapFile(subFile));
    }
  }
  const paths = locs.map((u) => {
    const p = new URL(u).pathname;
    return p === '/' ? '/' : p.replace(/\/$/, '');
  });
  return [...new Set(paths)];
}

const sitemapUrlPaths = loadSitemapUrlPaths();

// ---------------------------------------------------------------------------
// dist/: mapa urlPath -> fichero HTML, y listado completo de ficheros HTML
// (para el conteo de enlaces internos entrantes, que mira todo /dist, no
// solo las URLs del sitemap).
// ---------------------------------------------------------------------------

function walkHtmlFiles(dir) {
  let out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walkHtmlFiles(full));
    else if (entry.name === 'index.html') out.push(full);
  }
  return out;
}

const allHtmlFiles = walkHtmlFiles(DIST_DIR);

function urlPathToFile(urlPath) {
  const rel = urlPath === '/' ? 'index.html' : join(urlPath.replace(/^\//, ''), 'index.html');
  return join(DIST_DIR, rel);
}

function readHtmlFor(urlPath) {
  const file = urlPathToFile(urlPath);
  if (!existsSync(file)) return null;
  return readFileSync(file, 'utf-8');
}

// ---------------------------------------------------------------------------
// Conjunto money: derivado en modo solo lectura de scripts/calendario.json.
// ---------------------------------------------------------------------------

const moneySet = [
  {
    tipo: 'estatica',
    urlPath: '/simulador',
    slug: 'simulador',
    keyword: null,
    volumen: null,
  },
];

const pendientesNoPublicados = [];

for (const art of articulos) {
  if ((art.volumen ?? 0) < VOLUMEN_MINIMO_MONEY) continue;
  if (!art.publicado) {
    pendientesNoPublicados.push(art);
    continue;
  }
  moneySet.push({
    tipo: 'articulo',
    urlPath: `/blog/${art.slug}`,
    slug: art.slug,
    keyword: art.keyword,
    volumen: art.volumen,
  });
}

// Índice slug -> keyword de TODOS los artículos publicados (para las
// comprobaciones de canibalización, que recorren todo el sitemap, no solo
// el conjunto money).
const publicados = articulos.filter((a) => a.publicado);
const keywordPorSlug = new Map(publicados.map((a) => [a.slug, a.keyword]));

// ---------------------------------------------------------------------------
// Métricas por URL.
// ---------------------------------------------------------------------------

function extractMain(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  return m ? m[1] : null;
}

/**
 * Cuenta palabras visibles dentro de <main>: el texto entre etiquetas más
 * los `placeholder` de campos vacíos (visibles para un usuario real aunque
 * no haya rellenado el formulario). Excluye <script> y <style>.
 */
function countWordsInMain(mainHtml) {
  let clean = mainHtml
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '');
  const placeholders = [...clean.matchAll(/placeholder="([^"]*)"/g)].map(
    (m) => m[1]
  );
  const bodyText = clean.replace(/<[^>]+>/g, ' ');
  const bodyWords = bodyText.split(/\s+/).filter(Boolean);
  const placeholderWords = placeholders.join(' ').split(/\s+/).filter(Boolean);
  return bodyWords.length + placeholderWords.length;
}

function countH1(html) {
  return (html.match(/<h1[\s>]/g) ?? []).length;
}

/** Enlaces internos entrantes: nº de ficheros DISTINTOS de /dist (excluido
 * el propio) que contienen un <a href="urlPath[/]"> hacia esta URL. */
function countInboundLinks(urlPath) {
  const escaped = urlPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`href="${escaped}/?"`);
  const ownFile = urlPathToFile(urlPath);
  let count = 0;
  for (const file of allHtmlFiles) {
    if (file === ownFile) continue;
    const html = readFileSync(file, 'utf-8');
    if (re.test(html)) count++;
  }
  return count;
}

function extractCanonical(html) {
  const m = html.match(/rel="canonical"\s+href="([^"]+)"/);
  return m ? m[1] : null;
}

/** Tipos @type de nivel superior de cada <script type="application/ld+json">
 * (Base.astro emite un <script> por entidad, así que no hace falta bajar a
 * los objetos anidados). */
function extractJsonLdTypes(html) {
  const scripts = [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    ),
  ].map((m) => m[1]);
  const types = [];
  for (const raw of scripts) {
    try {
      const parsed = JSON.parse(raw);
      const t = parsed['@type'];
      if (Array.isArray(t)) types.push(...t);
      else if (t) types.push(t);
    } catch {
      types.push('(JSON-LD inválido)');
    }
  }
  return [...new Set(types)];
}

// ---------------------------------------------------------------------------
// Canibalización: 1) exacta entre artículos publicados; 2) especial para
// páginas estáticas del sitemap (ej. /simulador) frente a artículos
// publicados. Se recorre TODO el sitemap, no solo el conjunto money.
// ---------------------------------------------------------------------------

function readTitle(urlPath) {
  const html = readHtmlFor(urlPath);
  if (!html) return null;
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/);
  const head = headMatch ? headMatch[1] : html;
  const t = head.match(/<title>([^<]*)<\/title>/);
  if (!t) return '';
  return t[1].replace(/\s*\|\s*Tu Jubilación Anticipada\s*$/, '');
}

const paresCanibalizados = [];

// Regla 1: coincidencia exacta de keyword entre artículos publicados.
const porKeyword = new Map();
for (const art of publicados) {
  const k = normalizeText(art.keyword);
  if (!porKeyword.has(k)) porKeyword.set(k, []);
  porKeyword.get(k).push(art);
}
for (const [k, arts] of porKeyword) {
  if (arts.length < 2) continue;
  for (let i = 0; i < arts.length; i++) {
    for (let j = i + 1; j < arts.length; j++) {
      paresCanibalizados.push({
        urlA: `/blog/${arts[i].slug}`,
        urlB: `/blog/${arts[j].slug}`,
        keyword: arts[i].keyword,
        regla: 'keyword exacta (calendario.json)',
      });
    }
  }
}

// Regla 2: páginas estáticas (no artículo) del sitemap frente a artículos
// publicados, por coincidencia de título + palabra del slug.
const blogUrlPaths = new Set(publicados.map((a) => `/blog/${a.slug}`));
const staticIndexableUrls = sitemapUrlPaths.filter(
  (p) => !blogUrlPaths.has(p) && !p.startsWith('/blog/')
);

for (const staticUrl of staticIndexableUrls) {
  const title = readTitle(staticUrl);
  if (!title) continue;
  const titleWords = wordSet(title);
  const lastSegment = staticUrl.split('/').filter(Boolean).pop() || 'inicio';
  const slugWords = wordSet(lastSegment.replace(/-/g, ' '));
  for (const art of publicados) {
    const kw = wordSet(art.keyword);
    if (kw.size === 0) continue;
    const kwEsSubconjuntoDelTitulo = [...kw].every((w) => titleWords.has(w));
    const slugAparaceEnKeyword = [...slugWords].some((w) => kw.has(w));
    if (kwEsSubconjuntoDelTitulo && slugAparaceEnKeyword) {
      paresCanibalizados.push({
        urlA: staticUrl,
        urlB: `/blog/${art.slug}`,
        keyword: art.keyword,
        regla:
          'título de página estática declara la keyword de un artículo (heurística slug+título)',
      });
    }
  }
}

function urlEstaEnPar(urlPath) {
  return paresCanibalizados.filter(
    (p) => p.urlA === urlPath || p.urlB === urlPath
  );
}

// ---------------------------------------------------------------------------
// GSC (opcional): scripts/datos/*.csv con impresiones/clics/posición.
// ---------------------------------------------------------------------------

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map((h) => normalizeText(h));
  return lines.slice(1).map((line) => {
    const cols = line.split(',');
    const row = {};
    headers.forEach((h, i) => (row[h] = (cols[i] ?? '').trim()));
    return row;
  });
}

function findColumn(row, candidates) {
  for (const c of candidates) {
    if (c in row) return row[c];
  }
  return undefined;
}

function loadGscData() {
  if (!existsSync(DATOS_DIR)) return { disponible: false, filas: [] };
  const csvFiles = readdirSync(DATOS_DIR).filter((f) => f.endsWith('.csv'));
  if (csvFiles.length === 0) return { disponible: false, filas: [] };
  let filas = [];
  for (const f of csvFiles) {
    const text = readFileSync(join(DATOS_DIR, f), 'utf-8');
    filas = filas.concat(parseCsv(text));
  }
  return { disponible: true, filas };
}

function buscarGscPara(urlPath, gsc) {
  if (!gsc.disponible) return { impresiones: 0, clics: 0, posicion: 0 };
  const row = gsc.filas.find((r) => {
    const pagina = findColumn(r, ['pagina', 'página', 'page', 'url']) ?? '';
    return pagina.includes(urlPath);
  });
  if (!row) return { impresiones: 0, clics: 0, posicion: 0 };
  return {
    impresiones: Number(
      findColumn(row, ['impresiones', 'impressions']) ?? 0
    ),
    clics: Number(findColumn(row, ['clics', 'clicks']) ?? 0),
    posicion: Number(
      findColumn(row, ['posicion', 'posición', 'position']) ?? 0
    ),
  };
}

const gsc = loadGscData();

// ---------------------------------------------------------------------------
// Salida.
// ---------------------------------------------------------------------------

console.log('Auditoría del conjunto money — tujubilacionanticipada.com');
console.log(
  `Conjunto money derivado de scripts/calendario.json (>= ${VOLUMEN_MINIMO_MONEY.toLocaleString('es-ES')} búsq./mes) + /simulador.\n`
);

if (pendientesNoPublicados.length > 0) {
  console.log(
    `Nota: ${pendientesNoPublicados.length} artículo(s) con volumen >= ${VOLUMEN_MINIMO_MONEY} aún NO publicados (excluidos hoy del conjunto money; se incorporarán solos cuando publicado=true):`
  );
  for (const p of pendientesNoPublicados) {
    console.log(
      `  - ${p.slug} — keyword "${p.keyword}", ${p.volumen}/mes, fecha ${p.fecha}`
    );
  }
  console.log('');
}

if (!gsc.disponible) {
  console.log(
    'No existe scripts/datos/*.csv con export de Search Console. Impresiones/clics/posición se reportan a 0.\n'
  );
} else {
  console.log(
    `scripts/datos/*.csv encontrado: cruzando impresiones/clics/posición por URL.\n`
  );
}

const filas = [];
let huboFallo = false;

for (const money of moneySet) {
  const html = readHtmlFor(money.urlPath);
  if (!html) {
    console.log(
      `AVISO: ${money.urlPath} está en el conjunto money pero no existe en /dist. ¿build incompleto?`
    );
    huboFallo = true;
    continue;
  }
  const mainHtml = extractMain(html);
  const palabras = mainHtml ? countWordsInMain(mainHtml) : 0;
  if (!mainHtml) {
    console.log(`AVISO: ${money.urlPath} no tiene <main> en el HTML.`);
  }
  const h1s = countH1(html);
  const entrantes = countInboundLinks(money.urlPath);
  const canonical = extractCanonical(html);
  const jsonLdTypes = extractJsonLdTypes(html);
  const pares = urlEstaEnPar(money.urlPath);
  const g = buscarGscPara(money.urlPath, gsc);

  const insuficiente = palabras < PALABRAS_MINIMAS;
  const canibalizada = pares.length > 0;
  if (insuficiente || canibalizada) huboFallo = true;

  filas.push({
    urlPath: money.urlPath,
    keyword: money.keyword ?? '(sin keyword propia — página estática)',
    volumen: money.volumen ?? '—',
    palabras,
    h1s,
    entrantes,
    canonical: canonical ?? '(sin canonical)',
    jsonLdTypes: jsonLdTypes.join(', ') || '(sin JSON-LD)',
    duplicaCon:
      pares.length > 0
        ? pares.map((p) => (p.urlA === money.urlPath ? p.urlB : p.urlA)).join(', ')
        : '(ninguna)',
    insuficiente,
    canibalizada,
    impresiones: g.impresiones,
    clics: g.clics,
    posicion: g.posicion,
  });
}

console.log('=== Conjunto money (' + moneySet.length + ' URLs) ===\n');

for (const f of filas) {
  console.log(`URL: ${f.urlPath}`);
  console.log(`  Keyword:                ${f.keyword}${f.volumen !== '—' ? ` (${f.volumen}/mes)` : ''}`);
  console.log(
    `  Palabras en <main>:     ${f.palabras}${f.insuficiente ? '  <-- INSUFICIENTE (< ' + PALABRAS_MINIMAS + ')' : ''}`
  );
  console.log(`  H1 en la página:        ${f.h1s}${f.h1s !== 1 ? '  <-- revisar (se espera 1)' : ''}`);
  console.log(`  Enlaces entrantes:      ${f.entrantes}`);
  console.log(`  Canonical:              ${f.canonical}`);
  console.log(`  Tipos JSON-LD:          ${f.jsonLdTypes}`);
  console.log(
    `  Comparte keyword con:   ${f.duplicaCon}${f.canibalizada ? '  <-- CANIBALIZADA' : ''}`
  );
  console.log(
    `  GSC (impr./clics/pos.): ${f.impresiones} / ${f.clics} / ${f.posicion}`
  );
  console.log('');
}

console.log(`=== Pares canibalizados (recorrido completo del sitemap, ${sitemapUrlPaths.length} URLs indexables) ===\n`);
if (paresCanibalizados.length === 0) {
  console.log('  Ninguno.\n');
} else {
  for (const p of paresCanibalizados) {
    console.log(`  ${p.urlA}  <->  ${p.urlB}`);
    console.log(`    keyword: "${p.keyword}"`);
    console.log(`    regla:   ${p.regla}\n`);
  }
}

console.log('=== Resumen ===');
console.log(`Total pares canibalizados: ${paresCanibalizados.length}`);
console.log(
  `URLs del conjunto money con < ${PALABRAS_MINIMAS} palabras: ${filas.filter((f) => f.insuficiente).map((f) => f.urlPath).join(', ') || 'ninguna'}`
);
console.log(
  `URLs del conjunto money canibalizadas: ${filas.filter((f) => f.canibalizada).map((f) => f.urlPath).join(', ') || 'ninguna'}`
);

if (huboFallo) {
  console.log(
    '\nResultado: FALLO. Al menos una URL del conjunto money no cumple unicidad y/o suficiencia.'
  );
  process.exit(1);
} else {
  console.log('\nResultado: OK. Unicidad y suficiencia cumplidas en todo el conjunto money.');
  process.exit(0);
}
