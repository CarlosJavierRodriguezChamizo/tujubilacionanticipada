# Informe de mejora continua — 2026-08-05

## Resumen
Se han ejecutado 4 tareas SEO: se ha cerrado el objetivo estratégico "página de entidad del revisor" conectando su @id al JSON-LD de los artículos y a /sobre-este-sitio, se ha añadido el silo a la miga de pan del artículo, y se ha preparado el índice de datos para la redistribución del enlazado interno.

## Cambios aplicados

### seo seo-005 — Incluir el silo en la miga de pan (breadcrumb) del artículo
**Qué:** Añadido el nivel del silo tanto al `<nav aria-label="Migas de pan">` visible como al BreadcrumbList JSON-LD en BlogPost.astro, reutilizando el helper de slugs existente.
**Por qué:** La miga solo tenía 3 niveles (Inicio/Blog/título); faltaba la señal de estructura jerárquica que exige la estrategia.
**Hipótesis:** Una miga de 4 niveles (Inicio/Blog/Silo/título) refuerza la señal de estructura jerárquica del sitio ante los buscadores.
**Cómo lo mediremos:** Impresiones/CTR del breadcrumb rich result en Google Search Console a 21 días; validación en la Prueba de Resultados Enriquecidos de Google.
**Riesgo identificado:** Ninguno relevante.
**Archivos:** `src/layouts/BlogPost.astro`

### seo seo-007 — Referenciar el @id del revisor desde el JSON-LD de los artículos
**Qué:** `reviewedBy` en `blogPostingSchema()` ahora referencia `{"@id": ".../equipo/javier-rodriguez#person"}` en lugar de embeber un objeto Person completo en cada artículo, con fallback al Person completo si un futuro revisor no tuviera página de entidad propia.
**Por qué:** Conecta el grafo de conocimiento con una única entidad Person en vez de copias sueltas del mismo nombre en 38 artículos.
**Hipótesis:** Referenciar el @id estable en vez de duplicar el Person conecta cada BlogPosting con la misma entidad verificable.
**Cómo lo mediremos:** Validación del reviewedBy en la Prueba de Resultados Enriquecidos de Google; seguimiento en GSC a 21 días.
**Riesgo identificado:** Si se incorpora un segundo revisor sin página de entidad propia, su reviewedBy seguirá generando el Person embebido completo (fallback intencionado, a vigilar).
**Archivos:** `src/lib/schema.ts`

### seo seo-008 — Mencionar y enlazar al revisor desde /sobre-este-sitio
**Qué:** Añadida mención a Javier Rodríguez con su cargo literal (leído de calendario.json, solo lectura) y enlace `<a href="/equipo/javier-rodriguez">` en la sección "Quién está detrás".
**Por qué:** La página no mencionaba a ningún ser humano, debilitando la señal EEAT a nivel de sitio.
**Hipótesis:** Nombrar y enlazar al revisor editorial en /sobre-este-sitio refuerza la señal EEAT a nivel de sitio, no solo por artículo.
**Cómo lo mediremos:** Impresiones/CTR de /sobre-este-sitio en GSC a 21 días.
**Riesgo identificado:** Ninguno.
**Archivos:** `src/pages/sobre-este-sitio.astro`

### seo seo-009 — Añadir el campo category al índice de posts que usa rehypeInlineBlocks
**Qué:** `loadPostsIndex()` en astro.config.mjs añade el campo `category` a cada objeto de POSTS_INDEX, sin tocar la lógica de selección de rehype-plugins.mjs.
**Por qué:** Prepara los datos necesarios para que seo-011 pueda priorizar "misma categoría primero" en las recomendaciones de lectura.
**Hipótesis:** Añadir category al índice permite a una tarea futura priorizar recomendaciones de la misma categoría, sin cambiar el comportamiento actual.
**Cómo lo mediremos:** No aplica métrica de tráfico (tarea de preparación de datos); verificado que el HTML generado es idéntico antes/después (diff -rq sin diferencias).
**Riesgo identificado:** Ninguno.
**Archivos:** `astro.config.mjs`

## Incidencias
- **ux-002** (enlazar la caja "Revisado por" a la página del revisor) comparte archivo (`src/layouts/BlogPost.astro`) con seo-005, de mayor prioridad. Por la salvaguarda de colisión de archivos, se ejecutó solo seo-005 y ux-002 queda pendiente para la próxima ejecución.
- Ninguna ruta prohibida (`src/content/blog/**`, `scripts/calendario.json`, `.github/**`) fue tocada. `npm run build` pasó tras cada tarea y en la verificación final combinada (58 páginas).

## Estado del backlog
3 pendientes · 10 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes
