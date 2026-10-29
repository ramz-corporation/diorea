function erreur(res, statut, message) {
  return res.status(statut).json({ erreur: message });
}

/* Vérifie la méthode HTTP. Renvoie true si elle est permise. */
function methode(req, res, permises) {
  if (permises.includes(req.method)) return true;
  res.setHeader('Allow', permises.join(', '));
  erreur(res, 405, 'Méthode non autorisée');
  return false;
}

/* Enveloppe un gestionnaire : toute erreur imprévue renvoie un 500 sans détail au client. */
function enveloppe(gestionnaire) {
  return async (req, res) => {
    try {
      await gestionnaire(req, res);
    } catch (e) {
      console.error(e);
      if (!res.headersSent) erreur(res, 500, 'Erreur du serveur');
    }
  };
}

module.exports = { erreur, methode, enveloppe };