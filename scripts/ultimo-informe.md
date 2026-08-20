# Informe de mejora continua — 2026-08-20

## Resumen
Se ejecutó seo-020 (fuentes normativas y enlace al simulador oficial en /simulador); las otras 3 tareas pendientes (seo-021, ux-003, ux-004) se aplazan porque las cuatro tocan el mismo archivo (src/pages/simulador.astro) y la regla de la routine prohíbe despacharlas el mismo día.

## Cambios aplicados

### seo seo-020 — Añadir a /simulador las fuentes normativas, coeficientes reductores y enlace al simulador oficial de la Seguridad Social
**Qué:** Nueva sección tras el formulario del simulador con la fórmula y enlace dofollow a los arts. 207/208 de la LGSS (boe.es); los 2 coeficientes actuales del motor (1,875%/1,625% por trimestre) cada uno con enlace dofollow a seg-social.es y advertencia de que son cifras simplificadas; limitaciones explícitas; bloque destacado con enlace dofollow al simulador oficial de la Seguridad Social. DISCLAIMER y motor de cálculo intactos.
**Por qué:** /simulador no citaba ninguna fuente normativa ni enlazaba al simulador oficial pese a competir por "simulador jubilacion" (60.000 búsq./mes); ESTRATEGIA.md exige explicar las alternativas oficiales, no ocultarlas.
**Hipótesis:** Si añadimos a /simulador, como HTML estático, la fórmula y el artículo de la LGSS que respalda cada cálculo (enlazado dofollow a boe.es o seg-social.es), una tabla de coeficientes reductores vigentes con su fuente oficial, las limitaciones explícitas de la estimación y un enlace visible al simulador oficial de la Seguridad Social, esperamos que /simulador compita como documento frente al simulador oficial y la banca en vez de ocultar que existen alternativas oficiales, porque hoy la página no cita ninguna fuente normativa ni enlaza al simulador oficial, y ESTRATEGIA.md exige explicarlo, no ocultarlo.
**Cómo lo mediremos:** Palabras únicas en `<main>` de /simulador: 71→399 (auditar-money-set.mjs), aún por debajo del umbral de 1200 de ESTRATEGIA.md — pendiente de la tabla de escenarios (seo-019, bloqueada). GSC a 21 días para "simulador jubilacion" y variantes normativas.
**Riesgo identificado:** Los anclajes a boe.es/seg-social.es no se verificaron por fetch directo (egress bloqueado en este entorno). Más importante: **no corregido, solo reportado** — los coeficientes 1,875%/1,625% del motor (`src/lib/pension-calculo.ts`) parecen un tipo plano por trimestre, mientras fuentes secundarias describen el coeficiente reductor real post Ley 21/2021 como una tabla variable por meses de anticipo y años cotizados. Esto coincide con lo ya señalado sin resolver en seo-018/seo-019 sobre la edad legal de jubilación y el umbral de cotización, también desactualizados en el mismo módulo. Ninguna tarea futura debería tocar el motor de cálculo sin que esto se revise antes con fuente oficial verificada.
**Archivos:** src/pages/simulador.astro

## Incidencias
- seo-021, ux-003 y ux-004 quedan pendientes para próximos días: las cuatro tareas del backlog tocan `src/pages/simulador.astro` (seo-021 también `src/lib/schema.ts`) y la regla de despacho de la routine exige ejecutar solo una por día cuando comparten archivo.
- **Pipeline de publicación:** el entorno de esta sesión tiene asignada la rama `claude/quirky-dijkstra-ioh2ih` como rama de trabajo obligatoria y prohíbe empujar directamente a `main` sin autorización explícita del usuario, en contradicción con el paso 6 de esta routine (que asume push directo a `main`). Por eso el commit de hoy se ha publicado en `claude/quirky-dijkstra-ioh2ih`, no en `main`. **`main` no recibe cambios desde 2026-08-15**: hay 10 commits (contenido de los artículos #50-53 y mejoras seo-012 a seo-020) acumulados en esta rama sin ningún Pull Request abierto que los lleve a producción. Mientras esto no se resuelva, ni el despliegue en Vercel ni el email de este informe (que dependen del push a `main` vía GitHub Actions) se disparan — este archivo solo queda commiteado en el repo.
- Dato normativo sin verificar en fuente primaria (ver riesgo de seo-020 arriba): posible desactualización de los coeficientes reductores y la edad legal de jubilación en `src/lib/pension-calculo.ts`, señalada de forma independiente en seo-018, seo-019 y ahora seo-020, sin resolver.

## Estado del backlog
4 pendientes · 20 hechas · 2 fallidas
Próxima replanificación: cuando queden 0 pendientes
