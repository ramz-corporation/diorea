const root = document.getElementById('productRoot');
const toast = document.getElementById('toast');

const ICONE_VIDE = '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m4 17 5-4 4 3 3-2 4 3"/></svg>';

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

/* ---------- Produit demandé : produit.html?id=4 ---------- */
const id = Number(new URLSearchParams(location.search).get('id'));
const produit = PRODUITS.find(p => p.id === id);

if (!produit) {
  root.innerHTML = `
    <div class="empty">
      <p class="empty__title">Produit introuvable</p>
      <p>Ce produit n'existe pas ou n'est plus disponible.</p>
      <a href="catalogue.html" class="btn btn--gradient">Retour au catalogue</a>
    </div>`;
} else {
  document.title = `${produit.nom} — DIOREA GROUP`;
  afficherProduit(produit);
}

/* =====================================================
   AFFICHAGE
   ===================================================== */
function afficherProduit(p) {
  const estDirect = p.mode === 'direct';

  root.innerHTML = `
    <nav class="breadcrumb" aria-label="Fil d'Ariane">
      <a href="index.html">Accueil</a><span>/</span>
      <a href="catalogue.html">Catalogue</a><span>/</span>
      <a href="catalogue.html?cat=${esc(p.categorie)}">${esc(CATEGORIES[p.categorie])}</a><span>/</span>
      <span aria-current="page">${esc(p.nom)}</span>
    </nav>

    <section class="product-page">
      ${blocGalerie(p)}
      <div class="product-info">
        <span class="product-card__cat">${esc(CATEGORIES[p.categorie])}</span>
        <h1 class="product-info__title">${esc(p.nom)}</h1>
        <span class="badge badge--inline ${estDirect ? '' : 'badge--devis'}">${estDirect ? 'Achat direct' : 'Sur devis'}</span>

        <p class="product-info__price" id="priceBox">
          ${estDirect ? formatPrix(p.prix) : '<span class="price--devis">Prix communiqué sur devis</span>'}
        </p>

        <p class="product-info__desc">${esc(p.details || p.description)}</p>

        ${blocCaracteristiques(p)}
        ${estDirect ? blocAchat(p) : blocDevis(p)}
      </div>
    </section>

    ${blocSimilaires(p)}
  `;

  initGalerie();
  if (estDirect) initAchat(p); else initDevis(p);
  majBadgePanier();
}

/* ---------- Galerie ---------- */
function blocGalerie(p) {
  const imgs = p.images || [];
  const principale = imgs.length
    ? `<img src="${esc(imgs[0])}" alt="${esc(p.nom)}" id="mainImage">`
    : `<span class="product-card__placeholder">${ICONE_VIDE}</span>`;

  const vignettes = imgs.length > 1
    ? `<div class="gallery__thumbs">` + imgs.map((src, i) => `
        <button class="thumb ${i === 0 ? 'is-active' : ''}" data-src="${esc(src)}" aria-label="Voir l'image ${i + 1}">
          <img src="${esc(src)}" alt="" loading="lazy">
        </button>`).join('') + `</div>`
    : '';

  return `
    <div class="gallery">
      <div class="gallery__main">${principale}</div>
      ${vignettes}
    </div>`;
}

function initGalerie() {
  const main = document.getElementById('mainImage');
  document.querySelectorAll('.thumb').forEach(t =>
    t.addEventListener('click', () => {
      main.src = t.dataset.src;
      document.querySelectorAll('.thumb').forEach(x => x.classList.remove('is-active'));
      t.classList.add('is-active');
    })
  );
}

/* ---------- Caractéristiques + délai ---------- */
function blocCaracteristiques(p) {
  const lignes = (p.caracteristiques || []).map(c =>
    `<div><dt>${esc(c.label)}</dt><dd>${esc(c.valeur)}</dd></div>`
  );
  if (p.delai) lignes.push(`<div><dt>Délai</dt><dd>${esc(p.delai)}</dd></div>`);
  if (!lignes.length) return '';
  return `<dl class="specs">${lignes.join('')}</dl>`;
}

/* =====================================================
   MODE « ACHAT DIRECT »
   ===================================================== */
function blocAchat(p) {
  const o = p.options || {};
  let champs = '';

  if (o.formats && o.formats.length) {
    champs += `
      <div class="field">
        <label for="optFormat">Format</label>
        <select id="optFormat" class="select select--full">
          ${o.formats.map(f => `<option>${esc(f)}</option>`).join('')}
        </select>
      </div>`;
  }
  if (o.couleurs && o.couleurs.length) {
    champs += `
      <div class="field">
        <label for="optCouleur">Couleur</label>
        <select id="optCouleur" class="select select--full">
          ${o.couleurs.map(c => `<option>${esc(c)}</option>`).join('')}
        </select>
      </div>`;
  }
  if (o.texte) {
    champs += `
      <div class="field">
        <label for="optTexte">${esc(o.texte)}</label>
        <input type="text" id="optTexte" maxlength="80" placeholder="Votre texte">
      </div>`;
  }

  return `
    <form class="buy" id="buyForm">
      ${champs ? `<h2 class="block-title">Personnalisation</h2>${champs}` : ''}

      <div class="field">
        <label for="qty">Quantité</label>
        <div class="qty">
          <button type="button" id="qtyMinus" aria-label="Diminuer la quantité">−</button>
          <input type="number" id="qty" value="1" min="1" max="999" inputmode="numeric">
          <button type="button" id="qtyPlus" aria-label="Augmenter la quantité">+</button>
        </div>
      </div>

      <div class="buy__total">
        <span>Total</span>
        <strong id="totalBox">${formatPrix(p.prix)}</strong>
      </div>

      <button type="submit" class="btn btn--gradient btn--block">Ajouter au panier</button>
      <a href="panier.html" class="buy__link">Voir mon panier</a>
    </form>`;
}

function initAchat(p) {
  const form = document.getElementById('buyForm');
  const qty = document.getElementById('qty');
  const total = document.getElementById('totalBox');

  const lireQty = () => {
    const n = parseInt(qty.value, 10);
    return Number.isFinite(n) && n >= 1 ? Math.min(n, 999) : 1;
  };
  const maj = () => { total.textContent = formatPrix(p.prix * lireQty()); };

  document.getElementById('qtyMinus').addEventListener('click', () => { qty.value = Math.max(1, lireQty() - 1); maj(); });
  document.getElementById('qtyPlus').addEventListener('click', () => { qty.value = Math.min(999, lireQty() + 1); maj(); });
  qty.addEventListener('input', maj);
  qty.addEventListener('blur', () => { qty.value = lireQty(); maj(); });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const options = {};
    const f = document.getElementById('optFormat');
    const c = document.getElementById('optCouleur');
    const t = document.getElementById('optTexte');
    if (f) options.format = f.value;
    if (c) options.couleur = c.value;
    if (t && t.value.trim()) options.texte = t.value.trim();

    ajouterAuPanier(p.id, lireQty(), options);
    notifier(`« ${p.nom} » ajouté au panier`);
  });
}

/* =====================================================
   MODE « SUR DEVIS »
   ===================================================== */
function blocDevis(p) {
  return `
    <div class="quote" id="quoteBox">
      <h2 class="block-title">Demander un devis</h2>
      <p class="quote__intro">Décrivez votre besoin, nous vous répondons avec une proposition adaptée.</p>

      <form id="quoteForm" novalidate>
        <div class="field">
          <label for="qNom">Nom <span class="req">*</span></label>
          <input type="text" id="qNom" autocomplete="name" required>
          <span class="field__error" id="errNom"></span>
        </div>

        <div class="field">
          <label for="qContact">Téléphone ou e-mail <span class="req">*</span></label>
          <input type="text" id="qContact" autocomplete="email" required>
          <span class="field__error" id="errContact"></span>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="qQte">Quantité souhaitée <span class="req">*</span></label>
            <input type="number" id="qQte" min="1" inputmode="numeric" required>
            <span class="field__error" id="errQte"></span>
          </div>
          <div class="field">
            <label for="qDim">Dimensions ou options</label>
            <input type="text" id="qDim" placeholder="Ex : taille, couleur…">
          </div>
        </div>

        <div class="field">
          <label for="qDesc">Description du besoin <span class="req">*</span></label>
          <textarea id="qDesc" rows="4" placeholder="Parlez-nous de votre projet" required></textarea>
          <span class="field__error" id="errDesc"></span>
        </div>

        <div class="field">
          <label for="qFile">Fichier de référence (facultatif)</label>
          <input type="file" id="qFile" class="file" accept="image/*,.pdf">
        </div>

        <button type="submit" class="btn btn--gradient btn--block">Envoyer ma demande</button>
      </form>
    </div>

    <div class="quote-done" id="quoteDone" hidden>
      <span class="quote-done__icon">
        <svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
      </span>
      <h2 class="block-title">Demande envoyée</h2>
      <p>Merci <strong id="doneNom"></strong>. Votre demande pour « ${esc(p.nom)} » a bien été enregistrée. Nous reviendrons vers vous avec une proposition.</p>
      <p class="quote-done__note">Envoi simulé (maquette) : aucune donnée n'est transmise pour le moment.</p>
      <a href="catalogue.html" class="btn btn--ghost">Retour au catalogue</a>
    </div>`;
}

function initDevis(p) {
  const form = document.getElementById('quoteForm');

  const champs = [
    { input: 'qNom',     erreur: 'errNom',     message: 'Indiquez votre nom.' },
    { input: 'qContact', erreur: 'errContact', message: 'Indiquez un téléphone ou un e-mail.' },
    { input: 'qQte',     erreur: 'errQte',     message: 'Indiquez une quantité.' },
    { input: 'qDesc',    erreur: 'errDesc',    message: 'Décrivez votre besoin.' }
  ];

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valide = true;
    let premierInvalide = null;

    champs.forEach(c => {
      const el = document.getElementById(c.input);
      const err = document.getElementById(c.erreur);
      const vide = !el.value.trim() || (c.input === 'qQte' && Number(el.value) < 1);
      err.textContent = vide ? c.message : '';
      el.classList.toggle('is-invalid', vide);
      if (vide) { valide = false; premierInvalide = premierInvalide || el; }
    });

    if (!valide) { premierInvalide.focus(); return; }

    // TODO : envoyer à l'API (POST /api/devis) avec FormData (fichier inclus)
    document.getElementById('doneNom').textContent = document.getElementById('qNom').value.trim();
    document.getElementById('quoteBox').hidden = true;
    document.getElementById('quoteDone').hidden = false;
    document.getElementById('quoteDone').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Efface l'erreur dès que l'utilisateur corrige
  champs.forEach(c => {
    document.getElementById(c.input).addEventListener('input', e => {
      e.target.classList.remove('is-invalid');
      document.getElementById(c.erreur).textContent = '';
    });
  });
}

/* =====================================================
   PRODUITS SIMILAIRES
   ===================================================== */
function blocSimilaires(p) {
  const autres = PRODUITS.filter(x => x.categorie === p.categorie && x.id !== p.id).slice(0, 3);
  if (!autres.length) return '';

  const cartes = autres.map(x => {
    const direct = x.mode === 'direct';
    const media = (x.images && x.images[0])
      ? `<img src="${esc(x.images[0])}" alt="${esc(x.nom)}" loading="lazy">`
      : `<span class="product-card__placeholder">${ICONE_VIDE}</span>`;
    return `
      <article class="product-card">
        <a class="product-card__media" href="produit.html?id=${x.id}" aria-label="Voir ${esc(x.nom)}">
          <span class="badge ${direct ? '' : 'badge--devis'}">${direct ? 'Achat direct' : 'Sur devis'}</span>
          ${media}
        </a>
        <div class="product-card__body">
          <span class="product-card__cat">${esc(CATEGORIES[x.categorie])}</span>
          <h3 class="product-card__title"><a href="produit.html?id=${x.id}">${esc(x.nom)}</a></h3>
          <div class="product-card__footer">
            ${direct ? `<span class="price">${formatPrix(x.prix)}</span>` : `<span class="price price--devis">Prix sur devis</span>`}
            <a class="btn btn--ghost btn--sm" href="produit.html?id=${x.id}">Voir</a>
          </div>
        </div>
      </article>`;
  }).join('');

  return `
    <section class="related">
      <h2 class="related__title">Vous aimerez aussi</h2>
      <div class="product-grid">${cartes}</div>
    </section>`;
}
