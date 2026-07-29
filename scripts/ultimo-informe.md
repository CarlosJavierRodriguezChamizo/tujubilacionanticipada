# Informe de mejora continua — 2026-07-29

## Resumen
Primera replanificación del ciclo: el backlog estaba vacío, así que se ha definido la estrategia inicial y generado un backlog de 13 tareas — no se ha ejecutado ninguna tarea hoy.

## Diagnóstico

Sin datos de GSC, GA4 ni Ahrefs accesibles en esta ejecución, el `estratega-ceo` ha basado el diagnóstico en la exploración directa del repositorio. Hallazgo principal: **la home, el JSON-LD `FAQPage` de `/simulador`, la landing de `/asesoramiento` y el propio motor del simulador (`src/components/Simulador.jsx`) publican un coeficiente reductor derogado** (1,875 %/trimestre en la modalidad voluntaria, 1,625 % en la forzosa — régimen anterior al RDL 21/2021), y el motor calcula el porcentaje sobre la base reguladora con una escala lineal inventada en vez de la escala legal real. En un sitio YMYL sobre pensiones, esto es información normativa incorrecta que puede influir en decisiones financieras reales de los usuarios.

El cuello de botella priorizado para este ciclo es **autoridad/corrección normativa** (por delante de visibilidad, dado que el dominio tiene solo 5 semanas, y de conversión, ya que no hay tráfico medido que optimizar). `scripts/ESTRATEGIA.md` queda reescrito con el diagnóstico completo y 3 líneas de trabajo, todas `seo`: (1) corregir el coeficiente reductor derogado en motor + home + FAQ + landing, (2) crear los 4 hubs de silo para el enlazado interno del blog, (3) convertir al revisor Javier Rodríguez en entidad verificable (`Person` con `@id`/`url`, sin inventar credenciales).

## Backlog generado

`scripts/BACKLOG.json` — 13 tareas, todas `seo`, priorizadas 1→13:

1. Reescribir el motor de cálculo del simulador con los coeficientes reductores reales (RDL 21/2021)
2. Corregir el coeficiente reductor derogado en la home
3. Sincronizar el FAQPage de /simulador con la normativa vigente
4. Corregir el coeficiente reductor en la landing de asesoramiento
5. Añadir enlace a fuente oficial en el resultado del simulador y actualizar el disclaimer
6. Crear el helper de slug de categoría para los 4 silos del blog
7. Crear las páginas hub de los 4 silos del blog
8. Enlazar la categoría del artículo al hub correspondiente
9. Enlazar los 4 hubs de silo desde el Footer (≤2 clics desde la home)
10. Crear la ficha de autor/revisor de Javier Rodríguez con datos verificables
11. Extender el JSON-LD para que reviewedBy referencie un Person con @id y url
12. Enlazar la ficha "Revisado por" de cada artículo a la página de autor
13. Verificar y, si procede, poblar Organization.sameAs con perfiles verificables

Las tareas 1-5 (corrección normativa) van primero por ser el riesgo YMYL más grave. Ninguna tarea toca `src/content/blog/**`, `scripts/calendario.json` ni `.github/**`.

## Incidencias
Ninguna. No se ha ejecutado ninguna tarea (día de replanificación, `ejecutar_tareas_el_dia_de_replanificacion: false`). El ciclo de ejecución empieza mañana, empezando por `seo-01` y `seo-02` (las 2 de mayor prioridad, según `max_tareas_por_dia: 2`).

**Nota operativa:** este commit se ha publicado en la rama `claude/quirky-dijkstra-fqstxz`, no directamente en `main` como describe la routine, porque la configuración de esta sesión restringe el push a esa rama. Un push directo a `main` sin revisión desplegaría automáticamente a producción; recomiendo revisar y fusionar manualmente, o ajustar la configuración de la sesión/routine si el push directo a `main` es el comportamiento deseado.

## Estado del backlog
13 pendientes · 0 hechas · 0 fallidas
Próxima replanificación: cuando queden 0 pendientes
