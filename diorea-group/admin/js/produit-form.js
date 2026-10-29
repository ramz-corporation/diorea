const params = new URLSearchParams(location.search);
const idEdition = Number(params.get('id')) || null;

let produits = chargerProduits();
const courant = idEdition ? produits.find(p => p.id === idEdition) : null;

const $ = id => document.getElementById(id);
const MAX_IMAGES = 4;

/* État du formulaire (listes modifiées en place) */
const etat = { images: [], couleurs: [], formats: [] };

/* ---------- Catégories ---------- */
$('categorie').innerHTML = '<option value="">Choisir une catégorie…</option>' +
  Object.keys(CATEGORIES).map(k => `<option value="${esc(k)}">${esc(CATEGORIES[k])}</option>`).join('');

/* =====================================================
   ÉTIQUETTES (variantes)
   ===================================================== */
function creerTags(conteneur, liste) {
  const input = conteneur.querySelector('input');

  function rendre() {
    conteneur.querySelectorAll('.tag-chip').forEach(n => n.remove());
    liste.forEach((t, i) => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.innerHTML = `${esc(t)}<button type="button" data-i="${i}" aria-label="Retirer ${esc(t)}">×</button>`;
      conteneur.insertBefore(chip, input);
    });
  }
  function ajouter() {
    const v = input.value.replace(/,/g, '').trim();
    if (v && !liste.some(x => x.toLowerCase() === v.toLowerCase())) liste.push(v);
    input.value = '';
    rendre();
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); ajouter(); }
    else if (e.key === 'Backspace' && !input.value && liste.length) { liste.pop(); rendre(); }
  });
  input.addEventListener('blur', ajouter);
  conteneur.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (b) { liste.splice(Number(b.dataset.i), 1); rendre(); }
    else input.focus();
  });

  rendre();
  return { ajouter };
}

/* =====================================================
   IMAGES
   ===================================================== */
function rendreImages() {
  $('imgGrid').innerHTML = etat.images.map((src, i) => `
    <div class="img-item">
      <img src="${esc(src)}" alt="Photo ${i + 1}">
      ${i === 0 ? '<span class="img-item__flag">Principale</span>' : `<button type="button" class="img-item__set" data-main="${i}">Mettre en principale</button>`}
      <button type="button" class="img-item__rm" data-rm="${i}" aria-label="Retirer la photo ${i + 1}">×</button>
    </div>`).join('');
}

async function ajouterFichiers(fichiers) {
  const images = [...fichiers].filter(f => f.type.startsWith('image/'));
  if (images.length < fichiers.length) notifier('Seules les images sont acceptées');

  const places = MAX_IMAGES - etat.images.length;
  if (places <= 0) { notifier(`${MAX_IMAGES} photos maximum`); return; }
  if (images.length > places) notifier(`${MAX_IMAGES} photos maximum : les premières sont gardées`);

  for (const f of images.slice(0, places)) {
    try { etat.images.push(await compresserImage(f)); }
    catch { notifier(`« ${f.name} » n'a pas pu être lue`); }
  }
  rendreImages();
}

$('fichiers').addEventListener('change', e => { ajouterFichiers(e.target.files); e.target.value = ''; });

const zone = $('dropzone');
['dragenter', 'dragover'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.add('is-over'); }));
['dragleave', 'drop'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.remove('is-over'); }));
zone.addEventListener('drop', e => ajouterFichiers(e.dataTransfer.files));

$('imgGrid').addEventListener('click', e => {
  const rm = e.target.closest('[data-rm]');
  const main = e.target.closest('[data-main]');
  if (rm) { etat.images.splice(Number(rm.dataset.rm), 1); rendreImages(); }
  if (main) { const [img] = etat.images.splice(Number(main.dataset.main), 1); etat.images.unshift(img); rendreImages(); }
});

/* =====================================================
   AFFICHAGE CONDITIONNEL
   ===================================================== */
const modeChoisi = () => document.querySelector('input[name="mode"]:checked').value;

function majMode() {
  const direct = modeChoisi() === 'direct';
  $('directFields').hidden = !direct;
  $('devisNote').hidden = direct;
}
document.querySelectorAll('input[name="mode"]').forEach(r => r.addEventListener('change', majMode));

$('persoActif').addEventListener('change', () => { $('persoFields').hidden = !$('persoActif').checked; });

/* =====================================================
   PRÉ-REMPLISSAGE (modification)
   ===================================================== */
if (idEdition && !courant) {
  notifier('Produit introuvable');
  setTimeout(() => { location.href = 'produits.html'; }, 1200);
}

