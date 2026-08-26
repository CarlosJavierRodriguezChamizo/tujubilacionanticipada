# Informe de mejora continua — 2026-08-26

## Resumen
Día de replanificación forzada por encargo directo del propietario: se ha definido el CÓMO del nuevo producto ("Informe de Fecha Óptima de Jubilación", 49 € IVA incl.) y traducido a 14 tareas nuevas del backlog; no se ha ejecutado ninguna tarea hoy.

## Replanificación de estrategia

**Motivo:** `config.replanificacion_forzada` en `scripts/BACKLOG.json`, registrado el 2026-08-24, con encargo directo del propietario: el QUÉ del producto ya estaba decidido ("E-1. El producto: informe de decisión, no guía informativa" en `scripts/ESTRATEGIA.md`) — un informe personalizado de fecha óptima de jubilación, generado automáticamente desde `src/lib/pension-calculo.ts`, con coste marginal cero por venta. La guía de 29 € queda descartada. El encargo era resolver el CÓMO: precio, pasarela, entrega automática, captura de datos y motivo de recompra. Esta instrucción prevalecía sobre el conteo de tareas pendientes (había 5 pendientes de la línea /simulador), por lo que hoy se ha tratado como día de replanificación en vez de despachar tareas.

**Estratega-ceo** reescribió `scripts/ESTRATEGIA.md` completo (conservando literal el bloque de encargos del propietario E-1 a E-4) definiendo:

- **Precio:** 49,00 € IVA incl., pago único, revisión a las 30 ventas.
- **Pasarela:** Stripe Checkout hospedado (tarjeta + Bizum), con `invoice_creation` + Stripe Tax.
- **Entrega:** formulario nativo → función serverless de precheck → Stripe → webhook firmado e idempotente → PDF generado con `@react-pdf/renderer` reutilizando `pension-calculo.ts` → email + descarga. Funciona sin JavaScript en el tramo del dominio propio.
- **Captura de datos:** 6 campos (fecha de nacimiento, periodo cotizado en años y meses, base reguladora, modalidad, si sigue cotizando, email), con precheck gratuito que impide la venta si el caso no tiene derecho a jubilación anticipada.
- **Recompra:** 12 meses de reemisiones gratuitas (enlace firmado HMAC) + recompra voluntaria a 19 €, sin renovación automática ni cuenta atrás.
- **Bloqueo crítico identificado:** `LEGAL.titular`, `LEGAL.nif` y `LEGAL.domicilio` en `src/consts.ts` siguen vacíos. Sin esos datos reales no se puede activar Stripe ni emitir factura (art. 10 LSSI-CE). Es un dato que solo el propietario puede aportar.

**Product-owner** tradujo la estrategia a **14 tareas nuevas** (5 ux, 8 cro, 1 seo) y reordenó las 5 tareas heredadas de la línea `/simulador` (`seo-019`, `seo-020`, `seo-022`, `ux-003`, `ux-004`) para que se ejecuten después, dentro de la Línea 3:

- `ux-005`…`ux-009`: esqueleto del PDF, tabla mes a mes, acantilados/punto de equilibrio, función serverless de generación, verificación por mutación.
- `cro-001`…`cro-003`: retirar la guía de 29 € (banner, componente, página) sin romper el build.
- `cro-004`…`cro-006`: página `/informe`, precheck + creación de caso, reemisión firmada — ninguna depende de Stripe.
- `cro-007`, `cro-008` **[BLOQUEADAS]**: creación de sesión de Stripe Checkout y webhook de entrega. Su hipótesis y criterio de éxito documentan explícitamente que no pueden completarse hasta que el propietario rellene los 3 campos legales y active la cuenta de Stripe. Quedan con prioridad 12-13, después de todo lo que sí se puede ejecutar sin ese dato.
- `seo-023`: sustituir el bloque muerto de captura de email en `Simulador.jsx` por un CTA real a `/informe`.

`config.replanificacion_forzada.activa` se ha puesto a `false` y `ultima_replanificacion` a `2026-08-26`.

## Incidencias
Ninguna tarea del backlog se ha ejecutado hoy (día de replanificación). Bloqueo pendiente de resolver por el propietario: `LEGAL.titular`, `LEGAL.nif` y `LEGAL.domicilio` en `src/consts.ts` — sin ellos, `cro-007` y `cro-008` no pueden avanzar cuando les llegue el turno.

## Estado del backlog
19 pendientes · 21 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes
