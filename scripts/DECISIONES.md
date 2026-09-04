# Registro de decisiones — mejora continua

Cada entrada la escribe el orquestador tras ejecutar una tarea. El CEO lee este
archivo para evaluar hipótesis en la siguiente replanificación.

Formato:

```
## [fecha] — [id] [título] (área)
- Archivos: ...
- Qué: ...
- Por qué: ...
- Hipótesis: ...
- Criterio de éxito: ...
- Métrica y plazo: ...
- Commit: [sha]
- Veredicto del CEO: pendiente
```

---

## 2026-08-26 — estrategia-002 Replanificación forzada de producto: definición del Informe de Fecha Óptima (cro) — ENCARGO DEL PROPIETARIO
- Archivos: scripts/ESTRATEGIA.md (reescrita la estrategia vigente; la sección "Encargos del propietario" E-1 a E-4 se conserva literal), scripts/DECISIONES.md
- Qué: Replanificación fuera de ciclo activada por `config.replanificacion_forzada` de scripts/BACKLOG.json (foco "producto", encargo del 2026-08-24). El CEO no reabre el QUÉ (fijado en E-1) y decide el CÓMO. Decisiones tomadas, todas cerradas y sin "habría que valorar": (1) **Producto**: "Informe de Fecha Óptima de Jubilación", PDF paginado generado desde src/lib/pension-calculo.ts. (2) **Precio**: 49,00 € IVA incluido, pago único (40,50 € base + 8,50 € IVA); neto ≈ 39,51 € tras comisión de pasarela; renovación voluntaria a 19,00 € a partir del mes 13. El techo de 49 € lo fija E-2: sin credenciales verificables ni testimonios, un precio mayor exigiría señales de confianza que está prohibido fabricar. (3) **Pasarela**: Stripe Checkout hospedado, modo `payment`, tarjeta + **Bizum** (soportado por Stripe desde 2026; 38 % de los compradores españoles lo prefieren), 1,5 % + 0,25 € en tarjeta EEA, con `invoice_creation` + Stripe Tax para emitir la factura sola. Descartados Paddle/Lemon Squeezy (~5 % + 0,50 €): todos los compradores son consumidores españoles, no hay problema de OSS que un merchant of record resuelva. (4) **Entrega automática**: formulario nativo → `api/informe-crear.ts` (precheck + Redis + sesión de Stripe) → 303 a Checkout → webhook firmado e idempotente `api/informe-webhook.ts` → PDF con @react-pdf/renderer en función serverless TypeScript (importa el motor, prohibido duplicarlo) → email con Resend + descarga en /informe/gracias; reemisión firmada con HMAC durante 12 meses. Compromiso: descarga <60 s, email <5 min, devolución automática si no se entrega en 24 h. (5) **Captura de datos**: página nueva `/informe` con 6 campos (fecha de nacimiento, periodo cotizado en años y meses, base reguladora, modalidad accesible, si seguirá cotizando, email) más dos casillas separadas y desmarcadas (RGPD y avisos normativos); nombre y dirección los pide Stripe para la factura. (6) **Precheck gratuito que impide la venta**: si el motor determina que el caso no accede a ninguna modalidad anticipada (35/33 años, art. 205.1.b), art. 208.1.c)), no se crea sesión de pago y se muestra gratis qué le falta y cuándo lo cumpliría. (7) **Recompra**: 12 meses de reemisiones gratuitas ilimitadas + aviso por email cuando el informe caduca (revalorización de enero y cambio del calendario de la DT 7.ª el 1-1-2027: 65 años con 38 años y 6 meses, 67 con menos, frente a 38 años y 3 meses / 66 años y 10 meses en 2026) + recompra voluntaria a 19 €. Sin renovación automática, sin cuenta atrás, sin cargo recurrente. (8) **Los 2 leads existentes**: informe gratis y una única pregunta de feedback; no se les pide testimonio publicable. (9) **Vía hacia entidades financieras**: aplazada con condición explícita de reapertura (≥25 informes vendidos + destinatario nombrado + verificación profesional de si es actividad regulada).
- Por qué: Con el export real de Search Console ya en scripts/datos/ (346 clics, 20.526 impresiones, posición media 11,2 entre el 1-jul y el 24-ago), el diagnóstico es que entra tráfico cualificado de intención personal ("jubilarse a los 55 con 30 años cotizados" en posición 3,7) y no existe ningún mecanismo por el que ese visitante pueda pagar. Nueve ciclos de arquitectura SEO han producido un sitio correcto y comercialmente inerte: 0 € facturados, 2 leads. El cuello de botella pasa de Autoridad a **Conversión**, entendida como construir pasarela, generador y entrega, no como tests A/B (con ~190 clics/mes no hay potencia estadística y siguen prohibidos).
- Hipótesis: Si existe un informe personalizado de 49 € entregado automáticamente desde el motor ya verificado contra el BOE, el tráfico de intención personal que hoy llega y se va sin hacer nada convierte a una tasa medible, con coste marginal de 0,99 € y **cero minutos de persona por venta**, de modo que el ingreso escala con el tráfico sin añadir trabajo.
- Criterio de éxito: los 4 del "Objetivo del ciclo" de ESTRATEGIA.md, con fecha 2026-09-30 — (a) ≥1 compra completada en Stripe **modo live** por 49,00 € entregada en <5 min sin intervención humana; (b) `node scripts/verificar-informe.mjs` en verde sobre ≥20 casos, con 0 cifras normativas escritas a mano en la plantilla; (c) una compra completa en **modo test** ejecutada por un agente con la traza pegada en este archivo y **JavaScript desactivado** en todo el tramo del dominio propio; (d) `node scripts/auditar-money-set.mjs` con /simulador en ≥1.200 palabras (hoy 71) y 0 pares canibalizados. Hoy el marcador es 0 de 4.
- Métrica y plazo: `node scripts/verificar-informe.mjs` (a crear en la Línea 1), `node scripts/verificar-motor.mjs` y `node scripts/auditar-money-set.mjs` tras `npm run build`. La parte live la anota el propietario en este archivo con el ID de sesión de Stripe y el timestamp de entrega de Resend. Plazo: 2026-09-30.
- Líneas de trabajo abiertas: 1) generador del PDF + su verificador (ux); 2) circuito de venta completo captura→precheck→cobro→entrega→reemisión (cro); 3) /simulador como documento competitivo y puerta de entrada al informe (seo), que **absorbe y reordena** seo-019, seo-020, seo-022, ux-003 y ux-004 sin reinventarlas.
- Bloqueo crítico heredado, cuarta petición al propietario: `LEGAL.titular`, `nif` y `domicilio` de src/consts.ts siguen con marcadores. Sin ellos no hay cuenta de Stripe, no hay factura y sigue incumpliéndose el art. 10 LSSI-CE. Es la única dependencia de este ciclo que ningún agente puede resolver.
- Veredicto del CEO: n/a (entrada del propio CEO). Los veredictos de las tareas seo-012 a seo-021, normativa-001 y legal-001 están en la tabla del "Diagnóstico del ciclo anterior" de scripts/ESTRATEGIA.md.

## 2026-08-24 — normativa-001 Corregir el motor de cálculo del simulador con fuentes oficiales (seo/producto) — ENCARGO DEL PROPIETARIO
- Archivos: src/lib/pension-calculo.ts, src/components/Simulador.jsx, src/pages/simulador.astro, src/pages/asesoramiento.astro
- Qué: Reescrito el motor con normativa vigente verificada contra el BOE. (1) Edad ordinaria 2026 (DT 7.ª LGSS): 65 años con 38 años y 3 meses cotizados o más, 66 años y 10 meses con menos — antes 66 años y 8 meses (valor de 2025) y umbral 38,5. (2) Sustituido el porcentaje FIJO por trimestre (1,875 % / 1,625 %), derogado desde el 1-1-2022 por la Ley 21/2021, por las tablas MENSUALES completas de los arts. 208.2 (24 filas) y 207.2 (48 filas) LGSS, cada una con sus 4 tramos de periodo cotizado. (3) porcentajePension() implementa el art. 210.1 con la escala de la DT 9.ª para 2023-2026 (0,21 % los 49 primeros meses, 0,19 % los 209 siguientes; 100 % a los 36 años y 6 meses) en vez de una interpolación lineal inventada 50→100 % entre 15 y 36 años. (4) Tope máximo actualizado a 3.359,60 €/mes (art. 3 RD 241/2026) desde 3.267,60 € (2025), y añadidas las mínimas del anexo I para el requisito del art. 208.1.c). Corregidas además las 3 FAQ de /simulador y el copy y el gráfico de /asesoramiento, que publicaban el sistema derogado.
- Por qué: Los agentes de seo-018/019/020 detectaron el riesgo y pararon correctamente (restricción YMYL: no se corrige normativa por iniciativa propia). El propietario autorizó la corrección el 2026-08-24 con la instrucción de usar solo referencias oficiales actualizadas.
- Hipótesis: Con el motor alineado con la norma vigente, /simulador puede publicar escenarios y tablas estáticas indexables sin riesgo de publicar un dato falso en un sitio YMYL, que era lo único que bloqueaba la Línea 3.
- Criterio de éxito: `npm run build` en verde (83 páginas) y ninguna cifra del módulo sin su artículo de la norma citado en el código. Cumplido.
- Métrica y plazo: `node scripts/auditar-normativa.mjs` (nuevo) sobre src/content/blog; `node scripts/auditar-money-set.mjs` tras el build.
- Fuentes: LGSS consolidada (BOE-A-2015-11724, arts. 207, 208, 209, 210, DT 7.ª, DT 9.ª, DT 40.ª) y RD 241/2026 (BOE-A-2026-6977, arts. 3 y 6 y anexo I).
- Veredicto del CEO: pendiente

## 2026-08-24 — seo-014 (reintento) Emitir canonical hacia la URL consolidada (seo)
- Archivos: src/lib/canonical-map.ts, src/layouts/BlogPost.astro, src/layouts/Base.astro, src/components/BaseHead.astro
- Qué: Corregida la causa raíz del fallo del 2026-08-18: REPO_ROOT se derivaba de import.meta.url y, al empaquetar Vite el módulo dentro de dist/pages/, resolvía a dist/. Ahora parte de process.cwd() y sube hasta encontrar scripts/calendario.json. Con eso, BlogPost.astro consulta getCanonicalSlug() y propaga canonicalPath a Base.astro y BaseHead.astro.
- Por qué: seo-017 dejó el JSON-LD apuntando al canónico mientras el <link rel="canonical"> seguía autorreferente: una contradicción entre dos señales de la misma página.
- Criterio de éxito: verificado sobre /dist — novedades-2026 emite canonical hacia cambios-2026, cambios-2026 sigue autorreferente, ninguna recibe noindex, novedades-2026 no está en sitemap-0.xml, los artículos no consolidados se autorreferencian. Cumplido.
- Métrica y plazo: grep de <link rel="canonical"> en ambos HTML de /dist.
- Veredicto del CEO: pendiente

