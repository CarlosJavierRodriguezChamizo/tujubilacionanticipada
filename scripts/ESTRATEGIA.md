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

# Estrategia vigente — 2026-08-25

> **Replanificación forzada** por encargo del propietario (`BACKLOG.json` →
> `config.replanificacion_forzada`, fecha 2026-08-24, foco `producto`). El **QUÉ**
> está cerrado por el propietario en E-1 y no se reabre. Este documento resuelve el
> **CÓMO**: precio, pasarela, entrega automática, captura de datos y recompra. Donde
> falta un dato que solo puede dar el propietario, hay un **supuesto explícito**
> marcado como tal y una decisión tomada encima. No hay ningún "habría que valorar".

## Estado de los encargos

| Encargo | Estado |
|---|---|
| E-1 puntos 1-4 y 6 (precio, pasarela, entrega, captura, recompra, vía bancaria) | **Resueltos en este documento**, sección "Ficha de producto" |
| E-1 punto 5 (los 2 leads recibidos) | **Resuelto**: acción del propietario, ver Ficha § 8 |
| E-2 (credenciales congeladas) | **Respetado**: ninguna línea de este ciclo las toca ni depende de ellas |
| E-3 (ya hay datos) | **Consumido**: todo el diagnóstico siguiente sale de `scripts/datos/` |
| E-4 (Línea 3 desbloqueada) | **Consumido**: `seo-019/020/022`, `ux-003`, `ux-004` entran en la Línea 3 |

---

## Diagnóstico del ciclo anterior

Primera revisión de este proyecto con datos reales. **He leído el export de Search
Console (1 jul – 24 ago 2026, 55 días) y he ejecutado `node scripts/verificar-motor.mjs`
hoy.** No he podido ejecutar `npm run build` ni `scripts/auditar-money-set.mjs`: el
entorno no tiene `node_modules` instalado y `astro` no está disponible (`sh: astro: not
found`). Lo digo aquí para que nadie confunda lo verificado con lo declarado.

### Lo que dicen los números, sin adornos

- **357 clics y 24.650 impresiones en 55 días** = ~195 clics/mes, CTR 1,45 %,
  posición media ~11. El sitio existe y entra tráfico.
- **Tres URLs son el 46 % del negocio**: `coeficientes-reductores-jubilacion-anticipada`
  (73 clics, pos 9,4), `jubilacion-anticipada-transportistas` (45, pos 8,1),
  `tabla-penalizacion-jubilacion-anticipada` (45, pos 9,5). Las tres son **tablas de
  coeficientes**: gente intentando calcular su número a mano.
- **El patrón de caso personal está confirmado con datos**: 145 consultas del tipo
  "tengo X años y Y cotizados" suman 1.070 impresiones y 24 clics en **posición
  ponderada 8,4**. El cluster de cálculo genérico ("cómo se calcula la pensión",
  "calculo jubilación anticipada", "simulador jubilación anticipada") suma 309
  impresiones, **3 clics y posiciones entre 35 y 80**. Dos mundos distintos.
- **`/simulador`: 276 impresiones, 3 clics, posición 48,1.** Es la URL más enlazada
  del sitio y sigue teniendo 71 palabras. Sigue sin funcionar sin JavaScript.
- **La arquitectura de silos del ciclo anterior, terminada y verificada, ha producido
  44 impresiones y 0 clics en 55 días** (`/blog/categoria/*`). No fue un error hacerla;
  sí lo sería seguir iterándola. Confirma el diagnóstico del ciclo pasado: rendimiento
  decreciente, cerrada.
- **`/guia-jubilacion-anticipada` tiene 11 impresiones en posición 50,6**, pese a estar
  fuera del routing desde hace ciclos. Google la conserva indexada. Es una URL
  desperdiciada que apunta a un producto que ya no existe.
- **Hay duplicación con y sin barra final** en el export (`…/como-interpretar-simulador-jubilacion`
  con 589 imp. y `…/como-interpretar-simulador-jubilacion/` con 11). No es el cuello de
  botella de este ciclo, pero queda anotado como deuda.
- **`/asesoramiento`: 1 impresión.** La única página con formulario del sitio es
  invisible. 2 leads en toda la vida del proyecto.

### Veredicto por hipótesis (desde la última replanificación, 2026-08-15)

