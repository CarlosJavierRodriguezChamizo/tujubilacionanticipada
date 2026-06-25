// scripts/validate-frontmatter.mjs
// Valida artículos MDX antes del deploy a Vercel
// Se ejecuta en GitHub Actions — bloquea el deploy si hay errores EEAT

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

const BLOG_DIR = './src/content/blog'
const REQUIRED_FIELDS = [
  'title', 'description', 'pubDate', 'updatedDate',
  'category', 'author', 'reviewedBy', 'reviewerTitle', 'draft', 'schema',
]
const AUTHORIZED_DOMAINS = [
  'seg-social.es', 'boe.es', 'inclusion.gob.es',
  'mites.gob.es', 'sepe.es', 'cnmv.es',
]
const FORBIDDEN_PHRASES = [
  'según algunos expertos', 'se estima que', 'es sabido que',
  'en general se considera', 'dicen que', 'NOMBRE_REVISORA',
  'REVIEWER_NAME', '[TITULO]', '[META DESCRIPTION',
]

const errors = []
const warnings = []

let files
try {
  files = await readdir(BLOG_DIR)
} catch {
  console.log('ℹ No hay artículos en src/content/blog/ — omitiendo validación')
  process.exit(0)
}

const mdxFiles = files.filter(f => f.endsWith('.mdx'))

if (mdxFiles.length === 0) {
  console.log('ℹ No hay archivos MDX — omitiendo validación')
  process.exit(0)
}

for (const file of mdxFiles) {
  const content = await readFile(join(BLOG_DIR, file), 'utf-8')
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)

  if (!frontmatterMatch) {
    errors.push(`${file}: Sin frontmatter`)
    continue
  }

  const fm = frontmatterMatch[1]
  const body = content.replace(/^---[\s\S]*?---/, '').trim()

  // Campos obligatorios
  for (const field of REQUIRED_FIELDS) {
    if (!fm.includes(`${field}:`)) {
      errors.push(`${file}: Falta campo '${field}'`)
    }
  }

  // Description entre 150 y 160 caracteres
  const descMatch = fm.match(/description:\s*["']?(.+?)["']?\s*\n/)
  if (descMatch) {
    const desc = descMatch[1].replace(/^["']|["']$/g, '').trim()
    if (desc.length < 120 || desc.length > 165) {
      errors.push(`${file}: description tiene ${desc.length} caracteres (debe ser 120–165)`)
    }
  }

  // reviewedBy no debe ser placeholder
  if (fm.includes('reviewedBy: "NOMBRE_REVISORA"') ||
      fm.includes("reviewedBy: ''") ||
      fm.includes('reviewedBy: ""')) {
    errors.push(`${file}: reviewedBy es un placeholder — artículo sin revisar`)
  }

  // draft debe ser false
  if (fm.includes('draft: true')) {
    errors.push(`${file}: draft: true — no se puede publicar`)
  }

  // Disclaimer presente
  const hasDisclaimerStart = body.toLowerCase().includes('orientativo') ||
    body.toLowerCase().includes('no constituye asesor')
  if (!hasDisclaimerStart) {
    errors.push(`${file}: Sin disclaimer legal`)
  }

  // Nota de revisión
  if (!body.toLowerCase().includes('revisado por')) {
    errors.push(`${file}: Sin nota de revisión firmada`)
  }

  // Frases prohibidas
  for (const phrase of FORBIDDEN_PHRASES) {
    if (body.toLowerCase().includes(phrase.toLowerCase())) {
      errors.push(`${file}: Contiene frase/placeholder prohibido: "${phrase}"`)
    }
  }

  // Longitud mínima (aprox 1800 palabras)
  const wordCount = body.split(/\s+/).length
  if (wordCount < 1200) {
    warnings.push(`${file}: Posiblemente corto (${wordCount} palabras estimadas)`)
  }

  // Al menos un enlace a fuente autorizada
  const hasOfficialLink = AUTHORIZED_DOMAINS.some(domain => body.includes(domain))
  if (!hasOfficialLink) {
    errors.push(`${file}: Sin enlace a ninguna fuente oficial autorizada`)
  }
}

// Resultado
if (warnings.length > 0) {
  console.warn('\n⚠ Advertencias:\n')
  warnings.forEach(w => console.warn(`  • ${w}`))
}

if (errors.length > 0) {
  console.error(`\n❌ ${errors.length} error(es) de validación EEAT en ${mdxFiles.length} artículo(s):\n`)
  errors.forEach(e => console.error(`  • ${e}`))
  console.error('\nEl deploy ha sido bloqueado. Corrige los errores antes de volver a hacer push.\n')
  process.exit(1)
}

console.log(`✅ Validación EEAT superada: ${mdxFiles.length} artículo(s) correctos`)
process.exit(0)
