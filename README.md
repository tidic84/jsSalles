# 🎓 jsSalles

Application web pour consulter la disponibilité des salles de l'Université d'Avignon en temps réel.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)

## ✨ Fonctionnalités

- 🔍 **Consultation des salles libres** - Visualisation en temps réel des salles disponibles par campus
- 📅 **Planification horaire** - Sélection d'une date et heure spécifique pour planifier à l'avance
- 📱 **Interface responsive** - Design adapté mobile et desktop avec shadcn/ui
- 🔐 **Panneau d'administration** - Gestion des salles et statistiques de visites
- 📊 **Statistiques** - Suivi des visites journalières
- 🗺️ **Multi-campus** - Support de plusieurs sites (CERI, Agroscience, Avignon-Centre)

## 🚀 Stack Technique

- **Framework** : [Next.js 16](https://nextjs.org/) (App Router)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Base de données** : [PostgreSQL](https://www.postgresql.org/)
- **UI** : [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS 4](https://tailwindcss.com/)
- **Authentification** : [iron-session](https://github.com/vvo/iron-session)
- **Charts** : [Recharts](https://recharts.org/)

## 📦 Installation

### Prérequis

- Node.js 20+
- PostgreSQL 15+
- npm ou yarn

### Étapes

1. **Cloner le repository**

```bash
git clone https://github.com/votre-org/jssalles.git
cd jssalles
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer la base de données**

```bash
# Créer les tables
psql -U $DB_USER -d $DB_NAME -f db/init.sql
```

4. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine :

```env
# Base de données
DB_USER=votre_utilisateur
DB_HOST=localhost
DB_NAME=jssalles
DB_PASSWORD=votre_mot_de_passe
DB_PORT=5432

# Session (générer une clé sécurisée)
SESSION_SECRET=votre_cle_secrete_de_32_caracteres_min
```

5. **Lancer le serveur de développement**

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

## 🏗️ Structure du projet

```
jssalles/
├── src/
│   ├── app/                 # Routes Next.js (App Router)
│   │   ├── api/            # API Routes
│   │   │   ├── auth/       # Authentification (login/logout)
│   │   │   ├── admin/      # Endpoints admin (rooms, stats)
│   │   │   └── rooms/      # API des salles libres
│   │   ├── admin/          # Page admin
│   │   ├── login/          # Page de connexion
│   │   ├── univ/[univ]/    # Page des salles par université
│   │   └── layout.tsx      # Layout principal
│   ├── components/          # Composants React
│   │   ├── ui/             # Composants shadcn/ui
│   │   ├── room-list.tsx   # Liste des salles
│   │   ├── room-dashboard.tsx
│   │   └── navbar.tsx
│   └── lib/                 # Utilitaires
│       ├── db.ts           # Connexion PostgreSQL
│       ├── queries.ts      # Requêtes SQL
│       └── room-utils.ts   # Logique métier des salles
├── db/                      # Scripts SQL
│   ├── init.sql            # Schéma de la BDD
│   └── sample_data.sql     # Données d'exemple
└── public/                  # Assets statiques
```

## 📝 Configuration des salles

Les salles sont configurées dans la table `rooms` avec leur URL de calendrier ICS (format iCalendar) :

```sql
INSERT INTO rooms (univ, room_name, room_url) VALUES
('ceri', 'Amphi Blaise', 'https://.../amphi_blaise.ics');
```

### Campuses supportés

- `ceri` - CERI (Centre d'Enseignement et de Recherche en Informatique)
- `agroscience` - Agroscience
- `avignon-centre` - Avignon Centre

## 🔐 Administration

### Créer un compte administrateur

1. Générer un hash du mot de passe via l'endpoint :

```bash
curl http://localhost:3000/api/admin/hash?password=votre_mot_de_passe
```

2. Insérer l'utilisateur en base :

```sql
INSERT INTO users (username, password) 
VALUES ('admin', 'hash_généré');
```

### Fonctionnalités admin

- Gestion des salles (ajout, modification, suppression)
- Vérification des URLs de calendriers
- Statistiques de visites journalières

## 🚀 Déploiement

### Build de production

```bash
npm run build
npm start
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<p align="center">
  Développé avec ❤️ pour les étudiants de l'Université d'Avignon
</p>
