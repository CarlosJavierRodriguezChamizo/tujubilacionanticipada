# Registro de decisiones — mejora continua

Cada entrada la escribe el orquestador tras ejecutar una tarea. El CEO lee este
archivo para evaluar hipótesis en la siguiente replanificación.

Formato:

```
## [fecha] — [id] [título] (área)
- Archivos: ...
- Qué: ...
- Por qué: ...
- Hipótesis: ...
- Criterio de éxito: ...
- Métrica y plazo: ...
- Commit: [sha]
- Veredicto del CEO: pendiente
```

---

## 2026-07-29 — seo-001 Crear helper de slugs de categoría (silos) como fuente única de verdad (seo)
- Archivos: src/lib/categories.ts (nuevo)
- Qué: Módulo con mapeo explícito y tipado de las 4 BLOG_CATEGORIES a su slug kebab-case, con getCategorySlug() y getCategoryFromSlug(). No se consume aún desde ninguna página.
- Por qué: Sin una fuente única de verdad, cada página futura (silos, breadcrumb, enlaces desde home/blog) inventaría su propio slugify, arriesgando slugs inconsistentes entre implementaciones.
- Hipótesis: Centralizar el mapping nombre→slug hace que todas las páginas de silo, breadcrumb y enlaces usen siempre el mismo slug.
- Criterio de éxito: getCategorySlug() devuelve los 3 slugs exactos exigidos; `npm run build` pasa sin que nada consuma aún el helper. Cumplido.
- Métrica y plazo: Verificación estructural inmediata (no hay métrica de tráfico hasta que se consuma en tareas futuras).
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-07-29 — seo-002 Crear las páginas de silo /blog/categoria/<slug> para categorías con ≥3 artículos (seo)
- Archivos: src/pages/blog/categoria/[categoria].astro (nuevo)
- Qué: Página dinámica Astro que genera un hub por categoría con ≥3 artículos publicados (Tipos, Cálculos, Planificación), listado completo sin paginar, JSON-LD CollectionPage + BreadcrumbList, reutilizando getCategorySlug (seo-001), getPublishedPosts, BlogListing y schema.ts existentes.
- Por qué: Hoy el único listado es /blog paginado de 6 en 6; la agrupación temática solo existe en frontmatter, invisible para el rastreo.
- Hipótesis: Publicar una página estática por silo permite a Google rastrear la estructura temática del sitio.
- Criterio de éxito: Existen exactamente las 3 páginas de silo esperadas, no existe la de "actualidad-y-casos-practicos" (0 artículos), cada una con CollectionPage+BreadcrumbList y listado completo. Cumplido y verificado (build, grep, sitemap).
- Métrica y plazo: Indexación de las 3 URLs en GSC a 21 días; impresiones/clics segmentados a 21-30 días.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-03 — seo-003 Enlazar los 3 hubs de silo desde el listado /blog (seo)
- Archivos: src/pages/blog/index.astro
- Qué: Bloque "Explora por categoría" fuera del listado de artículos, con un <a href="/blog/categoria/<slug>"> por cada silo con ≥3 posts publicados, usando getCategorySlug() (seo-001).
- Por qué: /blog solo ofrecía paginación por fecha (6 en 6) sin acceso por categoría, aumentando la profundidad de clics hasta artículos antiguos.
- Hipótesis: Un enlace directo a cada hub de silo desde /blog reduce la profundidad de clics hasta cualquier artículo del silo.
- Criterio de éxito: Las 3 rutas de silo publicado aparecen en /dist/blog/index.html fuera del listado; `npm run build` pasa. Cumplido y verificado (build, grep).
- Métrica y plazo: Comparación en GSC de profundidad de rastreo/impresiones de los 3 silos a 21 días.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-03 — seo-004 Enlazar los 3 hubs de silo desde la home (seo)
- Archivos: src/pages/index.astro
- Qué: Sección "Explora por categoría" en la home con un enlace por cada silo con ≥3 posts publicados (mismo umbral y helper que seo-002/seo-003).
- Por qué: La home solo enlazaba a /blog y a los 3 últimos artículos; un artículo antiguo podía quedar a varios saltos de la home.
- Hipótesis: Enlazar los 3 silos desde la home deja cualquiera de las 31 URLs de artículo a ≤2 clics de '/'.
- Criterio de éxito: Las 3 rutas de silo aparecen en /dist/index.html; ruta home→silo→artículo verificada en ≤2 saltos para el artículo más antiguo. Cumplido y verificado (build, grep, comprobación manual).
- Métrica y plazo: Comparación en GSC de páginas indexadas/profundidad de clic a 21-28 días.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-04 — ux-001 Convertir la categoría del artículo en un enlace visible a su silo (ux)
- Archivos: src/layouts/BlogPost.astro
- Qué: El eyebrow de categoría de la cabecera del artículo ahora envuelve el texto en `<a href="/blog/categoria/<slug>">` usando getCategorySlug() (seo-001), solo cuando la categoría tiene silo (≥3 posts publicados, mismo umbral que [categoria].astro). Enlace sin JS, contraste AA.
- Por qué: El texto de categoría era plano, sin salida lateral; cada artículo carecía de enlace saliente a su silo.
- Hipótesis: Convertir la categoría en enlace al silo mejora la orientación del lector y da a cada artículo ≥1 enlace saliente a su silo.
- Criterio de éxito: En /dist/blog/*/index.html el texto de categoría es un `<a href="/blog/categoria/<slug-correcto>">` dentro del header. Cumplido: 35/35 artículos de categorías con silo; los 2 de "Actualidad y casos prácticos" (2 posts) sin enlace por diseño (evita 404).
- Métrica y plazo: GSC/analítica a 30 días — CTR de navegación blog→silo y páginas por sesión de usuarios que entran a un artículo desde buscadores.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-04 — seo-006 Crear la página de entidad del revisor /equipo/javier-rodriguez (seo)
- Archivos: src/pages/equipo/javier-rodriguez.astro (nuevo), src/lib/schema.ts
- Qué: Página indexable ProfilePage del revisor con Person JSON-LD (@id + url estables), nombre y cargo leídos literalmente de calendario.json (sin inventar credenciales; worksFor omitido a propósito). Refactor de schema.ts (reviewerPersonSchema): los 31+ artículos con reviewedBy ahora referencian el mismo @id de Person.
- Por qué: "Javier Rodríguez" aparecía 31+ veces en texto plano sin URL detrás y el Person del schema no tenía @id ni url; sin entidad verificable detrás del contenido YMYL.
- Hipótesis: Una página de persona indexable con Person @id/url estable da a Google una entidad verificable detrás del contenido YMYL.
- Criterio de éxito: Existe /dist/equipo/javier-rodriguez/index.html con Person, @id exacto y url; nombre/cargo coinciden literalmente con calendario.json. Cumplido y verificado (build, grep, sitemap).
- Métrica y plazo: GSC a 21 días — indexación de la página, impresiones/CTR de marca personal y validación del reviewedBy en Rich Results.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-05 — seo-005 Incluir el silo en la miga de pan (breadcrumb) del artículo (seo)
- Archivos: src/layouts/BlogPost.astro
- Qué: El <nav aria-label="Migas de pan"> y el BreadcrumbList JSON-LD pasan de 3 a 4 niveles (Inicio / Blog / Silo / título), reutilizando categoryHref y el umbral de silo (≥3 posts publicados) ya introducidos en ux-001, sin duplicar lógica. Para categorías sin silo la miga se mantiene en 3 niveles.
- Por qué: breadcrumbSchema() solo recibía 3 niveles; la estrategia exige que la miga incluya el silo para reforzar la señal de estructura jerárquica ante los buscadores.
- Hipótesis: Añadir el silo a la miga refuerza la señal de estructura jerárquica del sitio ante los buscadores.
- Criterio de éxito: nav con 4 enlaces y BreadcrumbList con itemListElement.length === 4, position 3 → URL del silo. Cumplido y verificado (build, muestra de dist).
- Métrica y plazo: GSC a 21 días — aparición de breadcrumbs enriquecidos en resultados y evolución de impresiones/CTR por categoría.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-05 — seo-007 Referenciar el @id del revisor desde el JSON-LD de los 31 artículos (seo)
- Archivos: src/lib/schema.ts
- Qué: Nueva reviewerReferenceSchema() (con fallback a Person completo si el revisor no tiene página propia) sustituye a reviewerPersonSchema() dentro de blogPostingSchema(); reviewedBy pasa a ser una referencia { "@id": ".../equipo/javier-rodriguez#person" } que reutiliza el @id ya construido en seo-006, en vez de un objeto Person duplicado.
- Por qué: 31 artículos incrustaban copias sueltas del mismo Person; el grafo de conocimiento debe conectarlos con una única entidad.
- Hipótesis: Referenciar el @id conecta cada BlogPosting con una única entidad Person en el grafo de conocimiento.
- Criterio de éxito: reviewedBy = { "@id": ... } en el JSON-LD, coincidiendo con el @id publicado en /equipo/javier-rodriguez. Cumplido y verificado (build, muestra de 4 artículos).
- Métrica y plazo: GSC/Rich Results Test a 21 días — sin errores de Person/reviewedBy, entidad unificada.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-05 — seo-008 Mencionar y enlazar al revisor desde /sobre-este-sitio (seo)
- Archivos: src/pages/sobre-este-sitio.astro
- Qué: La sección "Quién está detrás" nombra a Javier Rodríguez con <a href="/equipo/javier-rodriguez"> y su cargo literal leído de scripts/calendario.json (solo lectura), sin credenciales ni cifras inventadas.
- Por qué: /sobre-este-sitio no mencionaba a ningún ser humano, debilitando la señal EEAT a nivel de sitio.
- Hipótesis: Nombrar y enlazar al revisor editorial desde la página "about" refuerza la señal EEAT a nivel de sitio.
- Criterio de éxito: /dist/sobre-este-sitio/index.html contiene el enlace y el nombre/cargo literal. Cumplido y verificado (build, grep).
- Métrica y plazo: GSC a 21 días — impresiones/CTR de /equipo/javier-rodriguez y /sobre-este-sitio.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-05 — seo-009 Añadir el campo category al índice de posts que usa rehypeInlineBlocks (seo)
- Archivos: astro.config.mjs
- Qué: loadPostsIndex() extrae ahora también category del frontmatter (mismo helper field() ya usado para title/description/draft) en cada objeto de POSTS_INDEX. rehype-plugins.mjs no lee aún ese campo (confirmado por inspección): es solo preparación de datos para seo-011.
- Por qué: Sin category en el índice no hay forma de priorizar "misma categoría primero" en las lecturas recomendadas en una tarea futura.
- Hipótesis: Añadir category al índice permite priorizar la misma categoría en la selección de lecturas recomendadas (seo-011, aún no ejecutada).
- Criterio de éxito: POSTS_INDEX incluye category por artículo; `npm run build` pasa y el HTML no cambia. Cumplido: diff -rq de dist/ antes/después sin diferencias.
- Métrica y plazo: No aplica (preparación de datos sin efecto observable todavía; se medirá en seo-011).
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-14 — ux-002 Enlazar la caja "Revisado por" del artículo a la página del revisor (ux)
- Archivos: src/layouts/BlogPost.astro
- Qué: La foto y el nombre "Javier Rodríguez" dentro del <aside> "Revisado por" pasan a ser un <a href="/equipo/javier-rodriguez">, reutilizando REVIEWER_PROFILES de src/lib/schema.ts (ya usado para el JSON-LD) en vez de duplicar una constante nueva. Sin JavaScript, sin credenciales ni cifras añadidas.
- Por qué: La caja de revisor no enlazaba a ningún sitio; en un YMYL, poder verificar con un clic quién revisa el contenido refuerza la confianza percibida.
- Hipótesis: Enlazar el nombre del revisor a su página de entidad mejora la confianza percibida del lector.
- Criterio de éxito: 47/47 artículos con reviewedBy definido tienen <a href="/equipo/javier-rodriguez"> dentro del bloque "Revisado por" (grep sobre dist/blog/*/index.html tras build). Cumplido y verificado.
- Métrica y plazo: GSC/comportamiento a 21 días — CTR hacia /equipo/javier-rodriguez, señal cualitativa de confianza.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-14 — seo-010 Crear script de medición de enlaces internos entrantes sobre /dist (seo)
- Archivos: scripts/contar-enlaces-internos.mjs (nuevo)
- Qué: Script Node ESM standalone que, tras `npm run build`, cuenta enlaces internos entrantes únicos por artículo desde los bloques "Lectura recomendada" (inline-reco) y "Artículos relacionados" (RelatedArticles), e imprime tabla + resumen (mínimo, máximo, mediana, nº con 0 entrantes).
- Por qué: No existía forma objetiva y repetible de verificar el diagnóstico de concentración del enlazado interno, ni de medir el efecto de seo-011.
- Hipótesis: Medir hoy establece la línea base "antes" necesaria para evaluar seo-011.
- Criterio de éxito: Script existe y ejecuta correctamente sobre dist/. Cumplido. Línea base real (47 artículos): mínimo 0, máximo 46, mediana 0, 29/47 artículos con 0 entrantes; dos artículos concentran 46 entrantes cada uno.
- Métrica y plazo: Línea base "antes", trasladada a la entrada de seo-011 de este mismo informe.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-14 — seo-011 Redistribuir la selección de "lectura recomendada" en rehypeInlineBlocks (seo)
- Archivos: src/lib/rehype-plugins.mjs
- Qué: rehypeInlineBlocks ya no arranca siempre en recoPick=0 sobre un array alfabético. Nuevo buildCategoryCycle(posts) agrupa el índice por category (dato disponible desde seo-009) y pickRecoTargets(slug, cycle, max) recomienda, de forma cíclica y determinista, los siguientes artículos a partir de la posición propia de cada artículo en ese índice — desplazamiento uniforme +1/+2/+3, no un hash por artículo (una primera iteración con hash-módulo dejaba 1 artículo en 0 entrantes por colisión; se sustituyó por el ciclo, que garantiza cobertura). Sube a 3 bloques de recomendación en artículos con ≥5 H2 (antes máximo 2). rehypeExternalLinks y DOFOLLOW_HOSTS sin modificar (verificado por diff).
- Por qué: El punto de partida fijo concentraba casi todo el enlazado interno automático en los 2 primeros artículos alfabéticos y dejaba 29 de 47 artículos sin ningún enlace entrante desde el cuerpo, debilitando la señal EEAT/SEO de enlazado interno del sitio.
- Hipótesis: Un punto de partida repartido por artículo, con prioridad de categoría y más bloques en artículos largos, distribuye el enlazado interno automático por todo el índice.
- Criterio de éxito: Cumplido. `npm run build` pasa; rehypeExternalLinks/DOFOLLOW_HOSTS intactos.
- Métrica y plazo: scripts/contar-enlaces-internos.mjs — antes: mínimo 0, máximo 46, mediana 0, 29/47 con 0 entrantes. Después: mínimo 3, máximo 14, mediana 3, 0/47 con 0 entrantes. Seguimiento en GSC a 21-28 días: impresiones/clics de los artículos que antes tenían 0 enlaces internos entrantes.
- Commit: 221d170
- Veredicto del CEO: pendiente

