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
