const sql = require('../../lib/db');
const { erreur, methode, enveloppe } = require('../../lib/http');
const { adminConnecte, exigerAdmin } = require('../../lib/auth');
const { validerProduit, versAdmin, versPublic } = require('../../lib/produits');

module.exports = enveloppe(async (req, res) => {
  if (!methode(req, res, ['GET', 'PUT', 'DELETE'])) return;

  const id = Number(req.query.id);
  if (!Number.isInteger(id) || id < 1) return erreur(res, 400, 'Identifiant invalide');

  /* ---------- GET : un produit ---------- */
  if (req.method === 'GET') {
    const modeAdmin = req.query.admin === '1';
    if (modeAdmin && !adminConnecte(req)) return erreur(res, 401, 'Connexion requise');

    const [p] = await sql`SELECT * FROM produits WHERE id = ${id}`;
    if (!p || (!modeAdmin && p.statut !== 'publie')) return erreur(res, 404, 'Produit introuvable');

    if (modeAdmin) res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(modeAdmin ? versAdmin(p) : versPublic(p));
  }

  /* Modification et suppression : admin uniquement */
  if (!exigerAdmin(req, res)) return;

  /* ---------- PUT : modification ---------- */
  if (req.method === 'PUT') {
    const verif = validerProduit(req.body);
    if (verif.erreur) return erreur(res, 400, verif.erreur);
    const v = verif.valeur;

    const [maj] = await sql`
      UPDATE produits SET
        nom = ${v.nom}, categorie = ${v.categorie}, description = ${v.description}, details = ${v.details},
        mode = ${v.mode}, prix = ${v.prix}, stock = ${v.stock}, statut = ${v.statut},
        images = ${JSON.stringify(v.images)}::jsonb,
        options = ${JSON.stringify(v.options)}::jsonb,
        perso = ${JSON.stringify(v.perso)}::jsonb,
        updated_at = now()
      WHERE id = ${id}
      RETURNING *`;

    if (!maj) return erreur(res, 404, 'Produit introuvable');
    return res.status(200).json(versAdmin(maj));
  }

  /* ---------- DELETE : suppression ---------- */
  const supprimes = await sql`DELETE FROM produits WHERE id = ${id} RETURNING id`;
  if (!supprimes.length) return erreur(res, 404, 'Produit introuvable');
  return res.status(200).json({ ok: true });
});