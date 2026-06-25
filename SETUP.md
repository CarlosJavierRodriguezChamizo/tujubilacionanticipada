# SETUP COMPLETO — tujubilacionanticipada.com
## Stack definitivo: Claude Code Routines + GitHub + Vercel + Gmail

---

## Arquitectura final

```
Claude Code Routine (nube Anthropic, 08:00 diario)
    │
    ├── Lee calendario.json → artículo del día
    ├── Lee PROMPT_REDACTOR.md → genera MDX
    ├── Lee PROMPT_VERIFICADOR.md → verifica (hasta 3 intentos)
    │     └── FALLO 3x → log de error → para (sin push)
    │
    └── APROBADO → git push → main
                       │
                       ▼
               GitHub Actions
                   ├── validate-frontmatter.mjs (EEAT check)
                   ├── npm run build (Astro → dist/)
                   ├── Deploy a Vercel (producción)
                   ├── Smoke test HTTP 200
                   └── Email: ✅ publicado o ❌ fallo
```

---

## Archivos que van en el repositorio

```
tujubilacionanticipada/
├── scripts/
│   ├── calendario.json           ← 60 artículos (30 jun – 28 ago 2026)
│   ├── PROMPT_REDACTOR.md        ← instrucciones para el agente redactor
│   ├── PROMPT_VERIFICADOR.md     ← checklist EEAT para el agente verificador
│   └── validate-frontmatter.mjs  ← validador para GitHub Actions
├── .github/
│   └── workflows/
│       └── deploy.yml            ← CI/CD: build + Vercel + email
└── ROUTINE_PROMPT.md             ← prompt de la routine (referencia)
```

---

## PASO 1 — Copiar los archivos al repositorio

Copia todos los archivos de este zip a la raíz de tu repo local y haz push:

```bash
cd ~/Sites/tujubilacionanticipada   # tu ruta al repo
cp -r ruta/al/zip/scripts .
cp -r ruta/al/zip/.github .
git add .
git commit -m "chore: añadir sistema de publicación autónoma"
git push origin main
```

---

## PASO 2 — Configurar Vercel

Si aún no has conectado el repo a Vercel:

```bash
npm i -g vercel
vercel login
cd ~/Sites/tujubilacionanticipada
vercel link        # conecta el repo al proyecto
cat .vercel/project.json   # anota orgId y projectId
```

En vercel.com → Settings → Tokens → crear token → anota el valor.

Asegúrate de que `astro.config.mjs` tiene `output: 'static'`:

```js
export default defineConfig({
  site: 'https://tujubilacionanticipada.com',
  output: 'static',
  integrations: [react(), tailwind(), sitemap()],
})
```

---

## PASO 3 — Secrets en GitHub

Ve a: tu repo en GitHub → **Settings → Secrets and variables → Actions → New repository secret**

Añade estos 5 secrets:

| Secret | Valor |
|--------|-------|
| `VERCEL_TOKEN` | Token de Vercel (paso anterior) |
| `VERCEL_ORG_ID` | `orgId` del archivo `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` del archivo `.vercel/project.json` |
| `EMAIL_USERNAME` | Gmail que envía las alertas (ej: pipeline.tja@gmail.com) |
| `EMAIL_APP_PASSWORD` | Contraseña de aplicación de Gmail (ver Paso 4) |
| `ALERT_EMAIL` | Tu email donde recibirás las alertas |

---

## PASO 4 — Contraseña de aplicación Gmail

La cuenta Gmail que envía las alertas necesita una contraseña de aplicación
(no la contraseña normal de Gmail).

1. Entra en la cuenta Gmail que usará el pipeline
2. Ve a: **Cuenta de Google → Seguridad → Verificación en 2 pasos** (actívala)
3. Ve a: **Cuenta de Google → Seguridad → Contraseñas de aplicaciones**
4. Selecciona: "Correo" + "Otro (nombre personalizado)" → escribe "Pipeline TJA"
5. Copia los 16 caracteres generados → ese es `EMAIL_APP_PASSWORD`

---

## PASO 5 — Sustituir el nombre de la revisora

Edita `scripts/calendario.json` y sustituye:
- `"reviewer_name": "NOMBRE_REVISORA"` → nombre real y apellidos
- `"reviewer_title": "Escalón 26, Seguridad Social — Gestión de pensiones de ex-funcionarios"` → ajusta si es necesario

También edita `scripts/PROMPT_REDACTOR.md` si quieres actualizar la referencia.

---

## PASO 6 — Crear la Routine en Claude Code

### Opción A — Desde la web (recomendado)

1. Ve a **claude.ai/code/routines**
2. Haz clic en **New routine**
3. Rellena el formulario:

   **Name:** Publicar artículo diario — tujubilacionanticipada.com

   **Prompt:** Copia y pega el contenido completo de `ROUTINE_PROMPT.md`
   (todo el texto, desde "Eres un agente..." hasta el final)

   **Repositories:** Selecciona tu repo de GitHub `tujubilacionanticipada`
   - Branch: `main`
   - Branch push: activa el permiso para push a `main`
     ⚠ Por defecto Claude solo puede pushear a ramas `claude/*`.
     Para pushear a `main` directamente, desactiva la restricción en la configuración del repo de la routine.

   **Environment:** Sin variables especiales necesarias (git ya está autenticado)

   **Trigger:** Schedule → Daily → 08:00 (selecciona zona horaria Europe/Madrid)

4. Haz clic en **Create**

### Opción B — Desde el CLI

En cualquier sesión de Claude Code:
```
/schedule daily at 8am Europe/Madrid, [pega aquí el prompt de ROUTINE_PROMPT.md]
```

---

## PASO 7 — Test manual antes del primer día

Antes de esperar al día siguiente, prueba el flujo completo:

**7a. Simular la routine manualmente:**
En Claude Code (sesión normal), pega el prompt de `ROUTINE_PROMPT.md` y
cambia temporalmente la fecha del artículo #1 en `calendario.json` a hoy.
Observa que:
- ✅ Genera el MDX correctamente
- ✅ El verificador lo aprueba (o corrige y reaprueba)
- ✅ Hace git push a main

**7b. Verificar GitHub Actions:**
Ve a tu repo → pestaña **Actions** → comprueba que:
- ✅ El workflow se ha disparado
- ✅ `validate-frontmatter.mjs` pasa sin errores
- ✅ El build de Astro termina correctamente
- ✅ El deploy a Vercel es exitoso
- ✅ El smoke test devuelve HTTP 200
- ✅ Recibes el email de confirmación

**7c. Verificar el site:**
- Abre https://tujubilacionanticipada.com/blog
- Confirma que el artículo aparece publicado

**7d. Restaurar la fecha:**
Vuelve a poner la fecha original del artículo #1 en `calendario.json`
y haz push para que el sistema empiece limpio.

---

## PASO 8 — Activar la routine

Una vez el test manual funciona:
- Ve a **claude.ai/code/routines**
- Confirma que la routine aparece con estado **Active**
- El primer run automático será al día siguiente a las 08:00

---

## Emails que recibirás

| Situación | Asunto | Enviado por |
|-----------|--------|-------------|
| Artículo publicado | ✅ tujubilacionanticipada.com — Artículo publicado | GitHub Actions |
| Fallo en CI/deploy | ❌ tujubilacionanticipada.com — Fallo en el pipeline | GitHub Actions |
| Verificador falla 3x | Solo en el log de la routine | Routine (log interno) |

⚠ El tercer caso (verificador falla 3x) no envía email automático — aparece
en el log de la routine en claude.ai/code/routines. Revisa el log diariamente
los primeros días para asegurarte de que todo funciona.

Si quieres email también en ese caso, puedes añadir un trigger API a la routine
y llamarlo desde un script de monitorización, aunque para 60 días de prueba
revisar el log manualmente es más que suficiente.

---

## Seguimiento de los 60 días

El campo `"publicado": true/false` en `calendario.json` es tu panel de control.
Para ver el estado en cualquier momento:

```bash
cd ~/Sites/tujubilacionanticipada
python3 -c "
import json
with open('scripts/calendario.json') as f:
    data = json.load(f)
publicados = [a for a in data['articulos'] if a['publicado']]
pendientes = [a for a in data['articulos'] if not a['publicado']]
print(f'Publicados: {len(publicados)}/60')
print(f'Pendientes: {len(pendientes)}/60')
if pendientes:
    print(f'Próximo: {pendientes[0][\"fecha\"]} — {pendientes[0][\"titulo\"]}')
"
```

---

## Mantenimiento

**Si un artículo falla y quieres republicarlo manualmente:**
1. Abre Claude Code
2. Pega el prompt de `ROUTINE_PROMPT.md` con la fecha del artículo fallido
3. Ejecuta manualmente

**Si quieres pausar la routine:**
- claude.ai/code/routines → tu routine → Toggle off

**Si quieres añadir más artículos tras los 60 días:**
- Añade nuevas entradas en `calendario.json` con fechas futuras
- La routine los procesará automáticamente
