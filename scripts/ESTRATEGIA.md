# Estrategia vigente — 2026-07-29

> **Revisión A CIEGAS en rendimiento.** No he podido acceder a Search Console,
> GA4 ni Ahrefs desde este entorno. La web en producción responde 403 al proxy,
> así que tampoco he podido auditar el HTML servido. Todo el diagnóstico se basa
> en el código del repositorio y en `scripts/calendario.json`. Ninguna afirmación
> sobre tráfico, posiciones o conversión de este documento está medida: donde
> supongo, lo digo.

## Diagnóstico del ciclo anterior

No hay ciclo anterior. `scripts/DECISIONES.md` está vacío y `BACKLOG.json` tiene
`ultima_replanificacion: null` y cero tareas. **No hay ninguna hipótesis que
evaluar: ni CONFIRMADA, ni REFUTADA. Este documento es la línea base.**

Lo que sí puedo dictaminar es el estado del activo:

**Lo que está bien construido (no tocar por tocar):**
- 31 artículos publicados desde el 2026-06-25, cadencia diaria sostenida.
  Quedan 29 programados hasta el 2026-08-25 (60 en total, 4 silos).
- Higiene EEAT de artículo: el **100 %** de los 31 `.mdx` lleva `reviewedBy` y
  `updatedDate`. La ficha "Revisado por" se renderiza y va al JSON-LD.
- JSON-LD serio y enlazado por `@id` (Organization, WebSite, BlogPosting,
  BreadcrumbList, FAQPage, WebApplication), canonical, sitemap filtrado,
  robots.txt coherente, Consent Mode v2 denegado por defecto.
- Enlazado interno automático dentro del artículo (`rehypeInlineBlocks`):
  lecturas recomendadas + 2 CTAs a `/asesoramiento`. Bien resuelto.

**Los tres defectos reales que he encontrado leyendo el código:**

