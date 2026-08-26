# Encargos del propietario — 2026-08-24

> Esta sección la escribe el propietario, no el estratega. **Tiene prioridad sobre el
> resto del documento** y debe atenderse en la próxima replanificación. Cuando un
> encargo esté cumplido, el estratega lo mueve al diagnóstico con su veredicto.

## E-1. El producto: informe de decisión, no guía informativa

El propietario ha decidido el **qué**. El estratega decide el **cómo** y el
product-owner lo trocea, pero **no puede sustituir esta definición por otra**.

### Qué NO se vende

**La guía de 29 € queda descartada como producto principal.** El razonamiento es del
propietario y los datos lo respaldan: nadie paga por información que está gratis en
internet y que cualquier IA resume en diez segundos. Además, las consultas reales del
export de Search Console **no son informativas, son personales**: "tengo 52 años y no
tengo 15 años cotizados" (192 impresiones, posición 5,5), "me puedo jubilar con 60 años
y 25 cotizados", "jubilarse a los 55 con 30 años cotizados" (posición 3,7). Nadie
escribe eso buscando una guía. Buscan **su número**.

**Tampoco se vende asesoramiento humano por encargo.** Restricción del propietario:
el negocio debe ser **lo más autónomo posible**. Cualquier propuesta cuyo coste marginal
por venta sea el tiempo de una persona queda descartada como producto principal.

### Qué se vende

**Un informe personalizado de fecha óptima de jubilación, generado automáticamente.**

No vende información: vende una **decisión** y el coste exacto de equivocarse en ella.
El activo que lo hace posible ya existe y es `src/lib/pension-calculo.ts`, alineado
desde el 2026-08-24 con los cuadros de los arts. 207.2 y 208.2 LGSS, la DT 7.ª y el
RD 241/2026.

**Por qué una IA genérica no lo sustituye, con la prueba delante:** este mismo sitio,
redactado por un agente de IA a partir de "fuentes oficiales", publicó durante meses el
coeficiente fijo por trimestre (1,875 %) en 28 artículos. Está derogado desde 2022. Todo
internet lo repite, así que cualquier modelo entrenado sobre internet lo repite también.
El foso no es la prosa: es **el motor verificado contra el BOE y la auditoría que lo
mantiene verificado** (`scripts/auditar-normativa.mjs`).

**Y por qué el usuario no llega solo a ese número:** la escala de coeficientes es
discontinua, y los saltos no se ven sin calcular tu caso exacto. Tres ejemplos reales
sobre una base reguladora de 1.800 €/mes y edad legal 65:

- **El último mes de anticipo.** Con 41 años cotizados, jubilarse 24 meses antes son
  1.458 €/mes; 23 meses antes, 1.503 €. Esperar **un mes** vale 45 €/mes de por vida:
  **12.600 € en 20 años.**
- **El cambio de tramo.** Con 41 años y 4 meses cotizados el coeficiente a 24 meses es
  del 19 %; con 41 años y 6 meses, del 17 %. **Dos meses más cotizados = 36 €/mes para
  siempre, 10.080 € en 20 años.**
- **El umbral de la edad legal.** Con 38 años y 2 meses cotizados la edad ordinaria es
  66 años y 10 meses; con 38 años y 3 meses, 65. **Un mes de cotización adelanta 22
  meses el cobro sin penalización.**

Nadie encuentra eso en una guía ni se lo dice un chatbot: hay que calcularlo sobre su
carrera concreta. Ese es el producto.

### Alcance del entregable (lo que el comprador recibe)

1. Su edad ordinaria exacta y la fecha en que la cumple (DT 7.ª LGSS).
2. **La tabla de sus fechas posibles**, mes a mes (24 en voluntaria, 48 en involuntaria):
   pensión resultante, pérdida mensual y pérdida acumulada a 20 años en cada una.
3. **Sus acantilados**, señalados: en qué meses concretos esperar un poco más produce un
   salto desproporcionado, y cuánto vale cada uno en euros.
4. **Punto de equilibrio** de esperar frente a adelantar: cuántos meses de cobro se
   tarda en recuperar lo que se deja de cobrar por esperar. Es aritmética sobre sus
   propias cifras, no una recomendación de inversión.
5. **Verificación de requisitos**: 35/33 años cotizados, la regla del art. 208.1.c)
   (la pensión resultante debe superar la mínima que le correspondería a los 65), el
   tope de 3.359,60 €/mes y la carencia del art. 205.1.b).
6. **Cada cifra con su fuente oficial** enlazada, y el DISCLAIMER visible: es un cálculo
   orientativo, no el cálculo oficial de la Seguridad Social.

### Restricciones de diseño (no negociables)

- **Coste marginal por venta = 0.** Ninguna persona interviene en la entrega de un
  informe concreto. Si una propuesta necesita revisión humana por pedido, está mal.
- **Se vende un cálculo, no asesoramiento.** El posicionamiento, el copy y las
  condiciones deben sostener esa distinción de forma consistente, y el propietario debe
  hacerla revisar por un profesional **una vez** (la metodología), no por informe.
- Todo dato del informe sale de `src/lib/pension-calculo.ts`. **Prohibido que la
  plantilla del informe reescriba cifras a mano**: si el motor cambia, el informe cambia.
- Sigue prohibido fabricar señales de confianza, y sigue prohibido un CTA de pago que
  acabe en un `mailto:`.

### Fiabilidad del cálculo: es el producto, no un detalle técnico

Si el informe se cobra, **no puede tener un solo dato mal**. No basta con que el motor
esté bien hoy: tiene que ser imposible que se desvíe mañana sin que alguien se entere.
El mecanismo ya está montado y es condición de publicación:

- `scripts/fuentes/` guarda los **extractos literales del BOE** (arts. 207, 208 y 210,
  DT 7.ª y DT 9.ª), con su URL, su fecha de descarga y el SHA-256 del HTML de origen.
