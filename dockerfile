# Étape 1: Build du frontend
FROM node:14-alpine AS frontend-build

WORKDIR /app/frontend

# Copier les fichiers du frontend
COPY frontend/package.json frontend/fix-ajv.js frontend/fix-and-build.sh ./

# Rendre le script exécutable
RUN chmod +x fix-and-build.sh

# Copier le reste des fichiers frontend
COPY frontend/ ./

# Construire le frontend avec notre script qui corrige ajv
RUN ./fix-and-build.sh

# Étape 2: Setup du backend
FROM node:18-alpine

WORKDIR /app

# Copier le backend et les fichiers racine
COPY backend/ ./backend/
COPY package*.json start.sh ./

# Rendre le script de démarrage exécutable
RUN chmod +x start.sh

# Installer les dépendances du backend
RUN npm install

# Copier le build du frontend depuis l'étape précédente
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=5000

# Exposer le port
EXPOSE 5000

# Démarrer l'application avec notre script
CMD ["./start.sh"]
