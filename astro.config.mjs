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
import { getCanonicalSlug } from './src/lib/canonical-map';

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
      // los artículos "perdedores" de un par canibalizado (ver
      // src/lib/canonical-map.ts, seo-013/seo-014): su <link rel="canonical">
      // ya apunta al artículo que se mantiene, así que no deben anunciarse
      // como URL indexable independiente.
      filter: (page) => {
        if (/\/(aviso-legal|privacidad|cookies)\/?$/.test(page)) return false;
        if (/\/blog\/page\/1\/?$/.test(page)) return false;
        const blogSlugMatch = page.match(/\/blog\/([^/]+)\/?$/);
        if (blogSlugMatch && getCanonicalSlug(blogSlugMatch[1])) return false;
        return true;
      },
    }),
  ],
});
