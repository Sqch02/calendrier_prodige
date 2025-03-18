#!/bin/bash

# Script de déploiement pour l'application de calendrier partagé

echo "🚀 Début du déploiement..."

# 1. Vérification de la structure des dossiers
echo "📁 Vérification de la structure des dossiers..."
node ensure-directories.js

# 2. Installation des dépendances
echo "📦 Installation des dépendances du backend..."
npm install

echo "📦 Installation des dépendances du frontend..."
cd frontend
npm install
cd ..

# 3. Construction du frontend
echo "🏗️ Construction du frontend..."
cd frontend
npm run build
cd ..

# 4. Démarrage de l'application
echo "🌐 Démarrage de l'application..."
npm start

echo "✅ Déploiement terminé !"
