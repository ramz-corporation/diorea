const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  throw new Error('Variable DATABASE_URL manquante');
}

// `sql` s'utilise en gabarit : await sql`SELECT * FROM produits WHERE id = ${id}`
// Les valeurs ${...} sont envoyées séparément de la requête (protection contre l'injection SQL).
module.exports = neon(process.env.DATABASE_URL);