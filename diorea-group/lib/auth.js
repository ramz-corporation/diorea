const jwt = require('jsonwebtoken');
const { erreur } = require('./http');

const NOM_COOKIE = 'diorea_admin';
const DUREE = 60 * 60 * 8;   // session de 8 heures

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error('JWT_SECRET manquant ou trop court (32 caractères minimum)');
  return s;
}

function signer(admin) {
  return jwt.sign({ sub: String(admin.id), email: admin.email }, secret(), {
    algorithm: 'HS256',
    expiresIn: DUREE
  });
}

/* Cookie de session : illisible par le JavaScript de la page (HttpOnly), jamais envoyé depuis un autre site (SameSite=Strict). */
function cookieSession(req, token, duree = DUREE) {
  const parts = [`${NOM_COOKIE}=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${duree}`];
  if (req.headers['x-forwarded-proto'] === 'https') parts.push('Secure');
  return parts.join('; ');
}

function lireCookie(req, nom) {
  const brut = req.headers.cookie || '';
  for (const morceau of brut.split(';')) {
    const [cle, ...reste] = morceau.trim().split('=');
    if (cle === nom) return reste.join('=');
  }
  return null;
}

/* Renvoie les infos de l'admin si le cookie est valide, sinon null. */
function adminConnecte(req) {
  const token = lireCookie(req, NOM_COOKIE);
  if (!token) return null;
  try {
    return jwt.verify(token, secret(), { algorithms: ['HS256'] });
  } catch {
    return null;
  }
}

/* Protection supplémentaire : une requête qui modifie des données doit venir de notre propre site. */
function memeOrigine(req) {
  const origine = req.headers.origin;
  if (!origine) return true;
  try {
    return new URL(origine).host === req.headers.host;
  } catch {
    return false;
  }
}

/* À mettre au début de toute route réservée à l'admin. Renvoie l'admin, ou null après avoir répondu. */
function exigerAdmin(req, res) {
  const admin = adminConnecte(req);
  if (!admin) {
    erreur(res, 401, 'Connexion requise');
    return null;
  }
  if (req.method !== 'GET' && !memeOrigine(req)) {
    erreur(res, 403, 'Origine refusée');
    return null;
  }
  return admin;
}

module.exports = { signer, cookieSession, adminConnecte, exigerAdmin };