#!/bin/bash

echo "🚀 Correction rapide pour le build Docker..."

# Vérifier si le script de correction existe
if [ ! -f "fix-ajv-direct.js" ]; then
  echo "❌ Le fichier fix-ajv-direct.js n'existe pas."
  exit 1
fi

# Créer le Dockerfile
echo "📝 Création du Dockerfile..."
cat > Dockerfile << 'EOF'
# Étape 1: Build du frontend
FROM node:14-alpine AS frontend-build

WORKDIR /app

# Copier le script de correction
COPY fix-ajv-direct.js ./

# Copier le frontend
COPY frontend/ ./frontend/

WORKDIR /app/frontend

# Installer les dépendances
RUN npm install --legacy-peer-deps --no-optional

# Exécuter le script de correction d'ajv (en passant le chemin vers node_modules)
RUN cd .. && node fix-ajv-direct.js ./frontend/node_modules

# Build du frontend
ENV DISABLE_ESLINT_PLUGIN=true
ENV CI=false
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build

# Étape 2: Setup du backend
FROM node:18-alpine

WORKDIR /app

# Copier le backend
COPY backend/ ./backend/
COPY package*.json ./

# Installer les dépendances du backend
RUN npm install

# Copier le build du frontend depuis l'étape précédente
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=5000

# Exposer le port
EXPOSE 5000

# Démarrer l'application
CMD ["node", "backend/server.js"]
EOF

echo "✅ Dockerfile créé avec succès"

# Construire l'image
echo "🏗️ Construction de l'image Docker..."
docker build -t calendrier-prodige .

# Vérifier si la construction a réussi
if [ $? -eq 0 ]; then
  echo "✅ Construction de l'image Docker réussie!"
  echo "🧪 Voulez-vous exécuter l'image en local pour tester? (o/n)"
  read -r response
  if [[ "$response" =~ ^([oO][uU][iI]|[oO])$ ]]; then
    echo "🚀 Lancement du conteneur..."
    docker run -d -p 5000:5000 --name calendrier-test calendrier-prodige
    echo "✅ L'application est accessible sur http://localhost:5000"
  fi
else
  echo "❌ Échec de la construction de l'image Docker"
fi 