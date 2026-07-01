import { useState } from 'react';

/* ───────────────────────── Parámetros normativos (orientativos) ─────────────────────────
 * Cifras simplificadas con fines divulgativos. No son un cálculo oficial.
 */
const UMBRAL_COTIZACION_EDAD_REDUCIDA = 38.5; // años cotizados para jubilarse a los 65
const EDAD_LEGAL_REDUCIDA = 65; // con >= 38,5 años cotizados
const EDAD_LEGAL_PLENA = 66 + 8 / 12; // 66 años y 8 meses, con menos cotización

const ANTICIPO_VOLUNTARIA_ANIOS = 2; // máx. 2 años antes
const ANTICIPO_FORZOSA_ANIOS = 4; // máx. 4 años antes
const PENAL_VOLUNTARIA_TRIMESTRE = 1.875; // % por trimestre
const PENAL_FORZOSA_TRIMESTRE = 1.625; // % por trimestre

const MIN_COTIZACION_PENSION = 15; // mínimo para pensión contributiva
const COTIZACION_PENSION_PLENA = 36; // años para el 100 % de la base
const REQ_COTIZACION_VOLUNTARIA = 35; // mínimo de acceso a la voluntaria
const REQ_COTIZACION_FORZOSA = 33; // mínimo de acceso a la forzosa

const MAX_PENSION_MENSUAL = 3267.6; // tope máximo orientativo (referencia 2025)

/* ───────────────────────── Utilidades ───────────────────────── */
const eur = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
const eur2 = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const pct = (n) => `${n.toLocaleString('es-ES', { maximumFractionDigits: 2 })} %`;

