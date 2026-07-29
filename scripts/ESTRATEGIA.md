# Estrategia vigente — 2026-07-29

> **REVISIÓN A CIEGAS.** No he tenido acceso a ningún dato de rendimiento real:
> el dominio en producción devuelve 403 a través del proxy de salida, no hay
> integración de Search Console en el entorno, y no dispongo de herramienta de
> Ahrefs invocable. Todo el diagnóstico que sigue se basa en **evidencia
> estructural del repositorio**, no en métricas. Ninguna afirmación de este
> documento sobre tráfico, posiciones o conversión debe darse por medida.
> Corregir esto es una de las tres líneas de trabajo del ciclo.

## Diagnóstico del ciclo anterior

Primer ciclo del sistema de mejora continua: `scripts/DECISIONES.md` está vacío y
`scripts/BACKLOG.json` tiene `ultima_replanificacion: null`. **No hay ninguna
hipótesis previa que evaluar.** En su lugar, diagnóstico del estado del activo.

**Qué es hoy el sitio (hechos verificados en el repo):**

- Astro 4 estático + Tailwind. 31 artículos publicados en `src/content/blog/`,
  del 2026-06-25 al 2026-07-27. **El sitio tiene cinco semanas de vida.**
- `scripts/calendario.json`: 60 artículos planificados, 31 publicados, 29
  pendientes hasta el 2026-08-25. 59 de 60 son de intención informacional.
  Cuatro silos declarados: S1 Tipos (10), S2 Cálculos y penalizaciones (15),
  S3 Planificación financiera (10), S4 Actualidad y casos prácticos (25).
- Longitud mediana de artículo: 2.034 palabras (mín. 1.439, máx. 2.224). Dentro
  del rango que el propio calendario exige (1.800–2.500). El contenido no es
  thin.
- Base técnica sólida: canonical en todas las páginas, sitemap con exclusión de
  legales y de `/blog/page/1`, robots.txt correcto, JSON-LD de Organization,
  WebSite, BlogPosting, Breadcrumb, FAQ y WebApplication, TOC automático,
  enlaces externos con dofollow reservado a fuentes oficiales (seg-social,
  BOE, SEPE, CNMV), caja "Revisado por" con foto y credencial, disclaimer YMYL
  reutilizable, banner de consentimiento con Consent Mode v2 y GA4 instalado
  (`G-9K6WR2TR7M`).

**Lo que está roto, y es grave:**

1. **La arquitectura interna no existe.** 23 de los 31 artículos publicados no
   contienen **ni un solo enlace interno** a otro artículo en su cuerpo. El
   enlazado que hay es automático y topológicamente aleatorio: el plugin
   `rehypeInlineBlocks` (`src/lib/rehype-plugins.mjs`) inserta las "lecturas
   recomendadas" tomando siempre `others[0]` y `others[1]` del índice global de
   posts —las dos primeras entradas que devuelve `readdirSync`—, **sin ninguna
   relación con el tema del artículo**. `RelatedArticles.astro` completa por
   categoría y, si falta, por recencia. Resultado: 31 páginas que en la práctica
   apuntan casi todas a los mismos dos destinos, elegidos por orden de fichero.
2. **Los cuatro silos del calendario no existen en el sitio.** `src/pages/`
   contiene `blog/index`, `blog/page/[page]` y `blog/[slug]`. **No hay páginas de
   categoría.** El campo `category` del frontmatter se pinta como texto muerto
   en la cabecera del artículo, sin enlace. Se ha planificado un contenido en
   silos y se ha publicado como un blog plano paginado.
3. **La entidad editorial no es identificable.** `src/consts.ts` publica en
   producción `titular: '[TITULAR — nombre y apellidos o razón social]'`,
   `nif: '[NIF/CIF]'` y `domicilio: '[DOMICILIO A EFECTOS DE NOTIFICACIONES]'`.
   Es decir: las páginas legales de un sitio YMYL que recoge nombre, teléfono y
   email mediante formulario **muestran marcadores de posición donde debe ir el
   responsable del tratamiento**. Además: `SOCIAL_PROFILES` está vacío (el
   `sameAs` de Organization no existe), el `author` de los artículos es la
   cadena `"tujubilacionanticipada.com"` —no una persona—, y el revisor
   "Javier Rodríguez" aparece con credencial pero **sin página de perfil ni
   entidad `Person` en el JSON-LD**. `/sobre-este-sitio` dice "elaborado por la
   redacción" sin nombrar a nadie.
