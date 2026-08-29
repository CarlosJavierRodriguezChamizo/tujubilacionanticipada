# Informe de mejora continua — 2026-08-29

## Resumen
Se completó la página de venta del informe (/informe), el precheck gratuito que evita cobrar a quien no tiene derecho, y el CTA desde el simulador; la línea de generación del PDF (ux-007/008/009) sigue bloqueada porque su prerequisito (informe-pdf.tsx, de ux-005/ux-006) nunca se construyó.

## Cambios aplicados

### cro cro-003 — Borrar la página de la guía de 29 € y retirar GUIA_PRECIO de consts.ts
**Qué:** Borrado src/pages/_guia-jubilacion-anticipada.astro y eliminada la constante GUIA_PRECIO de src/consts.ts.
**Por qué:** Completar la retirada del producto de 29 € descartado por E-1, sin dejar código muerto que confunda a agentes futuros.
**Hipótesis:** Confirmada — tras cro-001/cro-002 ningún archivo importaba ya GUIA_PRECIO.
**Cómo lo mediremos:** No aplica métrica de negocio (limpieza de código muerto sin producto activo detrás).
**Riesgo identificado:** Ninguno funcional; la página nunca fue una ruta pública indexable.
**Archivos:** src/pages/_guia-jubilacion-anticipada.astro (borrado), src/consts.ts

### cro cro-004 — Crear la página /informe con el formulario nativo de 6 campos y el copy de venta
**Qué:** Creada src/pages/informe.astro: formulario sin JavaScript hacia /api/informe-crear con los 6 campos de captura, 2 casillas de consentimiento separadas y sin marcar, copy de qué incluye/qué NO incluye literal de E-1, precio 49,00 € IVA incluido y el DISCLAIMER de consts.ts.
**Por qué:** Es el primer paso obligatorio del embudo de pago del Informe de Fecha Óptima de Jubilación.
**Hipótesis:** Confirmada en forma — página funcional sin JS a falta del endpoint.
**Cómo lo mediremos:** Tasa de envíos a /api/informe-crear y de clics en el CTA, cuando haya tráfico suficiente (no antes de 2-4 semanas).
**Riesgo identificado:** El endpoint /api/informe-crear no existía en el momento de crear esta página (se completó horas después, en cro-005, dentro del mismo día).
**Archivos:** src/pages/informe.astro

### cro cro-005 — Crear api/informe-crear.ts con el precheck gratuito y la redirección a /informe/no-aplica
**Qué:** Endpoint serverless que valida el formulario de /informe y ejecuta un precheck real contra pension-calculo.ts (35/33 años cotizados proyectados a la edad ordinaria, carencia mínima, superaMinimaExigida del art. 208.1.c en el mejor caso). Si no accede, 303 a /informe/no-aplica con el detalle del caso; si accede, 501 explícito sin cobrar (Stripe pendiente, cro-007).
**Por qué:** E-1 exige que ningún caso sin derecho llegue a la pasarela de pago, para evitar devoluciones y reseñas negativas.
**Hipótesis:** Confirmada en forma — la lógica usa las funciones y constantes reales del motor, verificadas una a una.
**Cómo lo mediremos:** 0 sesiones de pago creadas para casos sin derecho; tasa de reseñas por "no podía jubilarme" en 0, cuando el circuito de pago esté activo.
**Riesgo identificado:** El precheck confía en los datos declarados por el usuario (no verifica su vida laboral real); la página /informe/no-aplica depende de JavaScript para mostrar el detalle del caso, por ser un sitio estático sin SSR.
**Archivos:** api/informe-crear.ts, src/pages/informe/no-aplica.astro

### seo seo-023 — Sustituir el bloque muerto de captura de email en Simulador.jsx por el CTA al informe de pago
**Qué:** Eliminado el bloque {false && (...)} de captura de email (código muerto) y su estado asociado; añadido un enlace a /informe tras el resultado del simulador, con copy honesto y evento GA4 cta_informe.
**Por qué:** ESTRATEGIA.md ordena colocar el CTA al informe en ese hueco muerto, en el momento de mayor intención del usuario.
**Hipótesis:** Confirmada en forma — enlace presente y funcional con JS activado, sin patrones oscuros.
**Cómo lo mediremos:** Evento GA4 cta_informe (location: simulador) — tasa de clic hacia /informe y variación de sesiones, a revisar en ~21 días.
**Riesgo identificado:** Posible competencia visual entre el CTA de asesoramiento gratuito y el nuevo CTA al informe, ambos al final del resultado.
**Archivos:** src/components/Simulador.jsx

## Incidencias
- **ux-007 fallida por dependencia incompleta.** Su prerequisito, `src/lib/informe-pdf.tsx` (de ux-005) y la dependencia `@react-pdf/renderer`, no existen: ux-005 y ux-006 quedaron "fallida" en ciclos anteriores porque ese trabajo (crear el motor de PDF en src/lib/**, añadir una dependencia npm) cae fuera del alcance permitido de los subagentes disponibles (ux-ui, seo, cro), ninguno con permiso sobre src/lib/**, api/** o package.json para ese tipo de tarea. El subagente ux-ui verificó esto antes de tocar nada y se detuvo, sin modificar ningún archivo.
- **ux-008, ux-009 y cro-006 no se despacharon hoy.** Dependen del mismo artefacto ausente (informe-pdf.tsx / informe-analisis.ts / api/informe-render.ts) que ux-007; despacharlas habría reproducido el mismo bloqueo ya confirmado, así que el orquestador usó esa capacidad del cupo diario en tareas cro sí ejecutables (cro-004, cro-005) en su lugar.
- Sin rutas prohibidas tocadas, sin builds rotos.
- **Recomendación reiterada al CEO/propietario:** la línea del informe de pago (E-1, prioridad #1 de la replanificación forzada del 2026-08-26) tiene su embudo de captación y precheck completos (/informe, /informe/no-aplica, api/informe-crear.ts), pero la generación del PDF en sí sigue completamente parada por tercer ciclo consecutivo. Se necesita reasignar ux-005..ux-009 a un subagente con permiso sobre src/lib/**, api/** y package.json, o crear uno nuevo, antes del próximo ciclo.

## Estado del backlog
10 pendientes · 27 hechas · 3 fallidas
Próxima replanificación: cuando queden 0 pendientes
