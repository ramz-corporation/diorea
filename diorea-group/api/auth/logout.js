const { methode, enveloppe } = require('../../lib/http');
const { cookieSession } = require('../../lib/auth');

module.exports = enveloppe(async (req, res) => {
  if (!methode(req, res, ['POST'])) return;
  res.setHeader('Set-Cookie', cookieSession(req, '', 0));   // supprime le cookie
  return res.status(200).json({ ok: true });
});