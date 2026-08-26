#!/usr/bin/env node
/**
 * Notifica a los buscadores las URLs del sitio vía IndexNow.
 *
 * La auditoría de Ahrefs reportó 59 páginas "pendientes de enviar a IndexNow":
 * no había ninguna integración, así que nada las enviaba. Bing, Yandex, Naver y
 * Seznam consumen este protocolo; Google no, pero no estorba.
 *
 * Requiere que el fichero de clave siga publicado en la raíz del sitio
 * (`public/<clave>.txt`, cuyo contenido es la propia clave): es como el
 * buscador comprueba que quien envía las URLs controla el dominio. Si se borra
 * ese fichero, los envíos se rechazan.
 *
 * Uso:  node scripts/indexnow.mjs [--dry-run]
 * No falla nunca el despliegue: un error de notificación no debe tumbar una
 * publicación que ya está en producción. Solo informa.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const HOST = 'tujubilacionanticipada.com';
const ENDPOINT = 'https://api.indexnow.org/IndexNow';
const dryRun = process.argv.includes('--dry-run');

// La clave es el nombre del único .txt de /public que no es robots.txt.
const ficheroClave = readdirSync(join(ROOT, 'public')).find(
  (f) => f.endsWith('.txt') && f !== 'robots.txt',
);
if (!ficheroClave) {
  console.log('IndexNow: no hay fichero de clave en public/. No se envía nada.');
  process.exit(0);
}
const clave = ficheroClave.replace(/\.txt$/, '');

const sitemap = join(ROOT, 'dist', 'sitemap-0.xml');
let urls = [];
try {
  urls = [...readFileSync(sitemap, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
} catch {
  console.log('IndexNow: no se encuentra dist/sitemap-0.xml. ¿Falta el build?');
  process.exit(0);
}

if (urls.length === 0) {
  console.log('IndexNow: el sitemap no tiene URLs.');
  process.exit(0);
}

const cuerpo = {
  host: HOST,
  key: clave,
  keyLocation: `https://${HOST}/${ficheroClave}`,
  urlList: urls,
};

console.log(`IndexNow: ${urls.length} URLs · clave ${clave.slice(0, 6)}…`);

if (dryRun) {
  console.log('(--dry-run: no se envía nada)');
  process.exit(0);
}

try {
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(cuerpo),
  });
  // 200 = aceptado, 202 = aceptado pendiente de validar la clave.
  console.log(`IndexNow: respuesta HTTP ${r.status}`);
  if (r.status >= 400) console.log(await r.text());
} catch (err) {
  console.log(`IndexNow: no se pudo notificar (${err.message}). Se ignora.`);
}
