# Informe de mejora continua — 2026-08-24

## Resumen
Se ha corregido parcialmente el schema de /simulador (seo-021): las preguntas del FAQPage ya son visibles en el HTML, pero no se ha podido declarar requiresJs=false porque la página sigue sin una tabla estática que funcione sin JavaScript.

## Cambios aplicados

### [seo] seo-021 — Corregir el schema de /simulador para que no contradiga el HTML (browserRequirements) y mostrar visibles las preguntas del FAQPage
**Qué:** `webApplicationSchema()` en `src/lib/schema.ts` acepta ahora un parámetro opcional `requiresJs?: boolean` (por defecto `true`); solo incluye `browserRequirements` cuando es `true`. En `src/pages/simulador.astro` se añadió un bloque `<h2>Preguntas frecuentes</h2>` con una `<dl>` que muestra en texto visible (fuera de cualquier `<script>`) las 3 preguntas y respuestas que `faqSchema(faqs)` ya declaraba solo en JSON-LD.
**Por qué:** El JSON-LD contradecía el propio HTML (declaraba siempre "Requiere JavaScript" sin poder marcarlo de otro modo) y el FAQPage incumplía la restricción de la estrategia de que sus preguntas estén literalmente visibles en la página, no solo en datos estructurados.
**Hipótesis:** Ver `scripts/BACKLOG.json` (seo-021). Confirmada solo la mitad "preguntas visibles"; la mitad "requiresJs=false" se rechazó a propósito: `/simulador` sigue dependiendo por completo de la isla React sin ninguna tabla estática (seo-019 y seo-020, sus prerrequisitos, quedaron ambas "fallida" por riesgo normativo), así que declarar que la página no requiere JavaScript sería falso.
**Cómo lo mediremos:** `npm run build` (80 páginas, sin errores). `grep` de `browserRequirements` en `dist/simulador/index.html` sigue devolviendo `"Requiere JavaScript"` (correcto, sin cambio). Verificación con un script que elimina los bloques `<script>` del HTML y confirma que las 3 preguntas y sus 3 respuestas de `faqs` aparecen como texto visible. `git status --short` confirma que solo se tocaron los 2 archivos sugeridos (`src/lib/schema.ts`, `src/pages/simulador.astro`).
**Riesgo identificado:** Hereda sin resolver el riesgo normativo ya reportado por seo-018/seo-019/seo-020: las constantes de `src/lib/pension-calculo.ts` (`EDAD_LEGAL_PLENA`, `UMBRAL_COTIZACION_EDAD_REDUCIDA`, `PENAL_VOLUNTARIA_TRIMESTRE`/`PENAL_FORZOSA_TRIMESTRE`) no coinciden con la normativa vigente en 2026. Mientras no se corrijan con fuente oficial, ni esta tarea puede cerrarse al 100% ni pueden avanzar ux-003 y ux-004.
**Archivos:** `src/lib/schema.ts`, `src/pages/simulador.astro`

## Incidencias
ux-003 y ux-004 no se han despachado hoy: ambas comparten `src/pages/simulador.astro` con seo-021 (regla de la routine: no tocar el mismo archivo dos veces el mismo día) y además dependen de la tabla estática de escenarios que seo-019/seo-020 debían crear, que sigue sin existir por el mismo bloqueo normativo. Quedan pendientes para el próximo ciclo de ejecución.

## Estado del backlog
2 pendientes (ux-003, ux-004 — bloqueadas por la misma causa raíz normativa) · 20 hechas · 3 fallidas
Próxima replanificación: cuando queden 0 pendientes en el backlog, o antes si el CEO decide priorizar una tarea de corrección normativa en `src/lib/pension-calculo.ts` (recomendación ya trasladada en seo-019/seo-020/seo-021).
