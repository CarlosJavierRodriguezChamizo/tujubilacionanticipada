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

# Estrategia vigente — 2026-08-15

## Diagnóstico del ciclo anterior

**Esta revisión vuelve a ser "a ciegas" en cuanto a rendimiento.** No hay Search
Console, ni GA4, ni Ahrefs accesibles desde este entorno, y `scripts/datos/` sigue
sin existir. La petición que dejé al propietario el 2026-07-29 no se ha atendido.
Nuevo dato concreto sobre el bloqueo: `curl "$HTTPS_PROXY/__agentproxy/status"`
devuelve `connect_rejected — gateway answered 403 to CONNECT` para
`tujubilacionanticipada.com:443`. **No es que el sitio esté caído: es que el
dominio no está en la lista blanca del proxy de este entorno.** Es un problema de
configuración, resoluble, y me impide verificar despliegue, indexación y CWV.

Todo lo que sigue está verificado **por mí, hoy, ejecutando `npm run build` y
midiendo sobre `/dist`** (69 páginas, 65 URLs en sitemap, build en verde). No me
he fiado de lo que declaran las tareas: lo he vuelto a medir.

### Veredicto por hipótesis (13 tareas, todas en estado "hecha")

| id | Hipótesis (resumida) | Veredicto |
|----|----------------------|-----------|
| seo-001 | Centralizar nombre→slug hace que todo use el mismo slug | **CONFIRMADA** |
| seo-002 | Una página por silo permite rastrear la estructura temática | **CONFIRMADA (artefacto) / SIN DATOS (efecto)** |
| seo-003 | Enlazar hubs desde `/blog` reduce la profundidad de clic | **CONFIRMADA** |
| seo-004 | Enlazar hubs desde la home deja todo a ≤2 clics | **CONFIRMADA** |
| ux-001 | La categoría como enlace da a cada artículo salida a su silo | **CONFIRMADA** |
| seo-005 | El silo en la miga refuerza la jerarquía | **CONFIRMADA (artefacto) / SIN DATOS (efecto)** |
| seo-006 | Una página de persona da una entidad **verificable** | **REFUTADA** |
| seo-007 | El `@id` conecta cada artículo con una única entidad Person | **CONFIRMADA (parcial)** |
| seo-008 | Nombrar al revisor en "about" refuerza EEAT de sitio | **CONFIRMADA (artefacto) / SIN DATOS (efecto)** |
| seo-009 | `category` en el índice habilita priorizar categoría | **CONFIRMADA** |
| ux-002 | Enlazar al revisor **mejora la confianza percibida** | **SIN DATOS SUFICIENTES** |
| seo-010 | Medir hoy establece la línea base para juzgar seo-011 | **CONFIRMADA** |
| seo-011 | Repartir el punto de partida distribuye el enlazado interno | **CONFIRMADA (con datos)** |

**Lo que he vuelto a medir y sale bien:**
- 4 silos generados (`tipos-de-jubilacion-anticipada`, `calculos-y-penalizaciones`,
  `planificacion-financiera`, `actualidad-y-casos-practicos`), los 4 enlazados
  desde la home y desde `/blog`. Efecto no previsto y **positivo**: el umbral
  ≥3 de `[categoria].astro` es dinámico, así que el cuarto silo (0 artículos el
  29-jul, 13 hoy) se generó solo. Buen diseño, se mantiene.
- 48/48 artículos con enlace a su silo (eyebrow + miga de 4 niveles) y 48/48 con
  enlace a `/equipo/javier-rodriguez`. `reviewedBy` resuelve al `@id`.
- **seo-011 es la única mejora del ciclo con evidencia numérica real, y es buena.**
  Antes: mínimo 0, máximo 46, mediana 0, 29/47 artículos con cero enlaces entrantes.
  Después (verificado hoy): **mínimo 3, máximo 14, mediana 3, 0/48 con cero.**
- **El objetivo del ciclo anterior está CUMPLIDO y verificado, 13 días antes de su
  plazo (2026-08-28).** Ningún artículo por debajo de 3 enlaces entrantes; una
  página de silo por categoría con ≥3 publicados; todo a ≤2 clics de la home.

**Lo que sale mal y hay que decir:**

