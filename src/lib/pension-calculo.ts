/**
 * Motor de cálculo puro del simulador de jubilación anticipada.
 *
 * Extraído de `src/components/Simulador.jsx` (isla React) para que pueda
 * reutilizarse también desde páginas `.astro` en build (p. ej. para generar
 * una tabla de escenarios estática en `src/pages/simulador.astro`), sin
 * depender de un componente cliente.
 *
 * Refactor de reubicación: ninguna fórmula, coeficiente ni cifra ha
 * cambiado respecto a la implementación original.
 */

/* ───────────────────────── Parámetros normativos (orientativos) ─────────────────────────
 * Cifras simplificadas con fines divulgativos. No son un cálculo oficial.
 */
export const UMBRAL_COTIZACION_EDAD_REDUCIDA = 38.5; // años cotizados para jubilarse a los 65
export const EDAD_LEGAL_REDUCIDA = 65; // con >= 38,5 años cotizados
export const EDAD_LEGAL_PLENA = 66 + 8 / 12; // 66 años y 8 meses, con menos cotización

export const ANTICIPO_VOLUNTARIA_ANIOS = 2; // máx. 2 años antes
export const ANTICIPO_FORZOSA_ANIOS = 4; // máx. 4 años antes
export const PENAL_VOLUNTARIA_TRIMESTRE = 1.875; // % por trimestre
export const PENAL_FORZOSA_TRIMESTRE = 1.625; // % por trimestre

export const MIN_COTIZACION_PENSION = 15; // mínimo para pensión contributiva
export const COTIZACION_PENSION_PLENA = 36; // años para el 100 % de la base
export const REQ_COTIZACION_VOLUNTARIA = 35; // mínimo de acceso a la voluntaria
export const REQ_COTIZACION_FORZOSA = 33; // mínimo de acceso a la forzosa

export const MAX_PENSION_MENSUAL = 3267.6; // tope máximo orientativo (referencia 2025)

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

/** Porcentaje de la base reguladora según años cotizados (escala simplificada). */
export function porcentajePension(aniosCotizados: number): number {
  if (aniosCotizados < MIN_COTIZACION_PENSION) return 0;
  if (aniosCotizados >= COTIZACION_PENSION_PLENA) return 100;
  // Escala lineal: 50 % a los 15 años → 100 % a los 36 años.
  const tramo = (aniosCotizados - MIN_COTIZACION_PENSION) /
    (COTIZACION_PENSION_PLENA - MIN_COTIZACION_PENSION);
  return 50 + tramo * 50;
}

export interface EscenarioInput {
  edadActual: number;
  aniosCotizadosActuales: number;
  baseReguladora: number;
  edadJubilacion: number;
  aniosAnticipo: number;
  penalPorTrimestre: number;
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
}

export function calcularEscenario({
  edadActual,
  aniosCotizadosActuales,
  baseReguladora,
  edadJubilacion,
  aniosAnticipo,
  penalPorTrimestre,
  requisitoCotizacion,
}: EscenarioInput): EscenarioResultado {
  // Años cotizados estimados en el momento de jubilarse (se sigue cotizando hasta entonces).
  const aniosExtra = Math.max(0, edadJubilacion - edadActual);
  const aniosCotizadosTotal = aniosCotizadosActuales + aniosExtra;

  const porcentaje = porcentajePension(aniosCotizadosTotal);
  let pensionBruta = (baseReguladora * porcentaje) / 100;

  const trimestres = Math.round(aniosAnticipo * 4);
  const penalizacionPct = trimestres * penalPorTrimestre;
  const reduccionEuros = (pensionBruta * penalizacionPct) / 100;
  let pensionFinal = pensionBruta - reduccionEuros;

  // Tope máximo orientativo.
  const superaTope = pensionFinal > MAX_PENSION_MENSUAL;
  if (superaTope) pensionFinal = MAX_PENSION_MENSUAL;

  const cumpleRequisito =
    requisitoCotizacion == null || aniosCotizadosTotal >= requisitoCotizacion;
  const cumplePensionMinima = aniosCotizadosTotal >= MIN_COTIZACION_PENSION;

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
  };
}
