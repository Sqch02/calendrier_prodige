const fs = require('fs');
const path = require('path');

// Fonction pour créer récursivement les répertoires
function createDirectoryStructure(basePath, structure) {
  // S'assurer que le chemin de base existe
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
    console.log(`Répertoire créé: ${basePath}`);
  }
  
  // Parcourir la structure et créer les sous-répertoires
  for (const dir of structure) {
    const fullPath = path.join(basePath, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Sous-répertoire créé: ${fullPath}`);
    }
  }
}

// Structure minimale requise pour que l'application fonctionne
const frontendDirs = [
  'public',
  'src',
  'src/components',
  'src/styles',
  'src/utils',
  'src/services'
];

const backendDirs = [
  'controllers',
  'models',
  'routes',
  'middleware'
];

// Créer les répertoires
createDirectoryStructure('frontend', frontendDirs);
createDirectoryStructure('backend', backendDirs);

console.log("Structure des répertoires complétée ✅");
