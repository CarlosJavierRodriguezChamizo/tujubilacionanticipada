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
 * Hash determinista simple (FNV-1a) de una cadena. Se usa únicamente para dar
 * a cada artículo un orden/punto de partida estable y repartido dentro del
 * índice de "lectura recomendada" (ver rehypeInlineBlocks), en vez de recorrer
 * siempre el array en el mismo orden alfabético de readdirSync.
 */
function hashString(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Precalcula, para el índice completo de artículos, un reparto determinista
 * de "lectura recomendada": cada artículo obtiene hasta 3 objetivos.
 *
 *  - 1 objetivo de su misma categoría (rotación cíclica dentro de la
 *    categoría, campo `category` añadido en seo-009): cada artículo de una
 *    categoría se recomienda desde exactamente 1 compañero de categoría.
 *  - 2 objetivos mediante una rotación de paso fijo sobre el índice completo
 *    ordenado por un hash del slug (no alfabéticamente): al ser dos
 *    desplazamientos fijos y distintos sobre un array de longitud N, cada
 *    artículo del índice recibe, de forma garantizada, exactamente 1
 *    recomendación por cada uno de esos dos desplazamientos.
 *
 * El resultado: en vez de que (case actual) el punto de partida sea siempre 0
 * sobre un array ordenado alfabéticamente —lo que concentraba casi todos los
 * enlaces en los 2 primeros artículos—, cada artículo recibe ~3 enlaces
 * entrantes repartidos por todo el índice.
 */
function buildRecoPlan(posts) {
  const N = posts.length;
  const plan = new Map(posts.map((p) => [p.slug, []]));
  if (N < 2) return plan;

  // Orden global determinista, no alfabético (por hash del slug).
  const allByHash = [...posts].sort(
    (a, b) => hashString(a.slug) - hashString(b.slug) || a.slug.localeCompare(b.slug)
  );
  const rankOf = new Map(allByHash.map((p, i) => [p.slug, i]));

  // Agrupación por categoría, en el mismo orden determinista.
  const byCategory = new Map();
  for (const p of allByHash) {
    const cat = p.category || '';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(p);
  }
  const catRankOf = new Map();
  for (const [, arr] of byCategory) {
    arr.forEach((p, i) => catRankOf.set(p.slug, i));
  }

  // Desplazamientos fijos (no dependen del artículo) para la rotación global.
  // Al ser constantes y no nulos, la función r -> (r + offset) % N es una
  // biyección sobre el índice completo para cada offset: da igual el punto de
  // partida de cada artículo, entre TODOS los artículos cada offset reparte
  // exactamente 1 recomendación entrante por artículo del índice.
  const step = Math.max(1, Math.floor(N / 3));
  const globalOffsets = [...new Set([step, step * 2])].filter((o) => o % N !== 0);

  for (const p of posts) {
    const targets = [];

    for (const off of globalOffsets) {
      const t = allByHash[(rankOf.get(p.slug) + off) % N];
      if (t && t.slug !== p.slug) targets.push(t);
    }

    // Recomendación de la misma categoría: va primero (prioridad de
    // categoría), rotación cíclica "siguiente artículo de la categoría".
    const catList = byCategory.get(p.category || '') || [];
    if (catList.length > 1) {
      const cr = catRankOf.get(p.slug) ?? 0;
      const catTarget = catList[(cr + 1) % catList.length];
      if (catTarget && catTarget.slug !== p.slug) targets.unshift(catTarget);
    }

    plan.set(p.slug, targets);
  }

  return plan;
}

/**
 * Intercala en el cuerpo del artículo: bloques de "lectura recomendada" (otros
 * artículos) y CTAs de "consulta con un asesor" (al menos 2). `posts` es el índice
 * de artículos (slug, title, description, category) que se pasa desde
 * astro.config.
 */
export function rehypeInlineBlocks(posts = []) {
  const recoPlan = buildRecoPlan(posts);

  // Devuelve un attacher (plugin) que a su vez devuelve el transformer, para que
  // unified lo registre correctamente cuando se pasa ya parametrizado.
  return () => (tree, file) => {
    const slug = currentSlug(file);
    const others = posts.filter((p) => p.slug !== slug);
    if (!others.length) return;

    const h2 = [];
    (tree.children || []).forEach((n, i) => {
      if (n.type === 'element' && n.tagName === 'h2') h2.push(i);
    });

    // 2 bloques de recomendación por defecto; 3 en artículos largos (>=5 H2).
    const wantReco = h2.length >= 5 ? 3 : 2;
    let recoTargets = (recoPlan.get(slug) || []).slice(0, wantReco);
    // Red de seguridad defensiva (índices muy pequeños o sin categoría).
    if (recoTargets.length < wantReco) {
      for (const cand of others) {
        if (recoTargets.length >= wantReco) break;
        if (!recoTargets.some((x) => x.slug === cand.slug)) recoTargets.push(cand);
      }
    }

    const plan = [
      { ord: 1, type: 'reco' },
      { ord: 2, type: 'advisor' },
      { ord: 3, type: 'reco' },
      { ord: 4, type: 'advisor' },
    ];

    const inserts = [];
    let recoIdx = 0;
    let advisorCount = 0;
    for (const p of plan) {
      const at = h2[p.ord];
      if (at === undefined) continue;
      if (p.type === 'advisor') {
        inserts.push({ at, node: advisorNode() });
        advisorCount++;
      } else if (recoTargets[recoIdx]) {
        inserts.push({ at, node: recoNode(recoTargets[recoIdx]) });
        recoIdx++;
      }
    }
    // Tercer bloque de "lectura recomendada" en artículos largos (>=5 H2): se
    // coloca antes de la 6ª cabecera H2 si existe (o, si no, antes de la
    // última H2 detectada) para no aparecer después del aviso legal ni de la
    // firma del revisor, que deben quedar siempre al final del artículo.
    if (wantReco >= 3 && recoTargets[recoIdx]) {
      const extraAt = h2.length > 5 ? h2[5] : h2[h2.length - 1];
      if (extraAt !== undefined) {
        inserts.push({ at: extraAt, node: recoNode(recoTargets[recoIdx]) });
        recoIdx++;
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
