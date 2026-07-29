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
