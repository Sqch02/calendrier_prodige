#!/bin/bash

echo "🚀 Préparation du déploiement de l'application..."

# Copier notre nouveau Dockerfile à la place de l'original
echo "🔄 Utilisation du Dockerfile optimisé..."
cp Dockerfile.new Dockerfile

# Construire l'image Docker
echo "🏗️ Construction de l'image Docker..."
docker build -t calendrier-prodige .

# Exécuter l'image localement pour tester
echo "🧪 Test de l'application en local..."
docker run -d -p 5000:5000 --name calendrier-test calendrier-prodige

echo "✅ Déploiement local terminé ! L'application devrait être accessible sur http://localhost:5000"
echo "📝 Pour arrêter le conteneur de test, exécutez: docker stop calendrier-test && docker rm calendrier-test"
echo "🌐 Pour déployer sur Railway, exécutez: ./railway-deploy.sh"
