import { defineCollection, z } from 'astro:content';

/**
 * Categorías (silos) permitidas en el blog.
 * Deben coincidir con los `silo` de scripts/calendario.json, ya que el
 * redactor automático asigna `category` a partir de ese valor.
 */
export const BLOG_CATEGORIES = [
  'Tipos de jubilación anticipada',
  'Cálculos y penalizaciones',
  'Planificación financiera',
  'Actualidad y casos prácticos',
] as const;

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(120),
    description: z.string().max(200),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(BLOG_CATEGORIES),
    author: z.string().default('Redacción de Tu Jubilación Anticipada'),
    // Campos EEAT (revisión editorial). El validador del pipeline los exige.
    reviewedBy: z.string().optional(),
    reviewerTitle: z.string().optional(),
    /** Tipo de Schema.org para el JSON-LD del artículo. */
    schema: z.enum(['Article', 'BlogPosting', 'NewsArticle']).default('BlogPosting'),
    /**
     * Imagen de portada: ruta absoluta bajo /public (ej. '/blog/mi-slug.jpg').
     * La genera Magnific en el pipeline. Opcional: si falta, el artículo se
     * publica igualmente (degradación elegante).
     */
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    /** Imagen OG opcional (/public). Si se omite, se usa heroImage. */
    ogImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
