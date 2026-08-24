/**
 * Motor de cálculo del simulador de jubilación anticipada.
 *
 * TODAS las cifras y tablas de este módulo proceden de normativa oficial
 * vigente en 2026 y están citadas en el código:
 *
 *  - Edad ordinaria de jubilación .... DT 7.ª LGSS (RDLeg 8/2015)
 *    https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724
 *  - Porcentaje sobre base reguladora  art. 210.1 LGSS + DT 9.ª (tramo 2023-2026)
 *  - Anticipada voluntaria ........... art. 208 LGSS (tabla mensual por tramos)
 *  - Anticipada involuntaria ......... art. 207 LGSS (tabla mensual por tramos)
 *  - Pensión máxima y mínimas 2026 ... RD 241/2026, de 25 de marzo, arts. 3 y 6 y anexo I
 *    https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-6977
 *
 * Es una estimación divulgativa, NO un cálculo oficial: no contempla convenios
 * especiales, cotizaciones en el extranjero, coeficientes por actividad penosa
 * (arts. 206 y 206 bis), complementos a mínimos ni el complemento de brecha de
 * género. El cálculo oficial lo hace la Seguridad Social.
 */

/** Ejercicio normativo al que corresponden las cifras de este módulo. */
export const ANIO_NORMATIVA = 2026;

/* ═════════════════ Edad ordinaria de jubilación — DT 7.ª LGSS ═════════════════
 * En 2026: 65 años con 38 años y 3 meses cotizados o más; 66 años y 10 meses
 * con menos. (A partir de 2027: 65 con 38 años y 6 meses; 67 con menos.)
 */
export const UMBRAL_COTIZACION_EDAD_REDUCIDA = 38.25; // 38 años y 3 meses (2026)
export const EDAD_LEGAL_REDUCIDA = 65;
export const EDAD_LEGAL_PLENA = 66 + 10 / 12; // 66 años y 10 meses (2026)

/** Edad ordinaria de jubilación en 2026 según el periodo cotizado acreditado. */
export function edadLegalJubilacion(aniosCotizados: number): number {
  return aniosCotizados >= UMBRAL_COTIZACION_EDAD_REDUCIDA
    ? EDAD_LEGAL_REDUCIDA
    : EDAD_LEGAL_PLENA;
}

/* ═════════════ Requisitos de acceso a la jubilación anticipada ═════════════ */

/** Art. 208.1.a) LGSS: hasta 2 años (24 meses) antes de la edad ordinaria. */
export const ANTICIPO_VOLUNTARIA_MESES = 24;
/** Art. 207.1.a) LGSS: hasta 4 años (48 meses) antes de la edad ordinaria. */
export const ANTICIPO_FORZOSA_MESES = 48;

export const ANTICIPO_VOLUNTARIA_ANIOS = ANTICIPO_VOLUNTARIA_MESES / 12;
export const ANTICIPO_FORZOSA_ANIOS = ANTICIPO_FORZOSA_MESES / 12;

/** Art. 208.1.b) LGSS: 35 años de cotización efectiva. */
export const REQ_COTIZACION_VOLUNTARIA = 35;
/** Art. 207.1.c) LGSS: 33 años de cotización efectiva. */
export const REQ_COTIZACION_FORZOSA = 33;

/** Art. 205.1.b) LGSS: carencia mínima para la pensión contributiva. */
export const MIN_COTIZACION_PENSION = 15;

/** Art. 210.1 + DT 9.ª LGSS: años cotizados que dan el 100 % en 2026. */
export const COTIZACION_PENSION_PLENA = 36.5; // 36 años y 6 meses

/* ═══════════ Límites económicos 2026 — RD 241/2026, de 25 de marzo ═══════════ */

/** Art. 3 RD 241/2026: límite máximo de percepción de pensiones públicas. */
export const MAX_PENSION_MENSUAL = 3359.6; // €/mes (47.034,40 €/año)

/** Anexo I RD 241/2026: pensión mínima de jubilación, titular de 65 años. */
export const PENSION_MINIMA_ANUAL_2026 = {
  conConyugeACargo: 17592.4,
  unidadUnipersonal: 13106.8,
} as const;

