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

# Vérifier que le build a réussi
RUN ls -la build || (echo "Le build du frontend a échoué!" && exit 1)

# Étape 2: Setup du backend
FROM node:18-alpine as builder

# Installer les outils de build
RUN apk add --no-cache python3 make g++

# Définir le répertoire de travail pour la phase de build
WORKDIR /app

# Copier les fichiers de package et installer les dépendances
COPY package.json ./
# Utiliser npm install qui est plus tolérant que npm ci
RUN npm install

# Copier le code source
COPY . .

# Créer un script de correction et de build pour le frontend
RUN echo '#!/bin/sh\necho "Correction des fichiers ajv..."\nfind node_modules/ajv -name "*.js" -exec sed -i "s/require(\(\\x27\\|\"\\)ajv\\(\\x27\\|\"\\))/require(\1./ajv\2)/" {} \\;\necho "Construction du frontend..."\nnpm run build' > /app/fix-and-build.sh && chmod +x /app/fix-and-build.sh

# Construire le frontend
RUN /app/fix-and-build.sh

FROM node:18-alpine

# Définir le répertoire de travail pour la phase finale
WORKDIR /app

# Copier les fichiers de package et installer les dépendances de production seulement
COPY package.json ./
# Utiliser npm install qui ne nécessite pas package-lock.json
RUN npm install --omit=dev

# Copier le build du frontend à partir de la phase précédente
COPY --from=builder /app/build ./build

# Copier EXPLICITEMENT les fichiers backend
COPY backend backend/

# S'assurer que les répertoires et fichiers critiques existent avec la bonne casse
RUN mkdir -p backend/models && \
    if [ -f backend/models/event.js ]; then cp backend/models/event.js backend/models/Event.js; fi && \
    if [ -f backend/models/user.js ]; then cp backend/models/user.js backend/models/User.js; fi && \
    ls -la backend/models/

# S'assurer que les fichiers de routes existent avec la bonne casse
RUN mkdir -p backend/routes && \
    if [ -f backend/routes/eventroutes.js ]; then cp backend/routes/eventroutes.js backend/routes/eventRoutes.js; fi && \
    if [ -f backend/routes/userroutes.js ]; then cp backend/routes/userroutes.js backend/routes/userRoutes.js; fi && \
    ls -la backend/routes/

# Copier les fichiers de configuration
COPY .env* ./

# Créer un script de démarrage pour gérer les variables d'environnement
RUN echo '#!/bin/sh\necho "Démarrage du serveur Node.js..."\necho "MONGODB_URI=$MONGODB_URI"\necho "JWT_SECRET=${JWT_SECRET:0:3}..."\necho "NODE_ENV=$NODE_ENV"\nnode backend/server.js' > /app/start.sh && chmod +x /app/start.sh

# Définir les variables d'environnement
ENV NODE_ENV=production \
    PORT=8080

# Vérifier la présence des fichiers critiques avant de lancer l'application
RUN echo "Vérification de la structure des fichiers..." && \
    ls -la backend/models/ && \
    ls -la backend/routes/ && \
    ls -la build/

# Exposer le port
EXPOSE 8080

# Démarrer le serveur
CMD ["/app/start.sh"]
