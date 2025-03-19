#!/bin/sh

# Affichage des informations de démarrage
echo "*******************************************************"
echo "        DÉMARRAGE DE CALENDRIER PRODIGE"
echo "*******************************************************"

# Vérification de l'environnement
echo "Démarrage dans l'environnement: ${NODE_ENV:-développement}"
echo "Port: ${PORT:-5000}"

# Vérification de la connexion MongoDB
if [ -z "$MONGODB_URI" ]; then
  echo "ATTENTION: Variable MONGODB_URI non définie!"
  echo "L'application fonctionnera en mode dégradé sans base de données."
else
  echo "Connexion MongoDB: $MONGODB_URI" | sed 's/mongodb:\/\/[^:]*:[^@]*@/mongodb:\/\/***:***@/'
fi

# Vérification du JWT
if [ -z "$JWT_SECRET" ]; then
  echo "ATTENTION: JWT_SECRET non défini! Utilisation d'une valeur par défaut non sécurisée pour le développement."
fi

echo "Logs du serveur :"
echo "*******************************************************"

# Vérifier que le dossier backend existe
if [ ! -d "/app/backend" ]; then
  echo "ERREUR CRITIQUE: Dossier backend introuvable!"
  echo "Contenu du dossier /app:"
  ls -la /app
  exit 1
fi

# Vérifier que le script server.js existe
if [ ! -f "/app/backend/server.js" ]; then
  echo "ERREUR CRITIQUE: Fichier server.js introuvable!"
  echo "Contenu du dossier backend:"
  ls -la /app/backend
  exit 1
fi

# Démarrage du serveur avec un timeout long pour assurer que le healthcheck fonctionne
NODE_OPTIONS=--max-old-space-size=512 node backend/server.js 