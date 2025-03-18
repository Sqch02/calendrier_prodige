#!/bin/bash

# Ce script permet de démarrer l'application en environnement de développement

# S'assurer que les répertoires existent
node ensure-directories.js

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
  echo "Installation des dépendances du backend..."
  npm install
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "Installation des dépendances du frontend..."
  cd frontend
  npm install
  cd ..
fi

# Démarrer l'application en mode développement
echo "Démarrage de l'application en mode développement..."
npm run dev
