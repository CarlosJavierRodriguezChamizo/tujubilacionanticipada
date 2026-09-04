/**
 * Generación centralizada de datos estructurados (JSON-LD / Schema.org).
 *
 * Las entidades sitewide (Organization y WebSite) llevan un `@id` estable,
 * de modo que el resto de entidades (BlogPosting, Product, WebPage…) las
 * referencian por `@id` en lugar de duplicar la información. Esto crea un
 * grafo de conocimiento coherente para los motores de búsqueda.
 */
import type { CollectionEntry } from 'astro:content';
import { SITE, SOCIAL_PROFILES, REVIEWERS, IA } from '../consts';
import { jpegSize, resolveHeroImage } from './posts';
import { getCanonicalSlug } from './canonical-map';

type JsonLd = Record<string, unknown>;

/** Convierte una ruta relativa en URL absoluta sobre el dominio del sitio. */
export function absUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}

// `@id` estables de las entidades sitewide.
export const ORG_ID = `${SITE.url}/#organization`;
export const WEBSITE_ID = `${SITE.url}/#website`;

/**
 * Marcado del origen digital del contenido (transparencia de IA, art. 50 RIA).
 *
 * Schema.org no define ninguna propiedad para declarar que un contenido lo
 * generó un modelo, así que se usa el vocabulario estándar del sector: la
 * propiedad `digitalsourcetype` de PLUS y los valores del NewsCode del IPTC,
 * que es lo que leen C2PA, los agregadores y las herramientas de verificación.
 *
 * El término se declara en un `@context` en forma de array (JSON-LD 1.1) y
 * SOLO en el nodo WebPage: el nodo Article, del que dependen los resultados
 * enriquecidos de Google, se deja intacto con su `@context` de siempre.
 */
const PLUS_DIGITAL_SOURCE_TYPE = 'http://ns.useplus.org/ldf/vocab/digitalsourcetype';
const IPTC_TRAINED_ALGORITHMIC_MEDIA =
  'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia';

/** `@context` que añade el término `digitalSourceType` al de Schema.org. */
const CONTEXT_CON_ORIGEN_DIGITAL = [
  'https://schema.org',
  { digitalSourceType: { '@id': PLUS_DIGITAL_SOURCE_TYPE, '@type': '@id' } },
];

/**
 * Páginas de entidad de los revisores del contenido (EEAT): asocian el
 * nombre que aparece en `reviewedBy` con una URL indexable estable, de modo
 * que el `Person` del schema tenga `@id` y `url` verificables.
 */
export const REVIEWER_PROFILES: Record<string, string> = {
  'Javier Rodríguez': '/equipo/javier-rodriguez',
};

/** `@id` estable de la entidad Person de un revisor, si tiene página de entidad. */
export function reviewerPersonId(name: string): string | undefined {
  const profilePath = REVIEWER_PROFILES[name];
  return profilePath ? `${absUrl(profilePath)}#person` : undefined;
}

/** Person de un revisor de contenido, con `@id`/`url` estables si tiene página de entidad. */
export function reviewerPersonSchema(name: string, jobTitle?: string): JsonLd {
  const profilePath = REVIEWER_PROFILES[name];
  const url = profilePath ? absUrl(profilePath) : undefined;
  return {
    '@type': 'Person',
    name,
    ...(jobTitle ? { jobTitle } : {}),
    ...(url ? { '@id': `${url}#person`, url } : {}),
    ...(REVIEWERS[name] ? { image: absUrl(REVIEWERS[name]) } : {}),
  };
}

/**
 * Referencia al revisor para usar en otras entidades (p. ej. BlogPosting.reviewedBy):
 * si el revisor tiene página de entidad propia, referencia su `@id` en vez de
 * duplicar el objeto Person; si no, incrusta el Person completo como fallback.
 */
export function reviewerReferenceSchema(name: string, jobTitle?: string): JsonLd {
  const id = reviewerPersonId(name);
  return id ? { '@id': id } : reviewerPersonSchema(name, jobTitle);
}

