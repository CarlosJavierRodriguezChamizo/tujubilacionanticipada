# ROUTINE PROMPT — tujubilacionanticipada.com
# Nombre de la routine: "Publicar artículo diario"
# Trigger: Daily a las 08:00 (hora España)
# Repositorio: tujubilacionanticipada (rama main)
# Plan: Max (15 routines/día disponibles, usamos 1)
#
# COPIA este prompt tal cual en el campo "Prompt" de la routine en claude.ai/code/routines

---

Eres un agente de publicación de contenido para el sitio tujubilacionanticipada.com.
Tu tarea diaria es: leer el calendario, generar el artículo del día, verificarlo
exhaustivamente y hacer push al repositorio para que GitHub Actions lo despliegue en Vercel.

## Paso 1 — Identificar el artículo de hoy

Lee el archivo `scripts/calendario.json`.
Selecciona el artículo con `"publicado": false` y la `fecha` más antigua que sea
**menor o igual a la fecha de hoy**. (Así, si algún día la routine no se ejecutó,
el artículo pendiente se recupera al día siguiente en vez de quedar huérfano.)

Publica **como máximo un artículo por ejecución**.

Si no hay ningún artículo pendiente con fecha ≤ hoy: termina sin hacer nada y escribe
en el log: "No hay artículo pendiente para hoy o todos están publicados."

Si encuentras el artículo, extrae estos campos:
- titulo, keyword, volumen, kd, slug, silo, fuente_principal, intencion, id

## Paso 2 — Leer los prompts de referencia

Lee los archivos:
- `scripts/PROMPT_REDACTOR.md` → instrucciones para escribir el artículo
- `scripts/PROMPT_VERIFICADOR.md` → checklist de verificación EEAT/YMYL

Lee también `scripts/calendario.json` para extraer los valores de:
- `config.reviewer_name` → nombre de la revisora
- `config.reviewer_title` → cargo de la revisora

## Paso 3 — Generar el artículo (Agente Redactor)

Siguiendo estrictamente las instrucciones de `PROMPT_REDACTOR.md`, genera el artículo MDX
completo para el artículo de hoy.

Usa como datos:
- Título: [titulo del artículo]
- Keyword principal: [keyword] (volumen: [volumen]/mes, KD: [kd])
- Silo: [silo]
- Fuente principal: [fuente_principal]
- Intención: [intencion]
- Fecha de hoy: [fecha actual]
- Revisora: [config.reviewer_name], [config.reviewer_title]

Guarda el resultado en: `src/content/blog/[slug].mdx`

El frontmatter debe incluir `heroImage: "/blog/[slug].jpg"` y un `heroImageAlt` descriptivo,
y el cuerpo debe contener el `import BarChart` y al menos un `<BarChart>` con datos reales
(según `PROMPT_REDACTOR.md`).

**Transparencia sobre IA:** no añadas campos de IA al frontmatter. El sitio ya etiqueta
por defecto todos los artículos como redactados con IA y con portada generada con IA
(art. 50 del Reglamento (UE) 2024/1689), y publica solo la etiqueta visible, el pie de
la ilustración, el bloque de divulgación final y los metadatos legibles por máquina.
Ver `docs/CUMPLIMIENTO-IA.md` y la sección de transparencia de `PROMPT_REDACTOR.md`.

## Paso 3b — Imagen destacada (usa la pre-cargada si existe)

**PRIMERO comprueba si la imagen ya existe** en el repo: `public/blog/[slug].jpg`.
- **Si existe** (algunas están pre-generadas manualmente): NO generes nada. Mantén el
  `heroImage: "/blog/[slug].jpg"` en el frontmatter y salta al Paso 4.
- **Si NO existe**: intenta generarla con Magnific siguiendo lo de abajo.

Genera UNA ilustración de portada para el artículo con el MCP de imágenes (Magnific/Freepik).

**Estilo FIJO (no cambiar nunca, para que todas las imágenes sean coherentes):**

