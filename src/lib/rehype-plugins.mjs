/**
 * Plugins rehype propios para el contenido del blog.
 *
 * 1) rehypeTocBeforeH2 — inserta una tabla de contenidos (TOC) justo antes de
 *    la primera cabecera H2, generada a partir de los H2/H3 del artículo.
 *    Se aplica a todos los artículos automáticamente (actuales y nuevos).
 *
 * 2) rehypeExternalLinks — a todos los enlaces externos les añade
 *    target="_blank" y rel="noopener noreferrer" (+ nofollow, salvo fuentes
 *    oficiales autorizadas, que se dejan dofollow como cita de autoridad).
 *
 * Requiere que las cabeceras ya tengan `id` (lo garantiza rehype-slug, que se
 * ejecuta antes en la cadena de plugins).
 */

// Dominios oficiales que se dejan dofollow (citas de autoridad / EEAT).
const DOFOLLOW_HOSTS = [
  'seg-social.es',
  'boe.es',
  'inclusion.gob.es',
  'mites.gob.es',
  'sepe.es',
  'cnmv.es',
];

function getText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  if (node.children) return node.children.map(getText).join('');
  return '';
}

function el(tagName, properties, children = []) {
  return { type: 'element', tagName, properties, children };
}
function text(value) {
  return { type: 'text', value };
}

/** TOC antes del primer H2. */
export function rehypeTocBeforeH2() {
  return (tree) => {
    const children = tree.children || [];
    const firstH2 = children.findIndex(
      (n) => n.type === 'element' && n.tagName === 'h2'
    );
    if (firstH2 === -1) return;

    const items = [];
    for (const node of children) {
      if (
        node.type === 'element' &&
        (node.tagName === 'h2' || node.tagName === 'h3') &&
        node.properties &&
        node.properties.id
      ) {
        const label = getText(node).trim();
        if (label) {
          items.push({ id: String(node.properties.id), label, level: node.tagName });
        }
      }
    }
    if (items.length < 2) return; // TOC solo si hay contenido suficiente

    const listItems = items.map((it) =>
      el('li', { className: [`toc-item`, `toc-${it.level}`] }, [
        el('a', { href: `#${it.id}` }, [text(it.label)]),
      ])
    );

    const toc = el(
      'nav',
      { className: ['article-toc'], 'aria-label': 'Tabla de contenidos' },
      [
        el('p', { className: ['article-toc__title'] }, [text('En este artículo')]),
        el('ol', { className: ['article-toc__list'] }, listItems),
      ]
    );

    tree.children.splice(firstH2, 0, toc);
  };
}

function currentSlug(file) {
  const p = (file && (file.path || (file.history && file.history[0]))) || '';
  const m = String(p).replace(/\\/g, '/').match(/([^/]+)\.mdx?$/i);
  return m ? m[1] : '';
}

/**
 * Hash determinista (djb2) de una cadena → entero sin signo. Se usa para
 * elegir un punto de partida por artículo en la selección de "lectura
 * recomendada", de modo que el resultado sea reproducible en cada build
 * (mismo slug → mismo hash) sin depender de Math.random ni Date.now.
 */
export function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash * 33) ^ str.charCodeAt(i)) >>> 0;
  }
  return hash >>> 0;
}

/**
 * Rota `list` (array de objetos con `.slug`) para que empiece en un punto
 * determinista derivado de `seedSlug` (hash del slug módulo la longitud de
 * la lista). Se exporta para que otros puntos de enlazado interno
 * automático puedan repartir sus selecciones con el mismo criterio
 * determinista, en vez de usar siempre el mismo orden fijo.
 */
export function rotateByHash(list, seedSlug) {
  if (!list.length) return list;
  const start = hashString(seedSlug) % list.length;
  return list.map((_, i) => list[(start + i) % list.length]);
}

/**
 * Elige hasta `count` objetivos distintos de `pool` para el artículo
 * `sourceSlug`, con una garantía de reparto homogéneo: `pool` DEBE incluir
 * al propio artículo de origen. Se ordena todo `pool` por hash(slug) del
 * candidato (empate por slug para que el orden sea 100% determinista) y
 * cada artículo apunta a los `count` siguientes en ese orden circular.
 *
 * Como el orden por hash es una permutación (biyección) de `pool`, cada
 * artículo del pool recibe exactamente `count` enlaces entrantes desde sus
 * `count` "vecinos" anteriores en el círculo — a diferencia de tomar
 * directamente `hash(slug) % length` como punto de partida, que con pools
 * pequeños (10-20 elementos) puede colisionar y dejar algunos artículos sin
 * ningún enlace entrante por pura casualidad estadística del hash.
 *
 * `salt` permite obtener un orden circular distinto para dos componentes
 * distintos que comparten el mismo `pool` y el mismo `sourceSlug` (p. ej.
 * los bloques "Lectura recomendada" intercalados y el bloque "Artículos
 * relacionados" al final del artículo), para que no siempre señalen
 * exactamente a los mismos 3 artículos dentro de una misma página.
 */
export function pickBalancedTargets(pool, sourceSlug, count, salt = '') {
  const K = pool.length;
  if (K <= 1 || count <= 0) return [];
  const order = [...pool]
    .map((m) => ({ m, h: hashString(m.slug + salt) }))
    .sort((a, b) => a.h - b.h || a.m.slug.localeCompare(b.m.slug))
    .map((x) => x.m);
  const rank = order.findIndex((m) => m.slug === sourceSlug);
  if (rank === -1) return [];
  const n = Math.min(count, K - 1);
  const picks = [];
  for (let i = 1; i <= n; i++) {
    picks.push(order[(rank + i) % K]);
  }
  return picks;
}

