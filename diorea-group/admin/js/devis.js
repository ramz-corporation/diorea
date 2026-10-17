const $ = id => document.getElementById(id);

const STATUTS_DEVIS = {
  nouveau: 'Nouvelle',
  etude: 'En étude',
  envoye: 'Proposition envoyée',
  accepte: 'Acceptée',
  refuse: 'Refusée'
};
const CLASSE_DEVIS = { nouveau: 'tag--warn', etude: 'tag--info', envoye: 'tag--accent', accepte: 'tag--ok', refuse: 'tag--muted' };
const CLE_DEVIS = 'diorea_admin_devis_v1';

/* Demandes fictives (démonstration). echeance = jours à partir d'aujourd'hui (null = non précisée) */
const DEVIS_DEMO = [
  { ref: 'DEV-2008', client: 'Awa C.', contact: '00 00 00 00 00', produit: 10, quantite: 150,
    description: "Pochettes pour un mariage : noms des mariés et date imprimés, tons beige et marron.",
    options: ['Texte ou nom', 'Couleurs précises'], budget: '200 000 FCFA', echeance: 25, fichier: 'inspiration-mariage.pdf', statut: 'nouveau', jours: 0 },
  { ref: 'DEV-2007', client: 'Société Teranga (démo)', contact: 'contact@exemple.test', produit: 9, quantite: 1,
    description: "Refonte de notre identité : nouveau logo, charte de couleurs et supports de papeterie.",
    options: ['Logo', 'Création graphique'], budget: 'À discuter', echeance: 40, fichier: 'logo-actuel.png', statut: 'etude', jours: 2 },
  { ref: 'DEV-2006', client: 'Moussa D.', contact: '00 00 00 00 00', produit: 3, quantite: 300,
    description: "Cartes de visite recto-verso avec mon logo, finition sobre.",
    options: ['Logo'], budget: '', echeance: 10, fichier: '', statut: 'nouveau', jours: 1 },
  { ref: 'DEV-2005', client: 'Fatou N.', contact: '00 00 00 00 00', produit: 6, quantite: 100,
    description: "Coffrets cadeau pour ma boutique, avec une fenêtre transparente et mon nom en doré.",
    options: ['Emballage ou packaging', 'Format sur mesure'], budget: '150 000 FCFA', echeance: 30, fichier: '', statut: 'envoye', jours: 6 },
  { ref: 'DEV-2004', client: 'Khady M.', contact: '00 00 00 00 00', produit: 1, quantite: 500,
    description: "Étiquettes rondes pour mes pots, 5 cm de diamètre.",
    options: ['Format sur mesure', 'Couleurs précises'], budget: '', echeance: null, fichier: 'etiquette-modele.png', statut: 'accepte', jours: 12 },
  { ref: 'DEV-2003', client: 'Ibrahima T.', contact: '00 00 00 00 00', produit: 'autre', autre: 'Banderole pour événement', quantite: 2,
    description: "Deux banderoles pour une conférence, avec notre visuel.",
    options: ['Création graphique'], budget: '50 000 FCFA', echeance: null, fichier: '', statut: 'refuse', jours: 18 },
  { ref: 'DEV-2002', client: 'Mariama K.', contact: '00 00 00 00 00', produit: 10, quantite: 80,
    description: "Pochettes pour un baptême, prénom de l'enfant imprimé.",
    options: ['Texte ou nom'], budget: '90 000 FCFA', echeance: null, fichier: '', statut: 'accepte', jours: 26 },
  { ref: 'DEV-2001', client: 'Cheikh B.', contact: 'contact@exemple.test', produit: 9, quantite: 1,
    description: "Identité visuelle pour une nouvelle activité de conseil.",
    options: ['Logo', 'Création graphique'], budget: '', echeance: null, fichier: '', statut: 'envoye', jours: 33 }
];

const filtres = { q: '', statut: 'all' };
const produitsAdmin = chargerProduits();

$('demoNote').innerHTML =
  `${ico('info')} <span>Données de démonstration : ces demandes sont fictives. Les statuts et notes que vous enregistrez sont gardés dans ce navigateur uniquement. Les fichiers joints ne sont pas disponibles tant que l'envoi vers le serveur n'est pas branché.</span>`;

/* ---------- Modifications enregistrées ---------- */
function lireModifs() {
  try { return JSON.parse(localStorage.getItem(CLE_DEVIS)) || {}; } catch { return {}; }
}
function sauverModif(ref, champs) {
  const tout = lireModifs();
  tout[ref] = { ...(tout[ref] || {}), ...champs };
  try { localStorage.setItem(CLE_DEVIS, JSON.stringify(tout)); return true; } catch { return false; }
}

function demandes() {
  const modifs = lireModifs();
  return DEVIS_DEMO.map(d => {
    const m = modifs[d.ref] || {};
    const p = typeof d.produit === 'number' ? produitsAdmin.find(x => x.id === d.produit) : null;
    return {
      ...d,
      nomProduit: d.produit === 'autre' ? (d.autre || 'Autre projet') : (p ? p.nom : 'Produit supprimé'),
      statut: STATUTS_DEVIS[m.statut] ? m.statut : d.statut,
      note: m.note || '',
      dateRecue: new Date(Date.now() - d.jours * 86400000),
      dateEcheance: d.echeance == null ? null : new Date(Date.now() + d.echeance * 86400000)
    };
  }).sort((a, b) => a.jours - b.jours);
}

let liste = demandes();

/* Une demande non traitée dont l'échéance approche (7 jours) est signalée */
const urgente = d => d.echeance != null && d.echeance <= 7 && (d.statut === 'nouveau' || d.statut === 'etude');

/* =====================================================
   LISTE
   ===================================================== */
function ongletsHtml() {
  const defs = [['all', 'Toutes'], ...Object.entries(STATUTS_DEVIS)];
  return defs.map(([cle, label]) => {
    const n = cle === 'all' ? liste.length : liste.filter(d => d.statut === cle).length;
    return `<button type="button" class="chip ${filtres.statut === cle ? 'is-active' : ''}" data-statut="${esc(cle)}">${esc(label)} <span>${n}</span></button>`;
  }).join('');
}

function ligne(d) {
  const ech = d.dateEcheance
    ? `${esc(fmtDate(d.dateEcheance))}${urgente(d) ? ' <span class="tag tag--danger">Urgent</span>' : ''}`
    : '<span class="muted">Non précisée</span>';
  return `
    <tr>
      <td><strong>${esc(d.ref)}</strong><br><small class="muted">${esc(fmtDate(d.dateRecue))}</small></td>
      <td>${esc(d.client)}</td>
      <td>${esc(d.nomProduit)}</td>
      <td class="num">${d.quantite}</td>
      <td>${d.budget ? esc(d.budget) : '<span class="muted">—</span>'}</td>
      <td>${ech}</td>
      <td><span class="tag ${CLASSE_DEVIS[d.statut]}">${esc(STATUTS_DEVIS[d.statut])}</span></td>
      <td class="actions"><button type="button" class="btn btn--ghost btn--sm" data-ref="${esc(d.ref)}">Voir</button></td>
    </tr>`;
}

function rendre() {
  const q = filtres.q.trim().toLowerCase();
  const resultat = liste.filter(d =>
    (filtres.statut === 'all' || d.statut === filtres.statut) &&
    (!q || d.ref.toLowerCase().includes(q) || d.client.toLowerCase().includes(q) || d.nomProduit.toLowerCase().includes(q))
  );
  $('onglets').innerHTML = ongletsHtml();
  $('tbody').innerHTML = resultat.map(ligne).join('');
  $('empty').hidden = resultat.length > 0;
  $('count').textContent = `${resultat.length} demande${resultat.length > 1 ? 's' : ''}`;
}