1. **El sitio publica una norma derogada en sus páginas de más valor.**
   `1,875 % por trimestre` (voluntaria) y `1,625 % por trimestre` (forzosa)
   aparecen en `src/pages/index.astro:28`, `src/pages/simulador.astro:19,23`,
   `src/pages/asesoramiento.astro:166,182`, `src/components/charts/BarChart.astro`
   y son la **base del cálculo** de `src/components/Simulador.jsx:12-13`.
   Desde el RDL 21/2021 los coeficientes de la anticipada voluntaria son
   **mensuales y dependen de los años cotizados** (orden de magnitud 2,8 %–21 %
   según meses de adelanto y carrera; hay que verificarlo contra seg-social.es
   antes de escribir ninguna cifra). Además, el motor aplica una escala lineal
   inventada (50 % a los 15 años → 100 % a los 36) que no es la escala legal.
   Agravante: la cifra errónea del simulador va dentro de un **`FAQPage` JSON-LD**,
   es decir, se la estamos sirviendo a Google como dato estructurado.
   Esto viola nuestra propia restricción YMYL ("ninguna afirmación normativa sin
   fuente oficial") en la home, en el simulador y en la landing de conversión.

2. **El revisor no es una entidad verificable en ninguna parte.**
   `Javier Rodríguez — "Escalón 26, Seguridad Social"` firma la revisión de los
   31 artículos, pero no existe ficha de autor, ni `url`, ni `@id` estable, ni
   `sameAs`. `SOCIAL_PROFILES` está vacío, así que `Organization` tampoco tiene
   `sameAs`. En YMYL esto es una credencial afirmada y no evidenciada: aporta
   poco a Google y, si no puede documentarse, es un riesgo reputacional.

3. **60 artículos van a vivir en una lista plana.** Existen 4 silos declarados
   en `calendario.json` y en `src/content/config.ts`, pero **no hay ni una sola
   página de categoría**: solo `/blog`, `/blog/page/[n]` (6 por página → 10
   páginas) y `/blog/[slug]`. La `category` del artículo se pinta como texto, no
   enlaza a ningún sitio. Resultado: artículos a hasta ~10 clics de la home y
   cero páginas hub que acumulen relevancia temática.

**Aviso al responsable de contenido (fuera de mi alcance de edición):** el
calendario programa el artículo 59 (2026-08-24, `guia-completa-jubilacion-anticipada-2026`)
sobre la **misma keyword exacta** que el artículo 1, ya publicado
(`que-es-la-jubilacion-anticipada`, "jubilacion anticipada", 11.000/mes).
Es canibalización planificada del término cabeza. Hay que decidir antes del
24 de agosto cuál de los dos es la URL canónica para ese término.

## Cuello de botella prioritario

**AUTORIDAD.** El sitio tiene 31 artículos correctos y ninguna razón objetiva
para que Google lo prefiera a seg-social.es o a un medio con 15 años de dominio.

Descarto los otros tres de forma argumentada:
- *Visibilidad*: sí, presumo tráfico casi nulo — pero el dominio tiene **5
  semanas**. No hay palanca que compre antigüedad. Trabajar "visibilidad" ahora
  sería trabajar sobre una variable que no controlo.
- *Relevancia* y *Conversión*: sin tráfico medible, optimizar rebote o CTA es
  optimizar ruido. Además, con la landing de conversión afirmando un coeficiente
  derogado, tocar su persuasión antes que su exactitud sería exactamente el
  error que las restricciones YMYL existen para impedir.

La única palanca real de este ciclo es hacer que el sitio **merezca** posicionar
cuando pase la ventana de dominio nuevo: exactitud normativa demostrable,
identidad experta verificable y estructura temática. Eso es autoridad.

## Objetivo del ciclo

Antes del **2026-09-15**, que el sitio pase esta auditoría de autoridad, cuyas
cuatro condiciones son binarias y comprobables en el repo y en el build:

1. Cero cifras normativas sin enlace a fuente oficial (seg-social.es / boe.es)
   en las páginas que no son blog, incluido el motor del simulador y el JSON-LD.
2. El 100 % de los artículos publicados alcanzable en **≤ 2 clics** desde la home.
3. El 100 % de las fichas "Revisado por" enlaza a una ficha de persona con
   `Person` + `@id` + `url` en JSON-LD.
4. Existe en el repo una línea base real de Search Console
   (`scripts/datos/gsc-2026-09-15.csv` o equivalente: URLs, impresiones, clics,
   posición media). **Si el 15 de septiembre ese archivo no existe, la próxima
   revisión se declara de nuevo a ciegas y la causa es del titular, no de los
   agentes.**

## Líneas de trabajo (máximo 3, priorizadas)

1. **Auditar y corregir todos los parámetros normativos fuera del blog contra
   fuente oficial** — área principal: **seo** — porque publicamos una norma
   derogada en la home, en el simulador y en la landing de conversión, y la
   servimos además como dato estructurado.
   Alcance: `src/pages/index.astro`, `src/pages/simulador.astro`,
   `src/pages/asesoramiento.astro`, `src/components/Simulador.jsx`,
   `src/components/charts/BarChart.astro`, `src/consts.ts`.
   Falsable: (a) cero apariciones de "1,875 % / 1,625 % por trimestre" salvo
   marcadas explícitamente como régimen anterior; (b) cada cifra normativa
   visible lleva enlace a seg-social.es o boe.es; (c) el simulador aplica
   coeficientes **mensuales por tramo de años cotizados** y la escala legal de
   porcentaje sobre base reguladora vigente en 2026, no una interpolación lineal;
   (d) tres casos de prueba documentados (p. ej. 61/38/2.000 €, 63/35/1.500 €,
   64/33/2.500 €) con el resultado esperado según la tabla oficial y desviación
   ≤ 1 €; (e) el `FAQPage` de `/simulador` dice lo mismo que el motor.
   Si una cifra no puede verificarse en fuente oficial, **se elimina**; no se
   estima. Prohibido inventar tablas.

2. **Crear la arquitectura de silos del blog** — área principal: **seo** —
   porque 60 artículos en una lista paginada de 10 páginas no construyen ninguna
   página hub y entierran el contenido a ~10 clics.
   Alcance: nuevas rutas de categoría (4, una por silo de `BLOG_CATEGORIES`),
   `src/components/ArticleCard.astro`, `src/layouts/BlogPost.astro`,
   `src/pages/blog/index.astro`, `src/components/Footer.astro`.
   Falsable: (a) 4 URLs de categoría en `sitemap-0.xml`, indexables, con 200-400
   palabras de texto propio y no duplicado; (b) la `category` del artículo pasa
   a ser enlace al hub → enlace ascendente en el 100 % de los artículos;
   (c) todo artículo publicado a ≤ 2 clics desde `/` (medible recorriendo el
   `dist/`); (d) los hubs **no** optimizan el término exacto "jubilación
   anticipada": ese término queda reservado a la decisión de canonicalización
   pendiente entre los artículos 1 y 59; (e) `npm run build` verde.

3. **Convertir al revisor en una entidad verificable** — área principal: **seo** —
   porque en YMYL una credencial afirmada y no evidenciada no suma autoridad, y
   ahora mismo está afirmada 31 veces.
   Alcance: nueva ficha de persona, `src/lib/schema.ts`,
   `src/layouts/BlogPost.astro`, `src/consts.ts` (`SOCIAL_PROFILES`, `REVIEWERS`).
   Falsable: (a) la ficha existe, es indexable y describe experiencia y ámbito de
   revisión; (b) `BlogPosting.reviewedBy` referencia un `Person` con `@id` y `url`
   apuntando a esa ficha; (c) el 100 % de las fichas "Revisado por" enlaza allí;
   (d) `Organization.sameAs` deja de estar vacío.
   **Puerta de decisión, y es del titular, no del agente:** si no puede aportar
   dato verificable (perfil público, colegiación, trayectoria comprobable), la
   ficha se publica **solo con lo verificable** y el agente lo documenta en
   DECISIONES.md como carencia abierta. Está terminantemente prohibido redactar
   credenciales, años de experiencia o perfiles que no consten. Si resultara que
   la credencial no es sostenible, la decisión correcta es retirarla de los 60
   artículos, no adornarla.

## Fuera de alcance este ciclo

- **Contenido del blog** (`src/content/blog/**`) y `scripts/calendario.json`:
  ruta prohibida, los gestiona la routine de publicación diaria.
- **CI/CD** (`.github/**`) y cualquier rediseño visual.
- **CRO**: no se toca la persuasión de `/asesoramiento` (copy, prueba social,
  formulario, orden de secciones). Con tráfico no medido, cualquier "mejora" de
  conversión sería inatribuible. Cero tareas de área `cro` este ciclo, a
  propósito.
- **UX**: cero tareas de área `ux` este ciclo, salvo lo que arrastre la línea 2.
- Guía PDF / producto de pago, captura de email del simulador (`Simulador.jsx`
  tiene el bloque desactivado con `{false && ...}` y un `TODO`), notificaciones
  push y `CTAGuia`: siguen apagados. No reactivar.
- Datos legales del titular (`LEGAL.titular/nif/domicilio` son placeholders en
  `src/consts.ts`): requiere una decisión jurídica y datos reales del propietario.
  **Ningún agente debe rellenarlos inventando nada.** Queda registrado como
  riesgo abierto (LSSI-CE) para el titular.

## Restricciones

- **YMYL**: ninguna afirmación normativa sin fuente oficial (seg-social.es,
  boe.es) enlazada. Si no se puede verificar, se elimina; nunca se estima.
- **EEAT intocable**: autoría, credenciales del revisor y fechas de revisión no
  se borran ni se inventan. Solo se enriquecen con datos comprobables.
- **Accesibilidad mínima WCAG AA** — público de 50 a 65 años: contraste,
  tamaño de fuente base, foco visible, etiquetas de formulario, orden de
  tabulación. Ninguna tarea puede reducir el nivel actual.
- **El sitio debe funcionar sin JavaScript.** Prohibido introducir cualquier
  funcionalidad nueva dependiente de JS.
  *Deuda ya existente y documentada, NO resuelta este ciclo:* el formulario de
  `/asesoramiento` sólo envía por `fetch` (sin `action`/`method` de respaldo) y
  el simulador es una isla `client:load` sin `<noscript>`. Sin JS, la única vía
  de monetización del sitio está muerta. Entra en el backlog del próximo ciclo
  con prioridad alta; si la línea 1 obliga a tocar `Simulador.jsx`, el agente
  debe dejarlo **al menos igual de degradable**, nunca peor.
- **Sin patrones oscuros** en ningún elemento de conversión. `socialProofCount`
  sigue a 0 hasta que haya un número real; los avatares no son testimonios.
- **Velocidad**: no añadir dependencias de cliente nuevas ni fuentes/imágenes
  sin dimensionar. El sitio es estático; que lo siga siendo.
- `npm run build` (que incluye `astro check`) debe quedar en verde tras cada
  tarea. Sin build verde no hay push.

## Qué datos me faltaron para decidir mejor

Esta revisión es a ciegas en todo lo que importa de verdad. Me faltó:

1. **Google Search Console**: impresiones, clics, posición media y, sobre todo,
   **cobertura de indexación**. Ahora mismo no sé ni si las 31 URLs están
   indexadas. Si no lo estuvieran, el cuello de botella sería otro (Visibilidad
   técnica) y esta estrategia estaría mal dirigida. Es el dato más urgente.
2. **GA4** (`G-9K6WR2TR7M` está configurado): sesiones, páginas de entrada,
   rebote y los eventos ya instrumentados `simulador_calcular`,
   `cta_asesoramiento` y `generate_lead`. Sin ellos no sé si el simulador se usa
   ni si el formulario ha generado un solo lead.
3. **Ahrefs**: backlinks (sospecho cero), Domain Rating y qué dominios ocupan el
   top 10 de las keywords del calendario. Sin esto no puedo juzgar si la
   dificultad declarada (KD 0-12) es realista o si el SERP está copado por
   seg-social, bancos y grandes medios.
4. **Un Core Web Vitals real de campo** y el HTML servido en producción: el
   dominio devuelve 403 a este entorno, así que no he podido comprobar nada de
   lo que realmente ve Google.
5. **Confirmación del titular sobre el revisor**: qué credenciales de Javier
   Rodríguez son documentables públicamente. De esa respuesta depende la línea 3.

**Acción concreta para el titular antes de la próxima replanificación:** dejar en
`scripts/datos/` un export CSV de Search Console (últimos 28 días, por página y
por consulta) y otro de GA4. Sin eso, la revisión de septiembre volverá a ser a
ciegas y este documento seguirá siendo una hipótesis bien argumentada en lugar
de una decisión informada.