- `scripts/verificar-motor.mjs` **parsea esas tablas del texto oficial** y las compara
  celda a celda con `src/lib/pension-calculo.ts`: las 24×4 filas del cuadro de la
  voluntaria, las 48×4 de la involuntaria, el calendario de edades de la DT 7.ª, los
  cortes de la escala de la DT 9.ª, los requisitos de acceso y los importes de 2026.
  **326 comprobaciones**, más invariantes legales (a más años cotizados, menos
  reducción; la escala suma exactamente 100 %; ninguna cifra derogada en el módulo).
- Corre en CI **antes del build**: si el motor se desvía de la ley, no se despliega.
- Verificado por mutación: alterar una sola celda, volver a la edad de 2025 o borrar una
  fila hacen fallar el paso. Un verificador que nunca falla no verifica nada.

**Regla para el estratega y el product-owner:** cualquier cifra nueva que entre en el
informe (complementos, mínimos, cotizaciones, regímenes especiales) entra **por el mismo
camino**: extracto oficial en `scripts/fuentes/`, constante en el motor y comprobación en
`verificar-motor.mjs`. Ninguna cifra del informe puede existir solo en una plantilla.

### Maquetación: forma parte de lo que se paga

Un informe de pago mal presentado no se percibe como caro, se percibe como falso. El
entregable debe estar a la altura del precio:

- Documento paginado y descargable (PDF), con portada, índice, numeración y fecha de
  emisión, no una página web impresa.
- La tabla de fechas es el corazón del documento: debe leerse de un vistazo, con los
  acantilados destacados visualmente y las cifras alineadas.
- Legible para el público real del sitio, de 50 a 65 años: cuerpo de texto grande,
  contraste AA, nada de tipografías finas ni gráficos densos.
- Cada cifra normativa con su fuente citada al pie de su propia sección.
- Debe verse igual de bien impreso en blanco y negro: mucho de este público lo imprimirá.

### Datos de los clientes: qué se puede hacer con ellos y qué no

El propietario plantea comercializar con bancos los datos recogidos, para productos de
inversión que complementen la pensión. **La versión "vender la base de datos" queda
descartada**, por tres razones, en este orden:

1. **No es lícita tal cual.** Los datos se recogen con una finalidad —calcular una
   estimación de pensión— y cederlos a terceros para su prospección comercial es una
   finalidad distinta e incompatible. Haría falta un consentimiento **específico,
   separado, informado (nombrando a los destinatarios) y libre**, que no puede ser
   condición para recibir el informe. Un consentimiento empaquetado con la compra es
   nulo, y aquí el perfil es especialmente sensible en lo económico: edad, carrera de
   cotización y base reguladora de una persona de 50 a 65 años.
2. **Puede ser actividad regulada.** Intermediar o presentar clientes a entidades
   financieras a cambio de remuneración no es libre en España. Antes de cualquier
   acuerdo, el propietario debe verificarlo con un profesional.
3. **Destruye el único foso del producto.** El informe se vende porque no tiene agenda:
   "aquí está tu número, verificado contra el BOE". Si el comprador sospecha que su caso
   se ha vendido a un banco, el producto deja de valer lo que se paga por él. Se estaría
   canjeando el activo que sostiene el negocio por un ingreso menor.

**Lo que sí se puede hacer, y probablemente convierte mejor:** ofrecer al comprador,
**después** de entregarle el informe y con una casilla **separada y desmarcada**, que se
le ponga en contacto con una entidad concreta para estudiar cómo complementar su
pensión. Es el momento de máxima intención —acaba de ver en euros su propio agujero— y
el usuario elige. Eso es captación consentida, no cesión de una base de datos: la
diferencia entre las dos cosas es exactamente lo que separa un ingreso recurrente de una
sanción. El estratega debe dimensionar esta vía como **ingreso secundario**, nunca como
el principal, y nunca condicionando la entrega del informe.

### Lo que el estratega y el product-owner deben resolver

1. **Precio.** Referencia del propietario: 29 € era poco para lo que cuesta y mucho para
   lo que daba. Un informe de decisión soporta más, y ahora además va respaldado por una
   verificación contra el BOE que se puede enseñar. Justificar la cifra elegida contra lo
   que el comprador se juega (los acantilados de arriba son de cinco cifras).
2. **Pasarela de pago y entrega automática.** Hoy no existe ninguna de las dos. Son
   tareas del backlog, no supuestos.
3. **Captura de datos.** El simulador ya pide edad, años cotizados y base reguladora y
   ya captura email: el embudo está medio construido. Definir qué datos adicionales hace
   falta pedir (fecha de nacimiento y meses cotizados exactos, situación familiar,
   modalidad accesible) sin convertir el formulario en un muro.
4. **Motivo de recompra.** Las cifras se revalorizan cada enero y el calendario
   transitorio cambia en 2027. Un informe caduca. Decidir si eso es una reemisión
   gratuita, una alerta por email o una suscripción.
5. **Qué se hace con los 2 leads ya recibidos** mientras el informe no esté listo.
6. **La vía de captación consentida hacia entidades financieras**: qué se ofrece, con qué
   texto, en qué momento y con qué destinatarios nombrados. Como ingreso secundario y
   siempre posterior a la entrega del informe.

### Realidad de volumen (para que el precio no se decida en el aire)

Con 190 clics/mes orgánicos, una conversión del 2 % son ~4 ventas/mes. El producto no
se justifica por lo que factura hoy, sino porque **su coste marginal es cero y escala
con el tráfico sin añadir trabajo**. Por eso la Línea 3 (`/simulador`, hoy en posición
48 para un cluster de ~150 impresiones/mes) deja de ser solo SEO: es el embudo del
producto.

## E-2. Credenciales verificables: congeladas, y el producto no debe depender de ellas

`seo-006` quedó REFUTADA por falta de referencias externas comprobables del revisor.
Decisión del propietario: **no se toca nada de las credenciales de momento.** No se
añaden `sameAs`, ni perfiles, ni credenciales, ni se inventan. Cualquier tarea que lo
proponga se rechaza hasta nuevo aviso. El propietario conseguirá a la persona, pero **el producto de E-1 está diseñado a
propósito para no depender de ella en la entrega**: una revisión de la metodología, una
vez, no una intervención por informe vendido. Cualquier propuesta que reintroduzca a una
persona en el coste marginal incumple a la vez E-1 y esta restricción.

