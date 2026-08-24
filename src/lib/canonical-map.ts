/**
 * Mapa de consolidación canonical — SOLO LECTURA de scripts/calendario.json y
 * de los .mdx en src/content/blog/.
 *
 * Detecta pares de artículos PUBLICADOS que declaran la misma `keyword`
 * exacta (canibalización) y decide, para cada par, cuál de las dos URLs debe
 * llevar la etiqueta `rel=canonical` autorreferente y cuál debe apuntar su
 * canonical hacia la otra:
 *
 *   - Por defecto gana el artículo con `fecha` de publicación más antigua
 *     (es la URL que ya ha podido acumular autoridad/enlaces/histórico en
 *     Search Console): el más reciente consolida hacia él.
 *   - EXCEPCIÓN: si el artículo más reciente tiene >= 1,5x las palabras del
 *     más antiguo (contenido sustancialmente más completo), la decisión no
 *     es automática: el par se marca como "requiere revisión del CEO" y no
 *     se asigna ningún canonical desde este módulo. Lo mismo ocurre si no
 *     se puede leer el recuento de palabras de alguno de los dos artículos
 *     (p. ej. el .mdx aún no existe en disco): ante la duda, no se decide
 *     solo.
 *
 * Este módulo NO se consume todavía desde ninguna página ni componente
 * (lo hará una tarea posterior). Solo lee ficheros del repo, nunca escribe.
 *
 * Uso previsto en el futuro (layout del artículo / sitemap):
 *   import { getCanonicalSlug } from '@/lib/canonical-map';
 *   const destino = getCanonicalSlug(slug); // string | undefined
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * Raíz del repositorio.
 *
 * NO se puede derivar de `import.meta.url`: cuando una página `.astro` importa
 * este módulo, Vite lo empaqueta dentro de `dist/pages/…`, `import.meta.url`
 * apunta ahí y la raíz se resolvía a `dist/` (ENOENT buscando
 * `dist/scripts/calendario.json`). Se parte de `process.cwd()` —el build de
 * Astro se ejecuta siempre desde la raíz del repo— y se sube hasta encontrar
 * `scripts/calendario.json`, por si se invocara desde un subdirectorio.
 */
function resolverRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(dir, 'scripts', 'calendario.json'))) return dir;
    const padre = dirname(dir);
    if (padre === dir) break;
    dir = padre;
  }
  return process.cwd();
}

const REPO_ROOT = resolverRepoRoot();
const CALENDARIO_PATH = join(REPO_ROOT, 'scripts', 'calendario.json');
const BLOG_DIR = join(REPO_ROOT, 'src', 'content', 'blog');

/** Un artículo más reciente consolida hacia el más antiguo si sus palabras
 * son menos de este múltiplo de las del más antiguo. Igual o por encima ->
 * "requiere revisión". */
const UMBRAL_MULTIPLICADOR_PALABRAS = 1.5;

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Subconjunto de campos de scripts/calendario.json que necesita este
 * módulo. Estructuralmente compatible con las entradas reales de
 * `articulos`, que traen más campos (id, silo, volumen, kd, ...). */
export interface ArticuloCanibalizable {
  slug: string;
  keyword: string;
  fecha: string; // 'YYYY-MM-DD'
  publicado: boolean;
}

export interface ParRequiereRevision {
  keyword: string;
  /** Slug del artículo con fecha de publicación más antigua del par. */
  antiguo: string;
  /** Slug del artículo con fecha de publicación más reciente del par. */
  reciente: string;
  palabrasAntiguo: number | undefined;
  palabrasReciente: number | undefined;
}

export interface ResultadoConsolidacion {
  /** slug consolidado -> slug canónico de destino. */
  canonicalMap: Map<string, string>;
  paresRequierenRevision: ParRequiereRevision[];
}

/** Función capaz de devolver el nº de palabras "propias" del cuerpo de un
 * artículo dado su slug, o `undefined` si no se puede determinar (p. ej. el
 * .mdx no existe). Se inyecta como parámetro para poder simular escenarios
 * (artículos aún no publicados) sin depender del sistema de ficheros real. */
export type ContadorDePalabras = (slug: string) => number | undefined;

// ---------------------------------------------------------------------------
// Normalización de keywords (misma lógica que scripts/auditar-money-set.mjs,
// para que ambos scripts detecten exactamente los mismos pares)
// ---------------------------------------------------------------------------

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function normalizarKeyword(s: string): string {
  return stripAccents(s).toLowerCase().trim().replace(/\s+/g, ' ');
}

// ---------------------------------------------------------------------------
// Recuento de palabras "propias" del cuerpo de un artículo, leído desde el
// .mdx fuente (solo lectura, nunca se escribe en src/content/blog/**).
// ---------------------------------------------------------------------------

/**
 * Cuenta las palabras del cuerpo de un artículo MDX a partir de su texto
 * fuente crudo: descarta el frontmatter, las líneas `import ...` y las
 * etiquetas de componentes Astro/JSX (p. ej. `<BarChart ... />`), que no son
 * prosa del artículo. No interpreta la sintaxis Markdown restante (títulos,
 * negritas, tablas, enlaces): esos símbolos separan igualmente palabras por
 * espacios, por lo que no distorsionan un recuento comparativo entre dos
 * artículos del mismo sitio.
 */
