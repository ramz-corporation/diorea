const root = document.getElementById('cartRoot');
const titre = document.getElementById('cartTitle');

const ICONE_VIDE = '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m4 17 5-4 4 3 3-2 4 3"/></svg>';
const ICONE_POUBELLE = '<svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13M10 11v6M14 11v6"/></svg>';

/* Étape affichée : 'panier' → 'commande' → 'ok' */
let etape = 'panier';
let referenceCommande = '';

/* ---------- Sécurité : échappe le texte avant insertion ---------- */
function esc(texte) {
  const div = document.createElement('div');
  div.textContent = texte == null ? '' : String(texte);
  return div.innerHTML;
}

/* ---------- Lignes valides ----------
   Ignore (et nettoie) les lignes dont le produit n'existe plus
   ou n'est plus en achat direct. */
function lignesValides() {
  const brut = lirePanier();
  const valides = brut.filter(l => {
    const p = PRODUITS.find(x => x.id === l.id);
    return p && p.mode === 'direct';
  });
  if (valides.length !== brut.length) sauverPanier(valides);
  return valides;
}

function totalPanier(lignes) {
  return lignes.reduce((somme, l) => {
    const p = PRODUITS.find(x => x.id === l.id);
    return somme + p.prix * l.quantite;
  }, 0);
}

function nombreArticles(lignes) {
  return lignes.reduce((n, l) => n + l.quantite, 0);
}

/* ---------- Options choisies, en texte lisible ---------- */
function libelleOptions(o) {
  const parts = [];
  if (o.format)  parts.push(`Format : ${esc(o.format)}`);
  if (o.couleur) parts.push(`Couleur : ${esc(o.couleur)}`);
  if (o.texte)   parts.push(`Texte : « ${esc(o.texte)} »`);
  return parts;
}

/* =====================================================
   AFFICHAGE PRINCIPAL
   ===================================================== */
function afficher() {
  const lignes = lignesValides();
  majBadgePanier();

  if (etape === 'ok') { afficherConfirmation(); return; }

  if (lignes.length === 0) {
    titre.textContent = 'Mon panier';
    root.innerHTML = `
      <div class="empty">
        <p class="empty__title">Votre panier est vide</p>
        <p>Découvrez nos créations et ajoutez vos coups de cœur.</p>
        <a href="catalogue.html" class="btn btn--gradient">Découvrir le catalogue</a>
      </div>`;
    return;
  }

  titre.textContent = etape === 'commande' ? 'Ma commande' : 'Mon panier';

  root.innerHTML = `
    <div class="cart-layout">
      <div class="cart-main">
        ${etape === 'commande' ? blocFormulaireCommande() : blocLignes(lignes)}
      </div>
      ${blocRecap(lignes)}
    </div>`;

  if (etape === 'commande') initFormulaireCommande();
}

/* ---------- Liste des articles ---------- */
function blocLignes(lignes) {
  const items = lignes.map((l, i) => {
    const p = PRODUITS.find(x => x.id === l.id);
    const media = (p.images && p.images[0])
      ? `<img src="${esc(p.images[0])}" alt="${esc(p.nom)}" loading="lazy">`
      : `<span class="product-card__placeholder">${ICONE_VIDE}</span>`;
    const opts = libelleOptions(l.options || {})
      .map(t => `<li>${t}</li>`).join('');

    return `
      <article class="cart-item">
        <a class="cart-item__media" href="produit.html?id=${p.id}" aria-label="Voir ${esc(p.nom)}">${media}</a>

        <div class="cart-item__info">
          <span class="product-card__cat">${esc(CATEGORIES[p.categorie])}</span>
          <h2 class="cart-item__title"><a href="produit.html?id=${p.id}">${esc(p.nom)}</a></h2>
          ${opts ? `<ul class="cart-item__opts">${opts}</ul>` : ''}
          <span class="cart-item__unit">${formatPrix(p.prix)} l'unité</span>
        </div>

        <div class="cart-item__qty">
          <div class="qty qty--sm">
            <button type="button" data-action="minus" data-i="${i}" aria-label="Diminuer la quantité de ${esc(p.nom)}">−</button>
            <input type="number" value="${l.quantite}" min="1" max="999" inputmode="numeric" data-action="set" data-i="${i}" aria-label="Quantité de ${esc(p.nom)}">
            <button type="button" data-action="plus" data-i="${i}" aria-label="Augmenter la quantité de ${esc(p.nom)}">+</button>
          </div>
        </div>

        <div class="cart-item__total">${formatPrix(p.prix * l.quantite)}</div>

        <button type="button" class="cart-item__remove" data-action="remove" data-i="${i}" aria-label="Supprimer ${esc(p.nom)} du panier">
          ${ICONE_POUBELLE}
        </button>
      </article>`;
  }).join('');

  return `
    <div class="cart-items">${items}</div>
    <a href="catalogue.html" class="buy__link buy__link--left">← Continuer mes achats</a>`;
}

/* ---------- Récapitulatif ---------- */
function blocRecap(lignes) {
  const total = totalPanier(lignes);
  const n = nombreArticles(lignes);

  const detail = lignes.map(l => {
    const p = PRODUITS.find(x => x.id === l.id);
    return `<li><span>${esc(p.nom)} × ${l.quantite}</span><span>${formatPrix(p.prix * l.quantite)}</span></li>`;
  }).join('');

  const action = etape === 'commande'
    ? `<button type="submit" form="orderForm" class="btn btn--gradient btn--block">Confirmer la commande</button>
       <button type="button" class="buy__link buy__link--btn" data-action="retour">← Retour au panier</button>`
    : `<button type="button" class="btn btn--gradient btn--block" data-action="commander">Continuer vers la commande</button>`;

  return `
    <aside class="summary" aria-label="Récapitulatif">
      <h2 class="block-title">Récapitulatif</h2>
      <p class="summary__count">${n} article${n > 1 ? 's' : ''}</p>

      <ul class="summary__lines">${detail}</ul>

      <div class="summary__row">
        <span>Sous-total</span>
        <span>${formatPrix(total)}</span>
      </div>
      <div class="summary__row summary__row--muted">
        <span>Livraison</span>
        <span>À définir</span>
      </div>
      <div class="summary__row summary__row--total">
        <span>Total</span>
        <strong>${formatPrix(total)}</strong>
      </div>
      <p class="summary__note">Hors frais de livraison.</p>

      ${action}
    </aside>`;
}

/* =====================================================
   ÉTAPE « COMMANDE » (simulée)
   ===================================================== */
function blocFormulaireCommande() {
  return `
    <form class="order-form" id="orderForm" novalidate>
      <h2 class="block-title">Vos coordonnées</h2>
      <p class="quote__intro">Renseignez vos informations pour finaliser votre commande.</p>

      <div class="field">
        <label for="oNom">Nom complet <span class="req">*</span></label>
        <input type="text" id="oNom" autocomplete="name" required>
        <span class="field__error" id="errONom"></span>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="oTel">Téléphone <span class="req">*</span></label>
          <input type="tel" id="oTel" autocomplete="tel" inputmode="tel" required>
          <span class="field__error" id="errOTel"></span>
        </div>
        <div class="field">
          <label for="oMail">E-mail (facultatif)</label>
          <input type="email" id="oMail" autocomplete="email">
        </div>
      </div>

      <div class="field">
        <label for="oAdresse">Adresse ou lieu de livraison <span class="req">*</span></label>
        <input type="text" id="oAdresse" autocomplete="street-address" required>
        <span class="field__error" id="errOAdresse"></span>
      </div>

      <div class="field">
        <label for="oNote">Remarques (facultatif)</label>
        <textarea id="oNote" rows="3" placeholder="Une précision sur votre commande ?"></textarea>
      </div>

      <p class="order-form__note">
        Maquette : le paiement n'est pas actif et aucune commande réelle n'est transmise.
      </p>
    </form>`;
}

function initFormulaireCommande() {
  const form = document.getElementById('orderForm');

  const champs = [
    { input: 'oNom',     erreur: 'errONom',     message: 'Indiquez votre nom.' },
    { input: 'oTel',     erreur: 'errOTel',     message: 'Indiquez votre numéro de téléphone.' },
    { input: 'oAdresse', erreur: 'errOAdresse', message: 'Indiquez un lieu de livraison.' }
  ];

  champs.forEach(c => {
    document.getElementById(c.input).addEventListener('input', e => {
      e.target.classList.remove('is-invalid');
      document.getElementById(c.erreur).textContent = '';
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valide = true;
    let premier = null;

    champs.forEach(c => {
      const el = document.getElementById(c.input);
      const vide = !el.value.trim();
      document.getElementById(c.erreur).textContent = vide ? c.message : '';
      el.classList.toggle('is-invalid', vide);
      if (vide) { valide = false; premier = premier || el; }
    });

    if (!valide) { premier.focus(); return; }

    // TODO : envoyer à l'API (POST /api/commandes) avec les lignes du panier
    referenceCommande = 'SIM-' + Date.now().toString().slice(-6);
    sauverPanier([]);
    etape = 'ok';
    afficher();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Confirmation ---------- */
function afficherConfirmation() {
  titre.textContent = 'Merci !';
  root.innerHTML = `
    <div class="quote-done quote-done--wide">
      <span class="quote-done__icon">
        <svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
      </span>
      <h2 class="block-title">Commande enregistrée</h2>
      <p>Votre commande a bien été prise en compte dans cette maquette.</p>
      <p class="quote-done__note">Référence de démonstration : ${esc(referenceCommande)} · aucune donnée n'a été transmise.</p>
      <a href="catalogue.html" class="btn btn--ghost">Retour au catalogue</a>
    </div>`;
}

/* =====================================================
   ACTIONS (délégation d'événements)
   ===================================================== */
function modifierQuantite(i, nouvelle) {
  const lignes = lignesValides();
  if (!lignes[i]) return;
  lignes[i].quantite = Math.min(999, Math.max(1, nouvelle));
  sauverPanier(lignes);
  afficher();
}

root.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn || btn.tagName === 'INPUT') return;

  const action = btn.dataset.action;
  const i = Number(btn.dataset.i);
  const lignes = lignesValides();

  if (action === 'plus')  modifierQuantite(i, lignes[i].quantite + 1);
  if (action === 'minus') modifierQuantite(i, lignes[i].quantite - 1);

  if (action === 'remove') {
    lignes.splice(i, 1);
    sauverPanier(lignes);
    afficher();
  }

  if (action === 'commander') {
    etape = 'commande';
    afficher();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (action === 'retour') {
    etape = 'panier';
    afficher();
  }
});

// Saisie directe de la quantité
root.addEventListener('change', e => {
  if (e.target.dataset.action !== 'set') return;
  const n = parseInt(e.target.value, 10);
  modifierQuantite(Number(e.target.dataset.i), Number.isFinite(n) ? n : 1);
});

afficher();
