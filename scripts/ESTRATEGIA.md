# Estrategia vigente — 2026-07-29

> **REVISIÓN PARCIALMENTE A CIEGAS.** No he tenido acceso a Search Console, GA4,
> Ahrefs ni al sitio en producción (el proxy de red devuelve 403 en
> `tujubilacionanticipada.com`; no hay MCP de Search Console ni de analítica
> disponible en este entorno). Todo el diagnóstico está fundamentado en el
> código del repositorio y en `scripts/calendario.json`, no en datos de
> rendimiento. Los apartados marcados con **[SIN DATOS]** son hipótesis, no
> hechos. Ver "Datos que me faltaron" al final.

## Diagnóstico del ciclo anterior

Primer ciclo: `scripts/DECISIONES.md` está vacío y `scripts/BACKLOG.json` tiene
`ultima_replanificacion: null` y 0 tareas. **No hay ninguna hipótesis previa que
evaluar.** No doy nada por bueno ni por malo del pasado; lo que sigue es el
diagnóstico inicial del activo.

### Qué existe hoy

- **Edad del proyecto:** el primer artículo se publicó el 2026-06-25. El sitio
  tiene ~5 semanas. **[SIN DATOS]** un dominio de esa edad en un nicho YMYL
  financiero no tiene autoridad acumulada; asumirlo es razonable, demostrarlo no
  puedo.
- **Contenido:** 31 de 60 artículos publicados (52 % del calendario), 1.400–2.250
  palabras cada uno, con revisor nombrado, fuentes oficiales enlazadas (BOE,
  seg-social) en dofollow y el resto en nofollow. La calidad de la unidad de
  contenido no es el problema.
- **Monetización real:** una sola vía, el formulario de lead de
  `/asesoramiento` → `api/contact.js` → email vía Resend. **No hay AdSense, no
  hay afiliación, no hay producto de pago activo.** La guía de 29 € existe
  (`src/pages/_guia-jubilacion-anticipada.astro`) pero el prefijo `_` la excluye
  del enrutado de Astro, el link del menú está comentado en `src/consts.ts` y el
  componente `CTAGuia` está comentado en home, blog y layout de artículo. La
  captura de email del simulador es código muerto: `{false && (...)}` en
  `src/components/Simulador.jsx:349` y un `// TODO: conectar con el proveedor de
  email marketing` en la línea 221. **El negocio entero depende de un formulario.**

### Defectos estructurales verificables (esto sí son hechos, no hipótesis)

1. **No existe arquitectura de silos.** `src/content/config.ts` define 4
   categorías y el calendario las usa, pero **no hay ni una sola página de
   categoría**. Las únicas rutas de listado son `/blog` y `/blog/page/[page]`
   con `POSTS_PER_PAGE = 6`. Con 31 artículos ya hay 6 páginas de paginación; con
   los 60 del calendario habrá 10. La home enlaza solo 3 artículos. Resultado:
   los artículos antiguos quedan a 4–6 clics de la home y no hay ninguna página
   que concentre relevancia temática.
2. **Los enlaces internos son aleatorios, no temáticos.** 21 de los 31 `.mdx`
   no contienen ni un enlace interno escrito a mano. Los que aparecen los
   inyecta `rehypeInlineBlocks` en el build, y elige el destino con
   `others[recoPick % others.length]` (`src/lib/rehype-plugins.mjs:150`), es
   decir, por índice de array — orden de fichero, no relevancia.
   `RelatedArticles.astro` prioriza misma categoría pero rellena con "los más
   recientes". El artículo pilar (`que-es-la-jubilacion-anticipada`, keyword de
   11.000 búsquedas/mes) no recibe ningún enlace interno deliberado.
3. **`/simulador` es una página vacía para un rastreador.** Ataca "simulador
   jubilacion" (60.000 búsquedas/mes, KD 24 — el mayor volumen de todo el
   proyecto) con ~120 palabras de HTML y un componente React `client:load`. Sin
   JavaScript no hay absolutamente nada.
4. **Marcado FAQPage sin contenido visible.** `src/pages/simulador.astro` pasa 3
   FAQs a `faqSchema()` pero **nunca las renderiza en el cuerpo de la página**.
   Google exige que el contenido marcado sea visible para el usuario; esto es
   incumplimiento de las directrices de datos estructurados, no una optimización
   opcional.
5. **El sitio no funciona sin JavaScript donde más importa.** El formulario de
   `/asesoramiento` no tiene `action` ni `method`: es `preventDefault()` + `fetch`
   contra un endpoint que solo acepta JSON. Sin JS, la única vía de ingresos del
   sitio es un botón que no hace nada. Esto contradice una restricción
   declarada del proyecto.
6. **EEAT a medias.** Javier Rodríguez aparece con cargo, foto y nodo
   `Person`/`reviewedBy` en el JSON-LD, pero **no hay página de biografía, ni
   `url`, ni `sameAs`**. El `author` de todos los artículos es la Organización.
   En YMYL, un revisor sin entidad verificable vale mucho menos de lo que cuesta.
7. **Identidad legal sin rellenar.** `LEGAL.titular`, `LEGAL.nif` y
   `LEGAL.domicilio` en `src/consts.ts` siguen siendo literales
   `[TITULAR — nombre y apellidos o razón social]`. Las páginas legales no los
   imprimen, así que no se ve roto, pero el sitio **recoge nombre, teléfono y
   email sin identificar al responsable del tratamiento**. Esto no lo puede
   arreglar ningún agente: es una decisión del titular. Ver "Escalado".
8. **Tres capas superpuestas sobre el viewport móvil:** barra sticky de
   asesoramiento (`AsesoramientoCard`), banner de consentimiento y prompt de
   notificaciones push por `setTimeout`. Público objetivo de 50 a 65 años.

### Lo que está bien y no hay que tocar

Consentimiento correcto (Consent Mode v2, "Rechazar todo" con la misma
prominencia que "Aceptar todo"), `socialProofCount: 0` en lugar de un número
inventado, disclaimers YMYL en cada artículo, canonical robusto, sitemap con
exclusiones, menú móvil sin JS, skip link, nofollow selectivo con dofollow solo
a fuentes oficiales. Nada de esto entra en el alcance de este ciclo.

## Cuello de botella prioritario

**VISIBILIDAD.**

No es una elección por descarte, es la única defendible:

- No puedo diagnosticar **relevancia** ni **conversión** porque ambas requieren
  sesiones que no puedo medir. Optimizar la conversión de un tráfico que no sé
  si existe es superstición.
- **Autoridad** sería el diagnóstico correcto si el contenido estuviera bien
  presentado y solo le faltaran enlaces externos. No es el caso: hay defectos de
  rastreo y arquitectura demostrables en el código. Construir autoridad hacia una
  estructura plana es tirar el esfuerzo — no hay páginas hub a las que apuntar.
- Los 31 artículos existen como un montón, no como un sitio. Google no recibe
  ninguna señal de que este dominio sea una entidad temática sobre jubilación
  anticipada: no hay hubs, los enlaces internos son ruido alfabético y el activo
  de mayor volumen (`/simulador`, 60k/mes) es invisible sin JavaScript.

El cuello de botella no es "falta contenido" — quedan 29 artículos programados y
el calendario los publicará solo. Es **que el contenido publicado no está
organizado de forma que Google pueda entenderlo ni rastrearlo entero.**

## Objetivo del ciclo

**Al 2026-08-28: ninguna URL de `/blog/*` a más de 2 clics desde la home, las 4
páginas hub de silo publicadas y presentes en el sitemap, y `/simulador`
sirviendo ≥ 900 palabras de HTML rastreable con JavaScript desactivado.**

Verificable sin depender de Google: se comprueba con un crawl del build local
(`dist/`) y con `curl` sobre el HTML servido. Adicionalmente, y de forma
obligatoria, la próxima replanificación debe llegar con una exportación de
Search Console (impresiones, clics y posición media por URL, y cobertura de
indexación) pegada en `scripts/DECISIONES.md`. **Si el próximo ciclo vuelve a ser
a ciegas, el objetivo se considera fallido con independencia de lo que se haya
construido.**

## Líneas de trabajo (máximo 3, priorizadas)

### 1. Arquitectura de silos y enlazado interno temático — área: **seo**

