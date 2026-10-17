const cle = document.body.dataset.cat;
const root = document.getElementById('catRoot');
const toast = document.getElementById('toast');

const ICONE_VIDE = '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m4 17 5-4 4 3 3-2 4 3"/></svg>';

/* =====================================================
   CONTENU ÉDITORIAL DES 4 CATÉGORIES
   Les prestations reprennent le cahier des charges.
   Aucun prix ni délai n'est affiché ici.
   ===================================================== */
const CONTENU = {
  impression: {
    numero: '01',
    nom: 'Impression',
    titre: 'Des supports imprimés <em>qui vous ressemblent.</em>',
    lead: 'Du petit format au grand format, nous donnons vie à vos idées sur papier, adhésif ou toile.',
    description: 'Impression de supports, étiquettes, supports promotionnels, toiles et tableaux personnalisés chez DIOREA GROUP.',
    icone: '<svg viewBox="0 0 24 24"><path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v6H7z"/></svg>',
    offresTitre: 'Ce que nous imprimons',
    offres: [
      { titre: 'Supports imprimés', texte: 'Cartes, flyers et documents à votre image.' },
      { titre: 'Étiquettes', texte: 'Pour vos produits, vos emballages et vos cadeaux.' },
      { titre: 'Supports promotionnels', texte: 'Des supports pour faire connaître votre activité.' },
      { titre: 'Toiles et tableaux', texte: 'Vos photos et visuels imprimés, prêts à être exposés.' }
    ]
  },

  personnalisation: {
    numero: '02',
    nom: 'Personnalisation',
    titre: 'Des créations uniques, <em>pensées selon vos envies.</em>',
    lead: 'Un nom, un message, un logo : donnez une identité à des objets du quotidien et à vos cadeaux.',
    description: 'Bouteilles, tote bags, packaging et objets personnalisés sur mesure chez DIOREA GROUP.',
    icone: '<svg viewBox="0 0 24 24"><path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z"/><path d="m14 7 3 3"/></svg>',
    offresTitre: 'Ce que nous personnalisons',
    offres: [
      { titre: 'Bouteilles', texte: 'Avec votre texte ou votre logo.' },
      { titre: 'Tote bags', texte: 'Un visuel de votre choix sur tissu.' },
      { titre: 'Packaging', texte: 'Emballages et coffrets à votre image.' },
      { titre: 'Sacs et pochettes', texte: 'Pour vos événements et mariages.' },
      { titre: 'Objets personnalisés', texte: 'Des idées uniques, adaptées à votre projet.' },
      { titre: 'Créations sur mesure', texte: 'Un besoin particulier ? Parlons-en.' }
    ],
    options: ['Texte', 'Visuel', 'Couleur', 'Format', 'Quantité'],
    optionsTitre: 'Ce que vous pouvez choisir',
    optionsNote: 'Selon les produits, certaines de ces options sont proposées. Elles sont précisées sur chaque fiche.'
  },

  accessoires: {
    numero: '03',
    nom: 'Accessoires',
    titre: 'Des pièces et des objets <em>qui affirment votre style.</em>',
    lead: 'Une sélection d\'accessoires sobres et raffinés, pour compléter vos tenues ou pour offrir.',
    description: 'Montres, bijoux, boutons de manchette et accessoires élégants chez DIOREA GROUP.',
    icone: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
    offresTitre: 'Notre sélection',
    offres: [
      { titre: 'Montres', texte: 'Un style sobre et élégant au poignet.' },
      { titre: 'Bijoux', texte: 'Des pièces raffinées pour sublimer vos tenues.' },
      { titre: 'Boutons de manchette', texte: 'Le détail qui change une chemise.' },
      { titre: 'Autres accessoires', texte: 'D\'autres pièces à découvrir au fil des arrivages.' }
    ]
  },

  branding: {
    numero: '04',
    nom: 'Branding & événementiel',
    titre: 'Des solutions pour <em>votre marque et vos événements.</em>',
    lead: 'Entreprises, mariages, célébrations : nous concevons les supports qui marquent les esprits.',
    description: 'Identité de marque, objets promotionnels, packaging professionnel et personnalisation pour événements chez DIOREA GROUP.',
    icone: '<svg viewBox="0 0 24 24"><path d="M3.5 12.5V5h7.5l9 9-7.5 7.5-9-9Z"/><circle cx="8" cy="9.5" r="1.2"/></svg>',
    offresTitre: 'Nos prestations',
    offres: [
      { titre: 'Identité et supports de marque', texte: 'Logo, couleurs et supports cohérents.' },
      { titre: 'Objets promotionnels', texte: 'Des objets à l\'image de votre entreprise.' },
      { titre: 'Packaging professionnel', texte: 'Des emballages qui valorisent vos produits.' },
      { titre: 'Supports imprimés', texte: 'Cartes, étiquettes et documents de marque.' },
      { titre: 'Mariages et événements', texte: 'Pochettes, sacs et détails pour vos invités.' },
      { titre: 'Cadeaux personnalisés', texte: 'Des attentions uniques pour vos proches ou vos clients.' }
    ]
  }
};

/* ---------- Sécurité : échappe le texte avant insertion ---------- */
function esc(texte) {
  const div = document.createElement('div');
  div.textContent = texte == null ? '' : String(texte);
  return div.innerHTML;
}

/* ---------- Notification ---------- */
let timerToast;
function notifier(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(timerToast);
  timerToast = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

/* ---------- Carte produit (même rendu que le catalogue) ---------- */
function carteProduit(p) {
  const direct = p.mode === 'direct';
  const premiere = p.images && p.images[0];
  const media = premiere
    ? `<img src="${esc(premiere)}" alt="${esc(p.nom)}" loading="lazy">`
    : `<span class="product-card__placeholder">${ICONE_VIDE}</span>`;

  const prix = direct
    ? `<span class="price">${formatPrix(p.prix)}</span>`
    : `<span class="price price--devis">Prix sur devis</span>`;

  const bouton = direct
    ? `<button class="btn btn--gradient btn--sm" data-add="${p.id}">Ajouter au panier</button>`
    : `<a class="btn btn--ghost btn--sm" href="devis.html?produit=${p.id}">Demander un devis</a>`;

  return `
    <article class="product-card">
      <a class="product-card__media" href="produit.html?id=${p.id}" aria-label="Voir ${esc(p.nom)}">
        <span class="badge ${direct ? '' : 'badge--devis'}">${direct ? 'Achat direct' : 'Sur devis'}</span>
        ${media}
      </a>
      <div class="product-card__body">
        <span class="product-card__cat">${esc(CATEGORIES[p.categorie])}</span>
        <h3 class="product-card__title"><a href="produit.html?id=${p.id}">${esc(p.nom)}</a></h3>
        <p class="product-card__desc">${esc(p.description)}</p>
        <div class="product-card__footer">${prix}${bouton}</div>
      </div>
    </article>`;
}

/* =====================================================
   CONSTRUCTION DE LA PAGE
   ===================================================== */
const c = CONTENU[cle];

if (!c) {
  root.innerHTML = `
    <div class="empty">
      <p class="empty__title">Catégorie introuvable</p>
      <a href="catalogue.html" class="btn btn--gradient">Voir le catalogue</a>
    </div>`;
} else {
  /* Titre, description et lien actif du menu */
  document.title = `${c.nom} — DIOREA GROUP`;
  document.querySelector('meta[name="description"]').setAttribute('content', c.description);
  document.querySelectorAll('.nav__link').forEach(a =>
    a.classList.toggle('is-active', a.getAttribute('href') === `${cle}.html`)
  );

  const produits = PRODUITS.filter(p => p.categorie === cle);

  /* Bloc options (page Personnalisation uniquement) */
  const blocOptions = c.options ? `
    <section class="cat-options">
      <h2 class="section-head__title">${esc(c.optionsTitre)}</h2>
      <ul class="cat-options__list">
        ${c.options.map(o => `<li>${esc(o)}</li>`).join('')}
      </ul>
      <p class="cat-options__note">${esc(c.optionsNote)}</p>
    </section>` : '';

  /* Autres catégories */
  const autres = Object.keys(CONTENU).filter(k => k !== cle).map(k =>
    `<a class="chip" href="${k}.html">${esc(CONTENU[k].nom)}</a>`
  ).join('');

  /* Produits ou état vide */
  const blocProduits = produits.length ? `
    <div class="product-grid" id="productGrid">${produits.map(carteProduit).join('')}</div>` : `
    <div class="empty empty--inline">
      <p class="empty__title">Bientôt de nouveaux produits</p>
      <p>Cette sélection s'enrichit. En attendant, décrivez-nous votre besoin.</p>
      <a href="devis.html" class="btn btn--gradient">Demander un devis</a>
    </div>`;

  root.innerHTML = `
    <!-- HÉRO ÉDITORIAL -->
    <section class="cat-hero">
      <div class="cat-hero__text">
        <p class="eyebrow">${esc(c.nom.toUpperCase())}</p>
        <h1 class="page-intro__title">${c.titre}</h1>
        <p class="cat-hero__lead">${esc(c.lead)}</p>
        <div class="hero__cta">
          <a href="#produits" class="btn btn--gradient">Voir les produits</a>
          <a href="devis.html" class="btn btn--ghost">Demander un devis</a>
        </div>
      </div>
      <div class="cat-hero__visual" aria-hidden="true">
        <span class="cat-hero__num">${esc(c.numero)}</span>
        <span class="cat-hero__icon">${c.icone}</span>
      </div>
    </section>

    <!-- PRESTATIONS -->
    <section class="cat-offers">
      <h2 class="section-head__title">${esc(c.offresTitre)}</h2>
      <div class="offer-grid">
        ${c.offres.map(o => `
          <div class="offer-item">
            <h3>${esc(o.titre)}</h3>
            <p>${esc(o.texte)}</p>
          </div>`).join('')}
      </div>
    </section>

    ${blocOptions}

    <!-- PRODUITS -->
    <section class="cat-products" id="produits">
      <div class="section-head">
        <h2 class="section-head__title">Nos créations</h2>
        <a href="catalogue.html?cat=${esc(cle)}" class="section-head__link">Voir dans le catalogue →</a>
      </div>
      ${blocProduits}
    </section>

    <!-- AUTRES CATÉGORIES -->
    <section class="cat-switch">
      <p>Explorer aussi</p>
      <div class="cat-switch__list">${autres}</div>
    </section>

    <!-- CONTACT -->
    <section>
      <div class="contact-block">
        <h2>Un projet particulier ? Créons-le ensemble.</h2>
        <p>Décrivez votre besoin et obtenez une proposition adaptée à votre projet.</p>
        <a href="devis.html" class="btn btn--gradient">Demander un devis</a>
      </div>
    </section>
  `;

  /* Ajout au panier (achat direct) */
  const grille = document.getElementById('productGrid');
  if (grille) {
    grille.addEventListener('click', e => {
      const btn = e.target.closest('[data-add]');
      if (!btn) return;
      const p = PRODUITS.find(x => x.id === Number(btn.dataset.add));
      ajouterAuPanier(p.id);
      notifier(`« ${p.nom} » ajouté au panier`);
    });
  }
}
