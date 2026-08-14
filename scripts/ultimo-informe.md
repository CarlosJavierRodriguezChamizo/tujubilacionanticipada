# Informe de mejora continua — 2026-08-07

## Resumen
3 tareas ejecutadas y verificadas: se enlazó la caja "Revisado por" a la página del revisor, se construyó una herramienta de medición de enlaces internos y se usó para redistribuir el enlazado interno automático, eliminando por completo los 23 artículos que no recibían ningún enlace desde el cuerpo de otros artículos.

## Cambios aplicados

### ux ux-002 — Enlazar la caja "Revisado por" del artículo a la página del revisor
**Qué:** El nombre y la foto del revisor en la caja "Revisado por" de cada artículo (src/layouts/BlogPost.astro) ahora enlazan a /equipo/javier-rodriguez.
**Por qué:** Esa caja no enlazaba a ningún sitio; el lector no podía verificar con un clic quién revisa el contenido.
**Hipótesis:** Enlazar el nombre del revisor a su página mejora la confianza percibida en un sitio YMYL.
**Cómo lo mediremos:** GSC/analítica a 30 días — clics salientes desde la caja "Revisado por".
**Riesgo identificado:** Ninguno relevante; enlace estático, sin JS, sin credenciales nuevas.
**Archivos:** src/layouts/BlogPost.astro

### seo seo-010 — Crear script de medición de enlaces internos entrantes sobre /dist
**Qué:** Nuevo scripts/contar-enlaces-internos.mjs, que cuenta los enlaces /blog/<slug> entrantes desde el cuerpo de otros artículos (bloques "Lectura recomendada" y "Artículos relacionados").
**Por qué:** No existía forma objetiva y repetible de verificar el diagnóstico de concentración del enlazado interno, ni de medir el efecto de seo-011.
**Hipótesis:** Medir de forma reproducible el enlazado interno entrante permite verificar el diagnóstico y, después, el resultado de redistribuirlo.
**Cómo lo mediremos:** Línea base capturada hoy: 40 artículos, 320 enlaces, mínimo 0, máximo 45, mediana 0, 23 artículos con 0 entrantes.
**Riesgo identificado:** El script asume la estructura HTML/clases actuales; si cambian sin actualizar el script, fallará silenciosamente (es una herramienta de medición fuera del pipeline de build, no afecta producción).
**Archivos:** scripts/contar-enlaces-internos.mjs (nuevo)

### seo seo-011 — Redistribuir la selección de "lectura recomendada" en rehypeInlineBlocks
**Qué:** src/lib/rehype-plugins.mjs pasa de un punto de partida fijo (recoPick=0 sobre un array alfabético) a un punto de partida determinista por artículo (hash del slug), priorizando primero la misma categoría, y sube a 3 bloques de recomendación en artículos con ≥5 H2. El fallback por fecha de src/components/RelatedArticles.astro se ajustó con la misma lógica porque también concentraba enlaces.
**Por qué:** El enlazado interno automático concentraba casi todo en los 2 primeros artículos alfabéticos, dejando 23 de 40 artículos sin ningún enlace entrante.
**Hipótesis:** Un punto de partida determinista por artículo, con prioridad de categoría, reparte el enlazado interno automático por todo el índice.
**Cómo lo mediremos:** scripts/contar-enlaces-internos.mjs — antes: mínimo 0 / máximo 45 / mediana 0 / 23 artículos con 0 entrantes → después: mínimo 9 / máximo 9 / mediana 9 / 0 artículos con 0 entrantes. GSC a 21-30 días para cobertura/rastreo de los 23 artículos previamente huérfanos.
**Riesgo identificado:** El reparto queda perfectamente uniforme con el catálogo actual (40 artículos, 4 categorías estables); si el catálogo crece de forma muy desigual entre categorías, conviene revisar el reparto. No se tocó rehypeExternalLinks ni DOFOLLOW_HOSTS.
**Archivos:** src/lib/rehype-plugins.mjs, src/components/RelatedArticles.astro

## Incidencias
Ninguna. Las 3 tareas se ejecutaron dentro de los archivos permitidos (ninguna tocó rutas prohibidas), `npm run build` pasó tras cada tarea, y no hubo conflicto de archivos entre tareas del día.

Nota del orquestador: esta sesión tiene fijada como rama de trabajo `claude/quirky-dijkstra-m4pyk4` con la política "nunca hacer push a una rama distinta sin permiso explícito". Por eso, en vez de `git push origin main` directo (Paso 6 de la routine), el commit de hoy se sube a esa rama y se abre un pull request contra `main`, siguiendo el mismo patrón ya usado en días anteriores (ver informe de 2026-08-05).

## Estado del backlog
0 pendientes · 11 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes (es decir, en la próxima ejecución de esta routine)
