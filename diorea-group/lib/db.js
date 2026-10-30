const { neon } = require('@neondatabase/serverless');

// NEON_DATABASE_URL est notre variable ; DATABASE_URL est celle créée par l'intégration Vercel.
const url = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  throw new Error('Variable NEON_DATABASE_URL ou DATABASE_URL manquante');
}

// `sql` s'utilise en gabarit : await sql`SELECT * FROM produits WHERE id = ${id}`
// Les valeurs ${...} sont envoyées séparément de la requête (protection contre l'injection SQL).
module.exports = neon(url);