/** Organización titular del sitio. Presente en todas las páginas. */
export function organizationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    logo: {
      '@type': 'ImageObject',
      url: absUrl(SITE.logo),
    },
    image: absUrl(SITE.defaultOgImage),
    email: SITE.email,
    // Principios editoriales publicados: incluyen la declaración de uso de IA
    // (art. 50 RIA). Es la propiedad de Schema.org prevista justo para esto.
    publishingPrinciples: absUrl(IA.href),
    ...(SOCIAL_PROFILES.length > 0 ? { sameAs: SOCIAL_PROFILES } : {}),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: SITE.email,
      availableLanguage: ['es'],
    },
  };
}

/** Sitio web. Presente en todas las páginas; publisher → Organization. */
export function websiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: SITE.lang,
    publisher: { '@id': ORG_ID },
  };
}

/** Migas de pan. `items` ordenadas de la raíz a la página actual. */
export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLd {
  const current = items[items.length - 1];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${absUrl(current.path)}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absUrl(item.path),
    })),
  };
}

/**
 * Página genérica. Enlaza con WebSite (isPartOf) y Organization, y opcionalmente
 * con su BreadcrumbList. `type` permite especializar (AboutPage, ContactPage…).
 */
export function webPageSchema(opts: {
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'ProfilePage';
  path: string;
  name: string;
  description: string;
  breadcrumbPath?: string;
}): JsonLd {
  const url = absUrl(opts.path);
  return {
    '@context': 'https://schema.org',
    '@type': opts.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: opts.name,
    description: opts.description,
    inLanguage: SITE.lang,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    ...(opts.breadcrumbPath
      ? { breadcrumb: { '@id': `${absUrl(opts.breadcrumbPath)}#breadcrumb` } }
      : {}),
  };
}

/** Artículo del blog. */
export function blogPostingSchema(post: CollectionEntry<'blog'>): JsonLd {
  const path = `/blog/${post.slug}`;
  const url = absUrl(path);
  const { data } = post;

  // Si el artículo está consolidado (canibalización de keyword, seo-013) hacia
  // otro, el JSON-LD debe declarar como entidad principal la URL de destino,
  // no la propia: evita contradecir al <link rel=canonical> (seo-014/seo-015),
  // que ya apunta hacia allí.
  const destinoCanonico = getCanonicalSlug(post.slug);
  const mainEntityUrl = destinoCanonico ? absUrl(`/blog/${destinoCanonico}`) : url;

  return {
    '@context': 'https://schema.org',
    '@type': data.schema ?? 'BlogPosting',
    '@id': `${url}#article`,
    headline: data.title,
    description: data.description,
    datePublished: data.pubDate.toISOString(),
    dateModified: (data.updatedDate ?? data.pubDate).toISOString(),
    inLanguage: SITE.lang,
    url: mainEntityUrl,
    mainEntityOfPage: { '@id': `${mainEntityUrl}#webpage` },
    isPartOf: { '@id': WEBSITE_ID },
    articleSection: data.category,
    ...(data.tags.length > 0 ? { keywords: data.tags.join(', ') } : {}),
    // Antes era una Organization suelta con name "tujubilacionanticipada.com",
    // que no referenciaba el @id de #organization ("Tu Jubilación Anticipada"):
    // dos entidades distintas para el mismo editor en la misma página.
    author: { '@id': ORG_ID },
    // Apunta a /transparencia-ia, donde se declara cómo se elabora el
    // contenido y qué parte interviene un sistema de IA.
    publishingPrinciples: absUrl(IA.href),
    // `reviewedBy` NO se emite aquí: schema.org lo define sobre WebPage, no
    // sobre Article, y era el origen del error de validación en 117 URLs. Va en
    // el nodo WebPage que devuelve articleWebPageSchema().
    publisher: { '@id': ORG_ID },
    image: imageObjectSchema(
      data.ogImage ?? resolveHeroImage(post.slug, data.heroImage) ?? SITE.defaultOgImage
    ),
  };
}

/** `image` como ImageObject con sus dimensiones reales cuando se pueden leer. */
export function imageObjectSchema(publicPath: string): JsonLd {
  const size = jpegSize(publicPath);
  return {
    '@type': 'ImageObject',
    url: absUrl(publicPath),
    ...(size ? { width: size.width, height: size.height } : {}),
  };
}

/**
 * Nodo WebPage del artículo, con el revisor y el Person al que apunta.
 *
 * Resuelve los dos errores que reportó la auditoría: `reviewedBy` colgaba de
 * `Article`, donde schema.org no lo define, y su `@id` apuntaba a un `Person`
 * que no existía en el grafo de la página, así que ningún parser podía
 * resolverlo. Ahora la propiedad va donde le corresponde y el Person se emite
 * completo junto a ella.
 */
