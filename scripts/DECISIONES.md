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
- Qué: El <nav aria-label="Migas de pan"> y el BreadcrumbList JSON-LD pasan de 3 a 4 niveles (Inicio / Blog / Silo / título), reutilizando categoryHref y el umbral de silo (≥3 posts publicados) ya introducidos en ux-001, sin duplicar lógica. Para categorías sin silo la miga se mantiene en 3 niveles.
- Por qué: breadcrumbSchema() solo recibía 3 niveles; la estrategia exige que la miga incluya el silo para reforzar la señal de estructura jerárquica ante los buscadores.
- Hipótesis: Añadir el silo a la miga refuerza la señal de estructura jerárquica del sitio ante los buscadores.
- Criterio de éxito: nav con 4 enlaces y BreadcrumbList con itemListElement.length === 4, position 3 → URL del silo. Cumplido y verificado (build, muestra de dist).
- Métrica y plazo: GSC a 21 días — aparición de breadcrumbs enriquecidos en resultados y evolución de impresiones/CTR por categoría.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-05 — seo-007 Referenciar el @id del revisor desde el JSON-LD de los 31 artículos (seo)
- Archivos: src/lib/schema.ts
- Qué: Nueva reviewerReferenceSchema() (con fallback a Person completo si el revisor no tiene página propia) sustituye a reviewerPersonSchema() dentro de blogPostingSchema(); reviewedBy pasa a ser una referencia { "@id": ".../equipo/javier-rodriguez#person" } que reutiliza el @id ya construido en seo-006, en vez de un objeto Person duplicado.
- Por qué: 31 artículos incrustaban copias sueltas del mismo Person; el grafo de conocimiento debe conectarlos con una única entidad.
- Hipótesis: Referenciar el @id conecta cada BlogPosting con una única entidad Person en el grafo de conocimiento.
- Criterio de éxito: reviewedBy = { "@id": ... } en el JSON-LD, coincidiendo con el @id publicado en /equipo/javier-rodriguez. Cumplido y verificado (build, muestra de 4 artículos).
- Métrica y plazo: GSC/Rich Results Test a 21 días — sin errores de Person/reviewedBy, entidad unificada.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-05 — seo-008 Mencionar y enlazar al revisor desde /sobre-este-sitio (seo)
- Archivos: src/pages/sobre-este-sitio.astro
- Qué: La sección "Quién está detrás" nombra a Javier Rodríguez con <a href="/equipo/javier-rodriguez"> y su cargo literal leído de scripts/calendario.json (solo lectura), sin credenciales ni cifras inventadas.
- Por qué: /sobre-este-sitio no mencionaba a ningún ser humano, debilitando la señal EEAT a nivel de sitio.
- Hipótesis: Nombrar y enlazar al revisor editorial desde la página "about" refuerza la señal EEAT a nivel de sitio.
- Criterio de éxito: /dist/sobre-este-sitio/index.html contiene el enlace y el nombre/cargo literal. Cumplido y verificado (build, grep).
- Métrica y plazo: GSC a 21 días — impresiones/CTR de /equipo/javier-rodriguez y /sobre-este-sitio.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-05 — seo-009 Añadir el campo category al índice de posts que usa rehypeInlineBlocks (seo)
- Archivos: astro.config.mjs
- Qué: loadPostsIndex() extrae ahora también category del frontmatter (mismo helper field() ya usado para title/description/draft) en cada objeto de POSTS_INDEX. rehype-plugins.mjs no lee aún ese campo (confirmado por inspección): es solo preparación de datos para seo-011.
- Por qué: Sin category en el índice no hay forma de priorizar "misma categoría primero" en las lecturas recomendadas en una tarea futura.
- Hipótesis: Añadir category al índice permite priorizar la misma categoría en la selección de lecturas recomendadas (seo-011, aún no ejecutada).
- Criterio de éxito: POSTS_INDEX incluye category por artículo; `npm run build` pasa y el HTML no cambia. Cumplido: diff -rq de dist/ antes/después sin diferencias.
- Métrica y plazo: No aplica (preparación de datos sin efecto observable todavía; se medirá en seo-011).
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-08-08 — ux-002 Enlazar la caja "Revisado por" del artículo a la página del revisor (ux)
- Archivos: src/layouts/BlogPost.astro
- Qué: La foto y el nombre "Javier Rodríguez" en la caja "Revisado por" del artículo ahora son un <a href="/equipo/javier-rodriguez">, sin JS, sin cambios de diseño ni contraste.
- Por qué: La caja de revisor no enlazaba a ningún sitio; en un sitio YMYL, poder verificar con un clic quién revisa el contenido refuerza la confianza percibida.
- Hipótesis: Enlazar el nombre del revisor a su página mejora la confianza percibida sin fricción añadida.
- Criterio de éxito: 31/31 artículos con reviewedBy enlazan a /equipo/javier-rodriguez desde la caja. Cumplido y superado: 41/41 (hoy hay 41 artículos, no 31).
- Métrica y plazo: No hay métrica de tráfico directa; se revisará cualitativamente en la próxima replanificación (percepción de confianza, no medible por analítica estándar).
- Commit: 7afd880
- Veredicto del CEO: pendiente

