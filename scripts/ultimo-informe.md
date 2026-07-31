# Informe de mejora continua — 2026-07-31

## Resumen
Segundo día de ejecución del ciclo: se han completado las 2 tareas SEO que enlazan los 3 hubs de silo desde `/blog` y desde la home, cerrando el bucle de enlazado interno iniciado el 2026-07-29.

## Cambios aplicados

### seo seo-003 — Enlazar los 3 hubs de silo desde el listado /blog
**Qué:** Bloque `<nav aria-label="Categorías del blog">` en `src/pages/blog/index.astro`, fuera del listado de artículos, con un enlace a cada uno de los 3 silos publicados.
**Por qué:** `/blog` solo ofrecía paginación por fecha (6 en 6) y ningún acceso por categoría.
**Hipótesis:** Reducir la profundidad de clics hasta cualquier artículo dando acceso directo a los hubs de silo desde la página raíz del blog.
**Cómo lo mediremos:** Grep de las 3 rutas de silo en `/dist/blog/index.html` (verificado); a 21 días, evolución de la profundidad de rastreo/clics a artículos de cada silo en GSC.
**Riesgo identificado:** Ninguno relevante. Los enlaces se generan dinámicamente reutilizando `getCategorySlug()` y el mismo umbral `MIN_POSTS_PER_SILO=3` que las páginas de silo, por lo que no hay slugs hardcodeados ni riesgo de enlaces a silos inexistentes.
**Archivos:** `src/pages/blog/index.astro`

### seo seo-004 — Enlazar los 3 hubs de silo desde la home
**Qué:** Nueva sección "Explora por categoría" en `src/pages/index.astro`, antes de "Últimos artículos", con enlaces dinámicos a los mismos 3 silos.
**Por qué:** La home solo enlazaba a `/blog` y a los 3 últimos artículos; un artículo antiguo podía quedar a varias páginas de paginación de distancia.
**Hipótesis:** Con seo-002 y seo-003 ya en producción, enlazar los silos desde la home deja cualquiera de los 31 artículos publicados a ≤2 clics de `/` (home → silo → artículo).
**Cómo lo mediremos:** Grep de las 3 rutas de silo en `/dist/index.html` (verificado) y comprobación manual home→silo→artículo más antiguo en ≤2 clics (verificado con `que-es-la-jubilacion-anticipada`); a 21 días, cobertura/indexación de artículos antiguos en GSC.
**Riesgo identificado:** Ninguno relevante. Misma fuente de verdad que seo-003, sin duplicación de lógica.
**Archivos:** `src/pages/index.astro`

## Incidencias
Ninguna de ejecución: ambas tareas solo tocaron sus archivos permitidos (verificado con `git status` tras cada subagente) y `npm run build` pasó en ambos casos.

**Incidencia de proceso (a revisar por el usuario):** esta sesión automatizada tiene asignada la rama `claude/quirky-dijkstra-l34bzx` con la política explícita de no empujar a una rama distinta sin permiso, mientras que esta routine está diseñada para hacer `git push origin main` directamente y así disparar el despliegue en Vercel. Para no violar esa política de rama, el commit de hoy se ha empujado a `claude/quirky-dijkstra-l34bzx` en lugar de a `main`: el despliegue automático y el smoke test de GitHub Actions **no se han disparado**. El cambio queda pendiente de que el usuario lo fusione a `main` (o autorice explícitamente el push directo a `main` en próximas ejecuciones).

## Estado del backlog
9 pendientes · 4 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes
