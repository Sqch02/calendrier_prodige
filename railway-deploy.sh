#!/bin/bash

echo "🚂 Préparation du déploiement sur Railway..."

# Vérifier si railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo "⚠️ Railway CLI n'est pas installé. Installation en cours..."
    npm install -g @railway/cli
fi

# Se connecter à Railway si nécessaire
if ! railway whoami &> /dev/null; then
    echo "🔑 Veuillez vous connecter à votre compte Railway..."
    railway login
fi

# Préparer l'environnement
echo "🔧 Préparation des variables d'environnement pour la production..."
cat > .env.production << EOF
NODE_ENV=production
PORT=5000
JWT_SECRET=prodige_secret_key_$(date +%s)
JWT_EXPIRE=7d
CORS_ORIGIN=*
# La variable MONGODB_URI sera fournie par Railway
EOF

# Construction de l'image Docker
echo "🏗️ Construction de l'image Docker..."
docker build -t calendrier-prodige .

# Déploiement sur Railway
echo "🚀 Déploiement sur Railway..."
railway up

echo "✅ Déploiement terminé ! Votre application devrait être accessible dans quelques minutes."
echo "🌐 Vous pouvez vérifier le statut de votre déploiement en visitant https://railway.app/dashboard" 