## E-3. Ya hay datos de rendimiento: se acabó decidir a ciegas

El bloqueo que el estratega reportó tres ciclos seguidos está resuelto. En
`scripts/datos/` hay un export real de Search Console (1 jul – 24 ago 2026), por
páginas y por consultas, y `scripts/auditar-money-set.mjs` ya lo cruza solo. **La
próxima replanificación debe juzgarse con esos números, no con artefactos del build.**

Lo que dicen los datos, para que no se pierda: 346 clics y 20.526 impresiones en
España, posición media 11,2. Las tres URLs que sostienen el sitio son
`coeficientes-reductores-jubilacion-anticipada` (73 clics, pos 9,4),
`jubilacion-anticipada-transportistas` (45, pos 8,8) y
`tabla-penalizacion-jubilacion-anticipada` (45, pos 9,5). **`/simulador` tiene 3 clics
y 276 impresiones en posición 48**, y el cluster de consultas de cálculo
("calculo jubilacion anticipada", "calcular jubilación anticipada", "simulador
jubilación anticipada") acumula ~150 impresiones en posiciones 35-68: el diagnóstico
de la Línea 3 queda **confirmado con datos**, no solo por medición del build. Y el
patrón que sí funciona es el de caso concreto: "jubilarse a los 55 con 30 años
cotizados" está en posición 3,7 y "tengo 52 años y no tengo 15 años cotizados" en 5,5.

## E-4. La Línea 3 ya no está bloqueada

La causa raíz que tumbó `seo-019` y `seo-020` está resuelta: `src/lib/pension-calculo.ts`
implementa desde hoy las tablas mensuales oficiales de los arts. 207.2 y 208.2 LGSS, la
edad ordinaria de 2026 de la DT 7.ª y los importes del RD 241/2026. **`seo-019`,
`seo-020`, `ux-003` y `ux-004` pueden reintentarse.** La tabla estática de escenarios
de `/simulador` debe generarse consumiendo ese módulo, nunca reescribiendo cifras a mano.

---

# Estrategia vigente — 2026-08-26

> **Replanificación forzada por encargo del propietario** (`scripts/BACKLOG.json` →
> `config.replanificacion_forzada`, foco `producto`). El **qué** está decidido en E-1 y no
> se reabre. Este documento es el **cómo**, y es una decisión tomada, no un menú de
> opciones. Los supuestos que solo el propietario puede confirmar van marcados
> como **[SUPUESTO]** y no han detenido ninguna decisión.

## Diagnóstico del ciclo anterior

Este es el primer ciclo que se juzga con datos reales de rendimiento
(`scripts/datos/`, export de Search Console 1 jul – 24 ago 2026). Se acabaron las
tres revisiones a ciegas.

### Veredicto de las hipótesis del ciclo 2026-08-15

| id | Hipótesis (resumida) | Veredicto |
|----|----------------------|-----------|
| seo-012 | Un auditor del conjunto money sobre `/dist` da un "antes" objetivo y repetible | **CONFIRMADA** — el script existe, salió en código 1 y reprodujo exactamente las 71 palabras de `/simulador` y los 2 pares canibalizados que yo había medido a mano |
| seo-013 | Una regla derivada del calendario resuelve sola los pares canibalizados | **CONFIRMADA** — resolvió el par vivo y, en simulación, el que iba a entrar el 24-ago sin intervención humana |
| seo-014 | El canonical hacia la URL consolidada deja de repartir la señal | **CONFIRMADA (artefacto) / SIN DATOS (efecto)** — verificado en `/dist` al segundo intento; el efecto en posición necesita 60-90 días y un export nuevo |
| seo-015 | Excluir del sitemap la URL consolidada evita anunciarla como indexable | **CONFIRMADA** |
| seo-016 | Diferenciar `title`/`H1` separa la intención de herramienta de la informacional | **REFUTADA en la práctica** — el cambio se hizo, pero el dato real dice que el problema de `/simulador` nunca fue el título: está en **posición 48 con 276 impresiones y 3 clics**, y `simulador jubilación anticipada` en posición 35,6. Una página de 71 palabras no rankea por mucho que se le afine el `<title>` |
| seo-017 | Alinear `mainEntityOfPage` con el canonical evita señales enfrentadas | **CONFIRMADA (artefacto)** |
| seo-018 | Extraer el motor a `src/lib/pension-calculo.ts` permite generar escenarios en build | **CONFIRMADA, y es la tarea más valiosa de todo el proyecto hasta hoy** — no por lo que hizo, sino porque al moverlo destapó que el sitio publicaba normativa derogada. Sin ese refactor no existiría el producto de E-1 |
| seo-021 | Quitar `browserRequirements` y hacer visibles las FAQ arregla la contradicción schema/HTML | **CONFIRMADA A MEDIAS** — las FAQ ya son visibles; `requiresJs` sigue en `true` porque **sigue siendo verdad**, y el agente hizo bien en no mentir en el schema |
| normativa-001 | Con el motor alineado con la norma vigente se puede publicar cifra en YMYL sin riesgo | **CONFIRMADA** — `auditar-normativa.mjs` en 0 incidencias altas y medias, y `verificar-motor.mjs` con 326 comprobaciones contra extractos del BOE corriendo antes del build |
| legal-001 | El formulario nativo cierra la mitad pendiente del incumplimiento sin-JS | **CONFIRMADA** — y deja probado el patrón `<form method="post" action="/api/…">` + 303, que es exactamente el que va a sostener el cobro del informe |

**Las dos paradas por precaución normativa (seo-019 y seo-020) fueron correctas y hay
que decirlo.** Dos agentes se negaron a publicar 40 filas indexables calculadas con un
coeficiente derogado desde 2022 y pararon. Costaron un ciclo de retraso y evitaron
convertir el activo del proyecto en pasivo. Esa regla se queda.

### Lo que dicen los números, sin adornos

- 346 clics y 20.526 impresiones en 8 semanas (≈190 clics/mes), posición media 11,2.
- **Lo que funciona es el caso concreto.** `jubilarse a los 55 con 30 años cotizados`
  posición 3,7 (8 clics); `tengo 52 años y no tengo 15 años cotizados` posición 5,5;
  `me puedo jubilar con 65 años y 35 años cotizados` 195 impresiones. Son consultas
  **personales**, no informativas: gente preguntando por su caso.
- **Lo que no funciona es la herramienta.** `/simulador`: 3 clics, 276 impresiones,
  **posición 48**. Es la URL más enlazada del sitio (69/69 páginas) y sigue con 71
  palabras y dependiendo por completo de una isla React.
- **Cero euros facturados. Dos leads en toda la vida del proyecto.** Ese es el dato de
  negocio, y explica por qué este ciclo cambia de eje.

### Balance

Nueve ciclos de arquitectura SEO han producido un sitio técnicamente correcto,
normativamente verificado y comercialmente inerte. La arquitectura de silos está
cerrada, la canibalización resuelta, el motor alineado con el BOE y auditado en CI.
**Lo único que falta para que esto sea un negocio es que exista algo que comprar.**

---

## Cuello de botella prioritario

**Conversión.** No hay ningún mecanismo por el que un visitante pueda entregar dinero a
cambio de nada.

Hasta el 2026-08-15 escribí, con razón, que optimizar la conversión era teatro porque no
existía oferta. Esa objeción ha caducado: el propietario ha definido la oferta en E-1 y
el activo que la hace posible (`src/lib/pension-calculo.ts`, verificado contra el BOE por
`verificar-motor.mjs`) existe y está en verde. Lo que falta ya no es decidir qué vender:
es **construir el circuito de cobro y entrega**, que hoy es literalmente cero líneas de
código.

Descarto los otros tres, explícitamente y con datos:

- *Visibilidad*: entran 190 clics/mes con 7 semanas de dominio y hay URLs en posición
  3-9. No está bloqueada.
- *Relevancia*: las consultas que traen clics coinciden con lo que los artículos
  responden, y con posiciones 3-9 el CTR implícito no delata un desajuste de intención.
- *Autoridad*: sigue siendo el techo a medio plazo (posición media 11,2, cluster de
  cálculo en 35-68) y por eso la Línea 3 no desaparece. Pero atacarla otro ciclo entero
  sin nada que vender solo produciría más tráfico que no paga.

**Matiz importante, para que nadie lo lea como un giro a CRO clásico:** aquí conversión
no significa cambiar colores de botón ni probar copys. Significa que existan una pasarela,
un generador y una entrega. Los tests de CRO siguen prohibidos: con ~190 clics/mes
cualquier A/B es ruido estadístico.

---

## Objetivo del ciclo

**El 2026-09-30 el circuito de venta del Informe de Fecha Óptima está cerrado de extremo
a extremo y demostrado con una venta real.** Se da por cumplido si y solo si se cumplen
las cuatro condiciones:

1. Existe **al menos una compra completada en Stripe en modo live** por 49,00 € cuyo PDF
   se generó y entregó **en menos de 5 minutos sin que ninguna persona intervenga**
   (evidencia: ID de la sesión de Stripe + timestamp de entrega de Resend, anotados por
   el propietario en `DECISIONES.md`).
2. `node scripts/verificar-informe.mjs` sale en verde: para ≥20 casos de prueba, **cada
   cifra del PDF coincide con la que devuelve `src/lib/pension-calculo.ts`** y no existe
   ninguna cifra normativa escrita a mano en la plantilla.
3. Una compra completa **en modo test de Stripe** ejecutada por un agente, con la salida
   pegada en `DECISIONES.md`: formulario → precheck → Checkout → webhook → PDF → email,
   con **JavaScript desactivado en todo el tramo alojado en el dominio propio**.
4. `node scripts/auditar-money-set.mjs` reporta `/simulador` con **≥1.200 palabras únicas
   en `<main>`** (hoy 71) y 0 pares canibalizados.

Hoy el marcador es 0 de 4.

*Métrica secundaria, no criterio de éxito:* nº de compras y nº de prechecks rechazados a
30 días. Sirve para calibrar el precio en el ciclo siguiente, no para juzgar este.

---

## EL PRODUCTO — decisión tomada

Esto responde a los seis puntos que E-1 dejó abiertos. No es un análisis de alternativas.

### Nombre, precio y qué se compra exactamente

**Informe de Fecha Óptima de Jubilación — 49,00 € IVA incluido, pago único.**
(40,50 € de base imponible + 8,50 € de IVA al 21 %.)

**Por qué 49 € y no 29, no 79.**

- *Contra lo que se juega el comprador*: los tres acantilados documentados en E-1 valen
  entre 10.080 € y 12.600 € sobre 20 años de cobro. 49 € es el **0,39 %** de la peor de
  esas cifras. El copy de la página de venta debe apoyarse en esa ratio, calculada sobre
  el caso real del usuario, nunca sobre una promesa de ahorro.
- *Contra el sustituto humano*: una consulta con gestoría o asesoría laboral en España
  ronda las decenas de euros y **no incluye la tabla mes a mes** ni el punto de
  equilibrio. Nos posicionamos por debajo del asesor y muy por encima del ebook.
- *Contra el umbral de decisión*: por debajo de 50 € un español compra sin consultarlo
  con nadie. Por encima, entra en modo comparación y pide credenciales.
- **Y aquí está el techo real, que es el argumento decisivo contra 79-99 €:** por E-2,
  las credenciales del revisor están congeladas y no hay una sola referencia externa
  verificable, ni testimonios (0 clientes), ni marca. **Un precio alto exige señales de
  confianza que hoy tenemos prohibido fabricar.** 49 € es el máximo que sostiene un
  desconocido con un argumento técnico y sin prueba social. El precio se revisa cuando
  haya 30 ventas o cuando exista un revisor con referencias públicas, lo que llegue antes.
- 29 € queda descartado por lo que ya dijo el propietario y por un motivo adicional: a
  29 €, la comisión fija de la pasarela pesa el doble en porcentaje y el precio comunica
  "esto es un PDF genérico", que es exactamente lo que no es.

**Economía por venta:** PVP 49,00 € − IVA 8,50 € − comisión de Stripe (1,5 % + 0,25 € en
tarjeta EEA ≈ 0,99 €) = **≈ 39,51 € netos**. Coste de entrega: una invocación de función
serverless, un email y una escritura en Redis. **Cero minutos de persona por venta**,
que es la restricción dura de E-1. El coste marginal no es cero absoluto (0,99 € de
pasarela), pero no es tiempo de nadie y no crece con el volumen.

### Qué incluye

El PDF entregable, con la estructura que ya fijó E-1 (edad ordinaria y fecha exacta;
tabla mes a mes de 24 o 48 filas con pensión, pérdida mensual y pérdida acumulada a 20
años; acantilados señalados con su valor en euros; punto de equilibrio; verificación de
requisitos; cada cifra con su fuente y el DISCLAIMER visible), más dos cosas que decido
añadir porque tienen coste marginal cero y son el motivo de recompra:

- **Reemisiones ilimitadas y gratuitas durante 12 meses** desde un enlace permanente
  firmado. Si el comprador se equivocó en la base reguladora, si cambia de trabajo o si
  cumple meses cotizados, se regenera él mismo, al instante, sin escribir a nadie.
- **Aviso por email cuando su informe deje de ser válido** por cambio normativo.

### Qué NO incluye (y se dice en la página de venta, no en la letra pequeña)

No es el cálculo oficial de la Seguridad Social. No calcula la base reguladora a partir
de tus bases de cotización: **la aportas tú**. No contempla convenios especiales,
cotizaciones en el extranjero, coeficientes por actividad penosa o peligrosa (arts. 206
y 206 bis LGSS), jubilación parcial, activa o flexible, complementos a mínimos,
complemento de brecha de género ni Clases Pasivas. No incluye revisión de tu vida
laboral por una persona, ni asesoramiento fiscal, ni de inversión, ni tramitación ante
la Seguridad Social. **Soporte solo para incidencias de cobro y entrega**, por email, en
72 h hábiles: no se interpretan casos por correo, porque eso reintroduciría a una
persona en el coste marginal y rompería E-1.

### Quién lo presta

El propietario, como titular del sitio, a través de un proceso automatizado. **[SUPUESTO]**
que el propietario opera como autónomo o sociedad con NIF y puede darse de alta en
Stripe: es requisito de la pasarela y ya era requisito del art. 10 LSSI-CE, que lleva
tres ciclos bloqueado (`LEGAL.titular`, `nif` y `domicilio` siguen con marcadores en
`src/consts.ts`). **Sin esos tres campos no hay venta legal ni cuenta de Stripe: es la
única dependencia de este ciclo que ningún agente puede resolver.** El helper
`src/lib/legal.ts` (legal-001) ya hace que el bloque de identificación aparezca solo en
cuanto se rellenen.

### Pasarela: Stripe Checkout hospedado

**Decisión: Stripe, modo `payment`, página de Checkout hospedada, con tarjeta y Bizum.**

- **Bizum es el argumento que decide.** Stripe añadió soporte de Bizum en 2026 y, para
  un público español de 50 a 65 años que desconfía de meter la tarjeta en un sitio que
  no conoce, pagar desde la app de su banco elimina la mayor fricción del embudo.
- Comisión 1,5 % + 0,25 € en tarjeta EEA, la más baja de las opciones realistas.
- Página hospedada: **ni un solo dato de tarjeta pasa por nuestro dominio**, el alcance
  PCI se reduce al mínimo y no hay superficie de ataque propia.
- Webhook firmado: es lo que hace posible la entrega automática y auditable.
- Con `invoice_creation` y Stripe Tax en ES, la **factura con IVA se emite y se envía
  sola**. Todos los compradores son consumidores españoles (el sitio es solo España), así
  que no hay complejidad de OSS ni necesidad de un *merchant of record* tipo Paddle o
  Lemon Squeezy, que costaría ~5 % + 0,50 € por venta para resolver un problema que aquí
  no existe. **Descartados por eso, no por desconocimiento.**
- **[SUPUESTO]** normativo a confirmar por el asesor del propietario, no por un agente:
  la obligación Veri*factu para personas físicas aparece prorrogada en fuentes
  secundarias hasta el 1-7-2027. No condiciona el lanzamiento, pero condiciona qué
  emisor de facturas se usa a partir de esa fecha.

### Captura de datos: seis campos, ni uno más

Página nueva `/informe`, HTML estático, `<form method="post" action="/api/informe-crear">`
al estilo del que legal-001 ya dejó funcionando. **Funciona con JavaScript desactivado
de principio a fin dentro de nuestro dominio.**

1. **Fecha de nacimiento** (día/mes/año). Sustituye a la "edad" del simulador: sin ella
   no hay fechas exactas, y la fecha exacta es el producto.
2. **Periodo cotizado a día de hoy, en años y meses**, más la fecha del informe de vida
   laboral del que sale. Los meses no son un capricho: 38 años y 2 meses frente a 38 y 3
   mueven la edad ordinaria 22 meses (E-1).
3. **Base reguladora mensual estimada**, con enlace de ayuda al artículo del sitio que la
   explica y el recordatorio de que si se equivoca **regenera gratis**.
4. **Modalidad accesible**: voluntaria o por causa no imputable (ERE, despido objetivo,
   etc.). Cambia el techo de anticipación de 24 a 48 meses y la tabla aplicable.
5. **¿Vas a seguir cotizando hasta jubilarte?** Sí / No. Es lo que decide si el periodo
   cotizado se proyecta.
6. **Email**, para la entrega.

Más dos casillas, **separadas entre sí y ninguna preseleccionada**: la de tratamiento de
datos (RGPD, obligatoria, finalidad única "emitir tu informe") y la de avisos normativos
(voluntaria, no condiciona la entrega). Nombre y dirección **no se piden aquí**: los pide
Stripe para la factura, donde el usuario ya espera darlos.

### El precheck gratuito: lo que más va a proteger la marca

`/api/informe-crear` ejecuta `pension-calculo.ts` **antes de cobrar**. Si el caso no
puede acceder a ninguna modalidad anticipada —no llega a 35 o 33 años cotizados, no
supera la carencia del art. 205.1.b), o la pensión resultante no superaría la mínima
exigida por el art. 208.1.c)— **no se le vende nada**. Se le muestra gratis, en una
página propia, qué le falta exactamente y en qué fecha lo cumpliría.

Esto no es generosidad: es que **cobrar 49 € por un informe que dice "no puedes" genera
la devolución, la reseña negativa y el correo que nos obliga a contestar a mano**, que es
lo único que puede matar el coste marginal cero. Y esa página de rechazo es, además, el
mejor imán de captación del sitio para los avisos normativos.

### Entrega automática: cómo y en cuánto tiempo

1. Formulario → `POST /api/informe-crear` → validación + precheck → el caso se guarda en
   Upstash Redis (`@upstash/redis` ya es dependencia) con un identificador → se crea la
   sesión de Stripe Checkout con ese identificador en `client_reference_id` → **303** a
   Stripe.
2. Stripe cobra y dispara `checkout.session.completed` → `POST /api/informe-webhook`
   verifica la firma, es **idempotente** (marca la sesión en Redis con un `SETNX`
   antes de generar), recalcula el caso **desde el motor, no desde nada cacheado**,
   genera el PDF y lo envía por email con Resend.
3. El comprador aterriza en `/informe/gracias?id=…`, donde **descarga el PDF ahí mismo**.
   No dependemos de que el email llegue: el email es la copia, no el canal.
4. Reemisión: `GET /api/informe/<id>?t=<token>` con token HMAC firmado, válido 12 meses.
   Regenera contra el motor **vigente ese día**, así que una corrección normativa se
   propaga sola a todos los informes ya vendidos.