function formatEdad(edadDecimal) {
  const anios = Math.floor(edadDecimal);
  const meses = Math.round((edadDecimal - anios) * 12);
  if (meses === 0) return `${anios} años`;
  return `${anios} años y ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
}

function fechaDesdeEdad(edadActual, edadObjetivo) {
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
function porcentajePension(aniosCotizados) {
  if (aniosCotizados < MIN_COTIZACION_PENSION) return 0;
  if (aniosCotizados >= COTIZACION_PENSION_PLENA) return 100;
  // Escala lineal: 50 % a los 15 años → 100 % a los 36 años.
  const tramo = (aniosCotizados - MIN_COTIZACION_PENSION) /
    (COTIZACION_PENSION_PLENA - MIN_COTIZACION_PENSION);
  return 50 + tramo * 50;
}

function calcularEscenario({
  edadActual,
  aniosCotizadosActuales,
  baseReguladora,
  edadJubilacion,
  aniosAnticipo,
  penalPorTrimestre,
  requisitoCotizacion,
}) {
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

/* ───────────────────────── Componente ───────────────────────── */
export default function Simulador({ disclaimer, guiaHref = '/guia-jubilacion-anticipada' }) {
  const [form, setForm] = useState({ edad: '', cotizados: '', base: '' });
  const [resultado, setResultado] = useState(null);
  const [errores, setErrores] = useState({});

  // Captura de email
  const [email, setEmail] = useState('');
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleChange = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
  };

  function validar() {
    const errs = {};
    const edad = Number(form.edad);
    const cotizados = Number(form.cotizados);
    const base = Number(form.base);

    if (!form.edad || Number.isNaN(edad) || edad < 45 || edad > 67) {
      errs.edad = 'Introduce una edad entre 45 y 67 años.';
    }
    if (form.cotizados === '' || Number.isNaN(cotizados) || cotizados < 0 || cotizados > 50) {
      errs.cotizados = 'Introduce los años cotizados (0–50).';
    }
    if (!form.base || Number.isNaN(base) || base < 300 || base > 6000) {
      errs.base = 'Introduce una base reguladora mensual realista (300–6000 €).';
    }
    setErrores(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) {
      setResultado(null);
      return;
    }

    const edadActual = Number(form.edad);
    const aniosCotizadosActuales = Number(form.cotizados);
    const baseReguladora = Number(form.base);

    // Edad legal: 65 si llegará a 38,5 años cotizados; si no, 66 y 8 meses.
    const cotizadosA65 =
      aniosCotizadosActuales + Math.max(0, EDAD_LEGAL_REDUCIDA - edadActual);
    const edadLegal =
      cotizadosA65 >= UMBRAL_COTIZACION_EDAD_REDUCIDA
        ? EDAD_LEGAL_REDUCIDA
        : EDAD_LEGAL_PLENA;

    const base = {
      edadActual,
      aniosCotizadosActuales,
      baseReguladora,
    };

    const ordinaria = calcularEscenario({
      ...base,
      edadJubilacion: edadLegal,
      aniosAnticipo: 0,
      penalPorTrimestre: 0,
      requisitoCotizacion: null,
    });

    const voluntaria = calcularEscenario({
      ...base,
      edadJubilacion: edadLegal - ANTICIPO_VOLUNTARIA_ANIOS,
      aniosAnticipo: ANTICIPO_VOLUNTARIA_ANIOS,
      penalPorTrimestre: PENAL_VOLUNTARIA_TRIMESTRE,
      requisitoCotizacion: REQ_COTIZACION_VOLUNTARIA,
    });

    const forzosa = calcularEscenario({
      ...base,
      edadJubilacion: edadLegal - ANTICIPO_FORZOSA_ANIOS,
      aniosAnticipo: ANTICIPO_FORZOSA_ANIOS,
      penalPorTrimestre: PENAL_FORZOSA_TRIMESTRE,
      requisitoCotizacion: REQ_COTIZACION_FORZOSA,
    });

    setResultado({ edadLegal, ordinaria, voluntaria, forzosa });
    setEmailEnviado(false);

    // Llevar el foco/scroll a los resultados.
    requestAnimationFrame(() => {
      document.getElementById('resultado-simulador')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  function handleEmailSubmit(e) {
    e.preventDefault();
    const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valido) {
      setEmailError('Introduce un correo electrónico válido.');
      return;
    }
    setEmailError('');
    // TODO: conectar con el proveedor de email marketing (Klaviyo, Mailchimp, etc.).
    // De momento simulamos el alta para no bloquear el flujo.
    setEmailEnviado(true);
  }

  return (
    <div className="space-y-8">
      {/* Formulario de entrada */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-paper-200 bg-paper-50 p-6 shadow-card sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="Edad actual"
            suffix="años"
            id="edad"
            value={form.edad}
            onChange={handleChange('edad')}
            error={errores.edad}
            placeholder="55"
            min={45}
            max={67}
          />
          <Field
            label="Años cotizados"
            suffix="años"
            id="cotizados"
            value={form.cotizados}
            onChange={handleChange('cotizados')}
            error={errores.cotizados}
            placeholder="34"
            min={0}
            max={50}
          />
          <Field
            label="Base reguladora mensual"
            suffix="€/mes"
            id="base"
            value={form.base}
            onChange={handleChange('base')}
            error={errores.base}
            placeholder="2000"
            min={300}
            max={6000}
            step={50}
          />
        </div>

        <button type="submit" className="btn-primary mt-6 w-full sm:w-auto">
          Calcular mi jubilación
        </button>

        <p className="mt-3 text-xs text-ink-muted">
          La base reguladora es el promedio de tus bases de cotización de los
          últimos años. Puedes consultarla en tu informe de vida laboral.
        </p>
      </form>

      {/* Resultados */}
      {resultado && (
        <div id="resultado-simulador" className="scroll-mt-24 space-y-6">
          <div className="rounded-xl border border-paper-200 bg-paper-100 p-5 text-sm text-ink-soft">
            Tu <strong>edad legal de jubilación estimada</strong> es{' '}
            <strong className="text-ink">{formatEdad(resultado.edadLegal)}</strong>. A
            partir de ahí calculamos los adelantos posibles.
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <EscenarioCard
              titulo="Jubilación ordinaria"
              etiqueta="Sin penalización"
              tono="neutral"
              escenario={resultado.ordinaria}
            />
            <EscenarioCard
              titulo="Anticipada voluntaria"
              etiqueta={`Hasta ${ANTICIPO_VOLUNTARIA_ANIOS} años antes`}
              tono="brand"
              escenario={resultado.voluntaria}
            />
            <EscenarioCard
              titulo="Anticipada forzosa"
              etiqueta={`Hasta ${ANTICIPO_FORZOSA_ANIOS} años antes (ERE/despido)`}
              tono="brand"
              escenario={resultado.forzosa}
            />
          </div>

          {/* Disclaimer legal */}
          {disclaimer && (
            <div
              role="note"
              className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900"
            >
              <strong className="font-semibold">Aviso:</strong> {disclaimer}
            </div>
          )}

          {/* Captura de email — oculta temporalmente junto con la guía (producto sin definir) */}
          {false && (!emailEnviado ? (
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
              <h3 className="text-xl font-bold text-ink">
                Recibe la guía completa con todos los pasos para planificar tu
                jubilación anticipada
              </h3>
              <p className="mt-2 text-sm text-ink-soft">
                Te enviamos un resumen y los siguientes pasos a tu correo. Sin
                spam, puedes darte de baja cuando quieras.
              </p>
              <form
                onSubmit={handleEmailSubmit}
                noValidate
                className="mt-4 flex flex-col gap-3 sm:flex-row"
              >
                <label htmlFor="email-capture" className="sr-only">
                  Correo electrónico
                </label>
                <input
                  id="email-capture"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button type="submit" className="btn-primary shrink-0">
                  Quiero la guía
                </button>
              </form>
              {emailError && (
                <p className="mt-2 text-sm text-red-600">{emailError}</p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center sm:p-8">
              <h3 className="text-xl font-bold text-green-900">¡Gracias! 🎉</h3>
              <p className="mt-2 text-sm text-green-800">
                Hemos registrado tu correo. Mientras tanto, puedes echar un
                vistazo a la guía completa.
              </p>
              <a href={guiaHref} className="btn-primary mt-4 inline-flex no-underline">
                Ver la guía
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Subcomponentes ───────────────────────── */
function Field({ label, suffix, id, value, onChange, error, placeholder, min, max, step }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="mt-1.5 flex items-center rounded-lg border border-paper-300 bg-paper-50 focus-within:border-clay-400 focus-within:ring-2 focus-within:ring-clay-500">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          aria-invalid={error ? 'true' : undefined}
          className="w-full rounded-lg bg-transparent px-3 py-2.5 text-base outline-none"
        />
        {suffix && (
          <span className="px-3 text-sm text-ink-muted" aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function EscenarioCard({ titulo, etiqueta, tono, escenario }) {
  const sinDerecho = !escenario.cumplePensionMinima;
  const sinAcceso = !escenario.cumpleRequisito && escenario.cumplePensionMinima;
  const destacado = tono === 'brand';

  return (
    <div
      className={[
        'flex h-full flex-col rounded-2xl border p-6',
        destacado
          ? 'border-clay-300 bg-paper-50 ring-1 ring-clay-200'
          : 'border-paper-200 bg-paper-50',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">{titulo}</h3>
      </div>
      <p className="mt-0.5 text-xs text-ink-muted">{etiqueta}</p>

      {sinDerecho ? (
        <div className="mt-4 flex-1 rounded-lg bg-paper-100 p-4 text-sm text-ink-soft">
          Con los datos introducidos no se alcanzarían los{' '}
          {MIN_COTIZACION_PENSION} años mínimos de cotización para una pensión
          contributiva en este escenario.
        </div>
      ) : (
        <>
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-ink-muted">
              Pensión mensual estimada
            </p>
            <p className="text-3xl font-bold text-ink">
              {eur.format(escenario.pensionFinal)}
            </p>
            <p className="text-xs text-ink-muted">
              ({eur2.format(escenario.pensionFinal)} en 14 pagas →{' '}
              {eur.format((escenario.pensionFinal * 14) / 12)}/mes prorrateado)
            </p>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Edad de jubilación" valor={formatEdad(escenario.edadJubilacion)} />
            <Row label="Fecha estimada" valor={escenario.fecha.texto} />
            <Row
              label="Años cotizados (al jubilarte)"
              valor={`${escenario.aniosCotizadosTotal.toLocaleString('es-ES', {
                maximumFractionDigits: 1,
              })} años`}
            />
            <Row label="% sobre base reguladora" valor={pct(escenario.porcentaje)} />
            {escenario.penalizacionPct > 0 && (
              <>
                <Row
                  label="Penalización aplicada"
                  valor={pct(escenario.penalizacionPct)}
                  resaltar
                />
                <Row
                  label="Reducción mensual"
                  valor={`− ${eur2.format(escenario.reduccionEuros)}`}
                  resaltar
                />
              </>
            )}
          </dl>

          {sinAcceso && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
              Para esta modalidad suelen exigirse al menos{' '}
              {escenario.requisitoCotizacion} años cotizados. Según tus datos,
              podrías no cumplir el requisito de acceso.
            </p>
          )}

          {escenario.superaTope && (
            <p className="mt-2 text-xs text-ink-muted">
              * Limitada al tope máximo de pensión orientativo.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Row({ label, valor, resaltar }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={resaltar ? 'font-semibold text-brand-700' : 'font-medium text-ink'}>
        {valor}
      </dd>
    </div>
  );
}
