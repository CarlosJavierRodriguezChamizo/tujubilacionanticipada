import { useState } from 'react';
import {
  EDAD_LEGAL_REDUCIDA,
  ANTICIPO_VOLUNTARIA_MESES,
  ANTICIPO_FORZOSA_MESES,
  ANTICIPO_VOLUNTARIA_ANIOS,
  ANTICIPO_FORZOSA_ANIOS,
  MIN_COTIZACION_PENSION,
  REQ_COTIZACION_VOLUNTARIA,
  REQ_COTIZACION_FORZOSA,
  edadLegalJubilacion,
  calcularEscenario,
} from '../lib/pension-calculo';

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

/* ───────────────────────── Componente ───────────────────────── */
export default function Simulador({ disclaimer }) {
  const [form, setForm] = useState({ edad: '', cotizados: '', base: '' });
  const [resultado, setResultado] = useState(null);
  const [errores, setErrores] = useState({});

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

    // Edad ordinaria en 2026 (DT 7.ª LGSS): 65 años con 38 años y 3 meses
    // cotizados o más; 66 años y 10 meses con menos. El periodo cotizado se
    // proyecta como si siguiera cotizando hasta esa edad (arts. 207.2 y 208.2).
    const cotizadosA65 =
      aniosCotizadosActuales + Math.max(0, EDAD_LEGAL_REDUCIDA - edadActual);
    const edadLegal = edadLegalJubilacion(cotizadosA65);

    const base = {
      edadActual,
      aniosCotizadosActuales,
      baseReguladora,
    };

    const ordinaria = calcularEscenario({
      ...base,
      edadJubilacion: edadLegal,
      mesesAnticipo: 0,
      modalidad: 'ordinaria',
      requisitoCotizacion: null,
    });

    const voluntaria = calcularEscenario({
      ...base,
      edadJubilacion: edadLegal - ANTICIPO_VOLUNTARIA_ANIOS,
      mesesAnticipo: ANTICIPO_VOLUNTARIA_MESES,
      modalidad: 'voluntaria',
      requisitoCotizacion: REQ_COTIZACION_VOLUNTARIA,
    });

    const forzosa = calcularEscenario({
      ...base,
      edadJubilacion: edadLegal - ANTICIPO_FORZOSA_ANIOS,
      mesesAnticipo: ANTICIPO_FORZOSA_MESES,
      modalidad: 'involuntaria',
      requisitoCotizacion: REQ_COTIZACION_FORZOSA,
    });

    setResultado({ edadLegal, ordinaria, voluntaria, forzosa });

    // Evento GA4: el usuario ha calculado su jubilación con el simulador.
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'simulador_calcular', {
        edad_legal: edadLegal,
        anios_cotizados: aniosCotizadosActuales,
      });
    }

    // Llevar el foco/scroll a los resultados.
    requestAnimationFrame(() => {
      document.getElementById('resultado-simulador')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
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

          {/* CTA hacia asesoramiento personalizado */}
          <div className="rounded-2xl border border-clay-200 bg-clay-50 p-6 sm:p-8">
            <div className="sm:flex sm:items-center sm:justify-between sm:gap-6">
              <div>
                <h3 className="text-xl font-bold text-ink">
                  ¿Quieres que un profesional revise tu caso?
                </h3>
                <p className="mt-2 text-sm text-ink-soft">
                  Esta estimación es orientativa. Nuestro equipo puede analizar tu
                  situación concreta y ayudarte a decidir el mejor momento para
                  jubilarte. Sin compromiso.
                </p>
              </div>
              <a
                href="/asesoramiento"
                onClick={() => {
                  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
                    window.gtag('event', 'cta_asesoramiento', { location: 'simulador' });
                  }
                }}
                className="btn-accent mt-4 inline-flex shrink-0 no-underline sm:mt-0"
              >
                Solicitar asesoramiento
              </a>
            </div>
          </div>

          {/* CTA hacia el informe de fecha óptima (de pago) */}
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-ink">
              ¿Quieres tu fecha exacta, verificada contra el BOE?
            </h3>
            <p className="mt-2 text-sm text-ink-soft">
              Esta estimación es orientativa. El informe de Fecha Óptima de
              Jubilación calcula, con tus datos concretos, la tabla mes a mes de
              tus fechas posibles, tus acantilados y tu punto de equilibrio,
              con cada cifra respaldada por su fuente oficial.
            </p>
            <a
              href="/informe"
              onClick={() => {
                if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
                  window.gtag('event', 'cta_informe', { location: 'simulador' });
                }
              }}
              className="btn-primary mt-4 inline-flex no-underline"
            >
              Ver el informe de Fecha Óptima
            </a>
          </div>
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
