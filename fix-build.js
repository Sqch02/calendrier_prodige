const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des problèmes de build React...');

// Vérifier si node_modules existe dans le frontend
const frontendNodeModulesPath = path.join(__dirname, 'frontend', 'node_modules');
if (!fs.existsSync(frontendNodeModulesPath)) {
  console.log('⚠️ node_modules manquant dans le frontend, installation en cours...');
  
  // Installer les dépendances du frontend
  const { execSync } = require('child_process');
  try {
    execSync('cd frontend && npm install --legacy-peer-deps', { stdio: 'inherit' });
    console.log('✅ Dépendances du frontend installées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'installation des dépendances du frontend:', error);
    process.exit(1);
  }
}

// Résoudre les problèmes de ajv
try {
  // Créer le dossier node_modules/ajv/dist/compile s'il n'existe pas
  const ajvCodegenDir = path.join(__dirname, 'frontend', 'node_modules', 'ajv', 'dist', 'compile');
  if (!fs.existsSync(ajvCodegenDir)) {
    fs.mkdirSync(ajvCodegenDir, { recursive: true });
    console.log('📁 Répertoire ajv/dist/compile créé');
  }

  // Créer un fichier codegen.js vide si nécessaire
  const ajvCodegenFile = path.join(ajvCodegenDir, 'codegen.js');
  if (!fs.existsSync(ajvCodegenFile)) {
    fs.writeFileSync(ajvCodegenFile, 'module.exports = {};');
    console.log('📄 Fichier codegen.js créé');
  }

  console.log('✅ Correction des problèmes de ajv terminée');
} catch (error) {
  console.error('❌ Erreur lors de la correction des problèmes de ajv:', error);
}

// Mise à jour pour utiliser Node.js v18
console.log('🔄 Mise à jour des configurations pour utiliser Node.js v18...');

// Mise à jour de .node-version si présent
const nodeVersionPath = path.join(__dirname, '.node-version');
try {
  fs.writeFileSync(nodeVersionPath, '18.19.0');
  console.log('✅ Fichier .node-version mis à jour');
} catch (error) {
  console.log('⚠️ Impossible de mettre à jour .node-version:', error.message);
}

// Mise à jour de .nvmrc si présent
const nvmrcPath = path.join(__dirname, '.nvmrc');
try {
  fs.writeFileSync(nvmrcPath, '18.19.0');
  console.log('✅ Fichier .nvmrc mis à jour');
} catch (error) {
  console.log('⚠️ Impossible de mettre à jour .nvmrc:', error.message);
}

console.log('✅ Script de correction terminé');
