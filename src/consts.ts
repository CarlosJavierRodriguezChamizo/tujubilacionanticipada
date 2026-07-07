/**
 * Configuración centralizada del sitio.
 * Edita aquí los datos globales (marca, contacto, enlaces, defaults SEO).
 */

export const SITE = {
  name: 'Tu Jubilación Anticipada',
  domain: 'tujubilacionanticipada.com',
  url: 'https://tujubilacionanticipada.com',
  /** Claim principal */
  tagline: 'Entiende tu pensión. Decide cuándo jubilarte.',
  description:
    'Información clara y orientativa sobre jubilación anticipada en España: requisitos, penalizaciones y un simulador para estimar tu pensión y tus fechas de jubilación.',
  author: 'Redacción de Tu Jubilación Anticipada',
  locale: 'es_ES',
  lang: 'es',
  email: 'hola@tujubilacionanticipada.com',
  /** Imagen Open Graph por defecto, PNG 1200×630 (ruta en /public). */
  defaultOgImage: '/og-default.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  /** Logo de la organización, PNG 512×512 (usado en datos estructurados). */
  logo: '/logo.png',
} as const;

/**
 * Perfiles oficiales de la marca (para `sameAs` de Organization).
 * Añade aquí los enlaces a redes sociales cuando existan.
 */
export const SOCIAL_PROFILES: string[] = [
  // 'https://www.linkedin.com/company/...',
  // 'https://twitter.com/...',
];

export const NAV_LINKS = [
  { href: '/simulador', label: 'Simulador' },
  // Guía oculta temporalmente hasta que el producto esté definido.
  // { href: '/guia-jubilacion-anticipada', label: 'Guía' },
  { href: '/blog', label: 'Blog' },
  { href: '/asesoramiento', label: 'Asesoramiento' },
  { href: '/sobre-este-sitio', label: 'Sobre el sitio' },
] as const;

export const FOOTER_LEGAL_LINKS = [
  { href: '/aviso-legal', label: 'Aviso legal' },
  { href: '/privacidad', label: 'Privacidad' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/sobre-este-sitio', label: 'Sobre este sitio' },
] as const;

/** Nº de artículos por página en el listado del blog */
export const POSTS_PER_PAGE = 6;

/**
 * ID de medición de Google (GA4: "G-XXXXXXX"; Ads: "AW-XXXXXXX").
 * Vacío = no se carga ningún tag de Google. El banner de consentimiento
 * funciona igual y, en cuanto rellenes este ID, el tag respetará el
 * consentimiento vía Google Consent Mode v2.
 */
export const GA_MEASUREMENT_ID = 'G-9K6WR2TR7M';

/**
 * Configuración del banner de consentimiento (CMP).
 * Sube `version` si cambian las categorías: invalida los consentimientos
 * antiguos y se vuelve a preguntar al usuario.
 */
export const COOKIE_CONSENT = {
  cookieName: 'tja_consent',
  version: 1,
  /** Vigencia del consentimiento en días (AEPD recomienda ≤ 24 meses; usamos 6 meses). */
  maxAgeDays: 180,
} as const;

/** Precio de la guía PDF (en euros) */
export const GUIA_PRECIO = 29;

/**
 * Configuración del CTA de asesoramiento y su prueba social (principios de Cialdini).
 *
 * ⚠️ IMPORTANTE (honestidad y legalidad): `socialProofCount` debe reflejar un dato
 * REAL. Un número inventado es una práctica comercial engañosa (Ley 3/1991 de
 * Competencia Desleal y RDL 1/2007). Los avatares son ilustraciones genéricas,
 * no testimonios de personas concretas. Ajusta el número (o pon 0 para ocultarlo).
 */
export const ASESORAMIENTO = {
  href: '/asesoramiento',
  socialProofCount: 0,
  avatars: [
    '/avatars/a1.jpg',
    '/avatars/a2.jpg',
    '/avatars/a3.jpg',
    '/avatars/a4.jpg',
  ],
} as const;

/**
 * Disclaimer legal reutilizable. El simulador es orientativo y no
 * sustituye la información oficial de la Seguridad Social.
 */
export const DISCLAIMER =
  'Esta herramienta ofrece una estimación orientativa basada en parámetros generales de la normativa española. No constituye asesoramiento profesional ni un cálculo oficial. Para conocer tu situación real, consulta con nuestro equipo profesional.';

/**
 * Datos identificativos para las páginas legales (RGPD + LSSI-CE).
 *
 * ⚠️ DEBES RELLENAR estos campos: la ley obliga a identificar al responsable
 * del tratamiento y al prestador del servicio. No es posible operar de forma
 * totalmente anónima si recoges datos personales (el formulario los recoge).
 *
 * Para MINIMIZAR tu exposición como persona física:
 *   1. Usa un DOMICILIO PROFESIONAL/FISCAL a efectos de notificaciones (no tu casa):
 *      p. ej. una gestoría, un coworking o un apartado/dirección de empresa.
 *   2. Contacto público SOLO por email (no publiques teléfono ni DNI si no es imprescindible).
 *   3. Alternativa más protectora: constituir una SOCIEDAD LIMITADA (S.L.); así el
 *      responsable es la empresa y no tu nombre personal (los datos de la S.L. ya
 *      son públicos en el Registro Mercantil).
 *
 * Recomendación: haz revisar estas páginas por un profesional antes de publicarlas.
 */
export const LEGAL = {
  /** Nombre y apellidos (autónomo) o razón social (empresa). */
  titular: '[TITULAR — nombre y apellidos o razón social]',
  /** NIF/DNI del titular o CIF de la empresa. */
  nif: '[NIF/CIF]',
  /** Domicilio a efectos de notificaciones (usa una dirección profesional/fiscal). */
  domicilio: '[DOMICILIO A EFECTOS DE NOTIFICACIONES]',
  /** Email de contacto legal/privacidad (impersonal del sitio). */
  email: SITE.email,
  /** Fecha de última actualización de los textos legales. */
  actualizado: 'junio de 2026',
} as const;
