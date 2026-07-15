/**
 * Generación centralizada de datos estructurados (JSON-LD / Schema.org).
 *
 * Las entidades sitewide (Organization y WebSite) llevan un `@id` estable,
 * de modo que el resto de entidades (BlogPosting, Product, WebPage…) las
 * referencian por `@id` en lugar de duplicar la información. Esto crea un
 * grafo de conocimiento coherente para los motores de búsqueda.
 */
import type { CollectionEntry } from 'astro:content';
import { SITE, SOCIAL_PROFILES, REVIEWERS } from '../consts';
import { resolveHeroImage } from './posts';

type JsonLd = Record<string, unknown>;

/** Convierte una ruta relativa en URL absoluta sobre el dominio del sitio. */
export function absUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}

// `@id` estables de las entidades sitewide.
export const ORG_ID = `${SITE.url}/#organization`;
export const WEBSITE_ID = `${SITE.url}/#website`;

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
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';
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
  return {
    '@context': 'https://schema.org',
    '@type': data.schema ?? 'BlogPosting',
    '@id': `${url}#article`,
    headline: data.title,
    description: data.description,
    datePublished: data.pubDate.toISOString(),
    dateModified: (data.updatedDate ?? data.pubDate).toISOString(),
    inLanguage: SITE.lang,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@id': WEBSITE_ID },
    articleSection: data.category,
    ...(data.tags.length > 0 ? { keywords: data.tags.join(', ') } : {}),
    author: { '@type': 'Organization', name: data.author, url: SITE.url },
    // Señal EEAT: revisión editorial por una persona acreditada.
    ...(data.reviewedBy
      ? {
          reviewedBy: {
            '@type': 'Person',
            name: data.reviewedBy,
            ...(data.reviewerTitle ? { jobTitle: data.reviewerTitle } : {}),
            ...(REVIEWERS[data.reviewedBy]
              ? { image: absUrl(REVIEWERS[data.reviewedBy]) }
              : {}),
          },
        }
      : {}),
    publisher: { '@id': ORG_ID },
    image: absUrl(
      data.ogImage ?? resolveHeroImage(post.slug, data.heroImage) ?? SITE.defaultOgImage
    ),
  };
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

/** Aplicación web (el simulador como herramienta gratuita). */
export function webApplicationSchema(opts: {
  name: string;
  description: string;
  path: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    description: opts.description,
    url: absUrl(opts.path),
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requiere JavaScript',
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