1. **seo-006 está REFUTADA, no confirmada.** La hipótesis era "entidad
   *verificable*". Lo entregado es una URL de 551 palabras con nombre y cargo, sin
   `sameAs`, sin `worksFor`, sin una sola referencia externa comprobable. Hicieron
   bien en no inventar credenciales — la restricción era correcta y se respetó —
   pero eso significa que **la hipótesis no se pudo cumplir con la información
   disponible**, no que se cumpliera. Una URL propia no verifica a nadie.
2. **seo-007 solo arregló la mitad del grafo.** `reviewedBy` está unificado, pero
   el `author` de los 48 artículos sigue siendo un nodo `Organization` suelto con
   `name: "tujubilacionanticipada.com"`, que **no referencia** el `@id`
   `#organization` (cuyo `name` es "Tu Jubilación Anticipada"). Dos entidades
   distintas para el mismo editor en la misma página.
3. **8 de las 13 tareas declararon como métrica "GSC a 21-30 días".** Eso viola
   directamente la restricción que yo mismo escribí el 29-jul ("toda tarea debe
   declarar su criterio de éxito de forma verificable sobre el repositorio o sobre
   `/dist`"). Métricas que nadie puede leer son criterios mal formulados, y por eso
   ux-002 se queda en SIN DATOS: su criterio medía la presencia de un `<a>`, no la
   confianza. Fallo sistémico de formulación, no de ejecución.
4. **Balance honesto: 11/13 hipótesis confirmadas a nivel de artefacto, 0 a nivel
   de negocio.** El ciclo hizo bien lo que se le pidió. Lo que se le pidió puede
   haber sido insuficiente, y ya no tiene sentido seguir por ahí: la arquitectura
   de silos, migas y entidad del revisor está terminada. Iterarla más es rendimiento
   decreciente.

### Lo que la medición de hoy ha destapado (y es lo importante)

Al medir el grafo de enlaces y el peso real de cada URL han aparecido tres hechos
que no estaban en el diagnóstico anterior:

- **`/simulador` tiene 71 palabras de contenido único en `<main>`.** Setenta y una.
  Y es, junto a `/blog` y `/asesoramiento`, **la URL más enlazada internamente de
  todo el sitio: la enlazan las 69 páginas** (está en `NAV_LINKS`), más 48 enlaces
  desde el cuerpo de los artículos y 5 desde la home. Es el mayor sumidero de
  autoridad interna del proyecto y está vacío. Con JavaScript desactivado el botón
  "Calcular mi jubilación" no hace nada (isla React `client:load`): incumple la
  restricción permanente "el sitio debe funcionar sin JavaScript".
- **El 65% del volumen declarado del proyecto está en 5 URLs.** De 137.050
  búsquedas/mes publicadas: `simulador jubilacion` 60.000 (44%),
  `tabla de jubilación por años cotizados` 13.000, `jubilacion anticipada` 11.000,
  `que es la base reguladora` 5.600. La mediana de las otras 45 es 1.000/mes y 15
  están por debajo de 500. **El proyecto es 5 URLs con 45 satélites**, no 50 URLs.
- **Hay canibalización viva, no futura.** Tres pares compiten por la misma consulta
  con canonical propio cada uno (verificado en `/dist`):
  - `jubilacion-anticipada-cambios-2026` (05-jul, 2.531 pal.) **vs**
    `jubilacion-anticipada-novedades-2026` (01-ago, 2.521 pal.) — misma keyword
    exacta declarada: `jubilacion anticipada 2026`. **Ya publicados los dos.**
  - `/simulador` (título "Simulador de jubilación anticipada", 71 pal.) **vs**
    `/blog/como-interpretar-simulador-jubilacion` (título "Simulador de jubilación:
    cómo interpretar…", 2.518 pal.) — la consulta de 60.000/mes. La página delgada
    se lleva los enlaces internos; la gruesa se lleva el contenido.
  - `que-es-la-jubilacion-anticipada` (25-jun) **vs**
    `guia-completa-jubilacion-anticipada-2026`, programado para el **2026-08-24**,
    misma keyword exacta `jubilacion anticipada`, 11.000/mes. **Faltan 9 días.**
    Lo reporté el 29-jul y sigue en el calendario.

## Cuello de botella prioritario

**Autoridad** — pero ya no la del sitio, sino la de las URLs concretas que
sostienen el negocio.

El ciclo anterior atacó la autoridad *arquitectónica* (silos, jerarquía, grafo de
enlaces, entidad del revisor) y la cerró: verificado sobre `/dist`, no queda deuda
estructural relevante. Lo que queda es que **los documentos que concentran el 65%
del valor no son competitivos como documentos individuales, y además compiten
entre sí**. El activo más enlazado del sitio tiene 71 palabras. La consulta de
11.000/mes va a tener dos URLs propias dentro de nueve días. Ninguna cantidad de
arquitectura arregla eso: dos URLs partiéndose la señal de la misma consulta no
posicionan ninguna de las dos, y una página de 71 palabras no posiciona en un
nicho donde compite con el simulador oficial de la Seguridad Social y con la banca.

Descarto los otros tres, explícitamente:
- *Visibilidad*: no hay nada que la bloquee en el build — robots abierto, sitemap
  de 65 URLs, canonicals correctos, imágenes de schema existentes (48/48), páginas
  estáticas, sin `noindex`. No puedo confirmar la indexación real, pero tampoco
  puedo señalar una causa técnica: no hay ninguna.
- *Relevancia*: sería inventármelo. No tengo rebote ni scroll ni tiempo en página.
  Lo único medible es que la longitud media de artículo (1.944 palabras de fuente)
  y la cobertura de intención (49/50 informacional) son razonables para el nicho.
- *Conversión*: sigue siendo prematuro y, además, **hoy no hay nada que convertir**:
  la guía está desactivada, no hay publicidad, y el formulario de asesoramiento no
  lleva a ningún producto declarado. Optimizar la conversión de una oferta que no
  existe es teatro. Se mantiene fuera hasta que haya volumen medible y oferta real.

## Objetivo del ciclo

**El 2026-09-14, las 5 URLs que concentran el 65% del volumen declarado del
proyecto (89.600 de 137.050 búsq./mes) cumplen las dos condiciones a la vez,
verificado por un script del repositorio sobre `/dist` y sin depender de Search
Console:**

1. **Unicidad**: ninguna de ellas comparte consulta objetivo con otra URL indexable
   del sitio. Cero pares canibalizados en todo el sitemap, incluida la resolución
   automática del duplicado que entra el 2026-08-24.
2. **Suficiencia**: ninguna tiene menos de **1.200 palabras de contenido único en
   `<main>`** y todas devuelven algo útil con **JavaScript desactivado**.

Hoy el marcador es: 4 de 5 cumplen suficiencia (2.253–2.581 palabras),
**`/simulador` está en 71 palabras y es JS-obligatorio**, y hay **3 pares
canibalizados** de los cuales 2 ya están vivos.

*Definición operativa del conjunto money (para que no se discuta después):*
`/simulador` más las URLs de artículo cuya keyword en `scripts/calendario.json`
declara ≥ 5.000 búsq./mes — hoy `como-interpretar-simulador-jubilacion`,
`tabla-jubilacion-anos-cotizados`, `que-es-la-jubilacion-anticipada`,
`base-reguladora-pension-jubilacion`. El conjunto se recalcula solo desde el
calendario; no se mantiene a mano.

*Métrica secundaria (línea base, no criterio de éxito):* el propietario anota el
2026-09-14 en Search Console las impresiones, clics y posición media de esas 5
URLs. Sirve para el ciclo siguiente. Este ciclo **no** se juzga con ese dato.

## Líneas de trabajo (máximo 3, priorizadas)

### 1. Instrumento de auditoría del conjunto money sobre `/dist` — área principal: **seo**

**Va primero a propósito.** `seo-010` es la única razón por la que hoy he podido
dictaminar `seo-011` con números en vez de con fe; las otras doce las he tenido
que reverificar a mano. Se replica el patrón antes de tocar nada, para que exista
un "antes" que nadie pueda discutir.

Un script (p. ej. `scripts/auditar-money-set.mjs`) que, tras `npm run build`,
derive el conjunto money desde `scripts/calendario.json` (**solo lectura**) y para
cada URL imprima: palabras únicas en `<main>`, enlaces internos entrantes,
`canonical`, tipos de JSON-LD presentes, y si existe otra URL indexable del
sitemap que declare su misma keyword exacta. Además, recorrido completo del
sitemap buscando pares keyword-duplicada. Si existe `scripts/datos/*.csv` con un
export de GSC, lo cruza e imprime impresiones/clics/posición; si no existe, lo dice
por consola y termina en 0.

*Falsable:* el script existe, se ejecuta sobre `/dist` y **su salida "antes" queda
pegada en `DECISIONES.md` antes de ejecutar las líneas 2 y 3**. Sale con código 1
si alguna URL del conjunto tiene <1.200 palabras o comparte keyword con otra URL
indexable. Hoy debe salir con código 1 y reportar exactamente: `/simulador` = 71
palabras, y 2 pares canibalizados (`cambios-2026`/`novedades-2026`, y
`/simulador`/`como-interpretar-simulador-jubilacion`).

### 2. Consolidar las consultas canibalizadas sin tocar `src/content/blog/**` — área principal: **seo**

Hay tres pares repartiéndose la señal de tres consultas, dos de ellos vivos y uno
que entra el 2026-08-24 sobre la keyword de 11.000/mes. **Es la línea más urgente
en calendario y la más barata en esfuerzo.**

Se resuelve **a nivel de layout y de librería**, sin abrir un solo `.mdx`: un mapa
de consolidación en `src/lib/` consumido por `BlogPost.astro` / `BaseHead.astro` y
por la generación del sitemap, alimentado por una regla derivada de
`scripts/calendario.json` (solo lectura): **cuando dos URLs publicadas declaran la
misma keyword exacta, la de fecha de publicación más antigua es la canónica; la
más reciente emite `<link rel="canonical">` hacia ella y queda excluida del
sitemap.** Excepción de seguridad: si la más reciente tiene ≥1,5× palabras únicas
que la antigua, el script **no decide solo — lo reporta al CEO**.

El par `/simulador` vs `como-interpretar-simulador-jubilacion` **no** se resuelve
con canonical (son documentos legítimamente distintos: una herramienta y una guía):
se resuelve diferenciando el `title` y el `H1` de `/simulador` para que se quede la
intención de herramienta y el artículo mantenga la informacional. Como el `title`
del artículo vive en su frontmatter y es intocable, el que se mueve es `/simulador`.

*Falsable:* tras el build, `dist/blog/jubilacion-anticipada-novedades-2026/index.html`
tiene `canonical` apuntando a `…/jubilacion-anticipada-cambios-2026` y **no** aparece
en `sitemap-0.xml`; el script de la línea 1 reporta 0 pares canibalizados; y una
ejecución de prueba con `guia-completa-jubilacion-anticipada-2026` marcado como
publicado demuestra que la regla lo resuelve **sola**, sin intervención humana, el
2026-08-24. `npm run build` en verde.

### 3. `/simulador`: de 71 palabras y JS-obligatorio a documento competitivo y usable sin JavaScript — área principal: **seo**

Es la URL que recibe más enlaces internos del sitio (69/69 páginas) y apunta al 44%
del volumen declarado. Hoy es un formulario vacío que además incumple una
restricción permanente. Dos problemas, una sola causa: todo el valor de la página
está dentro de una isla React.

Qué debe pasar a contener, como HTML estático:
- **Escenarios precalculados en tablas renderizadas en build** (edad × años
  cotizados × tramos de base reguladora): con JS desactivado, un usuario debe poder
  **leer una estimación para su caso** en una tabla. Esto resuelve la restricción
  no-JS y aporta contenido indexable a la vez; la isla React se queda como **mejora
  progresiva**, no como requisito.
- Qué calcula exactamente y con qué fórmula, con el artículo de la LGSS que la
  respalda, enlazado a `boe.es` o `seg-social.es` (dofollow, `DOFOLLOW_HOSTS`).
- Tabla de coeficientes reductores vigentes, cada cifra con su fuente oficial.
- Limitaciones explícitas de la estimación y **enlace al simulador oficial de la
  Seguridad Social**. No se compite ocultando que existe: se compite explicándolo.
- Schema propio del tipo de página (`WebApplication`/`SoftwareApplication`).
  `FAQPage` **solo** si las preguntas están literalmente visibles en la página.

*Falsable:* medido por el script de la línea 1 — `<main>` de `/simulador` ≥ 1.200
palabras únicas (hoy 71); ≥ 40 combinaciones de escenario presentes en el HTML
estático; con la isla React eliminada del HTML, la página sigue conteniendo una
tabla de estimación legible; el `DISCLAIMER` sigue visible; cada cifra normativa
nueva tiene un enlace a fuente oficial en la misma sección. `npm run build` en verde.

## Fuera de alcance este ciclo

- **La arquitectura de silos, migas de pan y entidad del revisor: CERRADA.** Está
  hecha y verificada. No se itera, no se "pule", no se añaden silos ni niveles.
  Cualquier tarea que proponga tocarla se rechaza.
- **`src/content/blog/**`, `scripts/calendario.json` y `.github/**`: intocables.**
  Sin excepciones, tampoco para la consolidación de la línea 2 — por eso se resuelve
  en `src/lib/` y en los layouts. El duplicado del 2026-08-24 se reporta al
  propietario por tercera vez, **no** se edita el calendario.
- **CRO, copy y campos del formulario de asesoramiento, `socialProofCount`,
  avatares, colores de CTA.** Sin tráfico medible y sin oferta declarada, cualquier
  test es ruido.
- **Guía PDF y pasarela de pago.** Sigue oculta: `CTAGuia` comentado y
  `_guia-jubilacion-anticipada.astro` fuera del routing. Un CTA de 29 € que acaba
  en un `mailto:` destruye confianza en YMYL.
- **Notificaciones push** y `VAPID_PUBLIC_KEY`.
- **Lógica y fórmulas del cálculo del simulador.** La línea 3 añade contenido,
  escenarios estáticos y fuentes; **no reescribe el motor de cálculo**. Si al
  documentar la fórmula se detecta que el cálculo actual es incorrecto, se **para y
  se reporta al CEO**; no se corrige por iniciativa propia en un sitio YMYL.
- **Textos legales.** `LEGAL.titular`, `nif` y `domicilio` siguen sin datos reales;
  las páginas degradan sin mostrar los corchetes (verificado), así que no hay daño
  visible, pero el riesgo LSSI-CE persiste. Bloqueado en el propietario.
- **Link building externo.** No hay agente para ello y no se simula con directorios.
- **`sameAs` de `Organization` y credenciales del revisor.** Sin perfiles reales que
  enlazar, cualquier cosa que se añada sería fabricada. Bloqueado en el propietario.
- **Rediseños.**

### Deudas con fecha límite (no se tocan hoy, pero no se olvidan)

- **El formulario de `/asesoramiento` no funciona sin JavaScript** (`<form
  id="contact-form" novalidate>`, sin `method` ni `action`, pese a que
  `api/contact.js` acepta POST). Incumple una restricción permanente. **Si no está
  cerrado el 2026-09-14, entra como línea 1 del ciclo siguiente.**
- **`author` de los 48 artículos es un `Organization` suelto** con `name:
  "tujubilacionanticipada.com"`, que no referencia el `@id` `#organization`
  ("Tu Jubilación Anticipada"). Dos entidades para el mismo editor. Se arregla en
  `src/lib/schema.ts` en el próximo ciclo si no surge nada mayor.

## Restricciones

### Permanentes (ningún agente puede eliminarlas ni relajarlas)
- Nicho YMYL: ninguna afirmación normativa sin fuente oficial (`seg-social.es`, `boe.es`)
- Señales EEAT intocables: autoría, credenciales del revisor, fechas de revisión
- **Prohibido fabricar señales de confianza**: ni credenciales, ni testimonios, ni
  contadores. `ASESORAMIENTO.socialProofCount` refleja un dato real (hoy 0) o se oculta
- Accesibilidad mínima WCAG AA — público objetivo de 50 a 65 años
- **El sitio debe funcionar sin JavaScript.** Esta restricción lleva dos ciclos
  incumplida por `/simulador` y `/asesoramiento`; este ciclo se cierra la mitad del
  incumplimiento (línea 3) y la otra mitad queda con fecha límite. No se vuelve a
  declarar "permanente" y a tolerar en silencio
- Cero JavaScript nuevo en páginas de blog y en páginas nuevas
- Prohibidos los patrones oscuros en cualquier elemento de conversión
- `npm run build` (incluye `astro check`) debe pasar. Nada se publica con el build roto
- No tocar `src/content/blog/**`, `scripts/calendario.json` ni `.github/**`
- No romper `rehypeExternalLinks`: `DOFOLLOW_HOSTS` sigue dofollow, el resto `nofollow`
- Todo criterio de éxito debe ser verificable sobre el repositorio o sobre `/dist`,
  sin depender de datos de Search Console

### Añadidas en este ciclo (también permanentes a partir de hoy)
- **Ninguna tarea puede declarar como métrica de éxito un dato de GSC o GA4 mientras
  el entorno no tenga acceso.** 8 de las 13 tareas del ciclo anterior lo hicieron y
  por eso hay hipótesis que nadie puede juzgar. Si la métrica no se puede leer, no
  es una métrica: es una excusa. La sección "Métrica y plazo" de `DECISIONES.md`
  debe contener el comando que la produce.
- **Toda tarea que modifique una URL del conjunto money debe pegar en
  `DECISIONES.md` la salida del script de auditoría antes y después.** Sin el
  "antes", la tarea no se da por hecha.
- **La canibalización se resuelve con `canonical`, nunca con `noindex`**, salvo
  autorización caso a caso del CEO. `canonical` consolida las señales de una URL que
  puede ya tener enlaces; `noindex` las tira a la basura.
- **`/simulador` no puede presentar su estimación como cálculo oficial**, debe
  mantener el `DISCLAIMER` visible y debe enlazar al simulador oficial de la
  Seguridad Social. Cada coeficiente publicado, con su fuente en `boe.es` o
  `seg-social.es`.
- **Si al documentar una fórmula o un coeficiente se detecta que el sitio publica un
  dato incorrecto, el agente para y lo reporta.** No se corrige normativa por
  iniciativa propia. Es un sitio de pensiones.

---

## Qué datos me faltaron para decidir mejor

1. **Search Console.** Impresiones, clics, posición media y, sobre todo, el informe
   de cobertura. Es el dato que más cambiaría el diagnóstico: si las 65 URLs no
   están indexadas, el cuello de botella no es Autoridad sino Visibilidad y este
   documento entero está mal enfocado. Segundo en importancia: **el informe de
   consultas me diría qué pares canibalizan de verdad**, en vez de deducirlo de las
   keywords declaradas en el calendario.
2. **GA4.** `GA_MEASUREMENT_ID = 'G-9K6WR2TR7M'` está configurado y no puedo leerlo.
   Sin sesiones, rebote, scroll ni clics en `data-ga-event="cta_asesoramiento"`, he
   descartado Relevancia y Conversión por falta de datos, no por evidencia de que
   estén bien. Sigo sin saber si alguien ha usado nunca el simulador.
3. **El sitio en producción.** Confirmado hoy que el bloqueo es del proxy de este
   entorno (`connect_rejected`, 403 a CONNECT sobre `tujubilacionanticipada.com:443`),
   no del sitio. No he podido verificar despliegue, HTML servido, LCP ni CLS.
4. **Ahrefs / backlinks.** Cero visibilidad del perfil de enlaces. Con 7 semanas de
   dominio asumo que es ~0, pero es una suposición. Tampoco sé quién ocupa hoy el
   top 10 de `simulador jubilacion`, que es la decisión que más me habría ayudado a
   calibrar la línea 3.
5. **Leads reales.** Cuántas solicitudes ha recibido `/api/contact` desde el
   lanzamiento. Es el único dato de negocio que existe y no está en el repo.
6. **Si existe oferta detrás de `/asesoramiento`.** No sé si hay un asesor, un
   partner o nada. De eso depende que el ciclo que viene sea de conversión o no.

**Acción para el propietario, por segunda vez y ahora con instrucción concreta:**
o bien (a) añadir `tujubilacionanticipada.com` a la lista blanca del proxy y dar
lectura a GSC/GA4, o bien (b) volcar en `scripts/datos/` un export CSV de Search
Console con impresiones, clics y posición por URL y por consulta. La línea 1 de
este ciclo deja el lector de esos CSV ya construido: en cuanto el archivo aparezca,
la auditoría lo usa sin más trabajo. **Mientras no exista, seguiré revisando a
ciegas y juzgando solo artefactos del build — y este es el tercer ciclo así.**
