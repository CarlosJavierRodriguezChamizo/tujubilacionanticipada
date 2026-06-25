import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://tujubilacionanticipada.com',
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
