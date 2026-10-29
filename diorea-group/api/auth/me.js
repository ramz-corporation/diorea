const { erreur, methode, enveloppe } = require('../../lib/http');
const { adminConnecte } = require('../../lib/auth');

// Sert aux pages admin à vérifier qu'une session est ouverte
module.exports = enveloppe(async (req, res) => {
  if (!methode(req, res, ['GET'])) return;
  const admin = adminConnecte(req);
  if (!admin) return erreur(res, 401, 'Non connecté');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ email: admin.email });
});