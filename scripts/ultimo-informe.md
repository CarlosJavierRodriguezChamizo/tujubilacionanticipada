# Informe de mejora continua — 2026-08-05

## Resumen
Ejecutadas 4 tareas SEO del backlog (breadcrumb con silo, entidad del revisor referenciada por @id, mención del revisor en /sobre-este-sitio, y preparación de datos de categoría) para reforzar la señal EEAT y la estructura jerárquica del sitio; ux-002 quedó aplazada a mañana por tocar el mismo archivo que seo-005.

## Cambios aplicados

### seo seo-005 — Incluir el silo en la miga de pan (breadcrumb) del artículo
**Qué:** El nav de migas de pan y el BreadcrumbList JSON-LD de cada artículo pasan de 3 a 4 niveles (Inicio / Blog / Silo / título), reutilizando la lógica de silo ya introducida en ux-001.
**Por qué:** breadcrumbSchema() solo recibía 3 niveles; la estrategia exige que la miga incluya el silo.
**Hipótesis:** Reforzar la señal de estructura jerárquica del sitio ante los buscadores.
**Cómo lo mediremos:** GSC a 21 días — breadcrumbs enriquecidos en resultados, impresiones/CTR por categoría.
**Riesgo identificado:** Bajo, cambio aditivo; ya preparado para categorías sin silo (se omite el nivel).
**Archivos:** src/layouts/BlogPost.astro

### seo seo-007 — Referenciar el @id del revisor desde el JSON-LD de los 31 artículos
**Qué:** reviewedBy en blogPostingSchema() pasa de un objeto Person embebido a una referencia { "@id": ".../equipo/javier-rodriguez#person" }, reutilizando el @id de seo-006.
**Por qué:** 31 artículos incrustaban copias sueltas del mismo Person en vez de apuntar a una entidad única.
**Hipótesis:** Conectar cada BlogPosting con una única entidad Person en el grafo de conocimiento.
**Cómo lo mediremos:** Rich Results Test / GSC a 21 días — sin errores de Person/reviewedBy.
**Riesgo identificado:** Bajo; fallback a Person completo si un futuro revisor no tiene página propia.
**Archivos:** src/lib/schema.ts

### seo seo-008 — Mencionar y enlazar al revisor desde /sobre-este-sitio
**Qué:** La sección "Quién está detrás" nombra a Javier Rodríguez con enlace a /equipo/javier-rodriguez y su cargo literal de calendario.json.
**Por qué:** /sobre-este-sitio no mencionaba a ningún ser humano, señal EEAT débil a nivel de sitio.
**Hipótesis:** Reforzar la señal EEAT a nivel de sitio (no solo por artículo).
**Cómo lo mediremos:** GSC a 21 días — impresiones/CTR de /equipo/javier-rodriguez y /sobre-este-sitio.
**Riesgo identificado:** Bajo, cambio de texto aditivo sin credenciales inventadas.
**Archivos:** src/pages/sobre-este-sitio.astro

### seo seo-009 — Añadir el campo category al índice de posts que usa rehypeInlineBlocks
**Qué:** loadPostsIndex() en astro.config.mjs extrae también category del frontmatter de cada artículo.
**Por qué:** Preparación de datos necesaria para poder priorizar "misma categoría primero" en seo-011 (aún no ejecutada).
**Hipótesis:** Sin category en el índice no se puede redistribuir el enlazado interno por categoría.
**Cómo lo mediremos:** No aplica todavía — sin efecto observable (verificado: HTML idéntico antes/después); se medirá al ejecutar seo-011.
**Riesgo identificado:** Mínimo; rehype-plugins.mjs no lee aún el campo, confirmado por inspección.
**Archivos:** astro.config.mjs

## Incidencias
ux-002 (prioridad 9) tocaba el mismo archivo que seo-005 (src/layouts/BlogPost.astro); según la regla de la routine se ejecutó solo la de menor prioridad (seo-005) y ux-002 queda pendiente para mañana. Ninguna ruta prohibida fue tocada. Ningún build falló (58 páginas generadas tras cada tarea).

Nota del orquestador: esta sesión tiene fijada como rama de trabajo `claude/quirky-dijkstra-r0rpu3` con la política "nunca hacer push a una rama distinta sin permiso explícito". Por eso, en vez de `git push origin main` directo (Paso 6 de la routine), el commit de hoy se sube a esa rama y se abre un pull request contra `main`, siguiendo el mismo patrón de PRs ya usado en días anteriores (#6, #7, #8, #9). Si se prefiere que la routine empuje directo a main en el futuro, hay que autorizarlo explícitamente.

## Estado del backlog
3 pendientes (ux-002, seo-010, seo-011) · 10 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes
