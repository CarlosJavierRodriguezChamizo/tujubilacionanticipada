# Informe de mejora continua — 2026-08-10

## Resumen
Hoy se ejecutaron las 3 tareas pendientes del backlog (ux-002, seo-010, seo-011), cerrando el objetivo estratégico "Página de entidad del revisor" y corrigiendo en el mismo día la concentración de enlazado interno automático detectada por el nuevo script de medición.

## Cambios aplicados

### ux ux-002 — Enlazar la caja "Revisado por" del artículo a la página del revisor
**Qué:** La foto y el nombre "Javier Rodríguez" en el aside "Revisado por" de cada artículo (src/layouts/BlogPost.astro) ahora son `<a href="/equipo/javier-rodriguez">`, calculando la ruta desde `REVIEWERS[data.reviewedBy]` en vez de hardcodear el slug. Enlace sin JavaScript, con focus-visible y subrayado en el nombre para no depender solo del color.
**Por qué:** La caja no enlazaba a ningún sitio; poder verificar con un clic quién revisa el contenido refuerza la confianza percibida en un sitio YMYL.
**Hipótesis:** Un enlace desde el nombre/foto del revisor a su página de entidad mejora la confianza percibida del lector.
**Cómo lo mediremos:** Clics salientes a /equipo/javier-rodriguez desde páginas de blog en Analytics, en 2-4 semanas.
**Riesgo identificado:** Si en el futuro se añade un revisor sin foto/entrada registrada en `REVIEWERS`, su nombre se mostrará como texto plano sin enlace (degradación segura, no error).
**Archivos:** src/layouts/BlogPost.astro

### seo seo-010 — Crear script de medición de enlaces internos entrantes sobre /dist
**Qué:** Nuevo script `scripts/contar-enlaces-internos.mjs` que, tras `npm run build`, cuenta enlaces internos entrantes por artículo desde el cuerpo de otros artículos (bloques "Lectura recomendada" y "Artículos relacionados"), ignorando breadcrumbs, menú, footer y CTA.
**Por qué:** No existía ninguna herramienta objetiva y repetible para medir la concentración de enlazado interno; necesaria como línea base antes de tocar la lógica de selección en seo-011.
**Hipótesis:** El script permite verificar de forma objetiva el diagnóstico "unos pocos artículos concentran la mayoría de entrantes y muchos tienen 0".
**Cómo lo mediremos:** Línea base "antes" registrada: 43 artículos analizados (no 31, por publicaciones posteriores a la redacción de la tarea), mínimo 0, máximo 42, mediana 0, 25 URLs con 0 entrantes, 5 URLs con ≥25 entrantes.
**Riesgo identificado:** El script depende de las clases CSS actuales de los bloques de recomendación; un cambio de diseño que las renombre lo dejaría reportando 0 en falso hasta actualizarlo.
**Archivos:** scripts/contar-enlaces-internos.mjs (nuevo)

### seo seo-011 — Redistribuir la selección de "lectura recomendada" en rehypeInlineBlocks
**Qué:** rehypeInlineBlocks sustituye el punto de partida fijo (recoPick=0 sobre el índice alfabético) por un plan determinista por artículo: 1 recomendación de la misma categoría (rotación cíclica) + 2 por rotación de paso fijo sobre un orden por hash del slug; sube a 3 bloques en artículos con ≥5 H2. Se corrigió el mismo problema en RelatedArticles.astro (fuera de `archivos_sugeridos`, mismo alcance de enlazado interno del área, sin tocar rutas prohibidas), que concentraba siempre los mismos 2-3 posts recientes por categoría. `rehypeExternalLinks`/`DOFOLLOW_HOSTS` sin modificar (verificado por diff).
**Por qué:** El enlazado interno automático se concentraba en 2 artículos (hasta 42 entrantes) mientras 25 de 43 tenían 0 entrantes, por partir siempre del mismo índice sobre un array ordenado alfabéticamente.
**Hipótesis:** Un punto de partida determinista por artículo, priorizando la misma categoría, reparte el enlazado interno automático por todo el índice.
**Cómo lo mediremos:** Verificado hoy mismo con `contar-enlaces-internos.mjs` (verificación independiente del orquestador, no solo autoinformada por el subagente): antes mínimo 0 / máximo 42 / mediana 0; después mínimo 9 / máximo 9 / mediana 9 (distribución uniforme en las 43 URLs). Seguimiento en GSC/crawl interno de "Inlinks" por URL a 21-28 días.
**Riesgo identificado:** La garantía de reparto uniforme es exacta mientras el número de artículos y el tamaño de las categorías se mantengan razonablemente estables; una categoría que quede con muy pocos artículos podría romper la uniformidad exacta sin romper el build. No se revisó visualmente cada una de las 43 páginas, solo un muestreo.
**Archivos:** src/lib/rehype-plugins.mjs, src/components/RelatedArticles.astro

## Incidencias
Ninguna tarea falló, ninguna ruta prohibida fue tocada y `npm run build` pasó tras cada una de las 3 tareas.

Nota del orquestador: esta sesión tiene fijada como rama de trabajo `claude/quirky-dijkstra-alyr8y` con la política "nunca hacer push a una rama distinta sin permiso explícito". Por eso, en vez de `git push origin main` directo (Paso 6 de la routine), los 3 commits de hoy se han subido a esa rama; siguiendo el mismo patrón ya usado en ejecuciones anteriores de esta routine (informe del 2026-08-05), se abre un pull request contra `main` para que el pipeline de GitHub Actions (build, deploy en Vercel, smoke test y email) se dispare tras su fusión.

## Estado del backlog
0 pendientes · 11 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes (condición ya cumplida — corresponde invocar a estratega-ceo y product-owner en la próxima ejecución de esta routine)
