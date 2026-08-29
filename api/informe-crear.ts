/**
 * Función serverless (Vercel) para el formulario del Informe de Fecha Óptima
 * (`src/pages/informe.astro`, sección #form, `action="/api/informe-crear"`).
 *
 * Antes de crear ninguna sesión de pago hace un PRECHECK gratuito contra el
 * motor de cálculo (`src/lib/pension-calculo.ts`) para decidir si el caso
 * puede acceder a alguna modalidad de jubilación anticipada:
 *
 *   - Art. 208.1.b) / 207.1.c) LGSS: 35 años cotizados (voluntaria) o 33
 *     (por causa no imputable), acreditados en algún momento dentro de la
 *     ventana de anticipo (hasta 24 / 48 meses antes de la edad ordinaria).
 *   - Art. 205.1.b) LGSS: carencia mínima de MIN_COTIZACION_PENSION años.
 *   - Art. 208.1.c) LGSS: en la modalidad voluntaria, la pensión resultante
 *     debe superar la cuantía de la pensión mínima que correspondería al
 *     interesado a los 65 años.
 *
 * Si el caso NO cumple, se redirige (303, envío nativo del formulario) a
 * `/informe/no-aplica`, una página gratuita que explica qué le falta. No se
 * le cobra nada: cobrar 49 € a quien no puede jubilarse anticipadamente es
 * justo lo que ESTRATEGIA.md (E-1) señala como el error que genera
 * devoluciones y reseñas negativas.
 *
 * Si el caso SÍ cumple, esta tarea (cro-005) todavía no crea la sesión de
 * pago: eso depende de Stripe, bloqueado hoy por datos vacíos en
 * `src/consts.ts` (LEGAL.titular/nif/domicilio) y se completa en cro-007.
 * Por eso respondemos con un 501 explícito ("pago pendiente de activar") en
 * vez de simular un cobro que no podemos procesar.
 */

import {
  edadLegalJubilacion,
  calcularEscenario,
  fechaDesdeEdad,
  REQ_COTIZACION_VOLUNTARIA,
  REQ_COTIZACION_FORZOSA,
  MIN_COTIZACION_PENSION,
  type Modalidad,
} from '../src/lib/pension-calculo';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

const NO_APLICA_URL = '/informe/no-aplica';

/**
 * ¿La petición viene de un envío nativo de formulario (sin JavaScript)?
 * Mismo criterio que `api/contact.js`.
 */
function esEnvioNativo(req: any): boolean {
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (ct.includes('application/json')) return false;
  return (
    ct.includes('application/x-www-form-urlencoded') ||
    ct.includes('multipart/form-data')
  );
}

function redirigir(req: any, res: any, status: number, location: string) {
  if (esEnvioNativo(req)) {
    res.setHeader('Location', location);
    return res.status(status).end();
  }
  return res.status(status).json({ ok: false, redirect: location });
}

function errorJsonONativo(req: any, res: any, status: number, mensaje: string) {
  if (esEnvioNativo(req)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res
      .status(status)
      .send(
        `<!doctype html><meta charset="utf-8"><title>Error</title><p>${mensaje}</p>`,
      );
  }
  return res.status(status).json({ ok: false, error: mensaje });
}

function edadDesdeFecha(fechaISO: string): number {
  const nacimiento = new Date(`${fechaISO}T00:00:00Z`);
  const hoy = new Date();
  const ms = hoy.getTime() - nacimiento.getTime();
  return ms / (1000 * 60 * 60 * 24 * 365.25);
}

/** Años cotizados acreditados a la edad ordinaria, con punto fijo (el umbral
 * de 38 años y 3 meses de la DT 7.ª depende de la propia edad ordinaria). */
