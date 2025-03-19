# Étape 1: Build du frontend
FROM node:14-alpine AS frontend-build

WORKDIR /app/frontend

# Copier les fichiers du frontend
COPY frontend/package*.json ./
COPY frontend/fix-ajv.js ./

# Nettoyer le package.json pour retirer les overrides problématiques
RUN cat package.json | grep -v "overrides" | grep -v "resolutions" > package.json.clean && \
    mv package.json.clean package.json

# Installer les dépendances avec des options de compatibilité
RUN npm install --legacy-peer-deps --no-optional

# Copier le code source du frontend
COPY frontend/ ./

# Désactiver Eslint pour le build
ENV DISABLE_ESLINT_PLUGIN=true
ENV CI=false
ENV NODE_OPTIONS=--openssl-legacy-provider

# Build du frontend avec le script qui inclut la correction d'ajv
RUN npm run build:docker

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