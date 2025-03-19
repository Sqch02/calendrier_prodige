#!/bin/bash

# Supprimer les dossiers node_modules et le cache
rm -rf node_modules
rm -rf .cache
rm -rf build

# Nettoyer le cache npm
npm cache clean --force

# Réinstaller les dépendances
npm install

# Essayer de construire avec Node.js 16 si disponible via nvm
if command -v nvm &> /dev/null; then
  echo "nvm détecté, utilisation de Node.js 16 pour le build"
  nvm use 16 || nvm install 16
  NODE_OPTIONS=--openssl-legacy-provider npm run build:legacy
else
  # Sinon, utiliser les options de compatibilité
  NODE_OPTIONS=--openssl-legacy-provider npm run build:legacy
fi 