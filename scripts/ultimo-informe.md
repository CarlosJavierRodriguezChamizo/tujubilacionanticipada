# Informe de mejora continua — 2026-08-16

## Resumen
Se ha ejecutado el ciclo diario completo (5/5 tareas del área seo): se creó el instrumento de auditoría del conjunto money, se construyó y activó el mapa de consolidación canonical para el primer par canibalizado detectado, y se diferenció la señal de intención del par /simulador vs su artículo informacional.

## Cambios aplicados

### seo seo-012 — Crear script de auditoría del conjunto money sobre /dist
**Qué:** Nuevo scripts/auditar-money-set.mjs (Node ESM, sin dependencias). Deriva el conjunto money solo desde scripts/calendario.json (lectura) y mide sobre /dist palabras en `<main>`, enlaces internos entrantes, canonical, tipos de JSON-LD y pares canibalizados por keyword compartida recorriendo todo el sitemap.
**Por qué:** El diagnóstico de unicidad/suficiencia del conjunto money solo existía como medición manual del CEO en ESTRATEGIA.md.
**Hipótesis:** Un script repetible sobre /dist da un "antes" objetivo, reutilizable como "después" al ejecutar las líneas 2 y 3 de la estrategia.
**Cómo lo mediremos:** Salida del propio script como línea base; ya sirvió de referencia para verificar seo-014 y seo-015 en este mismo ciclo.
**Riesgo identificado:** La detección de canibalización de páginas estáticas (p.ej. /simulador) usa una heurística de texto (título+slug), no una fuente de verdad; podría dar falsos positivos/negativos si se añaden páginas con títulos ambiguos.
**Archivos:** scripts/auditar-money-set.mjs (nuevo)

### seo seo-013 — Crear el mapa de consolidación canonical en src/lib/canonical-map.ts
**Qué:** Nuevo módulo que deriva de calendario.json (lectura) los pares de artículos publicados con la misma keyword exacta, cuenta palabras desde el .mdx fuente (lectura) y resuelve la canónica al de fecha más antigua, salvo que el más reciente tenga ≥1,5x las palabras, en cuyo caso escala a "requiere revisión del CEO" en vez de decidir solo.
**Por qué:** No existía ninguna fuente única de verdad para resolver canibalización de keyword.
**Hipótesis:** Una regla determinista permite resolver consolidación canonical sin intervención humana, salvo el caso ambiguo que se escala.
**Cómo lo mediremos:** getCanonicalSlug() verificado sobre los datos reales de hoy y sobre una simulación del artículo que entra el 2026-08-24 (resuelve solo) y un caso forzado al umbral 1,5x (escala correctamente a revisión).
**Riesgo identificado:** El conteo de palabras se hace sobre el .mdx crudo, no sobre el HTML compilado (que usa auditar-money-set.mjs); ambos métodos coinciden en la decisión de hoy pero podrían divergir si un futuro par queda muy cerca del umbral 1,5x.
**Archivos:** src/lib/canonical-map.ts (nuevo)

### seo seo-014 — Emitir `<link rel=canonical>` hacia la URL consolidada en los artículos canibalizados
**Qué:** BaseHead.astro acepta un prop opcional canonicalPath que gana sobre path para el canonical (og:url/twitter:url quedan autorreferenciales por diseño). BlogPost.astro consulta getCanonicalSlug() y lo pasa cuando el post está consolidado hacia otro.
**Por qué:** jubilacion-anticipada-novedades-2026 y jubilacion-anticipada-cambios-2026 emitían cada una su propio canonical, repartiendo la señal de la misma consulta.
**Hipótesis:** Que la URL más reciente declare canonical hacia la más antigua consolida la señal sin despublicar ni noindexar.
**Cómo lo mediremos:** Verificado con grep tras build: novedades-2026 → canonical hacia cambios-2026; cambios-2026 autorreferencial; 0 noindex en ambas. Seguimiento real en GSC a 21 días.
**Riesgo identificado:** Ninguno nuevo; depende de que canonical-map.ts siga resolviendo correctamente los pares del calendario.
**Archivos:** src/components/BaseHead.astro, src/layouts/Base.astro, src/layouts/BlogPost.astro

