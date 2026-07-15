import { getCollection, type CollectionEntry } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';

export type BlogPost = CollectionEntry<'blog'>;

/**
 * Resuelve la imagen destacada de un artículo:
 * usa `heroImage` del frontmatter si existe; si no, y hay un archivo
 * `public/blog/<slug>.jpg`, lo usa automáticamente. Así una imagen
 * pre-cargada se muestra aunque la routine olvide poner `heroImage`.
 */
export function resolveHeroImage(
  slug: string,
  frontmatterHero?: string
): string | undefined {
  if (frontmatterHero) return frontmatterHero;
  try {
    const p = path.join(process.cwd(), 'public', 'blog', `${slug}.jpg`);
    if (fs.existsSync(p)) return `/blog/${slug}.jpg`;
  } catch {
    /* en runtime sin fs: se ignora */
  }
  return undefined;
}

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

/**
 * Tiempo de lectura estimado en minutos (200 palabras/min).
 * `body` es el markdown crudo del artículo (post.body).
 */
export function readingTimeMinutes(body: string): number {
  const words = (body || '')
    .replace(/```[\s\S]*?```/g, ' ') // ignora bloques de código
    .replace(/[#>*_`~\-|]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
