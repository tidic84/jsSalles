# Salles Libres

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## Description

jsSalles est une application web permettant de trouver des salles libres dans l'université d'avignon (centre, ceri et agroscience). Le fonctionnement est tout simple. Je récupère les calandriers des salles et je regarde quand est ce qu'elle est libre et occupée.

## Fonctionnalités

### Consultation en temps réel
- Visualisez instantanément les salles libres et occupées
- Sachez quand une salle occupée sera libre
- Consultez la disponibilité pour différentes dates et heures

## Installation

### Prérequis

- **Node.js** (version 18 ou supérieure)
- **npm** (version 9 ou supérieure)
- **PostgreSQL** (version 12 ou supérieure)

### Étapes d'installation

1. **Clonez le dépôt** :
   ```bash
   git clone https://github.com/tidic84/jsSalles.git
   cd jsSallesNext
   ```

2. **Installez les dépendances** :
   ```bash
   npm install
   ```

3. **Configurez les variables d'environnement** :
   
   Créez un fichier `.env.local` à la racine du projet :
   ```env
   DB_USER=your_database_user
   DB_HOST=your_database_host
   DB_NAME=your_database_name
   DB_PASSWORD=your_database_password
   DB_PORT=5432
   ```

4. **Configurez la base de données** :
   
   Créez la table des salles :
   ```sql
   CREATE TABLE rooms (
       id SERIAL PRIMARY KEY,
       univ VARCHAR(50) NOT NULL,
       room_name VARCHAR(100) NOT NULL,
       room_url TEXT NOT NULL
   );
   ```

5. **Lancez en mode développement** :
   ```bash
   npm run dev
   ```

6. **Accédez à l'application** :
   
   Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur

## Structure du projet

```
src/
├── app/
│   ├── actions.js          # Server Actions (API Logic)
│   ├── db.js              # Configuration base de données
│   ├── layout.js          # Layout principal
│   ├── page.js            # Page d'accueil
│   ├── globals.css        # Styles globaux
│   ├── components/
│   │   └── UniversityPage.js  # Composant université
│   └── univ/
│       └── [univ]/
│           └── page.js    # Page dynamique université
├── public/               # Assets statiques
└── ...
```

## Utilisation

### Navigation

1. **Page d'accueil** : `/` - Liste des universités disponibles
2. **Page université** : `/univ/[nom_université]` - Détail des salles par université
3. **Page salle** : `/room/[nom_salle]` - Détail d'une salle spécifique (à implémenter)

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request


## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.