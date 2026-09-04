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
    /**
     * Título para el <title> y las etiquetas Open Graph/Twitter, cuando el
     * `title` (que es el <h1>) sea demasiado largo para un resultado de Google.
     * Máximo 60 caracteres: por encima de ahí el SERP lo trunca o Google lo
     * reescribe. No sustituye al <h1>, que puede seguir siendo descriptivo.
     */
    seoTitle: z.string().max(60).optional(),
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
    /*
     * Transparencia sobre IA (art. 50 del Reglamento (UE) 2024/1689).
     *
     * El pipeline de publicación redacta el borrador con un modelo de lenguaje
     * y genera la portada con un modelo de imagen, así que el valor por defecto
     * de ambos campos es `true`: la divulgación aparece sola y solo hay que
     * tocar el frontmatter para el caso excepcional (un artículo escrito
     * íntegramente por una persona, o una portada que no venga de un modelo).
     *
     * Nunca pongas `false` en un artículo cuyo borrador sí generó una IA: la
     * etiqueta dejaría de mostrarse y la divulgación pasaría a ser falsa.
     */
    /** El borrador del texto lo generó un sistema de IA generativa. */
    aiTextGenerated: z.boolean().default(true),
    /** La ilustración de portada la generó un sistema de IA generativa. */
    aiImageGenerated: z.boolean().default(true),
    /** Matiz concreto de este artículo para el bloque de transparencia. */
    aiNota: z.string().optional(),
  }),
});

export const collections = { blog };