## 2026-08-24 — contenido-001 Reenfoque del artículo #59 y ampliación del calendario (contenido) — ENCARGO DEL PROPIETARIO
- Archivos: scripts/calendario.json, scripts/actualizaciones.json (nuevo), scripts/auditar-normativa.mjs (nuevo), ROUTINE_PROMPT.md, scripts/PROMPT_REDACTOR.md, scripts/PROMPT_VERIFICADOR.md
- Qué: El #59 (guia-completa-jubilacion-anticipada-2026) declaraba la keyword exacta del #1, ya publicado, y entraba el 2026-08-24; reenfocado a "Jubilarse a los 61 años" (slug jubilarse-61-anos). Añadidos los artículos 61-68 (26 ago – 2 sep) siguiendo el patrón de caso concreto. Creada la cola scripts/actualizaciones.json, priorizada por gravedad normativa y por clics/impresiones reales de Search Console, y añadido a la routine diaria un Paso 4 bis que aplica una actualización por ejecución. Por encargo del propietario, las 28 entradas iniciales NO se dejaron en cola: se corrigieron todas el mismo día. Alcance real de la corrección: reescrita entera la sección de coeficientes del artículo pilar que-es-la-jubilacion-anticipada (18 apariciones del sistema derogado, tablas y dos ejemplos numéricos recalculados y verificados contra src/lib/pension-calculo.ts); corregida la confusión sistemática de jubilarse-63-anos entre el umbral de edad ordinaria (38 años y 3 meses) y el primer corte de los tramos de coeficientes (38 años y 6 meses), que invalidaba su tesis central y omitía el tramo A de su tabla; actualizada la edad ordinaria de 2026 y recalculados los ejemplos en autonomos, funcionarios, mineros, trabajadores-mar, profesiones-riesgo, discapacidad, enfermedades, involuntaria, pension-contributiva y pension-minima-15-anos-cotizados; y sustituido el modelo por trimestres en transportistas, jubilarse-55-anos-30-cotizados, voluntaria-requisitos-penalizaciones, gap-economico y reforma-pensiones-bono-cotizacion. De paso se detectó y corrigió un error no previsto: pension-minima-15-anos-cotizados daba la cuantía mínima de "cónyuge no a cargo" (11.590,60 €/año) como si fuera la de unidad económica unipersonal para menores de 65 (12.262,60 €/año, anexo I del RD 241/2026).
- Por qué: El export real de Search Console muestra que las consultas de caso concreto rankean entre las posiciones 3 y 9 mientras las head siguen entre la 30 y la 60; y que 26 artículos publicados contienen cifras normativas derogadas.
- Hipótesis: Alternar contenido nuevo de caso concreto con corrección sistemática de lo publicado sube el CTR del conjunto sin abrir URLs que compitan entre sí.
- Criterio de éxito: `node scripts/auditar-normativa.mjs` en 0 incidencias de gravedad alta y media. Cumplido el mismo 2026-08-24 (quedan 17 de gravedad baja, todas menciones al sistema derogado que los artículos explican correctamente como anterior).
- Métrica y plazo: nuevo export de Search Console en scripts/datos/ y comparación de clics y posición media por URL corregida.
- Veredicto del CEO: pendiente

## 2026-08-24 — legal-001 Datos identificativos del titular y formulario sin JavaScript (legal/ux) — ENCARGO DEL PROPIETARIO
- Archivos: src/consts.ts, src/pages/aviso-legal.astro, src/pages/privacidad.astro, src/pages/asesoramiento.astro, src/pages/asesoramiento/gracias.astro (nuevo), src/pages/asesoramiento/error.astro (nuevo), api/contact.js
- Qué: Construido el bloque de identificación del art. 10 LSSI-CE en el aviso legal y el de responsable del tratamiento en la política de privacidad, que hasta hoy no mostraban ningún dato identificativo. Los datos reales NO se publican todavía por decisión del propietario: LEGAL.titular, nif y domicilio conservan sus marcadores y el nuevo helper src/lib/legal.ts hace que las páginas caigan al texto genérico mientras sea así. En cuanto se rellenen los tres campos en src/consts.ts, el bloque aparece solo, sin tocar ninguna página. El formulario de /asesoramiento pasa a tener method="post" y action="/api/contact" y pierde el novalidate, y api/contact.js detecta el envío nativo (no JSON) y responde con un 303 a /asesoramiento/gracias o /asesoramiento/error en vez de con JSON que el navegador mostraría como texto plano. El envío por fetch sigue funcionando igual.
- Por qué: El riesgo LSSI-CE llevaba tres ciclos bloqueado en el propietario; queda ahora a un solo cambio de tres constantes. Y la restricción permanente "el sitio debe funcionar sin JavaScript" tenía el formulario como mitad pendiente, con plazo 2026-09-14.
- Criterio de éxito: ningún marcador entre corchetes llega a /dist y el bloque de identificación se activa solo cuando los tres campos están rellenos; dist/asesoramiento/index.html contiene un <form method="post" action="/api/contact">; existen /asesoramiento/gracias y /asesoramiento/error con noindex. Cumplido.
- Métrica y plazo: verificación estructural sobre /dist (inmediata).
- Veredicto del CEO: pendiente

