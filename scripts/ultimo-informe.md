# Informe de mejora continua — 2026-07-29

## Resumen
Primer ciclo de la routine: el backlog estaba vacío, así que hoy ha sido día de replanificación (CEO + Product Owner) y no se ha ejecutado ninguna tarea; la ejecución empieza mañana con la tarea de prioridad 1.

## Replanificación

**Diagnóstico del CEO (`scripts/ESTRATEGIA.md`):** revisión hecha sin acceso a Search Console, GA4 ni Ahrefs (proxy de red bloquea el sitio en producción; sin datos de rendimiento disponibles en el entorno), así que el diagnóstico se apoya en el código del repositorio, no en métricas reales. Hallazgos verificables:

- **No existe arquitectura de silos.** Las 4 categorías de `src/content/config.ts` no tienen página de hub; el listado del blog pagina de 6 en 6 y deja artículos antiguos a 4-6 clics de la home.
- **El enlazado interno automático es aleatorio, no temático** (`src/lib/rehype-plugins.mjs:150` elige destino por índice de array, no por relevancia).
- **`/simulador` ataca la keyword de mayor volumen del proyecto (60.000 búsquedas/mes) con ~120 palabras de HTML** y emite `faqSchema` con FAQs que nunca se renderizan visibles — incumplimiento de las directrices de datos estructurados de Google en un sitio YMYL.
- **Bug crítico de conversión:** el formulario de `/asesoramiento` — el único canal de monetización del sitio — no tiene `action` ni `method`. Sin JavaScript es un botón que no hace nada, lo que además contradice la restricción declarada de que el sitio debe funcionar sin JS.
- **Escalado no delegable al titular:** `LEGAL.titular`, `LEGAL.nif` y `LEGAL.domicilio` en `src/consts.ts` siguen siendo marcadores de posición mientras el sitio recoge nombre, teléfono y email de los usuarios.

**Cuello de botella elegido:** visibilidad/arquitectura (no falta de contenido: quedan 29 artículos programados que se publicarán solos).

**Objetivo del ciclo (verificable al 2026-08-28):** ninguna URL de `/blog/*` a más de 2 clics de la home, las 4 páginas hub publicadas y en el sitemap, y `/simulador` sirviendo ≥900 palabras rastreables sin JavaScript.

**Líneas de trabajo elegidas (`scripts/ESTRATEGIA.md`):**
1. **seo** — Arquitectura de silos y enlazado interno temático (hubs de categoría + enlazado por categoría en vez de por índice).
2. **seo** — Convertir `/simulador` en un activo indexable (contenido estático + FAQs visibles).
3. **cro** — Que el formulario de `/asesoramiento` funcione sin JavaScript (envío nativo + página de gracias), por ser el único canal de ingresos del sitio y estar roto hoy.

**Backlog generado (`scripts/BACKLOG.json`):** 12 tareas nuevas (3 cro, 9 seo, 0 ux — no se eligió ninguna línea de ux este ciclo), prioridades 1–12 sin huecos. La tarea de prioridad 1 (`cro-01-pagina-gracias`) y la 2 y 3 (`cro-02-backend-envio-nativo`, `cro-03-form-action-nativo`) arreglan el formulario de `/asesoramiento` antes que cualquier otra cosa, por tratarse del único ingreso del sitio.

## Incidencias
Ninguna en la ejecución de la routine de hoy. Dos bloqueos señalados por el CEO que requieren decisión del titular (no del orquestador ni de los agentes): (1) rellenar los datos legales de `src/consts.ts` antes de escalar la captación de leads; (2) dar acceso a Search Console/GA4/Ahrefs al entorno de la routine — sin ello, cada replanificación seguirá siendo una opinión razonada en vez de una decisión basada en datos.

## Estado del backlog
12 pendientes · 0 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes
