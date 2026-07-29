# Informe de mejora continua — 2026-07-29

## Resumen
Día de replanificación (primer ciclo del sistema): el backlog estaba vacío, así que hoy no se ha ejecutado ninguna tarea — se ha reescrito la estrategia y generado el backlog táctico para los próximos días.

## Replanificación

### Estratega CEO — `scripts/ESTRATEGIA.md`
**Aviso:** revisión a ciegas — sin acceso a Search Console, Ahrefs ni analítica real desde este entorno (el dominio en producción devuelve 403 a través del proxy de salida). El diagnóstico se basa en evidencia estructural verificada en el repositorio, no en métricas de tráfico.

**Diagnóstico:** sitio de 5 semanas, 31/60 artículos publicados, base técnica sólida (JSON-LD, canonical, sitemap, TOC, caja de revisor, Consent Mode). Tres roturas estructurales: (1) 23 de 31 artículos no tienen ningún enlace interno en el cuerpo, y el mecanismo automático de "lecturas recomendadas" elige por posición de fichero, no por tema; (2) los 4 silos del calendario editorial no existen como páginas — el sitio se publica como blog plano; (3) `src/consts.ts` publica marcadores de posición (`[TITULAR]`, `[NIF/CIF]`, `[DOMICILIO]`) en las páginas legales de un sitio YMYL con formulario.

**Cuello de botella elegido:** Autoridad (no visibilidad, relevancia ni conversión — descartadas con argumento explícito en ESTRATEGIA.md).

**Líneas de trabajo del ciclo:**
1. Silos reales — hubs de categoría y enlazado interno semántico (seo)
2. Responsable identificable y entidad de autoría (seo) — con bloqueo declarado para cualquier dato legal que no se pueda verificar
3. Instrumentación — baseline medible y primera visita limpia (cro)

### Product Owner — `scripts/BACKLOG.json`
15 tareas nuevas repartidas en 10 seo / 5 cro / 0 ux (no hay línea de UX este ciclo). Cada tarea referencia archivos reales verificados en el repo antes de escribirse.

Destaca **seo-10** (sustituir `[TITULAR]`/`[NIF/CIF]`/`[DOMICILIO]` en `src/consts.ts`): queda marcada `"estado": "bloqueada"` porque son datos legales que solo puede aportar el propietario del sitio — ningún agente los ha inventado ni asumido. Escalada a `cjrchamizo@gmail.com`.

`ultima_replanificacion` actualizado a `2026-07-29`.

## Incidencias
Ninguna. Ambos subagentes (estratega-ceo, product-owner) completaron y devolvieron su informe estructurado; `git status` confirma que solo se tocaron `scripts/ESTRATEGIA.md` y `scripts/BACKLOG.json` — ninguna ruta prohibida.

No se ejecuta `npm run build` en este ciclo porque no se ha tocado código de la aplicación, solo documentos de estrategia y backlog en `scripts/`.

## Estado del backlog
14 pendientes · 0 hechas · 1 bloqueada · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes (la tarea bloqueada no cuenta como pendiente para ese recuento; requiere el dato del propietario para desbloquearse, no una replanificación).
