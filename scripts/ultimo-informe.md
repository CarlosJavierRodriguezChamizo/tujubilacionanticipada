# Informe de mejora continua — 2026-09-05

## Resumen
Se ha reintentado seo-020 y ha vuelto a fallar por precaución normativa: el subagente detectó una discrepancia interna entre el motor de cálculo y contenido ya publicado del propio sitio, sin tocar ningún archivo.

## Cambios aplicados

Ninguno. La única tarea despachada hoy (seo-020) se detuvo antes de editar nada.

## Incidencias
- `cro-007` y `cro-008` siguen bloqueadas y no se han despachado: dependen de que el propietario rellene `LEGAL.titular`, `LEGAL.nif` y `LEGAL.domicilio` en `src/consts.ts` y active la cuenta de Stripe; ningún agente puede resolverlo.
- `seo-020` (reintento) — FALLIDA: al derivar la tabla de coeficientes reductores desde `src/lib/pension-calculo.ts`, el subagente seo encontró que `COEF_VOLUNTARIA[1 mes de anticipo][tramo C, 41a6m-44a6m]` vale 2,96 % en el motor, pero dos artículos ya publicados del blog (`penalizacion-jubilacion-anticipada-voluntaria.mdx` y `tabla-penalizacion-jubilacion-anticipada.mdx`), que citan expresamente el mismo PDF oficial de coeficientes reductores de seg-social.es, afirman 2,86 % para esa misma celda. No se pudo verificar contra boe.es/seg-social.es porque el acceso saliente a esos dominios está bloqueado en este entorno. Siguiendo la cláusula de parada de la propia tarea, el subagente no editó nada y reportó el hallazgo en vez de decidir por su cuenta cuál cifra es correcta o corregir el motor. `ux-003` y `ux-004` no se han despachado por depender del mismo archivo (`src/pages/simulador.astro`) y del mismo contenido pendiente.
- Recomendación al CEO: encargar una auditoría dedicada de las 96 celdas de `COEF_VOLUNTARIA`/`COEF_INVOLUNTARIA` en `src/lib/pension-calculo.ts` contra el PDF oficial de seg-social.es (con acceso de red habilitado, o aportando el PDF como archivo local), ya que esta discrepancia se encontró solo por comparación cruzada casual con contenido existente, no por una revisión exhaustiva.

## Estado del backlog
4 pendientes (2 bloqueadas: cro-007, cro-008; 2 en espera de la auditoría normativa: ux-003, ux-004) · 29 hechas · 7 fallidas
Próxima replanificación: cuando queden 0 pendientes
