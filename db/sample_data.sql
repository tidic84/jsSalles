-- ===========================================
-- Données d'exemple pour jsSalles
-- ===========================================

-- Insertion des salles du CERI
INSERT INTO rooms (univ, room_name, room_url) VALUES
('ceri', 'Salle 001', 'https://example.com/ics/ceri/salle001.ics'),
('ceri', 'Salle 002', 'https://example.com/ics/ceri/salle002.ics'),
('ceri', 'Salle 003', 'https://example.com/ics/ceri/salle003.ics'),
('ceri', 'Amphi', 'https://example.com/ics/ceri/amphi.ics');

-- Insertion des salles AgriScience
INSERT INTO rooms (univ, room_name, room_url) VALUES
('agroscience', 'Salle A1', 'https://example.com/ics/agroscience/salleA1.ics'),
('agroscience', 'Salle A2', 'https://example.com/ics/agroscience/salleA2.ics'),
('agroscience', 'Labo 1', 'https://example.com/ics/agroscience/labo1.ics');

-- Insertion des salles Avignon Centre
INSERT INTO rooms (univ, room_name, room_url) VALUES
('avignon-centre', 'Salle 101', 'https://example.com/ics/avignon-centre/salle101.ics'),
('avignon-centre', 'Salle 102', 'https://example.com/ics/avignon-centre/salle102.ics'),
('avignon-centre', 'Salle 103', 'https://example.com/ics/avignon-centre/salle103.ics');

-- ===========================================
-- Note : Remplacez les URLs par les vraies URLs
-- des calendriers ICS de votre université
--
-- Pour créer un utilisateur admin, utilisez
-- l'endpoint /salles/hash pour générer le hash
-- du mot de passe, puis :
--
-- INSERT INTO users (username, password) VALUES
--     ('admin', 'votre_hash_bcrypt');
-- ===========================================