## 2026-08-08 — seo-010 Crear script de medición de enlaces internos entrantes sobre /dist (seo)
- Archivos: scripts/contar-enlaces-internos.mjs (nuevo)
- Qué: Script Node sin dependencias que cuenta, tras npm run build, los enlaces entrantes desde el cuerpo (bloques "Lectura recomendada" + "Artículos relacionados") hacia cada URL /blog/<slug> en /dist.
- Por qué: No existía forma objetiva y repetible de verificar el diagnóstico "dos artículos concentran ~30 entrantes y el resto tiene 0", ni de medir el efecto de una redistribución futura.
- Hipótesis: Con esta herramienta se puede confirmar el diagnóstico y usarlo como línea base para medir seo-011.
- Criterio de éxito: El script existe, imprime tabla + mínimo/máximo/mediana, y confirma >=2 URLs con >=25 entrantes y >=20 URLs con 0. Cumplido: mínimo 0, máximo 40, mediana 0, 23/41 URLs con 0 entrantes.
- Métrica y plazo: Línea base "antes" trasladada aquí; el "después" se mide en seo-011 (mismo día).
- Commit: b27a90e
- Veredicto del CEO: pendiente

## 2026-08-08 — seo-011 Redistribuir la selección de "lectura recomendada" en rehypeInlineBlocks (seo)
- Archivos: src/lib/rehype-plugins.mjs
- Qué: recoPick ya no arranca siempre en 0 sobre el índice alfabético fijo; ahora rota por un hash determinista del slug de cada artículo, prioriza primero los artículos de su misma categoría, y sube a 3 bloques de recomendación en artículos con >=5 H2. rehypeExternalLinks y DOFOLLOW_HOSTS quedan sin modificar.
- Por qué: La concentración de enlaces internos (diagnosticada en seo-010: 23/41 URLs con 0 entrantes, 2 URLs con 40) venía de que recoPick arrancaba siempre en el mismo índice sobre un array ordenado alfabéticamente por readdirSync.
- Hipótesis: Un punto de partida determinista por slug (en vez de fijo en 0) reparte el enlazado interno automático por todo el índice.
- Criterio de éxito: Ninguna URL con <3 entrantes ni >3×mediana (combinando reco+related); npm run build pasa. PARCIALMENTE cumplido (65.9%, 27/41 URLs): 0/41 URLs con 0 entrantes (antes 23/41), máximo 40->18, mediana 4. Aislado al mecanismo que esta tarea controla (reco): mínimo 1, máximo 5, mediana 3, dentro de rango razonable. El 34.1% restante no cumple por el residuo de src/components/RelatedArticles.astro, que prioriza "misma categoría, orden de getPublishedPosts()" sin ninguna rotación y queda fuera del alcance de esta tarea (no modificado).
- Métrica y plazo: Medido hoy mismo con scripts/contar-enlaces-internos.mjs (seo-010). Recomendación para una tarea futura: aplicar la misma rotación por hash-de-slug en RelatedArticles.astro para cerrar el 34.1% restante.
- Commit: e0d26a9
- Veredicto del CEO: pendiente
