const $ = id => document.getElementById(id);
const filtres = { q: '', statut: 'all', paiement: 'all' };
let commandes = commandesCalculees();

$('demoNote').innerHTML =
  `${ico('info')} <span>Données de démonstration : clients, coordonnées et demandes ci-dessous sont fictifs. Les statuts que vous modifiez sont gardés dans ce navigateur uniquement.</span>`;

/* Détails fictifs par commande (coordonnées et demandes de personnalisation) */
const DETAILS = {
  'CMD-1014': { tel: '00 00 00 00 00', adresse: 'Dakar (adresse de démonstration)',
    perso: ['Bouteille personnalisée × 2 : texte « Aminata », couleur Noir', 'Tote bag personnalisé × 1 : texte « Team Aminata », couleur Écru'] },
  'CMD-1013': { tel: '00 00 00 00 00', adresse: 'Dakar (adresse de démonstration)', perso: [] },
  'CMD-1012': { tel: '00 00 00 00 00', adresse: 'Dakar (adresse de démonstration)',
    perso: ['Toile personnalisée × 1 : format 40 × 60 cm, photo à envoyer par le client'] },
  'CMD-1011': { tel: '00 00 00 00 00', adresse: 'Dakar (adresse de démonstration)', perso: ['Bouteille personnalisée × 1 : couleur Beige'] },
  'CMD-1010': { tel: '00 00 00 00 00', adresse: 'Dakar (adresse de démonstration)', perso: ['Tote bag personnalisé × 4 : texte « Équipe »'] },
  'CMD-1008': { tel: '00 00 00 00 00', adresse: 'Dakar (adresse de démonstration)', perso: ['Bouteille personnalisée × 3 : prénoms différents'] }
};

/* =====================================================
   LISTE
   ===================================================== */
function ongletsHtml() {
  const defs = [['all', 'Toutes'], ...Object.entries(STATUTS_CMD)];
  return defs.map(([cle, label]) => {
    const n = cle === 'all' ? commandes.length : commandes.filter(c => c.statut === cle).length;
    return `<button type="button" class="chip ${filtres.statut === cle ? 'is-active' : ''}" data-statut="${esc(cle)}">${esc(label)} <span>${n}</span></button>`;
  }).join('');
}

function ligne(c) {
  const n = c.lignes.reduce((s, l) => s + l.qte, 0);
  return `
    <tr>
      <td><strong>${esc(c.ref)}</strong></td>
      <td>${esc(c.client)}</td>
      <td>${esc(fmtDate(c.date))}</td>
      <td>${n}</td>
      <td class="num">${esc(formatPrix(c.total))}</td>
      <td><span class="tag ${c.paiement === 'paye' ? 'tag--ok' : 'tag--warn'}">${esc(PAIEMENTS[c.paiement])}</span></td>
      <td><span class="tag ${CLASSE_STATUT[c.statut]}">${esc(STATUTS_CMD[c.statut])}</span></td>
      <td class="actions"><button type="button" class="btn btn--ghost btn--sm" data-ref="${esc(c.ref)}">Voir</button></td>
    </tr>`;
}

function rendre() {
  const q = filtres.q.trim().toLowerCase();
  const liste = commandes.filter(c =>
    (filtres.statut === 'all' || c.statut === filtres.statut) &&
    (filtres.paiement === 'all' || c.paiement === filtres.paiement) &&
    (!q || c.ref.toLowerCase().includes(q) || c.client.toLowerCase().includes(q))
  );
  $('onglets').innerHTML = ongletsHtml();
  $('tbody').innerHTML = liste.map(ligne).join('');
  $('empty').hidden = liste.length > 0;
  $('count').textContent = `${liste.length} commande${liste.length > 1 ? 's' : ''}`;
}

