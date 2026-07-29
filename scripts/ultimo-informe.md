# Informe de mejora continua — 2026-07-29

## Resumen
Primer día de ejecución del ciclo: se han completado las 2 primeras tareas SEO de la línea "páginas de silo" (helper de slugs y generación de los 3 hubs de categoría), sentando la base para el resto de tareas de enlazado interno y breadcrumb que dependen de ellas.

## Cambios aplicados

### seo seo-001 — Crear helper de slugs de categoría (silos) como fuente única de verdad
**Qué:** Nuevo módulo `src/lib/categories.ts` con mapeo explícito y tipado de las 4 categorías del blog a su slug kebab-case (sin tildes), exportando `getCategorySlug()` y `getCategoryFromSlug()`.
**Por qué:** Sin una fuente única de verdad, cada página futura (silos, breadcrumb, enlaces desde home/blog) habría tenido que inventar su propio slugify, con riesgo de slugs inconsistentes entre implementaciones.
**Hipótesis:** Centralizar el mapping nombre→slug garantiza que todas las páginas que enlacen a un silo usen siempre la misma URL.
**Cómo lo mediremos:** Verificación estructural (getCategorySlug devuelve los 3 slugs exactos exigidos); esta tarea no tiene impacto medible en tráfico por sí sola, solo al ser consumida por tareas posteriores.
**Riesgo identificado:** Si se añade/renombra una categoría en `BLOG_CATEGORIES` sin actualizar el mapa, TypeScript lo marcará como error (salvaguarda deseada, pero requiere disciplina).
**Archivos:** `src/lib/categories.ts` (nuevo)

### seo seo-002 — Crear las páginas de silo /blog/categoria/<slug> para categorías con ≥3 artículos
**Qué:** Nueva página dinámica `src/pages/blog/categoria/[categoria].astro` que genera un hub por cada categoría con ≥3 artículos publicados (hoy: Tipos de jubilación anticipada, Cálculos y penalizaciones, Planificación financiera), con listado completo sin paginar y JSON-LD `CollectionPage` + `BreadcrumbList`, reutilizando el helper de seo-001 y los componentes/schema ya existentes en el sitio.
**Por qué:** El único listado existente era `/blog` paginado de 6 en 6; la agrupación temática solo existía en el frontmatter, invisible para el rastreo de Google.
**Hipótesis:** Publicar una URL rastreable por silo permite a Google indexar la estructura temática del sitio y sienta la base para reducir la profundidad de clics a los artículos (tareas seo-003/seo-004 pendientes).
**Cómo lo mediremos:** Indexación de las 3 URLs en GSC (Cobertura) a 21 días; impresiones/clics segmentados a 21-30 días comparado con el CTR de `/blog` paginado.
**Riesgo identificado:** Posible percepción de contenido casi duplicado entre `/blog` y los hubs (mismo componente de listado) — mitigado con descripción y H1 propios por categoría; a vigilar en GSC. Si una categoría cae por debajo de 3 artículos, su hub desaparecerá del build sin redirección 301 (riesgo para una tarea futura, no para hoy).
**Archivos:** `src/pages/blog/categoria/[categoria].astro` (nuevo)

## Incidencias
Ninguna. Ambas tareas: solo tocaron archivos permitidos (verificado con `git status` tras cada subagente), `npm run build` pasó en ambos casos, y los criterios de éxito se verificaron manualmente (recuento exacto de páginas generadas, JSON-LD, sitemap).

## Estado del backlog
11 pendientes · 2 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes
