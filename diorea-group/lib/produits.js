const CATEGORIES = ['impression', 'personnalisation', 'accessoires', 'branding'];

function texte(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function liste(v, maxElements, maxLongueur) {
  if (!Array.isArray(v)) return [];
  const sortie = [];
  for (const x of v) {
    const t = texte(x, maxLongueur);
    if (t && !sortie.some(s => s.toLowerCase() === t.toLowerCase())) sortie.push(t);
    if (sortie.length === maxElements) break;
  }
  return sortie;
}

/* Vérifie et nettoie les données reçues. Le serveur ne fait jamais confiance au navigateur. */
function validerProduit(b) {
  if (!b || typeof b !== 'object') return { erreur: 'Données invalides' };

  const nom = texte(b.nom, 80);
  const description = texte(b.description, 160);
  if (!nom) return { erreur: 'Le nom est obligatoire' };
  if (!CATEGORIES.includes(b.categorie)) return { erreur: 'Catégorie invalide' };
  if (!description) return { erreur: 'La description courte est obligatoire' };
  if (!['direct', 'devis'].includes(b.mode)) return { erreur: 'Mode de vente invalide' };
  if (!['publie', 'brouillon'].includes(b.statut)) return { erreur: 'Statut invalide' };

  // Le mode de vente décide si un prix et un stock existent
  let prix = null;
  let stock = null;
  if (b.mode === 'direct') {
    prix = Number(b.prix);
    stock = Number(b.stock);
    if (!Number.isInteger(prix) || prix <= 0 || prix > 100000000) return { erreur: 'Prix invalide' };
    if (!Number.isInteger(stock) || stock < 0 || stock > 99999) return { erreur: 'Stock invalide' };
  }

  // Les photos sont des adresses https (envoyées par l'étape « upload », à venir)
  let images = [];
  if (b.images !== undefined) {
    if (!Array.isArray(b.images) || b.images.length > 4
        || b.images.some(u => typeof u !== 'string' || u.length > 500 || !/^https:\/\//.test(u))) {
      return { erreur: 'Images invalides (4 adresses https maximum)' };
    }
    images = b.images;
  }

  const o = b.options && typeof b.options === 'object' ? b.options : {};
  const p = b.perso && typeof b.perso === 'object' ? b.perso : {};
  const actif = p.actif === true;

  return {
    valeur: {
      nom,
      categorie: b.categorie,
      description,
      details: texte(b.details, 2000),
      mode: b.mode,
      prix,
      stock,
      statut: b.statut,
      images,
      options: { couleurs: liste(o.couleurs, 20, 40), formats: liste(o.formats, 20, 40) },
      perso: {
        actif,
        libelle: actif ? texte(p.libelle, 60) : '',
        supplement: actif ? Math.max(0, Math.min(10000000, Math.round(Number(p.supplement) || 0))) : 0,
        instructions: actif ? texte(p.instructions, 500) : ''
      }
    }
  };
}

/* Format utilisé par l'administration */
function versAdmin(r) {
  return {
    id: r.id, nom: r.nom, categorie: r.categorie, description: r.description, details: r.details,
    mode: r.mode, prix: r.prix, stock: r.stock, statut: r.statut,
    images: r.images, options: r.options, perso: r.perso,
    caracteristiques: r.caracteristiques, delai: r.delai
  };
}

/* Format utilisé par le site public (même forme que js/data.js, sans le stock exact) */
function versPublic(r) {
  const perso = r.perso || {};
  const options = r.options || {};
  return {
    id: r.id, nom: r.nom, categorie: r.categorie, description: r.description, details: r.details,
    mode: r.mode, prix: r.prix, images: r.images,
    caracteristiques: r.caracteristiques, delai: r.delai,
    options: {
      texte: perso.actif ? (perso.libelle || null) : null,
      couleurs: options.couleurs || [],
      formats: options.formats || []
    },
    disponible: r.mode === 'direct' ? r.stock > 0 : true
  };
}

module.exports = { CATEGORIES, validerProduit, versAdmin, versPublic };