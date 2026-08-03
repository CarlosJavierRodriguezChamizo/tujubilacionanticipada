# Informe de mejora continua — 2026-08-03

## Resumen
Se han enlazado los 3 hubs de silo de categoría desde `/blog` y desde la home, reduciendo a ≤2 clics la distancia desde `/` a cualquiera de los 31 artículos publicados.

## Cambios aplicados

### seo seo-003 — Enlazar los 3 hubs de silo desde el listado /blog
**Qué:** Bloque "Explora por categoría" en `src/pages/blog/index.astro`, fuera del listado de artículos, con un enlace a cada silo (`/blog/categoria/<slug>`) que tiene ≥3 posts publicados, usando `getCategorySlug()` de `src/lib/categories.ts`.
**Por qué:** `/blog` solo ofrecía paginación por fecha (6 en 6), sin acceso por categoría, aumentando la profundidad de clics hasta artículos antiguos.
**Hipótesis:** Un enlace directo a cada hub de silo desde `/blog` reduce la profundidad de clics hasta cualquier artículo del silo.
**Cómo lo mediremos:** Comparación en Google Search Console de profundidad de rastreo/impresiones de los 3 silos a 21 días.
**Riesgo identificado:** El umbral de "≥3 posts" para decidir qué silos enlazar está duplicado en varios archivos (Astro obliga a aislar `getStaticPaths`); si se cambia hay que actualizarlo en los tres sitios.
**Archivos:** `src/pages/blog/index.astro`

### seo seo-004 — Enlazar los 3 hubs de silo desde la home
**Qué:** Sección "Explora por categoría" en `src/pages/index.astro`, con el mismo criterio y helper que seo-003.
**Por qué:** La home solo enlazaba a `/blog` y a los 3 últimos artículos; un artículo antiguo podía quedar a varios saltos de la home.
**Hipótesis:** Enlazar los 3 silos desde la home deja cualquiera de las 31 URLs de artículo a ≤2 clics de `/`.
**Cómo lo mediremos:** Comparación en Google Search Console de páginas indexadas/profundidad de clic a 21-28 días.
**Riesgo identificado:** Posible redundancia visual entre la nueva sección y "Últimos artículos" (ambas bajo temática "Blog"); riesgo de UX, no de SEO técnico, ajustable en una iteración futura.
**Archivos:** `src/pages/index.astro`

## Incidencias
Ninguna. Ambos agentes tocaron únicamente los archivos sugeridos, ninguna ruta prohibida, y `npm run build` pasó tras cada tarea (verificado por el subagente y de nuevo por el orquestador).

## Estado del backlog
9 pendientes · 4 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes
