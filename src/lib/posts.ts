import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

const isProd = import.meta.env.PROD;

/**
 * Devuelve los posts publicados (oculta drafts en producción),
 * ordenados de más reciente a más antiguo.
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => {
    return isProd ? data.draft === false : true;
  });

  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
}

/** Formatea una fecha en español (ej. "12 de marzo de 2026"). */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/** Versión ISO para el atributo datetime. */
export function toISO(date: Date): string {
  return date.toISOString();
}
