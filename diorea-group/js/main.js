// Menu mobile
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

burger.addEventListener('click', () => {
  const ouvert = nav.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', ouvert);
});

// Ferme le menu quand on clique sur un lien
nav.querySelectorAll('a').forEach(lien =>
  lien.addEventListener('click', () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  })
);

// Année du pied de page
document.getElementById('year').textContent = new Date().getFullYear();
