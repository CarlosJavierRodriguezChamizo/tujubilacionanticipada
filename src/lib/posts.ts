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
/**
 * Dimensiones reales de un JPEG de `public/`, leídas en build.
 *
 * Se usan para emitir `image` como `ImageObject` con `width` y `height` en el
 * JSON-LD (mejora la elegibilidad de rich results). Se leen del fichero en vez
 * de fijarlas a mano porque las portadas no tienen todas el mismo alto: las
 * antiguas son 1600×915 y las nuevas 1600×900.
 */
export function jpegSize(
  publicPath: string
): { width: number; height: number } | undefined {
  try {
    const file = path.join(process.cwd(), 'public', publicPath.replace(/^\//, ''));
    if (!fs.existsSync(file)) return undefined;
    const buf = fs.readFileSync(file);
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) {
        i += 1;
        continue;
      }
      const marker = buf[i + 1];
      // SOF0/SOF1/SOF2 llevan alto y ancho; el resto se salta por longitud.
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2;
        continue;
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  } catch {
    /* en runtime sin fs: se ignora */
  }
  return undefined;
}

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
