# Une seule étape pour simplifier
FROM node:18-alpine

# Installer les outils nécessaires
RUN apk add --no-cache python3 make g++ bash

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers backend, les fichiers de package et de configuration
COPY backend backend/
COPY package.json ./
COPY .env* ./

# Installer les dépendances du backend
RUN npm install

# Créer le script de démarrage
RUN echo '#!/bin/sh\necho "Démarrage du serveur Node.js..."\necho "MONGODB_URI=$MONGODB_URI"\necho "JWT_SECRET=${JWT_SECRET:0:3}..."\necho "NODE_ENV=$NODE_ENV"\nnode backend/server.js' > start.sh && chmod +x start.sh

# Copier les fichiers frontend
COPY frontend frontend/

# Entrer dans le répertoire frontend, installer les dépendances et construire
WORKDIR /app/frontend
RUN chmod +x fix-and-build.sh && ./fix-and-build.sh

# Vérifier que le build a réussi
RUN ls -la build || (echo "Le build du frontend a échoué!" && exit 1)

# Revenir au répertoire racine
WORKDIR /app

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

# Vérifier la présence des fichiers critiques
RUN echo "Vérification de la structure des fichiers..." && \
    ls -la backend/models/ && \
    ls -la backend/routes/ && \
    ls -la frontend/build/

# Définir les variables d'environnement
ENV NODE_ENV=production \
    PORT=8080

# Exposer le port
EXPOSE 8080

# Démarrer le serveur
CMD ["./start.sh"]