| id | Hipótesis (resumida) | Veredicto |
|----|----------------------|-----------|
| seo-012 | Un auditor reproducible del conjunto money da la línea base objetiva | **CONFIRMADA** (artefacto). No he podido reejecutarlo hoy: depende de un build que este entorno no puede hacer. Debilidad de la herramienta, no de la hipótesis |
| seo-013 | Una regla derivada del calendario resuelve sola los pares canibalizados | **CONFIRMADA (mecanismo) / REFUTADA en el caso que importaba**: el duplicado real del 24-ago no lo resolvió la regla, lo resolvió el propietario reenfocando el artículo a mano (`contenido-001`) |
| seo-014 (reintento) | El canonical consolidado se emite en el HTML | **CONFIRMADA (artefacto)**, verificada por el ejecutor sobre `/dist`. Efecto: SIN DATOS (6 días de export) |
| seo-015 | Excluir del sitemap evita que Google trate ambas como indexables | **SIN DATOS SUFICIENTES**: `novedades-2026` sigue acumulando 36 impresiones en dos variantes de URL |
| seo-016 | Un title con verbo de acción separa la intención transaccional en `/simulador` | **REFUTADA como causa raíz.** `/simulador` sigue en posición 48 con 3 clics. El título nunca fue el problema: el problema es que la página tiene 71 palabras. Cambiar el rótulo de una puerta no construye la habitación |
| seo-017 | Alinear `mainEntityOfPage` elimina la contradicción interna | **CONFIRMADA (artefacto)** |
| seo-018 | Extraer el motor permite generar tablas en build | **CONFIRMADA**, y su valor real fue otro: **destapó que el sitio publicaba normativa derogada** |
| seo-019 / seo-020 | (no evaluadas) | **PARADA CORRECTA.** Dos agentes se negaron a publicar cifras que no podían verificar en un sitio YMYL. Es el mejor resultado del ciclo y la razón de que hoy exista un producto vendible |
| seo-021 | FAQ visible + `requiresJs=false` | **CONFIRMADA la mitad honesta** (FAQ visible), **rechazada correctamente** la otra: declarar `requiresJs:false` con la página aún dependiente de React habría sido mentir en el schema |
| normativa-001 | Con el motor alineado, se pueden publicar cifras sin riesgo | **CONFIRMADA, y verificada por mí hoy**: `node scripts/verificar-motor.mjs` → **326 comprobaciones, todas correctas**, contra los extractos del BOE de `scripts/fuentes/`. Es el único activo defendible que tiene este proyecto |
| contenido-001 | Alternar caso concreto con corrección sistemática sube el CTR sin abrir URLs competidoras | **CONFIRMADA (artefacto): `auditar-normativa.mjs` en 0 incidencias altas y medias. SIN DATOS (efecto)**: las correcciones son del 24-ago y el export termina el 24-ago. Su premisa sí queda confirmada con datos (caso personal pos. 8,4 vs. head pos. 35-80) |
| legal-001 | Identificación legal lista y formulario sin JS | **CONFIRMADA (artefacto) — y ahora es un bloqueante de negocio**: `LEGAL.titular`, `nif` y `domicilio` siguen vacíos. Con el mecanismo ya construido, **cobrar sin rellenarlos es ilegal** (art. 10 LSSI-CE y arts. 97 y 60 RDL 1/2007). Ha dejado de ser deuda técnica para ser la llave del ciclo |

**Balance:** el ciclo produjo 11 artefactos correctos, 1 refutación útil (`seo-016`), 2
paradas que salvaron el proyecto de publicar normativa falsa a escala, y **0 euros**.
Lo relevante no es lo que se hizo: es que ahora hay algo que vender y un motor
verificado contra el BOE que lo respalda.

## Cuello de botella prioritario

**Conversión.**

Entran ~195 personas al mes buscando **su número exacto** —lo demuestran las 145
consultas de caso personal en posición 8,4— y el sitio **no tiene absolutamente nada que
puedan comprar ni forma de pagarlo**. No hay pasarela, no hay entregable, no hay página
de venta. El resultado acumulado son 2 leads.

Descarto los otros tres con los datos delante, no por intuición:

- *Visibilidad*: 24.650 impresiones y posición media 11 en 55 días. El tráfico entra.
- *Relevancia*: las páginas que reciben el tráfico están en posiciones 8-9 con CTR
  normal para el nicho; las consultas que las traen son exactamente el tema del sitio.
  No hay desajuste de intención.
- *Autoridad*: es un problema real y localizado (`/simulador` en posición 48, cluster de
  cálculo en 35-80), pero es **el problema del ciclo que viene**. Ganar 20 posiciones en
  el cluster de cálculo sin nada que vender multiplica por más tráfico un ingreso de
  cero. El orden correcto es: primero la caja registradora, después la cola de clientes.
  Por eso la parte de autoridad que sí entra este ciclo (Línea 3) entra **solo** en su
  papel de puerta de entrada al producto.

Y una razón adicional que zanja la discusión: hasta hoy yo mismo descartaba Conversión
ciclo tras ciclo argumentando que "optimizar la conversión de una oferta que no existe es
teatro". El propietario ha hecho que la oferta exista. El argumento ya no aplica.

## Objetivo del ciclo

**El 2026-09-30, una persona que no conoce a nadie del proyecto puede comprar el informe
y recibirlo sin que intervenga ningún ser humano.**

Se da por cumplido si, y solo si, las cinco condiciones son ciertas:

1. Existe `/informe`, se navega y se envía **con JavaScript desactivado** (formulario
   `method="post"` + respuesta 303), y su envío crea una sesión de pago real.
2. `node scripts/verificar-flujo-informe.mjs` recorre el camino completo en **modo
   simulación** (sin claves de Stripe) y produce un **PDF de ≥ 4 páginas** cuyas cifras
   coinciden **celda a celda** con `calcularEscenario()` de `src/lib/pension-calculo.ts`.
   Sale con código 1 si alguna cifra del PDF no procede del motor.
3. `node scripts/verificar-motor.mjs` sigue en 326/326 y corre antes del build.
4. El propietario ejecuta **una compra en modo test y una compra real de 49 €** y en
   ambas recibe el PDF en su correo en **menos de 5 minutos**, sin tocar nada.
5. `LEGAL.titular`, `nif` y `domicilio` están rellenos en `src/consts.ts` y existen las
   páginas de **Condiciones de contratación** y de **desistimiento**. Sin esto no se
   activa el cobro: es la única condición que puede bloquear el objetivo entero.

*Métrica de embudo (línea base, no criterio de éxito):* contadores en Redis
`metricas:informe:{formulario_enviado, checkout_creado, pagado, descargado, regenerado}`.
Se leen el 2026-09-30 y sirven de "antes" para el ciclo siguiente. **Este ciclo no se
juzga por ventas**: con ~90 clics/mes en las páginas de tabla, un CTA al 10 % y una
conversión del 3 % da 0,3 ventas/mes. Fijar un objetivo de facturación aquí sería
fijar un objetivo de azar.

---

## Ficha de producto — decisión cerrada

Esto no es un menú de opciones. Es lo que se construye. Cada decisión lleva su porqué y,
donde hace falta un dato del propietario, un **supuesto** marcado.

### 1. Qué se vende (del propietario, no se reabre)

**Informe personalizado de fecha óptima de jubilación**, en PDF paginado, generado
automáticamente desde `src/lib/pension-calculo.ts`, con coste marginal cero. Alcance del
entregable: el de E-1, punto por punto.

### 2. Precio: **49 € IVA incluido**, pago único, con 12 meses de reemisión

- **49 €, no 29 €.** 29 € es el precio de un PDF informativo y el propietario ya lo
  descartó. 49 € está por encima de la banda del infoproducto y por debajo de la banda
  del asesoramiento humano (90-250 € en una gestoría), que es exactamente donde debe
  leerse: **no es información y no es un asesor**.
- **49 €, no 99 €.** No hay credenciales verificables publicables (E-2 congelado), no
  hay reseñas, no hay marca. A 99 € el comprador exige una persona detrás y el producto
  no la tiene por diseño. Además, con este volumen, un precio que reduzca las ventas a
  la mitad no reduce ingresos: elimina el aprendizaje.
- **Justificación frente a lo que se juega el comprador:** los tres acantilados del
  propio E-1 valen 12.600 €, 10.080 € y 22 meses de cobro anticipado. 49 € es el **0,4 %**
  del más pequeño de ellos. Ese es el argumento de venta y debe estar en la página, con
  las cifras calculadas por el motor, no redactadas a mano.
- **Justificación frente a la alternativa gratuita:** el simulador oficial de la
  Seguridad Social es gratis, exige Cl@ve o certificado digital y **no da la tabla
  comparativa mes a mes de las 24/48 fechas posibles ni señala los saltos de tramo**. Se
  compite diciéndolo, y enlazándolo (restricción vigente), no ocultándolo.
- **Qué incluye el precio:** el informe + **12 meses de reemisión ilimitada** desde el
  mismo enlace, con datos actualizables por el comprador, y **aviso automático por email
  cuando cambie la normativa** que afecte a su caso. Esto es lo que separa 49 € de un PDF
  muerto de 29 €, y su coste marginal sigue siendo cero.
- **Qué NO incluye, y debe decirse literalmente en la página:** no es el cálculo oficial
  de la Seguridad Social; no es asesoramiento personalizado ni fiscal; no contempla
  convenios especiales, cotizaciones en el extranjero, coeficientes por actividad penosa
  (arts. 206 y 206 bis), complementos a mínimos ni complemento de brecha de género —
  las mismas exclusiones que ya declara la cabecera del motor. Nadie compra creyendo
  que compra otra cosa.
