-- DIOREA GROUP : schéma PostgreSQL

CREATE TABLE admins (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE produits (
  id               SERIAL PRIMARY KEY,
  nom              TEXT NOT NULL,
  categorie        TEXT NOT NULL
                   CHECK (categorie IN ('impression', 'personnalisation', 'accessoires', 'branding')),
  description      TEXT NOT NULL,
  details          TEXT NOT NULL DEFAULT '',
  mode             TEXT NOT NULL CHECK (mode IN ('direct', 'devis')),
  prix             INTEGER CHECK (prix > 0),
  stock            INTEGER CHECK (stock >= 0),
  statut           TEXT NOT NULL DEFAULT 'publie' CHECK (statut IN ('publie', 'brouillon')),
  images           JSONB NOT NULL DEFAULT '[]',
  options          JSONB NOT NULL DEFAULT '{"couleurs":[],"formats":[]}',
  perso            JSONB NOT NULL DEFAULT '{"actif":false,"libelle":"","supplement":0,"instructions":""}',
  caracteristiques JSONB NOT NULL DEFAULT '[]',
  delai            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Le mode de vente décide si le prix et le stock existent
  CONSTRAINT coherence_mode CHECK (
    (mode = 'direct' AND prix IS NOT NULL AND stock IS NOT NULL)
    OR (mode = 'devis' AND prix IS NULL AND stock IS NULL)
  )
);
CREATE INDEX idx_produits_statut ON produits (statut);
CREATE INDEX idx_produits_categorie ON produits (categorie);

CREATE TABLE commandes (
  id            SERIAL PRIMARY KEY,
  client_nom    TEXT NOT NULL,
  client_tel    TEXT NOT NULL,
  client_email  TEXT,
  adresse       TEXT NOT NULL,
  note          TEXT,
  statut        TEXT NOT NULL DEFAULT 'attente'
                CHECK (statut IN ('attente', 'preparation', 'livree', 'annulee')),
  paiement      TEXT NOT NULL DEFAULT 'a_payer' CHECK (paiement IN ('a_payer', 'paye')),
  total         INTEGER NOT NULL CHECK (total >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_commandes_statut ON commandes (statut, created_at DESC);

CREATE TABLE commande_lignes (
  id             SERIAL PRIMARY KEY,
  commande_id    INTEGER NOT NULL REFERENCES commandes (id) ON DELETE CASCADE,
  produit_id     INTEGER REFERENCES produits (id) ON DELETE SET NULL,
  nom_produit    TEXT NOT NULL,            -- copie du nom au moment de l'achat
  prix_unitaire  INTEGER NOT NULL CHECK (prix_unitaire >= 0),
  quantite       INTEGER NOT NULL CHECK (quantite > 0),
  options        JSONB NOT NULL DEFAULT '{}'
);
CREATE INDEX idx_lignes_commande ON commande_lignes (commande_id);

CREATE TABLE devis (
  id             SERIAL PRIMARY KEY,
  nom            TEXT NOT NULL,
  contact_tel    TEXT,
  contact_email  TEXT,
  produit_id     INTEGER REFERENCES produits (id) ON DELETE SET NULL,
  produit_libre  TEXT,                     -- si « Autre projet »
  quantite       INTEGER NOT NULL CHECK (quantite > 0),
  dimensions     TEXT,
  description    TEXT NOT NULL,
  options        JSONB NOT NULL DEFAULT '[]',
  budget         TEXT,
  echeance       DATE,
  fichier_url    TEXT,
  statut         TEXT NOT NULL DEFAULT 'nouveau'
                 CHECK (statut IN ('nouveau', 'etude', 'envoye', 'accepte', 'refuse')),
  note_interne   TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT devis_contact CHECK (contact_tel IS NOT NULL OR contact_email IS NOT NULL)
);
CREATE INDEX idx_devis_statut ON devis (statut, created_at DESC);