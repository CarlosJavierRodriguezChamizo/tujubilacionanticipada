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
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
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
  if (honeypot) return res.status(200).json({ ok: true });

  if (!nombre || !telefono || !email || !mensaje) {
    return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'El correo no es válido.' });
  }
  if (!consent) {
    return res.status(400).json({ ok: false, error: 'Falta el consentimiento RGPD.' });
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
    // Diagnóstico temporal: indicamos qué variable falta para depurar.
    console.error('Faltan variables de entorno:', missing);
    return res
      .status(500)
      .json({ ok: false, error: 'Configuración del servidor incompleta.', missing });
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
      return res.status(502).json({ ok: false, error: 'No se pudo enviar el mensaje.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error enviando el email:', err);
    return res.status(500).json({ ok: false, error: 'Error del servidor.' });
  }
}
