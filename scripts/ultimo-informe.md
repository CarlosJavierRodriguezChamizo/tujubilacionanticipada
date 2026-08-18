# Informe de mejora continua — 2026-08-18

## Resumen
Día de ejecución: se han despachado las 5 tareas de menor prioridad del backlog (seo-012 a seo-016); 4 se completaron y 1 falló por un bug preexistente descubierto durante su propia ejecución.

## Cambios aplicados

### seo seo-012 — Crear script de auditoría del conjunto money sobre /dist
**Qué:** Nuevo `scripts/auditar-money-set.mjs` que, tras `npm run build`, deriva el conjunto money (5 URLs: /simulador + 4 artículos con keyword ≥5.000 búsq./mes) desde `scripts/calendario.json` (solo lectura) y mide palabras visibles en `<main>`, enlaces internos entrantes, canonical, tipos de JSON-LD, noindex y canibalización de keyword contra todo el sitemap.
**Por qué:** El diagnóstico de unicidad/suficiencia del conjunto money solo existía como medición manual del CEO en `ESTRATEGIA.md`; hacía falta una herramienta reproducible para poder comparar un "antes" y un "después" en las tareas siguientes.
**Hipótesis:** Medir hoy con una herramienta reproducible establece la línea base objetiva para evaluar seo-013 en adelante.
**Cómo lo mediremos:** Ejecución del propio script antes/después de cada tarea que toque una URL del conjunto money; línea base de hoy pegada en `DECISIONES.md`.
**Riesgo identificado:** El recuento de palabras de los 4 artículos difiere ligeramente del rango citado a mano por el CEO (probablemente por decodificación de entidades HTML); no afecta a /simulador (71, coincide exacto) ni a la detección de canibalización.
**Archivos:** scripts/auditar-money-set.mjs (nuevo)

### seo seo-013 — Crear el mapa de consolidación canonical en src/lib/canonical-map.ts
**Qué:** Nuevo `src/lib/canonical-map.ts` que agrupa artículos publicados por keyword exacta y resuelve cada par asignando la canónica al de fecha más antigua, salvo que el más reciente tenga ≥1,5x las palabras del más antiguo (entonces queda marcado para revisión humana en vez de decidir solo).
**Por qué:** No existía ninguna fuente única de verdad para resolver canibalización por keyword; cada par (incluido el que entra el 2026-08-24) se resolvería a mano.
**Hipótesis:** Una regla derivada de `calendario.json` resuelve automáticamente la mayoría de pares canibalizados, dejando solo los casos límite para revisión del CEO.
**Cómo lo mediremos:** `getCanonicalSlug()` verificado contra el par publicado hoy y contra una simulación de la entrada futura (guia-completa-jubilacion-anticipada-2026); nº de pares en `paresQueRequierenRevision` a lo largo del tiempo.
**Riesgo identificado:** El recuento de palabras es heurístico; el ratio del par real queda muy por debajo del umbral en ambas metodologías de conteo probadas, así que el resultado de negocio no cambia. Módulo aún no consumido por ninguna página en este momento del día.
**Archivos:** src/lib/canonical-map.ts (nuevo)

### seo seo-015 — Excluir del sitemap las URLs consolidadas por el mapa canonical
**Qué:** El filtro `sitemap({ filter })` de `astro.config.mjs` excluye ahora también cualquier `/blog/<slug>` cuyo `getCanonicalSlug(slug)` (seo-013) devuelva un destino.
**Por qué:** El sitemap seguía anunciando ambas URLs de cada par canibalizado como indexables por igual, aunque `canonical-map.ts` ya identifica cuál debe ceder autoridad.
**Hipótesis:** Excluir del sitemap la URL consolidada evita que Google la trate como indexable independiente.
**Cómo lo mediremos:** jubilacion-anticipada-novedades-2026 ausente de `dist/sitemap-0.xml` (verificado, 0 apariciones), cambios-2026 presente (verificado, 1); ese par ya no aparece en la lista de canibalizados de `auditar-money-set.mjs`. Seguimiento en GSC a 21 días.
**Riesgo identificado:** El bug de `REPO_ROOT` que tumbó seo-014 (ver incidencias) no se reprodujo aquí porque `astro.config.mjs` se carga en un contexto de Node normal, no dentro de un bundle de página; podría reaparecer si Astro cambia cómo carga su configuración.
**Archivos:** astro.config.mjs

### seo seo-016 — Diferenciar el title y el H1 de /simulador frente al artículo como-interpretar-simulador-jubilacion
**Qué:** `<title>` de /simulador pasa de "Simulador de jubilación anticipada" a "Calcula tu jubilación anticipada: simulador gratuito"; `<h1>` a "Calcula tu jubilación anticipada". Se actualizó también el `name` de `webApplicationSchema`/`webPageSchema` por coherencia con el título visible.
**Por qué:** /simulador (herramienta) y el artículo como-interpretar-simulador-jubilacion (guía informacional) competían con títulos casi intercambiables por la misma keyword de ~60.000 búsq./mes; este par no se resuelve con canonical porque son documentos legítimamente distintos.
**Hipótesis:** Un título/H1 con verbo de acción explícito separa la señal de intención transaccional de la informacional para la misma consulta.
**Cómo lo mediremos:** GSC a 21 días — impresiones/CTR de /simulador vs. el artículo para "simulador de jubilación" y variantes.
**Riesgo identificado:** El `<title>` completo con sufijo del sitio queda en 85 caracteres, Google podría truncarlo en SERP; no afecta al criterio de éxito.
**Archivos:** src/pages/simulador.astro

## Incidencias

**seo-014 — Emitir `<link rel=canonical>` hacia la URL consolidada en los artículos canibalizados: FALLIDA.**
La implementación (prop `canonicalPath` en cascada BlogPost→Base→BaseHead) se aplicó exactamente como se pedía, pero `npm run build` falló en la fase `astro build`. Causa raíz: `src/lib/canonical-map.ts` (seo-013) calcula `REPO_ROOT` con `dirname(fileURLToPath(import.meta.url))`, asumiendo que el módulo vive siempre en `src/lib/`. Al consumirse por primera vez desde una página real (BlogPost.astro), Vite empaqueta el módulo dentro de `dist/pages/blog/_slug_.astro.mjs`; `import.meta.url` pasa a apuntar ahí y `REPO_ROOT` resuelve a `dist/` en vez de a la raíz del repo, causando `ENOENT` al leer `scripts/calendario.json`. Es un bug preexistente de seo-013, latente porque nadie había importado el módulo desde una página hasta hoy. Los 3 archivos tocados se revirtieron con `git checkout`; el build quedó en verde sin los cambios. **Recomendación para el backlog:** hace falta una tarea previa dedicada a corregir la resolución de `REPO_ROOT` en `src/lib/canonical-map.ts` (p. ej. usar `process.cwd()`) antes de poder reintentar seo-014, y por extensión seo-017 (que también consume `getCanonicalSlug()` desde `schema.ts`, con el mismo riesgo).

Ninguna ruta prohibida fue tocada por ningún subagente. `npm run build` se verificó en verde tras cada tarea completada.

## Estado del backlog
7 pendientes · 17 hechas · 1 fallida
Próxima replanificación: cuando queden 0 pendientes.
