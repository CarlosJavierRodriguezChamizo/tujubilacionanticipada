#!/usr/bin/env node
/**
 * Auditoría normativa del contenido publicado.
 *
 * Busca en `src/content/blog/*.mdx` cifras que la normativa vigente en 2026 ha
 * dejado obsoletas. No corrige nada: solo informa, para que la corrección la
 * haga una persona o el agente redactor con la fuente oficial delante.
 *
 * Referencias oficiales:
 *  - Edad ordinaria 2026 → DT 7.ª LGSS: 65 años con 38 años y 3 meses cotizados
 *    o más; 66 años y 10 meses con menos. (En 2025 era 66 años y 8 meses.)
 *  - Coeficientes reductores → arts. 207.2 y 208.2 LGSS (Ley 21/2021, en vigor
 *    desde el 1-1-2022): tabla MENSUAL por 4 tramos de cotización. El modelo de
 *    porcentaje fijo por trimestre (1,875 % / 1,625 %) está derogado.
 *  - Límite máximo de pensión 2026 → art. 3 RD 241/2026: 3.359,60 €/mes.
 *
 * Uso:  node scripts/auditar-normativa.mjs [--json]
 * Sale con código 1 si encuentra alguna incidencia.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BLOG_DIR = join(process.cwd(), 'src', 'content', 'blog');

const REGLAS = [
  {
    id: 'coeficiente-por-trimestre',
    gravedad: 'alta',
    // Solo los porcentajes del modelo derogado. Mencionar la palabra "trimestre"
    // no es un error —los artículos buenos explican el sistema anterior—, así que
    // eso va aparte y con gravedad baja: si no, la auditoría nunca llegaría a cero.
    patron: /1,875\s*%|1,625\s*%|1,500\s*%|2,00\s*%\s*por\s+trimestre/gi,
    problema: 'Usa los porcentajes del modelo derogado de coeficiente fijo por trimestre.',
    correccion:
      'Sustituir por la tabla mensual por tramos de cotización de los arts. 207.2 y 208.2 LGSS ' +
      '(voluntaria: 21 %-13 % con 24 meses, 3,26 %-2,81 % con 1 mes; ' +
      'involuntaria: 30 %-24 % con 48 meses, 0,63 %-0,50 % con 1 mes).',
  },
  {
    id: 'mencion-a-trimestres',
    gravedad: 'baja',
    patron: /por\s+(cada\s+)?trimestre/gi,
    problema: 'Menciona el cálculo por trimestres.',
    correccion:
      'Correcto solo si el texto lo presenta como el sistema ANTERIOR, derogado desde el ' +
      '1-1-2022. Si lo presenta como vigente, es un error grave: revisar la frase completa.',
  },
  {
    id: 'edad-ordinaria-2025',
    gravedad: 'alta',
    patron: /66\s+años\s+y\s+8\s+meses/gi,
    // No es un error si la frase (o la fila de tabla) etiqueta el dato como de 2025:
    // el calendario transitorio histórico es correcto y debe poder publicarse.
    exculpa: /2025/,
    problema: 'Presenta la edad ordinaria de 2025 (66 años y 8 meses) como si fuera la vigente.',
    correccion:
      'En 2026 son 66 años y 10 meses (DT 7.ª LGSS). Solo es correcto si el texto ' +
      'la etiqueta explícitamente como el valor de 2025 en una tabla histórica.',
  },
  {
    id: 'umbral-edad-reducida',
    gravedad: 'media',
    patron: /38\s+años\s+y\s+6\s+meses[^.]{0,80}65\s+años/gi,
    // Quien ACREDITA 38 años y 6 meses supera de sobra el umbral de 2026 (38 y 3):
    // decir que se jubila a los 65 es correcto. El error es presentar 38 y 6 como
    // el umbral exigido, no mencionarlo en el caso concreto de alguien que lo supera.
    exculpa: /acredit|cumple|tiene|con exactamente|o más/i,
    problema: 'Presenta 38 años y 6 meses como el umbral exigido para jubilarse a los 65 en 2026.',
    correccion:
      'En 2026 el umbral es 38 años y 3 meses; los 38 años y 6 meses rigen a partir de 2027 ' +
      '(DT 7.ª LGSS). Ojo: 38 años y 6 meses SÍ es correcto como primer tramo de las ' +
      'tablas de coeficientes de los arts. 207.2 y 208.2.',
  },
  {
    id: 'pension-maxima-2025',
    gravedad: 'media',
    patron: /3\.267,60|3267,60/g,
    problema: 'Cita el límite máximo de pensión de 2025.',
    correccion: 'En 2026 son 3.359,60 €/mes (47.034,40 €/año), art. 3 del RD 241/2026.',
  },
  {
    id: 'cambio-fechado-en-2024',
    gravedad: 'baja',
    patron: /(desde|en)\s+(el\s+1\s+de\s+enero\s+de\s+)?2024[^.]{0,60}(mes a mes|coeficiente|trimestre)/gi,
    problema: 'Fecha en 2024 el paso al cálculo mensual.',
    correccion:
      'El cálculo mensual rige desde el 1-1-2022 (Ley 21/2021). El RDL 2/2023 cambió otras ' +
      'cosas (base reguladora, cotización), no la periodicidad del coeficiente.',
  },
];

const ficheros = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx')).sort();
const hallazgos = [];

/** Ventana de texto alrededor de una coincidencia, para juzgarla en contexto. */
const CONTEXTO = 120;

for (const f of ficheros) {
  const texto = readFileSync(join(BLOG_DIR, f), 'utf8');
  for (const regla of REGLAS) {
    const patron = new RegExp(regla.patron.source, regla.patron.flags);
    let ocurrencias = 0;
    let m;
    while ((m = patron.exec(texto)) !== null) {
      if (m[0].length === 0) patron.lastIndex += 1;
      if (regla.exculpa) {
        const desde = Math.max(0, m.index - CONTEXTO);
        const ventana = texto.slice(desde, m.index + m[0].length + CONTEXTO);
        // La coincidencia queda exculpada si su contexto la justifica.
        if (regla.exculpa.test(ventana)) continue;
      }
      ocurrencias += 1;
    }
    if (ocurrencias > 0) {
      hallazgos.push({
        slug: f.replace(/\.mdx$/, ''),
        regla: regla.id,
        gravedad: regla.gravedad,
        ocurrencias,
        problema: regla.problema,
        correccion: regla.correccion,
      });
    }
  }
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(hallazgos, null, 2));
} else {
  const porGravedad = { alta: 0, media: 0, baja: 0 };
  for (const h of hallazgos) porGravedad[h.gravedad] += 1;
  console.log(`Auditoría normativa — ${ficheros.length} artículos analizados\n`);
  const slugs = [...new Set(hallazgos.map((h) => h.slug))];
  for (const slug of slugs) {
    console.log(`▸ ${slug}`);
    for (const h of hallazgos.filter((x) => x.slug === slug)) {
      console.log(`    [${h.gravedad}] ${h.regla} ×${h.ocurrencias} — ${h.problema}`);
    }
  }
  console.log(
    `\n${slugs.length} artículos con incidencias ` +
      `(alta: ${porGravedad.alta}, media: ${porGravedad.media}, baja: ${porGravedad.baja})`,
  );
}

process.exit(hallazgos.length > 0 ? 1 : 0);
