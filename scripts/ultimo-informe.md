# Informe de mejora continua — 2026-08-13

## Resumen
Ejecutadas las 3 tareas pendientes del backlog (ux-002, seo-010, seo-011) para reforzar la confianza hacia la página del revisor y corregir la concentración extrema del enlazado interno automático; el backlog queda vacío, así que mañana toca día de replanificación.

## Cambios aplicados

### ux ux-002 — Enlazar la caja "Revisado por" del artículo a la página del revisor
**Qué:** La foto y el nombre del revisor dentro del `<aside>` "Revisado por" son ahora `<a href="/equipo/javier-rodriguez">`, sin añadir texto, credencial ni cifra nueva.
**Por qué:** La caja de revisión editorial no enlazaba a ningún sitio; el lector no podía verificar en un clic quién avala el contenido en un sitio YMYL.
**Hipótesis:** Enlazar el nombre del revisor a su página de equipo aumenta la confianza percibida porque permite verificar credenciales sin fricción.
**Cómo lo mediremos:** Verificación estática (grep) confirmada; sin métrica de tráfico directa por ahora — posible CTR futuro si se instrumenta el enlace.
**Riesgo identificado:** El href está codificado como ruta fija "/equipo/javier-rodriguez" (no derivado del nombre del revisor). Si se añade un segundo revisor, habrá que generalizar el slug. Riesgo bajo mientras solo exista un revisor.
**Archivos:** src/layouts/BlogPost.astro

### seo seo-010 — Crear script de medición de enlaces internos entrantes sobre /dist
**Qué:** Nuevo `scripts/contar-enlaces-internos.mjs` (Node ESM, sin dependencias nuevas) que, tras `npm run build`, cuenta apariciones de `href="/blog/<slug>"` solo dentro de los bloques "Lectura recomendada" y "Artículos relacionados" del cuerpo, e imprime tabla con mínimo, máximo y mediana.
**Por qué:** No existía ninguna herramienta objetiva y repetible para verificar el diagnóstico de concentración del enlazado interno antes de tocar el algoritmo de selección (seo-011).
**Hipótesis:** Confirmada — el desequilibrio era más severo que lo estimado: sobre 46 artículos, mínimo 0, máximo 45 (concentrado en 2 URLs), mediana 0, 28/46 (61%) con 0 entrantes.
**Cómo lo mediremos:** Línea base "antes" para comparar tras seo-011 (inmediato) y en GSC a ~21 días.
**Riesgo identificado:** Parsing por regex sobre marcado HTML fijo (clase `inline-reco`, texto "Artículos relacionados"); si cambia ese marcado en el futuro, revisar que el script lo siga detectando.
**Archivos:** scripts/contar-enlaces-internos.mjs

### seo seo-011 — Redistribuir la selección de "lectura recomendada" en rehypeInlineBlocks
**Qué:** `rehype-plugins.mjs` incorpora `hashStr()`+`rotated()` para elegir un punto de partida determinista por slug (en vez de `recoPick=0` fijo), priorizando primero los artículos de la misma categoría, y sube a 3 bloques de recomendación en artículos con ≥5 H2. Se aplicó el mismo mecanismo en `RelatedArticles.astro`, que también arrancaba siempre en el índice 0 dentro de `sameCategory`/`rest`. `rehypeExternalLinks` y `DOFOLLOW_HOSTS` sin modificar.
**Por qué:** La medición de seo-010 mostró que la causa no era solo el arranque fijo en `rehypeInlineBlocks`, sino también el mismo patrón en `RelatedArticles.astro`; había que corregir ambos para cumplir el criterio de éxito.
**Hipótesis:** Confirmada — antes: mín 0, máx 45, mediana 0, 28/46 (61%) en cero; después: mín 3, máx 15, mediana 9, 0/46 en cero.
**Cómo lo mediremos:** `node scripts/contar-enlaces-internos.mjs` tras cada build; comparación en GSC (Enlaces internos) a ~21 días.
**Riesgo identificado:** El hash es determinista por slug — renombrar un slug existente cambia el patrón de enlazado de ese artículo. Los artículos en categorías con pocos "hermanos" podrían mostrar menos variedad si el hash cae cerca del mismo punto para varios; medición actual no muestra ese problema.
**Archivos:** src/lib/rehype-plugins.mjs, src/components/RelatedArticles.astro

## Incidencias
Ninguna. Las 3 tareas se ejecutaron en secuencia (sin conflicto de archivos entre ellas), ninguna tocó rutas prohibidas, y `npm run build` pasó tras cada una (verificado también de forma independiente por el orquestador, no solo por el subagente). El resultado de seo-011 se verificó ejecutando `node scripts/contar-enlaces-internos.mjs` de forma independiente tras el build: mín 3, máx 15, mediana 9, 0/46 en cero — coincide con lo reportado por el subagente.

Nota del orquestador: esta sesión tiene fijada como rama de trabajo `claude/quirky-dijkstra-1b47ay` con la política "nunca hacer push a una rama distinta sin permiso explícito". Por eso, en vez de `git push origin main` directo (Paso 6 de la routine), cada commit de hoy se sube a esa rama en vez de a main, siguiendo el mismo patrón ya usado en días anteriores. Si se prefiere que la routine empuje directo a main en el futuro, hay que autorizarlo explícitamente.

## Estado del backlog
0 pendientes · 13 hechas · 0 fallidas
Próxima replanificación: mañana (backlog vacío) — corresponde invocar a `estratega-ceo` y `product-owner` en la siguiente ejecución de esta routine.
