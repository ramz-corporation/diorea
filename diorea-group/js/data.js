/* =====================================================
   DONNÉES DE DÉMONSTRATION
   À remplacer plus tard par l'API (GET /api/produits).
   Prix, noms, caractéristiques et options sont fictifs,
   uniquement pour tester la maquette.

   Champs :
   - mode            : 'direct' (prix + panier) ou 'devis'
   - prix            : nombre en FCFA, null si sur devis
   - images          : liste de chemins (vide = visuel de remplacement)
   - caracteristiques: liste { label, valeur }
   - options         : personnalisation proposée (null = aucune)
       texte    : libellé du champ texte, ou null
       couleurs : liste de couleurs, ou []
       formats  : liste de formats, ou []
   - delai           : texte de délai/livraison, ou null (non affiché)
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
    details: 'Des étiquettes adhésives imprimées selon votre visuel, adaptées à vos produits et à vos emballages. Décrivez votre besoin et nous revenons vers vous avec une proposition.',
    mode: 'devis',
    prix: null,
    images: [],
    caracteristiques: [
      { label: 'Support', valeur: 'Adhésif' },
      { label: 'Formes', valeur: 'Rondes, carrées ou rectangulaires' },
      { label: 'Fichier', valeur: 'Votre visuel ou création sur mesure' }
    ],
    options: { texte: null, couleurs: [], formats: [] },
    delai: null
  },
  {
    id: 2,
    nom: 'Toile personnalisée',
    categorie: 'impression',
    description: 'Une toile imprimée à partir de votre photo ou de votre visuel.',
    details: 'Transformez une photo ou un visuel en tableau. Choisissez le format qui convient à votre espace.',
    mode: 'direct',
    prix: 15000,
    images: [],
    caracteristiques: [
      { label: 'Support', valeur: 'Toile imprimée' },
      { label: 'Personnalisation', valeur: 'Photo ou visuel au choix' }
    ],
    options: { texte: 'Légende (facultatif)', couleurs: [], formats: ['30 × 40 cm', '40 × 60 cm', '50 × 70 cm'] },
    delai: null
  },
  {
    id: 3,
    nom: 'Cartes de visite',
    categorie: 'impression',
    description: 'Cartes imprimées sur papier épais, avec votre identité.',
    details: 'Des cartes de visite à votre image, imprimées sur un papier de qualité. La quantité et la finition sont précisées dans votre demande.',
    mode: 'devis',
    prix: null,
    images: [],
    caracteristiques: [
      { label: 'Support', valeur: 'Papier épais' },
      { label: 'Quantité', valeur: 'À préciser dans la demande' }
    ],
    options: { texte: null, couleurs: [], formats: [] },
    delai: null
  },
  {
    id: 4,
    nom: 'Bouteille personnalisée',
    categorie: 'personnalisation',
    description: 'Une bouteille avec votre texte ou votre logo.',
    details: 'Une bouteille réutilisable personnalisée avec votre prénom, un message ou votre logo. Idéale en cadeau ou pour un événement.',
    mode: 'direct',
    prix: 8000,
    images: [],
    caracteristiques: [
      { label: 'Personnalisation', valeur: 'Texte ou logo' },
      { label: 'Usage', valeur: 'Cadeau, événement, quotidien' }
    ],
    options: { texte: 'Texte à imprimer', couleurs: ['Noir', 'Blanc', 'Beige'], formats: [] },
    delai: null
  },
  {
    id: 5,
    nom: 'Tote bag personnalisé',
    categorie: 'personnalisation',
    description: 'Un sac en tissu avec le visuel de votre choix.',
    details: 'Un tote bag en tissu avec votre texte ou votre visuel. Pratique, durable et facile à offrir.',
    mode: 'direct',
    prix: 6000,
    images: [],
    caracteristiques: [
      { label: 'Matière', valeur: 'Tissu' },
      { label: 'Personnalisation', valeur: 'Texte ou visuel' }
    ],
    options: { texte: 'Texte à imprimer', couleurs: ['Écru', 'Noir'], formats: [] },
    delai: null
  },
  {
    id: 6,
    nom: 'Packaging sur mesure',
    categorie: 'personnalisation',
    description: 'Coffrets et emballages conçus pour votre produit.',
    details: 'Des coffrets et emballages pensés pour mettre votre produit en valeur. Dimensions, matière et finition sont définies avec vous.',
    mode: 'devis',
    prix: null,
    images: [],
    caracteristiques: [
      { label: 'Dimensions', valeur: 'Sur mesure' },
      { label: 'Finition', valeur: 'À définir ensemble' }
    ],
    options: { texte: null, couleurs: [], formats: [] },
    delai: null
  },
  {
    id: 7,
    nom: 'Montre',
    categorie: 'accessoires',
    description: 'Une montre élégante, pour affirmer votre style.',
    details: 'Une montre au style sobre et raffiné, pour compléter vos tenues au quotidien ou lors d\'une occasion spéciale.',
    mode: 'direct',
    prix: 25000,
    images: [],
    caracteristiques: [
      { label: 'Style', valeur: 'Sobre et élégant' }
    ],
    options: { texte: null, couleurs: ['Noir', 'Doré'], formats: [] },
    delai: null
  },
  {
    id: 8,
    nom: 'Boutons de manchette',
    categorie: 'accessoires',
    description: 'Une paire de boutons de manchette raffinée.',
    details: 'Une paire de boutons de manchette pour sublimer une chemise. Un beau cadeau.',
    mode: 'direct',
    prix: 12000,
    images: [],
    caracteristiques: [
      { label: 'Contenu', valeur: 'Une paire' }
    ],
    options: { texte: null, couleurs: [], formats: [] },
    delai: null
  },
  {
    id: 9,
    nom: 'Identité visuelle',
    categorie: 'branding',
    description: 'Logo, couleurs et supports de marque pour votre entreprise.',
    details: 'Création ou refonte de votre identité de marque : logo, couleurs, typographies et supports. Parlez-nous de votre projet.',
    mode: 'devis',
    prix: null,
    images: [],
    caracteristiques: [
      { label: 'Prestation', valeur: 'Logo, charte, supports' },
      { label: 'Pour', valeur: 'Entreprises et événements' }
    ],
    options: { texte: null, couleurs: [], formats: [] },
    delai: null
  },
  {
    id: 10,
    nom: 'Pochettes pour mariage',
    categorie: 'branding',
    description: 'Sacs et pochettes personnalisés pour vos invités.',
    details: 'Des sacs et pochettes personnalisés pour vos invités, avec vos noms, une date ou un motif. Quantité et style à préciser.',
    mode: 'devis',
    prix: null,
    images: [],
    caracteristiques: [
      { label: 'Usage', valeur: 'Mariages et événements' },
      { label: 'Personnalisation', valeur: 'Noms, date, motif' }
    ],
    options: { texte: null, couleurs: [], formats: [] },
    delai: null
  }
];

/* Formate un prix en FCFA : 15000 → "15 000 FCFA" */
function formatPrix(n) {
  return new Intl.NumberFormat('fr-FR').format(n).replace(/\u202f|\u00a0/g, ' ') + ' FCFA';
}
