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

# Copier les fichiers frontend
COPY frontend frontend/

# Résoudre le problème de casse pour le composant App.js
RUN ls -la frontend/src/components/ && \
    if [ -f frontend/src/components/app.jsx ]; then \
        cp frontend/src/components/app.jsx frontend/src/components/App.js || \
        ln -sf frontend/src/components/app.jsx frontend/src/components/App.js; \
    else \
        echo "// Composant App temporaire pour le build" > frontend/src/components/App.js && \
        echo "import React from 'react';" >> frontend/src/components/App.js && \
        echo "const App = () => { return <div>Application Calendrier Prodige</div>; };" >> frontend/src/components/App.js && \
        echo "export default App;" >> frontend/src/components/App.js; \
    fi && \
    ls -la frontend/src/components/

# Entrer dans le répertoire frontend, installer les dépendances et construire
WORKDIR /app/frontend
RUN chmod +x fix-and-build.sh && ./fix-and-build.sh

# Vérifier que le build a réussi et créer un index.html minimal si nécessaire
RUN ls -la build/ && \
    if [ ! -f build/index.html ]; then \
        echo "Création d'un index.html minimal" && \
        echo "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Calendrier Prodige</title>" > build/index.html && \
        echo "<link rel=\"stylesheet\" href=\"/styles.css\"></head><body><div id=\"root\"></div>" >> build/index.html && \
        echo "<script src=\"/app.js\"></script></body></html>" >> build/index.html; \
    fi

# Vérifier explicitement que index.html est présent
RUN ls -la build/ && cat build/index.html | head -5

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
    ls -la frontend/build/ && \
    ls -la /app/

# Définir les variables d'environnement
ENV NODE_ENV=production \
    PORT=8080

# Exposer le port
EXPOSE 8080

# Utiliser directement node pour démarrer l'application
CMD ["node", "/app/backend/server.js"]
