/**
 * Función serverless (Vercel) para el formulario de asesoramiento.
 *
 * Envía el mensaje del formulario por email usando Resend. El destinatario
 * NO está en el código: se lee de la variable de entorno CONTACT_TO_EMAIL,
 * que debes configurar en Vercel → Settings → Environment Variables.
 *
 * Variables de entorno necesarias (en Vercel):
 *   - RESEND_API_KEY   : API key de Resend
 *   - CONTACT_TO_EMAIL : dirección de destino (privada, no se expone)
 *   - CONTACT_FROM      : (opcional) remitente verificado; por defecto sandbox de Resend
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GRACIAS_URL = '/asesoramiento/gracias';
const ERROR_URL = '/asesoramiento/error';

/**
 * ¿La petición viene de un envío nativo de formulario (sin JavaScript)?
 *
 * El envío por fetch manda `Content-Type: application/json`; el navegador, al
 * enviar un <form method="post">, manda `application/x-www-form-urlencoded` (o
 * `multipart/form-data`) y espera un documento HTML. En ese caso hay que
 * responder con una redirección 303 a una página real, no con JSON.
 */
function esEnvioNativo(req) {
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (ct.includes('application/json')) return false;
  return (
    ct.includes('application/x-www-form-urlencoded') ||
    ct.includes('multipart/form-data')
  );
}

/** Responde en el formato que corresponde al tipo de petición. */
function responder(req, res, { status, ok, error, redirect }) {
  if (esEnvioNativo(req)) {
    res.setHeader('Location', redirect);
    return res.status(303).end();
  }
  return res.status(status).json(ok ? { ok: true } : { ok: false, error });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return responder(req, res, {
      status: 405, ok: false, error: 'Método no permitido', redirect: ERROR_URL,
    });
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

  const nombre = (body.nombre || '').toString().trim();
  const telefono = (body.telefono || '').toString().trim();
  const email = (body.email || '').toString().trim();
  const mensaje = (body.mensaje || '').toString().trim();
  const consent = body.consent === true || body.consent === 'true' || body.consent === 'on';
  const honeypot = (body.empresa || '').toString().trim(); // trampa anti-spam

  // Si el honeypot viene relleno, es un bot: respondemos OK y descartamos.
  if (honeypot) {
    return responder(req, res, { status: 200, ok: true, redirect: GRACIAS_URL });
  }

  if (!nombre || !telefono || !email || !mensaje) {
    return responder(req, res, {
      status: 400, ok: false, error: 'Faltan campos obligatorios.', redirect: ERROR_URL,
    });
  }
  if (!EMAIL_RE.test(email)) {
    return responder(req, res, {
      status: 400, ok: false, error: 'El correo no es válido.', redirect: ERROR_URL,
    });
  }
  if (!consent) {
    return responder(req, res, {
      status: 400, ok: false, error: 'Falta el consentimiento RGPD.', redirect: ERROR_URL,
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from =
    process.env.CONTACT_FROM ||
    'Asesoramiento Tu Jubilación Anticipada <asesoramiento@tujubilacionanticipada.com>';

  if (!apiKey || !to) {
    const missing = [!apiKey && 'RESEND_API_KEY', !to && 'CONTACT_TO_EMAIL']
      .filter(Boolean)
      .join(', ');
    // El detalle solo va al log del servidor, nunca al cliente.
    console.error('Faltan variables de entorno:', missing);
    return responder(req, res, {
      status: 500, ok: false,
      error: 'Configuración del servidor incompleta.', redirect: ERROR_URL,
    });
  }

  const html = `
    <h2>Nueva solicitud de asesoramiento</h2>
    <p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
    <p><strong>Teléfono:</strong> ${escapeHtml(telefono)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Mensaje:</strong></p>
    <p>${escapeHtml(mensaje).replace(/\n/g, '<br>')}</p>
    <hr>
    <p style="color:#888;font-size:12px">Enviado desde el formulario de asesoramiento de tujubilacionanticipada.com</p>
  `;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Asesoramiento — ${nombre}`,
        html,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('Error de Resend:', r.status, detail);
      return responder(req, res, {
        status: 502, ok: false, error: 'No se pudo enviar el mensaje.', redirect: ERROR_URL,
      });
    }

    return responder(req, res, { status: 200, ok: true, redirect: GRACIAS_URL });
  } catch (err) {
    console.error('Error enviando el email:', err);
    return responder(req, res, {
      status: 500, ok: false, error: 'Error del servidor.', redirect: ERROR_URL,
    });
  }
}
