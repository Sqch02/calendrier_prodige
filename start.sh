#!/bin/sh

# Affichage des informations de démarrage
echo "*******************************************************"
echo "        DÉMARRAGE DE CALENDRIER PRODIGE"
echo "*******************************************************"

# Vérification de l'environnement
echo "Environnement: $NODE_ENV"
echo "Port: $PORT"

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

echo "Démarrage du serveur Node.js..."
echo "*******************************************************"

# Démarrage du serveur
node backend/server.js 