import { LEGAL } from '../consts';

/** Un campo legal sigue sin rellenar si conserva su marcador entre corchetes. */
function pendiente(valor: string): boolean {
  return valor.trim().startsWith('[');
}

/**
 * ¿Están rellenos los datos identificativos del art. 10 LSSI-CE?
 *
 * Se usa para decidir si las páginas legales publican el bloque de
 * identificación (titular, NIF y domicilio) o caen al texto genérico. Evita
 * que un marcador sin rellenar acabe impreso en producción.
 */
export const tieneDatosIdentificativos =
  !pendiente(LEGAL.titular) && !pendiente(LEGAL.nif) && !pendiente(LEGAL.domicilio);
