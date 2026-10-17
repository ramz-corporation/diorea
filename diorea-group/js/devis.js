const form = document.getElementById('quoteForm');
const quoteBox = document.getElementById('quoteBox');
const quoteDone = document.getElementById('quoteDone');
const howBox = document.getElementById('howBox');
const selectProduit = document.getElementById('dProduit');
const fileInput = document.getElementById('dFile');

const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo
const AUTRE = 'autre';

/* ---------- Sécurité : échappe le texte avant insertion ---------- */
function esc(texte) {
  const div = document.createElement('div');
  div.textContent = texte == null ? '' : String(texte);
  return div.innerHTML;
}

/* =====================================================
   LISTE DES PRODUITS / SERVICES
   Regroupés par catégorie + choix « Autre projet »
   ===================================================== */
function remplirProduits() {
  let html = '<option value="">Choisir un produit ou un service…</option>';

  Object.keys(CATEGORIES).forEach(cle => {
    const produits = PRODUITS.filter(p => p.categorie === cle);
    if (!produits.length) return;
    html += `<optgroup label="${esc(CATEGORIES[cle])}">` +
      produits.map(p => `<option value="${p.id}">${esc(p.nom)}</option>`).join('') +
      '</optgroup>';
  });

  html += `<option value="${AUTRE}">Autre projet (à préciser dans la description)</option>`;
  selectProduit.innerHTML = html;

  // Pré-sélection via l'URL : devis.html?produit=3
  const idUrl = new URLSearchParams(location.search).get('produit');
  if (idUrl && PRODUITS.some(p => String(p.id) === idUrl)) {
    selectProduit.value = idUrl;
  }
}

/* Date souhaitée : pas de date passée */
document.getElementById('dDate').min = new Date().toISOString().split('T')[0];

remplirProduits();

/* =====================================================
   VALIDATION
   ===================================================== */
function afficherErreur(idChamp, idErreur, message) {
  const el = document.getElementById(idChamp);
  const err = document.getElementById(idErreur);
  err.textContent = message || '';
  if (el) el.classList.toggle('is-invalid', Boolean(message));
  return Boolean(message);
}

function valider() {
  let premier = null;
  const marquer = (id, erreur) => { if (erreur && !premier) premier = document.getElementById(id); };

  const nom = document.getElementById('dNom').value.trim();
  marquer('dNom', afficherErreur('dNom', 'errNom', nom ? '' : 'Indiquez votre nom.'));

  // Au moins un moyen de contact : téléphone ou e-mail
  const tel = document.getElementById('dTel').value.trim();
  const mail = document.getElementById('dMail').value.trim();
  let erreurContact = '';
  if (!tel && !mail) {
    erreurContact = 'Indiquez un téléphone ou un e-mail pour que nous puissions vous répondre.';
  } else if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    erreurContact = "L'adresse e-mail ne semble pas valide.";
  }
  document.getElementById('errContact').textContent = erreurContact;
  document.getElementById('dTel').classList.toggle('is-invalid', !tel && !mail);
  document.getElementById('dMail').classList.toggle('is-invalid', Boolean(erreurContact) && Boolean(mail || (!tel && !mail)));
  marquer(!tel ? 'dTel' : 'dMail', Boolean(erreurContact));

  marquer('dProduit', afficherErreur('dProduit', 'errProduit', selectProduit.value ? '' : 'Choisissez un produit ou un service.'));

  const qte = Number(document.getElementById('dQte').value);
  marquer('dQte', afficherErreur('dQte', 'errQte', qte >= 1 ? '' : 'Indiquez une quantité.'));

  const desc = document.getElementById('dDesc').value.trim();
  marquer('dDesc', afficherErreur('dDesc', 'errDesc', desc ? '' : 'Décrivez votre besoin.'));

  // Fichier : taille et type
  let erreurFichier = '';
  const fichier = fileInput.files[0];
  if (fichier) {
    const typeOk = fichier.type.startsWith('image/') || fichier.type === 'application/pdf';
    if (!typeOk) erreurFichier = 'Format non accepté : choisissez une image ou un PDF.';
    else if (fichier.size > TAILLE_MAX) erreurFichier = 'Le fichier dépasse 5 Mo.';
  }
  marquer('dFile', afficherErreur('dFile', 'errFile', erreurFichier));

  if (premier) premier.focus();
  return !premier;
}

/* Efface l'erreur dès que l'utilisateur corrige */
[['dNom', 'errNom'], ['dQte', 'errQte'], ['dDesc', 'errDesc'], ['dProduit', 'errProduit'], ['dFile', 'errFile']]
  .forEach(([champ, erreur]) => {
    const el = document.getElementById(champ);
    ['input', 'change'].forEach(ev => el.addEventListener(ev, () => afficherErreur(champ, erreur, '')));
  });

['dTel', 'dMail'].forEach(id =>
  document.getElementById(id).addEventListener('input', () => {
    document.getElementById('errContact').textContent = '';
    document.getElementById('dTel').classList.remove('is-invalid');
    document.getElementById('dMail').classList.remove('is-invalid');
  })
);

/* =====================================================
   ENVOI (SIMULÉ)
   ===================================================== */
function nomProduitChoisi() {
  if (selectProduit.value === AUTRE) return 'Autre projet';
  const p = PRODUITS.find(x => String(x.id) === selectProduit.value);
  return p ? p.nom : '';
}

function ligneRecap(label, valeur) {
  if (!valeur) return '';
  return `<div><dt>${esc(label)}</dt><dd>${esc(valeur)}</dd></div>`;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!valider()) return;

  const options = [...document.querySelectorAll('#dOptions input:checked')].map(i => i.value);
  const dateBrute = document.getElementById('dDate').value;
  const dateAffichee = dateBrute
    ? new Date(dateBrute + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const fichier = fileInput.files[0];

  /* TODO : envoyer à l'API → POST /api/devis
     const data = new FormData(form);  // inclut le fichier
     data.append('options', JSON.stringify(options));
     await fetch('/api/devis', { method: 'POST', body: data }); */

  document.getElementById('doneNom').textContent = document.getElementById('dNom').value.trim();
  document.getElementById('doneRecap').innerHTML =
    ligneRecap('Produit ou service', nomProduitChoisi()) +
    ligneRecap('Quantité', document.getElementById('dQte').value) +
    ligneRecap('Dimensions', document.getElementById('dDim').value.trim()) +
    ligneRecap('Personnalisation', options.join(', ')) +
    ligneRecap('Budget indicatif', document.getElementById('dBudget').value.trim()) +
    ligneRecap('Date souhaitée', dateAffichee) +
    ligneRecap('Fichier joint', fichier ? fichier.name : '');

  document.getElementById('doneRef').textContent =
    'Référence de démonstration : DEV-' + Date.now().toString().slice(-6) + " · aucune donnée n'a été transmise.";

  quoteBox.hidden = true;
  howBox.hidden = true;
  quoteDone.hidden = false;
  quoteDone.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/* ---------- Nouvelle demande ---------- */
document.getElementById('newQuote').addEventListener('click', () => {
  form.reset();
  form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  form.querySelectorAll('.field__error').forEach(el => { el.textContent = ''; });
  remplirProduits();
  quoteDone.hidden = true;
  quoteBox.hidden = false;
  howBox.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
