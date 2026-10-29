const bcrypt = require('bcryptjs');
const { neon } = require('@neondatabase/serverless');

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const motDePasse = process.env.ADMIN_PASSWORD || '';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL manquante (lance : npx vercel env pull .env.local)');
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('ADMIN_EMAIL manquant ou invalide');
  process.exit(1);
}
if (motDePasse.length < 12) {
  console.error('Le mot de passe doit faire 12 caractères minimum');
  process.exit(1);
}

(async () => {
  const sql = neon(process.env.DATABASE_URL);
  const hash = await bcrypt.hash(motDePasse, 12);

  // Si le compte existe déjà, son mot de passe est remplacé (utile en cas d'oubli)
  await sql`
    INSERT INTO admins (email, password_hash) VALUES (${email}, ${hash})
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`;

  console.log(`Compte administrateur prêt : ${email}`);
})().catch(e => {
  console.error('Erreur :', e.message);
  process.exit(1);
});