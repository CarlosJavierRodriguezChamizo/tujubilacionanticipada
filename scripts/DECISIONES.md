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

## 2026-08-03 — seo-003 Enlazar los 3 hubs de silo desde el listado /blog (seo)
- Archivos: src/pages/blog/index.astro
- Qué: Bloque "Explora por categoría" fuera del listado de artículos, con un <a href="/blog/categoria/<slug>"> por cada silo con ≥3 posts publicados, usando getCategorySlug() (seo-001).
- Por qué: /blog solo ofrecía paginación por fecha (6 en 6) sin acceso por categoría, aumentando la profundidad de clics hasta artículos antiguos.
- Hipótesis: Un enlace directo a cada hub de silo desde /blog reduce la profundidad de clics hasta cualquier artículo del silo.
- Criterio de éxito: Las 3 rutas de silo publicado aparecen en /dist/blog/index.html fuera del listado; `npm run build` pasa. Cumplido y verificado (build, grep).
- Métrica y plazo: Comparación en GSC de profundidad de rastreo/impresiones de los 3 silos a 21 días.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-03 — seo-004 Enlazar los 3 hubs de silo desde la home (seo)
- Archivos: src/pages/index.astro
- Qué: Sección "Explora por categoría" en la home con un enlace por cada silo con ≥3 posts publicados (mismo umbral y helper que seo-002/seo-003).
- Por qué: La home solo enlazaba a /blog y a los 3 últimos artículos; un artículo antiguo podía quedar a varios saltos de la home.
- Hipótesis: Enlazar los 3 silos desde la home deja cualquiera de las 31 URLs de artículo a ≤2 clics de '/'.
- Criterio de éxito: Las 3 rutas de silo aparecen en /dist/index.html; ruta home→silo→artículo verificada en ≤2 saltos para el artículo más antiguo. Cumplido y verificado (build, grep, comprobación manual).
- Métrica y plazo: Comparación en GSC de páginas indexadas/profundidad de clic a 21-28 días.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-04 — ux-001 Convertir la categoría del artículo en un enlace visible a su silo (ux)
- Archivos: src/layouts/BlogPost.astro
- Qué: El eyebrow de categoría de la cabecera del artículo ahora envuelve el texto en `<a href="/blog/categoria/<slug>">` usando getCategorySlug() (seo-001), solo cuando la categoría tiene silo (≥3 posts publicados, mismo umbral que [categoria].astro). Enlace sin JS, contraste AA.
- Por qué: El texto de categoría era plano, sin salida lateral; cada artículo carecía de enlace saliente a su silo.
- Hipótesis: Convertir la categoría en enlace al silo mejora la orientación del lector y da a cada artículo ≥1 enlace saliente a su silo.
- Criterio de éxito: En /dist/blog/*/index.html el texto de categoría es un `<a href="/blog/categoria/<slug-correcto>">` dentro del header. Cumplido: 35/35 artículos de categorías con silo; los 2 de "Actualidad y casos prácticos" (2 posts) sin enlace por diseño (evita 404).
- Métrica y plazo: GSC/analítica a 30 días — CTR de navegación blog→silo y páginas por sesión de usuarios que entran a un artículo desde buscadores.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-04 — seo-006 Crear la página de entidad del revisor /equipo/javier-rodriguez (seo)
- Archivos: src/pages/equipo/javier-rodriguez.astro (nuevo), src/lib/schema.ts
- Qué: Página indexable ProfilePage del revisor con Person JSON-LD (@id + url estables), nombre y cargo leídos literalmente de calendario.json (sin inventar credenciales; worksFor omitido a propósito). Refactor de schema.ts (reviewerPersonSchema): los 31+ artículos con reviewedBy ahora referencian el mismo @id de Person.
- Por qué: "Javier Rodríguez" aparecía 31+ veces en texto plano sin URL detrás y el Person del schema no tenía @id ni url; sin entidad verificable detrás del contenido YMYL.
- Hipótesis: Una página de persona indexable con Person @id/url estable da a Google una entidad verificable detrás del contenido YMYL.
- Criterio de éxito: Existe /dist/equipo/javier-rodriguez/index.html con Person, @id exacto y url; nombre/cargo coinciden literalmente con calendario.json. Cumplido y verificado (build, grep, sitemap).
- Métrica y plazo: GSC a 21 días — indexación de la página, impresiones/CTR de marca personal y validación del reviewedBy en Rich Results.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-06 — seo-005 Incluir el silo en la miga de pan (breadcrumb) del artículo (seo)
- Archivos: src/layouts/BlogPost.astro
- Qué: breadcrumbSchema() y el <nav aria-label="Migas de pan"> visible añaden un cuarto nivel (categoría/silo) entre "Blog" y el título, reutilizando categoryHref/getCategorySlug() (seo-001) con el mismo umbral de silo (≥3 posts). Sin silo, se mantienen 3 niveles sin inventar URL.
- Por qué: breadcrumbSchema() solo generaba 3 niveles (Inicio, Blog, título); la estrategia exige que la miga incluya el silo para reforzar la señal de estructura jerárquica.
- Hipótesis: Añadir el silo a la miga de pan (visible y JSON-LD) refuerza la señal de estructura jerárquica del sitio ante los buscadores.
- Criterio de éxito: BreadcrumbList con itemListElement.length === 4 y position 3 = URL del silo. Cumplido y verificado en 7 artículos de las 4 categorías (todas con silo actualmente).
- Métrica y plazo: GSC — informe "Migas de pan" (Enhancements) a 21 días, sin errores de validación; cobertura sin nuevas exclusiones en /blog/*.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-06 — seo-007 Referenciar el @id del revisor desde el JSON-LD de los 31 artículos (seo)
- Archivos: src/lib/schema.ts
- Qué: Nueva función reviewerRefSchema() que, si el revisor tiene página de entidad (REVIEWER_PROFILES), devuelve solo {"@id": ".../equipo/javier-rodriguez#person"} en vez del objeto Person completo; blogPostingSchema() la usa para reviewedBy. reviewerPersonSchema() se mantiene sin cambios para la página de equipo (que sí necesita el objeto Person completo como entidad canónica).
- Por qué: reviewedBy duplicaba name/jobTitle del revisor en cada uno de los artículos en vez de referenciar la entidad única creada en seo-006.
- Hipótesis: Referenciar por @id conecta cada BlogPosting con una única entidad Person, en vez de 31+ copias sueltas del mismo nombre.
- Criterio de éxito: reviewedBy = {"@id": "..."} en vez de objeto Person con name/jobTitle. Cumplido y verificado en los 39 artículos publicados con reviewedBy (31 originales + posts nuevos entretanto): 39/39 con referencia, 0 con Person embebido.
- Métrica y plazo: GSC — Rich Results / Resultados enriquecidos a 21-30 días, sin errores de "Person" duplicado.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-06 — seo-008 Mencionar y enlazar al revisor desde /sobre-este-sitio (seo)
- Archivos: src/pages/sobre-este-sitio.astro
- Qué: La sección "Quién está detrás" nombra a Javier Rodríguez como revisor editorial, con <a href="/equipo/javier-rodriguez">; nombre/cargo se leen de scripts/calendario.json (solo lectura) igual que en la página de equipo, para que no puedan divergir.
- Por qué: /sobre-este-sitio no mencionaba a ningún ser humano identificable, debilitando la señal EEAT a nivel de sitio.
- Hipótesis: Nombrar y enlazar al revisor editorial desde "Sobre este sitio" refuerza la señal EEAT a nivel de sitio, no solo por artículo.
- Criterio de éxito: <a href="/equipo/javier-rodriguez"> y el nombre "Javier Rodríguez" en /dist/sobre-este-sitio/index.html. Cumplido y verificado (build, grep).
- Métrica y plazo: GSC — impresiones/CTR/posición media de /sobre-este-sitio a 21-30 días; señales de entidad (Enhancements) a 30-60 días.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-06 — seo-009 Añadir el campo category al índice de posts que usa rehypeInlineBlocks (seo)
- Archivos: astro.config.mjs
- Qué: loadPostsIndex() extrae ahora category del frontmatter de cada .mdx (mismo helper field() que title/description), sin tocar rehype-plugins.mjs. Preparación de datos, ningún cambio de comportamiento.
- Por qué: rehypeInlineBlocks(POSTS_INDEX) no tenía forma de saber la categoría de ningún artículo, bloqueando la futura priorización "misma categoría primero" (seo-011).
- Hipótesis: Añadir category al índice permite priorizar lecturas recomendadas de la misma categoría en una tarea posterior.
- Criterio de éxito: category presente en el índice para todos los posts publicados, con uno de los 4 valores de BLOG_CATEGORIES; HTML de /dist sin cambios. Cumplido: 39/39 posts publicados con category válida; diff de dist/ antes/después idéntico byte a byte.
- Métrica y plazo: Sin métrica de tráfico propia (tarea de preparación); se medirá con seo-010/seo-011.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---