export function articleWebPageSchema(post: CollectionEntry<'blog'>): JsonLd[] {
  const { data } = post;
  const destinoCanonico = getCanonicalSlug(post.slug);
  const url = absUrl(`/blog/${destinoCanonico ?? post.slug}`);

  // Solo se cambia el `@context` cuando hay algo que declarar: una página sin
  // contenido generado por IA mantiene el contexto simple de siempre.
  const origenIA = data.aiTextGenerated || data.aiImageGenerated;

  const webPage: JsonLd = {
    '@context': origenIA ? CONTEXT_CON_ORIGEN_DIGITAL : 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: data.seoTitle ?? data.title,
    description: data.description,
    inLanguage: SITE.lang,
    isPartOf: { '@id': WEBSITE_ID },
    datePublished: data.pubDate.toISOString(),
    dateModified: (data.updatedDate ?? data.pubDate).toISOString(),
    primaryImageOfPage: imageObjectSchema(
      data.ogImage ?? resolveHeroImage(post.slug, data.heroImage) ?? SITE.defaultOgImage
    ),
    ...(data.reviewedBy
      ? { reviewedBy: reviewerReferenceSchema(data.reviewedBy, data.reviewerTitle) }
      : {}),
    ...(origenIA ? { digitalSourceType: IPTC_TRAINED_ALGORITHMIC_MEDIA } : {}),
    publishingPrinciples: absUrl(IA.href),
  };

  // El Person completo al que apunta el @id de reviewedBy: sin él, la
  // referencia queda colgando y el revisor no se puede resolver como entidad.
  const person =
    data.reviewedBy && reviewerPersonId(data.reviewedBy)
      ? [
          {
            '@context': 'https://schema.org',
            ...reviewerPersonSchema(data.reviewedBy, data.reviewerTitle),
            worksFor: { '@id': ORG_ID },
          } as JsonLd,
        ]
      : [];

  return [webPage, ...person];
}

/** Listado del blog como colección con sus artículos. */
export function blogCollectionSchema(
  posts: CollectionEntry<'blog'>[],
  path = '/blog'
): JsonLd {
  const url = absUrl(path);
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${url}#blog`,
    url,
    name: `Blog · ${SITE.name}`,
    description:
      'Artículos sobre jubilación anticipada en España: requisitos, penalizaciones y cálculo de la pensión.',
    inLanguage: SITE.lang,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORG_ID },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.data.title,
      description: post.data.description,
      url: absUrl(`/blog/${post.slug}`),
      datePublished: post.data.pubDate.toISOString(),
      author: { '@type': 'Organization', name: post.data.author },
    })),
  };
}

/** Producto (la guía PDF). */
export function productSchema(opts: {
  name: string;
  description: string;
  price: number;
  path: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.name,
    description: opts.description,
    image: absUrl(SITE.defaultOgImage),
    brand: { '@id': ORG_ID },
    offers: {
      '@type': 'Offer',
      price: opts.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: absUrl(opts.path),
      seller: { '@id': ORG_ID },
    },
  };
}

/** Preguntas frecuentes. */
export function faqSchema(faqs: { q: string; a: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/**
 * Aplicación web (el simulador como herramienta gratuita).
 *
 * `requiresJs` controla si se declara `browserRequirements: 'Requiere
 * JavaScript'`. Por defecto es `true` porque hoy la página no ofrece ninguna
 * alternativa funcional sin JavaScript (la calculadora es una isla React sin
 * fallback estático); cuando exista contenido estático equivalente sin JS,
 * el llamador puede pasar `requiresJs: false` para que el schema deje de
 * contradecir al HTML.
 */
export function webApplicationSchema(opts: {
  name: string;
  description: string;
  path: string;
  requiresJs?: boolean;
}): JsonLd {
  const requiresJs = opts.requiresJs ?? true;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    description: opts.description,
    url: absUrl(opts.path),
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    ...(requiresJs ? { browserRequirements: 'Requiere JavaScript' } : {}),
    inLanguage: SITE.lang,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORG_ID },
    offers: {
      '@type': 'Offer',
      price: 0,
      priceCurrency: 'EUR',
    },
  };
}
