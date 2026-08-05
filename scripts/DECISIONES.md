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

## 2026-08-05 — seo-005 Incluir el silo en la miga de pan (breadcrumb) del artículo (seo)
- Archivos: src/layouts/BlogPost.astro
- Qué: Añadido el nivel del silo tanto al `<nav aria-label="Migas de pan">` visible como al array que recibe `breadcrumbSchema()`, reutilizando `categoryHref` (mismo umbral MIN_POSTS_PER_SILO=3 que el resto del sitio). Añadido también el título del artículo como último ítem visible de la miga.
- Por qué: Refuerza la señal de estructura jerárquica del sitio ante buscadores sin enlazar a silos inexistentes cuando la categoría no alcanza el umbral mínimo.
- Hipótesis: Una miga de 4 niveles (Inicio/Blog/Silo/título) en el nav visible y en el BreadcrumbList refuerza la señal de estructura jerárquica ante los buscadores.
- Criterio de éxito: BreadcrumbList con itemListElement.length===4 y position 3 apuntando al silo correcto. Cumplido y verificado en 5 artículos de 3 categorías distintas.
- Métrica y plazo: Impresiones/CTR del breadcrumb rich result en GSC a 21 días; validación en la Prueba de Resultados Enriquecidos de Google.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-05 — seo-007 Referenciar el @id del revisor desde el JSON-LD de los artículos (seo)
- Archivos: src/lib/schema.ts
- Qué: Nueva función `reviewerReferenceSchema(name, jobTitle)` que devuelve `{"@id": "<url-perfil>#person"}` cuando el revisor tiene página de entidad propia (vía `REVIEWER_PROFILES`), con fallback al Person embebido completo si no la tiene. `blogPostingSchema()` la usa ahora en `reviewedBy` en vez del Person embebido.
- Por qué: Evita duplicar copias sueltas del mismo Person en cada BlogPosting y conecta todos los artículos con la única entidad Person publicada en /equipo/javier-rodriguez.
- Hipótesis: Sustituir el Person embebido por una referencia al @id estable conecta el grafo de conocimiento con una única entidad Person en vez de copias sueltas.
- Criterio de éxito: reviewedBy = {"@id": ".../equipo/javier-rodriguez#person"} en los artículos publicados. Cumplido: 38/38 artículos verificados, 0 objetos Person embebidos duplicados.
- Métrica y plazo: Validación del reviewedBy en la Prueba de Resultados Enriquecidos de Google; seguimiento en GSC a 21 días.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-05 — seo-008 Mencionar y enlazar al revisor desde /sobre-este-sitio (seo)
- Archivos: src/pages/sobre-este-sitio.astro
- Qué: Añadida en la sección "Quién está detrás" una mención a Javier Rodríguez con su cargo literal (leído de calendario.json, solo lectura) y un enlace `<a href="/equipo/javier-rodriguez">`.
- Por qué: La página no mencionaba a ningún ser humano; nombrar y enlazar al revisor editorial refuerza la señal EEAT a nivel de sitio, no solo por artículo.
- Hipótesis: Nombrar al revisor con enlace a su página de entidad en /sobre-este-sitio refuerza la señal EEAT a nivel de sitio.
- Criterio de éxito: /dist/sobre-este-sitio/index.html contiene el enlace y el nombre. Cumplido y verificado por grep.
- Métrica y plazo: Impresiones/CTR de /sobre-este-sitio en GSC a 21 días.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-05 — seo-009 Añadir el campo category al índice de posts que usa rehypeInlineBlocks (seo)
- Archivos: astro.config.mjs
- Qué: `loadPostsIndex()` extrae ahora también el campo `category` del frontmatter de cada artículo y lo incluye en POSTS_INDEX, sin tocar `rehype-plugins.mjs` ni la lógica de selección.
- Por qué: Prepara el índice de datos para poder priorizar "misma categoría primero" en la selección de lecturas recomendadas en una tarea posterior (seo-011).
- Hipótesis: Añadir category al índice permite a una tarea futura priorizar recomendaciones de la misma categoría, sin cambiar el comportamiento actual.
- Criterio de éxito: POSTS_INDEX incluye category por artículo; HTML de /dist idéntico antes/después. Cumplido: diff -rq sin diferencias entre builds, 38 artículos con category válida.
- Métrica y plazo: No aplica (tarea de preparación de datos, sin cambio de comportamiento visible).
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---
