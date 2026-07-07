/**
 * Guarda una suscripción de notificaciones push en Redis (Upstash / Vercel KV).
 * Si el almacén no está configurado, responde OK igualmente para no romper el
 * frontend (pero no persiste; no se podrán enviar notificaciones a ese usuario).
 */
import { getRedis, SUBS_KEY } from './_redis.js';

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

  const redis = getRedis();
  if (!redis) {
    console.warn('Redis no configurado: la suscripción no se ha persistido.');
    return res.status(200).json({ ok: true, stored: false });
  }

  try {
    await redis.sadd(SUBS_KEY, JSON.stringify(sub));
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error guardando suscripción:', err && err.message);
    return res.status(200).json({ ok: true, stored: false });
  }
}
