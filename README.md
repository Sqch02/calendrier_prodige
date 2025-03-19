# Calendrier Prodige

Application de calendrier partagé pour entreprise, avec gestion des événements et des utilisateurs.

## Fonctionnalités

- Affichage du calendrier par mois/semaine
- Création, modification et suppression d'événements
- Assignation d'événements à des utilisateurs
- Gestion des clients et des statuts

## Configuration technique

### Prérequis

- Node.js v18 ou supérieur
- MongoDB
- npm ou yarn

### Variables d'environnement

Copier le fichier `.env.example` en `.env` et ajuster les valeurs selon votre environnement :

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://votre_url_mongodb/calendrier_prodige
JWT_SECRET=votre_secret_jwt
JWT_EXPIRE=7d
CORS_ORIGIN=*
```

## Installation et exécution locale

1. Cloner le dépôt
2. Installer les dépendances du backend
   ```
   npm install
   ```
3. Installer les dépendances du frontend
   ```
   cd frontend && npm install
   ```
4. Construire le frontend
   ```
   cd frontend && ./fix-and-build.sh
   ```
5. Démarrer le serveur
   ```
   npm start
   ```

## Déploiement sur Railway

1. Créer un compte sur [Railway](https://railway.app/)
2. Installer la CLI Railway
   ```
   npm i -g @railway/cli
   ```
3. Se connecter à Railway
   ```
   railway login
   ```
4. Initialiser le projet
   ```
   railway init
   ```
5. Ajouter le service MongoDB
   ```
   railway add
   ```
   Sélectionner "MongoDB" dans la liste des services
   
6. Configurer les variables d'environnement
   ```
   railway variables set PORT=5000 NODE_ENV=production JWT_SECRET=votre_secret_jwt JWT_EXPIRE=7d CORS_ORIGIN="*"
   ```
   
7. Déployer l'application
   ```
   railway up
   ```

8. Ouvrir l'application
   ```
   railway open
   ```

## Structure du projet

- `/backend` - Serveur Express.js et logique métier
- `/frontend` - Interface utilisateur React
- `/docs` - Documentation (le cas échéant)

## Licence

MIT 