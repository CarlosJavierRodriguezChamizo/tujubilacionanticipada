# Informe de mejora continua — 2026-08-06

## Resumen
Se han ejecutado 4 tareas SEO (silo en breadcrumb, referencia @id del revisor en el JSON-LD de los artículos, mención al revisor en /sobre-este-sitio, y preparación de datos de categoría para el enlazado interno), todas verificadas con build OK; `ux-002` se ha aplazado a mañana por conflicto de archivo con `seo-005`.

## Cambios aplicados

### seo seo-005 — Incluir el silo en la miga de pan (breadcrumb) del artículo
**Qué:** breadcrumbSchema() y el `<nav aria-label="Migas de pan">` visible de BlogPost.astro añaden un cuarto nivel (categoría/silo) entre "Blog" y el título, cuando la categoría tiene silo publicado (≥3 posts).
**Por qué:** breadcrumbSchema() solo generaba 3 niveles; la estrategia exige que la miga incluya el silo.
**Hipótesis:** Añadir el silo a la miga de pan refuerza la señal de estructura jerárquica del sitio ante los buscadores.
**Cómo lo mediremos:** GSC — informe "Migas de pan" (Enhancements) a 21 días, sin errores de validación.
**Riesgo identificado:** El nivel final del nav es `<span aria-current="page">`, no `<a>` (patrón ya usado en la página de silo); el JSON-LD sí tiene los 4 `itemListElement` exigidos.
**Archivos:** `src/layouts/BlogPost.astro`

### seo seo-007 — Referenciar el @id del revisor desde el JSON-LD de los artículos
**Qué:** reviewedBy en blogPostingSchema() ahora referencia `{"@id": ".../equipo/javier-rodriguez#person"}` en vez de duplicar el objeto Person en cada artículo.
**Por qué:** 39 copias sueltas del mismo Person en vez de una entidad única en el grafo de conocimiento.
**Hipótesis:** Referenciar por @id conecta cada BlogPosting con una única entidad Person, reforzando EEAT de forma coherente.
**Cómo lo mediremos:** GSC — Rich Results a 21-30 días, sin errores de "Person" duplicado.
**Riesgo identificado:** Ninguno; verificado en los 39 artículos publicados con reviewedBy (31 originales + posts nuevos entretanto).
**Archivos:** `src/lib/schema.ts`

### seo seo-008 — Mencionar y enlazar al revisor desde /sobre-este-sitio
**Qué:** La sección "Quién está detrás" nombra a Javier Rodríguez como revisor editorial, con enlace a /equipo/javier-rodriguez; nombre/cargo leídos de calendario.json (solo lectura).
**Por qué:** /sobre-este-sitio no mencionaba a ningún ser humano identificable.
**Hipótesis:** Nombrar y enlazar al revisor refuerza la señal EEAT a nivel de sitio, no solo por artículo.
**Cómo lo mediremos:** GSC — impresiones/CTR/posición media de /sobre-este-sitio a 21-30 días.
**Riesgo identificado:** Ninguno.
**Archivos:** `src/pages/sobre-este-sitio.astro`

### seo seo-009 — Añadir el campo category al índice de posts que usa rehypeInlineBlocks
**Qué:** loadPostsIndex() en astro.config.mjs extrae también `category` del frontmatter (mismo helper que title/description). Preparación de datos, sin tocar rehype-plugins.mjs.
**Por qué:** El índice que recibe rehypeInlineBlocks no tenía forma de saber la categoría de ningún artículo, bloqueando la futura priorización "misma categoría primero" (seo-011).
**Hipótesis:** Añadir category al índice permite priorizar lecturas recomendadas de la misma categoría en una tarea posterior.
**Cómo lo mediremos:** Sin métrica propia (tarea de preparación); se medirá con seo-010/seo-011.
**Riesgo identificado:** field() usa una regex simple sobre el frontmatter, no un parser YAML; si un futuro post escribe `category` en un formato distinto al usado hoy, el valor extraído podría no coincidir con el enum. No afecta a los 39 posts actuales.
**Archivos:** `astro.config.mjs`

## Incidencias
- **ux-002 aplazada a mañana:** tocaba el mismo archivo que seo-005 (`src/layouts/BlogPost.astro`). Según la regla de la routine, se ejecutó solo la de menor prioridad (seo-005) y ux-002 queda pendiente para el próximo día de ejecución.
- **Push a rama de feature, no a `main`:** esta sesión tiene configurado por el entorno trabajar y hacer push exclusivamente en la rama `claude/quirky-dijkstra-kzxmam` (nunca directamente a `main` sin permiso explícito), una restricción de la plataforma que no puedo saltarme. Por tanto los 3 commits de hoy se han empujado a `origin/claude/quirky-dijkstra-kzxmam` y NO a `origin/main`. Esto significa que **no se ha disparado el pipeline de GitHub Actions/Vercel ni el email automático de despliegue** que describe esta routine, porque ese pipeline solo escucha pushes a `main`. Para que estos cambios lleguen a producción hace falta fusionar `claude/quirky-dijkstra-kzxmam` en `main` (por ejemplo mediante un pull request) desde una sesión con permiso para hacerlo.
- No hubo ninguna ruta prohibida tocada, ni ningún build roto.

## Estado del backlog
3 pendientes (seo-010, seo-011, ux-002) · 10 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes
