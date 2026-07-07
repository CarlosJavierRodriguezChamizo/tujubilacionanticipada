# SETUP — tujubilacionanticipada.com
## Stack: Claude Code Routines + GitHub Actions + Vercel + Resend

> Estado: pipeline verificado y operativo. Solo falta **crear la Routine** (PASO 6).

---

## Arquitectura

```
Claude Code Routine (nube Anthropic, 08:00 diario Europe/Madrid)
    │
    ├── Lee calendario.json → artículo pendiente más antiguo con fecha <= hoy
    ├── Lee PROMPT_REDACTOR.md → genera MDX (+ import BarChart y ≥1 gráfico de datos)
    ├── Genera imagen destacada con Magnific (conector) → public/blog/<slug>.jpg
    ├── Lee PROMPT_VERIFICADOR.md → verifica (hasta 3 intentos)
    │     └── FALLO 3x → log de error → para (sin push)
    │
    └── APROBADO → git push → main
                       │
                       ▼
               GitHub Actions (.github/workflows/deploy.yml)
                   ├── validate-frontmatter.mjs (EEAT check)
                   ├── npm run build (astro check + build)
                   ├── Deploy a Vercel con el CLI oficial (vercel pull/build/deploy)
                   ├── Smoke test HTTP 200 sobre la URL real del deploy
                   └── Email vía Resend: ✅ publicado / ❌ fallo
```

---

## Archivos del sistema (en el repo)

```
tujubilacionanticipada/
├── scripts/
│   ├── calendario.json           ← 60 artículos (25 jun – 23 ago 2026)
│   ├── PROMPT_REDACTOR.md         ← instrucciones del agente redactor
│   ├── PROMPT_VERIFICADOR.md      ← checklist EEAT del agente verificador
│   └── validate-frontmatter.mjs   ← validador que corre en GitHub Actions
├── .github/workflows/deploy.yml   ← CI/CD: validar + build + Vercel + email
├── src/components/charts/BarChart.astro  ← gráfico de datos reutilizable
└── ROUTINE_PROMPT.md              ← prompt de la Routine (se pega en claude.ai/code)
```

**El "contrato" (4 archivos que deben ir sincronizados):** `src/content/config.ts`
(schema Zod + categorías), `scripts/PROMPT_REDACTOR.md`, `scripts/validate-frontmatter.mjs`
y `scripts/PROMPT_VERIFICADOR.md`. Si cambias campos del frontmatter o las categorías,
actualiza los cuatro a la vez.

---

## PASO 1 — Repo (ya hecho)

El repo está en `https://github.com/CarlosJavierRodriguezChamizo/tujubilacionanticipada`
y el push a `main` con credenciales guardadas en el keychain ya funciona.

---

## PASO 2 — Vercel (ya conectado)

El proyecto está enlazado (org `tujubilacionanticipada`, proyecto `tja`) y el deploy
a producción funciona con el **CLI oficial de Vercel** desde GitHub Actions.

`astro.config.mjs` genera sitio **estático** (por defecto en Astro 4) con las
integraciones: `react`, `tailwind`, `mdx`, `sitemap`.

Pendiente por tu parte: **apuntar el dominio** `tujubilacionanticipada.com` al proyecto
en Vercel → Settings → Domains, y configurar el DNS en tu registrador.

---

## PASO 3 — Secrets en GitHub (ya configurados)

Repo → **Settings → Secrets and variables → Actions**. El workflow usa **5 secrets**:

| Secret | Valor |
|--------|-------|
| `VERCEL_TOKEN` | Token de Vercel (vercel.com → Settings → Tokens) |
| `VERCEL_ORG_ID` | `orgId` de `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` de `.vercel/project.json` |
| `RESEND_API_KEY` | API key de Resend (resend.com → API Keys) |
| `ALERT_EMAIL` | Tu email donde recibes las alertas |

---

## PASO 4 — Resend (emails de alerta)

El pipeline envía los avisos con **Resend** (no Gmail).

1. Crea cuenta en resend.com y genera una **API key** → secret `RESEND_API_KEY`.
2. Remitente actual: `Pipeline TJA <onboarding@resend.dev>` (sandbox de Resend).
   ⚠ El sandbox **solo entrega al email de tu propia cuenta Resend**. Para enviar a
   cualquier dirección, **verifica un dominio** en Resend y cambia el `from` en
   `.github/workflows/deploy.yml`.

---

## PASO 5 — Revisor/a (ya configurado)

En `scripts/calendario.json` → `config`:
- `reviewer_name`: **Javier Rodríguez**
- `reviewer_title`: *Escalón 26, Seguridad Social — Gestión de pensiones de ex-funcionarios*