if (courant) {
  definirTitre('Modifier le produit');
  $('nom').value = courant.nom;
  $('categorie').value = courant.categorie;
  $('description').value = courant.description || '';
  $('details').value = courant.details || '';
  document.querySelector(`input[name="mode"][value="${courant.mode}"]`).checked = true;
  $('prix').value = courant.prix ?? '';
  $('stock').value = courant.stock ?? '';
  $('statut').value = courant.statut;
  etat.images = [...(courant.images || [])];
  etat.couleurs = [...((courant.options && courant.options.couleurs) || [])];
  etat.formats = [...((courant.options && courant.options.formats) || [])];

  const perso = courant.perso || {};
  $('persoActif').checked = Boolean(perso.actif);
  $('persoLibelle').value = perso.libelle || '';
  $('persoSupplement').value = perso.supplement || '';
  $('persoInstructions').value = perso.instructions || '';
  $('supprimer').hidden = false;
} else {
    definirTitre('Ajouter un produit');
    $('statut').value = lireParams().gestion.statutDefaut;
}

const tagsCouleurs = creerTags($('tagsCouleurs'), etat.couleurs);
const tagsFormats = creerTags($('tagsFormats'), etat.formats);
rendreImages();
majMode();
$('persoFields').hidden = !$('persoActif').checked;

/* =====================================================
   VALIDATION + ENREGISTREMENT
   ===================================================== */
function erreur(champ, idErreur, message) {
  $(idErreur).textContent = message || '';
  $(champ).classList.toggle('is-invalid', Boolean(message));
  return Boolean(message);
}

function valider() {
  const direct = modeChoisi() === 'direct';
  let premier = null;
  const noter = (champ, invalide) => { if (invalide && !premier) premier = $(champ); };

  noter('nom',         erreur('nom', 'errNom', $('nom').value.trim() ? '' : 'Indiquez le nom du produit.'));
  noter('categorie',   erreur('categorie', 'errCategorie', $('categorie').value ? '' : 'Choisissez une catégorie.'));
  noter('description', erreur('description', 'errDescription', $('description').value.trim() ? '' : 'Ajoutez une courte description.'));

  if (direct) {
    const prix = Number($('prix').value);
    const stock = Number($('stock').value);
    noter('prix',  erreur('prix', 'errPrix', prix > 0 ? '' : 'Indiquez un prix supérieur à 0.'));
    noter('stock', erreur('stock', 'errStock', $('stock').value !== '' && stock >= 0 ? '' : 'Indiquez le stock (0 si épuisé).'));
  } else {
    erreur('prix', 'errPrix', '');
    erreur('stock', 'errStock', '');
  }

  if (premier) premier.focus();
  return !premier;
}

['nom', 'categorie', 'description', 'prix', 'stock'].forEach(champ => {
  const idErr = 'err' + champ.charAt(0).toUpperCase() + champ.slice(1);
  ['input', 'change'].forEach(ev => $(champ).addEventListener(ev, () => erreur(champ, idErr, '')));
});

$('productForm').addEventListener('submit', e => {
  e.preventDefault();
  tagsCouleurs.ajouter();     // prend en compte un texte tapé mais pas encore validé
  tagsFormats.ajouter();
  if (!valider()) return;

  const direct = modeChoisi() === 'direct';
  const persoActif = $('persoActif').checked;

  const produit = {
    id: courant ? courant.id : Math.max(0, ...produits.map(p => p.id)) + 1,
    nom: $('nom').value.trim(),
    categorie: $('categorie').value,
    description: $('description').value.trim(),
    details: $('details').value.trim(),
    mode: direct ? 'direct' : 'devis',
    prix: direct ? Math.round(Number($('prix').value)) : null,
    stock: direct ? Math.floor(Number($('stock').value)) : null,
    statut: $('statut').value,
    images: etat.images.slice(),
    options: { couleurs: etat.couleurs.slice(), formats: etat.formats.slice() },
    perso: {
      actif: persoActif,
      libelle: persoActif ? $('persoLibelle').value.trim() : '',
      supplement: persoActif ? Math.max(0, Math.round(Number($('persoSupplement').value) || 0)) : 0,
      instructions: persoActif ? $('persoInstructions').value.trim() : ''
    }
  };

  const liste = courant ? produits.map(p => (p.id === produit.id ? produit : p)) : [...produits, produit];

  if (!sauverProduits(liste)) {
    notifier("Enregistrement impossible : photos trop lourdes ? Retirez-en une.");
    return;
  }
  location.href = 'produits.html?msg=' + (courant ? 'modifie' : 'cree');
});

/* ---------- Suppression (mode modification) ---------- */
$('supprimer').addEventListener('click', async () => {
  if (!courant) return;
  if (await confirmer(`Supprimer « ${courant.nom} » ? Cette action est définitive.`)) {
    sauverProduits(produits.filter(p => p.id !== courant.id));
    location.href = 'produits.html?msg=supprime';
  }
});