- **Nada de precios de lanzamiento ni test A/B de precio este ciclo.** Con ~0,3 ventas
  mensuales previstas, ningún test de precio puede alcanzar significación: sería ruido
  disfrazado de método. Un precio, publicado, durante todo el ciclo.
- **Supuesto explícito (a confirmar por el propietario):** ventas a consumidores
  residentes en España, IVA 21 % incluido (49,00 € = 40,50 € + 8,50 €). Si hubiera venta
  a otros países de la UE, el umbral OSS de 10.000 €/año queda lejísimos a este volumen.

### 3. Pasarela: **Stripe Checkout** (alojado), modo `payment`

- **Por qué Stripe y no otra:** es la única que resuelve las tres cosas a la vez —
  **Bizum** (verificado: Stripe soporta Bizum en Checkout modo pago; entre el 20 % y el
  30 % de los compradores en España lo prefieren, y el público de 50-65 años lo tiene en
  el móvil), página de pago alojada (**cero PCI, cero JavaScript nuevo en nuestro sitio**)
  y comisión baja (~1,5 % + 0,25 € en tarjeta europea, ~0,74 € sobre 49 €).
- **Bizum no está disponible en Checkout en modo suscripción.** Es una razón técnica
  más, además de la comercial, para que la renovación sea un pago único anual y no una
  suscripción con cargo automático (ver § 6).
- **Métodos activos:** tarjeta + Bizum. `locale: 'es'`. Precio fijo en un `price` de
  Stripe (4900 céntimos), nunca un importe calculado en cliente.
- **Facturación/IVA:** activar **Stripe Tax** (0,5 % por transacción) y los recibos
  automáticos. Es más barato que cualquier hora de gestoría dedicada a esto.
- **Contingencia, no plan B por defecto:** si Stripe rechaza la cuenta por clasificar el
  negocio como asesoramiento financiero, se pasa a un *merchant of record* tipo Lemon
  Squeezy (comisión ~5 %, pero asume IVA y facturas). **Mitigación previa: el propietario
  debe describir la actividad como "informes automatizados de cálculo divulgativo", que
  es lo que es, no como asesoramiento.** Ese matiz vale la cuenta.

### 4. Entrega automática: seis piezas, ninguna con una persona dentro

Toda la infraestructura ya existe en el repo (funciones serverless en `/api`, Upstash
Redis en `api/_redis.js`, Resend en `api/contact.js`). No hay que inventar plataforma.

1. `POST /api/informe-checkout` — valida los campos, guarda `pedido:{id}` en Redis
   (TTL 400 días), crea la sesión de Stripe con `client_reference_id = id` y
   `customer_email`, y responde **303 hacia la URL de Stripe**. Funciona sin JavaScript
   porque es un `<form method="post">` nativo, igual que ya hace `api/contact.js`.
2. `POST /api/stripe-webhook` — verifica la firma con el **cuerpo crudo**
   (`bodyParser: false`; si esto se olvida, la firma nunca valida: es el fallo clásico),
   y en `checkout.session.completed` marca el pedido como pagado de forma **idempotente**
   (`SET NX` sobre `session.id`), genera un `token` aleatorio de 32 bytes y guarda
   `informe:{token} → pedidoId`.
3. **Email inmediato con Resend**: PDF adjunto + enlace permanente. Si el adjunto falla,
   el email sale igual con el enlace: **nunca se queda sin entregar por un adjunto**.
4. `GET /api/informe?token=…` — **regenera el PDF al vuelo** desde los datos del pedido y
   el motor. Consecuencia deliberada: si el motor cambia, el informe descargado cambia.
   Nunca se almacena un PDF congelado. Límite de 12 descargas/mes por token.
5. `/informe/gracias` y `/informe/cancelado` — páginas estáticas, `noindex`, con el
   enlace de descarga y qué hacer si el correo no llega.
6. `GET /informe/editar?token=…` + `POST /api/informe-regenerar` — el comprador corrige
   sus datos y recibe un informe nuevo sin pagar, durante 12 meses. Es la máquina de la
   recompra (§ 6).

**Modo simulación, obligatorio.** Si no existe `STRIPE_SECRET_KEY`, el flujo salta el
pago y devuelve el PDF con marca de agua **"MUESTRA — SIN VALIDEZ"**. Dos motivos: los
agentes pueden construir y verificar el 90 % del sistema sin credenciales del propietario
(no se bloquea el ciclo esperando una cuenta), y el mismo camino produce el **informe de
ejemplo público** que se ofrece en la página de venta.

### 5. Captura de datos: 7 obligatorios, 3 opcionales, 2 casillas legales

