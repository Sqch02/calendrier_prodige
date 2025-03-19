# Calendrier Prodige

Une application de calendrier partagé pour entreprises, avec gestion des événements, des clients et des utilisateurs.

## Technologies utilisées

- Frontend: React, date-fns, Axios
- Backend: Node.js, Express, MongoDB avec Mongoose
- Authentification: JWT, bcrypt

## Fonctionnalités

- Affichage des événements par mois
- Création, modification et suppression d'événements
- Filtrage des événements par mois et année
- Authentification et gestion des utilisateurs
- Base de données MongoDB pour le stockage persistant

## Installation

### Prérequis

- Node.js 18+
- MongoDB (local ou distant)

### Installation locale

1. Cloner le dépôt
```
git clone https://github.com/votre-utilisateur/calendrier_prodige.git
cd calendrier_prodige
```

2. Installer les dépendances
```
npm install
cd frontend && npm install
```

3. Configurer les variables d'environnement
Créer un fichier `.env` à la racine du projet avec le contenu suivant:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/calendar-app
JWT_SECRET=votre_secret_jwt
JWT_EXPIRE=7d
CORS_ORIGIN=*
```

4. Lancer l'application en développement
```
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

L'application sera accessible sur http://localhost:3000

## Déploiement avec Docker

1. Construire l'image Docker
```
docker build -t calendrier-prodige .
```

2. Lancer le conteneur
```
docker run -p 5000:5000 -e MONGODB_URI=votre_uri_mongodb calendrier-prodige
```

## Déploiement sur Railway

1. Créer un nouveau projet sur Railway
2. Connecter le dépôt Git
3. Ajouter un service MongoDB
4. Configurer les variables d'environnement:
   - NODE_ENV=production
   - MONGODB_URI=(URI fournie par Railway)
   - JWT_SECRET=(votre secret)
   - PORT=5000

## Crédits

Développé par Prodige - 2025 