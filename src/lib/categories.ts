import { BLOG_CATEGORIES } from '../content/config';

/**
 * Fuente única de verdad para el slug de URL de cada categoría (silo) del
 * blog. Cualquier página, breadcrumb o componente de enlazado interno que
 * necesite construir la URL de un silo (p.ej. `/blog/categoria/<slug>/`)
 * debe usar `getCategorySlug()` en vez de generar su propio slugify, para
 * garantizar que todas las implementaciones apunten siempre a la misma URL.
 *
 * El mapeo es explícito (no un slugify genérico "on the fly") para que el
 * slug de cada categoría sea estable y predecible, y para que TypeScript
 * obligue a cubrir las 4 categorías definidas en `BLOG_CATEGORIES`
 * (src/content/config.ts) si en el futuro se añade o renombra alguna.
 */
type BlogCategory = (typeof BLOG_CATEGORIES)[number];

/**
 * Umbral mínimo de artículos publicados que debe tener una categoría para
 * que exista su página de silo (`/blog/categoria/<slug>/`). Por debajo de
 * este umbral no se genera la página (evita silos "vacíos" o casi vacíos).
 * Se exporta desde aquí para que cualquier consumidor (la propia página de
 * silo, el eyebrow de categoría del artículo, etc.) comparta el mismo
 * número y no se desincronicen dos constantes iguales en dos archivos.
 */
export const MIN_POSTS_PER_SILO = 3;

const CATEGORY_SLUGS: Record<BlogCategory, string> = {
  'Tipos de jubilación anticipada': 'tipos-de-jubilacion-anticipada',
  'Cálculos y penalizaciones': 'calculos-y-penalizaciones',
  'Planificación financiera': 'planificacion-financiera',
  'Actualidad y casos prácticos': 'actualidad-y-casos-practicos',
};

/**
 * Devuelve el slug de URL (kebab-case, sin tildes) para una categoría del
 * blog. Lanza un error si la categoría no está en `BLOG_CATEGORIES`, para
 * detectar cuanto antes cualquier desincronización entre el contenido y
 * este mapeo.
 */
export function getCategorySlug(category: BlogCategory): string {
  const slug = CATEGORY_SLUGS[category];
  if (!slug) {
    throw new Error(
      `getCategorySlug: no existe slug para la categoría "${category}". ` +
        'Añádela a CATEGORY_SLUGS en src/lib/categories.ts.'
    );
  }
  return slug;
}

/** Mapa inverso: slug de URL -> nombre de categoría. Útil para páginas de silo. */
export function getCategoryFromSlug(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((category) => CATEGORY_SLUGS[category] === slug);
}

/**
 * Indica si una categoría con `postCount` artículos publicados alcanza el
 * umbral `MIN_POSTS_PER_SILO` y, por tanto, tiene página de silo generada
 * en `/blog/categoria/<slug>/`. Cualquier enlace hacia esa página (p.ej. el
 * eyebrow de categoría en la cabecera de un artículo) debe comprobar esto
 * antes de renderizarse como enlace, para no apuntar a una URL inexistente.
 */
export function categoryHasSilo(postCount: number): boolean {
  return postCount >= MIN_POSTS_PER_SILO;
}