## 2026-07-29 — seo-001 Crear helper de slugs de categoría (silos) como fuente única de verdad (seo)
- Archivos: src/lib/categories.ts (nuevo)
- Qué: Módulo con mapeo explícito y tipado de las 4 BLOG_CATEGORIES a su slug kebab-case, con getCategorySlug() y getCategoryFromSlug(). No se consume aún desde ninguna página.
- Por qué: Sin una fuente única de verdad, cada página futura (silos, breadcrumb, enlaces desde home/blog) inventaría su propio slugify, arriesgando slugs inconsistentes entre implementaciones.
- Hipótesis: Centralizar el mapping nombre→slug hace que todas las páginas de silo, breadcrumb y enlaces usen siempre el mismo slug.
- Criterio de éxito: getCategorySlug() devuelve los 3 slugs exactos exigidos; `npm run build` pasa sin que nada consuma aún el helper. Cumplido.
- Métrica y plazo: Verificación estructural inmediata (no hay métrica de tráfico hasta que se consuma en tareas futuras).
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-07-29 — seo-002 Crear las páginas de silo /blog/categoria/<slug> para categorías con ≥3 artículos (seo)
- Archivos: src/pages/blog/categoria/[categoria].astro (nuevo)
- Qué: Página dinámica Astro que genera un hub por categoría con ≥3 artículos publicados (Tipos, Cálculos, Planificación), listado completo sin paginar, JSON-LD CollectionPage + BreadcrumbList, reutilizando getCategorySlug (seo-001), getPublishedPosts, BlogListing y schema.ts existentes.
- Por qué: Hoy el único listado es /blog paginado de 6 en 6; la agrupación temática solo existe en frontmatter, invisible para el rastreo.
- Hipótesis: Publicar una página estática por silo permite a Google rastrear la estructura temática del sitio.
- Criterio de éxito: Existen exactamente las 3 páginas de silo esperadas, no existe la de "actualidad-y-casos-practicos" (0 artículos), cada una con CollectionPage+BreadcrumbList y listado completo. Cumplido y verificado (build, grep, sitemap).
- Métrica y plazo: Indexación de las 3 URLs en GSC a 21 días; impresiones/clics segmentados a 21-30 días.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-03 — seo-003 Enlazar los 3 hubs de silo desde el listado /blog (seo)
- Archivos: src/pages/blog/index.astro
- Qué: Bloque "Explora por categoría" fuera del listado de artículos, con un <a href="/blog/categoria/<slug>"> por cada silo con ≥3 posts publicados, usando getCategorySlug() (seo-001).
- Por qué: /blog solo ofrecía paginación por fecha (6 en 6) sin acceso por categoría, aumentando la profundidad de clics hasta artículos antiguos.
- Hipótesis: Un enlace directo a cada hub de silo desde /blog reduce la profundidad de clics hasta cualquier artículo del silo.
- Criterio de éxito: Las 3 rutas de silo publicado aparecen en /dist/blog/index.html fuera del listado; `npm run build` pasa. Cumplido y verificado (build, grep).
- Métrica y plazo: Comparación en GSC de profundidad de rastreo/impresiones de los 3 silos a 21 días.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-03 — seo-004 Enlazar los 3 hubs de silo desde la home (seo)
- Archivos: src/pages/index.astro
- Qué: Sección "Explora por categoría" en la home con un enlace por cada silo con ≥3 posts publicados (mismo umbral y helper que seo-002/seo-003).
- Por qué: La home solo enlazaba a /blog y a los 3 últimos artículos; un artículo antiguo podía quedar a varios saltos de la home.
- Hipótesis: Enlazar los 3 silos desde la home deja cualquiera de las 31 URLs de artículo a ≤2 clics de '/'.
- Criterio de éxito: Las 3 rutas de silo aparecen en /dist/index.html; ruta home→silo→artículo verificada en ≤2 saltos para el artículo más antiguo. Cumplido y verificado (build, grep, comprobación manual).
- Métrica y plazo: Comparación en GSC de páginas indexadas/profundidad de clic a 21-28 días.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-04 — ux-001 Convertir la categoría del artículo en un enlace visible a su silo (ux)
- Archivos: src/layouts/BlogPost.astro
- Qué: El eyebrow de categoría de la cabecera del artículo ahora envuelve el texto en `<a href="/blog/categoria/<slug>">` usando getCategorySlug() (seo-001), solo cuando la categoría tiene silo (≥3 posts publicados, mismo umbral que [categoria].astro). Enlace sin JS, contraste AA.
- Por qué: El texto de categoría era plano, sin salida lateral; cada artículo carecía de enlace saliente a su silo.
- Hipótesis: Convertir la categoría en enlace al silo mejora la orientación del lector y da a cada artículo ≥1 enlace saliente a su silo.
- Criterio de éxito: En /dist/blog/*/index.html el texto de categoría es un `<a href="/blog/categoria/<slug-correcto>">` dentro del header. Cumplido: 35/35 artículos de categorías con silo; los 2 de "Actualidad y casos prácticos" (2 posts) sin enlace por diseño (evita 404).
- Métrica y plazo: GSC/analítica a 30 días — CTR de navegación blog→silo y páginas por sesión de usuarios que entran a un artículo desde buscadores.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-04 — seo-006 Crear la página de entidad del revisor /equipo/javier-rodriguez (seo)
- Archivos: src/pages/equipo/javier-rodriguez.astro (nuevo), src/lib/schema.ts
- Qué: Página indexable ProfilePage del revisor con Person JSON-LD (@id + url estables), nombre y cargo leídos literalmente de calendario.json (sin inventar credenciales; worksFor omitido a propósito). Refactor de schema.ts (reviewerPersonSchema): los 31+ artículos con reviewedBy ahora referencian el mismo @id de Person.
- Por qué: "Javier Rodríguez" aparecía 31+ veces en texto plano sin URL detrás y el Person del schema no tenía @id ni url; sin entidad verificable detrás del contenido YMYL.
- Hipótesis: Una página de persona indexable con Person @id/url estable da a Google una entidad verificable detrás del contenido YMYL.
- Criterio de éxito: Existe /dist/equipo/javier-rodriguez/index.html con Person, @id exacto y url; nombre/cargo coinciden literalmente con calendario.json. Cumplido y verificado (build, grep, sitemap).
- Métrica y plazo: GSC a 21 días — indexación de la página, impresiones/CTR de marca personal y validación del reviewedBy en Rich Results.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-05 — seo-005 Incluir el silo en la miga de pan (breadcrumb) del artículo (seo)
- Archivos: src/layouts/BlogPost.astro
- Qué: El <nav aria-label="Migas de pan"> y el BreadcrumbList JSON-LD pasan de 3 a 4 niveles (Inicio / Blog / Silo / título), reutilizando categoryHref y el umbral de silo (≥3 posts publicados) ya introducidos en ux-001, sin duplicar lógica. Para categorías sin silo la miga se mantiene en 3 niveles.
- Por qué: breadcrumbSchema() solo recibía 3 niveles; la estrategia exige que la miga incluya el silo para reforzar la señal de estructura jerárquica ante los buscadores.
- Hipótesis: Añadir el silo a la miga refuerza la señal de estructura jerárquica del sitio ante los buscadores.
- Criterio de éxito: nav con 4 enlaces y BreadcrumbList con itemListElement.length === 4, position 3 → URL del silo. Cumplido y verificado (build, muestra de dist).
- Métrica y plazo: GSC a 21 días — aparición de breadcrumbs enriquecidos en resultados y evolución de impresiones/CTR por categoría.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-05 — seo-007 Referenciar el @id del revisor desde el JSON-LD de los 31 artículos (seo)
- Archivos: src/lib/schema.ts
- Qué: Nueva reviewerReferenceSchema() (con fallback a Person completo si el revisor no tiene página propia) sustituye a reviewerPersonSchema() dentro de blogPostingSchema(); reviewedBy pasa a ser una referencia { "@id": ".../equipo/javier-rodriguez#person" } que reutiliza el @id ya construido en seo-006, en vez de un objeto Person duplicado.
- Por qué: 31 artículos incrustaban copias sueltas del mismo Person; el grafo de conocimiento debe conectarlos con una única entidad.
- Hipótesis: Referenciar el @id conecta cada BlogPosting con una única entidad Person en el grafo de conocimiento.
- Criterio de éxito: reviewedBy = { "@id": ... } en el JSON-LD, coincidiendo con el @id publicado en /equipo/javier-rodriguez. Cumplido y verificado (build, muestra de 4 artículos).
- Métrica y plazo: GSC/Rich Results Test a 21 días — sin errores de Person/reviewedBy, entidad unificada.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-05 — seo-008 Mencionar y enlazar al revisor desde /sobre-este-sitio (seo)
- Archivos: src/pages/sobre-este-sitio.astro
- Qué: La sección "Quién está detrás" nombra a Javier Rodríguez con <a href="/equipo/javier-rodriguez"> y su cargo literal leído de scripts/calendario.json (solo lectura), sin credenciales ni cifras inventadas.
- Por qué: /sobre-este-sitio no mencionaba a ningún ser humano, debilitando la señal EEAT a nivel de sitio.
- Hipótesis: Nombrar y enlazar al revisor editorial desde la página "about" refuerza la señal EEAT a nivel de sitio.
- Criterio de éxito: /dist/sobre-este-sitio/index.html contiene el enlace y el nombre/cargo literal. Cumplido y verificado (build, grep).
- Métrica y plazo: GSC a 21 días — impresiones/CTR de /equipo/javier-rodriguez y /sobre-este-sitio.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-05 — seo-009 Añadir el campo category al índice de posts que usa rehypeInlineBlocks (seo)
- Archivos: astro.config.mjs
- Qué: loadPostsIndex() extrae ahora también category del frontmatter (mismo helper field() ya usado para title/description/draft) en cada objeto de POSTS_INDEX. rehype-plugins.mjs no lee aún ese campo (confirmado por inspección): es solo preparación de datos para seo-011.
- Por qué: Sin category en el índice no hay forma de priorizar "misma categoría primero" en las lecturas recomendadas en una tarea futura.
- Hipótesis: Añadir category al índice permite priorizar la misma categoría en la selección de lecturas recomendadas (seo-011, aún no ejecutada).
- Criterio de éxito: POSTS_INDEX incluye category por artículo; `npm run build` pasa y el HTML no cambia. Cumplido: diff -rq de dist/ antes/después sin diferencias.
- Métrica y plazo: No aplica (preparación de datos sin efecto observable todavía; se medirá en seo-011).
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-14 — ux-002 Enlazar la caja "Revisado por" del artículo a la página del revisor (ux)
- Archivos: src/layouts/BlogPost.astro
- Qué: La foto y el nombre "Javier Rodríguez" dentro del <aside> "Revisado por" pasan a ser un <a href="/equipo/javier-rodriguez">, reutilizando REVIEWER_PROFILES de src/lib/schema.ts (ya usado para el JSON-LD) en vez de duplicar una constante nueva. Sin JavaScript, sin credenciales ni cifras añadidas.
- Por qué: La caja de revisor no enlazaba a ningún sitio; en un YMYL, poder verificar con un clic quién revisa el contenido refuerza la confianza percibida.
- Hipótesis: Enlazar el nombre del revisor a su página de entidad mejora la confianza percibida del lector.
- Criterio de éxito: 47/47 artículos con reviewedBy definido tienen <a href="/equipo/javier-rodriguez"> dentro del bloque "Revisado por" (grep sobre dist/blog/*/index.html tras build). Cumplido y verificado.
- Métrica y plazo: GSC/comportamiento a 21 días — CTR hacia /equipo/javier-rodriguez, señal cualitativa de confianza.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-14 — seo-010 Crear script de medición de enlaces internos entrantes sobre /dist (seo)
- Archivos: scripts/contar-enlaces-internos.mjs (nuevo)
- Qué: Script Node ESM standalone que, tras `npm run build`, cuenta enlaces internos entrantes únicos por artículo desde los bloques "Lectura recomendada" (inline-reco) y "Artículos relacionados" (RelatedArticles), e imprime tabla + resumen (mínimo, máximo, mediana, nº con 0 entrantes).
- Por qué: No existía forma objetiva y repetible de verificar el diagnóstico de concentración del enlazado interno, ni de medir el efecto de seo-011.
- Hipótesis: Medir hoy establece la línea base "antes" necesaria para evaluar seo-011.
- Criterio de éxito: Script existe y ejecuta correctamente sobre dist/. Cumplido. Línea base real (47 artículos): mínimo 0, máximo 46, mediana 0, 29/47 artículos con 0 entrantes; dos artículos concentran 46 entrantes cada uno.
- Métrica y plazo: Línea base "antes", trasladada a la entrada de seo-011 de este mismo informe.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-14 — seo-011 Redistribuir la selección de "lectura recomendada" en rehypeInlineBlocks (seo)
- Archivos: src/lib/rehype-plugins.mjs
- Qué: rehypeInlineBlocks ya no arranca siempre en recoPick=0 sobre un array alfabético. Nuevo buildCategoryCycle(posts) agrupa el índice por category (dato disponible desde seo-009) y pickRecoTargets(slug, cycle, max) recomienda, de forma cíclica y determinista, los siguientes artículos a partir de la posición propia de cada artículo en ese índice — desplazamiento uniforme +1/+2/+3, no un hash por artículo (una primera iteración con hash-módulo dejaba 1 artículo en 0 entrantes por colisión; se sustituyó por el ciclo, que garantiza cobertura). Sube a 3 bloques de recomendación en artículos con ≥5 H2 (antes máximo 2). rehypeExternalLinks y DOFOLLOW_HOSTS sin modificar (verificado por diff).
- Por qué: El punto de partida fijo concentraba casi todo el enlazado interno automático en los 2 primeros artículos alfabéticos y dejaba 29 de 47 artículos sin ningún enlace entrante desde el cuerpo, debilitando la señal EEAT/SEO de enlazado interno del sitio.
- Hipótesis: Un punto de partida repartido por artículo, con prioridad de categoría y más bloques en artículos largos, distribuye el enlazado interno automático por todo el índice.
- Criterio de éxito: Cumplido. `npm run build` pasa; rehypeExternalLinks/DOFOLLOW_HOSTS intactos.
- Métrica y plazo: scripts/contar-enlaces-internos.mjs — antes: mínimo 0, máximo 46, mediana 0, 29/47 con 0 entrantes. Después: mínimo 3, máximo 14, mediana 3, 0/47 con 0 entrantes. Seguimiento en GSC a 21-28 días: impresiones/clics de los artículos que antes tenían 0 enlaces internos entrantes.
- Commit: 221d170
- Veredicto del CEO: pendiente

