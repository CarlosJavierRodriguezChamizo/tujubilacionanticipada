/**
 * Cliente Redis (Upstash) para las suscripciones push.
 * Los archivos con prefijo "_" en /api no se exponen como endpoints en Vercel.
 * Detecta las variables tanto de Vercel KV (KV_REST_API_*) como del
 * marketplace de Upstash (UPSTASH_REDIS_REST_*).
 */
import { Redis } from '@upstash/redis';

export const SUBS_KEY = 'push_subs';

export function getRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}
