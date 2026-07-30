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

## 2026-07-30 — seo-003 Enlazar los 3 hubs de silo desde el listado /blog (seo)
- Archivos: src/pages/blog/index.astro
- Qué: Bloque <nav aria-label="Categorías del blog"> con un enlace a cada silo publicado, insertado entre el H1 y el listado paginado de artículos. Reutiliza el umbral MIN_POSTS_PER_SILO=3 (mismo criterio que blog/categoria/[categoria].astro) y getCategorySlug() de src/lib/categories.ts.
- Por qué: /blog solo ofrecía paginación por fecha (6 en 6), sin acceso directo por categoría, aumentando la profundidad de clic hasta artículos de páginas posteriores.
- Hipótesis: Un bloque de enlaces a los 3 hubs de silo desde /blog reduce la profundidad de clics hasta cualquier artículo.
- Criterio de éxito: Las 3 rutas /blog/categoria/... presentes en dist/blog/index.html fuera del listado de artículos; `npm run build` pasa. Cumplido.
- Métrica y plazo: Evolución de indexación/impresiones de artículos de páginas 2+ de paginación y de las 3 URLs de silo en GSC a 21 días.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-07-30 — seo-004 Enlazar los 3 hubs de silo desde la home (seo)
- Archivos: src/pages/index.astro
- Qué: Sección "Blog por temas" en la home con un enlace a cada silo publicado, mismo patrón y umbral (MIN_POSTS_PER_SILO=3) que seo-003, justo antes de "Últimos artículos".
- Por qué: La home solo enlazaba a /blog y a los 3 últimos artículos; un artículo antiguo podía quedar a varias páginas de paginación de distancia.
- Hipótesis: Enlazando los 3 silos desde la home, cualquier artículo publicado queda a ≤2 clics de '/' (home → silo → artículo).
- Criterio de éxito: Las 3 rutas /blog/categoria/... presentes en dist/index.html; comprobado manualmente que el artículo más antiguo (que-es-la-jubilacion-anticipada) es alcanzable en 2 clics desde home. Cumplido.
- Métrica y plazo: Impresiones/clics en GSC para las URLs de silo y para artículos previamente "huérfanos" de paginación, a 21 días.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---