4. **Deuda que contamina cualquier medición futura.** El prompt de
   notificaciones push (`NotificationsPrompt.astro`) es un diálogo fijo que se
   dispara por temporizador sobre la primera visita, y puede solaparse con el
   banner de cookies, a un público de 50–65 años que llega frío desde búsqueda.
   El simulador —CTA principal de la home— es una isla React `client:load` sin
   `<noscript>`: **hoy el sitio no cumple su propia restricción de funcionar sin
   JavaScript** en su página de producto.
5. **Sólo hay un camino de conversión** (`/asesoramiento`, formulario de 4
   campos obligatorios con teléfono). `socialProofCount` está a 0, lo cual es
   correcto y honesto. La guía de 29 € está deshabilitada. No hay display ni
   afiliación. Con cinco semanas de vida esto no es un problema todavía.

## Cuello de botella prioritario

**Autoridad.**

Descarto los otros tres con argumento, no por descarte cómodo:

- *Visibilidad* es el síntoma, no la causa, y además está fuera de mi control:
  la routine de publicación diaria ya inyecta 29 artículos más hasta el 25 de
  agosto. Añadir más contenido a una estructura que no consolida el que ya hay
  es multiplicar el problema.
- *Relevancia* no puedo evaluarla: no tengo tasa de rebote ni tiempo en página.
  La evidencia indirecta (2.000 palabras de media, TOC, fuentes oficiales,
  keywords de KD 0–12 correctamente mapeadas) no sugiere un problema de encaje
  entre intención y contenido.
- *Conversión* es prematuro. Optimizar un embudo sobre un tráfico que no sé si
  existe es la definición de trabajo desperdiciado.

El cuello de botella es autoridad porque el sitio tiene **el contenido correcto
sin ninguna señal que le diga a Google qué es este dominio ni quién responde
por él**, en el nicho YMYL más duro que hay en España después del médico. Dos
carencias concretas y arreglables desde el repositorio: (a) 31 páginas
huérfanas sin clusters temáticos ni hubs que las consoliden, con un enlazado
interno decidido por orden alfabético de fichero; (b) una entidad editorial
que en sus páginas legales dice literalmente `[TITULAR]`. Ninguna cantidad de
artículos nuevos compensa eso.

## Objetivo del ciclo

**Antes del 2026-08-26** (día siguiente al cierre del calendario editorial
actual), convertir el blog plano de 60 artículos en **cuatro clusters temáticos
navegables con entidad editorial verificable**, con esta definición de hecho —
las tres condiciones son falsables por inspección del repo o del build:

1. Existen 4 páginas hub (una por silo) indexables, en el sitemap y enlazadas
   desde la navegación; el `category` de cada artículo enlaza a su hub.
2. Ningún artículo publicado recibe menos de **3 enlaces internos entrantes
   desde artículos de su misma categoría**, y ningún bloque de "lectura
   recomendada" se elige por posición en el índice de ficheros.
3. `grep -c "\[TITULAR\|\[NIF\|\[DOMICILIO" src/consts.ts` devuelve **0**, y
   existe una página de perfil del revisor con JSON-LD `Person` enlazada desde
   cada caja "Revisado por".

Más una condición de proceso: **la próxima replanificación no puede volver a
ser a ciegas** (ver línea 3).

## Líneas de trabajo (máximo 3, priorizadas)

### 1. Silos reales: hubs de categoría y enlazado interno semántico — área: seo

El calendario define cuatro silos; el sitio no los materializa. Hay que crear
`src/pages/blog/categoria/[categoria].astro` con las cuatro categorías de
`src/content/config.ts`, enlazarlas desde `Header.astro`/`Footer.astro` y desde
el eyebrow de categoría de `BlogPost.astro`, y reescribir la selección de
`rehypeInlineBlocks` en `src/lib/rehype-plugins.mjs` y de
`RelatedArticles.astro` para que elijan por **categoría y tags compartidos**,
no por posición de fichero ni por recencia.