Aparece públicamente como revisor del contenido y en el JSON-LD. Cámbialo si quieres
otro revisor (debe ser una persona real que respalde la revisión — E-E-A-T).

---

## PASO 6 — Crear la Routine en Claude Code

1. Ve a **claude.ai/code** → **Routines** → **New routine**.
2. **Name:** Publicar artículo diario — tujubilacionanticipada.com
3. **Prompt:** copia y pega el contenido completo de `ROUTINE_PROMPT.md`.
4. **Repositories:** selecciona `tujubilacionanticipada`, branch `main`.
   - ⚠ Da **permiso de push a `main`**. Por defecto Claude solo puede pushear a
     ramas `claude/*`; hay que permitir `main` en la configuración del repo de la routine
     (si no, el deploy no se dispara).
5. **Trigger:** Schedule → Daily → **08:00**, zona horaria **Europe/Madrid**.
6. **Create**.

### PASO 6b — Conectores (Magnific para las imágenes)

Cada artículo lleva una **imagen destacada** generada con **Magnific** (ilustración
de tinta plana, estilo fijo).

- Magnific está conectado como **conector de claude.ai** (`https://mcp.magnific.com`),
  no como servidor MCP local del CLI. Según la doc oficial de Claude Code, **los
  conectores de claude.ai se incluyen por defecto en las Routines y su autenticación
  viaja con ellos**; los MCP añadidos con `claude mcp add` NO se transfieren a la nube.
- En el editor de la Routine, pestaña **Connectors**: verifica que **Magnific sigue
  incluido** (lo está por defecto). Quita los que no uses.
- Referencia: https://code.claude.com/docs/en/routines

**Degradación elegante:** si un run no pudiera generar la imagen, el artículo se publica
**sin imagen** (el sitio lo soporta) en vez de romperse. Queda anotado en el log.

**Plan B (solo si Magnific fallara en cron):** llamar a la API de imágenes por REST desde
la Routine, con la API key como **variable de entorno del *environment*** (`${MAGNIFIC_API_KEY}`),
o declarándola en un `.mcp.json` del repo con expansión de variables.

---

## PASO 7 — Test manual (primer artículo)

El calendario ya arranca **hoy (25 jun)**, así que hay artículo pendiente. Como las
08:00 pueden haber pasado, lanza la Routine **manualmente una vez** (botón *Run now*).

Comprueba:
- **Routine:** genera el MDX, la imagen y el gráfico; el verificador aprueba; hace push.
- **GitHub → Actions:** `validate-frontmatter` ✅ → build ✅ → deploy a Vercel ✅ →
  smoke test HTTP 200 ✅ → email de Resend ✅.
- **Site:** el artículo aparece en el blog (URL de Vercel, y en el dominio cuando lo conectes).
- **Log:** confirma si la imagen se generó con Magnific o si publicó sin ella.

No hace falta "restaurar fechas": el calendario ya está en su cadencia definitiva.

---

## PASO 8 — Activar

Confirma que la Routine aparece **Active** en claude.ai/code. A partir de mañana
publicará sola a las 08:00 el artículo pendiente más antiguo.

---

## Emails que recibirás (vía Resend)

| Situación | Asunto |
|-----------|--------|
| Artículo publicado | ✅ tujubilacionanticipada.com — Artículo publicado |
| Fallo en CI/deploy | ❌ tujubilacionanticipada.com — Fallo en el pipeline |
| Verificador falla 3x | (solo en el log de la Routine, sin email) |

---

## Seguimiento de los 60 días

El campo `"publicado": true/false` en `calendario.json` es tu panel de control:

```bash
python3 -c "
import json
data = json.load(open('scripts/calendario.json'))
arts = data['articulos']
pub = [a for a in arts if a['publicado']]
pend = [a for a in arts if not a['publicado']]
print(f'Publicados: {len(pub)}/60  |  Pendientes: {len(pend)}/60')
if pend: print(f'Próximo: {pend[0][\"fecha\"]} — {pend[0][\"titulo\"]}')
"
```

---

## Mantenimiento

- **Republicar un artículo manualmente:** lanza la Routine con *Run now* (coge el pendiente
  más antiguo), o pega el prompt de `ROUTINE_PROMPT.md` en una sesión de Claude Code.
- **Pausar:** claude.ai/code → tu Routine → Toggle off.
- **Añadir más artículos:** nuevas entradas en `calendario.json` con fechas futuras.
- **Cambiar imagen/gráficos de forma retroactiva:** es un *backfill* (lote de una vez sobre
  los artículos ya publicados), distinto de la Routine. Pídelo cuando lo necesites.
