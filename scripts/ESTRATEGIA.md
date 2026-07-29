# Estrategia vigente — 2026-07-29

## Diagnóstico del ciclo anterior

**Primera ejecución de la routine. No hay ciclo anterior que evaluar.**
`scripts/DECISIONES.md` está vacío (solo la plantilla) y `scripts/BACKLOG.json`
tiene `tareas: []` y `ultima_replanificacion: null`. Cero hipótesis registradas
→ cero veredictos. No doy nada por bueno ni por malo.

**Esta revisión es "a ciegas" en cuanto a rendimiento.** No he podido acceder a
Search Console, GA4 ni Ahrefs desde este entorno, y `https://tujubilacionanticipada.com`
devuelve 403 a través del proxy, así que tampoco he podido verificar que el sitio
esté sirviendo, ni su indexación, ni sus Core Web Vitals. Todo lo que sigue está
deducido del repositorio, no de datos de tráfico. Lista completa de lo que me
faltó, al final del documento.

Lo que sí es medible en el repo, a fecha de hoy:

- **Dominio de ~5 semanas.** Primer artículo publicado el 2026-06-25; hoy 2026-07-29.
  31 de 60 artículos del calendario publicados, cadencia diaria sostenida.
- **La cobertura de keywords es correcta, no es el problema.** Los 31 artículos
  publicados suman ~117.150 búsquedas/mes de volumen declarado, con KD casi
  siempre ≤ 12. El calendario no está mal construido.
- **Silos declarados pero inexistentes como URL.** `src/content/config.ts` define
  4 categorías (S1 Tipos, S2 Cálculos, S3 Planificación, S4 Actualidad) y cada
  artículo lleva su `category`, pero **no existe ninguna página de categoría**.
  El único listado es `/blog` paginado de 6 en 6 → 6 páginas. Reparto real de
  publicados: S2 = 15, S1 = 10, S3 = 6, S4 = 0.
- **El enlazado interno está roto en la práctica.** 23 de los 31 artículos tienen
  **cero** enlaces contextuales en el cuerpo hacia otros artículos. Los bloques
  automáticos de `rehypeInlineBlocks` (`src/lib/rehype-plugins.mjs`) recorren el
  índice siempre desde `recoPick = 0`, y ese índice viene de un `readdirSync`
  alfabético: **prácticamente todos los artículos enlazan a los dos mismos posts**
  (`anos-cotizados-para-jubilarse`, `base-reguladora-pension-jubilacion`). El
  resto del sitio se sostiene sobre `RelatedArticles` (3 enlaces, misma categoría
  ordenada por fecha), que favorece a lo recién publicado y deja huérfano lo antiguo.
- **Entidad humana ausente en un sitio YMYL.** Los 31 artículos llevan
  "Revisado por Javier Rodríguez — Escalón 26, Seguridad Social", con foto
  (`public/equipo/javier-rodriguez.jpg`) y `reviewedBy` en el JSON-LD. Pero **no
  existe ninguna URL de esa persona**: la caja no enlaza a ningún sitio, el
  `Person` del schema no tiene `@id` ni `url`, y `/sobre-este-sitio` no menciona
  a un solo ser humano ("elaborado por la redacción"). El `author` de todos los
  `BlogPosting` es `Organization`. En YMYL, un revisor no verificable vale poco
  más que ninguno.
