# Étape 1: Build du frontend
FROM node:16-alpine AS frontend-build

WORKDIR /app/frontend

# Copier les fichiers du frontend
COPY frontend/package*.json ./
COPY frontend/clean-install.sh ./

# Installer les dépendances
RUN npm install --legacy-peer-deps

# Copier le code source du frontend
COPY frontend/ ./

# Désactiver Eslint pour le build
ENV DISABLE_ESLINT_PLUGIN=true
ENV CI=false
ENV NODE_OPTIONS=--openssl-legacy-provider

# Build du frontend
RUN npm run build:legacy

# Étape 2: Setup du backend
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers du backend
COPY package*.json ./
RUN npm install

# Copier le code source du backend
COPY backend/ ./backend/

# Copier le build du frontend depuis l'étape précédente
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=5000

# Exposer le port
EXPOSE 5000

# Démarrer l'application
CMD ["node", "backend/server.js"]