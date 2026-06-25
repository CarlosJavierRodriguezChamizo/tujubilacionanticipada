# Tu Jubilación Anticipada

Portal informativo sobre **jubilación anticipada en España**: blog, simulador interactivo
y guía en PDF. Construido con [Astro](https://astro.build).

> Claim: _Entiende tu pensión. Decide cuándo jubilarte._

## Stack

- **Astro 4** con TypeScript (modo estricto)
- **React 18** para el simulador (isla `client:load`)
- **Tailwind CSS 3** (+ `@tailwindcss/typography`)
- **MDX** para los artículos del blog
- Colecciones de contenido tipadas con **Zod**
- Sitemap automático (`@astrojs/sitemap`)

## Requisitos

- **Node 20** (Astro 4 requiere ≥ 18.14.1). Hay un `.nvmrc` con la versión.

```bash
nvm use            # usa Node 20
npm install
```

> Nota: `@astrojs/sitemap` está fijado a `3.2.1`. Las versiones 3.3+ requieren Astro 5.

## Scripts

```bash
npm run dev        # servidor de desarrollo en http://localhost:4321
npm run build      # astro check + build de producción (genera /dist)
npm run preview    # sirve el build de producción
```

## Estructura

```
src/
├── pages/                 # rutas (/, /simulador, /blog, /guia-…, legales)
│   └── blog/              # listado paginado + [slug]
├── content/blog/          # artículos en MDX (colección tipada con Zod)
├── components/            # Header, Footer, Simulador.jsx, ArticleCard, CTAGuia…
├── layouts/               # Base.astro (SEO) y BlogPost.astro
├── lib/                   # posts.ts (utilidades) y schema.ts (JSON-LD)
├── styles/global.css
└── consts.ts              # configuración centralizada del sitio
```

## SEO y datos estructurados

- Meta `title`/`description` por página, canonical, Open Graph y Twitter Card.
- JSON-LD (Schema.org) enlazado por `@id`: `Organization`, `WebSite`, `WebPage`,
  `BlogPosting`, `Blog`/`CollectionPage`, `Product`, `FAQPage`, `WebApplication`,
  `BreadcrumbList` y `AboutPage`.
- `sitemap-index.xml` y `robots.txt`.

## Pendiente (marcado en el código)

- Conectar la captura de email del simulador con el proveedor real (hay un `TODO`).
- Pasarela de pago de la guía (ahora usa `mailto:` como CTA temporal).
- Datos del titular en el aviso legal (placeholder).

## Aviso

El contenido y el simulador son **orientativos** y no constituyen asesoramiento
profesional ni sustituyen la información oficial de la Seguridad Social.