**Compromiso público:** descarga disponible en menos de 60 segundos y copia por email en
menos de 5 minutos. **Si no se entrega en 24 horas, devolución íntegra automática.**

**Generación del PDF: `@react-pdf/renderer` dentro de una función serverless
`api/*.ts`.** Motivos: React ya es dependencia del proyecto; produce un documento
paginado de verdad (portada, índice, numeración, fecha de emisión) sin arrastrar un
Chromium headless de ~50 MB a una función serverless; y la maquetación queda en el
repositorio, versionada y revisable. La función se escribe en **TypeScript** para poder
importar `src/lib/pension-calculo.ts` directamente: **está prohibido duplicar el motor en
`api/`**. *Contingencia declarada de antemano:* si el bundle no cabe en el límite de la
función o el build se rompe, se cae a un informe HTML con hoja de estilos de impresión
paginada, y se registra como incidencia en `DECISIONES.md`. No se contrata ningún
servicio externo de HTML→PDF: añadiría coste por venta y una dependencia opaca.

### Recompra: por qué vuelve a pagar, sin un solo patrón oscuro

**Un informe caduca, y caduca por escrito.** Cada PDF lleva en portada su ejercicio
normativo (`ANIO_NORMATIVA`) y la frase de cuándo deja de ser válido.

