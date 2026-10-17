/* =====================================================
   DONNÉES DE DÉMONSTRATION
   À remplacer plus tard par les produits de l'API
   (GET /api/produits). Les prix et noms ci-dessous
   sont fictifs, uniquement pour tester la maquette.
   ===================================================== */

const CATEGORIES = {
  impression: 'Impression',
  personnalisation: 'Personnalisation',
  accessoires: 'Accessoires',
  branding: 'Branding & événementiel'
};

const PRODUITS = [
  {
    id: 1,
    nom: 'Étiquettes adhésives',
    categorie: 'impression',
    description: 'Étiquettes imprimées à vos couleurs, pour vos produits et vos emballages.',
    mode: 'devis',
    prix: null,
    image: ''            // ex : 'assets/img/produits/etiquettes.jpg'
  },
  {
    id: 2,
    nom: 'Toile personnalisée',
    categorie: 'impression',
    description: 'Une toile imprimée à partir de votre photo ou de votre visuel.',
    mode: 'direct',
    prix: 15000,
    image: ''
  },
  {
    id: 3,
    nom: 'Cartes de visite',
    categorie: 'impression',
    description: 'Cartes imprimées sur papier épais, avec votre identité.',
    mode: 'devis',
    prix: null,
    image: ''
  },
  {
    id: 4,
    nom: 'Bouteille personnalisée',
    categorie: 'personnalisation',
    description: 'Une bouteille avec votre texte ou votre logo.',
    mode: 'direct',
    prix: 8000,
    image: ''
  },
  {
    id: 5,
    nom: 'Tote bag personnalisé',
    categorie: 'personnalisation',
    description: 'Un sac en tissu avec le visuel de votre choix.',
    mode: 'direct',
    prix: 6000,
    image: ''
  },
  {
    id: 6,
    nom: 'Packaging sur mesure',
    categorie: 'personnalisation',
    description: 'Coffrets et emballages conçus pour votre produit.',
    mode: 'devis',
    prix: null,
    image: ''
  },
  {
    id: 7,
    nom: 'Montre',
    categorie: 'accessoires',
    description: 'Une montre élégante, pour affirmer votre style.',
    mode: 'direct',
    prix: 25000,
    image: ''
  },
  {
    id: 8,
    nom: 'Boutons de manchette',
    categorie: 'accessoires',
    description: 'Une paire de boutons de manchette raffinée.',
    mode: 'direct',
    prix: 12000,
    image: ''
  },
  {
    id: 9,
    nom: 'Identité visuelle',
    categorie: 'branding',
    description: 'Logo, couleurs et supports de marque pour votre entreprise.',
    mode: 'devis',
    prix: null,
    image: ''
  },
  {
    id: 10,
    nom: 'Pochettes pour mariage',
    categorie: 'branding',
    description: 'Sacs et pochettes personnalisés pour vos invités.',
    mode: 'devis',
    prix: null,
    image: ''
  }
];

/* Formate un prix en FCFA : 15000 → "15 000 FCFA" */
function formatPrix(n) {
  return new Intl.NumberFormat('fr-FR').format(n).replace(/\u202f|\u00a0/g, ' ') + ' FCFA';
}
