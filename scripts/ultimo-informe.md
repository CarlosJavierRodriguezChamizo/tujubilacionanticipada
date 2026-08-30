# Informe de mejora continua — 2026-08-30

## Resumen
De 4 tareas ejecutables hoy, solo 1 (seo-022) pudo completarse: las otras 3 (ux-008, ux-009, cro-006) siguen bloqueadas porque ningún subagente del equipo tiene permiso sobre `api/**`, `src/lib/**` ni `package.json` — es el cuarto ciclo consecutivo con el mismo bloqueo estructural en la línea de trabajo del informe de pago.

## Cambios aplicados

### seo seo-022 — Publicar en /simulador las tablas oficiales completas de coeficientes reductores
**Qué:** Añadidas en `src/pages/simulador.astro` las dos tablas legales completas de coeficientes reductores (24 filas × 4 tramos, art. 208.2 LGSS voluntaria; 48 filas × 4 tramos, art. 207.2 LGSS involuntaria), generadas en build desde `COEF_VOLUNTARIA`/`COEF_INVOLUNTARIA`/`ETIQUETAS_TRAMOS` de `src/lib/pension-calculo.ts`, cada una con enlace dofollow a boe.es.
**Por qué:** `/simulador` competía mal (posición ~48 en Search Console, 3 clics, solo 71 palabras únicas en `<main>`) por ser casi un formulario vacío sin contenido indexable.
**Hipótesis:** Publicar las tablas oficiales completas, con cifras verificables contra el motor de cálculo y fuente oficial enlazada, hace que `/simulador` compita como documento real por el cluster "calculo/calcular/simulador jubilación anticipada".
**Cómo lo mediremos:** Palabras únicas en `<main>` de /simulador (71 → 893, ya verificado con `scripts/auditar-money-set.mjs`); impresiones y posición en Google Search Console para esas consultas, a revisar en ~21 días.
**Riesgo identificado:** Canibalización preexistente (no introducida hoy) entre `/simulador` y `/blog/como-interpretar-simulador-jubilacion`. Las tablas son largas (24/48 filas) y dependen de `overflow-x-auto` en móvil.
**Archivos:** `src/pages/simulador.astro`

## Incidencias

**Bloqueo estructural persistente (4º ciclo consecutivo) — sin subagente para `api/**`:**
- **ux-008** (crear `api/informe-render.ts`): rechazada por el subagente `ux-ui` por estar fuera de su alcance declarado (solo `src/components/**`, `src/layouts/**`, `src/styles/**`, `src/pages/**` sin blog). Ningún archivo tocado.
- **ux-009** (crear `scripts/verificar-informe.mjs`): no despachada por el orquestador — depende de ux-008 (que no existe) y tampoco entra en el alcance de `ux-ui`.
- **cro-006** (crear `api/informe.ts`, reemisión con token HMAC): rechazada por el subagente `cro` por ser lógica de autenticación/seguridad backend, fuera de su alcance de copy/CTAs/formularios/conversión. El propio subagente advirtió del riesgo de un fallo de seguridad si se fuerza fuera de rol.
- **cro-007, cro-008** (Stripe Checkout y webhook de entrega): siguen `pendiente`, bloqueadas por decisión previa del propietario — `LEGAL.titular`, `LEGAL.nif` y `LEGAL.domicilio` en `src/consts.ts` siguen vacíos, sin lo cual no hay cuenta de Stripe. No se despacharon hoy.

Esto confirma que el bloqueo no es solo del área "ux": **ningún subagente actual tiene permiso sobre `api/**`, `src/lib/**` ni `package.json`.** La línea de trabajo de mayor prioridad de la estrategia vigente (E-1, el informe de pago — la única vía de monetización planificada) lleva 4 ciclos completamente parada por esta causa, independientemente del bloqueo de Stripe (que solo afecta a cro-007/cro-008, no a ux-008/ux-009/cro-006). Recomendación reiterada al propietario/CEO: crear un subagente con permiso sobre esas rutas (p. ej. un rol "backend"), o ampliar explícitamente el alcance de uno existente, antes del próximo ciclo.

**Tareas no despachadas por conflicto de archivo:** seo-019, seo-020, ux-003 y ux-004 también sugieren `src/pages/simulador.astro` y quedan para otro ciclo (regla: no tocar el mismo archivo dos veces el mismo día).

## Estado del backlog
6 pendientes · 28 hechas · 6 fallidas
Próxima replanificación: cuando queden 0 pendientes
