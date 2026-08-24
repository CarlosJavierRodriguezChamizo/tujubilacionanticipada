#!/usr/bin/env node
/**
 * Verificación del motor de cálculo contra el texto oficial.
 *
 * El informe de pago se genera con `src/lib/pension-calculo.ts`. Una sola cifra
 * mal en ese módulo es un error que se cobra: por eso este script no comprueba
 * el motor contra una copia escrita a mano de las tablas, sino contra los
 * **extractos literales del BOE** guardados en `scripts/fuentes/`, parseando de
 * ellos las 288 celdas de los cuadros de los arts. 207.2 y 208.2 y el calendario
 * de la DT 7.ª, y comparándolas una a una con las constantes del motor.
 *
 * Además comprueba invariantes que la ley impone y que ningún cambio futuro
 * debería romper (monotonía, orden de los tramos, límites, continuidad).
 *
 * Uso:  node scripts/verificar-motor.mjs [-v]
 * Sale con código 1 al primer fallo. Corre en CI antes del build: si falla,
 * no se despliega.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const FUENTES = join(ROOT, 'scripts', 'fuentes');
const MOTOR = join(ROOT, 'src', 'lib', 'pension-calculo.ts');
const verbose = process.argv.includes('-v');

let fallos = 0;
let comprobaciones = 0;

function check(ok, mensaje, detalle) {
  comprobaciones += 1;
  if (ok) {
    if (verbose) console.log(`  ok   ${mensaje}`);
    return true;
  }
  fallos += 1;
  console.error(`  FALLO ${mensaje}${detalle ? `\n         ${detalle}` : ''}`);
  return false;
}

function leerFuente(nombre) {
  return readFileSync(join(FUENTES, nombre), 'utf8')
    .split('\n')
    .filter((l) => !l.startsWith('#'))
    .join('\n');
}

/**
 * Extrae del texto oficial el cuadro de coeficientes: filas de
 * "meses de anticipación" seguidas de los 4 porcentajes de los 4 tramos.
 * Los cuadros del BOE aparecen como una secuencia de números sueltos, así que
 * se recorre en grupos de 5 empezando por el mes máximo y bajando de uno en uno,
 * lo que además valida que no falte ni sobre ninguna fila.
 */
function parsearCuadro(texto, mesMaximo) {
  const numeros = [...texto.matchAll(/(?:^|\s)(\d{1,2}(?:,\d{1,2})?)(?=\s|$)/g)].map((m) =>
    Number(m[1].replace(',', '.')),
  );
  // El cuadro empieza en la primera aparición del mes máximo seguida de 4 decimales.
  for (let i = 0; i < numeros.length - 4; i++) {
    if (numeros[i] !== mesMaximo) continue;
    const filas = new Map();
    let j = i;
    let mesEsperado = mesMaximo;
    while (mesEsperado >= 1 && j + 4 < numeros.length && numeros[j] === mesEsperado) {
      filas.set(mesEsperado, numeros.slice(j + 1, j + 5));
      j += 5;
      mesEsperado -= 1;
    }
    if (filas.size === mesMaximo) return filas;
  }
  return null;
}

/** Lee una tabla `Record<number, [n,n,n,n]>` del código fuente del motor. */
function parsearTablaMotor(fuente, nombre) {
  const bloque = new RegExp(`${nombre}[^{]*\\{([\\s\\S]*?)\\n\\};`).exec(fuente);
  if (!bloque) return null;
  const filas = new Map();
  for (const m of bloque[1].matchAll(/(\d+):\s*\[([\d.,\s]+)\]/g)) {
    filas.set(Number(m[1]), m[2].split(',').map((x) => Number(x.trim())));
  }
  return filas;
}

function constanteMotor(fuente, nombre) {
  const m = new RegExp(`export const ${nombre}\\s*=\\s*([^;]+);`).exec(fuente);
  return m ? m[1].trim() : null;
}

// ---------------------------------------------------------------------------

const motor = readFileSync(MOTOR, 'utf8');

console.log('Verificación del motor de cálculo contra scripts/fuentes/ (texto del BOE)\n');

