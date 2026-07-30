# Informe de mejora continua — 2026-07-30

## Resumen
Se ha reforzado el acceso por categoría al blog, enlazando los 3 hubs de silo tanto desde el listado /blog como desde la home, para reducir la profundidad de clics hasta cualquier artículo.

## Cambios aplicados

### seo seo-003 — Enlazar los 3 hubs de silo desde el listado /blog
**Qué:** Bloque de navegación con un enlace a cada silo publicado (Tipos de jubilación anticipada, Cálculos y penalizaciones, Planificación financiera), insertado en /blog entre el título y el listado paginado de artículos.
**Por qué:** /blog solo ofrecía paginación por fecha (6 en 6), sin ningún acceso directo por categoría.
**Hipótesis:** Reduce la profundidad de clics hasta cualquier artículo al ofrecer una vía de navegación temática alternativa a la paginación.
**Cómo lo mediremos:** Evolución de indexación/impresiones en Google Search Console de artículos que antes solo eran alcanzables en páginas 2+ de paginación, y de las 3 URLs de silo, a 21 días.
**Riesgo identificado:** Ninguno relevante; el bloque reutiliza el mismo umbral (≥3 artículos) que ya usan las páginas de silo, por lo que no puede generar enlaces rotos si una categoría cae por debajo del umbral.
**Archivos:** src/pages/blog/index.astro

### seo seo-004 — Enlazar los 3 hubs de silo desde la home
**Qué:** Nueva sección "Blog por temas" en la home, con un enlace a cada silo publicado, mismo patrón que seo-003.
**Por qué:** La home solo enlazaba a /blog y a los 3 últimos artículos; un artículo antiguo podía quedar a varias páginas de paginación de distancia.
**Hipótesis:** Combinado con seo-002 y seo-003, cualquier artículo publicado queda a ≤2 clics de la home (home → silo → artículo).
**Cómo lo mediremos:** Impresiones/clics en GSC para las URLs de silo y para artículos previamente "huérfanos" de paginación, a 21 días. Verificado manualmente que el artículo más antiguo (que-es-la-jubilacion-anticipada) es alcanzable en 2 clics desde home.
**Riesgo identificado:** Ninguno relevante; mismo umbral de seguridad que seo-003.
**Archivos:** src/pages/index.astro

## Incidencias
Ninguna en la ejecución de las tareas. Ambos subagentes devolvieron su informe estructurado, solo tocaron los archivos permitidos, y `npm run build` pasó tras cada tarea.

**Nota operativa:** esta sesión de Claude Code está configurada para desarrollar en la rama `claude/quirky-dijkstra-a89vmj` y no hacer push directo a `main` sin permiso explícito — una restricción de la sesión, no de esta routine. Por tanto los cambios de hoy se han commiteado y empujado a esa rama en lugar de a `main` directamente, lo que significa que el pipeline de GitHub Actions (build → deploy a Vercel → smoke test → email) no se disparará hasta que esa rama se fusione en `main`. Se recomienda revisar y fusionar manualmente, o ajustar la configuración de la routine/sesión si se desea push directo a `main` en el futuro.

## Estado del backlog
9 pendientes · 4 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes
