import { defineCollection, z } from 'astro:content';

/** Categorías permitidas en el blog */
export const BLOG_CATEGORIES = [
  'Jubilación anticipada',
  'Requisitos',
  'Cálculo de pensión',
  'Normativa',
  'Guías prácticas',
] as const;

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string().max(120),
      description: z.string().max(200),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      category: z.enum(BLOG_CATEGORIES),
      author: z.string().default('Redacción de Tu Jubilación Anticipada'),
      /** Imagen de portada opcional (relativa al .mdx o ruta en /public) */
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
      /** Imagen OG opcional como ruta absoluta (/public) */
      ogImage: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