Regla de diseño: **cada campo tiene que cambiar una cifra del informe**. Si no la cambia,
no se pide. Los campos de hoy (edad en años, cotizados en años, base) **no bastan**: los
saltos de tramo del propio E-1 ocurren entre meses, no entre años.

Obligatorios:

| Campo | Por qué existe |
|---|---|
| `fechaNacimiento` (día/mes/año) | Sin ella no hay **fecha** de edad ordinaria (DT 7.ª), solo una edad. El producto se llama "fecha óptima" |
| `cotizadoAnios` + `cotizadoMeses` | Los cortes están en 38a3m, 38a6m, 41a6m y 44a6m. Redondear a años destruye el producto |
| `fechaCotizado` (mes/año del informe de vida laboral) | Sin la fecha de corte no se puede proyectar la carrera hasta la jubilación |
| `sigueCotizando` (hasta jubilarme / hasta una fecha / ya no cotizo) | Hoy `calcularEscenario()` **asume** cotización continua. Para media España en paro a los 60 eso es falso |
| `baseReguladora` (€/mes) | Es el multiplicador de todo. Con ayuda a pie de campo y su limitación impresa en el informe |
| `modalidadPrevista` (voluntaria / cese no imputable / no lo sé) | Decide entre 24 y 48 meses y entre dos cuadros legales distintos. "No lo sé" → se calculan **las dos** |
| `email` | Es el canal de entrega |

Opcionales: `nombre` (portada), `conyugeACargo` (elige la mínima aplicable del art.
208.1.c) — el motor ya tiene ambas cuantías del anexo I del RD 241/2026), `fechaObjetivo`
(la fecha que el usuario tenía en mente, para destacarla en la tabla y decirle cuánto le
cuesta).

Dos casillas **separadas y desmarcadas**, ninguna premarcada: (a) tratamiento de datos
para generar el informe; (b) **solicitud de entrega inmediata y renuncia expresa al
desistimiento** (art. 103.m RDL 1/2007) — sin ella, el comprador puede pedir la
devolución después de descargar el PDF. Más el honeypot antispam que ya usa
`api/contact.js`.

**No se pide sexo ni número de hijos** este ciclo: harían falta para el complemento de
brecha de género, y esa cifra **no está en el motor verificado**. Entra por el camino de
siempre (extracto en `scripts/fuentes/` + constante + comprobación) o no entra.

**Dos huecos del motor que esto destapa y hay que cerrar antes de cobrar:**
`EscenarioInput` necesita `cotizaHasta` (proyección real de la carrera) y
`conyugeACargo` (mínima aplicable). Ambos cambian cifras del informe; ninguno introduce
una cifra nueva sin fuente.

### 6. Recompra: reemisión incluida, aviso automático, renovación de 19 €

Un informe de jubilación caduca por tres motivos distintos y cada uno tiene su respuesta:

| Qué cambia | Respuesta | Precio |
|---|---|---|
| **Cambian los datos del usuario** (le despiden, cambia su base, cotiza más) | Reemisión desde `/informe/editar?token=…` | Incluido 12 meses |
| **Cambia la normativa** (revalorización de enero; **en 2027 la edad ordinaria pasa a 65 con 38a6m / 67 con menos** y cambia la escala de la DT 9.ª) | Email automático "tu informe ha cambiado" con el PDF regenerado, a todos los tokens vivos | Incluido 12 meses |
| **Pasan los 12 meses** | Email con enlace de pago único: **Revisión anual, 19 €**, que reabre el token otros 12 meses | 19 €/año, opt-in |

**Nada de suscripción con cargo automático.** Público de 50 a 65 años, nicho YMYL,
patrones oscuros prohibidos y Bizum no disponible en modo suscripción: un cargo
recurrente que el comprador no recuerda haber autorizado es la vía más rápida a una
reclamación y a destruir la confianza que sostiene el producto. La renovación se pide,
no se cobra sola.

El disparador de recompra más fuerte no es el calendario: es **enero de 2027**, cuando
cambie la edad ordinaria. Ese día, cada informe vendido se vuelve incorrecto a la vez y
el sistema envía un email correcto a todos. Eso solo funciona si los pedidos se guardan
con TTL de 400 días desde el primer día. **Por eso se guardan desde el primer día.**

### 7. La vía bancaria (E-1, punto 6): dimensionada en cero este ciclo

El propietario pidió dimensionarla como ingreso secundario. La dimensiono: **cero euros
y cero tareas este ciclo**, y no por prudencia genérica, sino por tres condiciones de
entrada que hoy no se cumplen:

1. El consentimiento debe **nombrar al destinatario concreto**, y no hay ninguna entidad
   con la que exista acuerdo. Un consentimiento genérico "a entidades financieras" es
   nulo.