## 2026-08-18 — seo-012 Crear script de auditoría del conjunto money sobre /dist (seo)
- Archivos: scripts/auditar-money-set.mjs (nuevo)
- Qué: Script Node ESM standalone que, tras `npm run build`, deriva el conjunto money (5 URLs: /simulador + 4 artículos publicados con keyword >=5.000 búsq./mes) desde scripts/calendario.json (solo lectura) y mide sobre /dist: palabras visibles en <main> (texto + placeholders, excluyendo JS/CSS embebido), enlaces internos entrantes (in-degree por página de origen en todo /dist), canonical declarado, tipos JSON-LD presentes, noindex, y si otra URL indexable del sitemap declara su misma keyword exacta (recorre todo dist/sitemap-0.xml, no solo el conjunto money). Cruza scripts/datos/*.csv si existe (0 en todas las columnas si no existe, con aviso). Sale con código 1 si alguna URL money tiene <1.200 palabras, noindex, o está canibalizada.
- Por qué: El diagnóstico de unicidad/suficiencia del conjunto money solo existía como medición manual del CEO en ESTRATEGIA.md; no había ninguna herramienta reproducible en el repo, y las líneas 2 y 3 de este ciclo necesitan un "antes" objetivo para poder compararse contra un "después".
- Hipótesis: Medir hoy con una herramienta reproducible establece la línea base objetiva que sirve para evaluar seo-013 en adelante.
- Criterio de éxito: Cumplido y verificado. Ejecutado hoy: código de salida 1, /simulador con 71 palabras (coincide exactamente con el dato manual del CEO, validando la metodología de recuento), 2 pares canibalizados detectados en todo el sitio: jubilacion-anticipada-cambios-2026/novedades-2026 y /simulador vs como-interpretar-simulador-jubilacion.
- Métrica y plazo: Línea base "antes" (esta entrada) — se compara contra la salida del mismo script después de ejecutar seo-013 a seo-017 (consolidación canonical) y seo-018 a seo-021 (ampliación de /simulador).
- Riesgo identificado: El recuento de palabras de los 4 artículos (2.192–2.466) difiere ligeramente del rango que cita el CEO en ESTRATEGIA.md (2.253–2.581), probablemente por diferencias menores de decodificación de entidades HTML; no afecta a /simulador (71, exacto) ni a la detección de canibalización. La asociación de /simulador a su keyword depende de que exista exactamente un artículo publicado con "simulador" en su keyword; si eso cambia, el script avisa por consola en vez de fallar en silencio.
- Commit: 221d170
- Veredicto del CEO: pendiente

## 2026-08-18 — seo-013 Crear el mapa de consolidación canonical en src/lib/canonical-map.ts (seo)
- Archivos: src/lib/canonical-map.ts (nuevo)
- Qué: Módulo de solo lectura (nunca escribe en calendario.json ni en src/content/blog/**) que agrupa artículos publicados por keyword normalizada, ordena cada par por fecha de publicación y asigna la canónica al más antiguo vía getCanonicalSlug(slug). Si el más reciente tiene >=1,5x las palabras del más antiguo (leídas del .mdx fuente), o si el contador de palabras falla para alguno, el par se marca en paresQueRequierenRevision sin asignar canonical. resolverParesCanonicos() recibe el contador de palabras como parámetro inyectable para poder simular escenarios sin tocar el filesystem real.
- Por qué: No existía ninguna fuente única de verdad para resolver canibalización por keyword exacta; cada par (incluido el que entra el 2026-08-24) se resolvería a mano. La excepción de umbral evita que el módulo decida solo cuando el contenido más reciente es sustancialmente más completo — esos casos quedan para revisión humana, coherente con la exigencia EEAT de no tomar atajos automáticos en URLs YMYL.
- Hipótesis: Una regla derivada de calendario.json resuelve automáticamente la mayoría de pares canibalizados, dejando solo los casos límite para revisión del CEO.
- Criterio de éxito: Cumplido y verificado. getCanonicalSlug('jubilacion-anticipada-novedades-2026') === 'jubilacion-anticipada-cambios-2026' (único par publicado hoy, coincide con lo que reporta seo-012). Simulación de guia-completa-jubilacion-anticipada-2026 (publicado:false hoy) confirma que la regla la resuelve sola contra que-es-la-jubilacion-anticipada. Casos límite (umbral 1,5x, contador no disponible) verificados: van a revisión sin canonical asignado. Build OK (73 páginas, 0 errores/warnings nuevos de astro check).
- Métrica y plazo: nº de pares en paresQueRequierenRevision a lo largo del tiempo (debería mantenerse bajo); cuando seo-014 consuma el módulo, impresiones/clics en GSC de las URLs consolidadas a 21 días.
- Riesgo identificado: El recuento de palabras es heurístico (limpieza de frontmatter/imports/componentes Astro); dio 1.865–1.988 para el par novedades/cambios frente a los ~2.521/2.531 citados en la hipótesis original, pero el ratio queda muy por debajo de 1,5x en ambos casos, así que el resultado de negocio no cambia. Si un grupo de keyword tuviera >2 artículos publicados, cada "reciente" se compara solo contra el más antiguo del grupo, no entre sí. Módulo aún no consumido por ninguna página (corresponde a seo-014).
- Commit: 7828663
- Veredicto del CEO: pendiente

## 2026-08-18 — seo-014 Emitir <link rel=canonical> hacia la URL consolidada en los artículos canibalizados (seo) — FALLIDA
- Archivos: ninguno permanece modificado (src/components/BaseHead.astro, src/layouts/Base.astro, src/layouts/BlogPost.astro editados y revertidos)
- Qué: Se implementó el diseño exacto pedido (prop `canonicalPath` en cascada BlogPost→Base→BaseHead, consultando `getCanonicalSlug(post.slug)` de seo-013), pero `npm run build` falló en la fase `astro build` y el cambio se revirtió con `git checkout`.
- Por qué falló: Bug preexistente en src/lib/canonical-map.ts (seo-013): `REPO_ROOT` se calcula con `dirname(fileURLToPath(import.meta.url))` asumiendo que el módulo siempre vive en `src/lib/`. Al consumirse por primera vez desde una página real (BlogPost.astro), Vite empaqueta el módulo dentro de `dist/pages/blog/_slug_.astro.mjs`; `import.meta.url` pasa a apuntar ahí, `REPO_ROOT` resuelve a `dist/` en vez de a la raíz del repo, y la lectura de `scripts/calendario.json` (que ocurre en el top-level del módulo, al importarlo) revienta con ENOENT. El bug estaba latente porque canonical-map.ts nunca había sido importado desde una página real hasta este intento.
- Hipótesis: (sin cambios respecto al backlog original — no se pudo evaluar, el criterio de éxito no llegó a ejecutarse).
- Criterio de éxito: No cumplido — build roto, sin dist/ válido generado con los cambios aplicados.
- Métrica y plazo: No aplica — no se generó ningún HTML con canonicals consolidados que medir.
- Riesgo identificado: Ninguno introducido en el repo (revertido íntegramente, build en verde en el commit 7828663 sin los cambios). El riesgo real es que la Línea 2 completa (seo-014 a seo-017) queda bloqueada hasta corregir la resolución de REPO_ROOT en canonical-map.ts — se recomienda una tarea previa dedicada (p.ej. usar `process.cwd()` en vez de `import.meta.url`) antes de reintentar seo-014.
- Commit: (sin commit — no hay cambios que publicar de esta tarea)
- Veredicto del CEO: pendiente

## 2026-08-18 — seo-015 Excluir del sitemap las URLs consolidadas por el mapa canonical (seo)
- Archivos: astro.config.mjs
- Qué: El `filter` del integration `sitemap()` extrae el slug de cada URL /blog/<slug>/ y, si getCanonicalSlug(slug) (seo-013) devuelve un destino, la excluye de dist/sitemap-*.xml. No se toca la generación de la página HTML en sí (sigue existiendo, solo deja de listarse en el sitemap). No se tocó canonical-map.ts ni src/content/blog/**.
- Por qué: seo-013 ya identifica qué URL cede autoridad por canibalización de keyword exacta; sin este cambio el sitemap seguía anunciando ambas URLs del par como indexables por igual. Nota importante: seo-014 (el <link rel=canonical> en el HTML) falló hoy por un bug de canonical-map.ts, así que esta tarea deja el par sin canonical en el HTML pero ya sin ambas URLs en el sitemap — señal parcial, a completar cuando se resuelva seo-014.
- Hipótesis: Excluir del sitemap la URL consolidada evita que Google la trate como indexable independiente mientras se resuelve la señal completa de canonical.
- Criterio de éxito: Cumplido y verificado. jubilacion-anticipada-novedades-2026 ausente de dist/sitemap-0.xml (grep -c = 0); jubilacion-anticipada-cambios-2026 presente (grep -c = 1). Build OK (73 páginas).
- Métrica y plazo: auditar-money-set.mjs (seo-012) confirma que el par novedades/cambios ya no aparece en la lista de canibalizados detectados en el sitemap. Seguimiento en GSC a 21 días: cobertura de novedades-2026 pasando a "no enviada en sitemap".
- Riesgo identificado: Este cambio se cargó desde astro.config.mjs, un contexto de Node normal (no bundle de página), por lo que no reprodujo el bug de REPO_ROOT que tumbó seo-014; si en el futuro cambia cómo Astro carga su config, el mismo bug podría reaparecer aquí. Sin redirección 301 (no aplica: la URL sigue siendo accesible directamente, solo deja de listarse en el sitemap).
- Commit: 4b0a07d
- Veredicto del CEO: pendiente

## 2026-08-18 — seo-016 Diferenciar el title y el H1 de /simulador frente al artículo como-interpretar-simulador-jubilacion (seo)
- Archivos: src/pages/simulador.astro
- Qué: <title> de /simulador cambia de "Simulador de jubilación anticipada" a "Calcula tu jubilación anticipada: simulador gratuito"; <h1> pasa a "Calcula tu jubilación anticipada". Por coherencia interna del mismo archivo, se actualizó también el campo `name` de webApplicationSchema y webPageSchema al mismo texto. No se tocó src/content/blog/** ni el frontmatter/H1 del artículo.
- Por qué: /simulador (herramienta) y el artículo como-interpretar-simulador-jubilacion (guía informacional) competían con títulos casi intercambiables por la misma keyword de ~60.000 búsq./mes; este par no se resuelve con canonical (son documentos legítimamente distintos), sino diferenciando intención mediante título y H1 con verbo de acción.
- Hipótesis: Un título/H1 con verbo de acción explícito en /simulador separa la señal de intención transaccional (herramienta) de la intención informacional (guía) para la misma consulta.
- Criterio de éxito: Cumplido y verificado. dist/simulador/index.html: title="Calcula tu jubilación anticipada: simulador gratuito | Tu Jubilación Anticipada", h1="Calcula tu jubilación anticipada", un único <h1>, sin noindex. dist/blog/como-interpretar-simulador-jubilacion/index.html sin cambios (title/h1 originales intactos). Build OK (73 páginas).
- Métrica y plazo: GSC a 21 días — impresiones/CTR de /simulador vs. el artículo para "simulador de jubilación" y variantes; se espera que /simulador gane peso en consultas transaccionales ("calcular", "simulador gratis") y el artículo mantenga las informacionales ("cómo interpretar").
- Riesgo identificado: El <title> completo con sufijo del sitio queda en 85 caracteres, Google podría truncarlo en SERP (no afecta al criterio de éxito, vigilar snippet real en GSC). El cambio de `name` en el JSON-LD desalinea cualquier tracking externo que dependiera del texto exacto anterior — es contenido legítimo del propio schema, no una propiedad inventada.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-19 — seo-017 Alinear mainEntityOfPage del JSON-LD con el canonical externo en artículos consolidados (seo)
- Archivos: src/lib/schema.ts
- Qué: blogPostingSchema() consulta getCanonicalSlug() (seo-013) y, si el post está consolidado hacia otro, apunta mainEntityOfPage.@id y url del BlogPosting al destino canónico en vez de a sí mismo. El @id del propio documento (`${url}#article`) se mantiene autorreferente por identificar el documento físico, no la entidad principal declarada.
- Por qué: El <link rel=canonical> (cuando exista, ver seo-014) dice "la página principal es otra" mientras el JSON-LD seguía declarándose a sí mismo como mainEntityOfPage; un rastreador con señales contradictorias puede no consolidar ninguna de las dos URLs.
- Hipótesis: Alinear el JSON-LD con el destino de getCanonicalSlug() elimina la contradicción interna en el HTML del artículo consolidado.
- Criterio de éxito: Cumplido y verificado. jubilacion-anticipada-novedades-2026: mainEntityOfPage/url → cambios-2026. cambios-2026 y artículos no consolidados siguen autorreferenciándose. Build OK (74 páginas).
- Métrica y plazo: grep de mainEntityOfPage en ambos dist/blog/*/index.html tras cada build (verificado); GSC a 21 días una vez completado también seo-014 (ver riesgo).
- Riesgo identificado: El bug de REPO_ROOT en canonical-map.ts que tumbó seo-014 no se reprodujo hoy al consumirse desde schema.ts/BlogPost.astro en un build limpio (posible causa: el pipeline SSR de Astro no escribe bundles intermedios .astro.mjs en disco antes de renderizar). Como seo-014 sigue revertida, el <link rel=canonical> de novedades-2026 sigue autorreferenciándose mientras el JSON-LD ya apunta a cambios-2026 — discrepancia temporal hasta reintentar seo-014, que ahora podría no estar bloqueada por el mismo bug.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-19 — seo-018 Extraer el motor de cálculo puro del simulador a src/lib/pension-calculo.ts (seo)
- Archivos: src/lib/pension-calculo.ts (nuevo), src/components/Simulador.jsx
- Qué: Refactor de reubicación pura: constantes normativas, porcentajePension, calcularEscenario y fechaDesdeEdad se mueven de Simulador.jsx a un módulo compartido tipado src/lib/pension-calculo.ts, sin cambiar ninguna fórmula ni cifra. Simulador.jsx importa desde ahí.
- Por qué: El motor de cálculo solo existía dentro de la isla cliente React y no era accesible desde una página .astro en build; paso previo necesario para generar en el futuro una tabla de escenarios estática reutilizando el mismo motor.
- Hipótesis: Reubicar el motor a un módulo compartido permite generar en build una tabla de escenarios reutilizando exactamente la misma lógica que la isla React.
- Criterio de éxito: Cumplido y verificado. 6/6 combinaciones de calcularEscenario() idénticas antes/después del refactor. Build OK (74 páginas).
- Métrica y plazo: No aplica todavía (el consumo desde simulador.astro para generar la tabla estática es una tarea posterior, ver seo-019).
- Riesgo identificado — IMPORTANTE, requiere revisión antes de continuar la Línea 3: durante la extracción se detectó que EDAD_LEGAL_PLENA (66a8m) y UMBRAL_COTIZACION_EDAD_REDUCIDA (38.5) corresponden a valores de 2025, no a los vigentes en 2026; y que PENAL_VOLUNTARIA_TRIMESTRE/PENAL_FORZOSA_TRIMESTRE usan un porcentaje fijo por trimestre en vez de coeficientes decrecientes por tramos de años cotizados. No se corrigió por ser un refactor puro fuera de alcance; ya estaba en producción antes de esta tarea (solo se reubicó, no se introdujo). Bloquea seo-019 (ver esa entrada) hasta que se revise con fuente experta/oficial.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

