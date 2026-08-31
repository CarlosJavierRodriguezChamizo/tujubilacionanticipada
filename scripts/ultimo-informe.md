# Informe de mejora continua — 2026-08-31

## Resumen
Se ha añadido a /simulador una tabla estática de 50 escenarios precalculados (seo-019), como mejora progresiva sobre la isla React, para que el sitio siga funcionando sin JavaScript y para que el DISCLAIMER legal sea visible sin depender de interacción.

## Cambios aplicados

### [seo] seo-019 — Renderizar en /simulador una tabla estática de escenarios precalculados
**Qué:** Tabla HTML de 50 filas (5 edades × 5 tramos de años cotizados × 2 tramos de base reguladora) generada en build a partir de src/lib/pension-calculo.ts, bajo la isla `<Simulador client:load>`. El DISCLAIMER de src/consts.ts ahora se renderiza fuera de la isla React (antes solo aparecía tras enviar el formulario). El JSON-LD `WebApplication` pasa `requiresJs` a `false`.
**Por qué:** Toda la página dependía de una isla React inerte sin JavaScript; ni la estimación ni el aviso legal eran visibles sin JS, incumpliendo la restricción permanente "el sitio debe funcionar sin JavaScript".
**Hipótesis:** Con la tabla estática, `<main>` pasa a ser un documento sustancialmente más largo e indexable, y un usuario sin JS puede leer una estimación para su caso.
**Cómo lo mediremos:** `scripts/auditar-money-set.mjs` sobre /simulador: 893 → 2053 palabras únicas en `<main>` (umbral 1.200 superado). 50 filas de escenario en `dist/simulador/index.html` (≥40 exigidas). Tabla y DISCLAIMER siguen presentes al simular la eliminación de la isla React del HTML compilado.
**Riesgo identificado:** `auditar-money-set.mjs` sigue devolviendo código de salida 1 por una canibalización preexistente ("simulador jubilacion" entre /simulador y /blog/como-interpretar-simulador-jubilacion), ajena a esta tarea y ya presente antes del cambio.
**Archivos:** src/pages/simulador.astro

## Incidencias
- **cro-007** y **cro-008** (prioridad 12 y 13, las de menor prioridad pendientes) no se han despachado: están marcadas `[BLOQUEADA]` en el propio backlog — dependen de que el propietario complete `LEGAL.titular`, `LEGAL.nif` y `LEGAL.domicilio` en `src/consts.ts` (siguen con marcadores entre corchetes) y dé de alta la cuenta de Stripe. Su propio criterio de éxito prohíbe a cualquier agente ejecutarlas sin esos datos.
- **seo-020, ux-003, ux-004** (las otras 3 pendientes) tocan el mismo archivo que seo-019 (`src/pages/simulador.astro`). Por la regla de "mismo archivo → solo la primera tarea del día", quedan para mañana.
- Ninguna ruta prohibida fue tocada; `git status` tras la ejecución solo mostraba `src/pages/simulador.astro`.
- `npm run build` verificado por el orquestador tras la tarea: OK, 90 páginas generadas.

## Estado del backlog
5 pendientes · 29 hechas · 6 fallidas
Próxima replanificación: cuando queden 0 pendientes
