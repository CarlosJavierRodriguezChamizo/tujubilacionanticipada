# Informe de mejora continua — 2026-08-15

## Resumen
Día de replanificación: el backlog llegó a 0 tareas pendientes, así que se ha revisado la estrategia y generado un nuevo backlog en vez de ejecutar tareas.

## Replanificación

### Revisión de estrategia (estratega-ceo)
**Qué:** Reescritura completa de `scripts/ESTRATEGIA.md` tras evaluar las 13 hipótesis del ciclo anterior (silos de categoría, migas de pan, entidad del revisor).
**Veredicto del ciclo anterior:** 8 confirmadas con evidencia (destaca seo-011: enlazado interno pasó de mín. 0/máx. 46/mediana 0/29 de 47 artículos sin entrantes a mín. 3/máx. 14/mediana 3/0 de 48 en cero), 3 confirmadas solo como artefacto sin datos de efecto, 1 refutada (seo-006: la página del revisor no llegó a ser una "entidad verificable" — sin `sameAs` ni `worksFor`), 1 parcial (seo-007) y 1 sin datos suficientes (ux-002). Balance: 11/13 confirmadas a nivel de artefacto, 0 a nivel de negocio (sin acceso a GSC/GA4).
**Ciclo cerrado:** la arquitectura de silos/migas/revisor se declara cerrada — no se itera más sobre ella.
**Nuevo cuello de botella:** las 5 URLs que concentran el 65% del volumen de búsqueda (89.600 de 137.050 búsq./mes) tienen dos problemas activos: canibalización (cambios-2026 vs novedades-2026; /simulador vs como-interpretar-simulador-jubilacion; y la entrada el 2026-08-24 de guia-completa-jubilacion-anticipada-2026 contra que-es-la-jubilacion-anticipada) y falta de contenido único suficiente (/simulador tiene solo 71 palabras en `<main>` pese a ser la URL más enlazada del sitio, sin funcionar sin JavaScript).
**Objetivo nuevo:** para el 2026-09-14, las 5 URLs del "conjunto money" deben cumplir unicidad (ninguna comparte consulta con otra URL indexable) y suficiencia (≥1.200 palabras únicas en `<main>` y utilidad sin JavaScript).
**Deudas señaladas con fecha límite (no se tocan este ciclo):** formulario de `/asesoramiento` sin JS; `author` JSON-LD de los 48 artículos como Organization suelta sin referenciar el `@id` `#organization`.

### Nuevo backlog (product-owner)
**Qué:** 12 tareas nuevas en `scripts/BACKLOG.json` (10 seo, 2 ux, 0 cro — CRO queda fuera de alcance este ciclo por falta de tráfico medible y oferta declarada), ordenadas por prioridad en 3 bloques: (1) auditoría del conjunto money + consolidación canonical de las URLs canibalizadas (seo-012 a seo-017), (2) reconstrucción de `/simulador` como documento competitivo con escenarios precalculados estáticos (seo-018 a seo-021), (3) accesibilidad de las tablas nuevas y aviso `<noscript>` (ux-003, ux-004).
**Por qué:** traduce el objetivo del "conjunto money" en tareas ejecutables de ≤3 archivos cada una, ninguna dependiente de métricas de GSC/GA4 (prohibido explícitamente por la nueva estrategia), todas verificables con `npm run build` o grep sobre `/dist`.
**Decisiones del CEO no traducidas a tarea:** las dos deudas con fecha límite (formulario sin JS, `author` suelto) se dejan fuera deliberadamente — el propio CEO las marcó como "no se tocan este ciclo"; tampoco se generó ninguna tarea CRO ni nada del apartado "fuera de alcance" de la estrategia (copy, guía PDF, notificaciones push, textos legales, `sameAs`, link building, rediseños).
**Archivos:** scripts/ESTRATEGIA.md, scripts/BACKLOG.json

## Incidencias
Ninguna. Ambos subagentes devolvieron su informe estructurado; `ultima_replanificacion` actualizada a 2026-08-15; no se tocaron rutas prohibidas.

## Estado del backlog
12 pendientes · 13 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes. No se han ejecutado tareas hoy — el ciclo de ejecución empieza mañana con las 5 tareas de menor prioridad (seo-012 a seo-016).
