# Registro de decisiones — mejora continua

Cada entrada la escribe el orquestador tras ejecutar una tarea. El CEO lee este
archivo para evaluar hipótesis en la siguiente replanificación.

Formato:

```
## [fecha] — [id] [título] (área)
- Archivos: ...
- Qué: ...
- Por qué: ...
- Hipótesis: ...
- Criterio de éxito: ...
- Métrica y plazo: ...
- Commit: [sha]
- Veredicto del CEO: pendiente
```

---

## 2026-07-29 — seo-001 Crear helper de slugs de categoría (silos) como fuente única de verdad (seo)
- Archivos: src/lib/categories.ts (nuevo)
- Qué: Módulo con mapeo explícito y tipado de las 4 BLOG_CATEGORIES a su slug kebab-case, con getCategorySlug() y getCategoryFromSlug(). No se consume aún desde ninguna página.
- Por qué: Sin una fuente única de verdad, cada página futura (silos, breadcrumb, enlaces desde home/blog) inventaría su propio slugify, arriesgando slugs inconsistentes entre implementaciones.
- Hipótesis: Centralizar el mapping nombre→slug hace que todas las páginas de silo, breadcrumb y enlaces usen siempre el mismo slug.
- Criterio de éxito: getCategorySlug() devuelve los 3 slugs exactos exigidos; `npm run build` pasa sin que nada consuma aún el helper. Cumplido.
- Métrica y plazo: Verificación estructural inmediata (no hay métrica de tráfico hasta que se consuma en tareas futuras).
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-07-29 — seo-002 Crear las páginas de silo /blog/categoria/<slug> para categorías con ≥3 artículos (seo)
- Archivos: src/pages/blog/categoria/[categoria].astro (nuevo)
- Qué: Página dinámica Astro que genera un hub por categoría con ≥3 artículos publicados (Tipos, Cálculos, Planificación), listado completo sin paginar, JSON-LD CollectionPage + BreadcrumbList, reutilizando getCategorySlug (seo-001), getPublishedPosts, BlogListing y schema.ts existentes.
- Por qué: Hoy el único listado es /blog paginado de 6 en 6; la agrupación temática solo existe en frontmatter, invisible para el rastreo.
- Hipótesis: Publicar una página estática por silo permite a Google rastrear la estructura temática del sitio.
- Criterio de éxito: Existen exactamente las 3 páginas de silo esperadas, no existe la de "actualidad-y-casos-practicos" (0 artículos), cada una con CollectionPage+BreadcrumbList y listado completo. Cumplido y verificado (build, grep, sitemap).
- Métrica y plazo: Indexación de las 3 URLs en GSC a 21 días; impresiones/clics segmentados a 21-30 días.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-07-31 — seo-003 Enlazar los 3 hubs de silo desde el listado /blog (seo)
- Archivos: src/pages/blog/index.astro
- Qué: Bloque <nav aria-label="Categorías del blog"> con enlaces a los 3 silos publicados, fuera del listado de artículos. Enlaces generados dinámicamente vía getCategorySlug() (seo-001) y el mismo umbral MIN_POSTS_PER_SILO=3 usado en las páginas de silo (seo-002), sin slugs hardcodeados.
- Por qué: /blog solo ofrecía paginación por fecha (6 en 6) sin acceso por categoría; esto da acceso directo a los 3 hubs desde la página raíz del blog.
- Hipótesis: Reduce la profundidad de clics hasta cualquier artículo.
- Criterio de éxito: /dist/blog/index.html contiene los 3 <a href="/blog/categoria/..."> fuera del listado; build pasa. Cumplido y verificado (build OK, grep OK).
- Métrica y plazo: Profundidad de rastreo/clics a artículos de cada silo en GSC a 21 días.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-07-31 — seo-004 Enlazar los 3 hubs de silo desde la home (seo)
- Archivos: src/pages/index.astro
- Qué: Sección "Explora por categoría" antes de "Últimos artículos", con enlaces dinámicos a los 3 silos reutilizando la misma fuente de verdad que seo-003 (getCategorySlug + MIN_POSTS_PER_SILO=3).
- Por qué: La home solo enlazaba a /blog y a los 3 últimos artículos; un artículo antiguo podía quedar a varios clics de distancia.
- Hipótesis: Las 31 URLs de artículo quedan a ≤2 clics de '/' (home → silo → artículo).
- Criterio de éxito: /dist/index.html contiene los 3 <a href="/blog/categoria/...">. Cumplido y verificado (build OK, grep OK, enlace home→silo→artículo más antiguo confirmado en ≤2 clics).
- Métrica y plazo: Cobertura/indexación de artículos antiguos y crawl frequency del artículo más antiguo en GSC a 21 días.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---