$('onglets').addEventListener('click', e => {
  const b = e.target.closest('[data-statut]');
  if (!b) return;
  filtres.statut = b.dataset.statut;
  rendre();
});
$('q').addEventListener('input', e => { filtres.q = e.target.value; rendre(); });
$('fPaiement').addEventListener('change', e => { filtres.paiement = e.target.value; rendre(); });
$('tbody').addEventListener('click', e => {
  const b = e.target.closest('[data-ref]');
  if (b) ouvrirDetail(b.dataset.ref);
});

/* =====================================================
   FICHE DÉTAIL
   ===================================================== */
const dlg = $('detail');
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

function ouvrirDetail(ref) {
  const c = commandes.find(x => x.ref === ref);
  if (!c) return;
  const d = DETAILS[ref] || {};

  const options = obj => Object.entries(obj).map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');

  const lignes = c.lignes.map(l => `
    <tr>
      <td>${esc(l.nom)}</td>
      <td class="num">${l.qte}</td>
      <td class="num">${esc(formatPrix(l.pu))}</td>
      <td class="num">${esc(formatPrix(l.pu * l.qte))}</td>
    </tr>`).join('');

  const perso = (d.perso && d.perso.length)
    ? `<ul class="detail-list">${d.perso.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`
    : '<p class="muted" style="font-size:.88rem">Aucune demande de personnalisation.</p>';

  dlg.innerHTML = `
    <div class="detail-head">
      <div>
        <h2>${esc(c.ref)}</h2>
        <span class="muted">Passée le ${esc(fmtDate(c.date))}</span>
      </div>
      <button type="button" class="icon-btn icon-btn--sm" data-close aria-label="Fermer">×</button>
    </div>

    <div class="detail-grid">
      <section class="detail-block">
        <h3>Client</h3>
        <dl class="dl">
          <div><dt>Nom</dt><dd>${esc(c.client)}</dd></div>
          <div><dt>Téléphone</dt><dd>${esc(d.tel || '—')}</dd></div>
          <div><dt>Livraison</dt><dd>${esc(d.adresse || '—')}</dd></div>
        </dl>
      </section>
      <section class="detail-block">
        <h3>Suivi</h3>
        <div class="detail-form" style="grid-template-columns:1fr">
          <div class="field">
            <label for="dStatut">Statut de la commande</label>
            <select id="dStatut">${options(STATUTS_CMD)}</select>
          </div>
          <div class="field">
            <label for="dPaiement">Paiement</label>
            <select id="dPaiement">${options(PAIEMENTS)}</select>
          </div>
        </div>
      </section>
    </div>

    <section class="detail-block">
      <h3>Produits achetés</h3>
      <div class="table-wrap">
        <table class="detail-table">
          <thead><tr><th>Produit</th><th class="num">Qté</th><th class="num">Prix unitaire</th><th class="num">Total</th></tr></thead>
          <tbody>${lignes}</tbody>
        </table>
      </div>
      <div class="detail-total"><span>Total de la commande</span><strong>${esc(formatPrix(c.total))}</strong></div>
    </section>

    <section class="detail-block">
      <h3>Demandes de personnalisation</h3>
      ${perso}
    </section>

    <div class="detail-actions">
      <button type="button" class="btn btn--ghost btn--sm" data-close>Fermer</button>
      <button type="button" class="btn btn--gradient btn--sm" data-save="${esc(c.ref)}">Enregistrer</button>
    </div>`;

  $('dStatut').value = c.statut;
  $('dPaiement').value = c.paiement;
  dlg.showModal();
}

dlg.addEventListener('click', e => {
  if (e.target.closest('[data-close]')) { dlg.close(); return; }
  const save = e.target.closest('[data-save]');
  if (!save) return;

  const ok = sauverModifCmd(save.dataset.save, { statut: $('dStatut').value, paiement: $('dPaiement').value });
  commandes = commandesCalculees();
  rendre();
  dlg.close();
  notifier(ok ? 'Commande mise à jour' : "Enregistrement impossible dans ce navigateur");
});

rendre();