- **Los 12 meses de reemisión gratuita** cubren los cambios del usuario. Es lo que hace
  que el producto se sienta un servicio y no un archivo.
- **Renovación a 19,00 € IVA incluido** (15,70 € + 3,30 €), a partir del mes 13. Los dos
  disparadores son reales, no inventados: cada enero se revalorizan las pensiones y
  cambian el tope máximo y las mínimas (este año, RD 241/2026), y **el 1-1-2027 cambia el
  calendario de la DT 7.ª LGSS** (65 años con 38 años y 6 meses cotizados; 67 con menos,
  frente a 38 años y 3 meses / 66 años y 10 meses en 2026). Para una parte de los
  compradores, eso **mueve literalmente la respuesta del informe**.
- **Sin renovación automática. Sin cargo recurrente. Sin cuenta atrás.** El aviso es un
  email que dice qué ha cambiado y ofrece un enlace de recompra. Cobrar por defecto a un
  público de 50 a 65 años sería el patrón oscuro más rentable a corto plazo y el más
  caro a medio, y está prohibido por las restricciones permanentes.
- Base legal del aviso: art. 21.2 LSSI-CE (comunicaciones sobre productos similares a los
  ya contratados con el mismo prestador), con baja en un clic en cada envío.

### Los 2 leads existentes

Se les escribe **a mano, una vez**, en cuanto el circuito esté en verde: se les emite su
informe **gratis** como primeros casos y se les pide una sola cosa —qué parte del
documento no se entiende—. **No se les pide un testimonio publicable**: con dos clientes
sería prueba social irrelevante y roza lo que las restricciones prohíben. Es la única
intervención humana autorizada en todo el ciclo y no forma parte del producto.

### La vía hacia entidades financieras: aplazada, con condición de reapertura

E-1 la dimensiona como ingreso secundario y nunca condicionando la entrega. La aplazo
entera a un ciclo posterior, y la condición de reapertura es explícita: **≥25 informes
vendidos y un destinatario concreto nombrado, previa verificación por un profesional de
si intermediar constituye actividad regulada.** Montarla antes de la primera venta sería
poner en riesgo el único foso del producto para monetizar una base de datos de dos
personas.

---

## Líneas de trabajo (máximo 3, priorizadas)

### 1. El generador del informe, con su verificador — área principal: **ux**

Va primero porque sin entregable no hay nada que cobrar, y porque **la maquetación es
parte de lo que se paga** (E-1). Módulo de plantilla + función `api/informe-render.ts` que
recibe un caso y devuelve el PDF, alimentado **solo** por `src/lib/pension-calculo.ts`.