## 2026-08-19 — seo-019 Renderizar en /simulador una tabla estática de escenarios precalculados (seo) — FALLIDA
- Archivos: ninguno modificado
- Qué: Antes de escribir en src/pages/simulador.astro, se verificó contra fuentes externas el riesgo normativo ya señalado por seo-018. Se confirmó que EDAD_LEGAL_PLENA (66a8m) y UMBRAL_COTIZACION_EDAD_REDUCIDA (38.5) en src/lib/pension-calculo.ts corresponden a la normativa de 2025, no a la vigente en 2026 (66a10m / 38a3m, según varias fuentes coincidentes: Instituto Santalucía, USO, Campmany Abogados, OVB). La tarea se detuvo sin escribir ningún archivo ni ejecutar build.
- Por qué falló: Publicar una tabla estática indexable de ≥40 filas con la fecha de jubilación estimada calculada a partir de una edad legal incorrecta, en un sitio YMYL sobre pensiones, habría escalado el error de la isla React (dinámico, no indexado) a contenido estático servido en el HTML y el sitemap. El propio criterio de la tarea exige detenerse ante un dato normativo incorrecto en vez de corregirlo por iniciativa propia o publicar de todos modos.
- Hipótesis: (sin evaluar — el criterio de éxito no llegó a ejecutarse).
- Criterio de éxito: No cumplido — tarea detenida por precaución antes de generar contenido.
- Métrica y plazo: No aplica.
- Riesgo identificado: Mientras estas constantes no se corrijan en src/lib/pension-calculo.ts, tanto la isla React en producción (impacto SEO menor, no indexado) como cualquier tarea futura que las consuma (incluida esta) arrastrarán el mismo dato desactualizado. Recomendación explícita al CEO: (1) corregir EDAD_LEGAL_PLENA a 66+10/12 y UMBRAL_COTIZACION_EDAD_REDUCIDA a 38.25 con revisión de una fuente experta/oficial (no solo por un agente), y de paso revisar los coeficientes de penalización por trimestre señalados en seo-018; (2) relanzar seo-019 una vez corregido.
- Commit: (sin commit — no hay cambios que publicar de esta tarea)
- Veredicto del CEO: pendiente

---

