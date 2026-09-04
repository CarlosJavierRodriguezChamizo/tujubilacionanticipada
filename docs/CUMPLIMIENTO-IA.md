# Registro de cumplimiento — Reglamento (UE) 2024/1689 (Reglamento de IA)

Documento interno de tujubilacionanticipada.com. No se publica: la versión
pública para usuarios es `/transparencia-ia` (`src/pages/transparencia-ia.astro`).

Su función es doble: dejar por escrito **qué se ha hecho y dónde está** (si
alguna vez hay que acreditarlo, la prueba es el repositorio) y **qué queda
abierto**, para que no se pierda entre commits.

- **Versión:** 1.0
- **Última revisión:** septiembre de 2026
- **Responsable:** titular del sitio (ver `LEGAL` en `src/consts.ts`)
- **Fuente única de las declaraciones públicas:** `IA` en `src/consts.ts`

---

## 1. Rol y alcance

El sitio es **responsable del despliegue** (*deployer*, art. 3.4 RIA) de
sistemas de IA de terceros. No los desarrolla, no los reentrena, no los pone en
el mercado ni los integra en un producto propio, así que no asume obligaciones
de proveedor (arts. 16 y ss.) ni de proveedor de modelos de uso general
(arts. 53 y ss.).

Ámbito territorial: el sitio se dirige a usuarios en España, luego el RIA
aplica sin discusión (art. 2).

## 2. Inventario de sistemas de IA

| ID | Sistema | Finalidad | Salida visible en | Riesgo |
|---|---|---|---|---|
| `redaccion` | Modelo de lenguaje generativo (Claude, Anthropic) | Redactar el borrador de los artículos del blog | `/blog/**` | Limitado (art. 50.4) |
| `ilustracion` | Modelo de generación de imágenes (Magnific / Freepik) | Ilustración de portada de cada artículo | `public/blog/*.jpg` | Limitado (art. 50.4, párr. 1.º, por analogía) |
| `mantenimiento` | Agentes de desarrollo asistidos por IA (Claude Code) | Mantener código y auditar contenido | No produce contenido informativo | Sin obligación específica |

El inventario legible por el usuario está en `IA.sistemas` (`src/consts.ts`) y
se publica en `/transparencia-ia`. **Si se añade un sistema de IA, se añade
primero ahí**: todas las páginas leen de esa constante.

### Sistemas que NO son IA (y por qué importa declararlo)

`src/lib/pension-calculo.ts` es un motor **determinista**: aplica coeficientes
y umbrales de la LGSS. No infiere, no genera salidas a partir de patrones
aprendidos y no se adapta tras el despliegue, así que no encaja en la
definición del art. 3.1 RIA. Lo mismo vale para el precheck de
`api/informe-crear.ts`.

Declararlo es una medida de cumplimiento en sí misma: evita que el usuario —o
un inspector— presuma capacidades de IA donde no las hay, y sostiene la
afirmación pública de que «tus cifras no las calcula una IA».

## 3. Clasificación de riesgo

**Prácticas prohibidas (art. 5): ninguna.** Revisado punto por punto. El más
pertinente es el art. 5.1.b) (explotación de la vulnerabilidad por edad o
situación socioeconómica): el público del sitio son personas de 50 a 65 años
decidiendo sobre su pensión, es decir, un grupo al que ese artículo protege de
forma expresa. No se usa IA para explotar esa vulnerabilidad, ni técnicas
subliminales, ni urgencia artificial, ni puntuación de personas. La decisión de
`ESTRATEGIA.md` de prohibir cuentas atrás, precios tachados y prueba social
fabricada refuerza este punto.