Se replica el patrón que ya funcionó dos veces (`seo-010`, `seo-012`): **el verificador se
entrega junto al generador, no después**. `scripts/verificar-informe.mjs` extrae el texto
del PDF de ≥20 casos de prueba —incluidos los tres acantilados documentados en E-1— y
compara cada cifra con la que devuelve el motor.

*Falsable:* `node scripts/verificar-informe.mjs` sale en 0 con ≥20 casos; sale en 1 si se
altera una sola cifra de la plantilla (verificación por mutación, como en
`verificar-motor.mjs`); `grep` de literales numéricos normativos en la plantilla devuelve
0; el PDF de un caso voluntario tiene 24 filas de tabla y el de uno involuntario 48; el
documento tiene portada, índice, numeración y fecha de emisión; cuerpo de texto ≥11 pt,
contraste AA y legible al convertirlo a escala de grises; `npm run build` en verde.

### 2. El circuito de venta: captura, precheck, cobro y entrega — área principal: **cro**

`/informe` (página de venta + formulario de 6 campos), `api/informe-crear.ts`,
`api/informe-webhook.ts`, `api/informe.ts` (reemisión firmada), `/informe/gracias`,
`/informe/no-aplica`, y las condiciones de venta. Variables nuevas en Vercel:
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_INFORME`,
`INFORME_TOKEN_SECRET`. Se retira `GUIA_PRECIO` de `src/consts.ts` y se borra
`src/pages/_guia-jubilacion-anticipada.astro`: la guía está descartada y el código muerto
confunde a los agentes.

*Falsable:* con **JavaScript desactivado**, un envío nativo del formulario de `/informe`
llega a la página de Checkout de Stripe; en modo test, una compra completa produce el PDF
en el email y en `/informe/gracias`, con la traza pegada en `DECISIONES.md`; reenviar dos
veces el mismo evento de webhook genera **un solo** email (idempotencia demostrada); un
caso con 30 años cotizados y modalidad voluntaria **no llega nunca a Stripe** y termina en
`/informe/no-aplica`; el enlace de reemisión funciona con el token válido y devuelve 403
con uno manipulado; ninguna respuesta de ningún endpoint expone el email ni el caso de
otro usuario.

### 3. `/simulador`: de 71 palabras a documento y a puerta de entrada del informe — área principal: **seo**

Sigue viva del ciclo anterior y ahora tiene doble motivo: es la URL más enlazada del
sitio (69/69 páginas), está en **posición 48 con 3 clics**, y es el sitio natural donde
alguien que acaba de ver su número estimado decide que quiere el exacto. Las tareas
`seo-019`, `seo-020`, `seo-022`, `ux-003` y `ux-004` del backlog **siguen siendo válidas y
se reordenan dentro de esta línea**; ya no están bloqueadas (E-4) y no hay que
reinventarlas. Se añade lo único que les faltaba: **el CTA al informe al final del
resultado**, ocupando el hueco del bloque de captura de email hoy muerto bajo
`{false && …}` en `Simulador.jsx`.

*Falsable:* `node scripts/auditar-money-set.mjs` reporta `/simulador` con ≥1.200 palabras
únicas en `<main>` y 0 pares canibalizados; las tablas de los arts. 207.2 y 208.2 se
renderizan en build desde `pension-calculo.ts` con comparación programática celda a
celda; eliminando la isla React del HTML, la página sigue conteniendo tablas legibles y
el enlace a `/informe`; `webApplicationSchema({ requiresJs: false })` pasa a ser cierto y
se cambia; hay enlace dofollow a `boe.es`/`seg-social.es` junto a cada tabla y enlace
visible al simulador oficial de la Seguridad Social; el DISCLAIMER sigue visible.

---

## Fuera de alcance este ciclo

- **La guía de 29 €.** Descartada por el propietario. Se borra su página y su constante;
  no se "reaprovecha" como bonus, ni como lead magnet, ni como upsell.
- **Asesoramiento humano de pago y cualquier producto con coste marginal en horas.**
  `/asesoramiento` se queda exactamente como está: no se toca su copy, ni su formulario,
  ni `socialProofCount`.
- **La captación consentida hacia entidades financieras.** Aplazada con la condición de
  reapertura de arriba. Ninguna tarea puede añadir una casilla de cesión de datos.
- **Suscripciones, renovación automática, planes, cupones, precios tachados, urgencia y
  descuentos de lanzamiento.** Ninguno.
- **Tests A/B de precio, copy o botones.** Con ~190 clics/mes no hay potencia estadística.
  El precio de 49 € es una decisión, no una hipótesis a testar este ciclo.
- **`sameAs`, credenciales y perfiles del revisor** (E-2, congelado por el propietario).
- **Arquitectura de silos, migas y entidad del revisor.** Cerrada desde el 2026-08-15.
- **Contenido nuevo del blog, `scripts/calendario.json` y `.github/**`.** Intocables.
- **Notificaciones push, `VAPID_PUBLIC_KEY`, rediseños y link building externo.**
- **Ampliar el motor a nuevos regímenes o supuestos** (parcial, activa, Clases Pasivas,
  coeficientes por actividad penosa). El informe declara que no los cubre. Ampliar el
  alcance normativo antes de la primera venta es la forma más fácil de no vender nunca.

### Deuda con fecha límite

- **`author` de los artículos sigue siendo un `Organization` suelto** que no referencia el
  `@id` `#organization`. Dos entidades para el mismo editor. Si no está cerrado el
  2026-10-31, entra como línea del ciclo siguiente.

---

## Restricciones

### Permanentes (ningún agente puede eliminarlas ni relajarlas)
- Nicho YMYL: ninguna afirmación normativa sin fuente oficial (`seg-social.es`, `boe.es`).
- Señales EEAT intocables: autoría, credenciales del revisor, fechas de revisión.
- **Prohibido fabricar señales de confianza**: ni credenciales, ni testimonios, ni
  contadores. `ASESORAMIENTO.socialProofCount` refleja un dato real (hoy 0) o se oculta.
  **Esto aplica igual a la página de venta del informe:** cero "X personas ya lo han
  comprado" mientras no sea cierto y comprobable.
- Accesibilidad mínima WCAG AA — público objetivo de 50 a 65 años. **Aplica también al
  PDF**: cuerpo ≥11 pt, contraste AA, legible impreso en blanco y negro.
- **El sitio debe funcionar sin JavaScript.** *Excepción única y acotada, declarada aquí:*
  la página de pago **hospedada por Stripe** no es nuestro dominio y requiere JavaScript;
  `/informe` debe advertirlo antes de redirigir. Todo el tramo alojado en
  `tujubilacionanticipada.com` funciona sin JS, incluido el formulario.
- Cero JavaScript nuevo en páginas de blog y en páginas nuevas.
- Prohibidos los patrones oscuros en cualquier elemento de conversión.
- `npm run build` (incluye `astro check`) debe pasar. Nada se publica con el build roto.
- No tocar `src/content/blog/**`, `scripts/calendario.json` ni `.github/**`.
- No romper `rehypeExternalLinks`: `DOFOLLOW_HOSTS` sigue dofollow, el resto `nofollow`.
- Ninguna tarea puede declarar como métrica de éxito un dato de GSC o GA4 que el entorno
  no pueda leer. La sección "Métrica y plazo" de `DECISIONES.md` debe contener el comando
  que la produce.
- Toda tarea que modifique una URL del conjunto money pega en `DECISIONES.md` la salida
  del auditor **antes y después**.
- La canibalización se resuelve con `canonical`, nunca con `noindex`.
- **Si un agente detecta que el sitio publica un dato normativo incorrecto, para y lo
  reporta.** No se corrige normativa por iniciativa propia. Esta regla ya evitó dos veces
  publicar coeficientes derogados; vale más que cualquier tarea que haya bloqueado.
- Toda cifra normativa nueva entra por el camino de E-1: extracto oficial en
  `scripts/fuentes/`, constante en el motor y comprobación en `verificar-motor.mjs`.

### Añadidas en este ciclo (permanentes a partir de hoy)
- **Ninguna cifra del informe puede existir fuera de `src/lib/pension-calculo.ts`.** La
  plantilla del PDF maqueta; no calcula, no redondea a mano, no reescribe. Si el motor
  cambia, el informe cambia solo.
- **Ni un dato de tarjeta puede tocar nuestro dominio.** Checkout hospedado, siempre. No
  se implementa un formulario de pago propio bajo ninguna circunstancia.
- **Prohibido cobrar un informe que el motor no puede emitir.** El precheck corre antes
  de crear la sesión de pago, no después.
- **Los datos del caso se guardan 12 meses y se borran solos** (TTL en Redis). Finalidad
  única: emitir y reemitir el informe. **Nunca se ceden a terceros, ni agregados, ni
  anonimizados "para estadística".** Las casillas de consentimiento van separadas y
  desmarcadas.
- **El webhook de cobro es idempotente y verifica la firma.** Un evento repetido no puede
  generar un segundo email ni un segundo cargo.
- **Antes de cualquier entrega, `verificar-motor.mjs` y `verificar-informe.mjs` deben
  estar en verde en CI.** Si el motor se desvía de la ley, no se despliega y no se vende.
- **Consentimiento expreso de entrega inmediata**, en casilla propia y separada del RGPD,
  reconociendo la pérdida del derecho de desistimiento por tratarse de contenido digital
  ya ejecutado (art. 103.m TRLGDCU). Sin esa casilla marcada, no se crea la sesión de pago.
  **El propietario debe hacer revisar las condiciones de venta por un profesional una
  vez**, junto con la metodología, como ya prevé E-1.
- **Criterios de éxito con pasarela:** una prueba en **modo test de Stripe** con su traza
  pegada en `DECISIONES.md` cuenta como verificable por un agente. El modo live es una
  acción del propietario, con fecha, y se anota igual. Ninguna tarea puede declararse
  hecha "porque el código parece correcto".

---

## Qué datos me faltaron para decidir mejor

1. **Si el propietario está dado de alta y con qué NIF.** Es la única dependencia dura de
   este ciclo: sin ella no hay cuenta de Stripe, no hay factura y sigue incumpliéndose el
   art. 10 LSSI-CE. Lo pido por cuarta vez, ahora con un coste concreto asociado: cada
   semana sin esos tres campos de `src/consts.ts` es una semana sin poder vender.
2. **Cuánta gente completa hoy el simulador.** No sé si el formulario se usa 300 veces al
   mes o cero. De ese número depende por completo si 49 € × conversión da 4 ventas/mes o
   40, y es lo que más habría afinado el precio. **Petición concreta:** marcar en GA4 un
   evento de conversión en el submit del simulador y otro en el CTA a `/informe`, y
   volcar el dato en `scripts/datos/`.
3. **Qué preguntaron los 2 leads.** Es el único material real que existe sobre qué duda
   tiene el usuario cuando ya está decidido a pedir ayuda. Habría escrito la página de
   venta con sus palabras en vez de con las mías.
4. **Un export de Search Console posterior al 24-ago.** Las 28 correcciones normativas de
   `contenido-001` son la intervención de mayor alcance del proyecto y no tengo forma de
   saber si movieron algo. Sin export nuevo, ese trabajo queda sin veredicto.
5. **Qué precio tienen los competidores directos** (informes personalizados de pensión de
   gestorías y comparadores). Con acceso a Ahrefs/SERP habría podido anclar 49 € contra
   precios reales en vez de contra el coste del sustituto humano.
6. **El sitio en producción.** El proxy de este entorno sigue devolviendo 403 a CONNECT
   sobre `tujubilacionanticipada.com:443`. No puedo verificar despliegue, LCP ni el
   comportamiento real de ningún formulario. **Esto pasa a ser crítico:** un circuito de
   pago que ningún agente puede probar contra producción es un circuito que solo el
   propietario puede dar por bueno.
