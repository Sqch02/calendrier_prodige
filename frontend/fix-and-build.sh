#!/bin/bash

echo "🚀 Nettoyage et préparation pour le build..."

# Nettoyer package.json des overrides et resolutions
grep -v "overrides" package.json | grep -v "resolutions" > package.json.clean
mv package.json.clean package.json
echo "✅ package.json nettoyé"

# Installer les dépendances avec des versions spécifiques
echo "📦 Installation des dépendances compatibles..."
npm install ajv@6.12.6 ajv-keywords@3.5.2 --save-exact

# Exécuter le script de correction d'ajv
echo "🔧 Correction des fichiers ajv..."
node fix-ajv.js

# Lancer le build avec l'option de compatibilité OpenSSL
echo "🏗️ Lancement du build..."
NODE_OPTIONS=--openssl-legacy-provider npm run build

echo "✅ Processus terminé ! Vérifiez le dossier 'build' pour les fichiers générés." 