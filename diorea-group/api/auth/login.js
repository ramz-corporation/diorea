const bcrypt = require('bcryptjs');
const sql = require('../../lib/db');
const { erreur, methode, enveloppe } = require('../../lib/http');
const { signer, cookieSession } = require('../../lib/auth');

// On compare toujours un mot de passe, même si l'e-mail n'existe pas :
// la réponse ne révèle ni quels e-mails existent, ni le temps de calcul.
const FAUX_HASH = bcrypt.hashSync('mot-de-passe-factice', 10);

module.exports = enveloppe(async (req, res) => {
  if (!methode(req, res, ['POST'])) return;

  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string'
      || !email.trim() || !password || password.length > 200) {
    return erreur(res, 400, 'E-mail et mot de passe requis');
  }

  const [admin] = await sql`
    SELECT id, email, password_hash FROM admins WHERE email = ${email.trim().toLowerCase()}`;

  const valide = await bcrypt.compare(password, admin ? admin.password_hash : FAUX_HASH);
  if (!admin || !valide) return erreur(res, 401, 'Identifiants incorrects');

  res.setHeader('Set-Cookie', cookieSession(req, signer(admin)));
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, email: admin.email });
});