function proyectarAniosCotizados(
  aniosCotizadosActuales: number,
  edadActual: number,
  seguiraCotizando: boolean,
): { edadOrdinaria: number; aniosCotizadosProyectados: number } {
  let edadOrdinaria = edadLegalJubilacion(aniosCotizadosActuales);
  for (let i = 0; i < 3; i++) {
    const proyectados = seguiraCotizando
      ? aniosCotizadosActuales + Math.max(0, edadOrdinaria - edadActual)
      : aniosCotizadosActuales;
    const nuevaEdadOrdinaria = edadLegalJubilacion(proyectados);
    if (nuevaEdadOrdinaria === edadOrdinaria) {
      return { edadOrdinaria, aniosCotizadosProyectados: proyectados };
    }
    edadOrdinaria = nuevaEdadOrdinaria;
  }
  const proyectados = seguiraCotizando
    ? aniosCotizadosActuales + Math.max(0, edadOrdinaria - edadActual)
    : aniosCotizadosActuales;
  return { edadOrdinaria, aniosCotizadosProyectados: proyectados };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return errorJsonONativo(req, res, 405, 'Método no permitido.');
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const honeypot = (body.empresa || '').toString().trim();
  if (honeypot) {
    // Bot: no revelamos nada, respondemos como si todo fuera bien.
    return redirigir(req, res, 303, NO_APLICA_URL);
  }

  const fechaNacimiento = (body.fecha_nacimiento || '').toString().trim();
  const aniosCotizadosStr = (body.anos_cotizados || '').toString().trim();
  const mesesCotizadosStr = (body.meses_cotizados || '').toString().trim();
  const fechaInformeVidaLaboral = (body.fecha_informe_vida_laboral || '').toString().trim();
  const baseReguladoraStr = (body.base_reguladora || '').toString().trim();
  const modalidadForm = (body.modalidad || '').toString().trim();
  const seguiraCotizandoStr = (body.seguira_cotizando || '').toString().trim();
  const email = (body.email || '').toString().trim();
  const consentRgpd =
    body.consent_rgpd === true || body.consent_rgpd === 'true' || body.consent_rgpd === 'on';
  // La casilla de avisos normativos es opcional y no condiciona la entrega
  // (así se indica en el formulario); se lee aquí para que quede validada
  // junto al resto de campos, aunque su persistencia llega con el envío del
  // informe en cro-006/cro-007, fuera del alcance de este precheck.
  void (
    body.consent_avisos === true ||
    body.consent_avisos === 'true' ||
    body.consent_avisos === 'on'
  );

  // Campos obligatorios (los 6 del formulario de /informe).
  if (
    !fechaNacimiento ||
    !aniosCotizadosStr ||
    !mesesCotizadosStr ||
    !fechaInformeVidaLaboral ||
    !baseReguladoraStr ||
    !modalidadForm ||
    !seguiraCotizandoStr ||
    !email
  ) {
    return errorJsonONativo(req, res, 400, 'Faltan campos obligatorios.');
  }

  if (!EMAIL_RE.test(email)) {
    return errorJsonONativo(req, res, 400, 'El correo no es válido.');
  }
  if (!FECHA_RE.test(fechaNacimiento) || !FECHA_RE.test(fechaInformeVidaLaboral)) {
    return errorJsonONativo(req, res, 400, 'Alguna fecha no es válida.');
  }
  if (!consentRgpd) {
    return errorJsonONativo(req, res, 400, 'Falta el consentimiento RGPD obligatorio.');
  }
  if (modalidadForm !== 'voluntaria' && modalidadForm !== 'no_imputable') {
    return errorJsonONativo(req, res, 400, 'La modalidad indicada no es válida.');
  }
  if (seguiraCotizandoStr !== 'si' && seguiraCotizandoStr !== 'no') {
    return errorJsonONativo(req, res, 400, 'Falta indicar si seguirás cotizando.');
  }

  const aniosCotizadosNum = Number(aniosCotizadosStr);
  const mesesCotizadosNum = Number(mesesCotizadosStr);
  const baseReguladora = Number(baseReguladoraStr);
  if (
    !Number.isFinite(aniosCotizadosNum) ||
    !Number.isFinite(mesesCotizadosNum) ||
    !Number.isFinite(baseReguladora) ||
    aniosCotizadosNum < 0 ||
    mesesCotizadosNum < 0 ||
    mesesCotizadosNum > 11 ||
    baseReguladora <= 0
  ) {
    return errorJsonONativo(req, res, 400, 'Alguno de los datos numéricos no es válido.');
  }

  const edadActual = edadDesdeFecha(fechaNacimiento);
  if (edadActual < 40 || edadActual > 90) {
    // El producto es para quien se acerca a la jubilación anticipada: fuera
    // de este rango, lo más honesto es no fingir un precheck con sentido.
    return errorJsonONativo(req, res, 400, 'La fecha de nacimiento indicada no es válida.');
  }

  const modalidad: Modalidad = modalidadForm === 'voluntaria' ? 'voluntaria' : 'involuntaria';
  const seguiraCotizando = seguiraCotizandoStr === 'si';
  const requisitoCotizacion =
    modalidad === 'voluntaria' ? REQ_COTIZACION_VOLUNTARIA : REQ_COTIZACION_FORZOSA;

  const aniosCotizadosActuales = aniosCotizadosNum + mesesCotizadosNum / 12;

  const { edadOrdinaria, aniosCotizadosProyectados } = proyectarAniosCotizados(
    aniosCotizadosActuales,
    edadActual,
    seguiraCotizando,
  );

  // Art. 208.1.b) / 207.1.c) LGSS: ¿llegará a acreditar los años cotizados
  // exigidos en algún momento antes de la edad ordinaria (ventana de
  // anticipo)? Si a la edad ordinaria no los tiene, no los tendrá nunca en
  // esa modalidad.
  const cumpleAniosCotizados = aniosCotizadosProyectados >= requisitoCotizacion;
  // Art. 205.1.b) LGSS: carencia mínima. Queda cubierta por el requisito
  // anterior (35/33 > 15) pero se deja explícita por trazabilidad legal.
  const cumpleCarencia = aniosCotizadosProyectados >= MIN_COTIZACION_PENSION;

  let cumpleMinimaExigida = true; // Art. 208.1.c): solo aplica a la voluntaria.
  if (cumpleAniosCotizados && cumpleCarencia && modalidad === 'voluntaria') {
    // Mejor escenario posible dentro de la modalidad voluntaria: cero meses
    // de anticipo (pensión máxima alcanzable). Si ni así se supera la mínima
    // exigida, ningún anticipo real (que solo penaliza más) la superará.
    const escenarioMejorCaso = calcularEscenario({
      edadActual,
      aniosCotizadosActuales,
      baseReguladora,
      edadJubilacion: edadOrdinaria,
      mesesAnticipo: 0,
      modalidad: 'voluntaria',
      requisitoCotizacion,
    });
    cumpleMinimaExigida = escenarioMejorCaso.superaMinimaExigida;
  }

  const accede = cumpleAniosCotizados && cumpleCarencia && cumpleMinimaExigida;

  if (!accede) {
    const motivo = !cumpleAniosCotizados || !cumpleCarencia ? 'anios' : 'minima';
    const fechaOrdinaria = fechaDesdeEdad(edadActual, edadOrdinaria);
    const params = new URLSearchParams({
      motivo,
      modalidad: modalidadForm,
      seguira_cotizando: seguiraCotizandoStr,
      anios_cotizados_actuales: aniosCotizadosActuales.toFixed(1),
      anios_requeridos: String(requisitoCotizacion),
      anios_cotizados_proyectados: aniosCotizadosProyectados.toFixed(1),
      edad_ordinaria: edadOrdinaria.toFixed(2),
      fecha_ordinaria: fechaOrdinaria.texto,
    });
    return redirigir(req, res, 303, `${NO_APLICA_URL}?${params.toString()}`);
  }

  // El caso accede a una modalidad de jubilación anticipada. La creación de
  // la sesión de pago (Stripe) llega en cro-007: hoy no se simula un cobro.
  return errorJsonONativo(
    req,
    res,
    501,
    'Tu caso cumple los requisitos para jubilarte anticipadamente, pero el pago ' +
      'aún no está activado en este sitio. Escríbenos y te avisamos en cuanto esté ' +
      'disponible: no se te ha cobrado nada.',
  );
}
