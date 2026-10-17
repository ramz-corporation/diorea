const commandes = commandesCalculees();
const actives = commandes.filter(c => c.statut !== 'annulee');
const produits = chargerProduits();

/* ---------- Indicateurs ---------- */
const ca = actives.reduce((s, c) => s + c.total, 0);
const ventes = actives.length;
const enAttente = commandes.filter(c => c.statut === 'attente').length;
const panierMoyen = ventes ? Math.round(ca / ventes) : 0;

document.getElementById('demoNote').innerHTML =
  `${ico('info')} <span>Données de démonstration : les commandes, clients et stocks affichés sont fictifs. Ils seront remplacés par les vraies données quand la base PostgreSQL sera branchée.</span>`;

document.getElementById('kpis').innerHTML = [
  { label: "Chiffre d'affaires", valeur: formatPrix(ca), note: 'Commandes non annulées' },
  { label: 'Ventes', valeur: ventes, note: 'Commandes enregistrées' },
  { label: 'Commandes en attente', valeur: enAttente, note: 'À traiter', accent: enAttente > 0 },
  { label: 'Panier moyen', valeur: formatPrix(panierMoyen), note: 'Par commande' }
].map(k => `
  <div class="card kpi ${k.accent ? 'kpi--accent' : ''}">
    <span class="kpi__label">${esc(k.label)}</span>
    <strong class="kpi__value">${esc(k.valeur)}</strong>
    <span class="kpi__note">${esc(k.note)}</span>
  </div>`).join('');

/* ---------- Alerte de stock ---------- */
const aSurveiller = produits.filter(p => p.mode === 'direct' && p.stock != null && p.stock <= SEUIL_STOCK);
if (aSurveiller.length) {
  document.getElementById('alertes').innerHTML = `
    <div class="alert" role="status">
      ${ico('info')}
      <span><strong>${aSurveiller.length} produit${aSurveiller.length > 1 ? 's' : ''} à surveiller :</strong>
      ${aSurveiller.map(p => esc(p.nom)).join(', ')}</span>
      <a href="stock.html">Voir le stock</a>
    </div>`;
}

/* ---------- Évolution des ventes (6 mois) ---------- */
const mois = [];
for (let i = 5; i >= 0; i--) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - i);
  mois.push({
    cle: `${d.getFullYear()}-${d.getMonth()}`,
    label: d.toLocaleDateString('fr-FR', { month: 'short' }),
    total: 0
  });
}
actives.forEach(c => {
  const m = mois.find(x => x.cle === `${c.date.getFullYear()}-${c.date.getMonth()}`);
  if (m) m.total += c.total;
});
const maxMois = Math.max(...mois.map(m => m.total), 1);

document.getElementById('chart').innerHTML = mois.map(m => {
  const h = Math.max(2, Math.round(m.total / maxMois * 100));
  return `
    <div class="bar" title="${esc(m.label)} : ${esc(formatPrix(m.total))}">
      <span class="bar__val">${m.total ? Math.round(m.total / 1000) + ' k' : '0'}</span>
      <div class="bar__track"><div class="bar__fill" style="height:${h}%"></div></div>
      <span class="bar__lbl">${esc(m.label)}</span>
    </div>`;
}).join('');

/* ---------- Produits populaires ---------- */
const parProduit = {};
actives.forEach(c => c.lignes.forEach(l => { parProduit[l.id] = (parProduit[l.id] || 0) + l.qte; }));

const top = Object.entries(parProduit)
  .map(([id, qte]) => {
    const p = produits.find(x => x.id === Number(id));
    return { nom: p ? p.nom : 'Produit supprimé', qte };
  })
  .sort((a, b) => b.qte - a.qte)
  .slice(0, 5);
const maxQte = Math.max(...top.map(t => t.qte), 1);

document.getElementById('populaires').innerHTML = top.length
  ? top.map(t => `
      <li>
        <div class="rank__row"><span>${esc(t.nom)}</span><span>${t.qte} vendu${t.qte > 1 ? 's' : ''}</span></div>
        <div class="rank__bar"><i style="width:${Math.round(t.qte / maxQte * 100)}%"></i></div>
      </li>`).join('')
  : '<li class="muted">Aucune vente pour le moment.</li>';

/* ---------- Commandes récentes ---------- */
document.getElementById('recentes').innerHTML = commandes.slice(0, 5).map(c => `
  <tr>
    <td><strong>${esc(c.ref)}</strong></td>
    <td>${esc(c.client)}</td>
    <td>${esc(c.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }))}</td>
    <td class="num">${esc(formatPrix(c.total))}</td>
    <td><span class="tag ${CLASSE_STATUT[c.statut]}">${esc(STATUTS_CMD[c.statut])}</span></td>
    <td><span class="tag ${c.paiement === 'paye' ? 'tag--ok' : 'tag--warn'}">${c.paiement === 'paye' ? 'Payé' : 'À payer'}</span></td>
  </tr>`).join('');