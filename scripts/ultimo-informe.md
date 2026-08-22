# Informe de mejora continua — 2026-08-22

## Resumen
No se ha publicado ningún cambio hoy: la única tarea despachada (seo-020) se detuvo por precaución normativa antes de tocar ningún archivo, y confirma que el motor de cálculo del simulador usa una fórmula de penalización obsoleta que bloquea las 4 tareas pendientes del backlog.

## Cambios aplicados
Ninguno. La tarea seo-020 no llegó a modificar código.

## Incidencias

### [seo] seo-020 — Añadir a /simulador las fuentes normativas, coeficientes reductores y enlace al simulador oficial de la Seguridad Social
**Qué:** Se detuvo antes de escribir en `src/pages/simulador.astro`, sin tocar ningún archivo.
**Por qué:** Al contrastar fuentes externas para documentar los coeficientes reductores vigentes, se confirmó que `src/lib/pension-calculo.ts` calcula la penalización como un **porcentaje fijo por trimestre** (`PENAL_VOLUNTARIA_TRIMESTRE=1.875`, `PENAL_FORZOSA_TRIMESTRE=1.625`), mientras que el sistema real vigente en 2026 (RDL 2/2023) es **mensual y escalonado en 4 tramos de años cotizados**, con reducción total entre 3,26% y 21%. Publicar una tabla oficial correcta junto a un motor que calcula distinto habría generado una contradicción visible en una página YMYL de alto tráfico.
**Hipótesis:** No evaluada — el criterio de éxito no llegó a ejecutarse.
**Cómo lo mediremos:** No aplica hoy.
**Riesgo identificado:** Este hallazgo se suma a los ya reportados por seo-018/seo-019 (`EDAD_LEGAL_PLENA` 66a8m vs 66a10m vigente; `UMBRAL_COTIZACION_EDAD_REDUCIDA` 38.5 vs 38a3m vigente). Las 3 tareas pendientes restantes (seo-021, ux-003, ux-004) dependen todas del contenido que seo-019/seo-020 debían añadir a `/simulador` y quedan bloqueadas por la misma causa raíz.
**Archivos:** ninguno.

**Otras tareas del día:** seo-021, ux-003 y ux-004 comparten `src/pages/simulador.astro` con seo-020 y además dependen explícitamente de su resultado (tabla de escenarios y de coeficientes que seo-019/seo-020 debían generar), así que no se han despachado hoy — quedan pendientes.

## Estado del backlog
3 pendientes (todas bloqueadas por la misma causa raíz normativa) · 19 hechas · 3 fallidas
Próxima replanificación: cuando queden 0 pendientes en el backlog, o antes si el CEO decide priorizar una tarea de corrección normativa en `src/lib/pension-calculo.ts`.