2. Presentar clientes a entidades financieras a cambio de remuneración **puede ser
   actividad regulada**: hay que verificarlo con un profesional **antes** de escribir una
   sola línea de esa casilla.
3. A 0,3 ventas/mes no hay volumen que ofrecer a nadie. Negociar desde ahí es regalar el
   activo.

**Cuándo se reabre:** cuando existan (a) 50 informes vendidos y (b) un acuerdo firmado
con una entidad nombrable y (c) la verificación jurídica del punto 2. Antes no.

### 8. Los 2 leads existentes (E-1, punto 5)

**Acción del propietario, no de un agente** (no cabe en `ux|seo|cro`): escribirles
personalmente en cuanto el informe funcione en modo test y regalarles el informe
completo a cambio de que digan si lo entienden y si les parece que vale 49 €. Son los dos
únicos usuarios reales que existen; sirven de prueba de usabilidad y de prueba de precio
por el coste de dos correos. No se les añade a ninguna lista.

---

## Líneas de trabajo (máximo 3, priorizadas)

### 1. La máquina de cobrar y entregar, de extremo a extremo — área principal: **cro**

Es la línea que decide si este ciclo sirve para algo. Comprende `/informe` (página de
venta + formulario sin JavaScript), los cuatro endpoints de § 4, el almacenamiento en
Redis, el email con Resend, el modo simulación y las páginas de gracias/cancelado/editar.
Además: **`/guia-jubilacion-anticipada` redirige de forma permanente a `/informe`** —
tiene impresiones reales y hoy no lleva a ninguna parte.

*Falsable:* con `STRIPE_SECRET_KEY` ausente, `node scripts/verificar-flujo-informe.mjs`
completa el camino formulario → pedido → token → PDF y devuelve código 0; con un campo
obligatorio ausente o un email inválido devuelve error y **no** crea pedido; el HTML de
`dist/informe/index.html` contiene un `<form method="post" action="/api/informe-checkout">`
sin depender de ningún `<script>`; el webhook rechaza una firma inválida y es idempotente
ante el mismo `session.id` repetido; ninguna página nueva añade JavaScript de cliente.
`npm run build` en verde.

### 2. El informe: el PDF que justifica los 49 € — área principal: **ux**

Lo que se paga se ve. Un PDF feo a 49 € no parece caro: parece falso.

Contenido exigido: portada con nombre y fecha de emisión, índice, numeración de páginas;
edad ordinaria exacta **con su fecha**; **tabla mes a mes** de las 24 fechas (voluntaria)
o 48 (involuntaria) con pensión resultante, pérdida mensual y pérdida acumulada a 20
años; **acantilados destacados** con su valor en euros; punto de equilibrio de esperar
frente a adelantar; verificación de requisitos (35/33 años, art. 208.1.c, tope de
3.359,60 €, carencia del art. 205.1.b); cada cifra normativa con su fuente al pie de su
sección; disclaimer y exclusiones visibles. Cuerpo ≥ 11 pt, contraste AA, **legible
impreso en blanco y negro** (los acantilados no se marcan solo con color).

*Falsable:* el PDF de muestra tiene ≥ 4 páginas y numeración en todas; contiene 24 o 48
filas de fecha según modalidad; **un test compara celda a celda cada cifra del PDF con la
salida de `calcularEscenario()` y falla si difiere alguna**; ninguna cifra normativa está
escrita a mano en la plantilla (comprobación por grep de literales numéricos); convertido
a escala de grises, los acantilados siguen siendo identificables. Existe
`/informe/ejemplo.pdf` público, generado por el mismo código, con datos de ejemplo y
marca de agua.

### 3. Las puertas de entrada, donde ya hay tráfico — área principal: **seo**

El producto sin embudo no vende. Y el embudo **no es `/simulador`** (3 clics/mes): son
las tres páginas de tablas y coeficientes que se llevan el 46 % de los clics.

Dos entregas, un solo objetivo:

- **CTA contextual al informe** en las URLs que el export de GSC demuestra que traen
  clics (≥ 10 clics en 55 días), renderizado **desde el layout o desde el plugin de
  bloques**, jamás editando `src/content/blog/**`. El texto no promete asesoramiento:
  ofrece el cálculo de la fecha exacta y lo que cuesta equivocarse de mes.
- **`/simulador` deja de ser un formulario vacío** (`seo-019`, `seo-020`, `seo-022`,
  `ux-003`, `ux-004`, ya desbloqueadas por E-4): tablas de los arts. 207.2 y 208.2
  generadas en build desde el motor, escenarios precalculados, fuentes oficiales
  enlazadas, enlace al simulador oficial, `<noscript>` visible, tablas accesibles AA. Y
  al final del cálculo gratuito, la pregunta que vende el informe: *"esto te dice cuánto
  cobrarías; el informe te dice qué mes te conviene y cuánto pierdes si te equivocas"*.