// 1. Cuadros de coeficientes, celda a celda -------------------------------
for (const [etiqueta, fichero, constante, mesMax] of [
  ['art. 208.2 (voluntaria)', 'lgss-art-208-jubilacion-voluntaria.txt', 'COEF_VOLUNTARIA', 24],
  ['art. 207.2 (involuntaria)', 'lgss-art-207-jubilacion-involuntaria.txt', 'COEF_INVOLUNTARIA', 48],
]) {
  console.log(`Cuadro ${etiqueta}`);
  const oficial = parsearCuadro(leerFuente(fichero), mesMax);
  const delMotor = parsearTablaMotor(motor, constante);

  if (!check(oficial !== null, `el cuadro se lee del texto oficial (${mesMax} filas)`)) continue;
  if (!check(delMotor !== null, `la constante ${constante} se lee del motor`)) continue;
  check(
    delMotor.size === mesMax,
    `${constante} tiene ${mesMax} filas`,
    `tiene ${delMotor.size}`,
  );

  for (let mes = mesMax; mes >= 1; mes--) {
    const oficialFila = oficial.get(mes);
    const motorFila = delMotor.get(mes);
    if (!check(Array.isArray(motorFila), `${constante}[${mes}] existe`)) continue;
    check(
      motorFila.length === 4 && oficialFila.every((v, i) => v === motorFila[i]),
      `${constante}[${mes}] coincide con el BOE`,
      `BOE: [${oficialFila.join(', ')}] · motor: [${motorFila.join(', ')}]`,
    );
  }

  // Invariantes legales del cuadro.
  for (let mes = mesMax; mes >= 1; mes--) {
    const fila = delMotor.get(mes) ?? [];
    check(
      fila.every((v, i) => i === 0 || v <= fila[i - 1]),
      `[${mes}] a más años cotizados, menos reducción`,
      `fila: [${fila.join(', ')}]`,
    );
    check(
      fila.every((v) => v > 0 && v <= 30),
      `[${mes}] porcentajes dentro de rango`,
      `fila: [${fila.join(', ')}]`,
    );
  }
  console.log('');
}

// 2. Calendario de la edad ordinaria (DT 7.ª) ------------------------------
console.log('Edad ordinaria 2026 — DT 7.ª LGSS');
{
  const dt7 = leerFuente('lgss-dt7-edad-ordinaria.txt');
  // Fila de 2026: "2026 | 38 años y 3 meses o más | 65 años | Menos de ... | 66 años y 10 meses"
  const bloque2026 = /2026([\s\S]*?)A partir del año 2027/.exec(dt7);
  if (check(bloque2026 !== null, 'la fila de 2026 se localiza en el texto oficial')) {
    const t = bloque2026[1];
    const umbral = /(\d+) años y (\d+) meses o más/.exec(t);
    const edadPlena = /Menos de 38 años y 3 meses\.\s*(\d+) años y (\d+) meses/.exec(
      t.replace(/\s+/g, ' '),
    );
    check(
      umbral && Number(umbral[1]) + Number(umbral[2]) / 12 === 38.25,
      'el umbral de 2026 es 38 años y 3 meses',
      umbral ? `leído: ${umbral[0]}` : 'no encontrado',
    );
    check(
      constanteMotor(motor, 'UMBRAL_COTIZACION_EDAD_REDUCIDA') === '38.25',
      'UMBRAL_COTIZACION_EDAD_REDUCIDA = 38.25',
      `motor: ${constanteMotor(motor, 'UMBRAL_COTIZACION_EDAD_REDUCIDA')}`,
    );
    check(
      constanteMotor(motor, 'EDAD_LEGAL_PLENA') === '66 + 10 / 12',
      'EDAD_LEGAL_PLENA = 66 años y 10 meses',
      `motor: ${constanteMotor(motor, 'EDAD_LEGAL_PLENA')}`,
    );
    check(/65 años/.test(t), 'la edad reducida de 2026 es 65 años');
    check(
      constanteMotor(motor, 'EDAD_LEGAL_REDUCIDA') === '65',
      'EDAD_LEGAL_REDUCIDA = 65',
    );
    check(
      edadPlena !== null && edadPlena[1] === '66' && edadPlena[2] === '10',
      'la edad plena de 2026 en el BOE es 66 años y 10 meses',
      edadPlena ? `leído: ${edadPlena[0]}` : 'no encontrado',
    );
  }
  console.log('');
}