**Qué:** crear una página hub por cada una de las 4 categorías de
`src/content/config.ts`, enlazarlas desde la navegación principal y desde el
listado del blog, y sustituir la selección por índice de módulo del enlazado
automático por selección por categoría.

**Por qué:** es el defecto que bloquea todos los demás. Sin hubs no hay
concentración de relevancia, sin profundidad ≤2 hay artículos que Google puede
tardar meses en rastrear, y con enlaces internos elegidos por orden alfabético
se está diluyendo autoridad hacia artículos irrelevantes.

**Criterio falsable:** tras el cambio, un crawl de `dist/` partiendo de
`index.html` alcanza el 100 % de las URLs de `/blog/*` en ≤2 saltos; cada hub
enlaza a todos los artículos publicados de su silo con anchor descriptivo (no
"leer más"); los bloques "Lectura recomendada" inyectados en un artículo apuntan
a un artículo de la misma categoría en ≥80 % de los casos.

**Archivos previsibles:** nueva ruta en `src/pages/`, `src/lib/rehype-plugins.mjs`,
`src/components/RelatedArticles.astro`, `src/consts.ts`, `astro.config.mjs`.

### 2. Convertir `/simulador` en un activo indexable — área: **seo**

**Qué:** dotar a `/simulador` de contenido estático rastreable (explicación del
método de cálculo, tabla de coeficientes reductores trimestre a trimestre con
cita a la LGSS, y **las 3 FAQ renderizadas en HTML visible**) y degradar el
componente React con elegancia: sin JS la página debe seguir siendo útil y
enlazar a los artículos de cálculo.

**Por qué:** dos motivos independientes, ambos suficientes. (a) Es la keyword de
mayor volumen del proyecto (60.000/mes) atacada con ~120 palabras. (b) El
marcado `FAQPage` sin contenido visible incumple las directrices de datos
estructurados de Google y es un riesgo de acción manual en un sitio YMYL — hay
que corregirlo aunque no diera un solo clic.

**Criterio falsable:** el HTML de `/simulador` servido sin ejecutar JS contiene
≥900 palabras y el texto íntegro de las 3 preguntas y respuestas del
`faqSchema`; el simulador sigue funcionando con JS activado; el LCP de la página
no empeora respecto a la medición previa al cambio (medir antes).

### 3. Hacer que la única vía de ingresos funcione sin JavaScript — área: **cro**

**Qué:** que el formulario de `/asesoramiento` haga un envío nativo
(`method="post"` con `action` real y redirección a una página de gracias) y que
`api/contact.js` acepte también `application/x-www-form-urlencoded`. El camino
con JS se mantiene igual: mejora progresiva, no sustitución.

**Por qué:** el 100 % de la monetización pasa por ese formulario y hoy es un
botón muerto sin JavaScript, lo que además incumple una restricción explícita
del proyecto. Es barato, es reversible y elimina un fallo silencioso que ninguna
métrica actual detectaría.

**Criterio falsable:** con JavaScript desactivado en el navegador, enviar el
formulario produce una respuesta 200 y una página de confirmación con URL propia
(`/gracias` o equivalente, `noindex`); con JavaScript activado el flujo actual no
cambia; el honeypot y la validación de consentimiento RGPD siguen operativos en
ambos caminos.

## Fuera de alcance este ciclo

Explícitamente **NO** se toca:

- `src/content/blog/**`, `scripts/calendario.json` y `.github/**` (rutas
  prohibidas de la routine).
- **Optimización de conversión más allá de la línea 3.** Nada de tests A/B,
  copys de CTA, colores de botón ni urgencia: sin datos de tráfico no son
  medibles y no serían más que ruido.
- **La guía de 29 €.** Sigue desactivada. Reactivar un producto de pago sin
  saber si entra tráfico es invertir en el orden equivocado. Se decide en un
  ciclo posterior, con datos.
- **La captura de email del simulador.** Se queda desactivada. Prohibido
  reactivarla mientras no haya un destino real: pedir un email y no hacer nada
  con él es engañar al usuario.
- **Notificaciones push.** No se amplían ni se hacen más insistentes.
- **Link building, guest posting y cualquier adquisición externa.** Primero la
  casa, luego los enlaces.