*Falsable:* `<main>` de `/simulador` ≥ 1.200 palabras únicas (hoy 71, medido por
`auditar-money-set.mjs`); ≥ 40 combinaciones de escenario en el HTML estático; las 24 y
48 filas de los cuadros legales presentes y **comparadas programáticamente** con
`COEF_VOLUNTARIA` / `COEF_INVOLUNTARIA`; eliminando la isla React del HTML la página
sigue siendo legible y con estimación; el CTA a `/informe` aparece en ≥ 8 URLs de
artículo sin que haya cambiado un solo byte de `src/content/blog/**` (verificable con
`git diff --stat`).

## Fuera de alcance este ciclo

- **Reabrir el QUÉ del producto.** Decidido por el propietario. Cualquier tarea que
  proponga vender otra cosa (guía, asesoramiento humano, curso) se rechaza sin discusión.
- **Test A/B de precio, precios de lanzamiento, descuentos y urgencia artificial.** Sin
  volumen, no son experimentos: son ruido. Y la urgencia falsa es un patrón oscuro.
- **Suscripción con cargo recurrente automático.**
- **La cesión o la casilla de contacto con entidades financieras.** Condiciones de
  entrada en la Ficha § 7. Cualquier tarea que la introduzca antes se rechaza.
- **Credenciales, `sameAs`, perfiles del revisor** (E-2, congelado por el propietario).
- **La arquitectura de silos, migas y entidad del revisor.** Cerrada. 44 impresiones y
  0 clics en 55 días confirman que iterarla no paga.
- **`src/content/blog/**`, `scripts/calendario.json`, `.github/**`:** intocables. El CTA
  de la Línea 3 se resuelve en layouts y en `src/lib/`, como se resolvió la
  consolidación canonical.
- **Nuevos artículos.** Los publica la routine con su propio calendario; este ciclo no
  añade contenido editorial.
- **`/asesoramiento`.** Se queda exactamente como está: 1 impresión en 55 días. No se
  promociona, no se rediseña, no se le añaden campos. Y **no se le pone precio**: eso
  reintroduciría a una persona en el coste marginal.
- **Notificaciones push, `VAPID_PUBLIC_KEY`, rediseños, link building.**
- **Complemento de brecha de género, regímenes especiales, convenios especiales y
  cotizaciones en el extranjero en el informe.** Se declaran como exclusiones. Entran
  cuando entren por `scripts/fuentes/` + `verificar-motor.mjs`, no antes.

### Deudas con fecha límite

- **Duplicación de URLs con y sin barra final** en el índice de Google (589 imp. vs 11
  imp. en el mismo artículo). Si no está resuelta el 2026-10-15, entra como línea del
  ciclo siguiente.
- **`author` de los artículos sigue siendo un `Organization` suelto** que no referencia
  el `@id` `#organization`. Se arregla en `src/lib/schema.ts` en cuanto un ciclo tenga
  hueco; no bloquea nada hoy.
- **`auditar-money-set.mjs` depende de un build que no siempre se puede ejecutar.** Si
  vuelvo a no poder medir, la herramienta no cumple su función. Debe poder correr contra
  un `/dist` ya publicado o fallar diciendo por qué.

## Restricciones

### Permanentes (ningún agente puede eliminarlas ni relajarlas)

- Nicho YMYL: ninguna afirmación normativa sin fuente oficial (`seg-social.es`, `boe.es`).
- Señales EEAT intocables: autoría, credenciales del revisor, fechas de revisión.
- **Prohibido fabricar señales de confianza**: ni credenciales, ni testimonios, ni
  contadores, ni "X personas ya lo han comprado" mientras no sea cierto.
  `ASESORAMIENTO.socialProofCount` refleja un dato real (hoy 0) o se oculta.
- Accesibilidad mínima WCAG AA — público objetivo de 50 a 65 años.
- **El sitio debe funcionar sin JavaScript**, y eso incluye ahora **todo el flujo de
  compra**.
- Cero JavaScript nuevo en páginas de blog y en páginas nuevas.
- Prohibidos los patrones oscuros en cualquier elemento de conversión.
- `npm run build` (incluye `astro check`) debe pasar. Nada se publica con el build roto.
- No tocar `src/content/blog/**`, `scripts/calendario.json` ni `.github/**`.
- No romper `rehypeExternalLinks`: `DOFOLLOW_HOSTS` sigue dofollow, el resto `nofollow`.
- Todo criterio de éxito debe ser verificable sobre el repositorio o sobre `/dist`, sin
  depender de datos de Search Console ni de GA4.
