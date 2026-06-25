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

## Paso 3b — Generar la imagen destacada (Magnific)

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

## Paso 5 — Git commit y push

Si el artículo ha sido aprobado:

```bash
git add src/content/blog/[slug].mdx
# Incluye la imagen destacada si se generó (ignora el error si no existe):
git add public/blog/[slug].jpg 2>/dev/null || true
git commit -m "content: artículo #[id] — [titulo]

keyword: [keyword]
silo: [silo]
verificado: sí"

git push origin main
```

## Paso 6 — Marcar como publicado

Actualiza `scripts/calendario.json`: cambia `"publicado": false` a `"publicado": true`
en el artículo que acaba de procesarse (busca por `id`).

```bash
git add scripts/calendario.json
git commit -m "chore: artículo #[id] marcado como publicado"
git push origin main
```

## Paso 7 — Log final

Escribe un resumen de lo que has hecho:
- Artículo procesado: #[id] — [titulo]
- Intentos de verificación necesarios: [N]/3
- Resultado: PUBLICADO o FALLO
- Fecha y hora de ejecución

---

## Reglas generales de esta routine

- Nunca publiques un artículo que no haya superado la verificación
- Nunca inventes datos o fuentes — solo fuentes oficiales (seg-social.es, boe.es, etc.)
- Si hay algún error de git o de escritura de archivo, para y escríbelo en el log
- Esta routine usa la rama `main` — asegúrate de hacer pull antes de cualquier cambio
  para evitar conflictos si hubiera commits manuales recientes
