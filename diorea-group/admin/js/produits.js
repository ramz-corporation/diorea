let produits = chargerProduits();
const filtres = { q: '', cat: 'all', statut: 'all' };

const tbody = document.getElementById('tbody');
const vide = document.getElementById('empty');
const compteur = document.getElementById('count');
const fCat = document.getElementById('fCat');

/* Filtre catégories */
fCat.innerHTML = '<option value="all">Toutes les catégories</option>' +
  Object.keys(CATEGORIES).map(k => `<option value="${esc(k)}">${esc(CATEGORIES[k])}</option>`).join('');

  /* Catégorie pré-sélectionnée via l'URL : produits.html?cat=accessoires */
const catUrl = new URLSearchParams(location.search).get('cat');
if (catUrl && CATEGORIES[catUrl]) { filtres.cat = catUrl; fCat.value = catUrl; }
function ligne(p) {
  const img = (p.images && p.images[0]) ? `<img src="${esc(p.images[0])}" alt="">` : ico('image');
  const prix = p.mode === 'direct' ? esc(formatPrix(p.prix)) : '<span class="muted">Sur devis</span>';
  const statut = p.statut === 'publie'
    ? '<span class="tag tag--ok">Publié</span>'
    : '<span class="tag tag--muted">Brouillon</span>';
  const sous = (p.mode === 'direct' ? 'Achat direct' : 'Sur devis') + (p.perso && p.perso.actif ? ' · Personnalisable' : '');

  return `
    <tr>
      <td>
        <div class="prod-cell">
          <span class="thumb-sm">${img}</span>
          <div><strong>${esc(p.nom)}</strong><small>${esc(sous)}</small></div>
        </div>
      </td>
      <td>${esc(CATEGORIES[p.categorie] || p.categorie)}</td>
      <td>${prix}</td>
      <td>${stockTag(p)}</td>
      <td>${statut}</td>
      <td class="actions">
        <a class="icon-btn icon-btn--sm" href="produit-form.html?id=${p.id}" aria-label="Modifier ${esc(p.nom)}">${ico('edit')}</a>
        <button class="icon-btn icon-btn--sm" data-del="${p.id}" aria-label="Supprimer ${esc(p.nom)}">${ico('corbeille')}</button>
      </td>
    </tr>`;
}

function rendre() {
  const q = filtres.q.trim().toLowerCase();
  const liste = produits.filter(p =>
    (filtres.cat === 'all' || p.categorie === filtres.cat) &&
    (filtres.statut === 'all' || p.statut === filtres.statut) &&
    (!q || p.nom.toLowerCase().includes(q) || (CATEGORIES[p.categorie] || '').toLowerCase().includes(q))
  );
  tbody.innerHTML = liste.map(ligne).join('');
  vide.hidden = liste.length > 0;
  compteur.textContent = `${liste.length} produit${liste.length > 1 ? 's' : ''}`;
}

document.getElementById('q').addEventListener('input', e => { filtres.q = e.target.value; rendre(); });
fCat.addEventListener('change', e => { filtres.cat = e.target.value; rendre(); });
document.getElementById('fStatut').addEventListener('change', e => { filtres.statut = e.target.value; rendre(); });

/* Suppression avec confirmation */
tbody.addEventListener('click', async e => {
  const btn = e.target.closest('[data-del]');
  if (!btn) return;
  const p = produits.find(x => x.id === Number(btn.dataset.del));
  if (!p) return;
  if (await confirmer(`Supprimer « ${p.nom} » ? Cette action est définitive.`)) {
    produits = produits.filter(x => x.id !== p.id);
    sauverProduits(produits);
    rendre();
    notifier('Produit supprimé');
  }
});

/* Message après enregistrement depuis le formulaire */
const msg = new URLSearchParams(location.search).get('msg');
const MESSAGES = { cree: 'Produit ajouté', modifie: 'Modifications enregistrées', supprime: 'Produit supprimé' };
if (MESSAGES[msg]) {
  notifier(MESSAGES[msg]);
  history.replaceState(null, '', 'produits.html');
}

rendre();