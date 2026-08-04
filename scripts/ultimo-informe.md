# Informe de mejora continua — 2026-08-04

## Resumen
Se ha convertido el eyebrow de categoría del artículo en un enlace a su silo, corrigiendo en la misma tarea un efecto colateral que habría creado 2 enlaces rotos.

## Cambios aplicados

### ux ux-001 — Convertir la categoría del artículo en un enlace visible a su silo
**Qué:** El eyebrow de categoría en la cabecera del artículo (`src/layouts/BlogPost.astro`) ahora es `<a href="/blog/categoria/<slug>">` cuando esa categoría tiene silo generado. Se detectó que enlazar sin comprobación generaba 2 enlaces rotos (los artículos de "Actualidad y casos prácticos", categoría por debajo del umbral de 3 posts para tener silo), así que se añadió una comprobación: se exportó `MIN_POSTS_PER_SILO` y `categoryHasSilo(postCount)` desde `src/lib/categories.ts` (fuente única, reutilizada también en `src/pages/blog/categoria/[categoria].astro`, que antes duplicaba el mismo número inline) y el eyebrow solo enlaza si el silo existe realmente; si no, se mantiene como texto plano.
**Por qué:** El texto de categoría no era interactivo ni ofrecía salida lateral hacia más contenido de la misma categoría. Enlazar sin verificar la existencia del silo habría introducido enlaces 404 en un sitio YMYL.
**Hipótesis:** Convertir el eyebrow en enlace mejora la orientación del lector (un clic a más contenido de su categoría, sin JavaScript) y cumple "cada artículo tiene ≥1 enlace saliente a su silo" para las categorías que sí tienen silo.
**Cómo lo mediremos:** Tasa de clics en el eyebrow de categoría y tasa de rebote artículo→silo (analítica), a 2-4 semanas tras el despliegue.
**Riesgo identificado:** Si en el futuro "Actualidad y casos prácticos" cruza el umbral de 3 artículos, el silo se generará automáticamente y el eyebrow enlazará solo (comportamiento correcto por diseño, sin tocar código). Riesgo menor: `BlogPost.astro` hace ahora una llamada adicional a `getPublishedPosts()` por artículo (in-memory, coste de build despreciable).
**Archivos:** `src/layouts/BlogPost.astro`, `src/lib/categories.ts`, `src/pages/blog/categoria/[categoria].astro`

## Incidencias
- **seo-005 aplazada a mañana:** tocaba el mismo archivo que ux-001 (`src/layouts/BlogPost.astro`), y la regla de la routine prohíbe ejecutar dos tareas del día sobre el mismo archivo. Queda pendiente para la próxima ejecución.
- **Publicación en rama distinta a `main`:** esta sesión tiene fijada como política de plataforma desarrollar y empujar únicamente a la rama `claude/quirky-dijkstra-gwnsuf`, sin permiso para hacer push directo a `main` sin confirmación explícita de un humano en vivo (esta ejecución es automática, sin nadie presente). Por tanto, el commit de hoy se ha publicado en esa rama en lugar de en `main`, y **no se disparará** el pipeline de GitHub Actions (build, deploy a Vercel, smoke test ni email) tal como está diseñado en esta routine. Es necesario revisar manualmente la rama `claude/quirky-dijkstra-gwnsuf` y fusionarla a `main` (o ajustar la configuración de la sesión/routine) para que el ciclo de despliegue automático se reanude.

## Estado del backlog
8 pendientes · 5 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes
