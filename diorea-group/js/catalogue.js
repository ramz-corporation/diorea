const grid = document.getElementById('productGrid');
const empty = document.getElementById('empty');
const info = document.getElementById('resultsInfo');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const modeSelect = document.getElementById('mode');
const filtersBox = document.getElementById('filters');
const toast = document.getElementById('toast');

// État des filtres
const etat = { cat: 'all', recherche: '', mode: 'all', tri: 'default' };

// Icône générique quand il n'y a pas de photo
const ICONE_VIDE = '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m4 17 5-4 4 3 3-2 4 3"/></svg>';

/* ---------- Sécurité : échappe le texte avant insertion ---------- */
function esc(texte) {
  const div = document.createElement('div');
  div.textContent = texte;
  return div.innerHTML;
}

/* ---------- Construction d'une carte produit ---------- */
function carteProduit(p) {
  const estDirect = p.mode === 'direct';

  const media = p.image
    ? `<img src="${esc(p.image)}" alt="${esc(p.nom)}" loading="lazy">`
    : `<span class="product-card__placeholder">${ICONE_VIDE}</span>`;

  const prix = estDirect
    ? `<span class="price">${formatPrix(p.prix)}</span>`
    : `<span class="price price--devis">Prix sur devis</span>`;

  const bouton = estDirect
    ? `<button class="btn btn--gradient btn--sm" data-add="${p.id}">Ajouter au panier</button>`
    : `<a class="btn btn--ghost btn--sm" href="devis.html?produit=${p.id}">Demander un devis</a>`;

  return `
    <article class="product-card">
      <a class="product-card__media" href="produit.html?id=${p.id}" aria-label="Voir ${esc(p.nom)}">
        <span class="badge ${estDirect ? '' : 'badge--devis'}">${estDirect ? 'Achat direct' : 'Sur devis'}</span>
        ${media}
      </a>
      <div class="product-card__body">
        <span class="product-card__cat">${esc(CATEGORIES[p.categorie])}</span>
        <h3 class="product-card__title"><a href="produit.html?id=${p.id}">${esc(p.nom)}</a></h3>
        <p class="product-card__desc">${esc(p.description)}</p>
        <div class="product-card__footer">
          ${prix}
          ${bouton}
        </div>
      </div>
    </article>`;
}

/* ---------- Filtrage + tri ---------- */
function produitsFiltres() {
  const q = etat.recherche.trim().toLowerCase();

  let liste = PRODUITS.filter(p => {
    const okCat = etat.cat === 'all' || p.categorie === etat.cat;
    const okMode = etat.mode === 'all' || p.mode === etat.mode;
    const okRecherche = !q ||
      p.nom.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      CATEGORIES[p.categorie].toLowerCase().includes(q);
    return okCat && okMode && okRecherche;
  });

  if (etat.tri === 'nom') {
    liste.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  } else if (etat.tri === 'prix-asc' || etat.tri === 'prix-desc') {
    // Les produits sur devis (sans prix) passent toujours en dernier
    const valeur = p => (p.prix == null ? Infinity : p.prix);
    liste.sort((a, b) => {
      if (a.prix == null && b.prix == null) return 0;
      if (a.prix == null) return 1;
      if (b.prix == null) return -1;
      return etat.tri === 'prix-asc' ? valeur(a) - valeur(b) : valeur(b) - valeur(a);
    });
  }
  return liste;
}

/* ---------- Affichage ---------- */
function afficher() {
  const liste = produitsFiltres();
  grid.innerHTML = liste.map(carteProduit).join('');
  empty.hidden = liste.length > 0;
  info.textContent = liste.length === 0
    ? ''
    : `${liste.length} produit${liste.length > 1 ? 's' : ''}`;
}

/* ---------- Notification ---------- */
let timerToast;
function notifier(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(timerToast);
  timerToast = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

/* ---------- Événements ---------- */
filtersBox.addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  filtersBox.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
  chip.classList.add('is-active');
  etat.cat = chip.dataset.cat;
  afficher();
});

searchInput.addEventListener('input', () => { etat.recherche = searchInput.value; afficher(); });
sortSelect.addEventListener('change', () => { etat.tri = sortSelect.value; afficher(); });
modeSelect.addEventListener('change', () => { etat.mode = modeSelect.value; afficher(); });

// Ajout au panier (délégation d'événements sur la grille)
grid.addEventListener('click', e => {
  const btn = e.target.closest('[data-add]');
  if (!btn) return;
  const produit = PRODUITS.find(p => p.id === Number(btn.dataset.add));
  ajouterAuPanier(produit.id);
  notifier(`« ${produit.nom} » ajouté au panier`);
});

// Réinitialisation
document.getElementById('resetBtn').addEventListener('click', () => {
  etat.cat = 'all'; etat.recherche = ''; etat.mode = 'all'; etat.tri = 'default';
  searchInput.value = ''; sortSelect.value = 'default'; modeSelect.value = 'all';
  filtersBox.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c.dataset.cat === 'all'));
  afficher();
});

/* ---------- Catégorie pré-sélectionnée via l'URL : catalogue.html?cat=accessoires ---------- */
const catUrl = new URLSearchParams(location.search).get('cat');
if (catUrl && CATEGORIES[catUrl]) {
  etat.cat = catUrl;
  filtersBox.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c.dataset.cat === catUrl));
}

afficher();