- **Deuda conocida, no prioritaria hoy:** la guía PDF está desactivada (el CTA
  está comentado en home, blog y artículo, y la página es `_guia-…astro`, fuera
  del routing: no hay 404s vivos, y así debe seguir hasta que exista producto);
  el simulador es una isla React `client:load` y el formulario de asesoramiento
  solo funciona con JS (ambos incumplen la restricción de "el sitio funciona sin
  JavaScript"); `LEGAL.titular/nif/domicilio` siguen con placeholder.
- **Alerta para la routine de contenido (no la puedo tocar yo):** el calendario
  planifica dos artículos que canibalizan keywords ya publicadas —
  `guia-completa-jubilacion-anticipada-2026` (2026-08-24) contra
  `que-es-la-jubilacion-anticipada` para "jubilacion anticipada", y
  `jubilacion-anticipada-novedades-2026` (2026-08-01) contra
  `jubilacion-anticipada-cambios-2026` para "jubilacion anticipada 2026".

## Cuello de botella prioritario

**Autoridad.**

El contenido es el correcto y está bien orientado, pero el sitio no le está dando
a Google ninguna de las tres señales que necesita para asignarle posiciones en un
nicho de pensiones: (1) no hay estructura temática navegable — cuatro silos que
existen en el frontmatter y en ninguna URL; (2) el grafo de enlaces internos está
degenerado — dos artículos concentran casi todos los enlaces del cuerpo y 23 no
reciben ninguno; (3) no hay entidad responsable verificable detrás de contenido
YMYL. Con 5 semanas de dominio, ninguna de esas tres cosas se arregla sola
publicando el artículo 32.

Descarto los otros tres explícitamente:
- *Visibilidad* técnica: robots.txt abierto, sitemap generado, canonical y
  JSON-LD correctos, páginas estáticas. No hay nada bloqueando la indexación.
- *Relevancia* y *Conversión*: con un dominio de 5 semanas y sin datos de tráfico,
  cualquier diagnóstico de rebote o de CRO sería inventado. Medir conversión con
  volúmenes que casi con seguridad son de decenas de sesiones es ruido, no señal.

## Objetivo del ciclo

**Convertir el blog plano en una estructura de silos rastreable y con entidad
responsable, de forma que el 2026-08-28 (30 días) se cumpla, verificado sobre
el build `/dist`: ninguna URL de artículo publicada recibe menos de 3 enlaces
internos entrantes desde otras páginas del sitio, y existe una página de silo
indexable por cada categoría con ≥ 3 artículos publicados, alcanzable en ≤ 2
clics desde la home.**

Métrica secundaria que debe leer el propietario en Search Console el 2026-08-28
(yo no tengo acceso): nº de URLs del sitemap en estado "Indexada" y nº de URLs
del blog con impresiones > 0. Se registra el valor de partida ese mismo día;
sirve de línea base para el ciclo siguiente, no como criterio de éxito de este.

## Líneas de trabajo (máximo 3, priorizadas)

1. **Páginas de silo (`/blog/categoria/<slug>`) para las categorías con ≥ 3
   artículos publicados** — área principal: **seo** — hoy hay 3 (Tipos de
   jubilación anticipada, Cálculos y penalizaciones, Planificación financiera);
   "Actualidad y casos prácticos" tiene 0 publicados y **no debe generarse hasta
   llegar a 3**, para no crear páginas vacías. Cada hub: H1 con la keyword del
   silo, introducción propia de 250–400 palabras, listado **completo y sin
   paginar** de sus artículos, `CollectionPage` + `BreadcrumbList` en JSON-LD, y
   enlace entrante desde la home, desde el listado `/blog` y desde la miga de pan
   de cada artículo (hoy la miga es Inicio / Blog / título; pasa a incluir el silo).
   *Falsable:* tras `npm run build`, el sitemap contiene exactamente una URL de
   silo por categoría con ≥ 3 publicados y ninguna más; las 31 URLs de artículo
   están a ≤ 2 clics de `/`; cada artículo tiene ≥ 1 enlace saliente a su silo.

2. **Página de entidad del revisor, enlazada desde los 31 artículos** — área
   principal: **seo** (señal EEAT) — hoy el nombre y el cargo del revisor se
   muestran 31 veces sin ninguna URL detrás. Crear una página de persona
   indexable con: rol editorial real (revisa, no redacta), qué revisa y con qué
   criterio, fuentes que se usan, y `Person` en JSON-LD con `url` y `@id`
   estable; el `reviewedBy` de `blogPostingSchema` pasa a referenciar ese `@id`;
   la caja "Revisado por" de `BlogPost.astro` pasa a enlazarla; `/sobre-este-sitio`
   también. **Prohibido inventar credenciales, titulaciones, años de experiencia
   o número de casos:** solo pueden publicarse el nombre y el cargo ya declarados
   en `scripts/calendario.json` y el proceso editorial que realmente ejecuta el
   pipeline. Si falta información biográfica, se deja fuera y se reporta al CEO;
   no se rellena.
   *Falsable:* existe 1 URL de persona en el sitemap; los 31 artículos enlazan a
   ella; el JSON-LD de un artículo cualquiera valida sin errores en el Rich
   Results Test y su `reviewedBy` resuelve al `@id` de esa URL.

3. **Redistribuir el enlazado interno automático del cuerpo del artículo** — área
   principal: **seo** — `rehypeInlineBlocks` reparte "Lectura recomendada"
   siempre desde el índice 0 del array alfabético, así que dos artículos se
   llevan casi todos los enlaces. Sustituir por una selección determinista
   (misma categoría primero, desempate por hash del slug de origen) que rote por
   todo el índice, y subir a 3 bloques de recomendación en artículos con ≥ 5 H2.
   *Falsable:* un script sobre `/dist` cuenta enlaces internos entrantes por URL
   de artículo; antes: 2 URLs con ~30 entrantes y 23 URLs con 0 desde el cuerpo;
   después: ninguna URL con menos de 3 entrantes y ninguna con más de 3× la
   mediana. Se ejecuta la medición antes y después y se anota en DECISIONES.md.

## Fuera de alcance este ciclo

- Contenido del blog (lo gestiona la routine de publicación diaria)
- `scripts/calendario.json` (incluida la canibalización detectada: se reporta al
  propietario, no se edita)
- Cambios en el pipeline de CI/CD
- Rediseños completos
- **Guía PDF y pasarela de pago:** sigue oculta. No se reactiva `CTAGuia` ni se
  saca `_guia-jubilacion-anticipada.astro` del guion bajo mientras no exista
  producto. Un CTA de 29 € que lleva a un `mailto:` destruye confianza en YMYL.
- **CRO del formulario de asesoramiento y del simulador:** sin tráfico medible,
  cualquier test de conversión es ruido. Ni copy, ni colores, ni campos del
  formulario. Se retomará cuando la métrica secundaria de GSC muestre volumen.
- **Simulador (lógica, fórmulas, isla React) y notificaciones push.**
- **Textos legales:** `LEGAL.titular`, `nif` y `domicilio` siguen con placeholder.
  Es un riesgo real (LSSI-CE) pero ningún agente puede resolverlo: requiere datos
  del titular. Bloqueado hasta que el propietario los aporte.
- **Link building externo:** no hay agente para ello y no se simula con
  directorios ni intercambios.

## Restricciones

### Permanentes (ningún agente puede eliminarlas ni relajarlas)
- Nicho YMYL: ninguna afirmación normativa sin fuente oficial (seg-social.es, boe.es)
- Señales EEAT intocables: autoría, credenciales del revisor, fechas de revisión
- Accesibilidad mínima WCAG AA — público objetivo de 50 a 65 años
- El sitio debe funcionar sin JavaScript
- Prohibidos los patrones oscuros en cualquier elemento de conversión

### Añadidas en este ciclo (también permanentes a partir de hoy)
- **Prohibido fabricar señales de confianza.** Ni credenciales, ni testimonios,
  ni contadores. `ASESORAMIENTO.socialProofCount` debe seguir reflejando un dato
  real (hoy 0); si no hay dato, se oculta.
- **Cero JavaScript nuevo en las páginas de blog y en las páginas nuevas.** Hoy
  los artículos no cargan ninguna isla; las páginas de silo y la del revisor
  deben ser HTML estático y funcionar con JS desactivado.
- **`npm run build` (incluye `astro check`) debe pasar.** Ningún cambio se
  publica con el build roto.
- No tocar `src/content/blog/**`, `scripts/calendario.json` ni `.github/**`.
- No romper `rehypeExternalLinks`: las fuentes oficiales del array `DOFOLLOW_HOSTS`
  siguen dofollow, el resto `nofollow`.
- Toda tarea debe declarar su criterio de éxito de forma **verificable sobre el
  repositorio o sobre `/dist`**, sin depender de datos de Search Console, mientras
  el CEO no tenga acceso a ellos. Un criterio que solo se puede juzgar con datos
  que nadie puede leer es un criterio mal formulado.

---

## Qué datos me faltaron para decidir mejor

1. **Search Console** — impresiones, clics, posición media y, sobre todo, informe
   de cobertura. Sin esto no sé si las 31 URLs están indexadas o si el problema
   real es de rastreo y no de autoridad. Es el dato que más habría cambiado el
   diagnóstico.
2. **GA4** — hay `GA_MEASUREMENT_ID = 'G-9K6WR2TR7M'` configurado, pero no tengo
   forma de leerlo desde este entorno: ni sesiones, ni rebote, ni scroll, ni
   clics en `data-ga-event="cta_asesoramiento"`. Por eso he descartado
   Relevancia y Conversión como cuello de botella por falta de datos, no por
   evidencia de que estén bien.
3. **Ahrefs / backlinks** — cero visibilidad sobre el perfil de enlaces y sobre
   las posiciones reales frente a los competidores del nicho.
4. **El sitio en producción** — `https://tujubilacionanticipada.com` devuelve 403
   a través del proxy de este entorno. No he podido comprobar que el despliegue
   funcione, ni medir LCP/CLS, ni ver el HTML renderizado.
5. **Leads reales** — cuántas solicitudes ha recibido `/api/contact` desde el
   lanzamiento. Es el único dato de negocio que existe y no está en el repo.

**Acción para el propietario antes del próximo ciclo:** dar al entorno acceso de
lectura a Search Console y GA4, o volcar un export a `scripts/datos/` con
impresiones, clics y posición por URL. Mientras no exista, todas las revisiones
del CEO seguirán marcadas como "a ciegas" y las hipótesis se juzgarán solo por
artefactos del build.
