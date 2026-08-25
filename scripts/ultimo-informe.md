# Informe de mejora continua — 2026-08-25

## Resumen
Día de replanificación forzada por encargo directo del propietario (2026-08-24): el estratega-ceo ha reescrito `scripts/ESTRATEGIA.md` definiendo el CÓMO del producto (precio, pasarela de pago, entrega automática, captura de datos, recompra) y el product-owner ha traducido esa estrategia en 14 tareas nuevas del backlog; no se ha ejecutado ninguna tarea hoy.

## Cambios aplicados

### [estrategia] Replanificación forzada — el CÓMO del producto
**Qué:** `scripts/ESTRATEGIA.md` reescrito completo. El QUÉ (informe de decisión automático, coste marginal cero) no se ha reabierto, ya estaba cerrado por el propietario. Se añade la "Ficha de producto — decisión cerrada": precio 49 € IVA incluido (pago único, 12 meses de reemisión incluida), pasarela Stripe Checkout alojado en modo `payment` (por Bizum y cero PCI), entrega automática en seis piezas sobre la infraestructura serverless ya existente (`/api`, Upstash, Resend) con regeneración del PDF al vuelo vía token, captura de 7 campos obligatorios + 3 opcionales + 2 casillas legales (incluida renuncia al desistimiento, art. 103.m RDL 1/2007), y recompra por tres disparadores (cambio de datos, cambio normativo, renovación opt-in a los 12 meses a 19 €). La vía bancaria queda dimensionada en cero este ciclo, con condiciones explícitas para reabrirla.
**Por qué:** Encargo directo del propietario registrado en `config.replanificacion_forzada` de `scripts/BACKLOG.json` (2026-08-24): dar forma al producto y llevarlo hasta poder venderse.
**Hipótesis:** Se evaluaron todas las hipótesis registradas en `scripts/DECISIONES.md` desde la última replanificación (2026-08-15) contra los datos reales disponibles (357 clics / 24.650 impresiones en 55 días). Resultado resumido: seo-012, seo-014, seo-017, seo-021 (mitad), normativa-001 y legal-001 confirmadas; seo-013 y seo-016 refutadas como causa raíz real; seo-015 y contenido-001 (efecto) sin datos suficientes; seo-019/seo-020 correctamente no evaluadas (parada previa por riesgo normativo). `legal-001` asciende a bloqueante de negocio: sin `LEGAL.titular`/`nif`/`domicilio` reales no se puede activar el cobro.
**Cómo lo mediremos:** El criterio de éxito del ciclo es binario y con fecha: el 2026-09-30 un desconocido debe poder comprar el informe y recibirlo sin intervención humana. Se detalla en `scripts/ESTRATEGIA.md` con 5 condiciones falsables.
**Riesgo identificado:** El motor de cálculo (`src/lib/pension-calculo.ts`) es TypeScript y las funciones serverless en `/api` son `.js`; las tareas de checkout/webhook/descarga deben evitar duplicar cifras sin verificación. El webhook de Stripe requiere `bodyParser: false` para que la verificación de firma funcione. No hay dependencias npm instaladas en este entorno de ejecución (`astro: not found`), lo que limita la verificación por build de las tareas de ejecución futuras.
**Archivos:** `scripts/ESTRATEGIA.md`

### [product-owner] Generación de 14 tareas nuevas en el backlog
**Qué:** `scripts/BACKLOG.json` ampliado con 14 tareas nuevas (cro-001 a cro-008, ux-005 a ux-008, seo-023, seo-024), repartidas en tres líneas: Línea 1 (cro, 8 tareas) — la máquina de cobro y entrega; Línea 2 (ux, 4 tareas) — el PDF que justifica el precio; Línea 3 (seo, 2 tareas) — puertas de entrada desde tráfico ya existente. Las tareas pendientes previas (seo-019, seo-020, seo-022, ux-003, ux-004) se han dejado intactas, ya encajaban en la Línea 3. `config.replanificacion_forzada.activa` puesto a `false` y `ultima_replanificacion` actualizado a `2026-08-25`.
**Por qué:** Traducir la estrategia recién aprobada en trabajo ejecutable, siguiendo el orden de la cadena crítica (cobro y entrega antes que escaparate y puerta de entrada).
**Hipótesis:** Cada tarea lleva su propia hipótesis, criterio de éxito y métrica en `scripts/BACKLOG.json`.
**Cómo lo mediremos:** Ejecución diaria de hasta 5 tareas/día a partir de mañana, empezando por prioridad 1 (cro-001).
**Riesgo identificado:** `stripe` y `pdf-lib` no están en `package.json` — las tareas que los necesitan (cro-005, ux-005) lo declaran explícitamente; sin acceso a red para `npm install` en el entorno de ejecución, esas tareas solo serán parcialmente verificables. Existe dependencia estricta entre ux-005/ux-006/ux-007 (mismo archivo `src/lib/informe-pdf.ts`) y entre estas y cro-006/cro-007/cro-008/ux-008 — si el límite de 5 tareas/día no respeta el orden de prioridad, alguna tarea puede despacharse antes de que exista el archivo del que depende. seo-023 asume que `/informe` (cro-004) ya existe. Ninguna tarea rellena `LEGAL.titular`/`nif`/`domicilio` con datos reales — sigue siendo una acción pendiente del propietario fuera del backlog, y el cobro no debe activarse en producción hasta que se resuelva.

## Incidencias
Ninguna. Ambos subagentes (estratega-ceo, product-owner) devolvieron su informe estructurado; ningún archivo fuera de `scripts/ESTRATEGIA.md` y `scripts/BACKLOG.json` fue tocado; ninguna ruta prohibida fue tocada.

No se ejecutó ninguna tarea del backlog hoy, tal como exige el paso de replanificación.

## Estado del backlog
19 pendientes · 21 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes en el backlog.
