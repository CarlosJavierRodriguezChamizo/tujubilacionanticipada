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
    'Jubilación anticipada en España explicada con fuentes oficiales: requisitos, coeficientes reductores y un simulador para estimar tu pensión y tus fechas.',
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
] as const;

export const FOOTER_LEGAL_LINKS = [
  { href: '/aviso-legal', label: 'Aviso legal' },
  { href: '/privacidad', label: 'Privacidad' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/transparencia-ia', label: 'Transparencia IA' },
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

/** Foto de perfil de los revisores del contenido (por nombre). */
export const REVIEWERS: Record<string, string> = {
  'Javier Rodríguez': '/equipo/javier-rodriguez.jpg',
};

/**
 * Notificaciones push (Web Push).
 * Clave pública VAPID (no es secreta; se usa en el navegador). La privada va
 * en la variable de entorno VAPID_PRIVATE_KEY de Vercel (nunca en el código).
 * Vacío = no se muestra el popup de suscripción.
 */
export const VAPID_PUBLIC_KEY =
  'BIGmcg-4i1VUzoCGYOyS5G4so34rTj1mRivP3tF_Ur0b0AOlflhrZdIWyM2KiZa9cqA5d0ztuFunG3S_sqca618';

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
/**
 * Datos identificativos exigidos por el art. 10 de la LSSI-CE.
 *
 * Mientras un campo conserve su marcador entre corchetes, las páginas legales
 * NO lo muestran: caen al texto genérico en vez de imprimir "[NIF/CIF]" en
 * producción (ver `tieneDatosIdentificativos` en src/lib/legal.ts). En cuanto
 * se rellenen los tres, el bloque de identificación aparece solo, sin tocar
 * ninguna página.
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
  actualizado: 'agosto de 2026',
} as const;

/**
 * Transparencia sobre el uso de inteligencia artificial.
 *
 * Fuente única de verdad de todo lo que el sitio declara públicamente sobre
 * IA: la insignia de cada artículo, el bloque de divulgación, la página
 * /transparencia-ia y las etiquetas legibles por máquina. Si cambia el
 * proceso de producción, se cambia AQUÍ y el sitio entero queda coherente.
 *
 * Marco normativo: Reglamento (UE) 2024/1689 (Reglamento de Inteligencia
 * Artificial, «RIA»), en particular su artículo 50 (obligaciones de
 * transparencia) y su artículo 4 (alfabetización en materia de IA). El
 * sitio actúa como **responsable del despliegue** («deployer»): usa
 * sistemas de IA de terceros, no los desarrolla ni los comercializa.
 *
 * El art. 50.4 exime de la obligación de divulgar cuando el contenido
 * generado por IA se somete a revisión humana y alguien asume la
 * responsabilidad editorial. Aquí se divulga **igualmente**: la exención es
 * discutible caso por caso y la transparencia nunca es sancionable.
 *
 * ⚠️ Estas declaraciones deben describir el proceso REAL. Si algún día el
 * contenido dejara de revisarse antes de publicarse, hay que corregir el
 * texto de `revisionHumana` y `etiquetaArticulo`, no mantenerlo por inercia:
 * una divulgación inexacta es peor que no tenerla (art. 5 y 7 de la
 * Directiva 2005/29/CE, RDL 1/2007 y art. 50.5 RIA).
 */
export const IA = {
  /** Página pública con la declaración completa. */
  href: '/transparencia-ia',
  /** Versión de la declaración; súbela cuando cambie el proceso descrito. */
  version: '1.0',
  /** Fecha de la última revisión de la declaración. */
  actualizado: 'septiembre de 2026',

  /** Etiqueta corta que acompaña a cada artículo (visible, primera exposición). */
  etiquetaArticulo: 'Texto elaborado con inteligencia artificial y revisado por una persona',
  /** Etiqueta corta de las ilustraciones generadas con IA. */
  etiquetaImagen: 'Ilustración generada con inteligencia artificial',
  /** Etiqueta de las herramientas de cálculo, que NO usan IA. */
  etiquetaHerramienta: 'Cálculo determinista: esta herramienta no usa inteligencia artificial',

  /**
   * Inventario de sistemas de IA en uso (art. 50 RIA y art. 26 por analogía).
   * `donde` debe permitir a cualquiera localizar el resultado en el sitio.
   */
  sistemas: [
    {
      id: 'redaccion',
      nombre: 'Modelo de lenguaje generativo (Claude, de Anthropic)',
      finalidad:
        'Redactar el borrador de los artículos del blog a partir de un calendario editorial, unas instrucciones fijas y las fuentes oficiales indicadas en cada encargo.',
      donde: 'Artículos publicados en /blog.',
      supervision:
        'Ningún borrador se publica tal cual: pasa un verificador automático de datos normativos y la revisión editorial de una persona identificada en el artículo.',
    },
    {
      id: 'ilustracion',
      nombre: 'Modelo de generación de imágenes (Magnific / Freepik)',
      finalidad:
        'Generar la ilustración de portada de cada artículo, en un estilo editorial fijo, sin texto y sin representar a personas reales, hechos reales ni lugares identificables.',
      donde: 'Imágenes de portada de los artículos de /blog.',
      supervision:
        'Se revisan antes de publicarse. No son fotografías, no documentan hechos y nunca se presentan como tales.',
    },
    {
      id: 'mantenimiento',
      nombre: 'Agentes de desarrollo asistidos por IA (Claude Code)',
      finalidad:
        'Mantener el código del sitio y auditar el contenido publicado (enlaces, coherencia normativa, SEO técnico).',
      donde: 'Código y procesos internos; no genera contenido que leas como información.',
      supervision:
        'Cada cambio queda registrado en el repositorio del proyecto y se despliega bajo la responsabilidad del titular del sitio.',
    },
  ],

  /**
   * Lo que NO usa IA. Es tan relevante como lo que sí: evita que el usuario
   * atribuya a un modelo generativo un resultado que produce una fórmula
   * legal cerrada, auditable y reproducible.
   */
  sinIA: [
    {
      nombre: 'Simulador de jubilación (/simulador)',
      detalle:
        'Aplica las fórmulas y los coeficientes de la Ley General de la Seguridad Social. Con los mismos datos devuelve siempre el mismo resultado: no infiere, no aprende y no cambia con el uso. Los datos se calculan en tu navegador y no se envían a ningún servidor.',
    },
    {
      nombre: 'Informe de Fecha Óptima (/informe)',
      detalle:
        'Se genera con el mismo motor de cálculo determinista, verificado contra el BOE. Ningún modelo generativo interviene en tus cifras.',
    },
    {
      nombre: 'Comprobación previa de requisitos (/informe)',
      detalle:
        'Es una comprobación automática de requisitos legales, no una valoración de tu persona: no hay perfilado, no puntúa, y su único efecto es evitar que compres un informe que no te serviría.',
    },
  ],

  /** Cómo se supervisa el contenido generado (art. 50.4 RIA). */
  revisionHumana:
    'Antes de publicarse, cada artículo se contrasta con la fuente oficial citada y lo revisa una persona identificada con nombre y cargo al pie del propio artículo. La responsabilidad editorial de lo publicado es del titular del sitio.',

  /** Limitaciones conocidas que el usuario debe poder leer antes de fiarse. */
  limitaciones: [
    'Un modelo de lenguaje puede redactar con seguridad un dato equivocado. Por eso ninguna cifra normativa se publica sin enlace a su fuente oficial.',
    'Los modelos se entrenan con textos de internet, donde abundan datos derogados. Este sitio publicó durante meses el coeficiente reductor fijo del 1,875 % por trimestre, derogado en 2022, precisamente por ese motivo: se corrigió y hoy una auditoría automática vigila esas cifras.',
    'La normativa cambia. Un artículo correcto en su fecha de publicación puede quedar desactualizado: comprueba siempre la fecha de actualización que figura en él.',
    'Nada de lo publicado —lo escriba una persona o una máquina— es asesoramiento jurídico, fiscal o financiero, ni sustituye a la información oficial de la Seguridad Social sobre tu caso.',
  ],
} as const;
