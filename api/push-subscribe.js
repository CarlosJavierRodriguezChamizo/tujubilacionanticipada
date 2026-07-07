/**
 * Guarda una suscripción de notificaciones push.
 * Almacena en Vercel KV (requiere KV habilitado en el proyecto). Si KV no está
 * configurado, responde OK igualmente para no romper el frontend (pero no persiste).
 */
import { kv } from '@vercel/kv';

const KEY = 'push_subs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const sub = (body && (body.subscription || body)) || {};
  if (!sub || !sub.endpoint) {
    return res.status(400).json({ ok: false, error: 'Suscripción no válida.' });
  }

  try {
    await kv.sadd(KEY, JSON.stringify(sub));
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('KV no disponible al guardar suscripción:', err && err.message);
    // No bloqueamos al usuario; simplemente no se ha persistido.
    return res.status(200).json({ ok: true, stored: false });
  }
}