// 3. Escala de porcentajes (art. 210.1 + DT 9.ª) ---------------------------
console.log('Porcentaje sobre la base reguladora — art. 210.1 y DT 9.ª');
{
  const dt9 = leerFuente('lgss-dt9-porcentajes.txt');
  const tramo = /Durante los años 2023 a 2026\.\s*Por cada mes adicional de cotización entre los meses 1 y (\d+), el (\d,\d+) por ciento y por cada uno de los (\d+) meses siguientes, el (\d,\d+) por ciento/.exec(
    dt9.replace(/\n/g, ' ').replace(/\s+/g, ' '),
  );
  if (check(tramo !== null, 'el tramo 2023-2026 se lee de la DT 9.ª')) {
    const [, m1, p1, m2, p2] = tramo;
    check(m1 === '49' && p1 === '0,21', 'primer tramo: 49 meses al 0,21 %', `leído: ${m1}/${p1}`);
    check(m2 === '209' && p2 === '0,19', 'segundo tramo: 209 meses al 0,19 %', `leído: ${m2}/${p2}`);
    // El motor debe implementar exactamente esos cortes.
    check(/tramoAlto = Math\.min\(mesesAdicionales, 49\)/.test(motor), 'el motor corta en el mes 49');
    check(/tramoAlto \* 0\.21 \+ tramoResto \* 0\.19/.test(motor), 'el motor aplica 0,21 % y 0,19 %');
    check(/Math\.max\(mesesAdicionales - 49, 0\), 209\)/.test(motor), 'el motor limita el segundo tramo a 209 meses');
    // 50 % + 49×0,21 + 209×0,19 = 100 % exacto: el 100 % cae en 36 años y 6 meses.
    const total = 50 + 49 * 0.21 + 209 * 0.19;
    check(Math.abs(total - 100) < 1e-9, 'la escala suma exactamente el 100 %', `suma: ${total}`);
    check(
      constanteMotor(motor, 'COTIZACION_PENSION_PLENA') === '36.5',
      'COTIZACION_PENSION_PLENA = 36,5 años',
    );
  }
  const art210 = leerFuente('lgss-art-210-cuantia.txt');
  check(/primeros quince años cotizados, el 50 por ciento/.test(art210.replace(/\s+/g, ' ')),
    'el art. 210.1.a) fija el 50 % por los primeros 15 años');
  check(constanteMotor(motor, 'MIN_COTIZACION_PENSION') === '15', 'MIN_COTIZACION_PENSION = 15');
  console.log('');
}

// 4. Requisitos y límites de acceso ---------------------------------------
console.log('Requisitos de acceso — arts. 207.1 y 208.1');
{
  const a208 = leerFuente('lgss-art-208-jubilacion-voluntaria.txt').replace(/\s+/g, ' ');
  const a207 = leerFuente('lgss-art-207-jubilacion-involuntaria.txt').replace(/\s+/g, ' ');
  check(/inferior en dos años, como máximo/.test(a208), 'la voluntaria permite 2 años como máximo');
  check(constanteMotor(motor, 'ANTICIPO_VOLUNTARIA_MESES') === '24', 'ANTICIPO_VOLUNTARIA_MESES = 24');
  check(/período mínimo de cotización efectiva de treinta y cinco años/.test(a208),
    'la voluntaria exige 35 años cotizados');
  check(constanteMotor(motor, 'REQ_COTIZACION_VOLUNTARIA') === '35', 'REQ_COTIZACION_VOLUNTARIA = 35');
  check(/inferior en cuatro años, como máximo/.test(a207), 'la involuntaria permite 4 años como máximo');
  check(constanteMotor(motor, 'ANTICIPO_FORZOSA_MESES') === '48', 'ANTICIPO_FORZOSA_MESES = 48');
  check(/período mínimo de cotización efectiva de 33 años/.test(a207),
    'la involuntaria exige 33 años cotizados');
  check(constanteMotor(motor, 'REQ_COTIZACION_FORZOSA') === '33', 'REQ_COTIZACION_FORZOSA = 33');
  console.log('');
}

// 5. Importes de 2026 (RD 241/2026) ---------------------------------------
console.log('Importes 2026 — RD 241/2026');
{
  check(constanteMotor(motor, 'MAX_PENSION_MENSUAL') === '3359.6',
    'MAX_PENSION_MENSUAL = 3.359,60 €/mes (art. 3)',
    `motor: ${constanteMotor(motor, 'MAX_PENSION_MENSUAL')}`);
  check(/conConyugeACargo: 17592\.4/.test(motor), 'mínima con cónyuge a cargo = 17.592,40 €/año');
  check(/unidadUnipersonal: 13106\.8/.test(motor), 'mínima unipersonal = 13.106,80 €/año');
  check(/3\.359,60|BOE-A-2026-6977/.test(motor), 'el motor cita el RD 241/2026 como fuente');
  console.log('');
}

// 6. El motor no puede citar cifras derogadas ------------------------------
console.log('Ausencia de cifras derogadas');
{
  check(!/1\.875|1\.625(?!\D*\/\/)/.test(motor.replace(/\/\*[\s\S]*?\*\//g, '')),
    'el motor no usa los coeficientes por trimestre derogados');
  check(!/66 \+ 8 \/ 12/.test(motor), 'el motor no usa la edad ordinaria de 2025');
  check(!/3267\.6|3267,60/.test(motor), 'el motor no usa el tope máximo de 2025');
  console.log('');
}

// ---------------------------------------------------------------------------
console.log(
  `${comprobaciones} comprobaciones · ${fallos === 0 ? 'todas correctas' : `${fallos} FALLIDAS`}`,
);
if (fallos > 0) {
  console.error('\nEl motor NO coincide con la fuente oficial. No se despliega.');
  process.exit(1);
}