/** Mínima unipersonal en cómputo mensual (14 pagas). Referencia del art. 208.1.c). */
export const PENSION_MINIMA_MENSUAL_UNIPERSONAL =
  PENSION_MINIMA_ANUAL_2026.unidadUnipersonal / 14;

/* ══════ Coeficientes reductores por anticipar la jubilación — arts. 207 y 208 ══════
 * Los cuadros legales dan el % TOTAL de reducción de la pensión en función de
 * (a) los meses de anticipación respecto a la edad ordinaria y (b) el periodo
 * cotizado acreditado, en cuatro tramos. No es un porcentaje por trimestre.
 */

/** Tramos de periodo cotizado de los cuadros de los arts. 207.2 y 208.2 LGSS. */
export const TRAMOS_COTIZACION = [38.5, 41.5, 44.5] as const;

export const ETIQUETAS_TRAMOS = [
  'Menos de 38 años y 6 meses',
  'De 38 años y 6 meses a menos de 41 años y 6 meses',
  'De 41 años y 6 meses a menos de 44 años y 6 meses',
  '44 años y 6 meses o más',
] as const;

/** Índice (0-3) del tramo de cotización que corresponde a unos años cotizados. */
export function tramoCotizacion(aniosCotizados: number): 0 | 1 | 2 | 3 {
  if (aniosCotizados < TRAMOS_COTIZACION[0]) return 0;
  if (aniosCotizados < TRAMOS_COTIZACION[1]) return 1;
  if (aniosCotizados < TRAMOS_COTIZACION[2]) return 2;
  return 3;
}

/** Art. 208.2 LGSS — jubilación anticipada por voluntad del interesado.
 *  Clave: meses de anticipación. Valor: % de reducción por tramo cotizado. */
export const COEF_VOLUNTARIA: Record<number, readonly [number, number, number, number]> = {
  24: [21.0, 19.0, 17.0, 13.0],
  23: [17.6, 16.5, 15.0, 12.0],
  22: [14.67, 14.0, 13.33, 11.0],
  21: [12.57, 12.0, 11.43, 10.0],
  20: [11.0, 10.5, 10.0, 9.2],
  19: [9.78, 9.33, 8.89, 8.4],
  18: [8.8, 8.4, 8.0, 7.6],
  17: [8.0, 7.64, 7.27, 6.91],
  16: [7.33, 7.0, 6.67, 6.33],
  15: [6.77, 6.46, 6.15, 5.85],
  14: [6.29, 6.0, 5.71, 5.43],
  13: [5.87, 5.6, 5.33, 5.07],
  12: [5.5, 5.25, 5.0, 4.75],
  11: [5.18, 4.94, 4.71, 4.47],
  10: [4.89, 4.67, 4.44, 4.22],
  9: [4.63, 4.42, 4.21, 4.0],
  8: [4.4, 4.2, 4.0, 3.8],
  7: [4.19, 4.0, 3.81, 3.62],
  6: [4.0, 3.82, 3.64, 3.45],
  5: [3.83, 3.65, 3.48, 3.3],
  4: [3.67, 3.5, 3.33, 3.17],
  3: [3.52, 3.36, 3.2, 3.04],
  2: [3.38, 3.23, 3.08, 2.92],
  1: [3.26, 3.11, 2.96, 2.81],
};

