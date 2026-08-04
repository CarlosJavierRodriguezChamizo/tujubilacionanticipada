# Informe de mejora continua — 2026-08-04

## Resumen
Ejecución forzada manualmente (fuera del horario programado), ya con el ritmo nuevo (hasta 5 tareas/día). Se ha reforzado el enlazado interno hacia los silos de categoría desde cada artículo y se ha creado la entidad verificable del revisor (Person con @id/url), que además queda referenciada desde el JSON-LD de los 31+ artículos.

## Cambios aplicados

### ux ux-001 — Convertir la categoría del artículo en un enlace visible a su silo
**Qué:** El eyebrow de categoría de la cabecera del artículo (`src/layouts/BlogPost.astro`) ahora envuelve el texto en `<a href="/blog/categoria/<slug>">` usando `getCategorySlug()`, solo cuando la categoría tiene silo publicado (≥3 posts, mismo umbral que la página de silo). Enlace visible sin JavaScript, contraste AA.
**Por qué:** El texto de categoría era plano; ningún artículo ofrecía salida lateral hacia su silo.
**Hipótesis:** Convertir la categoría en enlace al silo mejora la orientación del lector y da a cada artículo ≥1 enlace saliente a su silo.
**Cómo lo mediremos:** GSC/analítica a 30 días — CTR de navegación blog→silo y páginas por sesión de usuarios que entran a un artículo desde buscadores.
**Riesgo identificado:** Los 2 artículos de "Actualidad y casos prácticos" (2 posts, sin silo) quedan sin enlace por diseño para no generar un 404; el cálculo es dinámico, así que si esa categoría alcanza 3 posts el enlace aparece solo en el siguiente build.
**Archivos:** `src/layouts/BlogPost.astro`

### seo seo-006 — Crear la página de entidad del revisor /equipo/javier-rodriguez
**Qué:** Nueva página indexable `/equipo/javier-rodriguez` (ProfilePage) con `Person` JSON-LD de `@id` y `url` estables; nombre y cargo leídos literalmente de `scripts/calendario.json` (`reviewer_name`/`reviewer_title`), describiendo solo el rol editorial (revisa, no redacta) y las fuentes oficiales, sin inventar credenciales. Refactor de `src/lib/schema.ts` (`reviewerPersonSchema`): los 31+ artículos con `reviewedBy` ahora referencian el mismo `@id` de Person.
**Por qué:** "Javier Rodríguez" aparecía 31+ veces en texto plano sin URL detrás y el Person del schema no tenía `@id` ni `url`; faltaba una entidad verificable detrás del contenido YMYL.
**Hipótesis:** Una página de persona indexable con Person `@id`/`url` estable da a Google una entidad verificable detrás del contenido YMYL.
**Cómo lo mediremos:** GSC a 21 días — indexación de la página, impresiones/CTR de marca personal y validación del `reviewedBy` en Rich Results.
**Riesgo identificado:** La página queda enlazada por sitemap y por el grafo JSON-LD (`@id` compartido), pero aún sin enlace visible entrante desde los artículos; la tarea ux-002 (diferida hoy) añadirá ese enlace en la caja "Revisado por".
**Archivos:** `src/pages/equipo/javier-rodriguez.astro` (nuevo), `src/lib/schema.ts`

## Incidencias
Ninguna que rompa el ciclo. De las 5 tareas de mayor prioridad, 3 se han diferido a la próxima ejecución por la salvaguarda de colisión de archivos (no se ejecutan dos tareas que tocan el mismo archivo el mismo día):
- **seo-005** (breadcrumb del artículo) y **ux-002** (enlace de la caja "Revisado por"): tocan `src/layouts/BlogPost.astro`, ya modificado hoy por ux-001.
- **seo-007** (referenciar el @id del revisor en los 31 artículos): toca `src/lib/schema.ts`, ya modificado hoy por seo-006; además depende de que seo-006 exista, que es justo lo que se ha creado hoy.

Ambos agentes tocaron únicamente sus archivos, ninguna ruta prohibida (`src/content/blog/**`, `scripts/calendario.json`, `.github/**`), y `npm run build` pasó tras cada tarea (verificado por el subagente y de nuevo por el orquestador: 56 páginas).

## Estado del backlog
7 pendientes · 6 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes
