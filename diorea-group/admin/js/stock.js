const $ = id => document.getElementById(id);
let produits = chargerProduits();
const filtres = { q: '', cat: 'all', etat: 'all' };

const ETATS = { ok: 'Disponible', bas: 'Stock bas', rupture: 'Rupture' };
const CLASSE_ETAT = { ok: 'tag--ok', bas: 'tag--warn', rupture: 'tag--danger' };
const STOCK_MAX = 99999;

/* Référence générée à partir de l'identifiant (affichage seulement) */
const reference = p => 'DIO-' + String(p.id).padStart(4, '0');
const quantite = p => (Number.isFinite(p.stock) ? p.stock : 0);
const enVente = () => produits.filter(p => p.mode === 'direct');

function etatStock(p) {
  const s = quantite(p);
  if (s <= 0) return 'rupture';
  return s <= SEUIL_STOCK ? 'bas' : 'ok';
}
const tagEtat = p => `<span class="tag ${CLASSE_ETAT[etatStock(p)]}">${ETATS[etatStock(p)]}</span>`;

$('demoNote').innerHTML =
  `${ico('info')} <span>Données de démonstration : les stocks de départ sont fictifs. Vos modifications sont gardées dans ce navigateur uniquement. Seuil de stock bas actuel : ${SEUIL_STOCK} (réglable dans Paramètres).</span>`;

/* ---------- Filtre catégories ---------- */
$('fCat').innerHTML = '<option value="all">Toutes les catégories</option>' +
  Object.keys(CATEGORIES).map(k => `<option value="${esc(k)}">${esc(CATEGORIES[k])}</option>`).join('');

/* =====================================================
   CATÉGORIES
   ===================================================== */
function rendreCategories() {
  $('catGrid').innerHTML = Object.keys(CATEGORIES).map((cle, i) => {
    const liste = produits.filter(p => p.categorie === cle);
    const publies = liste.filter(p => p.statut === 'publie').length;
    const direct = liste.filter(p => p.mode === 'direct');
    const aSurveiller = direct.filter(p => etatStock(p) !== 'ok').length;

    return `
      <article class="cat-tile">
        <div class="cat-tile__top">
          <span class="cat-tile__num">0${i + 1}</span>
          <h3>${esc(CATEGORIES[cle])}</h3>
        </div>
        <ul class="cat-tile__stats">
          <li><strong>${liste.length}</strong> produit${liste.length > 1 ? 's' : ''} · ${publies} publié${publies > 1 ? 's' : ''}</li>
          <li>${direct.length} en achat direct · ${liste.length - direct.length} sur devis</li>
          ${aSurveiller ? `<li><span class="tag tag--warn">${aSurveiller} à surveiller</span></li>` : ''}
        </ul>
        <div class="cat-tile__links">
          <a href="produits.html?cat=${esc(cle)}">Voir les produits</a>
          <a href="../${esc(cle)}.html" target="_blank" rel="noopener">Page du site</a>
        </div>
      </article>`;
  }).join('');
}

/* =====================================================
   STOCK
   ===================================================== */
function rendreChips() {
  const v = enVente();
  const n = etat => v.filter(p => etatStock(p) === etat).length;
  const defs = [['all', 'Tous', v.length], ['ok', 'Disponibles', n('ok')], ['bas', 'Stock bas', n('bas')], ['rupture', 'Rupture', n('rupture')]];
  $('onglets').innerHTML = defs.map(([cle, label, nb]) =>
    `<button type="button" class="chip ${filtres.etat === cle ? 'is-active' : ''}" data-etat="${cle}">${label} <span>${nb}</span></button>`
  ).join('');
}

