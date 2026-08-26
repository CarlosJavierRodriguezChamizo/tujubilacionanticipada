import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rehypeSlug from 'rehype-slug';
import {
  rehypeTocBeforeH2,
  rehypeExternalLinks,
  rehypeInlineBlocks,
} from './src/lib/rehype-plugins.mjs';
import { getCanonicalSlug } from './src/lib/canonical-map.ts';

// Índice de artículos (para las "lecturas recomendadas" intercaladas).
function loadPostsIndex() {
  const dir = fileURLToPath(new URL('./src/content/blog/', import.meta.url));
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));
  } catch {
    return [];
  }
  const field = (block, key) => {
    const m = block.match(new RegExp('^' + key + ':\\s*(.+?)\\s*$', 'm'));
    return m ? m[1].replace(/^["']|["']$/g, '') : '';
  };
  return files
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const fm = raw.match(/^---([\s\S]*?)---/);
      const block = fm ? fm[1] : '';
      return {
        slug: f.replace(/\.mdx$/, ''),
        title: field(block, 'title'),
        description: field(block, 'description'),
        category: field(block, 'category'),
        draft: field(block, 'draft') === 'true',
      };
    })
    .filter((p) => p.title && !p.draft);
}
const POSTS_INDEX = loadPostsIndex();

// https://astro.build/config
export default defineConfig({
  site: 'https://tujubilacionanticipada.com',
  // Una sola forma canónica de URL: SIN barra final. Es la que ya usaban los
  // enlaces internos y los canonical, mientras el sitemap publicaba la variante
  // con barra: Ahrefs veía 78 "páginas huérfanas" que en realidad eran las URLs
  // con barra, sin un solo enlace entrante y no canónicas. `vercel.json` remata
  // la política redirigiendo (308 permanente) la variante con barra.
  trailingSlash: 'never',
  markdown: {
    // rehype-slug añade id a las cabeceras → el TOC las enlaza.
    // Orden: ids → TOC → bloques intercalados → enlaces externos.
    rehypePlugins: [
      rehypeSlug,
      rehypeTocBeforeH2,
      rehypeInlineBlocks(POSTS_INDEX),
      rehypeExternalLinks,
    ],
  },
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    mdx(),
    sitemap({
      // Excluye del sitemap las páginas noindex, la paginación redundante y
      // los artículos consolidados hacia otro vía canonical-map.ts (seo-013).
      filter: (page) => {
        if (/\/(aviso-legal|privacidad|cookies)\/?$/.test(page)) return false;
        // Confirmación del formulario sin JavaScript: llevan noindex, así que no
        // deben anunciarse como indexables (auditoría Ahrefs, punto 5-8).
        if (/\/asesoramiento\/(gracias|error)\/?$/.test(page)) return false;
        if (/\/blog\/page\/1\/?$/.test(page)) return false;
        const match = page.match(/\/blog\/([^/]+)\/?$/);
        if (match) {
          const slug = match[1];
          if (getCanonicalSlug(slug) !== undefined) return false;
        }
        return true;
      },
      // El sitemap debe anunciar exactamente la URL canónica: sin barra final
      // (salvo la home, que es solo el dominio). Antes publicaba la variante con
      // barra, que es justo la que ningún enlace interno referencia.
      serialize: (item) => {
        const u = new URL(item.url);
        // Cada URL del sitemap debe ser idéntica a su propio canonical: la home
        // conserva su barra ("https://dominio/") y el resto no la lleva.
        u.pathname = u.pathname === '/' ? '/' : u.pathname.replace(/\/$/, '');
        return { ...item, url: u.toString() };
      },
    }),
  ],
});