- **Rediseño visual, cambio de paleta o de tipografía.**
- **Nuevas vías de monetización** (AdSense, afiliación). No se evalúan hasta
  tener un baseline de tráfico.
- **Los textos legales y de consentimiento**, salvo para añadir la página de
  gracias de la línea 3.

## Restricciones

Permanentes. Ningún agente puede romperlas, ni siquiera si mejora una métrica:

- **YMYL:** ninguna afirmación normativa (edades, coeficientes, importes, plazos)
  sin fuente oficial enlazada — `seg-social.es`, `boe.es`, `inclusion.gob.es`,
  `sepe.es`. Si no hay fuente, no se publica el dato.
- **EEAT intocable:** autoría, nombre y credenciales del revisor, fechas de
  publicación y revisión, disclaimers orientativos y nodos `reviewedBy` del
  JSON-LD. No se eliminan, no se diluyen, no se sustituyen por firmas genéricas.
- **Accesibilidad mínima WCAG AA.** Público de 50 a 65 años: contraste,
  tamaño de fuente base, área táctil ≥44 px, foco visible, formularios con
  `label` asociado. Ninguna mejora estética justifica bajar de AA.
- **El sitio debe funcionar sin JavaScript.** El contenido, la navegación y la
  vía de contacto son obligatorios sin JS. El JS solo añade.
- **Prohibidos los patrones oscuros:** nada de cuentas atrás falsas, escasez
  inventada, `socialProofCount` sin respaldo real, consentimiento preseleccionado,
  "Rechazar" menos visible que "Aceptar", ni overlays no descartables.
- **Datos estructurados solo sobre contenido visible.** Prohibido añadir marcado
  `FAQPage`, `HowTo` o `Review` cuyo contenido no esté renderizado en la página.
- **Rendimiento:** ninguna tarea puede empeorar el LCP de la página que toca. Si
  no se mide antes, no se aplica.
- **Sin tracking sin consentimiento.** Consent Mode v2 en `denied` por defecto.

## Escalado al titular (no delegable a agentes)

Dos bloqueos que ningún agente puede ni debe resolver:

1. **`LEGAL.titular`, `LEGAL.nif` y `LEGAL.domicilio` siguen siendo
   marcadores de posición** mientras el sitio recoge nombre, teléfono y email.
   Hay que rellenarlos (o constituir la sociedad) antes de escalar la captación
   de leads. Un agente no puede inventarse un NIF.
2. **Acceso a datos.** Sin Search Console, GA4 y Ahrefs accesibles desde el
   entorno de la routine, cada replanificación será una opinión bien argumentada
   en vez de una decisión. Es la inversión de mayor retorno del proyecto ahora
   mismo.

## Datos que me faltaron para decidir mejor

- **Search Console:** impresiones, clics, CTR y posición media por URL y por
  consulta; informe de cobertura (cuántas de las 31 URLs están realmente
  indexadas y cuántas en "Descubierta: actualmente sin indexar"). Sin esto no sé
  si el problema es que Google no rastrea, no indexa o indexa y no posiciona —
  tres diagnósticos con tres tratamientos distintos.
- **GA4:** sesiones, fuente/medio, tasa de rebote por artículo, scroll depth y,
  sobre todo, cuántos eventos `cta_asesoramiento` y `generate_lead` se han
  disparado. El código los emite; no sé si alguien los ha activado nunca.
- **Resend / `CONTACT_TO_EMAIL`:** número real de leads recibidos desde el
  lanzamiento. Es la única métrica de negocio que existe y no la he podido ver.
- **Ahrefs:** perfil de backlinks (sospecho que cero), autoridad del dominio y
  posiciones reales frente a competidores como Banco Santander, BBVA,
  jubilaciondefuturo.es o los medios generalistas que dominan estas SERP.
- **Core Web Vitals de campo** (Vercel Analytics o CrUX) para el público real,
  probablemente en móviles modestos.
- **El sitio en producción:** el proxy de red devuelve 403 a
  `tujubilacionanticipada.com`, así que no he podido verificar que lo desplegado
  coincida con el repositorio ni comprobar la indexación con `site:`.

Mientras estos datos no estén disponibles, cualquier estrategia de este proyecto
—incluida esta— es una apuesta razonada, no una decisión informada.