function ligne(p) {
  const img = (p.images && p.images[0]) ? `<img src="${esc(p.images[0])}" alt="">` : ico('image');
  const site = p.statut === 'publie'
    ? '<span class="tag tag--ok">Publié</span>'
    : '<span class="tag tag--muted">Brouillon</span>';

  return `
    <tr data-id="${p.id}">
      <td>
        <div class="prod-cell">
          <span class="thumb-sm">${img}</span>
          <div><strong>${esc(p.nom)}</strong><small>Réf. ${esc(reference(p))}</small></div>
        </div>
      </td>
      <td>${esc(CATEGORIES[p.categorie] || p.categorie)}</td>
      <td>
        <div class="stepper">
          <button type="button" data-step="-1" data-id="${p.id}" aria-label="Diminuer le stock de ${esc(p.nom)}">−</button>
          <input type="number" min="0" max="${STOCK_MAX}" step="1" inputmode="numeric" value="${quantite(p)}" data-stock="${p.id}" aria-label="Stock de ${esc(p.nom)}">
          <button type="button" data-step="1" data-id="${p.id}" aria-label="Augmenter le stock de ${esc(p.nom)}">+</button>
        </div>
      </td>
      <td class="etat">${tagEtat(p)}</td>
      <td>${site}</td>
    </tr>`;
}

function rendreTable() {
  const q = filtres.q.trim().toLowerCase();
  const liste = enVente().filter(p =>
    (filtres.cat === 'all' || p.categorie === filtres.cat) &&
    (filtres.etat === 'all' || etatStock(p) === filtres.etat) &&
    (!q || p.nom.toLowerCase().includes(q) || reference(p).toLowerCase().includes(q))
  );
  $('tbody').innerHTML = liste.map(ligne).join('');
  $('empty').hidden = liste.length > 0;
  $('count').textContent = `${liste.length} produit${liste.length > 1 ? 's' : ''}`;

  const nDevis = produits.filter(p => p.mode === 'devis').length;
  $('noteDevis').textContent = nDevis
    ? `${nDevis} produit${nDevis > 1 ? 's' : ''} sur devis : pas de stock à suivre.`
    : '';
}

/* Met à jour une seule ligne (elle reste affichée même si son état change) */
function majLigne(p) {
  const tr = $('tbody').querySelector(`tr[data-id="${p.id}"]`);
  if (!tr) return;
  tr.querySelector('input[data-stock]').value = quantite(p);
  tr.querySelector('.etat').innerHTML = tagEtat(p);
}

function enregistrerStock(id, valeur) {
  const p = produits.find(x => x.id === id);
  if (!p) return;

  const ancien = p.stock;
  p.stock = Math.min(STOCK_MAX, Math.max(0, Math.floor(valeur)));

  if (!sauverProduits(produits)) {
    p.stock = ancien;
    majLigne(p);
    notifier('Enregistrement impossible dans ce navigateur');
    return;
  }
  majLigne(p);
  rendreChips();
  rendreCategories();
  notifier('Stock mis à jour');
}

/* ---------- Événements ---------- */
$('onglets').addEventListener('click', e => {
  const b = e.target.closest('[data-etat]');
  if (!b) return;
  filtres.etat = b.dataset.etat;
  rendreChips();
  rendreTable();
});
$('q').addEventListener('input', e => { filtres.q = e.target.value; rendreTable(); });
$('fCat').addEventListener('change', e => { filtres.cat = e.target.value; rendreTable(); });

$('tbody').addEventListener('click', e => {
  const b = e.target.closest('[data-step]');
  if (!b) return;
  const p = produits.find(x => x.id === Number(b.dataset.id));
  if (p) enregistrerStock(p.id, quantite(p) + Number(b.dataset.step));
});

$('tbody').addEventListener('change', e => {
  const champ = e.target.closest('[data-stock]');
  if (!champ) return;
  const p = produits.find(x => x.id === Number(champ.dataset.stock));
  if (!p) return;
  const v = Number(champ.value);
  if (champ.value === '' || !Number.isFinite(v)) { majLigne(p); return; }   // saisie invalide : on rétablit
  enregistrerStock(p.id, v);
});

rendreCategories();
rendreChips();
rendreTable();