/**
 * Envía una notificación push a todas las suscripciones guardadas.
 *
 * Lo llama el pipeline de publicación tras subir un artículo nuevo:
 *   POST /api/push-send
 *   Authorization: Bearer <PUSH_SEND_SECRET>
 *   { "title": "...", "body": "...", "url": "/blog/<slug>" }
 *
 * Variables de entorno necesarias en Vercel:
 *   - VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY  (par generado con web-push)
 *   - PUSH_SEND_SECRET                     (token para autorizar el envío)
 *   - CONTACT_TO_EMAIL (opcional)          (para el campo mailto de VAPID)
 *   - Vercel KV habilitado                 (almacén de suscripciones)
 */
import webpush from 'web-push';
import { kv } from '@vercel/kv';

const KEY = 'push_subs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  const secret = process.env.PUSH_SEND_SECRET;
  const auth = req.headers['authorization'] || '';
  if (!secret || auth !== `Bearer ${secret}`) {
    return res.status(401).json({ ok: false, error: 'No autorizado.' });
  }

  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) {
    return res.status(500).json({ ok: false, error: 'Faltan claves VAPID.' });
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

  webpush.setVapidDetails(
    'mailto:' + (process.env.CONTACT_TO_EMAIL || 'hola@tujubilacionanticipada.com'),
    pub,
    priv
  );

  const payload = JSON.stringify({
    title: body.title || 'Nuevo artículo en Tu Jubilación Anticipada',
    body: body.body || 'Toca para leerlo.',
    url: body.url || '/blog',
  });

  let subs = [];
  try {
    subs = (await kv.smembers(KEY)) || [];
  } catch (err) {
    console.error('KV no disponible al leer suscripciones:', err && err.message);
    return res.status(500).json({ ok: false, error: 'Almacén no disponible.' });
  }

  let sent = 0;
  let removed = 0;
  for (const s of subs) {
    const sub = typeof s === 'string' ? JSON.parse(s) : s;
    try {
      await webpush.sendNotification(sub, payload);
      sent++;
    } catch (err) {
      if (err && (err.statusCode === 404 || err.statusCode === 410)) {
        try {
          await kv.srem(KEY, s);
        } catch {}
        removed++;
      }
    }
  }

  return res.status(200).json({ ok: true, sent, removed, total: subs.length });
}