/**
 * Calcula, para un artículo dado, sus artículos recomendados.
 *
 * - Prioriza primero los artículos de la misma `category` (campo añadido en
 *   seo-009): se reparten con `pickBalancedTargets`, que garantiza un punto
 *   de partida determinista por artículo (derivado de un hash del slug, no
 *   siempre el mismo índice) y un reparto homogéneo de enlaces entrantes
 *   dentro de la categoría.
 * - Si la categoría no tiene candidatos suficientes, completa con el resto
 *   del índice usando el mismo criterio de rotación determinista.
 */
function pickRecommendations(slug, category, posts, count) {
  const categoryMembers = category ? posts.filter((p) => p.category === category) : [];
  const picks = pickBalancedTargets(categoryMembers, slug, count, 'reco');

  if (picks.length < count) {
    const seen = new Set(picks.map((p) => p.slug));
    seen.add(slug);
    const rest = posts.filter((p) => !seen.has(p.slug));
    const extra = rotateByHash(rest, slug + 'reco').slice(0, count - picks.length);
    picks.push(...extra);
  }
  return picks;
}

function advisorNode() {
  return el('aside', { className: ['inline-cta'] }, [
    el('p', { className: ['inline-cta__text'] }, [
      text('¿Prefieres que un experto revise tu caso concreto? Te ayudamos a decidir con datos.'),
    ]),
    el(
      'a',
      {
        href: '/asesoramiento',
        className: ['inline-cta__link'],
        'data-ga-event': 'cta_asesoramiento',
        'data-ga-location': 'article_inline',
      },
      [text('Consulta con nuestro equipo profesional →')]
    ),
  ]);
}

function recoNode(post) {
  const kids = [
    el('p', { className: ['inline-reco__label'] }, [text('Lectura recomendada')]),
    el('a', { href: `/blog/${post.slug}`, className: ['inline-reco__link'] }, [
      text(post.title),
    ]),
  ];
  if (post.description) {
    kids.push(el('p', { className: ['inline-reco__desc'] }, [text(post.description)]));
  }
  return el('aside', { className: ['inline-reco'] }, kids);
}

/**
 * Intercala en el cuerpo del artículo: bloques de "lectura recomendada" (otros
 * artículos) y CTAs de "consulta con un asesor" (al menos 2). `posts` es el índice
 * de artículos (slug, title, description) que se pasa desde astro.config.
 */
export function rehypeInlineBlocks(posts = []) {
  // Devuelve un attacher (plugin) que a su vez devuelve el transformer, para que
  // unified lo registre correctamente cuando se pasa ya parametrizado.
  return () => (tree, file) => {
    const slug = currentSlug(file);
    const current = posts.find((p) => p.slug === slug);

    const h2 = [];
    (tree.children || []).forEach((n, i) => {
      if (n.type === 'element' && n.tagName === 'h2') h2.push(i);
    });

    // Con ≥5 H2 hay espacio suficiente para un tercer bloque de "lectura
    // recomendada" sin saturar el artículo.
    const recoBlocks = h2.length >= 5 ? 3 : 2;
    const types =
      recoBlocks === 3
        ? ['reco', 'advisor', 'reco', 'advisor', 'reco']
        : ['reco', 'advisor', 'reco', 'advisor'];
    // Posiciones proporcionales al nº de H2 (en vez de índices fijos), para
    // que los `ord` sean siempre índices válidos de `h2` incluso en el caso
    // límite de exactamente 5 H2 (donde un índice fijo como 5 no existiría).
    let lastOrd = -1;
    const plan = types.map((type, i) => {
      let ord = Math.floor(((i + 1) * h2.length) / (types.length + 1));
      if (ord <= lastOrd) ord = lastOrd + 1;
      ord = Math.min(ord, h2.length - 1);
      lastOrd = ord;
      return { ord, type };
    });

    const recoPicks = pickRecommendations(
      slug,
      current ? current.category : '',
      posts,
      recoBlocks
    );

    const inserts = [];
    let recoPick = 0;
    let advisorCount = 0;
    for (const p of plan) {
      const at = h2[p.ord];
      if (at === undefined) continue;
      if (p.type === 'advisor') {
        inserts.push({ at, node: advisorNode() });
        advisorCount++;
      } else if (recoPicks.length) {
        inserts.push({ at, node: recoNode(recoPicks[recoPick % recoPicks.length]) });
        recoPick++;
      }
    }
    // Garantiza al menos 2 CTAs de asesor aunque haya pocas cabeceras.
    while (advisorCount < 2) {
      inserts.push({ at: tree.children.length, node: advisorNode() });
      advisorCount++;
    }

    // Aplica de mayor a menor índice para no descuadrar posiciones.
    inserts
      .sort((a, b) => b.at - a.at)
      .forEach((ins) => tree.children.splice(ins.at, 0, ins.node));
  };
}

/** Enlaces externos: nueva pestaña + rel de seguridad/SEO. */
export function rehypeExternalLinks() {
  const visit = (node) => {
    if (!node || !node.children) return;
    for (const child of node.children) {
      if (
        child.type === 'element' &&
        child.tagName === 'a' &&
        child.properties &&
        typeof child.properties.href === 'string' &&
        /^https?:\/\//i.test(child.properties.href)
      ) {
        let host = '';
        try {
          host = new URL(child.properties.href).hostname.replace(/^www\./, '');
        } catch {
          host = '';
        }
        const isOfficial = DOFOLLOW_HOSTS.some(
          (d) => host === d || host.endsWith('.' + d)
        );
        const rel = ['noopener', 'noreferrer'];
        if (!isOfficial) rel.unshift('nofollow');

        child.properties.target = '_blank';
        child.properties.rel = rel;
      }
      visit(child);
    }
  };
  return (tree) => visit(tree);
}
