# Informe de mejora continua — 2026-08-19

## Resumen
Se han consolidado las señales canonical del par de artículos canibalizados (seo-017) y reubicado el motor de cálculo del simulador a un módulo compartido (seo-018); la tercera tarea prevista (seo-019, tabla estática de escenarios) se ha detenido a propósito antes de publicar nada, tras descubrir que dos constantes normativas usadas por el simulador (edad legal de jubilación y umbral de años cotizados) corresponden a 2025 y no a la normativa vigente en 2026.

## Cambios aplicados

### seo seo-017 — Alinear mainEntityOfPage del JSON-LD con el canonical externo en artículos consolidados
**Qué:** blogPostingSchema() (src/lib/schema.ts) apunta ahora mainEntityOfPage.@id y url del artículo consolidado (jubilacion-anticipada-novedades-2026) al destino canónico (jubilacion-anticipada-cambios-2026), en vez de a sí mismo.
**Por qué:** Evitar que el JSON-LD contradiga la consolidación por canibalización de keyword ya identificada en seo-013.
**Hipótesis:** Eliminar la contradicción entre canonical y JSON-LD ayuda a un rastreador a consolidar la autoridad hacia la URL ganadora en vez de repartirla entre las dos.
**Cómo lo mediremos:** grep de mainEntityOfPage en ambos dist/blog/*/index.html (verificado hoy); GSC a 21 días una vez completado también seo-014.
**Riesgo identificado:** seo-014 (el `<link rel=canonical>` HTML) sigue revertida por un bug anterior en canonical-map.ts; ese bug no se ha reproducido hoy en un build limpio, así que existe una discrepancia temporal: el canonical HTML de novedades-2026 sigue autorreferenciándose mientras el JSON-LD ya apunta al destino consolidado. Se recomienda reintentar seo-014.
**Archivos:** src/lib/schema.ts

### seo seo-018 — Extraer el motor de cálculo puro del simulador a src/lib/pension-calculo.ts
**Qué:** Refactor de reubicación pura (sin cambiar ninguna fórmula ni cifra): las constantes normativas y las funciones porcentajePension/calcularEscenario/fechaDesdeEdad pasan de Simulador.jsx a un nuevo módulo compartido src/lib/pension-calculo.ts.
**Por qué:** Paso previo necesario para poder generar en build, desde una página .astro, una tabla de escenarios estática con el mismo motor que usa hoy la isla React.
**Hipótesis:** Reubicar el motor a un módulo compartido, sin tocar la lógica, permite reutilizarlo desde código de build sin duplicarlo ni arriesgar divergencias.
**Cómo lo mediremos:** 6 combinaciones de edad/años cotizados/base reguladora comparadas antes/después del refactor: idénticas (verificado hoy).
**Riesgo identificado — el más relevante del día:** Durante la extracción se detectó que dos constantes ya en producción están desactualizadas respecto a la normativa vigente en 2026: la edad legal de jubilación usa 66 años y 8 meses (valor de 2025; debería ser 66 años y 10 meses en 2026) y el umbral de años cotizados para acceder a la edad reducida usa 38,5 años (debería ser 38 años y 3 meses). Este dato ya estaba en producción antes de hoy —solo se ha reubicado de sitio, no se ha introducido ni corregido— y afecta a la isla React interactiva del simulador que ya usan los visitantes del sitio.
**Archivos:** src/lib/pension-calculo.ts (nuevo), src/components/Simulador.jsx

## Incidencias

**seo-019 (Renderizar en /simulador una tabla estática de escenarios) — FALLIDA por precaución, ningún archivo tocado.** Antes de generar la tabla estática prevista (≥40 filas indexables), se verificó contra varias fuentes externas coincidentes el riesgo que ya había señalado seo-018: la edad legal de jubilación y el umbral de años cotizados que usa el motor de cálculo corresponden a 2025, no a 2026. Publicar una tabla indexable con la fecha de jubilación estimada mal calculada en un sitio sobre pensiones se consideró un riesgo inaceptable, así que la tarea se detuvo sin escribir ningún archivo ni ejecutar build. **Esto requiere tu atención:** el motor de cálculo con estos dos valores desactualizados ya está en producción (usado por la calculadora interactiva de /simulador que ven los visitantes hoy mismo), no es un problema introducido por esta rutina — pero esta rutina lo ha descubierto y no tiene autoridad para corregirlo sin revisión experta. Recomendación: revisar y corregir EDAD_LEGAL_PLENA (→ 66 años y 10 meses) y UMBRAL_COTIZACION_EDAD_REDUCIDA (→ 38 años y 3 meses) en src/lib/pension-calculo.ts con una fuente oficial (seg-social.es/BOE), y de paso revisar los coeficientes de penalización por trimestre (también señalados como posible simplificación). Una vez corregido, seo-019 puede reintentarse.

seo-020 y seo-021 quedan pendientes para mañana: ambas comparten archivo (src/pages/simulador.astro y/o src/lib/schema.ts) con tareas ya ejecutadas hoy, y la regla de "un archivo por día" del orquestador las difiere automáticamente. Además, seo-020 y seo-021 dependen de que la tabla estática de seo-019 exista, así que en la práctica están bloqueadas hasta que se resuelva el riesgo normativo anterior.

## Estado del backlog
4 pendientes (seo-020, seo-021, ux-003, ux-004) · 19 hechas · 2 fallidas (seo-014, seo-019)
Próxima replanificación: cuando queden 0 pendientes
