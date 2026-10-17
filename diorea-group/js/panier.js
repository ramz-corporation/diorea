/* Panier simple, stocké dans le navigateur (localStorage).
   Il sera relié à l'API plus tard. */

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

function ajouterAuPanier(id, quantite = 1) {
  const panier = lirePanier();
  const ligne = panier.find(l => l.id === id);
  if (ligne) {
    ligne.quantite += quantite;
  } else {
    panier.push({ id, quantite });
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