**Alto riesgo (art. 6 y anexo III): no aplica.** El punto 5.a) del anexo III
—evaluar la admisibilidad a prestaciones y servicios públicos esenciales—
alcanza a las autoridades públicas o a quien actúa en su nombre. Este sitio no
resuelve prestaciones, no actúa por cuenta de la Seguridad Social y no produce
efectos sobre el derecho de nadie: publica información y vende un cálculo
orientativo. Tampoco hay solvencia crediticia (5.b), empleo (4) ni educación
(3). Y, en todo caso, ese cálculo no lo hace un sistema de IA.

**Riesgo limitado (art. 50): sí aplica.** Es la categoría del sitio y la razón
de todo lo que sigue.

## 4. Medidas implantadas y dónde está la prueba

| Obligación | Medida | Archivo |
|---|---|---|
| Art. 50.4, párr. 2.º — divulgar el texto generado por IA | Etiqueta visible junto a la firma de cada artículo + bloque de divulgación al final | `src/components/AvisoIA.astro`, `src/layouts/BlogPost.astro` |
| Art. 50.4, párr. 1.º — ultrafalsificaciones | No se generan. Las ilustraciones se etiquetan igualmente con un pie bajo la imagen | `src/layouts/BlogPost.astro` |
| Art. 50.5 — clara, distinguible, en la primera exposición y accesible | Texto real (no imagen ni solo color), sin desplegables, encima del artículo; también en el listado del blog y en el pie de todas las páginas | `src/components/AvisoIA.astro`, `src/components/BlogListing.astro`, `src/components/Footer.astro` |
| Marcado legible por máquina | `<meta name="ai-generated-content">`, `ai-content-human-review`, `ai-disclosure`; `digitalSourceType` (PLUS/IPTC) en el nodo WebPage y `publishingPrinciples` en Organization y Article | `src/components/BaseHead.astro`, `src/lib/schema.ts` |
| Declaración pública completa | Página indexable con inventario, supervisión, límites, derechos y clasificación de riesgo | `src/pages/transparencia-ia.astro` |
| Coherencia con la información legal | Sección propia en el aviso legal y en la política de privacidad | `src/pages/aviso-legal.astro`, `src/pages/privacidad.astro` |
| Honestidad sobre la autoría | «Sobre este sitio» y la ficha del revisor dicen que el borrador lo redacta una IA | `src/pages/sobre-este-sitio.astro`, `src/pages/equipo/javier-rodriguez.astro` |
| Transparencia de lo que NO es IA | Aviso en el simulador, en `/informe` y en `/informe/no-aplica` | `src/pages/simulador.astro`, `src/pages/informe.astro`, `src/pages/informe/no-aplica.astro` |
| Art. 22 RGPD — decisiones automatizadas | Se explica el precheck automático antes de rellenar el formulario y en su página de resultado, con vía a revisión humana | `src/pages/informe.astro`, `src/pages/informe/no-aplica.astro`, `src/pages/privacidad.astro` |
| Que la divulgación no se pueda desactivar en silencio | El validador bloquea el deploy si un artículo pone `aiTextGenerated`/`aiImageGenerated` a `false` sin motivo escrito | `scripts/validate-frontmatter.mjs` |
| Que el pipeline no la rompa | Instrucciones explícitas al redactor y a la routine diaria | `scripts/PROMPT_REDACTOR.md`, `ROUTINE_PROMPT.md` |

## 5. Alfabetización en materia de IA (art. 4)

Obligación en vigor desde el 2 de febrero de 2025 y aplicable a **todo el
personal que opera estos sistemas**, incluida una operación de una sola
persona. Quien publique en este sitio debe conocer, como mínimo:

1. **Qué sistemas se usan y para qué** (sección 2 de este documento).
2. **Que un modelo de lenguaje afirma con seguridad datos falsos.** El caso
   real del sitio: el coeficiente reductor fijo del 1,875 % por trimestre,
   derogado en 2022, se publicó en 28 artículos porque está por todo internet y
   el modelo lo repitió. De ahí `scripts/auditar-normativa.mjs`.
3. **Que ninguna cifra normativa se publica sin enlace a su fuente oficial**, y
   que el enlace se comprueba, no se supone.