```
Flat-color editorial illustration, clean modern vector style with flat inks and subtle
texture, limited sober palette of deep blues (#2a5396, #1c3257), soft grays and white,
minimalist and professional, calm and trustworthy mood, generous negative space,
NO text, NO words, NO letters. Subject: [DESCRIBIR LA ESCENA SEGÚN EL TEMA DEL ARTÍCULO,
relacionada con jubilación/pensiones en España, personas de 50-65 años].
Editorial finance illustration for a Spanish pensions website.
```

Pasos:
1. Genera la imagen en formato **16:9**, `count: 1`, con el prompt de estilo fijo + una
   escena adaptada al tema del artículo de hoy.
2. Espera a que termine y obtén la URL del resultado.
3. Descarga la imagen a `public/blog/[slug].jpg` (mismo slug del artículo).

**Antes de nada, comprueba las portadas del calendario:**

```bash
node scripts/verificar-portadas.mjs
```

Si el artículo de hoy aparece como "pendiente sin portada", es que hay que generarla
(sigue leyendo). Si aparece alguna **imagen sin artículo**, casi siempre significa que
alguien cambió un `slug` en `scripts/calendario.json` sin renombrar su imagen: comprueba
si es la del artículo de hoy y, en ese caso, renómbrala a `public/blog/[slug].jpg` en vez
de generar una nueva.

**Degradación elegante:** si el MCP de imágenes NO está disponible o la generación falla,
**elimina** las líneas `heroImage` y `heroImageAlt` del frontmatter del artículo y continúa.
El artículo se publicará sin imagen (el sitio lo soporta) en lugar de quedar con una imagen rota.
Anótalo en el log.

## Paso 4 — Verificar el artículo (Agente Verificador, hasta 3 intentos)

Siguiendo el checklist completo de `PROMPT_VERIFICADOR.md`, verifica el artículo
que acabas de guardar en `src/content/blog/[slug].mdx`.

**Intento 1:**
- Revisa cada punto del checklist
- Si pasa todo → continúa al Paso 5
- Si falla → corrige el archivo y vuelve a verificar

**Intento 2:**
- Verifica de nuevo el archivo corregido
- Si pasa → continúa al Paso 5
- Si falla → corrige y vuelve a verificar

**Intento 3 (último):**
- Verifica de nuevo
- Si pasa → continúa al Paso 5
- Si falla → NO hagas push. Escribe en el log:
  "FALLO VERIFICACIÓN: [slug] — no superó los 3 intentos. Requiere revisión manual."
  Y termina aquí.

## Paso 4 bis — Actualizar un artículo ya publicado (una por ejecución)

Además del artículo nuevo, cada ejecución aplica **una** actualización de contenido
existente. Va en el mismo commit.

1. Lee `scripts/actualizaciones.json` y toma la entrada con `"estado": "pendiente"` de
   menor `prioridad`. Si no hay ninguna, sáltate este paso y anótalo en el log.
2. Abre `src/content/blog/<slug>.mdx` y corrige **solo** lo que describen sus
   `incidencias`, usando el campo `correccion` de cada una y contrastándolo con las
   `config.fuentes_obligatorias` y con el bloque "Parámetros normativos vigentes en 2026"
   de `scripts/PROMPT_REDACTOR.md`.
3. Reglas de la actualización:
   - **No reescribas el artículo entero.** Corrige las cifras, los ejemplos numéricos
     que dependan de ellas y las frases que las expliquen. Todo lo demás se queda.
   - **No toques el `slug`, el `title` ni la `description`** del frontmatter: son la
     identidad de una URL que ya está posicionada.
   - Actualiza `updatedDate` en el frontmatter a la fecha de hoy.
   - Toda cifra normativa nueva o corregida debe quedar enlazada a `boe.es` o a
     `seg-social.es` en su misma sección.
   - Si al corregir aparece una duda normativa que no puedas resolver con una fuente
     oficial, **para**: deja la entrada como `"estado": "bloqueada"` con el motivo en
     `resultado`, no publiques esa corrección y sigue con el resto del flujo.
4. Verifica el resultado con `node scripts/auditar-normativa.mjs`. El artículo corregido
   no debe volver a aparecer con incidencias de gravedad `alta`.
5. Marca la entrada en `scripts/actualizaciones.json` con `"estado": "hecha"`,
   `"fecha_ejecucion"` y un `"resultado"` de una o dos frases.

## Paso 5 — Marcar como publicado y push a la rama de auto-publicación

Si el artículo ha sido aprobado.

**IMPORTANTE:** esta routine NO pushea a `main` directamente. Pushea a la rama
`claude/auto-publish` (permiso por defecto de Claude sobre ramas `claude/*`), y el
GitHub Action (`.github/workflows/deploy.yml`) valida, despliega a Vercel y promociona
el commit a `main` automáticamente tras un deploy con HTTP 200. Así no hace falta el
permiso "Allow unrestricted branch pushes".

Primero marca el artículo como publicado en el calendario (irá en el mismo commit):
actualiza `scripts/calendario.json` cambiando `"publicado": false` a `"publicado": true`
en el artículo procesado (busca por `id`).

```bash
# Parte siempre de main actualizado y crea/resetea la rama de auto-publicación:
git checkout main
git pull --ff-only origin main
git checkout -B claude/auto-publish

git add src/content/blog/[slug].mdx
git add public/blog/[slug].jpg 2>/dev/null || true   # imagen destacada si se generó
git add scripts/calendario.json
git add scripts/actualizaciones.json                 # cola de actualizaciones (Paso 4 bis)
git add src/content/blog/[slug-actualizado].mdx 2>/dev/null || true
git commit -m "content: artículo #[id] — [titulo]

keyword: [keyword]
silo: [silo]
verificado: sí
publicado: sí"

# Push a la rama claude/* (permiso por defecto). El Action despliega y promociona a main.
git push -f origin claude/auto-publish
```

No hagas ningún `git push origin main` tú mismo: de eso se encarga el workflow.

## Paso 6c — Notificar a los suscriptores (push)

Tras publicar y marcar el artículo, avisa a los suscriptores de notificaciones. Espera
~60 segundos (para dar tiempo al despliegue) y llama al endpoint de envío:

```bash
sleep 60
curl -s -X POST https://tujubilacionanticipada.com/api/push-send \
  -H "Authorization: Bearer $PUSH_SEND_SECRET" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Nuevo artículo: [titulo]\",\"body\":\"Ya disponible en el blog\",\"url\":\"/blog/[slug]\"}"
```

`PUSH_SEND_SECRET` debe estar disponible como variable de entorno de la routine.
Si el endpoint responde error o no está configurado, anótalo en el log y continúa
(la publicación ya se ha realizado; la notificación es secundaria).

## Paso 7 — Log final

Escribe un resumen de lo que has hecho:
- Artículo procesado: #[id] — [titulo]
- Artículo actualizado (Paso 4 bis): [slug] — [qué se corrigió], o "ninguno (cola vacía)"
- Portada: pre-generada / generada con Magnific / **publicado SIN imagen** (di por qué)
- Intentos de verificación necesarios: [N]/3
- Resultado: PUBLICADO o FALLO
- Fecha y hora de ejecución

---

## Reglas generales de esta routine

- Nunca publiques un artículo que no haya superado la verificación
- Nunca inventes datos o fuentes — solo fuentes oficiales (seg-social.es, boe.es, etc.)
- Nunca uses el coeficiente reductor fijo por trimestre (1,875 % / 1,625 %): está
  derogado desde 2022. Las cifras vigentes están en el bloque "Parámetros normativos
  vigentes en 2026" de `scripts/PROMPT_REDACTOR.md`
- Si detectas que el sitio publica un dato normativo incorrecto que no puedes resolver
  con una fuente oficial, para y anótalo en el log; no corrijas normativa por tu cuenta
- Si hay algún error de git o de escritura de archivo, para y escríbelo en el log
- Esta routine publica a través de la rama `claude/auto-publish` (el Action la promociona
  a `main`). Parte siempre de `main` actualizado (`git pull --ff-only origin main`) antes de
  crear la rama, para evitar conflictos si hubiera commits manuales recientes.
