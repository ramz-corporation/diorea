const sql = require('../../lib/db');
const { erreur, methode, enveloppe } = require('../../lib/http');
const { adminConnecte, exigerAdmin } = require('../../lib/auth');
const { validerProduit, versAdmin, versPublic } = require('../../lib/produits');

module.exports = enveloppe(async (req, res) => {
  if (!methode(req, res, ['GET', 'POST'])) return;

  /* ---------- GET : liste ---------- */
  if (req.method === 'GET') {
    const modeAdmin = req.query.admin === '1';
    if (modeAdmin && !adminConnecte(req)) return erreur(res, 401, 'Connexion requise');

    // Le public ne voit jamais les brouillons
    const lignes = modeAdmin
      ? await sql`SELECT * FROM produits ORDER BY id`
      : await sql`SELECT * FROM produits WHERE statut = 'publie' ORDER BY id`;

    if (modeAdmin) res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(lignes.map(modeAdmin ? versAdmin : versPublic));
  }

  /* ---------- POST : création (admin) ---------- */
  if (!exigerAdmin(req, res)) return;

  const verif = validerProduit(req.body);
  if (verif.erreur) return erreur(res, 400, verif.erreur);
  const v = verif.valeur;

  const [cree] = await sql`
    INSERT INTO produits (nom, categorie, description, details, mode, prix, stock, statut, images, options, perso)
    VALUES (${v.nom}, ${v.categorie}, ${v.description}, ${v.details}, ${v.mode}, ${v.prix}, ${v.stock}, ${v.statut},
            ${JSON.stringify(v.images)}::jsonb, ${JSON.stringify(v.options)}::jsonb, ${JSON.stringify(v.perso)}::jsonb)
    RETURNING *`;

  return res.status(201).json(versAdmin(cree));
});