### seo seo-015 — Excluir del sitemap las URLs consolidadas por el mapa canonical
**Qué:** El filter de sitemap() en astro.config.mjs excluye además las páginas /blog/<slug> cuyo slug esté consolidado hacia otro según canonical-map.ts.
**Por qué:** El sitemap seguía anunciando como indexable una URL que su propio canonical ya declaraba secundaria.
**Hipótesis:** Excluirla del sitemap evita ofrecerla como indexable de forma independiente.
**Cómo lo mediremos:** Verificado tras build: jubilacion-anticipada-novedades-2026 ausente de sitemap-0.xml; jubilacion-anticipada-cambios-2026 presente.
**Riesgo identificado:** scripts/auditar-money-set.mjs (seo-012) sigue reportando ese par como canibalizado porque su Regla 1 detecta por keyword+publicado del calendario, no por indexabilidad real del sitemap. No es un fallo de esta tarea; se propone un ítem de seguimiento para alinear esa regla del script de auditoría.
**Archivos:** astro.config.mjs

### seo seo-016 — Diferenciar el title y el H1 de /simulador frente al artículo como-interpretar-simulador-jubilacion
**Qué:** `<title>`/`<h1>` de /simulador pasan de "Simulador de jubilación anticipada" a "Calcula tu jubilación anticipada: simulador gratuito" (verbo de acción). El `name` de webApplicationSchema()/webPageSchema() se actualizó en coherencia. El artículo (intocable) no cambia.
**Por qué:** Ambos documentos competían con títulos casi intercambiables por la consulta de ~60.000 búsq./mes; al ser documentos legítimamente distintos, no se resuelve con canonical sino diferenciando intención.
**Hipótesis:** Un title/H1 con verbo de acción separa la señal de intención transaccional (herramienta) de la informacional (guía).
**Cómo lo mediremos:** Verificado tras build que ya no son variaciones triviales entre sí. GSC a 21 días: impresiones/CTR/posición de ambas URLs para confirmar que dejan de canibalizarse.
**Riesgo identificado:** Fluctuación temporal de rankings mientras Google reprocesa la nueva señal de título; riesgo bajo porque URL, contenido y resto de metadatos no cambian.
**Archivos:** src/pages/simulador.astro

## Incidencias
- **Desviación del flujo de publicación de esta routine:** las instrucciones de esta rutina piden `git pull origin main` / `git push origin main` directamente. Esta sesión está sujeta a una política de plataforma que exige desarrollar y empujar únicamente a la rama designada `claude/quirky-dijkstra-0s7q6n`, nunca a `main` sin permiso explícito. Todos los commits de hoy se han empujado a esa rama (partía de main sin divergencia) en vez de a `main` directamente. Como consecuencia, **el push de hoy no dispara el pipeline de GitHub Actions que construye, despliega en Vercel y hace el smoke test**; hace falta que un humano revise y mergee la rama a `main` para que el ciclo de despliegue/email habitual se complete. Se ha abierto notificación aparte sobre esto.
- Hallazgo del subagente de seo-015 (no corregido hoy, fuera de alcance de esa tarea): la Regla 1 de scripts/auditar-money-set.mjs no filtra por indexabilidad real del sitemap, así que sigue reportando el par novedades/cambios-2026 como canibalizado aunque el canonical y el sitemap ya lo resuelven correctamente. Se recomienda un ítem de backlog de seguimiento.
- Ninguna ruta prohibida fue tocada por ningún subagente; `npm run build` pasó en verde tras cada una de las 5 tareas.

## Estado del backlog
7 pendientes · 18 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes
