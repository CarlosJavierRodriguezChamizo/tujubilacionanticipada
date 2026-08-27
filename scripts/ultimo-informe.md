# Informe de mejora continua — 2026-08-27

## Resumen
Se retiró el código muerto del banner de la guía descartada (cro-001), y se detectó un bloqueo estructural grave: la cadena de tareas que construye el informe de pago de 49€ (prioridad #1 del propietario) está etiquetada como "ux" pero requiere permisos de desarrollo/backend que ningún subagente de esta routine tiene.

## Cambios aplicados

### [cro] cro-001 — Quitar el banner <CTAGuia /> de los listados de blog y home
**Qué:** El banner `<CTAGuia variant="banner" />` ya estaba comentado (oculto) en `src/pages/index.astro`, `src/pages/blog/index.astro` y `src/pages/blog/page/[page].astro`. Se eliminó el rastro textual completo (import comentado y bloque JSX comentado) en los tres archivos.
**Por qué:** El propietario descartó la guía de 29 € como producto (ver `scripts/ESTRATEGIA.md`, encargo E-1); el código muerto que la referencia confunde a agentes futuros que trabajen en las tareas siguientes de la cadena (cro-002, cro-003).
**Hipótesis:** Confirmada de forma trivial — el banner ya no se renderizaba en producción, así que este cambio es limpieza de código sin variación de comportamiento visible ni de conversión.
**Cómo lo mediremos:** `grep` de "CTAGuia" en los 3 archivos fuente y en `dist/index.html`, `dist/blog/index.html`, `dist/blog/page/2/index.html`: 0 resultados en todos tras `npm run build` (84 páginas, verde).
**Riesgo identificado:** Ninguno funcional. `CTAGuia.astro` y su uso en `BlogPost.astro` siguen intactos a la espera de cro-002.
**Archivos:** `src/pages/index.astro`, `src/pages/blog/index.astro`, `src/pages/blog/page/[page].astro`

## Incidencias

**Bloqueo estructural — ux-005 fallida (y con ella, de facto, ux-006/007/008/009):** Las 5 tareas de menor prioridad del backlog (ux-005 a ux-009) forman la cadena que construye el generador del informe de pago de 49 € — el encargo directo del propietario y la prioridad #1 de la replanificación forzada del 2026-08-26. Están etiquetadas `area: "ux"`, pero su trabajo real es crear y modificar `src/lib/informe-pdf.tsx`, `src/lib/informe-analisis.ts`, `api/informe-render.ts` y añadir dependencias nuevas (`@react-pdf/renderer`) — todo fuera del alcance permitido del subagente `ux-ui` (limitado a `src/components/**`, `src/layouts/**`, `src/styles/**`, `src/pages/**`, sin permiso para instalar dependencias). El subagente rechazó `ux-005` correctamente, sin tocar ningún archivo, en vez de saltarse sus restricciones de permisos.

Ninguno de los 3 subagentes disponibles en esta routine (`ux-ui`, `seo`, `cro`) tiene permisos sobre `src/lib/**`, `api/**` o gestión de dependencias para lógica de negocio/backend. **Se necesita una decisión del propietario:** crear/habilitar un subagente de tipo desarrollo/backend con esos permisos, o reasignar el área de `ux-005..ux-009` a uno que ya los tenga. Mientras esto no se resuelva, el informe de pago de 49 € — el único plan de monetización activo del sitio — queda completamente parado; ninguna tarea de esa línea puede avanzar en las próximas ejecuciones de esta routine.

Como consecuencia, hoy solo se ejecutó 1 tarea (cro-001) de las 5 que permite `config.max_tareas_por_dia`, en vez de forzar tareas mal asignadas o inventar permisos que el subagente correspondiente no tiene.

## Estado del backlog
17 pendientes · 22 hechas · 1 fallida
Próxima replanificación: cuando queden 0 pendientes
