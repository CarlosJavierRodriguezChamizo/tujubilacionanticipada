# Informe de mejora continua — 2026-08-01

## Resumen
Se ha reforzado la arquitectura de silo enlazando los 3 hubs de categoría (Tipos, Cálculos, Planificación) desde /blog y desde la home, reduciendo la profundidad de clics hasta cualquier artículo publicado.

## Cambios aplicados

### seo seo-003 — Enlazar los 3 hubs de silo desde el listado /blog
**Qué:** Bloque `<nav aria-label="Categorías del blog">` en `src/pages/blog/index.astro`, con un enlace a cada silo publicado, fuera del listado paginado de artículos.
**Por qué:** /blog solo ofrecía paginación cronológica de 6 en 6, sin ningún acceso por categoría.
**Hipótesis:** Enlazar los 3 hubs de silo desde /blog reduce la profundidad de clics hasta cualquier artículo.
**Cómo lo mediremos:** GSC — profundidad de clics/impresiones de artículos de estos 3 silos vs periodo previo, a 21-28 días.
**Riesgo identificado:** Si una categoría cae por debajo de 3 artículos publicados, su enlace desaparecerá automáticamente al recompilar (comportamiento deseado).
**Archivos:** src/pages/blog/index.astro

### seo seo-004 — Enlazar los 3 hubs de silo desde la home
**Qué:** Sección "Explora por categoría" en `src/pages/index.astro`, con el mismo bloque de navegación a los 3 silos.
**Por qué:** La home solo enlazaba a /blog y a los 3 últimos artículos; un artículo antiguo podía quedar a varias páginas de paginación de distancia.
**Hipótesis:** Enlazar los 3 silos desde la home deja las 31 URLs de artículo a ≤2 clics de '/'.
**Cómo lo mediremos:** GSC — cobertura de indexación/impresiones de artículos más antiguos (≤2026-06-25) vs periodo previo, a 21 días.
**Riesgo identificado:** Mismo riesgo menor que seo-003 (enlace condicionado al umbral de 3 artículos).
**Archivos:** src/pages/index.astro

## Incidencias
Ninguna. Ambas tareas tocaron únicamente archivos permitidos y `npm run build` pasó tras cada una (verificado por el orquestador, no solo por el subagente).

## Estado del backlog
9 pendientes · 4 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes
