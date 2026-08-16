/**
 * Mapa de consolidación canonical.
 *
 * Fuente única de verdad para resolver pares de artículos publicados que
 * declaran la misma `keyword` exacta en `scripts/calendario.json`
 * (canibalización). SOLO LECTURA sobre `scripts/calendario.json` y sobre
 * los ficheros `.mdx` de `src/content/blog/`: este módulo nunca escribe en
 * ninguno de los dos.
 *
 * Regla de resolución para cada par que comparte `keyword` (normalizada:
 * sin acentos, minúsculas, espacios colapsados):
 *   1. La canónica es, por defecto, el artículo con `fecha` de publicación
 *      más antigua (campo `fecha` de scripts/calendario.json).
 *   2. Excepción: si el artículo más reciente tiene >= UMBRAL_RATIO_PALABRAS
 *      (1,5x) las palabras del más antiguo -contadas sobre el `.mdx` fuente,
 *      no sobre el HTML compilado-, el módulo NO decide: el par se marca
 *      como "requiere revisión" (del CEO) en `paresQueRequierenRevision`,
 *      y `getCanonicalSlug` no lo resuelve automáticamente.
 *
 * Este módulo aún no se importa desde ninguna página ni desde el sitemap:
 * queda listo para que el layout de artículo y el generador de sitemap lo
 * consuman en una tarea posterior (ej. para emitir <link rel="canonical">
 * hacia el ganador, o para excluir la URL perdedora del sitemap).
 */
import fs from 'node:fs';
import path from 'node:path';
import calendarioData from '../../scripts/calendario.json';

/** Umbral de extensión (nº de palabras) a partir del cual la resolución
 * automática por fecha se considera insegura y se escala a revisión humana. */
export const UMBRAL_RATIO_PALABRAS = 1.5;

interface ArticuloCalendario {
  slug: string;
  keyword: string;
  fecha: string;
  publicado: boolean;
}

/** Artículo ya normalizado con su recuento de palabras, listo para resolver. */
export interface ArticuloParaConsolidar {
  slug: string;
  keyword: string;
  fecha: string;
  palabras: number;
}

export interface ParConsolidado {
  /** Slug que se mantiene como fuente de verdad. */
  canonico: string;
  /** Slug que debería consolidarse hacia `canonico`. */
  duplicado: string;
  keyword: string;
}

export interface ParPendienteRevision {
  keyword: string;
  masAntiguo: string;
  masReciente: string;
  palabrasMasAntiguo: number;
  palabrasMasReciente: number;
  ratio: number;
}

export interface ResultadoConsolidacion {
  pares: ParConsolidado[];
  requierenRevision: ParPendienteRevision[];
}

// ---------------------------------------------------------------------------
// Normalización de keyword (misma lógica que scripts/auditar-money-set.mjs:
// coincidencia EXACTA tras quitar acentos, pasar a minúsculas y colapsar
// espacios, para no depender de mayúsculas/tildes accidentales).
// ---------------------------------------------------------------------------

