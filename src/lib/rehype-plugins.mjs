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
    const others = posts.filter((p) => p.slug !== slug);

    const h2 = [];
    (tree.children || []).forEach((n, i) => {
      if (n.type === 'element' && n.tagName === 'h2') h2.push(i);
    });

    const plan = [
      { ord: 1, type: 'reco' },
      { ord: 2, type: 'advisor' },
      { ord: 3, type: 'reco' },
      { ord: 4, type: 'advisor' },
    ];

    const inserts = [];
    let recoPick = 0;
    let advisorCount = 0;
    for (const p of plan) {
      const at = h2[p.ord];
      if (at === undefined) continue;
      if (p.type === 'advisor') {
        inserts.push({ at, node: advisorNode() });
        advisorCount++;
      } else if (others.length) {
        inserts.push({ at, node: recoNode(others[recoPick % others.length]) });
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
