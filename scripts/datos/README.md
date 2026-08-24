# Datos de rendimiento (export manual)

Los agentes de la routine no tienen acceso a Search Console ni a GA4 desde su
entorno. Estos CSV son el puente: `scripts/auditar-money-set.mjs` los lee
automáticamente si existen y cruza impresiones, clics y posición por URL.

| Archivo | Origen | Periodo |
|---|---|---|
| `gsc-paginas-*.csv` | Search Console → Rendimiento → Páginas | 1 jul – 24 ago 2026 |
| `gsc-consultas-*.csv` | Search Console → Rendimiento → Consultas | 1 jul – 24 ago 2026 |

Formato esperado por el auditor: cabecera con una columna de URL
(`Página`/`Page`/`URL`) y las de `Clics`, `Impresiones` y `Posición`. Sin comas
dentro de los valores (el parser es sencillo, separa por comas).

**Para actualizarlo:** exporta de nuevo desde Search Console, guarda el CSV aquí
con el periodo en el nombre y borra el anterior si ya no aporta. Cuanto más
reciente sea este directorio, menos "a ciegas" decide el estratega.
