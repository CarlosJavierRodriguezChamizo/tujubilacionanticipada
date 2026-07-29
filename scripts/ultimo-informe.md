# Informe de mejora continua — 2026-07-29

## Resumen
Primer ciclo de la routine: el CEO ha diagnosticado "autoridad" como cuello de botella (silos sin URL propia, enlazado interno degenerado, revisor no verificable) y el Product Owner ha traducido esa estrategia en 13 tareas nuevas en el backlog; hoy no se ha ejecutado ninguna.

## Replanificación

### Diagnóstico del CEO
Revisión marcada explícitamente como "a ciegas": sin acceso desde este entorno a Search Console, GA4 ni Ahrefs, y `https://tujubilacionanticipada.com` devuelve 403 a través del proxy, así que el diagnóstico se apoya solo en el repositorio, no en datos de tráfico.

Hallazgos verificables en el repo:
- 31/60 artículos publicados, cobertura de keywords correcta (~117.150 búsquedas/mes, KD casi siempre ≤ 12) — el contenido no es el problema.
- 4 silos declarados en `src/content/config.ts`, **0 páginas de categoría**; el único listado es `/blog` paginado.
- 23 de 31 artículos con **0 enlaces contextuales** en el cuerpo: `rehypeInlineBlocks` arranca siempre en el índice 0 de un listado alfabético, así que casi todos los artículos enlazan a los mismos dos posts.
- El revisor "Javier Rodríguez" aparece en los 31 artículos (incl. JSON-LD `reviewedBy`) sin ninguna URL propia — entidad no verificable en contenido YMYL.

**Cuello de botella: Autoridad.** Se descartan explícitamente Visibilidad técnica (nada bloquea la indexación) y Relevancia/Conversión (sin datos de tráfico, cualquier diagnóstico sería inventado).

**Objetivo del ciclo (30 días, verificable sobre `/dist`):** ninguna URL de artículo con menos de 3 enlaces internos entrantes, y una página de silo indexable por cada categoría con ≥ 3 artículos publicados.

**Líneas de trabajo priorizadas:**
1. Páginas de silo `/blog/categoria/<slug>` para categorías con ≥ 3 artículos (hoy: Tipos, Cálculos, Planificación).
2. Página de entidad del revisor con `Person` + `@id`, enlazada desde los 31 artículos.
3. Redistribuir el enlazado interno automático de `rehypeInlineBlocks` (mayor blast radius: toca código compartido por todos los artículos).

Estrategia completa en `scripts/ESTRATEGIA.md`.

### Backlog generado
El Product Owner ha creado **13 tareas** en `scripts/BACKLOG.json`, todas `"estado": "pendiente"`:
- **seo: 11**, **ux: 2**, **cro: 0** (deliberado — la estrategia excluye CRO este ciclo por falta de tráfico medible).
- Orden de prioridad: primero las piezas pequeñas de bajo riesgo de silos y revisor (prioridad 1–10), y al final (prioridad 11–13) la redistribución de `rehypeInlineBlocks`, que toca código compartido por los 31 artículos.
- Ninguna tarea toca `src/content/blog/**`, `scripts/calendario.json` ni `.github/**`.

## Cambios aplicados
Ninguno en código/contenido del sitio. Solo `scripts/ESTRATEGIA.md` (reescrito) y `scripts/BACKLOG.json` (poblado con 13 tareas y `ultima_replanificacion` actualizado a 2026-07-29).

`npm run build` verificado tras los cambios: 45 páginas, sin errores.

## Incidencias
- Los subagentes `product-owner`, `ux-ui`, `seo` y `cro` dejaron de estar disponibles como tipo de agente registrado durante esta ejecución (tras invocar correctamente a `estratega-ceo`, la siguiente invocación a `product-owner` devolvió "Agent type not found"). Se ha continuado con un agente general-purpose al que se le ha pasado íntegro el rol y las reglas de `.claude/agents/product-owner.md` como contexto, para no bloquear el ciclo. El propietario debería revisar por qué el registro de subagentes personalizados no está disponible de forma consistente dentro de una misma ejecución de la routine, antes de que mañana haga falta invocar a `seo`/`ux-ui`/`cro` para ejecutar tareas.
- El `git fetch origin main <rama-designada>` inicial falló silenciosamente (ref de rama no encontrada) sin actualizar `origin/main`, dejando una copia local desactualizada de `main` durante varios minutos hasta que se detectó y se corrigió con un `git fetch origin main` aislado. Recomendable evitar fetches multi-ref en el Paso 0 de la routine.
- No se ha podido verificar el estado del sitio en producción (403 a través del proxy del entorno) ni acceder a Search Console/GA4/Ahrefs — el CEO deja el detalle completo de qué le faltó al final de `scripts/ESTRATEGIA.md`.

## Estado del backlog
13 pendientes · 0 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes (con `max_tareas_por_dia: 2`, en torno a 6-7 días de ejecución si no cambia el ritmo)