Restricción de ejecución que hace esta línea viable: `src/content/blog/**` es
ruta prohibida, así que **la solución debe ser de plantilla y de plugin, nunca
de edición de MDX**. Es precisamente por eso que es la línea nº 1: es el único
arreglo de enlazado interno que se puede hacer sin tocar el contenido.

Falsable: (a) 4 hubs con `<title>`, description, canonical y JSON-LD
`CollectionPage` presentes en `dist/`; (b) script de verificación que cuente
enlaces internos entrantes por slug y que ninguno baje de 3 dentro de su
categoría; (c) `others[0]`/`others[1]` desaparece del plugin.

### 2. Responsable identificable y entidad de autoría — área: seo

Sin esto, un sitio YMYL de pensiones es indefendible ante un quality rater y
frágil ante la AEPD. Tres entregables: (a) eliminar los marcadores
`[TITULAR]`, `[NIF/CIF]`, `[DOMICILIO]` de `src/consts.ts`; (b) página de perfil
del revisor (`/equipo/javier-rodriguez` o similar) con biografía, credencial
—"Escalón 26, Seguridad Social"— y JSON-LD `Person` con `jobTitle` y
`knowsAbout`, enlazada desde la caja "Revisado por" de `BlogPost.astro` y desde
`/sobre-este-sitio`; (c) `author` del JSON-LD de artículo resolviendo a una
entidad real en lugar de a la cadena `"tujubilacionanticipada.com"`.

**Bloqueo declarado:** los datos de (a) son una decisión del propietario, no de
un agente. Ningún ejecutor puede inventarlos. Si al llegar la tarea los datos
no están disponibles, la tarea se marca como bloqueada y se escala — no se
rellena con datos plausibles.

Falsable: el `grep` del objetivo devuelve 0; la página de perfil existe y valida
en el Rich Results Test; `sameAs` de Organization deja de ser un array vacío o
se documenta por qué sigue estándolo.

### 3. Instrumentación: baseline medible y primera visita limpia — área: cro

Este documento lleva un aviso de "revisión a ciegas" en la cabecera. Si el
próximo ciclo lo lleva también, el sistema de mejora continua no está mejorando
nada, está adivinando. Entregables: (a) un `scripts/METRICAS.md` con baseline de
Search Console por URL (impresiones, clics, posición media, CTR) a fecha de
cierre del ciclo, y la vía por la que se obtiene de forma repetible; (b)
eventos GA4 más allá de `cta_asesoramiento`/`generate_lead`: inicio de
simulación, resultado de simulación, scroll al 75 % del artículo, clic a hub de
categoría; (c) retirar el prompt de push de la primera visita —condicionarlo a
visitante recurrente o eliminarlo— porque hoy pide permiso de notificaciones a
un usuario de 60 años que acaba de llegar de Google, encima del banner de
cookies; (d) `<noscript>` funcional en `/simulador` que, como mínimo, explique
el cálculo y enlace al simulador oficial de la Seguridad Social.

Falsable: existe `scripts/METRICAS.md` con cifras y fecha; los cuatro eventos
aparecen en el código; el prompt de push no se dispara en la primera sesión;
`/simulador` con JS desactivado muestra contenido útil en lugar de un hueco.

## Fuera de alcance este ciclo

- **Contenido del blog y calendario editorial.** `src/content/blog/**` y
  `scripts/calendario.json` son rutas prohibidas. No se reescribe, reordena ni
  actualiza ningún artículo. Lo gestiona la routine de publicación de las 08:00.
- **`.github/**` y pipeline de CI/CD.**
- **Rediseño visual.** Paleta, tipografía, retícula y componentes de marca se
  quedan como están. Nada de este ciclo justifica tocarlos.
- **La guía PDF de 29 €** y cualquier producto de pago. Sigue oculta. No se
  reactiva mientras no haya tráfico que la valide.