$('onglets').addEventListener('click', e => {
  const b = e.target.closest('[data-statut]');
  if (!b) return;
  filtres.statut = b.dataset.statut;
  rendre();
});
$('q').addEventListener('input', e => { filtres.q = e.target.value; rendre(); });
$('tbody').addEventListener('click', e => {
  const b = e.target.closest('[data-ref]');
  if (b) ouvrirDetail(b.dataset.ref);
});

/* =====================================================
   FICHE DÉTAIL
   ===================================================== */
const dlg = $('detail');

function ouvrirDetail(ref) {
  const d = liste.find(x => x.ref === ref);
  if (!d) return;

  const opts = d.options.length
    ? `<ul class="detail-list">${d.options.map(o => `<li>${esc(o)}</li>`).join('')}</ul>`
    : '<p class="muted" style="font-size:.88rem">Aucune option cochée.</p>';

  const fichier = d.fichier
    ? `${esc(d.fichier)} <span class="muted">(démo, non téléchargeable)</span>`
    : '<span class="muted">Aucun fichier joint</span>';

  const statuts = Object.entries(STATUTS_DEVIS).map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');

  dlg.innerHTML = `
    <div class="detail-head">
      <div>
        <h2>${esc(d.ref)}</h2>
        <span class="muted">Reçue le ${esc(fmtDate(d.dateRecue))}</span>
      </div>
      <button type="button" class="icon-btn icon-btn--sm" data-close aria-label="Fermer">×</button>
    </div>

    <div class="detail-grid">
      <section class="detail-block">
        <h3>Client</h3>
        <dl class="dl">
          <div><dt>Nom</dt><dd>${esc(d.client)}</dd></div>
          <div><dt>Contact</dt><dd>${esc(d.contact)}</dd></div>
        </dl>
      </section>
      <section class="detail-block">
        <h3>Projet</h3>
        <dl class="dl">
          <div><dt>Produit ou service</dt><dd>${esc(d.nomProduit)}</dd></div>
          <div><dt>Quantité</dt><dd>${d.quantite}</dd></div>
          <div><dt>Budget indicatif</dt><dd>${d.budget ? esc(d.budget) : '—'}</dd></div>
          <div><dt>Échéance</dt><dd>${d.dateEcheance ? esc(fmtDate(d.dateEcheance)) : 'Non précisée'}</dd></div>
        </dl>
      </section>
    </div>

    <section class="detail-block">
      <h3>Description du besoin</h3>
      <p class="detail-text">${esc(d.description)}</p>
    </section>

    <div class="detail-grid">
      <section class="detail-block">
        <h3>Options de personnalisation</h3>
        ${opts}
      </section>
      <section class="detail-block">
        <h3>Fichier de référence</h3>
        <p style="font-size:.9rem">${fichier}</p>
      </section>
    </div>

    <section class="detail-block">
      <h3>Traitement</h3>
      <div class="detail-form">
        <div class="field">
          <label for="dStatut">Statut</label>
          <select id="dStatut">${statuts}</select>
        </div>
        <div class="field field--full">
          <label for="dNote">Note interne (non visible par le client)</label>
          <textarea id="dNote" rows="3" maxlength="500" placeholder="Ex : proposition envoyée par WhatsApp, à relancer jeudi…"></textarea>
        </div>
      </div>
    </section>

    <div class="detail-actions">
      <button type="button" class="btn btn--ghost btn--sm" data-close>Fermer</button>
      <button type="button" class="btn btn--gradient btn--sm" data-save="${esc(d.ref)}">Enregistrer</button>
    </div>`;

  $('dStatut').value = d.statut;
  $('dNote').value = d.note;
  dlg.showModal();
}

dlg.addEventListener('click', e => {
  if (e.target === dlg || e.target.closest('[data-close]')) { dlg.close(); return; }
  const save = e.target.closest('[data-save]');
  if (!save) return;

  const ok = sauverModif(save.dataset.save, { statut: $('dStatut').value, note: $('dNote').value.trim() });
  liste = demandes();
  rendre();
  dlg.close();
  notifier(ok ? 'Demande mise à jour' : "Enregistrement impossible dans ce navigateur");
});

rendre();