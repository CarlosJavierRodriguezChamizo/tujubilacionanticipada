# Informe de mejora continua — 2026-09-01

## Resumen
Se ha reintentado y completado seo-019: /simulador ahora publica en build una tabla estática de 72 escenarios de pensión, casi triplicando su contenido único indexable (893 → 2137 palabras).

## Cambios aplicados

### seo seo-019 — Renderizar en /simulador una tabla estática de escenarios precalculados
**Qué:** Añadida en src/pages/simulador.astro una tabla HTML estática (72 filas: 6 edades × 5 tramos de años cotizados × 3 tramos de base reguladora, filtradas por plausibilidad) con la pensión estimada en las tres modalidades, calculada en build con el motor ya corregido de src/lib/pension-calculo.ts. El DISCLAIMER de src/consts.ts pasa a renderizarse también como bloque estático visible sin JavaScript, antes de la isla React (que se mantiene como mejora progresiva). Añadidos enlaces a las fuentes oficiales (BOE) y `requiresJs` del schema pasado a `false`.
**Por qué:** El primer intento (19 de agosto) se detuvo por precaución: las constantes normativas del motor de cálculo estaban desactualizadas (2025 en vez de 2026) y publicar una tabla YMYL con datos incorrectos era un riesgo inaceptable. Esa causa raíz se corrigió el 24 de agosto (normativa-001), dejando la tarea lista para reintentarse.
**Hipótesis:** Confirmada. Un usuario sin JavaScript pasa a tener una estimación legible sin depender de la isla React, y la keyword money más importante del sitio (60.000 búsq./mes, posición ~48) gana contenido único sustancial.
**Cómo lo mediremos:** `node scripts/auditar-money-set.mjs` confirma 2137 palabras únicas en `<main>` (antes 893, umbral exigido 1200). Seguimiento de impresiones/clics/posición de /simulador en Search Console a 21 días.
**Riesgo identificado:** La canibalización preexistente entre /simulador y /blog/como-interpretar-simulador-jubilacion por la misma keyword sigue sin resolver (depende de scripts/calendario.json, ruta prohibida para esta routine). Los rangos de escenario mostrados son una decisión editorial del agente, no una cifra normativa.
**Archivos:** src/pages/simulador.astro

## Incidencias
- `cro-007` y `cro-008` siguen bloqueadas y no se han despachado: dependen de que el propietario rellene `LEGAL.titular`, `LEGAL.nif` y `LEGAL.domicilio` en `src/consts.ts` y active la cuenta de Stripe; ningún agente puede resolverlo.
- `seo-020`, `ux-003` y `ux-004` quedan pendientes para otro ciclo: las cuatro tareas del día tocaban el mismo archivo (`src/pages/simulador.astro`), y la regla de la routine limita a una tarea por archivo y día.

## Estado del backlog
5 pendientes (2 bloqueadas: cro-007, cro-008) · 29 hechas · 6 fallidas
Próxima replanificación: cuando queden 0 pendientes