## 2026-08-22 — seo-020 Añadir a /simulador las fuentes normativas, coeficientes reductores y enlace al simulador oficial de la Seguridad Social (seo) — FALLIDA
- Archivos: ninguno modificado
- Qué: Antes de escribir en src/pages/simulador.astro, se contrastaron fuentes externas (Instituto Santalucía, BBVA Mi Jubilación, Campmany Abogados, y los PDF oficiales de seg-social.es citados por ellas) para documentar correctamente los coeficientes reductores vigentes exigidos por el criterio de éxito. La tarea se detuvo sin tocar ningún archivo, mismo criterio de parada que seo-019.
- Por qué falló: Los coeficientes reductores vigentes en 2026 (RDL 2/2023) son mensuales y escalonados en 4 tramos de años cotizados (<38,5 / 38,5-41,5 / 41,5-44,5 / >=44,5 años), con reducción total entre 3,26% y 21% según meses de adelanto y tramo. Esto contradice directamente el modelo de src/lib/pension-calculo.ts, que aplica un porcentaje FIJO por trimestre (PENAL_VOLUNTARIA_TRIMESTRE=1.875, PENAL_FORZOSA_TRIMESTRE=1.625) sin tramos por años cotizados. Publicar una tabla oficial correcta junto a un motor que calcula con una fórmula distinta habría generado una contradicción visible en una página YMYL de alto tráfico, en vez de reforzar EEAT.
- Hipótesis: (sin cambios respecto al backlog original — no se pudo evaluar, el criterio de éxito no llegó a ejecutarse).
- Criterio de éxito: No cumplido — no se generaron cambios que verificar.
- Métrica y plazo: No aplica.
- Riesgo identificado: Se suma a los ya reportados por seo-018/seo-019 sobre EDAD_LEGAL_PLENA (66a8m vs 66a10m vigente) y UMBRAL_COTIZACION_EDAD_REDUCIDA (38.5 vs 38a3m vigente). Las 3 tareas pendientes restantes del backlog (seo-021, ux-003, ux-004) dependen todas del contenido nuevo que seo-019/seo-020 debían añadir a /simulador y quedan bloqueadas por la misma causa raíz. Recomendación al CEO: dedicar una tarea previa a revisar y corregir con fuente experta/oficial las tres constantes de src/lib/pension-calculo.ts (EDAD_LEGAL_PLENA, UMBRAL_COTIZACION_EDAD_REDUCIDA, y el modelo PENAL_VOLUNTARIA_TRIMESTRE/PENAL_FORZOSA_TRIMESTRE — este último probablemente debe sustituirse por una tabla de tramos mensuales) antes de reintentar seo-019/seo-020.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-08-24 — seo-021 Corregir el schema de /simulador para que no contradiga el HTML (browserRequirements) y mostrar visibles las preguntas del FAQPage (seo) — HECHA-PARCIAL
- Archivos: src/lib/schema.ts, src/pages/simulador.astro
- Qué: webApplicationSchema() acepta ahora requiresJs?:boolean (por defecto true); browserRequirements solo se incluye cuando es true. Las 3 preguntas y respuestas de `faqs` se muestran ahora como texto visible (<h2>Preguntas frecuentes</h2> + <dl>) en simulador.astro, fuera de cualquier <script>, con el mismo texto que faqSchema(faqs) ya declaraba en JSON-LD.
- Por qué: Evitar que el JSON-LD contradiga el HTML real y dejar de incumplir la restricción de que un FAQPage solo es válido si sus preguntas están literalmente visibles.
- Hipótesis: Ver backlog. Se confirmó la mitad "FAQ visible" y se rechazó por precaución la mitad "requiresJs=false", porque /simulador sigue sin tabla estática (seo-019/seo-020 fallidas) y sigue dependiendo por completo de la isla React: marcar requiresJs:false habría sido una afirmación falsa.
- Criterio de éxito: Cumplido solo parcialmente — ver resultado en BACKLOG.json. browserRequirements sigue declarando "Requiere JavaScript" en dist/simulador/index.html (correcto, no es un fallo: la página sigue requiriéndolo de verdad); las 3 preguntas/respuestas de faqs verificadas visibles fuera de <script>.
- Métrica y plazo: grep de browserRequirements y del texto de las 3 preguntas en dist/simulador/index.html, ejecutado tras build. Sin plazo de medición externa (cambio estructural, no de tráfico).
- Riesgo identificado: Hereda el riesgo normativo de seo-018/seo-019/seo-020 sin resolver (constantes de src/lib/pension-calculo.ts desactualizadas respecto a la normativa 2026). Mientras no se corrijan, ux-003 y ux-004 (que dependen de la tabla estática que seo-019/seo-020 debían crear) siguen bloqueadas, y esta tarea no puede completarse al 100%.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-08-27 — ux-005 Crear el esqueleto del PDF del informe con @react-pdf/renderer (portada, índice, numeración y disclaimer) (ux) — FALLIDA
- Archivos: ninguno modificado
- Qué: El subagente ux-ui rechazó la tarea antes de tocar nada, tras contrastarla con su mandato explícito.
- Por qué falló: La tarea está etiquetada area=ux en el backlog, pero el trabajo real es crear src/lib/informe-pdf.tsx (fuera del alcance permitido del subagente ux-ui, limitado a src/components/**, src/layouts/**, src/styles/**, src/pages/**) y añadir @react-pdf/renderer como dependencia nueva en package.json (acción explícitamente prohibida en su mandato). No es una decisión de diseño: es una incompatibilidad estructural entre el área asignada por el product-owner y los permisos reales del subagente de esa área.
- Hipótesis: (sin evaluar — la tarea no llegó a ejecutarse).
- Criterio de éxito: No cumplido — tarea rechazada antes de generar ningún cambio.
- Métrica y plazo: No aplica.
- Riesgo identificado — IMPORTANTE, bloquea la prioridad estratégica directa del propietario: ux-006, ux-007, ux-008 y ux-009 son la misma cadena de trabajo (el generador del informe de pago de 49€, encargo E-1) y todas tocan src/lib/**, api/** o package.json — quedarían bloqueadas por la misma causa si se intentan tal cual están etiquetadas. Ninguno de los subagentes disponibles en esta routine (ux-ui, seo, cro) tiene permiso sobre src/lib/**, api/** o gestión de dependencias para lógica de negocio/backend. Recomendación al CEO/propietario: crear o habilitar un subagente de tipo desarrollo/backend con esos permisos, o reasignar explícitamente el área de ux-005..ux-009 (p.ej. a un área nueva "dev"), antes de reintentar esta línea de trabajo. Mientras esto no se resuelva, todo el informe de pago (E-1, la prioridad #1 de la replanificación forzada del 2026-08-26) queda completamente parado.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-08-27 — cro-001 Quitar el banner <CTAGuia /> de los listados de blog y home (cro) — HECHA
- Archivos: src/pages/index.astro, src/pages/blog/index.astro, src/pages/blog/page/[page].astro
- Qué: El banner <CTAGuia variant="banner" /> ya estaba comentado en los 3 archivos (sin impacto visual en producción); se eliminó el rastro textual completo (import comentado + bloque JSX comentado) para no dejar código muerto.
- Por qué: E-1 descarta explícitamente la guía de 29€ como producto ("no se reaprovecha ni como bonus, ni como lead magnet, ni como upsell"); el código muerto que la referencia confunde a agentes futuros que trabajen en cro-002/cro-003.
- Hipótesis: Ver backlog. Confirmada de forma trivial: no había banner visible que quitar (ya estaba oculto), así que el cambio es limpieza de código sin cambio de comportamiento medible.
- Criterio de éxito: Cumplido y verificado. grep de 'CTAGuia' en los 3 archivos fuente y en dist/index.html, dist/blog/index.html, dist/blog/page/2/index.html: 0 resultados en todos. Build OK (84 páginas).
- Métrica y plazo: No aplica métrica de negocio (el banner ya estaba oculto antes del cambio; no hay variación de conversión esperada).
- Riesgo identificado: Ninguno funcional. CTAGuia.astro y su uso en BlogPost.astro siguen intactos, a la espera de cro-002.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-08-28 — ux-006 Construir la tabla mes a mes del informe (24/48 filas) con pensión y pérdida acumulada (ux) — FALLIDA
- Archivos: ninguno modificado
- Qué: El subagente ux-ui rechazó la tarea antes de tocar nada, tras contrastarla con su mandato explícito.
- Por qué falló: La tarea está etiquetada area=ux, pero el trabajo real es crear src/lib/informe-pdf.tsx (lógica de datos: iterar 24/48 meses de anticipo, calcular pérdida acumulada), fuera del alcance permitido del subagente ux-ui (limitado a src/components/**, src/layouts/**, src/styles/**, src/pages/**). Es el mismo problema estructural que ux-005 (ver entrada del 2026-08-27): ninguno de los 3 subagentes de esta routine (ux-ui, seo, cro) tiene permiso sobre src/lib/**, api/** o scripts/** de backend.
- Hipótesis: (sin evaluar — la tarea no llegó a ejecutarse).
- Criterio de éxito: No cumplido — tarea rechazada antes de generar ningún cambio.
- Métrica y plazo: No aplica.
- Riesgo identificado — se repite sin resolver por segundo ciclo consecutivo: ux-007, ux-008 y ux-009 son la misma cadena de trabajo (generador del informe de pago de 49€, encargo directo E-1, prioridad #1 de la replanificación forzada del 2026-08-26) y comparten la misma causa raíz (src/lib/**, api/**, scripts/** fuera del alcance de los 3 subagentes disponibles). No se dispatcharon hoy por la misma razón. Recomendación reiterada al CEO/propietario: crear o habilitar un subagente de tipo desarrollo/backend con permiso sobre esas rutas, o reasignar explícitamente el área de ux-006..ux-009 (p.ej. a un área nueva "dev"), antes del próximo ciclo. Mientras esto no se resuelva, todo el informe de pago (E-1) sigue completamente parado.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-08-28 — cro-002 Quitar <CTAGuia /> de BlogPost.astro y borrar el componente CTAGuia.astro (cro) — HECHA
- Archivos: src/layouts/BlogPost.astro, src/components/CTAGuia.astro (borrado)
- Qué: Eliminado de BlogPost.astro el import comentado de CTAGuia y el bloque JSX comentado que la renderizaba (ya estaba desactivado, sin impacto visual); borrado por completo src/components/CTAGuia.astro.
- Por qué: Tras cro-001, este era el último punto de uso del componente. E-1 descarta la guía de 29€ como producto; sin este paso, borrar GUIA_PRECIO en cro-003 rompería el build.
- Hipótesis: Ver backlog. Confirmada: cero referencias vivas a CTAGuia tras el cambio.
- Criterio de éxito: Cumplido y verificado. grep -r 'CTAGuia' src/ -> 0 resultados. Build OK (85 páginas).
- Métrica y plazo: No aplica métrica de negocio (limpieza de código muerto, sin cambio de comportamiento).
- Riesgo identificado: Ninguno funcional. Deja el terreno listo para cro-003 (borrar GUIA_PRECIO de src/consts.ts).
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-08-29 — ux-007 Calcular y señalar en el PDF los acantilados de coeficiente y el punto de equilibrio (ux) — FALLIDA
- Archivos: ninguno modificado
- Qué: El subagente ux-ui verificó el prerequisito antes de tocar nada y se detuvo.
- Por qué falló: src/lib/informe-pdf.tsx (esqueleto del PDF, de ux-005) sigue sin existir y @react-pdf/renderer sigue sin estar en package.json; ux-006 (tabla mes a mes) tampoco se construyó. src/lib/ solo contiene canonical-map.ts, categories.ts, legal.ts, pension-calculo.ts, posts.ts, rehype-plugins.mjs y schema.ts. Misma causa raíz que ux-005/ux-006 (ver entradas anteriores): la cadena ux-005..ux-009 requiere tocar src/lib/**, api/** y package.json, fuera del alcance permitido del subagente ux-ui.
- Hipótesis: (sin evaluar — la tarea no llegó a ejecutarse).
- Criterio de éxito: No cumplido — tarea detenida antes de generar ningún cambio.
- Métrica y plazo: No aplica.
- Riesgo identificado: Tercer ciclo consecutivo con la misma cadena bloqueada. El orquestador decidió NO despachar hoy ux-008 ni ux-009 (dependen de los mismos artefactos ausentes que ux-007), para no gastar el cupo diario en tareas con el mismo bloqueo ya confirmado, y usar esa capacidad en tareas cro sí ejecutables. Recomendación reiterada: la línea del informe de pago (E-1, prioridad #1 de la replanificación del 2026-08-26) sigue completamente parada mientras no exista un subagente con permiso sobre src/lib/**, api/** y package.json, o se reasigne el área de ux-005..ux-009.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-08-29 — cro-003 Borrar la página de la guía de 29 € y retirar GUIA_PRECIO de consts.ts (cro) — HECHA
- Archivos: src/pages/_guia-jubilacion-anticipada.astro (borrado), src/consts.ts
- Qué: Verificado que grep -r CTAGuia src/ ya no devolvía resultados (cro-001/cro-002 completadas); borrado el archivo de la página de venta de la guía y eliminada la constante GUIA_PRECIO de consts.ts.
- Por qué: Completa la retirada del producto de 29€ descartado por E-1 ("no se reaprovecha ni como bonus, ni como lead magnet, ni como upsell"), sin dejar código muerto que confunda a agentes futuros.
- Hipótesis: Ver backlog. Confirmada: tras cro-001/cro-002, ningún archivo del repo importaba ya GUIA_PRECIO.
- Criterio de éxito: Cumplido y verificado. grep -r GUIA_PRECIO src/ -> 0 resultados. /dist no genera ninguna ruta /guia-jubilacion-anticipada (la página ya empezaba por "_" y Astro la excluía del build, pero el archivo fuente seguía presente). Build OK (87 páginas).
- Métrica y plazo: No aplica métrica de negocio (limpieza de código muerto sin producto activo detrás).
- Riesgo identificado: Ninguno funcional. La página nunca fue una ruta pública, ni antes ni después del cambio.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-08-29 — cro-004 Crear la página /informe con el formulario nativo de 6 campos y el copy de venta (cro) — HECHA
- Archivos: src/pages/informe.astro (nuevo)
- Qué: Formulario nativo sin JavaScript (method="post" action="/api/informe-crear") con los 6 campos de captura, 2 checkboxes separadas (RGPD obligatoria, avisos normativos opcional) sin checked, copy de venta con qué incluye/qué NO incluye literal de E-1, precio 49,00 € IVA incluido, y el DISCLAIMER de src/consts.ts renderizado sin reescribirlo.
- Por qué: Es el primer paso obligatorio del embudo de pago del Informe de Fecha Óptima de Jubilación (E-1); no depende de que exista cuenta de Stripe ni del endpoint (cro-005/cro-007), solo del formulario apuntando a la ruta futura.
- Hipótesis: Ver backlog. Confirmada en forma: página construida y funcional sin JS a falta del endpoint.
- Criterio de éxito: Cumplido y verificado de forma independiente (no solo por el subagente): <form action="/api/informe-crear"> presente; 6 campos presentes; 2 checkboxes sin checked; "49,00 €" visible; DISCLAIMER coincide carácter por carácter con consts.ts; sin campos de tarjeta/nombre/dirección. Build OK (88 páginas).
- Métrica y plazo: Tasa de envíos a /api/informe-crear y de clics en el CTA una vez el endpoint exista (cro-005) y haya tráfico suficiente; no antes de 2-4 semanas.
- Riesgo identificado: El endpoint /api/informe-crear no existe todavía (cro-005), así que cualquier envío real del formulario en producción devolverá 404 hasta entonces. Es un riesgo aceptado y temporal, coherente con la secuencia cro-004→cro-005→cro-007 del backlog.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-08-29 — cro-005 Crear api/informe-crear.ts con el precheck gratuito y la redirección a /informe/no-aplica (cro) — HECHA
- Archivos: api/informe-crear.ts (nuevo), src/pages/informe/no-aplica.astro (nuevo)
- Qué: Endpoint serverless que recibe los 6 campos de /informe (cro-004), valida obligatoriedad/RGPD, y ejecuta un precheck real contra pension-calculo.ts (requisito de 35/33 años cotizados proyectados a la edad ordinaria, carencia mínima, y superaMinimaExigida del art. 208.1.c en el mejor caso para la modalidad voluntaria). Si no accede, 303 a /informe/no-aplica con el detalle del caso; si accede, 501 explícito sin cobrar (Stripe pendiente, cro-007).
- Por qué: E-1 exige que ningún caso sin derecho llegue a la pasarela de pago, para evitar devoluciones y reseñas negativas por cobrar a quien no puede jubilarse anticipadamente.
- Hipótesis: Ver backlog. Confirmada en forma: la lógica usa las funciones/constantes reales del motor (edadLegalJubilacion, calcularEscenario, fechaDesdeEdad, REQ_COTIZACION_VOLUNTARIA/FORZOSA, MIN_COTIZACION_PENSION), verificadas una a una contra pension-calculo.ts.
- Criterio de éxito: Cumplido y verificado de forma independiente (no solo por el subagente): git status solo toca los 2 archivos permitidos; npm run build OK (89 páginas); npx tsc --noEmit sobre todo el proyecto sin errores; firmas de las funciones importadas coinciden con el módulo real.
- Métrica y plazo: 0 sesiones de pago creadas (cuando cro-007 las active) para casos que hoy caerían en motivo=anios/minima; tasa de reseñas por "no podía jubilarme" en 0, a revisar cuando el circuito de pago esté activo.
- Riesgo identificado: El precheck usa los datos declarados por el usuario (no verifica su vida laboral real), lo mismo que el resto del sitio declara explícitamente. La proyección de años cotizados asume cotización continua sin lagunas si el usuario marca que seguirá cotizando; es una simplificación razonable para un filtro gratuito, no para el informe de pago en sí. La personalización de /informe/no-aplica depende de JavaScript (progressive enhancement) por ser un sitio estático sin SSR; sin JS se ve contenido general honesto pero no las cifras del caso concreto.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-08-29 — seo-023 Sustituir el bloque muerto de captura de email en Simulador.jsx por el CTA al informe de pago (seo) — HECHA
- Archivos: src/components/Simulador.jsx
- Qué: Eliminado el bloque {false && (...)} de captura de email (nunca se renderizaba), su estado asociado (email/emailEnviado/emailError/handleEmailSubmit) y la prop guiaHref sin uso; añadido en su lugar un <a href="/informe"> tras el resultado del cálculo, con copy honesto y evento GA4 cta_informe.
- Por qué: ESTRATEGIA.md ordena colocar el CTA al informe en ese hueco muerto; es el momento de mayor intención del usuario (ya vio su estimación) para ofrecerle el informe de pago verificado, que ya existe en /informe (cro-004) sin depender del circuito de cobro (cro-007/cro-008).
- Hipótesis: Ver backlog. Confirmada en forma: enlace presente y funcional con JS activado, sin patrones oscuros.
- Criterio de éxito: Cumplido y verificado de forma independiente: grep de {false &&/guiaHref/emailEnviado/emailError sin resultados; <a href="/informe"> presente en el JSX; npm run build OK (89 páginas).
- Métrica y plazo: Evento GA4 cta_informe (location: simulador) — tasa de clic hacia /informe desde el simulador y variación de sesiones a /informe, a revisar en ~21 días.
- Riesgo identificado: Posible competencia visual entre el CTA de asesoramiento gratuito (btn-accent) y el nuevo CTA al informe (btn-primary), ambos al final del resultado; a afinar en una futura iteración de CRO si los datos lo sugieren.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-08-30 — ux-008 Crear api/informe-render.ts (ux) — FALLIDA
- Archivos: ninguno (rechazada antes de tocar nada)
- Qué: El subagente ux-ui evaluó el encargo y se negó a ejecutarlo.
- Por qué falló: api/informe-render.ts es una función serverless backend (recibe un caso, ejecuta pension-calculo.ts e informe-pdf.tsx/informe-analisis.ts, devuelve un PDF), sin ningún componente de interfaz. Cae fuera del alcance declarado del subagente ux-ui (src/components/**, src/layouts/**, src/styles/**, src/pages/** sin blog). Cuarto ciclo consecutivo con la misma cadena ux-005..ux-009 bloqueada por la misma causa raíz: ningún subagente del equipo tiene permiso sobre src/lib/**, api/** ni package.json.
- Hipótesis: (sin evaluar — la tarea no llegó a ejecutarse).
- Criterio de éxito: No cumplido — tarea detenida antes de generar ningún cambio.
- Métrica y plazo: No aplica.
- Riesgo identificado: La línea de trabajo 1 de ESTRATEGIA.md (generación del PDF del informe de pago) sigue completamente parada. Recomendación reiterada por cuarta vez: crear un subagente con permiso sobre src/lib/**, api/** y package.json (p.ej. un rol "backend"), o ampliar explícitamente el alcance de un agente existente para esas rutas, antes de volver a programar ux-008/ux-009.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-08-30 — ux-009 Crear scripts/verificar-informe.mjs (ux) — FALLIDA
- Archivos: ninguno (no despachada)
- Qué: El orquestador decidió no invocar al subagente ux-ui para esta tarea.
- Por qué falló: Depende de api/informe-render.ts (ux-008), que no existe tras el rechazo de ux-008 en este mismo ciclo; además scripts/verificar-informe.mjs y package.json tampoco están dentro del alcance declarado de ux-ui. Se evitó gastar una invocación de agente en un resultado ya predecible.
- Hipótesis: (sin evaluar).
- Criterio de éxito: No cumplido.
- Métrica y plazo: No aplica.
- Riesgo identificado: Mismo bloqueo estructural que ux-008.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-08-30 — cro-006 Crear api/informe.ts: reemisión firmada por token HMAC (cro) — FALLIDA
- Archivos: ninguno (rechazada antes de tocar nada)
- Qué: El subagente cro evaluó el encargo y se negó a ejecutarlo.
- Por qué falló: api/informe.ts implica verificación criptográfica HMAC, gestión de expiración de tokens y lectura aislada de datos personales en Redis — lógica de autenticación y seguridad, no copy/CTAs/formularios/jerarquía de conversión (alcance declarado del subagente cro). El propio subagente advirtió del riesgo de introducir un fallo de seguridad (fuga de datos entre usuarios) si un rol sin responsabilidad de backend/seguridad improvisa este código. Misma causa raíz que ux-008/ux-009.
- Hipótesis: (sin evaluar — la tarea no llegó a ejecutarse).
- Criterio de éxito: No cumplido.
- Métrica y plazo: No aplica.
- Riesgo identificado: La línea de trabajo 2 de ESTRATEGIA.md (reemisión gratuita del informe) también depende de api/**, así que también está parada. Confirma que el bloqueo no es solo del área "ux": ningún subagente actual cubre api/**. Recomendación: resolverlo junto con ux-008/ux-009 como una sola pieza (nuevo rol backend o ampliación de alcance), no de forma independiente por área.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-08-30 — seo-022 Publicar en /simulador las tablas oficiales completas de coeficientes reductores (seo) — HECHA
- Archivos: src/pages/simulador.astro
- Qué: Añadidas dos tablas estáticas generadas en build desde COEF_VOLUNTARIA y COEF_INVOLUNTARIA de src/lib/pension-calculo.ts (24 filas × 4 tramos, art. 208.2 LGSS voluntaria; 48 filas × 4 tramos, art. 207.2 LGSS involuntaria), cada una con enlace dofollow a boe.es (BOE-A-2015-11724) y encabezados semánticos (thead/tbody/caption/th scope).
- Por qué: /simulador competía mal (posición ~48, 3 clics, 71 palabras en <main>) por ser casi un formulario vacío; las tablas lo convierten en un documento de referencia real para el cluster "calculo/calcular/simulador jubilación anticipada", con cifras verificables contra el motor y trazabilidad EEAT hacia la fuente oficial.
- Hipótesis: Ver backlog. Confirmada en forma: tablas generadas en build (no por JS), presentes tras eliminar la isla React del HTML.
- Criterio de éxito: Cumplido y verificado de forma independiente por el orquestador (no solo por el subagente): git status solo toca 1 archivo; npm run build OK (89 páginas); filas de <tr> = 24 y 48 respectivamente, valores coincidentes con las constantes del motor; DISCLAIMER intacto.
- Métrica y plazo: node scripts/auditar-money-set.mjs: palabras únicas en <main> de /simulador subieron de 71 a 893. Impresiones/posición en Google Search Console para "calculo jubilacion anticipada" y afines, a revisar en ~21 días.
- Riesgo identificado: Canibalización preexistente (no introducida por esta tarea) entre /simulador y /blog/como-interpretar-simulador-jubilacion para "simulador jubilacion", ya detectada por auditar-money-set.mjs. Tablas largas (24/48 filas) dependen de overflow-x-auto en móvil — validar visualmente. seo-019/seo-020/ux-003/ux-004 quedan pendientes para otro ciclo por tocar el mismo archivo hoy.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-09-01 — seo-019 (reintento) Renderizar en /simulador una tabla estática de escenarios precalculados (seo) — HECHA
- Archivos: src/pages/simulador.astro
- Qué: Añadida una tabla HTML estática ("Ejemplos de pensión estimada por edad, años cotizados y base reguladora") generada en build combinando 6 edades x 5 tramos de años cotizados x 3 tramos de base reguladora (72 filas, filtradas por plausibilidad: años cotizados <= edad actual − 16), cada una con edad legal, y pensión estimada en las tres modalidades (ordinaria, anticipada voluntaria, anticipada forzosa), calculada en build con calcularEscenario()/edadLegalJubilacion() de src/lib/pension-calculo.ts (seo-018/normativa-001) sin reescribir ninguna cifra a mano. Las celdas que no alcanzan los 15 años mínimos de cotización muestran texto honesto en vez de inventar un resultado. El DISCLAIMER de src/consts.ts se renderiza ahora también como bloque estático visible sin JavaScript, antes de cualquier cifra y fuera de la isla React (que se mantiene igual, bajo el epígrafe "Calcula tu caso personal", como mejora progresiva). Añadidos enlaces a las fuentes oficiales (BOE-A-2015-11724 art. 210.1, BOE-A-2026-6977). requiresJs del webApplicationSchema pasa de true a false, coherente con que ahora existe alternativa funcional sin JS.
- Por qué: La causa raíz que hizo fallar el primer intento (2026-08-19: EDAD_LEGAL_PLENA y UMBRAL_COTIZACION_EDAD_REDUCIDA con normativa de 2025) quedó resuelta por normativa-001 (2026-08-24). Con el motor ya alineado con la DT 7.ª/RD 241/2026, publicar la tabla estática deja de ser un riesgo YMYL y pasa a ser la Línea 3 de ESTRATEGIA.md: dar a /simulador (60.000 búsq./mes, keyword money más importante del sitio) contenido propio sustancial en vez de depender enteramente de una isla React que no ejecuta nada sin JS.
- Hipótesis: Confirmada en forma. Renderizar en build una tabla de escenarios reales y el disclaimer fuera de la isla da a un usuario sin JavaScript una estimación legible y honesta, y aumenta sustancialmente el contenido único indexable de /simulador.
- Criterio de éxito: Cumplido y verificado de forma independiente por el orquestador (no solo por el subagente): git status solo toca src/pages/simulador.astro; npm run build OK (91 páginas); 146 <tr> en la tabla (>=40 exigido, subagente reportó 72 filas de datos); un único <h1>; sin noindex accidental; el DISCLAIMER visible como texto (no solo serializado en la isla) antes del nodo astro-island, por lo que sigue legible si se elimina la isla React del HTML.
- Métrica y plazo: node scripts/auditar-money-set.mjs: 2137 palabras únicas en <main> de /simulador (>=1200 exigido). Nota: la base "antes" citada en el backlog original era 71 palabras (medición de seo-012, previa a seo-021/seo-022); tras seo-022 (2026-08-30) la base real era ya 893, así que el salto atribuible a esta tarea es de 893 a 2137. Seguimiento recomendado: impresiones/clics de /simulador en Search Console a 21 días.
- Riesgo identificado: La canibalización preexistente entre /simulador y /blog/como-interpretar-simulador-jubilacion (misma keyword "simulador jubilacion" en calendario.json) sigue presente; no depende del contenido de la página sino de calendario.json (ruta prohibida), no se ha tocado. Los rangos de edad/años cotizados/base reguladora mostrados son una decisión editorial del subagente (filtro de plausibilidad), no una cifra normativa. seo-020, ux-003 y ux-004 quedan pendientes para otro ciclo por tocar el mismo archivo hoy (regla de "un archivo, una tarea por día").
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente

---

## 2026-09-04 — legal-ia-001 Transparencia sobre IA conforme al Reglamento (UE) 2024/1689 (ux) — HECHA
- Archivos: src/consts.ts, src/content/config.ts, src/components/AvisoIA.astro (nuevo), src/components/BaseHead.astro, src/components/BlogListing.astro, src/components/Footer.astro, src/layouts/Base.astro, src/layouts/BlogPost.astro, src/lib/schema.ts, src/pages/transparencia-ia.astro (nuevo), src/pages/aviso-legal.astro, src/pages/privacidad.astro, src/pages/sobre-este-sitio.astro, src/pages/equipo/javier-rodriguez.astro, src/pages/simulador.astro, src/pages/informe.astro, src/pages/informe/no-aplica.astro, scripts/validate-frontmatter.mjs, scripts/PROMPT_REDACTOR.md, ROUTINE_PROMPT.md, docs/CUMPLIMIENTO-IA.md (nuevo)
- Qué: Encargo directo del propietario ("cumplir el EU AI Act de forma exhaustiva, sin riesgo de sanción"), a nivel de UX/UI y transparencia. (1) Nueva constante `IA` en src/consts.ts como fuente única de todo lo que el sitio declara sobre IA: inventario de sistemas, lo que NO usa IA, revisión humana, límites conocidos, versión y fecha. (2) Componente `AvisoIA.astro` con tres variantes: insignia junto a la firma del artículo, bloque de divulgación al final y aviso inverso ("cálculo determinista, sin IA") para simulador e informe. (3) Página pública indexable /transparencia-ia con resumen, índice, inventario, qué no usa IA, proceso editorial en 5 pasos, límites, datos personales, canal de corrección, tabla de correspondencia obligación-por-obligación del RIA (arts. 4, 5, 50.1, 50.2, 50.4, 50.5 y anexo III) y calendario de aplicación. (4) Marcado legible por máquina: metas `ai-generated-content`, `ai-content-human-review` y `ai-disclosure` en el <head>, `digitalSourceType` (propiedad `digitalsourcetype` de PLUS + NewsCode del IPTC `trainedAlgorithmicMedia`) en el nodo WebPage con `@context` en array, y `publishingPrinciples` en Organization y Article. (5) Campos `aiTextGenerated`/`aiImageGenerated`/`aiNota` en la colección de blog, con `true` por defecto (que es lo que hace el pipeline) y un control en validate-frontmatter.mjs que bloquea el deploy si alguien los desactiva sin motivo escrito. (6) Pie de portada en cada ilustración generada con IA. (7) Sección nueva en aviso legal (6), reescritura del §8 de privacidad (decisiones automatizadas + IA + no entrenamiento con datos de usuarios), y textos honestos en "Sobre este sitio" y en la ficha del revisor: el borrador lo redacta una IA y él lo revisa. (8) Explicación del precheck automático de /informe antes del formulario y en /informe/no-aplica, con vía a revisión humana (art. 22 RGPD). (9) Enlace "Transparencia IA" en el footer legal y línea de divulgación en el pie de todas las páginas. (10) docs/CUMPLIMIENTO-IA.md: registro interno con inventario, clasificación de riesgo razonada, mapa obligación→archivo, plan de alfabetización (art. 4), procedimiento de incidencias, puntos abiertos y calendario de revisión.
- Por qué: El sitio publica contenido redactado por un agente de IA y portadas generadas con IA sobre una materia YMYL de interés público (pensiones), dirigida a personas de 50 a 65 años. Desde el 2 de agosto de 2026 son aplicables las obligaciones de transparencia del art. 50 del RIA. El art. 50.4 exime de divulgar cuando hay revisión humana y responsabilidad editorial —que aquí existen—, pero la exención es discutible caso por caso y divulgar no es sancionable nunca: se divulga igualmente. Además, el sitio afirmaba en "Sobre este sitio" y en la ficha del revisor que "la redacción corre a cargo del equipo editorial", lo que no describía el proceso real; corregirlo cierra a la vez el riesgo de práctica comercial engañosa (RDL 1/2007) y el del art. 50.
- Hipótesis: Si toda la divulgación de IA sale de una constante única, aparece en la primera exposición al contenido (insignia sobre el artículo, listado y pie sitewide) y va acompañada de marcado legible por máquina y de un registro interno de cumplimiento, entonces el sitio queda cubierto frente al art. 50 sin depender de la excepción de revisión humana, y la etiqueta no puede divergir del proceso real sin que el validador lo bloquee.
- Criterio de éxito: Cumplido y verificado tras los cambios: `npm run build` OK (95 páginas, 0 errores de astro check, una más que las 94 de partida); los cuatro controles de CI pasan (validate-frontmatter 66/66, verificar-motor 326/326, auditar-normativa sin incidencias graves, verificar-titulos sin páginas > 60 caracteres); en el HTML de un artículo aparecen las tres metas de IA, `digitalSourceType` en el nodo WebPage y `publishingPrinciples` en Organization y Article; /transparencia-ia está en el sitemap y no bloqueada por robots.txt; comprobación visual con Chromium de artículo, listado, simulador y página de transparencia.
- Métrica y plazo: No es una tarea de tráfico. Seguimiento sugerido a 30 días: que ningún artículo nuevo publicado por la routine llegue sin la etiqueta (revisión puntual del HTML) y que la página de transparencia no genere caída medible en las URLs de /blog en Search Console.
- Riesgo identificado: (1) Toda la divulgación afirma que hay revisión humana antes de publicar; si la routine diaria publicara sin ella, el texto de `IA.revisionHumana` y `IA.etiquetaArticulo` deja de ser cierto y hay que corregirlo (queda anotado como punto abierto 1 de docs/CUMPLIMIENTO-IA.md). (2) LEGAL.titular/nif/domicilio siguen vacíos: la responsabilidad editorial que declara el aviso legal necesita un titular identificado (art. 10 LSSI-CE). (3) Hay que confirmar el origen de public/avatars/*.jpg y de public/equipo/javier-rodriguez.jpg: si fueran imágenes generadas con IA presentadas como personas reales, serían un problema de art. 50.4 y de práctica comercial engañosa. (4) El `@context` en array solo se emite en el nodo WebPage; el nodo Article, del que dependen los resultados enriquecidos, se deja intacto a propósito.
- Commit: (pendiente de este mismo commit)
- Veredicto del CEO: pendiente