4. **Que la etiqueta de IA describe el proceso real** y solo se cambia cuando
   cambia el proceso.
5. **Qué NO puede hacer el sitio**: dar asesoramiento personalizado, resolver
   prestaciones o sustituir a la Seguridad Social.

Material de referencia: este documento, `scripts/PROMPT_VERIFICADOR.md` y
`/transparencia-ia`. Revisión recomendada: en cada replanificación estratégica.

## 6. Procedimiento ante una incidencia

1. **Entrada.** Aviso por email (`hola@tujubilacionanticipada.com`), hallazgo de
   la auditoría automática o detección propia.
2. **Contraste.** Se comprueba el dato contra la fuente oficial (BOE, Seguridad
   Social, SEPE, CNMV). Fuera de esas fuentes no se resuelve nada.
3. **Corrección.** Se corrige el artículo, se actualiza `updatedDate` y, si el
   error afectaba a varios artículos, se busca el patrón en todos.
4. **Respuesta.** Se contesta a quien avisó contando qué se hizo.
5. **Registro.** Si el error nace de una limitación del modelo, se anota en
   `scripts/DECISIONES.md` y, si procede, se añade una comprobación automática
   para que no vuelva a pasar.

## 7. Puntos abiertos (los tiene que cerrar el titular)

1. **Realidad de la revisión humana.** La exención del art. 50.4 y toda la
   información publicada dan por hecho que cada artículo se revisa antes de
   publicarse. Si la routine diaria llegara a publicar sin esa revisión, hay que
   ajustar el texto de `IA.revisionHumana` y `IA.etiquetaArticulo` en
   `src/consts.ts` — no mantenerlo por inercia. Una divulgación inexacta expone
   a más que no tener ninguna (prácticas comerciales desleales, RDL 1/2007).
2. **Identificación del responsable.** `LEGAL.titular`, `LEGAL.nif` y
   `LEGAL.domicilio` siguen vacíos en `src/consts.ts`. La responsabilidad
   editorial que declara el aviso legal necesita un titular identificado
   (art. 10 LSSI-CE); mientras estén vacíos, el bloque de identificación no se
   publica y la declaración queda a medias.
3. **Imágenes de personas.** Las ilustraciones de portada no representan
   personas reales y no son ultrafalsificaciones. Distinto es `public/avatars/`
   (hoy oculto, `ASESORAMIENTO.socialProofCount = 0`) y la foto de
   `public/equipo/javier-rodriguez.jpg`: si alguna de esas imágenes fuera
   generada con IA, presentarla como una persona real sería a la vez un
   problema de art. 50.4 y de práctica comercial engañosa. Confirmar el origen
   de ambas antes de mostrarlas.
4. **Chatbot.** Si algún día se añade un asistente conversacional, activa el
   art. 50.1: hay que avisar antes de la primera interacción, y esta página y
   `/transparencia-ia` deben actualizarse antes del despliegue.

## 8. Calendario de revisión

- **Semestral**, o antes si cambia el proceso de producción de contenido, si se
  añade o sustituye un sistema de IA, o si se publica nueva normativa o guía de
  la Comisión sobre el art. 50.
- Cada revisión sube `IA.version` y `IA.actualizado` en `src/consts.ts`, que es
  lo que ve el usuario en `/transparencia-ia`.

## 9. Referencias

- Reglamento (UE) 2024/1689 — arts. 3, 4, 5, 6, 50 y anexo III.
  <https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX%3A32024R1689>
- Reglamento (UE) 2016/679 (RGPD) — art. 22.
- Ley 34/2002 (LSSI-CE) — art. 10.
- RDL 1/2007 y Ley 3/1991 — prácticas comerciales con consumidores.
- IPTC *Digital Source Type* NewsCodes y propiedad `digitalsourcetype` de PLUS,
  usadas para el marcado legible por máquina.
