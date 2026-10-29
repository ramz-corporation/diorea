const form = document.getElementById('loginForm');
const erreur = document.getElementById('loginError');
const bouton = document.getElementById('loginBtn');

function afficher(message) { erreur.textContent = message || ''; }

form.addEventListener('submit', async e => {
  e.preventDefault();
  afficher('');

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    afficher('Saisissez votre adresse e-mail et votre mot de passe.');
    return;
  }

  bouton.disabled = true;
  bouton.textContent = 'Connexion…';

  try {
    /* Sera géré par le back-end Express :
       POST /api/auth/login → vérifie les identifiants, pose un cookie sécurisé (JWT) */
    const rep = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password })
    });

    if (rep.ok) {
      location.href = 'index.html';
      return;
    }
    if (rep.status === 400 || rep.status === 401) {
      afficher('Adresse e-mail ou mot de passe incorrect.');
    } else if (rep.status === 404 || rep.status === 405) {
      afficher("Connexion indisponible : le serveur n'est pas encore branché (mode maquette).");
    } else {
      afficher('Une erreur est survenue. Réessayez dans un instant.');
    }
  } catch {
    afficher("Serveur injoignable : la connexion sera active quand le back-end sera branché.");
  } finally {
    bouton.disabled = false;
    bouton.textContent = 'Se connecter';
    document.getElementById('password').value = '';
  }
});