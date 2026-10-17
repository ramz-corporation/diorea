/* =====================================================
   CODE PARTAGÉ DE L'ADMINISTRATION
   Prérequis : ../js/data.js chargé avant ce fichier.

   Les produits sont gardés dans le navigateur (localStorage)
   pour tester la maquette. Ils seront remplacés par l'API
   (PostgreSQL) et les vraies images par des envois vers
   server/uploads.
   ===================================================== */

const SEUIL_STOCK = 5;                          // stock bas à partir de cette quantité
const CLE_STORE = 'diorea_admin_produits_v1';
const STOCK_DEMO = { 2: 8, 4: 3, 5: 14, 7: 0, 8: 6 };   // stocks fictifs de démonstration

/* ---------- Sécurité : échappe le texte (guillemets compris) ---------- */
function esc(texte) {
  return String(texte == null ? '' : texte)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ---------- Icônes ---------- */
const ICONES = {
  vue:       '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  produits:  '<path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z"/><path d="m4 8 8 4 8-4M12 12v8"/>',
  commandes: '<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  devis:     '<path d="M7 3h7l4 4v14H7V3Z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
  stock:     '<path d="m12 4 8 4-8 4-8-4 8-4Z"/><path d="m4 12 8 4 8-4M4 16l8 4 8-4"/>',
  parametres:'<path d="M5 7h9M18 7h1M5 17h1M10 17h9"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  plus:      '<path d="M12 5v14M5 12h14"/>',
  site:      '<path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5"/>',
  sortie:    '<path d="M10 5H5v14h5M15 8l4 4-4 4M19 12H9"/>',
  menu:      '<path d="M4 8h16M4 16h16"/>',
  edit:      '<path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z"/><path d="m14 7 3 3"/>',
  corbeille: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13M10 11v6M14 11v6"/>',
  image:     '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m4 17 5-4 4 3 3-2 4 3"/>',
  info:      '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>'
};
function ico(nom) { return `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONES[nom]}</svg>`; }

/* =====================================================
   PRODUITS (stockage navigateur)
   ===================================================== */
function amorcerProduits() {
  return PRODUITS.map(p => {
    const o = p.options || {};
    return {
      id: p.id, nom: p.nom, categorie: p.categorie,
      description: p.description, details: p.details || '',
      mode: p.mode, prix: p.prix,
      stock: p.mode === 'direct' ? (STOCK_DEMO[p.id] ?? 10) : null,
      statut: 'publie',
      images: [],
      options: { couleurs: [...(o.couleurs || [])], formats: [...(o.formats || [])] },
      perso: { actif: Boolean(o.texte), libelle: o.texte || '', supplement: 0, instructions: '' }
    };
  });
}

function chargerProduits() {
  try {
    const stocke = JSON.parse(localStorage.getItem(CLE_STORE));
    if (Array.isArray(stocke)) return stocke;
  } catch { /* données illisibles : on repart de la démo */ }
  const init = amorcerProduits();
  sauverProduits(init);
  return init;
}

function sauverProduits(liste) {
  try {
    localStorage.setItem(CLE_STORE, JSON.stringify(liste));
    return true;
  } catch {
    return false;      // espace plein (images trop lourdes ?)
  }
}

/* Étiquette de stock : rupture / stock bas / quantité */
function stockTag(p) {
  if (p.mode !== 'direct' || p.stock == null) return '<span class="muted">—</span>';
  if (p.stock <= 0) return '<span class="tag tag--danger">Rupture</span>';
  if (p.stock <= SEUIL_STOCK) return `<span class="tag tag--warn">${p.stock} · stock bas</span>`;
  return `<span>${p.stock}</span>`;
}

/* =====================================================
   COMMANDES DE DÉMONSTRATION (fictives)
   Calculées avec les prix actuels des produits.
   ===================================================== */
const STATUTS_CMD = { attente: 'En attente', preparation: 'En préparation', livree: 'Livrée', annulee: 'Annulée' };
const CLASSE_STATUT = { attente: 'tag--warn', preparation: 'tag--info', livree: 'tag--ok', annulee: 'tag--muted' };

const COMMANDES_DEMO = [
  { ref: 'CMD-1014', client: 'Aminata S.',  jours: 1,   lignes: [{ id: 4, qte: 2 }, { id: 5, qte: 1 }], statut: 'attente',     paiement: 'a_payer' },
  { ref: 'CMD-1013', client: 'Moussa D.',   jours: 3,   lignes: [{ id: 7, qte: 1 }],                    statut: 'preparation', paiement: 'paye' },
  { ref: 'CMD-1012', client: 'Fatou N.',    jours: 5,   lignes: [{ id: 2, qte: 1 }],                    statut: 'attente',     paiement: 'a_payer' },
  { ref: 'CMD-1011', client: 'Ibrahima T.', jours: 9,   lignes: [{ id: 8, qte: 2 }, { id: 4, qte: 1 }], statut: 'livree',      paiement: 'paye' },
  { ref: 'CMD-1010', client: 'Awa C.',      jours: 13,  lignes: [{ id: 5, qte: 4 }],                    statut: 'livree',      paiement: 'paye' },
  { ref: 'CMD-1009', client: 'Cheikh B.',   jours: 20,  lignes: [{ id: 7, qte: 1 }, { id: 8, qte: 1 }], statut: 'livree',      paiement: 'paye' },
  { ref: 'CMD-1008', client: 'Mariama K.',  jours: 28,  lignes: [{ id: 4, qte: 3 }],                    statut: 'livree',      paiement: 'paye' },
  { ref: 'CMD-1007', client: 'Ousmane F.',  jours: 36,  lignes: [{ id: 2, qte: 2 }],                    statut: 'annulee',     paiement: 'a_payer' },
  { ref: 'CMD-1006', client: 'Khady M.',    jours: 47,  lignes: [{ id: 5, qte: 2 }, { id: 4, qte: 1 }], statut: 'livree',      paiement: 'paye' },
  { ref: 'CMD-1005', client: 'Pape G.',     jours: 60,  lignes: [{ id: 7, qte: 1 }],                    statut: 'livree',      paiement: 'paye' },
  { ref: 'CMD-1004', client: 'Soda L.',     jours: 75,  lignes: [{ id: 2, qte: 1 }, { id: 5, qte: 3 }], statut: 'livree',      paiement: 'paye' },
  { ref: 'CMD-1003', client: 'Samba R.',    jours: 95,  lignes: [{ id: 8, qte: 1 }],                    statut: 'livree',      paiement: 'paye' },
  { ref: 'CMD-1002', client: 'Bineta H.',   jours: 120, lignes: [{ id: 4, qte: 2 }],                    statut: 'livree',      paiement: 'paye' },
  { ref: 'CMD-1001', client: 'Daouda P.',   jours: 150, lignes: [{ id: 5, qte: 2 }],                    statut: 'livree',      paiement: 'paye' }
];

function commandesCalculees() {
  const produits = chargerProduits();
  return COMMANDES_DEMO.map(c => {
    const lignes = c.lignes.map(l => {
      const p = produits.find(x => x.id === l.id);
      return { ...l, nom: p ? p.nom : 'Produit supprimé', pu: (p && p.mode === 'direct' && p.prix) ? p.prix : 0 };
    });
    return {
      ...c, lignes,
      total: lignes.reduce((s, l) => s + l.pu * l.qte, 0),
      date: new Date(Date.now() - c.jours * 86400000)
    };
  }).sort((a, b) => a.jours - b.jours);
}

/* =====================================================
   MISE EN PAGE : sidebar fixe + barre du haut
   ===================================================== */
const NAV = [
  { id: 'vue',        href: 'index.html',      label: "Vue d'ensemble" },
  { id: 'produits',   href: 'produits.html',   label: 'Produits' },
  { id: 'commandes',  href: 'commandes.html',  label: 'Commandes' },
  { id: 'devis',      href: 'devis.html',      label: 'Demandes de devis' },
  { id: 'stock',      href: 'stock.html',      label: 'Catégories et stock' },
  { id: 'parametres', href: 'parametres.html', label: 'Paramètres' }
];

function monterLayout() {
  const page = document.body.dataset.page;
  const side = document.getElementById('sidebar');
  const top = document.getElementById('topbar');

  side.innerHTML = `
    <a class="sidebar__brand" href="index.html" aria-label="Administration DIOREA GROUP">
      <span class="logo__name">DIOREA</span>
      <span class="logo__sub">GROUP · ADMINISTRATION</span>
    </a>

    <a class="btn btn--gradient btn--block sidebar__cta" href="produit-form.html">${ico('plus')} Ajouter un produit</a>

    <nav class="sidebar__nav" aria-label="Administration">
      ${NAV.map(n => `
        <a class="sidebar__link ${n.id === page ? 'is-active' : ''}" href="${n.href}" ${n.id === page ? 'aria-current="page"' : ''}>
          ${ico(n.id)} ${esc(n.label)}
        </a>`).join('')}
    </nav>

    <div class="sidebar__foot">
      <a class="sidebar__link" href="../index.html" target="_blank" rel="noopener">${ico('site')} Voir le site</a>
      <a class="sidebar__link" href="login.html">${ico('sortie')} Déconnexion</a>
    </div>`;

  const titre = top.dataset.title || '';
  top.innerHTML = `
    <button class="icon-btn burger" id="adminBurger" aria-label="Ouvrir le menu">${ico('menu')}</button>
    <h1 class="topbar__title">${esc(titre)}</h1>
    <div class="topbar__actions">
      ${page === 'produit-form' ? '' : `<a class="btn btn--gradient btn--sm" href="produit-form.html">${ico('plus')} Ajouter un produit</a>`}
    </div>`;

  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  document.body.appendChild(scrim);

  const fermer = () => document.body.classList.remove('menu-open');
  document.getElementById('adminBurger').addEventListener('click', () => document.body.classList.toggle('menu-open'));
  scrim.addEventListener('click', fermer);
  side.addEventListener('click', e => { if (e.target.closest('a')) fermer(); });
}

function definirTitre(texte) {
  const t = document.querySelector('.topbar__title');
  if (t) t.textContent = texte;
  document.title = `${texte} — Administration DIOREA`;
}

/* =====================================================
   NOTIFICATION + CONFIRMATION
   ===================================================== */
let timerToast;
function notifier(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(timerToast);
  timerToast = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function confirmer(message, libelleOui = 'Supprimer') {
  return new Promise(resolve => {
    let d = document.getElementById('confirmDialog');
    if (!d) {
      d = document.createElement('dialog');
      d.id = 'confirmDialog';
      d.className = 'dialog';
      document.body.appendChild(d);
    }
    d.innerHTML = `
      <form method="dialog">
        <p class="dialog__msg">${esc(message)}</p>
        <div class="dialog__actions">
          <button value="non" class="btn btn--ghost btn--sm">Annuler</button>
          <button value="oui" class="btn btn--danger btn--sm">${esc(libelleOui)}</button>
        </div>
      </form>`;
    d.returnValue = '';
    d.addEventListener('close', () => resolve(d.returnValue === 'oui'), { once: true });
    d.showModal();
  });
}

/* =====================================================
   IMAGES : réduit une photo avant de la garder (démo)
   ===================================================== */
function compresserImage(fichier, max = 640) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(fichier);
    img.onload = () => {
      const r = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * r);
      c.height = Math.round(img.height * r);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image illisible')); };
    img.src = url;
  });
}

monterLayout();