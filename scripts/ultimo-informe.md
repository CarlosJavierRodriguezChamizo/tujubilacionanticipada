# Informe de mejora continua — 2026-08-02

## Resumen
Se han enlazado los 3 hubs de silo ya publicados tanto desde `/blog` como desde la home, cerrando el bucle de navegación silo→artículo abierto por seo-001/seo-002 y dejando cualquier artículo publicado a ≤2 clics de '/'.

## Cambios aplicados

### seo seo-003 — Enlazar los 3 hubs de silo desde el listado /blog
**Qué:** Bloque `<nav aria-label="Categorías del blog">` en `src/pages/blog/index.astro`, tras el header y antes del listado paginado, con un enlace por silo publicado. El cálculo de qué categorías enlazar es dinámico (cuenta posts publicados por categoría y aplica el mismo umbral de 3 artículos que usa `categoria/[categoria].astro`), usando `getCategorySlug()` para construir la URL en vez de generar el slug a mano.
**Por qué:** `/blog` solo ofrecía paginación por fecha (6 en 6) sin ningún acceso por categoría; un artículo antiguo podía requerir varias páginas de paginación para alcanzarse.
**Hipótesis:** Añadir un enlace directo a cada silo desde `/blog` reduce la profundidad de clics hasta cualquier artículo de ese silo.
**Cómo lo mediremos:** Verificación estructural inmediata (grep de las 3 rutas en `dist/blog/index.html`, cumplido). A 21 días: profundidad media de clics a artículo y evolución de impresiones/clics de las páginas de categoría en GSC.
**Riesgo identificado:** El umbral de 3 posts está duplicado (por limitación de scope de Astro) entre `blog/index.astro` y `categoria/[categoria].astro`; si se cambia en uno sin el otro, podría enlazarse brevemente un silo sin página propia. Riesgo bajo y detectable en el próximo build.
**Archivos:** `src/pages/blog/index.astro`

### seo seo-004 — Enlazar los 3 hubs de silo desde la home
**Qué:** Nueva sección "Encuentra tu tema" en `src/pages/index.astro`, entre el banner del simulador y "Últimos artículos", con el mismo patrón de `<nav aria-label="Categorías del blog">` y cálculo dinámico de silos que seo-003. Se mantiene un único `<h1>` en la home.
**Por qué:** La home solo enlazaba a `/blog` y a los 3 últimos artículos; artículos antiguos quedaban a varios clics de distancia vía paginación.
**Hipótesis:** Enlazar los 3 silos desde la home, combinado con seo-002/seo-003, deja cualquiera de los 31 artículos publicados a ≤2 clics de '/' (home → silo → artículo).
**Cómo lo mediremos:** Verificación estructural inmediata (grep de las 3 rutas en `dist/index.html`, cumplido; recuento de enlaces en cada silo coincide con el total de posts de su categoría). A 21 días: impresiones/clics del artículo más antiguo publicado y de las páginas de silo en GSC.
**Riesgo identificado:** Mismo riesgo de umbral duplicado que seo-003. Densidad de enlaces en la home aumenta en 3, sin impacto negativo esperado en EEAT (no se toca contenido, autoría ni fechas de revisión).
**Archivos:** `src/pages/index.astro`

## Incidencias
Ninguna. Las dos tareas solo tocaron los archivos permitidos (verificado con `git status` tras cada subagente), ninguna rozó una ruta prohibida, y `npm run build` pasó tras cada una y en la verificación final conjunta.

## Estado del backlog
9 pendientes · 4 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes
