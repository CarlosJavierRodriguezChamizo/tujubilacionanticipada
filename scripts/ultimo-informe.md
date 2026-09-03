# Informe de mejora continua — 2026-09-03

## Resumen
Completada seo-020: /simulador añade el enlace visible al simulador oficial de la Seguridad Social y un bloque explícito de limitaciones de la estimación.

## Cambios aplicados

### seo seo-020 — Añadir a /simulador las fuentes normativas, coeficientes reductores y enlace al simulador oficial de la Seguridad Social
**Qué:** Las tablas de coeficientes reductores con fuente oficial (boe.es) ya existían desde seo-022 (2026-08-30), así que no se duplicaron. Se añadió lo que realmente faltaba: un bloque "Limitaciones de esta estimación" bajo el aviso legal existente, con lista explícita de lo que la calculadora no hace (historial real de cotizaciones, complementos/mínimos por cónyuge/pluriactividad/regímenes especiales, IRPF; importes de pensión mínima/máxima del ejercicio 2026), y un enlace visible y destacado al simulador oficial de la Seguridad Social (prestaciones.seg-social.es), `target="_blank" rel="noopener"` sin nofollow.
**Por qué:** ESTRATEGIA.md exige que /simulador compita como documento frente al simulador oficial explicando sus límites, no ocultando que existe una alternativa oficial.
**Hipótesis:** Confirmada en cuanto al criterio de éxito (enlace + limitaciones publicados); el efecto en tráfico/posición se mide a 21 días en Search Console.
**Cómo lo mediremos:** `node scripts/auditar-money-set.mjs` tras el build: /simulador con 2269 palabras únicas en `<main>` (umbral 1200), sin noindex. El único fallo que sigue reportando ese script es la canibalización preexistente /simulador vs como-interpretar-simulador-jubilacion, no causada por esta tarea (tocar el artículo de blog está prohibido para esta routine).
**Riesgo identificado:** La URL de seg-social.es no se pudo verificar con una petición en vivo por el proxy de red del entorno del agente; se basa en resultados de búsqueda que la identifican como el simulador oficial de pensión de jubilación. Recomendable confirmarla manualmente en el primer despliegue.
**Archivos:** src/pages/simulador.astro

## Incidencias

- **`ux-003` y `ux-004` quedan pendientes para mañana**: las tres tareas pendientes con prioridad más baja (seo-020, ux-003, ux-004) sugerían el mismo archivo (`src/pages/simulador.astro`); la regla de la routine limita a una tarea por archivo y día, así que solo se despachó la de mayor prioridad (seo-020).
- **`cro-007` y `cro-008` siguen bloqueadas y no se han despachado**: `LEGAL.titular`, `LEGAL.nif` y `LEGAL.domicilio` en `src/consts.ts` siguen con marcadores sin rellenar; sin ellos no hay cuenta de Stripe y ningún agente puede resolverlo.
- **No se pudo hacer push a `main`**: el entorno de ejecución de esta sesión tiene restringido el push a la rama de trabajo asignada (`claude/quirky-dijkstra-wcaqor`), no a `main` directamente, así que el commit de hoy se ha publicado ahí en vez de en `main` como describe esta routine. Al revisar el estado del repositorio se ha detectado que **`main` lleva parado en el commit del 2026-08-30** ("fix: acortar el `<title>` de /informe/no-aplica"), mientras que 5 commits de trabajo real (2 mejoras SEO/CRO y 3 artículos de blog, del 2026-08-30 al 2026-09-02) llevan acumulados en esa rama sin fusionar y sin ningún Pull Request abierto que los traiga a `main`. Si el despliegue a producción depende de un push directo a `main` (como describe esta routine), **no ha habido ningún despliegue nuevo desde el 30 de agosto**, aunque el trabajo se siga generando y verificando correctamente cada día. Esto necesita revisión humana: decidir si se fusiona la rama a `main` (y con qué mecanismo, dado que las sesiones automatizadas no pueden hacerlo directamente) o si se ajusta esta routine para abrir/actualizar un Pull Request en vez de asumir push directo.

## Estado del backlog
4 pendientes (2 bloqueadas: cro-007, cro-008) · 30 hechas · 6 fallidas
Próxima replanificación: cuando queden 0 pendientes
