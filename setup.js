const fs = require('fs');
const path = require('path');

console.log('🔧 Configuration de l\'application...');

// Créer les répertoires nécessaires
const directories = [
  'frontend/public',
  'backend'
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Répertoire créé: ${dir}`);
  } else {
    console.log(`✅ Répertoire existe déjà: ${dir}`);
  }
});

// Vérifier si les fichiers essentiels existent
const essentialFiles = [
  'frontend/public/index.html',
  'frontend/public/styles.css',
  'frontend/public/app.js',
  'backend/server.js'
];

essentialFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Fichier manquant: ${file}`);
  } else {
    console.log(`✅ Fichier existe: ${file}`);
  }
});

console.log('✅ Configuration terminée');
