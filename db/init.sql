-- ===========================================
-- Script d'initialisation de la base de données
-- jsSalles - Application de gestion des salles
-- ===========================================

-- Création de la table des utilisateurs (administrateurs)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des salles
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    univ VARCHAR(100) NOT NULL,
    room_name VARCHAR(255) NOT NULL,
    room_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des visites totales (toutes les pages vues)
CREATE TABLE IF NOT EXISTS visites (
    id SERIAL PRIMARY KEY,
    visites_jour DATE NOT NULL UNIQUE,
    visites INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des visites par utilisateur unique
CREATE TABLE IF NOT EXISTS visitesparutilisateur (
    id SERIAL PRIMARY KEY,
    visites_jour DATE NOT NULL UNIQUE,
    visites INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_rooms_univ ON rooms(univ);
CREATE INDEX IF NOT EXISTS idx_visites_jour ON visites(visites_jour);
CREATE INDEX IF NOT EXISTS idx_visitesparutilisateur_jour ON visitesparutilisateur(visites_jour);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ===========================================
-- Notes d'utilisation :
--
-- Variables d'environnement requises (.env) :
-- DB_USER=votre_utilisateur
-- DB_HOST=votre_host
-- DB_NAME=votre_base
-- DB_PASSWORD=votre_mot_de_passe
-- DB_PORT=5432
--
-- Exécution :
-- psql -U $DB_USER -d $DB_NAME -f db/init.sql
-- ===========================================