function normalizarKeyword(keyword: string): string {
  return keyword
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// ---------------------------------------------------------------------------
// Recuento de palabras a partir del .mdx fuente (SOLO LECTURA).
// ---------------------------------------------------------------------------

const BLOG_CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

/**
 * Cuenta palabras de un cuerpo MDX crudo: descarta frontmatter, imports,
 * comentarios MDX, bloques de código, etiquetas de componentes/HTML y
 * marcado Markdown, conservando el texto ancla de los enlaces mientras
 * descarta la URL. Exportada aparte de `contarPalabrasMdx` para poder
 * testear el conteo con texto sintético sin depender de que exista el
 * fichero en disco.
 */
export function contarPalabrasTextoMdx(raw: string): number {
  const sinFrontmatter = raw.replace(/^---[\s\S]*?---/, '');
  const sinImports = sinFrontmatter.replace(/^\s*import .+$/gm, ' ');
  const sinComentarios = sinImports.replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ');
  const sinCodigo = sinComentarios.replace(/```[\s\S]*?```/g, ' ');
  const sinEtiquetas = sinCodigo.replace(/<\/?[A-Za-z][^>]*>/g, ' ');
  const sinEnlacesMd = sinEtiquetas.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  const sinSintaxisMd = sinEnlacesMd
    .replace(/^\|?-{3,}\|?$/gm, ' ')
    .replace(/[#>*_`~|]/g, ' ');
  return sinSintaxisMd.trim().split(/\s+/).filter(Boolean).length;
}

/** Lee `src/content/blog/<slug>.mdx` y cuenta sus palabras. Devuelve 0 si el
 * fichero no existe (ej. artículo aún no redactado aunque ya conste en el
 * calendario). */
export function contarPalabrasMdx(slug: string): number {
  const filePath = path.join(BLOG_CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return 0;
  const raw = fs.readFileSync(filePath, 'utf-8');
  return contarPalabrasTextoMdx(raw);
}

// ---------------------------------------------------------------------------
// Resolución pura: no toca el filesystem, solo recibe datos ya normalizados.
// Se exporta para poder testearla con artículos sintéticos (ej. un artículo
// todavía no publicado, simulando `publicado: true`) sin depender de que el
// `.mdx` exista de verdad en el repositorio.
// ---------------------------------------------------------------------------

export function resolverConsolidacion(
  articulos: ArticuloParaConsolidar[]
): ResultadoConsolidacion {
  const grupos = new Map<string, ArticuloParaConsolidar[]>();
  for (const articulo of articulos) {
    const clave = normalizarKeyword(articulo.keyword);
    const lista = grupos.get(clave);
    if (lista) lista.push(articulo);
    else grupos.set(clave, [articulo]);
  }

  const pares: ParConsolidado[] = [];
  const requierenRevision: ParPendienteRevision[] = [];

  for (const lista of grupos.values()) {
    if (lista.length < 2) continue;
    const ordenados = [...lista].sort((a, b) => a.fecha.localeCompare(b.fecha));
    const masAntiguo = ordenados[0]!;
    for (const candidato of ordenados.slice(1)) {
      const ratio =
        masAntiguo.palabras > 0
          ? candidato.palabras / masAntiguo.palabras
          : Number.POSITIVE_INFINITY;
      if (ratio >= UMBRAL_RATIO_PALABRAS) {
        requierenRevision.push({
          keyword: candidato.keyword,
          masAntiguo: masAntiguo.slug,
          masReciente: candidato.slug,
          palabrasMasAntiguo: masAntiguo.palabras,
          palabrasMasReciente: candidato.palabras,
          ratio,
        });
      } else {
        pares.push({
          canonico: masAntiguo.slug,
          duplicado: candidato.slug,
          keyword: candidato.keyword,
        });
      }
    }
  }

  return { pares, requierenRevision };
}

// ---------------------------------------------------------------------------
// Carga de datos reales del repositorio (SOLO LECTURA) y resolución al
// cargar el módulo, para exponer un mapa ya calculado y reutilizable.
// ---------------------------------------------------------------------------

function cargarArticulosPublicados(): ArticuloParaConsolidar[] {
  const articulos = (calendarioData.articulos ?? []) as ArticuloCalendario[];
  return articulos
    .filter((articulo) => articulo.publicado)
    .map((articulo) => ({
      slug: articulo.slug,
      keyword: articulo.keyword,
      fecha: articulo.fecha,
      palabras: contarPalabrasMdx(articulo.slug),
    }));
}

const resultadoActual = resolverConsolidacion(cargarArticulosPublicados());

const mapaDuplicadoACanonico = new Map(
  resultadoActual.pares.map((par) => [par.duplicado, par.canonico])
);

/**
 * Si `slug` es la parte "perdedora" de un par canibalizado, devuelve el
 * slug canónico al que debería consolidarse (redirección/canonical).
 * Devuelve `undefined` si `slug` es la canónica de su par, si no forma
 * parte de ningún par, o si el par al que pertenece está pendiente de
 * revisión humana (ver `paresQueRequierenRevision`).
 */
export function getCanonicalSlug(slug: string): string | undefined {
  return mapaDuplicadoACanonico.get(slug);
}

/** Pares detectados hoy y consolidados automáticamente (fecha de
 * publicación más antigua gana, sin superar el umbral de extensión). */
export const paresConsolidados: ParConsolidado[] = resultadoActual.pares;

/** Pares detectados hoy en los que el artículo más reciente tiene >= 1,5x
 * las palabras del más antiguo: el módulo NO decide, exige revisión del CEO. */
export const paresQueRequierenRevision: ParPendienteRevision[] =
  resultadoActual.requierenRevision;
