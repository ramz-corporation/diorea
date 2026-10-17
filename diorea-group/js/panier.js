/* Panier simple, stocké dans le navigateur (localStorage).
   Chaque ligne : { cle, id, quantite, options }
   Deux produits identiques avec des options différentes
   (ex : couleur ou texte) forment deux lignes distinctes. */

const CLE_PANIER = 'diorea_panier';

function lirePanier() {
  try {
    return JSON.parse(localStorage.getItem(CLE_PANIER)) || [];
  } catch {
    return [];
  }
}

function sauverPanier(panier) {
  localStorage.setItem(CLE_PANIER, JSON.stringify(panier));
  majBadgePanier();
}

function ajouterAuPanier(id, quantite = 1, options = {}) {
  const panier = lirePanier();
  const cle = id + '|' + JSON.stringify(options);
  const ligne = panier.find(l => l.cle === cle);
  if (ligne) {
    ligne.quantite += quantite;
  } else {
    panier.push({ cle, id, quantite, options });
  }
  sauverPanier(panier);
}

function majBadgePanier() {
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  const total = lirePanier().reduce((somme, l) => somme + l.quantite, 0);
  badge.textContent = total;
  badge.hidden = total === 0;
}

document.addEventListener('DOMContentLoaded', majBadgePanier);
