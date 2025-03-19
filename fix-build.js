const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des problèmes de build React...');

// Créer le fichier codegen.js s'il n'existe pas déjà
if (!fs.existsSync('./codegen.js')) {
  fs.writeFileSync('./codegen.js', `
// Correctif pour ajv

function Name(name) {
  if (!(this instanceof Name)) return new Name(name);
  this.str = name;
}

Name.prototype.toString = function() {
  return this.str;
};

Name.prototype.emptyStr = function() {
  return false;
};

// Exporter la fonction Name
exports.Name = Name;
`);
  console.log('📄 Fichier codegen.js créé');
}

// Trouver les fichiers ajv problématiques dans le node_modules
const frontendDir = path.join(__dirname, 'frontend');
const nodeModulesDir = path.join(frontendDir, 'node_modules');

// Fonction pour remplacer le contenu dans un fichier
function fixAjvFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      // Lire le contenu du fichier
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remplacer les importations problématiques
      const modified = content
        .replace(/require\("\.\/codegen"\)/g, 'require("../../../codegen")')
        .replace(/from "\.\/codegen"/g, 'from "../../../codegen"')
        .replace(/new\s+codegen_1\.Name\(/g, 'codegen_1.Name(')
        .replace(/new\s+_codegen\.Name\(/g, '_codegen.Name(');
      
      // Sauvegarder les modifications
      if (content !== modified) {
        fs.writeFileSync(filePath, modified);
        return true;
      }
    } catch (err) {
      console.error(`⚠️ Erreur lors de la correction du fichier ${filePath}:`, err);
    }
  }
  return false;
}

// Fichiers ajv problématiques
const ajvPaths = [
  path.join(nodeModulesDir, 'ajv', 'dist', 'compile', 'names.js'),
  path.join(nodeModulesDir, 'ajv', 'dist', 'compile', 'codegen.js'),
  path.join(nodeModulesDir, 'ajv', 'dist', 'compile', 'errors.js')
];

// Corriger les fichiers
let fixedCount = 0;
ajvPaths.forEach(filePath => {
  if (fixAjvFile(filePath)) {
    fixedCount++;
  }
});

if (fixedCount > 0) {
  console.log(`✅ Correction des problèmes de ajv terminée`);
} else {
  console.log(`ℹ️ Aucun fichier ajv n'a été modifié ou les fichiers n'existent pas encore`);
}

// Mise à jour des configurations pour Node.js v18
console.log('🔄 Mise à jour des configurations pour utiliser Node.js v18...');

// Créer le fichier .node-version
fs.writeFileSync('./.node-version', '18');
console.log('✅ Fichier .node-version mis à jour');

// Créer le fichier .nvmrc
fs.writeFileSync('./.nvmrc', '18');
console.log('✅ Fichier .nvmrc mis à jour');

console.log('✅ Script de correction terminé');