/** Art. 207.2 LGSS — jubilación anticipada por causa no imputable al trabajador. */
export const COEF_INVOLUNTARIA: Record<number, readonly [number, number, number, number]> = {
  48: [30.0, 28.0, 26.0, 24.0],
  47: [29.38, 27.42, 25.46, 23.5],
  46: [28.75, 26.83, 24.92, 23.0],
  45: [28.13, 26.25, 24.38, 22.5],
  44: [27.5, 25.67, 23.83, 22.0],
  43: [26.88, 25.08, 23.29, 21.5],
  42: [26.25, 24.5, 22.75, 21.0],
  41: [25.63, 23.92, 22.21, 20.5],
  40: [25.0, 23.33, 21.67, 20.0],
  39: [24.38, 22.75, 21.13, 19.5],
  38: [23.75, 22.17, 20.58, 19.0],
  37: [23.13, 21.58, 20.04, 18.5],
  36: [22.5, 21.0, 19.5, 18.0],
  35: [21.88, 20.42, 18.96, 17.5],
  34: [21.25, 19.83, 18.42, 17.0],
  33: [20.63, 19.25, 17.88, 16.5],
  32: [20.0, 18.67, 17.33, 16.0],
  31: [19.38, 18.08, 16.79, 15.5],
  30: [18.75, 17.5, 16.25, 15.0],
  29: [18.13, 16.92, 15.71, 14.5],
  28: [17.5, 16.33, 15.17, 14.0],
  27: [16.88, 15.75, 14.63, 13.5],
  26: [16.25, 15.17, 14.08, 13.0],
  25: [15.63, 14.58, 13.54, 12.5],
  24: [15.0, 14.0, 13.0, 12.0],
  23: [14.38, 13.42, 12.46, 11.5],
  22: [13.75, 12.83, 11.92, 11.0],
  21: [12.57, 12.0, 11.38, 10.0],
  20: [11.0, 10.5, 10.0, 9.2],
  19: [9.78, 9.33, 8.89, 8.4],
  18: [8.8, 8.4, 8.0, 7.6],
  17: [8.0, 7.64, 7.27, 6.91],
  16: [7.33, 7.0, 6.67, 6.33],
  15: [6.77, 6.46, 6.15, 5.85],
  14: [6.29, 6.0, 5.71, 5.43],
  13: [5.87, 5.6, 5.33, 5.07],
  12: [5.5, 5.25, 5.0, 4.75],
  11: [5.18, 4.94, 4.71, 4.47],
  10: [4.89, 4.67, 4.44, 4.22],
  9: [4.63, 4.42, 4.21, 4.0],
  8: [4.4, 4.2, 4.0, 3.8],
  7: [4.19, 4.0, 3.81, 3.62],
  6: [3.75, 3.5, 3.25, 3.0],
  5: [3.13, 2.92, 2.71, 2.5],
  4: [2.5, 2.33, 2.17, 2.0],
  3: [1.88, 1.75, 1.63, 1.5],
  2: [1.25, 1.17, 1.08, 1.0],
  1: [0.63, 0.58, 0.54, 0.5],
};

export type Modalidad = 'ordinaria' | 'voluntaria' | 'involuntaria';

/**
 * % total de reducción de la pensión por anticipar la jubilación.
 * `mesesAnticipo` se redondea al alza: el art. 208.2 habla de "cada mes o
 * fracción de mes" que falte para la edad ordinaria.
 */
export function reduccionPorAnticipo(
  mesesAnticipo: number,
  aniosCotizados: number,
  modalidad: Modalidad,
): number {
  if (modalidad === 'ordinaria') return 0;
  const tabla = modalidad === 'voluntaria' ? COEF_VOLUNTARIA : COEF_INVOLUNTARIA;
  const tope = modalidad === 'voluntaria' ? ANTICIPO_VOLUNTARIA_MESES : ANTICIPO_FORZOSA_MESES;
  const meses = Math.min(tope, Math.max(0, Math.ceil(mesesAnticipo)));
  if (meses === 0) return 0;
  return tabla[meses][tramoCotizacion(aniosCotizados)];
}

/* ───────────────────────── Utilidades ───────────────────────── */

export interface FechaEstimada {
  texto: string;
  pasada: boolean;
}

export function fechaDesdeEdad(edadActual: number, edadObjetivo: number): FechaEstimada {
  const mesesRestantes = Math.round((edadObjetivo - edadActual) * 12);
  if (mesesRestantes <= 0) return { texto: 'Ya tienes esta edad', pasada: true };
  const ahora = new Date();
  const objetivo = new Date(ahora.getFullYear(), ahora.getMonth() + mesesRestantes, 1);
  const texto = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
  }).format(objetivo);
  return { texto: texto.charAt(0).toUpperCase() + texto.slice(1), pasada: false };
}