- Ninguna tarea puede declarar como métrica de éxito un dato de GSC/GA4 que el entorno no
  pueda leer. La sección "Métrica y plazo" debe contener **el comando** que la produce.
- La canibalización se resuelve con `canonical`, nunca con `noindex`, salvo autorización
  caso a caso.
- `/simulador` no puede presentar su estimación como cálculo oficial, mantiene el
  `DISCLAIMER` visible y enlaza al simulador oficial de la Seguridad Social.
- **Si un agente detecta que el sitio publica un dato normativo incorrecto, para y lo
  reporta.** No se corrige normativa por iniciativa propia. Esta restricción salvó el
  proyecto dos veces en el ciclo anterior (`seo-019`, `seo-020`).

### Añadidas en este ciclo (permanentes a partir de hoy)

- **Ninguna cifra del informe puede existir fuera del motor verificado.** Ni en la
  plantilla del PDF, ni en la página de venta, ni en el email. Si una cifra aparece dos
  veces en el repositorio, tiene que haber una comprobación automática de que coinciden.
  `verificar-motor.mjs` (326/326) corre **antes** del build y es condición de despliegue.
- **No se activa el cobro mientras `LEGAL.titular`, `nif` y `domicilio` estén vacíos**, ni
  sin Condiciones de contratación publicadas. Cobrar sin identificar al prestador es
  ilegal (art. 10 LSSI-CE; arts. 60 y 97 RDL 1/2007). Bloqueante duro, del propietario.
- **Precio siempre con IVA incluido y visible antes de iniciar el pago.** Ningún importe
  se calcula en el navegador: el precio vive en Stripe.
- **Casilla de renuncia al desistimiento separada, desmarcada y explicada.** La entrega
  del informe **no puede condicionarse a ningún consentimiento de marketing.**
- **Los datos del comprador no salen de la infraestructura del sitio** (Stripe, Upstash y
  Resend como encargados del tratamiento). No se ceden, no se venden, no se exportan.
  Retención de 400 días y borrado a petición. La política de privacidad debe describir
  esta finalidad **antes** de que se recoja el primer dato.
- **Ningún CTA de pago puede terminar en un `mailto:` ni en un formulario que dependa de
  JavaScript.**
- **Ninguna promesa de plazo que dependa de una persona.** Si el copy dice "en 5 minutos",
  el sistema tiene que cumplirlo sin nadie despierto.

---

## Qué datos me faltaron para decidir mejor

1. **No he podido ejecutar el build.** Este entorno no tiene `node_modules` (`astro: not
   found`), así que no he podido correr `auditar-money-set.mjs` ni verificar `/dist`. He
   juzgado con el export de GSC y con `verificar-motor.mjs`, que sí corre. Es la primera
   vez que el bloqueo es de dependencias y no de datos.
2. **GA4 sigue ilegible.** No sé cuánta gente empieza el simulador y lo abandona, ni
   dónde. Para un ciclo de conversión eso es exactamente el dato que más falta hace: he
   diseñado el embudo con contadores propios en Redis precisamente porque no puedo
   leer el de Google.
3. **El export de GSC agrupa 1.000 consultas y oculta el resto** (42 clics de 357
   atribuidos). El 88 % de los clics no tiene consulta asociada legible. Con el informe
   completo sabría qué preguntas exactas hace quien ya hace clic, que es el copy de la
   página de venta escrito solo.
4. **No sé si el propietario está dado de alta ni si puede emitir facturas.** He supuesto
   que sí y que la venta es a consumidores en España con IVA 21 % incluido. Si no lo
   está, el ciclo se bloquea en el punto 5 del objetivo, no en el software.
5. **No sé qué CMS de email usará para los avisos de cambio normativo.** He supuesto
   Resend, que ya está integrado, y envío directo desde la función, sin plataforma de
   marketing. A este volumen sobra.
6. **Cero visibilidad de competencia.** No sé quién vende hoy informes de pensiones en
   España ni a qué precio. Los 49 € están anclados en el valor para el comprador y en las
   bandas de percepción, no en una comparativa de mercado que no he podido hacer.

**Acción para el propietario, por orden de bloqueo:**
(1) rellenar `LEGAL.titular`, `nif` y `domicilio` — sin eso no se cobra;
(2) crear la cuenta de Stripe describiendo la actividad como informes automatizados y
dar las claves de **test** primero;
(3) confirmar el supuesto fiscal del § 2;
(4) instalar dependencias en el entorno de los agentes o dejar un `/dist` publicado
accesible, para que la próxima revisión pueda volver a medir el sitio y no solo leerlo.
