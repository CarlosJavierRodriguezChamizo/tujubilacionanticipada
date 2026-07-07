import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';
import { rehypeTocBeforeH2, rehypeExternalLinks } from './src/lib/rehype-plugins.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://tujubilacionanticipada.com',
  markdown: {
    // rehype-slug añade id a las cabeceras → el TOC las enlaza.
    // Orden: ids primero, luego TOC, luego enlaces externos.
    rehypePlugins: [rehypeSlug, rehypeTocBeforeH2, rehypeExternalLinks],
  },
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    mdx(),
    sitemap({
      // Excluye del sitemap las páginas noindex y la paginación redundante.
      filter: (page) =>
        !/\/(aviso-legal|privacidad|cookies)\/?$/.test(page) &&
        !/\/blog\/page\/1\/?$/.test(page),
    }),
  ],
});