/**
 * Porcentaje de la base reguladora según años cotizados.
 * Art. 210.1 LGSS con la escala de la DT 9.ª aplicable durante 2023-2026:
 * 50 % por los primeros 15 años; a partir del mes 1 y hasta el 49, un 0,21 %
 * por mes; por cada uno de los 209 meses siguientes, un 0,19 %. Tope: 100 %.
 */
export function porcentajePension(aniosCotizados: number): number {
  if (aniosCotizados < MIN_COTIZACION_PENSION) return 0;
  const mesesAdicionales = Math.floor((aniosCotizados - MIN_COTIZACION_PENSION) * 12);
  const tramoAlto = Math.min(mesesAdicionales, 49);
  const tramoResto = Math.min(Math.max(mesesAdicionales - 49, 0), 209);
  return Math.min(100, 50 + tramoAlto * 0.21 + tramoResto * 0.19);
}

/* ───────────────────────── Escenario ───────────────────────── */

export interface EscenarioInput {
  edadActual: number;
  aniosCotizadosActuales: number;
  baseReguladora: number;
  edadJubilacion: number;
  mesesAnticipo: number;
  modalidad: Modalidad;
  requisitoCotizacion: number | null;
}

export interface EscenarioResultado {
  edadJubilacion: number;
  aniosCotizadosTotal: number;
  porcentaje: number;
  pensionBruta: number;
  penalizacionPct: number;
  reduccionEuros: number;
  pensionFinal: number;
  fecha: FechaEstimada;
  cumpleRequisito: boolean;
  cumplePensionMinima: boolean;
  requisitoCotizacion: number | null;
  superaTope: boolean;
  /** Art. 208.1.c): la anticipada voluntaria exige superar la mínima de los 65. */
  superaMinimaExigida: boolean;
  tramoCotizacion: 0 | 1 | 2 | 3;
}

export function calcularEscenario({
  edadActual,
  aniosCotizadosActuales,
  baseReguladora,
  edadJubilacion,
  mesesAnticipo,
  modalidad,
  requisitoCotizacion,
}: EscenarioInput): EscenarioResultado {
  // Años cotizados estimados al jubilarse (se sigue cotizando hasta entonces).
  const aniosExtra = Math.max(0, edadJubilacion - edadActual);
  const aniosCotizadosTotal = aniosCotizadosActuales + aniosExtra;

  const porcentaje = porcentajePension(aniosCotizadosTotal);
  const pensionBruta = (baseReguladora * porcentaje) / 100;

  const penalizacionPct = reduccionPorAnticipo(mesesAnticipo, aniosCotizadosTotal, modalidad);
  const reduccionEuros = (pensionBruta * penalizacionPct) / 100;
  let pensionFinal = pensionBruta - reduccionEuros;

  // Art. 3 RD 241/2026: límite máximo de percepción.
  const superaTope = pensionFinal > MAX_PENSION_MENSUAL;
  if (superaTope) pensionFinal = MAX_PENSION_MENSUAL;

  const cumpleRequisito =
    requisitoCotizacion == null || aniosCotizadosTotal >= requisitoCotizacion;
  const cumplePensionMinima = aniosCotizadosTotal >= MIN_COTIZACION_PENSION;
  const superaMinimaExigida =
    modalidad !== 'voluntaria' || pensionFinal > PENSION_MINIMA_MENSUAL_UNIPERSONAL;

  return {
    edadJubilacion,
    aniosCotizadosTotal,
    porcentaje,
    pensionBruta,
    penalizacionPct,
    reduccionEuros,
    pensionFinal,
    fecha: fechaDesdeEdad(edadActual, edadJubilacion),
    cumpleRequisito,
    cumplePensionMinima,
    requisitoCotizacion,
    superaTope,
    superaMinimaExigida,
    tramoCotizacion: tramoCotizacion(aniosCotizadosTotal),
  };
}