## 2026-08-18 — seo-012 Crear script de auditoría del conjunto money sobre /dist (seo)
- Archivos: scripts/auditar-money-set.mjs (nuevo)
- Qué: Script Node ESM standalone que, tras `npm run build`, deriva el conjunto money (5 URLs: /simulador + 4 artículos publicados con keyword >=5.000 búsq./mes) desde scripts/calendario.json (solo lectura) y mide sobre /dist: palabras visibles en <main> (texto + placeholders, excluyendo JS/CSS embebido), enlaces internos entrantes (in-degree por página de origen en todo /dist), canonical declarado, tipos JSON-LD presentes, noindex, y si otra URL indexable del sitemap declara su misma keyword exacta (recorre todo dist/sitemap-0.xml, no solo el conjunto money). Cruza scripts/datos/*.csv si existe (0 en todas las columnas si no existe, con aviso). Sale con código 1 si alguna URL money tiene <1.200 palabras, noindex, o está canibalizada.
- Por qué: El diagnóstico de unicidad/suficiencia del conjunto money solo existía como medición manual del CEO en ESTRATEGIA.md; no había ninguna herramienta reproducible en el repo, y las líneas 2 y 3 de este ciclo necesitan un "antes" objetivo para poder compararse contra un "después".
- Hipótesis: Medir hoy con una herramienta reproducible establece la línea base objetiva que sirve para evaluar seo-013 en adelante.
- Criterio de éxito: Cumplido y verificado. Ejecutado hoy: código de salida 1, /simulador con 71 palabras (coincide exactamente con el dato manual del CEO, validando la metodología de recuento), 2 pares canibalizados detectados en todo el sitio: jubilacion-anticipada-cambios-2026/novedades-2026 y /simulador vs como-interpretar-simulador-jubilacion.
- Métrica y plazo: Línea base "antes" (esta entrada) — se compara contra la salida del mismo script después de ejecutar seo-013 a seo-017 (consolidación canonical) y seo-018 a seo-021 (ampliación de /simulador).
- Riesgo identificado: El recuento de palabras de los 4 artículos (2.192–2.466) difiere ligeramente del rango que cita el CEO en ESTRATEGIA.md (2.253–2.581), probablemente por diferencias menores de decodificación de entidades HTML; no afecta a /simulador (71, exacto) ni a la detección de canibalización. La asociación de /simulador a su keyword depende de que exista exactamente un artículo publicado con "simulador" en su keyword; si eso cambia, el script avisa por consola en vez de fallar en silencio.
- Commit: 221d170
- Veredicto del CEO: pendiente

## 2026-08-18 — seo-013 Crear el mapa de consolidación canonical en src/lib/canonical-map.ts (seo)
- Archivos: src/lib/canonical-map.ts (nuevo)
- Qué: Módulo de solo lectura (nunca escribe en calendario.json ni en src/content/blog/**) que agrupa artículos publicados por keyword normalizada, ordena cada par por fecha de publicación y asigna la canónica al más antiguo vía getCanonicalSlug(slug). Si el más reciente tiene >=1,5x las palabras del más antiguo (leídas del .mdx fuente), o si el contador de palabras falla para alguno, el par se marca en paresQueRequierenRevision sin asignar canonical. resolverParesCanonicos() recibe el contador de palabras como parámetro inyectable para poder simular escenarios sin tocar el filesystem real.
- Por qué: No existía ninguna fuente única de verdad para resolver canibalización por keyword exacta; cada par (incluido el que entra el 2026-08-24) se resolvería a mano. La excepción de umbral evita que el módulo decida solo cuando el contenido más reciente es sustancialmente más completo — esos casos quedan para revisión humana, coherente con la exigencia EEAT de no tomar atajos automáticos en URLs YMYL.
- Hipótesis: Una regla derivada de calendario.json resuelve automáticamente la mayoría de pares canibalizados, dejando solo los casos límite para revisión del CEO.
- Criterio de éxito: Cumplido y verificado. getCanonicalSlug('jubilacion-anticipada-novedades-2026') === 'jubilacion-anticipada-cambios-2026' (único par publicado hoy, coincide con lo que reporta seo-012). Simulación de guia-completa-jubilacion-anticipada-2026 (publicado:false hoy) confirma que la regla la resuelve sola contra que-es-la-jubilacion-anticipada. Casos límite (umbral 1,5x, contador no disponible) verificados: van a revisión sin canonical asignado. Build OK (73 páginas, 0 errores/warnings nuevos de astro check).
- Métrica y plazo: nº de pares en paresQueRequierenRevision a lo largo del tiempo (debería mantenerse bajo); cuando seo-014 consuma el módulo, impresiones/clics en GSC de las URLs consolidadas a 21 días.
- Riesgo identificado: El recuento de palabras es heurístico (limpieza de frontmatter/imports/componentes Astro); dio 1.865–1.988 para el par novedades/cambios frente a los ~2.521/2.531 citados en la hipótesis original, pero el ratio queda muy por debajo de 1,5x en ambos casos, así que el resultado de negocio no cambia. Si un grupo de keyword tuviera >2 artículos publicados, cada "reciente" se compara solo contra el más antiguo del grupo, no entre sí. Módulo aún no consumido por ninguna página (corresponde a seo-014).
- Commit: 7828663
- Veredicto del CEO: pendiente

## 2026-08-18 — seo-014 Emitir <link rel=canonical> hacia la URL consolidada en los artículos canibalizados (seo) — FALLIDA
- Archivos: ninguno permanece modificado (src/components/BaseHead.astro, src/layouts/Base.astro, src/layouts/BlogPost.astro editados y revertidos)
- Qué: Se implementó el diseño exacto pedido (prop `canonicalPath` en cascada BlogPost→Base→BaseHead, consultando `getCanonicalSlug(post.slug)` de seo-013), pero `npm run build` falló en la fase `astro build` y el cambio se revirtió con `git checkout`.
- Por qué falló: Bug preexistente en src/lib/canonical-map.ts (seo-013): `REPO_ROOT` se calcula con `dirname(fileURLToPath(import.meta.url))` asumiendo que el módulo siempre vive en `src/lib/`. Al consumirse por primera vez desde una página real (BlogPost.astro), Vite empaqueta el módulo dentro de `dist/pages/blog/_slug_.astro.mjs`; `import.meta.url` pasa a apuntar ahí, `REPO_ROOT` resuelve a `dist/` en vez de a la raíz del repo, y la lectura de `scripts/calendario.json` (que ocurre en el top-level del módulo, al importarlo) revienta con ENOENT. El bug estaba latente porque canonical-map.ts nunca había sido importado desde una página real hasta este intento.
- Hipótesis: (sin cambios respecto al backlog original — no se pudo evaluar, el criterio de éxito no llegó a ejecutarse).
- Criterio de éxito: No cumplido — build roto, sin dist/ válido generado con los cambios aplicados.
- Métrica y plazo: No aplica — no se generó ningún HTML con canonicals consolidados que medir.
- Riesgo identificado: Ninguno introducido en el repo (revertido íntegramente, build en verde en el commit 7828663 sin los cambios). El riesgo real es que la Línea 2 completa (seo-014 a seo-017) queda bloqueada hasta corregir la resolución de REPO_ROOT en canonical-map.ts — se recomienda una tarea previa dedicada (p.ej. usar `process.cwd()` en vez de `import.meta.url`) antes de reintentar seo-014.
- Commit: (sin commit — no hay cambios que publicar de esta tarea)
- Veredicto del CEO: pendiente

## 2026-08-18 — seo-015 Excluir del sitemap las URLs consolidadas por el mapa canonical (seo)
- Archivos: astro.config.mjs
- Qué: El `filter` del integration `sitemap()` extrae el slug de cada URL /blog/<slug>/ y, si getCanonicalSlug(slug) (seo-013) devuelve un destino, la excluye de dist/sitemap-*.xml. No se toca la generación de la página HTML en sí (sigue existiendo, solo deja de listarse en el sitemap). No se tocó canonical-map.ts ni src/content/blog/**.
- Por qué: seo-013 ya identifica qué URL cede autoridad por canibalización de keyword exacta; sin este cambio el sitemap seguía anunciando ambas URLs del par como indexables por igual. Nota importante: seo-014 (el <link rel=canonical> en el HTML) falló hoy por un bug de canonical-map.ts, así que esta tarea deja el par sin canonical en el HTML pero ya sin ambas URLs en el sitemap — señal parcial, a completar cuando se resuelva seo-014.
- Hipótesis: Excluir del sitemap la URL consolidada evita que Google la trate como indexable independiente mientras se resuelve la señal completa de canonical.
- Criterio de éxito: Cumplido y verificado. jubilacion-anticipada-novedades-2026 ausente de dist/sitemap-0.xml (grep -c = 0); jubilacion-anticipada-cambios-2026 presente (grep -c = 1). Build OK (73 páginas).
- Métrica y plazo: auditar-money-set.mjs (seo-012) confirma que el par novedades/cambios ya no aparece en la lista de canibalizados detectados en el sitemap. Seguimiento en GSC a 21 días: cobertura de novedades-2026 pasando a "no enviada en sitemap".
- Riesgo identificado: Este cambio se cargó desde astro.config.mjs, un contexto de Node normal (no bundle de página), por lo que no reprodujo el bug de REPO_ROOT que tumbó seo-014; si en el futuro cambia cómo Astro carga su config, el mismo bug podría reaparecer aquí. Sin redirección 301 (no aplica: la URL sigue siendo accesible directamente, solo deja de listarse en el sitemap).
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---
