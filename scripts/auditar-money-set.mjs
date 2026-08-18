#!/usr/bin/env node
/**
 * Auditoría del "conjunto money" sobre /dist — línea de base objetiva y
 * repetible del diagnóstico que hoy solo existe como medición manual del CEO
 * en scripts/ESTRATEGIA.md.
 *
 * Requiere haber ejecutado `npm run build` antes (lee /dist).
 *
 * Uso:
 *   npm run build
 *   node scripts/auditar-money-set.mjs
 *
 * QUÉ HACE
 * --------
 * 1. Deriva el "conjunto money" leyendo scripts/calendario.json en modo
 *    SOLO LECTURA (nunca se escribe en ese fichero): `/simulador` + toda URL
 *    de artículo publicado (`publicado: true`) cuya `keyword` declare
 *    >= 5.000 búsq./mes. El conjunto se recalcula solo; no se mantiene a mano.
 * 2. Para cada URL del conjunto, mide sobre el HTML ya construido en /dist:
 *      - palabras "únicas" (propias de la página, no de plantilla) dentro de
 *        <main>: se cuenta el texto visible y el valor de los atributos
 *        `placeholder` (contenido visible en pantalla aunque no sea un nodo
 *        de texto del DOM), y se descarta el contenido de <script>/<style>
 *        para no contar JS/CSS minificado como si fuera prosa.
 *      - enlaces internos entrantes: nº de páginas ORIGEN distintas en todo
 *        /dist (incluidas páginas no indexables como paginación y
 *        categorías) que contienen al menos un <a href> hacia esa URL. Es
 *        in-degree por página, no recuento bruto de etiquetas <a> (mismo
 *        criterio que scripts/contar-enlaces-internos.mjs).
 *      - el <link rel="canonical"> declarado.
 *      - los tipos @type de nivel superior presentes en los bloques
 *        <script type="application/ld+json"> de la página.
 *      - si otra URL indexable del sitemap declara su misma keyword exacta.
 * 3. Recorre TODO el sitemap (dist/sitemap-0.xml) buscando pares de URLs
 *    indexables que declaren la misma keyword exacta (canibalización), no
 *    solo dentro del conjunto money.
 *      - Para artículos del blog, la keyword es el campo `keyword` de
 *        calendario.json.
 *      - `/simulador` no es un artículo y no tiene campo `keyword` propio en
 *        calendario.json. Su consulta objetivo se localiza por dato, no se
 *        hardcodea el texto completo: es el (único) artículo publicado cuya
 *        keyword contiene el token "simulador", que es literalmente el slug
 *        de la propia URL. Así lo documenta scripts/ESTRATEGIA.md. Si en el
 *        futuro hay 0 o >1 candidatos, el script avisa y omite el cruce en
 *        vez de adivinar.
 * 4. Si existe scripts/datos/*.csv (export de Search Console: columnas tipo
 *    Page/Impressions/Clicks/Position o sus equivalentes en español), lo
 *    cruza por URL e imprime impresiones/clics/posición. Si no existe, lo
 *    dice por consola y usa 0 — sin depender de Search Console para nada del
 *    resultado "antes" ni del código de salida.
 *
 * CÓDIGO DE SALIDA
 * -----------------
 * 1 si alguna URL del conjunto money tiene <1.200 palabras únicas en <main>
 * o comparte keyword con otra URL indexable del sitemap. 0 en caso contrario.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const DIST_DIR = join(ROOT, 'dist');
const CALENDARIO_PATH = join(ROOT, 'scripts', 'calendario.json');
const DATOS_DIR = join(ROOT, 'scripts', 'datos');
const SITEMAP_PATH = join(DIST_DIR, 'sitemap-0.xml');

const UMBRAL_VOLUMEN = 5000;
const MIN_PALABRAS = 1200;

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

if (!existsSync(DIST_DIR)) {
  fail('No existe dist/. Ejecuta `npm run build` antes de correr este script.');
}
if (!existsSync(CALENDARIO_PATH)) {
  fail('No existe scripts/calendario.json.');
}
if (!existsSync(SITEMAP_PATH)) {
  fail('No existe dist/sitemap-0.xml. ¿Falta @astrojs/sitemap o falló el build?');
}

const calendario = JSON.parse(readFileSync(CALENDARIO_PATH, 'utf-8'));
const SITE_URL = `https://${calendario.config.site}`;

// ---------------------------------------------------------------------------
// Utilidades de texto
// ---------------------------------------------------------------------------

function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function normalizeKeyword(s) {
  return stripAccents(s).toLowerCase().trim().replace(/\s+/g, ' ');
}

const STOPWORDS = new Set([
  'de', 'del', 'la', 'el', 'los', 'las', 'y', 'en', 'con', 'para', 'a', 'que', 'al',
]);

function tokenize(s) {
  return normalizeKeyword(s)
    .split(/[\s-]+/)
    .filter((t) => t && !STOPWORDS.has(t));
}

const HTML_ENTITIES = {
  '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&#39;': "'", '&apos;': "'",
  '&aacute;': 'á', '&eacute;': 'é', '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú',
  '&Aacute;': 'Á', '&Eacute;': 'É', '&Iacute;': 'Í', '&Oacute;': 'Ó', '&Uacute;': 'Ú',
  '&ntilde;': 'ñ', '&Ntilde;': 'Ñ', '&uuml;': 'ü', '&Uuml;': 'Ü', '&euro;': '€',
};

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&[a-zA-Z]+;/g, (m) => HTML_ENTITIES[m] ?? m);
}

// ---------------------------------------------------------------------------
// Descubrir todos los HTML de /dist y mapearlos a su URL relativa
// ---------------------------------------------------------------------------

function listHtmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listHtmlFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function fileToUrlPath(file) {
  let rel = '/' + relative(DIST_DIR, file).split(sep).join('/');
  rel = rel.replace(/index\.html$/, '');
  if (rel.length > 1 && rel.endsWith('/')) rel = rel.slice(0, -1);
  if (rel === '') rel = '/';
  return rel;
}

const pageByUrl = new Map(); // urlPath -> html
for (const file of listHtmlFiles(DIST_DIR)) {
  pageByUrl.set(fileToUrlPath(file), readFileSync(file, 'utf-8'));
}

// ---------------------------------------------------------------------------
// Universo de URLs indexables: dist/sitemap-0.xml
// ---------------------------------------------------------------------------

const sitemapXml = readFileSync(SITEMAP_PATH, 'utf-8');
const sitemapUrls = new Set(
  [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
    let u = m[1].replace(SITE_URL, '');
    if (u.length > 1 && u.endsWith('/')) u = u.slice(0, -1);
    if (u === '') u = '/';
    return u;
  })
);

// ---------------------------------------------------------------------------
// <main>: extracción y recuento de palabras visibles
// ---------------------------------------------------------------------------

function extractMainHtml(html) {
  const start = html.indexOf('<main');
  if (start === -1) return null;
  const end = html.lastIndexOf('</main>');
  if (end === -1 || end < start) return null;
  return html.slice(start, end);
}

function countMainWords(html) {
  let main = extractMainHtml(html);
  if (main === null) return null;
  main = main.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  main = main.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  main = main.replace(/<!--[\s\S]*?-->/g, ' ');
  // El placeholder de un <input>/<textarea> es texto visible en pantalla
  // aunque no sea un nodo de texto del DOM (relevante para /simulador).
  main = main.replace(/<[a-zA-Z][^>]*\splaceholder="([^"]*)"[^>]*>/g, (m, p1) => ` ${p1} ${m}`);
  let text = main.replace(/<[^>]+>/g, ' ');
  text = decodeEntities(text);
  text = text.replace(/\s+/g, ' ').trim();
  if (!text) return 0;
  return text.split(' ').filter((w) => /[a-zA-Z0-9áéíóúñÁÉÍÓÚÑüÜ]/.test(w)).length;
}

// ---------------------------------------------------------------------------
// canonical, JSON-LD, noindex
// ---------------------------------------------------------------------------

function extractCanonical(html) {
  const m = html.match(/<link rel="canonical" href="([^"]+)"/);
  return m ? m[1] : null;
}

function extractJsonLdTypes(html) {
  const types = new Set();
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    try {
      const obj = JSON.parse(m[1]);
      const t = obj['@type'];
      if (Array.isArray(t)) t.forEach((x) => types.add(x));
      else if (t) types.add(t);
    } catch {
      types.add('(JSON-LD inválido)');
    }
  }
  return types;
}

function hasNoindex(html) {
  return /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html);
}

// ---------------------------------------------------------------------------
// Enlaces internos entrantes: in-degree por página de origen, en todo /dist
// ---------------------------------------------------------------------------

function extractAnchorHrefs(html) {
  const hrefs = [];
  const re = /<a\s+[^>]*href="([^"]+)"[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) hrefs.push(m[1]);
  return hrefs;
}

function normalizeInternalHref(href) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return null;
  }
  let u = href;
  if (u.startsWith(SITE_URL)) u = u.slice(SITE_URL.length);
  if (/^https?:\/\//.test(u)) return null; // enlace externo
  u = u.split('#')[0].split('?')[0];
  if (!u.startsWith('/')) return null;
  if (u.length > 1 && u.endsWith('/')) u = u.slice(0, -1);
  if (u === '') u = '/';
  return u;
}

const inboundByUrl = new Map();
for (const [sourceUrl, html] of pageByUrl) {
  const targets = new Set();
  for (const href of extractAnchorHrefs(html)) {
    const norm = normalizeInternalHref(href);
    if (norm && norm !== sourceUrl) targets.add(norm);
  }
  for (const target of targets) {
    inboundByUrl.set(target, (inboundByUrl.get(target) ?? 0) + 1);
  }
}

// ---------------------------------------------------------------------------
// Artículos publicados y grupos de keyword (canibalización, todo el sitemap)
// ---------------------------------------------------------------------------

const publishedArticles = calendario.articulos.filter((a) => a.publicado === true);
const articleUrl = (a) => `/blog/${a.slug}`;

const keywordGroups = new Map(); // keyword normalizada -> [{url, slug, keyword}]
function addToKeywordGroup(keyword, entry) {
  const key = normalizeKeyword(keyword);
  if (!keywordGroups.has(key)) keywordGroups.set(key, []);
  keywordGroups.get(key).push(entry);
}

for (const a of publishedArticles) {
  const url = articleUrl(a);
  if (!sitemapUrls.has(url)) continue; // no indexable: no compite por rastreo
  addToKeywordGroup(a.keyword, { url, slug: a.slug, keyword: a.keyword });
}

function findSimuladorKeywordMatch() {
  const candidates = publishedArticles.filter((a) => tokenize(a.keyword).includes('simulador'));
  if (candidates.length !== 1) {
    console.warn(
      `Aviso: no se pudo determinar de forma inequívoca la keyword que compite con /simulador ` +
        `(${candidates.length} artículo(s) candidato(s) con "simulador" en su keyword). Se omite el cruce.`
    );
    return null;
  }
  return candidates[0];
}

const simuladorMatch = findSimuladorKeywordMatch();
if (simuladorMatch && sitemapUrls.has('/simulador')) {
  addToKeywordGroup(simuladorMatch.keyword, {
    url: '/simulador',
    slug: 'simulador',
    keyword: simuladorMatch.keyword,
  });
}

const pairsInSitemap = [];
for (const [key, entries] of keywordGroups) {
  if (entries.length > 1) {
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        pairsInSitemap.push({ keyword: key, a: entries[i].url, b: entries[j].url });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Conjunto money (solo lectura de calendario.json)
// ---------------------------------------------------------------------------

const moneyArticles = publishedArticles.filter((a) => a.volumen >= UMBRAL_VOLUMEN);
const moneySet = [
  {
    url: '/simulador',
    keyword: simuladorMatch ? simuladorMatch.keyword : null,
    volumen: simuladorMatch ? simuladorMatch.volumen : null,
    origen: simuladorMatch
      ? `keyword vía ${simuladorMatch.slug} (no tiene campo propio en calendario.json)`
      : '(sin keyword asociada)',
  },
  ...moneyArticles.map((a) => ({
    url: articleUrl(a),
    keyword: a.keyword,
    volumen: a.volumen,
    origen: `calendario.json id ${a.id}`,
  })),
];

// ---------------------------------------------------------------------------
// Cruce opcional con export de Search Console (scripts/datos/*.csv)
// ---------------------------------------------------------------------------

function findCsvFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.csv'))
    .map((f) => join(dir, f));
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ''));
    return row;
  });
}

function findColumn(headers, candidates) {
  return headers.find((h) => candidates.includes(h.toLowerCase()));
}

function normalizeUrlForCompare(raw) {
  let u = raw;
  if (u.startsWith(SITE_URL)) u = u.slice(SITE_URL.length);
  if (/^https?:\/\//.test(u)) return null;
  u = u.split('#')[0].split('?')[0];
  if (!u.startsWith('/')) u = '/' + u;
  if (u.length > 1 && u.endsWith('/')) u = u.slice(0, -1);
  if (u === '') u = '/';
  return u;
}

const csvFiles = findCsvFiles(DATOS_DIR);
const gscRows = [];
if (csvFiles.length === 0) {
  console.log(
    'Aviso: no existe scripts/datos/*.csv (export de Search Console). ' +
      'Impresiones/clics/posición se reportan a 0 para todas las URLs.\n'
  );
} else {
  for (const file of csvFiles) {
    const rows = parseCsv(readFileSync(file, 'utf-8'));
    if (rows.length === 0) continue;
    const headers = Object.keys(rows[0]);
    const urlCol = findColumn(headers, ['page', 'página', 'pagina', 'url']);
    const imprCol = findColumn(headers, ['impressions', 'impresiones']);
    const clicksCol = findColumn(headers, ['clicks', 'clics']);
    const posCol = findColumn(headers, [
      'position', 'posición', 'posicion', 'average position', 'posición media',
    ]);
    if (!urlCol) continue;
    for (const row of rows) {
      const url = normalizeUrlForCompare(row[urlCol]);
      if (!url) continue;
      gscRows.push({
        url,
        impresiones: imprCol ? Number(row[imprCol]) || 0 : 0,
        clics: clicksCol ? Number(row[clicksCol]) || 0 : 0,
        posicion: posCol ? Number(row[posCol]) || 0 : 0,
      });
    }
  }
  console.log(`scripts/datos/: ${csvFiles.length} archivo(s) CSV encontrado(s), ${gscRows.length} fila(s) leídas.\n`);
}

function findGscRow(urlPath) {
  return gscRows.find((r) => r.url === urlPath);
}

// ---------------------------------------------------------------------------
// Medición por URL del conjunto money
// ---------------------------------------------------------------------------

let exitCode = 0;
const results = [];

for (const item of moneySet) {
  const html = pageByUrl.get(item.url);
  if (!html) {
    console.error(`ERROR: ${item.url} no existe en /dist (¿falta el build o el artículo aún no está publicado?).`);
    exitCode = 1;
    results.push({ url: item.url, error: true });
    continue;
  }

  const palabras = countMainWords(html);
  const entrantes = inboundByUrl.get(item.url) ?? 0;
  const canonical = extractCanonical(html);
  const jsonldTypes = [...extractJsonLdTypes(html)].sort();
  const indexable = sitemapUrls.has(item.url);
  const noindex = hasNoindex(html);

  const key = item.keyword ? normalizeKeyword(item.keyword) : null;
  const group = key ? keywordGroups.get(key) ?? [] : [];
  const otras = group.filter((g) => g.url !== item.url).map((g) => g.url);
  const duplicada = otras.length > 0;

  const gsc = findGscRow(item.url);

  if (palabras === null || palabras < MIN_PALABRAS) exitCode = 1;
  if (duplicada) exitCode = 1;
  if (noindex) exitCode = 1;

  results.push({
    url: item.url,
    keyword: item.keyword,
    volumen: item.volumen,
    origen: item.origen,
    palabras,
    entrantes,
    canonical,
    canonicalPropio: canonical === `${SITE_URL}${item.url === '/' ? '/' : item.url}`,
    indexable,
    noindex,
    jsonldTypes,
    duplicada,
    otras,
    impresiones: gsc ? gsc.impresiones : 0,
    clics: gsc ? gsc.clics : 0,
    posicion: gsc ? gsc.posicion : 0,
    error: false,
  });
}

// ---------------------------------------------------------------------------
// Informe por consola
// ---------------------------------------------------------------------------

console.log('='.repeat(78));
console.log('AUDITORÍA DEL CONJUNTO MONEY — tujubilacionanticipada.com');
console.log('='.repeat(78));
console.log(
  `Conjunto money (${moneySet.length} URLs): /simulador + artículos publicados con keyword >= ${UMBRAL_VOLUMEN.toLocaleString('es-ES')} búsq./mes.\n`
);

for (const r of results) {
  console.log('-'.repeat(78));
  console.log(`URL: ${r.url}`);
  if (r.error) {
    console.log('  ESTADO: no existe en /dist — no se pudo auditar.');
    continue;
  }
  console.log(`  Keyword objetivo:        ${r.keyword ?? '(sin asociar)'} ${r.volumen ? `(${r.volumen.toLocaleString('es-ES')} búsq./mes)` : ''}`.trimEnd());
  console.log(`  Origen del dato:         ${r.origen}`);
  console.log(`  Palabras únicas <main>:  ${r.palabras}${r.palabras !== null && r.palabras < MIN_PALABRAS ? `  <-- por debajo del mínimo (${MIN_PALABRAS})` : ''}`);
  console.log(`  Enlaces internos entrantes (páginas origen distintas en /dist): ${r.entrantes}`);
  console.log(`  Canonical declarado:     ${r.canonical ?? '(ausente)'}${r.canonical && !r.canonicalPropio ? '  <-- no autorreferente' : ''}`);
  console.log(`  Indexable (en sitemap):  ${r.indexable ? 'sí' : 'no'}`);
  console.log(`  noindex:                 ${r.noindex ? 'SÍ  <-- accidental si no es intencionado' : 'no'}`);
  console.log(`  Tipos JSON-LD presentes: ${r.jsonldTypes.length ? r.jsonldTypes.join(', ') : '(ninguno)'}`);
  console.log(
    `  Canibalización:          ${r.duplicada ? `SÍ — misma keyword que: ${r.otras.join(', ')}` : 'no'}`
  );
  console.log(`  Search Console (CSV):    impresiones=${r.impresiones}, clics=${r.clics}, posición=${r.posicion}`);
}

console.log('-'.repeat(78));
console.log('\nPares canibalizados detectados en TODO el sitemap (no solo el conjunto money):');
if (pairsInSitemap.length === 0) {
  console.log('  Ninguno.');
} else {
  for (const p of pairsInSitemap) {
    console.log(`  - "${p.keyword}": ${p.a}  <->  ${p.b}`);
  }
}

const resumenFinal =
  exitCode === 0
    ? 'OK — el conjunto money cumple unicidad y suficiencia.'
    : `FALLO — hay URLs del conjunto money por debajo de ${MIN_PALABRAS} palabras, con noindex accidental, y/o canibalizadas.`;

console.log('\n' + '='.repeat(78));
console.log(`RESULTADO: ${resumenFinal}`);
console.log('='.repeat(78));

process.exit(exitCode);
