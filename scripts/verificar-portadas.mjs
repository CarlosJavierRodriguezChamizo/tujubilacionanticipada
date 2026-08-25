#!/usr/bin/env node
/**
 * Comprueba que cada artículo tenga su portada en `public/blog/<slug>.jpg`.
 *
 * Existe por un fallo real: al reenfocar el artículo #59 se le cambió el slug en
 * `scripts/calendario.json`, pero la imagen pre-generada seguía guardada con el
 * slug antiguo. La routine no la encontró, degradó con elegancia —publicó sin
 * imagen, como está previsto— y el artículo salió sin portada sin que nadie se
 * enterara hasta verlo en la web.
 *
 * Este script convierte ese silencio en un aviso:
 *   - Artículos PENDIENTES sin portada  -> aviso (aún hay tiempo de generarla).
 *   - Artículos PUBLICADOS sin portada  -> incidencia (ya está en producción).
 *   - Imágenes huérfanas (sin artículo)  -> aviso, suele indicar un slug cambiado.
 *
 * Uso:  node scripts/verificar-portadas.mjs [--estricto]
 * Sin `--estricto` siempre sale con 0: informa, no bloquea, porque el sitio
 * soporta artículos sin imagen. Con `--estricto` sale con 1 si hay publicados
 * sin portada.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const IMG_DIR = join(ROOT, 'public', 'blog');
const CALENDARIO = join(ROOT, 'scripts', 'calendario.json');

const { articulos } = JSON.parse(readFileSync(CALENDARIO, 'utf8'));

const conImagen = (slug) => existsSync(join(IMG_DIR, `${slug}.jpg`));

const publicadosSin = articulos.filter((a) => a.publicado && !conImagen(a.slug));
const pendientesSin = articulos.filter((a) => !a.publicado && !conImagen(a.slug));

const slugs = new Set(articulos.map((a) => a.slug));
const huerfanas = existsSync(IMG_DIR)
  ? readdirSync(IMG_DIR)
      .filter((f) => f.endsWith('.jpg'))
      .map((f) => f.replace(/\.jpg$/, ''))
      .filter((s) => !slugs.has(s))
  : [];

console.log(`Portadas — ${articulos.length} artículos en el calendario\n`);

if (publicadosSin.length > 0) {
  console.log('PUBLICADOS SIN PORTADA (ya están en producción):');
  for (const a of publicadosSin) console.log(`  #${a.id} ${a.fecha} ${a.slug}`);
  console.log('');
}
if (pendientesSin.length > 0) {
  console.log('Pendientes sin portada (genérala antes de su fecha):');
  for (const a of pendientesSin) console.log(`  #${a.id} ${a.fecha} ${a.slug}`);
  console.log('');
}
if (huerfanas.length > 0) {
  console.log('Imágenes sin artículo (¿se cambió algún slug?):');
  for (const s of huerfanas) console.log(`  ${s}.jpg`);
  console.log('');
}
if (publicadosSin.length === 0 && pendientesSin.length === 0 && huerfanas.length === 0) {
  console.log('Todas las portadas en su sitio.');
}

if (process.argv.includes('--estricto') && publicadosSin.length > 0) process.exit(1);
