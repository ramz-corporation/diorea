const $ = id => document.getElementById(id);

$('demoNote').innerHTML =
  `${ico('info')} <span>Ces paramètres sont gardés dans ce navigateur pour l'instant. Le site public ne les lit pas encore : les liens WhatsApp et Instagram de l'accueil restent à renseigner à la main.</span>`;

/* ---------- Pré-remplissage ---------- */
const { boutique, gestion } = lireParams();
$('pNom').value = boutique.nom;
$('pMail').value = boutique.email;
$('pTel').value = boutique.telephone;
$('pWa').value = boutique.whatsapp;
$('pInsta').value = boutique.instagram;
$('pAdresse').value = boutique.adresse;
$('pSeuil').value = gestion.seuilStock;
$('pAlerte').checked = gestion.alerteStock;
$('pStatut').value = gestion.statutDefaut;

/* ---------- Validation ---------- */
function erreur(champ, idErreur, message) {
  $(idErreur).textContent = message || '';
  $(champ).classList.toggle('is-invalid', Boolean(message));
  return Boolean(message);
}

const RE_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_TEL = /^\+?[\d\s().-]{6,20}$/;

function valider() {
  let premier = null;
  const noter = (champ, invalide) => { if (invalide && !premier) premier = $(champ); };

  noter('pNom', erreur('pNom', 'errNom', $('pNom').value.trim() ? '' : 'Indiquez le nom de la boutique.'));

  const mail = $('pMail').value.trim();
  noter('pMail', erreur('pMail', 'errMail', !mail || RE_MAIL.test(mail) ? '' : "L'adresse e-mail ne semble pas valide."));

  const tel = $('pTel').value.trim();
  noter('pTel', erreur('pTel', 'errTel', !tel || RE_TEL.test(tel) ? '' : 'Numéro non valide.'));

  const wa = $('pWa').value.trim();
  noter('pWa', erreur('pWa', 'errWa', !wa || RE_TEL.test(wa) ? '' : 'Numéro non valide.'));

  const seuil = Number($('pSeuil').value);
  const seuilOk = $('pSeuil').value !== '' && Number.isInteger(seuil) && seuil >= 0 && seuil <= 999;
  noter('pSeuil', erreur('pSeuil', 'errSeuil', seuilOk ? '' : 'Indiquez un nombre entier entre 0 et 999.'));

  if (premier) premier.focus();
  return !premier;
}

[['pNom', 'errNom'], ['pMail', 'errMail'], ['pTel', 'errTel'], ['pWa', 'errWa'], ['pSeuil', 'errSeuil']]
  .forEach(([champ, err]) => $(champ).addEventListener('input', () => erreur(champ, err, '')));

/* ---------- Enregistrement ---------- */
$('paramForm').addEventListener('submit', e => {
  e.preventDefault();
  if (!valider()) return;

  const ok = sauverParams({
    boutique: {
      nom: $('pNom').value.trim(),
      email: $('pMail').value.trim(),
      telephone: $('pTel').value.trim(),
      whatsapp: $('pWa').value.trim(),
      instagram: $('pInsta').value.trim(),
      adresse: $('pAdresse').value.trim()
    },
    gestion: {
      seuilStock: Number($('pSeuil').value),
      alerteStock: $('pAlerte').checked,
      statutDefaut: $('pStatut').value
    }
  });
  notifier(ok ? 'Paramètres enregistrés' : 'Enregistrement impossible dans ce navigateur');
});

/* ---------- Réinitialisation des données de démonstration ---------- */
$('reset').addEventListener('click', async () => {
  const message = 'Réinitialiser les données de démonstration ? Les produits ajoutés ou modifiés et les statuts enregistrés seront effacés.';
  if (!(await confirmer(message, 'Réinitialiser'))) return;

  try {
    ['diorea_admin_produits_v1', 'diorea_admin_commandes_v1', 'diorea_admin_devis_v1']
      .forEach(cle => localStorage.removeItem(cle));
    notifier('Données de démonstration réinitialisées');
  } catch {
    notifier('Réinitialisation impossible dans ce navigateur');
  }
});