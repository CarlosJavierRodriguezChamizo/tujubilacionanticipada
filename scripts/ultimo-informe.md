# Informe de mejora continua — 2026-08-28

## Resumen
Se ha completado 1 tarea (cro-002, limpieza de código muerto) y fallado 1 (ux-006), bloqueada por un problema estructural que ya lleva dos ciclos sin resolverse: ningún subagente disponible tiene permiso sobre `src/lib/**` o `api/**`, y ahí es donde vive toda la cadena del informe de pago que el propietario encargó directamente (E-1).

## Cambios aplicados

### [cro] cro-002 — Quitar <CTAGuia /> de BlogPost.astro y borrar el componente CTAGuia.astro
**Qué:** Eliminado el import comentado y el bloque JSX comentado de `<CTAGuia />` en `src/layouts/BlogPost.astro`; borrado `src/components/CTAGuia.astro`.
**Por qué:** Tras cro-001, este era el último punto de uso vivo del componente de la guía de 29 € descartada. Sin este paso, cro-003 (borrar `GUIA_PRECIO`) rompería el build.
**Hipótesis:** Confirmada — cero referencias vivas a CTAGuia tras el cambio.
**Cómo lo mediremos:** `grep -r 'CTAGuia' src/` → 0 resultados (verificado). Sin métrica de negocio: el componente ya estaba desactivado en producción, no hay cambio de comportamiento visible.
**Riesgo identificado:** Ninguno funcional.
**Archivos:** `src/layouts/BlogPost.astro`, `src/components/CTAGuia.astro` (borrado)

## Incidencias

**Bloqueo estructural, sin resolver por segundo ciclo consecutivo (crítico):** ux-006 fue rechazada por el subagente `ux-ui` antes de tocar ningún archivo. La tarea requiere crear `src/lib/informe-pdf.tsx` (lógica de datos: tabla de 24/48 meses de anticipo con pensión y pérdida acumulada), pero el mandato de `ux-ui` está restringido a `src/components/**`, `src/layouts/**`, `src/styles/**` y `src/pages/**` — no a `src/lib/**`. Es exactamente el mismo motivo por el que `ux-005` falló el 2026-08-27 (ver `scripts/DECISIONES.md`).

Esto no es un fallo puntual: **toda la cadena ux-006 → ux-007 → ux-008 → ux-009** (el generador completo del informe de pago de 49 €, encargo directo del propietario en E-1, prioridad #1 de la replanificación forzada del 2026-08-26) toca `src/lib/**`, `api/**` o `scripts/**`, fuera del alcance real de los tres subagentes de esta routine (`ux-ui`, `seo`, `cro`). Ninguno de los tres puede ejecutar esta línea de trabajo tal como está etiquetada hoy. Por eso ux-007, ux-008 y ux-009 no se han ni siquiera intentado este ciclo.

**Recomendación explícita, repetida por segunda vez:** antes del próximo ciclo, el propietario o el CEO deben crear/habilitar un subagente de tipo desarrollo/backend con permiso sobre `src/lib/**`, `api/**` y `scripts/**`, o reasignar explícitamente esas tareas a un área nueva. Mientras esto no se resuelva, el producto que va a generar ingresos (E-1) sigue completamente parado y esta routine seguirá gastando un slot diario en redescubrir el mismo bloqueo.

No hubo rutas prohibidas tocadas ni build roto.

## Estado del backlog
15 pendientes · 23 hechas · 2 fallidas
Próxima replanificación: cuando queden 0 pendientes
