# Informe de mejora continua — 2026-08-14

## Resumen
Ejecutadas las 3 tareas pendientes del backlog (ux-002, seo-010, seo-011): se enlazó la caja "Revisado por" a la página del revisor y se corrigió la concentración del enlazado interno automático, que dejaba 29 de 47 artículos sin ningún enlace entrante desde el cuerpo.

## Cambios aplicados

### ux ux-002 — Enlazar la caja "Revisado por" del artículo a la página del revisor
**Qué:** La foto y el nombre "Javier Rodríguez" en el <aside> "Revisado por" ahora son un enlace a /equipo/javier-rodriguez, reutilizando REVIEWER_PROFILES ya existente en src/lib/schema.ts.
**Por qué:** La caja no enlazaba a ningún sitio; en un YMYL, poder verificar con un clic quién revisa el contenido refuerza la confianza percibida.
**Hipótesis:** Enlazar el nombre del revisor a su página de entidad mejora la confianza percibida del lector.
**Cómo lo mediremos:** GSC/comportamiento a 21 días — CTR hacia /equipo/javier-rodriguez.
**Riesgo identificado:** Bajo. Foto y nombre son enlaces separados (no un único <a> envolviendo todo el aside), pero ambos superan individualmente el área táctil mínima recomendada.
**Archivos:** src/layouts/BlogPost.astro

### seo seo-010 — Crear script de medición de enlaces internos entrantes sobre /dist
**Qué:** Nuevo scripts/contar-enlaces-internos.mjs (Node ESM, sin dependencias nuevas) que cuenta, tras `npm run build`, cuántos artículos distintos enlazan a cada URL /blog/<slug> desde los bloques "Lectura recomendada" y "Artículos relacionados".
**Por qué:** No existía forma objetiva y repetible de verificar el diagnóstico de concentración del enlazado interno ni de medir el efecto de seo-011.
**Hipótesis:** Medir hoy establece la línea base "antes" necesaria para evaluar seo-011.
**Cómo lo mediremos:** Línea base registrada: mínimo 0, máximo 46, mediana 0, 29/47 artículos con 0 entrantes.
**Riesgo identificado:** El script depende de las clases CSS exactas de los bloques de recomendación; si su markup cambia, el script deberá actualizarse en paralelo. Solo lee /dist, no modifica contenido.
**Archivos:** scripts/contar-enlaces-internos.mjs

### seo seo-011 — Redistribuir la selección de "lectura recomendada" en rehypeInlineBlocks
**Qué:** rehypeInlineBlocks ya no arranca siempre en el primer artículo de la lista alfabética. Un nuevo índice cíclico agrupado por categoría (buildCategoryCycle) reparte las recomendaciones por artículo mediante un desplazamiento uniforme, y sube a 3 bloques de recomendación en artículos con ≥5 H2.
**Por qué:** El punto de partida fijo concentraba el enlazado interno automático en 2 artículos y dejaba 29 de 47 sin ningún enlace entrante, debilitando la señal de enlazado interno del sitio.
**Hipótesis:** Repartir el punto de partida por artículo, priorizando la misma categoría, distribuye el enlazado interno automático por todo el índice.
**Cómo lo mediremos:** scripts/contar-enlaces-internos.mjs — antes: mínimo 0 / máximo 46 / mediana 0 / 29 de 47 en 0. Después: mínimo 3 / máximo 14 / mediana 3 / 0 de 47 en 0. Seguimiento en GSC a 21-28 días sobre los artículos que antes tenían 0 entrantes.
**Riesgo identificado:** El reparto es determinista por posición (categoría + orden alfabético), no por relevancia semántica fina; dos artículos vecinos en la lista pero temáticamente distintos podrían recomendarse mutuamente. No introduce enlaces artificiales: siguen siendo enlaces reales entre artículos del propio blog. No se ha medido el efecto en Core Web Vitals ni CTR real.
**Archivos:** src/lib/rehype-plugins.mjs

## Incidencias
Ninguna. Las 3 tareas se ejecutaron con éxito, dentro de las rutas permitidas, y `npm run build` pasó tras cada una.

## Estado del backlog
0 pendientes · 13 hechas · 0 fallidas
Próxima replanificación: mañana (el backlog ha quedado a 0 pendientes; la routine de mañana invocará a estratega-ceo y product-owner en vez de ejecutar tareas).