export function contarPalabrasMdx(mdxSource: string): number {
  let texto = mdxSource;

  // Frontmatter YAML entre '---' iniciales.
  texto = texto.replace(/^---[\s\S]*?---\r?\n/, '');

  // Líneas de import de componentes.
  texto = texto.replace(/^import .*$/gm, ' ');

  // Componentes Astro/JSX en bloque: <Componente ...>...</Componente>
  texto = texto.replace(/<([A-Z][A-Za-z0-9]*)[^>]*>[\s\S]*?<\/\1>/g, ' ');
  // Componentes Astro/JSX autocerrados: <Componente ... />
  texto = texto.replace(/<[A-Z][A-Za-z0-9]*[^>]*\/>/g, ' ');

  // Comentarios HTML.
  texto = texto.replace(/<!--[\s\S]*?-->/g, ' ');

  const tokens = texto.split(/\s+/).filter(Boolean);
  return tokens.filter((t) => /[a-zA-Z0-9áéíóúñÁÉÍÓÚÑüÜ]/.test(t)).length;
}

/** Lee `src/content/blog/{slug}.mdx` y devuelve su recuento de palabras, o
 * `undefined` si el fichero no existe todavía (p. ej. un artículo con
 * `publicado: false` cuyo .mdx aún no se ha creado). */
export function contarPalabrasArticulo(slug: string): number | undefined {
  const ruta = join(BLOG_DIR, `${slug}.mdx`);
  if (!existsSync(ruta)) return undefined;
  const fuente = readFileSync(ruta, 'utf-8');
  return contarPalabrasMdx(fuente);
}

// ---------------------------------------------------------------------------
// Resolución de pares canibalizados (función pura, testable con datos
// simulados y un contador de palabras inyectado)
// ---------------------------------------------------------------------------

/**
 * Agrupa los artículos PUBLICADOS por `keyword` exacta (normalizada) y, para
 * cada grupo con más de un artículo, decide la consolidación canonical
 * tomando como referencia el de fecha más antigua. Es una función pura: no
 * toca el sistema de ficheros directamente (recibe `contarPalabras` como
 * parámetro), por lo que puede reutilizarse tanto con los datos reales de
 * calendario.json como con listas simuladas en pruebas ad-hoc.
 */
export function resolverParesCanonicos<T extends ArticuloCanibalizable>(
  articulos: T[],
  contarPalabras: ContadorDePalabras
): ResultadoConsolidacion {
  const canonicalMap = new Map<string, string>();
  const paresRequierenRevision: ParRequiereRevision[] = [];

  const publicados = articulos.filter((a) => a.publicado === true);

  const grupos = new Map<string, T[]>();
  for (const articulo of publicados) {
    const clave = normalizarKeyword(articulo.keyword);
    const lista = grupos.get(clave) ?? [];
    lista.push(articulo);
    grupos.set(clave, lista);
  }

  for (const [keyword, grupo] of grupos) {
    if (grupo.length < 2) continue;

    // Fecha de publicación ascendente; empate por slug para que el orden
    // sea determinista.
    const ordenado = [...grupo].sort(
      (a, b) => a.fecha.localeCompare(b.fecha) || a.slug.localeCompare(b.slug)
    );
    const masAntiguo = ordenado[0];

    // Cada artículo más reciente del grupo se evalúa contra el más antiguo.
    for (let i = 1; i < ordenado.length; i++) {
      const masReciente = ordenado[i];

      const palabrasAntiguo = contarPalabras(masAntiguo.slug);
      const palabrasReciente = contarPalabras(masReciente.slug);

      const sePuedeVerificar =
        palabrasAntiguo !== undefined && palabrasReciente !== undefined;
      const superaUmbral =
        sePuedeVerificar &&
        palabrasReciente >= palabrasAntiguo * UMBRAL_MULTIPLICADOR_PALABRAS;

      if (!sePuedeVerificar || superaUmbral) {
        paresRequierenRevision.push({
          keyword,
          antiguo: masAntiguo.slug,
          reciente: masReciente.slug,
          palabrasAntiguo,
          palabrasReciente,
        });
        continue;
      }

      canonicalMap.set(masReciente.slug, masAntiguo.slug);
    }
  }

  return { canonicalMap, paresRequierenRevision };
}

// ---------------------------------------------------------------------------
// Instancia derivada de los datos reales de scripts/calendario.json (solo
// lectura). Se calcula una vez, al importar el módulo.
// ---------------------------------------------------------------------------

interface CalendarioJson {
  articulos: ArticuloCanibalizable[];
}

function cargarCalendario(): ArticuloCanibalizable[] {
  const crudo = readFileSync(CALENDARIO_PATH, 'utf-8');
  const data = JSON.parse(crudo) as CalendarioJson;
  return data.articulos;
}

const { canonicalMap: MAPA_CANONICAL_REAL, paresRequierenRevision: PARES_REQUIEREN_REVISION_REAL } =
  resolverParesCanonicos(cargarCalendario(), contarPalabrasArticulo);

/**
 * Devuelve el slug canónico de destino si `slug` queda consolidado hacia
 * otro artículo (misma keyword, publicado con fecha más antigua y sin
 * superar el umbral de 1,5x en palabras). Devuelve `undefined` si `slug` es
 * la propia canónica, si no forma parte de ningún par canibalizado, o si su
 * par está pendiente de "revisión del CEO" (en cuyo caso no se decide sin
 * intervención humana).
 */
export function getCanonicalSlug(slug: string): string | undefined {
  return MAPA_CANONICAL_REAL.get(slug);
}

/** Pares detectados hoy en scripts/calendario.json que no se han podido
 * resolver de forma automática y requieren revisión del CEO. */
export const paresQueRequierenRevision: ParRequiereRevision[] = PARES_REQUIEREN_REVISION_REAL;