- **Display advertising y afiliación.** Introducir AdSense ahora degradaría
  Core Web Vitals y las señales EEAT a cambio de ingresos irrelevantes con el
  volumen actual. Se reevalúa cuando exista baseline.
- **Link building externo, notas de prensa y redes sociales.** Primero entidad
  propia identificable (línea 2); construir enlaces hacia un `[TITULAR]` es
  tirar el presupuesto.
- **Nuevas calculadoras o herramientas.** El simulador existente debe funcionar
  bien antes de añadir un segundo.
- **Optimización del formulario de `/asesoramiento`** (campos, copy, prueba
  social). Es trabajo de conversión y el cuello de botella no es ese.

## Restricciones permanentes

- Nicho YMYL: ninguna afirmación normativa sin fuente oficial (seg-social.es,
  boe.es, sepe.es, inclusion.gob.es).
- Señales EEAT intocables: autoría, credenciales del revisor, fechas de revisión
  y el bloque "Revisado por". Ampliar sí, degradar o eliminar nunca.
- Accesibilidad mínima WCAG AA — público objetivo de 50 a 65 años. En concreto:
  contraste ≥ 4.5:1 en texto, cuerpo ≥ 18 px en artículo, área táctil ≥ 44 px,
  foco visible, y ningún diálogo que tape el contenido sin cierre accesible por
  teclado.
- El sitio debe funcionar sin JavaScript. Ninguna isla `client:load` nueva; la
  única existente (`Simulador.jsx`) debe tener alternativa sin JS.
- Prohibidos los patrones oscuros en cualquier elemento de conversión.
- **Prohibido inventar datos.** Ni identidad legal, ni credenciales, ni prueba
  social, ni testimonios, ni cifras de usuarios. `socialProofCount` permanece en
  0 hasta que exista un dato real y verificable. Si a un agente le falta un dato
  para completar una tarea, la marca como bloqueada y la escala.
- Ningún cambio se publica sin que `npm run build` pase. Ninguna página nueva
  sin `title`, `description`, canonical y JSON-LD coherente.
- Los disclaimers de carácter orientativo del simulador y de los artículos no se
  suavizan ni se mueven fuera del viewport por razones de conversión.

## Qué datos me faltaron para decidir mejor

Esta decisión se ha tomado sin ninguna métrica. Lo que necesitaba y no tuve:

1. **Search Console**: impresiones, clics, CTR y posición media por URL y por
   consulta desde el 2026-06-25. Sin esto no sé si el problema es que Google no
   indexa, indexa y no posiciona, o posiciona y nadie hace clic — que son tres
   diagnósticos distintos con tres soluciones distintas.
2. **Estado de indexación**: cuántas de las 31 URLs están realmente indexadas y
   si el sitemap se está leyendo. Ni siquiera pude confirmar que el dominio
   responda (403 del proxy).
3. **GA4**: sesiones, fuente/medio, tasa de rebote por plantilla y si el evento
   `generate_lead` se ha disparado alguna vez. El ID está instalado; no sé si
   recoge datos.
4. **Perfil de enlaces y autoridad de dominio** (Ahrefs o equivalente), y qué
   compiten en el SERP de "jubilación anticipada" —presumiblemente
   seg-social.es, bancos y grandes medios—, para calibrar si el objetivo
   realista es la cola larga o la cabeza.
5. **Core Web Vitals de campo**. Con fuentes de Google Fonts sin
   `preload`/self-host y una isla React en la página de producto, el LCP y el
   INP en móvil son una incógnita relevante para un público de 50–65 años.
6. **Modelo de negocio explícito**: "monetización por tráfico orgánico" no dice
   si el ingreso viene de leads de asesoramiento, display o producto propio.
   Los tres implican estrategias de contenido distintas. Lo asumo como lead gen
   hacia `/asesoramiento` porque es el único embudo activo en el código.

**Acción derivada:** la línea de trabajo 3 existe para que esta sección sea más
corta en la próxima replanificación. Si al cerrar el ciclo sigue habiendo un
aviso de "revisión a ciegas" en la cabecera de este documento, la línea 3 se
declara REFUTADA y pasa a ser prioridad 1 del ciclo siguiente.
